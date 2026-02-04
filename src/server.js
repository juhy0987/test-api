const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '모두의 책 API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      register: 'POST /api/users/register',
      verifyEmail: 'GET /api/users/verify-email',
      checkEmail: 'POST /api/users/check-email',
      checkNickname: 'POST /api/users/check-nickname'
    }
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Server is running on port ${PORT}`);
  console.log(`\n🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n🚀 API Documentation:`);
  console.log(`   - Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   - Register User: POST http://localhost:${PORT}/api/users/register`);
  console.log(`   - Verify Email: GET http://localhost:${PORT}/api/users/verify-email?token=xxx`);
  console.log(`   - Check Email: POST http://localhost:${PORT}/api/users/check-email`);
  console.log(`   - Check Nickname: POST http://localhost:${PORT}/api/users/check-nickname\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
