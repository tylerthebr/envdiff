const path = require('path');
const { loadEnvFiles } = require('./loader');
const { compareEnvs } = require('./comparator');
const { buildSummary } = require('./summary');
const { buildScore, compareScores } = require('./scorer');
const { formatScoreReport } = require('./score-formatter');

function printUsage() {
  console.log('Usage: envdiff score <file1> <file2> [file3...]');
  console.log('  Scores each env file on completeness and consistency.');
}

function parseScoreArgs(argv) {
  const files = argv.filter(a => !a.startsWith('--'));
  const sort = argv.includes('--sort');
  return { files, sort };
}

function runScore(argv) {
  const { files, sort } = parseScoreArgs(argv);

  if (files.length < 2) {
    printUsage();
    process.exit(1);
  }

  let envs;
  try {
    envs = loadEnvFiles(files);
  } catch (err) {
    console.error('Error loading files:', err.message);
    process.exit(1);
  }

  const allKeys = [...new Set(envs.flatMap(e => Object.keys(e.data)))];
  const totalKeys = allKeys.length;

  const scores = envs.map(env => {
    const others = envs.filter(e => e.label !== env.label);
    const comparisons = others.map(other => compareEnvs(env.data, other.data));
    const merged = comparisons.flat();
    const summary = buildSummary(merged);
    const counts = {
      missing: summary.missing || 0,
      mismatch: summary.mismatch || 0
    };
    return buildScore(env.label, totalKeys, counts);
  });

  const ordered = sort ? compareScores(scores) : scores;
  const label = files.map(f => path.basename(f)).join(' vs ');
  console.log(formatScoreReport(ordered, `Score Report: ${label}`));
}

module.exports = { parseScoreArgs, printUsage, runScore };
