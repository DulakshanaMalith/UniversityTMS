const User = require('../models/User');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Timetable = require('../models/Timetable');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const studentController = {
  // @desc    Register a new student
  // @route   POST /api/student/register
  // @access  Public
  registerStudent: asyncHandler(async (req, res) => {
    try {
      const { name, email, password, batch_code } = req.body;

      // Validate required fields
      if (!name || !email || !password || !batch_code) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Check if batch code exists
      const batch = await Batch.findOne({ batch_code });
      if (!batch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid batch code'
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Generate username from email
      const username = email.split('@')[0];

      // Create user account
      const user = await User.create({
        username,
        name,
        email,
        password,
        role: 'student'
      });

      // Determine student's group based on current batch size
      const currentStudents = await Student.find({ batch: batch._id });
      const group = Math.floor(currentStudents.length / (batch.num_of_students / batch.group_count)) + 1;

      // Create student profile
      const student = await Student.create({
        user: user._id,
        name,
        email,
        batch: batch._id,
        batch_code,
        group
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! You can now log in.',
        data: {
          name: student.name,
          email: student.email,
          batch: batch.batch_name,
          group: student.group
        }
      });
    } catch (error) {
      logger.error('Student registration error:', error);
      
      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          details: validationErrors
        });
      }

      // Handle duplicate key errors
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error registering student',
        error: error.message
      });
    }
  }),

  // @desc    Verify registration code
  // @route   POST /api/student/verify-code
  // @access  Public
  verifyRegistrationCode: asyncHandler(async (req, res) => {
    const { batch_code } = req.body;

    if (!batch_code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a batch code'
      });
    }

    try {
      const batch = await Batch.findOne({ batch_code });
      if (!batch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid batch code'
        });
      }

      res.json({
        success: true,
        message: 'Valid batch code',
        data: {
          batch_name: batch.batch_name,
          batch_code: batch.batch_code
        }
      });
    } catch (error) {
      logger.error('Error verifying batch code:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying batch code'
      });
    }
  }),

  // @desc    Get student's batches
  // @route   GET /api/student/batches
  // @access  Private
  getBatches: asyncHandler(async (req, res) => {
    try {
      const student = await Student.findOne({ user: req.user._id })
        .populate('batch', 'batch_name batch_code group_count');

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      // Return batch info with student's group
      const batchData = {
        _id: student.batch._id,
        batch_name: student.batch.batch_name,
        batch_code: student.batch.batch_code,
        group_count: student.batch.group_count,
        student_group: student.group
      };

      return res.status(200).json([batchData]);

    } catch (error) {
      logger.error('Error in getBatches:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching student batches'
      });
    }
  }),

  // @desc    Get student's timetable
  // @route   GET /api/student/timetable/:batchId/:group
  // @access  Private
  getTimetable: asyncHandler(async (req, res) => {
    try {
      const { batchId, group } = req.params;

      // Verify student belongs to this batch and group
      const student = await Student.findOne({ 
        user: req.user._id,
        batch: batchId,
        group: parseInt(group)
      });

      if (!student) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this timetable'
        });
      }

      // Get timetable entries for this batch and group
      const timetable = await Timetable.find({
        batch: batchId,
        group: parseInt(group)
      })
      .populate('module', 'module_name')
      .populate({
        path: 'lecturer',
        populate: { path: 'user', select: 'name' }
      })
      .populate('hall', 'hall_name')
      .sort({ day: 1, timeSlot: 1 });

      return res.status(200).json(timetable);

    } catch (error) {
      logger.error('Error in getTimetable:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching timetable'
      });
    }
  }),

  // @desc    Get student profile
  // @route   GET /api/student/profile
  // @access  Private
  getProfile: asyncHandler(async (req, res) => {
    try {
      const student = await Student.findOne({ user: req.user._id })
        .populate('batch', 'batch_name batch_code')
        .populate('user', 'name email');

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      logger.error('Error fetching student profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching student profile'
      });
    }
  })
};

module.exports = studentController;