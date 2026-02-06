const Post = require('../models/Post');
const Like = require('../models/Like');

/**
 * POST /api/posts
 * Create a new post
 */
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '제목과 내용을 입력해주세요.'
      });
    }

    const post = await Post.create({ userId, title, content });

    return res.status(201).json({
      success: true,
      message: '게시물이 생성되었습니다.',
      data: {
        ...post,
        like_count: 0,
        is_liked: false
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({
      success: false,
      message: '게시물 생성 중 오류가 발생했습니다.'
    });
  }
};

/**
 * GET /api/posts
 * Get all posts with pagination
 */
const getPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const userId = req.user?.id || null;

    const posts = await Post.findAllWithLikes(limit, offset, userId);

    return res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        limit,
        offset,
        count: posts.length
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({
      success: false,
      message: '게시물 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * GET /api/posts/:postId
 * Get a single post by ID
 */
const getPostById = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user?.id || null;

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 게시물 ID입니다.'
      });
    }

    const post = await Post.findByIdWithLikes(postId, userId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    return res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    return res.status(500).json({
      success: false,
      message: '게시물 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * PUT /api/posts/:postId
 * Update a post
 */
const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user.id;
    const { title, content } = req.body;

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 게시물 ID입니다.'
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '게시물을 수정할 권한이 없습니다.'
      });
    }

    const updatedPost = await Post.update(postId, { title, content });

    return res.status(200).json({
      success: true,
      message: '게시물이 수정되었습니다.',
      data: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({
      success: false,
      message: '게시물 수정 중 오류가 발생했습니다.'
    });
  }
};

/**
 * DELETE /api/posts/:postId
 * Delete a post
 */
const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user.id;

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 게시물 ID입니다.'
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '게시물을 삭제할 권한이 없습니다.'
      });
    }

    await Post.delete(postId);

    return res.status(200).json({
      success: true,
      message: '게시물이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({
      success: false,
      message: '게시물 삭제 중 오류가 발생했습니다.'
    });
  }
};

/**
 * POST /api/posts/:postId/toggle-like
 * Toggle like status for a post
 */
const toggleLike = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user.id;

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 게시물 ID입니다.'
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    // Toggle like
    const result = await Like.toggle(userId, postId);

    return res.status(200).json({
      success: true,
      message: result.action === 'liked' ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.',
      data: {
        action: result.action,
        likeCount: result.likeCount,
        isLiked: result.isLiked
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({
      success: false,
      message: '좋아요 처리 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike
};
