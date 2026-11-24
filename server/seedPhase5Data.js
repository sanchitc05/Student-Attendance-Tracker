const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');

dotenv.config();

const seedPhase5Data = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in server/.env');
    }

    await connectDB();
    console.log('MongoDB connected for Phase 5 sample data seeding...');

    // Clear existing attendance and subjects (preserve admin)
    await Attendance.deleteMany({});
    await Subject.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } });

    // 1. Teachers
    const teacherAlan = await User.create({
      name: 'Dr. Alan Turing',
      email: 'alan@college.edu',
      password: 'Password@123',
      role: 'teacher',
      department: 'Computer Science',
    });

    const teacherGrace = await User.create({
      name: 'Dr. Grace Hopper',
      email: 'grace@college.edu',
      password: 'Password@123',
      role: 'teacher',
      department: 'Information Technology',
    });

    // 2. Students
    const studentAlice = await User.create({
      name: 'Alice Johnson',
      email: 'alice@college.edu',
      password: 'Password@123',
      role: 'student',
      rollNo: 'CS-101',
      semester: 4,
      department: 'Computer Science',
    });

    const studentBob = await User.create({
      name: 'Bob Smith',
      email: 'bob@college.edu',
      password: 'Password@123',
      role: 'student',
      rollNo: 'CS-102',
      semester: 4,
      department: 'Computer Science',
    });

    // 3. Subjects representing the 3 requested scenarios:
    // Subject 1: Exactly 75% attendance scenario (4 classes, 3 attended)
    const subjectExact75 = await Subject.create({
      name: 'Data Structures and Algorithms',
      code: 'CS401',
      semester: 4,
      teacher: teacherAlan._id,
      students: [studentAlice._id, studentBob._id],
    });

    // Subject 2: Below 75% attendance scenario (5 classes, 3 attended = 60.0%)
    const subjectBelow75 = await Subject.create({
      name: 'Operating Systems',
      code: 'CS402',
      semester: 4,
      teacher: teacherGrace._id,
      students: [studentAlice._id, studentBob._id],
    });

    // Subject 3: Zero classes held scenario (0 classes held)
    const subjectZeroClasses = await Subject.create({
      name: 'Database Management Systems',
      code: 'CS403',
      semester: 4,
      teacher: teacherAlan._id,
      students: [studentAlice._id, studentBob._id],
    });

    // 4. Attendance records for Subject 1 (CS401 - Exactly 75%: 4 classes, 3 present, 1 absent)
    const cs401Dates = [
      { date: new Date('2026-11-10T00:00:00.000Z'), status: 'present' },
      { date: new Date('2026-11-12T00:00:00.000Z'), status: 'present' },
      { date: new Date('2026-11-15T00:00:00.000Z'), status: 'absent' },
      { date: new Date('2026-11-18T00:00:00.000Z'), status: 'present' },
    ];

    for (const item of cs401Dates) {
      await Attendance.create({
        subject: subjectExact75._id,
        date: item.date,
        records: [
          { student: studentAlice._id, status: item.status },
          { student: studentBob._id, status: 'present' },
        ],
        markedBy: teacherAlan._id,
      });
    }

    // 5. Attendance records for Subject 2 (CS402 - Below 75%: 5 classes, 3 present, 2 absent = 60%)
    const cs402Dates = [
      { date: new Date('2026-11-08T00:00:00.000Z'), status: 'present' },
      { date: new Date('2026-11-11T00:00:00.000Z'), status: 'absent' },
      { date: new Date('2026-11-14T00:00:00.000Z'), status: 'present' },
      { date: new Date('2026-11-17T00:00:00.000Z'), status: 'absent' },
      { date: new Date('2026-11-20T00:00:00.000Z'), status: 'present' },
    ];

    for (const item of cs402Dates) {
      await Attendance.create({
        subject: subjectBelow75._id,
        date: item.date,
        records: [
          { student: studentAlice._id, status: item.status },
          { student: studentBob._id, status: 'present' },
        ],
        markedBy: teacherGrace._id,
      });
    }

    console.log('----------------------------------------------------');
    console.log('Phase 5 Test Scenarios Seeded Successfully:');
    console.log('1. CS401: 4 classes, 3 attended -> Exactly 75.0% (can miss 0)');
    console.log('2. CS402: 5 classes, 3 attended -> 60.0% (needs 3 consecutive)');
    console.log('3. CS403: 0 classes held        -> Zero classes case (safe)');
    console.log('');
    console.log('Login credentials:');
    console.log('Student: alice@college.edu / Password@123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error(`Phase 5 Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedPhase5Data();
