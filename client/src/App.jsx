import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import Login from './components/auth/Login';
import StudentRegistration from './components/auth/StudentRegistration';
import AdminRoutes from './components/admin/AdminRoutes';
import LecturerDashboard from './components/lecturer/LecturerDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './components/Unauthorized';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5'
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif'
  }
});

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const getDefaultRoute = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'lecturer':
        return '/lecturer/timetable';
      case 'student':
        return '/student';
      default:
        return '/login';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to={getDefaultRoute(user?.role)} /> : <Login />
          } />
          <Route path="/register/student" element={<StudentRegistration />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <PrivateRoute roles={['admin']}>
              <AdminRoutes />
            </PrivateRoute>
          } />

          {/* Lecturer Routes */}
          <Route path="/lecturer" element={
            <PrivateRoute roles={['lecturer']}>
              <Navigate to="/lecturer/timetable" replace />
            </PrivateRoute>
          } />
          <Route path="/lecturer/timetable" element={
            <PrivateRoute roles={['lecturer']}>
              <LecturerDashboard />
            </PrivateRoute>
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <PrivateRoute roles={['student']}>
              <StudentDashboard />
            </PrivateRoute>
          } />

          {/* Default Route */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to={getDefaultRoute(user?.role)} /> : <Navigate to="/login" />
          } />

          {/* Catch all other routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
