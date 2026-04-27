const { detectEncoding, inspectEncryption, scanEncryption, encryptedEntries, encryptionSummary } = require('./encryptr');

describe('detectEncoding', () => {
  it('detects JWT tokens', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(detectEncoding(jwt)).toBe('jwt');
  });

  it('detects prefixed encrypted values', () => {
    expect(detectEncoding('enc:someencryptedblob')).toBe('prefixed');
    expect(detectEncoding('ENC:anotherblob')).toBe('prefixed');
  });

  it('detects hex strings', () => {
    expect(detectEncoding('a3f1c2d4e5b6a7f8c9d0e1f2a3b4c5d6')).toBe('hex');
  });

  it('detects base64 strings', () => {
    expect(detectEncoding('dGhpcyBpcyBhIHRlc3Q=')).toBe('base64');
  });

  it('returns plain for normal values', () => {
    expect(detectEncoding('hello')).toBe('plain');
    expect(detectEncoding('true')).toBe('plain');
    expect(detectEncoding('')).toBe('plain');
  });
});

describe('inspectEncryption', () => {
  it('marks encrypted entry correctly', () => {
    const result = inspectEncryption({ key: 'SECRET', value: 'dGhpcyBpcyBhIHRlc3Q=' });
    expect(result.isEncrypted).toBe(true);
    expect(result.encoding).toBe('base64');
    expect(result.key).toBe('SECRET');
  });

  it('marks plain entry correctly', () => {
    const result = inspectEncryption({ key: 'APP_NAME', value: 'myapp' });
    expect(result.isEncrypted).toBe(false);
    expect(result.encoding).toBe('plain');
  });
});

describe('scanEncryption', () => {
  it('returns inspection for all entries', () => {
    const entries = [
      { key: 'A', value: 'plain' },
      { key: 'B', value: 'dGhpcyBpcyBhIHRlc3Q=' },
    ];
    const result = scanEncryption(entries);
    expect(result).toHaveLength(2);
    expect(result[0].isEncrypted).toBe(false);
    expect(result[1].isEncrypted).toBe(true);
  });
});

describe('encryptedEntries', () => {
  it('filters to only encrypted entries', () => {
    const entries = [
      { key: 'A', value: 'hello' },
      { key: 'B', value: 'enc:secret' },
      { key: 'C', value: 'a3f1c2d4e5b6a7f8c9d0e1f2a3b4c5d6' },
    ];
    const result = encryptedEntries(entries);
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.key)).toEqual(['B', 'C']);
  });
});

describe('encryptionSummary', () => {
  it('returns correct summary counts', () => {
    const entries = [
      { key: 'A', value: 'plain' },
      { key: 'B', value: 'enc:secret' },
      { key: 'C', value: 'dGhpcyBpcyBhIHRlc3Q=' },
    ];
    const summary = encryptionSummary(entries);
    expect(summary.total).toBe(3);
    expect(summary.encrypted).toBe(2);
    expect(summary.encodings.plain).toBe(1);
    expect(summary.encodings.prefixed).toBe(1);
    expect(summary.encodings.base64).toBe(1);
  });
});
