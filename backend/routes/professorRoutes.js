const express = require('express');
const router = express.Router();
const { getDepartments, getProfessorsByDept, getProfessorReviews, addReview } = require('../controllers/professorController');
const protect = require('../middleware/authMiddleware');
const moderateContent = require('../middleware/moderationFilter');

router.get('/departments', getDepartments);
router.get('/department/:department', getProfessorsByDept);
router.get('/:id/reviews', getProfessorReviews);
router.post('/:id/reviews', protect, moderateContent, addReview);

module.exports = router;