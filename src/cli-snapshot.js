#!/usr/bin/env node
// cli-snapshot.js — CLI for saving and diffing env snapshots

const path = require('path');
const { loadEnvFile } = require('./loader');
const { saveSnapshot, loadSnapshot, diffSnapshots, listSnapshots } = require('./snapshotter');
const { formatSnapshotDiff, formatSnapshotSummary } = require('./snapshot-formatter');

const DEFAULT_DIR = '.env-snapshots';

function printUsage() {
  console.log('Usage:');
  console.log('  envdiff snapshot save <file> [--dir <dir>] [--label <label>]');
  console.log('  envdiff snapshot diff <snap1> <snap2>');
  console.log('  envdiff snapshot list [--dir <dir>]');
}

function parseSnapshotArgs(argv) {
  const [cmd, ...rest] = argv;
  const args = { cmd, files: [], dir: DEFAULT_DIR, label: '' };
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--dir') { args.dir = rest[++i]; }
    else if (rest[i] === '--label') { args.label = rest[++i]; }
    else args.files.push(rest[i]);
  }
  return args;
}

async function runSnapshot(argv) {
  const args = parseSnapshotArgs(argv);

  if (args.cmd === 'save') {
    if (!args.files[0]) { printUsage(); process.exit(1); }
    const env = loadEnvFile(args.files[0]);
    const saved = saveSnapshot(env, args.dir, args.label);
    console.log(`Snapshot saved: ${saved}`);
    return;
  }

  if (args.cmd === 'diff') {
    if (args.files.length < 2) { printUsage(); process.exit(1); }
    const snapA = loadSnapshot(args.files[0]);
    const snapB = loadSnapshot(args.files[1]);
    const diff = diffSnapshots(snapA, snapB);
    console.log(formatSnapshotDiff(snapA, snapB, diff));
    console.log(formatSnapshotSummary(diff));
    return;
  }

  if (args.cmd === 'list') {
    const files = listSnapshots(args.dir);
    if (!files.length) { console.log('No snapshots found.'); return; }
    files.forEach(f => console.log(path.join(args.dir, f)));
    return;
  }

  printUsage();
  process.exit(1);
}

module.exports = { parseSnapshotArgs, printUsage, runSnapshot };
