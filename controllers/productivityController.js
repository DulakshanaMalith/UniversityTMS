const { asyncHandler } = require('../middleware/errorHandler');
const ProductivityLog = require('../models/ProductivityLog');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Start a productivity session
// @route   POST /api/productivity/start
// @access  Private
exports.startProductivitySession = asyncHandler(async (req, res) => {
  const { type, moduleId, activity, notes } = req.body;

  // Check if user has an active session
  const activeSession = await ProductivityLog.findOne({
    user: req.user._id,
    status: 'active'
  });

  if (activeSession) {
    throw new ErrorResponse('You already have an active session', 400);
  }

  const session = await ProductivityLog.create({
    user: req.user._id,
    type,
    module: moduleId,
    startTime: new Date(),
    activity,
    notes
  });

  res.status(201).json({
    success: true,
    data: session
  });
});

// @desc    End a productivity session
// @route   POST /api/productivity/end
// @access  Private
exports.endProductivitySession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  const session = await ProductivityLog.findOne({
    _id: sessionId,
    user: req.user._id,
    status: 'active'
  });

  if (!session) {
    throw new ErrorResponse('No active session found', 404);
  }

  const endTime = new Date();
  const duration = Math.round((endTime - session.startTime) / (1000 * 60)); // Convert to minutes

  session.endTime = endTime;
  session.duration = duration;
  session.status = 'completed';
  await session.save();

  res.status(200).json({
    success: true,
    data: session
  });
});

// @desc    Get productivity statistics
// @route   GET /api/productivity/stats
// @access  Private
exports.getProductivityStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, userId, groupBy } = req.query;
  let query = {};

  // Only restrict to user if not admin or if userId is provided
  if (req.user.role !== 'admin' || userId) {
    query.user = userId || req.user._id;
  }

  if (startDate && endDate) {
    query.startTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (type) {
    query.type = type;
  }

  // Grouping fields
  const groupFields = {};
  if (groupBy === 'user') groupFields.user = '$user';
  if (groupBy === 'module') groupFields.module = '$module';
  groupFields.type = '$type';

  const stats = await ProductivityLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: groupFields,
        totalDuration: { $sum: '$duration' },
        sessionCount: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get productivity history
// @route   GET /api/productivity/history
// @access  Private
exports.getProductivityHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { user: req.user._id };

  const history = await ProductivityLog.find(query)
    .populate('module', 'module_name')
    .sort({ startTime: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await ProductivityLog.countDocuments(query);

  res.status(200).json({
    success: true,
    data: history,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
}); 