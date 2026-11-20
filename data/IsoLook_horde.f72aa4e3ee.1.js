
/* 🌍 IsoLook_horde — 🍽️ Hungry Horde — AvataRealm side ①b on 🌾 farm: 11 buildings · own floor · own resource shapes (coupon booth · cookie jar · donut stack) · own walls (needs realm) · 🏺 The Bottomless Plate origin relic — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['horde'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/horde.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_horde: include IsoProps first'); return; }
if(!K.AR){ console.warn('IsoLook_horde: load IsoLook_realm first (Props.need does it)'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🍽️ horde · Hungry Horde (AvataRealm side ①b, ip-4b pictures, 🌳 IsoProps chat 2026-11-18).
   Built ON 🌾 farm (its trees, ground, 🍂 versions — an American county-fair food town: striped tents, picnic gingham, diner boards, soda cups)
   + 🏰 realm (team colours · 🏗️ site steps · slots · walls). 11 buildings = AvataRealm §14a:
   🏠 picnic tent → snack shack → Food Court (giant donut sign) · 🏕️ Queue Hall · 🎠 Trolley Park · 🪽 Balloon Stand · 🩹 Tip-jar Booth · 🔧 Buffet Depot ·
   🗼 Giant Menu Board · 🎨 Bib & Napkin Shop · 🔮 Fortune-cookie Booth · 🕵️ Snack Stash · 🐾 Pet Café.
   Own resource shapes (Aowu 2026-11-18): 🎟️ horde_coin = coupon booth · 🍪 horde_brick = cookie jar · 🍩 horde_gem = diamond donut stack.
   Own floor (picnic blankets + food-court tiles + sprinkles + paper plates + ketchup squiggles) and own walls (🍟 picket fence on a ketchup base · 🥤 soda-cup posts ·
   🍩 donut-arch turnstile gate · 🏯 crate rampart + soda towers + a burger gatehouse). Keys horde_<slot>. */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, halo} = T;
const {pennant, banner, trim, building, addSide, addFloor, tileBase, hash, teamOf, patOf, inkOf, awning, tiles, checker, tent, quadStripes} = K.AR;
const D = PD, M = MAT, TAU = Math.PI * 2, S2 = Math.SQRT2;
const KETCH = '#D8322E', MUST = '#F2B731', MINT = '#7BD3C0', MINTD = '#3E9C8A', CREAM = '#FFF4E0', PLANK = '#E2B07A', WOOD = '#C99257', WOODD = '#8A5A34', DOUGH = '#E0A060', PINK = '#FF8FB0',
  STEEL = '#C3CAD2', STEELD = '#8E98A3', SKY = '#BFE8F2', CHOCO = '#7A4A2A', BUN = '#E8A050', LETTUCE = '#7FC24A', PATTY = '#6A3A22';
const SPR = ['#FF5A5A', '#FFE14A', '#5AC8FF', '#7FE07A', '#FFFFFF', '#C07AFF'];
// 🍴 the side's emblem: a crossed fork + knife
function forkKnife(g, x, y, r, col){ g.save(); g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round';
  g.translate(x, y); g.rotate(-0.6); g.lineWidth = r * 0.2; line(g, [0, r * 0.95], [0, -r * 0.2]); g.lineWidth = r * 0.12; [-0.22, 0, 0.22].forEach(dx => line(g, [dx * r, -r * 0.2], [dx * r, -r * 0.85])); g.beginPath(); g.moveTo(-0.28 * r, -0.25 * r); g.quadraticCurveTo(0, 0.02 * r, 0.28 * r, -0.25 * r); g.fill();
  g.rotate(1.2); g.beginPath(); g.moveTo(-0.1 * r, r * 0.95); g.lineTo(-0.1 * r, -0.2 * r); g.quadraticCurveTo(-0.12 * r, -0.95 * r, 0.16 * r, -0.95 * r); g.lineTo(0.16 * r, 0.1 * r); g.lineTo(0.1 * r, 0.95 * r); g.closePath(); g.fill(); g.restore(); }
addSide('horde', {name: 'Hungry Horde', icon: '🍽️', look: 'horde', accent: KETCH, emblem: forkKnife, base: 'farm'});
addLook('horde', {name: 'Hungry Horde', walls: [CREAM, '#F2DCC2', '#DCEFEA'], roofs: [KETCH, MUST, MINTD], trim: '#5A3418', accent: KETCH, stilts: false, team: null, side: 'horde',
  res: {coin: '#FF8A3A', coinDk: '#B8501A', rock: '#B9A27A', brick: '#C98A4A', brickDk: '#7A4A2A', leaf: '#5DBB46', bark: '#8A5A34', gem: '#FF8FB0', gemDk: '#B84A7A', gemHi: '#FFF0F6'}}, 'farm');
/* ---------- 🖌️ horde painters ---------- */
const HR = (slot, o, build) => building('horde', slot, o, build);
// planks on a face (decal paint)
const planks = (h, gap) => (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = 0.9 * k; for(let z = gap || 6; z < h - 0.5; z += gap || 6) line(g, Q(0, z), Q(1, z)); };
function planked(B, x, y, z, w, d, h, col, o){ const b = B.box(x, y, z, w, d, h, col, o); ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, h, col, {paint: planks(h)})); return b; }
// 🧺 a gingham picnic blanket on the ground (world space, model rect)
function blanket(B, x, y, w, d, c, col, z){ B.custom(x + w / 2, y + d / 2, (g, P, k) => { const n = Math.max(4, Math.round(w * 7)), m = Math.max(4, Math.round(d * 7)), cl = c && c.broken ? '#9A7A70' : (col || KETCH), zz = z || 0.6;
    polyP(g, [P(x, y, zz), P(x + w, y, zz), P(x + w, y + d, zz), P(x, y + d, zz)]); g.fillStyle = '#FFFFFF'; g.fill();
    for(let i = 0; i < n; i++) for(let j = 0; j < m; j++){ const a = (i % 2) + (j % 2); if(!a) continue; const u0 = x + w * i / n, v0 = y + d * j / m; polyP(g, [P(u0, v0, zz), P(u0 + w / n, v0, zz), P(u0 + w / n, v0 + d / m, zz), P(u0, v0 + d / m, zz)]); g.fillStyle = D.rgba(cl, a === 2 ? 0.9 : 0.45); g.fill(); } }, {layer: -8, zb: 0, top: 1}); }
// 🍩 a donut (screen space, seen from the front at an angle): r = outer radius
function donut(g, x, y, r, c, o){ o = o || {}; const br = c && c.broken, ice = br ? '#B89A9A' : (o.ice || PINK), R2 = rnd(o.seed || 7);
  g.fillStyle = D.sh(DOUGH, -0.15); g.beginPath(); D.ell(g, x, y + r * 0.12, r, r * (o.flat || 0.5)); g.fill(); g.fillStyle = DOUGH; g.beginPath(); D.ell(g, x, y, r, r * (o.flat || 0.5)); g.fill();
  g.fillStyle = ice; g.beginPath(); for(let i = 0; i <= 24; i++){ const a = i / 24 * TAU, rr = r * (0.92 + 0.06 * Math.sin(a * 5)); i ? g.lineTo(x + Math.cos(a) * rr, y - r * 0.05 + Math.sin(a) * rr * (o.flat || 0.5)) : g.moveTo(x + Math.cos(a) * rr, y - r * 0.05 + Math.sin(a) * rr * (o.flat || 0.5)); } g.closePath(); g.fill();
  g.fillStyle = D.sh(DOUGH, -0.35); g.beginPath(); D.ell(g, x, y - r * 0.05, r * 0.32, r * 0.32 * (o.flat || 0.5)); g.fill();
  if(!br) for(let i = 0; i < (o.n || 12); i++){ const a = R2() * TAU, d = r * (0.45 + R2() * 0.4); g.fillStyle = SPR[i % SPR.length]; g.beginPath(); D.ell(g, x + Math.cos(a) * d, y - r * 0.05 + Math.sin(a) * d * (o.flat || 0.5), r * 0.1, r * 0.035, R2() * 3); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); D.ell(g, x - r * 0.45, y - r * 0.22, r * 0.2, r * 0.07, -0.3); g.fill(); }
// 🍔 a burger (screen space)
function burger(g, x, y, r, c){ const br = c && c.broken; g.fillStyle = br ? '#9A7A5A' : BUN; g.beginPath(); g.moveTo(x - r, y + r * 0.35); g.lineTo(x + r, y + r * 0.35); g.quadraticCurveTo(x + r, y + r * 0.62, x, y + r * 0.62); g.quadraticCurveTo(x - r, y + r * 0.62, x - r, y + r * 0.35); g.fill();
  g.fillStyle = br ? '#5A4A3A' : PATTY; g.beginPath(); D.rr(g, x - r * 1.04, y + r * 0.02, r * 2.08, r * 0.32, r * 0.14); g.fill(); g.fillStyle = br ? '#8A8A5A' : LETTUCE; g.beginPath(); g.moveTo(x - r * 1.1, y + r * 0.02); for(let i = 0; i <= 8; i++) g.lineTo(x - r * 1.1 + i * r * 0.275, y + (i % 2 ? 0.14 : -0.04) * r); g.lineTo(x + r * 1.1, y - r * 0.1); g.lineTo(x - r * 1.1, y - r * 0.1); g.closePath(); g.fill();
  g.fillStyle = br ? '#B89A6A' : '#FFD03A'; g.beginPath(); g.moveTo(x - r * 0.9, y - r * 0.12); g.lineTo(x + r * 0.9, y - r * 0.12); g.lineTo(x + r * 0.5, y + r * 0.12); g.lineTo(x - r * 0.2, y + r * 0.1); g.closePath(); g.fill();
  g.fillStyle = br ? '#9A7A5A' : BUN; g.beginPath(); g.moveTo(x - r, y - r * 0.12); g.quadraticCurveTo(x - r, y - r * 0.95, x, y - r * 0.95); g.quadraticCurveTo(x + r, y - r * 0.95, x + r, y - r * 0.12); g.closePath(); g.fill();
  g.fillStyle = '#FFF4D0'; [[-0.4, -0.55], [0.1, -0.7], [0.45, -0.45], [-0.05, -0.38]].forEach(([dx, dy]) => { g.beginPath(); D.ell(g, x + dx * r, y + dy * r, r * 0.08, r * 0.04, 0.3); g.fill(); }); }
// 🥤 a soda cup (screen space): red-and-white cup, lid, straw
function sodaIcon(g, x, y, r, c, col){ const br = c && c.broken, cl = br ? '#8A7070' : (col || KETCH); g.fillStyle = cl; g.beginPath(); g.moveTo(x - r * 0.6, y - r); g.lineTo(x + r * 0.6, y - r); g.lineTo(x + r * 0.42, y + r); g.lineTo(x - r * 0.42, y + r); g.closePath(); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(x - r * 0.55, y - r * 0.4); g.lineTo(x + r * 0.55, y - r * 0.4); g.lineTo(x + r * 0.5, y); g.lineTo(x - r * 0.5, y); g.closePath(); g.fill();
  g.fillStyle = '#E8ECEF'; g.beginPath(); D.ell(g, x, y - r, r * 0.66, r * 0.16); g.fill(); g.strokeStyle = br ? '#8A8070' : '#5AC8FF'; g.lineWidth = r * 0.14; g.lineCap = 'round'; line(g, [x + r * 0.1, y - r * 1.05], [x + r * 0.35, y - r * 1.7]); }
// 🍟 fries (screen space)
function friesIcon(g, x, y, r, c){ const br = c && c.broken; [-0.35, -0.12, 0.1, 0.32, -0.22, 0.2].forEach((dx, i) => { g.fillStyle = br ? '#B8A070' : (i % 2 ? '#FFD03A' : '#F2B731'); g.fillRect(x + dx * r - r * 0.07, y - r * (1.1 + (i % 3) * 0.15), r * 0.14, r); });
  g.fillStyle = br ? '#8A6060' : KETCH; g.beginPath(); g.moveTo(x - r * 0.6, y - r * 0.35); g.lineTo(x + r * 0.6, y - r * 0.35); g.lineTo(x + r * 0.45, y + r * 0.6); g.lineTo(x - r * 0.45, y + r * 0.6); g.closePath(); g.fill(); }
// 🎈 a balloon (screen space)
function balloon(g, x, y, r, col, k, bx, by){ g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 0.8 * k; g.beginPath(); g.moveTo(x, y + r * 1.2); g.quadraticCurveTo(x + (bx - x) * 0.4 + 3 * k, y + (by - y) * 0.5, bx, by); g.stroke();
  g.fillStyle = D.rad(g, x - r * 0.35, y - r * 0.4, 0.5, r * 1.4, [[0, D.sh(col, 0.45)], [0.6, col], [1, D.sh(col, -0.3)]]); g.beginPath(); D.ell(g, x, y, r * 0.86, r); g.fill(); g.beginPath(); g.moveTo(x - r * 0.18, y + r * 1.08); g.lineTo(x, y + r * 0.9); g.lineTo(x + r * 0.18, y + r * 1.08); g.closePath(); g.fill(); }
