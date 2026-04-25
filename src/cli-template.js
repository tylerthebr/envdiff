/**
 * CLI handler for the --template export feature
 * Writes a .env.example file from the comparison result
 */

const fs = require('fs');
const path = require('path');
const { generateTemplate } = require('./template');

/**
 * Parse template-related CLI args
 * @param {string[]} argv
 * @returns {{ outputPath: string|null, unsorted: boolean }}
 */
function parseTemplateArgs(argv) {
  let outputPath = null;
  let unsorted = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--template-out' && argv[i + 1]) {
      outputPath = argv[++i];
    }
    if (argv[i] === '--unsorted') {
      unsorted = true;
    }
  }

  return { outputPath, unsorted };
}

/**
 * Write a template file from comparison entries
 * @param {Array<{key: string}>} entries
 * @param {string} outputPath
 * @param {Object} [options]
 * @returns {{ written: boolean, path: string, lines: number }}
 */
function writeTemplate(entries, outputPath, options = {}) {
  const content = generateTemplate(entries, options);
  const resolved = path.resolve(outputPath);
  fs.writeFileSync(resolved, content, 'utf8');
  const lines = content.split('\n').filter(Boolean).length;
  return { written: true, path: resolved, lines };
}

/**
 * Run the template CLI action
 * @param {Array<{key: string}>} entries
 * @param {string[]} argv
 * @param {Object} [io]
 * @returns {boolean} true if template was written
 */
function runTemplate(entries, argv, io = {}) {
  const { log = console.log, error = console.error } = io;
  const { outputPath, unsorted } = parseTemplateArgs(argv);

  if (!outputPath) return false;

  try {
    const result = writeTemplate(entries, outputPath, { sorted: !unsorted });
    log(`Template written to ${result.path} (${result.lines} keys)`);
    return true;
  } catch (err) {
    error(`Failed to write template: ${err.message}`);
    return false;
  }
}

module.exports = { parseTemplateArgs, writeTemplate, runTemplate };
