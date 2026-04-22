// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStats } = require('../controllers/analyticsController');

// Protected — only verified users can see stats
router.get('/stats', protect, getStats);

module.exports = router;
