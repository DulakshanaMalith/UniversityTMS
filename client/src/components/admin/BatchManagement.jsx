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
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Edit, Delete, Visibility, Add, School, Group, CalendarToday, AccessTime } from '@mui/icons-material';
import { getBatches, addBatch, updateBatch, deleteBatch, getModules } from '../../services/api';
import AdminLayout from './AdminLayout';
import { validateBatchName, validateAcademicYear, validateSemester, validateNumberOfGroups } from '../../utils/validations';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    batch_name: '',
    department: '',
    academic_year: '',
    num_of_students: '',
    semester: '',
    weekend_or_weekday: '',
    modules: [],
    group_count: 1
  });
  const [validationErrors, setValidationErrors] = useState({});

  const departmentOptions = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Business Information Systems',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronic Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Industrial Engineering',
    'Management',
    'Marketing',
    'Finance',
    'Accounting',
    'Economics',
    'Business Administration'
  ];

  const weekTypes = ['Weekday', 'Weekend'];

  const columns = [
    { id: 'batch_name', label: 'Batch Name', minWidth: 170 },
    { id: 'batch_code', label: 'Batch Code', minWidth: 170 },
    { id: 'department', label: 'Department', minWidth: 170 },
    { id: 'academic_year', label: 'Academic Year', minWidth: 100 },
    { id: 'semester', label: 'Semester', minWidth: 100 },
    { id: 'num_of_students', label: 'Number of Students', minWidth: 100 },
    { id: 'registered_students', label: 'Registered Students', minWidth: 100 },
    { id: 'group_count', label: 'Number of Groups', minWidth: 100 },
    { id: 'weekend_or_weekday', label: 'Schedule Type', minWidth: 100 },
    { id: 'modules', label: 'Modules', minWidth: 200 },
    { id: 'actions', label: 'Actions', minWidth: 100 }
  ];

  useEffect(() => {
    fetchBatches();
    fetchModules();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await getBatches();
      console.log('Batches response:', response); // Debug log
      if (Array.isArray(response)) {
        setBatches(response);
      } else if (response.data && Array.isArray(response.data)) {
        setBatches(response.data);
      } else {
        console.error('Invalid batches data in response:', response);
        setBatches([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
      setError(error.message || 'Error fetching batches');
    }
  };

  const fetchModules = async () => {
    try {
      const response = await getModules();
      console.log('Modules response:', response); // Debug log
      if (Array.isArray(response)) {
        setModules(response);
      } else {
        console.error('Invalid modules data in response');
        setModules([]);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
      setError('Error fetching modules: ' + (error.message || 'Unknown error'));
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormData({
      batch_name: '',
      department: '',
      academic_year: '',
      num_of_students: '',
      semester: '',
      weekend_or_weekday: '',
      modules: [],
      group_count: 1
    });
    setValidationErrors({});
  };

  const handleClose = () => {
    setOpen(false);
    setDetailsOpen(false);
    setError(null);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'batch_name':
        if (!value) return 'Batch name is required';
        if (!validateBatchName(value)) return 'Batch name should not contain special characters';
        return '';
      case 'department':
        if (!value) return 'Department is required';
        return '';
      case 'academic_year':
        if (!value) return 'Academic year is required';
        if (!validateAcademicYear(value)) return 'Academic year must be between 2000 and 2025';
        return '';
      case 'semester':
        if (!value) return 'Semester is required';
        return '';
      case 'group_count':
        if (!value) return 'Number of groups is required';
        if (!validateNumberOfGroups(value)) return 'Number of groups must be between 1 and 20';
        return '';
      case 'num_of_students':
        if (!value) return 'Number of students is required';
        if (isNaN(value) || value <= 0) return 'Number of students must be a positive number';
        return '';
      case 'weekend_or_weekday':
        if (!value) return 'Schedule type is required';
        return '';
      case 'modules':
        if (!value || value.length === 0) return 'At least one module is required';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate the field
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const errors = {
      batch_name: validateField('batch_name', formData.batch_name),
      department: validateField('department', formData.department),
      academic_year: validateField('academic_year', formData.academic_year),
      num_of_students: validateField('num_of_students', formData.num_of_students),
      semester: validateField('semester', formData.semester),
      weekend_or_weekday: validateField('weekend_or_weekday', formData.weekend_or_weekday),
      group_count: validateField('group_count', formData.group_count),
      modules: validateField('modules', formData.modules)
    };

    setValidationErrors(errors);

    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== '')) {
      return;
    }

    try {
      if (editMode) {
        await updateBatch(selectedBatch._id, formData);
      } else {
        await addBatch(formData);
      }
      handleClose();
      fetchBatches();
    } catch (error) {
      setError(error.message || 'Error saving batch');
    }
  };

  const handleEdit = (batch) => {
    setSelectedBatch(batch);
    setFormData({
      batch_name: batch.batch_name,
      department: batch.department,
      academic_year: batch.academic_year,
      num_of_students: batch.num_of_students,
      semester: batch.semester,
      weekend_or_weekday: batch.weekend_or_weekday,
      modules: batch.modules?.map(m => m._id) || [],
      group_count: batch.group_count
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await deleteBatch(id);
        fetchBatches();
      } catch (error) {
        setError(error.message || 'Error deleting batch');
      }
    }
  };

  const handleViewDetails = (batch) => {
    setSelectedBatch(batch);
    setDetailsOpen(true);
  };

  const renderBatchCard = (batch) => (
    <Grid item xs={12} sm={6} md={4} key={batch._id}>
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
                bgcolor: 'primary.main'
              }}
            >
              <School sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {batch.batch_name}
              </Typography>
              <Typography color="text.secondary" variant="subtitle2">
                {batch.batch_code}
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Group sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  Students: {batch.registered_students} / {batch.num_of_students}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  {batch.academic_year} - Semester {batch.semester}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  {batch.weekend_or_weekday} Schedule
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Modules
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {batch.modules?.map((module) => {
                  let moduleName = '';
                  if (typeof module === 'object') {
                    moduleName = module.module_name || module.name;
                  } else {
                    const foundModule = modules.find(m => m._id === module);
                    moduleName = foundModule ? foundModule.module_name : module;
                  }
                  return (
                    <Chip
                      key={typeof module === 'object' ? module._id : module}
                      label={moduleName}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        
        <Box sx={{ mt: 'auto', p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton 
              color="primary" 
              onClick={() => handleViewDetails(batch)}
              size="small"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Batch">
            <IconButton 
              color="primary" 
              onClick={() => handleEdit(batch)}
              size="small"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Batch">
            <IconButton 
              color="error" 
              onClick={() => handleDelete(batch._id)}
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
      title="Batch Management"
      actions={
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpen}
        >
          Add New Batch
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Array.isArray(batches) && batches.map(renderBatchCard)}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="batch_name"
                  label="Batch Name"
                  fullWidth
                  value={formData.batch_name}
                  onChange={handleInputChange}
                  required
                  error={!!validationErrors.batch_name}
                  helperText={validationErrors.batch_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="department"
                  label="Department"
                  select
                  fullWidth
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  error={!!validationErrors.department}
                  helperText={validationErrors.department}
                >
                  {departmentOptions.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="academic_year"
                  label="Academic Year"
                  type="number"
                  fullWidth
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  required
                  error={!!validationErrors.academic_year}
                  helperText={validationErrors.academic_year}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="num_of_students"
                  label="Number of Students"
                  type="number"
                  fullWidth
                  value={formData.num_of_students}
                  onChange={handleInputChange}
                  required
                  error={!!validationErrors.num_of_students}
                  helperText={validationErrors.num_of_students}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="semester"
                  label="Semester"
                  type="number"
                  fullWidth
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                  error={!!validationErrors.semester}
                  helperText={validationErrors.semester}
                  inputProps={{ min: 1, max: 8 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="weekend_or_weekday"
                  label="Schedule Type"
                  select
                  fullWidth
                  value={formData.weekend_or_weekday}
                  onChange={handleInputChange}
                  required
                  error={!!validationErrors.weekend_or_weekday}
                  helperText={validationErrors.weekend_or_weekday}
                >
                  {weekTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="group_count"
                  label="Number of Groups"
                  type="number"
                  fullWidth
                  value={formData.group_count}
                  onChange={handleInputChange}
                  required
                  error={!!validationErrors.group_count}
                  helperText={validationErrors.group_count}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="modules"
                  label="Modules"
                  select
                  fullWidth
                  error={!!validationErrors.modules}
                  helperText={validationErrors.modules}
                  SelectProps={{
                    multiple: true,
                    value: formData.modules,
                    onChange: (e) => handleInputChange({
                      target: {
                        name: 'modules',
                        value: e.target.value
                      }
                    })
                  }}
                >
                  {modules.map((module) => (
                    <MenuItem key={module._id} value={module._id}>
                      {module.module_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailsOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Batch Details</DialogTitle>
        <DialogContent>
          {selectedBatch && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedBatch.batch_name}
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography><strong>Registration Code:</strong> {selectedBatch.registration_code}</Typography>
                <Typography variant="body2">
                  Share this code with students to allow them to register for this batch.
                </Typography>
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography><strong>Department:</strong> {selectedBatch.department}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Academic Year:</strong> {selectedBatch.academic_year}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Semester:</strong> {selectedBatch.semester}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Schedule Type:</strong> {selectedBatch.weekend_or_weekday}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Number of Students:</strong> {selectedBatch.num_of_students}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Registered Students:</strong> {selectedBatch.registered_students} / {selectedBatch.num_of_students}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Number of Groups:</strong> {selectedBatch.group_count}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Modules:</strong></Typography>
                  <Box sx={{ mt: 1 }}>
                    {selectedBatch.modules.map((module) => (
                      <Chip
                        key={module._id}
                        label={`${module.module_name} (${module.credit_hours} credits)`}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default BatchManagement;
