const { penaltyFor, scoreEnv, grade, buildScore, compareScores } = require('./scorer');

describe('penaltyFor', () => {
  it('returns 0 for empty counts', () => {
    expect(penaltyFor({})).toBe(0);
  });

  it('calculates weighted penalty', () => {
    const p = penaltyFor({ missing: 1, mismatch: 1 });
    expect(p).toBe(15); // 10 + 5
  });

  it('handles all penalty types', () => {
    const p = penaltyFor({ missing: 1, mismatch: 1, warning: 1, duplicate: 1, unresolved: 1 });
    expect(p).toBe(24);
  });
});

describe('scoreEnv', () => {
  it('returns 0 for 0 total keys', () => {
    expect(scoreEnv(0, {})).toBe(0);
  });

  it('returns 100 for no penalties', () => {
    expect(scoreEnv(10, {})).toBe(100);
  });

  it('reduces score for missing keys', () => {
    const s = scoreEnv(10, { missing: 5 });
    expect(s).toBe(50);
  });

  it('clamps score to 0 minimum', () => {
    expect(scoreEnv(1, { missing: 100 })).toBe(0);
  });
});

describe('grade', () => {
  it('assigns A for 90+', () => expect(grade(95)).toBe('A'));
  it('assigns B for 75-89', () => expect(grade(80)).toBe('B'));
  it('assigns C for 60-74', () => expect(grade(65)).toBe('C'));
  it('assigns D for 40-59', () => expect(grade(50)).toBe('D'));
  it('assigns F below 40', () => expect(grade(30)).toBe('F'));
});

describe('buildScore', () => {
  it('builds a score object', () => {
    const result = buildScore('production', 10, { missing: 1 });
    expect(result.label).toBe('production');
    expect(result.grade).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.totalKeys).toBe(10);
  });
});

describe('compareScores', () => {
  it('sorts scores descending', () => {
    const scores = [
      { label: 'a', score: 60 },
      { label: 'b', score: 90 },
      { label: 'c', score: 75 }
    ];
    const result = compareScores(scores);
    expect(result[0].score).toBe(90);
    expect(result[2].score).toBe(60);
  });

  it('does not mutate original array', () => {
    const scores = [{ score: 50 }, { score: 80 }];
    compareScores(scores);
    expect(scores[0].score).toBe(50);
  });
});
