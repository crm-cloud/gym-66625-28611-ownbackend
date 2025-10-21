import { Request, Response, NextFunction } from 'express';

/**
 * Request/Response transformation middleware
 * Standardizes API responses and request data
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Transform response to standard format
 */
export function transformResponse(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);

  res.json = function (data: any): Response {
    // If already in API response format, send as is
    if (data && typeof data === 'object' && 'success' in data) {
      return originalJson(data);
    }

    // Transform to standard format
    const response: ApiResponse = {
      success: res.statusCode >= 200 && res.statusCode < 300,
      data: data,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: req.headers['x-request-id'] as string,
      },
    };

    return originalJson(response);
  };

  next();
}

/**
 * Transform error response
 */
export function transformErrorResponse(error: any, res: Response): Response {
  const response: ApiResponse = {
    success: false,
    error: error.message || 'An error occurred',
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    },
  };

  const statusCode = error.statusCode || error.status || 500;
  return res.status(statusCode).json(response);
}

/**
 * Sanitize request body
 * Remove sensitive fields from request body before processing
 */
export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    // Remove common sensitive fields that shouldn't be updated directly
    const sensitiveFields = ['id', 'created_at', 'updated_at', 'deleted_at', 'password_hash'];
    
    sensitiveFields.forEach(field => {
      if (field in req.body) {
        delete req.body[field];
      }
    });
  }

  next();
}

/**
 * Add pagination helper to response
 */
export function addPaginationHelper(req: Request, res: Response, next: NextFunction) {
  res.paginate = function (data: any[], total: number, page: number, limit: number): Response {
    const response: ApiResponse = {
      success: true,
      data: data,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: req.headers['x-request-id'] as string,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return res.json(response);
  };

  next();
}

// Extend Express Response type
declare global {
  namespace Express {
    interface Response {
      paginate?: (data: any[], total: number, page: number, limit: number) => Response;
    }
  }
}
