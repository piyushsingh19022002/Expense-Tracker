/**
 * @description A high-order function wrapper to catch errors in async Express route handlers.
 * Eliminates repeating try/catch structures in controllers.
 * 
 * @param {Function} requestHandler - Asynchronous Express route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
export default asyncHandler;
