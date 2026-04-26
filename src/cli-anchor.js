#!/usr/bin/env node
// cli-anchor.js — CLI for checking required anchor keys across env files

const path = require('path');
const { loadEnvFiles } = require('./loader');
const { checkAnchorsAcrossEnvs, missingAnchors } = require('./anchorer');
const { applyColor } = require('./colors');

function printUsage() {
  console.log('Usage: envdiff anchor --keys KEY1,KEY2 <file1> [file2 ...]');
  console.log('  --keys  Comma-separated list of required keys');
  console.log('  --quiet Suppress output, exit code only');
}

function parseAnchorArgs(argv) {
  const args = argv.slice(2);
  let keys = [];
  let quiet = false;
  const files = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--keys' && args[i + 1]) {
      keys = args[++i].split(',').map((k) => k.trim()).filter(Boolean);
    } else if (args[i] === '--quiet') {
      quiet = true;
    } else if (!args[i].startsWith('--')) {
      files.push(args[i]);
    }
  }

  return { keys, files, quiet };
}

function runAnchor(argv = process.argv, exit = process.exit) {
  const { keys, files, quiet } = parseAnchorArgs(argv);

  if (!keys.length || !files.length) {
    printUsage();
    return exit(1);
  }

  let envs;
  try {
    envs = loadEnvFiles(files);
  } catch (err) {
    console.error(applyColor('red', `Error loading files: ${err.message}`));
    return exit(1);
  }

  const report = checkAnchorsAcrossEnvs(keys, envs);
  let hasIssues = false;

  for (const entry of report) {
    const missing = entry.results
      .filter((r) => !r.present)
      .map((r) => path.basename(files[r.index]));

    if (missing.length) {
      hasIssues = true;
      if (!quiet) {
        console.log(
          applyColor('red', `MISSING`) +
            ` ${entry.key} — not found in: ${missing.join(', ')}`
        );
      }
    } else if (!quiet) {
      console.log(applyColor('green', `OK     `) + ` ${entry.key}`);
    }
  }

  if (!quiet) {
    const total = keys.length;
    const ok = report.filter((e) => e.results.every((r) => r.present)).length;
    console.log(`\n${ok}/${total} anchor keys fully present across all files.`);
  }

  exit(hasIssues ? 1 : 0);
}

module.exports = { parseAnchorArgs, printUsage, runAnchor };
