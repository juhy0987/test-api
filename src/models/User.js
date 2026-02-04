const db = require('../database/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password
   * @param {string} userData.nickname - User nickname
   * @returns {Promise<Object>} - Created user object
   */
  static async create({ email, password, nickname }) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      const result = await db.query(
        `INSERT INTO users (email, password, nickname, status) 
         VALUES ($1, $2, $3, 'inactive') 
         RETURNING id, email, nickname, status, created_at`,
        [email, hashedPassword, nickname]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        if (error.constraint === 'users_email_key') {
          throw new Error('이미 사용 중인 이메일입니다.');
        }
        if (error.constraint === 'users_nickname_key') {
          throw new Error('이미 사용 중인 닉네임입니다.');
        }
      }
      throw error;
    }
  }
  
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} - User object or null
   */
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }
  
  /**
   * Find user by nickname
   * @param {string} nickname - User nickname
   * @returns {Promise<Object|null>} - User object or null
   */
  static async findByNickname(nickname) {
    const result = await db.query(
      'SELECT * FROM users WHERE nickname = $1',
      [nickname]
    );
    return result.rows[0] || null;
  }
  
  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} - User object or null
   */
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
  
  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} - True if email exists
   */
  static async emailExists(email) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists',
      [email]
    );
    return result.rows[0].exists;
  }
  
  /**
   * Check if nickname exists
   * @param {string} nickname - Nickname to check
   * @returns {Promise<boolean>} - True if nickname exists
   */
  static async nicknameExists(nickname) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE nickname = $1) as exists',
      [nickname]
    );
    return result.rows[0].exists;
  }
  
  /**
   * Activate user account
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Updated user object
   */
  static async activate(userId) {
    const result = await db.query(
      `UPDATE users 
       SET status = 'active', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, email, nickname, status, updated_at`,
      [userId]
    );
    return result.rows[0];
  }
  
  /**
   * Compare password with hashed password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} - True if passwords match
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;