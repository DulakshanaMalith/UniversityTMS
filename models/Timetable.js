const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch is required']
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module is required']
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecturer',
    required: [true, 'Lecturer is required']
  },
  hall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: [true, 'Hall is required']
  },
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: {
      values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      message: '{VALUE} is not a valid day'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    enum: {
      values: ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'],
      message: '{VALUE} is not a valid time slot'
    }
  },
  group: {
    type: Number,
    required: [true, 'Group is required'],
    min: [1, 'Group number must be at least 1']
  },
  week: {
    type: Number,
    required: [true, 'Week is required'],
    min: [1, 'Week must be at least 1'],
    max: [16, 'Week cannot be more than 16']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Drop all indexes and recreate them
timetableSchema.statics.recreateIndexes = async function() {
  try {
    await this.collection.dropIndexes();
  } catch (error) {
    // Ignore if no indexes exist
  }

  await this.collection.createIndex({ 
    batch: 1, 
    day: 1, 
    timeSlot: 1, 
    group: 1, 
    week: 1 
  }, { 
    unique: true,
    name: 'unique_batch_slot'
  });

  await this.collection.createIndex({ 
    lecturer: 1, 
    day: 1, 
    timeSlot: 1, 
    week: 1 
  }, { 
    unique: true,
    name: 'unique_lecturer_slot'
  });

  await this.collection.createIndex({ 
    hall: 1, 
    day: 1, 
    timeSlot: 1, 
    week: 1 
  }, { 
    unique: true,
    name: 'unique_hall_slot'
  });
};

// Pre-save middleware to validate conflicts
timetableSchema.pre('save', async function(next) {
  const doc = this;
  
  // Skip validation if day or timeSlot hasn't changed
  if (!doc.isModified('day') && !doc.isModified('timeSlot')) {
    return next();
  }

  const conflict = await mongoose.model('Timetable').findOne({
    _id: { $ne: doc._id },
    day: doc.day,
    timeSlot: doc.timeSlot,
    week: doc.week,
    $or: [
      { batch: doc.batch, group: doc.group },
      { lecturer: doc.lecturer },
      { hall: doc.hall }
    ]
  });

  if (conflict) {
    const err = new Error('Time slot conflict detected with another entry');
    return next(err);
  }

  next();
});

const Timetable = mongoose.model('Timetable', timetableSchema);

// Recreate indexes on model initialization
Timetable.recreateIndexes().catch(console.error);

module.exports = Timetable;
