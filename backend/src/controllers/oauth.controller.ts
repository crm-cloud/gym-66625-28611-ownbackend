import { Request, Response, NextFunction } from 'express';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler';

/**
 * OAuth Controller
 * Handles OAuth2.0 social login callbacks
 */

class OAuthController {
  /**
   * Google OAuth callback
   */
  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('OAuth authentication failed', 401);
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: (req.user as any).user_id,
        email: (req.user as any).email,
        role: (req.user as any).role,
      });

      const refreshToken = generateRefreshToken({
        userId: (req.user as any).user_id,
        email: (req.user as any).email,
        role: (req.user as any).role,
      });

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          user_id: (req.user as any).user_id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(
        `${frontendUrl}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * OAuth failure handler
   */
  async oauthFailure(req: Request, res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }

  /**
   * Link OAuth account to existing user
   */
  async linkAccount(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Not authenticated', 401);
      }

      const { provider, providerId } = req.body;

      if (!provider || !providerId) {
        throw new ApiError('Provider and provider ID are required', 400);
      }

      // Check if OAuth account is already linked to another user
      const existingLink = await prisma.user.findFirst({
        where: {
          oauth_provider: provider,
          oauth_provider_id: providerId,
          user_id: { not: req.user.userId },
        },
      });

      if (existingLink) {
        throw new ApiError('This account is already linked to another user', 400);
      }

      // Link OAuth account
      await prisma.user.update({
        where: { user_id: req.user.userId },
        data: {
          oauth_provider: provider,
          oauth_provider_id: providerId,
        },
      });

      res.json({
        success: true,
        data: { message: 'Account linked successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unlink OAuth account
   */
  async unlinkAccount(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { user_id: req.user.userId },
        select: { password_hash: true, oauth_provider: true },
      });

      // Don't allow unlinking if user has no password set
      if (!user?.password_hash && user?.oauth_provider) {
        throw new ApiError(
          'Cannot unlink OAuth account. Please set a password first.',
          400
        );
      }

      await prisma.user.update({
        where: { user_id: req.user.userId },
        data: {
          oauth_provider: null,
          oauth_provider_id: null,
        },
      });

      res.json({
        success: true,
        data: { message: 'Account unlinked successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const oauthController = new OAuthController();
