const { validateKey, findWarnings, findDuplicateKeys, validateEnv } = require('./validator');

describe('validateKey', () => {
  test('accepts valid keys', () => {
    expect(validateKey('MY_VAR').valid).toBe(true);
    expect(validateKey('_PRIVATE').valid).toBe(true);
    expect(validateKey('var123').valid).toBe(true);
  });

  test('rejects empty key', () => {
    const r = validateKey('');
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/empty/);
  });

  test('rejects keys with invalid characters', () => {
    const r = validateKey('MY-VAR');
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/invalid characters/);
  });

  test('rejects keys starting with a digit', () => {
    expect(validateKey('1VAR').valid).toBe(false);
  });
});

describe('findWarnings', () => {
  test('returns empty array for clean env', () => {
    const warnings = findWarnings({ API_KEY: 'abc123', PORT: '3000' });
    expect(warnings).toHaveLength(0);
  });

  test('warns on empty string value', () => {
    const warnings = findWarnings({ EMPTY: '' });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].warning).toMatch(/empty string/);
  });

  test('warns on value with leading whitespace', () => {
    const warnings = findWarnings({ SPACED: '  hello' });
    expect(warnings[0].warning).toMatch(/whitespace/);
  });

  test('warns on value with trailing whitespace', () => {
    const warnings = findWarnings({ SPACED: 'hello  ' });
    expect(warnings[0].warning).toMatch(/whitespace/);
  });

  test('does not warn on trimmed non-empty value', () => {
    expect(findWarnings({ OK: 'value' })).toHaveLength(0);
  });
});

describe('findDuplicateKeys', () => {
  test('returns empty array when no duplicates', () => {
    const raw = 'A=1\nB=2\nC=3';
    expect(findDuplicateKeys(raw)).toEqual([]);
  });

  test('detects duplicated key', () => {
    const raw = 'A=1\nB=2\nA=3';
    expect(findDuplicateKeys(raw)).toContain('A');
  });

  test('ignores comment lines', () => {
    const raw = '# A=1\nA=2';
    expect(findDuplicateKeys(raw)).toEqual([]);
  });
});

describe('validateEnv', () => {
  test('returns combined result', () => {
    const raw = 'PORT=3000\nPORT=4000\nEMPTY=';
    const map = { PORT: '4000', EMPTY: '' };
    const result = validateEnv(map, raw);
    expect(result.duplicates).toContain('PORT');
    expect(result.warnings.some(w => w.key === 'EMPTY')).toBe(true);
  });
});
