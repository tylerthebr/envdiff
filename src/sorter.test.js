const { sortEntries, sortByKey, sortByStatus } = require('./sorter');

const entries = [
  { key: 'PORT', status: 'ok' },
  { key: 'API_KEY', status: 'missing' },
  { key: 'DB_URL', status: 'mismatched' },
  { key: 'APP_ENV', status: 'ok' },
  { key: 'SECRET', status: 'missing' },
];

describe('sortByKey', () => {
  it('sorts entries alphabetically by key', () => {
    const result = sortByKey(entries);
    const keys = result.map(e => e.key);
    expect(keys).toEqual(['API_KEY', 'APP_ENV', 'DB_URL', 'PORT', 'SECRET']);
  });

  it('does not mutate the original array', () => {
    const original = [...entries];
    sortByKey(entries);
    expect(entries).toEqual(original);
  });
});

describe('sortByStatus', () => {
  it('puts missing first, then mismatched, then ok', () => {
    const result = sortByStatus(entries);
    const statuses = result.map(e => e.status);
    expect(statuses[0]).toBe('missing');
    expect(statuses[1]).toBe('missing');
    expect(statuses[2]).toBe('mismatched');
    expect(statuses[3]).toBe('ok');
    expect(statuses[4]).toBe('ok');
  });

  it('sorts within same status alphabetically', () => {
    const result = sortByStatus(entries);
    const missing = result.filter(e => e.status === 'missing').map(e => e.key);
    expect(missing).toEqual(['API_KEY', 'SECRET']);
  });
});

describe('sortEntries', () => {
  it('defaults to key sort', () => {
    const result = sortEntries(entries);
    expect(result[0].key).toBe('API_KEY');
  });

  it('accepts status sort order', () => {
    const result = sortEntries(entries, 'status');
    expect(result[0].status).toBe('missing');
  });

  it('throws on unknown sort order', () => {
    expect(() => sortEntries(entries, 'unknown')).toThrow('Unknown sort order');
  });

  it('throws if entries is not an array', () => {
    expect(() => sortEntries(null)).toThrow(TypeError);
  });
});
