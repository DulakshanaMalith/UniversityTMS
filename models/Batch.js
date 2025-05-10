const mongoose = require('mongoose');
const crypto = require('crypto');

const batchSchema = new mongoose.Schema({
  batch_name: {
    type: String,
    required: true,
    unique: true
  },
  batch_code: {
    type: String,
    required: true,
    unique: true
  },
  registration_code: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(4).toString('hex').toUpperCase()
  },
  registration_open: {
    type: Boolean,
    default: true
  },
  department: {
    type: String,
    required: true
  },
  academic_year: {
    type: Number,
    required: true
  },
  num_of_students: {
    type: Number,
    required: true
  },
  registered_students: {
    type: Number,
    default: 0
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  weekend_or_weekday: {
    type: String,
    enum: ['Weekend', 'Weekday'],
    required: true
  },
  group_count: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add method to check if batch is full
batchSchema.methods.isFull = function() {
  return this.registered_students >= this.num_of_students;
};

// Add method to increment registered students count
batchSchema.methods.incrementRegisteredStudents = async function() {
  if (this.isFull()) {
    throw new Error('Batch is already full');
  }
  this.registered_students += 1;
  await this.save();
};

module.exports = mongoose.model('Batch', batchSchema);
