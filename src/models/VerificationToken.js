const db = require('../database/db');
const { generateVerificationToken, calculateExpirationTime } = require('../utils/tokenGenerator');

class VerificationToken {
  /**
   * Create a verification token for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Created token object
   */
  static async create(userId) {
    const token = generateVerificationToken();
    const expiresAt = calculateExpirationTime(24); // 24 hours
    
    const result = await db.query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3) 
       RETURNING id, user_id, token, expires_at, used, created_at`,
      [userId, token, expiresAt]
    );
    
    return result.rows[0];
  }
  
  /**
   * Find token by token string
   * @param {string} token - Token string
   * @returns {Promise<Object|null>} - Token object or null
   */
  static async findByToken(token) {
    const result = await db.query(
      'SELECT * FROM email_verification_tokens WHERE token = $1',
      [token]
    );
    return result.rows[0] || null;
  }
  
  /**
   * Validate token
   * @param {string} token - Token string
   * @returns {Promise<Object>} - Validation result
   */
  static async validate(token) {
    const tokenData = await this.findByToken(token);
    
    if (!tokenData) {
      return { valid: false, error: '유효하지 않은 인증 토큰입니다.' };
    }
    
    if (tokenData.used) {
      return { valid: false, error: '이미 사용된 인증 토큰입니다.' };
    }
    
    if (new Date() > new Date(tokenData.expires_at)) {
      return { valid: false, error: '만료된 인증 토큰입니다. 다시 시도해주세요.' };
    }
    
    return { valid: true, tokenData };
  }
  
  /**
   * Mark token as used
   * @param {string} token - Token string
   * @returns {Promise<Object>} - Updated token object
   */
  static async markAsUsed(token) {
    const result = await db.query(
      `UPDATE email_verification_tokens 
       SET used = true 
       WHERE token = $1 
       RETURNING *`,
      [token]
    );
    return result.rows[0];
  }
  
  /**
   * Delete expired tokens (cleanup)
   * @returns {Promise<number>} - Number of deleted tokens
   */
  static async deleteExpired() {
    const result = await db.query(
      'DELETE FROM email_verification_tokens WHERE expires_at < CURRENT_TIMESTAMP'
    );
    return result.rowCount;
  }
}

module.exports = VerificationToken;