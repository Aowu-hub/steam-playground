
/* 🌍 IsoLook_kitchen — 🍳 Kitchen Crew — AvataRealm side ①a on 🌸 cherry: 11 buildings · own floor · own resource shapes (egg basket · spice sacks · golden truffles) · own walls (needs realm) — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['kitchen'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/kitchen.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_kitchen: include IsoProps first'); return; }
if(!K.AR){ console.warn('IsoLook_kitchen: load IsoLook_realm first (Props.need does it)'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🍳 kitchen · Kitchen Crew (AvataRealm side ①a, ip-4b pictures, 🌳 IsoProps chat 2026-11-18).
   Built ON 🌸 cherry (its blossom trees, ground, 🍂 versions — a Japanese-street kitchen town: noren curtains, paper lanterns, dark curved roofs)
   + 🏰 realm (team colours · 🏗️ site steps · slots · walls). 11 buildings = AvataRealm §14a:
   🏠 food cart → diner → Grand Restaurant (chef-hat dome) · 🏕️ Prep Kitchen · 🎠 Scooter Garage · 🪽 Crêpe-pan Launchpad · 🩹 Soup Kitchen · 🔧 Oven Works ·
   🗼 Pepper-mill Tower · 🎨 Apron Closet · 🔮 Recipe Library · 🕵️ Pantry Cellar · 🐾 Herb-garden Coop.
   Own resource shapes (Aowu 2026-11-18): 🥚 kitchen_coin = egg basket · 🧂 kitchen_brick = spice sacks · 🍄 kitchen_gem = golden truffle patch.
   Own floor (checker tiles + flour + spice jars) and own walls (🔲 tiled counter wall · 🧂 salt-shaker towers · 🚪 swing-door noren gate). Keys kitchen_<slot>. */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, halo} = T;
const {pennant, banner, trim, building, addSide, addFloor, tileBase, hash, teamOf, patOf, inkOf, awning, tiles, checker, tent, quadStripes} = K.AR;
const D = PD, M = MAT, TAU = Math.PI * 2, S2 = Math.SQRT2;
const TILE = '#FFF7EE', TILE2 = '#F3E7D8', TOMATO = '#D8452E', NAVY = '#33405E', NAVY2 = '#232D46', COPPER = '#D98A4A', COPPERD = '#A85F2C', STEEL = '#C3CAD2', STEELD = '#8E98A3',
  WOOD = '#C99257', WOODD = '#8A5A34', CREAM = '#FFF1D2', BRICK = '#C9673E', BRICKD = '#97432A', CRUST = '#E8B46A', HERB = '#5DBB46', HERB2 = '#3C9440', ROOF = '#3E4A6B', GOLD = '#F2B731', EGGW = '#FBF3E2', BLOS = '#FFB7CB';
// 👨‍🍳 the side's emblem: a puffy chef's toque
function toque(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); D.rr(g, x - r * 0.52, y + r * 0.02, r * 1.04, r * 0.5, r * 0.08); g.fill();
  [[-0.46, -0.22, 0.4], [0.46, -0.22, 0.4], [0, -0.42, 0.5], [-0.2, -0.12, 0.38], [0.22, -0.12, 0.38]].forEach(([dx, dy, rr]) => { g.beginPath(); g.arc(x + dx * r, y + dy * r, rr * r, 0, TAU); g.fill(); }); }
addSide('kitchen', {name: 'Kitchen Crew', icon: '🍳', look: 'kitchen', accent: TOMATO, emblem: toque, base: 'cherry'});
addLook('kitchen', {name: 'Kitchen Crew', walls: [TILE, '#F7E1D3', CREAM], roofs: [ROOF, '#B5172A', '#5A6E8C'], trim: '#3B2A2A', accent: TOMATO, stilts: false, curve: true, team: null, side: 'kitchen',
  res: {coin: '#F7EBD3', coinDk: '#C9A672', rock: '#C08A50', brick: '#E2553A', brickDk: '#9A3A20', leaf: '#5DBB46', bark: '#8A5A34', gem: '#F2C23A', gemDk: '#8A5A20', gemHi: '#FFF4C2'}}, 'cherry');
/* ---------- 🖌️ kitchen painters ---------- */
// a circle standing on a front (+y) face: wheel / plate / port — R in px
const ringOnFront = (P, cx, y, zc, R, n) => { const pts = []; for(let i = 0; i < (n || 18); i++){ const a = i / (n || 18) * TAU; pts.push(P(cx + Math.cos(a) * R / 35.8, y, zc + Math.sin(a) * R)); } return pts; };
const ringOnRight = (P, x, cy, zc, R, n) => { const pts = []; for(let i = 0; i < (n || 18); i++){ const a = i / (n || 18) * TAU; pts.push(P(x, cy - Math.cos(a) * R / 35.8, zc + Math.sin(a) * R)); } return pts; };
// 🏮 a red paper lantern (screen space)
function lantern(g, x, y, r, k, c, col){ const lv = lightOf(c), body = c && c.broken ? '#7A5A50' : (col || '#E2483A');
  g.strokeStyle = '#2A1C14'; g.lineWidth = 1 * k; line(g, [x, y - r * 1.5], [x, y - r * 1.05]);
  g.fillStyle = D.rad(g, x - r * 0.3, y - r * 0.3, 0.5, r * 1.4, [[0, lv ? '#FFD9A0' : D.sh(body, 0.2)], [0.55, body], [1, D.sh(body, -0.3)]]); g.beginPath(); D.ell(g, x, y, r * 0.8, r); g.fill();
  g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 0.8 * k; [-0.5, 0, 0.5].forEach(f => { g.beginPath(); D.ell(g, x, y, r * 0.8 * Math.cos(f), r, 0); g.stroke(); });
  g.fillStyle = '#2A1C14'; g.fillRect(x - r * 0.45, y - r * 1.08, r * 0.9, r * 0.22); g.fillRect(x - r * 0.45, y + r * 0.86, r * 0.9, r * 0.22);
  g.strokeStyle = GOLD; g.lineWidth = 0.9 * k; line(g, [x, y + r * 1.08], [x, y + r * 1.45]); }
// ♨️ steam puffs rising from a point (live phase uses sin + cos)
function steam(g, x, y, k, t, n, c){ if(c && (c.broken || c.still)) return; const s = Math.sin(ph(t, 2.4)), cc = Math.cos(ph(t, 2.4));
  for(let i = 0; i < (n || 3); i++){ const f = i / (n || 3), yy = y - (8 + i * 9 + (s + 1) * 2) * k, xx = x + (Math.sin(i * 2.1 + s) * 4 + cc * 1.5) * k, r = (3.4 + i * 1.6) * k;
    g.fillStyle = 'rgba(255,255,255,' + (0.85 - f * 0.4) + ')'; g.beginPath(); g.arc(xx, yy, r, 0, TAU); g.arc(xx + r * 0.8, yy + r * 0.3, r * 0.7, 0, TAU); g.fill(); } }
// 🎌 a noren curtain on a front (+y) face: hangs from z1 down h px, `n` panels with slits, the toque in white on the middle panel
function noren(B, L, x0, x1, y, z1, h, col, n){ B.custom((x0 + x1) / 2, y + 0.02, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const c = L.cond, br = c && c.broken, cl = br ? D.sh(col, -0.35) : col, N = n || 3;
    for(let i = 0; i < N; i++){ const u0 = x0 + (x1 - x0) * (i / N + 0.012), u1 = x0 + (x1 - x0) * ((i + 1) / N - 0.012), bot = br && i === 1 ? h * 0.55 : h;
      polyP(g, [P(u0, y, z1), P(u1, y, z1), P(u1, y, z1 - bot), P(u0, y, z1 - bot)]); g.fillStyle = D.sh(cl, i % 2 ? -0.05 : 0.04); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.8 * k; g.stroke(); }
    const a = P(x0 - 0.04, y, z1 + 1.5), b2 = P(x1 + 0.04, y, z1 + 1.5); g.strokeStyle = WOODD; g.lineWidth = 2.2 * k; g.lineCap = 'round'; line(g, a, b2);
    if(!br){ const m = P((x0 + x1) / 2, y, z1 - h * 0.48); toque(g, m[0], m[1], Math.min(7, h * 0.24) * k, '#FFFFFF'); } }, {layer: 2, zb: z1 - h, top: z1 + 2}); }
