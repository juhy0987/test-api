const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for signup endpoint
 * More restrictive to prevent abuse
 */
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 signup requests per windowMs
  message: {
    success: false,
    message: '너무 많은 가입 시도가 감지되었습니다. 15분 후에 다시 시도해주세요.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * General rate limiter for check endpoints
 * Less restrictive for real-time validation
 */
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: {
    success: false,
    message: '너무 많은 요청이 감지되었습니다. 잠시 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  signupLimiter,
  generalLimiter
};