// 🪧 a menu card with drawn food (no words): kinds burger · fries · soda · donut
function menuCard(g, pts, k, c, items){ polyP(g, pts); g.fillStyle = c && c.broken ? '#4A4440' : '#2E3238'; g.fill(); g.strokeStyle = MUST; g.lineWidth = 2 * k; g.stroke(); }
// a tent-like parasol (screen space) on a pole
function parasol(g, x, y, k, r, A, Bc, c){ const br = c && c.broken; g.strokeStyle = '#E8E4DE'; g.lineWidth = 1.4 * k; line(g, [x, y], [x, y - 22 * k]); if(br) return; const top = [x, y - 30 * k];
  for(let i = 0; i < 8; i++){ const a0 = Math.PI + i / 8 * Math.PI, a1 = Math.PI + (i + 1) / 8 * Math.PI; g.fillStyle = i % 2 ? Bc : A; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(x + Math.cos(a0) * r * k, y - 20 * k + Math.sin(a0) * r * 0.2 * k + 2 * k); g.lineTo(x + Math.cos(a1) * r * k, y - 20 * k + Math.sin(a1) * r * 0.2 * k + 2 * k); g.closePath(); g.fill(); }
  for(let i = 0; i < 8; i++){ const a0 = i / 8 * Math.PI, a1 = (i + 1) / 8 * Math.PI; g.fillStyle = D.sh(i % 2 ? Bc : A, -0.12); g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(x + Math.cos(a0) * r * k, y - 20 * k + Math.sin(a0) * r * 0.2 * k + 2 * k); g.lineTo(x + Math.cos(a1) * r * k, y - 20 * k + Math.sin(a1) * r * 0.2 * k + 2 * k); g.closePath(); g.fill(); } }
// a little round café table + 2 stools (world space)
function picnicTable(B, x, y, c){ B.box(x - 0.3, y - 0.12, 7, 0.6, 0.24, 2.5, WOOD); B.box(x - 0.25, y - 0.1, 0, 0.05, 0.05, 7, WOODD); B.box(x + 0.2, y - 0.1, 0, 0.05, 0.05, 7, WOODD);
  B.box(x - 0.3, y - 0.3, 4, 0.6, 0.1, 2, PLANK); B.box(x - 0.3, y + 0.2, 4, 0.6, 0.1, 2, PLANK);
  B.custom(x, y, (g, P, k) => { const q = P(x, y, 9.6); g.fillStyle = '#FFFFFF'; g.beginPath(); D.ell(g, q[0] - 5 * k, q[1], 3.6 * k, 1.6 * k); g.fill(); g.fillStyle = c && c.broken ? '#8A6060' : KETCH; g.beginPath(); D.ell(g, q[0] - 5 * k, q[1] - 0.4 * k, 1.8 * k, 0.8 * k); g.fill(); sodaIcon(g, q[0] + 5 * k, q[1] - 3 * k, 2.6 * k, c); }, {layer: 2, zb: 9.5, top: 16}); }
