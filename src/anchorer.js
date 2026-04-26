// anchorer.js — pin specific keys as "required" anchors and report missing ones

/**
 * @param {string[]} anchors - list of required key names
 * @param {Object} env - parsed env object { key: value }
 * @returns {{ key: string, present: boolean }[]}
 */
function checkAnchors(anchors, env) {
  return anchors.map((key) => ({
    key,
    present: Object.prototype.hasOwnProperty.call(env, key),
  }));
}

/**
 * @param {string[]} anchors
 * @param {Object[]} envs - array of parsed env objects
 * @returns {{ key: string, results: { index: number, present: boolean }[] }[]}
 */
function checkAnchorsAcrossEnvs(anchors, envs) {
  return anchors.map((key) => ({
    key,
    results: envs.map((env, index) => ({
      index,
      present: Object.prototype.hasOwnProperty.call(env, key),
    })),
  }));
}

/**
 * @param {{ key: string, present: boolean }[]} report
 * @returns {string[]}
 */
function missingAnchors(report) {
  return report.filter((r) => !r.present).map((r) => r.key);
}

/**
 * @param {string[]} anchors
 * @param {Object} env
 * @returns {boolean}
 */
function allAnchorsPresent(anchors, env) {
  return anchors.every((key) =>
    Object.prototype.hasOwnProperty.call(env, key)
  );
}

module.exports = {
  checkAnchors,
  checkAnchorsAcrossEnvs,
  missingAnchors,
  allAnchorsPresent,
};
