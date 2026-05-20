import { config } from './config.js';
import { v1 } from './v1.js';
import { createV1State, calculateV1Metrics, v1ValidationWarnings, buildV1Packet, buildV1Csv, applyV1Sample, V1_STATUS } from './v1-core.js';

const key = `volta-oss:${config.slug}:v1`;
let state = load();

function load() {
  try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch { console.warn('Saved local data could not be read and was reset.'); }
  return createV1State(v1);
}
function save() { state.updatedAt = new Date().toISOString(); localStorage.setItem(key, JSON.stringify(state)); }
function $(s) { return document.querySelector(s); }
function $$(s) { return [...document.querySelectorAll(s)]; }
function esc(value='') { return String(value).replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function download(name, content, type='text/plain') { const blob = new Blob([content], {type}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }

function install() {
  document.querySelector('main').insertAdjacentHTML('beforeend', `
    <section class="v1 panel" aria-label="v1 product workbench">
      <div class="v1-head">
        <div><p class="eyebrow">v1.0 finished product workbench</p><h2>${esc(v1.workbench)}</h2><p class="muted">${esc(v1.table)} · bespoke workflow, validation gates, generated packets, CSV export, and domain metrics.</p></div>
        <div class="button-row no-print"><button id="v1-sample" class="secondary">Load v1 Sample</button><button id="v1-json">Export v1 JSON</button><button id="v1-csv" class="secondary">Export CSV</button><button id="v1-md">Export v1 Packet</button><button id="v1-copy" class="secondary">Copy Packet</button></div>
      </div>
      <div id="v1-metrics" class="v1-metrics"></div>
      <div class="v1-grid">
        <section><h3>Validation gates</h3><ul id="v1-validations"></ul><h3>Warnings</h3><ul id="v1-warnings" class="warning-list"></ul></section>
        <section><h3>Generated deliverables</h3><div id="v1-generators" class="pill-row"></div><label>Scenario / operating notes<textarea id="v1-scenario" rows="4"></textarea></label></section>
      </div>
      <h3>${esc(v1.table)}</h3>
      <div class="table-wrap"><table class="v1-table"><thead><tr><th>Domain row</th><th>Status</th><th>Score</th><th>Owner</th><th>Due</th><th>Risk</th><th>Evidence</th><th>Notes</th></tr></thead><tbody id="v1-rows"></tbody></table></div>
    </section>`);
  bindStatic();
  render();
}
function bindStatic() {
  $('#v1-sample').addEventListener('click', () => { state = applyV1Sample(v1); save(); render(); });
  $('#v1-json').addEventListener('click', () => download(`${config.slug}-v1-workspace.json`, JSON.stringify({config:{slug:config.slug,title:config.title}, v1, state}, null, 2), 'application/json'));
  $('#v1-csv').addEventListener('click', () => download(`${config.slug}-v1-table.csv`, buildV1Csv(v1, state), 'text/csv'));
  $('#v1-md').addEventListener('click', () => download(`${config.slug}-v1-packet.md`, buildV1Packet(config, v1, state), 'text/markdown'));
  $('#v1-copy').addEventListener('click', async () => { await navigator.clipboard.writeText(buildV1Packet(config, v1, state)); $('#v1-copy').textContent='Copied'; setTimeout(()=>$('#v1-copy').textContent='Copy Packet',1200); });
  $('#v1-scenario').addEventListener('input', (e) => { state.scenario = e.target.value; save(); });
}
function render() {
  const metrics = calculateV1Metrics(v1, state);
  $('#v1-metrics').innerHTML = metrics.map((m) => `<article class="metric"><strong>${m.value}${m.suffix}</strong><span>${esc(m.name)}</span><p>${esc(m.detail)}</p></article>`).join('');
  $('#v1-validations').innerHTML = v1.validations.map((r) => `<li>${esc(r)}</li>`).join('');
  $('#v1-warnings').innerHTML = v1ValidationWarnings(v1, state).map((w) => `<li>${esc(w)}</li>`).join('') || '<li>No v1 warnings.</li>';
  $('#v1-generators').innerHTML = v1.generators.map((g) => `<span class="pill">${esc(g)}</span>`).join('');
  $('#v1-scenario').value = state.scenario || '';
  $('#v1-rows').innerHTML = state.rows.map((row) => rowTemplate(row)).join('');
  bindRows();
}
function rowTemplate(row) {
  return `<tr>
    <td><strong>${esc(row.label)}</strong></td>
    <td><select data-v1="status" data-id="${row.id}">${V1_STATUS.map((s) => `<option value="${s}" ${row.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
    <td><input data-v1="score" data-id="${row.id}" type="number" min="0" max="10" value="${esc(row.score)}" /></td>
    <td><input data-v1="owner" data-id="${row.id}" value="${esc(row.owner)}" /></td>
    <td><input data-v1="due" data-id="${row.id}" type="date" value="${esc(row.due)}" /></td>
    <td><select data-v1="risk" data-id="${row.id}">${['low','medium','high','critical'].map((r) => `<option value="${r}" ${row.risk === r ? 'selected' : ''}>${r}</option>`).join('')}</select></td>
    <td><textarea data-v1="evidence" data-id="${row.id}" rows="2">${esc(row.evidence)}</textarea></td>
    <td><textarea data-v1="notes" data-id="${row.id}" rows="2">${esc(row.notes)}</textarea></td>
  </tr>`;
}
function bindRows() {
  $$('[data-v1]').forEach((el) => el.addEventListener('input', (e) => {
    const row = state.rows.find((r) => r.id === e.target.dataset.id);
    if (!row) return;
    row[e.target.dataset.v1] = e.target.dataset.v1 === 'score' ? Number(e.target.value) : e.target.value;
    save(); render();
  }));
}
install();
