const db = require('../database/db');

class Post {
  /**
   * Create a new post with book review information
   * @param {Object} postData - Post data
   * @param {number} postData.userId - User ID
   * @param {number} postData.rating - Rating (1-5)
   * @param {string} postData.content - Post content (max 2000 chars)
   * @param {string} postData.isbn - Book ISBN
   * @param {string} postData.title - Book title
   * @param {string} postData.author - Book author
   * @param {string} postData.publisher - Book publisher
   * @param {string} postData.coverImageUrl - Book cover image URL
   * @param {Array<string>} postData.images - Array of uploaded image URLs (max 5)
   * @param {Array<string>} postData.hashtags - Array of hashtags (max 10)
   * @returns {Promise<Object>} - Created post object
   */
  static async create({ 
    userId, 
    rating, 
    content, 
    isbn, 
    title, 
    author, 
    publisher, 
    coverImageUrl,
    images = [],
    hashtags = []
  }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Insert post
      const postResult = await client.query(
        `INSERT INTO posts (
          user_id, rating, content, isbn, title, author, publisher, cover_image_url, images
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
        [userId, rating, content, isbn, title, author, publisher, coverImageUrl, JSON.stringify(images)]
      );

      const post = postResult.rows[0];

      // Insert hashtags
      if (hashtags.length > 0) {
        const hashtagValues = hashtags.map((tag, index) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        await client.query(
          `INSERT INTO post_hashtags (post_id, hashtag) 
           VALUES ${hashtagValues}`,
          [post.id, ...hashtags]
        );
      }

      await client.query('COMMIT');

      // Fetch the complete post with user info
      return await this.findById(post.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find post by ID with full details
   * @param {number} id - Post ID
   * @returns {Promise<Object|null>} - Post object with user info and hashtags or null
   */
  static async findById(id) {
    const postResult = await db.query(
      `SELECT p.*, u.nickname, u.profile_picture,
              COALESCE(
                json_agg(
                  DISTINCT ph.hashtag
                ) FILTER (WHERE ph.hashtag IS NOT NULL), 
                '[]'
              ) as hashtags
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       LEFT JOIN post_hashtags ph ON p.id = ph.post_id
       WHERE p.id = $1
       GROUP BY p.id, u.nickname, u.profile_picture`,
      [id]
    );

    if (postResult.rows.length === 0) {
      return null;
    }

    const post = postResult.rows[0];
    
    // Parse JSON fields
    if (post.images) {
      post.images = JSON.parse(post.images);
    }

    return post;
  }

  /**
   * Get all posts with pagination
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of posts per page
   * @param {number} options.offset - Offset for pagination
   * @param {number} options.userId - Optional filter by user ID
   * @returns {Promise<Array>} - Array of posts
   */
  static async findAll({ limit = 20, offset = 0, userId = null }) {
    let query = `
      SELECT p.*, u.nickname, u.profile_picture,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
             COALESCE(
               json_agg(
                 DISTINCT ph.hashtag
               ) FILTER (WHERE ph.hashtag IS NOT NULL), 
               '[]'
             ) as hashtags
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      LEFT JOIN post_hashtags ph ON p.id = ph.post_id
    `;
    
    const params = [limit, offset];
    
    if (userId) {
      query += ' WHERE p.user_id = $3';
      params.push(userId);
    }
    
    query += ' GROUP BY p.id, u.nickname, u.profile_picture ORDER BY p.created_at DESC LIMIT $1 OFFSET $2';

    const result = await db.query(query, params);
    
    // Parse JSON fields for each post
    return result.rows.map(post => {
      if (post.images) {
        post.images = JSON.parse(post.images);
      }
      return post;
    });
  }

  /**
   * Update post
   * @param {number} id - Post ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated post object
   */
  static async update(id, { rating, content, images, hashtags }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (rating !== undefined) {
        updates.push(`rating = $${paramCount++}`);
        values.push(rating);
      }
      if (content !== undefined) {
        updates.push(`content = $${paramCount++}`);
        values.push(content);
      }
      if (images !== undefined) {
        updates.push(`images = $${paramCount++}`);
        values.push(JSON.stringify(images));
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const postResult = await client.query(
        `UPDATE posts 
         SET ${updates.join(', ')} 
         WHERE id = $${paramCount} 
         RETURNING *`,
        values
      );

      // Update hashtags if provided
      if (hashtags !== undefined) {
        // Delete existing hashtags
        await client.query('DELETE FROM post_hashtags WHERE post_id = $1', [id]);
        
        // Insert new hashtags
        if (hashtags.length > 0) {
          const hashtagValues = hashtags.map((tag, index) => 
            `($1, $${index + 2})`
          ).join(', ');
          
          await client.query(
            `INSERT INTO post_hashtags (post_id, hashtag) 
             VALUES ${hashtagValues}`,
            [id, ...hashtags]
          );
        }
      }

      await client.query('COMMIT');

      return await this.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
   * Check if post exists and belongs to user
   * @param {number} id - Post ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} - True if post exists and belongs to user
   */
  static async belongsToUser(id, userId) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM posts WHERE id = $1 AND user_id = $2) as exists',
      [id, userId]
    );
    return result.rows[0].exists;
  }

  /**
   * Search posts by hashtag
   * @param {string} hashtag - Hashtag to search
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of posts
   */
  static async findByHashtag(hashtag, { limit = 20, offset = 0 }) {
    const result = await db.query(
      `SELECT p.*, u.nickname, u.profile_picture,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
              COALESCE(
                json_agg(
                  DISTINCT ph.hashtag
                ) FILTER (WHERE ph.hashtag IS NOT NULL), 
                '[]'
              ) as hashtags
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       LEFT JOIN post_hashtags ph ON p.id = ph.post_id
       WHERE p.id IN (
         SELECT post_id FROM post_hashtags WHERE hashtag = $1
       )
       GROUP BY p.id, u.nickname, u.profile_picture
       ORDER BY p.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [hashtag, limit, offset]
    );
    
    return result.rows.map(post => {
      if (post.images) {
        post.images = JSON.parse(post.images);
      }
      return post;
    });
  }
}

module.exports = Post;
