import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

/**
 * Authorization middleware - Check user role
 * Usage: authorize(['admin', 'manager'])
 */
export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
}

/**
 * Check if user owns the resource or is admin
 * Usage: checkOwnership('userId') - checks req.params.userId matches req.user.userId
 */
export function checkOwnership(userIdParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    const resourceUserId = req.params[userIdParam];
    const currentUserId = req.user.userId;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    if (resourceUserId !== currentUserId && !isAdmin) {
      return next(new ApiError('Access denied. You can only access your own resources', 403));
    }

    next();
  };
}

/**
 * Check if user has access to specific branch
 */
export function checkBranchAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    const requestedBranchId = req.params.branchId || req.body.branchId || req.query.branchId;
    const userBranchId = req.user.branchId;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    // Admins have access to all branches
    if (isAdmin) {
      return next();
    }

    // Check if user's branch matches requested branch
    if (requestedBranchId && userBranchId !== requestedBranchId) {
      return next(new ApiError('Access denied. You can only access your assigned branch', 403));
    }

    next();
  };
}
