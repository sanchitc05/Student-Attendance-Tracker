const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../config/email');

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

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
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

// @desc    Public sign up for Students and Teachers
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNo, semester, department } = req.body;

    // Security check: Only students and teachers can self-register
    if (!['student', 'teacher'].includes(role)) {
      const error = new Error('Self-registration is only available for Students and Teachers');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      const error = new Error('An account with this email is already registered');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      rollNo: role === 'student' ? rollNo?.trim() : undefined,
      semester: role === 'student' ? Number(semester) : undefined,
      department: department?.trim(),
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: `${role === 'teacher' ? 'Teacher' : 'Student'} account created successfully`,
      data: {
        token,
        user: formatUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user (admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNo, semester, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
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

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
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

// @desc    Change user password (authenticated)
// @route   PUT /api/auth/change-password
// @access  Private (All roles)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset OTP via email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      const error = new Error('No account found with this email address');
      error.statusCode = 404;
      throw error;
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 10 minutes from now
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    const subject = 'Password Reset OTP - Student Attendance Tracker';
    const text = `Hello ${user.name},\n\nYour One-Time Password (OTP) for resetting your password is: ${otp}\n\nThis OTP is valid for 10 minutes. If you did not request this, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 15px;">Hello <strong>${user.name}</strong>,</p>
        <p style="color: #475569; font-size: 15px;">You requested a password reset for your Student Attendance Tracker account. Use the OTP below to complete the verification:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background-color: #f1f5f9; padding: 12px 28px; border-radius: 8px; border: 1px dashed #94a3b8;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject,
        text,
        html,
      });
    } catch (emailErr) {
      // Clear the OTP so user can retry immediately
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('[ForgotPassword] Email send failed:', emailErr.message);
      const error = new Error(
        'Failed to send OTP email. Please check the SMTP configuration or try again later.'
      );
      error.statusCode = 500;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email address',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+resetPasswordOtp +resetPasswordExpire');

    if (!user) {
      const error = new Error('No account found with this email address');
      error.statusCode = 404;
      throw error;
    }

    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== otp.trim() ||
      !user.resetPasswordExpire ||
      user.resetPasswordExpire < new Date()
    ) {
      const error = new Error('Invalid or expired OTP. Please request a new one.');
      error.statusCode = 400;
      throw error;
    }

    // Set new password (triggers pre('save') bcrypt hashing)
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  signup,
  register,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
