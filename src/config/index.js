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

// Validate JWT configuration
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && env === 'production') {
  throw new Error('Configuration Error: JWT_SECRET environment variable is required in production.');
}
const finalJwtSecret = jwtSecret || 'default_fallback_jwt_secret_dev_only';

const jwtExpiry = process.env.JWT_EXPIRY || '24h';
const jwtCookieName = process.env.JWT_COOKIE_NAME || 'auth_token';

// Validate DATABASE_URL configuration
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Configuration Error: DATABASE_URL environment variable is required.');
}

export const config = Object.freeze({
  port,
  env,
  corsOrigin,
  databaseUrl,
  jwtSecret: finalJwtSecret,
  jwtExpiry,
  jwtCookieName,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isTest: env === 'test'
});

export default config;
