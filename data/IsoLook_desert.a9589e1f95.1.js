
/* 🌍 IsoLook_desert — 🏜️ desert → Morocco / Arabia — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['desert'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/desert.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_desert: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🏜️ desert → Morocco / Arabia (ip-4a split from the ip-3 files 22–27; each part below is the old file's own IIFE).
   Built into IsoLook_desert.html by build_isoprops.py; runs after the engine with Props._K (kit insides). */
/* 🗾🏜️❄️ IsoProps — region sets (ip-3, 🌳 IsoProps chat, 2026-11-17): cherry · desert · snow. Same 14 rules as the starter catalogue:
   corners = iso parts on the grid · tile light · ONE rim from the bake (painters draw none) · organic = billboards on a 2 : 1 shadow · no emoji ·
   variants by seed · front = +y, turn rebuilds · 🍂 conditions through the core fallback (or a prop's own conds). Each prop's home look = its set
   (def.look) so a catalogue card shows it dressed right; any map can still place it with its own look. */
(function(){   // 🗾🏜️❄️ region sets
'use strict';
const D = PD, M = MAT, TAU = Math.PI * 2;
const piece = (g, parts) => D.piece(g, parts, '#000', 0);
const S = (set, o) => addSet(set, o);
S('desert', {name: 'Desert', icon: '🏜️', accent: '#E9A23B'});
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

/* ================= 🏜️ DESERT ================= */
const DA = own('desert', 'desert'), DO = org('desert', 'desert');
function datepalm(g, x, y, k, t, v, c){ const lean = [0.06, -0.08][v % 2], dead = c && c.leaves < 1, snap = c && c.broken; g.save(); g.translate(x, y); g.scale(k, k);
  const top = snap ? 40 : 70, tx = lean * top;
  piece(g, [{path: g => { g.moveTo(-4.5, 0); g.lineTo(tx - 3, -top); if(snap){ g.lineTo(tx - 1, -top - 5); g.lineTo(tx + 1, -top + 1); g.lineTo(tx + 3, -top - 4); } else g.lineTo(tx + 3, -top); g.lineTo(4.5, 0); g.lineTo(8, 2); g.lineTo(-8, 2); g.closePath(); }, fill: g => D.lin(g, -5, 0, 5, 0, ['#C9925A', '#8A5A2B'])}]);
  g.strokeStyle = 'rgba(42,28,20,0.28)'; g.lineWidth = 1; for(let i = 1; i < top / 6; i++){ const yy = -i * 6, xx = lean * i * 6; g.beginPath(); g.moveTo(xx - 4, yy + 2); g.lineTo(xx, yy - 1); g.lineTo(xx + 4, yy + 2); g.stroke(); }
  if(!snap){ g.translate(tx, -top); const sw = c && c.still ? 0 : Math.sin(t * 1.3) * 0.04; g.rotate(sw);
    for(let i = 0; i < 8; i++){ const a = -Math.PI / 2 + (i - 3.5) * 0.48, droop = dead ? 0.5 : 0.18; piece(g, [{path: g => { g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * 18, Math.sin(a) * 18 - 8, Math.cos(a + droop * Math.sign(Math.cos(a) || 1)) * 34, Math.sin(a) * 18 + 18); g.quadraticCurveTo(Math.cos(a) * 15, Math.sin(a) * 12, 0, 0); }, fill: dead ? (i % 2 ? '#B8945A' : '#9C7A44') : (i % 2 ? '#5FA83E' : '#7CC04E')}]); }
    if(!dead){ g.fillStyle = '#C8642A'; [[-5, 6], [5, 7], [0, 9]].forEach(p => { for(let n = 0; n < 4; n++){ g.beginPath(); D.ell(g, p[0] + (n % 2) * 2.4 - 1.2, p[1] + n * 1.8, 1.8, 2.2); g.fill(); } }); } }
  else { g.translate(tx, -top); [[-0.9, 1], [0.8, -1]].forEach(([a, s]) => piece(g, [{path: g => { g.moveTo(0, 2); g.quadraticCurveTo(s * 10, 4, s * 14, 22); g.lineTo(s * 11, 22); g.quadraticCurveTo(s * 7, 8, 0, 5); }, fill: '#9C7A44'}])); }
  g.restore(); }
(function(){ const def = DO('datepalm', {name: 'Date palm', h: 82, variants: 2, tags: ['tree', 'fruit']}, (g, x, y, k, t, v) => datepalm(g, x, y, k, t, v, null));
  def.conds = {'*': (g, x, y, k, t, v, c) => datepalm(g, x, y, k, t, v, c)}; def.live = {period: 2 * Math.PI / 1.3, frames: 6}; })();
DEFS.palm.conds = {'*': (g, x, y, k, t, v, c) => datepalm(g, x, y, k, t, v, c)};   /* a dry / ruined jungle palm = dead fronds / a snapped trunk, not a branching tree */
function cactus(g, x, y, k, t, v, c){ g.save(); g.translate(x, y); g.scale(k, k); const cs = c ? ['#C2BA72', '#959048', '#76703A'] : ['#7CC45A', '#4F9A3E', '#3A7A30'], col = g => D.lin(g, -10, 0, 10, 0, cs), snap = c && c.broken;
  const arm = (s, y0, up) => ({path: g => { g.moveTo(s * 4, -y0); g.lineTo(s * 13, -y0); g.quadraticCurveTo(s * 18, -y0, s * 18, -y0 - 6); g.lineTo(s * 18, -y0 - up); g.arc(s * 14.5, -y0 - up, 3.5, 0, Math.PI, true); g.lineTo(s * 11, -y0 - 6); g.lineTo(s * 4, -y0 - 6); g.closePath(); }, fill: col});
  if(snap){ piece(g, [{path: g => { g.moveTo(-6, 0); g.lineTo(-6, -30); g.lineTo(-3, -34); g.lineTo(-1, -29); g.lineTo(2, -35); g.lineTo(6, -31); g.lineTo(6, 0); g.closePath(); }, fill: col}, arm(-1, 16, 8),
      {path: g => { g.moveTo(9, 2); g.lineTo(28, -1); g.arc(28, 2.5, 3.5, -Math.PI / 2, Math.PI / 2); g.lineTo(9, 6); g.closePath(); }, fill: col}]); g.restore(); return; }
  piece(g, [{path: g => { g.moveTo(-6, 0); g.lineTo(-6, -50); g.arc(0, -50, 6, Math.PI, 0); g.lineTo(6, 0); g.closePath(); }, fill: col}, arm(-1, 22, 14), arm(1, v % 2 ? 30 : 16, v % 2 ? 12 : 18)]);
  g.strokeStyle = 'rgba(30,70,30,0.35)'; g.lineWidth = 1; [-2.5, 2.5].forEach(xx => { g.beginPath(); g.moveTo(xx, -2); g.lineTo(xx, -52); g.stroke(); });
  if(v % 2 && !c){ g.fillStyle = '#FF7AA8'; g.beginPath(); D.star(g, 0, -57, 4, 2, 6); g.fill(); g.fillStyle = '#FFD23F'; g.beginPath(); D.ell(g, 0, -57, 1.4, 1.4); g.fill(); } g.restore(); }
(function(){ const def = DO('cactus', {name: 'Tall cactus', h: 60, variants: 2, tags: ['plant', 'desert']}, (g, x, y, k, t, v) => cactus(g, x, y, k, t, v, null)); def.conds = {'*': (g, x, y, k, t, v, c) => cactus(g, x, y, k, t, v, c)}; })();
function rcactus(g, x, y, k, t, v, c){ g.save(); g.translate(x, y); g.scale(k, k); if(c && c.broken) g.scale(1.1, 0.62); const cs = c ? ['#C2BA72', '#959048', '#76703A'] : ['#8ACB5A', '#4F9A3E', '#3A7A30'];
  if(v % 2){ piece(g, [{path: g => { D.ell(g, -6, -10, 7, 10, -0.3); D.ell(g, 7, -9, 6, 9, 0.35); D.ell(g, 1, -21, 5, 7, 0.1); }, fill: g => D.lin(g, -12, 0, 12, 0, [cs[0], cs[1]])}]);
    if(!c){ g.fillStyle = '#FFD23F'; [[-6, -20], [3, -27], [9, -17]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 2.2, 2.2); g.fill(); }); } }
  else { piece(g, [{path: g => { g.moveTo(-12, 0); g.quadraticCurveTo(-14, -20, 0, -22); g.quadraticCurveTo(14, -20, 12, 0); g.closePath(); }, fill: g => D.lin(g, -12, 0, 12, 0, cs)}]);
    g.strokeStyle = 'rgba(30,70,30,0.4)'; g.lineWidth = 1; [-7, 0, 7].forEach(xx => { g.beginPath(); g.moveTo(xx * 0.9, -1); g.quadraticCurveTo(xx * 1.2, -12, xx * 0.6, -20); g.stroke(); });
    if(!c){ g.fillStyle = '#FF5A8A'; g.beginPath(); D.star(g, 0, -22, 4.5, 2.2, 6); g.fill(); g.fillStyle = '#FFD23F'; g.beginPath(); D.ell(g, 0, -22, 1.4, 1.4); g.fill(); } }
  g.restore(); }
