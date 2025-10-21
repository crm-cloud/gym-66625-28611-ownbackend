import { Router } from 'express';
import passport from '../config/passport';
import { oauthController } from '../controllers/oauth.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    session: false,
    scope: ['profile', 'email'] 
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/api/v1/oauth/failure' 
  }),
  oauthController.googleCallback
);

// OAuth failure route
router.get('/failure', oauthController.oauthFailure);

// Account linking (requires authentication)
router.post('/link', authenticate, oauthController.linkAccount);
router.post('/unlink', authenticate, oauthController.unlinkAccount);

export default router;
