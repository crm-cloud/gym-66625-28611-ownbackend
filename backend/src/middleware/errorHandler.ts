import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Database error',
      details: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}
