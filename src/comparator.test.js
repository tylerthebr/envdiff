const { compareEnvs } = require('./comparator');

describe('compareEnvs', () => {
  const base = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    API_KEY: 'secret',
    LOG_LEVEL: 'info',
  };

  test('returns no diff when envs are identical', () => {
    const result = compareEnvs(base, { ...base });
    expect(result.hasDiff).toBe(false);
    expect(result.missingInTarget).toHaveLength(0);
    expect(result.missingInBase).toHaveLength(0);
    expect(result.mismatched).toHaveLength(0);
  });

  test('detects keys missing in target', () => {
    const target = { DB_HOST: 'localhost', DB_PORT: '5432' };
    const result = compareEnvs(base, target);
    expect(result.missingInTarget).toContain('API_KEY');
    expect(result.missingInTarget).toContain('LOG_LEVEL');
    expect(result.hasDiff).toBe(true);
  });

  test('detects extra keys in target not in base', () => {
    const target = { ...base, EXTRA_KEY: 'extra' };
    const result = compareEnvs(base, target);
    expect(result.missingInBase).toContain('EXTRA_KEY');
    expect(result.hasDiff).toBe(true);
  });

  test('detects mismatched values', () => {
    const target = { ...base, DB_HOST: 'prod-server', LOG_LEVEL: 'error' };
    const result = compareEnvs(base, target, 'example', 'production');
    expect(result.mismatched).toHaveLength(2);
    const dbDiff = result.mismatched.find((m) => m.key === 'DB_HOST');
    expect(dbDiff).toBeDefined();
    expect(dbDiff.example).toBe('localhost');
    expect(dbDiff.production).toBe('prod-server');
  });

  test('uses custom env names in result labels', () => {
    const result = compareEnvs(base, { ...base }, 'dev', 'staging');
    expect(result.baseName).toBe('dev');
    expect(result.targetName).toBe('staging');
  });

  test('handles empty envs', () => {
    const result = compareEnvs({}, {});
    expect(result.hasDiff).toBe(false);
  });

  test('handles base with values and empty target', () => {
    const result = compareEnvs(base, {});
    expect(result.missingInTarget).toHaveLength(Object.keys(base).length);
    expect(result.hasDiff).toBe(true);
  });
});
