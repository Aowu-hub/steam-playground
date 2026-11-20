
/* 🌍 IsoLook_bolt — 🤖 Bolt Works — AvataRealm side on 🚀 moon (needs realm) · 🏺 The First Robot Head origin relic — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['bolt'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/bolt.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_bolt: include IsoProps first'); return; }
if(!K.AR){ console.warn('IsoLook_bolt: load IsoLook_realm first (Props.need does it)'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🤖 bolt · Bolt Works (AvataRealm side ②b, ar-1 pictures, 🌳 IsoProps chat 2026-11-17).
   Built ON 🚀 moon (its ground, rocks, 🍂 versions) + 🏰 realm (team colours · 🏗️ site steps · slots). 11 buildings = AvataRealm §14a:
   🏠 crate-bot → workshop dome → Command Tower · 🏕️ Assembly Line · 🎠 Garage Bay · 🪽 Drone Pad · 🩹 Oil Station · 🔧 Magnet Plant ·
   🗼 Laser Turret · 🎨 Paint Shop · 🔮 Tesla Lab · 🕵️ Stealth Hangar · 🐾 Robo-pet Kennel. Keys bolt_<slot>. */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, halo, porthole, ports} = T;
const {pennant, banner, trim, building, addSide, addFloor, tileBase, hash, teamOf, patOf, inkOf, patPaint} = K.AR;
const D = PD, M = MAT, TAU = Math.PI * 2, S2 = Math.SQRT2;
const HULL = '#EEF1F6', HULL2 = '#DDE3EE', METAL = '#9AA2B4', DARKM = '#4A5266', STEEL = '#B8C0CE', YEL = '#FFD23F', CYAN = '#5FE8FF', ORG = '#FF7A3A', BLK = '#2E3240';
// ⚡ the side's emblem: a lightning bolt
function zap(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); g.moveTo(x + r * 0.25, y - r); g.lineTo(x - r * 0.55, y + r * 0.12); g.lineTo(x - r * 0.02, y + r * 0.12); g.lineTo(x - r * 0.3, y + r); g.lineTo(x + r * 0.58, y - r * 0.18); g.lineTo(x + r * 0.06, y - r * 0.18); g.closePath(); g.fill(); }
addSide('bolt', {name: 'Bolt Works', icon: '🤖', look: 'bolt', accent: YEL, emblem: zap, base: 'moon'});
addLook('bolt', {name: 'Bolt Works', walls: [HULL, HULL2, '#E6E9F0'], roofs: [METAL, DARKM, YEL], trim: DARKM, accent: YEL, stilts: false, team: null, side: 'bolt', ground: 'moon',
  res: {coin: '#C9D3E2', coinDk: '#6A7488', rock: '#8E8A9E', brick: '#8A94A8', brickDk: '#4A5266', leaf: '#6FC36A', bark: '#6A6070', gem: '#39E6FF', gemDk: '#1A6FB0', gemHi: '#E0FBFF'}}, 'moon');
/* ---------- 🖌️ bolt painters ---------- */
const seams = (n, h) => (g, Q, k) => { g.strokeStyle = 'rgba(58,66,86,0.24)'; g.lineWidth = 0.9 * k; for(let i = 1; i < n; i++) line(g, Q(i / n, 0), Q(i / n, h)); g.fillStyle = 'rgba(58,66,86,0.4)';
  for(let i = 0; i <= n; i++) [3, h - 3].forEach(z => { const q = Q(Math.min(0.97, Math.max(0.03, i / n)), z); g.beginPath(); g.arc(q[0], q[1], 0.75 * k, 0, TAU); g.fill(); }); };
const hazard = (z0, h) => (g, Q, k) => { polyP(g, [Q(0, z0), Q(1, z0), Q(1, z0 + h), Q(0, z0 + h)]); g.fillStyle = YEL; g.fill(); g.save(); g.clip(); g.fillStyle = BLK; for(let u = -0.2; u < 1.1; u += 0.12){ polyP(g, [Q(u, z0), Q(u + 0.06, z0), Q(u + 0.06 + 0.06, z0 + h), Q(u + 0.06, z0 + h)]); g.fill(); } g.restore(); };
const screen = (z0, h, c, o) => (g, Q, k) => { o = o || {}; const lv = lightOf(c); polyP(g, [Q(0, z0), Q(1, z0), Q(1, z0 + h), Q(0, z0 + h)]); g.fillStyle = lv ? '#1C2848' : '#2A2A30'; g.fill(); g.strokeStyle = DARKM; g.lineWidth = 1.2 * k; g.stroke();
  if(lv){ g.strokeStyle = o.col || CYAN; g.lineWidth = 1 * k; for(let r = 0; r < (o.rows || 3); r++){ const z = z0 + 2.5 + r * (h - 4) / (o.rows || 3); line(g, Q(0.12, z), Q(0.4 + ((r * 37) % 5) / 10, z)); } } };
function gear(g, x, y, r, col, n){ n = n || 8; g.fillStyle = col; g.beginPath(); for(let i = 0; i < n * 2; i++){ const a = i / (n * 2) * TAU, rr = i % 2 ? r : r * 0.78; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9); } g.closePath(); g.fill();
  g.fillStyle = D.sh(col, -0.35); g.beginPath(); D.ell(g, x, y, r * 0.3, r * 0.27); g.fill(); }
function boltHead(g, x, y, r){ g.fillStyle = STEEL; g.beginPath(); for(let i = 0; i < 6; i++){ const a = i / 6 * TAU; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7); } g.closePath(); g.fill(); g.fillStyle = METAL; g.beginPath(); D.ell(g, x, y, r * 0.4, r * 0.3); g.fill(); }
function antenna(g, P, k, x, y, z, h, on){ const a = P(x, y, z), b = [a[0], a[1] - h * k]; g.strokeStyle = DARKM; g.lineWidth = 1.4 * k; line(g, a, b); g.fillStyle = on ? '#FF4A4A' : '#6A5A5A'; g.beginPath(); g.arc(b[0], b[1], 2.2 * k, 0, TAU); g.fill(); }
// 🤖 a robot face on a front face (eyes glow cyan, a grille mouth) — decal paint
const face = (c, z, sz) => (g, Q, k) => { const lv = lightOf(c); [0.3, 0.7].forEach(u => { const p = Q(u, z); g.fillStyle = DARKM; g.beginPath(); D.ell(g, p[0], p[1], sz * k, sz * 0.92 * k); g.fill(); g.fillStyle = lv ? CYAN : '#4A4A55'; g.beginPath(); D.ell(g, p[0], p[1], sz * 0.66 * k, sz * 0.6 * k); g.fill();
    if(lv){ g.fillStyle = '#FFFFFF'; g.beginPath(); D.ell(g, p[0] - sz * 0.22 * k, p[1] - sz * 0.22 * k, sz * 0.2 * k, sz * 0.18 * k); g.fill(); } });
  const m0 = Q(0.32, z - sz * 2.1), m1 = Q(0.68, z - sz * 2.1), m2 = Q(0.68, z - sz * 1.3), m3 = Q(0.32, z - sz * 1.3); polyP(g, [m0, m1, m2, m3]); g.fillStyle = DARKM; g.fill(); g.strokeStyle = METAL; g.lineWidth = 0.9 * k; for(let i = 1; i < 5; i++){ const f = i / 5; line(g, [m0[0] + (m1[0] - m0[0]) * f, m0[1] + (m1[1] - m0[1]) * f], [m3[0] + (m2[0] - m3[0]) * f, m3[1] + (m2[1] - m3[1]) * f]); } };
