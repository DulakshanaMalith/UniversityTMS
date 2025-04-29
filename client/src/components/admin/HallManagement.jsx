import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
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
import { Edit, Delete, Add, Room, People, Computer, Wifi } from '@mui/icons-material';
import { getHalls, addHall, updateHall, deleteHall } from '../../services/api';
import AdminLayout from './AdminLayout';
import { validateHallName, validateFloor } from '../../utils/validations';

const HallManagement = () => {
  const [halls, setHalls] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    hall_name: '',
    building: '',
    floor: '',
    type: 'lecture',
    capacity: '',
    facilities: []
  });
  const [validationErrors, setValidationErrors] = useState({
    hall_name: '',
    building: '',
    floor: '',
    type: '',
    capacity: '',
    facilities: ''
  });

  const facilityOptions = [
    'Projector',
    'Air Conditioning',
    'Smart Board',
    'Sound System',
    'Lab Equipment',
    'High-Speed Internet',
    'Whiteboard',
    'Chalkboard'
  ];

  const hallTypes = [
    { value: 'lecture', label: 'Lecture Hall' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'tutorial', label: 'Tutorial Room' }
  ];

  const buildingOptions = [
    'Main Building',
    'New Building'
  ];

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const response = await getHalls();
      if (Array.isArray(response)) {
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
        if (!validateHallName(value)) return 'Hall name should not contain special characters';
        return '';
      case 'building':
        if (!value) return 'Building is required';
        return '';
      case 'floor':
        if (!value) return 'Floor is required';
        if (!validateFloor(value)) return 'Floor number must be between 0 and 15';
        return '';
      case 'type':
        if (!value) return 'Hall type is required';
        return '';
      case 'capacity':
        if (!value) return 'Capacity is required';
        if (isNaN(value) || value < 1) return 'Capacity must be a positive number';
        return '';
      case 'facilities':
        if (!value || value.length === 0) return 'At least one facility is required';
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
      building: '',
      floor: '',
      type: 'lecture',
      capacity: '',
      facilities: []
    });
    setValidationErrors({});
  };

  const handleEdit = (hall) => {
    setSelectedHall(hall);
    setFormData({
      hall_name: hall.hall_name || '',
      building: hall.building || '',
      floor: hall.floor || '',
      type: hall.type || 'lecture',
      capacity: hall.capacity || '',
      facilities: hall.facilities || []
    });
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

    const errors = {
      hall_name: validateField('hall_name', formData.hall_name),
      building: validateField('building', formData.building),
      floor: validateField('floor', formData.floor),
      type: validateField('type', formData.type),
      capacity: validateField('capacity', formData.capacity),
      facilities: validateField('facilities', formData.facilities)
    };

    setValidationErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      return;
    }

    try {
      const hallData = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        floor: parseInt(formData.floor, 10)
      };

      if (editMode) {
        await updateHall(selectedHall._id, hallData);
      } else {
        await addHall(hallData);
      }
      handleClose();
      fetchHalls();
    } catch (error) {
      console.error('Error submitting data:', error);
      setError(error.message || 'Error saving hall');
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

  const renderHallCard = (hall) => (
    <Grid item xs={12} sm={6} md={4} key={hall._id}>
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
                bgcolor: hall.is_lab ? 'secondary.main' : 'primary.main'
              }}
            >
              <Room sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {hall.hall_name}
              </Typography>
              <Typography color="text.secondary" variant="subtitle2">
                {hall.is_lab ? 'Laboratory' : 'Lecture Hall'}
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  Capacity: {hall.capacity} students
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Facilities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {hall.facilities?.map((facility) => (
                  <Chip 
                    key={facility} 
                    label={facility} 
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
          <Tooltip title="Edit Hall">
            <IconButton 
              color="primary" 
              onClick={() => handleEdit(hall)}
              size="small"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Hall">
            <IconButton 
              color="error" 
              onClick={() => handleDelete(hall._id)}
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
      title="Hall Management"
      actions={
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpen}
        >
          Add New Hall
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Array.isArray(halls) && halls.map(renderHallCard)}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Hall' : 'Add New Hall'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hall Name"
                  name="hall_name"
                  value={formData.hall_name}
                  onChange={handleChange}
                  error={!!validationErrors.hall_name}
                  helperText={validationErrors.hall_name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Building"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  error={!!validationErrors.building}
                  helperText={validationErrors.building}
                  required
                >
                  {buildingOptions.map((building) => (
                    <MenuItem key={building} value={building}>
                      {building}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Floor"
                  name="floor"
                  type="number"
                  value={formData.floor}
                  onChange={handleChange}
                  error={!!validationErrors.floor}
                  helperText={validationErrors.floor}
                  inputProps={{ min: 0, max: 15 }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Hall Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  error={!!validationErrors.type}
                  helperText={validationErrors.type}
                  required
                >
                  {hallTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  error={!!validationErrors.capacity}
                  helperText={validationErrors.capacity}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Facilities"
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleChange}
                  error={!!validationErrors.facilities}
                  helperText={validationErrors.facilities}
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
                  {facilityOptions.map((facility) => (
                    <MenuItem key={facility} value={facility}>
                      {facility}
                    </MenuItem>
                  ))}
                </TextField>
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

export default HallManagement;
