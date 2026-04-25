#!/usr/bin/env node
// CLI for inspecting a single .env file

const fs = require('fs');
const path = require('path');
const { inspectFile } = require('./inspector');
const { applyColor } = require('./colors');

function parseInspectArgs(argv) {
  const args = argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const verbose = args.includes('--verbose');
  const noColor = args.includes('--no-color');
  return { file, verbose, noColor };
}

function printUsage() {
  console.log('Usage: envdiff inspect <file> [--verbose] [--no-color]');
}

function runInspect(argv = process.argv) {
  const { file, verbose, noColor } = parseInspectArgs(argv);

  if (!file) {
    printUsage();
    process.exit(1);
  }

  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const { entries, stats } = inspectFile(content);

  console.log(applyColor(`\nInspecting: ${file}`, 'cyan', noColor));
  console.log(`  Total keys  : ${stats.total}`);
  console.log(`  Empty       : ${stats.empty}`);
  console.log(`  Sensitive   : ${stats.sensitive}`);
  console.log(`  With warnings: ${stats.withWarnings}`);
  console.log(`  Types       : ${JSON.stringify(stats.types)}`);

  if (verbose) {
    console.log();
    for (const e of entries) {
      const tag = e.sensitive ? applyColor('[sensitive]', 'yellow', noColor) : '';
      const warn = e.warnings.length ? applyColor(` ! ${e.warnings.join(', ')}`, 'red', noColor) : '';
      console.log(`  ${e.key} (${e.type}) ${tag}${warn}`);
    }
  }

  return { entries, stats };
}

if (require.main === module) {
  runInspect();
}

module.exports = { parseInspectArgs, runInspect, printUsage };
