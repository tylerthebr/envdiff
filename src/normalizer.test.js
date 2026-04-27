import { normalizeBool, normalizeNumber, stripQuotes, normalizeValue, normalizeEntry, normalizeEnv } from './normalizer.js';

describe('normalizeBool', () => {
  test('normalizes true variants to "true"', () => {
    expect(normalizeBool('true')).toBe('true');
    expect(normalizeBool('True')).toBe('true');
    expect(normalizeBool('TRUE')).toBe('true');
    expect(normalizeBool('1')).toBe('true');
    expect(normalizeBool('yes')).toBe('true');
    expect(normalizeBool('YES')).toBe('true');
  });

  test('normalizes false variants to "false"', () => {
    expect(normalizeBool('false')).toBe('false');
    expect(normalizeBool('False')).toBe('false');
    expect(normalizeBool('FALSE')).toBe('false');
    expect(normalizeBool('0')).toBe('false');
    expect(normalizeBool('no')).toBe('false');
    expect(normalizeBool('NO')).toBe('false');
  });

  test('returns null for non-boolean strings', () => {
    expect(normalizeBool('hello')).toBeNull();
    expect(normalizeBool('2')).toBeNull();
    expect(normalizeBool('')).toBeNull();
  });
});

describe('normalizeNumber', () => {
  test('returns numeric string unchanged', () => {
    expect(normalizeNumber('42')).toBe('42');
    expect(normalizeNumber('3.14')).toBe('3.14');
    expect(normalizeNumber('-7')).toBe('-7');
  });

  test('returns null for non-numeric strings', () => {
    expect(normalizeNumber('abc')).toBeNull();
    expect(normalizeNumber('')).toBeNull();
    expect(normalizeNumber('1a')).toBeNull();
  });
});

describe('stripQuotes', () => {
  test('removes surrounding double quotes', () => {
    expect(stripQuotes('"hello"')).toBe('hello');
  });

  test('removes surrounding single quotes', () => {
    expect(stripQuotes("'world'")).toBe('world');
  });

  test('leaves unquoted strings alone', () => {
    expect(stripQuotes('plain')).toBe('plain');
  });

  test('does not strip mismatched quotes', () => {
    expect(stripQuotes('"mixed\'')).toBe('"mixed\'');
  });
});

describe('normalizeValue', () => {
  test('strips quotes then normalizes booleans', () => {
    expect(normalizeValue('"true"')).toBe('true');
    expect(normalizeValue("'false'")).toBe('false');
  });

  test('returns plain value if no normalization applies', () => {
    expect(normalizeValue('someValue')).toBe('someValue');
  });

  test('normalizes numbers', () => {
    expect(normalizeValue('"42"')).toBe('42');
  });
});

describe('normalizeEntry', () => {
  test('normalizes key and value', () => {
    const entry = { key: 'MY_KEY', value: '"true"', comment: '' };
    const result = normalizeEntry(entry);
    expect(result.key).toBe('MY_KEY');
    expect(result.value).toBe('true');
  });

  test('preserves comment', () => {
    const entry = { key: 'X', value: '1', comment: '# note' };
    expect(normalizeEntry(entry).comment).toBe('# note');
  });
});

describe('normalizeEnv', () => {
  test('normalizes all entries in an env object', () => {
    const env = [
      { key: 'ENABLED', value: "'yes'", comment: '' },
      { key: 'PORT', value: '"8080"', comment: '' },
      { key: 'NAME', value: 'Alice', comment: '' },
    ];
    const result = normalizeEnv(env);
    expect(result[0].value).toBe('true');
    expect(result[1].value).toBe('8080');
    expect(result[2].value).toBe('Alice');
  });

  test('returns empty array for empty input', () => {
    expect(normalizeEnv([])).toEqual([]);
  });
});
