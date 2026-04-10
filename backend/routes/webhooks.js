const express = require('express');
const router = express.Router();
const {
  verifyWebhook,
  handleWebhook
} = require('../controllers/webhookController');

// Meta webhook verification (GET)
router.get('/', verifyWebhook);
router.get('/meta', verifyWebhook);
router.get('/instagram', verifyWebhook);

// Meta webhook events (POST)
router.post('/', handleWebhook);
router.post('/meta', handleWebhook);
router.post('/instagram', handleWebhook);

module.exports = router;