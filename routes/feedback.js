const express = require('express');
const { submitFeedback, getAllFeedback, updateFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public: Submit feedback
router.post('/', submitFeedback);

// Admin: View all feedback
router.get('/admin', protect, authorize('admin'), getAllFeedback);

// Admin: Update feedback status
router.put('/admin/:id', protect, authorize('admin'), updateFeedback);

module.exports = router; 