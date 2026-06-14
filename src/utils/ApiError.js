/**
 * @description Centralized Custom Error Class to handle operational API errors.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
   * @param {string} [message="Something went wrong"] - Descriptive error message
   * @param {Array} [errors=[]] - Array containing details of specific validation or operational issues
   * @param {string} [stack=""] - Custom error stack trace if available
   */
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null; // Always null for error payloads
    this.message = message;
    this.success = false; // Flag to easily verify status in client clients
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
export default ApiError;
