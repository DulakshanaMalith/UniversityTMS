import React from 'react';
import { Box, Typography, Button, Container, useTheme, alpha, Grid, Card, CardContent, Avatar, Divider, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SLIIT_LOGO } from '../assets/images';
import Navigation from './common/Navigation';
import SchoolIcon from '@mui/icons-material/School';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import GroupIcon from '@mui/icons-material/Group';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

const features = [
  {
    icon: <EventAvailableIcon color="primary" sx={{ fontSize: 40 }} />, 
    title: 'Smart Timetable',
    desc: 'View, manage, and export your personalized university timetable with ease.'
  },
  {
    icon: <AssignmentIcon color="secondary" sx={{ fontSize: 40 }} />, 
    title: 'Assignments & Deadlines',
    desc: 'Track assignments, get reminders, and never miss a deadline.'
  },
  {
    icon: <AccessibilityNewIcon color="primary" sx={{ fontSize: 40 }} />, 
    title: 'Accessibility First',
    desc: 'Voice commands, screen reader support, and high-contrast design for everyone.'
  },
  {
    icon: <SchoolIcon color="secondary" sx={{ fontSize: 40 }} />, 
    title: 'Role-Based Dashboards',
    desc: 'Custom dashboards for students, lecturers, and admins.'
  },
];

const steps = [
  {
    icon: <GroupIcon color="primary" sx={{ fontSize: 32 }} />,
    title: 'Register or Login',
    desc: 'Sign up as a student, lecturer, or admin to get started.'
  },
  {
    icon: <EventAvailableIcon color="secondary" sx={{ fontSize: 32 }} />,
    title: 'Access Your Dashboard',
    desc: 'Get a personalized dashboard with all your tools and info.'
  },
  {
    icon: <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />,
    title: 'Manage & Track',
    desc: 'View timetables, assignments, attendance, and more.'
  },
  {
    icon: <SupportAgentIcon color="secondary" sx={{ fontSize: 32 }} />,
    title: 'Get Support',
    desc: 'Contact our support team for any help you need.'
  },
];

const testimonials = [
  {
    name: 'Nimal Perera',
    role: 'Student',
    quote: 'This platform made it so easy to keep track of my classes and assignments. The voice commands are a game changer!'
  },
  {
    name: 'Dr. S. Fernando',
    role: 'Lecturer',
    quote: 'Managing attendance and assignments is now seamless. The SLIIT branding makes it feel like home.'
  },
  {
    name: 'Admin Team',
    role: 'Admin',
    quote: 'We can now handle timetable conflicts and requests efficiently. The analytics dashboard is very insightful.'
  },
];

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        bgcolor: alpha(theme.palette.primary.main, 0.01),
        pb: 0
      }}
    >
      {/* Custom Navigation Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'transparent',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1)
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src={SLIIT_LOGO} alt="SLIIT Logo" style={{ height: 40 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 1,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              SLIIT Timetable & Attendance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ 
                fontWeight: 600,
                borderRadius: 2,
                px: 3
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/register/student')}
              sx={{ 
                fontWeight: 600,
                borderRadius: 2,
                px: 3
              }}
            >
              Register
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Add padding to account for fixed navbar */}
      <Box sx={{ pt: 8 }}>
        {/* Hero Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: 400, md: 500 },
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '320px',
              height: '320px',
              background: `url(${SLIIT_LOGO}) no-repeat center center`,
              backgroundSize: 'contain',
              opacity: 0.07,
              zIndex: 0
            }
          }}
        >
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 4,
                boxShadow: 4,
                p: { xs: 3, md: 6 },
                textAlign: 'center',
                maxWidth: 600,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3
              }}
            >
              <img src={SLIIT_LOGO} alt="SLIIT Logo" style={{ height: 80, marginBottom: 16 }} />
              <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 2, mb: 1 }}>
                SLIIT Timetable & Attendance
              </Typography>
              <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 500, mb: 2 }}>
                Smart, Accessible, and Modern University Scheduling & Attendance Platform
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Effortlessly manage your university timetable, assignments, and attendance. Designed for students, lecturers, and admins with accessibility and SLIIT branding at its core.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ fontWeight: 700, px: 4, borderRadius: 2, boxShadow: 2 }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  sx={{ fontWeight: 700, px: 4, borderRadius: 2, boxShadow: 2 }}
                  onClick={() => navigate('/register/student')}
                >
                  Register as Student
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 700, color: 'primary.main', mb: 4 }}>
            Features
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: 2, height: '100%' }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), mx: 'auto', mb: 2, width: 56, height: 56 }}>
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{feature.desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* How It Works Section */}
        <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" align="center" sx={{ fontWeight: 700, color: 'primary.main', mb: 4 }}>
              How It Works
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {steps.map((step, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: 1, height: '100%' }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.08), mx: 'auto', mb: 2, width: 48, height: 48 }}>
                      {step.icon}
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{step.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{step.desc}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Testimonials Section */}
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 700, color: 'primary.main', mb: 4 }}>
            What Our Users Say
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {testimonials.map((t, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ p: 4, borderRadius: 3, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <ThumbUpAltIcon color="secondary" sx={{ fontSize: 36, mb: 1 }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                    "{t.quote}"
                  </Typography>
                  <Divider sx={{ width: '60%', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Footer */}
        <Box sx={{ bgcolor: 'primary.main', color: '#fff', py: 3, mt: 6 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src={SLIIT_LOGO} alt="SLIIT Logo" style={{ height: 32 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                SLIIT Timetable & Attendance
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              &copy; {new Date().getFullYear()} SLIIT. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Home; 