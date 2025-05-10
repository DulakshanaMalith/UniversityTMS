import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
} from '@mui/material';
import { addUser } from '../../services/api';
import { SLIIT_LOGO } from '../../assets/images';

const UserManagement = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    role: 'student',
    rank: '',
    phone_number: '',
  });

  const theme = useTheme();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addUser(formData);
      handleClose();
      setFormData({
        username: '',
        password: '',
        email: '',
        name: '',
        role: 'student',
        rank: '',
        phone_number: '',
      });
    } catch (error) {
      console.error('Error adding user:', error);
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
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1 }}>
            User Management
          </Typography>
          <Button variant="contained" onClick={handleOpen} sx={{ fontWeight: 600, borderRadius: 2, boxShadow: 2 }}>
            Add New User
          </Button>
        </Box>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
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
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="lecturer">Lecturer</MenuItem>
                  </TextField>
                </Grid>
                {formData.role === 'lecturer' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Rank"
                        name="rank"
                        value={formData.rank}
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value="Professor">Professor</MenuItem>
                        <MenuItem value="Senior Lecturer">Senior Lecturer</MenuItem>
                        <MenuItem value="Lecturer">Lecturer</MenuItem>
                        <MenuItem value="Assistant Lecturer">Assistant Lecturer</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Add User
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UserManagement;
