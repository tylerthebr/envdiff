const { fullMask, partialMask, maskEntry, maskEnv, maskByPattern, canPartialMask } = require('./masker');

describe('canPartialMask', () => {
  it('returns true for long enough strings', () => {
    expect(canPartialMask('supersecretvalue')).toBe(true);
  });

  it('returns false for short strings', () => {
    expect(canPartialMask('abc')).toBe(false);
  });

  it('returns false for non-strings', () => {
    expect(canPartialMask(null)).toBe(false);
  });
});

describe('fullMask', () => {
  it('masks any non-empty value', () => {
    expect(fullMask('mysecret')).toBe('****');
  });

  it('masks empty string', () => {
    expect(fullMask('')).toBe('****');
  });
});

describe('partialMask', () => {
  it('reveals last 4 chars of a long value', () => {
    expect(partialMask('supersecretABCD')).toBe('****ABCD');
  });

  it('falls back to full mask for short values', () => {
    expect(partialMask('ab')).toBe('****');
  });
});

describe('maskEntry', () => {
  const entry = { key: 'API_KEY', value: 'topsecretvalue1234' };

  it('fully masks by default', () => {
    const result = maskEntry(entry);
    expect(result.value).toBe('****');
    expect(result.masked).toBe(true);
  });

  it('partially masks when mode is partial', () => {
    const result = maskEntry(entry, 'partial');
    expect(result.value).toMatch(/^\*{4}/);
    expect(result.masked).toBe(true);
  });

  it('preserves the key', () => {
    const result = maskEntry(entry);
    expect(result.key).toBe('API_KEY');
  });
});

describe('maskEnv', () => {
  const entries = [
    { key: 'SECRET', value: 'abc123' },
    { key: 'TOKEN', value: 'xyz789longvalue' },
  ];

  it('masks all entries', () => {
    const result = maskEnv(entries);
    expect(result.every(e => e.masked)).toBe(true);
    expect(result.every(e => e.value === '****')).toBe(true);
  });

  it('returns empty array for non-array input', () => {
    expect(maskEnv(null)).toEqual([]);
  });
});

describe('maskByPattern', () => {
  const entries = [
    { key: 'API_KEY', value: 'secret123longval' },
    { key: 'APP_NAME', value: 'myapp' },
    { key: 'DB_PASSWORD', value: 'dbpassword9999' },
  ];

  it('masks only matching keys', () => {
    const result = maskByPattern(entries, 'KEY|PASSWORD');
    const masked = result.filter(e => e.masked);
    const unmasked = result.filter(e => !e.masked);
    expect(masked.map(e => e.key)).toEqual(['API_KEY', 'DB_PASSWORD']);
    expect(unmasked[0].key).toBe('APP_NAME');
    expect(unmasked[0].value).toBe('myapp');
  });

  it('returns empty array for non-array input', () => {
    expect(maskByPattern(null, 'KEY')).toEqual([]);
  });
});
