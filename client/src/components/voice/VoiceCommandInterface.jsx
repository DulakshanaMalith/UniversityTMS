import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  History as HistoryIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { processVoiceCommand, getVoiceCommandHistory, getProductivityStats } from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

const COMMANDS = {
  student: [
    'Show my timetable',
    'Start productivity session',
    'Show productivity stats',
    'Show analytics',
    'Logout',
    'Read timetable',
    'Select group'
  ],
  lecturer: [
    'Show my timetable',
    'Show change requests',
    'Start productivity session',
    'Show productivity stats',
    'Show analytics',
    'Logout'
  ],
  admin: [
    'Show analytics',
    'Show productivity tracking',
    'Show voice commands',
    'Logout'
  ]
};

const VoiceCommandInterface = forwardRef(({ onSwitchTab, timetable, selectedGroup, onGroupSelect }, ref) => {
  const { user } = useSelector((state) => state.auth);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isReadingTimetable, setIsReadingTimetable] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize speech synthesis
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for better comprehension
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' && !isListening) {
        event.preventDefault();
        startListening();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isListening]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        speak('Listening...');
      };

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalText = event.results[i][0].transcript;
            setRecognizedText(finalText);
            console.log('Final recognized:', finalText);
            handleSpeechResult(finalText);
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) {
          setRecognizedText(interim);
          console.log('Interim recognized:', interim);
        }
      };

      recognition.onerror = (event) => {
        const errorMessage = `Speech recognition error: ${event.error}`;
        setError(errorMessage);
        speak(errorMessage);
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended');
      };

      recognitionRef.current = recognition;
    } else {
      const errorMessage = 'Speech recognition is not supported in this browser';
      console.warn(errorMessage);
      speak(errorMessage);
    }

    fetchCommandHistory();
    // eslint-disable-next-line
  }, []);

  const fetchCommandHistory = async () => {
    try {
      setLoading(true);
      const response = await getVoiceCommandHistory();
      setCommandHistory(response.data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const readTimetableSlot = (entry) => {
    const text = `
      Module: ${entry.module?.module_name || 'Unknown Module'}
      Time: ${entry.timeSlot}
      Day: ${entry.day}
      Hall: ${entry.hall?.hall_name || 'Unknown'}
      Lecturer: ${entry.lecturer?.user?.name || 'Unknown'}
      Week: ${entry.week || '?'}
    `;
    speak(text);
  };

  const readTimetable = () => {
    if (!timetable || timetable.length === 0) {
      speak('No timetable data available');
      return;
    }

    setIsReadingTimetable(true);
    speak(`Reading timetable for group ${selectedGroup}`);

    // Sort entries by day and time
    const sortedEntries = [...timetable].sort((a, b) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    // Group entries by day
    const entriesByDay = sortedEntries.reduce((acc, entry) => {
      if (!acc[entry.day]) {
        acc[entry.day] = [];
      }
      acc[entry.day].push(entry);
      return acc;
    }, {});

    // Read each day's entries with a delay between days
    let delay = 0;
    Object.entries(entriesByDay).forEach(([day, entries]) => {
      setTimeout(() => {
        speak(`For ${day}:`);
        entries.forEach((entry, index) => {
          setTimeout(() => {
            readTimetableSlot(entry);
          }, index * 1000); // 1 second delay between entries
        });
      }, delay);
      delay += entries.length * 1000 + 1000; // Add delay for all entries plus 1 second
    });

    // Reset reading state after all entries are read
    setTimeout(() => {
      setIsReadingTimetable(false);
    }, delay);
  };

  const readAnalytics = async () => {
    try {
      setLoading(true);
      const [prodRes, voiceRes] = await Promise.all([
        getProductivityStats({ userId: user?._id, groupBy: 'type' }),
        getVoiceCommandHistory({ userId: user?._id, limit: 1000 })
      ]);

      const prodStats = prodRes.data || [];
      const voiceStats = voiceRes.data || [];

      // Calculate voice command statistics
      const commandCounts = {};
      let successCount = 0;
      let failCount = 0;
      voiceStats.forEach(cmd => {
        commandCounts[cmd.command] = (commandCounts[cmd.command] || 0) + 1;
        if (cmd.success) successCount++; else failCount++;
      });

      // Read productivity statistics
      speak('Reading productivity statistics:');
      if (prodStats.length === 0) {
        speak('No productivity data available');
      } else {
        prodStats.forEach(stat => {
          const hours = Math.floor(stat.totalDuration / 60);
          const minutes = stat.totalDuration % 60;
          speak(`${stat._id.type}: ${hours} hours and ${minutes} minutes`);
        });
      }

      // Read voice command statistics
      speak('Reading voice command statistics:');
      if (voiceStats.length === 0) {
        speak('No voice command data available');
      } else {
        speak(`Total commands used: ${voiceStats.length}`);
        speak(`Successful commands: ${successCount}`);
        speak(`Failed commands: ${failCount}`);
        
        // Read most used commands
        speak('Most used commands:');
        const sortedCommands = Object.entries(commandCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3);
        
        sortedCommands.forEach(([command, count]) => {
          speak(`${command}: used ${count} times`);
        });
      }

      setLoading(false);
    } catch (error) {
      const errorMessage = 'Error reading analytics data';
      setError(errorMessage);
      speak(errorMessage);
      setLoading(false);
    }
  };

  const handleSpeechResult = async (command) => {
    try {
      setLoading(true);
      console.log('Processing voice command:', command);
      
      // Handle group selection command
      const groupMatch = command.match(/group (\d+)/i);
      if (groupMatch) {
        const groupNumber = parseInt(groupMatch[1]);
        if (onGroupSelect) {
          // Switch to timetable tab first
          if (onSwitchTab) {
            onSwitchTab('timetable');
          }
          
          // Wait for tab switch and data loading
          setTimeout(() => {
            onGroupSelect(groupNumber);
            speak(`Selected group ${groupNumber}. Loading timetable...`);
          }, 500);
        }
        return;
      }

      // Handle read timetable command
      if (command.toLowerCase().includes('read timetable')) {
        if (!timetable || timetable.length === 0) {
          speak('No timetable data available. Please select a group first.');
          return;
        }

        if (onSwitchTab) {
          onSwitchTab('timetable');
        }
        
        // Let the useEffect in StudentDashboard handle the actual reading
        speak('Loading timetable data...');
        return;
      }

      // Handle analytics command
      if (command.toLowerCase().includes('analytics') || command.toLowerCase().includes('show analytics')) {
        if (onSwitchTab) {
          onSwitchTab('analytics');
        }
        setTimeout(() => {
          readAnalytics();
        }, 1000);
        return;
      }

      const response = await processVoiceCommand(command);
      const action = response.data.action;
      
      // Provide TTS feedback for actions
      switch (action) {
        case 'navigate':
          speak(`Navigating to ${response.data.target}`);
          window.location.href = response.data.target;
          break;
        case 'logout':
          speak('Logging out');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 'startProductivity':
          speak('Starting productivity session');
          if (onSwitchTab) onSwitchTab('productivity');
          break;
        case 'showAnalytics':
        case 'show analytics':
          speak('Showing analytics');
          if (onSwitchTab) {
            onSwitchTab('analytics');
          } else {
            if (location.pathname.includes('/admin')) {
              navigate('/admin/analytics');
            }
          }
          setTimeout(() => {
            readAnalytics();
          }, 1000);
          break;
        case 'showProductivityTracking':
        case 'show productivity tracking':
          speak('Showing productivity tracking');
          if (onSwitchTab) {
            onSwitchTab('productivity');
          }
          break;
        case 'showVoiceCommands':
        case 'show voice commands':
          speak('Showing voice commands');
          if (onSwitchTab) {
            onSwitchTab('voice');
          }
          break;
        default:
          speak('Command not recognized');
          break;
      }
      
      fetchCommandHistory();
    } catch (error) {
      const errorMessage = error.message || 'Error processing command';
      setError(errorMessage);
      speak(errorMessage);
      console.error('Error processing command:', error);
    } finally {
      setLoading(false);
      setRecognizedText('');
    }
  };

  const startListening = () => {
    setRecognizedText('');
    setError(null);
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const role = user?.role || 'student';
  const availableCommands = COMMANDS[role] || COMMANDS.student;

  // Expose readTimetable to parent via ref
  useImperativeHandle(ref, () => ({
    readTimetable
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
          Voice Commands
        </Typography>
        <Tooltip title="Help: Available Commands">
          <IconButton onClick={() => setHelpOpen(true)}>
            <HelpIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Press Spacebar or click to start voice command
                </Typography>
                {isListening && (
                  <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                    {recognizedText ? `Heard: "${recognizedText}"` : 'Listening...'}
                  </Typography>
                )}
                {!isListening ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MicIcon />}
                    onClick={startListening}
                    size="large"
                  >
                    Start Listening
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<MicOffIcon />}
                    onClick={stopListening}
                    size="large"
                  >
                    Stop Listening
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Command History</Typography>
                <Tooltip title="Refresh">
                  <span>
                    <IconButton onClick={fetchCommandHistory} disabled={loading}>
                      <HistoryIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {commandHistory.map((item) => (
                    <ListItem key={item._id}>
                      <ListItemText
                        primary={item.command}
                        secondary={new Date(item.timestamp).toLocaleString()}
                      />
                      <Chip
                        label={item.success ? 'Success' : 'Failed'}
                        color={item.success ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)}>
        <DialogTitle>Available Voice Commands</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            For your role: <b>{role.charAt(0).toUpperCase() + role.slice(1)}</b>
          </Typography>
          <List>
            {availableCommands.map((cmd, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={cmd} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default VoiceCommandInterface; 