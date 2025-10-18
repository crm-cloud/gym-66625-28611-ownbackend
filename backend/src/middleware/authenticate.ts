import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { ApiError } from './errorHandler';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware - Verify JWT token
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
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

    // Verify token and attach user to request
    const payload = verifyAccessToken(token);
    req.user = payload;

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
