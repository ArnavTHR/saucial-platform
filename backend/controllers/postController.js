const db = require('../config/db');

// (Keep your existing createPost function here)
const createPost = async (req, res) => {
    const { title, content, category } = req.body;
    const userId = req.user.id; 

    try {
        const newPost = await db.query(
            `INSERT INTO posts (user_id, title, content, category) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, title, content, category]
        );
        res.status(201).json(newPost.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Fetch posts (with optional category filtering)
const getPosts = async (req, res) => {
    const { category } = req.query; // Extracts the query parameter from the URL

    try {
        let queryText = `
            SELECT p.id, p.title, p.content, p.category, p.upvotes, p.downvotes, p.created_at,
                   u.flair, u.real_name, u.anonymous_name, u.use_anonymous 
            FROM posts p
            JOIN users u ON p.user_id = u.id
        `;
        const queryParams = [];

        // If a specific category is requested, append the WHERE clause securely
        if (category && category !== 'All') {
            queryText += ` WHERE p.category = $1`;
            queryParams.push(category);
        }

        queryText += ` ORDER BY p.created_at DESC`;

        const posts = await db.query(queryText, queryParams);
        res.status(200).json(posts.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Append-only Edit Logic
const editPost = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // 1. Verify ownership and get current state
        const postCheck = await client.query('SELECT user_id, content FROM posts WHERE id = $1', [id]);
        if (postCheck.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
        if (postCheck.rows[0].user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        // 2. Append the OLD content to the versioned table
        await client.query(`
            INSERT INTO post_edits (post_id, previous_content) VALUES ($1, $2)
        `, [id, postCheck.rows[0].content]);

        // 3. Update the main post with NEW content
        const updatedPost = await client.query(`
            UPDATE posts SET content = $1 WHERE id = $2 RETURNING *
        `, [content, id]);

        await client.query('COMMIT');
        res.status(200).json(updatedPost.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Server Error during edit' });
    } finally {
        client.release();
    }
};

// Strict Unique Voting Logic
const votePost = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; 
    const userId = req.user.id; 
    const voteValue = action === 'upvote' ? 1 : -1;

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // UPSERT: Insert new vote or update existing vote. Unique constraint prevents duplicates.
        await client.query(`
            INSERT INTO votes (user_id, post_id, vote_type) VALUES ($1, $2, $3)
            ON CONFLICT (user_id, post_id) DO UPDATE SET vote_type = EXCLUDED.vote_type
        `, [userId, id, voteValue]);

        // Recalculate totals dynamically to prevent drift
        const voteTotals = await client.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
                COALESCE(SUM(CASE WHEN vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes
            FROM votes WHERE post_id = $1
        `, [id]);

        const { upvotes, downvotes } = voteTotals.rows[0];

        // Update the cached counts on the post row
        const updateResult = await client.query(`
            UPDATE posts SET upvotes = $1, downvotes = $2 WHERE id = $3 RETURNING *
        `, [upvotes, downvotes, id]);

        await client.query('COMMIT');
        res.status(200).json(updateResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Server Error during voting' });
    } finally {
        client.release();
    }
};

// Update your exports to include votePost
module.exports = { createPost, getPosts, votePost };