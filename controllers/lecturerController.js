const { asyncHandler } = require('../middleware/errorHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const TimeSlotChangeRequest = require('../models/TimeSlotChangeRequest');
const Timetable = require('../models/Timetable');
const Lecturer = require('../models/Lecturer');
const { checkAllConflicts } = require('../utils/timetableUtils');

// @desc    Get lecturer's timetable
// @route   GET /api/lecturer/timetable
// @access  Private (Lecturer only)
exports.getLecturerTimetable = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching timetable for lecturer:', req.user.name);
    
    // Find the lecturer document by name
    const lecturer = await Lecturer.findOne({ name: req.user.name });
    if (!lecturer) {
      console.log('Lecturer not found for name:', req.user.name);
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found'
      });
    }
    
    console.log('Found lecturer:', lecturer);
    
    // Find the timetable entries for this lecturer
    const timetable = await Timetable.find({ lecturer: lecturer._id })
      .populate('batch', 'batch_name batch_code')
      .populate('module', 'module_name credit_hours')
      .populate('hall', 'hall_name capacity')
      .sort({ day: 1, timeSlot: 1 });

    console.log('Found timetable entries:', timetable.length);

    // Return response with success flag
    res.status(200).json({
      success: true,
      data: timetable || []
    });
  } catch (error) {
    console.error('Error in getLecturerTimetable:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lecturer timetable',
      error: error.message
    });
  }
});

// @desc    Request time slot change
// @route   POST /api/lecturer/request-change
// @access  Private (Lecturer only)
exports.requestTimeSlotChange = asyncHandler(async (req, res) => {
  try {
    console.log('Received request data:', req.body);
    const { timetableEntryId, requestedDay, requestedTimeSlot, reason } = req.body;
    
    if (!timetableEntryId || !requestedDay || !requestedTimeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find the timetable entry
    const timetableEntry = await Timetable.findById(timetableEntryId);
    if (!timetableEntry) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    console.log('Found timetable entry:', timetableEntry);
    console.log('Current user ID:', req.user._id);

    // Verify that the lecturer owns this timetable entry
    if (timetableEntry.lecturer && timetableEntry.lecturer.toString() !== req.user._id.toString()) {
      console.log('Lecturer ID mismatch:', {
        timetableEntryLecturer: timetableEntry.lecturer.toString(),
        currentUser: req.user._id.toString()
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this timetable entry'
      });
    }

    // Check for existing pending requests for this entry
    const existingRequest = await TimeSlotChangeRequest.findOne({
      timetableEntry: timetableEntryId,
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A pending request already exists for this time slot'
      });
    }

    // Create the change request
    const changeRequest = await TimeSlotChangeRequest.create({
      timetableEntry: timetableEntryId,
      lecturer: req.user._id,
      requestedDay,
      requestedTimeSlot,
      reason,
      status: 'Pending'
    });

    console.log('Created change request:', changeRequest);

    res.status(201).json({
      success: true,
      data: changeRequest
    });
  } catch (error) {
    console.error('Error in requestTimeSlotChange:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error creating change request'
    });
  }
});

// @desc    Get lecturer's change requests
// @route   GET /api/lecturer/change-requests
// @access  Private (Lecturer only)
exports.getLecturerChangeRequests = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching change requests for lecturer:', req.user._id);
    
    const requests = await TimeSlotChangeRequest.find({ lecturer: req.user._id })
      .populate({
        path: 'timetableEntry',
        populate: [
          {
            path: 'module',
            select: 'module_name credit_hours'
          },
          {
            path: 'batch',
            select: 'batch_name batch_code'
          },
          {
            path: 'hall',
            select: 'hall_name capacity'
          }
        ]
      })
      .sort('-createdAt');

    console.log('Found change requests:', requests.length);

    res.status(200).json({
      success: true,
      data: requests.map(request => ({
        _id: request._id,
        timetableEntry: {
          _id: request.timetableEntry._id,
          module: request.timetableEntry.module,
          batch: request.timetableEntry.batch,
          hall: request.timetableEntry.hall,
          day: request.timetableEntry.day,
          timeSlot: request.timetableEntry.timeSlot
        },
        requestedDay: request.requestedDay,
        requestedTimeSlot: request.requestedTimeSlot,
        reason: request.reason,
        status: request.status,
        rejectionReason: request.rejectionReason,
        createdAt: request.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in getLecturerChangeRequests:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching change requests'
    });
  }
});