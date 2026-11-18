
/* 🌍 IsoLook_raptor — 🦖 Raptor Ridge — AvataRealm side on 🌴 jungle (needs realm) — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['raptor'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/raptor.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_raptor: include IsoProps first'); return; }
if(!K.AR){ console.warn('IsoLook_raptor: load IsoLook_realm first (Props.need does it)'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🦖 raptor · Raptor Ridge (AvataRealm side ②a, ar-1 pictures, 🌳 IsoProps chat 2026-11-17).
   Built ON 🌴 jungle (its trees, ground, 🍂 versions) + 🏰 realm (team colours · 🏗️ site steps · slots). 11 buildings = AvataRealm §14a:
   🏠 nest → fern hut → Volcano-rock Fort (giant egg dome) · 🏕️ Bone-fence Yard · 🎠 Rex Stable · 🪽 Ptera Cliff · 🩹 Fern Hollow · 🔧 Boulder Pit ·
   🗼 Tall-tree Lookout · 🎨 Leaf Weaver · 🔮 Amber Shrine · 🕵️ Tall-grass Den · 🐾 Hatchery. Keys raptor_<slot>. */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, halo} = T;
const {pennant, banner, trim, building, addSide, addFloor, tileBase, hash, teamOf, patOf, inkOf} = K.AR;
const D = PD, M = MAT, TAU = Math.PI * 2, S2 = Math.SQRT2;
const BAS = '#7A7484', BAS2 = '#615B6C', BONE = '#F4EAD2', BONED = '#CDBE98', FERN = '#4CB13A', FERN2 = '#2E8B3A', AMB = '#FF9A2E', MUD = '#C08A56', EGG = '#F8EFD9', SPOT = '#3FB8A8', BARK = '#8A5A34', MOSS = '#7FB24A';
// 🦶 the side's emblem: a three-toe dino footprint
function claw(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); D.ell(g, x, y + r * 0.35, r * 0.48, r * 0.42); g.fill(); [[-0.62, -0.42, -0.5], [0, -0.72, 0], [0.62, -0.42, 0.5]].forEach(([dx, dy, a]) => { g.beginPath(); D.ell(g, x + dx * r, y + dy * r, r * 0.2, r * 0.36, a); g.fill(); }); }
addSide('raptor', {name: 'Raptor Ridge', icon: '🦖', look: 'raptor', accent: AMB, emblem: claw, base: 'jungle'});
addLook('raptor', {name: 'Raptor Ridge', walls: ['#C08A56', '#B9A27A', '#D6A26C'], roofs: [FERN, '#E3BE6A', FERN2], trim: '#5A3418', accent: AMB, stilts: false, team: null, side: 'raptor',
  res: {coin: '#FF9A2E', coinDk: '#B8561A', rock: '#8C8496', brick: '#5DBB46', brickDk: '#2E8B3A', leaf: '#3FA53A', bark: '#8A5A34', gem: '#3FD6C2', gemDk: '#1C8A7E', gemHi: '#D8FFF8'}}, 'jungle');
/* ---------- 🖌️ raptor painters ---------- */
// 🪨 volcanic rock blocks on a face (decal paint): rows of rounded stones, h = face height px
const rocks = (h, col, seed) => (g, Q, k) => { const R = rnd(seed || 7); for(let z = 0, row = 0; z < h - 1; z += 9, row++){ let u = row % 2 ? -0.08 : 0; const zh = Math.min(9, h - z);
  while(u < 1){ const w = 0.16 + R() * 0.14, u0 = Math.max(0, u + 0.012), u1 = Math.min(1, u + w - 0.012); if(u1 > u0 + 0.02){ const sh2 = (R() - 0.5) * 0.2;
      polyP(g, [Q(u0, z + 1), Q(u1, z + 1), Q(u1, z + zh - 1), Q(u0, z + zh - 1)]); g.fillStyle = D.sh(col, sh2); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.32)'; g.lineWidth = 0.9 * k; g.stroke();
      if(R() < 0.25){ g.fillStyle = 'rgba(127,178,74,0.75)'; polyP(g, [Q(u0, z + zh - 1), Q(u1, z + zh - 1), Q(u1, z + zh - 3), Q((u0 + u1) / 2, z + zh - 4.5), Q(u0, z + zh - 2.5)]); g.fill(); } }
    u += w; } } };
function bone(g, a, b, w, col){ g.lineCap = 'round'; g.strokeStyle = col || BONE; g.lineWidth = w; line(g, a, b); g.fillStyle = col || BONE; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w * 0.42, ny = dx / L * w * 0.42;
  [a, b].forEach(p => { g.beginPath(); g.arc(p[0] + nx, p[1] + ny, w * 0.62, 0, TAU); g.fill(); g.beginPath(); g.arc(p[0] - nx, p[1] - ny, w * 0.62, 0, TAU); g.fill(); });
  g.strokeStyle = 'rgba(42,28,20,0.18)'; g.lineWidth = 0.8; line(g, [a[0] + nx * 0.5, a[1] + ny * 0.5], [b[0] + nx * 0.5, b[1] + ny * 0.5]); }
// a curved rib / tusk (screen space): from base upwards, bending toward dir
function tusk(g, x, y, k, len, dir, w){ g.fillStyle = BONE; g.beginPath(); g.moveTo(x - w * k, y); g.quadraticCurveTo(x - w * k + dir * 2 * k, y - len * 0.6 * k, x + dir * len * 0.45 * k, y - len * k); g.quadraticCurveTo(x + w * k + dir * 4 * k, y - len * 0.5 * k, x + w * k, y); g.closePath(); g.fill();
  g.fillStyle = 'rgba(160,140,100,0.35)'; g.beginPath(); g.moveTo(x + w * 0.2 * k, y); g.quadraticCurveTo(x + w * k + dir * 3 * k, y - len * 0.5 * k, x + dir * len * 0.45 * k, y - len * k); g.quadraticCurveTo(x + w * 0.4 * k + dir * 3 * k, y - len * 0.45 * k, x + w * k, y); g.closePath(); g.fill(); }
function frond(g, x, y, k, len, ang, col, c){ const ex = x + Math.sin(ang) * len * k, ey = y - Math.cos(ang) * len * k, mx = x + Math.sin(ang) * len * 0.55 * k + Math.cos(ang) * len * 0.12 * k, my = y - Math.cos(ang) * len * 0.55 * k + Math.sin(ang) * len * 0.12 * k;
  const cl = c ? (c.broken ? '#8A7A5A' : D.sh(col, -0.25)) : col; g.strokeStyle = D.sh(cl, -0.25); g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(mx, my, ex, ey); g.stroke();
  for(let i = 1; i < 8; i++){ const f = i / 8, px = x + (mx - x) * 2 * f * (1 - f) + (ex - x) * f * f, py = y + (my - y) * 2 * f * (1 - f) + (ey - y) * f * f, L2 = (1 - f * 0.7) * len * 0.26 * k;
    [-1, 1].forEach(sd => { g.fillStyle = sd > 0 ? cl : D.sh(cl, -0.12); g.beginPath(); D.ell(g, px + Math.cos(ang) * sd * L2 * 0.6, py + Math.sin(ang) * sd * L2 * 0.6 - L2 * 0.2, L2 * 0.55, L2 * 0.22, ang + sd * 0.9); g.fill(); }); } }
function egg(g, x, y, r, c, o){ o = o || {}; g.fillStyle = D.rad(g, x - r * 0.35, y - r * 0.55, 1, r * 1.6, [[0, '#FFFFFF'], [0.5, c && c.broken ? '#CFC5B0' : (o.col || EGG)], [1, D.sh(o.col || EGG, -0.22)]]);
  g.beginPath(); g.moveTo(x, y - r * 1.3); g.bezierCurveTo(x + r * 0.95, y - r * 1.3, x + r, y + r * 0.6, x, y + r * 0.62); g.bezierCurveTo(x - r, y + r * 0.6, x - r * 0.95, y - r * 1.3, x, y - r * 1.3); g.fill();
  g.fillStyle = o.spot || SPOT; const R = rnd(Math.round(x * 13 + y * 7)); for(let i = 0; i < (o.n || 5); i++){ g.beginPath(); D.ell(g, x + (R() - 0.5) * r * 1.1, y - r * 0.9 + R() * r * 1.4, r * 0.13, r * 0.1); g.fill(); } }
function nest(g, x, y, k, rx, c){ const ry = rx * 0.5; g.fillStyle = '#8A6A44'; g.beginPath(); D.ell(g, x, y, rx * k, ry * k); g.fill(); g.fillStyle = '#5A3A22'; g.beginPath(); D.ell(g, x, y - 2 * k, rx * 0.72 * k, ry * 0.62 * k); g.fill();
  g.strokeStyle = c ? '#7A6A5A' : '#B08A5A'; g.lineWidth = 1.1 * k; const R = rnd(Math.round(rx * 31)); for(let i = 0; i < 22; i++){ const a = R() * TAU, a2 = a + 0.5 + R() * 0.4; g.beginPath(); g.moveTo(x + Math.cos(a) * rx * k * 0.95, y + Math.sin(a) * ry * k * 0.95); g.quadraticCurveTo(x + Math.cos((a + a2) / 2) * rx * 1.15 * k, y + Math.sin((a + a2) / 2) * ry * 1.15 * k - 2 * k, x + Math.cos(a2) * rx * 0.9 * k, y + Math.sin(a2) * ry * 0.9 * k); g.stroke(); } }
