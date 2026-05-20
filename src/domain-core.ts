export function validateDomainDefinition(domain) {
  for (const key of ['kind','title','purpose','fields','artifacts','checks']) {
    if (!domain[key] || (Array.isArray(domain[key]) && domain[key].length === 0)) throw new Error(`missing domain.${key}`);
  }
  if (domain.fields.length < 4) throw new Error('domain tool needs at least 4 fields');
  if (domain.artifacts.length < 3) throw new Error('domain tool needs at least 3 artifacts');
  return true;
}

export function createDomainState(domain) {
  validateDomainDefinition(domain);
  const values = {};
  domain.fields.forEach((field, index) => { values[field.id] = field.default ?? (field.type === 'number' ? (index + 1) * 10 : field.type === 'color' ? '#2563eb' : field.type === 'date' ? '2026-03-10' : ''); });
  return {
    version: '3-domain',
    values,
    rows: domain.rows.map((row, index) => ({ id:`domain-row-${index+1}`, label: row, value: index < 3 ? 'Complete draft' : '', score: index < 3 ? 8 : 0, approved: index < 2 })),
    generated: [],
    updatedAt: new Date().toISOString()
  };
}

export function calculateDomain(domain, state) {
  const nums = domain.fields.filter(f => f.type === 'number').map(f => Number(state.values[f.id] || 0));
  const sum = nums.reduce((a,b)=>a+b,0);
  const average = nums.length ? Math.round(sum / nums.length) : 0;
  const rows = state.rows || [];
  const rowScore = rows.length ? Math.round(rows.reduce((a,r)=>a+Number(r.score||0),0) / (rows.length*10) * 100) : 0;
  const approved = rows.filter(r=>r.approved).length;
  const completeness = Math.round((Object.values(state.values || {}).filter(v => String(v).trim()).length / domain.fields.length) * 100);
  const kind = domain.kind;
  let primary = rowScore;
  let secondary = completeness;
  let insight = `${approved}/${rows.length} domain rows approved`;
  if (kind.includes('calculator') || kind === 'budget' || kind === 'cashflow' || kind === 'funnel-calculator') {
    primary = Math.max(0, Math.min(999, sum));
    secondary = average;
    insight = `Calculated from ${nums.length} numeric inputs`;
  } else if (kind.includes('calendar')) {
    primary = rows.filter(r => String(r.value).trim()).length;
    secondary = rowScore;
    insight = `${primary} dated milestones or deadlines populated`;
  } else if (kind.includes('matrix') || kind.includes('grader') || kind.includes('scorecard')) {
    primary = rowScore;
    secondary = approved;
    insight = `${approved} approved scoring rows`;
  } else if (kind.includes('builder') || kind.includes('lab') || kind.includes('pack') || kind.includes('editor')) {
    primary = completeness;
    secondary = rowScore;
    insight = `${domain.artifacts.length} generated artifacts available`;
  }
  return { primary, secondary, completeness, rowScore, approved, insight, releaseReady: completeness >= 80 && rowScore >= 75 };
}

export function generateDomainArtifacts(config, domain, state) {
  const calc = calculateDomain(domain, state);
  const values = Object.fromEntries(domain.fields.map(f => [f.label, state.values[f.id] || '']));
  return domain.artifacts.map((artifact, index) => ({
    id: `artifact-${index+1}`,
    title: artifact,
    body: `${artifact} for ${config.title}: ${calc.insight}. Key inputs: ${Object.entries(values).slice(0,4).map(([k,v]) => `${k}: ${v || 'not set'}`).join('; ')}.`
  }));
}

export function buildDomainMarkdown(config, domain, state) {
  const calc = calculateDomain(domain, state);
  const lines = [`# ${config.title} Domain Tool Export`, '', `**Tool:** ${domain.title}`, `**Purpose:** ${domain.purpose}`, `**Readiness:** ${calc.releaseReady ? 'Ready' : 'Needs work'}`, `**Insight:** ${calc.insight}`, '', '## Inputs'];
  domain.fields.forEach(f => lines.push(`- **${f.label}:** ${state.values[f.id] || 'Not set'}`));
  lines.push('', '## Work Items');
  state.rows.forEach(r => lines.push(`- ${r.approved ? '[x]' : '[ ]'} **${r.label}** — ${r.value || 'No value'} (${r.score}/10)`));
  lines.push('', '## Generated Artifacts');
  generateDomainArtifacts(config, domain, state).forEach(a => lines.push(`- **${a.title}:** ${a.body}`));
  lines.push('', '## Validation Checks');
  domain.checks.forEach(c => lines.push(`- ${c}`));
  return lines.join('\n');
}

