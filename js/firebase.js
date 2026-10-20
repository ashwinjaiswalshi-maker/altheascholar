// ================================================================

// NOTE: firebaseConfig / firebase.initializeApp / fsDb / fsAuth / ADMIN_EMAIL
// are defined in a small inline <script> in index.html itself (right after
// the Firebase SDK <script> tags) — deliberately NOT here, and deliberately
// NOT deferred with the rest of the app JS, so the Firestore connection
// starts warming up immediately, before the (much larger) CSS/JS below even
// finishes downloading. Do not redeclare it here — that would be a second,
// conflicting firebase.initializeApp() call.

// firebase.js — generic Firestore data-access layer (getData/addData/
// updateData/deleteData + the realtime-listener plumbing and default-
// content seeding). This is the one file nearly everything else depends
// on, so it is loaded first among the split app files.
// ================================================================
// Turns free text into a safe Firestore document-ID fragment (used to build
// deterministic, content-based IDs below).
function fsSlugKey(str) {
  return String(str || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}
// Writes docs using a DETERMINISTIC id built from their own content, instead
// of Date.now()-based ids. This is what actually prevents duplicates: even
// if loadDefaultData() runs twice at the same time (e.g. two tabs open, or
// login firing the listener twice), both calls resolve to the exact same
// document id and the second write just overwrites the first — no matter
// how the timing lines up. (fsBatchAdd's Date.now() ids didn't have this
// guarantee, which is what let "Study Material" resources show up twice.)
async function fsBatchSet(key, itemsWithIds) {
  if (!itemsWithIds.length) return;
  const CHUNK = 450;
  for (let i = 0; i < itemsWithIds.length; i += CHUNK) {
    const chunk = itemsWithIds.slice(i, i + CHUNK);
    const batch = fsDb.batch();
    chunk.forEach(({ docId, item }) => { batch.set(fsDb.collection(key).doc(docId), item, { merge: false }); });
    await batch.commit();
  }
}
async function loadDefaultData() {
  // Merge-based seeding: adds any MISSING default content without touching
  // anything the admin already added/edited, and without duplicating.
  // Only runs for a logged-in admin (Firestore rules require auth to write
  // to these collections anyway). Each section has its own try/catch so
  // one failing section (e.g. a Firestore rule not yet published for a
  // collection) doesn't hide whether the others succeeded.
  //
  // NOTE: studyContent (Class/Subject/Chapter "notes") is intentionally NOT
  // auto-seeded with placeholder content anymore — the Class/Subject/Chapter
  // dropdowns everywhere (public site + admin upload form) are driven
  // directly from the DEFAULT_STUDY_DATA constant below, so the structure
  // is always available without needing any dummy "Overview" documents in
  // Firestore. Admin adds real resources manually from the Admin Panel.
  let totalAdded = 0;

  try {
    const entranceSnap = await fsDb.collection('entranceContent').get();
    const existingExamKeys = new Set();
    entranceSnap.forEach(doc => {
      const d = doc.data();
      existingExamKeys.add(`${d.exam}|||${d.category}|||${d.title}`);
    });
    const entranceToAdd = [];
    DEFAULT_ENTRANCE_DATA.forEach((item) => {
      const key = `${item.exam}|||${item.category}|||${item.title}`;
      if (!existingExamKeys.has(key)) {
        const docId = `default-${fsSlugKey(item.exam)}-${fsSlugKey(item.category)}-${fsSlugKey(item.title)}`;
        entranceToAdd.push({ docId, item: { ...item, id: docId, categoryType: 'entrance', uploadedAt: new Date().toISOString(), isDefault: true } });
      }
    });
    await fsBatchSet('entranceContent', entranceToAdd);
    totalAdded += entranceToAdd.length;
  } catch (err) {
    console.error('Seeding entranceContent failed:', err);
    showToast('⚠️ Could not load default Entrance Exam content — check Firestore Rules for "entranceContent".', 'error');
  }

  try {
    const faqSnap = await fsDb.collection('chatbotFaqs').get();
    if (faqSnap.empty) {
      const faqDefaults = CHATBOT_FAQ_DEFAULTS();
      await fsBatchAdd('chatbotFaqs', faqDefaults);
      totalAdded += faqDefaults.length;
    }
  } catch (err) {
    console.error('Seeding chatbotFaqs failed:', err);
    showToast('⚠️ Could not load Chatbot FAQs — add the "chatbotFaqs" rule in Firestore Rules and Publish, then try again.', 'error');
  }

  try {
    const siteFaqSnap = await fsDb.collection('siteFaqs').get();
    if (siteFaqSnap.empty) {
      const siteFaqDefaults = SITE_FAQ_DEFAULTS();
      await fsBatchAdd('siteFaqs', siteFaqDefaults);
      totalAdded += siteFaqDefaults.length;
    }
  } catch (err) {
    console.error('Seeding siteFaqs failed:', err);
    showToast('⚠️ Could not load Website FAQs — add the "siteFaqs" rule in Firestore Rules and Publish, then try again.', 'error');
  }

  try {
    const annSnap = await fsDb.collection('announcements').get();
    if (annSnap.empty) {
      const announcements = [
        { type: 'offer', title: 'Premium Membership Launched for Teachers!', desc: 'Get priority leads, a premium badge & top profile visibility — upgrade anytime from the registration page.', link: 'Register Now', date: new Date().toISOString(), visible: true },
        { type: 'new', title: 'Entrance Exam Prep Now Live', desc: 'Free study material added for Sainik School (AISSEE), JNVST, RMS CET & more.', link: 'Explore Study Material', date: new Date(Date.now() - 86400000 * 2).toISOString(), visible: true }
      ];
      await fsBatchAdd('announcements', announcements);
      totalAdded += announcements.length;
    }
  } catch (err) {
    console.error('Seeding announcements failed:', err);
    showToast('⚠️ Could not load default Announcements — check Firestore Rules for "announcements".', 'error');
  }

  // STEP 2: demo/placeholder people (fake parent testimonials, fake teacher
  // profiles, fake premium leads, fake live tuition leads) used to be
  // auto-seeded into Firestore here whenever these collections were empty —
  // even re-appearing after an admin deleted them, since this whole function
  // runs on every admin login. That seeding has been removed so the public
  // site only ever shows real Firestore data, with a proper empty state
  // (see renderPublicTeacherProfiles, renderHomepageTestimonials, etc.) when
  // there isn't any yet. Real teacher/parent/lead records are added the
  // normal way: teacher registration, the student/parent form, or directly
  // by the admin.


  // STEP 5: seed the official news-source list (real, verified government/
  // board URLs only — see DEFAULT_NEWS_SOURCES below) the same safe,
  // merge-based way: only adds sources that aren't already there (matched
  // by URL), never touches or duplicates ones the admin added/edited/removed.
  try {
    const srcSnap = await fsDb.collection('newsSources').get();
    const existingUrls = new Set();
    srcSnap.forEach(doc => existingUrls.add((doc.data().url || '').toLowerCase()));
    const srcToAdd = [];
    DEFAULT_NEWS_SOURCES.forEach(item => {
      if (!existingUrls.has(item.url.toLowerCase())) {
        const docId = `default-${fsSlugKey(item.org)}-${fsSlugKey(item.name)}`;
        srcToAdd.push({ docId, item: { ...item, id: docId, category: 'preset', enabled: true, lastChecked: '', lastStatus: '', lastHash: '', lastNote: '' } });
      }
    });
    await fsBatchSet('newsSources', srcToAdd);
    totalAdded += srcToAdd.length;
  } catch (err) {
    console.error('Seeding newsSources failed:', err);
  }

  if (totalAdded > 0) {
    showToast(`✅ Loaded ${totalAdded} default items.`);
  }
}
// Writes many new documents to a collection efficiently (Firestore batches
// max out at 500 writes, so this splits into chunks) and keeps the local
// cache in sync so the UI updates immediately without waiting for the
// listener round-trip.
async function fsBatchAdd(key, items) {
  if (!items.length) return;
  const CHUNK = 450;
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    const batch = fsDb.batch();
    chunk.forEach((item, idx) => {
      item.id = Date.now() + i + idx;
      batch.set(fsDb.collection(key).doc(String(item.id)), item);
    });
    await batch.commit();
  }
  _fsCache[key] = [...(_fsCache[key] || []), ...items];
}
// ================================================================
// Firestore-backed data layer — drop-in replacement for the old
// localStorage getData/setData/addData/updateData/deleteData.
// Same function names & behavior as before, so nothing else in the
// app had to change — but data now syncs live across every device
// and browser via Firebase, instead of being stuck in one browser.
// ================================================================
const _fsCache = {};
             // key -> array of docs (mirrors the old localStorage array)
