import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import { getAdminChangeRequests, handleChangeRequest } from '../../services/api';
import { SLIIT_LOGO } from '../../assets/images';

const ChangeRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getAdminChangeRequests();
      setRequests(response?.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to fetch change requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request, status) => {
    if (status === 'Rejected') {
      setSelectedRequest(request);
      setDialogOpen(true);
    } else {
      handleRequestUpdate(request._id, status);
    }
  };

  const handleRequestUpdate = async (id, status) => {
    try {
      const data = {
        status,
        rejectionReason: status === 'Rejected' ? rejectionReason : '',
        suggestedSlots: status === 'Rejected' ? selectedSlots : undefined
      };
      await handleChangeRequest(id, data);
      setDialogOpen(false);
      setShowSlotDialog(false);
      setRejectionReason('');
      setSelectedSlots([]);
      await fetchRequests();
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 409 && err.response.data?.availableSlots) {
        setAvailableSlots(err.response.data.availableSlots);
        setShowSlotDialog(true);
        setDialogOpen(false);
        setSelectedRequest(requests.find(r => r._id === id));
        setRejectionReason('');
        setSelectedSlots([]);
        setError('');
      } else {
        console.error('Error updating request:', err);
        if (err.response?.data?.errors) {
          const errorMessages = err.response.data.errors
            .map(error => error.msg)
            .join(', ');
          setError(errorMessages);
        } else {
          setError(err.message || 'Failed to update request');
        }
      }
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setRejectionReason('');
    setSelectedRequest(null);
  };

  const handleConfirmReject = () => {
    if (selectedRequest && rejectionReason.trim().length >= 10) {
      handleRequestUpdate(selectedRequest._id, 'Rejected');
    } else {
      setError('Rejection reason must be at least 10 characters long');
    }
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots((prev) => {
      const exists = prev.find(s => s.day === slot.day && s.timeSlot === slot.timeSlot);
      if (exists) {
        return prev.filter(s => !(s.day === slot.day && s.timeSlot === slot.timeSlot));
      } else {
        return [...prev, slot];
      }
    });
  };

  const handleSendSuggestions = () => {
    if (selectedRequest && selectedSlots.length > 0 && rejectionReason.trim().length >= 10) {
      handleRequestUpdate(selectedRequest._id, 'Rejected');
    } else {
      setError('Please select at least one slot and provide a rejection reason (min 10 characters).');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      position: 'relative',
      bgcolor: alpha(theme.palette.primary.main, 0.01),
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
        <Typography variant="h5" gutterBottom>
          Time Slot Change Requests
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {requests.length === 0 ? (
          <Alert severity="info">No change requests found.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lecturer</TableCell>
                  <TableCell>Current Slot</TableCell>
                  <TableCell>Requested Slot</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Batch</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      {request.lecturer?.user?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {request.timetableEntry?.day}, {request.timetableEntry?.timeSlot}
                    </TableCell>
                    <TableCell>
                      {request.requestedDay}, {request.requestedTimeSlot}
                    </TableCell>
                    <TableCell>
                      {request.timetableEntry?.module?.module_name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {request.timetableEntry?.batch?.batch_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      {request.status === 'Pending' && (
                        <Box>
                          <Button
                            color="success"
                            size="small"
                            onClick={() => handleAction(request, 'Approved')}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            color="error"
                            size="small"
                            onClick={() => handleAction(request, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Reject Change Request</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Rejection Reason"
              type="text"
              fullWidth
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              multiline
              minRows={2}
              helperText="Reason must be at least 10 characters long"
              error={rejectionReason.trim().length > 0 && rejectionReason.trim().length < 10}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              onClick={handleConfirmReject}
              color="error"
              disabled={rejectionReason.trim().length < 10}
            >
              Confirm Reject
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showSlotDialog} onClose={() => setShowSlotDialog(false)}>
          <DialogTitle>Requested Slot Unavailable</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              The requested slot is already booked. Please select one or more available slots to suggest to the lecturer and provide a rejection reason.
            </Typography>
            <FormGroup>
              {availableSlots.map((slot, idx) => (
                <FormControlLabel
                  key={idx}
                  control={
                    <Checkbox
                      checked={!!selectedSlots.find(s => s.day === slot.day && s.timeSlot === slot.timeSlot)}
                      onChange={() => handleSlotToggle(slot)}
                    />
                  }
                  label={`${slot.day}, ${slot.timeSlot}`}
                />
              ))}
            </FormGroup>
            <TextField
              margin="dense"
              label="Rejection Reason"
              type="text"
              fullWidth
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              multiline
              minRows={2}
              helperText="Reason must be at least 10 characters long"
              error={rejectionReason.trim().length > 0 && rejectionReason.trim().length < 10}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSlotDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSendSuggestions}
              color="primary"
              disabled={selectedSlots.length === 0 || rejectionReason.trim().length < 10}
            >
              Send Suggestions
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ChangeRequestsManagement;