export function applyDomainSample(domain) {
  const state = createDomainState(domain);
  domain.fields.forEach((field, index) => {
    if (field.type === 'number') state.values[field.id] = field.sample ?? (index + 2) * 15;
    else if (field.type === 'date') state.values[field.id] = field.sample ?? `2026-03-${String(index+10).padStart(2,'0')}`;
    else state.values[field.id] = field.sample ?? `${field.label} sample`;
  });
  state.rows = state.rows.map((row, index) => ({...row, value: `${row.label} completed with sample evidence`, score: index < 6 ? 9 : 8, approved: true}));
  return state;
}

function asList(value, fallback = []) {
  return Array.isArray(value) && value.length ? value : fallback;
}

export function createSaasBlueprint(domain, state) {
  const calc = calculateDomain(domain, state);
  const values = state.values || {};
  const rows = state.rows || [];
  const completedRows = rows.filter((row) => String(row.value || '').trim()).length;
  const approvedRows = rows.filter((row) => row.approved).length;
  const riskRows = rows.filter((row) => Number(row.score || 0) < 7 || !row.approved);
  const primaryContact = values['owner-reviewer'] || values['organization-client'] || 'Client owner';
  const stage = calc.releaseReady ? 'scale-ready' : calc.rowScore >= 60 ? 'implementation' : 'discovery';
  const health = Math.round(calc.completeness * 0.28 + calc.rowScore * 0.42 + (approvedRows / Math.max(rows.length, 1)) * 30);
  const modules = asList(domain.modules, domain.artifacts.map((artifact) => ({ name: artifact, description: 'Production-ready client deliverable.' })));
  const playbooks = domain.saas?.playbooks || domain.artifacts.map((artifact) => `${artifact} production workflow`);
  const automations = domain.saas?.automations || domain.checks.map((check) => `${check} guardrail`);
  const customerSegments = asList(domain.saas?.customerSegments, ['Student pod operator', 'Mentor reviewer', 'Client owner']);
  const pricingTiers = asList(domain.saas?.pricingTiers, ['Starter workspace', 'Team workspace', 'Agency workspace']);
  const onboardingChecklist = asList(domain.saas?.onboardingChecklist, [
    `Create ${domain.sampleClient || 'client'} workspace`,
    `Import ${domain.tableTitle.toLowerCase()} evidence`,
    'Assign reviewer and owner approval roles',
    `Export ${domain.artifacts[0]} for first handoff`
  ]);
  const successMetrics = asList(domain.saas?.successMetrics, [
    `${domain.metricLabels?.[0] || 'Primary score'} at or above 85`,
    `${approvedRows}/${rows.length} rows approved`,
    'Client-safe export generated without warnings'
  ]);
  const dashboards = asList(domain.saas?.dashboards, [
    `${domain.tableTitle} readiness dashboard`,
    'Owner approval queue',
    'Evidence quality trends'
  ]);
  const dataModel = asList(domain.saas?.dataModel, [
    'Workspace',
    'Evidence row',
    'Approval',
    'Export artifact',
    'Audit event'
  ]);
  const permissions = asList(domain.saas?.permissions, [
    'Admin: workspace settings and billing',
    'Editor: evidence capture and artifact drafting',
    'Reviewer: approval gates and export release',
    'Viewer: client-safe read-only packets'
  ]);
  const compliance = asList(domain.saas?.compliance, domain.checks.map((check) => `${check} is enforced before export`));
  const lifecycle = asList(domain.saas?.lifecycle, [
    'Discover',
    'Configure',
    'Validate',
    'Approve',
    'Export',
    'Renew'
  ]);
  const retentionSignals = asList(domain.saas?.retentionSignals, [
    'Open evidence risks',
    'Upcoming approval renewals',
    'Export freshness',
    'Repeat workspace usage'
  ]);
  const exportChannels = asList(domain.saas?.exportChannels, domain.artifacts);
  return {
    stage,
    health,
    primaryContact,
    completedRows,
    approvedRows,
    riskRows,
    modules,
    playbooks,
    automations,
    customerSegments,
    pricingTiers,
    onboardingChecklist,
    successMetrics,
    dashboards,
    dataModel,
    permissions,
    compliance,
    lifecycle,
    retentionSignals,
    exportChannels,
    nextMilestones: [
      `Complete ${Math.max(rows.length - completedRows, 0)} remaining ${domain.tableTitle.toLowerCase()} row(s).`,
      `Approve ${Math.max(rows.length - approvedRows, 0)} row(s) with owner-safe evidence.`,
      `Export ${domain.artifacts.join(', ')} for the client workspace.`,
      `Review ${customerSegments.length} customer segment(s) and ${pricingTiers.length} pricing tier(s).`
    ],
    revenueModel: domain.saas?.revenueModel || 'Seat-based workspace with client-safe export packs',
    integrationTargets: domain.saas?.integrationTargets || ['CSV export', 'Markdown handoff', 'JSON bundle'],
    riskRegister: riskRows.map((row) => `${row.label}: score ${row.score}/10${row.approved ? '' : ', approval pending'}`)
  };
}

