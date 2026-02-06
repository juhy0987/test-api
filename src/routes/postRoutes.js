const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all post routes
router.use(rateLimiter);

// Get all posts (optional auth for isLiked field)
router.get('/', optionalAuth, postController.getPosts);

// Get single post (optional auth for isLiked field)
router.get('/:postId', optionalAuth, postController.getPostById);

// Create post (requires authentication)
router.post('/', authenticate, postController.createPost);

// Update post (requires authentication)
router.put('/:postId', authenticate, postController.updatePost);

// Delete post (requires authentication)
router.delete('/:postId', authenticate, postController.deletePost);

// Toggle like (requires authentication)
router.post('/:postId/toggle-like', authenticate, postController.toggleLike);

module.exports = router;
