const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerStudent,
  verifyRegistrationCode,
  getBatches,
  getTimetable,
  getProfile
} = require('../controllers/studentController');

// Public routes
router.post('/register', registerStudent);
router.post('/verify-code', verifyRegistrationCode);

// Protected routes
router.use(protect); // Apply protection to all routes below
router.get('/batches', getBatches);
router.get('/timetable/:batchId/:group', getTimetable);
router.get('/profile', getProfile);

module.exports = router;