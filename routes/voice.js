const express = require('express');
const router = express.Router();
const {
  processVoiceCommand,
  getVoiceCommandHistory
} = require('../controllers/voiceCommandController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/command', processVoiceCommand);
router.get('/history', getVoiceCommandHistory);

module.exports = router; 