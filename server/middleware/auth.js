const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    if (!token) {
      const error = new Error('Not authorized, token missing');
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error('Not authorized, user not found');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.message = 'Not authorized, token invalid';
    }

    if (!error.statusCode) {
      error.statusCode = 401;
    }

    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error(
        `Role '${req.user ? req.user.role : 'unknown'}' is not allowed to access this route`
      );
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

module.exports = { protect, authorize };
