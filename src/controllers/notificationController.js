const webpush = require('web-push');
const { prisma } = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../services/responseService');
const { getFreshnessData } = require('../services/freshnessService');

if (process.env.VAPID_SUBJECT && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID keys are not fully set in environment variables. Web push notifications will be disabled.');
}

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

// Function to run the actual notification job, separated from Express req/res
const runDailyNotificationJob = async () => {
  // Find all active inventory items (outcome: null = still in inventory)
  const items = await prisma.inventory.findMany({
    where: { outcome: null },
    include: {
      user: {
        include: { pushSubscriptions: true }
      },
      scan: true  // Include scan to get actual freshnessScore
    }
  });

  const notifications = [];

  for (const item of items) {
    if (!item.user.pushSubscriptions.length) continue;

    const freshnessScore = item.scan?.freshnessScore ?? 75;
    const data = getFreshnessData(
      item.fruitType,
      item.condition,
      freshnessScore,
      item.addedAt,
      item.reminderAt
    );

    // Calculate daysLeft from reminderAt returned by getFreshnessData
    const daysLeft = data.reminderAt
      ? Math.ceil((new Date(data.reminderAt) - new Date()) / (1000 * 60 * 60 * 24))
      : null;

    const lang = item.user.language || 'id';

    // Derive fruit display name
    const ft = (item.fruitType || '').toLowerCase();
    let baseFruitName = item.fruitType;
    if (lang === 'en') {
      baseFruitName = ft.includes('banana') || ft.includes('pisang') ? 'Banana'
        : ft.includes('apple') || ft.includes('apel') ? 'Apple'
        : ft.includes('orange') || ft.includes('jeruk') ? 'Orange'
        : item.fruitType;
    } else {
      baseFruitName = ft.includes('banana') || ft.includes('pisang') ? 'Pisang'
        : ft.includes('apple') || ft.includes('apel') ? 'Apel'
        : ft.includes('orange') || ft.includes('jeruk') ? 'Jeruk'
        : item.fruitType;
    }

    const addedDate = new Date(item.addedAt);
    const day = addedDate.getDate();
    let monthStr = '';
    if (lang === 'en') {
      monthStr = addedDate.toLocaleString('en-US', { month: 'short' });
    } else {
      const idMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      monthStr = idMonths[addedDate.getMonth()];
    }
    const fruitName = `${baseFruitName} (${day} ${monthStr})`;

    let title = '';
    let body = '';

    // Trigger 1: Unripe → ripened today (daysLeft <= 0)
    if (item.condition === 'unripe' && daysLeft !== null && daysLeft <= 0) {
      if (lang === 'en') {
        title = `🎉 Your ${fruitName} is ripe!`;
        body = `The ${fruitName} you saved is now ready to eat. Enjoy!`;
      } else {
        title = `🎉 ${fruitName} kamu sudah matang!`;
        body = `${fruitName} yang kamu simpan sekarang sudah siap dinikmati. Yuk konsumsi segera!`;
      }
    }
    // Trigger 2: Ripe → 3 days left (early warning)
    else if (item.condition === 'ripe' && daysLeft === 3) {
      if (lang === 'en') {
        title = `🥗 Don't forget your ${fruitName}!`;
        body = `Your ${fruitName} has only 3 days left before spoiling. Consume it soon!`;
      } else {
        title = `🥗 Jangan Lupa ${fruitName}!`;
        body = `${fruitName} kamu tinggal 3 hari lagi sebelum membusuk. Segera konsumsi!`;
      }
    }
    // Trigger 3: Ripe → 1 day left (urgent)
    else if (item.condition === 'ripe' && daysLeft === 1) {
      if (lang === 'en') {
        title = `🚨 Last day for ${fruitName}!`;
        body = `Your ${fruitName} has only 1 day left! Consume it now before it's too late.`;
      } else {
        title = `🚨 Hari Terakhir ${fruitName}!`;
        body = `${fruitName} kamu hanya tersisa 1 hari lagi! Konsumsi sekarang sebelum terlambat.`;
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

  let successCount = 0;
  for (const notif of notifications) {
    try {
      await webpush.sendNotification(notif.subscription, notif.payload);
      successCount++;
    } catch (err) {
      console.error('Push notification failed:', err);
      if (err.statusCode === 410 || err.statusCode === 404) {
        await prisma.pushSubscription.deleteMany({
          where: { endpoint: notif.subscription.endpoint }
        });
      }
    }
  }

  return successCount;
};

// POST /api/cron/daily-notify
const dailyNotify = asyncHandler(async (req, res) => {
  const successCount = await runDailyNotificationJob();
  res.json({ success: true, message: `Sent ${successCount} notifications` });
});

module.exports = {
  subscribe,
  unsubscribe,
  dailyNotify,
  runDailyNotificationJob
};
