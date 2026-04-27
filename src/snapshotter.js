// snapshotter.js — save and compare env snapshots over time

const fs = require('fs');
const path = require('path');

function snapshotName(label) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return label ? `${label}-${ts}.json` : `snapshot-${ts}.json`;
}

function buildSnapshot(envMap, label = '') {
  return {
    label,
    createdAt: new Date().toISOString(),
    keys: Object.keys(envMap).sort(),
    entries: envMap,
  };
}

function saveSnapshot(envMap, dir, label = '') {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const name = snapshotName(label);
  const snapshot = buildSnapshot(envMap, label);
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  return filePath;
}

function loadSnapshot(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function diffSnapshots(snapA, snapB) {
  const keysA = new Set(snapA.keys);
  const keysB = new Set(snapB.keys);
  const allKeys = new Set([...keysA, ...keysB]);
  const added = [];
  const removed = [];
  const changed = [];
  const unchanged = [];

  for (const key of allKeys) {
    if (!keysA.has(key)) { added.push(key); continue; }
    if (!keysB.has(key)) { removed.push(key); continue; }
    if (snapA.entries[key] !== snapB.entries[key]) changed.push(key);
    else unchanged.push(key);
  }

  return { added, removed, changed, unchanged };
}

function listSnapshots(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort();
}

module.exports = { buildSnapshot, saveSnapshot, loadSnapshot, diffSnapshots, listSnapshots, snapshotName };
