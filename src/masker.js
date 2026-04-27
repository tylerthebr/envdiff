/**
 * masker.js — Masks env values with partial or full redaction patterns
 */

const DEFAULT_MASK = '****';
const PARTIAL_VISIBLE = 4;

/**
 * Returns true if the value is long enough to partially reveal.
 * @param {string} value
 * @returns {boolean}
 */
function canPartialMask(value) {
  return typeof value === 'string' && value.length > PARTIAL_VISIBLE + 2;
}

/**
 * Fully masks a value.
 * @param {string} value
 * @returns {string}
 */
function fullMask(value) {
  if (!value || value.length === 0) return DEFAULT_MASK;
  return DEFAULT_MASK;
}

/**
 * Partially masks a value, revealing the last N characters.
 * @param {string} value
 * @returns {string}
 */
function partialMask(value) {
  if (!canPartialMask(value)) return fullMask(value);
  const visible = value.slice(-PARTIAL_VISIBLE);
  return `****${visible}`;
}

/**
 * Masks a single env entry based on mode.
 * @param {{ key: string, value: string }} entry
 * @param {'full'|'partial'} mode
 * @returns {{ key: string, value: string, masked: boolean }}
 */
function maskEntry(entry, mode = 'full') {
  if (!entry || !entry.key) return entry;
  const maskedValue = mode === 'partial'
    ? partialMask(entry.value || '')
    : fullMask(entry.value || '');
  return { ...entry, value: maskedValue, masked: true };
}

/**
 * Masks all entries in an env object.
 * @param {Array<{ key: string, value: string }>} entries
 * @param {'full'|'partial'} mode
 * @returns {Array<{ key: string, value: string, masked: boolean }>}
 */
function maskEnv(entries, mode = 'full') {
  if (!Array.isArray(entries)) return [];
  return entries.map(entry => maskEntry(entry, mode));
}

/**
 * Masks only entries whose keys match the given pattern.
 * @param {Array<{ key: string, value: string }>} entries
 * @param {RegExp|string} pattern
 * @param {'full'|'partial'} mode
 * @returns {Array<{ key: string, value: string, masked: boolean }>}
 */
function maskByPattern(entries, pattern, mode = 'full') {
  if (!Array.isArray(entries)) return [];
  const re = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
  return entries.map(entry =>
    re.test(entry.key) ? maskEntry(entry, mode) : { ...entry, masked: false }
  );
}

module.exports = { fullMask, partialMask, maskEntry, maskEnv, maskByPattern, canPartialMask };
