// reporter.js — prints the comparison report using formatter helpers

const {
  formatMissingKey,
  formatMismatchedKey,
  formatOkKey,
  formatHeader,
  formatSummary,
} = require('./formatter');

/**
 * @param {object} report - output from compareEnvs
 * @param {string[]} envNames - ordered list of env file names
 * @param {object} options - { showOk: boolean }
 */
function printReport(report, envNames, options = {}) {
  const { showOk = false } = options;
  const lines = [];

  lines.push(formatHeader(`Comparing ${envNames.join(' vs ')}:`));

  let missingCount = 0;
  let mismatchedCount = 0;
  let okCount = 0;

  for (const [key, info] of Object.entries(report)) {
    if (info.status === 'missing') {
      for (const envName of info.missingIn) {
        lines.push(formatMissingKey(key, envName));
        missingCount++;
      }
    } else if (info.status === 'mismatch') {
      lines.push(formatMismatchedKey(key, info.values));
      mismatchedCount++;
    } else if (info.status === 'ok') {
      okCount++;
      if (showOk) {
        lines.push(formatOkKey(key));
      }
    }
  }

  lines.push(formatSummary(missingCount, mismatchedCount, okCount));

  console.log(lines.join('\n'));

  return { missingCount, mismatchedCount, okCount };
}

module.exports = { printReport };
