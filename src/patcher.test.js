const { applyOp, applyPatch, buildPatch } = require('./patcher');

describe('applyOp', () => {
  const base = { A: '1', B: '2' };

  test('add inserts a new key', () => {
    const result = applyOp(base, { op: 'add', key: 'C', value: '3' });
    expect(result).toEqual({ A: '1', B: '2', C: '3' });
  });

  test('update changes existing key', () => {
    const result = applyOp(base, { op: 'update', key: 'A', value: '99' });
    expect(result).toEqual({ A: '99', B: '2' });
  });

  test('remove deletes a key', () => {
    const result = applyOp(base, { op: 'remove', key: 'B' });
    expect(result).toEqual({ A: '1' });
  });

  test('does not mutate original env', () => {
    applyOp(base, { op: 'add', key: 'Z', value: 'z' });
    expect(base).toEqual({ A: '1', B: '2' });
  });
});

describe('applyPatch', () => {
  const env = { HOST: 'localhost', PORT: '3000' };

  test('applies add, update, remove ops', () => {
    const ops = [
      { op: 'add', key: 'DB', value: 'postgres' },
      { op: 'update', key: 'PORT', value: '5432' },
      { op: 'remove', key: 'HOST' },
    ];
    const { env: result, log } = applyPatch(env, ops);
    expect(result).toEqual({ PORT: '5432', DB: 'postgres' });
    expect(log.every(l => l.status === 'applied')).toBe(true);
  });

  test('skips add if key already exists', () => {
    const { log } = applyPatch(env, [{ op: 'add', key: 'HOST', value: 'x' }]);
    expect(log[0].status).toBe('skipped');
  });

  test('skips remove if key not found', () => {
    const { log } = applyPatch(env, [{ op: 'remove', key: 'MISSING' }]);
    expect(log[0].status).toBe('skipped');
  });

  test('skips update if key not found', () => {
    const { log } = applyPatch(env, [{ op: 'update', key: 'NOPE', value: 'v' }]);
    expect(log[0].status).toBe('skipped');
  });

  test('returns unchanged env for empty ops', () => {
    const { env: result } = applyPatch(env, []);
    expect(result).toEqual(env);
  });
});

describe('buildPatch', () => {
  test('generates add ops for new keys', () => {
    const ops = buildPatch({}, { A: '1' });
    expect(ops).toContainEqual({ op: 'add', key: 'A', value: '1' });
  });

  test('generates remove ops for deleted keys', () => {
    const ops = buildPatch({ A: '1' }, {});
    expect(ops).toContainEqual({ op: 'remove', key: 'A' });
  });

  test('generates update ops for changed values', () => {
    const ops = buildPatch({ A: '1' }, { A: '2' });
    expect(ops).toContainEqual({ op: 'update', key: 'A', value: '2' });
  });

  test('no ops when envs are identical', () => {
    const ops = buildPatch({ A: '1' }, { A: '1' });
    expect(ops).toHaveLength(0);
  });

  test('roundtrip: applying buildPatch result transforms base into target', () => {
    const base = { A: '1', B: '2' };
    const target = { A: '9', C: '3' };
    const ops = buildPatch(base, target);
    const { env } = applyPatch(base, ops);
    expect(env).toEqual(target);
  });
});