(function(){ const def = DO('roundcactus', {name: 'Round cactus', h: 26, kind: 'bush', variants: 2, tags: ['plant', 'desert']}, (g, x, y, k, t, v) => rcactus(g, x, y, k, t, v, null)); def.conds = {'*': (g, x, y, k, t, v, c) => rcactus(g, x, y, k, t, v, c)}; })();
DO('mesarock', {name: 'Sandstone rock', h: 24, kind: 'deco', variants: 2, dead: 'keep', tags: ['stone', 'desert']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k); const s = [1, 0.8][v % 2];
  piece(g, [{path: g => { g.moveTo(-17 * s, 0); g.lineTo(-15 * s, -9 * s); g.lineTo(-11 * s, -11 * s); g.lineTo(-10 * s, -19 * s); g.lineTo(7 * s, -21 * s); g.lineTo(10 * s, -12 * s); g.lineTo(16 * s, -9 * s); g.lineTo(17 * s, 0); g.closePath(); }, fill: g => D.lin(g, -16, -20, 16, 0, ['#F2C48A', '#D98E4A', '#B5652A'])}]);
  g.strokeStyle = 'rgba(122,74,34,0.4)'; g.lineWidth = 1; [-6, -13].forEach(yy => { g.beginPath(); g.moveTo(-15 * s, yy * s); g.lineTo(15 * s, (yy + 1) * s); g.stroke(); }); g.restore(); });
