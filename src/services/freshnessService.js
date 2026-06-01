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
    unripe: { min: 2, max: 7, label: "Perkiraan Matang" },
    ripe:   { min: 2, max: 3, label: "Baik Sebelum" },
    rotten: { min: 0, max: 0, label: "Kedaluwarsa" },
  },
  apple: {
    unripe: { min: 1, max: 3, label: "Perkiraan Matang" },
    ripe:   { min: 5, max: 7, label: "Baik Sebelum" },
    rotten: { min: 0, max: 0, label: "Kedaluwarsa" },
  },
  orange: {
    unripe: { min: 0, max: 0, label: "Tidak Akan Matang" },
    ripe:   { min: 10, max: 14, label: "Baik Sebelum" },
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
  
  return cond;
};

/**
 * Normalize freshness score to [0.0, 1.0].
 * - Model may return 0–100 scale; we normalize to 0–1.
 * - No bypass for unripe — score is used normally.
 */
const normalizeFreshnessScore = (score, condition, fruitType) => {
  const cond = normalizeCondition(condition, fruitType);
  if (cond === "rotten") return 0; // rotten has no freshness
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

  // Interpolate: higher freshness score → closer to max days
  const days = shelf.min + Math.round((shelf.max - shelf.min) * score);

  const reminderAt = new Date(baseDate);
  reminderAt.setDate(reminderAt.getDate() + Math.max(days, 0));

  return { reminderAt, maxDays: days, label: shelf.label };
};

/**
 * Calculate current estimated freshness score based on time elapsed.
 *
 * Strategy:
 * - Unripe: freshness stays at 100% until it transitions to "ripe" —
 *   we show countdown to ripening, score doesn't decay.
 * - Ripe/Rotten: score decays LINEARLY from initialScore → 0 over maxDays.
 *   This ensures score = 0 exactly when estimatedExpiry is reached.
 *   Formula: current = initialScore × (1 - daysElapsed / maxDays)
 *
 * @param {number} initialScore  - raw score from scan (0–1 or 0–100)
 * @param {string} condition
 * @param {string} fruitType
 * @param {number} maxDays       - total estimated shelf life in days
 * @param {Date}   baseDate      - base date for decay (addedAt or ripened date)
 * @returns {number} - score 0.0–1.0
 */
const calculateCurrentFreshnessScore = (initialScore, condition, fruitType, maxDays, baseDate) => {
  const cond = normalizeCondition(condition, fruitType);

  // Unripe: no decay — stays at full freshness, countdown shows ripening time
  if (cond === "unripe") return 1.0;

  // Rotten: already at 0
  if (cond === "rotten" || maxDays <= 0) return 0;

  const score = normalizeFreshnessScore(initialScore, condition, fruitType);
  const daysElapsed = (Date.now() - new Date(baseDate)) / (1000 * 60 * 60 * 24);

  // Linear decay: score reaches 0 exactly at maxDays (expiry)
  // current = initialScore × (1 - daysElapsed / maxDays)
  const decayRatio = daysElapsed / maxDays;
  const current = score * (1 - decayRatio);

  return Math.max(0, Math.min(1.0, Math.round(current * 100) / 100));
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
const toPercent = (value) => Math.round(value * 10000) / 100;

const getFreshnessData = (fruitType, condition, rawFreshnessScore, addedAt, currentReminderAt = null) => {
  const scoreNormalized = normalizeFreshnessScore(rawFreshnessScore, condition, fruitType);

  let baseDate = new Date(addedAt);

  // Determine maxDays to potentially reverse-engineer baseDate
  const tempCalc = calculateReminderAt(fruitType, condition, scoreNormalized, baseDate);
  const maxDays = tempCalc.maxDays;
  const label = tempCalc.label;

  // If it's ripe and we have a reminderAt (which represents the expiry date),
  // the base date when it became ripe is (reminderAt - maxDays)
  if (condition.toLowerCase() === 'ripe' && currentReminderAt && maxDays > 0) {
    baseDate = new Date(new Date(currentReminderAt).getTime() - (maxDays * 24 * 60 * 60 * 1000));
  }

  // Recalculate reminderAt based on the correct baseDate
  const { reminderAt } = calculateReminderAt(fruitType, condition, scoreNormalized, baseDate);

  const freshnessScoreLatest = calculateCurrentFreshnessScore(
    scoreNormalized,
    condition,
    fruitType,
    maxDays,
    baseDate
  );

  let conditionLatest = condition;
  if (condition.toLowerCase() === 'unripe') {
    const daysElapsed = (Date.now() - baseDate) / (1000 * 60 * 60 * 24);
    if (daysElapsed >= maxDays) {
      conditionLatest = 'ripe';
    }
  }

  if (freshnessScoreLatest <= 0 && conditionLatest !== 'unripe') {
    conditionLatest = 'rotten';
  }

  return {
    reminderAt,
    maxDays,
    label,
    freshnessScoreInitial: toPercent(scoreNormalized),
    freshnessScoreLatest: toPercent(freshnessScoreLatest),
    conditionLatest,
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
