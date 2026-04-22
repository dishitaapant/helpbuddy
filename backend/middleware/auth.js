// middleware/auth.js — JWT Authentication Middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user still exists
    const user = await User.findById(decoded.id).select('_id isVerified isActive');
    if (!user || !user.isVerified || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token is no longer valid.',
      });
    }

    req.userId = decoded.id;
    req.userInitials = decoded.initials;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = { protect };
