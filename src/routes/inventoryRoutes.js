const express = require("express");
const { body, param } = require("express-validator");
const inventoryController = require("../controllers/inventoryController");
const authenticateToken = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();
const fruitTypes = ["apple", "banana", "orange"];
const conditions = ["unripe", "ripe", "rotten"];

router.get("/summary", authenticateToken, inventoryController.getInventorySummary);
router.get("/monthly-stats", authenticateToken, inventoryController.getInventoryMonthlyStats);
router.get("/", authenticateToken, inventoryController.getInventory);
router.post(
	"/",
	authenticateToken,
	[
		body("fruit_type")
			.trim()
			.toLowerCase()
			.isIn(fruitTypes)
			.withMessage("fruit_type must be one of: apple, banana, orange"),
		body("condition")
			.trim()
			.toLowerCase()
			.isIn(conditions)
			.withMessage("condition must be one of: unripe, ripe, rotten"),
		body("scan_id")
			.optional({ nullable: true })
			.isUUID()
			.withMessage("scan_id must be a valid UUID"),
		body("reminder_at")
			.optional({ nullable: true })
			.isISO8601()
			.withMessage("reminder_at must be a valid ISO date")
	],
	validate,
	inventoryController.addInventory
);
router.patch(
	"/:id",
	authenticateToken,
	[
		param("id").isUUID().withMessage("id must be a valid UUID"),
		body("reminder_at")
			.optional({ nullable: true })
			.isISO8601()
			.withMessage("reminder_at must be a valid ISO date")
	],
	validate,
	inventoryController.updateReminder
);
router.delete(
	"/:id",
	authenticateToken,
	[param("id").isUUID().withMessage("id must be a valid UUID")],
	validate,
	inventoryController.deleteInventory
);

module.exports = router;
