
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

// 🏷️ LOGO algebros START — ➗ Algebros, moved word for word from NumberBoard.html AlgLogo (al-1, approved in its game) by move_st2c.py (gl-r22, 📡 st-2c)
// glue only: kit boxes in units (main 1.8 : 1 · wide 4.2 : 1 · badge 0.86 : 1), the small-size details still follow the real px
GameLogos.add('algebros', (function () {
var AL = (function(){
  const BOX = {main: 1 / 1.8, wide: 1 / 4.2, badge: 1 / 0.86};   // height = width × BOX
  // per look: shield rim (light → dark), glow, panel (top → bottom), tile + ink, letters (8, one per letter), accents for symbols
  const LOOK = {
    classic: {rim: ['#BFE6FF', '#3B8BFF', '#1B3F9E'], glow: '#4FB2FF', panel: ['#173A7A', '#0B1E46'], grid: 'rgba(120,190,255,0.28)', tile: '#F4F8FF', tink: '#1B2B55',
      letters: [['#7AD6FF', '#1C72E0'], ['#FFC06A', '#F2700F'], ['#FFB25A', '#EE6410'], ['#FFC861', '#F08A12'], ['#7AD6FF', '#1C72E0'], ['#FFEC8A', '#DDA012'], ['#FFEC8A', '#DDA012'], ['#FFEC8A', '#DDA012']],
      acc: ['#FFB000', '#4FB2FF', '#3DDC97', '#FF6B8A'], gear: ['#FFB43D', '#4F8DFF']},
    wood: {rim: ['#FFE2B0', '#C98A45', '#6B3E17'], glow: '#FFB45E', panel: ['#7A4A22', '#3E230C'], grid: 'rgba(255,215,160,0.25)', tile: '#FFF3D6', tink: '#4A2E12',
      letters: [['#FFD38A', '#C9792A'], ['#9AD3F2', '#3D7DD8'], ['#F7B2BE', '#E5484D'], ['#FFD38A', '#C9792A'], ['#9AD3F2', '#3D7DD8'], ['#FFE59A', '#E0A12A'], ['#FFE59A', '#E0A12A'], ['#FFE59A', '#E0A12A']],
      acc: ['#E0A12A', '#3D7DD8', '#7BBF5A', '#E5484D'], gear: ['#D9A35E', '#8A5A2B']},
    ocean: {rim: ['#CFF6FF', '#2FA8D8', '#0B4A78'], glow: '#5FE0F0', panel: ['#0F5C8E', '#06294A'], grid: 'rgba(150,230,255,0.28)', tile: '#FFFFFF', tink: '#0B3A5C',
      letters: [['#7FE3D4', '#13A89E'], ['#FFC6A8', '#FF7A59'], ['#FFC6A8', '#FF7A59'], ['#7FE3D4', '#13A89E'], ['#9FDBFF', '#2F8CE0'], ['#FFF0A0', '#F0B020'], ['#FFF0A0', '#F0B020'], ['#FFF0A0', '#F0B020']],
      acc: ['#FFD54D', '#7FE3D4', '#FF7A59', '#FFFFFF'], gear: ['#7FE3D4', '#2F8CE0']},
    candy: {rim: ['#FFE3F1', '#E0569B', '#8A1E5C'], glow: '#FF8AC4', panel: ['#B03A7C', '#5E0F3C'], grid: 'rgba(255,200,230,0.3)', tile: '#FFFFFF', tink: '#7A1050',
      letters: [['#BFE9FF', '#5BB8F5'], ['#FFE59A', '#FF9F1C'], ['#FF9AC8', '#E0569B'], ['#BFE9FF', '#5BB8F5'], ['#C9B8FF', '#8A6BEF'], ['#FFE59A', '#FF9F1C'], ['#FFE59A', '#FF9F1C'], ['#FFE59A', '#FF9F1C']],
      acc: ['#FF9F1C', '#5BB8F5', '#B98CFF', '#FFFFFF'], gear: ['#FFB8D9', '#8A6BEF']},
    space: {rim: ['#E6DEFF', '#7A5CFF', '#2A1A7A'], glow: '#A98BFF', panel: ['#2E2466', '#0C0826'], grid: 'rgba(180,160,255,0.28)', tile: '#EDE8FF', tink: '#22195C',
      letters: [['#8FC0FF', '#3F8CFF'], ['#FF8AC0', '#FF4D8D'], ['#E08AFF', '#C04FD8'], ['#8FC0FF', '#3F8CFF'], ['#8FC0FF', '#3F6CE8'], ['#FFF08A', '#FFC21F'], ['#FFF08A', '#FFC21F'], ['#FFF08A', '#FFC21F']],
      acc: ['#FFC21F', '#3F8CFF', '#FF4D8D', '#FFFFFF'], gear: ['#8A7BFF', '#C04FD8']},
    jungle: {rim: ['#E2F7D2', '#5DB43F', '#24461A'], glow: '#9ED97A', panel: ['#2F6B22', '#122C0C'], grid: 'rgba(200,245,170,0.25)', tile: '#FFFBEA', tink: '#24461A',
      letters: [['#9BE0F0', '#2C9CC0'], ['#FFD08A', '#E8742A'], ['#FFB07A', '#E0541F'], ['#9BE0F0', '#2C9CC0'], ['#B8F08A', '#4FA82C'], ['#FFF08A', '#F0B020'], ['#FFF08A', '#F0B020'], ['#FFF08A', '#F0B020']],
      acc: ['#F0B020', '#2C9CC0', '#E8742A', '#FFFFFF'], gear: ['#9ED97A', '#E8742A']},
    robot: {rim: ['#F2F6FA', '#8FA3B6', '#34424F'], glow: '#9EE6FF', panel: ['#4B5A69', '#1E2730'], grid: 'rgba(160,230,255,0.28)', tile: '#FFFFFF', tink: '#22303D',
      letters: [['#9EE6FF', '#2FA8D8'], ['#FFC07A', '#FF8A3D'], ['#FFA07A', '#E8602A'], ['#9EE6FF', '#2FA8D8'], ['#C8D6E4', '#6F8499'], ['#FFE07A', '#F0B020'], ['#FFE07A', '#F0B020'], ['#FFE07A', '#F0B020']],
      acc: ['#FFE07A', '#2FA8D8', '#FF8A3D', '#FFFFFF'], gear: ['#AEBBC8', '#FF8A3D']}
  };
  const WORD = 'Algebros';
  const FONT = "'Fredoka', 'Nunito', 'Arial Rounded MT Bold', system-ui, sans-serif";
  // our own little crossword inside the shield (true sentences): 2 + 6 = 8 across, 8 − 1 = 7 down, x = 9 down, 9 − 2 = 7 across
  const GRID = {c: 7, r: 9, tiles: [
    [0, 1, '2'], [0, 2, '+'], [0, 3, '6'], [0, 4, '='], [0, 5, '8'],
    [1, 1, '×'], [2, 1, '4'], [3, 1, '='], [4, 1, '8'],
    [2, 2, '−'], [2, 3, '3'], [2, 4, '='], [2, 5, '1'], [1, 5, '−'], [3, 5, '='], [4, 5, '7'],
    [4, 2, '−'], [4, 3, '1'], [4, 4, '='],
    [5.75, 2, 'x'], [5.75, 3, '='], [5.75, 4, '9']]};
  const cache = new Map();
  const lk = k => LOOK[k] || LOOK.classic;

  function shieldPath(g, cx, top, w, h){   // flat top with cut corners, curved sides down to a point
    const l = cx - w / 2, r = cx + w / 2, c = w * 0.1, b = top + h;
    g.beginPath();
    g.moveTo(l + c, top); g.lineTo(r - c, top); g.lineTo(r, top + c);
    g.lineTo(r, top + h * 0.5);
    g.bezierCurveTo(r, top + h * 0.78, cx + w * 0.22, top + h * 0.9, cx, b);
    g.bezierCurveTo(cx - w * 0.22, top + h * 0.9, l, top + h * 0.78, l, top + h * 0.5);
    g.lineTo(l, top + c); g.closePath();
  }
  function shield(g, L, cx, top, w, h, opt){
    opt = opt || {};
    const lw = Math.max(2, w * 0.05);
    // glow
    g.save(); g.shadowColor = L.glow; g.shadowBlur = w * 0.16; shieldPath(g, cx, top, w, h); g.fillStyle = L.rim[2]; g.fill(); g.restore();
    // chrome rim
    let gr = g.createLinearGradient(cx - w / 2, top, cx + w / 2, top + h);
    gr.addColorStop(0, L.rim[0]); gr.addColorStop(0.45, L.rim[1]); gr.addColorStop(1, L.rim[2]);
    shieldPath(g, cx, top, w, h); g.fillStyle = gr; g.fill();
    g.lineWidth = Math.max(1, lw * 0.25); g.strokeStyle = 'rgba(10,20,50,0.75)'; g.stroke();
    // inner panel
    const iw = w - lw * 2, ih = h - lw * 2.2, it = top + lw;
    gr = g.createLinearGradient(0, it, 0, it + ih); gr.addColorStop(0, L.panel[0]); gr.addColorStop(1, L.panel[1]);
    shieldPath(g, cx, it, iw, ih); g.fillStyle = gr; g.fill();
    g.save(); shieldPath(g, cx, it, iw, ih); g.clip();
    // grid lines + crossword tiles
    const cs = iw / GRID.c, gx = cx - iw / 2, gy = it + cs * 0.15;
    g.strokeStyle = L.grid; g.lineWidth = Math.max(0.6, cs * 0.04);
    for(let i = 0; i <= GRID.c; i++){ g.beginPath(); g.moveTo(gx + i * cs, it); g.lineTo(gx + i * cs, it + ih); g.stroke(); }
    for(let j = 0; j <= GRID.r + 1; j++){ g.beginPath(); g.moveTo(gx, gy + j * cs); g.lineTo(gx + iw, gy + j * cs); g.stroke(); }
    if(!opt.noTiles){
      g.textAlign = 'center'; g.textBaseline = 'middle';
      GRID.tiles.forEach(([row, col, ch]) => {
        const x = gx + col * cs + cs * 0.08, y = gy + row * cs + cs * 0.08, s = cs * 0.84;
        if(y + s > it + ih) return;
        rr(g, x, y + s * 0.06, s, s, s * 0.16); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill();
        rr(g, x, y, s, s, s * 0.16); g.fillStyle = L.tile; g.fill();
        g.fillStyle = L.tink; g.font = '700 ' + (s * 0.62) + 'px ' + FONT; g.fillText(ch, x + s / 2, y + s * 0.54);
      });
    }
    // shine
    gr = g.createLinearGradient(cx - iw / 2, it, cx + iw * 0.1, it + ih * 0.6);
    gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.04)'); gr.addColorStop(0.5001, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(cx - iw / 2, it, iw, ih);
    g.restore();
    // rim highlight
    g.save(); shieldPath(g, cx, top + lw * 0.3, w - lw * 0.6, h - lw * 0.7); g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = Math.max(0.8, lw * 0.18); g.stroke(); g.restore();
  }
  function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function star(g, x, y, r, col){
    g.save(); g.fillStyle = col; g.shadowColor = col; g.shadowBlur = r * 1.2; g.beginPath();
    for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4 - Math.PI / 2, d = i % 2 ? r * 0.28 : r; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
    g.closePath(); g.fill(); g.restore();
  }
  function gear(g, x, y, r, col, rot){
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    const n = 9; g.beginPath();
    for(let i = 0; i < n * 2; i++){ const a0 = i * Math.PI / n, d = i % 2 ? r * 0.78 : r; g.arc(0, 0, d, a0 - 0.12, a0 + Math.PI / n - 0.12); }
    g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = Math.max(1, r * 0.08); g.strokeStyle = 'rgba(10,20,50,0.6)'; g.stroke();
    g.beginPath(); g.arc(0, 0, r * 0.36, 0, Math.PI * 2); g.fillStyle = 'rgba(10,20,50,0.55)'; g.fill();
    g.beginPath(); g.arc(-r * 0.2, -r * 0.25, r * 0.5, Math.PI * 1.05, Math.PI * 1.6); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = r * 0.1; g.stroke();
    g.restore();
  }
  function eyes_unused(g, x, y, s, look){   // two googly eyes peeking over a letter (the picture's cheeky letters)
    [-1, 1].forEach(k => {
      const ex = x + k * s * 0.62;
      g.beginPath(); g.ellipse(ex, y, s * 0.58, s * 0.66, 0, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.lineWidth = Math.max(1, s * 0.16); g.strokeStyle = '#1A1F3A'; g.stroke();
      g.beginPath(); g.arc(ex + s * 0.14 + look * s * 0.1, y + s * 0.12, s * 0.27, 0, Math.PI * 2); g.fillStyle = '#1A1F3A'; g.fill();
      g.beginPath(); g.arc(ex + s * 0.05 + look * s * 0.1, y - s * 0.02, s * 0.09, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    });
  }
  // the bubbly 3D word, stroked like Aowu's original: outer bright ring → ONE dark outline round the whole word → extrusion →
  // coloured faces on their own layer (fill over stroke) with an inner light bevel, a faint blueprint grid and a top shine
  function bubbly(g, L, items, size, opt){
    opt = opt || {};
    const bold = size * 0.022, out = size * 0.12 + bold, depth = size * 0.075, ring = Math.max(1.2, size * 0.05);   /* bold = extra weight (the original's letters are chunkier than the font) */
    g.save(); g.font = '700 ' + size + 'px ' + FONT; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.lineJoin = 'round'; g.lineCap = 'round';
    const each = (gg, fn) => items.forEach((p, i) => { gg.save(); gg.translate(p.x + p.w / 2, p.y); gg.rotate(p.rot || 0); fn(gg, p, i); gg.restore(); });
    // 1 · outer ring (the bright edge round the whole word) + glow
    each(g, (gg, p) => { gg.shadowColor = L.glow; gg.shadowBlur = size * 0.18; gg.lineWidth = (out + ring) * 2; gg.strokeStyle = L.rim[1]; gg.strokeText(p.ch, -p.w / 2, depth); gg.strokeText(p.ch, -p.w / 2, 0); });
    each(g, (gg, p) => { gg.lineWidth = (out + ring * 0.45) * 2; gg.strokeStyle = L.rim[0]; gg.globalAlpha = 0.9; gg.strokeText(p.ch, -p.w / 2, depth * 0.5); });
    // 2 · one dark outline for all letters
    each(g, (gg, p) => { gg.lineWidth = out * 2; gg.strokeStyle = '#0B1230'; gg.strokeText(p.ch, -p.w / 2, depth); gg.strokeText(p.ch, -p.w / 2, 0); });
    // 3 · extrusion
    each(g, (gg, p, i) => { const c = L.letters[p.c % L.letters.length]; for(let d = depth; d > 0; d -= Math.max(0.8, depth / 6)){ gg.fillStyle = shade(c[1], -0.42); gg.fillText(p.ch, -p.w / 2, d); } });
    // 4 · faces on their own layer, so the bevel / grid / shine stay inside the letters
    const cv = document.createElement('canvas'); cv.width = g.canvas.width; cv.height = g.canvas.height;
    const f = cv.getContext('2d'); f.setTransform(g.getTransform()); f.font = g.font; f.textBaseline = 'alphabetic'; f.textAlign = 'left'; f.lineJoin = 'round';
    each(f, (gg, p) => { const c = L.letters[p.c % L.letters.length], gr = gg.createLinearGradient(0, -size * 0.74, 0, 0);
      gr.addColorStop(0, c[0]); gr.addColorStop(0.5, c[1]); gr.addColorStop(1, shade(c[1], -0.16)); gg.fillStyle = gr; gg.strokeStyle = gr; gg.lineWidth = bold * 2; gg.strokeText(p.ch, -p.w / 2, 0); gg.fillText(p.ch, -p.w / 2, 0); });
    f.globalCompositeOperation = 'source-atop';
    // blueprint grid (faint, like the original's lines + scribbles)
    const step = size * 0.13, inv = f.getTransform().inverse(), tl = inv.transformPoint({x: 0, y: 0}), br = inv.transformPoint({x: cv.width, y: cv.height});
    f.strokeStyle = 'rgba(255,255,255,0.13)'; f.lineWidth = Math.max(0.5, size * 0.012); f.beginPath();
    for(let x = tl.x - (tl.x % step); x < br.x; x += step){ f.moveTo(x, tl.y); f.lineTo(x, br.y); }
    for(let y = tl.y - (tl.y % step); y < br.y; y += step){ f.moveTo(tl.x, y); f.lineTo(br.x, y); }
    f.stroke();
    // inner light bevel + darker lower edge
    each(f, (gg, p) => { gg.lineWidth = size * 0.05; gg.strokeStyle = 'rgba(255,255,255,0.3)'; gg.strokeText(p.ch, -p.w / 2, -size * 0.01); });
    each(f, (gg, p, i) => { const c = L.letters[p.c % L.letters.length]; gg.lineWidth = size * 0.05; gg.strokeStyle = shade(c[1], -0.3); gg.globalAlpha = 0.5; gg.strokeText(p.ch, -p.w / 2, size * 0.03); });
    each(f, (gg, p) => { gg.lineWidth = Math.max(0.6, size * 0.018); gg.strokeStyle = 'rgba(255,255,255,0.7)'; gg.strokeText(p.ch, -p.w / 2, -size * 0.02); });
    // glossy top shine
    each(f, (gg, p) => { gg.beginPath(); gg.ellipse(-p.w * 0.05, -size * 0.6, p.w * 0.5, size * 0.17, -0.2, 0, Math.PI * 2); gg.fillStyle = 'rgba(255,255,255,0.22)'; gg.fill(); });
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(cv, 0, 0); g.restore();
    g.restore();
  }
  function goggles(g, x, y, s){   // the original's goggles on the A
    g.save(); g.lineWidth = s * 0.22; g.strokeStyle = '#0B1230'; g.beginPath(); g.moveTo(x - s * 0.35, y); g.lineTo(x + s * 0.35, y); g.stroke();
    [-1, 1].forEach(k => { const ex = x + k * s * 0.95;
      g.beginPath(); g.arc(ex, y, s * 0.78, 0, Math.PI * 2); g.fillStyle = '#0B1230'; g.fill();
      g.beginPath(); g.arc(ex, y, s * 0.66, 0, Math.PI * 2); const gr = g.createLinearGradient(0, y - s, 0, y + s); gr.addColorStop(0, '#FFE680'); gr.addColorStop(1, '#F29A12'); g.fillStyle = gr; g.fill();
      g.beginPath(); g.arc(ex, y, s * 0.46, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.beginPath(); g.arc(ex + s * 0.1, y + s * 0.06, s * 0.24, 0, Math.PI * 2); g.fillStyle = '#0B1230'; g.fill();
      g.beginPath(); g.arc(ex + s * 0.02, y - s * 0.06, s * 0.08, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); });
    g.restore();
  }
  function oface(g, x, y, s){   // the cheeky face on the o: two eyes + little brows
    g.save(); g.lineCap = 'round';
    [-1, 1].forEach(k => { const ex = x + k * s * 0.62;
      g.beginPath(); g.ellipse(ex, y, s * 0.5, s * 0.6, 0, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.lineWidth = s * 0.16; g.strokeStyle = '#0B1230'; g.stroke();
      g.beginPath(); g.arc(ex + k * s * 0.08, y + s * 0.1, s * 0.24, 0, Math.PI * 2); g.fillStyle = '#0B1230'; g.fill();
      g.beginPath(); g.arc(ex + k * s * 0.02, y - s * 0.02, s * 0.08, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.beginPath(); g.moveTo(ex - s * 0.35, y - s * 0.95 + k * s * 0.05); g.quadraticCurveTo(ex, y - s * 1.25, ex + s * 0.38, y - s * 0.98 - k * s * 0.05); g.lineWidth = s * 0.2; g.stroke(); });
    g.restore();
  }
  function word(g, L, x0, base, size, maxW, opt){
    opt = opt || {};
    g.save(); g.font = '700 ' + size + 'px ' + FONT;
    const kern = -size * 0.02;
    let ws = [...WORD].map(ch => g.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0) + kern * (WORD.length - 1);
    const pad = size * 0.2, sc = Math.min(1, (maxW - pad * 2) / tot);
    if(sc < 1){ size *= sc; g.font = '700 ' + size + 'px ' + FONT; ws = ws.map(w => w * sc); tot *= sc; }
    let x = x0 + (maxW - tot) / 2;
    const items = [...WORD].map((ch, i) => { const p = {ch, c: i, x, y: base + (i === 0 || i === 7 ? size * 0.015 : 0), rot: [-0.03, 0, 0.02, -0.01, 0.015, -0.01, 0, 0.03][i], w: ws[i]}; x += ws[i] + kern * sc; return p; });
    g.restore();
    bubbly(g, L, items, size, opt);
    if(!opt.noEyes){
      const A = items[0], O = items[6];
      goggles(g, A.x + A.w * 0.5, A.y - size * 0.52, size * 0.135);
      oface(g, O.x + O.w * 0.5, O.y - size * 0.3, size * 0.11);
    }
    return {left: items[0].x, right: x};
  }
  function shade(hex, f){
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    const t = f < 0 ? 0 : 255, p = Math.abs(f);
    r = Math.round((t - r) * p + r); gg = Math.round((t - gg) * p + gg); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (gg << 8) + b).toString(16).slice(1);
  }
  const SYMS = [['+', 0.07, 0.2], ['7', 0.16, 0.08], ['÷', 0.9, 0.72], ['√', 0.95, 0.2], ['x²', 0.86, 0.1], ['3', 0.05, 0.62], ['−', 0.14, 0.86], ['=', 0.8, 0.9], ['5', 0.97, 0.52], ['π', 0.25, 0.94]];
  function paint(g, kind, W, H, look, RW){   /* kit: W, H = the kit box (units); RW = the real width in CSS px (decides the small-size details) */
    RW = RW || W; const L = typeof look === 'object' ? look : lk(look), small = RW < 220, RH = H * RW / W;
    g.clearRect(0, 0, W, H);
    if(kind === 'badge'){
      shield(g, L, W / 2, H * 0.06, W * 0.86, H * 0.9, {});
      const sz = W * 0.56; g.save(); g.font = '700 ' + sz + 'px ' + FONT; const aw = g.measureText('A').width; g.restore();
      bubbly(g, L, [{ch: 'A', c: 0, x: W / 2 - aw / 2, y: H * 0.66, rot: 0, w: aw}], sz, {});
      if(RW >= 60) goggles(g, W / 2, H * 0.66 - sz * 0.5, sz * 0.11);
      return;
    }
    if(kind === 'wide'){
      const sw = H * 0.78;
      shield(g, L, sw / 2 + H * 0.06, H * 0.05, sw, H * 0.9, {noTiles: RH < 44});
      word(g, L, sw + H * 0.2, H * 0.78, H * 0.78, W - sw - H * 0.28, {noEyes: RH < 34});
      return;
    }
    // main
    if(!small){
      gear(g, W * 0.2, H * 0.3, H * 0.13, L.gear[0], 0.3); gear(g, W * 0.82, H * 0.72, H * 0.15, L.gear[1], 0.1); gear(g, W * 0.74, H * 0.2, H * 0.08, L.gear[0], 0.6);
      g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
      SYMS.forEach(([s, fx, fy], i) => { const col = L.acc[i % L.acc.length]; g.font = '700 ' + (H * 0.085) + 'px ' + FONT; g.shadowColor = col; g.shadowBlur = H * 0.03; g.fillStyle = col; g.fillText(s, W * fx, H * fy); });
      g.restore();
    }
    const sw = H * 0.86;
    shield(g, L, W / 2, H * 0.03, sw, H * 0.93, {});
    word(g, L, W * 0.02, H * 0.6, H * 0.36, W * 0.96, {});
    const sp = small ? [[0.18, 0.2, 0.05], [0.84, 0.82, 0.045]] : [[0.12, 0.42, 0.04], [0.33, 0.12, 0.03], [0.7, 0.88, 0.035], [0.9, 0.36, 0.045], [0.62, 0.08, 0.028], [0.4, 0.86, 0.03]];
    sp.forEach(([fx, fy, fr], i) => star(g, W * fx, H * fy, H * fr, i % 2 ? '#FFFFFF' : L.acc[0]));
  }
  function pic(kind, look, px){
    kind = BOX[kind] ? kind : 'main'; look = LOOK[look] ? look : 'classic';
    const w = Math.max(16, Math.round((px || 300) / 4) * 4), dpr = Math.min(3, Math.max(1, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1));
    const key = kind + '|' + look + '|' + w + '|' + dpr;
    if(cache.has(key)) return cache.get(key);
    const h = Math.round(w * BOX[kind]);
    const c = document.createElement('canvas'); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.cssW = w; c.cssH = h;
    const g = c.getContext('2d'); g.scale(dpr, dpr); paint(g, kind, w, h, look);
    if(cache.size > 60) cache.clear();
    cache.set(key, c); return c;
  }
  function url(kind, look, px){ const c = pic(kind, look, px); if(!c.__url) c.__url = c.toDataURL('image/png'); return c.__url; }
  function draw(g, kind, x, y, px, look){ const c = pic(kind, look, px); g.drawImage(c, x, y, c.cssW, c.cssH); }
  return {pic, url, draw, clear: () => cache.clear(), BOX, LOOK, looks: Object.keys(LOOK), paint};
})();
  var BOX = { main: [900, 500], wide: [840, 200], badge: [430, 500] };
  // kit: 'wide' gets a 5 % margin (at 48 px the 4.2 : 1 strip is 11 px tall and the shield touched the corner pixels)
  return { BOX: BOX, LOOK: AL.LOOK, paint: function (g, kind, L, px) { var W = BOX[kind][0], H = BOX[kind][1], m = kind === 'wide' ? 0.05 : 0;
    g.save(); g.translate(W * m, H * m); g.scale(1 - 2 * m, 1 - 2 * m); AL.paint(g, kind, W, H, L, px * (1 - 2 * m)); g.restore(); } };
})());
// 🏷️ LOGO algebros END

// 🏷️ LOGO alignext START — 🔴 Alignext, drawn in code from Aowu's picture (gl-16, round 6). Glossy pills, pegs and balls lined up on neon diagonals,
// a light beam behind the big ball, dashed guide lines + dots, thin rounded neon word "Align" blue + "ext" pink → orange with a ↗ over the x.
// Looks = the game's board themes (Alignext.html THEMES: background + edge colour → backdrop, guide lines, glow).
GameLogos.add('alignext', (function () {
  var BOX = { scene: [1024, 572], main: [560, 470], wide: [860, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, ANG = -0.6;
  function mk(o) { var b = { bg: ['#123a7a', '#0a1f4a', '#050d26'], line: ['#ff9a3a', '#3ad8ff'], glow: '#3ab8ff', dark: '#0a1640',
    a: ['#d0faff', '#6ad4ff', '#2a8af0'], e: [['#ff9ad8', '#ff4aa8', '#e0208a'], ['#ffb08a', '#ff6a5a', '#f0403a'], ['#ffd08a', '#ff9a3a', '#f06a1a']] };
    for (var k in o) b[k] = o[k]; return b; }
  function th(bg, edge, extra) { var o = { bg: [bg[2], bg[1], bg[0]], line: [edge, edge], glow: edge }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var LOOK = { classic: mk({}),
    dino: th(['#14432A', '#4E9A4A', '#9BD06A'], '#9BD06A'), sea: th(['#03224F', '#0F6DB0', '#3FB8E8'], '#FFD1C7'), dance: th(['#12051F', '#3A0E5C', '#7A1C8C'], '#FF3DA5'),
    robot: th(['#081128', '#16305E', '#2C5A9A'], '#18E7FF'), space: th(['#02030F', '#10144A', '#2B2C7A'], '#B9C6FF'), sky: th(['#5BB4EE', '#A8DBFA', '#EAF7FF'], '#E2B13C', { dark: '#2B1F45' }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* glossy pieces (one light from the upper left) */
  function ball(g, T, x, y, r, c) { g.save(); g.shadowColor = c; g.shadowBlur = r * 0.9; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.35, y - r * 0.4, r * 0.1, r * 1.15, [0, sh(c, 0.7), 0.35, c, 1, sh(c, -0.45)]); g.fill(); g.restore();
    g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.42, r * 0.34, r * 0.18, -0.5, 0, TAU); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill(); }
  function pill(g, T, x, y, len, w, c1, c2, rot) {   // two-tone capsule along the diagonal
    g.save(); g.translate(x, y); g.rotate(rot == null ? ANG : rot); var r = w / 2;
    function path() { g.beginPath(); g.moveTo(-len / 2 + r, -r); g.lineTo(len / 2 - r, -r); g.arc(len / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2); g.lineTo(-len / 2 + r, r); g.arc(-len / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5); g.closePath(); }
    g.save(); g.shadowColor = c2 || c1; g.shadowBlur = w * 0.7; path(); g.fillStyle = c1; g.fill(); g.restore();
    g.save(); path(); g.clip(); if (c2) { g.fillStyle = c2; g.fillRect(0, -w, len, w * 2); }
    g.fillStyle = T.lin(g, 0, -r, 0, r, [0, 'rgba(255,255,255,.55)', 0.35, 'rgba(255,255,255,.08)', 0.75, 'rgba(0,0,40,.12)', 1, 'rgba(0,0,40,.4)']); g.fillRect(-len, -w, len * 2, w * 2);
    g.fillStyle = 'rgba(255,255,255,.75)'; GameLogos.tools.rr(g, -len / 2 + r * 0.7, -r * 0.72, len - r * 1.4, r * 0.32, r * 0.16); g.fill(); g.restore(); g.restore();
  }
  function peg(g, T, x, y, r, h, c) {   // a short cylinder seen from above-front
    g.save(); g.shadowColor = c; g.shadowBlur = r * 0.8; g.beginPath(); g.ellipse(x, y + h / 2, r, r * 0.42, 0, 0, Math.PI); g.lineTo(x - r, y - h / 2); g.ellipse(x, y - h / 2, r, r * 0.42, 0, Math.PI, 0, true); g.closePath();
    g.fillStyle = T.lin(g, x - r, 0, x + r, 0, [0, sh(c, 0.25), 0.4, c, 1, sh(c, -0.4)]); g.fill(); g.restore();
    g.beginPath(); g.ellipse(x, y - h / 2, r, r * 0.42, 0, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.3, y - h / 2 - r * 0.1, 1, r, [0, sh(c, 0.75), 1, sh(c, 0.2)]); g.fill();
    g.beginPath(); g.ellipse(x - r * 0.62, y + h * 0.05, r * 0.12, h * 0.32, 0, 0, TAU); g.fillStyle = 'rgba(255,255,255,.5)'; g.fill();
  }
  function guides(g, T, L) {   // dashed neon diagonals + dots
    g.save(); g.lineWidth = 2.5; g.setLineDash([7, 8]); g.lineCap = 'round';
    [[360, 300, 520, 186, 0], [400, 356, 600, 214, 1], [470, 360, 640, 240, 0], [416, 232, 560, 130, 1], [520, 306, 668, 196, 0]].forEach(function (l) { g.strokeStyle = L.line[l[4]]; g.shadowColor = L.line[l[4]]; g.shadowBlur = 8; g.globalAlpha = 0.75; g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    g.setLineDash([]); g.globalAlpha = 1; var r = T.rng(12); for (var i = 0; i < 34; i++) { var t = r(), x = 370 + t * 300 + (r() - 0.5) * 90, y = 330 - t * 220 + (r() - 0.5) * 90; g.fillStyle = [L.line[0], L.line[1], '#ff5ad8'][i % 3]; g.globalAlpha = 0.5 + r() * 0.5; g.beginPath(); g.arc(x, y, 1.5 + r() * 2.5, 0, TAU); g.fill(); } g.restore();
  }
  function emblem(g, T, L, full) {
    g.save(); g.translate(512, 222); g.scale(0.88, 0.88); g.translate(-512, -222);
    guides(g, T, L);
    // light beam behind the big ball, down the main diagonal
    g.save(); g.translate(616, 128); g.rotate(2.41); g.fillStyle = T.lin(g, 0, 0, 170, 0, [0, 'rgba(120,220,255,.55)', 1, 'rgba(120,220,255,0)']); g.beginPath(); g.moveTo(0, -36); g.lineTo(170, -22); g.lineTo(170, 22); g.lineTo(0, 36); g.closePath(); g.fill(); g.restore();
    // the thread joining the main diagonal (as pictured)
    g.save(); g.strokeStyle = 'rgba(255,190,140,.8)'; g.lineWidth = 3; g.shadowColor = '#ffb07a'; g.shadowBlur = 8; g.beginPath(); g.moveTo(405, 316); g.lineTo(616, 128); g.stroke(); g.restore();
    pill(g, T, 446, 194, 128, 42, '#3ab8ff', null); pill(g, T, 420, 252, 104, 42, '#ff8a2e', '#ff4aa8');
    pill(g, T, 524, 300, 104, 40, '#ff4a6a', '#3a9aff'); pill(g, T, 566, 262, 84, 38, '#ff9a2e', '#3ab8ff'); pill(g, T, 612, 212, 70, 34, '#ff5a7a', null);
    ball(g, T, 405, 316, 30, '#2a9aff'); ball(g, T, 460, 281, 27, '#e04ad8'); peg(g, T, 512, 234, 30, 30, '#2ad8f5'); peg(g, T, 563, 180, 32, 34, '#ff8a3a'); ball(g, T, 616, 128, 36, '#2ad8ff');
    if (full) { T.spark(g, 556, 116, 13, '#ff7ad8', 0.95); T.spark(g, 656, 168, 12, '#ffb84a', 0.95); T.spark(g, 586, 88, 7, '#ffd23a', 0.9); g.save(); g.strokeStyle = '#ff8a3a'; g.lineWidth = 4; g.lineCap = 'round'; [[630, 84, 634, 70], [652, 98, 664, 88], [660, 122, 674, 120]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); }); g.restore(); }
    g.restore();
  }
  /* thin rounded neon word */
  function words(g, T, L, cx, base, size) {
    var s = size, w = { weight: 600, spacing: s * 0.01, dark: L.dark, outline: s * 0.05, depth: 0, glow: null, inner: null };
    g.save(); g.font = '600 ' + s + 'px ' + T.FONT; var wa = g.measureText('Align').width + 4 * s * 0.01, we = g.measureText('ext').width + 2 * s * 0.01; g.restore();
    var x0 = cx - (wa + we) / 2;
    var A = Object.assign({}, w, { face: function (j) { var k = j / 4; return [0, L.a[0], 0.5, k < 0.5 ? L.a[1] : L.a[2], 1, L.a[2]]; }, glow: L.glow, glowN: 3, glowBlur: 0.4 });
    var E = Object.assign({}, w, { face: function (j) { var c = L.e[j]; return [0, c[0], 0.5, c[1], 1, c[2]]; }, glow: '#ff6ab8', glowN: 3, glowBlur: 0.4 });
    T.word(g, 'Align', x0 + wa / 2, base, s, A); T.gloss(g, 'Align', x0 + wa / 2, base, s, A, 0.4);
    T.word(g, 'ext', x0 + wa + we / 2, base, s, E); T.gloss(g, 'ext', x0 + wa + we / 2, base, s, E, 0.4);
    // the little ↗ over the x
    g.save(); g.font = '600 ' + s + 'px ' + T.FONT; var xx = x0 + wa + g.measureText('e').width + g.measureText('x').width * 0.55; g.restore();
    g.save(); g.translate(xx, base - s * 0.78); g.rotate(-0.75); g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = '#3ad8ff'; g.shadowBlur = s * 0.12;
    g.strokeStyle = T.lin(g, -s * 0.22, 0, s * 0.22, 0, [0, '#ff8a3a', 1, '#3ad8ff']); g.lineWidth = s * 0.07; g.beginPath(); g.moveTo(-s * 0.22, 0); g.lineTo(s * 0.18, 0); g.stroke();
    g.beginPath(); g.moveTo(s * 0.06, -s * 0.11); g.lineTo(s * 0.2, 0); g.lineTo(s * 0.06, s * 0.11); g.stroke(); g.restore();
  }
  function backdrop(g, T, L, x, y, w, h) { g.fillStyle = T.rad(g, x + w / 2, y + h * 0.4, 20, Math.max(w, h) * 0.7, [0, L.bg[0], 0.5, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { backdrop(g, T, L, 0, 0, 1024, 572); emblem(g, T, L, true); words(g, T, L, 512, 460, 112); return; }
    if (kind === 'main') { g.translate(-232, -40); emblem(g, T, L, px >= 220); words(g, T, L, 512, 460, 112); return; }
    if (kind === 'wide') { g.save(); g.translate(104, 100); g.scale(0.56, 0.56); g.translate(-512, -222); emblem(g, T, L, false); g.restore(); words(g, T, L, 530, 138, 112); return; }
    if (kind === 'badge') {
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.clip(); backdrop(g, T, L, 14, 14, 372, 372); g.restore();
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.lineWidth = 6; g.strokeStyle = L.glow; g.shadowColor = L.glow; g.shadowBlur = 14; g.stroke(); g.restore();
      if (px >= 90) { g.translate(200, 196); g.scale(0.66, 0.66); g.translate(-512, -290); emblem(g, T, L, false); words(g, T, L, 512, 460, 112); }
      else { g.translate(200, 200); g.scale(1.05, 1.05); g.translate(-512, -222); emblem(g, T, L, false); }
      return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO alignext END

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

// 🏷️ LOGO artifactory START — 🏭 Artifactory, drawn in code from Aowu's picture (gl-29, round 11). A rounded-square workshop icon in a gold (left) +
// steel-blue (right) frame with gears and gem studs at the corners: a stone forge with fire, a crystal barrel, a tool shelf, a gnome tinkerer (pointy
// hat, goggles, white beard, hammer up) beside a big wooden crate bursting with light — a rainbow-swirl gear, crystals, planks, a scroll, a blueprint,
// a gold arrow, stars; carved fantasy lettering "ARTI" gold + "FACTORY" teal (T.serif — no web font) whose T is a sword and whose Y ends in a curl;
// gears, crystals and blueprints round the bottom; the blurred workshop island behind (scene). One look.
GameLogos.add('artifactory', (function () {
  var BOX = { scene: [1024, 572], main: [600, 600], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, IX = 252, IY = 28, IW = 520, IH = 517, ICX = 512, ICY = 286, INK = '#1a0e06';
  var LOOK = { classic: { gold: ['#fff2b0', '#f0c040', '#a86a10'], teal: ['#d8fff8', '#38d8d0', '#0a6a7a'], steel: ['#d8ecff', '#5a8ad0', '#1a3a7a'], wall: ['#3a4a6a', '#141a2c'] } };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* ---------- blurred workshop behind (scene) ---------- */
  function back(g, T) {
    g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, '#3a2a24', 0.45, '#2a3a2a', 1, '#24301e']); g.fillRect(0, 0, 1024, 572);
    function blob(x, y, rx, ry, c, a) { g.save(); g.globalAlpha = a; g.fillStyle = T.rad(g, x, y, 2, Math.max(rx, ry), [0, c, 0.3, c, 1, 'rgba(0,0,0,0)']); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.restore(); }
    blob(110, 120, 140, 160, '#5a5a66', 0.6); blob(140, 190, 70, 70, '#ff8a2a', 0.85); blob(140, 190, 34, 34, '#ffe08a', 0.9); blob(60, 300, 200, 60, '#5a3a24', 0.7); blob(170, 340, 40, 20, '#3ab8ff', 0.6); blob(110, 380, 30, 16, '#c86aff', 0.5);
    blob(90, 470, 120, 70, '#2a5a3a', 0.7); blob(200, 520, 90, 40, '#4a3a2a', 0.6); blob(30, 90, 30, 40, '#c86aff', 0.5);
    blob(900, 60, 160, 90, '#3a6a3a', 0.7); blob(980, 200, 80, 140, '#2a5a2a', 0.8); blob(830, 190, 70, 60, '#7a4a2a', 0.8); blob(840, 200, 20, 20, '#ffd23a', 0.6); blob(905, 240, 60, 70, '#6a6a7a', 0.8); blob(905, 250, 20, 20, '#c86aff', 0.8);
    blob(880, 390, 70, 80, '#6a6a7a', 0.8); blob(880, 400, 22, 22, '#ffa83a', 0.8); blob(990, 330, 60, 50, '#7a4a2a', 0.7); blob(960, 500, 80, 60, '#2a5a2a', 0.8); blob(820, 480, 60, 40, '#3a6a3a', 0.6);
    var r = T.rng(19); g.save(); g.globalCompositeOperation = 'lighter'; for (var i = 0; i < 30; i++) { var x = r() < 0.5 ? r() * 240 : 790 + r() * 234, y = r() * 572; g.fillStyle = T.rad(g, x, y, 0, 6, [0, 'rgba(255,220,150,.7)', 1, 'rgba(0,0,0,0)']); g.fillRect(x - 6, y - 6, 12, 12); } g.restore();
  }
  /* ---------- the icon ---------- */
  function shape(g, T) { T.rr(g, IX, IY, IW, IH, 66); }
  function frame(g, T, L, full) {
    g.save(); g.lineWidth = 18; shape(g, T); g.shadowColor = 'rgba(255,200,90,.8)'; g.shadowBlur = 22;
    g.save(); g.beginPath(); g.rect(0, 0, ICX, 572); g.clip(); shape(g, T); g.strokeStyle = T.lin(g, IX, IY, IX, IY + IH, [0, L.gold[0], 0.4, L.gold[1], 1, L.gold[2]]); g.stroke(); g.restore();
    g.shadowColor = 'rgba(90,170,255,.7)'; g.save(); g.beginPath(); g.rect(ICX, 0, 600, 572); g.clip(); shape(g, T); g.strokeStyle = T.lin(g, 0, IY, 0, IY + IH, [0, L.steel[0], 0.4, L.steel[1], 1, L.steel[2]]); g.stroke(); g.restore();
    g.shadowBlur = 0; g.lineWidth = 3; g.strokeStyle = INK; T.rr(g, IX - 9, IY - 9, IW + 18, IH + 18, 74); g.stroke(); T.rr(g, IX + 9, IY + 9, IW - 18, IH - 18, 58); g.stroke();
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.6)'; T.rr(g, IX - 4, IY - 4, IW + 8, IH + 8, 70); g.stroke();
    g.fillStyle = '#fff6c8'; [[ICX, IY - 9], [ICX, IY + IH + 9]].forEach(function (p) { g.fillRect(p[0] - 2, p[1] - 9, 4, 18); }); g.restore();
    [[IX + 26, IY + 46, L.gold, '#2ad8c8', 0], [IX + IW - 26, IY + 44, L.steel, '#2ad8c8', 1], [IX + 30, IY + IH - 40, L.gold, '#3a8aff', 2], [IX + IW - 28, IY + IH - 42, L.steel, '#c86aff', 3]].forEach(function (c) {
      T.gear(g, c[0] + (c[4] % 2 ? 12 : -12), c[1] + (c[4] < 2 ? -8 : 8), 34, 10, c[4] * 0.3, T.lin(g, c[0] - 34, c[1] - 34, c[0] + 34, c[1] + 34, [0, c[2][0], 0.5, c[2][1], 1, c[2][2]]), INK);
      g.fillStyle = T.rad(g, c[0] - 4, c[1] - 4, 1, 13, [0, '#ffffff', 0.4, c[3], 1, sh(c[3], -0.5)]); g.beginPath(); g.arc(c[0], c[1], 12, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); });
  }
  function wall(g, T, L) {
    g.fillStyle = T.lin(g, 0, IY, 0, IY + IH, [0, L.wall[0], 1, L.wall[1]]); g.fillRect(IX, IY, IW, IH);
    g.strokeStyle = 'rgba(10,14,28,.55)'; g.lineWidth = 2; for (var y = IY + 30, row = 0; y < IY + 300; y += 28, row++) { g.beginPath(); g.moveTo(IX, y); g.lineTo(IX + IW, y); g.stroke(); for (var x = IX + (row % 2) * 30; x < IX + IW; x += 60) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 28); g.stroke(); } }
    g.fillStyle = T.lin(g, 0, IY + 300, 0, IY + IH, [0, '#3a2a22', 1, '#1a120c']); g.fillRect(IX, IY + 300, IW, IH - 300);
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 520, 250, 10, 300, [0, 'rgba(255,220,150,.55)', 0.5, 'rgba(160,100,255,.2)', 1, 'rgba(0,0,0,0)']); g.fillRect(IX, IY, IW, IH); g.restore();
  }
  function forge(g, T) {
    g.save(); g.fillStyle = '#5a5e6a'; g.fillRect(300, 40, 46, 90); g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(300, 40, 46, 90);
    g.beginPath(); g.moveTo(268, 260); g.lineTo(268, 170); g.quadraticCurveTo(323, 100, 378, 170); g.lineTo(378, 260); g.closePath(); g.fillStyle = T.lin(g, 268, 0, 378, 0, [0, '#7a7e8a', 0.5, '#5a5e6a', 1, '#3a3e4a']); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(20,20,30,.6)'; g.lineWidth = 1.5; [[268, 200, 378, 200], [268, 230, 378, 230], [300, 170, 300, 200], [340, 200, 340, 230], [310, 230, 310, 260]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    g.beginPath(); g.moveTo(290, 250); g.lineTo(290, 196); g.quadraticCurveTo(323, 150, 356, 196); g.lineTo(356, 250); g.closePath(); g.fillStyle = '#1a0a04'; g.fill();
    g.save(); g.clip(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 323, 236, 2, 60, [0, '#fff4c0', 0.3, '#ffb02a', 0.7, '#ff4a0a', 1, 'rgba(120,20,0,.4)']); g.fillRect(286, 150, 74, 104);
    [[310, 248, 14, 30], [326, 248, 16, 42], [342, 248, 12, 28]].forEach(function (f) { g.fillStyle = T.lin(g, 0, f[1] - f[3], 0, f[1], [0, 'rgba(255,240,180,.9)', 1, 'rgba(255,120,20,.6)']); g.beginPath(); g.moveTo(f[0] - f[2] / 2, f[1]); g.quadraticCurveTo(f[0] - f[2] / 2, f[1] - f[3] * 0.6, f[0], f[1] - f[3]); g.quadraticCurveTo(f[0] + f[2] / 2, f[1] - f[3] * 0.6, f[0] + f[2] / 2, f[1]); g.fill(); }); g.restore();
    g.fillStyle = 'rgba(255,170,60,.35)'; g.beginPath(); g.ellipse(323, 262, 70, 12, 0, 0, TAU); g.fill(); g.restore();
  }
  function barrel(g, T) {
    g.save(); g.fillStyle = T.lin(g, 270, 0, 336, 0, [0, '#5a3418', 0.45, '#a8683a', 1, '#4a2a10']); g.beginPath(); g.moveTo(272, 286); g.quadraticCurveTo(266, 316, 274, 344); g.lineTo(334, 344); g.quadraticCurveTo(342, 316, 336, 286); g.closePath(); g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = '#3a3a44'; g.lineWidth = 4; [298, 330].forEach(function (y) { g.beginPath(); g.moveTo(270, y); g.lineTo(338, y); g.stroke(); }); g.fillStyle = '#2a1a0a'; g.beginPath(); g.ellipse(304, 286, 32, 7, 0, 0, TAU); g.fill();
    crystal(g, T, 294, 286, 12, 34, -0.3, '#c86aff'); crystal(g, T, 310, 288, 10, 26, 0.25, '#e8a0ff'); crystal(g, T, 318, 286, 8, 20, 0.5, '#a84aff'); g.restore();
  }
  function crystal(g, T, x, y, w, h, rot, col) {
    g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2, -h * 0.7); g.lineTo(0, -h); g.lineTo(w / 2, -h * 0.7); g.lineTo(w / 2, 0); g.closePath();
    g.fillStyle = T.lin(g, -w / 2, 0, w / 2, 0, [0, sh(col, 0.5), 0.5, col, 1, sh(col, -0.45)]); g.shadowColor = col; g.shadowBlur = 8; g.fill(); g.shadowBlur = 0; g.lineWidth = 1.6; g.strokeStyle = sh(col, -0.65); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(-w / 2 + 2, -h * 0.68); g.lineTo(0, -h + 3); g.lineTo(-1, -h * 0.4); g.closePath(); g.fill(); g.restore();
  }
  function shelf(g, T) {
    g.save(); g.fillStyle = '#6a4220'; g.fillRect(690, 268, 76, 10); g.fillRect(700, 278, 8, 40); g.fillRect(752, 278, 8, 40); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(690, 268, 76, 10);
    g.fillStyle = '#5a6aa8'; T.rr(g, 708, 230, 26, 38, 5); g.fill(); g.stroke(); g.strokeStyle = '#c8c8d0'; g.lineWidth = 3; [[714, 230, 708, 206], [722, 230, 726, 200], [730, 230, 740, 208]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    crystal(g, T, 748, 268, 10, 24, 0.2, '#3ad8ff'); g.restore();
  }
  function chevrons(g, T, x, y, n, s) { g.save(); g.strokeStyle = '#ffd23a'; g.shadowColor = '#ffb02a'; g.shadowBlur = 8; g.lineWidth = 3.5 * s; g.lineCap = 'round'; g.lineJoin = 'round'; for (var i = 0; i < n; i++) { var yy = y - i * 13 * s; g.globalAlpha = 1 - i * 0.18; g.beginPath(); g.moveTo(x - 8 * s, yy + 6 * s); g.lineTo(x, yy - 2 * s); g.lineTo(x + 8 * s, yy + 6 * s); g.stroke(); } g.restore(); }
  function plank(g, T, x, y, w, h, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = T.lin(g, 0, -h / 2, 0, h / 2, [0, '#d8964a', 1, '#8a5420']); g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = 2; g.strokeStyle = INK; g.strokeRect(-w / 2, -h / 2, w, h); g.strokeStyle = 'rgba(80,40,10,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-w / 2 + 4, -h * 0.1); g.lineTo(w / 2 - 6, -h * 0.15); g.stroke(); g.restore(); }
  function blueprint(g, T, x, y, w, h, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2 + 4); g.lineTo(w / 2 - 3, h / 2); g.lineTo(-w / 2 + 3, h / 2 - 3); g.closePath(); g.fillStyle = T.lin(g, -w / 2, 0, w / 2, 0, [0, '#4a8aff', 1, '#2a5ad0']); g.fill(); g.lineWidth = 2; g.strokeStyle = '#0a2a6a'; g.stroke();
    g.strokeStyle = 'rgba(220,240,255,.75)'; g.lineWidth = 1; for (var i = 1; i < 5; i++) { g.beginPath(); g.moveTo(-w / 2 + i * w / 5, -h / 2 + 3); g.lineTo(-w / 2 + i * w / 5, h / 2 - 3); g.stroke(); } g.beginPath(); g.rect(-w * 0.25, -h * 0.25, w * 0.4, h * 0.4); g.moveTo(w * 0.15, -h * 0.05); g.arc(w * 0.15, -h * 0.05, h * 0.15, 0, TAU); g.stroke(); g.restore(); }
  function crate(g, T) {
    g.save(); g.fillStyle = T.lin(g, 0, 290, 0, 370, [0, '#a8683a', 1, '#5a3418']); g.beginPath(); g.moveTo(392, 300); g.lineTo(636, 300); g.lineTo(624, 372); g.lineTo(404, 372); g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = 'rgba(60,30,10,.7)'; g.lineWidth = 2; [318, 336, 354].forEach(function (y) { g.beginPath(); g.moveTo(396, y); g.lineTo(632, y); g.stroke(); });
    g.beginPath(); g.moveTo(386, 300); g.lineTo(412, 276); g.lineTo(616, 276); g.lineTo(642, 300); g.closePath(); g.fillStyle = '#1a0e1e'; g.fill(); g.stroke();
    g.save(); g.clip(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 514, 288, 4, 120, [0, '#ffffff', 0.25, '#fff0a0', 0.6, 'rgba(200,120,255,.6)', 1, 'rgba(0,0,0,0)']); g.fillRect(380, 260, 270, 50); g.restore();
    g.fillStyle = '#4a4e5a'; [[392, 300], [636, 300], [404, 372], [624, 372]].forEach(function (p) { g.beginPath(); g.moveTo(p[0] - 10, p[1] - 8); g.lineTo(p[0] + 10, p[1] - 8); g.lineTo(p[0] + 10, p[1] + 8); g.lineTo(p[0] - 10, p[1] + 8); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#c8c8d0'; g.beginPath(); g.arc(p[0], p[1], 2.5, 0, TAU); g.fill(); g.fillStyle = '#4a4e5a'; });
    crystal(g, T, 446, 372, 10, 26, -0.2, '#c86aff'); crystal(g, T, 600, 368, 9, 22, 0.3, '#3ad8ff'); g.restore();
  }
  function burst(g, T, full) {
    g.save(); g.globalCompositeOperation = 'lighter';
    var r = T.rng(77); for (var i = 0; i < (full ? 26 : 14); i++) { var a = -Math.PI / 2 + (r() - 0.5) * 2.2, L = 120 + r() * 160, wd = 0.03 + r() * 0.05; g.globalAlpha = 0.25 + r() * 0.35; g.fillStyle = T.rad(g, 514, 284, 6, L, [0, ['rgba(255,240,180,1)', 'rgba(200,140,255,1)', 'rgba(120,230,255,1)'][i % 3], 1, 'rgba(0,0,0,0)']); g.beginPath(); g.moveTo(514, 284); g.arc(514, 284, L, a - wd, a + wd); g.closePath(); g.fill(); }
    g.globalAlpha = 1; g.fillStyle = T.rad(g, 514, 270, 4, 110, [0, 'rgba(255,250,220,.9)', 0.4, 'rgba(255,200,120,.35)', 1, 'rgba(0,0,0,0)']); g.fillRect(400, 160, 230, 140); g.restore();
    // the rainbow swirl gear
    var gx = 548, gy = 148; T.gear(g, gx, gy, 52, 12, 0.2, T.lin(g, gx - 50, gy - 50, gx + 50, gy + 50, [0, '#fff2b0', 0.5, '#f0c040', 1, '#a86a10']), INK);
    g.save(); g.lineCap = 'round'; ['#ff5a5a', '#ffb02a', '#7aff6a', '#3ad8ff', '#a86aff'].forEach(function (c, k) { g.strokeStyle = c; g.lineWidth = 5.5; g.beginPath(); for (var t = 0; t <= 1; t += 0.03) { var a = k * 1.2 + t * 6.5, rr = 4 + t * 26; g[t ? 'lineTo' : 'moveTo'](gx + Math.cos(a) * rr, gy + Math.sin(a) * rr); } g.stroke(); }); g.restore();
    g.save(); g.lineCap = 'round'; g.strokeStyle = '#3ac8a0'; g.lineWidth = 14; g.beginPath(); g.moveTo(530, 268); g.bezierCurveTo(470, 240, 520, 200, 548, 214); g.bezierCurveTo(580, 230, 560, 260, 540, 250); g.stroke(); g.strokeStyle = '#a8ffe0'; g.lineWidth = 4; g.stroke(); g.restore();
    crystal(g, T, 588, 128, 14, 48, 0.35, '#c86aff'); crystal(g, T, 612, 140, 11, 36, 0.7, '#3ad8ff'); crystal(g, T, 606, 104, 10, 34, 0.15, '#e88aff');
    plank(g, T, 414, 120, 48, 14, 0.7); plank(g, T, 592, 246, 50, 14, -0.4); if (full) plank(g, T, 470, 100, 36, 11, -0.4);
    g.save(); g.translate(580, 190); g.rotate(-0.2); g.fillStyle = '#f4e0b0'; g.fillRect(-26, -12, 52, 24); g.fillStyle = '#d8b878'; g.beginPath(); g.ellipse(-26, 0, 7, 12, 0, 0, TAU); g.ellipse(26, 0, 7, 12, 0, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = '#6a4a1a'; g.strokeRect(-26, -12, 52, 24); g.restore();
    blueprint(g, T, 650, 244, 60, 44, 0.2);
    g.save(); g.lineCap = 'round'; g.shadowColor = '#ffd23a'; g.shadowBlur = 12; g.strokeStyle = T.lin(g, 590, 210, 652, 74, [0, 'rgba(255,210,60,0)', 0.4, '#ffd23a', 1, '#fff2a0']); g.lineWidth = 10; g.beginPath(); g.moveTo(580, 220); g.lineTo(646, 82); g.stroke();
    g.translate(650, 74); g.rotate(Math.atan2(-138, 66)); g.fillStyle = '#ffe070'; g.beginPath(); g.moveTo(16, 0); g.lineTo(-10, -14); g.lineTo(-10, 14); g.closePath(); g.fill(); g.restore();
    if (full) { g.save(); g.translate(640, 150); g.rotate(-0.5); g.fillStyle = T.lin(g, 0, -6, 0, 6, [0, '#e8eef8', 1, '#7a8aa0']); g.fillRect(-28, -6, 56, 12); g.lineWidth = 2; g.strokeStyle = INK; g.strokeRect(-28, -6, 56, 12); g.restore(); }
    [[486, 82, 16, '#ffd23a'], [452, 150, 10, '#ffe08a'], [662, 196, 9, '#ffd23a']].forEach(function (s) { g.fillStyle = s[3]; g.strokeStyle = '#7a3a00'; g.lineWidth = 1.5; T.star(g, s[0], s[1], s[2], s[2] * 0.45); g.fill(); g.stroke(); });
    [[618, 74, 12, '#ffffff'], [380, 140, 12, '#e8a0ff'], [690, 120, 10, '#c8fcff'], [520, 60, 9, '#fff6c8']].forEach(function (s) { T.spark(g, s[0], s[1], s[2], s[3], 1); });
  }
  function gnome(g, T) {   // one silhouette, one rim: hat + goggles, white beard, blue tunic, belt, hammer raised in his right hand, left fist up
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    function out(path, fill, w) { path(); g.lineWidth = w || 3; g.strokeStyle = INK; g.stroke(); g.fillStyle = fill; path(); g.fill(); }
    // hammer + right arm (behind)
    g.save(); g.translate(394, 190); g.rotate(-0.5); out(function () { g.beginPath(); g.rect(-3, -6, 6, 46); }, '#8a5a2a'); out(function () { T.rr(g, -16, -22, 32, 18, 4); }, T.lin(g, 0, -22, 0, -4, [0, '#d8dce4', 1, '#6a7280'])); g.restore();
    out(function () { g.beginPath(); g.moveTo(420, 232); g.quadraticCurveTo(398, 222, 398, 200); g.lineTo(412, 196); g.quadraticCurveTo(414, 214, 428, 222); g.closePath(); }, '#3a6ad0');
    out(function () { g.beginPath(); g.arc(404, 196, 8, 0, TAU); }, '#f0b088');
    // legs + boots
    out(function () { g.beginPath(); g.moveTo(430, 262); g.lineTo(426, 282); g.lineTo(446, 282); g.lineTo(446, 262); g.closePath(); g.moveTo(452, 262); g.lineTo(454, 282); g.lineTo(474, 282); g.lineTo(468, 262); g.closePath(); }, '#5a3a8a');
    out(function () { g.beginPath(); g.ellipse(432, 284, 13, 6, 0, 0, TAU); g.moveTo(482, 284); g.ellipse(468, 284, 13, 6, 0, 0, TAU); }, '#6a3a1a');
    // body
    out(function () { g.beginPath(); g.moveTo(424, 214); g.quadraticCurveTo(450, 200, 476, 214); g.quadraticCurveTo(486, 240, 478, 266); g.lineTo(420, 266); g.quadraticCurveTo(414, 240, 424, 214); g.closePath(); }, T.lin(g, 420, 210, 480, 266, [0, '#5a8af0', 1, '#2a4aa8']));
    g.fillStyle = '#7a4a1a'; g.fillRect(419, 246, 62, 9); g.fillStyle = '#ffd23a'; g.fillRect(445, 245, 10, 11); g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(445, 245, 10, 11);
    // left arm up, fist
    out(function () { g.beginPath(); g.moveTo(474, 220); g.quadraticCurveTo(496, 214, 500, 192); g.lineTo(488, 188); g.quadraticCurveTo(486, 204, 470, 210); g.closePath(); }, '#3a6ad0');
    out(function () { g.beginPath(); g.arc(495, 184, 8, 0, TAU); }, '#f0b088');
    // head, beard, nose, hat, goggles
    out(function () { g.beginPath(); g.arc(450, 186, 20, 0, TAU); }, '#f4c098');
    out(function () { g.beginPath(); g.moveTo(430, 186); g.quadraticCurveTo(428, 222, 450, 236); g.quadraticCurveTo(472, 222, 470, 186); g.quadraticCurveTo(460, 200, 450, 198); g.quadraticCurveTo(440, 200, 430, 186); g.closePath(); }, T.lin(g, 0, 186, 0, 236, [0, '#ffffff', 1, '#c8ccd8']));
    out(function () { g.beginPath(); g.arc(451, 192, 5.5, 0, TAU); }, '#ff8a7a', 2);
    out(function () { g.beginPath(); g.moveTo(426, 176); g.quadraticCurveTo(436, 132, 470, 118); g.quadraticCurveTo(462, 140, 476, 176); g.quadraticCurveTo(450, 168, 426, 176); g.closePath(); }, T.lin(g, 430, 120, 476, 176, [0, '#5a7af0', 1, '#1a3a9a']));
    g.fillStyle = 'rgba(255,255,255,.85)'; [[448, 150], [458, 136], [440, 162]].forEach(function (s) { T.star(g, s[0], s[1], 3.5, 1.5); g.fill(); });
    [[440, 170], [460, 170]].forEach(function (e) { out(function () { g.beginPath(); g.arc(e[0], e[1], 7.5, 0, TAU); }, '#c88a3a', 2.5); g.fillStyle = T.rad(g, e[0] - 2, e[1] - 2, 1, 6, [0, '#e8ffff', 1, '#3ab8c8']); g.beginPath(); g.arc(e[0], e[1], 5, 0, TAU); g.fill(); });
    g.fillStyle = INK; [[443, 184], [457, 184]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 2.2, 0, TAU); g.fill(); });
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(450, 200, 6, 0.3, Math.PI - 0.3); g.stroke();
    g.restore();
  }
  function bottom(g, T, full) {
    T.gear(g, 300, 380, 40, 11, 0.1, T.lin(g, 260, 340, 340, 420, [0, '#d8dce4', 1, '#5a6270']), INK); T.gear(g, 344, 420, 26, 9, 0.4, T.lin(g, 320, 400, 370, 450, [0, '#fff2b0', 1, '#a86a10']), INK);
    T.gear(g, 718, 390, 30, 10, 0.3, T.lin(g, 690, 360, 750, 420, [0, '#d8dce4', 1, '#5a6270']), INK);
    blueprint(g, T, 550, 502, 82, 50, -0.12); if (full) blueprint(g, T, 360, 500, 60, 40, 0.25);
    plank(g, T, 470, 500, 60, 15, -0.3); crystal(g, T, 420, 486, 13, 34, -0.3, '#ffd23a'); crystal(g, T, 630, 512, 13, 34, 0.25, '#c86aff');
    chevrons(g, T, 362, 290, 3, 1); chevrons(g, T, 724, 168, 3, 1); if (full) { chevrons(g, T, 734, 300, 2, 0.9); chevrons(g, T, 700, 470, 2, 0.8); }
    [[478, 462, 10, '#fff6c8'], [600, 456, 9, '#c8fcff']].forEach(function (s) { T.spark(g, s[0], s[1], s[2], s[3], 1); });
  }
  /* ---------- the word: carved serif ARTI gold + FACTORY teal, the T is a sword, the Y curls ---------- */
  function word(g, T, L, cx, base, size, glow) {
    var o = { condense: 0.86, spacing: 0.02, dark: '#1a0a02', outline: size * 0.16, depth: size * 0.08, side: '#3a1c06', light: 0.7, ring: 'rgba(255,240,200,.55)', ringW: size * 0.04,
      glow: glow ? 'rgba(255,200,90,.5)' : null, glowBlur: 0.22, glowN: 2, scale: null, face: null };
    var A = 'ARTIFAC', B = 'ORY', sA = function (j) { return j === 0 || j === 4 ? 1.18 : 1; };
    var wA = T.serif.width(A, size, { condense: o.condense, spacing: o.spacing, scale: sA }), wT = size * 0.7, wB = T.serif.width(B, size, o), gap = size * 0.06, W = wA + gap + wT + gap + wB, x0 = cx - W / 2;
    function face(j, gold) { return gold ? [0, L.gold[0], 0.5, L.gold[1], 1, L.gold[2]] : [0, L.teal[0], 0.5, L.teal[1], 1, L.teal[2]]; }
    curl(g, T, L, x0 + W - wB * 0.18, base, size);
    var oa = Object.assign({}, o, { scale: sA, face: function (j) { return face(j, j < 4); } }), ob = Object.assign({}, o, { face: function () { return face(0, false); } });
    T.serif(g, A, x0 + wA / 2, base, size, oa); sword(g, T, L, x0 + wA + gap + wT / 2, base, size); T.serif(g, B, x0 + W - wB / 2, base, size, ob);
    return W;
  }
  function sword(g, T, L, x, base, s) {   // the T of FACTORY: crossguard = the T's bar, hilt + gem above, blade down to a point
    g.save(); g.translate(x, base); g.lineJoin = 'round';
    function both(path, fill) { path(); g.lineWidth = s * 0.14; g.strokeStyle = '#1a0a02'; g.stroke(); path(); g.fillStyle = fill; g.fill(); }
    both(function () { g.beginPath(); g.moveTo(-s * 0.09, -s * 0.9); g.lineTo(s * 0.09, -s * 0.9); g.lineTo(s * 0.07, -s * 0.05); g.lineTo(0, s * 0.12); g.lineTo(-s * 0.07, -s * 0.05); g.closePath(); }, T.lin(g, -s * 0.09, 0, s * 0.09, 0, [0, L.teal[0], 0.48, L.teal[1], 0.52, L.teal[2], 1, L.teal[1]]));
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = s * 0.015; g.beginPath(); g.moveTo(0, -s * 0.86); g.lineTo(0, s * 0.02); g.stroke();
    both(function () { g.beginPath(); g.moveTo(-s * 0.36, -s * 1.0); g.quadraticCurveTo(0, -s * 0.9, s * 0.36, -s * 1.0); g.lineTo(s * 0.4, -s * 0.9); g.quadraticCurveTo(0, -s * 0.8, -s * 0.4, -s * 0.9); g.closePath(); }, T.lin(g, 0, -s * 1.02, 0, -s * 0.85, [0, L.gold[0], 0.5, L.gold[1], 1, L.gold[2]]));
    both(function () { T.rr(g, -s * 0.05, -s * 1.24, s * 0.1, s * 0.26, s * 0.03); }, '#6a3a1a');
    both(function () { g.beginPath(); g.arc(0, -s * 1.28, s * 0.07, 0, TAU); }, T.rad(g, -s * 0.02, -s * 1.3, 1, s * 0.07, [0, '#ffffff', 0.4, '#3ad8ff', 1, '#0a6a8a']));
    g.restore();
  }
  function curl(g, T, L, x, base, s) {   // the Y's swash tail curling back under the word
    g.save(); g.lineCap = 'round'; var p = [[x, base - s * 0.04], [x + s * 0.5, base + s * 0.1], [x + s * 0.25, base + s * 0.42], [x - s * 0.06, base + s * 0.26]];
    function tr() { g.beginPath(); g.moveTo(p[0][0], p[0][1]); g.bezierCurveTo(p[1][0], p[1][1], p[2][0], p[2][1], p[3][0], p[3][1]); }
    tr(); g.strokeStyle = '#1a0a02'; g.lineWidth = s * 0.2; g.stroke(); tr(); g.strokeStyle = T.lin(g, x, base, x + s * 0.4, base + s * 0.4, [0, L.teal[1], 1, L.teal[2]]); g.lineWidth = s * 0.1; g.stroke();
    g.fillStyle = L.teal[1]; g.beginPath(); g.arc(p[3][0], p[3][1], s * 0.08, 0, TAU); g.fill(); g.lineWidth = s * 0.04; g.strokeStyle = '#1a0a02'; g.stroke(); g.restore();
  }
  function icon(g, T, L, full) {
    g.save(); shape(g, T); g.clip(); wall(g, T, L); forge(g, T); barrel(g, T); shelf(g, T); burst(g, T, full); crate(g, T); gnome(g, T); bottom(g, T, full);
    T.mystic(g, IX, IY, IW, IH, { seed: 5, motes: full ? 18 : 6 }); g.restore(); frame(g, T, L, full);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { back(g, T); icon(g, T, L, true); word(g, T, L, 508, 436, 66, true); return; }
    if (kind === 'main') { var f = px >= 300; g.translate(-212, 14); icon(g, T, L, f); word(g, T, L, 508, 436, 66, f); return; }
    if (kind === 'wide') { g.save(); g.translate(20, 10); g.scale(0.33, 0.33); g.translate(-(IX - 18), -(IY - 18)); icon(g, T, L, false); g.restore(); word(g, T, L, 552, 140, 74, false); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.7, 0.7); g.translate(-ICX, -ICY); icon(g, T, L, false); if (px >= 90) word(g, T, L, 508, 436, 66, false); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO artifactory END

// 🏷️ LOGO avatarealm START — 🌍 AvataRealm, drawn in code from Aowu's picture (gl-31, round 10). A stone ring with a knot band and gold edges round a
// glowing sky globe; inside, a floating island in two tiers (gl-r19: each a BLOCK — rounded-diamond grass top with dirt paths, two cliff faces, rocky underside) (castle with blue cone roofs, houses, watchtowers, pines, waterfalls, rocky underside);
// little ships sail the clouds; a golden comet trail swirls round the ring; a hero in armour with a raised sword (left) and a young wizard with a
// glowing staff (right), drawn one-piece; tiny avatar faces float in the dark; "AVATA" gold + "REALM" royal blue in carved serif letters (T.serif, gl-r19), the R bigger.
// Look: classic only (AvataRealm has no game page yet).
GameLogos.add('avatarealm', (function () {
  var BOX = { scene: [1024, 572], main: [900, 540], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, INK = '#0c0a1a', CX = 512, CY = 280;
  var LOOK = { classic: { bg: ['#1a2030', '#05070c'], gold: ['#fff4b8', '#f2c23a', '#9a5a08'], blue: ['#e0f0ff', '#3a7af0', '#10287a'], stone: ['#9aa0aa', '#4a505a'] } };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* ---------- background ---------- */
  function back(g, T, L) {
    g.fillStyle = T.rad(g, 512, 290, 30, 640, [0, L.bg[0], 1, L.bg[1]]); g.fillRect(0, 0, 1024, 572);
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, CX, CY, 200, 330, [0, 'rgba(120,200,255,.25)', 1, 'rgba(0,0,0,0)']); g.fillRect(150, 0, 724, 572); g.restore();
    T.mystic(g, 0, 0, 1024, 572, { seed: 53, nebula: [[170, 140, 250, 'rgba(140,70,255,.55)', 0.5], [860, 130, 240, 'rgba(40,200,230,.5)', 0.45], [160, 460, 220, 'rgba(230,80,190,.45)', 0.35], [880, 450, 230, 'rgba(70,110,255,.5)', 0.4]],   /* gl-r20: mystic sky */
      aurora: [{ y: 120, amp: 30, h: 130, cols: ['rgba(90,255,200,.95)', 'rgba(110,120,255,.6)'], a: 0.5, f: 0.8 }, { y: 470, amp: 22, h: 110, cols: ['rgba(255,130,230,.85)', 'rgba(140,90,255,.5)'], a: 0.22, f: 1.2, ph: 1.1 }],
      stars: 140, motes: 30 });
    var r = T.rng(7); for (var i = 0; i < 50; i++) { g.fillStyle = 'rgba(255,240,200,' + (0.2 + r() * 0.5) + ')'; g.beginPath(); g.arc(r() * 1024, r() * 572, 0.6 + r() * 1.6, 0, TAU); g.fill(); }
  }
  function faces(g, T, a) {
    var F = [[186, 163, '#c87a3a', '#ffd8b0'], [308, 100, '#5a3a2a', '#f0c8a0'], [716, 110, '#2a2a3a', '#e8b890'], [868, 226, '#3a6aaa', '#ffd0b0'], [784, 378, '#7a5a2a', '#e0b088'], [744, 448, '#c84a4a', '#ffd0b8'], [694, 490, '#3a3a5a', '#d8a880'], [242, 376, '#5a5a5a', '#f0c8a0'], [214, 366, '#aa6a2a', '#ffd8b0'], [800, 430, '#2a5a3a', '#f0c8a0']];
    g.save(); g.globalAlpha = a; F.forEach(function (f, i) { var x = f[0], y = f[1], s = 9 + (i % 3) * 2; g.beginPath(); g.arc(x, y + s * 1.4, s * 1.1, Math.PI, TAU); g.fillStyle = ['#4a5a9a', '#7a3a6a', '#3a7a5a'][i % 3]; g.fill(); g.beginPath(); g.arc(x, y, s, 0, TAU); g.fillStyle = f[3]; g.fill(); g.beginPath(); g.arc(x, y - s * 0.25, s * 1.02, Math.PI * 1.05, TAU - 0.05); g.fillStyle = f[2]; g.fill(); g.fillStyle = '#1a1a2a'; g.beginPath(); g.arc(x - s * 0.35, y + s * 0.1, s * 0.13, 0, TAU); g.arc(x + s * 0.35, y + s * 0.1, s * 0.13, 0, TAU); g.fill(); }); g.restore();
  }
  /* ---------- the globe: sky, two-tier floating island ---------- */
  function pine(g, T, x, y, s) { g.fillStyle = '#5a3a1a'; g.fillRect(x - 1.5 * s, y - 4 * s, 3 * s, 5 * s); [[0, 14, 9], [-7, 10, 7], [-13, 6, 5]].forEach(function (q) { g.beginPath(); g.moveTo(x - q[1] * s * 0.6, y + q[0] * s * 0.6 - 4 * s); g.lineTo(x, y + q[0] * s * 0.6 - 4 * s - q[1] * s * 1.1); g.lineTo(x + q[1] * s * 0.6, y + q[0] * s * 0.6 - 4 * s); g.closePath(); g.fillStyle = T.lin(g, x - 8 * s, 0, x + 8 * s, 0, [0, '#2a8a3a', 0.5, '#4ab84a', 1, '#1a6a2a']); g.fill(); }); }
  function cone(g, T, x, y, w, h, col) { g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y - h); g.lineTo(x + w, y); g.quadraticCurveTo(x, y + w * 0.3, x - w, y); g.fillStyle = T.lin(g, x - w, 0, x + w, 0, [0, sh(col, 0.35), 0.45, col, 1, sh(col, -0.45)]); g.fill(); g.lineWidth = 1.6; g.strokeStyle = '#0a1a4a'; g.stroke(); }
  function tower(g, T, x, y, w, h, roof, col) { g.fillStyle = T.lin(g, x - w, 0, x + w, 0, [0, '#f0e8d8', 0.5, col || '#d0c4ac', 1, '#8a806c']); g.fillRect(x - w, y - h, w * 2, h); g.lineWidth = 1.5; g.strokeStyle = '#4a4030'; g.strokeRect(x - w, y - h, w * 2, h); for (var i = -w; i < w; i += w / 2) { g.fillStyle = '#d8ccb4'; g.fillRect(x + i, y - h - 4, w / 4, 4); }
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(x, y - h * 0.45, w * 0.28, Math.PI, TAU); g.fillRect(x - w * 0.28, y - h * 0.45, w * 0.56, h * 0.18); g.fill(); if (roof) cone(g, T, x, y - h - 2, w * 1.25, roof, '#3a7ae8'); }
  function flag(g, x, y, c) { g.strokeStyle = '#5a4a2a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 18); g.stroke(); g.fillStyle = c; g.beginPath(); g.moveTo(x, y - 18); g.quadraticCurveTo(x + 8, y - 20, x + 14, y - 15); g.quadraticCurveTo(x + 8, y - 12, x, y - 12); g.closePath(); g.fill(); }
  function house(g, T, x, y, s) { g.fillStyle = '#c8a878'; g.fillRect(x - 12 * s, y - 12 * s, 24 * s, 12 * s); g.strokeStyle = '#4a3a20'; g.lineWidth = 1.2; g.strokeRect(x - 12 * s, y - 12 * s, 24 * s, 12 * s); g.fillStyle = '#5a3a1a'; g.fillRect(x - 3 * s, y - 7 * s, 6 * s, 7 * s);
    g.beginPath(); g.moveTo(x - 16 * s, y - 11 * s); g.lineTo(x - 6 * s, y - 24 * s); g.lineTo(x + 10 * s, y - 24 * s); g.lineTo(x + 16 * s, y - 11 * s); g.closePath(); g.fillStyle = T.lin(g, 0, y - 24 * s, 0, y - 11 * s, [0, '#6aa8ff', 1, '#2a5ac8']); g.fill(); g.stroke(); }
  function falls(g, T, x, y0, y1, w) { g.save(); g.fillStyle = T.lin(g, 0, y0, 0, y1, [0, 'rgba(230,250,255,.95)', 0.75, 'rgba(150,215,255,.8)', 1, 'rgba(150,215,255,0)']); g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x + w / 2, y0); g.lineTo(x + w * 0.8, y1); g.lineTo(x - w * 0.8, y1); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.4; for (var i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * w * 0.25, y0 + 3); g.lineTo(x + i * w * 0.35, y1 - 10); g.stroke(); } g.restore(); }
  function tier(g, T, x, y, rx, ry, depth) {   // a grass top on a rocky cone
    g.beginPath(); g.moveTo(x - rx, y); g.bezierCurveTo(x - rx * 0.8, y + depth * 0.5, x - rx * 0.35, y + depth, x + rx * 0.05, y + depth * 1.1); g.bezierCurveTo(x + rx * 0.4, y + depth * 0.9, x + rx * 0.85, y + depth * 0.45, x + rx, y); g.closePath();
    g.fillStyle = T.lin(g, 0, y, 0, y + depth, [0, '#b88a5a', 0.4, '#7a5a3a', 1, '#3a2a1a']); g.fill(); g.lineWidth = 2; g.strokeStyle = '#2a1a10'; g.stroke();
    g.strokeStyle = 'rgba(40,24,12,.5)'; g.lineWidth = 1.5; for (var i = 0; i < 7; i++) { var px = x - rx * 0.7 + i * rx * 0.24; g.beginPath(); g.moveTo(px, y + 8); g.lineTo(px + 6, y + depth * (0.4 + (i % 3) * 0.15)); g.stroke(); }
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fillStyle = T.lin(g, 0, y - ry, 0, y + ry, [0, '#aaf07a', 0.6, '#5ac04a', 1, '#2a8a2a']); g.fill(); g.lineWidth = 2; g.strokeStyle = '#1a5a1a'; g.stroke();
  }
  function ship(g, T, x, y, s, flip) { g.save(); g.translate(x, y); g.scale(flip ? -s : s, s); g.beginPath(); g.moveTo(-18, 0); g.lineTo(18, 0); g.lineTo(13, 9); g.lineTo(-13, 9); g.closePath(); g.fillStyle = '#7a4a22'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#2a1a0a'; g.stroke();
    g.strokeStyle = '#4a2a10'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -28); g.stroke(); g.fillStyle = '#f4ecd8'; g.beginPath(); g.moveTo(2, -26); g.quadraticCurveTo(16, -16, 2, -4); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-2, -24); g.quadraticCurveTo(-14, -14, -2, -6); g.closePath(); g.fill(); g.fillStyle = '#e84a4a'; g.fillRect(0, -32, 7, 4);
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(0, 11, 24, 4, 0, 0, TAU); g.fill(); g.restore(); }
  /* gl-r19 draft 2: the picture's island is a BLOCK seen from above-front — a rounded diamond of grass with dirt paths, two cliff faces with
     rock layers, and a rocky underside — not an oval. block(g, T, L, B, R, F, cliff, under) draws one (corners Left / Back / Right / Front) */
  function block(g, T, P, cliff, under, seed) {
    var Lx = P[0], Bk = P[1], Rx = P[2], Fr = P[3], d = cliff;
    function q(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    // rocky underside to a point
    var tip = [Fr[0] - 24, Fr[1] + d + under];
    g.beginPath(); g.moveTo(Lx[0], Lx[1] + d * 0.7); g.quadraticCurveTo(Lx[0] + 20, Lx[1] + d + under * 0.5, tip[0], tip[1]); g.quadraticCurveTo(Rx[0] - 30, Rx[1] + d + under * 0.45, Rx[0], Rx[1] + d * 0.7); g.lineTo(Fr[0], Fr[1] + d); g.closePath();
    g.fillStyle = T.lin(g, 0, Fr[1], 0, tip[1], [0, '#7a5a3a', 0.5, '#4a3424', 1, '#241810']); g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#1a100a'; g.stroke();
    var r = T.rng(seed); g.save(); g.clip(); g.strokeStyle = 'rgba(20,12,6,.45)'; g.lineWidth = 2; for (var i = 0; i < 14; i++) { var x = Lx[0] + r() * (Rx[0] - Lx[0]), y = Fr[1] + d + r() * under * 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 16, y + 14 + r() * 20); g.stroke(); }
    g.fillStyle = 'rgba(160,130,100,.35)'; for (i = 0; i < 10; i++) { g.beginPath(); g.ellipse(Lx[0] + r() * (Rx[0] - Lx[0]), Fr[1] + d + r() * under * 0.6, 8 + r() * 10, 4 + r() * 4, 0, 0, TAU); g.fill(); } g.restore();
    // two cliff faces
    [[Lx, Fr, '#c8a070', '#8a6440'], [Fr, Rx, '#8a6a48', '#5a4028']].forEach(function (f, k) {
      g.beginPath(); g.moveTo(f[0][0], f[0][1]); g.lineTo(f[1][0], f[1][1]); g.lineTo(f[1][0], f[1][1] + d * (k ? 0.7 : 1)); g.lineTo(f[0][0], f[0][1] + d * (k ? 1 : 0.7)); g.closePath();
      g.fillStyle = T.lin(g, 0, Math.min(f[0][1], f[1][1]), 0, Math.max(f[0][1], f[1][1]) + d, [0, f[2], 1, f[3]]); g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#2a1a10'; g.stroke();
      g.save(); g.clip(); g.strokeStyle = 'rgba(40,24,12,.4)'; g.lineWidth = 1.6; for (var t = 0.3; t < 1; t += 0.28) { var a = [f[0][0], f[0][1] + d * t * (k ? 1 : 0.7)], b = [f[1][0], f[1][1] + d * t * (k ? 0.7 : 1)]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      for (t = 0.12; t < 1; t += 0.14) { var c = q(f[0], f[1], t); g.beginPath(); g.moveTo(c[0], c[1] + 6); g.lineTo(c[0] + 3, c[1] + d * 0.6); g.stroke(); } g.restore(); });
    // grass lip, then the rounded-diamond top
    function top(dy, grow) { var cx = (Lx[0] + Rx[0]) / 2, cy = (Bk[1] + Fr[1]) / 2, pts = [Lx, Bk, Rx, Fr].map(function (p) { return [cx + (p[0] - cx) * grow, cy + (p[1] - cy) * grow + dy]; }); g.beginPath();
      for (var i = 0; i < 4; i++) { var a = pts[i], b = pts[(i + 1) % 4], m0 = q(a, b, 0.12), m1 = q(a, b, 0.88); if (!i) g.moveTo(m0[0], m0[1]); else g.quadraticCurveTo(a[0], a[1], m0[0], m0[1]); g.lineTo(m1[0], m1[1]); } g.quadraticCurveTo(pts[0][0], pts[0][1], q(pts[0], pts[1], 0.12)[0], q(pts[0], pts[1], 0.12)[1]); g.closePath(); }
    top(7, 1.02); g.fillStyle = '#2a7a24'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#123a10'; g.stroke();
    top(0, 1); g.fillStyle = T.lin(g, 0, Bk[1], 0, Fr[1], [0, '#b8f47a', 0.55, '#6ac84a', 1, '#3a9a32']); g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#1a5a1a'; g.stroke();
    g.save(); top(0, 1); g.clip(); g.fillStyle = 'rgba(255,255,200,.18)'; for (i = 0; i < 26; i++) { g.beginPath(); g.ellipse(Lx[0] + r() * (Rx[0] - Lx[0]), Bk[1] + r() * (Fr[1] - Bk[1]), 6 + r() * 8, 2 + r() * 2, 0, 0, TAU); g.fill(); } g.restore();
    return top;
  }
  function path(g, pts, w) { g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(function (p, i) { g[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); g.strokeStyle = '#8a6a3a'; g.lineWidth = w + 3; g.stroke(); g.strokeStyle = '#e0c08a'; g.lineWidth = w; g.stroke(); g.restore(); }
  function rock(g, T, x, y, s) { g.beginPath(); g.moveTo(x - 9 * s, y); g.lineTo(x - 6 * s, y - 7 * s); g.lineTo(x + 2 * s, y - 9 * s); g.lineTo(x + 9 * s, y - 3 * s); g.lineTo(x + 8 * s, y); g.closePath(); g.fillStyle = T.lin(g, x - 9 * s, y - 9 * s, x + 9 * s, y, [0, '#e0e2e8', 0.5, '#a0a4ae', 1, '#5a5e68']); g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#2a2a34'; g.stroke(); }
  function globe(g, T, L, full) {
    g.save(); g.beginPath(); g.arc(CX, CY, 222, 0, TAU); g.clip();
    g.fillStyle = T.rad(g, CX, CY - 20, 20, 240, [0, '#fff4e4', 0.3, '#e4d4ff', 0.58, '#9a9cf4', 0.82, '#4a5ad0', 1, '#22287e']); g.fillRect(CX - 230, CY - 230, 460, 460);   /* gl-r20: twilight globe */
    T.mystic(g, CX - 222, CY - 222, 444, 300, { seed: 61, nebula: [[CX - 120, CY - 140, 110, 'rgba(190,100,255,.7)', 0.45], [CX + 130, CY - 130, 110, 'rgba(60,230,220,.7)', 0.4]],
      aurora: [{ y: CY - 150, amp: 18, h: 80, cols: ['rgba(110,255,210,.95)', 'rgba(120,140,255,.6)'], a: 0.55, f: 1.2, x0: CX - 222, x1: CX + 222 }, { y: CY - 175, amp: 12, h: 60, cols: ['rgba(255,140,235,.9)', 'rgba(170,100,255,.5)'], a: 0.4, f: 1.7, ph: 2.2, x0: CX - 222, x1: CX + 222 }],
      rays: full ? { x: CX, y: CY - 60, n: 14, len: 250, col: 'rgba(255,236,200,.9)', a: 0.16, spread: Math.PI * 2, rot: 0 } : null, moon: { x: CX - 138, y: CY - 132, r: 13 }, stars: full ? 60 : 30 });
    [[350, 300, 34], [676, 290, 30], [420, 480, 34], [640, 470, 30]].forEach(function (c) { g.fillStyle = 'rgba(244,232,255,.8)'; [[0, 0, 1], [-0.9, 0.2, 0.7], [0.9, 0.2, 0.7]].forEach(function (q) { g.beginPath(); g.arc(c[0] + q[0] * c[2], c[1] + q[1] * c[2], q[2] * c[2], 0, TAU); g.fill(); }); });
    // lower block: trees, rocks, a waterfall off its left edge
    falls(g, T, 372, 372, 470, 16); block(g, T, [[350, 352], [500, 318], [664, 350], [478, 392]], 34, 92, 9); falls(g, T, 380, 366, 462, 12);
    path(g, [[380, 356], [430, 362], [470, 352], [520, 362]], 4);
    [[402, 346], [430, 372], [458, 340], [536, 344], [560, 372], [590, 352], [620, 364], [506, 382], [380, 364], [640, 352]].forEach(function (p, i) { if (full || i < 6) pine(g, T, p[0], p[1], 0.9); });
    [[446, 384, 1.1], [600, 380, 1], [520, 366, 0.8], [366, 354, 0.8], [652, 364, 0.9]].forEach(function (q) { rock(g, T, q[0], q[1], q[2]); });
    // upper block + town, paths between the houses
    falls(g, T, 376, 212, 300, 14); falls(g, T, 650, 214, 290, 12);
    block(g, T, [[338, 204], [500, 136], [690, 206], [528, 264]], 40, 70, 5);
    path(g, [[372, 214], [420, 222], [470, 214], [516, 196]], 5); path(g, [[516, 196], [560, 210], [612, 214], [660, 206]], 5); path(g, [[516, 196], [520, 230], [528, 254]], 5);
    house(g, T, 418, 206, 1.35); house(g, T, 458, 230, 1.1); house(g, T, 590, 234, 1);
    tower(g, T, 604, 222, 9, 40, 0); g.fillStyle = '#7a5a3a'; g.fillRect(594, 180, 20, 4); tower(g, T, 650, 202, 11, 38, 24);
    [[366, 208], [392, 196], [628, 238], [674, 214], [446, 188], [600, 196], [548, 250], [480, 252], [400, 226]].forEach(function (p, i) { if (full || i < 6) pine(g, T, p[0], p[1], 1); });
    [[438, 244, 0.8], [628, 222, 0.7], [560, 240, 0.7]].forEach(function (q) { rock(g, T, q[0], q[1], q[2]); });
    if (full) { g.fillStyle = '#4a4a5a'; [[486, 214], [500, 222], [548, 222], [570, 214]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1] - 6, 2.5, 0, TAU); g.fill(); g.fillRect(p[0] - 2, p[1] - 4, 4, 6); }); }
    g.restore();
    // glass shine on the globe
    g.save(); g.globalAlpha = 0.3; g.fillStyle = T.rad(g, 430, 150, 4, 120, [0, '#ffffff', 1, 'rgba(255,255,255,0)']); g.beginPath(); g.arc(CX, CY, 222, 0, TAU); g.fill(); g.restore();
  }
  function castle(g, T) {   // drawn over the ring so its towers rise past the rim, like the picture
    g.save(); g.translate(516, 180); g.scale(1.18, 1.18); g.translate(-516, -158);
    g.fillStyle = T.lin(g, 450, 0, 580, 0, [0, '#f0e8d8', 0.5, '#cfc2a8', 1, '#8a806c']); g.fillRect(468, 116, 96, 42); g.lineWidth = 1.5; g.strokeStyle = '#4a4030'; g.strokeRect(468, 116, 96, 42); for (var i = 468; i < 564; i += 12) { g.fillStyle = '#d8ccb4'; g.fillRect(i, 110, 7, 6); }
    g.strokeStyle = 'rgba(90,80,60,.35)'; g.lineWidth = 1; for (var y = 124; y < 158; y += 8) { g.beginPath(); g.moveTo(468, y); g.lineTo(564, y); g.stroke(); }
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(516, 146, 9, Math.PI, TAU); g.fillRect(507, 146, 18, 12); g.fill();
    tower(g, T, 470, 150, 12, 54, 32); tower(g, T, 562, 150, 12, 54, 32); tower(g, T, 516, 112, 19, 42, 38); tower(g, T, 494, 128, 9, 30, 22); flag(g, 516, 30, '#ffd23a'); flag(g, 470, 66, '#ffd23a'); flag(g, 562, 66, '#ffd23a');
    g.restore();
  }
  function ring(g, T, L) {
    g.save(); g.lineWidth = 34; g.strokeStyle = INK; g.beginPath(); g.arc(CX, CY, 238, 0, TAU); g.stroke();
    g.lineWidth = 28; g.strokeStyle = T.lin(g, CX - 240, CY - 240, CX + 240, CY + 240, [0, '#b8bec8', 0.5, '#6a707a', 1, '#3a3e46']); g.stroke();
    // knot band: two interlaced waves
    g.lineWidth = 3.4; g.lineCap = 'round'; ['#2a2e36', '#d8dce4'].forEach(function (c, k) { g.strokeStyle = c; for (var w = 0; w < 2; w++) { g.beginPath(); for (var i = 0; i <= 360; i++) { var a = i / 360 * TAU, rr = 238 + Math.sin(a * 36 + w * Math.PI) * 8; var x = CX + Math.cos(a) * rr + (k ? -0.8 : 0.8), y = CY + Math.sin(a) * rr + (k ? -0.8 : 0.8); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); } });
    [[222, 5], [254, 6]].forEach(function (q) { g.lineWidth = q[1]; g.strokeStyle = T.lin(g, CX - 260, CY - 260, CX + 260, CY + 260, [0, L.gold[0], 0.35, L.gold[1], 0.65, L.gold[2], 1, L.gold[1]]); g.beginPath(); g.arc(CX, CY, q[0], 0, TAU); g.stroke(); });
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(function (a) { g.save(); g.translate(CX + Math.cos(a) * 238, CY + Math.sin(a) * 238); g.rotate(a); g.beginPath(); g.moveTo(-10, 0); g.lineTo(0, -16); g.lineTo(10, 0); g.lineTo(0, 16); g.closePath(); g.fillStyle = T.lin(g, -10, -16, 10, 16, [0, L.gold[0], 0.5, L.gold[1], 1, L.gold[2]]); g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.restore(); });
    g.restore();
  }
  function swirl(g, T, front, full) {   // golden comet trail round the ring (an ellipse tilted down-left)
    g.save(); g.translate(CX, CY + 10); g.rotate(-0.42); var A = 330, B = 128; g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    var a0 = front ? 0.35 : -2.8, a1 = front ? 3.3 : 0.35;
    for (var k = 0; k < 3; k++) { for (var i = 0; i < 80; i++) { var t = i / 80, a = a0 + (a1 - a0) * t, b = a0 + (a1 - a0) * (t + 1 / 80); var wv = (front ? Math.sin(t * Math.PI) : t) * [26, 15, 5][k]; g.strokeStyle = ['rgba(255,150,20,.38)', 'rgba(255,200,60,.55)', 'rgba(255,240,190,.62)'][k];   /* gl-r19: a thicker comet band */ g.lineWidth = Math.max(0.5, wv); g.beginPath(); g.moveTo(Math.cos(a) * A, Math.sin(a) * B); g.lineTo(Math.cos(b) * A, Math.sin(b) * B); g.stroke(); } }
    var r = T.rng(front ? 3 : 4); for (i = 0; i < (full ? 140 : 50); i++) { var aa = a0 + (a1 - a0) * r(), d = (r() - 0.5) * 44; g.fillStyle = ['#fff6c0', '#ffd23a', '#ffb02a'][i % 3]; g.beginPath(); g.arc(Math.cos(aa) * (A + d), Math.sin(aa) * (B + d * 0.5), 0.8 + r() * 2.4, 0, TAU); g.fill(); }
    g.restore();
  }
  /* ---------- the two heroes, one-piece ---------- */
  function knight(g, T) {   /* gl-r19: smaller (× 0.84), leaning into the sword, head 0.84 and tilted — the picture's knight is livelier */
    g.save(); g.translate(262, 238); g.rotate(-0.07); g.scale(0.84, 0.84); g.translate(-276, -262);
    var HT = function (h) { h.translate(270, 190); h.rotate(-0.12); h.scale(0.84, 0.84); h.translate(-270, -190); };
    var SK = ['#ffe0c4', '#f0b48a', '#c88058'], AR = ['#e8e0ff', '#a898e0', '#5a4aa8'];
    // flame behind the shoulder
    g.save(); g.globalCompositeOperation = 'lighter'; [[318, 150, 30, '#ff7a1a'], [308, 128, 22, '#ffb02a'], [326, 168, 18, '#ff5a1a']].forEach(function (f) { g.fillStyle = T.rad(g, f[0], f[1], 2, f[2], [0, '#fff4c0', 0.4, f[3], 1, 'rgba(255,60,0,0)']); g.beginPath(); g.moveTo(f[0] - f[2] * 0.6, f[1] + f[2] * 0.6); g.quadraticCurveTo(f[0] - f[2], f[1] - f[2] * 0.4, f[0], f[1] - f[2] * 1.4); g.quadraticCurveTo(f[0] + f[2], f[1] - f[2] * 0.4, f[0] + f[2] * 0.6, f[1] + f[2] * 0.6); g.closePath(); g.fill(); }); g.restore();
    // the sword (behind the fist): blade up-left
    g.save(); g.translate(196, 232); g.rotate(-0.93); g.beginPath(); g.moveTo(-11, -10); g.lineTo(-13, -118); g.lineTo(0, -138); g.lineTo(13, -118); g.lineTo(11, -10); g.closePath(); g.fillStyle = T.lin(g, -13, 0, 13, 0, [0, '#ffffff', 0.45, '#d8e4f4', 0.55, '#98a8c0', 1, '#c8d4e8']); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.strokeStyle = 'rgba(120,140,170,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -14); g.lineTo(0, -126); g.stroke();
    g.fillStyle = T.lin(g, -26, 0, 26, 0, [0, '#fff2b0', 0.5, '#e8b030', 1, '#9a6a10']); T.rr(g, -26, -12, 52, 10, 4); g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#6a3a1a'; g.fillRect(-5, -2, 10, 22); g.strokeRect(-5, -2, 10, 22); g.beginPath(); g.arc(0, 24, 6, 0, TAU); g.fillStyle = '#f0c040'; g.fill(); g.stroke(); g.restore();
    var P = {
      body: function (h) { h.beginPath(); h.moveTo(214, 214); h.bezierCurveTo(222, 186, 312, 180, 330, 212); h.bezierCurveTo(338, 240, 330, 262, 326, 276); h.lineTo(334, 312); h.lineTo(214, 312); h.lineTo(222, 276); h.bezierCurveTo(212, 256, 208, 236, 214, 214); h.closePath(); h.fill(); },   /* gl-r19: + armour skirt so nothing is cut above the word */
      padL: function (h) { h.beginPath(); h.ellipse(222, 206, 26, 20, -0.5, 0, TAU); h.fill(); },
      padR: function (h) { h.beginPath(); h.ellipse(318, 204, 26, 20, 0.5, 0, TAU); h.fill(); },
      armR: function (h) { T.limb(h, [326, 214, 344, 240, 330, 262], 22, 18, 2); h.beginPath(); h.ellipse(326, 262, 15, 13, 0, 0, TAU); h.fill(); },
      armL: function (h) { T.limb(h, [222, 214, 196, 222, 194, 238], 22, 20, 2); h.beginPath(); h.ellipse(196, 236, 16, 15, 0, 0, TAU); h.fill(); },
      neck: function (h) { h.fillRect(256, 168, 26, 24); },
      head: function (h) { h.beginPath(); h.ellipse(268, 140, 40, 42, -0.05, 0, TAU); h.fill(); h.beginPath(); h.ellipse(230, 146, 8, 11, 0, 0, TAU); h.fill(); },
      hair: function (h) { h.beginPath(); h.moveTo(226, 140); h.bezierCurveTo(220, 104, 238, 88, 250, 92); h.lineTo(248, 76); h.lineTo(268, 90); h.lineTo(276, 70); h.lineTo(288, 92); h.lineTo(308, 84); h.lineTo(304, 104); h.bezierCurveTo(316, 116, 310, 132, 306, 140); h.bezierCurveTo(298, 118, 286, 112, 266, 116); h.bezierCurveTo(250, 118, 236, 126, 226, 140); h.closePath(); h.fill(); }
    };
    T.onePiece(g, T, { x0: 170, y0: 50, W: 200, H: 272, rim: INK, rimW: 4, parts: P, order: ['armR', 'body', 'padR', 'neck', 'head', 'hair', 'padL', 'armL'], tf: { head: HT, hair: HT },
      colour: function (B, put, inside) {
        put(B, 'armR', T.lg(B, 320, 210, 340, 270, [0, AR[1], 1, AR[2]]));
        put(B, 'body', T.lg(B, 214, 190, 330, 276, [0, AR[0], 0.4, AR[1], 1, AR[2]]));
        inside(B, 'body', function (h) { h.fillStyle = T.lg(h, 0, 196, 0, 276, [0, '#5a7af0', 1, '#2a3aa8']); h.beginPath(); h.moveTo(240, 206); h.lineTo(304, 206); h.lineTo(296, 276); h.lineTo(248, 276); h.closePath(); h.fill(); h.strokeStyle = '#f0c040'; h.lineWidth = 5; h.stroke(); h.fillStyle = '#f0c040'; h.beginPath(); h.moveTo(272, 222); h.lineTo(284, 236); h.lineTo(272, 250); h.lineTo(260, 236); h.closePath(); h.fill(); h.fillStyle = T.lg(h, 0, 274, 0, 312, [0, AR[1], 1, AR[2]]); h.fillRect(210, 272, 130, 42); h.strokeStyle = 'rgba(20,10,50,.5)'; h.lineWidth = 2; [246, 274, 302].forEach(function (x) { h.beginPath(); h.moveTo(x, 276); h.lineTo(x, 312); h.stroke(); }); h.fillStyle = '#7a3a1a'; h.fillRect(218, 262, 112, 12); h.fillStyle = '#f0c040'; h.fillRect(264, 260, 16, 16); });
        put(B, 'padR', T.rg(B, 312, 196, 2, 30, [0, AR[0], 0.6, AR[1], 1, AR[2]])); inside(B, 'padR', function (h) { h.strokeStyle = '#f0c040'; h.lineWidth = 4; h.beginPath(); h.ellipse(318, 204, 22, 16, 0.5, 0.2, 3.0); h.stroke(); });
        put(B, 'neck', SK[2]); put(B, 'head', T.rg(B, 258, 128, 6, 50, [0, SK[0], 0.7, SK[1], 1, SK[2]]));
        put(B, 'hair', T.lg(B, 230, 70, 300, 140, [0, '#c87a3a', 0.6, '#8a4a1a', 1, '#5a2a0a']));
        inside(B, 'hair', function (h) { h.strokeStyle = 'rgba(255,200,140,.6)'; h.lineWidth = 3; [[250, 100, 262, 118], [276, 92, 280, 112], [296, 98, 296, 118]].forEach(function (l) { h.beginPath(); h.moveTo(l[0], l[1]); h.lineTo(l[2], l[3]); h.stroke(); }); });
        put(B, 'padL', 'rgba(20,10,40,.3)', 4, 6); put(B, 'padL', T.rg(B, 216, 198, 2, 30, [0, AR[0], 0.6, AR[1], 1, AR[2]])); inside(B, 'padL', function (h) { h.strokeStyle = '#f0c040'; h.lineWidth = 4; h.beginPath(); h.ellipse(222, 206, 22, 16, -0.5, 0.2, 3.0); h.stroke(); });
        put(B, 'armL', T.lg(B, 222, 214, 194, 240, [0, AR[1], 1, AR[2]])); inside(B, 'armL', function (h) { h.fillStyle = '#7a4a2a'; h.beginPath(); h.ellipse(196, 236, 16, 15, 0, 0, TAU); h.fill(); });
      } });
    // face: smirk, brows, eyes
    g.save(); HT(g); g.lineCap = 'round'; g.strokeStyle = '#5a2a0a'; g.lineWidth = 4; g.beginPath(); g.moveTo(244, 128); g.lineTo(260, 124); g.moveTo(278, 124); g.lineTo(296, 126); g.stroke();
    g.fillStyle = '#fff'; [[254, 142], [288, 142]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 7, 8, 0, 0, TAU); g.fill(); }); g.fillStyle = '#3a6a2a'; [[256, 143], [290, 143]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 4.5, 0, TAU); g.fill(); }); g.fillStyle = '#fff'; [[257.5, 141], [291.5, 141]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 1.5, 0, TAU); g.fill(); });
    g.strokeStyle = '#7a2a1a'; g.lineWidth = 3; g.beginPath(); g.moveTo(258, 164); g.quadraticCurveTo(276, 172, 292, 158); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(262, 165); g.quadraticCurveTo(276, 170, 288, 162); g.lineTo(286, 166); g.quadraticCurveTo(276, 171, 264, 167); g.closePath(); g.fill(); g.restore();
    g.restore();
  }
  function wizard(g, T) { g.save(); g.translate(-6, -26); wizard0(g, T); g.restore(); }   /* gl-r19: up so the robe shows above the word */
  function wizard0(g, T) {
    var SK = ['#ffe4cc', '#f4bc94', '#c88a60'], RB = ['#7ab0ff', '#3a6ad8', '#1a2a7a'], PU = ['#c89aff', '#7a3ad0', '#3a1a7a'];
    // staff behind the hand + orb
    g.save(); g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(828, 268); g.lineTo(852, 150); g.stroke(); g.strokeStyle = T.lin(g, 820, 0, 860, 0, [0, '#c88a4a', 1, '#6a3a12']); g.lineWidth = 6; g.stroke();
    g.strokeStyle = '#d8b060'; g.lineWidth = 4; g.beginPath(); g.arc(858, 132, 16, 2.2, 5.6); g.stroke();
    g.shadowColor = '#5ad8ff'; g.shadowBlur = 24; g.beginPath(); g.arc(860, 128, 10, 0, TAU); g.fillStyle = T.rad(g, 857, 124, 1, 11, [0, '#ffffff', 0.4, '#9af0ff', 1, '#2a8ae8']); g.fill(); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 860, 128, 2, 40, [0, 'rgba(120,230,255,.7)', 1, 'rgba(0,120,255,0)']); g.fillRect(820, 88, 80, 80); g.restore();
    var P = {
      robe: function (h) { h.beginPath(); h.moveTo(758, 202); h.bezierCurveTo(770, 190, 810, 190, 822, 204); h.bezierCurveTo(834, 230, 840, 262, 846, 282); h.lineTo(744, 282); h.bezierCurveTo(748, 256, 750, 226, 758, 202); h.closePath(); h.fill(); },
      cape: function (h) { h.beginPath(); h.moveTo(748, 198); h.bezierCurveTo(770, 214, 812, 214, 832, 198); h.lineTo(826, 186); h.bezierCurveTo(806, 198, 772, 198, 754, 186); h.closePath(); h.fill(); },
      armL: function (h) { T.limb(h, [760, 210, 738, 218, 724, 208], 18, 15, 2); h.beginPath(); h.ellipse(718, 204, 12, 9, -0.4, 0, TAU); h.fill(); [[-14, -6], [-12, 2], [-10, 8]].forEach(function (f) { T.limb(h, [718, 204, 718 + f[0] * 0.6, 204 + f[1] * 0.6, 718 + f[0], 204 + f[1]], 5, 4); }); },
      armR: function (h) { T.limb(h, [820, 212, 838, 230, 838, 214], 18, 15, 2); h.beginPath(); h.ellipse(840, 212, 10, 10, 0, 0, TAU); h.fill(); },
      hairB: function (h) { h.beginPath(); h.moveTo(762, 172); h.bezierCurveTo(752, 200, 758, 226, 770, 236); h.lineTo(778, 196); h.lineTo(806, 196); h.lineTo(816, 236); h.bezierCurveTo(830, 222, 832, 196, 820, 172); h.closePath(); h.fill(); },
      head: function (h) { h.beginPath(); h.ellipse(791, 176, 26, 28, 0, 0, TAU); h.fill(); },
      hat: function (h) { h.beginPath(); h.ellipse(791, 158, 50, 12, -0.06, 0, TAU); h.fill(); h.beginPath(); h.moveTo(758, 156); h.bezierCurveTo(764, 124, 778, 110, 800, 108); h.bezierCurveTo(814, 106, 822, 96, 812, 82); h.bezierCurveTo(836, 92, 832, 118, 826, 156); h.closePath(); h.fill(); }
    };
    T.onePiece(g, T, { x0: 690, y0: 70, W: 180, H: 220, rim: INK, rimW: 3.2, parts: P, order: ['hairB', 'robe', 'armR', 'cape', 'armL', 'head', 'hat'],
      colour: function (B, put, inside) {
        put(B, 'hairB', T.lg(B, 760, 170, 820, 236, [0, PU[0], 1, PU[2]]));
        put(B, 'robe', T.lg(B, 750, 196, 846, 282, [0, RB[0], 0.45, RB[1], 1, RB[2]])); inside(B, 'robe', function (h) { h.fillStyle = '#e8b030'; h.fillRect(744, 238, 104, 8); h.strokeStyle = 'rgba(255,220,120,.8)'; h.lineWidth = 3; h.beginPath(); h.moveTo(790, 208); h.lineTo(790, 282); h.stroke(); });
        put(B, 'armR', RB[2]); inside(B, 'armR', function (h) { h.fillStyle = SK[1]; h.beginPath(); h.ellipse(840, 212, 10, 10, 0, 0, TAU); h.fill(); });
        put(B, 'cape', T.lg(B, 750, 186, 830, 214, [0, PU[0], 0.5, PU[1], 1, PU[2]]));
        put(B, 'armL', T.lg(B, 760, 210, 716, 204, [0, RB[1], 1, RB[0]])); inside(B, 'armL', function (h) { h.fillStyle = SK[0]; h.beginPath(); h.ellipse(718, 204, 12, 9, -0.4, 0, TAU); h.fill(); [[-14, -6], [-12, 2], [-10, 8]].forEach(function (f) { h.save(); h.fillStyle = SK[0]; T.limb(h, [718, 204, 718 + f[0] * 0.6, 204 + f[1] * 0.6, 718 + f[0], 204 + f[1]], 5, 4); h.restore(); }); });
        put(B, 'head', T.rg(B, 784, 170, 4, 32, [0, SK[0], 0.7, SK[1], 1, SK[2]]));
        inside(B, 'head', function (h) { h.fillStyle = T.lg(h, 0, 150, 0, 180, [0, PU[1], 1, PU[0]]); h.beginPath(); h.moveTo(764, 176); h.bezierCurveTo(768, 156, 790, 152, 812, 158); h.bezierCurveTo(800, 162, 792, 170, 786, 166); h.bezierCurveTo(780, 170, 770, 172, 764, 176); h.closePath(); h.fill(); });
        put(B, 'hat', T.lg(B, 760, 80, 830, 160, [0, PU[0], 0.45, PU[1], 1, PU[2]])); inside(B, 'hat', function (h) { h.fillStyle = '#e8b030'; h.beginPath(); h.ellipse(791, 152, 34, 5, -0.06, 0, TAU); h.fill(); });
      } });
    g.save(); g.fillStyle = '#fff'; [[781, 180], [802, 180]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 5.5, 6.5, 0, 0, TAU); g.fill(); }); g.fillStyle = '#5a2ab8'; [[782, 181], [803, 181]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 3.8, 0, TAU); g.fill(); }); g.fillStyle = '#fff'; [[783, 179.5], [804, 179.5]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 1.2, 0, TAU); g.fill(); });
    g.strokeStyle = '#3a1a5a'; g.lineWidth = 2.4; g.lineCap = 'round'; [[776, 172, 786, 171], [797, 171, 807, 172]].forEach(function (b) { g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[2], b[3]); g.stroke(); }); g.strokeStyle = '#b84a4a'; g.beginPath(); g.arc(792, 192, 5, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
    g.fillStyle = 'rgba(255,120,140,.35)'; [[774, 190], [810, 190]].forEach(function (c) { g.beginPath(); g.ellipse(c[0], c[1], 5, 3, 0, 0, TAU); g.fill(); }); g.restore();
  }
  /* ---------- the word (gl-r19 draft 2): carved serif capitals (T.serif) like the picture — AVATA gold, REALM royal blue, the R bigger ---------- */
  function word(g, T, L, cx, base, size, glow) {
    var GD = [0, '#ffe680', 0.45, '#f4b81c', 0.8, '#c87a0a', 1, '#7a3e04'], BL = [0, '#a8d4ff', 0.45, '#2a72e8', 0.8, '#163aa8', 1, '#0a1858'];
    var o = { condense: 1.04, spacing: 0.035, dark: INK, outline: size * 0.13, depth: size * 0.07, side: '#1a1008', ring: '#ffe08a', ringW: size * 0.045,
      light: 0.45, glow: glow ? 'rgba(255,190,60,.32)' : null, glowBlur: 0.2, glowN: 2, scale: function (j) { return j === 5 ? 1.3 : 1; }, face: function (j) { return j < 5 ? GD : BL; } };
    T.serif(g, 'AVATAREALM', cx, base, size, o);
  }
  function emblem(g, T, L, full, glow) {
    swirl(g, T, false, full); ring(g, T, L); globe(g, T, L, full); castle(g, T);
    if (full) { ship(g, T, 330, 392, 1, true); ship(g, T, 584, 456, 0.9); ship(g, T, 686, 424, 0.8); }
    swirl(g, T, true, full);
  }
  function stars(g, T, full) { [[374, 74, 14], [612, 44, 18], [776, 262, 14], [196, 270, 12], [760, 70, 10], [346, 486, 10], [860, 300, 9], [650, 254, 12]].forEach(function (s, i) { if (full || i < 4) GameLogos.tools.spark(g, s[0], s[1], s[2], i % 2 ? '#fff6c8' : '#ffe08a', 1); }); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { back(g, T, L); faces(g, T, 0.55); emblem(g, T, L, true); knight(g, T); wizard(g, T); word(g, T, L, 500, 340, 84, true); stars(g, T, true); return; }
    if (kind === 'main') { g.translate(-62, -16); var f = px >= 300; emblem(g, T, L, f); knight(g, T); wizard(g, T); word(g, T, L, 500, 340, 84, f); stars(g, T, f); return; }
    if (kind === 'wide') { g.save(); g.translate(100, 100); g.scale(0.34, 0.34); g.translate(-CX, -CY); emblem(g, T, L, false); g.restore(); word(g, T, L, 540, 146, 66, false); return; }
    if (kind === 'badge') { g.save(); g.translate(200, 196); g.scale(0.66, 0.66); g.translate(-CX, -CY); emblem(g, T, L, false); g.restore(); if (px >= 90) { g.save(); g.translate(200, 236); g.scale(0.52, 0.52); word(g, T, L, 0, 0, 72, false); g.restore(); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO avatarealm END

// 🏷️ LOGO avateer START — 🧳 Avateer, drawn in code from Aowu's picture (gl-30, round 10). A glowing rune ring (cyan runes on a navy band, gold rims)
// behind a gold-and-bronze shield frame with 8 emblem gems; inside: a floating island with a big tree, waterfalls, little islands + palms, clouds and
// four heroes (one-piece, action poses — gl-r19); below the word a swirling purple-cyan portal; green vines curling round the frame; "Avateer" in carved serif letters (T.serif, gl-r19) gold + teal with a dark outline.
// Look: classic only (the game has no themes yet).
GameLogos.add('avateer', (function () {
  var BOX = { scene: [1024, 572], main: [640, 560], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, INK = '#0a1430';
  var LOOK = { classic: { sky: ['#0a2a4a', '#04081a'], rune: '#5af0ff', gold: ['#fff2b0', '#f0c040', '#a86a10'], teal: ['#d8fff8', '#38d8d0', '#0a7a8a'] } };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var T0 = GameLogos.tools;
  function shield(g) { g.beginPath(); g.moveTo(300, 34); g.lineTo(724, 34); g.quadraticCurveTo(762, 34, 762, 72); g.lineTo(762, 372); g.bezierCurveTo(762, 466, 622, 518, 512, 556); g.bezierCurveTo(402, 518, 262, 466, 262, 372); g.lineTo(262, 72); g.quadraticCurveTo(262, 34, 300, 34); g.closePath(); }
  /* ---------- background: night sky + rune ring ---------- */
  function sky(g, T, L) {
    g.fillStyle = T.rad(g, 512, 300, 40, 640, [0, '#14506a', 0.45, L.sky[0], 1, L.sky[1]]); g.fillRect(0, 0, 1024, 572);
    g.save(); g.globalAlpha = 0.5; [[180, 250, '#2a8aff', 220], [860, 200, '#2ad8c8', 200], [512, 420, '#8a3aff', 260]].forEach(function (q) { g.fillStyle = T.rad(g, q[0], q[1], 4, q[3], [0, q[2], 1, 'rgba(0,0,0,0)']); g.fillRect(q[0] - q[3], q[1] - q[3], q[3] * 2, q[3] * 2); }); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 512, 290, 120, 360, [0, 'rgba(60,220,255,.45)', 0.6, 'rgba(40,160,220,.18)', 1, 'rgba(0,0,0,0)']); g.fillRect(150, 0, 724, 572); g.restore();
    T.mystic(g, 0, 0, 1024, 572, { seed: 41, nebula: [[150, 120, 260, 'rgba(150,80,255,.55)', 0.55], [880, 110, 240, 'rgba(40,220,200,.5)', 0.5], [120, 470, 230, 'rgba(60,120,255,.5)', 0.45], [910, 470, 230, 'rgba(230,80,200,.45)', 0.4]],   /* gl-r20: mystic sky */
      aurora: [{ y: 150, amp: 34, h: 150, cols: ['rgba(90,255,200,.95)', 'rgba(120,120,255,.6)'], a: 0.42, f: 0.9 }, { y: 112, amp: 26, h: 120, cols: ['rgba(255,120,230,.9)', 'rgba(150,90,255,.5)'], a: 0.3, f: 1.3, ph: 2.4 }],
      stars: 120, motes: 26 });
    var r = T.rng(5); for (var i = 0; i < 90; i++) { var x = r() * 1024, y = r() * 572; g.fillStyle = ['#bff8ff', '#ffe9a0', '#ffffff'][i % 3]; g.globalAlpha = 0.35 + r() * 0.6; g.beginPath(); g.arc(x, y, 0.8 + r() * 2.2, 0, TAU); g.fill(); } g.globalAlpha = 1;
  }
  function ring(g, T, L, R0, R1, cx, cy, n) {
    g.save(); g.lineWidth = R1 - R0; g.strokeStyle = T.rad(g, cx, cy, R0, R1, [0, '#1a2a5a', 0.5, '#0c1636', 1, '#1a2a5a']); g.beginPath(); g.arc(cx, cy, (R0 + R1) / 2, 0, TAU); g.stroke();
    [[R0 - 3, 6], [R1 + 3, 6]].forEach(function (q) { g.lineWidth = q[1]; g.strokeStyle = T.lin(g, cx - R1, cy - R1, cx + R1, cy + R1, [0, L.gold[0], 0.3, L.gold[1], 0.6, L.gold[2], 1, L.gold[1]]); g.beginPath(); g.arc(cx, cy, q[0], 0, TAU); g.stroke(); });
    g.lineWidth = 2; g.strokeStyle = 'rgba(90,240,255,.35)'; [R0 + 6, R1 - 6].forEach(function (q) { g.beginPath(); g.arc(cx, cy, q, 0, TAU); g.stroke(); });
    var r = T.rng(17), Rm = (R0 + R1) / 2, s = (R1 - R0) * 0.26; g.strokeStyle = L.rune; g.shadowColor = L.rune; g.shadowBlur = 10; g.lineWidth = Math.max(2, s * 0.32); g.lineCap = 'round'; g.lineJoin = 'round';
    for (var i = 0; i < n; i++) { var a = i * TAU / n + 0.03; g.save(); g.translate(cx + Math.cos(a) * Rm, cy + Math.sin(a) * Rm); g.rotate(a + Math.PI / 2); g.beginPath();
      glyph(g, Math.floor(r() * 8), s); g.stroke(); g.restore(); }
    g.restore();
  }
  function glyph(g, k, s) {   // our own rune shapes: hooks, curls, eyes, forks (never a real alphabet)
    if (k === 0) { g.arc(0, -s * 0.2, s * 0.7, Math.PI * 0.9, Math.PI * 2.1); g.moveTo(0, -s * 0.2); g.lineTo(0, s); }
    else if (k === 1) { g.moveTo(-s, s); g.quadraticCurveTo(-s, -s, 0, -s); g.quadraticCurveTo(s, -s, s * 0.6, 0); g.moveTo(-s * 0.2, s * 0.2); g.lineTo(s * 0.5, s); }
    else if (k === 2) { g.arc(0, 0, s * 0.45, 0, TAU); g.moveTo(-s, -s); g.quadraticCurveTo(0, -s * 0.5, s, -s); g.moveTo(-s, s); g.quadraticCurveTo(0, s * 0.5, s, s); }
    else if (k === 3) { g.moveTo(0, s); g.lineTo(0, -s * 0.3); g.moveTo(-s, -s); g.quadraticCurveTo(0, 0, s, -s); }
    else if (k === 4) { g.moveTo(-s * 0.8, -s); g.bezierCurveTo(s, -s, -s, s * 0.2, s * 0.8, s); g.moveTo(s * 0.6, -s * 0.6); g.lineTo(s, -s * 0.2); }
    else if (k === 5) { g.moveTo(0, -s); g.lineTo(s * 0.7, 0); g.lineTo(0, s); g.moveTo(-s * 0.7, -s * 0.5); g.lineTo(-s * 0.7, s * 0.5); }
    else if (k === 6) { g.moveTo(-s, s * 0.6); g.quadraticCurveTo(-s * 0.2, -s * 1.4, s * 0.6, -s * 0.2); g.arc(s * 0.4, s * 0.25, s * 0.45, -Math.PI / 2, Math.PI); }
    else { g.moveTo(0, -s); g.lineTo(0, s); g.moveTo(-s * 0.7, -s * 0.4); g.quadraticCurveTo(0, s * 0.2, s * 0.7, -s * 0.4); g.moveTo(-s * 0.4, s * 0.7); g.lineTo(s * 0.4, s * 0.7); }
  }
  /* ---------- the world inside the shield ---------- */
  function cloud(g, x, y, s, a) { g.save(); g.globalAlpha = a || 1; g.fillStyle = T0.lin(g, 0, y - s, 0, y + s, [0, '#fff8f0', 0.55, '#f0e0ff', 1, '#b8a0f0']); [[0, 0, 1], [-0.9, 0.25, 0.7], [0.95, 0.2, 0.75], [0.4, -0.45, 0.7], [-0.45, -0.3, 0.6]].forEach(function (c) { g.beginPath(); g.arc(x + c[0] * s, y + c[1] * s, c[2] * s, 0, TAU); g.fill(); }); g.fillStyle = 'rgba(150,110,230,.45)'; g.beginPath(); g.ellipse(x, y + s * 0.55, s * 1.6, s * 0.3, 0, 0, TAU); g.fill(); g.restore(); }
  function islet(g, T, x, y, w, h) {
    g.beginPath(); g.moveTo(x - w, y); g.bezierCurveTo(x - w * 0.8, y + h * 0.5, x - w * 0.3, y + h, x, y + h * 1.25); g.bezierCurveTo(x + w * 0.3, y + h, x + w * 0.8, y + h * 0.5, x + w, y); g.closePath();
    g.fillStyle = T.lin(g, 0, y, 0, y + h * 1.25, [0, '#a8784a', 0.5, '#6a4626', 1, '#3a2414']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#2a1a10'; g.stroke();
    g.beginPath(); g.ellipse(x, y, w, h * 0.28, 0, 0, TAU); g.fillStyle = T.lin(g, 0, y - h * 0.28, 0, y + h * 0.28, [0, '#9af06a', 1, '#3aa83a']); g.fill(); g.stroke();
  }
  function palm(g, x, y, s) { g.save(); g.strokeStyle = '#7a4a22'; g.lineWidth = 3 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4 * s, y - 14 * s, x + 2 * s, y - 26 * s); g.stroke(); g.fillStyle = '#3ac04a'; [-2.4, -1.8, -1.3, -0.7, -0.2].forEach(function (a) { g.save(); g.translate(x + 2 * s, y - 26 * s); g.rotate(a); g.beginPath(); g.ellipse(9 * s, 0, 10 * s, 3.2 * s, 0, 0, TAU); g.fill(); g.restore(); }); g.restore(); }
  /* gl-r19 draft 2: the picture's big tree — a wide twisted trunk with roots + moss, a crown of leafy clumps (scalloped, lit top-left,
     darker underneath), branches between the clumps, hanging vines and pink blossoms */
  function tree(g, T) {
    g.save(); g.lineJoin = 'round';
    g.beginPath(); g.moveTo(452, 226); g.bezierCurveTo(476, 214, 484, 196, 486, 170); g.bezierCurveTo(488, 140, 476, 116, 466, 100); g.lineTo(488, 94); g.bezierCurveTo(500, 112, 508, 116, 512, 104);
    g.lineTo(530, 88); g.lineTo(552, 98); g.bezierCurveTo(536, 122, 530, 150, 536, 180); g.bezierCurveTo(540, 204, 552, 216, 578, 226); g.bezierCurveTo(550, 230, 538, 222, 530, 228); g.bezierCurveTo(514, 222, 500, 222, 494, 228); g.bezierCurveTo(482, 222, 470, 228, 452, 226); g.closePath();
    g.fillStyle = T.lin(g, 470, 0, 560, 0, [0, '#4a2810', 0.3, '#8a5428', 0.55, '#b07a40', 0.8, '#7a4620', 1, '#3a2010']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#2a160a'; g.stroke();
    g.strokeStyle = 'rgba(40,20,8,.55)'; g.lineWidth = 2.2; g.lineCap = 'round';
    [[496, 222, 506, 170, 488, 120], [516, 220, 504, 172, 522, 112], [530, 218, 520, 170, 538, 120], [504, 200, 520, 160, 506, 128]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.quadraticCurveTo(l[2], l[3], l[4], l[5]); g.stroke(); });
    g.strokeStyle = 'rgba(255,220,170,.28)'; g.lineWidth = 3; [[520, 214, 512, 168, 528, 124]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.quadraticCurveTo(l[2], l[3], l[4], l[5]); g.stroke(); });
    g.fillStyle = 'rgba(90,190,70,.75)'; [[466, 222, 14, 4], [562, 222, 14, 4]].forEach(function (m) { g.beginPath(); g.ellipse(m[0], m[1], m[2], m[3], 0, 0, TAU); g.fill(); });
    g.restore();
  }
  function clump(g, T, x, y, r, back) {
    g.save(); var n = 9;
    function blob(dx, dy) { g.beginPath(); g.arc(x + dx, y + dy, r * 0.72, 0, TAU); for (var i = 0; i < n; i++) { var a = i * TAU / n + 0.3; g.moveTo(x + dx + Math.cos(a) * r * 0.74 + r * 0.32, y + dy + Math.sin(a) * r * 0.74); g.arc(x + dx + Math.cos(a) * r * 0.74, y + dy + Math.sin(a) * r * 0.74, r * 0.32, 0, TAU); } }
    blob(2, 5); g.fillStyle = back ? '#0e4a1e' : '#145a24'; g.fill();
    blob(0, 0); g.fillStyle = T.rad(g, x - r * 0.35, y - r * 0.45, 2, r * 1.15, back ? [0, '#7ad050', 0.5, '#3a9a36', 1, '#1a6a26'] : [0, '#c8f47a', 0.45, '#62c444', 1, '#24822e']); g.fill();
    g.strokeStyle = back ? 'rgba(170,240,120,.35)' : 'rgba(225,255,160,.6)'; g.lineWidth = 2; g.lineCap = 'round';
    for (var i = 0; i < 4; i++) { var a = -2.4 + i * 0.42; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, r * 0.22, Math.PI * 1.1, Math.PI * 1.7); g.stroke(); }
    g.restore();
  }
  function crown(g, T) {
    g.save(); g.lineCap = 'round';
    [[446, 62, 30], [580, 60, 30], [512, 46, 34], [416, 96, 24], [608, 94, 24]].forEach(function (c) { clump(g, T, c[0], c[1], c[2], true); });
    g.fillStyle = '#6a3e1a'; g.strokeStyle = '#2a160a'; g.lineWidth = 2;
    [[[510, 118, 488, 90, 450, 76], 12, 5], [[514, 116, 540, 88, 584, 74], 12, 5], [[506, 112, 474, 106, 428, 104], 9, 4], [[520, 112, 556, 106, 600, 104], 9, 4], [[512, 112, 512, 80, 512, 52], 11, 5]].forEach(function (b) { T.limb(g, b[0], b[1], b[2]); });
    [[472, 32, 26], [548, 26, 30], [418, 70, 22], [610, 68, 22], [504, 72, 32], [446, 92, 26], [580, 90, 28], [512, 104, 22], [474, 112, 16], [552, 110, 18]].forEach(function (c) { clump(g, T, c[0], c[1], c[2], false); });
    var VN = [[436, 108, 430, 150, 2], [596, 106, 604, 152, 2], [470, 118, 464, 166, 1.6], [560, 118, 568, 160, 1.6], [404, 104, 398, 138, 1.4]];
    VN.forEach(function (v) { g.strokeStyle = '#1a5a22'; g.lineWidth = v[4] + 1.6; g.beginPath(); g.moveTo(v[0], v[1]); g.quadraticCurveTo(v[0] + 8, (v[1] + v[3]) / 2, v[2], v[3]); g.stroke(); g.strokeStyle = '#5ab83e'; g.lineWidth = v[4]; g.stroke();
      [0.4, 0.75].forEach(function (t) { var x = v[0] + (v[2] - v[0]) * t + 4, y = v[1] + (v[3] - v[1]) * t; g.beginPath(); g.ellipse(x, y, 4, 2.2, 0.6, 0, TAU); g.fillStyle = '#7ad04a'; g.fill(); }); });
    var r = T.rng(41); for (var i = 0; i < 16; i++) { var a = r() * TAU, d = 20 + r() * 70; var x = 512 + Math.cos(a) * d * 1.3, y = 66 + Math.sin(a) * d * 0.5; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fillStyle = ['#ff8ad8', '#ffd0f0', '#ff5ab8'][i % 3]; g.fill(); }
    g.restore();
  }
  /* gl-r19 draft 2: heroes drawn ONE-PIECE (one silhouette, one rim, depth from colour) in action poses like the picture — feet at 0,0, ≈ 74 tall */
  function hero(g, T, x, y, s, o) {
    var lean = o.lean || 0.12, cx = 0, cy = -22;
    function rot(p) { var c = Math.cos(lean), n = Math.sin(lean); return [cx + (p[0] - cx) * c - (p[1] - cy) * n, cy + (p[0] - cx) * n + (p[1] - cy) * c]; }
    var up = o.armUp == null ? 1 : o.armUp, hand = up ? [21, -54] : [24, -32], elbow = up ? [17, -43] : [20, -36];
    var P = {
      cape: function (h) { if (!o.cape) return; h.beginPath(); h.moveTo(-9, -42); h.quadraticCurveTo(-22, -26, -26, -8); h.quadraticCurveTo(-14, -12, -4, -16); h.lineTo(6, -40); h.closePath(); h.fill(); },
      legB: function (h) { T.limb(h, [-3, -24, -10, -13, -14, -2], 9.5, 8); h.beginPath(); h.ellipse(-14, -2.5, 7.5, 4.2, -0.1, 0, TAU); h.fill(); },
      legF: function (h) { T.limb(h, [4, -24, 12, -15, 14, -2], 9.5, 8); h.beginPath(); h.ellipse(16, -2.5, 8, 4.2, 0.1, 0, TAU); h.fill(); },
      armB: function (h) { T.limb(h, [-8, -38, -16, -33, -20, -26], 7.5, 6.5); h.beginPath(); h.arc(-20, -25, 4.4, 0, TAU); h.fill(); },
      torso: function (h) { h.beginPath(); h.moveTo(-12, -42); h.bezierCurveTo(-4, -46, 4, -46, 12, -42); h.bezierCurveTo(13, -34, 10, -27, 9, -21); h.lineTo(-9, -21); h.bezierCurveTo(-10, -27, -13, -34, -12, -42); h.closePath(); h.fill();
        h.beginPath(); h.ellipse(-11, -41, 7, 5.5, -0.3, 0, TAU); h.ellipse(11, -41, 7, 5.5, 0.3, 0, TAU); h.fill(); },
      armF: function (h) { T.limb(h, [9, -38, elbow[0], elbow[1], hand[0], hand[1]], 7.5, 6.5); h.beginPath(); h.arc(hand[0], hand[1], 4.6, 0, TAU); h.fill(); },
      head: function (h) { h.beginPath(); h.arc(1, -56, 14, 0, TAU); h.fill(); if (o.ears) { h.beginPath(); h.moveTo(-11, -58); h.lineTo(-24, -66); h.lineTo(-12, -52); h.closePath(); h.fill(); } },
      hair: function (h) { h.beginPath(); if (o.helm) { h.moveTo(-14, -54); h.bezierCurveTo(-16, -74, 18, -76, 16, -54); h.lineTo(10, -58); h.lineTo(-8, -58); h.closePath(); }
        else { h.moveTo(-14, -52); h.lineTo(-18, -62); h.lineTo(-10, -64); h.lineTo(-12, -74); h.lineTo(-2, -68); h.lineTo(4, -78); h.lineTo(8, -68); h.lineTo(18, -72); h.lineTo(14, -60); h.lineTo(17, -52); h.quadraticCurveTo(8, -64, 0, -60); h.quadraticCurveTo(-8, -62, -14, -52); h.closePath(); }
        h.fill(); if (o.tail) { h.beginPath(); h.moveTo(-10, -62); h.quadraticCurveTo(-28, -60, -26, -40); h.quadraticCurveTo(-20, -52, -8, -54); h.closePath(); h.fill(); } }
    };
    var TF = {}; ['cape', 'armB', 'torso', 'armF', 'head', 'hair'].forEach(function (k) { TF[k] = function (h) { T.around(h, cx, cy, lean); }; });
    var A = o.armor, A2 = o.trim || '#f0c040';
    g.save(); g.translate(x, y); g.scale((o.flip ? -1 : 1) * s, s);
    if (o.weapon && o.weaponBack) weapon(g, T, o, rot(hand), lean);
    T.onePiece(g, T, { x0: -34, y0: -84, W: 70, H: 88, rim: INK, rimW: 2.4, parts: P, order: ['cape', 'legB', 'armB', 'torso', 'legF', 'head', 'hair', 'armF'], tf: TF,
      colour: function (B, put, inside) {
        if (o.cape) put(B, 'cape', T.lg(B, -20, -40, -6, -8, [0, sh(o.cape, -0.2), 1, sh(o.cape, -0.55)]));
        put(B, 'legB', sh(o.leg, -0.35)); inside(B, 'legB', function (h) { h.fillStyle = sh(A, -0.4); h.fillRect(-24, -9, 20, 10); });
        put(B, 'armB', sh(A, -0.35)); inside(B, 'armB', function (h) { h.fillStyle = '#c88a5a'; h.beginPath(); h.arc(-20, -25, 4.4, 0, TAU); h.fill(); });
        put(B, 'torso', T.lg(B, -12, -44, 12, -20, [0, sh(A, 0.4), 0.5, A, 1, sh(A, -0.35)]));
        inside(B, 'torso', function (h) { h.fillStyle = T.lg(h, 0, -47, 0, -36, [0, sh(A2, 0.4), 1, sh(A2, -0.25)]); h.beginPath(); h.ellipse(-11, -41, 7, 5.5, -0.3, 0, TAU); h.ellipse(11, -41, 7, 5.5, 0.3, 0, TAU); h.fill();
          h.fillStyle = sh(A2, -0.1); h.fillRect(-12, -26, 24, 4); h.fillStyle = '#fff2b0'; h.fillRect(-2, -26, 4, 4); h.fillStyle = sh(A, -0.25); h.beginPath(); h.moveTo(-6, -36); h.lineTo(6, -36); h.lineTo(0, -29); h.closePath(); h.fill(); });
        put(B, 'legF', o.leg); inside(B, 'legF', function (h) { h.fillStyle = sh(A, -0.15); h.fillRect(4, -9, 22, 10); h.fillStyle = sh(A2, 0); h.fillRect(5, -10, 20, 2); });
        put(B, 'head', T.rg(B, -3, -61, 2, 17, [0, '#ffe8d0', 1, '#e8a878']));
        put(B, 'hair', o.helm ? T.lg(B, 0, -76, 0, -54, [0, sh(o.helm, 0.45), 1, sh(o.helm, -0.3)]) : T.lg(B, 0, -78, 0, -52, [0, sh(o.hair, 0.35), 1, sh(o.hair, -0.25)]));
        put(B, 'armF', sh(A, 0.05), 0, 0); inside(B, 'armF', function (h) { h.fillStyle = '#e8b088'; h.beginPath(); h.arc(hand[0], hand[1], 4.6, 0, TAU); h.fill(); h.fillStyle = sh(A2, -0.1); h.beginPath(); h.arc(elbow[0], elbow[1], 3.4, 0, TAU); h.fill(); });
      } });
    // face (in the leaned head frame)
    g.save(); T.around(g, cx, cy, lean); g.fillStyle = '#1a1a3a'; [[-3, -55], [7, -55]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 2.2, 3, 0, 0, TAU); g.fill(); });
    g.fillStyle = '#fff'; [[-2.3, -56.2], [7.7, -56.2]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 0.9, 0, TAU); g.fill(); });
    g.strokeStyle = '#3a1a0a'; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6, -60.5); g.lineTo(-1, -59.2); g.moveTo(10, -60.5); g.lineTo(5, -59.2); g.stroke();
    g.strokeStyle = '#8a2a2a'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -49.5); g.quadraticCurveTo(3, -48, 6, -50); g.stroke();
    g.fillStyle = 'rgba(255,120,120,.35)'; g.beginPath(); g.ellipse(-6, -51, 2.6, 1.6, 0, 0, TAU); g.ellipse(10, -51, 2.6, 1.6, 0, 0, TAU); g.fill();
    if (o.helm && o.plume) { g.fillStyle = o.plume; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-2, -70); g.quadraticCurveTo(-8, -88, -22, -82); g.quadraticCurveTo(-12, -80, -8, -68); g.closePath(); g.fill(); g.stroke(); }
    if (o.helm && o.wings) { g.fillStyle = '#e8f4ff'; g.strokeStyle = INK; g.lineWidth = 1.4; [-1, 1].forEach(function (d) { g.beginPath(); g.moveTo(1 + d * 12, -64); g.quadraticCurveTo(1 + d * 22, -76, 1 + d * 26, -72); g.quadraticCurveTo(1 + d * 20, -66, 1 + d * 14, -60); g.closePath(); g.fill(); g.stroke(); }); }
    g.restore();
    if (o.shield) { var sp = rot([-21, -27]); g.beginPath(); g.ellipse(sp[0], sp[1], 9, 10.5, 0, 0, TAU); g.fillStyle = T.rad(g, sp[0] - 3, sp[1] - 4, 1, 12, [0, '#fff2b0', 0.4, o.shield, 1, sh(o.shield, -0.45)]); g.fill(); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke();
      g.lineWidth = 1.6; g.strokeStyle = '#f0c040'; g.beginPath(); g.ellipse(sp[0], sp[1], 6.5, 8, 0, 0, TAU); g.stroke(); g.fillStyle = '#f0c040'; g.beginPath(); g.arc(sp[0], sp[1], 2.4, 0, TAU); g.fill(); }
    if (o.weapon && !o.weaponBack) weapon(g, T, o, rot(hand), lean);
    g.restore();
  }
  function weapon(g, T, o, p, lean) {
    g.save(); g.translate(p[0], p[1]); g.rotate((o.wa || -0.5) + lean); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 2;
    if (o.weapon === 'axe') { g.fillStyle = '#7a4a22'; g.fillRect(-1.8, -30, 3.6, 40); g.strokeRect(-1.8, -30, 3.6, 40); g.beginPath(); g.moveTo(1, -28); g.quadraticCurveTo(18, -34, 16, -16); g.quadraticCurveTo(10, -20, 1, -18); g.closePath(); g.fillStyle = T.lin(g, 0, -34, 16, -16, [0, '#ffffff', 0.5, '#c8d4e8', 1, '#7a8aa8']); g.fill(); g.stroke(); }
    else if (o.weapon === 'blade') { g.beginPath(); g.moveTo(-2.8, 2); g.lineTo(-3.4, -28); g.lineTo(0, -40); g.lineTo(3.4, -28); g.lineTo(2.8, 2); g.closePath(); g.fillStyle = T.lin(g, 0, 0, 0, -40, [0, '#b86aff', 1, '#f8e0ff']); g.shadowColor = '#d08aff'; g.shadowBlur = 10; g.fill(); g.shadowBlur = 0; g.stroke(); g.fillStyle = '#f0c040'; g.fillRect(-6, 1, 12, 3.4); g.strokeRect(-6, 1, 12, 3.4); }
    else { g.beginPath(); g.moveTo(-2.6, 2); g.lineTo(-2.6, -30); g.lineTo(0, -37); g.lineTo(2.6, -30); g.lineTo(2.6, 2); g.closePath(); g.fillStyle = T.lin(g, -3, 0, 3, 0, [0, '#ffffff', 0.5, '#d8e4f4', 1, '#8aa0c0']); g.fill(); g.stroke(); g.fillStyle = '#f0c040'; g.fillRect(-7, 1, 14, 3.4); g.strokeRect(-7, 1, 14, 3.4); g.fillStyle = '#7a3a1a'; g.fillRect(-1.6, 4.4, 3.2, 6); }
    g.restore();
  }
  function falls(g, T, x, y0, y1, w) { g.save(); g.fillStyle = T.lin(g, 0, y0, 0, y1, [0, 'rgba(220,250,255,.95)', 0.7, 'rgba(140,220,255,.8)', 1, 'rgba(140,220,255,0)']); g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x + w / 2, y0); g.lineTo(x + w * 0.7, y1); g.lineTo(x - w * 0.7, y1); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1.5; for (var i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * w * 0.25, y0 + 4); g.lineTo(x + i * w * 0.32, y1 - 8); g.stroke(); } g.restore(); }
  function world(g, T, L, full) {
    /* gl-r20 (Aowu "add some sky mystic feeling"): twilight — deep violet top, aurora curtains, star dust, a warm glow + light shafts behind the tree, pink-gold horizon */
    g.fillStyle = T.lin(g, 0, 34, 0, 560, [0, '#160e52', 0.12, '#2c2a96', 0.25, '#3a6ad4', 0.36, '#7ccaf2', 0.43, '#f4c8e4', 0.5, '#8a6ad8', 0.58, '#2a2c86', 0.72, '#141c5c', 1, '#080c30']); g.fillRect(262, 34, 500, 522);
    T.mystic(g, 262, 34, 500, 230, { seed: 17, nebula: [[330, 90, 120, 'rgba(180,90,255,.7)', 0.5], [700, 84, 110, 'rgba(60,230,210,.7)', 0.45]],
      aurora: [{ y: 110, amp: 16, h: 74, cols: ['rgba(110,255,210,.95)', 'rgba(110,140,255,.6)'], a: 0.68, f: 1.1, x0: 262, x1: 762 }, { y: 86, amp: 12, h: 56, cols: ['rgba(255,140,235,.9)', 'rgba(160,100,255,.5)'], a: 0.5, f: 1.6, ph: 1.9, x0: 262, x1: 762 }], moon: { x: 352, y: 80, r: 11 },
      rays: full ? { x: 512, y: 150, n: 13, len: 260, col: 'rgba(255,236,190,.9)', a: 0.22, spread: TAU * 0.9, rot: -Math.PI / 2 } : null, stars: full ? 70 : 34, motes: full ? 10 : 0 });
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 512, 140, 4, 190, [0, 'rgba(255,240,200,.85)', 0.4, 'rgba(255,190,230,.3)', 1, 'rgba(0,0,0,0)']); g.fillRect(312, 0, 400, 330); g.restore();
    cloud(g, 340, 120, 26, 0.95); cloud(g, 690, 112, 24, 0.95); cloud(g, 300, 250, 30, 0.9); cloud(g, 724, 244, 30, 0.9); cloud(g, 400, 236, 22, 0.85); cloud(g, 630, 238, 22, 0.85);
    islet(g, T, 430, 130, 24, 18); islet(g, T, 610, 124, 26, 18); palm(g, 426, 128, 0.9); palm(g, 618, 122, 0.9);
    if (full) { islet(g, T, 380, 170, 14, 10); islet(g, T, 662, 168, 14, 10); palm(g, 386, 170, 0.55); palm(g, 652, 166, 0.55); }
    falls(g, T, 442, 140, 186, 6); falls(g, T, 600, 136, 186, 6);
    islet(g, T, 512, 222, 160, 40); g.save(); g.beginPath(); g.ellipse(512, 222, 160, 11, 0, 0, TAU); g.clip(); g.restore();
    [[470, 230, 278, 12], [544, 232, 284, 14], [420, 230, 262, 8]].forEach(function (f) { falls(g, T, f[0], f[1], f[2], f[3]); });
    g.save(); g.fillStyle = 'rgba(120,200,255,.7)'; g.beginPath(); g.ellipse(512, 226, 54, 8, 0, 0, TAU); g.fill(); g.restore();
    tree(g, T);
    g.fillStyle = '#ff7ad0'; [[380, 214], [640, 212], [600, 218]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1] - 10, 6, 0, TAU); g.fill(); g.fillStyle = '#7a4a22'; g.fillRect(p[0] - 1.5, p[1] - 6, 3, 8); g.fillStyle = '#ff7ad0'; });
    hero(g, T, 404, 222, 1, { hair: '#ffcf3a', armor: '#d8642a', trim: '#f0c040', leg: '#5a3a2a', weapon: 'axe', wa: -0.35, lean: 0.2 });
    hero(g, T, 452, 226, 1, { hair: '#b05ae8', armor: '#6a5ad8', trim: '#f0c040', leg: '#3a2a5a', weapon: 'blade', wa: 0.25, ears: 1, tail: 1, cape: '#8a3ad8', lean: 0.1, armUp: 0 });
    hero(g, T, 594, 228, 1, { armor: '#3a9ad0', trim: '#e8d070', leg: '#2a3a5a', weapon: 'sword', wa: 0.55, shield: '#2ad8c8', helm: '#d8e4f4', wings: 1, flip: 1, lean: 0.08, armUp: 0 });
    hero(g, T, 642, 222, 1, { armor: '#b83a7a', trim: '#f0c040', leg: '#3a2a3a', weapon: 'sword', wa: -0.3, helm: '#e8b0c8', plume: '#ff4a7a', cape: '#7a1a4a', flip: 1, lean: 0.16 });
    if (full) { T.mystic(g, 300, 60, 430, 190, { seed: 29, motes: 16 }); [[372, 150, 7], [668, 140, 8], [560, 64, 6], [450, 190, 5], [700, 196, 6]].forEach(function (q, i) { T.spark(g, q[0], q[1], q[2], i % 2 ? '#c8fcff' : '#fff2c0', 0.9); }); }   /* gl-r20 fireflies */
    portal(g, T, full);
  }
  function portal(g, T, full) {
    var cx = 512, cy = 430; g.save(); g.fillStyle = T.rad(g, cx, cy, 4, 150, [0, 'rgba(255,255,255,.95)', 0.12, 'rgba(160,240,255,.9)', 0.4, 'rgba(110,80,255,.8)', 0.75, 'rgba(60,30,160,.75)', 1, 'rgba(20,20,90,.0)']); g.beginPath(); g.ellipse(cx, cy, 170, 130, 0, 0, TAU); g.fill();
    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; var C = ['#5af0ff', '#b86aff', '#3a8aff', '#ff6ad8', '#7af4c8'];
    for (var k = 0; k < (full ? 10 : 6); k++) { g.strokeStyle = C[k % 5]; g.globalAlpha = 0.55; g.lineWidth = 9 - (k % 3) * 2; g.beginPath(); for (var t = 0; t <= 1; t += 0.02) { var a = k * TAU / (full ? 10 : 6) + t * 4.2, r = 14 + t * 150; var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.72; if (t === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
    g.restore();
  }
  /* ---------- the frame: gold + bronze shield, teal neon line, 8 gems, vines ---------- */
  function frame(g, T, L) {
    g.save(); shield(g); g.lineWidth = 30; g.strokeStyle = INK; g.stroke(); g.lineWidth = 24; g.strokeStyle = T.lin(g, 262, 34, 762, 556, [0, '#fff2b0', 0.2, '#e8b040', 0.45, '#8a5a1a', 0.6, '#f0c860', 0.8, '#a86a10', 1, '#f0d070']); g.stroke();
    g.lineWidth = 6; g.strokeStyle = '#5a3a1a'; g.stroke(); g.restore();
    g.save(); shield(g); g.clip(); g.lineWidth = 62; g.strokeStyle = T.lin(g, 0, 34, 0, 556, [0, '#14306a', 1, '#0a1640']); shield(g); g.stroke(); g.restore();
    g.save(); g.strokeStyle = L.rune; g.shadowColor = L.rune; g.shadowBlur = 8; g.lineWidth = 2.6; g.lineCap = 'round'; g.lineJoin = 'round'; var r = T.rng(31), RP = [];
    for (var x = 330; x <= 700; x += 34) RP.push([x, 52, 0]); for (var y = 100; y <= 360; y += 34) { RP.push([280, y, -Math.PI / 2]); RP.push([744, y, Math.PI / 2]); }
    RP.forEach(function (q) { if (Math.abs(q[1] - 166) < 26 && q[1] > 100) return; g.save(); g.translate(q[0], q[1]); g.rotate(q[2]); g.beginPath(); glyph(g, Math.floor(r() * 8), 7); g.stroke(); g.restore(); }); g.restore();
    g.save(); g.translate(512, 295); g.scale(0.876, 0.89); g.translate(-512, -295); shield(g); g.lineWidth = 5; g.strokeStyle = T.lin(g, 262, 34, 762, 556, [0, '#fff2b0', 0.5, '#c8901a', 1, '#f0d070']); g.stroke(); g.lineWidth = 2.5; g.strokeStyle = '#7af8ff'; g.shadowColor = '#5af0ff'; g.shadowBlur = 14; g.stroke(); g.restore();
    [[262, 72, 0], [762, 72, 1]].forEach(function (c) { g.save(); g.translate(c[0], c[1]); g.beginPath(); g.moveTo(0, -30); g.lineTo(14, -6); g.lineTo(0, 24); g.lineTo(-14, -6); g.closePath(); g.fillStyle = T.lin(g, 0, -30, 0, 24, [0, '#c8fff8', 0.5, '#2ad8c8', 1, '#0a6a7a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#a86a10'; g.stroke(); g.restore(); });
    var G = [[312, 166, '#8a4ae8', 'leaf'], [712, 166, '#ffb81a', 'sun'], [318, 418, '#a84ae8', 'claw'], [706, 418, '#ff9a2a', 'flame'], [384, 480, '#e83a3a', 'flame'], [468, 508, '#ffb81a', 'sword'], [556, 508, '#2ad8a0', 'leaf'], [640, 480, '#3a8aff', 'shield']];
    G.forEach(function (q) { gem(g, T, q[0], q[1], 26, q[2], q[3]); });
    g.save(); g.translate(512, 540); g.beginPath(); g.moveTo(0, -22); g.lineTo(16, 0); g.lineTo(0, 22); g.lineTo(-16, 0); g.closePath(); g.fillStyle = T.lin(g, 0, -22, 0, 22, [0, '#d8fff8', 0.5, '#38d8d0', 1, '#0a6a7a']); g.shadowColor = '#5af0ff'; g.shadowBlur = 12; g.fill(); g.shadowBlur = 0; g.lineWidth = 4; g.strokeStyle = '#a86a10'; g.stroke(); g.restore();
  }
  /* gl-r19: a cut jewel in a bevelled gold setting with the emblem in raised gold on top (the picture's medallions) */
  function gem(g, T, x, y, R, col, k) {
    g.save(); g.beginPath(); g.arc(x, y, R + 7, 0, TAU); g.fillStyle = INK; g.fill();
    g.beginPath(); g.arc(x, y, R + 5, 0, TAU); g.fillStyle = T.lin(g, x - R, y - R, x + R, y + R, [0, '#fff6c0', 0.35, '#f0c040', 0.7, '#a86a10', 1, '#e8c060']); g.fill();
    g.beginPath(); g.arc(x, y, R + 1.5, 0, TAU); g.fillStyle = T.lin(g, x + R, y + R, x - R, y - R, [0, '#fff2b0', 0.5, '#b07818', 1, '#6a4008']); g.fill();
    var n = 8, r0 = R - 0.5, r1 = R * 0.5; for (var i = 0; i < n; i++) { var a0 = i * TAU / n - Math.PI / 2, a1 = a0 + TAU / n, am = (a0 + a1) / 2, li = Math.cos(am + 2.3);
      g.beginPath(); g.moveTo(x + Math.cos(a0) * r0, y + Math.sin(a0) * r0); g.lineTo(x + Math.cos(a1) * r0, y + Math.sin(a1) * r0); g.lineTo(x + Math.cos(a1) * r1, y + Math.sin(a1) * r1); g.lineTo(x + Math.cos(a0) * r1, y + Math.sin(a0) * r1); g.closePath();
      g.fillStyle = sh(col, li > 0 ? 0.45 * li : 0.55 * li); g.fill(); }
    g.beginPath(); for (i = 0; i < n; i++) { var aa = i * TAU / n - Math.PI / 2; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(aa) * r1, y + Math.sin(aa) * r1); } g.closePath(); g.fillStyle = T.rad(g, x - r1 * 0.3, y - r1 * 0.4, 1, r1 * 1.2, [0, sh(col, 0.55), 0.6, col, 1, sh(col, -0.35)]); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; for (i = 0; i < n; i++) { var ab = i * TAU / n - Math.PI / 2; g.beginPath(); g.moveTo(x + Math.cos(ab) * r1, y + Math.sin(ab) * r1); g.lineTo(x + Math.cos(ab) * r0, y + Math.sin(ab) * r0); g.stroke(); }
    g.translate(x, y); g.beginPath(); var s = R * 0.5;
    if (k === 'leaf') { g.moveTo(0, -s); g.quadraticCurveTo(s, -s * 0.2, 0, s); g.quadraticCurveTo(-s, -s * 0.2, 0, -s); g.moveTo(-s * 0.9, -s * 0.1); g.quadraticCurveTo(-s * 0.5, s * 0.6, 0, s); g.quadraticCurveTo(-s * 0.9, s * 0.4, -s * 0.9, -s * 0.1); g.moveTo(s * 0.9, -s * 0.1); g.quadraticCurveTo(s * 0.5, s * 0.6, 0, s); g.quadraticCurveTo(s * 0.9, s * 0.4, s * 0.9, -s * 0.1); }
    else if (k === 'sun') { for (var j = 0; j < 16; j++) { var b = j * TAU / 16, q = j % 2 ? s * 0.55 : s; g.lineTo(Math.cos(b) * q, Math.sin(b) * q); } g.closePath(); }
    else if (k === 'claw') { [-0.5, 0, 0.5].forEach(function (d) { g.moveTo(d * s * 1.2, s * 0.6); g.quadraticCurveTo(d * s * 1.6, -s * 0.2, d * s * 0.8, -s); g.quadraticCurveTo(d * s * 0.8 + s * 0.15, -s * 0.2, d * s * 1.2 + s * 0.2, s * 0.6); }); }
    else if (k === 'flame') { g.moveTo(0, -s); g.quadraticCurveTo(s * 0.9, -s * 0.1, s * 0.5, s * 0.7); g.quadraticCurveTo(0, s, -s * 0.5, s * 0.7); g.quadraticCurveTo(-s * 0.9, -s * 0.1, 0, -s); }
    else if (k === 'sword') { g.moveTo(0, -s); g.lineTo(s * 0.18, s * 0.4); g.lineTo(s * 0.55, s * 0.4); g.lineTo(s * 0.55, s * 0.55); g.lineTo(-s * 0.55, s * 0.55); g.lineTo(-s * 0.55, s * 0.4); g.lineTo(-s * 0.18, s * 0.4); g.closePath(); }
    else { g.moveTo(-s * 0.8, -s * 0.8); g.lineTo(s * 0.8, -s * 0.8); g.lineTo(s * 0.8, 0); g.quadraticCurveTo(s * 0.7, s * 0.7, 0, s); g.quadraticCurveTo(-s * 0.7, s * 0.7, -s * 0.8, 0); g.closePath(); }
    g.lineWidth = 3; g.strokeStyle = 'rgba(40,20,0,.7)'; g.lineJoin = 'round'; g.stroke(); g.fillStyle = T.lin(g, 0, -s, 0, s, [0, '#fff6c0', 0.5, '#f0c040', 1, '#b07818']); g.fill();
    g.restore(); g.save(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(x - R * 0.35, y - R * 0.45, R * 0.28, R * 0.12, -0.6, 0, TAU); g.fill(); g.restore();
  }
  function vines(g, T, full, outer) {
    var V = [[240, 220, 180, 320, 282, 470, 1], [282, 470, 320, 530, 270, 572, 0.8], [70, 340, 140, 450, 200, 572, 0.9], [790, 180, 850, 280, 760, 420, 1], [760, 420, 720, 500, 660, 530, 0.8], [830, 470, 880, 530, 900, 572, 0.7]];
    if (!outer) V = [V[0], V[1], V[3], V[4]];
    g.save(); g.lineCap = 'round'; V.forEach(function (v) { g.beginPath(); g.moveTo(v[0], v[1]); g.quadraticCurveTo(v[2], v[3], v[4], v[5]); g.strokeStyle = '#123a14'; g.lineWidth = 15 * v[6]; g.stroke(); g.strokeStyle = '#3a9a34'; g.lineWidth = 10.5 * v[6]; g.stroke(); g.strokeStyle = 'rgba(190,255,140,.55)'; g.lineWidth = 3 * v[6]; g.save(); g.translate(-2.5 * v[6], -2 * v[6]); g.stroke(); g.restore();   /* gl-r19: thicker vines with a light edge */
      g.strokeStyle = '#2a7a28'; g.lineWidth = 3 * v[6]; for (var t = 0.08; t < 0.95; t += 0.11) { var u = 1 - t, x = u * u * v[0] + 2 * u * t * v[2] + t * t * v[4], y = u * u * v[1] + 2 * u * t * v[3] + t * t * v[5]; g.beginPath(); g.arc(x, y, 7 * v[6], 0.2, 1.4); g.stroke(); } });
    var r = T.rng(11); V.forEach(function (v) { for (var i = 1; i <= 4; i++) { var t = i / 5, u = 1 - t, x = u * u * v[0] + 2 * u * t * v[2] + t * t * v[4], y = u * u * v[1] + 2 * u * t * v[3] + t * t * v[5]; leaf(g, T, x, y, 20 * v[6], r() * TAU); } });
    if (full) [[214, 214, 24, -2.2], [236, 196, 19, -1.4], [800, 172, 24, -0.6], [820, 200, 19, 0.4], [100, 400, 22, 3.6], [880, 510, 19, 2.2]].forEach(function (l, i) { if (outer || i < 4) leaf(g, T, l[0], l[1], l[2], l[3]); });
    g.restore();
  }
  function leaf(g, T, x, y, s, a) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.6, -s * 0.55, s * 1.6, 0); g.quadraticCurveTo(s * 0.6, s * 0.55, 0, 0); g.fillStyle = T.lin(g, 0, -s * 0.5, 0, s * 0.5, [0, '#9af06a', 1, '#2a8a2a']); g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#174a17'; g.stroke(); g.beginPath(); g.moveTo(0, 0); g.lineTo(s * 1.4, 0); g.strokeStyle = 'rgba(20,70,20,.6)'; g.stroke(); g.restore(); }
  function dust(g, T, full) { var r = T.rng(23); g.save(); for (var i = 0; i < (full ? 60 : 24); i++) { var x = 220 + r() * 600, y = 30 + r() * 520; if (x > 280 && x < 744 && y > 50 && y < 530) continue; var c = ['#ffe28a', '#7af8ff', '#ffffff'][i % 3]; g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 8; g.beginPath(); g.arc(x, y, 1.2 + r() * 2.6, 0, TAU); g.fill(); } g.restore();
    [[748, 62, 26], [262, 300, 16], [808, 130, 14], [232, 420, 14], [790, 350, 16]].forEach(function (s, i) { if (full || i < 2) GameLogos.tools.spark(g, s[0], s[1], s[2], i % 2 ? '#c8fcff' : '#fff6c8', 1); }); }
  /* gl-r19 draft 2: carved serif letters (T.serif) like the picture — A gold-into-teal, v a teal, t e e gold, r teal; dark ink outline + gold rim */
  function word(g, T, L, cx, base, size, glow) {
    var GD = [0, '#fff6c0', 0.4, '#f6cc4a', 0.75, '#d08a1a', 1, '#8a4a08'], TL = [0, '#e0fffa', 0.4, '#4ae0d0', 0.75, '#12a0a8', 1, '#06505a'], AG = [0, '#fff2b0', 0.35, '#f0c040', 0.6, '#3ad0c0', 1, '#0a6a7a'], P = [AG, TL, TL, GD, GD, GD, TL];
    var o = { spacing: 0.02, dark: INK, outline: size * 0.13, depth: size * 0.07, side: '#06243a', condense: 0.84, ring: '#ffe28a', ringW: size * 0.04, glow: glow ? 'rgba(90,240,255,.42)' : null, glowBlur: 0.22, glowN: 2,
      scale: function (j) { return j ? 1.13 : 1; }, face: function (j) { return P[j]; } };
    T.serif(g, 'Avateer', cx, base, size, o);
  }
  function emblem(g, T, L, full, outer) { g.save(); shield(g); g.clip(); world(g, T, L, full); g.restore(); vines(g, T, full, outer); frame(g, T, L); crown(g, T); word(g, T, L, 510, 394, 136, full); dust(g, T, full); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { sky(g, T, L); ring(g, T, L, 446, 494, 512, 290, 46); emblem(g, T, L, true, true); return; }
    if (kind === 'main') { g.translate(-192, -6); emblem(g, T, L, px >= 300); return; }
    if (kind === 'wide') { g.save(); g.translate(24, 14); g.scale(0.32, 0.32); g.translate(-262, -12); g.save(); shield(g); g.clip(); world(g, T, L, false); g.restore(); frame(g, T, L); crown(g, T); g.restore(); word(g, T, L, 530, 160, 122, false); return; }
    if (kind === 'badge') { g.translate(200, 196); g.scale(0.68, 0.68); g.translate(-512, -290); g.save(); shield(g); g.clip(); world(g, T, L, false); g.restore(); frame(g, T, L); crown(g, T); if (px >= 90) word(g, T, L, 512, 392, 116, false); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO avateer END

// 🏷️ LOGO beatcorner START — 🎵 BeatCorner, drawn in code from Aowu's picture (gl-28, round 11). A neon rounded-square stage icon: glowing beat
// discs flying to the corners with light trails, a keyboard, a drum kit, two guitars (our own shapes, no real models), a speaker and a mixer, a
// firework burst, music notes on a curling staff, up arrows, equaliser bars, a cheering crowd; "Beat" pink → orange + "Corner" cyan → green with a
// ▶ inside the o and a sound wave over "ner"; a gold disc swooping under the word; "×50" combo; the gold corner stage. Looks = BeatCorner.html
// THEMES (neon = classic · candy · space · jungle · robot · ocean): background, icon rim and the 4 disc colours.
GameLogos.add('beatcorner', (function () {
  var BOX = { scene: [1024, 572], main: [620, 600], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, IX = 236, IY = 22, IW = 556, IH = 528, ICX = 514, ICY = 286;
  function mk(bg, rim, d) { return { bg: bg, rim: rim, disc: d }; }
  var LOOK = { classic: mk(['#2a1868', '#0a0626'], ['#ff5ad8', '#9a6aff', '#3ae8ff', '#ffd23a'], ['#ff3a5a', '#3adf5a', '#3a8aff', '#ffd23a']),
    candy: mk(['#ff8ac8', '#7a1a5a'], ['#ff4d8d', '#ffb020', '#7a5cfa', '#4cb963'], ['#ff4d4d', '#ffb020', '#7a5cfa', '#4cb963']),
    space: mk(['#25285a', '#05061a'], ['#8ec5ff', '#c39bff', '#7cffcb', '#ffd84d'], ['#ffa94d', '#7cffcb', '#8ec5ff', '#c39bff']),
    jungle: mk(['#3a7a3a', '#0e2a12'], ['#f9a825', '#2e7d32', '#00897b', '#c2185b'], ['#c2185b', '#2e7d32', '#00897b', '#f9a825']),
    robot: mk(['#4a525e', '#14181e'], ['#3d8bfd', '#14b8a6', '#ff7a1a', '#facc15'], ['#e5484d', '#14b8a6', '#3d8bfd', '#facc15']),
    ocean: mk(['#1a7ab8', '#062a57'], ['#00b4d8', '#2a9d8f', '#f4a261', '#ff8fa3'], ['#ff8fa3', '#2a9d8f', '#0077b6', '#e9c46a']) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* ---------- the blurred concert stage behind the icon (scene only) ---------- */
  function stage(g, T, L) {
    g.fillStyle = T.lin(g, 0, 0, 0, 572, [0, '#0e1430', 0.55, '#1a1440', 1, '#06060e']); g.fillRect(0, 0, 1024, 572);
    g.save(); g.globalCompositeOperation = 'lighter';
    [[120, 130, '#3ab8ff'], [205, 150, '#3ab8ff'], [820, 140, '#3ab8ff'], [900, 120, '#3ab8ff']].forEach(function (s) { g.fillStyle = T.rad(g, s[0], s[1], 2, 60, [0, 'rgba(200,240,255,.9)', 0.3, 'rgba(80,170,255,.35)', 1, 'rgba(0,0,0,0)']); g.fillRect(s[0] - 60, s[1] - 60, 120, 120);
      g.fillStyle = T.lin(g, 0, s[1], 0, 520, [0, 'rgba(120,200,255,.22)', 1, 'rgba(0,0,0,0)']); g.beginPath(); g.moveTo(s[0] - 8, s[1]); g.lineTo(s[0] + 8, s[1]); g.lineTo(s[0] + 90, 520); g.lineTo(s[0] - 90, 520); g.closePath(); g.fill(); });
    g.restore();
    g.strokeStyle = 'rgba(70,80,110,.6)'; g.lineWidth = 6; [[70, 70, 70, 400], [230, 80, 230, 400], [800, 80, 800, 400], [960, 70, 960, 400], [60, 96, 240, 96], [790, 96, 970, 96]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    var r = T.rng(9); for (var i = 0; i < 26; i++) { var x = i < 13 ? 20 + i * 16 : 790 + (i - 13) * 16, hh = 30 + r() * 90; g.fillStyle = 'hsla(' + (i * 22) % 360 + ',90%,60%,.25)'; for (var y = 0; y < hh; y += 7) g.fillRect(x, 330 - y, 12, 5); }
    g.fillStyle = 'rgba(10,8,24,.85)'; crowd(g, T, 0, 1024, 470, 1.3, 3);
    g.save(); g.globalAlpha = 0.35; g.font = '700 54px ' + T.FONT; g.fillStyle = '#ff7ad8'; g.fillText('×50', 120, 260); g.restore();
    [[150, 300], [195, 300]].forEach(function (s) { g.globalAlpha = 0.35; g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], 18, 8); g.fill(); }); g.globalAlpha = 1;
  }
  function crowd(g, T, x0, x1, y, s, seed) {   // dark silhouettes with raised hands
    var r = T.rng(seed); for (var x = x0; x < x1; x += 22 * s + r() * 10 * s) { var h = (26 + r() * 18) * s, hx = x + r() * 6;
      g.beginPath(); g.arc(hx, y - h, 8 * s, 0, TAU); g.fill(); g.beginPath(); g.ellipse(hx, y - h * 0.35, 12 * s, h * 0.6, 0, 0, TAU); g.fill();
      if (r() < 0.6) { var a = r() < 0.5 ? -1 : 1; g.beginPath(); g.moveTo(hx + a * 6 * s, y - h * 0.7); g.lineTo(hx + a * (14 + r() * 8) * s, y - h - (14 + r() * 14) * s); g.lineWidth = 5 * s; g.strokeStyle = g.fillStyle; g.lineCap = 'round'; g.stroke(); } }
  }
  /* ---------- the icon ---------- */
  function shape(g, T) { T.rr(g, IX, IY, IW, IH, 70); }
  function rim(g, T, L) {
    g.save(); shape(g, T); g.shadowColor = L.rim[0]; g.shadowBlur = 26; g.lineWidth = 16; g.strokeStyle = T.lin(g, IX, IY, IX + IW, IY + IH, [0, L.rim[0], 0.35, L.rim[1], 0.65, L.rim[2], 1, L.rim[3]]); g.stroke(); g.shadowBlur = 0;
    g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.75)'; T.rr(g, IX + 5, IY + 5, IW - 10, IH - 10, 65); g.stroke(); g.lineWidth = 3; g.strokeStyle = '#120a2a'; T.rr(g, IX + 11, IY + 11, IW - 22, IH - 22, 60); g.stroke(); g.restore();
  }
  function inside(g, T, L, full) {
    g.fillStyle = T.rad(g, 480, 220, 20, 420, [0, sh(L.bg[0], 0.15), 0.6, L.bg[0], 1, L.bg[1]]); g.fillRect(IX, IY, IW, IH);
    // equaliser bars round the edges
    var r = T.rng(4); for (var i = 0; i < 36; i++) { var x = IX + 20 + i * 15, hh = 20 + Math.abs(Math.sin(i * 0.7)) * 70 + r() * 30, top = i < 7 || i > 28; if (!top && !full) continue;
      for (var y = 0; y < hh; y += 7) { g.fillStyle = 'hsla(' + ((i * 14 + y) % 360) + ',95%,62%,' + (0.18 + 0.4 * (1 - y / hh)) + ')'; g.fillRect(x, 300 - y, 11, 5); } }
    for (i = 0; i < 18; i++) { var bx = 520 + i * 15, bh = 14 + Math.abs(Math.sin(i * 0.9 + 1)) * 40; for (y = 0; y < bh; y += 7) { g.fillStyle = 'hsla(' + (280 + i * 8) % 360 + ',90%,65%,.45)'; g.fillRect(bx, 520 - y, 11, 5); } }
    T.mystic(g, IX, IY, IW, 280, { seed: 8, stars: full ? 40 : 16 });
    // spotlight burst behind the keyboard + firework
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 430, 200, 4, 170, [0, 'rgba(255,240,180,.9)', 0.25, 'rgba(255,170,80,.35)', 1, 'rgba(0,0,0,0)']); g.fillRect(250, 30, 360, 340);
    var rr = T.rng(12); for (i = 0; i < (full ? 46 : 22); i++) { var a = -Math.PI / 2 + (rr() - 0.5) * 2.6, len = 60 + rr() * 110, x0 = 430, y0 = 200; g.strokeStyle = ['#ffe28a', '#ffb43a', '#fff4c8', '#ff8ad8'][i % 4]; g.lineWidth = 1.4 + rr() * 1.6; g.globalAlpha = 0.5 + rr() * 0.5; g.beginPath(); g.moveTo(x0 + Math.cos(a) * len * 0.35, y0 + Math.sin(a) * len * 0.35); g.lineTo(x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); g.stroke(); }
    g.restore(); g.globalAlpha = 1;
    // crowd in the middle band + front
    g.fillStyle = 'rgba(30,14,60,.92)'; crowd(g, T, IX + 10, IX + IW - 10, 290, 1, 7);
    if (full) { notes(g, T); arrows(g, T); }
    [[384, 72, 20, '#ffd23a'], [420, 94, 14, '#ffe08a'], [600, 176, 17, '#ffd23a'], [640, 150, 13, '#ffe08a'], [668, 132, 15, '#ffd23a'], [356, 120, 11, '#ffe08a']].forEach(function (s, i) { if (!full && i > 2) return; g.fillStyle = s[3]; g.strokeStyle = '#7a3a00'; g.lineWidth = 1.5; T.star(g, s[0], s[1], s[2], s[2] * 0.45); g.fill(); g.stroke(); });
    speaker(g, T, 296, 236); guitar(g, T, 460, 112, 0.42, '#d8342a', 1); drums(g, T, L, 590, 230); guitar(g, T, 690, 180, -0.5, '#f0a030', 0.9); if (full) mixer(g, T, 700, 262);
    keyboard(g, T, 340, 222);
    g.fillStyle = 'rgba(16,8,36,.95)'; crowd(g, T, IX + 6, IX + IW - 6, 548, 1.15, 13);
    corner(g, T, L);
  }
  function notes(g, T) {
    g.save(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.35)'; for (var k = 0; k < 4; k++) { g.beginPath(); g.moveTo(520, 140 + k * 7); g.bezierCurveTo(580, 80 + k * 7, 620, 130 + k * 7, 700, 60 + k * 7); g.stroke(); }
    [[548, 112, '#ff7ad8'], [578, 98, '#ffd23a'], [606, 104, '#3ae8ff'], [636, 84, '#7aff6a'], [664, 70, '#c87aff'], [652, 46, '#ff5ad8']].forEach(function (n, i) { g.fillStyle = n[2]; g.strokeStyle = n[2]; g.shadowColor = n[2]; g.shadowBlur = 8; g.beginPath(); g.ellipse(n[0], n[1], 7, 5.2, -0.4, 0, TAU); g.fill(); g.lineWidth = 2.4; g.beginPath(); g.moveTo(n[0] + 6, n[1] - 1); g.lineTo(n[0] + 6, n[1] - 26); g.quadraticCurveTo(n[0] + 14, n[1] - 20, n[0] + 16, n[1] - 12); g.stroke(); });
    g.shadowBlur = 0; g.restore();
  }
  function arrows(g, T) {
    [[620, 200, 760, 96, '#3ae8ff'], [640, 250, 750, 150, '#ff6ad8']].forEach(function (a) { g.save(); g.lineCap = 'round'; g.shadowColor = a[4]; g.shadowBlur = 12; g.strokeStyle = a[4]; g.lineWidth = 9; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[2], a[3]); g.stroke();
      var an = Math.atan2(a[3] - a[1], a[2] - a[0]); g.translate(a[2], a[3]); g.rotate(an); g.fillStyle = a[4]; g.beginPath(); g.moveTo(14, 0); g.lineTo(-12, -14); g.lineTo(-12, 14); g.closePath(); g.fill(); g.restore(); });
  }
  function speaker(g, T, x, y) {
    g.save(); g.translate(x, y); g.rotate(-0.08); T.rr(g, -24, -40, 48, 80, 6); g.fillStyle = T.lin(g, -24, 0, 24, 0, [0, '#4a4a5a', 1, '#1a1a24']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#0a0a12'; g.stroke();
    [[0, -18, 11], [0, 16, 15]].forEach(function (c) { g.fillStyle = '#0c0c14'; g.beginPath(); g.arc(c[0], c[1], c[2], 0, TAU); g.fill(); g.strokeStyle = '#6a6a7a'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#3a3a48'; g.beginPath(); g.arc(c[0], c[1], c[2] * 0.4, 0, TAU); g.fill(); }); g.restore();
  }
  function keyboard(g, T, x, y) {   // tilted synth: dark body, white + black keys, knobs + a small screen
    g.save(); g.translate(x, y); g.transform(1, -0.22, 0.42, 1, 0, 0);
    T.rr(g, 0, 0, 180, 62, 6); g.fillStyle = T.lin(g, 0, 0, 0, 62, [0, '#4a4a58', 1, '#16161e']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#08080e'; g.stroke();
    g.fillStyle = '#3ae8ff'; g.fillRect(12, 6, 34, 10); [60, 76, 92, 108].forEach(function (k) { g.fillStyle = '#c8c8d8'; g.beginPath(); g.arc(k, 11, 4, 0, TAU); g.fill(); }); g.fillStyle = '#ff5ad8'; g.fillRect(130, 6, 38, 6);
    for (var i = 0; i < 17; i++) { g.fillStyle = '#f8f8ff'; g.fillRect(8 + i * 9.8, 22, 8.6, 34); }
    for (i = 0; i < 16; i++) { if ([2, 6, 9, 13].indexOf(i % 14) >= 0) continue; g.fillStyle = '#14141c'; g.fillRect(13.5 + i * 9.8, 22, 5.6, 20); }
    g.restore();
  }
  function guitar(g, T, x, y, rot, col, s) {   // our own electric guitar: body, neck, head, strings
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    g.fillStyle = '#5a3a1a'; g.fillRect(-4, -96, 8, 100); g.fillStyle = '#2a1a0a'; T.rr(g, -7, -118, 14, 24, 4); g.fill(); g.fillStyle = '#e8e8f0'; [-110, -103, -96].forEach(function (k) { g.beginPath(); g.arc(-9, k, 2.4, 0, TAU); g.arc(9, k, 2.4, 0, TAU); g.fill(); });
    g.beginPath(); g.moveTo(0, -6); g.bezierCurveTo(-30, -14, -34, 18, -22, 28); g.bezierCurveTo(-30, 46, -10, 62, 0, 56); g.bezierCurveTo(18, 64, 34, 44, 24, 26); g.bezierCurveTo(32, 14, 22, -16, 0, -6); g.closePath();
    g.fillStyle = T.lin(g, -30, -10, 30, 60, [0, sh(col, 0.35), 0.5, col, 1, sh(col, -0.4)]); g.fill(); g.lineWidth = 3; g.strokeStyle = '#1a0a08'; g.stroke();
    g.fillStyle = '#f4f0e0'; g.beginPath(); g.ellipse(-2, 28, 12, 18, 0.3, 0, TAU); g.fill(); g.fillStyle = '#2a2a30'; g.fillRect(-8, 22, 16, 4); g.fillRect(-8, 34, 16, 4);
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 0.8; [-2, 0, 2].forEach(function (d) { g.beginPath(); g.moveTo(d, -96); g.lineTo(d, 44); g.stroke(); }); g.restore();
  }
  function drums(g, T, L, x, y) {
    function drum(cx, cy, rx, ry, h, col) { g.fillStyle = T.lin(g, cx - rx, 0, cx + rx, 0, [0, sh(col, -0.3), 0.4, sh(col, 0.25), 1, sh(col, -0.5)]); g.beginPath(); g.ellipse(cx, cy + h, rx, ry, 0, 0, Math.PI); g.lineTo(cx - rx, cy); g.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = '#1a0608'; g.stroke();
      g.fillStyle = '#f4f4fa'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.fill(); g.stroke(); g.strokeStyle = '#d8d8e0'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(cx, cy + h, rx, ry, 0, 0, Math.PI); g.stroke(); }
    function cymbal(cx, cy, r) { g.strokeStyle = '#8a8a90'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (cx < x ? 8 : -8), cy + 70); g.stroke(); g.fillStyle = T.lin(g, cx - r, cy, cx + r, cy, [0, '#a8781a', 0.5, '#ffe08a', 1, '#a8781a']); g.beginPath(); g.ellipse(cx, cy, r, r * 0.26, -0.08, 0, TAU); g.fill(); g.strokeStyle = '#6a4a0a'; g.lineWidth = 1.5; g.stroke(); }
    cymbal(x - 58, y - 62, 34); cymbal(x + 56, y - 52, 32);
    drum(x - 28, y - 40, 22, 8, 22, '#d8342a'); drum(x + 22, y - 36, 22, 8, 22, '#d8342a'); drum(x + 58, y - 6, 18, 7, 26, '#d8342a');
    g.fillStyle = T.lin(g, x - 40, 0, x + 40, 0, [0, '#8a1a1a', 0.5, '#e84a3a', 1, '#6a0a0a']); g.beginPath(); g.ellipse(x - 6, y + 22, 36, 38, 0, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = '#1a0608'; g.stroke();
    g.fillStyle = '#f8f4ec'; g.beginPath(); g.ellipse(x, y + 22, 28, 32, 0, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = '#d8d8e0'; g.stroke(); g.fillStyle = '#1a1a24'; g.beginPath(); g.arc(x + 2, y + 24, 8, 0, TAU); g.fill();
  }
  function mixer(g, T, x, y) { g.save(); g.translate(x, y); g.rotate(-0.12); T.rr(g, -26, -16, 52, 34, 5); g.fillStyle = '#2a2a36'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#0a0a10'; g.stroke(); for (var i = 0; i < 4; i++) { g.fillStyle = ['#3ae8ff', '#ffd23a', '#ff5ad8', '#7aff6a'][i]; g.fillRect(-20 + i * 11, -10, 6, 4); g.fillStyle = '#c8c8d0'; g.fillRect(-18 + i * 11, -2, 2, 14); g.fillRect(-20 + i * 11, 2 + (i % 2) * 5, 6, 3); } g.restore(); }
  function disc(g, T, x, y, r, col, trail) {   // a glowing beat button with a light trail behind it
    g.save(); if (trail) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = T.lin(g, x, y, x + trail[0], y + trail[1], [0, col, 1, 'rgba(0,0,0,0)']); g.lineCap = 'round'; g.lineWidth = r * 1.3; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x, y); g.lineTo(x + trail[0], y + trail[1]); g.stroke(); g.lineWidth = r * 0.5; g.globalAlpha = 0.8; g.strokeStyle = T.lin(g, x, y, x + trail[0], y + trail[1], [0, 'rgba(255,255,255,.9)', 1, 'rgba(255,255,255,0)']); g.stroke(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    g.shadowColor = col; g.shadowBlur = r * 0.9; g.fillStyle = sh(col, -0.45); g.beginPath(); g.ellipse(x, y + r * 0.22, r, r * 0.62, 0, 0, TAU); g.fill(); g.shadowBlur = 0;
    g.fillStyle = T.rad(g, x - r * 0.3, y - r * 0.2, 1, r, [0, sh(col, 0.6), 0.5, col, 1, sh(col, -0.25)]); g.beginPath(); g.ellipse(x, y, r, r * 0.62, 0, 0, TAU); g.fill(); g.lineWidth = Math.max(1.5, r * 0.1); g.strokeStyle = sh(col, 0.7); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(x - r * 0.25, y - r * 0.22, r * 0.4, r * 0.14, -0.2, 0, TAU); g.fill(); g.restore();
  }
  function corner(g, T, L) {   // the gold corner stage at the bottom (a V)
    g.save(); g.lineJoin = 'round'; g.beginPath(); g.moveTo(360, 448); g.lineTo(514, 520); g.lineTo(668, 448); g.lineTo(650, 440); g.lineTo(514, 500); g.lineTo(378, 440); g.closePath();
    g.fillStyle = T.lin(g, 0, 440, 0, 520, [0, '#fff2a0', 0.5, '#f0b030', 1, '#8a5a08']); g.shadowColor = '#ffc83a'; g.shadowBlur = 14; g.fill(); g.restore();
  }
  function discs(g, T, L, full) {
    var D = L.disc; disc(g, T, 340, 100, 24, D[0], [60, 70]); disc(g, T, 312, 160, 22, D[1], [70, 34]);
    disc(g, T, 398, 228, 20, D[2], [40, -14]); disc(g, T, 508, 280, 22, D[1], [-20, -60]);
    disc(g, T, 340, 474, 24, D[0], [80, -40]); disc(g, T, 430, 476, 20, D[2], [50, -60]);
  }
  function word(g, T, L, cx, base, sizeMax, maxW, glow) {
    var P = [['#ffd0f4', '#ff4ad8', '#c01a9a'], ['#ffd8f0', '#ff5ab8', '#c02a7a'], ['#ffe0d0', '#ff7a8a', '#d0384a'], ['#fff0c0', '#ffa03a', '#d0600a'],
      ['#d8fcff', '#3ae8ff', '#0a8ab8'], ['#d0f4ff', '#3abaff', '#0a62c8'], ['#d8e4ff', '#4a8aff', '#1a3ac8'], ['#c8fff0', '#2adcb0', '#0a8a6a'], ['#d8ffd0', '#5aea4a', '#1a9a2a'], ['#f8ffc0', '#c8ec2a', '#6a9a0a']];
    g.save(); g.font = '700 100px ' + T.FONT; var w100 = g.measureText('BeatCorner').width; g.restore();
    var size = Math.min(sizeMax, maxW * 100 / w100);
    var o = { clean: true, spacing: 0, dark: '#14082e', outline: size * 0.2, depth: size * 0.08, fat: size * 0.006, ring: 'rgba(255,255,255,.95)', edge: function (j) { return sh(P[j][2], -0.35); }, edgeW: size * 0.07,
      glow: glow ? 'rgba(200,120,255,.9)' : null, glowN: 2, glowBlur: 0.3, rot: -0.03, wave: function (j) { return [3, 1, 0, 0, -1, -2, -2, -1, 0, 1][j] * size / 80; }, face: function (j) { return [0, P[j][0], 0.45, P[j][1], 1, P[j][2]]; } };
    var W = T.word(g, 'BeatCorner', cx, base, size, o); T.gloss(g, 'BeatCorner', cx, base, size, o, 0.5);
    // ▶ inside the o of Corner, and the sound wave over "ner"
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var xo = cx - W / 2 + g.measureText('BeatC').width + g.measureText('o').width / 2, xn = cx - W / 2 + g.measureText('BeatCor').width, wn = g.measureText('ner').width; g.restore();
    g.save(); g.translate(cx, base); g.rotate(-0.03); g.translate(-cx, -base);
    var oy = base - size * 0.26 + o.wave(5) ; g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(xo - size * 0.07, oy - size * 0.1); g.lineTo(xo + size * 0.1, oy); g.lineTo(xo - size * 0.07, oy + size * 0.1); g.closePath(); g.fill(); g.fillStyle = '#ff5ad8'; g.beginPath(); g.moveTo(xo - size * 0.05, oy - size * 0.065); g.lineTo(xo + size * 0.06, oy); g.lineTo(xo - size * 0.05, oy + size * 0.065); g.closePath(); g.fill();
    if (glow !== 'small') { g.shadowColor = '#3ae8ff'; g.shadowBlur = 8; for (var i = 0; i < 18; i++) { var h = (0.08 + Math.abs(Math.sin(i * 0.9)) * 0.28 * (1 - Math.abs(i - 9) / 11)) * size; g.fillStyle = 'hsl(' + (190 + i * 6) + ',100%,65%)'; g.fillRect(xn + i * wn / 18, base - size * 0.92 - h, wn / 30, h); } }
    g.restore(); return W;
  }
  function swoop(g, T, full) {   // gold disc swooping under the word
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.strokeStyle = T.lin(g, 470, 420, 640, 400, [0, 'rgba(255,220,90,.9)', 1, 'rgba(255,220,90,0)']); g.lineWidth = 10; g.beginPath(); g.moveTo(476, 418); g.quadraticCurveTo(560, 450, 640, 404); g.stroke(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.8)'; g.stroke(); g.restore();
    disc(g, T, 476, 418, 18, '#ffc83a', null);
  }
  function combo(g, T) { T.word(g, '×50', 692, 470, 54, { dark: '#14082e', outline: 10, depth: 4, ring: 'rgba(255,255,255,.95)', glow: 'rgba(255,120,220,.9)', glowBlur: 0.3, face: function (j) { return [0, '#ffe0f8', 0.5, ['#ff5ad8', '#ffd23a', '#ffd23a'][j], 1, '#c03a9a']; } }); }
  function icon(g, T, L, full) {
    g.save(); shape(g, T); g.clip(); inside(g, T, L, full); discs(g, T, L, full); if (full) { swoop(g, T); combo(g, T); } g.restore(); rim(g, T, L);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { stage(g, T, L); icon(g, T, L, true); word(g, T, L, 520, 384, 96, 470, true); return; }
    if (kind === 'main') { var f = px >= 300; g.translate(-206, 6); icon(g, T, L, f); word(g, T, L, 520, 384, 96, 470, f); return; }
    if (kind === 'wide') { g.save(); g.translate(24, 12); g.scale(0.33, 0.33); g.translate(-IX, -IY); icon(g, T, L, false); g.restore(); word(g, T, L, 540, 138, 110, 640, 'small'); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.7, 0.7); g.translate(-ICX, -ICY); icon(g, T, L, false); if (px >= 90) word(g, T, L, 514, 386, 96, 470, false); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO beatcorner END

// 🏷️ LOGO block-drop START — 🧱 Block Drop, drawn in code from Aowu's picture (gl-24, round 8). Glossy falling pieces in the game's OWN shapes + colours
// (SHAPES I O T L J S Z, THEMES col order I O T L J S Z), "Block" with every letter built from blocks (tile seams inside each letter), pink "Drop",
// sparkle trails, fireworks, drop arrows, a purple grid sky with faded blocks. Looks = the game's THEMES (classic · faces · dino · cargo · fantasy · jigsaw).
GameLogos.add('block-drop', (function () {
  var BOX = { scene: [1024, 572], main: [724, 500], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(col, bg) { return { col: col, bg: bg, dark: '#1a0838' }; }
  var LOOK = { classic: mk(['#3FD0E0', '#FFD23F', '#A06CF5', '#FF8A3D', '#3D8BFD', '#4CB963', '#FF5A5F'], ['#7a4ae8', '#3a1a9a', '#120838']),
    faces: mk(['#5ED6E8', '#FFD94F', '#B98CFF', '#FF9E57', '#5C9DFF', '#62CC77', '#FF6F73'], ['#8a6af0', '#4a2fb8', '#1a1050']),
    dino: mk(['#6DBE45', '#C9D84A', '#3E9B5A', '#D4A64A', '#2E7D5B', '#8BC34A', '#C0763E'], ['#a8703a', '#5a3418', '#1e1006']),
    cargo: mk(['#7FB3D5', '#F7DC6F', '#C39BD3', '#E0A458', '#5D8AA8', '#82E0AA', '#F1948A'], ['#2a3a8a', '#101a4a', '#03040F']),
    fantasy: mk(['#7AE7FF', '#FFD36E', '#B57CFF', '#FF9D6E', '#8FA8FF', '#7DFFB2', '#FF7AD9'], ['#b04ac8', '#5a1a7a', '#1e0628']),
    jigsaw: mk(['#A8DADC', '#E9C46A', '#B5838D', '#F4A261', '#7FA7D6', '#8AB17D', '#E76F51'], ['#a8806a', '#5a4436', '#241a14']) };
  var SH = { I: [[0, 0], [0, 1], [0, 2], [0, 3]], O: [[0, 0], [1, 0], [0, 1], [1, 1]], T: [[0, 0], [1, 0], [2, 0], [1, 1]], L: [[0, 0], [0, 1], [0, 2], [1, 2]], J: [[1, 0], [1, 1], [1, 2], [0, 2]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]] };
  var CI = { I: 0, O: 1, T: 2, L: 3, J: 4, S: 5, Z: 6 };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  function cell(g, T, x, y, s, c) {
    var r = s * 0.16; T.rr(g, x, y, s, s, r); g.fillStyle = T.lin(g, x, y, x + s, y + s, [0, sh(c, 0.45), 0.45, c, 1, sh(c, -0.35)]); g.fill();
    g.lineWidth = s * 0.06; g.strokeStyle = sh(c, -0.55); g.stroke();
    T.rr(g, x + s * 0.17, y + s * 0.17, s * 0.66, s * 0.66, r * 0.7); g.fillStyle = T.lin(g, x, y, x + s, y + s, [0, sh(c, 0.2), 1, sh(c, -0.1)]); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; T.rr(g, x + s * 0.12, y + s * 0.08, s * 0.5, s * 0.1, s * 0.05); g.fill();
  }
  function piece(g, T, L, k, x, y, s, rot, glow) {
    var cs = SH[k], c = L.col[CI[k]], mx = 0, my = 0; cs.forEach(function (p) { mx = Math.max(mx, p[0]); my = Math.max(my, p[1]); });
    g.save(); g.translate(x + (mx + 1) * s / 2, y + (my + 1) * s / 2); if (rot) g.rotate(rot); g.translate(-(mx + 1) * s / 2, -(my + 1) * s / 2);
    if (glow) { g.shadowColor = c; g.shadowBlur = 30; } g.shadowOffsetY = glow ? 0 : 6; if (!glow) { g.shadowColor = 'rgba(10,0,40,.45)'; g.shadowBlur = 14; }
    cs.forEach(function (p) { T.rr(g, p[0] * s, p[1] * s, s, s, s * 0.16); g.fillStyle = sh(c, -0.5); g.fill(); }); g.shadowColor = 'transparent';
    cs.forEach(function (p) { cell(g, T, p[0] * s, p[1] * s, s, c); }); g.restore();
  }
  /* ---------- background ---------- */
  function sky(g, T, L, x, y, w, h, full) {
    g.fillStyle = T.rad(g, x + w / 2, y + h * 0.45, 20, Math.max(w, h) * 0.7, [0, L.bg[0], 0.5, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h);
    g.fillStyle = T.rad(g, x + w / 2, y + h * 0.5, 10, Math.min(w, h) * 0.55, [0, 'rgba(255,150,120,.45)', 0.5, 'rgba(255,90,180,.18)', 1, 'rgba(255,90,180,0)']); g.fillRect(x, y, w, h);
    g.save(); g.strokeStyle = 'rgba(200,170,255,.12)'; g.lineWidth = 2; for (var gx = x; gx < x + w; gx += 48) { g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); } for (var gy = y; gy < y + h; gy += 48) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); } g.restore();
    if (full) { g.save(); g.globalAlpha = 0.3; var r = T.rng(5), K = 'IOTLJSZ'; [[0, 470], [0, 520], [48, 520], [96, 520], [920, 0], [968, 0], [968, 48], [920, 470], [968, 470], [920, 520], [968, 520], [872, 520], [0, 0], [48, 0], [0, 260], [968, 260]].forEach(function (p, i) { cell(g, T, p[0], p[1], 48, L.col[i % 7]); }); g.restore(); }
  }
  function trail(g, T, pts, col) { g.save(); g.lineCap = 'round'; g.globalCompositeOperation = 'lighter';
    for (var i = 3; i >= 1; i--) { g.lineWidth = i * 5; g.strokeStyle = col.replace('A', String(0.12 * (4 - i))); g.beginPath(); g.moveTo(pts[0], pts[1]); g.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); g.stroke(); } g.restore(); }
  function firework(g, T, x, y, dir, n, len) { g.save(); g.lineCap = 'round'; var r = T.rng(x | 0);
    for (var i = 0; i < n; i++) { var a = dir + (r() - 0.5) * 2.2, l = len * (0.5 + r() * 0.6); g.strokeStyle = ['#ffd23a', '#ff8a3a', '#fff2a0'][i % 3]; g.lineWidth = 3 + r() * 2; g.shadowColor = '#ffb03a'; g.shadowBlur = 8;
      g.beginPath(); g.moveTo(x + Math.cos(a) * l * 0.35, y + Math.sin(a) * l * 0.35); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } g.restore(); }
  function drops(g, T) { g.save(); g.lineCap = 'round'; [[332, 440, 50], [356, 470, 40], [474, 476, 44], [512, 462, 60], [550, 480, 40], [590, 474, 46], [694, 440, 50], [712, 470, 34]].forEach(function (d, i) {
      var c = i % 2 ? '#ffb8f0' : '#e8e0ff'; g.strokeStyle = c; g.lineWidth = 3; g.shadowColor = c; g.shadowBlur = 8; g.beginPath(); g.moveTo(d[0], d[1]); g.lineTo(d[0], d[1] + d[2]); g.stroke();
      g.beginPath(); g.moveTo(d[0] - 7, d[1] + d[2] - 8); g.lineTo(d[0], d[1] + d[2]); g.lineTo(d[0] + 7, d[1] + d[2] - 8); g.stroke(); }); g.restore(); }
  function gems(g, T, L) { [[402, 78, 0], [232, 248, 6], [280, 200, 1], [750, 128, 4], [810, 168, 5], [758, 214, 6], [222, 168, 3]].forEach(function (p) { g.save(); g.translate(p[0], p[1]); g.rotate(0.5); var c = L.col[p[2]];
      g.beginPath(); g.moveTo(0, -12); g.lineTo(10, 0); g.lineTo(0, 12); g.lineTo(-10, 0); g.closePath(); g.fillStyle = T.lin(g, -10, -12, 10, 12, [0, sh(c, 0.5), 1, sh(c, -0.3)]); g.fill(); g.lineWidth = 2; g.strokeStyle = sh(c, -0.55); g.stroke(); g.restore(); }); }
  function pieces(g, T, L) {
    trail(g, T, [196, 270, 220, 120, 360, 96], 'rgba(160,200,255,A)'); trail(g, T, [200, 300, 260, 150, 400, 120], 'rgba(255,180,240,A)'); trail(g, T, [840, 250, 820, 120, 700, 90], 'rgba(160,220,255,A)');
    piece(g, T, L, 'S', 560, 150, 50, 0); piece(g, T, L, 'Z', 328, 118, 50, 0); piece(g, T, L, 'J', 446, 70, 50, 0); piece(g, T, L, 'T', 518, 70, 50, 0);
    piece(g, T, L, 'I', 672, 70, 46, 0.16, true); piece(g, T, L, 'O', 784, 40, 26, 0.45); piece(g, T, L, 'L', 236, 176, 20, -0.5); gems(g, T, L);
  }
  /* ---------- the words: "Block" built from blocks ---------- */
  function seams(g, T, str, cx, base, size, o, step) {
    var c = document.createElement('canvas'); c.width = g.canvas.width; c.height = g.canvas.height; var h = c.getContext('2d'); h.setTransform(g.getTransform());
    T.word(h, str, cx, base, size, { clean: o.clean, spacing: o.spacing, wave: o.wave, rot: o.rot, dark: 'rgba(0,0,0,0)', outline: 0.01, depth: 0, face: function () { return [0, '#fff', 1, '#fff']; } });
    var m = c; c = document.createElement('canvas'); c.width = m.width; c.height = m.height; h = c.getContext('2d'); h.setTransform(g.getTransform()); h.lineCap = 'butt';   // lines on their own canvas, then kept only inside the letters
    var x0 = cx - size * 3, x1 = cx + size * 3, y0 = base - size, y1 = base + size * 0.3, k = size * 0.02;
    for (var yy = base - size * 0.1; yy > y0; yy -= step) { h.strokeStyle = 'rgba(0,0,40,.4)'; h.lineWidth = k * 1.3; h.beginPath(); h.moveTo(x0, yy); h.lineTo(x1, yy); h.stroke(); h.strokeStyle = 'rgba(255,255,255,.45)'; h.lineWidth = k * 0.7; h.beginPath(); h.moveTo(x0, yy + k * 1.1); h.lineTo(x1, yy + k * 1.1); h.stroke(); }
    for (var xx = cx - size * 2.52; xx < x1; xx += step) { h.strokeStyle = 'rgba(0,0,40,.35)'; h.lineWidth = k * 1.3; h.beginPath(); h.moveTo(xx, y0); h.lineTo(xx, y1); h.stroke(); h.strokeStyle = 'rgba(255,255,255,.35)'; h.lineWidth = k * 0.7; h.beginPath(); h.moveTo(xx + k * 1.1, y0); h.lineTo(xx + k * 1.1, y1); h.stroke(); }
    h.setTransform(1, 0, 0, 1, 0, 0); h.globalCompositeOperation = 'destination-in'; h.drawImage(m, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c, 0, 0); g.restore();
  }
  function block(g, T, L, cx, base, size) {
    var C = [L.col[4], L.col[0], L.col[5], L.col[1], L.col[3]];
    var o = { clean: true, spacing: size * 0.02, dark: L.dark, outline: size * 0.1, depth: size * 0.08, fat: size * 0.004, ring: 'rgba(255,255,255,.92)', glow: 'rgba(200,160,255,.6)', glowBlur: 0.3,   /* gl-r19: clean: true = the B's two holes are closed (no Fredoka notch) */
      edge: function (j) { return sh(C[j], -0.5); }, edgeW: size * 0.04, face: function (j) { return [0, sh(C[j], 0.45), 0.5, C[j], 1, sh(C[j], -0.25)]; }, wave: function (j) { return [0, -2, 0, 2, 0][j] * size / 150; } };
    T.word(g, 'Block', cx, base, size, o); seams(g, T, 'Block', cx, base, size, o, size * 0.36); T.gloss(g, 'Block', cx, base, size, o, 0.45);
  }
  function drop(g, T, L, cx, base, size) {
    var p = L.col[6], q = L.col[2];
    var o = { spacing: size * 0.02, dark: L.dark, outline: size * 0.15, depth: size * 0.08, fat: size * 0.006, ring: 'rgba(255,255,255,.92)', glow: 'rgba(255,120,220,.6)', glowBlur: 0.3,
      edge: function () { return sh(p, -0.5); }, edgeW: size * 0.06, face: function () { return [0, sh(p, 0.5), 0.5, p, 1, sh(q, -0.15)]; }, wave: function (j) { return [0, 2, 2, 0][j] * size / 120; } };
    T.word(g, 'Drop', cx, base, size, o); T.gloss(g, 'Drop', cx, base, size, o, 0.45);
  }
  function stage(g, T, L, full) {
    if (full) { firework(g, T, 240, 340, Math.PI, 14, 90); firework(g, T, 790, 340, 0, 14, 90); firework(g, T, 300, 420, 2.4, 8, 70); firework(g, T, 730, 420, 0.7, 8, 70); }
    pieces(g, T, L); drops(g, T); block(g, T, L, 512, 352, 152); drop(g, T, L, 516, 476, 124);
    if (full) { var r = T.rng(8); for (var i = 0; i < 20; i++) T.spark(g, 220 + r() * 600, 60 + r() * 460, 4 + r() * 8, '#fff', 0.85); [[300, 410], [750, 380], [620, 250]].forEach(function (s) { g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], 11, 5); g.fill(); }); }
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { sky(g, T, L, 0, 0, 1024, 572, true); stage(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-150, -30); stage(g, T, L, px >= 300); return; }
    if (kind === 'wide') { g.save(); g.translate(20, 10); g.scale(0.5, 0.5); g.translate(-330, -40); piece(g, T, L, 'T', 330, 160, 60, 0); piece(g, T, L, 'J', 420, 40, 60, 0); piece(g, T, L, 'S', 470, 220, 60, 0); piece(g, T, L, 'I', 610, 60, 60, 0.14, true); g.restore();
      block(g, T, L, 430, 148, 112); drop(g, T, L, 730, 148, 100); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 10, 10, 380, 380, 72); g.clip(); sky(g, T, L, 10, 10, 380, 380, false); g.translate(200, 200); g.scale(0.62, 0.62); g.translate(-512, -290);
      if (px >= 90) stage(g, T, L, false); else { piece(g, T, L, 'Z', 380, 180, 70, 0); piece(g, T, L, 'J', 470, 40, 70, 0); piece(g, T, L, 'T', 520, 250, 70, 0); piece(g, T, L, 'I', 650, 80, 70, 0.14, true); } g.restore();
      T.rr(g, 10, 10, 380, 380, 72); g.lineWidth = 8; g.strokeStyle = sh(L.bg[0], 0.3); g.stroke(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO block-drop END

// 🏷️ LOGO brawl-buddies START — 🥊 Brawl Buddies, drawn in code from Aowu's picture (gl-11; draft 3 gl-r9: one-piece characters). People as pictured (Aowu).
GameLogos.add('brawl-buddies', (function () {
  var BOX = { scene: [1024, 572], main: [760, 566], wide: [880, 200], badge: [400, 400] };
  function mk(o) { var b = { bg: ['#262a34', '#16181f'], sky: ['#6ac8ff', '#dff5ff'], hill: '#7ad06a', floor: '#b8bcc8', floor2: '#9aa0b0', wall: ['#d8663a', '#a84424'], frame: ['#fff0a0', '#ffc531', '#c9820a'],
    w1: ['#fff36a', '#ffb81a', '#ff6a14', '#e8320a'], w2: ['#d8f4ff', '#5ac0ff', '#2a84f0', '#1a52c8'], dark: '#1a1040', ink: '#2a1408' }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    playground: mk({ sky: ['#8ED6FF', '#E8F7FF'], hill: '#9BD77A', floor: '#D9B77A', floor2: '#C9A46A' }), candy: mk({ sky: ['#FFC1E3', '#FFF0F8'], hill: '#FFD9EC', floor: '#FF9AC9', floor2: '#FF84BC', wall: ['#ff8ac0', '#d85a98'] }),
    dino: mk({ sky: ['#2F6B33', '#B5DE8F'], hill: '#4E8F3A', floor: '#8A6633', floor2: '#7A5A2E', wall: ['#8a6a3a', '#5a4220'] }), moon: mk({ sky: ['#05041A', '#2A1E5C'], hill: '#3A3470', floor: '#C1BED3', floor2: '#A9A6BE', wall: ['#5a5a8a', '#3a3a6a'] }),
    dojo: mk({ sky: ['#F6D7A7', '#FFF4E2'], hill: '#E9C08A', floor: '#D29A5A', floor2: '#C08648', wall: ['#b8562a', '#7a2a12'] }), beach: mk({ sky: ['#4FC3F7', '#E1F5FE'], hill: '#29B6F6', floor: '#F2D49B', floor2: '#E8C27E', wall: ['#e8a85a', '#b87a3a'] }) };
  var TAU = Math.PI * 2;
  function boom(g, T, x, y, R, c1, c2, rot) { g.save(); g.shadowColor = c1; g.shadowBlur = R * 0.3; T.star(g, x, y, R, R * 0.58, 11, rot || 0.2); g.fillStyle = c1; g.fill(); g.restore(); T.star(g, x, y, R * 0.74, R * 0.42, 11, (rot || 0.2) + 0.3); g.fillStyle = c2; g.fill(); }
  function world(g, T, L, x, y, w, h) {   // sky, brick wall on the left, hills + path on the right, pavement
    g.fillStyle = T.lin(g, 0, y, 0, y + h * 0.9, [0, L.sky[0], 0.55, L.sky[0], 1, L.sky[1]]); g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,.85)'; [[x + w * 0.5, y + h * 0.3, 40], [x + w * 0.62, y + h * 0.26, 30], [x + w * 0.3, y + h * 0.4, 26]].forEach(function (c) { g.beginPath(); g.ellipse(c[0], c[1], c[2] * 1.6, c[2] * 0.6, 0, 0, TAU); g.fill(); });
    g.beginPath(); g.moveTo(x + w * 0.56, y + h); g.quadraticCurveTo(x + w * 0.76, y + h * 0.5, x + w, y + h * 0.58); g.lineTo(x + w, y + h); g.closePath(); g.fillStyle = L.hill; g.fill();
    g.beginPath(); g.moveTo(x + w * 0.7, y + h); g.quadraticCurveTo(x + w * 0.96, y + h * 0.82, x + w * 0.86, y + h * 0.7); g.quadraticCurveTo(x + w * 0.8, y + h * 0.64, x + w * 0.92, y + h * 0.6); g.lineWidth = 22; g.strokeStyle = '#e8d49a'; g.lineCap = 'round'; g.stroke();
    // brick wall
    var wx = x, ww = w * 0.3, wy = y + h * 0.3; g.fillStyle = T.lin(g, 0, wy, 0, y + h, [0, L.wall[0], 1, L.wall[1]]); g.fillRect(wx, wy, ww, h * 0.6); g.strokeStyle = 'rgba(60,20,8,.45)'; g.lineWidth = 2; for (var r = 0; r < 12; r++) { var yy = wy + r * 22; g.beginPath(); g.moveTo(wx, yy); g.lineTo(wx + ww, yy); g.stroke(); for (var cx = (r % 2 ? 0 : 22); cx < ww; cx += 44) { g.beginPath(); g.moveTo(wx + cx, yy); g.lineTo(wx + cx, yy + 22); g.stroke(); } }
    g.fillStyle = '#7a8090'; g.fillRect(wx, wy - 12, ww + 10, 14);
    g.save(); g.font = '700 30px ' + T.FONT; g.translate(wx + ww * 0.36, wy + h * 0.32); g.rotate(-0.08); g.lineJoin = 'round'; g.lineWidth = 6; g.strokeStyle = '#1a2a6a'; g.strokeText('GO!', 0, 0); g.fillStyle = '#5ff0ff'; g.fillText('GO!', 0, 0); g.restore();
    g.fillStyle = T.lin(g, 0, y + h * 0.84, 0, y + h, [0, L.floor, 1, L.floor2]); g.fillRect(x, y + h * 0.84, w, h * 0.16); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 2; for (var i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x + i * w / 5, y + h * 0.84); g.lineTo(x + i * w / 5 - 30, y + h); g.stroke(); }
  }
  /* ONE-PIECE characters (same method as the Soul Bopper ghost, Aowu 2026-11-16): every body part goes into ONE silhouette with ONE dark rim,
     no inner outlines; depth comes from colour — far parts darker, near parts drop a soft shadow on what they cover. Parts are in the picture's own
     1024 × 572 coordinates, so the characters stand exactly where they stand in Aowu's picture. o.tf[part] = the part's own transform (lean, head tilt). */
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
  var SKIN = ['#ffd6ae', '#f6b480', '#e08c56', '#b8673a'], WRAP = ['#ffffff', '#f3ede1', '#d3c9b8'];
  /* 🥊 the fighter: chibi head tilted into the punch, swept spiky hair, red headband with flying tails, right fist punching out to the left,
     left fist up in guard, upper body leaning into the punch, wide running stride */
  function boy(g, T, L, dx, dy, s) {
    g.save(); g.translate(dx, dy); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; var INK = L.ink, SH = 'rgba(110,40,10,';
    function UP(h) { around(h, 442, 436, -0.1); }                 // the upper body leans into the punch
    function HD(h) { UP(h); around(h, 434, 372, -0.07); }         // + the head tilts a little more
    function fistF(h) { h.save(); h.translate(304, 340); h.rotate(-0.42); T.rr(h, -31, -26, 60, 52, 20); h.fill(); h.beginPath(); h.ellipse(16, 18, 15, 11, 0.4, 0, TAU); h.fill(); h.restore(); }
    function fistB(h) { h.save(); h.translate(487, 366); h.rotate(0.25); T.rr(h, -20, -18, 40, 36, 14); h.fill(); h.restore(); }
    var HB = [[374, 314], [370, 282], [382, 256], [404, 240], [430, 236], [456, 242], [476, 260], [488, 288], [484, 314]], HT = [[342, 292], [346, 246], [366, 212], [398, 196], [436, 198], [474, 214], [504, 250], [504, 300]];
    function hair(h) { h.beginPath(); h.moveTo(HB[0][0], HB[0][1]); for (var i = 0; i < HT.length; i++) { var p0 = HB[i], p1 = HB[i + 1], t = HT[i]; h.quadraticCurveTo(p0[0] + (t[0] - p0[0]) * 0.5 - 10, p0[1] + (t[1] - p0[1]) * 0.55 + 2, t[0], t[1]); h.quadraticCurveTo(p1[0] + (t[0] - p1[0]) * 0.45 - 4, p1[1] + (t[1] - p1[1]) * 0.4 + 6, p1[0], p1[1]); } h.quadraticCurveTo(430, 270, HB[0][0], HB[0][1]); h.closePath(); h.fill(); }
    var P = {
      tails: function (h) { taper(h, [470, 292, 512, 262, 548, 280], function (t) { return 17 - t * 7; }); taper(h, [470, 298, 512, 306, 532, 330], function (t) { return 15 - t * 7; }); },
      legB: function (h) { limb(h, [462, 446, 482, 448, 488, 466], 31, 25); limb(h, [488, 466, 498, 474, 498, 488], 24, 17); h.beginPath(); h.ellipse(506, 492, 18, 10, 0.55, 0, TAU); h.fill(); },
      armB: function (h) { limb(h, [474, 384, 494, 388, 496, 410], 25, 20, 4); limb(h, [496, 410, 504, 394, 490, 380], 20, 18); fistB(h); },
      torso: function (h) { h.beginPath(); h.moveTo(394, 380); h.bezierCurveTo(408, 364, 470, 362, 486, 378); h.bezierCurveTo(484, 398, 470, 410, 468, 432); h.lineTo(412, 432); h.bezierCurveTo(408, 410, 394, 398, 394, 380); h.closePath(); h.fill(); h.beginPath(); h.ellipse(436, 368, 14, 10, 0, 0, TAU); h.fill(); },
      shorts: function (h) { h.beginPath(); h.moveTo(406, 422); h.lineTo(474, 420); h.quadraticCurveTo(490, 440, 494, 462); h.lineTo(454, 468); h.lineTo(442, 452); h.lineTo(428, 470); h.quadraticCurveTo(406, 468, 390, 458); h.quadraticCurveTo(394, 436, 406, 422); h.closePath(); h.fill(); },
      legF: function (h) { limb(h, [420, 448, 404, 452, 400, 466], 33, 26); limb(h, [400, 466, 392, 476, 394, 488], 25, 17); h.beginPath(); h.ellipse(382, 494, 25, 11, -0.06, 0, TAU); h.fill(); },
      head: function (h) { h.beginPath(); h.moveTo(428, 260); h.bezierCurveTo(462, 260, 480, 284, 480, 314); h.bezierCurveTo(480, 348, 458, 372, 430, 374); h.bezierCurveTo(400, 374, 378, 350, 378, 316); h.bezierCurveTo(378, 284, 396, 260, 428, 260); h.closePath(); h.fill(); h.beginPath(); h.ellipse(380, 324, 10, 13, -0.2, 0, TAU); h.ellipse(479, 322, 9, 13, 0.2, 0, TAU); h.fill(); },
      hair: hair,
      armF: function (h) { limb(h, [406, 386, 380, 372, 360, 372], 27, 21, 5); limb(h, [360, 372, 344, 364, 330, 352], 21, 20); fistF(h); }
    };
    g.fillStyle = 'rgba(30,20,40,.28)'; g.beginPath(); g.ellipse(444, 501, 88, 10, 0, 0, TAU); g.fill();
    onePiece(g, T, { x0: 270, y0: 190, W: 300, H: 325, rim: INK, rimW: 4.6, parts: P, order: ['tails', 'legB', 'armB', 'torso', 'shorts', 'legF', 'head', 'hair', 'armF'],
      tf: { tails: HD, armB: UP, torso: UP, head: HD, hair: HD, armF: UP },
      colour: function (B, put, inside) {
        put(B, 'tails', lg(B, 470, 270, 548, 330, [0, '#ff5a42', 0.6, '#d8221a', 1, '#9a1010']));
        inside(B, 'tails', function (h) { h.strokeStyle = 'rgba(255,200,180,.6)'; h.lineWidth = 2.5; h.beginPath(); h.moveTo(480, 286); h.quadraticCurveTo(512, 266, 540, 278); h.stroke(); });
        put(B, 'legB', lg(B, 460, 446, 506, 494, [0, SKIN[2], 1, SKIN[3]]));
        inside(B, 'legB', function (h) { h.fillStyle = WRAP[2]; h.fillRect(486, 474, 40, 40); h.strokeStyle = 'rgba(110,90,70,.55)'; h.lineWidth = 2; [476, 483, 490, 497].forEach(function (y) { h.beginPath(); h.moveTo(484, y); h.lineTo(526, y + 7); h.stroke(); }); });
        put(B, 'armB', lg(B, 470, 380, 506, 420, [0, SKIN[2], 1, SKIN[3]]));
        inside(B, 'armB', function (h) { h.fillStyle = rg(h, 480, 360, 2, 30, [0, WRAP[0], 0.6, WRAP[1], 1, WRAP[2]]); h.fillRect(462, 340, 54, 52); h.strokeStyle = 'rgba(110,90,70,.5)'; h.lineWidth = 2; [362, 370, 378].forEach(function (y) { h.beginPath(); h.moveTo(470, y); h.lineTo(506, y - 3); h.stroke(); }); });
        put(B, 'torso', lg(B, 396, 362, 486, 432, [0, SKIN[0], 0.45, SKIN[1], 1, SKIN[2]]));
        inside(B, 'torso', function (h) {   // pecs + six-pack as soft shade, the head + punching arm shade the chest
          h.strokeStyle = SH + '.34)'; h.lineWidth = 3.4; h.beginPath(); h.moveTo(412, 388); h.quadraticCurveTo(428, 400, 442, 390); h.moveTo(446, 390); h.quadraticCurveTo(462, 400, 478, 388); h.moveTo(444, 396); h.lineTo(442, 426); [406, 416].forEach(function (y) { h.moveTo(428, y); h.quadraticCurveTo(435, y + 3, 442, y); h.moveTo(446, y); h.quadraticCurveTo(452, y + 3, 460, y); }); h.stroke();
          h.fillStyle = rg(h, 436, 368, 4, 40, [0, SH + '.5)', 1, SH + '0)']); h.fillRect(390, 356, 100, 44);
          h.fillStyle = 'rgba(255,240,220,.35)'; h.beginPath(); h.ellipse(418, 404, 10, 18, 0.2, 0, TAU); h.fill(); });
        put(B, 'legF', SH + '.34)', 5, -5);
        put(B, 'legF', lg(B, 380, 448, 420, 498, [0, SKIN[1], 1, SKIN[2]]));
        inside(B, 'legF', function (h) { h.fillStyle = WRAP[1]; h.fillRect(356, 472, 60, 40); h.strokeStyle = 'rgba(110,90,70,.55)'; h.lineWidth = 2; [476, 483, 490, 497].forEach(function (y) { h.beginPath(); h.moveTo(360, y + 4); h.lineTo(410, y - 1); h.stroke(); }); });
        put(B, 'shorts', lg(B, 390, 420, 494, 470, [0, '#42b0ee', 0.5, '#2478c8', 1, '#154690']));
        inside(B, 'shorts', function (h) { h.fillStyle = 'rgba(10,30,80,.38)'; h.beginPath(); h.moveTo(442, 452); h.lineTo(454, 468); h.lineTo(494, 462); h.quadraticCurveTo(490, 444, 476, 430); h.closePath(); h.fill();
          h.fillStyle = lg(h, 0, 416, 0, 436, [0, '#ff5a44', 1, '#c01c16']); h.beginPath(); h.moveTo(400, 418); h.quadraticCurveTo(440, 428, 482, 414); h.lineTo(484, 432); h.quadraticCurveTo(440, 442, 398, 434); h.closePath(); h.fill(); h.fillStyle = 'rgba(255,220,200,.4)'; h.fillRect(404, 420, 74, 3); });
        put(B, 'head', rg(B, 414, 300, 6, 90, [0, SKIN[0], 0.55, SKIN[1], 1, SKIN[2]]));
        inside(B, 'head', function (h) { h.fillStyle = 'rgba(255,120,110,.35)'; h.beginPath(); h.ellipse(398, 344, 11, 7, 0, 0, TAU); h.ellipse(464, 342, 9, 7, 0, 0, TAU); h.fill(); h.fillStyle = SH + '.25)'; h.beginPath(); h.ellipse(472, 330, 10, 30, 0, 0, TAU); h.fill(); });
        put(B, 'hair', SH + '.42)', 0, 8);   // the hair shades the forehead
        put(B, 'hair', lg(B, 370, 206, 480, 306, [0, '#c99052', 0.4, '#8c5428', 1, '#4a280e']));
        inside(B, 'hair', function (h) { h.strokeStyle = 'rgba(255,224,176,.6)'; h.lineWidth = 3.4; HT.forEach(function (t, i) { var b0 = HB[i], b1 = HB[i + 1], mx = (b0[0] + b1[0]) / 2, my = (b0[1] + b1[1]) / 2 + 10; h.beginPath(); h.moveTo(mx + (t[0] - mx) * 0.2, my + (t[1] - my) * 0.2); h.quadraticCurveTo(mx + (t[0] - mx) * 0.5 - 6, my + (t[1] - my) * 0.5, mx + (t[0] - mx) * 0.78, my + (t[1] - my) * 0.78); h.stroke(); });
          // the headband across the forehead sits on top of the hair line
          h.fillStyle = lg(h, 0, 284, 0, 306, [0, '#ff6a52', 1, '#c01c16']); h.beginPath(); h.moveTo(370, 300); h.quadraticCurveTo(430, 270, 488, 292); h.lineTo(488, 308); h.quadraticCurveTo(430, 288, 372, 316); h.closePath(); h.fill(); });
        inside(B, 'head', function (h) { h.fillStyle = lg(h, 0, 284, 0, 306, [0, '#ff6a52', 1, '#c01c16']); h.beginPath(); h.moveTo(370, 300); h.quadraticCurveTo(430, 270, 488, 292); h.lineTo(488, 308); h.quadraticCurveTo(430, 288, 372, 316); h.closePath(); h.fill(); h.fillStyle = 'rgba(255,230,210,.45)'; h.beginPath(); h.moveTo(380, 300); h.quadraticCurveTo(430, 278, 480, 293); h.lineTo(480, 296); h.quadraticCurveTo(430, 282, 380, 304); h.closePath(); h.fill(); });
        put(B, 'armF', SH + '.34)', 6, 10);
        put(B, 'armF', lg(B, 410, 386, 330, 350, [0, SKIN[1], 0.6, SKIN[0], 1, SKIN[1]]));
        inside(B, 'armF', function (h) { h.save(); h.translate(304, 340); h.rotate(-0.42); h.fillStyle = rg(h, -8, -10, 2, 46, [0, WRAP[0], 0.6, WRAP[1], 1, WRAP[2]]); h.fillRect(-40, -34, 120, 70); h.restore(); h.fillStyle = WRAP[1]; h.beginPath(); h.moveTo(326, 330); h.lineTo(356, 352); h.lineTo(350, 380); h.lineTo(318, 366); h.closePath(); h.fill();
          h.strokeStyle = 'rgba(110,90,70,.5)'; h.lineWidth = 2; [0, 8, 16].forEach(function (d) { h.beginPath(); h.moveTo(332 + d, 342 + d * 0.6); h.lineTo(322 + d, 374 + d * 0.2); h.stroke(); }); });
      } });
    // details on top: fingers on the fists, face (in the head's own tilt)
    g.save(); UP(g); g.strokeStyle = 'rgba(110,90,70,.6)'; g.lineWidth = 2.4; g.save(); g.translate(304, 340); g.rotate(-0.42); [-12, 0, 12].forEach(function (x) { g.beginPath(); g.moveTo(x - 6, -22); g.quadraticCurveTo(x - 2, -6, x - 6, 8); g.stroke(); }); g.beginPath(); g.moveTo(-26, 8); g.quadraticCurveTo(0, 14, 24, 6); g.stroke(); g.restore();
    g.save(); g.translate(487, 366); g.rotate(0.25); [-8, 0, 8].forEach(function (x) { g.beginPath(); g.moveTo(x, -14); g.lineTo(x, 2); g.stroke(); }); g.restore(); g.restore();
    g.save(); HD(g);
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(392, 314); g.quadraticCurveTo(406, 314, 420, 324); g.moveTo(466, 312); g.quadraticCurveTo(452, 312, 440, 322); g.stroke();
    [[407, 334, 11.5, 13], [452, 333, 11, 13]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 2, e[1] + 1, 7, 0, TAU); g.fillStyle = T.lin(g, 0, e[1] - 7, 0, e[1] + 8, [0, '#16606c', 1, '#46d0d4']); g.fill(); g.beginPath(); g.arc(e[0] + 2, e[1] + 1, 3.3, 0, TAU); g.fillStyle = '#081820'; g.fill(); g.beginPath(); g.arc(e[0] - 1, e[1] - 3, 2.4, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.strokeStyle = 'rgba(120,50,20,.55)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(430, 340); g.quadraticCurveTo(426, 350, 432, 352); g.stroke();
    function grin() { g.beginPath(); g.moveTo(398, 352); g.quadraticCurveTo(430, 364, 464, 348); g.quadraticCurveTo(456, 374, 430, 374); g.quadraticCurveTo(404, 372, 398, 352); g.closePath(); }
    grin(); g.fillStyle = '#fff'; g.fill(); g.save(); grin(); g.clip(); g.strokeStyle = 'rgba(80,60,60,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(398, 362); g.quadraticCurveTo(430, 370, 462, 358); [414, 430, 446].forEach(function (x) { g.moveTo(x, 352); g.lineTo(x, 376); }); g.stroke(); g.restore(); grin(); g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
    g.restore(); g.restore();
  }
  /* 🐾 the red panda buddy: chubby, running to the right and leaning in, front mitt up at the chest, back mitt punching up-right,
     back leg kicking out behind, front knee up with the paw pads showing, big bushy striped tail curling up behind */
  function panda(g, T, L, dx, dy, s) {
    g.save(); g.translate(dx, dy); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; var INK = L.ink, SH = 'rgba(70,20,0,', F = ['#ffb052', '#f27e22', '#c8540e', '#8a3208'], DK = ['#8a4422', '#5c2a10', '#3a1806'];
    var TAIL = [578, 452, 484, 458, 514, 338];
    function mitt(h, x, y, rot, k) { h.save(); h.translate(x, y); h.rotate(rot); h.scale(k, k); T.rr(h, -26, -24, 50, 46, 18); h.fill(); h.beginPath(); h.ellipse(-22, 8, 11, 15, 0.3, 0, TAU); h.fill(); T.rr(h, -20, 18, 38, 16, 6); h.fill(); h.restore(); }
    var P = {
      tail: function (h) { taper(h, TAIL, function (t) { return 26 + Math.sin(t * Math.PI * 0.9) * 32 - t * 4; }); },
      legB: function (h) { limb(h, [584, 456, 566, 470, 554, 478], 34, 27); limb(h, [554, 478, 546, 484, 540, 486], 27, 24); h.beginPath(); h.ellipse(530, 490, 24, 13, -0.3, 0, TAU); h.fill(); },
      armB: function (h) { limb(h, [644, 386, 680, 384, 706, 352], 30, 24, 4); mitt(h, 724, 326, -0.65, 1.05); },
      body: function (h) { h.beginPath(); h.ellipse(604, 410, 60, 66, -0.32, 0, TAU); h.fill(); },
      legF: function (h) { limb(h, [636, 456, 664, 444, 676, 458], 34, 28); h.beginPath(); h.ellipse(686, 462, 24, 18, -0.75, 0, TAU); h.fill(); },
      ears: function (h) { [[568, 276, -0.55], [676, 270, 0.5]].forEach(function (e) { h.save(); h.translate(e[0], e[1]); h.rotate(e[2]); h.beginPath(); h.moveTo(-28, 24); h.quadraticCurveTo(-26, -28, 0, -36); h.quadraticCurveTo(26, -28, 28, 24); h.closePath(); h.fill(); h.restore(); }); },
      head: function (h) { h.beginPath(); h.moveTo(560, 312); h.bezierCurveTo(562, 274, 592, 260, 622, 260); h.bezierCurveTo(654, 260, 684, 274, 686, 310); h.lineTo(702, 316); h.lineTo(690, 328); h.lineTo(700, 340); h.lineTo(682, 344); h.bezierCurveTo(668, 366, 646, 372, 622, 372); h.bezierCurveTo(598, 372, 576, 366, 562, 346); h.lineTo(544, 342); h.lineTo(554, 330); h.lineTo(542, 318); h.closePath(); h.fill(); },
      armF: function (h) { limb(h, [612, 404, 598, 414, 588, 400], 28, 24); mitt(h, 578, 384, 0.15, 1); }
    };
    g.fillStyle = 'rgba(30,20,40,.28)'; g.beginPath(); g.ellipse(606, 500, 94, 10, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3.5; [[516, 462, 488, 452], [512, 476, 480, 474], [516, 490, 490, 500], [700, 488, 724, 496]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    onePiece(g, T, { x0: 460, y0: 216, W: 310, H: 300, rim: INK, rimW: 4.6, parts: P, order: ['tail', 'legB', 'armB', 'body', 'legF', 'ears', 'head', 'armF'],
      colour: function (B, put, inside) {
        put(B, 'tail', lg(B, 480, 340, 586, 450, [0, F[0], 0.5, F[1], 1, F[2]]));
        inside(B, 'tail', function (h) { for (var i = 1; i <= 5; i += 2) { var t = i / 6.3, u = 1 - t, x = u * u * TAIL[0] + 2 * u * t * TAIL[2] + t * t * TAIL[4], y = u * u * TAIL[1] + 2 * u * t * TAIL[3] + t * t * TAIL[5], an = Math.atan2(2 * u * (TAIL[3] - TAIL[1]) + 2 * t * (TAIL[5] - TAIL[3]), 2 * u * (TAIL[2] - TAIL[0]) + 2 * t * (TAIL[4] - TAIL[2])); h.save(); h.translate(x, y); h.rotate(an + Math.PI / 2); h.fillStyle = DK[1]; h.beginPath(); h.ellipse(0, 0, 50, 9, 0, 0, TAU); h.fill(); h.restore(); }
          h.fillStyle = 'rgba(70,20,0,.3)'; h.beginPath(); h.ellipse(560, 430, 40, 30, 0, 0, TAU); h.fill(); });   // the body shades the tail root
        put(B, 'legB', lg(B, 582, 446, 530, 492, [0, DK[1], 1, DK[2]]));
        put(B, 'armB', lg(B, 644, 390, 706, 350, [0, F[2], 0.6, F[1], 1, F[2]]));
        inside(B, 'armB', function (h) { h.save(); h.translate(724, 326); h.rotate(-0.65); h.scale(1.05, 1.05); h.fillStyle = rg(h, -8, -10, 2, 40, [0, '#9096ac', 0.5, '#4a4e60', 1, '#22242e']); h.fillRect(-40, -34, 80, 52); h.fillStyle = '#30323c'; h.fillRect(-22, 18, 38, 16); h.fillStyle = 'rgba(255,255,255,.28)'; h.fillRect(-22, 20, 38, 3); h.restore(); });
        put(B, 'body', rg(B, 616, 380, 8, 86, [0, F[0], 0.5, F[1], 1, F[3]]));
        inside(B, 'body', function (h) { h.fillStyle = rg(h, 626, 404, 4, 60, [0, '#8e4824', 0.75, '#6a3014', 1, '#5a2810']); h.beginPath(); h.ellipse(616, 420, 42, 52, -0.32, 0, TAU); h.fill(); h.fillStyle = rg(h, 622, 370, 4, 50, [0, SH + '.55)', 1, SH + '0)']); h.fillRect(560, 340, 120, 60); });
        put(B, 'legF', SH + '.3)', -3, -5);
        put(B, 'legF', lg(B, 636, 440, 694, 474, [0, F[2], 0.4, DK[0], 1, DK[1]]));
        inside(B, 'legF', function (h) { h.fillStyle = '#e8908e'; h.beginPath(); h.ellipse(690, 466, 11, 8, -0.75, 0, TAU); h.fill(); [[674, 455], [681, 447], [691, 445], [699, 450]].forEach(function (p) { h.beginPath(); h.arc(p[0], p[1], 4, 0, TAU); h.fill(); }); });
        put(B, 'ears', F[2]);
        inside(B, 'ears', function (h) { [[568, 276, -0.55], [676, 270, 0.5]].forEach(function (e) { h.save(); h.translate(e[0], e[1]); h.rotate(e[2]); h.fillStyle = '#fff6ea'; h.beginPath(); h.moveTo(-21, 22); h.quadraticCurveTo(-18, -20, 0, -28); h.quadraticCurveTo(18, -20, 21, 22); h.closePath(); h.fill(); h.fillStyle = DK[1]; h.beginPath(); h.moveTo(-11, 22); h.quadraticCurveTo(-9, -6, 0, -12); h.quadraticCurveTo(9, -6, 11, 22); h.closePath(); h.fill(); h.restore(); }); });
        put(B, 'head', rg(B, 610, 292, 8, 100, [0, F[0], 0.5, F[1], 1, F[2]]));
        inside(B, 'head', function (h) {   // face mask: white brows, white cheeks + muzzle, dark tear marks round the eyes
          h.fillStyle = '#fff8ee'; h.beginPath(); h.ellipse(598, 286, 14, 7, 0.35, 0, TAU); h.ellipse(646, 284, 14, 7, -0.35, 0, TAU); h.fill();
          h.beginPath(); h.ellipse(566, 334, 26, 22, 0.25, 0, TAU); h.ellipse(678, 330, 26, 22, -0.25, 0, TAU); h.ellipse(622, 342, 34, 28, 0, 0, TAU); h.fill();
          h.fillStyle = DK[1]; h.beginPath(); h.moveTo(586, 300); h.quadraticCurveTo(612, 300, 610, 322); h.quadraticCurveTo(602, 346, 586, 352); h.quadraticCurveTo(580, 326, 586, 300); h.closePath(); h.moveTo(658, 298); h.quadraticCurveTo(632, 298, 634, 320); h.quadraticCurveTo(642, 344, 658, 350); h.quadraticCurveTo(664, 324, 658, 298); h.closePath(); h.fill();
          h.fillStyle = 'rgba(255,220,170,.4)'; h.beginPath(); h.ellipse(604, 274, 22, 8, -0.2, 0, TAU); h.fill(); });
        put(B, 'armF', SH + '.36)', 6, 8);
        put(B, 'armF', lg(B, 612, 404, 588, 396, [0, F[1], 1, F[2]]));
        inside(B, 'armF', function (h) { h.save(); h.translate(578, 384); h.rotate(0.15); h.fillStyle = rg(h, -8, -10, 2, 40, [0, '#9096ac', 0.5, '#4a4e60', 1, '#22242e']); h.fillRect(-40, -34, 80, 52); h.fillStyle = '#30323c'; h.fillRect(-22, 18, 40, 16); h.fillStyle = 'rgba(255,255,255,.28)'; h.fillRect(-22, 20, 40, 3); h.restore(); });
      } });
    // details on top: mitt fingers + shine, eyes, nose, open happy mouth, belly fur
    g.strokeStyle = 'rgba(10,10,20,.6)'; g.lineWidth = 2.4;
    [[724, 326, -0.65, 1.05], [578, 384, 0.15, 1]].forEach(function (m) { g.save(); g.translate(m[0], m[1]); g.rotate(m[2]); g.scale(m[3], m[3]); [-10, 2, 13].forEach(function (x) { g.beginPath(); g.moveTo(x, -22); g.lineTo(x, -4); g.stroke(); }); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-6, -14, 10, 5, -0.2, 0, TAU); g.fill(); g.restore(); });
    [[600, 316, 9.5, 11], [644, 314, 9.5, 11]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 1, e[1] + 1, 6.5, 0, TAU); g.fillStyle = T.lin(g, 0, e[1] - 6, 0, e[1] + 7, [0, '#5a2a0a', 1, '#d08030']); g.fill(); g.beginPath(); g.arc(e[0] + 1, e[1] + 1, 3, 0, TAU); g.fillStyle = '#1a0a04'; g.fill(); g.beginPath(); g.arc(e[0] - 2, e[1] - 2, 2.2, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.strokeStyle = INK; g.lineWidth = 4.5; g.beginPath(); g.moveTo(586, 296); g.lineTo(610, 304); g.moveTo(658, 294); g.lineTo(634, 302); g.stroke();
    g.beginPath(); g.moveTo(612, 326); g.quadraticCurveTo(622, 320, 632, 326); g.quadraticCurveTo(630, 336, 622, 338); g.quadraticCurveTo(614, 336, 612, 326); g.fillStyle = '#2a1408'; g.fill(); g.beginPath(); g.ellipse(619, 326, 3.5, 2, 0, 0, TAU); g.fillStyle = 'rgba(255,255,255,.7)'; g.fill();
    function mouth() { g.beginPath(); g.moveTo(596, 344); g.quadraticCurveTo(622, 354, 650, 342); g.quadraticCurveTo(646, 372, 622, 372); g.quadraticCurveTo(598, 370, 596, 344); g.closePath(); }
    mouth(); g.fillStyle = '#6a1018'; g.fill(); g.save(); mouth(); g.clip(); g.fillStyle = '#ff7a8a'; g.beginPath(); g.ellipse(624, 372, 16, 10, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(602, 340, 9, 7); g.fillRect(634, 340, 9, 7); g.restore(); mouth(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = 'rgba(30,8,0,.45)'; g.lineWidth = 2; [[600, 408, 606, 418], [612, 400, 616, 410], [626, 414, 628, 424], [604, 432, 610, 440]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    g.restore();
  }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    function o(c, sz, glow, white) { return { clean: true /* gl-r20 clean B */, spacing: sz * 0.015, dark: L.dark, outline: sz * 0.2, depth: sz * 0.1, fat: sz * 0.02, glow: glow, glowN: 2, glowBlur: 0.36, face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: white }; }
    var s1 = 96 * k, s2 = 86 * k, a = o(L.w1, s1, 'rgba(255,170,40,1)', 'rgba(255,250,200,.6)'), b = o(L.w2, s2, 'rgba(110,200,255,1)', 'rgba(255,255,255,.9)');
    if (oneLine) { g.save(); g.font = '700 ' + s1 + 'px ' + T.FONT; var w1 = g.measureText('BRAWL').width + 4 * s1 * 0.015; g.font = '700 ' + s2 + 'px ' + T.FONT; var w2 = g.measureText('BUDDIES').width + 6 * s2 * 0.015; g.restore(); var gap = 26 * k, x0 = cx - (w1 + gap + w2) / 2; T.word(g, 'BRAWL', x0 + w1 / 2, y1, s1, a); T.gloss(g, 'BRAWL', x0 + w1 / 2, y1, s1, a, 0.5); T.word(g, 'BUDDIES', x0 + w1 + gap + w2 / 2, y1, s2, b); T.gloss(g, 'BUDDIES', x0 + w1 + gap + w2 / 2, y1, s2, b, 0.5); return; }
    a.wave = function (j) { return [8, 1, -3, 1, 8][j] * k; }; a.rot = -0.02; b.wave = function (j) { return [5, 1, -2, -3, -2, 1, 5][j] * k; };
    T.word(g, 'BUDDIES', cx, y2, s2, b); T.gloss(g, 'BUDDIES', cx, y2, s2, b, 0.5); T.word(g, 'BRAWL', cx, y1, s1, a); T.gloss(g, 'BRAWL', cx, y1, s1, a, 0.5);
  }
  function frame(g, T, L, x, y, w, h, inner) {
    g.save(); T.rr(g, x, y, w, h, 56); g.clip(); inner(); g.restore();
    g.save(); g.shadowColor = '#ffd23e'; g.shadowBlur = 26; T.rr(g, x, y, w, h, 56); g.lineWidth = 20; g.strokeStyle = '#5a3404'; g.stroke(); g.shadowBlur = 0; g.lineWidth = 14; g.strokeStyle = T.lin(g, x, y, x + w, y + h, [0, L.frame[0], 0.3, L.frame[1], 0.6, L.frame[2], 1, L.frame[0]]); g.stroke(); T.rr(g, x - 9, y - 9, w + 18, h + 18, 64); g.lineWidth = 3; g.strokeStyle = '#5ff0ff'; g.shadowColor = '#5ff0ff'; g.shadowBlur = 14; g.stroke(); g.restore();
  }
  function emblem(g, T, L) {
    boom(g, T, 236, 320, 120, '#ff9a1c', '#ffe14a', 0.1); boom(g, T, 794, 230, 130, '#ff9a1c', '#ffe14a', 0.4); boom(g, T, 246, 130, 70, '#ff5a2a', '#ffb02e', 0.6); boom(g, T, 790, 440, 80, '#ff5a2a', '#ffb02e', 0.2);
    frame(g, T, L, 268, 36, 488, 500, function () { world(g, T, L, 268, 36, 488, 500); panda(g, T, L, 0, 0, 1); boy(g, T, L, 0, 0, 1); });
    words(g, T, L, 512, 126, 218, 1.18);
    [[300, 60, 10], [730, 70, 12], [770, 400, 9], [250, 440, 8]].forEach(function (s) { T.star(g, s[0], s[1], s[2], s[2] * 0.5); g.fillStyle = '#ffe14a'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#8a4a04'; g.lineJoin = 'round'; g.stroke(); });
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.bg[0], 1, L.bg[1]]); g.fillRect(0, 0, 1024, 572); var r = T.rng(7); for (var i = 0; i < 40; i++) { g.globalAlpha = 0.5 + r() * 0.5; g.fillStyle = ['#ff8a2a', '#5ff0ff', '#ff5ad8', '#ffe14a'][i % 4]; g.beginPath(); g.arc(r() * 1024, r() * 572, 2 + r() * 5, 0, TAU); g.fill(); } g.globalAlpha = 1; emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-132, -4); emblem(g, T, L); return; }
    if (kind === 'wide') { g.save(); g.translate(22, 28); g.scale(0.3, 0.3); g.translate(-268, -36); frame(g, T, L, 268, 36, 488, 500, function () { world(g, T, L, 268, 36, 488, 500); panda(g, T, L, 0, 0, 1); boy(g, T, L, 0, 0, 1); }); g.restore(); words(g, T, L, 526, 134, 0, 0.82, true); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.74, 0.74); g.translate(-512, -286); frame(g, T, L, 268, 36, 488, 500, function () { world(g, T, L, 268, 36, 488, 500); if (px >= 90) { panda(g, T, L, 0, 0, 1); boy(g, T, L, 0, 0, 1); } else { g.save(); g.translate(512, 300); g.scale(1.3, 1.3); g.translate(-520, -400); panda(g, T, L, 0, 0, 1); boy(g, T, L, 0, 0, 1); g.restore(); } }); if (px >= 90) words(g, T, L, 512, 126, 218, 1.18); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO brawl-buddies END

// 🏷️ LOGO checkers START — 🔴 Checkers, drawn in code from Aowu's picture (gl-22, round 8). The smug GOLD king piece with its crown beside the happy RED
// piece (one-piece discs: face + grooves + side band, depth from colour), a checkered path sweeping up behind them, orange → teal sky, sparkles + arrows,
// cream "CHECKERS" (with the S, Aowu 2026-11-16 17:0x) with a dark rim. Looks = the game's DESIGNS (classic · fantasy · futuristic · hero · pets · dance):
// the second piece takes the design's own colour (p1), the sky + path follow it.
GameLogos.add('checkers', (function () {
  var BOX = { scene: [1024, 572], main: [474, 474], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { sky: ['#ffc04a', '#f8802a', '#e8503a', '#2a8a8a', '#0e4a5a'], piece: '#e8303a', tileD: '#8a1a24', tileL: '#fff2d8', glow: '#ffd27a', rim: '#ffcf8a' }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    fantasy: mk({ sky: ['#ffb8e8', '#d86ad0', '#8a3ab8', '#1F8A70', '#0a3a3a'], piece: '#FF7EB9', tileD: '#1F8A70', tileL: '#fff0fa', glow: '#ffc8f0', rim: '#ffd0f0' }),
    futuristic: mk({ sky: ['#4af0ff', '#2a8ae0', '#3a1a9a', '#2a0a5a', '#0a0624'], piece: '#0FA3C7', tileD: '#B5179E', tileL: '#d8f8ff', glow: '#8af4ff', rim: '#8af4ff' }),
    hero: mk({ sky: ['#ffd84a', '#f0802a', '#c82a3a', '#2a2a8a', '#14104a'], piece: '#1565C0', tileD: '#4A148C', tileL: '#fff6d8', glow: '#ffe07a' }),
    pets: mk({ sky: ['#ffe0a0', '#f0b06a', '#d8804a', '#8a9ab0', '#4a5470'], piece: '#E07B22', tileD: '#6a7488', tileL: '#fff8ec', glow: '#ffe0a0' }),
    dance: mk({ sky: ['#ffd04a', '#ff8a00', '#e03a8a', '#2a5ae0', '#101a5a'], piece: '#FF8A00', tileD: '#0077FF', tileL: '#fff4e0', glow: '#ffd27a' }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#3a140c';
  /* ---------- sky + the checkered path ---------- */
  function sky(g, T, L, x, y, w, h) {
    g.fillStyle = T.lin(g, x, y, x + w, y + h * 0.7, [0, L.sky[0], 0.3, L.sky[1], 0.48, L.sky[2], 0.66, L.sky[3], 1, L.sky[4]]); g.fillRect(x, y, w, h);
    g.fillStyle = T.rad(g, x + w * 0.38, y + h * 0.42, 10, w * 0.5, [0, 'rgba(255,230,160,.55)', 1, 'rgba(255,230,160,0)']); g.fillRect(x, y, w, h);
    g.save(); g.globalAlpha = 0.5; g.fillStyle = sh(L.sky[4], -0.2); g.beginPath(); g.moveTo(x, y + h * 0.62); g.quadraticCurveTo(x + w * 0.3, y + h * 0.55, x + w * 0.5, y + h); g.lineTo(x, y + h); g.closePath(); g.fill(); g.restore();
  }
  function bez(p, t) { var u = 1 - t; return [u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6], u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7]]; }
  function path(g, T, L) {   // a band between two curves, tiled in perspective: far end top-right, near end bottom-left
    var A = [598, 58, 560, 150, 440, 260, 270, 352], B = [712, 58, 690, 190, 610, 360, 380, 470], N = 15, M = 5;
    g.save(); g.shadowColor = 'rgba(40,0,0,.45)'; g.shadowBlur = 18; g.beginPath(); for (var i = 0; i <= 30; i++) { var a = bez(A, i / 30); g[i ? 'lineTo' : 'moveTo'](a[0], a[1]); } for (i = 30; i >= 0; i--) { var b = bez(B, i / 30); g.lineTo(b[0], b[1]); } g.closePath(); g.fillStyle = L.tileD; g.fill(); g.restore();
    function P(u, v) { var a = bez(A, u), b = bez(B, u); return [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v]; }
    for (i = 0; i < N; i++) { var u0 = Math.pow(i / N, 1.25), u1 = Math.pow((i + 1) / N, 1.25); for (var j = 0; j < M; j++) { var v0 = j / M, v1 = (j + 1) / M, q = [P(u0, v0), P(u0, v1), P(u1, v1), P(u1, v0)];
      g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (var k = 1; k < 4; k++) g.lineTo(q[k][0], q[k][1]); g.closePath(); var dark = (i + j) % 2 === 0;
      g.fillStyle = dark ? T.lin(g, q[0][0], q[0][1], q[2][0], q[2][1], [0, sh(L.tileD, 0.15), 1, sh(L.tileD, -0.25)]) : T.lin(g, q[0][0], q[0][1], q[2][0], q[2][1], [0, '#ffffff', 1, L.tileL]); g.fill(); } }
    g.save(); g.lineWidth = 4; g.strokeStyle = L.glow; g.shadowColor = L.glow; g.shadowBlur = 10; g.beginPath(); for (i = 0; i <= 30; i++) { b = bez(B, i / 30); g[i ? 'lineTo' : 'moveTo'](b[0], b[1]); } g.stroke(); g.restore();
  }
  function arrow(g, T, x, y, a, len, col) { g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 7; g.lineCap = 'round'; g.globalAlpha = 0.8; g.shadowColor = col; g.shadowBlur = 10;
    g.beginPath(); g.moveTo(-len, 10); g.quadraticCurveTo(-len * 0.4, 8, 0, -4); g.stroke(); g.beginPath(); g.moveTo(14, -10); g.lineTo(-10, -18); g.lineTo(-2, 8); g.closePath(); g.fill(); g.restore(); }
  function bits(g, T, L, full) { var r = T.rng(4);
    arrow(g, T, 528, 98, -0.55, 70, 'rgba(255,230,140,.9)'); arrow(g, T, 716, 330, -0.9, 50, 'rgba(120,230,120,.95)');
    [[338, 140, 12], [318, 200, 15], [710, 220, 13], [458, 92, 9], [742, 290, 9]].forEach(function (s, i) { g.fillStyle = i % 2 ? '#ffe07a' : '#fff6c0'; T.star(g, s[0], s[1], s[2], s[2] * 0.45); g.fill(); });
    for (var i = 0; i < (full ? 22 : 10); i++) T.spark(g, 300 + r() * 430, 70 + r() * 340, 3 + r() * 6, '#fff', 0.7);
  }
  /* ---------- a checker piece: one silhouette (side band + face), grooves, face drawn after ---------- */
  function piece(g, T, cx, cy, R, col, tilt, pal) { pal = pal || [sh(col, 0.5), col, sh(col, -0.3), sh(col, -0.5)];
    var P = { side: function (h) { h.beginPath(); h.ellipse(cx + 4, cy + 14, R, R * 0.98, tilt, 0, TAU); h.fill(); }, face: function (h) { h.beginPath(); h.ellipse(cx, cy, R, R * 0.98, tilt, 0, TAU); h.fill(); } };
    T.onePiece(g, T, { x0: cx - R - 14, y0: cy - R - 14, W: R * 2 + 40, H: R * 2 + 46, rim: INK, rimW: 4.4, parts: P, order: ['side', 'face'],
      colour: function (B, put, inside) {
        put(B, 'side', pal[3]);
        put(B, 'face', T.rg(B, cx - R * 0.3, cy - R * 0.35, R * 0.1, R * 1.25, [0, pal[0], 0.45, pal[1], 1, pal[2]]));
        inside(B, 'face', function (h) {
          [0.86, 0.66, 0.46].forEach(function (k, i) { h.lineWidth = R * 0.075; h.strokeStyle = pal[3]; h.globalAlpha = 0.75; h.beginPath(); h.ellipse(cx + 2, cy + 2, R * k, R * k * 0.98, tilt, 0, TAU); h.stroke(); h.globalAlpha = 1; h.lineWidth = R * 0.04; h.strokeStyle = pal[0]; h.beginPath(); h.ellipse(cx - 2, cy - 3, R * k, R * k * 0.98, tilt, Math.PI * 1.05, Math.PI * 1.75); h.stroke(); });
          h.fillStyle = 'rgba(255,255,255,.45)'; h.beginPath(); h.ellipse(cx - R * 0.42, cy - R * 0.55, R * 0.28, R * 0.12, -0.6, 0, TAU); h.fill(); });
      } });
  }
  function eyes(g, cx, cy, k, smug) {
    [[-26, 0], [24, -2]].forEach(function (e, i) { var x = cx + e[0] * k, y = cy + e[1] * k; g.beginPath(); g.ellipse(x, y, 13 * k, 15 * k, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5 * k; g.strokeStyle = INK; g.stroke();
      g.beginPath(); g.arc(x + (smug ? 6 : 2) * k, y + (smug ? 2 : 2) * k, 7 * k, 0, TAU); g.fillStyle = '#3a2010'; g.fill(); g.beginPath(); g.arc(x + (smug ? 4 : 0) * k, y - 1 * k, 2.4 * k, 0, TAU); g.fillStyle = '#fff'; g.fill();
      if (smug) { g.save(); g.beginPath(); g.ellipse(x, y, 13.5 * k, 15.5 * k, 0, 0, TAU); g.clip(); g.fillStyle = '#d8a02a'; g.fillRect(x - 16 * k, y - 18 * k, 32 * k, 15 * k); g.restore(); g.lineWidth = 3 * k; g.strokeStyle = INK; g.beginPath(); g.moveTo(x - 13 * k, y - 3 * k); g.lineTo(x + 13 * k, y - 4 * k); g.stroke(); } });
  }
  function gold(g, T, L) {
    piece(g, T, 420, 284, 92, '#ffc21a', 0, ['#fff2a8', '#ffc21a', '#e88a0a', '#a8560a']);
    g.save(); g.translate(394, 172); g.rotate(-0.22); g.lineJoin = 'round';   // the crown, tilted
    g.beginPath(); g.moveTo(-46, 22); g.lineTo(-52, -26); g.lineTo(-24, -2); g.lineTo(0, -38); g.lineTo(24, -2); g.lineTo(52, -26); g.lineTo(46, 22); g.quadraticCurveTo(0, 32, -46, 22); g.closePath();
    g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); g.fillStyle = T.lin(g, 0, -40, 0, 30, [0, '#fff2a0', 0.5, '#ffc21a', 1, '#c8800a']); g.fill();
    [[-52, -28], [0, -40], [52, -28]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], 8, 0, TAU); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); });
    g.beginPath(); g.ellipse(0, 6, 7, 9, 0, 0, TAU); g.fillStyle = '#d8202a'; g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(-40, 14, 80, 4); g.restore();
    eyes(g, 440, 262, 1, true);
    g.strokeStyle = INK; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(410, 236); g.quadraticCurveTo(424, 228, 434, 236); g.moveTo(452, 232); g.quadraticCurveTo(462, 226, 474, 234); g.stroke();
    g.beginPath(); g.moveTo(424, 312); g.quadraticCurveTo(446, 320, 470, 300); g.stroke(); g.beginPath(); g.arc(471, 298, 3, 0, TAU); g.fillStyle = INK; g.fill();
    g.fillStyle = 'rgba(255,120,60,.3)'; g.beginPath(); g.ellipse(396, 300, 12, 7, 0, 0, TAU); g.ellipse(490, 290, 10, 6, 0, 0, TAU); g.fill();
  }
  function red(g, T, L) {
    piece(g, T, 602, 288, 90, L.piece, 0);
    eyes(g, 600, 262, 1.05, false);
    g.strokeStyle = INK; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(568, 228); g.quadraticCurveTo(578, 220, 590, 228); g.moveTo(612, 226); g.quadraticCurveTo(624, 218, 634, 226); g.stroke();
    g.beginPath(); g.moveTo(574, 296); g.quadraticCurveTo(600, 300, 628, 292); g.quadraticCurveTo(622, 326, 600, 326); g.quadraticCurveTo(578, 324, 574, 296); g.closePath(); g.fillStyle = '#6a0a14'; g.fill();
    g.save(); g.clip(); g.fillStyle = '#ff8a9a'; g.beginPath(); g.ellipse(602, 328, 14, 9, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(572, 292, 60, 7); g.restore(); g.lineWidth = 3; g.stroke();
  }
  function words(g, T, L, cx, base, size) {
    var o = { spacing: size * 0.01, dark: INK, outline: size * 0.17, depth: size * 0.09, fat: size * 0.006, ring: L.rim, edge: function () { return '#c89a5a'; }, edgeW: size * 0.05,
      face: function () { return [0, '#ffffff', 0.5, '#fff4dc', 1, '#f0d6a8']; }, wave: function (j) { return [3, 1, 0, 0, 0, 0, 1, 3][j] * size / 80; } };
    T.word(g, 'CHECKERS', cx, base, size, o); T.gloss(g, 'CHECKERS', cx, base, size, o, 0.35);
  }
  var PX = 288, PY = 58, PW = 454, PH = 454;
  function icon(g, T, L, full, chars) {
    g.save(); if (full) { g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 30; g.shadowOffsetY = 10; } T.rr(g, PX, PY, PW, PH, 76); g.fillStyle = L.sky[2]; g.fill(); g.restore();
    g.save(); T.rr(g, PX, PY, PW, PH, 76); g.clip(); sky(g, T, L, PX, PY, PW, PH); path(g, T, L); bits(g, T, L, full); if (chars !== false) { gold(g, T, L); red(g, T, L); } g.restore();
    T.rr(g, PX + 2, PY + 2, PW - 4, PH - 4, 74); g.lineWidth = 4; g.strokeStyle = 'rgba(255,240,210,.55)'; g.stroke();
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, sh(L.sky[1], -0.3), 0.5, sh(L.sky[2], -0.45), 1, sh(L.sky[4], -0.2)]); g.fillRect(0, 0, 1024, 572); icon(g, T, L, true); words(g, T, L, 515, 470, 78); return; }
    if (kind === 'main') { g.translate(-278, -48); icon(g, T, L, px >= 220); words(g, T, L, 515, 470, 78); return; }
    if (kind === 'wide') { g.save(); g.translate(14, 6); g.scale(0.414, 0.414); g.translate(-PX, -PY); icon(g, T, L, false); g.restore(); words(g, T, L, 530, 140, 96); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.84, 0.84); g.translate(-515, -285); icon(g, T, L, false); if (px >= 90) words(g, T, L, 515, 470, 78); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO checkers END

// 🏷️ LOGO chess START — ♟️ Chess, drawn in code from Aowu's picture (gl-21, round 7). A smiling KING piece in a red velvet robe with white fur and a gold
// crown, the BISHOP man in his mitre, the KNIGHT horse in armour (all one-piece, depth from colour), a glowing board floor, shooting stars, confetti,
// fat gold "CHESS". Looks = the game's 3 designs (Chess.html DESIGNS: classic wood · fantasy pearl / emerald · futuristic neon) → piece colour, floor, sky.
GameLogos.add('chess', (function () {
  var BOX = { scene: [1024, 572], main: [500, 520], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { sky: ['#4a7ae8', '#3a2aa8', '#1a0a5a'], floor: ['#5a2ab8', '#2a0a6a'], grid: '#5ad8ff', piece: ['#fffaf0', '#f2e2c4', '#cfb48a'], rim: ['#ffe08a', '#c8901a'], dark: '#3a1a08',
    word: ['#fff2a0', '#ffc21a', '#e8800a'] }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    fantasy: mk({ sky: ['#ff9ad8', '#8a3ab8', '#3a0a5a'], floor: ['#1F8A70', '#0a3a2a'], grid: '#ffb8e8', piece: ['#fff0f8', '#FF9ECB', '#d8508a'] }),
    futuristic: mk({ sky: ['#18E7FF', '#2a1a8a', '#05051f'], floor: ['#2a0a4a', '#05051f'], grid: '#FF4FD8', piece: ['#e8ffff', '#7af4ff', '#18a8c8'], rim: ['#9af8ff', '#18a8c8'] }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* ---------- the world: starry sky, glowing board floor, shooting stars, confetti ---------- */
  function world(g, T, L, x, y, w, h, full) {
    g.fillStyle = T.rad(g, x + w / 2, y + h * 0.42, 20, w * 0.75, [0, L.sky[0], 0.5, L.sky[1], 1, L.sky[2]]); g.fillRect(x, y, w, h);
    var fy = y + h * 0.66; g.fillStyle = T.lin(g, 0, fy, 0, y + h, [0, L.floor[0], 1, L.floor[1]]); g.fillRect(x, fy, w, y + h - fy);
    g.save(); g.strokeStyle = L.grid; g.lineWidth = 2.5; g.shadowColor = L.grid; g.shadowBlur = 10; g.globalAlpha = 0.85;
    for (var i = 0; i < 5; i++) { var yy = fy + Math.pow(i / 4, 1.5) * (y + h - fy); g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
    for (var k = -6; k <= 6; k++) { g.beginPath(); g.moveTo(x + w / 2 + k * 50, fy); g.lineTo(x + w / 2 + k * 150, y + h); g.stroke(); } g.restore();
    var r = T.rng(7); if (full) { g.save(); g.lineCap = 'round'; [[352, 150, 382, 92], [612, 124, 628, 64], [672, 128, 690, 76], [430, 132, 440, 80]].forEach(function (l, i) { g.strokeStyle = T.lin(g, l[0], l[1], l[2], l[3], [0, 'rgba(255,200,80,0)', 1, 'rgba(255,220,120,.9)']); g.lineWidth = 5; g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); g.fillStyle = '#ffd23a'; T.star(g, l[2], l[3], i % 2 ? 13 : 17, i % 2 ? 6 : 8); g.fill(); }); g.restore(); }
    for (var q = 0; q < 40; q++) { g.save(); g.translate(x + r() * w, y + r() * h * 0.6); g.rotate(r() * TAU); g.fillStyle = ['#ff5aa8', '#ffd23a', '#5ad8ff', '#7ae84a', '#ff8a3a'][q % 5]; g.globalAlpha = 0.85; GameLogos.tools.rr(g, -5, -2, 10, 4, 2); g.fill(); g.restore(); }
    for (var s = 0; s < 18; s++) T.spark(g, x + r() * w, y + r() * h * 0.62, 3 + r() * 6, '#fff', 0.7);
  }
  /* ---------- the king piece ---------- */
  function king(g, T, L) {
    var INK = '#3a1a10', RED = ['#ff5a6a', '#c8142a', '#7a0a1a'], FUR = ['#ffffff', '#ece6f2', '#c8c0d8'];
    function crownPath(h) { h.beginPath(); h.moveTo(458, 134); h.lineTo(452, 70); h.lineTo(480, 98); h.lineTo(496, 52); h.lineTo(512, 92); h.lineTo(530, 48); h.lineTo(544, 94); h.lineTo(572, 62); h.lineTo(568, 134); h.quadraticCurveTo(512, 148, 458, 134); h.closePath(); h.fill(); [[452, 66], [496, 48], [530, 44], [572, 58]].forEach(function (b) { h.beginPath(); h.arc(b[0], b[1], 7, 0, TAU); h.fill(); }); }
    var P = {
      robe: function (h) { h.beginPath(); h.moveTo(444, 230); h.quadraticCurveTo(512, 210, 584, 230); h.bezierCurveTo(612, 290, 628, 340, 640, 384); h.quadraticCurveTo(512, 404, 386, 384); h.bezierCurveTo(398, 340, 414, 290, 444, 230); h.closePath(); h.fill(); },
      body: function (h) { h.beginPath(); h.moveTo(486, 236); h.lineTo(540, 236); h.bezierCurveTo(536, 290, 546, 320, 572, 350); h.quadraticCurveTo(584, 372, 578, 392); h.lineTo(446, 392); h.quadraticCurveTo(440, 372, 452, 350); h.bezierCurveTo(478, 320, 490, 290, 486, 236); h.closePath(); h.fill(); },
      fur: function (h) { T.taper(h, [452, 234, 458, 300, 438, 384], function (t) { return 22 - t * 4; }); T.taper(h, [574, 234, 568, 300, 588, 384], function (t) { return 22 - t * 4; }); T.taper(h, [440, 234, 512, 214, 586, 234], function () { return 26; }); },
      head: function (h) { h.beginPath(); h.moveTo(468, 128); h.lineTo(558, 128); h.quadraticCurveTo(566, 128, 566, 140); h.lineTo(556, 222); h.quadraticCurveTo(512, 232, 470, 222); h.lineTo(460, 140); h.quadraticCurveTo(460, 128, 468, 128); h.closePath(); h.fill(); },
      crown: crownPath
    };
    g.fillStyle = 'rgba(20,10,40,.35)'; g.beginPath(); g.ellipse(512, 396, 120, 14, 0, 0, TAU); g.fill();
    T.onePiece(g, T, { x0: 360, y0: 30, W: 300, H: 380, rim: INK, rimW: 4.2, parts: P, order: ['robe', 'body', 'fur', 'head', 'crown'],
      colour: function (B, put, inside) {
        put(B, 'robe', T.lg(B, 386, 0, 640, 0, [0, RED[2], 0.25, RED[1], 0.5, RED[0], 0.75, RED[1], 1, RED[2]]));
        inside(B, 'robe', function (h) { h.strokeStyle = 'rgba(80,0,10,.45)'; h.lineWidth = 6; [[430, 260, 410, 380], [600, 260, 618, 380], [450, 300, 438, 384], [580, 300, 590, 384]].forEach(function (l) { h.beginPath(); h.moveTo(l[0], l[1]); h.lineTo(l[2], l[3]); h.stroke(); }); h.fillStyle = 'rgba(255,200,210,.25)'; h.fillRect(500, 220, 24, 170); });
        put(B, 'body', SHD(B), 0, 0);
        put(B, 'body', T.lg(B, 446, 0, 578, 0, [0, L.piece[2], 0.35, L.piece[0], 0.65, L.piece[1], 1, L.piece[2]]));
        inside(B, 'body', function (h) { h.fillStyle = T.rg(h, 512, 236, 4, 40, [0, 'rgba(80,40,0,.4)', 1, 'rgba(80,40,0,0)']); h.fillRect(470, 230, 90, 40); h.fillStyle = 'rgba(80,40,0,.25)'; h.fillRect(446, 366, 132, 8); });
        put(B, 'fur', T.lg(B, 0, 210, 0, 390, [0, FUR[0], 1, FUR[1]]));
        inside(B, 'fur', function (h) { h.fillStyle = '#2a2030'; var r = T.rng(3); for (var i = 0; i < 26; i++) { var t = r(), side = i % 3; var x = side === 0 ? 446 + (432 - 446) * t : side === 1 ? 580 + (594 - 580) * t : 446 + 140 * t, y = side === 2 ? 220 + Math.sin(t * Math.PI) * -10 : 240 + 140 * t; h.beginPath(); h.ellipse(x + (r() - 0.5) * 12, y + (r() - 0.5) * 8, 2.2, 4, 0, 0, TAU); h.fill(); } h.fillStyle = 'rgba(160,150,190,.35)'; h.fillRect(400, 300, 230, 90); });
        put(B, 'head', T.lg(B, 460, 0, 566, 0, [0, L.piece[1], 0.4, L.piece[0], 1, L.piece[2]]));
        inside(B, 'head', function (h) { h.fillStyle = 'rgba(255,255,255,.55)'; h.beginPath(); h.ellipse(482, 160, 8, 28, 0, 0, TAU); h.fill(); h.fillStyle = 'rgba(80,40,0,.3)'; h.beginPath(); h.ellipse(512, 130, 60, 12, 0, 0, TAU); h.fill(); });
        put(B, 'crown', T.lg(B, 0, 44, 0, 146, [0, '#fff2a0', 0.4, '#ffc21a', 1, '#c8800a']));
        inside(B, 'crown', function (h) { h.fillStyle = '#e8322a'; h.beginPath(); h.arc(512, 118, 7, 0, TAU); h.fill(); h.fillStyle = '#2a8af0'; h.beginPath(); h.arc(486, 120, 5, 0, TAU); h.arc(538, 120, 5, 0, TAU); h.fill(); h.fillStyle = 'rgba(255,255,255,.7)'; h.fillRect(462, 124, 100, 3); });
      } });
    function SHD(h) { return 'rgba(0,0,0,0)'; }
    // gold collar beads + face
    g.save(); g.fillStyle = '#ffc21a'; g.strokeStyle = '#8a5a04'; g.lineWidth = 1.5; for (var i = 0; i < 9; i++) { var t = i / 8, x = 482 + t * 60, y = 238 + Math.sin(t * Math.PI) * 10; g.beginPath(); g.arc(x, y, 4.5, 0, TAU); g.fill(); g.stroke(); } [[484, 238], [540, 238]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], 8, 0, TAU); g.fill(); g.stroke(); }); g.restore();
    [[490, 168], [534, 168]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 11, 14, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 1, e[1] + 2, 6.5, 0, TAU); g.fillStyle = '#4a2a10'; g.fill(); g.beginPath(); g.arc(e[0] - 1, e[1] - 1, 2.4, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.strokeStyle = INK; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(478, 146); g.quadraticCurveTo(490, 140, 500, 146); g.moveTo(524, 146); g.quadraticCurveTo(534, 140, 546, 146); g.stroke();
    function mouth() { g.beginPath(); g.moveTo(494, 192); g.quadraticCurveTo(512, 198, 530, 192); g.quadraticCurveTo(526, 212, 512, 212); g.quadraticCurveTo(498, 212, 494, 192); g.closePath(); }
    mouth(); g.fillStyle = '#7a1a1a'; g.fill(); g.save(); mouth(); g.clip(); g.fillStyle = '#ff7a8a'; g.beginPath(); g.ellipse(512, 212, 10, 6, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(498, 190, 28, 5); g.restore(); mouth(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    g.fillStyle = 'rgba(255,120,120,.35)'; g.beginPath(); g.ellipse(476, 194, 8, 5, 0, 0, TAU); g.ellipse(548, 194, 8, 5, 0, 0, TAU); g.fill();
  }
  /* ---------- the bishop man ---------- */
  function bishop(g, T, L) {
    var INK = '#3a1a10', SK = ['#ffd2a8', '#f0b07a', '#c8804a'];
    var P = {
      arm: function (h) { T.limb(h, [324, 300, 300, 296, 288, 280], 18, 15); h.beginPath(); h.ellipse(284, 274, 12, 10, -0.4, 0, TAU); h.fill(); [[-10, -10], [-4, -14], [4, -14], [10, -10]].forEach(function (f) { T.limb(h, [284, 272, 284 + f[0] * 0.5, 272 + f[1] * 0.5, 284 + f[0], 272 + f[1]], 5, 4); }); },
      robe: function (h) { h.beginPath(); h.moveTo(326, 288); h.quadraticCurveTo(356, 278, 388, 288); h.bezierCurveTo(400, 320, 408, 350, 414, 380); h.quadraticCurveTo(356, 392, 300, 380); h.bezierCurveTo(306, 350, 314, 320, 326, 288); h.closePath(); h.fill(); },
      head: function (h) { h.beginPath(); h.ellipse(356, 262, 26, 28, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(331, 264, 6, 9, 0, 0, TAU); h.ellipse(381, 264, 6, 9, 0, 0, TAU); h.fill(); },
      mitre: function (h) { h.beginPath(); h.moveTo(330, 246); h.bezierCurveTo(326, 210, 340, 182, 356, 168); h.bezierCurveTo(372, 182, 386, 210, 382, 246); h.closePath(); h.fill(); h.beginPath(); h.arc(356, 166, 6, 0, TAU); h.fill(); }
    };
    T.onePiece(g, T, { x0: 260, y0: 150, W: 170, H: 250, rim: INK, rimW: 3.6, parts: P, order: ['robe', 'arm', 'head', 'mitre'],
      colour: function (B, put, inside) {
        put(B, 'robe', T.lg(B, 300, 0, 414, 0, [0, '#9a1a2a', 0.3, '#e0304a', 0.7, '#e0304a', 1, '#8a1020']));
        inside(B, 'robe', function (h) { h.fillStyle = T.lg(h, 0, 290, 0, 390, [0, '#2ac8b8', 1, '#1a8a8a']); h.beginPath(); h.moveTo(346, 290); h.lineTo(366, 290); h.lineTo(376, 390); h.lineTo(336, 390); h.closePath(); h.fill(); h.strokeStyle = '#ffc21a'; h.lineWidth = 5; h.beginPath(); h.moveTo(344, 290); h.lineTo(334, 390); h.moveTo(368, 290); h.lineTo(378, 390); h.moveTo(326, 292); h.quadraticCurveTo(356, 300, 388, 292); h.stroke(); h.fillStyle = '#2a8a4a'; h.beginPath(); h.arc(356, 300, 6, 0, TAU); h.fill(); });
        put(B, 'arm', T.lg(B, 324, 0, 284, 0, [0, '#c8202a', 0.7, '#e0304a', 0.71, SK[1], 1, SK[0]]));
        put(B, 'head', T.rg(B, 348, 254, 3, 34, [0, SK[0], 0.6, SK[1], 1, SK[2]]));
        put(B, 'mitre', T.lg(B, 330, 0, 382, 0, [0, '#8a2ac8', 0.5, '#b84af0', 1, '#6a1aa8']));
        inside(B, 'mitre', function (h) { h.fillStyle = '#ffc21a'; h.fillRect(330, 232, 52, 12); h.fillRect(351, 172, 10, 64); h.fillStyle = '#e8322a'; h.beginPath(); h.arc(356, 238, 4, 0, TAU); h.fill(); });
      } });
    g.fillStyle = '#3a1a08'; [[346, 260], [366, 260]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 3.2, 4, 0, 0, TAU); g.fill(); });
    g.fillStyle = '#5a2a10'; g.beginPath(); g.moveTo(342, 274); g.quadraticCurveTo(356, 268, 370, 274); g.quadraticCurveTo(356, 282, 342, 274); g.fill();
    g.strokeStyle = '#3a1a08'; g.lineWidth = 2; g.beginPath(); g.arc(356, 278, 7, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  }
  /* ---------- the knight horse in armour: chibi — big helmeted head, short armoured neck, compact body, front legs up ---------- */
  function knight(g, T, L) {
    var INK = '#2a1a10', BR = ['#d8955a', '#a8622a', '#6a3a14'], ST = ['#f4f8fc', '#c0ccdc', '#7a8aa0'];
    function headPath(h) { h.beginPath(); h.moveTo(650, 222); h.bezierCurveTo(646, 176, 676, 156, 704, 162); h.bezierCurveTo(728, 168, 740, 192, 744, 216); h.bezierCurveTo(748, 236, 740, 252, 724, 254); h.lineTo(694, 254); h.bezierCurveTo(670, 252, 652, 242, 650, 222); h.closePath(); }
    var P = {
      tail: function (h) { T.taper(h, [604, 296, 576, 290, 584, 340], function (t) { return 18 + Math.sin(t * Math.PI) * 10; }); },
      legB: function (h) { T.limb(h, [620, 318, 616, 344, 612, 366], 18, 14); T.limb(h, [644, 326, 644, 350, 640, 372], 18, 14); h.beginPath(); h.ellipse(612, 370, 10, 7, 0, 0, TAU); h.ellipse(640, 376, 10, 7, 0, 0, TAU); h.fill(); },
      body: function (h) { h.beginPath(); h.ellipse(646, 302, 54, 36, -0.12, 0, TAU); h.fill(); },
      legF: function (h) { T.limb(h, [678, 314, 708, 306, 712, 336], 18, 14); T.limb(h, [670, 326, 694, 326, 694, 352], 18, 14); h.beginPath(); h.ellipse(713, 342, 9, 8, 0.3, 0, TAU); h.ellipse(695, 357, 9, 8, 0.3, 0, TAU); h.fill(); },
      neck: function (h) { T.limb(h, [664, 290, 668, 262, 678, 238], 46, 40); },
      ear: function (h) { h.beginPath(); h.moveTo(694, 168); h.lineTo(700, 140); h.lineTo(714, 166); h.closePath(); h.fill(); },
      head: function (h) { headPath(h); h.fill(); },
      plume: function (h) { for (var i = 0; i <= 10; i++) { var t = i / 10, u = 1 - t, x = u * u * 690 + 2 * u * t * 660 + t * t * 626, y = u * u * 160 + 2 * u * t * 118 + t * t * 168, r = 15 - t * 4 + (i % 2) * 3; h.beginPath(); h.arc(x, y, r, 0, TAU); h.fill(); } }
    };
    T.onePiece(g, T, { x0: 560, y0: 100, W: 200, H: 290, rim: INK, rimW: 3.6, parts: P, order: ['tail', 'legB', 'body', 'legF', 'neck', 'plume', 'ear', 'head'],
      colour: function (B, put, inside) {
        put(B, 'tail', T.lg(B, 576, 290, 604, 340, [0, BR[1], 1, BR[2]]));
        put(B, 'legB', BR[2]); inside(B, 'legB', function (h) { h.fillStyle = '#f4ece0'; h.fillRect(600, 354, 52, 12); h.fillStyle = '#2a2030'; h.fillRect(600, 366, 52, 14); });
        put(B, 'body', T.lg(B, 592, 270, 700, 338, [0, BR[0], 1, BR[1]]));
        inside(B, 'body', function (h) {   // blue cloth + gold trim, saddle, silver chest plate
          h.fillStyle = T.lg(h, 0, 296, 0, 340, [0, '#7ac0ff', 1, '#2a6ac8']); h.beginPath(); h.moveTo(594, 300); h.quadraticCurveTo(646, 286, 694, 296); h.lineTo(698, 340); h.lineTo(592, 340); h.closePath(); h.fill();
          h.strokeStyle = '#ffc21a'; h.lineWidth = 5; h.beginPath(); h.moveTo(594, 300); h.quadraticCurveTo(646, 286, 694, 296); h.stroke(); h.fillStyle = '#ffc21a'; h.beginPath(); h.moveTo(648, 304); h.lineTo(658, 316); h.lineTo(648, 328); h.lineTo(638, 316); h.closePath(); h.fill();
          h.fillStyle = T.lg(h, 0, 266, 0, 296, [0, '#a8703a', 1, '#6a3a14']); GameLogos.tools.rr(h, 612, 266, 48, 26, 10); h.fill();
          h.fillStyle = T.lg(h, 670, 270, 700, 320, [0, ST[0], 1, ST[2]]); h.beginPath(); h.ellipse(688, 296, 16, 24, -0.2, 0, TAU); h.fill(); });
        put(B, 'legF', BR[1]); inside(B, 'legF', function (h) { h.fillStyle = '#f4ece0'; h.beginPath(); h.arc(711, 330, 9, 0, TAU); h.arc(694, 346, 9, 0, TAU); h.fill(); h.fillStyle = '#2a2030'; h.beginPath(); h.ellipse(714, 343, 8, 6, 0.3, 0, TAU); h.ellipse(696, 358, 8, 6, 0.3, 0, TAU); h.fill(); });
        put(B, 'neck', T.lg(B, 650, 240, 690, 300, [0, BR[0], 1, BR[1]]));
        inside(B, 'neck', function (h) { for (var i = 0; i < 3; i++) { h.fillStyle = T.lg(h, 0, 246 + i * 14, 0, 262 + i * 14, [0, ST[0], 1, ST[2]]); h.beginPath(); h.ellipse(672, 254 + i * 14, 26, 9, -0.25, 0, TAU); h.fill(); } });
        put(B, 'plume', T.lg(B, 620, 110, 690, 175, [0, '#fffaf0', 0.55, '#f2d8a0', 1, '#c89a50']));
        inside(B, 'plume', function (h) { h.strokeStyle = 'rgba(150,100,40,.5)'; h.lineWidth = 2; for (var i = 0; i < 7; i++) { var t = i / 7, u = 1 - t, x = u * u * 690 + 2 * u * t * 660 + t * t * 626, y = u * u * 160 + 2 * u * t * 118 + t * t * 168; h.beginPath(); h.arc(x, y, 9, 0.4, 2.6); h.stroke(); } });
        put(B, 'ear', BR[1]);
        put(B, 'head', T.lg(B, 650, 200, 748, 254, [0, BR[1], 0.5, BR[0], 1, '#e8a870']));
        inside(B, 'head', function (h) {   // helmet over the top half, visor slits, white blaze, light muzzle
          h.fillStyle = T.lg(h, 650, 160, 740, 220, [0, ST[0], 0.5, ST[1], 1, ST[2]]); h.beginPath(); h.moveTo(640, 232); h.lineTo(640, 150); h.lineTo(750, 150); h.lineTo(750, 196); h.quadraticCurveTo(700, 196, 640, 232); h.closePath(); h.fill();
          h.fillStyle = '#ffc21a'; h.beginPath(); h.moveTo(640, 232); h.quadraticCurveTo(700, 196, 750, 196); h.lineTo(750, 202); h.quadraticCurveTo(700, 202, 640, 238); h.closePath(); h.fill();
          h.fillStyle = '#2a3040'; [0, 1, 2, 3].forEach(function (i) { GameLogos.tools.rr(h, 682 + i * 11, 172 - i * 1.5, 6, 18, 3); h.fill(); });
          h.fillStyle = 'rgba(255,255,255,.65)'; h.beginPath(); h.ellipse(668, 180, 10, 5, -0.6, 0, TAU); h.fill();
          h.fillStyle = '#fff4e8'; h.beginPath(); h.moveTo(722, 204); h.quadraticCurveTo(732, 216, 736, 230); h.lineTo(728, 232); h.quadraticCurveTo(724, 216, 716, 206); h.closePath(); h.fill();
          h.fillStyle = 'rgba(255,220,180,.8)'; h.beginPath(); h.ellipse(734, 238, 14, 12, 0, 0, TAU); h.fill(); });
      } });
    g.beginPath(); g.ellipse(704, 218, 9, 10, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(706, 220, 5, 0, TAU); g.fillStyle = '#2a1a08'; g.fill(); g.beginPath(); g.arc(704, 217, 1.8, 0, TAU); g.fillStyle = '#fff'; g.fill();
    g.strokeStyle = INK; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(712, 246); g.quadraticCurveTo(728, 254, 742, 244); g.stroke(); g.beginPath(); g.ellipse(740, 232, 2.5, 3.5, 0.3, 0, TAU); g.fillStyle = INK; g.fill();
    g.strokeStyle = '#6a3a14'; g.lineWidth = 3; g.beginPath(); g.moveTo(684, 244); g.lineTo(724, 240); g.stroke(); g.beginPath(); g.arc(704, 242, 4, 0, TAU); g.fillStyle = '#ffc21a'; g.fill();
  }
  function words(g, T, L, cx, base, size) {
    var c = L.word, o = { spacing: size * 0.01, dark: L.dark, outline: size * 0.14, depth: size * 0.08, fat: size * 0.006, ring: 'rgba(255,240,200,.95)', edge: function () { return sh(c[2], -0.45); }, edgeW: size * 0.075, face: function () { return [0, c[0], 0.45, c[1], 1, c[2]]; }, wave: function (j) { return [10, 3, 0, 3, 10][j] * size / 130; }, glow: 'rgba(255,200,80,.7)', glowBlur: 0.25 };
    T.word(g, 'CHESS', cx, base, size, o); T.gloss(g, 'CHESS', cx, base, size, o, 0.5);
  }
  var PX = 274, PY = 40, PW = 476, PH = 500;
  function frameRim(g, T, L) { T.rr(g, PX, PY, PW, PH, 64); g.lineWidth = 9; g.strokeStyle = T.lin(g, PX, PY, PX + PW, PY + PH, [0, L.rim[0], 0.5, L.rim[1], 1, L.rim[0]]); g.stroke(); }
  function grow(g, x, y, k, f) { g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y); f(); g.restore(); }
  function inner(g, T, L, full) { g.save(); T.rr(g, PX, PY, PW, PH, 64); g.clip(); world(g, T, L, PX, PY, PW, PH, full);
    g.fillStyle = T.rad(g, 512, 210, 10, 200, [0, 'rgba(200,250,255,.75)', 0.4, 'rgba(120,200,255,.3)', 1, 'rgba(120,200,255,0)']); g.fillRect(PX, PY, PW, PH);
    grow(g, 350, 384, 1.2, function () { bishop(g, T, L); }); grow(g, 640, 384, 1.08, function () { g.translate(-34, 0); knight(g, T, L); }); king(g, T, L); g.restore(); frameRim(g, T, L); words(g, T, L, 512, 494, 132); if (full) { T.spark(g, 322, 418, 22, '#ffe08a', 1); T.spark(g, 712, 404, 26, '#ffe08a', 1); } }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 40, 640, [0, '#3a3aa8', 1, '#14145a']); g.fillRect(0, 0, 1024, 572); inner(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-262, -30); inner(g, T, L, px >= 220); return; }
    if (kind === 'wide') { g.save(); g.translate(16, 6); g.scale(0.375, 0.375); g.translate(-PX, -PY); g.save(); T.rr(g, PX, PY, PW, PH, 64); g.clip(); world(g, T, L, PX, PY, PW, PH, false); king(g, T, L); g.restore(); frameRim(g, T, L); g.restore(); words(g, T, L, 520, 146, 118); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.76, 0.76); g.translate(-512, -290);
      if (px >= 90) inner(g, T, L, false); else { g.save(); T.rr(g, PX, PY, PW, PH, 64); g.clip(); world(g, T, L, PX, PY, PW, PH, false); g.translate(512, 300); g.scale(1.3, 1.3); g.translate(-512, -230); king(g, T, L); g.restore(); frameRim(g, T, L); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO chess END

// 🏷️ LOGO numbergrid START — 🔢 Digitinct (GameID numbergrid), drawn in code from Aowu's picture (gl-3)
GameLogos.add('numbergrid', (function () {
  // design space = Aowu's picture, 1024 × 572
  var BOX = { scene: [1024, 572], main: [560, 548], wide: [760, 200], badge: [400, 400] };
  // a real, finished 3 × 3 box (each of 1–9 once); the middle-bottom square is the one being solved (smiley)
  var CELLS = [3, 8, 1, 6, 7, 9, 2, 0, 4], MISSING = 5;
  var TILE = ['#ffa63a', '#ff8fc4', '#3fd0c0', '#ffd23e', '#9a6cf5', '#5ad06a', '#ff6a5a', '#ff9ad0', '#62d84a'];
  function mk(o) { var b = { bg: ['#3fc8ff', '#5aa0fa', '#b45af5'], icon: ['#4f9cff', '#5a62f0', '#9a4ae8'], rim: '#bfe9ff', plate: ['#8a7af5', '#5a48c8'], tile: TILE, ink: '#3b2f9a', word: ['#ffffff', '#f4f0ff', '#dcd4ff'], out: ['#5a6af0', '#35298f'], arrow: ['#7ad0ff', '#4a7af0'], syms: null, glow: 'rgba(140,220,255,.9)' }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = {
    classic: mk({}),   // the game's 'numbers' theme has no entry on purpose: an unknown look falls back to classic
    animals: mk({ bg: ['#9ae86a', '#4fc87a', '#2a9a8a'], icon: ['#6ad85a', '#3fb06a', '#2a8a7a'], rim: '#e0ffc8', plate: ['#5ab84a', '#2f7a2a'], ink: '#1f5a1a', out: ['#3fa84a', '#1f6a2a'], arrow: ['#d8ff8a', '#5ac83a'], glow: 'rgba(190,255,150,.9)', syms: ['🐶', '🐱', '🐰', '🐸', '🐵', '🐷', '🐮', '🦁', '🐼'] }),
    monsters: mk({ bg: ['#b08aff', '#7a52e8', '#3a1a9a'], icon: ['#9a7af5', '#6a3fe0', '#3a1a9a'], rim: '#e8dcff', plate: ['#6a4ae0', '#2a1470'], ink: '#2a1470', out: ['#7a4af0', '#3a1a9a'], arrow: ['#c8ffa0', '#5ad06a'], glow: 'rgba(200,170,255,.9)', syms: ['👽', '👾', '🤖', '👻', '👹', '🐲', '🦑', '🎃', '🧟'] }),
    vehicles: mk({ bg: ['#ffd88a', '#ffa84a', '#f06a3a'], icon: ['#ffc05a', '#f58a3a', '#e0582a'], rim: '#fff0c8', plate: ['#f0903a', '#a8500e'], ink: '#7a3a0a', out: ['#f0802a', '#a84a0e'], arrow: ['#fff2a0', '#ffb02e'], glow: 'rgba(255,220,150,.9)', syms: ['🚗', '🚌', '🚑', '🚒', '🚜', '🚲', '🚀', '🚁', '🚂'] }),
    fantasy: mk({ bg: ['#ffb0e0', '#f070c0', '#a04ae0'], icon: ['#ff9ad8', '#e85ab8', '#a04ae0'], rim: '#ffe6f6', plate: ['#e060b0', '#8a1f6a'], ink: '#7a1f5c', out: ['#e85ab8', '#8a2a9a'], arrow: ['#fff0a0', '#ffb8e8'], glow: 'rgba(255,190,235,.9)', syms: ['🦄', '🧚', '🐉', '🏰', '🔮', '👑', '🧞', '🌈', '💎'] }),
    space: mk({ bg: ['#2a2a7a', '#1a1458', '#06061e'], icon: ['#3a3aa8', '#2a1f7a', '#12104a'], rim: '#9fb0ff', plate: ['#3a2aa0', '#12104a'], ink: '#12104a', out: ['#5a5af0', '#1a1470'], arrow: ['#9fe8ff', '#5a7af0'], glow: 'rgba(130,160,255,.9)', syms: ['🚀', '🛸', '🛰️', '🪐', '🌍', '🌙', '☄️', '⭐', '👨‍🚀'] })
  };
  var TAU = Math.PI * 2;

  function bg(g, L, T) {
    g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, L.bg[0], 0.5, L.bg[1], 1, L.bg[2]]); g.fillRect(0, 0, 1024, 572);
    g.fillStyle = T.rad(g, 512, 270, 150, 380, [0, 'rgba(140,255,255,.95)', 0.55, 'rgba(120,235,255,.4)', 1, 'rgba(120,230,255,0)']); g.fillRect(0, 0, 1024, 572);
  }
  function icon(g, L, T, x, y, S, gk) { gk = gk || 1;   // the glowing rounded-square plate
    g.save(); g.shadowColor = L.glow; g.shadowBlur = 90 * gk; T.rr(g, x, y, S, S, S * 0.2); g.fillStyle = L.rim; g.fill(); g.shadowBlur = 44 * gk; g.fill(); g.shadowBlur = 0;
    T.rr(g, x + 5, y + 5, S - 10, S - 10, S * 0.19); g.fillStyle = T.lin(g, x, y, x + S, y + S, [0, L.icon[0], 0.5, L.icon[1], 1, L.icon[2]]); g.fill();
    g.save(); T.rr(g, x + 5, y + 5, S - 10, S - 10, S * 0.19); g.clip();
    g.fillStyle = T.rad(g, x + S * 0.3, y + S * 0.2, 0, S * 0.8, [0, 'rgba(255,255,255,.4)', 1, 'rgba(255,255,255,0)']); g.fillRect(x, y, S, S);
    // tiny floating bits: 0 / 1 and dots
    var r = T.rng(8); g.font = '700 ' + S * 0.045 + 'px ' + T.FONT; g.textAlign = 'center';
    for (var i = 0; i < 26; i++) { var px = x + S * (0.08 + r() * 0.84), py = y + S * (0.08 + r() * 0.6); g.globalAlpha = 0.35 + r() * 0.4; g.fillStyle = '#eaf6ff'; if (i % 3 === 0) g.fillText(i % 2 ? '0' : '1', px, py); else { g.beginPath(); g.arc(px, py, 1.4 + r() * 2, 0, TAU); g.fill(); } }
    g.globalAlpha = 1; g.restore();
    // neon rim: a bright tube with a soft halo, inside the edge
    g.shadowColor = L.glow; g.shadowBlur = 18; T.rr(g, x + 10, y + 10, S - 20, S - 20, S * 0.175); g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.9)'; g.stroke(); g.shadowBlur = 0; g.restore();
  }
  function swoosh(g, L, T, cx, cy, k) {   // the arrow sweeping up behind the tiles
    g.save(); g.translate(cx, cy); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round';
    function body() { g.beginPath(); g.moveTo(-150, 96); g.bezierCurveTo(-60, 150, 90, 110, 138, -40); }
    body(); g.lineWidth = 22; g.strokeStyle = 'rgba(30,40,150,.35)'; g.stroke(); g.shadowColor = L.arrow[0]; g.shadowBlur = 22; body(); g.lineWidth = 15; g.strokeStyle = T.lin(g, -150, 100, 140, -60, [0, 'rgba(255,255,255,0)', 0.35, L.arrow[1], 1, L.arrow[0]]); g.stroke();
    g.save(); g.translate(140, -46); g.rotate(-1.22); g.beginPath(); g.moveTo(26, 0); g.lineTo(-12, -24); g.lineTo(-6, 0); g.lineTo(-12, 24); g.closePath(); g.fillStyle = L.arrow[0]; g.fill(); g.lineWidth = 4; g.strokeStyle = 'rgba(30,40,150,.4)'; g.stroke(); g.restore();
    g.restore();
  }
  function smile(g, x, y, s, ink) { g.save(); g.translate(x, y); g.fillStyle = ink; g.beginPath(); g.arc(-s * 0.2, -s * 0.1, s * 0.07, 0, TAU); g.arc(s * 0.2, -s * 0.1, s * 0.07, 0, TAU); g.fill(); g.beginPath(); g.arc(0, s * 0.02, s * 0.24, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = s * 0.07; g.lineCap = 'round'; g.strokeStyle = ink; g.stroke(); g.fillStyle = 'rgba(255,90,120,.4)'; g.beginPath(); g.arc(-s * 0.3, s * 0.1, s * 0.08, 0, TAU); g.arc(s * 0.3, s * 0.1, s * 0.08, 0, TAU); g.fill(); g.restore(); }
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; function m(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); } return 'rgb(' + m(r) + ',' + m(gg) + ',' + m(b) + ')'; }
  function tiles(g, L, T, cx, cy, s, tilt) {   // s = tile size
    var gap = s * 0.1, W = s * 3 + gap * 2, pad = s * 0.16;
    g.save(); g.translate(cx, cy); g.rotate(tilt == null ? 0.1 : tilt); g.transform(1, 0, -0.05, 0.95, 0, 0);
    // base plate with a thick lower lip
    g.shadowColor = 'rgba(20,20,110,.45)'; g.shadowBlur = 20; g.shadowOffsetY = 10; T.rr(g, -W / 2 - pad, -W / 2 - pad + s * 0.12, W + pad * 2, W + pad * 2, s * 0.26); g.fillStyle = L.plate[1]; g.fill(); g.shadowColor = 'transparent';
    T.rr(g, -W / 2 - pad, -W / 2 - pad, W + pad * 2, W + pad * 2, s * 0.26); g.fillStyle = T.lin(g, 0, -W / 2, 0, W / 2, [0, L.plate[0], 1, shade(L.plate[0], -0.18)]); g.fill(); g.lineWidth = s * 0.04; g.strokeStyle = 'rgba(255,255,255,.35)'; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (var i = 0; i < 9; i++) { var x = -W / 2 + (i % 3) * (s + gap), y = -W / 2 + ((i / 3) | 0) * (s + gap), c = L.tile[i], empty = CELLS[i] === 0;
      T.rr(g, x, y + s * 0.09, s, s, s * 0.22); g.fillStyle = shade(c, -0.3); g.fill();                         // lip
      g.save(); g.shadowColor = c; g.shadowBlur = s * 0.42; T.rr(g, x, y, s, s, s * 0.22); g.fillStyle = T.lin(g, 0, y, 0, y + s, [0, shade(c, 0.35), 0.5, c, 1, shade(c, -0.08)]); g.fill(); g.restore(); T.rr(g, x + s * 0.03, y + s * 0.03, s * 0.94, s * 0.94, s * 0.2); g.lineWidth = s * 0.035; g.strokeStyle = 'rgba(255,255,255,.7)'; g.stroke();
      T.rr(g, x + s * 0.09, y + s * 0.07, s * 0.82, s * 0.36, s * 0.16); g.fillStyle = 'rgba(255,255,255,.3)'; g.fill();  // gloss
      if (empty) { smile(g, x + s / 2, y + s * 0.52, s * 0.9, shade(c, -0.55)); continue; }
      if (L.syms) { g.font = s * 0.6 + 'px ' + T.FONT + ', "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"'; g.fillStyle = '#000'; g.fillText(L.syms[CELLS[i] - 1], x + s / 2, y + s * 0.56); }
      else { g.font = '700 ' + s * 0.7 + 'px ' + T.FONT; g.lineJoin = 'round'; g.lineWidth = s * 0.1; g.strokeStyle = shade(c, -0.42); g.strokeText(String(CELLS[i]), x + s / 2, y + s * 0.55); g.fillStyle = '#fff'; g.fillText(String(CELLS[i]), x + s / 2, y + s * 0.55); }
    }
    g.restore();
  }
  function word(g, L, T, cx, base, size) {
    var o = { spacing: size * 0.01, dark: L.out[1], side: L.out[0], ring: L.out[0], outline: size * 0.24, depth: size * 0.11, glow: L.glow, face: function () { return [0, L.word[0], 0.6, L.word[1], 1, L.word[2]]; } };
    var W = T.word(g, 'Digitinct', cx, base, size, o);
    T.gloss(g, 'Digitinct', cx, base, size, o, 0.5); return W;
  }
  function sparks(g, T, cx, cy, k) { [[-196, -150, 11], [150, -176, 13], [206, -60, 8], [-214, 30, 8], [176, 96, 9], [-150, 120, 7], [60, -196, 6]].forEach(function (s, i) { T.spark(g, cx + s[0] * k, cy + s[1] * k, s[2] * k, i % 2 ? '#fff6b0' : '#ffffff', 0.95); }); }
  function star(g, T, x, y, R) { T.star(g, x, y, R, R * 0.5); g.fillStyle = '#ffe14a'; g.fill(); g.lineWidth = R * 0.16; g.strokeStyle = '#c8860a'; g.lineJoin = 'round'; g.stroke(); }

  function emblem(g, L, T, gk) {   // picture coordinates
    icon(g, L, T, 300, 72, 424, gk);
    swoosh(g, L, T, 556, 262, 1.02); sparks(g, T, 512, 250, 0.95);
    tiles(g, L, T, 514, 238, 62);
    T.spark(g, 388, 142, 17, '#ffe14a', 1); T.spark(g, 648, 146, 13, '#d9a8ff', 1); star(g, T, 676, 330, 9);
    word(g, L, T, 512, 412, 100);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { bg(g, L, T); emblem(g, L, T); return; }
    if (kind === 'main') { g.translate(-232, -12); emblem(g, L, T); return; }
    if (kind === 'wide') { tiles(g, L, T, 96, 96, 46, -0.1); word(g, L, T, 466, 132, 108); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.82, 0.82); g.translate(-512, -284); if (px >= 90) { emblem(g, L, T, 0.28); } else { icon(g, L, T, 300, 72, 424, 0.28); tiles(g, L, T, 512, 284, 100); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO numbergrid END

// 🏷️ LOGO double-up START — 🔀 Double Up, drawn in code from Aowu's picture (gl-15, round 5). Rounded icon, a REAL doubling row of tiles
// (8 · 16 · 32 · 64 · 128 · 256 · 512) climbing along green arrows, "DOUBLE" gold over a big green → blue "UP", winged clock, gauge, a "2" tile.
// Looks = the game's tile themes (DoubleUp.html THEMES: their tile colours, and their pictures on the tiles instead of numbers).
GameLogos.add('double-up', (function () {
  var BOX = { scene: [1024, 572], main: [580, 556], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, ROW = [8, 16, 32, 64, 128, 256, 512];
  function mk(o) { var b = { bg: ['#4a3ab8', '#2a1a78', '#120a3a'], rays: 'rgba(120,160,255,.16)', rim: ['#9ad8ff', '#5a6af0', '#2a1a78'], dark: '#2a1268', ink: '#ffffff',
    // tile colour per value index (2 → 0, 4 → 1 … 512 → 8): the picture's bright row
    col: ['#ff4a3a', '#ffa04a', '#ff8a2e', '#ff6a3a', '#3a9af5', '#ff4a6a', '#2a7ae8', '#b84af5', '#4ad86a', '#ffd23a', '#ff5ab8', '#3ad8d8', '#7a5cfa'], pics: null,
    a: ['#fff6a0', '#ffd21a', '#ff9a0a'], u: ['#c8ff7a', '#5ad83a', '#1a9a3a'], p: ['#8afff0', '#2ad8e8', '#1a6ae8'] };
    for (var k in o) b[k] = o[k]; return b; }
  function th(t, dark, extra) { var o = { col: t.col, pics: t.pics, bg: [t.bg[1], t.board, dark], rays: 'rgba(255,255,255,.12)', rim: [t.bg[0], t.bg[1], dark], dark: dark }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var TH = {
    numbers: { bg: ['#FFF4E6', '#FFD9B0'], board: '#BBA38D', col: ['#EEE4DA', '#EDE0C8', '#F2B179', '#F59563', '#F67C5F', '#F65E3B', '#EDCF72', '#EDCC61', '#EDC850', '#EDC53F', '#EDC22E', '#7A5CFA', '#3D3A8C'] },
    animals: { bg: ['#E8FBE0', '#9FDB86'], board: '#6BAE5A', pics: ['🥚', '🐣', '🐥', '🐔', '🐰', '🐱', '🐶', '🐷', '🐮', '🦁', '🐘', '🐳', '🦄'], col: ['#FFF8E1', '#FFF1C1', '#FFE38A', '#FFD166', '#FFB4A2', '#F7A072', '#E5989B', '#F28482', '#B5838D', '#E9C46A', '#90BE6D', '#43AA8B', '#9B5DE5'] },
    dino: { bg: ['#F5E6CC', '#C79A5A'], board: '#8C6239', pics: ['🥚', '🦴', '🦎', '🐊', '🐢', '🐍', '🦕', '🦖', '🐉', '🌋', '☄️', '🌍', '👑'], col: ['#F2E3C6', '#E9D5A8', '#C9D84A', '#A7C957', '#6A994E', '#7BC67E', '#5FB3B3', '#3E9B5A', '#D4A64A', '#E07A5F', '#BC4749', '#6D597A', '#3D405B'] },
    space: { bg: ['#1B1F4A', '#3C2A7A'], board: '#141634', pics: ['✨', '🌑', '🌙', '🌍', '🪐', '☀️', '⭐', '🌟', '💫', '☄️', '🌌', '🛸', '🚀'], col: ['#3A3F7A', '#45508F', '#4F63A8', '#4A7BC0', '#5E8FD8', '#7A6CF0', '#9B5DE5', '#C77DFF', '#F15BB5', '#FF8FAB', '#FFB703', '#FB8500', '#E63946'] },
    fantasy: { bg: ['#FCE7FF', '#C9A7FF'], board: '#7B4FB8', pics: ['🔹', '🔷', '💠', '💎', '🔮', '🪄', '👑', '🏰', '🦄', '🐉', '🧞', '🌈', '✨'], col: ['#EADCFF', '#D9C2FF', '#C7A7FF', '#B38CFF', '#A06CF5', '#FF9ED2', '#FF7AD9', '#FFB86B', '#FFD36E', '#7DFFB2', '#7AE7FF', '#5B8CFF', '#3D3A8C'] },
    sweets: { bg: ['#FFE8F0', '#FFB3CC'], board: '#D46A8C', pics: ['🍬', '🍭', '🍪', '🧁', '🍩', '🍰', '🍫', '🍦', '🍨', '🥧', '🎂', '🍯', '🏆'], col: ['#FFF0F5', '#FFE0EC', '#FFD1DF', '#FFC2D4', '#FFB3CC', '#FF9EBB', '#E07A9E', '#C9A27E', '#A67C52', '#FFD36E', '#FFB703', '#F28C28', '#E63946'] } };
  var LOOK = { classic: mk({}), numbers: th(TH.numbers, '#4a3a2a', { ink: '#776E65' }), animals: th(TH.animals, '#1e4a14'), dino: th(TH.dino, '#3a2410'), space: th(TH.space, '#070820'), fantasy: th(TH.fantasy, '#3a1a6a'), sweets: th(TH.sweets, '#6a1a38') };
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function c(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); } return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')'; }
  function lum(hex) { var n = parseInt(hex.slice(1), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) / 255; }
  /* one tile: glossy rounded square with a darker 3D bottom edge; the number (or the theme's picture for that value) */
  function tile(g, T, L, v, x, y, S, rot) {
    var i = Math.round(Math.log(v) / Math.LN2) - 1, c = L.col[Math.min(i, L.col.length - 1)];
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    g.save(); g.shadowColor = 'rgba(0,0,30,.45)'; g.shadowBlur = S * 0.2; g.shadowOffsetY = S * 0.06; T.rr(g, -S / 2, -S / 2, S, S, S * 0.2); g.fillStyle = shade(c, -0.4); g.fill(); g.restore();
    T.rr(g, -S / 2, -S / 2, S, S * 0.9, S * 0.2); g.fillStyle = T.lin(g, 0, -S / 2, 0, S * 0.4, [0, shade(c, 0.35), 0.5, c, 1, shade(c, -0.12)]); g.fill();
    T.rr(g, -S / 2 + S * 0.07, -S / 2 + S * 0.06, S * 0.86, S * 0.3, S * 0.14); g.fillStyle = 'rgba(255,255,255,.3)'; g.fill();
    if (L.pics) { g.font = Math.round(S * 0.56) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L.pics[Math.min(i, L.pics.length - 1)], 0, -S * 0.03); }
    else { var str = String(v), fs = S * (str.length > 2 ? 0.4 : str.length > 1 ? 0.5 : 0.62); g.font = '700 ' + fs + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      var dk = lum(c) > 0.72; g.lineWidth = fs * 0.22; g.strokeStyle = dk ? 'rgba(255,255,255,.6)' : 'rgba(30,20,60,.55)'; g.strokeText(str, 0, -S * 0.03); g.fillStyle = dk ? (L.ink === '#ffffff' ? '#5a3a2a' : L.ink) : '#ffffff'; g.fillText(str, 0, -S * 0.03); }
    g.restore();
  }
  function arrow(g, T, pts, w, c, head) {
    g.save(); g.lineCap = 'round'; function path() { g.beginPath(); g.moveTo(pts[0], pts[1]); g.bezierCurveTo(pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]); }
    g.shadowColor = c[1]; g.shadowBlur = 14; path(); g.lineWidth = w + 6; g.strokeStyle = c[2]; g.stroke(); g.shadowBlur = 0; path(); g.lineWidth = w; g.strokeStyle = T.lin(g, pts[0], pts[1], pts[6], pts[7], [0, c[2], 0.5, c[1], 1, c[0]]); g.stroke();
    var a = Math.atan2(pts[7] - pts[5], pts[6] - pts[4]); g.translate(pts[6], pts[7]); g.rotate(a); g.beginPath(); g.moveTo(head, 0); g.lineTo(-head * 0.5, -head * 0.95); g.lineTo(-head * 0.25, 0); g.lineTo(-head * 0.5, head * 0.95); g.closePath(); g.shadowColor = c[1]; g.shadowBlur = 12; g.fillStyle = c[0]; g.fill(); g.lineWidth = 3; g.strokeStyle = c[2]; g.stroke(); g.restore();
  }
  function clock(g, T, x, y, r) {   // winged alarm clock
    g.save(); [-1, 1].forEach(function (k) { g.save(); g.translate(x + k * r * 0.9, y - r * 0.1); g.scale(k, 1); for (var f = 0; f < 3; f++) { g.beginPath(); g.ellipse(r * 0.55 + f * r * 0.18, -r * 0.1 - f * r * 0.22, r * 0.6, r * 0.2, -0.5 - f * 0.25, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#8ab0e0'; g.stroke(); } g.restore(); });
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.lin(g, 0, y - r, 0, y + r, [0, '#ff8a6a', 1, '#d8301a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#6a1a10'; g.stroke();
    g.beginPath(); g.arc(x, y, r * 0.74, 0, TAU); g.fillStyle = '#fff8ee'; g.fill(); g.strokeStyle = '#2a1a3a'; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - r * 0.5); g.moveTo(x, y); g.lineTo(x + r * 0.36, y + r * 0.1); g.stroke();
    [-1, 1].forEach(function (k) { g.beginPath(); g.arc(x + k * r * 0.55, y - r * 0.92, r * 0.24, 0, TAU); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#8a5a04'; g.stroke(); }); g.restore();
  }
  function gauge(g, T, x, y, r) {
    g.save(); g.shadowColor = '#7ae8ff'; g.shadowBlur = 16; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.lin(g, 0, y - r, 0, y + r, [0, '#e8f4ff', 1, '#a8c0e8']); g.fill(); g.restore(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.lineWidth = r * 0.14; g.strokeStyle = '#3a4a8a'; g.stroke();
    var cols = ['#4ad86a', '#ffd23a', '#ff8a2e', '#ff4a3a']; for (var i = 0; i < 4; i++) { g.beginPath(); g.arc(x, y, r * 0.72, Math.PI * (0.8 + i * 0.35), Math.PI * (0.8 + (i + 1) * 0.35)); g.lineWidth = r * 0.16; g.strokeStyle = cols[i]; g.stroke(); }
    g.save(); g.translate(x, y); g.rotate(0.6); g.beginPath(); g.moveTo(-r * 0.06, 0); g.lineTo(0, -r * 0.7); g.lineTo(r * 0.06, 0); g.closePath(); g.fillStyle = '#1a2a6a'; g.fill(); g.restore(); g.beginPath(); g.arc(x, y, r * 0.1, 0, TAU); g.fillStyle = '#1a2a6a'; g.fill();
  }
  function plate(g, T, L, x, y, w, h) {
    g.save(); g.shadowColor = L.rim[0]; g.shadowBlur = 26; T.rr(g, x, y, w, h, 76); g.fillStyle = L.bg[1]; g.fill(); g.restore();
    g.save(); T.rr(g, x, y, w, h, 76); g.clip(); g.fillStyle = T.rad(g, x + w / 2, y + h * 0.48, 20, w * 0.75, [0, L.bg[0], 0.6, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h);
    for (var i = 0; i < 18; i++) { var an = i * TAU / 18; g.beginPath(); g.moveTo(x + w / 2, y + h / 2); g.arc(x + w / 2, y + h / 2, w, an, an + 0.09); g.closePath(); g.fillStyle = L.rays; g.fill(); }
    var r = T.rng(31); for (var q = 0; q < 40; q++) { g.globalAlpha = 0.4 + r() * 0.5; g.fillStyle = ['#fff', '#a8e0ff', '#ffe8a0'][q % 3]; g.beginPath(); g.arc(x + r() * w, y + r() * h, 1 + r() * 2.6, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore();
    T.rr(g, x, y, w, h, 76); g.lineWidth = 7; g.strokeStyle = T.lin(g, x, y, x + w, y + h, [0, L.rim[0], 0.5, L.rim[1], 1, L.rim[2]]); g.stroke();
  }
  function o(L, c, size) { return { clean: true /* gl-r20 clean B */, spacing: size * 0.01, dark: L.dark, outline: size * 0.2, depth: size * 0.09, fat: size * 0.006, ring: 'rgba(255,255,255,.95)', edge: function () { return GameLogos.tools.shade(c[2], -0.45); }, edgeW: size * 0.075, glow: 'rgba(255,220,120,.6)', glowBlur: 0.25, face: function () { return [0, c[0], 0.45, c[1], 1, c[2]]; } }; }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    var s1 = 112 * k, s2 = 178 * k, A = o(L, L.a, s1), U = o(L, L.u, s2), P = o(L, L.p, s2); U.glow = P.glow = 'rgba(120,255,200,.55)';
    if (oneLine) { s2 = s1 * 1.12; U = o(L, L.u, s2); P = o(L, L.p, s2); g.save(); g.font = '700 ' + s1 + 'px ' + T.FONT; var w1 = g.measureText('DOUBLE').width + 5 * s1 * 0.01; g.font = '700 ' + s2 + 'px ' + T.FONT; var wu = g.measureText('U').width, wp = g.measureText('P').width; g.restore();
      var gap = 26 * k, x0 = cx - (w1 + gap + wu + wp) / 2; T.word(g, 'DOUBLE', x0 + w1 / 2, y1, s1, A); T.gloss(g, 'DOUBLE', x0 + w1 / 2, y1, s1, A, 0.5); T.word(g, 'U', x0 + w1 + gap + wu / 2, y1, s2, U); T.word(g, 'P', x0 + w1 + gap + wu + wp / 2, y1, s2, P); return; }
    A.wave = function (j) { return [10, 4, 0, 0, 4, 10][j] * k; };
    g.save(); g.font = '700 ' + s2 + 'px ' + T.FONT; var wu2 = g.measureText('U').width, wp2 = g.measureText('P').width; g.restore(); var xu = cx - (wu2 + wp2) / 2;
    T.word(g, 'DOUBLE', cx, y1, s1, A); T.gloss(g, 'DOUBLE', cx, y1, s1, A, 0.5);
    // gl-r10 (Aowu: "the UP is under DOUBLE"): UP sits below DOUBLE, drawn in front of it
    T.word(g, 'P', xu + wu2 + wp2 / 2 - 4 * k, y2 - 8 * k, s2, P); T.gloss(g, 'P', xu + wu2 + wp2 / 2 - 4 * k, y2 - 8 * k, s2, P, 0.45);
    T.word(g, 'U', xu + wu2 / 2, y2, s2, U); T.gloss(g, 'U', xu + wu2 / 2, y2, s2, U, 0.45);
  }
  // the climbing row: [x, y, size, turn] for 8 … 512
  var SPOT = [[306, 196, 50, -0.1], [354, 186, 54, -0.08], [408, 172, 58, -0.06], [464, 152, 62, -0.05], [524, 130, 66, -0.03], [588, 106, 72, 0], [664, 92, 84, 0.06]];
  function emblem(g, T, L, full) {
    plate(g, T, L, 232, 16, 560, 538);
    arrow(g, T, [472, 252, 560, 190, 650, 140, 742, 82], 18, ['#c8ff7a', '#4ad83a', '#1a7a2a'], 32); arrow(g, T, [500, 240, 600, 200, 680, 186, 748, 158], 12, ['#b8ffe0', '#3ad8a8', '#1a7a6a'], 24); arrow(g, T, [470, 236, 520, 196, 580, 168, 636, 150], 12, ['#ffe08a', '#ff9a2e', '#b8500a'], 22);
    ROW.forEach(function (v, i) { var s = SPOT[i]; tile(g, T, L, v, s[0], s[1], s[2], s[3]); });
    if (full) { clock(g, T, 330, 112, 24); [[400, 118, 8], [726, 50, 9], [770, 230, 8], [268, 330, 7], [750, 470, 9]].forEach(function (s) { T.spark(g, s[0], s[1], s[2] * 1.7, '#fff6c0', 0.95); }); }
    tile(g, T, L, 2, 344, 398, 96, -0.12); gauge(g, T, 688, 404, 50);
    words(g, T, L, 514, 296, 476, 1);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') {
      g.fillStyle = T.rad(g, 512, 286, 40, 640, [0, L.bg[1], 1, L.bg[2]]); g.fillRect(0, 0, 1024, 572);
      g.save(); g.globalAlpha = 0.22; g.filter = 'blur(6px)'; tile(g, T, L, 2, 110, 420, 120, -0.1); tile(g, T, L, 4, 150, 150, 70, -0.1); tile(g, T, L, 512, 900, 70, 110, 0.05); tile(g, T, L, 8, 960, 300, 80, 0.1); tile(g, T, L, 2, 70, 140, 60, -0.1); g.restore();
      emblem(g, T, L, true); return;
    }
    if (kind === 'main') { g.translate(-222, -8); emblem(g, T, L, false); return; }
    if (kind === 'wide') { ROW.slice(0, 4).forEach(function (v, i) { tile(g, T, L, v, 36 + i * 46, 136 - i * 22, 40 + i * 4, -0.06); }); arrow(g, T, [30, 168, 90, 150, 150, 110, 196, 40], 9, ['#c8ff7a', '#4ad83a', '#1a7a2a'], 18); words(g, T, L, 540, 152, 0, 0.82, true); return; }
    if (kind === 'badge') {
      if (px >= 90) { g.translate(200, 200); g.scale(0.7, 0.7); g.translate(-512, -285); emblem(g, T, L, false); return; }
      g.translate(200, 200); g.scale(0.7, 0.7); g.translate(-512, -285); plate(g, T, L, 232, 16, 560, 538); arrow(g, T, [330, 420, 420, 300, 560, 200, 700, 110], 34, ['#c8ff7a', '#4ad83a', '#1a7a2a'], 56); tile(g, T, L, 2, 380, 380, 200, -0.12); tile(g, T, L, 512, 630, 210, 170, 0.06); return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO double-up END

// 🏷️ LOGO eyes-brain START — 👀🧠 Eyes Brain Riot, drawn in code from Aowu's picture (gl-10)
GameLogos.add('eyes-brain', (function () {
  var BOX = { scene: [1024, 572], main: [900, 566], wide: [900, 190], badge: [400, 400] };
  var LOOK = { classic: { sky: ['#3a1a9a', '#24107a', '#12084a'], plate: ['#2a1470', '#1a0c52'], rim: ['#5ff0ff', '#8a6af5', '#ff5ad8'],
    w1: ['#d8ffff', '#5ff0ff', '#1fc8e8', '#1a8ad8'], w2: ['#ffd8f6', '#ff7ae0', '#f03ac8', '#b81aa8'], w3: ['#fff59a', '#ffd23a', '#ff9a1c', '#f0600a'], dark: '#1a0a52' } };
  var TAU = Math.PI * 2;
  function rays(g, T, cx, cy) { g.save(); var r = T.rng(5); for (var i = 0; i < 60; i++) { var a = r() * TAU, d0 = 260 + r() * 120, d1 = d0 + 60 + r() * 260; g.beginPath(); g.moveTo(cx + Math.cos(a) * d0, cy + Math.sin(a) * d0 * 0.6); g.lineTo(cx + Math.cos(a) * d1, cy + Math.sin(a) * d1 * 0.6); g.lineWidth = 1 + r() * 3.5; g.strokeStyle = ['rgba(120,240,255,', 'rgba(255,120,230,', 'rgba(180,150,255,'][i % 3] + (0.25 + r() * 0.45) + ')'; g.lineCap = 'round'; g.stroke(); } g.restore(); }
  function bolt(g, T, x, y, s, rot, col) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.beginPath(); g.moveTo(8, -40); g.lineTo(-18, 4); g.lineTo(-2, 4); g.lineTo(-12, 40); g.lineTo(20, -8); g.lineTo(4, -8); g.closePath(); g.shadowColor = col; g.shadowBlur = 16; g.fillStyle = col; g.fill(); g.shadowBlur = 0; g.lineWidth = 3; g.strokeStyle = '#6a3a04'; g.lineJoin = 'round'; g.stroke(); g.restore(); }
  function burst(g, T, x, y, R, col) { g.save(); g.shadowColor = col; g.shadowBlur = R * 0.5; T.star(g, x, y, R, R * 0.5, 9, 0.3); g.fillStyle = col; g.fill(); T.star(g, x, y, R * 0.6, R * 0.3, 9, 0.6); g.fillStyle = '#fffbe0'; g.fill(); g.restore(); }
  function eyes(g, T, x, y, s, rot) {   // a pair of big cartoon eyes
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s);
    [-1, 1].forEach(function (k) { g.save(); g.shadowColor = 'rgba(160,220,255,.9)'; g.shadowBlur = 18; g.beginPath(); g.ellipse(k * 34, 0, 34, 42, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); g.beginPath(); g.ellipse(k * 34, 0, 34, 42, 0, 0, TAU); g.lineWidth = 6; g.strokeStyle = '#1a0a52'; g.stroke();
      g.beginPath(); g.ellipse(k * 34 + 8, 6, 19, 24, 0, 0, TAU); g.fillStyle = T.lin(g, 0, -18, 0, 30, [0, '#1a2a9a', 0.6, '#3f7af0', 1, '#6ad0ff']); g.fill(); g.beginPath(); g.ellipse(k * 34 + 10, 8, 10, 13, 0, 0, TAU); g.fillStyle = '#0a0830'; g.fill(); g.beginPath(); g.arc(k * 34 + 2, -6, 7, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(k * 34 + 16, 16, 3, 0, TAU); g.fill(); });
    g.restore();
  }
  function brain(g, T, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    function lobes() { g.beginPath(); [[-34, -16, 30], [0, -30, 32], [36, -14, 30], [-40, 18, 26], [-4, 14, 34], [38, 20, 28], [10, 36, 22]].forEach(function (c) { g.moveTo(c[0] + c[2], c[1]); g.arc(c[0], c[1], c[2], 0, TAU); }); }
    g.save(); g.shadowColor = '#ff8af0'; g.shadowBlur = 36; lobes(); g.fillStyle = '#f06ad8'; g.fill(); g.restore();
    lobes(); g.lineWidth = 8; g.strokeStyle = '#5a1a8a'; g.stroke(); lobes(); g.fillStyle = T.lin(g, -60, -60, 60, 60, [0, '#ffb0f0', 0.5, '#f06ad8', 1, '#9a5af0']); g.fill();
    g.strokeStyle = '#8a2aa8'; g.lineWidth = 5; g.beginPath(); g.moveTo(-2, -58); g.quadraticCurveTo(-12, -10, 4, 50); g.moveTo(-50, -4); g.quadraticCurveTo(-28, 4, -30, 26); g.moveTo(20, -36); g.quadraticCurveTo(40, -20, 30, 4); g.moveTo(-30, -36); g.quadraticCurveTo(-20, -22, -34, -10); g.moveTo(34, 18); g.quadraticCurveTo(50, 26, 44, 40); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-22, -36, 16, 8, -0.4, 0, TAU); g.fill(); g.fillStyle = 'rgba(120,60,220,.3)'; g.beginPath(); g.ellipse(20, 30, 46, 24, 0.2, 0, TAU); g.fill();
    [[-78, -40, 9], [70, -56, 10], [80, 30, 8], [-70, 44, 7]].forEach(function (q) { T.spark(g, q[0], q[1], q[2], '#fff6b0', 1); });
    g.restore();
  }
  function chip(g, T, x, y, txt, col, size) { g.save(); g.font = '700 ' + size + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.shadowColor = col; g.shadowBlur = 14; g.lineWidth = size * 0.2; g.strokeStyle = '#1a0a52'; g.strokeText(txt, x, y); g.fillStyle = col; g.fillText(txt, x, y); g.restore(); }
  function clock(g, T, x, y, R) { g.save(); g.shadowColor = '#ffd23e'; g.shadowBlur = 12; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = '#ffb02e'; g.fill(); g.shadowBlur = 0; g.lineWidth = R * 0.14; g.strokeStyle = '#6a3a04'; g.stroke(); g.beginPath(); g.arc(x, y, R * 0.72, 0, TAU); g.fillStyle = '#fffbe8'; g.fill(); g.lineWidth = R * 0.14; g.lineCap = 'round'; g.strokeStyle = '#3a1c0a'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - R * 0.5); g.moveTo(x, y); g.lineTo(x + R * 0.36, y + R * 0.1); g.stroke(); g.restore(); }
  function plate(g, T, L, x, y, w, h) {
    g.save(); g.shadowColor = L.rim[0]; g.shadowBlur = 40; T.rr(g, x, y, w, h, 70); g.fillStyle = T.lin(g, x, y, x + w, y + h, [0, L.plate[0], 1, L.plate[1]]); g.fill(); g.shadowColor = L.rim[2]; g.shadowBlur = 22; g.fill(); g.shadowBlur = 0;
    g.save(); T.rr(g, x, y, w, h, 70); g.clip(); burst(g, T, x + w * 0.78, y + h * 0.74, 70, '#ffb02e'); burst(g, T, x + w * 0.2, y + h * 0.5, 44, '#ff5ad8'); bolt(g, T, x + w * 0.82, y + h * 0.2, 1.3, 0.3, '#ffe14a'); bolt(g, T, x + w * 0.14, y + h * 0.78, 1.1, -0.3, '#ffe14a'); bolt(g, T, x + w * 0.5, y + h * 0.9, 0.8, 0.9, '#5ff0ff');
    var r = T.rng(8); for (var i = 0; i < 50; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillStyle = ['#5ff0ff', '#ff7ae0', '#ffe14a', '#fff'][i % 4]; g.beginPath(); g.arc(x + r() * w, y + r() * h, 1 + r() * 2.5, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore();
    var rim = T.lin(g, x, y, x + w, y + h, [0, L.rim[0], 0.5, L.rim[1], 1, L.rim[2]]); g.shadowColor = L.rim[0]; g.shadowBlur = 18; T.rr(g, x, y, w, h, 70); g.lineWidth = 9; g.strokeStyle = rim; g.stroke(); g.shadowBlur = 0; T.rr(g, x, y, w, h, 70); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.9)'; g.stroke(); g.restore();
  }
  function line(g, T, L, str, cx, base, size, c, glow, rot) {
    var o = { spacing: size * 0.02, rot: rot || 0, dark: L.dark, outline: size * 0.2, depth: size * 0.09, fat: size * 0.02, glow: glow, glowN: 3, glowBlur: 0.42, face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.75)' };
    T.word(g, str, cx, base, size, o); T.gloss(g, str, cx, base, size, o, 0.5);
  }
  function words(g, T, L, cx, y, k) { line(g, T, L, 'EYES', cx - 6 * k, y, 124 * k, L.w1, 'rgba(95,240,255,1)', -0.03); line(g, T, L, 'BRAIN', cx + 4 * k, y + 116 * k, 122 * k, L.w2, 'rgba(255,110,230,1)', -0.02); line(g, T, L, 'RIOT', cx, y + 236 * k, 132 * k, L.w3, 'rgba(255,200,60,1)', -0.01); }
  function emblem(g, T, L) {
    eyes(g, T, 150, 118, 0.8, -0.2); g.save(); g.lineCap = 'round'; [[214, 96, 262, 84], [216, 122, 270, 118], [208, 150, 256, 152]].forEach(function (q) { g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[2], q[3]); g.lineWidth = 4; g.strokeStyle = 'rgba(200,230,255,.7)'; g.stroke(); }); g.restore();
    plate(g, T, L, 286, 62, 458, 456);
    brain(g, T, 868, 136, 0.86);
    chip(g, T, 150, 262, '3', '#5ff0ff', 54); chip(g, T, 160, 420, 'A', '#ff7ae0', 50); chip(g, T, 196, 508, '3', '#ff7ae0', 60); chip(g, T, 822, 290, '7', '#5ff0ff', 60); chip(g, T, 880, 330, '3', '#5ff0ff', 40); chip(g, T, 836, 420, 'A', '#ff7ae0', 46); chip(g, T, 896, 500, 'Z', '#ffd23e', 60);
    clock(g, T, 140, 250 - 2, 0); clock(g, T, 132, 252, 0); clock(g, T, 136, 250, 0);
    clock(g, T, 118, 248, 16); clock(g, T, 902, 404, 18);
    T.star(g, 118, 344, 24, 12); g.fillStyle = '#ffd23e'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#8a4a04'; g.lineJoin = 'round'; g.stroke();
    [[880, 262, '#ff5a4a'], [690, 466, '#ff5a4a']].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], 15, 0, TAU); g.fillStyle = b[2]; g.fill(); g.lineWidth = 3; g.strokeStyle = '#6a0a0a'; g.stroke(); chip(g, T, b[0], b[1] + 1, '!', '#fff', 22); });
    eyes(g, T, 318, 92, 0.9, -0.08);
    words(g, T, L, 512, 196, 1);
    [[262, 60, 9], [770, 80, 10], [250, 300, 7], [784, 220, 8], [470, 40, 6]].forEach(function (s) { T.spark(g, s[0], s[1], s[2], '#fff', 0.95); });
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); rays(g, T, 512, 286); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-62, -3); emblem(g, T, L); return; }
    if (kind === 'wide') { eyes(g, T, 66, 94, 0.6, -0.08); var s = 82, o = function (c, gl) { return { spacing: s * 0.02, dark: L.dark, outline: s * 0.2, depth: s * 0.09, glow: gl, glowN: 2, glowBlur: 0.36, face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.75)' }; };
      g.font = '700 ' + s + 'px ' + T.FONT; var w1 = g.measureText('EYES').width + 3 * s * 0.02, w2 = g.measureText('BRAIN').width + 4 * s * 0.02, w3 = g.measureText('RIOT').width + 3 * s * 0.02, gap = 26, x0 = 134;
      [['EYES', w1, L.w1, 'rgba(95,240,255,1)'], ['BRAIN', w2, L.w2, 'rgba(255,110,230,1)'], ['RIOT', w3, L.w3, 'rgba(255,200,60,1)']].forEach(function (q) { var oo = o(q[2], q[3]); T.word(g, q[0], x0 + q[1] / 2, 124, s, oo); T.gloss(g, q[0], x0 + q[1] / 2, 124, s, oo, 0.5); x0 += q[1] + gap; }); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.76, 0.76); g.translate(-515, -290); plate(g, T, L, 286, 62, 458, 456); if (px >= 90) { eyes(g, T, 336, 118, 0.98, -0.08); words(g, T, L, 512, 196, 1); } else { eyes(g, T, 515, 250, 2.1, -0.06); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO eyes-brain END

// 🏷️ LOGO georead START — 🔤 GeoRead, drawn in code from Aowu's picture (gl-19, round 7). Same family as GeoScout: cream rounded icon, a globe with an open book
// growing leaves, a rainbow sound wave + headphones + music notes, a winding road (green → orange) with a compass, pines, a tree and a map pin;
// "Geo" blue → green + "Read" orange. Looks = the game's houses (GeoRead.html HOUSES: top / bottom / ground → backdrop, rim, path).
GameLogos.add('georead', (function () {
  var BOX = { scene: [1024, 572], main: [500, 470], wide: [860, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { plate: ['#fffaf0', '#fbefd8', '#f2dfbc'], rim: '#e8d2a8', path: '#e9d79a', grass: '#8cc858', dark: '#123060',
    g: [['#7ad8ff', '#2a9aff', '#1a5ae0'], ['#7af0d8', '#2ac8a8', '#12907a'], ['#a8f070', '#4ac83a', '#1a9a3a']],
    s: [['#ffc08a', '#ff8a2e', '#f05a12'], ['#ffb87a', '#ff7a2a', '#e8500e'], ['#ffa07a', '#ff6a3a', '#e0401a'], ['#ffd07a', '#ffa01a', '#f07a0a']] };
    for (var k in o) b[k] = o[k]; return b; }
  function th(t, extra) { var o = { plate: [t.bot, t.top, t.top], rim: t.sw, path: t.ground, grass: t.grass }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var LOOK = { classic: mk({}),
    dino: th({ top: '#2F7A3A', bot: '#9BD36A', ground: '#7A5230', grass: '#5E8F33', sw: '#9BD36A' }), sea: th({ top: '#063A6B', bot: '#2E9BD6', ground: '#E3C88F', grass: '#D2B070', sw: '#2E9BD6' }),
    disco: th({ top: '#22073F', bot: '#5B1A86', ground: '#2E0F4F', grass: '#3D1260', sw: '#9B2BD1' }), robot: th({ top: '#13283A', bot: '#3C5A73', ground: '#4C5966', grass: '#4A6075', sw: '#3C5A73' }),
    space: th({ top: '#050826', bot: '#272065', ground: '#3B357A', grass: '#80849C', sw: '#272065' }), sky: th({ top: '#5AB0EB', bot: '#D5EEFF', ground: '#FFFFFF', grass: '#EAF4FF', sw: '#5AB0EB' }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  function sprout(g, x, y, s) { g.save(); g.strokeStyle = '#3a8a2a'; g.lineWidth = 3 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 2 * s, y - 10 * s, x, y - 16 * s); g.stroke();
    g.fillStyle = '#5ac83a'; [[-1, -0.6], [1, 0.6]].forEach(function (k) { g.beginPath(); g.ellipse(x + k[0] * 9 * s, y - 16 * s, 10 * s, 5 * s, k[1], 0, TAU); g.fill(); }); g.restore(); }
  function leaf(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(0, -s * 0.7, s, 0); g.quadraticCurveTo(0, s * 0.7, -s, 0); g.fillStyle = '#4ab83a'; g.fill(); g.strokeStyle = '#2a7a2a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-s * 0.8, 0); g.lineTo(s * 0.8, 0); g.stroke(); g.restore(); }
  function globe(g, T, x, y, r) {
    g.save(); g.shadowColor = 'rgba(60,120,200,.4)'; g.shadowBlur = 16; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.35, y - r * 0.35, r * 0.1, r * 1.1, [0, '#9ae4ff', 0.55, '#3aa0e8', 1, '#1a5ab8']); g.fill(); g.restore();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.fillStyle = '#5ac84a';   // our own land shapes
    // continents = ragged outlines (our own shapes, seeded), each made of many small lumps
    var rr = T.rng(5); [[-0.45, -0.3, 0.36, 9], [-0.15, 0.35, 0.28, 8], [0.42, -0.2, 0.3, 8], [0.55, 0.45, 0.16, 5], [-0.8, 0.25, 0.12, 4]].forEach(function (c) { for (var i = 0; i < c[3] * 3; i++) { var a = rr() * TAU, d = rr() * c[2] * r * 0.8; g.beginPath(); g.ellipse(x + c[0] * r + Math.cos(a) * d, y + c[1] * r + Math.sin(a) * d * 0.8, c[2] * r * (0.25 + rr() * 0.3), c[2] * r * (0.18 + rr() * 0.22), rr() * 3, 0, TAU); g.fill(); } });
    g.fillStyle = 'rgba(30,110,40,.35)'; g.beginPath(); g.ellipse(x - 0.38 * r, y - 0.3 * r, 0.25 * r, 0.12 * r, 0.4, 0, TAU); g.fill();
    g.fillStyle = T.rad(g, x - r * 0.4, y - r * 0.45, 2, r, [0, 'rgba(255,255,255,.45)', 1, 'rgba(255,255,255,0)']); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.lineWidth = 3; g.strokeStyle = '#1a4a9a'; g.stroke();
  }
  function pin(g, T, x, y, s) { g.save(); g.beginPath(); g.moveTo(x, y + s * 1.2); g.bezierCurveTo(x - s * 1.1, y + s * 0.1, x - s * 0.9, y - s, x, y - s); g.bezierCurveTo(x + s * 0.9, y - s, x + s * 1.1, y + s * 0.1, x, y + s * 1.2); g.fillStyle = T.lin(g, 0, y - s, 0, y + s, [0, '#7ad84a', 1, '#2a9a2a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#1a6a1a'; g.stroke(); g.beginPath(); g.arc(x, y - s * 0.2, s * 0.38, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); }
  function compass(g, T, x, y, r) {
    g.beginPath(); g.arc(x, y - r * 1.1, r * 0.18, 0, TAU); g.lineWidth = 4; g.strokeStyle = '#c8901a'; g.stroke();
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.lin(g, 0, y - r, 0, y + r, [0, '#ffe08a', 1, '#c8901a']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#7a5a0a'; g.stroke();
    g.beginPath(); g.arc(x, y, r * 0.8, 0, TAU); g.fillStyle = '#fffaf0'; g.fill();
    g.save(); g.translate(x, y); g.rotate(0.6); g.beginPath(); g.moveTo(0, -r * 0.68); g.lineTo(r * 0.14, 0); g.lineTo(-r * 0.14, 0); g.closePath(); g.fillStyle = '#e8322a'; g.fill(); g.beginPath(); g.moveTo(0, r * 0.68); g.lineTo(r * 0.14, 0); g.lineTo(-r * 0.14, 0); g.closePath(); g.fillStyle = '#2a6ae8'; g.fill(); g.restore();
    g.font = '700 ' + r * 0.32 + 'px ' + T.FONT; g.fillStyle = '#5a4a2a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('N', x, y - r * 0.58); g.fillText('W', x - r * 0.58, y); g.fillText('E', x + r * 0.58, y);
  }
  function pack(g, T, x, y, s) { T.rr(g, x - s * 0.5, y - s * 0.6, s, s * 1.15, s * 0.3); g.fillStyle = T.lin(g, 0, y - s, 0, y + s, [0, '#c8945a', 1, '#8a5a2a']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#5a3a1a'; g.stroke();
    T.rr(g, x - s * 0.36, y - s * 0.05, s * 0.72, s * 0.42, s * 0.1); g.fillStyle = '#a8743a'; g.fill(); g.stroke(); g.beginPath(); g.arc(x, y - s * 0.6, s * 0.22, Math.PI, 0); g.stroke(); }
  function glass(g, x, y, r) { g.save(); g.lineCap = 'round'; g.lineWidth = r * 0.3; g.strokeStyle = '#8a5a2a'; g.beginPath(); g.moveTo(x + r * 0.7, y + r * 0.7); g.lineTo(x + r * 1.5, y + r * 1.5); g.stroke(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = 'rgba(200,235,255,.75)'; g.fill(); g.lineWidth = r * 0.22; g.strokeStyle = '#3a4a6a'; g.stroke(); g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.15, -0.6, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); }
  function pine(g, x, y, s) { g.fillStyle = '#7a4a1a'; g.fillRect(x - 2 * s, y, 4 * s, 8 * s); g.fillStyle = '#3a9a3a'; for (var i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x, y - 24 * s + i * 7 * s); g.lineTo(x + (9 + i * 3) * s, y - 8 * s + i * 7 * s); g.lineTo(x - (9 + i * 3) * s, y - 8 * s + i * 7 * s); g.closePath(); g.fill(); } }
  function num(g, T, str, x, y, sz, c, rot) { g.save(); g.translate(x, y); g.rotate(rot || 0); g.font = '700 ' + sz + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = sz * 0.18; g.strokeStyle = '#fffaf0'; g.strokeText(str, 0, 0); g.fillStyle = c; g.fillText(str, 0, 0); g.restore(); }
  function plate(g, T, L, x, y, w, h, flat) {
    g.save(); if (!flat) { g.shadowColor = 'rgba(120,90,40,.35)'; g.shadowBlur = 30; g.shadowOffsetY = 10; } T.rr(g, x, y, w, h, w * 0.17); g.fillStyle = T.lin(g, 0, y, 0, y + h, [0, L.plate[0], 0.5, L.plate[1], 1, L.plate[2]]); g.fill(); g.restore();
    T.rr(g, x, y, w, h, w * 0.17); g.lineWidth = 4; g.strokeStyle = L.rim; g.stroke();
  }
  function book(g, T, x, y, s, rot) {   // an open storybook with leaves growing out of it
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineJoin = 'round';
    g.fillStyle = '#8a5a2a'; g.beginPath(); g.moveTo(-92, 16); g.quadraticCurveTo(0, 34, 92, 16); g.lineTo(92, 26); g.quadraticCurveTo(0, 44, -92, 26); g.closePath(); g.fill();
    [-1, 1].forEach(function (k) { g.beginPath(); g.moveTo(0, 22); g.quadraticCurveTo(k * 40, 0, k * 88, 12); g.lineTo(k * 80, -48); g.quadraticCurveTo(k * 40, -62, 0, -40); g.closePath(); g.fillStyle = T.lin(g, k * 88, 0, 0, 0, [0, '#f2dcae', 1, '#fff6e2']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#a8763a'; g.stroke();
      g.strokeStyle = 'rgba(160,120,60,.45)'; g.lineWidth = 1.6; for (var i = 0; i < 4; i++) { g.beginPath(); g.moveTo(k * 14, -26 + i * 10); g.quadraticCurveTo(k * 44, -36 + i * 10, k * 72, -30 + i * 10); g.stroke(); } });
    g.restore();
    leaf(g, x - 14 * s, y - 70 * s, 16 * s, -1.1); leaf(g, x + 8 * s, y - 78 * s, 14 * s, -2.2); sprout(g, x - 4 * s, y - 44 * s, 1.1 * s);
    var r = T.rng(9); for (var q = 0; q < 6; q++) T.spark(g, x - 40 * s + r() * 80 * s, y - 90 * s + r() * 30 * s, 4 + r() * 4, '#ffd23a', 0.9);
  }
  function land(g, T, cx, cy, r) {   // bigger continents where they show (right side, lower left, top) — our own ragged shapes
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip(); var rr = T.rng(17);
    [[0.48, 0.05, 0.42, 30, '#5ac84a'], [-0.35, 0.45, 0.36, 24, '#6ad04a'], [0.05, -0.62, 0.26, 16, '#5ac84a'], [0.55, -0.5, 0.18, 10, '#7ad85a']].forEach(function (c) { g.fillStyle = c[4]; for (var i = 0; i < c[3]; i++) { var a = rr() * TAU, d = Math.sqrt(rr()) * c[2] * r * 0.85; g.beginPath(); g.ellipse(cx + c[0] * r + Math.cos(a) * d, cy + c[1] * r + Math.sin(a) * d * 0.85, c[2] * r * (0.2 + rr() * 0.25), c[2] * r * (0.15 + rr() * 0.2), rr() * 3, 0, TAU); g.fill(); } });
    g.fillStyle = 'rgba(30,110,40,.3)'; g.beginPath(); g.ellipse(cx + 0.55 * r, cy + 0.2 * r, 0.2 * r, 0.1 * r, 0.4, 0, TAU); g.fill(); g.restore();
  }
  function wave(g, x, y, w, h) {   // rainbow sound wave
    var cols = ['#ff4a8a', '#ff8a2e', '#ffd23a', '#4ac83a', '#2ab8e8', '#6a5af0', '#c04ae8'], n = 15;
    g.save(); g.lineCap = 'round'; g.lineWidth = w / n * 0.62; for (var i = 0; i < n; i++) { var t = i / (n - 1), a = Math.sin(t * Math.PI) * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7))) * h; g.strokeStyle = cols[Math.floor(t * (cols.length - 0.01))]; g.beginPath(); g.moveTo(x + t * w, y - a / 2); g.lineTo(x + t * w, y + a / 2); g.stroke(); } g.restore();
  }
  function phones(g, T, cx, cy, r) {   // headphones hugging the globe's right side
    g.save(); g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, r, -1.3, 0.12); g.lineWidth = 12; g.strokeStyle = '#1a6a7a'; g.stroke(); g.lineWidth = 7; g.strokeStyle = '#2ab8a8'; g.stroke();
    var ex = cx + Math.cos(0.18) * r, ey = cy + Math.sin(0.18) * r; T.rr(g, ex - 18, ey - 28, 36, 56, 16); g.fillStyle = T.lin(g, ex - 18, 0, ex + 18, 0, [0, '#3ad8c8', 1, '#1a7a8a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#124a5a'; g.stroke(); g.restore();
  }
  function note(g, T, x, y, s, c) { g.save(); g.fillStyle = c; g.strokeStyle = c; g.lineWidth = 3 * s; g.beginPath(); g.ellipse(x, y, 6 * s, 4.5 * s, -0.4, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x + 5 * s, y - 2 * s); g.lineTo(x + 5 * s, y - 22 * s); g.quadraticCurveTo(x + 12 * s, y - 18 * s, x + 14 * s, y - 10 * s); g.stroke(); g.restore(); }
  function tree(g, x, y, s) { g.fillStyle = '#7a4a1a'; g.fillRect(x - 3 * s, y - 10 * s, 6 * s, 14 * s); g.fillStyle = '#4ab83a'; g.beginPath(); g.arc(x, y - 22 * s, 14 * s, 0, TAU); g.fill(); g.fillStyle = '#6ad84a'; g.beginPath(); g.arc(x - 4 * s, y - 26 * s, 7 * s, 0, TAU); g.fill(); }
  function road(g, T, L) {   // the winding road under the word, green on the left turning orange on the right
    function path() { g.beginPath(); g.moveTo(330, 384); g.bezierCurveTo(330, 440, 420, 452, 470, 420); g.bezierCurveTo(520, 388, 560, 470, 620, 440); g.bezierCurveTo(660, 420, 690, 420, 700, 384); }
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; path(); g.lineWidth = 34; g.strokeStyle = 'rgba(40,60,30,.35)'; g.stroke(); path(); g.lineWidth = 28; g.strokeStyle = T.lin(g, 330, 0, 700, 0, [0, '#7ac84a', 0.5, '#c8c84a', 1, '#ffa03a']); g.stroke();
    path(); g.setLineDash([10, 10]); g.lineWidth = 3; g.strokeStyle = '#fffbe8'; g.stroke(); g.restore();
  }
  function scene(g, T, L) {
    leaf(g, 338, 198, 16, -0.4); leaf(g, 362, 176, 13, 0.6); leaf(g, 326, 380, 11, 0.3); leaf(g, 702, 376, 11, -0.4);
    globe(g, T, 528, 252, 128); land(g, T, 528, 252, 128); phones(g, T, 528, 252, 134);
    wave(g, 532, 222, 112, 64); note(g, T, 568, 104, 1.2, '#2a9a8a'); note(g, T, 696, 188, 1.1, '#ff8a2e'); note(g, T, 684, 240, 1, '#2a8af0');
    g.save(); g.strokeStyle = '#ff8a2e'; g.lineWidth = 3; g.lineCap = 'round'; [[680, 120, 690, 106], [690, 134, 704, 128]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); }); g.restore();
    book(g, T, 436, 236, 0.92, -0.22);
    sprout(g, 520, 132, 1.3);
    road(g, T, L); pine(g, 398, 408, 1.05); pine(g, 420, 412, 0.9); tree(g, 642, 392, 1.1); compass(g, T, 512, 430, 25); pin(g, T, 612, 400, 15);
    g.save(); g.fillStyle = '#ffc81a'; g.strokeStyle = '#c8901a'; g.lineWidth = 2; [[358, 380, 10], [452, 120, 11], [436, 376, 7], [466, 440, 8], [556, 440, 8], [668, 368, 7], [400, 128, 8]].forEach(function (q) { T.star(g, q[0], q[1], q[2], q[2] * 0.46); g.fill(); g.stroke(); }); g.restore();
    T.spark(g, 404, 146, 9, '#3ab8a8', 0.9); T.spark(g, 694, 160, 7, '#ffb84a', 0.9);
  }
  function words(g, T, L, cx, base, size) {
    function o(cols) { return { spacing: size * 0.005, dark: L.dark, outline: size * 0.11, depth: size * 0.06, fat: size * 0.006, ring: 'rgba(255,255,255,.95)', edge: function (j) { return sh(cols[j % cols.length][2], -0.45); }, edgeW: size * 0.045, face: function (j) { var c = cols[j % cols.length]; return [0, c[0], 0.45, c[1], 1, c[2]]; } }; }
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var w1 = g.measureText('Geo').width, w2 = g.measureText('Read').width; g.restore(); var x0 = cx - (w1 + w2) / 2;
    var A = o(L.g), B = o(L.s); A.wave = function (j) { return [0, 3, 0][j]; }; B.wave = function (j) { return [0, 2, 3, 0][j]; };
    T.word(g, 'Read', x0 + w1 + w2 / 2, base, size, B); T.gloss(g, 'Read', x0 + w1 + w2 / 2, base, size, B, 0.5);
    T.word(g, 'Geo', x0 + w1 / 2, base, size, A); T.gloss(g, 'Geo', x0 + w1 / 2, base, size, A, 0.5);
  }
  var PX = 282, PY = 68, PW = 460, PH = 434;
  function emblem(g, T, L) { plate(g, T, L, PX, PY, PW, PH); g.save(); T.rr(g, PX, PY, PW, PH, 78); g.clip(); scene(g, T, L); g.restore(); words(g, T, L, 508, 350, 98); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 40, 640, [0, '#fbf6ec', 1, '#efe6d4']); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-262, -48); emblem(g, T, L); return; }
    if (kind === 'wide') { g.save(); g.translate(12, 10); g.scale(0.41, 0.41); g.translate(-PX, -PY); plate(g, T, L, PX, PY, PW, PH, true); g.save(); T.rr(g, PX, PY, PW, PH, 78); g.clip(); scene(g, T, L); g.restore(); g.restore(); words(g, T, L, 530, 140, 106); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.82, 0.82); g.translate(-512, -285); if (px >= 90) { emblem(g, T, L); } else { plate(g, T, L, PX, PY, PW, PH); g.save(); T.rr(g, PX, PY, PW, PH, 78); g.clip(); scene(g, T, L); g.restore(); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO georead END

// 🏷️ LOGO geoscout START — 🔢 GeoScout, drawn in code from Aowu's picture (gl-18, round 6). Cream rounded icon, a globe with a map pin and leaves,
// stacks of OUR OWN counting blocks (smooth cubes, no studs — the picture's studded bricks look like a toy brand's) marked 10 · 100 · 1000 with sprouts,
// a smiling top block, floating 1 2 3 5 10, compass, backpack, magnifying glass, a winding path with pines; "Geo" green → blue + "Scout" orange → gold.
// Looks = the game's house themes (GeoScout.html THEMES: sky top / bottom + ground → the icon's backdrop, rim and path).
GameLogos.add('geoscout', (function () {
  var BOX = { scene: [1024, 572], main: [460, 470], wide: [860, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { plate: ['#fffaf0', '#fbefd8', '#f2dfbc'], rim: '#e8d2a8', path: '#e9d79a', grass: '#8cc858', dark: '#123060',
    g: [['#a8f070', '#4ac83a', '#1a9a3a'], ['#8ae8a8', '#2ac88a', '#12a07a'], ['#7ad8ff', '#2a9aff', '#1a5ae0']],
    s: [['#ffc08a', '#ff8a2e', '#f05a12'], ['#ffb87a', '#ff7a2a', '#e8500e'], ['#ffa07a', '#ff6a3a', '#e0401a'], ['#ffe07a', '#ffb81a', '#f08a0a'], ['#fff08a', '#ffd23a', '#f0a80a']] };
    for (var k in o) b[k] = o[k]; return b; }
  function th(t, extra) { var o = { plate: [t.bot, t.top, t.top], rim: t.sw, path: t.ground, grass: t.grass }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var LOOK = { classic: mk({}),
    dino: th({ top: '#2E5A2F', bot: '#7FB04A', ground: '#8B6A43', grass: '#5E8F33', sw: '#7FB04A' }), sea: th({ top: '#0A3D6B', bot: '#2A8FC2', ground: '#E2C58A', grass: '#D2B070', sw: '#2A8FC2' }),
    disco: th({ top: '#1B0533', bot: '#5A1A7E', ground: '#2A0B45', grass: '#3D1260', sw: '#9B2BD1' }), robot: th({ top: '#102534', bot: '#2D4E66', ground: '#3B4D60', grass: '#4A6075', sw: '#2D4E66' }),
    space: th({ top: '#05061F', bot: '#232070', ground: '#6B6F86', grass: '#80849C', sw: '#232070' }), sky: th({ top: '#4FA3E0', bot: '#CDEBFF', ground: '#FFFFFF', grass: '#EAF4FF', sw: '#4FA3E0' }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* our own counting block: a smooth bevelled cube in 2.5D (front + top + side), optional label on the front */
  function cube(g, T, x, y, w, h, c, label, face) {
    var d = w * 0.28;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + d, y - d * 0.7); g.lineTo(x + w + d, y - d * 0.7); g.lineTo(x + w, y); g.closePath(); g.fillStyle = sh(c, 0.35); g.fill();
    g.beginPath(); g.moveTo(x + w, y); g.lineTo(x + w + d, y - d * 0.7); g.lineTo(x + w + d, y + h - d * 0.7); g.lineTo(x + w, y + h); g.closePath(); g.fillStyle = sh(c, -0.3); g.fill();
    T.rr(g, x, y, w, h, w * 0.08); g.fillStyle = T.lin(g, 0, y, 0, y + h, [0, sh(c, 0.12), 1, sh(c, -0.12)]); g.fill();
    g.lineWidth = 2; g.strokeStyle = sh(c, -0.45); g.lineJoin = 'round'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.35)'; T.rr(g, x + w * 0.08, y + h * 0.1, w * 0.18, h * 0.5, w * 0.06); g.fill();
    if (label) { var fs = Math.min(h * 0.5, w * 1.6 / label.length); g.font = '700 ' + fs + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = sh(c, -0.55); g.fillText(label, x + w / 2, y + h * 0.54); }
    if (face) { g.fillStyle = '#123060'; g.beginPath(); g.arc(x + w * 0.36, y + h * 0.42, w * 0.06, 0, TAU); g.arc(x + w * 0.64, y + h * 0.42, w * 0.06, 0, TAU); g.fill(); g.beginPath(); g.arc(x + w * 0.5, y + h * 0.55, w * 0.14, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = 2.5; g.strokeStyle = '#123060'; g.stroke(); }
  }
  function sprout(g, x, y, s) { g.save(); g.strokeStyle = '#3a8a2a'; g.lineWidth = 3 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 2 * s, y - 10 * s, x, y - 16 * s); g.stroke();
    g.fillStyle = '#5ac83a'; [[-1, -0.6], [1, 0.6]].forEach(function (k) { g.beginPath(); g.ellipse(x + k[0] * 9 * s, y - 16 * s, 10 * s, 5 * s, k[1], 0, TAU); g.fill(); }); g.restore(); }
  function leaf(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(0, -s * 0.7, s, 0); g.quadraticCurveTo(0, s * 0.7, -s, 0); g.fillStyle = '#4ab83a'; g.fill(); g.strokeStyle = '#2a7a2a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-s * 0.8, 0); g.lineTo(s * 0.8, 0); g.stroke(); g.restore(); }
  function globe(g, T, x, y, r) {
    g.save(); g.shadowColor = 'rgba(60,120,200,.4)'; g.shadowBlur = 16; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.35, y - r * 0.35, r * 0.1, r * 1.1, [0, '#9ae4ff', 0.55, '#3aa0e8', 1, '#1a5ab8']); g.fill(); g.restore();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.fillStyle = '#5ac84a';   // our own land shapes
    // continents = ragged outlines (our own shapes, seeded), each made of many small lumps
    var rr = T.rng(5); [[-0.45, -0.3, 0.36, 9], [-0.15, 0.35, 0.28, 8], [0.42, -0.2, 0.3, 8], [0.55, 0.45, 0.16, 5], [-0.8, 0.25, 0.12, 4]].forEach(function (c) { for (var i = 0; i < c[3] * 3; i++) { var a = rr() * TAU, d = rr() * c[2] * r * 0.8; g.beginPath(); g.ellipse(x + c[0] * r + Math.cos(a) * d, y + c[1] * r + Math.sin(a) * d * 0.8, c[2] * r * (0.25 + rr() * 0.3), c[2] * r * (0.18 + rr() * 0.22), rr() * 3, 0, TAU); g.fill(); } });
    g.fillStyle = 'rgba(30,110,40,.35)'; g.beginPath(); g.ellipse(x - 0.38 * r, y - 0.3 * r, 0.25 * r, 0.12 * r, 0.4, 0, TAU); g.fill();
    g.fillStyle = T.rad(g, x - r * 0.4, y - r * 0.45, 2, r, [0, 'rgba(255,255,255,.45)', 1, 'rgba(255,255,255,0)']); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.lineWidth = 3; g.strokeStyle = '#1a4a9a'; g.stroke();
  }
  function pin(g, T, x, y, s) { g.save(); g.beginPath(); g.moveTo(x, y + s * 1.2); g.bezierCurveTo(x - s * 1.1, y + s * 0.1, x - s * 0.9, y - s, x, y - s); g.bezierCurveTo(x + s * 0.9, y - s, x + s * 1.1, y + s * 0.1, x, y + s * 1.2); g.fillStyle = T.lin(g, 0, y - s, 0, y + s, [0, '#7ad84a', 1, '#2a9a2a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#1a6a1a'; g.stroke(); g.beginPath(); g.arc(x, y - s * 0.2, s * 0.38, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); }
  function compass(g, T, x, y, r) {
    g.beginPath(); g.arc(x, y - r * 1.1, r * 0.18, 0, TAU); g.lineWidth = 4; g.strokeStyle = '#c8901a'; g.stroke();
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.lin(g, 0, y - r, 0, y + r, [0, '#ffe08a', 1, '#c8901a']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#7a5a0a'; g.stroke();
    g.beginPath(); g.arc(x, y, r * 0.8, 0, TAU); g.fillStyle = '#fffaf0'; g.fill();
    g.save(); g.translate(x, y); g.rotate(0.6); g.beginPath(); g.moveTo(0, -r * 0.68); g.lineTo(r * 0.14, 0); g.lineTo(-r * 0.14, 0); g.closePath(); g.fillStyle = '#e8322a'; g.fill(); g.beginPath(); g.moveTo(0, r * 0.68); g.lineTo(r * 0.14, 0); g.lineTo(-r * 0.14, 0); g.closePath(); g.fillStyle = '#2a6ae8'; g.fill(); g.restore();
    g.font = '700 ' + r * 0.32 + 'px ' + T.FONT; g.fillStyle = '#5a4a2a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('N', x, y - r * 0.58); g.fillText('W', x - r * 0.58, y); g.fillText('E', x + r * 0.58, y);
  }
  function pack(g, T, x, y, s) { T.rr(g, x - s * 0.5, y - s * 0.6, s, s * 1.15, s * 0.3); g.fillStyle = T.lin(g, 0, y - s, 0, y + s, [0, '#c8945a', 1, '#8a5a2a']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#5a3a1a'; g.stroke();
    T.rr(g, x - s * 0.36, y - s * 0.05, s * 0.72, s * 0.42, s * 0.1); g.fillStyle = '#a8743a'; g.fill(); g.stroke(); g.beginPath(); g.arc(x, y - s * 0.6, s * 0.22, Math.PI, 0); g.stroke(); }
  function glass(g, x, y, r) { g.save(); g.lineCap = 'round'; g.lineWidth = r * 0.3; g.strokeStyle = '#8a5a2a'; g.beginPath(); g.moveTo(x + r * 0.7, y + r * 0.7); g.lineTo(x + r * 1.5, y + r * 1.5); g.stroke(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = 'rgba(200,235,255,.75)'; g.fill(); g.lineWidth = r * 0.22; g.strokeStyle = '#3a4a6a'; g.stroke(); g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.15, -0.6, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); }
  function pine(g, x, y, s) { g.fillStyle = '#7a4a1a'; g.fillRect(x - 2 * s, y, 4 * s, 8 * s); g.fillStyle = '#3a9a3a'; for (var i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x, y - 24 * s + i * 7 * s); g.lineTo(x + (9 + i * 3) * s, y - 8 * s + i * 7 * s); g.lineTo(x - (9 + i * 3) * s, y - 8 * s + i * 7 * s); g.closePath(); g.fill(); } }
  function num(g, T, str, x, y, sz, c, rot) { g.save(); g.translate(x, y); g.rotate(rot || 0); g.font = '700 ' + sz + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = sz * 0.18; g.strokeStyle = '#fffaf0'; g.strokeText(str, 0, 0); g.fillStyle = c; g.fillText(str, 0, 0); g.restore(); }
  function plate(g, T, L, x, y, w, h, flat) {
    g.save(); if (!flat) { g.shadowColor = 'rgba(120,90,40,.35)'; g.shadowBlur = 30; g.shadowOffsetY = 10; } T.rr(g, x, y, w, h, w * 0.17); g.fillStyle = T.lin(g, 0, y, 0, y + h, [0, L.plate[0], 0.5, L.plate[1], 1, L.plate[2]]); g.fill(); g.restore();
    T.rr(g, x, y, w, h, w * 0.17); g.lineWidth = 4; g.strokeStyle = L.rim; g.stroke();
  }
  function scene(g, T, L) {
    // path + grass + pines (left, under the globe)
    g.fillStyle = L.grass; g.beginPath(); g.ellipse(372, 322, 62, 36, 0, 0, TAU); g.fill();
    g.save(); g.strokeStyle = L.path; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(330, 350); g.quadraticCurveTo(360, 320, 340, 300); g.quadraticCurveTo(320, 282, 352, 262); g.stroke(); g.restore();
    pine(g, 332, 284, 1); pine(g, 404, 330, 1.25); leaf(g, 352, 218, 18, -0.6); leaf(g, 338, 238, 14, 0.3);
    globe(g, T, 470, 252, 102); pin(g, T, 408, 150, 26);
    // the block stacks: [x, y top-left of front, w, h, colour, label, face]
    [[424, 330, 64, 40, '#e8322a', '10'], [460, 296, 64, 40, '#ffc81a', '100'], [462, 336, 64, 34, '#ffb01a'], [512, 270, 70, 40, '#ffb81a', '1000'], [512, 310, 70, 40, '#e8322a'],
     [552, 218, 50, 40, '#4ac83a'], [552, 258, 50, 40, '#3ab83a'], [530, 342, 44, 28, '#4ac83a'],
     [596, 178, 44, 38, '#2a8af0', null, true], [596, 216, 44, 38, '#2a7ae8'], [596, 254, 44, 38, '#2a8af0']].forEach(function (b) { cube(g, T, b[0], b[1], b[2], b[3], b[4], b[5], b[6]); });
    sprout(g, 488, 290, 1); sprout(g, 558, 212, 1); sprout(g, 618, 166, 1.1); sprout(g, 480, 254, 0.8);
    compass(g, T, 604, 342, 30); pack(g, T, 668, 318, 46); glass(g, 664, 232, 18);
    num(g, T, '1', 462, 102, 30, '#3ab83a', -0.1); num(g, T, '2', 492, 98, 30, '#2a8af0', 0); num(g, T, '3', 526, 102, 34, '#e8322a', 0.05); num(g, T, '5', 584, 100, 40, '#2a8af0', 0.1); num(g, T, '10', 666, 186, 34, '#ff8a2e', 0.1);
    g.save(); g.fillStyle = '#ffc81a'; g.strokeStyle = '#c8901a'; g.lineWidth = 2.5; T.star(g, 654, 124, 18, 8); g.fill(); g.stroke(); T.star(g, 618, 110, 10, 4.5); g.fill(); T.star(g, 556, 116, 9, 4); g.fill(); g.restore();
    T.spark(g, 680, 156, 8, '#3ab8a8', 0.9);
  }
  function words(g, T, L, cx, base, size) {
    function o(cols) { return { spacing: size * 0.005, dark: L.dark, outline: size * 0.2, depth: size * 0.08, fat: size * 0.006, ring: 'rgba(255,255,255,.95)', edge: function (j) { return sh(cols[j % cols.length][2], -0.45); }, edgeW: size * 0.075, face: function (j) { var c = cols[j % cols.length]; return [0, c[0], 0.45, c[1], 1, c[2]]; } }; }
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var w1 = g.measureText('Geo').width, w2 = g.measureText('Scout').width; g.restore(); var x0 = cx - (w1 + w2) / 2;
    var A = o(L.g), B = o(L.s); A.wave = function (j) { return [0, 3, 0][j]; }; B.wave = function (j) { return [0, 3, 2, 0, -2][j]; };
    T.word(g, 'Scout', x0 + w1 + w2 / 2, base, size, B); T.gloss(g, 'Scout', x0 + w1 + w2 / 2, base, size, B, 0.5);
    T.word(g, 'Geo', x0 + w1 / 2, base, size, A); T.gloss(g, 'Geo', x0 + w1 / 2, base, size, A, 0.5);
  }
  function emblem(g, T, L, small) { plate(g, T, L, 300, 68, 422, 430); g.save(); T.rr(g, 300, 68, 422, 430, 72); g.clip(); scene(g, T, L); g.restore(); words(g, T, L, 512, 440, 84); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 40, 640, [0, '#fbf6ec', 1, '#efe6d4']); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-282, -48); emblem(g, T, L); return; }
    if (kind === 'wide') { g.save(); g.translate(12, 9); g.scale(0.42, 0.42); g.translate(-300, -68); plate(g, T, L, 300, 68, 422, 430, true); g.save(); T.rr(g, 300, 68, 422, 430, 72); g.clip(); scene(g, T, L); g.restore(); g.restore(); words(g, T, L, 530, 140, 100); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.86, 0.86); g.translate(-511, -283); if (px >= 90) { emblem(g, T, L); } else { plate(g, T, L, 300, 68, 422, 430); g.save(); T.rr(g, 300, 68, 422, 430, 72); g.clip(); g.translate(512, 270); g.scale(1.25, 1.25); g.translate(-512, -250); scene(g, T, L); g.restore(); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO geoscout END

// 🏷️ LOGO hopper START — 🐸 Dodgy Hopper, drawn in code from Aowu's picture (gl-26, round 9). The green long-eared hopper in a leather pilot cap and
// goggles mid-leap (one-piece, depth from colour) over a cracked curving road; a flaming meteor, tumbling rocks, an orange car, coins, stars, arrows,
// a puddle; cheese-yellow "DODGY" (with cheese holes) over green "HOPPER"; a rainbow frame. Looks = Hopper.html THEMES (swamp · city · dino · zombie ·
// fantasy · sky): sky, grass and road colours.
GameLogos.add('hopper', (function () {
  var BOX = { scene: [1024, 572], main: [572, 552], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { sky: ['#bfe8ff', '#7ac8f0'], grass: ['#8ad85a', '#4a9a3a'], road: '#6a6e78', line: '#ffd23a' }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    swamp: mk({ sky: ['#c8e8b0', '#6aa86a'], grass: ['#6DA34D', '#2F5B37'], road: '#7A5A3A', line: '#c8a070' }), city: mk({ sky: ['#d8e4f0', '#8aa0c0'], grass: ['#C9CED6', '#8a94a4'], road: '#4A4F5A', line: '#F4F4F4' }),
    dino: mk({ sky: ['#ffd8a0', '#e8905a'], grass: ['#a8b84a', '#6a7a2a'], road: '#B8925A', line: '#fff0c0' }), zombie: mk({ sky: ['#8a6aa8', '#3a2a5a'], grass: ['#6a8a4a', '#2a3a2a'], road: '#3D3A45', line: '#b6ff5c' }),
    fantasy: mk({ sky: ['#ffd0f0', '#a88ae8'], grass: ['#9ae8b0', '#4aa88a'], road: '#C9B5F0', line: '#ffffff' }), sky: mk({ sky: ['#e8f6ff', '#4C8FD6'], grass: ['#ffffff', '#c8e0f8'], road: '#A9D8FF', line: '#ffd23a' }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#1a1408', PX = 240, PY = 22, PW = 548, PH = 528;
  /* ---------- the world inside the frame ---------- */
  function world(g, T, L, full) {
    g.fillStyle = T.lin(g, 0, PY, 0, PY + 300, [0, L.sky[1], 1, L.sky[0]]); g.fillRect(PX, PY, PW, PH);
    g.save(); g.globalAlpha = 0.35; g.fillStyle = '#fff'; for (var i = 0; i < 14; i++) { g.beginPath(); g.moveTo(560, 120); g.arc(560, 120, 600, i * TAU / 14, i * TAU / 14 + 0.12); g.closePath(); g.fill(); } g.restore();
    g.fillStyle = 'rgba(255,255,255,.85)'; [[300, 150, 40], [340, 140, 30], [700, 170, 34], [740, 160, 26]].forEach(function (c) { g.beginPath(); g.arc(c[0], c[1], c[2], 0, TAU); g.fill(); });
    g.fillStyle = T.lin(g, 0, 200, 0, 550, [0, L.grass[0], 1, L.grass[1]]); g.beginPath(); g.moveTo(PX, 250); g.quadraticCurveTo(420, 210, 560, 250); g.quadraticCurveTo(700, 290, PX + PW, 240); g.lineTo(PX + PW, PY + PH); g.lineTo(PX, PY + PH); g.closePath(); g.fill();
    // the road: a band between two curves
    function bez(p, t) { var u = 1 - t; return [u * u * p[0] + 2 * u * t * p[2] + t * t * p[4], u * u * p[1] + 2 * u * t * p[3] + t * t * p[5]]; }
    var A = [PX, 270, 330, 236, 360, 330], A2 = [360, 330, 380, 470, 460, 560], B = [PX, 318, 290, 300, 300, 380], B2 = [300, 380, 310, 480, 360, 560];
    g.beginPath(); var k; for (k = 0; k <= 20; k++) { var a = bez(A, k / 20); g[k ? 'lineTo' : 'moveTo'](a[0], a[1]); } for (k = 0; k <= 20; k++) { a = bez(A2, k / 20); g.lineTo(a[0], a[1]); }
    g.lineTo(780, 560); g.lineTo(780, 470); g.quadraticCurveTo(560, 470, 480, 520); g.lineTo(560, 560); g.lineTo(360, 560); for (k = 20; k >= 0; k--) { a = bez(B2, k / 20); g.lineTo(a[0], a[1]); } for (k = 20; k >= 0; k--) { a = bez(B, k / 20); g.lineTo(a[0], a[1]); } g.closePath();
    g.fillStyle = L.road; g.fill(); g.lineWidth = 5; g.strokeStyle = sh(L.road, 0.4); g.stroke();
    g.save(); g.setLineDash([16, 14]); g.lineWidth = 5; g.strokeStyle = L.line; g.beginPath(); g.moveTo(PX, 296); g.quadraticCurveTo(310, 270, 330, 350); g.quadraticCurveTo(342, 470, 410, 560); g.stroke(); g.setLineDash([]); g.restore();
    g.strokeStyle = 'rgba(20,10,0,.75)'; g.lineWidth = 3; [[310, 300, 1], [470, 530, 1.4], [600, 500, 1]].forEach(function (c) { g.save(); g.translate(c[0], c[1]); g.scale(c[2], c[2]); g.beginPath(); g.moveTo(-18, -4); g.lineTo(-6, 2); g.lineTo(0, -6); g.lineTo(8, 4); g.lineTo(20, -2); g.moveTo(0, -6); g.lineTo(2, -16); g.stroke(); g.restore(); });
    g.fillStyle = T.lin(g, 0, 470, 0, 510, [0, '#8ad8ff', 1, '#2a8ae0']); g.beginPath(); g.ellipse(702, 492, 62, 16, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.ellipse(690, 488, 30, 5, 0, 0, TAU); g.stroke();
    g.fillStyle = '#3a8a2a'; [[262, 470, 26], [290, 500, 30], [768, 420, 24], [760, 460, 20]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fill(); });
  }
  function meteor(g, T, x, y) { g.save(); g.fillStyle = T.lin(g, x - 80, y - 60, x, y, [0, 'rgba(255,90,20,0)', 0.5, 'rgba(255,110,30,.85)', 1, 'rgba(255,220,90,1)']);
    g.beginPath(); g.moveTo(x - 90, y - 70); g.lineTo(x + 16, y - 16); g.lineTo(x - 14, y + 18); g.closePath(); g.fill(); g.restore();
    g.beginPath(); g.arc(x, y, 24, 0, TAU); g.fillStyle = T.rad(g, x - 6, y - 6, 2, 26, [0, '#b8804a', 1, '#5a3418']); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    g.fillStyle = '#4a2a10'; [[-8, -4, 5], [6, 6, 6], [8, -10, 4]].forEach(function (c) { g.beginPath(); g.arc(x + c[0], y + c[1], c[2], 0, TAU); g.fill(); }); }
  function rock(g, T, x, y, r) { g.beginPath(); for (var i = 0; i < 7; i++) { var a = i * TAU / 7, q = r * (0.8 + (i % 3) * 0.12); g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fillStyle = T.lin(g, x - r, y - r, x + r, y + r, [0, '#c8c4bc', 1, '#6a665e']); g.fill(); g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke(); }
  function coin(g, T, x, y, r) { g.beginPath(); g.ellipse(x, y, r * 0.86, r, 0, 0, TAU); g.fillStyle = T.lin(g, x - r, y - r, x + r, y + r, [0, '#fff2a0', 0.5, '#ffc21a', 1, '#c8800a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#8a5a04'; g.stroke(); g.font = '700 ' + (r * 1.1) + 'px ' + T.FONT; g.textAlign = 'center'; g.fillStyle = '#a86a04'; g.fillText('$', x, y + r * 0.38); }
  function arrow(g, T, pts, col, w) { g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); g.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); g.lineWidth = w + 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke();
    var a = Math.atan2(pts[5] - pts[3], pts[4] - pts[2]); g.translate(pts[4], pts[5]); g.rotate(a); g.beginPath(); g.moveTo(20, 0); g.lineTo(-8, -16); g.lineTo(-8, 16); g.closePath(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.fillStyle = col; g.fill(); g.restore(); }
  function car(g, T) {
    var P = { body: function (h) { h.beginPath(); h.moveTo(266, 412); h.lineTo(268, 380); h.quadraticCurveTo(272, 368, 290, 366); h.lineTo(300, 340); h.quadraticCurveTo(306, 330, 320, 330); h.lineTo(346, 330); h.quadraticCurveTo(358, 332, 364, 346); h.lineTo(372, 366); h.quadraticCurveTo(388, 370, 388, 386); h.lineTo(386, 412); h.closePath(); h.fill(); },
      wheels: function (h) { h.beginPath(); h.arc(296, 414, 17, 0, TAU); h.arc(362, 414, 17, 0, TAU); h.fill(); } };
    T.onePiece(g, T, { x0: 250, y0: 316, W: 156, H: 124, rim: INK, rimW: 4, parts: P, order: ['body', 'wheels'],
      colour: function (B, put, inside) { put(B, 'body', T.lg(B, 0, 330, 0, 412, [0, '#ffb05a', 0.5, '#f0701a', 1, '#b8480a']));
        inside(B, 'body', function (h) { h.fillStyle = T.lg(h, 0, 336, 0, 366, [0, '#d8f4ff', 1, '#5aa8e0']); h.beginPath(); h.moveTo(304, 364); h.lineTo(312, 340); h.lineTo(330, 340); h.lineTo(330, 364); h.closePath(); h.moveTo(338, 340); h.lineTo(352, 340); h.lineTo(362, 364); h.lineTo(338, 364); h.closePath(); h.fill();
          h.fillStyle = '#fff6c0'; h.beginPath(); h.ellipse(380, 384, 6, 5, 0, 0, TAU); h.fill(); h.fillStyle = 'rgba(80,20,0,.3)'; h.fillRect(260, 396, 140, 20); h.fillStyle = '#d8d8e0'; h.fillRect(262, 398, 128, 5); });
        put(B, 'wheels', '#1a1c24'); inside(B, 'wheels', function (h) { h.fillStyle = '#c8ccd8'; h.beginPath(); h.arc(296, 414, 7, 0, TAU); h.arc(362, 414, 7, 0, TAU); h.fill(); }); } });
  }
  /* ---------- the hopper ---------- */
  function hopper(g, T) {
    var GR = ['#c8f08a', '#7ad84a', '#3a9a2a', '#226a1a'], CAP = ['#c8905a', '#8a5a2a', '#5a3414'];
    var tf = { };
    var P = {
      earB: function (h) { T.taper(h, [512, 104, 466, 70, 420, 96], function (t) { return 26 - t * 8 + Math.sin(t * Math.PI) * 6; }); },
      legB: function (h) { T.limb(h, [524, 268, 498, 288, 474, 300], 28, 20); h.beginPath(); h.ellipse(454, 304, 24, 11, -0.15, 0, TAU); h.fill(); },
      armB: function (h) { T.limb(h, [514, 214, 488, 238, 462, 236], 22, 17); h.beginPath(); h.arc(455, 234, 12, 0, TAU); h.fill(); },
      body: function (h) { h.save(); T.around(h, 544, 240, -0.55); h.beginPath(); h.ellipse(544, 236, 32, 46, 0, 0, TAU); h.fill(); h.restore(); },
      legF: function (h) { T.limb(h, [560, 268, 596, 260, 602, 286], 28, 20); h.beginPath(); h.ellipse(616, 294, 24, 11, 0.2, 0, TAU); h.fill(); },
      armF: function (h) { T.limb(h, [570, 212, 608, 222, 636, 206], 22, 18); h.beginPath(); h.arc(646, 202, 15, 0, TAU); h.fill(); },
      earF: function (h) { T.taper(h, [524, 98, 500, 44, 474, 30], function (t) { return 30 - t * 10 + Math.sin(t * Math.PI) * 6; }); },
      head: function (h) { h.beginPath(); h.ellipse(548, 142, 52, 50, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(572, 168, 38, 28, 0.1, 0, TAU); h.fill(); },
      cap: function (h) { h.beginPath(); h.moveTo(494, 134); h.bezierCurveTo(492, 74, 600, 66, 604, 126); h.quadraticCurveTo(550, 112, 494, 134); h.closePath(); h.fill(); h.beginPath(); h.ellipse(500, 150, 12, 22, 0.1, 0, TAU); h.fill(); }
    };
    T.onePiece(g, T, { x0: 400, y0: 16, W: 270, H: 310, rim: INK, rimW: 4.2, parts: P, tf: tf, order: ['earB', 'legB', 'armB', 'body', 'legF', 'armF', 'earF', 'head', 'cap'],
      colour: function (B, put, inside) {
        put(B, 'earB', GR[2]); inside(B, 'earB', function (h) { h.fillStyle = '#e8a0a8'; T.taper(h, [508, 104, 466, 76, 430, 96], function (t) { return 10 - t * 4; }); });
        put(B, 'legB', T.lg(B, 520, 270, 440, 300, [0, GR[2], 1, GR[3]]));
        put(B, 'armB', GR[2]);
        put(B, 'body', T.rg(B, 556, 228, 4, 60, [0, GR[0], 0.5, GR[1], 1, GR[2]])); inside(B, 'body', function (h) { h.save(); T.around(h, 552, 248, -0.55); h.fillStyle = 'rgba(240,255,200,.6)'; h.beginPath(); h.ellipse(556, 250, 18, 32, 0, 0, TAU); h.fill(); h.restore(); });
        put(B, 'legF', T.lg(B, 560, 260, 620, 300, [0, GR[1], 1, GR[2]]));
        put(B, 'armF', T.lg(B, 570, 0, 650, 0, [0, GR[1], 1, GR[0]])); inside(B, 'armF', function (h) { h.strokeStyle = GR[3]; h.lineWidth = 2; h.beginPath(); h.moveTo(640, 196); h.lineTo(652, 198); h.moveTo(640, 204); h.lineTo(654, 206); h.stroke(); });
        put(B, 'earF', T.lg(B, 474, 30, 524, 100, [0, GR[1], 1, GR[2]])); inside(B, 'earF', function (h) { h.fillStyle = '#f0a8b0'; T.taper(h, [522, 96, 502, 52, 482, 38], function (t) { return 12 - t * 5; }); });
        put(B, 'head', T.rg(B, 560, 130, 6, 70, [0, GR[0], 0.55, GR[1], 1, GR[2]])); inside(B, 'head', function (h) { h.fillStyle = 'rgba(240,255,200,.55)'; h.beginPath(); h.ellipse(580, 172, 28, 18, 0.1, 0, TAU); h.fill(); });
        put(B, 'cap', T.lg(B, 0, 70, 0, 170, [0, CAP[0], 0.5, CAP[1], 1, CAP[2]])); inside(B, 'cap', function (h) { h.strokeStyle = 'rgba(60,30,10,.6)'; h.lineWidth = 2.5; h.beginPath(); h.moveTo(548, 74); h.quadraticCurveTo(552, 100, 550, 118); h.stroke(); h.fillStyle = 'rgba(255,230,190,.35)'; h.beginPath(); h.ellipse(530, 90, 16, 8, -0.5, 0, TAU); h.fill(); });
      } });
    // goggles on the cap
    g.save(); g.lineWidth = 4; g.strokeStyle = INK; T.rr(g, 512, 94, 96, 12, 6); g.fillStyle = '#5a3414'; g.fill(); g.stroke();
    [[540, 96], [580, 94]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 16, 0, TAU); g.fillStyle = '#b8c0cc'; g.fill(); g.stroke(); g.beginPath(); g.arc(e[0], e[1], 11, 0, TAU); g.fillStyle = T.lin(g, e[0] - 10, e[1] - 10, e[0] + 10, e[1] + 10, [0, '#d8f4ff', 1, '#3a8ad8']); g.fill(); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(e[0] - 4, e[1] - 4, 4, 2.5, -0.6, 0, TAU); g.fill(); }); g.restore();
    // face
    [[536, 140, 14, 17], [568, 138, 15, 18]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 3, e[1] + 2, 8, 0, TAU); g.fillStyle = '#5a3010'; g.fill(); g.beginPath(); g.arc(e[0] + 3, e[1] + 2, 4, 0, TAU); g.fillStyle = '#100800'; g.fill(); g.beginPath(); g.arc(e[0], e[1] - 2, 3, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.beginPath(); g.ellipse(592, 156, 7, 5, 0, 0, TAU); g.fillStyle = '#ff7a9a'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
    function mouth() { g.beginPath(); g.moveTo(538, 168); g.quadraticCurveTo(572, 178, 606, 164); g.quadraticCurveTo(600, 204, 570, 206); g.quadraticCurveTo(542, 204, 538, 168); g.closePath(); }
    mouth(); g.fillStyle = '#6a0a14'; g.fill(); g.save(); mouth(); g.clip(); g.fillStyle = '#ff6a7a'; g.beginPath(); g.ellipse(572, 206, 20, 12, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; T.rr(g, 562, 166, 12, 14, 3); g.fill(); T.rr(g, 576, 166, 12, 13, 3); g.fill(); g.restore(); mouth(); g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
  }
  function cheese(g, T, str, cx, base, size, o) {   // cheese holes kept inside the letter faces
    var c = document.createElement('canvas'); c.width = g.canvas.width; c.height = g.canvas.height; var m = c.getContext('2d'); m.setTransform(g.getTransform());
    T.word(m, str, cx, base, size, { spacing: o.spacing, wave: o.wave, rot: o.rot, dark: 'rgba(0,0,0,0)', outline: 0.01, depth: 0, face: function () { return [0, '#fff', 1, '#fff']; } });
    var d = document.createElement('canvas'); d.width = c.width; d.height = c.height; var h = d.getContext('2d'); h.setTransform(g.getTransform()); var r = T.rng(31);
    for (var i = 0; i < str.length * 5; i++) { var x = cx - size * 1.8 + r() * size * 3.6, y = base - size * 0.65 + r() * size * 0.6, rr = size * (0.035 + r() * 0.05); h.beginPath(); h.ellipse(x, y, rr, rr * 0.8, 0, 0, TAU); h.fillStyle = 'rgba(200,120,0,.55)'; h.fill(); h.beginPath(); h.ellipse(x - rr * 0.25, y - rr * 0.25, rr * 0.6, rr * 0.45, 0, 0, TAU); h.fillStyle = 'rgba(255,250,200,.6)'; h.fill(); }
    h.setTransform(1, 0, 0, 1, 0, 0); h.globalCompositeOperation = 'destination-in'; h.drawImage(c, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(d, 0, 0); g.restore();
  }
  function words(g, T, cx, y1, s1, y2, s2) {
    var A = { spacing: s1 * 0.01, dark: '#4a2004', outline: s1 * 0.15, depth: s1 * 0.09, fat: s1 * 0.006, ring: '#fff6d0', rot: -0.03, edge: function () { return '#b8700a'; }, edgeW: s1 * 0.06, wave: function (j) { return [4, 0, -2, 0, 4][j] * s1 / 110; },
      face: function () { return [0, '#fff6a0', 0.5, '#ffd21a', 1, '#f0960a']; } };
    var B = { spacing: s2 * 0.01, dark: '#0a2a04', outline: s2 * 0.15, depth: s2 * 0.09, fat: s2 * 0.006, ring: '#f0ffd0', rot: -0.02, edge: function () { return '#1a6a10'; }, edgeW: s2 * 0.06, wave: function (j) { return [0, 2, 4, 4, 2, 0][j] * s2 / 110; },
      face: function (j) { return j < 2 ? [0, '#fff6a0', 0.5, '#ffd21a', 1, '#f0960a'] : [0, '#d8ff8a', 0.5, '#6ad83a', 1, '#2a9a1a']; } };
    T.word(g, 'HOPPER', cx + 10, y2, s2, B); T.gloss(g, 'HOPPER', cx + 10, y2, s2, B, 0.45);
    T.word(g, 'DODGY', cx - 4, y1, s1, A); cheese(g, T, 'DODGY', cx - 4, y1, s1, A); T.gloss(g, 'DODGY', cx - 4, y1, s1, A, 0.45);
  }
  function frame(g, T, glow) { T.rr(g, PX, PY, PW, PH, 76); g.lineWidth = 16; g.strokeStyle = T.lin(g, PX, PY, PX + PW, PY + PH, [0, '#ffe04a', 0.35, '#a8e83a', 0.65, '#3ad88a', 1, '#3ab8ff']); if (glow) { g.save(); g.shadowColor = 'rgba(120,255,160,.7)'; g.shadowBlur = 24; g.stroke(); g.restore(); } g.stroke();
    T.rr(g, PX - 8, PY - 8, PW + 16, PH + 16, 84); g.lineWidth = 3; g.strokeStyle = 'rgba(40,60,20,.7)'; g.stroke(); T.rr(g, PX + 8, PY + 8, PW - 16, PH - 16, 68); g.strokeStyle = 'rgba(255,255,255,.6)'; g.stroke(); }
  function icon(g, T, L, full, chars) {
    g.save(); T.rr(g, PX, PY, PW, PH, 76); g.clip(); world(g, T, L, full); meteor(g, T, 356, 122); rock(g, T, 306, 206, 24); rock(g, T, 342, 234, 12); rock(g, T, 330, 272, 18);
    arrow(g, T, [372, 214, 400, 190, 428, 170], '#ffb03a', 10); arrow(g, T, [400, 230, 430, 200, 452, 166], '#ffd23a', 10); arrow(g, T, [600, 290, 700, 260, 742, 172], '#3ac85a', 14);
    [[686, 74, 26], [636, 76, 17], [690, 160, 13]].forEach(function (s) { g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], s[2], s[2] * 0.48); g.fill(); g.lineWidth = 3; g.strokeStyle = '#a86a04'; g.stroke(); });
    [[742, 246], [730, 296], [700, 342], [398, 270], [376, 296]].forEach(function (c) { coin(g, T, c[0], c[1], 15); });
    g.save(); g.translate(-12, 18); car(g, T); g.restore(); if (chars !== false) hopper(g, T);
    var r = T.rng(26); for (var i = 0; i < (full ? 14 : 6); i++) T.spark(g, PX + 20 + r() * (PW - 40), PY + 20 + r() * (PH - 40), 4 + r() * 6, '#fff', 0.85);
    g.restore(); frame(g, T, full);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, '#5a9a4a', 0.5, '#3a7a3a', 1, '#2a5a2a']); g.fillRect(0, 0, 1024, 572); icon(g, T, L, true); words(g, T, 556, 392, 100, 478, 100); return; }
    if (kind === 'main') { g.translate(-226, -10); icon(g, T, L, px >= 220); words(g, T, 556, 392, 100, 478, 100); return; }
    if (kind === 'wide') { g.save(); g.translate(14, 6); g.scale(0.356, 0.356); g.translate(-PX, -PY); icon(g, T, L, false); g.restore(); words(g, T, 520, 92, 80, 182, 80); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.7, 0.7); g.translate(-514, -286); icon(g, T, L, false); if (px >= 90) words(g, T, 556, 392, 100, 478, 100); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO hopper END

// 🏷️ LOGO lettercraft START — 🔤 Lettercraft, moved word for word from WordBoard.html LcLogo (lc-logo, approved in its game) by move_st2c.py (gl-r22, 📡 st-2c)
// glue only: no LOOK.paper (the kit maps unknown looks → classic), shadows left to the kit, the letter canvas sized from the real scale
GameLogos.add('lettercraft', (function () {
var LC = (() => {
  // letter materials: [light, mid, dark] + grain (wood lines) — one per letter of "Lettercraft"
  const MAT = {
    wood:   ['#FFD08A', '#E0892E', '#8E4A14', 'wood'],
    wood2:  ['#F7C27A', '#C9772A', '#7A3E10', 'wood'],
    green:  ['#C8FF9A', '#46C23A', '#1C6E1E'],
    steel:  ['#E6F6FF', '#7FB2C6', '#2E5568', 'steel'],
    red:    ['#FFB0A0', '#EE3B2E', '#8E1610'],
    orange: ['#FFD89A', '#FF8E1E', '#B24A06'],
    gold:   ['#FFF6B0', '#FFC93A', '#B47A06'],
    lime:   ['#EEFFA8', '#98D628', '#4A7E0C'],
    blue:   ['#BDEBFF', '#2E8EFF', '#123C9E'],
    teal:   ['#C2FFF4', '#21C2B0', '#0A6B66'],
    coral:  ['#FFD2C2', '#FF7A59', '#A8361C'],
    pink:   ['#FFD6EC', '#FF5FAE', '#A11864'],
    purple: ['#E6D6FF', '#9A5BFF', '#4A1E9E'],
    sky:    ['#E2F6FF', '#5BC8FF', '#1A6EA8'],
    mint:   ['#DFFFF0', '#4FDDA0', '#167A50'],
    sun:    ['#FFF4C0', '#FFB21E', '#A86406'],
    lilac:  ['#F2E8FF', '#C29BFF', '#6A3EB4'],
    stone:  ['#F2EEE6', '#B7AC98', '#5E5446'],
    neon:   ['#E6FFFF', '#3CF2FF', '#1A6AD8'],
    magenta:['#FFE0FA', '#FF3CD2', '#8E0E7A']
  };
  // one LOOK per board: 11 letter materials · frame plank colours · glow left / right · inside of the hex · tile colours · sparkle colours
  const LOOK = {
    classic: {mats: ['wood', 'wood2', 'wood', 'wood2', 'green', 'steel', 'red', 'orange', 'gold', 'lime', 'blue'],
              frame: ['#F2B266', '#B8662A', '#6E3A12'], glowL: '#FF9A2A', glowR: '#3CC8FF', back: ['#1E3466', '#0A1430'], grid: 'rgba(120,170,255,.22)',
              tile: ['#FFF4D8', '#E8C98E'], tink: '#3A2410', spark: ['#FFD54A', '#7CF2FF', '#FF6AD5', '#9BFF6A'], ink: '#2A1206', rim: '#FFE7A8'},
    garden:  {mats: ['lime', 'green', 'sun', 'mint', 'green', 'wood', 'coral', 'sun', 'gold', 'lime', 'sky'],
              frame: ['#CDE58A', '#6E9A2A', '#3A5410'], glowL: '#FFD23F', glowR: '#7CFF7A', back: ['#24502A', '#0C2410'], grid: 'rgba(170,255,140,.2)',
              tile: ['#FFFBEA', '#E6D9A0'], tink: '#2E4A1A', spark: ['#FFE14A', '#9BFF6A', '#FF8AC0', '#FFFFFF'], ink: '#1E2E0A', rim: '#F4FFC8'},
    ocean:   {mats: ['sky', 'teal', 'blue', 'sky', 'mint', 'steel', 'coral', 'teal', 'sun', 'sky', 'blue'],
              frame: ['#B8E6F2', '#4A90A8', '#1E4E66'], glowL: '#3CE0FF', glowR: '#7AFFE0', back: ['#0E4A78', '#03182E'], grid: 'rgba(140,220,255,.22)',
              tile: ['#FFFFFF', '#CFEAF5'], tink: '#0B3A5C', spark: ['#9FF2FF', '#FFFFFF', '#FF9A7A', '#7AFFE0'], ink: '#062236', rim: '#E6FBFF'},
    candy:   {mats: ['pink', 'lilac', 'sky', 'pink', 'mint', 'lilac', 'red', 'sun', 'gold', 'mint', 'sky'],
              frame: ['#FFC2E0', '#E0569B', '#8E1E5A'], glowL: '#FF6AD5', glowR: '#7CD8FF', back: ['#6A1E58', '#2A0822'], grid: 'rgba(255,170,220,.22)',
              tile: ['#FFFFFF', '#FFD6EA'], tink: '#7A1050', spark: ['#FFE14A', '#FFFFFF', '#FF6AD5', '#7CD8FF'], ink: '#4A0A30', rim: '#FFE6F4'},
    space:   {mats: ['purple', 'neon', 'magenta', 'purple', 'neon', 'steel', 'magenta', 'sky', 'gold', 'neon', 'purple'],
              frame: ['#B8A8FF', '#5A4AB8', '#241A5C'], glowL: '#FF3CD2', glowR: '#3CF2FF', back: ['#1E1450', '#05031A'], grid: 'rgba(160,140,255,.24)',
              tile: ['#EDE8FF', '#B8ACEA'], tink: '#22195C', spark: ['#FFFFFF', '#3CF2FF', '#FF3CD2', '#FFE14A'], ink: '#0E0830', rim: '#E6E0FF'},
    castle:  {mats: ['stone', 'lilac', 'gold', 'stone', 'purple', 'steel', 'red', 'gold', 'sun', 'lilac', 'blue'],
              frame: ['#E8E0D0', '#9A8E78', '#4E4638'], glowL: '#FFC94A', glowR: '#B89BFF', back: ['#3A2E66', '#120C2A'], grid: 'rgba(200,180,255,.22)',
              tile: ['#FFFBF0', '#E2D6BC'], tink: '#2E2450', spark: ['#FFD54A', '#FFFFFF', '#C29BFF', '#FF8A6A'], ink: '#1A1230', rim: '#FFF0C8'}
  };
  const WORD = 'Lettercraft';
  const FONT = (px) => '700 ' + px + 'px Fredoka, Nunito, "Arial Rounded MT Bold", sans-serif';
  const cache = {}; let SC = 1, RES = 1;   /* kit: SC stays 1 (the kit scales shadows), RES = real pixels per unit for the letter canvas */   // SC = current scale (shadowBlur is not scaled by the canvas transform)
  const lin = (g, x0, y0, x1, y1, st) => { const q = g.createLinearGradient(x0, y0, x1, y1); st.forEach((c, i) => q.addColorStop(i / (st.length - 1), c)); return q; };
  const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };   // fixed "random" → the same picture every time

  function hexPath(g, r){ g.beginPath(); for(let i = 0; i < 6; i++){ const a = -Math.PI / 2 + i * Math.PI / 3; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); }   // pointy top, flat sides
  function star(g, x, y, r, c){ g.save(); g.translate(x, y); g.fillStyle = c; g.shadowColor = c; g.shadowBlur = r * 1.6 * SC; g.beginPath();
    for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); }
  function gear(g, x, y, r, c, teeth){ g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath();
    for(let i = 0; i < teeth * 2; i++){ const a = i * Math.PI / teeth, rr = i % 2 ? r * 0.8 : r; g.lineTo(Math.cos(a - 0.12) * rr, Math.sin(a - 0.12) * rr); g.lineTo(Math.cos(a + 0.12) * rr, Math.sin(a + 0.12) * rr); }
    g.closePath(); g.arc(0, 0, r * 0.36, 0, 7, true); g.fill('evenodd'); g.restore(); }

  function tile(g, L, x, y, s, ch, pts){   // one cream letter tile with its points (like the game's tiles)
    g.save(); g.translate(x, y);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.roundRect(-s / 2 + s * 0.04, -s / 2 + s * 0.08, s, s, s * 0.16); g.fill();
    g.fillStyle = lin(g, 0, -s / 2, 0, s / 2, L.tile); g.beginPath(); g.roundRect(-s / 2, -s / 2, s, s, s * 0.16); g.fill();
    g.lineWidth = s * 0.05; g.strokeStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(-s * 0.36, -s * 0.42); g.lineTo(s * 0.36, -s * 0.42); g.stroke();
    g.fillStyle = L.tink; g.font = FONT(Math.round(s * 0.62)); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, -s * 0.04, s * 0.04);
    if(pts){ g.font = FONT(Math.round(s * 0.24)); g.fillText(String(pts), s * 0.32, s * 0.3); }
    g.restore();
  }
  const PTS = {W: 4, O: 1, R: 1, D: 2, P: 3, L: 1, A: 1, Y: 4, M: 3, C: 3};
  function board(g, L, R, plain){   // the hex board: glow, inside, grid, tiles, wooden frame — centre (0,0), radius R
    // outer glow: warm on the left, cool on the right
    [[L.glowL, -1], [L.glowR, 1]].forEach(([c, side]) => {
      g.save(); g.beginPath(); g.rect(side < 0 ? -R * 1.6 : 0, -R * 1.6, R * 1.6, R * 3.2); g.clip();
      g.shadowColor = c; g.shadowBlur = R * 0.22 * SC; g.lineWidth = R * 0.07; g.strokeStyle = c; hexPath(g, R * 1.03); g.stroke(); g.restore();
    });
    hexPath(g, R); g.fillStyle = lin(g, 0, -R, 0, R, L.back); g.fill();
    g.save(); hexPath(g, R * 0.93); g.clip();
    const cs = R * 0.24;   // cells
    g.strokeStyle = L.grid; g.lineWidth = R * 0.008;
    for(let k = -5; k <= 5; k++){ g.beginPath(); g.moveTo(k * cs, -R); g.lineTo(k * cs, R); g.stroke(); g.beginPath(); g.moveTo(-R, k * cs); g.lineTo(R, k * cs); g.stroke(); }
    for(let j = -3; j <= 3; j++) for(let i = -3; i <= 3; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.03 + 0.04 * rnd(i * 7 + j)) + ')'; g.fillRect(i * cs - cs / 2 + 2, j * cs - cs / 2 + 2, cs - 4, cs - 4); }
    // a little crossword: WORD across the top, PLAY across the bottom, joined by a down word (CRAFT) — the wordmark sits over the middle row
    const s = cs * 0.9, put = (w, i0, j0, di, dj) => [...w].forEach((ch, k) => tile(g, L, (i0 + k * di) * cs, (j0 + k * dj) * cs, s, ch, PTS[ch]));
    if(plain){ g.save(); g.rotate(-0.08); tile(g, L, -cs * 0.3, -cs * 0.25, cs * 3.1, 'L', 1); g.restore(); tile(g, L, cs * 1.55, cs * 1.45, cs * 1.45, 'C', 3); }   // small sizes: one big tile you can read
    else { put('WORD', -2, -2, 1, 0); put('DRAMA', 1, -2, 0, 1); put('PLAY', -1, 2, 1, 0); }   // WORD ⟂ DRAMA ⟂ PLAY (a real crossword)
    g.restore();
    // wooden plank frame: 6 planks with bolts
    for(let i = 0; i < 6; i++){
      const a0 = -Math.PI / 2 + i * Math.PI / 3, a1 = a0 + Math.PI / 3, ro = R * 1.0, ri = R * 0.88;
      const p = [[Math.cos(a0) * ro, Math.sin(a0) * ro], [Math.cos(a1) * ro, Math.sin(a1) * ro], [Math.cos(a1) * ri, Math.sin(a1) * ri], [Math.cos(a0) * ri, Math.sin(a0) * ri]];
      g.beginPath(); p.forEach(([x, y]) => g.lineTo(x, y)); g.closePath();
      const mx = (p[0][0] + p[1][0]) / 2, my = (p[0][1] + p[1][1]) / 2;
      g.fillStyle = lin(g, mx * 0.88, my * 0.88, mx, my, [L.frame[1], L.frame[0], L.frame[1]]); g.fill();
      g.lineWidth = R * 0.012; g.strokeStyle = L.frame[2]; g.stroke();
      g.save(); g.clip(); g.strokeStyle = 'rgba(80,36,8,.28)'; g.lineWidth = R * 0.006;   // grain
      for(let q = 0; q < 3; q++){ const t = 0.25 + q * 0.25; g.beginPath(); g.moveTo(p[0][0] + (p[3][0] - p[0][0]) * t, p[0][1] + (p[3][1] - p[0][1]) * t); g.lineTo(p[1][0] + (p[2][0] - p[1][0]) * t, p[1][1] + (p[2][1] - p[1][1]) * t); g.stroke(); }
      g.restore();
      [0.18, 0.82].forEach(t => { const bx = p[0][0] + (p[1][0] - p[0][0]) * t, by = p[0][1] + (p[1][1] - p[0][1]) * t, cx = bx * 0.94, cy = by * 0.94;
        g.fillStyle = L.frame[2]; g.beginPath(); g.arc(cx, cy, R * 0.022, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(cx - R * 0.006, cy - R * 0.006, R * 0.009, 0, 7); g.fill(); });
    }
    g.lineWidth = R * 0.016; g.strokeStyle = L.frame[2]; hexPath(g, R); g.stroke();
  }

  // the wordmark: every letter its own material, a dark outline + a light rim, a soft glow, a little bounce
  let LETTER = null;   // one scratch canvas for the per-letter fill
  function wordmark(g, L, cx, cy, px, maxW){
    g.save(); g.font = FONT(px);
    const big = 1.2, sizes = [...WORD].map((ch, i) => i === 0 ? px * big : px);
    const ws = [...WORD].map((ch, i) => { g.font = FONT(sizes[i]); return g.measureText(ch).width; });
    const gap = -px * 0.02, tot = ws.reduce((a, b) => a + b, 0) + gap * (WORD.length - 1), k = Math.min(1, maxW / tot);
    g.translate(cx, cy); g.scale(k, k);
    let x = -tot / 2; const lay = [...WORD].map((ch, i) => { const o = {ch, x: x + ws[i] / 2, y: Math.sin(i * 1.3) * px * 0.05 + (i === 0 ? px * 0.06 : 0), r: (i % 2 ? 1 : -1) * 0.05 + (i === 0 ? -0.06 : 0), px: sizes[i], m: MAT[L.mats[i]] || MAT.wood}; x += ws[i] + gap; return o; });
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const each = (fn) => lay.forEach(o => { g.save(); g.translate(o.x, o.y); g.rotate(o.r); g.font = FONT(o.px); fn(o); g.restore(); });
    // 1 glow + rim + outline (whole word first, so letters never cut each other's outline)
    g.save(); g.shadowColor = L.glowL; g.shadowBlur = px * 0.24 * SC * k; each(o => { g.lineWidth = o.px * 0.34; g.strokeStyle = L.ink; g.strokeText(o.ch, 0, 0); }); g.restore();
    each(o => { g.lineWidth = o.px * 0.34; g.strokeStyle = L.rim; g.strokeText(o.ch, 0, o.px * 0.02); });
    each(o => { g.lineWidth = o.px * 0.24; g.strokeStyle = L.ink; g.strokeText(o.ch, 0, o.px * 0.05); g.strokeText(o.ch, 0, 0); });
    // 2 fills, each letter on the scratch canvas (gradient + wood grain / steel lines + gloss)
    const sc = RES * k, side = Math.ceil(px * big * 1.6 * sc) + 4;
    if(!LETTER) LETTER = document.createElement('canvas');
    each(o => {
      const c = LETTER; c.width = side; c.height = side; const q = c.getContext('2d'), h = o.px;
      q.setTransform(sc, 0, 0, sc, side / 2, side / 2); q.font = FONT(o.px); q.textAlign = 'center'; q.textBaseline = 'middle';
      q.fillStyle = lin(q, 0, -h * 0.45, 0, h * 0.45, [o.m[0], o.m[1], o.m[2]]); q.fillText(o.ch, 0, 0);
      q.globalCompositeOperation = 'source-atop';
      if(o.m[3] === 'wood'){ q.strokeStyle = 'rgba(110,50,10,.35)'; q.lineWidth = h * 0.025; for(let n = 0; n < 7; n++){ const yy = -h * 0.5 + n * h * 0.16; q.beginPath(); q.moveTo(-h, yy); q.bezierCurveTo(-h * 0.3, yy + h * 0.06 * (n % 2 ? 1 : -1), h * 0.3, yy - h * 0.05, h, yy + h * 0.03); q.stroke(); } }
      if(o.m[3] === 'steel'){ q.fillStyle = 'rgba(255,255,255,.25)'; for(let n = -3; n <= 3; n++) q.fillRect(n * h * 0.16, -h, h * 0.05, h * 2); }
      q.fillStyle = lin(q, 0, -h * 0.5, 0, 0, ['rgba(255,255,255,.75)', 'rgba(255,255,255,0)']); q.beginPath(); q.ellipse(-h * 0.06, -h * 0.22, h * 0.42, h * 0.16, -0.15, 0, 7); q.fill();   // gloss
      q.fillStyle = 'rgba(0,0,0,.18)'; q.fillRect(-h, h * 0.18, h * 2, h);   // shade at the bottom
      g.drawImage(c, -side / 2 / sc, -side / 2 / sc, side / sc, side / sc);
    });
    g.restore();
  }

  function main(g, L){   // unit box 680 × 420: hex board, the wordmark across it, gears, floating letters + sparkles
    gear(g, -150, -150, 34, 'rgba(255,200,90,.28)', 9); gear(g, 160, 150, 28, 'rgba(120,220,255,.25)', 8); gear(g, 185, -128, 18, 'rgba(255,200,90,.22)', 7);
    board(g, L, 172, false);
    [['A', -270, -120, 0], ['B', 262, 118, 1], ['C', -232, 132, 2], ['+', 250, -140, 3], ['×', 292, -36, 1], ['?', -300, 20, 3]].forEach(([ch, x, y, n]) => {
      g.save(); g.font = FONT(ch.length && /[A-Z]/.test(ch) ? 34 : 30); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = L.spark[n]; g.shadowBlur = 14 * SC; g.lineWidth = 6; g.strokeStyle = L.ink; g.strokeText(ch, x, y); g.fillStyle = L.spark[n]; g.fillText(ch, x, y); g.restore(); });
    [[-210, -175, 9, 0], [214, -186, 7, 1], [-306, -60, 6, 2], [306, 74, 8, 0], [-196, 186, 7, 3], [120, 196, 6, 1], [-60, -205, 5, 2]].forEach(([x, y, r, n]) => star(g, x, y, r, L.spark[n]));
    wordmark(g, L, 0, 6, 104, 640);
  }
  function wide(g, L){   // unit box 760 × 190: a small hex board on the left, the wordmark on the right
    g.save(); g.translate(-300, 0); board(g, L, 76, true); g.restore();
    star(g, -232, -70, 7, L.spark[0]); star(g, -360, 66, 5, L.spark[1]);
    wordmark(g, L, 76, 4, 118, 560);
  }
  function badge(g, L){ board(g, L, 118, true); star(g, 96, -104, 9, L.spark[0]); star(g, -104, 92, 7, L.spark[1]); }   // unit box 272 × 280

  const BOX = {main: [680, 420], wide: [760, 190], badge: [272, 280]};   // room for the glow
  function draw(g, kind, x, y, px, look){   // px = width on screen
    const L = LOOK[look] || LOOK.classic, [bw] = BOX[kind] || BOX.badge, s = px / bw; SC = s;
    g.save(); g.translate(x, y); g.scale(s, s);
    kind === 'main' ? main(g, L) : kind === 'wide' ? wide(g, L) : badge(g, L);
    g.restore();
  }
  function pic(kind, look, px){
    px = Math.max(16, Math.round(px)); const key = kind + ':' + (LOOK[look] ? look : 'classic') + ':' + px; if(cache[key]) return cache[key];
    const [bw, bh] = BOX[kind] || BOX.badge, c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * bh / bw);
    draw(c.getContext('2d'), kind, px / 2, c.height / 2, px, look);
    return (cache[key] = c);
  }
  const url = (kind, look, px) => pic(kind, look, px).toDataURL('image/png');
  const clear = () => { for(const k in cache) delete cache[k]; };   // after the web fonts arrive
  function kit(g, kind, L){ RES = (g.getTransform && g.getTransform().a) || 1; SC = 1; const b = BOX[kind]; g.save(); g.translate(b[0] / 2, b[1] / 2); kind === 'main' ? main(g, L) : kind === 'wide' ? wide(g, L) : badge(g, L); g.restore(); }
  return {draw, pic, url, clear, LOOK, MAT, BOX, WORD, kit};
})();
  return { BOX: { main: LC.BOX.main, wide: LC.BOX.wide, badge: LC.BOX.badge }, LOOK: LC.LOOK, paint: function (g, kind, L) { LC.kit(g, kind, L); } };
})());
// 🏷️ LOGO lettercraft END

// 🏷️ LOGO mathquest START — ➗ Math Quest, drawn in code from Aowu's picture (gl-9)
GameLogos.add('mathquest', (function () {
  var BOX = { scene: [1024, 572], main: [760, 520], wide: [800, 200], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#2a7ad8', '#1a5ab8', '#12408a'], core: ['#7ad8ff', '#3f7af0', '#5a3fd0', '#1a1a6a'], ring: ['#fff0a0', '#ffc531', '#c9820a'], path: ['#f1dca6', '#c9a55c'],
    a: ['#d8f6ff', '#6ac8ff', '#2a8af0', '#1a5ad0'], b: ['#fff27a', '#ffc21a', '#ff8a12', '#f0540a'], dark: '#12205e', ops: ['#ffd23e', '#ff6a4a', '#ff8a2a', '#b6e03a'] }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    school: mk({ sky: ['#ffb878', '#ff9f68', '#e0703a'], core: ['#fff2c8', '#ffd08a', '#ff9f68', '#c85a2a'], dark: '#5a2a0a' }),
    space: mk({ sky: ['#3a2a8a', '#241a5c', '#0e0a2e'], core: ['#b8a8ff', '#5b3bd8', '#3a1f9a', '#12104a'] }),
    lab: mk({ sky: ['#8ae0e8', '#5bc0eb', '#2a8ac8'], core: ['#e0fff8', '#8aeee0', '#3fb8d8', '#1a6a9a'], dark: '#0f3a5a' }),
    animals: mk({ sky: ['#8ae07a', '#5cc45a', '#2f8a3a'], core: ['#f0ffd8', '#a8e88a', '#5cc45a', '#1f6a2a'], dark: '#12401a' }),
    market: mk({ sky: ['#ffa8c0', '#ff7aa2', '#d84a7a'], core: ['#fff0f4', '#ffc0d4', '#ff7aa2', '#a82a5a'], dark: '#5a1230' }) };
  var TAU = Math.PI * 2;
  function faceOn(g, x, y, s, wink) { g.save(); g.translate(x, y); g.fillStyle = '#3a1c0a'; g.strokeStyle = '#3a1c0a'; g.lineCap = 'round'; g.lineWidth = s * 0.09;
    if (wink) { g.beginPath(); g.arc(-s * 0.3, -s * 0.06, s * 0.13, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); g.beginPath(); g.arc(s * 0.3, -s * 0.06, s * 0.13, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    else { g.beginPath(); g.arc(-s * 0.3, -s * 0.08, s * 0.1, 0, TAU); g.arc(s * 0.3, -s * 0.08, s * 0.1, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(-s * 0.33, -s * 0.12, s * 0.035, 0, TAU); g.arc(s * 0.27, -s * 0.12, s * 0.035, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(0, s * 0.04, s * 0.2, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke(); g.fillStyle = 'rgba(255,90,110,.45)'; g.beginPath(); g.arc(-s * 0.5, s * 0.1, s * 0.1, 0, TAU); g.arc(s * 0.5, s * 0.1, s * 0.1, 0, TAU); g.fill(); g.restore(); }
  function solid(g, T, col, ink, lw, draw) { g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.shadowColor = 'rgba(255,250,190,.95)'; g.shadowBlur = 22; draw(); g.lineWidth = lw + 5; g.strokeStyle = '#fff'; g.stroke(); g.shadowColor = 'transparent'; draw(); g.lineWidth = lw; g.strokeStyle = ink; g.stroke(); g.shadowColor = 'transparent'; draw(); g.fillStyle = col; g.fill(); g.restore(); }
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; function m(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); } return 'rgb(' + m(r) + ',' + m(gg) + ',' + m(b) + ')'; }
  function op(g, T, L, kind, x, y, s, rot) {   // + − × ÷ with faces
    g.save(); g.translate(x, y); g.rotate(rot || 0); var c = L.ops[{ plus: 0, minus: 1, times: 2, div: 3 }[kind]], ink = shade(c, -0.6), grad = T.lin(g, 0, -s, 0, s, [0, shade(c, 0.45), 0.5, c, 1, shade(c, -0.2)]);
    function bar(w, h) { T.rr(g, -w / 2, -h / 2, w, h, h * 0.42); }
    if (kind === 'minus') { solid(g, T, grad, ink, s * 0.14, function () { bar(s * 2, s * 0.7); }); g.fillStyle = 'rgba(255,255,255,.4)'; T.rr(g, -s * 0.8, -s * 0.26, s * 1.6, s * 0.14, s * 0.07); g.fill(); faceOn(g, 0, s * 0.02, s * 0.5, true); }
    else if (kind === 'div') { solid(g, T, grad, ink, s * 0.14, function () { bar(s * 2, s * 0.6); }); solid(g, T, shade(c, 0.1), ink, s * 0.12, function () { g.beginPath(); g.arc(0, -s * 0.72, s * 0.26, 0, TAU); }); solid(g, T, shade(c, 0.1), ink, s * 0.12, function () { g.beginPath(); g.arc(0, s * 0.72, s * 0.26, 0, TAU); }); faceOn(g, 0, s * 0.02, s * 0.46, false); }
    else { if (kind === 'times') g.rotate(Math.PI / 4); solid(g, T, grad, ink, s * 0.14, function () { g.beginPath(); var a = s * 0.36, b = s; g.moveTo(-a, -b); g.lineTo(a, -b); g.lineTo(a, -a); g.lineTo(b, -a); g.lineTo(b, a); g.lineTo(a, a); g.lineTo(a, b); g.lineTo(-a, b); g.lineTo(-a, a); g.lineTo(-b, a); g.lineTo(-b, -a); g.lineTo(-a, -a); g.closePath(); });
      g.fillStyle = 'rgba(255,255,255,.4)'; T.rr(g, -s * 0.24, -s * 0.86, s * 0.48, s * 0.14, s * 0.07); g.fill(); if (kind === 'times') g.rotate(-Math.PI / 4); faceOn(g, 0, 0, s * 0.56, kind === 'times'); }
    g.restore();
  }
  function ringWorld(g, T, L, cx, cy, R) {
    g.save(); g.shadowColor = 'rgba(130,240,255,1)'; g.shadowBlur = 60; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fillStyle = L.core[2]; g.fill(); g.shadowBlur = 30; g.fill(); g.shadowBlur = 0;
    g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fillStyle = T.rad(g, cx - R * 0.2, cy - R * 0.1, 10, R * 1.1, [0, L.core[0], 0.35, L.core[1], 0.7, L.core[2], 1, L.core[3]]); g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip();
    g.globalAlpha = 0.35; g.strokeStyle = '#fff'; g.lineWidth = 16; g.beginPath(); g.ellipse(cx, cy, R * 0.8, R * 0.44, -0.5, 0, TAU); g.stroke(); g.strokeStyle = L.core[2]; g.lineWidth = 22; g.beginPath(); g.ellipse(cx, cy + 10, R * 0.56, R * 0.9, 0.6, 0, TAU); g.stroke(); g.globalAlpha = 1;
    // the winding quest path
    function p() { g.beginPath(); g.moveTo(cx - R * 0.2, cy + R * 1.02); g.bezierCurveTo(cx + R * 0.5, cy + R * 0.62, cx - R * 0.6, cy + R * 0.3, cx + R * 0.06, cy + R * 0.04); g.bezierCurveTo(cx + R * 0.56, cy - R * 0.16, cx + R * 0.1, cy - R * 0.5, cx + R * 0.3, cy - R * 0.72); }
    g.lineCap = 'round'; p(); g.lineWidth = 40; g.strokeStyle = 'rgba(20,20,90,.4)'; g.stroke(); p(); g.lineWidth = 30; g.strokeStyle = L.path[1]; g.stroke(); p(); g.lineWidth = 22; g.strokeStyle = L.path[0]; g.stroke(); p(); g.setLineDash([2, 20]); g.lineWidth = 5; g.strokeStyle = 'rgba(140,100,40,.6)'; g.stroke(); g.setLineDash([]);
    var r = T.rng(6); for (var i = 0; i < 50; i++) { var an = r() * TAU, d = Math.sqrt(r()) * R * 0.96; g.globalAlpha = 0.3 + r() * 0.6; g.fillStyle = '#fff'; g.beginPath(); g.arc(cx + Math.cos(an) * d, cy + Math.sin(an) * d, 0.8 + r() * 1.8, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore();
    g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.lineWidth = 24; g.strokeStyle = '#4e2c04'; g.stroke(); g.lineWidth = 16; g.strokeStyle = T.lin(g, cx - R, cy - R, cx + R, cy + R, [0, L.ring[0], 0.3, L.ring[1], 0.6, L.ring[2], 1, L.ring[0]]); g.stroke();
    g.shadowColor = '#fff6b0'; g.shadowBlur = 16; g.beginPath(); g.arc(cx, cy, R + 12, 0, TAU); g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,246,190,.9)'; g.stroke(); g.beginPath(); g.arc(cx, cy, R - 12, 0, TAU); g.lineWidth = 2.5; g.strokeStyle = 'rgba(150,240,255,.9)'; g.shadowColor = '#7af0ff'; g.stroke(); g.shadowBlur = 0; g.restore();
  }
  function compass(g, T, x, y, R) { g.save(); g.translate(x, y); g.beginPath(); g.arc(0, -R * 1.2, R * 0.2, 0, TAU); g.lineWidth = R * 0.14; g.strokeStyle = '#c9820a'; g.stroke(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = '#ffc531'; g.fill(); g.lineWidth = R * 0.12; g.strokeStyle = '#4e2c04'; g.stroke(); g.beginPath(); g.arc(0, 0, R * 0.76, 0, TAU); g.fillStyle = '#f4fbff'; g.fill(); g.lineWidth = R * 0.06; g.stroke();
    g.rotate(0.6); g.beginPath(); g.moveTo(0, -R * 0.62); g.lineTo(R * 0.16, 0); g.lineTo(-R * 0.16, 0); g.closePath(); g.fillStyle = '#ef3b33'; g.fill(); g.beginPath(); g.moveTo(0, R * 0.62); g.lineTo(R * 0.16, 0); g.lineTo(-R * 0.16, 0); g.closePath(); g.fillStyle = '#3f7af0'; g.fill(); g.beginPath(); g.arc(0, 0, R * 0.1, 0, TAU); g.fillStyle = '#4e2c04'; g.fill(); g.restore(); }
  function sword(g, T, x, y, k, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.lineJoin = 'round'; g.beginPath(); g.moveTo(-9, 20); g.lineTo(-9, -92); g.lineTo(0, -112); g.lineTo(9, -92); g.lineTo(9, 20); g.closePath(); g.fillStyle = T.lin(g, -9, 0, 9, 0, [0, '#f4fbff', 0.5, '#c8dcf0', 0.5, '#9ab4d0', 1, '#dcecf8']); g.fill(); g.lineWidth = 5; g.strokeStyle = '#1a2a5e'; g.stroke();
    T.rr(g, -26, 18, 52, 12, 5); g.fillStyle = '#ffc531'; g.fill(); g.stroke(); T.rr(g, -7, 30, 14, 30, 5); g.fillStyle = '#b8562a'; g.fill(); g.stroke(); g.beginPath(); g.arc(0, 64, 8, 0, TAU); g.fillStyle = '#ffc531'; g.fill(); g.stroke(); g.restore(); }
  function pencil(g, T, x, y, k, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.lineJoin = 'round'; T.rr(g, -10, -70, 20, 110, 3); g.fillStyle = T.lin(g, -10, 0, 10, 0, [0, '#ffd23e', 0.5, '#ffb02e', 1, '#e88a0a']); g.fill(); g.lineWidth = 5; g.strokeStyle = '#3a1c0a'; g.stroke(); T.rr(g, -10, -84, 20, 16, 5); g.fillStyle = '#ff8aa8'; g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-10, 40); g.lineTo(0, 66); g.lineTo(10, 40); g.closePath(); g.fillStyle = '#f0d0a0'; g.fill(); g.stroke(); g.beginPath(); g.moveTo(-4, 56); g.lineTo(0, 66); g.lineTo(4, 56); g.closePath(); g.fillStyle = '#3a1c0a'; g.fill(); g.restore(); }
  function gem(g, x, y, s, c1, c2, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.86, -s * 0.5); g.lineTo(0, 0); g.lineTo(-s * 0.86, -s * 0.5); g.closePath(); g.fillStyle = c1; g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); g.beginPath(); g.moveTo(-s * 0.86, -s * 0.5); g.lineTo(0, 0); g.lineTo(0, s); g.lineTo(-s * 0.86, s * 0.5); g.closePath(); g.fillStyle = c1; g.fill(); g.beginPath(); g.moveTo(s * 0.86, -s * 0.5); g.lineTo(0, 0); g.lineTo(0, s); g.lineTo(s * 0.86, s * 0.5); g.closePath(); g.fillStyle = c2; g.fill(); g.restore(); }
  function words(g, T, L, cx, base, size) {
    function o(c) { return { spacing: size * 0.008, dark: L.dark, outline: size * 0.2, depth: size * 0.1, glow: 'rgba(130,235,255,.95)', face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.5)' }; }
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var w1 = g.measureText('Math').width + 3 * size * 0.008, w2 = g.measureText('Quest').width + 4 * size * 0.008; g.restore(); var x0 = cx - (w1 + w2) / 2;
    T.word(g, 'Quest', x0 + w1 + w2 / 2, base, size, o(L.b)); T.gloss(g, 'Quest', x0 + w1 + w2 / 2, base, size, o(L.b), 0.45); T.word(g, 'Math', x0 + w1 / 2, base, size, o(L.a)); T.gloss(g, 'Math', x0 + w1 / 2, base, size, o(L.a), 0.5);
  }
  function neon(g, T, cx, cy, R) {   // glowing orbit lines + comet dust round the ring
    g.save(); g.lineCap = 'round';
    [[1.16, 0.5, -0.42, '#6af0ff', 9, 3.4, 6.0], [1.26, 0.56, -0.42, '#ff7af0', 6, 0.2, 2.8], [1.1, 0.62, 0.5, '#b08aff', 7, 3.7, 6.2], [1.2, 0.7, 0.5, '#7dffb0', 5, 0.5, 2.6], [1.34, 0.46, -0.3, '#ffe27a', 4.5, 3.2, 5.4], [1.4, 0.6, 0.2, '#6af0ff', 3.5, 0.4, 2.2]].forEach(function (o) {
      g.save(); g.translate(cx, cy); g.rotate(o[2]); g.shadowColor = o[3]; g.shadowBlur = 26; g.beginPath(); g.ellipse(0, 0, R * o[0], R * o[1], 0, o[5], o[6]); g.lineWidth = o[4] + 4; g.strokeStyle = o[3]; g.globalAlpha = 0.35; g.stroke(); g.globalAlpha = 1; g.lineWidth = o[4]; g.stroke(); g.lineWidth = o[4] * 0.4; g.strokeStyle = '#fff'; g.stroke();
      var ex = Math.cos(o[6]) * R * o[0], ey = Math.sin(o[6]) * R * o[1]; g.beginPath(); g.arc(ex, ey, o[4] * 1.5, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); });
    var r = T.rng(33); for (var i = 0; i < 90; i++) { var a = r() * TAU, d = R * (1.04 + r() * 0.34); g.globalAlpha = 0.4 + r() * 0.6; g.fillStyle = ['#6af0ff', '#ff9af0', '#ffe27a', '#ffffff'][i % 4]; g.shadowColor = g.fillStyle; g.shadowBlur = 8; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.9, 1 + r() * 2.6, 0, TAU); g.fill(); }
    g.restore();
  }
  function emblem(g, T, L) {
    g.fillStyle = T.rad(g, 512, 290, 150, 330, [0, 'rgba(110,235,255,.75)', 0.6, 'rgba(120,120,255,.3)', 1, 'rgba(110,110,255,0)']); g.fillRect(132, 0, 760, 572);
    neon(g, T, 512, 290, 212);
    ringWorld(g, T, L, 512, 290, 212);
    gem(g, 286, 400, 16, '#5aa8ff', '#2a5fd0', 0.3); gem(g, 600, 92, 14, '#f2b63a', '#a86a10', -0.3); gem(g, 744, 250, 18, '#9a5cf0', '#5a2fb8', 0.4); gem(g, 300, 196, 13, '#f2b63a', '#a86a10', 0.6); gem(g, 690, 470, 13, '#f2b63a', '#a86a10', 0.2);
    pencil(g, T, 684, 276, 1.0, 0.62); sword(g, T, 690, 236, 1.05, 0.72); compass(g, T, 610, 184, 30);
    op(g, T, L, 'plus', 398, 142, 62, -0.12); op(g, T, L, 'minus', 574, 122, 52, 0.06); op(g, T, L, 'times', 398, 420, 60, 0); op(g, T, L, 'div', 600, 432, 50, -0.06);
    g.save(); g.font = '700 86px ' + T.FONT; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#6a3a04'; g.strokeText('?', 736, 440); g.fillStyle = T.lin(g, 0, 370, 0, 440, [0, '#fff3a0', 1, '#ffb02e']); g.fillText('?', 736, 440); g.restore();
    words(g, T, L, 512, 326, 134);
    [[250, 150, 11], [770, 150, 12], [470, 86, 8], [300, 300, 8], [786, 330, 9], [520, 500, 8], [250, 440, 7]].forEach(function (s, i) { T.spark(g, s[0], s[1], s[2], i % 2 ? '#ffe14a' : '#ffffff', 0.95); });
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-132, -30); emblem(g, T, L); return; }
    if (kind === 'wide') { ringWorld(g, T, L, 96, 100, 70); op(g, T, L, 'plus', 96, 98, 46, -0.12); words(g, T, L, 492, 136, 112); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.lin(g, 0, 0, 400, 400, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fill(); g.clip(); g.translate(200, 200); if (px >= 90) { g.scale(0.72, 0.72); g.translate(-512, -290); emblem(g, T, L); } else { g.translate(-200, -200); ringWorld(g, T, L, 200, 200, 150); op(g, T, L, 'plus', 200, 200, 86, -0.12); } g.restore(); T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 12; g.strokeStyle = L.dark; g.stroke(); g.lineWidth = 6; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.ring[0], 0.5, L.ring[1], 1, L.ring[2]]); g.stroke(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO mathquest END

// 🏷️ LOGO maze START — 🧭 Maze Explorer, drawn in code from Aowu's picture (gl-23, round 8). A REAL round neon maze (a perfect polar maze, made by a
// seeded walk, so it always has exactly one way through) in a glowing rounded-square badge; the explorer kid (pith helmet, backpack, torch with a beam —
// one-piece); the game's own dangers around it: a lava volcano, tornadoes, a flood wave, jungle ruins, a glowing tile path; "MAZE" orange-gold over
// "EXPLORER" green. One look.
GameLogos.add('maze', (function () {
  var BOX = { scene: [1024, 572], main: [728, 520], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  var LOOK = { classic: { bg: ['#16283a', '#0a1420', '#05090f'], plate: ['#1a2a5a', '#0e1838'], rim: '#38d8ff', walls: ['#38a8ff', '#48d86a', '#a86aff', '#38d0ff', '#7ae84a', '#c87aff'], dark: '#3a1404',
    maze: ['#fff6a0', '#ffc21a', '#ff7a1a'], exp: ['#d8ff8a', '#5ad84a', '#1a8a3a'] } };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#1a0c08', CX = 512, CY = 280;
  /* ---------- a perfect polar maze ---------- */
  var MZ = null;
  function build() {
    if (MZ) return MZ;
    var N = [1, 8, 16, 16, 32, 32, 32], R0 = 44, DR = 31, rng = GameLogos.tools.rng(23), cells = [];
    N.forEach(function (n, r) { for (var i = 0; i < n; i++) cells.push({ r: r, i: i, id: cells.length, out: false, cw: false, inw: false }); });
    function at(r, i) { var s = 0; for (var k = 0; k < r; k++) s += N[k]; return cells[s + ((i % N[r]) + N[r]) % N[r]]; }
    function nb(c) { var L = []; if (c.r > 0) { if (N[c.r] > 1) { L.push([at(c.r, c.i + 1), 'cw']); L.push([at(c.r, c.i - 1), 'ccw']); } L.push([at(c.r - 1, Math.floor(c.i * N[c.r - 1] / N[c.r])), 'in']); }
      if (c.r < N.length - 1) { var k = N[c.r + 1] / N[c.r]; for (var j = 0; j < k; j++) L.push([at(c.r + 1, c.i * k + j), 'out']); } else if (c.r === 0) {} return L; }
    var seen = {}, open = {}, stack = [cells[0]]; seen[0] = 1;
    function key(a, b) { return a < b ? a + '-' + b : b + '-' + a; }
    while (stack.length) { var c = stack[stack.length - 1], opts = nb(c).filter(function (q) { return !seen[q[0].id]; });
      if (!opts.length) { stack.pop(); continue; } var p = opts[Math.floor(rng() * opts.length)][0]; open[key(c.id, p.id)] = 1; seen[p.id] = 1; stack.push(p); }
    MZ = { N: N, R0: R0, DR: DR, at: at, open: function (a, b) { return !!open[key(a.id, b.id)]; }, cells: cells, exit: 9 };
    return MZ;
  }
  function wallCol(L, a) { var t = ((a / TAU) % 1 + 1) % 1; return L.walls[t < 0.25 ? 1 : t < 0.5 ? 3 : t < 0.75 ? 2 : 0]; }
  function maze(g, T, L, glow) {
    var M = build(), N = M.N, rOf = function (r) { return M.R0 + (r - 1) * M.DR; }, Rout = rOf(N.length);
    g.save(); g.lineCap = 'round'; g.lineWidth = 9;
    var segs = []; function seg(f, a) { segs.push([f, wallCol(L, a)]); }
    for (var r = 1; r < N.length; r++) { var n = N[r], ri = rOf(r), ro = rOf(r + 1);
      for (var i = 0; i < n; i++) { var c = M.at(r, i), a0 = -Math.PI / 2 + i * TAU / n, a1 = a0 + TAU / n;
        // inner arc of this cell: open when this cell connects inwards (ring 1 always opens to the middle)
        var inner = M.at(r - 1, Math.floor(i * N[r - 1] / n)); if (!M.open(c, inner)) (function (a0, a1, ri) { seg(function () { g.arc(CX, CY, ri, a0, a1); }, (a0 + a1) / 2); })(a0, a1, ri);
        // the radial wall at the start of the cell
        var prev = M.at(r, i - 1); if (!M.open(c, prev)) (function (a0, ri, ro) { seg(function () { g.moveTo(CX + Math.cos(a0) * ri, CY + Math.sin(a0) * ri); g.lineTo(CX + Math.cos(a0) * ro, CY + Math.sin(a0) * ro); }, a0); })(a0, ri, ro);
      } }
    var n = N[N.length - 1]; for (i = 0; i < n; i++) { if (i === M.exit) continue; var a0 = -Math.PI / 2 + i * TAU / n; (function (a0) { seg(function () { g.arc(CX, CY, Rout, a0, a0 + TAU / n); }, a0 + 0.1); })(a0); }
    // tube walls: a dark under-stroke, the colour (with a glow), then a light top line
    g.lineWidth = 17; g.strokeStyle = 'rgba(4,8,30,.85)'; segs.forEach(function (q) { g.beginPath(); q[0](); g.stroke(); });
    g.lineWidth = 12; segs.forEach(function (q) { g.strokeStyle = q[1]; if (glow) { g.shadowColor = q[1]; g.shadowBlur = 14; } g.beginPath(); q[0](); g.stroke(); }); g.shadowBlur = 0;
    g.lineWidth = 3.5; g.strokeStyle = 'rgba(255,255,255,.4)'; segs.forEach(function (q) { g.save(); g.translate(-2, -2); g.beginPath(); q[0](); g.stroke(); g.restore(); });
    g.restore();
  }
  /* ---------- the world around it ---------- */
  function plate(g, T, L, glowOn) {
    g.save(); T.rr(g, 292, 52, 440, 448, 70); g.fillStyle = T.rad(g, CX, CY, 20, 300, [0, L.plate[0], 1, L.plate[1]]); g.fill();
    g.lineWidth = 10; g.strokeStyle = T.lin(g, 292, 52, 732, 500, [0, L.rim, 0.5, '#4a7aff', 1, L.rim]); if (glowOn) { g.shadowColor = L.rim; g.shadowBlur = 26; } g.stroke(); g.restore();
    T.rr(g, 300, 60, 424, 432, 64); g.lineWidth = 3; g.strokeStyle = 'rgba(160,240,255,.45)'; g.stroke();
  }
  function volcano(g, T) {
    g.save(); g.lineJoin = 'round';
    g.beginPath(); g.moveTo(214, 336); g.lineTo(256, 210); g.quadraticCurveTo(272, 196, 290, 210); g.lineTo(330, 330); g.closePath(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
    g.fillStyle = T.lin(g, 214, 0, 330, 0, [0, '#7a3a24', 0.5, '#5a2a1a', 1, '#3a1a10']); g.fill();
    g.fillStyle = '#ff7a1a'; g.beginPath(); g.moveTo(258, 212); g.quadraticCurveTo(272, 204, 288, 212); g.lineTo(296, 252); g.quadraticCurveTo(290, 270, 284, 252); g.lineTo(278, 236); g.lineTo(270, 290); g.quadraticCurveTo(262, 300, 258, 280); g.lineTo(262, 240); g.lineTo(250, 256); g.closePath(); g.fill();
    g.fillStyle = '#ffd23a'; g.beginPath(); g.ellipse(272, 214, 14, 6, 0, 0, TAU); g.fill();
    var P = [[272, 200, 13], [272, 184, 15], [240, 156, 22], [304, 156, 22], [256, 136, 26], [290, 134, 26], [272, 118, 24], [226, 146, 14], [318, 146, 14]];   // the blast cloud
    P.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], p[2] + 4, 0, TAU); g.fillStyle = INK; g.fill(); }); P.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], p[2], 0, TAU); g.fillStyle = T.rad(g, p[0] - 6, p[1] - 6, 2, p[2], [0, '#ffd27a', 0.5, '#ff8a2a', 1, '#e8501a']); g.fill(); });
    [[224, 200], [312, 194], [236, 236]].forEach(function (d) { g.beginPath(); g.ellipse(d[0], d[1], 6, 9, 0.4, 0, TAU); g.fillStyle = '#ff6a1a'; g.fill(); });
    g.restore();
  }
  function tornado(g, T, x, y, k) { g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round';
    for (var i = 0; i < 6; i++) { var w = 34 - i * 5, yy = -30 + i * 11; g.beginPath(); g.ellipse(Math.sin(i * 1.3) * 5, yy, w, 6, 0, 0, TAU); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.lineWidth = 4.5; g.strokeStyle = i % 2 ? '#8a9ab4' : '#c8d4e4'; g.stroke(); } g.restore(); }
  function wave(g, T) { g.save(); g.lineJoin = 'round';
    g.beginPath(); g.moveTo(206, 460); g.bezierCurveTo(200, 410, 240, 370, 280, 386); g.bezierCurveTo(250, 392, 244, 420, 268, 428); g.bezierCurveTo(286, 434, 300, 440, 318, 460); g.closePath();
    g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.fillStyle = T.lin(g, 0, 380, 0, 460, [0, '#7ad8ff', 0.5, '#2a8ae0', 1, '#1a4ab8']); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(222, 412); g.bezierCurveTo(234, 386, 262, 378, 280, 386); g.bezierCurveTo(258, 388, 240, 400, 236, 416); g.closePath(); g.fill();
    [[214, 444, 6], [300, 450, 5], [276, 372, 4], [286, 380, 7], [296, 390, 5], [262, 376, 6], [304, 402, 4]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fill(); });
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3; g.beginPath(); g.moveTo(230, 452); g.quadraticCurveTo(236, 430, 254, 424); g.moveTo(262, 452); g.quadraticCurveTo(272, 440, 290, 446); g.stroke(); g.restore(); }
  function ruins(g, T) { g.save();
    g.fillStyle = '#2a6a2a'; [[810, 300, 40], [790, 360, 46], [836, 380, 34]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fill(); });
    [[760, 316], [812, 316]].forEach(function (p) { g.fillStyle = T.lin(g, p[0], 0, p[0] + 22, 0, [0, '#c8b890', 1, '#8a7a5a']); g.fillRect(p[0], p[1], 22, 76); g.lineWidth = 3; g.strokeStyle = INK; g.strokeRect(p[0], p[1], 22, 76); });
    g.fillStyle = T.lin(g, 0, 300, 0, 318, [0, '#d8c8a0', 1, '#9a8a6a']); g.fillRect(750, 300, 94, 18); g.strokeRect(750, 300, 94, 18);
    function leaf(x, y, a, s, c) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.5, -s * 0.35, s, 0); g.quadraticCurveTo(s * 0.5, s * 0.35, 0, 0); g.fillStyle = c; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(0,40,0,.6)'; g.stroke(); g.restore(); }
    [[760, 300, -2.4, 44], [800, 296, -1.2, 40], [846, 330, -0.4, 46], [744, 390, 2.6, 40], [830, 396, 0.3, 44], [770, 408, 1.9, 38], [852, 290, -0.9, 36]].forEach(function (l, i) { leaf(l[0], l[1], l[2], l[3], i % 2 ? '#5ad84a' : '#2aa83a'); });
    g.restore(); }
  function tiles(g, T) { g.save(); g.translate(766, 418); g.transform(1, 0.28, -0.9, 0.5, 0, 0); g.shadowColor = '#c86aff'; g.shadowBlur = 14;
    g.fillStyle = 'rgba(80,30,160,.85)'; g.fillRect(-10, -50, 110, 80); g.lineWidth = 4; g.strokeStyle = '#d88aff'; g.strokeRect(-10, -50, 110, 80);
    g.beginPath(); g.moveTo(-10, -10); g.lineTo(40, -10); g.lineTo(40, 30); g.moveTo(40, -50); g.lineTo(40, -30); g.lineTo(70, -30); g.lineTo(70, 10); g.stroke(); g.restore(); }
  function arrowUp(g, T) { g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(560, 166); g.lineTo(600, 132); g.lineTo(630, 150); g.lineTo(690, 98);
    g.lineWidth = 22; g.strokeStyle = INK; g.stroke(); g.lineWidth = 14; g.strokeStyle = '#3ac84a'; g.shadowColor = '#5aff5a'; g.shadowBlur = 10; g.stroke();
    g.beginPath(); g.moveTo(724, 74); g.lineTo(676, 82); g.lineTo(710, 118); g.closePath(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#3ac84a'; g.fill(); g.restore(); }
  /* ---------- the explorer kid (upper body above the word) ---------- */
  function kid(g, T) {
    var SK = ['#ffd6b0', '#f2b080', '#c87a4a'], KH = ['#d8c08a', '#b89a5a', '#7a6034'];
    var P = {
      pack: function (h) { h.beginPath(); h.ellipse(700, 236, 26, 34, 0.2, 0, TAU); h.fill(); h.beginPath(); h.ellipse(694, 204, 22, 12, 0.2, 0, TAU); h.fill(); },
      body: function (h) { h.beginPath(); h.moveTo(708, 230); h.quadraticCurveTo(740, 220, 772, 232); h.lineTo(776, 282); h.quadraticCurveTo(742, 290, 710, 282); h.closePath(); h.fill(); },
      arm: function (h) { T.limb(h, [766, 240, 786, 262, 806, 262], 22, 18); h.beginPath(); h.arc(808, 262, 11, 0, TAU); h.fill(); },
      torch: function (h) { h.save(); T.around(h, 820, 258, -0.25); GameLogos.tools.rr(h, 800, 250, 30, 14, 5); h.fill(); GameLogos.tools.rr(h, 826, 245, 14, 24, 5); h.fill(); h.restore(); },
      head: function (h) { h.beginPath(); h.ellipse(742, 194, 38, 40, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(706, 200, 8, 11, 0, 0, TAU); h.fill(); },
      hat: function (h) { h.beginPath(); h.ellipse(744, 168, 70, 18, -0.08, 0, TAU); h.fill(); h.beginPath(); h.moveTo(704, 168); h.bezierCurveTo(700, 116, 790, 112, 786, 164); h.closePath(); h.fill(); }
    };
    T.onePiece(g, T, { x0: 660, y0: 100, W: 200, H: 210, rim: INK, rimW: 4, parts: P, order: ['pack', 'body', 'arm', 'torch', 'head', 'hat'],
      colour: function (B, put, inside) {
        put(B, 'pack', T.lg(B, 670, 0, 726, 0, [0, '#5a4024', 1, '#8a6a3a'])); inside(B, 'pack', function (h) { h.strokeStyle = '#3a2810'; h.lineWidth = 3; h.beginPath(); h.moveTo(678, 218); h.lineTo(716, 226); h.moveTo(676, 246); h.lineTo(716, 254); h.stroke(); });
        put(B, 'body', T.lg(B, 704, 0, 782, 0, [0, KH[1], 0.5, KH[0], 1, KH[1]]));
        inside(B, 'body', function (h) { h.fillStyle = KH[2]; h.beginPath(); h.moveTo(730, 226); h.lineTo(742, 250); h.lineTo(754, 226); h.closePath(); h.fill(); h.fillStyle = SK[1]; h.beginPath(); h.moveTo(734, 226); h.lineTo(742, 240); h.lineTo(750, 226); h.closePath(); h.fill(); h.fillStyle = '#6a4a20'; h.fillRect(714, 232, 9, 56); h.fillStyle = KH[2]; GameLogos.tools.rr(h, 752, 256, 18, 16, 3); h.fill(); });
        put(B, 'arm', KH[1]); inside(B, 'arm', function (h) { h.fillStyle = SK[1]; h.beginPath(); h.arc(808, 262, 11, 0, TAU); h.fill(); });
        put(B, 'torch', T.lg(B, 0, 245, 0, 270, [0, '#c8d4e8', 1, '#5a6a8a']));
        put(B, 'head', T.rg(B, 750, 186, 4, 46, [0, SK[0], 0.7, SK[1], 1, SK[2]]));
        inside(B, 'head', function (h) { h.fillStyle = '#7a4a1a'; h.beginPath(); h.moveTo(704, 176); h.quadraticCurveTo(724, 196, 744, 176); h.quadraticCurveTo(764, 192, 782, 176); h.lineTo(782, 160); h.lineTo(704, 160); h.closePath(); h.fill(); });
        put(B, 'hat', T.lg(B, 0, 116, 0, 186, [0, '#f0dca8', 0.6, '#c8aa6a', 1, '#8a6a3a'])); inside(B, 'hat', function (h) { h.fillStyle = '#7a5a2a'; h.beginPath(); h.moveTo(706, 158); h.quadraticCurveTo(744, 150, 784, 156); h.lineTo(786, 166); h.quadraticCurveTo(744, 160, 704, 168); h.closePath(); h.fill(); h.fillStyle = 'rgba(255,255,255,.4)'; h.beginPath(); h.ellipse(730, 128, 16, 6, -0.4, 0, TAU); h.fill(); });
      } });
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.lin(g, 836, 0, 900, 0, [0, 'rgba(255,240,170,.8)', 1, 'rgba(255,240,170,0)']); g.beginPath(); g.moveTo(838, 248); g.lineTo(900, 214); g.lineTo(906, 270); g.closePath(); g.fill(); g.restore();
    g.beginPath(); g.arc(838, 254, 7, 0, TAU); g.fillStyle = '#fffbe0'; g.fill();
    [[730, 196], [762, 194]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 9, 11, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 2, e[1] + 1, 5.5, 0, TAU); g.fillStyle = '#3a2010'; g.fill(); g.beginPath(); g.arc(e[0] + 1, e[1] - 2, 2, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.strokeStyle = '#5a2a0a'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(720, 180); g.quadraticCurveTo(730, 174, 740, 180); g.moveTo(754, 178); g.quadraticCurveTo(764, 172, 774, 178); g.stroke();
    g.beginPath(); g.moveTo(734, 212); g.quadraticCurveTo(748, 216, 764, 210); g.quadraticCurveTo(760, 230, 748, 230); g.quadraticCurveTo(736, 228, 734, 212); g.closePath(); g.fillStyle = '#6a0a14'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    g.save(); g.clip(); g.fillStyle = '#ff8a9a'; g.beginPath(); g.ellipse(749, 230, 9, 6, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(732, 209, 34, 5); g.restore();
    g.fillStyle = 'rgba(255,110,90,.35)'; g.beginPath(); g.ellipse(718, 214, 7, 4, 0, 0, TAU); g.ellipse(776, 210, 6, 4, 0, 0, TAU); g.fill();
  }
  function confetti(g, T, full) { var r = T.rng(17), C = ['#ff5aa8', '#ffd23a', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff'];
    for (var q = 0; q < (full ? 24 : 10); q++) { var x = 740 + r() * 110, y = 60 + r() * 120; g.save(); g.translate(x, y); g.rotate(r() * TAU); g.fillStyle = C[q % 6]; GameLogos.tools.rr(g, -6, -2.5, 12, 5, 2); g.fill(); g.restore(); }
    for (q = 0; q < 10; q++) { var xx = 740 + r() * 130, yy = 420 + r() * 80; g.save(); g.translate(xx, yy); g.rotate(r() * TAU); g.fillStyle = C[q % 6]; GameLogos.tools.rr(g, -6, -2.5, 12, 5, 2); g.fill(); g.restore(); }
    [[264, 92, 15], [674, 74, 13], [348, 84, 10], [338, 476, 13], [268, 488, 9]].forEach(function (s) { g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], s[2], s[2] * 0.45, 4); g.fill(); });
    for (q = 0; q < 12; q++) T.spark(g, 220 + r() * 600, 60 + r() * 440, 3 + r() * 5, '#fff', 0.6);
  }
  function words(g, T, L, cx, y1, s1, y2, s2) {
    function o(c, size) { return { spacing: size * 0.01, dark: L.dark, outline: size * 0.18, depth: size * 0.09, fat: size * 0.006, ring: 'rgba(255,240,200,.9)', glow: 'rgba(255,200,80,.45)', glowBlur: 0.25,
      edge: function () { return sh(c[2], -0.45); }, edgeW: size * 0.07, face: function () { return [0, c[0], 0.5, c[1], 1, c[2]]; } }; }
    var A = o(L.maze, s1), B = o(L.exp, s2); A.rot = -0.04; B.rot = -0.03; A.wave = function (j) { return [4, 0, -2, 0][j] * s1 / 120; }; B.wave = function (j) { return [0, 1, 2, 2, 2, 2, 1, 0][j] * s2 / 100; };
    T.word(g, 'EXPLORER', cx + 4, y2, s2, B); T.gloss(g, 'EXPLORER', cx + 4, y2, s2, B, 0.45);
    T.word(g, 'MAZE', cx - 6, y1, s1, A); T.gloss(g, 'MAZE', cx - 6, y1, s1, A, 0.5);
  }
  function all(g, T, L, full) {
    plate(g, T, L, full); g.save(); T.rr(g, 296, 56, 432, 440, 66); g.clip(); maze(g, T, L, full); g.restore();
    volcano(g, T); tornado(g, T, 210, 270, 0.9); tornado(g, T, 196, 318, 1.05); wave(g, T); ruins(g, T); tiles(g, T); arrowUp(g, T); kid(g, T); confetti(g, T, full);
    words(g, T, L, 512, 270, 124, 374, 92);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 40, 640, [0, L.bg[0], 0.6, L.bg[1], 1, L.bg[2]]); g.fillRect(0, 0, 1024, 572); all(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-156, -26); all(g, T, L, px >= 300); return; }
    if (kind === 'wide') { g.save(); g.translate(18, 4); g.scale(0.43, 0.43); g.translate(-292, -52); plate(g, T, L, false); g.save(); T.rr(g, 296, 56, 432, 440, 66); g.clip(); maze(g, T, L, false); g.restore(); g.restore();
      words(g, T, L, 540, 96, 86, 182, 72); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.86, 0.86); g.translate(-512, -276); plate(g, T, L, false); g.save(); T.rr(g, 296, 56, 432, 440, 66); g.clip(); maze(g, T, L, false); g.restore();
      if (px >= 90) words(g, T, L, 512, 270, 116, 370, 86); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO maze END

// 🏷️ LOGO memory START — 🃏 Memories Match, drawn in code from Aowu's picture (gl-4)
GameLogos.add('memory', (function () {
  var BOX = { scene: [1024, 572], main: [500, 520], wide: [820, 200], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#1c2c4e', '#2a3f66'], icon: ['#3f9af5', '#62b4f8', '#ff9fb4', '#ff7a52'], rim: '#dff0ff', cardA: ['#d6ecff', '#6fb0f5'], cardB: ['#fffaf0', '#f3dcc0'], edge: '#7a2a52',
    w1: ['#fff59a', '#ffd23a', '#ffa41c', '#ff8a14'], w2: ['#ffd0e6', '#ff7ab8', '#f04a98', '#d82a80'], w2b: ['#ffffff', '#fff0f6', '#ffd0e6', '#ffb0d4'], dark: '#6a1f4a', sym: null, heart: ['#ff8a70', '#ff4a78', '#d82a6a'], ring: '#ffe27a' };
    for (var k in o) b[k] = o[k]; return b; }
  var LOOK = {
    classic: mk({}),
    monsters: mk({ icon: ['#7b2ff7', '#6a6af0', '#3fc8c0', '#2ec4b6'], sym: '👾', w2: ['#d8fff8', '#6af0e0', '#2ec4b6', '#1a9a8a'], dark: '#2a1470', edge: '#2a1470', ring: '#b8fff0' }),
    heroes: mk({ icon: ['#e63946', '#f06a4a', '#ffa82a', '#ffb703'], sym: '🦸', w2: ['#fff0c8', '#ffd04a', '#ffb703', '#e08a00'], dark: '#7a1420', edge: '#7a1420' }),
    animals: mk({ icon: ['#4cb963', '#7ad06a', '#d8d04a', '#ffc845'], sym: '🐶', w2: ['#f0ffd8', '#a8e86a', '#4cb963', '#2a8a3a'], dark: '#1f5a2a', edge: '#1f5a2a', ring: '#fff2a0' }),
    people: mk({ icon: ['#ff8fb1', '#e080c0', '#a06ae0', '#7b5fe0'], sym: '😊', dark: '#4a1f7a', edge: '#4a1f7a' }),
    vehicles: mk({ icon: ['#3a86ff', '#3aa8e8', '#1ac8b0', '#06d6a0'], sym: '🚗', w2: ['#e0fff6', '#6af0c8', '#06d6a0', '#04a07a'], dark: '#0f3a7a', edge: '#0f3a7a', ring: '#c8fff0' })
  };
  var TAU = Math.PI * 2;
  function heart(g, T, L, x, y, s, rainbow) {
    function p() { g.beginPath(); g.moveTo(0, s * 0.34); g.bezierCurveTo(-s * 0.62, -s * 0.08, -s * 0.36, -s * 0.52, 0, -s * 0.22); g.bezierCurveTo(s * 0.36, -s * 0.52, s * 0.62, -s * 0.08, 0, s * 0.34); g.closePath(); }
    g.save(); g.translate(x, y); p(); g.fillStyle = rainbow ? T.lin(g, -s * 0.5, 0, s * 0.5, 0, [0, '#ff6a7a', 0.25, '#ffb04a', 0.5, '#ffe45a', 0.72, '#6ad88a', 1, '#5aa8ff']) : T.lin(g, 0, -s * 0.4, 0, s * 0.34, [0, L.heart[0], 0.5, L.heart[1], 1, L.heart[2]]); g.fill();
    g.lineWidth = s * 0.07; g.strokeStyle = L.edge; g.lineJoin = 'round'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-s * 0.2, -s * 0.2, s * 0.1, s * 0.06, -0.6, 0, TAU); g.fill();
    g.fillStyle = '#3a1428'; g.beginPath(); g.arc(-s * 0.13, -s * 0.02, s * 0.04, 0, TAU); g.arc(s * 0.13, -s * 0.02, s * 0.04, 0, TAU); g.fill();
    g.beginPath(); g.arc(0, s * 0.03, s * 0.08, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = s * 0.035; g.lineCap = 'round'; g.strokeStyle = '#3a1428'; g.stroke();
    g.fillStyle = 'rgba(255,110,140,.5)'; g.beginPath(); g.arc(-s * 0.24, s * 0.06, s * 0.05, 0, TAU); g.arc(s * 0.24, s * 0.06, s * 0.05, 0, TAU); g.fill(); g.restore();
  }
  function card(g, T, L, x, y, w, rot, col) {
    var h = w * 1.36; g.save(); g.translate(x, y); g.rotate(rot);
    g.shadowColor = 'rgba(40,20,80,.4)'; g.shadowBlur = w * 0.14; g.shadowOffsetY = w * 0.06; T.rr(g, -w / 2, -h / 2, w, h, w * 0.14); g.fillStyle = '#fff'; g.fill(); g.shadowColor = 'transparent';
    g.lineWidth = w * 0.045; g.strokeStyle = L.edge; g.stroke();
    T.rr(g, -w / 2 + w * 0.08, -h / 2 + w * 0.08, w * 0.84, h - w * 0.16, w * 0.09); g.fillStyle = T.lin(g, 0, -h / 2, 0, h / 2, [0, col[0], 1, col[1]]); g.fill();
    if (L.sym) { g.font = w * 0.56 + 'px ' + T.FONT + ', "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText(L.sym, 0, w * 0.04); }
    else heart(g, T, L, 0, 0, w * 0.9);          // a REAL pair: both cards show the same heart
    g.fillStyle = 'rgba(255,255,255,.35)'; T.rr(g, -w / 2 + w * 0.12, -h / 2 + w * 0.12, w * 0.3, w * 0.12, w * 0.06); g.fill();
    g.restore();
  }
  function pair(g, T, L, cx, cy, k) {
    // golden swirl round both cards
    g.save(); g.translate(cx, cy + 22 * k); g.rotate(-0.08); g.lineCap = 'round';
    [[150, 46, 7, 0.95], [168, 54, 3, 0.6]].forEach(function (e) { g.beginPath(); g.ellipse(0, 0, e[0] * k, e[1] * k, 0, Math.PI * 0.08, Math.PI * 0.98); g.lineWidth = e[2] * k; g.strokeStyle = L.ring; g.globalAlpha = e[3]; g.shadowColor = L.ring; g.shadowBlur = 12 * k; g.stroke(); }); g.restore();
    card(g, T, L, cx - 62 * k, cy, 118 * k, -0.2, L.cardA); card(g, T, L, cx + 62 * k, cy - 6 * k, 118 * k, 0.17, L.cardB);
    g.save(); g.translate(cx, cy + 22 * k); g.rotate(-0.08); g.lineCap = 'round'; g.beginPath(); g.ellipse(0, 0, 150 * k, 46 * k, 0, Math.PI * 1.06, Math.PI * 1.94, true); g.lineWidth = 6 * k; g.strokeStyle = L.ring; g.shadowColor = L.ring; g.shadowBlur = 12 * k; g.globalAlpha = 0.9; g.stroke(); g.restore();
    // the spark where they meet + wiggle lines
    g.save(); g.shadowColor = '#fff6b0'; g.shadowBlur = 20 * k; T.spark(g, cx, cy - 18 * k, 34 * k, '#fffbe0', 1); T.spark(g, cx, cy - 18 * k, 18 * k, '#ffe14a', 1); g.restore();
    g.strokeStyle = L.edge; g.lineWidth = 3 * k; g.lineCap = 'round'; [[-150, -52, -138, -30], [-160, -30, -150, -12], [150, -62, 140, -40], [162, -38, 152, -20]].forEach(function (q) { g.beginPath(); g.moveTo(cx + q[0] * k, cy + q[1] * k); g.lineTo(cx + q[2] * k, cy + q[3] * k); g.stroke(); });
  }
  function confetti(g, T, x, y, w, h, seed, n) { var r = T.rng(seed), cols = ['#ffd23e', '#ff7ab8', '#7ad0ff', '#ffffff', '#ff9a4a', '#a8e86a']; for (var i = 0; i < n; i++) { var px = x + r() * w, py = y + r() * h, s = 3 + r() * 6; g.save(); g.translate(px, py); g.rotate(r() * 6); g.globalAlpha = 0.6 + r() * 0.4; g.fillStyle = cols[i % 6]; if (i % 3 === 0) T.spark(g, 0, 0, s * 1.3, cols[i % 6], 0.95); else if (i % 3 === 1) g.fillRect(-s, -s * 0.4, s * 2, s * 0.8); else { g.beginPath(); g.arc(0, 0, s * 0.45, 0, TAU); g.fill(); } g.restore(); } }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    function o(face, sz) { return { spacing: sz * 0.012, dark: L.dark, outline: sz * 0.2, depth: sz * 0.085, face: face, inner: 'rgba(255,255,255,.5)' }; }
    function white(str, x, y, sz, op) { g.save(); g.font = '700 ' + sz + 'px ' + T.FONT; g.lineJoin = 'round'; g.restore(); var w = { spacing: op.spacing, dark: '#ffffff', outline: sz * 0.36, depth: op.depth, face: function () { return [0, '#fff', 1, '#fff']; } }; T.word(g, str, x, y, sz, w); }
    var f1 = function () { return [0, L.w1[0], 0.3, L.w1[1], 0.7, L.w1[2], 1, L.w1[3]]; }, f2 = function (j) { var c = j < 2 ? L.w2 : L.w2b; return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; };
    var s1 = 70 * k, s2 = 76 * k, a = o(f1, s1), b = o(f2, s2);
    if (oneLine) { g.font = '700 ' + s1 + 'px ' + T.FONT; var wa = g.measureText('Memories').width + 7 * s1 * 0.012; g.font = '700 ' + s2 + 'px ' + T.FONT; var wb = g.measureText('Match').width + 4 * s2 * 0.012, gap = 22 * k, x0 = cx - (wa + gap + wb) / 2; white('Memories', x0 + wa / 2, y1, s1, a); white('Match', x0 + wa + gap + wb / 2, y1, s2, b); T.word(g, 'Memories', x0 + wa / 2, y1, s1, a); T.gloss(g, 'Memories', x0 + wa / 2, y1, s1, a, 0.5); T.word(g, 'Match', x0 + wa + gap + wb / 2, y1, s2, b); T.gloss(g, 'Match', x0 + wa + gap + wb / 2, y1, s2, b, 0.5); return; }
    white('Memories', cx, y1, s1, a); white('Match', cx, y2, s2, b);
    T.word(g, 'Memories', cx, y1, s1, a); T.gloss(g, 'Memories', cx, y1, s1, a, 0.5); T.word(g, 'Match', cx, y2, s2, b); T.gloss(g, 'Match', cx, y2, s2, b, 0.5);
  }
  function icon(g, T, L, x, y, S) {
    g.save(); g.shadowColor = 'rgba(10,20,60,.55)'; g.shadowBlur = 30; g.shadowOffsetY = 12; T.rr(g, x, y, S, S * 1.04, S * 0.19); g.fillStyle = T.lin(g, x, y, x + S, y + S, [0, L.icon[0], 0.4, L.icon[1], 0.72, L.icon[2], 1, L.icon[3]]); g.fill(); g.shadowColor = 'transparent';
    g.save(); T.rr(g, x, y, S, S * 1.04, S * 0.19); g.clip(); g.fillStyle = T.rad(g, x + S * 0.5, y + S * 0.38, 10, S * 0.6, [0, 'rgba(255,250,220,.6)', 0.6, 'rgba(255,255,255,.1)', 1, 'rgba(255,255,255,0)']); g.fillRect(x, y, S, S * 1.04); confetti(g, T, x, y, S, S * 1.04, 14, 110); g.restore();
    T.rr(g, x + 2, y + 2, S - 4, S * 1.04 - 4, S * 0.185); g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.55)'; g.stroke(); g.restore();
  }
  function emblem(g, T, L) { icon(g, T, L, 298, 62, 428); pair(g, T, L, 512, 218, 1.28); words(g, T, L, 512, 404, 476, 1.08); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, L.sky[0], 1, L.sky[1]]); g.fillRect(0, 0, 1024, 572); g.fillStyle = 'rgba(255,255,255,.04)'; T.rr(g, 232, -40, 560, 660, 60); g.fill(); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-262, -30); emblem(g, T, L); return; }
    if (kind === 'wide') { card(g, T, L, 66, 104, 74, -0.2, L.cardA); card(g, T, L, 132, 100, 74, 0.17, L.cardB); T.spark(g, 99, 90, 20, '#ffe14a', 1); words(g, T, L, 502, 128, 0, 1.0, true); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.84, 0.84); g.translate(-512, -285); icon(g, T, L, 298, 62, 428); if (px >= 90) { pair(g, T, L, 512, 232, 1.05); words(g, T, L, 512, 410, 478, 1); } else pair(g, T, L, 512, 290, 1.4); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO memory END

// 🏷️ LOGO pinball START — 🎯 Pinball, drawn in code from Aowu's picture (gl-27, round 9). A chrome ball smashing through glass in a gold + neon framed
// icon, a "JACKPOT!" marquee with bulbs, stars, coins and fireworks above it, chrome "PINBALL" (silver → blue → red, the arcade chrome look); the table's
// flippers, slingshots, lanes and arrows either side on `scene` + `main` only. Looks = Pinball.html DESIGNS (carnival · castle · space · sea · zombie ·
// sport · monster): table, icon and marquee colours.
GameLogos.add('pinball', (function () {
  var BOX = { scene: [1024, 572], main: [900, 540], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(bg, wall, edge) { return { bg: bg, wall: wall, edge: edge, icon: [sh0(bg[1], -0.55), '#04060e'] }; }
  function sh0(c, f) { return GameLogos.tools.shade(c, f); }
  var LOOK = { classic: { bg: ['#5a2ac8', '#12083a'], wall: '#2a2a8a', edge: '#3ad8ff', icon: ['#2a2a7a', '#08061e'] },
    carnival: mk(['#FFB86B', '#E8445A'], '#8E1238', '#FFD166'), castle: mk(['#3B2A7A', '#140C33'], '#6C5BB3', '#D9CCFF'), space: mk(['#1B1446', '#03030F'], '#0E6E8C', '#18E7FF'),
    sea: mk(['#14B4D6', '#062A57'], '#0B5E7A', '#7FF6FF'), zombie: mk(['#5A2E80', '#120A1F'], '#3E6B2A', '#B6FF5C'), sport: mk(['#45C463', '#1A6A30'], '#1F4FA8', '#FFFFFF'), monster: mk(['#3BC9A0', '#123B4A'], '#6B2FA8', '#FFD84D') };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#05040c', PX = 262, PY = 34, PW = 502, PH = 502;
  /* ---------- the table either side ---------- */
  function table(g, T, L) {
    g.fillStyle = T.rad(g, 512, 300, 40, 640, [0, L.bg[0], 0.6, sh(L.bg[0], -0.25), 1, L.bg[1]]); g.beginPath(); g.moveTo(60, 60); g.lineTo(964, 60); g.lineTo(1024, 572); g.lineTo(0, 572); g.closePath(); g.fill();
    g.save(); g.globalAlpha = 0.5; [[160, 300, '#ff4fd8'], [860, 300, '#3ad8ff'], [130, 120, '#ffd23a'], [890, 110, '#7ae84a']].forEach(function (q) { g.fillStyle = T.rad(g, q[0], q[1], 4, 150, [0, q[2], 1, 'rgba(0,0,0,0)']); g.fillRect(q[0] - 150, q[1] - 150, 300, 300); }); g.restore();
    var LC = ['#ff5aa8', '#ffd23a', '#38d0ff', '#7ae84a', '#ff8a3a']; g.save(); [[96, 330, 0], [904, 330, 1]].forEach(function (b) { for (var i = 0; i < 6; i++) { var c = LC[(i + b[2]) % 5]; g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 10; g.beginPath(); g.arc(b[0] + (b[2] ? -i * 4 : i * 4), b[1] - i * 22, 6, 0, TAU); g.fill(); } }); g.restore();
    g.save(); g.strokeStyle = sh(L.wall, -0.3); g.lineWidth = 26; g.beginPath(); g.moveTo(70, 60); g.lineTo(10, 572); g.moveTo(954, 60); g.lineTo(1014, 572); g.stroke(); g.strokeStyle = L.edge; g.lineWidth = 4; g.shadowColor = L.edge; g.shadowBlur = 14; g.stroke(); g.beginPath(); g.moveTo(88, 60); g.lineTo(30, 572); g.moveTo(936, 60); g.lineTo(994, 572); g.strokeStyle = '#ff4fd8'; g.shadowColor = '#ff4fd8'; g.lineWidth = 3; g.stroke(); g.restore();
    function flipper(x, y, a, s) { g.save(); g.translate(x, y); g.rotate(a); g.scale(s, 1); g.beginPath(); g.arc(0, 0, 18, Math.PI / 2, Math.PI * 1.5); g.lineTo(96, -6); g.arc(96, 0, 6, -Math.PI / 2, Math.PI / 2); g.closePath(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
      g.fillStyle = T.lin(g, 0, -18, 0, 18, [0, '#fff2a0', 0.5, '#ffb01a', 1, '#c86a04']); g.fill(); g.beginPath(); g.arc(0, 0, 8, 0, TAU); g.fillStyle = '#c8ccd8'; g.fill(); g.restore(); }
    function sling(x, y, flip) { g.save(); g.translate(x, y); g.scale(flip, 1); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -96); g.lineTo(44, 4); g.closePath(); g.lineWidth = 8; g.strokeStyle = '#e8eef8'; g.lineJoin = 'round'; g.stroke(); g.fillStyle = T.lin(g, 0, -96, 0, 0, [0, '#ff5aa8', 1, '#8a2ad8']); g.fill(); g.fillStyle = '#ffd23a'; T.star(g, 14, -26, 13, 6); g.fill(); g.restore(); }
    function chev(x, y, a, c) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 10; for (var i = 0; i < 3; i++) { g.beginPath(); g.moveTo(i * 18, -10); g.lineTo(i * 18 + 12, 0); g.lineTo(i * 18, 10); g.lineTo(i * 18 + 6, 0); g.closePath(); g.fill(); } g.restore(); }
    function bumper(x, y, r, c) { g.save(); g.shadowColor = c; g.shadowBlur = 22; g.beginPath(); g.ellipse(x, y - 4, r + 4, r * 0.6 + 4, 0, 0, TAU); g.fillStyle = c; g.globalAlpha = 0.5; g.fill(); g.restore(); g.beginPath(); g.ellipse(x, y, r, r * 0.6, 0, 0, TAU); g.fillStyle = sh(c, -0.4); g.fill(); g.beginPath(); g.ellipse(x, y - 6, r, r * 0.6, 0, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.3, y - 10, 2, r, [0, '#fff', 0.4, c, 1, sh(c, -0.3)]); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); }
    sling(130, 400, 1); sling(894, 400, -1); flipper(160, 470, 0.45, 1); flipper(864, 470, Math.PI - 0.45, 1);
    chev(176, 238, -0.5, '#ff5aa8'); chev(190, 270, -0.5, '#ffd23a'); chev(810, 236, -2.6, '#5ad84a'); chev(800, 268, -2.6, '#38d0ff'); bumper(236, 140, 24, '#ff5a5a'); bumper(212, 190, 18, '#ffd23a'); bumper(790, 150, 22, '#5ad84a'); bumper(812, 200, 16, '#38d0ff'); bumper(250, 330, 16, '#ff5aa8'); bumper(776, 330, 16, '#ffd23a');
    g.save(); g.lineCap = 'round'; g.strokeStyle = '#ff5a3a'; g.lineWidth = 10; g.shadowColor = '#ff5a3a'; g.shadowBlur = 12; g.beginPath(); g.moveTo(820, 200); g.lineTo(846, 70); g.stroke(); g.beginPath(); g.moveTo(828, 70); g.lineTo(848, 50); g.lineTo(866, 76); g.stroke();
    g.strokeStyle = '#3a8aff'; g.shadowColor = '#3a8aff'; g.beginPath(); g.moveTo(870, 260); g.lineTo(876, 160); g.stroke(); g.beginPath(); g.moveTo(858, 170); g.lineTo(876, 150); g.lineTo(894, 172); g.stroke();
    g.strokeStyle = '#38d0ff'; g.shadowColor = '#38d0ff'; g.beginPath(); g.moveTo(170, 432); g.quadraticCurveTo(210, 420, 250, 426); g.stroke(); g.beginPath(); g.moveTo(236, 412); g.lineTo(254, 426); g.lineTo(236, 440); g.stroke(); g.restore();
    [[140, 200], [880, 240], [850, 340]].forEach(function (s) { g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], 20, 9); g.fill(); g.lineWidth = 3; g.strokeStyle = '#8a5a04'; g.stroke(); });
    [[118, 228], [802, 104], [70, 160], [950, 180], [210, 520], [820, 520]].forEach(function (p, i) { T.spark(g, p[0], p[1], 20 + (i % 2) * 10, ['#fff2a0', '#ffd0f4', '#c8f8ff'][i % 3], 1); });
    var rr = T.rng(44), CC = ['#ff5aa8', '#ffd23a', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff']; for (var q = 0; q < 26; q++) { var cx = r2(rr), cy = 80 + rr() * 470; g.save(); g.translate(cx, cy); g.rotate(rr() * TAU); g.fillStyle = CC[q % 6]; GameLogos.tools.rr(g, -6, -2.5, 12, 5, 2); g.fill(); g.restore(); }
    function r2(r) { var v = r(); return v < 0.5 ? 70 + v * 2 * 180 : 774 + (v - 0.5) * 2 * 180; }
  }
  /* ---------- the icon ---------- */
  function plate(g, T, L, glow) {
    g.save(); T.rr(g, PX, PY, PW, PH, 64); g.fillStyle = T.rad(g, 512, 280, 20, 360, [0, L.icon[0], 1, L.icon[1]]); if (glow) { g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; } g.fill(); g.restore();
  }
  function rim(g, T, L, glow) { g.save(); T.rr(g, PX - 8, PY - 8, PW + 16, PH + 16, 72); g.lineWidth = 5; g.strokeStyle = '#ff4fd8'; if (glow) { g.shadowColor = '#ff4fd8'; g.shadowBlur = 22; } g.stroke(); g.restore(); g.save(); T.rr(g, PX, PY, PW, PH, 64); g.lineWidth = 12; g.strokeStyle = T.lin(g, PX, PY, PX + PW, PY + PH, [0, '#ffe08a', 0.3, '#c8901a', 0.55, '#fff2c0', 1, '#c8901a']); g.stroke();
    T.rr(g, PX + 9, PY + 9, PW - 18, PH - 18, 56); g.lineWidth = 4; g.strokeStyle = L.edge; if (glow) { g.shadowColor = L.edge; g.shadowBlur = 16; } g.stroke(); g.restore(); }
  function burst(g, T, full) {
    g.save(); var RC = ['rgba(255,220,90,.42)', 'rgba(255,90,200,.34)', 'rgba(70,220,255,.34)', 'rgba(255,140,40,.42)', 'rgba(150,110,255,.3)'];
    for (var i = 0; i < 20; i++) { var a = i * TAU / 20 + 0.08, w = 0.07 + (i % 3) * 0.03; g.beginPath(); g.moveTo(522, 272); g.arc(522, 272, 330, a - w, a + w); g.closePath(); g.fillStyle = RC[i % 5]; g.fill(); }
    g.fillStyle = T.rad(g, 512, 285, 6, 230, [0, 'rgba(255,255,230,1)', 0.25, 'rgba(255,200,80,.95)', 0.5, 'rgba(255,110,40,.55)', 0.8, 'rgba(220,40,160,.25)', 1, 'rgba(120,40,255,0)']); g.beginPath(); g.arc(512, 285, 230, 0, TAU); g.fill();
    g.lineCap = 'round'; g.shadowColor = '#ffd23a'; g.shadowBlur = 16; [[292, 392, '#fff2a0', 9], [318, 362, '#ffb01a', 7], [346, 412, '#ff7ad8', 6], [306, 338, '#7af4ff', 5], [366, 380, '#ffd23a', 8]].forEach(function (p) {
      g.strokeStyle = T.lin(g, p[0], p[1], 470, 300, [0, 'rgba(255,255,255,0)', 1, p[2]]); g.lineWidth = p[3]; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(470, 300); g.stroke(); }); g.shadowBlur = 0;
    var r0 = T.rng(9), SC = ['#ffd23a', '#ff5aa8', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff', '#ffffff'];
    for (i = 0; i < (full ? 70 : 34); i++) { var aa = r0() * TAU, d = 90 + r0() * 170, x = 522 + Math.cos(aa) * d, y = 272 + Math.sin(aa) * d * 0.9; g.fillStyle = SC[i % 7]; g.shadowColor = SC[i % 7]; g.shadowBlur = 8; g.beginPath(); g.arc(x, y, 1.5 + r0() * 3.5, 0, TAU); g.fill(); }
    g.restore();
    // cracked glass: rays + rings of short segments
    var r = T.rng(27); g.save(); g.strokeStyle = 'rgba(200,245,255,.95)'; g.shadowColor = '#7af4ff'; g.shadowBlur = 6; g.lineWidth = 2.4;
    for (var i = 0; i < 18; i++) { var a = i * TAU / 18 + r() * 0.2, l0 = 80, l1 = 160 + r() * 90; g.beginPath(); g.moveTo(522 + Math.cos(a) * l0, 272 + Math.sin(a) * l0); var px = 522 + Math.cos(a) * l1, py = 272 + Math.sin(a) * l1; g.lineTo(px, py); g.stroke(); }
    [110, 150].forEach(function (R) { for (var j = 0; j < 18; j++) { var a0 = j * TAU / 18, a1 = a0 + TAU / 18; if (r() < 0.35) continue; g.beginPath(); g.moveTo(522 + Math.cos(a0) * R, 272 + Math.sin(a0) * R); g.lineTo(522 + Math.cos(a1) * (R + 8), 272 + Math.sin(a1) * (R + 8)); g.stroke(); } });
    for (i = 0; i < (full ? 26 : 12); i++) { var sx = 330 + r() * 380, sy = 140 + r() * 260; g.fillStyle = ['rgba(200,240,255,.9)', 'rgba(255,200,240,.85)', 'rgba(255,240,180,.9)'][i % 3]; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 6 + r() * 8, sy + r() * 6); g.lineTo(sx + r() * 4, sy + 8 + r() * 6); g.closePath(); g.fill(); }
    g.restore();
  }
  function ball(g, T) { var x = 522, y = 272, R = 74;
    g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 20; g.shadowOffsetY = 10; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = T.rad(g, x - 26, y - 30, 4, R * 1.1, [0, '#ffffff', 0.16, '#eef2fa', 0.42, '#9aa6bc', 0.7, '#3a4256', 0.9, '#141a28', 1, '#4a5a7a']); g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(x - 28, y - 34, 20, 11, -0.6, 0, TAU); g.fill(); g.fillStyle = 'rgba(160,200,255,.45)'; g.beginPath(); g.ellipse(x + 18, y + 40, 36, 12, -0.3, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(x, y, R, 0, TAU); g.clip(); g.globalAlpha = 0.35; [['#ff5aa8', 0.3], ['#38d0ff', 1.6], ['#ffd23a', 2.6]].forEach(function (q) { g.fillStyle = q[0]; g.beginPath(); g.ellipse(x + Math.cos(q[1]) * R * 0.6, y + Math.sin(q[1]) * R * 0.6, R * 0.5, R * 0.18, q[1] + 1.4, 0, TAU); g.fill(); }); g.restore();
    g.lineWidth = 3; g.strokeStyle = '#05060c'; g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke(); g.save(); g.lineWidth = 4; g.strokeStyle = 'rgba(255,240,180,.8)'; g.shadowColor = '#ffd23a'; g.shadowBlur = 20; g.beginPath(); g.arc(x, y, R + 3, Math.PI * 0.9, Math.PI * 1.6); g.stroke(); g.restore(); }
  function marquee(g, T, L, full) {
    if (full) { g.save(); g.lineCap = 'round'; [['#ff3a3a', -1.9], ['#ffd23a', -1.6], ['#ff5aa8', -1.3], ['#ffb01a', -1.1]].forEach(function (q, i) { g.strokeStyle = q[0]; g.lineWidth = 16; g.beginPath(); g.moveTo(512, 140); g.lineTo(512 + Math.cos(q[1]) * 110 - 30 + i * 10, 140 + Math.sin(q[1]) * 70); g.stroke(); }); g.restore();
      [[420, 84, 18], [600, 92, 18], [454, 70, 13], [636, 108, 14], [330, 70, 12], [700, 66, 12]].forEach(function (s, i) { g.fillStyle = ['#ffd23a', '#ff5aa8', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff'][i]; T.star(g, s[0], s[1], s[2], s[2] * 0.45); g.fill(); g.lineWidth = 3; g.strokeStyle = '#a8300a'; g.stroke(); });
      [[466, 52], [566, 52], [688, 104], [668, 210], [340, 120], [320, 200], [700, 170], [512, 46]].forEach(function (c) { g.beginPath(); g.ellipse(c[0], c[1], 13, 15, 0, 0, TAU); g.fillStyle = T.lin(g, c[0] - 13, c[1] - 15, c[0] + 13, c[1] + 15, [0, '#fff2a0', 0.5, '#ffc21a', 1, '#c8800a']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#8a5a04'; g.stroke(); });
      g.save(); [[360, 128, 46], [664, 132, 42], [430, 64, 26], [600, 58, 24]].forEach(function (f, k) { for (var i = 0; i < 18; i++) { var a = i * TAU / 18; g.strokeStyle = [['#ffd23a', '#ff5aa8', '#fff'], ['#38d0ff', '#ffd23a', '#fff'], ['#7ae84a', '#ff8a3a', '#fff'], ['#b86aff', '#ff5aa8', '#fff']][k][i % 3]; g.lineWidth = 3; g.shadowColor = g.strokeStyle; g.shadowBlur = 8; g.beginPath(); g.moveTo(f[0] + Math.cos(a) * f[2] * 0.3, f[1] + Math.sin(a) * f[2] * 0.3); g.lineTo(f[0] + Math.cos(a) * f[2], f[1] + Math.sin(a) * f[2]); g.stroke(); } }); g.restore(); }   /* gl-r16d: the fireworks' white shadow no longer leaks onto JACKPOT */
    g.save(); g.beginPath(); g.moveTo(374, 140); g.lineTo(480, 140); g.lineTo(512, 112); g.lineTo(544, 140); g.lineTo(650, 140); g.lineTo(650, 200); g.lineTo(374, 200); g.closePath();
    g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); g.fillStyle = T.lin(g, 0, 112, 0, 200, [0, '#1c1c26', 1, '#050508']); g.fill(); g.lineWidth = 5; g.strokeStyle = '#ff2a3a'; g.shadowColor = 'rgba(255,42,58,.55)'; g.shadowBlur = 4; g.stroke();   /* gl-r16d: sign glow dimmed (Aowu 15:19) */ g.shadowBlur = 0;
    var pts = []; for (var i = 0; i <= 12; i++) pts.push([380 + i * 22.5, 146], [380 + i * 22.5, 194]); [[490, 132], [512, 118], [534, 132]].forEach(function (p) { pts.push(p); });
    pts.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 3.5, 0, TAU); g.fillStyle = '#f4e2a0'; g.shadowColor = 'rgba(255,210,58,.5)'; g.shadowBlur = 2; g.fill(); }); g.restore();
    var o = { spacing: 1.5, dark: '#3a0604', outline: 4.4, depth: 2.5, ring: '#fff2a0', glow: 'rgba(255,200,70,.16)', glowBlur: 0.1, face: function () { return [0, '#fffbe0', 0.45, '#ffd23a', 1, '#ff7a0a']; } };
    T.word(g, 'JACKPOT!', 512, 189, 47, o); T.gloss(g, 'JACKPOT!', 512, 189, 47, o, 0.45);
  }
  function word(g, T, L, cx, base, size, glow) {
    if (glow) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, cx, base - size * 0.35, 10, size * 2.6, [0, 'rgba(255,140,60,.45)', 0.5, 'rgba(255,60,160,.2)', 1, 'rgba(255,60,160,0)']); g.fillRect(cx - size * 3, base - size * 1.6, size * 6, size * 2.4); g.restore(); }
    var o = { clean: true, spacing: size * 0.01, dark: '#03050f', outline: size * 0.16,   /* gl-r19: clean B (no Fredoka notch) */
      depth: size * 0.08, fat: size * 0.004, ring: '#7af0ff', skew: -0.14, glow: glow ? 'rgba(60,200,255,.85)' : null, glowBlur: 0.3, glowN: 2,
      edge: function () { return '#0a1a4a'; }, edgeW: size * 0.04, face: function () { return [0, '#ffffff', 0.3, '#b8d8ff', 0.5, '#2a6ae0', 0.52, '#ff8a9a', 0.75, '#e8203a', 1, '#8a0a20']; } };
    T.word(g, 'PINBALL', cx, base, size, o); T.gloss(g, 'PINBALL', cx, base, size, o, 0.5);
  }
  function icon(g, T, L, full) { plate(g, T, L, full); g.save(); T.rr(g, PX, PY, PW, PH, 64); g.clip(); burst(g, T, full); ball(g, T); marquee(g, T, L, full); g.restore(); rim(g, T, L, full); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = '#05050c'; g.fillRect(0, 0, 1024, 572); table(g, T, L); icon(g, T, L, true); word(g, T, L, 514, 458, 112, true); return; }
    if (kind === 'main') { g.translate(-62, -16); g.save(); T.rr(g, 66, 40, 892, 506, 70); g.clip(); table(g, T, L); g.restore(); icon(g, T, L, px >= 300); word(g, T, L, 514, 458, 112, px >= 300); return; }
    if (kind === 'wide') { g.save(); g.translate(22, 14); g.scale(0.34, 0.34); g.translate(-PX, -PY); icon(g, T, L, false); g.restore(); word(g, T, L, 540, 140, 108, false); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.76, 0.76); g.translate(-513, -285); icon(g, T, L, false); if (px >= 90) word(g, T, L, 514, 458, 112, false); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO pinball END

// 🏷️ LOGO pokadif START — 🔍 Pokadif, drawn in code from Aowu's picture (gl-8)
GameLogos.add('pokadif', (function () {
  var BOX = { scene: [1024, 572], main: [700, 560], wide: [800, 210], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#2c3038', '#1c1f26', '#121419'], top: ['#ffd84a', '#ffb21a', '#f08a0a'], band: ['#2fb0b8', '#1a8a94', '#126a74'], ink: '#2a1a0a', lens: ['#9fd8ff', '#2f7af0', '#12245a'], hat: ['#b08a5a', '#7a5a34'],
    w: ['#fff59a', '#ffd23a', '#ffa41c', '#f07a0a'], dark: '#1a1a22', accent: ['#ff7a3a', '#3fd0c8', '#5a8af5', '#6ad04a'] }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    dino: mk({ sky: ['#21452a', '#17331f', '#0e2014'], band: ['#6ab84a', '#3f8a2a', '#2a6a1a'], accent: ['#f0c84a', '#6ab84a', '#a8782a', '#cfe8b0'] }),
    sea: mk({ sky: ['#123a60', '#0b2a48', '#061a30'], top: ['#8af0ff', '#3fc8e8', '#1a8ac8'], band: ['#2a6ae0', '#1a4ab0', '#12347a'], w: ['#eaffff', '#8af0ff', '#3fc8e8', '#1a8ac8'], accent: ['#a8e2ff', '#3fd8c0', '#5a8af5', '#fff2a0'] }),
    disco: mk({ sky: ['#2b1552', '#1e0d3a', '#120624'], top: ['#ff9ae8', '#f04ac8', '#b81a9a'], band: ['#8a3ff0', '#5a1fc0', '#3a0f8a'], w: ['#fff0ff', '#ff9ae8', '#f04ac8', '#c81aa8'], accent: ['#ffb8f0', '#3fd8ff', '#ffe27a', '#c05af0'] }),
    robot: mk({ sky: ['#1f3242', '#15222e', '#0c141c'], top: ['#e8f0f8', '#b8c8d8', '#8a9ab8'], band: ['#5a7aa8', '#3a5a88', '#2a3f66'], w: ['#ffffff', '#d8e8f8', '#9ab8d8', '#6a8ab0'], accent: ['#9fe6f2', '#5ff0ff', '#c8d8e8', '#ffd23e'] }),
    space: mk({ sky: ['#121640', '#070a24', '#030414'], top: ['#c8a8ff', '#8a5af0', '#5a2ad0'], band: ['#3a3ac8', '#2a1f9a', '#1a1470'], w: ['#f8f0ff', '#c8a8ff', '#8a5af0', '#5a2ad0'], accent: ['#c9c2ff', '#7af0ff', '#ffe27a', '#ff8ad8'] }),
    sky: mk({ sky: ['#5aa8e8', '#3b82be', '#2b6fa8'], band: ['#5aa8f0', '#2a7ae0', '#1a5ab8'], dark: '#12305a', accent: ['#ffffff', '#fff2b8', '#a8d8ff', '#ffb0d8'] }) };
  var TAU = Math.PI * 2;
  function shutter(g, T, cx, cy, R, ring, dark) {   // the camera-shutter "O"
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fillStyle = dark; g.fill();
    g.beginPath(); g.arc(cx, cy, R * 0.88, 0, TAU); g.fillStyle = T.lin(g, cx, cy - R, cx, cy + R, ring); g.fill();
    g.beginPath(); g.arc(cx, cy, R * 0.62, 0, TAU); g.fillStyle = dark; g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, R * 0.58, 0, TAU); g.clip(); for (var i = 0; i < 6; i++) { var a = i * TAU / 6 + 0.3; g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 0.62, cy + Math.sin(a) * R * 0.62); g.lineTo(cx + Math.cos(a + 1.05) * R * 0.62, cy + Math.sin(a + 1.05) * R * 0.62); g.lineTo(cx + Math.cos(a + 2.3) * R * 0.2, cy + Math.sin(a + 2.3) * R * 0.2); g.closePath(); g.fillStyle = i % 2 ? '#3a3f4c' : '#565c6c'; g.fill(); g.lineWidth = R * 0.03; g.strokeStyle = dark; g.stroke(); } g.restore();
    g.beginPath(); g.arc(cx, cy, R * 0.2, 0, TAU); g.fillStyle = '#0c0e14'; g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(cx - R * 0.26, cy - R * 0.3, R * 0.1, 0, TAU); g.fill(); g.restore();
  }
  function word(g, T, L, cx, base, size) {   // P + shutter + K A D i F
    var o = { spacing: size * 0.02, dark: L.dark, outline: size * 0.2, depth: size * 0.1, glow: 'rgba(255,190,60,.35)', face: function () { return [0, L.w[0], 0.3, L.w[1], 0.7, L.w[2], 1, L.w[3]]; }, inner: 'rgba(255,255,255,.5)' };
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var wP = g.measureText('P').width, wO = size * 0.78, wR = 0; 'KADiF'.split('').forEach(function (c) { wR += g.measureText(c).width + size * 0.02; }); g.restore();
    var W = wP + wO + wR, x0 = cx - W / 2;
    T.word(g, 'KADiF', x0 + wP + wO + wR / 2, base, size, o); T.gloss(g, 'KADiF', x0 + wP + wO + wR / 2, base, size, o, 0.5);
    T.word(g, 'P', x0 + wP / 2, base, size, o); T.gloss(g, 'P', x0 + wP / 2, base, size, o, 0.5);
    var oy = base - size * 0.34; g.save(); g.beginPath(); g.arc(x0 + wP + wO / 2, oy + size * 0.05, size * 0.44, 0, TAU); g.fillStyle = L.dark; g.fill(); g.restore();
    shutter(g, T, x0 + wP + wO / 2, oy, size * 0.36, [0, L.w[0], 0.5, L.w[1], 1, L.w[3]], L.dark); return W;
  }
  function hat(g, T, L) {   // deerstalker with a little houndstooth
    g.save(); g.lineJoin = 'round';
    function crown() { g.beginPath(); g.moveTo(-86, -128); g.bezierCurveTo(-80, -196, 80, -196, 86, -128); g.closePath(); }
    g.beginPath(); g.moveTo(-70, -132); g.quadraticCurveTo(-132, -134, -120, -112); g.quadraticCurveTo(-96, -108, -70, -118); g.closePath(); g.fillStyle = L.hat[1]; g.fill(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();
    g.beginPath(); g.moveTo(70, -132); g.quadraticCurveTo(132, -134, 120, -112); g.quadraticCurveTo(96, -108, 70, -118); g.closePath(); g.fill(); g.stroke();
    crown(); g.fillStyle = T.lin(g, 0, -196, 0, -128, [0, L.hat[0], 1, L.hat[1]]); g.fill();
    g.save(); crown(); g.clip(); g.fillStyle = 'rgba(60,36,12,.4)'; for (var y = -196; y < -120; y += 14) for (var x = -90 + ((y / 14) & 1) * 7; x < 90; x += 14) { g.fillRect(x, y, 7, 7); } g.restore();
    crown(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();
    T.rr(g, -90, -140, 180, 18, 8); g.fillStyle = L.hat[1]; g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, -190, 16, 10, 0, 0, TAU); g.fillStyle = L.hat[0]; g.fill(); g.stroke(); g.beginPath(); g.moveTo(-14, -190); g.quadraticCurveTo(0, -206, 14, -190); g.lineWidth = 4; g.stroke();
    g.restore();
  }
  function glove(g, L, x, y, s, rot, point) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; g.fillStyle = '#fff'; g.strokeStyle = L.ink; g.lineWidth = 5;
    if (point) { T_rr(g, -8, -62, 16, 44, 8); g.fill(); g.stroke(); }
    g.beginPath(); g.ellipse(0, 0, 24, 22, 0, 0, TAU); g.fill(); g.stroke(); T_rr(g, -20, 16, 40, 16, 6); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(-22, -4, 8, 12, -0.5, 0, TAU); g.fill(); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(-6, -2); g.lineTo(-6, 10); g.moveTo(4, -2); g.lineTo(4, 10); g.stroke(); g.restore();
  }
  function T_rr(g, x, y, w, h, r) { GameLogos.tools.rr(g, x, y, w, h, r); }
  function camera(g, T, L, cx, cy, k, bare) {
    g.save(); g.translate(cx, cy); g.scale(k, k); g.lineJoin = 'round'; g.lineCap = 'round';
    // arms
    if (!bare) { g.beginPath(); g.moveTo(-130, 40); g.quadraticCurveTo(-170, 50, -160, 10); g.moveTo(130, 30); g.quadraticCurveTo(170, 20, 150, -40); g.lineWidth = 16; g.strokeStyle = L.ink; g.stroke(); g.lineWidth = 8; g.strokeStyle = '#3a3f4c'; g.stroke(); }
    // top hump + body
    T.rr(g, -70, -128, 140, 60, 18); g.fillStyle = T.lin(g, 0, -128, 0, -70, [0, L.top[0], 1, L.top[1]]); g.fill(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();
    function body() { T.rr(g, -134, -92, 268, 176, 30); } body(); g.fillStyle = T.lin(g, 0, -92, 0, 84, [0, L.top[0], 0.5, L.top[1], 1, L.top[2]]); g.fill();
    g.save(); body(); g.clip(); g.fillStyle = T.lin(g, 0, -10, 0, 84, [0, L.band[0], 0.6, L.band[1], 1, L.band[2]]); g.fillRect(-140, -6, 280, 96); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-140, -90, 280, 14); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-140, -10, 280, 6); g.restore();
    body(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();
    T.rr(g, 78, -104, 34, 14, 6); g.fillStyle = '#ff7a3a'; g.fill(); g.lineWidth = 4; g.stroke(); T.rr(g, -110, -78, 40, 22, 6); g.fillStyle = '#eaf6ff'; g.fill(); g.stroke(); g.beginPath(); g.arc(104, 56, 9, 0, TAU); g.fillStyle = '#ff7a3a'; g.fill(); g.stroke();
    // eyes on the top half
    [-1, 1].forEach(function (q) { g.beginPath(); g.ellipse(q * 32, -62, 20, 24, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 5; g.strokeStyle = L.ink; g.stroke(); g.beginPath(); g.ellipse(q * 32 + 4, -58, 11, 14, 0, 0, TAU); g.fillStyle = '#3a2412'; g.fill(); g.beginPath(); g.arc(q * 32, -64, 5, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.lineWidth = 5; g.strokeStyle = L.ink; g.beginPath(); g.moveTo(-54, -92); g.quadraticCurveTo(-36, -102, -16, -94); g.moveTo(54, -92); g.quadraticCurveTo(36, -102, 16, -94); g.stroke();
    // lens
    g.beginPath(); g.arc(0, 22, 76, 0, TAU); g.fillStyle = '#23262e'; g.fill(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();
    g.beginPath(); g.arc(0, 22, 62, 0, TAU); g.fillStyle = T.lin(g, 0, -40, 0, 84, [0, '#6a7080', 1, '#2a2e38']); g.fill();
    g.beginPath(); g.arc(0, 22, 50, 0, TAU); g.fillStyle = T.rad(g, -14, 6, 4, 62, [0, L.lens[0], 0.45, L.lens[1], 1, L.lens[2]]); g.fill(); g.lineWidth = 4; g.strokeStyle = '#0c0e14'; g.stroke();
    g.beginPath(); g.arc(0, 22, 20, 0, TAU); g.fillStyle = '#0a1024'; g.fill();
    // two spot-the-difference marks in the glass
    T.star(g, -22, 40, 8, 4); g.fillStyle = '#ffe14a'; g.fill(); g.beginPath(); g.arc(24, 42, 6, 0, TAU); g.fillStyle = '#ff7a8a'; g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-22, -2, 14, 8, -0.6, 0, TAU); g.fill(); g.beginPath(); g.arc(20, 2, 4, 0, TAU); g.fill();
    if (!bare) { hat(g, T, L);
      // magnifying glass in the left hand
      g.save(); g.translate(-132, -14); g.rotate(-0.5); g.beginPath(); g.moveTo(0, 46); g.lineTo(0, 96); g.lineWidth = 20; g.strokeStyle = L.ink; g.stroke(); g.lineWidth = 11; g.strokeStyle = '#8a5a2a'; g.stroke();
      g.beginPath(); g.arc(0, 0, 46, 0, TAU); g.fillStyle = 'rgba(190,235,255,.5)'; g.fill(); g.lineWidth = 16; g.strokeStyle = L.ink; g.stroke(); g.lineWidth = 9; g.strokeStyle = '#ffc83a'; g.stroke(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(-16, -18, 12, 6, -0.7, 0, TAU); g.fill(); g.restore();
      glove(g, L, -166, 52, 0.9, 0.2, false); glove(g, L, 148, -52, 1, 0.25, true); }
    g.restore();
  }
  function bits(g, T, L, cx, cy, k) {
    var A = L.accent;
    [[-250, -170, 1, 1, A[0]], [250, -150, -1, 1, A[1]], [246, -60, -1, -1, A[3]], [-256, 30, 1, -1, A[2]]].forEach(function (b) { g.save(); g.translate(cx + b[0] * k, cy + b[1] * k); g.scale(b[2], b[3]); g.beginPath(); g.moveTo(0, 30 * k); g.lineTo(0, 0); g.lineTo(30 * k, 0); g.lineWidth = 7 * k; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = b[4]; g.stroke(); g.restore(); });
    [[-268, -90, 16, A[1]], [-226, 96, 14, A[0]], [226, 30, 13, A[2]]].forEach(function (s) { shutter(g, T, cx + s[0] * k, cy + s[1] * k, s[2] * k, [0, s[3], 1, s[3]], '#1a1a22'); });
    [[-300, 150], [-270, 190], [282, 110], [308, 150]].forEach(function (f, i) { g.save(); g.translate(cx + f[0] * k, cy + f[1] * k); g.rotate(i < 2 ? -0.4 : 0.4); g.fillStyle = 'rgba(190,200,220,.35)'; g.beginPath(); g.ellipse(0, 0, 9 * k, 14 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(0, 22 * k, 7 * k, 7 * k, 0, 0, TAU); g.fill(); g.restore(); });
    [[-190, -196, 10], [176, -206, 12], [286, -10, 9], [-300, -20, 8], [210, 190, 8], [-150, 160, 7]].forEach(function (s, i) { T.spark(g, cx + s[0] * k, cy + s[1] * k, s[2] * k, i % 2 ? '#ffe14a' : '#ffffff', 0.95); });
  }
  function emblem(g, T, L) { bits(g, T, L, 512, 270, 1.12); camera(g, T, L, 512, 300, 1.26); word(g, T, L, 512, 520, 122); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 280, 40, 640, [0, L.sky[0], 0.6, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-162, -8); emblem(g, T, L); return; }
    if (kind === 'wide') { camera(g, T, L, 96, 122, 0.52, true); word(g, T, L, 500, 142, 118); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.rad(g, 200, 180, 20, 300, [0, '#3c424e', 1, L.sky[2]]); g.fill(); g.clip(); if (px >= 90) { camera(g, T, L, 200, 196, 0.86); word(g, T, L, 200, 356, 64); } else camera(g, T, L, 200, 214, 1.25, true); g.restore(); T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 10; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.w[1], 1, L.band[0]]); g.stroke(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO pokadif END

// 🏷️ LOGO polyplot START — ⬛ Polyplot, drawn in code from Aowu's picture (gl-5)
GameLogos.add('polyplot', (function () {
  var BOX = { scene: [1024, 572], main: [560, 540], wide: [780, 200], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#2a1f6a', '#1a1450', '#120e3a'], plate: ['#33247e', '#261a62', '#1b124c'], rim: ['#6ad8ff', '#8a6af5', '#c05af0'], line: '#8fe6ff', dot: null,
    fill: ['#5fdc3a', '#2fc8c0', '#ff8a1a', '#2f7df5'], a: ['#d8fbff', '#6ae0f0', '#22b8e0', '#1a8ac8'], b: ['#fff0a0', '#ffc02a', '#ff8a14', '#f0600a'], dark: '#1a1250', dots: ['#ff8a2a', '#3fd8ff', '#f04ab8', '#8a6af5', '#ffd23e', '#3fd8ff', '#f04ab8', '#ff8a2a', '#ffd23e', '#3fd8ff'] };
    for (var k in o) b[k] = o[k]; return b; }
  function th(bg, paper, dot, line, extra) { var o = { sky: [paper, bg, bg], plate: [paper, bg, bg], line: line, dot: dot }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var LOOK = { classic: mk({}),
    dino: th('#17331F', '#21452A', '#E9F7D8', '#CFE8B0', { rim: ['#cfe8b0', '#6ab84a', '#a8782a'] }), sea: th('#0B2A48', '#123A60', '#E0F7FF', '#A8E2FF', { rim: ['#a8e2ff', '#3fb8e0', '#2a6ae0'] }),
    dance: th('#1E0D3A', '#2B1552', '#FFE8FA', '#E3B8FF', { rim: ['#ffb8f0', '#c05af0', '#3fd8ff'] }), robot: th('#15222E', '#1F3242', '#E8FBFF', '#9FE6F2', { rim: ['#9fe6f2', '#5a8ab8', '#c8d8e8'] }),
    space: th('#070A24', '#121640', '#FFFFFF', '#C9C2FF', { rim: ['#c9c2ff', '#6a5af0', '#3fd8ff'] }), sky: th('#2B6FA8', '#3B82BE', '#FFFFFF', '#FFF2B8', { rim: ['#fff2b8', '#ffffff', '#a8d8ff'], dark: '#12305a' }),
    hunter: th('#2A1D12', '#3A2A1A', '#FFE9C2', '#E7B776', { rim: ['#e7b776', '#c8782a', '#ffd23e'], dark: '#2a1608' }) };
  var TAU = Math.PI * 2;
  // a real little board: dots joined by lines, four closed shapes already claimed (picture coordinates)
  var P = { A: [336, 112], B: [492, 98], C: [600, 162], D: [520, 164], E: [318, 384], F: [524, 388], G: [402, 470], H: [526, 470], I: [628, 462], J: [706, 424], K: [704, 306], M: [506, 262], N: [342, 258], Q: [596, 250] };
  var SHAPES = [['A', 'B', 'D', 'M', 'N'], ['D', 'C', 'Q', 'M'], ['E', 'F', 'H', 'G'], ['F', 'K', 'J', 'I', 'H']];
  var EDGES = ['AB', 'BD', 'DC', 'CQ', 'QM', 'DM', 'MN', 'NA', 'NE', 'EF', 'FM', 'EG', 'GH', 'HF', 'HI', 'IJ', 'JK', 'KF', 'QK'];
  function poly(g, ids, f) { g.beginPath(); ids.forEach(function (k, i) { var p = P[k]; g[i ? 'lineTo' : 'moveTo'](f[0] + p[0] * f[2], f[1] + p[1] * f[2]); }); g.closePath(); }
  function board(g, T, L, ox, oy, k, words) {
    var f = [ox, oy, k];
    SHAPES.forEach(function (s, i) { var c = L.fill[i], xs = s.map(function (q) { return P[q][0]; }), ys = s.map(function (q) { return P[q][1]; }), cx = ox + k * (Math.min.apply(0, xs) + Math.max.apply(0, xs)) / 2, cy = oy + k * (Math.min.apply(0, ys) + Math.max.apply(0, ys)) / 2;
      g.save(); g.shadowColor = c; g.shadowBlur = 18 * k; poly(g, s, f); g.fillStyle = c; g.fill(); g.restore(); g.save(); poly(g, s, f); g.clip(); g.fillStyle = T.lin(g, 0, oy + k * Math.min.apply(0, ys), 0, oy + k * Math.max.apply(0, ys), [0, 'rgba(255,255,255,.2)', 0.35, 'rgba(255,255,255,0)', 1, 'rgba(0,0,60,.2)']); g.fillRect(ox, oy, 1024 * k, 572 * k); g.restore();
      g.save(); poly(g, s, f); g.clip(); g.globalAlpha = 0.6; g.fillStyle = '#fff'; g.lineJoin = 'round';        // the up-arrows + sparkles inside each shape
      for (var a = -1; a <= 1; a++) { var x = cx + a * 44 * k, y = cy + (a ? 16 : -4) * k, s2 = (a ? 21 : 30) * k; g.beginPath(); g.moveTo(x, y - s2); g.lineTo(x + s2 * 0.8, y); g.lineTo(x + s2 * 0.36, y); g.lineTo(x + s2 * 0.36, y + s2 * 0.3); g.lineTo(x - s2 * 0.36, y + s2 * 0.3); g.lineTo(x - s2 * 0.36, y); g.lineTo(x - s2 * 0.8, y); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x, y - s2 + s2 * 0.7); g.lineTo(x + s2 * 0.8, y + s2 * 0.7); g.lineTo(x + s2 * 0.36, y + s2 * 0.7); g.lineTo(x - s2 * 0.36, y + s2 * 0.7); g.lineTo(x - s2 * 0.8, y + s2 * 0.7); g.closePath(); g.fill(); }
      g.globalAlpha = 1; T.spark(g, cx - 44 * k, cy - 26 * k, 8 * k, '#fff', 0.95); T.spark(g, cx + 40 * k, cy - 34 * k, 6 * k, '#fff', 0.9); g.restore(); });
    g.save(); g.lineCap = 'round'; g.shadowColor = L.line; g.shadowBlur = 8 * k; EDGES.forEach(function (e) { var a = P[e[0]], b = P[e[1]]; g.beginPath(); g.moveTo(ox + a[0] * k, oy + a[1] * k); g.lineTo(ox + b[0] * k, oy + b[1] * k); g.lineWidth = 6 * k; g.strokeStyle = L.line; g.stroke(); }); g.restore();
    Object.keys(P).forEach(function (key, i) { if (key === 'M' || key === 'N' || key === 'Q') return; var p = P[key], c = L.dot || L.dots[i % L.dots.length], x = ox + p[0] * k, y = oy + p[1] * k, r = 17 * k;
      g.save(); g.shadowColor = c; g.shadowBlur = 14 * k; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.3, y - r * 0.35, 1, r * 1.2, [0, '#ffffff', 0.25, c, 1, c]); g.fill(); g.restore(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.lineWidth = 2.5 * k; g.strokeStyle = 'rgba(10,10,60,.55)'; g.stroke(); });
  }
  function star(g, T, x, y, R) { g.save(); g.shadowColor = '#ffd23e'; g.shadowBlur = 12; T.star(g, x, y, R, R * 0.52); g.fillStyle = T.lin(g, 0, y - R, 0, y + R, [0, '#fff3a0', 1, '#ffb02e']); g.fill(); g.restore(); T.star(g, x, y, R, R * 0.52); g.lineWidth = 3; g.strokeStyle = '#8a4a04'; g.lineJoin = 'round'; g.stroke();
    g.fillStyle = '#3a1c0a'; g.beginPath(); g.arc(x - R * 0.2, y - R * 0.02, R * 0.07, 0, TAU); g.arc(x + R * 0.2, y - R * 0.02, R * 0.07, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y + R * 0.06, R * 0.16, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = 2.5; g.lineCap = 'round'; g.strokeStyle = '#3a1c0a'; g.stroke(); }
  function chart(g, x, y, k) { var pts = [[0, 30], [26, 8], [52, 22], [80, -6]], cols = ['#b86af5', '#3fd8ff', '#ff8a2a', '#6ae04a']; g.save(); g.lineWidth = 3.5 * k; g.strokeStyle = '#d8c8ff'; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(function (p, i) { g[i ? 'lineTo' : 'moveTo'](x + p[0] * k, y + p[1] * k); }); g.stroke(); pts.forEach(function (p, i) { g.beginPath(); g.arc(x + p[0] * k, y + p[1] * k, 6 * k, 0, TAU); g.fillStyle = cols[i]; g.fill(); }); g.restore(); }
  function plate(g, T, L, x, y, S) {
    g.save(); g.shadowColor = L.rim[1]; g.shadowBlur = 30; T.rr(g, x, y, S, S * 0.96, S * 0.16); g.fillStyle = T.lin(g, x, y, x + S, y + S, [0, L.plate[0], 0.5, L.plate[1], 1, L.plate[2]]); g.fill(); g.shadowBlur = 0;
    g.lineWidth = 5; g.strokeStyle = T.lin(g, x, y, x + S, y + S, [0, L.rim[0], 0.5, L.rim[1], 1, L.rim[2]]); g.stroke();
    g.save(); T.rr(g, x, y, S, S * 0.96, S * 0.16); g.clip(); g.fillStyle = T.rad(g, x + S / 2, y + S * 0.45, 20, S * 0.7, [0, 'rgba(140,120,255,.35)', 1, 'rgba(0,0,0,0)']); g.fillRect(x, y, S, S); g.restore(); g.restore();
  }
  function words(g, T, L, cx, base, size) {
    function o(c) { return { spacing: size * 0.01, dark: L.dark, outline: size * 0.2, depth: size * 0.09, glow: 'rgba(120,100,255,.55)', face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.4)' }; }
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var w1 = g.measureText('Poly').width + 3 * size * 0.01, w2 = g.measureText('Plot').width + 3 * size * 0.01; g.restore(); var x0 = cx - (w1 + w2) / 2;
    T.word(g, 'Plot', x0 + w1 + w2 / 2, base, size, o(L.b)); T.gloss(g, 'Plot', x0 + w1 + w2 / 2, base, size, o(L.b), 0.45); T.word(g, 'Poly', x0 + w1 / 2, base, size, o(L.a)); T.gloss(g, 'Poly', x0 + w1 / 2, base, size, o(L.a), 0.45);
  }
  function emblem(g, T, L) { plate(g, T, L, 262, 44, 500); board(g, T, L, 0, 0, 1); star(g, T, 652, 128, 24); chart(g, 624, 196, 1); words(g, T, L, 512, 334, 104); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.sky[0], 0.6, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-232, -14); emblem(g, T, L); return; }
    if (kind === 'wide') { g.save(); g.beginPath(); g.rect(0, 0, 190, 200); g.clip(); board(g, T, L, -106, -26, 0.42); g.restore(); words(g, T, L, 488, 138, 122); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.78, 0.78); g.translate(-512, -284); plate(g, T, L, 262, 44, 500); board(g, T, L, 0, 0, 1); star(g, T, 652, 128, 24); if (px >= 90) words(g, T, L, 512, 334, 104); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO polyplot END

// 🏷️ LOGO pop-blocks START — 🫧 Pop Blocks, drawn in code from Aowu's picture (gl-14, round 5). Jelly blocks bursting behind the word
// = the game's own kinds (PopBlocks.html THEMES: colour + shape pairs, red ● · yellow ▲ · green ■ · blue ◆ · purple ★ · orange ♥).
// "Pop" orange · yellow · red over "Blocks" blue → green. Looks = the game's block themes (their colours + pictures).
GameLogos.add('pop-blocks', (function () {
  var BOX = { scene: [1024, 572], main: [620, 520], wide: [860, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { bg: ['#7a3ad8', '#3a1a8a', '#160a40'], dark: '#2a0c5a', glow: '#ffb84a', ring: 'rgba(170,110,255,.9)',
    col: ['#FF5A5F', '#FFC845', '#4CB963', '#3D8BFD', '#A06CF5', '#FF8A3D'], syms: null,
    a: [['#ffd08a', '#ff9a2e', '#f06a10'], ['#fff6a0', '#ffd21a', '#ffaa0a'], ['#ffa08a', '#ff5a3a', '#d8201e']],
    b: [['#6ae4ff', '#1ab0ff', '#1050e8'], ['#5af0e0', '#1ad0b0', '#0e9a8a'], ['#6af0a0', '#2ad870', '#12a050'], ['#9af07a', '#4ad83a', '#1a9a2a'], ['#c0f06a', '#86e02a', '#3aa81a'], ['#e0f870', '#b0e82a', '#6ab81a']] };
    for (var k in o) b[k] = o[k]; return b; }
  // the game's themes: block colours, pictures and background (PopBlocks.html THEMES)
  function th(col, syms, bg, dark) { return mk({ col: col, syms: syms, bg: [bg[1], bg[0], dark], dark: dark }); }
  var LOOK = { classic: mk({}),
    animals: th(['#F6B26B', '#FFD966', '#93C47D', '#C9A27E', '#F4A6C1', '#B4C7E7'], ['🐶', '🐱', '🐸', '🐵', '🐷', '🐼'], ['#1E5E3A', '#4CB963'], '#0e2a18'),
    dino: th(['#7BC67E', '#5FB3B3', '#E8C547', '#E07A5F', '#B39DDB', '#F2E3C6'], ['🦖', '🦕', '🦎', '🐊', '🐢', '🥚'], ['#3E2A14', '#B5651D'], '#1e1408'),
    monsters: th(['#7CF29A', '#C58CFF', '#9FB6CD', '#E8F1FF', '#FF7B7B', '#FF9ED2'], ['👽', '👾', '🤖', '👻', '👹', '🐙'], ['#120C2E', '#3B1F7A'], '#0a0620'),
    vehicles: th(['#FF6B6B', '#FFD24C', '#FF8F5A', '#8BCB5E', '#9EC9FF', '#C9B6FF'], ['🚗', '🚌', '🚒', '🚜', '🚑', '🚲'], ['#2C3E50', '#5D6D7E'], '#121a24'),
    space: th(['#9EC9FF', '#B9F3C9', '#D7D2FF', '#FFC48C', '#FFF2A8', '#FF9EB5'], ['🚀', '🛸', '🛰️', '🪐', '🌙', '☄️'], ['#05061A', '#1E2A78'], '#03040e') };
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function c(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); } return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')'; }
  function symPath(g, k, s) {   // the game's shapes: ● ▲ ■ ◆ ★ ♥
    g.beginPath();
    if (k === 0) g.arc(0, 0, s, 0, TAU);
    else if (k === 1) { g.moveTo(0, -s * 1.05); g.lineTo(s * 1.0, s * 0.75); g.lineTo(-s * 1.0, s * 0.75); g.closePath(); }
    else if (k === 2) GameLogos.tools.rr(g, -s * 0.85, -s * 0.85, s * 1.7, s * 1.7, s * 0.25);
    else if (k === 3) { g.moveTo(0, -s * 1.1); g.lineTo(s * 0.9, 0); g.lineTo(0, s * 1.1); g.lineTo(-s * 0.9, 0); g.closePath(); }
    else if (k === 4) GameLogos.tools.star(g, 0, 0, s * 1.1, s * 0.5, 5);
    else { g.moveTo(0, s * 0.85); g.bezierCurveTo(-s * 1.4, -s * 0.1, -s * 0.7, -s * 1.15, 0, -s * 0.45); g.bezierCurveTo(s * 0.7, -s * 1.15, s * 1.4, -s * 0.1, 0, s * 0.85); g.closePath(); }
  }
  /* a jelly block: glossy rounded cube, a lighter top, a darker bottom edge, the kind's shape pressed into the face (or the theme's picture) */
  function block(g, T, L, k, x, y, S, rot, a) {
    var c = L.col[k % 6]; g.save(); g.translate(x, y); g.rotate(rot || 0); g.globalAlpha = a == null ? 1 : a;
    g.save(); g.shadowColor = c; g.shadowBlur = S * 0.35; T.rr(g, -S / 2, -S / 2, S, S, S * 0.22); g.fillStyle = shade(c, -0.45); g.fill(); g.restore();
    T.rr(g, -S / 2, -S / 2, S, S * 0.92, S * 0.22); g.fillStyle = T.lin(g, 0, -S / 2, 0, S / 2, [0, shade(c, 0.45), 0.45, c, 1, shade(c, -0.25)]); g.fill();
    T.rr(g, -S / 2 + S * 0.06, -S / 2 + S * 0.05, S * 0.88, S * 0.34, S * 0.16); g.fillStyle = 'rgba(255,255,255,.32)'; g.fill();
    if (L.syms) { g.font = Math.round(S * 0.52) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L.syms[k % 6], 0, S * 0.02); }
    else { var s = S * 0.22; g.save(); g.translate(1.5, 2); symPath(g, k % 6, s); g.fillStyle = 'rgba(255,255,255,.45)'; g.fill(); g.restore(); symPath(g, k % 6, s); g.fillStyle = shade(c, -0.32); g.fill(); g.lineWidth = S * 0.03; g.strokeStyle = shade(c, -0.5); g.stroke(); }
    g.beginPath(); g.ellipse(-S * 0.22, -S * 0.28, S * 0.14, S * 0.06, -0.4, 0, TAU); g.fillStyle = 'rgba(255,255,255,.85)'; g.fill();
    g.restore();
  }
  function bubble(g, T, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.3, y - r * 0.3, 0, r, [0, 'rgba(255,255,255,.05)', 0.75, 'rgba(180,220,255,.25)', 1, 'rgba(220,240,255,.75)']); g.fill(); g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.12, -0.6, 0, TAU); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill(); }
  function trail(g, T) {
    g.save(); g.lineCap = 'round'; g.shadowColor = '#ff8ad8'; g.shadowBlur = 16; [[16, 'rgba(255,120,220,.22)'], [8, 'rgba(255,190,240,.45)'], [3, 'rgba(255,255,255,.8)']].forEach(function (w) { g.beginPath(); g.moveTo(560, 160); g.bezierCurveTo(640, 80, 720, 60, 800, 70); g.lineWidth = w[0]; g.strokeStyle = w[1]; g.stroke(); }); g.restore();
    var r = T.rng(5); for (var q = 0; q < 26; q++) { var t = r(); T.spark(g, 570 + t * 230 + (r() - 0.5) * 40, 150 - t * 90 + (r() - 0.5) * 40, 2 + r() * 6, ['#fff', '#ffd2f4', '#fff6a0'][q % 3], 0.7 + r() * 0.3); }
  }
  function splash(g, x, y) { g.save(); g.fillStyle = '#ff9a2e'; g.shadowColor = '#ffb84a'; g.shadowBlur = 10; [[0, 0, 14, 10, 0.3], [-20, -18, 7, 9, 0.6], [12, -26, 6, 8, -0.3], [-30, 6, 5, 5, 0], [26, -6, 5, 6, 0]].forEach(function (d) { g.beginPath(); g.ellipse(x + d[0], y + d[1], d[2], d[3], d[4], 0, TAU); g.fill(); }); g.restore(); }
  function o(L, cols, size) { return { clean: true /* gl-r20 clean B */, spacing: size * 0.005, dark: L.dark, outline: size * 0.21, depth: size * 0.08, fat: size * 0.006, ring: L.ring, edge: function (j) { return GameLogos.tools.shade(cols[j % cols.length][2], -0.45); }, edgeW: size * 0.075, face: function (j) { var c = cols[j % cols.length]; return [0, c[0], 0.42, c[1], 1, c[2]]; } }; }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    var s1 = 200 * k, s2 = 168 * k, A = o(L, L.a, s1), B = o(L, L.b, s2);
    if (oneLine) {
      g.save(); g.font = '700 ' + s1 + 'px ' + T.FONT; var w1 = g.measureText('Pop').width; g.font = '700 ' + s2 + 'px ' + T.FONT; var w2 = g.measureText('Blocks').width; g.restore();
      var gap = 62 * k, x0 = cx - (w1 + gap + w2) / 2; T.word(g, 'Blocks', x0 + w1 + gap + w2 / 2, y1, s2, B); T.gloss(g, 'Blocks', x0 + w1 + gap + w2 / 2, y1, s2, B, 0.5); T.word(g, 'Pop', x0 + w1 / 2, y1, s1, A); T.gloss(g, 'Pop', x0 + w1 / 2, y1, s1, A, 0.5); return;
    }
    A.wave = function (j) { return [0, 8, 2][j] * k; }; A.rot = -0.02; B.wave = function (j) { return [0, -2, 2, 4, 0, -4][j] * k; }; B.glow = L.glow; B.glowBlur = 0.25;
    // neon halo round BOTH words first (the picture's warm glow), then the words on top
    var hA = o(L, L.a, s1), hB = o(L, L.b, s2); hA.wave = A.wave; hA.rot = A.rot; hB.wave = B.wave; [[hB, 'Blocks', cx + 8 * k, y2, s2], [hA, 'Pop', cx - 34 * k, y1, s1]].forEach(function (h) { h[0].glow = L.glow; h[0].glowN = 2; h[0].glowBlur = 0.4; T.word(g, h[1], h[2], h[3], h[4], h[0]); });
    B.glow = null; T.word(g, 'Blocks', cx + 8 * k, y2, s2, B); T.gloss(g, 'Blocks', cx + 8 * k, y2, s2, B, 0.5);
    T.word(g, 'Pop', cx - 34 * k, y1, s1, A); T.gloss(g, 'Pop', cx - 34 * k, y1, s1, A, 0.5);
  }
  // blocks behind the word: [kind, x, y, size, turn] — the picture's spots
  var PILE = [[3, 420, 150, 96, -0.16], [0, 512, 108, 90, 0.04], [4, 612, 152, 88, 0.2], [2, 506, 202, 80, -0.05], [1, 690, 218, 88, 0.26], [2, 300, 306, 84, -0.22], [5, 708, 326, 92, 0.14]];
  var FLY = [[1, 690, 58, 28, 0.3], [0, 744, 64, 22, -0.3], [3, 784, 82, 24, 0.5], [4, 778, 130, 22, -0.2], [5, 760, 184, 16, 0.6], [2, 640, 52, 18, -0.4]];
  function emblem(g, T, L, full) {
    g.fillStyle = T.rad(g, 470, 250, 10, 330, [0, 'rgba(255,230,150,.9)', 0.3, 'rgba(255,150,80,.45)', 0.65, 'rgba(255,90,200,.18)', 1, 'rgba(255,120,200,0)']); g.fillRect(140, 0, 760, 572);
    if (full) { g.save(); g.globalCompositeOperation = 'lighter'; for (var i = 0; i < 16; i++) { var an = i * TAU / 16 + 0.1; g.beginPath(); g.moveTo(470, 250); g.arc(470, 250, 420, an, an + 0.07); g.closePath(); g.fillStyle = T.rad(g, 470, 250, 10, 420, [0, 'rgba(255,200,120,.22)', 1, 'rgba(255,120,200,0)']); g.fill(); } g.restore(); }
    if (full) trail(g, T);
    PILE.forEach(function (b) { block(g, T, L, b[0], b[1], b[2], b[3], b[4]); });
    if (full) { FLY.forEach(function (b) { block(g, T, L, b[0], b[1], b[2], b[3], b[4]); }); splash(g, 296, 178); [[560, 50, 10], [668, 120, 7], [806, 240, 13], [770, 300, 8], [630, 96, 6]].forEach(function (b) { bubble(g, T, b[0], b[1], b[2]); }); }
    T.spark(g, 548, 140, 22, '#fff', 1);
    words(g, T, L, 512, 330, 470, 1);
    if (full) [[318, 102, 10], [432, 318, 9], [526, 360, 8], [262, 436, 9], [796, 400, 8]].forEach(function (s) { T.spark(g, s[0], s[1], s[2] * 1.7, '#fff', 0.95); });
  }
  function backdrop(g, T, L, x, y, w, h) {
    g.fillStyle = T.rad(g, x + w / 2, y + h * 0.45, 30, Math.max(w, h) * 0.7, [0, L.bg[0], 0.5, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h);
    var r = T.rng(17); for (var i = 0; i < 18; i++) { var bx = x + (i % 2 ? w - 50 - r() * 90 : 30 + r() * 90), by = y + 20 + r() * (h - 40); block(g, T, L, i % 6, bx, by, 46 + r() * 30, (r() - 0.5) * 0.3, 0.13); }
    for (var q = 0; q < 50; q++) { g.globalAlpha = 0.35 + r() * 0.5; g.fillStyle = ['#ffb86a', '#ff8ad8', '#fff6a0'][q % 3]; g.beginPath(); g.arc(x + r() * w, y + r() * h, 1 + r() * 3, 0, TAU); g.fill(); } g.globalAlpha = 1;
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { backdrop(g, T, L, 0, 0, 1024, 572); emblem(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-200, -36); emblem(g, T, L, false); return; }
    if (kind === 'wide') { block(g, T, L, 3, 56, 70, 56, -0.16); block(g, T, L, 0, 114, 60, 50, 0.06); block(g, T, L, 5, 90, 124, 54, 0.12); block(g, T, L, 1, 148, 124, 46, 0.24); words(g, T, L, 520, 150, 0, 0.62, true); return; }
    if (kind === 'badge') {
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.clip(); backdrop(g, T, L, 14, 14, 372, 372); g.restore();
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.lineWidth = 8; g.strokeStyle = T.lin(g, 0, 14, 0, 386, [0, '#ffe0a0', 0.5, '#ff8ad8', 1, L.dark]); g.shadowColor = '#ff8ad8'; g.shadowBlur = 16; g.stroke(); g.restore();
      if (px >= 90) { g.translate(200, 206); g.scale(0.6, 0.6); g.translate(-512, -290); emblem(g, T, L, false); }
      else { block(g, T, L, 3, 140, 150, 120, -0.16); block(g, T, L, 0, 262, 140, 110, 0.06); block(g, T, L, 5, 160, 268, 116, 0.12); block(g, T, L, 1, 270, 264, 104, 0.24); }
      return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO pop-blocks END

// 🏷️ LOGO pose-party START — 📷 Pose Party, drawn in code from Aowu's picture (gl-20, round 7). Two kids striking poses (one-piece, depth from colour):
// the boy in a backwards cap + rainbow jacket mid-dance, the curly-haired girl jumping with peace signs; glowing pose silhouettes, a camera with a flash,
// gold "POSE" over pink "PARTY", confetti, "!" marks and zig-zag arrows, all inside a phone screen (the phone frame shows on scene + main only). One look.
GameLogos.add('pose-party', (function () {
  var BOX = { scene: [1024, 572], main: [1000, 560], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  var LOOK = { classic: { bg: ['#4a3ae8', '#2a1aa8', '#14086a'], gold: ['#fff7a8', '#ffd21a', '#ff8a0a'], pink: ['#ffc8f4', '#ff4fd8', '#b8148a'], ring: '#38d0ff', dark: '#1a0c5a' } };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#1a0c3a';
  /* ---------- background bits ---------- */
  function back(g, T, L, x, y, w, h, full) {
    g.fillStyle = T.rad(g, x + w * 0.5, y + h * 0.45, 30, w * 0.7, [0, L.bg[0], 0.55, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h);
    g.save(); g.globalAlpha = 0.18; g.fillStyle = '#8a7aff'; for (var i = 0; i < 9; i++) { g.beginPath(); g.moveTo(512, 300); g.arc(512, 300, 900, i * TAU / 9, i * TAU / 9 + 0.18); g.closePath(); g.fill(); } g.restore();
    var r = T.rng(11), C = ['#ff5aa8', '#ffd23a', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff'];
    for (var q = 0; q < (full ? 60 : 30); q++) { g.save(); g.translate(x + r() * w, y + r() * h); g.rotate(r() * TAU); g.fillStyle = C[q % 6]; GameLogos.tools.rr(g, -7, -3, 14, 6, 3); g.fill(); g.restore(); }
    for (var s = 0; s < 16; s++) { var sx = x + r() * w, sy = y + r() * h; if (s % 3) T.spark(g, sx, sy, 5 + r() * 8, '#fff', 0.85); else { g.fillStyle = s % 2 ? '#ffd23a' : '#ff5aa8'; T.star(g, sx, sy, 9, 4); g.fill(); } }
  }
  function bang(g, x, y, rot, col) { g.save(); g.translate(x, y); g.rotate(rot); g.lineJoin = 'round'; g.beginPath(); g.moveTo(-9, -44); g.lineTo(9, -44); g.lineTo(5, 6); g.lineTo(-5, 6); g.closePath(); g.moveTo(9, 22); g.arc(0, 22, 9, 0, TAU);
    g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 12; g.fill(); g.restore(); }
  function zig(g, x, y, rot, col, k) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.shadowColor = col; g.shadowBlur = 10; g.lineWidth = 7;
    g.beginPath(); g.moveTo(-40, 14); g.lineTo(-14, -8); g.lineTo(2, 8); g.lineTo(32, -18); g.stroke(); g.beginPath(); g.moveTo(40, -24); g.lineTo(16, -22); g.lineTo(34, -2); g.closePath(); g.fillStyle = col; g.fill(); g.restore(); }
  function marks(g, T) { bang(g, 76, 120, -0.35, '#38d0ff'); bang(g, 110, 92, 0.12, '#ff5aa8'); bang(g, 914, 84, 0.2, '#ff5aa8'); bang(g, 946, 92, 0.35, '#ffd23a');
    zig(g, 46, 262, -0.3, '#ffd23a', 0.9); zig(g, 166, 520, -0.6, '#38d0ff', 1); zig(g, 936, 452, -0.4, '#38d0ff', 1); zig(g, 954, 130, 0.4, '#ffd23a', 0.6); }
  /* ---------- glowing pose silhouettes (one piece each, cyan rim) ---------- */
  function ghost(g, T, x, y, k, kind) {
    var P = kind === 'flex' ? {
      b: function (h) { h.beginPath(); h.ellipse(x, y, 20 * k, 23 * k, 0, 0, TAU); h.fill(); h.beginPath(); h.moveTo(x - 34 * k, y + 26 * k); h.lineTo(x + 34 * k, y + 26 * k); h.lineTo(x + 24 * k, y + 110 * k); h.lineTo(x - 24 * k, y + 110 * k); h.closePath(); h.fill();
        T.limb(h, [x - 32 * k, y + 32 * k, x - 66 * k, y + 40 * k, x - 64 * k, y + 6 * k], 22 * k, 18 * k, 4 * k); T.limb(h, [x + 32 * k, y + 32 * k, x + 66 * k, y + 40 * k, x + 64 * k, y + 6 * k], 22 * k, 18 * k, 4 * k);
        h.beginPath(); h.arc(x - 62 * k, y - 2 * k, 12 * k, 0, TAU); h.arc(x + 62 * k, y - 2 * k, 12 * k, 0, TAU); h.fill(); } }
      : {
      b: function (h) { h.beginPath(); h.ellipse(x, y, 19 * k, 22 * k, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(x, y + 10 * k, 28 * k, 26 * k, 0, 0, Math.PI); h.fill(); h.beginPath(); h.moveTo(x - 28 * k, y + 28 * k); h.lineTo(x + 28 * k, y + 28 * k); h.lineTo(x + 34 * k, y + 110 * k); h.lineTo(x - 34 * k, y + 110 * k); h.closePath(); h.fill();
        T.limb(h, [x - 26 * k, y + 32 * k, x - 54 * k, y + 10 * k, x - 44 * k, y - 34 * k], 18 * k, 14 * k); T.limb(h, [x + 26 * k, y + 34 * k, x + 70 * k, y + 50 * k, x + 72 * k, y + 20 * k], 18 * k, 14 * k);
        h.beginPath(); h.arc(x - 44 * k, y - 38 * k, 10 * k, 0, TAU); h.fill(); h.save(); h.translate(x + 72 * k, y + 4 * k); h.scale(k, k); h.beginPath(); h.moveTo(0, 14); h.bezierCurveTo(-22, 0, -14, -18, 0, -6); h.bezierCurveTo(14, -18, 22, 0, 0, 14); h.fill(); h.restore(); } };
    T.onePiece(g, T, { x0: x - 100 * k, y0: y - 60 * k, W: 200 * k, H: 180 * k, rim: '#4ad8ff', rimW: 3, parts: P, order: ['b'], glow: '#38d0ff', glowBlur: 16,
      colour: function (B, put) { put(B, 'b', T.lg(B, 0, y - 30 * k, 0, y + 110 * k, [0, '#2a3ab8', 1, '#1a1a7a'])); } });
  }
  /* ---------- the camera with its flash ---------- */
  function camera(g, T, cx, cy, k, flash) {
    g.save(); g.translate(cx, cy); g.scale(k, k); g.rotate(0.08);
    g.shadowColor = 'rgba(10,0,40,.5)'; g.shadowBlur = 16; g.shadowOffsetY = 6;
    T.rr(g, -66, -76, 52, 26, 8); g.fillStyle = '#4a5a8a'; g.fill(); g.shadowColor = 'transparent';
    T.rr(g, -96, -58, 192, 120, 22); g.fillStyle = T.lin(g, 0, -58, 0, 62, [0, '#d8e4f8', 0.5, '#8a9ac8', 1, '#4a5a8a']); g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
    T.rr(g, -88, -50, 176, 22, 10); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill();
    T.rr(g, 54, -48, 30, 16, 5); g.fillStyle = '#fff6c0'; g.fill();
    g.beginPath(); g.arc(0, 6, 50, 0, TAU); g.fillStyle = '#2a2a4a'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.arc(0, 6, 42, 0, TAU); g.fillStyle = '#c8d4f0'; g.fill();
    var cols = ['#ff4fd8', '#b86aff', '#4a8aff', '#38d0ff', '#7ae84a', '#ffd23a'];
    for (var i = 0; i < 6; i++) { var a0 = i * TAU / 6; g.beginPath(); g.moveTo(Math.cos(a0) * 36, 6 + Math.sin(a0) * 36); g.arc(0, 6, 36, a0, a0 + TAU / 6); g.lineTo(Math.cos(a0 + TAU / 6 + 1.1) * 12, 6 + Math.sin(a0 + TAU / 6 + 1.1) * 12); g.closePath(); g.fillStyle = cols[i]; g.fill(); g.lineWidth = 1.5; g.strokeStyle = 'rgba(20,10,60,.6)'; g.stroke(); }
    g.beginPath(); g.arc(0, 6, 11, 0, TAU); g.fillStyle = '#1a1040'; g.fill(); g.beginPath(); g.ellipse(-14, -8, 9, 5, -0.7, 0, TAU); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill();
    if (flash) { g.save(); g.translate(82, -54); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 0, 0, 0, 70, [0, 'rgba(255,255,220,1)', 0.3, 'rgba(255,230,120,.7)', 1, 'rgba(255,200,80,0)']); g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.fill();
      g.fillStyle = '#fffbe0'; T.star(g, 0, 0, 46, 8, 8); g.fill(); g.restore(); }
    g.restore();
  }
  /* ---------- the boy: backwards cap, rainbow jacket, dancing step ---------- */
  function boy(g, T) {
    var SK = ['#ffd6b0', '#f2b080', '#c87a4a'], JE = ['#7a9ac0', '#4a6a90', '#2a3a5a'];
    var P = {
      legB: function (h) { T.limb(h, [162, 340, 158, 392, 146, 428], 32, 27); T.limb(h, [146, 428, 132, 460, 120, 486], 27, 22); },
      shoeB: function (h) { h.save(); T.around(h, 114, 498, -0.9); h.beginPath(); h.ellipse(118, 500, 30, 15, 0, 0, TAU); h.fill(); h.restore(); },
      armB: function (h) { T.limb(h, [132, 252, 104, 272, 94, 300], 34, 28); T.limb(h, [94, 300, 80, 324, 72, 344], 28, 24); h.beginPath(); h.arc(68, 350, 16, 0, TAU); h.fill(); },
      torso: function (h) { h.beginPath(); h.moveTo(126, 246); h.quadraticCurveTo(172, 226, 224, 240); h.lineTo(222, 300); h.quadraticCurveTo(226, 340, 214, 352); h.lineTo(136, 356); h.quadraticCurveTo(124, 320, 130, 290); h.closePath(); h.fill(); },
      legF: function (h) { T.limb(h, [194, 342, 230, 330, 262, 330], 34, 29); T.limb(h, [262, 330, 268, 372, 264, 408], 29, 24); },
      shoeF: function (h) { h.beginPath(); h.ellipse(274, 420, 30, 15, 0.25, 0, TAU); h.fill(); h.beginPath(); h.ellipse(262, 408, 15, 12, 0, 0, TAU); h.fill(); },
      armF: function (h) { T.limb(h, [214, 252, 240, 258, 254, 266], 32, 28); T.limb(h, [254, 266, 256, 236, 244, 216], 28, 24); h.beginPath(); h.arc(240, 206, 16, 0, TAU); h.fill(); },
      neck: function (h) { T.limb(h, [170, 214, 171, 226, 172, 238], 24, 24); },
      head: function (h) { h.beginPath(); h.ellipse(170, 180, 42, 46, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(130, 188, 9, 12, 0, 0, TAU); h.fill(); },
      cap: function (h) { h.beginPath(); h.moveTo(126, 168); h.bezierCurveTo(124, 120, 212, 108, 218, 156); h.quadraticCurveTo(172, 146, 126, 168); h.closePath(); h.fill(); h.beginPath(); h.moveTo(132, 160); h.quadraticCurveTo(108, 168, 96, 190); h.quadraticCurveTo(118, 188, 140, 176); h.closePath(); h.fill(); }
    };
    T.onePiece(g, T, { x0: 30, y0: 90, W: 290, H: 440, rim: INK, rimW: 4, parts: P, order: ['legB', 'shoeB', 'armB', 'torso', 'legF', 'shoeF', 'armF', 'neck', 'head', 'cap'],
      colour: function (B, put, inside) {
        put(B, 'legB', T.lg(B, 120, 0, 170, 0, [0, JE[2], 1, JE[1]]));
        put(B, 'shoeB', '#d8701a'); inside(B, 'shoeB', function (h) { h.save(); T.around(h, 114, 498, -0.9); h.fillStyle = '#fff'; h.fillRect(86, 506, 64, 8); h.fillStyle = '#ffb03a'; h.fillRect(90, 488, 30, 10); h.restore(); });
        put(B, 'armB', T.lg(B, 132, 252, 80, 336, [0, '#ffc21a', 0.5, '#ff9a1a', 1, '#e8801a']));
        inside(B, 'armB', function (h) { h.fillStyle = '#38d0ff'; h.save(); T.around(h, 104, 286, 0.9); h.fillRect(84, 280, 40, 9); h.restore(); h.fillStyle = '#8a3ac8'; h.beginPath(); h.arc(80, 334, 15, 0, TAU); h.fill(); h.fillStyle = SK[1]; h.beginPath(); h.arc(68, 350, 16, 0, TAU); h.fill(); h.strokeStyle = SK[2]; h.lineWidth = 2; h.beginPath(); h.moveTo(60, 352); h.lineTo(74, 344); h.stroke(); });
        put(B, 'torso', T.lg(B, 126, 240, 160, 356, [0, '#ffd23a', 0.3, '#ff4fd8', 1, '#9a3ad8']));
        inside(B, 'torso', function (h) {
          h.fillStyle = T.lg(h, 186, 240, 224, 350, [0, '#ffd23a', 0.45, '#38d0ff', 1, '#2a8ad8']); h.beginPath(); h.moveTo(186, 236); h.lineTo(230, 236); h.lineTo(230, 356); h.lineTo(194, 356); h.quadraticCurveTo(190, 300, 186, 236); h.closePath(); h.fill();
          h.fillStyle = T.lg(h, 160, 0, 190, 0, [0, '#ffffff', 1, '#dcd6f0']); h.beginPath(); h.moveTo(160, 240); h.lineTo(188, 238); h.quadraticCurveTo(190, 300, 194, 352); h.lineTo(158, 352); h.quadraticCurveTo(156, 300, 160, 240); h.closePath(); h.fill();
          h.fillStyle = '#ff4fd8'; h.beginPath(); h.moveTo(150, 238); h.quadraticCurveTo(172, 262, 192, 236); h.lineTo(196, 230); h.quadraticCurveTo(172, 256, 146, 232); h.closePath(); h.fill();
          h.fillStyle = '#ffb01a'; GameLogos.tools.rr(h, 136, 262, 18, 12, 3); h.fill();
          h.fillStyle = T.lg(h, 0, 338, 0, 356, [0, '#b86aff', 1, '#6a2aa8']); h.fillRect(120, 338, 120, 20);
          h.fillStyle = 'rgba(40,0,80,.18)'; h.beginPath(); h.moveTo(126, 300); h.quadraticCurveTo(136, 340, 140, 356); h.lineTo(120, 356); h.closePath(); h.fill(); });
        put(B, 'legF', T.lg(B, 194, 330, 264, 410, [0, JE[0], 1, JE[1]]));
        inside(B, 'legF', function (h) { h.strokeStyle = 'rgba(30,50,80,.35)'; h.lineWidth = 3; h.beginPath(); h.moveTo(232, 318); h.quadraticCurveTo(250, 326, 254, 344); h.stroke(); });
        put(B, 'shoeF', '#ffb03a'); inside(B, 'shoeF', function (h) { h.fillStyle = '#ff7a1a'; h.beginPath(); h.ellipse(282, 414, 20, 9, 0.25, 0, TAU); h.fill(); h.fillStyle = '#fff'; h.save(); T.around(h, 274, 420, 0.25); h.fillRect(244, 428, 62, 7); h.restore(); h.fillStyle = '#e8e8f8'; h.beginPath(); h.ellipse(262, 404, 15, 7, 0, 0, TAU); h.fill(); });
        put(B, 'armF', T.lg(B, 214, 0, 256, 0, [0, '#ffd23a', 1, '#ffb01a'])); inside(B, 'armF', function (h) { h.fillStyle = '#b86aff'; h.save(); T.around(h, 250, 232, -0.2); h.fillRect(234, 222, 30, 10); h.restore(); h.fillStyle = T.rg(h, 236, 200, 2, 18, [0, SK[0], 1, SK[1]]); h.beginPath(); h.arc(240, 206, 16, 0, TAU); h.fill(); h.strokeStyle = SK[2]; h.lineWidth = 2.2; h.beginPath(); h.moveTo(230, 198); h.quadraticCurveTo(240, 194, 250, 198); h.moveTo(232, 206); h.lineTo(246, 206); h.moveTo(236, 212); h.lineTo(250, 212); h.stroke(); });
        put(B, 'neck', SK[2]);
        put(B, 'head', T.rg(B, 178, 172, 4, 52, [0, SK[0], 0.7, SK[1], 1, SK[2]]));
        inside(B, 'head', function (h) { h.fillStyle = '#8a4a1a'; h.beginPath(); h.moveTo(128, 168); h.quadraticCurveTo(150, 176, 160, 160); h.quadraticCurveTo(176, 174, 214, 160); h.lineTo(214, 140); h.lineTo(128, 140); h.closePath(); h.fill(); h.beginPath(); h.ellipse(128, 194, 6, 16, 0, 0, TAU); h.fill(); h.beginPath(); h.moveTo(196, 152); h.quadraticCurveTo(214, 158, 212, 176); h.quadraticCurveTo(204, 164, 190, 162); h.closePath(); h.fill(); });
        put(B, 'cap', T.lg(B, 0, 112, 0, 170, [0, '#8a96aa', 1, '#4a5468'])); inside(B, 'cap', function (h) { h.fillStyle = '#2a8af0'; h.beginPath(); h.moveTo(176, 146); h.quadraticCurveTo(200, 140, 218, 156); h.lineTo(220, 140); h.quadraticCurveTo(200, 128, 176, 132); h.closePath(); h.fill(); h.fillStyle = 'rgba(255,255,255,.35)'; h.beginPath(); h.ellipse(160, 126, 22, 7, -0.2, 0, TAU); h.fill(); h.fillStyle = '#3a4458'; h.fillRect(90, 170, 60, 30); });
      } });
    [[154, 186], [190, 184]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 10, 12, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 2, e[1] + 1, 6, 0, TAU); g.fillStyle = '#2a8ad8'; g.fill(); g.beginPath(); g.arc(e[0] + 2, e[1] + 1, 3, 0, TAU); g.fillStyle = '#0a1a3a'; g.fill(); g.beginPath(); g.arc(e[0], e[1] - 2, 2, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.strokeStyle = '#5a2a0a'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(144, 168); g.quadraticCurveTo(154, 162, 164, 168); g.moveTo(182, 166); g.quadraticCurveTo(192, 160, 202, 166); g.stroke();
    g.strokeStyle = '#c87a4a'; g.lineWidth = 3; g.beginPath(); g.moveTo(174, 196); g.quadraticCurveTo(170, 204, 176, 206); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); g.moveTo(160, 214); g.quadraticCurveTo(176, 224, 192, 210); g.stroke();
  }
  /* ---------- the girl: big curls, crop top, jumping with peace signs ---------- */
  function girl(g, T) {
    var SK = ['#c88a5a', '#a8653a', '#6a3a1a'], JE = ['#6ac8f0', '#3a8ac8', '#1a4a8a'];
    function peace(h, x, y, a) { h.save(); T.around(h, x, y, a); h.beginPath(); h.ellipse(x, y, 13, 12, 0, 0, TAU); h.fill(); T.limb(h, [x - 5, y - 6, x - 9, y - 18, x - 12, y - 30], 9, 8); T.limb(h, [x + 4, y - 6, x + 6, y - 18, x + 8, y - 30], 9, 8); h.restore(); }
    var P = {
      hairB: function (h) { var r = T.rng(5); for (var i = 0; i < 22; i++) { var a = i / 22 * TAU, rr = 62 + (i % 2) * 8; h.beginPath(); h.arc(852 + Math.cos(a) * rr, 206 + Math.sin(a) * rr * 0.92, 22 + r() * 6, 0, TAU); h.fill(); } h.beginPath(); h.arc(852, 206, 66, 0, TAU); h.fill(); },
      legB: function (h) { T.limb(h, [866, 340, 890, 372, 904, 396], 34, 28); T.limb(h, [904, 396, 920, 392, 934, 378], 28, 24); },
      shoeB: function (h) { h.save(); T.around(h, 944, 374, -0.6); h.beginPath(); h.ellipse(948, 376, 26, 13, 0, 0, TAU); h.fill(); h.restore(); },
      armB: function (h) { T.limb(h, [810, 278, 790, 296, 792, 304], 22, 20); T.limb(h, [792, 304, 784, 288, 778, 272], 20, 18); peace(h, 776, 266, -0.4); },
      legF: function (h) { T.limb(h, [834, 340, 822, 388, 818, 420], 36, 30); T.limb(h, [818, 420, 830, 448, 842, 470], 30, 24); },
      shoeF: function (h) { h.beginPath(); h.ellipse(852, 482, 28, 14, 0.5, 0, TAU); h.fill(); },
      torso: function (h) { h.beginPath(); h.moveTo(808, 272); h.quadraticCurveTo(850, 258, 890, 270); h.lineTo(886, 318); h.quadraticCurveTo(886, 346, 874, 350); h.lineTo(826, 350); h.quadraticCurveTo(812, 346, 814, 318); h.closePath(); h.fill(); },
      armF: function (h) { T.limb(h, [886, 276, 914, 266, 930, 244], 22, 20); T.limb(h, [930, 244, 940, 222, 946, 200], 20, 18); peace(h, 948, 192, 0.25); },
      neck: function (h) { T.limb(h, [852, 252, 852, 260, 852, 268], 20, 20); },
      head: function (h) { h.beginPath(); h.ellipse(852, 220, 38, 38, 0, 0, TAU); h.fill(); },
      hairF: function (h) { [[820, 192, 15], [834, 180, 14], [870, 178, 14], [886, 190, 15], [816, 210, 11], [890, 208, 11]].forEach(function (c) { h.beginPath(); h.arc(c[0], c[1], c[2], 0, TAU); h.fill(); }); }
    };
    T.onePiece(g, T, { x0: 740, y0: 110, W: 250, H: 400, rim: INK, rimW: 4, parts: P, order: ['hairB', 'legB', 'shoeB', 'armB', 'legF', 'shoeF', 'torso', 'armF', 'neck', 'head', 'hairF'],
      colour: function (B, put, inside) {
        put(B, 'hairB', T.rg(B, 846, 186, 10, 96, [0, '#a8602a', 0.6, '#6a3416', 1, '#3a1a08']));
        inside(B, 'hairB', function (h) { var r = T.rng(5); h.strokeStyle = 'rgba(230,160,90,.7)'; h.lineWidth = 3.5; for (var i = 0; i < 46; i++) { var a = r() * TAU, d = 30 + r() * 50; h.beginPath(); h.arc(852 + Math.cos(a) * d, 206 + Math.sin(a) * d, 8, r() * 3, r() * 3 + 3); h.stroke(); } });
        put(B, 'legB', T.lg(B, 866, 0, 934, 0, [0, JE[2], 1, JE[1]]));
        put(B, 'shoeB', '#d83a8a'); inside(B, 'shoeB', function (h) { h.save(); T.around(h, 944, 374, -0.6); h.fillStyle = '#fff'; h.fillRect(920, 382, 56, 6); h.restore(); });
        put(B, 'armB', '#e0ac14'); inside(B, 'armB', function (h) { h.fillStyle = SK[1]; h.save(); T.around(h, 776, 266, -0.4); h.beginPath(); h.ellipse(776, 266, 13, 12, 0, 0, TAU); h.fill(); T.limb(h, [771, 260, 767, 248, 764, 236], 9, 8); T.limb(h, [780, 260, 782, 248, 784, 236], 9, 8); h.restore(); });
        put(B, 'legF', T.lg(B, 818, 340, 842, 470, [0, JE[0], 1, JE[1]])); inside(B, 'legF', function (h) { h.strokeStyle = 'rgba(20,60,120,.35)'; h.lineWidth = 3; h.beginPath(); h.moveTo(826, 396); h.quadraticCurveTo(816, 412, 824, 424); h.stroke(); });
        put(B, 'shoeF', '#ff5aa8'); inside(B, 'shoeF', function (h) { h.save(); T.around(h, 852, 482, 0.5); h.fillStyle = '#fff'; h.fillRect(822, 488, 60, 7); h.fillStyle = '#ff9ad0'; h.fillRect(838, 470, 20, 8); h.restore(); });
        put(B, 'torso', T.lg(B, 808, 0, 890, 0, [0, '#e8b81a', 0.4, '#ffe04a', 1, '#f0c41a']));
        inside(B, 'torso', function (h) { h.fillStyle = SK[1]; h.beginPath(); h.moveTo(816, 332); h.quadraticCurveTo(850, 340, 886, 330); h.lineTo(886, 352); h.lineTo(816, 352); h.closePath(); h.fill(); h.fillStyle = JE[1]; h.fillRect(810, 342, 82, 12); h.fillStyle = 'rgba(160,100,0,.25)'; h.beginPath(); h.moveTo(826, 290); h.quadraticCurveTo(850, 300, 876, 290); h.lineTo(876, 296); h.quadraticCurveTo(850, 306, 826, 296); h.closePath(); h.fill(); });
        put(B, 'armF', T.lg(B, 886, 276, 946, 200, [0, '#ffe04a', 1, '#f8cc2a'])); inside(B, 'armF', function (h) { h.fillStyle = SK[1]; h.save(); T.around(h, 948, 192, 0.25); h.beginPath(); h.ellipse(948, 192, 13, 12, 0, 0, TAU); h.fill(); T.limb(h, [943, 186, 939, 174, 936, 162], 9, 8); T.limb(h, [952, 186, 954, 174, 956, 162], 9, 8); h.restore(); h.fillStyle = '#ff5aa8'; h.save(); T.around(h, 944, 206, 0.4); h.fillRect(934, 202, 22, 6); h.restore(); });
        put(B, 'neck', SK[1]); inside(B, 'neck', function (h) { h.fillStyle = 'rgba(60,20,0,.35)'; h.beginPath(); h.ellipse(852, 254, 16, 6, 0, 0, TAU); h.fill(); });
        put(B, 'head', T.rg(B, 860, 216, 4, 46, [0, SK[0], 0.7, SK[1], 1, SK[2]]));
        put(B, 'hairF', T.lg(B, 0, 166, 0, 220, [0, '#a8602a', 1, '#5a2a10'])); inside(B, 'hairF', function (h) { h.strokeStyle = 'rgba(230,160,90,.75)'; h.lineWidth = 3; [[820, 192], [834, 180], [870, 178], [886, 190]].forEach(function (c) { h.beginPath(); h.arc(c[0], c[1], 7, 3.5, 5.8); h.stroke(); }); });
      } });
    g.strokeStyle = INK; g.lineWidth = 3.5; g.lineCap = 'round'; [[838, 210], [868, 208]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1] + 4, 8, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); });
    g.beginPath(); g.moveTo(838, 228); g.quadraticCurveTo(854, 232, 872, 226); g.quadraticCurveTo(868, 250, 854, 250); g.quadraticCurveTo(840, 250, 838, 228); g.closePath(); g.fillStyle = '#6a0a1a'; g.fill();
    g.save(); g.clip(); g.fillStyle = '#ff6a8a'; g.beginPath(); g.ellipse(855, 250, 12, 8, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(836, 224, 40, 6); g.restore(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = 'rgba(255,90,120,.35)'; g.beginPath(); g.ellipse(828, 226, 7, 4, 0, 0, TAU); g.ellipse(878, 224, 7, 4, 0, 0, TAU); g.fill();
    g.strokeStyle = '#ffc21a'; g.lineWidth = 3; g.beginPath(); g.arc(816, 236, 8, 0, TAU); g.moveTo(896, 234); g.arc(888, 234, 8, 0, TAU); g.stroke();
  }
  /* ---------- the words ---------- */
  function wo(L, c, size, glow) { return { spacing: size * 0.02, dark: L.dark, outline: size * 0.16, depth: size * 0.08, fat: size * 0.006, ring: L.ring, glow: glow, glowBlur: 0.3,
    edge: function () { return sh(c[2], -0.4); }, edgeW: size * 0.07, face: function () { return [0, c[0], 0.5, c[1], 1, c[2]]; } }; }
  function pose(g, T, L, cx, base, size) { var o = wo(L, L.gold, size, 'rgba(56,208,255,.8)'); o.wave = function (j) { return [6, 0, -2, 4][j] * size / 180; }; T.word(g, 'POSE', cx, base, size, o); T.gloss(g, 'POSE', cx, base, size, o, 0.5); }
  function party(g, T, L, cx, base, size, sparkle) { var o = wo(L, L.pink, size, 'rgba(56,208,255,.8)'); o.wave = function (j) { return [0, -3, -5, -3, 0][j] * size / 150; }; T.word(g, 'PARTY', cx, base, size, o); T.gloss(g, 'PARTY', cx, base, size, o, 0.45);
    if (sparkle) [[-0.36, -0.55], [-0.12, -0.3], [0.1, -0.62], [0.32, -0.4], [0.02, -0.15]].forEach(function (p) { T.spark(g, cx + p[0] * size * 3.2, base + p[1] * size, size * 0.07, '#fff', 1); }); }
  function phone(g, T, x, y, w, h) { g.save(); T.rr(g, x, y, w, h, 64); g.lineWidth = 18; g.strokeStyle = T.lin(g, x, y, x + w, y + h, [0, '#6a7ad8', 0.5, '#2a2a7a', 1, '#8a9af0']); g.stroke(); g.lineWidth = 3; g.strokeStyle = '#0a0a3a'; T.rr(g, x - 9, y - 9, w + 18, h + 18, 72); g.stroke(); T.rr(g, x + 9, y + 9, w - 18, h - 18, 56); g.stroke();
    T.rr(g, x + w - 26, y + h / 2 - 70, 20, 140, 10); g.fillStyle = '#0a0a2a'; g.fill(); g.beginPath(); g.arc(x + w - 16, y + h / 2 + 100, 6, 0, TAU); g.fillStyle = '#2a2a5a'; g.fill(); g.restore(); }
  var FX = 22, FY = 14, FW = 980, FH = 544;
  function screen(g, T, L, full) {
    g.save(); T.rr(g, FX, FY, FW, FH, 64); g.clip(); back(g, T, L, FX, FY, FW, FH, full);
    g.save(); g.globalAlpha = 0.85; ghost(g, T, 380, 78, 0.82, 'flex'); ghost(g, T, 512, 76, 0.82, 'heart'); if (full) ghost(g, T, 548, 498, 0.7, 'flex'); g.restore();
    camera(g, T, 726, 120, 0.95, true); marks(g, T); boy(g, T); girl(g, T); g.restore();
    pose(g, T, L, 510, 288, 186); party(g, T, L, 532, 432, 146, true);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = '#14086a'; g.fillRect(0, 0, 1024, 572); screen(g, T, L, true); phone(g, T, FX, FY, FW, FH); return; }
    if (kind === 'main') { g.translate(-12, -6); screen(g, T, L, px >= 300); phone(g, T, FX, FY, FW, FH); return; }
    if (kind === 'wide') { g.save(); g.translate(84, 104); camera(g, T, 0, 0, 0.74, false); g.restore(); pose(g, T, L, 318, 148, 98); party(g, T, L, 660, 148, 94, false); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 10, 10, 380, 380, 70); g.clip(); back(g, T, L, 10, 10, 380, 380, false); g.restore(); T.rr(g, 10, 10, 380, 380, 70); g.lineWidth = 10; g.strokeStyle = '#2a2a8a'; g.stroke();
      if (px >= 90) { camera(g, T, 300, 92, 0.62, true); pose(g, T, L, 190, 230, 118); party(g, T, L, 200, 346, 96, false); } else { camera(g, T, 200, 200, 1.4, true); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO pose-party END

// 🏷️ LOGO robot-adventure START — 🤖 Code the Robot, drawn in code from Aowu's picture (gl-17, round 6). The friendly robot (one-piece body, depth from colour)
// waving and holding a ▶ ball, a glowing path of arrow tiles winding up to a FINISH gate, arrow signs, map pins, stars, pixel trees, floating code windows
// and </> tags, a neon grid floor; "CODE THE" gold over "ROBOT" ice-blue. Looks = the game's worlds (CodeRobot.html WORLDS: floor colours → sky, road, floor).
GameLogos.add('robot-adventure', (function () {
  var BOX = { scene: [1024, 572], main: [664, 560], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { sky: ['#5ac8ff', '#bdeeff', '#e8fbff'], hill: ['#6ad05a', '#3a9a4a'], road: ['#3a8ad8', '#2a5ab8'], edge: '#7af0ff', floor: ['#3a1a7a', '#1a0a4a'], grid: '#c05aff', tree: ['#2ac8a8', '#6ad86a', '#3a9ad8'], dark: '#0e1a4a',
    a: ['#fff6a0', '#ffd21a', '#ff9a0a'], b: ['#e0fbff', '#5ad0ff', '#1a6ae8'] };
    for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    park: mk({ sky: ['#7ad0ff', '#d8f4ff', '#eefaf0'], road: ['#E3F4D7', '#9ac87a'], edge: '#8affa8', hill: ['#8ad86a', '#4aa84a'] }),
    city: mk({ sky: ['#8ab8e8', '#d0e0f4', '#eef2f8'], road: ['#E7E9EE', '#9aa4b8'], edge: '#ffd23a', hill: ['#9aa8b8', '#6a7890'], tree: ['#7a8aa8', '#a8b8d0', '#5a6a88'] }),
    farm: mk({ sky: ['#8ad8ff', '#fff4d8', '#fff8e8'], road: ['#F6EBCF', '#d8b878'], edge: '#ffb84a', hill: ['#b8d86a', '#88a83a'] }),
    moon: mk({ sky: ['#0a0c2a', '#2C2F4A', '#363A5B'], road: ['#363A5B', '#1e2040'], edge: '#b0a0ff', hill: ['#4a4e70', '#2a2e4a'], tree: ['#6a5ad8', '#8a7af0', '#4a3ab8'] }),
    beach: mk({ sky: ['#4ac0f0', '#bff0ff', '#FFF2CC'], road: ['#FFF2CC', '#e8c878'], edge: '#3ad8f0', hill: ['#f0d898', '#d8b868'] }),
    snow: mk({ sky: ['#9ad0f8', '#e4f2ff', '#f4faff'], road: ['#EEF6FF', '#a8c8e8'], edge: '#8ad8ff', hill: ['#ffffff', '#c8dcf0'], tree: ['#3a8a6a', '#5aa88a', '#2a6a5a'] }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* ---------- the world ---------- */
  function sky(g, T, L) {
    g.fillStyle = T.lin(g, 0, 0, 0, 430, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 430);
    g.fillStyle = 'rgba(255,255,255,.85)'; [[640, 60, 50], [380, 40, 36], [980, 110, 40]].forEach(function (c) { g.beginPath(); g.ellipse(c[0], c[1], c[2] * 1.6, c[2] * 0.55, 0, 0, TAU); g.ellipse(c[0] + c[2] * 0.4, c[1] - c[2] * 0.3, c[2] * 0.8, c[2] * 0.5, 0, 0, TAU); g.fill(); });
    g.fillStyle = L.hill[0]; g.beginPath(); g.moveTo(0, 300); g.quadraticCurveTo(160, 230, 330, 290); g.lineTo(330, 430); g.lineTo(0, 430); g.closePath(); g.fill();
    g.fillStyle = L.hill[1]; g.beginPath(); g.moveTo(0, 340); g.quadraticCurveTo(140, 300, 280, 350); g.lineTo(280, 430); g.lineTo(0, 430); g.closePath(); g.fill();
  }
  function pixelTree(g, x, y, s, cols) {   // trunk + a crown made of squares
    g.fillStyle = '#7a4a2a'; g.fillRect(x - 6 * s, y - 70 * s, 12 * s, 70 * s); g.fillRect(x - 6 * s, y - 50 * s, -18 * s, 8 * s);
    var r = GameLogos.tools.rng(Math.round(x)); for (var i = 0; i < 110; i++) { var a = r() * TAU, d = Math.sqrt(r()) * 52 * s, q = (12 + r() * 10) * s; g.fillStyle = cols[i % cols.length]; g.globalAlpha = 0.85 + r() * 0.15; g.fillRect(x + Math.cos(a) * d * 1.2 - q / 2, y - 100 * s + Math.sin(a) * d * 0.8 - q / 2, q, q); } g.globalAlpha = 1;
  }
  function codeWin(g, T, x, y, w, h, c) { g.save(); g.shadowColor = c || '#5ad0ff'; g.shadowBlur = 10; T.rr(g, x, y, w, h, 8); g.fillStyle = c ? T.lin(g, 0, y, 0, y + h, [0, sh(c, 0.2), 1, c]) : '#1a2a5a'; g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x, y, w, h * 0.16); var cols = c ? ['rgba(255,255,255,.75)'] : ['#5ad0ff', '#ffd23a', '#ff6ab8', '#7af07a']; for (var i = 0; i < 3; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(x + w * 0.12, y + h * (0.32 + i * 0.2), w * (0.35 + (i % 2) * 0.3), h * 0.08); } }
  function tag(g, T, x, y, s, c) { g.save(); g.font = '700 ' + s + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = s * 0.22; g.lineJoin = 'round'; g.strokeStyle = '#1a2a5a'; g.strokeText('</>', x, y); g.fillStyle = c || '#ffc81a'; g.shadowColor = c || '#ffc81a'; g.shadowBlur = 10; g.fillText('</>', x, y); g.restore(); }
  function floor(g, T, L) {   // neon grid floor in perspective
    g.fillStyle = T.lin(g, 0, 400, 0, 572, [0, L.floor[0], 1, L.floor[1]]); g.fillRect(0, 400, 1024, 172);
    g.save(); g.strokeStyle = L.grid; g.lineWidth = 2; g.shadowColor = L.grid; g.shadowBlur = 8; g.globalAlpha = 0.8;
    for (var i = 0; i < 5; i++) { var y = 410 + Math.pow(i / 4, 1.6) * 160; g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    for (var k = -9; k <= 9; k++) { g.beginPath(); g.moveTo(512 + k * 40, 400); g.lineTo(512 + k * 140, 572); g.stroke(); } g.restore();
  }
  function road(g, T, L) {   // the glowing tile walkway, wide in front and narrowing into the distance, purple side wall, neon edges, arrow tiles
    var S1 = [560, 600, 800, 430, 742, 262], S2 = [742, 262, 700, 120, 872, 64];
    function pt(p, t) { var u = 1 - t; return [u * u * p[0] + 2 * u * t * p[2] + t * t * p[4], u * u * p[1] + 2 * u * t * p[3] + t * t * p[5]]; }
    function nrm(p, t) { var u = 1 - t, dx = 2 * u * (p[2] - p[0]) + 2 * t * (p[4] - p[2]), dy = 2 * u * (p[3] - p[1]) + 2 * t * (p[5] - p[3]), d = Math.hypot(dx, dy) || 1; return [-dy / d, dx / d]; }
    var L1 = [], R1 = [], RAILS = [], N = 40;
    for (var i = 0; i <= N; i++) { var t = i / N, seg = t < 0.62 ? S1 : S2, tt = t < 0.62 ? t / 0.62 : (t - 0.62) / 0.38, c = pt(seg, tt), n = nrm(seg, tt), w = 300 * Math.pow(1 - t, 1.35) + 34; L1.push([c[0] - n[0] * w / 2, c[1] - n[1] * w / 2]); R1.push([c[0] + n[0] * w / 2, c[1] + n[1] * w / 2]); RAILS.push([c, n, w]); }
    function poly(dy) { g.beginPath(); L1.forEach(function (q, i) { g[i ? 'lineTo' : 'moveTo'](q[0], q[1] + (dy || 0)); }); for (var j = R1.length - 1; j >= 0; j--) g.lineTo(R1[j][0], R1[j][1] + (dy || 0)); g.closePath(); }
    // purple side wall under the walkway
    g.save(); poly(26); g.fillStyle = T.lin(g, 0, 60, 0, 572, [0, '#5a2aa8', 1, '#2a0a6a']); g.fill(); g.restore();
    g.save(); poly(0); g.shadowColor = L.edge; g.shadowBlur = 26; g.fillStyle = T.lin(g, 0, 60, 0, 572, [0, sh(L.road[1], -0.15), 1, sh(L.road[1], -0.45)]); g.fill(); g.restore();
    g.save(); poly(0); g.clip();
    // tiles: cross lines every step (closer together far away) + lane lines
    g.strokeStyle = L.edge; g.lineWidth = 2.5; g.shadowColor = L.edge; g.shadowBlur = 8; g.globalAlpha = 0.85;
    for (var k = 0; k < N; k += 2) { var a = L1[k], b2 = R1[k]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b2[0], b2[1]); g.stroke(); }
    [-0.25, 0.25].forEach(function (f) { g.beginPath(); RAILS.forEach(function (r, i) { var x = r[0][0] + r[1][0] * r[2] * f, y = r[0][1] + r[1][1] * r[2] * f; g[i ? 'lineTo' : 'moveTo'](x, y); }); g.stroke(); });
    g.globalAlpha = 1; g.shadowBlur = 0; g.fillStyle = T.lin(g, 0, 60, 0, 572, [0, 'rgba(160,240,255,.25)', 1, 'rgba(160,240,255,0)']); g.fillRect(500, 0, 524, 572); g.restore();
    // neon edges
    g.save(); g.lineWidth = 6; g.strokeStyle = L.edge; g.shadowColor = L.edge; g.shadowBlur = 14; g.lineJoin = 'round'; [L1, R1].forEach(function (E) { g.beginPath(); E.forEach(function (q, i) { g[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); g.stroke(); }); g.restore();
    // arrow tiles along the middle
    [[0.1, 1.5], [0.3, 1.1], [0.5, 0.8]].forEach(function (q) { var i = Math.round(q[0] * N), r = RAILS[i], nx = RAILS[Math.min(N, i + 1)][0], an = Math.atan2(nx[1] - r[0][1], nx[0] - r[0][0]); g.save(); g.translate(r[0][0], r[0][1]); g.rotate(an); g.scale(q[1], q[1]); g.fillStyle = 'rgba(255,190,60,.95)'; g.shadowColor = '#ffb84a'; g.shadowBlur = 12; g.beginPath(); g.moveTo(22, 0); g.lineTo(-2, -20); g.lineTo(-2, -9); g.lineTo(-22, -9); g.lineTo(-22, 9); g.lineTo(-2, 9); g.lineTo(-2, 20); g.closePath(); g.fill(); g.restore(); });
  }
  function sign(g, T, x, y, s, dir) { g.fillStyle = '#5a6a8a'; g.fillRect(x - 2.5 * s, y, 5 * s, 34 * s); g.save(); g.shadowColor = '#5ad0ff'; g.shadowBlur = 10; T.rr(g, x - 18 * s, y - 32 * s, 36 * s, 32 * s, 6 * s); g.fillStyle = T.lin(g, 0, y - 32 * s, 0, y, [0, '#5a9aff', 1, '#1a4ab8']); g.fill(); g.restore();
    g.save(); g.translate(x, y - 16 * s); g.rotate(dir); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -11 * s); g.lineTo(9 * s, 0); g.lineTo(3.5 * s, 0); g.lineTo(3.5 * s, 10 * s); g.lineTo(-3.5 * s, 10 * s); g.lineTo(-3.5 * s, 0); g.lineTo(-9 * s, 0); g.closePath(); g.fill(); g.restore(); }
  function mapPin(g, x, y, s, c) { g.beginPath(); g.moveTo(x, y + 14 * s); g.bezierCurveTo(x - 12 * s, y + 2 * s, x - 10 * s, y - 12 * s, x, y - 12 * s); g.bezierCurveTo(x + 10 * s, y - 12 * s, x + 12 * s, y + 2 * s, x, y + 14 * s); g.fillStyle = c; g.fill(); g.beginPath(); g.arc(x, y - 2 * s, 5 * s, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
  function finish(g, T) { g.fillStyle = '#3a4a6a'; g.fillRect(784, 30, 5, 70); g.fillRect(842, 30, 5, 70); T.rr(g, 780, 32, 70, 26, 4); g.fillStyle = '#1a2a5a'; g.fill(); g.font = '700 15px ' + T.FONT; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FINISH', 815, 46); }
  /* ---------- the robot (one-piece body, depth from colour) ---------- */
  function robot(g, T, L, dx, dy, s) {
    g.save(); g.translate(dx, dy); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; var INK = '#1a2a5a', SH = 'rgba(30,50,110,';
    var WH = ['#ffffff', '#e4ecf6', '#b8c8dc', '#8aa0bc'], BL = ['#9ad0ff', '#4a8ae8', '#2a5ab8'];
    var P = {
      antenna: function (h) { h.fillRect(511, 40, 8, 34); h.beginPath(); h.arc(515, 36, 13, 0, TAU); h.fill(); },
      armL: function (h) { T.limb(h, [462, 252, 420, 262, 398, 236], 30, 26, 4); T.limb(h, [398, 236, 380, 216, 372, 196], 26, 22); h.beginPath(); h.ellipse(366, 186, 20, 24, -0.3, 0, TAU); h.fill(); [[-14, -26], [-4, -32], [8, -30], [18, -22]].forEach(function (f) { T.limb(h, [366, 182, 366 + f[0] * 0.6, 182 + f[1] * 0.6, 366 + f[0], 182 + f[1]], 9, 7); }); T.limb(h, [380, 196, 394, 190, 400, 178], 9, 7); },
      armR: function (h) { T.limb(h, [568, 256, 610, 272, 630, 250], 30, 26, 4); h.beginPath(); h.ellipse(636, 244, 18, 16, 0.4, 0, TAU); h.fill(); },
      torso: function (h) { h.beginPath(); h.moveTo(470, 238); h.bezierCurveTo(480, 228, 550, 228, 562, 238); h.bezierCurveTo(574, 270, 562, 320, 516, 326); h.bezierCurveTo(470, 320, 458, 270, 470, 238); h.closePath(); h.fill(); h.beginPath(); h.ellipse(470, 248, 18, 16, 0, 0, TAU); h.ellipse(562, 248, 18, 16, 0, 0, TAU); h.fill(); },
      ears: function (h) { h.beginPath(); h.ellipse(414, 152, 22, 30, 0, 0, TAU); h.ellipse(616, 152, 22, 30, 0, 0, TAU); h.fill(); },
      head: function (h) { h.beginPath(); h.moveTo(422, 150); h.bezierCurveTo(420, 92, 466, 66, 515, 66); h.bezierCurveTo(564, 66, 610, 92, 608, 150); h.bezierCurveTo(608, 200, 580, 230, 515, 232); h.bezierCurveTo(450, 230, 422, 200, 422, 150); h.closePath(); h.fill(); }
    };
    onePiece();
    function onePiece() {
      T.onePiece(g, T, { x0: 330, y0: 14, W: 330, H: 330, rim: INK, rimW: 4.4, parts: P, order: ['antenna', 'armR', 'torso', 'armL', 'ears', 'head'],
        colour: function (B, put, inside) {
          put(B, 'antenna', '#8aa0bc'); inside(B, 'antenna', function (h) { h.beginPath(); h.arc(515, 36, 13, 0, TAU); h.fillStyle = T.rad(h, 510, 31, 1, 14, [0, '#ffe08a', 0.5, '#ff9a2a', 1, '#d8600a']); h.fill(); });
          put(B, 'armR', T.lg(B, 568, 240, 640, 270, [0, WH[2], 1, WH[3]])); inside(B, 'armR', function (h) { h.beginPath(); h.ellipse(636, 244, 18, 16, 0.4, 0, TAU); h.fillStyle = BL[1]; h.fill(); });
          put(B, 'torso', T.lg(B, 470, 230, 562, 326, [0, WH[0], 0.55, WH[1], 1, WH[2]]));
          inside(B, 'torso', function (h) { h.fillStyle = T.rg(h, 515, 232, 4, 50, [0, SH + '.45)', 1, SH + '0)']); h.fillRect(460, 226, 110, 50); h.fillStyle = BL[1]; h.beginPath(); h.ellipse(470, 248, 18, 16, 0, 0, TAU); h.ellipse(562, 248, 18, 16, 0, 0, TAU); h.fill(); });
          put(B, 'armL', SH + '.3)', 5, 8); put(B, 'armL', T.lg(B, 460, 250, 366, 180, [0, WH[1], 0.5, WH[0], 1, WH[1]]));
          inside(B, 'armL', function (h) { h.fillStyle = BL[1]; h.beginPath(); h.ellipse(366, 186, 20, 24, -0.3, 0, TAU); h.fill(); [[-14, -26], [-4, -32], [8, -30], [18, -22]].forEach(function (f) { h.save(); h.fillStyle = BL[1]; T.limb(h, [366, 182, 366 + f[0] * 0.6, 182 + f[1] * 0.6, 366 + f[0], 182 + f[1]], 9, 7); h.restore(); }); h.save(); h.fillStyle = BL[1]; T.limb(h, [380, 196, 394, 190, 400, 178], 9, 7); h.restore(); h.fillStyle = BL[2]; h.beginPath(); h.ellipse(398, 236, 11, 11, 0, 0, TAU); h.fill(); });
          put(B, 'ears', T.rg(B, 410, 145, 2, 34, [0, '#ffe08a', 0.5, '#ffaa2a', 1, '#c8640a']));
          put(B, 'head', T.rg(B, 488, 104, 8, 150, [0, WH[0], 0.45, WH[1], 0.8, WH[2], 1, WH[3]]));
          inside(B, 'head', function (h) {   // orange visor band over the top, the dark screen face
            h.fillStyle = T.lg(h, 0, 70, 0, 110, [0, '#ffd04a', 1, '#ff8a1a']); h.beginPath(); h.moveTo(428, 112); h.bezierCurveTo(440, 74, 590, 74, 602, 112); h.lineTo(592, 120); h.bezierCurveTo(580, 92, 450, 92, 438, 120); h.closePath(); h.fill();
            GameLogos.tools.rr(h, 446, 108, 138, 104, 34); h.fillStyle = T.lg(h, 0, 108, 0, 212, [0, '#2a3a6a', 1, '#0a1230']); h.fill();
            h.fillStyle = 'rgba(255,255,255,.55)'; h.beginPath(); h.ellipse(452, 104, 18, 10, -0.5, 0, TAU); h.fill(); });
        } });
    }
    // face: glowing ring eyes + smile, highlight on the screen
    g.save(); g.shadowColor = '#5af0ff'; g.shadowBlur = 14; g.strokeStyle = '#6af4ff'; g.lineWidth = 6; [[484, 158], [546, 158]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 16, 0, TAU); g.stroke(); }); g.restore();
    g.fillStyle = '#e8ffff'; [[484, 158], [546, 158]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 8, 0, TAU); g.fill(); g.beginPath(); g.arc(e[0] - 4, e[1] - 4, 3, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.fillStyle = '#e8ffff'; });
    g.save(); g.shadowColor = '#ffd04a'; g.shadowBlur = 10; g.strokeStyle = '#ffd04a'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.arc(515, 182, 18, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); g.restore();
    g.fillStyle = 'rgba(255,255,255,.18)'; GameLogos.tools.rr(g, 456, 114, 40, 14, 7); g.fill();
    // chest light + the ▶ ball in the right hand
    g.save(); g.shadowColor = '#ffb84a'; g.shadowBlur = 16; g.beginPath(); g.arc(515, 282, 15, 0, TAU); g.fillStyle = T.rad(g, 511, 278, 1, 16, [0, '#fff4c0', 0.5, '#ffb81a', 1, '#d0700a']); g.fill(); g.restore(); g.beginPath(); g.arc(515, 282, 15, 0, TAU); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    g.save(); g.shadowColor = '#5ad0ff'; g.shadowBlur = 18; g.beginPath(); g.arc(650, 230, 28, 0, TAU); g.fillStyle = T.rad(g, 642, 222, 2, 30, [0, '#8ae0ff', 0.55, '#2a7ae8', 1, '#103a9a']); g.fill(); g.restore(); g.beginPath(); g.arc(650, 230, 28, 0, TAU); g.lineWidth = 4; g.strokeStyle = '#ffc81a'; g.stroke();
    g.beginPath(); g.moveTo(642, 216); g.lineTo(664, 230); g.lineTo(642, 244); g.closePath(); g.fillStyle = '#fff'; g.fill();
    g.save(); g.fillStyle = BL[1]; g.beginPath(); g.ellipse(632, 252, 12, 9, 0.2, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.restore();
    g.restore();
  }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    function o(c, sz) { return { spacing: sz * 0.01, dark: L.dark, outline: sz * 0.2, depth: sz * 0.09, fat: sz * 0.006, ring: 'rgba(255,255,255,.9)', edge: function () { return sh(c[2], -0.45); }, edgeW: sz * 0.075, face: function () { return [0, c[0], 0.45, c[1], 1, c[2]]; } }; }
    var s1 = 98 * k, s2 = 126 * k, A = o(L.a, s1), B = o(L.b, s2);
    if (oneLine) { s2 = s1; B = o(L.b, s2); g.save(); g.font = '700 ' + s1 + 'px ' + T.FONT; var w1 = g.measureText('CODE THE').width + 7 * s1 * 0.01, w2 = g.measureText('ROBOT').width + 4 * s1 * 0.01; g.restore(); var gap = 28 * k, x0 = cx - (w1 + gap + w2) / 2;
      T.word(g, 'CODE THE', x0 + w1 / 2, y1, s1, A); T.gloss(g, 'CODE THE', x0 + w1 / 2, y1, s1, A, 0.45); T.word(g, 'ROBOT', x0 + w1 + gap + w2 / 2, y1, s2, B); T.gloss(g, 'ROBOT', x0 + w1 + gap + w2 / 2, y1, s2, B, 0.45); return; }
    B.glow = '#5ad0ff'; B.glowN = 2; B.glowBlur = 0.3;
    T.word(g, 'ROBOT', cx, y2, s2, B); T.gloss(g, 'ROBOT', cx, y2, s2, B, 0.45);
    A.glow = 'rgba(255,200,60,.8)'; A.glowBlur = 0.25; T.word(g, 'CODE THE', cx, y1, s1, A); T.gloss(g, 'CODE THE', cx, y1, s1, A, 0.45);
  }
  function scene(g, T, L) {
    sky(g, T, L); floor(g, T, L);
    pixelTree(g, 70, 240, 1.15, L.tree); pixelTree(g, 210, 230, 0.9, L.tree.slice().reverse()); pixelTree(g, 130, 300, 0.7, L.tree);
    road(g, T, L); finish(g, T);
    sign(g, T, 746, 100, 0.9, 0); sign(g, T, 858, 180, 1, 0); sign(g, T, 912, 286, 1.1, Math.PI / 2); sign(g, T, 930, 470, 1.4, Math.PI / 2);
    mapPin(g, 718, 138, 1.3, '#a05af0'); mapPin(g, 796, 182, 1.1, '#ff8a2e'); mapPin(g, 756, 270, 1.2, '#a05af0');
    [[882, 66, 14], [924, 70, 10], [804, 244, 13], [770, 380, 10]].forEach(function (s2) { g.save(); g.fillStyle = '#ffc81a'; g.strokeStyle = '#c8901a'; g.lineWidth = 2; T.star(g, s2[0], s2[1], s2[2], s2[2] * 0.46); g.fill(); g.stroke(); g.restore(); });
    g.save(); g.translate(964, 46); g.fillStyle = T.lin(g, 0, -24, 0, 26, [0, '#ffd04a', 1, '#ff6a1a']); g.shadowColor = '#ffb84a'; g.shadowBlur = 12; g.beginPath(); g.moveTo(0, -26); g.lineTo(22, -2); g.lineTo(9, -2); g.lineTo(9, 26); g.lineTo(-9, 26); g.lineTo(-9, -2); g.lineTo(-22, -2); g.closePath(); g.fill(); g.restore();
    codeWin(g, T, 270, 34, 92, 58); codeWin(g, T, 120, 240, 108, 52, '#ff9a4a'); codeWin(g, T, 86, 330, 76, 40, '#ff9a4a'); codeWin(g, T, 920, 150, 90, 50); codeWin(g, T, 976, 446, 70, 60, '#ff9a4a');
    g.save(); g.shadowColor = '#a05af0'; g.shadowBlur = 12; T.rr(g, 40, 384, 64, 64, 10); g.fillStyle = '#7a3ad8'; g.fill(); g.restore(); tag(g, T, 72, 416, 26, '#fff');
    tag(g, T, 268, 312, 30); tag(g, T, 246, 464, 26);
    var r = T.rng(3); for (var i = 0; i < 22; i++) T.spark(g, r() * 1024, r() * 400, 4 + r() * 8, '#fff', 0.7 + r() * 0.3);
    robot(g, T, L, 0, 0, 1);
    words(g, T, L, 535, 398, 512, 1);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { scene(g, T, L); return; }
    if (kind === 'main') { g.save(); T.rr(g, 0, 0, 664, 560, 72); g.clip(); g.translate(-196, -6); scene(g, T, L); g.restore(); T.rr(g, 3, 3, 658, 554, 70); g.lineWidth = 6; g.strokeStyle = L.edge; g.stroke(); return; }
    if (kind === 'wide') { g.save(); g.beginPath(); g.arc(100, 100, 92, 0, TAU); g.clip(); g.fillStyle = T.lin(g, 0, 0, 0, 200, [0, L.sky[0], 1, L.sky[1]]); g.fillRect(0, 0, 200, 200); g.translate(100, 112); g.scale(0.62, 0.62); g.translate(-515, -170); robot(g, T, L, 0, 0, 1); g.restore();
      g.beginPath(); g.arc(100, 100, 92, 0, TAU); g.lineWidth = 6; g.strokeStyle = L.edge; g.stroke(); words(g, T, L, 540, 138, 0, 0.72, true); return; }
    if (kind === 'badge') {
      g.save(); T.rr(g, 10, 10, 380, 380, 86); g.clip();
      if (px >= 90) { g.translate(200, 200); g.scale(0.62, 0.62); g.translate(-532, -300); scene(g, T, L); }
      else { g.fillStyle = T.lin(g, 0, 0, 0, 400, [0, L.sky[0], 1, L.sky[1]]); g.fillRect(0, 0, 400, 400); g.translate(200, 230); g.scale(1.25, 1.25); g.translate(-515, -170); robot(g, T, L, 0, 0, 1); }
      g.restore(); T.rr(g, 12, 12, 376, 376, 84); g.lineWidth = 7; g.strokeStyle = L.edge; g.stroke(); return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO robot-adventure END

// 🏷️ LOGO sciencetory START — 🔬 Sciencetory, drawn in code from Aowu's picture (gl-12)
GameLogos.add('sciencetory', (function () {
  var BOX = { scene: [1024, 572], main: [780, 520], wide: [860, 200], badge: [400, 400] };
  var LOOK = { classic: { sky: ['#141a4a', '#0a0e30', '#05071c'], plate: ['#141a52', '#0c1038'], rim: ['#c05af0', '#6a8af5', '#3fe0f0'], dark: '#140a4a',
    letters: [['#fff36a', '#ffb81a', '#ff7a14'], ['#ffd23a', '#ff9a1c', '#ff6a2a'], ['#ffb02a', '#ff7a3a', '#ff4a6a'], ['#ff8a4a', '#ff5a7a', '#f03aa8'], ['#ff6a8a', '#f04ac0', '#c83ae0'], ['#f05ad0', '#b04af0', '#7a5af5'], ['#b06af5', '#6a7af5', '#3f9af5'], ['#6a9af5', '#3fb4f5', '#2fd0f0'], ['#4fc0f5', '#2fd8f0', '#3fe8d8'], ['#3fd8f5', '#3fe8d0', '#6af0b0'], ['#5ae8f0', '#6af0c0', '#a8f58a']] } };
  var TAU = Math.PI * 2;
  function flask(g, T, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.12); g.lineJoin = 'round'; g.lineCap = 'round';
    function body() { g.beginPath(); g.moveTo(-14, -70); g.lineTo(-14, -22); g.quadraticCurveTo(-56, 16, -48, 50); g.quadraticCurveTo(-42, 70, 0, 70); g.quadraticCurveTo(42, 70, 48, 50); g.quadraticCurveTo(56, 16, 14, -22); g.lineTo(14, -70); g.closePath(); }
    g.save(); g.shadowColor = '#7dffb0'; g.shadowBlur = 26; body(); g.fillStyle = 'rgba(190,240,255,.35)'; g.fill(); g.restore();
    g.save(); body(); g.clip(); g.fillStyle = T.lin(g, -50, 0, 50, 70, [0, '#ffe14a', 0.3, '#7dff7a', 0.6, '#3fe0d8', 1, '#b06af5']); g.fillRect(-60, 8, 120, 70); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(0, 8, 44, 7, 0, 0, TAU); g.fill(); [[-18, 34, 8], [14, 46, 6], [24, 26, 5], [-6, 54, 5]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fillStyle = 'rgba(255,255,255,.55)'; g.fill(); }); g.restore();
    body(); g.lineWidth = 6; g.strokeStyle = '#bfeaff'; g.stroke(); g.lineWidth = 2.5; g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(-34, 18); g.quadraticCurveTo(-40, 42, -24, 58); g.stroke();
    T.rr(g, -20, -80, 40, 12, 6); g.fillStyle = '#dff6ff'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#8fc8f0'; g.stroke();
    [[-6, -104, 11, '#ff8ad8'], [18, -124, 8, '#ffb02e'], [-22, -134, 6, '#7dff7a'], [8, -150, 9, '#ff6a4a']].forEach(function (b) { g.save(); g.shadowColor = b[3]; g.shadowBlur = 12; g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fillStyle = b[3]; g.fill(); g.restore(); });
    g.restore();
  }
  function atom(g, T, x, y, R) { g.save(); g.translate(x, y); g.lineCap = 'round'; [0.5, -0.55, 1.57].forEach(function (a, i) { g.save(); g.rotate(a); var c = ['#ff8ad8', '#5ff0ff', '#ffb02e'][i]; g.shadowColor = c; g.shadowBlur = 14; g.beginPath(); g.ellipse(0, 0, R, R * 0.36, 0, 0, TAU); g.lineWidth = 4.5; g.strokeStyle = c; g.stroke(); g.beginPath(); g.arc(R, 0, 6, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); }); g.shadowColor = '#ffb02e'; g.shadowBlur = 22; g.beginPath(); g.arc(0, 0, R * 0.2, 0, TAU); g.fillStyle = T.rad(g, -3, -3, 1, R * 0.22, [0, '#fff6c0', 1, '#ff8a2a']); g.fill(); g.restore(); }
  function dna(g, T, x, y, len, rot, k) { g.save(); g.translate(x, y); g.rotate(rot); g.lineCap = 'round'; var n = 26; for (var pass = 0; pass < 2; pass++) { g.beginPath(); for (var i = 0; i <= n; i++) { var t = i / n, yy = (t - 0.5) * len, xx = Math.sin(t * Math.PI * 3 + pass * Math.PI) * 16 * k; g[i ? 'lineTo' : 'moveTo'](xx, yy); } var c = pass ? '#5ff0ff' : '#ff8ad8'; g.shadowColor = c; g.shadowBlur = 12; g.lineWidth = 5 * k; g.strokeStyle = c; g.stroke(); }
    g.shadowBlur = 0; for (i = 1; i < n; i += 2) { var t2 = i / n, y2 = (t2 - 0.5) * len, x2 = Math.sin(t2 * Math.PI * 3) * 16 * k; g.beginPath(); g.moveTo(-x2, y2); g.lineTo(x2, y2); g.lineWidth = 2.5 * k; g.strokeStyle = ['#ffe14a', '#7dff7a', '#b08aff'][i % 3]; g.stroke(); } g.restore(); }
  function robot(g, T, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; var INK = '#2a3a8a', W = ['#ffffff', '#dceaff', '#a8c0f0'];
    g.save(); g.shadowColor = 'rgba(140,220,255,.9)'; g.shadowBlur = 26; T.rr(g, -50, -44, 100, 78, 34); g.fillStyle = W[1]; g.fill(); g.restore();
    g.beginPath(); g.moveTo(-34, 44); g.quadraticCurveTo(-66, 30, -70, -4); g.lineWidth = 18; g.strokeStyle = INK; g.stroke(); g.lineWidth = 11; g.strokeStyle = W[1]; g.stroke(); g.beginPath(); g.arc(-72, -14, 13, 0, TAU); g.fillStyle = W[0]; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    [-0.5, 0, 0.5].forEach(function (a) { g.beginPath(); g.moveTo(-72 + Math.sin(a) * 9, -14 - Math.cos(a) * 9); g.lineTo(-72 + Math.sin(a) * 24, -14 - Math.cos(a) * 24); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.lineWidth = 5; g.strokeStyle = W[0]; g.stroke(); });
    g.beginPath(); g.moveTo(-30, 36); g.quadraticCurveTo(0, 28, 30, 36); g.quadraticCurveTo(40, 76, 26, 100); g.quadraticCurveTo(0, 108, -26, 100); g.quadraticCurveTo(-40, 76, -30, 36); g.closePath(); g.fillStyle = T.lin(g, -36, 0, 36, 0, [0, W[0], 0.6, W[1], 1, W[2]]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.arc(0, 64, 10, 0, TAU); g.fillStyle = '#5ff0ff'; g.shadowColor = '#5ff0ff'; g.shadowBlur = 12; g.fill(); g.shadowBlur = 0;
    g.beginPath(); g.moveTo(0, -44); g.lineTo(0, -62); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(0, -66, 7, 0, TAU); g.fillStyle = '#ffb02e'; g.shadowColor = '#ffd23e'; g.shadowBlur = 12; g.fill(); g.shadowBlur = 0;
    [-1, 1].forEach(function (k) { T.rr(g, k * 54 - 8, -18, 16, 30, 7); g.fillStyle = '#6a8af5'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); });
    T.rr(g, -50, -44, 100, 78, 34); g.fillStyle = T.lin(g, -50, -44, 50, 34, [0, W[0], 0.6, W[1], 1, W[2]]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    T.rr(g, -38, -30, 76, 50, 22); g.fillStyle = '#10163c'; g.fill(); g.strokeStyle = '#5ff0ff'; g.shadowColor = '#5ff0ff'; g.shadowBlur = 10; g.lineWidth = 6; g.beginPath(); g.arc(-17, -6, 8, 0, TAU); g.stroke(); g.beginPath(); g.arc(17, -6, 8, 0, TAU); g.stroke(); g.lineWidth = 4.5; g.beginPath(); g.arc(0, 4, 10, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = 'rgba(255,120,170,.6)'; g.beginPath(); g.ellipse(-28, 8, 5, 3.5, 0, 0, TAU); g.ellipse(28, 8, 5, 3.5, 0, 0, TAU); g.fill();
    g.restore();
  }
  function scope(g, T, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = '#5a4a9a'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 18); g.lineTo(-22, 74); g.moveTo(0, 18); g.lineTo(22, 74); g.moveTo(0, 18); g.lineTo(0, 76); g.stroke();
    g.rotate(-0.5); T.rr(g, -50, -16, 84, 32, 8); g.fillStyle = T.lin(g, 0, -16, 0, 16, [0, '#d8c8ff', 0.5, '#a88af5', 1, '#6a4ad0']); g.fill(); g.lineWidth = 5; g.strokeStyle = '#2a1a6a'; g.stroke(); T.rr(g, 30, -22, 30, 44, 8); g.fillStyle = '#b89af8'; g.fill(); g.stroke(); T.rr(g, -66, -10, 20, 20, 5); g.fillStyle = '#8a6ae8'; g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(-44, -11, 70, 5); g.restore(); }
  function plate(g, T, L, x, y, w, h) {
    g.save(); g.shadowColor = L.rim[0]; g.shadowBlur = 36; T.rr(g, x, y, w, h, 66); g.fillStyle = T.lin(g, x, y, x + w, y + h, [0, L.plate[0], 1, L.plate[1]]); g.fill(); g.shadowColor = L.rim[2]; g.shadowBlur = 20; g.fill(); g.shadowBlur = 0;
    g.save(); T.rr(g, x, y, w, h, 66); g.clip(); g.globalAlpha = 0.5; g.strokeStyle = '#7a5af0'; g.lineWidth = 26; g.beginPath(); g.ellipse(x + w * 0.5, y + h * 0.56, w * 0.6, h * 0.22, -0.3, 0, TAU); g.stroke(); g.strokeStyle = '#3fd0f0'; g.lineWidth = 12; g.beginPath(); g.ellipse(x + w * 0.5, y + h * 0.6, w * 0.5, h * 0.14, -0.3, 0, TAU); g.stroke(); g.globalAlpha = 1;
    var r = T.rng(4); for (var i = 0; i < 70; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillStyle = ['#fff', '#ffe14a', '#ff8ad8', '#5ff0ff'][i % 4]; g.beginPath(); g.arc(x + r() * w, y + r() * h, 0.8 + r() * 2, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore();
    g.shadowColor = L.rim[1]; g.shadowBlur = 18; T.rr(g, x, y, w, h, 66); g.lineWidth = 8; g.strokeStyle = T.lin(g, x, y, x + w, y + h, [0, L.rim[0], 0.5, L.rim[1], 1, L.rim[2]]); g.stroke(); g.shadowBlur = 0; T.rr(g, x, y, w, h, 66); g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,255,255,.9)'; g.stroke(); g.restore();
  }
  function word(g, T, L, cx, base, size) {   // every letter its own step of the rainbow
    var o = { spacing: size * 0.004, dark: L.dark, outline: size * 0.2, depth: size * 0.08, fat: size * 0.02, glow: 'rgba(190,120,255,1)', glowN: 3, glowBlur: 0.4, wave: function (j) { return [0, -3, 2, -2, 2, -3, 1, -2, 3, -2, 2][j] * size / 110; }, face: function (j) { var c = L.letters[j]; return [0, c[0], 0.5, c[1], 1, c[2]]; }, inner: 'rgba(255,255,255,.6)' };
    var W = T.word(g, 'Sciencetory', cx, base, size, o); T.gloss(g, 'Sciencetory', cx, base, size, o, 0.5); return W;
  }
  function emblem(g, T, L) {
    plate(g, T, L, 296, 74, 434, 438);
    dna(g, T, 322, 232, 120, 0.5, 1); dna(g, T, 396, 426, 130, 1.1, 1.1);
    atom(g, T, 498, 150, 56); scope(g, T, 694, 176, 0.9); flask(g, T, 372, 184, 0.86); robot(g, T, 606, 176, 0.86);
    T.star(g, 664, 400, 16, 8); g.fillStyle = '#ffd23e'; g.fill(); T.star(g, 590, 424, 11, 5.5); g.fillStyle = '#5ff0ff'; g.fill();
    [[430, 106, 9], [700, 128, 11], [330, 330, 7], [704, 330, 8], [560, 470, 9], [470, 390, 7]].forEach(function (s, i) { T.spark(g, s[0], s[1], s[2], i % 2 ? '#ffe14a' : '#fff', 0.95); });
    word(g, T, L, 512, 330, 122);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); var r = T.rng(2); for (var i = 0; i < 130; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillStyle = ['#fff', '#ffe14a', '#ff8ad8', '#8fd0ff'][i % 4]; g.beginPath(); g.arc(r() * 1024, r() * 572, 0.6 + r() * 1.8, 0, TAU); g.fill(); } g.globalAlpha = 1; emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-122, -32); emblem(g, T, L); return; }
    if (kind === 'wide') { flask(g, T, 70, 126, 0.56); word(g, T, L, 480, 138, 112); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.84, 0.84); g.translate(-513, -293); plate(g, T, L, 296, 74, 434, 438); if (px >= 90) { atom(g, T, 498, 162, 56); flask(g, T, 372, 196, 0.86); robot(g, T, 606, 192, 0.86); dna(g, T, 396, 426, 130, 1.1, 1.1); word(g, T, L, 513, 330, 70); } else { atom(g, T, 513, 293, 150); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO sciencetory END

// 🏷️ LOGO slabrall START — 🏓 SlaBrall: the main mark moved word for word from SlaBrall.html slaMark + slaWord / slaShield / slaLines / slaBallT / SLA_PAL (lg-1, approved in its game)
// by move_st2c.py (gl-r22, 📡 st-2c) · NEW in the kit: 'wide' (title row) + 'badge' (icon) from the same parts · looks = the 6 court themes
GameLogos.add('slabrall', (function () {
const SLA_PAL = {
  classic: {neon: '#36D6FF', neon2: '#FF8A1F', f1: '#17396D', f2: '#071426', sla: ['#FFFFFF', '#5FE0FF'], rest: ['#FFE45C', '#FF7A1A'], ink: '#06101F'},
  dino:    {neon: '#9BE15D', neon2: '#FFB23F', f1: '#255A2B', f2: '#0C1F0E', sla: ['#F6FFE0', '#A6EE62'], rest: ['#FFE07A', '#FF8A2A'], ink: '#0A1608'},
  sea:     {neon: '#3FF3E0', neon2: '#FF7F6B', f1: '#0C4A70', f2: '#041C2E', sla: ['#E6FFFF', '#3FF3E0'], rest: ['#FFD9B0', '#FF6B5B'], ink: '#03121E'},
  dance:   {neon: '#FF4FE3', neon2: '#FFE14A', f1: '#3D1468', f2: '#12051F', sla: ['#FFFFFF', '#FF8CF0'], rest: ['#FFF27A', '#FFB800'], ink: '#0D0318'},
  space:   {neon: '#8E7CFF', neon2: '#5CF2FF', f1: '#2A2470', f2: '#07051A', sla: ['#FFFFFF', '#B8F3FF'], rest: ['#EDE4FF', '#A585FF'], ink: '#05031A'},
  sky:     {neon: '#FFD34D', neon2: '#3DB2F0', f1: '#2D7FC4', f2: '#0F3F6E', sla: ['#FFFFFF', '#BFE8FF'], rest: ['#FFF0A0', '#F2A81D'], ink: '#0A2440'}
};
const SLA_FONT = (px, it) => (it === false ? '' : 'italic ') + '700 ' + px + 'px Fredoka, Nunito, "Arial Rounded MT Bold", sans-serif';
function slaWord(g, word, cx, cy, maxW, px, P, opt){   // two-tone lettering: "Sla" cool, the rest warm · thick dark edge · thin white line · neon glow
  opt = opt || {}; g.save(); g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.font = SLA_FONT(px);
  const a = word.slice(0, 3), b = word.slice(3); let w = g.measureText(word).width;
  if(w > maxW){ px = px * maxW / w; g.font = SLA_FONT(px); w = g.measureText(word).width; }
  const x0 = cx - w / 2, wa = g.measureText(a).width, top = cy - px * 0.72, bot = cy + px * 0.08;
  g.shadowColor = P.neon; g.shadowBlur = opt.glow == null ? px * 0.35 : opt.glow; g.strokeStyle = P.ink; g.lineWidth = px * 0.2;
  g.strokeText(word, x0, cy); g.shadowBlur = 0; g.lineWidth = px * 0.2; g.strokeText(word, x0, cy);
  const ga = g.createLinearGradient(0, top, 0, bot); ga.addColorStop(0, P.sla[0]); ga.addColorStop(1, P.sla[1]);
  const gb = g.createLinearGradient(0, top, 0, bot); gb.addColorStop(0, P.rest[0]); gb.addColorStop(1, P.rest[1]);
  g.fillStyle = ga; g.fillText(a, x0, cy); g.fillStyle = gb; g.fillText(b, x0 + wa, cy);
  g.lineWidth = Math.max(1, px * 0.03); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.strokeText(word, x0, cy);
  g.restore(); return px;
}
function slaShield(g, inset){   // 240-box shield: flat top with round corners, curved sides to a point
  const k = inset || 0; g.beginPath(); g.moveTo(52 + k, 14 + k); g.lineTo(188 - k, 14 + k); g.quadraticCurveTo(212 - k, 14 + k, 212 - k, 38 + k); g.lineTo(212 - k, 116);
  g.quadraticCurveTo(210 - k, 184 - k * 0.6, 120, 228 - k * 1.3); g.quadraticCurveTo(30 + k, 184 - k * 0.6, 28 + k, 116); g.lineTo(28 + k, 38 + k); g.quadraticCurveTo(28 + k, 14 + k, 52 + k, 14 + k); g.closePath();
}
function slaLines(g, pts, col, w){ g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; pts.forEach(([x0, y0, x1, y1]) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }); }
function slaBallT(g, x, y, r, c1, c2, seam){   // a round ball with a soft light + optional tennis seam
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(1.5, r * 0.08); g.stroke();
  if(seam){ g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = Math.max(1.5, r * 0.12); g.beginPath(); g.arc(x - r * 1.05, y, r * 0.75, -0.95, 0.95); g.stroke(); g.beginPath(); g.arc(x + r * 1.05, y, r * 0.75, Math.PI - 0.95, Math.PI + 0.95); g.stroke(); }
}
function slaMarkOn(g, P){   // 🏓 the main mark: swoosh + burst + ball, "SlaBrall", tagline — the game's slaMark painted straight onto the kit's canvas (720 × 330 units)
  const bx = 452, by = 108, br = 62;
  // swoosh arc
  g.save(); g.lineCap = 'round'; const sw = g.createLinearGradient(140, 0, 600, 0); sw.addColorStop(0, 'rgba(255,255,255,0)'); sw.addColorStop(0.5, P.sla[1]); sw.addColorStop(1, '#FFFFFF');
  g.strokeStyle = sw; g.lineWidth = 16; g.shadowColor = P.neon; g.shadowBlur = 18; g.beginPath(); g.ellipse(380, 210, 250, 168, 0, Math.PI * 1.08, Math.PI * 1.86); g.stroke();
  g.lineWidth = 6; g.strokeStyle = P.neon2; g.beginPath(); g.ellipse(380, 210, 228, 150, 0, Math.PI * 1.12, Math.PI * 1.8); g.stroke(); g.restore();
  // burst
  g.save(); g.translate(bx + 16, by - 6); const bg = g.createRadialGradient(0, 0, 10, 0, 0, 120); bg.addColorStop(0, '#FFF2A8'); bg.addColorStop(0.5, P.rest[1]); bg.addColorStop(1, 'rgba(255,90,20,0)');
  g.fillStyle = bg; g.beginPath(); for(let i = 0; i < 22; i++){ const a = i * Math.PI / 11, d = i % 2 ? 58 : 112 + (i % 4) * 8; g.lineTo(Math.cos(a) * d, Math.sin(a) * d); } g.closePath(); g.fill(); g.restore();
  // speed streaks
  slaLines(g, [[230, 92, 372, 100], [250, 124, 378, 122], [276, 150, 384, 140], [300, 70, 380, 82]], P.sla[1], 7);
  slaLines(g, [[262, 108, 380, 112], [300, 138, 388, 132]], P.rest[1], 5);
  // the ball
  g.save(); g.shadowColor = P.neon; g.shadowBlur = 24; slaBallT(g, bx, by, br, '#F7FF9C', '#5DBB1A', true); g.restore();
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(bx - 22, by - 28, 20, 11, -0.6, 0, 7); g.fill();
  slaWord(g, 'SlaBrall', 360, 258, 660, 132, P, {glow: 26});
  // tagline
  g.save(); g.font = '700 30px Fredoka, Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.strokeStyle = P.ink; g.lineWidth = 8; g.strokeText('THE ULTIMATE SLAP & RALLY GAME', 360, 300); g.fillStyle = '#FFFFFF'; g.fillText('THE ULTIMATE SLAP & RALLY GAME', 360, 300); g.restore();
}

  // 🆕 gl-r22: the slim title row + the icon (the game only had the 720 × 330 mark) — same parts: burst + tennis ball + streaks + the two-tone word
  function burst(g, P, x, y, s){ g.save(); g.translate(x, y); var bg = g.createRadialGradient(0, 0, 10 * s, 0, 0, 120 * s); bg.addColorStop(0, '#FFF2A8'); bg.addColorStop(0.5, P.rest[1]); bg.addColorStop(1, 'rgba(255,90,20,0)');
    g.fillStyle = bg; g.beginPath(); for (var i = 0; i < 22; i++) { var a = i * Math.PI / 11, d = (i % 2 ? 58 : 112 + (i % 4) * 8) * s; g.lineTo(Math.cos(a) * d, Math.sin(a) * d); } g.closePath(); g.fill(); g.restore(); }
  function ball(g, P, x, y, r){ g.save(); g.shadowColor = P.neon; g.shadowBlur = r * 0.4; slaBallT(g, x, y, r, '#F7FF9C', '#5DBB1A', true); g.restore();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.45, r * 0.32, r * 0.18, -0.6, 0, 7); g.fill(); }
  function wide(g, P){   // 760 × 190: ball + burst on the left, the word on the right, a neon swoosh under it
    g.save(); g.lineCap = 'round'; var sw = g.createLinearGradient(170, 0, 740, 0); sw.addColorStop(0, 'rgba(255,255,255,0)'); sw.addColorStop(0.5, P.sla[1]); sw.addColorStop(1, '#FFFFFF');
    g.strokeStyle = sw; g.lineWidth = 9; g.shadowColor = P.neon; g.shadowBlur = 12; g.beginPath(); g.ellipse(470, 30, 300, 140, 0, Math.PI * 0.18, Math.PI * 0.82); g.stroke(); g.restore();
    burst(g, P, 102, 94, 0.62);
    slaLines(g, [[176, 70, 236, 74], [182, 96, 240, 96], [176, 122, 232, 116]], P.sla[1], 6);
    ball(g, P, 96, 96, 50);
    slaWord(g, 'SlaBrall', 470, 140, 520, 128, P, {glow: 20});
  }
  function badge(g, P, px){   // 240 × 240: the neon shield with the burst + ball inside; the name banner from 90 px up
    g.save(); slaShield(g); var fg = g.createLinearGradient(0, 14, 0, 228); fg.addColorStop(0, P.f1); fg.addColorStop(1, P.f2); g.fillStyle = fg; g.fill();
    g.clip(); var rg = g.createRadialGradient(120, 80, 6, 120, 80, 120); rg.addColorStop(0, 'rgba(255,255,255,0.22)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 240, 240);
    var big = px < 90; burst(g, P, 128, big ? 116 : 92, big ? 0.82 : 0.62);
    slaLines(g, [[40, big ? 96 : 74, 82, big ? 100 : 78], [36, big ? 122 : 98, 78, big ? 122 : 98], [44, big ? 148 : 122, 82, big ? 142 : 116]], P.sla[1], 6);
    ball(g, P, 124, big ? 118 : 94, big ? 58 : 46); g.restore();
    g.save(); g.lineJoin = 'round'; g.shadowColor = P.neon; g.shadowBlur = 16; g.strokeStyle = P.neon; g.lineWidth = 7; slaShield(g); g.stroke();
    g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 1.5; slaShield(g); g.stroke();
    g.strokeStyle = P.neon2; g.lineWidth = 3; slaShield(g, 9); g.stroke(); g.restore();
    if (big) return;
    g.save(); g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.moveTo(22, 150); g.lineTo(218, 150); g.lineTo(212, 196); g.lineTo(28, 196); g.closePath(); g.fill(); g.restore();
    slaWord(g, 'SlaBrall', 120, 188, 200, 50, P);
  }
  var BOX = { main: [720, 330], wide: [760, 190], badge: [240, 240] };
  return { BOX: BOX, LOOK: SLA_PAL, paint: function (g, kind, P, px) { if (kind === 'main') slaMarkOn(g, P); else if (kind === 'wide') wide(g, P); else badge(g, P, px); } };
})());
// 🏷️ LOGO slabrall END

// 🏷️ LOGO snakize START — 🐍 Snakize, drawn in code from Aowu's picture (gl-2)
GameLogos.add('snakize', (function () {
  // design space = Aowu's picture, 1024 × 572
  var BOX = { scene: [1024, 572], main: [836, 540], wide: [860, 280], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#0a1450', '#1a2a9a', '#3a1a8a'], grid: 'rgba(120,150,255,.16)', hex: ['#2f8df0', '#7a3fe0', '#3fc84a', '#1f58c8'],
    snake: ['#8eea3a', '#22b88a', '#e6f54a', '#1a7a4a'], belly: '#e9f76a', ink: '#0c1648',
    a: ['#d8ff3a', '#96ee18', '#3fc414', '#128a1a'], aRing: '#1f7a12', b: ['#ffee5a', '#ffbe14', '#ff7e0e', '#ee4a08'], bRing: '#b84a06', dust: ['#ff8ad8', '#7dff9a', '#9fe8ff', '#ffe27a'] };
    for (var k in o) b[k] = o[k]; return b; }
  var LOOK = {
    classic: mk({}),
    dino: mk({ a: ['#f0ff7a', '#c8e02a', '#7aa81a', '#4a7a12'], aRing: '#3a5a0a', b: ['#ffe9a0', '#f0b04a', '#c8782a', '#8a4a12'], bRing: '#6a3a0a', sky: ['#12381a', '#2a6a2a', '#6a4a12'], hex: ['#6ab82f', '#a8782a', '#3f9a3a', '#2a6a1a'], snake: ['#9ad83a', '#5a9a2a', '#f0d84a', '#2a5a1a'], dust: ['#ffd27a', '#b6f03a', '#fff0a0', '#ff9a4a'] }),
    sea: mk({ sky: ['#04264a', '#0a5a9a', '#0a7a8a'], hex: ['#2fb8e0', '#2a6ae0', '#3fd8c0', '#1a4a9a'], snake: ['#4ae0d0', '#1a9ac8', '#b0fff0', '#0a5a7a'], belly: '#d8fff4', a: ['#eaffff', '#8af0e0', '#2ac8c0', '#0a8a9a'], aRing: '#0a6a7a', dust: ['#9fe8ff', '#7dffd8', '#ffffff', '#ffe27a'] }),
    dance: mk({ sky: ['#2a0a4a', '#7a1a9a', '#c81a8a'], hex: ['#ff4ab8', '#8a3ff0', '#3fd8ff', '#c81a8a'], snake: ['#ff7ad8', '#c83ae0', '#ffe27a', '#7a1a8a'], belly: '#ffe9fa', a: ['#fff0ff', '#ff9ae8', '#f04ac8', '#b81a9a'], aRing: '#8a0a6a', b: ['#f0ffff', '#8af0ff', '#2ac8ff', '#1a8af0'], bRing: '#0a4ab8', dust: ['#ff8ad8', '#ffe27a', '#9fe8ff', '#ffffff'] }),
    robot: mk({ sky: ['#141a28', '#2a3a58', '#3a4a6a'], hex: ['#5a7aa8', '#8a9ab8', '#3fd8ff', '#3a4a6a'], snake: ['#c8d8e8', '#7a9ab8', '#5ff0ff', '#3a4a6a'], belly: '#f0f8ff', a: ['#ffffff', '#d8e8f8', '#9ab8d8', '#6a8ab0'], aRing: '#3a4a6a', b: ['#eaffff', '#7af0ff', '#2ac8f0', '#1a8ac8'], bRing: '#0a5a8a', dust: ['#5ff0ff', '#ffffff', '#ffe27a', '#9ab8d8'] }),
    space: mk({ sky: ['#06061e', '#1a1458', '#4a1a7a'], hex: ['#5a4af0', '#b84af0', '#2ad8f0', '#2a1a9a'], snake: ['#b88aff', '#6a4ae0', '#7af0ff', '#2a1a7a'], belly: '#f0e9ff', a: ['#f8f0ff', '#c8a8ff', '#8a5af0', '#5a2ad0'], aRing: '#3a1a9a', dust: ['#c8a8ff', '#7af0ff', '#ffffff', '#ffe27a'] }),
    sky: mk({ sky: ['#2a7ae0', '#5ab8ff', '#a8e0ff'], grid: 'rgba(255,255,255,.22)', hex: ['#ffffff', '#a8d8ff', '#ffe27a', '#5aa8f0'], snake: ['#ffe27a', '#ffb02e', '#ffffff', '#c87a0a'], belly: '#fffbe0', ink: '#12306a', a: ['#ffffff', '#eaf6ff', '#a8d8ff', '#5aa8f0'], aRing: '#2a6ac8', dust: ['#ffffff', '#ffe27a', '#ffb0d8', '#a8e0ff'] })
  };
  var TAU = Math.PI * 2;

  function bez(pts, step) { var C = [], cur = [pts[0], pts[1]], i, t; for (i = 2; i < pts.length; i += 6) { for (t = (i === 2 ? 0 : step); t <= 1.0001; t += step) { var u = 1 - t; C.push([u * u * u * cur[0] + 3 * u * u * t * pts[i] + 3 * u * t * t * pts[i + 2] + t * t * t * pts[i + 4], u * u * u * cur[1] + 3 * u * u * t * pts[i + 1] + 3 * u * t * t * pts[i + 3] + t * t * t * pts[i + 5]]); } cur = [pts[i + 4], pts[i + 5]]; } return C; }
  function hexPath(g, x, y, R) { g.beginPath(); for (var i = 0; i < 6; i++) { var a = i * TAU / 6; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * R, y + Math.sin(a) * R); } g.closePath(); }

  function bg(g, L, T) {
    g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572);
    g.fillStyle = T.rad(g, 512, 290, 40, 560, [0, 'rgba(70,130,255,.5)', 0.55, 'rgba(60,60,200,.1)', 1, 'rgba(0,0,20,.6)']); g.fillRect(0, 0, 1024, 572);
    g.strokeStyle = L.grid; g.lineWidth = 1; for (var x = 0; x <= 1024; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 572); g.stroke(); } for (var y = 6; y <= 572; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    var r = T.rng(31); for (var i = 0; i < 90; i++) { var s = r(); g.globalAlpha = 0.25 + s * 0.6; g.fillStyle = L.dust[i % 4]; g.beginPath(); g.arc(r() * 1024, r() * 572, 1 + s * 3.2, 0, TAU); g.fill(); } g.globalAlpha = 1;
    [[60, 470, 70, 'rgba(255,90,200,.28)'], [960, 150, 80, 'rgba(120,90,255,.3)'], [900, 470, 60, 'rgba(90,220,255,.2)'], [110, 120, 60, 'rgba(90,255,160,.16)']].forEach(function (b) { g.fillStyle = T.rad(g, b[0], b[1], 0, b[2], [0, b[3], 1, 'rgba(0,0,0,0)']); g.fillRect(0, 0, 1024, 572); });
  }
  function dust(g, L, T) {   // two sparkle comets swirling round the logo
    function arc(cx, cy, rx, ry, a0, a1, seed) { var r = T.rng(seed); for (var i = 0; i < 260; i++) { var f = r(), a = a0 + (a1 - a0) * f, d = 1 + (r() - 0.5) * 0.2 * (1.2 - f); g.globalAlpha = (0.35 + r() * 0.65) * (0.3 + f * 0.7); g.fillStyle = L.dust[(seed + i) % 4]; g.shadowColor = g.fillStyle; g.shadowBlur = 10; g.beginPath(); g.arc(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 1 + r() * 4.4 * f + 0.4, 0, TAU); g.fill(); } g.globalAlpha = 1; g.shadowBlur = 0; }
    arc(512, 290, 380, 226, Math.PI * 1.32, Math.PI * 0.62, 3); arc(512, 290, 384, 230, Math.PI * 0.32, -Math.PI * 0.4, 4);
    g.save(); g.shadowColor = '#fff'; g.shadowBlur = 14; g.fillStyle = '#fff'; g.beginPath(); g.arc(402, 492, 6, 0, TAU); g.fill(); g.beginPath(); g.arc(590, 76, 6, 0, TAU); g.fill(); g.restore();
    [[196, 150, 9], [840, 110, 8], [876, 420, 9], [150, 380, 7], [716, 64, 6], [282, 84, 6]].forEach(function (s) { T.spark(g, s[0], s[1], s[2], '#fff', 0.9); });
  }
  function hexes(g, L, T, cx, cy, k) {
    var R = 46 * k, dx = R * 1.5, dy = R * Math.sqrt(3), cells = [[-2, -1, 0], [-1, -2, 0], [0, -2, 1], [1, -2, 2], [2, -1, 0], [-2, 0, 1], [-1, -1, 3], [0, -1, 0], [1, -1, 1], [2, 0, 2], [-2, 1, 2], [-1, 0, 1], [0, 0, 3], [1, 0, 0], [2, 1, 1], [-1, 1, 0], [0, 1, 1], [1, 1, 2], [0, 2, 2], [-1, 2, 1], [1, 2, 0]];
    g.save(); g.shadowColor = 'rgba(90,160,255,.8)'; g.shadowBlur = 26 * k;
    cells.forEach(function (c) { var x = cx + c[0] * dx, y = cy + (c[1] + (Math.abs(c[0]) % 2 ? 0.5 : 0)) * dy; hexPath(g, x, y, R * 0.94); var col = L.hex[c[2]]; g.fillStyle = T.lin(g, x, y - R, x, y + R, [0, 'rgba(255,255,255,.55)', 0.25, col, 1, col]); g.fill(); g.shadowBlur = 0; g.lineWidth = 3 * k; g.strokeStyle = 'rgba(8,14,70,.65)'; g.stroke(); g.save(); g.shadowColor = col; g.shadowBlur = 14 * k; hexPath(g, x, y, R * 0.82); g.lineWidth = 3 * k; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke(); g.restore(); });
    g.restore();
  }
  /* a glossy striped snake body along a curve (far end first) */
  function tube(g, L, T, C, w0, w1) {
    var n = C.length, i; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    function wid(i) { var f = i / (n - 1); return w0 + (w1 - w0) * f; }
    function run(a, b, extra, col, cap) { g.lineCap = cap || 'round'; for (i = a; i < b; i++) { g.beginPath(); g.moveTo(C[i][0], C[i][1]); g.lineTo(C[i + 1][0], C[i + 1][1]); g.lineWidth = wid(i) + extra; g.strokeStyle = col; g.stroke(); } }
    g.save(); g.shadowColor = L.snake[2]; g.shadowBlur = 34; run(0, n - 1, 13, L.snake[0]); g.shadowColor = '#5ff0ff'; g.shadowBlur = 16; run(0, n - 1, 13, L.snake[0]); g.restore();   // neon halo round the body
    run(0, n - 1, 13, L.ink); run(0, n - 1, 0, L.snake[1]);
    // stripes: each band is ONE stroke (no seams), wide bands of 3 colours like the picture
    function poly(a, b) { g.beginPath(); g.moveTo(C[a][0], C[a][1]); for (var q = a + 1; q <= b; q++) g.lineTo(C[q][0], C[q][1]); }
    var band = 7, cols = [L.snake[0], L.snake[2], L.snake[0], L.snake[1], L.snake[3] ? L.snake[1] : L.snake[1]], bi = 0;
    for (var s2 = 0; s2 < n - 1; s2 += band, bi++) { var e = Math.min(n - 1, s2 + band); if (bi % 2) continue; poly(s2, e); g.lineCap = 'butt'; g.lineWidth = wid(s2 + (band >> 1)); g.strokeStyle = cols[(bi / 2) % 2 ? 1 : 0]; g.stroke(); }
    // soft shade on the low side, glossy dashes on the high side
    function side(o, lw, col, dash) { g.beginPath(); for (i = 0; i < n; i++) { var a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d; if (ny > 0) { nx = -nx; ny = -ny; } var oo = wid(i) * o; g[i ? 'lineTo' : 'moveTo'](C[i][0] + nx * oo, C[i][1] + ny * oo); } g.lineCap = 'round'; g.setLineDash(dash || []); g.lineWidth = lw; g.strokeStyle = col; g.stroke(); g.setLineDash([]); }
    side(-0.3, wid(n >> 1) * 0.3, 'rgba(4,60,90,.26)'); side(0.26, wid(n >> 1) * 0.15, 'rgba(255,255,255,.75)', [26, 30]); side(0.1, wid(n >> 1) * 0.22, 'rgba(255,255,255,.16)');
    g.restore();
  }
  function head(g, L, T, x, y, s, rot) {   // three-quarter view looking left, like the picture
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    var EDGE = L.snake[3] || '#1a7a4a';
    // forked tongue from the open mouth
    g.beginPath(); g.moveTo(-34, 30); g.quadraticCurveTo(-56, 44, -72, 36); g.moveTo(-58, 42); g.quadraticCurveTo(-68, 54, -80, 52); g.lineWidth = 10; g.strokeStyle = '#b83a5a'; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#ff8aa0'; g.stroke();
    // skull (back, darker green) then the snout (front, lime → yellow)
    function skull() { g.beginPath(); g.moveTo(-30, -44); g.bezierCurveTo(0, -62, 52, -56, 62, -16); g.bezierCurveTo(70, 18, 48, 46, 14, 50); g.bezierCurveTo(-12, 52, -40, 40, -48, 14); g.bezierCurveTo(-56, -12, -50, -34, -30, -44); g.closePath(); }
    g.save(); g.shadowColor = 'rgba(120,255,170,.7)'; g.shadowBlur = 22; skull(); g.fillStyle = L.snake[1]; g.fill(); g.restore();
    skull(); g.lineWidth = 6; g.strokeStyle = EDGE; g.stroke(); skull(); g.fillStyle = T.lin(g, 0, -56, 0, 50, [0, L.snake[1], 0.45, L.snake[0], 1, L.snake[0]]); g.fill();
    function snout() { g.beginPath(); g.moveTo(-70, 2); g.bezierCurveTo(-74, -22, -40, -30, -14, -18); g.bezierCurveTo(14, -6, 30, 6, 30, 22); g.bezierCurveTo(28, 40, -4, 46, -34, 40); g.bezierCurveTo(-58, 34, -68, 22, -70, 2); g.closePath(); }
    snout(); g.fillStyle = T.lin(g, 0, -26, 0, 44, [0, L.snake[2], 0.6, L.belly, 1, L.snake[2]]); g.fill(); g.lineWidth = 4; g.strokeStyle = EDGE; g.globalAlpha = 0.55; g.stroke(); g.globalAlpha = 1;
    g.save(); skull(); g.clip(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(20, -44, 30, 9, 0.2, 0, TAU); g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-44, -10, 16, 6, -0.2, 0, TAU); g.fill();
    // far eye (half hidden by the brow) and the big near eye
    [[-34, -36, 10, 13], [14, -22, 18, 21]].forEach(function (e, i) { g.beginPath(); g.ellipse(e[0], e[1], e[2] + 3, e[3] + 3, 0, 0, TAU); g.fillStyle = i ? L.snake[1] : L.snake[0]; g.fill(); g.lineWidth = 3; g.strokeStyle = EDGE; g.stroke();
      g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#1a4a5a'; g.stroke();
      g.beginPath(); g.ellipse(e[0] - e[2] * 0.14, e[1] + e[3] * 0.08, e[2] * 0.66, e[3] * 0.7, 0, 0, TAU); g.fillStyle = T.lin(g, 0, e[1] - e[3], 0, e[1] + e[3], [0, '#0c1a4a', 0.6, '#1f4a9a', 1, '#3fa8d8']); g.fill();
      g.beginPath(); g.ellipse(e[0] - e[2] * 0.14, e[1] + e[3] * 0.1, e[2] * 0.36, e[3] * 0.4, 0, 0, TAU); g.fillStyle = '#060c24'; g.fill();
      g.beginPath(); g.arc(e[0] - e[2] * 0.4, e[1] - e[3] * 0.3, e[2] * 0.26, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(e[0] + e[2] * 0.2, e[1] + e[3] * 0.4, e[2] * 0.12, 0, TAU); g.fill(); });
    // nostrils + wide smile with the mouth a little open
    g.fillStyle = '#6a4a12'; g.beginPath(); g.ellipse(-58, -4, 3, 4.5, 0.4, 0, TAU); g.ellipse(-44, -10, 3, 4.5, 0.4, 0, TAU); g.fill();
    function mouth() { g.beginPath(); g.moveTo(-62, 16); g.quadraticCurveTo(-30, 27, 4, 20); g.quadraticCurveTo(20, 16, 28, 6); g.quadraticCurveTo(22, 23, -4, 27); g.quadraticCurveTo(-38, 32, -62, 16); g.closePath(); }
    mouth(); g.fillStyle = '#b02a3a'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#5a1420'; g.stroke();
    g.fillStyle = 'rgba(255,120,130,.45)'; g.beginPath(); g.ellipse(36, 20, 10, 7, 0, 0, TAU); g.fill();
    g.restore();
  }
  function wordmark(g, L, T, cx, base, size) {   // big S + the rest a step smaller, like the picture
    var A = L.a, B = L.b, big = size * 1.3;
    function opt(sz, off) { return { spacing: -sz * 0.02, dark: L.ink, outline: sz * 0.19, depth: sz * 0.085, glow: 'rgba(110,255,150,1)', glowN: 3, glowBlur: 0.5,
      wave: function (j) { return [7, -5, 5, -3, 3, 6][j + off] * sz / 180 || 0; },
      face: function (j) { var c = (j + off) < 3 ? A : B; return [0, c[0], 0.28, c[1], 0.68, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.3)' }; }
    g.save(); g.font = '700 ' + big + 'px ' + T.FONT; var wS = g.measureText('S').width; g.font = '700 ' + size + 'px ' + T.FONT; var wR = 0; 'NAKIZE'.split('').forEach(function (ch) { wR += g.measureText(ch).width - size * 0.02; }); g.restore();
    var gap = -size * 0.02, W = wS + gap + wR, x0 = cx - W / 2;
    var oR = opt(size, 0); T.word(g, 'NAKIZE', x0 + wS + gap + wR / 2, base, size, oR); T.gloss(g, 'NAKIZE', x0 + wS + gap + wR / 2, base, size, oR, 0.34);
    var oS = opt(big, -9); oS.wave = null; oS.face = function () { return [0, A[0], 0.28, A[1], 0.68, A[2], 1, A[3]]; }; T.word(g, 'S', x0 + wS / 2, base + size * 0.06, big, oS); T.gloss(g, 'S', x0 + wS / 2, base + size * 0.06, big, oS, 0.34);
    return { W: W, x0: x0, wS: wS, big: big };
  }
  function sFace(g, L, x, y, k) {   // the S is the little snake: an eye + a smile on its top curl
    g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round';
    g.beginPath(); g.ellipse(0, 0, 9, 11, 0, 0, TAU); g.fillStyle = L.ink; g.fill(); g.beginPath(); g.arc(-3, -4, 3.4, 0, TAU); g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.moveTo(2, 20); g.quadraticCurveTo(14, 26, 24, 16); g.lineWidth = 5; g.strokeStyle = L.ink; g.stroke(); g.restore();
  }
  function tail(g, L, T, x, y, k) {   // the E ends in a curly tail (drawn before the word so it grows out of the letter)
    var C = bez([x - 30 * k, y, x + 10 * k, y + 14 * k, x + 46 * k, y + 2 * k, x + 50 * k, y - 28 * k, x + 52 * k, y - 50 * k, x + 34 * k, y - 60 * k, x + 28 * k, y - 46 * k], 0.05), n = C.length, i;
    g.save(); g.lineCap = 'round'; for (var p = 0; p < 2; p++) for (i = 0; i < n - 1; i++) { var w = (30 - 24 * i / (n - 1)) * k; g.beginPath(); g.moveTo(C[i][0], C[i][1]); g.lineTo(C[i + 1][0], C[i + 1][1]); g.lineWidth = w + (p ? 0 : 14 * k); g.strokeStyle = p ? T.lin(g, 0, y - 60 * k, 0, y + 14 * k, [0, L.b[1], 1, L.b[3]]) : L.ink; g.stroke(); } g.restore();
  }
  // the body: tail end → low wave under the word → up the right side → over the top → head
  var BODY = [352, 250, 296, 300, 262, 420, 352, 470, 430, 512, 470, 418, 548, 424, 626, 430, 660, 512, 730, 470, 800, 428, 760, 330, 716, 262, 672, 194, 700, 92, 612, 78, 566, 72, 548, 98, 540, 120];

  function emblem(g, L, T) {
    g.fillStyle = T.rad(g, 512, 300, 60, 400, [0, 'rgba(90,255,180,.6)', 0.55, 'rgba(70,160,255,.3)', 1, 'rgba(0,0,0,0)']); g.fillRect(100, 0, 824, 572);
    dust(g, L, T);
    hexes(g, L, T, 520, 280, 1.08);
    tube(g, L, T, bez(BODY, 0.02), 44, 62);
    g.save(); g.font = '700 176px ' + T.FONT; g.restore();
    // measure first so the tail can sit under the E
    var c = document.createElement('canvas').getContext('2d'); c.font = '700 ' + 176 * 1.3 + 'px ' + T.FONT; var wS = c.measureText('S').width; c.font = '700 176px ' + T.FONT; var wR = 0; 'NAKIZE'.split('').forEach(function (ch) { wR += c.measureText(ch).width - 3.52; }); var W = wS - 3.52 + wR, x0 = 512 - W / 2;
    tail(g, L, T, x0 + W + 4, 352, 1.15);
    var m = wordmark(g, L, T, 512, 366, 176);
    sFace(g, L, m.x0 + m.wS * 0.63, 366 - m.big * 0.585, 1.25);
    head(g, L, T, 500, 112, 1.22, -0.04);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { bg(g, L, T); emblem(g, L, T); return; }
    if (kind === 'main') { g.translate(-94, -22); g.fillStyle = T.rad(g, 512, 290, 120, 400, [0, 'rgba(70,130,255,.5)', 1, 'rgba(70,130,255,0)']); g.fillRect(94, 22, 836, 540); emblem(g, L, T); return; }
    if (kind === 'wide') { var cw = document.createElement('canvas').getContext('2d'); cw.font = '700 ' + 150 * 1.3 + 'px ' + T.FONT; var a1 = cw.measureText('S').width; cw.font = '700 150px ' + T.FONT; var a2 = 0; 'NAKIZE'.split('').forEach(function (ch) { a2 += cw.measureText(ch).width - 3; }); var Ww = a1 - 3 + a2; tail(g, L, T, 414 + Ww / 2 + 4, 190, 1.0); var m2 = wordmark(g, L, T, 414, 202, 150); sFace(g, L, m2.x0 + m2.wS * 0.63, 202 - m2.big * 0.585, 1.06); return; }
    if (kind === 'badge') {
      g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.lin(g, 0, 0, 400, 400, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fill(); g.clip();
      g.fillStyle = T.rad(g, 200, 200, 20, 260, [0, 'rgba(90,150,255,.6)', 1, 'rgba(0,0,0,.2)']); g.fillRect(0, 0, 400, 400);
      hexes(g, L, T, 200, 206, 0.86);
      tube(g, L, T, bez([70, 330, 150, 380, 300, 370, 322, 290, 340, 220, 250, 190, 210, 150], 0.03), 38, 54);
      var m3 = wordmark(g, L, T, 200, 352, 62); sFace(g, L, m3.x0 + m3.wS * 0.63, 352 - m3.big * 0.585, 0.44);
      head(g, L, T, 176, 122, 1.5, -0.1);
      g.restore(); T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 12; g.strokeStyle = L.ink; g.stroke(); g.lineWidth = 6; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.a[1], 1, L.b[2]]); g.stroke();
      return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO snakize END

// 🏷️ LOGO soulbopper START — 👻💣 Soul Bopper, drawn in code from Aowu's picture (gl-7)
GameLogos.add('soulbopper', (function () {
  var BOX = { scene: [1024, 572], main: [1040, 590], wide: [860, 220], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#3a1a9a', '#5a2fd0', '#1a6ac8'], tiles: ['#7a4af0', '#3f8df5', '#2fc8d8', '#b05af0', '#5ad06a', '#f0a02a'], ghost: ['#f4feff', '#aef0ff', '#74c4ff', '#8a8cf5'], gink: '#4a66e0',
    a: ['#c8fbff', '#74dcff', '#5a9cf8', '#9a62f0'], aRing: '#4a3ad0', b: ['#fff36a', '#ffd21a', '#ffa41a', '#ff7412'], bRing: '#c8580a', dark: '#2a1670', bomb: ['#5a4ae0', '#1f1a7a', '#ffd23e'], bat: ['#9a6af5', '#4a2ab0'], glow: 'rgba(120,220,255,.8)' };
    for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    dino: mk({ sky: ['#1a4a22', '#3a8a3a', '#8a6a1a'], tiles: ['#5ab84a', '#8ac83a', '#c8a84a', '#3f9a5a', '#a8782a', '#e0c84a'], dark: '#12381a', glow: 'rgba(190,255,150,.8)' }),
    sea: mk({ sky: ['#062a5a', '#0a5aa8', '#0a8a9a'], tiles: ['#2a8ae0', '#2fc8d8', '#3fd8b0', '#1a6ac8', '#5ae0e0', '#8af0d0'], dark: '#06224a' }),
    dance: mk({ sky: ['#3a0a5a', '#9a1aa8', '#e02a8a'], tiles: ['#f04ab8', '#8a3ff0', '#3fd8ff', '#ffb02e', '#c81a8a', '#5ad0ff'], dark: '#3a0a4a', glow: 'rgba(255,150,230,.8)' }),
    robot: mk({ sky: ['#1a2230', '#34485e', '#4a6078'], tiles: ['#5a7aa8', '#8a9ab8', '#3fd8ff', '#3a4a6a', '#a8b8c8', '#5ac8e0'], dark: '#141c28', bomb: ['#8a9ab8', '#2a3448', '#3fd8ff'] }),
    space: mk({ sky: ['#06061e', '#1a1458', '#4a1a7a'], tiles: ['#5a4af0', '#b84af0', '#2ad8f0', '#2a1a9a', '#8a5af5', '#3f6af5'], dark: '#0a0830' }),
    sky: mk({ sky: ['#2a7ae0', '#5ab8ff', '#a8e0ff'], tiles: ['#ffffff', '#a8d8ff', '#ffe27a', '#5aa8f0', '#ffd0e8', '#c8f0ff'], dark: '#163a7a', glow: 'rgba(255,255,255,.9)' }),
    zombie: mk({ sky: ['#1a2a1a', '#3a5a2a', '#5a3a6a'], tiles: ['#6a9a3a', '#8a5a9a', '#4a7a4a', '#a8c84a', '#5a3a7a', '#3a5a3a'], ghost: ['#f4ffe0', '#c8f08a', '#8ac84a', '#4a8a2a'], gink: '#3a7a1a', dark: '#162212', glow: 'rgba(190,255,120,.8)', a: ['#f4ffd8', '#c8f07a', '#8ac84a', '#4a9a3a'], aRing: '#2a6a1a' }) };
  var TAU = Math.PI * 2;
  function floor(g, T, L) {
    g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, L.sky[0], 0.5, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572);
    // tile floor in a gentle perspective
    g.save(); g.translate(512, 286); g.transform(1, 0.1, -0.32, 0.8, 0, 0); var r = T.rng(41), s = 92;
    for (var y = -6; y < 6; y++) for (var x = -9; x < 9; x++) { var c = L.tiles[(r() * L.tiles.length) | 0]; T.rr(g, x * s + 4, y * s + 4, s - 8, s - 8, 12); g.fillStyle = c; g.globalAlpha = 0.55 + r() * 0.3; g.fill(); g.globalAlpha = 0.35; g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke(); }
    g.restore(); g.globalAlpha = 1;
    g.fillStyle = T.rad(g, 512, 300, 60, 560, [0, 'rgba(120,200,255,.5)', 0.5, 'rgba(60,40,160,.15)', 1, 'rgba(20,6,70,.7)']); g.fillRect(0, 0, 1024, 572);
  }
  function bomb(g, T, L, x, y, R, rot, face) {
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    // fuse + spark
    g.lineCap = 'round'; g.beginPath(); g.moveTo(R * 0.34, -R * 0.86); g.quadraticCurveTo(R * 0.66, -R * 1.34, R * 0.98, -R * 1.2); g.lineWidth = R * 0.2; g.strokeStyle = '#3a1c0a'; g.stroke(); g.lineWidth = R * 0.1; g.strokeStyle = '#d8a05a'; g.stroke();
    g.save(); g.shadowColor = '#ffb02e'; g.shadowBlur = R * 0.6; T.spark(g, R * 1.02, -R * 1.22, R * 0.5, '#ffd23e', 1); T.spark(g, R * 1.02, -R * 1.22, R * 0.26, '#fff', 1); g.restore();
    T.rr(g, R * 0.1, -R * 1.12, R * 0.46, R * 0.34, R * 0.08); g.fillStyle = '#5a4a8a'; g.fill(); g.lineWidth = R * 0.07; g.strokeStyle = L.dark; g.stroke();
    g.save(); g.shadowColor = '#b06aff'; g.shadowBlur = R * 0.7; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = L.bomb[0]; g.fill(); g.restore(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = T.rad(g, -R * 0.35, -R * 0.4, R * 0.1, R * 1.3, [0, L.bomb[0], 0.7, L.bomb[1], 1, L.dark]); g.fill(); g.lineWidth = R * 0.11; g.strokeStyle = L.dark; g.stroke(); g.beginPath(); g.arc(0, 0, R * 1.08, 0, TAU); g.lineWidth = R * 0.05; g.strokeStyle = 'rgba(200,160,255,.85)'; g.stroke();
    // glowing swirl marks
    g.save(); g.beginPath(); g.arc(0, 0, R * 0.92, 0, TAU); g.clip(); g.strokeStyle = L.bomb[2]; g.shadowColor = L.bomb[2]; g.shadowBlur = R * 0.3; g.lineWidth = R * 0.1; g.lineCap = 'round';
    if (face === 2) { g.shadowBlur = 0; g.fillStyle = '#ff6ad0'; [[-0.3, -0.34, 0.12], [0.36, -0.3, 0.1], [-0.52, 0.12, 0.09], [0.5, 0.26, 0.13], [-0.1, 0.56, 0.1], [0.08, -0.62, 0.08]].forEach(function (d) { g.beginPath(); g.arc(d[0] * R, d[1] * R, d[2] * R, 0, TAU); g.fill(); }); g.strokeStyle = '#3fd8ff'; g.shadowColor = '#3fd8ff'; g.shadowBlur = R * 0.3; g.beginPath(); g.arc(-R * 0.1, R * 0.06, R * 0.34, 3.6, 6.6); g.stroke(); g.beginPath(); g.arc(R * 0.28, R * 0.44, R * 0.22, 0.4, 2.6); g.stroke(); g.restore(); g.save(); g.beginPath(); g.arc(0, 0, R * 0.92, 0, TAU); g.clip(); face = 3; }
    if (!face) { g.beginPath(); for (var a = 0; a < 5.4; a += 0.2) { var rr = R * 0.08 + a * R * 0.085; g[a ? 'lineTo' : 'moveTo'](R * 0.12 + Math.cos(a) * rr, R * 0.14 + Math.sin(a) * rr); } g.stroke(); }
    if (face !== 3) { g.strokeStyle = '#3fd8ff'; g.shadowColor = '#3fd8ff'; g.beginPath(); g.arc(-R * 0.5, R * 0.52, R * 0.3, 3.4, 5.6); g.stroke(); g.strokeStyle = '#ff8a2a'; g.shadowColor = '#ff8a2a'; g.beginPath(); g.arc(R * 0.62, -R * 0.42, R * 0.26, 0.2, 2.4); g.stroke(); } g.restore();
    if (face === 3) face = 0;
    if (face) { [-1, 1].forEach(function (k) { g.beginPath(); g.ellipse(k * R * 0.3, -R * 0.06, R * 0.2, R * 0.25, 0, 0, TAU); g.fillStyle = '#fff3a0'; g.fill(); g.beginPath(); g.arc(k * R * 0.3 + R * 0.03, -R * 0.02, R * 0.11, 0, TAU); g.fillStyle = '#1a0a3a'; g.fill(); }); g.beginPath(); g.arc(0, R * 0.22, R * 0.3, 0.1 * Math.PI, 0.9 * Math.PI); g.closePath(); g.fillStyle = '#1a0a3a'; g.fill(); g.fillStyle = '#fff'; g.fillRect(-R * 0.12, R * 0.3, R * 0.1, R * 0.1); g.fillRect(R * 0.04, R * 0.3, R * 0.1, R * 0.1); }
    g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(-R * 0.4, -R * 0.5, R * 0.24, R * 0.13, -0.7, 0, TAU); g.fill();
    g.restore();
  }
  function burst(g, T, x, y, R, col) { g.save(); g.shadowColor = col; g.shadowBlur = R * 0.5; T.star(g, x, y, R, R * 0.5, 8, 0.2); g.fillStyle = col; g.fill(); T.star(g, x, y, R * 0.6, R * 0.3, 8, 0.5); g.fillStyle = '#fff6c0'; g.fill(); g.restore(); }
  function bat(g, T, L, x, y, s, rot) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s); g.lineJoin = 'round';
    [-1, 1].forEach(function (k) { g.beginPath(); g.moveTo(k * 14, -4); g.quadraticCurveTo(k * 40, -40, k * 62, -22); g.quadraticCurveTo(k * 54, -8, k * 58, 6); g.quadraticCurveTo(k * 46, 0, k * 40, 12); g.quadraticCurveTo(k * 30, 4, k * 22, 14); g.quadraticCurveTo(k * 16, 8, k * 12, 10); g.closePath(); g.fillStyle = L.bat[1]; g.fill(); g.lineWidth = 4; g.strokeStyle = L.dark; g.stroke(); });
    [-1, 1].forEach(function (k) { g.beginPath(); g.moveTo(k * 8, -18); g.lineTo(k * 18, -38); g.lineTo(k * 20, -16); g.closePath(); g.fillStyle = L.bat[0]; g.fill(); g.lineWidth = 4; g.strokeStyle = L.dark; g.stroke(); });
    g.beginPath(); g.ellipse(0, 0, 21, 22, 0, 0, TAU); g.fillStyle = T.rad(g, -6, -8, 2, 26, [0, '#c8a8ff', 1, L.bat[0]]); g.fill(); g.lineWidth = 4; g.strokeStyle = L.dark; g.stroke();
    [-1, 1].forEach(function (k) { g.beginPath(); g.arc(k * 8, -3, 6.5, 0, TAU); g.fillStyle = '#ffe14a'; g.fill(); g.beginPath(); g.arc(k * 8 + 1, -2, 3.2, 0, TAU); g.fillStyle = '#1a0a3a'; g.fill(); });
    g.beginPath(); g.arc(0, 7, 7, 0.1 * Math.PI, 0.9 * Math.PI); g.lineWidth = 3; g.lineCap = 'round'; g.strokeStyle = '#1a0a3a'; g.stroke(); g.fillStyle = '#fff'; g.fillRect(-5, 9, 3, 4); g.fillRect(2, 9, 3, 4);
    g.restore();
  }
  function ghost(g, T, L, x, y, s, noBat) {   // the picture's ghost: big head with a curl, little body, two arms on the bat, two running legs
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    var G = L.ghost, RIM = L.gink, body = T.rad(g, -6, -50, 8, 190, [0, G[0], 0.3, G[1], 0.7, G[2], 1, G[3]]);
    function limb(pts, w) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 4) g.quadraticCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]); g.lineWidth = w + 7; g.strokeStyle = RIM; g.stroke(); g.lineWidth = w; g.strokeStyle = body; g.stroke(); g.lineWidth = w * 0.3; g.strokeStyle = 'rgba(255,255,255,.35)'; g.stroke(); }
    function blob(draw) { draw(); g.lineWidth = 7; g.strokeStyle = RIM; g.stroke(); draw(); g.fillStyle = body; g.fill(); }
    // soft glow behind the whole ghost
    
    if (!noBat) {
      // swing trails
      g.save(); g.lineCap = 'round'; [[150, 'rgba(120,230,255,.55)', 9], [170, 'rgba(190,130,255,.45)', 6], [132, 'rgba(255,255,255,.4)', 4]].forEach(function (a) { g.beginPath(); g.arc(-40, 30, a[0], Math.PI * 0.72, Math.PI * 1.42); g.lineWidth = a[2]; g.strokeStyle = a[1]; g.stroke(); }); g.restore();
      // rainbow bat, held in both hands, up over the shoulder
      g.save(); g.translate(-66, 42); g.rotate(-0.52); var cols = ['#b05af0', '#3fa8ff', '#5ad06a', '#ffe14a', '#ffa02e', '#ff5a8a'];
      function batShape() { g.beginPath(); g.moveTo(-10, 26); g.lineTo(-12, -40); g.lineTo(-27, -150); g.quadraticCurveTo(-28, -196, 0, -198); g.quadraticCurveTo(28, -196, 27, -150); g.lineTo(12, -40); g.lineTo(10, 26); g.closePath(); }
      batShape(); g.lineWidth = 11; g.strokeStyle = L.dark; g.stroke(); g.save(); batShape(); g.clip(); for (var i = 0; i < 8; i++) { g.fillStyle = cols[i % 6]; g.save(); g.rotate(0.45); g.fillRect(-120, -250 + i * 34, 240, 34); g.restore(); } g.fillStyle = '#3f7af0'; g.fillRect(-14, -44, 28, 80); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-20, -196, 9, 190); g.restore();
      g.beginPath(); g.ellipse(0, 34, 17, 10, 0, 0, TAU); g.fillStyle = '#ff7a3a'; g.fill(); g.lineWidth = 5; g.strokeStyle = L.dark; g.stroke(); g.restore(); }
    // ONE-PIECE body (Aowu): head, body, arms and legs are a single shape with one rim; depth comes from colour —
    // parts further back are darker, nearer parts drop a soft shadow on what they cover.
    var m = g.getTransform(), sc = Math.max(0.2, Math.hypot(m.a, m.b)), W = 270, H = 420, ox = 135, oy = 215;
    function cv() { var c = document.createElement('canvas'); c.width = Math.ceil(W * sc); c.height = Math.ceil(H * sc); var h = c.getContext('2d'); h.scale(sc, sc); h.translate(ox, oy); h.lineCap = 'round'; h.lineJoin = 'round'; return h; }
    function stroke3(h, p, w) { h.beginPath(); h.moveTo(p[0], p[1]); h.quadraticCurveTo(p[2], p[3], p[4], p[5]); h.lineWidth = w; h.stroke(); }
    var PART = {
      legB: function (h) { stroke3(h, [-16, 104, -44, 122, -58, 156], 34); h.beginPath(); h.ellipse(-66, 162, 23, 14, -0.5, 0, TAU); h.fill(); },
      torso: function (h) { h.beginPath(); h.ellipse(6, 76, 46, 54, 0.08, 0, TAU); h.fill(); },
      legF: function (h) { stroke3(h, [22, 110, 58, 118, 62, 150], 36); h.beginPath(); h.ellipse(74, 156, 25, 14, 0.2, 0, TAU); h.fill(); },
      head: function (h) { h.beginPath(); h.moveTo(-76, -36); h.bezierCurveTo(-82, -88, -62, -122, -38, -132); h.bezierCurveTo(-62, -146, -70, -176, -40, -188); h.bezierCurveTo(-48, -170, -34, -152, -2, -136); h.bezierCurveTo(60, -134, 100, -92, 96, -40); h.bezierCurveTo(92, 20, 54, 52, 10, 52); h.bezierCurveTo(-40, 52, -72, 14, -76, -36); h.closePath(); h.fill(); },
      armA: noBat ? function (h) { stroke3(h, [-30, 60, -62, 62, -74, 30], 30); h.beginPath(); h.arc(-76, 26, 18, 0, TAU); h.fill(); } : function (h) { stroke3(h, [-22, 58, -50, 40, -74, 30], 30); h.beginPath(); h.arc(-78, 28, 19, 0, TAU); h.fill(); },
      armB: noBat ? function (h) { stroke3(h, [40, 64, 72, 70, 84, 96], 30); h.beginPath(); h.arc(86, 100, 18, 0, TAU); h.fill(); } : function (h) { stroke3(h, [10, 70, -30, 72, -62, 54], 30); h.beginPath(); h.arc(-64, 54, 19, 0, TAU); h.fill(); }
    };
    function put(h, name, col, dx, dy) { h.save(); if (dx || dy) h.translate(dx, dy); h.fillStyle = col; h.strokeStyle = col; PART[name](h); h.restore(); }
    var ORDER = ['legB', 'torso', 'legF', 'head', 'armA', 'armB'];
    var M = cv(); ORDER.forEach(function (n) { put(M, n, '#fff'); });                      // the union = the silhouette
    var Rm = cv(); Rm.setTransform(1, 0, 0, 1, 0, 0); for (var a = 0; a < 16; a++) Rm.drawImage(M.canvas, Math.cos(a * TAU / 16) * 4.2 * sc, Math.sin(a * TAU / 16) * 4.2 * sc); Rm.globalCompositeOperation = 'source-in'; Rm.fillStyle = RIM; Rm.fillRect(0, 0, Rm.canvas.width, Rm.canvas.height);
    var B = cv(), SH = 'rgba(58,64,200,', lin = function (h, x0, y0, x1, y1, st) { var q = h.createLinearGradient(x0, y0, x1, y1); for (var k2 = 0; k2 < st.length; k2 += 2) q.addColorStop(st[k2], st[k2 + 1]); return q; };
    put(B, 'legB', G[3]); put(B, 'legB', SH + '.42)');                                        // far leg: darkest
    put(B, 'torso', lin(B, 0, 20, 0, 132, [0, G[2], 0.55, G[1], 1, G[2]]));
    put(B, 'legF', lin(B, 20, 104, 80, 166, [0, G[2], 0.5, G[1], 1, G[2]]));
    B.save(); B.beginPath(); B.ellipse(6, 76, 46, 54, 0.08, 0, TAU); B.clip(); put(B, 'legF', SH + '.3)', -5, -6); var ao = B.createRadialGradient(10, 44, 4, 10, 44, 70); ao.addColorStop(0, SH + '.55)'); ao.addColorStop(1, SH + '0)'); B.fillStyle = ao; B.fillRect(-60, 10, 140, 120); B.restore();   // the head shades the chest, the near leg shades the hip
    var hg = B.createRadialGradient(-10, -70, 8, 6, -40, 150); hg.addColorStop(0, G[0]); hg.addColorStop(0.3, G[1]); hg.addColorStop(0.72, G[2]); hg.addColorStop(1, G[3]); put(B, 'head', hg);
    B.save(); B.beginPath(); B.ellipse(10, -42, 84, 90, 0, 0, TAU); B.clip(); B.fillStyle = 'rgba(255,255,255,.6)'; B.beginPath(); B.ellipse(-40, -84, 16, 30, 0.6, 0, TAU); B.fill(); var ch = B.createLinearGradient(0, 10, 0, 54); ch.addColorStop(0, SH + '0)'); ch.addColorStop(1, SH + '.34)'); B.fillStyle = ch; B.fillRect(-90, 10, 190, 50);
    var r = T.rng(9); for (var q = 0; q < 26; q++) { B.globalAlpha = 0.4 + r() * 0.5; B.fillStyle = '#fff'; B.beginPath(); B.arc(-60 + r() * 140, -110 + r() * 150, 0.8 + r() * 1.8, 0, TAU); B.fill(); } B.restore(); B.globalAlpha = 1;
    ['armB', 'armA'].forEach(function (n, k2) { put(B, n, SH + '.34)', 5, 8); put(B, n, lin(B, -90, 20, 20, 90, [0, G[0], 0.25, G[1], 1, G[2]])); });   // arms are nearest: lightest, with a drop shadow
    if (!noBat) { B.strokeStyle = SH + '.45)'; B.lineWidth = 2.5; [[-78, 28], [-64, 54]].forEach(function (f) { [-6, 0, 6].forEach(function (d) { B.beginPath(); B.moveTo(f[0] - 10, f[1] + d); B.lineTo(f[0] + 5, f[1] + d - 2); B.stroke(); }); }); }
    B.setTransform(1, 0, 0, 1, 0, 0); B.globalCompositeOperation = 'destination-in'; B.drawImage(M.canvas, 0, 0);
    g.save(); g.shadowColor = L.glow; g.shadowBlur = 56 * s; g.drawImage(Rm.canvas, -ox, -oy, W, H); g.shadowColor = '#ffffff'; g.shadowBlur = 18 * s; g.drawImage(Rm.canvas, -ox, -oy, W, H); g.restore();
    g.drawImage(Rm.canvas, -ox, -oy, W, H); g.drawImage(B.canvas, -ox, -oy, W, H);
    // face: brows, big eyes looking right, open smile
    g.strokeStyle = '#6a5ae8'; g.lineWidth = 7; g.beginPath(); g.moveTo(-34, -84); g.quadraticCurveTo(-16, -96, 2, -86); g.stroke(); g.beginPath(); g.moveTo(40, -90); g.quadraticCurveTo(58, -98, 74, -84); g.stroke();
    [[-16, -52, 28, 33], [58, -54, 24, 30]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#3a52c8'; g.stroke();
      g.beginPath(); g.ellipse(e[0] + 7, e[1] + 3, e[2] * 0.66, e[3] * 0.7, 0, 0, TAU); g.fillStyle = T.lin(g, 0, e[1] - e[3], 0, e[1] + e[3], [0, '#3a2ab0', 0.6, '#3f7af0', 1, '#6ad0ff']); g.fill();
      g.beginPath(); g.ellipse(e[0] + 9, e[1] + 4, e[2] * 0.36, e[3] * 0.4, 0, 0, TAU); g.fillStyle = '#1a1250'; g.fill(); g.beginPath(); g.arc(e[0] + 1, e[1] - 8, e[2] * 0.22, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(e[0] + 14, e[1] + 12, e[2] * 0.1, 0, TAU); g.fill(); });
    g.fillStyle = 'rgba(190,120,255,.5)'; g.beginPath(); g.ellipse(-40, -8, 15, 10, 0, 0, TAU); g.ellipse(80, -14, 10, 9, 0, 0, TAU); g.fill();
    function mouth() { g.beginPath(); g.moveTo(-6, -8); g.quadraticCurveTo(26, 4, 62, -16); g.quadraticCurveTo(60, 30, 26, 32); g.quadraticCurveTo(-2, 30, -6, -8); g.closePath(); }
    mouth(); g.fillStyle = '#3a1a7a'; g.fill(); g.save(); mouth(); g.clip(); g.fillStyle = '#fff'; g.fillRect(-8, -16, 76, 14); g.fillStyle = '#ff7ab0'; g.beginPath(); g.ellipse(30, 30, 22, 13, -0.1, 0, TAU); g.fill(); g.restore(); mouth(); g.lineWidth = 4; g.strokeStyle = '#3a52c8'; g.stroke();
    g.restore();
  }
  /* the picture's lettering: fat bubble letters, "Soul" cyan → violet tilted a little, "Bopper" yellow → orange on a gentle arch, the o is a bomb */
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    var s1 = 198 * k, s2 = 168 * k;
    function o(c, sz, ring) { return { clean: true /* gl-r20 clean B */, spacing: -sz * 0.012, dark: L.dark, outline: sz * 0.17, depth: sz * 0.07, fat: sz * 0.022, inner: 'rgba(255,255,255,.35)', glow: ring === L.bRing ? 'rgba(255,190,60,1)' : 'rgba(110,235,255,1)', glowN: 3, glowBlur: 0.42, face: function () { return [0, c[0], 0.32, c[1], 0.7, c[2], 1, c[3]]; } }; }
    function width(str, sz) { g.save(); g.font = '700 ' + sz + 'px ' + T.FONT; var w = 0; for (var q = 0; q < str.length; q++) w += g.measureText(str[q]).width - (q < str.length - 1 ? sz * 0.012 : 0); g.restore(); return w; }
    function soul(x, base) { var a = o(L.a, s1, L.aRing); a.rot = -0.045; a.wave = function (j) { return [4, 0, -2, -4][j] * k; }; T.word(g, 'Soul', x, base, s1, a); T.gloss(g, 'Soul', x, base, s1, a, 0.7); }
    function bopper(x, base) {   // "B" + bomb + "pper", arched: the ends sit lower than the middle
      var wB = width('B', s2), wo = s2 * 0.6, wp = width('pper', s2), W = wB + wo + wp - s2 * 0.06, x0 = x - W / 2, b = o(L.b, s2, L.bRing);
      var pp = o(L.b, s2, L.bRing); pp.wave = function (j) { return [-8, -9, -4, 8][j] * k; }; pp.rot = 0.012;
      T.word(g, 'pper', x0 + wB + wo - s2 * 0.06 + wp / 2, base, s2, pp); T.gloss(g, 'pper', x0 + wB + wo - s2 * 0.06 + wp / 2, base, s2, pp, 0.5);
      b.rot = -0.03; T.word(g, 'B', x0 + wB / 2, base + 8 * k, s2 * 1.06, b); T.gloss(g, 'B', x0 + wB / 2, base + 8 * k, s2 * 1.06, b, 0.5);
      bomb(g, T, L, x0 + wB + wo * 0.44, base - s2 * 0.3, s2 * 0.36, -0.12, 2); return W; }
    if (oneLine) { var w1 = width('Soul', s1), w2 = width('B', s2) + s2 * 0.6 + width('pper', s2), gap = 40 * k, x0 = cx - (w1 + gap + w2) / 2; soul(x0 + w1 / 2, y1); bopper(x0 + w1 + gap + w2 / 2, y1 + 2 * k); return; }
    soul(cx + 37 * k, y1); bopper(cx + 6 * k, y2);
  }
  function emblem(g, T, L) {   // picture coordinates
    burst(g, T, 470, 96, 50, '#ffb02e'); burst(g, T, 852, 132, 60, '#ffb02e'); burst(g, T, 800, 400, 70, '#ffb02e'); burst(g, T, 350, 300, 44, '#ffd23e'); burst(g, T, 96, 330, 40, '#ffd23e');
    bomb(g, T, L, 470, 84, 34, -0.3); bomb(g, T, L, 858, 124, 62, 0.2, true); bomb(g, T, L, 84, 336, 34, 0.5); bomb(g, T, L, 792, 262, 40, 0.5);
    bat(g, T, L, 578, 172, 1.05, -0.05); bat(g, T, L, 912, 262, 0.9, 0.25);
    ghost(g, T, L, 250, 236, 1.2);
    var r = T.rng(12); for (var i = 0; i < 70; i++) { var a = r() * TAU, d = 170 + r() * 330; g.globalAlpha = 0.5 + r() * 0.5; g.fillStyle = ['#ffd23e', '#ff9a2a', '#7fe8ff', '#ffffff'][i % 4]; g.beginPath(); g.ellipse(540 + Math.cos(a) * d, 300 + Math.sin(a) * d * 0.56, 1.5 + r() * 3.5, 1 + r() * 2, a, 0, TAU); g.fill(); } g.globalAlpha = 1;
    words(g, T, L, 540, 320, 463, 1);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { floor(g, T, L); bomb(g, T, L, 100, 486, 70, -0.3); bomb(g, T, L, 936, 500, 60, 0.3); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(26, 18); g.fillStyle = T.rad(g, 545, 300, 100, 400, [0, 'rgba(120,200,255,.6)', 0.5, 'rgba(130,90,255,.4)', 1, 'rgba(110,90,255,0)']); g.fillRect(-26, -18, 1040, 590); emblem(g, T, L); return; }
    if (kind === 'wide') { ghost(g, T, L, 92, 116, 0.5, true); words(g, T, L, 516, 150, 0, 0.6, true); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.lin(g, 0, 0, 400, 400, [0, L.sky[0], 0.5, L.sky[1], 1, L.sky[2]]); g.fill(); g.clip(); g.fillStyle = T.rad(g, 200, 180, 20, 280, [0, 'rgba(140,220,255,.6)', 1, 'rgba(0,0,0,.25)']); g.fillRect(0, 0, 400, 400);
      if (px >= 90) { burst(g, T, 300, 110, 40, '#ffb02e'); bomb(g, T, L, 304, 104, 34, 0.2); ghost(g, T, L, 120, 128, 0.74); words(g, T, L, 196, 268, 352, 0.58); } else { ghost(g, T, L, 190, 190, 1.35, true); bomb(g, T, L, 320, 300, 44, 0.2); }
      g.restore(); T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 12; g.strokeStyle = L.dark; g.stroke(); g.lineWidth = 6; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.a[2], 1, L.b[2]]); g.stroke(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO soulbopper END

// 🏷️ LOGO sweet-swap START — 🍬 Sweet Swap, drawn in code from Aowu's picture (gl-13, round 5). Every letter its own candy colour, sprinkles on the S,
// striped ball · heart · wrapped candy · star on top, two swap arrows, peppermints, sparkle comet. Looks = the game's board themes.
GameLogos.add('sweet-swap', (function () {
  var BOX = { scene: [1024, 572], main: [620, 470], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { bg: ['#6a2fb0', '#3a0f6e', '#1e0640'], dark: '#3a0c66', glow: '#ff6ad8', rim: '#ffffff',
    // per letter: top · middle · bottom (sampled from the picture)
    a: [['#ffd0f0', '#ff7ac8', '#e8389a'], ['#fff6a0', '#ffd23a', '#ff9a14'], ['#fffbb0', '#ffe84a', '#f0b414'], ['#ffe27a', '#ffb81a', '#ff7a12'], ['#ff9a8a', '#ff3a3a', '#d0101e']],
    b: [['#b8fbff', '#3ad8f5', '#1a8ae8'], ['#c8ffb0', '#5ae84a', '#1aa83a'], ['#f4ffa0', '#b8f03a', '#6ac81a'], ['#ffd88a', '#ff9a22', '#f0520e']],
    candy: ['#ff3a4a', '#3ab8ff', '#b84af5', '#ffd23a'], rim2: 'rgba(190,110,255,.9)' };
    for (var k in o) b[k] = o[k]; return b; }
  // the game's board themes (SweetSwap.html THEMES: board + tile colours) → background, outline, glow
  function th(board, t0, t1, dark, extra) { var o = { bg: [t1, board, dark], dark: dark, glow: t1 }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var LOOK = { classic: mk({}),
    sweets: th('#C2588F', '#FFE3F1', '#FFB8D9', '#5a1238'), blocks: th('#4B5AA8', '#E9F0FF', '#B9C8F5', '#1a2260'), animals: th('#5D8F3A', '#EAF8DC', '#B9E59A', '#1e3a10'),
    dino: th('#8A5A2B', '#FFF1D6', '#F2C98A', '#3a2008'), alien: th('#4B3A8A', '#E6E0FF', '#B8A8F2', '#1e1248'), vehicles: th('#2F6FA0', '#E3F4FF', '#A8D8F5', '#0e2a48'),
    space: th('#120C2E', '#1B1440', '#3A2A7A', '#05030f', { bg: ['#3A2A7A', '#1B1440', '#05030f'], glow: '#8a6aff' }) };
  /* ---------- candies (the picture's four, glossy) ---------- */
  function gloss(g, x, y, rx, ry, a) { g.save(); g.globalAlpha = a || 0.7; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, y, rx, ry, -0.5, 0, TAU); g.fill(); g.restore(); }
  function ball(g, T, x, y, r, c) {   // red + white striped ball
    g.save(); g.shadowColor = c; g.shadowBlur = r * 0.6; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.translate(x, y); g.rotate(-0.6); g.fillStyle = c; for (var i = -4; i <= 4; i++) { g.beginPath(); g.ellipse(i * r * 0.42, 0, r * 0.12, r * 1.3, 0, 0, TAU); g.fill(); } g.rotate(0.6); g.fillStyle = T.rad(g, -r * 0.3, -r * 0.4, r * 0.1, r * 1.2, [0, 'rgba(255,255,255,0)', 0.7, 'rgba(80,0,20,0)', 1, 'rgba(80,0,20,.45)']); g.fillRect(-r, -r, r * 2, r * 2); g.restore();
    gloss(g, x - r * 0.35, y - r * 0.45, r * 0.28, r * 0.14);
  }
  function heartPath(g, x, y, s) { g.beginPath(); g.moveTo(x, y + s * 0.62); g.bezierCurveTo(x - s * 1.15, y - s * 0.05, x - s * 0.62, y - s * 0.95, x, y - s * 0.38); g.bezierCurveTo(x + s * 0.62, y - s * 0.95, x + s * 1.15, y - s * 0.05, x, y + s * 0.62); g.closePath(); }
  function heart(g, T, x, y, s, c) { g.save(); g.shadowColor = c; g.shadowBlur = s * 0.6; heartPath(g, x, y, s); g.fillStyle = T.lin(g, 0, y - s, 0, y + s * 0.7, [0, '#c8f0ff', 0.4, c, 1, '#1a5ad0']); g.fill(); g.restore(); gloss(g, x - s * 0.4, y - s * 0.35, s * 0.22, s * 0.1, 0.8); }
  function wrapped(g, T, x, y, r, c) {   // purple wrapped candy with big twisted bows
    g.save(); g.translate(x, y); g.rotate(-0.35);
    [-1, 1].forEach(function (k) { g.save(); g.shadowColor = c; g.shadowBlur = r * 0.4; g.beginPath(); g.moveTo(k * r * 0.7, 0); g.quadraticCurveTo(k * r * 1.3, -r * 0.3, k * r * 1.9, -r * 0.85); g.quadraticCurveTo(k * r * 1.62, 0, k * r * 1.9, r * 0.85); g.quadraticCurveTo(k * r * 1.3, r * 0.3, k * r * 0.7, 0); g.closePath(); g.fillStyle = T.lin(g, 0, -r, 0, r, [0, '#ffb8ff', 0.5, '#d05af0', 1, '#7a1ac8']); g.fill(); g.restore();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(k * r * 1.0, -r * 0.1); g.lineTo(k * r * 1.7, -r * 0.6); g.stroke(); });
    g.save(); g.shadowColor = c; g.shadowBlur = r * 0.7; g.beginPath(); g.ellipse(0, 0, r, r * 0.9, 0, 0, TAU); g.fillStyle = T.rad(g, -r * 0.3, -r * 0.35, r * 0.1, r * 1.1, [0, '#ffd8ff', 0.35, '#d070ff', 0.7, c, 1, '#5a0aa0']); g.fill(); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = r * 0.08; for (var i = -1; i <= 1; i++) { g.beginPath(); g.arc(0, 0, r * (0.5 + i * 0.18), -2.4, -0.9); g.stroke(); } g.restore(); gloss(g, x - r * 0.3, y - r * 0.4, r * 0.3, r * 0.14, 0.85);
    var rr = T.rng(4); for (var q = 0; q < 6; q++) T.spark(g, x - r + rr() * r * 2, y - r * 0.8 + rr() * r * 1.4, 3 + rr() * 4, '#fff', 0.9);
  }
  function star(g, T, x, y, R, c) { g.save(); g.shadowColor = c; g.shadowBlur = R * 0.6; g.lineJoin = 'round'; T.star(g, x, y, R, R * 0.55, 5, -Math.PI / 2 + 0.12); g.lineWidth = R * 0.32; g.strokeStyle = '#ffc21a'; g.stroke(); g.fillStyle = T.lin(g, 0, y - R, 0, y + R, [0, '#fff8b0', 0.5, c, 1, '#ff9a14']); g.fill(); g.restore(); gloss(g, x - R * 0.25, y - R * 0.35, R * 0.22, R * 0.1); }
  function mint(g, T, x, y, r) { g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = r * 0.4; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.fillStyle = '#ff3a5a'; for (var i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, i * TAU / 6, i * TAU / 6 + TAU / 14); g.closePath(); g.fill(); } g.restore(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.lineWidth = r * 0.12; g.strokeStyle = 'rgba(120,20,60,.4)'; g.stroke(); gloss(g, x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.12, 0.8); }
  /* ---------- swap arrows: glowing neon tubes ---------- */
  function arrow(g, T, pts, c, c2, head) {
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    function path() { g.beginPath(); g.moveTo(pts[0], pts[1]); g.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); }
    g.shadowColor = c; g.shadowBlur = 22; path(); g.lineWidth = 16; g.strokeStyle = c; g.stroke(); g.shadowBlur = 0; path(); g.lineWidth = 7; g.strokeStyle = c2; g.stroke();
    var a = Math.atan2(pts[5] - pts[3], pts[4] - pts[2]); g.translate(pts[4], pts[5]); g.rotate(a); g.shadowColor = c; g.shadowBlur = 18; g.beginPath(); g.moveTo(head, 0); g.lineTo(-head * 0.6, -head * 0.85); g.lineTo(-head * 0.6, head * 0.85); g.closePath(); g.fillStyle = c; g.fill(); g.shadowBlur = 0; g.beginPath(); g.moveTo(head * 0.55, 0); g.lineTo(-head * 0.3, -head * 0.42); g.lineTo(-head * 0.3, head * 0.42); g.closePath(); g.fillStyle = c2; g.fill(); g.restore();
  }
  function comet(g, T) {   // the sparkle comet looping out of the words up to a star
    function path() { g.beginPath(); g.moveTo(690, 250); g.bezierCurveTo(860, 236, 930, 150, 870, 96); g.bezierCurveTo(830, 62, 760, 80, 742, 110); }
    g.save(); g.lineCap = 'round'; g.shadowColor = '#ff8ae8'; g.shadowBlur = 18; [[18, 'rgba(255,120,220,.25)'], [9, 'rgba(255,190,240,.5)'], [3.5, 'rgba(255,255,255,.85)']].forEach(function (w) { path(); g.lineWidth = w[0]; g.strokeStyle = w[1]; g.stroke(); }); g.restore();
    var r = T.rng(21); for (var q = 0; q < 44; q++) { var t = r(), u = 1 - t, x = u * u * u * 690 + 3 * u * u * t * 860 + 3 * u * t * t * 930 + t * t * t * 870 + (r() - 0.5) * 34, y = u * u * u * 250 + 3 * u * u * t * 236 + 3 * u * t * t * 150 + t * t * t * 96 + (r() - 0.5) * 34; T.spark(g, x, y, 2 + r() * 6, ['#fff', '#ffd2f4', '#a8e8ff', '#fff6a0'][q % 4], 0.6 + r() * 0.4); }
    g.save(); g.shadowColor = '#fff6a0'; g.shadowBlur = 24; T.star(g, 878, 74, 26, 9, 4, 0); g.fillStyle = '#fffbe0'; g.fill(); g.restore();
    [[812, 150, '#ffd23a'], [890, 190, '#3ab8ff'], [800, 214, '#ff5aa8'], [770, 92, '#7ae84a'], [840, 120, '#fff']].forEach(function (d, i) { g.save(); g.translate(d[0], d[1]); g.rotate(i); T.rr(g, -6, -3, 12, 6, 3); g.fillStyle = d[2]; g.fill(); g.restore(); });
    ball(g, T, 770, 74, 13, '#ff3a4a'); heart(g, T, 868, 182, 14, '#3ab8ff');
  }
  function burst(g, T, x, y, R, c) { g.save(); g.strokeStyle = c; g.lineCap = 'round'; g.shadowColor = c; g.shadowBlur = 10; for (var i = 0; i < 14; i++) { var a = i * TAU / 14, l = R * (i % 2 ? 0.6 : 1); g.beginPath(); g.moveTo(x + Math.cos(a) * R * 0.25, y + Math.sin(a) * R * 0.25); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.lineWidth = 2.5; g.stroke(); } g.restore(); T.spark(g, x, y, R * 0.35, '#fff', 1); }
  /* ---------- the words: every letter its own candy colour, one thick dark outline that joins them into a plate ---------- */
  function o(L, cols, size) { return { spacing: size * 0.005, dark: L.dark, outline: size * 0.21, depth: size * 0.08, fat: size * 0.006, ring: L.rim2, edge: function (j) { return GameLogos.tools.shade(cols[j % cols.length][2], -0.45); }, edgeW: size * 0.075, glow: L.glow, glowN: 1, glowBlur: 0.22, face: function (j) { var c = cols[j % cols.length]; return [0, c[0], 0.42, c[1], 1, c[2]]; } }; }
  function sprinkles(g, x, y, w, h) { var r = GameLogos.tools.rng(8), cols = ['#ff3a5a', '#3ab8ff', '#ffd23a', '#7ae84a', '#fff', '#b84af5']; for (var i = 0; i < 14; i++) { g.save(); g.translate(x + r() * w, y + r() * h); g.rotate(r() * TAU); GameLogos.tools.rr(g, -6, -2.2, 12, 4.4, 2.2); g.fillStyle = cols[i % cols.length]; g.fill(); g.restore(); } }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    var s1 = 178 * k, s2 = 160 * k, A = o(L, L.a, s1), B = o(L, L.b, s2);
    if (oneLine) {
      g.save(); g.font = '700 ' + s1 + 'px ' + T.FONT; var w1 = g.measureText('Sweet').width - 4 * s1 * 0.01; g.font = '700 ' + s2 + 'px ' + T.FONT; var w2 = g.measureText('Swap').width - 3 * s2 * 0.01; g.restore();
      var gap = 74 * k, x0 = cx - (w1 + gap + w2) / 2; T.word(g, 'Swap', x0 + w1 + gap + w2 / 2, y1, s2, B); T.gloss(g, 'Swap', x0 + w1 + gap + w2 / 2, y1, s2, B, 0.55); T.word(g, 'Sweet', x0 + w1 / 2, y1, s1, A); T.gloss(g, 'Sweet', x0 + w1 / 2, y1, s1, A, 0.55); return;
    }
    A.wave = function (j) { return [0, 4, 2, 0, -6][j] * k; }; A.rot = -0.03; B.wave = function (j) { return [0, 3, 2, -6][j] * k; };
    B.glowBlur = 0.3; T.word(g, 'Swap', cx + 6 * k, y2, s2, B); T.gloss(g, 'Swap', cx + 6 * k, y2, s2, B, 0.5);
    A.glow = null; T.word(g, 'Sweet', cx, y1, s1, A); T.gloss(g, 'Sweet', cx, y1, s1, A, 0.5);
    g.save(); g.translate(cx, y1); g.rotate(-0.03); g.translate(-cx, -y1); sprinkles(g, cx - 220 * k, y1 - 126 * k, 74 * k, 40 * k); g.restore();
  }
  function emblem(g, T, L, full) {
    if (full) comet(g, T);
    if (full) { burst(g, T, 250, 372, 40, '#ffd23a'); burst(g, T, 792, 318, 44, '#ffd23a'); }
    g.fillStyle = T.rad(g, 512, 330, 10, 300, [0, 'rgba(255,200,120,.75)', 0.45, 'rgba(255,120,190,.35)', 1, 'rgba(255,120,200,0)']); g.fillRect(200, 40, 640, 520);
    words(g, T, L, 512, 316, 446, 1);
    arrow(g, T, [318, 470, 240, 440, 288, 364], '#3ae0ff', '#e0fbff', 22); arrow(g, T, [716, 350, 804, 372, 750, 452], '#e05af0', '#ffe0fb', 22);
    mint(g, T, 504, 342, 18); mint(g, T, 600, 333, 16); mint(g, T, 436, 458, 18);
    ball(g, T, 414, 184, 48, L.candy[0]); heart(g, T, 504, 170, 80, L.candy[1]); wrapped(g, T, 600, 160, 42, L.candy[2]); star(g, T, 692, 128, 56, L.candy[3]);
    if (full) [[350, 150, 9], [560, 92, 7], [760, 380, 8], [272, 462, 7], [570, 480, 9]].forEach(function (s) { T.spark(g, s[0], s[1], s[2] * 1.6, '#fff', 0.95); });
  }
  function backdrop(g, T, L, x, y, w, h) {
    g.fillStyle = T.rad(g, x + w / 2, y + h * 0.48, 30, Math.max(w, h) * 0.7, [0, L.bg[0], 0.5, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h);
    var r = T.rng(13); g.save(); g.globalAlpha = 0.16; for (var i = 0; i < 16; i++) { var cx = x + r() * w, cy = y + r() * h, rr = 18 + r() * 26; if (Math.abs(cx - x - w / 2) < w * 0.3 && Math.abs(cy - y - h / 2) < h * 0.36) continue; [ball, mint][i % 2](g, T, cx, cy, rr, '#ff5a8a'); } g.restore();
    for (var q = 0; q < 50; q++) { g.globalAlpha = 0.35 + r() * 0.5; g.fillStyle = ['#ffb86a', '#ff8ad8', '#fff6a0'][q % 3]; g.beginPath(); g.arc(x + r() * w, y + r() * h, 1 + r() * 3, 0, TAU); g.fill(); } g.globalAlpha = 1;
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { backdrop(g, T, L, 0, 0, 1024, 572); g.fillStyle = T.rad(g, 512, 300, 10, 330, [0, 'rgba(255,170,120,.45)', 1, 'rgba(255,120,200,0)']); g.fillRect(0, 0, 1024, 572); emblem(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-206, -52); g.fillStyle = T.rad(g, 512, 320, 10, 300, [0, L.glow, 1, 'rgba(0,0,0,0)']); g.globalAlpha = 0.35; g.fillRect(206, 52, 620, 470); g.globalAlpha = 1; emblem(g, T, L, false); return; }
    if (kind === 'wide') { ball(g, T, 56, 72, 30, L.candy[0]); heart(g, T, 110, 74, 30, L.candy[1]); wrapped(g, T, 82, 130, 24, L.candy[2]); star(g, T, 146, 132, 30, L.candy[3]); words(g, T, L, 520, 146, 0, 0.62, true); return; }
    if (kind === 'badge') {
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.clip(); backdrop(g, T, L, 14, 14, 372, 372); g.restore();
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.lineWidth = 8; g.strokeStyle = T.lin(g, 0, 14, 0, 386, [0, '#ffd0f0', 0.5, L.glow, 1, L.dark]); g.shadowColor = L.glow; g.shadowBlur = 16; g.stroke(); g.restore();
      if (px >= 90) { g.translate(200, 214); g.scale(0.6, 0.6); g.translate(-512, -300); emblem(g, T, L, false); }
      else { ball(g, T, 150, 160, 70, L.candy[0]); heart(g, T, 262, 168, 76, L.candy[1]); wrapped(g, T, 168, 282, 56, L.candy[2]); star(g, T, 278, 284, 66, L.candy[3]); }
      return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO sweet-swap END

// 🏷️ LOGO turbo START — 🏎️ Turbo Trail, drawn in code from Aowu's picture (gl-25, round 9). A neon frame (purple → cyan) with progress bars, slanted
// fire-orange "TURBO" with speed streaks over neon blue-green "TRAIL", our own red sports car with yellow stripes and a flame trail racing a looping road;
// cones, striped barriers, tyres, gears, a bomb with a face, coins, checkered flags, splashes, a "Level Up!" tag (scene + main only).
// Looks = Turbo.html THEMES (roadtrip · space · jungle · dragon · horse · ship): road, frame and sky colours.
GameLogos.add('turbo', (function () {
  var BOX = { scene: [1024, 572], main: [880, 540], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { bg: ['#1a1f3a', '#0a0e1c', '#04060c'], road: '#4A4E57', line: '#ffd23a', frame: ['#b04aff', '#3ad8ff'], car: '#e8202a', fire: ['#fff2a0', '#ffb01a', '#ff4a1a'] }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}), roadtrip: mk({ bg: ['#2a5a2a', '#123018', '#061008'], road: '#4A4E57', frame: ['#7ae84a', '#ffd23a'] }), space: mk({ bg: ['#2a2266', '#0E0B2A', '#04030f'], road: '#2A2266', line: '#7FE7FF', frame: ['#FF4DD8', '#7FE7FF'] }),
    jungle: mk({ bg: ['#2E6B33', '#123018', '#06100a'], road: '#9A6B3E', frame: ['#ffd23a', '#7ae84a'] }), dragon: mk({ bg: ['#86CDF5', '#3a7ab8', '#14305a'], road: '#c8d8e8', line: '#ff8a3a', frame: ['#ff5a8a', '#ffd23a'] }),
    horse: mk({ bg: ['#5E9E45', '#2a4a1a', '#101a08'], road: '#C79A5A', line: '#fff', frame: ['#ff8a3a', '#ffd23a'] }), ship: mk({ bg: ['#2E86C1', '#123a5a', '#06141e'], road: '#2E86C1', line: '#fff', frame: ['#3ad8ff', '#ffffff'] }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#14080c';
  function road(g, T, L, pts, w) {
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; function p() { g.beginPath(); g.moveTo(pts[0], pts[1]); g.bezierCurveTo(pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]); }
    p(); g.lineWidth = w + 12; g.strokeStyle = 'rgba(0,0,0,.6)'; g.stroke(); p(); g.lineWidth = w + 6; g.strokeStyle = sh(L.road, 0.35); g.stroke(); p(); g.lineWidth = w; g.strokeStyle = L.road; g.stroke();
    p(); g.setLineDash([18, 16]); g.lineWidth = 4; g.strokeStyle = L.line; g.stroke(); g.setLineDash([]); g.restore();
  }
  function frame(g, T, L, glow, bars) {
    g.save(); T.rr(g, 272, 42, 486, 476, 70); g.fillStyle = T.rad(g, 512, 280, 20, 340, [0, '#1a2448', 1, '#0a0e22']); g.fill();
    g.lineWidth = 10; g.strokeStyle = T.lin(g, 272, 0, 758, 0, [0, L.frame[0], 1, L.frame[1]]); if (glow) { g.shadowColor = L.frame[1]; g.shadowBlur = 26; } g.stroke(); g.shadowBlur = 0;
    T.rr(g, 284, 54, 462, 452, 60); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.35)'; g.stroke(); g.restore();
    if (bars) { T.rr(g, 378, 66, 302, 20, 10); g.fillStyle = '#0a1028'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#3a4a7a'; g.stroke(); T.rr(g, 382, 70, 160, 12, 6); g.fillStyle = T.lin(g, 382, 0, 542, 0, [0, '#3ad8ff', 1, '#7ae84a']); g.fill();
      T.rr(g, 416, 478, 80, 20, 8); g.fillStyle = '#0a1028'; g.fill(); g.stroke(); T.rr(g, 420, 482, 72, 12, 6); g.fillStyle = T.lin(g, 420, 0, 492, 0, [0, '#3ad8ff', 1, '#2a8af0']); g.fill(); }
  }
  /* ---------- props ---------- */
  function cone(g, T, x, y, k, col) { g.save(); g.translate(x, y); g.scale(k, k); g.beginPath(); g.moveTo(-6, -46); g.lineTo(6, -46); g.lineTo(18, 0); g.lineTo(-18, 0); g.closePath(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.fillStyle = T.lin(g, -18, 0, 18, 0, [0, sh(col, 0.3), 1, sh(col, -0.3)]); g.fill(); g.fillStyle = '#fff'; g.fillRect(-11, -30, 22, 8); g.fillRect(-15, -14, 30, 6); T.rr(g, -26, -4, 52, 10, 3); g.fillStyle = sh(col, -0.2); g.fill(); g.stroke(); g.restore(); }
  function barrier(g, T, x, y, w, rot) { g.save(); g.translate(x, y); g.rotate(rot); T.rr(g, -w / 2, -14, w, 28, 5); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#ff8a1a'; g.fill(); g.save(); g.clip(); g.fillStyle = '#fff';
    for (var i = -w; i < w; i += 22) { g.beginPath(); g.moveTo(i, 14); g.lineTo(i + 11, 14); g.lineTo(i + 25, -14); g.lineTo(i + 14, -14); g.closePath(); g.fill(); } g.restore(); g.fillStyle = '#6a7080'; g.fillRect(-w / 2 + 8, 14, 6, 22); g.fillRect(w / 2 - 14, 14, 6, 22); g.restore(); }
  function tyre(g, T, x, y, r, a) { g.save(); g.translate(x, y); g.rotate(a || 0); g.beginPath(); g.ellipse(0, 0, r, r * 0.92, 0, 0, TAU); g.fillStyle = '#20222a'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#000'; g.stroke();
    g.beginPath(); g.ellipse(0, 0, r * 0.5, r * 0.46, 0, 0, TAU); g.fillStyle = T.rad(g, -r * 0.1, -r * 0.1, 1, r * 0.5, [0, '#e8eef8', 1, '#7a8494']); g.fill(); g.strokeStyle = '#4a4e58'; g.lineWidth = 2; for (var i = 0; i < 5; i++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(i * 1.256) * r * 0.45, Math.sin(i * 1.256) * r * 0.42); g.stroke(); } g.restore(); }
  function gear(g, T, x, y, r) { g.save(); g.translate(x, y); g.beginPath(); for (var i = 0; i < 16; i++) { var a = i * TAU / 16, q = i % 2 ? r : r * 1.28; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); g.fillStyle = T.lin(g, -r, -r, r, r, [0, '#e8eef8', 1, '#7a8494']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#2a2e38'; g.stroke(); g.beginPath(); g.arc(0, 0, r * 0.38, 0, TAU); g.fillStyle = '#2a2e38'; g.fill(); g.restore(); }
  function bomb(g, T, x, y) { g.beginPath(); g.arc(x, y, 22, 0, TAU); g.fillStyle = T.rad(g, x - 7, y - 7, 2, 24, [0, '#5a6070', 1, '#14161c']); g.fill(); g.lineWidth = 4; g.strokeStyle = '#000'; g.stroke();
    g.strokeStyle = '#8a6a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 12, y - 18); g.quadraticCurveTo(x - 22, y - 34, x - 34, y - 32); g.stroke(); T.spark(g, x - 36, y - 34, 10, '#ffd23a', 1);
    [[-7, -3], [7, -3]].forEach(function (e) { g.beginPath(); g.ellipse(x + e[0], y + e[1], 5, 6, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(x + e[0] + 1, y + e[1] + 1, 2.5, 0, TAU); g.fillStyle = '#000'; g.fill(); });
    g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y + 6, 7, 0.2, Math.PI - 0.2); g.stroke(); }
  function coin(g, T, x, y, r) { g.beginPath(); g.ellipse(x, y, r * 0.86, r, 0, 0, TAU); g.fillStyle = T.lin(g, x - r, y - r, x + r, y + r, [0, '#fff2a0', 0.5, '#ffc21a', 1, '#c8800a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#8a5a04'; g.stroke(); g.beginPath(); g.ellipse(x, y, r * 0.55, r * 0.68, 0, 0, TAU); g.stroke(); }
  function flag(g, T, x, y, k) { g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#ccc'; g.fillRect(-2, 0, 4, 40); for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#fff'; g.fillRect(2 + i * 7, j * 7 + Math.sin(i) * 2, 7, 7); } g.restore(); }
  function splash(g, T, x, y, a, k) { g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k); g.fillStyle = T.lin(g, 0, -40, 0, 20, [0, '#d8f4ff', 1, '#3a9ae8']); for (var i = 0; i < 5; i++) { g.beginPath(); g.ellipse(-20 + i * 10, -10 - (i % 2) * 14, 6, 18, -0.6 + i * 0.3, 0, TAU); g.fill(); } g.restore(); }
  function arrow(g, T, x, y, a, len) { g.save(); g.translate(x, y); g.rotate(a); g.shadowColor = '#3a8aff'; g.shadowBlur = 10; g.fillStyle = T.lin(g, -len, 0, 0, 0, [0, 'rgba(60,140,255,0)', 1, '#3a8aff']); g.fillRect(-len, -6, len, 12);
    g.beginPath(); g.moveTo(22, 0); g.lineTo(-4, -18); g.lineTo(-4, 18); g.closePath(); g.fillStyle = '#5aa8ff'; g.fill(); g.restore(); }
  function tag(g, T) { g.save(); g.translate(806, 74); g.rotate(-0.12); T.rr(g, -42, -26, 84, 52, 12); g.fillStyle = '#1a1030'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#ffd23a'; g.stroke(); g.font = '700 20px ' + T.FONT; g.textAlign = 'center'; g.fillStyle = '#ffd23a'; g.fillText('Level', 0, -3); g.fillText('Up!', 0, 19); g.restore(); }
  /* ---------- our own car (one piece) + flame trail ---------- */
  function fire(g, T, L) { g.save(); g.globalCompositeOperation = 'lighter';
    [[34, 0.35], [24, 0.6], [12, 0.9]].forEach(function (q, i) { g.beginPath(); g.moveTo(812, 344); g.quadraticCurveTo(880, 280, 874, 150); g.quadraticCurveTo(904, 250, 824, 392); g.closePath(); g.fillStyle = T.lin(g, 812, 360, 874, 150, [0, L.fire[2 - i], 1, 'rgba(255,90,20,0)']); g.globalAlpha = q[1]; g.fill(); g.translate(4, 6); });
    g.restore(); }
  function car(g, T, L) {
    var C = L.car, P = {
      wheelB: function (h) { h.beginPath(); h.ellipse(802, 422, 19, 23, -0.2, 0, TAU); h.fill(); },
      body: function (h) { h.beginPath(); h.moveTo(600, 466); h.lineTo(598, 432); h.quadraticCurveTo(606, 410, 636, 402); h.lineTo(690, 388); h.lineTo(726, 352); h.quadraticCurveTo(760, 336, 796, 340); h.lineTo(818, 360); h.lineTo(824, 396); h.quadraticCurveTo(822, 414, 806, 420); h.lineTo(760, 440); h.lineTo(704, 470); h.quadraticCurveTo(650, 480, 600, 466); h.closePath(); h.fill(); },
      wheelF: function (h) { h.beginPath(); h.ellipse(700, 470, 21, 24, -0.15, 0, TAU); h.fill(); h.beginPath(); h.ellipse(608, 468, 12, 16, 0, 0, TAU); h.fill(); }
    };
    T.onePiece(g, T, { x0: 580, y0: 320, W: 260, H: 180, rim: INK, rimW: 4.2, parts: P, order: ['wheelB', 'body', 'wheelF'],
      colour: function (B, put, inside) {
        put(B, 'wheelB', '#1a1c24');
        put(B, 'body', T.lg(B, 640, 360, 820, 440, [0, sh(C, 0.35), 0.5, C, 1, sh(C, -0.35)]));
        inside(B, 'body', function (h) {
          h.fillStyle = sh(C, -0.25); h.beginPath(); h.moveTo(600, 466); h.lineTo(598, 432); h.lineTo(690, 446); h.lineTo(704, 470); h.closePath(); h.fill();   // the front face
          h.fillStyle = '#1a1c24'; GameLogos.tools.rr(h, 618, 448, 54, 12, 4); h.fill(); h.strokeStyle = '#4a4e58'; h.lineWidth = 2; for (var i = 0; i < 5; i++) { h.beginPath(); h.moveTo(626 + i * 10, 449); h.lineTo(624 + i * 10, 459); h.stroke(); }
          h.fillStyle = T.lg(h, 700, 350, 800, 390, [0, '#9ad8ff', 0.5, '#2a6ab8', 1, '#0a1a4a']); h.beginPath(); h.moveTo(700, 386); h.lineTo(730, 356); h.quadraticCurveTo(760, 344, 792, 348); h.lineTo(806, 364); h.lineTo(786, 384); h.closePath(); h.fill();
          h.strokeStyle = sh(C, -0.4); h.lineWidth = 4; h.beginPath(); h.moveTo(760, 346); h.lineTo(752, 386); h.stroke();
          h.fillStyle = 'rgba(255,255,255,.5)'; h.beginPath(); h.moveTo(712, 380); h.lineTo(734, 360); h.lineTo(742, 360); h.lineTo(720, 382); h.closePath(); h.fill();
          h.fillStyle = '#ffd23a'; [[0, 0], [20, 3]].forEach(function (o) { h.beginPath(); h.moveTo(616 + o[0], 432 + o[1]); h.lineTo(688 + o[0] * 0.6, 392 + o[1] * 0.3); h.lineTo(700 + o[0] * 0.6, 392 + o[1] * 0.3); h.lineTo(630 + o[0], 434 + o[1]); h.closePath(); h.fill(); });
          h.beginPath(); h.moveTo(740, 350); h.lineTo(784, 342); h.lineTo(788, 348); h.lineTo(746, 356); h.closePath(); h.fill();
          h.fillStyle = 'rgba(255,255,255,.45)'; h.beginPath(); h.ellipse(650, 408, 22, 5, -0.25, 0, TAU); h.fill(); h.fillStyle = 'rgba(60,0,0,.25)'; h.beginPath(); h.moveTo(704, 470); h.lineTo(824, 406); h.lineTo(824, 440); h.lineTo(704, 490); h.closePath(); h.fill();
          h.fillStyle = '#fff6c8'; h.beginPath(); h.ellipse(608, 440, 9, 6, 0.1, 0, TAU); h.ellipse(680, 452, 10, 6, 0.1, 0, TAU); h.fill(); });
        put(B, 'wheelF', '#1a1c24'); inside(B, 'wheelF', function (h) { h.fillStyle = T.rg(h, 700, 468, 2, 14, [0, '#f0f4fa', 1, '#7a8494']); h.beginPath(); h.ellipse(702, 470, 11, 14, -0.15, 0, TAU); h.fill(); });
      } });
    g.save(); g.globalCompositeOperation = 'lighter'; [[608, 440], [680, 452]].forEach(function (p) { g.fillStyle = T.rad(g, p[0], p[1], 1, 26, [0, 'rgba(255,255,220,1)', 0.3, 'rgba(255,240,170,.55)', 1, 'rgba(255,240,170,0)']); g.beginPath(); g.arc(p[0], p[1], 26, 0, TAU); g.fill(); }); g.restore();
  }
  function bigCar(g, T, L) { g.save(); g.translate(515, 300); g.scale(1.7, 1.7); g.translate(-712, -400); fire(g, T, L); car(g, T, L); g.restore(); }
  function words(g, T, L, cx, y1, s1, y2, s2, streaks) {
    var A = { spacing: s1 * 0.01, dark: '#3a0a04', outline: s1 * 0.16, depth: s1 * 0.09, fat: s1 * 0.006, ring: '#ffd27a', skew: -0.24, rot: -0.03, glow: 'rgba(255,120,40,.7)', glowBlur: 0.3,
      edge: function () { return '#a8300a'; }, edgeW: s1 * 0.06, face: function () { return [0, L.fire[0], 0.45, L.fire[1], 1, L.fire[2]]; } };
    var B = { spacing: s2 * 0.02, dark: '#04122a', outline: s2 * 0.14, depth: s2 * 0.08, fat: s2 * 0.006, ring: '#7aff6a', skew: -0.24, rot: -0.03, glow: 'rgba(90,255,140,.8)', glowBlur: 0.3, glowN: 2,
      edge: function () { return '#0a3a8a'; }, edgeW: s2 * 0.05, face: function () { return [0, '#b8f8ff', 0.45, '#3ad8ff', 1, '#2a6af0']; } };
    if (streaks) { g.save(); g.lineCap = 'round'; [[y1 - s1 * 0.6, 70], [y1 - s1 * 0.36, 100], [y1 - s1 * 0.12, 56], [y2 - s2 * 0.45, 50]].forEach(function (q, i) { var x1 = cx - s1 * 1.5, x0 = x1 - q[1]; g.fillStyle = T.lin(g, x0, 0, x1, 0, [0, 'rgba(255,120,30,0)', 1, i < 3 ? '#ff9a2a' : '#7aff6a']); g.beginPath(); g.moveTo(x0, q[0]); g.lineTo(x1, q[0] - 7); g.lineTo(x1, q[0] + 7); g.closePath(); g.fill(); }); g.restore();
      g.save(); g.strokeStyle = '#7aff6a'; g.shadowColor = '#7aff6a'; g.shadowBlur = 10; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - s2 * 1.6, y2 + 18); g.lineTo(cx + s2 * 1.4, y2 + 10); g.moveTo(cx + s2 * 1.2, y2 - s2 * 0.95); g.lineTo(cx + s2 * 2, y2 - s2 * 0.98); g.stroke(); g.restore(); }
    T.word(g, 'TRAIL', cx + 8, y2, s2, B); T.gloss(g, 'TRAIL', cx + 8, y2, s2, B, 0.4);
    T.word(g, 'TURBO', cx - 6, y1, s1, A); T.gloss(g, 'TURBO', cx - 6, y1, s1, A, 0.5);
  }
  function all(g, T, L, full) {
    road(g, T, L, [250, 40, 60, 160, 40, 420, 190, 560], 64); road(g, T, L, [780, 40, 940, 160, 900, 360, 560, 580], 70);
    if (full) { splash(g, T, 128, 112, -0.4, 1.1); splash(g, T, 96, 360, -1.2, 1.2); }
    tyre(g, T, 180, 150, 18, 0.3); gear(g, T, 210, 160, 14); gear(g, T, 218, 236, 20); bomb(g, T, 156, 206); barrier(g, T, 144, 270, 74, -0.15); barrier(g, T, 176, 324, 90, 0.05); tyre(g, T, 232, 392, 34, 0);
    barrier(g, T, 168, 430, 60, -0.6); g.fillStyle = '#6a7080'; [[136, 480, 18], [176, 494, 14], [200, 470, 10]].forEach(function (r) { g.beginPath(); g.arc(r[0], r[1], r[2], 0, TAU); g.fill(); });
    frame(g, T, L, full, full); tyre(g, T, 800, 180, 22, 0.5);
    if (full) tag(g, T); arrow(g, T, 640, 116, -0.85, 70); arrow(g, T, 868, 56, -0.9, 60); flag(g, T, 776, 82, 0.9); flag(g, T, 876, 82, 0.9); flag(g, T, 930, 230, 1);
    [[868, 150], [886, 196], [902, 240], [920, 330], [880, 286]].forEach(function (c) { coin(g, T, c[0], c[1], 15); }); g.beginPath(); g.arc(940, 286, 20, 0, TAU); g.fillStyle = '#8a8e98'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#2a2e38'; g.stroke();
    fire(g, T, L); car(g, T, L); cone(g, T, 800, 528, 1.2, '#ff8a1a'); cone(g, T, 846, 504, 1, '#b86aff'); cone(g, T, 880, 466, 0.9, '#5ad84a');
    var r = T.rng(25), Cc = ['#ff5aa8', '#ffd23a', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff']; for (var q = 0; q < (full ? 36 : 14); q++) { g.save(); g.translate(30 + r() * 960, 20 + r() * 530); g.rotate(r() * TAU); g.fillStyle = Cc[q % 6]; GameLogos.tools.rr(g, -6, -2.5, 12, 5, 2); g.fill(); g.restore(); }
    for (q = 0; q < 14; q++) T.spark(g, 40 + r() * 950, 30 + r() * 500, 4 + r() * 7, '#fff', 0.8);
    [[520, 132], [566, 116], [610, 106]].forEach(function (s, i) { g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], 16 + i * 2, 7 + i); g.fill(); g.lineWidth = 2; g.strokeStyle = '#8a5a04'; g.stroke(); });
    words(g, T, L, 500, 248, 146, 366, 128, true);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 40, 620, [0, L.bg[0], 0.6, L.bg[1], 1, L.bg[2]]); g.fillRect(0, 0, 1024, 572); all(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-72, -16); all(g, T, L, px >= 300); return; }
    if (kind === 'wide') { g.save(); g.translate(20, 12); g.scale(0.37, 0.37); g.translate(-272, -42); frame(g, T, L, false, false); g.save(); T.rr(g, 272, 42, 486, 476, 70); g.clip(); bigCar(g, T, L); g.restore(); g.restore();
      words(g, T, L, 540, 96, 84, 182, 74, false); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.8, 0.8); g.translate(-515, -280); frame(g, T, L, false, false); g.save(); T.rr(g, 272, 42, 486, 476, 70); g.clip(); if (px >= 90) { fire(g, T, L); car(g, T, L); words(g, T, L, 512, 240, 108, 350, 100, false); } else bigCar(g, T, L); g.restore(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO turbo END

// 🏷️ LOGO wisdeck START — 🃏 WisDeck, drawn in code from Aowu's picture (gl-6)
GameLogos.add('wisdeck', (function () {
  var BOX = { scene: [1024, 572], main: [600, 470], wide: [760, 200], badge: [400, 400] };
  var LOOK = { classic: { sky: ['#2a303c', '#1c212b', '#12161d'], a: ['#fff3a0', '#ffc83a', '#ff9a1c', '#f0700a'], b: ['#d8ff8a', '#8ae03a', '#3fb82a', '#1f8a1a'], dark: '#1a2a1a', vine: ['#7ae04a', '#2fa83a', '#1a7a2a'],
    cards: [['#b08af5', '#7a4ae0'], ['#5ad0a8', '#2a9a7a'], ['#ff9a5a', '#f0603a'], ['#ffd85a', '#f0a81a'], ['#5ac8f0', '#2a8ad8'], ['#c08af5', '#8a4ae0'], ['#fffaf0', '#f0e0c0']] } };
  var TAU = Math.PI * 2;
  // the seven card faces: brain · light bulb · brain · star · star · question · sprout (WisDeck's learn / quiz / collect / grow)
  function face(g, T, i, s) {
    g.lineJoin = 'round'; g.lineCap = 'round';
    if (i === 0 || i === 2) { g.fillStyle = i ? '#ff8ab0' : '#ffb0d0'; g.beginPath(); [[-0.16, -0.08, 0.2], [0.14, -0.1, 0.2], [-0.2, 0.1, 0.17], [0.18, 0.1, 0.18], [0, 0.02, 0.2]].forEach(function (c) { g.moveTo(c[0] * s + c[2] * s, c[1] * s); g.arc(c[0] * s, c[1] * s, c[2] * s, 0, TAU); }); g.fill(); g.lineWidth = s * 0.035; g.strokeStyle = '#a03a6a'; g.stroke(); g.beginPath(); g.moveTo(0, -s * 0.26); g.quadraticCurveTo(-s * 0.06, 0, 0, s * 0.24); g.moveTo(-s * 0.2, -s * 0.04); g.quadraticCurveTo(-s * 0.1, s * 0.02, -s * 0.16, s * 0.12); g.moveTo(s * 0.2, -s * 0.04); g.quadraticCurveTo(s * 0.1, s * 0.02, s * 0.16, s * 0.12); g.stroke(); return; }
    if (i === 1) { g.beginPath(); g.arc(0, -s * 0.06, s * 0.22, 0, TAU); g.fillStyle = T.rad(g, -s * 0.06, -s * 0.12, 1, s * 0.26, [0, '#fffbd0', 1, '#ffd23e']); g.shadowColor = '#fff2a0'; g.shadowBlur = s * 0.2; g.fill(); g.shadowBlur = 0; g.lineWidth = s * 0.035; g.strokeStyle = '#8a5a04'; g.stroke(); T.rr(g, -s * 0.1, s * 0.14, s * 0.2, s * 0.14, s * 0.03); g.fillStyle = '#9aa8b8'; g.fill(); g.stroke(); return; }
    if (i === 3 || i === 4) { T.star(g, 0, 0, s * 0.27, s * 0.13); g.fillStyle = i === 3 ? '#fff6c0' : '#ffe14a'; g.fill(); g.lineWidth = s * 0.035; g.strokeStyle = i === 3 ? '#c8860a' : '#1a5a9a'; g.stroke(); return; }
    if (i === 5) { g.font = '700 ' + s * 0.62 + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = s * 0.08; g.strokeStyle = '#3a1a7a'; g.strokeText('?', 0, s * 0.03); g.fillStyle = '#ffe14a'; g.fillText('?', 0, s * 0.03); return; }
    // sprout growing from a little mound
    g.beginPath(); g.ellipse(0, s * 0.26, s * 0.26, s * 0.1, 0, Math.PI, 0); g.fillStyle = '#8a5a2a'; g.fill(); g.beginPath(); g.moveTo(0, s * 0.2); g.quadraticCurveTo(-s * 0.02, 0, 0, -s * 0.12); g.lineWidth = s * 0.05; g.strokeStyle = '#2f9a3a'; g.stroke();
    [[-1, -0.06], [1, -0.16]].forEach(function (q) { g.beginPath(); g.moveTo(0, q[1] * s); g.quadraticCurveTo(q[0] * s * 0.26, q[1] * s - s * 0.18, q[0] * s * 0.3, q[1] * s - s * 0.02); g.quadraticCurveTo(q[0] * s * 0.14, q[1] * s + s * 0.06, 0, q[1] * s); g.fillStyle = '#6ad04a'; g.fill(); g.lineWidth = s * 0.03; g.strokeStyle = '#1f7a2a'; g.stroke(); });
  }
  function fan(g, T, L, cx, cy, k, n) {   // cards fanned round a pivot at (cx, cy)
    var cnt = n || 7, w = 104 * k, h = 152 * k, lift = 56 * k, spread = cnt === 7 ? 1.7 : 1.0;
    for (var i = 0; i < cnt; i++) { var u = cnt === 1 ? 0 : (i / (cnt - 1) - 0.5), a = u * spread - 0.04, c = L.cards[cnt === 7 ? i : [0, 3, 6][i] || 0], fi = cnt === 7 ? i : [1, 3, 6][i];
      g.save(); g.translate(cx, cy); g.rotate(a); g.translate(0, -lift);
      g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 14 * k; g.shadowOffsetX = -4 * k; T.rr(g, -w / 2, -h, w, h, 13 * k); g.fillStyle = '#fffdf6'; g.fill(); g.shadowColor = 'transparent';
      g.lineWidth = 3.5 * k; g.strokeStyle = '#23263a'; g.stroke();
      T.rr(g, -w / 2 + 8 * k, -h + 8 * k, w - 16 * k, h - 16 * k, 8 * k); g.fillStyle = T.lin(g, 0, -h, 0, 0, [0, c[0], 1, c[1]]); g.fill();
      g.fillStyle = 'rgba(255,255,255,.3)'; T.rr(g, -w / 2 + 13 * k, -h + 13 * k, w * 0.36, 9 * k, 4 * k); g.fill();
      g.translate(i === cnt - 1 ? 0 : -w * 0.17, i === cnt - 1 ? -h * 0.56 : -h * 0.66); face(g, T, fi, w * (i === cnt - 1 ? 1.0 : 0.72)); g.restore(); }
  }
  function leaf(g, x, y, s, rot, c) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.5, -s * 0.5, s, 0); g.quadraticCurveTo(s * 0.5, s * 0.5, 0, 0); g.fillStyle = c; g.fill(); g.lineWidth = Math.max(1, s * 0.07); g.strokeStyle = '#1a6a2a'; g.lineJoin = 'round'; g.stroke(); g.beginPath(); g.moveTo(s * 0.1, 0); g.lineTo(s * 0.86, 0); g.lineWidth = Math.max(1, s * 0.05); g.stroke(); g.restore(); }
  function vine(g, T, L, k, ox, oy) {   // the green swoosh that grows into an arrow
    function X(x) { return ox + x * k; } function Y(y) { return oy + y * k; }
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    function path() { g.beginPath(); g.moveTo(X(292), Y(404)); g.bezierCurveTo(X(360), Y(470), X(600), Y(470), X(690), Y(370)); g.bezierCurveTo(X(740), Y(310), X(748), Y(220), X(742), Y(160)); }
    path(); g.lineWidth = 22 * k; g.strokeStyle = L.vine[2]; g.stroke(); path(); g.lineWidth = 14 * k; g.strokeStyle = T.lin(g, X(292), 0, X(748), 0, [0, L.vine[1], 0.6, L.vine[0], 1, '#b8f06a']); g.stroke();
    g.save(); g.translate(X(741), Y(150)); g.rotate(-0.06); g.beginPath(); g.moveTo(0, -34 * k); g.lineTo(28 * k, 6 * k); g.lineTo(8 * k, 2 * k); g.lineTo(-8 * k, 2 * k); g.lineTo(-28 * k, 6 * k); g.closePath(); g.fillStyle = '#b8f06a'; g.fill(); g.lineWidth = 5 * k; g.strokeStyle = L.vine[2]; g.stroke(); g.restore();
    leaf(g, X(330), Y(430), 30 * k, 2.4, L.vine[0]); leaf(g, X(650), Y(408), 28 * k, -0.5, L.vine[0]); leaf(g, X(712), Y(330), 26 * k, 0.2, '#a8e86a'); leaf(g, X(736), Y(240), 24 * k, 3.5, L.vine[0]); leaf(g, X(708), Y(120), 22 * k, -2.4, '#a8e86a'); leaf(g, X(430), Y(462), 22 * k, 0.9, '#a8e86a');
    g.restore();
  }
  function bits(g, T, k, ox, oy) { var r = T.rng(17), cols = ['#ffb02e', '#6ad04a', '#5ac8f0', '#ff6a8a', '#ffd23e']; for (var i = 0; i < 30; i++) { var a = Math.PI * (1 + r()), d = 190 + r() * 90, x = ox + (512 + Math.cos(a) * d * 1.15) * k, y = oy + (250 + Math.sin(a) * d * 0.8) * k; if (i % 3 === 0) { T.star(g, x, y, (5 + r() * 5) * k, (2.5 + r() * 2) * k); g.fillStyle = cols[i % 5]; g.fill(); } else if (i % 3 === 1) T.spark(g, x, y, (5 + r() * 6) * k, cols[i % 5], 0.95); else { g.save(); g.translate(x, y); g.rotate(r() * 6); g.fillStyle = cols[i % 5]; g.fillRect(-6 * k, -2 * k, 12 * k, 4 * k); g.restore(); } } }
  function words(g, T, L, cx, base, size) {
    function o(c) { return { spacing: size * 0.005, dark: L.dark, outline: size * 0.2, depth: size * 0.09, face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.45)' }; }
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var w1 = g.measureText('Wis').width + 2 * size * 0.005, w2 = g.measureText('Deck').width + 3 * size * 0.005; g.restore(); var x0 = cx - (w1 + w2) / 2;
    T.word(g, 'Deck', x0 + w1 + w2 / 2, base, size, o(L.b)); T.gloss(g, 'Deck', x0 + w1 + w2 / 2, base, size, o(L.b), 0.45); T.word(g, 'Wis', x0 + w1 / 2, base, size, o(L.a)); T.gloss(g, 'Wis', x0 + w1 / 2, base, size, o(L.a), 0.45);
  }
  function emblem(g, T, L) { bits(g, T, 1, 0, 0); vine(g, T, L, 1, 0, 0); fan(g, T, L, 512, 322, 1.0); words(g, T, L, 508, 400, 136); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 270, 40, 620, [0, L.sky[0], 0.6, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-212, -40); emblem(g, T, L); return; }
    if (kind === 'wide') { fan(g, T, L, 96, 178, 0.74, 3); words(g, T, L, 480, 140, 128); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.rad(g, 200, 180, 20, 300, [0, '#3a4252', 1, L.sky[2]]); g.fill(); g.clip(); if (px >= 90) { g.translate(200, 206); g.scale(0.66, 0.66); g.translate(-512, -262); emblem(g, T, L); } else fan(g, T, L, 200, 340, 1.45, 3); g.restore(); T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 10; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.a[1], 1, L.b[2]]); g.stroke(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO wisdeck END
