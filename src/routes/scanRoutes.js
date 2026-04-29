const express = require("express");
const multer = require("multer");
const scanController = require("../controllers/scanController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (file.mimetype && file.mimetype.startsWith("image/")) {
			return cb(null, true);
		}

		const error = new Error("Only image files are allowed");
		error.statusCode = 400;
		return cb(error);
	}
});

router.post(
	"/",
	authenticateToken,
	upload.single("file"),
	scanController.createScan
);
router.get("/history", authenticateToken, scanController.getHistory);
router.get("/history/:id", authenticateToken, scanController.getHistoryById);
router.delete("/history/:id", authenticateToken, scanController.deleteHistory);

module.exports = router;
