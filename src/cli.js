#!/usr/bin/env node
'use strict';

const { loadEnvFiles } = require('./loader');
const { compareEnvs } = require('./comparator');
const { printReport } = require('./reporter');

function printUsage() {
  console.log('Usage: envdiff <file1> <file2> [file3 ...]');
  console.log('');
  console.log('Compares .env files and reports missing or mismatched keys.');
  console.log('');
  console.log('Options:');
  console.log('  --help    Show this help message');
  console.log('  --strict  Exit with code 1 if any differences are found');
}

function main(argv) {
  const args = argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    printUsage();
    process.exit(0);
  }

  const strict = args.includes('--strict');
  const filePaths = args.filter(a => !a.startsWith('--'));

  if (filePaths.length < 2) {
    console.error('Error: at least two .env files are required.');
    printUsage();
    process.exit(1);
  }

  let envMap;
  try {
    envMap = loadEnvFiles(filePaths);
  } catch (err) {
    console.error(`Error loading files: ${err.message}`);
    process.exit(1);
  }

  const labels = Object.keys(envMap);
  const envs = labels.map(l => envMap[l]);

  const report = compareEnvs(labels, envs);
  printReport(report);

  if (strict && report.hasDifferences) {
    process.exit(1);
  }
}

main(process.argv);
