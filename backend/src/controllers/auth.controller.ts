import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { 
  registerSchema, 
  loginSchema, 
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema
} from '../validation/auth.validation';
import { verifyRefreshToken, generateTokens } from '../utils/jwt';
import { asyncHandler } from '../middleware/errorHandler';

export const authController = {
  /**
   * POST /api/auth/register
   */
  register: asyncHandler(async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);
    
    res.status(201).json(result);
  }),

  /**
   * POST /api/auth/login
   */
  login: asyncHandler(async (req: Request, res: Response) => {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);
    
    res.status(200).json(result);
  }),

  /**
   * POST /api/auth/refresh
   */
  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    // Generate new tokens
    const tokens = generateTokens(payload);
    
    res.status(200).json(tokens);
  }),

  /**
   * POST /api/auth/verify-email
   */
  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = verifyEmailSchema.parse(req.body);
    const result = await authService.verifyEmail(token);
    
    res.status(200).json(result);
  }),

  /**
   * POST /api/auth/request-password-reset
   */
  requestPasswordReset: asyncHandler(async (req: Request, res: Response) => {
    const { email } = requestPasswordResetSchema.parse(req.body);
    const result = await authService.requestPasswordReset(email);
    
    res.status(200).json(result);
  }),

  /**
   * POST /api/auth/reset-password
   */
  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(token, newPassword);
    
    res.status(200).json(result);
  }),

  /**
   * POST /api/auth/change-password
   */
  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user!.userId;
    
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    
    res.status(200).json(result);
  }),

  /**
   * GET /api/auth/me
   */
  getCurrentUser: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await authService.getCurrentUser(userId);
    
    res.status(200).json(user);
  }),

  /**
   * POST /api/auth/logout
   */
  logout: asyncHandler(async (req: Request, res: Response) => {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // For additional security, you could implement a token blacklist here
    res.status(200).json({ message: 'Logged out successfully' });
  })
};
