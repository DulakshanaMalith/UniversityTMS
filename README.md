# University Timetable Management System

A MERN stack application for managing university timetables with support for multiple user roles (Admin, Lecturer, Student).

## Features

- User Management (Admin, Lecturer, Student roles)
- Batch Management
- Hall Management
- Module Management
- Automated Timetable Generation
- Conflict-free Scheduling
- Role-based Access Control

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd unittt
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a .env file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
```

## Running the Application

1. Start the backend server:
```bash
# From the root directory
npm run dev
```

2. Start the frontend development server:
```bash
# From the client directory
npm run dev
```

The application will be available at:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Default Admin Account

Username: admin
Password: admin123

## API Documentation

### Authentication
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- POST /api/auth/register/student - Register new student
- GET /api/auth/verify-registration-code/:code - Verify batch registration code

### Admin Routes
- POST /api/admin/users - Add new user
- POST /api/admin/batches - Add new batch
- POST /api/admin/halls - Add new hall
- POST /api/admin/modules - Add new module
- POST /api/admin/timetable/generate - Generate timetable
- GET /api/admin/timetable - Get timetable

## Student Registration Process

1. **Admin Creates Batch**
   - Admin creates a new batch through the Batch Management interface
   - A unique registration code is automatically generated for the batch
   - Admin can view this code in the batch details

2. **Student Registration**
   - Students visit the registration page
   - Enter the registration code provided by admin
   - If code is valid, they can proceed with registration:
     - Student ID
     - Full Name
     - Email
     - Password
   - System validates:
     - Registration code validity
     - Batch capacity
     - Unique student ID and email

3. **Post-Registration**
   - Students can log in using their Student ID and password
   - They are automatically assigned to the correct batch
   - They can view their batch's timetable

## License

MIT
