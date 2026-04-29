// requirer.js — checks which keys are required and reports missing ones

/**
 * Parse a requirements spec: array of key names or objects with {key, description}
 * @param {Array} spec
 * @returns {Array<{key: string, description: string}>}
 */
function parseRequirements(spec) {
  return spec.map(item =>
    typeof item === 'string'
      ? { key: item, description: '' }
      : { key: item.key, description: item.description || '' }
  );
}

/**
 * Check which required keys are missing from an env map.
 * @param {Object} env - parsed env {key: value}
 * @param {Array<{key, description}>} requirements
 * @returns {Array<{key, description}>}
 */
function findMissingRequired(env, requirements) {
  return requirements.filter(req => !(req.key in env));
}

/**
 * Check which required keys are present but empty.
 * @param {Object} env
 * @param {Array<{key, description}>} requirements
 * @returns {Array<{key, description}>}
 */
function findEmptyRequired(env, requirements) {
  return requirements.filter(req => req.key in env && env[req.key].trim() === '');
}

/**
 * Full requirements check result.
 * @param {Object} env
 * @param {Array} spec
 * @returns {{ missing: Array, empty: Array, ok: Array, total: number }}
 */
function checkRequirements(env, spec) {
  const requirements = parseRequirements(spec);
  const missing = findMissingRequired(env, requirements);
  const empty = findEmptyRequired(env, requirements);
  const missingKeys = new Set(missing.map(r => r.key));
  const emptyKeys = new Set(empty.map(r => r.key));
  const ok = requirements.filter(r => !missingKeys.has(r.key) && !emptyKeys.has(r.key));
  return { missing, empty, ok, total: requirements.length };
}

/**
 * Returns true if all required keys are present and non-empty.
 */
function allRequiredPresent(env, spec) {
  const { missing, empty } = checkRequirements(env, spec);
  return missing.length === 0 && empty.length === 0;
}

module.exports = { parseRequirements, findMissingRequired, findEmptyRequired, checkRequirements, allRequiredPresent };
