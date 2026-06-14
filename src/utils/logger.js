import winston from 'winston';
import config from '../config/index.js';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom log layout for development console logging
const devConsoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create the logger instance
const logger = winston.createLogger({
  level: config.isProduction ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }) // Auto-capture error stack traces
  ),
  transports: [
    new winston.transports.Console({
      format: config.isProduction
        ? json() // JSON logs in production for log aggregators (ELK, Datadog, CloudWatch)
        : combine(
            colorize(), // Colorized logs for developer terminal
            devConsoleFormat
          )
    })
  ]
});

// Standardize stream for Morgan middleware integration
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

export default logger;
