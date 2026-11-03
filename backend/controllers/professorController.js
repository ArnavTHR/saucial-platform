const db = require('../config/db');

// Get all unique departments for the first dropdown toggle
const getDepartments = async (req, res) => {
    try {
        const result = await db.query('SELECT DISTINCT department FROM professors ORDER BY department');
        res.status(200).json(result.rows.map(row => row.department));
    } catch (err) {
        res.status(500).json({ message: 'Server Error fetching departments' });
    }
};

// Get professors by department with dynamically calculated averages
const getProfessorsByDept = async (req, res) => {
    const { department } = req.params;
    try {
        const result = await db.query(`
            SELECT p.id, p.name, p.department, p.image_url,
                   COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
                   COUNT(r.id) AS review_count
            FROM professors p
            LEFT JOIN professor_reviews r ON p.id = r.professor_id
            WHERE p.department = $1
            GROUP BY p.id
        `, [department]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server Error fetching professors' });
    }
};

// Get strictly anonymous reviews for a specific professor
const getProfessorReviews = async (req, res) => {
    const { id } = req.params;
    try {
        // Notice: NO JOIN to the users table to ensure absolute anonymity
        const result = await db.query(`
            SELECT rating, comment, created_at 
            FROM professor_reviews 
            WHERE professor_id = $1 
            ORDER BY created_at DESC
        `, [id]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server Error fetching reviews' });
    }
};

// Submit an anonymous review
const addReview = async (req, res) => {
    const { id } = req.params; // Professor ID
    const { rating, comment } = req.body;
    const userId = req.user.id; 

    try {
        await db.query(`
            INSERT INTO professor_reviews (professor_id, user_id, rating, comment) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (professor_id, user_id) 
            DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = CURRENT_TIMESTAMP
        `, [id, userId, rating, comment]);
        
        res.status(201).json({ message: 'Anonymous review submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error submitting review' });
    }
};

module.exports = { getDepartments, getProfessorsByDept, getProfessorReviews, addReview };