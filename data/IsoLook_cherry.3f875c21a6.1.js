
/* 🌍 IsoLook_cherry — 🌸 cherry → 🇯🇵 Japan — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['cherry'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/cherry.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_cherry: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🌸 cherry → 🇯🇵 Japan (ip-4a split from the ip-3 files 22–27; each part below is the old file's own IIFE).
   Built into IsoLook_cherry.html by build_isoprops.py; runs after the engine with Props._K (kit insides). */
/* 🗾🏜️❄️ IsoProps — region sets (ip-3, 🌳 IsoProps chat, 2026-11-17): cherry · desert · snow. Same 14 rules as the starter catalogue:
   corners = iso parts on the grid · tile light · ONE rim from the bake (painters draw none) · organic = billboards on a 2 : 1 shadow · no emoji ·
   variants by seed · front = +y, turn rebuilds · 🍂 conditions through the core fallback (or a prop's own conds). Each prop's home look = its set
   (def.look) so a catalogue card shows it dressed right; any map can still place it with its own look. */
(function(){   // 🗾🏜️❄️ region sets
'use strict';
const D = PD, M = MAT, TAU = Math.PI * 2;
const piece = (g, parts) => D.piece(g, parts, '#000', 0);
const S = (set, o) => addSet(set, o);
S('cherry', {name: 'Cherry', icon: '🌸', accent: '#FF8FB0'});
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

/* ================= 🌸 CHERRY ================= */
const CA = own('cherry', 'cherry'), CO = org('cherry', 'cherry');
const BLOS = [['#FFB7CF', '#FF8FB0', '#FFDCE8'], ['#FFF2F6', '#F2C6D4', '#FFFFFF'], ['#FF86B0', '#E4508A', '#FFB0CC']];
function crown(g, list, c){ piece(g, [{path: g => list.forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }), fill: g => D.rad(g, -6, -64, 3, 44, [c[2], c[0], c[1]])}]); }
CO('blossom', {name: 'Blossom tree', h: 74, variants: 3, tags: ['tree', 'flower']}, (g, x, y, k, t, v) => { const c = BLOS[v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { g.moveTo(-6, 0); g.quadraticCurveTo(-2, -14, -6, -28); g.lineTo(-17, -40); g.lineTo(-13, -43); g.lineTo(-3, -33); g.quadraticCurveTo(2, -37, 9, -47); g.lineTo(13, -45); g.lineTo(5, -30); g.quadraticCurveTo(3, -14, 7, 0); g.lineTo(11, 2); g.lineTo(-11, 2); g.closePath(); }, fill: g => D.lin(g, -6, 0, 8, 0, ['#7A5240', '#4A2E24'])}]);
  crown(g, [[-18, -47, 13], [16, -50, 13], [0, -60, 15], [-6, -44, 12], [8, -41, 11], [-27, -39, 9], [25, -41, 9]], c);
  const R = D.rnd(7 + v); for(let i = 0; i < 24; i++){ g.fillStyle = i % 3 ? '#FFFFFF' : c[1]; g.globalAlpha = 0.85; g.beginPath(); D.ell(g, (R() - 0.5) * 52, -34 - R() * 34, 1.7, 1.3); g.fill(); } g.globalAlpha = 1;
  g.fillStyle = c[1]; [[-21, -14], [15, -20], [22, -7]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 2.2, 1.3, 0.6); g.fill(); }); g.restore(); });
CO('maple', {name: 'Maple', h: 68, variants: 2, tags: ['tree', 'autumn']}, (g, x, y, k, t, v) => { const c = [['#E2553A', '#B8321F', '#FF9A6A'], ['#F2A23A', '#D9772A', '#FFD07A']][v % 2]; g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { g.moveTo(-5, 0); g.lineTo(-3, -30); g.lineTo(3, -30); g.lineTo(5, 0); g.lineTo(9, 2); g.lineTo(-9, 2); g.closePath(); }, fill: '#6A4630'}]);
  piece(g, [{path: g => { for(let i = 0; i < 9; i++){ const a = i / 9 * TAU, px = Math.cos(a) * 17, py = -44 + Math.sin(a) * 15; D.star(g, px, py, 10, 6, 5, a); } D.star(g, 0, -46, 16, 10, 5); }, fill: g => D.rad(g, -6, -58, 3, 34, [c[2], c[0], c[1]])}]);
  g.fillStyle = c[0]; [[-19, -10], [13, -6]].forEach(p => { g.beginPath(); D.star(g, p[0], p[1], 3, 1.8, 5); g.fill(); }); g.restore(); });
CO('petalbush', {name: 'Azalea bush', h: 28, kind: 'bush', variants: 2, tags: ['plant', 'flower']}, (g, x, y, k, t, v) => { const fl = ['#FF8FB0', '#FFFFFF'][v % 2]; g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { [[-11, -9, 10], [10, -10, 10], [0, -16, 12]].forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }); g.rect(-19, -9, 38, 9); }, fill: g => D.rad(g, -4, -22, 2, 24, ['#6CC060', '#3F9A3E', '#2E7A30'])}]);
  const R = D.rnd(19 + v); g.fillStyle = fl; for(let i = 0; i < 14; i++){ g.beginPath(); D.ell(g, (R() - 0.5) * 34, -3 - R() * 22, 2.4, 2); g.fill(); } g.fillStyle = '#FF5A8A'; g.beginPath(); D.ell(g, -4, -17, 1, 1); g.fill(); g.restore(); });
