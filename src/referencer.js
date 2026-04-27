// referencer.js — finds keys that reference other keys via ${VAR} syntax

/**
 * Extract all ${VAR} references from a value string
 * @param {string} value
 * @returns {string[]}
 */
function extractRefs(value) {
  if (typeof value !== 'string') return [];
  const matches = value.matchAll(/\$\{([^}]+)\}/g);
  return [...matches].map(m => m[1]);
}

/**
 * Build a map of key -> keys it references
 * @param {Object} env - parsed env object { key: value }
 * @returns {Object}
 */
function buildRefMap(env) {
  const map = {};
  for (const [key, value] of Object.entries(env)) {
    const refs = extractRefs(value);
    if (refs.length > 0) map[key] = refs;
  }
  return map;
}

/**
 * Find keys that are referenced by other keys but not defined
 * @param {Object} env
 * @returns {string[]}
 */
function findUndefinedRefs(env) {
  const defined = new Set(Object.keys(env));
  const missing = new Set();
  for (const refs of Object.values(buildRefMap(env))) {
    for (const ref of refs) {
      if (!defined.has(ref)) missing.add(ref);
    }
  }
  return [...missing];
}

/**
 * Find keys that are never referenced by any other key
 * @param {Object} env
 * @returns {string[]}
 */
function findUnreferencedKeys(env) {
  const allRefs = new Set(
    Object.values(buildRefMap(env)).flat()
  );
  return Object.keys(env).filter(k => !allRefs.has(k));
}

/**
 * Detect circular references using DFS
 * @param {Object} refMap
 * @returns {string[][]}
 */
function findCircularRefs(refMap) {
  const cycles = [];
  function dfs(node, path, visited) {
    if (visited.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) cycles.push(path.slice(cycleStart).concat(node));
      return;
    }
    visited.add(node);
    for (const dep of (refMap[node] || [])) {
      dfs(dep, [...path, node], new Set(visited));
    }
  }
  for (const key of Object.keys(refMap)) {
    dfs(key, [], new Set());
  }
  return cycles;
}

module.exports = { extractRefs, buildRefMap, findUndefinedRefs, findUnreferencedKeys, findCircularRefs };
