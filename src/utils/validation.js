/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('비밀번호를 입력해주세요.');
    return { valid: false, errors };
  }

  // Length check (8-20 characters)
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  if (password.length > 20) {
    errors.push('비밀번호는 최대 20자까지 가능합니다.');
  }

  // Character type checks
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('비밀번호는 최소 1개의 영문자를 포함해야 합니다.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호는 최소 1개의 숫자를 포함해야 합니다.');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('비밀번호는 최소 1개의 특수문자(!@#$%^&*)를 포함해야 합니다.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate nickname
 * @param {string} nickname - Nickname to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
const validateNickname = (nickname) => {
  const errors = [];

  if (!nickname || typeof nickname !== 'string') {
    errors.push('닉네임을 입력해주세요.');
    return { valid: false, errors };
  }

  // Length check (2-10 characters)
  if (nickname.length < 2) {
    errors.push('닉네임은 최소 2자 이상이어야 합니다.');
  }
  if (nickname.length > 10) {
    errors.push('닉네임은 최대 10자까지 가능합니다.');
  }

  // Character check (Korean, English, numbers only)
  if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
    errors.push('닉네임은 한글, 영문, 숫자만 사용 가능합니다.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate post content
 * @param {string} content - Post content to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
const validatePostContent = (content) => {
  const errors = [];

  if (content && typeof content === 'string') {
    // Max 2000 characters
    if (content.length > 2000) {
      errors.push('게시물 내용은 최대 2,000자까지 입력 가능합니다.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateNickname,
  validatePostContent
};