// 🍳 a frying pan with an egg (screen space) — the side's sign picture (no words)
function panIcon(g, x, y, r, k, c){ g.strokeStyle = '#2A2A30'; g.lineWidth = r * 0.32; g.lineCap = 'round'; line(g, [x + r * 0.7, y + r * 0.3], [x + r * 1.7, y + r * 0.85]);
  g.fillStyle = '#34343C'; g.beginPath(); D.ell(g, x, y, r, r * 0.86); g.fill(); g.fillStyle = '#55555F'; g.beginPath(); D.ell(g, x - r * 0.1, y - r * 0.08, r * 0.78, r * 0.66); g.fill();
  g.fillStyle = c && c.broken ? '#D8D0C0' : '#FFFFFF'; g.beginPath(); g.moveTo(x - r * 0.5, y); g.bezierCurveTo(x - r * 0.6, y - r * 0.5, x + r * 0.1, y - r * 0.62, x + r * 0.4, y - r * 0.2); g.bezierCurveTo(x + r * 0.62, y + r * 0.2, x - r * 0.1, y + r * 0.42, x - r * 0.5, y); g.fill();
  g.fillStyle = c && c.broken ? '#C8A050' : '#FFC21A'; g.beginPath(); g.arc(x - r * 0.04, y - r * 0.08, r * 0.24, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(x - r * 0.12, y - r * 0.16, r * 0.07, 0, TAU); g.fill(); }
// 🥚 an egg (screen space)
function egg(g, x, y, r, c, o){ o = o || {}; const col = c && c.broken ? '#D6CCB8' : (o.col || EGGW); g.fillStyle = D.rad(g, x - r * 0.35, y - r * 0.6, 0.5, r * 1.7, [[0, '#FFFFFF'], [0.5, col], [1, D.sh(col, -0.22)]]);
  g.beginPath(); g.moveTo(x, y - r * 1.25); g.bezierCurveTo(x + r * 0.92, y - r * 1.25, x + r, y + r * 0.6, x, y + r * 0.62); g.bezierCurveTo(x - r, y + r * 0.6, x - r * 0.92, y - r * 1.25, x, y - r * 1.25); g.fill(); }
// 🌿 a herb tuft (screen space)
function tuft(g, x, y, k, s, c, col){ const cl = c ? (c.broken ? '#8A7A5A' : '#9AA05A') : (col || HERB); for(let i = 0; i < 6; i++){ const a = -1.2 + i * 0.48, L = (8 + (i % 3) * 3) * s;
  g.fillStyle = i % 2 ? cl : D.sh(cl, -0.18); g.beginPath(); D.ell(g, x + Math.sin(a) * L * 0.5 * k, y - Math.cos(a) * L * 0.5 * k, 2.4 * s * k, L * 0.55 * k, a); g.fill(); } }
const KR = (slot, o, build) => building('kitchen', slot, o, build);
// tiled white wall box: tiles on the seen faces + a checker skirt + optional team trim
function tiled(B, x, y, z, w, d, h, col, seed, o){ o = o || {}; const b = B.box(x, y, z, w, d, h, col, o.box);
  ['front', 'right', 'left', 'back'].forEach((s, i) => { const len = s === 'front' || s === 'back' ? w : d; B.decal(b, s, ...F(b, s), 0, h, col, {paint: tiles(h, col, Math.max(3, Math.round(len * 7)), 6, {seed: (seed || 3) + i, dot: o.dot, p: 0.08})});
    if(o.skirt !== false) B.decal(b, s, ...F(b, s), 0, 6, TOMATO, {paint: checker(6, TOMATO, '#FFFFFF', Math.max(4, Math.round(len * 10)), 1)}); });
  return b; }
/* ============================ 🏠 HOUSE — 3 levels, each a new SHAPE ============================ */
KR('house', {name: 'Grand Restaurant', h: 138, names: {'1': 'Food Cart', '2': 'Diner', '3': 'Grand Restaurant'}}, (B, v, L) => { const c = L.cond, lv = L.state || '1';
  if(lv === '1'){ // 🛒 a yatai food cart: wheels, a counter with a steaming pot, a little curved roof on 4 posts, a noren, a red lantern, 2 stools + a crate stack
    B.flat(0.12, 0.12, 2.76, 1.76, '#E9D9B8');
    const cart = B.box(0.7, 0.66, 8, 1.6, 0.62, 22, WOOD); B.decal(cart, 'front', ...F(cart, 'front'), 0, 22, WOOD, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.28)'; g.lineWidth = 0.9 * k; for(let z = 5; z < 22; z += 5) line(g, Q(0, z), Q(1, z)); }});
    B.decal(cart, 'right', ...F(cart, 'right'), 0, 22, WOOD, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.28)'; g.lineWidth = 0.9 * k; for(let z = 5; z < 22; z += 5) line(g, Q(0, z), Q(1, z)); }});
    B.box(0.66, 0.62, 30, 1.68, 0.7, 3, STEEL);
    B.custom(1.5, 1.3, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; [0.95, 2.05].forEach(x => { const pts = ringOnFront(P, x, 1.3, 9, 9); polyP(g, pts); g.fillStyle = '#3A2A20'; g.fill(); const p2 = ringOnFront(P, x, 1.3, 9, 6.5); polyP(g, p2); g.fillStyle = WOODD; g.fill();
      const m = P(x, 1.3, 9); g.strokeStyle = '#3A2A20'; g.lineWidth = 1.1 * k; for(let i = 0; i < 6; i++){ const a = i / 6 * TAU; line(g, m, P(x + Math.cos(a) * 6.5 / 35.8, 1.3, 9 + Math.sin(a) * 6.5)); } }); }, {layer: 1, zb: 0, top: 18});
    [[0.74, 0.7], [2.24, 0.7], [0.74, 1.22], [2.24, 1.22]].forEach(p => B.box(p[0], p[1], 33, 0.06, 0.06, 26, WOODD));
    const rf = B.roof(0.6, 0.56, 59, 1.8, 0.86, 13, ROOF, {ridge: 'x', ov: 0.14, finials: true});
    noren(B, L, 0.78, 2.22, 1.29, 58, 13, NAVY, 4);
    trim(B, L, cart, 14, 3, ['front', 'right']);
    B.drum(1.15, 0.92, 33, 0.2, 10, STEEL, {rings: 2}); B.drum(1.15, 0.92, 43, 0.22, 1.5, STEELD);
    B.custom(1.15, 0.92, (g, P, k, t) => { const q = P(1.15, 0.92, 45); steam(g, q[0], q[1], k, t, 3, c); }, {layer: 3, zb: 45, top: 72, fx: true});
    B.box(1.62, 0.78, 33, 0.42, 0.32, 3, '#E2B07A'); B.custom(1.83, 0.94, (g, P, k) => { const q = P(1.83, 0.94, 36); [[-7, 0], [-2, -2], [3, 0], [8, -2]].forEach(([dx, dy], i) => { g.fillStyle = i % 2 ? '#FFFFFF' : '#F4C38A'; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, 3 * k, 2.2 * k); g.fill(); }); }, {layer: 2, zb: 36, top: 40});
    B.custom(2.26, 1.24, (g, P, k) => { const q = P(2.26, 1.24, 50); lantern(g, q[0], q[1], 6 * k, k, c); }, {layer: 4, zb: 40, top: 58});
    [[1.15, 1.66], [1.85, 1.66]].forEach(([x, y]) => { B.drum(x, y, 0, 0.05, 12, WOODD); B.drum(x, y, 12, 0.15, 3, TOMATO); });
    [[2.4, 0.2, 0], [2.4, 0.2, 9], [2.62, 0.5, 0]].forEach(([x, y, z]) => { const b = B.box(x, y, z, 0.34, 0.3, 9, '#D9A86A'); B.decal(b, 'front', ...F(b, 'front'), 2, 5, '#B5172A'); });
    pennant(B, L, 0.3, 0.3, 0, 46, {emblem: toque, pole: WOODD});
    return; }
  if(lv === '2'){ // 🍽️ diner: a tiled box, big front windows under a tomato awning, a swing door + noren, a flat roof with a vent + a pan-and-egg sign
    const w = tiled(B, 0.14, 0.2, 0, 2.72, 1.6, 40, TILE, 11);
    B.win(w, 'front', 0.32, 0.78, 12, 16, {fill: '#BFE8F2'}); B.win(w, 'front', 1.9, 0.78, 12, 16, {fill: '#BFE8F2'}); B.win(w, 'right', 0.5, 0.7, 12, 16, {fill: '#BFE8F2'});
    B.door(w, 'front', 1.3, 0.4, 28, {fill: '#7A4A24'}); noren(B, L, 1.24, 1.76, 1.81, 31, 9, NAVY, 2);
    awning(B, 'front', 1.8, 0.24, 1.2, 33, 0.22, 7, TOMATO, '#FFFFFF', 6, {cond: c}); awning(B, 'front', 1.8, 1.8, 2.76, 33, 0.22, 7, TOMATO, '#FFFFFF', 6, {cond: c});
    trim(B, L, w, 36, 3.4);
    B.box(0.1, 0.16, 40, 2.8, 1.68, 4, TILE2); B.drum(2.4, 0.5, 44, 0.13, 16, STEEL, {rings: 3}); B.cone(2.4, 0.5, 60, 0.2, 6, STEELD);
    B.custom(2.4, 0.5, (g, P, k, t) => { const q = P(2.4, 0.5, 64); steam(g, q[0], q[1], k, t, 2, c); }, {layer: 3, zb: 64, top: 84, fx: true});
    B.box(0.9, 0.9, 44, 0.06, 0.06, 18, STEELD); B.box(1.9, 0.9, 44, 0.06, 0.06, 18, STEELD);
    B.custom(1.4, 0.93, (g, P, k, t, T2) => { const a = P(0.86, 0.93, 62), b2 = P(1.98, 0.93, 62), d2 = P(1.98, 0.93, 80), e = P(0.86, 0.93, 80);   // 🪧 roof sign: a cream board with the pan + egg (drawn, no words)
      polyP(g, [a, b2, d2, e]); g.fillStyle = c && c.broken ? '#BDB4A2' : CREAM; g.fill(); g.strokeStyle = TOMATO; g.lineWidth = 2.2 * k; g.stroke();
      const m = P(1.32, 0.93, 71); panIcon(g, m[0], m[1], 6.4 * k, k, c); const q = P(1.78, 0.93, 71); egg(g, q[0], q[1] + 2 * k, 4.4 * k, c); }, {layer: 3, zb: 62, top: 82});
    banner(B, L, w, 'right', 1.35, 0.3, 8, 22, toque);
    pennant(B, L, 0.3, 0.36, 44, 20, {emblem: toque, pole: STEELD});
    B.custom(0.2, 1.95, (g, P, k) => { const q = P(0.22, 1.9, 0); [[0, 0], [9, 3]].forEach(([dx, dy], i) => { g.fillStyle = i ? '#D9A86A' : '#7FB24A'; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k - 4 * k, 4.5 * k, 4 * k); g.fill(); }); }, {layer: 3, zb: 0, top: 10});
    return; }
  // 🏛️ L3 Grand Restaurant: a tiled hall with 4 white columns + a portico, a big noren door, arched glowing windows, and a GIANT pleated chef-hat dome on top
  const w = tiled(B, 0.1, 0.12, 0, 2.8, 1.5, 36, TILE, 21, {dot: '#F6C9A8'});
  B.door(w, 'front', 1.22, 0.56, 30, {fill: '#6A3A1C'}); noren(B, L, 1.16, 1.84, 1.63, 33, 12, NAVY, 3);
  [0.3, 0.72, 2.08, 2.5].forEach(a => B.win(w, 'front', a, 0.24, 12, 17, {fill: lightOf(c) ? '#FFE3A0' : '#7A7068'})); [0.3, 0.8].forEach(a => B.win(w, 'right', a, 0.28, 12, 17, {fill: lightOf(c) ? '#FFE3A0' : '#7A7068'}));
  trim(B, L, w, 30, 4);
  B.box(0.06, 1.62, 36, 2.88, 0.34, 5, TILE2, {layer: 1});
  [0.22, 0.86, 2.14, 2.78].forEach(x => B.drum(x, 1.82, 0, 0.08, 36, '#FFFFFF', {rings: 0, layer: 1}));
  B.custom(1.5, 1.95, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const a = P(0.12, 1.96, 41), b2 = P(2.88, 1.96, 41), m = P(1.5, 1.96, 52);   // the portico pediment: a cream triangle with the toque
    g.fillStyle = c && c.broken ? '#C8BEA8' : CREAM; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(m[0], m[1]); g.lineTo(b2[0], b2[1]); g.closePath(); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 1 * k; g.stroke();
    const q = P(1.5, 1.96, 44.5); toque(g, q[0], q[1], 4.2 * k, c && c.broken ? '#8A8070' : teamOf(L)); }, {layer: 2, zb: 41, top: 52});
  B.box(0.1, 0.12, 36, 2.8, 1.5, 3, TILE2);
  B.drum(1.5, 0.86, 39, 0.66, 22, '#FFFFFF', {rings: 0});   // 👨‍🍳 the hat band with pleats + a team stripe
  B.custom(1.5, 0.86, (g, P, k, t, T2) => { const q = P(1.5, 0.86, 39), rx = 0.66 * HTW * k * S2, ry = rx / 2, col = c && c.broken ? '#8A8070' : teamOf(L);
    g.strokeStyle = 'rgba(42,28,20,0.18)'; g.lineWidth = 1 * k; for(let i = 1; i < 12; i++){ const u = -1 + i / 6, x = q[0] + u * rx, y = q[1] + Math.sqrt(Math.max(0, 1 - u * u)) * ry; line(g, [x, y], [x, y - 22 * k]); }
    g.fillStyle = col; g.beginPath(); g.ellipse(q[0], q[1] - 3 * k, rx, ry, 0, 0, Math.PI); g.lineTo(q[0] - rx, q[1] - 8 * k); g.ellipse(q[0], q[1] - 8 * k, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill();
    if(!(c && c.broken)) K.AR.patPaint(g, (s, vv) => { const u = -1 + s / (rx * 2 / k) * 2; return [q[0] + u * rx, q[1] + Math.sqrt(Math.max(0, 1 - u * u)) * ry - 3 * k - vv * k]; }, rx * 2 / k, 5, patOf(L), inkOf(col), k); }, {layer: 1, zb: 39, top: 50});
  B.custom(1.5, 0.86, (g, P, k, t) => { const q = P(1.5, 0.86, 61), rx = 0.66 * HTW * k * S2, br = c && c.broken, top = br ? 34 : 70, puffs = br ? [[-0.55, 0.1, 0.5], [0.3, 0.2, 0.55]] : [[-0.78, 0.12, 0.42], [0.78, 0.12, 0.42], [-0.5, 0.42, 0.55], [0.5, 0.42, 0.55], [0, 0.22, 0.6], [-0.22, 0.72, 0.56], [0.26, 0.74, 0.54], [0, 0.95, 0.5]];
    puffs.forEach(([fx, fy, fr]) => { const x = q[0] + fx * rx, y = q[1] - fy * top * k, r = fr * rx; g.fillStyle = D.rad(g, x - r * 0.35, y - r * 0.45, 0.5, r * 1.3, [[0, '#FFFFFF'], [0.65, br ? '#D8D0C4' : '#F6F2EC'], [1, br ? '#A8A096' : '#D7D2CC']]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); });
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(q[0], q[1] - 2 * k, rx * 0.98, rx * 0.4, 0, 0, TAU); g.fill(); }, {layer: 2, zb: 61, top: 131});
  pennant(B, L, 1.5, 0.86, 120, 14, {emblem: toque, pole: STEELD, layer: 3});
  banner(B, L, w, 'right', 1.15, 0.26, 6, 20, toque);
  B.custom(2.86, 1.86, (g, P, k) => { const q = P(2.92, 1.94, 26); lantern(g, q[0], q[1], 5.5 * k, k, c); }, {layer: 3, zb: 18, top: 36});
  B.custom(0.14, 1.86, (g, P, k) => { const q = P(0.08, 1.94, 26); lantern(g, q[0], q[1], 5.5 * k, k, c); }, {layer: 3, zb: 18, top: 36});
});
/* ============================ 🏕️ CAMP — Prep Kitchen ============================ */
KR('camp', {name: 'Prep Kitchen', h: 80}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, '#F3E7D8');
  B.custom(1, 1, (g, P, k) => { for(let i = 0; i < 6; i++) for(let j = 0; j < 6; j++){ if((i + j) % 2) continue; const x = 0.08 + i * 0.307, y = 0.08 + j * 0.307; polyP(g, [P(x, y, 0.6), P(x + 0.307, y, 0.6), P(x + 0.307, y + 0.307, 0.6), P(x, y + 0.307, 0.6)]); g.fillStyle = c && c.broken ? '#B8A898' : '#E59A86'; g.fill(); } }, {layer: -8, zb: 0, top: 1});
  [[0.12, 0.12], [1.82, 0.12], [0.12, 0.96], [1.82, 0.96]].forEach(p => B.box(p[0], p[1], 0, 0.07, 0.07, 42, WOODD));
  const r = B.roof(0.06, 0.06, 42, 1.88, 0.98, 16, ROOF, {ridge: 'x', ov: 0.12, finials: true});
  const ct = B.box(0.22, 0.24, 0, 1.56, 0.44, 16, WOOD); B.box(0.2, 0.22, 16, 1.6, 0.48, 2.5, STEEL);
  B.decal(ct, 'front', ...F(ct, 'front'), 0, 16, WOOD, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.9 * k; [0.33, 0.66].forEach(u => line(g, Q(u, 1), Q(u, 15))); g.fillStyle = STEELD; [0.16, 0.5, 0.84].forEach(u => { const p = Q(u, 11); g.beginPath(); g.arc(p[0], p[1], 1.2 * k, 0, TAU); g.fill(); }); }});
  trim(B, L, ct, 2, 3, ['front', 'right']);
  B.custom(0.6, 0.46, (g, P, k) => { const q = P(0.6, 0.46, 18.5); g.fillStyle = '#E2B07A'; polyP(g, [P(0.36, 0.34, 18.6), P(0.82, 0.34, 18.6), P(0.82, 0.6, 18.6), P(0.36, 0.6, 18.6)]); g.fill();
    [[-6, 0, '#E2553A'], [-1, 2, '#5DBB46'], [5, -1, '#F2B731']].forEach(([dx, dy, col]) => { g.fillStyle = c && c.broken ? '#8A7A6A' : col; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, 3 * k, 2.2 * k); g.fill(); });
    g.fillStyle = '#C3CAD2'; polyP(g, [[q[0] + 6 * k, q[1] - 6 * k], [q[0] + 13 * k, q[1] - 3 * k], [q[0] + 12 * k, q[1] - 1 * k], [q[0] + 5 * k, q[1] - 4 * k]]); g.fill(); }, {layer: 2, zb: 18, top: 22});
  B.drum(1.42, 0.46, 18.5, 0.16, 4, '#3A3A42'); B.custom(1.42, 0.46, (g, P, k, t) => { const q = P(1.42, 0.46, 22.5); g.fillStyle = '#4A4A54'; g.beginPath(); D.ell(g, q[0], q[1], 9 * k, 4.2 * k); g.fill(); g.fillStyle = c && c.broken ? '#8A7A6A' : '#F2B731'; [[-3, 0], [2, -1], [0, 1.5]].forEach(([dx, dy]) => { g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, 2.4 * k, 1.4 * k); g.fill(); }); steam(g, q[0], q[1] - 2 * k, k * 0.8, t, 2, c); }, {layer: 2, zb: 22, top: 40});
  B.drum(1.42, 1.38, 0, 0.22, 20, '#D9B887', {rings: 3});   // 🥔 the training sack (a potato sack with a team target) for the Spatula Guards
  B.custom(1.42, 1.38, (g, P, k) => { const q = P(1.42, 1.38, 20), col = c && c.broken ? '#6A5A50' : teamOf(L); g.fillStyle = '#C8A574'; g.beginPath(); D.ell(g, q[0], q[1], 9 * k, 4 * k); g.fill(); g.strokeStyle = WOODD; g.lineWidth = 1.4 * k; line(g, [q[0] - 4 * k, q[1] - 1 * k], [q[0] + 1 * k, q[1] - 6 * k]);
    const s = P(1.42, 1.62, 11); g.fillStyle = col; g.beginPath(); g.arc(s[0], s[1], 6 * k, 0, TAU); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(s[0], s[1], 3.8 * k, 0, TAU); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(s[0], s[1], 1.8 * k, 0, TAU); g.fill(); }, {layer: 3, zb: 0, top: 26});
  const cr = B.box(0.3, 1.24, 0, 0.42, 0.34, 10, '#D9A86A'); B.decal(cr, 'front', ...F(cr, 'front'), 3, 3, '#B5172A');
  B.custom(0.51, 1.41, (g, P, k) => { const q = P(0.51, 1.41, 10); [[-5, 0, '#E2553A'], [0, -2, '#5DBB46'], [5, 0, '#E2553A'], [-2, 2, '#F28A2E'], [3, 2, '#5DBB46']].forEach(([dx, dy, col]) => { g.fillStyle = c && c.broken ? '#8A7A6A' : col; g.beginPath(); g.arc(q[0] + dx * k, q[1] + dy * k - 2 * k, 2.8 * k, 0, TAU); g.fill(); }); }, {layer: 2, zb: 10, top: 16});
  pennant(B, L, 1.86, 1.86, 0, 40, {emblem: toque, pole: WOODD});
  B.custom(1.85, 0.95, (g, P, k) => { const q = P(1.86, 0.98, 34); lantern(g, q[0], q[1], 5 * k, k, c); }, {layer: 4, zb: 26, top: 42});
});
/* ============================ 🎠 RIDE-ON — Scooter Garage ============================ */
KR('ride', {name: 'Scooter Garage', h: 96}, (B, v, L) => { const c = L.cond;
  B.flat(0.08, 2.22, 1.84, 0.72, '#D8D1C2');
  const w = tiled(B, 0.12, 0.16, 0, 1.76, 2.04, 42, TILE2, 31, {skirt: true});
  B.decal(w, 'front', 0.38, 0.92, 0, 34, '#5E6672', {k: 'door', paint: (g, Q, k) => { g.fillStyle = '#2E2A30'; polyP(g, [Q(0, 0), Q(1, 0), Q(1, 13), Q(0, 13)]); g.fill();   // roll-up door, half up: the scooter's front wheel peeks out
      g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 1 * k; for(let z = 15; z < 34; z += 3.2) line(g, Q(0.02, z), Q(0.98, z)); g.fillStyle = '#3A3A42'; const p = Q(0.5, 4); g.beginPath(); D.ell(g, p[0], p[1], 5 * k, 5 * k); g.fill(); g.fillStyle = '#9AA4AE'; g.beginPath(); D.ell(g, p[0], p[1], 2 * k, 2 * k); g.fill(); }});
  const rf = B.roof(0.12, 0.16, 42, 1.76, 2.04, 20, TOMATO, {ridge: 'y', ov: 0.14, stripes: 8});
  trim(B, L, w, 36, 3.4); banner(B, L, w, 'right', 0.5, 0.36, 8, 22, toque); banner(B, L, w, 'right', 1.3, 0.36, 8, 22, toque);
  B.custom(1, 2.21, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const m = P(1, 2.22, 48); g.fillStyle = c && c.broken ? '#BDB4A2' : CREAM; g.beginPath(); g.arc(m[0], m[1], 10 * k, 0, TAU); g.fill(); g.strokeStyle = TOMATO; g.lineWidth = 2 * k; g.stroke();   // 🛵 the scooter sign
    g.fillStyle = '#2E3A5A'; g.beginPath(); g.arc(m[0] - 4.5 * k, m[1] + 4 * k, 2.4 * k, 0, TAU); g.arc(m[0] + 4.5 * k, m[1] + 4 * k, 2.4 * k, 0, TAU); g.fill(); g.beginPath(); g.moveTo(m[0] - 6 * k, m[1] + 2 * k); g.quadraticCurveTo(m[0] - 1 * k, m[1] - 4 * k, m[0] + 5 * k, m[1] + 1 * k); g.lineTo(m[0] + 6 * k, m[1] - 5 * k); g.lineWidth = 1.8 * k; g.strokeStyle = '#2E3A5A'; g.stroke(); }, {layer: 3, zb: 38, top: 60});
  B.custom(1.52, 2.6, (g, P, k) => { const col = c && c.broken ? '#6A5A50' : teamOf(L), w0 = P(1.3, 2.6, 4), w1 = P(1.76, 2.6, 4), body = '#7FD3C4';   // 🛵 a delivery scooter parked out front: mint body, team delivery box
    [w0, w1].forEach(p => { g.fillStyle = '#2E2A30'; g.beginPath(); D.ell(g, p[0], p[1], 4.6 * k, 4.6 * k); g.fill(); g.fillStyle = '#9AA4AE'; g.beginPath(); D.ell(g, p[0], p[1], 1.8 * k, 1.8 * k); g.fill(); });
    g.fillStyle = c && c.broken ? '#8A9A96' : body; g.beginPath(); g.moveTo(w0[0] - 2 * k, w0[1] - 4 * k); g.quadraticCurveTo(w0[0] + 2 * k, w0[1] - 15 * k, w0[0] + 9 * k, w0[1] - 12 * k); g.lineTo(w1[0] - 4 * k, w1[1] - 6 * k); g.lineTo(w1[0] + 2 * k, w1[1] - 9 * k); g.lineTo(w1[0] + 3 * k, w1[1] - 3 * k); g.lineTo(w0[0] + 2 * k, w0[1] - 1 * k); g.closePath(); g.fill();
    g.strokeStyle = '#3A3A42'; g.lineWidth = 1.6 * k; line(g, [w1[0], w1[1] - 6 * k], [w1[0] - 1 * k, w1[1] - 20 * k]); line(g, [w1[0] - 4 * k, w1[1] - 21 * k], [w1[0] + 3 * k, w1[1] - 19 * k]);
    g.fillStyle = lightOf(c) ? '#FFE58A' : '#8A8070'; g.beginPath(); g.arc(w1[0] + 1 * k, w1[1] - 15 * k, 1.8 * k, 0, TAU); g.fill();
    g.fillStyle = '#3A2A20'; g.beginPath(); D.ell(g, w0[0] + 6 * k, w0[1] - 13 * k, 5 * k, 1.8 * k); g.fill();
    g.fillStyle = col; g.fillRect(w0[0] - 5 * k, w0[1] - 25 * k, 11 * k, 10 * k); g.strokeStyle = D.sh(col, -0.5); g.lineWidth = 1 * k; g.strokeRect(w0[0] - 5 * k, w0[1] - 25 * k, 11 * k, 10 * k); toque(g, w0[0] + 0.5 * k, w0[1] - 20 * k, 3.4 * k, inkOf(col)); }, {layer: 3, zb: 0, top: 30});
  [[0.24, 2.5, 0], [0.24, 2.5, 3], [0.24, 2.5, 6], [0.24, 2.5, 9]].forEach(([x, y, z], i) => { const b = B.box(x + (i % 2) * 0.02, y, z, 0.4, 0.38, 3, i % 2 ? '#E8C890' : '#D9B070'); });
  pennant(B, L, 1, 1.2, 62, 20, {emblem: toque, pole: STEELD});
});
/* ============================ 🪽 NEST — Crêpe-pan Launchpad ============================ */
KR('nest', {name: 'Crêpe-pan Launchpad', h: 120}, (B, v, L) => { const c = L.cond;
  B.drum(1, 1, 0, 0.9, 7, '#D8D1C2', {rings: 2});
  B.custom(1, 1, (g, P, k) => { const q = P(1, 1, 7), rx = 0.9 * HTW * k * S2, col = c && c.broken ? '#6A6060' : teamOf(L); g.strokeStyle = col; g.lineWidth = 3.2 * k; g.beginPath(); g.ellipse(q[0], q[1], rx * 0.93, rx * 0.465, 0, 0, TAU); g.stroke();
    g.fillStyle = lightOf(c) ? '#FFE58A' : '#8A8070'; for(let i = 0; i < 12; i++){ const a = i / 12 * TAU; g.beginPath(); g.arc(q[0] + Math.cos(a) * rx * 0.8, q[1] + Math.sin(a) * rx * 0.4, 1.3 * k, 0, TAU); g.fill(); } }, {layer: 1, zb: 7, top: 8});
  B.box(0.06, 0.88, 9, 0.42, 0.2, 4, WOODD);
  B.drum(1.05, 1, 7, 0.62, 5, '#3A3A42'); B.custom(1.05, 1, (g, P, k) => { const q = P(1.05, 1, 12), rx = 0.56 * HTW * k * S2; g.fillStyle = '#4C4C56'; g.beginPath(); g.ellipse(q[0], q[1], rx, rx / 2, 0, 0, TAU); g.fill();
    g.fillStyle = c && c.broken ? '#A89070' : '#F2C46A'; g.beginPath(); g.ellipse(q[0], q[1], rx * 0.82, rx * 0.4, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(180,110,40,0.4)'; for(let i = 0; i < 9; i++){ const a = i * 2.3; g.beginPath(); D.ell(g, q[0] + Math.cos(a) * rx * 0.5, q[1] + Math.sin(a) * rx * 0.22, 2.2 * k, 1.2 * k); g.fill(); } }, {layer: 2, zb: 12, top: 13});
  B.custom(1.05, 1, (g, P, k, t) => { if(c && c.broken) return; const bob = Math.sin(ph(t, 2)) * 2 + Math.cos(ph(t, 2)) * 1, q = P(1.05, 1, 74 + bob), col = teamOf(L);   // 🥞 the crêpe-copter hovering over its pan: a folded crêpe + a whisk rotor + a team ribbon
    g.fillStyle = 'rgba(30,40,20,0.18)'; const sq = P(1.05, 1, 13); g.beginPath(); g.ellipse(sq[0], sq[1], 13 * k, 5 * k, 0, 0, TAU); g.fill();
    g.fillStyle = '#F2C46A'; g.beginPath(); g.moveTo(q[0] - 16 * k, q[1] + 6 * k); g.quadraticCurveTo(q[0] - 4 * k, q[1] - 10 * k, q[0] + 16 * k, q[1] + 4 * k); g.quadraticCurveTo(q[0], q[1] + 12 * k, q[0] - 16 * k, q[1] + 6 * k); g.fill();
    g.fillStyle = 'rgba(180,110,40,0.45)'; [[-6, 2], [2, 0], [7, 4]].forEach(([dx, dy]) => { g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, 2 * k, 1.2 * k); g.fill(); });
    g.fillStyle = '#E2553A'; g.beginPath(); g.arc(q[0] - 2 * k, q[1] - 2 * k, 2.6 * k, 0, TAU); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(q[0] + 4 * k, q[1], 2.4 * k, 0, TAU); g.fill();
    g.strokeStyle = STEELD; g.lineWidth = 1.4 * k; line(g, [q[0], q[1] - 3 * k], [q[0], q[1] - 14 * k]); g.strokeStyle = STEEL; g.lineWidth = 1 * k; [-1, 1].forEach(s => { g.beginPath(); D.ell(g, q[0] + s * 4 * k, q[1] - 15 * k, 5 * k, 2 * k, s * 0.3); g.stroke(); });
    g.fillStyle = col; g.beginPath(); g.moveTo(q[0] + 14 * k, q[1] + 4 * k); g.quadraticCurveTo(q[0] + 22 * k, q[1] + 8 * k + bob * k, q[0] + 26 * k, q[1] + 3 * k); g.lineTo(q[0] + 15 * k, q[1] + 1 * k); g.closePath(); g.fill(); }, {layer: 4, zb: 60, top: 92});
  B.box(1.66, 0.22, 7, 0.08, 0.08, 70, STEELD); B.custom(1.7, 0.26, (g, P, k, t) => { const a = P(1.7, 0.26, 77), col = c && c.broken ? '#6A6060' : teamOf(L), w2 = Math.sin(ph(t, 1.6)) * 2 + Math.cos(ph(t, 1.6)); if(c && c.broken) return;   // 🎐 windsock in the team colour
    for(let i = 0; i < 4; i++){ g.fillStyle = i % 2 ? '#FFFFFF' : col; const x0 = a[0] + i * 5 * k, x1 = x0 + 5 * k; g.beginPath(); g.moveTo(x0, a[1] - (4 - i * 0.6) * k + w2 * i * 0.3 * k); g.lineTo(x1, a[1] - (3.4 - i * 0.6) * k + w2 * (i + 1) * 0.3 * k); g.lineTo(x1, a[1] + (3.4 - i * 0.6) * k + w2 * (i + 1) * 0.3 * k); g.lineTo(x0, a[1] + (4 - i * 0.6) * k + w2 * i * 0.3 * k); g.closePath(); g.fill(); } }, {layer: 4, zb: 72, top: 82});
  B.custom(0.3, 1.7, (g, P, k) => { const q = P(0.32, 1.7, 7); [[0, 0], [4, -5], [-3, -10]].forEach(([dx, dy], i) => { g.fillStyle = i % 2 ? '#F2C46A' : '#E8B04E'; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, 8 * k, 2.6 * k); g.fill(); g.strokeStyle = 'rgba(140,80,20,0.4)'; g.lineWidth = 0.8 * k; g.stroke(); }); }, {layer: 2, zb: 7, top: 20});
  pennant(B, L, 0.25, 0.25, 7, 40, {emblem: toque, pole: STEELD});
});
/* ============================ 🩹 CARE — Soup Kitchen ============================ */
KR('care', {name: 'Soup Kitchen', h: 112, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  const w = tiled(B, 0.14, 0.2, 0, 1.72, 1.6, 34, TILE, 41);
  B.door(w, 'front', 0.78, 0.44, 27, {fill: '#7A4A24'}); noren(B, L, 0.72, 1.28, 1.81, 30, 10, '#2E8A6E', 2); B.win(w, 'front', 0.28, 0.32, 12, 14, {fill: '#BFE8F2'}); B.win(w, 'front', 1.44, 0.3, 12, 14, {fill: '#BFE8F2'}); B.win(w, 'right', 0.5, 0.6, 12, 14, {fill: '#BFE8F2'});
  trim(B, L, w, 30, 3.4); B.box(0.1, 0.16, 34, 1.8, 1.68, 3, TILE2);
  B.drum(1, 0.98, 37, 0.62, 30, COPPER, {rings: 0});   // 🍲 a GIANT soup pot on the roof: copper body, rim, handles, a lid pushed aside, a ladle + steam
  B.custom(1, 0.98, (g, P, k, t) => { const q = P(1, 0.98, 67), rx = 0.62 * HTW * k * S2, br = c && c.broken; g.fillStyle = COPPERD; g.beginPath(); g.ellipse(q[0], q[1], rx, rx / 2, 0, 0, TAU); g.fill();
    g.fillStyle = br ? '#6A5040' : '#E6A24A'; g.beginPath(); g.ellipse(q[0], q[1] + 1 * k, rx * 0.86, rx * 0.4, 0, 0, TAU); g.fill(); if(!br){ g.fillStyle = '#F2C46A'; [[-0.3, 0.05, 3], [0.25, -0.05, 2.6], [0.05, 0.12, 2.2]].forEach(([fx, fy, r]) => { g.beginPath(); g.arc(q[0] + fx * rx, q[1] + fy * rx, r * k, 0, TAU); g.fill(); }); g.fillStyle = HERB; [[-0.1, -0.08], [0.32, 0.08]].forEach(([fx, fy]) => { g.beginPath(); D.ell(g, q[0] + fx * rx, q[1] + fy * rx, 2.6 * k, 1.2 * k, 0.5); g.fill(); }); }
    g.strokeStyle = '#E8E4DE'; g.lineWidth = 2.6 * k; g.lineCap = 'round'; line(g, [q[0] + rx * 0.3, q[1] - 2 * k], [q[0] + rx * 0.62, q[1] - 26 * k]); g.fillStyle = '#E8E4DE'; g.beginPath(); D.ell(g, q[0] + rx * 0.24, q[1] + 1 * k, 4 * k, 2.4 * k); g.fill();
    const lid = P(0.48, 0.5, 70); g.fillStyle = '#B87A3A'; g.beginPath(); D.ell(g, lid[0], lid[1], rx * 0.62, rx * 0.26, -0.35); g.fill(); g.fillStyle = '#3A2A20'; g.beginPath(); D.ell(g, lid[0], lid[1] - 3 * k, 3 * k, 1.8 * k, -0.35); g.fill();
  }, {layer: 2, zb: 67, top: 96});
  B.custom(1, 0.98, (g, P, k, t) => { const q = P(1, 0.98, 67); steam(g, q[0] - 6 * k, q[1] - 2 * k, k * 1.3, t, 4, c); }, {layer: 3, zb: 67, top: 112, fx: true});
  B.custom(1, 0.98, (g, P, k) => { [-1, 1].forEach(s => { const q = P(1 + s * 0.66, 0.98, 58); g.strokeStyle = COPPERD; g.lineWidth = 2.4 * k; g.beginPath(); g.arc(q[0], q[1], 4.4 * k, s > 0 ? -1.2 : Math.PI - 0.6, s > 0 ? 1.2 : Math.PI + 1.2); g.stroke(); }); }, {layer: 3, zb: 52, top: 64});
  B.custom(1, 1.8, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const m = P(1, 1.81, 39), br = c && c.broken;   // ❤️ the heart-and-ladle sign over the door
    g.fillStyle = br ? '#8A6A6A' : '#E5484D'; g.beginPath(); g.moveTo(m[0], m[1] + 5 * k); g.bezierCurveTo(m[0] - 10 * k, m[1] - 3 * k, m[0] - 6 * k, m[1] - 11 * k, m[0], m[1] - 6 * k); g.bezierCurveTo(m[0] + 6 * k, m[1] - 11 * k, m[0] + 10 * k, m[1] - 3 * k, m[0], m[1] + 5 * k); g.fill();
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.6 * k; g.lineCap = 'round'; line(g, [m[0] + 2 * k, m[1] - 7 * k], [m[0] - 2 * k, m[1] + 1 * k]); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(m[0] - 2.6 * k, m[1] + 2 * k, 2 * k, 0, TAU); g.fill(); }, {layer: 3, zb: 33, top: 46});
  pennant(B, L, 0.22, 0.26, 37, 26, {emblem: toque, pole: STEELD});
  B.custom(1.86, 1.86, (g, P, k) => { const q = P(1.84, 1.84, 0); [[0, 0], [7, 2]].forEach(([dx, dy]) => { g.fillStyle = '#E2E6EA'; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k - 4 * k, 4 * k, 2 * k); g.fill(); g.fillStyle = '#F2C46A'; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k - 4.5 * k, 2.8 * k, 1.2 * k); g.fill(); }); }, {layer: 3, zb: 0, top: 8});
});
/* ============================ 🔧 WORKSHOP — Oven Works ============================ */
KR('workshop', {name: 'Oven Works', h: 110, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond, {blocks} = K.AR;
  const b = B.box(0.1, 0.14, 0, 1.8, 1.72, 16, BRICK); ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, 16, BRICK, {paint: blocks(16, BRICK, 51, 4)}));
  trim(B, L, b, 10, 3);
  B.custom(0.95, 0.95, (g, P, k) => { const d = dome(g, P, k, 0.95, 0.95, 16, 0.74, 48, c && c.broken ? '#9A7060' : BRICK); const q = d.c;   // 🍕 the big brick oven dome
    g.strokeStyle = 'rgba(90,40,20,0.35)'; g.lineWidth = 1 * k; for(let i = 1; i < 4; i++){ g.beginPath(); g.ellipse(q[0], q[1] - d.hh * i / 4 * 0.9, d.rx * Math.sqrt(1 - (i / 4) * (i / 4) * 0.8), d.ry * 0.9, 0, 0.1, Math.PI - 0.1); g.stroke(); }
    if(c && c.broken){ g.fillStyle = 'rgba(30,20,14,0.8)'; g.beginPath(); D.ell(g, q[0] + d.rx * 0.2, q[1] - d.hh * 0.55, 9 * k, 6 * k, 0.4); g.fill(); } }, {layer: 1, zb: 16, top: 64});
  B.custom(0.95, 1.69, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const a = P(0.7, 1.68, 16), b2 = P(1.2, 1.68, 16), m = P(0.95, 1.68, 40), lv = lightOf(c);   // the oven mouth (glowing) under a brick arch
    g.fillStyle = BRICKD; g.beginPath(); g.moveTo(a[0] - 3 * k, a[1] + 1 * k); g.quadraticCurveTo(m[0], m[1] - 6 * k, b2[0] + 3 * k, b2[1] + 1 * k); g.closePath(); g.fill();
    g.fillStyle = lv ? '#FF8A2E' : '#2A1C14'; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1], b2[0], b2[1]); g.closePath(); g.fill();
    if(lv){ g.fillStyle = '#FFD24A'; g.beginPath(); g.moveTo(a[0] + 3 * k, a[1]); g.quadraticCurveTo(m[0], m[1] + 10 * k, b2[0] - 3 * k, b2[1]); g.closePath(); g.fill(); [[-4, -2], [1, -5], [5, -1]].forEach(([dx, dy]) => { g.fillStyle = '#FF5A1E'; g.beginPath(); D.ell(g, (a[0] + b2[0]) / 2 + dx * k, (a[1] + b2[1]) / 2 + dy * k, 2.4 * k, 4 * k); g.fill(); }); } }, {layer: 2, zb: 16, top: 42});
  halo(B, 0.95, 1.72, 24, 18, '#FF9A3A', lightOf(c) ? 0.45 : 0);
  B.drum(1.58, 0.4, 16, 0.13, 62, BRICKD, {rings: 6}); B.drum(1.58, 0.4, 78, 0.17, 4, '#5A3A2A');
  B.custom(1.58, 0.4, (g, P, k, t) => { if(c && (c.broken || c.still)) return; const q = P(1.58, 0.4, 84), s = Math.sin(ph(t, 2.4)), cc = Math.cos(ph(t, 2.4)); for(let i = 0; i < 3; i++){ g.fillStyle = 'rgba(120,110,110,' + (0.55 - i * 0.14) + ')'; g.beginPath(); g.arc(q[0] + (i * 4 + s * 2) * k, q[1] - (6 + i * 9 + cc * 2) * k, (4 + i * 2) * k, 0, TAU); g.fill(); } }, {layer: 3, zb: 84, top: 112, fx: true});
  B.custom(1.7, 1.55, (g, P, k) => { const q = P(1.74, 1.62, 0); for(let r = 0; r < 3; r++) for(let i = 0; i < 3 - r; i++){ const x = q[0] + (i - (2 - r) / 2) * 6.4 * k, y = q[1] - r * 5 * k - 3 * k; g.fillStyle = '#8A5A34'; g.beginPath(); D.ell(g, x, y, 3.4 * k, 3 * k); g.fill(); g.fillStyle = '#E3B57A'; g.beginPath(); D.ell(g, x, y, 2.2 * k, 1.9 * k); g.fill(); } }, {layer: 3, zb: 0, top: 18});
  B.custom(0.24, 1.7, (g, P, k) => { const a = P(0.22, 1.74, 0), b2 = P(0.3, 1.5, 34); g.strokeStyle = WOODD; g.lineWidth = 2 * k; g.lineCap = 'round'; line(g, a, b2); g.fillStyle = '#C99257'; g.beginPath(); D.ell(g, b2[0], b2[1] - 4 * k, 5 * k, 6.5 * k, 0.15); g.fill(); }, {layer: 3, zb: 0, top: 44});
  pennant(B, L, 0.22, 0.26, 16, 30, {emblem: toque, pole: STEELD});
});
/* ============================ 🗼 TOWER — Pepper-mill Tower (stand + aim) ============================ */
KR('tower', {name: 'Pepper-mill Tower', h: 136, stand: [0.5, 0.5, 82], aim: [0.5, 0.5, 100]}, (B, v, L) => { const c = L.cond;
  B.drum(0.5, 0.5, 0, 0.36, 10, WOODD, {rings: 2});
  B.custom(0.5, 0.5, (g, P, k) => { frustum(g, P, k, 0.5, 0.5, 10, 0.34, 0.24, 30, c && c.broken ? '#8A6A50' : '#B4743E'); frustum(g, P, k, 0.5, 0.5, 40, 0.24, 0.3, 36, c && c.broken ? '#8A6A50' : '#B4743E');
    [10, 40, 76].forEach(z => { const q = P(0.5, 0.5, z), rx = (z === 40 ? 0.24 : z === 76 ? 0.3 : 0.34) * HTW * k * S2; g.strokeStyle = GOLD; g.lineWidth = 2.6 * k; g.beginPath(); g.ellipse(q[0], q[1], rx, rx / 2, 0, 0, Math.PI); g.stroke(); });
    const g1 = P(0.5, 0.86, 28); g.fillStyle = 'rgba(255,240,210,0.35)'; g.beginPath(); D.ell(g, g1[0] - 3 * k, g1[1] - 6 * k, 1.6 * k, 12 * k); g.fill(); }, {layer: 1, zb: 10, top: 76});
  const deck = B.drum(0.5, 0.5, 76, 0.47, 6, '#E2B07A', {rings: 0});
  B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 79), rx = 0.47 * HTW * k * S2, col = c && c.broken ? '#6A6060' : teamOf(L); g.strokeStyle = col; g.lineWidth = 3.4 * k; g.beginPath(); g.ellipse(q[0], q[1], rx, rx / 2, 0, 0, Math.PI); g.stroke();
    if(c && c.broken) return; g.strokeStyle = WOODD; g.lineWidth = 1.3 * k; for(let i = 0; i <= 8; i++){ const a = i / 8 * Math.PI, x = q[0] + Math.cos(a) * rx * 0.96, y = q[1] - 3 * k + Math.sin(a) * rx * 0.48; line(g, [x, y], [x, y - 11 * k]); }
    g.beginPath(); g.ellipse(q[0], q[1] - 14 * k, rx * 0.96, rx * 0.48, 0, 0, Math.PI); g.stroke(); }, {layer: 3, zb: 76, top: 96});
  B.drum(0.5, 0.5, 82, 0.13, 16, '#8A5A34', {rings: 2});
  B.custom(0.5, 0.5, (g, P, k) => { if(c && c.broken) return; dome(g, P, k, 0.5, 0.5, 98, 0.2, 13, GOLD); const q = P(0.5, 0.5, 111); g.fillStyle = '#B4743E'; g.beginPath(); g.arc(q[0], q[1] - 2 * k, 3.6 * k, 0, TAU); g.fill(); }, {layer: 2, zb: 98, top: 116});
  pennant(B, L, 0.5, 0.5, 114, 16, {emblem: toque, pole: STEELD, layer: 4});
  B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 0); [[-14, 4], [-9, 8], [10, 7], [15, 3], [4, 10]].forEach(([dx, dy]) => { g.fillStyle = '#3A2A20'; g.beginPath(); g.arc(q[0] + dx * k, q[1] + dy * k, 1.6 * k, 0, TAU); g.fill(); }); }, {layer: -1, zb: 0, top: 2});
});
/* ============================ 🎨 WARDROBE — Apron Closet ============================ */
KR('wardrobe', {name: 'Apron Closet', h: 84}, (B, v, L) => { const c = L.cond;
  const w = B.box(0.1, 0.1, 0, 1.8, 0.56, 38, '#F7E1D3'); ['front', 'right'].forEach(s => B.decal(w, s, ...F(w, s), 0, 6, TOMATO, {paint: checker(6, TOMATO, '#FFFFFF', s === 'front' ? 18 : 6, 1)}));
  B.decal(w, 'front', 0.62, 0.76, 6, 28, '#C99257', {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 1 * k; line(g, Q(0.5, 0), Q(0.5, 28)); [0.06, 0.56].forEach(u => { polyP(g, [Q(u, 3), Q(u + 0.38, 3), Q(u + 0.38, 25), Q(u, 25)]); g.stroke(); }); g.fillStyle = GOLD; [0.44, 0.56].forEach(u => { const p = Q(u, 14); g.beginPath(); g.arc(p[0], p[1], 1.4 * k, 0, TAU); g.fill(); }); }});
  trim(B, L, w, 32, 3); B.roof(0.06, 0.06, 38, 1.88, 0.64, 16, ROOF, {ridge: 'x', ov: 0.12, finials: true});
  [0.16, 1.84].forEach(x => B.box(x, 0.84, 0, 0.05, 0.05, 34, WOODD));
  B.custom(1, 0.86, (g, P, k, t) => { const a = P(0.18, 0.86, 32), b2 = P(1.86, 0.86, 32), col = teamOf(L), br = c && c.broken, wv = Math.sin(ph(t, 1.8)) + Math.cos(ph(t, 1.8)) * 0.5;   // 🧺 aprons on a line: team colour · checker · white
    g.strokeStyle = '#E8E4DE'; g.lineWidth = 1 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2 + 4 * k, b2[0], b2[1]); g.stroke();
    [[0.35, br ? '#8A7A70' : col, 'team'], [0.75, '#FFFFFF', 'chk'], [1.15, br ? '#8A7A70' : '#F2B731', 'plain'], [1.55, '#FFFFFF', 'plain']].forEach(([x, cl, kind], i) => { if(br && i === 2) return; const p = P(x + 0.14, 0.86, 31), sw = (i % 2 ? -1 : 1) * wv * 0.6 * k;
      g.fillStyle = cl; g.beginPath(); g.moveTo(p[0] - 4 * k, p[1]); g.lineTo(p[0] + 4 * k, p[1]); g.lineTo(p[0] + 4.5 * k, p[1] + 4 * k); g.lineTo(p[0] + 7 * k + sw, p[1] + 6 * k); g.lineTo(p[0] + 6 * k + sw, p[1] + 19 * k); g.lineTo(p[0] - 6 * k + sw, p[1] + 19 * k); g.lineTo(p[0] - 7 * k + sw, p[1] + 6 * k); g.lineTo(p[0] - 4.5 * k, p[1] + 4 * k); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 0.8 * k; g.stroke();
      if(kind === 'chk'){ g.save(); g.clip(); g.fillStyle = TOMATO; for(let yy = 0; yy < 5; yy++) for(let xx = 0; xx < 4; xx++) if((xx + yy) % 2) g.fillRect(p[0] - 7 * k + xx * 3.6 * k + sw, p[1] + 4 * k + yy * 3.4 * k, 3.6 * k, 3.4 * k); g.restore(); }
      if(kind === 'team') toque(g, p[0] + sw * 0.5, p[1] + 12 * k, 3 * k, inkOf(col)); else { g.fillStyle = 'rgba(42,28,20,0.2)'; g.fillRect(p[0] - 4 * k + sw, p[1] + 10 * k, 8 * k, 4 * k); } }); }, {layer: 3, zb: 10, top: 34});
  B.custom(1, 0.4, (g, P, k, t, T2) => { const q = P(1, 0.4, 62); if(c && c.broken) return; toque(g, q[0], q[1] + 2 * k, 7 * k, '#FFFFFF'); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 0.8 * k; g.beginPath(); g.arc(q[0], q[1] - 1 * k, 4 * k, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }, {layer: 3, zb: 54, top: 70});
  pennant(B, L, 1.86, 0.2, 38, 22, {emblem: toque, pole: WOODD});
});
/* ============================ 🔮 SPELL TOWER — Recipe Library ============================ */
KR('spell', {name: 'Recipe Library', h: 118}, (B, v, L) => { const c = L.cond;
  const w = B.box(0.16, 0.14, 0, 1.68, 1.4, 46, '#F4E4C8'); ['front', 'right', 'left', 'back'].forEach((s, i) => B.decal(w, s, ...F(w, s), 0, 6, '#8A5A34'));
  B.decal(w, 'front', 0.3, 1.4, 10, 26, '#7A4A24', {paint: (g, Q, k) => { const cols = ['#E2553A', '#2E8A6E', '#F2B731', '#33405E', '#B5172A', '#7FB24A', '#E59A86', '#5A6E8C'], R = rnd(17); [11, 21].forEach(z0 => { let u = 0.03; while(u < 0.96){ const bw = 0.03 + R() * 0.025, bh = 6 + R() * 3; polyP(g, [Q(u, z0 - 8), Q(u + bw, z0 - 8), Q(u + bw, z0 - 8 + bh), Q(u, z0 - 8 + bh)]); g.fillStyle = cols[(R() * cols.length) | 0]; g.fill(); u += bw + 0.006; } }); }});   // 📚 a wall of recipe books
  B.decal(w, 'right', 0.35, 0.7, 14, 18, '#BFE8F2', {k: 'win'}); B.door(w, 'front', 0.78, 0.44, 10, {fill: '#6A3A1C'});
  trim(B, L, w, 40, 3.4); B.roof(0.1, 0.08, 46, 1.8, 1.52, 30, ROOF, {kind: 'hip', ov: 0.14});
  B.custom(1, 0.84, (g, P, k) => { const q = P(1, 0.84, 76); g.fillStyle = GOLD; g.beginPath(); g.arc(q[0], q[1] - 2 * k, 3 * k, 0, TAU); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 1.6 * k; line(g, q, [q[0], q[1] - 10 * k]); D.star(g, q[0], q[1] - 13 * k, 4.4 * k, 1.8 * k, 5); g.fill(); }, {layer: 2, zb: 76, top: 92});
  B.box(0.86, 1.62, 0, 0.3, 0.2, 18, WOODD, {layer: 1});   // 📖 the GIANT open cookbook on a lectern in front, a glowing recipe + a floating whisk
  B.custom(1.01, 1.72, (g, P, k, t) => { const q = P(1.01, 1.72, 18), br = c && c.broken, lv = lightOf(c);
    g.fillStyle = br ? '#5A3A2A' : '#B5172A'; g.beginPath(); g.moveTo(q[0] - 17 * k, q[1] + 1 * k); g.lineTo(q[0], q[1] + 6 * k); g.lineTo(q[0] + 17 * k, q[1] + 1 * k); g.lineTo(q[0] + 15 * k, q[1] - 11 * k); g.lineTo(q[0], q[1] - 6 * k); g.lineTo(q[0] - 15 * k, q[1] - 11 * k); g.closePath(); g.fill();
    [-1, 1].forEach(s => { g.fillStyle = br ? '#C8BEA8' : '#FFF8E6'; g.beginPath(); g.moveTo(q[0], q[1] + 3.6 * k); g.lineTo(q[0] + s * 15 * k, q[1] - 1 * k); g.lineTo(q[0] + s * 13.5 * k, q[1] - 12 * k); g.quadraticCurveTo(q[0] + s * 6 * k, q[1] - 10 * k, q[0], q[1] - 8 * k); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.8 * k; for(let i = 0; i < 4; i++) line(g, [q[0] + s * 3 * k, q[1] - (5 - i * 1.6) * k + i * 0.3 * k], [q[0] + s * 11.5 * k, q[1] - (7.5 - i * 1.8) * k]); });
    if(!br){ panIcon(g, q[0] - 8 * k, q[1] - 7.5 * k, 2.2 * k, k, null); egg(g, q[0] + 8 * k, q[1] - 6 * k, 2 * k, null); }
    if(lv && !br){ const bob = Math.sin(ph(t, 2)) * 2 + Math.cos(ph(t, 2)), w2 = [q[0] + 6 * k, q[1] - 26 * k + bob * k]; g.strokeStyle = STEELD; g.lineWidth = 1.4 * k; line(g, [w2[0] - 5 * k, w2[1] + 7 * k], [w2[0] + 1 * k, w2[1]]);
      g.strokeStyle = '#E2E6EA'; g.lineWidth = 1 * k; for(let i = 0; i < 3; i++){ g.beginPath(); D.ell(g, w2[0] + 3 * k, w2[1] - 3 * k, 2 + i * 1.2 * k, 4.5 * k, -0.6); g.stroke(); }
      g.fillStyle = '#FFE58A'; [[-12, -20], [12, -24], [-4, -30], [16, -14]].forEach(([dx, dy], i) => { D.star(g, q[0] + dx * k, q[1] + dy * k + (i % 2 ? bob : -bob) * k, 2.4 * k, 0.9 * k, 4); g.fill(); }); } }, {layer: 3, zb: 18, top: 50});
  halo(B, 1.01, 1.72, 26, 22, '#FFE58A', lightOf(c) ? 0.5 : 0);
  banner(B, L, w, 'right', 0.15, 0.24, 10, 24, toque); banner(B, L, w, 'right', 1.1, 0.24, 10, 24, toque);
  B.custom(1.85, 1.6, (g, P, k) => { const q = P(1.84, 1.64, 18); lantern(g, q[0], q[1], 5 * k, k, c); }, {layer: 3, zb: 10, top: 28});
});
/* ============================ 🕵️ HIDEOUT — Pantry Cellar ============================ */
KR('hideout', {name: 'Pantry Cellar', h: 64}, (B, v, L) => { const c = L.cond;
  B.custom(1, 0.95, (g, P, k) => { const d = dome(g, P, k, 1, 0.95, 0, 0.88, 30, c && c.broken ? '#8A8A6A' : '#7FB24A'); const q = d.c; g.fillStyle = 'rgba(46,110,40,0.4)'; [[-0.5, 0.5], [0.2, 0.75], [0.55, 0.35], [-0.2, 0.3]].forEach(([fx, fy]) => { g.beginPath(); D.ell(g, q[0] + fx * d.rx, q[1] - fy * d.hh, 7 * k, 3 * k); g.fill(); });
    if(!(c && c.broken)) [[-0.4, 0.55, '#FFB7CB'], [0.35, 0.62, '#FFFFFF'], [0.05, 0.85, '#FFB7CB']].forEach(([fx, fy, col]) => { g.fillStyle = col; g.beginPath(); g.arc(q[0] + fx * d.rx, q[1] - fy * d.hh, 2 * k, 0, TAU); g.fill(); }); }, {layer: 1, zb: 0, top: 30});
  B.custom(1, 1.7, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const a = P(0.64, 1.86, 0), b2 = P(1.36, 1.86, 0), d2 = P(1.36, 1.5, 16), e = P(0.64, 1.5, 16), lv = lightOf(c);   // 🚪 a slanted cellar door, half open: eyes peek from the dark
    g.fillStyle = '#5A3A22'; polyP(g, [P(0.6, 1.9, 0), P(1.4, 1.9, 0), P(1.4, 1.46, 18), P(0.6, 1.46, 18)]); g.fill();
    g.fillStyle = '#1E1612'; polyP(g, [a, b2, d2, e]); g.fill();
    g.fillStyle = WOOD; const m = P(1, 1.86, 0), mt = P(1, 1.5, 16); polyP(g, [a, m, mt, e]); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 0.9 * k; for(let i = 1; i < 4; i++){ const u = i / 4; line(g, [a[0] + (m[0] - a[0]) * u, a[1] + (m[1] - a[1]) * u], [e[0] + (mt[0] - e[0]) * u, e[1] + (mt[1] - e[1]) * u]); }
    g.fillStyle = '#C99257'; polyP(g, [m, b2, [b2[0] + 4 * k, b2[1] - 18 * k], [m[0] + 4 * k, m[1] - 20 * k]]); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.stroke();
    if(lv){ const ey = [(m[0] + d2[0]) / 2 + 1 * k, (m[1] + d2[1]) / 2 - 1 * k]; g.fillStyle = '#FFE58A'; [-3, 3].forEach(dx => { g.beginPath(); D.ell(g, ey[0] + dx * k, ey[1], 1.8 * k, 1.3 * k); g.fill(); }); } }, {layer: 2, zb: 0, top: 22});
  [[0.3, 0.55], [0.3, 0.95]].forEach(([x, y]) => B.drum(x, y, 0, 0.17, 20, '#A8743E', {rings: 3}));
  B.custom(0.3, 0.75, (g, P, k) => { [[0.3, 0.55], [0.3, 0.95]].forEach(([x, y]) => { const q = P(x, y, 20); g.fillStyle = '#7A4A24'; g.beginPath(); D.ell(g, q[0], q[1], 7 * k, 3.4 * k); g.fill(); }); }, {layer: 2, zb: 20, top: 21});
  B.box(1.44, 0.3, 0, 0.36, 0.42, 14, WOOD); B.custom(1.62, 0.5, (g, P, k) => { const q = P(1.62, 0.5, 14); [[-5, 0, '#7FB24A'], [0, -1, '#F2B731'], [5, 0, '#E2553A']].forEach(([dx, dy, col]) => { g.fillStyle = 'rgba(220,240,250,0.85)'; g.fillRect(q[0] + dx * k - 2.4 * k, q[1] + dy * k - 8 * k, 4.8 * k, 8 * k); g.fillStyle = c && c.broken ? '#8A7A6A' : col; g.fillRect(q[0] + dx * k - 2 * k, q[1] + dy * k - 5 * k, 4 * k, 5 * k); g.fillStyle = '#B5172A'; g.fillRect(q[0] + dx * k - 2.6 * k, q[1] + dy * k - 9.6 * k, 5.2 * k, 2 * k); }); }, {layer: 2, zb: 14, top: 24});
  B.custom(1.45, 1.35, (g, P, k) => { const q = P(1.5, 1.42, 12); g.strokeStyle = '#C8A060'; g.lineWidth = 1.2 * k; line(g, [q[0], q[1] - 14 * k], [q[0], q[1] + 4 * k]); for(let i = 0; i < 4; i++){ g.fillStyle = '#F4EFE4'; g.beginPath(); D.ell(g, q[0] + (i % 2 ? 2.6 : -2.6) * k, q[1] - 10 * k + i * 4 * k, 3 * k, 2.6 * k); g.fill(); } }, {layer: 3, zb: 0, top: 30});
  B.drum(1.3, 0.62, 26, 0.05, 14, STEELD); B.cone(1.3, 0.62, 40, 0.1, 5, STEELD);
  pennant(B, L, 1.82, 0.22, 0, 34, {emblem: toque, pole: WOODD});
});
/* ============================ 🐾 DEN — Herb-garden Coop ============================ */
KR('den', {name: 'Herb-garden Coop', h: 84}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, '#C9B287');
  const cp = B.box(0.18, 0.16, 6, 0.9, 0.7, 24, '#F7E1D3'); B.drum(0.26, 0.24, 0, 0.04, 6, WOODD); B.drum(1.0, 0.24, 0, 0.04, 6, WOODD); B.drum(0.26, 0.8, 0, 0.04, 6, WOODD); B.drum(1.0, 0.8, 0, 0.04, 6, WOODD);
  B.decal(cp, 'front', 0.42, 0.24, 0, 14, '#3A2A20', {k: 'door'}); B.decal(cp, 'right', 0.3, 0.3, 10, 9, '#3A2A20');
  trim(B, L, cp, 18, 3, ['front', 'right']); B.roof(0.12, 0.1, 30, 1.02, 0.82, 18, ROOF, {ridge: 'y', ov: 0.1, finials: true});
  B.custom(0.55, 0.9, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const a = P(0.42, 0.92, 6), b2 = P(0.66, 1.36, 0); g.strokeStyle = WOODD; g.lineWidth = 3 * k; line(g, a, b2); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 1 * k; for(let i = 1; i < 5; i++){ const u = i / 5, x = a[0] + (b2[0] - a[0]) * u, y = a[1] + (b2[1] - a[1]) * u; line(g, [x - 2.6 * k, y], [x + 2.6 * k, y]); } }, {layer: 2, zb: 0, top: 8});
  B.custom(1.2, 0.95, (g, P, k, t) => { if(c && c.broken) return; const q = P(1.32, 1.0, 0), bob = Math.sin(ph(t, 1.6)) + Math.cos(ph(t, 1.6)) * 0.5;   // 🐔 a hen + an egg
    g.fillStyle = '#FFFFFF'; g.beginPath(); D.ell(g, q[0], q[1] - 7 * k, 7 * k, 5.6 * k); g.fill(); g.beginPath(); g.arc(q[0] + 5 * k, q[1] - 13 * k + bob * 0.4 * k, 3.6 * k, 0, TAU); g.fill();
    g.fillStyle = '#E2483A'; g.beginPath(); g.arc(q[0] + 5 * k, q[1] - 17 * k + bob * 0.4 * k, 1.6 * k, 0, TAU); g.arc(q[0] + 7 * k, q[1] - 16.6 * k + bob * 0.4 * k, 1.3 * k, 0, TAU); g.fill();
    g.fillStyle = '#F2B731'; g.beginPath(); g.moveTo(q[0] + 8.4 * k, q[1] - 13.4 * k + bob * 0.4 * k); g.lineTo(q[0] + 11 * k, q[1] - 12.6 * k + bob * 0.4 * k); g.lineTo(q[0] + 8.2 * k, q[1] - 11.8 * k + bob * 0.4 * k); g.fill();
    g.fillStyle = '#2A1C14'; g.beginPath(); g.arc(q[0] + 6 * k, q[1] - 13.8 * k + bob * 0.4 * k, 0.8 * k, 0, TAU); g.fill(); g.fillStyle = '#E8E0D0'; g.beginPath(); D.ell(g, q[0] - 3 * k, q[1] - 8 * k, 4 * k, 2.6 * k, -0.4); g.fill();
    egg(g, q[0] - 9 * k, q[1] - 1 * k, 2.6 * k, null); }, {layer: 3, zb: 0, top: 22});
  [[0.16, 1.2, 0.8, 0.34], [1.04, 1.2, 0.8, 0.34], [1.3, 0.2, 0.5, 0.74]].forEach(([x, y, w, d], i) => { const bd = B.box(x, y, 0, w, d, 8, WOOD); B.box(x + 0.04, y + 0.04, 8, w - 0.08, d - 0.08, 1, '#6A4A2A');
    B.custom(x + w / 2, y + d / 2, (g, P, k) => { const n = Math.max(2, Math.round((w + d) * 3)); for(let j = 0; j < n; j++){ const f = (j + 0.5) / n, q = w >= d ? P(x + w * f, y + d / 2, 9) : P(x + w / 2, y + d * f, 9); tuft(g, q[0], q[1], k, 0.8, c, [HERB, HERB2, '#9AD86A'][(i + j) % 3]); } }, {layer: 2, zb: 9, top: 20}); });
  B.custom(1.86, 1.84, (g, P, k) => { const q = P(1.84, 1.86, 0); g.fillStyle = '#5E9AA8'; g.beginPath(); D.ell(g, q[0], q[1] - 6 * k, 5 * k, 6 * k); g.fill(); g.strokeStyle = '#5E9AA8'; g.lineWidth = 1.6 * k; line(g, [q[0] + 4 * k, q[1] - 7 * k], [q[0] + 11 * k, q[1] - 13 * k]); g.beginPath(); g.arc(q[0] - 4 * k, q[1] - 10 * k, 3 * k, Math.PI * 0.6, Math.PI * 1.6); g.stroke(); }, {layer: 3, zb: 0, top: 14});
  pennant(B, L, 1.84, 0.14, 0, 38, {emblem: toque, pole: WOODD});
});
/* ---------- 🟩 territory floor: navy-and-cream checker tiles (clean, not the Horde's red gingham) + a dust of flour + little spice jars + a stray herb leaf ---------- */
addFloor('kitchen', {name: 'Checker tiles + spice jars', top: '#F6EADA', top2: '#EFDFC9', side: '#B8A48A', paint: (g, q, s, i, j) => { const r = hash(i, j, 3), r2 = hash(j, i, 4);
  tileBase(g, q, s, '#F6EADA', '#F3E4D0', r); for(let a = 0; a < 4; a++) for(let b = 0; b < 4; b++){ if((a + b + i + j) % 2) continue; const u0 = 0.04 + a * 0.23, v0 = 0.04 + b * 0.23; polyP(g, [q(u0, v0), q(u0 + 0.23, v0), q(u0 + 0.23, v0 + 0.23), q(u0, v0 + 0.23)]); g.fillStyle = 'rgba(51,64,94,0.42)'; g.fill(); }
  if(r2 > 0.55){ g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); D.ell(g, ...q(0.3 + r * 0.4, 0.4 + r2 * 0.3), 7 * s, 2.6 * s, 0.3); g.fill(); }
  if(r < 0.22){ const p = q(0.62, 0.36 + r2 * 0.3), col = ['#E2553A', '#F2B731', '#7FB24A'][((r * 30) | 0) % 3]; g.fillStyle = 'rgba(220,240,250,0.9)'; g.beginPath(); D.rr(g, p[0] - 2.6 * s, p[1] - 7 * s, 5.2 * s, 7 * s, 1.2 * s); g.fill(); g.fillStyle = col; g.fillRect(p[0] - 2.2 * s, p[1] - 4 * s, 4.4 * s, 4 * s); g.fillStyle = '#B5172A'; g.fillRect(p[0] - 2.8 * s, p[1] - 8.4 * s, 5.6 * s, 1.8 * s); }
  if(r > 0.86){ const p = q(0.3, 0.7); g.fillStyle = HERB; g.beginPath(); D.ell(g, p[0], p[1], 3 * s, 1.3 * s, 0.6); g.fill(); g.beginPath(); D.ell(g, p[0] + 3 * s, p[1] - 1 * s, 2.6 * s, 1.1 * s, -0.4); g.fill(); }
  if(r2 < 0.12){ const p = q(0.72, 0.72); g.fillStyle = '#FFFFFF'; g.beginPath(); D.ell(g, p[0], p[1], 5 * s, 2.4 * s); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.2)'; g.lineWidth = 0.8 * s; g.stroke(); } }});
/* ---------- 🥚🧂🍄 own resource shapes (1 × 1, states full · half · empty) — Props.AR.resKey('kitchen', 'coin' | 'brick' | 'gem') ---------- */
// 🥚 Eggs: a wicker basket heaped with eggs under a checker cloth (half = a few eggs left · empty = shells + a feather)
function basketPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = c && c.broken, wick = br ? '#8A7458' : ['#C8924E', '#B98444', '#D49E5C'][v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = D.sh(wick, -0.25); g.beginPath(); D.ell(g, 0, -12, 17, 7); g.fill();
  if(st !== 'empty'){ const eggs = st === 'full' ? [[-9, -16], [-2, -18], [6, -17], [12, -14], [-5, -12], [3, -12], [10, -10], [-12, -11], [1, -23], [-6, -22], [8, -22]] : [[-6, -14], [4, -13], [-1, -17]];
    eggs.forEach(([ex, ey], i) => egg(g, ex, ey, 4.4, c, {col: i % 4 === 3 ? '#E8C9A0' : EGGW})); }
  else { g.fillStyle = 'rgba(60,40,20,0.35)'; g.beginPath(); D.ell(g, 0, -12, 13, 4.6); g.fill(); [[-6, -13], [5, -12]].forEach(([sx, sy]) => { g.fillStyle = '#F4EAD8'; g.beginPath(); g.moveTo(sx - 3, sy); g.lineTo(sx - 1.5, sy - 3); g.lineTo(sx, sy - 1); g.lineTo(sx + 1.6, sy - 3.4); g.lineTo(sx + 3, sy); g.closePath(); g.fill(); }); }
  g.fillStyle = wick; g.beginPath(); g.moveTo(-17, -12); g.quadraticCurveTo(-16, 2, 0, 3); g.quadraticCurveTo(16, 2, 17, -12); g.quadraticCurveTo(0, -5, -17, -12); g.fill();
  g.strokeStyle = 'rgba(80,46,20,0.45)'; g.lineWidth = 0.9; for(let i = -3; i <= 3; i++){ g.beginPath(); g.moveTo(i * 4.6, -7); g.quadraticCurveTo(i * 4.8, -2, i * 4.2, 2); g.stroke(); } [-6, -2].forEach(yy => { g.beginPath(); g.moveTo(-15.5, yy - 3); g.quadraticCurveTo(0, yy + 4, 15.5, yy - 3); g.stroke(); });
  g.strokeStyle = wick; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-14, -13); g.quadraticCurveTo(0, -38, 14, -13); g.stroke(); g.strokeStyle = 'rgba(80,46,20,0.4)'; g.lineWidth = 0.8; g.stroke();
  if(st === 'full'){ g.fillStyle = br ? '#9A8070' : TOMATO; g.beginPath(); g.moveTo(9, -13); g.lineTo(20, -9); g.lineTo(17, 0); g.lineTo(8, -4); g.closePath(); g.fill(); g.fillStyle = '#FFFFFF'; [[11, -10], [15, -8], [12, -5], [16, -3]].forEach(([sx, sy]) => g.fillRect(sx, sy, 2, 2)); }
  if(st === 'empty'){ g.strokeStyle = '#E8E0D0'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(14, 2); g.quadraticCurveTo(18, -2, 22, -4); g.stroke(); g.fillStyle = '#F4EFE4'; g.beginPath(); D.ell(g, 19, -2.6, 3.6, 1.4, -0.5); g.fill(); }
  if(!br && st === 'full'){ g.fillStyle = 'rgba(255,255,255,0.95)'; D.star(g, -11, -28, 2.6, 1, 4); g.fill(); D.star(g, 13, -30, 2, 0.8, 4); g.fill(); }
  g.restore(); }
// 🧂 Spice: three open burlap sacks heaped with paprika · turmeric · pepper + a wooden scoop (half = low heaps · empty = flat sacks)
function sackPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = c && c.broken, sc = st === 'full' ? 1 : st === 'half' ? 0.55 : 0.12, burl = br ? '#9A8A70' : '#D2B07A'; g.save(); g.translate(x, y); g.scale(k * (v % 3 === 1 ? -1 : 1), k);
  const sacks = [[-9, -2, 8.5, br ? '#8A5040' : '#D9452E'], [8, -1, 8, br ? '#9A8A50' : '#F2B12E'], [0, 5, 8.5, br ? '#5A4A40' : '#5A3A2A']];
  sacks.forEach(([sx, sy, r, spice], i) => { const h = 14 * (st === 'empty' ? 0.45 : 1);
    g.fillStyle = D.sh(burl, -0.05); g.beginPath(); g.moveTo(sx - r, sy); g.quadraticCurveTo(sx - r - 2, sy - h * 0.6, sx - r + 1, sy - h); g.lineTo(sx + r - 1, sy - h); g.quadraticCurveTo(sx + r + 2, sy - h * 0.6, sx + r, sy); g.quadraticCurveTo(sx, sy + 3, sx - r, sy); g.fill();
    g.strokeStyle = 'rgba(100,70,30,0.35)'; g.lineWidth = 0.8; for(let j = 1; j < 4; j++){ g.beginPath(); g.moveTo(sx - r + 1, sy - h * j / 4); g.quadraticCurveTo(sx, sy - h * j / 4 + 1.6, sx + r - 1, sy - h * j / 4); g.stroke(); }
    g.fillStyle = D.sh(burl, 0.12); g.beginPath(); D.ell(g, sx, sy - h, r + 1.2, 3.2); g.fill(); g.fillStyle = D.sh(burl, -0.3); g.beginPath(); D.ell(g, sx, sy - h + 0.4, r - 0.6, 2.2); g.fill();
    if(st !== 'empty'){ g.fillStyle = D.rad(g, sx - 2, sy - h - 6 * sc, 0.5, r * 1.3, [[0, D.sh(spice, 0.3)], [0.7, spice], [1, D.sh(spice, -0.25)]]); g.beginPath(); g.moveTo(sx - r + 1.4, sy - h); g.quadraticCurveTo(sx - 2, sy - h - 12 * sc, sx, sy - h - 12 * sc); g.quadraticCurveTo(sx + 2, sy - h - 12 * sc, sx + r - 1.4, sy - h); g.closePath(); g.fill();
      if(!br) for(let j = 0; j < 4; j++){ g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(sx - 3 + j * 2, sy - h - 3 * sc - (j % 2) * 3 * sc, 0.7, 0, TAU); g.fill(); } } });
  if(st === 'full'){ g.strokeStyle = '#8A5A34'; g.lineWidth = 1.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(14, -22); g.lineTo(6, -12); g.stroke(); g.fillStyle = '#C99257'; g.beginPath(); D.ell(g, 4, -10, 4, 2.6, -0.6); g.fill(); g.fillStyle = br ? '#8A5040' : '#D9452E'; g.beginPath(); D.ell(g, 4, -10.6, 2.6, 1.4, -0.6); g.fill(); }
  if(st !== 'full') [[-17, 6], [16, 7], [-4, 10]].forEach(([sx, sy], i) => { g.fillStyle = [br ? '#8A5040' : '#D9452E', '#F2B12E', '#5A3A2A'][i]; g.beginPath(); D.ell(g, sx, sy, 2.4, 1); g.fill(); });
  g.restore(); }
