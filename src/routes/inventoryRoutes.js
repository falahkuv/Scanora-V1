const express = require("express");
const inventoryController = require("../controllers/inventoryController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, inventoryController.getInventory);
router.post("/", authenticateToken, inventoryController.addInventory);
router.patch("/:id", authenticateToken, inventoryController.updateReminder);
router.delete("/:id", authenticateToken, inventoryController.deleteInventory);

module.exports = router;
