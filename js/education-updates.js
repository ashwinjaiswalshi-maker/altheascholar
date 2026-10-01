// ================================================================
// education-updates.js — the Education Updates feed: public cards/detail
// page, admin add/edit/preview/publish form, source-link display.
// ================================================================
// ================================================================
// Homepage Announcements
// ================================================================
// ================================================================
// Latest Education Updates (uses the existing "announcements" collection,
// so no new Firestore rules are needed; old announcements keep working)
// ================================================================
const UPD_TYPES = {
  cbse:{label:'CBSE Update',icon:'fa-graduation-cap',bg:'#e1edff',fg:'#1451b8',solid:'#1e6be0'},
  scholarship:{label:'Scholarship',icon:'fa-award',bg:'#fdf1e0',fg:'#c97f1f',solid:'#e0a83a'},
  exam:{label:'Exam Update',icon:'fa-file-signature',bg:'#ffe9d2',fg:'#b45309',solid:'#f07a10'},
  result:{label:'Result',icon:'fa-trophy',bg:'#eadcff',fg:'#6d28d9',solid:'#7c3aed'},
  admission:{label:'Admission',icon:'fa-user-graduate',bg:'#ffdcec',fg:'#be185d',solid:'#e11d74'},
  other:{label:'Other',icon:'fa-bullhorn',bg:'#e7ebf1',fg:'#4a5a72',solid:'#64748b'},
  notice:{label:'Notice',icon:'fa-bullhorn',bg:'#e7ebf1',fg:'#4a5a72',solid:'#64748b'},
  update:{label:'New Update',icon:'fa-bell',bg:'#e1edff',fg:'#1451b8',solid:'#1e6be0'},
  material:{label:'Study Material',icon:'fa-book',bg:'#f1e9fb',fg:'#5637a8',solid:'#7c5cd6'},
  important:{label:'Important',icon:'fa-star',bg:'#fff3c9',fg:'#8a5300',solid:'#e6a12a'}
};
const ANNOUNCEMENT_ICONS = {};
const UPD_CHIP_KEYS = ['cbse','scholarship','exam','result','admission','other'];
const _MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function updLastDate(a){ const d = new Date(a.updatedAt || a.date); if (isNaN(d)) return ''; return String(d.getDate()).padStart(2,'0') + ' ' + _MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function updT(t){ return UPD_TYPES[t] || UPD_TYPES.other; }
function updDate(a){ const d = new Date(a.date); if (isNaN(d)) return ''; return String(d.getDate()).padStart(2,'0') + ' ' + _MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function updChip(a, solid){ const t = updT(a.type); return `<span class="upd-chip" style="background:${solid ? t.solid : t.bg};color:${solid ? '#fff' : t.fg}">${_ue(t.label)}</span>`; }
function updSorted(){ return getData('announcements').filter(a => a.visible).slice().sort((x,y) => (new Date(y.date) - new Date(x.date)) || (y.id - x.id)); }
function updThumbHtml(a, flag){
  const t = updT(a.type);
  return `<div class="upd-thumb">${a.image ? `<img src="${a.image}" alt="${_ue(a.title)}" loading="lazy">` : `<i class="fas ${t.icon}"></i>`}${flag ? '<span class="upd-flag"><i class="fas fa-thumbtack"></i> Featured</span>' : ''}${a.caption ? `<span class="cap">${_ue(a.caption)}</span>` : ''}</div>`;
}
function updIconTile(a){ const t = updT(a.type); return `<div class="upd-ico" style="background:${t.bg};color:${t.fg}"><i class="fas ${t.icon}"></i></div>`; }
function updRow(a, mode){
  return `<div class="upd-row" onclick="openUpdate(${a.id})">${updIconTile(a)}<div style="min-width:0"><div class="t">${_ue(a.title)}</div>${mode === 'side' ? '' : `<div class="s">${_ue(a.desc || '')}</div>`}${mode === 'side' ? `<div class="upd-date" style="margin-top:4px"><i class="far fa-calendar"></i> ${updLastDate(a)}</div>` : ''}</div>${mode === 'side' ? '' : `<div class="m">${updChip(a)}<span class="upd-date"><i class="far fa-calendar"></i> ${updLastDate(a)}</span></div>`}</div>`;
}
function renderHomepageAnnouncements() {
  const wrap = document.getElementById('noticeSection');
  const feat = document.getElementById('updFeatured');
  const list = document.getElementById('updList');
  if (wrap && feat && list) {
    fsStartListener('announcements');
    if (fsDataFailed('announcements')) { wrap.style.display = 'none'; }
    else if (!fsDataHasLoaded('announcements')) {
      wrap.style.display = 'block';
      feat.innerHTML = '<div class="skel" style="height:170px;border-radius:14px"></div>';
      list.innerHTML = Array(3).fill('<div class="skel" style="height:54px;margin:10px 0"></div>').join('');
    } else {
      const items = updSorted();
      if (!items.length) { wrap.style.display = 'none'; }
      else {
        wrap.style.display = 'block';
        const f = items.find(a => a.pinned) || items[0];
        feat.innerHTML = `${updThumbHtml(f, true)}<div style="display:flex;flex-direction:column;min-width:0"><div>${updChip(f, true)}</div><h3>${_ue(f.title)}</h3><p>${_ue(f.desc || '')}</p><div class="upd-foot"><span class="upd-date"><i class="far fa-calendar"></i> ${updLastDate(f)}</span><button class="upd-btn" onclick="openUpdate(${f.id})">Read Update <i class="fas fa-arrow-right"></i></button></div></div>`;
        feat.onclick = null;
        const rest = items.filter(a => a.id !== f.id).slice(0, 3);
        list.innerHTML = rest.length ? rest.map(a => updRow(a)).join('') : '<div class="upd-empty">More updates coming soon.</div>';
      }
    }
  }
  if (document.getElementById('page-updates') && document.getElementById('page-updates').classList.contains('active')) renderUpdatesPage();
  if (document.getElementById('page-update-detail') && document.getElementById('page-update-detail').classList.contains('active')) renderUpdateDetail();
}
let _updFilter = 'all';
function renderUpdatesPage(){
  const f = document.getElementById('updFilters'), g = document.getElementById('updCards');
  if (!f || !g) return;
  f.innerHTML = ['all'].concat(UPD_CHIP_KEYS).map(k => `<button class="${_updFilter === k ? 'on' : ''}" onclick="_updFilter='${k}';renderUpdatesPage()">${k === 'all' ? 'All' : UPD_TYPES[k].label}</button>`).join('');
  if (!fsDataHasLoaded('announcements')) { g.innerHTML = Array(3).fill('<div class="skel" style="height:240px;border-radius:16px"></div>').join(''); return; }
  let items = updSorted();
  if (_updFilter !== 'all') items = items.filter(a => (_updFilter === 'other' ? !['cbse','scholarship','exam','result','admission'].includes(a.type) : a.type === _updFilter));
  g.innerHTML = items.length ? items.map(a => `<div class="upd-card" onclick="openUpdate(${a.id})">${updThumbHtml(a, a.pinned)}<div class="b"><div>${updChip(a)}</div><h3>${_ue(a.title)}</h3><p>${_ue(a.desc || '')}</p><span class="upd-date"><i class="far fa-calendar"></i> ${updLastDate(a)}</span></div></div>`).join('') : '<div class="upd-empty" style="grid-column:1/-1">No updates in this category yet.</div>';
}
let _curUpdId = null;
function openUpdate(id, push) {
  _curUpdId = id;
  if (push !== false) history.pushState({ page: 'page-update-detail', uid: id }, '', '#update-' + id);
  activatePage('page-update-detail');
}
const _XSVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M18.2 2H21l-6.5 7.4L22 22h-6l-4.7-6.1L5.9 22H3l7-8L2 2h6.1l4.3 5.6L18.2 2zm-1 18h1.7L7 3.9H5.2L17.2 20z"/></svg>';
const _OFFICIAL_HOST = /(\.gov\.in|\.nic\.in|\.gov|\.ac\.in|\.edu\.in|\.res\.in)$/i;
// Source label: only "Official Source" when the admin marked it official, or
// (for older updates with no Source Type) when the link is on a government /
// academic domain. Anything else is never presented as official.
function updSourceInfo(a){
  const url = _safeUrl(a.source); if (!url) return null;
  let host = ''; try { host = new URL(url).hostname; } catch (e) {}
  let kind = a.sourceType;
  if (kind !== 'official' && kind !== 'other') kind = _OFFICIAL_HOST.test(host) ? 'official' : 'unspecified';
  return { url, host, kind, label: kind === 'official' ? 'Official Source' : kind === 'other' ? 'Other Source' : 'Source' };
}
// ---- dynamic SEO for the in-app detail pages (title/description/canonical/OG/JSON-LD) ----
const _SEO_ORIG = {};
function updLd(a, canon, desc){
  const src = updSourceInfo(a);
  const art = { '@type': 'Article', headline: a.seoTitle || a.title, description: desc, datePublished: a.date, dateModified: a.updatedAt || a.date,
    mainEntityOfPage: canon, author: { '@type': 'Organization', name: 'Althea Scholar' }, publisher: { '@type': 'Organization', name: 'Althea Scholar', url: 'https://altheascholar.in/' } };
  if (/^https?:\/\//i.test(a.image || '')) art.image = a.image;
  if (src && src.kind === 'official') art.citation = src.url;
  return { '@context': 'https://schema.org', '@graph': [ art,
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://altheascholar.in/' },
      { '@type': 'ListItem', position: 2, name: 'Education Updates', item: 'https://altheascholar.in/education-updates.html' },
      { '@type': 'ListItem', position: 3, name: a.title, item: canon } ] } ] };
}
// One renderer for both the public page and the admin Preview — no duplicate layout.
function updDetailHtml(a, preview){
  const t = updT(a.type);
  const points = (a.points || []).filter(Boolean);
  const dates = _lines(a.importantDates).map(l => { const i = l.indexOf(':'); return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : ['', l]; });
  const elig = _lines(a.eligibility), docs = _lines(a.documents), how = _lines(a.howToApply);
  const src = updSourceInfo(a);
  const web = _safeUrl(a.officialWebsite), notif = _safeUrl(a.notificationUrl), apply = _safeUrl(a.applyLink);
  const btn = a.btnText || a.link || 'Visit Official Website';
  const url = location.origin + location.pathname + '#update-' + a.id;
  const eu = encodeURIComponent(url), et = encodeURIComponent(a.title + ' — Althea Scholar');
  const related = updSorted().filter(x => x.id !== a.id).slice(0, 3);
  const sec = (icon, title, inner) => `<div class="udt-sec"><h4><i class="fas ${icon}"></i> ${title}</h4>${inner}</div>`;
  const list = (arr, ord) => { const tag = ord ? 'ol' : 'ul'; return `<${tag} class="udt-list">${arr.map(x => `<li>${_ue(x)}</li>`).join('')}</${tag}>`; };
  const links = [];
  if (apply) links.push(['pri', 'fa-pen-to-square', 'Application Link', apply]);
  if (web) links.push([apply ? '' : 'pri', 'fa-globe', 'Official Website', web]);
  if (notif) links.push(['', 'fa-file-pdf', 'Official Notification / PDF', notif]);
  const hasDetail = dates.length || elig.length || docs.length || how.length || a.fee || points.length;
  return `
  <div class="udt-crumb"><a onclick="showPage('page-home')">Home</a> / <a onclick="showPage('page-updates')">Education Updates</a> / ${_ue(a.title)}</div>
  <div class="udt-frame"><div class="udt-grid">
    <div class="udt-main">
      ${a.image ? `<figure class="udt-fig"><img src="${_ue(a.image)}" alt="${_ue(a.title)}">${a.caption ? `<figcaption>${_ue(a.caption)}</figcaption>` : ''}</figure>` : ''}
      <h1>${_ue(a.title)}</h1>
      <div class="udt-meta"><span class="udt-badge" style="background:${t.solid}"><i class="fas ${t.icon}"></i> ${_ue(t.label)}</span>
        <span><i class="far fa-calendar"></i> Last updated: ${updLastDate(a)}</span>
        ${a.adminVerified ? '<span class="udt-ver"><i class="fas fa-circle-check"></i> Checked by admin</span>' : ''}
        ${preview && !a.visible ? '<span class="udt-ver" style="background:#fff3c9;color:#8a5300">Hidden / draft</span>' : ''}</div>
      <div class="udt-sum"><h4>Quick Summary</h4><p>${_ue(a.desc || '')}</p></div>
      ${a.fullDesc ? sec('fa-align-left', 'Details', `<div class="udt-txt">${_ue(a.fullDesc)}</div>`) : ''}
      ${dates.length ? sec('fa-calendar-days', 'Important Dates', `<div class="udt-tblwrap"><table class="udt-tbl">${dates.map(d => d[0] ? `<tr><td>${_ue(d[0])}</td><td>${_ue(d[1])}</td></tr>` : `<tr><td colspan="2">${_ue(d[1])}</td></tr>`).join('')}</table></div>`) : ''}
      ${elig.length ? sec('fa-user-check', 'Eligibility', list(elig)) : ''}
      ${docs.length ? sec('fa-folder-open', 'Documents Required', list(docs)) : ''}
      ${how.length ? sec('fa-list-ol', 'How to Apply', list(how, true)) : ''}
      ${a.fee ? sec('fa-indian-rupee-sign', 'Application Fee', `<div class="udt-txt">${_ue(a.fee)}</div>`) : ''}
      ${points.length ? sec('fa-circle-info', 'Important Points', `<ul style="padding:0;margin:0">${points.map(p => `<li style="list-style:none;display:flex;gap:9px;font-size:13.5px;color:#3f5170;line-height:1.5;margin-bottom:8px"><i class="fas fa-circle-check" style="color:var(--u-blue);margin-top:3px"></i><span>${_ue(p)}</span></li>`).join('')}</ul>`) : ''}
      ${links.length ? sec('fa-link', 'Official Links', `<div class="udt-links">${links.map(l => `<a class="${l[0]}" href="${_ue(l[3])}" target="_blank" rel="noopener"><i class="fas ${l[1]}"></i> ${l[2]}</a>`).join('')}</div>`) : ''}
      ${src ? `<div class="udt-src"><div class="ic"><i class="fas ${src.kind === 'official' ? 'fa-shield-halved' : 'fa-link'}"></i></div><div style="min-width:0"><b${src.kind === 'official' ? '' : ' style="color:#4a5a72"'}>${src.label}</b><a class="u" href="${_ue(src.url)}" target="_blank" rel="noopener">${_ue(src.url)}</a>${src.kind === 'unspecified' ? '<div class="udt-note" style="margin:2px 0 0">This link has not been marked as an official source.</div>' : ''}</div><a class="upd-btn" href="${_ue(src.url)}" target="_blank" rel="noopener">${_ue(btn)} <i class="fas fa-arrow-right"></i></a></div>` : ''}
      ${(hasDetail || src) ? '<div class="udt-note">Please confirm dates, fees and eligibility on the official website or notification before applying.</div>' : ''}
    </div>
    <div class="udt-side"${preview ? ' style="pointer-events:none"' : ''}>
      <div class="card"><h4>Related Updates</h4>${related.length ? related.map(r => updRow(r, 'side')).join('') : '<div class="upd-empty" style="padding:8px">No other updates yet.</div>'}<button class="upd-btn" onclick="showPage('page-updates')">View All Updates <i class="fas fa-arrow-right"></i></button></div>
      <div class="card"><h4>Share This Update</h4><div class="udt-share">
        <a style="background:#0A4174" href="https://wa.me/?text=${et}%20${eu}" target="_blank" rel="noopener" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
        <a style="background:#1877f2" href="https://www.facebook.com/sharer/sharer.php?u=${eu}" target="_blank" rel="noopener" title="Facebook"><i class="fab fa-facebook-f"></i></a>
        <a style="background:#000" href="https://twitter.com/intent/tweet?url=${eu}&text=${et}" target="_blank" rel="noopener" title="X">${_XSVG}</a>
        <a style="background:#0a66c2" href="https://www.linkedin.com/sharing/share-offsite/?url=${eu}" target="_blank" rel="noopener" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        <a style="background:#2aabee" href="https://t.me/share/url?url=${eu}&text=${et}" target="_blank" rel="noopener" title="Telegram"><i class="fab fa-telegram-plane"></i></a>
      </div></div>
    </div>
  </div></div>`;
}
function renderUpdateDetail() {
  const box = document.getElementById('updDetailBody');
  if (!box) return;
  fsStartListener('announcements');
  const a = getData('announcements').find(x => x.id === _curUpdId);
  if (!a) {
    box.innerHTML = fsDataHasLoaded('announcements') ? '<div class="upd-empty">This update is not available. <a style="color:var(--u-blue);cursor:pointer;font-weight:700" onclick="showPage(\'page-updates\')">View all updates</a></div>' : '<div class="skel" style="height:320px;border-radius:16px"></div>';
    return;
  }
  // Hidden/draft updates are never shown on the public page.
  if (!a.visible && !isAdminLoggedIn) { box.innerHTML = '<div class="upd-empty">This update is not available. <a style="color:var(--u-blue);cursor:pointer;font-weight:700" onclick="showPage(\'page-updates\')">View all updates</a></div>'; return; }
  box.innerHTML = updDetailHtml(a, false);
  const canon = 'https://altheascholar.in/education-update.html?id=' + a.id;
  const desc = (a.seoDesc || a.desc || '').slice(0, 170);
  applyPageSeo({ title: (a.seoTitle || a.title) + ' | Althea Scholar', desc, keywords: a.keywords, url: canon, image: a.image, ld: updLd(a, canon, desc) });
}
// ---------- Admin: Add / Edit / All updates ----------
let editingAnnouncementId = null;
let _updImg = '';
function updSetType(v) {
  document.getElementById('up_type').value = v;
  document.querySelectorAll('#upChips button').forEach(b => b.classList.toggle('on', b.dataset.t === v));
}
function initUpdChips() {
  const c = document.getElementById('upChips'), s = document.getElementById('up_type');
  if (!c || c.dataset.ready) return;
  c.dataset.ready = 1;
  c.innerHTML = UPD_CHIP_KEYS.map(k => `<button type="button" data-t="${k}" style="background:${UPD_TYPES[k].solid}" onclick="updSetType('${k}')">${UPD_TYPES[k].label}</button>`).join('');
  s.innerHTML = UPD_CHIP_KEYS.map(k => `<option value="${k}">${UPD_TYPES[k].label}</option>`).join('');
  s.onchange = () => updSetType(s.value);
  updSetType('cbse');
}
function onUpdImg(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('⚠️ Image must be under 2MB.', 'error'); input.value = ''; return; }
  compressImageToDataUrl(file, 1200, 0.78).then(url => { _updImg = url; refreshUpdImgPrev(); });
}
function refreshUpdImgPrev() {
  const p = document.getElementById('up_img_prev');
  p.src = _updImg || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  document.getElementById('up_img_del').style.display = _updImg ? 'inline-flex' : 'none';
}
function clearUpdImg() { _updImg = ''; document.getElementById('up_img_file').value = ''; refreshUpdImgPrev(); }
function resetUpdForm() {
  editingAnnouncementId = null; _updImg = '';
  ['up_title','up_desc','up_source','up_btn','up_points','up_caption','up_full','up_dates','up_elig','up_docs','up_how','up_fee','up_website','up_notif','up_apply','up_seotitle','up_seodesc','up_keywords','up_updated'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const d = new Date(); document.getElementById('up_date').value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  document.getElementById('up_visible').checked = true; document.getElementById('up_pin').checked = false;
  document.getElementById('up_verified').checked = false; document.getElementById('up_srctype').value = '';
  initUpdChips(); updSetType('cbse'); refreshUpdImgPrev();
  document.getElementById('upPublishBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Publish Update';
  document.getElementById('upFormTitle').textContent = 'Add New Update';
}
function collectUpdData() {
  const g = id => document.getElementById(id).value.trim();
  const iso = v => new Date(v + 'T12:00:00').toISOString();
  const dv = g('up_date'), uv = g('up_updated');
  return {
    type: document.getElementById('up_type').value, title: g('up_title'), desc: g('up_desc'),
    date: dv ? iso(dv) : new Date().toISOString(),
    source: g('up_source'), btnText: g('up_btn'), caption: g('up_caption'),
    points: g('up_points').split('\n').map(s => s.trim()).filter(Boolean),
    fullDesc: g('up_full'), importantDates: g('up_dates'), eligibility: g('up_elig'), documents: g('up_docs'), howToApply: g('up_how'),
    fee: g('up_fee'), sourceType: g('up_srctype'), officialWebsite: g('up_website'), notificationUrl: g('up_notif'), applyLink: g('up_apply'),
    seoTitle: g('up_seotitle'), seoDesc: g('up_seodesc'), keywords: g('up_keywords'),
    updatedAt: uv ? iso(uv) : new Date().toISOString(),
    adminVerified: document.getElementById('up_verified').checked,
    image: _updImg, visible: document.getElementById('up_visible').checked, pinned: document.getElementById('up_pin').checked
  };
}
// mode === 'draft' saves the update hidden; nothing is ever published automatically.
function addAnnouncement(mode) {
  const g = id => document.getElementById(id).value.trim();
  if (!g('up_title')) { showToast('⚠️ Title is required!', 'error'); return; }
  if (!g('up_desc')) { showToast('⚠️ Short description is required!', 'error'); return; }
  const data = collectUpdData();
  const badLink = ['source', 'officialWebsite', 'notificationUrl', 'applyLink'].find(k => data[k] && !_safeUrl(data[k]));
  if (badLink) { showToast('⚠️ Links must start with http:// or https://', 'error'); return; }
  if (mode === 'draft') data.visible = false;
  const prev = editingAnnouncementId !== null ? getData('announcements').find(x => x.id === editingAnnouncementId) : null;
  data.verifiedAt = data.adminVerified ? ((prev && prev.verifiedAt) || new Date().toISOString()) : '';
  if (editingAnnouncementId !== null) { updateData('announcements', editingAnnouncementId, data); showToast(mode === 'draft' ? '📝 Saved as draft (hidden)' : '✅ Update saved!'); }
  else { addData('announcements', data); showToast(mode === 'draft' ? '📝 Saved as draft (hidden)' : (data.visible ? '✅ Update published!' : '✅ Saved (hidden)')); }
  resetUpdForm();
  showAdminTab('update-all');
}
function showUpdPreview(a) {
  let ov = document.getElementById('updPreviewOverlay');
  if (!ov) { ov = document.createElement('div'); ov.id = 'updPreviewOverlay'; ov.className = 'udt-prev'; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="box"><div class="udt-prevbar"><span><i class="fas fa-eye"></i> Preview only — nothing is saved or published</span><button type="button" class="btn btn-outline btn-sm" onclick="closeUpdPreview()">Close</button></div><div class="udt-wrap" style="margin:0;padding:0">${updDetailHtml(a, true)}</div></div>`;
  ov.style.display = 'block'; document.body.style.overflow = 'hidden'; ov.scrollTop = 0;
}
function closeUpdPreview() { const ov = document.getElementById('updPreviewOverlay'); if (ov) ov.style.display = 'none'; document.body.style.overflow = ''; }
function previewUpdate() {
  const d = collectUpdData();
  if (!d.title) { showToast('⚠️ Add a title to preview.', 'error'); return; }
  d.id = -1; showUpdPreview(d);
}
function previewSavedUpdate(id) { const a = getData('announcements').find(x => x.id === id); if (a) showUpdPreview(a); }
function renderAdminAnnouncements() {
  const tbody = document.getElementById('adminAnnouncementsTable');
  if (!tbody) return;
  const items = getData('announcements').slice().sort((x, y) => (new Date(y.date) - new Date(x.date)) || (y.id - x.id));
  tbody.innerHTML = items.length ? items.map(a => {
    const vis = getPendingOrActual('announcements', a.id, a.visible);
    return `<tr>
      <td>${a.image ? `<img src="${a.image}" style="width:64px;height:38px;object-fit:cover;border-radius:6px">` : `<span style="font-size:20px;color:var(--u-blue)"><i class="fas ${updT(a.type).icon}"></i></span>`}</td>
      <td><strong>${_ue(a.title)}</strong><br>${updChip(a)}${a.adminVerified ? ' <span title="Admin verified" style="color:#177a3c;font-size:12px"><i class="fas fa-circle-check"></i></span>' : ''}</td>
      <td>${updDate(a)}</td>
      <td><button class="btn btn-outline btn-sm" onclick="toggleUpdPin(${a.id})" title="Pin to top (Featured)">${a.pinned ? '📌 Pinned' : 'Pin'}</button></td>
      <td><label class="mini-toggle-row"><input type="checkbox" ${vis ? 'checked' : ''} onchange="stageVisibilityChange('announcements', ${a.id}, this.checked, renderAdminAnnouncements)"> ${vis ? 'Visible' : 'Hidden'}</label></td>
      <td style="white-space:nowrap"><button class="btn btn-outline btn-sm" title="Preview" onclick="previewSavedUpdate(${a.id})"><i class="fas fa-eye"></i></button> <button class="btn btn-outline btn-sm" onclick="editAnnouncement(${a.id})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm" onclick="if(confirm('Delete this update?')) deleteData('announcements', ${a.id})"><i class="fas fa-trash"></i></button></td>
    </tr>`;
  }).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--gray);">No updates yet. Use “Add New Update”.</td></tr>';
}
function toggleUpdPin(id) {
  const a = getData('announcements').find(x => x.id === id); if (!a) return;
  updateData('announcements', id, { pinned: !a.pinned });
  showToast(a.pinned ? '📌 Pinned to top' : 'Unpinned');
}
function editAnnouncement(id) {
  const a = getData('announcements').find(x => x.id === id); if (!a) return;
  showAdminTab('update-add');
  initUpdChips();
  editingAnnouncementId = id; _updImg = a.image || '';
  const set = (k, v) => document.getElementById(k).value = v || '';
  set('up_title', a.title); set('up_desc', a.desc); set('up_source', a.source); set('up_btn', a.btnText || a.link); set('up_caption', a.caption);
  set('up_points', (a.points || []).join('\n'));
  set('up_full', a.fullDesc); set('up_dates', a.importantDates); set('up_elig', a.eligibility); set('up_docs', a.documents); set('up_how', a.howToApply);
  set('up_fee', a.fee); set('up_srctype', a.sourceType); set('up_website', a.officialWebsite); set('up_notif', a.notificationUrl); set('up_apply', a.applyLink);
  set('up_seotitle', a.seoTitle); set('up_seodesc', a.seoDesc); set('up_keywords', a.keywords);
  { const ud = new Date(a.updatedAt || ''); set('up_updated', isNaN(ud) ? '' : ud.getFullYear() + '-' + String(ud.getMonth() + 1).padStart(2, '0') + '-' + String(ud.getDate()).padStart(2, '0')); }
  document.getElementById('up_verified').checked = !!a.adminVerified;
  const d = new Date(a.date); set('up_date', isNaN(d) ? '' : d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
  const tp = UPD_CHIP_KEYS.includes(a.type) ? a.type : 'other';
  updSetType(tp);
  document.getElementById('up_visible').checked = !!a.visible; document.getElementById('up_pin').checked = !!a.pinned;
  refreshUpdImgPrev();
  document.getElementById('upPublishBtn').innerHTML = '<i class="fas fa-save"></i> Save Changes';
  document.getElementById('upFormTitle').textContent = 'Edit Update';
}
