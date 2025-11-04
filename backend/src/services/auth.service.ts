import { Prisma } from '@prisma/client';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/crypto-utils.js';
import { generateTokens, generateRandomToken, TokenPayload } from '../utils/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../config/email.js';
import { ApiError } from '../middleware/errorHandler.js';
import { RegisterInput, LoginInput } from '../validation/auth.validation';
import prisma from '../config/database.js';

// Extend the Prisma client with custom types
type PrismaClientType = typeof prisma;

export type UserWithRoles = Prisma.profilesGetPayload<{
  select: {
    user_id: true;
    email: true;
    password_hash: true;
    full_name: true;
    phone: true;
    avatar_url: true;
    is_active: true;
    email_verified: true;
    user_roles: {
      include: {
        roles: {
          include: {
            role_permissions: {
              include: {
                permissions: true;
              };
            };
          };
        };
        branches: true;
        gyms: true;
      };
    };
  };
}>;

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    roles: string[];
    permissions: string[];
  };
};

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
   * Login user with email and password
   * @param input Login credentials
   * @returns Authentication tokens and user data
   */
  async login(input: LoginInput): Promise<LoginResponse> {
    const { email, password } = input;
    
    console.log('\n🔐 [AUTH] Login attempt for email:', email);
    console.log('📡 [AUTH] Database connection:', process.env.DATABASE_URL ? '✅ Configured' : '❌ Not configured');

    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      console.log('\n🔍 [AUTH] Querying database for user...');

      // Find user by email with password and roles
      const user = await this.findUserByEmail(normalizedEmail);
      
      if (!user) {
        console.error('❌ [AUTH] No user found with email:', normalizedEmail);
        throw new ApiError('Invalid credentials', 401);
      }

      console.log('\n🔑 [AUTH] User found:', {
        userId: user.user_id,
        email: user.email,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        hasPasswordHash: !!user.password_hash
      });

      // Verify password
      await this.verifyUserPassword(user, password);

      // Check if account is active
      this.checkAccountStatus(user);

      // Generate tokens
      return user;
    } catch (error) {
      console.error('❌ [AUTH] Login error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Find user by email with roles and permissions
   */
  private async findUserByEmail(email: string): Promise<UserWithRoles | null> {
    if (!email || typeof email !== 'string') {
      console.error('❌ [AUTH] Invalid email provided:', email);
      throw new ApiError('Invalid email format', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      console.log('🔍 [AUTH] Querying database for email:', normalizedEmail);
      
      const user = await prisma.profiles.findUnique({
        where: { email: normalizedEmail },
        select: {
          user_id: true,
          email: true,
          password_hash: true,
          full_name: true,
          phone: true,
          avatar_url: true,
          is_active: true,
          email_verified: true,
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
          }
        }
      });

      if (!user) {
        console.log('❌ [AUTH] No user found with email:', normalizedEmail);
        return null;
      }

      console.log('✅ [AUTH] User found:', {
        userId: user.user_id,
        email: user.email,
        hasPasswordHash: !!user.password_hash,
        roles: user.user_roles?.map(ur => ur.roles?.name).filter(Boolean) || []
      });

      return user;
    } catch (error) {
      console.error('❌ [AUTH] Error finding user:', error);
      throw new ApiError('Error during authentication', 500);
    }
  }

  /**
   * Verify user password
   */
  private async verifyUserPassword(user: UserWithRoles, password: string): Promise<void> {
    if (!user.password_hash) {
      console.error('❌ [AUTH] No password hash found for user:', user.user_id);
      throw new ApiError('Invalid credentials', 401);
    }

    console.log('\n🔑 [AUTH] Starting password verification...');
    console.log('🔑 [AUTH] Input password length:', password.length);
    console.log('🔑 [AUTH] Stored hash length:', user.password_hash?.length);
    
    // Log hash components for debugging
    const hashParts = user.password_hash?.split(':');
    if (hashParts?.length === 5) {
      const [salt, iterations, keylen, digest] = hashParts;
      console.log('🔑 [AUTH] Hash components:', {
        salt: salt?.substring(0, 8) + '...',
        iterations,
        keylen,
        digest,
        hashPrefix: hashParts[4]?.substring(0, 8) + '...'
      });
    }

    const isValidPassword = verifyPassword(password, user.password_hash);
    console.log('🔑 [AUTH] Password verification result:', isValidPassword ? '✅ Valid' : '❌ Invalid');
    
    if (!isValidPassword) {
      console.error('❌ [AUTH] Invalid password for user:', user.user_id);
      throw new ApiError('Invalid credentials', 401);
    }
  }

  /**
   * Check if user account is active and verified
   */
  private checkAccountStatus(user: UserWithRoles): void {
    console.log('\n🔍 [AUTH] Checking account status...');
    
    if (!user.is_active) {
      console.error('❌ [AUTH] Account is inactive for user:', user.user_id);
      throw new ApiError('Account is inactive. Please contact support.', 403);
    }

    if (!user.email_verified) {
      console.warn('⚠️ [AUTH] Email not verified for user:', user.user_id);
      // Optionally resend verification email
      // await this.sendVerificationEmail(user.email);
      throw new ApiError('Please verify your email address before logging in.', 403);
    }
  }

  /**
   * Generate authentication response with tokens
   */
  private async generateAuthResponse(user: UserWithRoles): Promise<LoginResponse> {
    console.log('\n🔑 [AUTH] Generating authentication tokens...');
    
    // Extract roles and permissions
    const roles = user.user_roles.map(ur => ur.roles?.name).filter(Boolean) as string[];
    const permissions = user.user_roles.flatMap(ur => 
      ur.roles?.role_permissions?.map(rp => rp.permissions?.name).filter(Boolean) || []
    ) as string[];

    // Create token payload
    const tokenPayload: TokenPayload = {
      userId: user.user_id,
      user_id: user.user_id, // For backward compatibility
      email: user.email,
      roles,
      permissions,
      fullName: user.full_name || null,
      phone: user.phone || null,
      emailVerified: user.email_verified || false,
      // Add any additional claims here
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    console.log('✅ [AUTH] Authentication successful for user:', user.user_id);
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.user_id,
        email: user.email,
        fullName: user.full_name,
        roles,
        permissions
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
      where: { user_id: userId },
      include: {
        user_roles: {
          include: {
            branches: {
              select: { name: true, id: true }
            },
            gyms: {
              select: { name: true, id: true }
            },
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
          orderBy: {
            created_at: 'asc' // Get the primary role first
          }
        }
      }
    });

    if (!user) {
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
        user_roles: {
          include: {
            branches: {
              select: { name: true, id: true }
            },
            gyms: {
              select: { name: true, id: true }
            },
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
          orderBy: {
            created_at: 'asc' // Get the primary role first
          }
        }
      }
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Get primary role (first role assignment, or default to member)
    const primaryRole = user.user_roles?.[0] || { 
      role: 'member' as const, 
      branch_id: null, 
      gym_id: null,
      branches: null,
      gyms: null,
      roles: {
        name: 'member',
        display_name: 'Member',
        description: 'Basic member access',
        is_system: true,
        role_permissions: []
      }
    };

    return {
      id: user.user_id,
      email: user.email,
      name: user.full_name,
      role: primaryRole.role,
      phone: user.phone,
      avatar: user.avatar_url,
      branchId: primaryRole.branch_id,
      branchName: primaryRole.branches?.name,
      gymId: primaryRole.gym_id,
      gymName: primaryRole.gyms?.name || user.owned_gyms?.[0]?.name,
      emailVerified: user.email_verified,
      isActive: user.is_active
    };
  }
}

export const authService = new AuthService();
