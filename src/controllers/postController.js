const Post = require('../models/Post');
const { extractHashtags } = require('../utils/hashtags');
const { validatePostContent } = require('../utils/validation');

/**
 * Post Controller
 * Handles CRUD operations for book review posts
 */

/**
 * Create a new book review post
 */
const createPost = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const {
      rating,
      content,
      isbn,
      title,
      author,
      publisher,
      coverImageUrl
    } = req.body;

    // Validate required fields
    if (!rating || !isbn || !title) {
      return res.status(400).json({
        success: false,
        message: '별점, 도서 정보는 필수 입력 항목입니다.'
      });
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: '별점은 1점에서 5점 사이여야 합니다.'
      });
    }

    // Validate content
    if (content) {
      const contentValidation = validatePostContent(content);
      if (!contentValidation.valid) {
        return res.status(400).json({
          success: false,
          message: contentValidation.errors[0]
        });
      }
    }

    // Extract hashtags from content (max 10)
    const hashtags = content ? extractHashtags(content).slice(0, 10) : [];

    // Get uploaded image paths from multer
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Validate image count
    if (images.length > 5) {
      return res.status(400).json({
        success: false,
        message: '이미지는 최대 5장까지 업로드할 수 있습니다.'
      });
    }

    // Create post
    const post = await Post.create({
      userId,
      rating: ratingNum,
      content: content || '',
      isbn,
      title,
      author: author || '',
      publisher: publisher || '',
      coverImageUrl: coverImageUrl || '',
      images,
      hashtags
    });

    res.status(201).json({
      success: true,
      message: '게시물이 성공적으로 작성되었습니다.',
      data: post
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: '게시물 작성 중 오류가 발생했습니다.'
    });
  }
};

/**
 * Get post by ID
 */
const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: '게시물 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * Get all posts with pagination
 */
const getPosts = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, userId } = req.query;

    const posts = await Post.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      userId: userId ? parseInt(userId) : null
    });

    res.status(200).json({
      success: true,
      data: {
        posts,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: '게시물 목록 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * Update post
 */
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, content } = req.body;

    // Check if post exists and belongs to user
    const belongsToUser = await Post.belongsToUser(id, userId);
    if (!belongsToUser) {
      return res.status(403).json({
        success: false,
        message: '본인의 게시물만 수정할 수 있습니다.'
      });
    }

    // Validate rating if provided
    if (rating !== undefined) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: '별점은 1점에서 5점 사이여야 합니다.'
        });
      }
    }

    // Validate content if provided
    if (content !== undefined) {
      const contentValidation = validatePostContent(content);
      if (!contentValidation.valid) {
        return res.status(400).json({
          success: false,
          message: contentValidation.errors[0]
        });
      }
    }

    // Extract hashtags if content is updated
    const hashtags = content ? extractHashtags(content).slice(0, 10) : undefined;

    // Get uploaded images if any
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : undefined;

    // Update post
    const updateData = {};
    if (rating !== undefined) updateData.rating = parseInt(rating);
    if (content !== undefined) updateData.content = content;
    if (images !== undefined) updateData.images = images;
    if (hashtags !== undefined) updateData.hashtags = hashtags;

    const updatedPost = await Post.update(id, updateData);

    res.status(200).json({
      success: true,
      message: '게시물이 수정되었습니다.',
      data: updatedPost
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: '게시물 수정 중 오류가 발생했습니다.'
    });
  }
};

/**
 * Delete post
 */
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if post exists and belongs to user
    const belongsToUser = await Post.belongsToUser(id, userId);
    if (!belongsToUser) {
      return res.status(403).json({
        success: false,
        message: '본인의 게시물만 삭제할 수 있습니다.'
      });
    }

    await Post.delete(id);

    res.status(200).json({
      success: true,
      message: '게시물이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: '게시물 삭제 중 오류가 발생했습니다.'
    });
  }
};

/**
 * Get posts by hashtag
 */
const getPostsByHashtag = async (req, res, next) => {
  try {
    const { hashtag } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const posts = await Post.findByHashtag(hashtag, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        posts,
        hashtag,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get posts by hashtag error:', error);
    res.status(500).json({
      success: false,
      message: '해시태그 검색 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  getPostsByHashtag
};
