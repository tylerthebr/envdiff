#!/usr/bin/env node
// CLI command: envdiff redact <file> [--show-keys] [--pattern <regex>]

const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');
const { redactEntries, REDACTED } = require('./redactor');
const { applyColor } = require('./colors');

function parseRedactArgs(argv) {
  const args = { file: null, showKeys: false, patterns: [] };
  let i = 0;
  while (i < argv.length) {
    if (argv[i] === '--show-keys') {
      args.showKeys = true;
    } else if (argv[i] === '--pattern' && argv[i + 1]) {
      args.patterns.push(new RegExp(argv[i + 1], 'i'));
      i++;
    } else if (!argv[i].startsWith('--')) {
      args.file = argv[i];
    }
    i++;
  }
  return args;
}

function printUsage() {
  console.log('Usage: envdiff redact <file> [--show-keys] [--pattern <regex>]');
  console.log('  --show-keys       Print key names alongside redacted values');
  console.log('  --pattern <regex> Additional sensitive key pattern (repeatable)');
}

function runRedact(argv, { stdout = console.log, stderr = console.error } = {}) {
  const args = parseRedactArgs(argv);

  if (!args.file) {
    printUsage();
    return 1;
  }

  const filePath = path.resolve(args.file);
  if (!fs.existsSync(filePath)) {
    stderr(`Error: file not found: ${filePath}`);
    return 1;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const env = parseEnv(raw);
  const patterns = args.patterns.length > 0 ? args.patterns : undefined;
  const entries = redactEntries(env, patterns);

  let redactedCount = 0;
  for (const entry of entries) {
    if (entry.redacted) {
      redactedCount++;
      const line = args.showKeys
        ? `${applyColor('dim', entry.key)}=${applyColor('red', entry.value)}`
        : `${entry.key}=${entry.value}`;
      stdout(line);
    } else {
      stdout(`${entry.key}=${entry.value}`);
    }
  }

  stdout('');
  stdout(
    applyColor('yellow', `Redacted ${redactedCount} of ${entries.length} keys.`)
  );
  return 0;
}

module.exports = { parseRedactArgs, runRedact };
