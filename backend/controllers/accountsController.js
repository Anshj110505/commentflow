const SocialAccount = require('../models/SocialAccount');
const axios = require('axios');

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://commentflow-one.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://commentflow-q67q.onrender.com';

// ── GET ALL ACCOUNTS ──────────────────────────────────
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await SocialAccount.find({ userId: req.user.id });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── MANUAL ADD ACCOUNT (fallback) ─────────────────────
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

// ── DELETE ACCOUNT ────────────────────────────────────
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

// ── OAUTH CONNECT — redirect user to Meta login ───────
exports.oauthConnect = async (req, res) => {
  try {
    const userId = req.user.id;
    const platform = req.query.platform || 'instagram';

    const state = Buffer.from(JSON.stringify({ userId, platform })).toString('base64');

    const redirectUri = `${BACKEND_URL}/api/accounts/oauth/callback`;

    // ✅ FIXED SCOPES — works in Development mode without App Review
    const scopes = [
      'instagram_manage_comments',
      'pages_show_list',
      'pages_messaging',
      'public_profile'
    ].join(',');

    const metaAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}&response_type=code`;

    res.redirect(metaAuthUrl);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── OAUTH CALLBACK — Meta redirects here after login ──
exports.oauthCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${FRONTEND_URL}/accounts?error=oauth_cancelled`);
    }

    const { userId, platform } = JSON.parse(Buffer.from(state, 'base64').toString());

    const redirectUri = `${BACKEND_URL}/api/accounts/oauth/callback`;

    // Step 1 — Exchange code for short-lived token
    const tokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: redirectUri,
        code
      }
    });

    const shortLivedToken = tokenRes.data.access_token;

    // Step 2 — Exchange for long-lived token (60 days)
    const longTokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        fb_exchange_token: shortLivedToken
      }
    });

    const longLivedToken = longTokenRes.data.access_token;

    // Step 3 — Get user info + pages
    const meRes = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        access_token: longLivedToken,
        fields: 'id,name,accounts'
      }
    });

    const fbUser = meRes.data;
    const pages = fbUser.accounts?.data || [];

    if (platform === 'instagram') {
      for (const page of pages) {
        const igRes = await axios.get(`https://graph.facebook.com/v18.0/${page.id}`, {
          params: {
            fields: 'instagram_business_account',
            access_token: page.access_token
          }
        });

        const igAccount = igRes.data.instagram_business_account;
        if (!igAccount) continue;

        const igInfoRes = await axios.get(`https://graph.facebook.com/v18.0/${igAccount.id}`, {
          params: {
            fields: 'id,username',
            access_token: page.access_token
          }
        });

        const igUsername = igInfoRes.data.username;

        await SocialAccount.findOneAndUpdate(
          { userId, platform: 'instagram', pageId: igAccount.id },
          {
            userId,
            platform: 'instagram',
            accountName: igUsername,
            accessToken: page.access_token,
            pageId: igAccount.id,
            isActive: true
          },
          { upsert: true, new: true }
        );
      }
    } else {
      // Facebook pages
      for (const page of pages) {
        await SocialAccount.findOneAndUpdate(
          { userId, platform: 'facebook', pageId: page.id },
          {
            userId,
            platform: 'facebook',
            accountName: page.name,
            accessToken: page.access_token,
            pageId: page.id,
            isActive: true
          },
          { upsert: true, new: true }
        );
      }
    }

    res.redirect(`${FRONTEND_URL}/accounts?success=true`);

  } catch (err) {
    console.error('OAuth callback error:', err.message);
    res.redirect(`${FRONTEND_URL}/accounts?error=oauth_failed`);
  }
};