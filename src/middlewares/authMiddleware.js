import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @description JWT Authentication Middleware.
 * Secures routes by verifying Bearer tokens and loading user profile models.
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Validate the presence and schema of the Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required. No token provided.');
  }

  // 2. Parse the token from the "Bearer <token>" payload
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new ApiError(401, 'Authentication required. Invalid token format.');
  }

  try {
    // 3. Verify the token signature and expiration against JWT_SECRET
    const decoded = jwt.verify(token, config.jwtSecret);

    // 4. Fetch the user from the database to confirm they exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new ApiError(401, 'The account linked to this session no longer exists.');
    }

    // 5. Attach the sanitized user model to the request context (excluding password)
    const { password: _, ...sanitizedUser } = user;
    req.user = sanitizedUser;

    // 6. Proceed to the next middleware/controller
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid session token signature.');
  }
});

export default authMiddleware;
