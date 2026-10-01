// ================================================================
// navigation.js — page routing (showPage/activatePage), the mobile
// hamburger + desktop "More" dropdown, and admin-tab switching.
// ================================================================
let isAdminLoggedIn = false;
// Mobile hamburger menu — the nav links are hidden below 900px width and
// live inside this collapsible panel instead, opened/closed with the
// button next to the logo. Every nav link (via showPage) closes it again.
function toggleMobileNav() {
  const nav = document.getElementById('mainNav');
  const btn = document.getElementById('navToggleBtn');
  if (!nav || !btn) return;
  const isOpen = nav.classList.toggle('mobile-open');
  btn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
}
function closeMobileNav() {
  const nav = document.getElementById('mainNav');
  const btn = document.getElementById('navToggleBtn');
  if (!nav || !btn) return;
  nav.classList.remove('mobile-open');
  btn.innerHTML = '<i class="fas fa-bars"></i>';
}
function toggleNavMore(e) {
  e.stopPropagation();
  const li = document.getElementById('navMoreLi');
  const menu = document.getElementById('navMoreMenu');
  if (!li || !menu) return;
  const opening = !li.classList.contains('open');
  li.classList.toggle('open', opening);
  // On desktop the menu is position:fixed (so it isn't clipped by the pill
  // nav's overflow-x:auto scroller), so its screen position has to be set
  // from JS relative to the "More" trigger. On the <=900px hamburger panel
  // it's forced back to position:static by CSS and this is a no-op.
  if (opening && window.innerWidth > 900) {
    const rect = li.querySelector('.nav-more-toggle').getBoundingClientRect();
    const menuWidth = menu.offsetWidth || 208;
    let left = rect.right - menuWidth;
    if (left < 8) left = 8;
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.left = left + 'px';
  }
}
function closeNavMore() {
  const li = document.getElementById('navMoreLi');
  const menu = document.getElementById('navMoreMenu');
  if (li) li.classList.remove('open');
  if (menu) { menu.style.top = ''; menu.style.left = ''; }
}
// "Hobby & Language Classes" in the More menu jumps straight to Our Teachers
// pre-filtered to that category, reusing the page's own existing filter —
// no separate page/content to maintain.

// Deep links used by the standalone SEO pages (e.g. altheascholar.in/#find-tutor).
const HASH_PAGE_MAP = { '#find-tutor':'page-student-form', '#become-teacher':'page-teacher-form', '#study-material':'page-study',
  '#education-updates':'page-updates', '#entrance-exams':'page-entrance', '#our-teachers':'page-teachers', '#blog':'page-blog', '#contact':'page-contact' };