// 🏠 town house (machiya): stone base · dark wood ground floor with slatted fronts · eave skirt · white upper floor · curved tiled roof
(function(){ const def = CA('machiya', {name: 'Town house', foot: [2, 2], h: 92, variants: 4, door: [1, 2], tags: ['house', 'home']});
  const slats = (g, Q, k) => { g.strokeStyle = '#D9B48A'; g.lineWidth = 1.1 * k; for(let i = 1; i < 7; i++){ const a = Q(i / 7, 1), b = Q(i / 7, 23); line(g, a, b); } };
  def.build = (B, v, L) => { const wall = L.walls[v % L.walls.length], roof = L.roofs[v % L.roofs.length], wood = v % 2 ? '#6A4630' : '#7A5238';
    B.box(0.1, 0.1, 0, 1.8, 1.8, 4, M.stone);
    const b = B.box(0.15, 0.15, 4, 1.7, 1.7, 34, wood);
    B.decal(b, 'front', 0.22, 0.5, 4, 24, '#4A3022', {paint: slats}); B.door(b, 'front', 0.8, 0.42, 30, {fill: '#3B2A2A'}); B.decal(b, 'front', 1.3, 0.48, 4, 24, '#4A3022', {paint: slats});
    B.decal(b, 'right', 0.3, 1.2, 6, 20, '#4A3022', {paint: slats});
    B.roof(0.15, 0.15, 38, 1.7, 1.7, 7, roof, {kind: 'hip', ov: 0.2});
    const u = B.box(0.32, 0.32, 41, 1.36, 1.36, 20, wall); B.win(u, 'front', 0.48, 0.28, 6, 9); B.win(u, 'front', 1.2, 0.28, 6, 9); B.win(u, 'right', 0.7, 0.4, 6, 9);
    B.roof(0.32, 0.32, 61, 1.36, 1.36, 26, roof, {ov: 0.3, ridge: v % 2 ? 'y' : 'x', finials: !!L.curve});
    if(v >= 2) B.custom(1, 2, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; const a = P(1, 1.88, 36), w = 7 * k; g.fillStyle = '#E2553A'; g.beginPath(); D.ell(g, a[0], a[1], w * 0.8, w); g.fill(); g.fillStyle = '#FFE58A'; g.beginPath(); D.ell(g, a[0], a[1], w * 0.5, w * 0.6); g.fill(); g.fillStyle = '#2A1C14'; g.fillRect(a[0] - 1 * k, a[1] - w - 3 * k, 2 * k, 3 * k); }, {layer: 2});   // a paper lantern by the door
  }; })();
// 🍵 tea house: raised deck · posts · paper walls set back (a veranda in front) · big hip roof
(function(){ const def = CA('teahouse', {name: 'Tea house', foot: [2, 2], h: 84, variants: 3, door: [1, 2], tags: ['house', 'home', 'rest']});
  const shoji = (g, Q, k) => { g.strokeStyle = 'rgba(90,58,38,0.55)'; g.lineWidth = 1 * k; for(let i = 1; i < 6; i++) line(g, Q(i / 6, 0), Q(i / 6, 26)); for(let j = 1; j < 4; j++) line(g, Q(0, j * 6.5), Q(1, j * 6.5)); };
  def.build = (B, v, L) => { const roof = L.roofs[v % L.roofs.length];
    B.box(0, 0, 0, 2, 2, 8, '#8A5A3A');
    [[0.06, 0.06], [1.8, 0.06], [0.06, 1.8], [1.8, 1.8]].forEach(p => B.box(p[0], p[1], 8, 0.14, 0.14, 30, '#5A3A26'));
    const b = B.box(0.32, 0.3, 8, 1.36, 1.2, 30, '#FFF8EC');
    B.decal(b, 'front', 0.36, 1.28, 1, 27, '#FFF8EC', {paint: shoji}); B.decal(b, 'right', 0.34, 1.12, 1, 27, '#FFF8EC', {paint: shoji}); B.door(b, 'front', 0.82, 0.36, 26, {fill: '#E9DCC6'});
    B.box(0.75, 1.95, 0, 0.5, 0.25, 4, M.stone);   // step stone
    B.roof(0, 0, 38, 2, 2, 38, roof, {kind: 'hip', ov: 0.26});
    B.drum(1, 1, 74, 0.06, 6, M.gold, {layer: 1});
  }; })();
