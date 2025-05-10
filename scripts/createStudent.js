require('dotenv').config();
const mongoose = require('mongoose');
const Batch = require('../models/Batch');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Find the batch with our registration code
    const batch = await Batch.findOne({ registration_code: 'D56A6EF1' });
    if (!batch) {
      throw new Error('Batch not found');
    }

    // Check if batch is full
    if (batch.registered_students >= batch.num_of_students) {
      throw new Error('Batch is full');
    }

    // Create student
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('student123', salt);

    const student = await User.create({
      username: 'CS2024001',
      password: hashedPassword,
      email: 'student1@test.com',
      name: 'Test Student',
      role: 'student',
      batch: batch._id
    });

    // Increment registered students count
    batch.registered_students += 1;
    await batch.save();

    console.log('Student created successfully');
    console.log('Login credentials:');
    console.log('Username (Student ID):', student.username);
    console.log('Password: student123');
    console.log('Role: student');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createStudent();
