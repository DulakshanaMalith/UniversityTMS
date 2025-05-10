import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerStudent, verifyRegistrationCode } from '../../services/api';

const steps = ['Enter Registration Code', 'Student Details'];

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    registration_code: '',
    student_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [batchInfo, setBatchInfo] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleVerifyCode = async () => {
    try {
      const response = await verifyRegistrationCode(formData.registration_code);
      setBatchInfo(response.data.batch);
      setActiveStep(1);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid registration code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await registerStudent({
        ...formData,
        batch_id: batchInfo._id
      });
      setSuccess(response.data.message || 'Registration successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Enter the registration code provided by your administrator
            </Typography>
            <TextField
              fullWidth
              label="Registration Code"
              name="registration_code"
              value={formData.registration_code}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyCode}
              sx={{ mt: 2 }}
              disabled={!formData.registration_code}
            >
              Verify Code
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box>
            {batchInfo && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Registering for: {batchInfo.batch_name} ({batchInfo.department}, Semester {batchInfo.semester})
              </Alert>
            )}
            <TextField
              fullWidth
              label="Student ID"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
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
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{ mt: 2 }}
              disabled={!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.student_id}
            >
              Register
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Student Registration
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {renderStepContent(activeStep)}
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentRegistration;