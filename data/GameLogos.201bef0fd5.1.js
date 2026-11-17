
/* 🏷️ GameLogos (gl-1) — ONE shared kit for every code-drawn logo. Owner: 🏷️ logo chat.
   GameLogos.pic(id, kind, look, px) → cached canvas (px = CSS width) · .url(…) → data URL
   GameLogos.draw(g, id, kind, x, y, px, look) (x, y = top-left) · .has(id) · .kinds(id) · .box(id, kind) → [w, h]
   GameLogos.looks(id) · .alias(gameId, blockId) (GameIDs like 'snakeast' / 'number-grid' / 'math-quest' / 'soul-bopper' already work) · .ok(id) → true only for logos Aowu has APPROVED (covers / cards show nothing else) · .ready(fn) (fires once the web fonts are in; the cache is cleared then) · .clear() · .add(id, def) (one block per game)
   A logo is painted only when asked for, then cached. Unknown id / kind → null (the page keeps its emoji title).
   ON DEMAND (gl-r9): GameLogos.need(id, fn) → fn(true) once that logo's block is in and the fonts are ready (fn(false) if it can't come).
   Today every block is inside this one file, so need() answers at once. After the split (core + one file per logo) the page hands the
   core a map with GameLogos.sources({id: {src, integrity}}) and need() loads just that logo's file. Pages should call need() before pic()/draw(). */
