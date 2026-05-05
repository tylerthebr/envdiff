// pin-formatter.js — format pinned env drift reports

const { applyColor } = require('./colors');

const STATUS_COLORS = {
  ok: 'green',
  changed: 'yellow',
  removed: 'red',
  added: 'cyan',
};

/**
 * Format a single drift entry line.
 * @param {{ key: string, pinned: string, current: string, status: string }} entry
 * @returns {string}
 */
function formatDriftEntry(entry) {
  const color = STATUS_COLORS[entry.status] || 'reset';
  const label = entry.status.toUpperCase().padEnd(7);
  const pinned = entry.pinned !== undefined ? entry.pinned : '(none)';
  const current = entry.current !== undefined ? entry.current : '(none)';

  if (entry.status === 'ok') {
    return applyColor(`  [${label}] ${entry.key}`, color);
  }
  return applyColor(`  [${label}] ${entry.key}  pinned=${pinned}  current=${current}`, color);
}

/**
 * Format the header line for a pin drift report.
 * @param {string} label
 * @returns {string}
 */
function formatPinHeader(label) {
  return applyColor(`\n=== Pin Drift Report: ${label} ===`, 'bold');
}

/**
 * Format a summary line for drift results.
 * @param {Array} entries
 * @returns {string}
 */
function formatPinSummary(entries) {
  const counts = { ok: 0, changed: 0, removed: 0, added: 0 };
  for (const e of entries) counts[e.status] = (counts[e.status] || 0) + 1;
  const parts = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k}: ${v}`);
  const hasDrift = entries.some(e => e.status !== 'ok');
  const color = hasDrift ? 'yellow' : 'green';
  return applyColor(`Summary — ${parts.join(', ')}`, color);
}

/**
 * Format a full pin drift report.
 * @param {string} label
 * @param {Array} entries
 * @returns {string}
 */
function formatPinReport(label, entries) {
  const lines = [formatPinHeader(label)];
  for (const e of entries) lines.push(formatDriftEntry(e));
  lines.push(formatPinSummary(entries));
  return lines.join('\n');
}

module.exports = { formatDriftEntry, formatPinHeader, formatPinSummary, formatPinReport };
