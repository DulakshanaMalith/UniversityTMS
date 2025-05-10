const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Lecturer = require('../models/Lecturer');

const setupTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create test lecturer user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const user = await User.create({
      name: 'Test Lecturer',
      email: 'lecturer@test.com',
      password: hashedPassword,
      role: 'lecturer'
    });

    // Create lecturer profile
    await Lecturer.create({
      user: user._id,
      name: 'Test Lecturer',
      email: 'lecturer@test.com',
      department: 'Computer Science'
    });

    console.log('Test data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test data:', error);
    process.exit(1);
  }
};

setupTestData();
