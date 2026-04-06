const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({

  // Which user owns this campaign
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Campaign name for easy identification
  name: {
    type: String,
    required: true
  },

  // Platform
  platform: {
    type: String,
    enum: ['instagram', 'facebook'],
    required: true
  },

  // The post/reel to monitor
  postUrl: { type: String },
  postId: { type: String, required: true },

  // Trigger type
  // "keywords" = only trigger on specific words
  // "all" = trigger on every comment
  // "both" = keywords + all comments
  triggerType: {
    type: String,
    enum: ['keywords', 'all', 'both'],
    default: 'keywords'
  },

  // Keywords to watch for
  keywords: [{ type: String }],

  // Public comment reply on the post
  publicReply: {
    type: String,
    required: true,
    default: 'Hey! 👋 Check your DMs, we sent you something special! 📩'
  },

  // Private DM settings
  dmGreeting: {
    type: String,
    default: 'Hey {name}! 👋 Thanks for your interest!'
  },

  // Product details - any URL not just Shopify
  productName: { type: String },
  productLink: { type: String },
  includeDescription: { type: Boolean, default: false },
  productDescription: { type: String },

  // Is this campaign running?
  isActive: { type: Boolean, default: true },

  // Stats
  totalReplies: { type: Number, default: 0 },
  totalDMs: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);