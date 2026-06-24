const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/history/:otherUserId', protect, getChatHistory);

module.exports = router;
