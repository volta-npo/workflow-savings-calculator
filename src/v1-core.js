export const V1_STATUS = ['missing', 'draft', 'ready', 'approved', 'blocked'];
export const V1_MULTIPLIER = Object.freeze({ missing: 0, draft: 0.35, ready: 0.8, approved: 1, blocked: 0 });

export function createV1State(v1, now = new Date().toISOString()) {
  return {
    version: '1.0',
    createdAt: now,
    updatedAt: now,
    rows: v1.rows.map((label, index) => ({
      id: `row-${index + 1}`,
      label,
      status: index < 2 ? 'draft' : 'missing',
      score: index < 2 ? 5 : 0,
      owner: '',
      due: '',
      evidence: '',
      notes: '',
      risk: index % 3 === 0 ? 'medium' : 'low'
    })),
    generatedNotes: '',
    scenario: v1.sampleScenario || ''
  };
}

export function validateV1Definition(v1) {
  for (const key of ['workbench', 'table', 'metrics', 'rows', 'generators', 'validations']) {
    if (!Array.isArray(v1[key]) && key !== 'workbench' && key !== 'table') throw new Error(`v1.${key} must be an array`);
    if (!v1[key] || (Array.isArray(v1[key]) && v1[key].length === 0)) throw new Error(`missing v1.${key}`);
  }
  if (v1.rows.length < 8) throw new Error('v1 workbench must have at least 8 domain rows');
  if (v1.metrics.length < 3) throw new Error('v1 workbench must have at least 3 metrics');
  return true;
}

export function calculateV1Metrics(v1, state) {
  validateV1Definition(v1);
  const rows = state.rows || [];
  const total = rows.length || 1;
  const approved = rows.filter((r) => r.status === 'approved').length;
  const ready = rows.filter((r) => ['ready', 'approved'].includes(r.status)).length;
  const blocked = rows.filter((r) => r.status === 'blocked').length;
  const evidence = rows.filter((r) => String(r.evidence || '').trim()).length;
  const score = Math.round(rows.reduce((sum, row) => sum + (Number(row.score || 0) * (V1_MULTIPLIER[row.status] ?? 0)), 0) / (total * 10) * 100);
  const evidenceCoverage = Math.round((evidence / total) * 100);
  const readiness = Math.max(0, Math.min(100, Math.round(score * 0.55 + (ready / total) * 25 + evidenceCoverage * 0.2 - blocked * 8)));
  return [
    { name: v1.metrics[0], value: readiness, suffix: '/100', detail: `${ready}/${total} rows ready or approved` },
    { name: v1.metrics[1], value: evidenceCoverage, suffix: '%', detail: `${evidence}/${total} rows include evidence` },
    { name: v1.metrics[2], value: Math.max(0, 100 - blocked * 25), suffix: '/100', detail: `${blocked} blocker(s)` }
  ];
}

export function v1ValidationWarnings(v1, state) {
  const metrics = calculateV1Metrics(v1, state);
  const warnings = [];
  const rows = state.rows || [];
  if (metrics[0].value < 80) warnings.push(`${v1.metrics[0]} is below v1 launch threshold (80).`);
  const blocked = rows.filter((r) => r.status === 'blocked');
  if (blocked.length) warnings.push(`${blocked.length} blocked row(s) must be resolved before v1 release.`);
  const missingEvidence = rows.filter((r) => ['ready','approved'].includes(r.status) && !String(r.evidence || '').trim());
  if (missingEvidence.length) warnings.push(`${missingEvidence.length} ready/approved row(s) need evidence.`);
  for (const rule of v1.validations) {
    const lower = rule.toLowerCase();
    if (lower.includes('owner') && !rows.some((r) => /owner|approval|consent/i.test(r.label) && r.status === 'approved')) warnings.push(`Rule needs proof: ${rule}`);
    if (lower.includes('evidence') && rows.every((r) => !String(r.evidence || '').trim())) warnings.push(`Rule needs evidence: ${rule}`);
  }
  return [...new Set(warnings)];
}

export function buildV1Packet(config, v1, state) {
  const metrics = calculateV1Metrics(v1, state);
  const warnings = v1ValidationWarnings(v1, state);
  const lines = [];
  lines.push(`# ${config.title} v1.0 Product Packet`);
  lines.push('');
  lines.push(`**Workbench:** ${v1.workbench}`);
  lines.push(`**Domain table:** ${v1.table}`);
  lines.push(`**Scenario:** ${state.scenario || 'Not specified'}`);
  lines.push('');
  lines.push('## Metrics');
  metrics.forEach((m) => lines.push(`- **${m.name}:** ${m.value}${m.suffix} — ${m.detail}`));
  lines.push('');
  lines.push('## Validation Gates');
  v1.validations.forEach((rule) => lines.push(`- ${rule}`));
  lines.push('');
  lines.push('## Current Warnings');
  if (warnings.length) warnings.forEach((w) => lines.push(`- ${w}`)); else lines.push('- No v1 warnings.');
  lines.push('');
  lines.push(`## ${v1.table}`);
  (state.rows || []).forEach((row) => {
    lines.push(`- **${row.label}** — ${row.status}, score ${row.score}/10, risk ${row.risk}`);
    if (row.owner) lines.push(`  - Owner: ${row.owner}`);
    if (row.due) lines.push(`  - Due: ${row.due}`);
    if (row.evidence) lines.push(`  - Evidence: ${row.evidence}`);
    if (row.notes) lines.push(`  - Notes: ${row.notes}`);
  });
  lines.push('');
  lines.push('## Generated Deliverables');
  v1.generators.forEach((g) => lines.push(`- ${g}`));
  lines.push('');
  lines.push('## v1.0 Acceptance Statement');
  lines.push(`This packet is ready for release only when ${v1.metrics[0]} is at least 80, there are no blocked rows, and all ready/approved rows include evidence.`);
  return lines.join('\n');
}

export function buildV1Csv(v1, state) {
  const header = ['id','label','status','score','owner','due','risk','evidence','notes'];
  const escape = (value) => `"${String(value ?? '').replaceAll('"','""')}"`;
  return [header.join(','), ...(state.rows || []).map((row) => header.map((key) => escape(row[key])).join(','))].join('\n');
}

export function applyV1Sample(v1) {
  const state = createV1State(v1, '2026-01-01T00:00:00.000Z');
  state.rows = state.rows.map((row, index) => ({
    ...row,
    status: index < 4 ? 'approved' : index < 7 ? 'ready' : 'draft',
    score: index < 4 ? 9 : index < 7 ? 8 : 6,
    owner: index % 2 === 0 ? 'Student lead' : 'Mentor reviewer',
    due: `2026-02-${String(10 + index).padStart(2, '0')}`,
    evidence: `Sample proof for ${row.label}`,
    notes: `${row.label} has been tested against the v1.0 workflow.`
  }));
  state.generatedNotes = `Sample ${v1.workbench} packet is populated for review.`;
  return state;
}
