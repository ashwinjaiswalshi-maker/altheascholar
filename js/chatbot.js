// ================================================================
// chatbot.js — "Alti", the Althea Assistant.
// Smarter local chatbot (no API key / no server needed):
//  • understands English + Hinglish ("fees kitni hai", "tutor chahiye")
//  • tolerates small typos ("registraton", "studey material")
//  • answers from Admin → Chatbot FAQs, built-in smart intents, and the
//    homepage "Website FAQs"
//  • detects class numbers (Class 8 ...) and city names
//  • shows a typing animation, "open page" buttons and follow-up chips
//  • cute animated robot mascot (blinks, bobs, waves, talks)
// Admin-edited FAQ answers always win over built-in ones.
// ================================================================

// ---------- Cute mascot (inline SVG, no external files) ----------
function altiSvg(cls) {
  return '<svg class="alti ' + (cls || '') + '" viewBox="0 0 64 64" aria-hidden="true">' +
    '<g class="alti-ant"><line x1="32" y1="10" x2="32" y2="17" stroke="#0A4174" stroke-width="2.5" stroke-linecap="round"/>' +
    '<circle class="alti-bulb" cx="32" cy="7" r="4.2" fill="#ff9f1c" stroke="#0A4174" stroke-width="1.5"/></g>' +
    '<rect x="3" y="27" width="7" height="14" rx="3.5" fill="#0A4174"/><rect x="54" y="27" width="7" height="14" rx="3.5" fill="#0A4174"/>' +
    '<rect x="8" y="15" width="48" height="43" rx="17" fill="#eaf3ff" stroke="#0A4174" stroke-width="2.6"/>' +
    '<rect x="14" y="22" width="36" height="28" rx="12" fill="#0A4174"/>' +
    '<g class="alti-eyes"><ellipse cx="25" cy="34" rx="4.2" ry="5.2" fill="#7ff5ff"/><ellipse cx="39" cy="34" rx="4.2" ry="5.2" fill="#7ff5ff"/>' +
    '<circle cx="26.4" cy="32" r="1.4" fill="#fff"/><circle cx="40.4" cy="32" r="1.4" fill="#fff"/></g>' +
    '<ellipse cx="19" cy="42.5" rx="3" ry="2" fill="#ff8fab" opacity=".75"/><ellipse cx="45" cy="42.5" rx="3" ry="2" fill="#ff8fab" opacity=".75"/>' +
    '<path class="alti-mouth" d="M27.5 42 Q32 47 36.5 42" stroke="#7ff5ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}
function altiMountMascots() {
  const fab = document.getElementById('chatbotFab');
  if (fab && !fab.dataset.mounted) {
    fab.dataset.mounted = '1';
    fab.innerHTML = altiSvg('alti-fab') + '<span class="alti-badge">1</span>';
    fab.setAttribute('aria-label', 'Chat with Alti');
  }
  const head = document.getElementById('chatbotHeadAvatar');
  if (head && !head.dataset.mounted) { head.dataset.mounted = '1'; head.innerHTML = altiSvg('alti-head'); }
}

// ---------- Text helpers ----------
function chatbotNormalize(s) {
  return String(s || '').toLowerCase().replace(/[^\w\s\u0900-\u097F]/g, ' ').replace(/\s+/g, ' ').trim();
}
function cbEsc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function cbFormat(s) { return String(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }
function cbLev1(a, b) { // true if edit distance <= 1
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
  }
  return edits + (la - i) + (lb - j) <= 1;
}

// Hinglish / alternate-spelling → canonical word. If any trigger appears in
// the question, the canonical word is appended so FAQ keywords still match.
const CB_SYNONYMS = [
  ['register', ['registration', 'registrar', 'signup', 'sign up', 'join', 'judna', 'judo', 'panjikaran', 'apply', 'admission', 'enroll', 'naam likhna', 'account']],
  ['fees', ['fee', 'cost', 'price', 'charge', 'charges', 'kitna', 'kitni', 'kitne', 'paisa', 'paise', 'rupee', 'rupay', 'rupaye', 'rate', 'kharcha', 'shulk', 'budget']],
  ['find tutor', ['tutor chahiye', 'teacher chahiye', 'tuition chahiye', 'tution chahiye', 'need tutor', 'need a tutor', 'looking for tutor', 'ghar par padhane', 'ghar pe padhane', 'padhane wala', 'padhane wali', 'sir chahiye', 'madam chahiye']],
  ['study material', ['notes', 'material', 'kitab', 'ncert', 'chapter', 'pdf', 'worksheet', 'question paper', 'sample paper', 'padhai ka saman']],
  ['safe', ['bharosa', 'vishwas', 'fraud', 'fake', 'genuine', 'scam', 'legit', 'trusted', 'surakshit', 'sahi hai']],
  ['contact', ['call', 'phone', 'number', 'whatsapp', 'email', 'mail', 'baat', 'sampark', 'helpline', 'support']],
  ['demo', ['trial', 'free class', 'demo class', 'pehli class']],
  ['become a teacher', ['teacher banna', 'teach karna', 'padhana chahta', 'padhana chahti', 'job chahiye', 'kamai', 'earn', 'teacher registration', 'tutor banna', 'teacher ke liye']],
  ['online', ['zoom', 'google meet', 'ghar baithe', 'internet class']],
  ['home tuition', ['ghar par', 'ghar pe', 'home tutor', 'in person']],
  ['premium', ['membership', 'plan', 'paid']],
  ['refund', ['paisa wapas', 'wapas', 'cancel']],
];
function cbExpand(q) {
  let extra = [];
  CB_SYNONYMS.forEach(([canon, triggers]) => {
    if (triggers.some(t => (' ' + q + ' ').includes(' ' + t + ' ') || (t.includes(' ') && q.includes(t)))) extra.push(canon);
  });
  return extra.length ? q + ' ' + extra.join(' ') : q;
}

// ---------- Small helpers reading live site info ----------
function cbPhone() { const e = document.getElementById('hp-header-phone-link'); return e ? e.textContent.trim() : '+91 82877 71882'; }
function cbEmail() { const e = document.getElementById('hp-header-email'); return e ? e.textContent.trim() : ''; }
function cbHours() { const e = document.getElementById('hp-header-hours'); return e ? e.textContent.trim() : 'Mon – Sat, 9:00 AM – 7:00 PM'; }

// Menu names in an answer → real "open this page" buttons.
const CB_PAGE_LINKS = [
  { re: /study material/i, id: 'page-study', label: '📚 Open Study Material' },
  { re: /find tutor|post your requirement|student registration/i, id: 'page-student-form', label: '🎓 Find a Tutor' },
  { re: /become a teacher|teacher registration|membership plan/i, id: 'page-teacher-form', label: '👩‍🏫 Teacher Registration' },
  { re: /entrance exam/i, id: 'page-entrance', label: '📝 Entrance Exams' },
  { re: /education updates/i, id: 'page-updates', label: '📢 Education Updates' },
  { re: /our teachers/i, id: 'page-teachers', label: '👥 Our Teachers' },
  { re: /\bblog\b/i, id: 'page-blog', label: '✍️ Open Blog' },
  { re: /contact page/i, id: 'page-contact', label: '📞 Contact Page' },
];
function cbLinkButtons(text, max) {
  const out = [];
  CB_PAGE_LINKS.forEach(l => { if (out.length < (max || 2) && l.re.test(text) && document.getElementById(l.id)) out.push(l); });
  return out;
}
function chatbotGo(pageId) {
  closeChatbot();
  if (typeof showPage === 'function') showPage(pageId);
}

// ---------- Built-in smart intents (used when no admin FAQ fits better) ----------
function cbBuiltInIntents() {
  return [
    { keys: ['who are you', 'your name', 'tum kaun', 'aap kaun', 'what are you', 'are you a bot', 'are you human', 'robot', 'tumhara naam', 'aapka naam'],
      links: false, answer: () => "I'm **Alti**, the Althea Scholar helper bot! 🤖💙 I can help with registration, fees, study material, entrance exams and more. (I'm a bot, so for anything personal our team is on WhatsApp.)" },
    { keys: ['how are you', 'kaise ho', 'kaisi ho', 'kya haal', 'whats up', 'sup'],
      links: false, answer: () => "I'm doing great, thanks for asking! 😄 Ready to help — what would you like to know?" },
    { keys: ['joke', 'funny', 'mazak', 'chutkula'],
      links: false, answer: () => ["Why did the student eat his homework? Because the teacher said it was a piece of cake! 🍰", "Why was the math book sad? It had too many problems. 📘😢", "What did zero say to eight? Nice belt! 😄"][Math.floor(Math.random() * 3)] },
    { keys: ['contact', 'phone', 'call', 'number', 'whatsapp', 'email', 'reach', 'support', 'helpline', 'baat karni'],
      links: false, answer: () => "You can reach us here:\n📞 **" + cbPhone() + "** (" + cbHours() + ")" + (cbEmail() ? "\n✉️ **" + cbEmail() + "**" : "") + "\nOr tap the WhatsApp button below for the fastest reply! 💬", wa: true },
    { keys: ['timing', 'time', 'hours', 'open', 'available', 'kab', 'kitne baje'],
      links: false, answer: () => "Our team is available **" + cbHours() + "**. Outside these hours, send a WhatsApp message and we'll reply as soon as we're back! 🕘", wa: true },
    { keys: ['teacher chahiye', 'find tutor', 'need tutor', 'tutor', 'home tutor', 'tuition'],
      answer: () => "Finding a tutor is easy! 🎓 Tap **Find Tutor**, fill in the class, subject, city and mode (home/online) — our team matches you with a verified teacher. Registration is free!" },
    { keys: ['become a teacher', 'teacher registration', 'teach', 'teacher job', 'earn'],
      answer: () => "Want to teach with us? 👩‍🏫 Open **Become a Teacher**, fill in your subjects, experience and documents. After verification your profile goes live and you can get tuition leads. Registration is free!" },
    { keys: ['thank', 'thanks', 'thanku', 'shukriya', 'dhanyavad', 'dhanyawad', 'thnx'],
      links: false, answer: () => "You're most welcome! 😊 Anything else I can help with?" },
    { keys: ['bye', 'goodbye', 'see you', 'tata', 'alvida', 'ok bye'],
      links: false, answer: () => "Bye bye! 👋 Come back anytime — I'll be right here. Happy learning! 📚" },
  ];
}

// All the chips we can offer as follow-ups
const CB_SUGGESTIONS = ['How to register?', 'Fees kitni hai?', 'Study material kahan milega?', 'Premium Membership?', 'Entrance exam prep?', 'Is it safe & genuine?', 'Hobby classes?', 'Contact details', 'Teacher kaise bane?', 'Online ya home tuition?'];
let cbAsked = [];
let cbLastTopic = '';

// ---------- Matching ----------
function getChatbotFaqs() { return getData('chatbotFaqs'); }

function cbScoreKeywords(q, qWords, keywords) {
  let score = 0;
  (keywords || []).forEach(kRaw => {
    const k = chatbotNormalize(kRaw);
    if (!k) return;
    if ((' ' + q + ' ').includes(' ' + k + ' ')) {
      score += 3 + k.split(' ').length; // whole phrase (word-boundary) match — strong
    } else if (k.length > 3 && q.includes(k)) {
      score += 2 + k.split(' ').length; // inside a longer word, e.g. "fees" in "fees?"
    } else {
      k.split(' ').forEach(kw => {
        if (kw.length <= 2) return;
        if (qWords.includes(kw)) score += 1;
        else if (kw.length >= 5 && qWords.some(w => w.length >= 5 && cbLev1(w, kw))) score += 0.8; // typo tolerance
      });
    }
  });
  return score;
}

function chatbotFindAnswer(rawQuestion) {
  const q0 = chatbotNormalize(rawQuestion);
  const q = cbExpand(q0);
  const qWords = q.split(' ').filter(w => w.length > 2);
  const result = { text: null, wa: false, buttons: [], related: [] };

  // 0) Plain greetings (Hi / Hello / Namaste ...)
  if (/^(hi+|hello+|hey+|heya|namaste|namaskar|good (morning|afternoon|evening)|yo|hola)\b/.test(q0) && q0.split(' ').length <= 4) {
    result.text = "Hello! 👋 I'm Alti. I can help with registration, fees, subjects, study material, entrance exams and more — what would you like to know?";
    return result;
  }

  // 1) Class number, e.g. "class 8 maths notes", "8th ke notes"
  const cm = /\bclass\s*(\d{1,2})\b|\b(\d{1,2})\s*(?:st|nd|rd|th)\b/.exec(q0);
  const classNo = cm ? parseInt(cm[1] || cm[2], 10) : null;
  const wantsNotes = /(note|material|pdf|chapter|paper|ncert|kitab|study)/.test(q);
  const wantsTutor = /(tutor|teacher|tuition|tution|padhane)/.test(q);
  if (classNo && classNo >= 1 && classNo <= 12 && (wantsNotes || wantsTutor)) {
    if (wantsNotes && classNo >= 6) {
      result.text = "Yes! 📚 We have free **Class " + classNo + "** notes, mind maps, exercise Q&A and practice papers, organised Subject → Chapter. Open Study Material and pick Class " + classNo + ".";
      result.buttons = [CB_PAGE_LINKS[0]];
    } else if (wantsNotes) {
      result.text = "For **Class " + classNo + "** (foundation level) you can request a tutor, and we keep adding material. Study material is currently strongest for Classes 6–12.";
      result.buttons = [CB_PAGE_LINKS[0], CB_PAGE_LINKS[1]];
    } else {
      result.text = "We can find a verified tutor for **Class " + classNo + "** — home or online! 🎓 Just choose the class, subject and city in the Find Tutor form.";
      result.buttons = [CB_PAGE_LINKS[1]];
    }
    return result;
  }

  // 2) City mention
  if (typeof citiesList !== 'undefined') {
    const city = citiesList.find(c => c.length > 3 && (' ' + q0 + ' ').includes(' ' + c.toLowerCase() + ' '));
    if (city) {
      result.text = "Yes, we connect students and tutors in **" + city + "** 📍 (home & online tuition). Submit your requirement in Find Tutor and we'll match you with a verified teacher!";
      result.buttons = [CB_PAGE_LINKS[1]];
      return result;
    }
  }

  // 3) Score admin FAQs, built-in intents and website FAQs together
  const cands = [];
  getChatbotFaqs().forEach(f => cands.push({ score: cbScoreKeywords(q, qWords, f.keywords) + 0.5, answer: f.answer, src: 'admin', keys: f.keywords }));
  cbBuiltInIntents().forEach(it => cands.push({ score: cbScoreKeywords(q, qWords, it.keys), answer: it.answer(), wa: !!it.wa, src: 'built', keys: it.keys, links: it.links !== false }));
  getSiteFaqs().forEach(f => {
    const qs = chatbotNormalize(f.question || '');
    const kw = qs.split(' ').filter(w => w.length > 3);
    cands.push({ score: cbScoreKeywords(q, qWords, [qs].concat(kw.length > 2 ? [] : [])) * 0.8 + kw.filter(w => qWords.includes(w)).length * 0.6, answer: f.answer, src: 'site', keys: [qs] });
  });
  cands.sort((a, b) => b.score - a.score);
  const best = cands[0];
  if (best && best.score >= 2) {
    result.text = best.answer; result.wa = !!best.wa;
    result.buttons = best.links === false ? [] : cbLinkButtons(best.answer, 2);
    cbLastTopic = (best.keys && best.keys[0]) || '';
    return result;
  }

  // 4) Short follow-ups ("and for teachers?", "aur?") reuse the last topic
  if (cbLastTopic && q0.split(' ').length <= 3 && /^(and|aur|or|phir|then|why|kyun|how|kaise)\b/.test(q0)) {
    result.text = "Could you tell me a bit more? For example: **\"" + cbLastTopic + " for teachers\"** or **\"" + cbLastTopic + " for students\"**. Or tap WhatsApp for a personal answer 💬";
    result.wa = true;
    return result;
  }

  // 5) Nothing good — suggest the closest topics
  result.related = cands.filter(c => c.score >= 0.8 && c.src !== 'site' && c.keys && c.keys[0]).slice(0, 3).map(c => c.keys[0]);
  return result;
}

// ---------- UI ----------
function chatbotWhatsAppLink(question) {
  const c = getHomepageContent();
  const trail = cbAsked.slice(-2).filter(x => x !== question);
  const text = encodeURIComponent('Hi Althea Scholar, I have a question: ' + question + (trail.length ? ' (earlier I asked: ' + trail.join(' | ') + ')' : ''));
  return 'https://wa.me/' + (c.whatsapp || '918287771882') + '?text=' + text;
}
function chatbotScroll() { const b = document.getElementById('chatbotBody'); if (b) b.scrollTop = b.scrollHeight; }
function chatbotAddMsg(text, sender, extraHtml) {
  const body = document.getElementById('chatbotBody');
  const row = document.createElement('div');
  row.className = 'cb-row ' + sender;
  const html = sender === 'user' ? cbEsc(text) : cbFormat(text);
  row.innerHTML = (sender === 'bot' ? '<span class="cb-avatar">' + altiSvg('alti-mini') + '</span>' : '') +
    '<div class="chatbot-msg ' + sender + '">' + html + (extraHtml || '') + '</div>';
  body.appendChild(row);
  chatbotScroll();
  return row;
}
function cbSetTalking(on) {
  const head = document.getElementById('chatbotHeadAvatar');
  const status = document.getElementById('chatbotStatus');
  if (head) head.classList.toggle('talking', on);
  if (status) status.innerHTML = on ? 'typing<span class="cb-dots-inline">...</span>' : '<i class="cb-online"></i> Online · replies instantly';
}
function cbShowTyping() {
  const body = document.getElementById('chatbotBody');
  const row = document.createElement('div');
  row.className = 'cb-row bot cb-typing-row';
  row.innerHTML = '<span class="cb-avatar">' + altiSvg('alti-mini talking') + '</span><div class="chatbot-msg bot cb-typing"><span></span><span></span><span></span></div>';
  body.appendChild(row); chatbotScroll(); cbSetTalking(true);
  return row;
}
function cbChips(list) {
  const box = document.createElement('div');
  box.className = 'chatbot-quick';
  box.innerHTML = list.map(q => '<button type="button" data-q="' + cbEsc(q) + '">' + cbEsc(q) + '</button>').join('');
  box.addEventListener('click', e => { const b = e.target.closest('button[data-q]'); if (b) { box.remove(); chatbotAsk(b.dataset.q); } });
  document.getElementById('chatbotBody').appendChild(box); chatbotScroll();
}
function cbFollowUps() {
  const pool = CB_SUGGESTIONS.filter(s => !cbAsked.includes(s));
  const picks = [];
  while (picks.length < 3 && pool.length) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  if (picks.length) cbChips(picks);
}

function openChatbot() {
  dismissChatbotGreet();
  altiMountMascots();
  const panel = document.getElementById('chatbotPanel');
  panel.classList.add('show');
  const badge = document.querySelector('#chatbotFab .alti-badge'); if (badge) badge.style.display = 'none';
  document.getElementById('chatbotFab').classList.add('opened');
  if (!panel.dataset.opened) {
    panel.dataset.opened = '1';
    chatbotAddMsg("Hi there! 👋 I'm **Alti**, your Althea helper bot. Ask me about registration, fees, study material, entrance exams or anything else — in English or Hinglish! 😊", 'bot');
    cbChips(['How to register?', 'Fees kitni hai?', 'Study material kahan milega?', 'Premium Membership?']);
  }
  document.getElementById('chatbotInput').focus();
}
function closeChatbot() { document.getElementById('chatbotPanel').classList.remove('show'); }
function dismissChatbotGreet() {
  const g = document.getElementById('chatbotGreet'); if (g) g.style.display = 'none';
  try { localStorage.setItem('chatbotGreetSeen', '1'); } catch (e) {}
}
function chatbotAsk(question) {
  document.getElementById('chatbotInput').value = question;
  sendChatbotMessage();
}
let cbBusy = false;
function sendChatbotMessage() {
  const input = document.getElementById('chatbotInput');
  const question = input.value.trim();
  if (!question || cbBusy) return;
  cbBusy = true;
  document.querySelectorAll('#chatbotBody .chatbot-quick').forEach(el => el.remove());
  chatbotAddMsg(question, 'user');
  cbAsked.push(question);
  input.value = '';
  const res = chatbotFindAnswer(question);
  const typing = cbShowTyping();
  const delay = Math.min(1300, 500 + (res.text ? res.text.length * 3 : 200));
  setTimeout(() => {
    typing.remove(); cbSetTalking(false);
    let extra = '';
    if (res.buttons && res.buttons.length) {
      extra += '<div class="cb-actions">' + res.buttons.map(b => '<button type="button" class="cb-go" onclick="chatbotGo(\'' + b.id + '\')">' + b.label + '</button>').join('') + '</div>';
    }
    if (res.wa) {
      extra += '<div class="cb-actions"><a class="chatbot-wa-btn" href="' + chatbotWhatsAppLink(question) + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</a></div>';
    }
    if (res.text) {
      chatbotAddMsg(res.text, 'bot', extra);
      cbFollowUps();
    } else {
      chatbotAddMsg("Hmm, I'm not 100% sure about that one 🤔 Let me connect you with our team — they'll reply personally on WhatsApp!",
        'bot', '<div class="cb-actions"><a class="chatbot-wa-btn" href="' + chatbotWhatsAppLink(question) + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Continue on WhatsApp</a></div>');
      if (res.related && res.related.length) {
        chatbotAddMsg('Or maybe you meant one of these?', 'bot');
        cbChips(res.related.map(k => k.charAt(0).toUpperCase() + k.slice(1)));
      } else cbFollowUps();
    }
    cbBusy = false;
  }, delay);
}

// Mount the mascot as soon as the page is ready
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', altiMountMascots);
else altiMountMascots();