// 🌿 a fern-leaf roof skin over a roof part: rows of leaf scallops (custom, world space) — r = roof part
function leafRows(B, r, col, L){ if(L) B.custom(r.x + r.w / 2, r.y + r.d / 2, (g, P, k) => { const ov = r.ov || 0.16, zr = r.z + r.rh + 1, a = r.ridge === 'x' ? P(r.x - ov, r.y + r.d / 2, zr) : P(r.x + r.w / 2, r.y - ov, zr), b2 = r.ridge === 'x' ? P(r.x + r.w + ov, r.y + r.d / 2, zr) : P(r.x + r.w / 2, r.y + r.d + ov, zr);
    g.strokeStyle = L.cond && L.cond.broken ? '#6A6060' : teamOf(L); g.lineWidth = 4 * k; g.lineCap = 'round'; line(g, a, b2); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1.2 * k; line(g, [a[0], a[1] - 1 * k], [b2[0], b2[1] - 1 * k]); }, {layer: (r.layer || 0) + 0.6, zb: r.z + r.rh, top: r.z + r.rh + 3});
  B.custom(r.x + r.w / 2, r.y + r.d / 2, (g, P, k, t, T2) => { const ov = r.ov || 0.16, x0 = r.x - ov, x1 = r.x + r.w + ov, y0 = r.y - ov, y1 = r.y + r.d + ov;
    const front = vis(T2, 0, 1), right = vis(T2, 1, 0); const rows = 4, z = r.z, zr = r.z + r.rh;
    const scallop = (A, Bp, n, cl) => { for(let i = 0; i < n; i++){ const f0 = i / n, f1 = (i + 1) / n, a = [A[0] + (Bp[0] - A[0]) * f0, A[1] + (Bp[1] - A[1]) * f0], b = [A[0] + (Bp[0] - A[0]) * f1, A[1] + (Bp[1] - A[1]) * f1];
      g.fillStyle = cl; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 5 * k, b[0], b[1]); g.closePath(); g.fill(); } };
    if(r.ridge === 'x' ? front : right){ for(let i = 0; i < rows; i++){ const f = (i + 1) / rows, zz = zr - (zr - z) * f;
        if(r.ridge === 'x'){ const yy = (y0 + y1) / 2 + ((y1 - y0) / 2) * f; scallop(P(x0, yy, zz), P(x1, yy, zz), Math.round((x1 - x0) * 5), i % 2 ? D.sh(col, -0.1) : D.sh(col, 0.08)); }
        else { const xx = (x0 + x1) / 2 + ((x1 - x0) / 2) * f; scallop(P(xx, y1, zz), P(xx, y0, zz), Math.round((y1 - y0) * 5), i % 2 ? D.sh(col, -0.18) : D.sh(col, -0.06)); } } } }, {layer: (r.layer || 0) + 0.5, zb: r.z, top: r.z + r.rh}); }
