const { body, query, validationResult } = require('express-validator');

/**
 * Validation middleware for user registration
 */
const validateRegistration = [
  body('email')
    .trim()
    .notEmpty().withMessage('이메일은 필수 항목입니다.')
    .isEmail().withMessage('유효한 이메일 형식이 아닙니다.')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('비밀번호는 필수 항목입니다.')
    .isLength({ min: 8, max: 20 }).withMessage('비밀번호는 8자 이상 20자 이하여야 합니다.')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/)
    .withMessage('비밀번호는 영문, 숫자, 특수문자(!@#$%^&*)를 최소 1개씩 포함해야 합니다.'),
  
  body('nickname')
    .trim()
    .notEmpty().withMessage('닉네임은 필수 항목입니다.')
    .isLength({ min: 2, max: 10 }).withMessage('닉네임은 2자 이상 10자 이하여야 합니다.')
    .matches(/^[가-힣a-zA-Z0-9]+$/).withMessage('닉네임은 한글, 영문, 숫자만 사용 가능합니다.')
];

/**
 * Validation middleware for email check
 */
const validateEmailCheck = [
  body('email')
    .trim()
    .notEmpty().withMessage('이메일은 필수 항목입니다.')
    .isEmail().withMessage('유효한 이메일 형식이 아닙니다.')
    .normalizeEmail()
];

/**
 * Validation middleware for nickname check
 */
const validateNicknameCheck = [
  body('nickname')
    .trim()
    .notEmpty().withMessage('닉네임은 필수 항목입니다.')
    .isLength({ min: 2, max: 10 }).withMessage('닉네임은 2자 이상 10자 이하여야 합니다.')
    .matches(/^[가-힣a-zA-Z0-9]+$/).withMessage('닉네임은 한글, 영문, 숫자만 사용 가능합니다.')
];

/**
 * Validation middleware for email verification
 */
const validateEmailVerification = [
  query('token')
    .trim()
    .notEmpty().withMessage('인증 토큰이 필요합니다.')
    .isLength({ min: 32 }).withMessage('유효하지 않은 토큰입니다.')
];

/**
 * Middleware to handle validation results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateEmailCheck,
  validateNicknameCheck,
  validateEmailVerification,
  handleValidationErrors
};
