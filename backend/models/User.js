// models/User.js — User Model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: false,
      default: ""
    },
    // Initials derived from name — stored for quick access
    initials: {
      type: String,
      trim: true,
    },
    // OTP fields — used during login/signup
    otp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Quiz results stored on user for dashboard
    quizResult: {
      distressLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: null },
      personalityType: { type: String, default: null },
      completedAt: { type: Date, default: null },
    },
    // Analytics
    chatCount: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Middleware: Derive initials before save ────────────────────────────────────
userSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const parts = this.name.trim().split(' ');
    if (parts.length >= 2) {
      this.initials = `${parts[0][0].toUpperCase()}.${parts[1][0].toUpperCase()}.`;
    } else {
      this.initials = `${parts[0][0].toUpperCase()}.`;
    }
  }
  next();
});

// ─── Method: Hash OTP before storing ───────────────────────────────────────────
userSchema.methods.setOtp = async function (otpCode) {
  const salt = await bcrypt.genSalt(10);
  this.otp.code = await bcrypt.hash(otpCode, salt);
  this.otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.otp.attempts = 0;
};

// ─── Method: Verify OTP ─────────────────────────────────────────────────────────
userSchema.methods.verifyOtp = async function (inputOtp) {
  if (!this.otp.code || !this.otp.expiresAt) return false;
  if (new Date() > this.otp.expiresAt) return false; // Expired
  if (this.otp.attempts >= 5) return false; // Too many attempts

  this.otp.attempts += 1;
  const isMatch = await bcrypt.compare(inputOtp, this.otp.code);

  if (isMatch) {
    // Clear OTP after successful verification
    this.otp.code = null;
    this.otp.expiresAt = null;
    this.otp.attempts = 0;
  }

  return isMatch;
};

// ─── IMPORTANT: Never return sensitive fields in API responses ──────────────────
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    initials: this.initials,
    quizResult: this.quizResult,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
    // NOTE: name, email, phone are intentionally excluded
  };
};

module.exports = mongoose.model('User', userSchema);