const _fsListenersStarted = {};
  // key -> true once we've asked Firestore for this collection
const _fsDataLoaded = {};
        // key -> true once the FIRST real reply has actually arrived
const _fsDataError = {};
         // key -> true if Firestore refused/failed the request (e.g. security rules)
// True only once real data has come back at least once — this is the
// correct signal for "should I still show a loading skeleton?". Checking
// _fsListenersStarted for that was the bug that made Announcements, Meet
// Our Teachers and What Parents Say get stuck on their loading skeleton
// forever on a plain homepage visit: that flag flips to true the instant
// the request is *sent*, not when data actually comes back, and on a
// homepage-only visit nothing else had ever triggered the request in the
// first place, so it silently never started.
function fsDataHasLoaded(key) { return !!_fsDataLoaded[key]; }
// True if Firestore actively refused the read (most commonly: the
// collection's Security Rules in the Firebase console don't allow public,
// logged-out visitors to read it). If this is true, no amount of code
// fixing here will make the section load — the rules themselves need to
// allow "read" for that collection.
function fsDataFailed(key) { return !!_fsDataError[key]; }
// These two collections hold personal data (names, phone numbers, documents),
// so Firestore rules only let a logged-in admin read them — the public can
// still submit registrations (create), just not list/read everyone else's.
const PROTECTED_READ_COLLECTIONS = ['teachers', 'students', 'newsSources', 'pendingUpdates'];
// Firestore's offline cache can reply almost instantly with whatever it
// last had stored locally, then correct itself a beat later once the
// real server snapshot comes back. On a device whose local cache still
// remembered older data, calling renderAll()/renderPublicAll() on BOTH
// replies showed up as old content flashing on screen for a moment
// before the current data took over — for every section, not just one.
// Debouncing the actual render so only the LAST snapshot within a short
// window is ever painted removes that flash everywhere at once.
let _renderDebounceTimer = null;
function scheduleFullRender() {
  clearTimeout(_renderDebounceTimer);
  _renderDebounceTimer = setTimeout(() => {
    if (typeof renderAll === 'function') renderAll();
    if (typeof renderPublicAll === 'function') renderPublicAll();
  }, 150);
}
function fsStartListener(key) {
  if (_fsListenersStarted[key]) return;
  if (PROTECTED_READ_COLLECTIONS.includes(key) && !fsAuth.currentUser) {
    // Not logged in as admin — reading this collection isn't allowed, so
    // don't even try (avoids a scary error toast for ordinary visitors).
    // The listener will attach automatically once admin logs in.
    _fsCache[key] = _fsCache[key] || [];
    return;
  }
  _fsListenersStarted[key] = true;
  _fsCache[key] = _fsCache[key] || [];
  fsDb.collection(key).onSnapshot(snap => {
    const arr = [];
    snap.forEach(doc => arr.push(doc.data()));
    arr.sort((a, b) => (a.id || 0) - (b.id || 0));
    _fsCache[key] = arr;
    _fsDataLoaded[key] = true;
    // Always re-render, including on this listener's first response — the
    // page's initial render always happens before Firestore has replied
    // (getData() starts out with an empty cache), so this first arrival is
    // exactly when real content needs to appear on screen. Debounced (see
    // scheduleFullRender above) so a quick cache-then-server double-fire
    // only paints once, with the final data.
    scheduleFullRender();
  }, err => {
    console.error('Firestore listener error for', key, err);
    _fsDataError[key] = true;
    if (typeof renderAll === 'function') renderAll();
    if (typeof renderPublicAll === 'function') renderPublicAll();
    // 'altiKnowledge' is optional (chatbot extras) — never show visitors an error if its rule isn't published yet
    if (!PROTECTED_READ_COLLECTIONS.includes(key) && key !== 'altiKnowledge') {
      showToast('⚠️ Could not connect to the online database. Check your internet connection.', 'error');
    }
  });
}
// ================================================================
// Firestore-backed "settings" sync — for single-document config
// (homepage content, payment settings, form field labels, policy text,
// blog posts). Same idea as the array data layer above.
// ================================================================
const _fsSettingsCache = {};
const _fsSettingsListenerStarted = {};
const _fsSettingsRenderTimers = {};
 // per-key debounce, same reasoning as scheduleFullRender above
