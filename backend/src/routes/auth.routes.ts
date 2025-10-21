import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Import rate limiters
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';

// Public routes (no authentication required)
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh); // No rate limit on refresh
router.post('/verify-email', authController.verifyEmail);
router.post('/request-password-reset', passwordResetLimiter, authController.requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

// Protected routes (authentication required)
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

export default router;
