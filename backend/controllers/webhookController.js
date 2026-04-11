const Campaign = require('../models/Campaign');
const AutoReplyLog = require('../models/AutoReplyLog');
const SocialAccount = require('../models/SocialAccount');
const axios = require('axios');

// ── VERIFY WEBHOOK (Meta requires this) ───────────────
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
exports.handleWebhook = async (req, res) => {
  try {
    const body = req.body;
    res.status(200).send('EVENT_RECEIVED');

    console.log('Webhook received:', JSON.stringify(body, null, 2));

    if (body.object === 'instagram' || body.object === 'page') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'comments') {
            await handleComment(change.value, body.object);
          }
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

    const shortcode = data.media?.shortcode ||
      (data.permalink ? data.permalink.match(/\/(p|reel|tv)\/([^/?]+)/)?.[2] : null);

    console.log(`New comment on post ${postId} (shortcode: ${shortcode}): "${commentText}"`);

    const campaigns = await Campaign.find({
      isActive: true,
      platform: platform === 'instagram' ? 'instagram' : 'facebook',
      userId: { $exists: true }
    });

    console.log(`Found ${campaigns.length} matching campaigns`);

    for (const campaign of campaigns) {
      const shouldTrigger = checkTrigger(
        campaign.triggerType,
        campaign.keywords,
        commentText
      );

      if (!shouldTrigger) {
        console.log(`Comment did not match trigger for campaign: ${campaign.name}`);
        continue;
      }

      const account = await SocialAccount.findOne({
        userId: campaign.userId,
        platform: campaign.platform,
        isActive: true
      });

      if (!account) {
        console.log('No active social account found for campaign');
        continue;
      }

      let publicReplySent = false;
      let dmSent = false;
      let dmText = '';

      // 1. Post public reply
      try {
        await axios.post(
          `https://graph.facebook.com/v18.0/${commentId}/replies`,
          null,
          {
            params: {
              message: campaign.publicReply,
              access_token: account.accessToken
            }
          }
        );
        publicReplySent = true;
        console.log(`✅ Public reply sent to comment ${commentId}`);
      } catch (err) {
        console.error('Public reply failed:', err.response?.data?.error?.message || err.message);
      }

      // 2. Send DM
      try {
        dmText = buildDMMessage(campaign, commenterName);
        await sendDM(commenterId, dmText, account.accessToken, platform);
        dmSent = true;
        console.log(`✅ DM sent to ${commenterName}`);
      } catch (err) {
        console.error('DM failed:', err.response?.data?.error?.message || err.message);
      }

      // 3. Log auto reply
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

      console.log(`✅ Campaign "${campaign.name}" triggered successfully`);
    }
  } catch (err) {
    console.error('Handle comment error:', err.message);
  }
}

// ── HANDLE DM ─────────────────────────────────────────
async function handleDM(data, platform) {
  console.log('New DM received:', JSON.stringify(data));
}

// ── BUILD DM MESSAGE ──────────────────────────────────
function buildDMMessage(campaign, name) {
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
  await axios.post(
    'https://graph.facebook.com/v18.0/61576483270957/messages',
    null,
    {
      params: {
        recipient: JSON.stringify({ id: userId }),
        message: JSON.stringify({ text: message }),
        access_token: accessToken
      }
    }
  );
}

// ── CHECK TRIGGER ─────────────────────────────────────
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