/* ============================ 🏠 HOUSE — 3 levels, each a new SHAPE ============================ */
HR('house', {name: 'Food Court', h: 138, names: {'1': 'Picnic Tent', '2': 'Snack Shack', '3': 'Food Court'}}, (B, v, L) => { const c = L.cond, lv = L.state || '1';
  if(lv === '1'){ // ⛺ a striped picnic tent with the door flap open, a gingham blanket with a basket + plates, a cooler and the team flag
    blanket(B, 0.14, 0.96, 1.2, 0.86, c);
    tent(B, 1.3, 0.22, 0, 1.5, 1.5, 50, KETCH, '#FFFFFF', 7, {ridge: 'y', cond: c});
    B.custom(2.05, 1.73, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const a = P(1.72, 1.73, 0), b2 = P(2.38, 1.73, 0), m = P(2.05, 1.73, 32); g.fillStyle = '#3A2A20'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(m[0], m[1]); g.lineTo(b2[0], b2[1]); g.closePath(); g.fill();
      g.fillStyle = c && c.broken ? '#9A7A70' : '#FFFFFF'; g.beginPath(); g.moveTo(m[0], m[1]); g.lineTo(b2[0], b2[1]); g.lineTo(b2[0] + 6 * k, b2[1] - 2 * k); g.quadraticCurveTo(m[0] + 10 * k, m[1] + 14 * k, m[0] + 2 * k, m[1] - 1 * k); g.closePath(); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.8 * k; g.stroke(); }, {layer: 1, zb: 0, top: 34});
    B.custom(0.55, 1.3, (g, P, k) => { const q = P(0.5, 1.28, 1); g.fillStyle = '#C8924E'; g.beginPath(); D.rr(g, q[0] - 8 * k, q[1] - 9 * k, 16 * k, 10 * k, 2 * k); g.fill(); g.strokeStyle = 'rgba(80,46,20,0.45)'; g.lineWidth = 0.8 * k; for(let i = 1; i < 4; i++) line(g, [q[0] - 8 * k + i * 4 * k, q[1] - 9 * k], [q[0] - 8 * k + i * 4 * k, q[1] + 1 * k]);
      g.strokeStyle = '#8A5A34'; g.lineWidth = 1.6 * k; g.beginPath(); g.arc(q[0], q[1] - 9 * k, 6 * k, Math.PI, TAU); g.stroke(); g.fillStyle = c && c.broken ? '#9A7A70' : KETCH; g.fillRect(q[0] - 9 * k, q[1] - 10 * k, 6 * k, 4 * k);
      const p2 = P(0.95, 1.55, 1); [[0, 0], [9, 4]].forEach(([dx, dy]) => { g.fillStyle = '#FFFFFF'; g.beginPath(); D.ell(g, p2[0] + dx * k, p2[1] + dy * k, 5 * k, 2.4 * k); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.2)'; g.stroke(); });
      burger(g, p2[0], p2[1] - 2.4 * k, 3 * k, c); donut(g, p2[0] + 9 * k, p2[1] + 3 * k, 3.4 * k, c, {seed: 3, n: 5}); }, {layer: 2, zb: 0, top: 12});
    const cool = B.box(0.3, 0.3, 0, 0.42, 0.3, 12, '#5AC8FF'); B.box(0.28, 0.28, 12, 0.46, 0.34, 3, '#FFFFFF');
    pennant(B, L, 1.05, 0.3, 0, 46, {emblem: forkKnife, pole: WOODD});
    return; }
  if(lv === '2'){ // 🛖 snack shack: a plank shack with a big service window + a striped awning, a menu board of drawn food, a giant soda cup on the roof, a picnic table
    const w = planked(B, 0.2, 0.2, 0, 2.2, 1.3, 40, '#F2DCC2');
    B.decal(w, 'front', 0.5, 1.2, 12, 16, '#3A2A20', {paint: (g, Q, k) => { polyP(g, [Q(0, 0), Q(1, 0), Q(1, 2.5), Q(0, 2.5)]); g.fillStyle = PLANK; g.fill(); const a = Q(0.25, 8); sodaIcon(g, a[0], a[1], 3 * k, c); const b2 = Q(0.55, 7); burger(g, b2[0], b2[1], 4 * k, c); const d2 = Q(0.82, 8); friesIcon(g, d2[0], d2[1], 4 * k, c); }});
    B.door(w, 'right', 0.5, 0.4, 28, {fill: '#7A4A24'}); trim(B, L, w, 33, 3.4);
    awning(B, 'front', 1.5, 0.4, 1.95, 34, 0.26, 8, MUST, '#FFFFFF', 7, {cond: c});
    B.roof(0.14, 0.14, 40, 2.32, 1.42, 18, KETCH, {ridge: 'x', ov: 0.14, stripes: 9});
    B.box(0.35, 0.3, 30, 0.04, 0.04, 1, WOODD);
    B.custom(1.7, 0.85, (g, P, k) => { const q = P(1.85, 0.6, 50); sodaIcon(g, q[0], q[1] - 12 * k, 12 * k, c); }, {layer: 2, zb: 48, top: 92});
    banner(B, L, w, 'right', 0.05, 0.34, 6, 20, forkKnife);
    picnicTable(B, 2.55, 1.6, c);
    B.custom(0.5, 1.8, (g, P, k, t, T2) => { const a = P(0.45, 1.82, 0); g.strokeStyle = WOODD; g.lineWidth = 1.6 * k; line(g, a, [a[0], a[1] - 18 * k]); const pts = [[a[0] - 9 * k, a[1] - 34 * k], [a[0] + 9 * k, a[1] - 30 * k], [a[0] + 9 * k, a[1] - 16 * k], [a[0] - 9 * k, a[1] - 20 * k]]; menuCard(g, pts, k, c); donut(g, a[0], a[1] - 25 * k, 4.4 * k, c, {seed: 5, n: 6}); }, {layer: 3, zb: 0, top: 36});
    pennant(B, L, 0.3, 0.3, 58, 20, {emblem: forkKnife, pole: WOODD});
    return; }
  // 🏟️ L3 Food Court: a long glass-fronted hall, mint and cream, a GIANT pink donut sign on two posts, parasol tables out front, team banners
  const w = B.box(0.1, 0.12, 0, 2.8, 1.4, 36, CREAM); ['front', 'right'].forEach(s => B.decal(w, s, ...F(w, s), 0, 7, MINTD, {paint: checker(7, MINTD, '#FFFFFF', s === 'front' ? 24 : 12, 1)}));
  B.decal(w, 'front', 0.2, 2.4, 9, 20, SKY, {paint: (g, Q, k) => { g.strokeStyle = '#FFFFFF'; g.lineWidth = 2.2 * k; for(let u = 0.125; u < 1; u += 0.125) line(g, Q(u, 0), Q(u, 20)); g.fillStyle = 'rgba(255,255,255,0.35)'; polyP(g, [Q(0.02, 3), Q(0.06, 3), Q(0.16, 18), Q(0.12, 18)]); g.fill();
    if(lightOf(c)){ g.fillStyle = 'rgba(255,220,140,0.45)'; polyP(g, [Q(0, 0), Q(1, 0), Q(1, 7), Q(0, 7)]); g.fill(); } }});
  B.decal(w, 'right', 0.2, 1.0, 9, 20, SKY, {paint: (g, Q, k) => { g.strokeStyle = '#FFFFFF'; g.lineWidth = 2 * k; for(let u = 0.25; u < 1; u += 0.25) line(g, Q(u, 0), Q(u, 20)); }});
  B.door(w, 'front', 1.24, 0.52, 28, {fill: MINTD}); trim(B, L, w, 30, 4);
  awning(B, 'front', 1.52, 0.15, 2.85, 36, 0.24, 7, KETCH, '#FFFFFF', 14, {cond: c});
  B.box(0.06, 0.08, 36, 2.88, 1.48, 4, MINT);
  [1.12, 1.88].forEach(x => B.box(x - 0.05, 0.75, 40, 0.1, 0.1, 30, STEELD));
  B.custom(1.5, 0.8, (g, P, k, t) => { const q = P(1.5, 0.8, 92), br = c && c.broken, r = 30 * k, tilt = br ? 0.35 : 0;   // 🍩 the GIANT donut sign, standing up, facing the street
    g.save(); g.translate(q[0], q[1] + (br ? 18 * k : 0)); g.rotate(tilt); g.fillStyle = D.sh(DOUGH, -0.2); g.beginPath(); g.arc(3 * k, 2 * k, r, 0, TAU); g.arc(3 * k, 2 * k, r * 0.38, 0, TAU, true); g.fill('evenodd');
    g.fillStyle = DOUGH; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.arc(0, 0, r * 0.38, 0, TAU, true); g.fill('evenodd');
    g.fillStyle = br ? '#B89A9A' : PINK; g.beginPath(); for(let i = 0; i <= 40; i++){ const a = i / 40 * TAU, rr = r * (0.9 + 0.05 * Math.sin(a * 7)); i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr - 1.5 * k) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr - 1.5 * k); } g.closePath(); g.arc(0, -1.5 * k, r * 0.46, 0, TAU, true); g.fill('evenodd');
    if(!br){ const R2 = rnd(23); for(let i = 0; i < 26; i++){ const a = R2() * TAU, d = r * (0.52 + R2() * 0.34); g.fillStyle = SPR[i % SPR.length]; g.beginPath(); D.ell(g, Math.cos(a) * d, Math.sin(a) * d - 1.5 * k, 3 * k, 1.1 * k, R2() * 3); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(-r * 0.4, -r * 0.5, r * 0.14, 0, TAU); g.fill();
      if(lightOf(c)){ g.fillStyle = '#FFE58A'; for(let i = 0; i < 16; i++){ const a = i / 16 * TAU; g.beginPath(); g.arc(Math.cos(a) * r * 1.06, Math.sin(a) * r * 1.06, 1.5 * k, 0, TAU); g.fill(); } } }
    g.restore(); }, {layer: 2, zb: 62, top: 128});
  [[0.36, 1.8], [2.64, 1.8]].forEach(([x, y], i) => { B.drum(x, y, 0, 0.13, 8, '#FFFFFF'); B.custom(x, y, (g, P, k) => { const q = P(x, y, 8); parasol(g, q[0], q[1], k, 12, i % 2 ? MINTD : KETCH, '#FFFFFF', c); }, {layer: 3, zb: 8, top: 40}); });
  banner(B, L, w, 'right', 0.06, 0.26, 4, 22, forkKnife); banner(B, L, w, 'right', 1.24, 0.24, 4, 22, forkKnife);
  pennant(B, L, 0.24, 0.3, 40, 24, {emblem: forkKnife, pole: STEELD});
});
/* ============================ 🏕️ CAMP — Queue Hall ============================ */
HR('camp', {name: 'Queue Hall', h: 86}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, '#E9DCC6');
  [[0.12, 0.12], [1.82, 0.12], [0.12, 0.92], [1.82, 0.92]].forEach(p => B.box(p[0], p[1], 0, 0.06, 0.06, 36, STEELD));
  tent(B, 0.06, 0.06, 36, 1.88, 0.96, 22, MUST, '#FFFFFF', 9, {cond: c, layer: 1});
  const ct = planked(B, 0.3, 0.26, 0, 1.4, 0.4, 16, '#F2DCC2'); B.box(0.28, 0.24, 16, 1.44, 0.44, 2.5, KETCH); trim(B, L, ct, 2, 3, ['front', 'right']);
  B.custom(1.4, 0.46, (g, P, k) => { const q = P(1.45, 0.46, 18.5); g.fillStyle = c && c.broken ? '#8A6060' : KETCH; g.beginPath(); D.rr(g, q[0] - 4 * k, q[1] - 12 * k, 8 * k, 12 * k, 2 * k); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(q[0], q[1] - 8 * k, 2.4 * k, 0, TAU); g.fill();
    g.fillStyle = '#FFF4D0'; polyP(g, [[q[0] + 3 * k, q[1] - 5 * k], [q[0] + 9 * k, q[1] - 3 * k], [q[0] + 8 * k, q[1] - 1 * k], [q[0] + 3 * k, q[1] - 3 * k]]); g.fill(); }, {layer: 2, zb: 18, top: 32});
  const posts = [[0.3, 1.2], [1.0, 1.2], [1.7, 1.2], [1.7, 1.75], [1.0, 1.75], [0.3, 1.75]];   // 🚧 queue posts with the team rope zig-zagging
  posts.forEach(([x, y]) => { B.drum(x, y, 0, 0.07, 2, '#3A3A42'); B.drum(x, y, 2, 0.025, 18, GOLD()); B.drum(x, y, 20, 0.04, 2, GOLD()); });
  B.custom(1, 1.48, (g, P, k) => { const col = c && c.broken ? '#6A5A50' : teamOf(L); g.strokeStyle = col; g.lineWidth = 2.4 * k; g.lineCap = 'round'; for(let i = 0; i < posts.length - 1; i++){ if(c && c.broken && i === 2) continue; const a = P(posts[i][0], posts[i][1], 18), b2 = P(posts[i + 1][0], posts[i + 1][1], 18); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2 + 5 * k, b2[0], b2[1]); g.stroke(); } }, {layer: 2, zb: 10, top: 20});
  pennant(B, L, 1.86, 0.14, 58, 20, {emblem: forkKnife, pole: STEELD});
  B.custom(0.2, 1.0, (g, P, k) => { const q = P(0.18, 1.0, 0); sodaIcon(g, q[0], q[1] - 8 * k, 6 * k, c); }, {layer: 3, zb: 0, top: 18});
});
function GOLD(){ return '#D9B23A'; }
/* ============================ 🎠 RIDE-ON — Trolley Park ============================ */
HR('ride', {name: 'Trolley Park', h: 90}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 2.88, '#CFCAC0');
  B.custom(1, 1.5, (g, P, k) => { g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.6 * k; [0.1, 0.7, 1.3].forEach(x => line(g, P(x, 0.2, 0.7), P(x, 1.7, 0.7))); }, {layer: -7, zb: 0, top: 1});
  [[0.1, 0.12], [1.86, 0.12], [0.1, 1.76], [1.86, 1.76]].forEach(p => B.box(p[0] - 0.03, p[1] - 0.03, 0, 0.06, 0.06, 40, STEELD));
  tent(B, 0.04, 0.06, 40, 1.92, 1.76, 14, KETCH, '#FFFFFF', 8, {ridge: 'y', cond: c, layer: 1});
  B.custom(1, 1, (g, P, k, t) => { [[0.42, 0.5], [0.42, 0.9], [0.42, 1.3], [1.0, 0.5], [1.0, 0.9]].forEach(([x, y], i) => { const q = P(x, y, 0), br = c && c.broken && i === 3;   // 🛒 parked trolleys (wire baskets)
      g.strokeStyle = br ? '#7A7A80' : '#9AA4AE'; g.lineWidth = 1.2 * k; const bx = q[0] - 9 * k, by = q[1] - 17 * k; g.strokeRect(bx, by, 16 * k, 8 * k); for(let j = 1; j < 5; j++) line(g, [bx + j * 3.2 * k, by], [bx + j * 3.2 * k + 1 * k, by + 8 * k]);
      line(g, [bx, by + 8 * k], [bx + 2 * k, by + 13 * k]); line(g, [bx + 16 * k, by + 8 * k], [bx + 14 * k, by + 13 * k]); line(g, [bx + 16 * k, by], [bx + 20 * k, by - 4 * k]); g.strokeStyle = KETCH; g.lineWidth = 2 * k; line(g, [bx + 19 * k, by - 5 * k], [bx + 22 * k, by - 3 * k]);
      g.fillStyle = '#3A3A42'; [bx + 2 * k, bx + 14 * k].forEach(xx => { g.beginPath(); g.arc(xx, by + 14 * k, 1.6 * k, 0, TAU); g.fill(); }); }); }, {layer: 2, zb: 0, top: 26});
  B.custom(0.62, 2.5, (g, P, k) => { const q = P(0.62, 2.5, 0), col = c && c.broken ? '#6A5A50' : teamOf(L);   // 🏁 the racing trolley: team-coloured basket, flag, flames
    g.strokeStyle = '#9AA4AE'; g.lineWidth = 1.4 * k; const bx = q[0] - 12 * k, by = q[1] - 22 * k; g.fillStyle = col; g.fillRect(bx, by, 22 * k, 11 * k); g.strokeStyle = D.sh(col, -0.5); g.strokeRect(bx, by, 22 * k, 11 * k); forkKnife(g, bx + 11 * k, by + 5.5 * k, 4 * k, inkOf(col));
    g.strokeStyle = '#9AA4AE'; line(g, [bx, by + 11 * k], [bx + 3 * k, by + 17 * k]); line(g, [bx + 22 * k, by + 11 * k], [bx + 19 * k, by + 17 * k]); line(g, [bx + 22 * k, by], [bx + 28 * k, by - 5 * k]);
    g.fillStyle = '#3A3A42'; [bx + 3 * k, bx + 19 * k].forEach(xx => { g.beginPath(); g.arc(xx, by + 18 * k, 2.4 * k, 0, TAU); g.fill(); });
    if(!(c && c.broken)){ g.fillStyle = '#FF8A2E'; g.beginPath(); g.moveTo(bx, by + 4 * k); g.quadraticCurveTo(bx - 8 * k, by + 2 * k, bx - 12 * k, by + 6 * k); g.quadraticCurveTo(bx - 6 * k, by + 7 * k, bx, by + 9 * k); g.fill(); g.fillStyle = '#FFD24A'; g.beginPath(); g.moveTo(bx, by + 5.5 * k); g.quadraticCurveTo(bx - 5 * k, by + 5 * k, bx - 7 * k, by + 6.5 * k); g.quadraticCurveTo(bx - 4 * k, by + 7 * k, bx, by + 8 * k); g.fill();
      g.strokeStyle = '#E8E4DE'; g.lineWidth = 1 * k; line(g, [bx + 2 * k, by], [bx + 2 * k, by - 14 * k]); for(let i = 0; i < 3; i++) for(let j = 0; j < 2; j++){ g.fillStyle = (i + j) % 2 ? '#2A2A30' : '#FFFFFF'; g.fillRect(bx + 2 * k + i * 3 * k, by - 14 * k + j * 3 * k, 3 * k, 3 * k); } } }, {layer: 3, zb: 0, top: 34});
  const kb = planked(B, 1.3, 1.9, 0, 0.6, 0.5, 22, MINT); B.decal(kb, 'front', 1.38, 0.44, 8, 10, '#3A2A20', {k: 'win'}); B.roof(1.26, 1.86, 22, 0.68, 0.58, 10, KETCH, {ridge: 'x', ov: 0.06});
  trim(B, L, kb, 2, 3, ['front', 'right']);
  pennant(B, L, 0.12, 2.8, 0, 46, {emblem: forkKnife, pole: STEELD});
});
/* ============================ 🪽 NEST — Balloon Stand ============================ */
HR('nest', {name: 'Balloon Stand', h: 128, live: {period: 2, frames: 6}}, (B, v, L) => { const c = L.cond;
  blanket(B, 0.1, 0.1, 1.8, 1.8, c, MINTD);
  B.drum(0.9, 1.0, 0, 0.4, 18, PLANK, {rings: 2}); B.drum(0.9, 1.0, 18, 0.44, 3, KETCH);
  B.custom(0.9, 1.0, (g, P, k) => { const q = P(0.9, 1.0, 21); parasol(g, q[0], q[1], k, 22, KETCH, '#FFFFFF', c); }, {layer: 2, zb: 21, top: 54});
  B.drum(1.55, 0.45, 0, 0.12, 22, '#5AC8FF', {rings: 2}); B.cone(1.55, 0.45, 22, 0.12, 4, STEELD);
  B.custom(1.2, 0.7, (g, P, k, t) => { if(c && c.broken){ const q = P(1.2, 0.7, 4); [[-6, 0, '#9A8A8A'], [5, 2, '#8A8A9A']].forEach(([dx, dy, col]) => { g.fillStyle = col; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, 4 * k, 2 * k); g.fill(); }); return; }
    const base = P(1.2, 0.7, 30), col = teamOf(L), s = Math.sin(ph(t, 2)), cc = Math.cos(ph(t, 2));   // 🎈 a big bunch of balloons (the team balloon is the biggest)
    [[-16, -52, 8, '#5AC8FF'], [12, -56, 8, '#7FE07A'], [-4, -66, 9, '#FFE14A'], [18, -40, 7, PINK], [-20, -38, 7, '#C07AFF'], [2, -46, 11, col], [-10, -78, 7, KETCH]].forEach(([dx, dy, r], i, arr) => {
      const sway = (i % 2 ? s : cc) * 1.8; balloon(g, base[0] + (dx + sway) * k, base[1] + (dy + (i % 2 ? cc : s)) * k, r * k, arr[i][3], k, base[0], base[1]); });
    const tb = [base[0] + 2 * k + s * 1.8 * k, base[1] - 46 * k + cc * k]; forkKnife(g, tb[0], tb[1], 5 * k, inkOf(col)); }, {layer: 3, zb: 30, top: 122});
  B.custom(1.2, 0.7, (g, P, k) => { const a = P(1.2, 0.7, 0), b2 = P(1.2, 0.7, 30); g.strokeStyle = WOODD; g.lineWidth = 2 * k; line(g, a, b2); }, {layer: 2, zb: 0, top: 30});
  pennant(B, L, 0.2, 1.8, 0, 36, {emblem: forkKnife, pole: WOODD});
});
/* ============================ 🩹 CARE — Tip-jar Booth ============================ */
HR('care', {name: 'Tip-jar Booth', h: 112}, (B, v, L) => { const c = L.cond;
  const w = planked(B, 0.2, 0.24, 0, 1.6, 1.4, 34, MINT); B.decal(w, 'front', 0.45, 1.1, 12, 14, '#3A2A20', {paint: (g, Q, k) => { polyP(g, [Q(0, 0), Q(1, 0), Q(1, 2.4), Q(0, 2.4)]); g.fillStyle = PLANK; g.fill(); }});
  B.door(w, 'right', 0.5, 0.4, 26, {fill: MINTD}); trim(B, L, w, 28, 3.4);
  awning(B, 'front', 1.64, 0.3, 1.7, 30, 0.22, 7, PINK, '#FFFFFF', 7, {cond: c});
  B.box(0.14, 0.18, 34, 1.72, 1.52, 4, '#FFFFFF');
  B.custom(1, 0.95, (g, P, k, t) => { const q = P(1, 0.95, 38), rx = 0.56 * HTW * k * S2, ry = rx / 2, h = 46 * k, br = c && c.broken, col = teamOf(L);   // 🫙 the GIANT tip jar: glass, coins + bills inside, a heart label, a cork lid
    g.fillStyle = 'rgba(210,240,250,0.55)'; g.beginPath(); g.ellipse(q[0], q[1], rx, ry, 0, 0, Math.PI); g.lineTo(q[0] - rx, q[1] - h * 0.8); g.quadraticCurveTo(q[0] - rx, q[1] - h, q[0] - rx * 0.6, q[1] - h); g.lineTo(q[0] + rx * 0.6, q[1] - h); g.quadraticCurveTo(q[0] + rx, q[1] - h, q[0] + rx, q[1] - h * 0.8); g.closePath(); g.fill();
    const lvl = br ? 0.15 : 0.55; g.save(); g.beginPath(); g.ellipse(q[0], q[1], rx * 0.94, ry * 0.94, 0, 0, Math.PI); g.lineTo(q[0] - rx * 0.94, q[1] - h * lvl); g.lineTo(q[0] + rx * 0.94, q[1] - h * lvl); g.closePath(); g.clip();
    const R2 = rnd(31); for(let i = 0; i < 60; i++){ const x = q[0] + (R2() - 0.5) * rx * 1.9, y = q[1] - R2() * h * lvl + ry * 0.6; if(i % 6 === 0){ g.fillStyle = '#7FC24A'; g.save(); g.translate(x, y); g.rotate(R2() * 2 - 1); g.fillRect(-4 * k, -2 * k, 8 * k, 4 * k); g.restore(); } else { g.fillStyle = i % 3 ? '#F2C23A' : '#D9A030'; g.beginPath(); D.ell(g, x, y, 3 * k, 1.6 * k, R2()); g.fill(); } } g.restore();
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2 * k; line(g, [q[0] - rx * 0.7, q[1] - h * 0.15], [q[0] - rx * 0.7, q[1] - h * 0.7]);
    g.fillStyle = '#C99257'; g.beginPath(); D.rr(g, q[0] - rx * 0.62, q[1] - h - 8 * k, rx * 1.24, 9 * k, 3 * k); g.fill();
    if(!br){ const m = [q[0] + rx * 0.2, q[1] - h * 0.42]; g.fillStyle = '#FFFFFF'; g.beginPath(); D.rr(g, m[0] - 9 * k, m[1] - 8 * k, 18 * k, 15 * k, 3 * k); g.fill(); g.fillStyle = col; g.beginPath(); g.moveTo(m[0], m[1] + 4 * k); g.bezierCurveTo(m[0] - 8 * k, m[1] - 2 * k, m[0] - 5 * k, m[1] - 8 * k, m[0], m[1] - 4 * k); g.bezierCurveTo(m[0] + 5 * k, m[1] - 8 * k, m[0] + 8 * k, m[1] - 2 * k, m[0], m[1] + 4 * k); g.fill(); }
    if(!br){ g.fillStyle = '#FFE58A'; const s = Math.sin(ph(t, 2)); [[-rx - 6 * k, -h * 0.9], [rx + 4 * k, -h * 0.7], [0, -h - 16 * k]].forEach(([dx, dy], i) => { D.star(g, q[0] + dx, q[1] + dy + (i % 2 ? s : -s) * 1.5 * k, 3 * k, 1.1 * k, 4); g.fill(); }); } }, {layer: 2, zb: 38, top: 100});
  B.custom(0.4, 1.8, (g, P, k, t, T2) => { if(c && c.broken) return; const a = P(0.3, 1.86, 0), tp = [a[0] + 2 * k, a[1] - 30 * k]; g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.8 * k; line(g, a, tp);   // 🪄 the Tip Fairy's wand sign
    g.fillStyle = MUST; D.star(g, tp[0], tp[1] - 4 * k, 7 * k, 3 * k, 5); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(tp[0], tp[1] - 4 * k, 1.6 * k, 0, TAU); g.fill(); }, {layer: 3, zb: 0, top: 42});
  pennant(B, L, 1.8, 0.3, 38, 20, {emblem: forkKnife, pole: WOODD});
});
/* ============================ 🔧 WORKSHOP — Buffet Depot ============================ */
HR('workshop', {name: 'Buffet Depot', h: 104}, (B, v, L) => { const c = L.cond;
  const w = B.box(0.12, 0.12, 0, 1.76, 1.5, 40, '#DCE2E6'); ['front', 'right'].forEach(s => B.decal(w, s, ...F(w, s), 0, 40, '#DCE2E6', {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.18)'; g.lineWidth = 0.9 * k; for(let u = 0.1; u < 1; u += 0.1) line(g, Q(u, 1), Q(u, 39)); }}));
  B.decal(w, 'front', 0.42, 0.9, 0, 30, '#9AA4AE', {k: 'door', paint: (g, Q, k) => { g.fillStyle = '#2E2A30'; polyP(g, [Q(0, 0), Q(1, 0), Q(1, 12), Q(0, 12)]); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1 * k; for(let z = 14; z < 30; z += 3) line(g, Q(0.02, z), Q(0.98, z));
    const a = Q(0.25, 3), b2 = Q(0.7, 4); [a, b2].forEach((p, i) => { g.fillStyle = i ? '#E2E6EA' : '#F2C46A'; g.beginPath(); D.ell(g, p[0], p[1], 6 * k, 2.4 * k); g.fill(); }); }});
  trim(B, L, w, 34, 3.4); B.box(0.08, 0.08, 40, 1.84, 1.58, 3, '#B8C0C6');
  B.custom(1, 0.86, (g, P, k) => { const d = dome(g, P, k, 1, 0.86, 43, 0.62, 40, c && c.broken ? '#9A9A9A' : '#D6DCE2'); const q = d.c;   // 🍽️ the giant silver cloche on the roof
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 2.6 * k; g.beginPath(); g.ellipse(q[0] - d.rx * 0.25, q[1] - d.hh * 0.55, d.rx * 0.5, d.hh * 0.32, -0.5, Math.PI * 1.05, Math.PI * 1.55); g.stroke();
    g.fillStyle = c && c.broken ? '#8A8A8A' : '#B8C0C6'; g.beginPath(); g.ellipse(q[0], q[1], d.rx * 1.06, d.rx * 0.53, 0, 0, Math.PI); g.lineTo(q[0] - d.rx * 1.06, q[1] - 2 * k); g.ellipse(q[0], q[1] - 2 * k, d.rx * 1.06, d.rx * 0.53, 0, Math.PI, 0, true); g.closePath(); g.fill();
    if(!(c && c.broken)){ g.fillStyle = MUST; g.beginPath(); D.ell(g, q[0], q[1] - d.hh - 3 * k, 5 * k, 3.4 * k); g.fill(); g.fillStyle = '#B8C0C6'; g.fillRect(q[0] - 1.6 * k, q[1] - d.hh - 2 * k, 3.2 * k, 3 * k); } }, {layer: 1, zb: 43, top: 90});
  [[1.62, 1.66, 0], [1.62, 1.66, 3], [1.62, 1.66, 6], [1.62, 1.66, 9]].forEach(([x, y, z], i) => B.box(x - 0.2, y - 0.14, z, 0.4, 0.28, 2.6, i % 2 ? STEEL : '#E2E6EA'));
  B.custom(0.4, 1.75, (g, P, k) => { const q = P(0.38, 1.72, 0); for(let i = 0; i < 2; i++){ const b = [q[0] + i * 8 * k, q[1] - i * 3 * k]; g.fillStyle = '#C99257'; g.fillRect(b[0] - 7 * k, b[1] - 9 * k, 14 * k, 9 * k); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 0.9 * k; g.strokeRect(b[0] - 7 * k, b[1] - 9 * k, 14 * k, 9 * k);
      [[-3, '#E2553A'], [1, '#7FC24A'], [4, MUST]].forEach(([dx, col]) => { g.fillStyle = c && c.broken ? '#8A7A6A' : col; g.beginPath(); g.arc(b[0] + dx * k, b[1] - 10 * k, 2.4 * k, 0, TAU); g.fill(); }); } }, {layer: 3, zb: 0, top: 16});
  banner(B, L, w, 'right', 0.5, 0.4, 8, 22, forkKnife);
  pennant(B, L, 1.8, 0.2, 43, 22, {emblem: forkKnife, pole: STEELD});
});
/* ============================ 🗼 TOWER — Giant Menu Board (stand + aim) ============================ */
HR('tower', {name: 'Giant Menu Board', h: 132, stand: [0.5, 0.5, 86], aim: [0.5, 0.5, 100]}, (B, v, L) => { const c = L.cond;
  [[0.16, 0.42], [0.78, 0.42]].forEach(([x, y]) => B.box(x, y, 0, 0.08, 0.16, 82, STEELD));
  const bd = B.box(0.04, 0.4, 30, 0.92, 0.2, 50, '#2E3238');
  B.decal(bd, 'front', ...F(bd, 'front'), 0, 50, '#2E3238', {paint: (g, Q, k) => { const br = c && c.broken; g.strokeStyle = MUST; g.lineWidth = 2.2 * k; polyP(g, [Q(0.03, 2), Q(0.97, 2), Q(0.97, 48), Q(0.03, 48)]); g.stroke();   // 🍔🍟🥤🍩 the menu, drawn (no words)
    const a = Q(0.28, 36); burger(g, a[0], a[1], 6 * k, c); const b2 = Q(0.72, 36); friesIcon(g, b2[0], b2[1] + 3 * k, 6 * k, c); const d2 = Q(0.28, 15); sodaIcon(g, d2[0], d2[1], 6 * k, c); const e = Q(0.72, 15); donut(g, e[0], e[1], 6 * k, c, {seed: 9, n: 7});
    g.fillStyle = MUST; [Q(0.5, 26), Q(0.5, 10)].forEach(p => { g.beginPath(); g.arc(p[0], p[1], 1.2 * k, 0, TAU); g.fill(); });
    if(br){ g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 1 * k; line(g, Q(0.2, 48), Q(0.6, 20)); line(g, Q(0.6, 20), Q(0.5, 6)); } }});
  B.decal(bd, 'right', ...F(bd, 'right'), 0, 50, '#2E3238');
  trim(B, L, bd, 0, 3, ['front', 'right']);
  if(lightOf(c)) B.custom(0.5, 0.62, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; g.fillStyle = '#FFE58A'; for(let i = 0; i <= 10; i++){ const p = P(0.06 + i * 0.088, 0.61, 81); g.beginPath(); g.arc(p[0], p[1], 1.5 * k, 0, TAU); g.fill(); } }, {layer: 2, zb: 80, top: 82});
  const dk = B.box(0.04, 0.12, 82, 0.92, 0.76, 4, PLANK); trim(B, L, dk, 0, 2.4, ['front', 'right']);
  B.custom(0.5, 0.5, (g, P, k) => { if(c && c.broken) return; g.strokeStyle = STEELD; g.lineWidth = 1.3 * k; [[0.06, 0.86], [0.94, 0.86], [0.94, 0.14]].forEach(([x, y]) => line(g, P(x, y, 86), P(x, y, 97))); line(g, P(0.06, 0.86, 96), P(0.94, 0.86, 96)); line(g, P(0.94, 0.86, 96), P(0.94, 0.14, 96)); }, {layer: 4, zb: 86, top: 97});
  B.custom(0.3, 0.3, (g, P, k) => { if(c && c.broken) return; const q = P(0.22, 0.22, 86); sodaIcon(g, q[0], q[1] - 14 * k, 9 * k, c); }, {layer: 3, zb: 86, top: 118});
  pennant(B, L, 0.82, 0.22, 86, 24, {emblem: forkKnife, pole: STEELD, layer: 5});
});
/* ============================ 🎨 WARDROBE — Bib & Napkin Shop ============================ */
HR('wardrobe', {name: 'Bib & Napkin Shop', h: 80}, (B, v, L) => { const c = L.cond;
  const ct = B.box(0.12, 0.12, 0, 1.76, 0.5, 18, PLANK); B.decal(ct, 'front', ...F(ct, 'front'), 0, 18, KETCH, {paint: checker(18, KETCH, '#FFFFFF', 18, 3)}); B.box(0.1, 0.1, 18, 1.8, 0.54, 2.5, WOOD);
  trim(B, L, ct, 0, 3, ['right']);
  [[0.14, 0.14], [1.82, 0.14], [0.14, 0.56], [1.82, 0.56]].forEach(p => B.box(p[0] - 0.03, p[1] - 0.03, 18, 0.06, 0.06, 26, WOODD));
  tent(B, 0.06, 0.06, 44, 1.88, 0.62, 14, MINTD, '#FFFFFF', 10, {cond: c, layer: 1});
  B.custom(1, 0.6, (g, P, k, t) => { const a = P(0.14, 0.6, 40), b2 = P(1.86, 0.6, 40), col = teamOf(L), br = c && c.broken, wv = Math.sin(ph(t, 1.8)) + Math.cos(ph(t, 1.8)) * 0.5;   // bibs on the front rail
    g.strokeStyle = WOODD; g.lineWidth = 1.6 * k; line(g, a, b2);
    [[0.35, br ? '#8A7A70' : col, 1], [0.75, '#FFFFFF', 2], [1.15, br ? '#9A7A70' : KETCH, 0], [1.55, br ? '#8A8A80' : MINT, 0]].forEach(([x, cl, kind], i) => { if(br && i === 1) return; const p = P(x + 0.12, 0.6, 39.5), sw = (i % 2 ? -1 : 1) * wv * 0.5 * k;
      g.fillStyle = cl; g.beginPath(); g.moveTo(p[0] - 3 * k, p[1]); g.quadraticCurveTo(p[0], p[1] + 3 * k, p[0] + 3 * k, p[1]); g.lineTo(p[0] + 7 * k + sw, p[1] + 5 * k); g.quadraticCurveTo(p[0] + 8 * k + sw, p[1] + 16 * k, p[0] + sw, p[1] + 17 * k); g.quadraticCurveTo(p[0] - 8 * k + sw, p[1] + 16 * k, p[0] - 7 * k + sw, p[1] + 5 * k); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 0.8 * k; g.stroke();
      if(kind === 1) forkKnife(g, p[0] + sw * 0.6, p[1] + 10 * k, 4 * k, inkOf(col)); else if(kind === 2){ g.fillStyle = KETCH; g.beginPath(); g.moveTo(p[0] + sw, p[1] + 14 * k); g.bezierCurveTo(p[0] - 5 * k + sw, p[1] + 9 * k, p[0] - 2 * k + sw, p[1] + 5 * k, p[0] + sw, p[1] + 8 * k); g.bezierCurveTo(p[0] + 2 * k + sw, p[1] + 5 * k, p[0] + 5 * k + sw, p[1] + 9 * k, p[0] + sw, p[1] + 14 * k); g.fill(); } }); }, {layer: 3, zb: 22, top: 41});
  B.custom(0.9, 0.36, (g, P, k) => { const q = P(0.9, 0.36, 20.5); for(let i = 0; i < 4; i++){ const x = q[0] - 9 * k + i * 6 * k; g.fillStyle = ['#FFFFFF', KETCH, MINT, MUST][i]; g.beginPath(); D.ell(g, x, q[1] - 2 * k, 2.6 * k, 4 * k); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.8 * k; g.stroke(); } }, {layer: 2, zb: 20.5, top: 30});
  pennant(B, L, 1.88, 0.12, 0, 46, {emblem: forkKnife, pole: WOODD});
});
/* ============================ 🔮 SPELL TOWER — Fortune-cookie Booth ============================ */
HR('spell', {name: 'Fortune-cookie Booth', h: 112}, (B, v, L) => { const c = L.cond;
  B.drum(1, 1, 0, 0.88, 8, '#E2C8A8', {rings: 2});
  B.custom(1, 1, (g, P, k) => { const q = P(1, 1, 8), rx = 0.88 * HTW * k * S2, col = c && c.broken ? '#6A6060' : teamOf(L); g.strokeStyle = col; g.lineWidth = 3 * k; g.beginPath(); g.ellipse(q[0], q[1], rx * 0.92, rx * 0.46, 0, 0, TAU); g.stroke(); }, {layer: 1, zb: 8, top: 9});
  B.custom(1, 0.9, (g, P, k, t) => { const q = P(1, 0.9, 8), br = c && c.broken, s = Math.sin(ph(t, 2)), lv = lightOf(c);   // 🥠 the GIANT fortune cookie: a folded golden shell, the paper slip glowing out of it
    const w = 46 * k, h = 52 * k, dough = br ? '#B8A080' : '#F0BE5A', dk = br ? '#8A7458' : '#C88A2E';
    g.fillStyle = dk; g.beginPath(); g.moveTo(q[0] - w, q[1] - 4 * k); g.quadraticCurveTo(q[0] - w * 0.9, q[1] - h * 1.15, q[0], q[1] - h); g.quadraticCurveTo(q[0] + w * 0.9, q[1] - h * 1.15, q[0] + w, q[1] - 4 * k); g.quadraticCurveTo(q[0] + w * 0.4, q[1] - h * 0.2, q[0], q[1] - h * 0.42); g.quadraticCurveTo(q[0] - w * 0.4, q[1] - h * 0.2, q[0] - w, q[1] - 4 * k); g.fill();
    g.fillStyle = D.rad(g, q[0] - w * 0.3, q[1] - h * 0.8, 1, w * 1.2, [[0, '#FFE8A8'], [0.5, dough], [1, dk]]); g.beginPath(); g.moveTo(q[0] - w, q[1] - 4 * k); g.quadraticCurveTo(q[0] - w * 0.95, q[1] - h * 1.05, q[0] - w * 0.1, q[1] - h * 0.9); g.quadraticCurveTo(q[0] - w * 0.2, q[1] - h * 0.5, q[0], q[1] - h * 0.42); g.quadraticCurveTo(q[0] - w * 0.4, q[1] - h * 0.2, q[0] - w, q[1] - 4 * k); g.fill();
    g.beginPath(); g.moveTo(q[0] + w, q[1] - 4 * k); g.quadraticCurveTo(q[0] + w * 0.95, q[1] - h * 1.05, q[0] + w * 0.1, q[1] - h * 0.9); g.quadraticCurveTo(q[0] + w * 0.2, q[1] - h * 0.5, q[0], q[1] - h * 0.42); g.quadraticCurveTo(q[0] + w * 0.4, q[1] - h * 0.2, q[0] + w, q[1] - 4 * k); g.fillStyle = D.sh(dough, -0.08); g.fill();
    g.strokeStyle = 'rgba(140,80,20,0.35)'; g.lineWidth = 1 * k; [0.3, 0.55].forEach(f => { g.beginPath(); g.moveTo(q[0] - w * (1 - f * 0.5), q[1] - 4 * k - h * f * 0.4); g.quadraticCurveTo(q[0] - w * 0.5, q[1] - h * (0.5 + f * 0.4), q[0] - w * 0.15, q[1] - h * (0.5 + f * 0.3)); g.stroke(); });
    if(!br){ g.fillStyle = '#FFFFFF'; g.save(); g.translate(q[0] + 4 * k, q[1] - h * 0.5); g.rotate(-0.25 + s * 0.05); g.fillRect(0, -4 * k, 34 * k, 8 * k); g.fillStyle = KETCH; for(let i = 0; i < 4; i++) g.fillRect(6 * k + i * 6 * k, -1 * k, 3.6 * k, 2 * k); g.restore(); }
    if(lv && !br){ g.fillStyle = '#FFE58A'; [[-30, -66], [28, -70], [40, -40], [-40, -38], [0, -80]].forEach(([dx, dy], i) => { D.star(g, q[0] + dx * k, q[1] + dy * k + (i % 2 ? s : -s) * 2 * k, 3 * k, 1.1 * k, 4); g.fill(); }); } }, {layer: 2, zb: 8, top: 96});
  halo(B, 1.2, 0.95, 40, 26, '#FFE58A', lightOf(c) ? 0.45 : 0);
  B.custom(1, 1.8, (g, P, k, t, T2) => { const q = P(0.6, 1.72, 8); [[0, 0], [16, 6]].forEach(([dx, dy]) => { g.fillStyle = c && c.broken ? '#9A8070' : '#F0BE5A'; g.beginPath(); g.moveTo(q[0] + dx * k - 5 * k, q[1] + dy * k); g.quadraticCurveTo(q[0] + dx * k, q[1] + dy * k - 9 * k, q[0] + dx * k + 5 * k, q[1] + dy * k); g.quadraticCurveTo(q[0] + dx * k, q[1] + dy * k - 3 * k, q[0] + dx * k - 5 * k, q[1] + dy * k); g.fill(); }); }, {layer: 3, zb: 8, top: 18});
  [[0.2, 1.0], [1.8, 1.0]].forEach(([x, y]) => { B.box(x - 0.03, y - 0.03, 8, 0.06, 0.06, 34, KETCH); B.custom(x, y, (g, P, k) => { const q = P(x, y, 40); g.fillStyle = c && c.broken ? '#7A5A50' : KETCH; g.beginPath(); D.ell(g, q[0], q[1] + 4 * k, 5 * k, 6 * k); g.fill(); g.fillStyle = MUST; g.fillRect(q[0] - 3 * k, q[1] - 3 * k, 6 * k, 2 * k); g.fillRect(q[0] - 3 * k, q[1] + 10 * k, 6 * k, 2 * k); }, {layer: 3, zb: 30, top: 44}); });
  pennant(B, L, 1.8, 1.0, 42, 18, {emblem: forkKnife, pole: KETCH, layer: 4});
});
/* ============================ 🕵️ HIDEOUT — Snack Stash ============================ */
HR('hideout', {name: 'Snack Stash', h: 60}, (B, v, L) => { const c = L.cond;
  [[0.2, 0.2, 0, 0.7, 0.6, 20], [0.95, 0.25, 0, 0.6, 0.55, 16], [0.3, 0.3, 20, 0.5, 0.4, 14], [1.3, 0.9, 0, 0.5, 0.5, 12]].forEach(([x, y, z, w, d, h], i) => { const b = B.box(x, y, z, w, d, h, i % 2 ? '#C99257' : '#D9A86A'); B.decal(b, 'front', ...F(b, 'front'), h * 0.4, h * 0.25, i % 2 ? KETCH : MINTD); });
  B.custom(0.85, 0.7, (g, P, k, t, T2) => { const br = c && c.broken, A = br ? '#9A7A70' : KETCH, pts = [P(0.08, 1.18, 0), P(1.6, 1.18, 0), P(1.6, 0.9, 18), P(1.05, 0.9, 24), P(0.85, 0.65, 38), P(0.3, 0.7, 36), P(0.08, 0.9, 20)];   // the gingham tarp thrown over the pile
    polyP(g, pts); g.fillStyle = '#FFFFFF'; g.fill(); g.save(); g.clip(); const o = P(0, 0, 0); for(let i = -8; i < 14; i++) for(let j = -8; j < 14; j++){ if((i + j) % 2 && i % 2) continue; const p = [o[0] + (i - j) * 7 * k, o[1] + (i + j) * 3.5 * k]; g.fillStyle = D.rgba(A, (i % 2 && j % 2) ? 0.9 : 0.4); polyP(g, [p, [p[0] + 7 * k, p[1] + 3.5 * k], [p[0], p[1] + 7 * k], [p[0] - 7 * k, p[1] + 3.5 * k]]); g.fill(); } g.restore();
    g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 1 * k; polyP(g, pts); g.stroke(); g.strokeStyle = 'rgba(42,28,20,0.18)'; line(g, P(0.85, 0.65, 38), P(0.6, 1.18, 0)); line(g, P(1.05, 0.9, 24), P(1.3, 1.18, 0));
    if(lightOf(c)){ const e = P(0.85, 1.19, 6); g.fillStyle = '#1E1612'; g.beginPath(); D.ell(g, e[0], e[1] - 3 * k, 9 * k, 5 * k); g.fill(); g.fillStyle = '#FFE58A'; [-3, 3].forEach(dx => { g.beginPath(); D.ell(g, e[0] + dx * k, e[1] - 3.4 * k, 1.8 * k, 1.3 * k); g.fill(); }); } }, {layer: 2, zb: 0, top: 40});
  B.custom(1.5, 1.6, (g, P, k) => { const q = P(1.45, 1.55, 0); g.fillStyle = c && c.broken ? '#8A7070' : '#FFD03A'; g.save(); g.translate(q[0], q[1] - 7 * k); g.rotate(0.3); g.beginPath(); D.rr(g, -5 * k, -7 * k, 10 * k, 13 * k, 2 * k); g.fill(); g.fillStyle = KETCH; g.fillRect(-5 * k, -2 * k, 10 * k, 4 * k); g.restore();
    g.fillStyle = '#E8B868'; [[-10, 2], [-6, 5], [8, 3], [3, 7], [12, 6]].forEach(([dx, dy]) => { g.beginPath(); g.arc(q[0] + dx * k, q[1] + dy * k, 1.2 * k, 0, TAU); g.fill(); }); }, {layer: 3, zb: 0, top: 16});
  pennant(B, L, 1.82, 0.22, 0, 30, {emblem: forkKnife, pole: WOODD});
});
/* ============================ 🐾 DEN — Pet Café ============================ */
HR('den', {name: 'Pet Café', h: 92}, (B, v, L) => { const c = L.cond;
  const w = planked(B, 0.16, 0.16, 0, 1.3, 1.2, 32, '#FFE3E8'); B.door(w, 'front', 0.48, 0.36, 24, {fill: MINTD}); B.win(w, 'front', 0.92, 0.3, 11, 12, {fill: SKY}); B.win(w, 'right', 0.3, 0.6, 11, 12, {fill: SKY});
  trim(B, L, w, 26, 3.2); awning(B, 'front', 1.36, 0.2, 1.42, 29, 0.2, 6, MINTD, '#FFFFFF', 6, {cond: c});
  B.roof(0.1, 0.1, 32, 1.42, 1.32, 20, PINK, {ridge: 'x', ov: 0.12, stripes: 7});
  B.custom(0.81, 1.36, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const m = P(0.81, 1.37, 46); g.fillStyle = c && c.broken ? '#BDB4A2' : '#FFFFFF'; g.beginPath(); g.arc(m[0], m[1], 8 * k, 0, TAU); g.fill(); g.strokeStyle = MINTD; g.lineWidth = 1.8 * k; g.stroke();   // 🐾 paw sign
    g.fillStyle = PATTY; g.beginPath(); D.ell(g, m[0], m[1] + 1.6 * k, 3.2 * k, 2.6 * k); g.fill(); [[-3.4, -2.4], [-1.2, -4.2], [1.2, -4.2], [3.4, -2.4]].forEach(([dx, dy]) => { g.beginPath(); g.arc(m[0] + dx * k, m[1] + dy * k, 1.2 * k, 0, TAU); g.fill(); }); }, {layer: 3, zb: 38, top: 54});
  B.custom(1.62, 0.5, (g, P, k, t) => { if(c && c.broken) return; const q = P(1.66, 0.5, 0);   // 🐱 a cat tower with a sleepy cat
    g.fillStyle = '#C8A574'; g.fillRect(q[0] - 1.6 * k, q[1] - 30 * k, 3.2 * k, 30 * k); g.fillStyle = MINT; g.beginPath(); D.ell(g, q[0], q[1] - 30 * k, 8 * k, 3.4 * k); g.fill(); g.beginPath(); D.ell(g, q[0], q[1] - 14 * k, 7 * k, 3 * k); g.fill(); g.fillStyle = '#C8A574'; g.beginPath(); D.ell(g, q[0], q[1], 9 * k, 3.6 * k); g.fill();
    const s = Math.sin(ph(t, 2)) * 0.6 + Math.cos(ph(t, 2)) * 0.3; g.fillStyle = '#FF9A3A'; g.beginPath(); D.ell(g, q[0], q[1] - 35 * k, 6 * k, 3.6 * k); g.fill(); g.beginPath(); g.arc(q[0] - 5 * k, q[1] - 37 * k + s * k, 3.2 * k, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(q[0] - 7.6 * k, q[1] - 39 * k + s * k); g.lineTo(q[0] - 7 * k, q[1] - 43 * k + s * k); g.lineTo(q[0] - 5.4 * k, q[1] - 40 * k + s * k); g.fill(); g.beginPath(); g.moveTo(q[0] - 4.4 * k, q[1] - 40 * k + s * k); g.lineTo(q[0] - 3 * k, q[1] - 43 * k + s * k); g.lineTo(q[0] - 2.4 * k, q[1] - 39 * k + s * k); g.fill();
    g.strokeStyle = '#FF9A3A'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(q[0] + 5 * k, q[1] - 35 * k); g.quadraticCurveTo(q[0] + 10 * k, q[1] - 33 * k, q[0] + 8 * k, q[1] - 28 * k); g.stroke(); g.strokeStyle = '#3A2A20'; g.lineWidth = 0.8 * k; line(g, [q[0] - 6.4 * k, q[1] - 37 * k + s * k], [q[0] - 5 * k, q[1] - 37 * k + s * k]); }, {layer: 3, zb: 0, top: 46});
  B.custom(1.2, 1.7, (g, P, k) => { const q = P(1.3, 1.7, 0); [[0, 0, KETCH, '#C98A4A'], [10, 4, MINTD, '#5AC8FF']].forEach(([dx, dy, col, food]) => { g.fillStyle = col; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k - 2 * k, 5 * k, 2.4 * k); g.fill(); g.fillStyle = c && c.broken ? '#8A7A6A' : food; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k - 3 * k, 3.4 * k, 1.3 * k); g.fill(); });
    const b = P(0.4, 1.75, 0); g.fillStyle = '#F4EFE4'; g.save(); g.translate(b[0], b[1] - 2 * k); g.rotate(-0.4); g.fillRect(-5 * k, -1.2 * k, 10 * k, 2.4 * k); [[-5, 0], [5, 0]].forEach(([dx]) => { g.beginPath(); g.arc(dx * k, -1.3 * k, 1.8 * k, 0, TAU); g.arc(dx * k, 1.3 * k, 1.8 * k, 0, TAU); g.fill(); }); g.restore(); }, {layer: 3, zb: 0, top: 8});
  pennant(B, L, 1.84, 1.84, 0, 38, {emblem: forkKnife, pole: WOODD});
});
/* ---------- 🟩 territory floor: picnic-blanket gingham + food-court tiles + sprinkles + paper plates + ketchup squiggles ---------- */
addFloor('horde', {name: 'Picnic blankets + food-court tiles', top: '#F4E6D2', top2: '#EADAC4', side: '#B8A48A', paint: (g, q, s, i, j) => { const r = hash(i, j, 5), r2 = hash(j, i, 6), blk = hash(Math.floor(i / 2), Math.floor(j / 2), 7) < 0.45;
  tileBase(g, q, s, '#F4E6D2', '#EFDDC6', r);
  if(blk){ for(let a = 0; a < 4; a++) for(let b = 0; b < 4; b++){ const n = (a % 2) + (b % 2); if(!n) continue; const u0 = 0.04 + a * 0.23, v0 = 0.04 + b * 0.23; polyP(g, [q(u0, v0), q(u0 + 0.23, v0), q(u0 + 0.23, v0 + 0.23), q(u0, v0 + 0.23)]); g.fillStyle = 'rgba(216,50,46,' + (n === 2 ? 0.7 : 0.32) + ')'; g.fill(); } }
  else { g.strokeStyle = 'rgba(62,156,138,0.35)'; g.lineWidth = Math.max(1, 0.9 * s); g.beginPath(); g.moveTo(...q(0.5, 0.04)); g.lineTo(...q(0.5, 0.96)); g.moveTo(...q(0.04, 0.5)); g.lineTo(...q(0.96, 0.5)); g.stroke(); if(r2 > 0.6){ polyP(g, [q(0.06, 0.06), q(0.48, 0.06), q(0.48, 0.48), q(0.06, 0.48)]); g.fillStyle = 'rgba(123,211,192,0.4)'; g.fill(); } }
  for(let n = 0; n < 5; n++){ const p = q(hash(i + n, j, 8), hash(i, j + n, 9)); g.fillStyle = SPR[(n + ((r * 10) | 0)) % SPR.length]; g.beginPath(); D.ell(g, p[0], p[1], 1.6 * s, 0.6 * s, n); g.fill(); }
  if(r < 0.2){ const p = q(0.62, 0.42 + r2 * 0.2); g.fillStyle = '#FFFFFF'; g.beginPath(); D.ell(g, p[0], p[1], 7 * s, 3.4 * s); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.2)'; g.lineWidth = 0.8 * s; g.stroke(); g.beginPath(); D.ell(g, p[0], p[1], 4.6 * s, 2.2 * s); g.stroke(); }
  if(r2 < 0.2){ const a = q(0.2, 0.7), b = q(0.42, 0.62); g.strokeStyle = 'rgba(216,50,46,0.85)'; g.lineWidth = 1.6 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.bezierCurveTo(a[0] + 4 * s, a[1] - 5 * s, b[0] - 4 * s, b[1] + 5 * s, b[0], b[1]); g.stroke(); } }});
