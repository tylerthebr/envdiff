/**
 * Counts entries grouped by their status.
 * @param {Array<{key: string, status: string}>} entries
 * @returns {{ ok: number, missing: number, mismatch: number }}
 */
export function countByStatus(entries) {
  const counts = { ok: 0, missing: 0, mismatch: 0 };
  for (const entry of entries) {
    if (entry.status in counts) {
      counts[entry.status]++;
    }
  }
  return counts;
}

/**
 * Formats a percentage string with one decimal place.
 * @param {number} part
 * @param {number} total
 * @returns {string}
 */
export function pct(part, total) {
  if (total === 0) return '0.0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

/**
 * Builds a full summary object from a list of comparison entries.
 * @param {Array<{key: string, status: string}>} entries
 * @returns {object}
 */
export function buildSummary(entries) {
  const total = entries.length;
  const { ok, missing, mismatch } = countByStatus(entries);
  return {
    total,
    ok,
    missing,
    mismatch,
    okPct: pct(ok, total),
    missingPct: pct(missing, total),
    mismatchPct: pct(mismatch, total),
  };
}

/**
 * Returns true if the summary contains any issues (missing or mismatched keys).
 * @param {{ missing: number, mismatch: number }} summary
 * @returns {boolean}
 */
export function hasIssues(summary) {
  return summary.missing > 0 || summary.mismatch > 0;
}
