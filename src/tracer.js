// tracer.js — traces the origin of a key across multiple env files

/**
 * @param {string} key
 * @param {Array<{name: string, env: Object}>} envFiles
 * @returns {Array<{file: string, value: string|undefined, present: boolean}>}
 */
function traceKey(key, envFiles) {
  return envFiles.map(({ name, env }) => ({
    file: name,
    value: env[key],
    present: Object.prototype.hasOwnProperty.call(env, key)
  }));
}

/**
 * @param {Array<{file: string, value: string|undefined, present: boolean}>} trace
 * @returns {boolean}
 */
function isConsistent(trace) {
  const values = trace.filter(t => t.present).map(t => t.value);
  return values.length > 0 && new Set(values).size === 1;
}

/**
 * @param {Array<{name: string, env: Object}>} envFiles
 * @returns {string[]}
 */
function allKeys(envFiles) {
  const keys = new Set();
  for (const { env } of envFiles) {
    for (const key of Object.keys(env)) keys.add(key);
  }
  return [...keys].sort();
}

/**
 * @param {Array<{name: string, env: Object}>} envFiles
 * @returns {Array<{key: string, trace: Array, consistent: boolean}>}
 */
function buildTrace(envFiles) {
  return allKeys(envFiles).map(key => {
    const trace = traceKey(key, envFiles);
    return { key, trace, consistent: isConsistent(trace) };
  });
}

module.exports = { traceKey, isConsistent, allKeys, buildTrace };
