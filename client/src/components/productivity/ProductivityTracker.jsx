import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  startProductivitySession,
  endProductivitySession,
  getProductivityStats
} from '../../services/api';

const ProductivityTracker = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    type: 'study',
    activity: '',
    notes: ''
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getProductivityStats();
      setStats(response.data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    try {
      setLoading(true);
      const response = await startProductivitySession(formData);
      setActiveSession(response.data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      setLoading(true);
      await endProductivitySession(activeSession._id);
      setActiveSession(null);
      fetchStats();
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Productivity Tracker
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {activeSession ? 'Active Session' : 'Start New Session'}
              </Typography>

              {!activeSession ? (
                <Box component="form" sx={{ mt: 2 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      label="Type"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="study">Study</MenuItem>
                      <MenuItem value="teaching">Teaching</MenuItem>
                      <MenuItem value="admin">Administrative</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Activity"
                    name="activity"
                    value={formData.activity}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayIcon />}
                    onClick={handleStartSession}
                    disabled={loading || !formData.activity}
                    fullWidth
                  >
                    Start Session
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" gutterBottom>
                    {formatDuration(
                      Math.round((new Date() - new Date(activeSession.startTime)) / (1000 * 60))
                    )}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    {activeSession.activity}
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={handleEndSession}
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    End Session
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Statistics</Typography>
                <Tooltip title="Refresh">
                  <span>
                    <IconButton onClick={fetchStats} disabled={loading}>
                      <RefreshIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : stats ? (
                <Box>
                  {stats.map((stat, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        {stat._id.type.charAt(0).toUpperCase() + stat._id.type.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Duration: {formatDuration(stat.totalDuration)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Sessions: {stat.sessionCount}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary">No statistics available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductivityTracker; 