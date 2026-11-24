const express = require('express');
const {
  markAttendance,
  updateAttendance,
  getClassReport,
  getAttendanceByDate,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/by-date', authorize('teacher', 'admin'), getAttendanceByDate);
router.get('/subject/:id', authorize('teacher', 'admin'), getClassReport);
router.post('/', authorize('teacher'), markAttendance);
router.put('/:id', authorize('teacher'), updateAttendance);

module.exports = router;
