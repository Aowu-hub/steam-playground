
/* 🌍 IsoLook_toybox — 🧸 Toybox Troop — AvataRealm side ④a on the 🏘️ village: 11 buildings · own floor · own resource shapes (token bucket · block stack · marble bag) · own walls · 🏺 The First Teddy origin relic (needs realm) — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['toybox'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/toybox.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_toybox: include IsoProps first'); return; }
if(!K.AR){ console.warn('IsoLook_toybox: load IsoLook_realm first (Props.need does it)'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🧸 toybox · Toybox Troop (AvataRealm side ④a, ip-4f pictures, 🌳 IsoProps chat 2026-11-20).
   Built ON the 🏘️ village (the starter jungle look, no stilts — its palms, bushes, rocks, flowers, 🍂 versions) — a TOY-ROOM town grown big:
   painted wooden building blocks (each with a drawn star · heart · circle · triangle, never letters or numbers), cardboard, tin soldiers, wind-up keys,
   stacking rings, felt + plush stitches, ribbons — primary toy colours (v 1 = the pastel toy set) + 🏰 realm (team colours · 🏗️ site steps · slots · walls).
   11 buildings = AvataRealm §14a: 🏠 shoebox → block house → Block Castle · 🏕️ Toy-soldier Box · 🎠 Rocking-horse Carousel · 🪽 Paper-plane Runway ·
   🩹 Plush Hospital · 🔧 Train-set Depot · 🗼 Jack-in-the-box Tower · 🎨 Doll Wardrobe · 🔮 Music Box · 🕵️ Puzzle Box · 🐾 Teddy Kennel.
   Own resource shapes: 🪙 toybox_coin = a sand bucket of toy tokens · 🧱 toybox_brick = a stack of building blocks · 🔮 toybox_gem = a marble bag.
   Own floor (a woven play rug + a crayon, a jack, a marble, a star sticker now and then) and own walls (🧱 block wall · 🛢️ round block posts + a ball ·
   🌈 stacking-ring arch gate · 🏯 big-block rampart + party-hat towers + 🥁 toy-drum gatehouse). Keys toybox_<slot>. No words / numbers in the art.
   🔍 every prop has def.diffs (ip-5): v 1 = the pastel toy set (bold) · house levels · resource states · gates open / shut. */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, halo} = T;
const {pennant, banner, trim, building, addSide, addFloor, tileBase, hash, teamOf, patOf, inkOf} = K.AR;
const D = PD, TAU = Math.PI * 2, S2 = Math.SQRT2;
const WOOD = '#E8C08A', WOODL = '#F6DCB2', WOODD = '#B8854F', CARD = '#D9B07A', CARDD = '#B48A52', CREAM = '#FFF4DC', INK = '#3A2A30', TIN = '#B8C2CC', TIND = '#7A8490',
  GOLD = '#F2B731', GOLDD = '#B8801E', WHITE = '#FFFFFF', PLUSH = '#FFB8C8', PLUSHD = '#E88AA2', MINTP = '#A8E6CF', SKY = '#CFEFFF', NAVY = '#2E3A66';
// 🎨 the toy paint set — v 0 = primary · v 1 = pastel (the same toys, a softer paint box)
const PAINT = [{a: '#E8453C', b: '#3D7FD9', c: '#FFC83D', d: '#4DB860', e: '#9B5BD6'}, {a: '#FF9EB8', b: '#8FC8F0', c: '#FFE08A', d: '#9EE0B0', e: '#C9A8F0'}];
const pt = v => PAINT[(v | 0) % 2];
const dead = c => c && c.broken, dim = (c, col, f) => c ? (c.broken ? D.sh(col, -0.42) : D.sh(col, f == null ? -0.18 : f)) : col;
const still = c => !!(c && c.still), tw = (t, i, p) => 0.55 + 0.3 * Math.sin(ph(t, p || 2.4) + i * 1.7) + 0.15 * Math.cos(ph(t, p || 2.4) + i * 0.9);
const team = (c, L) => dead(c) ? '#8A8090' : teamOf(L);
// 🧸 the side's emblem: a teddy-bear head (round face + two round ears)
function teddyEm(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); g.arc(x, y + r * 0.15, r * 0.78, 0, TAU); g.fill(); [-1, 1].forEach(s => { g.beginPath(); g.arc(x + s * r * 0.62, y - r * 0.48, r * 0.36, 0, TAU); g.fill(); }); }
addSide('toybox', {name: 'Toybox Troop', icon: '🧸', look: 'toybox', accent: PAINT[0].a, emblem: teddyEm, base: 'village'});
addLook('toybox', {name: 'Toybox Troop', walls: [WOOD, CREAM, CARD], roofs: [PAINT[0].a, PAINT[0].b, PAINT[0].c], trim: '#5A3418', accent: PAINT[0].a, stilts: false, team: null, side: 'toybox',
  res: {coin: GOLD, coinDk: GOLDD, rock: '#C8A878', brick: PAINT[0].a, brickDk: '#A82A22', leaf: PAINT[0].d, bark: WOODD, gem: '#6EC8FF', gemDk: '#2A6AB8', gemHi: WHITE}}, 'jungle');
/* ---------- 🖌️ Toybox painters ---------- */
// a painted shape in FACE space (u 0..1 across the decal, z px up) — mapped with Q so it lies ON the face (rz = ru × face px width)
function faceShape(g, Q, kind, cu, cz, ru, rz, col){ const pts = [];
  if(kind === 'circle') for(let i = 0; i < 22; i++){ const a = i / 22 * TAU; pts.push(Q(cu + Math.cos(a) * ru, cz + Math.sin(a) * rz)); }
  else if(kind === 'star') for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.45 : 1; pts.push(Q(cu + Math.cos(a) * ru * r, cz - Math.sin(a) * rz * r)); }
  else if(kind === 'heart') for(let i = 0; i < 26; i++){ const a = i / 26 * TAU, x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); pts.push(Q(cu + x / 17 * ru, cz + (y + 2) / 17 * rz)); }
  else if(kind === 'tri') pts.push(Q(cu, cz + rz), Q(cu + ru, cz - rz * 0.8), Q(cu - ru, cz - rz * 0.8));
  else if(kind === 'moon'){ for(let i = 0; i <= 14; i++){ const a = -Math.PI / 2 + i / 14 * Math.PI; pts.push(Q(cu + Math.cos(a) * ru, cz + Math.sin(a) * rz)); } for(let i = 14; i >= 0; i--){ const a = -Math.PI / 2 + i / 14 * Math.PI; pts.push(Q(cu + Math.cos(a) * ru * 0.35, cz + Math.sin(a) * rz * 0.8)); } }
  else { pts.push(Q(cu - ru * 0.8, cz - rz * 0.8), Q(cu + ru * 0.8, cz - rz * 0.8), Q(cu + ru * 0.8, cz + rz * 0.8), Q(cu - ru * 0.8, cz + rz * 0.8)); }
  polyP(g, pts); g.fillStyle = col; g.fill(); }
const SHAPES = ['star', 'heart', 'circle', 'tri', 'moon', 'square'];
// 🟥 a wooden toy block face: a bevel frame + one drawn shape (decal paint) — aw = the face width in tiles (keeps the shape round)
const blockFace = (h, col, kind, ink, aw) => (g, Q, k) => { polyP(g, [Q(0.08, h * 0.1), Q(0.92, h * 0.1), Q(0.92, h * 0.9), Q(0.08, h * 0.9)]); g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1.3 * k; g.stroke();
  const ru = 0.3, rz = Math.min(h * 0.32, ru * (aw || 0.5) * 40); faceShape(g, Q, kind, 0.5, h / 2, ru, rz, ink); };
