export const V3_STATUSES = ['missing', 'draft', 'verified', 'certified', 'blocked'];
export const V3_MULTIPLIER = Object.freeze({ missing: 0, draft: 0.35, verified: 0.85, certified: 1, blocked: 0 });

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

export function integrityHash(value) {
  const input = stableStringify(value);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function validateV3Definition(v3) {
  for (const key of ['productTier', 'acceptance', 'releaseChecklist', 'schemas', 'qualityGates', 'operations', 'testPlan']) {
    if (!v3[key]) throw new Error(`missing v3.${key}`);
  }
  if (v3.productTier !== 'release') throw new Error('product tier must be release');
  if (v3.releaseChecklist.length < 12) throw new Error('v3 release checklist must have at least 12 items');
  if (v3.qualityGates.length < 8) throw new Error('v3 quality gates must have at least 8 items');
  if (v3.schemas.length < 6) throw new Error('v3 schemas must have at least 6 fields');
  return true;
}

export function createV3State(v3, now = new Date().toISOString()) {
  validateV3Definition(v3);
  return {
    version: '3.0.0',
    createdAt: now,
    updatedAt: now,
    releaseName: `${v3.productName} v3 Launch Candidate`,
    checklist: v3.releaseChecklist.map((item, index) => ({
      id: `gate-${index + 1}`,
      label: item,
      status: index < 3 ? 'draft' : 'missing',
      evidence: '',
      owner: '',
      notes: '',
      severity: index % 4 === 0 ? 'critical' : index % 3 === 0 ? 'high' : 'normal'
    })),
    incidents: [],
    changelog: [{ version: '3.0.0', date: now.slice(0, 10), notes: 'Initial release release candidate.' }],
    decisions: []
  };
}

export function calculateV3Certification(v3, state) {
  validateV3Definition(v3);
  const rows = state.checklist || [];
  const total = rows.length || 1;
  const certified = rows.filter((row) => row.status === 'certified').length;
  const verified = rows.filter((row) => ['verified', 'certified'].includes(row.status)).length;
  const blocked = rows.filter((row) => row.status === 'blocked').length;
  const evidence = rows.filter((row) => String(row.evidence || '').trim()).length;
  const criticalOpen = rows.filter((row) => row.severity === 'critical' && !['verified','certified'].includes(row.status)).length;
  const weighted = Math.round(rows.reduce((sum, row) => sum + (V3_MULTIPLIER[row.status] ?? 0), 0) / total * 100);
  const evidenceScore = Math.round(evidence / total * 100);
  const certification = Math.max(0, Math.min(100, Math.round(weighted * 0.55 + evidenceScore * 0.25 + (verified / total * 100) * 0.2 - blocked * 12 - criticalOpen * 8)));
  return {
    certification,
    status: certification >= 95 && blocked === 0 && criticalOpen === 0 ? 'release-certified' : certification >= 85 ? 'release-candidate' : 'not-certified',
    certified,
    verified,
    blocked,
    criticalOpen,
    evidenceScore,
    total,
    hash: integrityHash({ checklist: rows, changelog: state.changelog, releaseName: state.releaseName })
  };
}

export function v3Warnings(v3, state) {
  const c = calculateV3Certification(v3, state);
  const warnings = [];
  if (c.certification < 95) warnings.push(`Certification is ${c.certification}/100. release requires 95+.`);
  if (c.blocked) warnings.push(`${c.blocked} blocked launch gate(s) remain.`);
  if (c.criticalOpen) warnings.push(`${c.criticalOpen} critical launch gate(s) are not verified/certified.`);
  if (c.evidenceScore < 100) warnings.push(`Evidence coverage is ${c.evidenceScore}%. v3 requires evidence for every gate.`);
  for (const gate of v3.qualityGates) {
    const lower = gate.toLowerCase();
    if (lower.includes('export') && !v3.capabilities.some((cap) => cap.toLowerCase().includes('export'))) warnings.push(`Capability missing for quality gate: ${gate}`);
    if (lower.includes('privacy') && !v3.operations.some((op) => op.toLowerCase().includes('privacy'))) warnings.push(`Operational privacy note missing for gate: ${gate}`);
  }
  return [...new Set(warnings)];
}

export function certifyAllV3(v3, state) {
  return {
    ...state,
    updatedAt: new Date().toISOString(),
    checklist: state.checklist.map((row) => ({
      ...row,
      status: 'certified',
      owner: row.owner || 'Release owner',
      evidence: row.evidence || `Certified evidence for ${row.label}`,
      notes: row.notes || `${row.label} passed the release gate.`
    })),
    decisions: [...(state.decisions || []), { date: new Date().toISOString(), decision: 'Certified all release gates for launch candidate.' }]
  };
}

export function exportV3Bundle(config, v3, state) {
  const certification = calculateV3Certification(v3, state);
  return {
    exportedAt: new Date().toISOString(),
    product: { slug: config.slug, title: config.title, version: '3.0.0' },
    certification,
    v3,
    state,
    warnings: v3Warnings(v3, state)
  };
}

export function importV3Bundle(config, v3, bundle) {
  if (!bundle || bundle.product?.slug !== config.slug) throw new Error('bundle slug does not match this product');
  validateV3Definition(v3);
  if (!bundle.state || !Array.isArray(bundle.state.checklist)) throw new Error('bundle is missing v3 state checklist');
  if (bundle.state.checklist.length !== v3.releaseChecklist.length) throw new Error('bundle checklist length mismatch');
  const allowedStatuses = new Set(V3_STATUSES);
  const allowedSeverities = new Set(['normal', 'high', 'critical']);
  bundle.state.checklist.forEach((row, index) => {
    if (!row || typeof row !== 'object') throw new Error(`invalid checklist row ${index + 1}`);
    if (!allowedStatuses.has(row.status)) throw new Error(`invalid status in checklist row ${index + 1}`);
    if (!allowedSeverities.has(row.severity)) throw new Error(`invalid severity in checklist row ${index + 1}`);
    if (typeof row.label !== 'string' || row.label !== v3.releaseChecklist[index]) throw new Error(`checklist label mismatch in row ${index + 1}`);
    for (const field of ['id', 'owner', 'evidence', 'notes']) {
      if (row[field] !== undefined && typeof row[field] !== 'string') throw new Error(`invalid ${field} in checklist row ${index + 1}`);
    }
  });
  return bundle.state;
}

export function buildV3Markdown(config, v3, state) {
  const c = calculateV3Certification(v3, state);
  const warnings = v3Warnings(v3, state);
  const lines = [];
  lines.push(`# ${config.title} v3.0 Production Certification`);
  lines.push('');
  lines.push(`**Status:** ${c.status}`);
  lines.push(`**Certification:** ${c.certification}/100`);
  lines.push(`**Integrity hash:** ${c.hash}`);
  lines.push('');
  lines.push('## Capabilities');
  v3.capabilities.forEach((cap) => lines.push(`- ${cap}`));
  lines.push('');
  lines.push('## Quality Gates');
  v3.qualityGates.forEach((gate) => lines.push(`- ${gate}`));
  lines.push('');
  lines.push('## Warnings');
  if (warnings.length) warnings.forEach((warning) => lines.push(`- ${warning}`)); else lines.push('- No v3 warnings.');
  lines.push('');
  lines.push('## Release Checklist');
  state.checklist.forEach((row) => {
    lines.push(`- **${row.label}** — ${row.status} (${row.severity})`);
    lines.push(`  - Owner: ${row.owner || 'Unassigned'}`);
    lines.push(`  - Evidence: ${row.evidence || 'Missing'}`);
    if (row.notes) lines.push(`  - Notes: ${row.notes}`);
  });
  lines.push('');
  lines.push('## Operations');
  v3.operations.forEach((op) => lines.push(`- ${op}`));
  return lines.join('\n');
}

export function buildV3Csv(v3, state) {
  const header = ['id','label','status','severity','owner','evidence','notes'];
  const esc = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [header.join(','), ...state.checklist.map((row) => header.map((key) => esc(row[key])).join(','))].join('\n');
}

export function runV3SelfAudit(config, v3, state) {
  return {
    definition: validateV3Definition(v3),
    certification: calculateV3Certification(v3, state),
    warnings: v3Warnings(v3, state),
    markdownBytes: buildV3Markdown(config, v3, state).length,
    csvRows: buildV3Csv(v3, state).split('\n').length,
    bundleHash: integrityHash(exportV3Bundle(config, v3, state))
  };
}
