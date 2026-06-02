require("dotenv").config();

const app = require("./app");
const { prisma, testDbConnection } = require("./config/prisma");
const cron = require("node-cron");
const { runDailyNotificationJob } = require("./controllers/notificationController");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();
    await testDbConnection();

    // Schedule notification job at 8:00 AM every day
    cron.schedule("0 8 * * *", async () => {
      console.log("[Cron] Running daily notification job...");
      try {
        const count = await runDailyNotificationJob();
        console.log(`[Cron] Successfully sent ${count} notifications.`);
      } catch (err) {
        console.error("[Cron] Error running daily notification job:", err);
      }
    });

    app.listen(PORT, () => {
      console.log(`Scanora API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
