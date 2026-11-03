const db = require('../config/db');

const createProfessorTables = async () => {
    try {
        // Professors Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS professors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                department VARCHAR(100) NOT NULL,
                image_url VARCHAR(255) DEFAULT '/public/images/default-prof.png'
            );
        `);

        // Anonymous Reviews Table (Enforces 1 review per user per professor)
        await db.query(`
            CREATE TABLE IF NOT EXISTS professor_reviews (
                id SERIAL PRIMARY KEY,
                professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(professor_id, user_id)
            );
        `);

        // Insert initial seed data for testing
        await db.query(`
            INSERT INTO professors (name, department) VALUES 
            ('Dr. Taniya Seth', 'Computer Science'),
            ('Reshma ma''am', 'Computer Science')
            ON CONFLICT (name) DO NOTHING;
        `);

        console.log('Professor and Reviews tables initialized.');
    } catch (err) {
        console.error('Error creating professor tables:', err);
    }
};

module.exports = { createProfessorTables };