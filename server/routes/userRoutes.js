const express = require('express');
const {
  getUsers,
  getUserStats,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/stats', getUserStats);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
