const { prisma } = require("../config/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { toScanResponse } = require("../services/formatService");
const { sendSuccess } = require("../services/responseService");

const createScan = asyncHandler(async (req, res) => {
  const mockResult = {
    fruitType: "apple",
    condition: "ripe",
    freshnessScore: 0.87,
    imageUrl: req.body.image_url || null
  };

  const scan = await prisma.scanHistory.create({
    data: {
      userId: req.user.userId,
      fruitType: mockResult.fruitType,
      condition: mockResult.condition,
      freshnessScore: mockResult.freshnessScore,
      imageUrl: mockResult.imageUrl
    }
  });

  return sendSuccess(res, "Mock response - AI model not yet connected", {
    ...toScanResponse(scan)
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