const RR = (slot, o, build) => building('raptor', slot, o, build);
const tc = L => teamOf(L);
/* ============================ 🏠 HOUSE — 3 levels, each a new SHAPE ============================ */
RR('house', {name: 'Volcano-rock Fort', h: 138, names: {'1': 'Twig Nest', '2': 'Fern Hut', '3': 'Volcano-rock Fort'}}, (B, v, L) => { const c = L.cond, lv = L.state || '1';
  if(lv === '1'){ // 🪺 a big twig nest with 3 eggs + a little fern lean-to + the team pennant on a bone pole
    B.flat(0.1, 0.1, 2.8, 1.8, MOSS);
    B.custom(1.2, 1.0, (g, P, k) => { const q = P(1.2, 1.0, 0); nest(g, q[0], q[1] - 6 * k, k, 34, c); egg(g, q[0] - 10 * k, q[1] - 16 * k, 8 * k, c); egg(g, q[0] + 9 * k, q[1] - 15 * k, 7.4 * k, c, {spot: AMB}); egg(g, q[0] + 1 * k, q[1] - 11 * k, 8.4 * k, c);
      g.strokeStyle = '#B08A5A'; g.lineWidth = 1.2 * k; for(let i = 0; i < 9; i++){ const a = Math.PI * (0.1 + i * 0.1); g.beginPath(); g.moveTo(q[0] + Math.cos(a) * 30 * k, q[1] - 6 * k + Math.sin(a) * 15 * k); g.lineTo(q[0] + Math.cos(a + 0.4) * 36 * k, q[1] - 7 * k + Math.sin(a + 0.4) * 18 * k); g.stroke(); } }, {layer: 2, zb: 0, top: 30});
    [[2.2, 0.3], [2.8, 0.3]].forEach(p => B.box(p[0], p[1], 0, 0.1, 0.1, 30, BARK));
    const lr = B.roof(2.1, 0.2, 18, 0.86, 1.1, 14, FERN, {ridge: 'y', ov: 0.1, layer: 1}); leafRows(B, lr, FERN, L);
    B.box(2.2, 1.2, 0, 0.6, 0.5, 6, '#B08A5A', {layer: 1});
    B.custom(0.3, 0.3, (g, P, k) => { const a = P(0.3, 0.3, 0), b2 = P(0.3, 0.3, 40); bone(g, a, b2, 4 * k); }, {layer: 3, zb: 0, top: 40});
    pennant(B, L, 0.3, 0.3, 40, 18, {emblem: claw, pole: BONED});
    return; }
  if(lv === '2'){ // 🛖 fern hut: a round mud hut on a rock ring, a huge fern-leaf cone roof, a bone-arch door, a nest annex with an egg
    B.drum(1.3, 1.0, 0, 0.86, 12, BAS, {rings: 2});
    B.drum(1.3, 1.0, 12, 0.74, 32, MUD, {rings: 3});
    B.custom(1.3, 1.0, (g, P, k, t, T2) => { if(!vis(T2, 0, 1) && !vis(T2, 1, 0)) return; const fr = vis(T2, 0, 1) ? [1.3, 1.0 + 0.74] : [1.3 + 0.74, 1.0], a = P(fr[0], fr[1], 12);
      g.fillStyle = '#3A2A20'; g.beginPath(); g.moveTo(a[0] - 8 * k, a[1]); g.lineTo(a[0] - 8 * k, a[1] - 16 * k); g.quadraticCurveTo(a[0], a[1] - 29 * k, a[0] + 8 * k, a[1] - 16 * k); g.lineTo(a[0] + 8 * k, a[1]); g.closePath(); g.fill();
      g.strokeStyle = BONE; g.lineWidth = 3 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0] - 10 * k, a[1] + 1 * k); g.lineTo(a[0] - 10 * k, a[1] - 16 * k); g.quadraticCurveTo(a[0], a[1] - 32 * k, a[0] + 10 * k, a[1] - 16 * k); g.lineTo(a[0] + 10 * k, a[1] + 1 * k); g.stroke(); }, {layer: 2, zb: 12, top: 44});
    B.cone(1.3, 1.0, 40, 1.08, 46, FERN, {stripes: 14});
    B.custom(1.3, 1.0, (g, P, k) => { const q = P(1.3, 1.0, 40), rx = 1.08 * HTW * k * S2; for(let i = 0; i < 13; i++){ const u = -1 + i / 6, x = q[0] + u * rx * 0.96, y = q[1] + Math.sqrt(Math.max(0, 1 - u * u)) * rx * 0.48;
      g.fillStyle = i % 2 ? (c ? '#8A8A5A' : FERN2) : (c ? '#9A9A6A' : FERN); g.beginPath(); D.ell(g, x, y + 2 * k, 5.4 * k, 9 * k, u * 0.5); g.fill(); } }, {layer: 3, zb: 40, top: 86});
    B.custom(2.55, 1.35, (g, P, k) => { const q = P(2.55, 1.35, 0); nest(g, q[0], q[1] - 4 * k, k, 16, c); egg(g, q[0], q[1] - 11 * k, 7 * k, c, {spot: AMB}); }, {layer: 2, zb: 0, top: 20});
    pennant(B, L, 1.3, 1.0, 84, 20, {emblem: claw, pole: BONED});
    B.box(0.2, 1.45, 0, 0.36, 0.36, 8, BAS2, {layer: 1}); B.custom(0.38, 1.63, (g, P, k) => { const q = P(0.38, 1.63, 8); frond(g, q[0], q[1], k, 18, -0.5, FERN, c); frond(g, q[0], q[1], k, 16, 0.6, FERN2, c); }, {layer: 3, zb: 8, top: 26});
    return; }
  // 🏰 L3 Volcano-rock Fort: basalt walls with crenels + a gate in a bone frame, two rock turrets, a GIANT egg dome, tusks, team banners
  const w = B.box(0.12, 0.14, 0, 2.76, 1.72, 40, BAS); B.decal(w, 'front', ...F(w, 'front'), 0, 40, BAS, {paint: rocks(40, BAS, 11)}); B.decal(w, 'right', ...F(w, 'right'), 0, 40, BAS, {paint: rocks(40, BAS2, 12)});
  B.decal(w, 'left', ...F(w, 'left'), 0, 40, BAS, {paint: rocks(40, BAS, 13)}); B.decal(w, 'back', ...F(w, 'back'), 0, 40, BAS, {paint: rocks(40, BAS2, 14)});
  trim(B, L, w, 33, 4);
  B.decal(w, 'front', 1.18, 0.64, 0, 30, '#2A1C14', {k: 'door', paint: (g, Q, k) => { g.strokeStyle = BONE; g.lineWidth = 3.4 * k; g.lineCap = 'round'; const a = Q(0, 0), b2 = Q(0, 22), m = Q(0.5, 33), c2 = Q(1, 22), d2 = Q(1, 0);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b2[0], b2[1]); g.quadraticCurveTo(m[0] - (d2[0] - a[0]) * 0.1, m[1] + 2 * k, c2[0], c2[1]); g.lineTo(d2[0], d2[1]); g.stroke(); g.fillStyle = BONED; [Q(0.5, 31)].forEach(p => { g.beginPath(); g.arc(p[0], p[1], 3 * k, 0, TAU); g.fill(); }); }});
  banner(B, L, w, 'front', 0.42, 0.42, 10, 22, claw); banner(B, L, w, 'front', 2.16, 0.42, 10, 22, claw); banner(B, L, w, 'right', 0.7, 0.4, 10, 22, claw);
  for(let i = 0; i < 6; i++){ B.box(0.14 + i * 0.47, 1.66, 40, 0.26, 0.2, 7, BAS2, {layer: 2}); } for(let i = 0; i < 4; i++){ B.box(2.68, 0.16 + i * 0.42, 40, 0.2, 0.24, 7, BAS2, {layer: 2}); }
  B.drum(0.32, 0.36, 0, 0.3, 58, BAS2, {rings: 5, layer: 1}); B.cone(0.32, 0.36, 58, 0.34, 16, '#E2553A', {layer: 1, stripes: 6});
  B.drum(2.66, 1.6, 0, 0.3, 52, BAS2, {rings: 4, layer: 2}); B.cone(2.66, 1.6, 52, 0.34, 16, '#E2553A', {layer: 2, stripes: 6});
  pennant(B, L, 0.32, 0.36, 72, 16, {emblem: claw}); pennant(B, L, 2.66, 1.6, 66, 16, {emblem: claw});
  B.custom(1.5, 1.0, (g, P, k) => { const q = P(1.5, 0.95, 40), rx = 0.82 * HTW * k * S2, hh = 82 * k;   // 🥚 the giant egg dome (cracked top, a round window, speckles)
    g.fillStyle = D.rad(g, q[0] - rx * 0.4, q[1] - hh * 0.6, 2, rx * 1.9, [[0, '#FFFFFF'], [0.45, c && c.broken ? '#D2C8B4' : EGG], [1, D.sh(EGG, -0.3)]]);
    g.beginPath(); g.moveTo(q[0] - rx, q[1]); g.bezierCurveTo(q[0] - rx * 1.05, q[1] - hh * 0.62, q[0] - rx * 0.62, q[1] - hh, q[0], q[1] - hh); g.bezierCurveTo(q[0] + rx * 0.62, q[1] - hh, q[0] + rx * 1.05, q[1] - hh * 0.62, q[0] + rx, q[1]);
    g.ellipse(q[0], q[1], rx, rx * 0.5, 0, 0, Math.PI, false); g.closePath(); g.fill();
    const R = rnd(91); g.fillStyle = c ? '#7A9A94' : SPOT; for(let i = 0; i < 16; i++){ const a = R() * 0.9 + 0.05, b = (R() - 0.5) * 1.6; g.beginPath(); D.ell(g, q[0] + b * rx * Math.sin(Math.PI * a) * 0.95, q[1] - hh * a, 4 * k, 3 * k, R()); g.fill(); }
    g.strokeStyle = 'rgba(42,28,20,0.55)'; g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(q[0] - rx * 0.5, q[1] - hh * 0.82); g.lineTo(q[0] - rx * 0.3, q[1] - hh * 0.9); g.lineTo(q[0] - rx * 0.12, q[1] - hh * 0.84); g.lineTo(q[0] + rx * 0.08, q[1] - hh * 0.93); g.lineTo(q[0] + rx * 0.3, q[1] - hh * 0.86); g.stroke();
    const lvl = lightOf(c); g.fillStyle = '#5A3A22'; g.beginPath(); g.arc(q[0] + rx * 0.08, q[1] - hh * 0.5, 9 * k, 0, TAU); g.fill(); g.fillStyle = lvl ? '#FFD27A' : '#4A4038'; g.beginPath(); g.arc(q[0] + rx * 0.08, q[1] - hh * 0.5, 6.6 * k, 0, TAU); g.fill();
    g.strokeStyle = '#5A3A22'; g.lineWidth = 1.4 * k; line(g, [q[0] + rx * 0.08 - 6.6 * k, q[1] - hh * 0.5], [q[0] + rx * 0.08 + 6.6 * k, q[1] - hh * 0.5]); line(g, [q[0] + rx * 0.08, q[1] - hh * 0.5 - 6.6 * k], [q[0] + rx * 0.08, q[1] - hh * 0.5 + 6.6 * k]); }, {layer: 1, zb: 40, top: 122});
  B.custom(1.5, 2.0, (g, P, k) => { const a = P(0.3, 1.86, 30), b2 = P(2.7, 1.86, 30); tusk(g, a[0], a[1], k, 30, -1, 3.2); tusk(g, b2[0], b2[1], k, 30, 1, 3.2); }, {layer: 3, zb: 30, top: 60});
});
/* ============================ 🏕️ CAMP — Bone-fence Yard ============================ */
RR('camp', {name: 'Bone-fence Yard', h: 78}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, '#C99A68');
  const sh2 = B.box(0.12, 0.12, 0, 0.9, 0.7, 4, BAS2, {layer: 0}); [[0.16, 0.16], [0.9, 0.16], [0.16, 0.7], [0.9, 0.7]].forEach(p => B.box(p[0], p[1], 4, 0.08, 0.08, 30, BARK));
  const r = B.roof(0.1, 0.1, 30, 0.95, 0.75, 16, FERN, {ridge: 'x', ov: 0.1}); leafRows(B, r, FERN, L);
  B.custom(1, 1, (g, P, k, t, T2) => { const posts = []; for(let i = 0; i <= 5; i++) posts.push([0.08, 0.08 + i * 0.37]); for(let i = 1; i <= 5; i++) posts.push([0.08 + i * 0.37, 0.08]);
    posts.forEach(p => { const a = P(p[0], p[1], 0); tusk(g, a[0], a[1], k, 24, 0.6, 2.4); }); }, {layer: 1, zb: 0, top: 26});
  B.custom(1, 1, (g, P, k) => { const posts = []; for(let i = 1; i <= 5; i++) posts.push([1.92, 0.08 + i * 0.37]); [0.08, 0.45, 1.55, 1.92].forEach(x => posts.push([x, 1.92]));
    posts.forEach(p => { const a = P(p[0], p[1], 0); tusk(g, a[0], a[1], k, 22, -0.6, 2.4); }); const l = P(0.08, 1.92, 14), r2 = P(0.45, 1.92, 14), l2 = P(1.55, 1.92, 14), r3 = P(1.92, 1.92, 14), r4 = P(1.92, 0.08, 14);
    g.strokeStyle = '#8A6A44'; g.lineWidth = 1.2 * k; line(g, l, r2); line(g, l2, r3); line(g, r3, r4); }, {layer: 6, zb: 0, top: 24});
  B.drum(1.35, 1.0, 0, 0.12, 30, BARK, {rings: 3, layer: 2});   // 🎯 training post: a log with a leaf skirt + a round shield target in the team colour
  B.custom(1.35, 1.0, (g, P, k) => { const q = P(1.35, 1.0, 30), tcol = tc(L); for(let i = 0; i < 9; i++){ const a = Math.PI * (0.05 + i * 0.11); g.fillStyle = i % 2 ? FERN : FERN2; g.beginPath(); D.ell(g, q[0] + Math.cos(a) * 9 * k, q[1] - 10 * k + Math.sin(a) * 6 * k, 3 * k, 7 * k, a - Math.PI / 2); g.fill(); }
    const s = P(1.35, 1.12, 20); g.fillStyle = c && c.broken ? '#6A5A50' : tcol; g.beginPath(); g.arc(s[0], s[1], 7.4 * k, 0, TAU); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(s[0], s[1], 4.6 * k, 0, TAU); g.fill(); g.fillStyle = c && c.broken ? '#6A5A50' : tcol; g.beginPath(); g.arc(s[0], s[1], 2.2 * k, 0, TAU); g.fill();
    g.strokeStyle = '#5A3418'; g.lineWidth = 1.2 * k; line(g, [q[0] - 12 * k, q[1] + 2 * k], [q[0] + 10 * k, q[1] - 8 * k]); }, {layer: 3, zb: 0, top: 42});
  B.custom(0.7, 1.4, (g, P, k) => { const q = P(0.62, 1.42, 0); [[-6, 0, 6], [5, 2, 5], [0, -6, 4.6]].forEach(([dx, dy, r]) => { g.fillStyle = D.rad(g, q[0] + dx * k - r * k * 0.4, q[1] + dy * k - r * k * 0.5, 1, r * 1.7 * k, [[0, '#B8B2C2'], [1, BAS2]]); g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, r * k, r * 0.8 * k); g.fill(); }); }, {layer: 2, zb: 0, top: 14});
  pennant(B, L, 1.92, 0.08, 24, 30, {emblem: claw, pole: BONED});
});
/* ============================ 🎠 RIDE-ON — Rex Stable ============================ */
RR('ride', {name: 'Rex Stable', h: 104}, (B, v, L) => { const c = L.cond;
  const w = B.box(0.14, 0.18, 0, 1.72, 2.66, 44, BAS); B.decal(w, 'front', ...F(w, 'front'), 0, 44, BAS, {paint: rocks(44, BAS, 21)}); B.decal(w, 'right', ...F(w, 'right'), 0, 44, BAS, {paint: rocks(44, BAS2, 22)});
  B.decal(w, 'left', ...F(w, 'left'), 0, 44, BAS, {paint: rocks(44, BAS, 23)}); B.decal(w, 'back', ...F(w, 'back'), 0, 44, BAS, {paint: rocks(44, BAS2, 24)});
  trim(B, L, w, 38, 4);
  B.decal(w, 'front', 0.42, 1.16, 0, 36, '#2A1C14', {k: 'door', paint: (g, Q, k) => { g.fillStyle = 'rgba(255,220,140,0.18)'; polyP(g, [Q(0.08, 0), Q(0.92, 0), Q(0.92, 6), Q(0.08, 6)]); g.fill();
    g.fillStyle = '#E3BE6A'; for(let i = 0; i < 7; i++){ const p = Q(0.12 + i * 0.12, 2); g.beginPath(); D.ell(g, p[0], p[1], 3.4 * k, 2 * k); g.fill(); } }});
  banner(B, L, w, 'right', 0.5, 0.42, 12, 22, claw); banner(B, L, w, 'right', 1.9, 0.42, 12, 22, claw);
  const r = B.roof(0.14, 0.18, 44, 1.72, 2.66, 34, '#E3BE6A', {ridge: 'y', ov: 0.18, stripes: 10}); leafRows(B, r, '#D4A84E', L);
  B.custom(1, 2.84, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const q = P(1.0, 2.84, 50);   // 🦖 a friendly T-rex skull over the door
    g.fillStyle = BONE; g.beginPath(); g.moveTo(q[0] - 20 * k, q[1] + 2 * k); g.quadraticCurveTo(q[0] - 22 * k, q[1] - 18 * k, q[0] - 2 * k, q[1] - 20 * k); g.quadraticCurveTo(q[0] + 20 * k, q[1] - 20 * k, q[0] + 24 * k, q[1] - 4 * k); g.lineTo(q[0] + 22 * k, q[1] + 6 * k); g.lineTo(q[0] - 14 * k, q[1] + 8 * k); g.closePath(); g.fill();
    g.fillStyle = BONED; g.beginPath(); g.moveTo(q[0] - 14 * k, q[1] + 8 * k); g.lineTo(q[0] + 22 * k, q[1] + 6 * k); g.lineTo(q[0] + 18 * k, q[1] + 12 * k); g.lineTo(q[0] - 10 * k, q[1] + 13 * k); g.closePath(); g.fill();
    g.fillStyle = '#FFFFFF'; for(let i = 0; i < 6; i++){ const x = q[0] - 9 * k + i * 5.4 * k; g.beginPath(); g.moveTo(x, q[1] + 7 * k); g.lineTo(x + 2 * k, q[1] + 11 * k); g.lineTo(x + 4 * k, q[1] + 7 * k); g.closePath(); g.fill(); }
    g.fillStyle = '#3A2A20'; g.beginPath(); D.ell(g, q[0] - 6 * k, q[1] - 8 * k, 4.6 * k, 4 * k); g.fill(); g.beginPath(); D.ell(g, q[0] + 13 * k, q[1] - 2 * k, 2 * k, 1.6 * k); g.fill();
    g.fillStyle = lightOf(c) ? AMB : '#5A4A40'; g.beginPath(); g.arc(q[0] - 6 * k, q[1] - 8 * k, 1.8 * k, 0, TAU); g.fill(); }, {layer: 3, zb: 30, top: 74});
  B.custom(1.6, 2.7, (g, P, k) => { const q = P(1.62, 2.86, 0); g.fillStyle = BARK; g.beginPath(); g.moveTo(q[0] - 14 * k, q[1] - 2 * k); g.lineTo(q[0] + 2 * k, q[1] + 6 * k); g.lineTo(q[0] + 2 * k, q[1] - 2 * k); g.lineTo(q[0] - 14 * k, q[1] - 10 * k); g.closePath(); g.fill();
    frond(g, q[0] - 8 * k, q[1] - 6 * k, k, 12, -0.4, FERN, c); frond(g, q[0] - 3 * k, q[1] - 3 * k, k, 12, 0.5, FERN2, c); }, {layer: 4, zb: 0, top: 20});
  pennant(B, L, 1.0, 1.5, 78, 22, {emblem: claw, pole: BONED});
});
/* ============================ 🪽 NEST — Ptera Cliff ============================ */
RR('nest', {name: 'Ptera Cliff', h: 132}, (B, v, L) => { const c = L.cond;
  const a = B.box(0.08, 0.08, 0, 1.84, 1.84, 34, BAS, {topFill: '#8FBF56'}); B.decal(a, 'front', ...F(a, 'front'), 0, 34, BAS, {paint: rocks(34, BAS, 31)}); B.decal(a, 'right', ...F(a, 'right'), 0, 34, BAS, {paint: rocks(34, BAS2, 32)});
  B.decal(a, 'left', ...F(a, 'left'), 0, 34, BAS, {paint: rocks(34, BAS, 35)}); B.decal(a, 'back', ...F(a, 'back'), 0, 34, BAS, {paint: rocks(34, BAS2, 36)});
  B.decal(a, 'front', 0.74, 0.52, 0, 24, '#2A1C14', {k: 'door', paint: (g, Q, k) => { g.fillStyle = '#2A1C14'; const p0 = Q(0, 0), p1 = Q(0.5, 26), p2 = Q(1, 0); g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(p0[0], p1[1] - 4 * k, p1[0], p1[1]); g.quadraticCurveTo(p2[0], p1[1] - 4 * k, p2[0], p2[1]); g.closePath(); g.fill(); }});
  const b = B.box(0.3, 0.22, 34, 1.36, 1.3, 36, BAS2, {topFill: '#86B84E'}); B.decal(b, 'front', ...F(b, 'front'), 0, 36, BAS2, {paint: rocks(36, BAS2, 33)}); B.decal(b, 'right', ...F(b, 'right'), 0, 36, BAS2, {paint: rocks(36, D.sh(BAS2, -0.1), 34)});
  B.decal(b, 'left', ...F(b, 'left'), 0, 36, BAS2, {paint: rocks(36, BAS2, 37)}); B.decal(b, 'back', ...F(b, 'back'), 0, 36, BAS2, {paint: rocks(36, BAS2, 38)});
  trim(B, L, a, 30, 4);
  const d = B.box(0.5, 0.36, 70, 0.96, 0.92, 22, BAS, {topFill: '#8FBF56'}); B.decal(d, 'front', ...F(d, 'front'), 0, 22, BAS, {paint: rocks(22, BAS, 39)}); B.decal(d, 'right', ...F(d, 'right'), 0, 22, BAS, {paint: rocks(22, BAS2, 40)});
  B.custom(1, 1, (g, P, k) => { [[0.4, 1.94, 34, 30], [1.92, 1.0, 34, 26], [0.6, 1.54, 70, 20], [1.66, 0.9, 70, 24]].forEach(([x, y, z, len], i) => { const q = P(x, y, z); g.strokeStyle = c ? '#7A7A50' : '#3F9A3A'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(q[0], q[1]);
      g.quadraticCurveTo(q[0] + (i % 2 ? 3 : -3) * k, q[1] + len * 0.5 * k, q[0] + (i % 2 ? -1 : 1) * k, q[1] + len * k); g.stroke(); for(let j = 1; j < 5; j++){ g.fillStyle = j % 2 ? FERN : FERN2; g.beginPath(); D.ell(g, q[0] + (j % 2 ? 2.4 : -2.4) * k, q[1] + len * j / 5 * k, 2.6 * k, 1.6 * k, 0.4); g.fill(); } }); }, {layer: 5, zb: 34, top: 92});
  B.custom(1, 0.82, (g, P, k) => { const q = P(0.98, 0.82, 92); nest(g, q[0], q[1] - 2 * k, k, 22, c); egg(g, q[0] - 6 * k, q[1] - 9 * k, 6 * k, c); egg(g, q[0] + 6 * k, q[1] - 8 * k, 5.6 * k, c, {spot: AMB});
    g.strokeStyle = BARK; g.lineWidth = 2.4 * k; g.lineCap = 'round'; line(g, [q[0] + 16 * k, q[1] - 2 * k], [q[0] + 30 * k, q[1] - 22 * k]); line(g, [q[0] + 24 * k, q[1] - 13 * k], [q[0] + 34 * k, q[1] - 14 * k]);
    // 🦕 a little ptero perched on the branch (folded wings)
    const p = [q[0] + 31 * k, q[1] - 24 * k], body = c && c.broken ? '#8A8090' : '#E86A4A'; g.fillStyle = body; g.beginPath(); D.ell(g, p[0], p[1] - 5 * k, 5 * k, 6 * k); g.fill();
    g.fillStyle = D.sh(body, -0.2); g.beginPath(); g.moveTo(p[0] - 4 * k, p[1] - 9 * k); g.lineTo(p[0] - 12 * k, p[1] - 2 * k); g.lineTo(p[0] - 3 * k, p[1] - 1 * k); g.closePath(); g.fill();
    g.fillStyle = body; g.beginPath(); D.ell(g, p[0] + 2 * k, p[1] - 13 * k, 4 * k, 3.4 * k); g.fill(); g.beginPath(); g.moveTo(p[0] + 5 * k, p[1] - 14 * k); g.lineTo(p[0] + 13 * k, p[1] - 12 * k); g.lineTo(p[0] + 5 * k, p[1] - 11 * k); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(p[0] - 1 * k, p[1] - 15 * k); g.lineTo(p[0] - 8 * k, p[1] - 19 * k); g.lineTo(p[0] + 1 * k, p[1] - 13 * k); g.closePath(); g.fill(); g.fillStyle = '#2A1C14'; g.beginPath(); g.arc(p[0] + 3 * k, p[1] - 14 * k, 1 * k, 0, TAU); g.fill(); }, {layer: 6, zb: 92, top: 128});
  pennant(B, L, 0.62, 0.48, 92, 18, {emblem: claw, pole: BONED});
});
/* ============================ 🩹 CARE — Fern Hollow ============================ */
RR('care', {name: 'Fern Hollow', h: 94}, (B, v, L) => { const c = L.cond;
  B.flat(0.1, 0.1, 1.8, 1.8, MOSS);
  B.drum(1, 0.95, 0, 0.8, 44, BARK, {rings: 0});
  B.custom(1, 0.95, (g, P, k, t, T2) => { const q = P(1, 0.95, 0), rx = 0.8 * HTW * k * S2; g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 1.2 * k; for(let i = 0; i < 9; i++){ const u = -0.9 + i * 0.225; g.beginPath(); g.moveTo(q[0] + u * rx, q[1] + Math.sqrt(1 - u * u) * rx * 0.5); g.quadraticCurveTo(q[0] + u * rx * 1.02, q[1] - 22 * k, q[0] + u * rx, q[1] - 44 * k + Math.sqrt(1 - u * u) * rx * 0.5); g.stroke(); }
    [[-1.05, 0.2], [1.08, 0.3], [-0.6, 0.9]].forEach(([u, f]) => { g.fillStyle = BARK; g.beginPath(); g.moveTo(q[0] + u * rx * 0.85, q[1] + rx * 0.3 * f); g.quadraticCurveTo(q[0] + u * rx * 1.15, q[1] + rx * 0.3 * f + 2 * k, q[0] + u * rx * 1.25, q[1] + rx * 0.35 * f + 6 * k); g.lineTo(q[0] + u * rx * 0.8, q[1] + rx * 0.35 * f + 4 * k); g.closePath(); g.fill(); });
    if(vis(T2, 0, 1) || vis(T2, 1, 0)){ const fr = vis(T2, 0, 1) ? P(1, 1.75, 0) : P(1.8, 0.95, 0); g.fillStyle = '#3A2414'; g.beginPath(); g.moveTo(fr[0] - 9 * k, fr[1]); g.lineTo(fr[0] - 9 * k, fr[1] - 18 * k); g.quadraticCurveTo(fr[0], fr[1] - 30 * k, fr[0] + 9 * k, fr[1] - 18 * k); g.lineTo(fr[0] + 9 * k, fr[1]); g.closePath(); g.fill();
      g.fillStyle = lightOf(c) ? 'rgba(255,214,120,0.55)' : 'rgba(80,70,60,0.5)'; g.beginPath(); g.moveTo(fr[0] - 6 * k, fr[1]); g.lineTo(fr[0] - 6 * k, fr[1] - 15 * k); g.quadraticCurveTo(fr[0], fr[1] - 24 * k, fr[0] + 6 * k, fr[1] - 15 * k); g.lineTo(fr[0] + 6 * k, fr[1]); g.closePath(); g.fill(); }
    const top = P(1, 0.95, 44); g.fillStyle = '#E8C08A'; g.beginPath(); g.ellipse(top[0], top[1], rx, rx * 0.5, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(138,90,43,0.6)'; g.lineWidth = 1 * k; [0.7, 0.42, 0.18].forEach(f => { g.beginPath(); g.ellipse(top[0], top[1], rx * f, rx * 0.5 * f, 0, 0, TAU); g.stroke(); }); }, {layer: 1, zb: 0, top: 46});
  B.custom(1, 0.95, (g, P, k) => { const q = P(1, 0.95, 44); [[-1.2, 34, FERN2], [-0.6, 40, FERN], [0, 44, FERN2], [0.6, 40, FERN], [1.2, 34, FERN2], [-0.9, 30, FERN], [0.9, 30, FERN]].forEach(([a, len, col]) => frond(g, q[0] + a * 8 * k, q[1] - 2 * k, k, len, a, col, c)); }, {layer: 2, zb: 44, top: 90});
  B.custom(1.62, 1.7, (g, P, k, t, T2) => { const q = P(1.68, 1.78, 0); g.strokeStyle = BARK; g.lineWidth = 2 * k; line(g, q, [q[0], q[1] - 30 * k]); const s = [q[0], q[1] - 36 * k];   // 💗 a heart-leaf sign
    g.fillStyle = c && c.broken ? '#8A7A70' : '#FF6B8A'; g.beginPath(); g.moveTo(s[0], s[1] + 9 * k); g.bezierCurveTo(s[0] - 13 * k, s[1] - 1 * k, s[0] - 7 * k, s[1] - 11 * k, s[0], s[1] - 5 * k); g.bezierCurveTo(s[0] + 7 * k, s[1] - 11 * k, s[0] + 13 * k, s[1] - 1 * k, s[0], s[1] + 9 * k); g.fill();
    g.fillStyle = '#FFFFFF'; g.fillRect(s[0] - 1.4 * k, s[1] - 4.6 * k, 2.8 * k, 9 * k); g.fillRect(s[0] - 4.4 * k, s[1] - 1.6 * k, 8.8 * k, 2.8 * k); }, {layer: 4, zb: 0, top: 46});
  B.custom(0.4, 1.6, (g, P, k) => { const q = P(0.4, 1.6, 0); [[-4, '#E86A4A'], [4, '#F2B731']].forEach(([dx, col]) => { g.fillStyle = '#F4EAD2'; g.fillRect(q[0] + dx * k - 1.2 * k, q[1] - 7 * k, 2.4 * k, 7 * k); g.fillStyle = c ? '#9A8070' : col; g.beginPath(); g.ellipse(q[0] + dx * k, q[1] - 7 * k, 5 * k, 3.4 * k, 0, Math.PI, TAU); g.fill(); }); }, {layer: 3, zb: 0, top: 12});
  pennant(B, L, 0.28, 0.4, 0, 52, {emblem: claw, pole: BONED});
});
/* ============================ 🔧 WORKSHOP — Boulder Pit ============================ */
RR('workshop', {name: 'Boulder Pit', h: 92}, (B, v, L) => { const c = L.cond;
  B.flat(0.1, 0.1, 1.8, 1.8, '#9C8A70');
  [[0.06, 0.06, 1.88, 0.18], [0.06, 0.24, 0.18, 1.7], [1.76, 0.24, 0.18, 1.7], [0.06, 1.76, 0.62, 0.18], [1.32, 1.76, 0.62, 0.18]].forEach(([x, y, w, d], i) => { const b = B.box(x, y, 0, w, d, 14, BAS, {layer: i >= 3 ? 2 : 0}); B.decal(b, 'front', ...F(b, 'front'), 0, 14, BAS, {paint: rocks(14, BAS, 41 + i)}); B.decal(b, 'right', ...F(b, 'right'), 0, 14, BAS, {paint: rocks(14, BAS2, 46 + i)}); trim(B, L, b, 10, 4, ['front', 'right']); });   // ar-1p2: team band on the pit walls
  B.custom(1, 1, (g, P, k) => { [[0.45, 0.5, 9], [0.75, 0.38, 8], [0.5, 0.82, 8], [0.62, 0.62, 10]].forEach(([x, y, r], i) => { const q = P(x, y, i === 3 ? 12 : 2); g.fillStyle = D.rad(g, q[0] - r * 0.4 * k, q[1] - r * 0.8 * k, 1, r * 1.8 * k, [[0, '#BDB6C6'], [0.6, BAS], [1, BAS2]]); g.beginPath(); D.ell(g, q[0], q[1] - r * 0.5 * k, r * k, r * 0.86 * k); g.fill(); }); }, {layer: 1, zb: 0, top: 30});
  B.custom(1.3, 1.1, (g, P, k) => { const a = P(1.1, 1.2, 0), b2 = P(1.5, 1.2, 0), top = P(1.3, 1.2, 46), pivot = [top[0], top[1] + 4 * k];   // 🪵 a log catapult: A-frame + arm + a boulder in the cup
    g.strokeStyle = BARK; g.lineWidth = 3.2 * k; g.lineCap = 'round'; line(g, a, top); line(g, b2, top); g.lineWidth = 2 * k; line(g, [(a[0] + top[0]) / 2, (a[1] + top[1]) / 2], [(b2[0] + top[0]) / 2, (b2[1] + top[1]) / 2]);
    const arm = [pivot[0] - 30 * k, pivot[1] - 22 * k], tail = [pivot[0] + 16 * k, pivot[1] + 12 * k]; g.strokeStyle = '#A0703E'; g.lineWidth = 3.6 * k; line(g, tail, arm);
    g.fillStyle = '#5A3418'; g.beginPath(); g.arc(pivot[0], pivot[1], 2.6 * k, 0, TAU); g.fill(); g.fillStyle = '#8A5A34'; g.beginPath(); g.ellipse(arm[0], arm[1] - 2 * k, 7 * k, 4 * k, -0.6, 0, TAU); g.fill();
    g.fillStyle = D.rad(g, arm[0] - 3 * k, arm[1] - 10 * k, 1, 10 * k, [[0, '#C8C2D0'], [1, BAS2]]); g.beginPath(); g.arc(arm[0], arm[1] - 7 * k, 6.4 * k, 0, TAU); g.fill();
    g.fillStyle = BAS2; g.beginPath(); g.arc(tail[0], tail[1] + 2 * k, 5 * k, 0, TAU); g.fill(); g.strokeStyle = '#D9B98A'; g.lineWidth = 0.9 * k; line(g, [tail[0], tail[1] + 2 * k], [tail[0] + 2 * k, a[1]]); }, {layer: 3, zb: 0, top: 80});
  B.custom(1.78, 0.2, (g, P, k) => { const q = P(1.78, 0.22, 14); g.fillStyle = tc(L); g.beginPath(); g.moveTo(q[0] - 9 * k, q[1]); g.lineTo(q[0] + 9 * k, q[1]); g.lineTo(q[0] + 7 * k, q[1] - 12 * k); g.lineTo(q[0] - 7 * k, q[1] - 12 * k); g.closePath(); g.fill(); claw(g, q[0], q[1] - 6 * k, 4 * k, '#FFFFFF'); }, {layer: 2, zb: 14, top: 28});
  pennant(B, L, 0.16, 0.16, 14, 34, {emblem: claw, pole: BONED});
});
/* ============================ 🗼 TOWER — Tall-tree Lookout (stand + aim) ============================ */
RR('tower', {name: 'Tall-tree Lookout', h: 136, stand: [0.5, 0.5, 86], aim: [0.5, 0.5, 100]}, (B, v, L) => { const c = L.cond;
  B.drum(0.5, 0.5, 0, 0.2, 84, BARK, {rings: 0});
  B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 0); [[-1, 0.3], [1, 0.2], [-0.4, 1]].forEach(([d, f]) => { g.fillStyle = BARK; g.beginPath(); g.moveTo(q[0] + d * 4 * k, q[1] - 10 * k); g.quadraticCurveTo(q[0] + d * 10 * k, q[1] - 2 * k + f * 3 * k, q[0] + d * 15 * k, q[1] + f * 4 * k); g.lineTo(q[0] + d * 6 * k, q[1] + 3 * k); g.closePath(); g.fill(); });
    g.strokeStyle = 'rgba(42,28,20,0.28)'; g.lineWidth = 1 * k; for(let z = 14; z < 80; z += 13){ g.beginPath(); g.moveTo(q[0] - 7 * k, q[1] - z * k); g.quadraticCurveTo(q[0], q[1] - (z - 3) * k, q[0] + 7 * k, q[1] - z * k); g.stroke(); } }, {layer: 1, zb: 0, top: 84});
  const deck = B.box(0.02, 0.02, 82, 0.96, 0.96, 5, '#C99257', {layer: 2}); trim(B, L, deck, 0, 2.4, ['front', 'right']);
  B.custom(0.5, 0.5, (g, P, k) => { g.strokeStyle = '#8A5A34'; g.lineWidth = 1.4 * k; [[0.04, 0.98], [0.98, 0.98], [0.98, 0.04]].forEach(([x, y]) => line(g, P(x, y, 87), P(x, y, 98)));
    line(g, P(0.04, 0.98, 97), P(0.98, 0.98, 97)); line(g, P(0.98, 0.98, 97), P(0.98, 0.04, 97)); line(g, P(0.04, 0.98, 92), P(0.98, 0.98, 92)); line(g, P(0.98, 0.98, 92), P(0.98, 0.04, 92)); }, {layer: 4, zb: 86, top: 98});
  B.custom(0.5, 0.98, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const a = P(0.36, 0.98, 82), b2 = P(0.36, 0.98, 0), c2 = P(0.6, 0.98, 82), d2 = P(0.6, 0.98, 0); g.strokeStyle = '#D9B98A'; g.lineWidth = 1.1 * k; line(g, a, b2); line(g, c2, d2);
    g.strokeStyle = '#8A5A34'; g.lineWidth = 1.6 * k; for(let z = 6; z < 82; z += 8) line(g, P(0.36, 0.98, z), P(0.6, 0.98, z)); }, {layer: 5, zb: 0, top: 82});
  B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 106), cl = c ? (c.broken ? '#8A7A5A' : '#9A9A4A') : FERN; [[-14, 6, 13], [14, 6, 13], [0, -6, 16], [-7, 2, 11], [8, -1, 11]].forEach(([dx, dy, r], i) => { g.fillStyle = D.rad(g, q[0] + dx * k - r * 0.4 * k, q[1] + dy * k - r * 0.5 * k, 1, r * 1.5 * k, [[0, D.sh(cl, 0.3)], [0.6, cl], [1, D.sh(cl, -0.28)]]); g.beginPath(); g.arc(q[0] + dx * k, q[1] + dy * k, r * k, 0, TAU); g.fill(); });
    g.strokeStyle = BARK; g.lineWidth = 2.4 * k; line(g, P(0.5, 0.5, 98), [q[0], q[1] + 8 * k]); }, {layer: 3, zb: 98, top: 124});
  pennant(B, L, 0.5, 0.5, 116, 18, {emblem: claw, pole: BARK, layer: 6});
});
/* ============================ 🎨 WARDROBE — Leaf Weaver ============================ */
RR('wardrobe', {name: 'Leaf Weaver', h: 74}, (B, v, L) => { const c = L.cond;
  const h = B.box(0.66, 0.12, 0, 1.24, 0.76, 30, MUD, {trim: 10}); trim(B, L, h, 25, 3); B.door(h, 'front', 1.12, 0.4, 24, {fill: '#5A3418'}); B.win(h, 'right', 0.3, 0.32, 12, 10);
  const r = B.roof(0.66, 0.12, 30, 1.24, 0.76, 22, FERN, {ridge: 'x', ov: 0.14}); leafRows(B, r, FERN, L);
  [[0.08, 0.22], [0.52, 0.22]].forEach(p => B.box(p[0], p[1], 0, 0.08, 0.08, 46, BARK, {layer: 1}));   // 🧵 the leaf loom: two posts, a beam, the half-woven team-coloured cloth
  B.box(0.06, 0.22, 46, 0.56, 0.08, 4, BARK, {layer: 1});
  B.custom(0.34, 0.26, (g, P, k) => { const tcol = c && c.broken ? '#7A6A60' : tc(L), a = P(0.14, 0.26, 44), b2 = P(0.54, 0.26, 44), a2 = P(0.14, 0.26, 10), b3 = P(0.54, 0.26, 10);
    g.strokeStyle = '#D9C9A0'; g.lineWidth = 0.8 * k; for(let i = 0; i <= 8; i++){ const f = i / 8; line(g, [a[0] + (b2[0] - a[0]) * f, a[1] + (b2[1] - a[1]) * f], [a2[0] + (b3[0] - a2[0]) * f, a2[1] + (b3[1] - a2[1]) * f]); }
    const m = (f) => [a[0] + (a2[0] - a[0]) * f, a[1] + (a2[1] - a[1]) * f], n = (f) => [b2[0] + (b3[0] - b2[0]) * f, b2[1] + (b3[1] - b2[1]) * f];
    for(let i = 0; i < 8; i++){ const f0 = 0.02 + i * 0.07, f1 = f0 + 0.065; g.fillStyle = i % 2 ? tcol : (c ? '#8A8A5A' : FERN); polyP(g, [m(f0), n(f0), n(f1), m(f1)]); g.fill(); } }, {layer: 2, zb: 10, top: 46});
  B.custom(0.3, 0.75, (g, P, k) => { const a = P(0.06, 0.92, 26), b2 = P(0.62, 0.92, 22); g.strokeStyle = '#8A6A44'; g.lineWidth = 0.9 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2 + 4 * k, b2[0], b2[1]); g.stroke();
    [[0.3, FERN], [0.6, tc(L)]].forEach(([f, col]) => { const x = a[0] + (b2[0] - a[0]) * f, y = a[1] + (b2[1] - a[1]) * f + 3 * k; g.fillStyle = c && c.broken ? '#7A6A60' : col; g.beginPath(); g.moveTo(x - 4 * k, y); g.lineTo(x + 4 * k, y); g.lineTo(x + 6 * k, y + 13 * k); g.lineTo(x, y + 11 * k); g.lineTo(x - 6 * k, y + 13 * k); g.closePath(); g.fill(); }); }, {layer: 3, zb: 10, top: 28});
  pennant(B, L, 1.84, 0.16, 30, 26, {emblem: claw, pole: BONED});
});
/* ============================ 🔮 SPELL TOWER — Amber Shrine ============================ */
RR('spell', {name: 'Amber Shrine', h: 118}, (B, v, L) => { const c = L.cond, lv = lightOf(c);
  const s1 = B.box(0.1, 0.1, 0, 1.8, 1.8, 8, BAS); B.decal(s1, 'front', ...F(s1, 'front'), 0, 8, BAS, {paint: rocks(8, BAS, 51)}); B.decal(s1, 'right', ...F(s1, 'right'), 0, 8, BAS, {paint: rocks(8, BAS2, 52)});
  const s2 = B.box(0.34, 0.34, 8, 1.32, 1.32, 10, BAS2); trim(B, L, s2, 3, 3);
  [[0.18, 0.18], [1.7, 0.18], [0.18, 1.7], [1.7, 1.7]].forEach(([x, y]) => B.custom(x, y, (g, P, k) => { const a = P(x, y, 8), b2 = P(x, y, 34); bone(g, a, b2, 3.4 * k);
    const f = [b2[0], b2[1] - 2 * k]; g.fillStyle = lv ? '#FFB03A' : '#5A4A40'; g.beginPath(); g.moveTo(f[0] - 3 * k, f[1]); g.quadraticCurveTo(f[0] - 3 * k, f[1] - 6 * k, f[0], f[1] - 10 * k); g.quadraticCurveTo(f[0] + 3 * k, f[1] - 6 * k, f[0] + 3 * k, f[1]); g.closePath(); g.fill(); }, {layer: x + y > 2 ? 4 : 0, zb: 8, top: 46}));
  B.custom(1, 1, (g, P, k) => { const q = P(1, 1, 18), w = 22 * k, h = 70 * k, col = c && c.broken ? '#8A6A4A' : AMB;   // 💎 the giant amber crystal (a fossil fern inside)
    const pts = [[0, -h], [w * 0.7, -h * 0.78], [w, -h * 0.3], [w * 0.62, 0], [-w * 0.62, 0], [-w, -h * 0.34], [-w * 0.7, -h * 0.8]];
    g.fillStyle = D.lin(g, q[0] - w, q[1] - h, q[0] + w, q[1], [D.sh(col, 0.35), col, D.sh(col, -0.3)]); polyP(g, pts.map(p => [q[0] + p[0], q[1] + p[1]])); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.25)'; polyP(g, [[q[0], q[1] - h], [q[0] - w * 0.7, q[1] - h * 0.8], [q[0] - w, q[1] - h * 0.34], [q[0] - w * 0.2, q[1] - h * 0.4]]); g.fill();
    g.fillStyle = 'rgba(120,50,0,0.25)'; polyP(g, [[q[0], q[1] - h], [q[0] + w * 0.7, q[1] - h * 0.78], [q[0] + w, q[1] - h * 0.3], [q[0] + w * 0.62, q[1]], [q[0] + w * 0.1, q[1] - h * 0.35]]); g.fill();
    g.strokeStyle = 'rgba(110,50,10,0.45)'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(q[0] - w * 0.15, q[1] - h * 0.18); g.quadraticCurveTo(q[0] + w * 0.12, q[1] - h * 0.42, q[0] - w * 0.05, q[1] - h * 0.66); g.stroke();
    for(let i = 1; i < 6; i++){ const f = i / 6, x = q[0] - w * 0.15 + w * 0.2 * Math.sin(f * 3), y = q[1] - h * (0.18 + 0.48 * f); g.lineWidth = 1 * k; line(g, [x, y], [x - 6 * k * (1 - f * 0.5), y - 3 * k]); line(g, [x, y], [x + 6 * k * (1 - f * 0.5), y - 4 * k]); }
    if(lv){ g.fillStyle = 'rgba(255,255,255,0.9)'; D.star(g, q[0] - w * 0.4, q[1] - h * 0.72, 4 * k, 1.3 * k, 4); g.fill(); D.star(g, q[0] + w * 0.5, q[1] - h * 0.4, 3 * k, 1 * k, 4); g.fill(); } }, {layer: 2, zb: 18, top: 92});
  if(lv) halo(B, 1, 1, 50, 44, AMB, 0.45 * lv, {pulse: t => 0.9 + 0.1 * Math.sin(ph(t, 2)) + 0.04 * Math.cos(ph(t, 2))});
  pennant(B, L, 1.7, 0.18, 34, 30, {emblem: claw, pole: BONED});
});
/* ============================ 🕵️ HIDEOUT — Tall-grass Den ============================ */
RR('hideout', {name: 'Tall-grass Den', h: 66}, (B, v, L) => { const c = L.cond, lv = lightOf(c);
  B.flat(0.1, 0.1, 1.8, 1.8, '#8FB85A');
  B.custom(1, 1, (g, P, k, t, T2) => { const q = P(1, 1, 0), grass = c ? (c.broken ? '#9A8A60' : '#B8A85A') : '#6DBB4A', grass2 = c ? '#8A7A50' : '#4C9A3A';   // a mound of tall grass with a dark burrow + two eyes
    g.fillStyle = D.rad(g, q[0] - 10 * k, q[1] - 30 * k, 4, 56 * k, [[0, D.sh(grass, 0.15)], [1, grass2]]); g.beginPath(); g.moveTo(q[0] - 50 * k, q[1] + 6 * k); g.quadraticCurveTo(q[0] - 46 * k, q[1] - 36 * k, q[0], q[1] - 40 * k); g.quadraticCurveTo(q[0] + 46 * k, q[1] - 36 * k, q[0] + 50 * k, q[1] + 6 * k); g.quadraticCurveTo(q[0], q[1] + 26 * k, q[0] - 50 * k, q[1] + 6 * k); g.fill();
    const R = rnd(61); for(let i = 0; i < 46; i++){ const u = (R() - 0.5) * 2, x = q[0] + u * 46 * k, base = q[1] + 6 * k - Math.sqrt(1 - u * u) * 34 * k + R() * 30 * k, L2 = (10 + R() * 18) * k, lean = (R() - 0.5) * 8 * k;
      g.strokeStyle = R() < 0.5 ? grass : grass2; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + lean * 0.3, base - L2 * 0.6, x + lean, base - L2); g.stroke(); }
    if(vis(T2, 0, 1) || vis(T2, 1, 0)){ const fr = vis(T2, 0, 1) ? P(1, 1.9, 0) : P(1.9, 1, 0); g.fillStyle = '#1E1612'; g.beginPath(); g.ellipse(fr[0], fr[1] - 8 * k, 13 * k, 10 * k, 0, Math.PI, TAU); g.lineTo(fr[0] + 13 * k, fr[1]); g.lineTo(fr[0] - 13 * k, fr[1]); g.closePath(); g.fill();
      if(lv){ [-4, 4].forEach(dx => { g.fillStyle = '#FFE14A'; g.beginPath(); D.ell(g, fr[0] + dx * k, fr[1] - 9 * k, 2.4 * k, 2 * k); g.fill(); g.fillStyle = '#1E1612'; g.fillRect(fr[0] + dx * k - 0.5 * k, fr[1] - 10.6 * k, 1 * k, 3.2 * k); }); }
      for(let i = 0; i < 9; i++){ const x = fr[0] - 16 * k + i * 4 * k; g.strokeStyle = grass; g.lineWidth = 1.5 * k; g.beginPath(); g.moveTo(x, fr[1] + 2 * k); g.lineTo(x + (i % 2 ? 2 : -2) * k, fr[1] - 10 * k - (i % 3) * 3 * k); g.stroke(); } } }, {layer: 1, zb: 0, top: 50});
  pennant(B, L, 1.5, 0.5, 20, 30, {emblem: claw, pole: '#8A6A44', w: 11, hh: 7});
});
/* ============================ 🐾 DEN — Hatchery ============================ */
RR('den', {name: 'Hatchery', h: 84}, (B, v, L) => { const c = L.cond, lv = lightOf(c);
  B.flat(0.1, 0.1, 1.8, 1.8, '#E8C98A');
  [[0.06, 0.06, 1.88, 0.14], [0.06, 0.2, 0.14, 1.74], [1.8, 0.2, 0.14, 1.74], [0.2, 1.8, 0.6, 0.14], [1.2, 1.8, 0.6, 0.14]].forEach(([x, y, w, d], i) => B.box(x, y, 0, w, d, 6, BAS, {layer: i >= 3 ? 2 : 0}));
  [[0.14, 0.14], [1.78, 0.14], [0.14, 0.86], [1.78, 0.86]].forEach(p => B.box(p[0], p[1], 6, 0.08, 0.08, p[1] > 0.5 ? 34 : 44, '#B89A5A', {layer: 0}));
  const r = B.roof(0.1, 0.1, 40, 1.8, 0.86, 16, FERN, {ridge: 'x', ov: 0.12, layer: 0}); leafRows(B, r, FERN, L);
  B.custom(1, 1, (g, P, k) => { const q = P(1, 0.95, 4); nest(g, q[0], q[1], k, 30, c); egg(g, q[0] - 13 * k, q[1] - 7 * k, 7 * k, c); egg(g, q[0] + 12 * k, q[1] - 8 * k, 6.6 * k, c, {spot: AMB}); egg(g, q[0] - 2 * k, q[1] - 13 * k, 7.6 * k, c, {col: '#E9F6E0'});
    // 🐣 a baby dino peeking out of a cracked egg
    const b = [q[0] + 2 * k, q[1] - 2 * k]; g.fillStyle = c && c.broken ? '#9A9A80' : '#7FD06A'; g.beginPath(); D.ell(g, b[0], b[1] - 12 * k, 6.4 * k, 6 * k); g.fill(); g.beginPath(); D.ell(g, b[0] + 4 * k, b[1] - 11 * k, 4 * k, 3 * k); g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(b[0] + 1 * k, b[1] - 14 * k, 2.2 * k, 0, TAU); g.fill(); g.fillStyle = '#2A1C14'; g.beginPath(); g.arc(b[0] + 1.6 * k, b[1] - 14 * k, 1.1 * k, 0, TAU); g.fill();
    g.fillStyle = EGG; g.beginPath(); g.moveTo(b[0] - 9 * k, b[1] - 8 * k); g.lineTo(b[0] - 6 * k, b[1] - 11 * k); g.lineTo(b[0] - 3 * k, b[1] - 8 * k); g.lineTo(b[0], b[1] - 11 * k); g.lineTo(b[0] + 3 * k, b[1] - 8 * k); g.lineTo(b[0] + 6 * k, b[1] - 11 * k); g.lineTo(b[0] + 9 * k, b[1] - 8 * k);
    g.quadraticCurveTo(b[0] + 9 * k, b[1] + 2 * k, b[0], b[1] + 2 * k); g.quadraticCurveTo(b[0] - 9 * k, b[1] + 2 * k, b[0] - 9 * k, b[1] - 8 * k); g.fill();
    const hr = P(1.5, 1.45, 6); g.fillStyle = lv ? '#FF7A2E' : '#5A4A40'; g.beginPath(); D.ell(g, hr[0], hr[1] - 4 * k, 7 * k, 5 * k); g.fill(); g.fillStyle = lv ? '#FFD27A' : '#6A5A50'; g.beginPath(); D.ell(g, hr[0] - 1 * k, hr[1] - 6 * k, 3 * k, 2 * k); g.fill(); }, {layer: 1, zb: 4, top: 30});
  if(lv) halo(B, 1.5, 1.45, 8, 16, '#FF9A3A', 0.4 * lv);
  pennant(B, L, 1.78, 0.14, 46, 20, {emblem: claw, pole: BONED});
});
/* ---------- 🟩 territory floor: moss + bone bits + fern sprigs + an odd little nest ---------- */
addFloor('raptor', {name: 'Mossy stones + bones', top: '#A9AE7E', top2: '#9DA472', side: '#6E7448', paint: (g, q, s, i, j) => { const r = hash(i, j, 1), r2 = hash(j, i, 2);
  tileBase(g, q, s, '#A9AE7E', '#9DA472', r); g.strokeStyle = 'rgba(70,74,40,0.28)'; g.lineWidth = Math.max(1, 0.9 * s); g.beginPath(); g.moveTo(...q(0.5 + (r - 0.5) * 0.3, 0.06)); g.lineTo(...q(0.5 - (r2 - 0.5) * 0.3, 0.94)); g.stroke();
  g.fillStyle = 'rgba(96,150,52,0.55)'; g.beginPath(); D.ell(g, ...q(0.18 + r2 * 0.2, 0.2 + r * 0.2), 6 * s, 3 * s, 0.4); g.fill();
  g.fillStyle = 'rgba(46,110,40,0.35)'; g.beginPath(); D.ell(g, ...q(0.3 + r * 0.3, 0.4 + r2 * 0.25), 7 * s, 3 * s, 0.2); g.fill();
  if(r2 > 0.45){ const a = q(0.25 + r * 0.4, 0.62), b = q(0.42 + r * 0.4, 0.5); bone(g, a, b, 2.2 * s); }
  if(r < 0.35){ const p = q(0.68, 0.3 + r2 * 0.3); frond(g, p[0], p[1], s * 0.7, 10, -0.6, FERN2, null); frond(g, p[0], p[1], s * 0.7, 9, 0.5, FERN, null); }
  if(r > 0.88){ const p = q(0.5, 0.55); nest(g, p[0], p[1], s, 8, null); egg(g, p[0], p[1] - 3 * s, 3.4 * s, null); }
  if(r2 < 0.2){ g.fillStyle = '#B8B2C2'; g.beginPath(); D.ell(g, ...q(0.2, 0.75), 2.6 * s, 1.6 * s); g.fill(); } }});
