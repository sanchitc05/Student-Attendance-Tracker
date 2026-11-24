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

// @desc    Get users with optional search, filters, and pagination
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { role, semester, department, search, page: pageQuery, limit: limitQuery } = req.query;
    const query = {};

    if (role) query.role = role;
    if (semester) query.semester = Number(semester);
    if (department) query.department = department;

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { rollNo: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // If neither page nor limit is requested, return the full list
    // (Used by dropdown selectors in subject assignment)
    if (!pageQuery && !limitQuery) {
      const users = await User.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: users.map(formatUser),
      });
    }

    // Paginated flow for admin user lists
    const page = Math.max(1, parseInt(pageQuery, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(limitQuery, 10) || 10));
    const skip = (page - 1) * limit;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users: users.map(formatUser),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics (total students and teachers)
// @route   GET /api/users/stats
// @access  Private/Admin
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

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
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

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

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