/* ---------- 🎟️🍪🍩 own resource shapes (1 × 1, states full · half · empty) — Props.AR.resKey('horde', 'coin' | 'brick' | 'gem') ---------- */
// 🎟️ Coupons: a little red coupon booth: a ticket machine on a post, a long curl of coupons spilling to the ground (half = short curl · empty = an empty spool + a "closed" shutter)
function boothPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = c && c.broken, body = br ? '#8A6A6A' : [KETCH, '#E5484D', '#C8323A'][v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = '#5A5560'; g.fillRect(-2, -16, 4, 16); g.fillStyle = '#3A3A42'; g.beginPath(); D.ell(g, 0, 0, 7, 2.6); g.fill();
  g.fillStyle = D.sh(body, -0.2); g.beginPath(); g.moveTo(-11, -16); g.lineTo(3, -12); g.lineTo(3, -40); g.lineTo(-11, -44); g.closePath(); g.fill(); g.fillStyle = body; g.beginPath(); g.moveTo(3, -12); g.lineTo(12, -16); g.lineTo(12, -44); g.lineTo(3, -40); g.closePath(); g.fill();
  g.fillStyle = D.sh(body, 0.25); g.beginPath(); g.moveTo(-11, -44); g.lineTo(3, -40); g.lineTo(12, -44); g.lineTo(-2, -48); g.closePath(); g.fill();
  g.fillStyle = MUST; g.beginPath(); g.moveTo(-9, -38); g.lineTo(1, -35); g.lineTo(1, -31); g.lineTo(-9, -34); g.closePath(); g.fill();
  g.fillStyle = st === 'empty' ? '#3A3A42' : '#FFF4D0'; g.beginPath(); g.moveTo(-8, -26); g.lineTo(0, -24); g.lineTo(0, -21); g.lineTo(-8, -23); g.closePath(); g.fill();
  if(st === 'empty'){ g.fillStyle = '#9AA4AE'; g.beginPath(); g.moveTo(-10, -30); g.lineTo(2, -27); g.lineTo(2, -18); g.lineTo(-10, -21); g.closePath(); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 0.8; for(let i = 1; i < 4; i++){ g.beginPath(); g.moveTo(-10, -30 + i * 2.3); g.lineTo(2, -27 + i * 2.3); g.stroke(); } }
  if(st !== 'empty'){ const n = st === 'full' ? 9 : 4; let px = -4, py = -23; for(let i = 0; i < n; i++){ const nx = px - 3 + Math.sin(i * 1.3) * 3, ny = py + 3.4; g.fillStyle = i % 2 ? '#FFF4D0' : '#FFE08A'; g.beginPath(); g.moveTo(px - 3, py); g.lineTo(px + 3, py + 1); g.lineTo(nx + 3, ny + 1); g.lineTo(nx - 3, ny); g.closePath(); g.fill(); g.strokeStyle = 'rgba(160,110,30,0.5)'; g.lineWidth = 0.6; g.setLineDash([1, 1]); g.beginPath(); g.moveTo(nx - 3, ny); g.lineTo(nx + 3, ny + 1); g.stroke(); g.setLineDash([]); px = nx; py = ny; if(py > 0) break; }
    if(st === 'full') [[-14, 4, 0.4], [8, 5, -0.3], [14, 1, 0.8]].forEach(([sx, sy, a]) => { g.save(); g.translate(sx, sy); g.rotate(a); g.fillStyle = '#FFE08A'; g.fillRect(-4, -2, 8, 4); g.fillStyle = KETCH; g.fillRect(-1, -1, 2, 2); g.restore(); }); }
  g.fillStyle = br ? '#6A6A6A' : '#FFFFFF'; g.beginPath(); g.arc(7.5, -36, 2.2, 0, TAU); g.fill(); if(!br && st !== 'empty'){ g.fillStyle = 'rgba(255,255,255,0.95)'; D.star(g, 14, -48, 2.6, 1, 4); g.fill(); }
  g.restore(); }
