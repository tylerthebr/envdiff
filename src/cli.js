const path = require('path');
const { loadEnvFiles } = require('./loader');
const { compareEnvs } = require('./comparator');
const { printReport } = require('./reporter');
const { applyFilters } = require('./filter');
const { sortEntries } = require('./sorter');

function printUsage() {
  console.log('Usage: envdiff <file1> <file2> [options]');
  console.log('');
  console.log('Options:');
  console.log('  --no-color          Disable colored output');
  console.log('  --only=<status>     Filter by status: missing, mismatched, ok');
  console.log('  --pattern=<glob>    Filter keys by pattern');
  console.log('  --sort=<order>      Sort results by: key (default), status');
  console.log('');
  console.log('Example:');
  console.log('  envdiff .env .env.production --only=missing --sort=status');
}

async function main(argv = process.argv.slice(2)) {
  const positional = argv.filter(a => !a.startsWith('--'));
  const flags = argv.filter(a => a.startsWith('--'));

  if (positional.length < 2) {
    printUsage();
    process.exit(1);
  }

  const [file1, file2] = positional;

  const onlyFlag = flags.find(f => f.startsWith('--only='));
  const patternFlag = flags.find(f => f.startsWith('--pattern='));
  const sortFlag = flags.find(f => f.startsWith('--sort='));
  const noColor = flags.includes('--no-color');

  const onlyStatus = onlyFlag ? onlyFlag.split('=')[1] : null;
  const pattern = patternFlag ? patternFlag.split('=')[1] : null;
  const sortOrder = sortFlag ? sortFlag.split('=')[1] : 'key';

  if (noColor) process.env.NO_COLOR = '1';

  let envs;
  try {
    envs = await loadEnvFiles([file1, file2]);
  } catch (err) {
    console.error(`Error loading files: ${err.message}`);
    process.exit(1);
  }

  const labels = [path.basename(file1), path.basename(file2)];
  let entries = compareEnvs(envs, labels);

  entries = applyFilters(entries, { status: onlyStatus, pattern });

  try {
    entries = sortEntries(entries, sortOrder);
  } catch (err) {
    console.error(`Sort error: ${err.message}`);
    process.exit(1);
  }

  printReport(entries, labels);
}

module.exports = { printUsage, main };
