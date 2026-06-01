const webpush = require('web-push');
const { prisma } = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../services/responseService');
const { getFreshnessData } = require('../services/freshnessService');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// POST /api/notifications/subscribe
const subscribe = asyncHandler(async (req, res) => {
  const { subscription } = req.body;
  const userId = req.user.userId;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ success: false, message: 'Invalid subscription' });
  }

  // Save or update subscription
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    }
  });

  sendSuccess(res, 'Subscribed successfully');
});

// POST /api/notifications/unsubscribe
const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  
  if (endpoint) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: req.user.userId }
    });
  }

  sendSuccess(res, 'Unsubscribed successfully');
});

// POST /api/cron/daily-notify
const dailyNotify = asyncHandler(async (req, res) => {
  // Find all active inventory items
  const items = await prisma.inventory.findMany({
    where: { outcome: null },
    include: {
      user: {
        include: { pushSubscriptions: true }
      }
    }
  });

  const now = new Date();
  
  const notifications = [];

  for (const item of items) {
    if (!item.user.pushSubscriptions.length) continue;

    // Use freshnessService to get current status
    const data = getFreshnessData(
      item.fruitType, 
      item.condition, 
      item.scan?.freshnessScore ?? 75, 
      item.addedAt
    );

    let title = '';
    let body = '';

    if (data.isExpired) {
      // Rotten
      if (item.condition !== 'rotten') {
        title = `⚠️ Yah, ${data.fruitName} kamu membusuk!`;
        body = `Buah ${data.fruitName} yang kamu simpan sudah melewati batas waktu kelayakan.`;
      }
    } else {
      // Check if expiring in 1 or 2 days
      const daysLeft = data.daysLeft;
      if (daysLeft === 1) {
        title = `🚨 Peringatan: ${data.fruitName} segera membusuk!`;
        body = `Cepat konsumsi ${data.fruitName} kamu, besok kemungkinan sudah tidak segar lagi!`;
      } else if (daysLeft === 2) {
        title = `🍏 ${data.fruitName} sedang sangat segar!`;
        body = `Waktu terbaik untuk memakan ${data.fruitName} kamu adalah sekarang. Tinggal 2 hari lagi.`;
      } else if (item.condition === 'unripe' && daysLeft === 0) {
        // Just ripened? No, daysLeft for unripe is days until ripe.
        // Actually, freshnessService daysLeft for unripe is days UNTIL ripe.
        // So if daysLeft === 0, it means it is ripening today.
        title = `🍌 ${data.fruitName} kamu sudah matang!`;
        body = `Yey! ${data.fruitName} kamu sekarang sudah matang dan siap dinikmati.`;
      }
    }

    if (title && body) {
      const payload = JSON.stringify({ title, body, url: '/inventory' });
      for (const sub of item.user.pushSubscriptions) {
        notifications.push({
          subscription: {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          payload
        });
      }
    }
  }

  // Send all notifications
  let successCount = 0;
  for (const notif of notifications) {
    try {
      await webpush.sendNotification(notif.subscription, notif.payload);
      successCount++;
    } catch (err) {
      console.error('Push notification failed:', err);
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired/removed, delete it
        await prisma.pushSubscription.deleteMany({
          where: { endpoint: notif.subscription.endpoint }
        });
      }
    }
  }

  res.json({ success: true, message: `Sent ${successCount} notifications` });
});

module.exports = {
  subscribe,
  unsubscribe,
  dailyNotify
};
