import test from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config.js';
import { v1 } from '../src/v1.js';
import { validateV1Definition, createV1State, calculateV1Metrics, v1ValidationWarnings, buildV1Packet, buildV1Csv, applyV1Sample } from '../src/v1-core.js';
test('v1 definition is product-specific and complete', () => {
    assert.equal(validateV1Definition(v1), true);
    assert.equal(v1.rows.length >= 8, true);
    assert.equal(v1.metrics.length, 3);
    assert.equal(new Set(v1.rows).size, v1.rows.length);
});
test('v1 initial state has warnings and rows', () => {
    const state = createV1State(v1, '2026-01-01T00:00:00.000Z');
    assert.equal(state.rows.length, v1.rows.length);
    assert.ok(v1ValidationWarnings(v1, state).length > 0);
});
test('v1 sample reaches launch threshold without blockers', () => {
    const state = applyV1Sample(v1);
    const metrics = calculateV1Metrics(v1, state);
    assert.ok(metrics[0].value >= 80);
    assert.ok(metrics[1].value >= 90);
    assert.equal(state.rows.filter((r) => r.status === 'blocked').length, 0);
});
test('v1 packet and csv exports include domain content', () => {
    const state = applyV1Sample(v1);
    const packet = buildV1Packet(config, v1, state);
    const csv = buildV1Csv(v1, state);
    assert.match(packet, new RegExp(v1.workbench.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(packet, /v1\.0 Product Packet/);
    assert.ok(csv.split('\n').length > v1.rows.length);
    assert.match(csv, /status,score,owner/);
});
//# sourceMappingURL=v1.test.js.map