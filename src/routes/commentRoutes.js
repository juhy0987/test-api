const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

// Routes for comments on a specific post
// POST /api/posts/:postId/comments - Create a comment or reply
router.post('/posts/:postId/comments', authenticateToken, createComment);

// GET /api/posts/:postId/comments - Get all comments for a post
router.get('/posts/:postId/comments', getComments);

// Routes for managing specific comments
// PATCH /api/comments/:commentId - Update a comment
router.patch('/comments/:commentId', authenticateToken, updateComment);

// DELETE /api/comments/:commentId - Delete a comment
router.delete('/comments/:commentId', authenticateToken, deleteComment);

module.exports = router;
