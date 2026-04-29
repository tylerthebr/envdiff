#!/usr/bin/env node
// cli-alias.js — CLI interface for aliasing/renaming env keys

const fs = require('fs');
const path = require('path');
const { loadEnvFile } = require('./loader');
const { parseAliases, applyAliases } = require('./aliaser');

function printUsage() {
  console.log('Usage: envdiff alias <file> --map OLD=NEW [OLD=NEW ...] [--output <file>]');
  console.log('');
  console.log('Options:');
  console.log('  --map     One or more OLD=NEW alias mappings (required)');
  console.log('  --output  Write result to file instead of stdout');
  console.log('  --dry-run Show what would change without writing');
}

function parseAliasArgs(argv) {
  const args = { file: null, maps: [], output: null, dryRun: false };
  let i = 0;
  while (i < argv.length) {
    if (argv[i] === '--map') {
      i++;
      while (i < argv.length && !argv[i].startsWith('--')) {
        args.maps.push(argv[i++]);
      }
    } else if (argv[i] === '--output') {
      args.output = argv[++i];
      i++;
    } else if (argv[i] === '--dry-run') {
      args.dryRun = true;
      i++;
    } else if (!argv[i].startsWith('--') && !args.file) {
      args.file = argv[i++];
    } else {
      i++;
    }
  }
  return args;
}

function envToString(env) {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

function runAlias(argv) {
  const args = parseAliasArgs(argv);

  if (!args.file || args.maps.length === 0) {
    printUsage();
    process.exit(1);
  }

  const env = loadEnvFile(args.file);
  const aliases = parseAliases(args.maps);
  const { env: result, applied, notFound } = applyAliases(env, aliases);

  if (notFound.length > 0) {
    notFound.forEach(k => console.warn(`Warning: key not found: ${k}`));
  }

  if (args.dryRun) {
    applied.forEach(k => {
      const alias = aliases.find(a => a.oldKey === k);
      console.log(`  ${k} -> ${alias.newKey}`);
    });
    return;
  }

  const output = envToString(result);

  if (args.output) {
    fs.writeFileSync(path.resolve(args.output), output, 'utf8');
    console.log(`Written to ${args.output} (${applied.length} key(s) aliased)`);
  } else {
    process.stdout.write(output);
  }
}

module.exports = { parseAliasArgs, printUsage, runAlias };
