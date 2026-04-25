// differ.js — generates a unified diff-style output between two env snapshots

const { compareEnvs } = require('./comparator');

/**
 * Build a line-by-line diff array between two env maps.
 * Each entry: { key, status, baseValue, targetValue }
 */
function buildDiff(baseEnv, targetEnv) {
  const results = compareEnvs(baseEnv, targetEnv);
  return results.map((entry) => ({
    key: entry.key,
    status: entry.status,
    baseValue: baseEnv[entry.key] ?? null,
    targetValue: targetEnv[entry.key] ?? null,
  }));
}

/**
 * Returns only entries that changed (missing or mismatched).
 */
function getDiffChanges(baseEnv, targetEnv) {
  return buildDiff(baseEnv, targetEnv).filter(
    (e) => e.status === 'missing' || e.status === 'mismatched'
  );
}

/**
 * Returns a summary count of diff results.
 */
function diffStats(baseEnv, targetEnv) {
  const diff = buildDiff(baseEnv, targetEnv);
  return diff.reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    },
    { ok: 0, missing: 0, mismatched: 0 }
  );
}

module.exports = { buildDiff, getDiffChanges, diffStats };
