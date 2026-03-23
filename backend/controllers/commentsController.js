const Comment = require('../models/Comment');
const SocialAccount = require('../models/SocialAccount');
const axios = require('axios');

// ── GET ALL COMMENTS ──────────────────────────────────────
exports.getComments = async (req, res) => {
  try {
    // Get all comments for logged in user, newest first
    const comments = await Comment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── SCHEDULE A COMMENT ────────────────────────────────────
exports.scheduleComment = async (req, res) => {
  try {
    const { 
      platform, 
      postId, 
      postUrl, 
      commentText, 
      scheduledAt, 
      isAiGenerated 
    } = req.body;

    // Save comment as 'pending' - the cron job will post it later
    const comment = await Comment.create({
      userId: req.user.id, 
      platform, 
      postId, 
      postUrl,
      commentText, 
      scheduledAt: new Date(scheduledAt),
      isAiGenerated: isAiGenerated || false, 
      status: 'pending'
    });

    res.status(201).json({ 
      message: '✅ Comment scheduled successfully', 
      comment 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST A COMMENT RIGHT NOW ──────────────────────────────
exports.postNow = async (req, res) => {
  try {
    const { platform, postId, commentText, accountId, isAiGenerated } = req.body;

    // Get the connected account and its access token
    const account = await SocialAccount.findOne({ 
      _id: accountId, 
      userId: req.user.id 
    });
    if (!account) {
      return res.status(404).json({ message: '❌ Account not found' });
    }

    // Call Meta Graph API to post the comment
    // Both Instagram and Facebook use the same endpoint format
    const apiUrl = `https://graph.facebook.com/v18.0/${postId}/comments`;
    const payload = { 
      message: commentText, 
      access_token: account.accessToken 
    };

    const response = await axios.post(apiUrl, payload);

    // Save to database as 'sent'
    const comment = await Comment.create({
      userId: req.user.id, 
      platform, 
      postId,
      commentText, 
      status: 'sent', 
      sentAt: new Date(),
      isAiGenerated: isAiGenerated || false
    });

    res.json({ 
      success: true, 
      metaCommentId: response.data.id, 
      comment 
    });

  } catch (err) {
    // If Meta API returns an error, save as failed
    res.status(500).json({ 
      message: err.response?.data?.error?.message || err.message 
    });
  }
};

// ── DELETE A COMMENT FROM QUEUE ───────────────────────────
exports.deleteComment = async (req, res) => {
  try {
    await Comment.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    res.json({ message: '✅ Comment removed from queue' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};