const BW = (slot, o, build) => building('bolt', slot, o, build);
const tc = L => teamOf(L);
const plate = (B, b, h, n) => { B.decal(b, 'front', ...F(b, 'front'), 0, h, b.c, {paint: seams(n || 4, h)}); B.decal(b, 'right', ...F(b, 'right'), 0, h, b.c, {paint: seams(n || 4, h)}); };
/* ============================ 🏠 HOUSE — crate-bot → workshop dome → Command Tower ============================ */
BW('house', {name: 'Command Tower', h: 140, names: {'1': 'Crate-bot', '2': 'Workshop Dome', '3': 'Command Tower'}}, (B, v, L) => { const c = L.cond, lv = L.state || '1', on = lightOf(c);
  if(lv === '1'){ // 📦 a big crate that IS a robot: crate braces, a face, an antenna, little treads + a parts pile
    B.box(0.42, 0.42, 0, 0.18, 1.24, 8, BLK, {layer: -1}); B.box(1.62, 0.42, 0, 0.18, 1.24, 8, BLK, {layer: -1});
    const b = B.box(0.36, 0.36, 6, 1.5, 1.36, 40, '#D9A86A', {trim: 0});
    ['front', 'right'].forEach(s => B.decal(b, s, ...F(b, s), 0, 40, '#D9A86A', {paint: (g, Q, k) => { g.strokeStyle = '#A9733E'; g.lineWidth = 3 * k; polyP(g, [Q(0.03, 2), Q(0.97, 2), Q(0.97, 38), Q(0.03, 38)]); g.stroke(); line(g, Q(0.05, 3), Q(0.95, 37)); g.fillStyle = 'rgba(42,28,20,0.35)'; [[0.06, 4], [0.94, 4], [0.06, 36], [0.94, 36]].forEach(([u, z]) => { const p = Q(u, z); g.beginPath(); g.arc(p[0], p[1], 1 * k, 0, TAU); g.fill(); }); }}));
    B.decal(b, 'front', ...F(b, 'front'), 0, 40, '#D9A86A', {paint: face(c, 26, 5.4)}); trim(B, L, b, 34, 4, ['right']);
    B.custom(1.1, 1.05, (g, P, k) => antenna(g, P, k, 1.1, 1.05, 46, 18, on), {layer: 2, zb: 46, top: 66});
    B.custom(2.4, 1.2, (g, P, k) => { const q = P(2.4, 1.3, 0); gear(g, q[0] - 6 * k, q[1] - 10 * k, 9 * k, STEEL); gear(g, q[0] + 9 * k, q[1] - 6 * k, 6 * k, YEL, 7); boltHead(g, q[0] + 2 * k, q[1] + 2 * k, 3 * k); boltHead(g, q[0] - 12 * k, q[1] + 1 * k, 2.6 * k); }, {layer: 1, zb: 0, top: 22});
    pennant(B, L, 2.7, 0.3, 0, 46, {emblem: zap, pole: DARKM}); return; }
  if(lv === '2'){ // 🛠️ workshop dome: a metal dome with a yellow band + a big round eye window, a side garage box, a robot arm
    B.drum(1.4, 1.0, 0, 0.9, 10, STEEL, {rings: 2, layer: -1});
    B.custom(1.4, 1.0, (g, P, k, t, T2) => { const d = dome(g, P, k, 1.4, 1.0, 10, 0.8, 62, HULL, {hi: '#FFFFFF'}); g.strokeStyle = 'rgba(58,66,86,0.25)'; g.lineWidth = 0.9 * k; [0.35, 0.68].forEach(f => { g.beginPath(); g.ellipse(d.c[0], d.c[1] - d.hh * f, d.rx * Math.sqrt(1 - f * f), d.ry * Math.sqrt(1 - f * f), 0, 0, Math.PI); g.stroke(); });
      g.strokeStyle = c && c.broken ? '#8A7A50' : YEL; g.lineWidth = 4 * k; g.beginPath(); g.ellipse(d.c[0], d.c[1] - d.hh * 0.14, d.rx * 0.99, d.ry * 0.99, 0, 0.05, Math.PI - 0.05); g.stroke();
      const e = [d.c[0] + d.rx * 0.05, d.c[1] - d.hh * 0.52]; g.fillStyle = METAL; g.beginPath(); D.ell(g, e[0], e[1], 12 * k, 11 * k); g.fill(); g.fillStyle = on ? CYAN : '#4A4A55'; g.beginPath(); D.ell(g, e[0], e[1], 8.4 * k, 7.8 * k); g.fill();
      g.fillStyle = DARKM; g.beginPath(); D.ell(g, e[0] + 1 * k, e[1] + 0.5 * k, 3.4 * k, 3.4 * k); g.fill(); if(on){ g.fillStyle = '#FFFFFF'; g.beginPath(); D.ell(g, e[0] - 3 * k, e[1] - 3 * k, 2 * k, 1.7 * k); g.fill(); }
      antenna(g, P, k, 1.4, 1.0, 72, 14, on); }, {layer: 0, zb: 10, top: 86});
    const gb = B.box(2.25, 0.4, 0, 0.66, 1.4, 30, HULL2); plate(B, gb, 30, 3); B.decal(gb, 'front', 2.31, 0.54, 0, 22, DARKM, {paint: (g, Q, k) => { g.fillStyle = on ? D.lin(g, 0, Q(0, 22)[1], 0, Q(0, 0)[1], ['#3A2A4A', '#FF9A3A']) : '#2A2A30'; polyP(g, [Q(0, 0), Q(1, 0), Q(1, 22), Q(0, 22)]); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = k; for(let z = 14; z < 22; z += 2.4) line(g, Q(0, z), Q(1, z)); }});
    trim(B, L, gb, 26, 4); B.box(2.2, 0.36, 30, 0.76, 1.48, 4, METAL, {layer: 1});
    B.custom(2.58, 1.0, (g, P, k) => { const base = P(2.58, 1.0, 34), j1 = [base[0] - 2 * k, base[1] - 16 * k], j2 = [j1[0] - 16 * k, j1[1] - 4 * k]; g.fillStyle = YEL; g.beginPath(); D.ell(g, base[0], base[1], 6 * k, 3 * k); g.fill();
      g.strokeStyle = YEL; g.lineCap = 'round'; g.lineWidth = 3.6 * k; line(g, base, j1); line(g, j1, j2); g.fillStyle = DARKM; [base, j1].forEach(q => { g.beginPath(); g.arc(q[0], q[1], 2.2 * k, 0, TAU); g.fill(); }); g.strokeStyle = DARKM; g.lineWidth = 1.5 * k; line(g, j2, [j2[0] - 3 * k, j2[1] + 4 * k]); line(g, j2, [j2[0] - 4 * k, j2[1] - 2 * k]); }, {layer: 3, zb: 34, top: 56});
    pennant(B, L, 0.3, 0.3, 0, 52, {emblem: zap, pole: DARKM}); return; }
  // 🗼 L3 Command Tower: a plated base with a big door + hazard band, a round tower, a glowing control room, an antenna with a dish, team trim
  const b = B.box(0.1, 0.12, 0, 2.8, 1.76, 34, HULL2); plate(B, b, 34, 7); B.decal(b, 'left', ...F(b, 'left'), 0, 34, HULL2, {paint: seams(4, 34)});
  B.decal(b, 'front', ...F(b, 'front'), 0, 34, HULL2, {paint: hazard(0, 5)}); B.decal(b, 'right', ...F(b, 'right'), 0, 34, HULL2, {paint: hazard(0, 5)});
  B.door(b, 'front', 1.18, 0.64, 26, {fill: DARKM}); B.decal(b, 'front', 0.3, 0.6, 12, 14, DARKM, {paint: screen(0, 14, c)}); B.decal(b, 'front', 2.1, 0.6, 12, 14, DARKM, {paint: screen(0, 14, c, {col: YEL})});
  B.decal(b, 'right', ...F(b, 'right'), 0, 34, HULL2, {paint: ports([[0.3, 20, 5], [0.7, 20, 5]], METAL, c)}); trim(B, L, b, 28, 4);
  banner(B, L, b, 'right', 0.18, 0.3, 4, 18, zap);
  B.box(0.06, 0.08, 34, 2.88, 1.84, 4, METAL, {layer: 1});
  B.drum(1.5, 0.92, 38, 0.52, 52, HULL, {rings: 5, layer: 1});
  B.custom(1.5, 0.92, (g, P, k) => { const q = P(1.5, 0.92, 38), r = 0.52 * HTW * k * S2; g.fillStyle = 'rgba(58,66,86,0.45)'; for(let n = 0; n < 3; n++){ const z = 12 + n * 13; [-0.45, 0.35].forEach(u => { const x = q[0] + u * r, y = q[1] - z * k + Math.sqrt(1 - u * u) * r * 0.5; g.fillStyle = METAL; g.beginPath(); D.ell(g, x, y, 3.4 * k, 3.4 * k); g.fill(); g.fillStyle = on ? '#FFD27A' : '#4A4A55'; g.beginPath(); D.ell(g, x, y, 2.2 * k, 2.2 * k); g.fill(); }); } }, {layer: 2, zb: 38, top: 90});
  B.drum(1.5, 0.92, 90, 0.72, 18, DARKM, {layer: 2});
  B.custom(1.5, 0.92, (g, P, k) => { const q = P(1.5, 0.92, 90), r = 0.72 * HTW * k * S2, col = on ? CYAN : '#4A4A55'; g.fillStyle = col; g.beginPath(); g.ellipse(q[0], q[1] - 6 * k, r * 0.98, r * 0.49, 0, 0, Math.PI); g.lineTo(q[0] - r * 0.98, q[1] - 13 * k); g.ellipse(q[0], q[1] - 13 * k, r * 0.98, r * 0.49, 0, Math.PI, 0, true); g.closePath(); g.fill();
    g.strokeStyle = DARKM; g.lineWidth = 1.2 * k; for(let i = 0; i < 7; i++){ const u = -0.85 + i * 0.28; line(g, [q[0] + u * r, q[1] - 6 * k + Math.sqrt(1 - u * u) * r * 0.49], [q[0] + u * r, q[1] - 13 * k + Math.sqrt(1 - u * u) * r * 0.49]); }
    const tcol = tc(L); g.strokeStyle = c && c.broken ? '#6A6060' : tcol; g.lineWidth = 3 * k; g.beginPath(); g.ellipse(q[0], q[1] - 17 * k, r, r * 0.5, 0, 0.05, Math.PI - 0.05); g.stroke(); }, {layer: 3, zb: 90, top: 108});
  B.custom(1.5, 0.92, (g, P, k, t) => { dome(g, P, k, 1.5, 0.92, 108, 0.62, 12, METAL, {hi: '#DDE3EE'}); const m0 = P(1.5, 0.92, 118), m1 = [m0[0], m0[1] - 18 * k]; g.strokeStyle = DARKM; g.lineWidth = 2 * k; line(g, m0, m1);
    const d0 = [m1[0] - 1 * k, m1[1] + 2 * k]; g.fillStyle = HULL; g.beginPath(); g.ellipse(d0[0] - 6 * k, d0[1] - 3 * k, 8 * k, 4.4 * k, -0.5, 0, TAU); g.fill(); g.strokeStyle = DARKM; g.lineWidth = 1.2 * k; g.stroke(); line(g, [d0[0] - 6 * k, d0[1] - 3 * k], [d0[0] - 12 * k, d0[1] - 9 * k]);
    g.fillStyle = on ? '#FF4A4A' : '#6A5A5A'; g.beginPath(); g.arc(m1[0], m1[1], 2.4 * k, 0, TAU); g.fill(); }, {layer: 4, zb: 108, top: 140});
  if(on) halo(B, 1.5, 0.92, 100, 30, CYAN, 0.28 * on);
  pennant(B, L, 0.22, 0.22, 38, 26, {emblem: zap, pole: DARKM}); pennant(B, L, 2.78, 0.22, 38, 26, {emblem: zap, pole: DARKM});
});
/* ============================ 🏕️ CAMP — Assembly Line ============================ */
BW('camp', {name: 'Assembly Line', h: 84}, (B, v, L) => { const c = L.cond, on = lightOf(c);
  B.flat(0.06, 0.06, 1.88, 1.88, '#B6BAC8');
  const belt = B.box(0.1, 0.86, 0, 1.8, 0.5, 10, DARKM, {topFill: BLK}); B.decal(belt, 'front', ...F(belt, 'front'), 0, 10, DARKM, {paint: (g, Q, k) => { g.fillStyle = METAL; for(let i = 0; i < 9; i++){ const p = Q(0.06 + i * 0.11, 5); g.beginPath(); D.ell(g, p[0], p[1], 2.6 * k, 2.6 * k); g.fill(); } }});
  B.custom(1, 1.1, (g, P, k) => { g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1 * k; for(let i = 0; i < 12; i++){ const x = 0.14 + i * 0.145; line(g, P(x, 0.88, 10), P(x, 1.34, 10)); } }, {layer: 1, zb: 10, top: 11});
  [[0.36, '#9AB4E8'], [1.5, '#E89A9A']].forEach(([x, col]) => { const t = B.box(x, 0.98, 10, 0.32, 0.26, 16, col, {layer: 1}); B.decal(t, 'front', ...F(t, 'front'), 0, 16, col, {paint: (g, Q, k) => { [0.3, 0.7].forEach(u => { const p = Q(u, 10); g.fillStyle = on ? CYAN : '#5A5A66'; g.beginPath(); D.ell(g, p[0], p[1], 2.2 * k, 2 * k); g.fill(); }); }}); });
  [[0.74, 0.7], [1.2, 0.7]].forEach(p => B.box(p[0], p[1], 0, 0.14, 0.14, 46, STEEL, {layer: 2}));
  const pr = B.box(0.7, 0.66, 46, 0.68, 0.84, 18, YEL, {layer: 2}); B.decal(pr, 'front', ...F(pr, 'front'), 0, 18, YEL, {paint: hazard(0, 5)}); B.decal(pr, 'right', ...F(pr, 'right'), 0, 18, YEL, {paint: hazard(0, 5)});
  B.box(0.88, 0.86, 26, 0.32, 0.42, 20, METAL, {layer: 2});
  const st = B.box(0.12, 0.12, 0, 0.74, 0.56, 30, HULL2); plate(B, st, 30, 3); B.decal(st, 'front', 0.16, 0.42, 8, 14, DARKM, {paint: screen(0, 14, c)}); trim(B, L, st, 24, 4);
  B.custom(1.62, 0.36, (g, P, k) => { const base = P(1.62, 0.36, 0), j1 = [base[0], base[1] - 26 * k], j2 = [j1[0] - 18 * k, j1[1] + 6 * k]; g.fillStyle = DARKM; g.beginPath(); D.ell(g, base[0], base[1], 7 * k, 3.5 * k); g.fill();
    g.strokeStyle = ORG; g.lineCap = 'round'; g.lineWidth = 4 * k; line(g, base, j1); line(g, j1, j2); g.fillStyle = DARKM; [j1].forEach(q => { g.beginPath(); g.arc(q[0], q[1], 2.4 * k, 0, TAU); g.fill(); }); g.strokeStyle = DARKM; g.lineWidth = 1.6 * k; line(g, j2, [j2[0] - 2 * k, j2[1] + 6 * k]); line(g, j2, [j2[0] + 3 * k, j2[1] + 6 * k]); }, {layer: 1, zb: 0, top: 34});
  pennant(B, L, 1.88, 1.88, 0, 40, {emblem: zap, pole: DARKM});
});
/* ============================ 🎠 RIDE-ON — Garage Bay ============================ */
BW('ride', {name: 'Garage Bay', h: 92}, (B, v, L) => { const c = L.cond, on = lightOf(c);
  B.box(0.06, 0.06, 0, 1.88, 2.88, 3, STEEL, {layer: -1});
  const b = B.box(0.12, 0.2, 3, 1.76, 2.62, 44, HULL2); plate(B, b, 44, 6); B.decal(b, 'left', ...F(b, 'left'), 0, 44, HULL2, {paint: seams(6, 44)});
  B.decal(b, 'front', 0.24, 1.52, 0, 36, DARKM, {paint: (g, Q, k) => { polyP(g, [Q(0, 0), Q(1, 0), Q(1, 36), Q(0, 36)]); g.fillStyle = YEL; g.fill(); g.save(); g.clip(); g.fillStyle = BLK; for(let u = -0.2; u < 1.2; u += 0.1){ polyP(g, [Q(u, 36), Q(u + 0.05, 36), Q(u + 0.1, 30), Q(u + 0.05, 30)]); g.fill(); } g.restore();
    polyP(g, [Q(0.06, 0), Q(0.94, 0), Q(0.94, 30), Q(0.06, 30)]); g.fillStyle = on ? '#2A2440' : '#22222A'; g.fill();
    g.fillStyle = HULL; polyP(g, [Q(0.06, 14), Q(0.94, 14), Q(0.94, 30), Q(0.06, 30)]); g.fill(); g.strokeStyle = 'rgba(58,66,86,0.35)'; g.lineWidth = 1 * k; for(let z = 16; z < 30; z += 3) line(g, Q(0.06, z), Q(0.94, z));
    const w0 = Q(0.32, 0), w1 = Q(0.32, 12); g.fillStyle = BLK; g.beginPath(); D.ell(g, w0[0], (w0[1] + w1[1]) / 2 + 2 * k, 7 * k, 7 * k); g.fill(); g.fillStyle = METAL; g.beginPath(); D.ell(g, w0[0], (w0[1] + w1[1]) / 2 + 2 * k, 3 * k, 3 * k); g.fill();
    if(on){ g.fillStyle = 'rgba(255,170,90,0.35)'; polyP(g, [Q(0.06, 0), Q(0.94, 0), Q(0.94, 3), Q(0.06, 3)]); g.fill(); } }});
  trim(B, L, b, 38, 4); banner(B, L, b, 'right', 1.2, 0.36, 8, 22, zap);
  B.custom(1, 1.5, (g, P, k) => { const x0 = 0.04, x1 = 1.96, y0 = 0.14, y1 = 2.88, z = 47; const n = 7; for(let i = n - 1; i >= 0; i--){ const f = i / n, f2 = (i + 1) / n, a = Math.PI * f, a2 = Math.PI * f2;   // a curved hangar vault
      const pt = (ang, y) => P(x0 + (x1 - x0) * (1 - Math.cos(ang)) / 2, y, z + Math.sin(ang) * 30); const col = i < n / 2 ? '#E3E8F0' : '#C5CCD9';
      polyP(g, [pt(a, y1), pt(a2, y1), pt(a2, y0), pt(a, y0)]); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(58,66,86,0.25)'; g.lineWidth = 0.9 * k; g.stroke(); }
    g.fillStyle = HULL; g.beginPath(); for(let i = 0; i <= 12; i++){ const a = Math.PI * i / 12, p = P(x0 + (x1 - x0) * (1 - Math.cos(a)) / 2, y1, z + Math.sin(a) * 30); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.closePath(); g.fill(); g.strokeStyle = 'rgba(58,66,86,0.3)'; g.stroke();
    g.strokeStyle = c && c.broken ? '#6A6060' : tc(L); g.lineWidth = 3.4 * k; g.beginPath(); for(let i = 0; i <= 12; i++){ const a = Math.PI * i / 12, p = P(x0 + (x1 - x0) * (1 - Math.cos(a)) / 2, y1, z + Math.sin(a) * 30); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke();
    const lp = P(1, y1, z + 18); g.fillStyle = on ? YEL : '#6A6A50'; g.beginPath(); D.ell(g, lp[0], lp[1], 5 * k, 3 * k); g.fill(); }, {layer: 2, zb: 47, top: 77});
  B.custom(1.6, 2.92, (g, P, k) => { const q = P(1.78, 2.9, 0); g.fillStyle = BLK; g.beginPath(); D.ell(g, q[0], q[1] - 9 * k, 6 * k, 9 * k); g.fill(); g.fillStyle = METAL; g.beginPath(); D.ell(g, q[0] + 1 * k, q[1] - 9 * k, 2.6 * k, 4 * k); g.fill(); }, {layer: 4, zb: 0, top: 18});
  pennant(B, L, 0.18, 0.24, 47, 30, {emblem: zap, pole: DARKM});
});
/* ============================ 🪽 NEST — Drone Pad ============================ */
BW('nest', {name: 'Drone Pad', h: 86}, (B, v, L) => { const c = L.cond, on = lightOf(c);
  const pad = B.box(0.08, 0.08, 0, 1.84, 1.84, 16, DARKM, {topFill: '#5A6278'}); B.decal(pad, 'front', ...F(pad, 'front'), 0, 16, DARKM, {paint: hazard(9, 5)}); B.decal(pad, 'right', ...F(pad, 'right'), 0, 16, DARKM, {paint: hazard(9, 5)});
  B.decal(pad, 'front', 0.76, 0.48, 0, 9, BLK, {k: 'door'});
  B.custom(1, 1, (g, P, k) => { const ctr = P(1, 1, 16), r = 0.68 * HTW * k * S2; g.strokeStyle = c && c.broken ? '#6A6060' : tc(L); g.lineWidth = 4 * k; g.beginPath(); g.ellipse(ctr[0], ctr[1], r, r / 2, 0, 0, TAU); g.stroke();   // the H in a ring (team colour)
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 3 * k; line(g, P(0.72, 0.68, 16), P(0.72, 1.32, 16)); line(g, P(1.28, 0.68, 16), P(1.28, 1.32, 16)); line(g, P(0.72, 1, 16), P(1.28, 1, 16));
    [[0.16, 0.16], [1.84, 0.16], [0.16, 1.84], [1.84, 1.84]].forEach(([x, y]) => { const p = P(x, y, 16); g.fillStyle = on ? (x + y > 2 ? '#FF4A4A' : '#5AFF7A') : '#5A5A60'; g.beginPath(); D.ell(g, p[0], p[1], 2.4 * k, 1.6 * k); g.fill(); }); }, {layer: 1, zb: 16, top: 17});
  B.custom(1, 1.05, (g, P, k, t) => { const q = P(1.0, 1.05, 22), tcol = c && c.broken ? '#6A6060' : tc(L), spin = c && c.still ? 0 : (t || 0);   // 🚁 a parked quad drone
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => { const r0 = [q[0] + dx * 15 * k + dy * 4 * k, q[1] + dy * 5 * k - 2 * k]; g.strokeStyle = DARKM; g.lineWidth = 2.2 * k; line(g, q, r0);
      g.fillStyle = 'rgba(200,215,240,0.65)'; g.beginPath(); D.ell(g, r0[0], r0[1] - 3 * k, 9 * k, 3.6 * k); g.fill(); g.strokeStyle = 'rgba(58,66,86,0.6)'; g.lineWidth = 1.2 * k; const a = spin * 9 + dx; line(g, [r0[0] - Math.cos(a) * 8 * k, r0[1] - 3 * k - Math.sin(a) * 3 * k], [r0[0] + Math.cos(a) * 8 * k, r0[1] - 3 * k + Math.sin(a) * 3 * k]); });
    g.fillStyle = HULL; g.beginPath(); D.ell(g, q[0], q[1] - 4 * k, 10 * k, 6 * k); g.fill(); g.fillStyle = tcol; g.beginPath(); g.ellipse(q[0], q[1] - 4 * k, 10 * k, 6 * k, 0, 0.1, Math.PI - 0.1); g.fill(); g.fillStyle = on ? CYAN : '#4A4A55'; g.beginPath(); D.ell(g, q[0] + 3 * k, q[1] - 6 * k, 3 * k, 2.4 * k); g.fill();
    g.strokeStyle = DARKM; g.lineWidth = 1.4 * k; line(g, [q[0] - 6 * k, q[1] + 1 * k], [q[0] - 8 * k, q[1] + 6 * k]); line(g, [q[0] + 6 * k, q[1] + 1 * k], [q[0] + 8 * k, q[1] + 6 * k]); }, {layer: 2, zb: 16, top: 40});
  B.box(1.66, 0.12, 16, 0.2, 0.2, 40, STEEL, {layer: 1});
  B.custom(1.76, 0.22, (g, P, k) => { const a = P(1.76, 0.22, 56); g.fillStyle = on ? '#FF4A4A' : '#6A5A5A'; g.beginPath(); g.arc(a[0], a[1] - 3 * k, 3.4 * k, 0, TAU); g.fill(); g.strokeStyle = DARKM; g.lineWidth = 1.4 * k; line(g, [a[0] - 9 * k, a[1] - 14 * k], [a[0] + 9 * k, a[1] - 10 * k]); g.fillStyle = HULL; g.beginPath(); D.ell(g, a[0], a[1] - 13 * k, 8 * k, 3 * k, 0.2); g.fill(); }, {layer: 2, zb: 56, top: 76});
  pennant(B, L, 0.2, 0.2, 16, 26, {emblem: zap, pole: DARKM});
});
/* ============================ 🩹 CARE — Oil Station ============================ */
BW('care', {name: 'Oil Station', h: 92}, (B, v, L) => { const c = L.cond, on = lightOf(c);
  B.box(0.06, 0.06, 0, 1.88, 1.88, 4, STEEL, {layer: -1});
  B.drum(0.9, 0.82, 4, 0.66, 52, '#E4554A', {rings: 0});
  B.custom(0.9, 0.82, (g, P, k) => { const q = P(0.9, 0.82, 4), r = 0.66 * HTW * k * S2, tcol = c && c.broken ? '#6A6060' : tc(L);
    [10, 42].forEach(z => { g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 2 * k; g.beginPath(); g.ellipse(q[0], q[1] - z * k, r, r / 2, 0, 0, Math.PI); g.stroke(); });
    g.fillStyle = tcol; g.beginPath(); g.ellipse(q[0], q[1] - 30 * k, r * 1.002, r * 0.501, 0, 0, Math.PI); g.lineTo(q[0] - r, q[1] - 24 * k); g.ellipse(q[0], q[1] - 24 * k, r, r * 0.5, 0, Math.PI, 0, true); g.closePath(); g.fill();
    const top = P(0.9, 0.82, 56); g.fillStyle = METAL; g.beginPath(); D.ell(g, top[0] + 8 * k, top[1] + 1 * k, 5 * k, 2.6 * k); g.fill(); g.fillStyle = DARKM; g.fillRect(top[0] + 5 * k, top[1] - 8 * k, 6 * k, 8 * k); g.fillStyle = METAL; g.beginPath(); D.ell(g, top[0] + 8 * k, top[1] - 8 * k, 3 * k, 1.5 * k); g.fill();
    // 🔧💗 a wrench + heart badge on the can
    const s = [q[0] - r * 0.15, q[1] - 16 * k]; g.fillStyle = '#FFFFFF'; g.beginPath(); D.ell(g, s[0], s[1] - 18 * k, 9 * k, 8 * k); g.fill(); g.fillStyle = c && c.broken ? '#8A7A70' : '#FF6B8A'; g.beginPath(); g.moveTo(s[0], s[1] - 12 * k); g.bezierCurveTo(s[0] - 8 * k, s[1] - 17 * k, s[0] - 5 * k, s[1] - 24 * k, s[0], s[1] - 20 * k); g.bezierCurveTo(s[0] + 5 * k, s[1] - 24 * k, s[0] + 8 * k, s[1] - 17 * k, s[0], s[1] - 12 * k); g.fill(); }, {layer: 1, zb: 4, top: 64});
  const pm = B.box(1.36, 1.12, 4, 0.42, 0.42, 30, HULL2, {layer: 1}); B.decal(pm, 'front', ...F(pm, 'front'), 0, 30, HULL2, {paint: screen(16, 9, c, {rows: 1, col: YEL})}); trim(B, L, pm, 25, 4, ['front', 'right']);
  B.custom(1.4, 1.3, (g, P, k) => { const a = P(1.36, 1.4, 22), b2 = P(1.1, 1.7, 2); g.strokeStyle = BLK; g.lineWidth = 2.2 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.bezierCurveTo(a[0] - 18 * k, a[1] + 2 * k, b2[0] + 16 * k, b2[1] - 2 * k, b2[0], b2[1]); g.stroke();
    g.fillStyle = YEL; g.fillRect(b2[0] - 3 * k, b2[1] - 3 * k, 6 * k, 4 * k); g.fillStyle = on ? '#3A3020' : '#2A2A2A'; g.beginPath(); D.ell(g, b2[0] + 4 * k, b2[1] + 4 * k, 6 * k, 2.4 * k); g.fill(); }, {layer: 3, zb: 0, top: 26});
  pennant(B, L, 1.84, 0.16, 4, 40, {emblem: zap, pole: DARKM});
});
/* ============================ 🔧 WORKSHOP — Magnet Plant ============================ */
BW('workshop', {name: 'Magnet Plant', h: 118}, (B, v, L) => { const c = L.cond, on = lightOf(c);
  const b = B.box(0.12, 0.12, 0, 1.76, 1.76, 46, HULL2); plate(B, b, 46, 5); B.decal(b, 'front', 0.24, 0.92, 0, 32, DARKM, {paint: (g, Q, k) => { polyP(g, [Q(0, 0), Q(1, 0), Q(1, 32), Q(0, 32)]); g.fillStyle = on ? D.lin(g, 0, Q(0, 32)[1], 0, Q(0, 0)[1], ['#2A2A4A', '#5A7AFF']) : '#2A2A30'; g.fill(); g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = k; for(let z = 22; z < 32; z += 2.4) line(g, Q(0, z), Q(1, z)); }});
  B.decal(b, 'right', ...F(b, 'right'), 0, 46, HULL2, {paint: hazard(0, 5)}); B.decal(b, 'front', ...F(b, 'front'), 0, 46, HULL2, {paint: hazard(0, 5)}); trim(B, L, b, 40, 4);
  B.box(0.08, 0.08, 46, 1.84, 1.84, 5, METAL, {layer: 1}); B.box(0.62, 0.62, 51, 0.76, 0.76, 10, DARKM, {layer: 1});
  B.custom(1, 1, (g, P, k) => { const q = P(1, 1, 61), red = c && c.broken ? '#7A5050' : '#E5484D';   // 🧲 a giant horseshoe magnet, prongs up
    g.lineCap = 'butt'; g.strokeStyle = red; g.lineWidth = 15 * k; g.beginPath(); g.moveTo(q[0] - 18 * k, q[1] - 48 * k); g.lineTo(q[0] - 18 * k, q[1] - 16 * k); g.arc(q[0], q[1] - 16 * k, 18 * k, Math.PI, 0, true); g.lineTo(q[0] + 18 * k, q[1] - 48 * k); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(q[0] - 22 * k, q[1] - 46 * k); g.lineTo(q[0] - 22 * k, q[1] - 16 * k); g.stroke();
    g.fillStyle = '#E6EAF2'; g.fillRect(q[0] - 25.5 * k, q[1] - 58 * k, 15 * k, 11 * k); g.fillRect(q[0] + 10.5 * k, q[1] - 58 * k, 15 * k, 11 * k); g.fillStyle = 'rgba(58,66,86,0.3)'; g.fillRect(q[0] - 25.5 * k, q[1] - 49 * k, 15 * k, 2 * k); g.fillRect(q[0] + 10.5 * k, q[1] - 49 * k, 15 * k, 2 * k);
    boltHead(g, q[0] - 18 * k, q[1] - 62 * k, 3.2 * k); boltHead(g, q[0] + 18 * k, q[1] - 63 * k, 3 * k); gear(g, q[0] + 22 * k, q[1] - 66 * k, 4.4 * k, YEL, 7);
    if(on && !(c && c.still)){ g.strokeStyle = CYAN; g.lineWidth = 1.2 * k; [[-1, 0], [1, 0]].forEach(([s]) => { for(let i = 0; i < 3; i++){ g.beginPath(); g.arc(q[0] + s * 18 * k, q[1] - 56 * k, (12 + i * 5) * k, s < 0 ? Math.PI * 1.1 : Math.PI * 1.55, s < 0 ? Math.PI * 1.45 : Math.PI * 1.9); g.stroke(); } }); } }, {layer: 2, zb: 61, top: 118});
  pennant(B, L, 0.18, 1.82, 0, 54, {emblem: zap, pole: DARKM});
});
/* ============================ 🗼 TOWER — Laser Turret (stand + aim) ============================ */
BW('tower', {name: 'Laser Turret', h: 100, stand: [0.5, 0.5, 50], aim: [0.5, 0.5, 66]}, (B, v, L) => { const c = L.cond, on = lightOf(c);
  B.custom(0.5, 0.5, (g, P, k) => { frustum(g, P, k, 0.5, 0.5, 0, 0.46, 0.3, 44, STEEL); const q = P(0.5, 0.5, 0), a = 0.46 * HTW * k * S2;
    g.fillStyle = YEL; g.beginPath(); g.ellipse(q[0], q[1] - 6 * k, a * 0.97, a * 0.485, 0, 0, Math.PI); g.lineTo(q[0] - a * 0.95, q[1] - 11 * k); g.ellipse(q[0], q[1] - 11 * k, a * 0.95, a * 0.475, 0, Math.PI, 0, true); g.closePath(); g.fill();
    g.save(); g.clip(); g.fillStyle = BLK; for(let i = -6; i < 6; i++){ g.beginPath(); g.moveTo(q[0] + i * 6 * k, q[1] + 8 * k); g.lineTo(q[0] + i * 6 * k + 3 * k, q[1] + 8 * k); g.lineTo(q[0] + i * 6 * k + 9 * k, q[1] - 20 * k); g.lineTo(q[0] + i * 6 * k + 6 * k, q[1] - 20 * k); g.closePath(); g.fill(); } g.restore();
    g.fillStyle = DARKM; g.beginPath(); g.ellipse(q[0], q[1] - 26 * k, 4 * k, 6 * k, 0, 0, TAU); g.fill(); }, {layer: 0, zb: 0, top: 44});
  const deck = B.drum(0.5, 0.5, 44, 0.42, 4, METAL, {layer: 1});
  B.custom(0.5, 0.5, (g, P, k) => { const tcol = c && c.broken ? '#6A6060' : tc(L), q = P(0.5, 0.5, 48); const r = 0.42 * HTW * k * S2, hb = 7, th = hb * k, len = r / k * 2.4;   // ar-1p2: a THICK patterned team collar under the dome
    const M = (s2, v) => { const a = 0.05 + (s2 / len) * (Math.PI - 0.1), rr = r + (v - hb / 2) * k * 0.9; return [q[0] + Math.cos(a) * rr, q[1] + Math.sin(a) * rr / 2 + (v - hb / 2) * k * 0.2]; };
    g.save(); g.strokeStyle = tcol; g.lineWidth = th; g.beginPath(); g.ellipse(q[0], q[1], r, r / 2, 0, 0.05, Math.PI - 0.05); g.stroke();
    if(!(c && c.broken)){ g.beginPath(); g.ellipse(q[0], q[1], r + th * 0.5, r / 2 + th * 0.5, 0, 0, Math.PI); g.ellipse(q[0], q[1], r - th * 0.5, r / 2 - th * 0.5, 0, Math.PI, 0, true); g.closePath(); g.clip(); patPaint(g, M, len, hb, patOf(L), inkOf(tcol), k); }
    g.restore(); g.strokeStyle = D.sh(tcol, -0.5); g.lineWidth = 1 * k; g.beginPath(); g.ellipse(q[0], q[1], r + th * 0.5, r / 2 + th * 0.5, 0, 0.05, Math.PI - 0.05); g.stroke();
    dome(g, P, k, 0.5, 0.5, 48, 0.3, 22, HULL, {hi: '#FFFFFF'}); const m = P(0.5, 0.5, 60), tip = [m[0] + 24 * k, m[1] - 8 * k];   // the turret barrel + the glowing lens
    g.strokeStyle = DARKM; g.lineCap = 'round'; g.lineWidth = 7 * k; line(g, m, tip); g.strokeStyle = METAL; g.lineWidth = 3 * k; line(g, [m[0] + 4 * k, m[1] - 2 * k], [tip[0] - 2 * k, tip[1] + 0.6 * k]);
    g.fillStyle = on ? '#FF4A6A' : '#5A4A50'; g.beginPath(); D.ell(g, tip[0] + 1 * k, tip[1], 3 * k, 3.6 * k); g.fill();
    g.fillStyle = on ? CYAN : '#4A4A55'; g.beginPath(); D.ell(g, m[0] - 4 * k, m[1] - 3 * k, 4 * k, 3 * k); g.fill(); }, {layer: 2, zb: 48, top: 76});
  if(on) halo(B, 0.5, 0.5, 60, 12, '#FF4A6A', 0.5 * on, {dx: 25, dy: -8});
  pennant(B, L, 0.5, 0.5, 70, 20, {emblem: zap, pole: DARKM, layer: 3});
});
/* ============================ 🎨 WARDROBE — Paint Shop ============================ */
BW('wardrobe', {name: 'Paint Shop', h: 76}, (B, v, L) => { const c = L.cond, on = lightOf(c);
  const b = B.box(0.66, 0.1, 0, 1.24, 0.8, 34, HULL2); plate(B, b, 34, 3); B.door(b, 'front', 1.1, 0.42, 26, {fill: DARKM});
  B.decal(b, 'right', ...F(b, 'right'), 0, 34, HULL2, {paint: (g, Q, k) => { const cols = [tc(L), '#22A867', YEL, '#8B5CF6']; cols.forEach((col, i) => { const u = 0.12 + i * 0.2; g.fillStyle = c && c.broken ? '#7A7070' : col; polyP(g, [Q(u, 34), Q(u + 0.14, 34), Q(u + 0.14, 22 - i * 2), Q(u + 0.07, 18 - i * 3), Q(u, 22 - i * 2)]); g.fill(); }); }});
  B.box(0.62, 0.06, 34, 1.32, 0.88, 5, DARKM, {layer: 1});
  B.custom(1.28, 0.5, (g, P, k) => { const q = P(1.28, 0.5, 39); g.fillStyle = tc(L); g.fillRect(q[0] - 4 * k, q[1] - 20 * k, 8 * k, 16 * k); g.fillStyle = HULL; g.fillRect(q[0] - 4 * k, q[1] - 24 * k, 8 * k, 4 * k); g.fillStyle = DARKM; g.fillRect(q[0] - 1.6 * k, q[1] - 28 * k, 3.2 * k, 4 * k);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(q[0] - 3 * k, q[1] - 18 * k, 1.6 * k, 12 * k); g.fillStyle = c && c.broken ? 'rgba(0,0,0,0)' : D.rgba(tc(L), 0.55); for(let i = 0; i < 6; i++){ g.beginPath(); g.arc(q[0] + (4 + i * 2.6) * k, q[1] - (30 + i * 1.6) * k, (1 + i * 0.4) * k, 0, TAU); g.fill(); } }, {layer: 2, zb: 39, top: 72});
  B.box(0.16, 0.36, 0, 0.32, 0.3, 4, METAL, {layer: 1});   // 🤖 a paint-fresh robot on a stand, its body in the team colour
  const bd = B.box(0.2, 0.4, 4, 0.24, 0.22, 18, tc(L), {layer: 1}); B.box(0.22, 0.42, 22, 0.2, 0.18, 12, HULL, {layer: 1});
  B.decal(bd, 'front', ...F(bd, 'front'), 0, 18, tc(L), {paint: (g, Q, k) => { const p = Q(0.5, 9); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(p[0], p[1], 2.2 * k, 0, TAU); g.fill(); }});
  B.custom(0.32, 0.5, (g, P, k) => { const p = P(0.32, 0.6, 30); [-2.6, 2.6].forEach(dx => { g.fillStyle = on ? CYAN : '#4A4A55'; g.beginPath(); D.ell(g, p[0] + dx * k, p[1], 1.6 * k, 1.6 * k); g.fill(); }); antenna(g, P, k, 0.32, 0.51, 34, 7, on); }, {layer: 2, zb: 22, top: 42});
  B.custom(0.4, 0.86, (g, P, k) => { const q = P(0.36, 0.88, 0); [[-7, YEL], [0, '#22A867'], [7, '#8B5CF6']].forEach(([dx, col]) => { g.fillStyle = METAL; g.beginPath(); g.ellipse(q[0] + dx * k, q[1] + 1 * k, 3.4 * k, 1.7 * k, 0, 0, Math.PI); g.lineTo(q[0] + dx * k - 3.4 * k, q[1] - 6 * k); g.ellipse(q[0] + dx * k, q[1] - 6 * k, 3.4 * k, 1.7 * k, 0, Math.PI, 0, true); g.closePath(); g.fill();
      g.fillStyle = c && c.broken ? '#6A6060' : col; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] - 6 * k, 3.4 * k, 1.7 * k); g.fill(); }); }, {layer: 3, zb: 0, top: 10});
});
/* ============================ 🔮 SPELL TOWER — Tesla Lab ============================ */
BW('spell', {name: 'Tesla Lab', h: 136}, (B, v, L) => { const c = L.cond, on = lightOf(c);
  const b = B.box(0.12, 0.6, 0, 1.76, 1.28, 36, HULL2); plate(B, b, 36, 5); B.door(b, 'front', 0.8, 0.42, 26, {fill: DARKM}); B.decal(b, 'front', ...F(b, 'front'), 0, 36, HULL2, {paint: ports([[0.18, 20, 5], [0.84, 20, 5]], METAL, c)});
  B.decal(b, 'right', 0.9, 0.6, 14, 14, DARKM, {paint: screen(0, 14, c, {col: '#B9A4FF'})}); trim(B, L, b, 30, 4);
  B.box(0.08, 0.56, 36, 1.84, 1.36, 4, METAL, {layer: 1});
  B.box(0.62, 0.12, 0, 0.76, 0.6, 10, DARKM, {layer: -1}); B.drum(1, 0.42, 10, 0.16, 70, STEEL, {rings: 0, layer: 0});
  B.custom(1, 0.42, (g, P, k) => { const q = P(1, 0.42, 10); for(let i = 0; i < 8; i++){ const z = 14 + i * 8, r = (11 - i * 0.6) * k; g.fillStyle = i % 2 ? '#D98A3A' : '#B8662A'; g.beginPath(); g.ellipse(q[0], q[1] - z * k, r, r * 0.42, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 0.8 * k; g.stroke(); }
    const s = [q[0], q[1] - 92 * k]; g.fillStyle = D.rad(g, s[0] - 4 * k, s[1] - 5 * k, 1, 15 * k, [[0, '#FFFFFF'], [0.5, STEEL], [1, '#6A7488']]); g.beginPath(); g.arc(s[0], s[1], 12 * k, 0, TAU); g.fill(); }, {layer: 0, zb: 10, top: 104});
  if(on){ B.custom(1, 0.42, (g, P, k, t) => { const q = P(1, 0.42, 102), R = rnd(5 + Math.round((t || 0) * 10)); g.strokeStyle = CYAN; g.lineWidth = 1.6 * k; g.lineJoin = 'round';
      for(let a = 0; a < 4; a++){ const ang = -Math.PI * (0.15 + a * 0.23); let x = q[0], y = q[1]; g.beginPath(); g.moveTo(x, y); for(let s = 0; s < 4; s++){ x += Math.cos(ang) * 7 * k + (R() - 0.5) * 6 * k; y += Math.sin(ang) * 6 * k + (R() - 0.5) * 5 * k; g.lineTo(x, y); } g.stroke(); }
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 0.7 * k; g.stroke(); }, {fx: true, layer: 9});
    halo(B, 1, 0.42, 102, 30, CYAN, 0.45 * on, {pulse: t => 0.92 + 0.08 * Math.sin(ph(t, 0.9)) + 0.05 * Math.cos(ph(t, 0.9))}); }
  pennant(B, L, 1.84, 0.62, 40, 24, {emblem: zap, pole: DARKM});
});
/* ============================ 🕵️ HIDEOUT — Stealth Hangar ============================ */
BW('hideout', {name: 'Stealth Hangar', h: 60}, (B, v, L) => { const c = L.cond, on = lightOf(c), DK = '#3A4256', DK2 = '#2E3446';
  const b = B.box(0.12, 0.12, 0, 1.76, 1.76, 20, DK); B.decal(b, 'front', ...F(b, 'front'), 0, 20, DK, {paint: (g, Q, k) => { const R = rnd(71); for(let i = 0; i < 7; i++){ const u = R() * 0.8, z = R() * 14; g.fillStyle = i % 2 ? '#4A5A4A' : '#2E3A30'; polyP(g, [Q(u, z), Q(u + 0.14, z + 1), Q(u + 0.12, z + 6), Q(u + 0.02, z + 5)]); g.fill(); } }});
  B.decal(b, 'front', 0.6, 0.8, 0, 14, '#14161E', {k: 'door', paint: (g, Q, k) => { if(!on) return; g.strokeStyle = 'rgba(95,232,255,0.7)'; g.lineWidth = 1 * k; line(g, Q(0, 14), Q(1, 14)); }});
  B.custom(1, 1, (g, P, k, t, T2) => { const z = 20, top = 46, pts = [P(0.02, 0.02, z), P(1.98, 0.02, z), P(1.98, 1.98, z), P(0.02, 1.98, z)], apex = [P(0.7, 0.9, top), P(1.3, 0.9, top)];   // a faceted dark roof
    polyP(g, [pts[3], pts[2], apex[1], apex[0]]); g.fillStyle = DK2; g.fill(); polyP(g, [pts[1], pts[2], apex[1]]); g.fillStyle = '#262B3A'; g.fill(); polyP(g, [pts[0], pts[3], apex[0]]); g.fillStyle = '#3E4660'; g.fill(); polyP(g, [pts[0], pts[1], apex[1], apex[0]]); g.fillStyle = '#353C52'; g.fill();
    g.strokeStyle = on ? 'rgba(95,232,255,0.55)' : 'rgba(120,120,130,0.4)'; g.lineWidth = 1 * k; line(g, pts[3], pts[2]); line(g, pts[2], pts[1]); line(g, apex[0], apex[1]); line(g, pts[2], apex[1]); }, {layer: 1, zb: 20, top: 46});
  B.custom(1, 1, (g, P, k) => { const tcol = c && c.broken ? '#4A4040' : tc(L); line; const a = P(1.62, 1.98, 12); g.fillStyle = tcol; g.fillRect(a[0] - 1.5 * k, a[1] - 6 * k, 3 * k, 6 * k); }, {layer: 2, zb: 6, top: 14});
  B.custom(0.3, 1.7, (g, P, k) => { const q = P(0.32, 1.78, 0); g.fillStyle = '#4A5A4A'; g.beginPath(); D.ell(g, q[0], q[1] - 3 * k, 9 * k, 4 * k); g.fill(); g.fillStyle = '#5A6A50'; g.beginPath(); D.ell(g, q[0] + 3 * k, q[1] - 6 * k, 6 * k, 3 * k); g.fill(); }, {layer: 3, zb: 0, top: 8});
  pennant(B, L, 1.86, 0.14, 20, 18, {emblem: zap, pole: DARKM, w: 11, hh: 7});
});
/* ============================ 🐾 DEN — Robo-pet Kennel ============================ */
BW('den', {name: 'Robo-pet Kennel', h: 80}, (B, v, L) => { const c = L.cond, on = lightOf(c);
  B.box(0.06, 0.06, 0, 1.88, 1.88, 3, STEEL, {layer: -1});
  const b = B.box(0.2, 0.18, 3, 1.2, 1.1, 30, HULL2); plate(B, b, 30, 3); trim(B, L, b, 25, 4);
  B.decal(b, 'front', 0.38, 0.44, 0, 22, '#22263A', {k: 'door', paint: (g, Q, k) => { g.fillStyle = '#22263A'; const a = Q(0, 0), m = Q(0.5, 26), d2 = Q(1, 0); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0], m[1], m[0], m[1]); g.quadraticCurveTo(d2[0], m[1], d2[0], d2[1]); g.closePath(); g.fill(); }});
  B.roof(0.2, 0.18, 33, 1.2, 1.1, 22, METAL, {ridge: 'y', ov: 0.14, stripes: 6});
  B.custom(0.8, 0.73, (g, P, k) => { g.strokeStyle = c && c.broken ? '#6A6060' : tc(L); g.lineWidth = 4 * k; g.lineCap = 'round'; line(g, P(0.8, 0.04, 56), P(0.8, 1.42, 56)); }, {layer: 1, zb: 55, top: 58});
  B.custom(0.8, 1.32, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const q = P(0.8, 1.3, 44); g.fillStyle = YEL; g.strokeStyle = DARKM; g.lineWidth = 1 * k;   // a bone sign made of a bolt
    g.fillRect(q[0] - 9 * k, q[1] - 2 * k, 18 * k, 4 * k); [[-9, -2.4], [-9, 2.4], [9, -2.4], [9, 2.4]].forEach(([dx, dy]) => { g.beginPath(); g.arc(q[0] + dx * k, q[1] + dy * k, 3 * k, 0, TAU); g.fill(); }); }, {layer: 3, zb: 40, top: 50});
  B.custom(1.5, 1.45, (g, P, k, t) => { const pad = P(1.55, 1.5, 3), tcol = c && c.broken ? '#6A6060' : tc(L); g.fillStyle = DARKM; g.beginPath(); D.ell(g, pad[0], pad[1], 15 * k, 7.5 * k); g.fill(); g.strokeStyle = on ? CYAN : '#5A5A66'; g.lineWidth = 1.6 * k; g.beginPath(); D.ell(g, pad[0], pad[1], 11 * k, 5.5 * k); g.stroke();
    // 🐕 a robo-dog sitting on its charging pad
    const d = [pad[0], pad[1] - 3 * k]; g.fillStyle = HULL; g.beginPath(); D.ell(g, d[0], d[1] - 8 * k, 8 * k, 7 * k); g.fill(); g.fillStyle = tcol; g.beginPath(); g.ellipse(d[0], d[1] - 8 * k, 8 * k, 7 * k, 0, 0.2, Math.PI - 0.2); g.fill();
    g.fillStyle = HULL; g.beginPath(); D.ell(g, d[0] + 6 * k, d[1] - 18 * k, 6 * k, 5 * k); g.fill(); g.fillStyle = DARKM; g.beginPath(); D.ell(g, d[0] + 11 * k, d[1] - 17 * k, 2 * k, 1.6 * k); g.fill();
    g.fillStyle = METAL; g.beginPath(); g.moveTo(d[0] + 2 * k, d[1] - 21 * k); g.lineTo(d[0] + 1 * k, d[1] - 28 * k); g.lineTo(d[0] + 5 * k, d[1] - 22 * k); g.closePath(); g.fill();
    g.fillStyle = on ? CYAN : '#4A4A55'; g.beginPath(); D.ell(g, d[0] + 7.6 * k, d[1] - 19 * k, 1.5 * k, 1.5 * k); g.fill(); g.strokeStyle = METAL; g.lineWidth = 1.6 * k; g.lineCap = 'round'; const w = c && c.still ? 0 : Math.sin(ph(t, 0.8)) * 3 + Math.cos(ph(t, 0.8)); line(g, [d[0] - 7 * k, d[1] - 9 * k], [d[0] - 13 * k, d[1] - (15 + w) * k]); }, {layer: 3, zb: 3, top: 34});
  pennant(B, L, 1.84, 0.14, 3, 40, {emblem: zap, pole: DARKM});
});
/* ---------- 🟩 territory floor: metal plates + rivets + seams, an odd pipe run or hazard edge ---------- */
addFloor('bolt', {name: 'Metal plates + pipes', top: '#AEB4C2', top2: '#A2A9B8', side: '#6A7084', paint: (g, q, s, i, j) => { const r = hash(i, j, 3), r2 = hash(j, i, 4);
  tileBase(g, q, s, '#B2B8C6', '#A6ADBC', (i + j) % 2 ? 0.2 : 0.8);
  g.strokeStyle = 'rgba(58,66,86,0.28)'; g.lineWidth = Math.max(1, 0.9 * s); g.beginPath(); g.moveTo(...q(0.5, 0.06)); g.lineTo(...q(0.5, 0.94)); g.stroke();
  g.fillStyle = 'rgba(58,66,86,0.5)'; [[0.14, 0.14], [0.86, 0.14], [0.86, 0.86], [0.14, 0.86]].forEach(([u, v]) => { const p = q(u, v); g.beginPath(); g.arc(p[0], p[1], 1.1 * s, 0, TAU); g.fill(); });
  if(r < 0.28){ const a = q(0.06, 0.32 + r2 * 0.3), b = q(0.94, 0.32 + r2 * 0.3); g.strokeStyle = '#6A7488'; g.lineWidth = 4.4 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.strokeStyle = '#C9D0DC'; g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(a[0], a[1] - 1 * s); g.lineTo(b[0], b[1] - 1 * s); g.stroke();
    const m = q(0.5, 0.32 + r2 * 0.3); g.fillStyle = YEL; g.fillRect(m[0] - 2 * s, m[1] - 3 * s, 4 * s, 5 * s); }
  else if(r > 0.86){ const pts = [q(0.08, 0.84), q(0.92, 0.84), q(0.92, 0.94), q(0.08, 0.94)]; polyP(g, pts); g.fillStyle = YEL; g.fill(); g.save(); g.clip(); g.fillStyle = BLK; for(let u = 0; u < 1; u += 0.16){ polyP(g, [q(u, 0.84), q(u + 0.07, 0.84), q(u + 0.1, 0.94), q(u + 0.03, 0.94)]); g.fill(); } g.restore(); }
  else if(r2 > 0.8){ boltHead(g, ...q(0.62, 0.4), 2.6 * s); } }});
