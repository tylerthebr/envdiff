const { extractInlineTags, buildTagMap, filterByTag, listAllTags, annotateEntries } = require('./tagger');

const entries = [
  { key: 'DB_HOST', value: 'localhost' },
  { key: 'API_KEY', value: 'secret' },
  { key: 'PORT', value: '3000' },
];
const lines = [
  'DB_HOST=localhost # @infra @required',
  'API_KEY=secret # @sensitive @required',
  'PORT=3000',
];

test('extractInlineTags parses tags from comment', () => {
  expect(extractInlineTags('DB_HOST=localhost # @infra @required')).toEqual(['infra', 'required']);
});

test('extractInlineTags returns empty array when no tags', () => {
  expect(extractInlineTags('PORT=3000')).toEqual([]);
});

test('extractInlineTags returns empty array when no comment', () => {
  expect(extractInlineTags('KEY=value')).toEqual([]);
});

test('buildTagMap maps keys to their tags', () => {
  const map = buildTagMap(entries, lines);
  expect(map['DB_HOST']).toEqual(['infra', 'required']);
  expect(map['API_KEY']).toEqual(['sensitive', 'required']);
  expect(map['PORT']).toEqual([]);
});

test('filterByTag returns only entries with given tag', () => {
  const map = buildTagMap(entries, lines);
  const result = filterByTag(entries, map, 'required');
  expect(result.map(e => e.key)).toEqual(['DB_HOST', 'API_KEY']);
});

test('filterByTag returns empty when no match', () => {
  const map = buildTagMap(entries, lines);
  expect(filterByTag(entries, map, 'nope')).toEqual([]);
});

test('listAllTags returns sorted unique tags', () => {
  const map = buildTagMap(entries, lines);
  expect(listAllTags(map)).toEqual(['infra', 'required', 'sensitive']);
});

test('annotateEntries attaches tags to each entry', () => {
  const map = buildTagMap(entries, lines);
  const annotated = annotateEntries(entries, map);
  expect(annotated[0].tags).toEqual(['infra', 'required']);
  expect(annotated[2].tags).toEqual([]);
});
