/**
 * exporter.js — serializes comparison results to different output formats
 */

/**
 * Converts comparison results to a JSON-serializable structure.
 * @param {object} report - { files, results } from compareEnvs
 * @returns {object}
 */
function toJSON(report) {
  return {
    files: report.files,
    summary: report.summary,
    entries: report.results.map((entry) => ({
      key: entry.key,
      status: entry.status,
      values: entry.values,
    })),
  };
}

/**
 * Serializes report to a JSON string.
 * @param {object} report
 * @param {boolean} [pretty=true]
 * @returns {string}
 */
function toJSONString(report, pretty = true) {
  const data = toJSON(report);
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Converts comparison results to CSV format.
 * @param {object} report
 * @returns {string}
 */
function toCSV(report) {
  const header = ['key', 'status', ...report.files].join(',');
  const rows = report.results.map((entry) => {
    const values = report.files.map((f) => {
      const val = entry.values[f];
      if (val === undefined) return '';
      // quote values that contain commas or quotes
      if (/[,"\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
      return val;
    });
    return [entry.key, entry.status, ...values].join(',');
  });
  return [header, ...rows].join('\n');
}

/**
 * Exports report in the requested format.
 * @param {object} report
 * @param {'json'|'csv'} format
 * @returns {string}
 */
function exportReport(report, format) {
  switch (format) {
    case 'json':
      return toJSONString(report);
    case 'csv':
      return toCSV(report);
    default:
      throw new Error(`Unsupported export format: "${format}". Use 'json' or 'csv'.`);
  }
}

module.exports = { toJSON, toJSONString, toCSV, exportReport };
