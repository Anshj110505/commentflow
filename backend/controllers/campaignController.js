const Campaign = require('../models/Campaign');
const AutoReplyLog = require('../models/AutoReplyLog');
const SocialAccount = require('../models/SocialAccount');
const axios = require('axios');

// Extract shortcode from Instagram URL
function extractShortcode(input) {
  if (!input) return null;
  if (/^\d+$/.test(input.trim())) return null;
  const match = input.match(/\/(p|reel|tv)\/([^/?]+)/);
  if (match) return match[2];
  return null;
}

// Convert shortcode to numeric Media ID using Instagram API
async function resolvePostId(input, accessToken) {
  if (!input) return null;

  // Already a numeric ID - return as is
  if (/^\d+$/.test(input.trim())) return input.trim();

  const shortcode = extractShortcode(input);
  if (!shortcode) return input.trim();

  try {
    // Page through all media to find matching shortcode
    let url = `https://graph.facebook.com/v18.0/me/media?fields=id,permalink,shortcode&access_token=${accessToken}&limit=50`;

    while (url) {
      const response = await axios.get(url);
      const posts = response.data.data || [];

      // Match by shortcode in permalink or shortcode field
      const match = posts.find(p =>
        p.permalink?.includes(shortcode) ||
        p.shortcode === shortcode
      );

      if (match) {
        console.log(`✅ Resolved shortcode ${shortcode} → ID ${match.id}`);
        return match.id;
      }

      // Go to next page if exists
      url = response.data.paging?.next || null;
    }

    // Not found in media list - return shortcode, webhook will match it
    console.log(`⚠️ Could not resolve ${shortcode} to numeric ID, using shortcode`);
    return shortcode;

  } catch (err) {
    console.error('Error resolving post ID:', err.message);
    return shortcode;
  }
}

// ── GET ALL CAMPAIGNS ─────────────────────────────────
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── CREATE CAMPAIGN ───────────────────────────────────
exports.createCampaign = async (req, res) => {
  try {
    const {
      name, platform, postUrl, postId,
      triggerType, keywords, publicReply,
      dmGreeting, productName, productLink,
      includeDescription, productDescription
    } = req.body;

    if (!name || !platform || (!postId && !postUrl) || !publicReply) {
      return res.status(400).json({
        message: 'Name, platform, post URL and publicReply are required'
      });
    }

    // Get the user's connected account to use its access token
    const account = await SocialAccount.findOne({
      userId: req.user.id,
      platform: platform,
      isActive: true
    });

    if (!account) {
      return res.status(400).json({
        message: `No connected ${platform} account found. Please connect your account first.`
      });
    }

    // Resolve post URL to numeric Media ID automatically
    const inputUrl = postUrl || postId;
    const resolvedPostId = await resolvePostId(inputUrl, account.accessToken);

    console.log(`Campaign created - Input: ${inputUrl} → Resolved ID: ${resolvedPostId}`);

    const campaign = await Campaign.create({
      userId: req.user.id,
      name,
      platform,
      postUrl: inputUrl,
      postId: resolvedPostId,
      triggerType: triggerType || 'keywords',
      keywords: keywords || [],
      publicReply,
      dmGreeting: dmGreeting || 'Hey {name}! 👋 Thanks for your interest!',
      productName,
      productLink,
      includeDescription: includeDescription || false,
      productDescription
    });

    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE CAMPAIGN ───────────────────────────────────
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── TOGGLE CAMPAIGN ON/OFF ────────────────────────────
exports.toggleCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    campaign.isActive = !campaign.isActive;
    await campaign.save();
    res.json({
      message: `Campaign ${campaign.isActive ? 'activated' : 'paused'}`,
      isActive: campaign.isActive
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE CAMPAIGN ───────────────────────────────────
exports.deleteCampaign = async (req, res) => {
  try {
    await Campaign.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET CAMPAIGN LOGS ─────────────────────────────────
exports.getCampaignLogs = async (req, res) => {
  try {
    const logs = await AutoReplyLog.find({ userId: req.user.id })
      .populate('campaignId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};