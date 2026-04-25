/**
 * Lints .env files for common style and correctness issues.
 */

const VALID_KEY_RE = /^[A-Z][A-Z0-9_]*$/;
const QUOTED_VALUE_RE = /^(['"]).*\1$/;
const TRAILING_SPACE_RE = / +$/;
const EMPTY_VALUE_RE = /^$/;

/**
 * @param {string} key
 * @param {string} value
 * @returns {string[]}
 */
function lintEntry(key, value) {
  const issues = [];

  if (!VALID_KEY_RE.test(key)) {
    issues.push(`Key "${key}" should be UPPER_SNAKE_CASE`);
  }

  if (TRAILING_SPACE_RE.test(value)) {
    issues.push(`Value for "${key}" has trailing whitespace`);
  }

  if (QUOTED_VALUE_RE.test(value)) {
    issues.push(`Value for "${key}" has unnecessary surrounding quotes`);
  }

  if (EMPTY_VALUE_RE.test(value)) {
    issues.push(`Value for "${key}" is empty`);
  }

  return issues;
}

/**
 * @param {Record<string, string>} env
 * @returns {{ key: string, issues: string[] }[]}
 */
function lintEnv(env) {
  return Object.entries(env)
    .map(([key, value]) => ({ key, issues: lintEntry(key, value) }))
    .filter(({ issues }) => issues.length > 0);
}

/**
 * @param {{ key: string, issues: string[] }[]} results
 * @returns {boolean}
 */
function hasLintErrors(results) {
  return results.length > 0;
}

module.exports = { lintEntry, lintEnv, hasLintErrors };
