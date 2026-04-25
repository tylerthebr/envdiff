const { toTemplateEntry, buildTemplate, extractKeys, generateTemplate } = require('./template');

describe('toTemplateEntry', () => {
  it('formats a key with empty value', () => {
    expect(toTemplateEntry('DB_HOST')).toBe('DB_HOST=');
  });

  it('works with lowercase keys', () => {
    expect(toTemplateEntry('port')).toBe('port=');
  });
});

describe('buildTemplate', () => {
  it('returns sorted keys by default', () => {
    const result = buildTemplate(['Z_KEY', 'A_KEY', 'M_KEY']);
    expect(result).toBe('A_KEY=\nM_KEY=\nZ_KEY=\n');
  });

  it('preserves order when sorted=false', () => {
    const result = buildTemplate(['Z_KEY', 'A_KEY'], { sorted: false });
    expect(result).toBe('Z_KEY=\nA_KEY=\n');
  });

  it('returns a trailing newline', () => {
    expect(buildTemplate(['FOO'])).toMatch(/\n$/);
  });

  it('handles empty array', () => {
    expect(buildTemplate([])).toBe('\n');
  });
});

describe('extractKeys', () => {
  it('extracts unique keys from entries', () => {
    const entries = [
      { key: 'FOO', status: 'ok' },
      { key: 'BAR', status: 'missing' },
      { key: 'FOO', status: 'mismatch' },
    ];
    expect(extractKeys(entries)).toEqual(expect.arrayContaining(['FOO', 'BAR']));
    expect(extractKeys(entries)).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(extractKeys([])).toEqual([]);
  });

  it('ignores entries without key', () => {
    const entries = [{ status: 'ok' }, { key: 'VALID' }];
    expect(extractKeys(entries)).toEqual(['VALID']);
  });
});

describe('generateTemplate', () => {
  it('generates sorted template from entries', () => {
    const entries = [
      { key: 'PORT', status: 'ok' },
      { key: 'API_KEY', status: 'missing' },
    ];
    const result = generateTemplate(entries);
    expect(result).toBe('API_KEY=\nPORT=\n');
  });

  it('deduplicates keys', () => {
    const entries = [{ key: 'FOO' }, { key: 'FOO' }, { key: 'BAR' }];
    const result = generateTemplate(entries);
    expect(result).toBe('BAR=\nFOO=\n');
  });
});
