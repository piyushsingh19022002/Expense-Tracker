/**
 * @description Centralized Response Class to structure all successful API responses consistently.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (e.g., 200, 201)
   * @param {any} data - Response payload returned to the client
   * @param {string} [message="Success"] - Success notification message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // Evaluates to true for successful actions
  }
}

export { ApiResponse };
export default ApiResponse;
