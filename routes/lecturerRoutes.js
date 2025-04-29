const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getLecturerTimetable,
  requestTimeSlotChange,
  getLecturerChangeRequests
} = require('../controllers/lecturerController');
const {
  validateTimeSlotChangeRequest
} = require('../middleware/validation');

// Apply authentication and authorization middleware
router.use(protect);
router.use(authorize('lecturer'));

// Timetable routes
router.route('/timetable')
  .get(getLecturerTimetable);

// Time slot change request routes
router.route('/request-change')
  .post(validateTimeSlotChangeRequest, requestTimeSlotChange);

router.route('/change-requests')
  .get(getLecturerChangeRequests);

module.exports = router;