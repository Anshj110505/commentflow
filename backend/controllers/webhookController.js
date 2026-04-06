const Campaign = require('../models/Campaign');
const AutoReplyLog = require('../models/AutoReplyLog');
const SocialAccount = require('../models/SocialAccount');
const axios = require('axios');

// ── VERIFY WEBHOOK (Meta requires this) ───────────────
// When you set up webhook in Meta dashboard,
// Meta sends a verification request first
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified!');
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ message: 'Verification failed' });
  }
};

// ── HANDLE INCOMING WEBHOOK ───────────────────────────
// This runs every time someone comments on your post
exports.handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    // Always respond 200 immediately
    // Meta will retry if you don't respond fast
    res.status(200).send('EVENT_RECEIVED');

    // Process the webhook data
    if (body.object === 'instagram' || body.object === 'page') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {

          // Someone commented on a post
          if (change.field === 'comments') {
            await handleComment(change.value, body.object);
          }

          // Someone sent a DM
          if (change.field === 'messages') {
            await handleDM(change.value, body.object);
          }
        }
      }
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
};

// ── HANDLE COMMENT ────────────────────────────────────
async function handleComment(data, platform) {
  try {
    const postId = data.media?.id || data.post_id;
    const commentId = data.id;
    const commentText = data.text || '';
    const commenterName = data.from?.name || 'there';
    const commenterId = data.from?.id;

    console.log(`New comment on post ${postId}: "${commentText}"`);

    // Find matching active campaign for this post
    const campaigns = await Campaign.find({
      postId: postId,
      isActive: true,
      platform: platform === 'instagram' ? 'instagram' : 'facebook'
    });

    for (const campaign of campaigns) {
      // Check if this comment should trigger the campaign
      const shouldTrigger = checkTrigger(
        campaign.triggerType,
        campaign.keywords,
        commentText
      );

      if (!shouldTrigger) continue;

      // Get the social account for this campaign
      const account = await SocialAccount.findOne({
        userId: campaign.userId,
        platform: campaign.platform,
        isActive: true
      });

      if (!account) continue;

      let publicReplySent = false;
      let dmSent = false;
      let dmText = '';

      // 1. Post public reply on the comment
      try {
        await axios.post(
          `https://graph.facebook.com/v18.0/${commentId}/replies`,
          {
            message: campaign.publicReply,
            access_token: account.accessToken
          }
        );
        publicReplySent = true;
        console.log(`✅ Public reply sent to comment ${commentId}`);
      } catch (err) {
        console.error('Public reply failed:', err.response?.data?.error?.message);
      }

      // 2. Send private DM with product link
      try {
        dmText = buildDMMessage(campaign, commenterName);
        await sendDM(commenterId, dmText, account.accessToken, platform);
        dmSent = true;
        console.log(`✅ DM sent to ${commenterName}`);
      } catch (err) {
        console.error('DM failed:', err.response?.data?.error?.message);
      }

      // 3. Log this auto reply
      await AutoReplyLog.create({
        campaignId: campaign._id,
        userId: campaign.userId,
        commenterName,
        commenterId,
        commentText,
        publicReplyText: campaign.publicReply,
        dmText,
        publicReplySent,
        dmSent,
        platform: campaign.platform,
        postId,
        triggeredBy: getTriggeredKeyword(campaign.keywords, commentText)
      });

      // 4. Update campaign stats
      campaign.totalReplies += 1;
      if (dmSent) campaign.totalDMs += 1;
      await campaign.save();
    }
  } catch (err) {
    console.error('Handle comment error:', err.message);
  }
}

// ── HANDLE DM ─────────────────────────────────────────
async function handleDM(data, platform) {
  console.log('New DM received:', data);
  // DM handling can be expanded later
}

// ── BUILD DM MESSAGE ──────────────────────────────────
function buildDMMessage(campaign, name) {
  // Replace {name} placeholder with actual name
  let message = campaign.dmGreeting.replace('{name}', name);
  message += '\n\n';

  if (campaign.productName) {
    message += `📦 *${campaign.productName}*\n`;
  }

  if (campaign.productLink) {
    message += `🔗 ${campaign.productLink}\n`;
  }

  if (campaign.includeDescription && campaign.productDescription) {
    message += `\n${campaign.productDescription}\n`;
  }

  message += '\nFeel free to ask if you have any questions! 😊';
  return message;
}

// ── SEND DM ───────────────────────────────────────────
async function sendDM(userId, message, accessToken, platform) {
  if (platform === 'instagram') {
    // Instagram DM
    await axios.post(
      'https://graph.facebook.com/v18.0/me/messages',
      {
        recipient: { id: userId },
        message: { text: message },
        access_token: accessToken
      }
    );
  } else {
    // Facebook DM
    await axios.post(
      'https://graph.facebook.com/v18.0/me/messages',
      {
        recipient: { id: userId },
        message: { text: message },
        access_token: accessToken
      }
    );
  }
}

// ── CHECK IF COMMENT SHOULD TRIGGER ──────────────────
function checkTrigger(triggerType, keywords, commentText) {
  const text = commentText.toLowerCase();

  if (triggerType === 'all') return true;

  if (triggerType === 'keywords' || triggerType === 'both') {
    const hasKeyword = keywords.some(kw => text.includes(kw.toLowerCase()));
    if (hasKeyword) return true;
  }

  if (triggerType === 'both') return true;

  return false;
}

// ── GET TRIGGERED KEYWORD ─────────────────────────────
function getTriggeredKeyword(keywords, commentText) {
  const text = commentText.toLowerCase();
  return keywords.find(kw => text.includes(kw.toLowerCase())) || 'all';
}