/* ---------- 🧱 AR-4 (pictures 2026-11-18): 🤖 Bolt Works wall = riveted steel panels on a hazard-stripe base, team light strip · posts = pylons with a team beacon
   gate = two hazard pylons + a steel beam, a blast door that rolls UP to open ---------- */
(function(){ const {wallProp, gateProp, longFaces, WP, tallWallProp, tallGateProp} = K.AR;
  const skin = {name: 'Steel wall', gateName: 'Blast gate', h: 48, gateH: 100,
    seg(B, L, r, c, v){ const [x, y, w, d, ax] = r, len = ax === 'x' ? w : d, b0 = B.box(x, y, 0, w, d, 6, BLK);
      ['front', 'right', 'left', 'back'].forEach(s => B.decal(b0, s, ...F(b0, s), 0, 6, YEL, {paint: hazard(0, 6)}));
      const pb = B.box(x, y, 6, w, d, 21, METAL); ['front', 'right', 'left', 'back'].forEach(s => { const lf = longFaces(ax).indexOf(s) >= 0; B.decal(pb, s, ...F(pb, s), 0, 21, METAL, {paint: seams(lf ? Math.max(1, Math.round(len * 4)) : 1, 21)}); });
      trim(B, L, pb, 9, 3, longFaces(ax)); B.box(x, y, 27, w, d, 3, DARKM); },
    post(B, L, kind, c){ const P = WP, H = 34, b = B.box(0.5 - P, 0.5 - P, 0, 2 * P, 2 * P, H, DARKM);
      ['front', 'right', 'left', 'back'].forEach(s => { B.decal(b, s, ...F(b, s), 0, 6, YEL, {paint: hazard(0, 6)}); B.decal(b, s, ...F(b, s), 6, H - 6, DARKM, {paint: seams(2, H - 6)}); });
      trim(B, L, b, 22, 3); B.box(0.5 - P - 0.03, 0.5 - P - 0.03, H, 2 * P + 0.06, 2 * P + 0.06, 3, METAL);
      const on = lightOf(c); B.drum(0.5, 0.5, H + 3, 0.085, 5, c && c.broken ? '#5A5560' : teamOf(L), {rings: 1}); if(on) halo(B, 0.5, 0.5, H + 6, 11, teamOf(L), 0.5 * on); },
    gate(B, L, open, c, v){ const t = 0.22, H = 56, oz = 44, on = lightOf(c);
      [[0, 0.26], [0.74, 0.26]].forEach(([x0, w]) => { const b = B.box(x0, 0.5 - t, 0, w, 2 * t, H, DARKM);
        ['front', 'right', 'left', 'back'].forEach(s => { B.decal(b, s, ...F(b, s), 0, 9, YEL, {paint: hazard(0, 9)}); B.decal(b, s, ...F(b, s), 9, H - 9, DARKM, {paint: seams(2, H - 9)}); });
        trim(B, L, b, 44, 3); B.box(x0 - 0.02, 0.5 - t - 0.02, H, w + 0.04, 2 * t + 0.04, 3, METAL); });
      const li = B.box(0.26, 0.5 - 0.13, oz, 0.48, 0.26, 10, METAL); ['front', 'back'].forEach(s => B.decal(li, s, ...F(li, s), 0, 10, YEL, {paint: hazard(2, 6)}));
      B.drum(0.5, 0.5, oz + 10, 0.07, 4, c && c.broken ? '#5A5560' : teamOf(L), {rings: 1}); if(on) halo(B, 0.5, 0.5, oz + 13, 12, teamOf(L), 0.55 * on);
      if(c && c.broken){ B.box(0.28, 0.5 - 0.05, 0, 0.44, 0.1, 14, D.sh(STEEL, -0.3)); }
      else { const dz = open ? oz - 6 : 0, dh = open ? 6 : oz, db = B.box(0.26, 0.5 - 0.05, dz, 0.48, 0.1, dh, STEEL);
        ['front', 'back'].forEach(s => { B.decal(db, s, ...F(db, s), 0, dh, STEEL, {paint: seams(3, dh)}); if(!open){ B.decal(db, s, ...F(db, s), 0, 7, YEL, {paint: hazard(0, 7)}); } });
        if(!open) trim(B, L, db, 24, 3, ['front', 'back']); }
      if(!(c && c.broken)) [[0.13], [0.87]].forEach(([x]) => pennant(B, L, x, 0.5, H + 3, 20, {w: 11, hh: 7, emblem: zap, pole: DARKM})); } };
  wallProp('bolt', 'bolt', skin); gateProp('bolt', 'bolt', skin);
  // 🏯 tall: the steel wall on a bulkhead rampart (hazard foot + panel seams + a walkway rail) · towers = square pylons with a team band, a turret drum + team beacon · gatehouse = a blast door under a steel bridge
  const tall = {name: 'Bulkhead wall', gateName: 'Blast gatehouse', base: 30, h: 108, gateH: 112,
    rampart(B, L, r, c, hb){ const [x, y, w, d, ax] = r, e = 0.07, len = ax === 'x' ? w : d, bx = ax === 'x' ? [x, y - e, w, d + 2 * e] : [x - e, y, w + 2 * e, d];
      const b0 = B.box(bx[0], bx[1], 0, bx[2], bx[3], 8, BLK); ['front', 'right', 'left', 'back'].forEach(s => B.decal(b0, s, ...F(b0, s), 0, 8, YEL, {paint: hazard(0, 8)}));
      const b = B.box(bx[0], bx[1], 8, bx[2], bx[3], hb - 10, DARKM); ['front', 'right', 'left', 'back'].forEach(s => { const lf = longFaces(ax).indexOf(s) >= 0; B.decal(b, s, ...F(b, s), 0, hb - 10, DARKM, {paint: seams(lf ? Math.max(1, Math.round(len * 3)) : 1, hb - 10)}); });
      B.box(bx[0], bx[1], hb - 2, bx[2], bx[3], 2, METAL); },
    tower(B, L, c, cx, cy, hb, kind, hw){ const br = c && c.broken, on = lightOf(c), H = hb + 34, HH = br ? H - 14 : H, b = B.box(cx - hw, cy - hw, 0, 2 * hw, 2 * hw, HH, DARKM);
      ['front', 'right', 'left', 'back'].forEach(s => { B.decal(b, s, ...F(b, s), 0, 9, YEL, {paint: hazard(0, 9)}); B.decal(b, s, ...F(b, s), 9, HH - 9, DARKM, {paint: seams(2, HH - 9)}); });
      ['front', 'right'].forEach(s => B.decal(b, s, (s === 'front' ? cx : cy) - 0.05, 0.1, hb + 6, 5, CYAN, {k: 'win'}));
      trim(B, L, b, HH - 14, 3); if(br) return;
      B.box(cx - hw - 0.03, cy - hw - 0.03, H, 2 * hw + 0.06, 2 * hw + 0.06, 3, METAL);
      B.drum(cx, cy, H + 3, hw * 0.75, 9, METAL, {rings: 2}); B.drum(cx, cy, H + 12, hw * 0.45, 5, teamOf(L), {rings: 1});
      if(on) halo(B, cx, cy, H + 15, kind === 'gate' ? 11 : 14, teamOf(L), 0.55 * on); },
    gatehouse(B, L, open, c, hb){ const br = c && c.broken, on = lightOf(c), oz = 44, H = hb + 32, t = 0.16;
      if(br) B.box(0.28, 0.5 - 0.05, 0, 0.44, 0.1, 14, D.sh(STEEL, -0.3));
      else { const dz = open ? oz - 6 : 0, dh = open ? 6 : oz, db = B.box(0.26, 0.5 - 0.05, dz, 0.48, 0.1, dh, STEEL);
        ['front', 'back'].forEach(s => { B.decal(db, s, ...F(db, s), 0, dh, STEEL, {paint: seams(3, dh)}); if(!open) B.decal(db, s, ...F(db, s), 0, 7, YEL, {paint: hazard(0, 7)}); });
        if(!open) trim(B, L, db, 24, 3, ['front', 'back']); }
      const b = B.box(0.26, 0.5 - t, oz, 0.48, 2 * t, br ? 6 : H - oz, METAL); ['front', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, br ? 6 : H - oz, YEL, {paint: hazard(0, 5)}));
      if(br) return; trim(B, L, b, H - oz - 8, 3, ['front', 'back']);
      B.drum(0.5, 0.5, H, 0.08, 5, teamOf(L), {rings: 1}); if(on) halo(B, 0.5, 0.5, H + 3, 13, teamOf(L), 0.55 * on);
      pennant(B, L, 0.5, 0.5 + t * 0.5, H, 18, {w: 11, hh: 7, emblem: zap, pole: DARKM}); } };
  tallWallProp('bolt', 'bolt', skin, tall); tallGateProp('bolt', 'bolt', skin, tall);
})();
/* ---------- 🏺 ORIGIN RELIC (ip-4g, 🌳 IsoProps chat 2026-11-20, Aowu "go" on the 10 names) — 🤖 The First Robot Head:
   a huge rounded robot head (ear bolts that turn, one antenna with a blinking bulb, a team-colour neck collar) on a riveted metal pedestal with a hazard band;
   its SCREEN FACE changes every beat — open eyes · happy ^ ^ · looks left · blinks · looks right · heart eyes — with a scan line rolling down.
   2 × 2 landmark, states home · taken (an empty socket, two loose cables sparking + the head's outline + a twinkle). Props.AR.ORIGIN.bolt.icon = the carried form. ---------- */
