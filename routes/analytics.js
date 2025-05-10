const express = require('express');
const { hallUsage, lecturerLoad, timeslotPopularity, batchLoad } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/hall-usage', protect, authorize('admin'), hallUsage);
router.get('/lecturer-load', protect, authorize('admin'), lecturerLoad);
router.get('/timeslot-popularity', protect, authorize('admin'), timeslotPopularity);
router.get('/batch-load', protect, authorize('admin'), batchLoad);

module.exports = router; 