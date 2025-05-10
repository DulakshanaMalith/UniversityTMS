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
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Divider
} from '@mui/material';
import { Edit, Delete, Add, Person, Email, Phone, School } from '@mui/icons-material';
import { getLecturers, addLecturer, updateLecturer, deleteLecturer, getModules } from '../../services/api';
import AdminLayout from './AdminLayout';
import { validateName, validateEmail, validateDepartment, validatePassword } from '../../utils/validations';

const LecturerManagement = () => {
  const [lecturers, setLecturers] = useState([]);
  const [modules, setModules] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    department: '',
    specialization: [],
    rank: '',
    modules: [],
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    phone_number: '',
    department: '',
    specialization: '',
    rank: '',
    modules: '',
    password: ''
  });

  const ranks = ['Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer'];
  const specializationOptions = [
    'Software Engineering',
    'Network Engineering',
    'Data Science',
    'Artificial Intelligence',
    'Cybersecurity',
    'Database Systems',
    'Web Development'
  ];

  useEffect(() => {
    fetchLecturers();
    fetchModules();
  }, []);

  const fetchLecturers = async () => {
    try {
      const response = await getLecturers();
      console.log('Lecturers response:', response);
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

  const fetchModules = async () => {
    try {
      const data = await getModules();
      if (Array.isArray(data)) {
        setModules(data);
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

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required';
        if (!validateName(value)) return 'Name should only contain letters and spaces';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return '';
      case 'department':
        if (!value) return 'Department is required';
        if (!validateDepartment(value)) return 'Department should only contain letters and spaces';
        return '';
      case 'password':
        if (!editMode && !value) return 'Password is required for new lecturers';
        if (!editMode && !validatePassword(value)) {
          return 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character';
        }
        return '';
      case 'phone_number':
        if (!value) return 'Phone number is required';
        if (!/^\d{10}$/.test(value)) return 'Phone number must be 10 digits';
        return '';
      case 'specialization':
        if (!value || value.length === 0) return 'At least one specialization is required';
        return '';
      case 'rank':
        if (!value) return 'Rank is required';
        return '';
      case 'modules':
        return '';
      default:
        return '';
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormData({
      name: '',
      email: '',
      phone_number: '',
      department: '',
      specialization: [],
      rank: '',
      modules: [],
      password: ''
    });
    setValidationErrors({});
  };

  const handleEdit = (lecturer) => {
    console.log('Editing lecturer:', lecturer);
    setSelectedLecturer(lecturer);
    setFormData({
      name: lecturer.name || '',
      email: lecturer.email || '',
      phone_number: lecturer.phone_number || '',
      department: lecturer.department || '',
      specialization: lecturer.specialization || [],
      rank: lecturer.rank || '',
      modules: lecturer.modules?.map(m => {
        if (typeof m === 'object') {
          return m._id;
        }
        return m;
      }) || [],
      password: ''
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLecturer(null);
    setError(null);
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: name === 'modules' || name === 'specialization' ? value : value
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
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone_number: validateField('phone_number', formData.phone_number),
      department: validateField('department', formData.department),
      specialization: validateField('specialization', formData.specialization),
      rank: validateField('rank', formData.rank),
      modules: validateField('modules', formData.modules),
      password: validateField('password', formData.password)
    };

    setValidationErrors(errors);

    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== '')) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        modules: formData.modules || [],
        specialization: formData.specialization || []
      };

      if (editMode) {
        await updateLecturer(selectedLecturer._id, submitData);
      } else {
        await addLecturer(submitData);
      }
      handleClose();
      fetchLecturers();
    } catch (error) {
      console.error('Error submitting data:', error);
      setError(error.message || 'Error saving lecturer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lecturer?')) {
      try {
        await deleteLecturer(id);
        fetchLecturers();
      } catch (error) {
        setError(error.message || 'Error deleting lecturer');
      }
    }
  };

  const renderLecturerCard = (lecturer) => (
    <Grid item xs={12} sm={6} md={4} key={lecturer._id}>
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
              <Person sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {lecturer.name}
              </Typography>
              <Typography color="text.secondary" variant="subtitle2">
                {lecturer.rank}
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">{lecturer.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">{lecturer.phone_number || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">{lecturer.department}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Specializations
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {lecturer.specialization?.map((spec) => (
                  <Chip 
                    key={spec} 
                    label={spec} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Modules
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {lecturer.modules && Array.isArray(lecturer.modules) && lecturer.modules.map((module) => {
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
          <Tooltip title="Edit Lecturer">
            <IconButton 
              color="primary" 
              onClick={() => handleEdit(lecturer)}
              size="small"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Lecturer">
            <IconButton 
              color="error" 
              onClick={() => handleDelete(lecturer._id)}
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
      title="Lecturer Management"
      actions={
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpen}
        >
          Add New Lecturer
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Array.isArray(lecturers) && lecturers.map(renderLecturerCard)}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Lecturer' : 'Add New Lecturer'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={!!validationErrors.phone_number}
                  helperText={validationErrors.phone_number}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  error={!!validationErrors.department}
                  helperText={validationErrors.department}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Rank"
                  name="rank"
                  value={formData.rank}
                  onChange={handleChange}
                  error={!!validationErrors.rank}
                  helperText={validationErrors.rank}
                  required
                >
                  {ranks.map((rank) => (
                    <MenuItem key={rank} value={rank}>
                      {rank}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  error={!!validationErrors.specialization}
                  helperText={validationErrors.specialization}
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
                  {specializationOptions.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Modules"
                  name="modules"
                  value={formData.modules}
                  onChange={handleChange}
                  error={!!validationErrors.modules}
                  helperText={validationErrors.modules}
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
                  {modules.map((module) => (
                    <MenuItem key={module._id} value={module._id}>
                      {module.module_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {!editMode && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!validationErrors.password}
                    helperText={validationErrors.password}
                    required
                  />
                </Grid>
              )}
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

export default LecturerManagement;
