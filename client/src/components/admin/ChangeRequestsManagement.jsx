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
  CircularProgress
} from '@mui/material';
import { getAdminChangeRequests, handleChangeRequest } from '../../services/api';

const ChangeRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

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
        rejectionReason: status === 'Rejected' ? rejectionReason : ''
      };

      await handleChangeRequest(id, data);
      setDialogOpen(false);
      setRejectionReason('');
      await fetchRequests();
      setError(null);
    } catch (err) {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
            label="Reason for Rejection"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            error={rejectionReason.trim().length < 10 && rejectionReason.trim().length > 0}
            helperText={
              rejectionReason.trim().length < 10 && rejectionReason.trim().length > 0
                ? 'Reason must be at least 10 characters long'
                : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleConfirmReject} 
            color="error"
            disabled={rejectionReason.trim().length < 10}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChangeRequestsManagement;
