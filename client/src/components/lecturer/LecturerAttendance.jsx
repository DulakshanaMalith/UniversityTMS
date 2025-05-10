import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, MenuItem, Select, InputLabel, FormControl, Alert, Paper, Grid, CircularProgress } from '@mui/material';
import { getLecturerBatches, startAttendanceSession, stopAttendanceSession, getAttendanceSession, generateAttendancePDF } from '../../services/api';

const LecturerAttendance = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      const batch = batches.find(b => b._id === selectedBatch);
      if (batch) {
        setGroupOptions(Array.from({ length: batch.group_count }, (_, i) => i + 1));
      } else {
        setGroupOptions([]);
      }
    } else {
      setGroupOptions([]);
    }
    setSelectedGroup('');
    setSession(null);
  }, [selectedBatch, batches]);

  useEffect(() => {
    if (selectedBatch && selectedGroup) {
      fetchSession();
    } else {
      setSession(null);
    }
    // eslint-disable-next-line
  }, [selectedBatch, selectedGroup]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await getLecturerBatches();
      setBatches(res.data || []);
    } catch (err) {
      setError('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceSession(selectedBatch, selectedGroup);
      setSession(res.data);
    } catch (err) {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await startAttendanceSession(selectedBatch, selectedGroup);
      setSession(res.data);
      setSuccess('Attendance session started.');
    } catch (err) {
      setError('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await stopAttendanceSession(session._id);
      setSession(res.data);
      setSuccess('Attendance session stopped.');
    } catch (err) {
      setError('Failed to stop session');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await generateAttendancePDF(session._id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${session._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to generate PDF');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Attendance Session</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel>Batch</InputLabel>
              <Select
                value={selectedBatch}
                label="Batch"
                onChange={e => setSelectedBatch(e.target.value)}
              >
                {batches.map(batch => (
                  <MenuItem key={batch._id} value={batch._id}>{batch.batch_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Group</InputLabel>
              <Select
                value={selectedGroup}
                label="Group"
                onChange={e => setSelectedGroup(e.target.value)}
                disabled={!selectedBatch}
              >
                {groupOptions.map(group => (
                  <MenuItem key={group} value={group}>Group {group}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            {!session || session.status === 'closed' ? (
              <Button variant="contained" color="primary" onClick={handleStart} disabled={!selectedBatch || !selectedGroup || loading}>
                Start Attendance
              </Button>
            ) : (
              <Button variant="contained" color="error" onClick={handleStop} disabled={loading}>
                Stop Attendance
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
      {session && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Session Status: {session.status}</Typography>
          <Typography>Started: {new Date(session.createdAt).toLocaleString()}</Typography>
          {session.closedAt && <Typography>Closed: {new Date(session.closedAt).toLocaleString()}</Typography>}
          <Typography sx={{ mt: 2, mb: 1 }}>Responses ({session.responses.length}):</Typography>
          <ul>
            {session.responses.map((r, i) => (
              <li key={r.student?._id || i}>
                {r.student?.name || 'Unknown'} ({r.student?.email || 'Unknown'}) - {new Date(r.markedAt).toLocaleString()}
              </li>
            ))}
          </ul>
          <Button variant="outlined" color="secondary" onClick={handleDownloadPDF} sx={{ mt: 2 }}>
            Download PDF
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default LecturerAttendance; 