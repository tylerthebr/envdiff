// diff-formatter.js — formats diff entries into human-readable lines

const { colorize } = require('./formatter');
const { applyColor } = require('./colors');

const SYMBOLS = {
  ok: '  ',
  missing: '- ',
  mismatched: '~ ',
  extra: '+ ',
};

function formatDiffLine(entry, useColor = true) {
  const symbol = SYMBOLS[entry.status] || '  ';
  const key = entry.key;

  if (entry.status === 'ok') {
    const line = `${symbol}${key}=${entry.baseValue}`;
    return useColor ? applyColor(line, 'dim') : line;
  }

  if (entry.status === 'missing') {
    const side = entry.baseValue !== null ? entry.baseValue : entry.targetValue;
    const line = `${symbol}${key}=${side}`;
    return useColor ? applyColor(line, 'red') : line;
  }

  if (entry.status === 'mismatched') {
    const line = `${symbol}${key}: ${entry.baseValue} → ${entry.targetValue}`;
    return useColor ? applyColor(line, 'yellow') : line;
  }

  return `${symbol}${key}`;
}

function formatDiffBlock(diffEntries, useColor = true) {
  return diffEntries.map((e) => formatDiffLine(e, useColor)).join('\n');
}

function formatDiffHeader(baseLabel, targetLabel, useColor = true) {
  const line = `--- ${baseLabel}  +++  ${targetLabel}`;
  return useColor ? applyColor(line, 'cyan') : line;
}

module.exports = { formatDiffLine, formatDiffBlock, formatDiffHeader };
