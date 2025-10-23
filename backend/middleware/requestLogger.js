// ============================================================================
// REQUEST LOGGING MIDDLEWARE
// ============================================================================
// Logs HTTP requests with useful information
// ============================================================================

import logger from '../config/logger.js';

/**
 * Request logging middleware
 * Logs incoming HTTP requests with method, URL, IP, and response time
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  const { method, originalUrl, ip } = req;

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Choose log level based on status code
    const logLevel = statusCode >= 500 ? 'error'
                   : statusCode >= 400 ? 'warn'
                   : 'http';

    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

    logger[logLevel](message);
  });

  next();
};

export default requestLogger;
