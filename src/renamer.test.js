const { buildRenameOp, applyRename, applyRenames, envToString } = require('./renamer');

describe('buildRenameOp', () => {
  it('returns op object for valid keys', () => {
    expect(buildRenameOp('OLD', 'NEW')).toEqual({ oldKey: 'OLD', newKey: 'NEW' });
  });

  it('throws if keys are the same', () => {
    expect(() => buildRenameOp('KEY', 'KEY')).toThrow('must differ');
  });

  it('throws if oldKey is missing', () => {
    expect(() => buildRenameOp('', 'NEW')).toThrow('required');
  });
});

describe('applyRename', () => {
  const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_ENV: 'dev' };

  it('renames an existing key', () => {
    const { env: result, changed, conflict } = applyRename(env, { oldKey: 'DB_HOST', newKey: 'DATABASE_HOST' });
    expect(changed).toBe(true);
    expect(conflict).toBe(false);
    expect(result['DATABASE_HOST']).toBe('localhost');
    expect(result['DB_HOST']).toBeUndefined();
  });

  it('preserves key order around renamed key', () => {
    const { env: result } = applyRename(env, { oldKey: 'DB_PORT', newKey: 'DATABASE_PORT' });
    const keys = Object.keys(result);
    expect(keys.indexOf('DATABASE_PORT')).toBe(1);
  });

  it('returns changed=false if oldKey not present', () => {
    const { changed } = applyRename(env, { oldKey: 'MISSING', newKey: 'ALSO_MISSING' });
    expect(changed).toBe(false);
  });

  it('returns conflict=true if newKey already exists', () => {
    const { conflict, changed } = applyRename(env, { oldKey: 'DB_HOST', newKey: 'DB_PORT' });
    expect(conflict).toBe(true);
    expect(changed).toBe(false);
  });

  it('does not mutate original env', () => {
    const original = { ...env };
    applyRename(env, { oldKey: 'DB_HOST', newKey: 'X' });
    expect(env).toEqual(original);
  });
});

describe('applyRenames', () => {
  it('applies multiple renames in sequence', () => {
    const env = { A: '1', B: '2', C: '3' };
    const { env: result, results } = applyRenames(env, [
      { oldKey: 'A', newKey: 'ALPHA' },
      { oldKey: 'B', newKey: 'BETA' },
    ]);
    expect(result['ALPHA']).toBe('1');
    expect(result['BETA']).toBe('2');
    expect(results).toHaveLength(2);
    expect(results[0].changed).toBe(true);
  });

  it('records conflict without stopping subsequent ops', () => {
    const env = { A: '1', B: '2' };
    const { results } = applyRenames(env, [
      { oldKey: 'A', newKey: 'B' },
      { oldKey: 'B', newKey: 'BETA' },
    ]);
    expect(results[0].conflict).toBe(true);
    expect(results[1].changed).toBe(true);
  });
});

describe('envToString', () => {
  it('serializes env map to KEY=VALUE lines', () => {
    const str = envToString({ FOO: 'bar', BAZ: 'qux' });
    expect(str).toBe('FOO=bar\nBAZ=qux');
  });
});
