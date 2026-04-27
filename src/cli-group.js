#!/usr/bin/env node
/**
 * CLI command: envdiff group <file> [--delimiter=_] [--group=NAME]
 * Groups env keys by prefix and prints them.
 */

const { loadEnvFile } = require('./loader');
const { groupEntries, listGroups, filterByGroup } = require('./grouper');
const { applyColor } = require('./colors');

function printUsage() {
  console.log('Usage: envdiff group <file> [--delimiter=CHAR] [--group=NAME]');
}

function parseGroupArgs(argv) {
  const args = { file: null, delimiter: '_', group: null };
  for (const arg of argv) {
    if (arg.startsWith('--delimiter=')) args.delimiter = arg.split('=')[1];
    else if (arg.startsWith('--group=')) args.group = arg.split('=')[1];
    else if (!arg.startsWith('--')) args.file = arg;
  }
  return args;
}

function printGroup(groupName, entries) {
  console.log(applyColor('cyan', `\n[${groupName}]`));
  for (const entry of entries) {
    console.log(`  ${applyColor('green', entry.key)} = ${entry.value}`);
  }
}

function runGroup(argv, exit = process.exit) {
  const args = parseGroupArgs(argv);

  if (!args.file) {
    printUsage();
    return exit(1);
  }

  let entries;
  try {
    entries = loadEnvFile(args.file);
  } catch (err) {
    console.error(`Error loading file: ${err.message}`);
    return exit(1);
  }

  if (args.group) {
    const filtered = filterByGroup(entries, args.group, args.delimiter);
    if (filtered.length === 0) {
      console.log(`No entries found for group "${args.group}".`);
      return exit(0);
    }
    printGroup(args.group, filtered);
  } else {
    const groups = groupEntries(entries, args.delimiter);
    const names = listGroups(entries, args.delimiter);
    console.log(`Found ${names.length} group(s) in ${args.file}:`);
    for (const name of names.sort()) {
      printGroup(name, groups[name]);
    }
  }

  exit(0);
}

module.exports = { parseGroupArgs, printUsage, runGroup };
