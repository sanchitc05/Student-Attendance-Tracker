const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Subject = require('./models/Subject');

dotenv.config();

const seedSampleData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in server/.env');
    }

    await connectDB();
    console.log('MongoDB connected for sample seeding...');

    // Clear existing non-admin users and subjects
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Subject.deleteMany({});

    // Seed Teachers
    const alan = await User.create({
      name: 'Dr. Alan Turing',
      email: 'alan@college.edu',
      password: 'Password@123',
      role: 'teacher',
      department: 'Computer Science',
    });

    const grace = await User.create({
      name: 'Dr. Grace Hopper',
      email: 'grace@college.edu',
      password: 'Password@123',
      role: 'teacher',
      department: 'Information Technology',
    });

    // Seed Students
    const student1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@college.edu',
      password: 'Password@123',
      role: 'student',
      rollNo: 'CS-101',
      semester: 4,
      department: 'Computer Science',
    });

    const student2 = await User.create({
      name: 'Bob Smith',
      email: 'bob@college.edu',
      password: 'Password@123',
      role: 'student',
      rollNo: 'CS-102',
      semester: 4,
      department: 'Computer Science',
    });

    const student3 = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@college.edu',
      password: 'Password@123',
      role: 'student',
      rollNo: 'IT-201',
      semester: 4,
      department: 'Information Technology',
    });

    // Seed Subjects with enrollments
    await Subject.create({
      name: 'Data Structures and Algorithms',
      code: 'CS401',
      semester: 4,
      teacher: alan._id,
      students: [student1._id, student2._id],
    });

    await Subject.create({
      name: 'Operating Systems',
      code: 'CS402',
      semester: 4,
      teacher: grace._id,
      students: [student1._id, student2._id, student3._id],
    });

    console.log('Sample teachers, students, and subjects seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Sample seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedSampleData();
