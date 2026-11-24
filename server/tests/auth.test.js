process.env.JWT_SECRET = 'test_secret_for_jest_suite_minimum_32_chars';

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

jest.mock('../models/User');
jest.mock('../config/email', () => jest.fn().mockResolvedValue({ messageId: 'test-id' }));

describe('Authentication API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 and a JWT token for valid credentials', async () => {
      const mockUser = {
        _id: '64b1f2e1a5c4d3b2a1e0f9c8',
        name: 'Jane Doe',
        email: 'jane@college.edu',
        role: 'student',
        rollNo: 'CS102',
        semester: 4,
        department: 'CSE',
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@college.edu', password: 'Password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@college.edu');
      expect(res.body.data.user.password).toBeUndefined(); // Password must never leak
    });

    it('should return 401 when password does not match', async () => {
      const mockUser = {
        _id: '64b1f2e1a5c4d3b2a1e0f9c8',
        email: 'jane@college.edu',
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@college.edu', password: 'WrongPassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should return 401 when user does not exist', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@college.edu', password: 'Password123' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/signup', () => {
    it('should return 201 and register a new student', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: '64b1f2e1a5c4d3b2a1e0f9d9',
        name: 'New Student',
        email: 'newstudent@college.edu',
        role: 'student',
        rollNo: 'CS201',
        semester: 3,
        department: 'CSE',
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'New Student',
          email: 'newstudent@college.edu',
          password: 'Password123',
          role: 'student',
          rollNo: 'CS201',
          semester: 3,
          department: 'CSE',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('student');
    });

    it('should return 400 when role is admin (self-registration blocked for admin)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Hacker',
          email: 'hacker@college.edu',
          password: 'Password123',
          role: 'admin',
          department: 'Admin',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when student is missing roll number', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Lazy Student',
          email: 'lazy@college.edu',
          password: 'Password123',
          role: 'student',
          semester: 2,
          department: 'CSE',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 when email already exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'existing-user-id' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Duplicate User',
          email: 'duplicate@college.edu',
          password: 'Password123',
          role: 'teacher',
          department: 'ECE',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered/i);
    });
  });
});
