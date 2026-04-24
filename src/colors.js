// colors.js — thin abstraction over ANSI codes, respects NO_COLOR env var

const SUPPORTED = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function isColorEnabled() {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return process.stdout && process.stdout.isTTY;
}

function applyColor(text, colorName) {
  if (!isColorEnabled()) return text;
  const code = SUPPORTED[colorName];
  if (!code) return text;
  return `${code}${text}${SUPPORTED.reset}`;
}

function strip(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

module.exports = { applyColor, strip, isColorEnabled, SUPPORTED };
