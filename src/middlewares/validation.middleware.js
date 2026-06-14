import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * @description Express middleware to validate request attributes (body, query, params) against Zod schemas.
 * 
 * @param {import('zod').ZodSchema} schema - The Zod schema validator
 * @returns {Function} Express middleware function
 */
const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    // Assign sanitized variables back to req context
    req.body = validated.body;
    req.query = validated.query;
    req.params = validated.params;
    
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Extract individual constraint messages
      const validationErrors = error.issues.map((err) => ({
        field: err.path.slice(1).join('.'), // Strips "body", "query", etc. from path namespaces
        message: err.message
      }));

      // Forward operational validation error
      return next(new ApiError(400, 'Request validation failed.', validationErrors));
    }

    // Forward any other unexpected errors to the global handler
    return next(error);
  }
};

export default validate;
