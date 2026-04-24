/**
 * filter.js
 * Utilities for filtering comparison results by status or key pattern.
 */

/**
 * Filter comparison results by one or more statuses.
 * @param {Object} results - Output from compareEnvs
 * @param {string[]} statuses - Array of statuses to include: 'missing', 'mismatched', 'ok'
 * @returns {Object} Filtered results object
 */
function filterByStatus(results, statuses) {
  if (!statuses || statuses.length === 0) return results;

  const allowed = new Set(statuses);
  const filtered = {};

  for (const [key, entry] of Object.entries(results)) {
    if (allowed.has(entry.status)) {
      filtered[key] = entry;
    }
  }

  return filtered;
}

/**
 * Filter comparison results by a key pattern (string substring or RegExp).
 * @param {Object} results - Output from compareEnvs
 * @param {string|RegExp} pattern - Pattern to match against keys
 * @returns {Object} Filtered results object
 */
function filterByPattern(results, pattern) {
  if (!pattern) return results;

  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
  const filtered = {};

  for (const [key, entry] of Object.entries(results)) {
    if (regex.test(key)) {
      filtered[key] = entry;
    }
  }

  return filtered;
}

/**
 * Apply both status and pattern filters in sequence.
 * @param {Object} results - Output from compareEnvs
 * @param {Object} options
 * @param {string[]} [options.statuses]
 * @param {string|RegExp} [options.pattern]
 * @returns {Object} Filtered results object
 */
function applyFilters(results, { statuses, pattern } = {}) {
  let out = results;
  if (statuses && statuses.length > 0) out = filterByStatus(out, statuses);
  if (pattern) out = filterByPattern(out, pattern);
  return out;
}

module.exports = { filterByStatus, filterByPattern, applyFilters };
