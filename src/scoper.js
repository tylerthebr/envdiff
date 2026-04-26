/**
 * scoper.js — group env entries by prefix/namespace (e.g. DB_, AWS_, APP_)
 */

/**
 * Extract the namespace prefix from a key.
 * e.g. DB_HOST -> DB, AWS_SECRET_KEY -> AWS, PORT -> (none)
 * @param {string} key
 * @returns {string}
 */
function getPrefix(key) {
  const match = key.match(/^([A-Z][A-Z0-9]+)_/);
  return match ? match[1] : '';
}

/**
 * Group entries by their namespace prefix.
 * Entries with no prefix go under the '' (empty string) key.
 * @param {Array<{key: string, value: string}>} entries
 * @returns {Record<string, Array<{key: string, value: string}>>}
 */
function groupByScope(entries) {
  const groups = {};
  for (const entry of entries) {
    const prefix = getPrefix(entry.key);
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(entry);
  }
  return groups;
}

/**
 * List all unique scopes present in entries.
 * @param {Array<{key: string, value: string}>} entries
 * @returns {string[]}
 */
function listScopes(entries) {
  const seen = new Set();
  for (const entry of entries) {
    seen.add(getPrefix(entry.key));
  }
  return Array.from(seen).sort();
}

/**
 * Filter entries to only those belonging to a given scope prefix.
 * @param {Array<{key: string, value: string}>} entries
 * @param {string} scope
 * @returns {Array<{key: string, value: string}>}
 */
function filterByScope(entries, scope) {
  return entries.filter(e => getPrefix(e.key) === scope);
}

module.exports = { getPrefix, groupByScope, listScopes, filterByScope };
