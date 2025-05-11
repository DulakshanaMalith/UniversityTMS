import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import LecturerManagement from './LecturerManagement';
import ModuleManagement from './ModuleManagement';
import HallManagement from './HallManagement';
import BatchManagement from './BatchManagement';
import TimetableManagement from './TimetableManagement';
import ChangeRequestsManagement from './ChangeRequestsManagement';
import AdminLayout from './AdminLayout';
import ProductivityTracker from '../productivity/ProductivityTracker';
import VoiceCommandInterface from '../voice/VoiceCommandInterface';
import AdminAnalyticsDashboard from './AdminAnalyticsDashboard';

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="lecturers" element={<LecturerManagement />} />
        <Route path="modules" element={<ModuleManagement />} />
        <Route path="halls" element={<HallManagement />} />
        <Route path="batches" element={<BatchManagement />} />
        <Route path="timetable" element={<TimetableManagement />} />
        <Route path="change-requests" element={<ChangeRequestsManagement />} />
        <Route path="productivity" element={<ProductivityTracker />} />
        <Route path="voice-commands" element={<VoiceCommandInterface />} />
        <Route path="analytics" element={<AdminAnalyticsDashboard />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
