const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAccounts, addAccount, deleteAccount } = require('../controllers/accountsController');

router.get('/', auth, getAccounts);
router.post('/', auth, addAccount);
router.delete('/:id', auth, deleteAccount);

module.exports = router;