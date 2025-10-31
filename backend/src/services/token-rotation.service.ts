import prisma from '../config/database.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, type TokenPayload } from '../utils/jwt.js';

/**
 * Token Rotation Service
 * Implements refresh token rotation for enhanced security
 */

export class TokenRotationService {
  /**
   * Refresh access token with token rotation
   * Old refresh token is invalidated and new one is issued
   */
  async rotateTokens(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify old refresh token
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if refresh token exists and is not revoked
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: oldRefreshToken,
        is_revoked: false,
      },
      include: {
        user: {
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
              orderBy: {
                created_at: 'asc' // Get the primary role first
              }
            }
          }
        },
      },
    });

    if (!storedToken) {
      // Token might have been used before (possible replay attack)
      // Revoke all tokens for this user as a security measure
      await this.revokeAllUserTokens(payload.userId);
      throw new Error('Refresh token has been revoked. Please login again.');
    }

    // Check if token is expired
    if (storedToken.expires_at < new Date()) {
      await this.revokeToken(oldRefreshToken);
      throw new Error('Refresh token has expired');
    }

    // Revoke old refresh token
    await this.revokeToken(oldRefreshToken);

    // Get primary role (first role assignment, or default to member)
    const primaryRole = storedToken.user.user_roles?.[0] || { 
      role: 'member' as const, 
      branch_id: null, 
      gym_id: null,
      roles: {
        role_permissions: []
      }
    };

    // Collect all permissions from all roles
    const permissions = new Set<string>();
    storedToken.user.user_roles?.forEach(ur => {
      ur.roles?.role_permissions?.forEach(rp => {
        if (rp.permissions) {
          permissions.add(rp.permissions.name);
        }
      });
    });

    // Generate new tokens
    const tokenPayload = {
      userId: storedToken.user.user_id,
      email: storedToken.user.email,
      role: primaryRole.role,
      branchId: primaryRole.branch_id || undefined,
      gymId: primaryRole.gym_id || undefined,
      permissions: Array.from(permissions)
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        user_id: storedToken.user.user_id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        parent_token: oldRefreshToken, // Track token family
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoke a specific refresh token
   */
  async revokeToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { 
        is_revoked: true,
        revoked_at: new Date(),
      },
    });
  }

  /**
   * Revoke all tokens for a user (used in logout or security breach)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { 
        user_id: userId,
        is_revoked: false,
      },
      data: { 
        is_revoked: true,
        revoked_at: new Date(),
      },
    });
  }

  /**
   * Clean up expired tokens (run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expires_at: { lt: new Date() } },
          { 
            is_revoked: true,
            revoked_at: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days ago
          },
        ],
      },
    });

    return result.count;
  }

  /**
   * Get active sessions for user
   */
  async getUserSessions(userId: string) {
    return prisma.refreshToken.findMany({
      where: {
        user_id: userId,
        is_revoked: false,
        expires_at: { gt: new Date() },
      },
      select: {
        token: false, // Don't send actual token
        created_at: true,
        expires_at: true,
        ip_address: true,
        user_agent: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}

export const tokenRotationService = new TokenRotationService();
