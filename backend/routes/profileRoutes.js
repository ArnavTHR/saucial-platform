const express = require('express');
const router = express.Router();
const { getUserPosts, toggleIdentity, deletePost } = require('../controllers/profileController');
const protect = require('../middleware/authMiddleware');

// All profile routes require authentication
router.get('/posts', protect, getUserPosts);
router.put('/identity', protect, toggleIdentity);
router.delete('/posts/:id', protect, deletePost);

module.exports = router;