// 🏠 mud-brick house: flat roof with a low wall round it, beams poking out, sometimes a little room on top
(function(){ const def = DA('mudhouse', {name: 'Mud-brick house', foot: [2, 2], h: 80, variants: 4, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const wall = L.walls[v % L.walls.length], dark = '#7A4A22';
    const b = B.box(0.15, 0.15, 0, 1.7, 1.7, 42, wall);
    B.door(b, 'front', 0.8, 0.4, 30, {fill: dark}); B.win(b, 'front', 0.34, 0.24, 20, 10, {fill: '#5A3A26'}); B.win(b, 'right', 0.5, 0.26, 20, 10, {fill: '#5A3A26'}); B.win(b, 'right', 1.2, 0.26, 20, 10, {fill: '#5A3A26'});
    const pw = sh(wall, -0.04); B.box(0.15, 0.15, 42, 1.7, 0.12, 5, pw); B.box(0.15, 1.73, 42, 1.7, 0.12, 5, pw); B.box(0.15, 0.27, 42, 0.12, 1.46, 5, pw); B.box(1.73, 0.27, 42, 0.12, 1.46, 5, pw);
    [0.4, 0.8, 1.2, 1.6].forEach(x => B.box(x, 1.84, 36, 0.08, 0.12, 3, dark, {layer: 1}));
    if(v % 2){ const u = B.box(0.3, 0.3, 42, 0.8, 0.8, 24, wall); B.win(u, 'front', 0.55, 0.26, 9, 9, {fill: '#5A3A26'}); B.box(0.28, 0.28, 66, 0.84, 0.84, 3, pw); }
    if(v >= 2) B.box(0.72, 1.85, 30, 0.56, 0.22, 2, L.accent, {layer: 1});   // cloth awning over the door
  }; })();
// 🕌 dome house: whitewashed walls, coloured dome, gold tip
(function(){ const def = DA('domehouse', {name: 'Dome house', foot: [2, 2], h: 86, variants: 3, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const wall = ['#F7F1E4', '#F2E4CC', '#EFE8DA'][v % 3], top = [L.accent || '#2EC4B6', '#3A8DFF', '#E9A23B'][v % 3];
    B.box(0.1, 0.1, 0, 1.8, 1.8, 4, '#D9B87A');
    const b = B.box(0.18, 0.18, 4, 1.64, 1.64, 38, wall); B.door(b, 'front', 0.8, 0.4, 30, {fill: '#5A3A26'}); B.win(b, 'front', 0.38, 0.24, 18, 12, {fill: top}); B.win(b, 'right', 0.85, 0.3, 18, 12, {fill: top});
    B.box(0.18, 0.18, 42, 1.64, 1.64, 3, sh(wall, -0.06));
    B.custom(1, 1, (g, P, k) => { const d = dome(g, P, k, 1, 1, 45, 0.6, 30, top); g.strokeStyle = '#C99A2E'; g.lineWidth = 2 * k; const a = [d.c[0], d.c[1] - d.hh]; line(g, a, [a[0], a[1] - 9 * k]); g.fillStyle = M.gold; g.beginPath(); D.ell(g, a[0], a[1] - 10 * k, 2.4 * k, 2.6 * k); g.fill(); }, {layer: 2});
  }; })();
// ⛺ market tent: cloth roof on posts, open at the front, rug + goods inside
(function(){ const def = DA('tent', {name: 'Market tent', foot: [2, 2], h: 64, variants: 3, door: [1, 2], tags: ['shop', 'tent']});
  def.build = (B, v) => { const cloth = ['#E2553A', '#2EC4B6', '#9B5DE5'][v % 3];
    B.flat(0.12, 0.12, 1.76, 1.76, '#B5452A', {fill: '#C25A3A'});
    B.box(0.12, 0.12, 0, 1.76, 0.1, 30, M.cloth); B.box(1.78, 0.12, 0, 0.1, 1.76, 30, M.cloth);
    [[0.12, 1.76], [1.76, 1.76]].forEach(p => B.box(p[0], p[1], 0, 0.1, 0.1, 30, M.dark));
    B.custom(1, 0.6, (g, P, k) => { [[0.5, 0.45, '#D98E4A'], [0.85, 0.4, '#3A8DFF'], [1.35, 0.5, '#D98E4A']].forEach(q => { const p = P(q[0], q[1], 0); g.fillStyle = q[2]; g.beginPath(); D.ell(g, p[0], p[1] - 7 * k, 5 * k, 7 * k); g.fill(); g.fillStyle = sh(q[2], -0.2); g.fillRect(p[0] - 2 * k, p[1] - 16 * k, 4 * k, 3 * k); });
      [[1.5, 1.0, '#9B5DE5'], [1.55, 1.3, '#FFD23F']].forEach(q => { const a = P(q[0], q[1], 4), b = P(q[0], q[1] + 0.25, 4); g.strokeStyle = q[2]; g.lineWidth = 6 * k; g.lineCap = 'round'; line(g, a, b); }); }, {layer: 1});
    B.roof(0.02, 0.02, 30, 1.96, 1.96, 26, cloth, {ov: 0.14, stripes: 8});
    B.custom(1, 2, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; for(let i = 0; i < 7; i++){ const a = P(0.0 + i * 0.29, 2.13, 30), b = P(0.29 + i * 0.29, 2.13, 30), m = P(0.145 + i * 0.29, 2.13, 25); g.fillStyle = i % 2 ? '#FFF6E4' : cloth; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(m[0], m[1]); g.closePath(); g.fill(); } }, {layer: 3});
  }; })();
(function(){ const def = DA('oasis', {name: 'Oasis pool', foot: [2, 2], h: 30, kind: 'thing', organic: true, shadowA: 0.08, tags: ['water']});
  def.build = (B, v, L) => B.custom(1, 1, (g, P, k) => { const m = pool(g, P, k, 1, 1, 0.8, '#E2C48A', ['#49C2D8', '#1E8FB0'], L.cond), dry = L.cond ? '#A8905A' : null;
    reeds(g, m[0] - 24 * k, m[1] - 2 * k, k, L.cond && L.cond.holes ? 2 : 5, 3, dry); reeds(g, m[0] + 20 * k, m[1] + 6 * k, k, L.cond && L.cond.holes ? 1 : 4, 8, dry); if(L.cond) return;
    g.fillStyle = '#5DB84A'; g.beginPath(); g.moveTo(m[0] + 6 * k, m[1] - 4 * k); g.arc(m[0] + 6 * k, m[1] - 4 * k, 4 * k, 0.3, TAU - 0.2); g.closePath(); g.fill(); }); })();
(function(){ const def = DA('pots', {name: 'Clay pots', foot: [1, 1], h: 28, kind: 'thing', variants: 3, tags: ['cargo', 'clay']});
  def.build = (B, v) => { const c = ['#D98E4A', '#C46F3A', '#3A8DFF'][v % 3];
    [[0.36, 0.38, 0.17, 15], [0.66, 0.5, 0.14, 12], [0.42, 0.7, 0.12, 9]].slice(0, 2 + (v % 2)).forEach(p => { B.drum(p[0], p[1], 0, p[2], p[3], c); B.drum(p[0], p[1], p[3], p[2] * 0.5, 5, c, {topFill: '#4A2E1C'}); }); }; })();
(function(){ const def = DA('hitch', {name: 'Hitching post', foot: [1, 1], h: 40, kind: 'post', tags: ['camel', 'rest']});
  def.build = (B) => { B.box(0.12, 0.42, 0, 0.12, 0.12, 34, M.wood); B.box(0.76, 0.42, 0, 0.12, 0.12, 34, M.wood); B.box(0.08, 0.42, 30, 0.84, 0.12, 5, M.wood, {layer: 1});
    B.custom(0.5, 0.5, (g, P, k) => { const a = P(0.3, 0.48, 30), b = P(0.7, 0.48, 30); g.fillStyle = '#E2553A'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(b[0], b[1] + 16 * k); g.lineTo(a[0], a[1] + 16 * k); g.closePath(); g.fill();
      g.fillStyle = '#FFD23F'; [0.3, 0.6].forEach(f => { g.fillRect(a[0], a[1] + 16 * k * f, b[0] - a[0], 2.2 * k); }); }, {layer: 2});
    B.drum(0.5, 0.82, 0, 0.12, 8, M.wood, {topFill: '#5EC3EA'}); }; })();
// 🔺 pyramid: a puzzle machine — stone courses, gold cap, a glowing glyph band and a doorway at the front
(function(){ const def = DA('pyramid', {name: 'Pyramid', foot: [3, 3], h: 132, kind: 'landmark', door: [1.5, 3], tags: ['landmark', 'puzzle', 'big']});
  def.build = (B) => { const H = 118, z0 = 6;
    B.box(0.02, 0.02, 0, 2.96, 2.96, z0, '#D9B87A');
    B.roof(0.1, 0.1, z0, 2.8, 2.8, H, '#E9C891', {kind: 'hip', ov: 0});
    B.roof(1.29, 1.29, z0 + H * 0.85, 0.42, 0.42, H * 0.15, M.gold, {kind: 'hip', ov: 0, layer: 1});
    B.custom(1.5, 1.5, (g, P, k, t, T) => { const hw = z => 1.4 * (1 - (z - z0) / H);
      const sides = [[0, 1, (z, u) => [1.5 + u * hw(z), 1.5 + hw(z)]], [1, 0, (z, u) => [1.5 + hw(z), 1.5 - u * hw(z)]], [0, -1, (z, u) => [1.5 - u * hw(z), 1.5 - hw(z)]], [-1, 0, (z, u) => [1.5 - hw(z), 1.5 + u * hw(z)]]];
      g.strokeStyle = 'rgba(122,74,34,0.3)'; g.lineWidth = 1 * k;
      sides.forEach(([nx, ny, F]) => { if(!vis(T, nx, ny)) return; for(let z = z0 + 12; z < z0 + H * 0.84; z += 12){ const a = F(z, -1), b = F(z, 1); line(g, P(a[0], a[1], z), P(b[0], b[1], z)); } });
      if(vis(T, 0, 1)){ const F = sides[0][2], q = (z, u) => { const p = F(z, u); return P(p[0], p[1], z); };
        g.fillStyle = '#4A2E1C'; g.beginPath(); [q(z0, -0.16), q(z0, 0.16), q(z0 + 22, 0.16), q(z0 + 28, 0), q(z0 + 22, -0.16)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
        g.strokeStyle = '#C99A2E'; g.lineWidth = 2 * k; line(g, q(z0 + 50, -0.8), q(z0 + 50, 0.8)); line(g, q(z0 + 38, -0.8), q(z0 + 38, 0.8));
        g.fillStyle = '#2EC4B6'; for(let i = -2; i <= 2; i++){ const p = q(z0 + 44, i * 0.3); if(i % 2){ g.beginPath(); g.moveTo(p[0], p[1] - 3.4 * k); g.lineTo(p[0] + 3 * k, p[1] + 2.4 * k); g.lineTo(p[0] - 3 * k, p[1] + 2.4 * k); g.closePath(); g.fill(); } else { g.beginPath(); D.ell(g, p[0], p[1], 2.8 * k, 2.8 * k); g.fill(); } } }
    }, {layer: 2});
  }; })();

/* ---------- 🗺️ the region looks: their own trees (swap) + their own town (roles) ---------- */
Object.assign(LOOKS.desert, {swap: {palm: 'datepalm', jtree: 'datepalm', mango: 'datepalm', bamboo: 'cactus', banana: 'roundcactus', bush: 'roundcactus', flowers: 'roundcactus', log: 'mesarock'},
  roles: {home: ['mudhouse', 'domehouse', 'mudhouse'], shop: 'tent', cargo: 'pots', tall: ['datepalm', 'cactus', 'datepalm', 'cactus'], small: ['roundcactus', 'mesarock', 'roundcactus', 'rock']}});
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

/* ===================== 🏜️ MOROCCO / ARABIA — caravanserai · domed forge ===================== */
(function(){ const def = IN('desert', 'inn_caravan', 'Caravanserai', {h: 112, variants: 2});
  const lattice = (g, Q, k) => { g.strokeStyle = 'rgba(122,74,34,0.75)'; g.lineWidth = 0.9 * k; for(let i = 1; i < 4; i++) line(g, Q(i / 4, 0), Q(i / 4, 13)); for(let j = 3; j < 13; j += 3.2) line(g, Q(0, j), Q(1, j)); };
  def.build = (B, v, L) => { const wall = ['#F2D8A8', '#EBCB9C'][v % 2], tile = L.accent || '#2EC4B6';
    B.box(0.06, 0.06, 0, 2.88, 1.88, 4, '#D9B87A', {layer: -1});
    const b = B.box(0.14, 0.14, 4, 2.72, 1.72, 40, wall);
    B.decal(b, 'front', 0.98, 0.76, 0, 36, wall, {paint: (g, Q, k) => {   // the horseshoe arch: tiled frame, studded door
      const arch = (sc, col) => { g.beginPath(); g.moveTo(...Q(0.5 - 0.45 * sc, 0)); g.lineTo(...Q(0.5 - 0.45 * sc, 20)); const top = Q(0.5, 20 + 15 * sc), l = Q(0.5 - 0.5 * sc, 26), r = Q(0.5 + 0.5 * sc, 26);
        g.bezierCurveTo(l[0], l[1], top[0] - 4 * k, top[1] + 3 * k, top[0], top[1]); g.bezierCurveTo(top[0] + 4 * k, top[1] + 3 * k, r[0], r[1], ...Q(0.5 + 0.45 * sc, 20)); g.lineTo(...Q(0.5 + 0.45 * sc, 0)); g.closePath(); g.fillStyle = col; g.fill(); };
      arch(1.08, tile); arch(0.86, '#2B2D42'); arch(0.6, '#8A5A2B'); g.fillStyle = '#F2C23A'; [[0.4, 6], [0.6, 6], [0.4, 14], [0.6, 14]].forEach(([u, z]) => { const p = Q(u, z); g.beginPath(); g.arc(p[0], p[1], 0.9 * k, 0, TAU); g.fill(); }); }});
    [[0.18, 'front'], [2.18, 'front'], [0.3, 'right'], [1.05, 'right']].forEach(([a, s]) => { B.decal(b, s, a, 0.34, 16, 13, '#7A4A22', {paint: lattice}); });
    B.decal(b, 'front', 0.2, 0.62, 26, 12, '#C2402A', {paint: (g, Q, k) => { ['#F2C23A', '#2E86C8', '#F4EFE4'].forEach((c, i) => { g.strokeStyle = c; g.lineWidth = 1.4 * k; line(g, Q(0, 3 + i * 3), Q(1, 3 + i * 3)); }); }});   // rug over the parapet
    for(let i = 0; i < 9; i++) B.box(0.14 + i * 0.32, 1.72, 44, 0.16, 0.14, 6, wall, {layer: 1}); for(let i = 0; i < 5; i++) B.box(2.72, 0.14 + i * 0.34, 44, 0.14, 0.16, 6, wall, {layer: 1});
    const tw = B.box(2.18, 0.2, 44, 0.48, 0.48, 26, wall); B.win(tw, 'front', 0.14, 0.2, 10, 10, {fill: tile}); B.win(tw, 'right', 0.14, 0.2, 10, 10, {fill: tile});
    B.custom(2.42, 0.44, (g, P, k) => { const d = dome(g, P, k, 2.42, 0.44, 70, 0.3, 16, tile); g.strokeStyle = '#C99A2E'; g.lineWidth = 1.6 * k; const a = [d.c[0], d.c[1] - d.hh]; line(g, a, [a[0], a[1] - 8 * k]); g.fillStyle = M.gold; g.beginPath(); g.arc(a[0], a[1] - 9 * k, 2 * k, 0, TAU); g.fill(); }, {layer: 2});
    lanternHang(B, 0.92, 1.92, 30, null, {star: true}); lanternHang(B, 1.82, 1.92, 30, null, {star: true});
    B.custom(1.35, 1.8, (g, P, k) => { [[1.05, 1.74], [1.65, 1.74]].forEach(p => { g.strokeStyle = '#5A3418'; g.lineWidth = 1.4 * k; line(g, P(p[0], p[1], 44), P(p[0], p[1], 56)); }); }, {layer: 2});
    innSign(B, 1.35, 1.74, 60, {shape: 'arch', fill: tile, ink: '#FFFFFF', w: 30, h: 15, layer: 3}); }; })();
(function(){ const def = SM('desert', 'smithy_dome', 'Domed forge', {h: 104, live: {period: 1.2, frames: 6}});
  def.build = (B, v, L) => { const wall = '#E9C891', mud = '#D9A86A';
    B.flat(0.08, 0.08, 1.84, 1.84, '#D9B87A', {fill: '#E2C48E'});
    const b = B.box(0.14, 0.12, 0, 1.72, 0.96, 30, wall); B.win(b, 'right', 0.3, 0.3, 14, 10, {fill: '#7A4A22'});
    B.custom(1.05, 0.6, (g, P, k) => { dome(g, P, k, 1.05, 0.6, 30, 0.42, 22, mud); }, {layer: 1});
    const tw = B.box(0.18, 0.16, 30, 0.42, 0.42, 42, wall); [['front', 0.08], ['front', 0.24], ['right', 0.08], ['right', 0.24]].forEach(([s, a]) => B.decal(tw, s, a, 0.1, 26, 12, '#3A2A20'));
    for(let i = 0; i < 3; i++){ B.box(0.18 + i * 0.16, 0.5, 72, 0.08, 0.08, 4, wall, {layer: 1}); B.box(0.52, 0.16 + i * 0.16, 72, 0.08, 0.08, 4, wall, {layer: 1}); }
    [[0.16, 1.78], [1.78, 1.78], [1.78, 1.12]].forEach(p => B.box(p[0], p[1], 0, 0.08, 0.08, 30, M.wood));
    B.box(0.12, 1.08, 30, 1.76, 0.84, 3, '#9A8A4A', {layer: 1}); B.custom(1, 1.5, (g, P, k) => { g.strokeStyle = '#6E8A3A'; g.lineWidth = 1.6 * k; for(let i = 0; i < 8; i++){ const x = 0.18 + i * 0.22; line(g, P(x, 1.1, 34), P(x + 0.08, 1.9, 34)); } }, {layer: 2});
    B.drum(0.55, 1.4, 0, 0.24, 14, '#C46F3A', {topFill: '#3A2A20'}); glowAt(B, 0.55, 1.4, 14, 16, '#FF7A2E', 2);
    anvil(B, 1.15, 1.42);
    B.custom(1.3, 1.6, (g, P, k) => { [[0.8, 1.6], [1.5, 1.6]].forEach(p => { const a = P(p[0], p[1], 31), c = P(p[0], p[1], 22); g.strokeStyle = '#5A3418'; g.lineWidth = 0.8 * k; line(g, a, c); g.fillStyle = '#E8B83A'; g.beginPath(); D.ell(g, c[0], c[1] + 3 * k, 3.4 * k, 3 * k); g.fill(); g.fillStyle = '#C99A2E'; g.fillRect(c[0] - 2 * k, c[1] - 0.5 * k, 4 * k, 1.2 * k); }); }, {layer: 3});   // brass pots
    smoke(B, 0.39, 0.37, 76, {period: 1.2}); }; })();

/* ---------- 🗺️ hand them out through the looks (swap keeps every town's layout: same footprint + door as 'inn' / 'smithy') ---------- */
const COUNTRY = {desert: ['inn_caravan', 'smithy_dome']};
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
const lightOf = T.lightOf;   // ip-6a: the kit one (knows a lamp is OUT)
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

/* ============================ 🏜️ MOROCCO / ARABIA ============================ */
// ⛲ mosaic well: sandstone ring with a zellige star band, a white horseshoe arch, a pulley, a clay jug on the rope, a brass cup
(function(){ const def = WELL('desert', 'well_mosaic', 'Mosaic well', {h: 66});
  def.build = (B, v, L) => { const c = L.cond, plaster = '#F4EAD8';
    B.drum(0.5, 0.5, 0, 0.38, 16, '#E9C891', {topFill: !c ? '#2EA7A0' : c.broken ? '#3A2E26' : '#A88A5A'});
    B.custom(0.5, 0.5, (g, P, k) => { const ctr = P(0.5, 0.5, 8), rx = 0.38 * HTW * k * Math.SQRT2, ry = rx / 2, cols = ['#1F8A8A', '#2E5AA8', '#FFFFFF', '#1F8A8A', '#E2B53A']; for(let i = 1; i < 18; i++){ const a = i / 18 * Math.PI, x = ctr[0] + Math.cos(a) * rx * 0.99, y = ctr[1] + Math.sin(a) * ry * 0.99, s = 2.2 * k * (0.55 + 0.45 * Math.sin(a));
        if(c && c.broken && i % 4 === 1) continue; g.fillStyle = cols[i % cols.length]; g.beginPath(); g.moveTo(x, y - s * 1.4); g.lineTo(x + s, y); g.lineTo(x, y + s * 1.4); g.lineTo(x - s, y); g.closePath(); g.fill(); } }, {layer: 1});
    [0.08, 0.84].forEach(x => B.box(x, 0.46, 0, 0.08, 0.08, 44, plaster, {layer: 1}));
    B.custom(0.5, 0.5, (g, P, k) => { const arc = (s, n) => { const out = []; for(let i = 0; i <= n; i++){ const th = -0.4 + (Math.PI + 0.8) * i / n; out.push(P(0.5 + Math.cos(th) * 0.4 * s, 0.5, 44 + Math.sin(th) * 12 * s)); } return out; };
      const o = arc(1.22, 22), inr = arc(0.92, 22); g.fillStyle = plaster; g.beginPath(); o.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); inr.reverse().forEach(q => g.lineTo(q[0], q[1])); g.closePath(); g.fill();
      g.strokeStyle = c ? '#7A8A80' : '#1F8A8A'; g.lineWidth = 1.4 * k; g.beginPath(); arc(1.07, 22).forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
      const top = P(0.5, 0.5, 58); g.fillStyle = M.gold; g.beginPath(); D.star(g, top[0], top[1], 3 * k, 1.4 * k, 8); g.fill();
      const w = P(0.5, 0.5, 52); g.fillStyle = '#5A3418'; g.beginPath(); D.ell(g, w[0], w[1], 2.4 * k, 2.4 * k); g.fill(); g.strokeStyle = '#A27A4E'; g.lineWidth = 0.9 * k; const j = P(0.5, 0.5, 26); line(g, w, [j[0], j[1] - 7 * k]);
      g.fillStyle = '#C46F3A'; g.beginPath(); g.moveTo(j[0] - 1.6 * k, j[1] - 7 * k); g.lineTo(j[0] + 1.6 * k, j[1] - 7 * k); g.bezierCurveTo(j[0] + 5 * k, j[1] - 4 * k, j[0] + 5 * k, j[1] + 2 * k, j[0], j[1] + 3 * k); g.bezierCurveTo(j[0] - 5 * k, j[1] + 2 * k, j[0] - 5 * k, j[1] - 4 * k, j[0] - 1.6 * k, j[1] - 7 * k); g.closePath(); g.fill();
      g.strokeStyle = '#F4EAD8'; g.lineWidth = 0.7 * k; line(g, [j[0] - 3.4 * k, j[1] - 2 * k], [j[0] + 3.4 * k, j[1] - 2 * k]); }, {layer: 3});
    B.custom(0.82, 0.8, (g, P, k) => { if(c && c.broken) return; const q = P(0.78, 0.8, 16); g.fillStyle = '#E2B53A'; g.beginPath(); g.moveTo(q[0] - 2.4 * k, q[1] - 4 * k); g.lineTo(q[0] + 2.4 * k, q[1] - 4 * k); g.lineTo(q[0] + 1.6 * k, q[1]); g.lineTo(q[0] - 1.6 * k, q[1]); g.closePath(); g.fill(); g.fillStyle = '#FFF2C0'; g.beginPath(); D.ell(g, q[0], q[1] - 4 * k, 2.4 * k, 0.9 * k); g.fill(); }, {layer: 2}); }; })();
// 📜 scroll board: a white plaster wall with stepped crenels, a teal horseshoe recess with rolled scrolls + wax seals, a mosaic foot, a brass star "!"
(function(){ const def = BOARD('desert', 'qboard_scroll', 'Scroll board', {h: 60});
  def.build = (B, v, L) => { const c = L.cond, pl = '#F2E2C4';
    const w = B.box(0.06, 0.42, 0, 0.88, 0.18, 34, pl);
    [0.08, 0.38, 0.68].forEach(x => { B.box(x, 0.42, 34, 0.24, 0.18, 4, pl, {layer: 1}); B.box(x + 0.06, 0.42, 38, 0.12, 0.18, 3, pl, {layer: 1}); });
    B.decal(w, 'front', 0.1, 0.8, 4, 27, '#1F6F6A', {paint: (g, Q, k) => { g.fillStyle = pl; polyP(g, [Q(0, 15), Q(0.12, 23), Q(0.3, 27), Q(0, 27)]); g.fill(); polyP(g, [Q(1, 15), Q(0.88, 23), Q(0.7, 27), Q(1, 27)]); g.fill();   // horseshoe top of the recess
      const scroll = (u, z, w2, col) => { const a = Q(u, z), b = Q(u + w2, z), a2 = Q(u, z + 7), b2 = Q(u + w2, z + 7); g.fillStyle = c && c.broken ? '#A89878' : '#F4E6C0'; polyP(g, [a, b, b2, a2]); g.fill();
        g.fillStyle = '#C9A26A'; [[a, a2], [b, b2]].forEach(([p, q]) => { g.beginPath(); D.ell(g, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 1.6 * k, 4.2 * k); g.fill(); });
        g.strokeStyle = 'rgba(90,52,24,0.55)'; g.lineWidth = 0.6 * k; line(g, Q(u + 0.04, z + 2.4), Q(u + w2 - 0.04, z + 2.4)); line(g, Q(u + 0.04, z + 4.6), Q(u + w2 - 0.06, z + 4.6));
        const s = Q(u + w2 * 0.5, z); g.fillStyle = col; g.beginPath(); D.ell(g, s[0], s[1] + 1 * k, 1.8 * k, 1.8 * k); g.fill(); };
      scroll(0.14, 13, 0.32, '#C8302A'); scroll(0.54, 15, 0.3, '#2E5AA8'); if(!(c && c.broken)) scroll(0.3, 3, 0.36, '#C8302A'); }});
    B.decal(w, 'front', 0, 0.88, 0, 3.4, '#1F8A8A', {paint: (g, Q, k) => { g.fillStyle = '#FFFFFF'; for(let i = 0; i < 9; i++){ const q = Q((i + 0.5) / 9, 1.7); g.beginPath(); g.moveTo(q[0], q[1] - 1.5 * k); g.lineTo(q[0] + 1.6 * k, q[1]); g.lineTo(q[0], q[1] + 1.5 * k); g.lineTo(q[0] - 1.6 * k, q[1]); g.closePath(); g.fill(); } }});
    B.custom(0.5, 0.62, (g, P, k) => { const q = P(0.5, 0.61, 50); g.fillStyle = c ? '#9A8A5A' : '#E2B53A'; g.beginPath(); D.star(g, q[0], q[1], 7.4 * k, 5 * k, 8); g.fill(); g.fillStyle = c ? '#7A6A4A' : '#C9902A'; g.beginPath(); D.ell(g, q[0], q[1], 4.2 * k, 4.2 * k); g.fill(); bang(g, q[0], q[1], k, {size: 9}); }, {layer: 3}); }; })();
// 🏮 brass lantern: a turned brass post, a pierced lantern with coloured glass and an onion dome, light speckles that flicker
(function(){ const def = (K.lamp || (d => d))(LAMP('desert', 'lantern_brass', 'Brass lantern', {h: 50, live: {period: 1.6, frames: 6}}));   // 💡 ip-6a lit · out
  def.build = (B, v, L) => { const c = L.cond, lv = lightOf(c);
    B.box(0.38, 0.38, 0, 0.24, 0.24, 4, '#E9C891'); B.drum(0.5, 0.5, 4, 0.05, 25, '#C9962E', {rings: 3}); B.drum(0.5, 0.5, 26, 0.09, 3, '#B07A22', {layer: 1});
    B.bill(0.5, 0.5, 29, (g, x, y, k, t) => { const f = 0.85 + 0.1 * Math.sin((t || 0) / 1.6 * TAU) + 0.06 * Math.cos((t || 0) / 1.6 * TAU), body = c ? '#9A7A3A' : '#C9962E';
      g.fillStyle = body; g.beginPath(); g.moveTo(x - 5 * k, y - 1 * k); g.lineTo(x + 5 * k, y - 1 * k); g.lineTo(x + 6 * k, y - 12 * k); g.lineTo(x - 6 * k, y - 12 * k); g.closePath(); g.fill();
      [[-4.2, '#2EA7A0'], [-0.9, '#E2453A'], [2.4, '#2EA7A0']].forEach(([dx, col], i) => { g.fillStyle = lv ? col : sh(col, -0.4); g.beginPath(); g.moveTo(x + dx * k, y - 2.5 * k); g.lineTo(x + (dx + 1.9) * k, y - 2.5 * k); g.lineTo(x + (dx + 2.1) * k, y - 10.5 * k); g.lineTo(x + (dx - 0.2) * k, y - 10.5 * k); g.closePath(); g.fill(); if(c && c.broken && i === 1){ g.fillStyle = '#2A1C14'; g.fill(); } });
      g.fillStyle = 'rgba(255,240,180,' + (0.8 * lv * f) + ')'; [[-3.2, -6], [0, -4], [3.2, -7], [0, -9]].forEach(([dx, dy]) => { g.beginPath(); D.star(g, x + dx * k, y + dy * k, 1.2 * k, 0.5 * k, 4); g.fill(); });
      g.fillStyle = body; g.beginPath(); g.moveTo(x - 6.4 * k, y - 12 * k); g.bezierCurveTo(x - 7 * k, y - 17 * k, x - 1 * k, y - 18 * k, x, y - 22 * k); g.bezierCurveTo(x + 1 * k, y - 18 * k, x + 7 * k, y - 17 * k, x + 6.4 * k, y - 12 * k); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); D.ell(g, x - 2.6 * k, y - 15.5 * k, 1.4 * k, 2.2 * k, 0.4); g.fill();
      g.strokeStyle = body; g.lineWidth = 1.1 * k; line(g, [x, y - 22 * k], [x, y - 25 * k]); g.fillStyle = body; g.beginPath(); D.ell(g, x, y - 25.6 * k, 1.3 * k, 1.3 * k); g.fill();
      g.beginPath(); g.moveTo(x - 5 * k, y - 1 * k); g.lineTo(x + 5 * k, y - 1 * k); g.lineTo(x, y + 2.5 * k); g.closePath(); g.fill(); }, {layer: 2});
    if(lv) B.bill(0.5, 0.5, 29, (g, x, y, k, t) => { const f = 0.85 + 0.1 * Math.sin((t || 0) / 1.6 * TAU) + 0.06 * Math.cos((t || 0) / 1.6 * TAU); D.glow(g, x, y - 9 * k, 20 * k * f, '#FFB84A', 0.5 * lv); }, {fx: true, layer: 9}); }; })();   // ip-6a glow = fx (no dark ring)

/* ---------- 🗺️ hand them out through the looks (same footprint + door + block as the village ones → every town keeps its plan, T6) ---------- */
const PLAZA = {desert: {well: 'well_mosaic', qboard: 'qboard_scroll', lantern: 'lantern_brass'}   // its stall = the 2 × 2 market tent (roles.shop) — a hand-placed 2 × 1 stall keeps the village one
};
Object.keys(PLAZA).forEach(lk => { const L = LOOKS[lk]; if(!L) return; const sw = {}; Object.keys(PLAZA[lk]).forEach(a => { if(DEFS[PLAZA[lk][a]]) sw[a] = PLAZA[lk][a]; }); L.swap = Object.assign({}, L.swap || {}, sw); });
})();
K.loaded('desert', 'ip-6a');
})(window.Props && window.Props._K);
