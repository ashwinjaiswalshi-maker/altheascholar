// ================================================================
// news-checker.js — Official News Source Checker (Step 5): browser-side
// fetch + content-hash checks against each source, Pending Updates queue.
// ================================================================
// Real, individually verified official URLs only (checked before adding —
// see the Step 5 final report). Where an organisation runs more than one
// portal (e.g. NTA), each portal is its own row sharing the same "org", so
// admins can add further portals for the same organisation the same way.
// "IB" is the International Baccalaureate's own global site, not India-
// specific. Deliberately NOT included: a generic "Olympiads" entry — there
// is no single official Indian government Olympiad site to point at, and
// guessing one risked linking somewhere wrong; add a specific Olympiad body
// here yourself via "Add a Source" if you want one tracked.
const DEFAULT_NEWS_SOURCES = [
  { org: 'CBSE', name: 'Main Website', url: 'https://www.cbse.gov.in/' },
  { org: 'NTA', name: 'Main Website', url: 'https://www.nta.ac.in/' },
  { org: 'NTA', name: 'JEE Main', url: 'https://jeemain.nta.nic.in/' },
  { org: 'NTA', name: 'NEET UG', url: 'https://neet.nta.nic.in/' },
  { org: 'NTA', name: 'CUET UG', url: 'https://cuet.nta.nic.in/' },
  { org: 'UPSC', name: 'Main Website (incl. NDA)', url: 'https://upsc.gov.in/' },
  { org: 'NDA', name: 'via UPSC', url: 'https://upsc.gov.in/' },
  { org: 'NVS', name: 'Navodaya Vidyalaya Samiti', url: 'https://navodaya.gov.in/' },
  { org: 'Sainik Schools', name: 'AISSEE (via NTA)', url: 'https://exams.nta.ac.in/AISSEE/' },
  { org: 'RMS', name: 'Rashtriya Military Schools', url: 'https://www.rashtriyamilitaryschools.edu.in/' },
  { org: 'RIMC', name: 'Rashtriya Indian Military College', url: 'https://rimc.gov.in/' },
  { org: 'CISCE', name: 'ICSE / ISC', url: 'https://www.cisce.org/' },
  { org: 'IB', name: 'International Baccalaureate', url: 'https://www.ibo.org/' },
  { org: 'NCERT', name: 'Main Website', url: 'https://ncert.nic.in/' },
  { org: 'NSP', name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/' },
  { org: 'KVS', name: 'Kendriya Vidyalaya Sangathan', url: 'https://kvsangathan.nic.in/' },
  { org: 'EMRS', name: 'NESTS', url: 'https://nests.tribal.gov.in/' },
  { org: 'CTET', name: 'Main Website', url: 'https://ctet.nic.in/' },
  { org: 'MCC', name: 'Medical Counselling Committee', url: 'https://mcc.nic.in/' },
  { org: 'JoSAA', name: 'Joint Seat Allocation Authority', url: 'https://josaa.nic.in/' },
  { org: 'CSAB', name: 'Central Seat Allocation Board', url: 'https://csab.nic.in/' },
  { org: 'UGC', name: 'University Grants Commission', url: 'https://www.ugc.gov.in/' },
  { org: 'AICTE', name: 'All India Council for Technical Education', url: 'https://www.aicte-india.org/' },
  { org: 'NMC', name: 'National Medical Commission', url: 'https://www.nmc.org.in/' }
];
// ================================================================
// Official News Source Checker (Step 5) — entirely browser-side, on
// Firebase's free Spark plan: no Cloud Functions, no paid API, nothing
// billed. The admin's own browser fetches each source's URL directly when
// they click "Check". This only works for sources whose server allows
// cross-origin requests (CORS) — most Indian government sites do not, and
// there's no way to tell CORS-blocked apart from "actually down" from
// inside a plain browser fetch, so both are honestly reported the same
// way: "Unable to Check Automatically", with Open + Add Update Manually
// as the fallback. Nothing is EVER auto-published — a detected change only
// ever creates a Pending Update, which still needs "Create Draft" (and
// then editing, previewing and publishing by hand) before it's real.
// ================================================================
const NSC_STATUS = {
  'new':     { icon: '🟢', label: 'Checked — New Updates Found' },
  'no-new':  { icon: '🟢', label: 'Checked — No New Updates' },
  'unable':  { icon: '🟡', label: 'Unable to Check Automatically' },
  'error':   { icon: '🔴', label: 'Error / Temporarily Unavailable' },
  '':        { icon: '⚪', label: 'Not checked yet' }
};
// Tiny, dependency-free string hash (djb2) — just needs to change when the
// page's visible text changes, not to be cryptographically strong.
function nscHash(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return String(h) + ':' + text.length;
}
function nscExtractText(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 20000);
}
async function nscFetchOne(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'no-store', signal: ctrl.signal, redirect: 'follow' });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, httpError: true };
    const text = await res.text();
    return { ok: true, hash: nscHash(nscExtractText(text)) };
  } catch (err) {
    clearTimeout(timer);
    // A CORS block and a real network/timeout failure throw the exact same
    // generic error in a browser — there is no reliable way to tell them
    // apart here, so both are reported as "Unable to Check Automatically"
    // rather than guessing which one it was.
    return { ok: false, httpError: false };
  }
}
async function checkOneNewsSource(src, silent) {
  const result = await nscFetchOne(src.url);
  const now = new Date().toISOString();
  let status, note;
  if (!result.ok && !result.httpError) {
    status = 'unable';
    note = "Couldn't reach this page from the browser (blocked or unreachable) — open it directly to check by hand.";
  } else if (!result.ok && result.httpError) {
    status = 'error';
    note = 'The site responded with an error. It may be temporarily down — try again later or open it directly.';
  } else if (!src.lastHash) {
    status = 'no-new';
    note = 'First successful check — this is now the baseline. Future checks compare against this.';
  } else if (result.hash !== src.lastHash) {
    status = 'new';
    note = 'This page\'s content has changed since it was last checked — see Pending Updates below.';
  } else {
    status = 'no-new';
    note = 'Checked — the page looks the same as last time.';
  }
  const updates = { lastChecked: now, lastStatus: status, lastNote: note };
  if (result.ok) updates.lastHash = result.hash;
  updateData('newsSources', src.id, updates);
  if (status === 'new') nscCreatePendingUpdate({ ...src, ...updates });
  if (!silent) renderNewsSourcesAdmin();
  return status;
}
// Duplicate detection (Step 5 §2): if this source already has an unresolved
// ("open") Pending Update, refresh its timestamp instead of creating a
// second one — the same real change is never queued twice.
function nscCreatePendingUpdate(src) {
  const existing = getData('pendingUpdates').find(p => p.sourceId === src.id && p.status === 'open');
  if (existing) { updateData('pendingUpdates', existing.id, { detectedAt: new Date().toISOString() }); return; }
  addData('pendingUpdates', {
    sourceId: src.id, sourceOrg: src.org, sourceName: src.name, sourceUrl: src.url,
    detectedAt: new Date().toISOString(), status: 'open',
    note: "This source's page changed since it was last checked. Open it to see what's new, then Create Draft to start a real Update — nothing here has been written for you."
  });
}
let _nscChecking = false;
function checkOneNewsSourceById(id) {
  const src = getData('newsSources').find(x => String(x.id) === String(id));
  if (src) checkOneNewsSource(src, false);
}
async function checkAllNewsSources() {
  if (_nscChecking) return;
  const sources = getData('newsSources').filter(s => s.enabled !== false);
  if (!sources.length) { showToast('⚠️ No enabled sources to check.', 'error'); return; }
  _nscChecking = true;
  const btn = document.getElementById('nscCheckAllBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking…'; }
  let done = 0, found = 0;
  for (const src of sources) {
    const prog = document.getElementById('nscProgress');
    if (prog) prog.textContent = `Checking ${done + 1} of ${sources.length} — ${src.org} (${src.name})…`;
    const status = await checkOneNewsSource(src, true);
    if (status === 'new') found++;
    done++;
  }
  _nscChecking = false;
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-rotate"></i> Check All Official Sources'; }
  const prog = document.getElementById('nscProgress');
  if (prog) prog.textContent = `Last run: checked ${done} sources — ${found} with possible new updates.`;
  renderNewsSourcesAdmin();
  showToast(found > 0 ? `🟢 Checked ${done} sources — ${found} may have new updates.` : `✅ Checked ${done} sources — no new updates found.`);
}
function addNewsSource() {
  const org = document.getElementById('nsc_org').value.trim();
  const name = document.getElementById('nsc_name').value.trim() || 'Main Website';
  const url = document.getElementById('nsc_url').value.trim();
  if (!org || !url) { showToast('⚠️ Organisation and URL are required.', 'error'); return; }
  if (!/^https?:\/\//i.test(url)) { showToast('⚠️ URL must start with http:// or https://', 'error'); return; }
  addData('newsSources', { org, name, url, category: 'custom', enabled: true, lastChecked: '', lastStatus: '', lastHash: '', lastNote: '' });
  document.getElementById('nsc_org').value = ''; document.getElementById('nsc_name').value = ''; document.getElementById('nsc_url').value = '';
  showToast('✅ Source added.');
  renderNewsSourcesAdmin();
}
function toggleNewsSourceEnabled(id) {
  const s = getData('newsSources').find(x => String(x.id) === String(id));
  if (s) updateData('newsSources', s.id, { enabled: s.enabled === false });
  renderNewsSourcesAdmin();
}
function deleteNewsSource(id) {
  if (!confirm('Remove this source? This does not affect any updates you have already published.')) return;
  const s = getData('newsSources').find(x => String(x.id) === String(id));
  if (s) deleteData('newsSources', s.id);
  renderNewsSourcesAdmin();
}
function nscCreateDraft(pendingId) {
  const p = getData('pendingUpdates').find(x => x.id === pendingId);
  if (!p) return;
  showAdminTab('update-add');
  resetUpdForm();
  let host = ''; try { host = new URL(p.sourceUrl).hostname; } catch (e) {}
  document.getElementById('up_title').value = p.sourceOrg + ' — new notice (edit this title)';
  document.getElementById('up_source').value = p.sourceUrl;
  document.getElementById('up_srctype').value = /(\.gov\.in|\.nic\.in|\.gov|\.ac\.in|\.edu\.in|\.res\.in)$/i.test(host) ? 'official' : 'other';
  document.getElementById('up_website').value = p.sourceUrl;
  showToast('📝 Draft started — open the source and fill in the real details, then Preview and Publish when ready.');
  updateData('pendingUpdates', p.id, { status: 'drafted' });
  renderNewsSourcesAdmin();
}
function nscIgnorePending(id) { updateData('pendingUpdates', id, { status: 'ignored' }); renderNewsSourcesAdmin(); }
function nscDeletePending(id) { deleteData('pendingUpdates', id); renderNewsSourcesAdmin(); }
function nscTimeAgo(iso) {
  if (!iso) return 'Never';
  const d = new Date(iso); if (isNaN(d)) return 'Never';
  const mins = Math.round((Date.now() - d) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + ' min ago';
  if (mins < 1440) return Math.round(mins / 60) + ' hr ago';
  return String(d.getDate()).padStart(2, '0') + ' ' + _MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}
function renderNewsSourcesAdmin() {
  fsStartListener('newsSources'); fsStartListener('pendingUpdates');
  const sources = getData('newsSources').slice().sort((a, b) => a.org.localeCompare(b.org) || a.name.localeCompare(b.name));
  const tbl = document.getElementById('nscSourcesTable');
  if (tbl) {
    tbl.innerHTML = sources.length ? sources.map(s => {
      const st = NSC_STATUS[s.lastStatus] || NSC_STATUS[''];
      return `<tr style="${s.enabled === false ? 'opacity:.5' : ''}">
        <td><strong>${_ue(s.org)}</strong>${s.category === 'custom' ? ' <span style="font-size:10px;color:var(--gray)">(custom)</span>' : ''}</td>
        <td>${_ue(s.name)}</td>
        <td style="max-width:220px;overflow-wrap:anywhere;font-size:12px"><a href="${_ue(s.url)}" target="_blank" rel="noopener">${_ue(s.url)}</a></td>
        <td style="white-space:nowrap;font-size:12.5px">${nscTimeAgo(s.lastChecked)}</td>
        <td style="white-space:nowrap" title="${_ue(s.lastNote || '')}">${st.icon} ${st.label}</td>
        <td style="white-space:nowrap">
          <button class="btn btn-outline btn-sm" title="Check now" onclick="checkOneNewsSourceById('${s.id}')"><i class="fas fa-rotate"></i></button>
          <button class="btn btn-outline btn-sm" title="Open source" onclick="window.open('${_ue(s.url)}','_blank')"><i class="fas fa-up-right-from-square"></i></button>
          <button class="btn btn-outline btn-sm" title="${s.enabled === false ? 'Enable' : 'Disable'}" onclick="toggleNewsSourceEnabled('${s.id}')"><i class="fas fa-power-off"></i></button>
          <button class="btn btn-danger btn-sm" title="Delete" onclick="deleteNewsSource('${s.id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
    }).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--gray)">No sources yet.</td></tr>';
  }
  const pending = getData('pendingUpdates').filter(p => p.status === 'open').sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));
  const pc = document.getElementById('nscPendingCount'); if (pc) pc.textContent = pending.length ? `(${pending.length})` : '';
  const ptbl = document.getElementById('nscPendingTable');
  if (ptbl) {
    ptbl.innerHTML = pending.length ? pending.map(p => `<tr>
      <td><strong>${_ue(p.sourceOrg)}</strong><br><span style="font-size:12px;color:var(--gray)">${_ue(p.sourceName)}</span></td>
      <td style="white-space:nowrap;font-size:12.5px">${nscTimeAgo(p.detectedAt)}</td>
      <td style="font-size:12.5px;max-width:280px">${_ue(p.note)}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-green btn-sm" onclick="nscCreateDraft(${p.id})"><i class="fas fa-file-pen"></i> Create Draft</button>
        <button class="btn btn-outline btn-sm" onclick="window.open('${_ue(p.sourceUrl)}','_blank')"><i class="fas fa-up-right-from-square"></i> Open Source</button>
        <button class="btn btn-outline btn-sm" onclick="nscIgnorePending(${p.id})">Ignore</button>
        <button class="btn btn-danger btn-sm" onclick="nscDeletePending(${p.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--gray)">No pending updates right now.</td></tr>';
  }
}
