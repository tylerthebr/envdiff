const { classifyValue, inspectEntry, inspectEnv, inspectFile } = require('./inspector');

describe('classifyValue', () => {
  it('returns empty for blank string', () => {
    expect(classifyValue('')).toBe('empty');
  });
  it('detects integer', () => {
    expect(classifyValue('42')).toBe('integer');
  });
  it('detects float', () => {
    expect(classifyValue('3.14')).toBe('float');
  });
  it('detects boolean', () => {
    expect(classifyValue('true')).toBe('boolean');
    expect(classifyValue('False')).toBe('boolean');
  });
  it('detects url', () => {
    expect(classifyValue('https://example.com')).toBe('url');
  });
  it('detects email', () => {
    expect(classifyValue('user@example.com')).toBe('email');
  });
  it('falls back to string', () => {
    expect(classifyValue('hello world')).toBe('string');
  });
});

describe('inspectEntry', () => {
  it('marks sensitive keys', () => {
    const result = inspectEntry('DB_PASSWORD', 'secret');
    expect(result.sensitive).toBe(true);
    expect(result.type).toBe('string');
  });

  it('marks empty values', () => {
    const result = inspectEntry('SOME_KEY', '');
    expect(result.empty).toBe(true);
    expect(result.type).toBe('empty');
  });

  it('includes warnings array', () => {
    const result = inspectEntry('VALID_KEY', 'value');
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});

describe('inspectEnv', () => {
  it('returns stats and entries', () => {
    const parsed = { PORT: '3000', SECRET: '', DB_PASSWORD: 'abc' };
    const { entries, stats } = inspectEnv(parsed);
    expect(entries).toHaveLength(3);
    expect(stats.total).toBe(3);
    expect(stats.empty).toBe(1);
    expect(stats.sensitive).toBeGreaterThanOrEqual(1);
    expect(stats.types['integer']).toBe(1);
  });
});

describe('inspectFile', () => {
  it('parses and inspects content', () => {
    const content = 'PORT=8080\nDEBUG=true\nSECRET=\n';
    const { entries, stats } = inspectFile(content);
    expect(stats.total).toBe(3);
    expect(stats.empty).toBe(1);
  });
});
