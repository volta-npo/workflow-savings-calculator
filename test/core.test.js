import test from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config.js';
import { assertValidConfig, createInitialState, calculateScore, readinessWarnings, buildMarkdownReport, applySampleData } from '../src/core.js';
test('configuration is valid and weighted to 100', () => {
    assert.equal(assertValidConfig(config), true);
    assert.equal(config.criteria.reduce((sum, item) => sum + item.weight, 0), 100);
});
test('initial state is not falsely launch ready', () => {
    const state = createInitialState(config, '2026-01-01T00:00:00.000Z');
    const result = calculateScore(config, state);
    assert.equal(result.score, 0);
    assert.match(result.label, /Not ready|At risk/);
    assert.ok(readinessWarnings(config, state).length >= 2);
});
test('approved criteria produce a launch-ready score', () => {
    const state = createInitialState(config, '2026-01-01T00:00:00.000Z');
    state.criteria = state.criteria.map((item) => ({ ...item, status: 'approved', evidence: 'verified evidence' }));
    state.approvals = { studentReview: true, mentorReview: true, ownerApproval: true };
    const result = calculateScore(config, state);
    assert.equal(result.score, 100);
    assert.equal(result.label, 'Launch-ready');
    assert.deepEqual(readinessWarnings(config, state), []);
});
test('markdown report includes project identity and warnings', () => {
    const state = applySampleData(config);
    const markdown = buildMarkdownReport(config, state);
    assert.match(markdown, new RegExp(config.title));
    assert.match(markdown, /Rubric Breakdown/);
    assert.match(markdown, /Next Actions/);
});
//# sourceMappingURL=core.test.js.map