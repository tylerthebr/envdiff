const { expandValue, interpolateEnv, extractRefs, findUnresolvedRefs } = require('./interpolator');

describe('expandValue', () => {
  test('expands ${VAR} syntax', () => {
    expect(expandValue('hello ${NAME}', { NAME: 'world' })).toBe('hello world');
  });

  test('expands $VAR syntax', () => {
    expect(expandValue('hello $NAME', { NAME: 'world' })).toBe('hello world');
  });

  test('leaves unknown refs unchanged', () => {
    expect(expandValue('${MISSING}', {})).toBe('${MISSING}');
  });

  test('handles multiple refs in one value', () => {
    expect(expandValue('${A}-${B}', { A: 'foo', B: 'bar' })).toBe('foo-bar');
  });

  test('returns non-string values as-is', () => {
    expect(expandValue(42, {})).toBe(42);
  });

  test('handles empty string', () => {
    expect(expandValue('', { A: '1' })).toBe('');
  });
});

describe('interpolateEnv', () => {
  test('resolves all values in an env object', () => {
    const env = { BASE: '/app', LOG: '$BASE/logs' };
    const result = interpolateEnv(env);
    expect(result.LOG).toBe('/app/logs');
    expect(result.BASE).toBe('/app');
  });

  test('leaves unresolvable refs as-is', () => {
    const env = { PATH: '$UNDEFINED/bin' };
    expect(interpolateEnv(env).PATH).toBe('$UNDEFINED/bin');
  });

  test('does not mutate original env', () => {
    const env = { A: '1', B: '$A' };
    interpolateEnv(env);
    expect(env.B).toBe('$A');
  });
});

describe('extractRefs', () => {
  test('extracts braced refs', () => {
    expect(extractRefs('${FOO} and ${BAR}')).toEqual(['FOO', 'BAR']);
  });

  test('extracts bare refs', () => {
    expect(extractRefs('$FOO/$BAR')).toEqual(['FOO', 'BAR']);
  });

  test('returns empty array when no refs', () => {
    expect(extractRefs('no refs here')).toEqual([]);
  });
});

describe('findUnresolvedRefs', () => {
  test('reports missing refs', () => {
    const env = { URL: 'http://$HOST:$PORT' };
    const warnings = findUnresolvedRefs(env);
    expect(warnings).toHaveLength(2);
    expect(warnings.map(w => w.ref)).toEqual(expect.arrayContaining(['HOST', 'PORT']));
  });

  test('no warnings when all refs resolved', () => {
    const env = { HOST: 'localhost', URL: 'http://$HOST' };
    expect(findUnresolvedRefs(env)).toHaveLength(0);
  });

  test('returns empty array for env with no refs', () => {
    expect(findUnresolvedRefs({ A: '1', B: '2' })).toEqual([]);
  });
});
