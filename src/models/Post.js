const db = require('../database/db');

class Post {
  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @param {number} postData.userId - User ID who creates the post
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
   * @param {number} postId - Post ID
   * @returns {Promise<Object|null>} - Post object or null
   */
  static async findById(postId) {
    const result = await db.query(
      'SELECT * FROM posts WHERE id = $1',
      [postId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all posts with pagination
   * @param {number} limit - Number of posts to fetch
   * @param {number} offset - Number of posts to skip
   * @returns {Promise<Array>} - Array of posts
   */
  static async findAll(limit = 20, offset = 0) {
    const result = await db.query(
      `SELECT p.*, u.nickname as author_nickname
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Get post with author info and like count
   * @param {number} postId - Post ID
   * @param {number} requestUserId - ID of the user making the request (optional)
   * @returns {Promise<Object|null>} - Post with like info or null
   */
  static async findByIdWithLikes(postId, requestUserId = null) {
    const query = `
      SELECT 
        p.*,
        u.nickname as author_nickname,
        COUNT(l.id)::int as like_count,
        ${requestUserId ? `BOOL_OR(l.user_id = $2) as is_liked` : 'false as is_liked'}
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE p.id = $1
      GROUP BY p.id, u.nickname
    `;
    
    const params = requestUserId ? [postId, requestUserId] : [postId];
    const result = await db.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Get all posts with like counts and user's like status
   * @param {number} limit - Number of posts to fetch
   * @param {number} offset - Number of posts to skip
   * @param {number} requestUserId - ID of the user making the request (optional)
   * @returns {Promise<Array>} - Array of posts with like info
   */
  static async findAllWithLikes(limit = 20, offset = 0, requestUserId = null) {
    const query = `
      SELECT 
        p.*,
        u.nickname as author_nickname,
        COUNT(l.id)::int as like_count,
        ${requestUserId ? `BOOL_OR(l.user_id = $3) as is_liked` : 'false as is_liked'}
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      GROUP BY p.id, u.nickname
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const params = requestUserId ? [limit, offset, requestUserId] : [limit, offset];
    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Update a post
   * @param {number} postId - Post ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated post object
   */
  static async update(postId, updates) {
    const { title, content } = updates;
    const result = await db.query(
      `UPDATE posts 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [title, content, postId]
    );
    return result.rows[0];
  }

  /**
   * Delete a post
   * @param {number} postId - Post ID
   * @returns {Promise<boolean>} - True if deleted
   */
  static async delete(postId) {
    const result = await db.query(
      'DELETE FROM posts WHERE id = $1 RETURNING id',
      [postId]
    );
    return result.rows.length > 0;
  }
}

module.exports = Post;
