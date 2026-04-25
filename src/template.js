/**
 * Template generator — creates a .env.example from compared env entries
 */

/**
 * Generate a template entry line (key only, no value)
 * @param {string} key
 * @returns {string}
 */
function toTemplateEntry(key) {
  return `${key}=`;
}

/**
 * Build a .env.example template from a list of keys
 * @param {string[]} keys
 * @param {Object} [options]
 * @param {boolean} [options.sorted]
 * @returns {string}
 */
function buildTemplate(keys, options = {}) {
  const { sorted = true } = options;
  const list = sorted ? [...keys].sort() : [...keys];
  return list.map(toTemplateEntry).join('\n') + '\n';
}

/**
 * Extract all unique keys from an array of comparison entries
 * @param {Array<{key: string}>} entries
 * @returns {string[]}
 */
function extractKeys(entries) {
  const seen = new Set();
  for (const entry of entries) {
    if (entry.key) seen.add(entry.key);
  }
  return Array.from(seen);
}

/**
 * Generate a template string from comparison entries
 * @param {Array<{key: string}>} entries
 * @param {Object} [options]
 * @returns {string}
 */
function generateTemplate(entries, options = {}) {
  const keys = extractKeys(entries);
  return buildTemplate(keys, options);
}

module.exports = { toTemplateEntry, buildTemplate, extractKeys, generateTemplate };
