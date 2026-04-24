/**
 * summary.js
 * Generates a summary report of comparison results.
 * Provides counts and percentages for each status category.
 */

/**
 * Counts entries by status from a comparison result map.
 * @param {Object} comparisonResult - Map of key -> { status, ... } from compareEnvs
 * @returns {{ total: number, ok: number, missing: number, mismatched: number }}
 */
function countByStatus(comparisonResult) {
  const counts = { total: 0, ok: 0, missing: 0, mismatched: 0 };

  for (const entry of Object.values(comparisonResult)) {
    counts.total++;
    if (entry.status === 'ok') counts.ok++;
    else if (entry.status === 'missing') counts.missing++;
    else if (entry.status === 'mismatched') counts.mismatched++;
  }

  return counts;
}

/**
 * Calculates percentage, returning 0 if total is 0.
 * @param {number} part
 * @param {number} total
 * @returns {number}
 */
function pct(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Builds a human-readable summary string from comparison results.
 * @param {Object} comparisonResult - Output from compareEnvs
 * @returns {string}
 */
function buildSummary(comparisonResult) {
  const { total, ok, missing, mismatched } = countByStatus(comparisonResult);

  const lines = [
    `Summary: ${total} key(s) checked`,
    `  OK:         ${ok} (${pct(ok, total)}%)`,
    `  Missing:    ${missing} (${pct(missing, total)}%)`,
    `  Mismatched: ${mismatched} (${pct(mismatched, total)}%)`,
  ];

  return lines.join('\n');
}

/**
 * Returns true if there are any issues (missing or mismatched keys).
 * Useful for setting a non-zero exit code in CI pipelines.
 * @param {Object} comparisonResult
 * @returns {boolean}
 */
function hasIssues(comparisonResult) {
  const { missing, mismatched } = countByStatus(comparisonResult);
  return missing > 0 || mismatched > 0;
}

module.exports = { countByStatus, buildSummary, hasIssues };
