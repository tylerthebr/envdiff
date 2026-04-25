const { buildDiff, getDiffChanges, diffStats } = require('./differ');

const base = {
  APP_NAME: 'myapp',
  DB_HOST: 'localhost',
  SECRET: 'abc123',
  PORT: '3000',
};

const target = {
  APP_NAME: 'myapp',
  DB_HOST: 'prod.db.host',
  // SECRET missing
  PORT: '3000',
  NEW_KEY: 'hello',
};

describe('buildDiff', () => {
  test('returns an entry for every key across both envs', () => {
    const diff = buildDiff(base, target);
    const keys = diff.map((e) => e.key);
    expect(keys).toContain('APP_NAME');
    expect(keys).toContain('SECRET');
    expect(keys).toContain('NEW_KEY');
  });

  test('ok entry has matching base and target values', () => {
    const diff = buildDiff(base, target);
    const ok = diff.find((e) => e.key === 'APP_NAME');
    expect(ok.status).toBe('ok');
    expect(ok.baseValue).toBe('myapp');
    expect(ok.targetValue).toBe('myapp');
  });

  test('mismatched entry has differing values', () => {
    const diff = buildDiff(base, target);
    const mm = diff.find((e) => e.key === 'DB_HOST');
    expect(mm.status).toBe('mismatched');
    expect(mm.baseValue).toBe('localhost');
    expect(mm.targetValue).toBe('prod.db.host');
  });

  test('missing entry has null on missing side', () => {
    const diff = buildDiff(base, target);
    const secret = diff.find((e) => e.key === 'SECRET');
    expect(secret.status).toBe('missing');
    expect(secret.targetValue).toBeNull();
  });
});

describe('getDiffChanges', () => {
  test('returns only missing and mismatched entries', () => {
    const changes = getDiffChanges(base, target);
    expect(changes.every((e) => e.status !== 'ok')).toBe(true);
    expect(changes.length).toBeGreaterThan(0);
  });
});

describe('diffStats', () => {
  test('counts statuses correctly', () => {
    const stats = diffStats(base, target);
    expect(stats.ok).toBe(2);       // APP_NAME, PORT
    expect(stats.mismatched).toBe(1); // DB_HOST
    expect(stats.missing).toBe(2);   // SECRET (in base), NEW_KEY (in target)
  });
});
