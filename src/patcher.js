/**
 * patcher.js — applies a patch (set of changes) to an env object,
 * producing a new env with keys added, updated, or removed.
 */

/**
 * Apply a single patch operation to an env map.
 * op: 'add' | 'update' | 'remove'
 */
function applyOp(env, { op, key, value }) {
  const result = { ...env };
  if (op === 'remove') {
    delete result[key];
  } else if (op === 'add' || op === 'update') {
    result[key] = value ?? '';
  }
  return result;
}

/**
 * Apply an array of patch operations to an env map.
 * Returns the patched env and a log of applied/skipped ops.
 */
function applyPatch(env, ops = []) {
  const log = [];
  let current = { ...env };

  for (const op of ops) {
    const { key } = op;
    const existed = Object.prototype.hasOwnProperty.call(current, key);

    if (op.op === 'add' && existed) {
      log.push({ key, op: op.op, status: 'skipped', reason: 'key already exists' });
      continue;
    }
    if (op.op === 'remove' && !existed) {
      log.push({ key, op: op.op, status: 'skipped', reason: 'key not found' });
      continue;
    }
    if (op.op === 'update' && !existed) {
      log.push({ key, op: op.op, status: 'skipped', reason: 'key not found' });
      continue;
    }

    current = applyOp(current, op);
    log.push({ key, op: op.op, status: 'applied' });
  }

  return { env: current, log };
}

/**
 * Build a patch (list of ops) that transforms `base` into `target`.
 */
function buildPatch(base, target) {
  const ops = [];
  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  for (const key of allKeys) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inTarget = Object.prototype.hasOwnProperty.call(target, key);

    if (!inBase && inTarget) {
      ops.push({ op: 'add', key, value: target[key] });
    } else if (inBase && !inTarget) {
      ops.push({ op: 'remove', key });
    } else if (inBase && inTarget && base[key] !== target[key]) {
      ops.push({ op: 'update', key, value: target[key] });
    }
  }

  return ops;
}

module.exports = { applyOp, applyPatch, buildPatch };
