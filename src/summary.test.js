import { countByStatus, pct, buildSummary, hasIssues } from './summary.js';

const makeEntries = (statuses) =>
  statuses.map((status, i) => ({ key: `KEY_${i}`, status }));

describe('countByStatus', () => {
  test('counts each status correctly', () => {
    const entries = makeEntries(['ok', 'missing', 'missing', 'mismatch']);
    expect(countByStatus(entries)).toEqual({ ok: 1, missing: 2, mismatch: 1 });
  });

  test('returns zeros when no entries', () => {
    expect(countByStatus([])).toEqual({ ok: 0, missing: 0, mismatch: 0 });
  });

  test('handles all ok', () => {
    const entries = makeEntries(['ok', 'ok', 'ok']);
    expect(countByStatus(entries)).toEqual({ ok: 3, missing: 0, mismatch: 0 });
  });
});

describe('pct', () => {
  test('calculates percentage correctly', () => {
    expect(pct(1, 4)).toBe('25.0%');
    expect(pct(2, 4)).toBe('50.0%');
    expect(pct(4, 4)).toBe('100.0%');
  });

  test('returns 0.0% when total is zero', () => {
    expect(pct(0, 0)).toBe('0.0%');
  });
});

describe('buildSummary', () => {
  test('builds summary object with counts and percentages', () => {
    const entries = makeEntries(['ok', 'missing', 'mismatch', 'ok']);
    const summary = buildSummary(entries);
    expect(summary.total).toBe(4);
    expect(summary.ok).toBe(2);
    expect(summary.missing).toBe(1);
    expect(summary.mismatch).toBe(1);
    expect(summary.okPct).toBe('50.0%');
    expect(summary.missingPct).toBe('25.0%');
    expect(summary.mismatchPct).toBe('25.0%');
  });

  test('summary with empty entries', () => {
    const summary = buildSummary([]);
    expect(summary.total).toBe(0);
    expect(summary.okPct).toBe('0.0%');
  });
});

describe('hasIssues', () => {
  test('returns true when there are missing keys', () => {
    const entries = makeEntries(['ok', 'missing']);
    expect(hasIssues(buildSummary(entries))).toBe(true);
  });

  test('returns true when there are mismatched keys', () => {
    const entries = makeEntries(['ok', 'mismatch']);
    expect(hasIssues(buildSummary(entries))).toBe(true);
  });

  test('returns false when all keys are ok', () => {
    const entries = makeEntries(['ok', 'ok']);
    expect(hasIssues(buildSummary(entries))).toBe(false);
  });
});
