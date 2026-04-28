const { gradeColor, formatScoreRow, formatScoreHeader, formatScoreReport } = require('./score-formatter');
const { strip } = require('./colors');

describe('gradeColor', () => {
  it('returns green for A', () => expect(gradeColor('A')).toBe('green'));
  it('returns red for F', () => expect(gradeColor('F')).toBe('red'));
  it('returns yellow for C', () => expect(gradeColor('C')).toBe('yellow'));
});

describe('formatScoreRow', () => {
  const entry = { label: 'staging', score: 82, grade: 'B', totalKeys: 20, penalties: { missing: 2 } };

  it('includes label', () => {
    expect(strip(formatScoreRow(entry))).toContain('staging');
  });

  it('includes score', () => {
    expect(strip(formatScoreRow(entry))).toContain('82');
  });

  it('includes grade', () => {
    expect(strip(formatScoreRow(entry))).toContain('B');
  });

  it('includes penalty info', () => {
    expect(strip(formatScoreRow(entry))).toContain('missing:2');
  });

  it('omits penalty block when no penalties', () => {
    const clean = { label: 'prod', score: 100, grade: 'A', totalKeys: 10, penalties: {} };
    expect(strip(formatScoreRow(clean))).not.toContain('[');
  });
});

describe('formatScoreHeader', () => {
  it('includes the title', () => {
    expect(strip(formatScoreHeader('My Report'))).toContain('My Report');
  });
});

describe('formatScoreReport', () => {
  const scores = [
    { label: 'prod', score: 95, grade: 'A', totalKeys: 10, penalties: {} },
    { label: 'dev', score: 60, grade: 'C', totalKeys: 10, penalties: { missing: 4 } }
  ];

  it('includes all labels', () => {
    const out = strip(formatScoreReport(scores));
    expect(out).toContain('prod');
    expect(out).toContain('dev');
  });

  it('includes average', () => {
    const out = strip(formatScoreReport(scores));
    expect(out).toContain('Average score');
  });

  it('handles empty scores array', () => {
    const out = strip(formatScoreReport([]));
    expect(out).toContain('Average score: 0');
  });
});
