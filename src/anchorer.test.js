const {
  checkAnchors,
  checkAnchorsAcrossEnvs,
  missingAnchors,
  allAnchorsPresent,
} = require('./anchorer');

describe('checkAnchors', () => {
  const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_ENV: 'test' };

  test('marks present keys as present', () => {
    const result = checkAnchors(['DB_HOST', 'APP_ENV'], env);
    expect(result).toEqual([
      { key: 'DB_HOST', present: true },
      { key: 'APP_ENV', present: true },
    ]);
  });

  test('marks missing keys as not present', () => {
    const result = checkAnchors(['SECRET_KEY'], env);
    expect(result).toEqual([{ key: 'SECRET_KEY', present: false }]);
  });

  test('handles empty anchors list', () => {
    expect(checkAnchors([], env)).toEqual([]);
  });

  test('handles empty env', () => {
    const result = checkAnchors(['DB_HOST'], {});
    expect(result).toEqual([{ key: 'DB_HOST', present: false }]);
  });
});

describe('checkAnchorsAcrossEnvs', () => {
  const envs = [
    { DB_HOST: 'localhost', SECRET: 'abc' },
    { DB_HOST: 'prod-db' },
  ];

  test('reports presence across all envs', () => {
    const result = checkAnchorsAcrossEnvs(['DB_HOST', 'SECRET'], envs);
    expect(result[0]).toEqual({
      key: 'DB_HOST',
      results: [
        { index: 0, present: true },
        { index: 1, present: true },
      ],
    });
    expect(result[1]).toEqual({
      key: 'SECRET',
      results: [
        { index: 0, present: true },
        { index: 1, present: false },
      ],
    });
  });
});

describe('missingAnchors', () => {
  test('returns only missing keys', () => {
    const report = [
      { key: 'A', present: true },
      { key: 'B', present: false },
      { key: 'C', present: false },
    ];
    expect(missingAnchors(report)).toEqual(['B', 'C']);
  });

  test('returns empty array when all present', () => {
    const report = [{ key: 'A', present: true }];
    expect(missingAnchors(report)).toEqual([]);
  });
});

describe('allAnchorsPresent', () => {
  const env = { FOO: '1', BAR: '2' };

  test('returns true when all anchors present', () => {
    expect(allAnchorsPresent(['FOO', 'BAR'], env)).toBe(true);
  });

  test('returns false when any anchor missing', () => {
    expect(allAnchorsPresent(['FOO', 'MISSING'], env)).toBe(false);
  });

  test('returns true for empty anchors', () => {
    expect(allAnchorsPresent([], env)).toBe(true);
  });
});
