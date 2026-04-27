/**
 * Groups env entries by a shared prefix or custom delimiter.
 */

/**
 * Extract the group name from a key using a delimiter.
 * @param {string} key
 * @param {string} delimiter
 * @returns {string}
 */
function getGroup(key, delimiter = '_') {
  const idx = key.indexOf(delimiter);
  return idx > 0 ? key.slice(0, idx) : '__ungrouped__';
}

/**
 * Group an array of parsed env entries by their prefix.
 * @param {Array<{key: string, value: string}>} entries
 * @param {string} delimiter
 * @returns {Record<string, Array<{key: string, value: string}>>}
 */
function groupEntries(entries, delimiter = '_') {
  return entries.reduce((acc, entry) => {
    const group = getGroup(entry.key, delimiter);
    if (!acc[group]) acc[group] = [];
    acc[group].push(entry);
    return acc;
  }, {});
}

/**
 * List all unique group names present in entries.
 * @param {Array<{key: string, value: string}>} entries
 * @param {string} delimiter
 * @returns {string[]}
 */
function listGroups(entries, delimiter = '_') {
  return [...new Set(entries.map(e => getGroup(e.key, delimiter)))];
}

/**
 * Filter entries belonging to a specific group.
 * @param {Array<{key: string, value: string}>} entries
 * @param {string} groupName
 * @param {string} delimiter
 * @returns {Array<{key: string, value: string}>}
 */
function filterByGroup(entries, groupName, delimiter = '_') {
  return entries.filter(e => getGroup(e.key, delimiter) === groupName);
}

module.exports = { getGroup, groupEntries, listGroups, filterByGroup };
