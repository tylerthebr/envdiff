const { lintEntry, lintEnv, hasLintErrors } = require('./linter');

describe('lintEntry', () => {
  it('returns no issues for a clean entry', () => {
    expect(lintEntry('DATABASE_URL', 'postgres://localhost/db')).toEqual([]);
  });

  it('flags lowercase key', () => {
    const issues = lintEntry('database_url', 'value');
    expect(issues).toContain('Key "database_url" should be UPPER_SNAKE_CASE');
  });

  it('flags mixed case key', () => {
    const issues = lintEntry('MyKey', 'value');
    expect(issues.length).toBeGreaterThan(0);
  });

  it('flags trailing whitespace in value', () => {
    const issues = lintEntry('API_KEY', 'abc123   ');
    expect(issues).toContain('Value for "API_KEY" has trailing whitespace');
  });

  it('flags quoted value', () => {
    const issues = lintEntry('SECRET', '"mysecret"');
    expect(issues).toContain('Value for "SECRET" has unnecessary surrounding quotes');
  });

  it('flags single-quoted value', () => {
    const issues = lintEntry('TOKEN', "'tok123'");
    expect(issues.some(i => i.includes('quotes'))).toBe(true);
  });

  it('flags empty value', () => {
    const issues = lintEntry('EMPTY_KEY', '');
    expect(issues).toContain('Value for "EMPTY_KEY" is empty');
  });

  it('can return multiple issues', () => {
    const issues = lintEntry('badKey', '"value"  ');
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });
});

describe('lintEnv', () => {
  it('returns empty array when all entries are clean', () => {
    const env = { API_URL: 'https://example.com', PORT: '3000' };
    expect(lintEnv(env)).toEqual([]);
  });

  it('returns results only for problematic keys', () => {
    const env = { GOOD_KEY: 'value', badKey: 'value' };
    const results = lintEnv(env);
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('badKey');
  });

  it('includes all issues per key', () => {
    const env = { bad_key: '' };
    const results = lintEnv(env);
    expect(results[0].issues.length).toBeGreaterThanOrEqual(2);
  });
});

describe('hasLintErrors', () => {
  it('returns false for empty results', () => {
    expect(hasLintErrors([])).toBe(false);
  });

  it('returns true when there are results', () => {
    expect(hasLintErrors([{ key: 'x', issues: ['oops'] }])).toBe(true);
  });
});
