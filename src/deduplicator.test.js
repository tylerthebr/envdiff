const { findDuplicates, deduplicateEnv, envToString } = require('./deduplicator');

describe('findDuplicates', () => {
  it('returns empty array when no duplicates', () => {
    const raw = 'FOO=1\nBAR=2\nBAZ=3';
    expect(findDuplicates(raw)).toEqual([]);
  });

  it('detects a single duplicate key', () => {
    const raw = 'FOO=1\nBAR=2\nFOO=3';
    expect(findDuplicates(raw)).toEqual(['FOO']);
  });

  it('detects multiple duplicate keys', () => {
    const raw = 'FOO=1\nBAR=2\nFOO=3\nBAR=4';
    expect(findDuplicates(raw)).toEqual(['FOO', 'BAR']);
  });

  it('ignores comment lines', () => {
    const raw = '# FOO=1\nFOO=2\nFOO=3';
    expect(findDuplicates(raw)).toEqual(['FOO']);
  });

  it('ignores blank lines', () => {
    const raw = 'FOO=1\n\nFOO=2';
    expect(findDuplicates(raw)).toEqual(['FOO']);
  });
});

describe('deduplicateEnv', () => {
  it('keeps last value for duplicated keys', () => {
    const raw = 'FOO=first\nBAR=hello\nFOO=last';
    const { env } = deduplicateEnv(raw);
    expect(env.FOO).toBe('last');
    expect(env.BAR).toBe('hello');
  });

  it('reports removed (duplicate) keys', () => {
    const raw = 'FOO=1\nFOO=2\nBAR=3';
    const { removed } = deduplicateEnv(raw);
    expect(removed).toContain('FOO');
    expect(removed).not.toContain('BAR');
  });

  it('returns empty removed array when no duplicates', () => {
    const raw = 'A=1\nB=2';
    const { removed } = deduplicateEnv(raw);
    expect(removed).toEqual([]);
  });

  it('handles empty input', () => {
    const { env, removed } = deduplicateEnv('');
    expect(env).toEqual({});
    expect(removed).toEqual([]);
  });
});

describe('envToString', () => {
  it('serializes env object to key=value lines', () => {
    const env = { FOO: 'bar', BAZ: '123' };
    const result = envToString(env);
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=123');
  });

  it('returns empty string for empty env', () => {
    expect(envToString({})).toBe('');
  });
});
