#!/usr/bin/env node
/**
 * cli-rename.js — CLI interface for renaming keys in .env files
 * Usage: node cli-rename.js <file> <OLD_KEY> <NEW_KEY> [--dry-run] [--force]
 */
const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');
const { buildRenameOp, applyRename, envToString } = require('./renamer');

function parseRenameArgs(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const positional = args.filter(a => !a.startsWith('--'));
  const [file, oldKey, newKey] = positional;
  return { file, oldKey, newKey, dryRun, force };
}

function printUsage() {
  console.log('Usage: envdiff-rename <file> <OLD_KEY> <NEW_KEY> [--dry-run] [--force]');
  console.log('  --dry-run   Show what would change without writing');
  console.log('  --force     Skip conflict check and overwrite newKey if present');
}

function runRename(argv, { stdout = process.stdout, stderr = process.stderr, exit = process.exit } = {}) {
  const { file, oldKey, newKey, dryRun, force } = parseRenameArgs(argv);

  if (!file || !oldKey || !newKey) {
    printUsage();
    return exit(1);
  }

  const absPath = path.resolve(file);
  if (!fs.existsSync(absPath)) {
    stderr.write(`Error: file not found: ${absPath}\n`);
    return exit(1);
  }

  let op;
  try {
    op = buildRenameOp(oldKey, newKey);
  } catch (e) {
    stderr.write(`Error: ${e.message}\n`);
    return exit(1);
  }

  const raw = fs.readFileSync(absPath, 'utf8');
  const env = parseEnv(raw);
  let { env: updated, changed, conflict } = applyRename(env, op);

  if (conflict && !force) {
    stderr.write(`Error: key "${newKey}" already exists. Use --force to overwrite.\n`);
    return exit(1);
  }

  if (!changed && !conflict) {
    stdout.write(`Warning: key "${oldKey}" not found in ${file}\n`);
    return exit(0);
  }

  if (conflict && force) {
    // Remove newKey first so rename can proceed
    const tmp = { ...env };
    delete tmp[newKey];
    ({ env: updated, changed } = applyRename(tmp, op));
  }

  const output = envToString(updated);

  if (dryRun) {
    stdout.write(`[dry-run] Would rename "${oldKey}" -> "${newKey}" in ${file}\n`);
    stdout.write(output + '\n');
    return exit(0);
  }

  fs.writeFileSync(absPath, output + '\n', 'utf8');
  stdout.write(`Renamed "${oldKey}" -> "${newKey}" in ${file}\n`);
  exit(0);
}

if (require.main === module) {
  runRename(process.argv);
}

module.exports = { parseRenameArgs, runRename };
