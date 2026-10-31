const db = require('../config/db');

// @desc    Add a comment to a post
// @route   POST /api/comments
const addComment = async (req, res) => {
    const { post_id, content } = req.body;
    const userId = req.user.id; 

    try {
        const newComment = await db.query(
            `INSERT INTO comments (post_id, user_id, content) 
             VALUES ($1, $2, $3) RETURNING *`,
            [post_id, userId, content]
        );
        res.status(201).json(newComment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error adding comment' });
    }
};

// @desc    Get comments for a specific post
// @route   GET /api/comments/:postId
const getComments = async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await db.query(`
            SELECT c.id, c.content, c.created_at, 
                   u.flair, u.real_name, u.anonymous_name, u.use_anonymous
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `, [postId]);
        
        res.status(200).json(comments.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error fetching comments' });
    }
};

module.exports = { addComment, getComments };