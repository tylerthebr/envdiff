const { getGroup, groupEntries, listGroups, filterByGroup } = require('./grouper');

const entries = [
  { key: 'DB_HOST', value: 'localhost' },
  { key: 'DB_PORT', value: '5432' },
  { key: 'APP_NAME', value: 'envdiff' },
  { key: 'APP_ENV', value: 'production' },
  { key: 'SECRET', value: 'abc123' },
];

describe('getGroup', () => {
  it('returns prefix before first underscore', () => {
    expect(getGroup('DB_HOST')).toBe('DB');
    expect(getGroup('APP_NAME')).toBe('APP');
  });

  it('returns __ungrouped__ when no delimiter found', () => {
    expect(getGroup('SECRET')).toBe('__ungrouped__');
  });

  it('supports custom delimiter', () => {
    expect(getGroup('DB.HOST', '.')).toBe('DB');
  });

  it('returns __ungrouped__ when delimiter is at index 0', () => {
    expect(getGroup('_LEADING')).toBe('__ungrouped__');
  });
});

describe('groupEntries', () => {
  it('groups entries by prefix', () => {
    const groups = groupEntries(entries);
    expect(Object.keys(groups).sort()).toEqual(['APP', 'DB', '__ungrouped__']);
    expect(groups['DB']).toHaveLength(2);
    expect(groups['APP']).toHaveLength(2);
    expect(groups['__ungrouped__']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupEntries([])).toEqual({});
  });
});

describe('listGroups', () => {
  it('returns unique group names', () => {
    const groups = listGroups(entries);
    expect(groups).toContain('DB');
    expect(groups).toContain('APP');
    expect(groups).toContain('__ungrouped__');
    expect(groups.length).toBe(3);
  });
});

describe('filterByGroup', () => {
  it('returns only entries for the given group', () => {
    const dbEntries = filterByGroup(entries, 'DB');
    expect(dbEntries).toHaveLength(2);
    expect(dbEntries.every(e => e.key.startsWith('DB_'))).toBe(true);
  });

  it('returns empty array when group not found', () => {
    expect(filterByGroup(entries, 'REDIS')).toEqual([]);
  });
});
