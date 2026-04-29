'use strict';

const { formatAuditEntry, formatAuditHeader, formatAuditSummary, formatAuditReport } = require('./audit-formatter');

const makeEntry = (key, action, prev, next) => ({
  key,
  action,
  prev: prev !== undefined ? prev : null,
  next: next !== undefined ? next : null,
  timestamp: '2024-01-01T00:00:00.000Z',
});

describe('formatAuditEntry', () => {
  it('formats an ADDED entry', () => {
    const e = makeEntry('FOO', 'ADDED', null, 'bar');
    const out = formatAuditEntry(e, false);
    expect(out).toContain('[ADDED]');
    expect(out).toContain('FOO');
    expect(out).toContain('"bar"');
  });

  it('formats a CHANGED entry with prev and next', () => {
    const e = makeEntry('DB', 'CHANGED', 'old', 'new');
    const out = formatAuditEntry(e, false);
    expect(out).toContain('[CHANGED]');
    expect(out).toContain('"old"');
    expect(out).toContain('"new"');
  });

  it('formats a REMOVED entry with n/a for next', () => {
    const e = makeEntry('KEY', 'REMOVED', 'val', null);
    const out = formatAuditEntry(e, false);
    expect(out).toContain('[REMOVED]');
    expect(out).toContain('n/a');
  });

  it('formats an UNCHANGED entry with value only', () => {
    const e = makeEntry('X', 'UNCHANGED', 'same', 'same');
    const out = formatAuditEntry(e, false);
    expect(out).toContain('[UNCHANGED]');
    expect(out).toContain('value:');
  });
});

describe('formatAuditHeader', () => {
  it('includes default label', () => {
    expect(formatAuditHeader()).toContain('Audit Log');
  });

  it('includes custom label', () => {
    expect(formatAuditHeader('My Report')).toContain('My Report');
  });
});

describe('formatAuditSummary', () => {
  it('counts actions correctly', () => {
    const log = {
      total: 3,
      entries: [
        makeEntry('A', 'ADDED', null, '1'),
        makeEntry('B', 'REMOVED', '2', null),
        makeEntry('C', 'ADDED', null, '3'),
      ],
    };
    const out = formatAuditSummary(log);
    expect(out).toContain('ADDED: 2');
    expect(out).toContain('REMOVED: 1');
    expect(out).toContain('total: 3');
  });
});

describe('formatAuditReport', () => {
  it('produces a full report string', () => {
    const log = {
      total: 1,
      shown: 1,
      entries: [makeEntry('PORT', 'CHANGED', '3000', '4000')],
    };
    const out = formatAuditReport(log, { color: false });
    expect(out).toContain('Audit Log');
    expect(out).toContain('PORT');
    expect(out).toContain('Summary');
  });
});
