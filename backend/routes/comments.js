const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getComments, scheduleComment, postNow, deleteComment } = require('../controllers/commentsController');

router.get('/', auth, getComments);
router.post('/schedule', auth, scheduleComment);
router.post('/post-now', auth, postNow);
router.delete('/:id', auth, deleteComment);

module.exports = router;