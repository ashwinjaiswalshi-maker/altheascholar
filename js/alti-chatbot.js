/* ================================================================
   alti-chatbot.js — UI for "Alti · Althea Assistant"
   Self-contained & scoped (.alti-*). Talks to AltiEngine (alti-engine.js).
   Works with the site's fixed 980px "desktop" layout on phones: on touch
   devices the whole widget is scaled to a readable size and follows the
   visual viewport (so the keyboard never hides the input box).
   Public (kept for backward compatibility): openChatbot, closeChatbot,
   dismissChatbotGreet, sendChatbotMessage
   ================================================================ */
(function (global) {
  'use strict';
  const doc = document;
  const STORE_KEY = 'alti.chat.v2';
  const MAX_MSGS = 60;

  // ---------- mascot ----------
  function mascot(cls) {
    return '<svg class="alti-svg ' + (cls || '') + '" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<g class="alti-ant"><line x1="32" y1="10" x2="32" y2="17" stroke="#0A4174" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle class="alti-bulb" cx="32" cy="7" r="4.2" fill="#ff9f1c" stroke="#0A4174" stroke-width="1.5"/></g>' +
      '<rect x="3" y="27" width="7" height="14" rx="3.5" fill="#0A4174"/><rect x="54" y="27" width="7" height="14" rx="3.5" fill="#0A4174"/>' +
      '<rect x="8" y="15" width="48" height="43" rx="17" fill="#eaf3ff" stroke="#0A4174" stroke-width="2.6"/>' +
      '<rect x="14" y="22" width="36" height="28" rx="12" fill="#0A4174"/>' +
      '<g class="alti-eyes"><ellipse cx="25" cy="34" rx="4.2" ry="5.2" fill="#7ff5ff"/><ellipse cx="39" cy="34" rx="4.2" ry="5.2" fill="#7ff5ff"/>' +
      '<circle cx="26.4" cy="32" r="1.4" fill="#fff"/><circle cx="40.4" cy="32" r="1.4" fill="#fff"/></g>' +
      '<ellipse cx="19" cy="42.5" rx="3" ry="2" fill="#ff8fab" opacity=".75"/><ellipse cx="45" cy="42.5" rx="3" ry="2" fill="#ff8fab" opacity=".75"/>' +
      '<path class="alti-mouth" d="M27.5 42 Q32 47 36.5 42" stroke="#7ff5ff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>';
  }

  // ---------- helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const timeNow = () => { try { return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } };
  function formatText(text, math) {
    const lines = esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n');
    let html = '', list = null;
    const close = () => { if (list) { html += '</' + list + '>'; list = null; } };
    lines.forEach(l => {
      const t = l.trim(); if (!t) { close(); return; }
      let m;
      if ((m = t.match(/^(?:•|-|\*)\s+(.*)$/))) { if (list !== 'ul') { close(); html += '<ul class="alti-ul">'; list = 'ul'; } html += '<li>' + m[1] + '</li>'; }
      else if ((m = t.match(/^(\d{1,2})[.)]\s+(.*)$/)) && !math) { if (list !== 'ol') { close(); html += '<ol class="alti-ol">'; list = 'ol'; } html += '<li value="' + m[1] + '">' + m[2] + '</li>'; }
      else { close(); html += (math && /[=+\-×÷^²]/.test(t) && !/^\*\*/.test(t) ? '<div class="alti-eq">' + t + '</div>' : '<p>' + t + '</p>'); }
    });
    close(); return html;
  }
  function plain(text) { return String(text).replace(/\*\*/g, '').replace(/\s+\n/g, '\n'); }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise((res, rej) => { try { const a = doc.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; doc.body.appendChild(a); a.select(); doc.execCommand('copy'); a.remove(); res(); } catch (e) { rej(e); } });
  }

  // ---------- state ----------
  const S = { sess: null, msgs: [], open: false, busy: false, phone: false, f: 1, greetShown: false, lastQ: '', actions: [] };
  let root, fab, win, body, inputEl, sendBtn, statusEl, scrollBtn, greetEl, offlineEl;

  function loadStore() {
    try { const j = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null'); if (j && Array.isArray(j.msgs)) { S.msgs = j.msgs.slice(-MAX_MSGS); if (j.sess) S.sess = j.sess; } } catch (e) {}
  }
  function saveStore() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ msgs: S.msgs.slice(-MAX_MSGS), sess: S.sess })); } catch (e) {}
  }

  // ---------- DOM ----------
  function build() {
    root = doc.createElement('div'); root.id = 'alti-root'; root.className = 'alti-root';
    root.innerHTML =
      '<div class="alti-greet" id="altiGreet" role="button" tabindex="0" hidden><button type="button" class="alti-greet-x" aria-label="Dismiss">×</button>Hi 👋 Main <b>Alti</b> hoon! Kuch poochna hai?</div>' +
      '<button type="button" class="alti-fab" id="altiFab" aria-label="Chat with Alti" aria-expanded="false">' + mascot('alti-fab-svg') + '<span class="alti-badge">1</span></button>' +
      '<section class="alti-window" id="altiWin" role="dialog" aria-label="Alti, Althea Assistant" aria-hidden="true">' +
        '<header class="alti-head">' +
          '<span class="alti-head-av">' + mascot('alti-head-svg') + '</span>' +
          '<span class="alti-head-txt"><b>Alti</b><span>Althea Assistant</span><small id="altiStatus"><i class="alti-dot"></i>Online</small></span>' +
          '<span class="alti-head-btns">' +
            '<button type="button" class="alti-ib" data-act="clear" aria-label="Clear chat" title="Clear chat"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm-3 6h12l-1 12H7L6 9z"/></svg></button>' +
            '<button type="button" class="alti-ib" data-act="min" aria-label="Minimize" title="Minimize"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5 18h14v2H5z"/></svg></button>' +
            '<button type="button" class="alti-ib" data-act="close" aria-label="Close" title="Close"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z"/></svg></button>' +
          '</span>' +
        '</header>' +
        '<div class="alti-offline" id="altiOffline" hidden>Offline mode — main website ke saved resources se help karunga.</div>' +
        '<div class="alti-body" id="altiBody" role="log" aria-live="polite"></div>' +
        '<button type="button" class="alti-scroll" id="altiScroll" aria-label="Scroll to latest" hidden>↓</button>' +
        '<footer class="alti-foot">' +
          '<input type="text" class="alti-input" id="altiInput" maxlength="500" placeholder="Apna sawal likhiye…" autocomplete="off" autocapitalize="sentences" enterkeyhint="send" aria-label="Type your question">' +
          '<button type="button" class="alti-send" id="altiSend" aria-label="Send"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M2 21 23 12 2 3v7l15 2-15 2z"/></svg></button>' +
        '</footer>' +
      '</section>';
    doc.body.appendChild(root);
    fab = root.querySelector('#altiFab'); win = root.querySelector('#altiWin'); body = root.querySelector('#altiBody');
    inputEl = root.querySelector('#altiInput'); sendBtn = root.querySelector('#altiSend'); statusEl = root.querySelector('#altiStatus');
    scrollBtn = root.querySelector('#altiScroll'); greetEl = root.querySelector('#altiGreet'); offlineEl = root.querySelector('#altiOffline');

    fab.addEventListener('click', () => (S.open ? minimize() : openChat()));
    greetEl.addEventListener('click', e => { if (e.target.closest('.alti-greet-x')) { dismissGreet(); } else { openChat(); } });
    greetEl.addEventListener('keydown', e => { if (e.key === 'Enter') openChat(); });
    root.querySelector('.alti-head-btns').addEventListener('click', e => {
      const b = e.target.closest('button[data-act]'); if (!b) return;
      if (b.dataset.act === 'min') minimize(); else if (b.dataset.act === 'close') closeChat(); else if (b.dataset.act === 'clear') clearChat();
    });
    sendBtn.addEventListener('click', submit);
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); submit(); } });
    inputEl.addEventListener('focus', () => setTimeout(() => { layout(); scrollDown(true); }, 250));
    body.addEventListener('scroll', updateScrollBtn, { passive: true });
    scrollBtn.addEventListener('click', () => scrollDown(true));
    body.addEventListener('click', onBodyClick);
    doc.addEventListener('keydown', e => { if (e.key === 'Escape' && S.open) minimize(); });
    global.addEventListener('online', refreshStatus); global.addEventListener('offline', refreshStatus);
  }

  // ---------- phone-aware layout ----------
  function detectPhone() {
    let coarse = false; try { coarse = matchMedia('(hover: none) and (pointer: coarse)').matches; } catch (e) {}
    S.phone = coarse && global.innerWidth >= 700;           // phones render the fixed 980px layout, scaled down
    if (S.phone) {
      let sw = global.screen && global.screen.width || 0; const dpr = global.devicePixelRatio || 1;
      if (sw >= 900 && dpr >= 2) sw = sw / dpr;               // some browsers report device pixels
      if (!(sw >= 280 && sw <= 1100)) sw = 411;
      S.f = Math.min(3.4, Math.max(1, global.innerWidth / sw));
    } else S.f = 1;
    root.classList.toggle('alti-phone', S.phone);
  }
  function layout() {
    if (!root) return;
    if (!S.phone) { // desktop: pure CSS
      ['left', 'top', 'width', 'height', 'right', 'bottom'].forEach(p => { win.style[p] = ''; fab.style[p] = ''; greetEl.style[p] = ''; });
      root.style.removeProperty('--alti-fs'); doc.documentElement.style.removeProperty('--alti-clear'); return;
    }
    const vv = global.visualViewport;
    const vw = vv ? vv.width : global.innerWidth, vh = vv ? vv.height : global.innerHeight;
    const ox = vv ? vv.offsetLeft : 0, oy = vv ? vv.offsetTop : 0;
    const k = vv ? Math.min(1, vv.width / global.innerWidth) : 1;           // <1 when user pinch-zooms in
    const fs = 14 * S.f * k;                                               // readable 14px on screen, in layout px
    root.style.setProperty('--alti-fs', fs + 'px');
    const m = fs * 0.6, fabS = fs * 4.4;
    fab.style.cssText = 'right:auto;bottom:auto;left:' + (ox + vw - fabS - m) + 'px;top:' + (oy + vh - fabS - m) + 'px;';
    const gw = Math.min(vw - fabS - 3 * m, fs * 17);
    greetEl.style.cssText = 'right:auto;bottom:auto;width:' + gw + 'px;left:' + (ox + vw - fabS - m - gw - m * 0.4) + 'px;top:' + (oy + vh - fabS - m + fabS * 0.12) + 'px;';
    const w = vw - 2 * m, kbOpen = vv && (global.innerHeight - vv.height) > fs * 6;
    const h = Math.min(vh - 2 * m, kbOpen ? vh - 2 * m : vh * 0.88);
    win.style.cssText = 'right:auto;bottom:auto;left:' + (ox + m) + 'px;top:' + (oy + vh - h - m) + 'px;width:' + w + 'px;height:' + h + 'px;';
    doc.documentElement.style.setProperty('--alti-clear', (m + fabS + m * 0.8) + 'px');
  }
  let rafL = 0; const layoutSoon = () => { if (rafL) return; rafL = requestAnimationFrame(() => { rafL = 0; layout(); }); };

  // ---------- open / close ----------
  function openChat() {
    dismissGreet(true); S.open = true;
    root.classList.add('alti-open'); win.setAttribute('aria-hidden', 'false'); fab.setAttribute('aria-expanded', 'true');
    const b = fab.querySelector('.alti-badge'); if (b) b.style.display = 'none';
    layout();
    if (!S.msgs.length) welcome(); else if (!body.children.length) renderAll();
    setTimeout(() => { scrollDown(true); if (!S.phone) inputEl.focus(); }, 60);
    if (global.AltiEngine) AltiEngine.init().then(refreshStatus);
  }
  function minimize() { S.open = false; root.classList.remove('alti-open'); win.setAttribute('aria-hidden', 'true'); fab.setAttribute('aria-expanded', 'false'); if (doc.activeElement) try { doc.activeElement.blur(); } catch (e) {} layout(); }
  function closeChat() { minimize(); resetSession(); body.innerHTML = ''; S.msgs = []; saveStore(); }
  function clearChat() { resetSession(); S.msgs = []; body.innerHTML = ''; saveStore(); welcome(); }
  function resetSession() { S.sess = AltiEngine.newSession(); }
  function dismissGreet(silent) {
    if (greetEl) greetEl.hidden = true;
    try { localStorage.setItem('altiGreetSeen', '1'); } catch (e) {}
  }
  function showGreetOnce() {
    let seen = false; try { seen = localStorage.getItem('altiGreetSeen') === '1'; } catch (e) {}
    if (!seen && !S.open) { greetEl.hidden = false; layout(); }
  }

  // ---------- rendering ----------
  const QUICK = [
    ['📚 Study Material', 'study material'], ['👨‍🏫 Find a Tutor', 'find tutor'], ['📰 Education Updates', 'education updates'],
    ['📖 Class 6–12', 'notes chahiye'], ['📝 Practice Papers', 'practice papers'], ['🎓 Entrance Exams', 'entrance exams'], ['❓ Ask Alti', '__ask__']
  ];
  function welcome() {
    pushBot({ text: "Namaste! 👋 Main **Alti** hoon, Althea Scholar ka assistant. Notes, tutor, registration, exams ya maths ke sawal — Hindi, English ya Hinglish mein poochho! 😊", chips: QUICK.map(q => ({ label: q[0], send: q[1] })), welcome: true });
  }
  function msgNode(m) {
    const row = doc.createElement('div'); row.className = 'alti-row alti-' + (m.role === 'u' ? 'user' : 'bot');
    let inner = '';
    if (m.role === 'b') inner += '<span class="alti-av">' + mascot('alti-mini') + '</span>';
    inner += '<div class="alti-col"><div class="alti-msg alti-' + (m.role === 'u' ? 'user' : 'bot') + (m.err ? ' alti-err' : '') + '">' + formatText(m.text, m.math) + '</div>';
    if (m.buttons && m.buttons.length) {
      inner += '<div class="alti-acts">' + m.buttons.map(b => '<button type="button" class="alti-act' + (b.kind === 'wa' ? ' alti-wa' : '') + '" data-a="' + S.actions.push(b.action) + '">' + esc(b.label) + '</button>').join('') + '</div>';
    }
    if (m.chaptersAll && m.chaptersAll.length) {
      inner += '<details class="alti-det"><summary>Saare chapters dekho (' + m.chaptersAll.length + ')</summary><ol class="alti-ol alti-chlist">' + m.chaptersAll.map(c => '<li>' + esc(c.replace(/^\d+\.\s*/, '')) + '</li>').join('') + '</ol></details>';
    }
    inner += '<div class="alti-meta"><time>' + esc(m.time || '') + '</time>' +
      (m.role === 'b' && !m.err && !m.welcome ? '<button type="button" class="alti-copy" data-copy="1" aria-label="Copy answer">Copy</button>' : '') +
      (m.role === 'b' && m.conf != null && global.ALTI_DEBUG ? '<span class="alti-conf">' + m.conf + '%</span>' : '') + '</div></div>';
    row.innerHTML = inner; row._m = m; return row;
  }
  function chipsNode(list, title) {
    const box = doc.createElement('div'); box.className = 'alti-chips';
    box.innerHTML = (title ? '<div class="alti-chips-t">' + esc(title) + '</div>' : '') + '<div class="alti-chips-w">' + list.map(c => '<button type="button" class="alti-chip" data-send="' + esc(c.send) + '">' + esc(c.label) + '</button>').join('') + '</div>';
    return box;
  }
  function renderAll() {
    body.innerHTML = ''; S.actions = [];
    S.msgs.forEach((m, i) => { body.appendChild(msgNode(m)); if (i === S.msgs.length - 1 && m.chips && m.chips.length) body.appendChild(chipsNode(m.chips, m.chipsTitle)); });
    scrollDown(true);
  }
  function clearChips() { body.querySelectorAll('.alti-chips').forEach(n => n.remove()); }
  function pushUser(text) { const m = { role: 'u', text, time: timeNow() }; S.msgs.push(m); body.appendChild(msgNode(m)); saveStore(); scrollDown(true); }
  function pushBot(o) {
    clearChips();
    const m = { role: 'b', text: o.text, time: timeNow(), buttons: (o.buttons || []).filter(Boolean), math: !!o.math, conf: o.confidence, err: !!o.err, welcome: !!o.welcome, chaptersAll: o.chaptersAll };
    const chips = (o.chips || []).concat((o.related || []).map(r => ({ label: r.label, send: r.send })));
    m.chips = chips.slice(0, 10); m.chipsTitle = (o.relatedTitle && !(o.chips || []).length) ? o.relatedTitle : '';
    S.msgs.push(m); const n = msgNode(m); n.classList.add('alti-in'); body.appendChild(n);
    if (m.chips.length) body.appendChild(chipsNode(m.chips, m.chipsTitle));
    saveStore(); scrollDown(false, n);
    return n;
  }
  function typingNode() {
    const row = doc.createElement('div'); row.className = 'alti-row alti-bot alti-typing-row';
    row.innerHTML = '<span class="alti-av">' + mascot('alti-mini alti-talk') + '</span><div class="alti-msg alti-bot alti-typing" aria-label="Alti is typing"><span></span><span></span><span></span></div><span class="alti-typing-t">Alti is typing…</span>';
    body.appendChild(row); scrollDown(true); return row;
  }
  function scrollDown(force, node) {
    const go = () => { if (node && node.offsetHeight > body.clientHeight * 0.8) body.scrollTop = node.offsetTop - 8; else body.scrollTop = body.scrollHeight; updateScrollBtn(); };
    go(); requestAnimationFrame(go);
  }
  function updateScrollBtn() { scrollBtn.hidden = (body.scrollHeight - body.scrollTop - body.clientHeight) < 90; }
  function refreshStatus() {
    const off = (global.navigator && navigator.onLine === false);
    let st = 'ready'; try { st = AltiEngine.stats().state; } catch (e) {}
    const offline = off || st === 'offline';
    offlineEl.hidden = !offline;
    statusEl.innerHTML = '<i class="alti-dot' + (offline ? ' off' : '') + '"></i>' + (offline ? 'Offline mode' : 'Online');
  }

  // ---------- actions ----------
  function waLink() {
    let wa = '918287771882'; try { wa = AltiEngine.siteInfo().whatsapp || wa; } catch (e) {}
    const text = S.lastQ ? 'Hi Althea Scholar, mujhe ye puchhna tha: ' + S.lastQ : 'Hi Althea Scholar, mujhe madad chahiye.';
    return 'https://wa.me/' + wa + '?text=' + encodeURIComponent(text);
  }
  function chapterLabel(cls, subj, raw) { try { return typeof displayChapterName === 'function' ? displayChapterName(cls, subj, raw) : raw; } catch (e) { return raw; } }
  function runAction(a) {
    if (!a) return;
    try {
      if (a.type === 'wa') { global.open(waLink(), '_blank', 'noopener'); return; }
      if (a.type === 'link') { if (/^https?:\/\//i.test(a.url)) global.open(a.url, '_blank', 'noopener'); return; }
      if (S.phone) minimize();
      if (a.type === 'page') { if (typeof showPage === 'function') showPage(a.id); return; }
      if (a.type === 'exam') { if (typeof showPage === 'function') showPage('page-entrance'); setTimeout(() => { try { if (typeof selectEntranceExam === 'function') selectEntranceExam(a.name); } catch (e) {} }, 120); return; }
      if (a.type === 'study') {
        if (typeof showPage === 'function') showPage('page-study');
        setTimeout(() => {
          try {
            if (typeof smInitClassDropdown === 'function') smInitClassDropdown();
            const cs = doc.getElementById('sm_class'); if (cs && a.cls) { cs.value = a.cls; smSelectClass(a.cls); }
            if (a.subj) { const ss = doc.getElementById('sm_subject'); if (ss) { ss.value = a.subj; smSelectSubject(a.subj); } }
            if (a.chapter) setTimeout(() => { try { selectStudyChapterDropdown(chapterLabel(a.cls, a.subj, a.chapter)); } catch (e) {} }, 80);
            const w = doc.getElementById('sm-chapters-wrap'); if (w && w.scrollIntoView) w.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch (e) { /* page still opened */ }
        }, 140);
      }
    } catch (e) { /* never crash the site */ }
  }
  function onBodyClick(e) {
    const chip = e.target.closest('.alti-chip'); if (chip) { send(chip.dataset.send); return; }
    const act = e.target.closest('.alti-act'); if (act) { runAction(S.actions[+act.dataset.a - 1]); return; }
    const cp = e.target.closest('.alti-copy');
    if (cp) { const row = cp.closest('.alti-row'); const m = row && row._m; if (m) copyText(plain(m.text)).then(() => { cp.textContent = 'Copied ✓'; setTimeout(() => cp.textContent = 'Copy', 1400); }).catch(() => { cp.textContent = 'Copy failed'; setTimeout(() => cp.textContent = 'Copy', 1400); }); }
  }

  // ---------- sending ----------
  function submit() {
    const v = inputEl.value.trim();
    if (!v) { inputEl.classList.add('alti-shake'); setTimeout(() => inputEl.classList.remove('alti-shake'), 400); return; }
    inputEl.value = ''; send(v);
  }
  async function send(text) {
    text = String(text || '').trim(); if (!text || S.busy) return;
    if (text === '__ask__') { clearChips(); pushUser('❓ Ask Alti'); pushBot({ text: "Zaroor! 😊 Apna sawal neeche likhiye. Jaise:\n• class 10 maths notes\n• fees kitni hai?\n• 2x + 5 = 15 solve karo\n• NEET ka pattern", chips: [{ label: 'Class 10 maths notes', send: 'class 10 maths notes' }, { label: 'Fees kitni hai?', send: 'fees kitni hai' }, { label: '2x+5=15', send: '2x + 5 = 15' }] }); inputEl.focus(); return; }
    S.busy = true; sendBtn.disabled = true; inputEl.disabled = false; root.classList.add('alti-busy');
    clearChips(); S.lastQ = text; pushUser(text);
    const t = typingNode(); const t0 = Date.now();
    let res;
    try {
      if (!S.sess) resetSession();
      res = await AltiEngine.ask(text, S.sess);
    } catch (err) {
      res = { text: 'Alti abhi offline mode mein hai. Main website ke available study resources se help kar sakta hoon.', err: true, buttons: [{ label: '📚 Open Study Material', action: { type: 'page', id: 'page-study' } }], chips: [{ label: '🔁 Try again', send: text }] };
    }
    const wait = Math.max(0, Math.min(1000, 380 + (res.text ? res.text.length * 2.2 : 0)) - (Date.now() - t0));
    setTimeout(() => {
      t.remove(); pushBot(res); saveStore(); refreshStatus();
      S.busy = false; sendBtn.disabled = false; root.classList.remove('alti-busy');
      if (!S.phone) inputEl.focus();
    }, wait);
  }

  // ---------- init ----------
  function init() {
    if (doc.getElementById('alti-root')) return;
    if (!global.AltiEngine) return;
    build(); loadStore(); S.sess = S.sess || AltiEngine.newSession();
    detectPhone(); layout(); refreshStatus();
    const vv = global.visualViewport;
    if (vv) { vv.addEventListener('resize', layoutSoon); vv.addEventListener('scroll', layoutSoon); }
    global.addEventListener('resize', () => { detectPhone(); layoutSoon(); });
    global.addEventListener('orientationchange', () => setTimeout(() => { detectPhone(); layout(); }, 300));
    AltiEngine.init().then(refreshStatus);
    setTimeout(showGreetOnce, 3500);
  }
  // compat API
  global.openChatbot = () => { if (!root) init(); openChat(); };
  global.closeChatbot = () => { if (root) minimize(); };
  global.dismissChatbotGreet = () => dismissGreet();
  global.sendChatbotMessage = submit;
  global.AltiUI = { open: () => global.openChatbot(), minimize, clear: clearChat };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})(window);
