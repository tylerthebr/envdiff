const { getPrefix, groupByScope, listScopes, filterByScope } = require('./scoper');

const entries = [
  { key: 'DB_HOST', value: 'localhost' },
  { key: 'DB_PORT', value: '5432' },
  { key: 'AWS_ACCESS_KEY', value: 'AKIA123' },
  { key: 'AWS_SECRET_KEY', value: 'secret' },
  { key: 'PORT', value: '3000' },
  { key: 'NODE_ENV', value: 'production' },
];

describe('getPrefix', () => {
  test('extracts prefix from namespaced key', () => {
    expect(getPrefix('DB_HOST')).toBe('DB');
    expect(getPrefix('AWS_ACCESS_KEY')).toBe('AWS');
    expect(getPrefix('NODE_ENV')).toBe('NODE');
  });

  test('returns empty string for non-namespaced key', () => {
    expect(getPrefix('PORT')).toBe('');
    expect(getPrefix('DEBUG')).toBe('');
  });

  test('handles lowercase keys as no prefix', () => {
    expect(getPrefix('db_host')).toBe('');
  });
});

describe('groupByScope', () => {
  test('groups entries by prefix', () => {
    const groups = groupByScope(entries);
    expect(groups['DB']).toHaveLength(2);
    expect(groups['AWS']).toHaveLength(2);
    expect(groups['NODE']).toHaveLength(1);
    expect(groups['']).toHaveLength(1);
  });

  test('returns empty object for empty input', () => {
    expect(groupByScope([])).toEqual({});
  });
});

describe('listScopes', () => {
  test('returns sorted unique scopes', () => {
    const scopes = listScopes(entries);
    expect(scopes).toContain('DB');
    expect(scopes).toContain('AWS');
    expect(scopes).toContain('NODE');
    expect(scopes).toContain('');
    expect(scopes).toEqual([...scopes].sort());
  });

  test('no duplicates', () => {
    const scopes = listScopes(entries);
    expect(new Set(scopes).size).toBe(scopes.length);
  });
});

describe('filterByScope', () => {
  test('returns only entries matching scope', () => {
    const db = filterByScope(entries, 'DB');
    expect(db).toHaveLength(2);
    expect(db.every(e => e.key.startsWith('DB_'))).toBe(true);
  });

  test('returns entries with no prefix when scope is empty string', () => {
    const none = filterByScope(entries, '');
    expect(none).toHaveLength(1);
    expect(none[0].key).toBe('PORT');
  });

  test('returns empty array for unknown scope', () => {
    expect(filterByScope(entries, 'UNKNOWN')).toEqual([]);
  });
});
