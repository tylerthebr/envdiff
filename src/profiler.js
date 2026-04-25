// profiler.js — analyzes .env files for value type patterns and statistics

/**
 * Classify a raw string value into a semantic type.
 * @param {string} value
 * @returns {string}
 */
function classifyType(value) {
  if (value === '') return 'empty';
  if (/^(true|false)$/i.test(value)) return 'boolean';
  if (/^-?\d+$/.test(value)) return 'integer';
  if (/^-?\d+\.\d+$/.test(value)) return 'float';
  if (/^https?:\/\//i.test(value)) return 'url';
  if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(value)) return 'email';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
  if (/,/.test(value)) return 'list';
  if (value.length >= 32 && /^[A-Za-z0-9+/=_-]+$/.test(value)) return 'secret';
  return 'string';
}

/**
 * Profile a single parsed env entry.
 * @param {{ key: string, value: string }} entry
 * @returns {{ key: string, value: string, type: string, length: number }}
 */
function profileEntry(entry) {
  return {
    key: entry.key,
    value: entry.value,
    type: classifyType(entry.value),
    length: entry.value.length,
  };
}

/**
 * Profile all entries in a parsed env map.
 * @param {Record<string, string>} env
 * @returns {Array<{ key: string, value: string, type: string, length: number }>}
 */
function profileEnv(env) {
  return Object.entries(env).map(([key, value]) => profileEntry({ key, value }));
}

/**
 * Aggregate type counts from a profile.
 * @param {Array<{ type: string }>} profile
 * @returns {Record<string, number>}
 */
function typeSummary(profile) {
  return profile.reduce((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + 1;
    return acc;
  }, {});
}

module.exports = { classifyType, profileEntry, profileEnv, typeSummary };
