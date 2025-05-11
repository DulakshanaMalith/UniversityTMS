import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert, 
  Grid,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  Button
} from '@mui/material';
import { useSelector } from 'react-redux';
import { getStudentAssignments } from '../../services/api';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookIcon from '@mui/icons-material/Book';
import GroupIcon from '@mui/icons-material/Group';
import RefreshIcon from '@mui/icons-material/Refresh';
import { SLIIT_LOGO } from '../../assets/images';

const Countdown = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(deadline);
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft('Deadline passed');
        setIsOverdue(true);
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      // Show only relevant time units
      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0 || days > 0) timeString += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
      timeString += `${seconds}s`;

      setTimeLeft(timeString);
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <Chip
      icon={<AccessTimeIcon />}
      label={timeLeft}
      color={isOverdue ? "error" : "primary"}
      variant={isOverdue ? "filled" : "outlined"}
      sx={{
        mt: 1,
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: isOverdue ? 'white' : 'primary.main'
        }
      }}
    />
  );
};

const StudentAssignments = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await getStudentAssignments();
      if (res.success) {
        setAssignments(res.data);
      } else {
        setError(res.message || 'Failed to fetch assignments');
      }
    } catch (err) {
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const getStatusColor = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff <= 0) return 'error';
    if (daysLeft <= 1) return 'warning';
    if (daysLeft <= 3) return 'info';
    return 'success';
  };

  return (
    <Box sx={{ 
      position: 'relative',
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
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Assignments
            </Typography>
          </Box>
          <Tooltip title="Refresh assignments">
            <IconButton 
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : assignments.length === 0 ? (
          <Card sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
          }}>
            <Typography variant="h6" color="text.secondary">
              No assignments found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Check back later for new assignments
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {assignments.map(assignment => (
              <Grid item xs={12} md={6} key={assignment._id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          flex: 1,
                          mr: 2
                        }}
                      >
                        {assignment.title}
                      </Typography>
                      <Chip
                        label={new Date(assignment.deadline).toLocaleDateString()}
                        color={getStatusColor(assignment.deadline)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 2,
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {assignment.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BookIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          <Typography variant="caption" color="text.secondary">
                            {assignment.module?.module_name || 'Unknown Module'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GroupIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          <Typography variant="caption" color="text.secondary">
                            {assignment.batch?.batch_name || 'Unknown Batch'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                      <Countdown deadline={assignment.deadline} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default StudentAssignments; 