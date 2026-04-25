const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseInspectArgs, runInspect } = require('./cli-inspect');

function writeTempEnv(content) {
  const file = path.join(os.tmpdir(), `envdiff-inspect-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('parseInspectArgs', () => {
  it('parses file and flags', () => {
    const args = ['node', 'cli-inspect.js', '.env', '--verbose', '--no-color'];
    const result = parseInspectArgs(args);
    expect(result.file).toBe('.env');
    expect(result.verbose).toBe(true);
    expect(result.noColor).toBe(true);
  });

  it('defaults flags to false', () => {
    const result = parseInspectArgs(['node', 'cli-inspect.js', '.env']);
    expect(result.verbose).toBe(false);
    expect(result.noColor).toBe(false);
  });

  it('returns undefined file when not provided', () => {
    const result = parseInspectArgs(['node', 'cli-inspect.js', '--verbose']);
    expect(result.file).toBeUndefined();
  });
});

describe('runInspect', () => {
  it('returns stats for a valid env file', () => {
    const file = writeTempEnv('PORT=3000\nDEBUG=true\nSECRET=\n');
    const { stats } = runInspect(['node', 'cli-inspect.js', file]);
    expect(stats.total).toBe(3);
    expect(stats.empty).toBe(1);
    fs.unlinkSync(file);
  });

  it('returns entries with correct types', () => {
    const file = writeTempEnv('PORT=8080\nUSE_SSL=false\nAPI_URL=https://api.example.com\n');
    const { entries } = runInspect(['node', 'cli-inspect.js', file]);
    const port = entries.find((e) => e.key === 'PORT');
    expect(port.type).toBe('integer');
    const ssl = entries.find((e) => e.key === 'USE_SSL');
    expect(ssl.type).toBe('boolean');
    fs.unlinkSync(file);
  });

  it('exits with code 1 for missing file', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() =>
      runInspect(['node', 'cli-inspect.js', '/nonexistent/path/.env'])
    ).toThrow('exit');
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
