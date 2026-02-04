const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// User routes
router.use('/users', userRoutes);

module.exports = router;