// a whole face built of toy blocks in rows (decal paint): every block its own colour + shape (cells ≈ 0.5 tile × rowH px)
const blockWall = (h, v, seed, aw, rowH, c) => (g, Q, k) => { const R = rnd(seed || 5), P0 = pt(v), cols = [P0.a, P0.b, P0.c, P0.d], rh = rowH || 16, n = Math.max(1, Math.round((aw || 1) / 0.5));
  for(let z = 0, row = 0; z < h - 0.5; z += rh, row++){ const zh = Math.min(rh, h - z), off = row % 2 ? 0.5 / n : 0;
    for(let i = -1; i < n; i++){ const u0 = Math.max(0, i / n + off), u1 = Math.min(1, (i + 1) / n + off); if(u1 <= u0 + 0.02) continue; const col = dim(c, cols[Math.floor(R() * 4)]);
      polyP(g, [Q(u0 + 0.004, z + 0.6), Q(u1 - 0.004, z + 0.6), Q(u1 - 0.004, z + zh - 0.6), Q(u0 + 0.004, z + zh - 0.6)]); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(58,42,48,0.35)'; g.lineWidth = 0.9 * k; g.stroke();
      if(zh > rh * 0.7 && u1 - u0 > 0.6 / n){ const cu = (u0 + u1) / 2, ru = (u1 - u0) * 0.26, rz = Math.min(zh * 0.3, ru * (aw || 1) * 40); faceShape(g, Q, SHAPES[Math.floor(R() * 6)], cu, z + zh / 2, ru, rz, dead(c) ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)'); } } } };
// a single toy block (a cube in model space) with a shape on its two seen faces
function toyBlock(B, x, y, z, s, h, col, kind, c, o){ o = o || {}; const b = B.box(x, y, z, s, s, h, dim(c, col), o);
  ['front', 'right', 'left', 'back'].forEach((sd, i) => B.decal(b, sd, ...F(b, sd), 0, h, dim(c, col), {paint: blockFace(h, col, SHAPES[(SHAPES.indexOf(kind) + i) % 6], dead(c) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)', s)})); return b; }
// a cardboard face: a corrugated edge line + a crayon doodle (decal paint)
const cardFace = (h, col, seed, doodle) => (g, Q, k) => { const R = rnd(seed || 3); g.strokeStyle = 'rgba(110,70,30,0.28)'; g.lineWidth = 0.8 * k; line(g, Q(0, h - 3), Q(1, h - 3)); line(g, Q(0, 3), Q(1, 3));
  if(doodle){ g.strokeStyle = doodle; g.lineWidth = 1.4 * k; g.lineCap = 'round'; const cu = 0.2 + R() * 0.6, cz = h * 0.55; g.beginPath(); for(let i = 0; i <= 12; i++){ const a = i / 12 * TAU, p = Q(cu + Math.cos(a) * 0.08, cz + Math.sin(a) * h * 0.14 + (R() - 0.5) * 1.5); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke();
    for(let i = 0; i < 6; i++){ const a = i / 6 * TAU, p0 = Q(cu + Math.cos(a) * 0.1, cz + Math.sin(a) * h * 0.18), p1 = Q(cu + Math.cos(a) * 0.15, cz + Math.sin(a) * h * 0.28); line(g, p0, p1); } } };
// a crayon-drawn window (decal paint) — wobbly frame + a cross, glows warm when lit
const crayonWin = (h, c, col) => (g, Q, k) => { const lv = lightOf(c); polyP(g, [Q(0.05, 1), Q(0.95, 1.4), Q(0.92, h - 1), Q(0.08, h - 1.4)]); g.fillStyle = lv === 1 ? '#FFF2B8' : lv ? '#D8C890' : '#3A3440'; g.fill();
  g.strokeStyle = col || INK; g.lineWidth = 1.5 * k; g.lineCap = 'round'; g.stroke(); line(g, Q(0.5, 1.2), Q(0.5, h - 1.2)); line(g, Q(0.06, h / 2), Q(0.94, h / 2 + 0.6)); };
// an arched door (decal paint): dark opening with a rounded top + a frame in col
const archDoor = (h, col, c, inner) => (g, Q, k) => { const pts = [Q(0, 0), Q(1, 0)]; for(let i = 0; i <= 12; i++){ const a = i / 12 * Math.PI; pts.push(Q(0.5 + Math.cos(a) * 0.5, h * 0.62 + Math.sin(a) * h * 0.38)); }
  polyP(g, pts); g.fillStyle = dim(c, col); g.fill(); const p2 = [Q(0.16, 0), Q(0.84, 0)]; for(let i = 0; i <= 12; i++){ const a = i / 12 * Math.PI; p2.push(Q(0.5 + Math.cos(a) * 0.34, h * 0.6 + Math.sin(a) * h * 0.3)); } polyP(g, p2); g.fillStyle = inner || '#4A3440'; g.fill(); };
// 🔑 a wind-up key (screen space) seen side-on, turning: a shaft + a two-loop bow (a = turn angle → the bow gets thin as it turns away)
function windKey(g, x, y, s, a, col, c){ const sq = Math.cos(a), cl = dim(c, col || GOLD); g.strokeStyle = D.sh(cl, -0.3); g.lineWidth = 2.4 * s; g.lineCap = 'round'; line(g, [x, y], [x + 7 * s, y - 3.5 * s]);
  g.save(); g.translate(x + 9 * s, y - 4.5 * s); g.rotate(-0.46); g.scale(1, Math.max(0.12, Math.abs(sq))); g.fillStyle = cl; [-1, 1].forEach(sd => { g.beginPath(); g.ellipse(0, sd * 5 * s, 3.4 * s, 4.6 * s, 0, 0, TAU); g.fill(); });
  g.fillStyle = D.sh(cl, -0.35); [-1, 1].forEach(sd => { g.beginPath(); g.ellipse(0, sd * 5 * s, 1.4 * s, 2 * s, 0, 0, TAU); g.fill(); }); g.fillStyle = D.sh(cl, 0.35); g.fillRect(-1 * s, -1.4 * s, 2 * s, 2.8 * s); g.restore(); }
// 🧸 a little teddy bear (screen space, sitting; wave = arm lift 0..1, o.band = a bandage arm)
function teddy(g, x, y, s, col, c, wave, o){ o = o || {}; const cl = dim(c, col || '#C8864A'), dk = D.sh(cl, -0.25), lt = D.sh(cl, 0.3);
  g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, x, y, 9 * s, 3 * s); g.fill();
  g.fillStyle = dk; [-1, 1].forEach(sd => { g.beginPath(); D.ell(g, x + sd * 5 * s, y - 2 * s, 3.4 * s, 2.6 * s); g.fill(); });
  g.fillStyle = cl; g.beginPath(); D.ell(g, x, y - 8 * s, 6.6 * s, 7 * s); g.fill(); g.fillStyle = lt; g.beginPath(); D.ell(g, x, y - 7 * s, 3.8 * s, 4.2 * s); g.fill();
  g.fillStyle = cl; g.beginPath(); D.ell(g, x - 6.4 * s, y - 9 * s, 2.4 * s, 4 * s); g.fill();
  g.save(); g.translate(x + 5.6 * s, y - 12 * s); g.rotate(-0.4 - (wave || 0) * 1.6); g.fillStyle = cl; g.beginPath(); D.ell(g, 0, 3.4 * s, 2.4 * s, 4.2 * s); g.fill(); if(o.band){ g.fillStyle = CREAM; g.fillRect(-2.6 * s, 2 * s, 5.2 * s, 2.4 * s); } g.restore();
  g.fillStyle = cl; g.beginPath(); g.arc(x, y - 19 * s, 6.4 * s, 0, TAU); g.fill(); [-1, 1].forEach(sd => { g.beginPath(); g.arc(x + sd * 5 * s, y - 24 * s, 2.6 * s, 0, TAU); g.fill(); g.fillStyle = lt; g.beginPath(); g.arc(x + sd * 5 * s, y - 24 * s, 1.3 * s, 0, TAU); g.fill(); g.fillStyle = cl; });
  g.fillStyle = lt; g.beginPath(); D.ell(g, x, y - 17 * s, 3.2 * s, 2.4 * s); g.fill(); g.fillStyle = INK; g.beginPath(); D.ell(g, x, y - 18 * s, 1.3 * s, 0.9 * s); g.fill();
  if(dead(c)){ g.strokeStyle = INK; g.lineWidth = 0.9 * s; [-1, 1].forEach(sd => { line(g, [x + sd * 2.4 * s - 1 * s, y - 21 * s], [x + sd * 2.4 * s + 1 * s, y - 20 * s]); }); }
  else [-1, 1].forEach(sd => { g.beginPath(); g.arc(x + sd * 2.4 * s, y - 20.6 * s, 0.9 * s, 0, TAU); g.fill(); });
  if(o.bow){ g.fillStyle = o.bow; [-1, 1].forEach(sd => { g.beginPath(); g.moveTo(x, y - 13 * s); g.lineTo(x + sd * 3.4 * s, y - 15 * s); g.lineTo(x + sd * 3.4 * s, y - 11 * s); g.closePath(); g.fill(); }); } }
// 💂 a tin toy soldier (screen space, standing; b = bob px; team = the plume + the sash)
function soldier(g, x, y, s, c, b, tcol, coat){ const br = dead(c), yy = y - (b || 0) * s;
  g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, x, y, 5 * s, 1.8 * s); g.fill();
  g.fillStyle = dim(c, NAVY); g.fillRect(x - 3 * s, yy - 10 * s, 2.6 * s, 10 * s); g.fillRect(x + 0.4 * s, yy - 10 * s, 2.6 * s, 10 * s);
  g.fillStyle = dim(c, coat || '#E8453C'); g.beginPath(); D.rr(g, x - 4 * s, yy - 20 * s, 8 * s, 11 * s, 1.6 * s); g.fill();
  g.strokeStyle = br ? '#B8B0A8' : WHITE; g.lineWidth = 1.2 * s; line(g, [x - 3.6 * s, yy - 19.5 * s], [x + 3.6 * s, yy - 10.5 * s]); g.strokeStyle = br ? '#8A8090' : tcol; g.lineWidth = 1.6 * s; line(g, [x + 3.6 * s, yy - 19.5 * s], [x - 3.6 * s, yy - 10.5 * s]);
  g.fillStyle = dim(c, GOLD); [yy - 17 * s, yy - 14 * s].forEach(py => { g.beginPath(); g.arc(x, py, 0.7 * s, 0, TAU); g.fill(); });
  g.fillStyle = '#F6CFA8'; g.beginPath(); g.arc(x, yy - 23 * s, 3 * s, 0, TAU); g.fill(); g.fillStyle = '#E8787A'; [-1, 1].forEach(sd => { g.beginPath(); g.arc(x + sd * 1.8 * s, yy - 22 * s, 0.8 * s, 0, TAU); g.fill(); });
  g.fillStyle = INK; [-1, 1].forEach(sd => { g.beginPath(); g.arc(x + sd * 1.1 * s, yy - 23.4 * s, 0.5 * s, 0, TAU); g.fill(); });
  g.fillStyle = dim(c, '#2A2430'); g.beginPath(); D.rr(g, x - 3.2 * s, yy - 32 * s, 6.4 * s, 8 * s, 1.2 * s); g.fill(); g.fillStyle = dim(c, GOLD); g.fillRect(x - 3.2 * s, yy - 26.4 * s, 6.4 * s, 1.2 * s);
  if(!br){ g.fillStyle = tcol; g.beginPath(); D.ell(g, x + 1.6 * s, yy - 34 * s, 1.6 * s, 3 * s); g.fill(); } }
// 🐴 a little rocking horse (screen space) — dir 1 faces right, -1 left; rock = −1..1
function rockHorse(g, x, y, s, col, mane, c, rock, dir){ g.save(); g.translate(x, y); g.scale(dir || 1, 1); g.rotate((rock || 0) * 0.16);
  g.strokeStyle = dim(c, WOODD); g.lineWidth = 2 * s; g.beginPath(); g.arc(0, -40 * s, 40 * s, Math.PI * 0.4, Math.PI * 0.6); g.stroke();
  g.strokeStyle = dim(c, WOOD); g.lineWidth = 1.3 * s; [-7, 7].forEach(dx => line(g, [dx * s, -1.5 * s], [dx * 0.7 * s, -7 * s]));
  const cl = dim(c, col); g.fillStyle = cl; g.beginPath(); D.ell(g, 0, -9 * s, 8.5 * s, 4 * s); g.fill(); g.beginPath(); g.moveTo(5 * s, -11 * s); g.lineTo(9 * s, -18 * s); g.lineTo(13 * s, -17 * s); g.lineTo(9 * s, -10 * s); g.closePath(); g.fill();
  g.beginPath(); D.ell(g, 12 * s, -17 * s, 3.6 * s, 2.4 * s); g.fill(); g.fillStyle = dim(c, mane); g.beginPath(); g.moveTo(8 * s, -19 * s); g.quadraticCurveTo(5 * s, -14 * s, 4 * s, -11 * s); g.lineTo(6 * s, -11 * s); g.quadraticCurveTo(8 * s, -15 * s, 10 * s, -19 * s); g.fill();
  g.beginPath(); g.moveTo(-8 * s, -10 * s); g.quadraticCurveTo(-12 * s, -8 * s, -11 * s, -3 * s); g.lineTo(-9 * s, -8 * s); g.fill();
  g.fillStyle = INK; g.beginPath(); g.arc(12 * s, -18 * s, 0.7 * s, 0, TAU); g.fill(); g.fillStyle = dim(c, GOLD); g.fillRect(-2 * s, -13.5 * s, 4 * s, 2 * s); g.restore(); }
// a striped cone canopy (party hat / carousel top) in world space — n wedges alternating A / Bc, only the front half drawn (a cone is convex), + a scalloped hem
function stripeCone(g, P, k, cx, cy, z, r, h, A, Bc, n, o){ o = o || {}; const c0 = P(cx, cy, z), rx = r * HTW * k * S2, ry = rx / 2, ap = [c0[0], c0[1] - h * k], rot = o.rot || 0;
  const pt2 = a => [c0[0] + Math.cos(a) * rx, c0[1] + Math.sin(a) * ry]; const N = n * 2;
  for(let i = 0; i < N; i++){ let a0 = rot + i / N * TAU, a1 = rot + (i + 1) / N * TAU; const m = (a0 + a1) / 2; if(Math.sin(m) < -0.2) continue;
    const sh = -Math.cos(m) * 0.12 - 0.02; polyP(g, [ap, pt2(a0), pt2(a1)]); g.fillStyle = D.sh(i % 2 ? Bc : A, sh); g.fill(); }
  if(o.hem !== false){ g.fillStyle = D.sh(o.hemCol || A, -0.05); for(let i = 0; i < N; i++){ const a = rot + (i + 0.5) / N * TAU; if(Math.sin(a) < 0) continue; const p = pt2(a); g.beginPath(); g.arc(p[0], p[1], Math.max(1.2, rx * 0.12), 0, Math.PI); g.fill(); } }
  g.fillStyle = o.knob || GOLD; g.beginPath(); g.arc(ap[0], ap[1], 2.4 * k, 0, TAU); g.fill(); return ap; }
// 🔴 a round block post (drum) with a ball on top — the wall posts + little props
function ballPost(B, c, x, y, z, r, h, col, ball, layer){ B.drum(x, y, z, r, h, dim(c, col), {rings: 0}); if(dead(c)) return;
  B.custom(x, y, (g, P, k) => { const q = P(x, y, z + h), R = r * HTW * k * S2 * 0.95; g.fillStyle = D.rad(g, q[0] - R * 0.35, q[1] - R * 1.3, R * 0.15, R * 1.2, [[0, D.sh(ball, 0.5)], [0.55, dim(c, ball)], [1, D.sh(ball, -0.3)]]); g.beginPath(); g.arc(q[0], q[1] - R * 0.85, R, 0, TAU); g.fill(); }, {layer: layer || 3, zb: z + h, top: z + h + r * 60}); }
// 🎵 a music note (screen space): note head + stem + flag (a symbol, not a letter)
function note(g, x, y, s, col, two){ g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 1.2 * s; g.beginPath(); g.ellipse(x, y, 2.4 * s, 1.7 * s, -0.4, 0, TAU); g.fill(); line(g, [x + 2.1 * s, y - 0.6 * s], [x + 2.1 * s, y - 9 * s]);
  if(two){ g.beginPath(); g.ellipse(x + 6 * s, y - 1.4 * s, 2.4 * s, 1.7 * s, -0.4, 0, TAU); g.fill(); line(g, [x + 8.1 * s, y - 2 * s], [x + 8.1 * s, y - 10.4 * s]); g.lineWidth = 2 * s; line(g, [x + 2.1 * s, y - 9 * s], [x + 8.1 * s, y - 10.4 * s]); }
  else { g.beginPath(); g.moveTo(x + 2.1 * s, y - 9 * s); g.quadraticCurveTo(x + 6 * s, y - 7 * s, x + 4.6 * s, y - 3.6 * s); g.stroke(); } }
// a team band round a drum (copied from Gearhaven, ip-4e) — the team colour + pattern on round towers
function drumBand(B, L, c, x, y, z, r, h, o){ B.custom(x, y, (g, P, k) => { const r2 = P(x, y, z + h), rx = r * HTW * k * S2, col = dead(c) ? '#8A8090' : teamOf(L);
    g.fillStyle = col; g.beginPath(); g.ellipse(r2[0], r2[1] + h * k, rx, rx / 2, 0, 0, Math.PI); g.lineTo(r2[0] - rx, r2[1]); g.ellipse(r2[0], r2[1], rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill();
    if(!dead(c)) K.AR.patPaint(g, (s, vv) => { const u = -1 + s / (rx * 2 / k) * 2; return [r2[0] + u * rx, r2[1] + h * k + Math.sqrt(Math.max(0, 1 - u * u)) * rx / 2 - vv * k]; }, rx * 2 / k, h, patOf(L), inkOf(col), k); }, Object.assign({layer: 1, zb: z, top: z + h}, o || {})); }
// a little ground toy (deco): a ball · a crayon · a jack · a spinning top — seeded
function groundToy(B, x, y, c, seed, v){ B.custom(x, y, (g, P, k) => { const q = P(x, y, 0), R = rnd(seed || 4), P0 = pt(v), kind = Math.floor(R() * 4);
    g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, q[0], q[1], 7 * k, 2.6 * k); g.fill();
    if(kind === 0){ const col = dim(c, P0.a); g.fillStyle = D.rad(g, q[0] - 2 * k, q[1] - 7 * k, 0.5, 6 * k, [[0, D.sh(col, 0.5)], [0.6, col], [1, D.sh(col, -0.3)]]); g.beginPath(); g.arc(q[0], q[1] - 4.6 * k, 4.6 * k, 0, TAU); g.fill(); g.fillStyle = dim(c, WHITE); g.fillRect(q[0] - 4.6 * k, q[1] - 5.2 * k, 9.2 * k, 1.4 * k); }
    else if(kind === 1){ g.save(); g.translate(q[0], q[1] - 1.6 * k); g.rotate(-0.35); g.fillStyle = dim(c, P0.b); g.fillRect(-7 * k, -1.6 * k, 12 * k, 3.2 * k); g.fillStyle = CREAM; g.fillRect(-3 * k, -1.6 * k, 4 * k, 3.2 * k); g.fillStyle = dim(c, P0.b); g.beginPath(); g.moveTo(5 * k, -1.6 * k); g.lineTo(8.4 * k, 0); g.lineTo(5 * k, 1.6 * k); g.fill(); g.restore(); }
    else if(kind === 2){ g.strokeStyle = dim(c, TIN); g.lineWidth = 1.4 * k; g.lineCap = 'round'; [0, 1, 2].forEach(i => { const a = i * Math.PI / 3; line(g, [q[0] - Math.cos(a) * 4.6 * k, q[1] - 2 * k - Math.sin(a) * 2.6 * k], [q[0] + Math.cos(a) * 4.6 * k, q[1] - 2 * k + Math.sin(a) * 2.6 * k]); }); g.fillStyle = dim(c, P0.a); g.beginPath(); g.arc(q[0], q[1] - 2 * k, 1.4 * k, 0, TAU); g.fill(); }
    else { g.fillStyle = dim(c, P0.d); g.beginPath(); g.moveTo(q[0], q[1] - 0.4 * k); g.lineTo(q[0] - 5 * k, q[1] - 5 * k); g.lineTo(q[0] + 5 * k, q[1] - 5 * k); g.closePath(); g.fill(); g.fillStyle = dim(c, P0.c); g.beginPath(); D.ell(g, q[0], q[1] - 5.6 * k, 5.2 * k, 2 * k); g.fill(); g.fillStyle = dim(c, WOODD); g.fillRect(q[0] - 0.7 * k, q[1] - 9.4 * k, 1.4 * k, 3.6 * k); } }, {layer: 3, zb: 0, top: 10}); }
const TB_ = (slot, o, build) => building('toybox', slot, Object.assign({variants: 2}, o), build);
const POLE = '#5A3418';
/* ============================ 🏠 HOUSE — 3 levels, each a new SHAPE ============================ */
TB_('house', {name: 'Block Castle', h: 140, names: {'1': 'Shoebox', '2': 'Block House', '3': 'Block Castle'}, live: {period: 2.4, frames: 6},
  diffs: [{by: 'state', a: '1', b: '2', level: 'bold', name: 'shoebox → block house'}, {by: 'state', a: '2', b: '3', level: 'bold', name: 'block house → Block Castle'}, {by: 'v', level: 'bold', name: 'toy paint (primary ↔ pastel)'}]}, (B, v, L) => { const c = L.cond, lv = L.state || '1', P0 = pt(v);
  if(lv === '1'){ // 📦 a shoebox house: a cardboard box with its lid on as a roof, a cut-out arched door, crayon windows, a toy ball + a crayon out front
    B.flat(0.1, 0.1, 2.8, 1.8, WOODL);
    const s = B.box(0.45, 0.35, 0, 2.0, 1.2, dead(c) ? 16 : 32, CARD);
    ['front', 'right', 'left', 'back'].forEach((sd, i) => B.decal(s, sd, ...F(s, sd), 0, dead(c) ? 16 : 32, CARD, {paint: cardFace(dead(c) ? 16 : 32, CARD, 3 + i, i === 1 ? dim(c, P0.a) : null)}));
    B.decal(s, 'front', 1.2, 0.55, 0, 24, CARDD, {k: 'door', paint: archDoor(24, CARDD, c)});
    [0.6, 1.95].forEach(a => B.decal(s, 'front', a, 0.36, 12, 12, '#FFF2B8', {paint: crayonWin(12, c, dim(c, P0.b))}));
    trim(B, L, s, 22, 3);
    if(!dead(c)){ const lid = B.box(0.4, 0.3, 32, 2.1, 1.3, 7, dim(c, P0.b)); ['front', 'right'].forEach(sd => B.decal(lid, sd, ...F(lid, sd), 0, 7, P0.b, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1 * k; line(g, Q(0, 3), Q(1, 3)); }}));
      B.custom(1.45, 0.95, (g, P, k) => { const q = P(1.45, 0.95, 39); g.fillStyle = dim(c, P0.c); g.beginPath(); D.star(g, q[0], q[1] - 1 * k, 7 * k, 3 * k, 5); g.fill(); g.strokeStyle = dim(c, WHITE); g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(q[0] - 26 * k, q[1] + 4 * k); g.quadraticCurveTo(q[0] - 12 * k, q[1] - 6 * k, q[0] - 4 * k, q[1] + 2 * k); g.quadraticCurveTo(q[0] + 6 * k, q[1] + 10 * k, q[0] + 22 * k, q[1] + 2 * k); g.stroke(); }, {layer: 3, zb: 39, top: 48}); }
    B.custom(0.4, 1.6, (g, P, k, t) => { const q = P(0.4, 1.6, 0), b = still(c) ? 0 : Math.max(0, Math.sin(ph(t, 2.4))) * 6 + (Math.cos(ph(t, 2.4)) + 1) * 0.8, col = dim(c, P0.a);   // ⚽ a bouncing ball
      g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, q[0], q[1], 6 * k, 2.2 * k); g.fill(); const y = q[1] - 5 * k - b * k; g.fillStyle = D.rad(g, q[0] - 2 * k, y - 2 * k, 0.5, 6 * k, [[0, D.sh(col, 0.5)], [0.6, col], [1, D.sh(col, -0.3)]]); g.beginPath(); g.arc(q[0], y, 5 * k, 0, TAU); g.fill();
      g.fillStyle = dim(c, WHITE); g.beginPath(); g.ellipse(q[0], y, 5 * k, 1.3 * k, 0, 0, TAU); g.fill(); }, {layer: 3, zb: 0, top: 20});
    groundToy(B, 2.7, 1.6, c, 7, v);
    pennant(B, L, 2.75, 0.3, 0, 48, {emblem: teddyEm, pole: POLE});
    return; }
  if(lv === '2'){ // 🧱 a block house: walls made of painted toy blocks, a big red triangle block roof, an arch block door, a round block chimney with a ball
    B.flat(0.1, 0.1, 2.8, 1.8, WOODL);
    const H = dead(c) ? 22 : 44, s = B.box(0.3, 0.3, 0, 2.3, 1.3, H, WOOD);
    ['front', 'right', 'left', 'back'].forEach((sd, i) => B.decal(s, sd, ...F(s, sd), 0, H, WOOD, {paint: blockWall(H, v, 21 + i, sd === 'front' || sd === 'back' ? 2.3 : 1.3, 15, c)}));
    B.decal(s, 'front', 1.17, 0.56, 0, 28, dim(c, P0.c), {k: 'door', paint: archDoor(28, P0.c, c)});
    [0.48, 2.07].forEach(a => B.decal(s, 'front', a, 0.36, 18, 12, '#FFF2B8', {paint: crayonWin(12, c, INK)})); B.decal(s, 'right', 0.75, 0.36, 18, 12, '#FFF2B8', {paint: crayonWin(12, c, INK)});
    trim(B, L, s, 32, 4);
    if(!dead(c)){ const rf = dim(c, P0.a); B.roof(0.2, 0.2, H, 2.5, 1.5, 30, rf, {ridge: 'x', ov: 0.06, kind: 'gable'});
      B.custom(2.7, 0.95, (g, P, k) => { const a = P(2.7, 0.95, H + 4), b2 = P(2.7, 0.95, H + 22); faceShapeScreen(g, a[0] + 1 * k, (a[1] + b2[1]) / 2 + 3 * k, 6 * k, 'circle', dim(c, P0.c)); }, {layer: 4, zb: H, top: H + 24});
      ballPost(B, c, 0.75, 0.6, H + 8, 0.14, 26, P0.b, P0.c, 5);
      B.custom(0.75, 0.6, (g, P, k, t) => { if(still(c)) return; const q = P(0.75, 0.6, H + 46); T.puffs(g, q[0], q[1], k, t, {n: 3, rise: 18, period: 2.4, r: 2.2, col: 'rgba(255,255,255,0.8)'}); }, {layer: 6, zb: H + 40, top: H + 70, fx: true}); }
    toyBlockPile(B, c, 2.6, 1.65, v, 31);
    pennant(B, L, 0.22, 1.75, 0, 52, {emblem: teddyEm, pole: POLE});
    return; }
  // 🏰 L3 Block Castle: a keep of painted blocks, 4 round block towers under striped party-hat roofs, a low front wall with block merlons, a drawbridge door, a toy crown on the keep + a turning wind-up key
  const br = dead(c), KH = br ? 40 : 70;
  const kp = B.box(0.8, 0.45, 0, 1.4, 0.95, KH, WOOD);
  ['front', 'right', 'left', 'back'].forEach((sd, i) => B.decal(kp, sd, ...F(kp, sd), 0, KH, WOOD, {paint: blockWall(KH, v, 41 + i, sd === 'front' || sd === 'back' ? 1.4 : 0.95, 17, c)}));
  [1.05, 1.7].forEach(a => B.decal(kp, 'front', a, 0.26, KH - 30, 14, '#FFF2B8', {paint: crayonWin(14, c, INK)})); B.decal(kp, 'right', 0.75, 0.26, KH - 30, 14, '#FFF2B8', {paint: crayonWin(14, c, INK)});
  trim(B, L, kp, KH - 12, 4);
  if(!br){ for(let i = 0; i < 4; i++) toyBlock(B, 0.8 + i * 0.37, 0.45, KH, 0.29, 10, [P0.a, P0.c, P0.b, P0.d][i], SHAPES[i], c); for(let i = 1; i < 3; i++) toyBlock(B, 0.8, 0.45 + i * 0.33, KH, 0.29, 10, [P0.d, P0.a][i - 1], SHAPES[i + 2], c);
    for(let i = 1; i < 3; i++) toyBlock(B, 1.91, 0.45 + i * 0.33, KH, 0.29, 10, [P0.c, P0.b][i - 1], SHAPES[i], c); }
  const fw = B.box(0.35, 1.45, 0, 2.3, 0.3, br ? 12 : 26, WOOD); ['front', 'right', 'left', 'back'].forEach((sd, i) => B.decal(fw, sd, ...F(fw, sd), 0, br ? 12 : 26, WOOD, {paint: blockWall(br ? 12 : 26, v, 51 + i, sd === 'front' || sd === 'back' ? 2.3 : 0.3, 13, c)}));
  trim(B, L, fw, br ? 4 : 16, 3);
  if(!br) for(let i = 0; i < 5; i++) if(i !== 2) toyBlock(B, 0.42 + i * 0.44, 1.48, 26, 0.24, 8, [P0.b, P0.a, P0.c, P0.d, P0.a][i], SHAPES[i], c);
  B.decal(fw, 'front', 1.18, 0.64, 0, 24, '#3A2A30', {k: 'door', paint: (g, Q, k) => { polyP(g, [Q(0, 0), Q(1, 0), Q(1, 22), Q(0, 22)]); g.fillStyle = '#3A2A30'; g.fill(); }});
  B.custom(1.5, 1.95, (g, P, k) => { const a = P(1.18, 1.75, 0), b2 = P(1.82, 1.75, 0), c2 = P(1.82, 2.05, 0), d2 = P(1.18, 2.05, 0), pl = dim(c, WOODD);   // 🪵 the drawbridge, down, with two chains
    polyP(g, [a, b2, c2, d2]); g.fillStyle = pl; g.fill(); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 0.9 * k; for(let i = 1; i < 5; i++){ const f = i / 5; line(g, [a[0] + (b2[0] - a[0]) * f, a[1] + (b2[1] - a[1]) * f], [d2[0] + (c2[0] - d2[0]) * f, d2[1] + (c2[1] - d2[1]) * f]); }
    if(!br){ g.strokeStyle = TIND; g.lineWidth = 1.2 * k; g.setLineDash([1.6 * k, 1 * k]); line(g, d2, P(1.22, 1.75, 22)); line(g, c2, P(1.78, 1.75, 22)); g.setLineDash([]); } }, {layer: -1, zb: 0, top: 24});
  [[0.42, 0.42, 0], [2.58, 0.42, 1], [0.42, 1.6, 2], [2.58, 1.6, 3]].forEach(([x, y, i]) => { const H2 = br ? 30 : (i < 2 ? 92 : 64), col = [P0.b, P0.d, P0.c, P0.e][i];
    B.drum(x, y, 0, 0.3, H2, dim(c, col), {rings: 3}); drumBand(B, L, c, x, y, H2 - 12, 0.3, 5, {layer: 2});
    B.custom(x, y, (g, P, k) => { const q = P(x, y + 0.3, H2 * 0.55); g.fillStyle = lightOf(c) ? '#FFF2B8' : '#3A3440'; g.beginPath(); D.rr(g, q[0] - 2.4 * k, q[1] - 5 * k, 4.8 * k, 8 * k, 2.4 * k); g.fill(); }, {layer: 2, zb: H2 * 0.4, top: H2 * 0.7});
    if(br) return; B.custom(x, y, (g, P, k) => { stripeCone(g, P, k, x, y, H2, 0.36, i < 2 ? 34 : 28, dim(c, i % 2 ? P0.a : P0.c), dim(c, WHITE), 4, {hemCol: i % 2 ? P0.a : P0.c}); }, {layer: 3, zb: H2, top: H2 + 36});
    if(i < 2) pennant(B, L, x, y, H2 + (i < 2 ? 34 : 28), 12, {w: 11, hh: 7, emblem: teddyEm, pole: POLE, layer: 6}); });
  if(!br){ B.custom(1.5, 0.92, (g, P, k, t) => { const q = P(1.5, 0.92, KH + 10), b = still(c) ? 0 : Math.sin(ph(t, 2.4)) * 1.2 + Math.cos(ph(t, 2.4)) * 0.5, y = q[1] - 8 * k - b * k;   // 👑 a big toy crown on the keep
      g.fillStyle = dim(c, GOLD); g.beginPath(); g.moveTo(q[0] - 14 * k, y + 8 * k); g.lineTo(q[0] - 14 * k, y - 6 * k); g.lineTo(q[0] - 7 * k, y + 1 * k); g.lineTo(q[0], y - 10 * k); g.lineTo(q[0] + 7 * k, y + 1 * k); g.lineTo(q[0] + 14 * k, y - 6 * k); g.lineTo(q[0] + 14 * k, y + 8 * k); g.closePath(); g.fill();
      g.fillStyle = D.sh(GOLD, -0.25); g.fillRect(q[0] - 14 * k, y + 4 * k, 28 * k, 4 * k); [[-14, -6, P0.a], [0, -10, P0.b], [14, -6, P0.d]].forEach(([dx, dy, col]) => { g.fillStyle = col; g.beginPath(); g.arc(q[0] + dx * k, y + dy * k, 2.4 * k, 0, TAU); g.fill(); });
      g.fillStyle = teamOf(L); g.beginPath(); g.arc(q[0], y + 6 * k, 2.2 * k, 0, TAU); g.fill(); }, {layer: 5, zb: KH + 10, top: KH + 36});
    B.custom(2.2, 0.9, (g, P, k, t) => { const q = P(2.2, 0.9, KH * 0.5); windKey(g, q[0], q[1], k * 1.3, still(c) ? 0.4 : ph(t, 2.4) / 3, GOLD, c); }, {layer: 3, zb: KH * 0.4, top: KH * 0.5 + 20}); }
  banner(B, L, kp, 'front', 1.3, 0.38, KH - 40, 22, teddyEm);
});
// a shape in plain screen space (for gable ends)
function faceShapeScreen(g, x, y, r, kind, col){ faceShape(g, (u, z) => [x + (u - 0.5) * 2 * r, y - (z - 0) ], kind, 0.5, 0, 0.5, r, col); }
// a little pile of 3 toy blocks on the ground
function toyBlockPile(B, c, x, y, v, seed){ const P0 = pt(v); toyBlock(B, x - 0.2, y - 0.15, 0, 0.22, 9, P0.b, 'star', c, {layer: 1}); toyBlock(B, x + 0.05, y - 0.15, 0, 0.22, 9, P0.c, 'heart', c, {layer: 1}); if(!dead(c)) toyBlock(B, x - 0.08, y - 0.15, 9, 0.22, 9, P0.a, 'circle', c, {layer: 2}); }
/* ============================ 🏕️ CAMP — Toy-soldier Box (a big open toy chest, a row of tin soldiers marching on the spot, a toy drum) ============================ */
TB_('camp', {name: 'Toy-soldier Box', h: 82, live: {period: 1.2, frames: 6}, diffs: [{by: 'v', level: 'bold', name: 'toy paint (primary ↔ pastel)'}]}, (B, v, L) => { const c = L.cond, P0 = pt(v), br = dead(c);
  B.flat(0.06, 0.06, 1.88, 1.88, WOODL);
  const ch = B.box(0.25, 0.2, 0, 1.5, 0.7, 26, dim(c, P0.b)); ['front', 'right', 'left', 'back'].forEach(sd => B.decal(ch, sd, ...F(ch, sd), 0, 26, P0.b, {paint: (g, Q, k) => { g.fillStyle = dim(c, GOLD);
    [[0, 0], [0.92, 0], [0, 22], [0.92, 22]].forEach(([u, z]) => { polyP(g, [Q(u, z), Q(u + 0.08, z), Q(u + 0.08, z + 4), Q(u, z + 4)]); g.fill(); }); g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1.2 * k; line(g, Q(0.08, 13), Q(0.92, 13)); faceShape(g, Q, 'star', 0.5, 13, 0.08, 6, dim(c, P0.c)); }}));
  trim(B, L, ch, 18, 3);
  B.custom(1.0, 0.2, (g, P, k) => { const a = P(0.25, 0.2, 26), b2 = P(1.75, 0.2, 26), lift = br ? 6 : 26, c2 = P(1.75, 0.02, 26 + lift), d2 = P(0.25, 0.02, 26 + lift);   // the lid, swung open behind
    polyP(g, [a, b2, c2, d2]); g.fillStyle = dim(c, D.sh(P0.b, 0.1)); g.fill(); g.strokeStyle = dim(c, GOLD); g.lineWidth = 1.6 * k; line(g, [(a[0] + d2[0]) / 2, (a[1] + d2[1]) / 2], [(b2[0] + c2[0]) / 2, (b2[1] + c2[1]) / 2]); }, {layer: -1, zb: 26, top: 54});
  B.custom(1.0, 0.55, (g, P, k) => { const q = P(1.0, 0.55, 26); g.fillStyle = '#4A3440'; g.beginPath(); D.ell(g, q[0], q[1], 30 * k, 9 * k); g.fill(); if(br) return; [[-16, P0.c], [-4, P0.a], [9, P0.d], [20, P0.e]].forEach(([dx, col]) => { g.fillStyle = dim(c, col); g.beginPath(); g.arc(q[0] + dx * k, q[1] - 3 * k, 4 * k, 0, TAU); g.fill(); }); }, {layer: 2, zb: 20, top: 32});
  [[0.5, 1.35, 0], [0.95, 1.5, 1], [1.4, 1.65, 2]].forEach(([x, y, i]) => B.custom(x, y, (g, P, k, t) => { const q = P(x, y, 0), b = still(c) || br ? 0 : Math.max(0, Math.sin(ph(t, 1.2) + i * 2.1)) * 2.4 + Math.max(0, Math.cos(ph(t, 1.2) + i * 1.3)) * 0.8;   // 💂 tin soldiers marching on the spot
    if(br && i === 1){ g.save(); g.translate(q[0], q[1] - 3 * k); g.rotate(1.35); soldier(g, 0, 0, k * 1.05, c, 0, '#8A8090', P0.a); g.restore(); return; } soldier(g, q[0], q[1], k * 1.05, c, b, teamOf(L), i === 1 ? P0.b : P0.a); }, {layer: 3, zb: 0, top: 40}));
  B.custom(1.7, 0.95, (g, P, k, t) => { const q = P(1.7, 0.95, 0), hit = still(c) || br ? 0 : Math.max(0, Math.sin(ph(t, 1.2) * 2 + Math.cos(ph(t, 1.2)))) * 3;   // 🥁 a toy drum + sticks
    g.fillStyle = dim(c, P0.a); g.beginPath(); g.ellipse(q[0], q[1] - 3 * k, 8 * k, 3.6 * k, 0, 0, Math.PI); g.lineTo(q[0] - 8 * k, q[1] - 13 * k); g.ellipse(q[0], q[1] - 13 * k, 8 * k, 3.6 * k, 0, Math.PI, 0, true); g.closePath(); g.fill();
    g.strokeStyle = dim(c, GOLD); g.lineWidth = 1 * k; g.beginPath(); for(let i = 0; i <= 6; i++){ const x2 = q[0] - 8 * k + i * 16 / 6 * k, y2 = q[1] - (i % 2 ? 12 : 4) * k + (i % 2 ? 0 : 1) * k; i ? g.lineTo(x2, y2) : g.moveTo(x2, y2); } g.stroke();
    g.fillStyle = dim(c, CREAM); g.beginPath(); D.ell(g, q[0], q[1] - 13 * k, 8 * k, 3.6 * k); g.fill(); if(br) return; g.strokeStyle = WOODD; g.lineWidth = 1.4 * k; line(g, [q[0] - 2 * k, q[1] - 14 * k - hit * k], [q[0] - 10 * k, q[1] - 22 * k - hit * k]); line(g, [q[0] + 3 * k, q[1] - 14 * k], [q[0] + 10 * k, q[1] - 23 * k]); }, {layer: 3, zb: 0, top: 26});
  pennant(B, L, 1.85, 1.75, 0, 50, {emblem: teddyEm, pole: POLE});
});
/* ============================ 🎠 RIDE — Rocking-horse Carousel (a round block base, a striped canopy, 4 rocking horses going round + up and down) ============================ */
TB_('ride', {name: 'Rocking-horse Carousel', h: 112, live: {period: 2.4, frames: 6}, diffs: [{by: 'v', level: 'bold', name: 'toy paint (primary ↔ pastel)'}]}, (B, v, L) => { const c = L.cond, P0 = pt(v), br = dead(c);
  B.flat(0.06, 0.06, 1.88, 2.88, WOODL);
  B.drum(1, 1.45, 0, 0.88, 9, dim(c, P0.b), {rings: 1}); drumBand(B, L, c, 1, 1.45, 1, 0.88, 5);
  B.custom(1, 1.45, (g, P, k) => { const q = P(1, 1.45, 9), rx = 0.88 * HTW * k * S2; g.fillStyle = dim(c, CREAM); g.beginPath(); D.ell(g, q[0], q[1], rx * 0.98, rx * 0.49); g.fill(); g.strokeStyle = dim(c, P0.c); g.lineWidth = 2 * k; g.beginPath(); D.ell(g, q[0], q[1], rx * 0.62, rx * 0.31); g.stroke(); }, {layer: 1, zb: 9, top: 10});
  const CZ = br ? 38 : 70; B.drum(1, 1.45, 9, 0.12, CZ - 9, dim(c, P0.c), {rings: 4});
  B.custom(1, 1.45, (g, P, k, t) => { const q = P(1, 1.45, 9), rx = 0.66 * HTW * k * S2, ry = rx / 2, spin = still(c) || br ? 0.4 : ph(t, 2.4) / 4, list = [];   // 🐴 4 rocking horses on poles, going round
    for(let i = 0; i < 4; i++){ const a = spin + i * TAU / 4; list.push([Math.sin(a), a, i]); } list.sort((p, q2) => p[0] - q2[0]);
    list.forEach(([sn, a, i]) => { if(br && i % 2) return; const x = q[0] + Math.cos(a) * rx, y = q[1] + Math.sin(a) * ry, up = br ? 0 : Math.sin(a * 2 + i) * 4 * k, top = P(1, 1.45, CZ)[1];
      g.strokeStyle = dim(c, GOLD); g.lineWidth = 1.6 * k; line(g, [x, y - up], [x, top + (y - q[1]) * 0.6]); rockHorse(g, x, y - 4 * k - up, k * 1.05, [P0.a, WHITE, P0.d, P0.e][i], [P0.c, P0.b, P0.c, P0.c][i], c, Math.sin(a * 3), Math.cos(a) > 0 ? -1 : 1); }); }, {layer: 3, zb: 9, top: CZ});
  if(!br){ B.custom(1, 1.45, (g, P, k, t) => { stripeCone(g, P, k, 1, 1.45, CZ, 0.95, 30, dim(c, P0.a), dim(c, WHITE), 6, {rot: still(c) ? 0 : ph(t, 2.4) / 12, hemCol: P0.c}); }, {layer: 4, zb: CZ, top: CZ + 32});
    B.custom(1, 1.45, (g, P, k) => { const q = P(1, 1.45, CZ), rx = 0.95 * HTW * k * S2; g.fillStyle = dim(c, GOLD); g.beginPath(); g.ellipse(q[0], q[1], rx, rx / 2, 0, 0, Math.PI); g.lineTo(q[0] - rx, q[1] - 3 * k); g.ellipse(q[0], q[1] - 3 * k, rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill();
      for(let i = 0; i < 9; i++){ const a = i / 8 * Math.PI; g.fillStyle = i % 2 ? '#FFF2B8' : '#FFD86A'; g.beginPath(); g.arc(q[0] + Math.cos(a) * rx, q[1] + Math.sin(a) * rx / 2 - 1.5 * k, 1.3 * k, 0, TAU); g.fill(); } }, {layer: 4, zb: CZ - 3, top: CZ + 1});
    pennant(B, L, 1, 1.45, CZ + 30, 12, {w: 12, hh: 7, emblem: teddyEm, pole: POLE, layer: 6}); }
  groundToy(B, 1.75, 2.75, c, 11, v);
  pennant(B, L, 0.25, 2.75, 0, 48, {emblem: teddyEm, pole: POLE});
});
/* ============================ 🪽 NEST — Paper-plane Runway (a runway with dashes, a block launch ramp, a stack of paper, a paper plane looping, a ribbon wind sock) ============================ */
TB_('nest', {name: 'Paper-plane Runway', h: 104, live: {period: 2.4, frames: 6}, diffs: [{by: 'v', level: 'bold', name: 'toy paint (primary ↔ pastel)'}]}, (B, v, L) => { const c = L.cond, P0 = pt(v), br = dead(c);
  B.flat(0.06, 0.06, 1.88, 1.88, WOODL);
  B.custom(1, 1, (g, P, k) => { const a = P(0.15, 0.7, 0), b2 = P(1.85, 0.7, 0), c2 = P(1.85, 1.3, 0), d2 = P(0.15, 1.3, 0); polyP(g, [a, b2, c2, d2]); g.fillStyle = dim(c, '#5A6070'); g.fill();   // the runway strip
    g.strokeStyle = dim(c, WHITE); g.lineWidth = 1.6 * k; g.setLineDash([5 * k, 4 * k]); line(g, P(0.25, 1, 0), P(1.75, 1, 0)); g.setLineDash([]); g.fillStyle = dim(c, P0.c); [0.2, 0.5, 0.8, 1.1, 1.4, 1.7].forEach(x => { [0.74, 1.26].forEach(y => { const p = P(x, y, 0); g.beginPath(); g.arc(p[0], p[1], 1.3 * k, 0, TAU); g.fill(); }); }); }, {layer: -1, zb: 0, top: 1});
  [[0, 0.62, P0.a], [1, 0.42, P0.c], [2, 0.22, P0.b]].forEach(([i, s, col]) => toyBlock(B, 0.2 + i * 0.22, 0.15, 0, 0.36, 8 + i * 9, col, SHAPES[i], c));   // a stepped block launch ramp
  B.custom(1.6, 0.35, (g, P, k) => { const q = P(1.6, 0.35, 0); for(let i = 0; i < 6; i++){ g.fillStyle = i % 2 ? dim(c, '#F4F4F4') : dim(c, WHITE); g.beginPath(); g.moveTo(q[0] - 10 * k, q[1] - i * 1.6 * k); g.lineTo(q[0], q[1] - 4.6 * k - i * 1.6 * k); g.lineTo(q[0] + 10 * k, q[1] - i * 1.6 * k); g.lineTo(q[0], q[1] + 4.6 * k - i * 1.6 * k); g.closePath(); g.fill(); g.strokeStyle = 'rgba(90,90,110,0.35)'; g.lineWidth = 0.6 * k; g.stroke(); } }, {layer: 3, zb: 0, top: 12});
  B.custom(1, 1, (g, P, k, t) => { if(br){ const q = P(1.3, 1.5, 0); plane(g, q[0], q[1] - 2 * k, k * 1.1, 0.5, P0, teamOf(L), c, true); return; }   // ✈️ a paper plane flying a loop over the runway (live)
    const a = still(c) ? 0.8 : ph(t, 2.4), q = P(1, 1, 48), x = q[0] + Math.cos(a) * 26 * k, y = q[1] + Math.sin(a) * 12 * k - 8 * k + Math.cos(a * 2) * 2 * k, dir = -Math.sin(a);
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1 * k; g.setLineDash([2 * k, 2 * k]); g.beginPath(); for(let i = 1; i < 6; i++){ const b = a - i * 0.18, xx = q[0] + Math.cos(b) * 26 * k, yy = q[1] + Math.sin(b) * 12 * k - 8 * k + Math.cos(b * 2) * 2 * k; i === 1 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke(); g.setLineDash([]);
    plane(g, x, y, k * 1.2, dir >= 0 ? 1 : -1, P0, teamOf(L), c); }, {layer: 6, zb: 30, top: 96});
  B.custom(1.75, 1.7, (g, P, k, t) => { const q = P(1.75, 1.7, 0), fl = still(c) ? 0 : Math.sin(ph(t, 2.4)) * 2 + Math.cos(ph(t, 2.4)) * 1; g.strokeStyle = POLE; g.lineWidth = 1.8 * k; line(g, q, [q[0], q[1] - 40 * k]); if(br) return;   // 🎀 a ribbon wind sock
    [P0.a, P0.c, P0.b].forEach((col, i) => { g.strokeStyle = col; g.lineWidth = 2.4 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(q[0], q[1] - 38 * k + i * 2.4 * k); g.quadraticCurveTo(q[0] + 8 * k, q[1] - 40 * k + i * 2.4 * k + fl * k, q[0] + 16 * k, q[1] - 36 * k + i * 3 * k + fl * 1.6 * k); g.stroke(); }); }, {layer: 3, zb: 0, top: 44});
  B.custom(0.3, 1.7, (g, P, k) => { const q = P(0.3, 1.7, 0); stripeCone(g, (x, y, z) => [q[0], q[1] - z * k], k, 0, 0, 0, 0.3, 20, dim(c, P0.d), dim(c, WHITE), 3, {hemCol: P0.d}); }, {layer: 3, zb: 0, top: 24});
  pennant(B, L, 0.25, 0.3, 0, 52, {emblem: teddyEm, pole: POLE, layer: 4});
});
// ✈️ a folded paper plane (screen space) — dir 1 flies right; a team stripe on the wing
function plane(g, x, y, s, dir, P0, tcol, c, down){ g.save(); g.translate(x, y); g.scale(dir || 1, 1); if(down) g.rotate(0.2);
  g.fillStyle = dim(c, '#F4F6FA'); g.beginPath(); g.moveTo(12 * s, 0); g.lineTo(-10 * s, -6 * s); g.lineTo(-6 * s, 0); g.closePath(); g.fill(); g.fillStyle = dim(c, '#D8DEE8'); g.beginPath(); g.moveTo(12 * s, 0); g.lineTo(-6 * s, 0); g.lineTo(-9 * s, 5 * s); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(80,90,110,0.5)'; g.lineWidth = 0.6 * s; line(g, [12 * s, 0], [-8 * s, -3 * s]); if(!dead(c)){ g.strokeStyle = tcol; g.lineWidth = 1.6 * s; line(g, [-1 * s, -3.6 * s], [-7 * s, -4.4 * s]); } g.restore(); }
/* ============================ 🩹 CARE — Plush Hospital (a soft stitched plush building, a pillow roof, a big button-heart sign, a bandage across the wall, a teddy with a bandaged arm waving) ============================ */
TB_('care', {name: 'Plush Hospital', h: 96, live: {period: 2.4, frames: 6}, diffs: [{by: 'v', level: 'bold', name: 'plush colour (pink ↔ mint)'}]}, (B, v, L) => { const c = L.cond, P0 = pt(v), br = dead(c), PL = v % 2 ? MINTP : PLUSH, PLD = v % 2 ? '#6EC8A6' : PLUSHD;
  B.flat(0.06, 0.06, 1.88, 1.88, WOODL);
  const H = br ? 18 : 32, s = B.box(0.25, 0.2, 0, 1.45, 1.05, H, dim(c, PL));
  ['front', 'right', 'left', 'back'].forEach(sd => B.decal(s, sd, ...F(s, sd), 0, H, PL, {paint: (g, Q, k) => { g.strokeStyle = dim(c, PLD); g.lineWidth = 1 * k; g.setLineDash([2.2 * k, 1.8 * k]); polyP(g, [Q(0.04, 2.5), Q(0.96, 2.5), Q(0.96, H - 2.5), Q(0.04, H - 2.5)]); g.stroke(); g.setLineDash([]); }}));
  B.decal(s, 'front', 0.7, 0.5, 0, 22, CREAM, {k: 'door', paint: archDoor(22, CREAM, c, '#5A3A48')});
  B.decal(s, 'front', 0.32, 0.3, 12, 11, '#FFF2B8', {paint: crayonWin(11, c, PLD)}); B.decal(s, 'right', 0.5, 0.4, 12, 11, '#FFF2B8', {paint: crayonWin(11, c, PLD)});
  B.decal(s, 'right', 0.25, 0.8, 4, 10, CREAM, {paint: (g, Q, k) => { if(br) return; polyP(g, [Q(0, 2), Q(1, 7), Q(1, 10), Q(0, 5)]); g.fillStyle = dim(c, '#F6D8B0'); g.fill(); polyP(g, [Q(0.38, 3.8), Q(0.62, 5), Q(0.62, 8), Q(0.38, 6.8)]); g.fillStyle = dim(c, '#E8C090'); g.fill(); g.fillStyle = 'rgba(160,110,70,0.5)'; [0.15, 0.25, 0.75, 0.85].forEach(u => { const p = Q(u, 3.6 + u * 5); g.beginPath(); g.arc(p[0], p[1], 0.6 * k, 0, TAU); g.fill(); }); }});   // 🩹 a big bandage plaster
  trim(B, L, s, H - 10, 3);
  if(!br) B.custom(0.97, 0.72, (g, P, k) => { dome(g, P, k, 0.97, 0.72, H, 0.8, 22, dim(c, v % 2 ? '#FFD0DC' : '#C8F0E0'), {hi: WHITE}); const q = P(0.97, 0.72, H + 11); g.strokeStyle = 'rgba(200,150,160,0.5)'; g.lineWidth = 1 * k; g.setLineDash([2 * k, 1.6 * k]); g.beginPath(); g.ellipse(q[0], q[1], 22 * k, 8 * k, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.setLineDash([]); }, {layer: 2, zb: H, top: H + 16});
  B.custom(0.97, 0.72, (g, P, k, t) => { const q = P(0.97, 0.72, H + 12), b = still(c) || br ? 1 : 1 + Math.sin(ph(t, 2.4)) * 0.06 + Math.cos(ph(t, 2.4)) * 0.03;   // 💗 a big BUTTON heart with 4 holes + stitches
    g.save(); g.translate(q[0], q[1] - 16 * k); g.scale(b, b); g.fillStyle = br ? '#8A7A80' : dim(c, P0.a); g.beginPath(); g.moveTo(0, 12 * k); g.bezierCurveTo(-17 * k, 0, -11 * k, -13 * k, 0, -6 * k); g.bezierCurveTo(11 * k, -13 * k, 17 * k, 0, 0, 12 * k); g.fill();
    if(!br){ g.fillStyle = D.sh(P0.a, -0.35); [[-3, -2], [3, -2], [-3, 3], [3, 3]].forEach(([dx, dy]) => { g.beginPath(); g.arc(dx * k, dy * k, 1.4 * k, 0, TAU); g.fill(); }); g.strokeStyle = WHITE; g.lineWidth = 1 * k; line(g, [-3 * k, -2 * k], [3 * k, 3 * k]); line(g, [3 * k, -2 * k], [-3 * k, 3 * k]); } g.restore(); }, {layer: 4, zb: H + 12, top: H + 42});
  B.custom(1.55, 1.55, (g, P, k, t) => { const q = P(1.55, 1.55, 0), w = still(c) || br ? 0.2 : 0.5 + Math.sin(ph(t, 2.4)) * 0.35 + Math.cos(ph(t, 2.4)) * 0.12;   // 🧸 a teddy with a bandaged arm on a bench, waving
    g.fillStyle = dim(c, WOOD); g.fillRect(q[0] - 12 * k, q[1] - 8 * k, 24 * k, 3 * k); g.fillStyle = dim(c, WOODD); [-10, 8].forEach(dx => g.fillRect(q[0] + dx * k, q[1] - 5 * k, 2 * k, 5 * k)); teddy(g, q[0], q[1] - 7 * k, k * 0.95, '#C8864A', c, w, {band: true}); }, {layer: 3, zb: 0, top: 32});
  B.custom(0.35, 1.6, (g, P, k) => { const q = P(0.35, 1.6, 0); g.fillStyle = dim(c, CREAM); g.beginPath(); D.rr(g, q[0] - 6 * k, q[1] - 12 * k, 12 * k, 12 * k, 3 * k); g.fill(); g.fillStyle = dim(c, P0.a); g.fillRect(q[0] - 1.4 * k, q[1] - 10 * k, 2.8 * k, 8 * k); g.fillRect(q[0] - 4 * k, q[1] - 7.4 * k, 8 * k, 2.8 * k); }, {layer: 3, zb: 0, top: 14});
  pennant(B, L, 1.8, 0.3, 0, 52, {emblem: teddyEm, pole: POLE});
});
/* ============================ 🔧 WORKSHOP — Train-set Depot (an engine shed, an oval wooden track, a toy train going round, a water tower) ============================ */
TB_('workshop', {name: 'Train-set Depot', h: 92, live: {period: 2.4, frames: 6}, diffs: [{by: 'v', level: 'bold', name: 'toy paint (primary ↔ pastel)'}]}, (B, v, L) => { const c = L.cond, P0 = pt(v), br = dead(c);
  B.flat(0.06, 0.06, 1.88, 1.88, WOODL);
  const s = B.box(0.15, 0.15, 0, 0.95, 0.75, br ? 16 : 30, WOOD); ['front', 'right', 'left', 'back'].forEach((sd, i) => B.decal(s, sd, ...F(s, sd), 0, br ? 16 : 30, WOOD, {paint: blockWall(br ? 16 : 30, v, 61 + i, 0.9, 15, c)}));
  B.decal(s, 'right', 0.3, 0.42, 0, 22, '#3A2A30', {k: 'door', paint: archDoor(22, P0.a, c)}); trim(B, L, s, 20, 3);
  if(!br) B.roof(0.08, 0.08, 30, 1.09, 0.89, 16, dim(c, P0.d), {ridge: 'y', ov: 0.06, kind: 'gable'});
  const ex = 1.15, ey = 1.15, ea = 0.68, eb = 0.56;
  B.custom(ex, ey, (g, P, k) => { const tie = [], rail = (f) => { g.beginPath(); for(let i = 0; i <= 40; i++){ const a = i / 40 * TAU, p = P(ex + Math.cos(a) * ea * f, ey + Math.sin(a) * eb * f, 0); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke(); };   // 🛤️ the wooden oval track
    g.strokeStyle = dim(c, WOOD); g.lineWidth = 7 * k; rail(1); g.strokeStyle = dim(c, WOODD); g.lineWidth = 1.1 * k; rail(1.1); rail(0.9);
    g.strokeStyle = 'rgba(90,60,30,0.35)'; g.lineWidth = 0.8 * k; for(let i = 0; i < 20; i++){ const a = i / 20 * TAU, p0 = P(ex + Math.cos(a) * ea * 0.88, ey + Math.sin(a) * eb * 0.88, 0), p1 = P(ex + Math.cos(a) * ea * 1.12, ey + Math.sin(a) * eb * 1.12, 0); line(g, p0, p1); } }, {layer: -1, zb: 0, top: 1});
  B.custom(ex, ey, (g, P, k, t) => { const a0 = br ? 1.2 : still(c) ? 0.6 : ph(t, 2.4), cars = br ? [[0, P0.a, 'eng']] : [[0, P0.a, 'eng'], [-0.55, P0.c, 'car'], [-1.05, P0.b, 'car']];   // 🚂 a wooden toy train going round
    const list = cars.map(([da, col, kind]) => { const a = a0 + da, p = P(ex + Math.cos(a) * ea, ey + Math.sin(a) * eb, 0); return [p, col, kind, a]; }).sort((p, q) => p[0][1] - q[0][1]);
    list.forEach(([p, col, kind, a]) => { const tx = -Math.sin(a) * ea, ty = Math.cos(a) * eb, sx = (tx - ty), dir = sx >= 0 ? 1 : -1, cl = dim(c, col);
      g.save(); g.translate(p[0], p[1]); if(br) g.rotate(0.5); g.scale(dir, 1); g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, 0, 0, 9 * k, 3 * k); g.fill();
      g.fillStyle = cl; g.beginPath(); D.rr(g, -8 * k, -9 * k, 16 * k, 6 * k, 1.6 * k); g.fill(); g.fillStyle = INK; [-5, 5].forEach(dx => { g.beginPath(); g.arc(dx * k, -2.6 * k, 2.6 * k, 0, TAU); g.fill(); }); g.fillStyle = GOLD; [-5, 5].forEach(dx => { g.beginPath(); g.arc(dx * k, -2.6 * k, 1 * k, 0, TAU); g.fill(); });
      if(kind === 'eng'){ g.fillStyle = cl; g.beginPath(); D.rr(g, -8 * k, -17 * k, 7 * k, 9 * k, 1.4 * k); g.fill(); g.fillStyle = D.sh(cl, 0.15); g.beginPath(); D.rr(g, -1 * k, -14 * k, 9 * k, 6 * k, 2.6 * k); g.fill(); g.fillStyle = INK; g.fillRect(4 * k, -19 * k, 3 * k, 6 * k); g.fillStyle = '#FFF2B8'; g.fillRect(-6.4 * k, -15.6 * k, 3.6 * k, 3.4 * k); g.fillStyle = teamOf(L); g.fillRect(-8 * k, -9 * k, 16 * k, 1.6 * k); }
      else { const R = rnd(Math.round(a * 10)); [P0.d, P0.e, P0.c].forEach((cc, i) => { if(R() < 0.9){ g.fillStyle = dim(c, cc); g.fillRect((-6 + i * 4.4) * k, -13 * k, 3.6 * k, 4 * k); } }); }
      g.restore(); }); if(!br && !still(c)){ const e = list.find(x => x[2] === 'eng'); T.puffs(g, e[0][0] + (e[0][0] > 0 ? 1 : 1) * 4 * k, e[0][1] - 20 * k, k, t, {n: 3, rise: 16, period: 2.4, r: 2, col: 'rgba(255,255,255,0.8)'}); } }, {layer: 3, zb: 0, top: 34});
  B.custom(1.7, 0.35, (g, P, k) => { const q = P(1.7, 0.35, 0); g.strokeStyle = dim(c, WOODD); g.lineWidth = 1.6 * k; [-6, 6].forEach(dx => line(g, [q[0] + dx * k, q[1]], [q[0] + dx * 0.6 * k, q[1] - 26 * k])); line(g, [q[0] - 6 * k, q[1]], [q[0] + 4 * k, q[1] - 18 * k]);   // 🗼 a toy water tower
    const cl = dim(c, P0.b); g.fillStyle = cl; g.beginPath(); g.ellipse(q[0], q[1] - 26 * k, 8 * k, 3.4 * k, 0, 0, Math.PI); g.lineTo(q[0] - 8 * k, q[1] - 38 * k); g.ellipse(q[0], q[1] - 38 * k, 8 * k, 3.4 * k, 0, Math.PI, 0, true); g.closePath(); g.fill();
    if(!br){ g.fillStyle = dim(c, P0.a); g.beginPath(); g.moveTo(q[0] - 9 * k, q[1] - 38 * k); g.lineTo(q[0], q[1] - 47 * k); g.lineTo(q[0] + 9 * k, q[1] - 38 * k); g.closePath(); g.fill(); } g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(q[0] - 5 * k, q[1] - 36 * k, 2 * k, 9 * k); }, {layer: 3, zb: 0, top: 50});
  pennant(B, L, 1.85, 1.85, 0, 50, {emblem: teddyEm, pole: POLE});
});
/* ============================ 🗼 TOWER — Jack-in-the-box Tower (a tall painted box, a crank turning, the lid open + a jester head on a spring popping · stand + aim) ============================ */
TB_('tower', {name: 'Jack-in-the-box Tower', h: 140, stand: [0.5, 0.5, 82], aim: [0.5, 0.5, 100], live: {period: 2.4, frames: 6}, diffs: [{by: 'v', level: 'bold', name: 'toy paint (primary ↔ pastel)'}]}, (B, v, L) => { const c = L.cond, P0 = pt(v), br = dead(c), H = br ? 46 : 82;
  const b = B.box(0.16, 0.16, 0, 0.68, 0.68, H, dim(c, P0.b));
  ['front', 'right', 'left', 'back'].forEach((sd, i) => B.decal(b, sd, ...F(b, sd), 0, H, P0.b, {paint: (g, Q, k) => { const n = 3; for(let j = 0; j < n; j++){ const z0 = 6 + j * (H - 12) / n, hh = (H - 12) / n;   // painted panels: a shape each, a gold frame
      polyP(g, [Q(0.1, z0 + 2), Q(0.9, z0 + 2), Q(0.9, z0 + hh - 2), Q(0.1, z0 + hh - 2)]); g.fillStyle = dim(c, [P0.c, P0.a, P0.d][(j + i) % 3]); g.fill(); g.strokeStyle = dim(c, GOLD); g.lineWidth = 1.2 * k; g.stroke();
      faceShape(g, Q, SHAPES[(i + j * 2) % 6], 0.5, z0 + hh / 2, 0.24, Math.min(hh * 0.3, 0.24 * 0.68 * 40), dead(c) ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)'); } }}));
  trim(B, L, b, H - 10, 3);
  B.box(0.12, 0.12, H, 0.76, 0.76, 3, dim(c, GOLD));
  B.custom(0.84, 0.5, (g, P, k, t) => { const q = P(0.84, 0.5, H * 0.55), a = still(c) || br ? 0.5 : ph(t, 2.4) / 2;   // the crank handle on the right side, turning
    g.fillStyle = dim(c, GOLD); g.beginPath(); g.arc(q[0], q[1], 2.4 * k, 0, TAU); g.fill(); g.strokeStyle = dim(c, GOLDD); g.lineWidth = 2 * k; const e = [q[0] + Math.cos(a) * 8 * k, q[1] + Math.sin(a) * 6 * k]; line(g, q, e); g.fillStyle = dim(c, P0.a); g.beginPath(); D.rr(g, e[0] - 1.6 * k, e[1] - 5 * k, 3.2 * k, 6 * k, 1.4 * k); g.fill(); }, {layer: 3, zb: H * 0.4, top: H * 0.7});
  if(br) return;
  B.custom(0.5, 0.16, (g, P, k) => { const a = P(0.16, 0.16, H + 3), b2 = P(0.84, 0.16, H + 3), c2 = P(0.84, 0.02, H + 3 + 30), d2 = P(0.16, 0.02, H + 3 + 30); polyP(g, [a, b2, c2, d2]); g.fillStyle = dim(c, D.sh(P0.b, 0.15)); g.fill(); g.strokeStyle = dim(c, GOLD); g.lineWidth = 1.2 * k; g.stroke(); }, {layer: -1, zb: H, top: H + 34});   // the lid, open behind
  B.custom(0.3, 0.3, (g, P, k, t) => { const q = P(0.3, 0.3, H + 3), pop = still(c) ? 0.7 : 0.55 + Math.sin(ph(t, 2.4)) * 0.3 + Math.cos(ph(t, 2.4)) * 0.15, top = q[1] - (14 + pop * 16) * k, sw = still(c) ? 0 : Math.sin(ph(t, 2.4) * 1) * 2 * k;   // 🤡 the jester head on a spring (bobbing)
    g.strokeStyle = dim(c, TIN); g.lineWidth = 1.4 * k; g.beginPath(); for(let i = 0; i <= 8; i++){ const y = q[1] - i / 8 * (q[1] - top - 6 * k), x = q[0] + (i % 2 ? 3.6 : -3.6) * k + sw * i / 8; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    const hx = q[0] + sw, hy = top; g.fillStyle = '#F6CFA8'; g.beginPath(); g.arc(hx, hy, 6 * k, 0, TAU); g.fill(); g.fillStyle = dim(c, P0.a); g.beginPath(); g.arc(hx, hy + 1 * k, 1.8 * k, 0, TAU); g.fill();
    g.fillStyle = INK; [-1, 1].forEach(sd => { g.beginPath(); g.arc(hx + sd * 2.2 * k, hy - 1.6 * k, 0.8 * k, 0, TAU); g.fill(); }); g.strokeStyle = INK; g.lineWidth = 0.9 * k; g.beginPath(); g.arc(hx, hy + 1.4 * k, 3 * k, 0.3, Math.PI - 0.3); g.stroke();
    [[-1, P0.c], [0, teamOf(L)], [1, P0.d]].forEach(([sd, col]) => { g.fillStyle = col; g.beginPath(); g.moveTo(hx - 6 * k + (sd + 1) * 4 * k, hy - 4.6 * k); g.lineTo(hx + sd * 7 * k, hy - 15 * k + Math.abs(sd) * 3 * k); g.lineTo(hx - 2 * k + (sd + 1) * 4 * k, hy - 4.6 * k); g.closePath(); g.fill(); g.fillStyle = GOLD; g.beginPath(); g.arc(hx + sd * 7 * k, hy - 15 * k + Math.abs(sd) * 3 * k, 1.6 * k, 0, TAU); g.fill(); });
    g.fillStyle = WHITE; g.beginPath(); for(let i = 0; i < 7; i++){ const x = hx - 6 * k + i * 2 * k; g.moveTo(x, hy + 5.4 * k); g.arc(x, hy + 5.4 * k, 1.6 * k, 0, TAU); } g.fill(); }, {layer: 4, zb: H, top: H + 48});
  pennant(B, L, 0.84, 0.84, H + 3, 18, {w: 12, hh: 8, emblem: teddyEm, pole: POLE, layer: 5});
});
/* ============================ 🎨 WARDROBE — Doll Wardrobe (a painted doll's wardrobe with its doors open, doll dresses incl. the team one, a hat box, a heart mirror) ============================ */
TB_('wardrobe', {name: 'Doll Wardrobe', h: 82, live: {period: 2.4, frames: 6}, diffs: [{by: 'v', level: 'bold', name: 'toy paint (primary ↔ pastel)'}]}, (B, v, L) => { const c = L.cond, P0 = pt(v), br = dead(c), H = br ? 24 : 46;
  B.flat(0.06, 0.06, 1.88, 0.88, WOODL);
  const w = B.box(0.18, 0.12, 0, 1.0, 0.5, H, dim(c, CREAM)); ['right', 'left', 'back'].forEach(sd => B.decal(w, sd, ...F(w, sd), 0, H, CREAM, {paint: (g, Q, k) => { faceShape(g, Q, 'heart', 0.5, H * 0.55, 0.22, 7, dim(c, P0.a)); }}));
  B.decal(w, 'front', 0.24, 0.88, 2, H - 6, '#5A3A48', {paint: (g, Q, k) => { polyP(g, [Q(0, 0), Q(1, 0), Q(1, H - 6), Q(0, H - 6)]); g.fillStyle = '#5A3A48'; g.fill(); g.strokeStyle = dim(c, GOLD); g.lineWidth = 1.2 * k; line(g, Q(0.06, H - 12), Q(0.94, H - 12)); }});
  trim(B, L, w, H - 8, 3);
  if(!br){ B.roof(0.12, 0.08, H, 1.12, 0.58, 10, dim(c, P0.a), {ridge: 'x', ov: 0.04, kind: 'hip'});
    B.custom(0.68, 0.62, (g, P, k, t) => { const top = P(0.68, 0.6, H - 12), sw = still(c) ? 0 : Math.sin(ph(t, 2.4)) * 0.8 + Math.cos(ph(t, 2.4)) * 0.3;   // 👗 doll dresses on hangers (the team one in the middle)
      [[-12, P0.c], [-4, teamOf(L)], [4, P0.d], [12, P0.e]].forEach(([dx, col], i) => { const x = top[0] + dx * k + sw * (i % 2 ? 1 : -1) * k, y = top[1]; g.strokeStyle = TIND; g.lineWidth = 0.8 * k; line(g, [x - 3 * k, y + 2 * k], [x, y]); line(g, [x, y], [x + 3 * k, y + 2 * k]);
        g.fillStyle = dim(c, col); g.beginPath(); g.moveTo(x - 2.4 * k, y + 2 * k); g.lineTo(x + 2.4 * k, y + 2 * k); g.lineTo(x + 4.4 * k, y + 16 * k); g.quadraticCurveTo(x, y + 18 * k, x - 4.4 * k, y + 16 * k); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x - 2.4 * k, y + 6 * k, 4.8 * k, 1.2 * k); }); }, {layer: 2, zb: 6, top: H - 8}); }
  B.custom(0.18, 0.62, (g, P, k) => { const a = P(0.22, 0.62, 2), b2 = P(0.22, 0.95, 2), c2 = P(0.22, 0.95, H - 4), d2 = P(0.22, 0.62, H - 4); polyP(g, [a, b2, c2, d2]); g.fillStyle = dim(c, P0.b); g.fill(); g.strokeStyle = dim(c, GOLD); g.lineWidth = 1 * k; g.stroke(); }, {layer: 3, zb: 0, top: H});   // the doors swung open
  B.custom(1.14, 0.62, (g, P, k) => { const a = P(1.14, 0.62, 2), b2 = P(1.14, 0.95, 2), c2 = P(1.14, 0.95, H - 4), d2 = P(1.14, 0.62, H - 4); polyP(g, [a, b2, c2, d2]); g.fillStyle = dim(c, D.sh(P0.b, -0.15)); g.fill(); g.strokeStyle = dim(c, GOLD); g.lineWidth = 1 * k; g.stroke(); }, {layer: 3, zb: 0, top: H});
  B.custom(1.55, 0.35, (g, P, k) => { const q = P(1.55, 0.35, 0); g.strokeStyle = dim(c, WOODD); g.lineWidth = 1.6 * k; line(g, q, [q[0], q[1] - 26 * k]); line(g, [q[0] - 5 * k, q[1]], [q[0] + 5 * k, q[1]]);   // 💗 a heart mirror on a stand
    g.fillStyle = dim(c, GOLD); g.save(); g.translate(q[0], q[1] - 34 * k); g.beginPath(); g.moveTo(0, 9 * k); g.bezierCurveTo(-12 * k, 0, -8 * k, -10 * k, 0, -5 * k); g.bezierCurveTo(8 * k, -10 * k, 12 * k, 0, 0, 9 * k); g.fill(); g.fillStyle = br ? '#6A7080' : '#CFEFFF'; g.scale(0.72, 0.72); g.beginPath(); g.moveTo(0, 9 * k); g.bezierCurveTo(-12 * k, 0, -8 * k, -10 * k, 0, -5 * k); g.bezierCurveTo(8 * k, -10 * k, 12 * k, 0, 0, 9 * k); g.fill(); if(!br){ g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(-4 * k, -3 * k, 2 * k, 5 * k); } g.restore(); }, {layer: 3, zb: 0, top: 46});
  B.custom(1.6, 0.75, (g, P, k) => { const q = P(1.6, 0.75, 0), cl = dim(c, P0.d); g.fillStyle = cl; g.beginPath(); g.ellipse(q[0], q[1] - 2 * k, 8 * k, 3.4 * k, 0, 0, Math.PI); g.lineTo(q[0] - 8 * k, q[1] - 10 * k); g.ellipse(q[0], q[1] - 10 * k, 8 * k, 3.4 * k, 0, Math.PI, 0, true); g.closePath(); g.fill();   // a striped hat box
    g.fillStyle = D.sh(cl, 0.2); g.beginPath(); D.ell(g, q[0], q[1] - 10 * k, 8.4 * k, 3.6 * k); g.fill(); g.strokeStyle = dim(c, P0.a); g.lineWidth = 1.4 * k; line(g, [q[0], q[1] - 13.6 * k], [q[0], q[1] - 1 * k]); g.fillStyle = dim(c, P0.a); g.beginPath(); D.ell(g, q[0] - 2 * k, q[1] - 14 * k, 2.4 * k, 1.4 * k); g.fill(); g.beginPath(); D.ell(g, q[0] + 2 * k, q[1] - 14 * k, 2.4 * k, 1.4 * k); g.fill(); }, {layer: 3, zb: 0, top: 18});
  pennant(B, L, 1.88, 0.12, 0, 48, {emblem: teddyEm, pole: POLE});
});
/* ============================ 🔮 SPELL — Music Box (a giant wooden music box, the lid open with a mirror, a ballerina spinning on top, a wind-up key turning, music notes rising) ============================ */
TB_('spell', {name: 'Music Box', h: 124, live: {period: 2.4, frames: 6}, diffs: [{by: 'v', level: 'bold', name: 'toy paint (primary ↔ pastel)'}]}, (B, v, L) => { const c = L.cond, P0 = pt(v), br = dead(c), H = br ? 18 : 30;
  B.flat(0.06, 0.06, 1.88, 1.88, WOODL);
  const b = B.box(0.25, 0.4, 0, 1.5, 1.1, H, dim(c, P0.e));
  ['front', 'right', 'left', 'back'].forEach((sd, i) => B.decal(b, sd, ...F(b, sd), 0, H, P0.e, {paint: (g, Q, k) => { g.strokeStyle = dim(c, GOLD); g.lineWidth = 1.6 * k; polyP(g, [Q(0.05, 3), Q(0.95, 3), Q(0.95, H - 3), Q(0.05, H - 3)]); g.stroke();
    [0.25, 0.5, 0.75].forEach((u, j) => faceShape(g, Q, ['star', 'heart', 'star'][j], u, H / 2, 0.07, 6, dim(c, j === 1 ? P0.a : GOLD))); }}));
  B.decal(b, 'front', 0.8, 0.4, 0, 18, '#3A2A30', {k: 'door', paint: archDoor(18, GOLD, c)}); trim(B, L, b, H - 10, 3);
  B.box(0.2, 0.35, H, 1.6, 1.2, 3, dim(c, GOLD));
  if(!br){ B.custom(1, 0.35, (g, P, k) => { const a = P(0.2, 0.35, H + 3), b2 = P(1.8, 0.35, H + 3), c2 = P(1.8, 0.15, H + 3 + 44), d2 = P(0.2, 0.15, H + 3 + 44); polyP(g, [a, b2, c2, d2]); g.fillStyle = dim(c, D.sh(P0.e, 0.1)); g.fill();   // the lid open, a mirror inside
      const m = [[0.32, 0.33, 8], [1.68, 0.33, 8], [1.68, 0.19, 38], [0.32, 0.19, 38]].map(p => P(p[0], p[1], H + 3 + p[2])); polyP(g, m); g.fillStyle = '#CFEFFF'; g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; polyP(g, [m[0], [m[0][0] + 10 * k, m[0][1]], [m[3][0] + 22 * k, m[3][1]], [m[3][0] + 12 * k, m[3][1]]]); g.fill();
      g.strokeStyle = dim(c, GOLD); g.lineWidth = 1.4 * k; polyP(g, [a, b2, c2, d2]); g.stroke(); }, {layer: -1, zb: H, top: H + 48});
    B.custom(1.0, 0.95, (g, P, k) => { const q = P(1.0, 0.95, H + 3); g.fillStyle = '#7A3A5A'; g.beginPath(); D.ell(g, q[0], q[1], 28 * k, 11 * k); g.fill(); g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); D.ell(g, q[0] - 6 * k, q[1] - 2 * k, 14 * k, 5 * k); g.fill(); }, {layer: 1, zb: H + 3, top: H + 4}); }
  B.custom(1.0, 0.95, (g, P, k, t) => { const q = P(1.0, 0.95, H + 3), a = still(c) ? 0.6 : ph(t, 2.4), sx = Math.cos(a), arm = Math.sin(a) * 0.5;   // 🩰 a ballerina spinning on a little plinth
    g.fillStyle = dim(c, GOLD); g.beginPath(); g.ellipse(q[0], q[1], 6 * k, 2.4 * k, 0, 0, Math.PI); g.lineTo(q[0] - 6 * k, q[1] - 3 * k); g.ellipse(q[0], q[1] - 3 * k, 6 * k, 2.4 * k, 0, Math.PI, 0, true); g.closePath(); g.fill(); if(br) return;
    const y = q[1] - 3 * k; g.save(); g.translate(q[0], y); g.strokeStyle = '#F6CFA8'; g.lineWidth = 1.4 * k; line(g, [0, 0], [0, -10 * k]); line(g, [0, -6 * k], [sx * 5 * k, -9 * k]);
    g.fillStyle = dim(c, teamOf(L)); g.beginPath(); g.ellipse(0, -11 * k, 7 * k * (0.6 + 0.4 * Math.abs(sx)), 2.4 * k, 0, 0, TAU); g.fill(); g.fillStyle = dim(c, P0.a); g.beginPath(); D.rr(g, -2 * k, -18 * k, 4 * k, 7 * k, 1.6 * k); g.fill();
    g.strokeStyle = '#F6CFA8'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(-1.4 * k, -16.6 * k); g.quadraticCurveTo(-6 * sx * k, -22 * k - arm * 2 * k, 0, -24 * k); g.quadraticCurveTo(6 * sx * k, -22 * k + arm * 2 * k, 1.4 * k, -16.6 * k); g.stroke();
    g.fillStyle = '#F6CFA8'; g.beginPath(); g.arc(0, -20.6 * k, 2.4 * k, 0, TAU); g.fill(); g.fillStyle = '#6A3A28'; g.beginPath(); g.arc(sx * 0.8 * k, -22.4 * k, 1.6 * k, 0, TAU); g.fill(); g.restore(); }, {layer: 3, zb: H + 3, top: H + 30});
  B.custom(1.75, 0.95, (g, P, k, t) => { const q = P(1.75, 0.95, H * 0.5); windKey(g, q[0], q[1], k * 1.5, still(c) || br ? 0.4 : ph(t, 2.4) / 3, GOLD, c); }, {layer: 3, zb: H * 0.3, top: H * 0.5 + 24});
  if(!br) B.custom(1.0, 0.95, (g, P, k, t) => { if(still(c)) return; const q = P(1.0, 0.95, H + 20);   // 🎵 music notes drifting up (fx)
    for(let i = 0; i < 3; i++){ const f = ((t || 0) / 2.4 + i / 3) % 1, x = q[0] + Math.sin(f * TAU + i * 2) * 14 * k + (i - 1) * 10 * k, y = q[1] - f * 44 * k, a = Math.sin(f * Math.PI); g.globalAlpha = Math.max(0, a); note(g, x, y, k * 1.05, [P0.a, P0.b, P0.d][i], i === 1); } g.globalAlpha = 1; }, {layer: 7, zb: H + 20, top: H + 70, fx: true});
  if(!br) halo(B, 1.0, 0.95, H + 14, 26, '#FFE6A8', 0.35, {pulse: t => still(c) ? 1 : 0.86 + Math.sin(ph(t, 2.4)) * 0.09 + Math.cos(ph(t, 2.4)) * 0.05});
  banner(B, L, b, 'right', 0.62, 0.3, 4, 20, teddyEm);
  pennant(B, L, 0.25, 1.75, 0, 52, {emblem: teddyEm, pole: POLE});
});
/* ============================ 🕵️ HIDEOUT — Puzzle Box (a squat box made of jigsaw pieces, one piece missing = the way in, eyes blinking inside, loose pieces) ============================ */
// a jigsaw grid over a face (decal paint) — pieces in turns of colour, little knobs on the seams
const jigsaw = (h, cols, aw, c, hole) => (g, Q, k) => { const n = Math.max(2, Math.round(aw / 0.45)), m = Math.max(2, Math.round(h / 16)), ch = h / m;
  for(let i = 0; i < n; i++) for(let j = 0; j < m; j++){ if(hole && hole(i, j, n, m)) continue; polyP(g, [Q(i / n, j * ch), Q((i + 1) / n, j * ch), Q((i + 1) / n, (j + 1) * ch), Q(i / n, (j + 1) * ch)]); g.fillStyle = dim(c, cols[(i + j) % cols.length]); g.fill();
    g.strokeStyle = 'rgba(58,42,48,0.4)'; g.lineWidth = 0.9 * k; g.stroke(); if(i < n - 1){ const p = Q((i + 1) / n, (j + 0.5) * ch), col = dim(c, cols[(i + j) % cols.length]); g.fillStyle = col; g.beginPath(); g.arc(p[0] + 1.8 * k, p[1], 2.2 * k, 0, TAU); g.fill(); }
    if(j < m - 1){ const p = Q((i + 0.5) / n, (j + 1) * ch), col = dim(c, cols[(i + j) % cols.length]); g.fillStyle = col; g.beginPath(); g.arc(p[0], p[1] - 1.8 * k, 2.2 * k, 0, TAU); g.fill(); } } };
TB_('hideout', {name: 'Puzzle Box', h: 66, live: {period: 2.4, frames: 6}, diffs: [{by: 'v', level: 'bold', name: 'puzzle colours (primary ↔ pastel)'}]}, (B, v, L) => { const c = L.cond, P0 = pt(v), br = dead(c), H = br ? 18 : 34, cols = [P0.a, P0.b, P0.c, P0.d];
  B.flat(0.06, 0.06, 1.88, 1.88, WOODL);
  const b = B.box(0.3, 0.3, 0, 1.4, 1.2, H, dim(c, P0.c));
  ['front', 'right', 'left', 'back'].forEach(sd => B.decal(b, sd, ...F(b, sd), 0, H, P0.c, {paint: jigsaw(H, sd === 'right' ? [P0.b, P0.d, P0.a, P0.c] : cols, sd === 'front' || sd === 'back' ? 1.4 : 1.2, c, sd === 'front' ? (i, j, n, m) => i === Math.floor(n / 2) && j === 0 : null)}));
  B.decal(b, 'front', 0.3 + 1.4 * Math.floor(Math.max(2, Math.round(1.4 / 0.45)) / 2) / Math.max(2, Math.round(1.4 / 0.45)), 1.4 / Math.max(2, Math.round(1.4 / 0.45)), 0, Math.round(H / Math.max(2, Math.round(H / 16))), '#241A24', {k: 'door'});
  B.box(0.26, 0.26, H, 1.48, 1.28, 3, dim(c, P0.a)); trim(B, L, b, H - 10, 3);
  B.custom(1.0, 1.5, (g, P, k, t) => { const n = Math.max(2, Math.round(1.4 / 0.45)), u = 0.3 + 1.4 * (Math.floor(n / 2) + 0.5) / n, q = P(u, 1.5, Math.round(H / Math.max(2, Math.round(H / 16))) * 0.55), bl = still(c) ? 1 : Math.max(0, Math.sin(ph(t, 2.4)) * 1.4 + Math.cos(ph(t, 2.4)) * 0.6 + 0.2);   // 👀 eyes in the gap
    if(br) return; g.fillStyle = '#FFF6D8'; [-1, 1].forEach(sd => { g.beginPath(); D.ell(g, q[0] + sd * 3 * k, q[1], 2.2 * k, 2.4 * k * Math.min(1, bl)); g.fill(); }); g.fillStyle = INK; [-1, 1].forEach(sd => { g.beginPath(); D.ell(g, q[0] + sd * 3 * k + 0.6 * k, q[1] + 0.3 * k, 1 * k, 1.2 * k * Math.min(1, bl)); g.fill(); }); }, {layer: 3, zb: 0, top: 18});
  [[0.35, 1.7, 0.4, P0.a], [1.75, 1.2, -0.6, P0.b], [1.6, 1.75, 1.2, P0.d]].forEach(([x, y, a, col], i) => B.custom(x, y, (g, P, k) => { const q = P(x, y, 0); g.save(); g.translate(q[0], q[1] - 1.6 * k); g.scale(1, 0.5); g.rotate(a); g.fillStyle = dim(c, col); g.fillRect(-5 * k, -5 * k, 10 * k, 10 * k);   // loose puzzle pieces
    g.beginPath(); g.arc(5 * k + 1.6 * k, 0, 2.4 * k, 0, TAU); g.arc(0, -5 * k - 1.6 * k, 2.4 * k, 0, TAU); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(-5 * k + 1.4 * k, 0, 2.2 * k, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over'; g.restore(); }, {layer: 2, zb: 0, top: 4}));
  B.custom(1.85, 0.45, (g, P, k) => { const q = P(1.85, 0.45, 0); g.save(); g.translate(q[0], q[1] - 9 * k); g.rotate(0.18); g.fillStyle = dim(c, P0.e); g.fillRect(-6 * k, -9 * k, 12 * k, 16 * k); g.beginPath(); g.arc(6 * k + 1.6 * k, -1 * k, 2.6 * k, 0, TAU); g.fill(); g.restore(); }, {layer: 2, zb: 0, top: 20});
  pennant(B, L, 0.2, 1.8, 0, 46, {emblem: teddyEm, pole: POLE});
});
/* ============================ 🐾 DEN — Teddy Kennel (a kennel built of blocks with an arched door, a teddy sitting outside waving, a bowl of buttons, a toy bone) ============================ */
TB_('den', {name: 'Teddy Kennel', h: 76, live: {period: 2.4, frames: 6}, diffs: [{by: 'v', level: 'bold', name: 'toy paint (primary ↔ pastel)'}]}, (B, v, L) => { const c = L.cond, P0 = pt(v), br = dead(c), H = br ? 14 : 26;
  B.flat(0.06, 0.06, 1.88, 1.88, WOODL);
  const b = B.box(0.3, 0.2, 0, 1.2, 0.95, H, WOOD); ['front', 'right', 'left', 'back'].forEach((sd, i) => B.decal(b, sd, ...F(b, sd), 0, H, WOOD, {paint: blockWall(H, v, 71 + i, sd === 'front' || sd === 'back' ? 1.2 : 0.95, 13, c)}));
  B.decal(b, 'front', 0.7, 0.5, 0, 20, '#3A2A30', {k: 'door', paint: archDoor(20, P0.c, c)}); trim(B, L, b, H - 9, 3);
  if(!br){ B.roof(0.22, 0.12, H, 1.36, 1.11, 20, dim(c, P0.b), {ridge: 'x', ov: 0.06, kind: 'gable'});
    B.custom(0.95, 1.18, (g, P, k) => { const q = P(0.95, 1.16, H + 22); g.fillStyle = dim(c, P0.a); g.save(); g.translate(q[0], q[1]); g.beginPath(); g.moveTo(0, 5 * k); g.bezierCurveTo(-8 * k, 0, -5 * k, -6 * k, 0, -3 * k); g.bezierCurveTo(5 * k, -6 * k, 8 * k, 0, 0, 5 * k); g.fill(); g.restore(); }, {layer: 4, zb: H + 14, top: H + 30}); }
  B.custom(1.1, 1.55, (g, P, k, t) => { const q = P(1.1, 1.55, 0), w = still(c) || br ? 0.2 : 0.5 + Math.sin(ph(t, 2.4)) * 0.4 + Math.cos(ph(t, 2.4)) * 0.12; teddy(g, q[0], q[1], k * 1.1, v % 2 ? '#E8C8A0' : '#C8864A', c, w, {bow: teamOf(L)}); }, {layer: 3, zb: 0, top: 32});   // 🧸 a teddy waving hello
  B.custom(1.7, 1.05, (g, P, k) => { const q = P(1.7, 1.05, 0); g.fillStyle = dim(c, P0.a); g.beginPath(); g.ellipse(q[0], q[1] - 2 * k, 7 * k, 3 * k, 0, 0, Math.PI); g.lineTo(q[0] - 7 * k, q[1] - 5 * k); g.ellipse(q[0], q[1] - 5 * k, 7 * k, 3 * k, 0, Math.PI, 0, true); g.closePath(); g.fill();   // a bowl of buttons
    if(br) return; [[-3, P0.c], [0, P0.b], [3, P0.d], [-1, P0.e]].forEach(([dx, col], i) => { g.fillStyle = dim(c, col); g.beginPath(); g.arc(q[0] + dx * k, q[1] - 6 * k - (i === 3 ? 1.6 : 0) * k, 1.8 * k, 0, TAU); g.fill(); }); }, {layer: 3, zb: 0, top: 10});
  B.custom(0.45, 1.65, (g, P, k) => { const q = P(0.45, 1.65, 0); g.save(); g.translate(q[0], q[1] - 2 * k); g.rotate(-0.3); g.fillStyle = dim(c, CREAM); g.fillRect(-5 * k, -1.4 * k, 10 * k, 2.8 * k); [[-5, -1.4], [-5, 1.4], [5, -1.4], [5, 1.4]].forEach(([dx, dy]) => { g.beginPath(); g.arc(dx * k, dy * k, 1.8 * k, 0, TAU); g.fill(); }); g.restore(); }, {layer: 2, zb: 0, top: 6});
  pennant(B, L, 1.8, 0.25, 0, 50, {emblem: teddyEm, pole: POLE});
});
/* ---------- 🟩 territory floor: a woven play rug (soft stripes + a stitched edge) · now and then a crayon · a jack · a marble · a star sticker ---------- */
addFloor('toybox', {name: 'Woven play rug + crayons + stickers', top: '#F0C8B0', top2: '#E8BCA2', side: '#B88A74', paint: (g, q, s, i, j) => { const r = hash(i, j, 41), r2 = hash(j, i, 42);
  tileBase(g, q, s, '#F2CDB4', '#EAC0A8', r);
  const band = (i + j) % 3, cols = ['rgba(232,69,60,0.16)', 'rgba(61,127,217,0.14)', 'rgba(255,200,61,0.22)'];   // woven stripes running across the rug
  g.fillStyle = cols[band]; polyP(g, [q(0, 0.35), q(1, 0.35), q(1, 0.65), q(0, 0.65)]); g.fill();
  g.strokeStyle = 'rgba(120,70,50,0.2)'; g.lineWidth = 0.6 * s; for(let u = 0.12; u < 1; u += 0.2) line(g, q(u, 0.04), q(u, 0.96));
  g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 0.8 * s; g.setLineDash([1.6 * s, 1.4 * s]); line(g, q(0.06, 0.06), q(0.94, 0.06)); line(g, q(0.06, 0.94), q(0.94, 0.94)); g.setLineDash([]);
  if(r2 > 0.9){ const p = q(0.5, 0.5); g.fillStyle = '#FFC83D'; g.beginPath(); D.star(g, p[0], p[1], 5 * s, 2.2 * s, 5); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(p[0] - 1.4 * s, p[1] - 1.4 * s, 1 * s, 0, TAU); g.fill(); }
  else if(r2 < 0.08){ const p = q(0.3 + r * 0.4, 0.5); g.save(); g.translate(p[0], p[1]); g.rotate(-0.4 + r); g.fillStyle = ['#E8453C', '#3D7FD9', '#4DB860'][Math.floor(r * 3)]; g.fillRect(-6 * s, -1.2 * s, 10 * s, 2.4 * s); g.beginPath(); g.moveTo(4 * s, -1.2 * s); g.lineTo(7 * s, 0); g.lineTo(4 * s, 1.2 * s); g.fill(); g.fillStyle = '#FFF4DC'; g.fillRect(-3 * s, -1.2 * s, 3 * s, 2.4 * s); g.restore(); }
  else if(r2 > 0.84){ const p = q(0.6, 0.4 + r * 0.2); g.fillStyle = '#6EC8FF'; g.beginPath(); g.arc(p[0], p[1] - 1.4 * s, 2.4 * s, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(p[0] - 0.8 * s, p[1] - 2.2 * s, 0.8 * s, 0, TAU); g.fill(); }
  else if(r2 < 0.14){ const p = q(0.45, 0.55); g.strokeStyle = '#9AA4B0'; g.lineWidth = 1 * s; [0, 1, 2].forEach(n => { const a = n * Math.PI / 3; line(g, [p[0] - Math.cos(a) * 3.4 * s, p[1] - Math.sin(a) * 1.7 * s], [p[0] + Math.cos(a) * 3.4 * s, p[1] + Math.sin(a) * 1.7 * s]); }); g.fillStyle = '#E8453C'; g.beginPath(); g.arc(p[0], p[1], 1 * s, 0, TAU); g.fill(); } }});
/* ---------- 🪙🧱🔮 own resource shapes (1 × 1, states full · half · empty) — Props.AR.resKey('toybox', 'coin' | 'brick' | 'gem') ---------- */
// 🪙 Toy Tokens: a sand bucket brimming with gold toy tokens (a star stamped on each) + a little spade (half = a few · empty = the bucket tipped, one token out)
function tokenPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = dead(c), P0 = pt(v); g.save(); g.translate(x, y); g.scale(k * 1.2 * (v % 3 === 2 ? -1 : 1), k * 1.2);
  g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, 0, 1, 15, 5); g.fill(); const bc = dim(c, [P0.b, P0.a, P0.d][v % 3]);
  const coin = (cx, cy, r, i) => { g.fillStyle = dim(c, GOLDD); g.beginPath(); D.ell(g, cx, cy + 1, r, r * 0.55); g.fill(); g.fillStyle = dim(c, i % 2 ? '#FFD45A' : GOLD); g.beginPath(); D.ell(g, cx, cy, r, r * 0.55); g.fill(); g.fillStyle = dim(c, GOLDD); g.beginPath(); D.star(g, cx, cy, r * 0.5, r * 0.22, 5); g.fill(); };
  if(st === 'empty'){ g.save(); g.translate(-2, -5); g.rotate(1.3); g.fillStyle = bc; g.beginPath(); g.moveTo(-6, -7); g.lineTo(6, -7); g.lineTo(4.4, 6); g.lineTo(-4.4, 6); g.closePath(); g.fill(); g.fillStyle = D.sh(bc, -0.3); g.beginPath(); D.ell(g, 0, -7, 6, 2.2); g.fill(); g.restore(); coin(8, -1, 3.4, 1); g.restore(); return; }
  g.fillStyle = bc; g.beginPath(); g.moveTo(-8, -15); g.lineTo(8, -15); g.lineTo(6, 0); g.quadraticCurveTo(0, 2.4, -6, 0); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(-6, -13, 2, 11);
  g.strokeStyle = D.sh(bc, -0.3); g.lineWidth = 1; g.beginPath(); g.arc(0, -15, 8.4, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  const n = st === 'full' ? [[-4, -17, 3.4], [2, -18, 3.4], [6, -16, 3.2], [-1, -21, 3.4], [4, -22, 3]] : [[-3, -16, 3.2], [3, -16, 3.2]]; n.forEach(([cx, cy, r], i) => coin(cx, cy, r, i));
  g.strokeStyle = dim(c, WOODD); g.lineWidth = 1.4; line(g, [9, -2], [13, -16]); g.fillStyle = dim(c, P0.c); g.beginPath(); g.moveTo(8, -1); g.lineTo(11, -1); g.lineTo(10.6, 4); g.lineTo(7.6, 3); g.closePath(); g.fill();
  if(!c){ g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); D.star(g, -6 + 3 * Math.sin(ph(t, 2.4)), st === 'full' ? -25 : -20, 2.4 * tw(t, 1), 0.8, 4); g.fill(); }
  g.restore(); }
// 🧱 Building Blocks: a pyramid of painted blocks (3-2-1) (half = 2 + 1 · empty = one block + one tumbled)
function blockPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', P0 = pt(v), cols = [P0.a, P0.b, P0.c, P0.d, P0.e, P0.a]; g.save(); g.translate(x, y); g.scale(k * 1.15 * (v % 3 === 1 ? -1 : 1), k * 1.15);
  g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, 0, 1, 15, 5); g.fill();
  const cube = (cx, cy, s, col, kind, rot) => { g.save(); g.translate(cx, cy); if(rot) g.rotate(rot); const cl = dim(c, col); g.fillStyle = D.sh(cl, -0.16); g.beginPath(); g.moveTo(0, 0); g.lineTo(s, -s * 0.5); g.lineTo(s, -s * 1.5); g.lineTo(0, -s); g.closePath(); g.fill();
    g.fillStyle = D.sh(cl, 0.12); g.beginPath(); g.moveTo(0, 0); g.lineTo(-s, -s * 0.5); g.lineTo(-s, -s * 1.5); g.lineTo(0, -s); g.closePath(); g.fill(); g.fillStyle = D.sh(cl, 0.25); g.beginPath(); g.moveTo(0, -s); g.lineTo(s, -s * 1.5); g.lineTo(0, -s * 2); g.lineTo(-s, -s * 1.5); g.closePath(); g.fill();
    faceShape(g, (u, z) => [-s + u * s, -s * 0.5 + u * s * 0.5 - z], kind, 0.5, s * 0.5, 0.3, s * 0.3, dead(c) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)'); g.restore(); };
  const s = 5.4; if(st === 'empty'){ cube(-3, 0, s, cols[0], 'star'); cube(7, -1, s * 0.9, cols[2], 'heart', 0.6); g.restore(); return; }
  const lay = st === 'full' ? [[-10, 0, 0], [0, 0, 1], [10, 0, 2], [-5, -10.8, 3], [5, -10.8, 4], [0, -21.6, 5]] : [[-5, 0, 0], [5, 0, 1], [0, -10.8, 2]]; lay.forEach(([cx, cy, i]) => cube(cx, cy, s, cols[(i + v) % 6], SHAPES[i % 6]));
  g.restore(); }
// 🔮 Marbles: a drawstring bag of glass marbles, a few rolled out, swirls inside (half = fewer · empty = the bag flat + one marble)
function marblePaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = dead(c), P0 = pt(v); g.save(); g.translate(x, y); g.scale(k * 1.2 * (v % 3 === 1 ? -1 : 1), k * 1.2);
  g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, 0, 1, 15, 5); g.fill();
  const marble = (cx, cy, r, col, i) => { const cl = dim(c, col); g.fillStyle = D.rad(g, cx - r * 0.4, cy - r * 0.4, r * 0.1, r * 1.2, [[0, D.sh(cl, 0.55)], [0.6, cl], [1, D.sh(cl, -0.35)]]); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 0.7; g.beginPath(); g.arc(cx, cy, r * 0.55, i * 0.8, i * 0.8 + 2.2); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(cx - r * 0.38, cy - r * 0.4, r * 0.22, 0, TAU); g.fill(); };
  const bag = dim(c, v % 3 === 2 ? '#7A5AA8' : v % 3 === 1 ? '#3A6AB8' : '#B84A5A');
  if(st === 'empty'){ g.fillStyle = bag; g.beginPath(); D.ell(g, -3, -2.4, 9, 3.6); g.fill(); g.strokeStyle = dim(c, GOLD); g.lineWidth = 1; g.beginPath(); g.moveTo(-10, -2); g.quadraticCurveTo(-14, -6, -12, -8); g.stroke(); marble(8, -2.6, 2.6, '#6EC8FF', 1); g.restore(); return; }
  g.fillStyle = bag; g.beginPath(); g.moveTo(-9, -2); g.quadraticCurveTo(-11, -14, -4, -18); g.lineTo(4, -18); g.quadraticCurveTo(11, -14, 9, -2); g.quadraticCurveTo(0, 2, -9, -2); g.fill(); g.fillStyle = D.sh(bag, 0.2); g.beginPath(); g.ellipse(-4, -10, 2.4, 6, -0.3, 0, TAU); g.fill();
  g.strokeStyle = dim(c, GOLD); g.lineWidth = 1.2; g.beginPath(); g.moveTo(-4, -18); g.quadraticCurveTo(0, -16, 4, -18); g.stroke(); line(g, [3, -18], [7, -22]); g.fillStyle = dim(c, GOLD); g.beginPath(); g.arc(7.4, -22.6, 1.2, 0, TAU); g.fill();
  const out = st === 'full' ? [[-2, -19.6, 3, '#6EC8FF'], [3, -20, 2.6, '#FF7A9A'], [11, -2, 2.8, '#7AF0B0'], [-12, -1, 2.6, '#FFD45A'], [15, -6, 2.2, '#C9A8F0']] : [[0, -19.4, 2.8, '#6EC8FF'], [11, -2, 2.6, '#FF7A9A']];
  out.forEach(([cx, cy, r, col], i) => marble(cx, cy, r, col, i));
  if(!c){ g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); D.star(g, 4 + 4 * Math.cos(ph(t, 2.4)), st === 'full' ? -25 : -23, 2.4 * tw(t, 2), 0.8, 4); g.fill(); }
  g.restore(); }
const RES = (slot, name, h, tag, paint, live) => organic('toybox', 'toybox_' + slot, Object.assign({name, look: 'toybox', side: 'toybox', slot, kind: 'thing', foot: [1, 1], h, variants: 3, block: true, states: ['full', 'half', 'empty'], state: 'full', dead: 'keep',
  tags: ['ar', 'ar-res', 'resource', tag, 'ar-toybox'], conds: {'*': (g, x, y, k, t, v, c, L) => paint(g, x, y, k, t, v, L, c)},
  diffs: [{by: 'state', a: 'full', b: 'half', level: 'bold', name: 'half gathered'}, {by: 'state', a: 'half', b: 'empty', level: 'bold', name: 'all gathered'}, {by: 'v', level: 'quiet', name: 'colour'}]}, live ? {live, liveStates: ['full', 'half']} : {}), (g, x, y, k, t, v, L) => paint(g, x, y, k, t, v, L, null));
RES('coin', 'Token bucket', 36, 'coin', tokenPaint, {period: 2.4, frames: 6}); RES('brick', 'Block stack', 36, 'brick', blockPaint); RES('gem', 'Marble bag', 36, 'gem', marblePaint, {period: 2.4, frames: 6});
/* ---------- 🏺 ORIGIN RELIC (ip-4f sample, Aowu 2026-11-20 12:39 "each side one Relic that emphasizes their origins") — 🧸 the First Teddy:
   a GIANT patched teddy-bear head (one button eye, stitched smile, a bow in the team colour, a wind-up key turning behind) on a pedestal of three big toy blocks.
   2 × 2, states home (on its plinth, glowing) · taken (the plinth stands empty — a hero carried it off). Props.AR.ORIGIN.toybox.icon(g, x, y, k, lit) = the carried / dropped / HUD form. ---------- */
function teddyHead(g, x, y, s, c, o){ o = o || {}; const cl = dim(c, '#C8864A'), dk = D.sh(cl, -0.22), lt = D.sh(cl, 0.3), br = dead(c);
  [-1, 1].forEach(sd => { g.fillStyle = cl; g.beginPath(); g.arc(x + sd * 15 * s, y - 15 * s, 8 * s, 0, TAU); g.fill(); g.fillStyle = sd < 0 ? dim(c, '#F2C8A0') : lt; g.beginPath(); g.arc(x + sd * 15 * s, y - 15 * s, 4.4 * s, 0, TAU); g.fill(); });
  g.strokeStyle = 'rgba(80,40,20,0.5)'; g.lineWidth = 0.9 * s; g.setLineDash([1.6 * s, 1.2 * s]); g.beginPath(); g.arc(x - 15 * s, y - 15 * s, 4.4 * s, 0, TAU); g.stroke(); g.setLineDash([]);   // a patched ear
  g.fillStyle = D.rad(g, x - 6 * s, y - 8 * s, 2 * s, 24 * s, [[0, lt], [0.55, cl], [1, dk]]); g.beginPath(); g.arc(x, y, 18 * s, 0, TAU); g.fill();
  g.fillStyle = dim(c, '#F2D0A8'); g.beginPath(); D.ell(g, x, y + 6 * s, 9 * s, 7 * s); g.fill(); g.fillStyle = INK; g.beginPath(); D.ell(g, x, y + 2.6 * s, 3.4 * s, 2.4 * s); g.fill();
  g.strokeStyle = INK; g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(x, y + 5 * s); g.lineTo(x, y + 8 * s); g.stroke(); g.beginPath(); g.arc(x - 3 * s, y + 8 * s, 3 * s, 0.2, Math.PI - 0.6); g.stroke(); g.beginPath(); g.arc(x + 3 * s, y + 8 * s, 3 * s, 0.6, Math.PI - 0.2); g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(x - 7 * s, y - 5 * s, 2.6 * s, 0, TAU); g.fill(); g.fillStyle = WHITE; g.beginPath(); g.arc(x - 7.8 * s, y - 6 * s, 0.9 * s, 0, TAU); g.fill();
  button2(g, x + 7 * s, y - 5 * s, 3.6 * s, dim(c, '#3D7FD9'));   // the button eye
  g.strokeStyle = 'rgba(80,40,20,0.45)'; g.lineWidth = 0.9 * s; g.setLineDash([1.6 * s, 1.2 * s]); g.beginPath(); g.moveTo(x, y - 18 * s); g.lineTo(x, y - 10 * s); g.stroke(); g.setLineDash([]);
  if(o.bow){ g.fillStyle = br ? '#8A8090' : o.bow; [-1, 1].forEach(sd => { g.beginPath(); g.moveTo(x, y + 18 * s); g.lineTo(x + sd * 10 * s, y + 13 * s); g.lineTo(x + sd * 10 * s, y + 23 * s); g.closePath(); g.fill(); }); g.beginPath(); g.arc(x, y + 18 * s, 3 * s, 0, TAU); g.fill(); } }
function button2(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = D.sh(col, -0.4); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { g.beginPath(); g.arc(x + a * r * 0.3, y + b * r * 0.3, r * 0.14, 0, TAU); g.fill(); }); }
(function(){ const P0 = PAINT[0], def = add('toybox', 'toybox_relic', {name: 'The First Teddy', look: 'toybox', side: 'toybox', slot: 'origin', kind: 'landmark', foot: [2, 2], door: null, h: 130, variants: 1, block: true,
    states: ['home', 'taken'], state: 'home', tags: ['ar', 'ar-origin', 'ar-toybox', 'relic', 'origin'], live: {period: 2.4, frames: 6},
    diffs: [{by: 'state', a: 'home', b: 'taken', level: 'bold', name: 'the First Teddy carried off (plinth empty)'}]});
  def.build = (B, v, L) => { const c = L.cond, br = dead(c), home = (L.state || 'home') === 'home' && !br; K.AR.kerb(B, L, 2, 2);
    B.flat(0.06, 0.06, 1.88, 1.88, WOODL);
    const pb = toyBlock(B, 0.4, 0.4, 0, 1.2, 26, P0.b, 'star', c); if(!br) toyBlock(B, 0.55, 0.55, 26, 0.9, 20, P0.c, 'heart', c); if(!br) toyBlock(B, 0.7, 0.7, 46, 0.6, 14, P0.a, 'circle', c);
    trim(B, L, pb, 6, 3);
    if(home){ halo(B, 1, 1, 96, 46, '#FFE6A8', 0.45, {pulse: t => still(c) ? 1 : 0.88 + Math.sin(ph(t, 2.4)) * 0.08 + Math.cos(ph(t, 2.4)) * 0.04});
      B.custom(1, 1, (g, P, k, t) => { const bob = still(c) ? 0 : Math.sin(ph(t, 2.4)) * 1.6 + Math.cos(ph(t, 2.4)) * 0.6, q = P(1, 1, 60), x = q[0], y = q[1] - 34 * k - bob * k;   // 🧸 the giant head + a wind-up key turning behind
        windKey(g, x + 14 * k, y - 10 * k, k * 1.6, still(c) ? 0.4 : ph(t, 2.4) / 3, GOLD, c); teddyHead(g, x, y, k * 1.55, c, {bow: teamOf(L)});
        if(!still(c)) [[-30, -30], [32, -14], [22, -44]].forEach(([dx, dy], i) => { g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); D.star(g, x + dx * k, y + dy * k, (2.4 + tw(t, i) * 1.6) * k, 0.9 * k, 4); g.fill(); }); }, {layer: 6, zb: 60, top: 128});
    } else if(!br) B.custom(1, 1, (g, P, k, t) => { const q = P(1, 1, 60); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.6 * k; g.setLineDash([3 * k, 2.4 * k]); g.beginPath(); D.ell(g, q[0], q[1], 12 * k, 6 * k); g.stroke(); g.setLineDash([]);   // taken: an outline where it sat + a waiting twinkle
      g.fillStyle = 'rgba(255,240,190,0.9)'; g.beginPath(); D.star(g, q[0] + 6 * k, q[1] - 8 * k, (2.4 + tw(t, 1)) * k, 0.9 * k, 4); g.fill(); }, {layer: 6, zb: 60, top: 76});
    [[0.2, 1.8], [1.8, 0.2]].forEach(([x, y]) => pennant(B, L, x, y, 0, 46, {emblem: teddyEm, pole: POLE})); };
  const AR = Props.AR; AR.ORIGIN = AR.ORIGIN || {}; AR.ORIGIN.toybox = {key: 'toybox_relic', name: 'The First Teddy', icon: (g, x, y, k, lit) => teddyHead(g, x, y, k * 0.6, lit === false ? {} : null, {bow: '#E8453C'})};
})();
/* ---------- 🧱 walls: a low wall of painted toy blocks (a shape on each) · posts = round block pillars with a ball on top · gate = two block pillars under a 🌈 STACKING-RING
   rainbow arch over painted doors · 🏯 tall = a big-block rampart + round towers under striped party-hat roofs + a 🥁 toy-drum gatehouse ---------- */
(function(){ const {wallProp, gateProp, gateDoors, longFaces, tallWallProp, tallGateProp} = K.AR, P0 = PAINT[0];
  const skin = {name: 'Toy-block wall', gateName: 'Rainbow-ring gate', h: 46, gateH: 92,
    seg(B, L, r, c, v){ const [x, y, w, d, ax] = r, br = dead(c), H = br ? 10 : 20, b = B.box(x, y, 0, w, d, H, WOOD);
      ['front', 'right', 'left', 'back'].forEach((s, i) => { const aw = s === 'front' || s === 'back' ? w : d; B.decal(b, s, ...F(b, s), 0, H, WOOD, {paint: blockWall(H, 0, 17 + i + Math.round((x + y) * 10), Math.max(0.3, aw), br ? 10 : 20, c)}); });
      trim(B, L, b, br ? 3 : 13, 3, longFaces(ax)); if(br) return; B.box(x, y, H, w, d, 2, dim(c, CREAM)); },
    post(B, L, kind, c){ const br = dead(c); B.drum(0.5, 0.5, 0, 0.2, br ? 12 : 26, dim(c, kind === 'end' || kind === 'solo' ? P0.b : P0.c), {rings: 2});
      B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 4), rx = 0.2 * HTW * k * S2, col = team(c, L); g.fillStyle = col; g.beginPath(); g.ellipse(q[0], q[1] - 6 * k, rx, rx / 2, 0, 0, Math.PI); g.lineTo(q[0] - rx, q[1] - 10 * k); g.ellipse(q[0], q[1] - 10 * k, rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill(); }, {layer: 1, zb: 4, top: 14});
      if(!br) ballPost(B, c, 0.5, 0.5, 26, 0.14, 1, P0.c, kind === 'end' || kind === 'solo' ? P0.a : P0.d, 3); },
    gate(B, L, open, c, v){ const t = 0.17, H = 44, br = dead(c);
      [[0.04, 0.22, P0.b], [0.74, 0.22, P0.d]].forEach(([x0, w, col], i) => { const ph2 = br ? 16 : H, pb = B.box(x0, 0.5 - t, 0, w, 2 * t, ph2, dim(c, col));   // two block pillars (3 painted blocks each)
        ['front', 'right', 'left', 'back'].forEach((s, j) => B.decal(pb, s, ...F(pb, s), 0, ph2, col, {paint: blockWall(ph2, 0, 61 + i * 7 + j, 0.4, H / 3, c)})); trim(B, L, pb, 4, 3); B.box(x0 - 0.02, 0.5 - t - 0.02, ph2, w + 0.04, 2 * t + 0.04, 3, dim(c, CREAM)); });
      gateDoors(B, open, c, 30, dim(c, P0.c), P0.a, {paint: (g, Q, k) => { faceShape(g, Q, 'star', 0.5, 15, 0.22, 6, dim(c, WHITE)); g.strokeStyle = 'rgba(58,42,48,0.35)'; g.lineWidth = 0.9 * k; line(g, Q(0.5, 1), Q(0.5, 29)); }});
      B.custom(0.5, 0.5, (g, P, k) => { const m = P(0.5, 0.5, H), rings = [P0.a, '#FF8A1E', P0.c, P0.d, P0.b, P0.e];   // 🌈 the stacking-ring rainbow arch
        if(br){ g.fillStyle = dim(c, P0.a); g.beginPath(); D.ell(g, m[0] - 12 * k, m[1] + 30 * k, 8 * k, 3.4 * k); g.fill(); g.fillStyle = dim(c, P0.c); g.beginPath(); D.ell(g, m[0] + 10 * k, m[1] + 32 * k, 7 * k, 3 * k); g.fill(); return; }
        rings.forEach((col, i) => { g.strokeStyle = dim(c, col); g.lineWidth = 3.4 * k; g.beginPath(); g.arc(m[0], m[1] + 4 * k, (26 - i * 3.6) * k, Math.PI, TAU); g.stroke(); });
        const col = teamOf(L); g.fillStyle = col; g.beginPath(); g.arc(m[0], m[1] - 4 * k, 6.4 * k, 0, TAU); g.fill(); teddyEm(g, m[0], m[1] - 4 * k, 3.8 * k, inkOf(col)); }, {layer: 2, zb: H - 2, top: H + 30});
      if(!br) [[0.15], [0.85]].forEach(([x]) => pennant(B, L, x, 0.5, H, 16, {w: 11, hh: 7, emblem: teddyEm, pole: POLE})); } };
  wallProp('toybox', 'toybox', skin); gateProp('toybox', 'toybox', skin);
  const tall = {name: 'Big-block rampart', gateName: 'Toy-drum gatehouse', base: 30, h: 122, gateH: 128,
    rampart(B, L, r, c, hb){ const [x, y, w, d, ax] = r, e = 0.08, b = ax === 'x' ? B.box(x, y - e, 0, w, d + 2 * e, hb, WOOD) : B.box(x - e, y, 0, w + 2 * e, d, hb, WOOD);
      ['front', 'right', 'left', 'back'].forEach((s, i) => { const aw = s === 'front' || s === 'back' ? b.w : b.d; B.decal(b, s, ...F(b, s), 0, hb, WOOD, {paint: blockWall(hb, 0, 31 + i + Math.round((x + y) * 10), Math.max(0.4, aw), 15, c)}); }); },
    tower(B, L, c, cx, cy, hb, kind, hw){ const br = dead(c), H = hb + (kind === 'gate' ? 30 : 40), col = kind === 'gate' ? P0.b : [P0.a, P0.d, P0.e][Math.round(cx * 7 + cy * 3) % 3];
      B.drum(cx, cy, 0, hw * 1.05, br ? H - 14 : H, dim(c, col), {rings: 3}); drumBand(B, L, c, cx, cy, (br ? H - 14 : H) - 10, hw * 1.05, 5, {layer: 2});
      B.custom(cx, cy, (g, P, k) => { const w0 = P(cx, cy + hw * 1.05, hb + 8); g.fillStyle = lightOf(c) ? '#FFF2B8' : '#3A3440'; g.beginPath(); D.rr(g, w0[0] - 2 * k, w0[1] - 5 * k, 4 * k, 7 * k, 2 * k); g.fill(); }, {layer: 2, zb: hb, top: hb + 14});
      if(br) return; B.custom(cx, cy, (g, P, k) => { stripeCone(g, P, k, cx, cy, H, hw * 1.25, kind === 'gate' ? 18 : 26, P0.c, WHITE, 4, {hemCol: P0.c}); }, {layer: 3, zb: H, top: H + 28});
      pennant(B, L, cx, cy, H + (kind === 'gate' ? 18 : 26), kind === 'gate' ? 10 : 12, {w: 11, hh: 7, emblem: teddyEm, pole: POLE}); },
    gatehouse(B, L, open, c, hb){ const br = dead(c), z0 = 44, t = 0.18;
      gateDoors(B, open, c, 40, dim(c, P0.c), P0.a, {paint: (g, Q, k) => { faceShape(g, Q, 'heart', 0.5, 20, 0.24, 8, dim(c, WHITE)); }});
      const b = B.box(0.26, 0.5 - t, z0, 0.48, 2 * t, br ? 6 : 18, dim(c, P0.a)); if(br) return; ['front', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, 18, P0.a, {paint: blockFace(18, P0.a, 'star', 'rgba(255,255,255,0.9)', 0.48)})); trim(B, L, b, 10, 3, ['front', 'back']);
      B.custom(0.5, 0.5, (g, P, k, t2) => { const q = P(0.5, 0.5, z0 + 18), rx = 15 * k, hh = 14 * k, cy = q[1] - 2 * k, hit = still(c) ? 0 : Math.max(0, Math.sin(ph(t2 || 0, 2.4) * 2 + Math.cos(ph(t2 || 0, 2.4)))) * 3;   // 🥁 a big toy drum on top, sticks crossed
        g.fillStyle = dim(c, P0.d); g.beginPath(); g.ellipse(q[0], cy, rx, rx * 0.42, 0, 0, Math.PI); g.lineTo(q[0] - rx, cy - hh); g.ellipse(q[0], cy - hh, rx, rx * 0.42, 0, Math.PI, 0, true); g.closePath(); g.fill();
        g.strokeStyle = dim(c, GOLD); g.lineWidth = 1.2 * k; g.beginPath(); for(let i = 0; i <= 8; i++){ const x = q[0] - rx + i * rx * 2 / 8, y = cy - (i % 2 ? hh - 2 * k : 2 * k) + Math.sin(i / 8 * Math.PI) * rx * 0.42 * (i % 2 ? 0.7 : 1); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
        g.fillStyle = CREAM; g.beginPath(); D.ell(g, q[0], cy - hh, rx, rx * 0.42); g.fill(); g.strokeStyle = WOODD; g.lineWidth = 2 * k; g.lineCap = 'round'; line(g, [q[0] - 4 * k, cy - hh - 2 * k - hit * k], [q[0] + 12 * k, cy - hh - 18 * k - hit * k]); line(g, [q[0] + 4 * k, cy - hh - 2 * k], [q[0] - 12 * k, cy - hh - 18 * k]);
        g.fillStyle = P0.a; [[12, -18 - hit], [-12, -18]].forEach(([dx, dy]) => { g.beginPath(); g.arc(q[0] + dx * k, cy - hh + dy * k, 2.4 * k, 0, TAU); g.fill(); }); }, {layer: 3, zb: z0 + 18, top: z0 + 60}); } };
  tallWallProp('toybox', 'toybox', skin, tall); tallGateProp('toybox', 'toybox', skin, tall);
  // 🔍 ip-5 diffs: a wall piece is only fair as gone / extra (its joins follow its neighbours) · gates open ↔ shut · tall walls: a tower on a straight piece (v 1)
  DEFS.toybox_wall.diffs = [{by: 'gone', level: 'bold', name: 'wall piece gone'}]; DEFS.toybox_tallwall.diffs = [{by: 'v', level: 'bold', name: 'a tower on the straight piece'}];
  DEFS.toybox_gate.diffs = DEFS.toybox_tallgate.diffs = [{by: 'state', a: 'closed', b: 'open', level: 'bold', name: 'gate open ↔ shut'}];
})();
})();
K.loaded('toybox', 'ip-7a');
})(window.Props && window.Props._K);
