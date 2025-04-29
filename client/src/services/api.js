import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses and other errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error;
  }
);

// Auth functions
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.success && response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response;
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Admin routes
export const addUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add user');
  }
};

// Lecturer routes
export const getLecturers = async () => {
  try {
    const response = await api.get('/admin/lecturers');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch lecturers');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch lecturers');
  }
};

export const addLecturer = async (lecturerData) => {
  try {
    const response = await api.post('/admin/lecturers', lecturerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add lecturer');
  }
};

export const updateLecturer = async (id, lecturerData) => {
  try {
    const response = await api.put(`/admin/lecturers/${id}`, lecturerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update lecturer');
  }
};

export const deleteLecturer = async (id) => {
  try {
    const response = await api.delete(`/admin/lecturers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete lecturer');
  }
};

export const getLecturerTimetable = async () => {
  try {
    const response = await api.get('/lecturer/timetable');
    console.log('Lecturer timetable response:', response);
    
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch timetable');
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error in getLecturerTimetable:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to fetch lecturer timetable. Please check server logs.');
    }
  }
};

// Module routes
export const getModules = async () => {
  try {
    const response = await api.get('/admin/modules');
    if (response.data.success) {
      return response.data.modules;
    }
    throw new Error(response.data.message || 'Failed to fetch modules');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch modules');
  }
};

export const addModule = async (moduleData) => {
  try {
    const response = await api.post('/admin/modules', moduleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add module');
  }
};

export const updateModule = async (id, moduleData) => {
  try {
    const response = await api.put(`/admin/modules/${id}`, moduleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update module');
  }
};

export const deleteModule = async (id) => {
  try {
    const response = await api.delete(`/admin/modules/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete module');
  }
};

// Hall routes
export const getHalls = async () => {
  try {
    const response = await api.get('/admin/halls');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch halls');
  }
};

export const addHall = async (hallData) => {
  try {
    const response = await api.post('/admin/halls', hallData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add hall');
  }
};

export const updateHall = async (id, hallData) => {
  try {
    const response = await api.put(`/admin/halls/${id}`, hallData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update hall');
  }
};

export const deleteHall = async (id) => {
  try {
    const response = await api.delete(`/admin/halls/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete hall');
  }
};

// Batch routes
export const getBatches = async () => {
  try {
    const response = await api.get('/admin/batches');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch batches');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching batches');
  }
};

export const addBatch = async (batchData) => {
  try {
    const response = await api.post('/admin/batches', batchData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error adding batch');
  }
};

export const updateBatch = async (id, batchData) => {
  try {
    const response = await api.put(`/admin/batches/${id}`, batchData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating batch');
  }
};

export const deleteBatch = async (id) => {
  try {
    const response = await api.delete(`/admin/batches/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting batch');
  }
};

// Timetable API functions
export const generateTimetable = async () => {
  try {
    const response = await api.post('/admin/timetable/generate');
    if (!response.data) {
      throw new Error('No response data received');
    }
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to generate timetable');
    }
    return response.data;
  } catch (error) {
    console.error('Error in generateTimetable:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to generate timetable. Please check server logs.');
    }
  }
};

export const getTimetable = async () => {
  try {
    const response = await api.get('/admin/timetable');
    console.log('Raw timetable response:', response);
    
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch timetable');
    }
    
    // Return the data array directly
    return response.data.data;
  } catch (error) {
    console.error('Error in getTimetable:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to fetch timetable. Please check server logs.');
    }
  }
};

export const updateTimetableSlot = async (id, updates) => {
  try {
    console.log('API updateTimetableSlot:', { id, updates });
    const response = await api.put(`/admin/timetable/${id}`, updates);
    
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in updateTimetableSlot:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to update timetable slot');
    }
  }
};

export const requestTimeSlotChange = async (data) => {
  try {
    const response = await api.post('/lecturer/request-change', data);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to submit change request');
  }
};

export const getLecturerChangeRequests = async () => {
  try {
    const response = await api.get('/lecturer/change-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching change requests:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch change requests');
  }
};

export const getAdminChangeRequests = async () => {
  try {
    const response = await api.get('/admin/change-requests');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch change requests');
  }
};

export const handleChangeRequest = async (id, data) => {
  try {
    const response = await api.put(`/admin/change-requests/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to handle change request');
  }
};

// Student API endpoints
export const registerStudent = async (data) => {
  try {
    const response = await api.post('/auth/register/student', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const verifyRegistrationCode = async (code) => {
  try {
    const response = await api.get(`/auth/verify-registration-code/${code}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Invalid registration code');
  }
};

export const getStudentTimetable = async (batchId, group) => {
  try {
    console.log('Fetching timetable for:', { batchId, group });
    const response = await api.get(`/student/timetable/${batchId}/${group}`);
    return response.data;
  } catch (error) {
    console.error('Error in getStudentTimetable:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch timetable');
  }
};

export const getStudentBatches = async () => {
  try {
    console.log('Fetching student batches');
    const response = await api.get('/student/batches');
    return response.data;
  } catch (error) {
    console.error('Error in getStudentBatches:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch batches');
  }
};
