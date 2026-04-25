/**
 * CLI handler for the `lint` subcommand.
 */

const path = require('path');
const { loadEnvFile } = require('./loader');
const { lintEnv, hasLintErrors } = require('./linter');
const { applyColor } = require('./colors');

function parseLintArgs(argv) {
  const files = argv.filter(a => !a.startsWith('--'));
  const strict = argv.includes('--strict');
  return { files, strict };
}

function formatLintResult(filePath, results) {
  const lines = [];
  const label = applyColor('cyan', `[${path.basename(filePath)}]`);
  lines.push(`\n${label}`);

  if (results.length === 0) {
    lines.push(applyColor('green', '  ✔ No issues found'));
    return lines.join('\n');
  }

  for (const { key, issues } of results) {
    for (const issue of issues) {
      lines.push(applyColor('yellow', `  ⚠ ${issue}`));
    }
  }
  return lines.join('\n');
}

function runLint(argv, { exit = process.exit, log = console.log } = {}) {
  const { files, strict } = parseLintArgs(argv);

  if (files.length === 0) {
    log('Usage: envdiff lint <file1> [file2 ...] [--strict]');
    exit(1);
    return;
  }

  let anyErrors = false;

  for (const filePath of files) {
    let env;
    try {
      env = loadEnvFile(filePath);
    } catch (err) {
      log(applyColor('red', `Error loading ${filePath}: ${err.message}`));
      exit(1);
      return;
    }

    const results = lintEnv(env);
    log(formatLintResult(filePath, results));

    if (hasLintErrors(results)) anyErrors = true;
  }

  if (strict && anyErrors) {
    exit(1);
  }
}

module.exports = { parseLintArgs, formatLintResult, runLint };
