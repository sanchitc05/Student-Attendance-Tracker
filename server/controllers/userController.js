const mongoose = require('mongoose');
const User = require('../models/User');

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  rollNo: user.rollNo || null,
  semester: user.semester || null,
  department: user.department || null,
  createdAt: user.createdAt,
});

const getUsers = async (req, res, next) => {
  try {
    const { role, semester, department, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (semester) query.semester = Number(semester);
    if (department) query.department = department;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users.map(formatUser),
    });
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });

    res.status(200).json({
      success: true,
      message: 'User statistics fetched successfully',
      data: {
        totalStudents,
        totalTeachers,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    const { name, email, role, rollNo, semester, department } = req.body;

    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        const error = new Error('Email is already registered by another account');
        error.statusCode = 409;
        throw error;
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (rollNo !== undefined) user.rollNo = rollNo || null;
    if (semester !== undefined) user.semester = semester ? Number(semester) : null;
    if (department !== undefined) user.department = department || null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserStats,
  updateUser,
  deleteUser,
};
