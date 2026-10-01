// ================================================================
// admin.js — the admin panel: content editors and CRUD for everything
// that does not have its own file (homepage, teachers/students, leads,
// premium, float widgets, feedback, policies, festival popup, branding,
// chatbot FAQs, site FAQs, visitor posts, SEO pages, form/registration
// settings, teacher profiles).
// ================================================================
const HOMEPAGE_DEFAULTS = {
  eyebrow: "India's Trusted Home & Online Tutoring",
  h1_line1: "Find the Right Tutor.",
  h1_line2: "Learn Better.",
  h1_accent: "Achieve More.",
  lead: "Quality tutors for academics (Nursery to Post Graduation), plus hobby, skill & language classes — dance, singing, guitar, piano, chess, foreign languages & more — available at your home or online, across India's top cities.",
  hero_img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  hero_img_w: "60", hero_img_h: "360", hero_img_shape: "arch", hero_img_fit: "cover",
  hero_frame_w: "78", hero_frame_x: "6", hero_frame_y: "6",
  hero_img_opacity: "100", hero_img_x: "0", hero_img_y: "0", hero_img_rot: "0",
  hero_photo_z: "2", hero_badge_z: "3", hero_text_z: "1",
  city_banner_img: "",
  offer_banner_img: "",
  offer6_title: "Music & Dance", offer6_desc: "Singing, instruments, classical, folk, Bollywood & western dance.",
  offer7_title: "Art, Craft & Creative Skills", offer7_desc: "Drawing, painting, calligraphy, cursive writing & DIY crafts.",
  offer8_title: "Language Classes", offer8_desc: "English, Hindi, Sanskrit & foreign languages — spoken & written.",
  stat1_main: "Teacher Profiles", stat1_sub: "Reviewed Before Listing",
  stat2_num: "70+", stat2_lbl: "Cities — Pan India",
  stat3_num: "50+", stat3_lbl: "Subjects & Boards",
  stat4_main: "Happy Students", stat4_sub: "Growing Community",
  stat5_num: "Free", stat5_lbl: "Demo Before You Commit",
  stat6_num: "Mon–Sat", stat6_lbl: "Support Hours",
  offer1_title: "Home Tuition", offer1_desc: "Experienced home tutors in your city — academics, hobbies & languages, Nursery to Post Graduation.",
  offer2_title: "Online Tuition", offer2_desc: "One-to-one online classes with top teachers across India, for academics, hobbies & languages.",
  offer3_title: "Study Material", offer3_desc: "Notes, questions, practice papers & previous year papers.",
  offer4_title: "Entrance Exam Prep", offer4_desc: "JNVST, Sainik School, Military School & more.",
  offer5_title: "Teacher Registration", offer5_desc: "Join our platform and connect with students.",
  panel_teacher: "Create your profile\nSet teaching preferences\nConnect with students\nGrow your career",
  panel_parent: "Post your requirement\nGet matched with the best tutor\nSchedule demo & start learning",
  panel_why: "Tutor Profiles Reviewed Before Listing\nSafe, Transparent & Reliable\nFlexible Timings & Demo\nPersonalized Learning",
  phone: "+91 82877 71882",
  whatsapp: "918287771882",
  email: "support@altheascholar.com",
  contact_intro: "We'd love to hear from you! Reach out for admissions, tutor registration, or any questions about our programs.",
  contact_address: "",
  contact_hours: "Mon – Sat, 9:00 AM – 7:00 PM",
  contact_instagram: "",
  contact_facebook: "",
  contact_youtube: "",
  badge1_t: "Teacher Profiles", badge1_s: "Reviewed Before Listing",
  badge2_t: "Safe & Secure", badge2_s: "100% Reliable",
  badge3_t: "Flexible Learning", badge3_s: "At Home or Online",
  badge4_t: "Personalized", badge4_s: "Attention",
  teacher_img: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=500&q=80",
  teacher_img_w: "100", teacher_img_h: "160", teacher_img_shape: "rounded", teacher_img_fit: "cover",
  teacher_img_opacity: "100", teacher_img_x: "0", teacher_img_y: "0", teacher_img_rot: "0",
  parent_img: "https://images.unsplash.com/photo-1591382696684-38c427c7547a?auto=format&fit=crop&w=500&q=80",
  parent_img_w: "100", parent_img_h: "160", parent_img_shape: "rounded", parent_img_fit: "cover",
  parent_img_opacity: "100", parent_img_x: "0", parent_img_y: "0", parent_img_rot: "0",
  cities_heading: "We Provide Tutors in 70+ Major Cities Across India",
  why_heading: "Why Choose Althea Scholar by Shree?",
  why_more: "Every teacher's documents are checked before their profile goes live.\nEvery teacher is matched to your child's board, class and subject — not just generic tutoring.\nFree demo class before you commit to a teacher.\nTransparent fee structure — no hidden charges, ever.\nQuick WhatsApp support for parents and teachers.\nPersonal support while we help you find the right match."
};
function resetHomepageContent() {
  fsSettingsSave('homepageContent', {});
  renderHomepageContent();
  populateHomepageAdminForm();
  showToast('✅ Homepage reset to default!');
}
const HP_SHAPE_MAP = { arch: '200px 200px 20px 20px', rounded: '20px', square: '0px', circle: '50%', pill: '999px' };
function populateHomepageAdminForm() {
  const c = getHomepageContent();
  Object.keys(HOMEPAGE_DEFAULTS).forEach(key => {
    const el = document.getElementById('hp_' + key);
    if (el) el.value = c[key];
  });
  const p1 = document.getElementById('hp_prev_hero'); if (p1) p1.src = c.hero_img;
  const p2 = document.getElementById('hp_prev_teacher'); if (p2) p2.src = c.teacher_img;
  const p3 = document.getElementById('hp_prev_parent'); if (p3) p3.src = c.parent_img;
  const p4 = document.getElementById('hp_prev_citybanner'); if (p4 && c.city_banner_img) p4.src = c.city_banner_img;
  const p5 = document.getElementById('hp_prev_offerbanner'); if (p5 && c.offer_banner_img) p5.src = c.offer_banner_img;
}
async function hpImageUpload(input, targetId, previewId) {
  const file = input.files[0];
  if (!file) return;
  const MAX_SIZE = 8 * 1024 * 1024;
  if (file.size > MAX_SIZE) { showToast('⚠️ Image too big! Max 8MB.', 'error'); input.value = ''; return; }
  showToast('⏳ Uploading image...');
  let url;
  try { url = await uploadToCloudinary(file, 'image', 'althea-scholar/homepage'); }
  catch (err) { showToast('⚠️ ' + (err.message || 'Image upload failed — check your internet connection.'), 'error'); return; }
  const target = document.getElementById(targetId);
  if (target) target.value = url;
  const prev = document.getElementById(previewId);
  if (prev) prev.src = url;
  showToast('✅ Image ready — click "Save Homepage Content" below to apply.');
}
function resetHpImages() {
  const keys = ['hero_img','hero_img_w','hero_img_h','hero_img_shape','hero_img_fit','hero_img_opacity','hero_img_x','hero_img_y','hero_img_rot',
    'hero_photo_z','hero_badge_z','hero_text_z','hero_frame_w','hero_frame_x','hero_frame_y',
    'teacher_img','teacher_img_w','teacher_img_h','teacher_img_shape','teacher_img_fit','teacher_img_opacity','teacher_img_x','teacher_img_y','teacher_img_rot',
    'parent_img','parent_img_w','parent_img_h','parent_img_shape','parent_img_fit','parent_img_opacity','parent_img_x','parent_img_y','parent_img_rot'];
  const c = getHomepageContent();
  keys.forEach(k => { c[k] = HOMEPAGE_DEFAULTS[k]; });
  fsSettingsSave('homepageContent', c);
  renderHomepageContent();
  populateHomepageAdminForm();
  showToast('✅ Image settings reset to default!');
}
function saveHomepageContent() {
  const c = {};
  Object.keys(HOMEPAGE_DEFAULTS).forEach(key => {
    const el = document.getElementById('hp_' + key);
    if (el) c[key] = el.value.trim() || HOMEPAGE_DEFAULTS[key];
  });
  fsSettingsSave('homepageContent', c);
  renderHomepageContent();
  showToast('✅ Homepage content updated!');
}
 // "collection:id" -> boolean

