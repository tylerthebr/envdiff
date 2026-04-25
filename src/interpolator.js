/**
 * Resolves variable references within .env values.
 * Supports $VAR and ${VAR} syntax.
 */

/**
 * Expand a single value string using the provided env map.
 * @param {string} value
 * @param {Record<string, string>} env
 * @returns {string}
 */
function expandValue(value, env) {
  if (typeof value !== 'string') return value;
  return value.replace(/\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/gi, (match, braced, bare) => {
    const key = braced || bare;
    return Object.prototype.hasOwnProperty.call(env, key) ? env[key] : match;
  });
}

/**
 * Interpolate all values in an env object, resolving references to other keys.
 * Performs a single pass — circular or forward refs may not fully resolve.
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function interpolateEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = expandValue(value, env);
  }
  return result;
}

/**
 * Return a list of variable names referenced inside a value string.
 * @param {string} value
 * @returns {string[]}
 */
function extractRefs(value) {
  const refs = [];
  const re = /\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/gi;
  let match;
  while ((match = re.exec(value)) !== null) {
    refs.push(match[1] || match[2]);
  }
  return refs;
}

/**
 * Detect keys whose values reference undefined variables.
 * @param {Record<string, string>} env
 * @returns {{ key: string, ref: string }[]}
 */
function findUnresolvedRefs(env) {
  const warnings = [];
  for (const [key, value] of Object.entries(env)) {
    for (const ref of extractRefs(value)) {
      if (!Object.prototype.hasOwnProperty.call(env, ref)) {
        warnings.push({ key, ref });
      }
    }
  }
  return warnings;
}

module.exports = { expandValue, interpolateEnv, extractRefs, findUnresolvedRefs };
