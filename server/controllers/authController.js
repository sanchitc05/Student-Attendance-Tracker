const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  rollNo: user.rollNo || null,
  semester: user.semester || null,
  department: user.department || null,
});

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: formatUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNo, semester, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      rollNo,
      semester,
      department,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: formatUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Current user fetched',
      data: {
        user: formatUser(req.user),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getMe };
