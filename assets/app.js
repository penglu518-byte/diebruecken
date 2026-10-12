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
    // arc: quadratic from (0,220) via (600,-40) to (1200,220), split at the keystone (600,90).
    // Each half is revealed by a growing clip rect (SMIL), so the finished arc is a plain solid
    // stroke in every browser; the travelling light is a gradient band sliding along x.
    var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    function anim(attr, values, begin, dur, extra) {
      if (still) return "";
      return '<animate attributeName="' + attr + '" values="' + values + '" begin="' + begin + 's" dur="' + dur + 's"' + (extra || ' fill="freeze" calcMode="spline" keySplines=".45 0 .2 1"') + "/>";
    }
    function grow(id, from, to, begin, dur) { // rect grows from x=from towards x=to
      var x0 = Math.min(from, to), w = Math.abs(to - from);
      var r = '<rect y="-80" height="400" ';
      if (still) return '<clipPath id="' + id + '">' + r + 'x="' + x0 + '" width="' + w + '"/></clipPath>';
      return '<clipPath id="' + id + '">' + r + 'x="' + (from < to ? from : from) + '" width="0">' +
        anim("width", "0;" + w, begin, dur) + (from > to ? anim("x", from + ";" + to, begin, dur) : "") + "</rect></clipPath>";
    }
    function light(id, from, to) {
      var loop = ' repeatCount="indefinite" calcMode="spline" keyTimes="0;.4;1" keySplines=".42 0 .58 1;0 0 1 1"';
      return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + (from - 45) + '" x2="' + (from + 45) + '" y1="0" y2="0">' +
        '<stop offset="0" stop-color="#c23a2b" stop-opacity="0"/><stop offset=".5" stop-color="#e0533f"/><stop offset="1" stop-color="#c23a2b" stop-opacity="0"/>' +
        anim("x1", (from - 45) + ";" + (to - 45) + ";" + (to - 45), 2.6, 6, loop) +
        anim("x2", (from + 45) + ";" + (to + 45) + ";" + (to + 45), 2.6, 6, loop) +
        "</linearGradient>";
    }
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
    var fade = still ? "" : '<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.06;.4;.48;1" begin="2.6s" dur="6s" repeatCount="indefinite"/>';
    return (
      '<svg class="bridge" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true"><defs>' +
      grow("clip-deck", 0, 1200, 0.1, 1.1) +
      grow("clip-l", 0, 602, 0.5, 1.3) +      // 2 units of overlap so the halves always close
      grow("clip-r", 1200, 598, 0.5, 1.3) +
      light("light-l", 0, 600) + light("light-r", 1200, 600) +
      "</defs>" +
      '<path class="deck" clip-path="url(#clip-deck)" d="M0 200 L1200 200"/>' +
      hangers +
      '<path class="arc" clip-path="url(#clip-l)" d="' + L + '"/>' +
      '<path class="arc" clip-path="url(#clip-r)" d="' + R + '"/>' +
      (still ? "" :
        '<path class="pulse" stroke="url(#light-l)" opacity="0" d="' + L + '">' + fade + "</path>" +
        '<path class="pulse" stroke="url(#light-r)" opacity="0" d="' + R + '">' + fade + "</path>") +
      '<g class="waves">' + waves(236, "w1") + waves(250, "w2") + "</g>" +
      "</svg>"
    );
  })();

  // ---------- sections ----------
  function header() {
    var n = C.ui.nav;
    var links = ["about", "highlights", "areas", "programme", "support", "organizers"];
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
      '<blockquote class="quote">' + A.quote.replace(/\n/g, "<br>") + "</blockquote></div>" +
      '<p class="lead-text">' + A.positioning + "</p>" +
      "</div></section>"
    );
  }

  function areas() {
    var P = C.areas;
    return (
      '<section class="section alt" id="areas"><div class="wrap">' + sectionHead(P.title) +
      '<div class="areas-list">' +
      each(P.items, function (it) {
        return (
          '<article class="area-block">' +
          '<div class="pillar-head"><span class="pillar-no">' + it.no + "</span><div><h3>" + it.name + '</h3><p class="pillar-sub">' + it.sub + "</p></div></div>" +
          (it.desc ? '<p class="area-desc">' + it.desc + "</p>" : "") +
          '<ul class="events">' + each(it.items, function (e) {
            return '<li class="event"><div class="event-main"><h4>' + e.title + "</h4><p>" + e.desc + "</p></div>" +
              (e.meta ? '<span class="event-meta">' + e.meta + "</span>" : "") + "</li>";
          }) + "</ul></article>"
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

  function support() {
    var S = C.support;
    return (
      '<section class="section alt" id="support"><div class="wrap">' + sectionHead(S.title, S.intro) +
      '<h3 class="sub-head">' + S.fieldsTitle + "</h3>" +
      '<div class="fields">' + each(S.fields, function (f, i) {
        return '<div class="field"><span class="field-no">' + (i + 1) + "</span><h4>" + f.title + "</h4><p>" + f.desc + "</p></div>";
      }) + "</div>" +
      '<div class="model"><h3 class="sub-head">' + S.modelTitle + "</h3><p>" + S.model + "</p></div>" +
      "</div></section>"
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
    header() + "<main>" + hero() + about() + highlights() + areas() + programme() + support() + vision() + organizers() + "</main>" + footer();

  document.getElementById("nav").addEventListener("click", function (e) {
    if (e.target.tagName === "A") document.body.classList.remove("nav-open");
  });
})();
