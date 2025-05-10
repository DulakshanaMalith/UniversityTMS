import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  CircularProgress
} from '@mui/material';
import { requestTimeSlotChange, getLecturerChangeRequests } from '../../services/api';

const timeSlots = [
  '08:00-10:00',
  '10:00-12:00',
  '13:00-15:00',
  '15:00-17:00'
];

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
];

const TimeSlotChangeRequest = ({ timetableEntry, onRequestSubmitted }) => {
  const [open, setOpen] = useState(false);
  const [requestedDay, setRequestedDay] = useState('');
  const [requestedTimeSlot, setRequestedTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setRequestedDay('');
    setRequestedTimeSlot('');
    setReason('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requestedDay || !requestedTimeSlot || !reason.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await requestTimeSlotChange({
        timetableEntryId: timetableEntry._id,
        requestedDay,
        requestedTimeSlot,
        reason: reason.trim()
      });

      onRequestSubmitted();
      handleClose();
    } catch (err) {
      console.error('Request error:', err);
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleOpen}
        size="small"
      >
        Request Change
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Request Time Slot Change</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="subtitle2" gutterBottom>
              Current Schedule:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="body2">
                Day: {timetableEntry.day}
              </Typography>
              <Typography variant="body2">
                Time: {timetableEntry.timeSlot}
              </Typography>
              <Typography variant="body2">
                Module: {timetableEntry.module?.module_name || 'Unknown Module'}
              </Typography>
            </Paper>

            <FormControl fullWidth margin="normal">
              <InputLabel>Requested Day</InputLabel>
              <Select
                value={requestedDay}
                onChange={(e) => setRequestedDay(e.target.value)}
                required
              >
                {days.map(day => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Requested Time Slot</InputLabel>
              <Select
                value={requestedTimeSlot}
                onChange={(e) => setRequestedTimeSlot(e.target.value)}
                required
              >
                {timeSlots.map(slot => (
                  <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Reason for Change"
              multiline
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              error={reason.trim().length > 0 && reason.trim().length < 10}
              helperText={
                reason.trim().length > 0 && reason.trim().length < 10
                  ? 'Reason must be at least 10 characters long'
                  : ''
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading || !requestedDay || !requestedTimeSlot || reason.trim().length < 10}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ChangeRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getLecturerChangeRequests();
      console.log('Change requests response:', response);
      if (response.success) {
        setRequests(response.data);
      } else {
        setError(response.message || 'Failed to fetch requests');
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ p: 2 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!requests.length) return <Typography>No change requests found.</Typography>;

  return (
    <List>
      {requests.map((request) => (
        <ListItem
          key={request._id}
          sx={{ mb: 2 }}
          component={Paper}
          variant="outlined"
        >
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1">
                {request.timetableEntry?.module?.module_name || 'Unknown Module'}
              </Typography>
              <Chip
                label={request.status}
                color={
                  request.status === 'Approved'
                    ? 'success'
                    : request.status === 'Rejected'
                    ? 'error'
                    : 'warning'
                }
                size="small"
              />
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Current: {request.timetableEntry?.day}, {request.timetableEntry?.timeSlot}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Requested: {request.requestedDay}, {request.requestedTimeSlot}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Batch: {request.timetableEntry?.batch?.batch_name || 'Unknown Batch'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Hall: {request.timetableEntry?.hall?.hall_name || 'Unknown Hall'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Reason: {request.reason}
            </Typography>
            {request.rejectionReason && (
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                Rejection Reason: {request.rejectionReason}
              </Typography>
            )}
            <Typography variant="caption">
              Submitted: {new Date(request.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default TimeSlotChangeRequest;
