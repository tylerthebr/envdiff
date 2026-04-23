/**
 * Compares two parsed env objects and returns a diff result.
 * @param {Object} base - The base env (e.g. .env.example)
 * @param {Object} target - The target env to compare against
 * @param {string} [baseName='base'] - Label for the base env
 * @param {string} [targetName='target'] - Label for the target env
 * @returns {Object} diff result with missing, extra, and mismatched keys
 */
function compareEnvs(base, target, baseName = 'base', targetName = 'target') {
  const baseKeys = new Set(Object.keys(base));
  const targetKeys = new Set(Object.keys(target));

  const missingInTarget = [];
  const missingInBase = [];
  const mismatched = [];

  for (const key of baseKeys) {
    if (!targetKeys.has(key)) {
      missingInTarget.push(key);
    } else if (base[key] !== target[key]) {
      mismatched.push({
        key,
        [baseName]: base[key],
        [targetName]: target[key],
      });
    }
  }

  for (const key of targetKeys) {
    if (!baseKeys.has(key)) {
      missingInBase.push(key);
    }
  }

  const hasDiff =
    missingInTarget.length > 0 ||
    missingInBase.length > 0 ||
    mismatched.length > 0;

  return {
    baseName,
    targetName,
    missingInTarget,
    missingInBase,
    mismatched,
    hasDiff,
  };
}

module.exports = { compareEnvs };