/* ---------- 🧱 AR-4 (pictures 2026-11-18): 🦖 Raptor Ridge wall = a log palisade on mossy rock, team rope lashing · posts = thick logs with crossed tusks
   gate = two rock pillars under a giant tusk arch, log doors ---------- */
(function(){ const {wallProp, gateProp, gateDoors, longFaces, WT, WP, tallWallProp, tallGateProp} = K.AR;
  const TIP = '#D9B07A', ROPE = '#C8A060';
  const logs = h => (g, Q, k) => { for(let u = 0, i = 0; u < 1; u += 0.2, i++){ polyP(g, [Q(u + 0.01, 0), Q(u + 0.19, 0), Q(u + 0.19, h), Q(u + 0.01, h)]); g.fillStyle = D.sh(BARK, (i % 2 ? -0.08 : 0.06)); g.fill();
      g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 0.9 * k; g.stroke(); g.strokeStyle = 'rgba(255,230,190,0.25)'; line(g, Q(u + 0.06, 2), Q(u + 0.06, h - 2)); }
    g.strokeStyle = ROPE; g.lineWidth = 2 * k; [h * 0.25, h * 0.72].forEach(z => line(g, Q(0.02, z), Q(0.98, z))); };
  // 🪢 the team rope lashing along a run (front side), drawn after the logs
  function lashing(B, L, x0, y0, x1, y1, ax, z, c){ B.custom((x0 + x1) / 2, (y0 + y1) / 2, (g, P, k) => { const col = teamOf(L), br = c && c.broken, U = 36, len = Math.hypot(x1 - x0, y1 - y0) * U, hh = 5,
      off = 0.075, M2 = (s, v) => { const f = s / len; return P(x0 + (x1 - x0) * f + (ax === 'y' ? off : 0), y0 + (y1 - y0) * f + (ax === 'x' ? off : 0), z + hh - v); };
    g.save(); polyP(g, [M2(0, 0), M2(len, 0), M2(len, hh), M2(0, hh)]); g.fillStyle = br ? D.sh(col, -0.45) : col; g.fill(); g.clip(); if(!br) K.AR.patPaint(g, M2, len, hh, patOf(L), inkOf(col), k); g.restore();
    g.strokeStyle = D.sh(col, -0.5); g.lineWidth = 1 * k; line(g, M2(0, 0.3), M2(len, 0.3)); line(g, M2(0, hh - 0.3), M2(len, hh - 0.3)); }, {layer: 5, zb: z, top: z + 5}); }
  const skin = {name: 'Log palisade', gateName: 'Tusk gate', h: 50, gateH: 100,
    seg(B, L, r, c, v){ const [x, y, w, d, ax] = r, t = 0.15, bx = ax === 'x' ? [x, 0.5 - t, w, 2 * t] : [0.5 - t, y, 2 * t, d], b = B.box(bx[0], bx[1], 0, bx[2], bx[3], 8, BAS);
      ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, 8, BAS, {paint: rocks(8, BAS, 5 + Math.round((x + y) * 10))}));
      const len = ax === 'x' ? w : d, n = Math.max(1, Math.round(len / 0.13)), st = len / n;
      for(let i = 0; i < n; i++){ const p = (ax === 'x' ? x : y) + (i + 0.5) * st, cx = ax === 'x' ? p : 0.5, cy = ax === 'x' ? 0.5 : p, j = ((Math.round(p * 100) * 7) % 5), hh = (c && c.broken && i % 3 === 1) ? 10 : 25 + j;
        B.drum(cx, cy, 8, 0.066, hh, BARK); if(!(c && c.broken && i % 3 === 1)) B.cone(cx, cy, 8 + hh, 0.066, 7, c ? '#B99A70' : TIP); }
      const a0 = ax === 'x' ? [x, 0.5] : [0.5, y], a1 = ax === 'x' ? [x + w, 0.5] : [0.5, y + d]; lashing(B, L, a0[0], a0[1], a1[0], a1[1], ax, 21, c); },
    post(B, L, kind, c){ B.drum(0.5, 0.5, 0, 0.2, 7, BAS2); B.drum(0.5, 0.5, 7, 0.15, 27, D.sh(BARK, -0.06), {rings: 2});
      B.custom(0.5, 0.5, (g, P, k) => { const col = teamOf(L), br = c && c.broken, q = P(0.5, 0.5, 23), rx = 0.155 * HTW * k * S2, ry = rx / 2;
        g.fillStyle = br ? D.sh(col, -0.45) : col; g.beginPath(); g.ellipse(q[0], q[1], rx, ry, 0, 0, Math.PI); g.lineTo(q[0] - rx, q[1] - 5 * k); g.ellipse(q[0], q[1] - 5 * k, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill();
        g.strokeStyle = D.sh(col, -0.5); g.lineWidth = 1 * k; g.stroke(); }, {layer: 5, zb: 23, top: 28});
      if(!(c && c.broken)) B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 34); tusk(g, q[0] - 3 * k, q[1], k, 13, 0.8, 2.6); tusk(g, q[0] + 3 * k, q[1], k, 13, -0.8, 2.6); }, {layer: 6, zb: 34, top: 47}); },
    gate(B, L, open, c, v){ const t = 0.22, H = 40;
      [[0, 0.26], [0.74, 0.26]].forEach(([x0, w]) => { const b = B.box(x0, 0.5 - t, 0, w, 2 * t, H, BAS); ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, H, BAS, {paint: rocks(H, BAS, 61 + x0 * 10)}));
        B.box(x0 + 0.02, 0.5 - t + 0.02, H, w - 0.04, 2 * t - 0.04, 3, MOSS); });
      if(!(c && c.broken)) B.custom(0.5, 0.5, (g, P, k) => { const a = P(0.13, 0.5, H + 3), b2 = P(0.87, 0.5, H + 3), m = P(0.5, 0.5, H + 34);   // 🦴 the giant tusk arch
        [[a, 1], [b2, -1]].forEach(([p, s]) => { g.fillStyle = BONE; g.beginPath(); g.moveTo(p[0] - 5 * k, p[1]); g.quadraticCurveTo(p[0] - 4 * k * s + s * 2 * k, m[1] + 6 * k, m[0] + s * 3 * k, m[1]); g.quadraticCurveTo(p[0] + s * 7 * k, m[1] + 14 * k, p[0] + 5 * k, p[1]); g.closePath(); g.fill();
          g.fillStyle = 'rgba(160,140,100,0.35)'; g.beginPath(); g.moveTo(p[0] + s * 1 * k, p[1]); g.quadraticCurveTo(p[0] + s * 6 * k, m[1] + 12 * k, m[0] + s * 3 * k, m[1]); g.quadraticCurveTo(p[0] + s * 8 * k, m[1] + 15 * k, p[0] + s * 5 * k, p[1]); g.closePath(); g.fill(); });
        const col = teamOf(L); g.fillStyle = col; g.beginPath(); D.ell(g, m[0], m[1] + 3 * k, 6 * k, 4.4 * k); g.fill(); g.strokeStyle = D.sh(col, -0.5); g.lineWidth = 1 * k; g.stroke();
        claw(g, m[0], m[1] + 3.4 * k, 3.2 * k, inkOf(col)); }, {layer: 6, zb: H, top: H + 38});
      gateDoors(B, open, c, 34, BARK, ROPE, {paint: logs(34)});
      if(!(c && c.broken)) [[0.13], [0.87]].forEach(([x]) => pennant(B, L, x, 0.5 - 0.12, H + 3, 20, {w: 11, hh: 7, emblem: claw})); } };
  wallProp('raptor', 'raptor', skin); gateProp('raptor', 'raptor', skin);
  // 🏯 tall: the palisade on a mossy rock rampart · towers = a rock pillar carrying a log watchtower (platform + rope band + thatch roof + claw pennant) · gatehouse = a log bridge with crossed tusks
  const THATCH = '#CFA75C';
  const tall = {name: 'Rampart palisade', gateName: 'Tusk gatehouse', base: 30, h: 112, gateH: 116,
    rampart(B, L, r, c, hb){ const [x, y, w, d, ax] = r, e = 0.08, b = ax === 'x' ? B.box(x, y - e, 0, w, d + 2 * e, hb - 3, BAS) : B.box(x - e, y, 0, w + 2 * e, d, hb - 3, BAS);
      ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, hb - 3, BAS, {paint: rocks(hb - 3, BAS, 23 + Math.round((x + y) * 10))}));
      if(ax === 'x') B.box(x, y - e, hb - 3, w, d + 2 * e, 3, c ? '#8FA060' : MOSS); else B.box(x - e, y, hb - 3, w + 2 * e, d, 3, c ? '#8FA060' : MOSS); },
    tower(B, L, c, cx, cy, hb, kind, hw){ const br = c && c.broken, b = B.box(cx - hw, cy - hw, 0, 2 * hw, 2 * hw, hb, BAS2);
      ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, hb, BAS2, {paint: rocks(hb, BAS2, 37 + Math.round(cx * 10))}));
      const lh = 22, lg = hw * 0.72, z1 = hb + lh;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy], i) => { if(br && i === 1) return; B.drum(cx + sx * lg, cy + sy * lg, hb, Math.max(0.035, hw * 0.17), br && i === 3 ? 10 : lh + 18, D.sh(BARK, -0.05)); });
      if(br) return;
      const pf = B.box(cx - hw - 0.02, cy - hw - 0.02, z1, 2 * hw + 0.04, 2 * hw + 0.04, 6, BARK); ['front', 'right', 'left', 'back'].forEach(s => B.decal(pf, s, ...F(pf, s), 0, 6, BARK, {paint: logs(6)}));
      trim(B, L, pf, 2, 2, ['front', 'right']);
      B.cone(cx, cy, z1 + 18, hw * 1.45, kind === 'gate' ? 18 : 24, THATCH);
      pennant(B, L, cx, cy, z1 + 18 + (kind === 'gate' ? 16 : 22), kind === 'gate' ? 14 : 18, {w: 11, hh: 7, emblem: claw}); },
    gatehouse(B, L, open, c, hb){ const br = c && c.broken, z0 = 40, t = 0.17;
      gateDoors(B, open, c, 34, BARK, ROPE, {paint: logs(34)});
      const b = B.box(0.26, 0.5 - t, z0, 0.48, 2 * t, br ? 5 : 10, BARK); ['front', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, br ? 5 : 10, BARK, {paint: logs(br ? 5 : 10)}));
      if(br) return; trim(B, L, b, 4, 2, ['front', 'back']);
      for(let i = 0; i < 5; i++){ const x = 0.3 + i * 0.1; B.drum(x, 0.5, z0 + 10, 0.045, 16 + (i % 2) * 4, BARK); B.cone(x, 0.5, z0 + 26 + (i % 2) * 4, 0.045, 6, TIP); }
      B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5 - t, z0 + 5); tusk(g, q[0] - 5 * k, q[1] + 2 * k, k, 16, 0.9, 3); tusk(g, q[0] + 5 * k, q[1] + 2 * k, k, 16, -0.9, 3);
        const col = teamOf(L); g.fillStyle = col; g.beginPath(); D.ell(g, q[0], q[1] - 4 * k, 5.5 * k, 4 * k); g.fill(); g.strokeStyle = D.sh(col, -0.5); g.lineWidth = 1 * k; g.stroke(); claw(g, q[0], q[1] - 3.6 * k, 3 * k, inkOf(col)); }, {layer: 7, zb: z0, top: z0 + 22}); } };
  tallWallProp('raptor', 'raptor', skin, tall); tallGateProp('raptor', 'raptor', skin, tall);
})();
})();
K.loaded('raptor', 'ar-4');
})(window.Props && window.Props._K);
