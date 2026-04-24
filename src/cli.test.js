const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const CLI = path.resolve(__dirname, 'cli.js');

function writeTempEnv(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

function runCli(args, options = {}) {
  try {
    const stdout = execFileSync('node', [CLI, ...args], {
      encoding: 'utf8',
      ...options,
    });
    return { stdout, exitCode: 0 };
  } catch (err) {
    return { stdout: err.stdout || '', stderr: err.stderr || '', exitCode: err.status };
  }
}

describe('cli', () => {
  it('prints usage with --help', () => {
    const { stdout, exitCode } = runCli(['--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/Usage/);
  });

  it('prints usage with no args', () => {
    const { exitCode } = runCli([]);
    expect(exitCode).toBe(0);
  });

  it('exits 1 with fewer than 2 files', () => {
    const p = writeTempEnv('.env.only', 'A=1\n');
    const { exitCode } = runCli([p]);
    expect(exitCode).toBe(1);
  });

  it('exits 0 when files are identical', () => {
    const p1 = writeTempEnv('.env.a', 'FOO=1\nBAR=2\n');
    const p2 = writeTempEnv('.env.b', 'FOO=1\nBAR=2\n');
    const { exitCode } = runCli([p1, p2]);
    expect(exitCode).toBe(0);
  });

  it('exits 1 with --strict when files differ', () => {
    const p1 = writeTempEnv('.env.x', 'FOO=1\n');
    const p2 = writeTempEnv('.env.y', 'FOO=1\nBAR=2\n');
    const { exitCode } = runCli([p1, p2, '--strict']);
    expect(exitCode).toBe(1);
  });

  it('exits 0 without --strict even when files differ', () => {
    const p1 = writeTempEnv('.env.m', 'FOO=1\n');
    const p2 = writeTempEnv('.env.n', 'FOO=1\nBAR=2\n');
    const { exitCode } = runCli([p1, p2]);
    expect(exitCode).toBe(0);
  });
});
