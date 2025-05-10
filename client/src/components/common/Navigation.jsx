import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar
} from '@mui/material';
import { logout } from '../../store/authSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SLIITLogo from '/sliit-logo.png';
import NotificationBell from './NotificationBell';

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Show minimal header on login/register/unauthorized
  const minimalHeaderRoutes = ['/login', '/register/student', '/unauthorized'];
  const isMinimalHeader = minimalHeaderRoutes.includes(location.pathname);

  if (isMinimalHeader) {
    return (
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar>
          {/* Left: Logo and Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src={SLIITLogo} alt="SLIIT Logo" style={{ height: 40, marginRight: 12 }} />
            <Typography variant="h6" component="div" sx={{ color: '#ff9800', fontWeight: 700, letterSpacing: 2 }}>
              SLIIT Timetable & Attendance
            </Typography>
          </Box>
          {/* Right: (empty for minimal header, but keeps layout consistent) */}
        </Toolbar>
      </AppBar>
    );
  }

  // Full nav bar for authenticated users
  if (isAuthenticated) {
    return (
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar>
          {/* Left: Logo and Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src={SLIITLogo} alt="SLIIT Logo" style={{ height: 40, marginRight: 12 }} />
            <Typography variant="h6" component="div" sx={{ color: '#ff9800', fontWeight: 700, letterSpacing: 2 }}>
              SLIIT Timetable & Attendance
            </Typography>
          </Box>
          {/* Right: All other items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationBell />
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Avatar sx={{ bgcolor: '#ff9800', color: '#fff', mr: 1 }}>
                <AccountCircleIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                {user?.name || 'User'}
              </Typography>
            </Box>
            {(user?.role === 'student' || user?.role === 'lecturer') && (
              <Button sx={{ color: '#fff', '&:hover': { color: '#ff9800' } }} onClick={() => navigate('/feedback')}>Feedback</Button>
            )}
            {user?.role === 'admin' && (
              <>
                <Button sx={{ color: '#fff', '&:hover': { color: '#ff9800' } }} onClick={() => navigate('/admin/feedback')}>Feedback Dashboard</Button>
                <Button sx={{ color: '#fff', '&:hover': { color: '#ff9800' } }} onClick={() => navigate('/admin/analytics')}>Analytics</Button>
              </>
            )}
            <Button
              sx={{ color: '#fff', '&:hover': { color: '#ff9800' } }}
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // No nav bar for unauthenticated users on other routes
  return null;
};

export default Navigation;