function fsSettingsListen(key, onRemoteChange) {
  if (_fsSettingsListenerStarted[key]) return;
  _fsSettingsListenerStarted[key] = true;
  fsDb.collection('settings').doc(key).onSnapshot(doc => {
    _fsSettingsCache[key] = doc.exists ? doc.data().value : null;
    // Same fix as above — always notify, including on first arrival, but
    // debounced per key so a stale-cache-then-real-value double-fire (e.g.
    // branding right after a logo change) only actually updates the page
    // once, with the settled value.
    if (onRemoteChange) {
      clearTimeout(_fsSettingsRenderTimers[key]);
      _fsSettingsRenderTimers[key] = setTimeout(onRemoteChange, 150);
    }
  }, err => console.error('Firestore settings listener error for', key, err));
}
function fsSettingsGet(key) {
  fsSettingsListen(key);
  return Object.prototype.hasOwnProperty.call(_fsSettingsCache, key) ? _fsSettingsCache[key] : null;
}
// Tells us whether the real value has actually arrived from Firestore yet,
// vs. still being unknown. Used by things like the Festival Popup so we
// never assume a default (e.g. "enabled") before we've actually checked —
// that assumption was what caused the popup to flash on even when the
// admin had turned it off, on a slow connection.
function fsSettingsLoaded(key) {
  return Object.prototype.hasOwnProperty.call(_fsSettingsCache, key);
}
function fsSettingsSave(key, value) {
  _fsSettingsCache[key] = value;
  fsDb.collection('settings').doc(key).set({ value }).catch(err => {
    console.error('Firestore settings save failed for', key, err);
    showToast('⚠️ Save failed online — check your internet connection.', 'error');
  });
}
function getData(key) {
  fsStartListener(key);
  return _fsCache[key] || [];
}
// Kept for backward compatibility — direct array writes are no longer used
// (adds/updates/deletes now go doc-by-doc so multiple devices never clobber
// each other), but nothing else needs to change if it's still called.
function setData(key, data) {
  _fsCache[key] = data;
  return true;
}
function addData(key, item) {
  item.id = Date.now();
  fsStartListener(key);
  _fsCache[key] = [...(_fsCache[key] || []), item];
  fsDb.collection(key).doc(String(item.id)).set(item).catch(err => {
    console.error('Firestore save failed for', key, err);
    showToast('⚠️ Could not save online — check your internet connection and try again.', 'error');
  });
  return item;
}
function deleteData(key, id) {
  fsStartListener(key);
  // String(...) comparison so a default-seeded item's string ID (e.g.
  // "default-jee-...") still matches whether the caller passed it quoted
  // or not — an admin-added item's numeric ID compares equally either way.
  _fsCache[key] = (_fsCache[key] || []).filter(item => String(item.id) !== String(id));
  renderAll();
  fsDb.collection(key).doc(String(id)).delete().catch(err => {
    console.error('Firestore delete failed for', key, err);
    showToast('⚠️ Delete failed online — check your internet connection.', 'error');
  });
}
function updateData(key, id, updates) {
  fsStartListener(key);
  const data = _fsCache[key] || [];
  const idx = data.findIndex(item => String(item.id) === String(id));
  if (idx === -1) return false;
  data[idx] = { ...data[idx], ...updates };
  renderAll();
  fsDb.collection(key).doc(String(id)).set(data[idx], { merge: true }).catch(err => {
    console.error('Firestore update failed for', key, err);
    showToast('⚠️ Update failed online — check your internet connection.', 'error');
  });
  return true;
}
// ================================================================
// Show/Hide staging for homepage sections (Announcements, Teacher
// Profiles, Parent Feedback/Testimonials). Toggling a checkbox in
// the admin table only "stages" the change locally — nothing is
// saved to Firestore until "Save Changes" is clicked, and "Cancel"
// discards staged changes and reverts the checkboxes. This avoids
// the old behavior where every click fired an instant, unconfirmed
// write (which is why show/hide sometimes silently failed to stick).
// ================================================================
const _pendingVisibility = {};
