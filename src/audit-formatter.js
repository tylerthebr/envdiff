'use strict';

const { applyColor } = require('./colors');

const ACTION_COLORS = {
  ADDED: 'green',
  REMOVED: 'red',
  CHANGED: 'yellow',
  UNCHANGED: 'gray',
};

function colorForAction(action) {
  return ACTION_COLORS[action] || 'reset';
}

function formatAuditEntry(entry, useColor = true) {
  const color = colorForAction(entry.action);
  const tag = useColor ? applyColor(`[${entry.action}]`, color) : `[${entry.action}]`;
  const prev = entry.prev !== null ? `"${entry.prev}"` : 'n/a';
  const next = entry.next !== null ? `"${entry.next}"` : 'n/a';
  const detail = entry.action === 'UNCHANGED'
    ? `value: ${next}`
    : `${prev} → ${next}`;
  return `${tag} ${entry.key}: ${detail}`;
}

function formatAuditHeader(label = 'Audit Log') {
  return `\n=== ${label} ===\n`;
}

function formatAuditSummary(log) {
  const counts = {};
  for (const e of log.entries) {
    counts[e.action] = (counts[e.action] || 0) + 1;
  }
  const parts = Object.entries(counts).map(([k, v]) => `${k}: ${v}`);
  return `Summary — ${parts.join(' | ')} (total: ${log.total})`;
}

function formatAuditReport(log, options = {}) {
  const lines = [formatAuditHeader(options.label)];
  for (const entry of log.entries) {
    lines.push(formatAuditEntry(entry, options.color !== false));
  }
  lines.push('');
  lines.push(formatAuditSummary(log));
  return lines.join('\n');
}

module.exports = { formatAuditEntry, formatAuditHeader, formatAuditSummary, formatAuditReport };
