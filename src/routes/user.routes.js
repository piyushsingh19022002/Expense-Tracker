import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

/**
 * @description Retrieves the profile metadata of the currently authenticated user.
 * @route GET /api/v1/users/profile
 * @access Protected
 */
router.get('/profile', authMiddleware, (req, res) => {
  // Access the attached user metadata populated by the auth middleware
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'User profile fetched successfully.'));
});

export default router;