// 🍪 Crumbs: a big glass cookie jar with a red lid, cookies stacked inside + a couple outside (half = a few · empty = crumbs, lid off)
function cookie(g, x, y, r, c, chips){ const br = c && c.broken; g.fillStyle = br ? '#9A8A70' : '#D99A4A'; g.beginPath(); D.ell(g, x, y, r, r * 0.55); g.fill(); g.fillStyle = br ? '#AA9A80' : '#E8B060'; g.beginPath(); D.ell(g, x, y - r * 0.12, r * 0.9, r * 0.45); g.fill();
  g.fillStyle = CHOCO; for(let i = 0; i < (chips || 4); i++){ const a = i * 2.2 + r, d = r * (0.3 + (i % 2) * 0.3); g.beginPath(); g.arc(x + Math.cos(a) * d, y - r * 0.12 + Math.sin(a) * d * 0.45, r * 0.13, 0, TAU); g.fill(); } }
function jarPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = c && c.broken, lid = br ? '#8A6A6A' : [KETCH, MINTD, MUST][v % 3]; g.save(); g.translate(x, y); g.scale(k * (v % 3 === 1 ? -1 : 1), k);
  g.fillStyle = 'rgba(200,235,245,0.5)'; g.beginPath(); g.moveTo(-13, -2); g.quadraticCurveTo(-15, -20, -11, -30); g.lineTo(11, -30); g.quadraticCurveTo(15, -20, 13, -2); g.quadraticCurveTo(0, 3, -13, -2); g.fill();
  const n = st === 'full' ? 7 : st === 'half' ? 3 : 0; for(let i = 0; i < n; i++) cookie(g, (i % 2 ? 3 : -3) + (i % 3 - 1) * 2, -4 - i * 3.6, 8, c, 4);
  if(st === 'empty'){ g.fillStyle = '#C98A4A'; [[-6, -3], [-2, -2], [3, -3], [6, -2], [0, -4], [-4, -5]].forEach(([dx, dy]) => { g.beginPath(); g.arc(dx, dy, 1, 0, TAU); g.fill(); }); }
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-10, -6); g.quadraticCurveTo(-12, -18, -9, -26); g.stroke(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-13, -2); g.quadraticCurveTo(-15, -20, -11, -30); g.lineTo(11, -30); g.quadraticCurveTo(15, -20, 13, -2); g.stroke();
  g.fillStyle = 'rgba(200,235,245,0.7)'; g.beginPath(); D.ell(g, 0, -30, 11.5, 3); g.fill();
  if(st === 'empty'){ g.save(); g.translate(14, -2); g.rotate(0.5); g.fillStyle = lid; g.beginPath(); D.ell(g, 0, 0, 10, 3); g.fill(); g.fillStyle = D.sh(lid, 0.2); g.beginPath(); D.ell(g, 0, -1.6, 3, 1.6); g.fill(); g.restore(); }
  else { g.fillStyle = D.sh(lid, -0.15); g.beginPath(); D.rr(g, -12, -34, 24, 4, 1.6); g.fill(); g.fillStyle = lid; g.beginPath(); D.ell(g, 0, -34, 12, 3.2); g.fill(); g.fillStyle = D.sh(lid, 0.25); g.beginPath(); D.ell(g, 0, -37, 3.4, 2); g.fill(); g.fillRect(-1.6, -37, 3.2, 3); }
  if(st !== 'empty'){ cookie(g, 15, 3, 6, c, 3); if(st === 'full') cookie(g, -15, 4, 5.4, c, 3); }
  if(!br && st === 'full'){ g.fillStyle = 'rgba(255,255,255,0.95)'; D.star(g, -14, -36, 2.4, 0.9, 4); g.fill(); }
  g.restore(); }
