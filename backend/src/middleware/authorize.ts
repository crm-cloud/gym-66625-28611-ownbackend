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
    
    // FIXED: Super admin has explicit permissions based on allowedRoles
    if (userRole === 'super_admin') {
      // If super_admin is in allowedRoles, grant access
      if (allowedRoles.includes('super_admin')) {
        return next();
      }
      
      // Otherwise deny (no special GET access)
      return next(new ApiError('Insufficient permissions', 403));
    }
    
    // Regular role check for non-super_admin users
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
