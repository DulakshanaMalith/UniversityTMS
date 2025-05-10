import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, CircularProgress, Button, Alert } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getNotifications, markAsRead, markAllAsRead, markAttendance } from '../../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleMarkAttendance = async (notification) => {
    setActionLoading(notification._id);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await markAttendance(notification.sessionId);
      console.log('markAttendance API response:', res);
      if (res && res.success) {
        setActionSuccess('Attendance marked successfully!');
        setNotifications(notifications.map(n =>
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        await markAsRead(notification._id);
      } else {
        setActionError('Failed to mark attendance. Please try again.');
      }
    } catch (err) {
      console.error('Attendance marking error:', err);
      setActionError('Failed to mark attendance or already marked.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 360,
          },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography>No notifications</Typography>
          </MenuItem>
        ) : (
          <>
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">Notifications</Typography>
              {unreadCount > 0 && (
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </Typography>
              )}
            </Box>
            {actionError && <Alert severity="error" sx={{ mx: 2 }}>{actionError}</Alert>}
            {actionSuccess && <Alert severity="success" sx={{ mx: 2 }}>{actionSuccess}</Alert>}
            {notifications.map((notification) => {
              const isAttendance = notification.type === 'attendance';
              // Debug log
              console.log('Notification:', notification);
              return (
                <MenuItem
                  key={notification._id}
                  onClick={() => !isAttendance && handleMarkAsRead(notification._id)}
                  sx={{
                    backgroundColor: notification.isRead ? 'inherit' : 'action.hover',
                    whiteSpace: 'normal',
                    py: 1
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">{notification.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                    {/* Attendance notification action */}
                    {isAttendance && !notification.isRead && (
                      notification.sessionId ? (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<EventAvailableIcon />}
                          sx={{ mt: 1, fontWeight: 600 }}
                          disabled={actionLoading === notification._id}
                          onClick={e => {
                            e.stopPropagation();
                            handleMarkAttendance(notification);
                          }}
                        >
                          {actionLoading === notification._id ? <CircularProgress size={18} color="inherit" /> : 'Mark Attendance'}
                        </Button>
                      ) : (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          Attendance session info missing. Please refresh or contact admin.
                        </Alert>
                      )
                    )}
                    {isAttendance && notification.isRead && (
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        sx={{ mt: 1, fontWeight: 600 }}
                        disabled
                      >
                        Attendance Marked
                      </Button>
                    )}
                  </Box>
                </MenuItem>
              );
            })}
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell; 