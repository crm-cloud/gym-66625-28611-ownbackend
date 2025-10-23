import { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '../utils/caseConverter';

/**
 * Middleware to format API responses consistently
 */
export function formatResponse(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  
  res.json = function(body) {
    // Convert response body to camelCase
    const formattedBody = body ? toCamelCase(body) : body;
    
    // Standard response format
    const response = {
      success: res.statusCode < 400,
      data: formattedBody,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };
    
    return originalJson.call(this, response);
  };
  
  next();
}

/**
 * Error formatter for consistent error responses
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
}
