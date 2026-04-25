// cli-profile.js — CLI handler for the `profile` subcommand
const path = require('path');
const { loadEnvFile } = require('./loader');
const { profileEnv, typeSummary } = require('./profiler');
const { applyColor } = require('./colors');

function parseProfileArgs(argv) {
  const args = argv.slice(2);
  const file = args.find(a => !a.startsWith('--'));
  const json = args.includes('--json');
  const summary = args.includes('--summary');
  return { file, json, summary };
}

function printUsage() {
  console.log('Usage: envdiff profile <file> [--json] [--summary]');
}

function printProfileTable(profile) {
  const header = applyColor('cyan', `${'KEY'.padEnd(30)} ${'TYPE'.padEnd(10)} LENGTH`);
  console.log(header);
  console.log('-'.repeat(50));
  for (const entry of profile) {
    const typeColor = entry.type === 'empty' ? 'red'
      : entry.type === 'secret' ? 'yellow'
      : 'green';
    const line = `${entry.key.padEnd(30)} ${applyColor(typeColor, entry.type.padEnd(10))} ${entry.length}`;
    console.log(line);
  }
}

function printSummaryTable(summary) {
  console.log(applyColor('cyan', '\nType Summary:'));
  for (const [type, count] of Object.entries(summary)) {
    console.log(`  ${type.padEnd(12)} ${count}`);
  }
}

function runProfile(argv = process.argv) {
  const { file, json, summary } = parseProfileArgs(argv);

  if (!file) {
    printUsage();
    process.exit(1);
  }

  const resolved = path.resolve(file);
  const env = loadEnvFile(resolved);
  const profile = profileEnv(env);

  if (json) {
    const out = summary ? { profile, summary: typeSummary(profile) } : profile;
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  console.log(applyColor('cyan', `\nProfile: ${file}\n`));
  printProfileTable(profile);

  if (summary) {
    printSummaryTable(typeSummary(profile));
  }
}

module.exports = { parseProfileArgs, printUsage, runProfile };
