const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChatHistory, searchMyChats, getMyChatList } = require('../controllers/chatController');

router.get('/my-chats', protect, getMyChatList);
router.get('/search', protect, searchMyChats);
router.get('/:communityId', protect, getChatHistory);

module.exports = router;