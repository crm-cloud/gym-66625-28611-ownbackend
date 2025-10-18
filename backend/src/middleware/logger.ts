import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    
    const log = {
      timestamp,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown'
    };

    // Color code by status
    const statusColor = 
      res.statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
      res.statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
      res.statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
      '\x1b[32m'; // Green for 2xx

    const reset = '\x1b[0m';

    console.log(
      `${timestamp} | ${statusColor}${res.statusCode}${reset} | ` +
      `${req.method} ${req.path} | ${duration}ms`
    );
  });

  next();
};
