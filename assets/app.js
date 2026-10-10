(function () {
  "use strict";

  // ---------- language ----------
  function pickLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "zh" || q === "de") {
      try { localStorage.setItem("lang", q); } catch (e) {}
      return q;
    }
    try {
      var saved = localStorage.getItem("lang");
      if (saved === "zh" || saved === "de") return saved;
    } catch (e) {}
    return /^zh/i.test(navigator.language || "") ? "zh" : "de";
  }

  var lang = pickLang();
  var C = window.CONTENT[lang];
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  // ---------- helpers ----------
  function d(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function each(arr, fn) { return (arr || []).map(fn).join(""); }

  function phaseIndex(items) {
    for (var i = 0; i < items.length; i++) {
      if (today >= d(items[i].start) && today <= d(items[i].end)) return i;
    }
    return -1;
  }
  function nextIndex(items) {
    for (var i = 0; i < items.length; i++) if (today < d(items[i].start)) return i;
    return -1;
  }

  var bridgeSvg =
    '<svg class="bridge" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">' +
    '<path class="arc" d="M0 220 Q600 -40 1200 220"/>' +
    '<path class="deck" d="M0 200 L1200 200"/>' +
    (function () {
      var s = "";
      for (var x = 100; x < 1200; x += 100) {
        var t = x / 1200, y = (1 - t) * (1 - t) * 220 + 2 * (1 - t) * t * -40 + t * t * 220;
        s += '<line class="hanger" x1="' + x + '" y1="' + y.toFixed(1) + '" x2="' + x + '" y2="200"/>';
      }
      return s;
    })() +
    '<path class="wave" d="M0 236 Q50 228 100 236 T200 236 T300 236 T400 236 T500 236 T600 236 T700 236 T800 236 T900 236 T1000 236 T1100 236 T1200 236"/>' +
    '<path class="wave w2" d="M0 250 Q50 242 100 250 T200 250 T300 250 T400 250 T500 250 T600 250 T700 250 T800 250 T900 250 T1000 250 T1100 250 T1200 250"/>' +
    "</svg>";

  // ---------- sections ----------
  function header() {
    var n = C.ui.nav;
    var links = ["status", "about", "pillars", "timeline", "highlights", "organizers", "changelog"];
    return (
      '<header class="topbar"><div class="wrap topbar-in">' +
      '<a class="logo" href="#top"><span class="logo-de">DIE BRÜCKEN</span><span class="logo-sep">/</span><span class="logo-cn">桥</span></a>' +
      '<nav class="nav" id="nav">' + each(links, function (k) { return '<a href="#' + k + '">' + n[k] + "</a>"; }) + "</nav>" +
      '<div class="topbar-right">' +
      '<a class="lang" href="' + C.ui.langSwitchHref + '">' + C.ui.langSwitch + "</a>" +
      '<button class="menu-btn" aria-label="Menu" onclick="document.body.classList.toggle(\'nav-open\')"><span></span><span></span></button>' +
      "</div></div></header>"
    );
  }

  function draftBar() {
    return (
      '<div class="draftbar"><div class="wrap draftbar-in">' +
      '<span class="pill">' + C.doc.stage + " · " + C.doc.version + "</span>" +
      '<span class="draft-note">' + C.doc.notice + "</span>" +
      '<span class="draft-date">' + C.ui.updatedLabel + ": <b>" + C.doc.updated + "</b></span>" +
      "</div></div>"
    );
  }

  function hero() {
    var h = C.hero;
    var open = d("2027-06-30");
    var days = Math.round((open - today) / 86400000);
    var countdown = days > 0
      ? '<div class="countdown"><span class="cd-label">' + C.ui.countdown.replace("{n}", '<b class="cd-num">' + days + "</b>") + "</span></div>"
      : "";
    return (
      '<section class="hero" id="top"><div class="wrap hero-in">' +
      '<p class="eyebrow">' + h.eyebrow + "</p>" +
      '<h1 class="hero-title"><span class="ht-de">' + h.brand + '</span><span class="ht-cn">' + h.brandCn + "</span></h1>" +
      '<p class="hero-sub">' + h.subtitle + "</p>" +
      '<p class="hero-place">' + h.place + "</p>" +
      '<p class="hero-tagline">' + h.tagline + "</p>" +
      countdown +
      "</div>" + bridgeSvg +
      '<div class="keydates"><div class="wrap keydates-in">' +
      each(h.keyDates, function (k) { return '<div class="kd"><span class="kd-date">' + k.date + '</span><span class="kd-label">' + k.label + "</span></div>"; }) +
      "</div></div></section>"
    );
  }

  function status() {
    var s = C.status, t = C.timeline.items;
    var cur = phaseIndex(t), nxt = nextIndex(t);
    var phase =
      '<div class="phase">' +
      '<div class="phase-now"><span class="phase-k">' + C.ui.nowLabel + '</span><span class="phase-v">' +
      (cur >= 0 ? t[cur].title : C.ui.beforeStart) + "</span>" +
      (cur >= 0 ? '<span class="phase-w">' + t[cur].when + "</span>" : "") + "</div>" +
      (nxt >= 0 ? '<div class="phase-next"><span class="phase-k">' + C.ui.nextLabel + '</span><span class="phase-v">' + t[nxt].title + '</span><span class="phase-w">' + t[nxt].when + "</span></div>" : "") +
      "</div>";
    return (
      '<section class="section" id="status"><div class="wrap">' +
      sectionHead(s.title, s.intro) + phase +
      '<ul class="tasks">' +
      each(s.items, function (it) {
        return (
          '<li class="task">' +
          '<span class="state state-' + it.state + '">' + C.ui.stateLabels[it.state] + "</span>" +
          '<div class="task-body"><p class="task-title">' + it.title +
          (it.placeholder ? ' <span class="ph">' + C.ui.placeholder + "</span>" : "") + "</p>" +
          (it.note ? '<p class="task-note">' + it.note + "</p>" : "") + "</div>" +
          '<span class="task-owner"><small>' + C.ui.ownerLabel + "</small>" + it.owner + "</span>" +
          "</li>"
        );
      }) +
      "</ul></div></section>"
    );
  }

  function about() {
    var b = C.background, p = C.positioning;
    return (
      '<section class="section alt" id="about"><div class="wrap">' +
      sectionHead(b.title) +
      '<div class="about-grid"><div class="prose">' + each(b.paragraphs, function (x) { return "<p>" + x + "</p>"; }) + "</div>" +
      '<blockquote class="quote">' + b.quote + "</blockquote></div>" +
      '<h3 class="sub-title">' + p.title + "</h3>" +
      '<dl class="names">' + each(p.names, function (x) { return "<div><dt>" + x.label + "</dt><dd>" + x.value + "</dd></div>"; }) + "</dl>" +
      '<p class="lead-text">' + p.text + "</p>" +
      '<div class="format">' + each(p.format, function (x, i) { return '<div class="format-step"><span>0' + (i + 1) + "</span>" + x + "</div>"; }) + "</div>" +
      '<p class="muted-text">' + p.formatText + "</p>" +
      "</div></section>"
    );
  }

  function pillars() {
    var P = C.pillars;
    return (
      '<section class="section" id="pillars"><div class="wrap">' + sectionHead(P.title) +
      '<div class="pillars">' +
      each(P.items, function (it, i) {
        return (
          '<article class="pillar' + (it.areas ? " pillar-wide" : "") + '">' +
          '<div class="pillar-head"><span class="pillar-no">' + it.no + "</span><div><h3>" + it.name + '</h3><p class="pillar-sub">' + it.sub + "</p></div></div>" +
          "<p>" + it.desc + "</p>" +
          (it.areas ? '<div class="areas">' + each(it.areas, function (a) { return '<div class="area"><h4>' + a.name + "</h4><p>" + a.desc + "</p></div>"; }) + "</div>" : "") +
          "</article>"
        );
      }) +
      "</div></div></section>"
    );
  }

  function timeline() {
    var T = C.timeline.items, cur = phaseIndex(T), nxt = nextIndex(T);
    return (
      '<section class="section alt" id="timeline"><div class="wrap">' + sectionHead(C.timeline.title) +
      '<ol class="tl">' +
      each(T, function (it, i) {
        var cls = "tl-item";
        if (d(it.end) < today) cls += " past";
        if (i === cur) cls += " current";
        if (cur < 0 && i === nxt) cls += " upcoming";
        if (it.milestone) cls += " milestone";
        return (
          '<li class="' + cls + '"><span class="tl-dot"></span>' +
          '<div class="tl-when">' + it.when + "</div>" +
          '<div class="tl-body"><h3>' + it.title +
          (i === cur ? ' <span class="now-tag">' + C.ui.nowLabel + "</span>" : "") +
          (cur < 0 && i === nxt ? ' <span class="now-tag next">' + C.ui.nextLabel + "</span>" : "") +
          "</h3><p>" + it.desc + "</p></div></li>"
        );
      }) +
      "</ol></div></section>"
    );
  }

  function highlights() {
    var H = C.highlights;
    return (
      '<section class="section dark" id="highlights"><div class="wrap">' + sectionHead(H.title, H.intro) +
      '<div class="hl">' +
      each(H.items, function (it, i) {
        return (
          '<article class="hl-card"><span class="hl-idx">' + (i + 1) + "</span>" +
          '<p class="hl-tag">' + it.tag + "</p><h3>" + it.title + '</h3><p class="hl-lead">' + it.lead + "</p>" +
          '<details><summary></summary>' + each(it.body, function (x) { return "<p>" + x + "</p>"; }) + "</details>" +
          "</article>"
        );
      }) +
      "</div></div></section>"
    );
  }

  function vision() {
    var V = C.vision;
    return (
      '<section class="section vision"><div class="wrap narrow">' +
      '<p class="eyebrow">' + V.title + "</p>" +
      '<p class="vision-text">' + V.text + "</p>" +
      '<div class="vision-lines">' + each(V.lines, function (x) { return "<p>" + x + "</p>"; }) + "</div>" +
      "</div></section>"
    );
  }

  function organizers() {
    var O = C.organizers;
    return (
      '<section class="section alt" id="organizers"><div class="wrap">' + sectionHead(O.title) +
      '<div class="orgs">' +
      each(O.groups, function (g) {
        return '<div class="org"><p class="org-label">' + g.label + "</p>" + each(g.names, function (n) { return '<p class="org-name">' + n + "</p>"; }) + "</div>";
      }) +
      "</div></div></section>"
    );
  }

  function changelog() {
    var L = C.changelog;
    return (
      '<section class="section" id="changelog"><div class="wrap">' + sectionHead(L.title, L.intro) +
      '<ul class="log">' + each(L.items, function (x) { return '<li><time>' + x.date + "</time><span>" + x.text + "</span></li>"; }) + "</ul>" +
      "</div></section>"
    );
  }

  function footer() {
    return (
      '<footer class="footer"><div class="wrap footer-in">' +
      '<div><p class="logo"><span class="logo-de">DIE BRÜCKEN</span><span class="logo-sep">/</span><span class="logo-cn">桥</span></p>' +
      "<p>" + C.footer.org + "</p><p class=\"muted\">" + C.footer.contact + "</p></div>" +
      '<div class="footer-meta"><p>' + C.ui.versionLabel + ": " + C.doc.stage + " " + C.doc.version + "</p><p>" + C.ui.updatedLabel + ": " + C.doc.updated + "</p>" +
      '<p><a href="?lang=zh">中文</a> · <a href="?lang=de">Deutsch</a></p></div>' +
      "</div></footer>"
    );
  }

  function sectionHead(title, intro) {
    return '<div class="sec-head"><h2>' + title + "</h2>" + (intro ? '<p class="sec-intro">' + intro + "</p>" : "") + "</div>";
  }

  // ---------- render ----------
  document.documentElement.lang = C.meta.htmlLang;
  document.documentElement.dataset.lang = lang;
  document.title = C.meta.title;
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute("content", C.meta.description);

  document.getElementById("app").innerHTML =
    header() + draftBar() + "<main>" + hero() + status() + about() + pillars() + timeline() + highlights() + vision() + organizers() + changelog() + "</main>" + footer();

  document.getElementById("nav").addEventListener("click", function (e) {
    if (e.target.tagName === "A") document.body.classList.remove("nav-open");
  });
})();
