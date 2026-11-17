
/* 🏷️ GameLogos (gl-1) — ONE shared kit for every code-drawn logo. Owner: 🏷️ logo chat.
   GameLogos.pic(id, kind, look, px) → cached canvas (px = CSS width) · .url(…) → data URL
   GameLogos.draw(g, id, kind, x, y, px, look) (x, y = top-left) · .has(id) · .kinds(id) · .box(id, kind) → [w, h]
   GameLogos.looks(id) · .alias(gameId, blockId) (GameIDs like 'snakeast' / 'number-grid' / 'math-quest' / 'soul-bopper' already work) · .ok(id) → true only for logos Aowu has APPROVED (covers / cards show nothing else) · .ready(fn) (fires once the web fonts are in; the cache is cleared then) · .clear() · .add(id, def) (one block per game)
   A logo is painted only when asked for, then cached. Unknown id / kind → null (the page keeps its emoji title). */
var GameLogos = (function () {
  'use strict';
  var REG = {}, CACHE = {};
  // the app's GameIDs → block ids (ask with either; a new block may also call GameLogos.alias)
  var ALIAS = { 'snakeast': 'snakize', 'number-grid': 'numbergrid', 'math-quest': 'mathquest', 'soul-bopper': 'soulbopper', 'steam-playground': 'app' };
  function rid(id) { return REG[id] ? id : (ALIAS[id] || id); }
  function alias(a, id) { ALIAS[a] = id; }
  // ✅ APPROVED by Aowu — the ONLY list that says a logo may be shown on covers / cards (GameLogos.ok). Add an id here when Aowu approves it.
  var OK = { app: 1, snakize: 1, numbergrid: 1, memory: 1, wisdeck: 1, pokadif: 1 };
  function ok(id) { id = rid(id); return !!(REG[id] && OK[id]); }
  function approve(id, yes) { OK[rid(id)] = yes === false ? 0 : 1; }
  // fonts: nothing is kept that was painted with a fallback font — the cache is dropped once the web fonts are in, then ready(fn) callbacks fire
  var FONTS_IN = false, WAIT = [];
  function ready(fn) { if (FONTS_IN) { try { fn(); } catch (e) {} } else WAIT.push(fn); }
  function fontsIn() { if (FONTS_IN) return; FONTS_IN = true; clear(); WAIT.splice(0).forEach(function (fn) { try { fn(); } catch (e) {} }); }
  try { if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { if (document.fonts.load) document.fonts.load("700 20px 'Fredoka'").then(fontsIn, fontsIn); else fontsIn(); }, fontsIn); setTimeout(fontsIn, 4000); } else if (typeof setTimeout !== 'undefined') setTimeout(fontsIn, 0); } catch (e) { FONTS_IN = true; }
  var FONT = "'Fredoka', 'Nunito', system-ui, sans-serif";
  function add(id, def) { REG[id] = def; clear(); }
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
    word: function (g, str, cx, base, size, o) {
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
      each(function (ch, x, dy, j) {
        var f = o.face(j, str.length); g.fillStyle = T.lin(g, 0, dy - size * 0.74, 0, dy + size * 0.04, f);
        if (o.fat) { g.strokeStyle = g.fillStyle; g.lineWidth = o.fat; g.strokeText(ch, x, dy); }   // fatter bubble letters
        g.fillText(ch, x, dy);
      });
      if (o.inner) { g.save(); g.strokeStyle = o.inner; g.lineWidth = Math.max(1, size * 0.025); each(function (ch, x, dy) { g.strokeText(ch, x, dy); }); g.restore(); }
      g.restore(); return W;
    },
    /* gloss band clipped to an already-drawn word: call with the same args */
    gloss: function (g, str, cx, base, size, o, alpha) {
      var c = document.createElement('canvas'); c.width = Math.ceil(size * str.length * 1.2 + 80); c.height = Math.ceil(size * 1.6);
      var h = c.getContext('2d'); h.font = (o.weight || 700) + ' ' + size + 'px ' + FONT; h.textBaseline = 'alphabetic'; h.lineJoin = 'round';
      var sp = o.spacing || 0, W = 0, ws = [], i; for (i = 0; i < str.length; i++) { var w = h.measureText(str[i]).width; ws.push(w); W += w + (i < str.length - 1 ? sp : 0); }
      var sx = o.fit ? Math.min(o.maxSquash || 1.6, o.fit / W) : 1, x = 40, by = size * 1.15;
      h.fillStyle = '#fff'; for (i = 0; i < str.length; i++) { var dy = o.wave ? o.wave(i, str.length) : 0; h.fillText(str[i], x, by + dy); x += ws[i] + sp; }
      h.globalCompositeOperation = 'source-in';
      var gr = h.createLinearGradient(0, by - size * 0.74, 0, by); gr.addColorStop(0, 'rgba(255,255,255,' + (alpha || 0.75) + ')'); gr.addColorStop(0.42, 'rgba(255,255,255,' + (alpha || 0.75) * 0.25 + ')'); gr.addColorStop(0.5, 'rgba(255,255,255,0)');
      h.fillStyle = gr; h.fillRect(0, 0, c.width, c.height);
      g.save(); g.translate(cx, base); if (o.rot) g.rotate(o.rot); g.scale(sx, 1); g.drawImage(c, -W / 2 - 40, -by); g.restore();
    }
  };
  return { add: add, alias: alias, ok: ok, approve: approve, ready: ready, has: has, kinds: kinds, looks: looks, box: box, pic: pic, url: url, draw: draw, clear: clear, tools: T, FONT: FONT };
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

