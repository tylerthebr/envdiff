const { traceKey, isConsistent, allKeys, buildTrace } = require('./tracer');

const envA = { env: { API_URL: 'http://a.com', SECRET: 'abc' }, name: 'a' };
const envB = { env: { API_URL: 'http://a.com', PORT: '3000' }, name: 'b' };
const envC = { env: { API_URL: 'http://c.com', SECRET: 'xyz', PORT: '3000' }, name: 'c' };

describe('traceKey', () => {
  it('returns presence and value for each file', () => {
    const result = traceKey('API_URL', [envA, envB, envC]);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ file: 'a', value: 'http://a.com', present: true });
    expect(result[1]).toEqual({ file: 'b', value: 'http://a.com', present: true });
  });

  it('marks missing keys as not present', () => {
    const result = traceKey('SECRET', [envA, envB, envC]);
    expect(result[1].present).toBe(false);
    expect(result[1].value).toBeUndefined();
  });
});

describe('isConsistent', () => {
  it('returns true when all present values are equal', () => {
    const trace = traceKey('PORT', [envB, envC]);
    expect(isConsistent(trace)).toBe(true);
  });

  it('returns false when values differ', () => {
    const trace = traceKey('API_URL', [envA, envC]);
    expect(isConsistent(trace)).toBe(false);
  });

  it('returns false when no file has the key', () => {
    const trace = traceKey('GHOST', [envA, envB]);
    expect(isConsistent(trace)).toBe(false);
  });
});

describe('allKeys', () => {
  it('collects unique sorted keys across all envs', () => {
    const keys = allKeys([envA, envB, envC]);
    expect(keys).toEqual(['API_URL', 'PORT', 'SECRET']);
  });
});

describe('buildTrace', () => {
  it('builds a trace entry for every key', () => {
    const result = buildTrace([envA, envB]);
    expect(result.map(r => r.key)).toEqual(['API_URL', 'PORT', 'SECRET']);
  });

  it('marks consistent keys correctly', () => {
    const result = buildTrace([envA, envB, envC]);
    const port = result.find(r => r.key === 'PORT');
    expect(port.consistent).toBe(true);
    const api = result.find(r => r.key === 'API_URL');
    expect(api.consistent).toBe(false);
  });
});
