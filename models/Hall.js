const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  hall_name: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['lab', 'lecture', 'tutorial'],
    required: true
  },
  building: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  facilities: {
    type: [String],
    default: []
  },
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

module.exports = mongoose.model('Hall', hallSchema);
