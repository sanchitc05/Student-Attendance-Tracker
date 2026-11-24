const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value. Email may already be registered';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = errorHandler;
