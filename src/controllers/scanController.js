const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { prisma } = require("../config/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { toScanResponse } = require("../services/formatService");
const { sendSuccess } = require("../services/responseService");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

const isFastApiUnavailable = (error) => {
  const codes = new Set(["ECONNREFUSED", "ECONNABORTED", "ETIMEDOUT"]);
  return codes.has(error.code) || !error.response;
};

const createScan = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image file is required",
      data: null
    });
  }

  const form = new FormData();
  form.append("file", req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype
  });

  let prediction;

  const startedAt = Date.now();

  try {
    const response = await axios.post(`${FASTAPI_URL}/predict`, form, {
      headers: {
        ...form.getHeaders()
      },
      timeout: 10000
    });

    prediction = response.data;
    console.info(
      `FastAPI predict success (${Date.now() - startedAt}ms): ${req.file.originalname}`
    );
  } catch (error) {
    if (isFastApiUnavailable(error)) {
      console.error(
        `FastAPI unavailable: ${error.code || "NO_RESPONSE"} ${FASTAPI_URL}`
      );
      return res.status(503).json({
        success: false,
        message:
          "AI model service is currently unavailable. Please try again later.",
        data: null
      });
    }

    console.error(
      `FastAPI error: ${error.response?.status || "UNKNOWN"} ${FASTAPI_URL}`
    );
    return res.status(502).json({
      success: false,
      message:
        error.response?.data?.detail ||
        "Failed to get prediction from AI service",
      data: null
    });
  }

  const fruitType = prediction?.prediction?.product?.toLowerCase() || "unknown";
  const condition = prediction?.prediction?.condition || "unknown";
  const freshnessScore = prediction?.freshness_score ?? prediction?.freshness_index ?? 0;

  const scan = await prisma.scanHistory.create({
    data: {
      userId: req.user.userId,
      fruitType,
      condition,
      freshnessScore,
      imageUrl: null
    }
  });

  const uploadsDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const ext = req.file.originalname.split(".").pop() || "jpg";
  const fileName = `${scan.id}.${ext}`;
  fs.writeFileSync(path.join(uploadsDir, fileName), req.file.buffer);

  await prisma.scanHistory.update({
    where: { id: scan.id },
    data: { imageUrl: `/uploads/${fileName}` }
  });

  return sendSuccess(res, "Scan successful", {
    scan_id: scan.id,
    fruit_type: scan.fruitType,
    condition: scan.condition,
    freshness_score: scan.freshnessScore,
    confidence: {
      product_confidence: prediction?.confidence?.product_confidence ?? 0,
      condition_confidence: prediction?.confidence?.condition_confidence ?? 0
    },
    scanned_at: scan.scannedAt
  });
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await prisma.scanHistory.findMany({
    where: { userId: req.user.userId },
    orderBy: { scannedAt: "desc" }
  });

  return sendSuccess(
    res,
    "Scan history retrieved",
    history.map(toScanResponse)
  );
});

const getHistoryById = asyncHandler(async (req, res) => {
  const scan = await prisma.scanHistory.findFirst({
    where: { id: req.params.id, userId: req.user.userId }
  });

  if (!scan) {
    return res.status(404).json({
      success: false,
      message: "Scan record not found",
      data: null
    });
  }

  return sendSuccess(res, "Scan record retrieved", toScanResponse(scan));
});

const deleteHistory = asyncHandler(async (req, res) => {
  const scan = await prisma.scanHistory.findFirst({
    where: { id: req.params.id, userId: req.user.userId }
  });

  if (!scan) {
    return res.status(404).json({
      success: false,
      message: "Scan record not found",
      data: null
    });
  }

  await prisma.scanHistory.delete({
    where: { id: scan.id }
  });

  return sendSuccess(res, "Scan record deleted", null);
});

module.exports = {
  createScan,
  getHistory,
  getHistoryById,
  deleteHistory
};
