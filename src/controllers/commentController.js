const Comment = require('../models/Comment');
const Post = require('../models/Post');

/**
 * Create a new comment or reply
 * POST /posts/:postId/comments
 */
const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user.id;

    // Validate post exists
    const postExists = await Post.exists(postId);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    // Validate parent comment if provided
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: '상위 댓글을 찾을 수 없습니다.'
        });
      }
      // Check if parent comment belongs to the same post
      if (parentComment.post_id !== parseInt(postId)) {
        return res.status(400).json({
          success: false,
          message: '잘못된 댓글 참조입니다.'
        });
      }
      // MVP: Only allow 1 level of nesting (no replies to replies)
      if (parentComment.parent_comment_id !== null) {
        return res.status(400).json({
          success: false,
          message: '대댓글에는 답글을 달 수 없습니다.'
        });
      }
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '댓글 내용을 입력해주세요.'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: '댓글은 최대 500자까지 작성할 수 있습니다.'
      });
    }

    // Create comment
    const comment = await Comment.create({
      postId: parseInt(postId),
      userId,
      content: content.trim(),
      parentCommentId: parentCommentId ? parseInt(parentCommentId) : null
    });

    res.status(201).json({
      success: true,
      message: '댓글이 작성되었습니다.',
      data: comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    next(error);
  }
};

/**
 * Get all comments for a post
 * GET /posts/:postId/comments
 */
const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Validate post exists
    const postExists = await Post.exists(postId);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    // Get comments with nested replies
    const comments = await Comment.findByPostId(parseInt(postId));

    res.status(200).json({
      success: true,
      data: {
        comments,
        total: comments.length + comments.reduce((sum, c) => sum + (c.replies?.length || 0), 0)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    next(error);
  }
};

/**
 * Update a comment
 * PATCH /comments/:commentId
 */
const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '댓글 내용을 입력해주세요.'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: '댓글은 최대 500자까지 작성할 수 있습니다.'
      });
    }

    // Update comment
    const updatedComment = await Comment.update(
      parseInt(commentId),
      userId,
      content.trim()
    );

    res.status(200).json({
      success: true,
      message: '댓글이 수정되었습니다.',
      data: updatedComment
    });
  } catch (error) {
    if (error.message === '댓글을 찾을 수 없습니다.') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === '자신의 댓글만 수정할 수 있습니다.') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    console.error('Update comment error:', error);
    next(error);
  }
};

/**
 * Delete a comment
 * DELETE /comments/:commentId
 */
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Delete comment
    await Comment.delete(parseInt(commentId), userId);

    res.status(200).json({
      success: true,
      message: '댓글이 삭제되었습니다.'
    });
  } catch (error) {
    if (error.message === '댓글을 찾을 수 없습니다.') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === '자신의 댓글만 삭제할 수 있습니다.') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    console.error('Delete comment error:', error);
    next(error);
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment
};
