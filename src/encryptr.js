// encryptr.js — detect and flag encrypted/base64 values in env files

const BASE64_RE = /^[A-Za-z0-9+/]{16,}={0,2}$/;
const HEX_RE = /^[0-9a-fA-F]{32,}$/;
const JWT_RE = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const ENCRYPTED_PREFIX_RE = /^(enc:|ENC:|encrypted:)/i;

/**
 * @param {string} value
 * @returns {'jwt'|'base64'|'hex'|'prefixed'|'plain'}
 */
function detectEncoding(value) {
  if (!value) return 'plain';
  if (JWT_RE.test(value)) return 'jwt';
  if (ENCRYPTED_PREFIX_RE.test(value)) return 'prefixed';
  if (HEX_RE.test(value)) return 'hex';
  if (BASE64_RE.test(value)) return 'base64';
  return 'plain';
}

/**
 * @param {{ key: string, value: string }} entry
 * @returns {{ key: string, value: string, encoding: string, isEncrypted: boolean }}
 */
function inspectEncryption(entry) {
  const encoding = detectEncoding(entry.value);
  return {
    key: entry.key,
    value: entry.value,
    encoding,
    isEncrypted: encoding !== 'plain',
  };
}

/**
 * @param {Array<{ key: string, value: string }>} entries
 * @returns {Array<{ key: string, value: string, encoding: string, isEncrypted: boolean }>}
 */
function scanEncryption(entries) {
  return entries.map(inspectEncryption);
}

/**
 * @param {Array<{ key: string, value: string }>} entries
 * @returns {Array<{ key: string, value: string, encoding: string, isEncrypted: boolean }>}
 */
function encryptedEntries(entries) {
  return scanEncryption(entries).filter((e) => e.isEncrypted);
}

/**
 * @param {Array<{ key: string, value: string }>} entries
 * @returns {{ total: number, encrypted: number, encodings: Record<string, number> }}
 */
function encryptionSummary(entries) {
  const scanned = scanEncryption(entries);
  const encodings = {};
  for (const e of scanned) {
    encodings[e.encoding] = (encodings[e.encoding] || 0) + 1;
  }
  return {
    total: scanned.length,
    encrypted: scanned.filter((e) => e.isEncrypted).length,
    encodings,
  };
}

module.exports = { detectEncoding, inspectEncryption, scanEncryption, encryptedEntries, encryptionSummary };
