const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');

/**
 * Resolves and loads one or more .env files from disk.
 * Returns an object keyed by a label (filename or alias).
 */
function loadEnvFiles(filePaths) {
  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    throw new Error('loadEnvFiles requires a non-empty array of file paths');
  }

  const result = {};

  for (const filePath of filePaths) {
    const resolved = path.resolve(filePath);

    if (!fs.existsSync(resolved)) {
      throw new Error(`File not found: ${resolved}`);
    }

    const raw = fs.readFileSync(resolved, 'utf8');
    const label = path.basename(resolved);

    if (result[label]) {
      throw new Error(`Duplicate file label "${label}". Use unique filenames or rename files.`);
    }

    result[label] = parseEnv(raw);
  }

  return result;
}

/**
 * Loads a single .env file and returns its parsed key/value map.
 */
function loadEnvFile(filePath) {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const raw = fs.readFileSync(resolved, 'utf8');
  return parseEnv(raw);
}

module.exports = { loadEnvFiles, loadEnvFile };
