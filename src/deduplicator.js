/**
 * deduplicator.js
 * Finds and removes duplicate key-value pairs across an env object.
 */

/**
 * Find keys that appear more than once in a raw env string.
 * @param {string} raw - raw .env file content
 * @returns {string[]} list of duplicate keys
 */
function findDuplicates(raw) {
  const seen = {};
  const dupes = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    if (seen[key]) {
      if (!dupes.includes(key)) dupes.push(key);
    } else {
      seen[key] = true;
    }
  }
  return dupes;
}

/**
 * Remove duplicate keys from a parsed env object, keeping the last occurrence.
 * @param {string} raw - raw .env file content
 * @returns {{ env: Object, removed: string[] }}
 */
function deduplicateEnv(raw) {
  const env = {};
  const order = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!order.includes(key)) order.push(key);
    env[key] = value;
  }
  const removed = findDuplicates(raw);
  return { env, removed };
}

/**
 * Serialize a deduped env object back to a string.
 * @param {Object} env
 * @returns {string}
 */
function envToString(env) {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

module.exports = { findDuplicates, deduplicateEnv, envToString };
