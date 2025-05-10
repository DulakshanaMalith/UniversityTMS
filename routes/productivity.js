const express = require('express');
const router = express.Router();
const {
  startProductivitySession,
  endProductivitySession,
  getProductivityStats,
  getProductivityHistory
} = require('../controllers/productivityController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/start', startProductivitySession);
router.post('/end', endProductivitySession);
router.get('/stats', getProductivityStats);
router.get('/history', getProductivityHistory);

module.exports = router; 