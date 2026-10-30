const db = require('../config/db');

const createUserTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            real_name VARCHAR(100) NOT NULL,
            anonymous_name VARCHAR(100) UNIQUE NOT NULL,
            flair VARCHAR(20) CHECK (flair IN ('student', 'staff', 'faculty')) NOT NULL,
            use_anonymous BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await db.query(queryText);
        console.log('Users table initialized.');
    } catch (err) {
        console.error('Error creating users table:', err);
    }
};

module.exports = { createUserTable };