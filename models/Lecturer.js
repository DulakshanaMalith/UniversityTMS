const mongoose = require('mongoose');

const lecturerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  specialization: [{
    type: String,
    required: true
  }],
  rank: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer'],
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  availability: {
    type: Map,
    of: [String],
    default: new Map([
      ['Monday', []],
      ['Tuesday', []],
      ['Wednesday', []],
      ['Thursday', []],
      ['Friday', []],
      ['Saturday', []],
      ['Sunday', []]
    ])
  }
}, { timestamps: true });

module.exports = mongoose.model('Lecturer', lecturerSchema);
