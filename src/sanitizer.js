/**
 * sanitizer.js — strips, trims, and normalizes env entries
 */

/**
 * Trim whitespace from key and value
 * @param {{ key: string, value: string }} entry
 * @returns {{ key: string, value: string }}
 */
function trimEntry(entry) {
  return { key: entry.key.trim(), value: entry.value.trim() };
}

/**
 * Remove surrounding quotes from a value (single or double)
 * @param {string} value
 * @returns {string}
 */
function unquoteValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Normalize a key to uppercase
 * @param {string} key
 * @returns {string}
 */
function normalizeKey(key) {
  return key.toUpperCase();
}

/**
 * Sanitize a single entry: trim, unquote, normalize key
 * @param {{ key: string, value: string }} entry
 * @returns {{ key: string, value: string }}
 */
function sanitizeEntry(entry) {
  const trimmed = trimEntry(entry);
  return {
    key: normalizeKey(trimmed.key),
    value: unquoteValue(trimmed.value),
  };
}

/**
 * Sanitize all entries in an env object
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function sanitizeEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const sanitized = sanitizeEntry({ key, value });
    result[sanitized.key] = sanitized.value;
  }
  return result;
}

module.exports = { trimEntry, unquoteValue, normalizeKey, sanitizeEntry, sanitizeEnv };
