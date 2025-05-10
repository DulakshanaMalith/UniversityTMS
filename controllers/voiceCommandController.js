const { asyncHandler } = require('../middleware/errorHandler');
const VoiceCommandHistory = require('../models/VoiceCommandHistory');
const ErrorResponse = require('../utils/ErrorResponse');

// Command mapping for different user roles
const commandMap = {
  student: {
    'show timetable': async (user) => ({ action: 'navigate', target: '/student/timetable' }),
    'start study session': async (user) => ({ action: 'startProductivity', type: 'study' }),
    'show next class': async (user) => ({ action: 'showNextClass' }),
    'logout': async (user) => ({ action: 'logout' }),
    'log out': async (user) => ({ action: 'logout' }),
    'sign out': async (user) => ({ action: 'logout' })
  },
  lecturer: {
    'show schedule': async (user) => ({ action: 'navigate', target: '/lecturer/schedule' }),
    'start teaching session': async (user) => ({ action: 'startProductivity', type: 'teaching' }),
    'show student list': async (user) => ({ action: 'showStudentList' }),
    'logout': async (user) => ({ action: 'logout' }),
    'log out': async (user) => ({ action: 'logout' }),
    'sign out': async (user) => ({ action: 'logout' })
  },
  admin: {
    'generate timetable': async (user) => ({ action: 'generateTimetable' }),
    'show analytics': async (user) => ({ action: 'navigate', target: '/admin/analytics' }),
    'show hall usage': async (user) => ({ action: 'showHallUsage' }),
    'logout': async (user) => ({ action: 'logout' }),
    'log out': async (user) => ({ action: 'logout' }),
    'sign out': async (user) => ({ action: 'logout' })
  }
};

// @desc    Process voice command
// @route   POST /api/voice/command
// @access  Private
exports.processVoiceCommand = asyncHandler(async (req, res) => {
  const { command } = req.body;
  const userRole = req.user.role;

  // Get available commands for user role
  const availableCommands = commandMap[userRole] || {};
  
  // Find matching command (more robust: allow partial and synonym matches)
  const matchingCommand = Object.keys(availableCommands).find(cmd => {
    const spoken = command.toLowerCase();
    return spoken === cmd || spoken.includes(cmd) || cmd.includes(spoken);
  });

  if (!matchingCommand) {
    // Log unsuccessful command
    await VoiceCommandHistory.create({
      user: req.user._id,
      command,
      success: false,
      response: 'Command not recognized'
    });

    throw new ErrorResponse('Command not recognized', 400);
  }

  try {
    // Execute command
    const result = await availableCommands[matchingCommand](req.user);

    // Log successful command
    await VoiceCommandHistory.create({
      user: req.user._id,
      command,
      success: true,
      response: JSON.stringify(result),
      context: { role: userRole }
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    // Log failed command
    await VoiceCommandHistory.create({
      user: req.user._id,
      command,
      success: false,
      response: error.message,
      context: { role: userRole }
    });

    throw new ErrorResponse(error.message, 500);
  }
});

// @desc    Get voice command history
// @route   GET /api/voice/history
// @access  Private
exports.getVoiceCommandHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const history = await VoiceCommandHistory.find({ user: req.user._id })
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await VoiceCommandHistory.countDocuments({ user: req.user._id });

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