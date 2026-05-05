const { formatTraceEntry, formatTraceBlock, formatTraceReport } = require('./trace-formatter');
const { strip } = require('./colors');

describe('formatTraceEntry', () => {
  it('shows value when key is present', () => {
    const out = strip(formatTraceEntry({ file: 'prod', value: 'http://x.com', present: true }));
    expect(out).toContain('prod');
    expect(out).toContain('http://x.com');
    expect(out).toContain('✔');
  });

  it('shows (missing) when key is absent', () => {
    const out = strip(formatTraceEntry({ file: 'dev', value: undefined, present: false }));
    expect(out).toContain('dev');
    expect(out).toContain('(missing)');
    expect(out).toContain('✘');
  });

  it('shows (empty) for empty string values', () => {
    const out = strip(formatTraceEntry({ file: 'staging', value: '', present: true }));
    expect(out).toContain('(empty)');
  });
});

describe('formatTraceBlock', () => {
  const result = {
    key: 'API_URL',
    consistent: false,
    trace: [
      { file: 'dev', value: 'http://dev.com', present: true },
      { file: 'prod', value: 'http://prod.com', present: true }
    ]
  };

  it('includes the key name', () => {
    const out = strip(formatTraceBlock(result));
    expect(out).toContain('API_URL');
  });

  it('marks inconsistent blocks', () => {
    const out = strip(formatTraceBlock(result));
    expect(out).toContain('[inconsistent]');
  });

  it('marks consistent blocks', () => {
    const out = strip(formatTraceBlock({ ...result, consistent: true }));
    expect(out).toContain('[consistent]');
  });
});

describe('formatTraceReport', () => {
  it('returns fallback for empty results', () => {
    const out = strip(formatTraceReport([]));
    expect(out).toContain('No keys to trace');
  });

  it('joins multiple blocks', () => {
    const results = [
      { key: 'A', consistent: true, trace: [{ file: 'x', value: '1', present: true }] },
      { key: 'B', consistent: false, trace: [{ file: 'x', value: undefined, present: false }] }
    ];
    const out = strip(formatTraceReport(results));
    expect(out).toContain('A');
    expect(out).toContain('B');
  });
});