export function buildSaasMarkdown(config, domain, state) {
  const blueprint = createSaasBlueprint(domain, state);
  const lines = [`# ${config.title} SaaS Operating Blueprint`, '', `**Stage:** ${blueprint.stage}`, `**Workspace health:** ${blueprint.health}/100`, `**Primary contact:** ${blueprint.primaryContact}`, `**Revenue model:** ${blueprint.revenueModel}`, '', '## SaaS Modules'];
  blueprint.modules.forEach((module) => lines.push(`- **${module.name}:** ${module.description}`));
  lines.push('', '## Customer segments');
  blueprint.customerSegments.forEach((item) => lines.push(`- ${item}`));
  lines.push('', '## Pricing and packaging');
  blueprint.pricingTiers.forEach((item) => lines.push(`- ${item}`));
  lines.push('', '## Onboarding checklist');
  blueprint.onboardingChecklist.forEach((item) => lines.push(`- ${item}`));
  lines.push('', '## Playbooks');
  blueprint.playbooks.forEach((item) => lines.push(`- ${item}`));
  lines.push('', '## Automations');
  blueprint.automations.forEach((item) => lines.push(`- ${item}`));
  lines.push('', '## Dashboards and success metrics');
  blueprint.dashboards.forEach((item) => lines.push(`- Dashboard: ${item}`));
  blueprint.successMetrics.forEach((item) => lines.push(`- Metric: ${item}`));
  lines.push('', '## Data model and permissions');
  blueprint.dataModel.forEach((item) => lines.push(`- Entity: ${item}`));
  blueprint.permissions.forEach((item) => lines.push(`- Permission: ${item}`));
  lines.push('', '## Lifecycle, retention, and compliance');
  blueprint.lifecycle.forEach((item) => lines.push(`- Lifecycle step: ${item}`));
  blueprint.retentionSignals.forEach((item) => lines.push(`- Retention signal: ${item}`));
  blueprint.compliance.forEach((item) => lines.push(`- Compliance: ${item}`));
  lines.push('', '## Automation and integration targets');
  blueprint.integrationTargets.forEach((item) => lines.push(`- Integration: ${item}`));
  blueprint.exportChannels.forEach((item) => lines.push(`- Export: ${item}`));
  lines.push('', '## Milestones');
  blueprint.nextMilestones.forEach((item) => lines.push(`- ${item}`));
  lines.push('', '## Risk register');
  if (blueprint.riskRegister.length) blueprint.riskRegister.forEach((item) => lines.push(`- ${item}`));
  else lines.push('- No current SaaS launch risks.');
  return lines.join('\n');
}
