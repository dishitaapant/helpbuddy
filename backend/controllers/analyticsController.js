// controllers/analyticsController.js — Platform Analytics
const User = require('../models/User');
const Message = require('../models/Message');
const Quiz = require('../models/Quiz');

// GET /api/analytics/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, verifiedUsers, totalMessages, totalQuizzes, distressBreakdown] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        Message.countDocuments(),
        Quiz.countDocuments(),
        Quiz.aggregate([
          {
            $group: {
              _id: '$result.distressLevel',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    const distress = { Low: 0, Medium: 0, High: 0 };
    distressBreakdown.forEach((d) => {
      if (d._id) distress[d._id] = d.count;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        totalMessages,
        totalQuizzes,
        distressBreakdown: distress,
      },
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getStats };
