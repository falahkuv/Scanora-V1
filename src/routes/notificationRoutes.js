const express = require('express');
const { subscribe, unsubscribe, dailyNotify } = require('../controllers/notificationController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/subscribe', authenticateToken, subscribe);
router.post('/unsubscribe', authenticateToken, unsubscribe);

// In production, you would protect this with an API KEY or allow only specific IPs
router.post('/cron/daily-notify', dailyNotify);

module.exports = router;
