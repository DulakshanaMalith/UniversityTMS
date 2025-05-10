const notificationService = require('../services/notificationService');

// In your createAssignment function:
exports.createAssignment = asyncHandler(async (req, res, next) => {
  // ... existing assignment creation code ...

  // Create notifications for all students in the batch
  await notificationService.createBatchNotification(batchId, {
    type: 'assignment',
    title: 'New Assignment',
    message: `New assignment "${title}" has been added to ${moduleName}`,
    module: moduleId
  });

  res.status(201).json({
    success: true,
    data: assignment
  });
}); 