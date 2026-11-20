
/* 🌍 IsoLook_snow — ❄️ snow → Alps / Nordic — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['snow'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/snow.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_snow: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — ❄️ snow → Alps / Nordic (ip-4a split from the ip-3 files 22–27; each part below is the old file's own IIFE).
   Built into IsoLook_snow.html by build_isoprops.py; runs after the engine with Props._K (kit insides). */
/* 🗾🏜️❄️ IsoProps — region sets (ip-3, 🌳 IsoProps chat, 2026-11-17): cherry · desert · snow. Same 14 rules as the starter catalogue:
   corners = iso parts on the grid · tile light · ONE rim from the bake (painters draw none) · organic = billboards on a 2 : 1 shadow · no emoji ·
   variants by seed · front = +y, turn rebuilds · 🍂 conditions through the core fallback (or a prop's own conds). Each prop's home look = its set
   (def.look) so a catalogue card shows it dressed right; any map can still place it with its own look. */
(function(){   // 🗾🏜️❄️ region sets
'use strict';
const D = PD, M = MAT, TAU = Math.PI * 2;
const piece = (g, parts) => D.piece(g, parts, '#000', 0);
const S = (set, o) => addSet(set, o);
S('snow', {name: 'Snow', icon: '❄️', accent: '#5EC3EA'});
const own = (set, look) => (key, o) => add(set, key, Object.assign({look}, o));
const org = (set, look) => (key, o, fn) => organic(set, key, Object.assign({look}, o), fn);

/* ---------- shared bits for this file ---------- */
// a dome sitting on z (round things = 2 : 1 ellipses): light from the upper left like the tiles
function dome(g, P, k, cx, cy, z, r, h, col){ const c = P(cx, cy, z), rx = r * HTW * k * Math.SQRT2, ry = rx / 2, hh = h * k, C = lit(col);
  g.beginPath(); g.moveTo(c[0] + rx, c[1]); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI, false); g.ellipse(c[0], c[1], rx, hh, 0, Math.PI, TAU, false); g.closePath();
  g.fillStyle = D.rad(g, c[0] - rx * 0.35, c[1] - hh * 0.62, 1, rx * 1.5, [[0, C.top], [0.45, C.L], [1, C.R]]); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = k; g.stroke(); return {c, rx, ry, hh}; }
// water inside a footprint: a ring of model points (looks round on the grid), rim colour around it
function pool(g, P, k, cx, cy, rr, rim, water, cond){ if(cond){ water = cond.holes ? ['#6E6458', '#4E463C'] : ['#8FA88A', '#6E8A6A']; if(cond.holes) rr *= 0.9; } const pts = []; for(let i = 0; i < 28; i++){ const a = i / 28 * TAU, w = 1 + 0.06 * Math.sin(a * 3); pts.push(P(cx + Math.cos(a) * rr * w, cy + Math.sin(a) * rr * w, 1)); }
  const path = (s) => { g.beginPath(); pts.forEach((q, i) => { i ? g.lineTo(q[0], q[1] + s) : g.moveTo(q[0], q[1] + s); }); g.closePath(); };
  path(0); g.fillStyle = rim; g.fill(); g.save(); g.translate(0, 2 * k); const sc = 0.86, m = pts.reduce((a, q) => [a[0] + q[0] / pts.length, a[1] + q[1] / pts.length], [0, 0]);
  g.beginPath(); pts.forEach((q, i) => { const x = m[0] + (q[0] - m[0]) * sc, y = m[1] + (q[1] - m[1]) * sc - 2 * k; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
  g.fillStyle = D.lin(g, 0, m[1] - 20 * k, 0, m[1] + 20 * k, [water[0], water[1]]); g.fill(); g.restore();
  if(cond){ g.strokeStyle = 'rgba(60,40,24,0.55)'; g.lineWidth = 1 * k; const R = D.rnd(3); for(let i = 0; i < 9; i++){ const a = R() * TAU, r0 = 4 * k + R() * 6 * k; g.beginPath(); g.moveTo(m[0] + Math.cos(a) * r0, m[1] + Math.sin(a) * r0 * 0.5); g.lineTo(m[0] + Math.cos(a + 0.2) * (r0 + 8 * k), m[1] + Math.sin(a + 0.2) * (r0 + 8 * k) * 0.5); g.stroke(); } return m; }
  g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.2 * k; g.beginPath(); g.ellipse(m[0] - 6 * k, m[1] - 2 * k, 7 * k, 2 * k, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return m; }
function reeds(g, x, y, k, n, seed, col){ const R = D.rnd(seed); for(let i = 0; i < n; i++){ const bx = x + (R() - 0.5) * 14 * k, L = (14 + R() * 10) * k; g.strokeStyle = col || '#5DA83E'; g.lineWidth = 1.6 * k; g.lineCap = 'round';
  g.beginPath(); g.moveTo(bx, y); g.quadraticCurveTo(bx + (R() - 0.5) * 5 * k, y - L * 0.6, bx + (R() - 0.5) * 6 * k, y - L); g.stroke(); if(R() < 0.5){ g.fillStyle = '#8A5A2B'; g.beginPath(); D.ell(g, bx + (R() - 0.5) * 4 * k, y - L * 0.8, 1.6 * k, 3.4 * k); g.fill(); } } }
const vis = (T, nx, ny) => sideOf(T.nrm(nx, ny));
const line = (g, a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };

/* ================= ❄️ SNOW (the snow look caps every silhouette with snow — pines, cabins, rocks alike) ================= */
const NA = own('snow', 'snow'), NO = org('snow', 'snow');
function pine(g, x, y, k, t, v, dry){ const c = dry ? ['#C08A4A', '#8A5A2A', '#D9AA6A'] : [['#2F7A4A', '#1F5A36', '#4C9A62'], ['#3A8A4E', '#25683A', '#5AAE6A'], ['#2A6E5A', '#1A4E40', '#46947A']][v % 3], w = [1, 0.88, 1.1][v % 3];
  g.save(); g.translate(x, y); g.scale(k, k); piece(g, [{path: g => { g.rect(-3.5, -14, 7, 14); }, fill: '#6A4630'}]);
  [[-12, 26, 22], [-30, 21, 20], [-46, 16, 18], [-60, 10, 18]].forEach(([yy, ww, hh]) => piece(g, [{path: g => { g.moveTo(0, yy - hh); g.quadraticCurveTo(ww * w * 0.3, yy - hh * 0.4, ww * w, yy); g.quadraticCurveTo(0, yy + 4, -ww * w, yy); g.quadraticCurveTo(-ww * w * 0.3, yy - hh * 0.4, 0, yy - hh); }, fill: g => D.lin(g, -ww, 0, ww, 0, [c[2], c[0], c[1]])}]));
  g.restore(); }
(function(){ const def = NO('pine', {name: 'Pine', h: 80, variants: 3, tags: ['tree', 'evergreen']}, (g, x, y, k, t, v) => pine(g, x, y, k, t, v, false));
  def.conds = {dry: (g, x, y, k, t, v) => pine(g, x, y, k, t, v, true)}; })();   /* dry pine = rust needles (an evergreen doesn't go bare); ruined → the shared snapped tree */
(function(){ const def = NO('baretree', {name: 'Bare tree', h: 64, variants: 2, tags: ['tree', 'winter']}, (g, x, y, k, t, v) => bareTree(g, x, y, k, 64, v + 3, {leaves: 0, broken: 0})); })();
NO('icecrystal', {name: 'Ice crystal', h: 44, kind: 'thing', variants: 2, dead: 'keep', tags: ['ice', 'magic']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k);
  const shards = [[-9, 0, 26, -0.25, 6], [8, 0, 22, 0.3, 5.5], [0, 2, 38, 0.02, 7.5], [-15, 2, 14, -0.5, 4.5], [15, 2, 13, 0.55, 4]].slice(0, v % 2 ? 5 : 4);
  shards.forEach(([sx, sy, L, a, w]) => { g.save(); g.translate(sx, sy); g.rotate(a); piece(g, [{path: g => { g.moveTo(-w, 0); g.lineTo(-w, -L * 0.78); g.lineTo(0, -L); g.lineTo(w, -L * 0.78); g.lineTo(w, 0); g.closePath(); }, fill: g => D.lin(g, -w, 0, w, 0, ['#E8FBFF', '#9FE3F5', '#5EC3EA'])}]);
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.moveTo(-w * 0.6, -2); g.lineTo(-w * 0.6, -L * 0.74); g.lineTo(-w * 0.1, -L * 0.85); g.lineTo(-w * 0.1, -2); g.closePath(); g.fill(); g.restore(); });
  g.restore(); });
// 🪵 log cabin: corner posts, log lines, stone chimney, steep roof (the snow look caps it)
(function(){ const def = NA('cabin', {name: 'Log cabin', foot: [2, 2], h: 88, variants: 4, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const wall = L.walls[v % L.walls.length], roof = L.roofs[v % L.roofs.length];
    B.box(0.1, 0.1, 0, 1.8, 1.8, 5, M.stone);
    const b = B.box(0.16, 0.16, 5, 1.68, 1.68, 40, wall, {trim: 5});
    [[0.1, 1.74], [1.74, 1.74], [1.74, 0.1]].forEach(p => B.box(p[0], p[1], 5, 0.16, 0.16, 40, sh(wall, -0.12), {layer: 1}));
    B.door(b, 'front', 0.8, 0.4, 30, {fill: L.trim}); B.win(b, 'front', 0.32, 0.3, 16, 13, {fill: '#FFD35A'}); B.win(b, 'right', 0.6, 0.34, 16, 13, {fill: '#FFD35A'});
    B.box(1.35, 0.3, 30, 0.34, 0.34, 54, M.stone, {layer: 1, dz: -3});
    B.roof(0.16, 0.16, 45, 1.68, 1.68, 36, roof, {ov: 0.24, stripes: 6, ridge: v % 2 ? 'y' : 'x'});
    if(v >= 2) B.custom(2, 1, (g, P, k, t, T) => { if(!vis(T, 1, 0)) return; for(let i = 0; i < 6; i++){ const p = P(1.96, 0.4 + (i % 3) * 0.12, 6 + Math.floor(i / 3) * 6); g.fillStyle = '#C99257'; g.beginPath(); D.ell(g, p[0], p[1], 3.4 * k, 3 * k); g.fill(); g.fillStyle = '#E8C08A'; g.beginPath(); D.ell(g, p[0] - 0.6 * k, p[1], 1.6 * k, 1.5 * k); g.fill(); } }, {layer: 2});
  }; })();
// 🔺 A-frame: the roof IS the walls, glass front with a door
(function(){ const def = NA('aframe', {name: 'A-frame house', foot: [2, 2], h: 104, variants: 3, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const roof = L.roofs[v % L.roofs.length];
    B.box(0.12, 0.12, 0, 1.76, 1.76, 8, '#8A5A3A');
    B.roof(0.15, 0.15, 8, 1.7, 1.7, 86, roof, {ridge: 'y', ov: 0.12, gable: '#A0703E', stripes: 6});
    B.custom(1, 2, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; const y = 1.98, q = (x, z) => P(x, y, z);
      g.fillStyle = '#9FD8F0'; g.beginPath(); [q(0.32, 12), q(1.68, 12), q(1, 74)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
      g.strokeStyle = '#5A3418'; g.lineWidth = 1.6 * k; [[0.66, 12, 0.66, 50], [1.34, 12, 1.34, 50], [0.5, 32, 1.5, 32], [0.75, 52, 1.25, 52]].forEach(l => line(g, q(l[0], l[1]), q(l[2], l[3])));
      g.fillStyle = '#5A3418'; g.beginPath(); [q(0.84, 9), q(1.16, 9), q(1.16, 34), q(0.84, 34)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); }, {layer: 3});
  }; })();
// ⛄ igloo: ice-block dome, a tunnel at the front
(function(){ const def = NA('igloo', {name: 'Igloo', foot: [2, 2], h: 56, variants: 2, door: [1, 2], tags: ['home', 'ice']});
  def.build = (B, v) => { const ice = ['#E8F6FF', '#DDEEFF'][v % 2];
    B.custom(1, 1, (g, P, k, t, T) => { const tun = P(1, 1.72, 0), cen = P(1, 0.92, 0), front = tun[1] > cen[1];
      const tunnel = () => { const n = T.nrm(0, 1), s = sideOf(n) === 'R' ? -1 : 1, a = P(1, 1.98, 0), w = 12 * k, h = 20 * k; g.save(); g.translate(a[0], a[1]); g.transform(1, s * -0.5 * 0.0, 0, 1, 0, 0);
        g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w, -h * 0.5); g.arc(0, -h * 0.5, w, Math.PI, 0); g.lineTo(w, 0); g.closePath(); g.fillStyle = D.lin(g, -w, 0, w, 0, ['#FFFFFF', '#C8E2F2']); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = k; g.stroke();
        if(front){ g.beginPath(); g.moveTo(-w * 0.55, 0); g.lineTo(-w * 0.55, -h * 0.42); g.arc(0, -h * 0.42, w * 0.55, Math.PI, 0); g.lineTo(w * 0.55, 0); g.closePath(); g.fillStyle = '#2E4A66'; g.fill(); } g.restore(); };
      if(!front) tunnel();
      const d = dome(g, P, k, 1, 0.92, 0, 0.82, 46, ice);
      g.save(); g.beginPath(); g.moveTo(d.c[0] + d.rx, d.c[1]); g.ellipse(d.c[0], d.c[1], d.rx, d.ry, 0, 0, Math.PI, false); g.ellipse(d.c[0], d.c[1], d.rx, d.hh, 0, Math.PI, TAU, false); g.closePath(); g.clip();
      g.strokeStyle = 'rgba(90,140,180,0.35)'; g.lineWidth = 1.1 * k; for(let i = 1; i < 4; i++){ const f = i / 4; g.beginPath(); g.ellipse(d.c[0], d.c[1] - d.hh * f, d.rx * Math.sqrt(1 - f * f), d.ry * Math.sqrt(1 - f * f), 0, 0, Math.PI); g.stroke();
        for(let j = -3; j <= 3; j++){ const xx = d.c[0] + j * d.rx * 0.28 + (i % 2) * d.rx * 0.14; line(g, [xx, d.c[1] - d.hh * (f - 0.25) + d.ry * 0.6], [xx, d.c[1] - d.hh * f + d.ry * 0.6]); } }
      g.restore(); if(front) tunnel(); });
  }; })();
NO('snowman', {name: 'Snowman', h: 44, kind: 'thing', variants: 3, dead: 'keep', tags: ['winter', 'fun']}, (g, x, y, k, t, v) => { const scarf = ['#E2553A', '#3A8DFF', '#4CB13A'][v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
  g.strokeStyle = '#6A4630'; g.lineWidth = 1.6; g.lineCap = 'round'; line(g, [-8, -22], [-19, -30]); line(g, [8, -22], [19, -31]); line(g, [-16, -28], [-19, -24]);
  piece(g, [{path: g => { D.ell(g, 0, -9, 12, 10); D.ell(g, 0, -24, 9, 8); D.ell(g, 0, -36, 7, 6.5); }, fill: g => D.rad(g, -4, -38, 2, 30, ['#FFFFFF', '#E6F2FA', '#C2D8E8'])}]);
  g.fillStyle = scarf; g.beginPath(); D.rr(g, -8, -31, 16, 4, 2); g.fill(); g.fillRect(3, -30, 4, 9);
  g.fillStyle = '#2A1C14'; [[-2.6, -38], [2.6, -38], [0, -23], [0, -18], [0, -13]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 1.2, 1.2); g.fill(); });
  g.fillStyle = '#FF8A2A'; g.beginPath(); g.moveTo(0, -36.5); g.lineTo(8, -35); g.lineTo(0, -34); g.closePath(); g.fill();
  g.fillStyle = '#2A2A2A'; g.fillRect(-6, -43, 12, 2); g.fillRect(-4, -50, 8, 7); g.restore(); });
(function(){ const def = NA('sled', {name: 'Sled', foot: [1, 1], h: 16, kind: 'deco', block: false, tags: ['winter', 'fun']});
  def.build = (B) => { B.box(0.2, 0.32, 5, 0.6, 0.36, 3, '#C99257'); [0.36, 0.64].forEach(y => B.custom(0.5, y, (g, P, k) => { const a = P(0.18, y, 2), b = P(0.82, y, 2), c = P(0.94, y, 9); g.strokeStyle = '#D8322A'; g.lineWidth = 2.2 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.quadraticCurveTo(c[0] + 2 * k, b[1], c[0], c[1]); g.stroke(); line(g, P(0.3, y, 2), P(0.3, y, 5)); line(g, P(0.7, y, 2), P(0.7, y, 5)); }, {layer: y > 0.5 ? 1 : -1})); }; })();
(function(){ const def = NA('firepit', {name: 'Campfire', foot: [1, 1], h: 24, kind: 'deco', tags: ['fire', 'camp', 'light']});
  def.build = (B) => { for(let i = 0; i < 8; i++){ const a = i / 8 * TAU; B.drum(0.5 + Math.cos(a) * 0.3, 0.5 + Math.sin(a) * 0.3, 0, 0.07, 4, '#9C9480'); }
    B.bill(0.5, 0.5, 2, (g, x, y, k, t) => { g.strokeStyle = '#8A5A2B'; g.lineWidth = 3.4 * k; g.lineCap = 'round'; line(g, [x - 8 * k, y + 1 * k], [x + 7 * k, y - 3 * k]); line(g, [x - 7 * k, y - 3 * k], [x + 8 * k, y + 1 * k]);
      const f = 1 + Math.sin(t * 9) * 0.12; g.fillStyle = '#FF8A2A'; g.beginPath(); g.moveTo(x - 7 * k, y - 1 * k); g.quadraticCurveTo(x - 6 * k, y - 12 * k * f, x, y - 20 * k * f); g.quadraticCurveTo(x + 6 * k, y - 12 * k * f, x + 7 * k, y - 1 * k); g.closePath(); g.fill();
      g.fillStyle = '#FFD23F'; g.beginPath(); g.moveTo(x - 3.5 * k, y - 1 * k); g.quadraticCurveTo(x - 3 * k, y - 7 * k * f, x, y - 12 * k * f); g.quadraticCurveTo(x + 3 * k, y - 7 * k * f, x + 3.5 * k, y - 1 * k); g.closePath(); g.fill(); });
  }; def.live = {period: 2 * Math.PI / 9, frames: 6}; })();
(function(){ const def = (K.lamp || (d => d))(NA('aurorapost', {name: 'Glow lantern', foot: [1, 1], h: 50, kind: 'post', block: false, tags: ['light', 'night', 'ice']}));   // 💡 ip-6a lit · out (out = a dull crystal)
  def.build = (B, v, L) => { const out = L && L.state === 'out'; B.box(0.42, 0.42, 0, 0.16, 0.16, 46, '#6A4630'); B.box(0.42, 0.42, 42, 0.16, 0.42, 4, '#6A4630', {layer: 1});
    B.custom(0.5, 0.8, (g, P, k) => { const a = P(0.5, 0.78, 42), b = [a[0], a[1] + 7 * k]; g.strokeStyle = '#2A1C14'; g.lineWidth = 1 * k; line(g, a, b);
      g.fillStyle = out ? '#5C7A78' : '#7CF5D0'; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[0] + 5 * k, b[1] + 7 * k); g.lineTo(b[0], b[1] + 15 * k); g.lineTo(b[0] - 5 * k, b[1] + 7 * k); g.closePath(); g.fill();
      g.fillStyle = out ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)'; g.beginPath(); g.moveTo(b[0], b[1] + 2 * k); g.lineTo(b[0] - 2.4 * k, b[1] + 7 * k); g.lineTo(b[0], b[1] + 11 * k); g.closePath(); g.fill(); }, {layer: 2}); }; })();

/* ---------- 🗺️ the region looks: their own trees (swap) + their own town (roles) ---------- */
Object.assign(LOOKS.snow, {swap: {palm: 'pine', jtree: 'pine', mango: 'pine', bamboo: 'baretree', banana: 'bush', flowers: 'rock'},
  roles: {home: ['cabin', 'aframe', 'cabin', 'igloo'], light: 'aurorapost', tall: ['pine', 'pine', 'baretree', 'pine'], small: ['bush', 'rock', 'snowman', 'log', 'rock']}});
})();

/* 🌍 IsoProps — every look its own country (ip-3c, 🌳 IsoProps chat, 2026-11-17 — Aowu: "every location needs its own unique design, like a different country")
   Each look gets its OWN inn + blacksmith shapes (not just a re-skin). SAME footprint + door as the village 'inn' (3 × 2, door [1, 2]) and 'smithy' (2 × 2,
   door [0.86, 2]), handed out through the look's swap {inn, smithy} → a town keeps its layout (same seed = same plan, rule T6) and only the buildings change.
     🌴 jungle → Thailand (teak stilt sala, tiered roof with chofa horns · bamboo forge with piston bellows)
     🌸 cherry → Japan (ryokan with noren + paper lanterns · katana forge with the shimenawa rope)
     🏜️ desert → Morocco / Arabia (caravanserai with a horseshoe arch + dome tower · domed forge with a wind tower)
     ❄️ snow  → Alps / Nordic (chalet lodge with a carved balcony · turf-roof log forge with a round stone chimney)
     🌾 farm  → American countryside (country inn with a wrap porch · red board-and-batten horseshoe forge)
   Same 14 rules: corners on the grid, tile light, one rim at bake, no emoji, turn rebuilds, doors ≈ 42 px, conditions via the shared fallback. */
(function(){   // 🌍 country inns + smithies
'use strict';
const D = PD, M = MAT, TAU = Math.PI * 2;
const vis = (T, nx, ny) => sideOf(T.nrm(nx, ny));
const line = (g, a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
const polyP = (g, pts) => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
function dome(g, P, k, cx, cy, z, r, h, col){ const c = P(cx, cy, z), rx = r * HTW * k * Math.SQRT2, ry = rx / 2, hh = h * k, C = lit(col);
  g.beginPath(); g.moveTo(c[0] + rx, c[1]); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI, false); g.ellipse(c[0], c[1], rx, hh, 0, Math.PI, TAU, false); g.closePath();
  g.fillStyle = D.rad(g, c[0] - rx * 0.35, c[1] - hh * 0.62, 1, rx * 1.5, [[0, C.top], [0.45, C.L], [1, C.R]]); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = k; g.stroke(); return {c, rx, ry, hh}; }
// 🪧 the INN board, a shape per country: rect · arch · shield · oval · plaque — hangs at a model point (front), words drawn (rule 7)
function innSign(B, x, y, z, o){ o = o || {}; B.custom(x, y, (g, P, k) => { const c = P(x, y, z), w = (o.w || 34) * k, h = (o.h || 16) * k, top = c[1] - 6 * k;
  g.strokeStyle = o.rope || '#5A3418'; g.lineWidth = 1.3 * k; if(o.bracket){ const b0 = P(x, y - 0.25, z + 8); g.lineWidth = 1.8 * k; line(g, b0, [c[0], c[1] - 9 * k]); g.lineWidth = 1 * k; }
  line(g, [c[0] - w * 0.36, c[1] - 9 * k], [c[0] - w * 0.36, top]); line(g, [c[0] + w * 0.36, c[1] - 9 * k], [c[0] + w * 0.36, top]); if(!o.bracket) line(g, [c[0] - w * 0.36, c[1] - 9 * k], [c[0] + w * 0.36, c[1] - 9 * k]);
  const x0 = c[0] - w / 2, y0 = top; g.fillStyle = o.fill || '#FFF6E4'; g.beginPath();
  if(o.shape === 'arch'){ g.moveTo(x0, y0 + h); g.lineTo(x0, y0 + h * 0.35); g.quadraticCurveTo(x0, y0 - h * 0.2, c[0], y0 - h * 0.35); g.quadraticCurveTo(x0 + w, y0 - h * 0.2, x0 + w, y0 + h * 0.35); g.lineTo(x0 + w, y0 + h); g.closePath(); }
  else if(o.shape === 'shield'){ g.moveTo(x0, y0); g.lineTo(x0 + w, y0); g.lineTo(x0 + w, y0 + h * 0.6); g.quadraticCurveTo(x0 + w, y0 + h, c[0], y0 + h * 1.3); g.quadraticCurveTo(x0, y0 + h, x0, y0 + h * 0.6); g.closePath(); }
  else if(o.shape === 'oval') D.ell(g, c[0], y0 + h / 2, w / 2, h / 2 + 1 * k);
  else D.rr(g, x0, y0, w, h, (o.r == null ? 4 : o.r) * k);
  g.fill(); if(o.edge){ g.strokeStyle = o.edge; g.lineWidth = 1.4 * k; g.stroke(); }
  D.txt(g, 'INN', c[0], y0 + h * 0.5 + 3.8 * k, {size: (o.size || 10.5) * k, align: 'center', col: o.ink || '#2A1C14', w: 700}); }, {layer: o.layer == null ? 3 : o.layer}); }
function smoke(B, x, y, z, o){ o = o || {}; B.custom(x, y, (g, P, k, t) => { const c = P(x, y, z), ph = ((t || 0) / (o.period || 1.2)) % 1; g.fillStyle = o.col || 'rgba(220,220,228,0.75)';
  for(let i = 0; i < 3; i++){ const f = (i + ph) / 3; g.beginPath(); D.ell(g, c[0] + (Math.sin(f * 5) * 3 + f * 6) * k, c[1] - f * 30 * k, (3 + f * 5) * k, (2.4 + f * 3) * k); g.fill(); } }, {layer: 6}); }
function glowAt(B, x, y, z, r, col, layer){ B.custom(x, y, (g, P, k) => { const c = P(x, y, z); D.glow(g, c[0], c[1], r * k, col || '#FF7A2E', 0.75); }, {layer: layer == null ? 3 : layer}); }
function anvil(B, x, y, base){ base = base || 0; B.box(x, y, base, 0.3, 0.2, 8, M.wood, {layer: 1}); B.box(x - 0.04, y - 0.02, base + 8, 0.38, 0.24, 5, M.iron, {layer: 1}); }
function lanternHang(B, x, y, z, col, o){ o = o || {}; B.custom(x, y, (g, P, k) => { const c = P(x, y, z); g.strokeStyle = '#2A1C14'; g.lineWidth = k; line(g, [c[0], c[1] - 8 * k], [c[0], c[1] - 4 * k]);
  if(o.star){ g.fillStyle = '#E8B83A'; g.beginPath(); D.star(g, c[0], c[1], 4.4 * k, 2.4 * k, 8); g.fill(); D.glow(g, c[0], c[1], 9 * k, '#FFD23F', 0.4); return; }
  g.fillStyle = col || '#E2453A'; g.beginPath(); D.ell(g, c[0], c[1], 3.6 * k, 4.6 * k); g.fill(); g.fillStyle = '#2A1C14'; g.fillRect(c[0] - 2 * k, c[1] - 5.4 * k, 4 * k, 1.4 * k); g.fillRect(c[0] - 2 * k, c[1] + 4.2 * k, 4 * k, 1.2 * k);
  g.strokeStyle = 'rgba(255,240,200,0.5)'; g.lineWidth = 0.7 * k; line(g, [c[0] - 3.4 * k, c[1]], [c[0] + 3.4 * k, c[1]]); D.glow(g, c[0], c[1], 9 * k, '#FFC86A', 0.35); }, {layer: o.layer || 4}); }
const IN = (look, key, name, o) => add(look === 'jungle' ? 'village' : (look === 'farm' ? 'farm' : look), key, Object.assign({name, look, foot: [3, 2], door: [1, 2], tags: ['house', 'big', 'rest', 'inn']}, o));
const SM = (look, key, name, o) => add(look === 'jungle' ? 'village' : (look === 'farm' ? 'farm' : look), key, Object.assign({name, look, foot: [2, 2], door: [0.86, 2], tags: ['shop', 'forge', 'smithy']}, o));

/* ===================== ❄️ ALPS / NORDIC — chalet lodge · turf-roof log forge ===================== */
(function(){ const def = IN('snow', 'inn_chalet', 'Chalet lodge', {h: 124, variants: 2, live: {period: 1.2, frames: 6}});
  const shutter = (g, Q, k) => { g.fillStyle = '#3E7A4A'; [[0, 0.24], [0.76, 1]].forEach(([a, c]) => { const p = [Q(a, 0), Q(c, 0), Q(c, 14), Q(a, 14)]; polyP(g, p); g.fill(); }); g.fillStyle = '#9FD3F0'; polyP(g, [Q(0.28, 1), Q(0.72, 1), Q(0.72, 13), Q(0.28, 13)]); g.fill(); g.strokeStyle = '#FFF6E4'; g.lineWidth = 0.8 * k; line(g, Q(0.5, 1), Q(0.5, 13)); };
  def.build = (B, v) => { const wood = ['#B07A4A', '#9C6E46'][v % 2], roof = ['#5A4A44', '#7A4A3A'][v % 2];
    const s = B.box(0.12, 0.12, 0, 2.76, 1.6, 26, M.stone, {trim: 9}); B.door(s, 'front', 1.18, 0.46, 24, {fill: '#5A3418'}); B.win(s, 'front', 0.35, 0.36, 9, 11); B.win(s, 'front', 2.05, 0.36, 9, 11); B.win(s, 'right', 0.6, 0.36, 9, 11);
    const u = B.box(0.12, 0.12, 26, 2.76, 1.6, 28, wood, {trim: 6}); B.decal(u, 'front', 0.3, 0.5, 8, 14, '#FFFFFF', {paint: shutter}); B.decal(u, 'front', 1.15, 0.5, 8, 14, '#FFFFFF', {paint: shutter}); B.decal(u, 'front', 2.0, 0.5, 8, 14, '#FFFFFF', {paint: shutter}); B.decal(u, 'right', 0.55, 0.5, 8, 14, '#FFFFFF', {paint: shutter});
    B.box(0.08, 1.72, 28, 2.84, 0.24, 2, M.plank, {layer: 1});
    B.custom(1.5, 1.95, (g, P, k) => { const y = 1.95; g.fillStyle = '#C98A4A'; polyP(g, [P(0.1, y, 30), P(2.9, y, 30), P(2.9, y, 39), P(0.1, y, 39)]); g.fill();
      g.strokeStyle = '#7A4A26'; g.lineWidth = 1.2 * k; line(g, P(0.1, y, 39), P(2.9, y, 39)); line(g, P(0.1, y, 30), P(2.9, y, 30)); g.fillStyle = '#5A3418';
      for(let x = 0.25; x < 2.85; x += 0.24){ const c = P(x, y, 34.5); g.beginPath(); g.moveTo(c[0], c[1] + 2 * k); g.bezierCurveTo(c[0] - 3 * k, c[1] - 1 * k, c[0] - 1.2 * k, c[1] - 3 * k, c[0], c[1] - 1.4 * k); g.bezierCurveTo(c[0] + 1.2 * k, c[1] - 3 * k, c[0] + 3 * k, c[1] - 1 * k, c[0], c[1] + 2 * k); g.fill(); } }, {layer: 2});   // carved balcony with hearts
    B.roof(0.12, 0.12, 54, 2.76, 1.6, 44, roof, {ov: 0.26, ridge: 'y', gable: wood});
    B.custom(1.5, 1.72, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; const c = P(1.5, 1.72, 70); g.fillStyle = '#5A3418'; g.beginPath(); D.ell(g, c[0], c[1], 5 * k, 5 * k); g.fill(); g.fillStyle = '#FFE58A'; g.beginPath(); D.ell(g, c[0], c[1], 3.6 * k, 3.6 * k); g.fill(); }, {layer: 2});
    B.box(2.2, 0.36, 66, 0.3, 0.3, 40, M.stone, {layer: 1, trim: 8}); smoke(B, 2.35, 0.51, 108, {period: 1.2});
    B.custom(0.4, 1.9, (g, P, k) => { for(let r = 0; r < 3; r++) for(let i = 0; i < 4 - r; i++){ const c = P(0.22 + i * 0.13 + r * 0.065, 1.9, 3 + r * 5); g.fillStyle = '#A27A4E'; g.beginPath(); D.ell(g, c[0], c[1], 3 * k, 3 * k); g.fill(); g.fillStyle = '#E2C08A'; g.beginPath(); D.ell(g, c[0], c[1], 1.8 * k, 1.8 * k); g.fill(); } }, {layer: 2});   // firewood
    innSign(B, 2.55, 1.96, 24, {shape: 'shield', fill: '#B5172A', ink: '#FFFFFF', w: 24, h: 16, bracket: true, layer: 3}); }; })();
(function(){ const def = SM('snow', 'smithy_nordic', 'Turf-roof forge', {h: 104, live: {period: 1.2, frames: 6}});
  def.build = (B) => { const log = '#9C6E46';
    B.box(0.08, 0.08, 0, 1.4, 1.84, 4, M.stone, {layer: -1});
    const b = B.box(0.14, 0.14, 4, 1.28, 1.72, 28, log, {trim: 5}); B.door(b, 'front', 0.38, 0.5, 26, {fill: '#5A3418'}); B.win(b, 'right', 0.6, 0.36, 12, 10, {fill: '#FFC86A'});
    B.custom(0.14, 1.86, (g, P, k) => { for(let z = 6; z < 32; z += 5){ [[0.14, 1.86], [1.42, 1.86]].forEach(p => { const c = P(p[0], p[1], z); g.fillStyle = '#C9A06A'; g.beginPath(); D.ell(g, c[0], c[1], 2.4 * k, 2.2 * k); g.fill(); }); } }, {layer: 1});   // log ends at the corners
    B.roof(0.1, 0.1, 32, 1.36, 1.8, 22, '#6E8A4A', {ov: 0.18, ridge: 'y', gable: log});
    B.custom(0.78, 1.0, (g, P, k) => { g.strokeStyle = '#5A3418'; g.lineWidth = 2 * k; g.lineCap = 'round'; [[0.78, -0.12, 1], [0.78, 2.04, -1]].forEach(([x, y]) => { const e = P(x, y, 54); g.beginPath(); g.moveTo(e[0], e[1]); g.quadraticCurveTo(e[0] - 2 * k, e[1] - 9 * k, e[0] + 4 * k, e[1] - 11 * k); g.quadraticCurveTo(e[0] + 7 * k, e[1] - 9 * k, e[0] + 4 * k, e[1] - 6 * k); g.stroke(); }); }, {layer: 3});   // dragon-head gable ends
    B.drum(1.66, 0.42, 0, 0.26, 66, M.stone, {rings: 7, topFill: '#3A2A20'}); glowAt(B, 1.66, 0.42, 66, 14, '#FF7A2E', 2); smoke(B, 1.66, 0.42, 70, {period: 1.2});
    [[1.5, 1.86], [1.9, 1.86], [1.9, 1.0]].forEach(p => B.box(p[0], p[1], 0, 0.08, 0.08, 24, M.wood, {layer: 1}));
    B.roof(1.46, 0.96, 24, 0.5, 0.96, 6, '#6E8A4A', {kind: 'hip', ov: 0.06, layer: 2});
    B.drum(1.62, 1.3, 0, 0.14, 8, M.wood, {layer: 1}); B.box(1.52, 1.22, 8, 0.24, 0.16, 4, M.iron, {layer: 1}); B.drum(1.72, 1.7, 0, 0.12, 9, M.wood, {topFill: '#4A90C0', rings: 2, layer: 1}); }; })();

/* ---------- 🗺️ hand them out through the looks (swap keeps every town's layout: same footprint + door as 'inn' / 'smithy') ---------- */
const COUNTRY = {snow: ['inn_chalet', 'smithy_nordic']};
Object.keys(COUNTRY).forEach(lk => { const L = LOOKS[lk]; if(!L) return; L.swap = Object.assign({}, L.swap || {}, {inn: COUNTRY[lk][0], smithy: COUNTRY[lk][1]}); });
})();

/* 🌍 IsoProps — every look its own PLAZA things (ip-3d, 🌳 IsoProps chat, 2026-11-17 — Aowu: "every location needs its own unique design, like a different country")
   ip-3c gave each look its own inn + smithy; ip-3d does the same for the 4 small plaza things a town puts round its square:
   ⛲ well (1 × 1, blocks) · 🛒 market stall (2 × 1, door [1, 1]) · 📜 quest board (1 × 1, blocks) · 🏮 lantern post (1 × 1, walk-through post).
   SAME footprint + door + block as the village 'well' / 'stall' / 'qboard' / 'lantern' → handed out through look.swap, so a town keeps its plan (T6).
     🌴 jungle → Thailand: dragon-jar well · market stall under a big square parasol · teak board with a tiered roof · Lanna paper lantern
     🌸 cherry → Japan:    ido well with a pulley · yatai food cart · ema board                  (lantern = the stone lantern it already has)
     🏜️ desert → Morocco:  mosaic well under a horseshoe arch · scroll board · brass lantern      (stall = the market tent it already has, 2 × 2 by its roles)
     ❄️ snow  → Alps / Nordic: log well with a winch · Christmas-market chalet stall · rune board (lantern = the glow lantern it already has)
     🌾 farm  → American countryside: hand-pump well · farm stand · barn-door board · hurricane lantern
   Same 14 rules: corners on the grid, tile light, one rim at bake, no emoji (the "!" is drawn), turn rebuilds, 🍂 own conditions for lights + water. */
(function(){   // 🌍 country plaza things
'use strict';
const D = PD, M = MAT, TAU = Math.PI * 2;
const vis = (T, nx, ny) => sideOf(T.nrm(nx, ny));
const line = (g, a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
const polyP = (g, pts) => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
const SETOF = lk => lk === 'jungle' ? 'village' : lk;
const PL = (look, key, name, o) => add(SETOF(look), key, Object.assign({name, look}, o));
const WELL = (look, key, name, o) => PL(look, key, name, Object.assign({foot: [1, 1], tags: ['water', 'well']}, o));
const STALL = (look, key, name, o) => PL(look, key, name, Object.assign({foot: [2, 1], door: [1, 1], variants: 3, tags: ['shop', 'stall']}, o));
const BOARD = (look, key, name, o) => PL(look, key, name, Object.assign({foot: [1, 1], tags: ['quest', 'board']}, o));
const LAMP = (look, key, name, o) => PL(look, key, name, Object.assign({foot: [1, 1], kind: 'post', block: false, tags: ['light', 'night', 'lantern']}, o));
// 🍂 a light in a condition: fresh = full · dry = dim · ruined = out (broken glass)
const lightOf = c => !c ? 1 : c.broken ? 0 : 0.5;
// the "!" every quest board carries (drawn, rule 7), in each country's own badge
function bang(g, x, y, k, o){ o = o || {}; D.txt(g, '!', x, y + (o.size || 12) * 0.36 * k, {size: (o.size || 12) * k, align: 'center', col: o.col || '#FFFFFF', w: 800, font: '"Baloo 2"'}); }
// a horizontal log / pole lying along the model x axis (round things lie along the grid and turn with it — rule 5)
function pole(g, P, k, x0, x1, y, z, r, col, cap){ const a = P(x0, y, z), b = P(x1, y, z), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = Math.hypot(b[0] - a[0], b[1] - a[1]), R = r * k;
  g.save(); g.translate(a[0], a[1]); g.rotate(ang); g.fillStyle = D.lin(g, 0, -R, 0, R, [sh(col, 0.25), col, sh(col, -0.3)]); g.fillRect(0, -R, L, 2 * R);
  const e = Math.cos(ang) > 0 ? L : 0; g.fillStyle = cap || sh(col, 0.35); g.beginPath(); D.ell(g, e, 0, R * 0.5, R); g.fill(); g.restore(); }
// chofa horns at both ends of a ridge that runs along model x at (y, z) — Thai roofs
function chofa(B, x0, x1, y, z){ B.custom((x0 + x1) / 2, y, (g, P, k) => { g.fillStyle = M.gold; g.strokeStyle = M.gold; g.lineCap = 'round';
  [[x0, 1], [x1, -1]].forEach(([x, d]) => { const e = P(x, y, z), s = Math.sign(P(x1, y, z)[0] - P(x0, y, z)[0]) || 1, dd = -d * s; g.lineWidth = 1.8 * k; g.beginPath(); g.moveTo(e[0], e[1]); g.quadraticCurveTo(e[0] + dd * 2 * k, e[1] - 7 * k, e[0] + dd * 4.5 * k, e[1] - 9 * k); g.stroke(); g.beginPath(); D.ell(g, e[0] + dd * 4.5 * k, e[1] - 9 * k, 1.5 * k, 1.5 * k); g.fill(); }); }, {layer: 4}); }
// 🇯🇵 ridge cap with up-turned dark end tiles (onigawara) along model x — Japanese roofs (no gold horns: those are Thai)
function onigawara(B, x0, x1, y, z, col){ B.custom((x0 + x1) / 2, y, (g, P, k) => { const a = P(x0, y, z), b = P(x1, y, z); g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = 2.6 * k; line(g, a, b);
  g.fillStyle = col; [a, b].forEach((e, i) => { const d = (i ? 1 : -1) * Math.sign(b[0] - a[0] || 1); g.beginPath(); g.moveTo(e[0] - d * 2 * k, e[1] + 1.5 * k); g.quadraticCurveTo(e[0] + d * 1 * k, e[1] - 1 * k, e[0] + d * 2.6 * k, e[1] - 5 * k); g.lineTo(e[0] + d * 0.4 * k, e[1] - 3.6 * k); g.quadraticCurveTo(e[0] - d * 0.4 * k, e[1] - 1 * k, e[0] - d * 2 * k, e[1] - 0.8 * k); g.closePath(); g.fill(); }); }, {layer: 4}); }
// hanging paper lantern (round) with glow
function chochin(g, x, y, k, col, lv){ g.strokeStyle = '#2A1C14'; g.lineWidth = 0.9 * k; line(g, [x, y - 7 * k], [x, y - 4.5 * k]);
  g.fillStyle = lv ? col : sh(col, -0.35); g.beginPath(); D.ell(g, x, y, 3.6 * k, 4.6 * k); g.fill(); g.fillStyle = '#2A1C14'; g.fillRect(x - 2.2 * k, y - 5.4 * k, 4.4 * k, 1.4 * k); g.fillRect(x - 2.2 * k, y + 4.1 * k, 4.4 * k, 1.3 * k);
  g.strokeStyle = 'rgba(255,240,200,0.45)'; g.lineWidth = 0.6 * k; [-1.6, 0, 1.6].forEach(d => line(g, [x - 3.3 * k, y + d * k], [x + 3.3 * k, y + d * k])); if(lv) D.glow(g, x, y, 10 * k, '#FFC86A', 0.4 * lv); }
// steam puffs (live)
function steam(g, x, y, k, t, period){ const ph = ((t || 0) / (period || 1.4)) % 1; g.fillStyle = 'rgba(255,255,255,0.7)'; for(let i = 0; i < 3; i++){ const f = (i + ph) / 3; g.beginPath(); D.ell(g, x + Math.sin(f * 6 + i) * 2.4 * k, y - f * 16 * k, (2 + f * 3) * k, (1.6 + f * 2) * k); g.fill(); } }
// little round things on a tray / in a crate (fruit, cobs, pumpkins) — screen space at a model point
function heap(g, c, k, n, col, r, seed, o){ const R = rnd(seed); o = o || {}; for(let i = 0; i < n; i++){ const row = i < n * 0.6 ? 0 : 1, x = c[0] + ((i % Math.ceil(n * 0.6)) - n * 0.3) * r * 1.5 * k + (row ? r * 0.75 * k : 0), y = c[1] - row * r * 1.2 * k - R() * 0.8 * k;
    g.fillStyle = Array.isArray(col) ? col[i % col.length] : col; g.beginPath(); if(o.cob) D.ell(g, x, y, r * 0.55 * k, r * 1.15 * k, 0.5); else D.ell(g, x, y, r * k, r * 0.9 * k); g.fill();
    if(o.spiky){ g.strokeStyle = sh(col, -0.25); g.lineWidth = 0.6 * k; for(let a = 0; a < 6; a++){ const an = a * TAU / 6; line(g, [x + Math.cos(an) * r * k, y + Math.sin(an) * r * 0.9 * k], [x + Math.cos(an) * (r + 1.2) * k, y + Math.sin(an) * (r + 1.1) * k]); } }
    else { g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); D.ell(g, x - r * 0.35 * k, y - r * 0.35 * k, r * 0.3 * k, r * 0.25 * k); g.fill(); } } }

/* ============================ ❄️ ALPS / NORDIC ============================ */
// ⛲ log well: a notched log crib with an iced top, a log winch with an iron crank, a steep shingle roof with icicles
(function(){ const def = WELL('snow', 'well_log', 'Log well', {h: 66});
  def.build = (B, v, L) => { const c = L.cond, log = '#A5764C';
    B.box(0.16, 0.16, 0, 0.68, 0.68, 18, log, {trim: 4.5, topFill: !c ? '#DCEFFF' : c.broken ? '#3A2E26' : '#B8C4CC'});
    B.custom(0.5, 0.5, (g, P, k) => { [[0.84, 0.84], [0.16, 0.84], [0.84, 0.16]].forEach(([x, y]) => { for(let z = 2.25; z < 18; z += 4.5){ const q = P(x, y, z); g.fillStyle = '#E2C08A'; g.beginPath(); D.ell(g, q[0], q[1], 2.6 * k, 2.2 * k); g.fill(); g.strokeStyle = 'rgba(122,74,34,0.55)'; g.lineWidth = 0.6 * k; g.beginPath(); D.ell(g, q[0], q[1], 1.3 * k, 1.1 * k); g.stroke(); } });
      if(!c){ g.strokeStyle = 'rgba(120,160,200,0.7)'; g.lineWidth = 0.8 * k; const a = P(0.3, 0.4, 18), b = P(0.55, 0.55, 18), d = P(0.7, 0.42, 18); line(g, a, b); line(g, b, d); } }, {layer: 1});
    [0.06, 0.86].forEach(x => B.box(x, 0.45, 0, 0.08, 0.1, 46, '#6A4630', {layer: 1}));
    B.custom(0.5, 0.5, (g, P, k, t, T) => { pole(g, P, k, 0.1, 0.9, 0.5, 34, 3.6, '#B98A5E', '#E2C08A'); const end = vis(T, 1, 0) ? 0.94 : vis(T, -1, 0) ? 0.06 : 0.94, a = P(end, 0.5, 34), b = P(end, 0.5, 26), d = P(end, 0.7, 26);
      g.strokeStyle = '#4A4A52'; g.lineWidth = 1.6 * k; g.lineCap = 'round'; line(g, a, b); line(g, b, d); g.fillStyle = '#7A4A26'; g.beginPath(); D.ell(g, d[0], d[1], 1.8 * k, 1.8 * k); g.fill();
      const r = P(0.5, 0.5, 34), bk = P(0.5, 0.5, 21); g.strokeStyle = '#8A6A44'; g.lineWidth = 0.8 * k; line(g, r, [bk[0], bk[1] - 5 * k]);
      g.fillStyle = '#8E6A44'; g.beginPath(); g.moveTo(bk[0] - 3.4 * k, bk[1] - 5 * k); g.lineTo(bk[0] + 3.4 * k, bk[1] - 5 * k); g.lineTo(bk[0] + 2.8 * k, bk[1]); g.lineTo(bk[0] - 2.8 * k, bk[1]); g.closePath(); g.fill(); g.strokeStyle = '#4A4A52'; g.lineWidth = 0.7 * k; line(g, [bk[0] - 3.2 * k, bk[1] - 3.6 * k], [bk[0] + 3.2 * k, bk[1] - 3.6 * k]); }, {layer: 2});
    B.roof(0.0, 0.22, 46, 1.0, 0.56, 18, '#7A4A3A', {ridge: 'x', ov: 0.08, stripes: 6, layer: 3});
    B.custom(0.5, 0.86, (g, P, k, t, T) => { if(c && c.broken) return; [[0, 1, 0.86], [0, -1, 0.14]].forEach(([nx, ny, y]) => { if(!vis(T, nx, ny)) return; for(let i = 0; i < 7; i++){ const q = P(-0.04 + i * 0.18, y + (ny > 0 ? 0.08 : -0.08), 46), L2 = (3 + (i * 37 % 5)) * k; g.fillStyle = '#E8F6FF'; g.beginPath(); g.moveTo(q[0] - 1.3 * k, q[1]); g.lineTo(q[0] + 1.3 * k, q[1]); g.lineTo(q[0], q[1] + L2); g.closePath(); g.fill(); } }); }, {layer: 4}); }; })();
// 🛒 Christmas-market chalet: a little wooden hut with a counter, hot mugs, hanging gingerbread hearts, a pretzel sign and twinkling string lights
(function(){ const def = STALL('snow', 'stall_chalet', 'Market chalet', {h: 74, tags: ['shop', 'stall', 'food'], live: {period: 1.6, frames: 4}});
  def.build = (B, v, L) => { const c = L.cond, wall = ['#B98A5E', '#A8433A', '#3E6A4A'][v % 3], lv = lightOf(c), planks = (g, Q, k) => { g.strokeStyle = 'rgba(60,30,14,0.35)'; g.lineWidth = 1 * k; for(let i = 1; i < 12; i++) line(g, Q(i / 12, 0.5), Q(i / 12, 43.5)); };
    B.box(0.12, 0.1, 0, 1.76, 0.12, 44, wall); B.box(0.12, 0.1, 0, 0.12, 0.8, 44, wall); const sR = B.box(1.76, 0.1, 0, 0.12, 0.8, 44, wall);
    B.decal(sR, 'right', 0.04, 0.72, 0, 44, wall, {paint: (g, Q, k) => { planks(g, Q, k); const h = Q(0.5, 30); g.fillStyle = '#3A2418'; g.beginPath(); g.moveTo(h[0], h[1] + 3 * k); g.bezierCurveTo(h[0] - 5 * k, h[1] - 1 * k, h[0] - 2.5 * k, h[1] - 5 * k, h[0], h[1] - 2.5 * k); g.bezierCurveTo(h[0] + 2.5 * k, h[1] - 5 * k, h[0] + 5 * k, h[1] - 1 * k, h[0], h[1] + 3 * k); g.fill(); }});
    const ct = B.box(0.12, 0.68, 0, 1.76, 0.22, 20, wall); B.decal(ct, 'front', 0, 1.76, 0, 20, wall, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(60,30,14,0.35)'; g.lineWidth = 1 * k; for(let i = 1; i < 14; i++) line(g, Q(i / 14, 0.5), Q(i / 14, 19.5));
      g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.1 * k; g.beginPath(); for(let i = 0; i <= 16; i++){ const q = Q(i / 16, i % 2 ? 13 : 16); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke(); }});
    B.box(0.08, 0.64, 20, 1.84, 0.3, 3, '#E2B07A', {layer: 1});
    B.custom(1, 0.6, (g, P, k) => { [[0.4, '#C8302A'], [0.62, '#2E6B4F'], [1.5, '#C8302A']].forEach(([x, col]) => { const q = P(x, 0.78, 23); g.fillStyle = col; g.fillRect(q[0] - 2.4 * k, q[1] - 6 * k, 4.8 * k, 6 * k); g.fillStyle = '#FFF2D8'; g.beginPath(); D.ell(g, q[0], q[1] - 6 * k, 2.4 * k, 0.9 * k); g.fill(); g.strokeStyle = col; g.lineWidth = 1 * k; g.beginPath(); g.arc(q[0] + 2.6 * k, q[1] - 3 * k, 1.6 * k, -1.4, 1.4); g.stroke(); });
      const s = P(0.95, 0.4, 23); g.fillStyle = '#B5652A'; [0, 1, 2].forEach(i => { g.beginPath(); D.ell(g, s[0] + (i - 1) * 4 * k, s[1] - 1.5 * k, 2.6 * k, 1.6 * k); g.fill(); });   // stacked cookies
      g.strokeStyle = '#8A6A44'; g.lineWidth = 0.6 * k; line(g, P(0.24, 0.72, 39), P(1.76, 0.72, 39)); if(!(c && c.broken)) [0.4, 0.7, 1.0, 1.3, 1.6].forEach((x, i) => { const q = P(x, 0.72, 39), y = q[1] + (3 + (i % 2) * 2) * k; line(g, q, [q[0], y]);
        g.fillStyle = '#B5652A'; g.beginPath(); g.moveTo(q[0], y + 5 * k); g.bezierCurveTo(q[0] - 5 * k, y + 1.5 * k, q[0] - 2.6 * k, y - 2 * k, q[0], y + 0.6 * k); g.bezierCurveTo(q[0] + 2.6 * k, y - 2 * k, q[0] + 5 * k, y + 1.5 * k, q[0], y + 5 * k); g.fill();
        g.strokeStyle = '#FFFFFF'; g.lineWidth = 0.6 * k; g.beginPath(); g.moveTo(q[0] - 2.2 * k, y + 1.6 * k); g.quadraticCurveTo(q[0], y + 3.6 * k, q[0] + 2.2 * k, y + 1.6 * k); g.stroke(); g.strokeStyle = '#8A6A44'; }); }, {layer: 2});
    B.roof(0.0, 0.0, 44, 2.0, 1.0, 24, '#5A3A2A', {ridge: 'x', ov: 0.1, stripes: 10, layer: 3});
    B.custom(1, 1.1, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; const ph = Math.round(((t || 0) / 1.6) * 4) % 4, cols = ['#FFD23F', '#FF6A4A', '#7CF5D0', '#FFFFFF'];
      g.strokeStyle = '#2A1C14'; g.lineWidth = 0.6 * k; g.beginPath(); for(let i = 0; i <= 12; i++){ const u = -0.1 + i * 2.2 / 12, q = P(u, 1.1, 44 - Math.sin(i / 12 * Math.PI * 3) * 1.6 - 2); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
      for(let i = 1; i < 12; i++){ const u = -0.1 + i * 2.2 / 12, q = P(u, 1.1, 44 - Math.sin(i / 12 * Math.PI * 3) * 1.6 - 2), on = lv && (lv > 0.6 ? (i + ph) % 4 !== 0 : i % 3 === 0);
        g.fillStyle = on ? cols[i % 4] : '#6A6A6A'; g.beginPath(); D.ell(g, q[0], q[1] + 1.4 * k, 1.3 * k, 1.7 * k); g.fill(); if(on) D.glow(g, q[0], q[1] + 1.4 * k, 5 * k, cols[i % 4], 0.35); }
      const sg = P(1.92, 1.1, 40); g.strokeStyle = '#3A3A42'; g.lineWidth = 1 * k; line(g, sg, [sg[0], sg[1] + 3 * k]); g.strokeStyle = '#C47A2A'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(sg[0] - 4 * k, sg[1] + 10 * k); g.bezierCurveTo(sg[0] - 6 * k, sg[1] + 3 * k, sg[0] + 2 * k, sg[1] + 3 * k, sg[0] + 3 * k, sg[1] + 9 * k); g.moveTo(sg[0] + 4 * k, sg[1] + 10 * k); g.bezierCurveTo(sg[0] + 6 * k, sg[1] + 3 * k, sg[0] - 2 * k, sg[1] + 3 * k, sg[0] - 3 * k, sg[1] + 9 * k); g.stroke(); }, {layer: 4}); }; })();
// 📜 rune board: log posts, a carved board with a rune border, a shingle roof with crossed dragon-head ends, a painted round shield "!"
(function(){ const def = BOARD('snow', 'qboard_rune', 'Rune board', {h: 64});
  def.build = (B, v, L) => { const c = L.cond, logc = '#6A4630';
    [0.08, 0.82].forEach(x => B.box(x, 0.44, 0, 0.1, 0.12, 42, logc));
    const b = B.box(0.06, 0.5, 10, 0.88, 0.1, 28, '#A5764C');
    B.decal(b, 'front', 0.02, 0.84, 1, 26, '#A5764C', {paint: (g, Q, k) => { g.strokeStyle = '#5A3418'; g.lineWidth = 0.9 * k; g.beginPath(); for(let i = 0; i <= 18; i++){ const q = Q(i / 18, i % 2 ? 23.5 : 25.5); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
      g.beginPath(); for(let i = 0; i <= 18; i++){ const q = Q(i / 18, i % 2 ? 0.5 : 2.5); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
      [[0.08, 3, 0.36, 16], [0.56, 5, 0.34, 14]].forEach(([u, z, w, h]) => { if(c && c.broken && u > 0.5) return; g.fillStyle = c ? '#CFC4A8' : '#F4EFE4'; polyP(g, [Q(u, z), Q(u + w, z), Q(u + w, z + h), Q(u, z + h)]); g.fill(); g.strokeStyle = 'rgba(60,60,80,0.45)'; g.lineWidth = 0.6 * k; for(let r = 3; r < h - 1; r += 3) line(g, Q(u + 0.04, z + r), Q(u + w - 0.05, z + r)); g.fillStyle = '#C8302A'; const p = Q(u + w / 2, z + h - 1.5); g.beginPath(); D.ell(g, p[0], p[1], 1.2 * k, 1.2 * k); g.fill(); });
      g.strokeStyle = 'rgba(40,24,12,0.5)'; g.lineWidth = 0.9 * k; [[0.47, 6], [0.49, 13]].forEach(([u, z]) => { line(g, Q(u, z), Q(u, z + 6)); line(g, Q(u, z + 2), Q(u + 0.04, z + 4)); }); }});
    B.roof(0.0, 0.36, 40, 1.0, 0.36, 12, '#3E5A4A', {ridge: 'x', ov: 0.08, stripes: 5, layer: 1});
    B.custom(0.5, 0.54, (g, P, k) => { g.lineCap = 'round'; [[-0.08, 1], [1.08, -1]].forEach(([x, d]) => { const e = P(x, 0.54, 52), s = Math.sign(P(1.08, 0.54, 52)[0] - P(-0.08, 0.54, 52)[0]) || 1, dd = -d * s; g.strokeStyle = '#6A4630'; g.lineWidth = 2 * k;
      [-1, 1].forEach(z => { g.beginPath(); g.moveTo(e[0] - dd * 3 * k, e[1] + 3 * k * z * 0 + 2 * k); g.quadraticCurveTo(e[0] + dd * 2 * k * z, e[1] - 6 * k, e[0] + dd * 4.5 * k * z, e[1] - 9 * k); g.stroke(); g.fillStyle = '#6A4630'; g.beginPath(); D.ell(g, e[0] + dd * 5 * k * z, e[1] - 9.6 * k, 1.8 * k, 1.4 * k); g.fill(); }); }); }, {layer: 3});
    B.custom(0.5, 0.62, (g, P, k) => { const q = P(0.5, 0.61, 32); g.fillStyle = c ? '#7A7A8A' : '#2E5AA8'; g.beginPath(); D.ell(g, q[0], q[1], 6.6 * k, 6.6 * k); g.fill(); g.fillStyle = c ? '#9A6A5A' : '#D2302A'; g.beginPath(); D.ell(g, q[0], q[1], 5 * k, 5 * k); g.fill();
      g.fillStyle = '#C9C2B0'; g.beginPath(); D.ell(g, q[0], q[1], 1.6 * k, 1.6 * k); g.fill(); bang(g, q[0], q[1], k, {size: 10}); }, {layer: 2}); }; })();

/* ---------- 🗺️ hand them out through the looks (same footprint + door + block as the village ones → every town keeps its plan, T6) ---------- */
const PLAZA = {snow: {well: 'well_log', stall: 'stall_chalet', qboard: 'qboard_rune', lantern: 'aurorapost'}};
Object.keys(PLAZA).forEach(lk => { const L = LOOKS[lk]; if(!L) return; const sw = {}; Object.keys(PLAZA[lk]).forEach(a => { if(DEFS[PLAZA[lk][a]]) sw[a] = PLAZA[lk][a]; }); L.swap = Object.assign({}, L.swap || {}, sw); });
})();
K.loaded('snow', 'ip-7a');
})(window.Props && window.Props._K);
