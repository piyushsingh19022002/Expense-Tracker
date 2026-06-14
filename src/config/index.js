import dotenv from 'dotenv';

// Load environmental variables from .env file
dotenv.config();

// Define allowed environments
const ALLOWED_ENVIRONMENTS = ['development', 'production', 'test'];

// Parse and validate PORT
const port = parseInt(process.env.PORT || '8000', 10);
if (isNaN(port) || port <= 0 || port > 65535) {
  throw new Error('Configuration Error: PORT must be a valid number between 1 and 65535.');
}

// Validate NODE_ENV
const env = process.env.NODE_ENV || 'development';
if (!ALLOWED_ENVIRONMENTS.includes(env)) {
  throw new Error(`Configuration Error: NODE_ENV must be one of [${ALLOWED_ENVIRONMENTS.join(', ')}]. Received: "${env}"`);
}

// CORS settings - can be wildcard '*' or a comma-separated list of origins
const corsOrigin = process.env.CORS_ORIGIN || '*';

export const config = Object.freeze({
  port,
  env,
  corsOrigin,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isTest: env === 'test'
});

export default config;
