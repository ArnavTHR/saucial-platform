const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const protect = require('../middleware/authMiddleware');
const moderateContent = require('../middleware/moderationFilter');

// Fetch comments publicly, but require auth and moderation to post
router.get('/:postId', getComments);
router.post('/', protect, moderateContent, addComment);

module.exports = router;