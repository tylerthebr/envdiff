// auditor.js — tracks changes between two env snapshots and produces an audit log

'use strict';

const { compareEnvs } = require('./comparator');

const AUDIT_ACTIONS = { added: 'ADDED', removed: 'REMOVED', changed: 'CHANGED', unchanged: 'UNCHANGED' };

function toAction(status) {
  return AUDIT_ACTIONS[status] || 'UNKNOWN';
}

function buildAuditEntry(key, prev, next, status) {
  return {
    key,
    action: toAction(status),
    prev: prev !== undefined ? prev : null,
    next: next !== undefined ? next : null,
    timestamp: new Date().toISOString(),
  };
}

function auditEnvs(prevEnv, nextEnv) {
  const results = compareEnvs(prevEnv, nextEnv);
  const entries = [];

  for (const { key, status, values } of results) {
    const prev = values ? values[0] : undefined;
    const next = values ? values[1] : undefined;
    entries.push(buildAuditEntry(key, prev, next, status));
  }

  return entries;
}

function filterAuditLog(entries, actions = []) {
  if (!actions.length) return entries;
  const set = new Set(actions.map(a => a.toUpperCase()));
  return entries.filter(e => set.has(e.action));
}

function buildAuditLog(prevEnv, nextEnv, options = {}) {
  const all = auditEnvs(prevEnv, nextEnv);
  const filtered = options.actions ? filterAuditLog(all, options.actions) : all;
  return {
    total: all.length,
    shown: filtered.length,
    entries: filtered,
  };
}

module.exports = { buildAuditEntry, auditEnvs, filterAuditLog, buildAuditLog, toAction };
