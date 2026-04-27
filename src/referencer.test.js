const { extractRefs, buildRefMap, findUndefinedRefs, findUnreferencedKeys, findCircularRefs } = require('./referencer');

describe('extractRefs', () => {
  it('returns empty array for plain value', () => {
    expect(extractRefs('hello')).toEqual([]);
  });

  it('extracts single ref', () => {
    expect(extractRefs('http://${HOST}:3000')).toEqual(['HOST']);
  });

  it('extracts multiple refs', () => {
    expect(extractRefs('${SCHEME}://${HOST}:${PORT}')).toEqual(['SCHEME', 'HOST', 'PORT']);
  });

  it('returns empty for non-string', () => {
    expect(extractRefs(null)).toEqual([]);
    expect(extractRefs(undefined)).toEqual([]);
  });
});

describe('buildRefMap', () => {
  it('builds map of key to its refs', () => {
    const env = { URL: 'http://${HOST}:${PORT}', HOST: 'localhost', PORT: '3000' };
    expect(buildRefMap(env)).toEqual({ URL: ['HOST', 'PORT'] });
  });

  it('returns empty map when no refs', () => {
    expect(buildRefMap({ A: 'foo', B: 'bar' })).toEqual({});
  });
});

describe('findUndefinedRefs', () => {
  it('returns keys referenced but not defined', () => {
    const env = { URL: '${SCHEME}://${HOST}', HOST: 'localhost' };
    expect(findUndefinedRefs(env)).toEqual(['SCHEME']);
  });

  it('returns empty when all refs are defined', () => {
    const env = { URL: '${HOST}:${PORT}', HOST: 'localhost', PORT: '3000' };
    expect(findUndefinedRefs(env)).toEqual([]);
  });
});

describe('findUnreferencedKeys', () => {
  it('returns keys not referenced by any other key', () => {
    const env = { URL: '${HOST}:${PORT}', HOST: 'localhost', PORT: '3000' };
    const result = findUnreferencedKeys(env);
    expect(result).toContain('URL');
    expect(result).not.toContain('HOST');
    expect(result).not.toContain('PORT');
  });

  it('returns all keys when none reference each other', () => {
    const env = { A: 'foo', B: 'bar' };
    expect(findUnreferencedKeys(env).sort()).toEqual(['A', 'B']);
  });
});

describe('findCircularRefs', () => {
  it('detects a simple cycle', () => {
    const refMap = { A: ['B'], B: ['A'] };
    const cycles = findCircularRefs(refMap);
    expect(cycles.length).toBeGreaterThan(0);
  });

  it('returns empty for no cycles', () => {
    const refMap = { A: ['B'], B: ['C'] };
    expect(findCircularRefs(refMap)).toEqual([]);
  });
});
