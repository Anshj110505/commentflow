const mongoose = require('mongoose');

const autoReplyLogSchema = new mongoose.Schema({

  // Which campaign triggered this
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Who commented
  commenterName: { type: String },
  commenterId: { type: String },
  commentText: { type: String },

  // What we sent
  publicReplyText: { type: String },
  dmText: { type: String },

  // Status
  publicReplySent: { type: Boolean, default: false },
  dmSent: { type: Boolean, default: false },

  platform: { type: String },
  postId: { type: String },

  // Keyword that triggered it
  triggeredBy: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AutoReplyLog', autoReplyLogSchema);