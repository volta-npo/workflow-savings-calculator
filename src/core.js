export const STATUS_MULTIPLIER = Object.freeze({
    'not-started': 0,
    blocked: 0,
    'in-progress': 0.45,
    ready: 0.8,
    approved: 1
});
export function assertValidConfig(config) {
    if (!config || typeof config !== 'object')
        throw new Error('config must be an object');
    for (const key of ['slug', 'title', 'category', 'criteria', 'templates']) {
        if (!config[key])
            throw new Error(`missing config.${key}`);
    }
    const total = config.criteria.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    if (total !== 100)
        throw new Error(`criteria weights must sum to 100, got ${total}`);
    const ids = new Set();
    for (const item of config.criteria) {
        if (!item.id || ids.has(item.id))
            throw new Error(`duplicate/missing criterion id: ${item.id}`);
        ids.add(item.id);
        if (!STATUS_MULTIPLIER.hasOwnProperty(item.defaultStatus))
            throw new Error(`invalid default status for ${item.id}`);
    }
    return true;
}
export function createInitialState(config, now = new Date().toISOString()) {
    assertValidConfig(config);
    return {
        version: 1,
        slug: config.slug,
        createdAt: now,
        updatedAt: now,
        project: {
            clientName: '',
            chapter: '',
            studentLead: '',
            targetUser: config.persona,
            notes: ''
        },
        criteria: config.criteria.map((item) => ({
            id: item.id,
            status: item.defaultStatus,
            notes: '',
            evidence: ''
        })),
        evidence: [],
        actions: config.templates.actions.map((text, index) => ({
            id: `action-${index + 1}`,
            text,
            owner: '',
            due: '',
            status: index === 0 ? 'in-progress' : 'not-started'
        })),
        approvals: {
            studentReview: false,
            mentorReview: false,
            ownerApproval: false
        }
    };
}
export function calculateScore(config, state) {
    assertValidConfig(config);
    const stateById = new Map((state.criteria || []).map((item) => [item.id, item]));
    const breakdown = config.criteria.map((criterion) => {
        const current = stateById.get(criterion.id) || { status: criterion.defaultStatus };
        const multiplier = STATUS_MULTIPLIER[current.status] ?? 0;
        const points = Math.round(criterion.weight * multiplier * 10) / 10;
        return { ...criterion, status: current.status, points, max: criterion.weight, notes: current.notes || '', evidence: current.evidence || '' };
    });
    const raw = breakdown.reduce((sum, item) => sum + item.points, 0);
    const score = Math.round(raw);
    return { score, label: scoreLabel(score), breakdown };
}
export function scoreLabel(score) {
    if (score >= 90)
        return 'Launch-ready';
    if (score >= 75)
        return 'Strong, needs polish';
    if (score >= 55)
        return 'Promising, needs review';
    if (score >= 35)
        return 'At risk';
    return 'Not ready';
}
export function readinessWarnings(config, state) {
    const warnings = [];
    const score = calculateScore(config, state).score;
    if (score < 75)
        warnings.push('Readiness is below 75. Keep this in draft until blockers and evidence gaps are resolved.');
    const criteria = state.criteria || [];
    const blocked = criteria.filter((item) => item.status === 'blocked');
    if (blocked.length)
        warnings.push(`${blocked.length} blocker(s) must be resolved before handoff.`);
    const missingEvidence = criteria.filter((item) => ['ready', 'approved'].includes(item.status) && !String(item.evidence || '').trim());
    if (missingEvidence.length)
        warnings.push(`${missingEvidence.length} ready/approved item(s) are missing evidence notes.`);
    if (!state.approvals?.mentorReview)
        warnings.push('Mentor review has not been recorded.');
    if (!state.approvals?.ownerApproval)
        warnings.push('Owner/client approval has not been recorded.');
    return warnings;
}
export function buildMarkdownReport(config, state) {
    const result = calculateScore(config, state);
    const warnings = readinessWarnings(config, state);
    const lines = [];
    lines.push(`# ${config.title} Handoff Report`);
    lines.push('');
    lines.push(`**Client / organization:** ${state.project.clientName || 'Not set'}`);
    lines.push(`**Chapter:** ${state.project.chapter || 'Not set'}`);
    lines.push(`**Student lead:** ${state.project.studentLead || 'Not set'}`);
    lines.push(`**Score:** ${result.score}/100 (${result.label})`);
    lines.push('');
    lines.push('## Warnings');
    if (warnings.length)
        warnings.forEach((warning) => lines.push(`- ${warning}`));
    else
        lines.push('- No readiness warnings.');
    lines.push('');
    lines.push('## Rubric Breakdown');
    result.breakdown.forEach((item) => {
        lines.push(`- **${item.label}:** ${item.points}/${item.max} (${item.status})`);
        if (item.evidence)
            lines.push(`  - Evidence: ${item.evidence}`);
        if (item.notes)
            lines.push(`  - Notes: ${item.notes}`);
    });
    lines.push('');
    lines.push('## Evidence');
    if ((state.evidence || []).length) {
        state.evidence.forEach((item) => lines.push(`- **${item.title || 'Evidence'}:** ${item.detail || ''}`));
    }
    else
        lines.push('- No evidence added yet.');
    lines.push('');
    lines.push('## Next Actions');
    (state.actions || []).forEach((action) => lines.push(`- [${action.status === 'approved' ? 'x' : ' '}] ${action.text}${action.owner ? ` — ${action.owner}` : ''}${action.due ? ` (${action.due})` : ''}`));
    lines.push('');
    lines.push('---');
    lines.push(`Generated locally by ${config.title}. Client data never left this browser.`);
    return lines.join('\n');
}
export function exportJson(config, state) {
    return JSON.stringify({ exportedAt: new Date().toISOString(), config: { slug: config.slug, title: config.title }, state }, null, 2);
}
export function applySampleData(config) {
    const state = createInitialState(config, '2026-01-01T00:00:00.000Z');
    state.project.clientName = config.sample.clientName;
    state.project.chapter = config.sample.chapter;
    state.project.studentLead = config.sample.studentLead;
    state.project.notes = config.sample.notes;
    state.criteria = state.criteria.map((item, index) => ({
        ...item,
        status: index < 2 ? 'approved' : index < 5 ? 'ready' : 'in-progress',
        evidence: `${config.sample.evidencePrefix} evidence ${index + 1}`,
        notes: config.criteria[index]?.prompt || ''
    }));
    state.evidence = config.sample.evidence.map((detail, index) => ({ id: `evidence-${index + 1}`, title: `Evidence ${index + 1}`, detail }));
    state.approvals.studentReview = true;
    return state;
}
//# sourceMappingURL=core.js.map