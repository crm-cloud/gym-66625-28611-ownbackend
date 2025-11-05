import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiting middleware configurations
 */

// General API rate limiter - Disabled for development
export const generalLimiter = (req: Request, res: Response, next: Function) => next();

// Keeping the original limiter for reference
const _generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth limiter - Disabled for development
export const authLimiter = (req: Request, res: Response, next: Function) => next();

// Keeping the original limiter for reference
const _authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Password reset limiter - Disabled for development
export const passwordResetLimiter = (req: Request, res: Response, next: Function) => next();

// Keeping the original limiter for reference
const _passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public API limiter - Disabled for development
export const publicApiLimiter = (req: Request, res: Response, next: Function) => next();

// Keeping the original limiter for reference
const _publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin endpoint limiter - Disabled for development
export const adminLimiter = (req: Request, res: Response, next: Function) => next();

// Keeping the original limiter for reference
const _adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Rate limit exceeded for admin operations.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create custom rate limiter
export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};
