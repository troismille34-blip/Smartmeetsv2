import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import {
  generateToken,
  authenticate,
  hashPassword,
  comparePassword,
} from '../middleware/auth.js';
import {
  ValidationError,
  UnauthorizedError,
  ApiResponse,
} from '../types/index.js';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler.js';
import { logger } from '../utils/index.js';
import { validateEmail } from '../utils/index.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register new user
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, name, password, companyId } = req.body;

    // Validation
    if (!email || !name || !password) {
      throw new ValidationError('Email, name, and password are required');
    }

    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format', 'email');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters', 'password');
    }

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);

    if (existing.rows.length > 0) {
      throw new ValidationError('User with this email already exists', 'email');
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = uuidv4();

    // Create user
    await pool.query(
      `INSERT INTO users (id, email, name, password_hash, company_id, language, timezone)
       VALUES ($1, $2, $3, $4, $5, 'de', 'Europe/Zurich')`,
      [userId, email.toLowerCase(), name, passwordHash, companyId || null]
    );

    const token = generateToken(userId);

    logger.info('✅ User registered successfully', { email, userId });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email,
          name,
          role: 'user',
        },
      },
      message: 'User registered successfully',
      statusCode: 201,
      timestamp: new Date(),
    } as ApiResponse);
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, name, password_hash, role FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken(user.id);

    logger.info('✅ User logged in successfully', { email, userId: user.id });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      message: 'Login successful',
      statusCode: 200,
      timestamp: new Date(),
    } as ApiResponse);
  })
);

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT id, email, name, avatar_url, role, timezone, language, created_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User', userId);
    }

    const user = result.rows[0];

    logger.debug('✅ Profile retrieved', { userId });

    res.json({
      success: true,
      data: { user },
      statusCode: 200,
      timestamp: new Date(),
    } as ApiResponse);
  })
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const userId = req.userId;
    const { name, avatarUrl, timezone, language } = req.body;

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (avatarUrl) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(avatarUrl);
    }
    if (timezone) {
      updates.push(`timezone = $${paramIndex++}`);
      values.push(timezone);
    }
    if (language) {
      updates.push(`language = $${paramIndex++}`);
      values.push(language);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updates.length === 1) {
      throw new ValidationError('No fields to update');
    }

    values.push(userId);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL`,
      values
    );

    logger.info('✅ Profile updated', { userId });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      statusCode: 200,
      timestamp: new Date(),
    } as ApiResponse);
  })
);

/**
 * POST /api/auth/logout
 * Logout user (client-side token deletion)
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: any, res) => {
    logger.info('✅ User logged out', { userId: req.userId });

    res.json({
      success: true,
      message: 'Logged out successfully',
      statusCode: 200,
      timestamp: new Date(),
    } as ApiResponse);
  })
);

/**
 * POST /api/auth/refresh-token
 * Refresh JWT token
 */
router.post(
  '/refresh-token',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const userId = req.userId;
    const token = generateToken(userId);

    logger.debug('✅ Token refreshed', { userId });

    res.json({
      success: true,
      data: { token },
      statusCode: 200,
      timestamp: new Date(),
    } as ApiResponse);
  })
);

export default router;
