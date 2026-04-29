const { formatTag, formatTagList, formatTagRow, formatTagReport } = require('./tag-formatter');
const { strip } = require('./colors');

test('formatTag wraps tag with @ prefix', () => {
  expect(strip(formatTag('required'))).toBe('@required');
});

test('formatTagList formats multiple tags', () => {
  const result = strip(formatTagList(['infra', 'required']));
  expect(result).toContain('@infra');
  expect(result).toContain('@required');
});

test('formatTagList shows (none) for empty tags', () => {
  expect(strip(formatTagList([]))).toBe('(none)');
});

test('formatTagList shows (none) for null', () => {
  expect(strip(formatTagList(null))).toBe('(none)');
});

test('formatTagRow includes key and tags', () => {
  const entry = { key: 'DB_HOST', value: 'localhost', tags: ['infra'] };
  const result = strip(formatTagRow(entry));
  expect(result).toContain('DB_HOST');
  expect(result).toContain('@infra');
});

test('formatTagReport includes header and rows', () => {
  const annotated = [
    { key: 'API_KEY', value: 'x', tags: ['sensitive'] },
    { key: 'PORT', value: '3000', tags: [] },
  ];
  const result = strip(formatTagReport(annotated, 'Test'));
  expect(result).toContain('Test');
  expect(result).toContain('API_KEY');
  expect(result).toContain('@sensitive');
  expect(result).toContain('PORT');
});
