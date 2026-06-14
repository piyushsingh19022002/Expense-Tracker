import ApiError from '../utils/ApiError.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * @description Centralized error handler middleware.
 * Formats errors uniformly into custom JSON formats and controls stack trace exposure.
 */
const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Convert generic errors to ApiError if they aren't already instance of it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // Create standard response layout
  const response = {
    success: error.success,
    message: error.message,
    errors: error.errors,
    ...(config.isDevelopment && { stack: error.stack }) // Hide stack traces in production
  };

  // Structured logging of error
  logger.error(
    `${req.method} ${req.originalUrl} - Status: ${error.statusCode} - Message: ${error.message}`,
    error // This logs the complete stack trace via winston
  );

  return res.status(error.statusCode).json(response);
};

export default errorMiddleware;
