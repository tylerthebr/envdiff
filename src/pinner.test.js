const { buildPin, pinEnv, detectDrift, hasDrift } = require('./pinner');

describe('buildPin', () => {
  it('creates a pin entry with key and value', () => {
    const pin = buildPin('PORT', '3000');
    expect(pin.key).toBe('PORT');
    expect(pin.value).toBe('3000');
    expect(typeof pin.pinnedAt).toBe('string');
  });
});

describe('pinEnv', () => {
  it('builds a pin map from an env object', () => {
    const env = { PORT: '3000', HOST: 'localhost' };
    const pins = pinEnv(env);
    expect(pins.PORT.value).toBe('3000');
    expect(pins.HOST.value).toBe('localhost');
    expect(Object.keys(pins)).toHaveLength(2);
  });
});

describe('detectDrift', () => {
  const pins = {
    PORT: { key: 'PORT', value: '3000', pinnedAt: '' },
    HOST: { key: 'HOST', value: 'localhost', pinnedAt: '' },
    OLD:  { key: 'OLD',  value: 'yes',       pinnedAt: '' },
  };

  it('marks unchanged keys as ok', () => {
    const env = { PORT: '3000', HOST: 'localhost', OLD: 'yes' };
    const drift = detectDrift(env, pins);
    expect(drift.every(e => e.status === 'ok')).toBe(true);
  });

  it('marks changed values', () => {
    const env = { PORT: '4000', HOST: 'localhost', OLD: 'yes' };
    const drift = detectDrift(env, pins);
    const portEntry = drift.find(e => e.key === 'PORT');
    expect(portEntry.status).toBe('changed');
    expect(portEntry.pinned).toBe('3000');
    expect(portEntry.current).toBe('4000');
  });

  it('marks removed keys', () => {
    const env = { PORT: '3000', HOST: 'localhost' };
    const drift = detectDrift(env, pins);
    const oldEntry = drift.find(e => e.key === 'OLD');
    expect(oldEntry.status).toBe('removed');
    expect(oldEntry.current).toBeUndefined();
  });

  it('marks added keys', () => {
    const env = { PORT: '3000', HOST: 'localhost', OLD: 'yes', NEW: 'value' };
    const drift = detectDrift(env, pins);
    const newEntry = drift.find(e => e.key === 'NEW');
    expect(newEntry.status).toBe('added');
    expect(newEntry.pinned).toBeUndefined();
  });
});

describe('hasDrift', () => {
  it('returns false when all entries are ok', () => {
    expect(hasDrift([{ status: 'ok' }, { status: 'ok' }])).toBe(false);
  });

  it('returns true when any entry is not ok', () => {
    expect(hasDrift([{ status: 'ok' }, { status: 'changed' }])).toBe(true);
  });
});
