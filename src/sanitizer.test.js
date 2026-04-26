const { trimEntry, unquoteValue, normalizeKey, sanitizeEntry, sanitizeEnv } = require('./sanitizer');

describe('trimEntry', () => {
  it('trims whitespace from key and value', () => {
    expect(trimEntry({ key: '  FOO  ', value: '  bar  ' })).toEqual({ key: 'FOO', value: 'bar' });
  });

  it('leaves already-trimmed entries unchanged', () => {
    expect(trimEntry({ key: 'KEY', value: 'val' })).toEqual({ key: 'KEY', value: 'val' });
  });
});

describe('unquoteValue', () => {
  it('removes double quotes', () => {
    expect(unquoteValue('"hello"')).toBe('hello');
  });

  it('removes single quotes', () => {
    expect(unquoteValue("'world'")).toBe('world');
  });

  it('leaves unquoted values unchanged', () => {
    expect(unquoteValue('plain')).toBe('plain');
  });

  it('does not strip mismatched quotes', () => {
    expect(unquoteValue('"mixed\'')).toBe('"mixed\'');
  });

  it('handles empty quoted string', () => {
    expect(unquoteValue('""')).toBe('');
  });
});

describe('normalizeKey', () => {
  it('uppercases a key', () => {
    expect(normalizeKey('db_host')).toBe('DB_HOST');
  });

  it('leaves already-uppercase key unchanged', () => {
    expect(normalizeKey('API_KEY')).toBe('API_KEY');
  });
});

describe('sanitizeEntry', () => {
  it('trims, unquotes, and normalizes', () => {
    expect(sanitizeEntry({ key: '  api_key  ', value: '  "secret123"  ' })).toEqual({
      key: 'API_KEY',
      value: 'secret123',
    });
  });
});

describe('sanitizeEnv', () => {
  it('sanitizes all entries in an env object', () => {
    const input = {
      '  db_host  ': '  "localhost"  ',
      port: "'3000'",
      DEBUG: 'true',
    };
    expect(sanitizeEnv(input)).toEqual({
      DB_HOST: 'localhost',
      PORT: '3000',
      DEBUG: 'true',
    });
  });

  it('returns empty object for empty input', () => {
    expect(sanitizeEnv({})).toEqual({});
  });
});
