/**
 * cli-patch.js — CLI sub-command: patch an env file using another as the target.
 * Usage: envdiff patch <base.env> <target.env> [--apply] [--out <file>]
 */

const fs = require('fs');
const path = require('path');
const { loadEnvFile } = require('./loader');
const { buildPatch, applyPatch } = require('./patcher');
const { parseEnv } = require('./parser');

function parsePatchArgs(argv) {
  const args = argv.slice(2);
  const baseFile = args[0];
  const targetFile = args[1];
  const applyFlag = args.includes('--apply');
  const outIdx = args.indexOf('--out');
  const outFile = outIdx !== -1 ? args[outIdx + 1] : null;
  return { baseFile, targetFile, applyFlag, outFile };
}

function opsToEnvString(env) {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

function printOps(ops) {
  if (ops.length === 0) {
    console.log('No changes between the two files.');
    return;
  }
  for (const op of ops) {
    const prefix = op.op === 'add' ? '+' : op.op === 'remove' ? '-' : '~';
    const val = op.value !== undefined ? `=${op.value}` : '';
    console.log(`  ${prefix} ${op.key}${val}`);
  }
}

function runPatch(argv = process.argv) {
  const { baseFile, targetFile, applyFlag, outFile } = parsePatchArgs(argv);

  if (!baseFile || !targetFile) {
    console.error('Usage: envdiff patch <base.env> <target.env> [--apply] [--out <file>]');
    process.exit(1);
  }

  let base, target;
  try {
    base = loadEnvFile(baseFile);
    target = loadEnvFile(targetFile);
  } catch (err) {
    console.error(`Error loading files: ${err.message}`);
    process.exit(1);
  }

  const ops = buildPatch(base, target);
  console.log(`Patch from ${baseFile} → ${targetFile} (${ops.length} operation(s)):`);
  printOps(ops);

  if (applyFlag) {
    const { env: patched, log } = applyPatch(base, ops);
    const skipped = log.filter(l => l.status === 'skipped').length;
    const content = opsToEnvString(patched);

    if (outFile) {
      fs.writeFileSync(path.resolve(outFile), content, 'utf8');
      console.log(`\nPatched env written to ${outFile} (${skipped} skipped).`);
    } else {
      console.log('\nPatched env:');
      process.stdout.write(content);
    }
  }
}

module.exports = { parsePatchArgs, printOps, runPatch };
