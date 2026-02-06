const db = require('../database/db');

class Like {
  /**
   * Toggle like for a post
   * Creates a like if it doesn't exist, deletes it if it does
   * @param {number} userId - User ID
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} - Result object with action and like count
   */
  static async toggle(userId, postId) {
    try {
      // Start a transaction
      await db.query('BEGIN');

      // Check if like exists
      const checkResult = await db.query(
        'SELECT id FROM likes WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );

      let action;
      if (checkResult.rows.length > 0) {
        // Unlike: delete the like
        await db.query(
          'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
          [userId, postId]
        );
        action = 'unliked';
      } else {
        // Like: create a new like
        await db.query(
          'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
          [userId, postId]
        );
        action = 'liked';
      }

      // Get updated like count
      const countResult = await db.query(
        'SELECT COUNT(*)::int as like_count FROM likes WHERE post_id = $1',
        [postId]
      );

      await db.query('COMMIT');

      return {
        action,
        likeCount: countResult.rows[0].like_count,
        isLiked: action === 'liked'
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Check if user has liked a post
   * @param {number} userId - User ID
   * @param {number} postId - Post ID
   * @returns {Promise<boolean>} - True if liked
   */
  static async isLiked(userId, postId) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2) as is_liked',
      [userId, postId]
    );
    return result.rows[0].is_liked;
  }

  /**
   * Get like count for a post
   * @param {number} postId - Post ID
   * @returns {Promise<number>} - Like count
   */
  static async getCount(postId) {
    const result = await db.query(
      'SELECT COUNT(*)::int as like_count FROM likes WHERE post_id = $1',
      [postId]
    );
    return result.rows[0].like_count;
  }

  /**
   * Get all likes for a post
   * @param {number} postId - Post ID
   * @returns {Promise<Array>} - Array of likes with user info
   */
  static async findByPostId(postId) {
    const result = await db.query(
      `SELECT l.*, u.nickname 
       FROM likes l
       JOIN users u ON l.user_id = u.id
       WHERE l.post_id = $1
       ORDER BY l.created_at DESC`,
      [postId]
    );
    return result.rows;
  }

  /**
   * Get all posts liked by a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of liked posts
   */
  static async findByUserId(userId) {
    const result = await db.query(
      `SELECT l.*, p.title, p.content 
       FROM likes l
       JOIN posts p ON l.post_id = p.id
       WHERE l.user_id = $1
       ORDER BY l.created_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = Like;
