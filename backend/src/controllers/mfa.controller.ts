import { Request, Response, NextFunction } from 'express';
import { mfaService } from '../services/mfa.service';
import { ApiError } from '../middleware/errorHandler';

/**
 * MFA Controller
 * Handles multi-factor authentication operations
 */

class MFAController {
  /**
   * Setup MFA - Generate secret and QR code
   */
  async setup(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Not authenticated', 401);
      }

      const { secret, qrCode } = await mfaService.generateSecret(
        req.user.userId,
        req.user.email
      );

      res.json({
        success: true,
        data: {
          secret,
          qrCode,
          message: 'Scan this QR code with your authenticator app',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable MFA - Verify token and activate MFA
   */
  async enable(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Not authenticated', 401);
      }

      const { token } = req.body;

      if (!token) {
        throw new ApiError('Token is required', 400);
      }

      const verified = await mfaService.verifyAndEnable(req.user.userId, token);

      if (!verified) {
        throw new ApiError('Invalid token', 400);
      }

      // Generate backup codes
      const backupCodes = await mfaService.generateBackupCodes(req.user.userId);

      res.json({
        success: true,
        data: {
          message: 'MFA enabled successfully',
          backupCodes,
          warning: 'Save these backup codes in a safe place. You can use them to access your account if you lose your device.',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify MFA token during login
   */
  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, token } = req.body;

      if (!userId || !token) {
        throw new ApiError('User ID and token are required', 400);
      }

      const verified = await mfaService.verify(userId, token);

      if (!verified) {
        throw new ApiError('Invalid token', 400);
      }

      res.json({
        success: true,
        data: { verified: true },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Disable MFA
   */
  async disable(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Not authenticated', 401);
      }

      const { token } = req.body;

      if (!token) {
        throw new ApiError('Token is required to disable MFA', 400);
      }

      const disabled = await mfaService.disable(req.user.userId, token);

      if (!disabled) {
        throw new ApiError('Invalid token', 400);
      }

      res.json({
        success: true,
        data: { message: 'MFA disabled successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, code } = req.body;

      if (!userId || !code) {
        throw new ApiError('User ID and backup code are required', 400);
      }

      const verified = await mfaService.verifyBackupCode(userId, code);

      if (!verified) {
        throw new ApiError('Invalid backup code', 400);
      }

      res.json({
        success: true,
        data: { verified: true },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Not authenticated', 401);
      }

      const backupCodes = await mfaService.generateBackupCodes(req.user.userId);

      res.json({
        success: true,
        data: {
          backupCodes,
          message: 'New backup codes generated. Previous codes are now invalid.',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get MFA status
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Not authenticated', 401);
      }

      const enabled = await mfaService.isMFAEnabled(req.user.userId);

      res.json({
        success: true,
        data: { enabled },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const mfaController = new MFAController();
