const { body, param, validationResult } = require('express-validator');

// Helper function to validate results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for timetable slot updates
exports.validateTimetableSlotUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid timetable entry ID'),
  body('day')
    .notEmpty()
    .withMessage('Day is required')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day selected'),
  body('timeSlot')
    .notEmpty()
    .withMessage('Time slot is required')
    .isIn(['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'])
    .withMessage('Invalid time slot selected'),
  body('group')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Group must be a positive integer'),
  body('week')
    .optional()
    .isInt({ min: 1, max: 16 })
    .withMessage('Week must be between 1 and 16'),
  validateResults
];

// Validation rules for time slot change requests
exports.validateTimeSlotChangeRequest = [
  body('timetableEntryId')
    .notEmpty()
    .withMessage('Timetable entry ID is required')
    .isMongoId()
    .withMessage('Invalid timetable entry ID'),
  body('requestedDay')
    .notEmpty()
    .withMessage('Requested day is required')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day selected'),
  body('requestedTimeSlot')
    .notEmpty()
    .withMessage('Requested time slot is required')
    .isIn(['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'])
    .withMessage('Invalid time slot selected'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  validateResults
];

// Validation rules for handling change requests
exports.validateChangeRequestResponse = [
  param('id')
    .isMongoId()
    .withMessage('Invalid request ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Approved', 'Rejected'])
    .withMessage('Status must be either Approved or Rejected'),
  body('rejectionReason')
    .if(body('status').equals('Rejected'))
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting a request')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters'),
  validateResults
];

// Validation rules for generating timetable
exports.validateTimetableGeneration = [validateResults];
