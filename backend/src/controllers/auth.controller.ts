import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ApiError } from '../middleware/errorHandler';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await prisma.profiles.findUnique({
        where: { email: validatedData.email }
      });

      if (existingUser) {
        throw new ApiError('Email already registered', 400);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const user = await prisma.profiles.create({
        data: {
          email: validatedData.email,
          full_name: validatedData.full_name,
          phone: validatedData.phone,
          password_hash: passwordHash,
          email_verified: false,
          is_active: true,
        }
      });

      // Assign default 'member' role
      await prisma.user_roles.create({
        data: {
          user_id: user.user_id,
          role: 'member',
        }
      });

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.user_id,
        email: user.email,
        role: 'member',
      });

      const refreshToken = generateRefreshToken({
        userId: user.user_id,
        email: user.email,
        role: 'member',
      });

      res.status(201).json({
        message: 'Registration successful',
        user: {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = await prisma.profiles.findUnique({
        where: { email: validatedData.email },
        include: {
          user_roles: true,
        }
      });

      if (!user) {
        throw new ApiError('Invalid credentials', 401);
      }

      if (!user.is_active) {
        throw new ApiError('Account is inactive', 403);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password_hash);
      
      if (!isValidPassword) {
        throw new ApiError('Invalid credentials', 401);
      }

      // Get primary role
      const primaryRole = user.user_roles[0];

      // Generate tokens
      const tokenPayload = {
        userId: user.user_id,
        email: user.email,
        role: primaryRole?.role,
        teamRole: primaryRole?.team_role || undefined,
        branchId: primaryRole?.branch_id || undefined,
        gymId: primaryRole?.gym_id || undefined,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.json({
        message: 'Login successful',
        user: {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          role: primaryRole?.role,
          team_role: primaryRole?.team_role,
          branch_id: primaryRole?.branch_id,
          gym_id: primaryRole?.gym_id,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        throw new ApiError('Refresh token required', 400);
      }

      const payload = verifyRefreshToken(refresh_token);
      const accessToken = generateAccessToken(payload);

      res.json({ access_token: accessToken });
    } catch (error) {
      next(new ApiError('Invalid refresh token', 401));
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Not authenticated', 401);
      }

      const user = await prisma.profiles.findUnique({
        where: { user_id: req.user.userId },
        include: {
          user_roles: {
            include: {
              branch: true,
              gym: true,
            }
          },
        },
        select: {
          user_id: true,
          email: true,
          full_name: true,
          phone: true,
          date_of_birth: true,
          gender: true,
          avatar_url: true,
          email_verified: true,
          is_active: true,
          user_roles: true,
        }
      });

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError('Email required', 400);
      }

      const user = await prisma.profiles.findUnique({
        where: { email }
      });

      // Always return success even if user not found (security)
      res.json({
        message: 'If the email exists, a reset link has been sent'
      });

      // TODO: Implement email sending logic
      if (user) {
        console.log('Password reset requested for:', email);
        // Generate reset token and send email
      }
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      
      // TODO: Verify reset token
      // For now, just return success
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError('Verification token required', 400);
      }

      // TODO: Implement email verification logic
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Not authenticated', 401);
      }

      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        throw new ApiError('Current and new password required', 400);
      }

      const user = await prisma.profiles.findUnique({
        where: { user_id: req.user.userId }
      });

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      // Verify current password
      const isValid = await bcrypt.compare(current_password, user.password_hash);
      
      if (!isValid) {
        throw new ApiError('Current password is incorrect', 400);
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(new_password, 10);

      // Update password
      await prisma.profiles.update({
        where: { user_id: req.user.userId },
        data: { password_hash: newPasswordHash }
      });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Token invalidation would go here (e.g., blacklist)
      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
