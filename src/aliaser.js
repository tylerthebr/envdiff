// aliaser.js — map keys to alternate names across env files

/**
 * Build an alias entry mapping oldKey -> newKey
 * @param {string} oldKey
 * @param {string} newKey
 * @returns {{ oldKey: string, newKey: string }}
 */
function buildAlias(oldKey, newKey) {
  return { oldKey: oldKey.trim(), newKey: newKey.trim() };
}

/**
 * Parse alias definitions from an array of "OLD=NEW" strings
 * @param {string[]} defs
 * @returns {{ oldKey: string, newKey: string }[]}
 */
function parseAliases(defs) {
  return defs
    .filter(d => d.includes('='))
    .map(d => {
      const idx = d.indexOf('=');
      return buildAlias(d.slice(0, idx), d.slice(idx + 1));
    });
}

/**
 * Apply aliases to an env object, renaming keys
 * @param {Record<string, string>} env
 * @param {{ oldKey: string, newKey: string }[]} aliases
 * @returns {{ env: Record<string, string>, applied: string[], notFound: string[] }}
 */
function applyAliases(env, aliases) {
  const result = { ...env };
  const applied = [];
  const notFound = [];

  for (const { oldKey, newKey } of aliases) {
    if (Object.prototype.hasOwnProperty.call(result, oldKey)) {
      result[newKey] = result[oldKey];
      delete result[oldKey];
      applied.push(oldKey);
    } else {
      notFound.push(oldKey);
    }
  }

  return { env: result, applied, notFound };
}

/**
 * Build a reverse lookup map from newKey -> oldKey
 * @param {{ oldKey: string, newKey: string }[]} aliases
 * @returns {Record<string, string>}
 */
function buildReverseMap(aliases) {
  const map = {};
  for (const { oldKey, newKey } of aliases) {
    map[newKey] = oldKey;
  }
  return map;
}

module.exports = { buildAlias, parseAliases, applyAliases, buildReverseMap };
