const express = require('express');
const router = express.Router();
const { listNotifications, markAsRead } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', listNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
