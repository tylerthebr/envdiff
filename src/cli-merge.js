/**
 * CLI handler for the `merge` subcommand.
 * Usage: envdiff merge <file1> <file2> [file3...] [--only=common|incomplete]
 */
const path = require('path');
const { loadEnvFile } = require('./loader');
const { parseEnv } = require('./parser');
const { mergeEnvs, commonKeys, incompleteKeys } = require('./merger');
const { applyColor } = require('./colors');

function parseMergeArgs(argv) {
  const files = [];
  let filter = 'all';

  for (const arg of argv) {
    if (arg.startsWith('--only=')) {
      filter = arg.slice('--only='.length);
    } else {
      files.push(arg);
    }
  }

  return { files, filter };
}

function isValidMergeFilter(f) {
  return ['all', 'common', 'incomplete'].includes(f);
}

function runMerge(argv, { stdout = process.stdout, stderr = process.stderr } = {}) {
  const { files, filter } = parseMergeArgs(argv);

  if (files.length < 2) {
    stderr.write('Usage: envdiff merge <file1> <file2> [file3...] [--only=common|incomplete]\n');
    return 1;
  }

  if (!isValidMergeFilter(filter)) {
    stderr.write(`Invalid --only value: "${filter}". Use common, incomplete, or all.\n`);
    return 1;
  }

  const envMap = {};
  for (const file of files) {
    const name = path.basename(file);
    try {
      const raw = loadEnvFile(file);
      envMap[name] = parseEnv(raw);
    } catch (e) {
      stderr.write(`Error loading ${file}: ${e.message}\n`);
      return 1;
    }
  }

  const envNames = Object.keys(envMap);
  const merged = mergeEnvs(envMap);

  let keys = Object.keys(merged).sort();
  if (filter === 'common') keys = commonKeys(merged, envNames).sort();
  if (filter === 'incomplete') keys = incompleteKeys(merged, envNames).sort();

  const header = envNames.join('\t');
  stdout.write(`KEY\t${header}\n`);

  for (const key of keys) {
    const vals = envNames.map((n) => {
      const v = merged[key][n];
      return v === undefined ? applyColor('red', '<missing>') : v;
    });
    stdout.write(`${key}\t${vals.join('\t')}\n`);
  }

  return 0;
}

module.exports = { parseMergeArgs, isValidMergeFilter, runMerge };
