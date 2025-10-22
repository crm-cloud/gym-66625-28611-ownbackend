import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './database.js';

/**
 * Passport configuration for OAuth strategies
 */

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/oauth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await prisma.user.findFirst({
            where: {
              oauth_provider: 'google',
              oauth_provider_id: profile.id,
            },
          });

          if (!user) {
            // Check if user exists with this email
            const email = profile.emails?.[0]?.value;
            
            if (!email) {
              return done(new Error('No email provided by Google'), undefined);
            }

            user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              // Link Google account to existing user
              user = await prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                  oauth_provider: 'google',
                  oauth_provider_id: profile.id,
                  avatar_url: profile.photos?.[0]?.value || user.avatar_url,
                },
              });
            } else {
              // Create new user
              user = await prisma.user.create({
                data: {
                  email,
                  full_name: profile.displayName || email.split('@')[0],
                  avatar_url: profile.photos?.[0]?.value,
                  oauth_provider: 'google',
                  oauth_provider_id: profile.id,
                  role: 'member', // Default role
                  is_active: true,
                },
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.user_id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
