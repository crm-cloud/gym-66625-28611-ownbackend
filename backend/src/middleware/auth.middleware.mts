import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
import { PrismaClient } from '@prisma/client';

// Type for JWT payload
type JwtPayload = {
  user_id: string;
  role: string;
  [key: string]: any;
};

const prisma = new PrismaClient();

// User roles
export const ROLES = {
  ADMIN: 'admin',
  TRAINER: 'trainer',
  MEMBER: 'member',
  STAFF: 'staff',
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User {
      user_id: string;
      role: Role;
      [key: string]: any;
    }
    
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: 'No authentication token provided' 
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token format' 
    });
  }

  try {
    // Verify and decode the token with proper type assertion
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Fetch the user from the database with role
    const user = await prisma.profiles.findUnique({
      where: { user_id: decoded.user_id },
      select: {
        user_id: true,
        role: true,
        // Add other fields you need from the profiles table
      },
    }) as { user_id: string; role: Role } | null;

    if (!user) {
      return res.status(403).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

/**
 * Middleware to check if user has required roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const authorize = (allowedRoles: Role[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    // If no specific roles are required, allow access
    if (allowedRoles.length === 0) {
      return next();
    }

    // Check if user has one of the required roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};

// Shorthand middleware for common roles
export const isAdmin = [authenticate, authorize([ROLES.ADMIN])];
export const isTrainer = [authenticate, authorize([ROLES.TRAINER])];
export const isMember = [authenticate, authorize([ROLES.MEMBER])];
export const isStaff = [authenticate, authorize([ROLES.STAFF])];

// Middleware for any authenticated user
export const isAuthenticated = [authenticate];
