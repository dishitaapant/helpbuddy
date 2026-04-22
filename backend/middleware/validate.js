// middleware/validate.js — Input Validation Middleware
const { body, validationResult } = require('express-validator');

// ─── Validate & respond with errors ──────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg, // Return first error
      errors: errors.array(),
    });
  }
  next();
};

// ─── Signup Validation Rules ──────────────────────────────────────────────────
const signupRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('phone')
  .optional({ checkFalsy: true })
  .trim()
  .matches(/^[+]?[\d\s\-()]{7,15}$/)
  .withMessage('Please enter a valid phone number'),
];

// ─── Login Validation Rules ───────────────────────────────────────────────────
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
];

// ─── OTP Verification Rules ───────────────────────────────────────────────────
const otpRules = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),

  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
];

module.exports = { validate, signupRules, loginRules, otpRules };
