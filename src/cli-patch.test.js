const fs = require('fs');
const os = require('os');
const path = require('path');
const { parsePatchArgs } = require('./cli-patch');
const { buildPatch, applyPatch } = require('./patcher');

function writeTempEnv(content) {
  const file = path.join(os.tmpdir(), `envdiff-patch-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('parsePatchArgs', () => {
  test('parses base and target files', () => {
    const args = ['node', 'cli', 'base.env', 'prod.env'];
    const result = parsePatchArgs(args);
    expect(result.baseFile).toBe('base.env');
    expect(result.targetFile).toBe('prod.env');
    expect(result.applyFlag).toBe(false);
    expect(result.outFile).toBeNull();
  });

  test('detects --apply flag', () => {
    const args = ['node', 'cli', 'a.env', 'b.env', '--apply'];
    expect(parsePatchArgs(args).applyFlag).toBe(true);
  });

  test('parses --out file', () => {
    const args = ['node', 'cli', 'a.env', 'b.env', '--apply', '--out', 'result.env'];
    const result = parsePatchArgs(args);
    expect(result.outFile).toBe('result.env');
  });

  test('returns nulls when files not provided', () => {
    const result = parsePatchArgs(['node', 'cli']);
    expect(result.baseFile).toBeUndefined();
    expect(result.targetFile).toBeUndefined();
  });
});

describe('patch integration', () => {
  test('buildPatch + applyPatch roundtrip with real env content', () => {
    const baseContent = 'HOST=localhost\nPORT=3000\nDEBUG=true\n';
    const targetContent = 'HOST=prod.example.com\nPORT=443\nSECRET=abc123\n';

    const base = Object.fromEntries(
      baseContent.trim().split('\n').map(l => l.split('='))
    );
    const target = Object.fromEntries(
      targetContent.trim().split('\n').map(l => l.split('='))
    );

    const ops = buildPatch(base, target);
    const { env } = applyPatch(base, ops);

    expect(env).toEqual(target);
  });

  test('no ops when files are identical', () => {
    const env = { A: '1', B: '2' };
    const ops = buildPatch(env, { ...env });
    expect(ops).toHaveLength(0);
  });

  test('apply with --out writes file', () => {
    const outFile = path.join(os.tmpdir(), `envdiff-out-${Date.now()}.env`);
    const base = { A: '1' };
    const target = { A: '2', B: '3' };
    const ops = buildPatch(base, target);
    const { env } = applyPatch(base, ops);
    const content = Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
    fs.writeFileSync(outFile, content, 'utf8');
    const written = fs.readFileSync(outFile, 'utf8');
    expect(written).toContain('A=2');
    expect(written).toContain('B=3');
    fs.unlinkSync(outFile);
  });
});
