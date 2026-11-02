// backend/models/AdvancedSchemas.js
const db = require('../config/db');

const createAdvancedTables = async () => {
    try {
        // Enforces unique votes per user/post combination at the database level
        await db.query(`
            CREATE TABLE IF NOT EXISTS votes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                vote_type SMALLINT CHECK (vote_type IN (1, -1)),
                UNIQUE(user_id, post_id) 
            );
        `);

        // Stores previous versions of posts without overwriting them
        await db.query(`
            CREATE TABLE IF NOT EXISTS post_edits (
                id SERIAL PRIMARY KEY,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                previous_content TEXT NOT NULL,
                edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Advanced tables (Votes & Edits) initialized.');
    } catch (err) {
        console.error('Error creating advanced tables:', err);
    }
};

module.exports = { createAdvancedTables };