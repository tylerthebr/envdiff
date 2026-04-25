const {
  REDACTED,
  isSensitiveKey,
  redactEntry,
  redactEnv,
  redactEntries,
} = require('./redactor');

describe('isSensitiveKey', () => {
  test('matches password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('db_passwd')).toBe(true);
  });

  test('matches token keys', () => {
    expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
    expect(isSensitiveKey('github_token')).toBe(true);
  });

  test('matches api key variants', () => {
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('STRIPE_APIKEY')).toBe(true);
  });

  test('does not match safe keys', () => {
    expect(isSensitiveKey('APP_NAME')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
  });

  test('supports custom patterns', () => {
    expect(isSensitiveKey('MY_CUSTOM_FIELD', [/custom/i])).toBe(true);
    expect(isSensitiveKey('APP_NAME', [/custom/i])).toBe(false);
  });
});

describe('redactEntry', () => {
  test('redacts sensitive entry', () => {
    const result = redactEntry({ key: 'DB_PASSWORD', value: 'hunter2' });
    expect(result.value).toBe(REDACTED);
    expect(result.redacted).toBe(true);
  });

  test('leaves safe entry unchanged', () => {
    const result = redactEntry({ key: 'APP_NAME', value: 'myapp' });
    expect(result.value).toBe('myapp');
    expect(result.redacted).toBe(false);
  });
});

describe('redactEnv', () => {
  const env = {
    APP_NAME: 'myapp',
    DB_PASSWORD: 'secret123',
    PORT: '3000',
    API_KEY: 'abc-xyz',
  };

  test('redacts sensitive keys, preserves safe keys', () => {
    const result = redactEnv(env);
    expect(result.APP_NAME).toBe('myapp');
    expect(result.PORT).toBe('3000');
    expect(result.DB_PASSWORD).toBe(REDACTED);
    expect(result.API_KEY).toBe(REDACTED);
  });
});

describe('redactEntries', () => {
  test('returns array of entry objects with redacted flags', () => {
    const env = { SECRET_KEY: 'topsecret', HOST: 'localhost' };
    const entries = redactEntries(env);
    const secret = entries.find((e) => e.key === 'SECRET_KEY');
    const host = entries.find((e) => e.key === 'HOST');
    expect(secret.value).toBe(REDACTED);
    expect(secret.redacted).toBe(true);
    expect(host.value).toBe('localhost');
    expect(host.redacted).toBe(false);
  });
});
