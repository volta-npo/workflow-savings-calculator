import test from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config.js';
import { domain } from '../src/domain.js';
import { validateDomainDefinition, createDomainState, calculateDomain, generateDomainArtifacts, buildDomainMarkdown, applyDomainSample, createSaasBlueprint, buildSaasMarkdown } from '../src/domain-core.js';

test('domain tool definition is purpose-built', () => {
  assert.equal(validateDomainDefinition(domain), true);
  assert.ok(domain.kind.length > 3);
  assert.ok(domain.fields.length >= 4);
  assert.ok(domain.rows.length >= 6);
});

test('domain sample becomes release ready', () => {
  const state = applyDomainSample(domain);
  const calc = calculateDomain(domain, state);
  assert.equal(calc.releaseReady, true);
  assert.ok(calc.completeness >= 80);
  assert.ok(calc.rowScore >= 75);
});

test('domain artifacts and markdown are product-specific', () => {
  const state = applyDomainSample(domain);
  const artifacts = generateDomainArtifacts(config, domain, state);
  const md = buildDomainMarkdown(config, domain, state);
  assert.equal(artifacts.length, domain.artifacts.length);
  assert.match(md, new RegExp(config.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(md, new RegExp(domain.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});


test('domain exposes standalone SaaS operating model', () => {
  const state = applyDomainSample(domain);
  const blueprint = createSaasBlueprint(domain, state);
  const markdown = buildSaasMarkdown(config, domain, state);
  assert.ok(Array.isArray(domain.modules));
  assert.ok(domain.modules.length >= 4);
  assert.ok(blueprint.health >= 80);
  assert.ok(blueprint.playbooks.length >= 4);
  assert.match(markdown, /SaaS Operating Blueprint/);
  assert.match(markdown, /Revenue model/);
});
