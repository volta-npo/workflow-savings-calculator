import { config } from './config.js';
import { createInitialState, calculateScore, readinessWarnings, buildMarkdownReport, exportJson, applySampleData } from './core.js';

const key = `volta-oss:${config.slug}:workspace`;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
let state = loadState();

function loadState() {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.warn('Could not load workspace', error);
  }
  return createInitialState(config);
}

function saveState() {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(key, JSON.stringify(state));
  const autosave = $('#autosave');
  if (autosave) autosave.textContent = `Autosaved ${new Date().toLocaleTimeString()}`;
}

function download(name, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function render() {
  document.documentElement.style.setProperty('--accent', config.theme.accent);
  document.documentElement.style.setProperty('--accent-2', config.theme.accent2);
  $('#app-title').textContent = config.title;
  $('#app-tagline').textContent = config.tagline;
  $('#repo-number').textContent = `Repo ${String(config.number).padStart(2, '0')} / 50`;
  $('#category').textContent = config.category;
  $('#metric-label').textContent = config.theme.metricLabel;
  $('#privacy-note').textContent = config.theme.privacy;
  $('#workflow').innerHTML = config.theme.workflow.map((step, i) => `<li><span>${i + 1}</span>${escapeHtml(step)}</li>`).join('');
  $('#modules').innerHTML = config.modules.map((module) => `<span class="pill" role="listitem">${escapeHtml(module)}</span>`).join('');

  for (const field of ['clientName', 'chapter', 'studentLead', 'targetUser', 'notes']) {
    const input = $(`[name="${field}"]`);
    input.value = state.project[field] || '';
  }

  const result = calculateScore(config, state);
  $('#score').textContent = result.score;
  $('#score-label').textContent = result.label;
  $('#score-ring').style.background = `conic-gradient(var(--accent) ${result.score * 3.6}deg, rgba(255,255,255,.14) 0deg)`;
  $('#score-ring').setAttribute('aria-valuenow', result.score);
  $('#warnings').innerHTML = readinessWarnings(config, state).map((warning) => `<li>${escapeHtml(warning)}</li>`).join('') || '<li>No readiness warnings.</li>';

  $('#criteria').innerHTML = result.breakdown.map((item) => criterionTemplate(item)).join('');
  $('#evidence-list').innerHTML = (state.evidence || []).map((item) => `<article class="evidence"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p><button data-remove-evidence="${item.id}">Remove</button></article>`).join('') || '<p class="muted">No evidence yet. Add screenshots, interview notes, links, or reviewer observations.</p>';
  $('#actions').innerHTML = (state.actions || []).map((action) => actionTemplate(action)).join('');

  $('#studentReview').checked = Boolean(state.approvals.studentReview);
  $('#mentorReview').checked = Boolean(state.approvals.mentorReview);
  $('#ownerApproval').checked = Boolean(state.approvals.ownerApproval);

  bindDynamicEvents();
}

function criterionTemplate(item) {
  return `<article class="criterion">
    <div>
      <strong>${escapeHtml(item.label)}</strong>
      <p>${escapeHtml(item.guidance)}</p>
    </div>
    <div class="criterion-meta"><span>${item.points}/${item.max} pts</span></div>
    <label>Status
      <select data-criterion-status="${item.id}">
        ${config.statuses.map((status) => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${status.replaceAll('-', ' ')}</option>`).join('')}
      </select>
    </label>
    <label>Evidence
      <input data-criterion-evidence="${item.id}" value="${escapeAttr(item.evidence)}" placeholder="URL, screenshot note, owner confirmation..." />
    </label>
    <label>Notes
      <textarea data-criterion-notes="${item.id}" rows="2" placeholder="Reviewer notes">${escapeHtml(item.notes)}</textarea>
    </label>
  </article>`;
}

function actionTemplate(action) {
  return `<article class="action-card">
    <label>Action
      <textarea data-action-text="${action.id}" rows="2">${escapeHtml(action.text)}</textarea>
    </label>
    <div class="two-col">
      <label>Owner <input data-action-owner="${action.id}" value="${escapeAttr(action.owner || '')}" /></label>
      <label>Due <input type="date" data-action-due="${action.id}" value="${escapeAttr(action.due || '')}" /></label>
    </div>
    <label>Status
      <select data-action-status="${action.id}">
        ${config.statuses.map((status) => `<option value="${status}" ${action.status === status ? 'selected' : ''}>${status.replaceAll('-', ' ')}</option>`).join('')}
      </select>
    </label>
  </article>`;
}

function bindDynamicEvents() {
  $$('[data-criterion-status]').forEach((input) => input.addEventListener('change', (event) => updateCriterion(event.target.dataset.criterionStatus, 'status', event.target.value)));
  $$('[data-criterion-evidence]').forEach((input) => input.addEventListener('input', (event) => updateCriterion(event.target.dataset.criterionEvidence, 'evidence', event.target.value)));
  $$('[data-criterion-notes]').forEach((input) => input.addEventListener('input', (event) => updateCriterion(event.target.dataset.criterionNotes, 'notes', event.target.value)));
  $$('[data-action-text]').forEach((input) => input.addEventListener('input', (event) => updateAction(event.target.dataset.actionText, 'text', event.target.value)));
  $$('[data-action-owner]').forEach((input) => input.addEventListener('input', (event) => updateAction(event.target.dataset.actionOwner, 'owner', event.target.value)));
  $$('[data-action-due]').forEach((input) => input.addEventListener('input', (event) => updateAction(event.target.dataset.actionDue, 'due', event.target.value)));
  $$('[data-action-status]').forEach((input) => input.addEventListener('change', (event) => updateAction(event.target.dataset.actionStatus, 'status', event.target.value)));
  $$('[data-remove-evidence]').forEach((button) => button.addEventListener('click', () => { if (!confirm('Remove this evidence item?')) return; state.evidence = state.evidence.filter((item) => item.id !== button.dataset.removeEvidence); saveState(); render(); }));
}

function updateCriterion(id, field, value) {
  const item = state.criteria.find((criterion) => criterion.id === id);
  if (item) item[field] = value;
  saveState(); render();
}

function updateAction(id, field, value) {
  const item = state.actions.find((action) => action.id === id);
  if (item) item[field] = value;
  saveState(); render();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}
function escapeAttr(value = '') { return escapeHtml(value).replace(/'/g, '&#39;'); }

function wireStaticEvents() {
  $('#project-form').addEventListener('input', (event) => {
    if (event.target.name) {
      state.project[event.target.name] = event.target.value;
      saveState();
    }
  });
  $('#approval-form').addEventListener('change', (event) => {
    state.approvals[event.target.name] = event.target.checked;
    saveState(); render();
  });
  $('#add-evidence').addEventListener('click', () => {
    const title = $('#evidence-title').value.trim();
    const detail = $('#evidence-detail').value.trim();
    if (!title && !detail) return;
    state.evidence.push({ id: crypto.randomUUID ? crypto.randomUUID() : `evidence-${Date.now()}`, title: title || 'Evidence', detail });
    $('#evidence-title').value = '';
    $('#evidence-detail').value = '';
    saveState(); render();
  });
  $('#sample').addEventListener('click', () => { if (!confirm('Load sample data? This overwrites the current local workspace.')) return; state = applySampleData(config); saveState(); render(); });
  $('#reset').addEventListener('click', () => { if (confirm('Reset this local workspace?')) { state = createInitialState(config); saveState(); render(); } });
  $('#export-json').addEventListener('click', () => download(`${config.slug}-workspace.json`, exportJson(config, state), 'application/json'));
  $('#export-md').addEventListener('click', () => download(`${config.slug}-handoff.md`, buildMarkdownReport(config, state), 'text/markdown'));
  $('#copy-md').addEventListener('click', async () => { await navigator.clipboard.writeText(buildMarkdownReport(config, state)); $('#copy-md').textContent = 'Copied'; setTimeout(() => $('#copy-md').textContent = 'Copy Markdown', 1200); });
  $('#print').addEventListener('click', () => window.print());
}

wireStaticEvents();
render();
