// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, verifyOtp, login, getMe } = require('../controllers/authController');
const { validate, signupRules, loginRules, otpRules } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.post('/signup', signupRules, validate, signup);
router.post('/verify-otp', otpRules, validate, verifyOtp);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);

module.exports = router;
