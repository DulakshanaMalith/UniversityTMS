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
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getHalls, addHall, updateHall, deleteHall } from '../../services/api';
import { SLIIT_LOGO } from '../../assets/images';

const HallManagement = () => {
  const [halls, setHalls] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    hall_name: '',
    capacity: '',
    type: '',
    building: '',
    floor: '',
    facilities: []
  });
  const [validationErrors, setValidationErrors] = useState({
    hall_name: '',
    capacity: '',
    type: '',
    building: '',
    floor: '',
    facilities: ''
  });

  const types = ['lab', 'lecture', 'tutorial'];
  const facilityOptions = ['Projector', 'Whiteboard', 'Computer Lab', 'Air Conditioning', 'Smart Board'];

  const theme = useTheme();

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const response = await getHalls();
      if (response && response.success) {
        setHalls(response.data);
      } else if (Array.isArray(response)) {
        setHalls(response);
      } else {
        console.error('Invalid halls data in response');
        setHalls([]);
      }
    } catch (error) {
      console.error('Error fetching halls:', error);
      setHalls([]);
      setError(error.message || 'Error fetching halls');
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'hall_name':
        if (!value) return 'Hall name is required';
        if (value.length < 2) return 'Hall name must be at least 2 characters';
        return '';
      case 'capacity':
        if (!value) return 'Capacity is required';
        if (isNaN(value) || value <= 0) return 'Capacity must be a positive number';
        return '';
      case 'type':
        if (!value) return 'Hall type is required';
        return '';
      case 'building':
        if (!value) return 'Building is required';
        return '';
      case 'floor':
        if (!value) return 'Floor is required';
        if (isNaN(value)) return 'Floor must be a number';
        return '';
      case 'facilities':
        return '';
      default:
        return '';
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormData({
      hall_name: '',
      capacity: '',
      type: '',
      building: '',
      floor: '',
      facilities: []
    });
    setValidationErrors({});
  };

  const handleEdit = (hall) => {
    setSelectedHall(hall);
    setFormData({
      hall_name: hall.hall_name,
      capacity: hall.capacity,
      type: hall.type,
      building: hall.building,
      floor: hall.floor,
      facilities: Array.isArray(hall.facilities) ? hall.facilities : []
    });
    setValidationErrors({});
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedHall(null);
    setError(null);
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: name === 'facilities' ? value : value
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
      hall_name: validateField('hall_name', formData.hall_name),
      capacity: validateField('capacity', formData.capacity),
      type: validateField('type', formData.type),
      building: validateField('building', formData.building),
      floor: validateField('floor', formData.floor)
    };

    setValidationErrors(errors);

    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== '')) {
      return;
    }

    try {
      if (editMode) {
        await updateHall(selectedHall._id, formData);
      } else {
        await addHall(formData);
      }
      handleClose();
      fetchHalls();
    } catch (error) {
      console.error('Error saving hall:', error);
      setError(error.message || 'Failed to save hall');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hall?')) {
      try {
        await deleteHall(id);
        fetchHalls();
      } catch (error) {
        setError(error.message || 'Error deleting hall');
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
            Hall Management
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpen} sx={{ fontWeight: 600, borderRadius: 2, boxShadow: 2 }}>
            Add New Hall
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hall Name</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Building</TableCell>
                <TableCell>Floor</TableCell>
                <TableCell>Facilities</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {halls.map((hall) => (
                <TableRow key={hall._id}>
                  <TableCell>{hall.hall_name}</TableCell>
                  <TableCell>{hall.capacity}</TableCell>
                  <TableCell>{hall.type}</TableCell>
                  <TableCell>{hall.building}</TableCell>
                  <TableCell>{hall.floor}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {hall.facilities?.map((facility) => (
                        <Chip key={facility} label={facility} size="small" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(hall)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(hall._id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? 'Edit Hall' : 'Add New Hall'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                label="Hall Name"
                name="hall_name"
                value={formData.hall_name}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.hall_name}
                helperText={validationErrors.hall_name}
              />
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.capacity}
                helperText={validationErrors.capacity}
              />
              <TextField
                fullWidth
                select
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.type}
                helperText={validationErrors.type}
              >
                {types.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Building"
                name="building"
                value={formData.building}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.building}
                helperText={validationErrors.building}
              />
              <TextField
                fullWidth
                label="Floor"
                name="floor"
                type="number"
                value={formData.floor}
                onChange={handleChange}
                margin="normal"
                required
                error={!!validationErrors.floor}
                helperText={validationErrors.floor}
              />
              <TextField
                fullWidth
                select
                multiple
                label="Facilities"
                name="facilities"
                value={formData.facilities}
                onChange={handleChange}
                margin="normal"
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
                {facilityOptions.map((facility) => (
                  <MenuItem key={facility} value={facility}>
                    {facility}
                  </MenuItem>
                ))}
              </TextField>
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

export default HallManagement;
