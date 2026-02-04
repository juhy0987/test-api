const crypto = require('crypto');

/**
 * Generate a secure random token for email verification
 * @param {number} length - Length of the token (default: 32)
 * @returns {string} - Random hex token
 */
const generateVerificationToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Calculate token expiration timestamp
 * @param {number} hours - Number of hours until expiration (default: 24)
 * @returns {Date} - Expiration date
 */
const calculateExpirationTime = (hours = 24) => {
  const expiryHours = process.env.VERIFICATION_TOKEN_EXPIRY_HOURS || hours;
  return new Date(Date.now() + expiryHours * 60 * 60 * 1000);
};

module.exports = {
  generateVerificationToken,
  calculateExpirationTime,
};