#!/usr/bin/env node

/**
 * CLI interface for the normalizer module.
 * Reads a .env file, normalizes its values, and prints or writes the result.
 */

const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');
const { normalizeEnv, envToString } = require('./normalizer');

function printUsage() {
  console.log(`
Usage: envdiff normalize <file> [options]

Options:
  --bools          Normalize boolean-like strings (true/false/yes/no/1/0)
  --numbers        Normalize numeric strings to bare numbers
  --quotes         Strip surrounding quotes from values
  --all            Apply all normalizations (default)
  --output <file>  Write result to file instead of stdout
  --dry-run        Preview changes without writing
  --help           Show this help message
`);
}

/**
 * Parse CLI arguments for the normalize command.
 * @param {string[]} argv
 * @returns {{ file: string, options: object, output: string|null, dryRun: boolean }}
 */
function parseNormalizeArgs(argv) {
  const args = argv.slice(2);
  const result = {
    file: null,
    options: { bools: false, numbers: false, quotes: false },
    output: null,
    dryRun: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--help') {
      printUsage();
      process.exit(0);
    } else if (arg === '--bools') {
      result.options.bools = true;
    } else if (arg === '--numbers') {
      result.options.numbers = true;
    } else if (arg === '--quotes') {
      result.options.quotes = true;
    } else if (arg === '--all') {
      result.options.bools = true;
      result.options.numbers = true;
      result.options.quotes = true;
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg === '--output' && args[i + 1]) {
      result.output = args[++i];
    } else if (!arg.startsWith('--') && !result.file) {
      result.file = arg;
    }
    i++;
  }

  // Default: apply all if no specific flag given
  if (!result.options.bools && !result.options.numbers && !result.options.quotes) {
    result.options.bools = true;
    result.options.numbers = true;
    result.options.quotes = true;
  }

  return result;
}

/**
 * Run the normalize command.
 * @param {string[]} argv
 */
function runNormalize(argv) {
  const { file, options, output, dryRun } = parseNormalizeArgs(argv);

  if (!file) {
    console.error('Error: no input file specified.');
    printUsage();
    process.exit(1);
  }

  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const entries = parseEnv(raw);
  const normalized = normalizeEnv(entries, options);
  const outStr = envToString(normalized);

  if (dryRun) {
    console.log(`# Dry run — normalized output for: ${file}\n`);
    console.log(outStr);
    return;
  }

  if (output) {
    const outPath = path.resolve(output);
    fs.writeFileSync(outPath, outStr, 'utf8');
    console.log(`Normalized output written to: ${outPath}`);
  } else {
    console.log(outStr);
  }
}

module.exports = { parseNormalizeArgs, printUsage, runNormalize };