// 🍩 Diamond Donuts: a stack of glazed donuts with diamond sprinkles on a cake stand (half = 1 left · empty = the stand + crumbs)
function donutPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = c && c.broken; g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = br ? '#9A9AA0' : '#E8ECEF'; g.beginPath(); D.ell(g, 0, 0, 15, 5); g.fill(); g.fillStyle = br ? '#7A7A80' : '#C3CAD2'; g.fillRect(-2.4, -9, 4.8, 9); g.fillStyle = br ? '#A8A8AE' : '#F4F6F8'; g.beginPath(); D.ell(g, 0, -9, 16, 4.6); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.2)'; g.lineWidth = 0.8; g.stroke();
  const ices = [[PINK, 11], ['#9A5ACA', 13], ['#5AC8FF', 15]], n = st === 'full' ? 3 : st === 'half' ? 1 : 0;
  for(let i = 0; i < n; i++) donut(g, (i === 1 ? 1.5 : -0.5), -13 - i * 6.4, 11 - i * 0.6, c, {ice: br ? '#B8A0A8' : ices[(i + v) % 3][0], seed: ices[i][1], n: 0, flat: 0.42});
  if(!br) for(let i = 0; i < n; i++){ const R2 = rnd(51 + i); for(let j = 0; j < 7; j++){ const a = R2() * TAU, d = 4 + R2() * 5; const px = Math.cos(a) * d + (i === 1 ? 1.5 : -0.5), py = -13 - i * 6.4 + Math.sin(a) * d * 0.42 - 0.6;
      g.fillStyle = j % 2 ? '#FFFFFF' : '#C8F0FF'; g.beginPath(); g.moveTo(px, py - 1.6); g.lineTo(px + 1.2, py); g.lineTo(px, py + 1.2); g.lineTo(px - 1.2, py); g.closePath(); g.fill(); } }
  if(st === 'empty'){ g.fillStyle = DOUGH; [[-6, -10], [-1, -9.5], [4, -10.4], [8, -9.4]].forEach(([dx, dy]) => { g.beginPath(); g.arc(dx, dy, 1.2, 0, TAU); g.fill(); }); g.fillStyle = PINK; g.beginPath(); g.arc(1, -10.6, 1.4, 0, TAU); g.fill(); }
  if(!br && st !== 'empty'){ g.fillStyle = 'rgba(255,255,255,0.95)'; D.star(g, 12, -16 - n * 6, 3, 1.1, 4); g.fill(); D.star(g, -13, -12 - n * 4, 2.2, 0.8, 4); g.fill(); }
  g.restore(); }
