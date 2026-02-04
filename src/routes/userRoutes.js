const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
  validateRegistration,
  validateEmailCheck,
  validateNicknameCheck,
  validateEmailVerification,
  handleValidationErrors
} = require('../middleware/validators');

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validateRegistration,
  handleValidationErrors,
  userController.register
);

/**
 * @route   GET /api/users/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.get(
  '/verify-email',
  validateEmailVerification,
  handleValidationErrors,
  userController.verifyEmail
);

/**
 * @route   POST /api/users/check-email
 * @desc    Check if email is already in use
 * @access  Public
 */
router.post(
  '/check-email',
  validateEmailCheck,
  handleValidationErrors,
  userController.checkEmail
);

/**
 * @route   POST /api/users/check-nickname
 * @desc    Check if nickname is already in use
 * @access  Public
 */
router.post(
  '/check-nickname',
  validateNicknameCheck,
  handleValidationErrors,
  userController.checkNickname
);

module.exports = router;
