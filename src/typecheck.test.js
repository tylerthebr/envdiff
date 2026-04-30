const { TYPES, isValidType, checkValue, typecheckEnv, hasTypeErrors } = require('./typecheck');

describe('isValidType', () => {
  test('returns true for known types', () => {
    TYPES.forEach(t => expect(isValidType(t)).toBe(true));
  });
  test('returns false for unknown type', () => {
    expect(isValidType('hex')).toBe(false);
  });
});

describe('checkValue', () => {
  test('string always passes for string type', () => {
    expect(checkValue('hello', 'string')).toBe(true);
    expect(checkValue('', 'string')).toBe(true);
  });
  test('number type', () => {
    expect(checkValue('42', 'number')).toBe(true);
    expect(checkValue('3.14', 'number')).toBe(true);
    expect(checkValue('abc', 'number')).toBe(false);
    expect(checkValue('', 'number')).toBe(false);
  });
  test('boolean type', () => {
    expect(checkValue('true', 'boolean')).toBe(true);
    expect(checkValue('yes', 'boolean')).toBe(true);
    expect(checkValue('1', 'boolean')).toBe(true);
    expect(checkValue('maybe', 'boolean')).toBe(false);
  });
  test('url type', () => {
    expect(checkValue('https://example.com', 'url')).toBe(true);
    expect(checkValue('not-a-url', 'url')).toBe(false);
  });
  test('email type', () => {
    expect(checkValue('user@example.com', 'email')).toBe(true);
    expect(checkValue('bad-email', 'email')).toBe(false);
  });
  test('json type', () => {
    expect(checkValue('{"a":1}', 'json')).toBe(true);
    expect(checkValue('[1,2]', 'json')).toBe(true);
    expect(checkValue('not json', 'json')).toBe(false);
  });
  test('unknown type returns false', () => {
    expect(checkValue('x', 'hex')).toBe(false);
  });
});

describe('typecheckEnv', () => {
  const env = { PORT: '3000', DEBUG: 'true', API_URL: 'https://api.example.com' };
  const schema = { PORT: 'number', DEBUG: 'boolean', API_URL: 'url', SECRET: 'string' };

  test('returns result for each schema key', () => {
    const results = typecheckEnv(env, schema);
    expect(results).toHaveLength(4);
  });
  test('passes valid entries', () => {
    const results = typecheckEnv(env, schema);
    expect(results.find(r => r.key === 'PORT').pass).toBe(true);
    expect(results.find(r => r.key === 'DEBUG').pass).toBe(true);
    expect(results.find(r => r.key === 'API_URL').pass).toBe(true);
  });
  test('flags missing key', () => {
    const results = typecheckEnv(env, schema);
    const secret = results.find(r => r.key === 'SECRET');
    expect(secret.pass).toBe(false);
    expect(secret.reason).toBe('missing');
  });
});

describe('hasTypeErrors', () => {
  test('returns true when any result fails', () => {
    expect(hasTypeErrors([{ pass: true }, { pass: false }])).toBe(true);
  });
  test('returns false when all pass', () => {
    expect(hasTypeErrors([{ pass: true }, { pass: true }])).toBe(false);
  });
});
