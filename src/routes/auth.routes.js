import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';

const router = Router();

// Brute-force credentials rate limiter configuration
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes check window
  max: 10,                  // Limit to 10 authentication requests (allows recovery from minor typing errors)
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,    // Return rate limit status info in headers
  legacyHeaders: false
});

// Register endpoints
router.post('/register', authRateLimiter, validate(registerSchema), authController.registerUser);
router.post('/login', authRateLimiter, validate(loginSchema), authController.loginUser);
router.post('/logout', authController.logoutUser);

// Profile context retrieval (guarded by session gate)
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;
