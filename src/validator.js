/**
 * Validates parsed env entries for common issues:
 * empty keys, whitespace-only values, duplicate keys, invalid characters.
 */

const VALID_KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * @param {string} key
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateKey(key) {
  if (!key || key.trim() === '') {
    return { valid: false, reason: 'empty key' };
  }
  if (!VALID_KEY_RE.test(key)) {
    return { valid: false, reason: `invalid characters in key: "${key}"` };
  }
  return { valid: true };
}

/**
 * @param {Record<string, string>} envMap
 * @returns {Array<{ key: string, warning: string }>}
 */
function findWarnings(envMap) {
  const warnings = [];
  for (const [key, value] of Object.entries(envMap)) {
    const keyCheck = validateKey(key);
    if (!keyCheck.valid) {
      warnings.push({ key, warning: keyCheck.reason });
      continue;
    }
    if (typeof value === 'string' && value !== value.trim()) {
      warnings.push({ key, warning: 'value has leading or trailing whitespace' });
    }
    if (value === '') {
      warnings.push({ key, warning: 'value is empty string' });
    }
  }
  return warnings;
}

/**
 * Checks for duplicate keys in raw lines (before deduplication by parse).
 * @param {string} rawContent
 * @returns {string[]}
 */
function findDuplicateKeys(rawContent) {
  const seen = new Set();
  const duplicates = new Set();
  for (const line of rawContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    if (seen.has(key)) duplicates.add(key);
    else seen.add(key);
  }
  return [...duplicates];
}

/**
 * @param {Record<string, string>} envMap
 * @param {string} [rawContent]
 * @returns {{ warnings: Array<{ key: string, warning: string }>, duplicates: string[] }}
 */
function validateEnv(envMap, rawContent = '') {
  return {
    warnings: findWarnings(envMap),
    duplicates: findDuplicateKeys(rawContent),
  };
}

module.exports = { validateKey, findWarnings, findDuplicateKeys, validateEnv };
