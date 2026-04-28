// Scores env files based on completeness, consistency, and quality

const WEIGHTS = {
  missing: 10,
  mismatch: 5,
  warning: 2,
  duplicate: 3,
  unresolved: 4
};

function penaltyFor(counts) {
  return (
    (counts.missing || 0) * WEIGHTS.missing +
    (counts.mismatch || 0) * WEIGHTS.mismatch +
    (counts.warning || 0) * WEIGHTS.warning +
    (counts.duplicate || 0) * WEIGHTS.duplicate +
    (counts.unresolved || 0) * WEIGHTS.unresolved
  );
}

function scoreEnv(totalKeys, counts) {
  if (totalKeys === 0) return 0;
  const penalty = penaltyFor(counts);
  const maxPenalty = totalKeys * WEIGHTS.missing;
  const raw = 1 - penalty / maxPenalty;
  return Math.max(0, Math.min(100, Math.round(raw * 100)));
}

function grade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function buildScore(label, totalKeys, counts) {
  const score = scoreEnv(totalKeys, counts);
  return {
    label,
    score,
    grade: grade(score),
    totalKeys,
    penalties: counts
  };
}

function compareScores(scores) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  return sorted;
}

module.exports = { penaltyFor, scoreEnv, grade, buildScore, compareScores };
