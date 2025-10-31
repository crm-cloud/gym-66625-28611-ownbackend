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

    if (!authHeader) {
      throw new ApiError('No authorization header provided', 401);
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new ApiError('Invalid authorization header format', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new ApiError('No token provided', 401);
    }

    // Verify token
    const payload = verifyAccessToken(token);
    
    // Get fresh user data to ensure the account is still active
    let userData;
    try {
      // Use raw query to avoid Prisma type issues
      const users = await prisma.$queryRaw`
        SELECT 
          p.user_id,
          p.email,
          p.is_active,
          p.full_name,
          p.phone,
          p.avatar_url,
          p.email_verified,
          ur.role,
          ur.branch_id,
          ur.gym_id,
          r.role_id,
          r.name as role_name,
          rp.permission_id,
          p2.name as permission_name
        FROM profiles p
        LEFT JOIN user_roles ur ON p.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role = r.name
        LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
        LEFT JOIN permissions p2 ON rp.permission_id = p2.permission_id
        WHERE p.user_id = ${payload.userId}
        ORDER BY ur.created_at ASC
      ` as any[];

      if (!users || users.length === 0) {
        console.error('User not found in database:', payload.userId);
        throw new ApiError('User not found', 401);
      }

      // Group permissions by user
      const userPermissions = new Map<string, string[]>();
      users.forEach(row => {
        if (row.permission_name) {
          const perms = userPermissions.get(row.user_id) || [];
          perms.push(row.permission_name);
          userPermissions.set(row.user_id, perms);
        }
      });

      // Get the first user (should only be one)
      const firstUser = users[0];
      userData = {
        user_id: firstUser.user_id,
        email: firstUser.email,
        is_active: firstUser.is_active,
        full_name: firstUser.full_name,
        phone: firstUser.phone,
        avatar_url: firstUser.avatar_url,
        email_verified: firstUser.email_verified,
        role: firstUser.role,
        branch_id: firstUser.branch_id,
        gym_id: firstUser.gym_id,
        permissions: Array.from(new Set(userPermissions.get(firstUser.user_id) || []))
      };

      if (!userData.is_active) {
        console.error('User account is inactive:', payload.userId);
        throw new ApiError('Account is inactive', 401);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
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
