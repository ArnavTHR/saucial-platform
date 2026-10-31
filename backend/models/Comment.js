const db = require('../config/db');

const createCommentTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await db.query(queryText);
        console.log('Comments table initialized.');
    } catch (err) {
        console.error('Error creating comments table:', err);
    }
};

module.exports = { createCommentTable };