/**
 * Sorts comparison results by key name or status.
 * Useful for producing consistent, readable reports.
 */

const SORT_ORDERS = ['key', 'status'];

/**
 * Sort entries by key name alphabetically.
 * @param {Array} entries
 * @returns {Array}
 */
function sortByKey(entries) {
  return [...entries].sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Sort entries by status: missing first, then mismatched, then ok.
 * @param {Array} entries
 * @returns {Array}
 */
function sortByStatus(entries) {
  const priority = { missing: 0, mismatched: 1, ok: 2 };
  return [...entries].sort((a, b) => {
    const pa = priority[a.status] ?? 99;
    const pb = priority[b.status] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.key.localeCompare(b.key);
  });
}

/**
 * Apply a sort strategy to entries.
 * @param {Array} entries
 * @param {string} order - 'key' | 'status'
 * @returns {Array}
 */
function sortEntries(entries, order = 'key') {
  if (!Array.isArray(entries)) {
    throw new TypeError('entries must be an array');
  }
  if (!SORT_ORDERS.includes(order)) {
    throw new Error(`Unknown sort order: "${order}". Must be one of: ${SORT_ORDERS.join(', ')}`);
  }
  if (order === 'status') return sortByStatus(entries);
  return sortByKey(entries);
}

module.exports = { sortEntries, sortByKey, sortByStatus, SORT_ORDERS };
