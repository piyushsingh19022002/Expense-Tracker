import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';

let server;

// Start Server listening
const startServer = () => {
  server = app.listen(config.port, () => {
    logger.info(`Server successfully started in "${config.env}" mode on http://localhost:${config.port}`);
  });
};

// Gracefully handle server termination (e.g. SIGINT/SIGTERM from Kubernetes, PM2, Docker)
const handleGracefulShutdown = (signal) => {
  logger.info(`System received ${signal} signal. Beginning graceful termination...`);
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed successfully.');
      process.exit(0);
    });
    
    // Force shutdown after a 10s grace timeout if connections are hanging
    setTimeout(() => {
      logger.warn('Forcing server shutdown after grace timeout.');
      process.exit(0);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
};

// Handle process-level uncaught exceptions or unhandled promise rejections
const handleSystemFailure = (error) => {
  logger.error('CRITICAL: Unexpected system failure caught!', error);
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed due to system crash.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

// Register process handlers
process.on('uncaughtException', handleSystemFailure);
process.on('unhandledRejection', handleSystemFailure);

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

// Bootstrap the server
startServer();
