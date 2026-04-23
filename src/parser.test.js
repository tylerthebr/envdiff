const { parseEnv } = require('./parser');

describe('parseEnv', () => {
  test('parses simple key=value pairs', () => {
    const input = 'FOO=bar\nBAZ=qux';
    expect(parseEnv(input)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('ignores comment lines', () => {
    const input = '# This is a comment\nFOO=bar';
    expect(parseEnv(input)).toEqual({ FOO: 'bar' });
  });

  test('ignores blank lines', () => {
    const input = 'FOO=bar\n\nBAZ=qux\n';
    expect(parseEnv(input)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('strips double quotes from values', () => {
    const input = 'FOO="hello world"';
    expect(parseEnv(input)).toEqual({ FOO: 'hello world' });
  });

  test('strips single quotes from values', () => {
    const input = "FOO='hello world'";
    expect(parseEnv(input)).toEqual({ FOO: 'hello world' });
  });

  test('handles values with equals signs', () => {
    const input = 'DATABASE_URL=postgres://user:pass@host/db?ssl=true';
    expect(parseEnv(input)).toEqual({
      DATABASE_URL: 'postgres://user:pass@host/db?ssl=true',
    });
  });

  test('handles empty values', () => {
    const input = 'EMPTY=';
    expect(parseEnv(input)).toEqual({ EMPTY: '' });
  });

  test('skips lines without an equals sign', () => {
    const input = 'INVALID_LINE\nFOO=bar';
    expect(parseEnv(input)).toEqual({ FOO: 'bar' });
  });

  test('returns empty object for empty string', () => {
    expect(parseEnv('')).toEqual({});
  });

  test('returns empty object for null/undefined input', () => {
    expect(parseEnv(null)).toEqual({});
    expect(parseEnv(undefined)).toEqual({});
  });

  test('handles Windows-style line endings', () => {
    const input = 'FOO=bar\r\nBAZ=qux';
    expect(parseEnv(input)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});
