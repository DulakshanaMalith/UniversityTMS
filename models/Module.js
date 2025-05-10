const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  module_name: {
    type: String,
    required: true,
    unique: true
  },
  credit_hours: {
    type: Number,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  is_lab: {
    type: Boolean,
    default: false
  },
  lecturers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecturer',
    required: true
  }],
  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
