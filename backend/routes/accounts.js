const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAccounts, addAccount, deleteAccount, oauthConnect, oauthCallback } = require('../controllers/accountsController');

router.get('/', auth, getAccounts);
router.post('/', auth, addAccount);
router.delete('/:id', auth, deleteAccount);
router.get('/oauth/connect', auth, oauthConnect);
router.get('/oauth/callback', oauthCallback);

module.exports = router;