// ⛩️ pagoda: three red storeys, each with its own wide skirt roof, gold spire with rings
(function(){ const def = CA('pagoda', {name: 'Pagoda', foot: [2, 2], h: 126, variants: 2, door: [1, 2], tags: ['temple', 'big', 'tower']});
  def.build = (B, v, L) => { const red = ['#C8322A', '#B8462A'][v % 2], roof = L.roofs[0];
    B.box(0.08, 0.08, 0, 1.84, 1.84, 5, M.stone);
    const b1 = B.box(0.32, 0.32, 5, 1.36, 1.36, 24, red); B.door(b1, 'front', 0.8, 0.4, 20, {fill: '#3B2A2A'}); B.win(b1, 'right', 0.85, 0.3, 9, 9);
    B.roof(0.32, 0.32, 29, 1.36, 1.36, 12, roof, {kind: 'hip', ov: 0.34});
    const b2 = B.box(0.52, 0.52, 35, 0.96, 0.96, 17, red); B.win(b2, 'front', 0.86, 0.28, 5, 8); B.win(b2, 'right', 0.86, 0.28, 5, 8);
    B.roof(0.52, 0.52, 52, 0.96, 0.96, 10, roof, {kind: 'hip', ov: 0.3});
    const b3 = B.box(0.66, 0.66, 57, 0.68, 0.68, 13, red);
    B.roof(0.66, 0.66, 70, 0.68, 0.68, 22, roof, {kind: 'hip', ov: 0.28});
    B.custom(1, 1, (g, P, k) => { const a = P(1, 1, 86), b = P(1, 1, 118); g.strokeStyle = '#C99A2E'; g.lineWidth = 2.6 * k; line(g, a, b);
      g.fillStyle = M.gold; for(let i = 0; i < 4; i++){ const q = P(1, 1, 92 + i * 6); g.beginPath(); D.ell(g, q[0], q[1], (5 - i * 0.7) * k, 1.8 * k); g.fill(); } g.beginPath(); D.ell(g, b[0], b[1], 2.4 * k, 2.8 * k); g.fill(); }, {layer: 3});
  }; })();
(function(){ const def = CA('stonelantern', {name: 'Stone lantern', foot: [1, 1], h: 44, kind: 'post', block: false, tags: ['light', 'stone']});   /* like every light post: taken, not a wall (a blocking lantern cut a shop off its road in cherry towns) */
  def.build = (B) => { const st = '#BDB6A2';
    B.box(0.3, 0.3, 0, 0.4, 0.4, 5, st); B.box(0.41, 0.41, 5, 0.18, 0.18, 14, st); B.box(0.33, 0.33, 19, 0.34, 0.34, 4, st);
    const f = B.box(0.37, 0.37, 23, 0.26, 0.26, 9, st); B.decal(f, 'front', 0.43, 0.14, 2, 6, '#FFD35A'); B.decal(f, 'right', 0.43, 0.14, 2, 6, '#FFD35A');
    B.roof(0.3, 0.3, 32, 0.4, 0.4, 7, st, {kind: 'hip', ov: 0.12}); B.drum(0.5, 0.5, 39, 0.05, 4, st, {layer: 1}); }; })();
// ⛩️ arch gate: two red pillars (posts block, the middle is the way through), black top beam with lifted ends
(function(){ const def = CA('archgate', {name: 'Arch gate', foot: [3, 1], h: 84, kind: 'gate', door: [1.5, 1], block: 'posts', variants: 2, tags: ['entrance', 'shrine']});
  def.build = (B, v) => { const red = ['#D8322A', '#E06A2A'][v % 2];
    [0.32, 2.38].forEach(x => { B.box(x - 0.06, 0.29, 0, 0.42, 0.42, 7, '#2A2A2A'); B.box(x, 0.35, 7, 0.3, 0.3, 62, red); });
    B.box(0.12, 0.42, 54, 2.76, 0.16, 6, red);
    B.box(1.38, 0.42, 60, 0.24, 0.16, 9, red, {layer: 1});
    B.box(0.02, 0.38, 69, 2.96, 0.24, 5, red);
    B.custom(1.5, 0.5, (g, P, k) => { const a = P(-0.14, 0.5, 74), b = P(3.14, 0.5, 74), m = P(1.5, 0.5, 74); g.fillStyle = '#2A2A2A'; g.beginPath(); g.moveTo(a[0], a[1] - 5 * k);
      g.quadraticCurveTo(m[0], m[1] + 1 * k, b[0], b[1] - 5 * k); g.lineTo(b[0], b[1] + 2 * k); g.quadraticCurveTo(m[0], m[1] + 8 * k, a[0], a[1] + 2 * k); g.closePath(); g.fill(); }, {layer: 2});
  }; })();
