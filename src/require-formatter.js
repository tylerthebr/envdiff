// require-formatter.js — formats requirement check results for CLI output

const { applyColor } = require('./colors');

function formatMissingReq(req) {
  const label = applyColor('red', '✗ MISSING');
  const desc = req.description ? `  # ${req.description}` : '';
  return `  ${label}  ${req.key}${desc}`;
}

function formatEmptyReq(req) {
  const label = applyColor('yellow', '⚠ EMPTY');
  const desc = req.description ? `  # ${req.description}` : '';
  return `  ${label}    ${req.key}${desc}`;
}

function formatOkReq(req) {
  const label = applyColor('green', '✓ OK');
  return `  ${label}       ${req.key}`;
}

function formatRequireHeader(file) {
  return applyColor('cyan', `Requirements check: ${file}`);
}

function formatRequireSummary(result) {
  const { missing, empty, ok, total } = result;
  const parts = [
    applyColor('green', `${ok.length} ok`),
    applyColor('yellow', `${empty.length} empty`),
    applyColor('red', `${missing.length} missing`)
  ];
  return `Summary: ${parts.join(', ')} / ${total} required`;
}

function formatRequireReport(file, result) {
  const lines = [formatRequireHeader(file), ''];
  for (const r of result.missing) lines.push(formatMissingReq(r));
  for (const r of result.empty) lines.push(formatEmptyReq(r));
  for (const r of result.ok) lines.push(formatOkReq(r));
  lines.push('');
  lines.push(formatRequireSummary(result));
  return lines.join('\n');
}

module.exports = { formatMissingReq, formatEmptyReq, formatOkReq, formatRequireHeader, formatRequireSummary, formatRequireReport };
