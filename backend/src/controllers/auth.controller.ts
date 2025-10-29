import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ApiError } from '../middleware/errorHandler';
import { hashPassword, verifyPassword, updatePasswordHash } from '../utils/crypto-utils';

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

      // Hash password using crypto
      const passwordHash = hashPassword(validatedData.password);

      // Create user profile
      const userId = crypto.randomUUID();
      const user = await prisma.profiles.create({
        data: {
          user_id: userId,
          email: validatedData.email,
          full_name: validatedData.full_name,
          phone: validatedData.phone,
          password_hash: passwordHash,
          email_verified: false,
          is_active: true,
        }
      });

      // Create default member role for new registrations
      await prisma.user_roles.create({
        data: {
          user_id: userId,
          role: 'member' as any,
        }
      });

      // Assign default 'member' role
      await prisma.user_roles.create({
        data: {
          id: crypto.randomUUID(),
          user_id: user.user_id,
          role: 'member',
          created_at: new Date(),
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

      // Find user with roles
      const user = await prisma.profiles.findUnique({
        where: { email: validatedData.email },
        include: {
          user_roles: {
            include: {
              branches: { select: { name: true, id: true } },
              gyms: { select: { name: true, id: true } },
            }
          },
          owned_gyms: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      });

      if (!user || !user.password_hash) {
        throw new ApiError('Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = verifyPassword(validatedData.password, user.password_hash);
      
      if (!isValidPassword) {
        throw new ApiError('Invalid credentials', 401);
      }

      if (!user.is_active) {
        throw new ApiError('Account is inactive. Please verify your email.', 403);
      }

      // Get primary role from user_roles
      const primaryRole = user.user_roles[0];
      
      if (!primaryRole) {
        throw new ApiError('User has no assigned role. Please contact support.', 403);
      }

      const userRole = primaryRole.role;

      // For admins, use their owned gym if they have one
      let gymId = primaryRole.gym_id;
      let gymName = primaryRole.gyms?.name;
      
      if (userRole === 'admin' && user.owned_gyms.length > 0) {
        gymId = user.owned_gyms[0].id;
        gymName = user.owned_gyms[0].name;
      }

      // Generate tokens with correct role from user_roles
      const tokenPayload = {
        userId: user.user_id,
        email: user.email,
        role: userRole,
        teamRole: primaryRole.team_role || undefined,
        branchId: primaryRole.branch_id || undefined,
        gymId: gymId || undefined,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.json({
        message: 'Login successful',
        user: {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          role: userRole,
          team_role: primaryRole.team_role,
          branch_id: primaryRole.branch_id,
          branch_name: primaryRole.branches?.name,
          gym_id: gymId,
          gym_name: gymName,
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
              branches: { select: { name: true, id: true } },
              gyms: { select: { name: true, id: true } },
            }
          },
          owned_gyms: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        },
      });

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      const primaryRole = user.user_roles[0];

      if (!primaryRole) {
        throw new ApiError('User has no assigned role', 403);
      }

      // For admins, use their owned gym if they have one
      let gymId = primaryRole.gym_id;
      let gymName = primaryRole.gyms?.name;
      
      if (primaryRole.role === 'admin' && user.owned_gyms.length > 0) {
        gymId = user.owned_gyms[0].id;
        gymName = user.owned_gyms[0].name;
      }

      res.json({
        id: user.user_id,
        user_id: user.user_id,
        email: user.email,
        name: user.full_name,
        full_name: user.full_name,
        phone: user.phone,
        role: primaryRole.role,
        team_role: primaryRole.team_role,
        avatar: user.avatar_url,
        avatar_url: user.avatar_url,
        branch_id: primaryRole.branch_id,
        branch_name: primaryRole.branches?.name,
        branchId: primaryRole.branch_id,
        branchName: primaryRole.branches?.name,
        gym_id: gymId,
        gym_name: gymName,
        gymId: gymId,
        gymName: gymName,
        email_verified: user.email_verified,
        is_active: user.is_active,
        created_at: user.created_at,
      });
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
      const { token, password } = req.body;

      if (!token) {
        throw new ApiError('Reset token is required', 400);
      }

      if (!password) {
        throw new ApiError('New password is required', 400);
      }

      // TODO: Implement proper token verification logic
      // For now, we'll assume the token is the user's email
      // In a real app, this would verify a JWT or database-stored token
      const email = token;
      
      const user = await prisma.profiles.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal that the email doesn't exist
        return res.json({ message: 'If the email exists, a password reset link has been sent' });
      }

      // Hash the new password using crypto
      const newPasswordHash = hashPassword(password);

      // Update the user's password
      await prisma.profiles.update({
        where: { user_id: user.user_id },
        data: { 
          password_hash: newPasswordHash,
          // Invalidate any existing sessions/tokens if needed
          updated_at: new Date()
        }
      });

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
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new ApiError('Current and new password are required', 400);
      }

      const user = await prisma.profiles.findUnique({
        where: { user_id: req.user.userId }
      });

      if (!user || !user.password_hash) {
        throw new ApiError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = verifyPassword(currentPassword, user.password_hash);
      
      if (!isValidPassword) {
        throw new ApiError('Current password is incorrect', 400);
      }

      // Hash new password using crypto
      const newPasswordHash = hashPassword(newPassword);

      // Update password
      await prisma.profiles.update({
        where: { user_id: req.user.userId },
        data: { password_hash: newPasswordHash }
      });

      res.json({ message: 'Password updated successfully' });
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
