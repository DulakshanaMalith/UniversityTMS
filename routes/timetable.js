const express = require('express');
const router = express.Router();
const { getAvailableSlots } = require('../controllers/timetableController');
// You may want to add authentication and admin middleware here
// const { protect, admin } = require('../middleware/auth');

// Get available slots for a group, hall, or lecturer
// router.get('/available-slots', protect, admin, getAvailableSlots);
router.get('/available-slots', getAvailableSlots);

module.exports = router; 