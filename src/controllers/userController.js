const { User, VerificationToken } = require('../models');
const { sendVerificationEmail } = require('../services/emailService');
const { Op } = require('sequelize');

/**
 * Register a new user
 * POST /api/users/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 이메일입니다.',
        field: 'email'
      });
    }

    // Check if nickname already exists
    const existingNickname = await User.findOne({ where: { nickname } });
    if (existingNickname) {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 닉네임입니다.',
        field: 'nickname'
      });
    }

    // Create new user (inactive by default)
    const user = await User.create({
      email,
      password,
      nickname,
      isActive: false
    });

    // Generate verification token (24 hours expiration)
    const verificationTokenRecord = await VerificationToken.createVerificationToken(
      user.userId,
      parseInt(process.env.VERIFICATION_TOKEN_EXPIRE) || 24
    );

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationTokenRecord.token, nickname);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails - user is created
    }

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      data: {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email with token
 * GET /api/users/verify-email?token=xxx
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    // Find the verification token
    const verificationToken = await VerificationToken.findOne({
      where: { token },
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!verificationToken) {
      return res.status(404).json({
        success: false,
        message: '유효하지 않은 인증 토큰입니다.'
      });
    }

    // Check if token is valid (not used and not expired)
    if (!verificationToken.isValid()) {
      return res.status(400).json({
        success: false,
        message: verificationToken.isUsed 
          ? '이미 사용된 인증 토큰입니다.'
          : '만료된 인증 토큰입니다. 새로운 인증 이메일을 요청해주세요.'
      });
    }

    const user = verificationToken.user;

    // Check if user is already active
    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: '이미 활성화된 계정입니다.'
      });
    }

    // Activate user account
    await user.update({
      isActive: true,
      emailVerifiedAt: new Date()
    });

    // Mark token as used
    await verificationToken.update({
      isUsed: true
    });

    res.status(200).json({
      success: true,
      message: '이메일 인증이 완료되었습니다. 로그인해주세요.',
      data: {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if email is already in use
 * POST /api/users/check-email
 */
const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ where: { email } });

    res.status(200).json({
      success: true,
      data: {
        email,
        isAvailable: !existingUser,
        message: existingUser 
          ? '이미 사용 중인 이메일입니다.'
          : '사용 가능한 이메일입니다.'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if nickname is already in use
 * POST /api/users/check-nickname
 */
const checkNickname = async (req, res, next) => {
  try {
    const { nickname } = req.body;

    const existingUser = await User.findOne({ where: { nickname } });

    res.status(200).json({
      success: true,
      data: {
        nickname,
        isAvailable: !existingUser,
        message: existingUser 
          ? '이미 사용 중인 닉네임입니다.'
          : '사용 가능한 닉네임입니다.'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  checkEmail,
  checkNickname
};
