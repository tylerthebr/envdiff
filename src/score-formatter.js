const { colorize } = require('./formatter');

function gradeColor(grade) {
  if (grade === 'A') return 'green';
  if (grade === 'B') return 'cyan';
  if (grade === 'C') return 'yellow';
  if (grade === 'D') return 'magenta';
  return 'red';
}

function formatScoreRow(scoreObj) {
  const { label, score, grade, totalKeys, penalties } = scoreObj;
  const gradeStr = colorize(grade, gradeColor(grade));
  const scoreStr = colorize(String(score).padStart(3), gradeColor(grade));
  const penaltyParts = Object.entries(penalties)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k}:${v}`)
    .join(' ');
  const penaltyStr = penaltyParts ? colorize(`[${penaltyParts}]`, 'dim') : '';
  return `  ${label.padEnd(20)} ${scoreStr}/100  ${gradeStr}  keys:${totalKeys}  ${penaltyStr}`;
}

function formatScoreHeader(title) {
  return colorize(`\n=== ${title} ===`, 'bold');
}

function formatScoreReport(scores, title = 'Env Score Report') {
  const lines = [formatScoreHeader(title)];
  for (const s of scores) {
    lines.push(formatScoreRow(s));
  }
  const avg = scores.length
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : 0;
  lines.push(colorize(`\n  Average score: ${avg}/100`, 'bold'));
  return lines.join('\n');
}

module.exports = { gradeColor, formatScoreRow, formatScoreHeader, formatScoreReport };
