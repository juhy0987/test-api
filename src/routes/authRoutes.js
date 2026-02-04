const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { signupLimiter, generalLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', signupLimiter, authController.signup);

/**
 * GET /api/auth/verify-email
 * Verify user email with token
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * POST /api/auth/check-email
 * Check if email is available
 */
router.post('/check-email', generalLimiter, authController.checkEmail);

/**
 * POST /api/auth/check-nickname
 * Check if nickname is available
 */
router.post('/check-nickname', generalLimiter, authController.checkNickname);

module.exports = router;