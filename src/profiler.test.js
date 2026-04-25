const { classifyType, profileEntry, profileEnv, typeSummary } = require('./profiler');

describe('classifyType', () => {
  test('empty string', () => expect(classifyType('')).toBe('empty'));
  test('boolean true', () => expect(classifyType('true')).toBe('boolean'));
  test('boolean FALSE', () => expect(classifyType('FALSE')).toBe('boolean'));
  test('integer', () => expect(classifyType('42')).toBe('integer'));
  test('negative integer', () => expect(classifyType('-7')).toBe('integer'));
  test('float', () => expect(classifyType('3.14')).toBe('float'));
  test('url', () => expect(classifyType('https://example.com')).toBe('url'));
  test('email', () => expect(classifyType('user@example.com')).toBe('email'));
  test('date', () => expect(classifyType('2024-01-15')).toBe('date'));
  test('list', () => expect(classifyType('a,b,c')).toBe('list'));
  test('secret (long alphanumeric)', () => {
    expect(classifyType('abcdefghijklmnopqrstuvwxyz012345')).toBe('secret');
  });
  test('plain string', () => expect(classifyType('hello world')).toBe('string'));
});

describe('profileEntry', () => {
  test('returns key, value, type, length', () => {
    const result = profileEntry({ key: 'PORT', value: '3000' });
    expect(result).toEqual({ key: 'PORT', value: '3000', type: 'integer', length: 4 });
  });

  test('empty value', () => {
    const result = profileEntry({ key: 'EMPTY', value: '' });
    expect(result.type).toBe('empty');
    expect(result.length).toBe(0);
  });
});

describe('profileEnv', () => {
  test('profiles all entries in env map', () => {
    const env = { PORT: '8080', DEBUG: 'true', HOST: 'localhost' };
    const profile = profileEnv(env);
    expect(profile).toHaveLength(3);
    expect(profile.find(e => e.key === 'PORT').type).toBe('integer');
    expect(profile.find(e => e.key === 'DEBUG').type).toBe('boolean');
    expect(profile.find(e => e.key === 'HOST').type).toBe('string');
  });

  test('empty env returns empty array', () => {
    expect(profileEnv({})).toEqual([]);
  });
});

describe('typeSummary', () => {
  test('counts types correctly', () => {
    const profile = [
      { type: 'integer' },
      { type: 'string' },
      { type: 'integer' },
      { type: 'boolean' },
    ];
    expect(typeSummary(profile)).toEqual({ integer: 2, string: 1, boolean: 1 });
  });

  test('empty profile', () => {
    expect(typeSummary([])).toEqual({});
  });
});
