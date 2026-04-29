const { parseRequirements, findMissingRequired, findEmptyRequired, checkRequirements, allRequiredPresent } = require('./requirer');

describe('parseRequirements', () => {
  it('handles string entries', () => {
    const result = parseRequirements(['FOO', 'BAR']);
    expect(result).toEqual([
      { key: 'FOO', description: '' },
      { key: 'BAR', description: '' }
    ]);
  });

  it('handles object entries', () => {
    const result = parseRequirements([{ key: 'DB_URL', description: 'Database URL' }]);
    expect(result[0]).toEqual({ key: 'DB_URL', description: 'Database URL' });
  });

  it('defaults description to empty string', () => {
    const result = parseRequirements([{ key: 'SECRET' }]);
    expect(result[0].description).toBe('');
  });
});

describe('findMissingRequired', () => {
  const reqs = [{ key: 'FOO', description: '' }, { key: 'BAR', description: '' }];

  it('finds missing keys', () => {
    const env = { FOO: 'hello' };
    const missing = findMissingRequired(env, reqs);
    expect(missing.map(r => r.key)).toEqual(['BAR']);
  });

  it('returns empty array when all present', () => {
    const env = { FOO: 'a', BAR: 'b' };
    expect(findMissingRequired(env, reqs)).toHaveLength(0);
  });
});

describe('findEmptyRequired', () => {
  const reqs = [{ key: 'FOO', description: '' }, { key: 'BAR', description: '' }];

  it('finds empty values', () => {
    const env = { FOO: '', BAR: 'value' };
    const empty = findEmptyRequired(env, reqs);
    expect(empty.map(r => r.key)).toEqual(['FOO']);
  });

  it('treats whitespace-only as empty', () => {
    const env = { FOO: '   ', BAR: 'ok' };
    expect(findEmptyRequired(env, reqs).map(r => r.key)).toEqual(['FOO']);
  });
});

describe('checkRequirements', () => {
  const spec = ['HOST', 'PORT', 'SECRET'];

  it('categorizes keys correctly', () => {
    const env = { HOST: 'localhost', PORT: '', EXTRA: 'x' };
    const result = checkRequirements(env, spec);
    expect(result.missing.map(r => r.key)).toEqual(['SECRET']);
    expect(result.empty.map(r => r.key)).toEqual(['PORT']);
    expect(result.ok.map(r => r.key)).toEqual(['HOST']);
    expect(result.total).toBe(3);
  });
});

describe('allRequiredPresent', () => {
  it('returns true when all keys present and non-empty', () => {
    expect(allRequiredPresent({ A: '1', B: '2' }, ['A', 'B'])).toBe(true);
  });

  it('returns false when a key is missing', () => {
    expect(allRequiredPresent({ A: '1' }, ['A', 'B'])).toBe(false);
  });

  it('returns false when a key is empty', () => {
    expect(allRequiredPresent({ A: '1', B: '' }, ['A', 'B'])).toBe(false);
  });
});
