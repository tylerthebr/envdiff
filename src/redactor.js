// Redacts sensitive values in env entries before display or export

const DEFAULT_SENSITIVE_PATTERNS = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /cert/i,
  /passphrase/i,
];

const REDACTED = '***REDACTED***';

/**
 * Returns true if the key matches any sensitive pattern.
 * @param {string} key
 * @param {RegExp[]} patterns
 * @returns {boolean}
 */
function isSensitiveKey(key, patterns = DEFAULT_SENSITIVE_PATTERNS) {
  return patterns.some((re) => re.test(key));
}

/**
 * Redacts the value of an entry if its key is sensitive.
 * @param {{ key: string, value: string }} entry
 * @param {RegExp[]} patterns
 * @returns {{ key: string, value: string, redacted: boolean }}
 */
function redactEntry(entry, patterns = DEFAULT_SENSITIVE_PATTERNS) {
  if (isSensitiveKey(entry.key, patterns)) {
    return { ...entry, value: REDACTED, redacted: true };
  }
  return { ...entry, redacted: false };
}

/**
 * Redacts all sensitive entries in a parsed env object.
 * @param {Record<string, string>} env
 * @param {RegExp[]} patterns
 * @returns {Record<string, string>}
 */
function redactEnv(env, patterns = DEFAULT_SENSITIVE_PATTERNS) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = isSensitiveKey(key, patterns) ? REDACTED : value;
  }
  return result;
}

/**
 * Builds a list of redacted entry objects from an env map.
 * @param {Record<string, string>} env
 * @param {RegExp[]} patterns
 * @returns {Array<{ key: string, value: string, redacted: boolean }>}
 */
function redactEntries(env, patterns = DEFAULT_SENSITIVE_PATTERNS) {
  return Object.entries(env).map(([key, value]) =>
    redactEntry({ key, value }, patterns)
  );
}

module.exports = {
  REDACTED,
  DEFAULT_SENSITIVE_PATTERNS,
  isSensitiveKey,
  redactEntry,
  redactEnv,
  redactEntries,
};
