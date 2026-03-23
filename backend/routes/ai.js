const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateComments } = require('../controllers/aiController');

router.post('/generate', auth, generateComments);

module.exports = router;