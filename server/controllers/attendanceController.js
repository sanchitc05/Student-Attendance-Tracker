const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

const normalizeDate = (inputDate) => {
  const d = new Date(inputDate);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

const isFutureDate = (normalizedDate) => {
  const now = new Date();
  const todayEndUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  );
  return normalizedDate > todayEndUTC;
};

// @desc    Mark attendance for a subject
// @route   POST /api/attendance
// @access  Private/Teacher
const markAttendance = async (req, res, next) => {
  try {
    const { subject: subjectId, date, records } = req.body;

    if (!subjectId || !date || !records || !Array.isArray(records)) {
      const error = new Error('Subject, date, and records array are required');
      error.statusCode = 400;
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      const error = new Error('Invalid subject ID');
      error.statusCode = 400;
      throw error;
    }

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      const error = new Error('Invalid date format provided');
      error.statusCode = 400;
      throw error;
    }

    if (isFutureDate(normalizedDate)) {
      const error = new Error('Cannot mark attendance for a future date');
      error.statusCode = 400;
      throw error;
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      const error = new Error('Subject not found');
      error.statusCode = 404;
      throw error;
    }

    if (!subject.teacher || subject.teacher.toString() !== req.user._id.toString()) {
      const error = new Error('You are not authorized to mark attendance for this subject');
      error.statusCode = 403;
      throw error;
    }

    // Validate enrolled students
    const enrolledIds = new Set(subject.students.map((s) => s.toString()));
    for (const record of records) {
      if (!enrolledIds.has(record.student.toString())) {
        const error = new Error(
          `Student with ID ${record.student} is not enrolled in this subject`
        );
        error.statusCode = 400;
        throw error;
      }
      if (!['present', 'absent'].includes(record.status)) {
        const error = new Error('Status must be either present or absent');
        error.statusCode = 400;
        throw error;
      }
    }

    // Duplicate check at API level
    const existing = await Attendance.findOne({
      subject: subject._id,
      date: normalizedDate,
    });

    if (existing) {
      const formattedDate = date.substring(0, 10);
      const error = new Error(
        `Attendance already marked for this subject on ${formattedDate}`
      );
      error.statusCode = 409;
      throw error;
    }

    const attendance = await Attendance.create({
      subject: subject._id,
      date: normalizedDate,
      records,
      markedBy: req.user._id,
    });

    const populated = await Attendance.findById(attendance._id)
      .populate('subject', 'name code semester')
      .populate('records.student', 'name email rollNo');

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = 'Attendance already marked for this subject on this date';
    }
    next(error);
  }
};

// @desc    Update/correct attendance
// @route   PUT /api/attendance/:id
// @access  Private/Teacher
const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { records } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid attendance ID');
      error.statusCode = 400;
      throw error;
    }

    if (!records || !Array.isArray(records)) {
      const error = new Error('Records array is required');
      error.statusCode = 400;
      throw error;
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      const error = new Error('Attendance record not found');
      error.statusCode = 404;
      throw error;
    }

    const subject = await Subject.findById(attendance.subject);
    if (!subject) {
      const error = new Error('Associated subject not found');
      error.statusCode = 404;
      throw error;
    }

    if (!subject.teacher || subject.teacher.toString() !== req.user._id.toString()) {
      const error = new Error('You are not authorized to update attendance for this subject');
      error.statusCode = 403;
      throw error;
    }

    const enrolledIds = new Set(subject.students.map((s) => s.toString()));
    for (const record of records) {
      if (!enrolledIds.has(record.student.toString())) {
        const error = new Error(
          `Student with ID ${record.student} is not enrolled in this subject`
        );
        error.statusCode = 400;
        throw error;
      }
      if (!['present', 'absent'].includes(record.status)) {
        const error = new Error('Status must be either present or absent');
        error.statusCode = 400;
        throw error;
      }
    }

    attendance.records = records;
    attendance.markedBy = req.user._id;
    await attendance.save();

    const populated = await Attendance.findById(attendance._id)
      .populate('subject', 'name code semester')
      .populate('records.student', 'name email rollNo');

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get class attendance report for a subject
// @route   GET /api/attendance/subject/:id
// @access  Private/Teacher/Admin
const getClassReport = async (req, res, next) => {
  try {
    const { id: subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      const error = new Error('Invalid subject ID');
      error.statusCode = 400;
      throw error;
    }

    const subject = await Subject.findById(subjectId)
      .populate('teacher', 'name email department')
      .populate('students', 'name email rollNo semester department');

    if (!subject) {
      const error = new Error('Subject not found');
      error.statusCode = 404;
      throw error;
    }

    if (
      req.user.role === 'teacher' &&
      (!subject.teacher || subject.teacher._id.toString() !== req.user._id.toString())
    ) {
      const error = new Error('You are not authorized to view reports for this subject');
      error.statusCode = 403;
      throw error;
    }

    const totalClasses = await Attendance.countDocuments({ subject: subject._id });

    // Aggregation pipeline to count presents per student for this subject
    const reportData = await Subject.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(subjectId) } },
      { $unwind: '$students' },
      {
        $lookup: {
          from: 'users',
          localField: 'students',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $lookup: {
          from: 'attendances',
          let: { subjId: '$_id', studId: '$students' },
          pipeline: [
            { $match: { $expr: { $eq: ['$subject', '$$subjId'] } } },
            { $unwind: '$records' },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$records.student', '$$studId'] },
                    { $eq: ['$records.status', 'present'] },
                  ],
                },
              },
            },
          ],
          as: 'presentRecords',
        },
      },
      {
        $project: {
          _id: '$studentInfo._id',
          studentId: '$studentInfo._id',
          name: '$studentInfo.name',
          email: '$studentInfo.email',
          rollNo: '$studentInfo.rollNo',
          semester: '$studentInfo.semester',
          department: '$studentInfo.department',
          presentCount: { $size: '$presentRecords' },
        },
      },
      { $sort: { rollNo: 1, name: 1 } },
    ]);

    const studentsReport = reportData.map((item) => {
      const percentage =
        totalClasses > 0
          ? Number(((item.presentCount / totalClasses) * 100).toFixed(1))
          : 0;

      return {
        ...item,
        totalClasses,
        percentage,
        isDefaulter: totalClasses > 0 && percentage < 75,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Class report generated successfully',
      data: {
        subject: {
          id: subject._id,
          name: subject.name,
          code: subject.code,
          semester: subject.semester,
          teacher: subject.teacher,
        },
        totalClasses,
        students: studentsReport,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance record by subject and date
// @route   GET /api/attendance/by-date
// @access  Private/Teacher
const getAttendanceByDate = async (req, res, next) => {
  try {
    const { subject: subjectId, date } = req.query;

    if (!subjectId || !date) {
      const error = new Error('Subject ID and date query parameters are required');
      error.statusCode = 400;
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      const error = new Error('Invalid subject ID');
      error.statusCode = 400;
      throw error;
    }

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      const error = new Error('Invalid date format');
      error.statusCode = 400;
      throw error;
    }

    const attendance = await Attendance.findOne({
      subject: subjectId,
      date: normalizedDate,
    }).populate('records.student', 'name email rollNo');

    res.status(200).json({
      success: true,
      message: attendance ? 'Attendance record found' : 'No attendance record for this date',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  updateAttendance,
  getClassReport,
  getAttendanceByDate,
};
