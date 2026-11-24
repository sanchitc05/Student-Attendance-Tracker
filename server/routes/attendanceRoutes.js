const express = require('express');
const { body, param, query } = require('express-validator');
const {
  markAttendance,
  updateAttendance,
  getClassReport,
  getAttendanceByDate,
  getStudentAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

const markAttendanceRules = [
  body('subject').isMongoId().withMessage('Valid subject ID is required'),
  body('date').notEmpty().withMessage('Attendance date is required'),
  body('records')
    .isArray({ min: 1 })
    .withMessage('Records must be a non-empty array of student attendance statuses'),
  body('records.*.student')
    .isMongoId()
    .withMessage('Each record must contain a valid student ID'),
  body('records.*.status')
    .isIn(['present', 'absent'])
    .withMessage("Attendance status must be either 'present' or 'absent'"),
];

const updateAttendanceRules = [
  param('id').isMongoId().withMessage('Invalid attendance record ID format'),
  body('records')
    .isArray({ min: 1 })
    .withMessage('Records must be a non-empty array of student attendance statuses'),
  body('records.*.student')
    .isMongoId()
    .withMessage('Each record must contain a valid student ID'),
  body('records.*.status')
    .isIn(['present', 'absent'])
    .withMessage("Attendance status must be either 'present' or 'absent'"),
];

const classReportRules = [
  param('id').isMongoId().withMessage('Invalid subject ID format'),
];

const byDateRules = [
  query('subject').isMongoId().withMessage('Valid subject ID query parameter is required'),
  query('date').notEmpty().withMessage('Date query parameter is required'),
];

router.get('/student/me', authorize('student'), getStudentAttendance);
router.get('/by-date', authorize('teacher', 'admin'), byDateRules, validate, getAttendanceByDate);
router.get('/subject/:id', authorize('teacher', 'admin'), classReportRules, validate, getClassReport);
router.post('/', authorize('teacher'), markAttendanceRules, validate, markAttendance);
router.put('/:id', authorize('teacher'), updateAttendanceRules, validate, updateAttendance);

module.exports = router;
