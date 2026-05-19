import test from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config.js';
import { v3 } from '../src/v3.js';
import { validateV3Definition, createV3State, calculateV3Certification, v3Warnings, certifyAllV3, exportV3Bundle, importV3Bundle, buildV3Markdown, buildV3Csv, integrityHash, stableStringify, runV3SelfAudit } from '../src/v3-core.js';

test('v3 definition meets production schema depth', () => {
  assert.equal(validateV3Definition(v3), true);
  assert.equal(v3.productTier, 'release');
  assert.ok(v3.releaseChecklist.length >= 12);
  assert.ok(v3.qualityGates.length >= 8);
  assert.ok(v3.schemas.length >= 6);
});

test('v3 initial state is intentionally not release certified', () => {
  const state = createV3State(v3, '2026-01-01T00:00:00.000Z');
  const cert = calculateV3Certification(v3, state);
  assert.equal(state.checklist.length, v3.releaseChecklist.length);
  assert.notEqual(cert.status, 'release-certified');
  assert.ok(v3Warnings(v3, state).length > 0);
});

test('certifyAllV3 produces release certification', () => {
  const state = certifyAllV3(v3, createV3State(v3, '2026-01-01T00:00:00.000Z'));
  const cert = calculateV3Certification(v3, state);
  assert.equal(cert.status, 'release-certified');
  assert.equal(cert.certification, 100);
  assert.equal(v3Warnings(v3, state).length, 0);
});

test('v3 export/import round trip preserves certification hash', () => {
  const state = certifyAllV3(v3, createV3State(v3, '2026-01-01T00:00:00.000Z'));
  const bundle = exportV3Bundle(config, v3, state);
  const imported = importV3Bundle(config, v3, bundle);
  assert.deepEqual(imported.checklist, state.checklist);
  assert.equal(calculateV3Certification(v3, imported).hash, calculateV3Certification(v3, state).hash);
});

test('v3 import rejects wrong product slug', () => {
  const state = certifyAllV3(v3, createV3State(v3));
  const bundle = exportV3Bundle(config, v3, state);
  bundle.product.slug = 'wrong-slug';
  assert.throws(() => importV3Bundle(config, v3, bundle), /slug/);
});

test('v3 markdown certification is complete and client-safe', () => {
  const state = certifyAllV3(v3, createV3State(v3));
  const md = buildV3Markdown(config, v3, state);
  assert.match(md, /v3\.0 Production Certification/);
  assert.match(md, /Integrity hash/);
  assert.match(md, /Quality Gates/);
  assert.doesNotMatch(md, /password\s*:/i);
});

test('v3 csv export has every release gate', () => {
  const state = certifyAllV3(v3, createV3State(v3));
  const csv = buildV3Csv(v3, state);
  assert.equal(csv.split('\n').length, v3.releaseChecklist.length + 1);
  assert.match(csv, /severity/);
});

test('v3 integrity hash is deterministic and mutation-sensitive', () => {
  const state = certifyAllV3(v3, createV3State(v3, '2026-01-01T00:00:00.000Z'));
  const a = integrityHash(state);
  const b = integrityHash(JSON.parse(JSON.stringify(state)));
  const mutated = JSON.parse(JSON.stringify(state));
  mutated.checklist[0].notes += ' changed';
  assert.equal(a, b);
  assert.notEqual(a, integrityHash(mutated));
});

test('stableStringify ignores object key insertion order', () => {
  assert.equal(stableStringify({ b: 2, a: 1 }), stableStringify({ a: 1, b: 2 }));
});

test('v3 self audit reports bundle and export health', () => {
  const state = certifyAllV3(v3, createV3State(v3));
  const audit = runV3SelfAudit(config, v3, state);
  assert.equal(audit.definition, true);
  assert.equal(audit.certification.status, 'release-certified');
  assert.ok(audit.markdownBytes > 1000);
  assert.equal(audit.csvRows, v3.releaseChecklist.length + 1);
  assert.ok(audit.bundleHash.length >= 8);
});

test('v3 blocked gate prevents release certification', () => {
  const state = certifyAllV3(v3, createV3State(v3));
  state.checklist[0].status = 'blocked';
  const cert = calculateV3Certification(v3, state);
  assert.notEqual(cert.status, 'release-certified');
  assert.ok(v3Warnings(v3, state).some((w) => /blocked/i.test(w)));
});

test('v3 critical open gate prevents release certification', () => {
  const state = certifyAllV3(v3, createV3State(v3));
  state.checklist[0].status = 'draft';
  state.checklist[0].severity = 'critical';
  const cert = calculateV3Certification(v3, state);
  assert.notEqual(cert.status, 'release-certified');
  assert.ok(v3Warnings(v3, state).some((w) => /critical/i.test(w)));
});


test('v3 import rejects invalid status enum', () => {
  const state = certifyAllV3(v3, createV3State(v3));
  const bundle = exportV3Bundle(config, v3, state);
  bundle.state.checklist[0].status = 'totally-invalid';
  assert.throws(() => importV3Bundle(config, v3, bundle), /invalid status/);
});

test('v3 import rejects checklist label mismatch', () => {
  const state = certifyAllV3(v3, createV3State(v3));
  const bundle = exportV3Bundle(config, v3, state);
  bundle.state.checklist[0].label = 'tampered label';
  assert.throws(() => importV3Bundle(config, v3, bundle), /label mismatch/);
});