(function(){ const def = CA('koipond', {name: 'Koi pond', foot: [2, 2], h: 16, kind: 'thing', organic: true, shadowA: 0.08, tags: ['water', 'garden']});
  def.build = (B, v, L) => B.custom(1, 1, (g, P, k) => { const m = pool(g, P, k, 1, 1, 0.82, '#A9A291', ['#4FB8DE', '#2E86B8'], L.cond); if(!L.cond)
    [['#FF8A2A', -8, -2, 0.4], ['#FFFFFF', 7, 3, -0.5], ['#E2553A', 2, -6, 2.6]].forEach(f => { g.save(); g.translate(m[0] + f[1] * k, m[1] + f[2] * k); g.rotate(f[3]); g.fillStyle = f[0]; g.beginPath(); D.ell(g, 0, 0, 5 * k, 2 * k); g.fill(); g.beginPath(); g.moveTo(-5 * k, 0); g.lineTo(-8 * k, -2 * k); g.lineTo(-8 * k, 2 * k); g.closePath(); g.fill(); g.restore(); });
    if(!L.cond){ g.fillStyle = '#5DB84A'; [[-14, 4], [12, -5]].forEach(p => { g.beginPath(); g.moveTo(m[0] + p[0] * k, m[1] + p[1] * k); g.arc(m[0] + p[0] * k, m[1] + p[1] * k, 4 * k, 0.4, TAU - 0.2); g.closePath(); g.fill(); }); }
    const R = D.rnd(5); for(let i = 0; i < 14; i++){ const a = i / 14 * TAU, q = P(1 + Math.cos(a) * 0.86, 1 + Math.sin(a) * 0.86, 0); g.fillStyle = D.sh('#BDB6A2', (R() - 0.5) * 0.3); g.beginPath(); D.ell(g, q[0], q[1] - 2 * k, (4 + R() * 3) * k, (3 + R()) * k); g.fill(); } }); })();
