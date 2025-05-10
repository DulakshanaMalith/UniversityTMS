const Timetable = require('../models/Timetable');

// Utility: All possible days and time slots
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'];

// @desc    Get available slots for a group, hall, and lecturer
// @route   GET /api/timetable/available-slots?group=...&hall=...&lecturer=...
// @access  Private (Admin only)
exports.getAvailableSlots = async (req, res) => {
  try {
    const { group, hall, lecturer } = req.query;
    if (!group && !hall && !lecturer) {
      return res.status(400).json({ success: false, message: 'At least one of group, hall, or lecturer is required.' });
    }

    // Find all timetable entries for the given group, hall, or lecturer
    const query = [];
    if (group) query.push({ group });
    if (hall) query.push({ hall });
    if (lecturer) query.push({ lecturer });
    const timetableEntries = await Timetable.find({ $or: query });

    // Build a set of booked slots: { 'Monday-08:00-10:00': true, ... }
    const booked = new Set();
    timetableEntries.forEach(entry => {
      booked.add(`${entry.day}-${entry.timeSlot}`);
    });

    // Find all available slots
    const availableSlots = [];
    for (const day of DAYS) {
      for (const slot of TIME_SLOTS) {
        const key = `${day}-${slot}`;
        if (!booked.has(key)) {
          availableSlots.push({ day, timeSlot: slot });
        }
      }
    }

    res.json({ success: true, availableSlots });
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    res.status(500).json({ success: false, message: 'Error fetching available slots' });
  }
}; 