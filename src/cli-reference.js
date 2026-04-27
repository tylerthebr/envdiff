#!/usr/bin/env node
// cli-reference.js — CLI for inspecting key references in .env files

const { loadEnvFile } = require('./loader');
const { buildRefMap, findUndefinedRefs, findUnreferencedKeys, findCircularRefs } = require('./referencer');
const { applyColor } = require('./colors');

function printUsage() {
  console.log('Usage: envdiff reference <file> [--undefined] [--unreferenced] [--circular]');
  console.log('  --undefined      Show keys referenced but not defined');
  console.log('  --unreferenced   Show keys not referenced by any other key');
  console.log('  --circular       Show circular reference chains');
}

function parseReferenceArgs(argv) {
  const args = argv.slice(2);
  const file = args.find(a => !a.startsWith('--'));
  return {
    file,
    showUndefined: args.includes('--undefined'),
    showUnreferenced: args.includes('--unreferenced'),
    showCircular: args.includes('--circular'),
    all: !args.includes('--undefined') && !args.includes('--unreferenced') && !args.includes('--circular')
  };
}

function runReference(argv = process.argv, out = console.log, exit = process.exit) {
  const opts = parseReferenceArgs(argv);

  if (!opts.file) {
    printUsage();
    return exit(1);
  }

  let env;
  try {
    env = loadEnvFile(opts.file);
  } catch (e) {
    out(applyColor('red', `Error: cannot read file "${opts.file}"`));
    return exit(1);
  }

  const refMap = buildRefMap(env);

  if (opts.all || opts.showUndefined) {
    const undef = findUndefinedRefs(env);
    out(applyColor('yellow', `\nUndefined references (${undef.length}):`) );
    if (undef.length === 0) out('  (none)');
    else undef.forEach(k => out(`  ${applyColor('red', k)}`));
  }

  if (opts.all || opts.showUnreferenced) {
    const unref = findUnreferencedKeys(env);
    out(applyColor('cyan', `\nUnreferenced keys (${unref.length}):`) );
    if (unref.length === 0) out('  (none)');
    else unref.forEach(k => out(`  ${k}`));
  }

  if (opts.all || opts.showCircular) {
    const cycles = findCircularRefs(refMap);
    out(applyColor('magenta', `\nCircular references (${cycles.length}):`) );
    if (cycles.length === 0) out('  (none)');
    else cycles.forEach(chain => out(`  ${chain.join(' -> ')}`));
  }

  if (opts.all) {
    const refKeys = Object.keys(refMap);
    out(applyColor('green', `\nReference map (${refKeys.length} keys with refs):`) );
    if (refKeys.length === 0) out('  (none)');
    else refKeys.forEach(k => out(`  ${k} -> ${refMap[k].join(', ')}`));
  }
}

module.exports = { parseReferenceArgs, printUsage, runReference };
