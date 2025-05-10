import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Typography,
  MenuItem,
  Alert,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Divider,
  Chip,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Edit, Delete, Add, Book, School, Group } from '@mui/icons-material';
import { getModules, addModule, updateModule, deleteModule, getLecturers, getBatches } from '../../services/api';
import AdminLayout from './AdminLayout';
import { validateModuleName, validateCreditHours } from '../../utils/validations';

const ModuleManagement = () => {
  const [modules, setModules] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    module_name: '',
    credit_hours: '',
    specialization: '',
    lecturers: [],
    is_lab: false,
    batch_ids: []
  });
  const [validationErrors, setValidationErrors] = useState({
    module_name: '',
    credit_hours: '',
    specialization: '',
    lecturers: '',
    batch_ids: ''
  });

  useEffect(() => {
    fetchModules();
    fetchLecturers();
    fetchBatches();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await getModules();
      if (Array.isArray(response)) {
        setModules(response);
      } else {
        console.error('Invalid modules data in response');
        setModules([]);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
      setError(error.message || 'Error fetching modules');
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await getLecturers();
      if (Array.isArray(response)) {
        setLecturers(response);
      } else {
        console.error('Invalid lecturers data in response');
        setLecturers([]);
      }
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      setLecturers([]);
      setError(error.message || 'Error fetching lecturers');
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await getBatches();
      if (Array.isArray(response)) {
        setBatches(response);
      } else {
        console.error('Invalid batches data in response');
        setBatches([]);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
      setError(error.message || 'Error fetching batches');
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'module_name':
        if (!value) return 'Module name is required';
        if (!validateModuleName(value)) return 'Module name should not contain numbers or special characters';
        return '';
      case 'credit_hours':
        if (!value) return 'Credit hours is required';
        if (!validateCreditHours(value)) return 'Credit hours must be between 1 and 168';
        return '';
      case 'specialization':
        if (!value) return 'Specialization is required';
        return '';
      case 'lecturers':
        if (!value || value.length === 0) return 'At least one lecturer is required';
        return '';
      case 'batch_ids':
        if (!value || value.length === 0) return 'At least one batch is required';
        return '';
      default:
        return '';
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormData({
      module_name: '',
      credit_hours: '',
      specialization: '',
      lecturers: [],
      is_lab: false,
      batch_ids: []
    });
    setValidationErrors({});
  };

  const handleEdit = (module) => {
    setSelectedModule(module);
    setFormData({
      module_name: module.module_name || '',
      credit_hours: module.credit_hours || '',
      specialization: module.specialization || '',
      lecturers: module.lecturers || [],
      is_lab: module.is_lab || false,
      batch_ids: module.batch_ids || []
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedModule(null);
    setError(null);
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Validate the field
    const error = validateField(name, type === 'checkbox' ? checked : value);
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
      batch_ids: validateField('batch_ids', formData.batch_ids)
    };

    setValidationErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      return;
    }

    try {
      const moduleData = {
        ...formData,
        credit_hours: parseInt(formData.credit_hours, 10),
        lecturer_ids: formData.lecturers,
        batch_ids: formData.batch_ids
      };

      if (editMode) {
        await updateModule(selectedModule._id, moduleData);
      } else {
        await addModule(moduleData);
      }
      handleClose();
      fetchModules();
    } catch (error) {
      console.error('Error submitting data:', error);
      setError(error.message || 'Error saving module');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await deleteModule(id);
        fetchModules();
      } catch (error) {
        setError(error.message || 'Error deleting module');
      }
    }
  };

  const renderModuleCard = (module) => (
    <Grid item xs={12} sm={6} md={4} key={module._id}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                mr: 2,
                bgcolor: module.is_lab ? 'secondary.main' : 'primary.main'
              }}
            >
              <Book sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {module.module_name}
              </Typography>
              <Typography color="text.secondary" variant="subtitle2">
                {module.is_lab ? 'Laboratory Module' : 'Lecture Module'}
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  Credit Hours: {module.credit_hours}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Group sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  Specialization: {module.specialization}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Lecturers
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {module.lecturers?.map((lecturer) => (
                  <Chip 
                    key={lecturer._id || lecturer} 
                    label={lecturer.name || lecturer} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        
        <Box sx={{ mt: 'auto', p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="Edit Module">
            <IconButton 
              color="primary" 
              onClick={() => handleEdit(module)}
              size="small"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Module">
            <IconButton 
              color="error" 
              onClick={() => handleDelete(module._id)}
              size="small"
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>
    </Grid>
  );

  return (
    <AdminLayout 
      title="Module Management"
      actions={
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpen}
        >
          Add New Module
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Array.isArray(modules) && modules.map(renderModuleCard)}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Module' : 'Add New Module'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Module Name"
                  name="module_name"
                  value={formData.module_name}
                  onChange={handleChange}
                  error={!!validationErrors.module_name}
                  helperText={validationErrors.module_name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Credit Hours"
                  name="credit_hours"
                  type="number"
                  value={formData.credit_hours}
                  onChange={handleChange}
                  error={!!validationErrors.credit_hours}
                  helperText={validationErrors.credit_hours}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  error={!!validationErrors.specialization}
                  helperText={validationErrors.specialization}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Lecturers"
                  name="lecturers"
                  value={formData.lecturers}
                  onChange={handleChange}
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
                  required
                >
                  {lecturers.map((lecturer) => (
                    <MenuItem key={lecturer._id} value={lecturer._id}>
                      {lecturer.name} - {lecturer.department}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Batches"
                  name="batch_ids"
                  value={formData.batch_ids}
                  onChange={handleChange}
                  error={!!validationErrors.batch_ids}
                  helperText={validationErrors.batch_ids}
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
                  required
                >
                  {batches.map((batch) => (
                    <MenuItem key={batch._id} value={batch._id}>
                      {batch.batch_name} - {batch.department} (Semester {batch.semester})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_lab}
                      onChange={handleChange}
                      name="is_lab"
                    />
                  }
                  label="Is Laboratory Module"
                />
              </Grid>
            </Grid>
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
    </AdminLayout>
  );
};

export default ModuleManagement;
