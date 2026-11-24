const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const User = require('../models/User');

const createSubject = async (req, res, next) => {
  try {
    const { name, code, semester, teacher, students } = req.body;

    if (!name || !code || !semester) {
      const error = new Error('Subject name, code, and semester are required');
      error.statusCode = 400;
      throw error;
    }

    const existing = await Subject.findOne({ code: code.toUpperCase() });
    if (existing) {
      const error = new Error(`Subject with code '${code.toUpperCase()}' already exists`);
      error.statusCode = 409;
      throw error;
    }

    if (teacher) {
      if (!mongoose.Types.ObjectId.isValid(teacher)) {
        const error = new Error('Invalid teacher ID');
        error.statusCode = 400;
        throw error;
      }
      const teacherUser = await User.findOne({ _id: teacher, role: 'teacher' });
      if (!teacherUser) {
        const error = new Error('Teacher not found or user is not a teacher');
        error.statusCode = 404;
        throw error;
      }
    }

    if (students && Array.isArray(students)) {
      for (const studentId of students) {
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
          const error = new Error(`Invalid student ID: ${studentId}`);
          error.statusCode = 400;
          throw error;
        }
      }
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      semester: Number(semester),
      teacher: teacher || null,
      students: students || [],
    });

    const populated = await Subject.findById(subject._id)
      .populate('teacher', 'name email department')
      .populate('students', 'name email rollNo semester');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find()
      .populate('teacher', 'name email department')
      .populate('students', 'name email rollNo semester')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Subjects retrieved successfully',
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

const getMySubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ teacher: req.user._id })
      .populate('students', 'name email rollNo semester department')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: 'Teacher subjects retrieved successfully',
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, semester } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid subject ID');
      error.statusCode = 400;
      throw error;
    }

    const subject = await Subject.findById(id);
    if (!subject) {
      const error = new Error('Subject not found');
      error.statusCode = 404;
      throw error;
    }

    if (code && code.toUpperCase() !== subject.code) {
      const codeExists = await Subject.findOne({ code: code.toUpperCase() });
      if (codeExists) {
        const error = new Error(`Subject with code '${code.toUpperCase()}' already exists`);
        error.statusCode = 409;
        throw error;
      }
      subject.code = code.toUpperCase();
    }

    if (name) subject.name = name;
    if (semester !== undefined) subject.semester = Number(semester);

    await subject.save();

    const populated = await Subject.findById(id)
      .populate('teacher', 'name email department')
      .populate('students', 'name email rollNo semester');

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

const enrollSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teacher, students } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid subject ID');
      error.statusCode = 400;
      throw error;
    }

    const subject = await Subject.findById(id);
    if (!subject) {
      const error = new Error('Subject not found');
      error.statusCode = 404;
      throw error;
    }

    if (teacher !== undefined) {
      if (teacher !== null && teacher !== '') {
        if (!mongoose.Types.ObjectId.isValid(teacher)) {
          const error = new Error('Invalid teacher ID');
          error.statusCode = 400;
          throw error;
        }
        const teacherExists = await User.findOne({ _id: teacher, role: 'teacher' });
        if (!teacherExists) {
          const error = new Error('Teacher not found or user role is not teacher');
          error.statusCode = 404;
          throw error;
        }
        subject.teacher = teacher;
      } else {
        subject.teacher = null;
      }
    }

    if (students !== undefined) {
      if (!Array.isArray(students)) {
        const error = new Error('Students must be an array of IDs');
        error.statusCode = 400;
        throw error;
      }

      for (const studentId of students) {
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
          const error = new Error(`Invalid student ID: ${studentId}`);
          error.statusCode = 400;
          throw error;
        }
      }

      const validCount = await User.countDocuments({
        _id: { $in: students },
        role: 'student',
      });

      if (validCount !== students.length) {
        const error = new Error('One or more IDs in students array are invalid or not student accounts');
        error.statusCode = 400;
        throw error;
      }

      subject.students = students;
    }

    await subject.save();

    const populated = await Subject.findById(id)
      .populate('teacher', 'name email department')
      .populate('students', 'name email rollNo semester');

    res.status(200).json({
      success: true,
      message: 'Enrollments updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid subject ID');
      error.statusCode = 400;
      throw error;
    }

    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      const error = new Error('Subject not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getMySubjects,
  updateSubject,
  enrollSubject,
  deleteSubject,
};