(function(){ const dead = c => !!(c && c.broken), still = c => !!(c && c.still), dim = (c, col, f) => c ? (c.broken ? D.sh(col, -0.42) : D.sh(col, f == null ? -0.18 : f)) : col,
    tw = (t, i) => 0.55 + 0.3 * Math.sin(ph(t, 2.4) + i * 1.7) + 0.15 * Math.cos(ph(t, 2.4) + i * 0.9);
  // the 6 screen faces (one per beat of the live loop)
  const FACES = ['open', 'happy', 'left', 'blink', 'right', 'heart'];
  function eyes(g, x, y, s, kind, col){ g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = 2.6 * s;
    [-1, 1].forEach(sd => { const ex = x + sd * 10 * s, ey = y;
      if(kind === 'open' || kind === 'left' || kind === 'right'){ const dx = kind === 'left' ? -3 * s : kind === 'right' ? 3 * s : 0; g.beginPath(); D.rr(g, ex - 4 * s + dx, ey - 5.4 * s, 8 * s, 10.8 * s, 3.4 * s); g.fill(); g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.arc(ex - 1.6 * s + dx, ey - 2.6 * s, 1.4 * s, 0, TAU); g.fill(); g.fillStyle = col; }
      else if(kind === 'happy'){ g.beginPath(); g.moveTo(ex - 4.4 * s, ey + 2 * s); g.lineTo(ex, ey - 3.4 * s); g.lineTo(ex + 4.4 * s, ey + 2 * s); g.stroke(); }
      else if(kind === 'blink'){ g.beginPath(); g.moveTo(ex - 4.4 * s, ey); g.lineTo(ex + 4.4 * s, ey); g.stroke(); }
      else { g.beginPath(); for(let i = 0; i < 26; i++){ const a = i / 26 * TAU, hx = 16 * Math.pow(Math.sin(a), 3), hy = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); g.lineTo(ex + hx / 3.4 * s, ey - hy / 3.4 * s); } g.closePath(); g.fillStyle = '#FF7AA8'; g.fill(); g.fillStyle = col; } }); }
  // 🤖 the head: x, y = the bottom of the neck. o.face = FACES index · o.scan 0..1 · o.bolt = ear-bolt turn · o.bulb 0..1 · o.collar = team colour
  function head(g, x, y, s, c, o){ o = o || {}; const hull = dim(c, HULL), h2 = dim(c, HULL2), dk = dim(c, DARKM), lv = lightOf(c), W = 64 * s, Hh = 52 * s, x0 = x - W / 2, y0 = y - 10 * s - Hh;
    g.fillStyle = o.collar ? (dead(c) ? '#6A6A78' : o.collar) : dim(c, YEL); g.beginPath(); D.rr(g, x - 16 * s, y - 12 * s, 32 * s, 12 * s, 4 * s); g.fill(); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - 16 * s, y - 4 * s, 32 * s, 2 * s);   // the neck collar
    [-1, 1].forEach(sd => { const ex = x + sd * (W / 2 + 3 * s), ey = y0 + Hh * 0.5; g.fillStyle = dk; g.beginPath(); D.rr(g, ex - 5 * s, ey - 10 * s, 10 * s, 20 * s, 4 * s); g.fill();   // ear bolts that turn
      g.save(); g.translate(ex + sd * 2 * s, ey); g.rotate((o.bolt || 0) * sd); g.fillStyle = dim(c, STEEL); g.beginPath(); for(let i = 0; i < 6; i++){ const a = i / 6 * TAU; g.lineTo(Math.cos(a) * 5 * s, Math.sin(a) * 5 * s); } g.closePath(); g.fill(); g.fillStyle = dim(c, METAL); g.fillRect(-3.4 * s, -0.9 * s, 6.8 * s, 1.8 * s); g.restore(); });
    g.fillStyle = D.sh(h2, -0.22); g.beginPath(); D.rr(g, x0 + 7 * s, y0 - 4 * s, W, Hh, 16 * s); g.fill(); g.fillStyle = D.sh(h2, 0.05); g.beginPath(); D.rr(g, x0 + 3.5 * s, y0 - 2 * s, W, Hh, 16 * s); g.fill();   // the head has depth (its right side + top)
    g.fillStyle = D.lin(g, x0, y0, x0 + W, y0 + Hh, [[0, '#FFFFFF'], [0.4, hull], [1, h2]]); g.beginPath(); D.rr(g, x0, y0, W, Hh, 16 * s); g.fill();
    g.fillStyle = 'rgba(58,66,86,0.35)'; [[x0 + 7 * s, y0 + 7 * s], [x0 + W - 7 * s, y0 + 7 * s], [x0 + 7 * s, y0 + Hh - 7 * s], [x0 + W - 7 * s, y0 + Hh - 7 * s]].forEach(([a, b]) => { g.beginPath(); g.arc(a, b, 1.6 * s, 0, TAU); g.fill(); });   // rivets
    const sx = x0 + 9 * s, sy = y0 + 9 * s, sw = W - 18 * s, shh = Hh - 18 * s; g.fillStyle = dk; g.beginPath(); D.rr(g, sx - 2 * s, sy - 2 * s, sw + 4 * s, shh + 4 * s, 9 * s); g.fill();
    g.fillStyle = lv ? D.lin(g, 0, sy, 0, sy + shh, [[0, '#26407A'], [1, '#16244A']]) : '#2A2A30'; g.beginPath(); D.rr(g, sx, sy, sw, shh, 8 * s); g.fill();
    if(lv){ const col = lv === 1 ? CYAN : '#5AAAB8'; g.save(); g.beginPath(); D.rr(g, sx, sy, sw, shh, 8 * s); g.clip();
      g.fillStyle = 'rgba(95,232,255,0.12)'; for(let yy = sy + 2 * s; yy < sy + shh; yy += 3 * s) g.fillRect(sx, yy, sw, 1 * s);   // screen lines
      if(o.scan != null){ g.fillStyle = 'rgba(160,250,255,0.3)'; g.fillRect(sx, sy + o.scan * shh - 2 * s, sw, 4 * s); }
      eyes(g, x, sy + shh * 0.44, s, FACES[o.face || 0], col); g.strokeStyle = col; g.lineWidth = 2 * s; g.lineCap = 'round'; g.beginPath(); g.arc(x, sy + shh * 0.62, 6 * s, 0.25 * Math.PI, 0.75 * Math.PI); g.stroke(); g.restore(); }
    else { g.strokeStyle = '#4A4A55'; g.lineWidth = 1.4 * s; line(g, [sx + 6 * s, sy + 6 * s], [sx + sw * 0.6, sy + shh * 0.7]); line(g, [sx + sw * 0.6, sy + shh * 0.7], [sx + sw - 4 * s, sy + shh * 0.4]); }   // a cracked dark screen
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(x0 + 14 * s, y0 + 6 * s, 9 * s, 2.4 * s, -0.15, 0, TAU); g.fill();
    const ax = x + 14 * s, ay = y0; g.strokeStyle = dk; g.lineWidth = 2 * s; g.lineCap = 'round'; line(g, [ax, ay], [ax + 3 * s, ay - 16 * s]);   // the antenna + its bulb
    g.fillStyle = lv ? (o.bulb > 0.5 ? '#FF4A4A' : '#B83A3A') : '#6A5A5A'; g.beginPath(); g.arc(ax + 3 * s, ay - 18 * s, 3.6 * s, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(ax + 2 * s, ay - 19.2 * s, 1.1 * s, 0, TAU); g.fill(); }
  const def = add('bolt', 'bolt_relic', {name: 'The First Robot Head', look: 'bolt', side: 'bolt', slot: 'origin', kind: 'landmark', foot: [2, 2], door: null, h: 134, variants: 1, block: true,
    states: ['home', 'taken'], state: 'home', tags: ['ar', 'ar-origin', 'ar-bolt', 'relic', 'origin'], live: {period: 2.4, frames: 6},
    diffs: [{by: 'state', a: 'home', b: 'taken', level: 'bold', name: 'the First Robot Head carried off (empty socket + loose cables)'}]});
  def.build = (B, v, L) => { const c = L.cond, br = dead(c), home = (L.state || 'home') === 'home' && !br, H = br ? 10 : 26; K.AR.kerb(B, L, 2, 2);
    B.flat(0.06, 0.06, 1.88, 1.88, '#C9CFDA');
    const b = B.box(0.3, 0.3, 0, 1.4, 1.4, H, METAL); plate(B, b, H, 4); if(!br) ['front', 'right'].forEach(sd => B.decal(b, sd, ...F(b, sd), 2, 5, YEL, {paint: hazard(0, 5)})); trim(B, L, b, H - 7, 3);   // ⚙️ the riveted pedestal + hazard band
    B.box(0.55, 0.55, H, 0.9, 0.9, 3, DARKM);
    if(home){ halo(B, 1, 1, H + 36, 46, '#BFF4FF', 0.26, {pulse: t => still(c) ? 1 : 0.9 + Math.sin(ph(t, 2.4)) * 0.07 + Math.cos(ph(t, 2.4)) * 0.03});
      B.custom(1, 1, (g, P, k, t) => { const q = P(1, 1, H + 3), th = ph(t, 2.4), f = still(c) ? 0 : Math.round(th / (TAU / 6)) % 6;   // 🤖 a new face every beat
        head(g, q[0], q[1], k * 1.08, c, {face: f, scan: still(c) ? null : ((th / TAU) % 1), bolt: still(c) ? 0 : th / 3, bulb: still(c) ? 0 : 0.5 + 0.5 * Math.cos(th * 2), collar: teamOf(L)}); }, {layer: 6, zb: H + 3, top: 132});
      B.custom(1, 1, (g, P, k, t) => { if(still(c)) return; const q = P(1, 1, H + 3), th = ph(t, 2.4), s = k * 1.08, ax = q[0] + 17 * s, ay = q[1] - 62 * s - 18 * s; D.glow(g, ax, ay, (9 + 5 * (0.5 + 0.5 * Math.cos(th * 2))) * k, '#FF6A6A', 0.5);
        [[-46, -40], [44, -24], [-20, -96]].forEach(([dx, dy], i) => { g.fillStyle = 'rgba(220,250,255,0.95)'; g.beginPath(); D.star(g, q[0] + dx * k, q[1] + dy * k, (2.4 + tw(t, i) * 1.6) * k, 0.9 * k, 4); g.fill(); }); }, {layer: 7, zb: H + 3, top: 132, fx: true});
    } else if(!br) B.custom(1, 1, (g, P, k, t) => { const q = P(1, 1, H + 3), s = k * 1.08; g.fillStyle = '#1E2230'; g.beginPath(); D.ell(g, q[0], q[1] - 4 * k, 12 * k, 5 * k); g.fill();   // taken: the empty socket, two loose cables sparking
      [[-1, '#E85A4A'], [1, '#3D7FD9']].forEach(([sd, col]) => { g.strokeStyle = col; g.lineWidth = 2.4 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(q[0] + sd * 6 * k, q[1] - 4 * k); g.quadraticCurveTo(q[0] + sd * 14 * k, q[1] - 20 * k, q[0] + sd * 20 * k, q[1] - 10 * k); g.stroke();
        if(!still(c)){ const sp = tw(t, sd + 2); g.strokeStyle = '#FFE14A'; g.lineWidth = 1.2 * k; [0, 1, 2].forEach(i => { const a = i * 2.1 + sd; line(g, [q[0] + sd * 20 * k, q[1] - 10 * k], [q[0] + sd * 20 * k + Math.cos(a) * (3 + sp * 4) * k, q[1] - 10 * k + Math.sin(a) * (3 + sp * 4) * k]); }); } });
      g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.6 * k; g.setLineDash([3 * k, 2.4 * k]); g.beginPath(); D.rr(g, q[0] - 32 * s, q[1] - 62 * s, 64 * s, 52 * s, 16 * s); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(200,245,255,0.95)'; g.beginPath(); D.star(g, q[0] + 2 * k, q[1] - 36 * s, (2.6 + tw(t, 1)) * k, 1 * k, 4); g.fill(); }, {layer: 6, zb: H + 3, top: H + 70});
    [[0.2, 1.8], [1.8, 0.2]].forEach(([x, y]) => pennant(B, L, x, y, 0, 46, {emblem: zap, pole: DARKM})); };
  const AR = Props.AR; AR.ORIGIN = AR.ORIGIN || {}; AR.ORIGIN.bolt = {key: 'bolt_relic', name: 'The First Robot Head', icon: (g, x, y, k, lit) => head(g, x, y + 18 * k, k * 0.5, lit === false ? {broken: 0} : null, {face: 1, collar: '#FFD23F', bulb: lit === false ? 0 : 1})};
})();
/* 🏺 end ip-4g relic */
})();
K.loaded('bolt', 'ip-4g');
})(window.Props && window.Props._K);
