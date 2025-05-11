const mongoose = require('mongoose');

const AttendanceSessionSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  group: {
    type: Number,
    required: true
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date,
  responses: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      markedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('AttendanceSession', AttendanceSessionSchema); 