const express = require("express");
const scanController = require("../controllers/scanController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticateToken, scanController.createScan);
router.get("/history", authenticateToken, scanController.getHistory);
router.get("/history/:id", authenticateToken, scanController.getHistoryById);
router.delete("/history/:id", authenticateToken, scanController.deleteHistory);

module.exports = router;
