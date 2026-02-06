const db = require('../database/db');

class Comment {
  /**
   * Create a new comment or reply
   * @param {Object} commentData - Comment data
   * @param {number} commentData.postId - Post ID
   * @param {number} commentData.userId - User ID
   * @param {string} commentData.content - Comment content (max 500 chars)
   * @param {number} commentData.parentCommentId - Parent comment ID for replies (optional)
   * @returns {Promise<Object>} - Created comment object
   */
  static async create({ postId, userId, content, parentCommentId = null }) {
    // Validate content length
    if (content.length > 500) {
      throw new Error('댓글은 최대 500자까지 작성할 수 있습니다.');
    }

    const result = await db.query(
      `INSERT INTO comments (post_id, user_id, content, parent_comment_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, post_id, user_id, parent_comment_id, content, created_at, updated_at`,
      [postId, userId, content, parentCommentId]
    );

    // Get comment with user info
    return await this.findById(result.rows[0].id);
  }

  /**
   * Find comment by ID with user information
   * @param {number} id - Comment ID
   * @returns {Promise<Object|null>} - Comment object or null
   */
  static async findById(id) {
    const result = await db.query(
      `SELECT c.*, 
              u.nickname, 
              u.profile_picture,
              CASE 
                WHEN c.parent_comment_id IS NOT NULL 
                THEN (SELECT u2.nickname FROM comments c2 
                      JOIN users u2 ON c2.user_id = u2.id 
                      WHERE c2.id = c.parent_comment_id)
                ELSE NULL 
              END as parent_author_nickname
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all comments for a post (sorted oldest first, with nested replies)
   * @param {number} postId - Post ID
   * @returns {Promise<Array>} - Array of comments with nested replies
   */
  static async findByPostId(postId) {
    // Get all comments for the post
    const result = await db.query(
      `SELECT c.*, 
              u.nickname, 
              u.profile_picture,
              CASE 
                WHEN c.parent_comment_id IS NOT NULL 
                THEN (SELECT u2.nickname FROM comments c2 
                      JOIN users u2 ON c2.user_id = u2.id 
                      WHERE c2.id = c.parent_comment_id)
                ELSE NULL 
              END as parent_author_nickname
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.post_id = $1 
       ORDER BY c.created_at ASC`,
      [postId]
    );

    const comments = result.rows;

    // Separate parent comments and replies
    const parentComments = comments.filter(c => c.parent_comment_id === null);
    const replies = comments.filter(c => c.parent_comment_id !== null);

    // Nest replies under their parent comments (1 level only for MVP)
    parentComments.forEach(parent => {
      parent.replies = replies
        .filter(reply => reply.parent_comment_id === parent.id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });

    return parentComments;
  }

  /**
   * Update comment content
   * @param {number} id - Comment ID
   * @param {number} userId - User ID (for authorization check)
   * @param {string} content - New content
   * @returns {Promise<Object>} - Updated comment object
   */
  static async update(id, userId, content) {
    // Validate content length
    if (content.length > 500) {
      throw new Error('댓글은 최대 500자까지 작성할 수 있습니다.');
    }

    // Check if comment exists and belongs to user
    const comment = await this.findById(id);
    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }
    if (comment.user_id !== userId) {
      throw new Error('자신의 댓글만 수정할 수 있습니다.');
    }

    const result = await db.query(
      `UPDATE comments 
       SET content = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [content, id]
    );

    return await this.findById(result.rows[0].id);
  }

  /**
   * Delete comment
   * @param {number} id - Comment ID
   * @param {number} userId - User ID (for authorization check)
   * @returns {Promise<boolean>} - True if deleted
   */
  static async delete(id, userId) {
    // Check if comment exists and belongs to user
    const comment = await this.findById(id);
    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }
    if (comment.user_id !== userId) {
      throw new Error('자신의 댓글만 삭제할 수 있습니다.');
    }

    const result = await db.query('DELETE FROM comments WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  /**
   * Check if comment exists
   * @param {number} id - Comment ID
   * @returns {Promise<boolean>} - True if comment exists
   */
  static async exists(id) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM comments WHERE id = $1) as exists',
      [id]
    );
    return result.rows[0].exists;
  }

  /**
   * Get comment count for a post
   * @param {number} postId - Post ID
   * @returns {Promise<number>} - Comment count
   */
  static async getCountByPostId(postId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM comments WHERE post_id = $1',
      [postId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Comment;