// 🍄 Golden Truffles: a dark soil mound with gold truffles poking out + sparkles (half = 2 left · empty = dug holes + a little trowel)
function trufflePaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = c && c.broken, R2 = rnd(41 + v * 13); g.save(); g.translate(x, y); g.scale(k, k);
  const soil = br ? '#6A5A50' : '#6A4A30'; g.fillStyle = D.rad(g, -4, -10, 1, 22, [[0, D.sh(soil, 0.25)], [0.7, soil], [1, D.sh(soil, -0.25)]]); g.beginPath(); g.moveTo(-19, 2); g.quadraticCurveTo(-16, -14, 0, -15); g.quadraticCurveTo(16, -14, 19, 2); g.quadraticCurveTo(0, 6, -19, 2); g.fill();
  g.fillStyle = 'rgba(40,24,12,0.35)'; for(let i = 0; i < 10; i++){ g.beginPath(); g.arc(-14 + R2() * 28, -10 + R2() * 12, 0.9 + R2(), 0, TAU); g.fill(); }
  [[-12, -3, 0.7], [11, -2, 0.8], [-2, -13, 0.6]].forEach(([lx, ly, s]) => { g.fillStyle = br ? '#7A7A5A' : HERB2; g.beginPath(); D.ell(g, lx, ly - 3 * s, 1.6, 4 * s, -0.3); g.fill(); g.beginPath(); D.ell(g, lx + 2, ly - 3 * s, 1.6, 3.6 * s, 0.4); g.fill(); });
  const T3 = st === 'full' ? [[-7, -10, 5.2], [3, -12, 6], [9, -6, 4.6], [-2, -5, 4.4], [-11, -4, 3.6]] : st === 'half' ? [[-4, -9, 5], [7, -6, 4.2]] : [];
  T3.forEach(([tx, ty, r], i) => { const col = br ? '#9A8A60' : '#F2C23A'; g.fillStyle = D.rad(g, tx - r * 0.4, ty - r * 0.5, 0.5, r * 1.6, [[0, br ? '#C8B890' : '#FFF4C2'], [0.45, col], [1, br ? '#6A5A40' : '#B07A1A']]); g.beginPath();
    for(let j = 0; j < 9; j++){ const a = j / 9 * TAU, rr = r * (0.86 + 0.14 * ((j * 7 + i) % 3) / 2); j ? g.lineTo(tx + Math.cos(a) * rr, ty + Math.sin(a) * rr * 0.9) : g.moveTo(tx + Math.cos(a) * rr, ty + Math.sin(a) * rr * 0.9); } g.closePath(); g.fill();
    g.fillStyle = 'rgba(120,70,10,0.35)'; for(let j = 0; j < 4; j++){ g.beginPath(); g.arc(tx + (j - 1.5) * r * 0.4, ty + ((j % 2) - 0.3) * r * 0.4, 0.7, 0, TAU); g.fill(); } });
  if(st === 'empty'){ [[-6, -8], [6, -6]].forEach(([hx, hy]) => { g.fillStyle = '#2A1C14'; g.beginPath(); D.ell(g, hx, hy, 4.4, 2.2); g.fill(); g.fillStyle = D.sh(soil, 0.2); g.beginPath(); D.ell(g, hx + 5, hy + 1, 2.6, 1.2); g.fill(); });
    g.strokeStyle = '#8A5A34'; g.lineWidth = 1.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(14, -16); g.lineTo(10, -8); g.stroke(); g.fillStyle = STEEL; g.beginPath(); g.moveTo(10, -8); g.lineTo(7, -4); g.lineTo(9, -1); g.lineTo(12, -6); g.closePath(); g.fill(); }
  if(!br && st !== 'empty'){ g.fillStyle = 'rgba(255,255,255,0.95)'; D.star(g, 10, -20, 3, 1.1, 4); g.fill(); D.star(g, -12, -16, 2.2, 0.8, 4); g.fill(); if(st === 'full'){ D.star(g, 2, -24, 2.6, 0.9, 4); g.fill(); } }
  g.restore(); }
