/**
 * patch-formatter.js — formats patch operations for display.
 */

const { applyColor } = require('./colors');

const OP_COLORS = {
  add: 'green',
  update: 'yellow',
  remove: 'red',
};

const OP_SYMBOLS = {
  add: '+',
  update: '~',
  remove: '-',
};

function formatOp(op, useColor = true) {
  const symbol = OP_SYMBOLS[op.op] ?? '?';
  const color = OP_COLORS[op.op] ?? 'reset';
  const val = op.value !== undefined ? `=${op.value}` : '';
  const line = `  ${symbol} ${op.key}${val}`;
  return useColor ? applyColor(line, color) : line;
}

function formatPatchHeader(fromFile, toFile, count, useColor = true) {
  const header = `Patch: ${fromFile} → ${toFile} (${count} op${count !== 1 ? 's' : ''})`;
  return useColor ? applyColor(header, 'cyan') : header;
}

function formatLogEntry(entry, useColor = true) {
  const icon = entry.status === 'applied' ? '✓' : '⚠';
  const color = entry.status === 'applied' ? 'green' : 'yellow';
  const reason = entry.reason ? ` (${entry.reason})` : '';
  const line = `  ${icon} [${entry.op}] ${entry.key}${reason}`;
  return useColor ? applyColor(line, color) : line;
}

function formatPatchSummary(log, useColor = true) {
  const applied = log.filter(l => l.status === 'applied').length;
  const skipped = log.filter(l => l.status === 'skipped').length;
  const line = `Summary: ${applied} applied, ${skipped} skipped`;
  return useColor ? applyColor(line, 'cyan') : line;
}

module.exports = { formatOp, formatPatchHeader, formatLogEntry, formatPatchSummary };