const RES = (slot, name, h, tag, paint) => organic('horde', 'horde_' + slot, {name, look: 'horde', side: 'horde', slot, kind: 'thing', foot: [1, 1], h, variants: 3, block: true, states: ['full', 'half', 'empty'], state: 'full', dead: 'keep',
  tags: ['ar', 'ar-res', 'resource', tag, 'ar-horde'], conds: {'*': (g, x, y, k, t, v, c, L) => paint(g, x, y, k, t, v, L, c)}}, (g, x, y, k, t, v, L) => paint(g, x, y, k, t, v, L, null));
RES('coin', 'Coupon booth', 48, 'coin', boothPaint); RES('brick', 'Cookie jar', 40, 'brick', jarPaint); RES('gem', 'Diamond donuts', 38, 'gem', donutPaint);
/* ---------- 🧱 walls: 🍟 a white picket fence on a ketchup-red base with a team rail · posts = soda cups with straws ·
   gate = a turnstile under a donut arch · 🏯 tall = a stacked-crate rampart + giant soda-cup towers + a burger gatehouse ---------- */
(function(){ const {wallProp, gateProp, gateDoors, longFaces, WT, WP, tallWallProp, tallGateProp} = K.AR;
  function cup(B, L, x, y, z0, r, h, c, team){ const br = c && c.broken; B.custom(x, y, (g, P, k) => { frustum(g, P, k, x, y, z0, r * 0.78, r, h, br ? '#9A8080' : '#FFFFFF');
      const q0 = P(x, y, z0), col = team ? (br ? '#6A6060' : teamOf(L)) : (br ? '#8A6060' : KETCH); for(let i = 0; i < 3; i++){ const f0 = 0.15 + i * 0.3, f1 = f0 + 0.15, r0 = r * (0.78 + 0.22 * f0), r1 = r * (0.78 + 0.22 * f1), a = r0 * HTW * k * S2, b = r1 * HTW * k * S2, y0 = q0[1] - h * f0 * k, y1 = q0[1] - h * f1 * k;
        g.fillStyle = i === 1 && team ? col : (br ? '#8A6060' : KETCH); g.beginPath(); g.ellipse(q0[0], y0, a, a / 2, 0, 0, Math.PI); g.lineTo(q0[0] - b, y1); g.ellipse(q0[0], y1, b, b / 2, 0, Math.PI, 0, true); g.closePath(); g.fill(); } }, {layer: 1, zb: z0, top: z0 + h});
    if(!br) B.custom(x, y, (g, P, k) => { dome(g, P, k, x, y, z0 + h, r * 1.04, 5, '#E8ECEF'); const q = P(x, y, z0 + h + 4); g.strokeStyle = '#5AC8FF'; g.lineWidth = 2.6 * k; g.lineCap = 'round'; line(g, q, [q[0] + 4 * k, q[1] - 16 * k]); g.strokeStyle = '#FFFFFF'; g.lineWidth = 0.9 * k; line(g, [q[0] + 1 * k, q[1] - 4 * k], [q[0] + 2.6 * k, q[1] - 10 * k]); }, {layer: 2, zb: z0 + h, top: z0 + h + 20}); }
  const skin = {name: 'Picket fence', gateName: 'Donut-arch gate', h: 46, gateH: 96,
    seg(B, L, r, c, v){ const [x, y, w, d, ax] = r, len = ax === 'x' ? w : d, base = ax === 'x' ? B.box(x, 0.5 - 0.1, 0, w, 0.2, 7, KETCH) : B.box(0.5 - 0.1, y, 0, 0.2, d, 7, KETCH);
      ['front', 'right', 'left', 'back'].forEach(s => B.decal(base, s, ...F(base, s), 0, 7, KETCH, {paint: checker(7, KETCH, '#FFFFFF', Math.max(2, Math.round((s === 'front' || s === 'back' ? (ax === 'x' ? w : 0.2) : (ax === 'x' ? 0.2 : d)) * 12)), 1)}));
      const n = Math.max(1, Math.round(len / 0.12)), st = len / n;
      for(let i = 0; i < n; i++){ const p = (ax === 'x' ? x : y) + (i + 0.5) * st, hh = (c && c.broken && i % 3 === 1) ? 8 : 24; const px = ax === 'x' ? p - 0.035 : 0.5 - 0.02, py = ax === 'x' ? 0.5 - 0.02 : p - 0.035;
        B.box(px, py, 7, ax === 'x' ? 0.07 : 0.04, ax === 'x' ? 0.04 : 0.07, hh, '#FFFFFF'); if(!(c && c.broken && i % 3 === 1)) B.custom(ax === 'x' ? p : 0.5, ax === 'x' ? 0.5 : p, (g, P2, k) => { const a = P2(ax === 'x' ? p - 0.035 : 0.5, ax === 'x' ? 0.5 : p - 0.035, 7 + hh), b2 = P2(ax === 'x' ? p + 0.035 : 0.5, ax === 'x' ? 0.5 : p + 0.035, 7 + hh), m = P2(ax === 'x' ? p : 0.5, ax === 'x' ? 0.5 : p, 7 + hh + 5); g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(m[0], m[1]); g.lineTo(b2[0], b2[1]); g.closePath(); g.fill(); }, {layer: 1, zb: 7 + hh, top: 7 + hh + 5}); }
      const rail = ax === 'x' ? B.box(x, 0.5 - 0.035, 20, w, 0.07, 5, '#FFFFFF') : B.box(0.5 - 0.035, y, 20, 0.07, d, 5, '#FFFFFF'); trim(B, L, rail, 0, 2.3, longFaces(ax)); },
    post(B, L, kind, c){ cup(B, L, 0.5, 0.5, 0, 0.17, 30, c, true); },
    gate(B, L, open, c, v){ const H = 40;
      [0.13, 0.87].forEach(x => cup(B, L, x, 0.5, 0, 0.12, H, c, true));
      B.box(0.26, 0.42, 0, 0.48, 0.16, 3, '#9AA4AE');
      if(!open && !(c && c.broken)) B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 16); g.strokeStyle = '#B8C0C6'; g.lineWidth = 2.6 * k; g.lineCap = 'round'; [[0.26, 0.5], [0.74, 0.5]].forEach(([x, y]) => line(g, q, P(x, y, 16))); line(g, q, P(0.5, 0.78, 13)); line(g, q, P(0.5, 0.22, 19)); g.fillStyle = '#8E98A3'; g.beginPath(); g.arc(q[0], q[1], 3 * k, 0, TAU); g.fill(); line(g, P(0.5, 0.5, 0), q); }, {layer: 2, zb: 0, top: 22});
      if(open && !(c && c.broken)) B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 16); g.strokeStyle = '#B8C0C6'; g.lineWidth = 2.6 * k; g.lineCap = 'round'; line(g, q, P(0.3, 0.3, 16)); line(g, q, P(0.7, 0.3, 16)); line(g, P(0.5, 0.5, 0), q); g.fillStyle = '#8E98A3'; g.beginPath(); g.arc(q[0], q[1], 3 * k, 0, TAU); g.fill(); }, {layer: 2, zb: 0, top: 22});
      if(!(c && c.broken)) B.custom(0.5, 0.5, (g, P, k, t, T2) => { const a = P(0.13, 0.5, H + 2), b2 = P(0.87, 0.5, H + 2), m = [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2 - 26 * k];   // 🍩 the donut arch over the gate
        g.strokeStyle = MUST; g.lineWidth = 3 * k; g.lineCap = 'round'; line(g, a, [m[0] - 10 * k, m[1] + 8 * k]); line(g, b2, [m[0] + 10 * k, m[1] + 8 * k]); donut(g, m[0], m[1], 15 * k, c, {seed: 11, n: 12, flat: 0.95});
        const col = teamOf(L); g.fillStyle = col; g.beginPath(); g.arc(m[0], m[1] - 1 * k, 5 * k, 0, TAU); g.fill(); forkKnife(g, m[0], m[1] - 1 * k, 3.4 * k, inkOf(col)); }, {layer: 3, zb: H, top: H + 46}); } };
  wallProp('horde', 'horde', skin); gateProp('horde', 'horde', skin);
  const tall = {name: 'Crate rampart', gateName: 'Burger gatehouse', base: 30, h: 118, gateH: 124,
    rampart(B, L, r, c, hb){ const [x, y, w, d, ax] = r, e = 0.08, b = ax === 'x' ? B.box(x, y - e, 0, w, d + 2 * e, hb, '#C99257') : B.box(x - e, y, 0, w + 2 * e, d, hb, '#C99257');
      ['front', 'right', 'left', 'back'].forEach((s, i) => B.decal(b, s, ...F(b, s), 0, hb, '#C99257', {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 1 * k; for(let z = 0; z < hb; z += 15) line(g, Q(0, z), Q(1, z)); const n = Math.max(1, Math.round((s === 'front' || s === 'back' ? w : d) * 3));
        for(let u = 0; u < n; u++) for(let z = 0; z < hb - 1; z += 15){ const u0 = u / n, u1 = (u + 1) / n; line(g, Q(u0, z), Q(u0, z + 15)); g.strokeStyle = 'rgba(42,28,20,0.22)'; line(g, Q(u0 + 0.02, z + 1), Q(u1 - 0.02, z + 14)); g.strokeStyle = 'rgba(42,28,20,0.4)';
          const p = Q((u0 + u1) / 2, z + 7.5), col = [KETCH, LETTUCE, MUST, '#FF8A2E'][(u + z / 15 + i) % 4 | 0]; g.fillStyle = c && c.broken ? '#8A7A6A' : col; g.beginPath(); g.arc(p[0], p[1], 2.2 * k, 0, TAU); g.fill(); } }})); },
    tower(B, L, c, cx, cy, hb, kind, hw){ const br = c && c.broken, bb = B.box(cx - hw, cy - hw, 0, 2 * hw, 2 * hw, hb, '#B8834A'); ['front', 'right', 'left', 'back'].forEach(s => B.decal(bb, s, ...F(bb, s), 0, hb, '#B8834A', {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 1 * k; for(let z = 0; z < hb; z += 15) line(g, Q(0, z), Q(1, z)); line(g, Q(0.05, 2), Q(0.95, 13)); }}));
      cup(B, L, cx, cy, hb, hw * 1.0, br ? 22 : (kind === 'gate' ? 40 : 54), c, true);
      if(!br) pennant(B, L, cx, cy, hb + (kind === 'gate' ? 60 : 74), kind === 'gate' ? 10 : 14, {w: 11, hh: 7, emblem: forkKnife}); },
    gatehouse(B, L, open, c, hb){ const br = c && c.broken, z0 = 44, t = 0.18;
      gateDoors(B, open, c, 40, '#B8C0C6', '#6A7480', {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.9 * k; for(let z = 3; z < 38; z += 3.2) line(g, Q(0.04, z), Q(0.96, z)); }});
      const b = B.box(0.26, 0.5 - t, z0, 0.48, 2 * t, br ? 6 : 12, '#C99257'); if(br) return; trim(B, L, b, 4, 3, ['front', 'back']);
      B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, z0 + 12); burger(g, q[0], q[1] - 13 * k, 14 * k, c); }, {layer: 3, zb: z0 + 12, top: z0 + 40}); } };
  tallWallProp('horde', 'horde', skin, tall); tallGateProp('horde', 'horde', skin, tall);
})();
/* ---------- 🏺 ORIGIN RELIC (ip-4g, 🌳 IsoProps chat 2026-11-20, Aowu "go" on the 10 names) — 🍽️ The Bottomless Plate:
   a giant golden plate on a round picnic table with a gingham cloth, a giant fork + knife crossed behind it like a crest, and a silver cloche that LIFTS
   by itself — under it the plate is always full again (burger · fries · a donut), steam puffs out. 2 × 2 landmark, states home · taken (the table, the cloth
   and the crossed fork + knife stay; the plate's outline + crumbs + a folded napkin + a waiting twinkle). Props.AR.ORIGIN.horde.icon = the carried form. ---------- */
