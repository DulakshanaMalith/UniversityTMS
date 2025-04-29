const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Batch = require('../models/Batch');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Lecturer = require('../models/Lecturer');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Login user
exports.login = asyncHandler(async (req, res, next) => {
  const { username, password, email, role, name } = req.body;

  // Handle lecturer login
  if (role === 'lecturer') {
    if (!name || !email) {
      return next(new ErrorResponse('Please provide name and email', 400));
    }

    console.log('Attempting lecturer login with:', { name, email });

    // Case-insensitive search for lecturer
    const lecturer = await Lecturer.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    console.log('Found lecturer:', lecturer);

    if (!lecturer) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const token = generateToken(lecturer._id);
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        role: 'lecturer',
        department: lecturer.department,
        rank: lecturer.rank
      }
    });
  }

  // Handle student and admin login
  if (!username || !password) {
    return next(new ErrorResponse('Please provide username and password', 400));
  }

  const user = await User.findOne({ username }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Get current logged in user
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
});

// Verify registration code
exports.verifyRegistrationCode = asyncHandler(async (req, res, next) => {
  const { code } = req.params;

  const batch = await Batch.findOne({ 
    registration_code: code,
    registration_open: true
  });

  if (!batch) {
    return next(new ErrorResponse('Invalid or expired registration code', 400));
  }

  if (batch.isFull()) {
    return next(new ErrorResponse('Batch is full', 400));
  }

  res.status(200).json({
    success: true,
    batch: {
      _id: batch._id,
      batch_name: batch.batch_name,
      department: batch.department,
      semester: batch.semester
    }
  });
});

// Register student
exports.registerStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, student_id, batch_id } = req.body;

  // Validate required fields
  if (!name || !email || !password || !student_id || !batch_id) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Check if batch exists and is open for registration
  const batch = await Batch.findById(batch_id);
  if (!batch || !batch.registration_open) {
    return next(new ErrorResponse('Invalid batch or registration closed', 400));
  }

  // Check if batch is full
  if (batch.isFull()) {
    return next(new ErrorResponse('Batch is full', 400));
  }

  // Check if email or student ID already exists
  const existingUser = await User.findOne({
    $or: [
      { email },
      { username: student_id }
    ]
  });

  if (existingUser) {
    return next(new ErrorResponse('Email or Student ID already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    username: student_id,
    role: 'student',
    batch: batch_id
  });

  // Increment registered students count
  if (!batch.incrementRegisteredStudents()) {
    await User.findByIdAndDelete(user._id);
    return next(new ErrorResponse('Batch is full', 400));
  }
  await batch.save();

  res.status(201).json({
    success: true,
    message: 'Registration successful! You can now login with your Student ID and password.'
  });
});
