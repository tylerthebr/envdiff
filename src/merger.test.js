const { mergeEnvs, commonKeys, incompleteKeys } = require('./merger');

const envA = { DB_HOST: 'localhost', DB_PORT: '5432', SECRET: 'abc' };
const envB = { DB_HOST: 'prod-host', DB_PORT: '5432', API_KEY: 'xyz' };
const envC = { DB_HOST: 'stage-host', SECRET: 'def', API_KEY: 'uvw' };

describe('mergeEnvs', () => {
  it('collects all unique keys', () => {
    const merged = mergeEnvs({ a: envA, b: envB });
    expect(Object.keys(merged).sort()).toEqual(
      ['API_KEY', 'DB_HOST', 'DB_PORT', 'SECRET'].sort()
    );
  });

  it('maps defined values correctly', () => {
    const merged = mergeEnvs({ a: envA, b: envB });
    expect(merged['DB_HOST']).toEqual({ a: 'localhost', b: 'prod-host' });
  });

  it('uses undefined for missing keys', () => {
    const merged = mergeEnvs({ a: envA, b: envB });
    expect(merged['SECRET']['b']).toBeUndefined();
    expect(merged['API_KEY']['a']).toBeUndefined();
  });

  it('handles three environments', () => {
    const merged = mergeEnvs({ a: envA, b: envB, c: envC });
    expect(Object.keys(merged)).toHaveLength(4);
    expect(merged['DB_PORT']['c']).toBeUndefined();
  });

  it('returns empty object for empty input', () => {
    expect(mergeEnvs({})).toEqual({});
  });
});

describe('commonKeys', () => {
  it('returns keys present in all envs', () => {
    const merged = mergeEnvs({ a: envA, b: envB });
    expect(commonKeys(merged, ['a', 'b'])).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('returns empty when no shared keys', () => {
    const merged = mergeEnvs({ a: { X: '1' }, b: { Y: '2' } });
    expect(commonKeys(merged, ['a', 'b'])).toEqual([]);
  });
});

describe('incompleteKeys', () => {
  it('returns keys missing from at least one env', () => {
    const merged = mergeEnvs({ a: envA, b: envB });
    const result = incompleteKeys(merged, ['a', 'b']);
    expect(result.sort()).toEqual(['API_KEY', 'SECRET'].sort());
  });

  it('returns empty when all keys are complete', () => {
    const merged = mergeEnvs({ a: { X: '1' }, b: { X: '2' } });
    expect(incompleteKeys(merged, ['a', 'b'])).toEqual([]);
  });
});
