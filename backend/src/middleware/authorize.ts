import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

/**
 * Authorization middleware - Check if user has required role
 */
export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Not authenticated', 401));
    }

    const userRole = req.user.role;
    
    // Super admin special handling for SaaS workflow
    if (userRole === 'super_admin') {
      // Block super_admin from creating gyms (POST /gyms)
      if (req.originalUrl.includes('/api/v1/gyms') && req.method === 'POST') {
        return next(new ApiError('Super Admin cannot create gyms. Only admin users can create gyms.', 403));
      }
      
      // Allow super_admin read-only access (GET requests)
      if (req.method === 'GET') {
        return next();
      }
      
      // For other methods, check if super_admin is in allowedRoles
      if (allowedRoles.includes('super_admin')) {
        return next();
      }
      
      return next(new ApiError('Insufficient permissions', 403));
    }
    
    // Regular role check
    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(new ApiError('Insufficient permissions', 403));
    }

    next();
  };
}

/**
 * Check if user owns the resource or is an admin
 */
export function checkOwnership(userIdParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Not authenticated', 401));
    }

    const resourceUserId = req.params[userIdParam];
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isOwner = req.user.userId === resourceUserId;

    if (!isAdmin && !isOwner) {
      return next(new ApiError('Access denied', 403));
    }

    next();
  };
}

/**
 * Check if user can access branch resources
 */
export function checkBranchAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Not authenticated', 401));
    }

    // Admins and super admins can access all branches
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    const branchId = req.params.branchId || req.body.branch_id || req.query.branchId;
    
    if (branchId && req.user.branchId !== branchId) {
      return next(new ApiError('Cannot access resources from other branches', 403));
    }

    next();
  };
}
