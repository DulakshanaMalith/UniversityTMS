require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const checkStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Find student
    const student = await User.findOne({ username: 'CS2024001' }).select('+password');
    
    if (!student) {
      console.log('Student not found');
      process.exit(1);
    }

    console.log('Student found:');
    console.log('Username:', student.username);
    console.log('Name:', student.name);
    console.log('Role:', student.role);
    
    // Check password
    const isMatch = await bcrypt.compare('student123', student.password);
    console.log('Password correct:', isMatch);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkStudent();
