const {
  isDeprecated,
  buildDeprecationEntry,
  scanDeprecations,
  getDeprecatedEntries,
  hasDeprecations,
} = require('./deprecator');

const MAP = {
  OLD_DB_URL: 'DATABASE_URL',
  LEGACY_SECRET: null,
};

describe('isDeprecated', () => {
  it('returns deprecated=true and replacement for a known old key', () => {
    expect(isDeprecated('OLD_DB_URL', MAP)).toEqual({ deprecated: true, replacement: 'DATABASE_URL' });
  });

  it('returns deprecated=true and null replacement when no successor', () => {
    expect(isDeprecated('LEGACY_SECRET', MAP)).toEqual({ deprecated: true, replacement: null });
  });

  it('returns deprecated=false for an active key', () => {
    expect(isDeprecated('DATABASE_URL', MAP)).toEqual({ deprecated: false, replacement: null });
  });
});

describe('buildDeprecationEntry', () => {
  it('builds a full entry for a deprecated key', () => {
    const entry = buildDeprecationEntry('OLD_DB_URL', 'postgres://localhost', MAP);
    expect(entry).toEqual({ key: 'OLD_DB_URL', value: 'postgres://localhost', deprecated: true, replacement: 'DATABASE_URL' });
  });

  it('builds a non-deprecated entry for an active key', () => {
    const entry = buildDeprecationEntry('PORT', '3000', MAP);
    expect(entry.deprecated).toBe(false);
    expect(entry.replacement).toBeNull();
  });
});

describe('scanDeprecations', () => {
  const env = { OLD_DB_URL: 'postgres://localhost', PORT: '3000', LEGACY_SECRET: 'abc' };

  it('returns an entry for every key', () => {
    const entries = scanDeprecations(env, MAP);
    expect(entries).toHaveLength(3);
  });

  it('marks deprecated keys correctly', () => {
    const entries = scanDeprecations(env, MAP);
    const deprecated = entries.filter(e => e.deprecated);
    expect(deprecated.map(e => e.key)).toEqual(expect.arrayContaining(['OLD_DB_URL', 'LEGACY_SECRET']));
  });
});

describe('getDeprecatedEntries', () => {
  it('filters to only deprecated entries', () => {
    const entries = [
      { key: 'OLD_DB_URL', deprecated: true },
      { key: 'PORT', deprecated: false },
    ];
    expect(getDeprecatedEntries(entries)).toHaveLength(1);
    expect(getDeprecatedEntries(entries)[0].key).toBe('OLD_DB_URL');
  });
});

describe('hasDeprecations', () => {
  it('returns true when deprecated entries exist', () => {
    expect(hasDeprecations([{ deprecated: true }, { deprecated: false }])).toBe(true);
  });

  it('returns false when no deprecated entries', () => {
    expect(hasDeprecations([{ deprecated: false }])).toBe(false);
  });
});
