const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': ${err.value}`;
  }

  // 2. Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    
    if (field === 'subject' || (err.keyPattern && err.keyPattern.subject && err.keyPattern.date)) {
      message = 'Attendance has already been recorded for this subject on this date';
    } else {
      message = `Duplicate entry: '${value}' is already in use for ${field}`;
    }
  }

  // 3. Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  // 4. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Not authorized: token is invalid or malformed';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired: please log in again';
  }

  // Log server errors for debugging (hide detailed stacks from client in production)
  if (statusCode === 500) {
    console.error('SERVER ERROR:', err.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = errorHandler;
