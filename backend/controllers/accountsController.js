const SocialAccount = require('../models/SocialAccount');

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await SocialAccount.find({ userId: req.user.id });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addAccount = async (req, res) => {
  try {
    const { platform, accountName, accessToken, pageId } = req.body;

    const existing = await SocialAccount.findOne({ 
      userId: req.user.id, 
      accountName, 
      platform 
    });
    if (existing) {
      return res.status(400).json({ message: 'Account already connected' });
    }

    const account = await SocialAccount.create({
      userId: req.user.id, 
      platform, 
      accountName, 
      accessToken, 
      pageId
    });

    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await SocialAccount.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    res.json({ message: 'Account disconnected successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};