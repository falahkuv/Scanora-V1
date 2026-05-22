/**
 * aiSuggestionCache.js
 *
 * Manages persistent AI suggestion caching in localStorage.
 * Cache is keyed by scan_id, with tier tracking for auto-refresh.
 *
 * Tier thresholds (based on freshness_score_latest):
 *   - "high"   : score > 75  → buah masih segar
 *   - "medium" : score > 40  → mulai perlu diperhatikan
 *   - "low"    : score <= 40 → segera habiskan / buang
 */

const CACHE_KEY = 'scanora_ai_suggestions';

/**
 * Determine score tier from a freshness score (0-100), condition, and days left.
 * Thresholds matched with fastapi/api_main.py:
 * - ripe initial score: 65 - 100
 * - rotten initial score: < 50
 * 
 * @param {number} score
 * @param {string} condition
 * @param {number|null} daysLeft
 * @returns {string}
 */
export const getScoreTier = (score, condition, daysLeft) => {
  if (condition === 'unripe') {
    if (daysLeft === null) return 'unripe-stagnant'; // Buah non-klimakterik (seperti Jeruk) yang tidak akan matang
    if (daysLeft <= 0) return 'unripe-ready';        // Sudah melewati masa tunggu, buah siap matang
    return 'unripe-waiting';                         // Masih dalam proses pematangan
  }

  if (score >= 65) return 'high';   // Masih dalam rentang "Matang" (65-100)
  if (score >= 50) return 'medium'; // Mulai memburuk, di bawah batas minimum Matang
  return 'low';                     // Masuk rentang "Busuk" (<50)
};

/** Read entire cache from localStorage. */
const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

/** Persist entire cache to localStorage. */
const writeCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

/**
 * Get cached suggestion for a scan.
 *
 * @param {string} scanId
 * @param {number} currentScore - current freshness_score_latest (0-100)
 * @param {string} condition - fruit condition
 * @param {number|null} daysLeft - days left until expiry/ripening
 * @returns {{ suggestion: string|null, tierChanged: boolean }}
 */
export const getCachedSuggestion = (scanId, currentScore, condition, daysLeft) => {
  if (!scanId) return { suggestion: null, tierChanged: false };
  const cache = readCache();
  const entry = cache[scanId];
  if (!entry) return { suggestion: null, tierChanged: false };

  const currentTier = getScoreTier(currentScore ?? 100, condition, daysLeft);
  const tierChanged = entry.tier !== currentTier;

  return { suggestion: entry.suggestion, tierChanged };
};

/**
 * Save a suggestion to cache.
 *
 * @param {string} scanId
 * @param {string} suggestion
 * @param {number} score - freshness score used when generating suggestion
 * @param {string} condition
 * @param {number|null} daysLeft
 */
export const saveSuggestionToCache = (scanId, suggestion, score, condition, daysLeft) => {
  if (!scanId || !suggestion) return;
  const cache = readCache();
  cache[scanId] = {
    suggestion,
    tier: getScoreTier(score ?? 100, condition, daysLeft),
    score,
    fetchedAt: new Date().toISOString(),
  };
  writeCache(cache);
};

/**
 * Clear cache entry for a specific scan (e.g., after item is consumed/discarded).
 * @param {string} scanId
 */
export const clearCachedSuggestion = (scanId) => {
  if (!scanId) return;
  const cache = readCache();
  delete cache[scanId];
  writeCache(cache);
};
