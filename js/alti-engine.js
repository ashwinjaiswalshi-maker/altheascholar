/* ================================================================
   alti-engine.js — brain of "Alti" (Althea Assistant). No UI here.
   • Knowledge base: data/alti-knowledge.json  (+ optional Firestore
     collection "altiKnowledge" + legacy "chatbotFaqs")
   • Website-aware: reads the site's own class → subject → chapter data
     (DEFAULT_STUDY_DATA) and entrance-exam data at runtime
   • Normalisation, Hinglish/Hindi synonyms, typo tolerance, weighted
     inverted index, confidence score (0-100), slot-filling memory,
     safe maths solver (no eval), optional AI fallback via your own proxy
   Public API: window.AltiEngine = { init, ask, newSession, stats, siteInfo }
   ================================================================ */
(function (global) {
  'use strict';
  const CFG = global.ALTI_CONFIG || {};

  // ---------------------------------------------------------------
  // 1. Text normalisation
  // ---------------------------------------------------------------
  const DEVA = { 'कक्षा': 'class', 'नोट्स': 'notes', 'नोट्': 'notes', 'गणित': 'maths', 'विज्ञान': 'science', 'अंग्रेजी': 'english', 'अंग्रेज़ी': 'english',
    'हिंदी': 'hindi', 'हिन्दी': 'hindi', 'कहाँ': 'kaha', 'कहां': 'kaha', 'चाहिए': 'chahiye', 'कैसे': 'kaise', 'क्या': 'kya', 'पढ़ाई': 'padhai',
    'फीस': 'fees', 'शिक्षक': 'teacher', 'ट्यूशन': 'tuition', 'पंजीकरण': 'register', 'रजिस्ट्रेशन': 'register', 'अध्याय': 'chapter', 'प्रश्न': 'question',
    'पेपर': 'paper', 'भौतिकी': 'physics', 'रसायन': 'chemistry', 'जीव': 'biology', 'सामाजिक': 'social', 'संपर्क': 'contact', 'मदद': 'help', 'नमस्ते': 'namaste',
    'धन्यवाद': 'thanks', 'मुझे': 'mujhe', 'है': 'hai', 'हैं': 'hain', 'का': 'ka', 'की': 'ki', 'के': 'ke', 'में': 'mein', 'से': 'se', 'को': 'ko', 'मैं': 'main', 'आप': 'aap', 'मेरा': 'mera', 'मेरी': 'meri', 'ट्यूटर': 'tutor', 'टीचर': 'teacher', 'अध्यापक': 'teacher', 'सुरक्षित': 'safe', 'भरोसा': 'safe', 'ऑनलाइन': 'online', 'मुफ्त': 'free', 'फ्री': 'free', 'किताब': 'book', 'कितनी': 'kitni', 'कितना': 'kitna', 'कौन': 'kaun', 'कब': 'kab', 'अध्यापिका': 'teacher', 'शुक्रिया': 'thanks', 'अभ्यास': 'practice', 'पाठ्यक्रम': 'syllabus', 'परीक्षा': 'exam' };
  const DEVA_MAP = {}; Object.keys(DEVA).forEach(k => { DEVA_MAP[k.normalize('NFKC')] = DEVA[k]; });
  const VARIANTS = { kahan: 'kaha', kidhar: 'kaha', kaha: 'kaha', milenge: 'mil', milega: 'mil', milegi: 'mil', milta: 'mil', milti: 'mil', mile: 'mil', chaiye: 'chahiye', chahie: 'chahiye', chahiyee: 'chahiye',
    chahie_: 'chahiye', kese: 'kaise', kaisey: 'kaise', kia: 'kya', math: 'maths', mathematics: 'maths', mathematic: 'maths', ganit: 'maths', vigyan: 'science', sci: 'science', sst: 'social science',
    eng: 'english', angrezi: 'english', note: 'notes', nots: 'notes', registration: 'register', registar: 'register', registeration: 'register', signup: 'register', enroll: 'register', enrol: 'register',
    admission: 'register', teachers: 'teacher', tutors: 'tutor', tuitions: 'tuition', tution: 'tuition', fee: 'fees', price: 'fees', cost: 'fees', charges: 'fees', charge: 'fees', kitna: 'fees', kitni: 'fees', rate: 'fees',
    papers: 'paper', pyq: 'previous year paper', sample: 'sample', pdfs: 'pdf', kahaan: 'kaha', bataiye: 'batao', bataye: 'batao', btao: 'batao', plz: 'please', pls: 'please', sahi: 'sahi', thanku: 'thanks', thx: 'thanks', thnx: 'thanks', paise: 'fees', paisa: 'fees', rupaye: 'fees', rupay: 'fees', rupee: 'fees', rupees: 'fees', tutor: 'teacher', bane: 'become', banna: 'become', banu: 'become', banni: 'become', banega: 'become', hlo: 'hello', helo: 'hello', hii: 'hi', hiii: 'hi', hiiii: 'hi', okay: 'ok', okk: 'ok', theek: 'ok', thik: 'ok', accha: 'ok', achha: 'ok' };
  const STOP = new Set(['hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'me', 'mein', 'se', 'the', 'a', 'an', 'is', 'of', 'to', 'for', 'please', 'bhai', 'yaar', 'kya', 'and', 'or', 'it', 'this', 'that', 'sir', 'madam', 'ji', 'toh', 'to', 'bhi', 'na', 'ek', 'ho', 'hu', 'hoon', 'kare', 'karu', 'karna', 'karo', 'kar', 'kijiye', 'kijie', 'batao', 'sakte', 'sakta', 'sakti', 'hoga', 'hota', 'hoti', 'hote', 'mujhe', 'muje', 'mera', 'meri', 'mere', 'aap', 'apna', 'apni', 'aapka', 'aapki', 'tum', 'tumhara', 'can', 'could', 'would', 'tell', 'me', 'i', 'my', 'you', 'your', 'are', 'am', 'do', 'does', 'want', 'need', 'chahiye', 'get', 'find', 'give', 'show', 'dikhao', 'dikha', 'wala', 'wali', 'koi', 'kuch', 'kaun', 'kon', 'which', 'what', 'where', 'how', 'when', 'why', 'kab', 'kyun', 'kaise', 'kaha', 'mil', 'on', 'in', 'at', 'with', 'about', 'wo', 'ye', 'yeh', 'woh', 'lagenge', 'lagega', 'lagta', 'lagti', 'lagte', 'beti', 'beta', 'bachchi', 'liye', 'jo', 'aaye', 'aaya', 'aao', 'jaye', 'bhaiya', 'karne', 'rahi', 'raha', 'rahe', 'aa', 'so', 'much', 'lot', 'very', 'bahut', 'iska', 'uska', 'hum', 'main', 'mai']);
  // question words that must survive for small-talk phrases ("how are you")
  const KEEP_SHORT = new Set(['how', 'are', 'you', 'who', 'what', 'your', 'kaise', 'ho', 'kaun', 'tum', 'aap']);
  const HINGLISH = new Set(['hai', 'hain', 'ka', 'ki', 'ke', 'kaha', 'kahan', 'kya', 'kaise', 'chahiye', 'milega', 'milenge', 'nahi', 'mujhe', 'bhai', 'karo', 'karna', 'batao', 'bataiye', 'padhai', 'aap', 'tum', 'mera', 'meri', 'hum', 'ho', 'kar', 'se', 'ko', 'mein', 'wala', 'kaun', 'kitna', 'kitni', 'kab', 'kyun', 'toh', 'yaar', 'accha', 'achha', 'sahi', 'bachche', 'bachcha', 'ghar', 'padhana', 'sikhna', 'kare', 'karu', 'dikhao', 'hota', 'hoti', 'sakte', 'ek', 'aur', 'bhi', 'lekin', 'par', 'pe']);

  function stem(w) {
    if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.length > 5 && w.endsWith('sses')) return w.slice(0, -2);
    if (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && !w.endsWith('is')) return w.slice(0, -1);
    return w;
  }
  const VARIANT_KEYS = Object.keys(VARIANTS).filter(k => k.length >= 6);
  function fuzzyVariant(w) {
    if (w.length < 6) return null;
    for (let i = 0; i < VARIANT_KEYS.length; i++) { const k = VARIANT_KEYS[i]; if (Math.abs(k.length - w.length) <= 1 && lev(w, k, 1) <= 1) return VARIANTS[k]; }
    return null;
  }
  function baseClean(s) {
    s = String(s || '').normalize('NFKC').toLowerCase();
    s = s.replace(/[\u0966-\u096F]/g, d => String(d.charCodeAt(0) - 0x0966)); // Hindi digits
    s = s.replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ');
    if (/[\u0900-\u097F]/.test(s)) s = s.split(/\s+/).map(w => DEVA_MAP[w] || w).join(' ');
    s = s.replace(/(\d{1,2})\s*(?:st|nd|rd|th)\b/g, 'class $1').replace(/\bcl\s*(\d{1,2})\b/g, 'class $1');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }
  function tokens(s, keepStop) {
    const out = [];
    baseClean(s).split(' ').forEach(w => {
      if (!w) return;
      const v = VARIANTS[w] || fuzzyVariant(w) || w;
      v.split(' ').forEach(x => {
        x = stem(x);
        if (!x) return;
        if (!keepStop && STOP.has(x) && !KEEP_SHORT.has(x)) return;
        out.push(x);
      });
    });
    return out;
  }
  function detectLang(raw) {
    if (/[\u0900-\u097F]/.test(raw)) return 'hi';
    const w = baseClean(raw).split(' ');
    return w.some(x => HINGLISH.has(x)) ? 'hinglish' : 'en';
  }

  // fuzzy equality (cached)
  const _lev = new Map();
  function lev(a, b, max) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const key = a + '|' + b;
    if (_lev.has(key)) return _lev.get(key);
    const m = a.length, n = b.length; let prev = new Array(n + 1), cur = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      cur[0] = i; let rowMin = i;
      for (let j = 1; j <= n; j++) {
        const c = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
        if (cur[j] < rowMin) rowMin = cur[j];
      }
      if (rowMin > max) { _lev.set(key, max + 1); return max + 1; }
      prev = cur.slice();
    }
    const d = prev[n]; if (_lev.size > 20000) _lev.clear(); _lev.set(key, d); return d;
  }
  function tokEq(a, b) {
    if (a === b) return true;
    if (/^\d+$/.test(a) || /^\d+$/.test(b)) return false;
    const L = Math.min(a.length, b.length);
    if (L < 5) return false;
    return lev(a, b, L >= 8 ? 2 : 1) <= (L >= 8 ? 2 : 1);
  }

  // ---------------------------------------------------------------
  // 2. Site info helpers
  // ---------------------------------------------------------------
  function siteInfo() {
    const t = id => { const e = document.getElementById(id); return e ? e.textContent.trim() : ''; };
    let wa = '918287771882';
    try { wa = (global.getHomepageContent && getHomepageContent().whatsapp) || wa; } catch (e) {}
    return { phone: t('hp-header-phone-link') || '+91 82877 71882', email: t('hp-header-email') || '', hours: t('hp-header-hours') || 'Mon – Sat, 9:00 AM – 7:00 PM', whatsapp: wa };
  }
  function fillPlaceholders(s) {
    const i = siteInfo();
    return String(s).replace(/\{phone\}/g, i.phone).replace(/\{email\}/g, i.email || 'support email (Contact page)').replace(/\{hours\}/g, i.hours).replace(/\{whatsapp\}/g, i.whatsapp);
  }

  // ---------------------------------------------------------------
  // 3. Site structure (classes / subjects / chapters / exams)
  // ---------------------------------------------------------------
  const SUBJECT_ALIASES = {
    'Mathematics': ['maths', 'math', 'mathematics', 'ganit', 'गणित'], 'Science': ['science', 'vigyan', 'sci', 'विज्ञान'], 'English': ['english', 'eng', 'angrezi'],
    'Hindi': ['hindi', 'हिंदी'], 'Social Science': ['social science', 'social studies', 'sst', 'social', 'samajik vigyan', 'sst'],
    'Physics': ['physics', 'phy', 'bhautiki'], 'Chemistry': ['chemistry', 'chem', 'rasayan'], 'Biology': ['biology', 'bio', 'jeev vigyan'],
    'Accountancy': ['accountancy', 'accounts', 'accounting'], 'Business Studies': ['business studies', 'business', 'bst'], 'Economics': ['economics', 'eco', 'economy'],
    'Geography': ['geography', 'geo', 'bhugol'], 'History': ['history', 'itihas'], 'Political Science': ['political science', 'polity', 'civics', 'pol sci', 'political'],
    'Psychology': ['psychology'], 'Sociology': ['sociology'], 'Physical Education': ['physical education', 'pe', 'physical']
  };
  const SOCIAL_PARTS = ['Geography', 'History', 'Economics', 'Political Science'];
  let STUDY = {}, CHAPTERS = [], EXAMS = [], EXAM_ROWS = [];

  function loadSiteStructure() {
    try { STUDY = (typeof DEFAULT_STUDY_DATA !== 'undefined') ? DEFAULT_STUDY_DATA : {}; } catch (e) { STUDY = {}; }
    CHAPTERS = [];
    Object.keys(STUDY).forEach(cls => Object.keys(STUDY[cls]).forEach(subj => (STUDY[cls][subj] || []).forEach((name, i) => {
      CHAPTERS.push({ cls, subj, idx: i + 1, name, toks: tokens(name) });
    })));
    try { EXAM_ROWS = (typeof DEFAULT_ENTRANCE_DATA !== 'undefined') ? DEFAULT_ENTRANCE_DATA : []; } catch (e) { EXAM_ROWS = []; }
    const names = [...new Set(EXAM_ROWS.map(r => r.exam))];
    const alias = { 'sainik': ['sainik', 'aissee', 'sainik school'], 'jnvst': ['jnvst', 'navodaya', 'jnv'], 'rms': ['rms', 'rms cet', 'military school', 'rashtriya military'], 'amu': ['amu', 'aligarh'], 'bhu': ['bhu', 'banaras', 'benaras'] };
    EXAMS = names.map(n => {
      const low = n.toLowerCase(); let al = [low];
      Object.keys(alias).forEach(k => { if (low.includes(k)) al = al.concat(alias[k]); });
      return { name: n, aliases: [...new Set(al)] };
    });
  }
  function subjectsOf(cls) { return Object.keys(STUDY[cls] || {}); }
  function chapterDisplay(cls, subj, raw) {
    try { return (typeof displayChapterName === 'function') ? displayChapterName(cls, subj, raw) : raw; } catch (e) { return raw; }
  }

  // ---------------------------------------------------------------
  // 4. Knowledge index
  // ---------------------------------------------------------------
  let ENTRIES = [], INDEX = new Map(), IDF = new Map(), VOCAB = [], ENTRY_BY_ID = new Map(), N_STATIC = 0, LOAD_STATE = 'idle', LOAD_ERR = null;
  const LOWINFO = new Set(['mil', 'kaha', 'class', 'free', 'online', 'details', 'info', 'information', 'bata', 'kaise', 'kaun', 'chahiye', 'milega', 'tip', 'good', 'best']);

  function parseAction(a) {
    if (!a) return null;
    if (typeof a === 'object') { // Firestore form {type, value}
      const v = a.value || a.url || a.page || '';
      if (a.type === 'link') return { type: 'link', url: v };
      if (a.type === 'page') return { type: 'page', id: v };
      if (a.type === 'wa') return { type: 'wa' };
      if (a.type === 'exam') return { type: 'exam', name: v };
      if (a.type === 'study') { const p = String(v).split('|'); return { type: 'study', cls: p[0], subj: p[1] || '' }; }
      return null;
    }
    const s = String(a); const i = s.indexOf(':'); const t = i < 0 ? s : s.slice(0, i), v = i < 0 ? '' : s.slice(i + 1);
    if (t === 'wa') return { type: 'wa' };
    if (t === 'page') return { type: 'page', id: v };
    if (t === 'link') return { type: 'link', url: v };
    if (t === 'exam') return { type: 'exam', name: v };
    if (t === 'study') { const p = v.split('|'); return { type: 'study', cls: p[0], subj: p[1] || '' }; }
    return null;
  }

  function buildIndex(list) {
    ENTRIES = []; INDEX = new Map(); ENTRY_BY_ID = new Map();
    const df = new Map();
    list.forEach(e => {
      const phrases = [];
      (e.question_variations || []).forEach(q => { const t = tokens(q); if (t.length) phrases.push({ t, kind: 'q', raw: baseClean(q) }); });
      (e.keywords || []).forEach(k => { const t = tokens(k); if (t.length) phrases.push({ t, kind: 'k', raw: baseClean(k) }); });
      const tt = tokens(e.title || ''); if (tt.length) phrases.push({ t: tt, kind: 'k', raw: baseClean(e.title) });
      if (!phrases.length) return;
      const rec = { e, phrases, admin: !!e._admin, idx: ENTRIES.length };
      ENTRIES.push(rec); ENTRY_BY_ID.set(e.id, rec);
      const seen = new Set();
      phrases.forEach(p => p.t.forEach(w => seen.add(w)));
      seen.forEach(w => { df.set(w, (df.get(w) || 0) + 1); if (!INDEX.has(w)) INDEX.set(w, []); INDEX.get(w).push(rec.idx); });
    });
    const N = Math.max(ENTRIES.length, 1);
    IDF = new Map(); df.forEach((c, w) => IDF.set(w, Math.log(1 + N / c) * (LOWINFO.has(w) ? 0.3 : 1)));
    VOCAB = [...INDEX.keys()];
  }
  const idfOf = w => IDF.has(w) ? IDF.get(w) : Math.log(1 + Math.max(ENTRIES.length, 1)) * (LOWINFO.has(w) ? 0.3 : 1);

  function phraseScore(q, qs, p) {
    // weighted overlap with typo tolerance
    let qSum = 0, qHit = 0, pSum = 0, pHit = 0;
    const used = new Array(p.t.length).fill(false);
    q.forEach(w => {
      const wt = idfOf(w); qSum += wt;
      for (let i = 0; i < p.t.length; i++) if (!used[i] && tokEq(w, p.t[i])) { used[i] = true; qHit += wt; break; }
    });
    p.t.forEach((w, i) => { const wt = idfOf(w); pSum += wt; if (used[i]) pHit += wt; });
    if (!qSum || !pSum) return 0;
    const cQ = qHit / qSum, cP = pHit / pSum;
    if (qs === p.raw) return 1;
    if (p.kind === 'q') return (cQ + cP) ? (2 * cQ * cP) / (cQ + cP) : 0;
    // keyword phrase: all of its tokens present in the query is what matters
    const cap = p.t.length === 1 ? 0.76 : (p.t.length === 2 ? 0.9 : 0.95);
    return Math.min(cap, cP * (0.3 + 0.7 * cQ));
  }

  function matchEntries(raw, extraBoost) {
    const q = tokens(raw); if (!q.length) return [];
    const qs = baseClean(raw);
    const cand = new Set();
    q.forEach(w => {
      if (INDEX.has(w)) INDEX.get(w).forEach(i => cand.add(i));
      else if (w.length >= 5 && !/^\d+$/.test(w)) VOCAB.forEach(v => { if (Math.abs(v.length - w.length) <= 2 && tokEq(w, v)) INDEX.get(v).forEach(i => cand.add(i)); });
    });
    const out = [];
    cand.forEach(i => {
      const rec = ENTRIES[i]; let best = 0;
      rec.phrases.forEach(p => { const s = phraseScore(q, qs, p); if (s > best) best = s; });
      if (rec.admin) best = Math.min(1, best + 0.03);
      if (best > 0.2) out.push({ rec, score: best });
    });
    out.sort((a, b) => b.score - a.score);
    return out.slice(0, 8);
  }

  // ---------------------------------------------------------------
  // 5. Loading (static JSON + Firestore + legacy chatbotFaqs)
  // ---------------------------------------------------------------
  let STATIC = [], dynSig = '';
  function dynamicEntries() {
    const out = [];
    try {
      if (typeof getData === 'function') {
        (getData('altiKnowledge') || []).forEach(d => {
          if (!d || d.enabled === false || !d.answer) return;
          out.push({ id: 'adm-' + d.id, category: d.category || 'site', title: d.title || (d.question_variations || [])[0] || 'Custom', keywords: d.keywords || [], question_variations: d.question_variations || [], answer: d.answer, answer_en: d.answer_en, related_questions: d.related_questions || [], action: d.action, _admin: true });
        });
        (getData('chatbotFaqs') || []).forEach(f => {
          if (!f || !f.answer) return;
          out.push({ id: 'faq-' + f.id, category: 'site', title: (f.keywords || [])[0] || 'FAQ', keywords: f.keywords || [], question_variations: [], answer: f.answer, related_questions: [], _admin: true });
        });
      }
    } catch (e) { /* offline / rules missing — static KB still works */ }
    return out;
  }
  function sigOf(list) { let s = list.length + ':'; list.forEach(e => { s += (e.id || '') + (e.answer ? e.answer.length : 0) + (e.keywords ? e.keywords.length : 0) + (e.question_variations ? e.question_variations.length : 0) + ';'; }); return s; }
  function refreshIfChanged() {
    const dyn = dynamicEntries(), sig = sigOf(dyn);
    if (sig === dynSig && ENTRIES.length) return;
    dynSig = sig; buildIndex(STATIC.concat(dyn));
  }
  const FALLBACK_CORE = [{ id: 'fb-contact', category: 'site', title: 'Contact', keywords: ['contact', 'phone', 'whatsapp', 'help'], question_variations: ['how to contact you'], answer: 'Aap hamse WhatsApp par baat kar sakte hain 💬 ({phone}, {hours}).', action: 'wa' }];

  function init() {
    if (LOAD_STATE === 'loading' || LOAD_STATE === 'ready') return init._p;
    LOAD_STATE = 'loading';
    loadSiteStructure();
    const url = (CFG.knowledgeUrl || 'data/alti-knowledge.json') + '?v=' + (CFG.version || '1');
    init._p = fetch(url, { cache: 'default' }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(j => { STATIC = j.entries || []; N_STATIC = STATIC.length; global.__ALTI_CATS = j.categories || {}; LOAD_STATE = 'ready'; })
      .catch(err => { LOAD_ERR = err; STATIC = FALLBACK_CORE; N_STATIC = 0; LOAD_STATE = 'offline'; })
      .then(() => { dynSig = ''; refreshIfChanged(); return LOAD_STATE; });
    return init._p;
  }

  function stats() {
    const chapters = CHAPTERS.length, types = 6; // notes, mindmap, exercise, extra questions, practice, pyq
    const classSubj = Object.keys(STUDY).reduce((n, c) => n + Object.keys(STUDY[c]).length, 0);
    const examIntents = EXAM_ROWS.length;
    const dyn = ENTRIES.length - N_STATIC;
    const virtual = chapters * types + classSubj * types + examIntents;
    return { staticEntries: N_STATIC, adminEntries: Math.max(0, dyn), chapters, classSubjectPairs: classSubj, examIntents, virtualIntents: virtual, totalIntents: N_STATIC + Math.max(0, dyn) + virtual, state: LOAD_STATE };
  }

  // ---------------------------------------------------------------
  // 6. Safe maths solver (own parser — never eval)
  // ---------------------------------------------------------------
  function mathTokens(src) {
    const out = []; let i = 0; src = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/²/g, '^2').replace(/³/g, '^3').replace(/√\s*(\d+(?:\.\d+)?|\()/g, 'sqrt($1').replace(/\*\*/g, '^');
    // close the sqrt( introduced from √N
    src = src.replace(/sqrt\((\d+(?:\.\d+)?)(?!\d|\.|\))/g, 'sqrt($1)');
    while (i < src.length) {
      const c = src[i];
      if (c === ' ') { i++; continue; }
      if (/[0-9.]/.test(c)) { let j = i; while (j < src.length && /[0-9.]/.test(src[j])) j++; out.push({ t: 'n', v: parseFloat(src.slice(i, j)) }); i = j; continue; }
      if (/[a-z]/i.test(c)) { let j = i; while (j < src.length && /[a-z]/i.test(src[j])) j++; out.push({ t: 'id', v: src.slice(i, j).toLowerCase() }); i = j; continue; }
      if ('+-*/^()'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
      throw new Error('bad char');
    }
    return out;
  }
  function parseExpr(tokensArr) {
    let p = 0; const peek = () => tokensArr[p], next = () => tokensArr[p++];
    function primary() {
      const t = next(); if (!t) throw new Error('eof');
      if (t.t === 'n') return { k: 'n', v: t.v };
      if (t.t === 'id') {
        if (t.v === 'sqrt') { if (!(peek() && peek().v === '(')) throw new Error('sqrt'); next(); const e = add(); if (!(peek() && peek().v === ')')) throw new Error(')'); next(); return { k: 'f', f: 'sqrt', a: e }; }
        if (t.v === 'pi') return { k: 'n', v: Math.PI };
        if (t.v.length === 1) return { k: 'v', n: t.v };
        throw new Error('id');
      }
      if (t.v === '(') { const e = add(); if (!(peek() && peek().v === ')')) throw new Error(')'); next(); return e; }
      if (t.v === '-') return { k: 'neg', a: power() };
      if (t.v === '+') return power();
      throw new Error('tok');
    }
    function power() { let b = primary(); if (peek() && peek().v === '^') { next(); const e = unaryExp(); b = { k: 'p', a: b, b: e }; } return b; }
    function unaryExp() { if (peek() && peek().v === '-') { next(); return { k: 'neg', a: unaryExp() }; } return power(); }
    function mul() {
      let l = power();
      for (;;) {
        const t = peek(); if (!t) break;
        if (t.t === 'op' && (t.v === '*' || t.v === '/')) { next(); const r = power(); l = { k: t.v, a: l, b: r }; }
        else if (t.t === 'id' || t.t === 'n' || (t.t === 'op' && t.v === '(')) { const r = power(); l = { k: '*', a: l, b: r }; } // implicit multiplication: 2x, 3(x+1), x(x+2)
        else break;
      }
      return l;
    }
    function add() {
      let l = mul();
      for (;;) { const t = peek(); if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) { next(); const r = mul(); l = { k: t.v, a: l, b: r }; } else break; }
      return l;
    }
    const ast = add(); if (p < tokensArr.length) throw new Error('trailing'); return ast;
  }
  function evalAst(a, vars) {
    switch (a.k) {
      case 'n': return a.v; case 'v': if (!(a.n in vars)) throw new Error('var'); return vars[a.n];
      case 'neg': return -evalAst(a.a, vars); case 'p': return Math.pow(evalAst(a.a, vars), evalAst(a.b, vars));
      case 'f': return Math.sqrt(evalAst(a.a, vars));
      case '+': return evalAst(a.a, vars) + evalAst(a.b, vars); case '-': return evalAst(a.a, vars) - evalAst(a.b, vars);
      case '*': return evalAst(a.a, vars) * evalAst(a.b, vars); case '/': return evalAst(a.a, vars) / evalAst(a.b, vars);
    }
    throw new Error('ast');
  }
  const compile = s => parseExpr(mathTokens(s));
  function fmt(n) {
    if (!isFinite(n)) return String(n);
    if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
    for (let d = 2; d <= 100; d++) { const m = n * d; if (Math.abs(m - Math.round(m)) < 1e-9) { const p = Math.round(m); return p + '/' + d + ' (= ' + (+n.toFixed(4)) + ')'; } }
    return String(+n.toFixed(4));
  }
  const fnum = n => { const f = fmt(n); return f.includes(' ') ? f.split(' ')[0] : f; };
  function term(c, v, first) {
    if (Math.abs(c) < 1e-12) return '';
    const s = c < 0 ? '−' : (first ? '' : '+'); const a = Math.abs(c);
    return (first ? s : ' ' + s + ' ') + ((a === 1 && v) ? '' : fnum(a)) + v;
  }

  function solveSystem(eqs) {
    try {
      const fs = eqs.map(e => { const [l, r] = e.split('='); const L = compile(l), R = compile(r); return (x, y) => evalAst(L, { x, y }) - evalAst(R, { x, y }); });
      const c = fs.map(f => { const c0 = f(0, 0); return [f(1, 0) - c0, f(0, 1) - c0, -c0]; }); // a x + b y = d
      const det = c[0][0] * c[1][1] - c[1][0] * c[0][1];
      if (Math.abs(det) < 1e-12) return { ok: true, lines: ['Ye equations ya to infinite solutions dete hain ya koi solution nahi (parallel lines).'] };
      const x = (c[0][2] * c[1][1] - c[1][2] * c[0][1]) / det, y = (c[0][0] * c[1][2] - c[1][0] * c[0][2]) / det;
      return { ok: true, lines: [
        '(1)  ' + (term(c[0][0], 'x', true) + term(c[0][1], 'y', !term(c[0][0], 'x', true))) + ' = ' + fnum(c[0][2]),
        '(2)  ' + (term(c[1][0], 'x', true) + term(c[1][1], 'y', !term(c[1][0], 'x', true))) + ' = ' + fnum(c[1][2]),
        'Elimination / Cramer ke rule se:', 'x = ' + fmt(x), 'y = ' + fmt(y)] };
    } catch (e) { return null; }
  }

  function solveEquation(raw) {
    const re = /[0-9xyz.+\-*\/^()²×÷\s]*=[0-9xyz.+\-*\/^()²×÷\s]+/gi;
    const found = (raw.match(re) || []).map(s => s.trim()).filter(s => /[xyz]/i.test(s) && /\d|[xyz]/i.test(s.split('=')[1] || ''));
    if (!found.length) return null;
    if (found.length >= 2 && /[xy]/i.test(found[0]) && /[xy]/i.test(found[1]) && /y/i.test(found.join(' '))) { const r = solveSystem(found.slice(0, 2).map(s => s.toLowerCase())); return r && { title: 'Simultaneous equations', lines: [found[0], found[1]].concat(r.lines.slice(0, 0)).concat(r.lines) }; }
    const eq = found[0].toLowerCase(); const parts = eq.split('='); if (parts.length !== 2) return null;
    const v = (eq.match(/[xyz]/) || ['x'])[0];
    let L, R; try { L = compile(parts[0]); R = compile(parts[1]); } catch (e) { return null; }
    const f = x => evalAst(L, { [v]: x }) - evalAst(R, { [v]: x });
    let f0, f1, fm1, f2; try { f0 = f(0); f1 = f(1); fm1 = f(-1); f2 = f(2); } catch (e) { return null; }
    if (![f0, f1, fm1, f2].every(isFinite)) return null;
    const a = (f1 - 2 * f0 + fm1) / 2, b = (f1 - fm1) / 2, c = f0;
    if (Math.abs(f2 - (4 * a + 2 * b + c)) > 1e-7 * (1 + Math.abs(f2))) return { title: 'Equation', lines: ['Abhi main sirf **linear** aur **quadratic** equations solve karta hoon (jaise 2x+5=15, x^2-5x+6=0).'], partial: true };
    const lines = [eq.replace(/\*/g, '×').replace(/\^2/g, '²')];
    if (Math.abs(a) < 1e-9) {
      if (Math.abs(b) < 1e-9) return { title: 'Equation', lines: lines.concat([Math.abs(c) < 1e-9 ? 'Ye identity hai — x ki har value sahi hai.' : 'Is equation ka koi solution nahi hai.']) };
      lines.push('Simplify karke: ' + term(b, v, true) + ' = ' + fnum(-c));
      lines.push(v + ' = ' + fnum(-c) + ' ÷ ' + (b < 0 ? '(' + fnum(b) + ')' : fnum(b)));
      lines.push('**' + v + ' = ' + fmt(-c / b) + '**');
      return { title: 'Linear equation', lines };
    }
    const D = b * b - 4 * a * c;
    lines.push('Standard form: ' + (term(a, v + '²', true) + term(b, v, !term(a, v + '²', true)) + (Math.abs(c) < 1e-12 ? '' : ' ' + (c < 0 ? '−' : '+') + ' ' + fnum(Math.abs(c)))) + ' = 0');
    lines.push('a = ' + fnum(a) + ', b = ' + fnum(b) + ', c = ' + fnum(c));
    lines.push('D = b² − 4ac = ' + fmt(D));
    if (D > 1e-12) { const s = Math.sqrt(D); lines.push('**' + v + ' = ' + fmt((-b + s) / (2 * a)) + '  ya  ' + v + ' = ' + fmt((-b - s) / (2 * a)) + '**'); }
    else if (Math.abs(D) <= 1e-12) lines.push('D = 0 → dono roots barabar: **' + v + ' = ' + fmt(-b / (2 * a)) + '**');
    else lines.push('D < 0 → real roots nahi hain. (Complex: ' + fnum(-b / (2 * a)) + ' ± ' + fnum(Math.sqrt(-D) / (2 * Math.abs(a))) + 'i)');
    return { title: 'Quadratic equation', lines };
  }

  function solveWordProblems(raw) {
    const s = raw.toLowerCase().replace(/,/g, '');
    const nums = (s.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    let m;
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|ka|ki)\s*(\d+(?:\.\d+)?)/))) { const p = +m[1], v = +m[2]; return { title: 'Percentage', lines: [m[1] + '% of ' + m[2], '= (' + m[1] + ' ÷ 100) × ' + m[2], '**= ' + fmt(p * v / 100) + '**'] }; }
    const isCI = /compound interest|\bci\b|chakravriddhi/.test(s), isSI = /simple interest|\bsi\b|byaj|sadharan byaj/.test(s);
    if ((isCI || isSI) && nums.length >= 3) {
      const rm = s.match(/(\d+(?:\.\d+)?)\s*%/), tm = s.match(/(\d+(?:\.\d+)?)\s*(?:year|years|yr|yrs|saal|sal|varsh)/);
      if (rm && tm) {
        const R = +rm[1], T = +tm[1]; const P = nums.find(n => n !== R && n !== T) ?? nums[0];
        if (isCI && !isSI) { const A = P * Math.pow(1 + R / 100, T); return { title: 'Compound interest', lines: ['P = ' + P + ', R = ' + R + '%, n = ' + T + ' saal', 'A = P(1 + R/100)ⁿ = ' + P + ' × (1 + ' + R + '/100)^' + T, 'A = ' + fmt(+A.toFixed(2)), '**CI = A − P = ' + fmt(+(A - P).toFixed(2)) + '**'] }; }
        const SI = P * R * T / 100; return { title: 'Simple interest', lines: ['P = ' + P + ', R = ' + R + '%, T = ' + T + ' saal', 'SI = (P × R × T) / 100 = (' + P + ' × ' + R + ' × ' + T + ') / 100', '**SI = ' + fmt(SI) + '**', 'Amount = P + SI = ' + fmt(P + SI)] };
      }
    }
    const usePi = r => (Number.isInteger(r) && r % 7 === 0) ? { v: 22 / 7, s: '22/7' } : { v: Math.PI, s: '3.1416' };
    if (/circle|vritt|gol/.test(s) && /(area|circumference|kshetrafal|parimap)/.test(s) && nums.length) {
      let r = nums[0]; if (/diameter/.test(s)) r = nums[0] / 2; const pi = usePi(r);
      return /circumference|parimap/.test(s) ? { title: 'Circle', lines: ['C = 2πr = 2 × ' + pi.s + ' × ' + fmt(r), '**C = ' + fmt(+(2 * pi.v * r).toFixed(4)) + '**'] } : { title: 'Circle', lines: ['A = πr² = ' + pi.s + ' × ' + fmt(r) + '²', '**A = ' + fmt(+(pi.v * r * r).toFixed(4)) + '**'] };
    }
    if (/square|varg/.test(s) && /(area|perimeter)/.test(s) && nums.length) { const a = nums[0]; return /perimeter/.test(s) ? { title: 'Square', lines: ['P = 4a = 4 × ' + a, '**P = ' + fmt(4 * a) + '**'] } : { title: 'Square', lines: ['A = a² = ' + a + '²', '**A = ' + fmt(a * a) + '**'] }; }
    if (/rectangle|aayat/.test(s) && /(area|perimeter)/.test(s) && nums.length >= 2) { const [l, b] = nums; return /perimeter/.test(s) ? { title: 'Rectangle', lines: ['P = 2(l + b) = 2(' + l + ' + ' + b + ')', '**P = ' + fmt(2 * (l + b)) + '**'] } : { title: 'Rectangle', lines: ['A = l × b = ' + l + ' × ' + b, '**A = ' + fmt(l * b) + '**'] }; }
    if (/triangle|tribhuj/.test(s) && /area/.test(s) && nums.length >= 2) { const [b, h] = nums; return { title: 'Triangle', lines: ['A = ½ × base × height = ½ × ' + b + ' × ' + h, '**A = ' + fmt(0.5 * b * h) + '**'] }; }
    if (/cube/.test(s) && /volume/.test(s) && nums.length) { const a = nums[0]; return { title: 'Cube', lines: ['V = a³ = ' + a + '³', '**V = ' + fmt(a ** 3) + '**'] }; }
    if (/sphere|gola/.test(s) && /volume/.test(s) && nums.length) { const r = nums[0], pi = usePi(r); return { title: 'Sphere', lines: ['V = 4/3 πr³ = 4/3 × ' + pi.s + ' × ' + r + '³', '**V = ' + fmt(+((4 / 3) * pi.v * r ** 3).toFixed(4)) + '**'] }; }
    return null;
  }

  function solveArithmetic(raw) {
    let s = raw.toLowerCase().replace(/[=?]/g, ' ');
    s = s.replace(/\b(what|whats|is|the|calculate|calc|solve|find|value|of|answer|result|kitna|kitne|hota|hai|hoga|kya|batao|bataiye|nikalo|nikalna|karo|kar|do|please|plz|compute|simplify|evaluate)\b/g, ' ').replace(/\s+/g, ' ').trim();
    if (!s || !/\d/.test(s) || !/[-+*/^×÷√()]|sqrt/.test(s)) return null;
    if (/[a-wyz]/.test(s.replace(/sqrt|pi/g, ''))) return null;
    if (/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(s)) return null;
    try {
      const v = evalAst(compile(s), {}); if (!isFinite(v)) return { title: 'Calculation', lines: [s, 'Ye undefined hai (zero se bhaag ya invalid).'] };
      return { title: 'Calculation', lines: [s.replace(/\*/g, '×').replace(/\^/g, '^') + ' =', '**' + fmt(v) + '**'] };
    } catch (e) { return null; }
  }
  function solveMath(raw) {
    try { return solveEquation(raw) || solveWordProblems(raw) || solveArithmetic(raw); } catch (e) { return null; }
  }

  // ---------------------------------------------------------------
  // 7. Slot parsing (class / subject / chapter / resource type)
  // ---------------------------------------------------------------
  const TYPE_RULES = [
    ['practice', /\b(practice|practise|paper|papers|sample|pyq|previous year|question paper|worksheet|test|mock)\b/],
    ['syllabus', /\b(syllabus|pathyakram|curriculum)\b/],
    ['book', /\b(textbook|text book|ncert book|ncert books|kitab)\b/],
    ['notes', /\b(note|notes|study material|material|summary|solution|solutions|exercise|exercises|extra question|extra questions|mind map|mindmap|ncert|revision|chapter|chapters|adhyay)\b/]
  ];
  function parseSlots(raw) {
    const s = baseClean(raw), res = {};
    let m = s.match(/\bclass (\d{1,2})\b/) || s.match(/\bstd (\d{1,2})\b/);
    if (m) { const n = +m[1]; if (n >= 1 && n <= 12) res.cls = n; }
    // subject
    let bestLen = 0;
    Object.keys(SUBJECT_ALIASES).forEach(sub => SUBJECT_ALIASES[sub].forEach(al => {
      const a = baseClean(al); if (!a) return;
      if ((' ' + s + ' ').includes(' ' + a + ' ') && a.length > bestLen) { bestLen = a.length; res.subj = sub; }
    }));
    // bare class number: "10 ki maths ki notes", "9 hindi"
    if (!res.cls) { const s2 = s.replace(/\b(?:chapter|ch|adhyay|lesson|unit)\s*(?:no\s*)?\d{1,2}\b/g, ' '); const mm = s2.match(/\b(\d{1,2})\b/); if (mm && +mm[1] >= 6 && +mm[1] <= 12 && (res.subj || /note|material|paper|chapter|syllabus|book|kitab|ncert/.test(s2))) res.cls = +mm[1]; }
    // chapter number
    m = s.match(/\b(?:chapter|ch|adhyay|lesson|unit)\s*(?:no\s*)?(\d{1,2})\b/) || s.match(/\b(\d{1,2})\s*(?:chapter|adhyay|lesson)\b/);
    if (m) res.chNo = +m[1];
    for (const [t, re] of TYPE_RULES) if (re.test(s)) { res.type = t; break; }
    if (/\bpyq\b|previous year/.test(s)) res.type = 'practice';
    return res;
  }
  function resolveSubject(subj, cls) {
    if (!subj || !cls) return { subj, cls };
    const key = 'Class ' + cls;
    const have = subjectsOf(key);
    if (have.includes(subj)) return { subj };
    if (cls <= 10 && SOCIAL_PARTS.includes(subj) && have.includes('Social Science')) return { subj: 'Social Science', via: subj };
    if (cls >= 11 && subj === 'Science') return { ambiguous: ['Physics', 'Chemistry', 'Biology'].filter(x => have.includes(x)) };
    if (cls >= 11 && subj === 'Social Science') return { ambiguous: ['History', 'Geography', 'Political Science', 'Economics'].filter(x => have.includes(x)) };
    return { missing: true, have };
  }
  const isGenericCh = w => { if (!isGenericCh.set) { isGenericCh.set = new Set(); GENERIC_CH.concat(['mathematics', 'ch', 'teacher', 'math', 'mathematic', 'maths']).forEach(x => { isGenericCh.set.add(x); isGenericCh.set.add(stem(x)); }); } return isGenericCh.set.has(w); };
  function findChapter(cls, subj, text, chNo) {
    const key = 'Class ' + cls, list = (STUDY[key] || {})[subj] || [];
    if (chNo) { if (chNo >= 1 && chNo <= list.length) return { raw: list[chNo - 1], idx: chNo, score: 1 }; return { outOfRange: list.length }; }
    const q = tokens(text).filter(w => !/^\d+$/.test(w) && !isGenericCh(w));
    if (!q.length) return null;
    let best = null;
    list.forEach((name, i) => {
      const ct = tokens(name); if (!ct.length) return;
      let hit = 0; q.forEach(w => { if (ct.some(c => tokEq(w, c))) hit++; });
      const sc = hit ? (hit / q.length) * 0.65 + (hit / ct.length) * 0.35 : 0;
      if (sc > 0.55 && (!best || sc > best.score)) best = { raw: name, idx: i + 1, score: sc };
    });
    return best;
  }
  var GENERIC_CH = ['class', 'chapter', 'notes', 'paper', 'maths', 'science', 'english', 'hindi', 'social', 'physics', 'chemistry', 'biology', 'study', 'material', 'practice', 'sample', 'syllabus', 'book', 'free', 'pdf', 'ncert', 'chahiye', 'solution', 'exercise'];
  function searchChapterAnywhere(text, onlyCls) {
    const q = tokens(text).filter(w => !/^\d+$/.test(w) && w.length > 2 && !isGenericCh(w));
    if (q.length < 1) return [];
    const out = [];
    CHAPTERS.forEach(c => {
      if (onlyCls && c.cls !== 'Class ' + onlyCls) return;
      let hit = 0; q.forEach(w => { if (c.toks.some(t => tokEq(w, t))) hit++; });
      if (!hit) return;
      const sc = (hit / q.length) * 0.6 + (hit / c.toks.length) * 0.4;
      if (sc >= 0.7 && hit >= Math.min(2, q.length)) out.push({ c, score: sc });
    });
    out.sort((a, b) => b.score - a.score); return out.slice(0, 4);
  }

  // ---------------------------------------------------------------
  // 8. Messages (English / Hinglish / Hindi)
  // ---------------------------------------------------------------
  const T = {
    askClass: { en: 'Sure 😊 Which class are you in?', hinglish: 'Bilkul 😊 Kis class ke liye chahiye?', hi: 'ज़रूर 😊 किस कक्षा के लिए चाहिए?' },
    askSubject: { en: cls => 'Great! Class ' + cls + ' — which subject?', hinglish: cls => 'Badhiya! Class ' + cls + ' ka kaunsa subject?', hi: cls => 'बढ़िया! कक्षा ' + cls + ' का कौन सा विषय?' },
    askSub11: { en: cls => 'Class ' + cls + ' has separate subjects — which one?', hinglish: cls => 'Class ' + cls + ' mein subjects alag-alag hain — kaunsa chahiye?', hi: cls => 'कक्षा ' + cls + ' में विषय अलग हैं — कौन सा?' },
    askChapter: { en: (c, s) => 'Class ' + c + ' ' + s + ' ✅ Pick a chapter or open the full subject:', hinglish: (c, s) => 'Class ' + c + ' ' + s + ' ✅ Chapter chuno ya poora subject kholo:', hi: (c, s) => 'कक्षा ' + c + ' ' + s + ' ✅ अध्याय चुनिए या पूरा विषय खोलिए:' },
    foundChapter: { en: (c, s, n, name) => 'Found it! 🎯 Class ' + c + ' ' + s + ' — Chapter ' + n + ': **' + name + '**. You can open Notes, Exercise Solutions and Practice Papers there.', hinglish: (c, s, n, name) => 'Mil gaya! 🎯 Class ' + c + ' ' + s + ' — Chapter ' + n + ': **' + name + '**. Wahan Notes, Exercise Solutions aur Practice Papers mil jayenge.', hi: (c, s, n, name) => 'मिल गया! 🎯 कक्षा ' + c + ' ' + s + ' — अध्याय ' + n + ': **' + name + '**। वहाँ नोट्स, अभ्यास हल और प्रैक्टिस पेपर मिलेंगे।' },
    badChapter: { en: (n, max) => 'That subject has chapters 1–' + max + '. Pick one from the list:', hinglish: (n, max) => 'Is subject mein chapters 1–' + max + ' hain. List se chuno:', hi: (n, max) => 'इस विषय में अध्याय 1–' + max + ' हैं। सूची से चुनिए:' },
    noSubject: { en: (c, s, have) => 'I couldn\'t find ' + s + ' in Class ' + c + '. Available: ' + have.join(', ') + '.', hinglish: (c, s, have) => 'Class ' + c + ' mein ' + s + ' nahi mila. Available: ' + have.join(', ') + '.', hi: (c, s, have) => 'कक्षा ' + c + ' में ' + s + ' नहीं मिला। उपलब्ध: ' + have.join(', ') + '।' },
    young: { en: c => 'Study material on the site is for Classes 6–12. For Class ' + c + ' I can help you find a tutor 😊', hinglish: c => 'Site par study material Class 6–12 ka hai. Class ' + c + ' ke liye main tutor dhoondhne mein help kar sakta hoon 😊', hi: c => 'साइट पर अध्ययन सामग्री कक्षा 6–12 की है। कक्षा ' + c + ' के लिए मैं ट्यूटर ढूँढने में मदद कर सकता हूँ 😊' },
    typeNote: { notes: { en: 'Notes, exercise solutions, extra questions', hinglish: 'Notes, exercise solutions, extra questions', hi: 'नोट्स, अभ्यास हल, अतिरिक्त प्रश्न' }, practice: { en: 'Practice papers', hinglish: 'Practice papers', hi: 'प्रैक्टिस पेपर' } },
    related: { en: 'You may also like:', hinglish: 'Ye bhi dekh sakte ho:', hi: 'ये भी देख सकते हैं:' },
    clarify: { en: 'Did you mean one of these? 🤔', hinglish: 'Kya aap inme se kuch puchh rahe the? 🤔', hi: 'क्या आप इनमें से कुछ पूछ रहे थे? 🤔' },
    unknown: { en: 'I couldn\'t find the exact information for this yet. Could you ask it a bit more clearly? You can also chat with our team on WhatsApp.', hinglish: 'Is question ka exact information mujhe abhi nahi mila. Aap question thoda aur clearly bhej sakte hain. Chaho to hamari team se WhatsApp par baat bhi kar sakte ho.', hi: 'इस प्रश्न की सटीक जानकारी मुझे अभी नहीं मिली। कृपया प्रश्न थोड़ा और स्पष्ट लिखें। चाहें तो WhatsApp पर हमारी टीम से बात कर सकते हैं।' },
    empty: { en: 'Please type your question 😊', hinglish: 'Apna sawal likhiye 😊', hi: 'कृपया अपना प्रश्न लिखिए 😊' },
    mathIntro: { en: 'Here you go 🧮', hinglish: 'Ye raha 🧮', hi: 'ये रहा 🧮' },
    examFound: { en: n => '**' + n + '** — here is what I have 👇', hinglish: n => '**' + n + '** — ye jaankari hai 👇', hi: n => '**' + n + '** — ये जानकारी है 👇' },
    openClass: { en: (c, s) => 'Open Class ' + c + ' ' + s, hinglish: (c, s) => 'Class ' + c + ' ' + s + ' kholo', hi: (c, s) => 'कक्षा ' + c + ' ' + s + ' खोलें' },
    openChapter: { en: n => 'Open Chapter ' + n, hinglish: n => 'Chapter ' + n + ' kholo', hi: n => 'अध्याय ' + n + ' खोलें' }
  };
  const tr = (key, lang, ...a) => { const o = T[key]; const v = o[lang] || o.hinglish || o.en; return typeof v === 'function' ? v(...a) : v; };
  const pickLang = (lang, e) => (lang === 'en' ? (e.answer_en || e.answer) : (lang === 'hi' ? (e.answer_hi || e.answer) : e.answer));

  // ---------------------------------------------------------------
  // 9. The main ask() flow
  // ---------------------------------------------------------------
  const CITY_ALIASES = { bangalore: 'Bengaluru', bombay: 'Mumbai', gurgaon: 'Gurugram', calcutta: 'Kolkata', banaras: 'Varanasi', prayagraj: 'Allahabad', vizag: 'Visakhapatnam', trivandrum: 'Thiruvananthapuram', mysore: 'Mysuru', cochin: 'Kochi', baroda: 'Vadodara', pondicherry: 'Puducherry', madras: 'Chennai', delhi: 'New Delhi', 'dilli': 'New Delhi' };
  function findCity(q0) {
    let list = []; try { if (typeof citiesList !== 'undefined') list = citiesList; } catch (e) {}
    const ql = ' ' + q0 + ' ';
    for (const c of list) { const b = baseClean(c); if (b.length > 3 && ql.includes(' ' + b + ' ')) return { name: c, words: b.split(' ') }; }
    for (const k in CITY_ALIASES) if (ql.includes(' ' + k + ' ')) return { name: CITY_ALIASES[k], words: k.split(' ') };
    for (const c of list) { const w = baseClean(c).split(' '); if (w.length > 1) { const last = w[w.length - 1]; if (last.length >= 5 && ql.includes(' ' + last + ' ')) return { name: c, words: [last] }; } }
    return null;
  }
  function newSession() { return { slots: { cls: null, subj: null, chapter: null, type: null }, awaiting: null, lang: 'hinglish', lastEntry: null, turns: 0 }; }

  const PAGE_LABEL = { 'page-study': ['📚', 'Open Study Material'], 'page-student-form': ['🎓', 'Find a Tutor'], 'page-teacher-form': ['👩‍🏫', 'Teacher Registration'], 'page-entrance': ['📝', 'Entrance Exams'], 'page-updates': ['📢', 'Education Updates'], 'page-teachers': ['👥', 'Our Teachers'], 'page-blog': ['✍️', 'Open Blog'], 'page-contact': ['📞', 'Contact Page'], 'page-premium-leads': ['⭐', 'Premium Leads'], 'page-home': ['🏠', 'Home'] };
  function actionButton(a) {
    if (!a) return null;
    if (a.type === 'page') { const l = PAGE_LABEL[a.id]; return { label: l ? l[0] + ' ' + l[1] : 'Open page', action: a }; }
    if (a.type === 'wa') return { label: '💬 Chat on WhatsApp', action: a, kind: 'wa' };
    if (a.type === 'link') return { label: '🔗 Open official site', action: a };
    if (a.type === 'exam') return { label: '📝 Open ' + a.name, action: a };
    if (a.type === 'study') return { label: '📚 Open ' + a.cls + (a.subj ? ' ' + a.subj : ''), action: a };
    return null;
  }
  function relatedChips(rec, scored, lang, max) {
    const out = []; const seen = new Set([rec ? rec.e.id : '']);
    if (rec) (rec.e.related_questions || []).forEach(id => {
      const r = ENTRY_BY_ID.get(id); if (r && !seen.has(id) && out.length < max) { seen.add(id); out.push({ label: r.e.title, send: (r.e.question_variations || [r.e.title])[0] }); }
    });
    (scored || []).forEach(s => { const id = s.rec.e.id; if (!seen.has(id) && s.score >= 0.4 && out.length < max) { seen.add(id); out.push({ label: s.rec.e.title, send: (s.rec.e.question_variations || [s.rec.e.title])[0] }); } });
    return out;
  }
  const CLASS_CHIPS = [6, 7, 8, 9, 10, 11, 12].map(n => ({ label: 'Class ' + n, send: 'Class ' + n }));

  function studyFlow(raw, sess, lang, parsed, forcedChapter) {
    sess.slots = sess.slots || {};
    const S = sess.slots; const out = { kind: 'study', confidence: 96, lang, buttons: [], chips: [], related: [] };
    if (parsed.cls) { if (S.cls !== parsed.cls) { S.chapter = null; } S.cls = parsed.cls; }
    if (parsed.type) S.type = parsed.type;
    if (parsed.subj) { if (S.subj !== parsed.subj) S.chapter = null; S.subj = parsed.subj; }
    if (S.cls && S.cls < 6) { sess.awaiting = null; out.text = tr('young', lang, S.cls); out.buttons = [actionButton({ type: 'page', id: 'page-student-form' })]; return out; }
    if (!S.cls) {
      if (!parsed.subj || true) { const hits = searchChapterAnywhere(raw); if (hits.length) {
        if (hits.length === 1 || hits[0].score - hits[1].score > 0.15) { const c = hits[0].c; S.cls = +c.cls.replace('Class ', ''); S.subj = c.subj; return studyFlow(raw, sess, lang, { cls: S.cls, subj: c.subj, type: parsed.type }, { raw: c.name, idx: c.idx }); }
        out.kind = 'clarify'; out.confidence = 70; out.text = tr('clarify', lang); out.chips = hits.map(x => ({ label: x.c.cls + ' ' + x.c.subj + ' · ' + chapterDisplay(x.c.cls, x.c.subj, x.c.name).slice(0, 22), send: x.c.cls + ' ' + x.c.subj + ' chapter ' + x.c.idx })); return out; } }
      sess.awaiting = 'cls'; out.text = tr('askClass', lang); out.chips = CLASS_CHIPS; out.kind = 'ask'; return out;
    }
    const key = 'Class ' + S.cls;
    if (!S.subj && !parsed.chNo) { const hits = searchChapterAnywhere(raw, S.cls); if (hits.length && (hits.length === 1 || hits[0].score - hits[1].score > 0.15)) { S.subj = hits[0].c.subj; forcedChapter = { raw: hits[0].c.name, idx: hits[0].c.idx }; } }
    if (!S.subj) {
      sess.awaiting = 'subj'; out.text = tr('askSubject', lang, S.cls); out.kind = 'ask';
      out.chips = subjectsOf(key).map(s => ({ label: s, send: s })); return out;
    }
    const rs = resolveSubject(S.subj, S.cls);
    if (rs.ambiguous) { sess.awaiting = 'subj'; S.subj = null; out.text = tr('askSub11', lang, S.cls); out.kind = 'ask'; out.chips = rs.ambiguous.map(s => ({ label: s, send: s })); return out; }
    if (rs.missing) { const wrong = S.subj; S.subj = null; sess.awaiting = 'subj'; out.kind = 'ask'; out.text = tr('noSubject', lang, S.cls, wrong, rs.have); out.chips = rs.have.map(s => ({ label: s, send: s })); return out; }
    S.subj = rs.subj;
    // chapter
    let ch = null;
    if (forcedChapter) ch = forcedChapter;
    else if (parsed.chNo) { ch = findChapter(S.cls, S.subj, '', parsed.chNo); }
    else ch = findChapter(S.cls, S.subj, raw, null);
    const list = (STUDY[key] || {})[S.subj] || [];
    if (ch && ch.outOfRange) { sess.awaiting = 'chapter'; out.kind = 'ask'; out.text = tr('badChapter', lang, parsed.chNo, ch.outOfRange); }
    else if (ch && ch.raw) {
      S.chapter = ch.raw; sess.awaiting = null;
      out.text = tr('foundChapter', lang, S.cls, S.subj, ch.idx, chapterDisplay(key, S.subj, ch.raw));
      out.buttons = [{ label: '📖 ' + tr('openChapter', lang, ch.idx), action: { type: 'study', cls: key, subj: S.subj, chapter: ch.raw } }];
      out.buttons.push({ label: '📚 ' + tr('openClass', lang, S.cls, S.subj), action: { type: 'study', cls: key, subj: S.subj } });
      out.chips = [{ label: 'Practice papers', send: 'practice papers' }, { label: 'Another subject', send: 'Class ' + S.cls }];
      return out;
    } else if (S.type === 'syllabus' && !parsed.chNo) {
      sess.awaiting = null; out.text = '📘 **Class ' + S.cls + ' ' + S.subj + '** syllabus (NCERT chapters on the site) — **' + list.length + ' chapters**. Kisi chapter ka number likho to uske notes khol dunga.';
      out.buttons = [{ label: '📚 ' + tr('openClass', lang, S.cls, S.subj), action: { type: 'study', cls: key, subj: S.subj } }]; out.chaptersAll = list.map((n, i) => (i + 1) + '. ' + chapterDisplay(key, S.subj, n)); return out;
    } else { sess.awaiting = 'chapter'; out.kind = 'ask'; out.text = tr('askChapter', lang, S.cls, S.subj); }
    out.buttons = out.buttons.concat([{ label: '📚 ' + tr('openClass', lang, S.cls, S.subj), action: { type: 'study', cls: key, subj: S.subj } }]);
    const first = list.slice(0, 8).map((n, i) => ({ label: (i + 1) + '. ' + (chapterDisplay(key, S.subj, n).length > 26 ? chapterDisplay(key, S.subj, n).slice(0, 25) + '…' : chapterDisplay(key, S.subj, n)), send: 'Chapter ' + (i + 1) }));
    out.chips = first.concat(list.length > 8 ? [{ label: 'More chapters ▾', send: 'show all chapters' }] : []);
    out.chaptersAll = list.map((n, i) => (i + 1) + '. ' + chapterDisplay(key, S.subj, n));
    return out;
  }

  function examFlow(raw, lang) {
    const q = baseClean(raw);
    const ex = EXAMS.find(e => e.aliases.some(a => (' ' + q + ' ').includes(' ' + baseClean(a) + ' ')));
    if (!ex) return null;
    const cats = { syllabus: /syllabus|pathyakram/, pattern: /pattern|marking|marks|questions|kitne question/, pyq: /previous|pyq|old paper|purane/, practice: /practice|mock|sample|test/, notes: /tip|note|prepar|tayyari|strategy/ };
    const cat = Object.keys(cats).find(k => cats[k].test(q));
    const rows = EXAM_ROWS.filter(r => r.exam === ex.name && (!cat || r.category === cat));
    const out = { kind: 'exam', confidence: 94, lang, buttons: [{ label: '📝 Open ' + ex.name, action: { type: 'exam', name: ex.name } }], chips: [], related: [] };
    out.text = tr('examFound', lang, ex.name) + '\n' + (rows.length ? rows.slice(0, 5).map(r => '• **' + r.title + '**: ' + r.body).join('\n') : 'Syllabus, pattern, previous papers aur practice — sab Entrance Exams page par hai.');
    if (!cat) out.chips = [{ label: 'Syllabus', send: ex.aliases[0] + ' syllabus' }, { label: 'Exam pattern', send: ex.aliases[0] + ' exam pattern' }, { label: 'Previous papers', send: ex.aliases[0] + ' previous papers' }];
    return out;
  }

  function entryAnswer(rec, scored, lang, conf) {
    const e = rec.e; const out = { kind: 'answer', confidence: conf, lang, entryId: e.id, buttons: [], chips: [], related: [] };
    out.text = fillPlaceholders(pickLang(lang, e));
    const b = actionButton(parseAction(e.action)); if (b) out.buttons.push(b);
    out.related = relatedChips(rec, scored.filter(s => s.rec !== rec), lang, conf >= 90 ? 3 : 3);
    return out;
  }

  async function aiFallback(raw, sess, lang) {
    if (!CFG.aiEndpoint) return null;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), CFG.aiTimeoutMs || 9000);
    try {
      const r = await fetch(CFG.aiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal, body: JSON.stringify({ message: raw, lang, slots: sess.slots }) });
      if (!r.ok) return null; const j = await r.json(); return j && j.answer ? String(j.answer) : null;
    } catch (e) { return null; } finally { clearTimeout(to); }
  }

  async function ask(rawIn, sess) {
    sess = sess || newSession();
    const raw = String(rawIn || '').trim().slice(0, 500);
    if (!raw) return { kind: 'empty', text: tr('empty', sess.lang), buttons: [], chips: [], related: [], confidence: 0, lang: sess.lang };
    if (LOAD_STATE === 'idle') await init();
    refreshIfChanged();
    sess.turns++;
    let lang = detectLang(raw);
    if (lang === 'en' && sess.lang !== 'en' && tokens(raw).length <= 2 && !/[a-z]{5,}/.test(raw.toLowerCase().replace(/class|notes|maths|science|english/g, ''))) lang = sess.lang;
    sess.lang = lang;
    const q0 = baseClean(raw);

    if (/^(menu|start over|restart|reset|home)$/.test(q0)) { sess.slots = { cls: null, subj: null, chapter: null, type: null }; sess.awaiting = null; }
    if (/^(show all chapters|all chapters|sab chapters)$/.test(q0) && sess.slots.cls && sess.slots.subj) {
      const key = 'Class ' + sess.slots.cls, list = (STUDY[key] || {})[sess.slots.subj] || [];
      return { kind: 'study', confidence: 98, lang, text: 'Class ' + sess.slots.cls + ' ' + sess.slots.subj + ' — **' + list.length + ' chapters**:\n' + list.map((n, i) => (i + 1) + '. ' + chapterDisplay(key, sess.slots.subj, n)).join('\n') + '\n\nChapter number likho (jaise "Chapter 3").', buttons: [{ label: '📚 Open Class ' + sess.slots.cls + ' ' + sess.slots.subj, action: { type: 'study', cls: key, subj: sess.slots.subj } }], chips: [], related: [] };
    }

    // 1) maths
    const mathHit = solveMath(raw);
    if (mathHit) {
      return { kind: 'math', confidence: 99, lang, text: tr('mathIntro', lang) + '\n' + mathHit.lines.join('\n'), buttons: [], chips: [{ label: 'Another problem', send: 'solve 3x - 7 = 11' }], related: [], math: true };
    }

    // 2) slot-filling answers while we are waiting for something
    const parsed = parseSlots(raw);
    if (sess.awaiting) {
      const bare = q0.match(/^(?:class )?(\d{1,2})$/);
      if (sess.awaiting === 'cls' && bare && +bare[1] >= 1 && +bare[1] <= 12) parsed.cls = +bare[1];
      if (sess.awaiting === 'chapter' && bare && !parsed.chNo) parsed.chNo = +bare[1];
      const filled = (sess.awaiting === 'cls' && parsed.cls) || (sess.awaiting === 'subj' && parsed.subj) || (sess.awaiting === 'chapter' && (parsed.chNo || parsed.cls || parsed.subj || findChapter(sess.slots.cls, sess.slots.subj || '', raw, null)));
      if (filled) return studyFlow(raw, sess, lang, parsed);
    }

    // 3) exams with site data (e.g. "AISSEE syllabus")
    const ex = examFlow(raw, lang); if (ex) return ex;

    // 3b) city mention ("tutor chahiye delhi me")
    let cityName = null, rawM = raw;
    const cm = findCity(q0); if (cm) { cityName = cm.name; rawM = q0.split(' ').filter(w => !cm.words.includes(w)).join(' '); }

    // 4) entry match
    const scored = matchEntries(rawM); const top = scored[0]; const topScore = top ? top.score : 0;
    const studyWords = !!parsed.type;
    const gotSome = !!(parsed.cls || parsed.subj || parsed.chNo);

    // 5) decide if this is a study-navigation request
    let study = false;
    if (gotSome && (studyWords || (parsed.cls && parsed.subj) || parsed.chNo)) study = true;
    else if (studyWords && !gotSome && topScore < 0.9) study = true;
    else if (parsed.subj && !parsed.cls && !studyWords && tokens(raw).length <= 2 && topScore < 0.9) study = true;
    if (study && topScore >= 0.97 && top.rec.e.category !== 'study' && !parsed.cls && !parsed.subj) study = false;
    if (study && !gotSome && top && topScore >= 0.7 && (top.rec.e.category === 'exams' || top.rec.e.category === 'career')) study = false;
    const tutorWords = /\b(teacher|tuition|coaching|ghar)\b/.test(tokens(raw).join(' ') + ' ' + q0) && /\b(teacher|tuition|coaching)\b/.test(tokens(raw).join(' '));
    if (tutorWords && !parsed.type && !/\b(become|register|job|join|documents?|verification|verified)\b/.test(tokens(raw).join(' ')) && (parsed.cls || parsed.subj || cityName)) {
      const bits = [parsed.cls ? 'Class ' + parsed.cls : '', parsed.subj || ''].filter(Boolean).join(' ');
      const msg = { en: '🎓 Sure! We can find you a verified tutor' + (bits ? ' for **' + bits + '**' : '') + (cityName ? ' in **' + cityName + '**' : '') + ' (home or online). Fill the Find Tutor form and our team will match you.', hinglish: '🎓 Bilkul! Hum' + (bits ? ' **' + bits + '**' : '') + (cityName ? ' ke liye **' + cityName + '** mein' : ' ke liye') + ' verified tutor dhoondh sakte hain (home ya online). Find Tutor form bharo, team match kar degi.', hi: '🎓 बिल्कुल! हम' + (bits ? ' **' + bits + '**' : '') + (cityName ? ' के लिए **' + cityName + '** में' : ' के लिए') + ' वेरिफ़ाइड ट्यूटर ढूँढ सकते हैं (होम या ऑनलाइन)। Find Tutor फ़ॉर्म भरिए, टीम मिला देगी।' };
      return { kind: 'answer', confidence: 93, lang, text: msg[lang] || msg.hinglish, buttons: [actionButton({ type: 'page', id: 'page-student-form' })], chips: [{ label: 'Fees kitni hai?', send: 'fees kitni hai' }, { label: 'Demo class?', send: 'demo class milegi' }], related: [] };
    }
    if (!study && !gotSome) { const ch = searchChapterAnywhere(raw); if (ch.length && (!top || topScore < 0.8)) {
      if (ch.length === 1 || ch[0].score - ch[1].score > 0.15) { const c = ch[0].c; const p2 = { cls: +c.cls.replace('Class ', ''), subj: c.subj, type: parsed.type }; return studyFlow(raw, sess, lang, p2, { raw: c.name, idx: c.idx }); }
      return { kind: 'clarify', confidence: 70, lang, text: tr('clarify', lang), buttons: [], chips: ch.map(x => ({ label: x.c.cls + ' ' + x.c.subj + ' · ' + (chapterDisplay(x.c.cls, x.c.subj, x.c.name).slice(0, 22)), send: x.c.cls + ' ' + x.c.subj + ' chapter ' + x.c.idx })), related: [] };
    } }
    if (!study && parsed.type && !gotSome && sess.slots.cls && sess.slots.subj && sess.turns > 1 && tokens(raw).length <= 3) study = true; // "practice papers" right after Class 10 → Maths
    if (study) return studyFlow(raw, sess, lang, parsed);

    // 6) confidence tiers
    let conf = Math.round(topScore * 100);
    if (conf < 75 && conf >= 30) { // a word we have never seen + weak match = probably out of scope ("bitcoin price")
      const qt = tokens(rawM).filter(w => !/^\d+$/.test(w) && w.length > 3);
      const unk = qt.filter(w => !INDEX.has(w) && !CHAPTERS.some(c => c.toks.includes(w)) && !VOCAB.some(v => Math.abs(v.length - w.length) <= 1 && tokEq(w, v)));
      if (unk.length && qt.length <= 4) conf = Math.min(conf, 45);
    }
    if (cityName && (!top || conf < 70 || top.rec.e.id === 'cities' || top.rec.e.id === 'register-student')) {
      const msg = { en: '📍 Yes — we connect students and tutors in **' + cityName + '** (home & online). Submit your requirement in Find Tutor and our team will match you with a verified teacher!', hinglish: '📍 Haan! **' + cityName + '** mein bhi hum students aur tutors ko jodte hain (home aur online). Find Tutor mein requirement bhar do, team verified teacher se match kar degi!', hi: '📍 हाँ! **' + cityName + '** में भी हम छात्रों और ट्यूटर को जोड़ते हैं (होम और ऑनलाइन)। Find Tutor में ज़रूरत भरिए, टीम वेरिफ़ाइड टीचर से मिला देगी!' };
      return { kind: 'answer', confidence: 92, lang, text: msg[lang] || msg.hinglish, buttons: [actionButton({ type: 'page', id: 'page-student-form' })], chips: [{ label: 'Fees kitni hai?', send: 'fees kitni hai' }, { label: 'Online tuition?', send: 'online ya home tuition' }], related: [] };
    }
    if (top && conf >= 90) { sess.lastEntry = top.rec.e.id; return entryAnswer(top.rec, scored, lang, conf); }
    if (top && conf >= 70) { sess.lastEntry = top.rec.e.id; const o = entryAnswer(top.rec, scored, lang, conf); if (o.related.length) o.relatedTitle = tr('related', lang); return o; }
    if (top && conf >= 50) {
      const opts = scored.slice(0, 3).map(s => ({ label: s.rec.e.title, send: (s.rec.e.question_variations || [s.rec.e.title])[0] }));
      return { kind: 'clarify', confidence: conf, lang, text: tr('clarify', lang), buttons: [], chips: opts, related: [] };
    }
    // < 50 → optional AI proxy, else honest "don't know"
    const ai = await aiFallback(raw, sess, lang);
    if (ai) return { kind: 'ai', confidence: conf, lang, text: ai, buttons: [], chips: [], related: [], ai: true };
    const near = scored.slice(0, 3).filter(s => s.score >= 0.3).map(s => ({ label: s.rec.e.title, send: (s.rec.e.question_variations || [s.rec.e.title])[0] }));
    return { kind: 'unknown', confidence: conf, lang, text: tr('unknown', lang), buttons: [{ label: '💬 Chat on WhatsApp', action: { type: 'wa' }, kind: 'wa' }], chips: near, related: [] };
  }

  global.AltiEngine = { init, ask, newSession, stats, siteInfo, _debug: { tokens, matchEntries, parseSlots, solveMath, detectLang, buildIndex, get entries() { return ENTRIES; }, get chapters() { return CHAPTERS; } } };
})(window);
