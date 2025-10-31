export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Ensure the error stack is captured for proper error tracking
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  // Default to 500 if status code is not set
  const statusCode = err.statusCode || 500;
  
  // Log the error for debugging
  console.error(`[${new Date().toISOString()}] ${err.message}`);
  console.error(err.stack);
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req: any, res: any, next: any) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};