// 🏷️ LOGO brawl-buddies START — 🥊 Brawl Buddies, drawn in code from Aowu's picture (gl-11). People as pictured (Aowu).
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
  function fist(g, L, x, y, R, col, wrap) { g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = col; g.fill(); g.lineWidth = 5; g.strokeStyle = L.ink; g.stroke(); g.lineWidth = 2.5; g.strokeStyle = wrap || 'rgba(60,30,10,.5)'; [-0.4, 0, 0.4].forEach(function (d) { g.beginPath(); g.moveTo(x - R * 0.7, y + d * R); g.lineTo(x + R * 0.7, y + d * R - R * 0.1); g.stroke(); }); }
  function limb(g, L, pts, w, col) { g.beginPath(); g.moveTo(pts[0], pts[1]); g.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); g.lineCap = 'round'; g.lineWidth = w + 8; g.strokeStyle = L.ink; g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
  function boy(g, T, L, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; var SK = '#f2b48a', SK2 = '#d8905e', INK = L.ink;
    // legs (wide stance) + wrapped feet
    limb(g, L, [-20, 96, -50, 120, -58, 160], 26, SK); limb(g, L, [22, 96, 52, 124, 70, 158], 26, SK);
    [[-64, 168, -0.3], [78, 166, 0.3]].forEach(function (f) { g.save(); g.translate(f[0], f[1]); g.rotate(f[2]); g.beginPath(); g.ellipse(0, 0, 22, 13, 0, 0, TAU); g.fillStyle = '#f4efe6'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2; g.beginPath(); g.moveTo(-10, -10); g.lineTo(-4, 11); g.moveTo(2, -12); g.lineTo(8, 11); g.stroke(); g.restore(); });
    // shorts + belt
    g.beginPath(); g.moveTo(-40, 74); g.lineTo(40, 74); g.lineTo(48, 118); g.lineTo(8, 122); g.lineTo(0, 104); g.lineTo(-8, 122); g.lineTo(-48, 118); g.closePath(); g.fillStyle = '#2f7ad8'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    // torso
    g.beginPath(); g.moveTo(-40, 18); g.quadraticCurveTo(0, 6, 40, 18); g.lineTo(36, 78); g.lineTo(-36, 78); g.closePath(); g.fillStyle = T.lin(g, 0, 10, 0, 78, [0, SK, 1, SK2]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.5; g.strokeStyle = 'rgba(120,60,30,.5)'; g.beginPath(); g.moveTo(0, 26); g.lineTo(0, 70); g.moveTo(-16, 50); g.lineTo(16, 50); g.moveTo(-14, 62); g.lineTo(14, 62); g.stroke();
    T.rr(g, -42, 70, 84, 14, 6); g.fillStyle = '#e8322a'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.moveTo(34, 78); g.quadraticCurveTo(60, 84, 66, 100); g.lineWidth = 10; g.strokeStyle = INK; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#e8322a'; g.stroke();
    // arms: left arm punching out to the left, right fist up at the chest
    limb(g, L, [-38, 28, -76, 20, -110, -6], 24, SK); fist(g, L, -122, -14, 27, '#f4efe6', 'rgba(120,110,100,.7)');
    limb(g, L, [38, 30, 62, 44, 52, 16], 22, SK); fist(g, L, 50, 6, 21, '#f4efe6', 'rgba(120,110,100,.7)');
    // head
    g.beginPath(); g.ellipse(-52, -22, 9, 13, 0, 0, TAU); g.ellipse(52, -22, 9, 13, 0, 0, TAU); g.fillStyle = SK2; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.moveTo(-50, -30); g.bezierCurveTo(-52, -76, 52, -76, 50, -30); g.bezierCurveTo(50, 6, 28, 26, 0, 26); g.bezierCurveTo(-28, 26, -50, 6, -50, -30); g.closePath(); g.fillStyle = T.rad(g, -8, -30, 6, 70, [0, '#ffd0a8', 1, SK]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    // spiky hair
    g.beginPath(); g.moveTo(-54, -44); g.lineTo(-66, -86); g.lineTo(-40, -70); g.lineTo(-38, -108); g.lineTo(-12, -78); g.lineTo(2, -116); g.lineTo(18, -78); g.lineTo(42, -104); g.lineTo(40, -68); g.lineTo(66, -78); g.lineTo(54, -44); g.quadraticCurveTo(0, -62, -54, -44); g.closePath(); g.fillStyle = T.lin(g, 0, -116, 0, -44, [0, '#a86a34', 1, '#5e3414']); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    // headband + tails
    g.beginPath(); g.moveTo(48, -50); g.quadraticCurveTo(84, -62, 100, -46); g.quadraticCurveTo(84, -48, 70, -38); g.moveTo(48, -46); g.quadraticCurveTo(80, -34, 92, -18); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); g.lineWidth = 7; g.strokeStyle = '#e8322a'; g.stroke();
    g.beginPath(); g.moveTo(-54, -42); g.quadraticCurveTo(0, -58, 54, -42); g.lineTo(54, -28); g.quadraticCurveTo(0, -44, -54, -28); g.closePath(); g.fillStyle = '#e8322a'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    // face: fierce brows, eyes, big grin
    g.lineWidth = 6; g.strokeStyle = INK; g.beginPath(); g.moveTo(-34, -22); g.lineTo(-10, -14); g.moveTo(34, -22); g.lineTo(10, -14); g.stroke();
    [-1, 1].forEach(function (k) { g.beginPath(); g.ellipse(k * 21, -4, 11, 12, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(k * 21 + 1, -3, 6.5, 0, TAU); g.fillStyle = '#2aa0a8'; g.fill(); g.beginPath(); g.arc(k * 21 + 1, -3, 3, 0, TAU); g.fillStyle = '#0a1a2a'; g.fill(); g.beginPath(); g.arc(k * 21 - 2, -6, 2, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.beginPath(); g.moveTo(-24, 6); g.quadraticCurveTo(0, 12, 26, 2); g.quadraticCurveTo(20, 22, 0, 22); g.quadraticCurveTo(-20, 22, -24, 6); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2; g.beginPath(); g.moveTo(-10, 8); g.lineTo(-9, 21); g.moveTo(0, 9); g.lineTo(0, 22); g.moveTo(10, 8); g.lineTo(9, 21); g.stroke();
    g.restore();
  }
  function panda(g, T, L, x, y, s) {   // the red panda buddy
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; var F = '#e8721c', F2 = '#b84a0e', DK = '#5a2a12', INK = L.ink;
    // striped tail
    g.save(); g.translate(-64, 60); g.rotate(-0.5); g.beginPath(); g.ellipse(0, 0, 26, 58, 0, 0, TAU); g.fillStyle = F; g.fill(); g.save(); g.clip(); g.fillStyle = DK; [-40, -12, 16, 44].forEach(function (yy) { g.fillRect(-30, yy, 60, 12); }); g.restore(); g.beginPath(); g.ellipse(0, 0, 26, 58, 0, 0, TAU); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.restore();
    // legs (running)
    limb(g, L, [-24, 104, -44, 130, -30, 156], 28, DK); limb(g, L, [26, 104, 60, 112, 84, 132], 28, DK);
    g.beginPath(); g.ellipse(-26, 162, 20, 13, 0.2, 0, TAU); g.ellipse(92, 136, 20, 13, -0.4, 0, TAU); g.fillStyle = DK; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    // body + belly
    g.beginPath(); g.ellipse(4, 66, 58, 62, 0, 0, TAU); g.fillStyle = T.lin(g, 0, 10, 0, 128, [0, F, 1, F2]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.ellipse(6, 78, 36, 42, 0, 0, TAU); g.fillStyle = DK; g.fill();
    // arms + gloves: left glove forward at the chest, right arm punching up-right
    limb(g, L, [-40, 40, -66, 54, -52, 76], 26, F); fist(g, L, -44, 82, 25, '#4a4e5e', 'rgba(20,20,30,.6)');
    limb(g, L, [48, 30, 84, 10, 104, -26], 26, F); fist(g, L, 110, -40, 28, '#4a4e5e', 'rgba(20,20,30,.6)'); g.beginPath(); g.arc(110, -40, 12, 0, TAU); g.fillStyle = '#ff8a2a'; g.fill();
    // ears
    [-1, 1].forEach(function (k) { g.beginPath(); g.moveTo(k * 30, -76); g.lineTo(k * 62, -108); g.lineTo(k * 62, -56); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.moveTo(k * 40, -76); g.lineTo(k * 56, -94); g.lineTo(k * 56, -66); g.closePath(); g.fillStyle = DK; g.fill(); });
    // head
    g.beginPath(); g.ellipse(4, -40, 62, 52, 0, 0, TAU); g.fillStyle = T.rad(g, -6, -56, 6, 80, [0, '#ff8a2a', 1, F]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.save(); g.beginPath(); g.ellipse(4, -40, 60, 50, 0, 0, TAU); g.clip(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(4, -18, 34, 26, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(-50, -30, 18, 24, 0.3, 0, TAU); g.ellipse(58, -30, 18, 24, -0.3, 0, TAU); g.fill(); g.fillStyle = DK; g.beginPath(); g.ellipse(-22, -44, 14, 18, 0.5, 0, TAU); g.ellipse(30, -44, 14, 18, -0.5, 0, TAU); g.fill(); g.restore();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-22, -66, 9, 5, 0.4, 0, TAU); g.ellipse(30, -66, 9, 5, -0.4, 0, TAU); g.fill();
    [-1, 1].forEach(function (k) { var ex = k < 0 ? -20 : 28; g.beginPath(); g.arc(ex, -44, 10, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(ex + 1, -43, 6.5, 0, TAU); g.fillStyle = '#7a3a12'; g.fill(); g.beginPath(); g.arc(ex + 1, -43, 3.2, 0, TAU); g.fillStyle = '#1a0a04'; g.fill(); g.beginPath(); g.arc(ex - 2, -46, 2, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.beginPath(); g.ellipse(4, -26, 9, 6, 0, 0, TAU); g.fillStyle = '#2a1408'; g.fill();
    g.beginPath(); g.moveTo(-18, -14); g.quadraticCurveTo(4, -6, 26, -14); g.quadraticCurveTo(20, 14, 4, 14); g.quadraticCurveTo(-12, 14, -18, -14); g.closePath(); g.fillStyle = '#7a1420'; g.fill(); g.save(); g.clip(); g.fillStyle = '#ff7a8a'; g.beginPath(); g.ellipse(4, 12, 12, 8, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(-8, -14, 8, 6); g.fillRect(8, -14, 8, 6); g.restore(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    g.restore();
  }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    function o(c, sz, glow, white) { return { spacing: sz * 0.015, dark: L.dark, outline: sz * 0.2, depth: sz * 0.1, fat: sz * 0.02, glow: glow, glowN: 2, glowBlur: 0.36, face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: white }; }
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
    frame(g, T, L, 268, 36, 488, 500, function () { world(g, T, L, 268, 36, 488, 500); boy(g, T, L, 410, 368, 0.86); panda(g, T, L, 632, 376, 0.84); });
    words(g, T, L, 512, 126, 218, 1.18);
    [[300, 60, 10], [730, 70, 12], [770, 400, 9], [250, 440, 8]].forEach(function (s) { T.star(g, s[0], s[1], s[2], s[2] * 0.5); g.fillStyle = '#ffe14a'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#8a4a04'; g.lineJoin = 'round'; g.stroke(); });
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.bg[0], 1, L.bg[1]]); g.fillRect(0, 0, 1024, 572); var r = T.rng(7); for (var i = 0; i < 40; i++) { g.globalAlpha = 0.5 + r() * 0.5; g.fillStyle = ['#ff8a2a', '#5ff0ff', '#ff5ad8', '#ffe14a'][i % 4]; g.beginPath(); g.arc(r() * 1024, r() * 572, 2 + r() * 5, 0, TAU); g.fill(); } g.globalAlpha = 1; emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-132, -4); emblem(g, T, L); return; }
    if (kind === 'wide') { g.save(); g.translate(22, 28); g.scale(0.3, 0.3); frame(g, T, L, 0, 0, 480, 480, function () { world(g, T, L, 0, 0, 480, 480); boy(g, T, L, 150, 300, 1.05); panda(g, T, L, 350, 310, 1.0); }); g.restore(); words(g, T, L, 526, 134, 0, 0.82, true); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.74, 0.74); g.translate(-512, -286); frame(g, T, L, 268, 36, 488, 500, function () { world(g, T, L, 268, 36, 488, 500); if (px >= 90) { boy(g, T, L, 410, 368, 0.86); panda(g, T, L, 632, 376, 0.84); } else { boy(g, T, L, 420, 330, 1.5); panda(g, T, L, 650, 340, 1.4); } }); if (px >= 90) words(g, T, L, 512, 126, 218, 1.18); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO brawl-buddies END

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
    function o(c, sz, ring) { return { spacing: -sz * 0.012, dark: L.dark, outline: sz * 0.17, depth: sz * 0.07, fat: sz * 0.022, inner: 'rgba(255,255,255,.35)', glow: ring === L.bRing ? 'rgba(255,190,60,1)' : 'rgba(110,235,255,1)', glowN: 3, glowBlur: 0.42, face: function () { return [0, c[0], 0.32, c[1], 0.7, c[2], 1, c[3]]; } }; }
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
