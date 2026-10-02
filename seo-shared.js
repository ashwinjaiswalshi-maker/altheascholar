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
 
 
  // ---- 3b) Education Updates & Blog pages (Step 4) — rendered from the SAME
  //          Firestore collections the admin panel writes to ("announcements"
  //          and "blogPosts"). Only items marked visible are ever shown. ----
  var contentMode = document.body.getAttribute("data-content");
  if (contentMode) {
    var SITE = "https://altheascholar.in/";
    var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var TYPES = { cbse:["CBSE Update","#e1edff","#1451b8"], scholarship:["Scholarship","#fdf1e0","#c97f1f"], exam:["Exam Update","#ffe9d2","#b45309"], result:["Result","#eadcff","#6d28d9"], admission:["Admission","#ffdcec","#be185d"], other:["Other","#e7ebf1","#4a5a72"], notice:["Notice","#e7ebf1","#4a5a72"], update:["New Update","#e1edff","#1451b8"], material:["Study Material","#f1e9fb","#5637a8"], important:["Important","#fff3c9","#8a5300"] };
    var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]; }); };
    var safe = function (u) { u = String(u == null ? "" : u).trim(); return /^https?:\/\//i.test(u) ? u : ""; };
    var lines = function (s) { return String(s == null ? "" : s).split("\n").map(function (x) { return x.trim(); }).filter(Boolean); };
    var fmt = function (v) { var d = new Date(v); return isNaN(d) ? "" : ("0" + d.getDate()).slice(-2) + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); };
    var tp = function (t) { return TYPES[t] || TYPES.other; };
    var chip = function (t) { var x = tp(t); return '<span class="uchip" style="background:' + x[1] + ';color:' + x[2] + '">' + esc(x[0]) + "</span>"; };
    var root = document.getElementById("contentRoot");
    var setMeta = function (sel, attr, key, val) { var el = document.querySelector(sel); if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); } el.setAttribute("content", val); };
    var applySeo = function (o) {
      document.title = o.title;
      setMeta('meta[name="description"]', "name", "description", o.desc || "");
      setMeta('meta[property="og:title"]', "property", "og:title", o.title);
      setMeta('meta[property="og:description"]', "property", "og:description", o.desc || "");
      setMeta('meta[property="og:type"]', "property", "og:type", "article");
      if (o.keywords) setMeta('meta[name="keywords"]', "name", "keywords", o.keywords);
      if (o.image) setMeta('meta[property="og:image"]', "property", "og:image", o.image);
      setMeta('meta[property="og:url"]', "property", "og:url", o.url);
      var c = document.querySelector('link[rel="canonical"]'); if (c) c.setAttribute("href", o.url);
      if (o.robots) setMeta('meta[name="robots"]', "name", "robots", o.robots);
      if (o.ld) { var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(o.ld); document.head.appendChild(s); }
    };
    var srcInfo = function (a) {
      var url = safe(a.source); if (!url) return null;
      var host = ""; try { host = new URL(url).hostname; } catch (e) {}
      var kind = a.sourceType; if (kind !== "official" && kind !== "other") kind = /(\.gov\.in|\.nic\.in|\.gov|\.ac\.in|\.edu\.in|\.res\.in)$/i.test(host) ? "official" : "unspecified";
      return { url: url, kind: kind, label: kind === "official" ? "Official Source" : kind === "other" ? "Other Source" : "Source" };
    };
    var notFound = function (what, back, backUrl) {
      root.innerHTML = '<div class="upd-empty"><h2>' + what + ' is not available</h2><p><a class="btn-primary" href="' + backUrl + '">' + back + "</a></p></div>";
      applySeo({ title: what + " not available | Althea Scholar", desc: "", url: location.href.split("#")[0], robots: "noindex, follow" });
    };
    var qid = Number((new URLSearchParams(location.search)).get("id"));
    var listOf = function (col) { return db.collection(col).get().then(function (snap) { var out = []; snap.forEach(function (d) { var x = d.data(); if (x && x.visible) out.push(x); }); return out; }); };
    var byDate = function (a, b) { return (new Date(b.date) - new Date(a.date)) || (b.id - a.id); };
    var updCard = function (a) {
      return '<a class="ucard" href="' + SITE + "education-update.html?id=" + a.id + '">' +
        (a.image ? '<span class="uimg"><img src="' + esc(a.image) + '" alt="' + esc(a.title) + '" loading="lazy"></span>' : "") +
        '<span class="ubody">' + chip(a.type) + "<h3>" + esc(a.title) + "</h3><p>" + esc(a.desc || "") + '</p><span class="udate">Last updated: ' + fmt(a.updatedAt || a.date) + '</span><span class="uread">Read Update →</span></span></a>';
    };
    var sec = function (title, inner) { return '<section class="usec"><h2>' + title + "</h2>" + inner + "</section>"; };
    var ul = function (arr, ord) { var t = ord ? "ol" : "ul"; return "<" + t + ' class="ulist">' + arr.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</" + t + ">"; };
    var blogBody = function (text) {
      var inline = function (t) { return esc(t).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[a-z-]+)\)/g, function (m, label, href) {
        href = href.replace(/&amp;/g, "&"); var map = { "#study-material": "cbse-icse-study-material.html", "#education-updates": "education-updates.html", "#find-tutor": SITE + "#find-tutor", "#become-teacher": SITE + "#become-teacher", "#entrance-exams": "entrance-exam-preparation.html", "#blog": "blog.html", "#our-teachers": SITE + "#our-teachers" };
        if (href.charAt(0) === "#") return map[href] ? '<a href="' + map[href] + '">' + label + "</a>" : label;
        return '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + label + "</a>"; }); };
      var out = [], list = []; var flush = function () { if (list.length) { out.push('<ul class="ulist">' + list.map(function (x) { return "<li>" + inline(x) + "</li>"; }).join("") + "</ul>"); list = []; } };
      String(text || "").split(/\n{2,}/).forEach(function (block) { block.split("\n").forEach(function (line) { var l = line.trim(); if (!l) return;
        if (/^###\s+/.test(l)) { flush(); out.push("<h3>" + inline(l.replace(/^###\s+/, "")) + "</h3>"); }
        else if (/^##\s+/.test(l)) { flush(); out.push("<h2>" + inline(l.replace(/^##\s+/, "")) + "</h2>"); }
        else if (/^[-*]\s+/.test(l)) list.push(l.replace(/^[-*]\s+/, ""));
        else { flush(); out.push("<p>" + inline(l) + "</p>"); } }); flush(); });
      return out.join("");
    };
 
    if (contentMode === "updates-list") {
      listOf("announcements").then(function (items) {
        items.sort(byDate);
        var keys = ["all", "cbse", "scholarship", "exam", "result", "admission", "other"];
        var draw = function (k) {
          var shown = k === "all" ? items : items.filter(function (a) { return k === "other" ? ["cbse","scholarship","exam","result","admission"].indexOf(a.type) < 0 : a.type === k; });
          document.getElementById("ufilters").innerHTML = keys.map(function (x) { return '<button type="button" data-k="' + x + '" class="' + (x === k ? "on" : "") + '">' + (x === "all" ? "All" : TYPES[x][0]) + "</button>"; }).join("");
          document.getElementById("ucards").innerHTML = shown.length ? shown.map(updCard).join("") : '<div class="upd-empty">No updates in this category yet.</div>';
          document.querySelectorAll("#ufilters button").forEach(function (b) { b.onclick = function () { draw(b.getAttribute("data-k")); }; });
        };
        if (!items.length) { document.getElementById("ucards").innerHTML = '<div class="upd-empty">No updates have been published yet. Please check back soon.</div>'; return; }
        draw("all");
      }).catch(function () { document.getElementById("ucards").innerHTML = '<div class="upd-empty">Updates could not be loaded right now. Please try again later.</div>'; });
    }
 
    if (contentMode === "update") {
      listOf("announcements").then(function (items) {
        var a = items.filter(function (x) { return x.id === qid; })[0];
        if (!a) return notFound("This update", "View all updates", "education-updates.html");
        var t = tp(a.type), src = srcInfo(a), pts = (a.points || []).filter(Boolean);
        var dates = lines(a.importantDates).map(function (l) { var i = l.indexOf(":"); return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : ["", l]; });
        var elig = lines(a.eligibility), docs = lines(a.documents), how = lines(a.howToApply);
        var links = []; var ap = safe(a.applyLink), web = safe(a.officialWebsite), nt = safe(a.notificationUrl);
        if (ap) links.push(["pri", "Application Link", ap]); if (web) links.push([ap ? "" : "pri", "Official Website", web]); if (nt) links.push(["", "Official Notification / PDF", nt]);
        var related = items.filter(function (x) { return x.id !== a.id; }).sort(byDate).slice(0, 3);
        var canon = SITE + "education-update.html?id=" + a.id;
        var h = (a.image ? '<figure class="ufig"><img src="' + esc(a.image) + '" alt="' + esc(a.title) + '">' + (a.caption ? "<figcaption>" + esc(a.caption) + "</figcaption>" : "") + "</figure>" : "") +
          "<h1>" + esc(a.title) + '</h1><div class="umeta">' + chip(a.type) + "<span>Last updated: " + fmt(a.updatedAt || a.date) + "</span>" + (a.adminVerified ? '<span class="uver">✔ Checked by admin</span>' : "") + "</div>" +
          '<div class="usum"><strong>Summary</strong><p>' + esc(a.desc || "") + "</p></div>" +
          (a.fullDesc ? sec("Details", '<div class="utxt">' + esc(a.fullDesc) + "</div>") : "") +
          (dates.length ? sec("Important Dates", '<div class="utw"><table class="utbl">' + dates.map(function (d) { return d[0] ? "<tr><td>" + esc(d[0]) + "</td><td>" + esc(d[1]) + "</td></tr>" : '<tr><td colspan="2">' + esc(d[1]) + "</td></tr>"; }).join("") + "</table></div>") : "") +
          (elig.length ? sec("Eligibility", ul(elig)) : "") + (docs.length ? sec("Documents Required", ul(docs)) : "") + (how.length ? sec("How to Apply", ul(how, true)) : "") +
          (a.fee ? sec("Application Fee", '<div class="utxt">' + esc(a.fee) + "</div>") : "") + (pts.length ? sec("Important Points", ul(pts)) : "") +
          (links.length ? sec("Official Links", '<div class="ulinks">' + links.map(function (l) { return '<a class="' + l[0] + '" href="' + esc(l[2]) + '" target="_blank" rel="noopener">' + l[1] + "</a>"; }).join("") + "</div>") : "") +
          (src ? '<div class="usrc"><strong>' + src.label + '</strong> <a href="' + esc(src.url) + '" target="_blank" rel="noopener">' + esc(src.url) + "</a>" + (src.kind === "unspecified" ? '<div class="unote">This link has not been marked as an official source.</div>' : "") + "</div>" : "") +
          '<p class="unote">Please confirm dates, fees and eligibility on the official website or notification before applying.</p>' +
          '<section class="usec"><h2>Related updates</h2><div class="ucards">' + (related.length ? related.map(updCard).join("") : '<div class="upd-empty">No other updates yet.</div>') + "</div></section>" +
          '<section class="usec"><h2>Helpful next steps</h2><div class="ulinks"><a href="cbse-icse-study-material.html">Free Study Material</a><a href="entrance-exam-preparation.html">Entrance Exam Preparation</a><a href="blog.html">Read our Blog</a><a href="' + SITE + '#find-tutor">Find a Tutor</a></div></section>';
        root.innerHTML = h;
        document.getElementById("crumbLast").textContent = a.title;
        var desc = (a.seoDesc || a.desc || "").slice(0, 170);
        var art = { "@type": "Article", headline: a.seoTitle || a.title, description: desc, datePublished: a.date, dateModified: a.updatedAt || a.date, mainEntityOfPage: canon, author: { "@type": "Organization", name: "Althea Scholar" }, publisher: { "@type": "Organization", name: "Althea Scholar", url: SITE } };
        if (safe(a.image)) art.image = a.image; if (src && src.kind === "official") art.citation = src.url;
        applySeo({ title: (a.seoTitle || a.title) + " | Althea Scholar", desc: desc, keywords: a.keywords, url: canon, image: safe(a.image),
          ld: { "@context": "https://schema.org", "@graph": [art, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "Education Updates", item: SITE + "education-updates.html" }, { "@type": "ListItem", position: 3, name: a.title, item: canon }] }] } });
      }).catch(function () { notFound("This update", "View all updates", "education-updates.html"); });
    }
 
    if (contentMode === "blog-list") {
      listOf("blogPosts").then(function (posts) {
        posts.sort(byDate);
        document.getElementById("ucards").innerHTML = posts.length ? posts.map(function (p) {
          return '<a class="ucard" href="' + SITE + "blog-post.html?id=" + p.id + '">' + (p.image ? '<span class="uimg"><img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy"></span>' : "") +
            '<span class="ubody">' + (p.category ? '<span class="uchip" style="background:#e1edff;color:#1451b8">' + esc(p.category) + "</span>" : "") + "<h3>" + esc(p.title) + "</h3><p>" + esc((p.excerpt || "").slice(0, 140)) + '</p><span class="udate">' + fmt(p.date) + " · " + esc(p.author || "Althea Scholar Team") + '</span><span class="uread">Read article →</span></span></a>'; }).join("") : '<div class="upd-empty">No articles yet. Please check back soon.</div>';
      }).catch(function () { document.getElementById("ucards").innerHTML = '<div class="upd-empty">Articles could not be loaded right now.</div>'; });
    }
 
    if (contentMode === "blog-post") {
      Promise.all([listOf("blogPosts"), listOf("announcements")]).then(function (r) {
        var posts = r[0], ups = r[1];
        var p = posts.filter(function (x) { return x.id === qid; })[0];
        if (!p) return notFound("This article", "View all articles", "blog.html");
        var canon = SITE + "blog-post.html?id=" + p.id;
        var others = posts.filter(function (x) { return x.id !== p.id; }).sort(byDate);
        var related = others.filter(function (x) { return p.category && x.category === p.category; }).concat(others.filter(function (x) { return !(p.category && x.category === p.category); })).slice(0, 3);
        var upd = p.relatedUpdate ? ups.filter(function (x) { return x.id === Number(p.relatedUpdate); })[0] : null;
        var ctas = { "find-tutor": ["Looking for a tutor?", "Tell us the class, subjects and mode you need. Registration is free.", "Find a Tutor", SITE + "#find-tutor"], "become-teacher": ["Want to teach with us?", "Register free — your profile is listed after the team reviews your documents.", "Become a Teacher", SITE + "#become-teacher"], "study-material": ["Free study material", "Notes, exercise answers and practice papers for Class 6–12.", "Open Study Material", "cbse-icse-study-material.html"], "entrance-exams": ["Preparing for an entrance exam?", "Guides for Sainik School, Navodaya, RMS CET and more.", "See Entrance Exams", "entrance-exam-preparation.html"] };
        var c = ctas[p.cta];
        var smLink = p.smClass ? '<a href="cbse-icse-study-material.html">' + esc(p.smClass + (p.smSubject ? " " + p.smSubject : "")) + " Study Material</a>" : "";
        var h = (p.image ? '<figure class="ufig"><img src="' + esc(p.image) + '" alt="' + esc(p.title) + '"></figure>' : "") + "<h1>" + esc(p.title) + '</h1><div class="umeta">' + (p.category ? '<span class="uchip" style="background:#e1edff;color:#1451b8">' + esc(p.category) + "</span>" : "") + "<span>" + fmt(p.date) + "</span><span>" + esc(p.author || "Althea Scholar Team") + "</span></div>" +
          '<div class="ubodytxt">' + blogBody(p.content || p.excerpt || "") + "</div>" +
          ((smLink || upd) ? '<section class="usec"><h2>Related resources</h2><div class="ulinks">' + smLink + (upd ? '<a href="education-update.html?id=' + upd.id + '">Education Update: ' + esc(upd.title) + "</a>" : "") + "</div></section>" : "") +
          (c ? '<div class="ucta"><strong>' + c[0] + "</strong><p>" + c[1] + '</p><a class="btn-primary" href="' + c[3] + '">' + c[2] + " →</a></div>" : "") +
          '<section class="usec"><h2>Related articles</h2><div class="ucards">' + (related.length ? related.map(function (x) { return '<a class="ucard" href="blog-post.html?id=' + x.id + '"><span class="ubody"><h3>' + esc(x.title) + '</h3><span class="udate">' + fmt(x.date) + "</span></span></a>"; }).join("") : '<div class="upd-empty">No other articles yet.</div>') + "</div></section>";
        root.innerHTML = h; document.getElementById("crumbLast").textContent = p.title;
        var desc = (p.seoDesc || p.excerpt || "").slice(0, 170);
        var post = { "@type": "BlogPosting", headline: p.seoTitle || p.title, description: desc, datePublished: p.date, dateModified: p.date, mainEntityOfPage: canon, author: { "@type": "Organization", name: p.author || "Althea Scholar Team" }, publisher: { "@type": "Organization", name: "Althea Scholar", url: SITE } };
        if (safe(p.image)) post.image = p.image;
        applySeo({ title: (p.seoTitle || p.title) + " | Althea Scholar Blog", desc: desc, url: canon, image: safe(p.image),
          ld: { "@context": "https://schema.org", "@graph": [post, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "Blog", item: SITE + "blog.html" }, { "@type": "ListItem", position: 3, name: p.title, item: canon }] }] } });
      }).catch(function () { notFound("This article", "View all articles", "blog.html"); });
    }
    return;
  }
 
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