function stageVisibilityChange(collection, id, checked, renderFn) {
  _pendingVisibility[collection + ':' + id] = checked;
  renderFn();
  const bar = document.getElementById(collection + '_save_bar');
  if (bar) bar.style.display = 'flex';
}
function getPendingOrActual(collection, id, actualValue) {
  const key = collection + ':' + id;
  return Object.prototype.hasOwnProperty.call(_pendingVisibility, key) ? _pendingVisibility[key] : !!actualValue;
}
function cancelVisibilityChanges(collection, renderFn) {
  Object.keys(_pendingVisibility).forEach(k => { if (k.startsWith(collection + ':')) delete _pendingVisibility[k]; });
  const bar = document.getElementById(collection + '_save_bar');
  if (bar) bar.style.display = 'none';
  renderFn();
  showToast('Changes discarded — nothing was saved.');
}
async function saveVisibilityChanges(collection, fieldName, renderFn, extraRenderFns) {
  const keys = Object.keys(_pendingVisibility).filter(k => k.startsWith(collection + ':'));
  if (!keys.length) { showToast('No changes to save.'); return; }
  const btn = document.getElementById(collection + '_save_btn');
  const originalBtnHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

  const results = await Promise.allSettled(keys.map(k => {
    const id = Number(k.split(':')[1]);
    const checked = _pendingVisibility[k];
    return fsDb.collection(collection).doc(String(id)).set({ [fieldName]: checked }, { merge: true }).then(() => {
      const arr = _fsCache[collection] || [];
      const idx = arr.findIndex(item => item.id === id);
      if (idx !== -1) arr[idx][fieldName] = checked;
    });
  }));

  const failedCount = results.filter(r => r.status === 'rejected').length;
  keys.forEach(k => delete _pendingVisibility[k]);
  if (btn) { btn.disabled = false; btn.innerHTML = originalBtnHtml; }
  const bar = document.getElementById(collection + '_save_bar');
  if (bar) bar.style.display = 'none';

  renderFn();
  if (extraRenderFns) extraRenderFns.forEach(fn => fn());

  if (failedCount === 0) {
    showToast('✅ Changes saved successfully!');
  } else {
    showToast('⚠️ ' + failedCount + ' of ' + keys.length + ' change(s) could not be saved — check your internet connection and try again.', 'error');
  }
}
async function adminLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const error = document.getElementById('loginError');
  const showError = (msg) => { error.textContent = msg; error.style.display = 'block'; setTimeout(() => error.style.display = 'none', 3000); };
  if (!user || !pass) { showError('❌ Please enter both username and password'); return; }
  if (user !== 'admin') { showError('❌ Invalid username or password'); return; }
  try {
    await fsAuth.signInWithEmailAndPassword(ADMIN_EMAIL, pass);
    isAdminLoggedIn = true;
    document.getElementById('loginOverlay').classList.remove('show');
    showPage('page-admin'); renderAll(); showAdminTab('teachers');
    showToast('✅ Admin login successful!');
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
  } catch (err) {
    console.error('Admin login failed:', err);
    showError('❌ Invalid username or password');
  }
}
function openAdminLogin() {
  closeMobileNav();
  if (isAdminLoggedIn) {
    showPage('page-admin'); renderAll();
    if (!document.querySelector('.admin-tab.active')) showAdminTab('teachers');
  }
  else { document.getElementById('loginOverlay').classList.add('show'); document.getElementById('loginError').style.display = 'none'; document.getElementById('loginUser').value = ''; document.getElementById('loginPass').value = ''; document.getElementById('loginUser').focus(); }
}
function closeAdminLoginPopup() {
  document.getElementById('loginOverlay').classList.remove('show');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').style.display = 'none';
}
function adminLogout() {
  fsAuth.signOut();
  isAdminLoggedIn = false;
  showPage('page-home');
  showToast('👋 Logged out successfully');
}
function openWhyModal() {
  const c = getHomepageContent();
  document.getElementById('whyModalHeading').textContent = c.why_heading;
  const points = (c.why_more || '').split('\n').filter(x => x.trim());
  document.getElementById('whyModalList').innerHTML = points.map(p => `<li><i class="fas fa-check-circle"></i> <span>${p}</span></li>`).join('');
  document.getElementById('whyModalOverlay').classList.add('show');
}
function closeWhyModal() { document.getElementById('whyModalOverlay').classList.remove('show'); }
/* ---------- Payment Settings (UPI / QR / Fee / Duration / Benefits) — admin controlled ---------- */
const PAYMENT_DEFAULTS = {
  upi_id: 'altheascholar@upi', amount: '999', qr_custom: '',
  duration_value: '12', duration_unit: 'months',
  disclaimer_note: 'Registration submits with status "Payment Verification Pending" — Premium features activate only after admin approval. Premium Membership is valid for 12 months.',
  basic_benefits: ['Normal registration', 'Normal tuition leads'],
  premium_benefits: ['⭐ Premium leads', 'Priority lead access', '⭐ Premium badge on profile', 'Priority profile visibility', 'Premium notifications']
};
function getPaymentSettings() {
  fsSettingsListen('paymentSettings', () => { renderPaymentSettings(); });
  const saved = fsSettingsGet('paymentSettings') || {};
  return { ...PAYMENT_DEFAULTS, ...saved };
}
function renderPaymentSettings() {
  const p = getPaymentSettings();
  const qrImg = document.getElementById('premiumQrImg');
  if (qrImg) qrImg.src = p.qr_custom || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('upi://pay?pa=' + p.upi_id + '&pn=Althea Scholar&am=' + p.amount)}`;
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('premiumUpiIdText', p.upi_id);
  setTxt('premiumFeeHeading', '₹' + p.amount);
  setTxt('premiumAmountChip', '₹' + p.amount);
  setTxt('planPricePremium', '₹' + p.amount);
  setTxt('planPremiumDuration', p.duration_value + ' ' + p.duration_unit);
  setTxt('premiumLeadsPageFee', '₹' + p.amount);
  setTxt('premiumLeadsPageDuration', p.duration_value + ' ' + p.duration_unit);
  setTxt('premiumDisclaimerNote', p.disclaimer_note);
  const basicUl = document.getElementById('planBasicBenefits');
  if (basicUl) basicUl.innerHTML = (p.basic_benefits || []).map(b => `<li>${b}</li>`).join('');
  const premiumUl = document.getElementById('planPremiumBenefits');
  if (premiumUl) premiumUl.innerHTML = (p.premium_benefits || []).map(b => `<li>${b}</li>`).join('');
}
function populatePaymentSettingsForm() {
  const p = getPaymentSettings();
  const upi = document.getElementById('pay_upi_id'); if (upi) upi.value = p.upi_id;
  const amt = document.getElementById('pay_amount'); if (amt) amt.value = p.amount;
  const durVal = document.getElementById('pay_duration_value'); if (durVal) durVal.value = p.duration_value;
  const durUnit = document.getElementById('pay_duration_unit'); if (durUnit) durUnit.value = p.duration_unit;
  const disc = document.getElementById('pay_disclaimer_note'); if (disc) disc.value = p.disclaimer_note;
  const basicTa = document.getElementById('pay_basic_benefits'); if (basicTa) basicTa.value = (p.basic_benefits || []).join('\n');
  const premiumTa = document.getElementById('pay_premium_benefits'); if (premiumTa) premiumTa.value = (p.premium_benefits || []).join('\n');
  const prev = document.getElementById('pay_qr_preview');
  if (prev) { if (p.qr_custom) { prev.src = p.qr_custom; prev.style.display = 'inline-block'; } else { prev.style.display = 'none'; } }
}
async function paySettingsQrUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) { showToast('⚠️ Image too big! Max 3MB.', 'error'); input.value = ''; return; }
  showToast('⏳ Uploading QR image...');
  let url;
  try { url = await uploadToCloudinary(file, 'image', 'althea-scholar/payments'); }
  catch (err) { showToast('⚠️ ' + (err.message || 'QR upload failed — check your internet connection.'), 'error'); return; }
  const p = getPaymentSettings(); p.qr_custom = url;
  fsSettingsSave('paymentSettings', p);
  populatePaymentSettingsForm();
  showToast('✅ Custom QR ready — click Save to apply.');
}
function clearCustomQr() {
  const p = getPaymentSettings(); p.qr_custom = '';
  fsSettingsSave('paymentSettings', p);
  populatePaymentSettingsForm();
  showToast('✅ Custom QR removed — auto-QR will be used.');
}
function savePaymentSettings() {
  const p = getPaymentSettings();
  p.upi_id = document.getElementById('pay_upi_id').value.trim() || PAYMENT_DEFAULTS.upi_id;
  p.amount = document.getElementById('pay_amount').value.trim() || PAYMENT_DEFAULTS.amount;
  p.duration_value = document.getElementById('pay_duration_value').value.trim() || PAYMENT_DEFAULTS.duration_value;
  p.duration_unit = document.getElementById('pay_duration_unit').value;
  p.disclaimer_note = document.getElementById('pay_disclaimer_note').value.trim() || PAYMENT_DEFAULTS.disclaimer_note;
  const basicLines = document.getElementById('pay_basic_benefits').value.split('\n').map(s => s.trim()).filter(Boolean);
  const premiumLines = document.getElementById('pay_premium_benefits').value.split('\n').map(s => s.trim()).filter(Boolean);
  p.basic_benefits = basicLines.length ? basicLines : PAYMENT_DEFAULTS.basic_benefits;
  p.premium_benefits = premiumLines.length ? premiumLines : PAYMENT_DEFAULTS.premium_benefits;
  fsSettingsSave('paymentSettings', p);
  renderPaymentSettings();
  showToast('✅ Payment settings updated! Fee, duration & benefits saved.');
}
const citiesList = ["New Delhi","Mumbai","Bengaluru","Chennai","Hyderabad","Kolkata","Ahmedabad","Pune","Surat","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Bhopal","Patna","Vadodara","Ludhiana","Agra","Nashik","Faridabad","Meerut","Varanasi","Srinagar","Amritsar","Allahabad","Ranchi","Jabalpur","Coimbatore","Madurai","Visakhapatnam","Chandigarh","Gurugram","Noida","Ghaziabad","Guwahati","Shimla","Dehradun","Jammu","Udaipur","Kota","Gwalior","Bareilly","Aligarh","Mysuru","Vijayawada","Aurangabad","Solapur","Hubballi","Kochi","Thrissur","Kozhikode","Thiruvananthapuram","Bhubaneswar","Raipur","Gandhinagar","Panaji","Port Blair","Puducherry","Daman","Leh","Itanagar","Dispur","Shillong","Imphal","Aizawl","Kohima","Agartala","Gangtok"];
let extraStudentCount = 4;
function addNewLead() {
  const daysSelect = document.getElementById('lead_specific_days');
  const selectedDays = Array.from(daysSelect.selectedOptions).map(opt => opt.value);
  const data = {
    name: document.getElementById('lead_name').value.trim(),
    cls: document.getElementById('lead_class').value.trim(),
    subj: document.getElementById('lead_subject').value.trim(),
    city: document.getElementById('lead_city').value.trim(),
    budget: document.getElementById('lead_budget').value.trim(),
    pref: document.getElementById('lead_pref').value.trim(),
    mode: document.getElementById('lead_mode').value,
    daysPerWeek: document.getElementById('lead_days_per_week').value.trim() || 'Not Specified',
    hoursPerDay: document.getElementById('lead_hours_per_day').value.trim() || 'Not Specified',
    timeSlot: document.getElementById('lead_time_slot').value.trim() || 'Not Specified',
    specificDays: selectedDays.length > 0 ? selectedDays.join(', ') : 'Not Specified',
    status: document.getElementById('lead_status').value,
    type: 'lead', createdAt: new Date().toISOString()
  };
  if (!data.name || !data.cls || !data.subj) { showToast('⚠️ Please fill Name, Class & Subject!', 'error'); return; }
  if (editingLeadId !== null) {
    updateData('leads', editingLeadId, data);
    renderAll(); renderLeadSidebar();
    showToast('✅ Lead updated successfully!');
    cancelEditLead();
    return;
  }
  addData('leads', data);
  renderAll(); renderLeadSidebar();
  showToast('✅ Lead added successfully!');
  document.querySelectorAll('#admin-leads .admin-form input').forEach(el => el.value = '');
  document.querySelectorAll('#admin-leads .admin-form select').forEach(el => { if (el.multiple) { Array.from(el.options).forEach(opt => opt.selected = false); } else { el.selectedIndex = 0; } });
}
function renderAdminLeads() {
  const leads = getData('leads');
  const tbody = document.getElementById('adminLeadTable');
  if (!tbody) return;
  tbody.innerHTML = leads.map(l => `
    <tr>
      <td><strong>#${l.id}</strong></td>
      <td><strong>${l.name}</strong></td>
      <td>${l.cls}</td>
      <td>${l.subj}</td>
      <td>${l.city || 'N/A'}</td>
      <td style="font-weight:600;color:var(--primary);">${l.budget || 'N/A'}</td>
      <td>${l.mode}</td>
      <td style="font-size:12px;">${l.daysPerWeek || 'N/A'}</td>
      <td style="font-size:12px;">${l.hoursPerDay || 'N/A'}</td>
      <td style="font-size:12px;">${l.timeSlot || 'Any Time'}</td>
      <td><select onchange="updateData('leads', ${l.id}, {status: this.value}); renderLeadSidebar();" style="padding:4px 8px;border-radius:4px;border:1px solid var(--border);">
        <option value="New" ${l.status === 'New' ? 'selected' : ''}>🟢 New</option>
        <option value="Open" ${l.status === 'Open' ? 'selected' : ''}>🟡 Open</option>
        <option value="Closed" ${l.status === 'Closed' ? 'selected' : ''}>🔴 Closed</option>
      </select></td>
      <td>
        <div class="lead-action-row">
          <button class="btn btn-accent btn-sm" onclick="editLead(${l.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteData('leads', ${l.id}); renderLeadSidebar();"><i class="fas fa-trash"></i></button>
        </div>
        <label class="mini-toggle-row"><input type="checkbox" ${getPendingOrActual('leads', l.id, l.visible !== false) ? 'checked' : ''} onchange="stageVisibilityChange('leads', ${l.id}, this.checked, renderAdminLeads)"> ${getPendingOrActual('leads', l.id, l.visible !== false) ? 'Visible — click Save to hide' : 'Hidden — click Save to show'}</label>
      </td>
    </tr>
  `).join('');
}
let editingLeadId = null;
function editLead(id) {
  const l = getData('leads').find(x => x.id === id);
  if (!l) return;
  editingLeadId = id;
  document.getElementById('lead_name').value = l.name || '';
  document.getElementById('lead_class').value = l.cls || '';
  document.getElementById('lead_subject').value = l.subj || '';
  document.getElementById('lead_city').value = l.city || '';
  document.getElementById('lead_budget').value = l.budget || '';
  document.getElementById('lead_pref').value = l.pref || '';
  document.getElementById('lead_days_per_week').value = l.daysPerWeek === 'Not Specified' ? '' : (l.daysPerWeek || '');
  document.getElementById('lead_hours_per_day').value = l.hoursPerDay === 'Not Specified' ? '' : (l.hoursPerDay || '');
  document.getElementById('lead_time_slot').value = l.timeSlot === 'Not Specified' ? '' : (l.timeSlot || '');
  document.getElementById('lead_mode').value = l.mode || 'Home Tuition';
  document.getElementById('lead_status').value = l.status || 'New';
  const daysSelect = document.getElementById('lead_specific_days');
  const specific = (l.specificDays && l.specificDays !== 'Not Specified') ? l.specificDays.split(', ') : [];
  Array.from(daysSelect.options).forEach(opt => opt.selected = specific.includes(opt.value));
  const btn = document.querySelector('#admin-leads .btn-green');
  if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Update Lead';
  document.getElementById('admin-leads').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function cancelEditLead() {
  editingLeadId = null;
  document.querySelectorAll('#admin-leads .admin-form input').forEach(el => el.value = '');
  const btn = document.querySelector('#admin-leads .btn-green');
  if (btn) btn.innerHTML = '<i class="fas fa-plus"></i> Add Lead';
}
function renderAdminTeachers() {
  const teachers = getData('teachers');
  const tbody = document.getElementById('adminTeacherTable');
  if (!tbody) return;
  tbody.innerHTML = teachers.map((t, i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${t.name}</strong>${t.regId ? `<br><span style="font-size:10px;color:var(--gray);font-family:monospace;">${t.regId}</span>` : ''}</td>
      <td>${t.mobile}</td>
      <td>${t.city}</td>
      <td>${t.subjects}</td>
      <td>${t.classes}</td>
      <td>${t.experience}</td>
      <td>${t.fee}</td>
      <td>${t.mode}</td>
      <td>${t.plan === 'premium' ? `<span class="badge-premium-pill">⭐ PREMIUM</span><br><span class="premium-status-pill ${premiumPillClass(t.premiumStatus)}">${t.premiumStatus || 'none'}</span>` : '<span class="premium-status-pill ps-none">Basic</span>'}</td>
      <td><select onchange="setTeacherRegistrationStatus(${t.id}, this.value)" style="padding:4px 8px;border-radius:4px;border:1px solid var(--border);">
        <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>🟡 Pending</option>
        <option value="Under Review" ${t.status === 'Under Review' ? 'selected' : ''}>🔵 Under Review</option>
        <option value="Verified" ${t.status === 'Verified' ? 'selected' : ''}>🟢 Verified</option>
        <option value="Rejected" ${t.status === 'Rejected' ? 'selected' : ''}>🔴 Rejected</option>
      </select></td>
      <td><button class="btn btn-danger btn-sm" onclick="viewTeacherDetails(${t.id})"><i class="fas fa-eye"></i></button>
      <button class="btn btn-danger btn-sm" onclick="deleteData('teachers', ${t.id})"><i class="fas fa-trash"></i></button></td>
    </tr>
  `).join('');
}
// Approving a teacher (status → Verified) auto-creates their public Teacher
// Profile card, pre-filled from their registration — admin can then edit,
// show/hide, or add a photo/bio from the Teacher Profiles tab, exactly like
// any manually-added profile. Re-approving (or toggling status back and
// forth) never creates a duplicate — it's linked via sourceTeacherId.
function setTeacherRegistrationStatus(teacherId, status) {
  updateData('teachers', teacherId, { status });
  if (status === 'Verified') autoCreateTeacherProfile(teacherId);
}
function renderAdminStudents() {
  const students = getData('students');
  const tbody = document.getElementById('adminStudentTable');
  if (!tbody) return;
  tbody.innerHTML = students.map((s, i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${s.parent}</strong>${s.regId ? `<br><span style="font-size:10px;color:var(--gray);font-family:monospace;">${s.regId}</span>` : ''}</td>
      <td>${s.mobile}</td>
      <td>${s.city}</td>
      <td>${s.students.map(st => `${st.name} (${st.class})`).join(', ')}</td>
      <td>${s.students.map(st => st.subjects).join(', ')}</td>
      <td>${s.budget}</td>
      <td>${s.mode}</td>
      <td><button class="btn btn-danger btn-sm" onclick="viewStudentDetails(${s.id})"><i class="fas fa-eye"></i></button>
      <button class="btn btn-outline btn-sm" onclick="pushStudentToLead(${s.id}, 'lead')" title="Add to Live Tuition Leads"><i class="fas fa-bolt"></i> Live Lead</button>
      <button class="btn btn-accent btn-sm" onclick="pushStudentToLead(${s.id}, 'premium')" title="Add to Premium Leads"><i class="fas fa-star"></i> Premium Lead</button>
      <button class="btn btn-danger btn-sm" onclick="deleteData('students', ${s.id})"><i class="fas fa-trash"></i></button></td>
    </tr>
  `).join('');
}
function viewTeacherDetails(id) {
  const teachers = getData('teachers');
  const t = teachers.find(item => item.id === id);
  if (!t) return;
  const container = document.getElementById('teacherDetailContainer');
  container.className = 'detail-container show';
  const docsHtml = `
    <div style="margin-top:16px;">
      <h5 style="color:var(--secondary);margin-bottom:10px;"><i class="fas fa-folder-open"></i> Uploaded Documents</h5>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
        ${t.photoData ? `<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:10px;text-align:center;">
            <div style="font-size:12px;font-weight:700;margin-bottom:6px;">Profile Photo</div>
            <img src="${t.photoData}" alt="Profile photo" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;">
            <div style="font-size:11px;color:var(--gray);margin-top:4px;word-break:break-all;">${t.photo || ''}</div>
          </div>` : `<div style="background:#fff;border:1px dashed var(--border);border-radius:12px;padding:16px;text-align:center;color:var(--gray);font-size:12px;">No profile photo uploaded</div>`}
        ${t.aadhaarData ? renderFilePreview(t.aadhaar, t.aadhaarData, 'teacher-aadhaar-' + t.id) : `<div style="background:#fff;border:1px dashed var(--border);border-radius:12px;padding:16px;text-align:center;color:var(--gray);font-size:12px;">No Aadhaar uploaded</div>`}
        ${t.resumeData ? renderFilePreview(t.resume, t.resumeData, 'teacher-resume-' + t.id) : `<div style="background:#fff;border:1px dashed var(--border);border-radius:12px;padding:16px;text-align:center;color:var(--gray);font-size:12px;">No Resume uploaded</div>`}
      </div>
    </div>`;
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h4 style="color:var(--secondary);">👨‍🏫 Teacher Details — ${t.name}</h4>
      <div>
        <button onclick="downloadTeacherPDF(${t.id})" style="background:var(--primary);color:#fff;border:none;border-radius:30px;padding:4px 16px;cursor:pointer;margin-right:8px;"><i class="fas fa-file-pdf"></i> Download PDF</button>
        <button onclick="document.getElementById('teacherDetailContainer').className='detail-container'" style="background:var(--danger);color:#fff;border:none;border-radius:30px;padding:4px 16px;cursor:pointer;">Close</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;font-size:13px;background:#fff;padding:16px;border-radius:12px;">
      <strong>Name:</strong> <span>${t.name}</span>
      <strong>Gender:</strong> <span>${t.gender || 'N/A'}</span>
      <strong>Date of Birth:</strong> <span>${t.dob || 'N/A'}</span>
      <strong>Mobile:</strong> <span>${t.mobile}</span>
      <strong>WhatsApp:</strong> <span>${t.whatsapp || 'N/A'}</span>
      <strong>Email:</strong> <span>${t.email || 'N/A'}</span>
      <strong>City / Area:</strong> <span>${t.city}</span>
      <strong>State:</strong> <span>${t.state}</span>
      <strong>Complete Address:</strong> <span>${t.address || 'N/A'}</span>
      <strong>Qualification:</strong> <span>${t.qualification}</span>
      <strong>Degree / Course:</strong> <span>${t.degree || 'N/A'}</span>
      <strong>University / Board:</strong> <span>${t.university || 'N/A'}</span>
      <strong>Experience:</strong> <span>${t.experience}</span>
      <strong>Institution:</strong> <span>${t.institution || 'N/A'}</span>
      <strong>Professional Status:</strong> <span>${t.professionalStatus || 'N/A'}</span>
      <strong>Subjects:</strong> <span>${t.subjects}</span>
      <strong>Classes:</strong> <span>${t.classes}</span>
      <strong>Board / Curriculum:</strong> <span>${t.board}</span>
      <strong>Teaching Mode:</strong> <span>${t.mode}</span>
      <strong>Preferred Area:</strong> <span>${t.prefArea || 'N/A'}</span>
      <strong>Preferred Days:</strong> <span>${t.prefDays || 'N/A'}</span>
      <strong>Preferred Time:</strong> <span>${t.prefTime || 'N/A'}</span>
      <strong>Individual/Group:</strong> <span>${t.classType || 'N/A'}</span>
      <strong>Travel Distance:</strong> <span>${t.travelDistance || 'N/A'}</span>
      <strong>Monthly Fee:</strong> <span>${t.fee}</span>
      <strong>Fee Per Hour:</strong> <span>${t.feePerHour || 'N/A'}</span>
      <strong>Demo Available:</strong> <span>${t.demo || 'N/A'}</span>
      <strong>Min Classes/Week:</strong> <span>${t.minClasses || 'N/A'}</span>
      <strong>Status:</strong> <span>${t.status}</span>
      <strong>Registered:</strong> <span>${new Date(t.registeredAt).toLocaleString()}</span>
    </div>
    ${docsHtml}
  `;
  container.scrollIntoView({ behavior: 'smooth' });
}
function viewStudentDetails(id) {
  const students = getData('students');
  const s = students.find(item => item.id === id);
  if (!s) return;
  const container = document.getElementById('studentDetailContainer');
  container.className = 'detail-container show';
  let studentsHtml = s.students.map((st, i) => `
    <div style="border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px;background:#fff;">
      <strong>Student ${i+1}:</strong> ${st.name} | Class: ${st.class} | Subjects: ${st.subjects}
      ${st.school ? `| School: ${st.school}` : ''} | Board: ${st.board || 'N/A'}
    </div>
  `).join('');
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h4 style="color:var(--secondary);">👨‍🎓 Student Registration — ${s.parent}</h4>
      <div>
        <button onclick="downloadStudentPDF(${s.id})" style="background:var(--primary);color:#fff;border:none;border-radius:30px;padding:4px 16px;cursor:pointer;margin-right:8px;"><i class="fas fa-file-pdf"></i> Download PDF</button>
        <button onclick="document.getElementById('studentDetailContainer').className='detail-container'" style="background:var(--danger);color:#fff;border:none;border-radius:30px;padding:4px 16px;cursor:pointer;">Close</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;font-size:13px;background:#fff;padding:16px;border-radius:12px;margin-bottom:12px;">
      <strong>Parent:</strong> <span>${s.parent}</span>
      <strong>Mobile:</strong> <span>${s.mobile}</span>
      <strong>WhatsApp:</strong> <span>${s.whatsapp || 'N/A'}</span>
      <strong>Email:</strong> <span>${s.email || 'N/A'}</span>
      <strong>City:</strong> <span>${s.city}</span>
      <strong>State:</strong> <span>${s.state}</span>
      <strong>Address:</strong> <span>${s.address || 'N/A'}</span>
      <strong>Mode:</strong> <span>${s.mode}</span>
      <strong>Days:</strong> <span>${s.days || 'N/A'}</span>
      <strong>Time:</strong> <span>${s.time || 'N/A'}</span>
      <strong>Classes/Week:</strong> <span>${s.classesPerWeek || 'N/A'}</span>
      <strong>Budget:</strong> <span>${s.budget}</span>
      <strong>Pref Gender:</strong> <span>${s.prefGender || 'No Preference'}</span>
      <strong>Pref Language:</strong> <span>${s.prefLanguage || 'N/A'}</span>
      <strong>Specific:</strong> <span>${s.specific || 'N/A'}</span>
      <strong>Status:</strong> <span>${s.status}</span>
      <strong>Registered:</strong> <span>${new Date(s.registeredAt).toLocaleString()}</span>
    </div>
    <div style="background:#fff;padding:16px;border-radius:12px;">
      <strong>Students:</strong>
      ${studentsHtml}
    </div>
  `;
  container.scrollIntoView({ behavior: 'smooth' });
}
function renderAdminPremium() {
  const teachers = getData('teachers').filter(t => t.plan === 'premium');
  const pending = teachers.filter(t => t.premiumStatus === 'Payment Verification Pending');
  const active = teachers.filter(t => t.premiumStatus === 'Premium Active');
  const expired = teachers.filter(t => t.premiumStatus === 'Expired');
  const statP = document.getElementById('statPremiumPending'); if (statP) statP.textContent = pending.length;
  const statA = document.getElementById('statPremiumActive'); if (statA) statA.textContent = active.length;
  const statE = document.getElementById('statPremiumExpired'); if (statE) statE.textContent = expired.length;
  const statL = document.getElementById('statPremiumLeads'); if (statL) statL.textContent = getData('premiumLeads').length;

  const pendingBody = document.getElementById('adminPremiumPendingTable');
  if (pendingBody) {
    pendingBody.innerHTML = pending.length ? pending.map(t => `
      <tr>
        <td><strong>${t.name}</strong></td>
        <td>${t.mobile}</td>
        <td>${t.city}</td>
        <td>${t.premiumUtr || '-'}</td>
        <td>${t.premiumScreenshotData ? `<img class="img-thumb-sm" src="${t.premiumScreenshotData}" onclick="openFileViewModal('${t.premiumScreenshotData}', 'Payment Screenshot', 'image')" style="cursor:pointer;">` : 'N/A'}</td>
        <td>${t.premiumSubmittedAt ? new Date(t.premiumSubmittedAt).toLocaleDateString() : '-'}</td>
        <td>₹${t.premiumAmount || 999}</td>
        <td>
          <button class="btn btn-green btn-sm" onclick="approvePremiumTeacher(${t.id})"><i class="fas fa-check"></i> Approve</button>
          <button class="btn btn-danger btn-sm" onclick="rejectPremiumTeacher(${t.id})"><i class="fas fa-times"></i> Reject</button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="8" style="text-align:center;color:var(--gray);">No pending verifications.</td></tr>';
  }

  const activeBody = document.getElementById('adminPremiumActiveTable');
  if (activeBody) {
    activeBody.innerHTML = active.length ? active.map(t => `
      <tr>
        <td><strong>${t.name}</strong> <span class="badge-premium-pill">⭐ PREMIUM</span></td>
        <td>${t.mobile}</td>
        <td>${t.city}</td>
        <td>${t.subjects}</td>
        <td>${t.premiumActivatedAt ? new Date(t.premiumActivatedAt).toLocaleDateString() : '-'}</td>
        <td>${t.premiumExpiryAt ? new Date(t.premiumExpiryAt).toLocaleDateString() : '-'}</td>
        <td><button class="btn btn-danger btn-sm" onclick="if(confirm('Revoke Premium status for ${t.name}?')) updateData('teachers', ${t.id}, {premiumStatus:'Expired'})"><i class="fas fa-ban"></i> Revoke</button></td>
      </tr>
    `).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--gray);">No active premium teachers yet.</td></tr>';
  }

  const expiredBody = document.getElementById('adminPremiumExpiredTable');
  if (expiredBody) {
    expiredBody.innerHTML = expired.length ? expired.map(t => `
      <tr>
        <td>${t.name}</td>
        <td>${t.mobile}</td>
        <td>${t.city}</td>
        <td>${t.premiumExpiryAt ? new Date(t.premiumExpiryAt).toLocaleDateString() : '-'}</td>
        <td><button class="btn btn-accent btn-sm" onclick="updateData('teachers', ${t.id}, {premiumStatus:'Payment Verification Pending'})"><i class="fas fa-redo"></i> Mark Renewal Submitted</button></td>
      </tr>
    `).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--gray);">No expired memberships.</td></tr>';
  }
}
function approvePremiumTeacher(id) {
  const now = new Date();
  const expiry = new Date(now); expiry.setDate(expiry.getDate() + 365);
  updateData('teachers', id, {
    premiumStatus: 'Premium Active',
    premiumActivatedAt: now.toISOString(),
    premiumExpiryAt: expiry.toISOString(),
    premiumRejectReason: null
  });
  showToast('⭐ Premium Membership activated!');
}
function rejectPremiumTeacher(id) {
  const reason = prompt('Enter rejection reason:');
  if (reason === null) return;
  updateData('teachers', id, { premiumStatus: 'Rejected', premiumRejectReason: reason || 'Not specified' });
  showToast('❌ Premium payment rejected', 'error');
}
function addPremiumLead() {
  const data = {
    name: document.getElementById('pl_name').value.trim(),
    class: document.getElementById('pl_class').value.trim(),
    subject: document.getElementById('pl_subject').value.trim(),
    board: document.getElementById('pl_board').value,
    location: document.getElementById('pl_location').value.trim(),
    tuitionType: document.getElementById('pl_tuition_type').value,
    timing: document.getElementById('pl_timing').value.trim(),
    days: document.getElementById('pl_days').value.trim(),
    budget: document.getElementById('pl_budget').value.trim(),
    requirement: document.getElementById('pl_requirement').value.trim(),
    expiry: document.getElementById('pl_expiry').value,
    status: document.getElementById('pl_status').value,
    applications: 0,
    createdAt: new Date().toISOString()
  };
  if (!data.class || !data.subject || !data.location) { showToast('⚠️ Class, Subject & Location are required!', 'error'); return; }
  if (editingPremiumLeadId !== null) {
    updateData('premiumLeads', editingPremiumLeadId, data);
    showToast('✅ Premium Lead updated!');
    cancelEditPremiumLead();
    renderAdminPremiumLeads();
    return;
  }
  addData('premiumLeads', data);
  showToast('✅ Premium Lead published!');
  document.querySelectorAll('#premium-sub-leads .admin-form input, #premium-sub-leads .admin-form textarea').forEach(el => el.value = '');
  renderAdminPremiumLeads();
}
function renderAdminPremiumLeads() {
  const leads = getData('premiumLeads');
  const tbody = document.getElementById('adminPremiumLeadsTable');
  if (!tbody) return;
  tbody.innerHTML = leads.length ? leads.map(l => `
    <tr>
      <td><strong>#${l.id}</strong></td>
      <td>${l.name || '-'}</td>
      <td>${l.class}</td>
      <td>${l.subject}</td>
      <td>${l.board}</td>
      <td>${l.location}</td>
      <td>${l.tuitionType}</td>
      <td>${l.budget || '-'}</td>
      <td>${l.expiry || '-'}</td>
      <td>${l.status === 'Active' ? '🟢 Active' : '🔴 Closed'}</td>
      <td>${l.applications || 0}</td>
      <td>
        <div class="lead-action-row">
          <button class="btn btn-outline btn-sm" onclick="editPremiumLead(${l.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteData('premiumLeads', ${l.id})"><i class="fas fa-trash"></i></button>
        </div>
        <label class="mini-toggle-row"><input type="checkbox" ${getPendingOrActual('premiumLeads', l.id, l.visible !== false) ? 'checked' : ''} onchange="stageVisibilityChange('premiumLeads', ${l.id}, this.checked, renderAdminPremiumLeads)"> ${getPendingOrActual('premiumLeads', l.id, l.visible !== false) ? 'Visible — click Save to hide' : 'Hidden — click Save to show'}</label>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="12" style="text-align:center;color:var(--gray);">No premium leads yet.</td></tr>';
}
let editingPremiumLeadId = null;
function editPremiumLead(id) {
  const l = getData('premiumLeads').find(x => x.id === id);
  if (!l) return;
  editingPremiumLeadId = id;
  document.getElementById('pl_name').value = l.name || '';
  document.getElementById('pl_class').value = l.class || '';
  document.getElementById('pl_subject').value = l.subject || '';
  document.getElementById('pl_board').value = l.board || 'CBSE';
  document.getElementById('pl_location').value = l.location || '';
  document.getElementById('pl_tuition_type').value = l.tuitionType || 'Home Tuition';
  document.getElementById('pl_timing').value = l.timing || '';
  document.getElementById('pl_days').value = l.days || '';
  document.getElementById('pl_budget').value = l.budget || '';
  document.getElementById('pl_expiry').value = l.expiry || '';
  document.getElementById('pl_status').value = l.status || 'Active';
  document.getElementById('pl_requirement').value = l.requirement || '';
  const btn = document.querySelector('#premium-sub-leads .btn-accent');
  if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Update Premium Lead';
  document.getElementById('premium-sub-leads').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function cancelEditPremiumLead() {
  editingPremiumLeadId = null;
  document.querySelectorAll('#premium-sub-leads .admin-form input, #premium-sub-leads .admin-form textarea').forEach(el => el.value = '');
  const btn = document.querySelector('#premium-sub-leads .btn-accent');
  if (btn) btn.innerHTML = '<i class="fas fa-plus"></i> Publish Premium Lead';
}
// ================================================================
// Floating FAQ + Ask/Suggest/Share widgets (admin controlled)
// ================================================================
// Floating FAQ / Ask buttons — styled and behave just like the chatbot
// bubble (always visible, no visitor-facing close button). Admin fully
// controls them from Admin > Floating Widgets: show/hide, label (shown as
// a tooltip), and which side of the screen they sit on.
const FW_DEFAULTS = { side: 'right', faq: { on: true, label: 'FAQ' }, ask: { on: true, label: 'Ask / Suggest' } };
function openFw(k) {
  const p = document.getElementById('fwPanel-' + k), was = p.classList.contains('show');
  document.querySelectorAll('.fw-panel').forEach(x => x.classList.remove('show'));
  if (!was) { p.classList.add('show'); if (typeof closeChatbot === 'function') { try { closeChatbot(); } catch (e) {} } }
}
function closeFw(k) { document.getElementById('fwPanel-' + k).classList.remove('show'); }
function populateFloatWidgetsForm() {
  const c = getFloatWidgets();
  document.getElementById('fw_faq_on').checked = c.faq.on; document.getElementById('fw_faq_label').value = c.faq.label;
  document.getElementById('fw_ask_on').checked = c.ask.on; document.getElementById('fw_ask_label').value = c.ask.label;
  document.getElementById('fw_side').value = c.side;
}
function saveFloatWidgets() {
  const g = id => document.getElementById(id);
  fsSettingsSave('floatWidgets', {
    side: g('fw_side').value,
    faq: { on: g('fw_faq_on').checked, label: g('fw_faq_label').value.trim() || 'FAQ' },
    ask: { on: g('fw_ask_on').checked, label: g('fw_ask_label').value.trim() || 'Ask / Suggest' }
  });
  renderFloatWidgets();
  showToast('✅ Floating widgets saved!');
}
// ================================================================
// Parent Feedback / Testimonials
// ================================================================
async function addFeedback() {
  const name = document.getElementById('fb_name').value.trim();
  const review = document.getElementById('fb_review').value.trim();
  if (!name || !review) { showToast('⚠️ Parent name & review are required!', 'error'); return; }
  const photoFile = document.getElementById('fb_photo').files[0];
  let photoData = null;
  if (photoFile) {
    if (photoFile.size > 5 * 1024 * 1024) { showToast('⚠️ Photo must be under 5MB!', 'error'); return; }
    try { photoData = await uploadToCloudinary(photoFile, 'image', 'althea-scholar/testimonials'); }
    catch (err) { showToast('⚠️ ' + (err.message || 'Photo upload failed — check your internet connection.'), 'error'); return; }
  }
  if (editingFeedbackId !== null) {
    const updates = { name, location: document.getElementById('fb_location').value.trim(), rating: parseInt(document.getElementById('fb_rating').value, 10), review };
    if (photoData) updates.photoData = photoData;
    updateData('parentFeedbacks', editingFeedbackId, updates);
    showToast('✅ Feedback updated!');
    cancelEditFeedback();
    renderAdminFeedback();
    return;
  }
  const currentShown = getData('parentFeedbacks').filter(f => f.showOnHome).length;
  const willShow = currentShown < 6;
  const data = {
    name: name,
    location: document.getElementById('fb_location').value.trim(),
    rating: parseInt(document.getElementById('fb_rating').value, 10),
    review: review,
    photoData: photoData,
    showOnHome: willShow
  };
  addData('parentFeedbacks', data);
  showToast(willShow ? '✅ Feedback added and shown on homepage!' : '✅ Feedback added — homepage already shows 6, toggle "Shown" on one below to swap it in.');
  document.getElementById('fb_name').value = '';
  document.getElementById('fb_location').value = '';
  document.getElementById('fb_review').value = '';
  document.getElementById('fb_photo').value = '';
  renderAdminFeedback();
}
function toggleFeedbackShow(id, checked) {
  const items = getData('parentFeedbacks');
  // Count how many would be "shown" after this change, taking any other
  // staged-but-unsaved toggles into account too (not just what's saved).
  const shownCount = items.filter(f => f.id !== id && getPendingOrActual('parentFeedbacks', f.id, f.showOnHome)).length;
  if (checked && shownCount >= 6) {
    showToast('⚠️ Maximum 6 feedbacks can be shown on homepage. Unselect one first.', 'error');
    renderAdminFeedback();
    return;
  }
  stageVisibilityChange('parentFeedbacks', id, checked, renderAdminFeedback);
}
function renderAdminFeedback() {
  const items = getData('parentFeedbacks');
  const tbody = document.getElementById('adminFeedbackTable');
  if (!tbody) return;
  tbody.innerHTML = items.length ? items.slice().reverse().map(f => `
    <tr>
      <td>${f.photoData ? `<img class="img-thumb-sm" src="${f.photoData}">` : '<i class="fas fa-user-circle" style="font-size:30px;color:var(--border);"></i>'}</td>
      <td><strong>${f.name}</strong></td>
      <td>${f.location || '-'}</td>
      <td>${'⭐'.repeat(f.rating || 5)}</td>
      <td style="max-width:220px;">${(f.review || '').slice(0, 80)}${(f.review || '').length > 80 ? '…' : ''}</td>
      <td><label class="mini-toggle-row"><input type="checkbox" ${getPendingOrActual('parentFeedbacks', f.id, f.showOnHome) ? 'checked' : ''} onchange="toggleFeedbackShow(${f.id}, this.checked)"> ${getPendingOrActual('parentFeedbacks', f.id, f.showOnHome) ? 'Shown' : 'Hidden'}</label></td>
      <td><button class="btn btn-outline btn-sm" onclick="editFeedback(${f.id})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm" onclick="deleteData('parentFeedbacks', ${f.id})"><i class="fas fa-trash"></i></button></td>
    </tr>
  `).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--gray);">No feedback yet.</td></tr>';
}
let editingFeedbackId = null;
function editFeedback(id) {
  const f = getData('parentFeedbacks').find(x => x.id === id);
  if (!f) return;
  editingFeedbackId = id;
  document.getElementById('fb_name').value = f.name;
  document.getElementById('fb_location').value = f.location || '';
  document.getElementById('fb_rating').value = f.rating || 5;
  document.getElementById('fb_review').value = f.review || '';
  const btn = document.querySelector('#admin-feedback .btn-green');
  if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Update Feedback';
  document.getElementById('admin-feedback').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function cancelEditFeedback() {
  editingFeedbackId = null;
  document.getElementById('fb_name').value = '';
  document.getElementById('fb_location').value = '';
  document.getElementById('fb_review').value = '';
  const btn = document.querySelector('#admin-feedback .btn-green');
  if (btn) btn.innerHTML = '<i class="fas fa-plus"></i> Add Feedback';
}
// ================================================================
// Homepage public display: Announcements strip + Testimonials
// ================================================================
// ================================================================
// Platform Policy — admin editable for both Teacher & Student forms
// ================================================================
const POLICY_DEFAULTS = {
  teacher: [
    ['First Month Fee', 'For the first month, Althea will collect the tuition fee — 40% Althea / 60% Teacher.'],
    ['From the Second Month', 'The teacher will collect the tuition fee directly from the parent/student.'],
    ['No Bypass', 'Teachers must not make any direct or private arrangement with parents/students to bypass Althea.'],
    ['Genuine Documents', 'All information and documents submitted by the teacher must be genuine, accurate and verifiable.'],
    ['Confidentiality', 'Parent and student information must be kept strictly confidential and must not be misused or shared without permission.'],
    ['Professional Conduct', 'Fraud, cheating, misrepresentation or misconduct with any parent, student, institution or Althea may result in account termination and appropriate legal action.'],
    ['Assignment', 'Registration does not guarantee a tuition assignment.'],
    ['Agreement', "By registering, the teacher confirms acceptance of Althea's Terms & Conditions and Privacy Policy."]
  ],
  student: [
    ['First Month Fee', "The first month's tuition fee will be collected by Althea."],
    ['From the Second Month', 'The teacher will collect the tuition fee directly from the parent/student.'],
    ['No Direct Deal', 'Parents/students must not make any direct or private arrangement with the teacher to bypass Althea.'],
    ['Genuine Information', 'All information provided during registration must be accurate and genuine.'],
    ['Confidentiality', 'Student, parent and teacher information must be kept confidential and used only for tuition-related purposes.'],
    ['Misconduct', 'Fraud, cheating, false information or misconduct may result in account termination and appropriate legal action.'],
    ['Teacher Availability', 'Registration does not guarantee teacher availability or assignment.'],
    ['Agreement', "By submitting the form, the parent/guardian confirms acceptance of Althea's Terms & Conditions and Privacy Policy."]
  ]
};
function policyPointsToText(points) { return points.map(([t, d]) => t ? `${t}::${d}` : d).join('\n'); }
function policyTextToPoints(text) {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    const idx = line.indexOf('::');
    return idx !== -1 ? [line.slice(0, idx).trim(), line.slice(idx + 2).trim()] : ['', line];
  });
}
// ================================================================
// Notice shown at the top of the Student Registration form
// ================================================================
const STUDENT_NOTICE_DEFAULT = "Looking for the right tutor for your child? Register below — our team will personally connect with you and help arrange a tutor within 24 hours. Registration takes less than 2 minutes, so please fill the form first and we'll take care of the rest!";
// ================================================================
// Festival / Occasion Popup Banner — shown to every visitor when the
// site opens, fully admin-controlled (on/off, text, image, button).
// ================================================================
const FESTIVAL_POPUP_DEFAULT = {
  enabled: true,
  title: 'Happy Raksha Bandhan!',
  emoji: '🎉',
  message: 'Wishing every student, teacher and parent a joyful Raksha Bandhan! May this bond of love and trust make your learning journey even sweeter. 🪢',
  image: '',
  btnText: 'Explore Study Material',
  btnPage: 'page-study'
};
let _festivalPopupDismissedThisSession = false;
function populateFestivalPopupForm() {
  const p = getFestivalPopup();
  document.getElementById('fp_enabled').checked = !!p.enabled;
  document.getElementById('fp_title').value = p.title;
  document.getElementById('fp_emoji').value = p.emoji;
  document.getElementById('fp_message').value = p.message;
  document.getElementById('fp_btn_text').value = p.btnText || '';
  document.getElementById('fp_btn_page').value = p.btnPage || '';
  const prev = document.getElementById('fp_image_preview');
  if (p.image) { prev.src = p.image; prev.style.display = 'block'; prev.dataset.data = p.image; }
  else { prev.style.display = 'none'; delete prev.dataset.data; }
}
async function fpImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 6 * 1024 * 1024) { showToast('⚠️ Image too big! Max 6MB.', 'error'); input.value = ''; return; }
  showToast('⏳ Uploading poster...');
  let url;
  try { url = await uploadToCloudinary(file, 'image', 'althea-scholar/festival-popup'); }
  catch (err) { showToast('⚠️ ' + (err.message || 'Upload failed — check your internet connection.'), 'error'); return; }
  const prev = document.getElementById('fp_image_preview');
  prev.src = url; prev.style.display = 'block'; prev.dataset.data = url;
  showToast('✅ Poster ready — click Save to apply.');
}
function fpClearImage() {
  const prev = document.getElementById('fp_image_preview');
  prev.style.display = 'none'; delete prev.dataset.data; prev.src = '';
}
function saveFestivalPopup() {
  const prev = document.getElementById('fp_image_preview');
  const p = {
    enabled: document.getElementById('fp_enabled').checked,
    title: document.getElementById('fp_title').value.trim() || FESTIVAL_POPUP_DEFAULT.title,
    emoji: document.getElementById('fp_emoji').value.trim() || FESTIVAL_POPUP_DEFAULT.emoji,
    message: document.getElementById('fp_message').value.trim() || FESTIVAL_POPUP_DEFAULT.message,
    image: prev.dataset.data || '',
    btnText: document.getElementById('fp_btn_text').value.trim(),
    btnPage: document.getElementById('fp_btn_page').value
  };
  fsSettingsSave('festivalPopup', p);
  showToast(p.enabled ? '✅ Popup saved — now showing to visitors!' : '✅ Popup saved — currently turned off.');
}
// ================================================================
// Site Branding — logo, brand colours & heading font. Fully
// admin-controlled from Admin Panel → Branding & Theme.
// ================================================================
// Default logo mark (used when no custom logo has been uploaded from the
// Admin Panel) — an open book with a growing leafy tree, echoing the
// brand's "Learn · Grow · Succeed" motif in blue & gold.
const DEFAULT_LOGO_SVG = `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 62 C 50 52, 42 50, 32 47 C 24 45, 20 40, 20 34" stroke="#0A4174" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M50 62 C 50 52, 58 50, 68 47 C 76 45, 80 40, 80 34" stroke="#0A4174" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="20" cy="30" rx="9" ry="6" fill="#e0a83a" transform="rotate(-30 20 30)"/>
  <ellipse cx="80" cy="30" rx="9" ry="6" fill="#e0a83a" transform="rotate(30 80 30)"/>
  <path d="M50 60 L50 24" stroke="#F5B942" stroke-width="4" stroke-linecap="round"/>
  <path d="M50 24 L44 34 L56 34 Z" fill="#F5B942"/>
  <path d="M12 78 C 12 70, 28 66, 50 66 C 72 66, 88 70, 88 78 L88 84 C 88 84, 72 80, 50 80 C 28 80, 12 84, 12 84 Z" fill="#0A4174"/>
  <path d="M50 66 L50 80" stroke="#fff" stroke-width="2" opacity="0.5"/>
</svg>`;
const BRANDING_DEFAULT = {
  logo_image: '',
  logo_text_top: 'Althea Scholar',
  logo_text_bottom: 'by Shree',
  color_primary: '#0A4174',
  color_secondary: '#001D39',
  font_heading: 'Poppins'
};
let _lastAppliedLogoImage;
function populateBrandingForm() {
  const b = getBranding();
  document.getElementById('brand_logo_top').value = b.logo_text_top;
  document.getElementById('brand_logo_bottom').value = b.logo_text_bottom;
  document.getElementById('brand_color_primary').value = b.color_primary;
  document.getElementById('brand_color_secondary').value = b.color_secondary;
  document.getElementById('brand_font').value = b.font_heading;
  const prev = document.getElementById('brand_logo_preview');
  if (b.logo_image) { prev.src = b.logo_image; prev.style.display = 'block'; prev.dataset.data = b.logo_image; }
  else { prev.style.display = 'none'; delete prev.dataset.data; }
}
async function brandLogoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) { showToast('⚠️ Logo image too big! Max 4MB.', 'error'); input.value = ''; return; }
  showToast('⏳ Uploading logo...');
  let url;
  try { url = await uploadToCloudinary(file, 'image', 'althea-scholar/branding'); }
  catch (err) { showToast('⚠️ ' + (err.message || 'Upload failed — check your internet connection.'), 'error'); return; }
  const prev = document.getElementById('brand_logo_preview');
  prev.src = url; prev.style.display = 'block'; prev.dataset.data = url;
  showToast('✅ Logo ready — click Save to apply.');
}
function brandLogoClear() {
  const prev = document.getElementById('brand_logo_preview');
  prev.style.display = 'none'; delete prev.dataset.data; prev.src = '';
}
function saveBranding() {
  const prev = document.getElementById('brand_logo_preview');
  const b = {
    logo_image: prev.dataset.data || '',
    logo_text_top: document.getElementById('brand_logo_top').value.trim() || BRANDING_DEFAULT.logo_text_top,
    logo_text_bottom: document.getElementById('brand_logo_bottom').value.trim() || BRANDING_DEFAULT.logo_text_bottom,
    color_primary: document.getElementById('brand_color_primary').value || BRANDING_DEFAULT.color_primary,
    color_secondary: document.getElementById('brand_color_secondary').value || BRANDING_DEFAULT.color_secondary,
    font_heading: document.getElementById('brand_font').value || BRANDING_DEFAULT.font_heading
  };
  fsSettingsSave('branding', b);
  applyBranding();
  showToast('✅ Branding saved and applied!');
}
function previewFestivalPopup() {
  const prev = document.getElementById('fp_image_preview');
  const p = {
    title: document.getElementById('fp_title').value.trim() || FESTIVAL_POPUP_DEFAULT.title,
    emoji: document.getElementById('fp_emoji').value.trim() || FESTIVAL_POPUP_DEFAULT.emoji,
    message: document.getElementById('fp_message').value.trim() || FESTIVAL_POPUP_DEFAULT.message,
    image: prev.dataset.data || '',
    btnText: document.getElementById('fp_btn_text').value.trim(),
    btnPage: document.getElementById('fp_btn_page').value
  };
  renderFestivalPopupContent(p);
  document.getElementById('festivalPopupOverlay').classList.add('show');
}
// ================================================================
// AI Chat Widget — answers common questions automatically from an
// admin-editable FAQ list; anything it can't confidently match is
// handed off to WhatsApp (pre-filled with the visitor's question) so
// admin gets notified and can reply personally.
// ================================================================
const CHATBOT_FAQ_DEFAULTS = () => ([
  { keywords: ['register', 'registration', 'sign up', 'how to join', 'how to register', 'how do i register'], answer: "You can register in under 2 minutes! Tap 'Find Tutor' if you're a parent/student, or 'Become a Teacher' if you're a teacher — both are in the top menu. You'll get a unique Registration ID as soon as you submit. 🎓" },
  { keywords: ['fee', 'fees', 'cost', 'price', 'charge', 'charges', 'how much'], answer: "Tuition fees vary by class, subject and teacher experience — you'll see the exact fee once matched with a tutor. Registration itself is completely free for both students and teachers!" },
  { keywords: ['premium', 'premium membership', 'premium teacher', 'premium plan'], answer: "Premium Membership gives teachers priority leads, a premium badge, and priority profile visibility. You can see the exact price & benefits on the Teacher Registration page under 'Membership Plan'. ⭐" },
  { keywords: ['subject', 'subjects', 'which subjects', 'what subjects'], answer: "We cover all major subjects for Classes 6–12 (Maths, Science, English, Hindi, Social Science and more) plus entrance exam prep. Check the 'Study Material' menu for the full subject/chapter list. 📚" },
  { keywords: ['city', 'cities', 'location', 'area', 'where', 'which cities'], answer: "We connect students and tutors across 70+ cities in India — both home tuition and online tuition are available. If your city isn't listed yet, we're expanding daily!" },
  { keywords: ['online', 'home tuition', 'mode', 'online tuition', 'in person'], answer: "Both Home Tuition and Online Tuition are available — you can choose your preferred mode (or 'Both') while registering as a student." },
  { keywords: ['study material', 'notes', 'pdf', 'download', 'mind map', 'exercise'], answer: "You'll find free notes, mind maps, exercise Q&A, extra questions, practice papers and previous year papers under 'Study Material' — organised by Class → Subject → Chapter. All resources are view-only on the site (no download), so you can always come back to them." },
  { keywords: ['entrance', 'sainik', 'navodaya', 'jnv', 'rms', 'amu', 'bhu', 'entrance exam'], answer: "We have dedicated prep material for Sainik School (AISSEE), Navodaya (JNVST), RMS CET, AMU and BHU entrance exams for Class 6 & 9 — check the 'Entrance Exams' menu for syllabus, pattern, notes and previous year papers." },
  { keywords: ['contact', 'phone', 'number', 'call', 'reach you', 'support'], answer: "You can reach us on WhatsApp anytime, or check the Contact page for our phone number and email — we usually reply within a few hours." },
  { keywords: ['id', 'registration id', 'my id', 'lost id', 'find my id'], answer: "Your unique Registration ID was shown right after you submitted the form (e.g. ALT-BT-xxxxxx / ALT-ST-xxxxxx). If you've lost it, contact us on WhatsApp with your registered mobile number and we'll help you find it." },
  { keywords: ['teacher process', 'how does it work for teachers', 'teacher verification', 'verify teacher', 'background check'], answer: "After a teacher registers, our team verifies the documents submitted (ID, qualification, etc.) before the profile goes live. Verified teachers get matched with relevant student leads based on subject, class and location." },
  { keywords: ['demo', 'trial class', 'free class', 'demo class'], answer: "Most teachers offer a demo/trial class before you commit — you can discuss this directly with your matched tutor once connected." },
  { keywords: ['cancel', 'cancellation', 'refund', 'stop tuition'], answer: "You can discuss stopping or changing a tuition arrangement directly with your assigned tutor or with our support team on WhatsApp — we're happy to help sort it out." },
  { keywords: ['payment', 'pay', 'upi', 'how do i pay'], answer: "For Premium Teacher Membership, payment is via UPI/QR shown on the Teacher Registration page — scan, pay, then enter your transaction ID. Regular tuition fees are settled directly between student and teacher." },
  { keywords: ['document', 'documents', 'what documents', 'aadhaar', 'id proof'], answer: "For teacher registration, we typically need an ID proof (like Aadhaar) and qualification proof (degree/certificate). Students don't need to upload any documents to register." },
  { keywords: ['class', 'classes', 'which class', 'grade', 'standard'], answer: "We cover Classes 6 to 12 across CBSE and other major boards, plus entrance exam prep for Class 6 & 9 (Sainik School, Navodaya, RMS, AMU, BHU)." },
  { keywords: ['blog', 'articles', 'tips'], answer: "Check out our Blog (in the top menu) for study tips, parenting advice, and updates about the platform." },
  { keywords: ['app', 'mobile app', 'download app'], answer: "You can access everything from your mobile browser right here — no separate app needed. Just bookmark the site for quick access!" },
  { keywords: ['hobby', 'hobby classes', 'dance', 'singing', 'music', 'guitar', 'piano', 'chess', 'art', 'drawing'], answer: "Yes! Besides academics, we help you find teachers for hobby & skill classes — dance, singing, guitar, piano, keyboard, chess, art & craft and more, at home or online. Tap 'Find Tutor' and mention the hobby/skill in your requirement. 🎨" },
  { keywords: ['language', 'language classes', 'spoken english', 'french', 'german', 'spanish', 'sanskrit', 'foreign language'], answer: "We can connect you with teachers for spoken English and foreign/Indian languages (French, German, Spanish, Sanskrit and more) — both home and online classes available." },
  { keywords: ['small kids', 'nursery', 'kg', 'primary', 'class 1', 'class 2', 'class 3', 'class 4', 'class 5', 'foundation'], answer: "Yes, we cover Nursery/KG and Classes 1–5 (foundation level) as well, in addition to Classes 6–12 and entrance exam prep — just mention the class while registering." },
  { keywords: ['nri', 'abroad', 'outside india', 'international', 'usa', 'uk', 'dubai', 'other country'], answer: "Online classes work great for students outside India too — time zones and scheduling are worked out directly with your matched teacher. Just choose 'Online' mode while registering, from anywhere in the world. 🌍" },
  { keywords: ['safe', 'is it safe', 'trust', 'genuine', 'fraud', 'scam', 'legit'], answer: "We're a platform that helps parents/students and teachers find and connect with each other — we check teacher documents before a profile goes live, fees are agreed directly between you and the teacher, and we never ask for large upfront payments. If anything feels off, reach out to us on WhatsApp right away." },
  { keywords: ['how does this work', 'how does it work', 'what is this platform', 'about', 'what is althea scholar'], answer: "Althea Scholar is a platform that connects students/parents looking for tutors with teachers who want to teach — for home tuition, online tuition, study material and hobby/language classes. We help you find the right match; the actual classes and fee arrangement happen directly between student and teacher." },
  { keywords: ['commission', 'how do you earn', 'do you charge teachers', 'platform fee'], answer: "Registration is free for everyone. We may charge a small platform/membership fee in certain cases (like Premium Teacher Membership) — full details are always shown upfront on the relevant page before you pay anything." },
  { keywords: ['group tuition', 'batch', 'one on one', 'individual tuition'], answer: "Both one-on-one and small group/batch tuition can usually be arranged — just mention your preference while posting your requirement, and we'll try to match you accordingly." },
  { keywords: ['exam prep', 'board exam', 'jee', 'neet', 'competitive exam'], answer: "Along with school subjects (Classes 6–12) and Sainik School/Navodaya/RMS/AMU/BHU entrance prep, you can also request a tutor for board exam revision or competitive exam foundation — mention it in your requirement." }
]);
let editingChatbotFaqId = null;
function renderAdminChatbotFaqs() {
  const faqs = getChatbotFaqs();
  const tbody = document.getElementById('adminChatbotTable');
  if (!tbody) return;
  tbody.innerHTML = faqs.length ? faqs.map(f => `
    <tr>
      <td>${(f.keywords || []).join(', ')}</td>
      <td>${f.answer}</td>
      <td><button class="btn btn-outline btn-sm" onclick="editChatbotFaq(${f.id})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm" onclick="deleteData('chatbotFaqs', ${f.id}); renderAdminChatbotFaqs();"><i class="fas fa-trash"></i></button></td>
    </tr>
  `).join('') : '<tr><td colspan="3" style="text-align:center;color:var(--gray);">No FAQs yet.</td></tr>';
}
function addOrUpdateChatbotFaq() {
  const keywordsRaw = document.getElementById('cb_keywords').value.trim();
  const answer = document.getElementById('cb_answer').value.trim();
  if (!keywordsRaw || !answer) { showToast('⚠️ Keywords & Answer are required!', 'error'); return; }
  const keywords = keywordsRaw.split(',').map(k => k.trim()).filter(Boolean);
  if (editingChatbotFaqId !== null) {
    updateData('chatbotFaqs', editingChatbotFaqId, { keywords, answer });
    showToast('✅ FAQ updated!');
    cancelEditChatbotFaq();
  } else {
    addData('chatbotFaqs', { keywords, answer });
    showToast('✅ FAQ added!');
    document.getElementById('cb_keywords').value = '';
    document.getElementById('cb_answer').value = '';
  }
  renderAdminChatbotFaqs();
}
function editChatbotFaq(id) {
  const f = getData('chatbotFaqs').find(x => x.id === id);
  if (!f) return;
  editingChatbotFaqId = id;
  document.getElementById('cb_keywords').value = (f.keywords || []).join(', ');
  document.getElementById('cb_answer').value = f.answer;
  document.getElementById('cb_edit_banner').style.display = 'block';
  document.getElementById('cb_submit_btn').innerHTML = '<i class="fas fa-save"></i> Update FAQ';
  document.getElementById('admin-chatbot').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function cancelEditChatbotFaq() {
  editingChatbotFaqId = null;
  document.getElementById('cb_keywords').value = '';
  document.getElementById('cb_answer').value = '';
  document.getElementById('cb_edit_banner').style.display = 'none';
  document.getElementById('cb_submit_btn').innerHTML = '<i class="fas fa-plus"></i> Add FAQ';
}
// ================================================================
// Website FAQs — shown in a visible "Frequently Asked Questions"
// section on the homepage (separate from the chatbot's keyword-match
// FAQs above). This is the content Google reads for FAQ rich results,
// so keep it honest and specific — no invented numbers or claims.
// ================================================================
const SITE_FAQ_DEFAULTS = () => ([
  { question: "Is Althea Scholar a tuition center or an online platform?", answer: "Althea Scholar is an online platform, not a physical tuition center. We help students/parents and teachers find each other for home tuition, online tuition, and hobby/language classes across India — the actual classes happen at the student's home, online, or wherever student and teacher agree." },
  { question: "Do you provide home tuition and online tuition in my city?", answer: "We help connect students and teachers across 70+ cities in India for both home tuition and online tuition. Online classes are available from anywhere, including outside India. If your exact city isn't listed yet, message us on WhatsApp — we're adding more cities regularly." },
  { question: "Is registration free?", answer: "Yes, registration is completely free for both students/parents and teachers. Some optional features for teachers (like Premium Membership) have a small fee, which is always shown clearly before you pay anything." },
  { question: "How are teachers verified?", answer: "Before a teacher's profile goes live, we check the documents (ID and qualification proof) they submit. Fee and schedule are then discussed and finalised directly between the student/parent and the teacher." },
  { question: "What classes and subjects are covered?", answer: "Nursery/KG through Class 12 across major boards, all main subjects, plus entrance exam preparation (Sainik School/AISSEE, Navodaya/JNVST, RMS CET, AMU, BHU) and hobby/language classes like dance, music, art, chess and spoken languages." },
  { question: "Is free study material really free?", answer: "Yes — notes, mind maps, exercise solutions and previous year papers under 'Study Material' are free to view on the site for everyone, organised by Class → Subject → Chapter." },
  { question: "How do I get matched with a tutor?", answer: "Tap 'Find Tutor', share your requirement (class, subject, city, mode), and we'll help match you with a suitable, available teacher. Most teachers offer a free demo class before you commit." },
  { question: "How do I register as a teacher?", answer: "Tap 'Become a Teacher' in the menu, fill in your subjects, classes, experience and preferred cities/online mode. You'll get a Registration ID instantly, and your profile goes live after document verification." }
]);
let editingSiteFaqId = null;
function renderAdminSiteFaqs() {
  const faqs = getSiteFaqs();
  const tbody = document.getElementById('adminSiteFaqTable');
  if (!tbody) return;
  tbody.innerHTML = faqs.length ? faqs.map(f => `
    <tr>
      <td>${f.question}</td>
      <td>${f.answer}</td>
      <td><button class="btn btn-outline btn-sm" onclick="editSiteFaq(${f.id})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm" onclick="deleteData('siteFaqs', ${f.id}); renderAdminSiteFaqs(); renderFaqSection();"><i class="fas fa-trash"></i></button></td>
    </tr>
  `).join('') : '<tr><td colspan="3" style="text-align:center;color:var(--gray);">No FAQs yet.</td></tr>';
}
function addOrUpdateSiteFaq() {
  const question = document.getElementById('sf_question').value.trim();
  const answer = document.getElementById('sf_answer').value.trim();
  if (!question || !answer) { showToast('⚠️ Question & Answer are required!', 'error'); return; }
  if (editingSiteFaqId !== null) {
    updateData('siteFaqs', editingSiteFaqId, { question, answer });
    showToast('✅ FAQ updated!');
    cancelEditSiteFaq();
  } else {
    addData('siteFaqs', { question, answer });
    showToast('✅ FAQ added!');
    document.getElementById('sf_question').value = '';
    document.getElementById('sf_answer').value = '';
  }
  renderAdminSiteFaqs();
  renderFaqSection();
}
function editSiteFaq(id) {
  const f = getSiteFaqs().find(x => x.id === id);
  if (!f) return;
  editingSiteFaqId = id;
  document.getElementById('sf_question').value = f.question;
  document.getElementById('sf_answer').value = f.answer;
  document.getElementById('sf_edit_banner').style.display = 'block';
  document.getElementById('sf_submit_btn').innerHTML = '<i class="fas fa-save"></i> Update FAQ';
  document.getElementById('admin-site-faq').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function cancelEditSiteFaq() {
  editingSiteFaqId = null;
  document.getElementById('sf_question').value = '';
  document.getElementById('sf_answer').value = '';
  document.getElementById('sf_edit_banner').style.display = 'none';
  document.getElementById('sf_submit_btn').innerHTML = '<i class="fas fa-plus"></i> Add FAQ';
}
// ================================================================
// Community Submissions — a single homepage form for 4 kinds of visitor
// input, each routed to a different destination once an admin approves:
//   question   -> becomes a real entry in siteFaqs (admin supplies the
//                 answer at approval time) and shows in the FAQ section.
//   feedback   -> becomes a real entry in parentFeedbacks and shows in
//                 the Testimonials section (same as admin-added reviews).
//   blog       -> becomes a real entry in blogPosts and shows on the
//                 Blog tab (same as admin-written posts).
//   suggestion -> never shown publicly anywhere — stays visible only in
//                 this admin tab, "Approve" here just marks it Reviewed.
// All four land first in one 'visitorPosts' collection as "pending" so
// nothing a visitor writes reaches the site until an admin acts on it.
// ================================================================
const VISITOR_POST_TYPE_LABEL = { question: '❓ Question', feedback: '⭐ Feedback', blog: '✍️ Blog Post', suggestion: '💡 Suggestion' };
// Admin table — every submission regardless of status, with type-aware moderation.
let editingVisitorPostId = null;
function renderAdminVisitorPosts() {
  const tbody = document.getElementById('adminCommunityTable');
  if (!tbody) return;
  const posts = getVisitorPosts().sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
  const statusColor = { pending: '#8a5300', published: '#1451b8', reviewed: '#1451b8' };
  const destLabel = { question: '→ FAQ', feedback: '→ Testimonials', blog: '→ Blog tab', suggestion: '(internal only)' };
  tbody.innerHTML = posts.length ? posts.map(p => `
    <tr>
      <td>${VISITOR_POST_TYPE_LABEL[p.type] || p.type}<br><span style="font-size:11px;color:var(--gray);">${destLabel[p.type] || ''}</span></td>
      <td>${p.name}</td>
      <td><strong>${p.title || '(question)'}</strong><br><span style="font-size:12px;color:var(--gray);">${(p.content || '').slice(0, 80)}${(p.content || '').length > 80 ? '…' : ''}</span>${p.rating ? '<br><span style="color:#f6a93a;font-size:12px;">' + '⭐'.repeat(p.rating) + '</span>' : ''}</td>
      <td><span style="font-weight:700;color:${statusColor[p.status] || '#8a5300'};text-transform:capitalize;">${p.status}</span></td>
      <td style="white-space:nowrap;">
        ${p.status === 'pending' ? `<button class="btn btn-green btn-sm" onclick="approveVisitorPost(${p.id})"><i class="fas fa-check"></i> ${p.type === 'suggestion' ? 'Mark Reviewed' : 'Approve'}</button>` : ''}
        <button class="btn btn-accent btn-sm" onclick="editVisitorPost(${p.id})"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteData('visitorPosts', ${p.id}); renderAdminVisitorPosts();"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--gray);">No submissions yet.</td></tr>';
}
// Approving routes the item into its real destination collection — it
// isn't just a visibility flag, because each type publishes somewhere
// entirely different (FAQ / Testimonials / Blog), or nowhere at all.
function approveVisitorPost(id) {
  const p = getVisitorPosts().find(x => x.id === id);
  if (!p) return;
  if (p.type === 'suggestion') {
    updateData('visitorPosts', id, { status: 'reviewed' });
    showToast('✅ Marked reviewed.');
    renderAdminVisitorPosts();
    return;
  }
  if (p.type === 'question') {
    const answer = prompt('Write the answer to publish in the FAQ section:\n\nQ: ' + p.content, '');
    if (!answer || !answer.trim()) { showToast('Answer needed to publish a question.', 'error'); return; }
    addData('siteFaqs', { question: p.content, answer: answer.trim() });
  } else if (p.type === 'blog') {
    addData('blogPosts', {
      title: p.title, author: p.name, date: new Date().toISOString(),
      image: '', excerpt: p.content.slice(0, 150), content: p.content, visible: true
    });
  } else if (p.type === 'feedback') {
    addData('parentFeedbacks', {
      name: p.name, location: p.title || '', rating: p.rating || 0,
      review: p.content, photoData: null, showOnHome: true
    });
  }
  updateData('visitorPosts', id, { status: 'published' });
  showToast('✅ Published!');
  renderAdminVisitorPosts();
}
function editVisitorPost(id) {
  const p = getVisitorPosts().find(x => x.id === id);
  if (!p) return;
  editingVisitorPostId = id;
  document.getElementById('cp_edit_title').value = p.title || '';
  document.getElementById('cp_edit_content').value = p.content || '';
  document.getElementById('cp_edit_form').style.display = 'block';
  document.getElementById('cp_edit_banner').style.display = 'block';
  document.getElementById('admin-community').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function saveVisitorPostEdit() {
  if (editingVisitorPostId === null) return;
  updateData('visitorPosts', editingVisitorPostId, {
    title: document.getElementById('cp_edit_title').value.trim(),
    content: document.getElementById('cp_edit_content').value.trim()
  });
  showToast('✅ Submission updated!');
  cancelEditVisitorPost();
  renderAdminVisitorPosts();
}
function cancelEditVisitorPost() {
  editingVisitorPostId = null;
  document.getElementById('cp_edit_form').style.display = 'none';
  document.getElementById('cp_edit_banner').style.display = 'none';
}
// ================================================================
// SEO Landing Pages (standalone pages outside this app — Delhi,
// Mumbai, Lucknow, Cities list, and the 5 subject pages) — content
// and visibility are editable from Admin → SEO Pages, and the pages
// themselves pull this via seo-shared.js. Stored under the same
// 'settings' collection as Branding/Homepage Content (no extra
// Firestore rule needed).
// ================================================================
const SEO_PAGE_LABELS = {
  'home-tuition': 'Home Tuition', 'online-tuition': 'Online Tuition',
  'hobby-and-language-classes': 'Hobby & Language Classes', 'cbse-icse-study-material': 'CBSE/ICSE Study Material',
  'entrance-exam-preparation': 'Entrance Exam Preparation', 'tuition-in-new-delhi': 'Delhi City Page',
  'tuition-in-mumbai': 'Mumbai City Page', 'tuition-in-lucknow': 'Lucknow City Page'
};
const SEO_PAGES_DEFAULT = {"visible": {"home-tuition": true, "online-tuition": true, "hobby-and-language-classes": true, "cbse-icse-study-material": true, "entrance-exam-preparation": true, "tuition-in-new-delhi": true, "tuition-in-mumbai": true, "tuition-in-lucknow": true, "tuition-cities": true}, "pages": {"home-tuition": {"title": "Home Tuition Across India – Home Tutor Listings | Althea Scholar", "desc": "Find home tutors near you across India for all boards, Nursery to Class 12. Free registration, free demo class, transparent fees.", "h1": "Home Tuition Across India", "body": "<p>Home tuition means a qualified teacher comes to your home to teach your child one-on-one or in a small group — no travel, no distraction of a crowded classroom, and a pace set around your child rather than the other way around. Althea Scholar helps students and parents across <a href=\"https://altheascholar.in/tuition-cities.html\">70+ cities in India</a> find home tutors matched to their child's exact board, class, subject and learning style.</p>\n\n<p>We know every child is different — some need a patient teacher who repeats concepts multiple ways, some need someone who can push them harder for board exams, and some just need consistent homework supervision. When you post your requirement with us, we try to understand exactly what kind of help your child needs before suggesting a teacher, instead of just matching on subject name alone.</p>\n\n<h2>How home tuition through Althea Scholar works</h2>\n<ul>\n  <li><strong>Step 1 — Tell us what you need:</strong> class, subject(s), board, your city/area, and preferred days/timing.</li>\n  <li><strong>Step 2 — We suggest a match:</strong> a teacher whose documents we've checked, and whose experience fits your requirement.</li>\n  <li><strong>Step 3 — Free demo class:</strong> see how the teacher explains, how your child responds, before you commit to anything.</li>\n  <li><strong>Step 4 — Agree directly:</strong> fees, schedule and duration are discussed and finalised directly between you and the teacher — no hidden platform charges added on top.</li>\n</ul>\n\n<h2>Who home tuition is right for</h2>\n<p>Nursery/KG and the early years (building reading, writing and number-sense from scratch), Classes 1–5 (foundation subjects), Classes 6–10 (board-focused, subject-wise depth), and Classes 11–12 (Science/Commerce/Arts streams, with exam-pattern practice). We also help with entrance exam preparation for Sainik School (AISSEE), Navodaya (JNVST), RMS CET, AMU and BHU, and with hobby &amp; language classes delivered at home.</p>\n\n<h2>Why parents choose home tuition over a coaching center</h2>\n<ul>\n  <li>Full attention — the teacher's time is not split between 20–30 other students</li>\n  <li>Flexible scheduling around school, sleep and other activities</li>\n  <li>Comfortable, familiar environment for younger or shy children</li>\n  <li>Faster to spot and fix a specific weak topic instead of following one fixed pace for the whole class</li>\n</ul>"}, "online-tuition": {"title": "Online Tuition Classes – Live 1-on-1 Tutors, Nursery to Class 12 | Althea Scholar", "desc": "Online tuition for Nursery to Class 12 — live video classes with teachers for school subjects, entrance exams and hobby classes. Free registration and a free demo class.", "h1": "Online Tuition Classes", "body": "<p>Online tuition lets a student learn from a teacher over a live video call, from anywhere — including outside India. It removes the biggest limitation of home tuition (finding a good teacher physically nearby) while keeping the personal, one-on-one or small-batch format that makes tuition effective in the first place.</p>\n<p>Many parents choose online tuition simply for convenience: no travel for the teacher, no rescheduling because of traffic or weather, and a schedule that works around school pickups and other children. Althea Scholar is an online platform that connects students with teachers — we help you find a suitable teacher, and you can start with a free demo class.</p>\n\n<h2>Online tuition for every class</h2>\n<div class=\"card-grid\"><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-child\"></i></div><h3>Nursery – Class 5</h3><p>Foundation years: reading, writing, numbers and basic concepts, taught in short, activity-based sessions suited to young learners.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-book-reader\"></i></div><h3>Class 6 – 8</h3><p>Middle school: Mathematics, Science, English, Hindi and Social Science — building concepts before the board years begin.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-pen-ruler\"></i></div><h3>Class 9 – 10</h3><p>Secondary: concept clarity, regular practice and board-exam preparation across major boards.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-graduation-cap\"></i></div><h3>Class 11 – 12</h3><p>Senior secondary: subjects across Science, Commerce and Humanities, chosen according to the stream you study.</p></div></div>\n\n<h2>Subjects you can request</h2>\n<p><span class=\"nearby-chip\">Mathematics</span><span class=\"nearby-chip\">Science</span><span class=\"nearby-chip\">Physics</span><span class=\"nearby-chip\">Chemistry</span><span class=\"nearby-chip\">Biology</span><span class=\"nearby-chip\">English</span><span class=\"nearby-chip\">Hindi</span><span class=\"nearby-chip\">Social Science</span><span class=\"nearby-chip\">Accountancy</span><span class=\"nearby-chip\">Business Studies</span><span class=\"nearby-chip\">Economics</span><span class=\"nearby-chip\">Geography</span><span class=\"nearby-chip\">History</span><span class=\"nearby-chip\">Political Science</span><span class=\"nearby-chip\">Psychology</span><span class=\"nearby-chip\">Sociology</span><span class=\"nearby-chip\">Physical Education</span><span class=\"nearby-chip\">Spoken English</span></p>\n<p>Beyond school subjects, you can also ask for <a href=\"https://altheascholar.in/entrance-exam-preparation.html\">entrance exam preparation</a> (Sainik School, Navodaya, RMS, AMU, BHU) and <a href=\"https://altheascholar.in/hobby-and-language-classes.html\">hobby and language classes</a> such as music, art and chess. The teachers available depend on who is registered for your class, subject and timing, so mention your exact requirement when you register.</p>\n\n<h2>Benefits of online tuition</h2>\n<div class=\"card-grid\"><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-house-laptop\"></i></div><h3>Learn from home</h3><p>No commute for the student or the teacher — more time for learning and rest.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-earth-asia\"></i></div><h3>A wider choice of teachers</h3><p>You are not limited to teachers who live near you, which matters most for less common subjects.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-clock\"></i></div><h3>Flexible timing</h3><p>Pick days and slots that fit school hours, homework and family routines.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-plane\"></i></div><h3>Good for NRI and relocating families</h3><p>Students abroad or moving cities can stay connected to Indian boards and syllabi.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-bullseye\"></i></div><h3>Useful for exam preparation</h3><p>For entrance and competitive exams a specialist teacher often matters more than proximity.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-hand-holding-heart\"></i></div><h3>Free demo before you commit</h3><p>Sit through a demo class first and continue only if the teacher suits your child.</p></div></div>\n\n<h2>How online tuition works for students &amp; parents</h2>\n<ol class=\"steps\"><li><strong>Register</strong>Fill the free Find Tutor form with class, subjects, mode (choose Online) and preferred days and timing.</li><li><strong>Get your Student ID</strong>You receive a Student ID as soon as the form is submitted — keep it for reference.</li><li><strong>We reach out on WhatsApp</strong>Our team contacts you with matching teachers, subject to availability for your class and subject.</li><li><strong>Attend a free demo</strong>Meet the teacher on video and check the teaching style before deciding.</li><li><strong>Start classes</strong>Classes run on a video app you and the teacher agree on, such as Zoom, Google Meet or WhatsApp video.</li></ol>\n<p class=\"note-small\">Registration does not guarantee a teacher assignment — matching depends on registered teachers for your requirement.</p>\n\n<h2>How it works for teachers</h2>\n<ol class=\"steps\"><li><strong>Register free</strong>Share your qualifications, subjects, classes, experience and whether you teach online.</li><li><strong>Get your Registration ID</strong>Your ID is generated instantly after submitting the form.</li><li><strong>Documents are reviewed</strong>Your registration starts as Pending and the team reviews it (Pending → Under Review → Verified or Rejected).</li><li><strong>Profile listing</strong>Once your registration is marked Verified, a public teacher profile can be created for you.</li><li><strong>Connect with students</strong>Get connected with students whose class, subject and timing match yours.</li></ol>\n\n<h2>Home tuition vs online tuition</h2>\n<div class=\"cmp-scroll\"><table class=\"cmp-table\">\n<tr><th></th><th><a href=\"https://altheascholar.in/home-tuition.html\">Home tuition</a></th><th>Online tuition</th></tr>\n<tr><td>Where classes happen</td><td>At the student's home</td><td>Over live video, from anywhere</td></tr>\n<tr><td>Choice of teachers</td><td>Teachers who can travel to your area</td><td>Teachers from any location</td></tr>\n<tr><td>Travel time</td><td>Teacher commutes to you</td><td>None</td></tr>\n<tr><td>Interaction</td><td>In person, easy to use paper, models and practicals</td><td>Screen-based; teachers use a shared whiteboard, camera or worksheets</td></tr>\n<tr><td>What you need</td><td>A quiet study space</td><td>A phone, tablet or computer, stable internet and a quiet corner</td></tr>\n<tr><td>Often suits</td><td>Younger children who need in-person attention</td><td>Older students, NRI families, and less common subjects or exams</td></tr>\n</table></div>\n<p>Not sure which is better? Choose <strong>Both</strong> as the tuition mode while registering and tell us your situation.</p>\n\n<h2>What you'll need</h2>\n<p>A phone, tablet or computer with a stable internet connection, and a quiet corner for the class. Most teachers share worksheets or study material between sessions so learning continues beyond the live class. Classes can be recorded for revision only if the teacher agrees.</p>"}, "hobby-and-language-classes": {"title": "Hobby &amp; Language Classes Online and at Home | Althea Scholar", "desc": "Find teachers for dance, singing, music, guitar, piano, chess, art and language classes (English, French, German, Spanish, Sanskrit) — online or at home.", "h1": "Hobby &amp; Language Classes", "body": "<p>Academics aren't the only thing that shapes a child (or an adult learner) — a good hobby class builds confidence, discipline and a creative outlet, and a language class can open doors both academically and professionally. Althea Scholar helps you find teachers for hobby and skill classes, at home or online, the same simple way we help you find academic tutors.</p>\n\n<h2>Popular hobby classes</h2>\n<ul>\n  <li><strong>Dance</strong> — classical and contemporary styles, for kids and adults</li>\n  <li><strong>Music</strong> — singing, guitar, piano/keyboard, and other instruments</li>\n  <li><strong>Art &amp; craft</strong> — drawing, painting, and creative skills for young children</li>\n  <li><strong>Chess</strong> — a great way to build focus and strategic thinking in kids</li>\n</ul>\n\n<h2>Language classes</h2>\n<p>Spoken English confidence-building for students and working professionals, along with foreign and Indian languages — French, German, Spanish, and Sanskrit are among the most requested. Whether it's for a school subject, a competitive exam, or simply personal interest, we try to match you with a teacher who has actually taught that exact language before.</p>\n\n<h2>How to get started</h2>\n<p>Mention the hobby or language, your city (or \"online\"), and roughly how many days a week you're looking for, while registering. We'll help match you with a suitable teacher — many offer a free trial class so you can be sure it's the right fit before committing to a regular schedule.</p>"}, "cbse-icse-study-material": {"title": "Free CBSE &amp; ICSE Study Material – Notes, Papers, Solutions | Althea Scholar", "desc": "Free notes, mind maps, exercise solutions and previous year papers for CBSE and ICSE, Class 6 to 12, organised by class, subject and chapter.", "h1": "Free CBSE &amp; ICSE Study Material", "body": "<p>Not every family needs a tutor for every subject — sometimes what a student really needs is well-organised revision material they can go through on their own, at their own pace. That's why Althea Scholar offers completely free study material for Classes 6–12, organised the way a student would actually look for it: Class → Subject → Chapter.</p>\n\n<h2>What's included</h2>\n<ul>\n  <li>Chapter-wise notes, written in simple, exam-focused language</li>\n  <li>Mind maps for quick revision before exams</li>\n  <li>Exercise question &amp; answer solutions from the textbook</li>\n  <li>Extra practice questions to test understanding</li>\n  <li>Previous year board exam papers, so students know exactly what to expect</li>\n</ul>\n\n<h2>Why we keep this free</h2>\n<p>Good study material shouldn't be locked behind a paywall — it's often the difference between a student who's confident going into an exam and one who's guessing. Free material also naturally leads some families to realise exactly where they need a tutor's help (a specific chapter or subject) rather than paying for a tutor across every subject.</p>\n\n<p>Use the <strong>\"Study Material\"</strong> menu on the <a href=\"https://altheascholar.in/\">Althea Scholar homepage</a> to browse by class and subject — no login or download required, everything opens directly on the site.</p>"}, "entrance-exam-preparation": {"title": "Sainik School, Navodaya (JNVST) &amp; Entrance Exam Preparation | Althea Scholar", "desc": "Free syllabus, pattern, notes and previous year papers for Sainik School (AISSEE), Navodaya (JNVST), RMS CET, AMU and BHU entrance exams, Class 6 &amp; 9.", "h1": "Entrance Exam Preparation", "body": "<p>Entrance exams for residential and prestigious schools are highly competitive, and preparation usually needs to start well before the exam itself, with a clear understanding of the syllabus and pattern rather than generic Class 6/9 revision. Althea Scholar offers free preparation resources, plus tutor matching if your child needs dedicated, personalised guidance.</p>\n\n<h2>Exams we cover</h2>\n<ul>\n  <li><strong>Sainik School (AISSEE)</strong> — for Class 6 and Class 9 entry</li>\n  <li><strong>Jawahar Navodaya Vidyalaya (JNVST)</strong> — for Class 6 entry</li>\n  <li><strong>RMS CET</strong> (Rashtriya Military School) — for Class 6 and Class 9 entry</li>\n  <li><strong>AMU &amp; BHU entrance exams</strong></li>\n</ul>\n\n<h2>What's available for free</h2>\n<p>Exam-wise syllabus breakdown, question pattern and marking scheme, chapter-wise notes, and previous year papers — everything under the <strong>\"Entrance Exams\"</strong> menu on the <a href=\"https://altheascholar.in/\">homepage</a>. This is the same starting point we'd recommend to any parent, whether or not you go on to hire a tutor through us.</p>\n\n<h2>When a dedicated tutor helps</h2>\n<p>If your child is starting late, has a specific weak area (commonly Mathematics or Mental Ability), or simply needs a structured daily routine leading up to the exam, a tutor experienced specifically with that entrance exam (not just general school tuition) usually makes the biggest difference. Register with us and mention the exact exam and class — we'll try to match you with a teacher who has prepared students for it before.</p>"}, "tuition-in-new-delhi": {"title": "Home Tuition & Online Tuition in Delhi NCR | Home Tutor Listings – Althea Scholar", "desc": "Find home and online tutors in Delhi & NCR (Gurugram, Noida, Ghaziabad, Faridabad) for CBSE, ICSE and other boards, Nursery to Class 12. Free registration and a free demo class.", "h1": "Home Tuition &amp; Online Tuition in Delhi", "body": "<p>Looking for a reliable tutor in Delhi? Althea Scholar is an online platform that helps students and parents in Delhi and the wider NCR connect with teachers for home tuition and online tuition — from Nursery/KG through Class 12, across major boards, plus entrance exam preparation and hobby &amp; language classes.</p>\n<div class=\"info-box\"><strong>We're an online matching platform, not a walk-in tuition center</strong> — you can register from anywhere in and around Delhi, and we help you find a suitable teacher. Fee details and our platform policy are shown on the registration form; registration does not guarantee a teacher assignment.</div>\n\n<h2>Areas we cover around Delhi</h2>\n<p><span class=\"nearby-chip\">Gurugram</span><span class=\"nearby-chip\">Noida</span><span class=\"nearby-chip\">Greater Noida</span><span class=\"nearby-chip\">Ghaziabad</span><span class=\"nearby-chip\">Faridabad</span><span class=\"nearby-chip\">Delhi NCR</span></p>\n<p>Delhi is part of a much larger NCR region, and many families search for a tutor across city lines — a teacher based in Gurugram or Noida may be the best fit even if you live in central Delhi, especially for online classes. We treat Delhi and its NCR neighbours as one connected area when matching teachers, so you are not limited to your exact pin code.</p><p>Because NCR spans Delhi, Haryana and Uttar Pradesh, the board and syllabus your school follows can differ from one area to the next. Mention your school's board while registering so the teacher suggested is comfortable with it.</p>\n\n<h2>Classes and boards</h2>\n<div class=\"card-grid\"><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-child\"></i></div><h3>Nursery – Class 5</h3><p>Home or online tutors for early learners in Delhi: reading, writing, numbers and basic concepts.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-book-reader\"></i></div><h3>Class 6 – 8</h3><p>Core subjects — Mathematics, Science, English, Hindi and Social Science.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-pen-ruler\"></i></div><h3>Class 9 – 10</h3><p>Board-exam preparation for CBSE, ICSE and other boards — tell us which board your school follows.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-graduation-cap\"></i></div><h3>Class 11 – 12</h3><p>Science, Commerce and Humanities subjects, including board and entrance exam preparation.</p></div></div>\n\n<h2>Subjects you can request</h2>\n<p><span class=\"nearby-chip\">Mathematics</span><span class=\"nearby-chip\">Science</span><span class=\"nearby-chip\">Physics</span><span class=\"nearby-chip\">Chemistry</span><span class=\"nearby-chip\">Biology</span><span class=\"nearby-chip\">English</span><span class=\"nearby-chip\">Hindi</span><span class=\"nearby-chip\">Social Science</span><span class=\"nearby-chip\">Accountancy</span><span class=\"nearby-chip\">Business Studies</span><span class=\"nearby-chip\">Economics</span><span class=\"nearby-chip\">Spoken English</span></p>\n<p>You can also ask for <a href=\"https://altheascholar.in/entrance-exam-preparation.html\">entrance exam preparation</a> (Sainik School AISSEE, Navodaya JNVST, RMS CET, AMU, BHU) and <a href=\"https://altheascholar.in/hobby-and-language-classes.html\">hobby &amp; language classes</a> such as dance, music, art and chess. Availability depends on the teachers registered for your class, subject and area.</p>\n\n<h2>Home tuition in Delhi</h2>\n<p>Home tuition means a teacher visits your residence on agreed days. In a large, spread-out region like Delhi NCR, the teacher's distance from your home is a practical factor, so we ask for your exact locality and consider it when suggesting a match. If distance is the obstacle, online classes remove it entirely.</p><p>Timings are decided with the teacher — many families prefer evening slots after school, while others book weekend or early-morning classes. Share your preferred days and times on the form.</p>\n\n<h2>Online tuition option</h2>\n<p>If a suitable home tutor isn't available near you, or you prefer learning from home without travel, online tuition is an alternative — the teacher and student meet on live video, so your exact locality in Delhi matters much less. Read more on our <a href=\"https://altheascholar.in/online-tuition.html\">Online Tuition page</a>, or pick <strong>Both</strong> as the tuition mode while registering.</p>\n\n<h2>How to find a tutor in Delhi</h2>\n<ol class=\"steps\"><li><strong>Register free</strong>Fill the <a href=\"https://altheascholar.in/#find-tutor\">Find Tutor form</a> with class, subjects, your area in Delhi, mode and timing.</li><li><strong>Note your Student ID</strong>You receive an ID right after submitting.</li><li><strong>We contact you</strong>Our team reaches out on WhatsApp with suitable teachers, if available for your requirement.</li><li><strong>Try a free demo</strong>Meet the teacher, then decide whether to continue.</li></ol>\n\n<h2>Why use Althea Scholar in Delhi</h2>\n<ul>\n  <li>Free registration for students and teachers</li>\n  <li>Teacher registrations are reviewed by our team before a profile is listed; only teachers marked Verified get a Verified badge</li>\n  <li>Free demo class before you commit to a teacher</li>\n  <li>Home, online or both — you choose the mode</li>\n  <li>Free <a href=\"https://altheascholar.in/cbse-icse-study-material.html\">CBSE/ICSE study material</a> for Class 6–12</li>\n</ul>"}, "tuition-in-mumbai": {"title": "Home Tuition & Online Tuition in Mumbai & MMR | Home Tutor Listings – Althea Scholar", "desc": "Find home and online tutors in Mumbai and the wider MMR (Thane, Navi Mumbai, Kalyan) for CBSE, ICSE, State Board and more, Nursery to Class 12. Free registration and a free demo class.", "h1": "Home Tuition &amp; Online Tuition in Mumbai", "body": "<p>Looking for a reliable tutor in Mumbai? Althea Scholar is an online platform that helps students and parents in Mumbai and the Mumbai Metropolitan Region connect with teachers for home tuition and online tuition — from Nursery/KG through Class 12, plus entrance exam preparation and hobby &amp; language classes.</p>\n<div class=\"info-box\"><strong>We're an online matching platform, not a walk-in tuition center</strong> — you can register from anywhere in and around Mumbai, and we help you find a suitable teacher. Fee details and our platform policy are shown on the registration form; registration does not guarantee a teacher assignment.</div>\n\n<h2>Areas we cover around Mumbai</h2>\n<p><span class=\"nearby-chip\">Thane</span><span class=\"nearby-chip\">Navi Mumbai</span><span class=\"nearby-chip\">Kalyan</span><span class=\"nearby-chip\">Vasai-Virar</span><span class=\"nearby-chip\">Panvel</span><span class=\"nearby-chip\">Mira-Bhayandar</span></p>\n<p>Mumbai's long distances and busy local trains mean the \"right\" tutor for a family in Thane or Navi Mumbai may not be the same as one for South Mumbai — proximity genuinely matters for home tuition here. We factor in your exact area within the Mumbai Metropolitan Region (MMR) when suggesting a home tutor, while online tuition removes the distance question altogether.</p><p>Families in Mumbai come from many school backgrounds, so we ask which board your child studies under — CBSE, ICSE, the Maharashtra State Board or another — and which languages (English, Hindi, Marathi) they need support in, before suggesting a teacher.</p>\n\n<h2>Classes and boards</h2>\n<div class=\"card-grid\"><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-child\"></i></div><h3>Nursery – Class 5</h3><p>Home or online tutors for early learners in Mumbai: reading, writing, numbers and basic concepts.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-book-reader\"></i></div><h3>Class 6 – 8</h3><p>Core subjects — Mathematics, Science, English, Hindi and Social Science.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-pen-ruler\"></i></div><h3>Class 9 – 10</h3><p>Board-exam preparation for CBSE, ICSE, Maharashtra State Board and others — tell us your school's board.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-graduation-cap\"></i></div><h3>Class 11 – 12</h3><p>Science, Commerce and Humanities subjects, including board and entrance exam preparation.</p></div></div>\n\n<h2>Subjects you can request</h2>\n<p><span class=\"nearby-chip\">Mathematics</span><span class=\"nearby-chip\">Science</span><span class=\"nearby-chip\">Physics</span><span class=\"nearby-chip\">Chemistry</span><span class=\"nearby-chip\">Biology</span><span class=\"nearby-chip\">English</span><span class=\"nearby-chip\">Hindi</span><span class=\"nearby-chip\">Social Science</span><span class=\"nearby-chip\">Accountancy</span><span class=\"nearby-chip\">Business Studies</span><span class=\"nearby-chip\">Economics</span><span class=\"nearby-chip\">Spoken English</span></p>\n<p>You can also ask for <a href=\"https://altheascholar.in/entrance-exam-preparation.html\">entrance exam preparation</a> (Sainik School AISSEE, Navodaya JNVST, RMS CET, AMU, BHU) and <a href=\"https://altheascholar.in/hobby-and-language-classes.html\">hobby &amp; language classes</a> such as dance, music, art and chess. Availability depends on the teachers registered for your class, subject and area.</p>\n\n<h2>Home tuition in Mumbai</h2>\n<p>For home tuition in Mumbai, travel time can decide whether a schedule is realistic. A teacher who lives close to you can make daily or alternate-day classes practical; if not, many families use a mix — home tuition on weekends and online sessions on busy weekdays. Choose <strong>Both</strong> as the mode if you want to keep that option open.</p><p>Share your locality (for example the suburb or station nearest to you), preferred days and time on the form so timings can be matched with the teacher.</p>\n\n<h2>Online tuition option</h2>\n<p>If a suitable home tutor isn't available near you, or you prefer learning from home without travel, online tuition is an alternative — the teacher and student meet on live video, so your exact locality in Mumbai matters much less. Read more on our <a href=\"https://altheascholar.in/online-tuition.html\">Online Tuition page</a>, or pick <strong>Both</strong> as the tuition mode while registering.</p>\n\n<h2>How to find a tutor in Mumbai</h2>\n<ol class=\"steps\"><li><strong>Register free</strong>Fill the <a href=\"https://altheascholar.in/#find-tutor\">Find Tutor form</a> with class, subjects, your area in Mumbai, mode and timing.</li><li><strong>Note your Student ID</strong>You receive an ID right after submitting.</li><li><strong>We contact you</strong>Our team reaches out on WhatsApp with suitable teachers, if available for your requirement.</li><li><strong>Try a free demo</strong>Meet the teacher, then decide whether to continue.</li></ol>\n\n<h2>Why use Althea Scholar in Mumbai</h2>\n<ul>\n  <li>Free registration for students and teachers</li>\n  <li>Teacher registrations are reviewed by our team before a profile is listed; only teachers marked Verified get a Verified badge</li>\n  <li>Free demo class before you commit to a teacher</li>\n  <li>Home, online or both — you choose the mode</li>\n  <li>Free <a href=\"https://altheascholar.in/cbse-icse-study-material.html\">CBSE/ICSE study material</a> for Class 6–12</li>\n</ul>"}, "tuition-in-lucknow": {"title": "Home Tuition & Online Tuition in Lucknow | Home Tutor Listings – Althea Scholar", "desc": "Find home and online tutors in Lucknow — Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Alambagh and nearby Kanpur, Barabanki, Unnao. CBSE, ICSE, UP Board, all classes. Free registration, free demo.", "h1": "Home Tuition &amp; Online Tuition in Lucknow", "body": "<p>Looking for a reliable tutor in Lucknow? Althea Scholar is an online platform that helps students and parents in Lucknow connect with teachers for home tuition and online tuition — from Nursery/KG through Class 12, across major boards, plus entrance exam preparation and hobby &amp; language classes.</p>\n<div class=\"info-box\"><strong>We're an online matching platform, not a walk-in tuition center</strong> — you can register from anywhere in and around Lucknow, and we help you find a suitable teacher. Fee details and our platform policy are shown on the registration form; registration does not guarantee a teacher assignment.</div>\n\n<h2>Areas we cover around Lucknow</h2>\n<p><span class=\"nearby-chip\">Gomti Nagar</span><span class=\"nearby-chip\">Hazratganj</span><span class=\"nearby-chip\">Indira Nagar</span><span class=\"nearby-chip\">Aliganj</span><span class=\"nearby-chip\">Alambagh</span><span class=\"nearby-chip\">Kanpur</span><span class=\"nearby-chip\">Barabanki</span><span class=\"nearby-chip\">Unnao</span><span class=\"nearby-chip\">Sitapur</span><span class=\"nearby-chip\">Rae Bareli</span></p>\n<h2>Lucknow — our home city</h2><p>Lucknow holds a special place for Althea Scholar — it's where we're based and where we know the schools, boards and localities best. Whether you're in Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Alambagh or elsewhere in the city, we try to match you with a teacher who understands your school's curriculum — CBSE, ICSE or UP Board — and exam expectations.</p><p>We also connect students and teachers from the wider Lucknow region — Kanpur, Barabanki, Unnao, Sitapur and Rae Bareli — for both home and online tuition. Our WhatsApp support is quickest for Lucknow-based queries.</p>\n\n<h2>Classes and boards</h2>\n<div class=\"card-grid\"><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-child\"></i></div><h3>Nursery – Class 5</h3><p>Home or online tutors for early learners in Lucknow: reading, writing, numbers and basic concepts.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-book-reader\"></i></div><h3>Class 6 – 8</h3><p>Core subjects — Mathematics, Science, English, Hindi and Social Science.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-pen-ruler\"></i></div><h3>Class 9 – 10</h3><p>Board-exam preparation for UP Board, CBSE and ICSE — we ask which board your school follows before suggesting a teacher.</p></div><div class=\"info-card\"><div class=\"ic\"><i class=\"fas fa-graduation-cap\"></i></div><h3>Class 11 – 12</h3><p>Science, Commerce and Humanities subjects, including board and entrance exam preparation.</p></div></div>\n\n<h2>Subjects you can request</h2>\n<p><span class=\"nearby-chip\">Mathematics</span><span class=\"nearby-chip\">Science</span><span class=\"nearby-chip\">Physics</span><span class=\"nearby-chip\">Chemistry</span><span class=\"nearby-chip\">Biology</span><span class=\"nearby-chip\">English</span><span class=\"nearby-chip\">Hindi</span><span class=\"nearby-chip\">Social Science</span><span class=\"nearby-chip\">Accountancy</span><span class=\"nearby-chip\">Business Studies</span><span class=\"nearby-chip\">Economics</span><span class=\"nearby-chip\">Spoken English</span></p>\n<p>You can also ask for <a href=\"https://altheascholar.in/entrance-exam-preparation.html\">entrance exam preparation</a> (Sainik School AISSEE, Navodaya JNVST, RMS CET, AMU, BHU) and <a href=\"https://altheascholar.in/hobby-and-language-classes.html\">hobby &amp; language classes</a> such as dance, music, art and chess. Availability depends on the teachers registered for your class, subject and area.</p>\n\n<h2>Home tuition in Lucknow</h2>\n<p>Home tuition in Lucknow usually means a teacher visiting on daily or alternate days. Give us your locality and school board, and we will look for teachers who can travel to your part of the city.</p><h3 style=\"font-size:16px;\">Questions to settle when registering</h3><ul><li>UP Board or CBSE-focused teacher — the board your school follows</li><li>Days and timings for daily or alternate-day classes</li><li>Entrance exam coaching, such as Sainik School (Lucknow has a Sainik School), Navodaya and RMS CET, if relevant</li><li>Hobby classes such as classical dance, music or art, if you want them alongside school subjects</li></ul>\n\n<h2>Online tuition option</h2>\n<p>If a suitable home tutor isn't available near you, or you prefer learning from home without travel, online tuition is an alternative — the teacher and student meet on live video, so your exact locality in Lucknow matters much less. Read more on our <a href=\"https://altheascholar.in/online-tuition.html\">Online Tuition page</a>, or pick <strong>Both</strong> as the tuition mode while registering.</p>\n\n<h2>How to find a tutor in Lucknow</h2>\n<ol class=\"steps\"><li><strong>Register free</strong>Fill the <a href=\"https://altheascholar.in/#find-tutor\">Find Tutor form</a> with class, subjects, your area in Lucknow, mode and timing.</li><li><strong>Note your Student ID</strong>You receive an ID right after submitting.</li><li><strong>We contact you</strong>Our team reaches out on WhatsApp with suitable teachers, if available for your requirement.</li><li><strong>Try a free demo</strong>Meet the teacher, then decide whether to continue.</li></ol>\n\n<h2>Why use Althea Scholar in Lucknow</h2>\n<ul>\n  <li>Free registration for students and teachers</li>\n  <li>Teacher registrations are reviewed by our team before a profile is listed; only teachers marked Verified get a Verified badge</li>\n  <li>Free demo class before you commit to a teacher</li>\n  <li>Home, online or both — you choose the mode</li>\n  <li>Free <a href=\"https://altheascholar.in/cbse-icse-study-material.html\">CBSE/ICSE study material</a> for Class 6–12</li>\n</ul>"}}, "cities": [{"name": "New Delhi", "state": "Delhi (NCR)", "nearby": "Gurugram, Noida, Ghaziabad, Faridabad, Greater Noida", "desc": "Althea Scholar helps students and parents in New Delhi (Delhi (NCR)) connect with home and online tutors — covering New Delhi city and nearby areas like Gurugram, Noida, Ghaziabad, Faridabad, Greater Noida. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Mumbai", "state": "Maharashtra", "nearby": "Thane, Navi Mumbai, Kalyan, Vasai-Virar, Panvel", "desc": "Althea Scholar helps students and parents in Mumbai (Maharashtra) connect with home and online tutors — covering Mumbai city and nearby areas like Thane, Navi Mumbai, Kalyan, Vasai-Virar, Panvel. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": "https://altheascholar.in/tuition-in-mumbai.html"}, {"name": "Lucknow", "state": "Uttar Pradesh", "nearby": "Kanpur, Barabanki, Unnao, Sitapur, Rae Bareli — including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Alambagh", "desc": "Althea Scholar helps students and parents in Lucknow (Uttar Pradesh) connect with home and online tutors — covering Lucknow city and nearby areas like Kanpur, Barabanki, Unnao, Sitapur, Rae Bareli — including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Alambagh. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": "https://altheascholar.in/tuition-in-lucknow.html"}, {"name": "Bengaluru", "state": "Karnataka", "nearby": "Whitefield, Electronic City, Hosur Road, Ramanagara", "desc": "Althea Scholar helps students and parents in Bengaluru (Karnataka) connect with home and online tutors — covering Bengaluru city and nearby areas like Whitefield, Electronic City, Hosur Road, Ramanagara. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Chennai", "state": "Tamil Nadu", "nearby": "Kanchipuram, Chengalpattu, Tiruvallur", "desc": "Althea Scholar helps students and parents in Chennai (Tamil Nadu) connect with home and online tutors — covering Chennai city and nearby areas like Kanchipuram, Chengalpattu, Tiruvallur. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Hyderabad", "state": "Telangana", "nearby": "Secunderabad, Cyberabad, Ranga Reddy", "desc": "Althea Scholar helps students and parents in Hyderabad (Telangana) connect with home and online tutors — covering Hyderabad city and nearby areas like Secunderabad, Cyberabad, Ranga Reddy. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Kolkata", "state": "West Bengal", "nearby": "Howrah, Salt Lake, New Town, Barrackpore", "desc": "Althea Scholar helps students and parents in Kolkata (West Bengal) connect with home and online tutors — covering Kolkata city and nearby areas like Howrah, Salt Lake, New Town, Barrackpore. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Ahmedabad", "state": "Gujarat", "nearby": "Gandhinagar, Sanand", "desc": "Althea Scholar helps students and parents in Ahmedabad (Gujarat) connect with home and online tutors — covering Ahmedabad city and nearby areas like Gandhinagar, Sanand. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Pune", "state": "Maharashtra", "nearby": "Pimpri-Chinchwad, Hinjewadi", "desc": "Althea Scholar helps students and parents in Pune (Maharashtra) connect with home and online tutors — covering Pune city and nearby areas like Pimpri-Chinchwad, Hinjewadi. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Surat", "state": "Gujarat", "nearby": "Navsari, Bharuch", "desc": "Althea Scholar helps students and parents in Surat (Gujarat) connect with home and online tutors — covering Surat city and nearby areas like Navsari, Bharuch. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Jaipur", "state": "Rajasthan", "nearby": "Ajmer Road, Dausa", "desc": "Althea Scholar helps students and parents in Jaipur (Rajasthan) connect with home and online tutors — covering Jaipur city and nearby areas like Ajmer Road, Dausa. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Kanpur", "state": "Uttar Pradesh", "nearby": "Unnao, Lucknow", "desc": "Althea Scholar helps students and parents in Kanpur (Uttar Pradesh) connect with home and online tutors — covering Kanpur city and nearby areas like Unnao, Lucknow. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Nagpur", "state": "Maharashtra", "nearby": "Wardha", "desc": "Althea Scholar helps students and parents in Nagpur (Maharashtra) connect with home and online tutors — covering Nagpur city and nearby areas like Wardha. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Indore", "state": "Madhya Pradesh", "nearby": "Dewas, Ujjain", "desc": "Althea Scholar helps students and parents in Indore (Madhya Pradesh) connect with home and online tutors — covering Indore city and nearby areas like Dewas, Ujjain. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Bhopal", "state": "Madhya Pradesh", "nearby": "Vidisha, Sehore", "desc": "Althea Scholar helps students and parents in Bhopal (Madhya Pradesh) connect with home and online tutors — covering Bhopal city and nearby areas like Vidisha, Sehore. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Patna", "state": "Bihar", "nearby": "Danapur, Phulwari Sharif", "desc": "Althea Scholar helps students and parents in Patna (Bihar) connect with home and online tutors — covering Patna city and nearby areas like Danapur, Phulwari Sharif. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Vadodara", "state": "Gujarat", "nearby": "Anand", "desc": "Althea Scholar helps students and parents in Vadodara (Gujarat) connect with home and online tutors — covering Vadodara city and nearby areas like Anand. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Ludhiana", "state": "Punjab", "nearby": "Jalandhar", "desc": "Althea Scholar helps students and parents in Ludhiana (Punjab) connect with home and online tutors — covering Ludhiana city and nearby areas like Jalandhar. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Agra", "state": "Uttar Pradesh", "nearby": "Mathura, Firozabad", "desc": "Althea Scholar helps students and parents in Agra (Uttar Pradesh) connect with home and online tutors — covering Agra city and nearby areas like Mathura, Firozabad. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Nashik", "state": "Maharashtra", "nearby": "Igatpuri", "desc": "Althea Scholar helps students and parents in Nashik (Maharashtra) connect with home and online tutors — covering Nashik city and nearby areas like Igatpuri. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Faridabad", "state": "Haryana (NCR)", "nearby": "Ballabgarh, Delhi", "desc": "Althea Scholar helps students and parents in Faridabad (Haryana (NCR)) connect with home and online tutors — covering Faridabad city and nearby areas like Ballabgarh, Delhi. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Meerut", "state": "Uttar Pradesh", "nearby": "Modinagar, Muzaffarnagar", "desc": "Althea Scholar helps students and parents in Meerut (Uttar Pradesh) connect with home and online tutors — covering Meerut city and nearby areas like Modinagar, Muzaffarnagar. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Varanasi", "state": "Uttar Pradesh", "nearby": "Chandauli, Mirzapur", "desc": "Althea Scholar helps students and parents in Varanasi (Uttar Pradesh) connect with home and online tutors — covering Varanasi city and nearby areas like Chandauli, Mirzapur. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Srinagar", "state": "Jammu & Kashmir", "nearby": "Budgam, Ganderbal", "desc": "Althea Scholar helps students and parents in Srinagar (Jammu & Kashmir) connect with home and online tutors — covering Srinagar city and nearby areas like Budgam, Ganderbal. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Amritsar", "state": "Punjab", "nearby": "Tarn Taran", "desc": "Althea Scholar helps students and parents in Amritsar (Punjab) connect with home and online tutors — covering Amritsar city and nearby areas like Tarn Taran. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Allahabad (Prayagraj)", "state": "Uttar Pradesh", "nearby": "Kaushambi", "desc": "Althea Scholar helps students and parents in Allahabad (Prayagraj) (Uttar Pradesh) connect with home and online tutors — covering Allahabad (Prayagraj) city and nearby areas like Kaushambi. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Ranchi", "state": "Jharkhand", "nearby": "Khunti", "desc": "Althea Scholar helps students and parents in Ranchi (Jharkhand) connect with home and online tutors — covering Ranchi city and nearby areas like Khunti. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Jabalpur", "state": "Madhya Pradesh", "nearby": "Katni", "desc": "Althea Scholar helps students and parents in Jabalpur (Madhya Pradesh) connect with home and online tutors — covering Jabalpur city and nearby areas like Katni. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Coimbatore", "state": "Tamil Nadu", "nearby": "Tiruppur, Pollachi", "desc": "Althea Scholar helps students and parents in Coimbatore (Tamil Nadu) connect with home and online tutors — covering Coimbatore city and nearby areas like Tiruppur, Pollachi. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Madurai", "state": "Tamil Nadu", "nearby": "Dindigul", "desc": "Althea Scholar helps students and parents in Madurai (Tamil Nadu) connect with home and online tutors — covering Madurai city and nearby areas like Dindigul. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Visakhapatnam", "state": "Andhra Pradesh", "nearby": "Vizianagaram", "desc": "Althea Scholar helps students and parents in Visakhapatnam (Andhra Pradesh) connect with home and online tutors — covering Visakhapatnam city and nearby areas like Vizianagaram. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Chandigarh", "state": "Chandigarh (Tricity)", "nearby": "Mohali, Panchkula", "desc": "Althea Scholar helps students and parents in Chandigarh (Chandigarh (Tricity)) connect with home and online tutors — covering Chandigarh city and nearby areas like Mohali, Panchkula. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Gurugram", "state": "Haryana (NCR)", "nearby": "Manesar, Delhi, Faridabad", "desc": "Althea Scholar helps students and parents in Gurugram (Haryana (NCR)) connect with home and online tutors — covering Gurugram city and nearby areas like Manesar, Delhi, Faridabad. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Noida", "state": "Uttar Pradesh (NCR)", "nearby": "Greater Noida, Ghaziabad, Delhi", "desc": "Althea Scholar helps students and parents in Noida (Uttar Pradesh (NCR)) connect with home and online tutors — covering Noida city and nearby areas like Greater Noida, Ghaziabad, Delhi. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Ghaziabad", "state": "Uttar Pradesh (NCR)", "nearby": "Noida, Delhi, Modinagar", "desc": "Althea Scholar helps students and parents in Ghaziabad (Uttar Pradesh (NCR)) connect with home and online tutors — covering Ghaziabad city and nearby areas like Noida, Delhi, Modinagar. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Guwahati", "state": "Assam", "nearby": "Dispur", "desc": "Althea Scholar helps students and parents in Guwahati (Assam) connect with home and online tutors — covering Guwahati city and nearby areas like Dispur. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Shimla", "state": "Himachal Pradesh", "nearby": "Solan", "desc": "Althea Scholar helps students and parents in Shimla (Himachal Pradesh) connect with home and online tutors — covering Shimla city and nearby areas like Solan. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Dehradun", "state": "Uttarakhand", "nearby": "Rishikesh, Haridwar", "desc": "Althea Scholar helps students and parents in Dehradun (Uttarakhand) connect with home and online tutors — covering Dehradun city and nearby areas like Rishikesh, Haridwar. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Jammu", "state": "Jammu & Kashmir", "nearby": "Samba, Udhampur", "desc": "Althea Scholar helps students and parents in Jammu (Jammu & Kashmir) connect with home and online tutors — covering Jammu city and nearby areas like Samba, Udhampur. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Udaipur", "state": "Rajasthan", "nearby": "Rajsamand", "desc": "Althea Scholar helps students and parents in Udaipur (Rajasthan) connect with home and online tutors — covering Udaipur city and nearby areas like Rajsamand. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Kota", "state": "Rajasthan", "nearby": "Bundi", "desc": "Althea Scholar helps students and parents in Kota (Rajasthan) connect with home and online tutors — covering Kota city and nearby areas like Bundi. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Gwalior", "state": "Madhya Pradesh", "nearby": "Morena", "desc": "Althea Scholar helps students and parents in Gwalior (Madhya Pradesh) connect with home and online tutors — covering Gwalior city and nearby areas like Morena. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Bareilly", "state": "Uttar Pradesh", "nearby": "Pilibhit", "desc": "Althea Scholar helps students and parents in Bareilly (Uttar Pradesh) connect with home and online tutors — covering Bareilly city and nearby areas like Pilibhit. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Aligarh", "state": "Uttar Pradesh", "nearby": "Hathras", "desc": "Althea Scholar helps students and parents in Aligarh (Uttar Pradesh) connect with home and online tutors — covering Aligarh city and nearby areas like Hathras. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Mysuru", "state": "Karnataka", "nearby": "Mandya", "desc": "Althea Scholar helps students and parents in Mysuru (Karnataka) connect with home and online tutors — covering Mysuru city and nearby areas like Mandya. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Vijayawada", "state": "Andhra Pradesh", "nearby": "Guntur, Amaravati", "desc": "Althea Scholar helps students and parents in Vijayawada (Andhra Pradesh) connect with home and online tutors — covering Vijayawada city and nearby areas like Guntur, Amaravati. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Aurangabad", "state": "Maharashtra", "nearby": "Jalna", "desc": "Althea Scholar helps students and parents in Aurangabad (Maharashtra) connect with home and online tutors — covering Aurangabad city and nearby areas like Jalna. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Solapur", "state": "Maharashtra", "nearby": "Barshi", "desc": "Althea Scholar helps students and parents in Solapur (Maharashtra) connect with home and online tutors — covering Solapur city and nearby areas like Barshi. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Hubballi", "state": "Karnataka", "nearby": "Dharwad", "desc": "Althea Scholar helps students and parents in Hubballi (Karnataka) connect with home and online tutors — covering Hubballi city and nearby areas like Dharwad. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Kochi", "state": "Kerala", "nearby": "Ernakulam, Aluva", "desc": "Althea Scholar helps students and parents in Kochi (Kerala) connect with home and online tutors — covering Kochi city and nearby areas like Ernakulam, Aluva. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Thrissur", "state": "Kerala", "nearby": "Guruvayur", "desc": "Althea Scholar helps students and parents in Thrissur (Kerala) connect with home and online tutors — covering Thrissur city and nearby areas like Guruvayur. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Kozhikode", "state": "Kerala", "nearby": "Malappuram", "desc": "Althea Scholar helps students and parents in Kozhikode (Kerala) connect with home and online tutors — covering Kozhikode city and nearby areas like Malappuram. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Thiruvananthapuram", "state": "Kerala", "nearby": "Kollam", "desc": "Althea Scholar helps students and parents in Thiruvananthapuram (Kerala) connect with home and online tutors — covering Thiruvananthapuram city and nearby areas like Kollam. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Bhubaneswar", "state": "Odisha", "nearby": "Cuttack, Puri", "desc": "Althea Scholar helps students and parents in Bhubaneswar (Odisha) connect with home and online tutors — covering Bhubaneswar city and nearby areas like Cuttack, Puri. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Raipur", "state": "Chhattisgarh", "nearby": "Durg, Bhilai", "desc": "Althea Scholar helps students and parents in Raipur (Chhattisgarh) connect with home and online tutors — covering Raipur city and nearby areas like Durg, Bhilai. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Gandhinagar", "state": "Gujarat", "nearby": "Ahmedabad", "desc": "Althea Scholar helps students and parents in Gandhinagar (Gujarat) connect with home and online tutors — covering Gandhinagar city and nearby areas like Ahmedabad. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Panaji", "state": "Goa", "nearby": "Margao", "desc": "Althea Scholar helps students and parents in Panaji (Goa) connect with home and online tutors — covering Panaji city and nearby areas like Margao. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Port Blair", "state": "Andaman & Nicobar Islands", "nearby": "", "desc": "Althea Scholar helps students and parents in Port Blair (Andaman & Nicobar Islands) connect with home and online tutors — Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class before you commit to a teacher.", "dedicatedUrl": ""}, {"name": "Puducherry", "state": "Puducherry", "nearby": "Villupuram", "desc": "Althea Scholar helps students and parents in Puducherry (Puducherry) connect with home and online tutors — covering Puducherry city and nearby areas like Villupuram. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Daman", "state": "Daman & Diu", "nearby": "Vapi", "desc": "Althea Scholar helps students and parents in Daman (Daman & Diu) connect with home and online tutors — covering Daman city and nearby areas like Vapi. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Leh", "state": "Ladakh", "nearby": "", "desc": "Althea Scholar helps students and parents in Leh (Ladakh) connect with home and online tutors — Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class before you commit to a teacher.", "dedicatedUrl": ""}, {"name": "Itanagar", "state": "Arunachal Pradesh", "nearby": "Naharlagun", "desc": "Althea Scholar helps students and parents in Itanagar (Arunachal Pradesh) connect with home and online tutors — covering Itanagar city and nearby areas like Naharlagun. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Dispur", "state": "Assam", "nearby": "Guwahati", "desc": "Althea Scholar helps students and parents in Dispur (Assam) connect with home and online tutors — covering Dispur city and nearby areas like Guwahati. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Shillong", "state": "Meghalaya", "nearby": "", "desc": "Althea Scholar helps students and parents in Shillong (Meghalaya) connect with home and online tutors — Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class before you commit to a teacher.", "dedicatedUrl": ""}, {"name": "Imphal", "state": "Manipur", "nearby": "", "desc": "Althea Scholar helps students and parents in Imphal (Manipur) connect with home and online tutors — Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class before you commit to a teacher.", "dedicatedUrl": ""}, {"name": "Aizawl", "state": "Mizoram", "nearby": "", "desc": "Althea Scholar helps students and parents in Aizawl (Mizoram) connect with home and online tutors — Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class before you commit to a teacher.", "dedicatedUrl": ""}, {"name": "Kohima", "state": "Nagaland", "nearby": "Dimapur", "desc": "Althea Scholar helps students and parents in Kohima (Nagaland) connect with home and online tutors — covering Kohima city and nearby areas like Dimapur. Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class.", "dedicatedUrl": ""}, {"name": "Agartala", "state": "Tripura", "nearby": "", "desc": "Althea Scholar helps students and parents in Agartala (Tripura) connect with home and online tutors — Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class before you commit to a teacher.", "dedicatedUrl": ""}, {"name": "Gangtok", "state": "Sikkim", "nearby": "", "desc": "Althea Scholar helps students and parents in Gangtok (Sikkim) connect with home and online tutors — Nursery to Class 12, all major boards, entrance exam preparation, and hobby &amp; language classes, with free registration and a free demo class before you commit to a teacher.", "dedicatedUrl": ""}]}
;
function loadSeoPageIntoForm() {
  const slug = document.getElementById('sp_page_select').value;
  const sp = getSeoPages();
  const p = sp.pages[slug] || {};
  document.getElementById('sp_visible').checked = sp.visible[slug] !== false;
  document.getElementById('sp_title').value = p.title || '';
  document.getElementById('sp_desc').value = p.desc || '';
  document.getElementById('sp_h1').value = p.h1 || '';
  document.getElementById('sp_body').value = p.body || '';
}
function saveSeoPage() {
  const slug = document.getElementById('sp_page_select').value;
  const sp = getSeoPages();
  const visible = { ...sp.visible, [slug]: document.getElementById('sp_visible').checked };
  const pages = { ...sp.pages, [slug]: {
    title: document.getElementById('sp_title').value.trim(),
    desc: document.getElementById('sp_desc').value.trim(),
    h1: document.getElementById('sp_h1').value.trim(),
    body: document.getElementById('sp_body').value.trim()
  } };
  fsSettingsSave('seoPages', { ...sp, visible, pages });
  showToast('✅ ' + (SEO_PAGE_LABELS[slug] || slug) + ' page updated! (May take a few seconds to reflect on the live page.)');
}
function resetSeoPageToDefault() {
  const slug = document.getElementById('sp_page_select').value;
  const sp = getSeoPages();
  const pages = { ...sp.pages, [slug]: { ...SEO_PAGES_DEFAULT.pages[slug] } };
  const visible = { ...sp.visible, [slug]: true };
  fsSettingsSave('seoPages', { ...sp, visible, pages });
  loadSeoPageIntoForm();
  showToast('✅ Reset to default!');
}
function populateSeoCitiesForm() {
  const sp = getSeoPages();
  document.getElementById('sp_cities_visible').checked = sp.citiesVisible !== false;
  document.getElementById('sp_cities_bulk').value = sp.cities.map(c =>
    `${c.name} || ${c.state || ''} || ${c.nearby || ''} || ${(c.desc || '').replace(/\n/g, ' ')}`
  ).join('\n');
}
function saveSeoCitiesList() {
  const lines = document.getElementById('sp_cities_bulk').value.split('\n').map(l => l.trim()).filter(Boolean);
  const sp = getSeoPages();
  const dedicatedUrlByName = {};
  sp.cities.forEach(c => { if (c.dedicatedUrl) dedicatedUrlByName[c.name] = c.dedicatedUrl; });
  const cities = lines.map(line => {
    const parts = line.split('||').map(s => s.trim());
    const name = parts[0] || '';
    return {
      name, state: parts[1] || '', nearby: parts[2] || '', desc: parts[3] || '',
      dedicatedUrl: dedicatedUrlByName[name] || ''
    };
  }).filter(c => c.name);
  const visible = { ...sp.visible, 'tuition-cities': document.getElementById('sp_cities_visible').checked };
  fsSettingsSave('seoPages', { ...sp, visible, cities });
  showToast('✅ Cities list updated! (' + cities.length + ' cities saved.)');
}
function resetSeoCitiesToDefault() {
  const sp = getSeoPages();
  fsSettingsSave('seoPages', { ...sp, cities: SEO_PAGES_DEFAULT.cities, visible: { ...sp.visible, 'tuition-cities': true } });
  populateSeoCitiesForm();
  showToast('✅ Cities list reset to default!');
}
function populateStudentFormNoticeEditor() {
  const ta = document.getElementById('fe_student_notice');
  if (ta) ta.value = getStudentFormNotice();
}
function saveStudentFormNotice() {
  const text = document.getElementById('fe_student_notice').value.trim() || STUDENT_NOTICE_DEFAULT;
  fsSettingsSave('studentFormNotice', text);
  renderStudentFormNotice();
  showToast('✅ Notice updated on the Student Registration form!');
}
function resetStudentFormNotice() {
  if (!confirm('Reset the student form notice to default text?')) return;
  fsSettingsSave('studentFormNotice', STUDENT_NOTICE_DEFAULT);
  renderStudentFormNotice();
  populateStudentFormNoticeEditor();
  showToast('✅ Notice reset to default.');
}
function populatePolicyEditor() {
  const p = getPolicySettings();
  const tTa = document.getElementById('fe_teacher_policy'); if (tTa) tTa.value = policyPointsToText(p.teacher);
  const sTa = document.getElementById('fe_student_policy'); if (sTa) sTa.value = policyPointsToText(p.student);
}
function savePolicyEditor() {
  const teacherText = document.getElementById('fe_teacher_policy').value;
  const studentText = document.getElementById('fe_student_policy').value;
  const settings = { teacher: policyTextToPoints(teacherText), student: policyTextToPoints(studentText) };
  fsSettingsSave('policySettings', settings);
  renderPolicyBoxes();
  showToast('✅ Platform Policy updated on both forms!');
}
function resetPolicyEditor() {
  if (!confirm('Reset both Platform Policy sections back to default wording?')) return;
  fsSettingsSave('policySettings', {});
  renderPolicyBoxes();
  populatePolicyEditor();
  showToast('✅ Platform Policy reset to default.');
}
// ================================================================
// Registration side cards (Teacher "Why Join Us?" / Student "Benefits
// for You") — title, 4 benefit lines, quote & an image, all admin-editable.
// ================================================================
const REG_SIDE_DEFAULTS = {
  teacher: { title: 'Why Join Us?', quote: 'Share your knowledge, shape the future.', items: [
    { icon: 'fa-user-check', bg: '#E4EFF9', fg: '#0A4174', text: 'Connect with genuine student &amp; parent leads' },
    { icon: 'fa-laptop-house', bg: '#dcebf6', fg: '#49769F', text: 'Flexible online &amp; offline teaching' },
    { icon: 'fa-shield-halved', bg: '#e8eef5', fg: '#001D39', text: 'Secure and transparent platform' },
    { icon: 'fa-headset', bg: '#fdf1e0', fg: '#c97f1f', text: 'Dedicated support team' }
  ], art: '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" rx="16" fill="#E4EFF9"/><ellipse cx="200" cy="270" rx="160" ry="14" fill="#d3e4f4"/><rect x="60" y="60" width="180" height="120" rx="8" fill="#001D39"/><rect x="60" y="180" width="180" height="10" fill="#49769F"/><path d="M90 100 h60 M90 120 h100 M90 140 h80" stroke="#E4EFF9" stroke-width="4" stroke-linecap="round"/><rect x="270" y="205" width="80" height="14" rx="3" fill="#0A4174"/><rect x="278" y="191" width="64" height="14" rx="3" fill="#49769F"/><rect x="286" y="177" width="48" height="14" rx="3" fill="#c97f1f"/><path d="M235 260 C235 210,320 210,320 260 L305 260 C305 225,250 225,250 260 Z" fill="#0A4174"/><circle cx="277" cy="200" r="24" fill="#F4C79E"/><path d="M254 196 C254 172,300 172,300 196 C300 180,277 170,254 196 Z" fill="#001D39"/><path d="M250 240 Q220 225 190 210" stroke="#F4C79E" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="188" cy="208" r="5" fill="#F4C79E"/></svg>' },
  student: { title: 'Benefits for You', quote: 'Better Learning, Brighter Future', items: [
    { icon: 'fa-user-graduate', bg: '#E4EFF9', fg: '#0A4174', text: 'Find the right tutor for your child' },
    { icon: 'fa-lightbulb', bg: '#dcebf6', fg: '#49769F', text: 'Personalized learning experience' },
    { icon: 'fa-chart-line', bg: '#e8eef5', fg: '#001D39', text: 'Regular progress updates' },
    { icon: 'fa-circle-check', bg: '#fdf1e0', fg: '#c97f1f', text: 'Teacher profiles reviewed before listing' }
  ], art: '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" rx="16" fill="#E4EFF9"/><ellipse cx="200" cy="270" rx="160" ry="14" fill="#d3e4f4"/><rect x="40" y="220" width="46" height="40" rx="6" fill="#c97f1f"/><path d="M63 220 C40 190,40 160,63 140 C86 160,86 190,63 220 Z" fill="#49769F"/><path d="M63 220 C50 200,50 175,63 155" stroke="#001D39" stroke-width="3" fill="none"/><rect x="110" y="200" width="230" height="14" rx="4" fill="#0A4174"/><rect x="120" y="214" width="10" height="46" fill="#0A4174"/><rect x="320" y="214" width="10" height="46" fill="#0A4174"/><rect x="185" y="165" width="90" height="38" rx="4" fill="#001D39"/><rect x="190" y="169" width="80" height="30" rx="2" fill="#49769F"/><path d="M180 203 L280 203 L290 213 L170 213 Z" fill="#0A4174"/><rect x="150" y="120" width="70" height="90" rx="18" fill="#C7DAF0"/><path d="M155 210 C155 165,245 165,245 210 L235 210 C235 180,165 180,165 210 Z" fill="#0A4174"/><circle cx="200" cy="140" r="26" fill="#F4C79E"/><path d="M174 132 C174 105,226 105,226 132 C226 118,200 108,174 132 Z" fill="#001D39"/><path d="M170 190 Q190 200 205 195" stroke="#F4C79E" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="330" cy="70" r="16" fill="#ffffff"/><circle cx="348" cy="76" r="12" fill="#ffffff"/><circle cx="315" cy="78" r="10" fill="#ffffff"/></svg>' }
};
let _regSideImg = { teacher: null, student: null };
function onRegSideImg(input, kind) {
  const file = input.files && input.files[0];
  if (!file) return;
  compressImageToDataUrl(file, 900, 0.78).then(url => { _regSideImg[kind] = url; document.getElementById('rs_' + (kind === 'teacher' ? 't' : 's') + '_img_prev').src = url; });
}
function clearRegSideImg(kind) {
  _regSideImg[kind] = '';
  const p = kind === 'teacher' ? 't' : 's';
  document.getElementById('rs_' + p + '_img_file').value = '';
  document.getElementById('rs_' + p + '_img_prev').src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
}
function populateRegSideForm(kind) {
  const c = getRegSide(kind), p = kind === 'teacher' ? 't' : 's';
  document.getElementById('rs_' + p + '_title').value = c.title;
  c.items.forEach((it, i) => document.getElementById('rs_' + p + '_b' + i).value = it.text);
  document.getElementById('rs_' + p + '_quote').value = c.quote;
  _regSideImg[kind] = c.image || null;
  document.getElementById('rs_' + p + '_img_prev').src = c.image || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
}
function saveRegSide(kind) {
  const p = kind === 'teacher' ? 't' : 's';
  const g = id => document.getElementById('rs_' + p + '_' + id).value.trim();
  const all = fsSettingsGet('regSide') || {};
  all[kind] = {
    title: g('title'), quote: g('quote'),
    items: [g('b0'), g('b1'), g('b2'), g('b3')],
    image: _regSideImg[kind] === null ? (getRegSide(kind).image || '') : (_regSideImg[kind] || '')
  };
  fsSettingsSave('regSide', all);
  renderRegSide(kind);
  showToast('✅ ' + (kind === 'teacher' ? 'Teacher' : 'Student') + ' side card saved!');
}
function renderFormEditor() {
  fsSettingsListen('formFieldSettings');
  const settings = fsSettingsGet('formFieldSettings') || {};
  [['teacherForm', 'formEditorTeacher'], ['studentForm', 'formEditorStudent']].forEach(([formId, containerId]) => {
    const tbody = document.getElementById(containerId);
    if (!tbody) return;
    const rows = getFormFieldRows(formId);
    tbody.innerHTML = rows.map(r => {
      const s = settings[r.id] || {};
      const defaultLabel = r.labelEl.dataset.defaultLabel || r.labelEl.textContent;
      r.labelEl.dataset.defaultLabel = defaultLabel;
      const currentLabel = (s.label !== undefined ? s.label : defaultLabel).replace(/"/g, '&quot;');
      const hasPlaceholder = 'placeholder' in r.control && r.control.tagName !== 'SELECT';
      const defaultPh = r.control.dataset.defaultPlaceholder !== undefined ? r.control.dataset.defaultPlaceholder : (r.control.placeholder || '');
      if (hasPlaceholder) r.control.dataset.defaultPlaceholder = defaultPh;
      const currentPh = (s.placeholder !== undefined ? s.placeholder : defaultPh).replace(/"/g, '&quot;');
      return `
        <tr>
          <td><code style="font-size:11px;">${r.id}</code></td>
          <td><input type="text" id="fe_label_${r.id}" value="${currentLabel}" style="width:100%;min-width:160px;"></td>
          <td>${hasPlaceholder ? `<input type="text" id="fe_ph_${r.id}" value="${currentPh}" style="width:100%;min-width:160px;">` : '<span style="color:#aaa;font-size:12px;">N/A</span>'}</td>
        </tr>`;
    }).join('');
  });
}
function saveFormEditor() {
  const settings = fsSettingsGet('formFieldSettings') || {};
  ['teacherForm', 'studentForm'].forEach(formId => {
    getFormFieldRows(formId).forEach(r => {
      const labelInput = document.getElementById('fe_label_' + r.id);
      const phInput = document.getElementById('fe_ph_' + r.id);
      if (labelInput) {
        settings[r.id] = settings[r.id] || {};
        settings[r.id].label = labelInput.value;
        if (phInput) settings[r.id].placeholder = phInput.value;
      }
    });
  });
  fsSettingsSave('formFieldSettings', settings);
  applyFormFieldSettings();
  showToast('✅ Registration form fields updated!');
}
function resetFormEditor() {
  if (!confirm('Reset all Teacher & Student form field labels/placeholders back to default wording?')) return;
  fsSettingsSave('formFieldSettings', {});
  applyFormFieldSettings();
  renderFormEditor();
  showToast('✅ Form fields reset to default.');
}
// ================================================================
// Teacher Profiles — admin-controlled public showcase (independent
// of the registration list). Used on the "Our Teachers" page and a
// preview strip on the homepage.
// ================================================================
let editingTeacherProfileId = null;
const MEDAL_ICONS = { gold: '🥇', silver: '🥈', bronze: '🥉' };
const CATEGORY_LABELS = { academic: 'Academic Subjects', hobby: 'Hobby / Skill Classes', language: 'Language Classes' };
async function teacherProfileImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 6 * 1024 * 1024) { showToast('⚠️ Image too big! Max 6MB.', 'error'); input.value = ''; return; }
  showToast('⏳ Uploading photo...');
  let url;
  try { url = await uploadToCloudinary(file, 'image', 'althea-scholar/teacher-profiles'); }
  catch (err) { showToast('⚠️ ' + (err.message || 'Photo upload failed — check your internet connection.'), 'error'); return; }
  const prev = document.getElementById('tp_photo_preview');
  prev.src = url; prev.style.display = 'block';
  prev.dataset.data = url;
  delete prev.dataset.removed;
  document.getElementById('tp_photo_remove_btn').style.display = 'inline-flex';
}
// Explicitly clears the teacher's photo (distinct from just not uploading a
// new one) — without this, editing a teacher who already had a photo had
// no way to actually remove it, only replace it with another upload.
function removeTeacherProfilePhoto() {
  const prev = document.getElementById('tp_photo_preview');
  prev.src = ''; prev.style.display = 'none';
  prev.dataset.data = '';
  prev.dataset.removed = '1';
  document.getElementById('tp_photo').value = '';
  document.getElementById('tp_photo_remove_btn').style.display = 'none';
}
function addOrUpdateTeacherProfile() {
  const name = document.getElementById('tp_name').value.trim();
  if (!name) { showToast('⚠️ Teacher name is required!', 'error'); return; }
  const prev = document.getElementById('tp_photo_preview');
  const photoData = prev.dataset.data || '';
  const photoRemoved = prev.dataset.removed === '1';
  const fields = {
    name,
    qualification: document.getElementById('tp_qualification').value.trim(),
    experience: document.getElementById('tp_experience').value.trim(),
    location: document.getElementById('tp_location').value.trim(),
    fee: document.getElementById('tp_fee').value.trim(),
    rating: parseFloat(document.getElementById('tp_rating').value),
    reviewCount: parseInt(document.getElementById('tp_review_count').value, 10) || 0,
    plan: document.getElementById('tp_plan').value,
    medal: document.getElementById('tp_medal').value,
    category: document.getElementById('tp_category').value,
    expertise: document.getElementById('tp_expertise').value.trim(),
    bio: document.getElementById('tp_bio').value.trim(),
    visible: document.getElementById('tp_visible').checked
  };
  if (editingTeacherProfileId !== null) {
    const existing = getData('teacherProfiles').find(p => p.id === editingTeacherProfileId);
    fields.photo = photoRemoved ? '' : (photoData || (existing ? existing.photo : ''));
    updateData('teacherProfiles', editingTeacherProfileId, fields);
    showToast('✅ Teacher profile updated!');
    cancelEditTeacherProfile();
  } else {
    fields.photo = photoRemoved ? '' : photoData;
    addData('teacherProfiles', fields);
    showToast('✅ Teacher profile added!');
    ['tp_name','tp_qualification','tp_experience','tp_location','tp_fee','tp_review_count','tp_expertise','tp_bio'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('tp_photo').value = ''; prev.style.display = 'none'; delete prev.dataset.data; delete prev.dataset.removed;
    document.getElementById('tp_photo_remove_btn').style.display = 'none';
  }
  renderAdminTeacherProfiles(); renderPublicTeacherProfiles(); renderHomepageTeacherPreview();
}
function editTeacherProfile(id) {
  const p = getData('teacherProfiles').find(x => x.id === id);
  if (!p) return;
  editingTeacherProfileId = id;
  document.getElementById('tp_name').value = p.name || '';
  document.getElementById('tp_qualification').value = p.qualification || '';
  document.getElementById('tp_experience').value = p.experience || '';
  document.getElementById('tp_location').value = p.location || '';
  document.getElementById('tp_fee').value = p.fee || '';
  document.getElementById('tp_rating').value = p.rating || 5;
  document.getElementById('tp_review_count').value = p.reviewCount || '';
  document.getElementById('tp_plan').value = p.plan || 'basic';
  document.getElementById('tp_medal').value = p.medal || 'none';
  document.getElementById('tp_category').value = p.category || 'academic';
  document.getElementById('tp_expertise').value = p.expertise || '';
  document.getElementById('tp_bio').value = p.bio || '';
  document.getElementById('tp_visible').checked = !!p.visible;
  const prev = document.getElementById('tp_photo_preview');
  delete prev.dataset.removed;
  if (p.photo) { prev.src = p.photo; prev.style.display = 'block'; prev.dataset.data = p.photo; document.getElementById('tp_photo_remove_btn').style.display = 'inline-flex'; } else { prev.style.display = 'none'; delete prev.dataset.data; document.getElementById('tp_photo_remove_btn').style.display = 'none'; }
  document.getElementById('tp_edit_banner').style.display = 'block';
  document.getElementById('tp_submit_btn').innerHTML = '<i class="fas fa-save"></i> Update Profile';
  document.getElementById('admin-teacher-profiles').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function cancelEditTeacherProfile() {
  editingTeacherProfileId = null;
  ['tp_name','tp_qualification','tp_experience','tp_location','tp_fee','tp_review_count','tp_expertise','tp_bio'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('tp_photo').value = '';
  const prev = document.getElementById('tp_photo_preview'); prev.style.display = 'none'; delete prev.dataset.data; delete prev.dataset.removed;
  document.getElementById('tp_photo_remove_btn').style.display = 'none';
  document.getElementById('tp_edit_banner').style.display = 'none';
  document.getElementById('tp_submit_btn').innerHTML = '<i class="fas fa-plus"></i> Add Teacher Profile';
}
function toggleTeacherProfileVisible(id, checked) {
  stageVisibilityChange('teacherProfiles', id, checked, renderAdminTeacherProfiles);
}
function deleteTeacherProfileConfirm(id) {
  if (!confirm('Delete this teacher profile?')) return;
  deleteData('teacherProfiles', id);
  renderAdminTeacherProfiles(); renderPublicTeacherProfiles(); renderHomepageTeacherPreview();
  showToast('🗑️ Teacher profile deleted.');
}
function renderAdminTeacherProfiles() {
  const items = getData('teacherProfiles');
  const tbody = document.getElementById('adminTeacherProfilesTable');
  if (!tbody) return;
  tbody.innerHTML = items.length ? items.slice().reverse().map(p => `
    <tr>
      <td>${p.photo ? `<img class="img-thumb-sm" src="${p.photo}">` : '<i class="fas fa-user-circle" style="font-size:22px;color:var(--border);"></i>'}</td>
      <td><strong>${p.name}</strong></td>
      <td>${CATEGORY_LABELS[p.category] || p.category}</td>
      <td>${p.plan === 'premium' ? '⭐ Premium' : 'Basic'}</td>
      <td>${MEDAL_ICONS[p.medal] || '-'}</td>
      <td>${p.fee || '-'}</td>
      <td><label class="mini-toggle-row"><input type="checkbox" ${getPendingOrActual('teacherProfiles', p.id, p.visible) ? 'checked' : ''} onchange="toggleTeacherProfileVisible(${p.id}, this.checked)"> ${getPendingOrActual('teacherProfiles', p.id, p.visible) ? 'Visible' : 'Hidden'}</label></td>
      <td><button class="btn btn-outline btn-sm" onclick="editTeacherProfile(${p.id})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm" onclick="deleteTeacherProfileConfirm(${p.id})"><i class="fas fa-trash"></i></button></td>
    </tr>
  `).join('') : '<tr><td colspan="8" style="text-align:center;color:var(--gray);">No teacher profiles yet.</td></tr>';
}
