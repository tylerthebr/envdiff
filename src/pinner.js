// pinner.js — pin/freeze env values and detect drift from pinned state

/**
 * Build a pin entry from a key/value pair.
 * @param {string} key
 * @param {string} value
 * @returns {{ key: string, value: string, pinnedAt: string }}
 */
function buildPin(key, value) {
  return { key, value, pinnedAt: new Date().toISOString() };
}

/**
 * Build a pin map from a parsed env object.
 * @param {Object} env
 * @returns {Object}
 */
function pinEnv(env) {
  const pins = {};
  for (const [key, value] of Object.entries(env)) {
    pins[key] = buildPin(key, value);
  }
  return pins;
}

/**
 * Compare a live env against a pin map and return drift entries.
 * @param {Object} env  — current parsed env
 * @param {Object} pins — previously pinned map
 * @returns {Array<{ key: string, pinned: string, current: string, status: string }>}
 */
function detectDrift(env, pins) {
  const results = [];

  for (const key of Object.keys(pins)) {
    if (!(key in env)) {
      results.push({ key, pinned: pins[key].value, current: undefined, status: 'removed' });
    } else if (env[key] !== pins[key].value) {
      results.push({ key, pinned: pins[key].value, current: env[key], status: 'changed' });
    } else {
      results.push({ key, pinned: pins[key].value, current: env[key], status: 'ok' });
    }
  }

  for (const key of Object.keys(env)) {
    if (!(key in pins)) {
      results.push({ key, pinned: undefined, current: env[key], status: 'added' });
    }
  }

  return results;
}

/**
 * Returns true if any drift entries have status other than 'ok'.
 * @param {Array} driftEntries
 * @returns {boolean}
 */
function hasDrift(driftEntries) {
  return driftEntries.some(e => e.status !== 'ok');
}

module.exports = { buildPin, pinEnv, detectDrift, hasDrift };
