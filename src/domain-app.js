import { config } from './config.js';
import { domain } from './domain.js';
import { createDomainState, calculateDomain, generateDomainArtifacts, buildDomainMarkdown, applyDomainSample } from './domain-core.js';
const key = `volta-oss:${config.slug}:domain`;
let state = load();
function $(s) { return document.querySelector(s); }
function $$(s) { return [...document.querySelectorAll(s)]; }
function esc(v = '') { return String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function load() { try {
    const raw = localStorage.getItem(key);
    if (raw)
        return JSON.parse(raw);
}
catch { } return createDomainState(domain); }
function save() { state.updatedAt = new Date().toISOString(); localStorage.setItem(key, JSON.stringify(state)); }
function download(name, content, type = 'text/plain') { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }
function install() {
    document.querySelector('.grid').insertAdjacentHTML('beforebegin', `<section class="domain-tool domain-${domain.kind} panel" aria-labelledby="domain-title">
    <div class="domain-head"><div><p class="eyebrow">Purpose-built product tool</p><h2 id="domain-title">${esc(domain.title)}</h2><p class="muted">${esc(domain.purpose)}</p></div><div class="button-row no-print"><button id="domain-sample" class="secondary">Load Domain Sample</button><button id="domain-export">Export Tool Packet</button></div></div>
    <div class="domain-metrics" aria-label="Domain tool metrics" aria-live="polite"></div>
    <div class="domain-layout"><section class="domain-inputs"><h3>${esc(domain.inputTitle)}</h3><div id="domain-fields" class="form-grid"></div></section><section class="domain-preview"><h3>${esc(domain.previewTitle)}</h3><div id="domain-artifacts"></div></section></div>
    <h3>${esc(domain.tableTitle)}</h3><div class="table-wrap"><table class="domain-table"><thead><tr><th>Work item</th><th>Value</th><th>Score</th><th>Approved</th></tr></thead><tbody id="domain-rows"></tbody></table></div>
  </section>`);
    $('#domain-sample').addEventListener('click', () => { if (confirm('Load product-specific sample data? This overwrites this product tool workspace.')) {
        state = applyDomainSample(domain);
        save();
        render();
    } });
    $('#domain-export').addEventListener('click', () => download(`${config.slug}-domain-tool.md`, buildDomainMarkdown(config, domain, state), 'text/markdown'));
    render();
}
function render() {
    const calc = calculateDomain(domain, state);
    document.querySelector('.domain-metrics').innerHTML = `<article><strong>${calc.primary}</strong><span>${esc(domain.metricLabels[0])}</span></article><article><strong>${calc.secondary}</strong><span>${esc(domain.metricLabels[1])}</span></article><article><strong>${calc.releaseReady ? 'Ready' : 'Needs work'}</strong><span>${esc(calc.insight)}</span></article>`;
    $('#domain-fields').innerHTML = domain.fields.map(f => `<label>${esc(f.label)}<input data-domain-field="${f.id}" type="${f.type || 'text'}" value="${esc(state.values[f.id] ?? '')}" placeholder="${esc(f.placeholder || '')}" /></label>`).join('');
    $('#domain-artifacts').innerHTML = generateDomainArtifacts(config, domain, state).map(a => `<article class="artifact"><strong>${esc(a.title)}</strong><p>${esc(a.body)}</p></article>`).join('');
    $('#domain-rows').innerHTML = state.rows.map(r => `<tr><td><strong>${esc(r.label)}</strong></td><td><input data-domain-row="value" data-id="${r.id}" value="${esc(r.value)}" aria-label="Value for ${esc(r.label)}" /></td><td><input data-domain-row="score" data-id="${r.id}" type="number" min="0" max="10" value="${esc(r.score)}" aria-label="Score for ${esc(r.label)}" /></td><td><input data-domain-row="approved" data-id="${r.id}" type="checkbox" ${r.approved ? 'checked' : ''} aria-label="Approve ${esc(r.label)}" /></td></tr>`).join('');
    bind();
}
function bind() {
    $$('[data-domain-field]').forEach(el => el.addEventListener('input', e => { state.values[e.target.dataset.domainField] = e.target.value; save(); render(); }));
    $$('[data-domain-row]').forEach(el => el.addEventListener('input', e => { const row = state.rows.find(r => r.id === e.target.dataset.id); if (!row)
        return; row[e.target.dataset.domainRow] = e.target.type === 'checkbox' ? e.target.checked : (e.target.dataset.domainRow === 'score' ? Number(e.target.value) : e.target.value); save(); render(); }));
}
install();
//# sourceMappingURL=domain-app.js.map