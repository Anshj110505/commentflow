const Campaign = require('../models/Campaign');
const AutoReplyLog = require('../models/AutoReplyLog');

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

    // Validate required fields
    if (!name || !platform || !postId || !publicReply) {
      return res.status(400).json({
        message: 'Name, platform, postId and publicReply are required'
      });
    }

    const campaign = await Campaign.create({
      userId: req.user.id,
      name, platform, postUrl, postId,
      triggerType: triggerType || 'keywords',
      keywords: keywords || [],
      publicReply,
      dmGreeting: dmGreeting || 'Hey {name}! 👋 Thanks for your interest!',
      productName, productLink,
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