var GameLogos = (function () {
  'use strict';
  var REG = {}, CACHE = {};
  // the app's GameIDs → block ids (ask with either; a new block may also call GameLogos.alias)
  var ALIAS = { 'snakeast': 'snakize', 'number-grid': 'numbergrid', 'math-quest': 'mathquest', 'soul-bopper': 'soulbopper', 'steam-playground': 'app',
    'word-board': 'lettercraft', 'number-board': 'algebros', 'sla-brall': 'slabrall' };   // gl-r22 (📡 st-2c): the 3 logos moved in from their game pages
  function rid(id) { return REG[id] ? id : (ALIAS[id] || id); }
  function alias(a, id) { ALIAS[a] = id; }
  // ✅ APPROVED by Aowu — the ONLY list that says a logo may be shown on covers / cards (GameLogos.ok). Add an id here when Aowu approves it.
  var OK = { app: 1, snakize: 1, numbergrid: 1, memory: 1, wisdeck: 1, pokadif: 1,   // ✅ 2026-11-16
    polyplot: 1, soulbopper: 1, mathquest: 1, 'eyes-brain': 1, 'brawl-buddies': 1, sciencetory: 1, 'sweet-swap': 1, 'pop-blocks': 1, 'double-up': 1, alignext: 1, 'robot-adventure': 1, geoscout: 1,   // ✅ 2026-11-17 10:15 (gl-r12)
    georead: 1, 'pose-party': 1, chess: 1,   // ✅ 2026-11-17 14:19 (gl-r14)
    checkers: 1, maze: 1, 'block-drop': 1, turbo: 1, hopper: 1, pinball: 1,   // ✅ 2026-11-17 15:29 (gl-r17)
    avateer: 1, avatarealm: 1,   // ✅ 2026-11-17 16:26 (gl-r20, Aowu "ok add some sky mystic feeling")
    beatcorner: 1, artifactory: 1,   // ✅ 2026-11-17 16:57 (gl-r21, Aowu "ok" on round 11 draft 1)
    lettercraft: 1, algebros: 1, slabrall: 1 };   // ✅ approved in their own games (lc-logo · al-1 · lg-1), moved into the kit 2026-11-17 17:1x (gl-r22, Aowu "add the 3 Station shelf logos")
  function ok(id) { id = rid(id); return !!(REG[id] && OK[id]); }
  function approve(id, yes) { OK[rid(id)] = yes === false ? 0 : 1; }
  // fonts: nothing is kept that was painted with a fallback font — the cache is dropped once the web fonts are in, then ready(fn) callbacks fire
  var FONTS_IN = false, WAIT = [];
  function ready(fn) { if (FONTS_IN) { try { fn(); } catch (e) {} } else WAIT.push(fn); }
  function fontsIn() { if (FONTS_IN) return; FONTS_IN = true; clear(); WAIT.splice(0).forEach(function (fn) { try { fn(); } catch (e) {} }); }
  try { if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { if (document.fonts.load) document.fonts.load("700 20px 'Fredoka'").then(fontsIn, fontsIn); else fontsIn(); }, fontsIn); setTimeout(fontsIn, 4000); } else if (typeof setTimeout !== 'undefined') setTimeout(fontsIn, 0); } catch (e) { FONTS_IN = true; }
  var FONT = "'Fredoka', 'Nunito', system-ui, sans-serif";
  function add(id, def) { REG[id] = def; clear(); var q = NEED[id]; if (q) { delete NEED[id]; ready(function () { q.forEach(function (fn) { try { fn(true); } catch (e) {} }); }); } }
  // on-demand loading: SRC = {blockId: {src, integrity}} from the page; NEED = callbacks waiting for a block
  var SRC = {}, NEED = {};
  function sources(map) { for (var k in map) SRC[rid(k)] = map[k]; }
  function need(id, fn) {
    fn = fn || function () {}; id = rid(id);
    if (REG[id]) { ready(function () { fn(true); }); return true; }
    var s = SRC[id]; if (!s || typeof document === 'undefined') { try { fn(false); } catch (e) {} return false; }
    if (NEED[id]) { NEED[id].push(fn); return false; }
    NEED[id] = [fn];
    function load(url, last) {   // the site first, then its CDN copy (s.alt) — same pair the app's other site files use
      var el = document.createElement('script'); el.src = url; el.async = true; el.charset = 'utf-8'; if (s.integrity) { el.integrity = s.integrity; el.crossOrigin = 'anonymous'; }
      el.onerror = function () { if (!last && s.alt) return load(s.alt, true); var q = NEED[id] || []; delete NEED[id]; q.forEach(function (f) { try { f(false); } catch (e) {} }); };
      (document.head || document.documentElement).appendChild(el);
    }
    load(s.src || s, !s.alt); return false;
  }
  function has(id) { return !!REG[rid(id)]; }
  function kinds(id) { id = rid(id); return REG[id] ? Object.keys(REG[id].BOX) : []; }
  function looks(id) { id = rid(id); return REG[id] ? Object.keys(REG[id].LOOK) : []; }
  function box(id, kind) { var d = REG[rid(id)]; return d && d.BOX[kind] ? d.BOX[kind].slice() : null; }
  function clear() { CACHE = {}; }
  function lookOf(d, look) { return d.LOOK[look] ? look : 'classic'; }
  function pic(id, kind, look, px, dpr) {
    id = rid(id); var d = REG[id]; if (!d || !d.BOX[kind]) return null;
    look = lookOf(d, look); px = Math.max(16, Math.round(px || d.BOX[kind][0]));
    dpr = dpr || Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    var key = [id, kind, look, px, dpr].join('|'); if (CACHE[key]) return CACHE[key];
    var b = d.BOX[kind], k = px * dpr / b[0];
    var c = document.createElement('canvas'); c.width = Math.round(b[0] * k); c.height = Math.round(b[1] * k);
    var g = c.getContext('2d');
    // shadows are measured in device pixels, not in the drawing's units — scale them, or glows swallow small logos
    try { ['shadowBlur', 'shadowOffsetX', 'shadowOffsetY'].forEach(function (pr) { var ds = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, pr); Object.defineProperty(g, pr, { get: function () { return ds.get.call(g) / k; }, set: function (v) { ds.set.call(g, v * k); } }); }); } catch (e) {}
    try { g.scale(k, k); d.paint(g, kind, d.LOOK[look], px, T); } catch (e) { return null; }
    c.style.width = px + 'px'; c.style.height = Math.round(px * b[1] / b[0]) + 'px';
    return (CACHE[key] = c);
  }
  function url(id, kind, look, px, dpr) { var c = pic(id, kind, look, px, dpr); return c ? c.toDataURL('image/png') : ''; }
  function draw(g, id, kind, x, y, px, look) {
    var c = pic(id, kind, look, px); if (!c) return false;
    var b = REG[rid(id)].BOX[kind]; g.drawImage(c, x, y, px, px * b[1] / b[0]); return true;
  }

  /* ---------- shared painter tools (every logo block uses these) ---------- */
  var T = {
    FONT: FONT,
    shade: function (hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; function c(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); } return 'rgb(' + c(r) + ',' + c(gg) + ',' + c(b) + ')'; },   // f < 0 darker, f > 0 lighter
    rng: function (seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
    lin: function (g, x0, y0, x1, y1, stops) { var gr = g.createLinearGradient(x0, y0, x1, y1); for (var i = 0; i < stops.length; i += 2) gr.addColorStop(stops[i], stops[i + 1]); return gr; },
    rad: function (g, x, y, r0, r1, stops) { var gr = g.createRadialGradient(x, y, r0, x, y, r1); for (var i = 0; i < stops.length; i += 2) gr.addColorStop(stops[i], stops[i + 1]); return gr; },
    rr: function (g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); },
    star: function (g, x, y, R, r, n, rot) { n = n || 5; rot = rot == null ? -Math.PI / 2 : rot; g.beginPath(); for (var i = 0; i < n * 2; i++) { var a = rot + i * Math.PI / n, q = i % 2 ? r : R; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); },
    /* four-point sparkle */
    spark: function (g, x, y, R, col, a) { g.save(); g.globalAlpha = a == null ? 1 : a; g.fillStyle = col || '#fff'; g.beginPath(); for (var i = 0; i < 8; i++) { var an = i * Math.PI / 4, q = i % 2 ? R * 0.22 : R; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * q, y + Math.sin(an) * q); } g.closePath(); g.fill(); g.restore(); },
    gear: function (g, x, y, R, teeth, rot, fill, edge, hole) {
      var r1 = R * 0.78, n = teeth; g.save(); g.translate(x, y); g.rotate(rot || 0); g.beginPath();
      for (var i = 0; i < n; i++) { var a = i * 2 * Math.PI / n, w = Math.PI / n; g.lineTo(Math.cos(a - w * 0.55) * r1, Math.sin(a - w * 0.55) * r1); g.lineTo(Math.cos(a - w * 0.32) * R, Math.sin(a - w * 0.32) * R); g.lineTo(Math.cos(a + w * 0.32) * R, Math.sin(a + w * 0.32) * R); g.lineTo(Math.cos(a + w * 0.55) * r1, Math.sin(a + w * 0.55) * r1); }
      g.closePath(); g.moveTo(R * 0.36, 0); g.arc(0, 0, R * 0.36, 0, Math.PI * 2, true);
      g.fillStyle = fill; g.fill('evenodd'); g.lineWidth = Math.max(1.5, R * 0.07); g.strokeStyle = edge; g.lineJoin = 'round'; g.stroke();
      g.beginPath(); g.arc(0, 0, R * 0.60, 0, Math.PI * 2); g.lineWidth = Math.max(1, R * 0.06); g.strokeStyle = hole || 'rgba(255,255,255,.35)'; g.stroke(); g.restore();
    },
    /* chunky wordmark: depth → dark outline → ring → face gradient → bevel → gloss. Returns the width. */
    /* gl-r19 (Aowu 2026-11-17 "hand-drawn B"): Fredoka's B leaves its middle bar short of the stem (a notch joins the two holes). With o.clean the kit
       fills that gap with a small block in the letter's own em units, so the B has two closed holes. Opt-in per logo (🧱 Block Drop · 🎯 Pinball). */
    CLEAN: { B: [0.19, -0.425, 0.335, -0.281] },
    word: function (g, str, cx, base, size, o) {
      var CL = o.clean && (o.weight || 700) === 700 ? T.CLEAN : null, noCL = false;
      if (CL) { var st0 = g.strokeText, ft0 = g.fillText; g.strokeText = function (ch, x, y) { st0.call(g, ch, x, y); var r = !noCL && CL[ch]; if (r) { g.beginPath(); g.rect(x + r[0] * size, y + r[1] * size, (r[2] - r[0]) * size, (r[3] - r[1]) * size); g.stroke(); } };
        g.fillText = function (ch, x, y) { ft0.call(g, ch, x, y); var r = CL[ch]; if (r) g.fillRect(x + r[0] * size, y + r[1] * size, (r[2] - r[0]) * size, (r[3] - r[1]) * size); }; }
      try { return T._word(g, str, cx, base, size, o, function (v) { noCL = v; }); } finally { if (CL) { delete g.strokeText; delete g.fillText; } }
    },
    _word: function (g, str, cx, base, size, o, inner) {
      g.save(); g.font = (o.weight || 700) + ' ' + size + 'px ' + FONT; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineCap = 'round';
      var sp = o.spacing || 0, ws = [], W = 0, i;
      for (i = 0; i < str.length; i++) { var w = g.measureText(str[i]).width; ws.push(w); W += w + (i < str.length - 1 ? sp : 0); }
      var sx = o.fit ? Math.min(o.maxSquash || 1.6, o.fit / W) : 1; if (o.fit) W = W * sx;
      g.translate(cx, base); if (o.rot) g.rotate(o.rot); if (o.skew) g.transform(1, 0, o.skew, 1, 0, 0); g.scale(sx, 1); var x0 = -W / sx / 2;
      function each(fn) { var x = x0; for (var j = 0; j < str.length; j++) { var dy = o.wave ? o.wave(j, str.length) : 0; fn(str[j], x, dy, j); x += ws[j] + sp; } }
      var ow = o.outline == null ? size * 0.2 : o.outline, d = o.depth == null ? size * 0.09 : o.depth;
      if (o.glow) { g.save(); g.strokeStyle = o.glow; g.lineWidth = ow; for (var gi = 0; gi < (o.glowN || 1); gi++) { g.shadowColor = o.glow; g.shadowBlur = size * (o.glowBlur || 0.35) * (gi ? 0.45 : 1); each(function (ch, x, dy) { g.strokeText(ch, x, dy + d); }); } g.restore(); }   // glowN > 1 = a neon halo: wide soft pass + tight bright pass
      g.strokeStyle = o.dark; g.fillStyle = o.dark; g.lineWidth = ow;
      for (var s = d; s >= 0; s -= Math.max(1, d / 6)) each(function (ch, x, dy) { g.strokeText(ch, x, dy + s); });
      if (o.side) { g.strokeStyle = o.side; g.lineWidth = ow * 0.52; for (s = d; s > 0; s -= Math.max(1, d / 6)) each(function (ch, x, dy) { g.strokeText(ch, x, dy + s); }); }
      if (o.ring && !o.noRing) { g.strokeStyle = o.ring; g.lineWidth = ow * 0.5; each(function (ch, x, dy) { g.strokeText(ch, x, dy); }); }
      if (o.edge) { g.lineWidth = o.edgeW || size * 0.1; each(function (ch, x, dy, j) { g.strokeStyle = o.edge(j, str.length); g.strokeText(ch, x, dy); }); }   // gl-r10: each letter's own darker tone round its face (edge(j) → colour)
      each(function (ch, x, dy, j) {
        var f = o.face(j, str.length); g.fillStyle = T.lin(g, 0, dy - size * 0.74, 0, dy + size * 0.04, f);
        if (o.fat) { g.strokeStyle = g.fillStyle; g.lineWidth = o.fat; g.strokeText(ch, x, dy); }   // fatter bubble letters
        g.fillText(ch, x, dy);
      });
      if (o.inner) { inner(true); g.save(); g.strokeStyle = o.inner; g.lineWidth = Math.max(1, size * 0.025); each(function (ch, x, dy) { g.strokeText(ch, x, dy); }); g.restore(); inner(false); }
      g.restore(); return W;
    },
    /* gloss band clipped to an already-drawn word: call with the same args */
    gloss: function (g, str, cx, base, size, o, alpha) {
      var c = document.createElement('canvas'); c.width = Math.ceil(size * str.length * 1.2 + 80); c.height = Math.ceil(size * 1.6);
      var h = c.getContext('2d'); h.font = (o.weight || 700) + ' ' + size + 'px ' + FONT; h.textBaseline = 'alphabetic'; h.lineJoin = 'round';
      var sp = o.spacing || 0, W = 0, ws = [], i; for (i = 0; i < str.length; i++) { var w = h.measureText(str[i]).width; ws.push(w); W += w + (i < str.length - 1 ? sp : 0); }
      var sx = o.fit ? Math.min(o.maxSquash || 1.6, o.fit / W) : 1, x = 40, by = size * 1.15;
      h.fillStyle = '#fff'; var CL = o.clean && (o.weight || 700) === 700 ? T.CLEAN : {}; for (i = 0; i < str.length; i++) { var dy = o.wave ? o.wave(i, str.length) : 0, r = CL[str[i]]; h.fillText(str[i], x, by + dy); if (r) h.fillRect(x + r[0] * size, by + dy + r[1] * size, (r[2] - r[0]) * size, (r[3] - r[1]) * size); x += ws[i] + sp; }
      h.globalCompositeOperation = 'source-in';
      var gr = h.createLinearGradient(0, by - size * 0.74, 0, by); gr.addColorStop(0, 'rgba(255,255,255,' + (alpha || 0.75) + ')'); gr.addColorStop(0.42, 'rgba(255,255,255,' + (alpha || 0.75) * 0.25 + ')'); gr.addColorStop(0.5, 'rgba(255,255,255,0)');
      h.fillStyle = gr; h.fillRect(0, 0, c.width, c.height);
      g.save(); g.translate(cx, base); if (o.rot) g.rotate(o.rot); g.scale(sx, 1); g.drawImage(c, -W / 2 - 40, -by); g.restore();
    }
  };

  /* ONE-PIECE characters (gl-r11, moved from brawl-buddies so every block can use them): every part goes into ONE silhouette with ONE dark rim,
     no inner outlines; depth from colour (far parts darker, near parts drop a soft shadow). T.onePiece(g, T, {x0, y0, W, H, rim, rimW, parts, order, tf, glow, colour(B, put, inside)}) ·
     T.limb(h, [x0,y0, cx,cy, x1,y1], w0, w1, bulge) · T.taper(h, quadPts, w(t)) · T.around(h, x, y, angle) · T.lg / T.rg gradients on any context */
  (function () {
    var TAU = Math.PI * 2;
    function onePiece(g, T, o) {
    var m = g.getTransform(), sc = Math.max(0.15, Math.hypot(m.a, m.b)), W = o.W, H = o.H, TF = o.tf || {};
      function cv() { var c = document.createElement('canvas'); c.width = Math.max(2, Math.ceil(W * sc)); c.height = Math.max(2, Math.ceil(H * sc)); var h = c.getContext('2d'); h.scale(sc, sc); h.translate(-o.x0, -o.y0); h.lineCap = 'round'; h.lineJoin = 'round'; return h; }
      function put(h, name, col, dx, dy) { h.save(); if (TF[name]) TF[name](h); if (dx || dy) h.translate(dx, dy); h.fillStyle = col; h.strokeStyle = col; o.parts[name](h); h.restore(); }
      function inside(h, name, painter) { var t = cv(), k = cv(); t.save(); if (TF[name]) TF[name](t); painter(t); t.restore(); put(k, name, '#fff'); t.setTransform(1, 0, 0, 1, 0, 0); t.globalCompositeOperation = 'destination-in'; t.drawImage(k.canvas, 0, 0); h.save(); h.setTransform(1, 0, 0, 1, 0, 0); h.drawImage(t.canvas, 0, 0); h.restore(); }   // paint only inside one part
    var M = cv(); o.order.forEach(function (n) { put(M, n, '#fff'); });
    var Rm = cv(); Rm.setTransform(1, 0, 0, 1, 0, 0); var rw = (o.rimW || 4.4) * sc; for (var a = 0; a < 16; a++) Rm.drawImage(M.canvas, Math.cos(a * TAU / 16) * rw, Math.sin(a * TAU / 16) * rw); Rm.globalCompositeOperation = 'source-in'; Rm.fillStyle = o.rim; Rm.fillRect(0, 0, Rm.canvas.width, Rm.canvas.height);
    var B = cv(); o.colour(B, put, inside);
    B.setTransform(1, 0, 0, 1, 0, 0); B.globalCompositeOperation = 'destination-in'; B.drawImage(M.canvas, 0, 0);
    if (o.glow) { g.save(); g.shadowColor = o.glow; g.shadowBlur = o.glowBlur || 26; g.drawImage(Rm.canvas, o.x0, o.y0, W, H); g.restore(); }
    g.drawImage(Rm.canvas, o.x0, o.y0, W, H); g.drawImage(B.canvas, o.x0, o.y0, W, H);
  }
    function lg(h, x0, y0, x1, y1, st) { var q = h.createLinearGradient(x0, y0, x1, y1); for (var i = 0; i < st.length; i += 2) q.addColorStop(st[i], st[i + 1]); return q; }
    function rg(h, x, y, r0, r1, st) { var q = h.createRadialGradient(x, y, r0, x, y, r1); for (var i = 0; i < st.length; i += 2) q.addColorStop(st[i], st[i + 1]); return q; }
  // a tapered, bendy shape along a quadratic centre line (limbs, tails, ribbons): width w(t) for t 0 → 1, round ends
    function taper(h, p, w, n) { n = n || 20; var L1 = [], R1 = []; for (var i = 0; i <= n; i++) { var t = i / n, u = 1 - t, x = u * u * p[0] + 2 * u * t * p[2] + t * t * p[4], y = u * u * p[1] + 2 * u * t * p[3] + t * t * p[5], dx = 2 * u * (p[2] - p[0]) + 2 * t * (p[4] - p[2]), dy = 2 * u * (p[3] - p[1]) + 2 * t * (p[5] - p[3]), d = Math.hypot(dx, dy) || 1, ww = w(t) / 2; L1.push([x - dy / d * ww, y + dx / d * ww]); R1.push([x + dy / d * ww, y - dx / d * ww]); }
    h.beginPath(); L1.forEach(function (q, i) { h[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); for (var j = R1.length - 1; j >= 0; j--) h.lineTo(R1[j][0], R1[j][1]); h.closePath(); h.fill(); h.beginPath(); h.arc(p[0], p[1], w(0) / 2, 0, TAU); h.arc(p[4], p[5], w(1) / 2, 0, TAU); h.fill(); }
    function limb(h, p, w0, w1, bulge) { taper(h, p, function (t) { return w0 + (w1 - w0) * t + Math.sin(t * Math.PI) * (bulge || 0); }); }
    function around(h, x, y, a) { h.translate(x, y); h.rotate(a); h.translate(-x, -y); }
    T.onePiece = onePiece; T.limb = limb; T.taper = taper; T.around = around; T.lg = lg; T.rg = rg;
  })();
  /* 🌌 MYSTIC SKY (gl-r20, Aowu 2026-11-17 "add some sky mystic feeling") — T.mystic(g, x, y, w, h, o) paints into the box (clip it yourself):
     o.base = top→bottom colour stops (else nothing under) · o.nebula = [[x, y, r, colour, alpha]] soft clouds of colour · o.aurora = [{y, amp, h, cols: [low, high], a, f, ph}]
     curtains of light (bright lower edge, rays fading up) · o.rays = {x, y, n, len, col, a, spread, rot} light shafts from one point · o.moon = {x, y, r}
     · o.stars = count (twinkles; ~1 in 6 gets a 4-point glint) · o.motes = count (glowing dust) · o.seed. Everything bright is drawn 'lighter'. */
  (function () {
    function mystic(g, x, y, w, h, o) {
      var r = T.rng(o.seed || 3), TAU = Math.PI * 2; g.save();
      if (o.base) { g.fillStyle = T.lin(g, 0, y, 0, y + h, o.base); g.fillRect(x, y, w, h); }
      g.globalCompositeOperation = 'lighter';
      (o.nebula || []).forEach(function (q) { g.globalAlpha = q[4] == null ? 0.5 : q[4]; g.fillStyle = T.rad(g, q[0], q[1], 2, q[2], [0, q[3], 0.55, q[3].replace(/[\d.]+\)$/, function (m) { return (parseFloat(m) * 0.35).toFixed(3) + ')'; }), 1, 'rgba(0,0,0,0)']); g.beginPath(); g.ellipse(q[0], q[1], q[2], q[2] * 0.62, 0, 0, TAU); g.fill(); });
      g.globalAlpha = 1;
      (o.aurora || []).forEach(function (A, k) {
        var f = A.f || 1.3, ph = A.ph == null ? k * 1.7 : A.ph, step = A.step || 5, a = A.a == null ? 0.5 : A.a, x0 = A.x0 == null ? x : A.x0, x1 = A.x1 == null ? x + w : A.x1;
        function yc(t) { return A.y + A.amp * Math.sin(t * TAU * f + ph) + A.amp * 0.35 * Math.sin(t * TAU * f * 2.6 + ph * 1.9); }
        for (var px = x0; px <= x1; px += step) {
          var t = (px - x0) / (x1 - x0), yb = yc(t), hh = A.h * (0.55 + 0.45 * Math.abs(Math.sin(t * TAU * f * 3.1 + ph))), edge = Math.min(1, Math.min(t, 1 - t) * 6);
          g.globalAlpha = a * edge; g.fillStyle = T.lin(g, 0, yb + 4, 0, yb - hh, [0, A.cols[0], 0.18, A.cols[0], 0.5, A.cols[1], 1, 'rgba(0,0,0,0)']); g.fillRect(px, yb - hh, step + 0.6, hh + 6);
        }
        g.globalAlpha = a * 0.9; g.lineWidth = A.line || 3; g.strokeStyle = A.cols[0]; g.shadowColor = A.cols[0]; g.shadowBlur = 10; g.beginPath();
        for (var i = 0; i <= 60; i++) { var tt = i / 60; g[i ? 'lineTo' : 'moveTo'](x0 + (x1 - x0) * tt, yc(tt) + 3); } g.stroke(); g.shadowBlur = 0;
      });
      g.globalAlpha = 1;
      if (o.rays) { var R = o.rays; for (var j = 0; j < (R.n || 9); j++) { var an = (R.rot || Math.PI / 2) + (j / ((R.n || 9) - 1) - 0.5) * (R.spread || 1.6) + (r() - 0.5) * 0.08, wd = 0.02 + r() * 0.04, L = R.len * (0.6 + r() * 0.4);
        g.globalAlpha = (R.a || 0.25) * (0.5 + r() * 0.5); g.fillStyle = T.rad(g, R.x, R.y, 4, L, [0, R.col || 'rgba(255,240,200,.9)', 1, 'rgba(0,0,0,0)']); g.beginPath(); g.moveTo(R.x, R.y); g.arc(R.x, R.y, L, an - wd, an + wd); g.closePath(); g.fill(); } g.globalAlpha = 1; }
      if (o.moon) { var M = o.moon; g.fillStyle = T.rad(g, M.x, M.y, M.r * 0.6, M.r * 4, [0, 'rgba(220,240,255,.5)', 1, 'rgba(0,0,0,0)']); g.fillRect(M.x - M.r * 4, M.y - M.r * 4, M.r * 8, M.r * 8);
        g.globalCompositeOperation = 'source-over'; g.fillStyle = T.rad(g, M.x - M.r * 0.3, M.y - M.r * 0.3, 1, M.r, [0, '#ffffff', 0.7, '#e8f2ff', 1, '#b8cce8']); g.beginPath(); g.arc(M.x, M.y, M.r, 0, TAU); g.fill();
        g.fillStyle = 'rgba(150,170,210,.35)'; [[0.3, -0.2, 0.2], [-0.35, 0.3, 0.14], [0.1, 0.45, 0.1]].forEach(function (c) { g.beginPath(); g.arc(M.x + c[0] * M.r, M.y + c[1] * M.r, c[2] * M.r, 0, TAU); g.fill(); }); g.globalCompositeOperation = 'lighter'; }
      for (var si = 0; si < (o.stars || 0); si++) { var sx = x + r() * w, sy = y + r() * h, sr = 0.5 + r() * 1.7, col = ['#ffffff', '#cfe8ff', '#ffe6b0', '#e8d0ff'][si % 4];
        g.globalAlpha = 0.45 + r() * 0.55; g.fillStyle = col; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill();
        if (si % 6 === 0) { g.strokeStyle = col; g.lineWidth = 0.8; g.globalAlpha *= 0.8; g.beginPath(); g.moveTo(sx - sr * 4, sy); g.lineTo(sx + sr * 4, sy); g.moveTo(sx, sy - sr * 4); g.lineTo(sx, sy + sr * 4); g.stroke(); } }
      for (var mi = 0; mi < (o.motes || 0); mi++) { var mx = x + r() * w, my = y + r() * h, mr = 1.5 + r() * 3.5, mc = ['rgba(150,255,240,', 'rgba(255,220,140,', 'rgba(220,170,255,'][mi % 3];
        g.globalAlpha = 0.5 + r() * 0.5; g.fillStyle = T.rad(g, mx, my, 0, mr * 2.4, [0, mc + '1)', 0.35, mc + '.5)', 1, mc + '0)']); g.fillRect(mx - mr * 2.4, my - mr * 2.4, mr * 4.8, mr * 4.8); }
      g.restore();
    }
    T.mystic = mystic;
  })();
  /* ✒️ CARVED SERIF letters (gl-r19, Aowu 2026-11-17: 🧳 Avateer + 🌍 AvataRealm want the pictures' carved fantasy serif, not Fredoka) — drawn as
     shapes, so no web font. Every stroke is cut down its middle into two facets lit from the top-left (a chisel V-cut) with a bright ridge.
     T.serif(g, str, cx, base, size, o) → width. size = cap height. o: condense (x × c, stroke weight kept) · dark · outline · depth · ring · ringW · glow · glowBlur · glowN · face(j, n) → stops
     (hex colours) · spacing (em) · scale(j) (one letter bigger, e.g. the R) · wave(j, n) → dy · rot · ridge (colour) · light (0..1, facet strength).
     Letters: A V T R E L M F I C O Y (capitals) · a v t e r i c o y (lower case, x-height 0.7). T.serif.width(str, size, o) measures without drawing.
     Add a letter = one entry in GL (em units: cap line y = -1, baseline y = 0), built from seg / crv / arc / foot / head / dot. */
  (function () {
    var LV = [-0.5, -0.866];
    function nz(x, y) { var l = Math.hypot(x, y) || 1; return [x / l, y / l]; }
    function strokeOf(C, W, flat, cx) { if (cx && cx !== 1) C = C.map(function (q) { return [q[0] * cx, q[1]]; });   // flat 'h' = ends cut level (upright strokes), 'v' = cut plumb (bars), null = square to the stroke (curves)
      var L = [], R = [], N = [];
      for (var i = 0; i < C.length; i++) {
        var a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)], d = nz(b[0] - a[0], b[1] - a[1]), n = [-d[1], d[0]], h = W[i] / 2, ox = n[0] * h, oy = n[1] * h;
        if (flat === 'h' && Math.abs(d[1]) > 0.25) { ox = Math.max(-3 * h, Math.min(3 * h, (n[0] < 0 ? -1 : 1) * h / Math.abs(d[1]))); oy = 0; }
        if (flat === 'v' && Math.abs(d[0]) > 0.25) { oy = Math.max(-3 * h, Math.min(3 * h, (n[1] < 0 ? -1 : 1) * h / Math.abs(d[0]))); ox = 0; }
        L.push([C[i][0] + ox, C[i][1] + oy]); R.push([C[i][0] - ox, C[i][1] - oy]); N.push(n);
      }
      var poly = L.concat(R.slice().reverse()), W0 = 0; W.forEach(function (w) { W0 += w / W.length; });
      return { poly: poly, C: C, w: W0, facets: [{ p: L.concat(C.slice().reverse()), side: L, n: N, s: 1 }, { p: C.concat(R.slice().reverse()), side: R, n: N, s: -1 }] };
    }
    function kit(cx) {   // cx = condense: x positions × cx, stroke widths kept (narrower letters, same weight)
      var P = [];
      var K = {
        P: P,
        seg: function (x0, y0, x1, y1, w0, w1) { var up = Math.abs(y1 - y0) >= Math.abs(x1 - x0); P.push(strokeOf([[x0, y0], [x1, y1]], [w0, w1 == null ? w0 : w1], up ? 'h' : 'v', cx)); return K; },
        crv: function (f, wf, n) { n = n || 26; var C = [], W = []; for (var i = 0; i <= n; i++) { var t = i / n; C.push(f(t)); W.push(wf(t)); } P.push(strokeOf(C, W, null, cx)); return K; },
        // elliptic arc, angles in degrees (0 = right, 90 = down), thick where the stroke runs upright (stress), thin where it runs flat
        arc: function (cx, cy, rx, ry, a0, a1, thick, thin, n) { return K.crv(function (t) { var a = (a0 + (a1 - a0) * t) * Math.PI / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; }, function (t) { var a = (a0 + (a1 - a0) * t) * Math.PI / 180; return thin + (thick - thin) * Math.pow(Math.abs(Math.cos(a)), 1.4); }, n || 30); },
        quad: function (x0, y0, x1, y1, x2, y2, w0, w2) { return K.crv(function (t) { var u = 1 - t; return [u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2]; }, function (t) { return w0 + (w2 - w0) * t; }, 18); },
        // bracketed serifs: a tapered slab + two little wedges into the stem. foot sits on y (baseline), head hangs from y (cap / x line)
        foot: function (x, y, hw, t) { t = t || 0.068; P.push(strokeOf([[x - hw, y - t / 2], [x, y - t / 2], [x + hw, y - t / 2]], [t * 0.45, t, t * 0.45], 'v', cx)); P.push(strokeOf([[x - hw * 0.62, y - t], [x, y - t - 0.03], [x + hw * 0.62, y - t]], [0.012, 0.06, 0.012], 'v', cx)); return K; },
        head: function (x, y, hw, t) { t = t || 0.068; P.push(strokeOf([[x - hw, y + t / 2], [x, y + t / 2], [x + hw, y + t / 2]], [t * 0.45, t, t * 0.45], 'v', cx)); P.push(strokeOf([[x - hw * 0.62, y + t], [x, y + t + 0.03], [x + hw * 0.62, y + t]], [0.012, 0.06, 0.012], 'v', cx)); return K; },
        dot: function (x, y, r) { var C = [], W = [], i; for (i = 0; i <= 24; i++) { var a = i / 24 * Math.PI * 2; C.push([x + Math.cos(a) * r / 2 / cx, y + Math.sin(a) * r / 2]); W.push(r); } var s = strokeOf(C, W, null, cx); s.dot = [x * cx, y, r]; P.push(s); return K; }
      };
      return K;
    }
    var T1 = 0.205, t1 = 0.088, X = 0.7, GL = {};
    function def(ch, w, fn) { GL[ch] = { w: w, fn: fn, P: null }; }
    def('A', 0.84, function (k) { k.seg(0.09, 0, 0.42, -1.0, t1, t1).seg(0.42, -1.02, 0.78, 0, T1 * 0.82, T1).seg(0.22, -0.35, 0.63, -0.35, t1 * 0.95).foot(0.09, 0, 0.11).foot(0.78, 0, 0.13).seg(0.33, -1.02, 0.47, -1.02, 0.05); });
    def('V', 0.80, function (k) { k.seg(0.06, -1, 0.40, 0.01, T1, T1 * 0.8).seg(0.40, 0.01, 0.75, -1, t1, t1).head(0.06, -1, 0.12).head(0.75, -1, 0.1); });
    def('T', 0.76, function (k) { k.seg(0.02, -0.955, 0.74, -0.955, 0.09).seg(0.38, -0.93, 0.38, 0, T1).foot(0.38, 0, 0.14).seg(0.035, -1, 0.04, -0.76, 0.12, 0.03).seg(0.725, -1, 0.72, -0.76, 0.12, 0.03); });
    def('R', 0.80, function (k) { k.seg(0.12, -1, 0.12, 0, T1).seg(0.12, -0.955, 0.40, -0.955, 0.09).arc(0.40, -0.73, 0.235, 0.225, -90, 90, T1 * 0.95, 0.075).seg(0.12, -0.5, 0.41, -0.5, 0.07)
      .quad(0.33, -0.52, 0.54, -0.22, 0.80, 0.0, T1 * 0.95, 0.085).head(0.12, -1, 0.13).foot(0.12, 0, 0.14).foot(0.80, 0, 0.08); });
    def('E', 0.68, function (k) { k.seg(0.12, -1, 0.12, 0, T1).seg(0.12, -0.955, 0.61, -0.955, 0.09).seg(0.12, -0.5, 0.50, -0.5, 0.075).seg(0.12, -0.045, 0.65, -0.045, 0.09)
      .seg(0.60, -1, 0.605, -0.78, 0.12, 0.03).seg(0.645, 0, 0.64, -0.22, 0.13, 0.03).seg(0.495, -0.6, 0.495, -0.4, 0.035, 0.035).head(0.12, -1, 0.12).foot(0.12, 0, 0.12); });
    def('L', 0.64, function (k) { k.seg(0.12, -1, 0.12, 0, T1).seg(0.12, -0.045, 0.62, -0.045, 0.09).seg(0.615, 0, 0.61, -0.24, 0.13, 0.03).head(0.12, -1, 0.13).foot(0.12, 0, 0.12); });
    def('M', 0.98, function (k) { k.seg(0.11, -1, 0.11, 0, t1).seg(0.11, -1, 0.49, 0.01, T1 * 0.92, T1 * 0.8).seg(0.49, 0.01, 0.87, -1, t1, t1).seg(0.87, -1, 0.87, 0, T1).head(0.1, -1, 0.1).head(0.88, -1, 0.11).foot(0.11, 0, 0.11).foot(0.87, 0, 0.13); });
    def('v', 0.62, function (k) { k.seg(0.05, -X, 0.31, 0.01, T1 * 0.95, T1 * 0.8).seg(0.32, 0.01, 0.58, -X, t1, t1).head(0.05, -X, 0.1).head(0.58, -X, 0.09); });
    def('a', 0.62, function (k) { k.seg(0.49, -0.46, 0.49, 0, T1 * 0.95).arc(0.31, -0.46, 0.18, 0.24, -165, 0, T1 * 0.95, 0.05).arc(0.28, -0.215, 0.205, 0.215, -100, 260, T1 * 0.9, 0.05, 40).foot(0.51, 0, 0.09).dot(0.135, -0.51, 0.12); });
    def('t', 0.47, function (k) { k.seg(0.19, -0.93, 0.19, -0.15, T1 * 0.95).arc(0.335, -0.16, 0.145, 0.16, 180, -15, T1 * 0.95, 0.045).seg(0.01, -X + 0.02, 0.43, -X + 0.02, 0.07); });
    def('e', 0.63, function (k) { k.arc(0.315, -0.35, 0.265, 0.35, 0, -315, T1 * 0.95, 0.05, 40).seg(0.07, -0.37, 0.57, -0.37, 0.065); });
    def('r', 0.52, function (k) { k.seg(0.15, -X, 0.15, 0, T1).quad(0.2, -0.47, 0.26, -0.71, 0.45, -0.66, T1 * 0.55, 0.06).head(0.13, -X, 0.11).foot(0.15, 0, 0.13).dot(0.455, -0.6, 0.13); });
    /* gl-r20 (🏭 Artifactory): i F c o y */
    def('i', 0.3, function (k) { k.seg(0.15, -X, 0.15, 0, T1 * 0.95).head(0.13, -X, 0.09).foot(0.15, 0, 0.12).dot(0.155, -0.93, 0.15); });
    def('F', 0.64, function (k) { k.seg(0.12, -1, 0.12, 0, T1).seg(0.12, -0.955, 0.61, -0.955, 0.09).seg(0.12, -0.5, 0.50, -0.5, 0.075).seg(0.60, -1, 0.605, -0.78, 0.12, 0.03).seg(0.495, -0.6, 0.495, -0.4, 0.035, 0.035).head(0.12, -1, 0.12).foot(0.12, 0, 0.15); });
    def('c', 0.58, function (k) { k.arc(0.32, -0.35, 0.265, 0.35, -42, -318, T1 * 0.95, 0.05, 40).dot(0.5, -0.56, 0.13); });
    def('o', 0.64, function (k) { k.arc(0.32, -0.35, 0.27, 0.35, -90, 270, T1 * 0.95, 0.05, 48); });
    def('y', 0.64, function (k) { k.seg(0.05, -X, 0.32, 0.0, T1 * 0.95, T1 * 0.8).seg(0.6, -X, 0.27, 0.12, t1, t1).quad(0.27, 0.12, 0.2, 0.3, 0.06, 0.27, t1, 0.05).dot(0.06, 0.25, 0.12).head(0.05, -X, 0.1).head(0.6, -X, 0.09); });
    def('I', 0.34, function (k) { k.seg(0.17, -1, 0.17, 0, T1).head(0.17, -1, 0.14).foot(0.17, 0, 0.14); });
    def('C', 0.84, function (k) { k.arc(0.46, -0.5, 0.38, 0.5, -38, -322, T1, 0.06, 48).seg(0.76, -0.86, 0.77, -0.64, 0.05, 0.11).seg(0.77, -0.15, 0.76, -0.34, 0.05, 0.1); });
    def('O', 0.9, function (k) { k.arc(0.45, -0.5, 0.39, 0.5, -90, 270, T1, 0.06, 56); });
    def('Y', 0.8, function (k) { k.seg(0.06, -1, 0.4, -0.45, T1, T1 * 0.9).seg(0.75, -1, 0.4, -0.45, t1, t1).seg(0.4, -0.47, 0.4, 0, T1).head(0.06, -1, 0.12).head(0.75, -1, 0.1).foot(0.4, 0, 0.14); });
    def(' ', 0.3, function () {});
    function glyph(ch, cx) { var G = GL[ch] || GL[' '], key = 'P' + cx; if (!G[key]) { var k = kit(cx); G.fn(k); G[key] = k.P; } return { w: G.w * cx, P: G[key] }; }
    function lay(str, size, o) {   // → [{ch, G, x, s, dy}] + W (from the left edge)
      var out = [], x = 0, sp = (o.spacing == null ? 0.05 : o.spacing) * size, n = str.length;
      var cx = o.condense || 1; for (var j = 0; j < n; j++) { var G = glyph(str[j], cx), s = size * (o.scale ? o.scale(j, n) : 1); out.push({ G: G, x: x, s: s, dy: o.wave ? o.wave(j, n) : 0, j: j }); x += G.w * s + (j < n - 1 ? sp : 0); }
      return { L: out, W: x };
    }
    function path(g, p) { g.beginPath(); p.forEach(function (q, i) { g[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); g.closePath(); }
    function overlay(b, k) { return b >= 0 ? 'rgba(255,248,226,' + Math.min(0.75, 0.62 * b * k).toFixed(3) + ')' : 'rgba(26,12,0,' + Math.min(0.7, 0.55 * -b * k).toFixed(3) + ')'; }
    function serif(g, str, cx, base, size, o) {
      var Q = lay(str, size, o), W = Q.W, ow = o.outline == null ? size * 0.13 : o.outline, d = o.depth == null ? size * 0.07 : o.depth, lk = o.light == null ? 0.75 : o.light;
      g.save(); g.translate(cx, base); if (o.rot) g.rotate(o.rot); g.lineJoin = 'round'; g.lineCap = 'round';
      function each(fn) { Q.L.forEach(function (q) { g.save(); g.translate(-W / 2 + q.x, q.dy); g.scale(q.s, q.s); fn(q); g.restore(); }); }
      function polys(q, fn) { q.G.P.forEach(function (p) { if (p.dot) { g.beginPath(); g.arc(p.dot[0], p.dot[1], p.dot[2] / 2, 0, Math.PI * 2); } else path(g, p.poly); fn(p); }); }
      if (o.glow) for (var gi = 0; gi < (o.glowN || 1); gi++) each(function (q) { g.shadowColor = o.glow; g.shadowBlur = size * (o.glowBlur || 0.3) * (gi ? 0.45 : 1); g.strokeStyle = o.glow; g.lineWidth = ow / q.s; polys(q, function () { g.stroke(); }); });
      g.shadowBlur = 0;
      for (var s = d; s >= 0; s -= Math.max(1, d / 6)) each(function (q) { g.translate(0, s / q.s); g.fillStyle = g.strokeStyle = s ? (o.side || o.dark) : o.dark; g.lineWidth = ow / q.s; polys(q, function () { g.stroke(); g.fill(); }); });
      if (o.ring) each(function (q) { g.strokeStyle = o.ring; g.lineWidth = (o.ringW || ow * 0.45) / q.s; polys(q, function () { g.stroke(); }); });
      each(function (q) {
        var f = o.face(q.j, str.length), base0 = function () { return T.lin(g, 0, -1.05, 0, 0.02, f); };
        q.G.P.forEach(function (p) {
          if (p.dot) { g.beginPath(); g.arc(p.dot[0], p.dot[1], p.dot[2] / 2, 0, Math.PI * 2); g.fillStyle = base0(); g.fill(); var r = p.dot[2] / 2; g.fillStyle = T.lin(g, p.dot[0] + LV[0] * r, p.dot[1] + LV[1] * r, p.dot[0] - LV[0] * r, p.dot[1] - LV[1] * r, [0, overlay(0.8, lk), 0.5, 'rgba(0,0,0,0)', 1, overlay(-0.7, lk)]); g.fill(); return; }
          p.facets.forEach(function (fc) {
            path(g, fc.p); g.fillStyle = base0(); g.fill();
            var bs = fc.n.map(function (n) { return (n[0] * LV[0] + n[1] * LV[1]) * fc.s; }), mn = 0, mx = 0;
            bs.forEach(function (b, i) { if (b < bs[mn]) mn = i; if (b > bs[mx]) mx = i; });
            var mid = function (i) { return [(fc.side[i][0] + p.C[i][0]) / 2, (fc.side[i][1] + p.C[i][1]) / 2]; }, a = mid(mn), b = mid(mx);
            if (bs[mx] - bs[mn] < 0.2 || Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.02) { var avg = 0; bs.forEach(function (v) { avg += v / bs.length; }); var sf = []; for (var i = 0; i < f.length; i += 2) sf.push(f[i], T.shade(f[i + 1], avg >= 0 ? Math.min(0.8, 0.6 * avg * lk) : Math.max(-0.8, 0.62 * avg * lk))); g.fillStyle = T.lin(g, 0, -1.05, 0, 0.02, sf); }
            else { var st = [0, overlay(bs[mn], lk)]; if (bs[mn] < 0 && bs[mx] > 0) st.push(-bs[mn] / (bs[mx] - bs[mn]), 'rgba(0,0,0,0)'); st.push(1, overlay(bs[mx], lk)); g.fillStyle = T.lin(g, a[0], a[1], b[0], b[1], st); }
            g.fill();
          });
          if (p.w > 0.075) { g.strokeStyle = o.ridge || 'rgba(255,250,228,.7)'; g.lineWidth = 0.013; g.beginPath(); p.C.forEach(function (c, i) { g[i ? 'lineTo' : 'moveTo'](c[0], c[1]); }); g.stroke(); }
        });
      });
      g.restore(); return W;
    }
    serif.width = function (str, size, o) { return lay(str, size, o || {}).W; };
    serif.has = function (ch) { return !!GL[ch]; };
    T.serif = serif;
  })();
  return { add: add, need: need, sources: sources, alias: alias, ok: ok, approve: approve, ready: ready, has: has, kinds: kinds, looks: looks, box: box, pic: pic, url: url, draw: draw, clear: clear, tools: T, FONT: FONT };
})();



