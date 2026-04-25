const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseProfileArgs, runProfile } = require('./cli-profile');

function writeTempEnv(content) {
  const file = path.join(os.tmpdir(), `envdiff-profile-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('parseProfileArgs', () => {
  test('parses file argument', () => {
    const result = parseProfileArgs(['node', 'cli', '.env']);
    expect(result.file).toBe('.env');
    expect(result.json).toBe(false);
    expect(result.summary).toBe(false);
  });

  test('parses --json flag', () => {
    const result = parseProfileArgs(['node', 'cli', '.env', '--json']);
    expect(result.json).toBe(true);
  });

  test('parses --summary flag', () => {
    const result = parseProfileArgs(['node', 'cli', '.env', '--summary']);
    expect(result.summary).toBe(true);
  });

  test('no file returns undefined', () => {
    const result = parseProfileArgs(['node', 'cli', '--json']);
    expect(result.file).toBeUndefined();
  });
});

describe('runProfile', () => {
  let tmpFile;
  let spy;

  beforeEach(() => {
    tmpFile = writeTempEnv('PORT=3000\nDEBUG=true\nSECRET_KEY=abcdefghijklmnopqrstuvwxyz012345\nEMPTY=\n');
    spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
    fs.unlinkSync(tmpFile);
  });

  test('outputs profile table for valid file', () => {
    runProfile(['node', 'cli', tmpFile]);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toMatch(/PORT/);
    expect(output).toMatch(/DEBUG/);
  });

  test('outputs JSON when --json flag is set', () => {
    runProfile(['node', 'cli', tmpFile, '--json']);
    const jsonCall = spy.mock.calls.find(c => {
      try { JSON.parse(c[0]); return true; } catch { return false; }
    });
    expect(jsonCall).toBeDefined();
    const parsed = JSON.parse(jsonCall[0]);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.find(e => e.key === 'PORT').type).toBe('integer');
  });

  test('includes summary in JSON when both flags set', () => {
    runProfile(['node', 'cli', tmpFile, '--json', '--summary']);
    const jsonCall = spy.mock.calls.find(c => {
      try { const p = JSON.parse(c[0]); return p.summary !== undefined; } catch { return false; }
    });
    expect(jsonCall).toBeDefined();
    const parsed = JSON.parse(jsonCall[0]);
    expect(parsed.summary).toBeDefined();
    expect(parsed.summary.integer).toBeGreaterThanOrEqual(1);
  });

  test('exits with code 1 when no file given', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runProfile(['node', 'cli'])).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
