// ================================================================
// main.js — public-site glue (homepage rendering, registration forms,
// leads sidebar, chatbot widget, festival popup, branding apply) plus
// the app's bootstrap code at the bottom, which must run after every
// other script below has loaded (that ordering is why this file is
// listed last in index.html).
// ================================================================
function getHomepageContent() {
  fsSettingsListen('homepageContent', () => { renderHomepageContent(); });
  const saved = fsSettingsGet('homepageContent') || {};
  return { ...HOMEPAGE_DEFAULTS, ...saved };
}
function renderHomepageContent() {
  const c = getHomepageContent();
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el) el.href = val; };

  setText('hp-eyebrow-text', c.eyebrow);
  const heading = document.getElementById('hp-heading');
  if (heading) heading.innerHTML = `${c.h1_line1}<br>${c.h1_line2}<br><span class="accent">${c.h1_accent}</span>`;
  setText('hp-lead', c.lead);
  const heroImg = document.getElementById('hp-hero-img');
  if (heroImg) heroImg.src = c.hero_img;

  setText('hp-stat1-main', c.stat1_main); setText('hp-stat1-sub', c.stat1_sub);
  setText('hp-stat2-num', c.stat2_num); setText('hp-stat2-lbl', c.stat2_lbl);
  setText('hp-stat3-num', c.stat3_num); setText('hp-stat3-lbl', c.stat3_lbl);
  setText('hp-stat4-main', c.stat4_main); setText('hp-stat4-sub', c.stat4_sub);
  setText('hp-stat5-num', c.stat5_num); setText('hp-stat5-lbl', c.stat5_lbl);
  setText('hp-stat6-num', c.stat6_num); setText('hp-stat6-lbl', c.stat6_lbl);

  setText('hp-offer1-title', c.offer1_title); setText('hp-offer1-desc', c.offer1_desc);
  setText('hp-offer2-title', c.offer2_title); setText('hp-offer2-desc', c.offer2_desc);
  setText('hp-offer3-title', c.offer3_title); setText('hp-offer3-desc', c.offer3_desc);
  setText('hp-offer4-title', c.offer4_title); setText('hp-offer4-desc', c.offer4_desc);
  setText('hp-offer5-title', c.offer5_title); setText('hp-offer5-desc', c.offer5_desc);

  const offerBanner = document.getElementById('hpOfferBannerImg');
  if (offerBanner) {
    if (c.offer_banner_img) { offerBanner.src = c.offer_banner_img; offerBanner.closest('.offer-banner-wrap').style.display = 'block'; }
    else { offerBanner.closest('.offer-banner-wrap').style.display = 'none'; }
  }

  setText('hp-offer6-title', c.offer6_title); setText('hp-offer6-desc', c.offer6_desc);
  setText('hp-offer7-title', c.offer7_title); setText('hp-offer7-desc', c.offer7_desc);
  setText('hp-offer8-title', c.offer8_title); setText('hp-offer8-desc', c.offer8_desc);

  const teacherList = document.getElementById('hp-panel-teacher-list');
  if (teacherList) teacherList.innerHTML = c.panel_teacher.split('\n').filter(x => x.trim()).map(line => `<li><i class="fas fa-check-circle"></i> ${line}</li>`).join('');
  const whyList = document.getElementById('hp-panel-why-list');
  if (whyList) whyList.innerHTML = c.panel_why.split('\n').filter(x => x.trim()).map(line => `<li><i class="fas fa-check-circle"></i> ${line}</li>`).join('');
  const parentList = document.getElementById('hp-panel-parent-list');
  if (parentList) parentList.innerHTML = c.panel_parent.split('\n').filter(x => x.trim()).map((line, i) => `<li class="step"><span class="step-num">${i+1}</span> ${line}</li>`).join('');

  setText('hp-badge1-t', c.badge1_t); setText('hp-badge1-s', c.badge1_s);
  setText('hp-badge2-t', c.badge2_t); setText('hp-badge2-s', c.badge2_s);
  setText('hp-badge3-t', c.badge3_t); setText('hp-badge3-s', c.badge3_s);
  setText('hp-badge4-t', c.badge4_t); setText('hp-badge4-s', c.badge4_s);
  const teacherImg = document.getElementById('hp-teacher-img'); if (teacherImg) teacherImg.src = c.teacher_img;
  const parentImg = document.getElementById('hp-parent-img'); if (parentImg) parentImg.src = c.parent_img;
  setText('hp-cities-heading', c.cities_heading);
  setText('hp-why-heading', c.why_heading);
  window._whyMoreContent = c.why_more;

  const waLink = `https://wa.me/${c.whatsapp}`;
  const telLink = `tel:+${c.whatsapp}`;
  setText('hp-contact-phone-link', c.phone); setHref('hp-contact-phone-link', telLink);
  setText('hp-contact-whatsapp-link', 'WhatsApp: ' + c.phone); setHref('hp-contact-whatsapp-link', waLink);
  setText('hp-contact-email', c.email);
  setText('hp-header-phone-link', c.phone); setHref('hp-header-phone-link', telLink);
  setText('hp-header-email', c.email);
  setText('hp-header-hours', c.contact_hours);
  setHref('hp-contact-whatsapp-btn', waLink);
  setHref('hp-contact-call-btn', telLink);
  setText('hp-contact-intro', c.contact_intro);
  const addrRow = document.getElementById('hp-contact-address-row');
  if (addrRow) { addrRow.style.display = c.contact_address ? 'block' : 'none'; setText('hp-contact-address', c.contact_address); }
  const hoursRow = document.getElementById('hp-contact-hours-row');
  if (hoursRow) { hoursRow.style.display = c.contact_hours ? 'block' : 'none'; setText('hp-contact-hours', c.contact_hours); }
  const socialRow = document.getElementById('hp-contact-social-row');
  if (socialRow) {
    const socials = [
      c.contact_instagram ? { url: c.contact_instagram, icon: 'fa-instagram', color: '#E1306C' } : null,
      c.contact_facebook ? { url: c.contact_facebook, icon: 'fa-facebook', color: '#1877F2' } : null,
      c.contact_youtube ? { url: c.contact_youtube, icon: 'fa-youtube', color: '#FF0000' } : null
    ].filter(Boolean);
    socialRow.innerHTML = socials.map(s => `<a href="${s.url}" target="_blank" style="width:42px;height:42px;border-radius:50%;background:${s.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;text-decoration:none;"><i class="fab ${s.icon}"></i></a>`).join('');
  }
  setText('hp-footer-phone', c.phone);
  setText('hp-footer-email', c.email);

  applyImageLayout(c);
}
function applyHeroFrameWidth() {
  const heroVisual = document.querySelector('.hero-visual');
  if (!heroVisual) return;
  const pct = window._heroImgWPct || HOMEPAGE_DEFAULTS.hero_img_w;
  // Below 900px the hero stacks into a single column, so the visual should
  // always span the full width of the page instead of the admin-set %.
  heroVisual.style.width = (window.innerWidth <= 900) ? '100%' : (pct + '%');
}
function applyImageLayout(c) {
  const cityBannerImg = document.getElementById('cityBannerImg');
  if (cityBannerImg && c.city_banner_img) {
    cityBannerImg.src = c.city_banner_img;
  }
  const heroFrame = document.querySelector('.hero-photo-frame');
  const heroImg = document.getElementById('hp-hero-img');
  if (heroFrame && heroImg) {
    window._heroImgWPct = c.hero_img_w || HOMEPAGE_DEFAULTS.hero_img_w;
    applyHeroFrameWidth();
    const frameW = c.hero_frame_w || HOMEPAGE_DEFAULTS.hero_frame_w;
    const frameX = c.hero_frame_x !== undefined ? c.hero_frame_x : HOMEPAGE_DEFAULTS.hero_frame_x;
    const frameY = c.hero_frame_y !== undefined ? c.hero_frame_y : HOMEPAGE_DEFAULTS.hero_frame_y;
    heroFrame.style.width = frameW + '%';
    heroFrame.style.margin = `${frameY}% ${frameX}% 0 auto`;
    heroFrame.style.zIndex = c.hero_photo_z || HOMEPAGE_DEFAULTS.hero_photo_z;
    heroFrame.style.borderRadius = HP_SHAPE_MAP[c.hero_img_shape] || HP_SHAPE_MAP.arch;
    heroImg.style.objectFit = c.hero_img_fit || 'cover';
    heroImg.style.opacity = (parseInt(c.hero_img_opacity || 100, 10) / 100);
    heroImg.style.transform = `translate(${c.hero_img_x || 0}px, ${c.hero_img_y || 0}px) rotate(${c.hero_img_rot || 0}deg)`;
  }
  const badge = document.querySelector('.badge-card');
  if (badge) badge.style.zIndex = c.hero_badge_z || HOMEPAGE_DEFAULTS.hero_badge_z;
  const heroTop = document.querySelector('.hero-top');
  if (heroTop) { heroTop.style.position = 'relative'; heroTop.style.zIndex = c.hero_text_z || HOMEPAGE_DEFAULTS.hero_text_z; }

  applyPanelImgLayout('teacher', c);
  applyPanelImgLayout('parent', c);
}
function applyPanelImgLayout(name, c) {
  const img = document.getElementById('hp-' + name + '-img');
  const wrap = img ? img.closest('.panel-img') : null;
  if (!img || !wrap) return;
  wrap.style.width = (c[name + '_img_w'] || '100') + '%';
  wrap.style.maxWidth = '100%';
  wrap.style.margin = '0 auto 18px';
  wrap.style.height = (c[name + '_img_h'] || '160') + 'px';
  wrap.style.borderRadius = HP_SHAPE_MAP[c[name + '_img_shape']] || HP_SHAPE_MAP.rounded;
  img.style.objectFit = c[name + '_img_fit'] || 'cover';
  img.style.opacity = (parseInt(c[name + '_img_opacity'] || 100, 10) / 100);
  img.style.transform = `translate(${c[name + '_img_x'] || 0}px, ${c[name + '_img_y'] || 0}px) rotate(${c[name + '_img_rot'] || 0}deg)`;
}
function renderCities(filter) {
  const grid = document.getElementById('cityGrid');
  if (!grid) return;
  let list = citiesList;
  if (filter === 'capital') list = ["New Delhi","Chandigarh","Srinagar","Shimla","Dehradun","Jaipur","Lucknow","Patna","Ranchi","Raipur","Bhopal","Mumbai","Panaji","Gandhinagar","Bengaluru","Chennai","Hyderabad","Thiruvananthapuram","Bhubaneswar","Kolkata","Guwahati","Itanagar","Kohima","Imphal","Aizawl","Agartala","Shillong","Gangtok","Jammu","Leh","Daman","Port Blair","Puducherry"];
  else if (filter === 'edu') list = ["New Delhi","Mumbai","Bengaluru","Chennai","Hyderabad","Pune","Kolkata","Ahmedabad","Varanasi","Coimbatore","Jaipur","Lucknow","Indore","Bhopal","Patna"];
  else if (filter === 'metro') list = ["New Delhi","Mumbai","Kolkata","Bengaluru","Chennai","Hyderabad","Ahmedabad","Pune","Surat"];
  grid.innerHTML = list.map(c => `<span class="c"><i class="fas fa-map-pin"></i> ${c}</span>`).join('');
}
function seedDummyContent() {
  renderHomepageAnnouncements();
  renderHomepageTestimonials();
  renderPaymentSettings();
  applyFormFieldSettings();
  renderPolicyBoxes();
  renderStudentFormNotice();
}
function onPlanChange() {
  const isPremium = document.getElementById('t_plan_premium').checked;
  document.getElementById('planCardBasic').classList.toggle('selected', !isPremium);
  document.getElementById('planCardPremium').classList.toggle('selected', isPremium);
  document.getElementById('premiumPaymentBox').classList.toggle('show', isPremium);
  document.getElementById('t_premium_utr').required = isPremium;
  document.getElementById('t_premium_screenshot').required = isPremium;
}
// Generates a short, unique, human-readable registration ID, e.g. ALT-BT-260824-4821
function generateRegId(prefix) {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${datePart}-${rand}`;
}
async function submitTeacherForm(e) {
  e.preventDefault();
  const MAX_SIZE = 4 * 1024 * 1024; // 4MB safe limit per file
  const photoFile = document.getElementById('t_photo').files[0];
  const aadhaarFile = document.getElementById('t_aadhaar').files[0];
  const resumeFile = document.getElementById('t_resume').files[0];
  const isPremium = document.getElementById('t_plan_premium').checked;
  const utr = document.getElementById('t_premium_utr').value.trim();
  const screenshotFile = document.getElementById('t_premium_screenshot').files[0];
  if (isPremium && (!utr || !screenshotFile)) {
    showToast('⚠️ Premium requires UTR/Transaction ID and Payment Screenshot!', 'error');
    return;
  }
  for (const f of [photoFile, aadhaarFile, resumeFile, screenshotFile]) {
    if (f && f.size > MAX_SIZE) {
      showToast('⚠️ Each file must be under 4MB!', 'error');
      return;
    }
  }
  let photoData = null, aadhaarData = null, resumeData = null, screenshotData = null;
  try {
    showToast('⏳ Uploading documents...');
    if (photoFile) photoData = await uploadToCloudinary(photoFile, 'image', 'althea-scholar/teachers/photos');
    if (aadhaarFile) aadhaarData = await uploadToCloudinary(aadhaarFile, 'auto', 'althea-scholar/teachers/documents');
    if (resumeFile) resumeData = await uploadToCloudinary(resumeFile, 'auto', 'althea-scholar/teachers/documents');
    if (screenshotFile) screenshotData = await uploadToCloudinary(screenshotFile, 'image', 'althea-scholar/payments');
  } catch (err) {
    showToast('⚠️ Could not upload file(s) — check your internet connection and try again.', 'error');
    return;
  }
  const regId = generateRegId(isPremium ? 'ALT-PT' : 'ALT-BT');
  const data = {
    regId: regId,
    name: document.getElementById('t_name').value,
    gender: document.getElementById('t_gender').value,
    dob: document.getElementById('t_dob').value,
    mobile: document.getElementById('t_mobile').value,
    whatsapp: document.getElementById('t_whatsapp').value,
    email: document.getElementById('t_email').value,
    city: document.getElementById('t_city').value,
    state: document.getElementById('t_state').value,
    address: document.getElementById('t_address').value,
    qualification: document.getElementById('t_qualification').value,
    degree: document.getElementById('t_degree').value,
    university: document.getElementById('t_university').value,
    experience: document.getElementById('t_experience').value,
    institution: document.getElementById('t_institution').value,
    professionalStatus: document.getElementById('t_professional_status').value,
    teachAcademic: document.getElementById('t_teach_academic').checked,
    teachHobby: document.getElementById('t_teach_hobby').checked,
    teachLanguage: document.getElementById('t_teach_language').checked,
    subjects: document.getElementById('t_subjects').value,
    hobbies: document.getElementById('t_hobbies').value,
    languages: document.getElementById('t_languages').value,
    classes: document.getElementById('t_classes').value,
    board: document.getElementById('t_board').value,
    mode: document.getElementById('t_mode').value,
    prefArea: document.getElementById('t_pref_area').value,
    prefDays: document.getElementById('t_pref_days').value,
    prefTime: document.getElementById('t_pref_time').value,
    classType: document.getElementById('t_class_type').value,
    travelDistance: document.getElementById('t_travel_distance').value,
    fee: document.getElementById('t_fee').value,
    feePerHour: document.getElementById('t_fee_per_hour').value,
    demo: document.getElementById('t_demo').value,
    minClasses: document.getElementById('t_min_classes').value,
    photo: photoFile ? photoFile.name : null,
    photoData: photoData,
    aadhaar: aadhaarFile ? aadhaarFile.name : null,
    aadhaarData: aadhaarData,
    resume: resumeFile ? resumeFile.name : null,
    resumeData: resumeData,
    status: 'Pending', type: 'teacher', registeredAt: new Date().toISOString(),
    plan: isPremium ? 'premium' : 'basic',
    premiumStatus: isPremium ? 'Payment Verification Pending' : 'none',
    premiumUtr: isPremium ? utr : null,
    premiumScreenshot: screenshotFile ? screenshotFile.name : null,
    premiumScreenshotData: screenshotData,
    premiumAmount: isPremium ? 999 : null,
    premiumSubmittedAt: isPremium ? new Date().toISOString() : null,
    premiumActivatedAt: null,
    premiumExpiryAt: null,
    premiumRejectReason: null
  };
  let saved;
  try {
    saved = addData('teachers', data);
  } catch (err) {
    showToast('⚠️ Storage full! Try smaller files.', 'error');
    return;
  }
  if (!saved) return;
  document.getElementById('teacherForm').style.display = 'none';
  document.getElementById('teacherSuccess').style.display = 'block';
  document.getElementById('teacherRegIdDisplay').textContent = regId;
  document.getElementById('teacherSuccessMsg').textContent = isPremium
    ? 'Your Premium payment is submitted — status: Payment Verification Pending. Our team will verify and activate your Premium badge shortly. Please save your ID for future reference.'
    : 'Our team will verify and connect on WhatsApp. Please save your ID for future reference.';
  showToast(isPremium ? '✅ Registered! Premium payment submitted for verification.' : '✅ Teacher registered!');
  renderAll();
}
function toggleTeacherTeachRows() {
  document.getElementById('t_academic_row').style.display = document.getElementById('t_teach_academic').checked ? '' : 'none';
  document.getElementById('t_hobby_row').style.display = document.getElementById('t_teach_hobby').checked ? '' : 'none';
  document.getElementById('t_language_row').style.display = document.getElementById('t_teach_language').checked ? '' : 'none';
}
function studentBlockHtml(i) {
  return `<div class="student-block" id="student-block-${i}">
    ${i > 1 ? `<button type="button" class="remove-student" onclick="removeStudentBlock(${i})"><i class="fas fa-times"></i> Remove</button>` : ''}
    <div class="form-row"><label>Student Name *</label><input type="text" class="s_name" required></div>
    <div class="form-row"><label>Age *</label><input type="number" min="2" max="70" class="s_age" required></div>
    <div class="form-row"><label>Class / Level *</label><select class="s_class" required><option value="">Select Class / Level</option>${CLASS_OPTIONS.map(c => `<option>${c}</option>`).join('')}</select></div>
    <div class="form-row"><label>School Name</label><input type="text" class="s_school"></div>
    <div class="form-row"><label>Board *</label><select class="s_board" required><option>CBSE</option><option>ICSE</option><option>State Board</option><option>University / College</option><option>Other</option></select></div>
    <div class="form-row"><label>What kind of tuition do you need? *</label>
      <div class="check-inline-group">
        <label><input type="checkbox" class="s_need_academic" checked onchange="toggleStudentNeedRows(this)"> Academic Subjects</label>
        <label><input type="checkbox" class="s_need_hobby" onchange="toggleStudentNeedRows(this)"> Hobby / Skill Classes</label>
        <label><input type="checkbox" class="s_need_language" onchange="toggleStudentNeedRows(this)"> Language Classes</label>
      </div>
    </div>
    <div class="form-row s_academic_row"><label>Academic Subject(s)</label><input type="text" class="s_subjects" placeholder="e.g. Maths, Science, English"></div>
    <div class="form-row s_hobby_row" style="display:none;"><label>Hobby / Skill (e.g. Dance, Singing, Guitar, Piano, Chess)</label><input type="text" class="s_hobbies" placeholder="e.g. Bharatanatyam, Guitar, Chess"></div>
    <div class="form-row s_language_row" style="display:none;"><label>Language(s) Interested In</label><input type="text" class="s_languages" placeholder="e.g. Spanish, French, German, Sanskrit"></div>
    <div class="form-row"><label>Current Academic Level</label><select class="s_level"><option>Average</option><option>Good</option><option>Excellent</option><option>Needs Help</option></select></div>
  </div>`;
}
function toggleStudentNeedRows(el) {
  const block = el.closest('.student-block');
  block.querySelector('.s_academic_row').style.display = block.querySelector('.s_need_academic').checked ? '' : 'none';
  block.querySelector('.s_hobby_row').style.display = block.querySelector('.s_need_hobby').checked ? '' : 'none';
  block.querySelector('.s_language_row').style.display = block.querySelector('.s_need_language').checked ? '' : 'none';
}
function renderStudentBlocks() {
  const n = parseInt(document.getElementById('numStudents').value) || 1;
  const wrap = document.getElementById('studentBlocks');
  wrap.innerHTML = '';
  const count = n === 4 ? 4 : n;
  for (let i = 1; i <= count; i++) wrap.insertAdjacentHTML('beforeend', studentBlockHtml(i));
  if (n === 4) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'add-student-btn';
    btn.innerHTML = '<i class="fas fa-plus"></i> Add Another Student';
    btn.onclick = addMoreStudent;
    wrap.appendChild(btn);
  }
}
function addMoreStudent() {
  extraStudentCount++;
  const wrap = document.getElementById('studentBlocks');
  const btn = wrap.querySelector('.add-student-btn');
  const div = document.createElement('div');
  div.innerHTML = studentBlockHtml(extraStudentCount);
  wrap.insertBefore(div.firstChild, btn);
}
function removeStudentBlock(i) { const el = document.getElementById('student-block-' + i); if (el) el.remove(); }
function submitStudentForm(e) {
  e.preventDefault();
  const students = [];
  document.querySelectorAll('.student-block').forEach(block => {
    students.push({
      name: block.querySelector('.s_name').value,
      age: block.querySelector('.s_age').value,
      class: block.querySelector('.s_class').value,
      school: block.querySelector('.s_school').value,
      board: block.querySelector('.s_board').value,
      needAcademic: block.querySelector('.s_need_academic').checked,
      needHobby: block.querySelector('.s_need_hobby').checked,
      needLanguage: block.querySelector('.s_need_language').checked,
      subjects: block.querySelector('.s_subjects').value,
      hobbies: block.querySelector('.s_hobbies').value,
      languages: block.querySelector('.s_languages').value,
      level: block.querySelector('.s_level').value
    });
  });
  const regId = generateRegId('ALT-ST');
  const data = {
    regId: regId,
    parent: document.getElementById('s_parent').value,
    mobile: document.getElementById('s_mobile').value,
    whatsapp: document.getElementById('s_whatsapp').value,
    email: document.getElementById('s_email').value,
    city: document.getElementById('s_city').value,
    state: document.getElementById('s_state').value,
    address: document.getElementById('s_address').value,
    mode: document.getElementById('s_mode').value,
    days: document.getElementById('s_days').value,
    time: document.getElementById('s_time').value,
    classesPerWeek: document.getElementById('s_classes_per_week').value,
    budget: document.getElementById('s_budget').value,
    prefGender: document.getElementById('s_pref_gender').value,
    prefLanguage: document.getElementById('s_pref_language').value,
    specific: document.getElementById('s_specific').value,
    students: students,
    status: 'New', type: 'student', registeredAt: new Date().toISOString()
  };
  const saved = addData('students', data);
  if (!saved) return;
  document.getElementById('studentForm').style.display = 'none';
  document.getElementById('studentSuccess').style.display = 'block';
  document.getElementById('studentRegIdDisplay').textContent = regId;
  showToast('✅ Student requirement submitted!');
  renderAll();
}
function renderLeadSidebar() {
  const leads = getData('leads').filter(l => l.status !== 'Closed' && l.visible !== false);
  const body = document.getElementById('leadBody');
  if (!body) return;
  body.innerHTML = leads.length === 0 ? '<p style="text-align:center;color:var(--gray);padding:40px 0;">No open leads</p>' :
    leads.map(l => `
    <div class="lead-card status-${l.status.toLowerCase()}">
      <div class="top-row"><span class="name">${l.name}</span><span class="lead-id">#${l.id}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span class="lead-tag tag-${l.status.toLowerCase()}">${l.status}</span>
        <span class="pref"><i class="fas fa-user"></i> ${l.pref || 'Any'}</span>
      </div>
      <div class="meta"><i class="fas fa-graduation-cap"></i> ${l.cls} — ${l.subj}</div>
      <div class="meta"><i class="fas fa-map-marker-alt"></i> ${l.city || 'N/A'}</div>
      <div class="meta"><i class="fas fa-laptop"></i> ${l.mode}</div>
      <div class="meta"><i class="fas fa-calendar-week"></i> ${l.daysPerWeek || 'N/A'} | ${l.hoursPerDay || 'N/A'}/day</div>
      <div class="meta"><i class="fas fa-clock"></i> ${l.timeSlot || 'Any Time'}</div>
      ${l.specificDays && l.specificDays !== 'Not Specified' ? `<div class="meta"><i class="fas fa-calendar-alt"></i> ${l.specificDays}</div>` : ''}
      <div class="budget">${l.budget || 'Budget not specified'}</div>
      <a href="https://wa.me/${getHomepageContent().whatsapp}?text=Hi%20Althea%20Scholar%2C%20I%20am%20a%20registered%20teacher%20and%20interested%20in%20Lead%20%23${l.id}%20for%20${l.cls}%20%7C%20${l.subj}%20%7C%20${l.city}" target="_blank" class="whatsapp-btn">
        <i class="fab fa-whatsapp"></i> Interested — Lead #${l.id}
      </a>
    </div>
  `).join('');
}
function toggleLeads(open) {
  document.getElementById('leadSidebar').classList.toggle('open', open);
  document.getElementById('leadOverlay').classList.toggle('show', open);
  if (open) renderLeadSidebar();
}
// Scrolls a horizontal-scroll row (Teachers / Testimonials / Premium
// Leads / Live Leads) one card's width left or right — used by the
// arrow buttons next to each of those sections.
function scrollRow(id, dir) {
  const el = document.getElementById(id);
  if (!el || !el.firstElementChild) return;
  const amount = el.firstElementChild.getBoundingClientRect().width + 14;
  el.scrollBy({ left: dir * amount, behavior: 'smooth' });
}
function autoCreateTeacherProfile(teacherId) {
  const t = getData('teachers').find(x => x.id === teacherId);
  if (!t) return;
  if (getData('teacherProfiles').some(p => p.sourceTeacherId === teacherId)) return; // already linked
  const category = t.teachAcademic ? 'academic' : (t.teachHobby ? 'hobby' : (t.teachLanguage ? 'language' : 'academic'));
  const expertise = [t.subjects, t.hobbies, t.languages].filter(Boolean).join(', ');
  addData('teacherProfiles', {
    sourceTeacherId: teacherId,
    name: t.name || '',
    qualification: [t.degree, t.qualification].filter(Boolean).join(', '),
    experience: t.experience || '',
    location: t.city || '',
    expertise: expertise,
    fee: t.feePerHour ? `₹${t.feePerHour}/hr` : (t.fee || ''),
    plan: t.plan || 'basic',
    medal: 'none',
    category: category,
    bio: '',
    rating: 0,
    reviewCount: 0,
    photo: t.photoData || '',
    visible: true
  });
  showToast('✅ Teacher approved — profile auto-added to Teacher Profiles (edit, add photo, or hide it anytime from there).');
}
function premiumPillClass(status) {
  if (status === 'Payment Verification Pending') return 'ps-pending';
  if (status === 'Premium Active') return 'ps-active';
  if (status === 'Rejected') return 'ps-rejected';
  if (status === 'Expired') return 'ps-expired';
  return 'ps-none';
}
// Turns a parent's requirement into a real Live Lead or Premium Lead (one
// per child student in the submission) — auto-filled from what they
// entered, then fully editable/removable from the Leads / Premium Leads
// admin tabs afterwards, same as any other entry there.
function pushStudentToLead(studentId, target) {
  const s = getData('students').find(x => x.id === studentId);
  if (!s) return;
  const children = (s.students && s.students.length) ? s.students : [{ class: '', subjects: '', hobbies: '', languages: '' }];
  children.forEach(child => {
    const subject = child.subjects || child.hobbies || child.languages || 'General';
    if (target === 'premium') {
      addData('premiumLeads', {
        name: s.parent || '', class: child.class || '', subject: subject, board: child.board || '', location: s.city || '',
        tuitionType: s.mode || 'Home Tuition', timing: s.time || '', days: s.days || '',
        budget: s.budget || '', requirement: s.specific || '',
        expiry: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
        status: 'Active', applications: 0, createdAt: new Date().toISOString(), sourceStudentId: studentId
      });
    } else {
      addData('leads', {
        name: s.parent || '', status: 'New', pref: s.prefGender || 'Any', cls: child.class || '', subj: subject,
        city: s.city || '', mode: s.mode || 'Home Tuition', daysPerWeek: s.classesPerWeek || '',
        hoursPerDay: '', timeSlot: s.time || '', specificDays: s.days || '', budget: s.budget || '',
        type: 'lead', createdAt: new Date().toISOString(), sourceStudentId: studentId
      });
    }
  });
  renderLeadSidebar();
  showToast(`✅ Added to ${target === 'premium' ? 'Premium' : 'Live Tuition'} Leads — edit anytime from that tab.`);
}
function updateStats() {
  document.getElementById('statTeachers').textContent = getData('teachers').length;
  document.getElementById('statStudents').textContent = getData('students').length;
  document.getElementById('statLeads').textContent = getData('leads').length;
  document.getElementById('statContent').textContent = getData('studyContent').length + getData('entranceContent').length + getData('studyExtras').length;
}
function renderAll() {
  if (!isAdminLoggedIn) return;
  renderAdminTeachers();
  renderAdminStudents();
  renderAdminLeads();
  renderAdminContent();
  renderAdminStudyExtras();
  renderAdminEntrance();
  renderAdminPremium();
  renderAdminAnnouncements();
  renderAdminFeedback();
  renderAdminTeacherProfiles();
  updateStats();
  renderLeadSidebar();
}
// Re-renders every visitor-facing (non-admin) section that pulls its data
// from a Firestore array listener. This has to run for EVERY visitor, not
// only a logged-in admin — unlike renderAll() above. Without this, a
// section like "Latest Announcements", "Meet Our Teachers" or "What
// Parents Say" would show its loading skeleton the moment the page opens
// (correct, since Firestore hasn't replied yet), but then stay stuck on
// that skeleton forever for an ordinary visitor once the real data
// arrives a moment later — because the only place that re-render used to
// get triggered from was renderAll(), which does nothing at all unless
// isAdminLoggedIn is true.
function renderPublicAll() {
  if (typeof renderHomepageAnnouncements === 'function') renderHomepageAnnouncements();
  if (typeof renderHomepageTeacherPreview === 'function') renderHomepageTeacherPreview();
  if (typeof renderHomepageTestimonials === 'function') renderHomepageTestimonials();
  if (typeof renderPublicTeacherProfiles === 'function') renderPublicTeacherProfiles();
  if (typeof renderPublicPremiumLeads === 'function') renderPublicPremiumLeads();
  if (typeof renderBlogList === 'function') renderBlogList();
  { const bd = document.getElementById('page-blog-detail'); if (bd && bd.classList.contains('active') && typeof renderBlogDetail === 'function') renderBlogDetail(); }
  if (typeof renderFaqSection === 'function') renderFaqSection();
  if (typeof renderStudyMoreResources === 'function') renderStudyMoreResources();
}
function getFloatWidgets() {
  const s = fsSettingsGet('floatWidgets') || {};
  return { side: s.side || FW_DEFAULTS.side, faq: { ...FW_DEFAULTS.faq, ...(s.faq || {}) }, ask: { ...FW_DEFAULTS.ask, ...(s.ask || {}) } };
}
function renderFloatWidgets() {
  const dock = document.getElementById('fwDock');
  if (!dock) return;
  const c = getFloatWidgets();
  if (!fsSettingsLoaded('floatWidgets')) { dock.style.display = 'none'; return; }
  const left = c.side === 'left';
  dock.classList.toggle('left', left);
  ['faq', 'ask'].forEach(k => {
    const item = document.getElementById('fwItem-' + k), cfg = c[k];
    item.style.display = cfg.on ? 'block' : 'none';
    const btn = document.getElementById('fwBtn-' + k);
    if (btn) btn.title = cfg.label || (k === 'faq' ? 'FAQ' : 'Ask / Suggest');
    const p = document.getElementById('fwPanel-' + k);
    p.classList.toggle('left', left);
    if (!cfg.on) p.classList.remove('show');
  });
  const any = c.faq.on || c.ask.on;
  dock.style.display = any ? 'flex' : 'none';
}
function getPolicySettings() {
  fsSettingsListen('policySettings', () => { renderPolicyBoxes(); });
  const saved = fsSettingsGet('policySettings') || {};
  return {
    teacher: saved.teacher && saved.teacher.length ? saved.teacher : POLICY_DEFAULTS.teacher,
    student: saved.student && saved.student.length ? saved.student : POLICY_DEFAULTS.student
  };
}
function getFestivalPopup() {
  fsSettingsListen('festivalPopup', maybeShowFestivalPopup);
  const saved = fsSettingsGet('festivalPopup');
  return { ...FESTIVAL_POPUP_DEFAULT, ...(saved || {}) };
}
function renderFestivalPopupContent(p) {
  const box = document.getElementById('festivalPopupContent');
  if (!box) return;
  if (p.image) {
    box.innerHTML = `
      <img src="${p.image}" class="festival-popup-img" alt="${p.title}">
      ${p.btnText && p.btnPage ? `<div class="festival-popup-cta"><button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="closeFestivalPopup(); showPage('${p.btnPage}');">${p.btnText}</button></div>` : ''}
    `;
  } else {
    box.innerHTML = `
      <div class="festival-popup-default">
        <div class="emoji">${p.emoji}</div>
        <h2>${p.title}</h2>
        <p>${p.message}</p>
      </div>
      ${p.btnText && p.btnPage ? `<div class="festival-popup-cta"><button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="closeFestivalPopup(); showPage('${p.btnPage}');">${p.btnText}</button></div>` : ''}
    `;
  }
}
function maybeShowFestivalPopup() {
  const overlay = document.getElementById('festivalPopupOverlay');
  if (!overlay) return;
  // Don't decide anything until the real setting has actually arrived from
  // Firestore — assuming "enabled" as a default while still loading was
  // the bug that made the popup appear even when an admin had turned it
  // off (worse on a slow connection). fsSettingsListen's onRemoteChange
  // calls this function again the moment real data arrives.
  if (!fsSettingsLoaded('festivalPopup')) { fsSettingsListen('festivalPopup', maybeShowFestivalPopup); return; }
  const p = getFestivalPopup();
  if (!p.enabled || _festivalPopupDismissedThisSession) { overlay.classList.remove('show'); return; }
  renderFestivalPopupContent(p);
  if (!overlay.classList.contains('show')) {
    setTimeout(() => {
      // Re-check right before revealing — the admin may have changed it
      // in the meantime.
      const latest = getFestivalPopup();
      if (latest.enabled && !_festivalPopupDismissedThisSession) overlay.classList.add('show');
    }, 600);
  }
}
function closeFestivalPopup() {
  _festivalPopupDismissedThisSession = true;
  document.getElementById('festivalPopupOverlay').classList.remove('show');
}
function getBranding() {
  fsSettingsListen('branding', applyBranding);
  const saved = fsSettingsGet('branding');
  return { ...BRANDING_DEFAULT, ...(saved || {}) };
}
 // avoids re-doing the logo DOM swap when nothing actually changed
function applyBranding() {
  const b = getBranding();
  document.documentElement.style.setProperty('--primary', b.color_primary);
  document.documentElement.style.setProperty('--secondary', b.color_secondary);
  document.documentElement.style.setProperty('--font-heading', `'${b.font_heading}'`);

  // Favicon (the little icon shown in browser tabs AND in Google search
  // results) — follows whatever logo is uploaded in Admin → Branding, so
  // there's no separate "set a favicon" step. Falls back to the default
  // graduation-cap icon if no logo has been uploaded yet.
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    favicon.href = b.logo_image || "https://res.cloudinary.com/zcumhdql/image/upload/v1788600832/lygouyhgyxttqb0eucom.jpg";
  }

  document.querySelectorAll('.logo-text .top').forEach(el => { el.textContent = b.logo_text_top; });
  document.querySelectorAll('.logo-text .bottom').forEach(el => { el.textContent = b.logo_text_bottom; });
  if (b.logo_image !== _lastAppliedLogoImage) {
    _lastAppliedLogoImage = b.logo_image;
    document.querySelectorAll('.logo-icon').forEach(el => {
      // The .logo-text sitting next to this icon (if any) — always kept
      // visible, whether the icon is our default mark or an uploaded logo
      // image, so "Althea Scholar / by Shree" never disappears from the
      // header or footer.
      const wrap = el.closest('.logo, .footer-logo-row');
      const textNode = wrap ? wrap.querySelector('.logo-text') : null;
      if (b.logo_image) {
        el.innerHTML = `<img src="${b.logo_image}" alt="${b.logo_text_top}" style="height:100%;width:auto;max-width:220px;object-fit:contain;display:block;">`;
        el.classList.remove('logo-icon-svg'); el.classList.add('logo-icon-custom');
      } else {
        el.innerHTML = DEFAULT_LOGO_SVG;
        el.classList.remove('logo-icon-custom'); el.classList.add('logo-icon-svg');
      }
      if (textNode) textNode.style.display = '';
    });
  }
}
function getStudentFormNotice() {
  fsSettingsListen('studentFormNotice', () => { renderStudentFormNotice(); });
  const saved = fsSettingsGet('studentFormNotice');
  return saved || STUDENT_NOTICE_DEFAULT;
}
// Chatbot ("Alti") logic now lives in js/chatbot.js
function getSiteFaqs() {
  return getData('siteFaqs');
}
function toggleFaqItem(idx) {
  const item = document.getElementById('faqItem' + idx);
  if (item) item.classList.toggle('open');
}
function renderFaqSection() {
  const faqs = getSiteFaqs();
  const wrap = document.getElementById('faqSection');
  const list = document.getElementById('faqList');
  if (!wrap || !list) return;
  if (!faqs.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  list.innerHTML = faqs.map((f, i) => `
    <div class="faq-item" id="faqItem${i}">
      <button class="faq-q" onclick="toggleFaqItem(${i})" aria-expanded="false">
        <span>${f.question}</span><i class="fas fa-chevron-down"></i>
      </button>
      <div class="faq-a"><p>${f.answer}</p></div>
    </div>
  `).join('');
  // Update the FAQPage structured data so Google can pick up rich results.
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.answer }
    }))
  };
  let ldTag = document.getElementById('faqJsonLd');
  if (!ldTag) {
    ldTag = document.createElement('script');
    ldTag.type = 'application/ld+json';
    ldTag.id = 'faqJsonLd';
    document.head.appendChild(ldTag);
  }
  ldTag.textContent = JSON.stringify(ld);
}
function onCommunityTypeChange() {
  const type = document.getElementById('cp_type').value;
  document.getElementById('cp_rating').style.display = type === 'feedback' ? 'block' : 'none';
  const titleField = document.getElementById('cp_title');
  const contentField = document.getElementById('cp_content');
  const placeholders = {
    question: ['', 'Type your question here'],
    feedback: ['Your city (optional)', 'Tell us about your experience'],
    blog: ['Blog post title', 'Write your blog post here'],
    suggestion: ['Short summary', 'Describe your idea in detail']
  };
  const [t, c] = placeholders[type] || ['Title', 'Details'];
  titleField.placeholder = t;
  titleField.style.display = type === 'question' ? 'none' : 'block';
  contentField.placeholder = c;
}
function getVisitorPosts() { return getData('visitorPosts'); }
function submitVisitorPost() {
  const type = document.getElementById('cp_type').value;
  const name = document.getElementById('cp_name').value.trim() || 'Anonymous';
  const title = document.getElementById('cp_title').value.trim();
  const content = document.getElementById('cp_content').value.trim();
  const rating = type === 'feedback' ? parseInt(document.getElementById('cp_rating').value, 10) : null;
  if (type === 'question' ? !content : (!title || !content)) {
    showToast('⚠️ Please fill in the required fields.', 'error');
    return;
  }
  addData('visitorPosts', { type, name, title, content, rating, status: 'pending', submittedAt: Date.now() });
  showToast('✅ Thanks! Submitted for review.');
  document.getElementById('cp_title').value = '';
  document.getElementById('cp_content').value = '';
  document.getElementById('cp_name').value = '';
}
function getSeoPages() {
  fsSettingsListen('seoPages');
  const saved = fsSettingsGet('seoPages') || {};
  return {
    visible: { ...SEO_PAGES_DEFAULT.visible, ...(saved.visible || {}) },
    pages: Object.fromEntries(Object.keys(SEO_PAGES_DEFAULT.pages).map(slug =>
      [slug, { ...SEO_PAGES_DEFAULT.pages[slug], ...((saved.pages && saved.pages[slug]) || {}) }]
    )),
    citiesVisible: saved.visible && saved.visible['tuition-cities'] !== undefined ? saved.visible['tuition-cities'] : true,
    cities: (saved.cities && saved.cities.length) ? saved.cities : SEO_PAGES_DEFAULT.cities
  };
}
function renderStudentFormNotice() {
  const el = document.getElementById('studentFormNoticeText');
  if (el) el.textContent = getStudentFormNotice();
}
function renderPolicyBoxes() {
  const p = getPolicySettings();
  const renderList = (points) => points.map(([t, d]) => `<li>${t ? `<strong>${t}:</strong> ` : ''}${d}</li>`).join('');
  const tBox = document.getElementById('teacherPolicyBox'); if (tBox) tBox.innerHTML = renderList(p.teacher);
  const sBox = document.getElementById('studentPolicyBox'); if (sBox) sBox.innerHTML = renderList(p.student);
}
// ================================================================
// Registration Form Editor — admin can edit label/placeholder text
// of existing Teacher & Student form fields (label wording only)
// ================================================================
function getFormFieldRows(formId) {
  return Array.from(document.querySelectorAll('#' + formId + ' .form-row')).map(row => {
    const label = row.querySelector('label');
    const control = row.querySelector('input, select, textarea');
    if (!label || !control || !control.id) return null;
    return { id: control.id, labelEl: label, control };
  }).filter(Boolean);
}
function getRegSide(kind) {
  fsSettingsListen('regSide', () => { renderRegSide('teacher'); renderRegSide('student'); });
  const all = fsSettingsGet('regSide') || {};
  const d = REG_SIDE_DEFAULTS[kind];
  const s = all[kind] || {};
  const items = d.items.map((it, i) => ({ ...it, text: (s.items && s.items[i]) ? s.items[i] : it.text }));
  return { title: s.title || d.title, quote: s.quote || d.quote, image: s.image || '', items };
}
function renderRegSide(kind) {
  const el = document.getElementById(kind === 'teacher' ? 'regSideTeacher' : 'regSideStudent');
  if (!el) return;
  const c = getRegSide(kind);
  const d = REG_SIDE_DEFAULTS[kind];
  el.innerHTML = `<div class="card"><h3>${c.title}</h3>${c.items.map(it => `<div class="it"><i class="fas ${it.icon}" style="background:${it.bg};color:${it.fg}"></i>${it.text}</div>`).join('')}</div>
  <div class="card reg-quote">${c.image ? `<img class="reg-side-img" src="${c.image}" alt="">` : ''}<q>${c.quote}</q>${c.image ? '' : `<div class="art">${d.art}</div>`}</div>`;
}
function applyFormFieldSettings() {
  fsSettingsListen('formFieldSettings', () => { applyFormFieldSettings(); });
  const settings = fsSettingsGet('formFieldSettings') || {};
  ['teacherForm', 'studentForm'].forEach(formId => {
    getFormFieldRows(formId).forEach(r => {
      const s = settings[r.id];
      const defaultLabel = r.labelEl.dataset.defaultLabel || r.labelEl.textContent;
      r.labelEl.dataset.defaultLabel = defaultLabel;
      r.labelEl.textContent = (s && s.label !== undefined) ? s.label : defaultLabel;
      if ('placeholder' in r.control && r.control.tagName !== 'SELECT') {
        const defaultPh = r.control.dataset.defaultPlaceholder !== undefined ? r.control.dataset.defaultPlaceholder : (r.control.placeholder || '');
        r.control.dataset.defaultPlaceholder = defaultPh;
        r.control.placeholder = (s && s.placeholder !== undefined) ? s.placeholder : defaultPh;
      }
    });
  });
}
function teacherProfileCardHtml(p) {
  // Only show a star rating once there's at least one real review behind it —
  // a brand-new profile (0 reviews) shows "No reviews yet" instead of a
  // default/fake star count, since a 5-star rating with 0 reviews would be
  // an unsupported claim.
  const hasReviews = (p.reviewCount || 0) > 0 && p.rating;
  const stars = hasReviews ? '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating)) : '';
  const tags = (p.expertise || '').split(',').map(t => t.trim()).filter(Boolean);
  return `<div class="teacher-card">
    ${p.medal && p.medal !== 'none' ? `<span class="medal">${MEDAL_ICONS[p.medal]}</span>` : ''}
    <span class="plan-tag ${p.plan === 'premium' ? 'premium' : 'basic'}">${p.plan === 'premium' ? '⭐ PREMIUM' : 'BASIC'}</span>
    <img class="photo" src="${p.photo || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(p.name)}" alt="${p.name}">
    <div class="name">${p.name}${p.sourceTeacherId ? ' <span style="color:#1a8a3c;font-size:12px;font-weight:700;" title="Verified through teacher registration &amp; admin review"><i class="fas fa-circle-check"></i> Verified</span>' : ''}</div>
    <div class="qual">${p.qualification || ''}${p.experience ? ' · ' + p.experience : ''}</div>
    <div class="stars">${hasReviews ? `${stars} <span style="color:var(--gray);">(${p.reviewCount})</span>` : '<span style="color:var(--gray);font-size:12px;">No reviews yet</span>'}</div>
    ${p.location ? `<div class="loc"><i class="fas fa-map-marker-alt"></i> ${p.location}</div>` : ''}
    ${tags.length ? `<div class="expertise-tags">${tags.map(t => `<span>${t}</span>`).join('')}</div>` : ''}
    ${p.bio ? `<div class="bio">${p.bio}</div>` : ''}
    ${p.fee ? `<div class="fee">${p.fee}</div>` : ''}
    <a class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="showPage('page-student-form')">Book a Demo</a>
  </div>`;
}
function renderPublicTeacherProfiles() {
  const grid = document.getElementById('publicTeacherProfilesGrid');
  if (!grid) return;
  const filter = document.getElementById('teacherProfileFilter') ? document.getElementById('teacherProfileFilter').value : 'all';
  let items = getData('teacherProfiles').filter(p => p.visible);
  if (filter !== 'all') items = items.filter(p => p.category === filter);
  items = items.slice().sort((a, b) => (b.plan === 'premium') - (a.plan === 'premium'));
  grid.innerHTML = items.length ? items.map(teacherProfileCardHtml).join('') : '<p style="color:var(--gray);grid-column:1/-1;text-align:center;">No teacher profiles available yet — check back soon!</p>';
}
function renderHomepageTeacherPreview() {
  const wrap = document.getElementById('homepageTeacherPreview');
  const grid = document.getElementById('homepageTeacherPreviewGrid');
  if (!wrap || !grid) return;
  fsStartListener('teacherProfiles');
  if (fsDataFailed('teacherProfiles')) { wrap.style.display = 'none'; return; }
  if (!fsDataHasLoaded('teacherProfiles')) {
    wrap.style.display = 'block';
    grid.innerHTML = Array(4).fill('<div class="skel-card"><div class="skel skel-circle"></div><div class="skel skel-line" style="width:70%;margin:0 auto 6px;"></div><div class="skel skel-line" style="width:50%;margin:0 auto;"></div></div>').join('');
    return;
  }
  const items = getData('teacherProfiles').filter(p => p.visible).slice().sort((a, b) => (b.plan === 'premium') - (a.plan === 'premium')).slice(0, 20);
  if (items.length === 0) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  grid.innerHTML = items.map(teacherProfileCardHtml).join('');
}
function renderHomepageTestimonials() {
  const wrap = document.getElementById('testimonialsSection');
  const grid = document.getElementById('testimonialGrid');
  if (!wrap || !grid) return;
  fsStartListener('parentFeedbacks');
  if (fsDataFailed('parentFeedbacks')) { wrap.style.display = 'none'; return; }
  if (!fsDataHasLoaded('parentFeedbacks')) {
    wrap.style.display = 'block';
    grid.innerHTML = Array(3).fill('<div class="skel-card"><div class="skel skel-line" style="width:40%;"></div><div class="skel skel-line" style="width:95%;"></div><div class="skel skel-line" style="width:80%;"></div><div class="skel skel-circle" style="width:40px;height:40px;margin:10px 0 0;"></div></div>').join('');
    return;
  }
  const items = getData('parentFeedbacks').filter(f => f.showOnHome).slice(0, 20);
  if (!items.length) { wrap.style.display = 'none'; grid.innerHTML = ''; return; }
  wrap.style.display = 'block';
  grid.innerHTML = items.map(f => `
    <div class="testimonial-card">
      <div class="stars">${f.rating ? '⭐'.repeat(f.rating) : ''}</div>
      <div class="review">"${(f.review || '').replace(/</g, '&lt;')}"</div>
      <div class="who">
        <img src="${f.photoData || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(f.name)}" alt="${f.name}">
        <div><div class="name">${f.name}</div>${f.location ? `<div class="loc"><i class="fas fa-map-marker-alt"></i> ${f.location}</div>` : ''}</div>
      </div>
    </div>
  `).join('');
}
// ================================================================
// Public Premium Leads page (teacher-facing)
// ================================================================
function renderPublicPremiumLeads() {
  const grid = document.getElementById('publicPremiumLeadsGrid');
  if (!grid) return;
  const leads = getData('premiumLeads').filter(l => l.status === 'Active' && l.visible !== false);
  grid.innerHTML = leads.length ? leads.map(l => `
    <div class="offer-card">
      <span class="lead-status-badge"><i class="fas fa-bolt"></i> ${l.status}</span>
      <div class="ic"><i class="fas fa-star"></i></div>
      <p style="font-size:11px;color:var(--gray);margin-bottom:2px;">#${l.id}${l.name ? ' · ' + l.name : ''}</p>
      <h3>${l.class} — ${l.subject}</h3>
      <p><i class="fas fa-map-marker-alt"></i> ${l.location} &nbsp; | &nbsp; ${l.board}</p>
      <p><i class="fas fa-laptop-house"></i> ${l.tuitionType} ${l.timing ? '· ' + l.timing : ''} ${l.days ? '· ' + l.days : ''}</p>
      ${l.budget ? `<p><i class="fas fa-rupee-sign"></i> ${l.budget}/month</p>` : ''}
      ${l.requirement ? `<p style="font-size:12.5px;color:var(--gray);">${l.requirement}</p>` : ''}
      <a class="btn btn-green btn-sm" style="margin-top:8px;" href="https://wa.me/${getHomepageContent().whatsapp}?text=${encodeURIComponent('Hi Althea Scholar, I am a Premium Teacher and interested in Premium Lead: ' + l.class + ' | ' + l.subject + ' | ' + l.location)}" target="_blank" onclick="incrementLeadApplication(${l.id})"><i class="fab fa-whatsapp"></i> Apply for Lead</a>
    </div>
  `).join('') : '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">No active Premium Leads right now. Check back soon!</p>';
}
function incrementLeadApplication(id) {
  const leads = getData('premiumLeads');
  const idx = leads.findIndex(l => l.id === id);
  if (idx !== -1) { leads[idx].applications = (leads[idx].applications || 0) + 1; setData('premiumLeads', leads); }
}

// ---- Bootstrap: event-listener registration + initial hash routing ----
// Runs last, after every function/constant above (in this file and every
// other split file) has been defined. Order preserved exactly as in the
// original single-file build.
window.addEventListener('resize', applyHeroFrameWidth);
// Keeps isAdminLoggedIn in sync with the real Firebase Auth session
// (so a page refresh doesn't force the admin to log in again).
fsAuth.onAuthStateChanged(user => {
  isAdminLoggedIn = !!user;
  if (user) {
    // Now allowed to read protected collections — attach their listeners.
    PROTECTED_READ_COLLECTIONS.forEach(k => getData(k));
    loadDefaultData().then(() => dedupeStudyMaterial(true)); // seed other defaults, then purge any leftover duplicate/placeholder Study Material docs
    if (typeof renderAll === 'function') renderAll();
  }
});
document.addEventListener('keydown', function(e) { if (e.key === 'Enter' && document.getElementById('loginOverlay').classList.contains('show')) { adminLogin(); } });
window.addEventListener('load', () => setTimeout(openPageFromHash, 0));
window.addEventListener('hashchange', openPageFromHash);
// Phone/browser Back (and Forward) button support: restore whichever page
// was active at that point in history, without pushing a new entry.
window.addEventListener('popstate', function (e) {
  const id = (e.state && e.state.page) || 'page-home';
  if (e.state && e.state.uid) _curUpdId = e.state.uid;
  if (e.state && e.state.bid) _curBlogId = e.state.bid;
  if (e.state && e.state.pdfCollection) window._pdfViewerState = { collection: e.state.pdfCollection, id: e.state.pdfId };
  if (document.getElementById(id)) activatePage(id);
});
// The very first page load has no history state yet — give it one so the
// first Back press has something defined to land on.
if (!window.history.state) {
  // keep the #hash (e.g. #update-12, #blog-5, #find-tutor) so shared/deep links can open the right page
  history.replaceState({ page: 'page-home' }, '', location.pathname + location.search + location.hash);
}
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.city-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.city-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      renderCities(this.dataset.filter);
    });
  });
  renderCities('all');
  seedDummyContent();
  maybeShowFestivalPopup();
  applyBranding();
});
renderStudentBlocks();
fsSettingsListen('studyHero', renderSmHeroArt);
(function () {
  try { if (localStorage.getItem('admSidebarCollapsed') === '1') { document.addEventListener('DOMContentLoaded', () => { const bar = document.getElementById('adminTabBar'), tab = document.getElementById('admCollapseTab'); if (bar) bar.classList.add('adm-collapsed'); if (tab) tab.innerHTML = '<i class="fas fa-bars"></i> MENU'; }); } } catch (e) {}
})();
fsSettingsListen('floatWidgets', renderFloatWidgets);
// Show the greeting bubble a few seconds after page load (once per browser)
setTimeout(() => {
  let seen = false;
  try { seen = localStorage.getItem('chatbotGreetSeen') === '1'; } catch (e) {}
  if (!seen) document.getElementById('chatbotGreet').style.display = 'block';
}, 3500);
// One delegated listener handles chapter-tile clicks even after the grid
// is re-rendered for a new subject.
document.addEventListener('click', function(e) {
  const pickBtn = e.target.closest('.study-tile');
  if (pickBtn && document.getElementById('study-chapter-grid')?.contains(pickBtn)) {
    selectStudyChapterDropdown(pickBtn.dataset.value);
  }
});
// Opens a document as a dedicated, full page (same pattern as the Latest
// Update "Read Update" page) — never a popup, and never touches the
// underlying Study Material page, so the Class/Subject/Chapter the admin
// or visitor had picked is still there when they go back. Continuous,
// view-only reader: JPG page images only, never a downloadable file link.
window._pdfViewerState = null;
// Best-effort deterrents while the view-only file modal is open: blocks
// Ctrl+S / Ctrl+P / Ctrl+Shift+I from inside the page. Note: this cannot
// and does not claim to block the operating system's own screenshot tool
// (Windows Snipping Tool / Print Screen key, Mac Cmd+Shift+4, phone
// screenshot) — no website can intercept that, since it happens outside
// the browser at the OS level.
document.addEventListener('keydown', function(e) {
  const modalOpen = document.getElementById('fileViewModalOverlay').classList.contains('show');
  if (!modalOpen) return;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'p')) { e.preventDefault(); showToast('⚠️ Saving/printing is disabled for view-only documents.', 'error'); }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && k === 'i') { e.preventDefault(); }
});
document.addEventListener('DOMContentLoaded', function() {
  smInitClassDropdown();
  renderEntranceExamGrid();
  renderAll();
  renderLeadSidebar();
  renderCities('all');
  renderHomepageContent();
  renderHomepageAnnouncements();
  renderHomepageTestimonials();
  renderHomepageTeacherPreview();
});
document.addEventListener('keydown', function(e) {
  const key = (e.key || '').toLowerCase();
  if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(key)) {
    e.preventDefault();
    showToast('⚠️ Saving/Printing files from this site is disabled', 'error');
  }
});
document.addEventListener('contextmenu', function(e) {
  if (e.target.closest('.file-preview')) e.preventDefault();
});
const origDel = deleteData;
deleteData = function(key, id) {
  const confirmed = confirm('⚠️ Are you sure you want to delete this? This cannot be undone.');
  if (!confirmed) return;
  origDel(key, id);
  renderAll();
  renderLeadSidebar();
  renderAdminSubjectDropdown();
  showToast('🗑️ Deleted');
};
(function(){ const bm = /^#blog-(\d+)/.exec(location.hash); if (bm) { _curBlogId = Number(bm[1]); history.replaceState({ page: 'page-blog-detail', bid: _curBlogId }, '', location.hash); activatePage('page-blog-detail'); } })();
(function(){ const m = /^#update-(\d+)/.exec(location.hash); if (m) { _curUpdId = Number(m[1]); history.replaceState({ page: 'page-update-detail', uid: _curUpdId }, '', location.hash); activatePage('page-update-detail'); } })();
// Gentle scroll-reveal animation for cards as they enter the viewport —
// re-observes periodically since many cards are added dynamically after
// Firestore data loads.
(function () {
  const seen = new WeakSet();
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  function scan() {
    document.querySelectorAll('.offer-card, .stat-item, .pick-card, .res-list > div').forEach(el => {
      if (!seen.has(el)) { seen.add(el); el.classList.add('reveal-pre'); io.observe(el); }
    });
  }
  scan();
  setInterval(scan, 1500); // catches cards rendered later from Firestore data
})();
