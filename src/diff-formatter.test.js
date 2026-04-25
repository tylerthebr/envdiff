const { formatDiffLine, formatDiffBlock, formatDiffHeader } = require('./diff-formatter');

const okEntry = { key: 'PORT', status: 'ok', baseValue: '3000', targetValue: '3000' };
const missingEntry = { key: 'SECRET', status: 'missing', baseValue: 'abc', targetValue: null };
const mismatchEntry = { key: 'DB_HOST', status: 'mismatched', baseValue: 'localhost', targetValue: 'prod.db' };

describe('formatDiffLine (no color)', () => {
  test('ok entry shows key=value with no symbol', () => {
    const line = formatDiffLine(okEntry, false);
    expect(line).toContain('PORT=3000');
    expect(line.startsWith('  ')).toBe(true);
  });

  test('missing entry shows - prefix and value', () => {
    const line = formatDiffLine(missingEntry, false);
    expect(line).toContain('SECRET=abc');
    expect(line.startsWith('- ')).toBe(true);
  });

  test('mismatched entry shows arrow between values', () => {
    const line = formatDiffLine(mismatchEntry, false);
    expect(line).toContain('localhost');
    expect(line).toContain('prod.db');
    expect(line).toContain('→');
    expect(line.startsWith('~ ')).toBe(true);
  });
});

describe('formatDiffBlock', () => {
  test('joins multiple entries with newlines', () => {
    const block = formatDiffBlock([okEntry, missingEntry, mismatchEntry], false);
    const lines = block.split('\n');
    expect(lines).toHaveLength(3);
  });

  test('empty array returns empty string', () => {
    expect(formatDiffBlock([], false)).toBe('');
  });
});

describe('formatDiffHeader', () => {
  test('includes both labels', () => {
    const header = formatDiffHeader('.env.local', '.env.prod', false);
    expect(header).toContain('.env.local');
    expect(header).toContain('.env.prod');
    expect(header).toContain('---');
    expect(header).toContain('+++');
  });
});
