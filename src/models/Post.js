const db = require('../database/db');

class Post {
  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @param {number} postData.userId - User ID
   * @param {string} postData.title - Post title
   * @param {string} postData.content - Post content
   * @returns {Promise<Object>} - Created post object
   */
  static async create({ userId, title, content }) {
    const result = await db.query(
      `INSERT INTO posts (user_id, title, content) 
       VALUES ($1, $2, $3) 
       RETURNING id, user_id, title, content, created_at, updated_at`,
      [userId, title, content]
    );
    return result.rows[0];
  }

  /**
   * Find post by ID
   * @param {number} id - Post ID
   * @returns {Promise<Object|null>} - Post object or null
   */
  static async findById(id) {
    const result = await db.query(
      `SELECT p.*, u.nickname, u.profile_picture 
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all posts with pagination
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of posts per page
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Array>} - Array of posts
   */
  static async findAll({ limit = 20, offset = 0 }) {
    const result = await db.query(
      `SELECT p.*, u.nickname, u.profile_picture,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       ORDER BY p.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Update post
   * @param {number} id - Post ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated post object
   */
  static async update(id, { title, content }) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(content);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(
      `UPDATE posts 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete post
   * @param {number} id - Post ID
   * @returns {Promise<boolean>} - True if deleted
   */
  static async delete(id) {
    const result = await db.query('DELETE FROM posts WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  /**
   * Check if post exists
   * @param {number} id - Post ID
   * @returns {Promise<boolean>} - True if post exists
   */
  static async exists(id) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM posts WHERE id = $1) as exists',
      [id]
    );
    return result.rows[0].exists;
  }
}

module.exports = Post;
