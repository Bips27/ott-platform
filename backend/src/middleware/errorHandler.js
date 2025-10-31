// Async handler wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key (unique index violation)
  if (err.code === 11000) {
    const keyValue = err.keyValue || {};
    const field = Object.keys(keyValue)[0];
    const value = field ? keyValue[field] : undefined;
    let message = 'Duplicate field value entered';

    if (field) {
      const prettyField = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase());
      if (field.toLowerCase().includes('email')) {
        message = 'Email already exists';
      } else if (field.toLowerCase().includes('mobile')) {
        message = 'Mobile number already exists';
      } else if (field.toLowerCase().includes('name')) {
        message = `${prettyField} already exists`;
      } else {
        message = `${prettyField} must be unique${value ? `: ${value}` : ''}`;
      }
    }

    error = { message, statusCode: 409 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler, asyncHandler };