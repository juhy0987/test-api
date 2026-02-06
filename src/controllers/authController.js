const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const { isValidEmail, validatePassword, validateNickname } = require('../utils/validation');
const { sendVerificationEmail } = require('../utils/emailService');

/**
 * Generate JWT token
 * @param {number} userId - User ID
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * POST /api/auth/signup
 * Register a new user with email verification
 */
const signup = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    
    // Validate input presence
    if (!email || !password || !nickname) {
      return res.status(400).json({
        success: false,
        message: '모든 필드를 입력해주세요.',
        errors: {
          email: !email ? '이메일을 입력해주세요.' : null,
          password: !password ? '비밀번호를 입력해주세요.' : null,
          nickname: !nickname ? '닉네임을 입력해주세요.' : null,
        }
      });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 이메일 형식입니다.',
        errors: { email: '유효하지 않은 이메일 형식입니다.' }
      });
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.errors[0],
        errors: { password: passwordValidation.errors }
      });
    }
    
    // Validate nickname
    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.valid) {
      return res.status(400).json({
        success: false,
        message: nicknameValidation.errors[0],
        errors: { nickname: nicknameValidation.errors }
      });
    }
    
    // Check if email already exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 이메일입니다.',
        errors: { email: '이미 사용 중인 이메일입니다.' }
      });
    }
    
    // Check if nickname already exists
    const nicknameExists = await User.nicknameExists(nickname);
    if (nicknameExists) {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 닉네임입니다.',
        errors: { nickname: '이미 사용 중인 닉네임입니다.' }
      });
    }
    
    // Create user with inactive status
    const user = await User.create({ email, password, nickname });
    
    // Generate verification token
    const tokenData = await VerificationToken.create(user.id);
    
    // Send verification email
    await sendVerificationEmail(email, tokenData.token);
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      data: {
        userId: user.id,
        email: user.email,
        nickname: user.nickname,
        status: user.status
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '이메일 인증이 필요합니다.'
      });
    }

    // Verify password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: '로그인에 성공했습니다.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          status: user.status
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/auth/verify-email
 * Verify user email with token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }
    
    // Validate token
    const validation = await VerificationToken.validate(token);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    
    // Activate user account
    const updatedUser = await User.activate(validation.tokenData.user_id);
    
    // Mark token as used
    await VerificationToken.markAsUsed(token);
    
    return res.status(200).json({
      success: true,
      message: '이메일 인증이 성공적으로 완료되었습니다. 로그인해주세요.',
      data: {
        userId: updatedUser.id,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        status: updatedUser.status
      }
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: '이메일 인증 중 오류가 발생했습니다. 다시 시도해주세요.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/auth/check-email
 * Check if email is available for registration
 */
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일을 입력해주세요.'
      });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(200).json({
        success: true,
        available: false,
        message: '유효하지 않은 이메일 형식입니다.'
      });
    }
    
    // Check if email exists
    const exists = await User.emailExists(email);
    
    return res.status(200).json({
      success: true,
      available: !exists,
      message: exists ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.'
    });
    
  } catch (error) {
    console.error('Check email error:', error);
    return res.status(500).json({
      success: false,
      message: '이메일 확인 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/auth/check-nickname
 * Check if nickname is available for registration
 */
const checkNickname = async (req, res) => {
  try {
    const { nickname } = req.body;
    
    if (!nickname) {
      return res.status(400).json({
        success: false,
        message: '닉네임을 입력해주세요.'
      });
    }
    
    // Validate nickname format
    const validation = validateNickname(nickname);
    if (!validation.valid) {
      return res.status(200).json({
        success: true,
        available: false,
        message: validation.errors[0]
      });
    }
    
    // Check if nickname exists
    const exists = await User.nicknameExists(nickname);
    
    return res.status(200).json({
      success: true,
      available: !exists,
      message: exists ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.'
    });
    
  } catch (error) {
    console.error('Check nickname error:', error);
    return res.status(500).json({
      success: false,
      message: '닉네임 확인 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/auth/me
 * Get current user info
 */
const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: '사용자 정보 조회 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  signup,
  login,
  verifyEmail,
  checkEmail,
  checkNickname,
  getCurrentUser
};
