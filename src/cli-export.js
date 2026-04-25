/**
 * cli-export.js — handles --export flag logic for the CLI
 * Writes or prints the report in the requested format.
 */

const fs = require('fs');
const path = require('path');
const { exportReport } = require('./exporter');

const SUPPORTED_FORMATS = ['json', 'csv'];

/**
 * Parses the --export and --output flags from argv.
 * @param {string[]} argv
 * @returns {{ format: string|null, outputPath: string|null }}
 */
function parseExportArgs(argv) {
  let format = null;
  let outputPath = null;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--export' && argv[i + 1]) {
      format = argv[i + 1].toLowerCase();
      i++;
    } else if (argv[i] === '--output' && argv[i + 1]) {
      outputPath = argv[i + 1];
      i++;
    }
  }

  return { format, outputPath };
}

/**
 * Validates the requested export format.
 * @param {string} format
 * @returns {boolean}
 */
function isValidFormat(format) {
  return SUPPORTED_FORMATS.includes(format);
}

/**
 * Runs the export step: serializes the report and writes to file or stdout.
 * @param {object} report
 * @param {string} format
 * @param {string|null} outputPath
 */
function runExport(report, format, outputPath) {
  if (!isValidFormat(format)) {
    process.stderr.write(
      `[envdiff] Unknown export format "${format}". Supported: ${SUPPORTED_FORMATS.join(', ')}\n`
    );
    process.exit(1);
  }

  const content = exportReport(report, format);

  if (outputPath) {
    const resolved = path.resolve(outputPath);
    fs.writeFileSync(resolved, content, 'utf8');
    process.stdout.write(`[envdiff] Report written to ${resolved}\n`);
  } else {
    process.stdout.write(content + '\n');
  }
}

module.exports = { parseExportArgs, isValidFormat, runExport, SUPPORTED_FORMATS };
