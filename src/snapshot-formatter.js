// snapshot-formatter.js — format snapshot diff results for display

const { colorize } = require('./formatter');

function formatSnapshotHeader(snapA, snapB) {
  return [
    colorize('bold', '== Snapshot Diff =='),
    `  From: ${snapA.label || snapA.createdAt}`,
    `  To:   ${snapB.label || snapB.createdAt}`,
    '',
  ].join('\n');
}

function formatDiffSection(title, keys, color) {
  if (!keys.length) return '';
  const lines = [colorize(color, `${title} (${keys.length})`)];
  for (const key of keys) lines.push(`  ${key}`);
  return lines.join('\n') + '\n';
}

function formatSnapshotDiff(snapA, snapB, diff) {
  const parts = [
    formatSnapshotHeader(snapA, snapB),
    formatDiffSection('Added', diff.added, 'green'),
    formatDiffSection('Removed', diff.removed, 'red'),
    formatDiffSection('Changed', diff.changed, 'yellow'),
    formatDiffSection('Unchanged', diff.unchanged, 'gray'),
  ].filter(Boolean);
  return parts.join('');
}

function formatSnapshotSummary(diff) {
  const { added, removed, changed, unchanged } = diff;
  return [
    colorize('bold', 'Summary:'),
    `  + ${added.length} added`,
    `  - ${removed.length} removed`,
    `  ~ ${changed.length} changed`,
    `  = ${unchanged.length} unchanged`,
  ].join('\n');
}

module.exports = { formatSnapshotHeader, formatDiffSection, formatSnapshotDiff, formatSnapshotSummary };
