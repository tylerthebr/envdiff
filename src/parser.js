/**
 * Parses a .env file string into a key-value object.
 * Handles comments, blank lines, and quoted values.
 */

/**
 * @param {string} content - Raw .env file content
 * @returns {Record<string, string>} Parsed key-value pairs
 */
function parseEnv(content) {
  const result = {};

  if (!content || typeof content !== 'string') {
    return result;
  }

  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (!key) {
      continue;
    }

    // Strip surrounding quotes (single or double)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

module.exports = { parseEnv };
