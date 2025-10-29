import prisma from '../config/database';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/crypto-utils';
import { generateTokens, generateRandomToken, TokenPayload } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../config/email';
import { ApiError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../validation/auth.validation';

export class AuthService {
  /**
   * Register new user
   */
  async register(input: RegisterInput) {
    const { email, password, fullName, phone, role = 'member', branchId } = input;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new ApiError(passwordValidation.errors.join(', '), 400);
    }

    // Check if user already exists
    const existingUser = await prisma.profiles.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      throw new ApiError('User with this email already exists', 400);
    }

    // Hash password using crypto
    const passwordHash = hashPassword(password);

    // Create user profile (without role - role goes in user_roles table)
    const userId = crypto.randomUUID();
    const user = await prisma.profiles.create({
      data: {
        user_id: userId,
        email: normalizedEmail,
        password_hash: passwordHash,
        full_name: fullName,
        phone,
        is_active: false, // Require email verification
        email_verified: false
      }
    });

    // Create user role entry (RBAC)
    await prisma.user_roles.create({
      data: {
        user_id: userId,
        role: role as any, // 'member', 'admin', etc.
        branch_id: branchId,
        gym_id: null, // Will be set later when user joins a gym
      }
    });

    // Generate verification token
    const verificationToken = generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Store verification token (we'll need to create this table)
    await prisma.$executeRaw`
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES (${user.user_id}::uuid, ${verificationToken}, ${expiresAt})
      ON CONFLICT (user_id) 
      DO UPDATE SET token = ${verificationToken}, expires_at = ${expiresAt}, created_at = NOW()
    `;

    // Send verification email
    try {
      await sendVerificationEmail(normalizedEmail, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.user_id,
      email: user.email
    };
  }

  /**
   * Login user
   */
  async login(input: LoginInput) {
    const { email, password } = input;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Find user with roles (RBAC structure)
    const user = await prisma.profiles.findUnique({
      where: { email: normalizedEmail },
      include: {
        user_roles: {
          include: {
            branches: { select: { name: true, id: true } },
            gyms: { select: { name: true, id: true } }
          }
        },
        owned_gyms: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    if (!user || !user.password_hash) {
      throw new ApiError('Invalid email or password', 401);
    }

    // Verify password using crypto
    const isValidPassword = verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new ApiError('Invalid email or password', 401);
    }

    // Check if account is active
    if (!user.is_active) {
      throw new ApiError('Account is inactive. Please verify your email.', 401);
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.user_id,
      email: user.email,
      role: user.role || 'member',
      branchId: user.branch_id,
      gymId: user.gym_id
    };

    const tokens = generateTokens(payload);

    return {
      ...tokens,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar_url,
        branchId: user.branch_id,
        branchName: user.branches?.name,
        gymId: user.gym_id,
        gymName: user.gyms?.name,
        emailVerified: user.email_verified
      }
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    // Find token
    const result = await prisma.$queryRaw<Array<{ user_id: string; expires_at: Date }>>`
      SELECT user_id, expires_at 
      FROM email_verification_tokens 
      WHERE token = ${token}
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      throw new ApiError('Invalid verification token', 400);
    }

    const { user_id, expires_at } = result[0];

    // Check if expired
    if (new Date() > new Date(expires_at)) {
      throw new ApiError('Verification token has expired', 400);
    }

    // Activate user
    const user = await prisma.profiles.update({
      where: { user_id },
      data: {
        is_active: true,
        email_verified: true
      }
    });

    // Delete used token
    await prisma.$executeRaw`
      DELETE FROM email_verification_tokens WHERE token = ${token}
    `;

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.full_name || 'User');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return {
      message: 'Email verified successfully. Your account is now active.',
      email: user.email
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find user
    const user = await prisma.profiles.findUnique({
      where: { email: normalizedEmail }
    });

    // Don't reveal if user exists
    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.'
      };
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store reset token
    await prisma.$executeRaw`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.user_id}::uuid, ${resetToken}, ${expiresAt})
      ON CONFLICT (user_id) 
      DO UPDATE SET token = ${resetToken}, expires_at = ${expiresAt}, created_at = NOW()
    `;

    // Send reset email
    try {
      await sendPasswordResetEmail(normalizedEmail, resetToken);
    } catch (error) {
      console.error('Failed to send reset email:', error);
    }

    return {
      message: 'If an account with that email exists, a password reset link has been sent.'
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new ApiError(passwordValidation.errors.join(', '), 400);
    }

    // Find token
    const result = await prisma.$queryRaw<Array<{ user_id: string; expires_at: Date }>>`
      SELECT user_id, expires_at 
      FROM password_reset_tokens 
      WHERE token = ${token}
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      throw new ApiError('Invalid reset token', 400);
    }

    const { user_id, expires_at } = result[0];

    // Check if expired
    if (new Date() > new Date(expires_at)) {
      throw new ApiError('Reset token has expired', 400);
    }

    // Hash new password using crypto
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.profiles.update({
      where: { user_id },
      data: { password_hash: newPasswordHash }
    });

    // Delete used token
    await prisma.$executeRaw`
      DELETE FROM password_reset_tokens WHERE token = ${token}
    `;

    return {
      message: 'Password reset successfully. You can now login with your new password.'
    };
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Find user
    const user = await prisma.profiles.findUnique({
      where: { user_id: userId }
    });

    if (!user || !user.password_hash) {
      throw new ApiError('User not found', 404);
    }

    // Verify current password using crypto
    const isValidPassword = verifyPassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new ApiError('Current password is incorrect', 401);
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new ApiError(passwordValidation.errors.join(', '), 400);
    }

    // Hash new password using crypto
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.profiles.update({
      where: { user_id: userId },
      data: { password_hash: newPasswordHash }
    });

    return {
      message: 'Password changed successfully'
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.profiles.findUnique({
      where: { user_id: userId },
      include: {
        branches: true,
        gyms: true
      }
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    return {
      id: user.user_id,
      email: user.email,
      name: user.full_name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar_url,
      branchId: user.branch_id,
      branchName: user.branches?.name,
      gymId: user.gym_id,
      gymName: user.gyms?.name,
      emailVerified: user.email_verified,
      isActive: user.is_active
    };
  }
}

export const authService = new AuthService();
