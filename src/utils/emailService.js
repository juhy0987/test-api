const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Create email transporter using SMTP configuration from environment variables
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send verification email to user
 * @param {string} email - Recipient email address
 * @param {string} token - Verification token
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter();
  const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: '회원가입 이메일 인증',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">회원가입을 환영합니다!</h2>
        <p style="color: #666; font-size: 16px;">
          아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
        </p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${verificationLink}" 
             style="background-color: #4CAF50; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;
                    font-size: 16px;">
            이메일 인증하기
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          또는 아래 링크를 복사하여 브라우저에 붙여넣어주세요:
        </p>
        <p style="color: #999; font-size: 12px; word-break: break-all;">
          ${verificationLink}
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">
          이 인증 링크는 24시간 동안 유효합니다.
        </p>
        <p style="color: #999; font-size: 12px;">
          본인이 요청하지 않았다면 이 이메일을 무시해주세요.
        </p>
      </div>
    `,
    text: `
      회원가입을 환영합니다!
      
      아래 링크를 클릭하여 이메일 인증을 완료해주세요:
      ${verificationLink}
      
      이 인증 링크는 24시간 동안 유효합니다.
      본인이 요청하지 않았다면 이 이메일을 무시해주세요.
    `,
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
};