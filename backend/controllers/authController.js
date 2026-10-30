const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
    const { email, password, real_name, anonymous_name, flair, use_anonymous } = req.body;

    try {
        // Check if user already exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1 OR anonymous_name = $2', [email, anonymous_name]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User with this email or anonymous name already exists.' });
        }

        // Hash the password to prevent plaintext storage
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new user into PostgreSQL
        const newUser = await db.query(
            `INSERT INTO users (email, password_hash, real_name, anonymous_name, flair, use_anonymous) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, flair, anonymous_name`,
            [email, password_hash, real_name, anonymous_name, flair, use_anonymous !== undefined ? use_anonymous : true]
        );

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.rows[0].id, flair: newUser.rows[0].flair },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Retrieve user by email
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password against the hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, flair: user.flair },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                flair: user.flair,
                active_name: user.use_anonymous ? user.anonymous_name : user.real_name
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { register, login };