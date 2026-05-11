/**
 * freshnessService.js
 *
 * Handles all business logic for fruit freshness estimation.
 * Replaces Python estimation_service.py — business logic centralized in Node.js.
 * Data source: /document/penyimpananbuah.md
 *
 * ===== HOW TO UPDATE SHELF LIFE RULES =====
 * Only edit the SHELF_LIFE_RULES object below.
 * Do NOT touch any functions below it.
 * Each fruit/condition entry has:
 *   - min: minimum days (for very fresh / high-score items)
 *   - max: maximum days (for borderline / low-score items)
 *   - label: display label used in frontend UI
 * ===========================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// RULE TABLE — Edit this to update thresholds. All other logic is automatic.
// ─────────────────────────────────────────────────────────────────────────────
const SHELF_LIFE_RULES = {
  banana: {
    // Source: https://discover.texasrealfood.com/does-it-go-bad/do-bananas-go-bad
    // Source: https://www.doesitgobad.com/banana-go-bad/
    unripe: { min: 2, max: 5, label: "Perkiraan Matang" },
    ripe:   { min: 1, max: 2, label: "Baik Sebelum" },
    rotten: { min: 0, max: 0, label: "Kedaluwarsa" },
  },
  apple: {
    // Source: https://www.vinmec.com/eng/blog/how-long-does-an-apple-last-en
    // Source: https://feelgoodpal.com/id/blog/how-long-do-apples-last/
    unripe: { min: 1, max: 3, label: "Perkiraan Matang" },
    ripe:   { min: 3, max: 5, label: "Baik Sebelum" },
    rotten: { min: 0, max: 0, label: "Kedaluwarsa" },
  },
  orange: {
    // Source: https://discover.texasrealfood.com/does-it-go-bad/do-oranges-spoil
    unripe: { min: 5, max: 7, label: "Perkiraan Matang" },
    ripe:   { min: 7, max: 14, label: "Baik Sebelum" },
    rotten: { min: 0, max: 0, label: "Kedaluwarsa" },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS — Do not edit unless changing core logic.
// ─────────────────────────────────────────────────────────────────────────────

/** Normalize fruit type from model output to internal key. */
const normalizeFruitType = (fruitType) => {
  const t = (fruitType || "").toLowerCase().trim();
  if (t.includes("pisang") || t.includes("banana")) return "banana";
  if (t.includes("apel") || t.includes("apple")) return "apple";
  if (t.includes("jeruk") || t.includes("orange")) return "orange";
  return null;
};

/** Normalize condition string to internal key. */
const normalizeCondition = (condition, fruitType) => {
  const c = (condition || "").toLowerCase().trim();
  let cond = "ripe";
  if (["unripe", "mentah"].includes(c)) cond = "unripe";
  if (["ripe", "matang"].includes(c)) cond = "ripe";
  if (["rotten", "busuk"].includes(c)) cond = "rotten";
  
  if (cond === "unripe" && normalizeFruitType(fruitType) === "orange") {
      return "rotten"; // Jeruk Unripe dihitung Rotten
  }
  return cond;
};

/**
 * Normalize freshness score to [0.0, 1.0].
 * - Unripe condition is always treated as 100% fresh (bypass).
 * - Model may return 0–100 scale; we normalize to 0–1.
 */
const normalizeFreshnessScore = (score, condition, fruitType) => {
  const cond = normalizeCondition(condition, fruitType);
  if (cond === "unripe") return 1.0; // bypass — unripe is always 100% fresh
  const raw = score > 1 ? score / 100 : score;
  return Math.max(0, Math.min(1, raw));
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate estimated reminder_at date.
 *
 * @param {string} fruitType
 * @param {string} condition
 * @param {number} freshnessScore - raw score from AI (0–1 or 0–100)
 * @param {Date}   baseDate       - start date (defaults to now)
 * @returns {{ reminderAt: Date|null, maxDays: number, label: string }}
 */
const calculateReminderAt = (fruitType, condition, freshnessScore, baseDate = new Date()) => {
  const fruit = normalizeFruitType(fruitType);
  const cond  = normalizeCondition(condition, fruitType);

  if (!fruit) return { reminderAt: null, maxDays: 0, label: "-" };

  const shelf = SHELF_LIFE_RULES[fruit]?.[cond];
  if (!shelf || shelf.max === 0) return { reminderAt: null, maxDays: 0, label: shelf?.label ?? "Kedaluwarsa" };

  const score = normalizeFreshnessScore(freshnessScore, condition, fruitType);

  // Interpolate: higher freshness → closer to max days
  const days = shelf.min + Math.round((shelf.max - shelf.min) * score);

  const reminderAt = new Date(baseDate);
  reminderAt.setDate(reminderAt.getDate() + Math.max(days, 0));

  return { reminderAt, maxDays: days, label: shelf.label };
};

/**
 * Calculate current estimated freshness score based on time elapsed.
 * Depreciates linearly from initial score to 0 over maxDays.
 * Unripe bypass: always returns 1.0 (no decay tracked before it ripens).
 *
 * @param {number} initialScore  - raw score from scan (0–1 or 0–100)
 * @param {string} condition
 * @param {number} maxDays       - total estimated shelf life in days
 * @param {Date}   addedAt       - when item was added to inventory
 * @returns {number} - score 0.0–1.0
 */
const calculateCurrentFreshnessScore = (initialScore, condition, fruitType, maxDays, addedAt) => {
  const cond = normalizeCondition(condition, fruitType);
  if (cond === "unripe") return 1.0; // bypass — no decay for unripe

  if (maxDays <= 0) return 0;

  const score = normalizeFreshnessScore(initialScore, condition, fruitType);
  const daysElapsed = (Date.now() - new Date(addedAt)) / (1000 * 60 * 60 * 24);
  const scorePerDay = score / maxDays;
  const current = score - daysElapsed * scorePerDay;

  return Math.max(0, Math.round(current * 100) / 100);
};

/**
 * Get full freshness data for an inventory item.
 * Single entry point used by inventoryController.
 *
 * @returns {{
 *   reminderAt: Date|null,
 *   maxDays: number,
 *   label: string,
 *   freshnessScoreInitial: number,
 *   freshnessScoreLatest: number,
 * }}
 */
const getFreshnessData = (fruitType, condition, rawFreshnessScore, addedAt) => {
  const scoreNormalized = normalizeFreshnessScore(rawFreshnessScore, condition, fruitType);

  const { reminderAt, maxDays, label } = calculateReminderAt(
    fruitType,
    condition,
    scoreNormalized,
    new Date(addedAt)
  );

  const freshnessScoreLatest = calculateCurrentFreshnessScore(
    scoreNormalized,
    condition,
    fruitType,
    maxDays,
    addedAt
  );

  return {
    reminderAt,
    maxDays,
    label,
    freshnessScoreInitial: scoreNormalized,
    freshnessScoreLatest,
  };
};

module.exports = {
  SHELF_LIFE_RULES,           // exported so tests/scripts can read current rules
  calculateReminderAt,
  calculateCurrentFreshnessScore,
  getFreshnessData,
  normalizeFruitType,
  normalizeCondition,
  normalizeFreshnessScore,
};
