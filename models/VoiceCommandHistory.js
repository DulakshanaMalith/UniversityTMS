const mongoose = require('mongoose');

const voiceCommandHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  command: {
    type: String,
    required: [true, 'Command is required']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  },
  response: {
    type: String
  },
  context: {
    type: Object
  }
}, {
  timestamps: true
});

// Add index for efficient querying
voiceCommandHistorySchema.index({ user: 1, timestamp: -1 });
voiceCommandHistorySchema.index({ command: 1 });

module.exports = mongoose.model('VoiceCommandHistory', voiceCommandHistorySchema); 