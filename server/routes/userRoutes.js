const express = require('express');
const { param, query, body } = require('express-validator');
const {
  getUsers,
  getUserStats,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

const getUsersRules = [
  query('role')
    .optional()
    .isIn(['admin', 'teacher', 'student'])
    .withMessage('Role filter must be admin, teacher, or student'),
  query('semester')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Semester must be an integer between 1 and 12'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
];

const updateUserRules = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'teacher', 'student'])
    .withMessage('Role must be admin, teacher, or student'),
  body('semester')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      const num = Number(val);
      if (isNaN(num) || num < 1 || num > 12) {
        throw new Error('Semester must be a valid number between 1 and 12');
      }
      return true;
    }),
];

const deleteUserRules = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
];

router.get('/', getUsersRules, validate, getUsers);
router.get('/stats', getUserStats);
router.put('/:id', updateUserRules, validate, updateUser);
router.delete('/:id', deleteUserRules, validate, deleteUser);

module.exports = router;
