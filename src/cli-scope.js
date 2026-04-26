#!/usr/bin/env node
/**
 * cli-scope.js — CLI to display env entries grouped by namespace scope
 */

const { loadEnvFile } = require('./loader');
const { groupByScope, listScopes } = require('./scoper');
const { applyColor } = require('./colors');

function printUsage() {
  console.log('Usage: envdiff scope <file.env> [--scope=PREFIX]');
  console.log('');
  console.log('Options:');
  console.log('  --scope=PREFIX   Show only entries for a specific scope prefix');
  console.log('  --list           List available scopes only');
}

function parseScopeArgs(argv) {
  const args = argv.slice(2);
  const file = args.find(a => !a.startsWith('--'));
  const scopeArg = args.find(a => a.startsWith('--scope='));
  const listOnly = args.includes('--list');
  const scope = scopeArg ? scopeArg.split('=')[1].toUpperCase() : null;
  return { file, scope, listOnly };
}

function runScope(argv = process.argv, out = console.log, exit = process.exit) {
  const { file, scope, listOnly } = parseScopeArgs(argv);

  if (!file) {
    printUsage();
    return exit(1);
  }

  let entries;
  try {
    entries = loadEnvFile(file);
  } catch (e) {
    out(`Error: could not load file "${file}": ${e.message}`);
    return exit(1);
  }

  const scopes = listScopes(entries);

  if (listOnly) {
    out(applyColor('bold', 'Available scopes:'));
    for (const s of scopes) {
      out('  ' + (s || '(none)'));
    }
    return exit(0);
  }

  const groups = groupByScope(entries);
  const targetScopes = scope ? [scope] : scopes;

  for (const s of targetScopes) {
    const label = s || '(none)';
    out(applyColor('cyan', `\n[${label}]`));
    const group = groups[s] || [];
    if (group.length === 0) {
      out('  (no entries)');
    } else {
      for (const e of group) {
        out(`  ${applyColor('green', e.key)} = ${e.value}`);
      }
    }
  }

  exit(0);
}

module.exports = { parseScopeArgs, printUsage, runScope };
