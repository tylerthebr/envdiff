const {
  formatSnapshotHeader, formatDiffSection,
  formatSnapshotDiff, formatSnapshotSummary
} = require('./snapshot-formatter');
const { buildSnapshot, diffSnapshots } = require('./snapshotter');

const snapA = buildSnapshot({ A: '1', B: '2', C: '3' }, 'v1');
const snapB = buildSnapshot({ A: '1', B: 'new', D: '4' }, 'v2');
const diff = diffSnapshots(snapA, snapB);

test('formatSnapshotHeader includes labels', () => {
  const out = formatSnapshotHeader(snapA, snapB);
  expect(out).toContain('v1');
  expect(out).toContain('v2');
});

test('formatDiffSection returns empty string for empty list', () => {
  expect(formatDiffSection('Added', [], 'green')).toBe('');
});

test('formatDiffSection lists keys', () => {
  const out = formatDiffSection('Removed', ['FOO', 'BAR'], 'red');
  expect(out).toContain('FOO');
  expect(out).toContain('BAR');
  expect(out).toContain('Removed');
});

test('formatSnapshotDiff includes all sections', () => {
  const out = formatSnapshotDiff(snapA, snapB, diff);
  expect(out).toContain('D');   // added
  expect(out).toContain('C');   // removed
  expect(out).toContain('B');   // changed
  expect(out).toContain('A');   // unchanged
});

test('formatSnapshotSummary shows counts', () => {
  const out = formatSnapshotSummary(diff);
  expect(out).toContain('1 added');
  expect(out).toContain('1 removed');
  expect(out).toContain('1 changed');
  expect(out).toContain('1 unchanged');
});
