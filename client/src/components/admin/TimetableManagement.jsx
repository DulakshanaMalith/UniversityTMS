import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Paper,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  TextField
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DraggableTimetable from './DraggableTimetable';
import TimetablePDF from './TimetablePDF';
import { getBatches, generateTimetable, getTimetable, updateTimetableSlot } from '../../services/api';

const TimetableManagement = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('');
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    fetchBatches();
    fetchTimetable();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBatches();
      if (Array.isArray(response)) {
        setBatches(response);
      } else if (response.data && Array.isArray(response.data)) {
        setBatches(response.data);
      } else {
        console.error('Invalid batches data in response:', response);
        setError('Invalid response format from server');
        setBatches([]);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setError('Failed to fetch batches');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTimetable();
      console.log('Timetable response:', response);
      
      if (response && Array.isArray(response)) {
        setTimetable(response);
        analyzeWarnings(response);
        setError(null);
      } else {
        console.error('Invalid timetable data received:', response);
        setError('Invalid response format from server');
        setTimetable([]);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError(error.message || 'Failed to fetch timetable');
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeWarnings = (timetableData) => {
    const newWarnings = [];
    
    // Check for overloaded days
    const dailyWorkload = {};
    timetableData.forEach(entry => {
      const key = `${entry.batch_name}_${entry.group}`;
      dailyWorkload[key] = dailyWorkload[key] || {};
      dailyWorkload[key][entry.day] = (dailyWorkload[key][entry.day] || 0) + 2;
      
      if (dailyWorkload[key][entry.day] > 6) {
        newWarnings.push({
          type: 'workload',
          message: `High workload for ${entry.batch_name} Group ${entry.group} on ${entry.day}`,
          severity: 'warning'
        });
      }
    });

    // Check for gaps in schedule
    const scheduleGaps = {};
    timetableData.forEach(entry => {
      const key = `${entry.batch_name}_${entry.group}`;
      scheduleGaps[key] = scheduleGaps[key] || {};
      scheduleGaps[key][entry.day] = scheduleGaps[key][entry.day] || [];
      scheduleGaps[key][entry.day].push(entry.timeSlot);
    });

    Object.entries(scheduleGaps).forEach(([key, days]) => {
      Object.entries(days).forEach(([day, slots]) => {
        const sortedSlots = slots.sort();
        for (let i = 1; i < sortedSlots.length; i++) {
          const prevEnd = sortedSlots[i-1].split('-')[1];
          const currStart = sortedSlots[i].split('-')[0];
          if (prevEnd !== currStart) {
            newWarnings.push({
              type: 'gap',
              message: `Schedule gap detected for ${key} on ${day}`,
              severity: 'info'
            });
          }
        }
      });
    });

    setWarnings(newWarnings);
  };

  const handleGenerateTimetable = async () => {
    setConfirmDialog(false);
    setError(null);
    try {
      setLoading(true);
      setGenerationStatus('Generating timetable...');
      setGeneratingProgress(20);

      // Generate the timetable
      const response = await generateTimetable();
      setGeneratingProgress(60);

      if (response && response.success) {
        setGeneratingProgress(80);
        await fetchTimetable();
        setGenerationStatus('Timetable generated successfully!');
        setError(null);
      } else {
        throw new Error(response?.message || 'Failed to generate timetable');
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      setError(error.message || 'Failed to generate timetable. Please ensure you have added batches, modules, lecturers, and halls.');
      setGenerationStatus('Failed to generate timetable');
    } finally {
      setGeneratingProgress(100);
      setLoading(false);
    }
  };

  const handleSlotUpdate = async (slotId, updates) => {
    try {
      const response = await updateTimetableSlot(slotId, updates);
      if (response.success) {
        await fetchTimetable();
      } else {
        setError(response.message || 'Failed to update slot');
      }
    } catch (error) {
      setError(error.message || 'Error updating slot');
    }
  };

  const handleEditSlot = (slot) => {
    setSelectedSlot(slot);
    setEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedSlot(null);
    setEditDialog(false);
  };

  const selectedBatchName = batches.find(b => b._id === selectedBatch)?.batch_name || '';
  const filteredTimetable = selectedBatch
    ? timetable.filter(entry => entry.batch === selectedBatch)
    : timetable;

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Timetable Management
        </Typography>

        {warnings.length > 0 && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Schedule Warnings
            </Typography>
            <Grid container spacing={2}>
              {warnings.map((warning, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Alert 
                    severity={warning.severity} 
                    icon={warning.severity === 'warning' ? <WarningIcon /> : <InfoIcon />}
                  >
                    {warning.message}
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Batch</InputLabel>
              <Select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                label="Filter by Batch"
              >
                <MenuItem value="">All Batches</MenuItem>
                {batches.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id}>
                    {batch.batch_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setConfirmDialog(true)}
                disabled={loading}
              >
                Generate New Timetable
              </Button>
              {selectedBatch && filteredTimetable.length > 0 && (
                <PDFDownloadLink
                  document={<TimetablePDF timetable={filteredTimetable} batchName={selectedBatchName} />}
                  fileName={`timetable-${selectedBatchName}.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={loading}
                    >
                      {loading ? 'Generating PDF...' : 'Download PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </Box>
          </Grid>
        </Grid>

        {loading && <LinearProgress />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={2}>
          <DraggableTimetable
            timetable={filteredTimetable}
            selectedBatch={selectedBatch}
            onSlotUpdate={handleSlotUpdate}
            onEditSlot={handleEditSlot}
          />
        </Paper>
      </Box>

      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Generate New Timetable?</DialogTitle>
        <DialogContent>
          <Typography>
            This will replace the existing timetable. Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateTimetable} color="primary" variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {selectedSlot && (
        <Dialog open={editDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Timetable Slot</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Module: {selectedSlot.module_name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Lecturer: {selectedSlot.lecturer}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Hall: {selectedSlot.hall_name}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Session Type</InputLabel>
                <Select
                  value={selectedSlot.sessionType || 'Lecture'}
                  onChange={(e) => setSelectedSlot({ ...selectedSlot, sessionType: e.target.value })}
                >
                  <MenuItem value="Lecture">Lecture</MenuItem>
                  <MenuItem value="Lab">Lab</MenuItem>
                  <MenuItem value="Tutorial">Tutorial</MenuItem>
                  <MenuItem value="Exam Prep">Exam Prep</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedSlot.status || 'Scheduled'}
                  onChange={(e) => setSelectedSlot({ ...selectedSlot, status: e.target.value })}
                >
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Rescheduled">Rescheduled</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={selectedSlot.notes || ''}
                onChange={(e) => setSelectedSlot({ ...selectedSlot, notes: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button 
              onClick={() => {
                handleSlotUpdate(selectedSlot._id, {
                  sessionType: selectedSlot.sessionType,
                  status: selectedSlot.status,
                  notes: selectedSlot.notes
                });
                handleCloseEditDialog();
              }}
              color="primary"
              variant="contained"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default TimetableManagement;
