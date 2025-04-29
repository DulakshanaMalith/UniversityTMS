import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Link as MuiLink,
  CircularProgress
} from '@mui/material';
import { login } from '../../services/api';
import { setCredentials } from '../../store/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setFormData({
        ...formData,
        role: newRole,
        username: '',
        email: '',
        password: ''
      });
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginData = {
        ...formData,
        // For lecturers, use name and email instead of username
        ...(formData.role === 'lecturer' && {
          name: formData.username,
          email: formData.email
        })
      };

      console.log('Sending login data:', loginData);
      const response = await login(loginData);
      console.log('Login response:', response);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      console.log('Setting credentials:', response.data);
      dispatch(setCredentials({
        user: response.data.user,
        token: response.data.token
      }));

      console.log('Navigating to:', response.data.user.role);
      // Redirect based on role
      switch (response.data.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'lecturer':
          navigate('/lecturer/timetable');
          break;
        case 'student':
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
              color="primary"
              value={formData.role}
              exclusive
              onChange={handleRoleChange}
              fullWidth
            >
              <ToggleButton value="student">Student</ToggleButton>
              <ToggleButton value="lecturer">Lecturer</ToggleButton>
              <ToggleButton value="admin">Admin</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <form onSubmit={handleSubmit}>
            {formData.role === 'lecturer' ? (
              <>
                <TextField
                  fullWidth
                  label="Name"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  margin="normal"
                  required
                  autoFocus
                  disabled={loading}
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
                  disabled={loading}
                />
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label={formData.role === 'student' ? 'Student ID' : 'Username'}
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  margin="normal"
                  required
                  autoFocus
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  disabled={loading}
                />
              </>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          {formData.role === 'student' && (
            <Typography variant="body2" align="center">
              Don't have an account?{' '}
              <MuiLink component={Link} to="/register/student">
                Register here with your batch code
              </MuiLink>
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
