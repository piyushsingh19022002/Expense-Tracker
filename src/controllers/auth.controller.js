import * as authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/index.js';

// Configuration for secure HTTP-only session cookies
const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction, // Enforces secure cookie transport only over HTTPS in production
  sameSite: 'lax',            // Balance between security and standard cross-site redirection usability
  maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds (matching 24h JWT lifetime)
});

/**
 * @description Registers a new account.
 * @route POST /api/v1/auth/register
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.register(name, email, password);
  
  return res
    .status(201)
    .json(new ApiResponse(201, user, 'Registration completed successfully.'));
});

/**
 * @description Validates credentials, sets HttpOnly cookies, and signs sessions.
 * @route POST /api/v1/auth/login
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);

  // Set signed token inside secure HttpOnly cookie wrapper
  res.cookie(config.jwtCookieName, token, getCookieOptions());

  return res
    .status(200)
    .json(new ApiResponse(200, { user, token }, 'Authenticated successfully.'));
});

/**
 * @description Invalidates session and clears active auth cookies.
 * @route POST /api/v1/auth/logout
 */
export const logoutUser = asyncHandler(async (req, res) => {
  // Clear cookie using matching configurations to prevent browser blockages
  res.clearCookie(config.jwtCookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax'
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully.'));
});

/**
 * @description Returns current validated user profile data.
 * @route GET /api/v1/auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Active profile context fetched successfully.'));
});
