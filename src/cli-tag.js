// cli-tag.js — CLI interface for tagging feature
const fs = require('fs');
const { loadEnvFile } = require('./loader');
const { buildTagMap, filterByTag, listAllTags, annotateEntries } = require('./tagger');
const { formatTagReport } = require('./tag-formatter');
const { applyColor } = require('./colors');

function printUsage() {
  console.log('Usage: envdiff tag <file> [--filter <tag>] [--list]');
  console.log('  --filter <tag>   Show only entries with this tag');
  console.log('  --list           List all tags found in file');
}

function parseTagArgs(argv) {
  const args = argv.slice(2);
  const file = args[0];
  const filterIdx = args.indexOf('--filter');
  const filterTag = filterIdx !== -1 ? args[filterIdx + 1] : null;
  const listOnly = args.includes('--list');
  return { file, filterTag, listOnly };
}

function runTag(argv, log = console.log, err = console.error) {
  const { file, filterTag, listOnly } = parseTagArgs(argv);

  if (!file) {
    printUsage();
    return 1;
  }

  let raw, entries;
  try {
    raw = fs.readFileSync(file, 'utf8');
    entries = loadEnvFile(file);
  } catch (e) {
    err(applyColor(`Error reading file: ${e.message}`, 'red'));
    return 1;
  }

  const lines = raw.split('\n');
  const tagMap = buildTagMap(entries, lines);

  if (listOnly) {
    const tags = listAllTags(tagMap);
    if (tags.length === 0) {
      log(applyColor('No tags found.', 'yellow'));
    } else {
      log(applyColor('Tags found:', 'bold'));
      tags.forEach(t => log(`  @${t}`));
    }
    return 0;
  }

  const filtered = filterTag ? filterByTag(entries, tagMap, filterTag) : entries;
  const annotated = annotateEntries(filtered, tagMap);
  const title = filterTag ? `Tagged: @${filterTag}` : `All Tags — ${file}`;
  log(formatTagReport(annotated, title));
  return 0;
}

module.exports = { parseTagArgs, printUsage, runTag };
