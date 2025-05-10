const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./utils/logger');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const lecturerRoutes = require('./routes/lecturerRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB Atlas');
})
.catch((err) => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

// Set Mongoose options
mongoose.set('strictQuery', true);

const app = express();

// CORS configuration with multiple origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

// Health check endpoint (not logged)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to University Timetable Management System API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/student', studentRoutes);

// Handle 404s
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection:', { error: err.message, stack: err.stack });
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  // Close server & exit process
  process.exit(1);
});

// Start server function with port fallback
const startServer = async () => {
  const port = process.env.PORT || 5000;
  let currentPort = port;
  
  const tryListen = (retryPort) => {
    return new Promise((resolve, reject) => {
      const server = app.listen(retryPort)
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            logger.warn(`Port ${retryPort} is busy, trying ${retryPort + 1}...`);
            server.close();
            resolve(false);
          } else {
            reject(err);
          }
        })
        .once('listening', () => {
          logger.info(`Server running on port ${retryPort}`);
          resolve(true);
        });
    });
  };

  while (currentPort < port + 10) {
    try {
      const success = await tryListen(currentPort);
      if (success) {
        if (currentPort !== port) {
          logger.info(`Note: Server is running on port ${currentPort} instead of default port ${port}`);
        }
        break;
      }
      currentPort++;
    } catch (err) {
      logger.error('Server error:', err);
      process.exit(1);
    }
  }
};

// Start the server
startServer();
