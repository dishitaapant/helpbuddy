// models/Message.js — Chat Message Model
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Content is stored as-is; initials are derived at read-time
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Index for quick room history queries
messageSchema.index({ roomId: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);
