const { printReport } = require('./reporter');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
});

const sampleReport = {
  DB_HOST: { status: 'ok', values: { '.env.dev': 'localhost', '.env.prod': 'localhost' } },
  DB_PASS: { status: 'mismatch', values: { '.env.dev': 'secret', '.env.prod': 'hunter2' } },
  API_KEY: { status: 'missing', missingIn: ['.env.prod'], values: { '.env.dev': 'abc123' } },
};

const envNames = ['.env.dev', '.env.prod'];

describe('printReport', () => {
  test('returns correct counts', () => {
    const result = printReport(sampleReport, envNames);
    expect(result.missingCount).toBe(1);
    expect(result.mismatchedCount).toBe(1);
    expect(result.okCount).toBe(1);
  });

  test('calls console.log once', () => {
    printReport(sampleReport, envNames);
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  test('output contains key names', () => {
    printReport(sampleReport, envNames);
    const output = console.log.mock.calls[0][0];
    expect(output).toContain('DB_PASS');
    expect(output).toContain('API_KEY');
  });

  test('ok keys hidden by default', () => {
    printReport(sampleReport, envNames);
    const output = console.log.mock.calls[0][0];
    expect(output).not.toContain('✓');
  });

  test('ok keys shown when showOk is true', () => {
    printReport(sampleReport, envNames, { showOk: true });
    const output = console.log.mock.calls[0][0];
    expect(output).toContain('DB_HOST');
  });

  test('includes env names in header', () => {
    printReport(sampleReport, envNames);
    const output = console.log.mock.calls[0][0];
    expect(output).toContain('.env.dev');
    expect(output).toContain('.env.prod');
  });
});
