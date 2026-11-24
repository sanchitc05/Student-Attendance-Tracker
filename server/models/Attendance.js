const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      required: [true, 'Attendance status must be present or absent'],
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    records: [attendanceRecordSchema],
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Marked by user is required'],
    },
  },
  { timestamps: true }
);

// Unique compound index: One attendance document per subject per day
attendanceSchema.index({ subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
