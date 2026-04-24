// formatter.js — formats diff output with colors and symbols

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function formatMissingKey(key, envName) {
  return `  ${colorize('✗', 'red')} ${colorize(key, 'bold')} ${colorize(`missing in ${envName}`, 'dim')}`;
}

function formatMismatchedKey(key, values) {
  const lines = [`  ${colorize('~', 'yellow')} ${colorize(key, 'bold')} ${colorize('value mismatch:', 'dim')}`);
  for (const [env, val] of Object.entries(values)) {
    lines.push(`      ${colorize(env, 'cyan')}: ${colorize(val, 'dim')}`);
  }
  return lines.join('\n');
}

function formatOkKey(key) {
  return `  ${colorize('✓', 'green')} ${colorize(key, 'dim')}`;
}

function formatHeader(title) {
  return `\n${colorize(title, 'bold')}\n${colorize('─'.repeat(40), 'dim')}`;
}

function formatSummary(missing, mismatched, ok) {
  const parts = [
    colorize(`${ok} ok`, 'green'),
    colorize(`${mismatched} mismatched`, 'yellow'),
    colorize(`${missing} missing`, 'red'),
  ];
  return `\n${colorize('Summary:', 'bold')} ${parts.join('  ')}\n`;
}

module.exports = {
  colorize,
  formatMissingKey,
  formatMismatchedKey,
  formatOkKey,
  formatHeader,
  formatSummary,
};
