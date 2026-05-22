const webpush = require('web-push');
const cron = require('node-cron');
const { prisma } = require('../config/prisma');

// Konfigurasi VAPID keys untuk Web Push
// Keys harus di-set di file .env — lihat .env.example
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_MAILTO || 'mailto:admin@scanora.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('[WebPush] ⚠️  VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY belum di-set di .env — push notification dinonaktifkan.');
}

/**
 * Menghitung selisih hari antara tanggal sekarang dengan estimasi tanggal kedaluwarsa.
 */
const getDaysUntilExpiry = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Job Scheduler yang berjalan setiap hari pada jam 08:00 pagi
 * untuk memeriksa inventori buah dan mengirimkan notifikasi.
 */
const startNotificationScheduler = () => {
  // Berjalan setiap jam 8 pagi
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Menjalankan pengecekan inventory untuk push notification...');
    
    try {
      // 1. Ambil semua buah di inventory yang masih "available"
      // Diasumsikan schema Inventory memiliki field 'estimatedExpiry' dan relasi ke 'User'
      // Untuk demo ini kita anggap User memiliki relasi ke PushSubscription
      const inventories = await prisma.inventory.findMany({
        where: { status: 'available' },
        include: {
          user: {
            include: { pushSubscriptions: true } // Asumsi ada table PushSubscription
          }
        }
      });

      for (const item of inventories) {
        if (!item.estimatedExpiry || !item.user.pushSubscriptions.length) continue;

        const daysLeft = getDaysUntilExpiry(item.estimatedExpiry);
        const fruitName = item.fruitType.charAt(0).toUpperCase() + item.fruitType.slice(1);
        
        let notificationPayload = null;

        // 2. Logika Copywriting Berdasarkan Sisa Waktu
        if (daysLeft === 3) {
          notificationPayload = {
            title: `🥗 Jangan Lupa ${fruitName} Kamu!`,
            body: `Mengingatkan: ${fruitName} kamu tinggal 2 hari lagi sebelum mulai membusuk. Yuk, segera dikonsumsi :)`,
            icon: '/icons/icon-192x192.png',
            data: { url: '/inventory' }
          };
        } else if (daysLeft === 1) {
          notificationPayload = {
            title: `⚠️ ${fruitName} Hampir Busuk!`,
            body: `Perhatian! ${fruitName} yang kamu simpan sisa 1 hari lagi. Segera konsumsi atau olah menjadi jus hari ini!`,
            icon: '/icons/icon-warning.png',
            data: { url: '/inventory' }
          };
        } else if (daysLeft === 0) {
          notificationPayload = {
            title: `🚨 HARI TERAKHIR untuk ${fruitName}!`,
            body: `${fruitName} kamu diperkirakan sudah mencapai batas maksimal kesegarannya HARI INI. Yuk konsumsi sekarang sebelum terbuang sia-sia :)`,
            icon: '/icons/icon-alert.png',
            data: { url: '/inventory' }
          };
        }

        // 3. Kirim Push Notification jika sesuai kondisi
        if (notificationPayload) {
          for (const sub of item.user.pushSubscriptions) {
            const pushSubscription = {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth }
            };

            try {
              await webpush.sendNotification(
                pushSubscription,
                JSON.stringify(notificationPayload)
              );
              console.log(`[Push] Berhasil mengirim notif ke user ${item.userId} untuk buah ${fruitName}`);
            } catch (error) {
              console.error(`[Push Error] Gagal mengirim ke endpoint ${sub.endpoint}:`, error);
              // Jika endpoint expired (410), hapus dari database
              if (error.statusCode === 410) {
                await prisma.pushSubscription.delete({ where: { id: sub.id } });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('[Scheduler Error] Gagal memproses notifikasi:', error);
    }
  });
};

module.exports = { startNotificationScheduler };
