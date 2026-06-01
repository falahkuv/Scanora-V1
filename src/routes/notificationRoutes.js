const express = require('express');
const { subscribe, unsubscribe, dailyNotify } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);

// In production, you would protect this with an API KEY or allow only specific IPs
router.post('/cron/daily-notify', dailyNotify);

module.exports = router;
