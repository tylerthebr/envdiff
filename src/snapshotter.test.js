const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  buildSnapshot, saveSnapshot, loadSnapshot,
  diffSnapshots, listSnapshots
} = require('./snapshotter');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snaptest-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('buildSnapshot returns expected shape', () => {
  const env = { FOO: 'bar', BAZ: '1' };
  const snap = buildSnapshot(env, 'prod');
  expect(snap.label).toBe('prod');
  expect(snap.keys).toEqual(['BAZ', 'FOO']);
  expect(snap.entries).toEqual(env);
  expect(snap.createdAt).toBeTruthy();
});

test('saveSnapshot writes a JSON file and returns path', () => {
  const env = { A: '1' };
  const filePath = saveSnapshot(env, tmpDir, 'test');
  expect(fs.existsSync(filePath)).toBe(true);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  expect(parsed.entries).toEqual(env);
});

test('loadSnapshot round-trips a saved snapshot', () => {
  const env = { X: 'hello' };
  const filePath = saveSnapshot(env, tmpDir);
  const snap = loadSnapshot(filePath);
  expect(snap.entries).toEqual(env);
});

test('diffSnapshots detects added, removed, changed, unchanged', () => {
  const snapA = buildSnapshot({ A: '1', B: '2', C: '3' });
  const snapB = buildSnapshot({ A: '1', B: 'changed', D: '4' });
  const diff = diffSnapshots(snapA, snapB);
  expect(diff.added).toContain('D');
  expect(diff.removed).toContain('C');
  expect(diff.changed).toContain('B');
  expect(diff.unchanged).toContain('A');
});

test('listSnapshots returns sorted file names', () => {
  saveSnapshot({ A: '1' }, tmpDir, 'alpha');
  saveSnapshot({ B: '2' }, tmpDir, 'beta');
  const list = listSnapshots(tmpDir);
  expect(list.length).toBe(2);
  expect(list.every(f => f.endsWith('.json'))).toBe(true);
});

test('listSnapshots returns empty array when dir missing', () => {
  expect(listSnapshots('/nonexistent/path')).toEqual([]);
});
