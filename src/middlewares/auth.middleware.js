import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @description Authentication Gate Middleware.
 * Extracts, verifies JWT sessions, and binds database user profiles to request context.
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1. Attempt token extraction from httpOnly cookies
  if (req.cookies && req.cookies[config.jwtCookieName]) {
    token = req.cookies[config.jwtCookieName];
  }
  // 2. Fallback token extraction from Authorization Header (Standard for API clients/mobile apps)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in to gain access.');
  }

  try {
    // Verify JWT token signature
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch matching user from database to ensure record has not been deleted or suspended
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new ApiError(401, 'The account linked to this session does not exist.');
    }

    // Attach sanitized user context to request context
    const { password: _, ...sanitizedUser } = user;
    req.user = sanitizedUser;

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid session token signature. Access denied.');
  }
});

export default authMiddleware;
