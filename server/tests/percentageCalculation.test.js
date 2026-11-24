process.env.JWT_SECRET = 'test_secret_for_jest_suite_minimum_32_chars';

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { tokens, mockUsers, createMockId } = require('./testHelper');

jest.mock('../models/User');
jest.mock('../models/Subject');

// Helper function implementing the production threshold calculation formulas
const calculateThresholds = (totalClasses, classesAttended) => {
  if (totalClasses <= 0) {
    return { percentage: 0, classesNeeded: 0, classesCanMiss: 0 };
  }

  const percentage = Number(((classesAttended / totalClasses) * 100).toFixed(1));

  if (percentage < 75) {
    // Formula to reach 75%:
    // (classesAttended + x) / (totalClasses + x) >= 0.75
    // x >= 3 * totalClasses - 4 * classesAttended
    const classesNeeded = Math.max(0, 3 * totalClasses - 4 * classesAttended);
    return { percentage, classesNeeded, classesCanMiss: 0 };
  } else {
    // Formula to determine how many classes can still be missed:
    // classesAttended / (totalClasses + y) >= 0.75
    // y <= (4 * classesAttended - 3 * totalClasses) / 3
    const classesCanMiss = Math.max(
      0,
      Math.floor((4 * classesAttended - 3 * totalClasses) / 3)
    );
    return { percentage, classesNeeded: 0, classesCanMiss };
  }
};

describe('Attendance Percentage & Threshold Calculation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mathematical Formula Unit Verification', () => {
    it('handles zero classes held without division by zero (edge case)', () => {
      const result = calculateThresholds(0, 0);
      expect(result.percentage).toBe(0);
      expect(result.classesNeeded).toBe(0);
      expect(result.classesCanMiss).toBe(0);
      expect(Number.isNaN(result.percentage)).toBe(false);
    });

    it('calculates exactly 75% attendance correctly', () => {
      // 6 attended out of 8 total = 75.0%
      const result = calculateThresholds(8, 6);
      expect(result.percentage).toBe(75.0);
      expect(result.classesNeeded).toBe(0);
      expect(result.classesCanMiss).toBe(0); // Cannot miss any class without dropping below 75%
    });

    it('calculates below 75% attendance and computes needed classes accurately', () => {
      // 2 attended out of 5 total = 40.0%
      // classesNeeded = 3 * 5 - 4 * 2 = 15 - 8 = 7 classes needed
      // Verification: (2 + 7) / (5 + 7) = 9 / 12 = 75.0%
      const result = calculateThresholds(5, 2);
      expect(result.percentage).toBe(40.0);
      expect(result.classesNeeded).toBe(7);
      expect(result.classesCanMiss).toBe(0);
    });

    it('calculates above 75% attendance and computes classes that can be missed safely', () => {
      // 9 attended out of 10 total = 90.0%
      // classesCanMiss = Math.floor((4*9 - 3*10) / 3) = Math.floor(6 / 3) = 2
      // Verification: 9 / (10 + 2) = 9 / 12 = 75.0%
      const result = calculateThresholds(10, 9);
      expect(result.percentage).toBe(90.0);
      expect(result.classesNeeded).toBe(0);
      expect(result.classesCanMiss).toBe(2);
    });

    it('calculates 100% attendance scenario correctly', () => {
      // 8 attended out of 8 total = 100.0%
      // classesCanMiss = Math.floor((32 - 24) / 3) = Math.floor(8 / 3) = 2
      // Verification: 8 / (8 + 2) = 8 / 10 = 80% (>= 75%)
      const result = calculateThresholds(8, 8);
      expect(result.percentage).toBe(100.0);
      expect(result.classesNeeded).toBe(0);
      expect(result.classesCanMiss).toBe(2);
    });
  });

  describe('GET /api/attendance/student/me Endpoint Response', () => {
    it('returns formatted subject report and overall attendance for authenticated student', async () => {
      User.findById.mockResolvedValue(mockUsers.student);

      const mockAggregatedSubjects = [
        {
          _id: createMockId(),
          name: 'Computer Networks',
          code: 'CS501',
          semester: 5,
          teacher: 'Prof. Smith',
          totalClasses: 8,
          classesAttended: 6,
          history: [],
        },
        {
          _id: createMockId(),
          name: 'Algorithms',
          code: 'CS502',
          semester: 5,
          teacher: 'Dr. Alan',
          totalClasses: 5,
          classesAttended: 2,
          history: [],
        },
      ];

      Subject.aggregate.mockResolvedValue(mockAggregatedSubjects);

      const res = await request(app)
        .get('/api/attendance/student/me')
        .set('Authorization', `Bearer ${tokens.student}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const { subjects, overall } = res.body.data;
      expect(subjects).toHaveLength(2);

      // Subject 1: Exactly 75%
      expect(subjects[0].code).toBe('CS501');
      expect(subjects[0].percentage).toBe(75.0);
      expect(subjects[0].isBelowThreshold).toBe(false);

      // Subject 2: Below 75% (40%)
      expect(subjects[1].code).toBe('CS502');
      expect(subjects[1].percentage).toBe(40.0);
      expect(subjects[1].isBelowThreshold).toBe(true);
      expect(subjects[1].classesNeeded).toBe(7);

      // Overall: (6 + 2) / (8 + 5) = 8 / 13 = 61.5%
      expect(overall.totalClasses).toBe(13);
      expect(overall.classesAttended).toBe(8);
      expect(overall.percentage).toBe(61.5);
      expect(overall.isBelowThreshold).toBe(true);
    });
  });
});
