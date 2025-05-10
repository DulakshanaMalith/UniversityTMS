const asyncHandler = require('../middleware/asyncHandler');
const notificationService = require('../services/notificationService');
const ErrorResponse = require('../utils/ErrorResponse');

// Get user notifications
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await notificationService.getUserNotifications(req.user.id);
  
  res.status(200).json({
    success: true,
    data: notifications
  });
});

// Mark notification as read
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await notificationService.markAsRead(req.params.id);
  
  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: notification
  });
});

// Mark all notifications as read
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await notificationService.markAllAsRead(req.user.id);
  
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
}); 