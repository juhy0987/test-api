/**
 * Validation utility functions for user input
 */

/**
 * Validates email format according to RFC 5322 standard
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // RFC 5322 compliant email regex (simplified but comprehensive)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validates password according to specified rules:
 * - 8-20 characters long
 * - At least one English letter
 * - At least one number
 * - At least one special character from !@#$%^&*
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['비밀번호를 입력해주세요.'] };
  }
  
  // Check length
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  if (password.length > 20) {
    errors.push('비밀번호는 최대 20자 이하여야 합니다.');
  }
  
  // Check for at least one English letter
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('비밀번호에 영문자가 최소 1개 포함되어야 합니다.');
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호에 숫자가 최소 1개 포함되어야 합니다.');
  }
  
  // Check for at least one special character from !@#$%^&*
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('비밀번호에 특수문자(!@#$%^&*)가 최소 1개 포함되어야 합니다.');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validates nickname according to specified rules:
 * - 2-10 characters long
 * - Only Korean, English letters, or numbers
 * @param {string} nickname - Nickname to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
const validateNickname = (nickname) => {
  const errors = [];
  
  if (!nickname || typeof nickname !== 'string') {
    return { valid: false, errors: ['닉네임을 입력해주세요.'] };
  }
  
  // Check length
  if (nickname.length < 2) {
    errors.push('닉네임은 최소 2자 이상이어야 합니다.');
  }
  if (nickname.length > 10) {
    errors.push('닉네임은 최대 10자 이하여야 합니다.');
  }
  
  // Check for only Korean, English, or numbers
  // Korean: \uAC00-\uD7AF (Hangul syllables)
  // English: a-zA-Z
  // Numbers: 0-9
  if (!/^[a-zA-Z0-9\uAC00-\uD7AF]+$/.test(nickname)) {
    errors.push('닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateNickname
};