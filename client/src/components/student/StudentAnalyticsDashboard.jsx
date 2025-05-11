import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Grid, useTheme, alpha, Divider, IconButton, Tooltip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getProductivityStats, getVoiceCommandHistory, getStoredUser } from '../../services/api';
import BarChartIcon from '@mui/icons-material/BarChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import { SLIIT_LOGO } from '../../assets/images';

const StudentAnalyticsDashboard = () => {
  const theme = useTheme();
  const user = getStoredUser();
  const [prodStats, setProdStats] = useState([]);
  const [voiceStats, setVoiceStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
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
    <Box sx={{
      position: 'relative',
      minHeight: '100vh',
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
      <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 1, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChartIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
              My Analytics
            </Typography>
          </Box>
          <Tooltip title="Refresh analytics">
            <span>
              <IconButton onClick={handleRefresh} disabled={refreshing} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) } }}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>Productivity by Type</Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prodStats}>
                    <XAxis dataKey="_id.type" tick={{ fontWeight: 500, fontSize: 13 }} />
                    <YAxis allowDecimals={false} tick={{ fontWeight: 500, fontSize: 13 }} />
                    <ReTooltip />
                    <Bar dataKey="totalDuration" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>Voice Command Usage</Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={commandData}>
                    <XAxis dataKey="command" tick={{ fontWeight: 500, fontSize: 13 }} />
                    <YAxis allowDecimals={false} tick={{ fontWeight: 500, fontSize: 13 }} />
                    <ReTooltip />
                    <Bar dataKey="count" fill={theme.palette.secondary.main} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>Voice Command Success Rate</Typography>
                <Divider sx={{ mb: 2 }} />
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
                    <ReTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default StudentAnalyticsDashboard; 