// typecheck.js — validates env values against expected types

const TYPES = ['string', 'number', 'boolean', 'url', 'email', 'json'];

function isValidType(type) {
  return TYPES.includes(type);
}

function checkString(value) {
  return typeof value === 'string';
}

function checkNumber(value) {
  return value !== '' && !isNaN(Number(value));
}

function checkBoolean(value) {
  return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase());
}

function checkUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function checkEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function checkJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function checkValue(value, type) {
  switch (type) {
    case 'string':  return checkString(value);
    case 'number':  return checkNumber(value);
    case 'boolean': return checkBoolean(value);
    case 'url':     return checkUrl(value);
    case 'email':   return checkEmail(value);
    case 'json':    return checkJson(value);
    default:        return false;
  }
}

function typecheckEnv(env, schema) {
  const results = [];
  for (const [key, expectedType] of Object.entries(schema)) {
    const value = env[key];
    if (value === undefined) {
      results.push({ key, expectedType, value: undefined, pass: false, reason: 'missing' });
    } else {
      const pass = checkValue(value, expectedType);
      results.push({ key, expectedType, value, pass, reason: pass ? 'ok' : 'type_mismatch' });
    }
  }
  return results;
}

function hasTypeErrors(results) {
  return results.some(r => !r.pass);
}

module.exports = { TYPES, isValidType, checkValue, typecheckEnv, hasTypeErrors };
