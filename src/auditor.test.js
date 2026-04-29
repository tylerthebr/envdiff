'use strict';

const { buildAuditEntry, auditEnvs, filterAuditLog, buildAuditLog, toAction } = require('./auditor');

describe('toAction', () => {
  it('maps known statuses', () => {
    expect(toAction('added')).toBe('ADDED');
    expect(toAction('removed')).toBe('REMOVED');
    expect(toAction('changed')).toBe('CHANGED');
    expect(toAction('unchanged')).toBe('UNCHANGED');
  });

  it('returns UNKNOWN for unknown status', () => {
    expect(toAction('weird')).toBe('UNKNOWN');
  });
});

describe('buildAuditEntry', () => {
  it('creates an entry with all fields', () => {
    const entry = buildAuditEntry('KEY', 'old', 'new', 'changed');
    expect(entry.key).toBe('KEY');
    expect(entry.action).toBe('CHANGED');
    expect(entry.prev).toBe('old');
    expect(entry.next).toBe('new');
    expect(entry.timestamp).toBeTruthy();
  });

  it('sets prev/next to null when undefined', () => {
    const entry = buildAuditEntry('KEY', undefined, undefined, 'added');
    expect(entry.prev).toBeNull();
    expect(entry.next).toBeNull();
  });
});

describe('auditEnvs', () => {
  it('returns audit entries for all keys', () => {
    const prev = { A: '1', B: '2' };
    const next = { A: '1', C: '3' };
    const entries = auditEnvs(prev, next);
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
    const keys = entries.map(e => e.key);
    expect(keys).toContain('A');
  });
});

describe('filterAuditLog', () => {
  const entries = [
    { key: 'A', action: 'ADDED' },
    { key: 'B', action: 'REMOVED' },
    { key: 'C', action: 'CHANGED' },
  ];

  it('returns all entries when no filter', () => {
    expect(filterAuditLog(entries, []).length).toBe(3);
  });

  it('filters by action', () => {
    const result = filterAuditLog(entries, ['added']);
    expect(result.length).toBe(1);
    expect(result[0].key).toBe('A');
  });
});

describe('buildAuditLog', () => {
  it('returns total and shown counts', () => {
    const prev = { A: '1', B: '2' };
    const next = { A: '9', C: '3' };
    const log = buildAuditLog(prev, next);
    expect(log.total).toBeGreaterThan(0);
    expect(log.shown).toBe(log.total);
    expect(Array.isArray(log.entries)).toBe(true);
  });

  it('respects action filter option', () => {
    const prev = { A: '1' };
    const next = { A: '2', B: '3' };
    const log = buildAuditLog(prev, next, { actions: ['changed'] });
    expect(log.entries.every(e => e.action === 'CHANGED')).toBe(true);
  });
});
