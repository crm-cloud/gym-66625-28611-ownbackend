import { Request, Response, NextFunction } from 'express';
import { ROLES } from '../config/constants.js';

// Type for user roles
type Role = typeof ROLES[keyof typeof ROLES];

declare global {
  namespace Express {
    interface Request {
      user?: {
        role: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Middleware to check if user has required roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const authorize = (allowedRoles: Role[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    // Super admin bypass - has access to everything
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    // If no specific roles are required, allow access
    if (allowedRoles.length === 0) {
      return next();
    }

    // Check if user has one of the required roles
    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === ROLES.ADMIN) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
};

/**
 * Middleware to check if user is a trainer
 */
export const isTrainer = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === ROLES.TRAINER) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Trainer access required'
  });
};

/**
 * Middleware to check if user is a member
 */
export const isMember = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === ROLES.MEMBER) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Member access required'
  });
};
