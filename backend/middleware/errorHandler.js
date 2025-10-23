// ============================================================================
// FILE: backend/middleware/errorHandler.js
// Error handling middleware
// ============================================================================

/**
 * Async handler to wrap async route handlers
 * Catches any errors and passes them to the next middleware
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'Record already exists';
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    status = 400;
    message = 'Invalid reference to related record';
  }

  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default { asyncHandler, errorHandler };
