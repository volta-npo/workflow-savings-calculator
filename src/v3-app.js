import { config } from './config.js';
import { v3 } from './v3.js';
import { createV3State, calculateV3Certification, v3Warnings, certifyAllV3, exportV3Bundle, importV3Bundle, buildV3Markdown, buildV3Csv, runV3SelfAudit, V3_STATUSES } from './v3-core.js';
const key = `volta-oss:${config.slug}:v3`;
let state = load();
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return [...document.querySelectorAll(selector)]; }
function esc(value = '') { return String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function load() { try {
    const raw = localStorage.getItem(key);
    if (raw)
        return JSON.parse(raw);
}
catch { } return createV3State(v3); }
function save() { state.updatedAt = new Date().toISOString(); localStorage.setItem(key, JSON.stringify(state)); }
function download(name, content, type = 'text/plain') { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }
function installV3() {
    document.querySelector('main').insertAdjacentHTML('beforeend', `
    <section class="v3 panel" aria-label="release certification">
      <div class="v3-head">
        <div>
          <p class="eyebrow">v3.0 release certification</p>
          <h2>${esc(v3.productName)} Production Console</h2>
          <p class="muted">Release gates, integrity hash, import/export round trips, operations docs, and launch certification.</p>
        </div>
        <div class="button-row no-print">
          <button id="v3-certify">Load Demo Data</button>
          <button id="v3-json" class="secondary">Export Bundle</button>
          <button id="v3-md" class="secondary">Export Certification</button>
          <button id="v3-csv" class="secondary">Export Gates CSV</button>
          <label class="import-label">Import Bundle<input id="v3-import" type="file" accept="application/json" /></label>
        </div>
      </div>
      <div id="v3-cert" class="v3-cert"></div>
      <div class="v3-grid">
        <section><h3>Capabilities</h3><div id="v3-capabilities" class="pill-row"></div><h3>Quality gates</h3><ul id="v3-quality"></ul></section>
        <section><h3>Warnings</h3><ul id="v3-warnings" class="warning-list"></ul><h3>Self audit</h3><pre id="v3-audit"></pre></section>
      </div>
      <h3>Release checklist</h3>
      <div class="table-wrap"><table class="v1-table"><thead><tr><th>Gate</th><th>Status</th><th>Severity</th><th>Owner</th><th>Evidence</th><th>Notes</th></tr></thead><tbody id="v3-rows"></tbody></table></div>
    </section>`);
    bindV3Static();
    renderV3();
}
function bindV3Static() {
    $('#v3-certify').addEventListener('click', () => { if (!confirm('Load demo sample data? This pre-fills all gates for preview only \u2014 real certification requires real evidence.'))
        return; state = certifyAllV3(v3, state); save(); renderV3(); });
    $('#v3-json').addEventListener('click', () => download(`${config.slug}-release-bundle.json`, JSON.stringify(exportV3Bundle(config, v3, state), null, 2), 'application/json'));
    $('#v3-md').addEventListener('click', () => download(`${config.slug}-v3-certification.md`, buildV3Markdown(config, v3, state), 'text/markdown'));
    $('#v3-csv').addEventListener('click', () => download(`${config.slug}-v3-gates.csv`, buildV3Csv(v3, state), 'text/csv'));
    $('#v3-import').addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        try {
            const bundle = JSON.parse(await file.text());
            state = importV3Bundle(config, v3, bundle);
            save();
            renderV3();
        }
        catch (error) {
            alert(`Import failed: ${error.message}`);
        }
        finally {
            event.target.value = '';
        }
    });
}
function renderV3() {
    const cert = calculateV3Certification(v3, state);
    $('#v3-cert').innerHTML = `<article><strong>${cert.certification}/100</strong><span>${cert.status}</span><p>Integrity hash: <code>${cert.hash}</code></p></article><article><strong>${cert.verified}/${cert.total}</strong><span>verified/certified gates</span><p>${cert.blocked} blocked · ${cert.criticalOpen} critical open</p></article><article><strong>${cert.evidenceScore}%</strong><span>evidence coverage</span><p>v3 requires evidence on every gate.</p></article>`;
    $('#v3-capabilities').innerHTML = v3.capabilities.map((item) => `<span class="pill">${esc(item)}</span>`).join('');
    $('#v3-quality').innerHTML = v3.qualityGates.map((item) => `<li>${esc(item)}</li>`).join('');
    $('#v3-warnings').innerHTML = v3Warnings(v3, state).map((w) => `<li>${esc(w)}</li>`).join('') || '<li>No v3 warnings.</li>';
    $('#v3-audit').textContent = JSON.stringify(runV3SelfAudit(config, v3, state), null, 2);
    $('#v3-rows').innerHTML = state.checklist.map((row) => rowTemplate(row)).join('');
    bindV3Rows();
}
function rowTemplate(row) {
    return `<tr><td><strong>${esc(row.label)}</strong></td><td><select data-v3="status" data-id="${row.id}">${V3_STATUSES.map((s) => `<option value="${s}" ${row.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td><td><select data-v3="severity" data-id="${row.id}">${['normal', 'high', 'critical'].map((s) => `<option value="${s}" ${row.severity === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td><td><input data-v3="owner" data-id="${row.id}" value="${esc(row.owner)}" /></td><td><textarea data-v3="evidence" data-id="${row.id}" rows="2">${esc(row.evidence)}</textarea></td><td><textarea data-v3="notes" data-id="${row.id}" rows="2">${esc(row.notes)}</textarea></td></tr>`;
}
function bindV3Rows() {
    $$('[data-v3]').forEach((el) => el.addEventListener('input', (event) => {
        const row = state.checklist.find((item) => item.id === event.target.dataset.id);
        if (!row)
            return;
        row[event.target.dataset.v3] = event.target.value;
        save();
        renderV3();
    }));
}
installV3();
//# sourceMappingURL=v3-app.js.map