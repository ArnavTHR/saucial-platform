const express = require('express');
const router = express.Router();
const { createPost, getPosts } = require('../controllers/postController'); // Add getPosts here
const protect = require('../middleware/authMiddleware');
const moderateContent = require('../middleware/moderationFilter');

router.post('/', protect, moderateContent, createPost);
router.get('/', getPosts); // NEW: Public route to view posts

module.exports = router;