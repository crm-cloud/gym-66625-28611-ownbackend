import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from './errorHandler.js';
import prisma from '../config/database.js';

// Define user type for authentication
export interface AuthUser {
  userId: string;
  user_id: string; // For backward compatibility
  email: string;
  role: string;
  branchId?: string | null;
  gymId?: string | null;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  permissions?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Authentication middleware - Verify JWT token
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    console.log('[AUTH] 🔐 Authentication attempt', { 
      url: req.url, 
      method: req.method,
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
      allHeaders: Object.keys(req.headers)
    });

    if (!authHeader) {
      console.error('[AUTH] ❌ No authorization header provided');
      throw new ApiError('No authorization header provided', 401);
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.error('[AUTH] ❌ Invalid authorization header format');
      throw new ApiError('Invalid authorization header format', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('[AUTH] 🎫 Token extracted', { tokenLength: token.length, tokenPreview: token.substring(0, 20) + '...' });

    if (!token) {
      console.error('[AUTH] ❌ No token provided');
      throw new ApiError('No token provided', 401);
    }

    // Verify token
    console.log('[AUTH] 🔍 Attempting to verify JWT...');
    const payload = verifyAccessToken(token);
    console.log('[AUTH] ✅ JWT verified successfully', { 
      userId: (payload as any).userId, 
      email: (payload as any).email,
      role: (payload as any).role
    });

    // Prefer userId but fallback to user_id if needed
    const uid = (payload as any).userId || (payload as any).user_id;
    if (!uid) {
      throw new ApiError('Invalid token payload: missing user id', 401);
    }
    
    // Get fresh user data to ensure the account is still active
    let userData;
    try {
      // First, get the user profile
      const user = await prisma.profiles.findUnique({
        where: { user_id: uid },
        select: {
          user_id: true,
          email: true,
          is_active: true,
          full_name: true,
          phone: true,
          avatar_url: true,
          email_verified: true
        }
      });

      if (!user) {
        console.error('[AUTH] ❌ User not found in database:', {
          userId: uid,
          tokenUserId: payload.userId
        });
        throw new ApiError('User not found', 401);
      }
      
      console.log('[AUTH] ✅ User found in database:', {
        userId: user.user_id,
        email: user.email,
        isActive: user.is_active
      });

      // Get user roles
      const userRoles = await prisma.user_roles.findMany({
        where: { user_id: uid },
        select: {
          role: true,
          branch_id: true,
          gym_id: true
        }
      });

      const primaryRole = userRoles[0];
      const userRole = primaryRole?.role || 'member';
      
      // Super admins should not have branch_id or gym_id
      const isSuperAdmin = userRole === 'super_admin' || userRole === 'super-admin';
      
      userData = {
        user_id: user.user_id,
        email: user.email,
        is_active: user.is_active,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        role: userRole,
        branch_id: isSuperAdmin ? null : primaryRole?.branch_id,
        gym_id: isSuperAdmin ? null : primaryRole?.gym_id,
        permissions: [] // TODO: Fetch permissions if needed
      };

      // Only reject if explicitly set to false (treat null/undefined as active)
      if (userData.is_active === false) {
        console.error('[AUTH] ❌ User account is inactive:', payload.userId);
        throw new ApiError('Account is inactive', 401);
      }
      
      console.log('[AUTH] ✅ User account is active:', {
        userId: userData.user_id,
        isActive: userData.is_active,
        email: userData.email
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('[AUTH] ❌ Error fetching user data:', {
        error: error instanceof Error ? error.message : String(error),
        userId: uid,
        errorStack: error instanceof Error ? error.stack : 'no stack'
      });
      throw new ApiError('Authentication failed', 401);
    }

    // Attach user data to request
    const authUser: AuthUser = {
      userId: userData.user_id,
      user_id: userData.user_id,
      email: userData.email,
      role: userData.role || 'member',
      branchId: userData.branch_id || null,
      gymId: userData.gym_id || null,
      fullName: userData.full_name,
      phone: userData.phone,
      avatarUrl: userData.avatar_url,
      emailVerified: userData.email_verified,
      permissions: userData.permissions || []
    };

    // Use type assertion to bypass type checking
    (req as any).user = authUser;

    console.log(`Authenticated user: ${authUser.email} with role: ${authUser.role}`);

    next();
  } catch (error: any) {
    console.error('[AUTH] ❌ Authentication failed', {
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      url: req.url,
      method: req.method
    });
    
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError('Invalid or expired token', 401));
  }
}

/**
 * Optional authentication - Don't fail if no token
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Silently fail - user remains undefined
    next();
  }
}
