const express = require('express');
const { body } = require('express-validator');
const { login, register, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'teacher', 'student'])
    .withMessage('Role must be admin, teacher, or student'),
  body('rollNo').custom((value, { req }) => {
    if (req.body.role === 'student' && !value) {
      throw new Error('Roll number is required for students');
    }
    return true;
  }),
  body('semester').custom((value, { req }) => {
    if (req.body.role === 'student' && (value === undefined || value === '')) {
      throw new Error('Semester is required for students');
    }
    return true;
  }),
  body('department').custom((value, { req }) => {
    if (req.body.role === 'student' && !value) {
      throw new Error('Department is required for students');
    }
    return true;
  }),
];

router.post('/login', loginRules, validate, login);
router.post('/register', protect, authorize('admin'), registerRules, validate, register);
router.get('/me', protect, getMe);

module.exports = router;
