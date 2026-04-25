/**
 * Merges multiple parsed env objects into a unified key map,
 * tracking which environments define each key and their values.
 */

/**
 * @param {Record<string, Record<string, string>>} envMap - { envName: parsedEnv }
 * @returns {Record<string, Record<string, string|undefined>>}
 */
function mergeEnvs(envMap) {
  const envNames = Object.keys(envMap);
  const allKeys = new Set();

  for (const name of envNames) {
    for (const key of Object.keys(envMap[name])) {
      allKeys.add(key);
    }
  }

  const merged = {};
  for (const key of allKeys) {
    merged[key] = {};
    for (const name of envNames) {
      merged[key][name] = Object.prototype.hasOwnProperty.call(envMap[name], key)
        ? envMap[name][key]
        : undefined;
    }
  }

  return merged;
}

/**
 * Returns keys that are present in all environments.
 * @param {ReturnType<typeof mergeEnvs>} merged
 * @param {string[]} envNames
 * @returns {string[]}
 */
function commonKeys(merged, envNames) {
  return Object.keys(merged).filter((key) =>
    envNames.every((name) => merged[key][name] !== undefined)
  );
}

/**
 * Returns keys missing from at least one environment.
 * @param {ReturnType<typeof mergeEnvs>} merged
 * @param {string[]} envNames
 * @returns {string[]}
 */
function incompleteKeys(merged, envNames) {
  return Object.keys(merged).filter((key) =>
    envNames.some((name) => merged[key][name] === undefined)
  );
}

module.exports = { mergeEnvs, commonKeys, incompleteKeys };
