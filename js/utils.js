// ================================================================
// utils.js — small, theme-agnostic helper functions used across the app
// (HTML-escaping, toasts, PDF export, SEO meta helpers, etc).
// ================================================================
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = type === 'success' ? '#0A4174' : '#dc3545';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
// Resizes/compresses an image file before it is stored, so multiple images
// don't exceed the browser's localStorage quota (this was the cause of
// homepage image saves silently failing when more than one image was set).
function compressImageToDataUrl(file, maxDim = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result); // fallback: use original if it can't be resized
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
// Every localStorage write in the app goes through this so a quota-exceeded
// error is shown to the admin instead of failing silently with nothing saved.
// ================================================================
// Admin Study Content: Subject/Chapter dropdown with "Add New" option
// ================================================================
function getSelectOrCustomValue(selectId, customId) {
  const sel = document.getElementById(selectId);
  if (sel.value === '__new__') {
    return document.getElementById(customId).value.trim();
  }
  return sel.value;
}
// ================================================================
// PDF Export — full registration form as a downloadable PDF
// (all fields + uploaded documents / payment screenshot, image files embedded)
// ================================================================
function pdfRow(label, value) {
  return `<tr><td style="padding:4px 8px;font-weight:700;color:#0b2b5e;width:38%;border-bottom:1px solid #eee;">${label}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;">${value || 'N/A'}</td></tr>`;
}
function pdfDocBlock(label, filename, fileData) {
  if (!fileData) return `<p style="margin:6px 0;color:#888;">${label}: Not uploaded</p>`;
  const isImage = filename && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  if (isImage) return `<div style="margin:10px 0;"><div style="font-weight:700;color:#0b2b5e;margin-bottom:4px;">${label}</div><img src="${fileData}" crossorigin="anonymous" style="max-width:260px;max-height:200px;border:1px solid #ddd;border-radius:6px;"></div>`;
  return `<p style="margin:6px 0;"><strong style="color:#0b2b5e;">${label}:</strong> <a href="${fileData}" target="_blank">${filename || 'file'}</a> (PDF/doc files aren't embedded in this summary PDF — use the link, or view it from the file preview in Admin Panel)</p>`;
}
function generatePdfFromNode(node, filename) {
  if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
    showToast('⚠️ PDF library failed to load — check your internet connection and try again.', 'error');
    document.body.removeChild(node);
    return;
  }
  showToast('⏳ Generating PDF...');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'pt', 'a4');
  try {
    doc.html(node, {
      x: 24, y: 24, width: 545, windowWidth: 800,
      html2canvas: { useCORS: true, allowTaint: false, imageTimeout: 15000 },
      callback: function (doc) {
        doc.save(filename);
        document.body.removeChild(node);
        showToast('✅ PDF downloaded!');
      }
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    showToast('⚠️ PDF generation failed. Please try again.', 'error');
    if (node.parentNode) document.body.removeChild(node);
  }
}
function downloadTeacherPDF(id) {
  const t = getData('teachers').find(x => x.id === id);
  if (!t) return;
  const node = document.createElement('div');
  node.style.cssText = 'position:fixed;left:-9999px;top:0;width:760px;padding:16px;font-family:Arial,sans-serif;font-size:12px;color:#0b1e33;background:#fff;';
  node.innerHTML = `
    <h2 style="color:#1a4cff;margin-bottom:2px;">Althea Scholar — Teacher Registration Form</h2>
    <p style="color:#888;margin-bottom:14px;">Downloaded from Admin Panel on ${new Date().toLocaleString()}</p>
    <table style="width:100%;border-collapse:collapse;">
      ${pdfRow('Registration ID', t.regId)} ${pdfRow('Name', t.name)} ${pdfRow('Gender', t.gender)} ${pdfRow('Date of Birth', t.dob)}
      ${pdfRow('Mobile', t.mobile)} ${pdfRow('WhatsApp', t.whatsapp)} ${pdfRow('Email', t.email)}
      ${pdfRow('City / Area', t.city)} ${pdfRow('State', t.state)} ${pdfRow('Address', t.address)}
      ${pdfRow('Qualification', t.qualification)} ${pdfRow('Degree / Course', t.degree)} ${pdfRow('University / Board', t.university)}
      ${pdfRow('Experience', t.experience)} ${pdfRow('Institution', t.institution)} ${pdfRow('Professional Status', t.professionalStatus)}
      ${pdfRow('Subjects', t.subjects)} ${pdfRow('Classes', t.classes)} ${pdfRow('Board / Curriculum', t.board)}
      ${pdfRow('Teaching Mode', t.mode)} ${pdfRow('Preferred Area', t.prefArea)} ${pdfRow('Preferred Days', t.prefDays)}
      ${pdfRow('Preferred Time', t.prefTime)} ${pdfRow('Individual/Group', t.classType)} ${pdfRow('Travel Distance', t.travelDistance)}
      ${pdfRow('Monthly Fee', t.fee)} ${pdfRow('Fee Per Hour', t.feePerHour)} ${pdfRow('Demo Available', t.demo)}
      ${pdfRow('Min Classes/Week', t.minClasses)} ${pdfRow('Membership Plan', t.plan)} ${pdfRow('Status', t.status)}
      ${pdfRow('Registered On', t.registeredAt ? new Date(t.registeredAt).toLocaleString() : '')}
      ${t.plan === 'premium' ? pdfRow('Premium Status', t.premiumStatus) : ''}
      ${t.plan === 'premium' ? pdfRow('Payment UTR', t.premiumUtr) : ''}
    </table>
    <h3 style="color:#0b2b5e;margin-top:18px;">Uploaded Documents</h3>
    ${pdfDocBlock('Profile Photo', t.photo, t.photoData)}
    ${pdfDocBlock('Aadhaar / ID Proof', t.aadhaar, t.aadhaarData)}
    ${pdfDocBlock('Resume / CV', t.resume, t.resumeData)}
    ${t.plan === 'premium' ? pdfDocBlock('Payment Screenshot', 'payment.png', t.premiumScreenshotData) : ''}
  `;
  document.body.appendChild(node);
  generatePdfFromNode(node, `Teacher_${(t.name || 'registration').replace(/\s+/g, '_')}_${t.id}.pdf`);
}
function downloadStudentPDF(id) {
  const s = getData('students').find(x => x.id === id);
  if (!s) return;
  const node = document.createElement('div');
  node.style.cssText = 'position:fixed;left:-9999px;top:0;width:760px;padding:16px;font-family:Arial,sans-serif;font-size:12px;color:#0b1e33;background:#fff;';
  const studentsRows = (s.students || []).map((st, i) => `
    <tr><td style="padding:4px 8px;border-bottom:1px solid #eee;" colspan="2"><strong>Student ${i+1}:</strong> ${st.name} | Class: ${st.class} | Subjects: ${st.subjects}${st.school ? ' | School: ' + st.school : ''} | Board: ${st.board || 'N/A'}</td></tr>
  `).join('');
  node.innerHTML = `
    <h2 style="color:#1a4cff;margin-bottom:2px;">Althea Scholar — Student / Parent Registration Form</h2>
    <p style="color:#888;margin-bottom:14px;">Downloaded from Admin Panel on ${new Date().toLocaleString()}</p>
    <table style="width:100%;border-collapse:collapse;">
      ${pdfRow('Registration ID', s.regId)} ${pdfRow('Parent Name', s.parent)} ${pdfRow('Mobile', s.mobile)} ${pdfRow('WhatsApp', s.whatsapp)}
      ${pdfRow('Email', s.email)} ${pdfRow('City', s.city)} ${pdfRow('State', s.state)}
      ${pdfRow('Address', s.address)} ${pdfRow('Mode', s.mode)} ${pdfRow('Days', s.days)}
      ${pdfRow('Time', s.time)} ${pdfRow('Classes/Week', s.classesPerWeek)} ${pdfRow('Budget', s.budget)}
      ${pdfRow('Preferred Gender', s.prefGender)} ${pdfRow('Preferred Language', s.prefLanguage)} ${pdfRow('Specific Requirement', s.specific)}
      ${pdfRow('Status', s.status)} ${pdfRow('Registered On', s.registeredAt ? new Date(s.registeredAt).toLocaleString() : '')}
    </table>
    <h3 style="color:#0b2b5e;margin-top:18px;">Student(s)</h3>
    <table style="width:100%;border-collapse:collapse;">${studentsRows}</table>
  `;
  document.body.appendChild(node);
  generatePdfFromNode(node, `Student_${(s.parent || 'registration').replace(/\s+/g, '_')}_${s.id}.pdf`);
}
function _ue(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function _safeUrl(u){ u = String(u == null ? '' : u).trim(); return /^https?:\/\//i.test(u) ? u : ''; }
function _lines(s){ return String(s == null ? '' : s).split('\n').map(x => x.trim()).filter(Boolean); }
function _setMeta(sel, attr, key, val){
  let el = document.querySelector(sel);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  if (!(sel in _SEO_ORIG)) _SEO_ORIG[sel] = el.getAttribute('content');
  el.setAttribute('content', val);
}
function applyPageSeo(o){
  if (!('title' in _SEO_ORIG)) _SEO_ORIG.title = document.title;
  document.title = o.title;
  if (o.desc) { _setMeta('meta[name="description"]', 'name', 'description', o.desc); _setMeta('meta[property="og:description"]', 'property', 'og:description', o.desc); }
  _setMeta('meta[property="og:title"]', 'property', 'og:title', o.title);
  _setMeta('meta[property="og:type"]', 'property', 'og:type', 'article');
  if (o.keywords) _setMeta('meta[name="keywords"]', 'name', 'keywords', o.keywords);
  if (o.url) {
    _setMeta('meta[property="og:url"]', 'property', 'og:url', o.url);
    const c = document.querySelector('link[rel="canonical"]');
    if (c) { if (!('canon' in _SEO_ORIG)) _SEO_ORIG.canon = c.getAttribute('href'); c.setAttribute('href', o.url); }
  }
  if (o.image && /^https?:\/\//i.test(o.image)) _setMeta('meta[property="og:image"]', 'property', 'og:image', o.image);
  let ld = document.getElementById('dynLd');
  if (o.ld) { if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'dynLd'; document.head.appendChild(ld); } ld.textContent = JSON.stringify(o.ld); }
  else if (ld) ld.remove();
}
function resetPageSeo(){
  const keys = Object.keys(_SEO_ORIG); if (!keys.length) return;
  keys.forEach(k => {
    if (k === 'title') document.title = _SEO_ORIG.title;
    else if (k === 'canon') { const c = document.querySelector('link[rel="canonical"]'); if (c) c.setAttribute('href', _SEO_ORIG.canon); }
    else { const el = document.querySelector(k); if (el) { if (_SEO_ORIG[k] === null) el.removeAttribute('content'); else el.setAttribute('content', _SEO_ORIG[k]); } }
    delete _SEO_ORIG[k];
  });
  const ld = document.getElementById('dynLd'); if (ld) ld.remove();
}
// Builds sitemap.xml from what is actually public: the standalone pages (respecting
// the SEO Pages "visible" switches) + every visible Education Update + visible blog post.
// Hidden/draft items, admin and login are never included.
function downloadSitemap() {
  const base = 'https://altheascholar.in/';
  const seo = getSeoPages();
  const today = new Date().toISOString().slice(0, 10);
  const day = v => { const d = new Date(v); return isNaN(d) ? today : d.toISOString().slice(0, 10); };
  const rows = [[base, today, '1.0']];
  Object.keys(SEO_PAGES_DEFAULT.pages).forEach(slug => { if (seo.visible[slug] !== false) rows.push([base + slug + '.html', today, '0.7']); });
  if (seo.visible['tuition-cities'] !== false) rows.push([base + 'tuition-cities.html', today, '0.7']);
  rows.push([base + 'education-updates.html', today, '0.8'], [base + 'blog.html', today, '0.7']);
  getData('announcements').filter(a => a.visible).forEach(a => rows.push([base + 'education-update.html?id=' + a.id, day(a.updatedAt || a.date), '0.6']));
  getData('blogPosts').filter(p => p.visible).forEach(p => rows.push([base + 'blog-post.html?id=' + p.id, day(p.date), '0.6']));
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    rows.map(r => `  <url>\n    <loc>${_ue(r[0])}</loc>\n    <lastmod>${r[1]}</lastmod>\n    <priority>${r[2]}</priority>\n  </url>`).join('\n') + '\n</urlset>\n';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([xml], { type: 'application/xml' })); a.download = 'sitemap.xml';
  document.body.appendChild(a); a.click(); a.remove();
  showToast('✅ sitemap.xml downloaded (' + rows.length + ' URLs)');
}
function exportAllData() {
  const data = {
    teachers: getData('teachers'),
    students: getData('students'),
    leads: getData('leads'),
    studyContent: getData('studyContent'),
    studyExtras: getData('studyExtras'),
    entranceContent: getData('entranceContent'),
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `althea_data_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ Data exported!');
}
