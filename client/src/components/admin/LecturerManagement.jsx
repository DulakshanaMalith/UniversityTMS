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
  useTheme,
  alpha
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getLecturers, addLecturer, updateLecturer, deleteLecturer, getModules } from '../../services/api';
import { SLIIT_LOGO } from '../../assets/images';

const LecturerManagement = () => {
  const theme = useTheme();
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
        if (value.length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
        return '';
      case 'phone_number':
        if (!value) return 'Phone number is required';
        if (!/^\d{10}$/.test(value)) return 'Phone number must be 10 digits';
        return '';
      case 'department':
        if (!value) return 'Department is required';
        return '';
      case 'specialization':
        if (!value || value.length === 0) return 'At least one specialization is required';
        return '';
      case 'rank':
        if (!value) return 'Rank is required';
        return '';
      case 'modules':
        return '';
      case 'password':
        if (!editMode && !value) return 'Password is required for new lecturers';
        if (!editMode && value.length < 6) return 'Password must be at least 6 characters';
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
            Lecturer Management
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpen} sx={{ fontWeight: 600, borderRadius: 2, boxShadow: 2 }}>
            Add New Lecturer
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, mb: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Specialization</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Rank</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Modules</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lecturers.map((lecturer) => (
                <TableRow key={lecturer._id}>
                  <TableCell>{lecturer.name}</TableCell>
                  <TableCell>{lecturer.email}</TableCell>
                  <TableCell>{lecturer.phone_number}</TableCell>
                  <TableCell>{lecturer.department}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {lecturer.specialization?.map((spec) => (
                        <Chip key={spec} label={spec} size="small" color="primary" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{lecturer.rank}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {lecturer.modules?.map((mod) => (
                        <Chip key={mod._id || mod} label={mod.module_name || mod} size="small" color="secondary" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(lecturer)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(lecturer._id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? 'Edit Lecturer' : 'Add New Lecturer'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.name}
                helperText={validationErrors.name}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.email}
                helperText={validationErrors.email}
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.phone_number}
                helperText={validationErrors.phone_number}
              />
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.department}
                helperText={validationErrors.department}
              />
              <TextField
                fullWidth
                select
                multiple
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.specialization}
                helperText={validationErrors.specialization}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  ),
                }}
              >
                {specializationOptions.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Rank"
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.rank}
                helperText={validationErrors.rank}
              >
                {ranks.map((rank) => (
                  <MenuItem key={rank} value={rank}>
                    {rank}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                multiple
                label="Modules"
                name="modules"
                value={formData.modules}
                onChange={handleChange}
                margin="normal"
                error={!!validationErrors.modules}
                helperText={validationErrors.modules}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const module = modules.find(m => m._id === value);
                        return (
                          <Chip
                            key={value}
                            label={module ? module.module_name : value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  ),
                }}
              >
                {modules.map((module) => (
                  <MenuItem key={module._id} value={module._id}>
                    {module.module_name}
                  </MenuItem>
                ))}
              </TextField>
              {!editMode && (
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                {editMode ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default LecturerManagement;
