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
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getSlotAlternatives } from '../../services/api';

const timeSlots = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DraggableTimetable = ({ timetable = [], selectedBatch, selectedGroup, onAttemptSlotUpdate }) => {
  const [error, setError] = React.useState('');

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    setError('');
    if (!destination) return;

    const sourceDay = source.droppableId.split('-')[0];
    const sourceTimeIndex = parseInt(source.droppableId.split('-')[1]);
    const sourceTime = timeSlots[sourceTimeIndex];
    const movedItem = timetable.find(item => 
      item.day === sourceDay && 
      item.timeSlot === sourceTime &&
      (!selectedBatch || item.batch?._id === selectedBatch)
    );
    if (!movedItem) {
      setError('Could not find the slot you are trying to move');
      return;
    }
    const destDay = destination.droppableId.split('-')[0];
    const destTimeIndex = parseInt(destination.droppableId.split('-')[1]);
    const destTime = timeSlots[destTimeIndex];
    if (destDay === movedItem.day && destTime === movedItem.timeSlot) return;

    // Always delegate update attempts to parent
    onAttemptSlotUpdate(movedItem, {
      day: destDay,
      timeSlot: destTime
    });
  };

  const getSlotContent = (day, timeSlot) => {
    const slot = timetable.find(item => 
      item.day === day && 
      item.timeSlot === timeSlot &&
      (!selectedBatch || (item.batch && item.batch._id === selectedBatch))
    );

    if (!slot) return null;

    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {slot.module?.module_name || 'Unknown Module'}
        </Typography>
        <Typography variant="caption" display="block">
          Batch: {slot.batch?.batch_name || 'Unknown Batch'}
        </Typography>
        <Typography variant="caption" display="block">
          Hall: {slot.hall?.hall_name || 'Unknown Hall'}
        </Typography>
        <Typography variant="caption" display="block">
          Lecturer: {typeof slot.lecturer === 'string' ? slot.lecturer : (slot.lecturer?.name || 'Unknown Lecturer')}
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
          Group: {slot.group || '?'}, Week: {slot.week || '?'}
        </Typography>
      </Box>
    );
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
                    const slot = timetable.find(item => 
                      item.day === day && 
                      item.timeSlot === timeSlot &&
                      (!selectedBatch || (item.batch && item.batch._id === selectedBatch))
                    );
                    
                    const droppableId = `${day}-${timeIndex}`;
                    
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
                                transition: 'background-color 0.2s ease'
                              }}
                            >
                              {slot && (
                                <Draggable draggableId={slot._id} index={0}>
                                  {(provided, snapshot) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{
                                        backgroundColor: snapshot.isDragging ? 'primary.light' : 'primary.main',
                                        color: 'white',
                                        borderRadius: 1,
                                        m: 1,
                                        userSelect: 'none'
                                      }}
                                    >
                                      {getSlotContent(day, timeSlot)}
                                    </Box>
                                  )}
                                </Draggable>
                              )}
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
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DraggableTimetable;