// 🏷️ LOGO app START — 🎮 STEAM Playground (the app's own logo), drawn in code from Aowu's picture (gl-1)
GameLogos.add('app', (function () {
  // design space = Aowu's picture, 1024 × 572
  var BOX = { scene: [1024, 572], main: [620, 566], wide: [760, 170], badge: [400, 400] };
  var LOOK = {
    classic: {
      sky: ['#0a1a5e', '#16308f', '#0c1f6b'], swirl: ['#5a3fd0', '#2f7df0', '#7a4be0'], path: ['#d8b877', '#a8853f'],
      ring: ['#fff0a0', '#ffc531', '#c9820a'], core: ['#e2fbff', '#7fdcff', '#2f8df0', '#1440b0'],
      steam: { face: ['#ffffff', '#e4f6ff', '#a9dcff', '#74bcfb'], ring: '#3d8df0', side: '#2a57c9', dark: '#0e1f66' },
      play: { face: ['#fff59a', '#ffd83a', '#ffae1c', '#ff8d14'], ring: '#f08a12', side: '#b65a08', dark: '#4a2206' },
      star: '#ffd23e', gearA: '#3f8bf0', gearB: '#ff9c2a', gearC: '#9a5cf0', cape: ['#ff5a4a', '#e0338a', '#7a35c8'], shirt: ['#3fa8f0', '#1f6fd0'], sleeve: ['#5fd04a', '#2f9a34']
    }
  };
  var TAU = Math.PI * 2;

  function bg(g, L, T) {
    g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, L.sky[0], 0.5, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572);
    // nebula clouds
    [[150, 120, 260, 'rgba(110,70,220,.55)'], [900, 470, 280, 'rgba(120,60,200,.6)'], [840, 120, 240, 'rgba(40,120,240,.5)'], [140, 480, 240, 'rgba(30,90,220,.45)']].forEach(function (c) { g.fillStyle = T.rad(g, c[0], c[1], 0, c[2], [0, c[3], 1, 'rgba(0,0,0,0)']); g.fillRect(0, 0, 1024, 572); });
    // swirling galaxy bands
    var bands = [[512, 330, 640, 300, -0.32, 60, L.swirl[0], 0.34], [512, 340, 520, 235, -0.3, 40, L.swirl[1], 0.34], [520, 340, 760, 360, -0.38, 54, L.swirl[2], 0.26], [512, 340, 420, 190, -0.25, 26, '#58c6ff', 0.3], [512, 340, 330, 150, -0.2, 14, '#bfeaff', 0.25]];
    bands.forEach(function (b) { g.save(); g.translate(b[0], b[1]); g.rotate(b[4]); g.globalAlpha = b[7]; g.strokeStyle = b[6]; g.lineWidth = b[5]; g.beginPath(); g.ellipse(0, 0, b[2], b[3], 0, 0, TAU); g.stroke(); g.restore(); });
    // big cyan glow behind the ring
    g.fillStyle = T.rad(g, 512, 345, 120, 380, [0, 'rgba(90,220,255,.85)', 0.45, 'rgba(60,150,255,.38)', 1, 'rgba(40,90,230,0)']); g.fillRect(0, 0, 1024, 572);
    // winding galaxy streams where the picture has sandy paths (Aowu: "change it to galaxy")
    function galaxy(pts, w0, w1, seed, cols) {
      var C = [], cur = [pts[0], pts[1]], i, t;
      for (i = 2; i < pts.length; i += 6) { for (t = (i === 2 ? 0 : 0.02); t <= 1.0001; t += 0.02) { var u = 1 - t; C.push([u * u * u * cur[0] + 3 * u * u * t * pts[i] + 3 * u * t * t * pts[i + 2] + t * t * t * pts[i + 4], u * u * u * cur[1] + 3 * u * u * t * pts[i + 1] + 3 * u * t * t * pts[i + 3] + t * t * t * pts[i + 5]]); } cur = [pts[i + 4], pts[i + 5]]; }
      var n = C.length, c = document.createElement('canvas'); c.width = 1024; c.height = 572; var h = c.getContext('2d'); h.lineCap = 'round'; h.lineJoin = 'round';
      function seg(a, b, w, col, al, blur) { h.globalAlpha = al; h.strokeStyle = col; h.shadowColor = col; h.shadowBlur = blur; h.lineWidth = w; h.beginPath(); h.moveTo(C[a][0], C[a][1]); for (var q = a + 1; q <= b; q++) h.lineTo(C[q][0], C[q][1]); h.stroke(); }
      // soft glowing band, colour drifting along its length
      for (i = 0; i < n - 4; i += 3) { var f = i / (n - 1), w = w0 + (w1 - w0) * f, col = cols[Math.min(cols.length - 1, Math.floor(f * cols.length))]; seg(i, Math.min(n - 1, i + 4), w, col, 0.16, 26); seg(i, Math.min(n - 1, i + 4), w * 0.5, col, 0.2, 14); }
      for (i = 0; i < n - 4; i += 3) { var f1 = i / (n - 1); seg(i, Math.min(n - 1, i + 4), (w0 + (w1 - w0) * f1) * 0.14, '#ffffff', 0.22, 10); }
      // star dust: thick in the middle of the band, thin at its edges
      h.shadowBlur = 0; var r = T.rng(seed);
      for (i = 0; i < n * 9; i++) { var k = Math.floor(r() * (n - 2)) + 1, f2 = k / (n - 1), ww = (w0 + (w1 - w0) * f2) * 0.6, a2 = C[k - 1], b2 = C[k + 1], ang = Math.atan2(b2[1] - a2[1], b2[0] - a2[0]), off = (r() + r() + r() - 1.5) * ww, sz = r();
        h.globalAlpha = 0.35 + r() * 0.6; h.fillStyle = sz > 0.9 ? '#fff3b0' : (sz > 0.7 ? '#ffc8f4' : (sz > 0.45 ? '#bfe9ff' : '#ffffff'));
        h.beginPath(); h.arc(C[k][0] - Math.sin(ang) * off, C[k][1] + Math.cos(ang) * off, 0.5 + sz * sz * 2.1, 0, TAU); h.fill(); }
      for (i = 0; i < 7; i++) { var k2 = Math.floor(r() * (n - 2)) + 1; T.spark(h, C[k2][0] + (r() - 0.5) * 20, C[k2][1] + (r() - 0.5) * 20, 4 + r() * 5, '#ffffff', 0.9); }
      // fade both ends into the sky
      h.globalAlpha = 1; h.globalCompositeOperation = 'destination-in'; var e0 = C[0], e1 = C[n - 1], fd = h.createLinearGradient(e0[0], e0[1], e1[0], e1[1]); fd.addColorStop(0, 'rgba(0,0,0,.3)'); fd.addColorStop(0.2, '#000'); fd.addColorStop(0.8, '#000'); fd.addColorStop(1, 'rgba(0,0,0,.1)'); h.fillStyle = fd; h.fillRect(0, 0, 1024, 572);
      g.drawImage(c, 0, 0);
    }
    galaxy([-40, 250, 60, 236, 190, 262, 176, 318, 162, 372, 40, 372, 56, 434, 72, 492, 230, 470, 226, 532, 224, 566, 170, 590, 120, 620], 40, 92, 11, ['#b98cff', '#8f6cff', '#5aa8ff', '#58d6ff', '#ff8ad8']);
    galaxy([1064, 96, 990, 96, 930, 130, 946, 180, 960, 226, 1010, 236, 968, 276, 920, 318, 820, 268, 760, 306], 80, 34, 12, ['#ff8ad8', '#c78cff', '#8f6cff', '#58c6ff']);
    // stars
    var r2 = T.rng(77), i;
    for (i = 0; i < 190; i++) { var x = r2() * 1024, y = r2() * 572, s = r2(); g.globalAlpha = 0.25 + s * 0.65; g.fillStyle = s > 0.8 ? '#ffe9a0' : (s > 0.6 ? '#ffb0f0' : '#dff1ff'); g.beginPath(); g.arc(x, y, 0.6 + s * 1.7, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    [[42, 268, 12], [212, 322, 8], [905, 255, 9], [958, 160, 12], [232, 486, 10], [806, 150, 7], [150, 420, 6], [366, 34, 7], [870, 520, 7]].forEach(function (s) { T.spark(g, s[0], s[1], s[2], s[2] > 9 ? '#ffd86a' : '#dff3ff', 0.95); });
    // floating gems / cubes / pyramids
    [[116, 178, 22, '#f2b63a', '#a86a10', 0.3], [130, 86, 12, '#f2b63a', '#a86a10', -0.3], [96, 252, 10, '#d9a64a', '#8a5a14', 0.5], [852, 40, 13, '#d9a64a', '#8a5a14', 0.6], [876, 196, 16, '#5aa8ff', '#2a5fd0', -0.5], [746, 520, 15, '#f2b63a', '#a86a10', 0.2], [268, 520, 14, '#5aa8ff', '#2a5fd0', 0.4], [56, 222, 11, '#9a5cf0', '#5a2fb8', 0.2], [900, 300, 10, '#f2b63a', '#a86a10', -0.2]].forEach(function (c) { gem(g, c[0], c[1], c[2], c[3], c[4], c[5]); });
    [[42, 330, 30, '#b06cf5', '#6a2fc0', -0.5], [920, 116, 26, '#4aa0f5', '#1f58c8', 0.9], [824, 462, 26, '#9a6cf5', '#5a2fb8', 0.5]].forEach(function (c) { pyr(g, c[0], c[1], c[2], c[3], c[4], c[5]); });
    portal(g, T, 936, 452, 42, 62, 0.12, ['#06206a', '#2f8df0', '#bff0ff'], L, true);
  }
  function pyr(g, x, y, s, c1, c2, rot) {
    g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(-s, -s * 0.7); g.lineTo(s, 0); g.lineTo(-s * 0.3, s * 0.8); g.closePath(); g.fillStyle = c1; g.fill();
    g.beginPath(); g.moveTo(-s, -s * 0.7); g.lineTo(-s * 0.1, -s * 0.05); g.lineTo(-s * 0.3, s * 0.8); g.closePath(); g.fillStyle = c2; g.fill();
    g.beginPath(); g.moveTo(-s, -s * 0.7); g.lineTo(s, 0); g.lineTo(-s * 0.1, -s * 0.05); g.closePath(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fill(); g.restore();
  }
  function gem(g, x, y, s, c1, c2, rot) {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.86, -s * 0.5); g.lineTo(0, 0); g.lineTo(-s * 0.86, -s * 0.5); g.closePath(); g.fillStyle = '#fff3c9'; g.globalAlpha = 0.95; g.fillStyle = c1; g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill();
    g.beginPath(); g.moveTo(-s * 0.86, -s * 0.5); g.lineTo(0, 0); g.lineTo(0, s); g.lineTo(-s * 0.86, s * 0.5); g.closePath(); g.fillStyle = c1; g.fill();
    g.beginPath(); g.moveTo(s * 0.86, -s * 0.5); g.lineTo(0, 0); g.lineTo(0, s); g.lineTo(s * 0.86, s * 0.5); g.closePath(); g.fillStyle = c2; g.fill();
    g.restore();
  }
  function portal(g, T, x, y, rx, ry, rot, c, L, flame) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(rx / 50, ry / 50); var R = 50;
    if (flame) { g.fillStyle = L.ring[1]; for (var f = 0; f < 16; f++) { var fa = f * TAU / 16; g.beginPath(); g.moveTo(Math.cos(fa - 0.16) * R, Math.sin(fa - 0.16) * R); g.quadraticCurveTo(Math.cos(fa) * R * 1.12, Math.sin(fa) * R * 1.12, Math.cos(fa + 0.3) * R * 1.3, Math.sin(fa + 0.3) * R * 1.3); g.lineTo(Math.cos(fa + 0.2) * R, Math.sin(fa + 0.2) * R); g.closePath(); g.fill(); } }
    g.shadowColor = c[2]; g.shadowBlur = 22; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = T.rad(g, 0, 0, 2, R, [0, c[0], 0.5, c[1], 1, c[2]]); g.fill(); g.shadowBlur = 0;
    g.lineCap = 'round'; for (var i = 0; i < 5; i++) { g.beginPath(); for (var a = 0; a < 4.6; a += 0.12) { var rr = R * 0.12 + a * R * 0.17, an = a + i * TAU / 5; g[a ? 'lineTo' : 'moveTo'](Math.cos(an) * rr, Math.sin(an) * rr); } g.strokeStyle = i % 2 ? 'rgba(255,255,255,.6)' : c[2]; g.globalAlpha = 0.6; g.lineWidth = R * 0.07; g.stroke(); }
    g.globalAlpha = 1; g.beginPath(); g.arc(0, 0, R * 0.22, 0, TAU); g.fillStyle = c[0]; g.fill();
    g.beginPath(); g.arc(0, 0, R, 0, TAU); g.lineWidth = R * 0.2; g.strokeStyle = '#5b3404'; g.stroke(); g.lineWidth = R * 0.13; g.strokeStyle = T.lin(g, -R, -R, R, R, [0, L.ring[0], 0.5, L.ring[1], 1, L.ring[2]]); g.stroke();
    g.restore();
  }
  function ringPath(g, cx, cy, R) { g.beginPath(); g.arc(cx, cy, R, Math.PI * 0.70, Math.PI * 0.30); g.quadraticCurveTo(cx + R * 0.36, cy + R * 0.98, cx, cy + R * 1.09); g.quadraticCurveTo(cx - R * 0.36, cy + R * 0.98, cx + Math.cos(Math.PI * 0.70) * R, cy + Math.sin(Math.PI * 0.70) * R); g.closePath(); }
  function ring(g, L, T, cx, cy, R) {
    g.save();
    g.shadowColor = 'rgba(110,225,255,.95)'; g.shadowBlur = 46; ringPath(g, cx, cy, R); g.fillStyle = L.core[2]; g.fill(); g.shadowBlur = 0;
    ringPath(g, cx, cy, R); g.fillStyle = T.rad(g, cx, cy + 30, 10, R * 1.05, [0, '#ffffff', 0.2, L.core[0], 0.48, L.core[1], 0.8, L.core[2], 1, L.core[3]]); g.fill();
    g.save(); ringPath(g, cx, cy, R); g.clip();
    g.globalAlpha = 0.2; g.fillStyle = '#fff'; for (var i = 0; i < 18; i++) { var a = i * TAU / 18 + 0.1; g.beginPath(); g.moveTo(cx, cy + 70); g.lineTo(cx + Math.cos(a) * R * 1.4, cy + 70 + Math.sin(a) * R * 1.4); g.lineTo(cx + Math.cos(a + 0.1) * R * 1.4, cy + 70 + Math.sin(a + 0.1) * R * 1.4); g.closePath(); g.fill(); }
    g.globalAlpha = 0.4; g.strokeStyle = '#a8ecff'; g.lineWidth = 14; g.beginPath(); g.ellipse(cx, cy + 10, R * 0.86, R * 0.5, -0.5, 0, TAU); g.stroke();
    g.strokeStyle = '#7a5cf0'; g.lineWidth = 12; g.globalAlpha = 0.3; g.beginPath(); g.ellipse(cx, cy + 20, R * 0.7, R * 0.94, 0.6, 0, TAU); g.stroke();
    // dark starry floor at the bottom tip, like the picture
    g.globalAlpha = 1; g.fillStyle = T.lin(g, 0, cy + R * 0.45, 0, cy + R * 1.1, [0, 'rgba(10,20,90,0)', 0.5, 'rgba(10,20,90,.75)', 1, 'rgba(8,14,70,.95)']); g.fillRect(cx - R, cy + R * 0.4, R * 2, R);
    var r = T.rng(5); for (i = 0; i < 70; i++) { var an = r() * TAU, d = Math.sqrt(r()) * R * 0.98; g.globalAlpha = 0.35 + r() * 0.6; g.fillStyle = r() > 0.75 ? '#ffe28a' : '#fff'; g.beginPath(); g.arc(cx + Math.cos(an) * d, cy + Math.sin(an) * d, 0.8 + r() * 1.8, 0, TAU); g.fill(); }
    g.restore();
    g.globalAlpha = 1; g.lineJoin = 'round';
    ringPath(g, cx, cy, R); g.lineWidth = 24; g.strokeStyle = '#4e2c04'; g.stroke();
    ringPath(g, cx, cy, R); g.lineWidth = 17; g.strokeStyle = T.lin(g, cx - R, cy - R, cx + R, cy + R * 1.1, [0, '#fff3b0', 0.22, L.ring[1], 0.5, '#e09a12', 0.72, L.ring[1], 1, '#fff0a0']); g.stroke();
    ringPath(g, cx, cy, R + 4.5); g.lineWidth = 3; g.strokeStyle = 'rgba(255,250,210,.9)'; g.stroke();
    ringPath(g, cx, cy, R - 5); g.lineWidth = 3.5; g.strokeStyle = 'rgba(150,84,6,.75)'; g.stroke();
    [[-2.5, 7], [-0.5, 6], [0.5, 5]].forEach(function (q) { T.spark(g, cx + Math.cos(q[0]) * (R + 2), cy + Math.sin(q[0]) * (R + 2), q[1] + 3, '#fff', 0.95); });
    g.restore();
  }
  function coaster(g) {
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    // green hill + bushes
    g.beginPath(); g.moveTo(300, 452); g.quadraticCurveTo(330, 392, 392, 396); g.quadraticCurveTo(440, 400, 452, 452); g.closePath(); g.fillStyle = '#35a84a'; g.fill(); g.strokeStyle = '#17622a'; g.lineWidth = 4; g.stroke();
    [[322, 420, 13], [344, 408, 15], [368, 404, 13]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fillStyle = '#4fc85a'; g.fill(); g.lineWidth = 3; g.stroke(); });
    var P = [[258, 388], [270, 330, 292, 306, 314, 312], [344, 320, 348, 384, 380, 388], [410, 392, 424, 346, 452, 330]];
    function at(seg, t) { var a = seg[0], b = seg[1], u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * b[2] + t * t * t * b[4], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * b[3] + t * t * t * b[5]]; }
    var pts = [], cur = P[0]; for (var i = 1; i < P.length; i++) { for (var t = 0; t <= 1.001; t += 0.125) pts.push(at([cur, P[i]], t)); cur = [P[i][4], P[i][5]]; }
    g.strokeStyle = 'rgba(170,190,240,.9)'; g.lineWidth = 2.2; for (i = 0; i < pts.length; i += 2) { var q = pts[i], n = pts[Math.min(pts.length - 1, i + 2)]; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0], 440); g.stroke(); g.beginPath(); g.moveTo(q[0], Math.min(438, q[1] + 26)); g.lineTo(n[0], Math.min(438, n[1] + 4)); g.stroke(); }
    function track(dy) { g.beginPath(); g.moveTo(P[0][0], P[0][1] + dy); for (var k = 1; k < P.length; k++) g.bezierCurveTo(P[k][0], P[k][1] + dy, P[k][2], P[k][3] + dy, P[k][4], P[k][5] + dy); }
    track(0); g.strokeStyle = '#5a0c0c'; g.lineWidth = 13; g.stroke(); track(0); g.strokeStyle = '#ef3b33'; g.lineWidth = 8; g.stroke(); track(-2); g.strokeStyle = '#ffb4a4'; g.lineWidth = 2; g.stroke();
    // little cart on the first hill
    g.save(); g.translate(300, 304); g.rotate(-0.25); GameLogos.tools.rr(g, -13, -12, 26, 14, 5); g.fillStyle = '#ffd23e'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#6a3a04'; g.stroke(); g.restore();
    g.restore();
  }
  function flask(g, T, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.18); g.lineJoin = 'round';
    function body() { g.beginPath(); g.moveTo(-9, -44); g.lineTo(-9, -16); g.quadraticCurveTo(-34, 0, -30, 22); g.quadraticCurveTo(-26, 40, 0, 40); g.quadraticCurveTo(26, 40, 30, 22); g.quadraticCurveTo(34, 0, 9, -16); g.lineTo(9, -44); g.closePath(); }
    body(); g.fillStyle = 'rgba(200,240,255,.45)'; g.fill();
    g.save(); body(); g.clip(); g.fillStyle = T.lin(g, 0, 2, 0, 40, [0, '#b8ff5a', 1, '#2fb43a']); g.fillRect(-40, 4, 80, 40); g.fillStyle = '#e6ffb0'; g.beginPath(); g.ellipse(0, 4, 30, 5, 0, 0, TAU); g.fill();
    [[-10, 20, 5], [8, 26, 4], [14, 12, 3]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill(); }); g.restore();
    body(); g.lineWidth = 5; g.strokeStyle = '#123a6e'; g.stroke(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.moveTo(-20, 8); g.quadraticCurveTo(-24, 22, -14, 32); g.stroke();
    T.rr(g, -14, -52, 28, 9, 4); g.fillStyle = '#dff6ff'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#123a6e'; g.stroke();
    [[-2, -66, 6], [12, -80, 4], [-12, -84, 3]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fillStyle = '#9dff5a'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#2a8a2a'; g.stroke(); });
    g.restore();
  }
  function note(g, x, y, s, col, rot, two) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    function shape() { g.beginPath(); g.ellipse(0, 0, 9, 6.5, -0.4, 0, TAU); g.rect(6, -34, 4, 34); if (two) { g.ellipse(26, -6, 9, 6.5, -0.4, 0, TAU); g.rect(32, -40, 4, 34); g.moveTo(6, -34); g.lineTo(36, -40); g.lineTo(36, -30); g.lineTo(6, -24); g.closePath(); } else { g.moveTo(10, -34); g.quadraticCurveTo(26, -28, 22, -12); g.quadraticCurveTo(20, -22, 10, -24); g.closePath(); } }
    shape(); g.lineWidth = 6; g.strokeStyle = '#102060'; g.stroke(); g.fillStyle = col; g.fill(); g.restore();
  }
  function splash(g, x, y, s, col) {
    g.save(); g.translate(x, y); g.scale(s, s); var r = GameLogos.tools.rng(9); g.beginPath();
    for (var i = 0; i <= 22; i++) { var a = i / 22 * TAU, q = 20 + (i % 2 ? 16 : 0) + r() * 8; var px = Math.cos(a) * q, py = Math.sin(a) * q * 0.8; if (!i) g.moveTo(px, py); else g.quadraticCurveTo(Math.cos(a - 0.14) * q * 0.7, Math.sin(a - 0.14) * q * 0.56, px, py); }
    g.closePath(); g.lineWidth = 5; g.strokeStyle = '#6a0a4a'; g.lineJoin = 'round'; g.stroke(); g.fillStyle = col; g.fill();
    [[34, -22, 5], [-36, 14, 4], [26, 28, 4], [-22, -30, 3]].forEach(function (d) { g.beginPath(); g.arc(d[0], d[1], d[2], 0, TAU); g.fill(); });
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-8, -8, 7, 4, -0.5, 0, TAU); g.fill(); g.restore();
  }
  /* our own gamepad shape (rounded bar + two grips, no console look-alike) */
  function pad(g, T, x, y, s, rot, body, glow) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s); g.lineJoin = 'round';
    function shape() { g.beginPath(); g.moveTo(-30, -14); g.quadraticCurveTo(0, -20, 30, -14); g.quadraticCurveTo(46, -10, 48, 12); g.quadraticCurveTo(48, 28, 36, 26); g.quadraticCurveTo(26, 22, 20, 10); g.lineTo(-20, 10); g.quadraticCurveTo(-26, 22, -36, 26); g.quadraticCurveTo(-48, 28, -48, 12); g.quadraticCurveTo(-46, -10, -30, -14); g.closePath(); }
    if (glow) { g.shadowColor = glow; g.shadowBlur = 14; }
    shape(); g.lineWidth = 6; g.strokeStyle = '#0b1238'; g.stroke(); g.shadowBlur = 0; g.fillStyle = T.lin(g, 0, -18, 0, 26, [0, body[0], 1, body[1]]); g.fill();
    g.fillStyle = '#0b1238'; g.fillRect(-32, -3, 14, 4.5); g.fillRect(-27.2, -8, 4.5, 14);
    [[22, -6, '#ffd23e'], [30, 0, '#ff5a6a'], [22, 6, '#52d8ff'], [14, 0, '#7dff7a']].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], 3.4, 0, TAU); g.fillStyle = b[2]; g.fill(); });
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-26, -11); g.quadraticCurveTo(0, -16, 26, -11); g.stroke(); g.restore();
  }

  function kid(g, L, T, cx, cy, s) {
    g.save(); g.translate(cx, cy); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    var INK = '#3a1c0a', SKIN = ['#ffd9b0', '#f5b98a'];
    // cape
    g.beginPath(); g.moveTo(-50, 62); g.quadraticCurveTo(-104, 78, -128, 148); g.quadraticCurveTo(-106, 140, -92, 162); g.quadraticCurveTo(-70, 146, -50, 170); g.quadraticCurveTo(0, 156, 50, 170); g.quadraticCurveTo(70, 146, 92, 162); g.quadraticCurveTo(106, 140, 128, 148); g.quadraticCurveTo(104, 78, 50, 62); g.closePath();
    g.fillStyle = T.lin(g, -120, 60, 120, 170, [0, L.cape[2], 0.3, L.cape[1], 0.55, L.cape[0], 0.8, L.cape[1], 1, L.cape[2]]); g.fill(); g.lineWidth = 6; g.strokeStyle = '#4a0f4a'; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-66, 84); g.quadraticCurveTo(-98, 104, -110, 138); g.stroke(); g.beginPath(); g.moveTo(66, 84); g.quadraticCurveTo(98, 104, 110, 138); g.stroke();
    // light beam from the gamepad
    g.save(); g.globalAlpha = 0.8; g.fillStyle = T.lin(g, 0, 120, 0, 250, [0, 'rgba(255,255,255,.95)', 1, 'rgba(160,220,255,0)']); [-0.9, -0.45, 0, 0.45, 0.9].forEach(function (a) { g.beginPath(); g.moveTo(-6, 124); g.lineTo(6, 124); g.lineTo(Math.sin(a + 0.1) * 150, 124 + Math.cos(a) * 130); g.lineTo(Math.sin(a - 0.1) * 150, 124 + Math.cos(a) * 130); g.closePath(); g.fill(); }); g.restore();
    // torso / shirt
    g.beginPath(); g.moveTo(-50, 66); g.quadraticCurveTo(0, 50, 50, 66); g.lineTo(58, 138); g.quadraticCurveTo(0, 152, -58, 138); g.closePath(); g.fillStyle = T.lin(g, 0, 56, 0, 146, [0, L.shirt[0], 1, L.shirt[1]]); g.fill(); g.lineWidth = 6; g.strokeStyle = '#0d3a6e'; g.stroke();
    // kerchief
    g.beginPath(); g.moveTo(-30, 60); g.quadraticCurveTo(0, 74, 30, 60); g.lineTo(8, 88); g.lineTo(0, 78); g.lineTo(-8, 88); g.closePath(); g.fillStyle = '#ff4a3a'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#7a1408'; g.stroke();
    g.beginPath(); g.arc(0, 76, 5, 0, TAU); g.fillStyle = '#ffd23e'; g.fill(); g.stroke();
    // arms
    [-1, 1].forEach(function (k) { g.beginPath(); g.moveTo(k * 50, 72); g.quadraticCurveTo(k * 78, 96, k * 44, 118); g.lineTo(k * 30, 104); g.quadraticCurveTo(k * 46, 92, k * 40, 78); g.closePath(); g.fillStyle = T.lin(g, 0, 70, 0, 120, [0, L.sleeve[0], 1, L.sleeve[1]]); g.fill(); g.lineWidth = 5; g.strokeStyle = '#14501e'; g.stroke(); });
    // gamepad + hands
    pad(g, T, 0, 112, 0.92, 0, ['#3a3f66', '#171a38'], 'rgba(120,220,255,.9)');
    [-1, 1].forEach(function (k) { g.beginPath(); g.ellipse(k * 34, 118, 13, 11, k * 0.4, 0, TAU); g.fillStyle = SKIN[0]; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.moveTo(k * 26, 114); g.lineTo(k * 36, 110); g.moveTo(k * 26, 120); g.lineTo(k * 38, 117); g.lineWidth = 2; g.stroke(); });
    // neck
    g.fillStyle = SKIN[1]; g.fillRect(-13, 44, 26, 18);
    // ears
    [-1, 1].forEach(function (k) { g.beginPath(); g.ellipse(k * 55, 4, 10, 14, 0, 0, TAU); g.fillStyle = SKIN[1]; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); });
    // head
    g.beginPath(); g.moveTo(-54, -8); g.bezierCurveTo(-56, -62, 56, -62, 54, -8); g.bezierCurveTo(54, 34, 30, 56, 0, 56); g.bezierCurveTo(-30, 56, -54, 34, -54, -8); g.closePath();
    g.fillStyle = T.rad(g, -10, -6, 6, 78, [0, '#ffe6c8', 0.7, SKIN[0], 1, SKIN[1]]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    // cheeks + freckles
    g.fillStyle = 'rgba(255,120,110,.35)'; g.beginPath(); g.ellipse(-34, 22, 11, 7, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(34, 22, 11, 7, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(180,90,50,.6)'; [[-38, 18], [-31, 21], [-35, 26], [38, 18], [31, 21], [35, 26]].forEach(function (f) { g.beginPath(); g.arc(f[0], f[1], 1.4, 0, TAU); g.fill(); });
    // hair — swept quiff
    g.beginPath(); g.moveTo(-58, 2); g.bezierCurveTo(-72, -40, -52, -78, -20, -78); g.bezierCurveTo(-8, -102, 30, -112, 50, -92); g.bezierCurveTo(40, -92, 34, -88, 32, -82); g.bezierCurveTo(60, -80, 72, -40, 58, 2); g.bezierCurveTo(54, -18, 46, -30, 34, -34); g.bezierCurveTo(20, -20, -6, -22, -22, -40); g.bezierCurveTo(-36, -30, -50, -24, -58, 2); g.closePath();
    g.fillStyle = T.lin(g, 0, -106, 0, -10, [0, '#b56c2e', 0.6, '#8a4a1c', 1, '#5e2e0e']); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = 'rgba(255,205,140,.7)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-36, -58); g.quadraticCurveTo(-12, -78, 14, -74); g.stroke(); g.beginPath(); g.moveTo(-4, -90); g.quadraticCurveTo(18, -102, 36, -94); g.stroke();
    g.strokeStyle = 'rgba(60,24,6,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-10, -50); g.quadraticCurveTo(10, -44, 26, -52); g.stroke();
    // headphone band + cups
    g.beginPath(); g.arc(0, -4, 66, Math.PI * 1.08, Math.PI * 1.92); g.lineWidth = 13; g.strokeStyle = '#1a1446'; g.stroke(); g.lineWidth = 7; g.strokeStyle = '#8a86c8'; g.stroke(); g.lineWidth = 2; g.strokeStyle = '#e0dcff'; g.beginPath(); g.arc(0, -4, 68, Math.PI * 1.2, Math.PI * 1.5); g.stroke();
    [-1, 1].forEach(function (k) { T.rr(g, k * 62 - 15, -22, 30, 50, 13); g.fillStyle = T.lin(g, k * 62 - 15, 0, k * 62 + 15, 0, [0, '#a09ad8', 1, '#4a3f9a']); g.fill(); g.lineWidth = 5; g.strokeStyle = '#1a1446'; g.stroke(); T.rr(g, k * 62 - 7, -12, 14, 30, 7); g.fillStyle = '#7dff7a'; g.fill(); g.lineWidth = 2; g.stroke(); });
    // mic
    g.beginPath(); g.moveTo(-62, 24); g.quadraticCurveTo(-58, 52, -30, 48); g.lineWidth = 6; g.strokeStyle = '#1a1446'; g.stroke(); g.beginPath(); g.ellipse(-26, 47, 9, 6, -0.2, 0, TAU); g.fillStyle = '#2b2466'; g.fill(); g.lineWidth = 3; g.stroke();
    // brows
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(-36, -24); g.quadraticCurveTo(-24, -34, -10, -26); g.stroke(); g.beginPath(); g.moveTo(36, -24); g.quadraticCurveTo(24, -34, 10, -26); g.stroke();
    // eyes
    [-1, 1].forEach(function (k) {
      g.beginPath(); g.ellipse(k * 22, -2, 14, 17, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
      g.beginPath(); g.ellipse(k * 21, 0, 9, 12, 0, 0, TAU); g.fillStyle = T.lin(g, 0, -12, 0, 12, [0, '#1a6ad8', 1, '#52c8ff']); g.fill();
      g.beginPath(); g.ellipse(k * 21, 1, 5, 7, 0, 0, TAU); g.fillStyle = '#0a1438'; g.fill();
      g.beginPath(); g.arc(k * 21 - 4, -5, 3.6, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(k * 21 + 3, 5, 1.6, 0, TAU); g.fill();
    });
    // nose
    g.beginPath(); g.moveTo(-3, 14); g.quadraticCurveTo(2, 20, 6, 14); g.lineWidth = 3; g.strokeStyle = '#b06a3a'; g.stroke();
    // big grin
    g.beginPath(); g.moveTo(-24, 24); g.quadraticCurveTo(0, 30, 24, 24); g.quadraticCurveTo(20, 48, 0, 48); g.quadraticCurveTo(-20, 48, -24, 24); g.closePath(); g.fillStyle = '#7a1420'; g.fill();
    g.save(); g.clip(); g.fillStyle = '#fff'; g.fillRect(-24, 22, 48, 9); g.fillStyle = '#ff7a8a'; g.beginPath(); g.ellipse(0, 46, 13, 8, 0, 0, TAU); g.fill(); g.restore();
    g.beginPath(); g.moveTo(-24, 24); g.quadraticCurveTo(0, 30, 24, 24); g.quadraticCurveTo(20, 48, 0, 48); g.quadraticCurveTo(-20, 48, -24, 24); g.closePath(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    g.restore();
  }

  function robot(g, L, T, cx, cy, s) {
    g.save(); g.translate(cx, cy); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    var INK = '#12265e', W = ['#ffffff', '#cfe3fa', '#8fb4e8'];
    // waving arm (far)
    g.beginPath(); g.moveTo(34, 58); g.quadraticCurveTo(72, 40, 66, 4); g.lineWidth = 17; g.strokeStyle = INK; g.stroke(); g.lineWidth = 10; g.strokeStyle = W[1]; g.stroke();
    g.beginPath(); g.arc(66, -6, 14, 0, TAU); g.fillStyle = W[0]; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    [-0.9, -0.35, 0.2].forEach(function (a) { g.beginPath(); g.moveTo(66 + Math.sin(a) * 10, -6 - Math.cos(a) * 10); g.lineTo(66 + Math.sin(a) * 26, -6 - Math.cos(a) * 26); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.lineWidth = 5; g.strokeStyle = W[0]; g.stroke(); });
    // body
    g.beginPath(); g.moveTo(-34, 50); g.quadraticCurveTo(0, 40, 34, 50); g.quadraticCurveTo(44, 90, 30, 116); g.quadraticCurveTo(0, 126, -30, 116); g.quadraticCurveTo(-44, 90, -34, 50); g.closePath();
    g.fillStyle = T.lin(g, -40, 0, 40, 0, [0, W[0], 0.6, W[1], 1, W[2]]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.arc(0, 78, 12, 0, TAU); g.fillStyle = T.rad(g, 0, 78, 1, 12, [0, '#eaffff', 0.5, '#4fe0ff', 1, '#1a8ad8']); g.shadowColor = '#4fe0ff'; g.shadowBlur = 10; g.fill(); g.shadowBlur = 0; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#3f8bf0'; T.rr(g, -22, 100, 44, 8, 4); g.fill();
    // near arm down holding a pad
    g.beginPath(); g.moveTo(-32, 60); g.quadraticCurveTo(-56, 84, -40, 106); g.lineWidth = 17; g.strokeStyle = INK; g.stroke(); g.lineWidth = 10; g.strokeStyle = W[1]; g.stroke();
    g.beginPath(); g.arc(-38, 110, 11, 0, TAU); g.fillStyle = W[0]; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    // neck
    g.fillStyle = '#5a7fc8'; T.rr(g, -12, 34, 24, 14, 5); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    // antenna
    g.beginPath(); g.moveTo(0, -46); g.lineTo(0, -66); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(0, -70, 8, 0, TAU); g.fillStyle = '#ffb02e'; g.shadowColor = '#ffd23e'; g.shadowBlur = 12; g.fill(); g.shadowBlur = 0; g.lineWidth = 3; g.stroke();
    // ears
    [-1, 1].forEach(function (k) { T.rr(g, k * 60 - 9, -20, 18, 34, 8); g.fillStyle = '#3f8bf0'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); });
    // head
    T.rr(g, -56, -46, 112, 84, 34); g.fillStyle = T.lin(g, -56, -46, 56, 40, [0, W[0], 0.6, W[1], 1, W[2]]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    // visor
    T.rr(g, -44, -32, 88, 56, 24); g.fillStyle = T.lin(g, 0, -32, 0, 24, [0, '#0c1436', 1, '#1b2a66']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#3f8bf0'; g.stroke();
    g.strokeStyle = '#5ff0ff'; g.shadowColor = '#5ff0ff'; g.shadowBlur = 10; g.lineWidth = 6;
    g.beginPath(); g.arc(-20, -4, 10, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(20, -4, 10, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.arc(0, 2, 13, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = 'rgba(255,120,160,.55)'; g.beginPath(); g.ellipse(-32, 8, 6, 4, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(32, 8, 6, 4, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-42, -30); g.quadraticCurveTo(-30, -42, -10, -42); g.stroke();
    g.restore();
  }

  function words(g, L, T, cx, y1, y2, k) {
    var S = L.steam, P = L.play;
    function arch(amp) { return function (j, n) { var u = (j - (n - 1) / 2) / ((n - 1) / 2); return amp * u * u; }; }
    var o1 = { spacing: 6 * k, rot: -0.03, wave: arch(9 * k), dark: S.dark, side: S.side, ring: S.ring, outline: 26 * k, depth: 14 * k, glow: 'rgba(110,210,255,.9)', face: function () { return [0, S.face[0], 0.4, S.face[1], 0.78, S.face[2], 1, S.face[3]]; }, inner: 'rgba(255,255,255,.95)' };
    T.word(g, 'STEAM', cx, y1, 122 * k, o1); T.gloss(g, 'STEAM', cx, y1, 122 * k, o1, 0.9);
    var o2 = { spacing: 3 * k, rot: -0.025, wave: arch(5 * k), dark: P.dark, side: P.side, ring: P.ring, outline: 12 * k, depth: 6 * k, noRing: 1, face: function () { return [0, P.face[0], 0.3, P.face[1], 0.7, P.face[2], 1, P.face[3]]; }, inner: 'rgba(255,252,210,.9)' };
    T.word(g, 'Playground', cx + 4 * k, y2, 73 * k, o2); T.gloss(g, 'Playground', cx + 4 * k, y2, 73 * k, o2, 0.75);
  }
  function emblem(g, L, T, noWords) {   // in picture coordinates
    ring(g, L, T, 512, 352, 200);
    portal(g, T, 746, 266, 22, 50, 0.08, ['#12062e', '#6a2fc8', '#d8a8ff'], L);
    T.gear(g, 286, 256, 38, 10, 0.2, L.gearA, '#0f2a78'); T.gear(g, 330, 298, 20, 8, 0.5, L.gearC, '#2a1260');
    coaster(g);
    T.gear(g, 412, 262, 23, 8, 0.1, L.gearB, '#6a2c04'); T.gear(g, 376, 276, 15, 7, 0.6, '#ff7a3a', '#6a2c04');
    flask(g, T, 358, 470, 1.0);
    [[318, 470, 5], [304, 452, 4], [330, 440, 3]].forEach(function (d) { g.beginPath(); g.arc(d[0], d[1], d[2], 0, TAU); g.fillStyle = '#ffb02e'; g.fill(); });
    note(g, 420, 500, 1.15, '#3fa0ff', -0.1, true); note(g, 604, 352, 0.9, '#ffb02e', 0.05); note(g, 622, 304, 0.75, '#c78cff', -0.15, true);
    pad(g, T, 634, 262, 0.78, 0.32, ['#4a4f7a', '#1c2048']);
    robot(g, L, T, 688, 372, 0.8);
    pad(g, T, 708, 458, 0.82, 0.5, ['#4a4f7a', '#1c2048']);
    kid(g, L, T, 512, 326, 0.84);
    splash(g, 612, 492, 0.95, '#ff3fb0');
    [[452, 512, 19], [556, 498, 11], [520, 478, 7], [486, 470, 6], [540, 520, 6]].forEach(function (s) { T.star(g, s[0], s[1], s[2], s[2] * 0.5); g.fillStyle = T.lin(g, 0, s[1] - s[2], 0, s[1] + s[2], [0, '#fff3a0', 1, L.star]); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#8a5a04'; g.lineJoin = 'round'; g.stroke(); });
    if (noWords) return;
    words(g, L, T, 512, 152, 236, 1);
    [[262, 92, 14], [768, 100, 15], [678, 38, 10], [240, 60, 6], [790, 150, 8]].forEach(function (s) { T.star(g, s[0], s[1], s[2], s[2] * 0.5); g.fillStyle = L.star; g.shadowColor = '#fff2a0'; g.shadowBlur = 10; g.fill(); g.shadowBlur = 0; g.lineWidth = 2; g.strokeStyle = '#8a5a04'; g.stroke(); });
    // sparkle arc round the words (pink + gold dots, like the picture)
    var r = T.rng(21); for (var i = 0; i < 46; i++) { var a = Math.PI * (1.02 + r() * 0.96), d = 232 + r() * 34; g.globalAlpha = 0.5 + r() * 0.5; g.fillStyle = ['#ff8ad8', '#ffd86a', '#9fe8ff', '#ffffff'][i % 4]; g.beginPath(); g.arc(512 + Math.cos(a) * d * 1.08, 200 + Math.sin(a) * d * 0.78, 1.2 + r() * 2.6, 0, TAU); g.fill(); } g.globalAlpha = 1;
    [[282, 122, 10], [748, 62, 9], [352, 40, 7], [300, 192, 7], [736, 208, 7]].forEach(function (s) { T.spark(g, s[0], s[1], s[2], '#fff', 0.95); });
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { bg(g, L, T); emblem(g, L, T); return; }
    if (kind === 'main') { g.translate(-202, -8); g.save(); g.fillStyle = T.rad(g, 512, 330, 150, 282, [0, 'rgba(90,200,255,.7)', 1, 'rgba(70,170,255,0)']); g.fillRect(202, 8, 620, 566); g.restore(); emblem(g, L, T); return; }
    if (kind === 'wide') {
      // small ring with the kid, then the two words on one line
      g.save(); g.translate(86, 85); g.scale(0.36, 0.36); g.translate(-512, -338); g.beginPath(); g.arc(512, 338, 204, 0, TAU); g.fillStyle = T.rad(g, 512, 348, 10, 204, [0, '#fff', 0.25, L.core[0], 0.55, L.core[1], 1, L.core[2]]); g.fill(); g.save(); g.clip(); kid(g, L, T, 512, 372, 1.5); g.restore(); g.beginPath(); g.arc(512, 338, 204, 0, TAU); g.lineWidth = 34; g.strokeStyle = '#5b3404'; g.stroke(); g.lineWidth = 22; g.strokeStyle = T.lin(g, 308, 134, 716, 542, [0, L.ring[0], 0.5, L.ring[1], 1, L.ring[2]]); g.stroke(); g.restore();
      var S = L.steam, P = L.play;
      var o1 = { dark: S.dark, side: S.side, ring: S.ring, outline: 18, depth: 8, glow: 'rgba(90,190,255,.7)', spacing: 1, face: function () { return [0, S.face[0], 0.45, S.face[1], 0.8, S.face[2], 1, S.face[3]]; }, inner: 'rgba(255,255,255,.9)' };
      g.font = '700 92px ' + T.FONT; var w1 = g.measureText('STEAM').width + 4; g.font = '700 74px ' + T.FONT; var w2 = g.measureText('Playground').width;
      o1.spacing = 4; w1 += 16; var o2s = 2; w2 += 18; var x = 180, tot = w1 + 26 + w2, k = Math.min(1, (760 - x - 18) / tot); g.save(); g.translate(x, 85); g.scale(k, k); g.translate(0, -85);
      T.word(g, 'STEAM', w1 / 2, 118, 92, o1); T.gloss(g, 'STEAM', w1 / 2, 118, 92, o1, 0.9);
      var o2 = { spacing: o2s, noRing: 1, dark: P.dark, side: P.side, ring: P.ring, outline: 12, depth: 6, face: function () { return [0, P.face[0], 0.35, P.face[1], 0.75, P.face[2], 1, P.face[3]]; }, inner: 'rgba(255,250,200,.8)' };
      T.word(g, 'Playground', w1 + 26 + w2 / 2, 118, 74, o2); T.gloss(g, 'Playground', w1 + 26 + w2 / 2, 118, 74, o2, 0.7); g.restore(); return;
    }
    if (kind === 'badge') {   // the install-app icon: full name + the emblem (Aowu: "the icon for install app should be the full name")
      g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.lin(g, 0, 0, 400, 400, [0, L.sky[0], 0.5, L.sky[1], 1, L.sky[2]]); g.fill(); g.clip();
      g.fillStyle = T.rad(g, 200, 250, 40, 300, [0, 'rgba(90,220,255,.8)', 0.5, 'rgba(60,150,255,.35)', 1, 'rgba(40,90,230,0)']); g.fillRect(0, 0, 400, 400);
      g.globalAlpha = 0.3; g.strokeStyle = L.swirl[0]; g.lineWidth = 40; g.beginPath(); g.ellipse(200, 200, 250, 130, -0.4, 0, TAU); g.stroke(); g.globalAlpha = 1;
      var r = T.rng(3); for (var i = 0; i < 40; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillStyle = '#fff'; g.beginPath(); g.arc(r() * 400, r() * 400, 0.8 + r() * 1.6, 0, TAU); g.fill(); } g.globalAlpha = 1;
      g.save(); g.translate(200, 262); g.scale(0.66, 0.66); g.translate(-512, -352); emblem(g, L, T, true); g.restore();
      words(g, L, T, 200, 112, 176, 0.84);
      g.restore();
      T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 12; g.strokeStyle = '#4e2c04'; g.stroke(); g.lineWidth = 8; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.ring[0], 0.5, L.ring[1], 1, L.ring[2]]); g.stroke();
      return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO app END































