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


  var bridgeSvg = (function () {
    // arc: quadratic from (0,220) via (600,-40) to (1200,220); split at the middle into two halves
    // so each half grows from its own shore and they meet at the keystone (600,90)
    function waves(y, cls) {
      var d = "M-100 " + y;
      for (var x = -100; x < 1300; x += 100) d += " Q" + (x + 50) + " " + (y - 8) + " " + (x + 100) + " " + y;
      return '<path class="wave ' + cls + '" d="' + d + '"/>';
    }
    var hangers = "";
    for (var x = 100; x < 1200; x += 100) {
      var t = x / 1200, y = (1 - t) * (1 - t) * 220 + 2 * (1 - t) * t * -40 + t * t * 220;
      var delay = (1.7 + Math.abs(x - 600) / 600 * 0.6).toFixed(2); // from the middle outwards
      hangers += '<line class="hanger" style="animation-delay:' + delay + 's" x1="' + x + '" y1="' + y.toFixed(1) + '" x2="' + x + '" y2="200"/>';
    }
    var L = "M0 220 Q300 90 600 90", R = "M1200 220 Q900 90 600 90";
    return (
      '<svg class="bridge" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">' +
      '<path class="deck" pathLength="1" d="M0 200 L1200 200"/>' +
      hangers +
      '<path class="arc arc-l" pathLength="1" d="' + L + '"/>' +
      '<path class="arc arc-r" pathLength="1" d="' + R + '"/>' +
      '<path class="pulse pulse-l" pathLength="1" d="' + L + '"/>' +
      '<path class="pulse pulse-r" pathLength="1" d="' + R + '"/>' +
      '<g class="waves">' + waves(236, "w1") + waves(250, "w2") + "</g>" +
      "</svg>"
    );
  })();

  // ---------- sections ----------
  function header() {
    var n = C.ui.nav;
    var links = ["about", "pillars", "highlights", "programme", "organizers"];
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

  function hero() {
    var h = C.hero;
    var days = Math.round((d("2027-06-30") - today) / 86400000);
    var countdown = days > 0
      ? '<div class="countdown"><span class="cd-label">' + C.ui.countdown.replace("{n}", '<b class="cd-num">' + days + "</b>") + "</span></div>"
      : "";
    return (
      '<section class="hero" id="top"><div class="wrap hero-in">' +
      '<p class="eyebrow">' + h.eyebrow + "</p>" +
      '<h1 class="hero-title"><span class="ht-de">' + h.brand.replace("Ü", '<span class="uml">U<i class="dot d1"></i><i class="dot d2"></i></span>') + '</span><span class="ht-cn">' + h.brandCn + "</span></h1>" +
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

  function about() {
    var A = C.about;
    return (
      '<section class="section" id="about"><div class="wrap">' +
      sectionHead(A.title) +
      '<div class="about-grid"><div class="prose">' + each(A.paragraphs, function (x) { return "<p>" + x + "</p>"; }) + "</div>" +
      '<blockquote class="quote">' + A.quote + "</blockquote></div>" +
      '<p class="lead-text">' + A.positioning + "</p>" +
      '<div class="format">' + each(A.format, function (x, i) {
        return '<div class="format-step"><span>0' + (i + 1) + "</span>" + x.title + "<small>" + x.text + "</small></div>";
      }) + "</div>" +
      "</div></section>"
    );
  }

  function pillars() {
    var P = C.pillars;
    return (
      '<section class="section alt" id="pillars"><div class="wrap">' + sectionHead(P.title) +
      '<div class="pillars">' +
      each(P.items, function (it) {
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

  function highlights() {
    var H = C.highlights;
    return (
      '<section class="section dark" id="highlights"><div class="wrap">' + sectionHead(H.title, H.intro) +
      '<div class="hl">' +
      each(H.items, function (it, i) {
        return (
          '<article class="hl-card"><span class="hl-idx">' + (i + 1) + "</span>" +
          '<p class="hl-tag">' + it.tag + "</p><h3>" + it.title + '</h3><p class="hl-lead">' + it.lead + "</p>" +
          '<details><summary data-more="' + C.ui.more + '" data-less="' + C.ui.less + '"></summary>' +
          each(it.body, function (x) { return "<p>" + x + "</p>"; }) + "</details>" +
          "</article>"
        );
      }) +
      "</div></div></section>"
    );
  }

  function programme() {
    var T = C.programme.items;
    return (
      '<section class="section" id="programme"><div class="wrap">' + sectionHead(C.programme.title) +
      '<ol class="tl">' +
      each(T, function (it) {
        var cls = "tl-item";
        if (d(it.end) < today) cls += " past";
        if (today >= d(it.start) && today <= d(it.end)) cls += " current";
        if (it.milestone) cls += " milestone";
        return (
          '<li class="' + cls + '"><span class="tl-dot"></span>' +
          '<div class="tl-when">' + it.when + "</div>" +
          '<div class="tl-body"><h3>' + it.title + "</h3><p>" + it.desc + "</p></div></li>"
        );
      }) +
      "</ol></div></section>"
    );
  }

  function vision() {
    var V = C.vision;
    return (
      '<section class="section vision alt"><div class="wrap narrow">' +
      '<p class="eyebrow">' + V.title + "</p>" +
      '<p class="vision-text">' + V.text + "</p>" +
      '<div class="vision-lines">' + each(V.lines, function (x) { return "<p>" + x + "</p>"; }) + "</div>" +
      "</div></section>"
    );
  }

  function organizers() {
    var O = C.organizers;
    return (
      '<section class="section" id="organizers"><div class="wrap">' + sectionHead(O.title) +
      '<div class="orgs">' +
      each(O.groups, function (g) {
        return '<div class="org"><p class="org-label">' + g.label + "</p>" + each(g.names, function (n) { return '<p class="org-name">' + n + "</p>"; }) + "</div>";
      }) +
      "</div></div></section>"
    );
  }

  function footer() {
    return (
      '<footer class="footer"><div class="wrap footer-in">' +
      '<div><p class="logo"><span class="logo-de">DIE BRÜCKEN</span><span class="logo-sep">/</span><span class="logo-cn">桥</span></p>' +
      "<p>" + C.footer.org + '</p><p class="muted">' + C.footer.line + "</p></div>" +
      '<div class="footer-meta"><p><a href="?lang=zh">中文</a> · <a href="?lang=de">Deutsch</a></p></div>' +
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
    header() + "<main>" + hero() + about() + pillars() + highlights() + programme() + vision() + organizers() + "</main>" + footer();

  document.getElementById("nav").addEventListener("click", function (e) {
    if (e.target.tagName === "A") document.body.classList.remove("nav-open");
  });
})();
