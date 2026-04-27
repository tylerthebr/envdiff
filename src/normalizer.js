/**
 * normalizer.js
 * Normalizes .env file values to consistent formats:
 * booleans, numbers, quoted strings, etc.
 */

/**
 * Normalize a boolean-like string value.
 * @param {string} value
 * @returns {string|null} normalized value or null if not boolean-like
 */
function normalizeBool(value) {
  const lower = value.toLowerCase();
  if (['true', 'yes', '1', 'on'].includes(lower)) return 'true';
  if (['false', 'no', '0', 'off'].includes(lower)) return 'false';
  return null;
}

/**
 * Normalize a numeric string value.
 * Strips leading zeros from integers, preserves floats.
 * @param {string} value
 * @returns {string|null}
 */
function normalizeNumber(value) {
  if (!/^-?\d+(\.\d+)?$/.test(value.trim())) return null;
  const num = Number(value.trim());
  return String(num);
}

/**
 * Strip surrounding quotes from a value if present.
 * @param {string} value
 * @returns {string}
 */
function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Normalize a single entry value based on its content.
 * @param {string} value
 * @returns {string}
 */
function normalizeValue(value) {
  const unquoted = stripQuotes(value.trim());

  const bool = normalizeBool(unquoted);
  if (bool !== null) return bool;

  const num = normalizeNumber(unquoted);
  if (num !== null) return num;

  return unquoted;
}

/**
 * Normalize a single parsed entry { key, value }.
 * @param {{ key: string, value: string }} entry
 * @returns {{ key: string, value: string }}
 */
function normalizeEntry(entry) {
  return {
    key: entry.key.trim().toUpperCase(),
    value: normalizeValue(entry.value),
  };
}

/**
 * Normalize all entries in a parsed env object.
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function normalizeEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const normalized = normalizeEntry({ key, value });
    result[normalized.key] = normalized.value;
  }
  return result;
}

/**
 * Produce a diff of original vs normalized values for reporting.
 * @param {Record<string, string>} env
 * @returns {Array<{ key: string, original: string, normalized: string, changed: boolean }>}
 */
function normalizationDiff(env) {
  return Object.entries(env).map(([key, value]) => {
    const normalized = normalizeEntry({ key, value });
    return {
      key: normalized.key,
      original: value,
      normalized: normalized.value,
      changed: normalized.key !== key || normalized.value !== value,
    };
  });
}

module.exports = {
  normalizeBool,
  normalizeNumber,
  stripQuotes,
  normalizeValue,
  normalizeEntry,
  normalizeEnv,
  normalizationDiff,
};
