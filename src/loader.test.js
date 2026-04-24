const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadEnvFiles, loadEnvFile } = require('./loader');

function writeTempFile(name, content) {
  const filePath = path.join(os.tmpdir(), name);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

describe('loadEnvFile', () => {
  it('parses a single env file correctly', () => {
    const p = writeTempFile('.env.test', 'FOO=bar\nBAZ=qux\n');
    const result = loadEnvFile(p);
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('throws when file does not exist', () => {
    expect(() => loadEnvFile('/nonexistent/.env')).toThrow('File not found');
  });
});

describe('loadEnvFiles', () => {
  it('loads multiple env files keyed by basename', () => {
    const p1 = writeTempFile('.env.dev', 'KEY=dev_value\n');
    const p2 = writeTempFile('.env.prod', 'KEY=prod_value\nEXTRA=yes\n');
    const result = loadEnvFiles([p1, p2]);
    expect(Object.keys(result)).toEqual(['.env.dev', '.env.prod']);
    expect(result['.env.dev']).toEqual({ KEY: 'dev_value' });
    expect(result['.env.prod']).toEqual({ KEY: 'prod_value', EXTRA: 'yes' });
  });

  it('throws on empty array', () => {
    expect(() => loadEnvFiles([])).toThrow('non-empty array');
  });

  it('throws when a file is missing', () => {
    expect(() => loadEnvFiles(['/no/such/.env'])).toThrow('File not found');
  });

  it('throws on duplicate basenames', () => {
    const p1 = writeTempFile('.env.dup', 'A=1\n');
    // same basename from two different dirs would conflict; simulate by passing same path twice
    expect(() => loadEnvFiles([p1, p1])).toThrow('Duplicate file label');
  });
});
