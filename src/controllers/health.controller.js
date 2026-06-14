import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @description Verifies API health and checks resource uptimes.
 * @route GET /api/v1/health
 */
const getHealthStatus = asyncHandler(async (req, res) => {
  const healthCheck = {
    status: 'UP',
    uptime: Math.floor(process.uptime()), // Uptime in seconds
    timestamp: new Date().toISOString()
  };

  return res
    .status(200)
    .json(new ApiResponse(200, healthCheck, 'Server is running healthily.'));
});

export { getHealthStatus };
export default getHealthStatus;
