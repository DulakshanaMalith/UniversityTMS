const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// Test cases
const testCases = {
  // Authentication errors
  auth: async () => {
    console.log('\n🔒 Testing Authentication Errors:');
    
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✓ Invalid login:', error.response.data);
    }

    try {
      await axios.get(`${API_URL}/lecturer/timetable`, {
        headers: { Authorization: 'Bearer invalidtoken' }
      });
    } catch (error) {
      console.log('✓ Invalid token:', error.response.data);
    }
  },

  // Validation errors
  validation: async () => {
    console.log('\n📝 Testing Validation Errors:');
    
    try {
      await axios.post(`${API_URL}/lecturer/request-change`, {
        // Missing required fields
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('✓ Missing required fields:', error.response.data);
    }

    try {
      await axios.post(`${API_URL}/lecturer/request-change`, {
        timetableEntryId: 'invalid-id',
        requestedDay: 'InvalidDay',
        requestedTimeSlot: '25:00-26:00',
        reason: 'test'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('✓ Invalid field values:', error.response.data);
    }
  },

  // Resource not found errors
  notFound: async () => {
    console.log('\n🔍 Testing Resource Not Found Errors:');
    
    try {
      await axios.get(`${API_URL}/nonexistent-route`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('✓ Route not found:', error.response.data);
    }

    try {
      await axios.get(`${API_URL}/admin/change-requests/507f1f77bcf86cd799439011`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('✓ Resource not found:', error.response.data);
    }
  },

  // Authorization errors
  authorization: async () => {
    console.log('\n🚫 Testing Authorization Errors:');
    
    try {
      // Try to access admin route with lecturer token
      await axios.get(`${API_URL}/admin/change-requests`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('✓ Unauthorized access:', error.response.data);
    }
  },

  // Conflict errors
  conflict: async () => {
    console.log('\n⚠️ Testing Conflict Errors:');
    
    try {
      // Try to create a duplicate change request
      const payload = {
        timetableEntryId: '507f1f77bcf86cd799439011',
        requestedDay: 'Monday',
        requestedTimeSlot: '08:00-10:00',
        reason: 'Testing conflicts'
      };

      await axios.post(`${API_URL}/lecturer/request-change`, payload, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      // Try to create the same request again
      await axios.post(`${API_URL}/lecturer/request-change`, payload, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      console.log('✓ Duplicate request:', error.response.data);
    }
  }
};

// Login helper function
const login = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'lecturer@test.com',
      password: 'testpassword'
    });
    authToken = response.data.token;
    console.log('✓ Logged in successfully');
  } catch (error) {
    console.error('❌ Login failed:', error.response.data);
    process.exit(1);
  }
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting Error Handling Tests\n');
  
  await login();

  for (const [name, testFn] of Object.entries(testCases)) {
    try {
      await testFn();
    } catch (error) {
      console.error(`❌ ${name} tests failed:`, error);
    }
  }

  console.log('\n✨ Tests completed');
};

// Run the tests
runTests();
