const { filterByStatus, filterByPattern, applyFilters } = require('./filter');

const sampleResults = {
  DB_HOST: { status: 'ok', values: { production: 'prod-db', staging: 'stage-db' } },
  DB_PASS: { status: 'mismatched', values: { production: 'secret', staging: 'other' } },
  API_KEY: { status: 'missing', values: { production: 'abc123', staging: undefined } },
  SECRET_KEY: { status: 'missing', values: { production: 'xyz', staging: undefined } },
  LOG_LEVEL: { status: 'ok', values: { production: 'info', staging: 'info' } },
};

describe('filterByStatus', () => {
  test('filters to only missing keys', () => {
    const result = filterByStatus(sampleResults, ['missing']);
    expect(Object.keys(result)).toEqual(['API_KEY', 'SECRET_KEY']);
  });

  test('filters to ok and mismatched keys', () => {
    const result = filterByStatus(sampleResults, ['ok', 'mismatched']);
    expect(Object.keys(result)).toContain('DB_HOST');
    expect(Object.keys(result)).toContain('DB_PASS');
    expect(Object.keys(result)).toContain('LOG_LEVEL');
    expect(Object.keys(result)).not.toContain('API_KEY');
  });

  test('returns all results when statuses is empty', () => {
    const result = filterByStatus(sampleResults, []);
    expect(Object.keys(result)).toHaveLength(5);
  });

  test('returns empty object when no keys match', () => {
    const result = filterByStatus(sampleResults, ['nonexistent']);
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('filterByPattern', () => {
  test('filters keys by substring pattern', () => {
    const result = filterByPattern(sampleResults, 'DB');
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PASS']);
  });

  test('filters keys by RegExp', () => {
    const result = filterByPattern(sampleResults, /^(API|SECRET)/);
    expect(Object.keys(result)).toEqual(['API_KEY', 'SECRET_KEY']);
  });

  test('returns all results when pattern is null', () => {
    const result = filterByPattern(sampleResults, null);
    expect(Object.keys(result)).toHaveLength(5);
  });

  test('is case-insensitive for string patterns', () => {
    const result = filterByPattern(sampleResults, 'db');
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PASS']);
  });
});

describe('applyFilters', () => {
  test('applies both status and pattern filters', () => {
    const result = applyFilters(sampleResults, { statuses: ['missing'], pattern: 'API' });
    expect(Object.keys(result)).toEqual(['API_KEY']);
  });

  test('returns all results with no options', () => {
    const result = applyFilters(sampleResults, {});
    expect(Object.keys(result)).toHaveLength(5);
  });

  test('only status filter when no pattern given', () => {
    const result = applyFilters(sampleResults, { statuses: ['ok'] });
    expect(Object.keys(result)).toEqual(['DB_HOST', 'LOG_LEVEL']);
  });
});
