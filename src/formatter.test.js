const {
  colorize,
  formatMissingKey,
  formatMismatchedKey,
  formatOkKey,
  formatHeader,
  formatSummary,
} = require('./formatter');

describe('colorize', () => {
  test('wraps text with ANSI color codes', () => {
    const result = colorize('hello', 'red');
    expect(result).toContain('hello');
    expect(result).toContain('\x1b[31m');
    expect(result).toContain('\x1b[0m');
  });
});

describe('formatMissingKey', () => {
  test('includes key name and env name', () => {
    const result = formatMissingKey('DB_HOST', '.env.prod');
    expect(result).toContain('DB_HOST');
    expect(result).toContain('.env.prod');
    expect(result).toContain('missing in');
  });
});

describe('formatMismatchedKey', () => {
  test('shows key and all env values', () => {
    const result = formatMismatchedKey('NODE_ENV', {
      '.env.dev': 'development',
      '.env.prod': 'production',
    });
    expect(result).toContain('NODE_ENV');
    expect(result).toContain('.env.dev');
    expect(result).toContain('development');
    expect(result).toContain('.env.prod');
    expect(result).toContain('production');
  });
});

describe('formatOkKey', () => {
  test('includes key name and check mark', () => {
    const result = formatOkKey('API_KEY');
    expect(result).toContain('API_KEY');
    expect(result).toContain('✓');
  });
});

describe('formatHeader', () => {
  test('includes title text', () => {
    const result = formatHeader('Comparison Result');
    expect(result).toContain('Comparison Result');
  });
});

describe('formatSummary', () => {
  test('includes counts for all categories', () => {
    const result = formatSummary(2, 1, 5);
    expect(result).toContain('2');
    expect(result).toContain('1');
    expect(result).toContain('5');
    expect(result).toContain('ok');
    expect(result).toContain('mismatched');
    expect(result).toContain('missing');
  });
});