const RES = (slot, name, h, tag, paint) => organic('kitchen', 'kitchen_' + slot, {name, look: 'kitchen', side: 'kitchen', slot, kind: 'thing', foot: [1, 1], h, variants: 3, block: true, states: ['full', 'half', 'empty'], state: 'full', dead: 'keep',
  tags: ['ar', 'ar-res', 'resource', tag, 'ar-kitchen'], conds: {'*': (g, x, y, k, t, v, c, L) => paint(g, x, y, k, t, v, L, c)}}, (g, x, y, k, t, v, L) => paint(g, x, y, k, t, v, L, null));
RES('coin', 'Egg basket', 40, 'coin', basketPaint); RES('brick', 'Spice sacks', 34, 'brick', sackPaint); RES('gem', 'Golden truffles', 30, 'gem', trufflePaint);
/* ---------- 🧱 walls: 🔲 a tiled counter wall with a steel top + little spice jars · posts = salt shakers ·
   gate = two tiled pillars + a wood beam with a noren over half-height swing doors · 🏯 tall = an oven-brick rampart + salt-shaker towers + a chef-hat gatehouse ---------- */
(function(){ const {wallProp, gateProp, gateDoors, longFaces, WT, WP, tallWallProp, tallGateProp, blocks} = K.AR;
  function jar(B, x, y, z, col){ B.drum(x, y, z, 0.05, 6, '#DCEFF6'); B.drum(x, y, z + 6, 0.055, 2, TOMATO); B.custom(x, y, (g, P, k) => { const q = P(x, y, z + 1); g.fillStyle = col; g.beginPath(); g.ellipse(q[0], q[1] - 1.5 * k, 2 * k, 2.6 * k, 0, 0, TAU); g.fill(); }, {layer: 1, zb: z, top: z + 5}); }
  function shaker(B, L, x, y, z0, r, h, c, hole){ const br = c && c.broken; B.drum(x, y, z0, r, h * 0.82, '#EEF6FA', {rings: 0}); B.custom(x, y, (g, P, k) => { const q = P(x, y, z0), rx = r * HTW * k * S2;   // glass body with salt inside + a team band
      g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.ellipse(q[0], q[1], rx * 0.82, rx * 0.41, 0, 0, Math.PI); g.lineTo(q[0] - rx * 0.82, q[1] - h * 0.5 * k); g.ellipse(q[0], q[1] - h * 0.5 * k, rx * 0.82, rx * 0.41, 0, Math.PI, 0, true); g.closePath(); g.fill();
      const col = br ? '#6A6060' : teamOf(L), z1 = h * 0.6; g.fillStyle = col; g.beginPath(); g.ellipse(q[0], q[1] - z1 * k, rx, rx / 2, 0, 0, Math.PI); g.lineTo(q[0] - rx, q[1] - (z1 + 5) * k); g.ellipse(q[0], q[1] - (z1 + 5) * k, rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(q[0] - rx * 0.6, q[1] - h * 0.78 * k, rx * 0.16, h * 0.6 * k); }, {layer: 1, zb: z0, top: z0 + h * 0.82});
    if(!br){ B.custom(x, y, (g, P, k) => { dome(g, P, k, x, y, z0 + h * 0.82, r * 1.02, h * 0.3, STEEL); if(hole){ const q = P(x, y, z0 + h * 1.06); g.fillStyle = '#3A3A42'; [[-2, 0], [2, 0], [0, -1.6]].forEach(([dx, dy]) => { g.beginPath(); g.arc(q[0] + dx * k, q[1] + dy * k, 0.9 * k, 0, TAU); g.fill(); }); } }, {layer: 2, zb: z0 + h * 0.82, top: z0 + h * 1.12}); } }
  const skin = {name: 'Counter wall', gateName: 'Swing-door gate', h: 44, gateH: 88,
    seg(B, L, r, c, v){ const [x, y, w, d, ax] = r, H = 22, b = B.box(x, y, 0, w, d, H, TILE), len = ax === 'x' ? w : d;
      longFaces(ax).concat(ax === 'x' ? ['right', 'left'] : ['front', 'back']).forEach((s, i) => { const ln = s === 'front' || s === 'back' ? w : d; B.decal(b, s, ...F(b, s), 0, H, TILE, {paint: tiles(H, TILE, Math.max(1, Math.round(ln * 7)), 5.5, {seed: 9 + i})}); B.decal(b, s, ...F(b, s), 0, 5, TOMATO, {paint: checker(5, TOMATO, '#FFFFFF', Math.max(2, Math.round(ln * 10)), 1)}); });
      trim(B, L, b, 13, 3, longFaces(ax)); const e = 0.03; B.box(ax === 'x' ? x : x - e, ax === 'x' ? y - e : y, H, ax === 'x' ? w : w + 2 * e, ax === 'x' ? d + 2 * e : d, 3, STEEL);
      if(!(c && c.broken)){ const n = Math.max(1, Math.round(len / 0.34)); for(let i = 0; i < n; i++){ if((i + Math.round((x + y) * 10)) % 2) continue; const p = (ax === 'x' ? x : y) + (i + 0.5) * len / n; jar(B, ax === 'x' ? p : 0.5, ax === 'x' ? 0.5 : p, H + 3, ['#E2553A', '#F2B731', '#7FB24A'][i % 3]); } } },
    post(B, L, kind, c){ shaker(B, L, 0.5, 0.5, 0, 0.17, 36, c, true); },
    gate(B, L, open, c, v){ const t = 0.2, H = 52;
      [[0.02, 0.24], [0.74, 0.24]].forEach(([x0, w]) => { const pb = tiled(B, x0, 0.5 - t, 0, w, 2 * t, H, TILE, 61 + x0 * 10); trim(B, L, pb, 40, 3); });
      B.box(0.02, 0.5 - 0.08, H, 0.96, 0.16, 5, WOODD);
      gateDoors(B, open, c, 22, '#E2B07A', COPPERD, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.9 * k; for(let z = 4; z < 20; z += 3.4) line(g, Q(0.08, z), Q(0.92, z)); }});
      if(!(c && c.broken)) B.custom(0.5, 0.5, (g, P, k, t, T2) => { const fr = vis(T2, 0, 1) ? 0.62 : vis(T2, 0, -1) ? 0.38 : null; if(fr == null) return; const z1 = H - 1, col = NAVY;   // 🎌 noren over the doorway (seen side)
        for(let i = 0; i < 3; i++){ const u0 = 0.26 + i * 0.16 + 0.006, u1 = u0 + 0.148; polyP(g, [P(u0, fr, z1), P(u1, fr, z1), P(u1, fr, z1 - 14), P(u0, fr, z1 - 14)]); g.fillStyle = D.sh(col, i % 2 ? -0.05 : 0.05); g.fill(); }
        const m = P(0.5, fr, z1 - 7); toque(g, m[0], m[1], 3.6 * k, '#FFFFFF'); }, {layer: 3, zb: H - 15, top: H});
      if(!(c && c.broken)) [[0.14], [0.86]].forEach(([x]) => pennant(B, L, x, 0.5, H + 5, 20, {w: 11, hh: 7, emblem: toque})); } };
  wallProp('kitchen', 'kitchen', skin); gateProp('kitchen', 'kitchen', skin);
  const tall = {name: 'Oven-brick rampart', gateName: 'Chef-hat gatehouse', base: 30, h: 118, gateH: 122,
    rampart(B, L, r, c, hb){ const [x, y, w, d, ax] = r, e = 0.08, b = ax === 'x' ? B.box(x, y - e, 0, w, d + 2 * e, hb, BRICK) : B.box(x - e, y, 0, w + 2 * e, d, hb, BRICK);
      ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, hb, BRICK, {paint: blocks(hb, BRICK, 31 + Math.round((x + y) * 10), 5)})); },
    tower(B, L, c, cx, cy, hb, kind, hw){ const br = c && c.broken, bb = B.box(cx - hw, cy - hw, 0, 2 * hw, 2 * hw, hb, BRICKD); ['front', 'right', 'left', 'back'].forEach(s => B.decal(bb, s, ...F(bb, s), 0, hb, BRICKD, {paint: blocks(hb, BRICKD, 41 + Math.round(cx * 10), 5)}));
      shaker(B, L, cx, cy, hb, hw * 0.92, br ? 26 : (kind === 'gate' ? 40 : 52), c, true);
      if(!br) pennant(B, L, cx, cy, hb + (kind === 'gate' ? 52 : 66), kind === 'gate' ? 12 : 16, {w: 11, hh: 7, emblem: toque}); },
    gatehouse(B, L, open, c, hb){ const br = c && c.broken, z0 = 44, t = 0.18;
      gateDoors(B, open, c, 40, '#E2B07A', COPPERD, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.9 * k; for(let z = 4; z < 38; z += 4) line(g, Q(0.08, z), Q(0.92, z)); }});
      const b = tiled(B, 0.26, 0.5 - t, z0, 0.48, 2 * t, br ? 6 : 14, TILE, 71, {skirt: false}); if(br) return; trim(B, L, b, 6, 3, ['front', 'back']);
      B.drum(0.5, 0.5, z0 + 14, 0.2, 9, '#FFFFFF'); B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, z0 + 23); [[-7, -2, 6], [7, -2, 6], [0, -8, 7.4]].forEach(([dx, dy, r]) => { g.fillStyle = D.rad(g, q[0] + dx * k - 2 * k, q[1] + dy * k - 3 * k, 0.5, r * 1.4 * k, [[0, '#FFFFFF'], [1, '#D7D2CC']]); g.beginPath(); g.arc(q[0] + dx * k, q[1] + dy * k, r * k, 0, TAU); g.fill(); }); }, {layer: 3, zb: z0 + 23, top: z0 + 40}); } };
  tallWallProp('kitchen', 'kitchen', skin, tall); tallGateProp('kitchen', 'kitchen', skin, tall);
})();
})();
K.loaded('kitchen', 'ip-4f');
})(window.Props && window.Props._K);
