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
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import { School, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getLecturerTimetable, logout, getStoredUser } from '../../services/api';
import TimeSlotChangeRequest, { ChangeRequestsList } from './TimeSlotChangeRequest';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [timetable, setTimetable] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

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
    }
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
      <TableCell key={`${day}-${timeSlot}`} sx={{ minWidth: 200, verticalAlign: 'top' }}>
        {entries.map((entry) => (
          <Card key={entry._id} sx={{ mb: 1, backgroundColor: '#f5f5f5' }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {entry.module?.module_name || 'Unknown Module'}
                  </Typography>
                  <Typography variant="body2">
                    Batch: {entry.batch?.batch_name || 'Unknown Batch'} - Group {entry.group}
                  </Typography>
                  <Typography variant="caption" display="block">
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
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit">
            <School />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Lecturer Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              {user.name}
            </Typography>
            <Avatar sx={{ mr: 2 }}>{user.name[0]}</Avatar>
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="My Timetable" />
          <Tab label="Change Requests" />
        </Tabs>

        {currentTab === 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  {days.map((day) => (
                    <TableCell key={day}>{day}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {timeSlots.map((timeSlot) => (
                  <TableRow key={timeSlot}>
                    <TableCell>{timeSlot}</TableCell>
                    {days.map((day) => renderTimetableCell(day, timeSlot))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              My Change Requests
            </Typography>
            <ChangeRequestsList onRequestStatusChange={fetchTimetable} />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default LecturerDashboard;
