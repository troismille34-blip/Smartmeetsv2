import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, NotFoundError, UnauthorizedError } from '../types/index.js';
import { logger } from '../utils/index.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('🔴 Error caught', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Handle known app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      statusCode: err.statusCode,
      timestamp: new Date(),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
      statusCode: 401,
      timestamp: new Date(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
      statusCode: 401,
      timestamp: new Date(),
    });
  }

  // Handle database errors
  if (err.message?.includes('UNIQUE violation')) {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists',
      code: 'CONFLICT',
      statusCode: 409,
      timestamp: new Date(),
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error'
      : err.message,
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
    timestamp: new Date(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new NotFoundError('Route', req.url);
  errorHandler(error, req, res, next);
};

/**
 * Async handler wrapper to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
