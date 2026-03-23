const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({

  // Which user owns this account
  userId: { 
    type: mongoose.Schema.Types.ObjectId, // links to User model
    ref: 'User', 
    required: true 
  },
  
  // Which platform - only these two values allowed
  platform: { 
    type: String, 
    enum: ['instagram', 'facebook'], 
    required: true 
  },
  
  // Display name like "@mybrand" or "My Brand Page"
  accountName: { 
    type: String, 
    required: true 
  },
  
  // Secret token from Meta API - used to post comments
  accessToken: { 
    type: String, 
    required: true 
  },
  
  // Facebook Page ID (needed for Facebook pages)
  pageId: { 
    type: String 
  },
  
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  connectedAt: { 
    type: Date, 
    default: Date.now 
  }

});

module.exports = mongoose.model('SocialAccount', socialAccountSchema);