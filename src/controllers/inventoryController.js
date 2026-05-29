const { prisma } = require("../config/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { toInventoryResponse } = require("../services/formatService");
const { sendSuccess } = require("../services/responseService");
const { getFreshnessData, calculateReminderAt } = require("../services/freshnessService");

const getInventory = asyncHandler(async (req, res) => {
  const items = await prisma.inventory.findMany({
    where: { userId: req.user.userId, outcome: null },
    orderBy: { addedAt: "desc" },
    include: { scan: true }
  });

  // ── Auto-transition: unripe items that have passed their ripe date → ripe ──
  const now = new Date();
  for (const item of items) {
    if (
      item.condition === "unripe" &&
      item.reminderAt &&
      new Date(item.reminderAt) <= now
    ) {
      const rawScore = item.scan?.freshnessScore ?? 75;
      // Calculate new reminder_at (busuk date), using the actual ripe date as baseDate
      const { reminderAt: newReminderAt } = calculateReminderAt(
        item.fruitType,
        "ripe",
        rawScore,
        new Date(item.reminderAt) // the moment it actually ripened
      );
      await prisma.inventory.update({
        where: { id: item.id },
        data: { condition: "ripe", reminderAt: newReminderAt ?? null },
      });
      // Mutate in-memory so enrichment below uses correct condition
      item.condition = "ripe";
      item.reminderAt = newReminderAt ?? null;
    }
    
    // ── Auto-transition: ripe items that have passed their rotten date → rotten ──
    if (
      item.condition === "ripe" &&
      item.reminderAt &&
      new Date(item.reminderAt) <= now
    ) {
      await prisma.inventory.update({
        where: { id: item.id },
        data: { condition: "rotten" },
      });
      item.condition = "rotten";
    }
  }

  const enriched = items.map(item => {
    const base = toInventoryResponse(item);
    const rawScore = item.scan?.freshnessScore ?? 0;
    const { freshnessScoreInitial, freshnessScoreLatest, conditionLatest } = getFreshnessData(
      item.fruitType,
      item.condition,
      rawScore,
      item.addedAt,
      item.reminderAt
    );
    return {
      ...base,
      freshness_score_initial: freshnessScoreInitial,
      freshness_score_latest: freshnessScoreLatest,
      condition_latest: conditionLatest,
    };
  });

  return sendSuccess(res, "Inventory retrieved", enriched);
});

const getInventorySummary = asyncHandler(async (req, res) => {
  // Count outcomes for all items that have been resolved (have an outcome set)
  const [consumed, discarded] = await Promise.all([
    prisma.inventory.count({
      where: { userId: req.user.userId, outcome: "consumed" }
    }),
    prisma.inventory.count({
      where: { userId: req.user.userId, outcome: "discarded" }
    }),
  ]);

  return sendSuccess(res, "Inventory summary", { consumed, discarded });
});

const addInventory = asyncHandler(async (req, res) => {
  const { fruit_type, condition, scan_id } = req.body;

  let freshnessScore = 75;
  let aiSuggestion = null;
  if (scan_id) {
    const scan = await prisma.scanHistory.findUnique({ where: { id: scan_id } });
    if (scan) {
        freshnessScore = scan.freshnessScore;
        aiSuggestion = scan.aiSuggestion;
    }
  }

  const { reminderAt, freshnessScoreInitial, freshnessScoreLatest, conditionLatest } = getFreshnessData(
    fruit_type,
    condition,
    freshnessScore,
    new Date()
  );

  const item = await prisma.inventory.create({
    data: {
      userId: req.user.userId,
      fruitType: fruit_type,
      condition,
      scanId: scan_id || null,
      reminderAt: reminderAt || null,
      aiSuggestion: aiSuggestion || null,
    },
    include: { scan: true }
  });

  const base = toInventoryResponse(item);
  return sendSuccess(res, "Inventory item added", {
    ...base,
    freshness_score_initial: freshnessScoreInitial,
    freshness_score_latest: freshnessScoreLatest,
    condition_latest: conditionLatest,
  }, 201);
});

const updateReminder = asyncHandler(async (req, res) => {
  const { reminder_at } = req.body;

  const existing = await prisma.inventory.findFirst({
    where: { id: req.params.id, userId: req.user.userId }
  });

  if (!existing) {
    return res.status(404).json({ success: false, message: "Inventory item not found", data: null });
  }

  const item = await prisma.inventory.update({
    where: { id: existing.id },
    data: { reminderAt: reminder_at ? new Date(reminder_at) : null }
  });

  return sendSuccess(res, "Inventory reminder updated", toInventoryResponse(item));
});

const deleteInventory = asyncHandler(async (req, res) => {
  const existing = await prisma.inventory.findFirst({
    where: { id: req.params.id, userId: req.user.userId }
  });

  if (!existing) {
    return res.status(404).json({ success: false, message: "Inventory item not found", data: null });
  }

  // Accept optional outcome from body (consumed | discarded)
  const outcome = req.body?.outcome;
  const validOutcomes = ["consumed", "discarded"];

  if (outcome && validOutcomes.includes(outcome)) {
    // Log outcome before deleting — update then delete so we keep stats
    // We keep the row with outcome set for summary queries, soft-delete style:
    // Actually we'll just record it in-place then delete. For summary we count
    // ALL inventory rows (including deleted ones) that have an outcome.
    // Better: store outcome THEN delete → summary uses a separate log approach.
    // Simplest solution: keep row but mark as resolved (don't delete, just set outcome).
    await prisma.inventory.update({
      where: { id: existing.id },
      data: {
        outcome,
        outcomeAt: new Date(),
      }
    });
    // Note: item stays in DB with outcome set, it won't show in active inventory
    // because we filter by outcome IS NULL in getInventory
    return sendSuccess(res, `Inventory item marked as ${outcome}`, null);
  }

  // Hard delete if no outcome
  await prisma.inventory.delete({ where: { id: existing.id } });
  return sendSuccess(res, "Inventory item deleted", null);
});

module.exports = {
  getInventory,
  getInventorySummary,
  addInventory,
  updateReminder,
  deleteInventory
};
