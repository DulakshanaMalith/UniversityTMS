import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Container, useTheme, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { School, Person, Room, Book, Schedule, SwapHoriz, Timeline, Mic, BarChart as BarChartIcon } from '@mui/icons-material';
import { SLIIT_LOGO } from '../../assets/images';

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const menuItems = [
    {
      title: 'Manage Lecturers',
      icon: <Person sx={{ fontSize: 40 }} />,
      description: 'Add, edit, or remove lecturers',
      path: '/admin/lecturers'
    },
    {
      title: 'Manage Modules',
      icon: <Book sx={{ fontSize: 40 }} />,
      description: 'Manage course modules and assignments',
      path: '/admin/modules'
    },
    {
      title: 'Manage Halls',
      icon: <Room sx={{ fontSize: 40 }} />,
      description: 'Manage lecture halls and labs',
      path: '/admin/halls'
    },
    {
      title: 'Manage Batches',
      icon: <School sx={{ fontSize: 40 }} />,
      description: 'Manage student batches',
      path: '/admin/batches'
    },
    {
      title: 'Generate Timetable',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      description: 'Create and manage timetables',
      path: '/admin/timetable'
    },
    {
      title: 'Change Requests',
      icon: <SwapHoriz sx={{ fontSize: 40 }} />,
      description: 'Handle lecturer time slot change requests',
      path: '/admin/change-requests'
    },
    {
      title: 'Productivity Tracking',
      icon: <Timeline sx={{ fontSize: 40 }} />,
      description: 'Monitor and analyze productivity metrics',
      path: '/admin/productivity'
    },
    {
      title: 'Voice Commands',
      icon: <Mic sx={{ fontSize: 40 }} />,
      description: 'Manage and monitor voice command system',
      path: '/admin/voice-commands'
    },
    {
      title: 'Analytics',
      icon: <BarChartIcon sx={{ fontSize: 40 }} />,
      description: 'Unified analytics dashboard',
      path: '/admin/analytics'
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
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
        <Typography variant="h4" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom align="center" sx={{ mb: 4 }}>
          Welcome to the administrative control panel
        </Typography>

        <Grid container spacing={4}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                onClick={() => handleCardClick(item.path)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: '0.3s',
                  borderRadius: 3,
                  boxShadow: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.03)',
                    boxShadow: 6,
                    bgcolor: alpha(theme.palette.primary.main, 0.07),
                  }
                }}
                tabIndex={0}
                aria-label={item.title}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <Box sx={{ mb: 2, color: 'primary.main', display: 'flex', justifyContent: 'center' }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