(function(){ const dead = c => !!(c && c.broken), still = c => !!(c && c.still), dim = (c, col, f) => c ? (c.broken ? D.sh(col, -0.42) : D.sh(col, f == null ? -0.18 : f)) : col,
    tw = (t, i) => 0.55 + 0.3 * Math.sin(ph(t, 2.4) + i * 1.7) + 0.15 * Math.cos(ph(t, 2.4) + i * 0.9);
  // a team-colour band round a drum (patterned like every team trim)
  function band(B, L, c, x, y, z, r, h){ B.custom(x, y, (g, P, k) => { const r2 = P(x, y, z + h), rx = r * HTW * k * S2, col = dead(c) ? '#8A8090' : teamOf(L);
    g.fillStyle = col; g.beginPath(); g.ellipse(r2[0], r2[1] + h * k, rx, rx / 2, 0, 0, Math.PI); g.lineTo(r2[0] - rx, r2[1]); g.ellipse(r2[0], r2[1], rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill();
    if(!dead(c)) K.AR.patPaint(g, (s, vv) => { const u = -1 + s / (rx * 2 / k) * 2; return [r2[0] + u * rx, r2[1] + h * k + Math.sqrt(Math.max(0, 1 - u * u)) * rx / 2 - vv * k]; }, rx * 2 / k, h, patOf(L), inkOf(col), k); }, {layer: 1, zb: z, top: z + h}); }
  // 🍴 a giant upright fork / knife (silver), stuck into the table
  function cutlery(g, x, y, s, ang, kind, c){ const st = dim(c, '#E6EAF0'), sd = dim(c, STEELD); g.save(); g.translate(x, y); g.rotate(ang);
    g.fillStyle = sd; g.beginPath(); D.rr(g, -2.6 * s, -30 * s, 5.2 * s, 30 * s, 2.4 * s); g.fill(); g.fillStyle = st; g.beginPath(); D.rr(g, -2 * s, -30 * s, 4 * s, 29 * s, 2 * s); g.fill();
    if(kind === 'fork'){ g.fillStyle = st; g.beginPath(); g.moveTo(-6 * s, -34 * s); g.quadraticCurveTo(0, -26 * s, 6 * s, -34 * s); g.lineTo(6 * s, -44 * s); g.lineTo(-6 * s, -44 * s); g.closePath(); g.fill();
      [-4.4, -1.4, 1.4, 4.4].forEach(dx => { g.beginPath(); D.rr(g, dx * s - 1 * s, -62 * s, 2 * s, 20 * s, 1 * s); g.fill(); }); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(-1 * s, -28 * s, 1 * s, 24 * s); }
    else { g.fillStyle = st; g.beginPath(); g.moveTo(-3 * s, -30 * s); g.lineTo(-3 * s, -62 * s); g.quadraticCurveTo(6 * s, -58 * s, 4.4 * s, -30 * s); g.closePath(); g.fill(); g.strokeStyle = sd; g.lineWidth = 0.8 * s; g.beginPath(); g.moveTo(-1 * s, -34 * s); g.lineTo(-1 * s, -58 * s); g.stroke(); }
    g.restore(); }
  // 🍽️ the plate + what is on it + the cloche: x, y = the plate's middle. o.lift = cloche lift px (0 = shut) · o.tilt · o.full = food shows
  function plate(g, x, y, s, c, o){ o = o || {}; const gold = dim(c, '#F2C23A'), gd = D.sh(gold, -0.3), rx = 30 * s, ry = 13 * s;
    g.fillStyle = gd; g.beginPath(); D.ell(g, x, y + 2.4 * s, rx, ry); g.fill(); g.fillStyle = D.lin(g, x - rx, y, x + rx, y, [[0, D.sh(gold, 0.3)], [0.5, gold], [1, gd]]); g.beginPath(); D.ell(g, x, y, rx, ry); g.fill();
    g.fillStyle = dim(c, CREAM); g.beginPath(); D.ell(g, x, y + 0.6 * s, rx * 0.72, ry * 0.7); g.fill(); g.strokeStyle = dim(c, KETCH); g.lineWidth = 1.2 * s; g.setLineDash([2 * s, 2 * s]); g.beginPath(); g.ellipse(x, y + 0.6 * s, rx * 0.86, ry * 0.84, 0, 0, TAU); g.stroke(); g.setLineDash([]);
    if(o.full !== false){ friesIcon(g, x - 13 * s, y - 2 * s, 7 * s, c); donut(g, x + 14 * s, y + 1 * s, 6.4 * s, c, {flat: 0.55}); burger(g, x, y - 4 * s, 11 * s, c); }
    if(o.lift == null) return; const L2 = o.lift * s, cx = x, cy = y - L2, sil = dim(c, '#DDE3EA'), sd = dim(c, STEELD);
    g.save(); g.translate(cx, cy); g.rotate(o.tilt || 0);
    g.fillStyle = D.lin(g, -rx * 0.78, 0, rx * 0.78, 0, [[0, '#FFFFFF'], [0.35, sil], [1, sd]]); g.beginPath(); g.moveTo(-rx * 0.8, 0); g.bezierCurveTo(-rx * 0.8, -ry * 3, rx * 0.8, -ry * 3, rx * 0.8, 0); g.closePath(); g.fill();
    g.fillStyle = sd; g.beginPath(); D.ell(g, 0, 0, rx * 0.82, 2.6 * s); g.fill(); g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(-rx * 0.34, -ry * 1.4, 3 * s, 7 * s, 0.5, 0, TAU); g.fill();
    g.fillStyle = dim(c, '#F2C23A'); g.beginPath(); D.ell(g, 0, -ry * 2.26, 4.4 * s, 2.6 * s); g.fill(); g.beginPath(); g.arc(0, -ry * 2.5, 3 * s, 0, TAU); g.fill(); g.restore(); }
  const def = add('horde', 'horde_relic', {name: 'The Bottomless Plate', look: 'horde', side: 'horde', slot: 'origin', kind: 'landmark', foot: [2, 2], door: null, h: 132, variants: 1, block: true,
    states: ['home', 'taken'], state: 'home', tags: ['ar', 'ar-origin', 'ar-horde', 'relic', 'origin'], live: {period: 2.4, frames: 6},
    diffs: [{by: 'state', a: 'home', b: 'taken', level: 'bold', name: 'the Bottomless Plate carried off (crumbs + a napkin left)'}]});
  def.build = (B, v, L) => { const c = L.cond, br = dead(c), home = (L.state || 'home') === 'home' && !br, H = br ? 12 : 30; K.AR.kerb(B, L, 2, 2);
    B.flat(0.06, 0.06, 1.88, 1.88, '#F2E2C8');
    B.drum(1, 1, 0, 0.18, H, WOODD); B.drum(1, 1, 0, 0.36, 3, WOODD);   // 🪵 the round picnic table: a stout leg + a big round top with a gingham cloth that drapes over the edge
    B.drum(1, 1, H - 5, 0.7, 5, WOOD, {rings: 0}); band(B, L, c, 1, 1, H - 9, 0.2, 4);
    B.custom(1, 1, (g, P, k) => { const q = P(1, 1, H), rx = 0.74 * HTW * k * S2, ry = rx / 2, cl = br ? '#9A7A70' : KETCH, drop = 7 * k;
      g.save(); g.beginPath(); g.ellipse(q[0], q[1], rx, ry, 0, 0, TAU); g.moveTo(q[0] - rx, q[1]); for(let i = 0; i <= 16; i++){ const u = -1 + i / 8, yy = q[1] + Math.sqrt(Math.max(0, 1 - u * u)) * ry + drop + (i % 2 ? 2 * k : 0); g.lineTo(q[0] + u * rx, yy); } g.lineTo(q[0] + rx, q[1]); g.closePath();
      g.fillStyle = '#FFFFFF'; g.fill(); g.clip(); const n = 12; for(let i = -n; i < n; i++) for(let j = -n; j < n; j++){ if((i + j) % 2 === 0) continue; const x0 = q[0] + (i - j) * rx / 6, y0 = q[1] + (i + j) * ry / 6; g.fillStyle = D.rgba(cl, (i % 2 === 0) ? 0.85 : 0.4); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + rx / 6, y0 + ry / 6); g.lineTo(x0, y0 + ry / 3); g.lineTo(x0 - rx / 6, y0 + ry / 6); g.closePath(); g.fill(); } g.restore(); }, {layer: 2, zb: H, top: H + 1});
    if(!br) B.custom(1, 1, (g, P, k) => { const q = P(1.2, 0.8, H); cutlery(g, q[0] - 9 * k, q[1] + 2 * k, k * 1.2, -0.42, 'fork', c); cutlery(g, q[0] + 9 * k, q[1] + 2 * k, k * 1.2, 0.42, 'knife', c); }, {layer: 3, zb: H, top: H + 66});   // 🍴 the crossed crest
    if(home){ halo(B, 1, 1, H + 26, 44, '#FFE6B0', 0.28, {pulse: t => still(c) ? 1 : 0.9 + Math.sin(ph(t, 2.4)) * 0.07 + Math.cos(ph(t, 2.4)) * 0.03});
      B.custom(1, 1, (g, P, k, t) => { const q = P(1, 1, H + 2), th = ph(t, 2.4), up = still(c) ? 0.25 : Math.max(0, Math.sin(th)), lift = 6 + up * 30;   // 🍽️ the cloche lifts: always full again underneath
        plate(g, q[0], q[1], k * 1.15, c, {lift, tilt: still(c) ? -0.1 : -0.06 - up * 0.22 + Math.cos(th) * 0.03}); }, {layer: 6, zb: H + 2, top: 130});
      B.custom(1, 1, (g, P, k, t) => { if(still(c)) return; const q = P(1, 1, H + 2), th = ph(t, 2.4), up = Math.max(0, Math.sin(th));
        for(let i = 0; i < 3; i++){ const r = (3 + i * 1.4 + up * 2) * k, yy = q[1] - (10 + i * 8 + up * 10) * k; g.fillStyle = 'rgba(255,255,255,' + (0.85 - i * 0.2) * (0.4 + up * 0.6) + ')'; g.beginPath(); g.arc(q[0] - 6 * k + Math.sin(th + i) * 4 * k, yy, r, 0, TAU); g.arc(q[0] - 6 * k + Math.sin(th + i) * 4 * k + r * 0.8, yy + r * 0.3, r * 0.7, 0, TAU); g.fill(); }
        [[-40, -20], [38, -34], [-24, -60]].forEach(([dx, dy], i) => { g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); D.star(g, q[0] + dx * k, q[1] + dy * k, (2.4 + tw(t, i) * 1.6) * k, 0.9 * k, 4); g.fill(); }); }, {layer: 7, zb: H + 2, top: 128, fx: true});
    } else if(!br) B.custom(1, 1, (g, P, k, t) => { const q = P(1, 1, H + 1); g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 1.6 * k; g.setLineDash([3 * k, 2.4 * k]); g.beginPath(); D.ell(g, q[0], q[1], 34 * k, 15 * k); g.stroke(); g.setLineDash([]);   // taken: plate outline + crumbs + a napkin
      g.fillStyle = '#D99A4A'; [[-8, 2], [-3, -3], [5, 3], [10, -1], [1, 5]].forEach(([dx, dy]) => { g.beginPath(); g.arc(q[0] + dx * k, q[1] + dy * k, 1.2 * k, 0, TAU); g.fill(); });
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(q[0] + 14 * k, q[1] + 2 * k); g.lineTo(q[0] + 24 * k, q[1] - 2 * k); g.lineTo(q[0] + 22 * k, q[1] + 6 * k); g.closePath(); g.fill(); g.fillStyle = teamOf(L); g.beginPath(); g.moveTo(q[0] + 14 * k, q[1] + 2 * k); g.lineTo(q[0] + 22 * k, q[1] + 6 * k); g.lineTo(q[0] + 16 * k, q[1] + 7 * k); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,240,190,0.95)'; g.beginPath(); D.star(g, q[0] - 4 * k, q[1] - 14 * k, (2.4 + tw(t, 1)) * k, 0.9 * k, 4); g.fill(); }, {layer: 6, zb: H + 1, top: H + 20});
    [[0.2, 1.8], [1.8, 0.2]].forEach(([x, y]) => pennant(B, L, x, y, 0, 46, {emblem: forkKnife, pole: WOODD})); };
  const AR = Props.AR; AR.ORIGIN = AR.ORIGIN || {}; AR.ORIGIN.horde = {key: 'horde_relic', name: 'The Bottomless Plate', icon: (g, x, y, k, lit) => plate(g, x, y + 6 * k, k * 0.5, lit === false ? {} : null, {lift: 16, tilt: -0.3})};
})();
/* 🏺 end ip-4g relic */
})();
K.loaded('horde', 'ip-4g');
})(window.Props && window.Props._K);
