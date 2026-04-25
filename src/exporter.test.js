const { toJSON, toJSONString, toCSV, exportReport } = require('./exporter');

const mockReport = {
  files: ['.env.development', '.env.production'],
  summary: { total: 3, ok: 1, missing: 1, mismatched: 1 },
  results: [
    {
      key: 'API_URL',
      status: 'ok',
      values: { '.env.development': 'http://localhost', '.env.production': 'http://localhost' },
    },
    {
      key: 'SECRET_KEY',
      status: 'mismatched',
      values: { '.env.development': 'dev-secret', '.env.production': 'prod-secret' },
    },
    {
      key: 'DEBUG',
      status: 'missing',
      values: { '.env.development': 'true', '.env.production': undefined },
    },
  ],
};

describe('toJSON', () => {
  it('includes files, summary, and entries', () => {
    const result = toJSON(mockReport);
    expect(result.files).toEqual(mockReport.files);
    expect(result.summary).toEqual(mockReport.summary);
    expect(result.entries).toHaveLength(3);
  });

  it('entry has key, status, values', () => {
    const result = toJSON(mockReport);
    expect(result.entries[0]).toMatchObject({ key: 'API_URL', status: 'ok' });
  });
});

describe('toJSONString', () => {
  it('returns valid JSON string', () => {
    const str = toJSONString(mockReport);
    expect(() => JSON.parse(str)).not.toThrow();
  });

  it('pretty prints by default', () => {
    const str = toJSONString(mockReport);
    expect(str).toContain('\n');
  });

  it('compact when pretty=false', () => {
    const str = toJSONString(mockReport, false);
    expect(str).not.toContain('\n');
  });
});

describe('toCSV', () => {
  it('first line is header with file names', () => {
    const csv = toCSV(mockReport);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('key,status,.env.development,.env.production');
  });

  it('has correct number of rows', () => {
    const csv = toCSV(mockReport);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(4); // header + 3 entries
  });

  it('empty string for missing values', () => {
    const csv = toCSV(mockReport);
    const debugLine = csv.split('\n').find((l) => l.startsWith('DEBUG'));
    expect(debugLine).toMatch(/DEBUG,missing,true,$/);
  });
});

describe('exportReport', () => {
  it('delegates to toJSONString for json format', () => {
    const out = exportReport(mockReport, 'json');
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it('delegates to toCSV for csv format', () => {
    const out = exportReport(mockReport, 'csv');
    expect(out.split('\n')[0]).toContain('key,status');
  });

  it('throws on unknown format', () => {
    expect(() => exportReport(mockReport, 'xml')).toThrow('Unsupported export format');
  });
});
