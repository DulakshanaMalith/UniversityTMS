import React from 'react';
import { Box } from '@mui/material';
// import Navigation from '../common/Navigation';

const AdminLayout = ({ children }) => {
  return (
    <Box>
      {/* Removed Navigation to prevent double navbar */}
      {children}
    </Box>
  );
};

export default AdminLayout; 