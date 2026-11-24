const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  login,
  signup,
  register,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Stricter rate limiter for login and password resets to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes',
    data: null,
  },
});

const loginRules = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const signupRules = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'teacher'])
    .withMessage('Role must be either student or teacher'),
  body('rollNo').custom((value, { req }) => {
    if (req.body.role === 'student' && (!value || !value.trim())) {
      throw new Error('Roll number is required for students');
    }
    return true;
  }),
  body('semester').custom((value, { req }) => {
    if (req.body.role === 'student') {
      const num = Number(value);
      if (isNaN(num) || num < 1 || num > 12) {
        throw new Error('Valid semester (1-12) is required for students');
      }
    }
    return true;
  }),
  body('department').trim().notEmpty().withMessage('Department is required'),
];

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['admin', 'teacher', 'student'])
    .withMessage('Role must be admin, teacher, or student'),
  body('rollNo').custom((value, { req }) => {
    if (req.body.role === 'student' && (!value || !value.trim())) {
      throw new Error('Roll number is required for students');
    }
    return true;
  }),
  body('semester').custom((value, { req }) => {
    if (req.body.role === 'student') {
      const num = Number(value);
      if (isNaN(num) || num < 1 || num > 12) {
        throw new Error('Valid semester (1-12) is required for students');
      }
    }
    return true;
  }),
  body('department').custom((value, { req }) => {
    if (req.body.role === 'student' && (!value || !value.trim())) {
      throw new Error('Department is required for students');
    }
    return true;
  }),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('newPassword').custom((value, { req }) => {
    if (value === req.body.currentPassword) {
      throw new Error('New password must be different from current password');
    }
    return true;
  }),
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Please provide a valid registered email address'),
];

const resetPasswordRules = [
  body('email').trim().isEmail().withMessage('Please provide a valid email address'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

// Public routes
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/signup', signupRules, validate, signup);
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordRules, validate, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('admin'), registerRules, validate, register);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

module.exports = router;
