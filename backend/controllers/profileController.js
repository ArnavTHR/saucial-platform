// backend/controllers/profileController.js
const db = require('../config/db');

const getUserPosts = async (req, res) => {
    try {
        const posts = await db.query(`
            SELECT id, title, content, category, upvotes, downvotes, created_at 
            FROM posts WHERE user_id = $1 ORDER BY created_at DESC
        `, [req.user.id]);
        res.status(200).json(posts.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server Error fetching user posts' });
    }
};

const toggleIdentity = async (req, res) => {
    const { use_anonymous } = req.body;
    try {
        await db.query('UPDATE users SET use_anonymous = $1 WHERE id = $2', [use_anonymous, req.user.id]);
        res.status(200).json({ message: 'Identity preference updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error toggling identity' });
    }
};

const deletePost = async (req, res) => {
    try {
        await db.query('DELETE FROM posts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error deleting post' });
    }
};

module.exports = { getUserPosts, toggleIdentity, deletePost };