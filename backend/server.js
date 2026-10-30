const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const { createUserTable } = require('./models/User');
const { createPostTable } = require('./models/Post');

// Initialize Express app
const app = express();

// Global Middleware
app.use(cors());
app.use(express.json()); 

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend/views')));
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));

// Route Definitions (Must come AFTER app is initialized)

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes'); // NEW
const profileRoutes = require('./routes/profileRoutes'); // NEW

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes); // NEW
app.use('/api/profile', profileRoutes); // NEW


// Initialize database tables in order to respect foreign key constraints
createUserTable().then(() => createPostTable()); 

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server executing on port ${PORT}`);
});

const { createCommentTable } = require('./models/Comment');
// Initialize database tables sequentially to respect foreign key constraints
createUserTable()
    .then(() => createPostTable())
    .then(() => createCommentTable());