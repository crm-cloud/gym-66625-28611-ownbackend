import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, type TokenPayload } from '../utils/jwt.js';
import { AuthUser } from '../types/user.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const prisma = new PrismaClient();

class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ApiError('Email and password are required', 400);
      }

      console.log('\n🔑 [AUTH] Login attempt for email:', email);

      // Find user by email with their roles and permissions
      const user = await prisma.profiles.findFirst({
        where: { email: email.toLowerCase() },
        include: {
          user_roles: {
            include: {
              roles: {
                include: {
                  role_permissions: {
                    include: {
                      permissions: true
                    }
                  }
                }
              },
              branches: true,
              gyms: true
            }
          },
          owned_gyms: true
        }
      });

      if (!user) {
        console.error('❌ [AUTH] User not found for email:', email);
        throw new ApiError('Invalid credentials', 401);
      }

      console.log('🔍 [AUTH] Found user:', {
        id: user.user_id,
        email: user.email,
        is_active: user.is_active,
        email_verified: user.email_verified,
        has_password: !!user.password_hash
      });

      // Check if account is active
      if (!user.is_active) {
        console.error('❌ [AUTH] Account is inactive for user:', user.user_id);
        throw new ApiError('Account is inactive. Please contact support.', 403);
      }

      // Check if email is verified if required
      if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.email_verified) {
        console.error('❌ [AUTH] Email not verified for user:', user.user_id);
        throw new ApiError('Please verify your email before logging in', 403);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');
      if (!isPasswordValid) {
        console.error('❌ [AUTH] Invalid password for user:', user.user_id);
        throw new ApiError('Invalid credentials', 401);
      }

      // Get primary role from user_roles
      const primaryRole = user.user_roles?.[0];
      
      if (!primaryRole) {
        console.error('❌ [AUTH] No roles assigned to user:', user.user_id);
        throw new ApiError('User has no assigned role. Please contact support.', 403);
      }

      const userRole = primaryRole.roles?.name || 'member';
      const branchId = primaryRole.branch_id || null;
      const gymId = primaryRole.gym_id || null;

      // For admins, use their owned gym if they have one
      let userGymId = gymId;
      let gymName = primaryRole.gyms?.name;
      
      if (userRole === 'admin' && user.owned_gyms?.length > 0) {
        userGymId = user.owned_gyms[0].id;
        gymName = user.owned_gyms[0].name;
      }

      // Get all permissions from all roles
      const allPermissions = new Set<string>();
      user.user_roles?.forEach(ur => {
        ur.roles?.role_permissions?.forEach(rp => {
          if (rp.permissions?.name) {
            allPermissions.add(rp.permissions.name);
          }
        });
      });

      // Generate tokens with user information
      const tokenPayload = {
        userId: user.user_id,
        user_id: user.user_id, // For backward compatibility
        email: user.email,
        role: userRole,
        branchId: branchId,
        gymId: userGymId,
        fullName: user.full_name || '',
        phone: user.phone || null,
        avatarUrl: user.avatar_url || null,
        emailVerified: user.email_verified || false,
        permissions: Array.from(allPermissions)
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      console.log('✅ [AUTH] Tokens generated for user:', user.user_id);

      // Update last login timestamp
      try {
        await prisma.profiles.update({
          where: { user_id: user.user_id },
          data: { 
            updated_at: new Date() // Using updated_at as last_login
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(' [AUTH] Could not update user timestamp:', errorMessage);
        // Continue even if we can't update the timestamp
      }

      // Prepare user data for response
      const userData = {
        id: user.user_id,
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name || '',
        name: user.full_name || '',
        role: userRole,
        roles: [userRole],
        is_active: user.is_active,
        email_verified: user.email_verified,
        phone: user.phone || null,
        phone_number: user.phone || null,
        avatar_url: user.avatar_url || null,
        avatar: user.avatar_url || null,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
        branch_id: branchId,
        gym_id: userGymId,
        gym_name: gymName,
        permissions: Array.from(allPermissions)
      };

      // Prepare response data
      const responseData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: userData,
        expires_in: process.env.JWT_ACCESS_EXPIRATION_MINUTES || '15',
        token_type: 'bearer'
      };

      // Log successful login
      console.log('✅ [AUTH] Login successful for user:', {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        roles: userData.roles,
        is_active: userData.is_active,
        email_verified: userData.email_verified
      });

      // Return the response
      return res.json(responseData);
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

      console.log('🔄 [AUTH] Token refresh requested');

      // Verify refresh token (stateless - no DB lookup)
      let payload: TokenPayload;
      try {
        payload = verifyRefreshToken(refresh_token);
      } catch (error) {
        console.error('❌ [AUTH] Invalid refresh token:', error);
        throw new ApiError('Invalid or expired refresh token', 401);
      }

      // Fetch fresh user data to ensure account is still active
      const user = await prisma.profiles.findUnique({
        where: { user_id: payload.userId },
        include: {
          user_roles: {
            include: {
              roles: {
                include: {
                  role_permissions: {
                    include: {
                      permissions: true
                    }
                  }
                }
              }
            },
            orderBy: { created_at: 'asc' }
          }
        }
      });

      if (!user || !user.is_active) {
        throw new ApiError('User account not found or inactive', 401);
      }

      // Get primary role and permissions
      const primaryRole = user.user_roles?.[0]?.role || 'member';
      const allPermissions = new Set<string>();
      user.user_roles?.forEach(ur => {
        ur.roles?.role_permissions?.forEach(rp => {
          if (rp.permissions?.name) {
            allPermissions.add(rp.permissions.name);
          }
        });
      });

      // Generate new tokens with fresh data
      const tokenPayload = {
        userId: user.user_id,
        user_id: user.user_id,
        email: user.email,
        role: primaryRole,
        branchId: user.user_roles?.[0]?.branch_id || undefined,
        gymId: user.user_roles?.[0]?.gym_id || undefined,
        permissions: Array.from(allPermissions)
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      console.log('✅ [AUTH] Token refresh successful');

      res.json({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'bearer',
        expires_in: process.env.JWT_ACCESS_EXPIRATION_MINUTES || '15'
      });
    } catch (error) {
      console.error('❌ [AUTH] Token refresh failed:', error);
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, full_name, phone } = req.body;

      if (!email || !password || !full_name) {
        throw new ApiError('Email, password, and full name are required', 400);
      }

      // Check if user already exists
      const existingUser = await prisma.profiles.findFirst({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        throw new ApiError('Email already in use', 400);
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user with required fields
      const newUser = await prisma.profiles.create({
        data: {
          user_id: crypto.randomUUID(), // Generate a new UUID for user_id
          email: email.toLowerCase(),
          password_hash: hashedPassword,
          full_name,
          phone: phone || null,
          is_active: true,
          email_verified: false, // Set to false, require email verification
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Assign default role (e.g., 'member')
      const memberRole = await prisma.roles.findFirst({
        where: { name: 'member' }
      });

      if (memberRole) {
        await prisma.user_roles.create({
          data: {
            id: crypto.randomUUID(),
            user_id: newUser.user_id,
            role_id: memberRole.id,
            created_at: new Date(),
            role: {
              connect: { id: memberRole.id }
            },
            user: {
              connect: { user_id: newUser.user_id }
            }
          }
        });
      }

      // Generate tokens with complete user information
      const tokenPayload: AuthUser = {
        userId: newUser.user_id,
        user_id: newUser.user_id,
        email: newUser.email,
        role: 'member',
        emailVerified: false,
        fullName: newUser.full_name || '',
        phone: newUser.phone || null,
        avatarUrl: newUser.avatar_url || null,
        permissions: []
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Store refresh token in database
      try {
        await tokenRotationService.storeRefreshToken(
          refreshToken,
          newUser.user_id,
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown'
        );
      } catch (error) {
        console.error('❌ [AUTH] Failed to store refresh token:', error);
        throw new ApiError('Failed to complete registration', 500);
      }

      // TODO: Send verification email

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: newUser.user_id,
          email: newUser.email,
          full_name: newUser.full_name,
          email_verified: false
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: process.env.JWT_ACCESS_EXPIRATION_MINUTES || '15'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }
      
      const user = await prisma.profiles.findUnique({
        where: { user_id: req.user.userId },
        select: {
          user_id: true,
          email: true,
          full_name: true,
          phone: true,
          avatar_url: true,
          is_active: true,
          email_verified: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.json({
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // With stateless JWTs, tokens cannot be revoked server-side
      // Tokens will expire naturally based on their expiration time
      console.log('✅ [AUTH] Logout successful (client-side only)');
      
      res.json({ 
        message: 'Logout successful',
        note: 'Please clear tokens from client storage'
      });
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }
      
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      if (!currentPassword || !newPassword) {
        throw new ApiError('Current password and new password are required', 400);
      }

      const user = await prisma.profiles.findUnique({
        where: { user_id: userId }
      });

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash || '');
      if (!isPasswordValid) {
        throw new ApiError('Current password is incorrect', 400);
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await prisma.profiles.update({
        where: { user_id: userId },
        data: { password_hash: hashedPassword }
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError('Email is required', 400);
      }

      const user = await prisma.profiles.findFirst({
        where: { email: email.toLowerCase() }
      });

      if (user) {
        // In a real app, you would generate a reset token and send an email
        // For now, we'll just log it
        console.log(`Password reset requested for ${email}`);
      }

      // Always return success to prevent email enumeration
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new ApiError('Token and new password are required', 400);
      }

      // In a real app, you would verify the token and update the password
      // For now, we'll just log it
      console.log(`Password reset with token: ${token}`);

      res.json({
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError('Verification token is required', 400);
      }

      // In a real app, you would verify the token and mark the email as verified
      // For now, we'll just log it
      console.log(`Email verification with token: ${token}`);

      res.json({
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
