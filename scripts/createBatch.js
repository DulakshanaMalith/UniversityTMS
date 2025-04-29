require('dotenv').config();
const mongoose = require('mongoose');
const Batch = require('../models/Batch');
const crypto = require('crypto');

const createBatch = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const batch = await Batch.create({
      batch_name: '2024 Spring Batch',
      batch_code: 'CSE24SP',
      department: 'Computer Science',
      academic_year: 2024,
      num_of_students: 30,
      semester: 1,
      weekend_or_weekday: 'Weekday',
      group_count: 1
    });

    console.log('Batch created successfully');
    console.log('Registration Code:', batch.registration_code);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createBatch();