// 🌉 arched bridge over a stream (bridges may stand on water)
(function(){ const def = CA('archbridge', {name: 'Arched bridge', foot: [3, 1], h: 40, kind: 'bridge', block: false, tags: ['bridge', 'water']});
  def.build = (B) => B.custom(1.5, 0.5, (g, P, k, t, T) => { const N = 16, zf = u => 4 + 20 * Math.sin(Math.PI * u), X = u => -0.05 + u * 3.1;
    const rail = (y) => { g.strokeStyle = '#D8322A'; g.lineWidth = 2.4 * k; g.beginPath(); for(let i = 0; i <= N; i++){ const q = P(X(i / N), y, zf(i / N) + 12); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
      g.lineWidth = 2 * k; for(let i = 1; i < N; i += 3){ const a = P(X(i / N), y, zf(i / N)), b = P(X(i / N), y, zf(i / N) + 12); line(g, a, b); } };
    const fr = vis(T, 0, 1) ? 0.84 : 0.16, bk = fr > 0.5 ? 0.16 : 0.84;
    rail(bk);
    g.beginPath(); for(let i = 0; i <= N; i++){ const q = P(X(i / N), 0.16, zf(i / N)); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } for(let i = N; i >= 0; i--){ const q = P(X(i / N), 0.84, zf(i / N)); g.lineTo(q[0], q[1]); } g.closePath(); g.fillStyle = '#E2B07A'; g.fill(); g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = k; g.stroke();
    g.beginPath(); for(let i = 0; i <= N; i++){ const q = P(X(i / N), fr, zf(i / N)); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } for(let i = N; i >= 0; i--){ const q = P(X(i / N), fr, zf(i / N) - 5); g.lineTo(q[0], q[1]); } g.closePath(); g.fillStyle = '#C8322A'; g.fill();
    rail(fr); }); })();

/* ---------- 🗺️ the region looks: their own trees (swap) + their own town (roles) ---------- */
Object.assign(LOOKS.cherry, {swap: {palm: 'blossom', jtree: 'blossom', mango: 'maple', banana: 'petalbush', bush: 'petalbush'},
  roles: {home: ['machiya', 'teahouse', 'machiya'], light: 'stonelantern', tall: ['blossom', 'maple', 'blossom', 'bamboo', 'blossom'], small: ['petalbush', 'petalbush', 'flowers', 'rock', 'flowers']}});
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

/* ===================== 🌸 JAPAN — ryokan · katana forge ===================== */
(function(){ const def = IN('cherry', 'inn_ryokan', 'Ryokan', {h: 112, variants: 2});
  const shoji = (g, Q, k) => { g.strokeStyle = 'rgba(90,58,38,0.55)'; g.lineWidth = 1 * k; for(let i = 1; i < 12; i++) line(g, Q(i / 12, 0), Q(i / 12, 22)); for(let j = 1; j < 4; j++) line(g, Q(0, j * 5.5), Q(1, j * 5.5)); };
  def.build = (B, v, L) => { const roof = ['#3E4A6B', '#5A6E8C'][v % 2], wood = '#6A4630', wall = L.walls ? L.walls[v % L.walls.length] : '#FFF3E8';
    B.box(0.06, 0.06, 0, 2.88, 1.88, 4, M.stone, {layer: -1});
    B.box(0.1, 1.5, 4, 2.8, 0.44, 4, '#B9824C', {layer: -1});
    const b = B.box(0.18, 0.18, 4, 2.64, 1.32, 30, wood);
    B.decal(b, 'front', 0.12, 0.84, 4, 22, '#FFF6E4', {paint: shoji}); B.decal(b, 'front', 1.68, 0.84, 4, 22, '#FFF6E4', {paint: shoji}); B.decal(b, 'right', 0.15, 1.02, 4, 22, '#FFF6E4', {paint: shoji});
    B.decal(b, 'front', 1.0, 0.62, 0, 28, '#3A2A20');
    B.decal(b, 'front', 1.0, 0.62, 12, 16, '#2E3A6E', {paint: (g, Q, k) => { g.strokeStyle = '#F4EFE4'; g.lineWidth = 0.8 * k; [1 / 3, 2 / 3].forEach(u => line(g, Q(u, 2), Q(u, 16))); const c = Q(0.5, 9); g.beginPath(); D.ell(g, c[0], c[1], 3 * k, 3 * k); g.stroke(); }});   // the noren curtain
    [[0.14, 1.86], [1.0, 1.86], [1.98, 1.86], [2.82, 1.86]].forEach(p => B.box(p[0], p[1], 8, 0.08, 0.08, 26, wood, {layer: 1}));
    B.roof(0.1, 0.12, 34, 2.8, 1.8, 9, roof, {kind: 'hip', ov: 0.16});
    const u = B.box(0.4, 0.34, 43, 2.2, 1.04, 24, wall); B.decal(u, 'front', 0.2, 0.7, 4, 16, '#FFF6E4', {paint: shoji}); B.decal(u, 'front', 1.3, 0.7, 4, 16, '#FFF6E4', {paint: shoji}); B.win(u, 'right', 0.3, 0.44, 6, 10);
    B.custom(1.5, 1.4, (g, P, k) => { g.strokeStyle = '#7A4A2E'; g.lineWidth = 1.2 * k; line(g, P(0.4, 1.42, 52), P(2.6, 1.42, 52)); for(let x = 0.45; x <= 2.58; x += 0.2) line(g, P(x, 1.42, 44), P(x, 1.42, 52)); }, {layer: 2});
    B.roof(0.4, 0.34, 67, 2.2, 1.04, 30, roof, {ov: 0.3, ridge: 'x', finials: true, stripes: 9});
    lanternHang(B, 0.3, 1.95, 32, '#E2453A'); lanternHang(B, 2.7, 1.95, 32, '#E2453A');
    B.drum(2.72, 1.72, 4, 0.12, 6, M.stone, {topFill: '#3A8FBF', layer: 1});
    innSign(B, 1.5, 1.96, 50, {fill: '#3B2A2A', ink: '#FFF6E4', w: 30, h: 14, r: 2, layer: 3}); }; })();
(function(){ const def = SM('cherry', 'smithy_katana', 'Katana forge', {h: 104, live: {period: 1.2, frames: 6}});
  def.build = (B, v, L) => { const roof = L.roofs ? L.roofs[0] : '#3E4A6B', wood = '#5A3E2E';
    B.flat(0.08, 0.08, 1.84, 1.84, '#9A8A70', {fill: '#B9AE96'});
    B.box(0.12, 0.12, 0, 1.76, 0.12, 38, '#C9A27A', {trim: 9}); B.box(0.12, 0.24, 0, 0.12, 1.64, 38, '#C9A27A', {trim: 9});
    [[0.12, 1.78], [1.78, 1.78], [1.78, 0.12]].forEach(p => B.box(p[0], p[1], 0, 0.1, 0.1, 38, wood));
    B.custom(1, 0.2, (g, P, k) => { g.lineCap = 'round'; [0.55, 0.85, 1.15].forEach((x, i) => { const a = P(x, 0.25, 30), b = P(x + 0.35, 0.25, 33); g.strokeStyle = '#2A1C14'; g.lineWidth = 2.6 * k; line(g, a, P(x + 0.1, 0.25, 31));
      g.strokeStyle = '#DCE2EA'; g.lineWidth = 1.8 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 2 * k, b[0], b[1]); g.stroke(); }); }, {layer: 1});   // blades on the rack
    B.box(0.3, 0.38, 0, 0.66, 0.56, 16, '#C9A27A', {topFill: '#3A2A20'}); glowAt(B, 0.63, 0.66, 16, 18, '#FF7A2E', 2);
    B.box(1.05, 0.34, 0, 0.6, 0.32, 12, M.wood, {trim: 6}); B.box(1.62, 0.44, 6, 0.18, 0.06, 2, M.dark, {layer: 1});   // the box bellows + handle
    anvil(B, 0.9, 1.2);
    B.roof(0.04, 0.04, 38, 1.92, 1.92, 24, roof, {kind: 'hip', ov: 0.18, layer: 3});
    B.box(0.78, 0.78, 59, 0.44, 0.44, 5, wood, {layer: 4}); B.roof(0.74, 0.74, 64, 0.52, 0.52, 10, roof, {ov: 0.1, ridge: 'x', layer: 4, finials: true});
    B.custom(1, 1.9, (g, P, k, t, T) => { const a = P(0.15, 1.86, 34), c = P(1.85, 1.86, 34), m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 + 4 * k];   // shimenawa rope + paper zigzags
      g.strokeStyle = '#D9C28A'; g.lineWidth = 3.2 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1] + 4 * k, c[0], c[1]); g.stroke();
      g.strokeStyle = 'rgba(120,90,40,0.5)'; g.lineWidth = 0.8 * k; for(let i = 1; i < 10; i++){ const f = i / 10, x = a[0] + (c[0] - a[0]) * f, y = a[1] + (c[1] - a[1]) * f + Math.sin(f * Math.PI) * 6 * k; line(g, [x - 1.5 * k, y - 1.2 * k], [x + 1.5 * k, y + 1.2 * k]); }
      g.fillStyle = '#FFFFFF'; [0.3, 0.5, 0.7].forEach(f => { const x = a[0] + (c[0] - a[0]) * f, y = a[1] + (c[1] - a[1]) * f + Math.sin(f * Math.PI) * 6 * k + 1.5 * k; g.beginPath(); g.moveTo(x - 1.6 * k, y); g.lineTo(x + 1.6 * k, y); g.lineTo(x - 0.4 * k, y + 3.4 * k); g.lineTo(x + 2 * k, y + 3.4 * k); g.lineTo(x - 0.8 * k, y + 7.4 * k); g.lineTo(x - 1.6 * k, y + 3.6 * k); g.closePath(); g.fill(); }); }, {layer: 4});
    smoke(B, 1.0, 1.0, 76, {period: 1.2}); }; })();

