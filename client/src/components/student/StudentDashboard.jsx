import React, { useState, useEffect, useRef } from 'react';
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
  Container,
  Tab,
  Tabs,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { getStudentTimetable, getStudentBatches } from '../../services/api';
import { useSelector } from 'react-redux';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ProductivityTracker from '../productivity/ProductivityTracker';
import VoiceCommandInterface from '../voice/VoiceCommandInterface';
import StudentAnalyticsDashboard from './StudentAnalyticsDashboard';
import StudentAssignments from './StudentAssignments';
import StudentAttendance from './StudentAttendance';
import { SLIIT_LOGO } from '../../assets/images';

const StudentDashboard = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [pendingVoiceRead, setPendingVoiceRead] = useState(false);
  const [pendingVoiceGroup, setPendingVoiceGroup] = useState(null);
  const voiceRef = useRef();

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch && selectedGroup) {
      fetchTimetable();
    }
  }, [selectedBatch, selectedGroup]);

  useEffect(() => {
    if (
      pendingVoiceGroup !== null &&
      currentTab === 1 &&
      voiceRef.current &&
      String(selectedGroup) === String(pendingVoiceGroup) &&
      timetable.length > 0
    ) {
      console.log('Timetable data ready for TTS:', {
        group: selectedGroup,
        entries: timetable.length
      });
      
      setTimeout(() => {
        if (voiceRef.current?.readTimetable) {
          voiceRef.current.readTimetable();
        }
        setPendingVoiceGroup(null);
      }, 500);
    }
  }, [timetable, selectedGroup, currentTab, pendingVoiceGroup]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await getStudentBatches();
      console.log('Batches response:', response);
      
      if (response.success && response.data) {
        const batchData = [{
          _id: response.data.batch._id,
          batch_name: response.data.batch.batch_name,
          batch_code: response.data.batch.batch_code,
          group_count: response.data.batch.group_count,
          student_group: response.data.group
        }];
        
        setBatches(batchData);
        setSelectedBatch(batchData[0]._id);
        setSelectedGroup(batchData[0].student_group);
      } else {
        setBatches([]);
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
      const response = await getStudentTimetable(selectedBatch, Number(selectedGroup));
      console.log('Timetable response for group', selectedGroup, response);
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
      return <TableCell key={`${day}-${timeSlot}-empty`} />;
    }

    return (
      <TableCell key={`${day}-${timeSlot}`}>
        {entries.map((entry, index) => (
          <Box 
            key={`${entry._id}-${index}`} 
            sx={{ 
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {entry.module?.module_name || 'Unknown Module'}
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
              Lecturer: {entry.lecturer?.user?.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
              Hall: {entry.hall?.hall_name || 'Unknown'}
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
              Week: {entry.week || '?'}
            </Typography>
          </Box>
        ))}
      </TableCell>
    );
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add SLIIT logo
    doc.addImage(SLIIT_LOGO, 'PNG', 14, 10, 30, 30);
    
    // Add title with styling
    doc.setFontSize(20);
    doc.setTextColor(0, 86, 169); // SLIIT blue
    doc.text('Student Timetable', 50, 30);

    // Add student info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Batch: ${selectedBatchData?.batch_name || ''}`, 14, 45);
    doc.text(`Group: ${selectedGroup}`, 14, 52);

    // Prepare table data
    const tableColumn = ['Time / Day', ...days];
    const tableRows = timeSlots.map(timeSlot => {
      const row = [timeSlot];
      days.forEach(day => {
        const entries = timetable.filter(
          entry => entry.day === day && entry.timeSlot === timeSlot
        );
        if (entries.length === 0) {
          row.push('');
        } else {
          row.push(entries.map(e =>
            `${e.module?.module_name || ''}\nLecturer: ${e.lecturer?.user?.name || ''}\nHall: ${e.hall?.hall_name || ''}`
          ).join('\n\n'));
        }
      });
      return row;
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      styles: { 
        fontSize: 8, 
        cellWidth: 'wrap',
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [0, 86, 169], // SLIIT blue
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });

    doc.save('sliit-timetable.pdf');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      py: 4
    }}>
      <Container maxWidth="xl">
        <Card sx={{ 
          mb: 4, 
          p: 3, 
          boxShadow: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: `url(${SLIIT_LOGO}) no-repeat center center`,
            backgroundSize: 'contain',
            opacity: 0.05,
            zIndex: 0
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 700, 
                letterSpacing: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              Student Dashboard
              <Chip 
                label={`Batch ${selectedBatchData?.batch_name || ''} - Group ${selectedGroup}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  animation: 'fadeIn 0.3s ease-in-out',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
              textColor="primary"
              indicatorColor="secondary"
              sx={{ 
                mb: 3,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: 120
                }
              }}
            >
              <Tab label="Productivity" />
              <Tab label="Voice Commands" />
              <Tab label="Timetable" />
              <Tab label="Analytics" />
              <Tab label="Assignments" />
            </Tabs>

            <Divider sx={{ mb: 3 }} />

            {currentTab === 0 && (
              <Box sx={{ p: 2 }}>
                <ProductivityTracker />
              </Box>
            )}

            {currentTab === 1 && (
              <Box sx={{ p: 2 }}>
                <VoiceCommandInterface 
                  ref={voiceRef}
                  onSwitchTab={(tab) => {
                    if (tab === 'productivity') setCurrentTab(0);
                    else if (tab === 'voice') setCurrentTab(1);
                    else if (tab === 'timetable') setCurrentTab(2);
                    else if (tab === 'analytics') setCurrentTab(3);
                    else if (tab === 'assignments') setCurrentTab(4);
                  }}
                  timetable={timetable}
                  selectedGroup={selectedGroup}
                  onGroupSelect={(group) => {
                    setSelectedGroup(Number(group));
                    setPendingVoiceGroup(Number(group));
                    if (voiceRef.current?.speak) {
                      voiceRef.current.speak(`Loading timetable for group ${group}`);
                    }
                  }}
                />
              </Box>
            )}

            {currentTab === 2 && (
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="batch-label">Batch</InputLabel>
                      <Select
                        labelId="batch-label"
                        value={selectedBatch}
                        label="Batch"
                        onChange={e => setSelectedBatch(e.target.value)}
                        required
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        {batches.map(batch => (
                          <MenuItem key={batch._id} value={batch._id}>
                            {batch.batch_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="group-label">Group</InputLabel>
                      <Select
                        labelId="group-label"
                        value={selectedGroup}
                        label="Group"
                        onChange={e => setSelectedGroup(e.target.value)}
                        required
                        sx={{
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        {groupOptions.map(group => (
                          <MenuItem key={group} value={group}>
                            Group {group}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: -48, right: 0, zIndex: 1 }}>
                      <Tooltip title="Download PDF">
                        <IconButton 
                          onClick={handleDownloadPDF}
                          color="primary"
                          sx={{ 
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <TableContainer 
                      component={Paper} 
                      sx={{ 
                        boxShadow: 3,
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell 
                              sx={{ 
                                bgcolor: 'primary.main',
                                color: 'white',
                                fontWeight: 'bold',
                                width: '120px'
                              }}
                            >
                              Time / Day
                            </TableCell>
                            {days.map(day => (
                              <TableCell 
                                key={day}
                                sx={{ 
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              >
                                {day}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {timeSlots.map(timeSlot => (
                            <TableRow key={timeSlot}>
                              <TableCell 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  fontWeight: 'bold'
                                }}
                              >
                                {timeSlot}
                              </TableCell>
                              {days.map(day => renderTimetableCell(day, timeSlot))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            )}

            {currentTab === 3 && (
              <Box sx={{ p: 2 }}>
                <StudentAnalyticsDashboard />
              </Box>
            )}

            {currentTab === 4 && (
              <Box sx={{ p: 2 }}>
                <StudentAssignments />
              </Box>
            )}
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
