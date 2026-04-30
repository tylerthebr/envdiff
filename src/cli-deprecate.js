#!/usr/bin/env node
// cli-deprecate.js — CLI for scanning .env files for deprecated keys

const fs = require('fs');
const path = require('path');
const { loadEnvFile } = require('./loader');
const { scanDeprecations, getDeprecatedEntries, hasDeprecations } = require('./deprecator');
const { applyColor } = require('./colors');

function printUsage() {
  console.log('Usage: envdiff deprecate <envfile> --map <mapfile>');
  console.log('  <envfile>   Path to the .env file to scan');
  console.log('  --map       Path to JSON file mapping OLD_KEY -> NEW_KEY (or null)');
}

function parseDeprecateArgs(argv) {
  const args = argv.slice(2);
  const mapIdx = args.indexOf('--map');
  if (args.length < 1 || mapIdx === -1 || mapIdx + 1 >= args.length) return null;
  return {
    envFile: args[0],
    mapFile: args[mapIdx + 1],
  };
}

function loadDeprecationMap(mapFile) {
  const abs = path.resolve(mapFile);
  if (!fs.existsSync(abs)) throw new Error(`Map file not found: ${mapFile}`);
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

function runDeprecate(argv, out = console) {
  const opts = parseDeprecateArgs(argv);
  if (!opts) {
    printUsage();
    return 1;
  }

  let env, deprecationMap;
  try {
    env = loadEnvFile(opts.envFile);
    deprecationMap = loadDeprecationMap(opts.mapFile);
  } catch (err) {
    out.error(err.message);
    return 1;
  }

  const entries = scanDeprecations(env, deprecationMap);
  const deprecated = getDeprecatedEntries(entries);

  out.log(applyColor('bold', `Scanning: ${opts.envFile}`));
  out.log(`Total keys: ${entries.length}`);

  if (!hasDeprecations(entries)) {
    out.log(applyColor('green', '✔ No deprecated keys found.'));
    return 0;
  }

  out.log(applyColor('yellow', `⚠ ${deprecated.length} deprecated key(s) found:\n`));
  for (const entry of deprecated) {
    const repl = entry.replacement
      ? applyColor('cyan', `→ use ${entry.replacement}`)
      : applyColor('red', '→ no replacement');
    out.log(`  ${applyColor('yellow', entry.key)}  ${repl}`);
  }

  return 1;
}

module.exports = { parseDeprecateArgs, loadDeprecationMap, printUsage, runDeprecate };

if (require.main === module) {
  process.exit(runDeprecate(process.argv));
}
