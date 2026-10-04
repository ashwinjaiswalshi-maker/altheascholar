/* ================================================================
   alti-admin.js — Admin → "Alti Knowledge" tab.
   Add / edit / delete Q&A for the chatbot. Stored in the Firestore
   collection "altiKnowledge" (free Spark plan is enough). Needs this rule:
     match /altiKnowledge/{docId} { allow read: if true;
                                    allow create, update, delete: if request.auth != null; }
   Entries here always win over the built-in data/alti-knowledge.json.
   ================================================================ */
(function (global) {
  'use strict';
  let editingId = null;
  const $ = id => document.getElementById(id);
  const lines = v => String(v || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
  const csv = v => String(v || '').split(',').map(x => x.trim()).filter(Boolean);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CATS = { site: 'Website / Tutor / Teacher', study: 'Study Material', exams: 'Exams & Boards', tips: 'Study tips', career: 'Career guidance', edu_math: 'Maths', edu_science: 'Science', edu_social: 'Social Science', edu_english: 'English', edu_hindi: 'Hindi', smalltalk: 'Small talk' };

  function fillCategories() {
    const sel = $('alti_cat'); if (!sel || sel.dataset.ready) return; sel.dataset.ready = '1';
    sel.innerHTML = Object.keys(CATS).map(k => '<option value="' + k + '">' + CATS[k] + '</option>').join('');
  }
  function actionFromForm() {
    const t = $('alti_act_type').value, v = $('alti_act_val').value.trim();
    if (!t) return null; if (t === 'wa') return { type: 'wa' };
    if (!v) return null; return { type: t, value: v };
  }
  function renderAdminAlti() {
    fillCategories();
    const list = (typeof getData === 'function' ? getData('altiKnowledge') : []) || [];
    const q = ($('alti_search') && $('alti_search').value || '').toLowerCase();
    const rows = list.filter(d => !q || JSON.stringify(d).toLowerCase().includes(q));
    const tb = $('altiAdminTable'); if (!tb) return;
    $('alti_count').textContent = list.length + ' custom entries';
    tb.innerHTML = rows.length ? rows.map(d => '<tr><td><b>' + esc(d.title || '') + '</b><br><small>' + esc(CATS[d.category] || d.category || '') + (d.enabled === false ? ' · <span style="color:#c0392b">disabled</span>' : '') + '</small></td>' +
      '<td>' + esc((d.question_variations || []).slice(0, 3).join(' / ')) + ((d.question_variations || []).length > 3 ? ' … (+' + ((d.question_variations || []).length - 3) + ')' : '') + '</td>' +
      '<td style="max-width:260px">' + esc(String(d.answer || '').slice(0, 120)) + '</td>' +
      '<td><button class="btn btn-outline btn-sm" onclick="altiAdminEdit(' + d.id + ')"><i class="fas fa-edit"></i></button> <button class="btn btn-danger btn-sm" onclick="altiAdminDelete(' + d.id + ')"><i class="fas fa-trash"></i></button></td></tr>').join('')
      : '<tr><td colspan="4" style="text-align:center;color:var(--gray);padding:18px">Abhi koi custom entry nahi. Upar form se add karo.</td></tr>';
  }
  function save() {
    const variations = lines($('alti_q').value), answer = $('alti_a').value.trim();
    if (!variations.length || !answer) { showToast('Kam se kam 1 question aur answer likhna zaroori hai', 'error'); return; }
    const item = { title: $('alti_title').value.trim() || variations[0].slice(0, 60), category: $('alti_cat').value, question_variations: variations, keywords: csv($('alti_kw').value),
      answer, answer_en: $('alti_a_en').value.trim(), related_questions: csv($('alti_rel').value), action: actionFromForm(), enabled: $('alti_enabled').checked };
    if (!item.answer_en) delete item.answer_en; if (!item.action) delete item.action;
    if (editingId !== null) { updateData('altiKnowledge', editingId, item); showToast('Entry updated ✅'); }
    else { addData('altiKnowledge', item); showToast('Entry added ✅ — Alti ab ye jawab dega'); }
    reset(); renderAdminAlti();
  }
  function reset() {
    editingId = null;
    ['alti_title', 'alti_q', 'alti_kw', 'alti_a', 'alti_a_en', 'alti_rel', 'alti_act_val'].forEach(i => { const e = $(i); if (e) e.value = ''; });
    $('alti_act_type').value = ''; $('alti_enabled').checked = true; $('alti_edit_banner').style.display = 'none'; $('alti_submit').innerHTML = '<i class="fas fa-plus"></i> Add to Alti';
  }
  function edit(id) {
    const d = getData('altiKnowledge').find(x => String(x.id) === String(id)); if (!d) return;
    editingId = d.id; fillCategories();
    $('alti_title').value = d.title || ''; $('alti_cat').value = d.category || 'site'; $('alti_q').value = (d.question_variations || []).join('\n'); $('alti_kw').value = (d.keywords || []).join(', ');
    $('alti_a').value = d.answer || ''; $('alti_a_en').value = d.answer_en || ''; $('alti_rel').value = (d.related_questions || []).join(', ');
    $('alti_act_type').value = d.action ? d.action.type : ''; $('alti_act_val').value = d.action && d.action.value || ''; $('alti_enabled').checked = d.enabled !== false;
    $('alti_edit_banner').style.display = 'block'; $('alti_submit').innerHTML = '<i class="fas fa-save"></i> Update entry';
    $('admin-alti').scrollIntoView({ behavior: 'smooth' });
  }
  function del(id) { if (!confirm('Is entry ko delete karna hai?')) return; deleteData('altiKnowledge', id); renderAdminAlti(); }
  function exportJson() {
    const data = JSON.stringify({ version: '1.0', entries: getData('altiKnowledge') }, null, 2);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = 'alti-custom-knowledge.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function importJson(input) {
    const f = input.files && input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result); const arr = Array.isArray(j) ? j : (j.entries || []); let n = 0;
        arr.forEach(e => { if (e && e.answer && (e.question_variations || []).length) { const c = { title: e.title || e.question_variations[0], category: e.category || 'site', question_variations: e.question_variations, keywords: e.keywords || [], answer: e.answer, related_questions: e.related_questions || [], enabled: true }; if (e.answer_en) c.answer_en = e.answer_en; if (e.action) c.action = e.action; addData('altiKnowledge', c); n++; }});
        showToast(n + ' entries import ho gayi ✅'); setTimeout(renderAdminAlti, 600);
      } catch (err) { showToast('JSON file sahi format mein nahi hai', 'error'); }
      input.value = '';
    };
    r.readAsText(f);
  }
  global.renderAdminAlti = renderAdminAlti; global.altiAdminSave = save; global.altiAdminReset = reset; global.altiAdminEdit = edit; global.altiAdminDelete = del; global.altiAdminExport = exportJson; global.altiAdminImport = importJson;
})(window);