/* ---------- 🗺️ hand them out through the looks (swap keeps every town's layout: same footprint + door as 'inn' / 'smithy') ---------- */
const COUNTRY = {cherry: ['inn_ryokan', 'smithy_katana']};
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

/* ============================ 🌸 JAPAN ============================ */
// ⛲ ido well: round stone curb, a wooden # frame (igeta), a pulley on a beam, two buckets, a small tiled roof
(function(){ const def = WELL('cherry', 'well_ido', 'Ido well', {h: 64});
  def.build = (B, v, L) => { const c = L.cond, wood = '#8E6A44';
    B.drum(0.5, 0.5, 0, 0.34, 11, '#A39E92', {rings: 2, topFill: !c ? '#2E5A7A' : c.broken ? '#3A2E26' : '#6A5A40'});
    B.box(0.08, 0.26, 11, 0.84, 0.08, 4, wood, {layer: 1}); B.box(0.08, 0.66, 11, 0.84, 0.08, 4, wood, {layer: 1}); B.box(0.26, 0.08, 11, 0.08, 0.84, 4, wood, {layer: 1}); B.box(0.66, 0.08, 11, 0.08, 0.84, 4, wood, {layer: 1});
    [0.06, 0.86].forEach(x => B.box(x, 0.46, 0, 0.08, 0.08, 44, '#5A3418', {layer: 1}));
    B.box(0.02, 0.45, 40, 0.96, 0.1, 4, '#5A3418', {layer: 2});
    B.custom(0.5, 0.5, (g, P, k) => { const w = P(0.5, 0.5, 36); g.fillStyle = '#C99257'; g.beginPath(); D.ell(g, w[0], w[1], 3.6 * k, 3.6 * k); g.fill(); g.strokeStyle = '#5A3418'; g.lineWidth = 0.8 * k; for(let i = 0; i < 4; i++){ const a = i * Math.PI / 4; line(g, [w[0] - Math.cos(a) * 3.4 * k, w[1] - Math.sin(a) * 3.4 * k], [w[0] + Math.cos(a) * 3.4 * k, w[1] + Math.sin(a) * 3.4 * k]); }
      g.strokeStyle = '#A27A4E'; g.lineWidth = 0.9 * k; const bk = P(0.5, 0.5, 20); line(g, [w[0] - 3.4 * k, w[1]], [bk[0] - 3 * k, bk[1] - 6 * k]); line(g, [w[0] + 3.4 * k, w[1]], [w[0] + 3.4 * k, w[1] + 8 * k]);
      g.fillStyle = '#C99257'; g.beginPath(); g.moveTo(bk[0] - 4 * k, bk[1] - 6 * k); g.lineTo(bk[0] + 4 * k, bk[1] - 6 * k); g.lineTo(bk[0] + 3.2 * k, bk[1]); g.lineTo(bk[0] - 3.2 * k, bk[1]); g.closePath(); g.fill(); g.strokeStyle = '#2A1C14'; g.lineWidth = 0.8 * k; line(g, [bk[0] - 3.8 * k, bk[1] - 4.5 * k], [bk[0] + 3.8 * k, bk[1] - 4.5 * k]); line(g, [bk[0] - 3.4 * k, bk[1] - 1.5 * k], [bk[0] + 3.4 * k, bk[1] - 1.5 * k]); }, {layer: 3});
    B.drum(0.78, 0.84, 15, 0.09, 8, '#C99257', {rings: 2, topFill: c ? '#7A6A50' : '#7CC3E8', layer: 2});
    B.roof(-0.02, 0.28, 44, 1.04, 0.44, 12, '#3E4A6B', {ridge: 'x', ov: 0.12, stripes: 6, layer: 3});
    onigawara(B, -0.12, 1.12, 0.5, 56, '#2C344C'); }; })();
