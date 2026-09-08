/* ==================================================================
   Althea Scholar — shared script for standalone SEO landing pages
   (tuition-in-*.html, tuition-cities.html, and the subject pages).

   This connects to the SAME Firebase project as the main site so
   that things you control from the Admin Panel — WhatsApp/phone
   number (Homepage Content → Contact Info), logo & colors
   (Branding & Theme), and this page's own text (SEO Pages tab) —
   automatically apply here too, with no separate editing needed.

   If Firestore can't be reached (offline, ad-blocker, etc.) every
   page still works fine with its built-in default content — this
   script only ever *overrides* what's already on the page.
   ================================================================== */
(function () {
  var firebaseConfig = {
    apiKey: "AIzaSyD8XOo2JmlsVIG9KondtIaCPar6VmDK5VY",
    authDomain: "althea-scholar.firebaseapp.com",
    projectId: "althea-scholar",
    storageBucket: "althea-scholar.firebasestorage.app",
    messagingSenderId: "769869945121",
    appId: "1:769869945121:web:0713e62f9b9d5f1aa78660",
    measurementId: "G-LKSLD7WYJJ"
  };

  if (typeof firebase === "undefined") return; // SDK script tags missing/blocked — just skip enhancement
  try {
    if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
  } catch (e) { console.warn("Althea SEO shared: firebase init failed", e); return; }

  var db = firebase.firestore();

  // ---- 1) Contact info (WhatsApp / phone) — from Admin → Homepage Content ----
  db.collection("settings").doc("homepageContent").get().then(function (doc) {
    var c = (doc.exists && doc.data().value) || {};
    var whatsapp = c.whatsapp || "918287771882";
    var phone = c.phone || "+91 82877 71882";
    document.querySelectorAll("[data-tel]").forEach(function (el) {
      el.setAttribute("href", "tel:+" + whatsapp);
      if (el.dataset.telText === "1") el.textContent = phone;
    });
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      var text = el.getAttribute("data-wa-text") || "";
      var url = "https://wa.me/" + whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
      el.setAttribute("href", url);
    });
  }).catch(function (e) { console.warn("Althea SEO shared: contact fetch failed", e); });

  // ---- 2) Branding (logo image/text/colors) — from Admin → Branding & Theme ----
  db.collection("settings").doc("branding").get().then(function (doc) {
    var b = (doc.exists && doc.data().value) || {};
    if (b.color_primary) document.documentElement.style.setProperty("--primary", b.color_primary);
    if (b.color_secondary) document.documentElement.style.setProperty("--secondary", b.color_secondary);
    if (b.font_heading) document.documentElement.style.setProperty("--font-heading", "'" + b.font_heading + "'");
    if (b.logo_text_top) document.querySelectorAll(".logo-text .top").forEach(function (el) { el.textContent = b.logo_text_top; });
    if (b.logo_text_bottom) document.querySelectorAll(".logo-text .bottom").forEach(function (el) { el.textContent = b.logo_text_bottom; });
    if (b.logo_image) {
      document.querySelectorAll(".logo-icon").forEach(function (el) {
        el.innerHTML = '<img src="' + b.logo_image + '" alt="logo" style="height:100%;width:auto;max-width:180px;object-fit:contain;display:block;">';
      });
      var favicon = document.querySelector('link[rel="icon"]');
      if (favicon) favicon.href = b.logo_image;
    }
  }).catch(function (e) { console.warn("Althea SEO shared: branding fetch failed", e); });

  // ---- 3) This page's own content — from Admin → SEO Pages ----
  var slug = document.body.getAttribute("data-seo-slug");
  if (!slug) return;

  db.collection("settings").doc("seoPages").get().then(function (doc) {
    var v = (doc.exists && doc.data().value) || {};

    // Whole-page hide: show a friendly notice instead of the content.
    var visibleMap = v.visible || {};
    if (visibleMap[slug] === false) {
      var main = document.getElementById("pageMain");
      if (main) {
        main.innerHTML = '<div style="text-align:center;padding:60px 20px;">' +
          '<h1 style="color:var(--secondary);">This page isn\u2019t available right now</h1>' +
          '<p style="color:var(--gray);">Please head back to our homepage to continue.</p>' +
          '<a class="btn-primary" href="/">Go to Homepage \u2192</a></div>';
      }
      document.title = "Page unavailable | Althea Scholar";
      return;
    }

    // Per-page text overrides (title / meta description / H1 / body HTML).
    var pageData = (v.pages && v.pages[slug]) || null;
    if (pageData) {
      if (pageData.title) document.title = pageData.title;
      if (pageData.desc) {
        var m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", pageData.desc);
        var om = document.querySelector('meta[property="og:description"]');
        if (om) om.setAttribute("content", pageData.desc);
      }
      var h1 = document.getElementById("pageH1");
      if (h1 && pageData.h1) h1.innerHTML = pageData.h1;
      var body = document.getElementById("pageBody");
      if (body && pageData.body) body.innerHTML = pageData.body;
    }

    // Cities hub page: fully admin-editable city list (name/nearby/description).
    if (slug === "tuition-cities" && v.cities && v.cities.length) {
      var list = document.getElementById("citiesList");
      if (list) {
        list.innerHTML = v.cities.map(function (c) {
          var nameHtml = c.dedicatedUrl
            ? '<a href="' + c.dedicatedUrl + '"><strong>' + c.name + "</strong></a>"
            : "<strong>" + c.name + "</strong>";
          return '<div class="city-card"><h3>' + nameHtml + "</h3>" +
            (c.nearby ? '<p class="nearby-line"><i class="fas fa-location-dot"></i> Also covering: ' + c.nearby + "</p>" : "") +
            "<p>" + (c.desc || "") + "</p></div>";
        }).join("");
      }
    }
  }).catch(function (e) { console.warn("Althea SEO shared: page content fetch failed", e); });
})();
