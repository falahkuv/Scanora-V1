const { prisma } = require("../config/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { toInventoryResponse } = require("../services/formatService");
const { sendSuccess } = require("../services/responseService");

const getInventory = asyncHandler(async (req, res) => {
  const items = await prisma.inventory.findMany({
    where: { userId: req.user.userId },
    orderBy: { addedAt: "desc" },
    include: { scan: true }
  });

  return sendSuccess(
    res,
    "Inventory retrieved",
    items.map(toInventoryResponse)
  );
});

const addInventory = asyncHandler(async (req, res) => {
  const { fruit_type, condition, scan_id, reminder_at } = req.body;

  const item = await prisma.inventory.create({
    data: {
      userId: req.user.userId,
      fruitType: fruit_type,
      condition,
      scanId: scan_id || null,
      reminderAt: reminder_at ? new Date(reminder_at) : null
    }
  });

  return sendSuccess(res, "Inventory item added", toInventoryResponse(item), 201);
});

const updateReminder = asyncHandler(async (req, res) => {
  const { reminder_at } = req.body;

  const existing = await prisma.inventory.findFirst({
    where: { id: req.params.id, userId: req.user.userId }
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Inventory item not found",
      data: null
    });
  }

  const item = await prisma.inventory.update({
    where: { id: existing.id },
    data: {
      reminderAt: reminder_at ? new Date(reminder_at) : null
    }
  });

  return sendSuccess(res, "Inventory reminder updated", toInventoryResponse(item));
});

const deleteInventory = asyncHandler(async (req, res) => {
  const existing = await prisma.inventory.findFirst({
    where: { id: req.params.id, userId: req.user.userId }
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Inventory item not found",
      data: null
    });
  }

  await prisma.inventory.delete({
    where: { id: existing.id }
  });

  return sendSuccess(res, "Inventory item deleted", null);
});

module.exports = {
  getInventory,
  addInventory,
  updateReminder,
  deleteInventory
};
