// ================================================================
// news-autofill.js — auto-fills the "Add New Update" form from a notice that
// the News Source Checker detected.  SEPARATE file: news-checker.js and
// education-updates.js are NOT edited — this file wraps a few of their
// functions (nscFetchOne, checkOneNewsSource, nscCreateDraft, showAdminTab).
//
// What happens:
//  1. While checking a source, the page's links/headlines are remembered.
//     When the page changes, the NEW (or best-looking) notice is stored on the
//     Pending Update.
//  2. "Create Draft" opens the form already filled: title, type, date,
//     short description, links, SEO… Then (in the background) the notice's own
//     page is opened and the remaining fields are filled when that page
//     actually contains them: full description, important dates, eligibility,
//     documents, how to apply, fee, apply link, image.
//  3. EVERYTHING stays editable. Nothing is published automatically,
//     "Admin verified" is never ticked for you, and a field is left empty
//     when the page doesn't contain that information (nothing is invented).
//     If you upload your own image it is never overwritten.
// ================================================================
(function () {
  'use strict';
  const PROXY = (typeof NEWS_PROXY_URL !== 'undefined') ? NEWS_PROXY_URL : '';
  const $ = id => document.getElementById(id);
  const clean = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const cut = (s, n) => { s = clean(s); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
  const h36 = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ---------------------------------------------------------------
  // 1. Fetching (same direct-then-proxy logic as news-checker.js, but the
  //    page text is kept so it can be analysed). Hash is computed exactly as
  //    before, so existing baselines stay valid.
  // ---------------------------------------------------------------
  const pageCache = new Map(); // url -> { html, t }
  async function getText(url, viaProxy, ms) {
    const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(viaProxy ? PROXY + '?url=' + encodeURIComponent(url) : url, { mode: 'cors', cache: 'no-store', signal: ctrl.signal, redirect: 'follow' });
      clearTimeout(timer);
      if (!res.ok) return { ok: false, httpError: true };
      return { ok: true, text: await res.text() };
    } catch (e) { clearTimeout(timer); return { ok: false, httpError: false }; }
  }
  async function fetchPage(url) {
    let r = await getText(url, false, 12000);
    if (!r.ok && !r.httpError && PROXY) r = await getText(url, true, 18000);
    if (r.ok) pageCache.set(url, { html: r.text, t: Date.now() });
    return r;
  }
  if (typeof nscFetchOne === 'function' && typeof nscHash === 'function' && typeof nscExtractText === 'function') {
    window.nscFetchOne = async function (url) {
      const r = await fetchPage(url);
      if (!r.ok) return { ok: false, httpError: !!r.httpError };
      return { ok: true, hash: nscHash(nscExtractText(r.text)) };
    };
  }

  // ---------------------------------------------------------------
  // 2. Reading a page
  // ---------------------------------------------------------------
  function parseDoc(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script,style,noscript,iframe,svg,template').forEach(n => n.remove());
    return doc;
  }
  const abs = (href, base) => { try { return new URL(href, base).href; } catch (e) { return ''; } };
  const isPdf = u => /\.pdf(\?|#|$)/i.test(u || '');
  const NAV = /^(home|about( us)?|contact( us)?|sitemap|site map|login|log in|sign in|sign up|skip to.*|screen reader.*|accessibility.*|feedback|privacy.*|terms.*|disclaimer|help|faqs?|rti|archives?|more|read more|view all|view more|click here|here|download|english|hindi|text size|facebook|twitter|instagram|youtube|linkedin|whatsapp|top|back|next|previous|search|menu|close|ok|go)$/i;
  const NAVSUB = /(skip to main|screen reader|copyright|visitor|hit counter|last updated|best viewed|all rights reserved|cookie|javascript|toggle navigation|font size)/i;
  const KEY_RX = /(notice|notification|circular|press release|advisory|result|admit card|hall ticket|date ?sheet|time ?table|schedule|registration|apply|application|last date|extended|extension|revised|corrigendum|scholarship|admission|counsell?ing|seat allot|answer key|syllabus|sample paper|examination|exam\b|recruitment|vacanc|merit list|cut-?off|brochure|bulletin|public notice|important|announcement|invit)/i;

  const MONTHS_RX = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
  const monIdx = m => MON.findIndex(x => x.toLowerCase() === String(m).slice(0, 3).toLowerCase());
  function findDates(text) {
    const out = [], t = String(text || '');
    const push = (d, m, y, index) => {
      y = +y; if (y < 100) y += 2000; d = +d; m = +m;
      const nowY = new Date().getFullYear();
      if (y < nowY - 3 || y > nowY + 3 || m < 1 || m > 12 || d < 1 || d > 31) return;
      out.push({ iso: y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'), text: String(d).padStart(2, '0') + ' ' + MON[m - 1] + ' ' + y, index });
    };
    let m, r1 = /\b(\d{1,2})\s?[\/\-.]\s?(\d{1,2})\s?[\/\-.]\s?(\d{2,4})\b/g;
    while ((m = r1.exec(t))) push(m[1], m[2], m[3], m.index);
    const r2 = new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?[\\s,\\-]+' + MONTHS_RX + '[a-z]*\\.?,?[\\s\\-]+(\\d{4})\\b', 'gi');
    while ((m = r2.exec(t))) push(m[1], monIdx(m[2]) + 1, m[3], m.index);
    const r3 = new RegExp('\\b' + MONTHS_RX + '[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b', 'gi');
    while ((m = r3.exec(t))) push(m[2], monIdx(m[1]) + 1, m[3], m.index);
    out.sort((a, b) => a.index - b.index);
    const seen = new Set(); return out.filter(d => !seen.has(d.iso) && seen.add(d.iso));
  }
  function ctxOf(a) {
    let el = a.closest('li,tr,p,dd,dt,article,.row,div'); let txt = el ? clean(el.textContent) : '';
    if (txt.length > 400 && el) txt = clean(a.parentElement ? a.parentElement.textContent : '');
    return txt.slice(0, 400);
  }
  function score(it) {
    let s = 0; const t = it.t;
    if (KEY_RX.test(t)) s += 4;
    if (/\b20(2[4-9]|3\d)\b|session|academic year/i.test(t)) s += 2;
    if (it.d) s += 2;
    if (isPdf(it.u)) s += 1;
    if (t.length >= 25 && t.length <= 150) s += 1;
    if (t.split(' ').length < 3) s -= 3;
    return s;
  }
  function collectItems(doc, base) {
    const items = [], seen = new Set();
    doc.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!href || /^(javascript:|mailto:|tel:|#)/i.test(href)) return;
      let t = clean(a.textContent) || clean(a.getAttribute('title')) || clean(a.getAttribute('aria-label'));
      if (t.length < 12 || t.length > 260 || NAV.test(t) || NAVSUB.test(t)) return;
      const u = abs(href, base); if (!/^https?:/i.test(u)) return;
      const key = h36(t.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g, ' ').slice(0, 100));
      if (seen.has(key)) return; seen.add(key);
      const c = ctxOf(a); const dts = findDates(t + ' ' + c);
      const it = { t, u, k: key, c: c === t ? '' : c, d: dts.length ? dts[0].iso : '' };
      it.s = score(it); items.push(it);
    });
    return items;
  }
  function pageMeta(doc, base) {
    const meta = (sel) => { const e = doc.querySelector(sel); return e ? clean(e.getAttribute('content')) : ''; };
    let og = meta('meta[property="og:image"]') || meta('meta[name="twitter:image"]');
    return { title: meta('meta[property="og:title"]') || clean((doc.querySelector('title') || {}).textContent), desc: meta('meta[property="og:description"]') || meta('meta[name="description"]'), og: og ? abs(og, base) : '' };
  }

  // ---------------------------------------------------------------
  // 3. While checking: remember items, attach the new notice to the Pending Update
  // ---------------------------------------------------------------
  if (typeof checkOneNewsSource === 'function') {
    const _check = checkOneNewsSource;
    window.checkOneNewsSource = async function (src, silent) {
      const started = Date.now();
      const prev = Array.isArray(src.lastItems) ? new Set(src.lastItems) : null;
      const status = await _check.call(this, src, true);   // original logic, unchanged
      try {
        const cap = pageCache.get(src.url);
        if (cap && cap.t >= started) {
          const doc = parseDoc(cap.html), items = collectItems(doc, src.url), meta = pageMeta(doc, src.url);
          updateData('newsSources', src.id, { lastItems: items.map(i => i.k).slice(0, 150) });
          if (status === 'new') attachExtract(src, items, prev, meta);
        }
      } catch (e) { console.warn('news-autofill: could not analyse', src.url, e); }
      if (!silent && typeof renderNewsSourcesAdmin === 'function') renderNewsSourcesAdmin();
      return status;
    };
  }
  function pickCandidates(items, prev) {
    const fresh = prev ? items.filter(i => !prev.has(i.k)) : [];
    const pool = fresh.length ? fresh : items;
    const top = pool.slice().sort((a, b) => (b.s - a.s) || (b.d > a.d ? 1 : -1)).filter(i => i.s > 0).slice(0, 5);
    return { list: top.length ? top : pool.slice(0, 3), newDetected: fresh.length > 0 };
  }
  function attachExtract(src, items, prev, meta) {
    const p = getData('pendingUpdates').find(x => String(x.sourceId) === String(src.id) && x.status === 'open');
    if (!p) return;
    const pc = pickCandidates(items, prev);
    const x = { v: 1, title: cut(meta.title, 140), og: meta.og || '', newDetected: pc.newDetected, items: pc.list.map(i => ({ t: cut(i.t, 240), u: i.u, d: i.d, c: cut(i.c, 200) })) };
    const best = x.items[0];
    const note = best ? (pc.newDetected ? 'New item spotted: “' + cut(best.t, 120) + '”. ' : 'Page changed. Most notice-like item: “' + cut(best.t, 120) + '” (not 100% sure it is the new one). ') + 'Create Draft fills the form for you — check it before publishing.' : p.note;
    updateData('pendingUpdates', p.id, { x, note });
  }

  // ---------------------------------------------------------------
  // 4. Classifying / writing the draft
  // ---------------------------------------------------------------
  function classify(text, org) {
    const t = String(text || '').toLowerCase();
    if (/scholarship|fellowship|stipend|financial assistance|inspire award/.test(t)) return 'scholarship';
    if (/\bresults?\b|merit list|cut-?off|score ?card|rank list|declared/.test(t)) return 'result';
    if (/admit card|hall ticket|date ?sheet|time ?table|exam schedule|examination|exam city|answer key|sample paper|syllabus|supplementary|practical exam|\bexam\b/.test(t)) return 'exam';
    if (/admission|counsell?ing|registration|apply|application|seat allot|enrol|vacanc|recruitment/.test(t)) return 'admission';
    if (/cbse/i.test(org || '')) return 'cbse';
    return 'other';
  }
  const TYPE_LABEL = { cbse: 'CBSE Update', scholarship: 'Scholarship', exam: 'Exam Update', result: 'Result', admission: 'Admission', other: 'Other' };
  function hostOf(u) { try { return new URL(u).hostname; } catch (e) { return ''; } }
  function dateLabel(txt) {
    const s = txt.toLowerCase();
    if (/last date|closing date|last day|deadline|closes?|till|up ?to|upto|before/.test(s)) return 'Last date';
    if (/admit card|hall ticket/.test(s)) return 'Admit card';
    if (/result/.test(s)) return 'Result';
    if (/exam(ination)?s? (date|will)|conducted on|held on|exam on|date of exam|commence/.test(s)) return 'Exam date';
    if (/start|begin|open|commenc|from/.test(s)) return 'Starts';
    if (/notice|circular|notification|dated|issued/.test(s)) return 'Notice date';
    return 'Date';
  }

  // Blocks of readable text from the notice page (paragraphs / list items / table rows)
  function mainNode(doc) { return doc.querySelector('main,article,[role=main],#content,#main,.content,.entry-content,.main-content,#maincontent') || doc.body; }
  function blocksOf(root) {
    const out = [], seen = new Set();
    root.querySelectorAll('p,li,td,dd,h1,h2,h3,h4,h5,h6').forEach(n => {
      if (n.closest('nav,header,footer,aside,form,.menu,.navbar,.nav')) return;
      if (n.matches('td') && n.querySelector('table')) return;
      const t = clean(n.textContent);
      if (t.length < 25 || t.length > 700 || NAVSUB.test(t) || seen.has(t)) return;
      seen.add(t); out.push({ t, tag: n.tagName.toLowerCase() });
    });
    return out;
  }
  function sectionAfter(root, rx, max) {
    const heads = Array.from(root.querySelectorAll('h1,h2,h3,h4,h5,h6,strong,b,th,dt,p,div,span,u')).filter(e => { const t = clean(e.textContent); return t.length < 70 && rx.test(t) && !e.closest('nav,header,footer'); });
    for (const h of heads) {
      const lines = [];
      // list right after the heading
      let n = h.closest('h1,h2,h3,h4,h5,h6,p,div,dt,th') || h; n = n.nextElementSibling;
      let guard = 0;
      while (n && guard++ < 6 && lines.length < max) {
        if (/^H[1-6]$/.test(n.tagName)) break;
        if (/^(UL|OL)$/.test(n.tagName)) { n.querySelectorAll('li').forEach(li => { const t = clean(li.textContent); if (t.length > 3 && lines.length < max) lines.push(cut(t, 220)); }); break; }
        else { const t = clean(n.textContent); if (t.length > 8 && t.length < 400) lines.push(cut(t, 220)); }
        n = n.nextElementSibling;
      }
      if (lines.length) return lines;
    }
    return [];
  }
  function analyseNotice(doc, base) {
    const root = mainNode(doc), blocks = blocksOf(root), meta = pageMeta(doc, base), r = {};
    const h1 = doc.querySelector('h1'); r.h1 = h1 ? clean(h1.textContent) : '';
    r.desc = meta.desc;
    const paras = blocks.filter(b => b.tag === 'p' || b.tag === 'li' || b.tag === 'td').map(b => b.t);
    r.full = paras.slice(0, 8).join('\n\n').slice(0, 1800);
    // dates
    const dl = [], seen = new Set();
    blocks.forEach(b => { let prevEnd = 0; findDates(b.t).slice(0, 3).forEach(d => { const before = b.t.slice(Math.max(prevEnd, d.index - 60), d.index); prevEnd = d.index + 8; const line = dateLabel(before) + ': ' + d.text; if (!seen.has(line) && dl.length < 6) { seen.add(line); dl.push(line); } }); });
    r.dates = dl;
    // sections
    r.elig = sectionAfter(root, /eligib|who can apply|qualification/i, 6);
    if (!r.elig.length) r.elig = blocks.filter(b => /eligib|age limit|must have|should have|candidates who|passed|appeared in/i.test(b.t)).slice(0, 4).map(b => cut(b.t, 220));
    r.docs = sectionAfter(root, /documents? (required|needed)|required documents?|documents to be/i, 8);
    r.how = sectionAfter(root, /how to apply|apply online|application (process|procedure)|procedure|steps to apply|process to apply/i, 7);
    // fee
    const fee = blocks.filter(b => /\bfee|charges?\b/i.test(b.t) && /(₹|rs\.?|inr)\s?[\d,]+/i.test(b.t)).slice(0, 2).map(b => cut(b.t, 180));
    r.fee = fee.join('\n');
    // links
    const links = Array.from(root.querySelectorAll('a[href]')).map(a => ({ t: clean(a.textContent), u: abs(a.getAttribute('href'), base) })).filter(l => /^https?:/i.test(l.u));
    const apply = links.find(l => /apply|register|registration|online application|application form|login/i.test(l.t) && !isPdf(l.u));
    r.apply = apply ? apply.u : '';
    const pdf = links.find(l => isPdf(l.u) && /notice|notification|circular|brochure|bulletin|advertisement|schedule|information/i.test(l.t + ' ' + l.u)) || links.find(l => isPdf(l.u));
    r.pdf = pdf ? pdf.u : '';
    // image
    let img = meta.og;
    if (!img) {
      const cand = Array.from(root.querySelectorAll('img[src]')).map(i => abs(i.getAttribute('src'), base)).find(u => /\.(jpe?g|png|webp)(\?|$)/i.test(u) && !/logo|icon|emblem|sprite|spacer|pixel|banner-ad|flag|arrow|bullet/i.test(u));
      img = cand || '';
    }
    r.img = img;
    return r;
  }

  // ---------------------------------------------------------------
  // 5. Filling the form (never overwrites what the admin typed)
  // ---------------------------------------------------------------
  let token = 0; const auto = {};
  function put(id, val) {
    const el = $(id); if (!el || val == null || val === '') return false;
    if (el.value && el.value !== auto[id]) return false;           // admin already typed something here → keep it
    el.value = val; auto[id] = val; return true;
  }
  function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function setBanner(html, kind) {
    let b = $('upAutoFillBanner');
    if (!b) {
      const t = $('up_title'); const host = t && (t.closest('.admin-form') || t.closest('form') || t.parentElement && t.parentElement.parentElement);
      if (!host) return;
      b = document.createElement('div'); b.id = 'upAutoFillBanner';
      host.insertBefore(b, host.firstChild);
    }
    const col = kind === 'ok' ? ['#e8f8ee', '#9fd8b4', '#1b6b3a'] : kind === 'warn' ? ['#fff6e0', '#f3d9a0', '#7a5200'] : ['#e8f2ff', '#b9d3f0', '#0A4174'];
    b.style.cssText = 'grid-column:1/-1;background:' + col[0] + ';border:1px solid ' + col[1] + ';color:' + col[2] + ';border-radius:10px;padding:10px 14px;margin:0 0 14px;font-size:13px;line-height:1.5;';
    b.innerHTML = html;
  }
  function hideBanner() { const b = $('upAutoFillBanner'); if (b) b.remove(); }

  function fillBase(p, best, isPdfNotice) {
    const org = p.sourceOrg || '';
    let title = best ? clean(best.t) : '';
    if (title && org && !title.toLowerCase().includes(org.toLowerCase().split(' ')[0])) title = org + ': ' + title;
    if (!title) title = org + ' — new notice (edit this title)';
    title = cut(title, 160);
    const dts = best ? findDates(best.t + ' ' + (best.c || '')) : [];
    const noticeDate = best && best.d ? best.d : '';
    const type = classify((best ? best.t + ' ' + best.c : '') + ' ' + (p.sourceName || ''), org);
    put('up_title', title);
    window.updSetType && $('up_type') && ($('up_type').value !== type) && updSetType(type);
    if (noticeDate) put('up_date', noticeDate);
    const desc = best
      ? cut(org + ' has published: “' + cut(best.t, 150) + '”.' + (dts.length ? ' Date mentioned: ' + dts[0].text + '.' : '') + ' Read the official notice for complete details.', 300)
      : cut(org + ' has updated its official website. Check the official source for the latest notice and details.', 300);
    put('up_desc', desc);
    const link = best ? best.u : p.sourceUrl;
    put('up_source', link || p.sourceUrl);
    put('up_btn', isPdfNotice ? 'View Official Notice' : 'Visit Official Website');
    put('up_website', p.sourceUrl);
    if (isPdfNotice) put('up_notif', best.u);
    const host = hostOf(p.sourceUrl);
    if ($('up_srctype') && !$('up_srctype').value) { $('up_srctype').value = /(\.gov\.in|\.nic\.in|\.gov|\.ac\.in|\.edu\.in|\.res\.in)$/i.test(host) ? 'official' : 'other'; auto.up_srctype = $('up_srctype').value; }
    put('up_points', 'Always check the official website for the full notice and latest information.');
    put('up_seotitle', cut(title, 60));
    put('up_seodesc', cut(desc, 155));
    const words = Array.from(new Set(title.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(' ').filter(w => w.length > 3 && !/^(the|and|for|with|from|that|this|regarding|about|notice|dated)$/.test(w)))).slice(0, 5);
    const kw = []; [org, TYPE_LABEL[type], String(new Date().getFullYear())].concat(words).forEach(w => { if (w && !kw.some(k => k.toLowerCase() === String(w).toLowerCase())) kw.push(w); });
    put('up_keywords', kw.join(', '));
    return { type, title, desc };
  }
  function fillDetail(p, best, d) {
    if (d.h1 && best && best.t.length < 20) put('up_title', cut(d.h1, 160));
    if (d.desc && d.desc.length > 40) { const ok = $('up_desc').value === auto.up_desc; if (ok) { put('up_desc', cut(d.desc, 300)); put('up_seodesc', cut(d.desc, 155)); } }
    put('up_full', d.full);
    put('up_dates', d.dates.join('\n'));
    put('up_elig', d.elig.join('\n'));
    put('up_docs', d.docs.join('\n'));
    put('up_how', d.how.join('\n'));
    put('up_fee', d.fee);
    put('up_apply', d.apply);
    if (d.pdf) put('up_notif', d.pdf);
    // key points: first meaningful sentences + dates
    const pts = []; (d.full || '').split(/\n\n/).slice(0, 3).forEach(s => { if (s.length >= 40) pts.push(cut(s, 160)); });
    d.dates.slice(0, 2).forEach(x => pts.push(x));
    pts.push('Always check the official website for the full notice and latest information.');
    if ($('up_points').value === auto.up_points) put('up_points', pts.slice(0, 5).join('\n'));
    if (d.dates.length) { const first = findDates(d.dates[0].split(': ')[1] || '')[0]; if (first && !(best && best.d)) put('up_date', first.iso); }
  }

  // image: try the notice's own image, then the source site's, then the Althea hero image
  async function toDataUrl(url) {
    const tryFetch = async (u) => { const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 15000); try { const r = await fetch(u, { mode: 'cors', signal: ctrl.signal }); clearTimeout(t); if (!r.ok) return null; const b = await r.blob(); return b && /^image\//.test(b.type) && b.size < 6 * 1024 * 1024 ? b : null; } catch (e) { clearTimeout(t); return null; } };
    let blob = await tryFetch(url);
    if (!blob && PROXY) blob = await tryFetch(PROXY + '?url=' + encodeURIComponent(url));
    if (!blob || typeof compressImageToDataUrl !== 'function') return null;
    try { return await compressImageToDataUrl(blob, 1200, 0.78); } catch (e) { return null; }
  }
  async function fillImage(p, x, d, myToken) {
    if (typeof _updImg === 'undefined' || _updImg) return '';              // admin already added an image
    const cands = [d && d.img, x && x.og].filter(Boolean);
    let used = '', how = '';
    for (const u of cands.slice(0, 2)) {
      const data = await toDataUrl(u);
      if (myToken !== token || _updImg) return '';
      if (data) { _updImg = data; used = u; how = 'saved'; break; }
    }
    if (!used && cands.length) { _updImg = cands[0]; used = cands[0]; how = 'linked'; }
    if (!used) { const hero = document.getElementById('hp-hero-img'); if (hero && hero.src) { _updImg = hero.src; how = 'hero'; } }
    if (!_updImg) return '';
    if (typeof refreshUpdImgPrev === 'function') refreshUpdImgPrev();
    put('up_caption', how === 'hero' ? 'Source: ' + (p.sourceOrg || 'Official') + ' (Representational Image)' : 'Source: ' + (p.sourceOrg || 'Official') + ' official website');
    return how;
  }

  // ---------------------------------------------------------------
  // 6. "Create Draft" (replaces the original; falls back to it if anything fails badly)
  // ---------------------------------------------------------------
  const _origDraft = (typeof nscCreateDraft === 'function') ? nscCreateDraft : null;
  window.nscCreateDraft = async function (pendingId) {
    const p = getData('pendingUpdates').find(x => String(x.id) === String(pendingId));
    if (!p) return;
    const my = ++token;
    try {
      showAdminTab('update-add'); resetUpdForm();
      Object.keys(auto).forEach(k => delete auto[k]);
      let x = p.x || null, failed = false;
      const best0 = x && x.items && x.items[0];
      const pdf0 = !!(best0 && isPdf(best0.u));
      setBanner('🤖 <b>Auto-filling the draft…</b> The form below is being filled from the detected notice. You can edit everything.', 'info');
      fillBase(p, best0, pdf0);
      updateData('pendingUpdates', p.id, { status: 'drafted' });
      if (typeof renderNewsSourcesAdmin === 'function') renderNewsSourcesAdmin();
      if (typeof showToast === 'function') showToast('📝 Draft form filled — check, edit and then Save as Draft / Publish.');

      // older pending items (no stored notice): read the source page now
      if (!best0) {
        const r = await fetchPage(p.sourceUrl);
        if (my !== token) return;
        if (!r.ok) failed = true;
        if (r.ok) {
          const doc = parseDoc(r.text), items = collectItems(doc, p.sourceUrl), meta = pageMeta(doc, p.sourceUrl);
          const pc = pickCandidates(items, null);
          x = { v: 1, title: meta.title, og: meta.og, newDetected: false, items: pc.list.map(i => ({ t: cut(i.t, 240), u: i.u, d: i.d, c: cut(i.c, 200) })) };
          updateData('pendingUpdates', p.id, { x });
          if (x.items[0]) { fillBase(p, x.items[0], isPdf(x.items[0].u)); }
        }
      }
      const best = x && x.items && x.items[0];
      let detail = null, status = 'info';
      if (best && !isPdf(best.u) && best.u !== p.sourceUrl) {
        const r = await fetchPage(best.u);
        if (my !== token) return;
        if (!r.ok) failed = true;
        if (r.ok) { detail = analyseNotice(parseDoc(r.text), best.u); fillDetail(p, best, detail); }
      } else if (best && best.u === p.sourceUrl) {
        const cap = pageCache.get(p.sourceUrl);
        if (cap) { detail = analyseNotice(parseDoc(cap.html), p.sourceUrl); /* listing page only → don't fill long text from it */ detail.full = detail.elig = detail.docs = detail.how = ''; detail.elig = []; detail.docs = []; detail.how = []; detail.dates = []; detail.fee = ''; fillDetail(p, best, detail); }
      }
      const how = await fillImage(p, x, detail, my);
      if (my !== token) return;
      const got = ['up_full', 'up_dates', 'up_elig', 'up_docs', 'up_how', 'up_fee', 'up_apply'].filter(id => $(id) && $(id).value && $(id).value === auto[id]).length;
      const pdfOnly = best && isPdf(best.u);
      let msg = (failed || (got === 0 && !pdfOnly) ? '⚠️' : '✅') + ' <b>Draft auto-filled</b> from <b>' + cut(p.sourceOrg, 40) + '</b>. ';
      if (pdfOnly) msg += 'The notice is a <b>PDF</b> (can’t be read by the browser), so the PDF link is filled but details like dates / eligibility / fee are empty — open the PDF and add them. ';
      else if (failed) { msg += 'The official page could not be opened from the browser (blocked / offline / slow), so only the basics are filled — add the rest by hand. '; status = 'warn'; }
      else if (got === 0) { msg += 'The notice page had no extra details to copy, so only the basics are filled. '; status = 'warn'; }
      else msg += '<b>' + got + '</b> detail field(s) were found on the notice page; fields the page doesn’t mention are left empty. ';
      if (how === 'hero') msg += 'No notice image was found, so the website’s home-page image is used — replace it if you like. ';
      else if (how === 'linked') msg += 'Image is linked from the official site (upload your own to be safe). ';
      else if (how === 'saved') msg += 'Image taken from the official page. ';
      msg += '<br>⚠️ Please verify against the official source — <i>“Admin verified”</i> is left unticked on purpose.';
      setBanner(msg, status === 'warn' ? 'warn' : 'ok');
    } catch (e) {
      console.error('news-autofill failed, using the basic draft instead:', e);
      if (_origDraft && my === token && !$('up_title').value) _origDraft(pendingId);
      else setBanner('⚠️ Auto-fill hit a problem — the basic draft is open; please fill the rest by hand.', 'warn');
    }
  };

  // hide the banner when leaving the form / starting a fresh one
  if (typeof showAdminTab === 'function') { const _tab = showAdminTab; window.showAdminTab = function (tab) { if (tab !== 'update-add') { hideBanner(); token++; } return _tab.apply(this, arguments); }; }
  if (typeof resetUpdForm === 'function') { const _reset = resetUpdForm; window.resetUpdForm = function () { hideBanner(); return _reset.apply(this, arguments); }; }

  window.NewsAutofill = { collectItems, analyseNotice, parseDoc, findDates, classify, pickCandidates };
})();
