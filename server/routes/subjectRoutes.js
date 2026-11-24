const express = require('express');
const {
  createSubject,
  getSubjects,
  getMySubjects,
  updateSubject,
  enrollSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/my', authorize('teacher'), getMySubjects);
router.get('/', authorize('admin', 'teacher'), getSubjects);
router.post('/', authorize('admin'), createSubject);
router.put('/:id', authorize('admin'), updateSubject);
router.put('/:id/enroll', authorize('admin'), enrollSubject);
router.delete('/:id', authorize('admin'), deleteSubject);

module.exports = router;
