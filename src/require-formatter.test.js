const { formatMissingReq, formatEmptyReq, formatOkReq, formatRequireSummary, formatRequireReport } = require('./require-formatter');
const { strip } = require('./colors');

describe('formatMissingReq', () => {
  it('includes MISSING label and key', () => {
    const out = strip(formatMissingReq({ key: 'DB_URL', description: '' }));
    expect(out).toContain('MISSING');
    expect(out).toContain('DB_URL');
  });

  it('includes description when provided', () => {
    const out = strip(formatMissingReq({ key: 'SECRET', description: 'App secret' }));
    expect(out).toContain('App secret');
  });
});

describe('formatEmptyReq', () => {
  it('includes EMPTY label and key', () => {
    const out = strip(formatEmptyReq({ key: 'PORT', description: '' }));
    expect(out).toContain('EMPTY');
    expect(out).toContain('PORT');
  });
});

describe('formatOkReq', () => {
  it('includes OK label and key', () => {
    const out = strip(formatOkReq({ key: 'HOST', description: '' }));
    expect(out).toContain('OK');
    expect(out).toContain('HOST');
  });
});

describe('formatRequireSummary', () => {
  it('shows counts for all categories', () => {
    const result = {
      ok: [{ key: 'A' }],
      empty: [{ key: 'B' }],
      missing: [{ key: 'C' }, { key: 'D' }],
      total: 4
    };
    const out = strip(formatRequireSummary(result));
    expect(out).toContain('1 ok');
    expect(out).toContain('1 empty');
    expect(out).toContain('2 missing');
    expect(out).toContain('/ 4 required');
  });
});

describe('formatRequireReport', () => {
  it('produces a full report string', () => {
    const result = {
      missing: [{ key: 'SECRET', description: 'App secret' }],
      empty: [{ key: 'PORT', description: '' }],
      ok: [{ key: 'HOST', description: '' }],
      total: 3
    };
    const out = strip(formatRequireReport('.env.production', result));
    expect(out).toContain('.env.production');
    expect(out).toContain('SECRET');
    expect(out).toContain('PORT');
    expect(out).toContain('HOST');
    expect(out).toContain('Summary');
  });
});
