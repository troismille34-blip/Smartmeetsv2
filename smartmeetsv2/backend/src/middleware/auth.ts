import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../types/index.js';
import { logger } from '../utils/index.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Generate JWT Token
 */
export const generateToken = (userId: string, expiresIn = config.jwt.expiresIn): string => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn,
  });
};

/**
 * Verify JWT Token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    logger.error('Invalid token', error);
    throw new UnauthorizedError('Invalid or expired token');
  }
};

/**
 * Middleware to authenticate requests
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;

    logger.debug('✅ User authenticated', { userId: req.userId });
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: new Date(),
      });
    }

    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      statusCode: 401,
      timestamp: new Date(),
    });
  }
};

/**
 * Middleware to check authorization
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // This is a placeholder - implement with user roles from DB
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
      logger.debug('✅ Optional user authenticated', { userId: req.userId });
    }

    next();
  } catch (error) {
    // Silently ignore auth errors for optional auth
    logger.debug('⚠️ Optional authentication skipped');
    next();
  }
};

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Note: In production, use bcrypt
  // For now, just return a simple hash
  return Buffer.from(password).toString('base64');
};

/**
 * Compare password
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  // Note: In production, use bcrypt
  return Buffer.from(password).toString('base64') === hash;
};

export default {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  optionalAuth,
  hashPassword,
  comparePassword,
};
