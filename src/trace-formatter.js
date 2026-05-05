// trace-formatter.js — formats key trace output for CLI display

const { applyColor } = require('./colors');

const PRESENT = '✔';
const ABSENT  = '✘';

/**
 * @param {{file: string, value: string|undefined, present: boolean}} entry
 * @returns {string}
 */
function formatTraceEntry(entry) {
  if (!entry.present) {
    return applyColor('red', `  ${ABSENT} ${entry.file}: (missing)`);
  }
  const val = entry.value === '' ? '(empty)' : entry.value;
  return applyColor('green', `  ${PRESENT} ${entry.file}: ${val}`);
}

/**
 * @param {{key: string, trace: Array, consistent: boolean}} result
 * @returns {string}
 */
function formatTraceBlock(result) {
  const headerColor = result.consistent ? 'cyan' : 'yellow';
  const status = result.consistent ? '[consistent]' : '[inconsistent]';
  const header = applyColor(headerColor, `${result.key} ${status}`);
  const lines = result.trace.map(formatTraceEntry);
  return [header, ...lines].join('\n');
}

/**
 * @param {Array<{key: string, trace: Array, consistent: boolean}>} results
 * @returns {string}
 */
function formatTraceReport(results) {
  if (results.length === 0) return applyColor('gray', 'No keys to trace.');
  return results.map(formatTraceBlock).join('\n\n');
}

module.exports = { formatTraceEntry, formatTraceBlock, formatTraceReport };
