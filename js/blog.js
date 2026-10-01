// ================================================================
// blog.js — Blog list/detail pages and the admin editor.
// ================================================================
// ================================================================
// Blog Posts — admin controlled
// ================================================================
const BLOG_DEFAULTS = () => ([
  { id: 1001, title: 'How to Choose the Right Home Tutor for Your Child', author: 'Althea Scholar Team', date: new Date().toISOString(), category: 'Tutoring tips', cta: 'find-tutor', image: '', excerpt: 'A few simple checks before you finalize a tutor — experience, teaching style, and trial class.', content: 'Choosing the right home tutor can make a huge difference in your child\'s academic journey.\n\nLook for verified experience, a subject match to your child\'s board and class, and always take a free demo class before committing.\n\nAsk about teaching style — some children learn better with visual aids, others with practice-heavy sessions. Communication with the tutor should feel easy and transparent.', visible: true },
  { id: 1002, title: '5 Study Tips for Board Exam Success', author: 'Althea Scholar Team', date: new Date().toISOString(), category: 'Exam preparation', cta: 'study-material', image: '', excerpt: 'Simple, practical study habits that help students stay consistent through exam season.', content: 'Board exams can feel overwhelming, but a few consistent habits go a long way.\n\n1. Make a realistic daily timetable.\n2. Practice previous years\' papers.\n3. Take short breaks to avoid burnout.\n4. Revise using mind maps and notes.\n5. Sleep well the night before exams.', visible: true }
]);
function getBlogPosts() {
  const posts = getData('blogPosts');
  if (posts.length === 0 && !_fsListenersStarted['blogPosts_seeded']) {
    _fsListenersStarted['blogPosts_seeded'] = true;
    // Seed default posts once, only if the collection is genuinely empty online.
    setTimeout(() => {
      if ((getData('blogPosts') || []).length === 0) {
        BLOG_DEFAULTS().forEach(p => { const { id, ...rest } = p; addData('blogPosts', rest); });
      }
    }, 1200);
  }
  return posts;
}
function _blogSorted() { return getBlogPosts().slice().sort((a, b) => (new Date(b.date) - new Date(a.date)) || (b.id - a.id)); }
function _blogDate(p) { const d = new Date(p.date); return isNaN(d) ? '' : String(d.getDate()).padStart(2, '0') + ' ' + _MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function renderBlogList() {
  const grid = document.getElementById('blogListGrid');
  if (!grid) return;
  const posts = _blogSorted().filter(p => p.visible);
  grid.innerHTML = posts.length ? posts.map(p => `
    <div class="offer-card" style="cursor:pointer;" onclick="openBlogPage(${p.id})">
      ${p.image ? `<img src="${_ue(p.image)}" alt="${_ue(p.title)}" loading="lazy" style="width:100%;height:140px;object-fit:cover;border-radius:12px;margin-bottom:10px;">` : ''}
      ${p.category ? `<span class="upd-chip" style="background:#e1edff;color:#1451b8;margin-bottom:6px">${_ue(p.category)}</span>` : ''}
      <h4>${_ue(p.title)}</h4>
      <p style="font-size:12px;color:var(--gray);margin-bottom:6px;">${_blogDate(p)} · ${_ue(p.author || 'Althea Scholar Team')}</p>
      <p style="font-size:13px;color:var(--gray);">${_ue((p.excerpt || '').slice(0, 110))}${(p.excerpt||'').length > 110 ? '…' : ''}</p>
    </div>
  `).join('') : '<p style="color:var(--gray);">No blog posts yet.</p>';
}
let _curBlogId = null;
function openBlogPage(id, push) {
  _curBlogId = id;
  if (push !== false) history.pushState({ page: 'page-blog-detail', bid: id }, '', '#blog-' + id);
  activatePage('page-blog-detail');
}
// Opens Study Material pre-selected on a class (and subject) — only if that
// class/subject actually exists in the Study Material data.
function openStudyMaterial(cls, sub) {
  showPage('page-study');
  smInitClassDropdown();
  const cs = document.getElementById('sm_class');
  if (!cls || !studyClassesList.includes(cls) || !cs) return;
  cs.value = cls; smSelectClass(cls);
  const ss = document.getElementById('sm_subject');
  if (sub && ss && [...ss.options].some(o => o.value === sub)) { ss.value = sub; smSelectSubject(sub); }
}
function _blogLinkAttrs(href) {
  const map = { '#study-material': "showPage('page-study')", '#education-updates': "showPage('page-updates')", '#find-tutor': "showPage('page-student-form')",
    '#become-teacher': "showPage('page-teacher-form')", '#entrance-exams': "showPage('page-entrance')", '#blog': "showPage('page-blog')", '#our-teachers': "showPage('page-teachers')" };
  if (map[href]) return `href="${href}" onclick="${map[href]};return false;"`;
  if (/^https?:\/\//i.test(href)) return `href="${_ue(href)}" target="_blank" rel="noopener"`;
  return '';
}
// Small, safe renderer: everything is HTML-escaped first, then a few
// markers become headings / lists / links.
function blogBodyHtml(text) {
  const inline = t => _ue(t).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[a-z-]+)\)/g, (m, label, href) => { const a = _blogLinkAttrs(href.replace(/&amp;/g, '&')); return a ? `<a ${a}>${label}</a>` : label; });
  const out = []; let list = [];
  const flush = () => { if (list.length) { out.push('<ul class="udt-list">' + list.map(x => `<li>${inline(x)}</li>`).join('') + '</ul>'); list = []; } };
  String(text || '').split(/\n{2,}/).forEach(block => {
    block.split('\n').forEach(line => {
      const l = line.trim(); if (!l) return;
      if (/^###\s+/.test(l)) { flush(); out.push(`<h3>${inline(l.replace(/^###\s+/, ''))}</h3>`); }
      else if (/^##\s+/.test(l)) { flush(); out.push(`<h2>${inline(l.replace(/^##\s+/, ''))}</h2>`); }
      else if (/^[-*]\s+/.test(l)) list.push(l.replace(/^[-*]\s+/, ''));
      else { flush(); out.push(`<p>${inline(l)}</p>`); }
    });
    flush();
  });
  return out.join('');
}
const BLOG_CTAS = {
  'find-tutor': { t: 'Looking for a tutor?', d: 'Tell us the class, subjects and mode you need. Registration is free.', b: 'Find a Tutor', go: "showPage('page-student-form')" },
  'become-teacher': { t: 'Want to teach with us?', d: 'Register free — your profile is listed after the team reviews your documents.', b: 'Become a Teacher', go: "showPage('page-teacher-form')" },
  'study-material': { t: 'Free study material', d: 'Notes, exercise answers and practice papers for Class 6–12.', b: 'Open Study Material', go: "showPage('page-study')" },
  'entrance-exams': { t: 'Preparing for an entrance exam?', d: 'Guides for Sainik School, Navodaya, RMS CET and more.', b: 'See Entrance Exams', go: "showPage('page-entrance')" }
};
function blogDetailHtml(p, preview) {
  const smOk = p.smClass && studyClassesList.includes(p.smClass) && (!p.smSubject || Object.keys(DEFAULT_STUDY_DATA[p.smClass] || {}).includes(p.smSubject));
  const upd = p.relatedUpdate ? getData('announcements').find(x => x.id === Number(p.relatedUpdate) && x.visible) : null;
  const cta = BLOG_CTAS[p.cta];
  const others = _blogSorted().filter(x => x.visible && x.id !== p.id);
  const related = others.filter(x => p.category && x.category === p.category).concat(others.filter(x => !(p.category && x.category === p.category))).slice(0, 3);
  const smLabel = smOk ? (p.smSubject ? `${p.smClass} ${p.smSubject} Study Material` : `${p.smClass} Study Material`) : '';
  return `
  <div class="udt-crumb"><a onclick="showPage('page-home')">Home</a> / <a onclick="showPage('page-blog')">Blog</a> / ${_ue(p.title)}</div>
  <div class="udt-frame"><div class="udt-grid">
    <article class="udt-main">
      ${p.image ? `<figure class="udt-fig"><img src="${_ue(p.image)}" alt="${_ue(p.title)}"></figure>` : ''}
      <h1>${_ue(p.title)}</h1>
      <div class="udt-meta">${p.category ? `<span class="upd-chip" style="background:#e1edff;color:#1451b8">${_ue(p.category)}</span>` : ''}<span><i class="far fa-calendar"></i> ${_blogDate(p)}</span><span><i class="far fa-user"></i> ${_ue(p.author || 'Althea Scholar Team')}</span>${preview && !p.visible ? '<span class="udt-ver" style="background:#fff3c9;color:#8a5300">Hidden / draft</span>' : ''}</div>
      <div class="udt-body">${blogBodyHtml(p.content || p.excerpt || '')}</div>
      ${cta ? `<div class="cta-inline" style="margin-top:22px;border:1px solid var(--u-line);background:var(--u-soft);border-radius:14px;padding:16px 18px"><b style="color:var(--u-navy);font-size:16px">${cta.t}</b><p style="margin:4px 0 12px;font-size:13.5px;color:#3f5170">${cta.d}</p><button class="upd-btn" onclick="${cta.go}">${cta.b} <i class="fas fa-arrow-right"></i></button></div>` : ''}
    </article>
    <div class="udt-side"${preview ? ' style="pointer-events:none"' : ''}>
      ${(smOk || upd) ? `<div class="card"><h4>Related resources</h4><div class="udt-links" style="grid-template-columns:1fr">
        ${smOk ? `<a onclick="openStudyMaterial('${_ue(p.smClass)}','${_ue(p.smSubject || '')}')"><i class="fas fa-book-open"></i> ${_ue(smLabel)}</a>` : ''}
        ${upd ? `<a onclick="openUpdate(${upd.id})"><i class="fas fa-bullhorn"></i> Education Update: ${_ue(upd.title)}</a>` : ''}
      </div></div>` : ''}
      <div class="card"><h4>Related articles</h4>${related.length ? related.map(r => `<div class="upd-row" onclick="openBlogPage(${r.id})"><div style="min-width:0"><div class="t">${_ue(r.title)}</div><div class="upd-date" style="margin-top:4px"><i class="far fa-calendar"></i> ${_blogDate(r)}</div></div></div>`).join('') : '<div class="upd-empty" style="padding:8px">No other articles yet.</div>'}<button class="upd-btn" onclick="showPage('page-blog')">All Articles <i class="fas fa-arrow-right"></i></button></div>
      <div class="card"><h4>Explore</h4><div class="udt-links" style="grid-template-columns:1fr">
        <a onclick="showPage('page-study')"><i class="fas fa-book-open"></i> Study Material</a>
        <a onclick="showPage('page-updates')"><i class="fas fa-bullhorn"></i> Education Updates</a>
        <a onclick="showPage('page-student-form')"><i class="fas fa-user-graduate"></i> Find a Tutor</a></div></div>
    </div>
  </div></div>`;
}
function renderBlogDetail() {
  const box = document.getElementById('blogDetailBody');
  if (!box) return;
  fsStartListener('announcements');
  const p = getBlogPosts().find(x => x.id === _curBlogId);
  if (!p || (!p.visible && !isAdminLoggedIn)) {
    box.innerHTML = getData('blogPosts').length ? '<div class="upd-empty">This article is not available. <a style="color:var(--u-blue);cursor:pointer;font-weight:700" onclick="showPage(\'page-blog\')">View all articles</a></div>' : '<div class="skel" style="height:320px;border-radius:16px"></div>';
    return;
  }
  box.innerHTML = blogDetailHtml(p, false);
  const canon = 'https://altheascholar.in/blog-post.html?id=' + p.id;
  const desc = (p.seoDesc || p.excerpt || '').slice(0, 170);
  const post = { '@type': 'BlogPosting', headline: p.seoTitle || p.title, description: desc, datePublished: p.date, dateModified: p.date, mainEntityOfPage: canon,
    author: { '@type': 'Organization', name: p.author || 'Althea Scholar Team' }, publisher: { '@type': 'Organization', name: 'Althea Scholar', url: 'https://altheascholar.in/' } };
  if (/^https?:\/\//i.test(p.image || '')) post.image = p.image;
  const ld = { '@context': 'https://schema.org', '@graph': [ post, { '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://altheascholar.in/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://altheascholar.in/blog.html' },
    { '@type': 'ListItem', position: 3, name: p.title, item: canon } ] } ] };
  applyPageSeo({ title: (p.seoTitle || p.title) + ' | Althea Scholar Blog', desc, url: canon, image: p.image, ld });
}
let editingBlogId = null;
function blFillSubjects(sel) {
  const cls = document.getElementById('bl_sm_class').value, ss = document.getElementById('bl_sm_subject');
  ss.innerHTML = '<option value="">Subject (optional)</option>' + Object.keys(DEFAULT_STUDY_DATA[cls] || {}).map(x => `<option value="${_ue(x)}">${_ue(x)}</option>`).join('');
  if (sel) ss.value = sel;
}
function blInitSelects() {
  const c = document.getElementById('bl_sm_class');
  if (c && !c.dataset.ready) { c.dataset.ready = 1; c.innerHTML = '<option value="">Related Study Material: class (optional)</option>' + studyClassesList.map(x => `<option value="${x}">${x}</option>`).join(''); }
  const u = document.getElementById('bl_upd');
  if (u) { const cur = u.value; u.innerHTML = '<option value="">Related Education Update (optional)</option>' + getData('announcements').slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map(a => `<option value="${a.id}">${_ue(a.title.slice(0, 90))}</option>`).join(''); u.value = cur; }
}
function collectBlogData() {
  const g = id => document.getElementById(id).value.trim();
  const prev = document.getElementById('bl_image_preview');
  return { title: g('bl_title'), author: g('bl_author') || 'Althea Scholar Team', excerpt: g('bl_excerpt'), content: g('bl_content'),
    category: g('bl_category'), cta: g('bl_cta'), smClass: g('bl_sm_class'), smSubject: g('bl_sm_subject'), relatedUpdate: g('bl_upd'),
    seoTitle: g('bl_seotitle'), seoDesc: g('bl_seodesc'), image: prev.dataset.data || '' };
}
function previewBlogPost() {
  const d = collectBlogData();
  if (!d.title) { showToast('⚠️ Add a title to preview.', 'error'); return; }
  d.id = -1; d.date = new Date().toISOString(); d.visible = true;
  let ov = document.getElementById('updPreviewOverlay');
  if (!ov) { ov = document.createElement('div'); ov.id = 'updPreviewOverlay'; ov.className = 'udt-prev'; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="box"><div class="udt-prevbar"><span><i class="fas fa-eye"></i> Preview only — nothing is saved or published</span><button type="button" class="btn btn-outline btn-sm" onclick="closeUpdPreview()">Close</button></div><div class="udt-wrap" style="margin:0;padding:0">${blogDetailHtml(d, true)}</div></div>`;
  ov.style.display = 'block'; document.body.style.overflow = 'hidden'; ov.scrollTop = 0;
}
function previewSavedBlog(id) {
  const p = getBlogPosts().find(x => x.id === id); if (!p) return;
  let ov = document.getElementById('updPreviewOverlay');
  if (!ov) { ov = document.createElement('div'); ov.id = 'updPreviewOverlay'; ov.className = 'udt-prev'; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="box"><div class="udt-prevbar"><span><i class="fas fa-eye"></i> Preview only</span><button type="button" class="btn btn-outline btn-sm" onclick="closeUpdPreview()">Close</button></div><div class="udt-wrap" style="margin:0;padding:0">${blogDetailHtml(p, true)}</div></div>`;
  ov.style.display = 'block'; document.body.style.overflow = 'hidden'; ov.scrollTop = 0;
}
async function blogImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 6 * 1024 * 1024) { showToast('⚠️ Image too big! Max 6MB.', 'error'); input.value = ''; return; }
  showToast('⏳ Uploading image...');
  let url;
  try { url = await uploadToCloudinary(file, 'image', 'althea-scholar/blog'); }
  catch (err) { showToast('⚠️ ' + (err.message || 'Image upload failed — check your internet connection.'), 'error'); return; }
  const prev = document.getElementById('bl_image_preview');
  prev.src = url; prev.style.display = 'block';
  prev.dataset.data = url;
}
// mode === 'draft' saves hidden. Nothing publishes by itself.
function addOrUpdateBlogPost(mode) {
  const d = collectBlogData();
  if (!d.title) { showToast('⚠️ Title is required!', 'error'); return; }
  if (editingBlogId !== null) {
    const existing = getBlogPosts().find(p => p.id === editingBlogId);
    const upd = Object.assign({}, d, { image: d.image || (existing ? existing.image : '') });
    if (mode === 'draft') upd.visible = false;
    updateData('blogPosts', editingBlogId, upd);
    showToast(mode === 'draft' ? '📝 Saved as draft (hidden)' : '✅ Blog post updated!');
    cancelEditBlog();
  } else {
    addData('blogPosts', Object.assign({}, d, { date: new Date().toISOString(), visible: mode !== 'draft' }));
    showToast(mode === 'draft' ? '📝 Saved as draft (hidden)' : '✅ Blog post published!');
    cancelEditBlog();
  }
  renderAdminBlog(); renderBlogList();
}
function editBlogPost(id) {
  const p = getBlogPosts().find(x => x.id === id);
  if (!p) return;
  blInitSelects();
  editingBlogId = id;
  const set = (k, v) => document.getElementById(k).value = v || '';
  set('bl_title', p.title); set('bl_author', p.author); set('bl_excerpt', p.excerpt); set('bl_content', p.content);
  set('bl_category', p.category); set('bl_cta', p.cta); set('bl_seotitle', p.seoTitle); set('bl_seodesc', p.seoDesc); set('bl_upd', p.relatedUpdate);
  set('bl_sm_class', p.smClass); blFillSubjects(p.smSubject);
  const prev = document.getElementById('bl_image_preview');
  if (p.image) { prev.src = p.image; prev.style.display = 'block'; prev.dataset.data = p.image; } else { prev.style.display = 'none'; delete prev.dataset.data; }
  document.getElementById('blog_edit_banner').style.display = 'block';
  document.getElementById('bl_submit_btn').innerHTML = '<i class="fas fa-save"></i> Update Post';
  document.getElementById('admin-blog').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function cancelEditBlog() {
  editingBlogId = null;
  ['bl_title','bl_author','bl_excerpt','bl_content','bl_image','bl_category','bl_cta','bl_sm_class','bl_seotitle','bl_seodesc','bl_upd'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  blFillSubjects();
  const prev = document.getElementById('bl_image_preview'); prev.style.display = 'none'; delete prev.dataset.data;
  document.getElementById('blog_edit_banner').style.display = 'none';
  document.getElementById('bl_submit_btn').innerHTML = '<i class="fas fa-plus"></i> Publish Post';
}
function toggleBlogVisible(id, checked) {
  updateData('blogPosts', id, { visible: checked });
  renderBlogList();
}
function deleteBlogPost(id) {
  if (!confirm('Delete this blog post?')) return;
  deleteData('blogPosts', id);
  renderAdminBlog(); renderBlogList();
  showToast('🗑️ Blog post deleted.');
}
function renderAdminBlog() {
  blInitSelects();
  const posts = getBlogPosts();
  const tbody = document.getElementById('adminBlogTable');
  if (!tbody) return;
  tbody.innerHTML = posts.length ? posts.slice().reverse().map(p => `
    <tr>
      <td>${p.image ? `<img class="img-thumb-sm" src="${p.image}">` : '<i class="fas fa-image" style="font-size:22px;color:var(--border);"></i>'}</td>
      <td><strong>${_ue(p.title)}</strong>${p.category ? `<br><small style="color:var(--gray)">${_ue(p.category)}</small>` : ''}</td>
      <td>${p.author || '-'}</td>
      <td>${new Date(p.date).toLocaleDateString()}</td>
      <td><label class="mini-toggle-row"><input type="checkbox" ${p.visible ? 'checked' : ''} onchange="toggleBlogVisible(${p.id}, this.checked)"> ${p.visible ? 'Visible' : 'Hidden'}</label></td>
      <td><button class="btn btn-outline btn-sm" title="Preview" onclick="previewSavedBlog(${p.id})"><i class="fas fa-eye"></i></button> <button class="btn btn-outline btn-sm" onclick="editBlogPost(${p.id})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm" onclick="deleteBlogPost(${p.id})"><i class="fas fa-trash"></i></button></td>
    </tr>
  `).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--gray);">No blog posts yet.</td></tr>';
}
