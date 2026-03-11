const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChatHistory, searchMyChats } = require('../controllers/chatController');

router.get('/search', protect, searchMyChats);
router.get('/:communityId', protect, getChatHistory);

module.exports = router;