const mongoose = require('mongoose');

const productivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    enum: ['study', 'teaching', 'admin'],
    required: [true, 'Type is required']
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  activity: {
    type: String,
    required: [true, 'Activity description is required']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Add index for efficient querying
productivityLogSchema.index({ user: 1, startTime: -1 });
productivityLogSchema.index({ module: 1, startTime: -1 });

module.exports = mongoose.model('ProductivityLog', productivityLogSchema); 