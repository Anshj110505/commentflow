const express = require('express');
const router = express.Router();
const {
  verifyWebhook,
  handleWebhook
} = require('../controllers/webhookController');

// Meta webhook verification (GET)
router.get('/meta', verifyWebhook);

// Meta webhook events (POST)
router.post('/meta', handleWebhook);

module.exports = router;