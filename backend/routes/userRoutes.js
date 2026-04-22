// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/user/dashboard — Get dashboard data (safe, no personal info)
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('initials quizResult chatCount createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    return res.status(200).json({
      success: true,
      dashboard: {
        initials: user.initials,
        quizResult: user.quizResult,
        chatCount: user.chatCount,
        memberSince: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
