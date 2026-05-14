const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { prisma } = require("../config/prisma");
const { supabase } = require("../config/supabase");
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

  // Compress image using sharp
  let compressedBuffer;
  try {
    compressedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error("Image compression error:", error);
    compressedBuffer = req.file.buffer; // Fallback to original buffer
  }

  const form = new FormData();
  form.append("file", compressedBuffer, {
    filename: req.file.originalname.replace(/\.[^/.]+$/, "") + ".jpg",
    contentType: "image/jpeg"
  });

  let prediction;

  const startedAt = Date.now();

  try {
    const predictUrl = `${FASTAPI_URL.replace(/\/$/, '')}/predict`;
    const response = await axios.post(predictUrl, form, {
      headers: {
        ...form.getHeaders(),
        "Content-Length": form.getLengthSync()
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
  
  if (fruitType === "unknown" || fruitType === "tidak dikenali") {
    return res.status(400).json({
      success: false,
      message: "Objek tidak dikenali, silakan foto ulang buah Anda.",
      data: null
    });
  }

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

  const ext = "jpg";
  const fileName = `${scan.id}.${ext}`;
  
  let imageUrl = null;

  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY && supabase) {
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('scanora-images')
      .upload(`uploads/${fileName}`, compressedBuffer, {
        contentType: "image/jpeg",
        upsert: true
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      // Fallback to local
      const uploadsDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(uploadsDir, fileName), compressedBuffer);
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      imageUrl = `${protocol}://${req.get("host")}/uploads/${fileName}`;
    } else {
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('scanora-images')
        .getPublicUrl(`uploads/${fileName}`);
      imageUrl = publicUrlData.publicUrl;
    }
  } else {
    // Local storage fallback
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, fileName), compressedBuffer);
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    imageUrl = `${protocol}://${req.get("host")}/uploads/${fileName}`;
  }

  await prisma.scanHistory.update({
    where: { id: scan.id },
    data: { imageUrl }
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