// 🛒 yatai food cart: wooden cart on two big wheels, noren curtains, red paper lanterns, a steaming pot
(function(){ const def = STALL('cherry', 'stall_yatai', 'Yatai food cart', {h: 70, tags: ['shop', 'stall', 'food'], live: {period: 1.4, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, nor = ['#2B3A67', '#B5172A', '#2E6B4F'][v % 3], lv = lightOf(c);
    const b = B.box(0.22, 0.24, 8, 1.56, 0.6, 22, '#B98A5E', {trim: 0});
    B.decal(b, 'front', 0, 1.56, 0, 22, '#B98A5E', {paint: (g, Q, k) => { g.strokeStyle = 'rgba(70,40,18,0.45)'; g.lineWidth = 1 * k; for(let i = 1; i < 10; i++) line(g, Q(i / 10, 1), Q(i / 10, 21)); g.fillStyle = '#5A3418'; polyP(g, [Q(0, 17), Q(1, 17), Q(1, 21), Q(0, 21)]); g.fill(); }});
    B.box(0.12, 0.16, 30, 1.76, 0.76, 3, '#7A4A26', {layer: 1});
    B.custom(1, 0.5, (g, P, k, t, T) => { const side = vis(T, 1, 0) ? 1.84 : vis(T, -1, 0) ? 0.16 : null; if(side == null) return; const cz = 13, R = 12, ry = 0.36;
      g.fillStyle = '#6E4024'; g.beginPath(); for(let i = 0; i <= 20; i++){ const a = i / 20 * TAU, q = P(side, 0.54 + Math.cos(a) * ry, cz + Math.sin(a) * R); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.closePath(); g.fill();
      g.fillStyle = '#C99257'; g.beginPath(); for(let i = 0; i <= 20; i++){ const a = i / 20 * TAU, q = P(side, 0.54 + Math.cos(a) * ry * 0.78, cz + Math.sin(a) * R * 0.78); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.closePath(); g.fill();
      g.strokeStyle = '#6E4024'; g.lineWidth = 1.2 * k; for(let i = 0; i < 4; i++){ const a = i * Math.PI / 4; line(g, P(side, 0.54 + Math.cos(a) * ry * 0.78, cz + Math.sin(a) * R * 0.78), P(side, 0.54 - Math.cos(a) * ry * 0.78, cz - Math.sin(a) * R * 0.78)); }
      const h = P(side, 0.54, cz); g.fillStyle = '#5A3418'; g.beginPath(); D.ell(g, h[0], h[1], 2.2 * k, 2.2 * k); g.fill(); }, {layer: 2});
    [[0.14, 0.18], [1.78, 0.18], [0.14, 0.8], [1.78, 0.8]].forEach(p => B.box(p[0], p[1], 33, 0.07, 0.07, 19, '#5A3418', {layer: 1}));
    B.drum(1.38, 0.48, 33, 0.17, 8, '#8E8A82', {topFill: c ? '#6A6058' : '#E8D9B0', layer: 2});
    B.custom(1, 0.5, (g, P, k, t) => { [[0.42, 0.55], [0.7, 0.62]].forEach(([x, y]) => { const q = P(x, y, 33); g.fillStyle = '#B5172A'; g.beginPath(); g.ellipse(q[0], q[1] - 1 * k, 3.8 * k, 1.8 * k, 0, 0, Math.PI); g.fill(); g.fillStyle = '#F4EFE4'; g.beginPath(); D.ell(g, q[0], q[1] - 1 * k, 3.8 * k, 1.4 * k); g.fill(); });
      }, {layer: 3});
    B.custom(1.38, 0.9, (g, P, k, t) => { if(c) return; const s = P(1.38, 0.86, 38); steam(g, s[0], s[1], k, t, 1.4); }, {layer: 6});
    B.roof(0.0, 0.06, 52, 2.0, 0.88, 12, '#4A3428', {ridge: 'x', ov: 0.1, stripes: 9, layer: 4});
    B.custom(1, 0.98, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; const n = 4; for(let i = 0; i < n; i++){ const u0 = 0.18 + i * 1.64 / n + 0.02, u1 = 0.18 + (i + 1) * 1.64 / n - 0.02, a = P(u0, 1.0, 51), b = P(u1, 1.0, 51), d = P(u1, 1.0, c && c.broken && i === 2 ? 46 : 40), e = P(u0, 1.0, 40);
        g.fillStyle = nor; polyP(g, [a, b, d, e]); g.fill(); if(i === 1 || i === 2){ const m = P((u0 + u1) / 2 + (i === 1 ? 0.2 : -0.2), 1.0, 46); g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); D.ell(g, m[0], m[1], 3 * k, 2.6 * k); g.fill(); g.fillStyle = nor; g.beginPath(); D.ell(g, m[0], m[1], 1.5 * k, 1.3 * k); g.fill(); } } }, {layer: 5});
    B.custom(1, 1, (g, P, k) => { [[0.0, 1.02], [2.0, 1.02]].forEach(([x, y]) => { const q = P(x, y, 44); chochin(g, q[0], q[1], k, '#E2453A', lv); }); }, {layer: 6}); }; })();
// 📜 ema board: vermilion posts, a little green copper roof, rows of wooden ema plaques, paper fortunes tied below, a red ema with the "!"
(function(){ const def = BOARD('cherry', 'qboard_ema', 'Ema board', {h: 62});
  def.build = (B, v, L) => { const c = L.cond, ver = '#D2452E';
    [0.08, 0.84].forEach(x => B.box(x, 0.46, 0, 0.08, 0.08, 42, ver));
    B.box(0.04, 0.46, 37, 0.92, 0.08, 4, ver, {layer: 1}); B.box(0.08, 0.48, 26, 0.84, 0.04, 2, '#5A3418', {layer: 1}); B.box(0.08, 0.48, 14, 0.84, 0.04, 2, '#5A3418', {layer: 1});
    B.custom(0.5, 0.56, (g, P, k) => { const R = rnd(5), marks = ['sun', 'flower', 'wave', 'heart'];
      [[26, 5], [14, 5]].forEach(([z, n], row) => { for(let i = 0; i < n; i++){ if(c && c.broken && (i + row) % 3 === 1) continue; const q = P(0.16 + i * 0.17, 0.53, z), x = q[0], y = q[1] + 1 * k, sw = (R() - 0.5) * 0.25;
        g.save(); g.translate(x, y); g.rotate(sw); g.fillStyle = c ? '#C9B48A' : '#EAD3A8'; g.beginPath(); g.moveTo(-4 * k, 1 * k); g.lineTo(0, -1.6 * k); g.lineTo(4 * k, 1 * k); g.lineTo(4 * k, 7 * k); g.lineTo(-4 * k, 7 * k); g.closePath(); g.fill();
        g.strokeStyle = '#B5172A'; g.lineWidth = 0.7 * k; line(g, [0, -1.6 * k], [0, -3 * k]); const m = marks[(i + row * 2) % 4]; g.fillStyle = m === 'sun' ? '#E2453A' : m === 'flower' ? '#FF8FB0' : m === 'wave' ? '#3A6EA5' : '#E2453A';
        if(m === 'wave'){ g.strokeStyle = g.fillStyle; g.lineWidth = 0.8 * k; g.beginPath(); g.arc(-1.4 * k, 4 * k, 1.4 * k, Math.PI, 0); g.arc(1.4 * k, 4 * k, 1.4 * k, Math.PI, 0); g.stroke(); } else { g.beginPath(); D.ell(g, 0, 3.8 * k, 1.7 * k, 1.7 * k); g.fill(); }
        g.restore(); } });
      const f = P(0.5, 0.5, 5); g.strokeStyle = '#8A7A6A'; g.lineWidth = 0.6 * k; line(g, P(0.12, 0.5, 6), P(0.88, 0.5, 6)); if(!c) for(let i = 0; i < 6; i++){ const q = P(0.18 + i * 0.13, 0.5, 6); g.fillStyle = '#FFFFFF'; g.beginPath(); D.ell(g, q[0] - 1.2 * k, q[1], 1.3 * k, 0.9 * k); D.ell(g, q[0] + 1.2 * k, q[1], 1.3 * k, 0.9 * k); g.fill(); g.fillRect(q[0] - 0.4 * k, q[1], 0.8 * k, 2.6 * k); } }, {layer: 2});
    B.roof(-0.04, 0.3, 41, 1.08, 0.4, 10, '#4F8A78', {ridge: 'x', ov: 0.1, stripes: 5, layer: 3});
    onigawara(B, -0.14, 1.14, 0.5, 51, '#2F5E50');
    B.custom(0.5, 0.56, (g, P, k) => { const q = P(0.5, 0.52, 34), x = q[0], y = q[1]; g.fillStyle = c ? '#8A5A4A' : '#D2302A'; g.beginPath(); g.moveTo(x - 6 * k, y - 2 * k); g.lineTo(x, y - 6.5 * k); g.lineTo(x + 6 * k, y - 2 * k); g.lineTo(x + 6 * k, y + 7 * k); g.lineTo(x - 6 * k, y + 7 * k); g.closePath(); g.fill();
      g.strokeStyle = '#F2C23A'; g.lineWidth = 0.8 * k; g.stroke(); bang(g, x, y + 1.5 * k, k, {size: 10}); }, {layer: 4}); }; })();

/* ---------- 🗺️ hand them out through the looks (same footprint + door + block as the village ones → every town keeps its plan, T6) ---------- */
const PLAZA = {cherry: {well: 'well_ido', stall: 'stall_yatai', qboard: 'qboard_ema', lantern: 'stonelantern'}};
Object.keys(PLAZA).forEach(lk => { const L = LOOKS[lk]; if(!L) return; const sw = {}; Object.keys(PLAZA[lk]).forEach(a => { if(DEFS[PLAZA[lk][a]]) sw[a] = PLAZA[lk][a]; }); L.swap = Object.assign({}, L.swap || {}, sw); });
})();
K.loaded('cherry', 'ip-4b');
})(window.Props && window.Props._K);
