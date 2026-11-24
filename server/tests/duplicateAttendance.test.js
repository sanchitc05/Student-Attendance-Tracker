process.env.JWT_SECRET = 'test_secret_for_jest_suite_minimum_32_chars';

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const { tokens, mockUsers, createMockId } = require('./testHelper');

jest.mock('../models/User');
jest.mock('../models/Subject');
jest.mock('../models/Attendance');

describe('Duplicate Attendance Protection Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validSubjectId = createMockId();
  const validStudentId = createMockId();
  const testDate = '2026-11-20';

  it('should reject duplicate attendance marking on same subject and date with 409 Conflict', async () => {
    User.findById.mockResolvedValue(mockUsers.teacher);

    // Subject exists and is assigned to this teacher
    Subject.findById.mockResolvedValue({
      _id: validSubjectId,
      name: 'Operating Systems',
      code: 'CS401',
      teacher: mockUsers.teacher._id,
      students: [validStudentId],
    });

    // An existing attendance document is found for this subject and normalized date
    Attendance.findOne.mockResolvedValue({
      _id: createMockId(),
      subject: validSubjectId,
      date: new Date(testDate),
    });

    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({
        subject: validSubjectId,
        date: testDate,
        records: [{ student: validStudentId, status: 'present' }],
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already (marked|been recorded)/i);
  });

  it('should handle MongoDB E11000 duplicate compound index error as 409 Conflict', async () => {
    User.findById.mockResolvedValue(mockUsers.teacher);

    Subject.findById.mockResolvedValue({
      _id: validSubjectId,
      name: 'Operating Systems',
      teacher: mockUsers.teacher._id,
      students: [validStudentId],
    });

    // In a race condition, findOne might miss, but Attendance.create throws E11000
    Attendance.findOne.mockResolvedValue(null);
    const mongoDuplicateError = new Error('Duplicate key error');
    mongoDuplicateError.code = 11000;
    mongoDuplicateError.keyPattern = { subject: 1, date: 1 };
    Attendance.create.mockRejectedValue(mongoDuplicateError);

    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({
        subject: validSubjectId,
        date: testDate,
        records: [{ student: validStudentId, status: 'present' }],
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already (marked|been recorded)/i);
  });

  it('should reject marking attendance for a future date with 400 Bad Request', async () => {
    User.findById.mockResolvedValue(mockUsers.teacher);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const futureDateString = futureDate.toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({
        subject: validSubjectId,
        date: futureDateString,
        records: [{ student: validStudentId, status: 'present' }],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cannot mark attendance for a future date/i);
  });
});
