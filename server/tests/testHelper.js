const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_for_jest_suite_minimum_32_chars';

const generateTestToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

const createMockId = () => new mongoose.Types.ObjectId().toString();

const mockUsers = {
  admin: {
    _id: createMockId(),
    name: 'Admin User',
    email: 'admin@college.edu',
    role: 'admin',
  },
  teacher: {
    _id: createMockId(),
    name: 'Teacher User',
    email: 'teacher@college.edu',
    role: 'teacher',
  },
  student: {
    _id: createMockId(),
    name: 'Student User',
    email: 'student@college.edu',
    role: 'student',
    rollNo: 'CS101',
    semester: 4,
    department: 'CSE',
  },
};

const tokens = {
  admin: generateTestToken({ id: mockUsers.admin._id, role: 'admin' }),
  teacher: generateTestToken({ id: mockUsers.teacher._id, role: 'teacher' }),
  student: generateTestToken({ id: mockUsers.student._id, role: 'student' }),
};

module.exports = {
  JWT_SECRET,
  generateTestToken,
  createMockId,
  mockUsers,
  tokens,
};
