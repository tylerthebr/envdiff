/**
 * renamer.js — Rename keys across one or more env files
 */

/**
 * Build a rename operation descriptor
 * @param {string} oldKey
 * @param {string} newKey
 * @returns {{ oldKey: string, newKey: string }}
 */
function buildRenameOp(oldKey, newKey) {
  if (!oldKey || !newKey) throw new Error('Both oldKey and newKey are required');
  if (oldKey === newKey) throw new Error('oldKey and newKey must differ');
  return { oldKey, newKey };
}

/**
 * Apply a single rename op to a parsed env map
 * @param {Record<string, string>} env
 * @param {{ oldKey: string, newKey: string }} op
 * @returns {{ env: Record<string, string>, changed: boolean, conflict: boolean }}
 */
function applyRename(env, op) {
  const { oldKey, newKey } = op;
  if (!(oldKey in env)) {
    return { env: { ...env }, changed: false, conflict: false };
  }
  if (newKey in env) {
    return { env: { ...env }, changed: false, conflict: true };
  }
  const updated = {};
  for (const [k, v] of Object.entries(env)) {
    if (k === oldKey) {
      updated[newKey] = v;
    } else {
      updated[k] = v;
    }
  }
  return { env: updated, changed: true, conflict: false };
}

/**
 * Apply multiple rename ops sequentially
 * @param {Record<string, string>} env
 * @param {Array<{ oldKey: string, newKey: string }>} ops
 * @returns {{ env: Record<string, string>, results: Array }}
 */
function applyRenames(env, ops) {
  let current = { ...env };
  const results = [];
  for (const op of ops) {
    const result = applyRename(current, op);
    results.push({ ...op, ...result });
    if (result.changed) current = result.env;
  }
  return { env: current, results };
}

/**
 * Serialize a renamed env back to .env string format
 * @param {Record<string, string>} env
 * @returns {string}
 */
function envToString(env) {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

module.exports = { buildRenameOp, applyRename, applyRenames, envToString };
