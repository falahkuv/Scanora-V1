require("dotenv").config();

const app = require("./app");
const { prisma, testDbConnection } = require("./config/prisma");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();
    await testDbConnection();

    app.listen(PORT, () => {
      console.log(`Scanora API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
