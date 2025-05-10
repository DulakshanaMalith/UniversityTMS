require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const resetStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Delete existing student if exists
    await User.deleteOne({ username: 'CS2024001' });

    // Create new student with plain password
    // The User model's pre-save middleware will hash it
    const student = await User.create({
      username: 'CS2024001',
      password: 'student123',  // Plain password, will be hashed by User model
      email: 'student1@test.com',
      name: 'Test Student',
      role: 'student'
    });

    console.log('Student account reset successfully');
    console.log('Login credentials:');
    console.log('Username:', student.username);
    console.log('Password: student123');
    console.log('Role: student');

    // Verify the student exists
    const savedStudent = await User.findOne({ username: 'CS2024001' }).select('+password');
    if (savedStudent) {
      console.log('Student saved successfully');
      const isMatch = await bcrypt.compare('student123', savedStudent.password);
      console.log('Password verification:', isMatch ? 'Success' : 'Failed');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetStudent();
