// controllers/authController.js — Authentication Logic
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/email');
const { generateOtp } = require('../utils/helpers');

// ─── Generate JWT ─────────────────────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      initials: user.initials,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
// Step 1: Collect user details and send OTP
const signup = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login.',
      });
    }

    const otp = generateOtp(); // 6-digit OTP

    let user;
    if (existingUser) {
      // User exists but not verified — update and resend OTP
      existingUser.name = name;
      existingUser.phone = phone || null;
      await existingUser.setOtp(otp);
      user = await existingUser.save();
    } else {
      // Create new user
      user = new User({ name, email, phone: phone || null });
      await user.setOtp(otp);
      await user.save();
    }

    // Send OTP via email
    await sendOtpEmail(email, name, otp);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${email}. Valid for 10 minutes.`,
      userId: user._id, // Needed for verify-otp step
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
// Step 2: Verify OTP and complete registration
const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isValid = await user.verifyOtp(otp);
    if (!isValid) {
      await user.save(); // Save attempt count
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please try again.',
      });
    }

    user.isVerified = true;
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Step 1 of login: Send OTP to existing user's email
const login = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please sign up.',
      });
    }

    const otp = generateOtp();
    await user.setOtp(otp);
    await user.save();

    await sendOtpEmail(email, user.name, otp);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${email}.`,
      userId: user._id,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Get current user (safe object — no personal data)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-otp -__v');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    return res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { signup, verifyOtp, login, getMe };
