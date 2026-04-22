// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/chat/history/:roomId — Get chat history for a room
router.get('/history/:roomId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ timestamp: 1 })
      .limit(100)
      .populate('sender', 'initials'); // Only fetch initials, NOT name/email

    const safeMessages = messages.map((msg) => ({
      id: msg._id,
      senderInitials: msg.sender?.initials || '?',
      isSelf: msg.sender?._id.toString() === req.userId,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    return res.status(200).json({ success: true, messages: safeMessages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/chat/increment — Increment user chat count (called when chat starts)
router.post('/increment', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $inc: { chatCount: 1 } });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
