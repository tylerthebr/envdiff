// deprecator.js — detect and report deprecated keys in .env files

/**
 * Check if a key is deprecated based on a deprecation map.
 * @param {string} key
 * @param {Object} deprecationMap - { OLD_KEY: 'NEW_KEY' | null }
 * @returns {{ deprecated: boolean, replacement: string|null }}
 */
function isDeprecated(key, deprecationMap) {
  if (Object.prototype.hasOwnProperty.call(deprecationMap, key)) {
    return { deprecated: true, replacement: deprecationMap[key] || null };
  }
  return { deprecated: false, replacement: null };
}

/**
 * Build a deprecation entry for a single key.
 * @param {string} key
 * @param {string} value
 * @param {Object} deprecationMap
 * @returns {Object}
 */
function buildDeprecationEntry(key, value, deprecationMap) {
  const { deprecated, replacement } = isDeprecated(key, deprecationMap);
  return { key, value, deprecated, replacement };
}

/**
 * Scan an env object for deprecated keys.
 * @param {Object} env - { KEY: value }
 * @param {Object} deprecationMap
 * @returns {Array<Object>}
 */
function scanDeprecations(env, deprecationMap) {
  return Object.entries(env).map(([key, value]) =>
    buildDeprecationEntry(key, value, deprecationMap)
  );
}

/**
 * Return only the deprecated entries.
 * @param {Array<Object>} entries
 * @returns {Array<Object>}
 */
function getDeprecatedEntries(entries) {
  return entries.filter(e => e.deprecated);
}

/**
 * Check whether any deprecated keys are present.
 * @param {Array<Object>} entries
 * @returns {boolean}
 */
function hasDeprecations(entries) {
  return entries.some(e => e.deprecated);
}

module.exports = {
  isDeprecated,
  buildDeprecationEntry,
  scanDeprecations,
  getDeprecatedEntries,
  hasDeprecations,
};
