// Inspects a single .env file and reports key stats, types, and anomalies

const { parseEnv } = require('./parser');
const { isSensitiveKey } = require('./redactor');
const { findWarnings } = require('./validator');

function classifyValue(value) {
  if (value === '') return 'empty';
  if (/^\d+$/.test(value)) return 'integer';
  if (/^\d*\.\d+$/.test(value)) return 'float';
  if (/^(true|false)$/i.test(value)) return 'boolean';
  if (/^https?:\/\//.test(value)) return 'url';
  if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(value)) return 'email';
  return 'string';
}

function inspectEntry(key, value) {
  return {
    key,
    value,
    type: classifyValue(value),
    sensitive: isSensitiveKey(key),
    empty: value === '',
    warnings: findWarnings({ key, value }),
  };
}

function inspectEnv(parsed) {
  const entries = Object.entries(parsed).map(([key, value]) =>
    inspectEntry(key, value)
  );

  const stats = {
    total: entries.length,
    empty: entries.filter((e) => e.empty).length,
    sensitive: entries.filter((e) => e.sensitive).length,
    withWarnings: entries.filter((e) => e.warnings.length > 0).length,
    types: entries.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {}),
  };

  return { entries, stats };
}

function inspectFile(content) {
  const parsed = parseEnv(content);
  return inspectEnv(parsed);
}

module.exports = { classifyValue, inspectEntry, inspectEnv, inspectFile };
