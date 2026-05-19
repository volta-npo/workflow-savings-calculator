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
