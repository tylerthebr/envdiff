// tagger.js — assign and query tags on env entries

/**
 * Parse inline tags from a comment like: KEY=value # @tag1 @tag2
 * @param {string} raw - raw line from .env file
 * @returns {string[]}
 */
function extractInlineTags(raw) {
  const match = raw.match(/#(.*)$/);
  if (!match) return [];
  return (match[1].match(/@(\w+)/g) || []).map(t => t.slice(1));
}

/**
 * Build a tag map from parsed entries + raw lines.
 * @param {Array<{key:string,value:string}>} entries
 * @param {string[]} lines
 * @returns {Object} { KEY: string[] }
 */
function buildTagMap(entries, lines) {
  const map = {};
  entries.forEach((entry, i) => {
    const line = lines[i] || '';
    map[entry.key] = extractInlineTags(line);
  });
  return map;
}

/**
 * Filter entries by a required tag.
 * @param {Array<{key:string,value:string}>} entries
 * @param {Object} tagMap
 * @param {string} tag
 * @returns {Array}
 */
function filterByTag(entries, tagMap, tag) {
  return entries.filter(e => (tagMap[e.key] || []).includes(tag));
}

/**
 * List all unique tags across all entries.
 * @param {Object} tagMap
 * @returns {string[]}
 */
function listAllTags(tagMap) {
  const set = new Set();
  Object.values(tagMap).forEach(tags => tags.forEach(t => set.add(t)));
  return [...set].sort();
}

/**
 * Annotate entries with their tags.
 * @param {Array<{key:string,value:string}>} entries
 * @param {Object} tagMap
 * @returns {Array<{key:string,value:string,tags:string[]}>}
 */
function annotateEntries(entries, tagMap) {
  return entries.map(e => ({ ...e, tags: tagMap[e.key] || [] }));
}

module.exports = { extractInlineTags, buildTagMap, filterByTag, listAllTags, annotateEntries };
