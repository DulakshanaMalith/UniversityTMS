import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Snackbar,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const DraggableTimetable = ({ timetable, selectedBatch, onSlotUpdate, onEditSlot }) => {
  const [error, setError] = React.useState('');
  const [errorDetails, setErrorDetails] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'];

  const getSessionColor = (sessionType) => {
    switch (sessionType) {
      case 'Lab':
        return 'primary';
      case 'Tutorial':
        return 'secondary';
      case 'Exam Prep':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Cancelled':
        return 'error';
      case 'Rescheduled':
        return 'warning';
      default:
        return 'success';
    }
  };

  const findAvailableSlots = (movedItem, conflictingSlot) => {
    const availableSlots = [];
    const week = movedItem.week;

    // Check all possible combinations of days and time slots
    days.forEach(day => {
      timeSlots.forEach(timeSlot => {
        // Skip the current slot and conflicting slot
        if ((day === movedItem.day && timeSlot === movedItem.timeSlot) ||
            (day === conflictingSlot.day && timeSlot === conflictingSlot.timeSlot)) {
          return;
        }

        // Check if this slot is available
        const isAvailable = !timetable.some(item => 
          item._id !== movedItem._id &&
          item.day === day &&
          item.timeSlot === timeSlot &&
          item.week === week &&
          (
            (item.batch?._id === movedItem.batch?._id && item.group === movedItem.group) ||
            (item.lecturer?._id === movedItem.lecturer?._id) ||
            (item.hall?._id === movedItem.hall?._id)
          )
        );

        if (isAvailable) {
          availableSlots.push({
            day,
            timeSlot,
            description: `${day} ${timeSlot}`
          });
        }
      });
    });

    return availableSlots;
  };

  const handleSuggestionSelect = async (suggestion) => {
    if (selectedSlot) {
      try {
        await onSlotUpdate(selectedSlot._id, {
          day: suggestion.day,
          timeSlot: suggestion.timeSlot
        });
        setShowSuggestions(false);
        setSelectedSlot(null);
        setSuggestions([]);
      } catch (error) {
        if (error.response?.status === 409) {
          const conflictData = error.response.data;
          let conflictReason = '';
          let conflictDetails = '';

          if (conflictData.type === 'BATCH_CONFLICT') {
            conflictReason = 'Batch Conflict';
            conflictDetails = `Batch ${conflictData.batchName} Group ${conflictData.group} already has ${conflictData.moduleName} at this time.`;
          } else if (conflictData.type === 'LECTURER_CONFLICT') {
            conflictReason = 'Lecturer Conflict';
            conflictDetails = `Lecturer ${conflictData.lecturerName} is already teaching ${conflictData.moduleName} at this time.`;
          } else if (conflictData.type === 'HALL_CONFLICT') {
            conflictReason = 'Hall Conflict';
            conflictDetails = `Hall ${conflictData.hallName} is already booked for ${conflictData.moduleName} at this time.`;
          }

          setError(conflictReason);
          setErrorDetails(conflictDetails);
          
          // Find new available slots excluding the failed one
          const newAvailableSlots = suggestions.filter(
            slot => !(slot.day === suggestion.day && slot.timeSlot === suggestion.timeSlot)
          );
          setSuggestions(newAvailableSlots);
        } else {
          setError('Update Failed');
          setErrorDetails('An unexpected error occurred while updating the slot. Please try again.');
        }
      }
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    setError('');
    setErrorDetails('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSlot(null);

    // Dropped outside the list
    if (!destination) {
      setError('Invalid Drop Location');
      setErrorDetails('You cannot drop the slot outside the timetable grid.');
      return;
    }

    // Find the moved item by source coordinates
    const sourceDay = source.droppableId.split('-')[0];
    const sourceTimeIndex = parseInt(source.droppableId.split('-')[1]);
    const sourceTime = timeSlots[sourceTimeIndex];

    const movedItem = timetable.find(item => 
      item.day === sourceDay && 
      item.timeSlot === sourceTime &&
      (!selectedBatch || item.batch?._id === selectedBatch)
    );

    if (!movedItem) {
      setError('Slot Not Found');
      setErrorDetails('The slot you are trying to move could not be found in the timetable.');
      return;
    }

    // Get destination day and time
    const destDay = destination.droppableId.split('-')[0];
    const destTimeIndex = parseInt(destination.droppableId.split('-')[1]);
    const destTime = timeSlots[destTimeIndex];

    // Don't update if nothing changed
    if (destDay === movedItem.day && destTime === movedItem.timeSlot) {
      setError('No Change Detected');
      setErrorDetails('The slot is already in the selected time slot.');
      return;
    }

    // Check if there's already an item at the destination
    const conflictingSlot = timetable.find(item => 
      item._id !== movedItem._id && 
      item.day === destDay && 
      item.timeSlot === destTime &&
      item.week === movedItem.week &&
      (
        (item.batch?._id === movedItem.batch?._id && item.group === movedItem.group) ||
        (item.lecturer?._id === movedItem.lecturer?._id) ||
        (item.hall?._id === movedItem.hall?._id)
      )
    );

    if (conflictingSlot) {
      let conflictReason = '';
      let conflictDetails = '';
      
      if (conflictingSlot.batch?._id === movedItem.batch?._id && conflictingSlot.group === movedItem.group) {
        conflictReason = 'Batch Conflict';
        conflictDetails = `Batch ${conflictingSlot.batch?.batch_name || 'Unknown'} Group ${conflictingSlot.group} already has ${conflictingSlot.module?.module_name || 'Unknown Module'} at this time.`;
      } else if (conflictingSlot.lecturer?._id === movedItem.lecturer?._id) {
        conflictReason = 'Lecturer Conflict';
        conflictDetails = `Lecturer ${conflictingSlot.lecturer?.user?.name || 'Unknown'} is already teaching ${conflictingSlot.module?.module_name || 'Unknown Module'} at this time.`;
      } else if (conflictingSlot.hall?._id === movedItem.hall?._id) {
        conflictReason = 'Hall Conflict';
        conflictDetails = `Hall ${conflictingSlot.hall?.hall_name || 'Unknown'} is already booked for ${conflictingSlot.module?.module_name || 'Unknown Module'} at this time.`;
      }
      
      setError(conflictReason);
      setErrorDetails(conflictDetails);
      
      // Find available slots
      const availableSlots = findAvailableSlots(movedItem, conflictingSlot);
      setSuggestions(availableSlots);
      setSelectedSlot(movedItem);
      setShowSuggestions(true);
      
      return;
    }

    try {
      await onSlotUpdate(movedItem._id, {
        day: destDay,
        timeSlot: destTime
      });
    } catch (error) {
      if (error.response?.status === 409) {
        const conflictData = error.response.data;
        let conflictReason = '';
        let conflictDetails = '';

        if (conflictData.type === 'BATCH_CONFLICT') {
          conflictReason = 'Batch Conflict';
          conflictDetails = `Batch ${conflictData.batchName} Group ${conflictData.group} already has ${conflictData.moduleName} at this time.`;
        } else if (conflictData.type === 'LECTURER_CONFLICT') {
          conflictReason = 'Lecturer Conflict';
          conflictDetails = `Lecturer ${conflictData.lecturerName} is already teaching ${conflictData.moduleName} at this time.`;
        } else if (conflictData.type === 'HALL_CONFLICT') {
          conflictReason = 'Hall Conflict';
          conflictDetails = `Hall ${conflictData.hallName} is already booked for ${conflictData.moduleName} at this time.`;
        }

        setError(conflictReason);
        setErrorDetails(conflictDetails);
        
        // Find available slots
        const availableSlots = findAvailableSlots(movedItem, null);
        setSuggestions(availableSlots);
        setSelectedSlot(movedItem);
        setShowSuggestions(true);
      } else {
        setError('Update Failed');
        setErrorDetails('An unexpected error occurred while updating the slot. Please try again.');
      }
    }
  };

  const renderTimetableCell = (day, timeSlot, entries) => {
    if (!entries || entries.length === 0) {
      return null;
    }

    return entries.map((entry, index) => (
      <Draggable
        key={entry._id}
        draggableId={entry._id}
        index={index}
        isDragDisabled={!!selectedBatch && entry.batch?._id !== selectedBatch}
      >
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            sx={{
              p: 1,
              mb: 1,
              backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              transition: 'background-color 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {entry.module_name}
              </Typography>
              <Box>
                <Chip
                  label={entry.sessionType || 'Lecture'}
                  size="small"
                  color={getSessionColor(entry.sessionType)}
                  sx={{ mr: 0.5 }}
                />
                <Chip
                  label={entry.status || 'Scheduled'}
                  size="small"
                  color={getStatusColor(entry.status)}
                  sx={{ mr: 0.5 }}
                />
                <Tooltip title="Edit Slot">
                  <IconButton
                    size="small"
                    onClick={() => onEditSlot(entry)}
                    sx={{ p: 0.5 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Typography variant="caption" display="block">
              Lecturer: {entry.lecturer}
            </Typography>
            <Typography variant="caption" display="block">
              Hall: {entry.hall_name}
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
              Week: {entry.week}
            </Typography>
            {entry.notes && (
              <Collapse in={true}>
                <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                  {entry.notes}
                </Typography>
              </Collapse>
            )}
          </Box>
        )}
      </Draggable>
    ));
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Time / Day</TableCell>
                {days.map(day => (
                  <TableCell key={day} align="center" sx={{ fontWeight: 'bold', minWidth: 200 }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSlots.map((timeSlot, timeIndex) => (
                <TableRow key={timeSlot}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{timeSlot}</TableCell>
                  {days.map(day => {
                    const droppableId = `${day}-${timeIndex}`;
                    const entries = timetable.filter(
                      entry => entry.day === day && entry.timeSlot === timeSlot
                    );
                    
                    return (
                      <TableCell 
                        key={droppableId}
                        sx={{ 
                          minWidth: 200,
                          border: '1px solid #ccc',
                          p: 0,
                          height: '120px',
                          backgroundColor: 'background.paper'
                        }}
                      >
                        <Droppable droppableId={droppableId}>
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              sx={{
                                height: '100%',
                                backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                                transition: 'background-color 0.2s ease',
                                p: 1
                              }}
                            >
                              {renderTimetableCell(day, timeSlot, entries)}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DragDropContext>

      {/* Suggestions Dialog */}
      <Dialog 
        open={showSuggestions} 
        onClose={() => setShowSuggestions(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Available Alternative Slots
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            The following slots are available for your selection:
          </Typography>
          <List>
            {suggestions.map((suggestion, index) => (
              <ListItem 
                key={index}
                button
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <ListItemText 
                  primary={suggestion.description}
                  secondary={`Week ${selectedSlot?.week}`}
                />
                <SwapIcon color="primary" />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuggestions(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => {
          setError('');
          setErrorDetails('');
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => {
            setError('');
            setErrorDetails('');
          }} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {error}
            </Typography>
            <Typography variant="body2">
              {errorDetails}
            </Typography>
            {suggestions.length > 0 && (
              <Button
                size="small"
                color="primary"
                onClick={() => setShowSuggestions(true)}
                sx={{ mt: 1 }}
              >
                View Available Alternatives
              </Button>
            )}
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
};

export default DraggableTimetable;
