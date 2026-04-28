const { testDbConnection } = require("../config/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../services/responseService");

const getHealth = asyncHandler(async (req, res) => {
  let dbStatus = "ok";

  try {
    await testDbConnection();
  } catch (error) {
    dbStatus = "error";
  }

  return sendSuccess(res, "Health check", {
    status: "ok",
    db: dbStatus
  });
});

module.exports = {
  getHealth
};
