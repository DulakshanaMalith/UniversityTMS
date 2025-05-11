import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  MenuItem,
  Alert,
  Container,
  CircularProgress,
  FormControlLabel,
  Switch,
  useTheme,
  alpha
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { getModules, addModule, updateModule, deleteModule, getLecturers, getBatches } from '../../services/api';
import { SLIIT_LOGO } from '../../assets/images';

const specializationOptions = [
  'Software Engineering',
  'Network Engineering',
  'Data Science',
  'Artificial Intelligence',
  'Cybersecurity',
  'Database Systems',
  'Web Development'
];

const ModuleManagement = () => {
  const [modules, setModules] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    module_name: '',
    credit_hours: '',
    specialization: '',
    is_lab: false,
    lecturers: [],
    batches: []
  });
  const [validationErrors, setValidationErrors] = useState({
    module_name: '',
    credit_hours: '',
    specialization: '',
    lecturers: '',
    batches: ''
  });
  const theme = useTheme();

  useEffect(() => {
    fetchModules();
    fetchLecturers();
    fetchBatches();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const data = await getModules();
      console.log('Fetched modules:', data);
      setModules(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
      setError(error.message || 'Failed to fetch modules. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const data = await getLecturers();
      setLecturers(data || []);
      console.log('Fetched lecturers:', data);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      setError('Failed to fetch lecturers. Please try again later.');
      setLecturers([]);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await getBatches();
      if (Array.isArray(response)) {
        setBatches(response);
      } else if (response.data && Array.isArray(response.data)) {
        setBatches(response.data);
      } else {
        setBatches([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      setBatches([]);
      setError('Failed to fetch batches. Please try again later.');
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormData({
      module_name: '',
      credit_hours: '',
      specialization: '',
      is_lab: false,
      lecturers: [],
      batches: []
    });
    setError(null);
  };

  const handleEdit = (module) => {
    setSelectedModule(module);
    setFormData({
      module_name: module.module_name,
      credit_hours: module.credit_hours.toString(),
      specialization: module.specialization || '',
      is_lab: module.is_lab,
      lecturers: module.lecturers?.map(l => l._id) || [],
      batches: Array.isArray(module.batches) ? module.batches.map(b => b._id || b) : []
    });
    setEditMode(true);
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedModule(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    let newValue = name === 'is_lab' ? checked : value;
    if (name === 'batches') {
      newValue = typeof value === 'string' ? value.split(',') : value;
    }
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    const error = validateField(name, newValue);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const errors = {
      module_name: validateField('module_name', formData.module_name),
      credit_hours: validateField('credit_hours', formData.credit_hours),
      specialization: validateField('specialization', formData.specialization),
      lecturers: validateField('lecturers', formData.lecturers),
      batches: validateField('batches', formData.batches)
    };
    setValidationErrors(errors);
    if (Object.values(errors).some(error => error !== '')) {
      return;
    }
    try {
      const payload = {
        module_name: formData.module_name,
        credit_hours: Number(formData.credit_hours),
        specialization: formData.specialization,
        is_lab: formData.is_lab,
        lecturer_ids: formData.lecturers,
        batch_ids: formData.batches
      };
      if (editMode) {
        await updateModule(selectedModule._id, payload);
      } else {
        await addModule(payload);
      }
      handleClose();
      fetchModules();
    } catch (error) {
      console.error('Error saving module:', error);
      setError(error.message || 'Failed to save module');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await deleteModule(id);
        fetchModules();
      } catch (error) {
        console.error('Error deleting module:', error);
        setError(error.message || 'Failed to delete module');
      }
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'module_name':
        if (!value) return 'Module name is required';
        if (value.length < 3) return 'Module name must be at least 3 characters';
        return '';
      case 'credit_hours':
        if (!value) return 'Credit hours is required';
        if (isNaN(value) || value <= 0) return 'Credit hours must be a positive number';
        return '';
      case 'specialization':
        if (!value) return 'Specialization is required';
        return '';
      case 'lecturers':
        if (!value || value.length === 0) return 'At least one lecturer must be selected';
        return '';
      case 'batches':
        if (!value || value.length === 0) return 'At least one batch must be selected';
        return '';
      default:
        return '';
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      position: 'relative',
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1 }}>
            Module Management
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen} sx={{ fontWeight: 600, borderRadius: 2, boxShadow: 2 }}>
            Add Module
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Module Name</TableCell>
                  <TableCell>Credit Hours</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Lab Required</TableCell>
                  <TableCell>Lecturers</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No modules found
                    </TableCell>
                  </TableRow>
                ) : (
                  modules.map((module) => (
                    <TableRow key={module._id}>
                      <TableCell>{module.module_name}</TableCell>
                      <TableCell>{module.credit_hours}</TableCell>
                      <TableCell>
                        {Array.isArray(module.specialization)
                          ? module.specialization.join(', ')
                          : (module.specialization || 'Not assigned')}
                      </TableCell>
                      <TableCell>{module.is_lab ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        {module.lecturers?.map(l => l.name).join(', ') || 'Not assigned'}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(module)} color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(module._id)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? 'Edit Module' : 'Add New Module'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                label="Module Name"
                name="module_name"
                value={formData.module_name}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.module_name}
                helperText={validationErrors.module_name}
              />
              <TextField
                fullWidth
                label="Credit Hours"
                name="credit_hours"
                type="number"
                value={formData.credit_hours}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.credit_hours}
                helperText={validationErrors.credit_hours}
              />
              <TextField
                fullWidth
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.specialization}
                helperText={validationErrors.specialization}
              />
              <TextField
                fullWidth
                select
                label="Batches"
                name="batches"
                value={formData.batches}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.batches}
                helperText={validationErrors.batches}
                SelectProps={{
                  multiple: true,
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250
                      }
                    }
                  }
                }}
              >
                {batches.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id}>
                    {batch.batch_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Lecturers"
                name="lecturers"
                value={formData.lecturers}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.lecturers}
                helperText={validationErrors.lecturers}
                SelectProps={{
                  multiple: true,
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250
                      }
                    }
                  }
                }}
              >
                {lecturers.map((lecturer) => (
                  <MenuItem key={lecturer._id} value={lecturer._id}>
                    {lecturer.name} - {lecturer.department}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_lab}
                    onChange={handleChange}
                    name="is_lab"
                  />
                }
                label="Lab Required"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={Object.values(validationErrors).some(error => error !== '')}
              >
                {editMode ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ModuleManagement;
