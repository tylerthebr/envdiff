// tag-formatter.js — format tagged entries for display
const { applyColor } = require('./colors');

/**
 * Format a single tag badge.
 * @param {string} tag
 * @returns {string}
 */
function formatTag(tag) {
  return applyColor(`@${tag}`, 'cyan');
}

/**
 * Format the tag list for a single entry.
 * @param {string[]} tags
 * @returns {string}
 */
function formatTagList(tags) {
  if (!tags || tags.length === 0) return applyColor('(none)', 'gray');
  return tags.map(formatTag).join(' ');
}

/**
 * Format a single tagged entry row.
 * @param {{key:string,value:string,tags:string[]}} entry
 * @returns {string}
 */
function formatTagRow(entry) {
  const key = applyColor(entry.key, 'white');
  const tags = formatTagList(entry.tags);
  return `  ${key}: ${tags}`;
}

/**
 * Format a full tag report.
 * @param {Array<{key:string,value:string,tags:string[]}>} annotated
 * @param {string} [title]
 * @returns {string}
 */
function formatTagReport(annotated, title = 'Tag Report') {
  const header = applyColor(`\n=== ${title} ===`, 'bold');
  const rows = annotated.map(formatTagRow).join('\n');
  return `${header}\n${rows}\n`;
}

module.exports = { formatTag, formatTagList, formatTagRow, formatTagReport };
