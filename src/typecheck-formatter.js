// typecheck-formatter.js — formats typecheck results for CLI output

const { applyColor } = require('./colors');

function formatPass(result) {
  return applyColor('green', `  ✔ ${result.key} (${result.expectedType})`);
}

function formatFail(result) {
  if (result.reason === 'missing') {
    return applyColor('red', `  ✘ ${result.key} — missing (expected ${result.expectedType})`);
  }
  return applyColor('red',
    `  ✘ ${result.key} — "${result.value}" is not a valid ${result.expectedType}`);
}

function formatTypecheckHeader(file) {
  return applyColor('cyan', `\nType check: ${file}`);
}

function formatTypecheckResult(result) {
  return result.pass ? formatPass(result) : formatFail(result);
}

function formatTypecheckSummary(results) {
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = total - passed;
  const color = failed > 0 ? 'red' : 'green';
  return applyColor(color, `\n${passed}/${total} checks passed` + (failed > 0 ? `, ${failed} failed` : ''));
}

function formatTypecheckReport(file, results) {
  const lines = [formatTypecheckHeader(file)];
  for (const result of results) {
    lines.push(formatTypecheckResult(result));
  }
  lines.push(formatTypecheckSummary(results));
  return lines.join('\n');
}

module.exports = {
  formatTypecheckResult,
  formatTypecheckHeader,
  formatTypecheckSummary,
  formatTypecheckReport
};
