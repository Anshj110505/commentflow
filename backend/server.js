const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const connectDB = require('./config/db');
const Comment = require('./models/Comment');
const SocialAccount = require('./models/SocialAccount');
const axios = require('axios');

// Load .env variables first before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/ai',       require('./routes/ai'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/webhooks', require('./routes/webhooks'));

// ── Test Route ────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({ message: '🚀 CommentFlow API is running!' });
});

// ── Scheduled Comment Cron Job ────────────────────────────
// Runs every minute and checks for comments that need to be posted
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Find all pending comments whose scheduled time has passed
    const dueComments = await Comment.find({
      status: 'pending',
      scheduledAt: { $lte: now }  // scheduledAt <= now
    });

    // Post each one
    for (const comment of dueComments) {

      // Get the social account for this comment
      const account = await SocialAccount.findOne({
        userId: comment.userId,
        platform: comment.platform,
        isActive: true
      });

      if (!account) {
        // No account found - mark as failed
        comment.status = 'failed';
        comment.errorMessage = 'No active account found for this platform';
        await comment.save();
        continue;
      }

      try {
        // Post to Meta API
        const apiUrl = `https://graph.facebook.com/v18.0/${comment.postId}/comments`;
        await axios.post(apiUrl, {
          message: comment.commentText,
          access_token: account.accessToken
        });

        // Mark as sent
        comment.status = 'sent';
        comment.sentAt = new Date();
        await comment.save();

        console.log(`✅ Scheduled comment posted: ${comment._id}`);

      } catch (err) {
        // Mark as failed with error reason
        comment.status = 'failed';
        comment.errorMessage = err.response?.data?.error?.message || err.message;
        await comment.save();

        console.log(`❌ Failed to post comment: ${comment._id} - ${comment.errorMessage}`);
      }
    }
  } catch (err) {
    console.error('Cron job error:', err.message);
  }
});

// ── Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});