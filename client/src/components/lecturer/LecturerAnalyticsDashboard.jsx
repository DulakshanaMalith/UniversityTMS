import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getProductivityStats, getVoiceCommandHistory, getStoredUser } from '../../services/api';

const LecturerAnalyticsDashboard = () => {
  const user = getStoredUser();
  const [prodStats, setProdStats] = useState([]);
  const [voiceStats, setVoiceStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodRes, voiceRes] = await Promise.all([
        getProductivityStats({ userId: user?._id, groupBy: 'type' }),
        getVoiceCommandHistory({ userId: user?._id, limit: 1000 })
      ]);
      setProdStats(prodRes.data || []);
      setVoiceStats(voiceRes.data || []);
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Prepare voice command stats
  const commandCounts = {};
  let successCount = 0;
  let failCount = 0;
  voiceStats.forEach(cmd => {
    commandCounts[cmd.command] = (commandCounts[cmd.command] || 0) + 1;
    if (cmd.success) successCount++; else failCount++;
  });
  const commandData = Object.entries(commandCounts).map(([command, count]) => ({ command, count }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Analytics
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Productivity by Type</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prodStats}>
                  <XAxis dataKey="_id.type" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="totalDuration" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Voice Command Usage</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={commandData}>
                  <XAxis dataKey="command" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Voice Command Success Rate</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Success', value: successCount },
                      { name: 'Failed', value: failCount }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#ffc658"
                    label
                  >
                    <Cell fill="#4caf50" />
                    <Cell fill="#f44336" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default LecturerAnalyticsDashboard; 