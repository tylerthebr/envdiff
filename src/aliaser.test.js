const { buildAlias, parseAliases, applyAliases, buildReverseMap } = require('./aliaser');

describe('buildAlias', () => {
  it('creates an alias object', () => {
    expect(buildAlias('OLD_KEY', 'NEW_KEY')).toEqual({ oldKey: 'OLD_KEY', newKey: 'NEW_KEY' });
  });

  it('trims whitespace from keys', () => {
    expect(buildAlias('  FOO ', ' BAR ')).toEqual({ oldKey: 'FOO', newKey: 'BAR' });
  });
});

describe('parseAliases', () => {
  it('parses OLD=NEW strings into alias objects', () => {
    const result = parseAliases(['DB_HOST=DATABASE_HOST', 'API_KEY=SERVICE_API_KEY']);
    expect(result).toEqual([
      { oldKey: 'DB_HOST', newKey: 'DATABASE_HOST' },
      { oldKey: 'API_KEY', newKey: 'SERVICE_API_KEY' }
    ]);
  });

  it('ignores entries without an equals sign', () => {
    const result = parseAliases(['INVALID', 'FOO=BAR']);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ oldKey: 'FOO', newKey: 'BAR' });
  });

  it('handles value containing equals sign', () => {
    const result = parseAliases(['FOO=BAR=BAZ']);
    expect(result[0]).toEqual({ oldKey: 'FOO', newKey: 'BAR=BAZ' });
  });

  it('returns empty array for empty input', () => {
    expect(parseAliases([])).toEqual([]);
  });
});

describe('applyAliases', () => {
  const env = { DB_HOST: 'localhost', PORT: '3000', SECRET: 'abc' };

  it('renames keys that exist in the env', () => {
    const aliases = [{ oldKey: 'DB_HOST', newKey: 'DATABASE_HOST' }];
    const { env: result } = applyAliases(env, aliases);
    expect(result.DATABASE_HOST).toBe('localhost');
    expect(result.DB_HOST).toBeUndefined();
  });

  it('tracks applied aliases', () => {
    const aliases = [{ oldKey: 'PORT', newKey: 'APP_PORT' }];
    const { applied } = applyAliases(env, aliases);
    expect(applied).toContain('PORT');
  });

  it('tracks keys not found in env', () => {
    const aliases = [{ oldKey: 'MISSING_KEY', newKey: 'NEW_KEY' }];
    const { notFound } = applyAliases(env, aliases);
    expect(notFound).toContain('MISSING_KEY');
  });

  it('does not mutate the original env', () => {
    const original = { FOO: 'bar' };
    applyAliases(original, [{ oldKey: 'FOO', newKey: 'BAZ' }]);
    expect(original.FOO).toBe('bar');
  });

  it('applies multiple aliases', () => {
    const aliases = [
      { oldKey: 'DB_HOST', newKey: 'DATABASE_HOST' },
      { oldKey: 'SECRET', newKey: 'APP_SECRET' }
    ];
    const { env: result, applied } = applyAliases(env, aliases);
    expect(result.DATABASE_HOST).toBe('localhost');
    expect(result.APP_SECRET).toBe('abc');
    expect(applied).toHaveLength(2);
  });
});

describe('buildReverseMap', () => {
  it('builds a newKey -> oldKey map', () => {
    const aliases = [
      { oldKey: 'DB_HOST', newKey: 'DATABASE_HOST' },
      { oldKey: 'API_KEY', newKey: 'SERVICE_API_KEY' }
    ];
    const map = buildReverseMap(aliases);
    expect(map.DATABASE_HOST).toBe('DB_HOST');
    expect(map.SERVICE_API_KEY).toBe('API_KEY');
  });

  it('returns empty object for no aliases', () => {
    expect(buildReverseMap([])).toEqual({});
  });
});
