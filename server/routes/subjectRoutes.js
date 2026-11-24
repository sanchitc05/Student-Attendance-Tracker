const express = require('express');
const { body, param } = require('express-validator');
const {
  createSubject,
  getSubjects,
  getMySubjects,
  updateSubject,
  enrollSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

const createSubjectRules = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('code').trim().notEmpty().withMessage('Subject code is required'),
  body('semester')
    .isInt({ min: 1, max: 12 })
    .withMessage('Semester must be an integer between 1 and 12'),
  body('teacher')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      if (!val.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid teacher ID format');
      }
      return true;
    }),
  body('students')
    .optional()
    .isArray()
    .withMessage('Students must be an array of student IDs'),
  body('students.*')
    .optional()
    .isMongoId()
    .withMessage('Each student ID must be a valid ObjectId'),
];

const updateSubjectRules = [
  param('id').isMongoId().withMessage('Invalid subject ID format'),
  body('name').optional().trim().notEmpty().withMessage('Subject name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Subject code cannot be empty'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Semester must be an integer between 1 and 12'),
];

const enrollSubjectRules = [
  param('id').isMongoId().withMessage('Invalid subject ID format'),
  body('teacher')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      if (!val.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid teacher ID format');
      }
      return true;
    }),
  body('students')
    .optional()
    .isArray()
    .withMessage('Students must be an array of student IDs'),
  body('students.*')
    .optional()
    .isMongoId()
    .withMessage('Each student ID must be a valid ObjectId'),
];

const deleteSubjectRules = [
  param('id').isMongoId().withMessage('Invalid subject ID format'),
];

router.get('/my', authorize('teacher'), getMySubjects);
router.get('/', authorize('admin', 'teacher'), getSubjects);
router.post('/', authorize('admin'), createSubjectRules, validate, createSubject);
router.put('/:id', authorize('admin'), updateSubjectRules, validate, updateSubject);
router.put('/:id/enroll', authorize('admin'), enrollSubjectRules, validate, enrollSubject);
router.delete('/:id', authorize('admin'), deleteSubjectRules, validate, deleteSubject);

module.exports = router;
