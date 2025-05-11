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
  useTheme,
  alpha
} from '@mui/material';
import DraggableTimetable from './DraggableTimetable';
import { getBatches, generateTimetable, getTimetable, updateTimetableSlot, getSlotAlternatives } from '../../services/api';
import { SLIIT_LOGO } from '../../assets/images';

const TimetableManagement = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('');
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [draggedSlot, setDraggedSlot] = useState(null);
  const [targetInfo, setTargetInfo] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchBatches();
    fetchTimetable();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      const batch = batches.find(b => b._id === selectedBatch);
      setGroupOptions(
        batch ? Array.from({ length: batch.group_count }, (_, i) => i + 1) : []
      );
    } else {
      setGroupOptions([]);
      setSelectedGroup('');
    }
  }, [selectedBatch, batches]);

  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0]._id);
    }
  }, [batches]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBatches();
      if (response && Array.isArray(response.data)) {
        setBatches(response.data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setError('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTimetable();
      if (Array.isArray(data)) {
        setTimetable(data);
        setError(null);
      } else {
        setTimetable([]);
        throw new Error('Invalid timetable data received');
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError(error.message || 'Failed to fetch timetable');
      setTimetable([]);
    } finally {
      setLoading(false);
    }
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

  const handleAttemptSlotUpdate = async (movedSlot, updates) => {
    try {
      setError(null);
      const response = await updateTimetableSlot(movedSlot._id, updates);
      if (response && response._id) {  // Check for successful response
        await fetchTimetable();
        return true;
      }
      throw new Error(response?.message || 'Failed to update slot');
    } catch (error) {
      if (error.response?.status === 409 || error.message?.toLowerCase().includes('conflict')) {
        try {
          const response = await getSlotAlternatives({
            batchId: movedSlot.batch?._id,
            group: movedSlot.group,
            moduleId: movedSlot.module?._id,
            targetDay: updates.day,
            targetTimeSlot: updates.timeSlot
          });
          
          if (response.alternatives && response.alternatives.length > 0) {
            // Filter out alternatives that would cause conflicts
            const filteredAlternatives = response.alternatives.filter(alt => {
              // Don't show the same time slot with different halls
              if (alt.day === updates.day && alt.timeSlot === updates.timeSlot) {
                return false;
              }

              // Don't show slots that would conflict with the same lecturer
              const lecturerConflict = timetable.some(slot => 
                slot.lecturer?._id === movedSlot.lecturer?._id &&
                slot.day === alt.day &&
                slot.timeSlot === alt.timeSlot &&
                slot._id !== movedSlot._id
              );

              // Don't show slots that would conflict with the same group
              const groupConflict = timetable.some(slot =>
                slot.batch?._id === movedSlot.batch?._id &&
                slot.group === movedSlot.group &&
                slot.day === alt.day &&
                slot.timeSlot === alt.timeSlot &&
                slot._id !== movedSlot._id
              );

              // Don't show slots that would conflict with the same hall
              const hallConflict = timetable.some(slot =>
                slot.hall?._id === alt.hall._id &&
                slot.day === alt.day &&
                slot.timeSlot === alt.timeSlot &&
                slot._id !== movedSlot._id
              );

              return !lecturerConflict && !groupConflict && !hallConflict;
            });

            if (filteredAlternatives.length > 0) {
              setDraggedSlot(movedSlot);
              setTargetInfo({
                targetDay: updates.day,
                targetTimeSlot: updates.timeSlot,
                targetHall: updates.hall || movedSlot.hall?._id,
                targetGroup: movedSlot.group
              });
              setAlternatives(filteredAlternatives);
              setConflictModalOpen(true);
              return false;
            }
          }
          setError('No suitable alternative slots available. Please try a different time slot.');
        } catch (altError) {
          console.error('Error fetching alternatives:', altError);
          setError('Failed to fetch alternative slots. Please try again.');
        }
        return false;
      }
      setError(error.response?.data?.message || error.message || 'Failed to update timetable slot');
      await fetchTimetable();
      return false;
    }
  };

  const handleAlternativeSelection = async (alternative) => {
    try {
      setError(null);
      const updates = {
        day: alternative.day,
        timeSlot: alternative.timeSlot,
        hall: alternative.hall._id,
        group: targetInfo.targetGroup,
        batch: draggedSlot.batch?._id,
        module: draggedSlot.module?._id,
        lecturer: draggedSlot.lecturer?._id
      };

      const response = await updateTimetableSlot(draggedSlot._id, updates);
      
      if (response && response._id) {  // Check for successful response
        await fetchTimetable();
        setConflictModalOpen(false);
        setDraggedSlot(null);
        setAlternatives([]);
        return true;
      } else {
        throw new Error(response?.message || 'Failed to update slot');
      }
    } catch (error) {
      console.error('Error updating slot:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update slot');
      return false;
    }
  };

  const handleDrop = async (day, timeSlot, hallId) => {
    if (!draggedSlot) return;

    try {
      setError(null);
      const updates = {
        day,
        timeSlot,
        hall: hallId,
        group: draggedSlot.group
      };

      const success = await handleAttemptSlotUpdate(draggedSlot, updates);
      
      if (success) {
        setDraggedSlot(null);
      }
    } catch (error) {
      setError(error.message || 'Failed to update slot');
      setDraggedSlot(null);
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    setSelectedGroup('');
  };

  // Filter timetable by selected batch and group
  const filteredTimetable = timetable.filter(slot => {
    // Convert both to string for reliable comparison
    const slotBatchId = slot.batch && slot.batch._id ? slot.batch._id : slot.batch;
    const batchIdStr = String(slotBatchId);
    const selectedBatchStr = String(selectedBatch);

    if (!selectedBatch) return true;
    if (!selectedGroup) return batchIdStr === selectedBatchStr;
    return batchIdStr === selectedBatchStr && slot.group === Number(selectedGroup);
  });

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
        <Typography variant="h4" gutterBottom>
          Timetable Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {generationStatus && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              {generationStatus}
            </Typography>
            {loading && (
              <LinearProgress 
                variant="determinate" 
                value={generatingProgress} 
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        )}

        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Batch</InputLabel>
            <Select
              value={selectedBatch}
              label="Batch"
              onChange={handleBatchChange}
            >
              <MenuItem value="">All Batches</MenuItem>
              {batches.map((batch) => (
                <MenuItem key={batch._id} value={batch._id}>
                  {batch.batch_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
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

          <Button
            variant="contained"
            color="primary"
            onClick={() => setConfirmDialog(true)}
            disabled={loading}
          >
            Generate New Timetable
          </Button>
        </Box>

        <Paper elevation={2}>
          <DraggableTimetable
            timetable={filteredTimetable}
            selectedBatch={selectedBatch}
            selectedGroup={selectedGroup}
            onAttemptSlotUpdate={handleAttemptSlotUpdate}
          />
        </Paper>
      </Container>

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

      <Dialog open={conflictModalOpen} onClose={() => setConflictModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Slot Conflict</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This slot is already booked or has a conflict. Here are some available alternatives:
          </Typography>
          {alternatives.length === 0 ? (
            <Typography color="error">No alternatives found.</Typography>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 2,
              mt: 2
            }}>
              {alternatives.map((alt, idx) => (
                <Button
                  key={idx}
                  onClick={async () => {
                    const success = await handleAlternativeSelection(alt);
                    if (success) {
                      setConflictModalOpen(false);
                    }
                  }}
                  variant="outlined"
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white'
                    }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {alt.day}
                  </Typography>
                  <Typography variant="body2">
                    {alt.timeSlot}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hall: {alt.hall.hall_name}
                  </Typography>
                </Button>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictModalOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimetableManagement;
