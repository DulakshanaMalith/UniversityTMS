import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Card, CardContent, useTheme, alpha, IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import { getOpenAttendanceSession, markAttendance } from '../../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RefreshIcon from '@mui/icons-material/Refresh';
import { SLIIT_LOGO } from '../../assets/images';

const StudentAttendance = ({ batchId, group }) => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [marked, setMarked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (batchId && group) {
      fetchSession();
    }
  }, [batchId, group]);

  const fetchSession = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await getOpenAttendanceSession(batchId, group);
      setSession(res.data);
      if (res.data && res.data.responses.some(r => r.student === user._id)) {
        setMarked(true);
      } else {
        setMarked(false);
      }
    } catch (err) {
      setSession(null);
      setMarked(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMark = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await markAttendance(session._id);
      setSuccess('Attendance marked successfully!');
      setMarked(true);
      fetchSession();
    } catch (err) {
      setError('Failed to mark attendance or already marked.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSession();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (!session) return null;

  return (
    <Box sx={{
      position: 'relative',
      my: 3,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '160px',
        height: '160px',
        background: `url(${SLIIT_LOGO}) no-repeat center center`,
        backgroundSize: 'contain',
        opacity: 0.07,
        zIndex: 0
      }
    }}>
      <Card sx={{ position: 'relative', zIndex: 1, maxWidth: 480, mx: 'auto', boxShadow: 4, borderRadius: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventAvailableIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Attendance Open
              </Typography>
            </Box>
            <Tooltip title="Refresh session">
              <span>
                <IconButton onClick={handleRefresh} disabled={refreshing} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) } }}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mark your attendance for your group. Only one submission is allowed per session.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Button
            variant="contained"
            color={marked ? 'success' : 'primary'}
            onClick={handleMark}
            disabled={marked}
            startIcon={marked ? <CheckCircleIcon /> : <EventAvailableIcon />}
            sx={{ mt: 1, fontWeight: 600, fontSize: 16, px: 4, py: 1.5, boxShadow: 2 }}
            aria-label={marked ? 'Attendance Marked' : 'Mark Attendance'}
          >
            {marked ? 'Attendance Marked' : 'Mark Attendance'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentAttendance; 