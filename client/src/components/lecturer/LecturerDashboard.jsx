import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Tab,
  Tabs,
  IconButton,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { School, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getLecturerTimetable, logout, getStoredUser } from '../../services/api';
import TimeSlotChangeRequest, { ChangeRequestsList } from './TimeSlotChangeRequest';
import ProductivityTracker from '../productivity/ProductivityTracker';
import VoiceCommandInterface from '../voice/VoiceCommandInterface';
import LecturerAnalyticsDashboard from './LecturerAnalyticsDashboard';
import LecturerAssignments from './LecturerAssignments';
import LecturerAttendance from './LecturerAttendance';
import { SLIIT_LOGO } from '../../assets/images';

const LecturerDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = getStoredUser();
  const [timetable, setTimetable] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'lecturer') {
      navigate('/login');
      return;
    }
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const data = await getLecturerTimetable();
      setTimetable(data || []);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTimetable();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderTimetableCell = (day, timeSlot) => {
    if (!Array.isArray(timetable)) {
      console.error('Timetable is not an array:', timetable);
      return null;
    }

    const entries = timetable.filter(
      entry => entry.day === day && entry.timeSlot === timeSlot
    );

    return (
      <TableCell key={`${day}-${timeSlot}`} sx={{ minWidth: 200, verticalAlign: 'top', border: 0 }}>
        {entries.map((entry) => (
          <Card key={entry._id} sx={{ mb: 1, backgroundColor: alpha(theme.palette.primary.main, 0.04), boxShadow: 1, borderRadius: 2 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {entry.module?.module_name || 'Unknown Module'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Batch: {entry.batch?.batch_name || 'Unknown Batch'} - Group {entry.group}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Hall: {entry.hall?.hall_name || 'Unknown Hall'}
                  </Typography>
                </Box>
                <TimeSlotChangeRequest
                  timetableEntry={entry}
                  onRequestSubmitted={fetchTimetable}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </TableCell>
    );
  };

  const timeSlots = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <Box sx={{
      background: 'background.default',
      minHeight: '100vh',
      py: 4,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '220px',
        height: '220px',
        background: `url(${SLIIT_LOGO}) no-repeat center center`,
        backgroundSize: 'contain',
        opacity: 0.06,
        zIndex: 0
      }
    }}>
      <Box sx={{ maxWidth: 'xl', mx: 'auto', px: 2, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1 }}>
              Lecturer Dashboard
            </Typography>
          </Box>
          <IconButton onClick={handleRefresh} disabled={refreshing} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) } }}>
            <RefreshIcon />
          </IconButton>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Card sx={{ mb: 4, p: 2, boxShadow: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            textColor="primary"
            indicatorColor="secondary"
            sx={{ mb: 2, borderRadius: 2, boxShadow: 1, bgcolor: alpha(theme.palette.primary.main, 0.04) }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="My Timetable" />
            <Tab label="Change Requests" />
            <Tab label="Productivity" />
            <Tab label="Voice Commands" />
            <Tab label="Analytics" />
            <Tab label="Assignments" />
            <Tab label="Attendance" />
          </Tabs>

          {currentTab === 0 && (
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, mb: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Time</TableCell>
                    {days.map((day) => (
                      <TableCell key={day} sx={{ color: '#fff', fontWeight: 700 }}>{day}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeSlots.map((timeSlot, idx) => (
                    <TableRow key={timeSlot} sx={{ bgcolor: idx % 2 === 0 ? alpha(theme.palette.primary.main, 0.03) : '#fff' }}>
                      <TableCell sx={{ fontWeight: 600 }}>{timeSlot}</TableCell>
                      {days.map((day) => renderTimetableCell(day, timeSlot))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {currentTab === 1 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', fontWeight: 700 }}>
                My Change Requests
              </Typography>
              <ChangeRequestsList onRequestStatusChange={fetchTimetable} />
            </Box>
          )}

          {currentTab === 2 && <Box sx={{ p: 2 }}><ProductivityTracker /></Box>}
          {currentTab === 3 && <Box sx={{ p: 2 }}><VoiceCommandInterface /></Box>}
          {currentTab === 4 && <Box sx={{ p: 2 }}><LecturerAnalyticsDashboard /></Box>}
          {currentTab === 5 && <Box sx={{ p: 2 }}><LecturerAssignments /></Box>}
          {currentTab === 6 && <Box sx={{ p: 2 }}><LecturerAttendance /></Box>}
        </Card>
      </Box>
    </Box>
  );
};

export default LecturerDashboard;
