import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  Alert, 
  Grid, 
  Card,
  CircularProgress,
  IconButton,
  Paper,
  Divider,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useSelector } from 'react-redux';
import { getLecturerBatches, getModulesByBatch, createAssignment, getMyAssignments, updateAssignment, deleteAssignment } from '../../services/api';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { SLIIT_LOGO } from '../../assets/images';

const LecturerAssignments = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [deadlineTime, setDeadlineTime] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchModules(selectedBatch);
    } else {
      setModules([]);
    }
  }, [selectedBatch]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await getLecturerBatches();
      setBatches(response.data || []);
    } catch (err) {
      setError('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (batchId) => {
    setLoading(true);
    try {
      const response = await getModulesByBatch(batchId);
      setModules(response.data || []);
    } catch (err) {
      setError('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await getMyAssignments();
      setAssignments(res.data);
    } catch (err) {
      setError('Failed to fetch assignments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (!deadlineDate || !deadlineTime) {
        setError('Please select both date and time for the deadline.');
        return;
      }

      const date = new Date(deadlineDate);
      const time = new Date(deadlineTime);
      date.setHours(time.getHours());
      date.setMinutes(time.getMinutes());
      date.setSeconds(0);
      date.setMilliseconds(0);

      const res = await createAssignment({
        title,
        description,
        batch: selectedBatch,
        module: selectedModule,
        deadline: date.toISOString()
      });

      if (res.success) {
        setSuccess('Assignment created successfully!');
        // Reset form
        setTitle('');
        setDescription('');
        setDeadlineDate(null);
        setDeadlineTime(null);
        setSelectedBatch('');
        setSelectedModule('');
      } else {
        setError(res.message || 'Failed to create assignment');
      }
    } catch (err) {
      setError('Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setForm({
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline ? assignment.deadline.substring(0, 16) : ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await updateAssignment(selectedAssignment._id, form);
      setEditDialogOpen(false);
      fetchAssignments();
    } catch (err) {
      setError('Failed to update assignment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      fetchAssignments();
    } catch (err) {
      setError('Failed to delete assignment');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      py: 4,
      px: 2
    }}>
      <Card sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: 4, 
        boxShadow: 3, 
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative' }}>
          <IconButton 
            onClick={() => navigate('/lecturer/dashboard')}
            sx={{ mr: 2, color: 'primary.main' }}
            aria-label="Back to dashboard"
          >
            <ArrowBackIcon />
          </IconButton>
          <AssignmentIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1 }} />
          <Typography variant="h4" sx={{ 
            color: 'primary.main', 
            fontWeight: 700, 
            letterSpacing: 1,
            flex: 1
          }}>
            Create New Assignment
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

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
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              animation: 'fadeIn 0.3s ease-in-out',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
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
                  <InputLabel id="module-label">Module</InputLabel>
                  <Select
                    labelId="module-label"
                    value={selectedModule}
                    label="Module"
                    onChange={e => setSelectedModule(e.target.value)}
                    required
                    disabled={!selectedBatch}
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    {modules.map(module => (
                      <MenuItem key={module._id} value={module._id}>
                        {module.module_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  fullWidth
                  required
                  helperText="Enter a short, descriptive title for the assignment"
                  sx={{
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  helperText="Provide clear instructions and requirements for the assignment"
                  sx={{
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Deadline Date"
                    value={deadlineDate}
                    onChange={setDeadlineDate}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required 
                        helperText="Select the due date"
                        sx={{
                          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Deadline Time"
                    value={deadlineTime}
                    onChange={setDeadlineTime}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required 
                        helperText="Select the due time"
                        sx={{
                          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={submitting}
                  sx={{
                    py: 1.5,
                    mt: 2,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  {submitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Assignment'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Card>

      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>My Assignments</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((a) => (
              <TableRow key={a._id}>
                <TableCell>{a.title}</TableCell>
                <TableCell>{a.description}</TableCell>
                <TableCell>{a.batch?.batch_name}</TableCell>
                <TableCell>{a.module?.module_name}</TableCell>
                <TableCell>{a.deadline ? new Date(a.deadline).toLocaleString() : ''}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(a)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(a._id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Assignment</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            label="Deadline"
            type="datetime-local"
            value={form.deadline}
            onChange={e => setForm({ ...form, deadline: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LecturerAssignments; 