function openPageFromHash() {
  const um = /^#update-(\d+)/.exec(location.hash), bm = /^#blog-(\d+)/.exec(location.hash);
  if (um) { openUpdate(Number(um[1]), false); return; }
  if (bm) { openBlogPage(Number(bm[1]), false); return; }
  const id = HASH_PAGE_MAP[location.hash];
  if (id && document.getElementById(id) && typeof showPage === 'function') showPage(id);
}
function showHobbyLanguageClasses() {
  showPage('page-teachers');
  const sel = document.getElementById('teacherProfileFilter');
  if (sel) { sel.value = 'hobby'; renderPublicTeacherProfiles(); }
}
function showPage(id) {
  // Push a history entry per page-switch so the phone/browser Back button
  // steps back through the site's own pages (Home -> Study Material -> ...)
  // instead of immediately leaving the site to whatever was open before it.
  if (!(window.history.state && window.history.state.page === id)) {
    history.pushState({ page: id }, '', '#' + id.replace('page-', ''));
  }
  activatePage(id);
}
function activatePage(id) {
  document.querySelectorAll('.page-inner').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('nav ul li a').forEach(a => a.classList.remove('active'));
  const map = { 'page-home': 'nav-home', 'page-study': 'nav-study', 'page-student-form': 'nav-find-tutor', 'page-updates': 'nav-updates', 'page-teacher-form': 'nav-teacher-form', 'page-entrance': 'nav-entrance', 'page-teachers': 'nav-teachers', 'page-blog': 'nav-blog' };
  if (map[id]) { const el = document.getElementById(map[id]); if (el) el.classList.add('active'); }
  window.scrollTo(0, 0);
  closeMobileNav();
  closeNavMore();
  if (id !== 'page-update-detail' && id !== 'page-blog-detail') resetPageSeo();
  if (id === 'page-admin' && !isAdminLoggedIn) { openAdminLogin(); return; }
  if (id === 'page-admin' && isAdminLoggedIn) renderAll();
  if (id === 'page-study') { smInitClassDropdown(); renderNcertBooksPublic(); renderStudyMoreResources(); renderSmHeroArt(); }
  if (id === 'page-entrance') renderEntranceExamGrid();
  if (id === 'page-home') { renderLeadSidebar(); renderCities('all'); renderHomepageContent(); renderHomepageAnnouncements(); renderHomepageTestimonials(); renderBlogList(); renderHomepageTeacherPreview(); }
  if (id === 'page-teachers') { renderPublicTeacherProfiles(); }
  if (id === 'page-premium-leads') { renderPublicPremiumLeads(); }
  if (id === 'page-teacher-form') { renderPaymentSettings(); renderRegSide('teacher'); }
  if (id === 'page-student-form') { renderStudentFormNotice(); renderRegSide('student'); }
  if (id === 'page-blog') { renderBlogList(); }
  if (id === 'page-blog-detail') { renderBlogDetail(); }
  if (id === 'page-updates') { renderUpdatesPage(); }
  if (id === 'page-update-detail') { renderUpdateDetail(); }
  if (id === 'page-pdf-viewer') { renderPdfViewerPage(); }
}
function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('admin-' + tab);
  if (target) target.classList.add('active');
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.toggle('active-tab', btn.dataset.tab === tab));
  const activeBtn = document.querySelector('.admin-tab-btn[data-tab="' + tab + '"]');
  if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  if (tab === 'homepage') populateHomepageAdminForm();
  if (tab === 'community') renderAdminVisitorPosts();
  if (tab === 'premium') { renderAdminPremium(); showPremiumSubTab('pending'); populatePaymentSettingsForm(); }
  if (tab === 'teacher-profiles') renderAdminTeacherProfiles();
  if (tab === 'update-add') { initUpdChips(); if (editingAnnouncementId === null) resetUpdForm(); }
  if (tab === 'update-all') renderAdminAnnouncements();
  if (tab === 'news-checker') renderNewsSourcesAdmin();
  if (tab === 'floatwidgets') populateFloatWidgetsForm();
  toggleAdmDrawer(false);
  if (tab === 'feedback') renderAdminFeedback();
  if (tab === 'blog') renderAdminBlog();
  if (tab === 'formeditor') { renderFormEditor(); populatePolicyEditor(); populateStudentFormNoticeEditor(); populateRegSideForm('teacher'); populateRegSideForm('student'); }
  if (tab === 'chatbot') renderAdminChatbotFaqs();
  if (tab === 'site-faq') renderAdminSiteFaqs();
  if (tab === 'seo-pages') { loadSeoPageIntoForm(); populateSeoCitiesForm(); }
  if (tab === 'festival') populateFestivalPopupForm();
  if (tab === 'branding') populateBrandingForm();
  if (tab === 'ncert-books') renderNcertBooksAdmin();
  if (tab === 'study-content') { populateSmHeroForm(); }
  if (tab === 'study-extras') { initStudyExtraChips(); renderAdminStudyExtras(); }
}
// ================================================================
// Premium Teacher Membership — verification, activation, premium leads
// ================================================================
function showPremiumSubTab(name) {
  document.querySelectorAll('.premium-sub-tab').forEach(el => el.style.display = 'none');
  const el = document.getElementById('premium-sub-' + name);
  if (el) el.style.display = 'block';
  if (name === 'leads') renderAdminPremiumLeads();
}
// ================================================================
// Admin side-menu helpers
// ================================================================
function toggleAdmDrawer(open) {
  const bar = document.getElementById('adminTabBar'), bd = document.getElementById('admBackdrop');
  if (!bar) return;
  const o = open === undefined ? !bar.classList.contains('open') : open;
  bar.classList.toggle('open', o); if (bd) bd.classList.toggle('show', o);
}
function toggleAdmGroup(btn) { btn.classList.toggle('open'); btn.nextElementSibling.classList.toggle('open'); }
// Desktop-only collapse/hide for the admin sidebar (same pull-tab pattern
// as the LEADS side panel) so admin can free up screen width when not
// switching tabs.
function toggleAdmSidebar() {
  const bar = document.getElementById('adminTabBar'), tab = document.getElementById('admCollapseTab');
  const collapsed = bar.classList.toggle('adm-collapsed');
  try { localStorage.setItem('admSidebarCollapsed', collapsed ? '1' : '0'); } catch (e) {}
  tab.innerHTML = collapsed ? '<i class="fas fa-bars"></i> MENU' : '<i class="fas fa-chevron-left"></i> HIDE';
}
// ================================================================
// "Explore" on Home/Online Tuition cards — opens the full Student
// Registration form directly (with tuition mode pre-selected),
// instead of a short popup, so visitors go through the real
// registration process and understand what's involved.
// ================================================================
function openQuickExplore(mode) {
  showPage('page-student-form');
  const modeSelect = document.getElementById('s_mode');
  if (modeSelect) {
    const match = Array.from(modeSelect.options).find(o => o.value.toLowerCase().includes(mode.toLowerCase()) || mode.toLowerCase().includes(o.value.toLowerCase()));
    if (match) modeSelect.value = match.value;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
