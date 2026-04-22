// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { submitQuiz, getQuestions, getResult } = require('../controllers/quizController');

router.get('/questions', protect, getQuestions);
router.post('/submit', protect, submitQuiz);
router.get('/result', protect, getResult);

module.exports = router;
