// ================================================================
// news-sources-extra.js — EXTRA official sources for the News Source Checker.
//
// This is a SEPARATE file on purpose: the original 24 sources stay in
// news-checker.js (DEFAULT_NEWS_SOURCES) and nothing there is touched.
// When the admin opens the "News Source Checker" tab, any source below that
// is not already in the list is added ONCE, as a normal source row — so it
// can be checked, disabled or deleted exactly like the first 24.
//
//  • A source you DELETE stays deleted (its URL is remembered as "already
//    seeded", so it is not added back).
//  • To add more sources later: add a line below, bump SEED_VERSION is NOT
//    needed — any URL not seen before is added once. (Or just use the
//    "Add a Source" form in the admin panel — both work.)
//
// NOTE: these URLs came from a compiled list and were NOT individually
// opened/verified. If a site blocks automatic checks it will show
// "Unable to Check Automatically" or an error — just disable/delete it.
// Session-specific URLs (e.g. JAM / GATE 2026) change every year.
// ================================================================
(function () {
  'use strict';
  // [ Organisation , Portal name , URL ]
  const EXTRA_NEWS_SOURCES = [
    // 1. Central education, school boards, curriculum
    ['Ministry of Education', 'Official Education Portal', 'https://www.education.gov.in/'],
    ['Dept. of School Education & Literacy', 'School Education Portal', 'https://dsel.education.gov.in/'],
    ['Dept. of Higher Education', 'Higher Education Portal', 'https://www.education.gov.in/en/higher-education'],
    ['CBSE', 'Academic Portal', 'https://cbseacademic.nic.in/'],
    ['CBSE', 'Results Portal', 'https://results.cbse.nic.in/'],
    ['NCERT', 'ePathshala', 'https://epathshala.nic.in/'],
    ['DIKSHA', 'Digital Learning Portal', 'https://diksha.gov.in/'],
    ['PM e-VIDYA', 'Digital Education Portal', 'https://pmevidya.education.gov.in/'],
    ['NIOS', 'Open Schooling Portal', 'https://www.nios.ac.in/'],
    ['UDISE+', 'School Education Data Portal', 'https://udiseplus.gov.in/'],
    ['NDLI', 'National Digital Library of India', 'https://ndl.iitkgp.ac.in/'],
    ['Cambridge International', 'School Qualifications', 'https://www.cambridgeinternational.org/'],
    // 2. Entrance exams & counselling
    ['NTA', 'NCHM JEE', 'https://exams.nta.ac.in/NCHM/'],
    ['NTA', 'CUET PG', 'https://exams.nta.ac.in/CUET-PG/'],
    ['IISER', 'IISER Admissions', 'https://www.iiseradmission.in/'],
    ['CLAT', 'Consortium of NLUs', 'https://consortiumofnlus.ac.in/'],
    ['NIFT', 'National Institute of Fashion Technology', 'https://www.nift.ac.in/'],
    ['NID', 'National Institute of Design', 'https://www.nid.edu/'],
    ['ICAR', 'Agricultural Education & Admissions', 'https://icar.org.in/'],
    ['IMU', 'Indian Maritime University Admissions', 'https://www.imu.edu.in/'],
    ['VIT', 'VITEEE', 'https://viteee.vit.ac.in/'],
    ['IIT JAM', 'JAM 2026 (session-specific)', 'https://jam2026.iitb.ac.in/'],
    ['GATE', 'GATE 2026 (session-specific)', 'https://gate2026.iisc.ac.in/'],
    // 3. School admissions & residential schools
    ['Sainik Schools Society', 'Sainik Schools Information', 'https://sainikschools.gov.in/'],
    ['AWES', 'Army Welfare Education Society', 'https://www.awesindia.com/'],
    // 4. Scholarships & student schemes
    ['DST', 'INSPIRE', 'https://online-inspire.gov.in/'],
    ['MoSJE', 'National Overseas Scholarship', 'https://nosmsje.gov.in/'],
    ['Ministry of Tribal Affairs', 'Tribal Education & Scholarships', 'https://tribal.nic.in/'],
    ['Ministry of Minority Affairs', 'Minority Welfare & Scholarships', 'https://www.minorityaffairs.gov.in/'],
    ['DEPwD', 'Disability Welfare Schemes', 'https://depwd.gov.in/'],
    ['Ministry of Labour & Employment', 'Labour Welfare Scholarships', 'https://labour.gov.in/'],
    ['National Govt Services Portal', 'Education & Learning Services', 'https://services.india.gov.in/service/listing?cat_id=1&ln=en'],
    ['National Govt Services Portal', 'Scholarships & Student Finance', 'https://services.india.gov.in/service/listing?cat_id=66&ln=en'],
    // 5. Olympiads, science competitions, talent development
    ['HBCSE', 'Olympiad Portal', 'https://olympiads.hbcse.tifr.res.in/'],
    ['HBCSE', 'Main Portal', 'https://www.hbcse.tifr.res.in/'],
    ['IAPT', 'Indian Association of Physics Teachers', 'https://www.iapt.org.in/'],
    ['SOF', 'Science Olympiad Foundation', 'https://sofworld.org/'],
    ['Atal Innovation Mission', 'Innovation Programmes', 'https://aim.gov.in/'],
    ['NCSM', 'National Council of Science Museums', 'https://ncsm.gov.in/'],
    ['India S&T', 'Science Opportunities Portal', 'https://www.indiascienceandtechnology.gov.in/'],
    ['ISRO', 'Student Opportunities', 'https://www.isro.gov.in/'],
    ['MyGov', 'Student Competitions & Quizzes', 'https://www.mygov.in/'],
    ['Vigyan Prasar', 'Science Outreach', 'https://vigyanprasar.gov.in/'],
    // 6. University, higher education, career portals
    ['IISc', 'Indian Institute of Science', 'https://iisc.ac.in/'],
    ['UGC', 'e-Samadhan', 'https://samadhaan.ugc.ac.in/'],
    ['NCS', 'National Career Service', 'https://www.ncs.gov.in/'],
    ['MSDE', 'Skill Development & Entrepreneurship', 'https://www.msde.gov.in/'],
    ['Skill India', 'Skill India Digital Hub', 'https://www.skillindiadigital.gov.in/'],
    ['IGNOU', 'Indira Gandhi National Open University', 'https://www.ignou.ac.in/'],
    ['NIEPA', 'Educational Planning & Administration', 'https://niepa.ac.in/'],
    ['NCTE', 'National Council for Teacher Education', 'https://ncte.gov.in/'],
    ['NBA', 'National Board of Accreditation', 'https://www.nbaind.org/'],
    ['NAAC', 'Assessment and Accreditation Council', 'https://www.naac.gov.in/'],
    // 7. State education departments & SCERT
    ['Andhra Pradesh', 'School Education Department', 'https://schooledu.ap.gov.in/DSE'],
    ['Andhra Pradesh', 'Teacher Recruitment / AP DSC', 'https://apdsc.apcfss.in/'],
    ['Assam', 'Directorate of Elementary Education', 'https://dee.assam.gov.in/'],
    ['Assam', 'Secondary Education Department', 'https://education.assam.gov.in/'],
    ['Assam', 'SCERT', 'https://www.scertassam.co.in/'],
    ['Bihar', 'Education Department', 'https://www.educationbihar.gov.in/'],
    ['Bihar', 'BSEB — Secondary', 'https://secondary.biharboardonline.com/'],
    ['Bihar', 'SCERT / ODL', 'http://www.odlscertbihar.in/'],
    ['Chhattisgarh', 'Education Portal', 'https://www.eduportal.cg.nic.in/'],
    ['Chhattisgarh', 'SCERT', 'https://scert.cg.gov.in/'],
    ['Delhi', 'Directorate of Education', 'http://www.edudel.nic.in/'],
    ['Delhi', 'SCERT', 'http://www.scertdelhi.nic.in/'],
    ['Gujarat', 'Education Department', 'https://gujarat-education.gov.in/education'],
    ['Gujarat', 'GCERT', 'http://gcert.gujarat.gov.in/gcert'],
    ['Haryana', 'Board of School Education (BSEH)', 'https://bseh.org.in/'],
    ['Himachal Pradesh', 'Education Department', 'https://himachal.nic.in/'],
    ['Himachal Pradesh', 'SCERT', 'https://himachalservices.nic.in/scert/en-IN/index.html'],
    ['Jammu & Kashmir', 'JKBOSE', 'https://jkbose.nic.in/'],
    ['Jammu & Kashmir', 'Directorate of School Education Kashmir', 'http://www.dsek.nic.in/'],
    ['Madhya Pradesh', 'MP Board (MPBSE)', 'https://mpbse.nic.in/'],
    ['Madhya Pradesh', 'Education Portal', 'http://www.educationportal.mp.gov.in/'],
    ['Maharashtra', 'State Board (MSBSHSE)', 'https://mahahsscboard.in/'],
    ['Odisha', 'School & Mass Education Department', 'https://sme.odisha.gov.in/'],
    ['Odisha', 'SCERT', 'http://scert.samsodisha.gov.in/'],
    ['Punjab', 'Punjab School Education Board (PSEB)', 'https://www.pseb.ac.in/'],
    ['Punjab', 'SCERT', 'https://scert.epunjabschool.gov.in/'],
    ['Rajasthan', 'Board of Secondary Education (RBSE)', 'https://rajeduboard.rajasthan.gov.in/'],
    ['Rajasthan', 'Education Department', 'https://education.rajasthan.gov.in/'],
    ['Sikkim', 'Education Department', 'http://sikkimhrdd.org/'],
    ['Sikkim', 'SCERT', 'http://www.scertsikkim.in/'],
    ['Tamil Nadu', 'Directorate of Government Examinations', 'https://dge.tn.gov.in/'],
    ['Tamil Nadu', 'School Education Department', 'https://tnschools.gov.in/'],
    ['Tamil Nadu', 'SCERT', 'https://www.tnscert.org/'],
    ['Telangana', 'School Education Department', 'https://schooledu.telangana.gov.in/'],
    ['Telangana', 'SCERT', 'https://scert.telangana.gov.in/'],
    ['Tripura', 'Directorate of Elementary Education', 'https://elementaryeducation.tripura.gov.in/'],
    ['Tripura', 'Directorate of Secondary Education', 'https://schooleducation.tripura.gov.in/'],
    ['Tripura', 'SCERT', 'https://scertonline.tripura.gov.in/'],
    ['Uttar Pradesh', 'UP Board (UPMSP)', 'https://upmsp.edu.in/'],
    ['Uttar Pradesh', 'SCERT', 'https://scertup.org.in/'],
    ['Uttarakhand', 'School Education Department', 'https://schooleducation.uk.gov.in/'],
    ['Uttarakhand', 'SCERT', 'https://scert.uk.gov.in/'],
    ['West Bengal', 'WBBSE — Secondary Board', 'https://wbbse.wb.gov.in/'],
    ['West Bengal', 'SCERT', 'https://www.scertwb.org/'],
    // 8. State boards — additional exam portals
    ['Karnataka', 'KSEAB', 'https://kseab.karnataka.gov.in/'],
    ['Kerala', 'Pareeksha Bhavan', 'https://pareekshabhavan.kerala.gov.in/'],
    ['Kerala', 'Board of Public Examinations (KBPE)', 'https://education.kerala.gov.in/'],
    ['Jharkhand', 'Jharkhand Academic Council (JAC)', 'https://jac.jharkhand.gov.in/'],
    ['Goa', 'GBSHSE', 'https://www.gbshse.in/'],
    ['Manipur', 'BSEM', 'https://bsem.nic.in/'],
    ['Manipur', 'COHSEM', 'https://cohsem.nic.in/'],
    ['Meghalaya', 'MBOSE', 'https://www.mbose.in/'],
    ['Mizoram', 'MBSE', 'https://www.mbse.edu.in/'],
    ['Nagaland', 'NBSE', 'https://nbsenl.edu.in/'],
    ['Arunachal Pradesh', 'Directorate of School Education', 'https://apeducation.in/'],
    ['Assam', 'SEBA', 'https://site.sebaonline.org/'],
    ['Odisha', 'BSE Odisha', 'https://www.bseodisha.ac.in/'],
    ['Odisha', 'CHSE Odisha', 'https://chseodisha.nic.in/'],
    ['Andhra Pradesh', 'BSEAP', 'https://www.bse.ap.gov.in/'],
    ['Telangana', 'BSE Telangana', 'https://bse.telangana.gov.in/'],
    ['Telangana', 'Board of Intermediate Education (TGBIE)', 'https://tgbie.cgg.gov.in/'],
    ['Chhattisgarh', 'CGBSE', 'https://cgbse.nic.in/'],
    ['Uttarakhand', 'UBSE', 'https://ubse.uk.gov.in/'],
    ['Bihar', 'BSEB', 'https://biharboardonline.bihar.gov.in/'],
    ['Gujarat', 'GSEB', 'https://www.gseb.org/'],
    // 9. Government schemes, school data, public services
    ['Ministry of Education', 'UDISE Portals', 'https://www.education.gov.in/udise-portals'],
    ['Govt of India', 'National Government Services Portal', 'https://services.india.gov.in/'],
    ['Govt of India', 'National Portal — Web Directory', 'https://www.india.gov.in/directory/web-directory'],
    ['Ministry of Education', 'PM POSHAN', 'https://pmposhan.education.gov.in/'],
    ['Ministry of Education', 'PM SHRI Schools', 'https://pmshri.education.gov.in/'],
    // 10. Other official / international
    ['UNESCO', 'Education', 'https://www.unesco.org/en/education'],
    ['UNICEF', 'Education', 'https://www.unicef.org/education'],
    ['British Council India', 'Education & Exams', 'https://www.britishcouncil.in/']
  ];

  const SEED_KEY = 'newsExtraSeed';           // remembers which URLs were already offered (so deleted ones stay deleted)
  const norm = u => String(u || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
  const h36 = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  let seeding = false, tries = 0, timer = null;

  function trySeed() {
    try {
      if (seeding) return true;
      if (typeof isAdminLoggedIn === 'undefined' || !isAdminLoggedIn) return false;
      if (typeof fsSettingsGet !== 'function' || typeof fsBatchSet !== 'function') return false;
      const st = fsSettingsGet(SEED_KEY);
      if (!fsSettingsLoaded(SEED_KEY)) return false;              // wait until the "already seeded" list has arrived
      const existing = getData('newsSources');
      if (!existing.length) return false;                          // wait until the source list has loaded
      const seeded = new Set((st && st.urls) || []);
      const have = new Set(existing.map(s => norm(s.url)));
      if (typeof DEFAULT_NEWS_SOURCES !== 'undefined') DEFAULT_NEWS_SOURCES.forEach(d => have.add(norm(d.url)));
      const add = [], offered = [];
      EXTRA_NEWS_SOURCES.forEach(([org, name, url]) => {
        const n = norm(url);
        if (seeded.has(n)) return;                                 // already offered once (maybe deleted since)
        offered.push(n);
        if (have.has(n)) return;                                   // already in the list (e.g. one of the first 24)
        have.add(n);
        const docId = 'extra-' + fsSlugKey(org) + '-' + fsSlugKey(name) + '-' + h36(n);
        add.push({ docId, item: { org, name, url, id: docId, category: 'preset', enabled: true, lastChecked: '', lastStatus: '', lastHash: '', lastNote: '' } });
      });
      if (!offered.length) return true;                            // nothing new — done
      seeding = true;
      fsBatchSet('newsSources', add).then(() => {
        fsSettingsSave(SEED_KEY, { v: 1, urls: Array.from(seeded).concat(offered) });
        if (add.length && typeof showToast === 'function') showToast('✅ ' + add.length + ' naye official news sources add ho gaye.');
        if (typeof renderNewsSourcesAdmin === 'function') renderNewsSourcesAdmin();
      }).catch(err => console.error('Extra news sources seeding failed:', err)).then(() => { seeding = false; });
      return true;
    } catch (e) { return false; }
  }
  function startPoller() {
    if (timer) return; tries = 0;
    timer = setInterval(() => { tries++; if (trySeed() || tries > 45) { clearInterval(timer); timer = null; } }, 2000);
  }

  // Run when the admin opens the News Source Checker tab (wraps the existing render function, doesn't edit it)
  if (typeof renderNewsSourcesAdmin === 'function') {
    const _render = renderNewsSourcesAdmin;
    window.renderNewsSourcesAdmin = function () { trySeed(); startPoller(); return _render.apply(this, arguments); };
  }
  // …and shortly after the admin logs in
  try { if (typeof fsAuth !== 'undefined') fsAuth.onAuthStateChanged(u => { if (u) startPoller(); }); } catch (e) {}
  window.NEWS_EXTRA_SOURCES = EXTRA_NEWS_SOURCES;
})();
