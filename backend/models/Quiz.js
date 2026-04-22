// models/Quiz.js — Quiz Response Model
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One quiz result per user
    },
    responses: [
      {
        questionId: { type: String, required: true },
        question: { type: String, required: true },
        answer: { type: Number, required: true, min: 1, max: 5 }, // 1-5 scale
      },
    ],
    scores: {
      anxiety: { type: Number, default: 0 },
      childhood: { type: Number, default: 0 },
      relationships: { type: Number, default: 0 },
      emotional: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    result: {
      distressLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true,
      },
      personalityType: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
