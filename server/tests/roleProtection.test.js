process.env.JWT_SECRET = 'test_secret_for_jest_suite_minimum_32_chars';

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { tokens, mockUsers } = require('./testHelper');

jest.mock('../models/User');
jest.mock('../models/Subject');

describe('Role Protection Middleware Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unauthenticated Access (No Token)', () => {
    it('should return 401 Unauthorized when accessing /api/auth/me without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('should return 401 when token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.value');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Role-Based Authorization (RBAC)', () => {
    it('should return 403 Forbidden when Student attempts to access Admin route', async () => {
      User.findById.mockResolvedValue(mockUsers.student);

      const res = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${tokens.student}`)
        .send({ name: 'Data Structures', code: 'CS201', semester: 3 });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not allowed to access this route/i);
    });

    it('should return 403 Forbidden when Teacher attempts to access Admin route', async () => {
      User.findById.mockResolvedValue(mockUsers.teacher);

      const res = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${tokens.teacher}`)
        .send({ name: 'Computer Networks', code: 'CS301', semester: 5 });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 Forbidden when Student attempts to access Teacher-only route', async () => {
      User.findById.mockResolvedValue(mockUsers.student);

      const res = await request(app)
        .get('/api/subjects/my')
        .set('Authorization', `Bearer ${tokens.student}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow Teacher to access Teacher-only route /api/subjects/my', async () => {
      User.findById.mockResolvedValue(mockUsers.teacher);
      Subject.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([
            { _id: 'sub1', name: 'Math', code: 'MATH101', semester: 1 },
          ]),
        }),
      });

      const res = await request(app)
        .get('/api/subjects/my')
        .set('Authorization', `Bearer ${tokens.teacher}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
