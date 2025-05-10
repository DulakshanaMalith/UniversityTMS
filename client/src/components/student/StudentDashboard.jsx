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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Button,
  Container
} from '@mui/material';
import { getStudentTimetable, getStudentBatches } from '../../services/api';
import { useSelector } from 'react-redux';
import RefreshIcon from '@mui/icons-material/Refresh';
import Navigation from '../common/Navigation';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch && selectedGroup) {
      fetchTimetable();
    }
  }, [selectedBatch, selectedGroup]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await getStudentBatches();
      console.log('Batches response:', response);
      setBatches(response);
      if (response.length === 1) {
        setSelectedBatch(response[0]._id);
        setSelectedGroup(response[0].student_group); // Set the student's group
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setError(error.message || 'Error fetching batches');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await getStudentTimetable(selectedBatch, selectedGroup);
      console.log('Timetable response:', response);
      setTimetable(response);
      setError(null);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError(error.message || 'Error fetching timetable');
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const selectedBatchData = batches.find(b => b._id === selectedBatch);
  const groupOptions = selectedBatchData ? 
    Array.from({ length: selectedBatchData.group_count }, (_, i) => i + 1) : [];

  const renderTimetableCell = (day, timeSlot) => {
    const entries = timetable.filter(
      entry => entry.day === day && entry.timeSlot === timeSlot
    );

    if (entries.length === 0) {
      return null;
    }

    return entries.map((entry, index) => (
      <Box key={index} sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {entry.module?.module_name || 'Unknown Module'}
        </Typography>
        <Typography variant="caption" display="block">
          Lecturer: {entry.lecturer?.user?.name || 'Unknown'}
        </Typography>
        <Typography variant="caption" display="block">
          Hall: {entry.hall?.hall_name || 'Unknown'}
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
          Week: {entry.week || '?'}
        </Typography>
      </Box>
    ));
  };

  return (
    <Box>
      <Navigation />
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Student Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Batch</InputLabel>
              <Select
                value={selectedBatch}
                label="Batch"
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                {batches.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id}>
                    {batch.batch_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Group</InputLabel>
              <Select
                value={selectedGroup}
                label="Group"
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={!selectedBatch}
              >
                {groupOptions.map((group) => (
                  <MenuItem key={group} value={group}>
                    Group {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchTimetable}
              disabled={!selectedBatch || !selectedGroup}
            >
              Refresh Timetable
            </Button>
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time / Day</TableCell>
                  {days.map((day) => (
                    <TableCell key={day}>{day}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {timeSlots.map((timeSlot) => (
                  <TableRow key={timeSlot}>
                    <TableCell component="th" scope="row">
                      {timeSlot}
                    </TableCell>
                    {days.map((day) => renderTimetableCell(day, timeSlot))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default StudentDashboard;
