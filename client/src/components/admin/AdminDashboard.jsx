import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Alert,
  Button,
  CardActions
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Room as RoomIcon,
  Book as BookIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon,
  MeetingRoom as MeetingRoomIcon,
  Schedule as ScheduleIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getLecturers, getHalls, getModules, getBatches, logout } from '../../services/api';
import AdminLayout from './AdminLayout';
import { useTheme } from '@mui/material/styles';

const StatCard = ({ title, value, icon, color }) => (
  <Paper 
    sx={{ 
      p: 3, 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}
  >
    <Box sx={{ 
      p: 2, 
      borderRadius: '50%', 
      bgcolor: `${color}15`,
      color: color
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: color }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Box>
  </Paper>
);

const QuickActionCard = ({ title, icon, color, onClick }) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      }
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: color, mb: 2, width: 56, height: 56 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const RecentItem = ({ title, subtitle, icon, color }) => (
  <ListItem>
    <ListItemIcon>
      <Avatar sx={{ bgcolor: color }}>
        {icon}
      </Avatar>
    </ListItemIcon>
    <ListItemText 
      primary={title}
      secondary={subtitle}
    />
  </ListItem>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    lecturers: 0,
    halls: 0,
    modules: 0,
    batches: 0
  });
  const [recentLecturers, setRecentLecturers] = useState([]);
  const [recentModules, setRecentModules] = useState([]);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [lecturers, halls, modules, batches] = await Promise.all([
        getLecturers(),
        getHalls(),
        getModules(),
        getBatches()
      ]);

      setStats({
        lecturers: Array.isArray(lecturers) ? lecturers.length : 0,
        halls: Array.isArray(halls) ? halls.length : 0,
        modules: Array.isArray(modules) ? modules.length : 0,
        batches: Array.isArray(batches) ? batches.length : 0
      });

      // Get recent items (last 5)
      if (Array.isArray(lecturers)) {
        setRecentLecturers(lecturers.slice(-5));
      }
      if (Array.isArray(modules)) {
        setRecentModules(modules.slice(-5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Error loading dashboard data');
    }
  };

  const quickActions = [
    {
      title: 'Batch Management',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      path: '/admin/batches',
      description: 'Manage student batches and groups'
    },
    {
      title: 'Module Management',
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      path: '/admin/modules',
      description: 'Manage course modules and subjects'
    },
    {
      title: 'Lecturer Management',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      path: '/admin/lecturers',
      description: 'Manage teaching staff and assignments'
    },
    {
      title: 'Hall Management',
      icon: <MeetingRoomIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      path: '/admin/halls',
      description: 'Manage lecture halls and facilities'
    },
    {
      title: 'Generate Timetable',
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      path: '/admin/timetable',
      description: 'Generate and manage class schedules'
    },
    {
      title: 'Change Requests',
      icon: <SwapHorizIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.error.main,
      path: '/admin/change-requests',
      description: 'Handle timetable change requests'
    }
  ];

  const renderQuickActionCard = (action) => (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'inline-flex',
            p: 2,
            borderRadius: '50%',
            bgcolor: `${action.color}15`,
            color: action.color
          }}>
            {action.icon}
          </Box>
        </Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {action.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {action.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate(action.path)}
          startIcon={<AddIcon />}
          sx={{ 
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Manage
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <AdminLayout 
      title="Dashboard"
      actions={
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{ ml: 2 }}
        >
          Logout
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Lecturers"
            value={stats.lecturers}
            icon={<PeopleIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Halls"
            value={stats.halls}
            icon={<RoomIcon />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Modules"
            value={stats.modules}
            icon={<BookIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Batches"
            value={stats.batches}
            icon={<GroupIcon />}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.title}>
            {renderQuickActionCard(action)}
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Lecturers
            </Typography>
            <List>
              {recentLecturers.map((lecturer) => (
                <RecentItem
                  key={lecturer._id}
                  title={lecturer.name}
                  subtitle={lecturer.department}
                  icon={<PeopleIcon />}
                  color="primary.main"
                />
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Modules
            </Typography>
            <List>
              {recentModules.map((module) => (
                <RecentItem
                  key={module._id}
                  title={module.module_name}
                  subtitle={`${module.credit_hours} credits - ${module.specialization}`}
                  icon={<BookIcon />}
                  color="success.main"
                />
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminDashboard;
