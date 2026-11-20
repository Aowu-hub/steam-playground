
/* 🌍 IsoLook_gear — ⚙️ Gearhaven — AvataRealm side ⑥b on 🚀 moon: 11 buildings · own floor · own resource shapes (cog heap · copper pipes · crystal batteries) · own walls (needs realm) — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['gear'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/gear.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_gear: include IsoProps first'); return; }
if(!K.AR){ console.warn('IsoLook_gear: load IsoLook_realm first (Props.need does it)'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — ⚙️ gear · Gearhaven (AvataRealm side ⑥b, ip-4e pictures, 🌳 IsoProps chat 2026-11-20).
   Built ON 🚀 moon (its moon rocks, crystal trees, moon gardens, grey moon ground, 🍂 versions — a STEAM-PUNK inventor town: brass, copper,
   riveted steel, round portholes, turning cogs, puffing pipes, light bulbs, sparks) + 🏰 realm (team colours · 🏗️ site steps · slots · walls).
   11 buildings = AvataRealm §14a: 🏠 tool shed → gear workshop → Clock-tower Hall · 🏕️ Pogo Gym · 🎠 Steam-bike Garage · 🪽 Gyro Hangar ·
   🩹 Wrench Clinic · 🔧 Catapult Works · 🗼 Periscope Tower · 🎨 Goggle Shop · 🔮 Tesla Workshop · 🕵️ Gear Tunnel · 🐾 Clockwork Zoo.
   Own resource shapes: ⚙️ gear_coin = a pile of brass cogs · 🟫 gear_brick = copper pipes on a rack · 🔋 gear_gem = crystal batteries on a charger.
   Own floor (riveted steel plates + brass gear inlays + oil spots + steam grates) and own walls (⚙️ riveted copper wall · 💡 piston posts ·
   ⚙️ half-cog gate · 🏯 steel rampart + water-tank towers puffing steam + 🕰️ clock gatehouse). Keys gear_<slot>. No words / numbers in the art. */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, halo} = T;
const {pennant, banner, trim, building, addSide, addFloor, tileBase, hash, teamOf, patOf, inkOf, blocks, awning} = K.AR;
const D = PD, TAU = Math.PI * 2, S2 = Math.SQRT2;
const BRASS = '#D9A441', BRASSL = '#F2C866', BRASSD = '#9A6A22', COPPER = '#D9824A', COPPERL = '#F0A870', COPPERD = '#9A4E28', STEEL = '#AEB8C4', STEELL = '#CDD5DE', STEELD = '#6E7A88',
  IRON = '#4A5260', CREAM = '#F2EAD8', BRICK = '#B8644A', GLASS = '#9EE6FF', SPARK = '#7FE8FF', BULB = '#FFE680', OIL = '#2E2A30', RED = '#E85A4A', MINT = '#7AD8B8', WOOD = '#A87444', WOODD = '#6A4424';
const dead = c => c && c.broken, dim = (c, col, f) => c ? (c.broken ? D.sh(col, -0.42) : D.sh(col, f == null ? -0.18 : f)) : col;
const still = c => !!(c && c.still), tw = (t, i, p) => 0.55 + 0.3 * Math.sin(ph(t, p || 2.4) + i * 1.7) + 0.15 * Math.cos(ph(t, p || 2.4) + i * 0.9);
const spin = (t, c, sp) => still(c) || dead(c) ? 0 : (ph(t, 2.4) * (sp || 1) / 6);   // a cog turns 1/6 of a turn a period → 6 frames differ
// ⚙️ the side's emblem: a cog with a hole
function cogEm(g, x, y, r, col){ g.fillStyle = col; gearPath(g, x, y, r, r * 0.74, 8, 0); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(x, y, r * 0.32, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over'; }
addSide('gear', {name: 'Gearhaven', icon: '⚙️', look: 'gear', accent: BRASS, emblem: cogEm, base: 'moon'});
addLook('gear', {name: 'Gearhaven', walls: [CREAM, BRICK, STEELL], roofs: [STEEL, COPPER, IRON], trim: '#3A3030', accent: BRASS, stilts: false, team: null, side: 'gear',
  res: {coin: BRASS, coinDk: BRASSD, rock: '#8A8A96', brick: COPPER, brickDk: COPPERD, leaf: MINT, bark: IRON, gem: GLASS, gemDk: '#3A8AC8', gemHi: '#FFFFFF'}}, 'moon');
/* ---------- 🖌️ Gearhaven painters (screen space unless they take B) ---------- */
// a cog outline path (r outer, ri tooth root, n teeth, a = turn)
function gearPath(g, x, y, r, ri, n, a){ g.beginPath(); for(let i = 0; i < n; i++){ const a0 = a + i / n * TAU, w = TAU / n; [[0, ri], [0.12, r], [0.38, r], [0.5, ri]].forEach(([f, rr], j) => { const an = a0 + f * w, px = x + Math.cos(an) * rr, py = y + Math.sin(an) * rr; i === 0 && j === 0 ? g.moveTo(px, py) : g.lineTo(px, py); }); } g.closePath(); }
// ⚙️ a cog (screen space, flat facing us; sq squashes it for a floor gear)
function cog(g, x, y, r, col, a, c, o){ o = o || {}; const cl = dim(c, col || BRASS); g.save(); g.translate(x, y); g.scale(1, o.sq || 1); g.fillStyle = D.sh(cl, -0.25); gearPath(g, 0, 1.2, r, r * 0.76, o.n || 8, a || 0); g.fill();
  g.fillStyle = D.rad(g, -r * 0.3, -r * 0.3, r * 0.1, r * 1.1, [[0, D.sh(cl, 0.35)], [0.6, cl], [1, D.sh(cl, -0.15)]]); gearPath(g, 0, 0, r, r * 0.76, o.n || 8, a || 0); g.fill();
  g.fillStyle = D.sh(cl, -0.3); g.beginPath(); g.arc(0, 0, r * 0.3, 0, TAU); g.fill(); g.fillStyle = D.sh(cl, 0.25); g.beginPath(); g.arc(0, 0, r * 0.16, 0, TAU); g.fill();
  if(!o.plain){ g.fillStyle = D.sh(cl, -0.1); for(let i = 0; i < 4; i++){ const an = (a || 0) + i * TAU / 4 + TAU / 8; g.beginPath(); g.arc(Math.cos(an) * r * 0.52, Math.sin(an) * r * 0.52, r * 0.1, 0, TAU); g.fill(); } } g.restore(); }
// 💡 a light bulb (screen space, standing on y)
function bulb(g, x, y, r, c, on){ g.fillStyle = dim(c, STEELD); g.beginPath(); D.rr(g, x - r * 0.45, y - r * 0.6, r * 0.9, r * 0.6, r * 0.12); g.fill();
  const lv = on && !dead(c); g.fillStyle = lv ? (c ? '#E8D890' : BULB) : '#B8C0C8'; g.beginPath(); g.arc(x, y - r * 1.25, r * 0.8, 0, TAU); g.fill();
  g.strokeStyle = lv ? '#C88A2A' : '#7A8088'; g.lineWidth = Math.max(0.5, r * 0.12); g.beginPath(); g.moveTo(x - r * 0.25, y - r * 0.7); g.lineTo(x - r * 0.15, y - r * 1.3); g.lineTo(x + r * 0.15, y - r * 1.1); g.lineTo(x + r * 0.25, y - r * 0.7); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); D.ell(g, x - r * 0.3, y - r * 1.5, r * 0.18, r * 0.28); g.fill(); }
// ⚡ a little zig-zag spark (screen space)
function zap(g, x0, y0, x1, y1, k, t, i, col){ const n = 5, R = rnd(Math.floor(((t || 0) * 10) % 60) + (i || 0) * 7 + 1); g.strokeStyle = col || SPARK; g.lineWidth = 1.6 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0);
  for(let j = 1; j < n; j++){ const f = j / n; g.lineTo(x0 + (x1 - x0) * f + (R() - 0.5) * 8 * k, y0 + (y1 - y0) * f + (R() - 0.5) * 8 * k); } g.lineTo(x1, y1); g.stroke(); g.strokeStyle = '#FFFFFF'; g.lineWidth = 0.7 * k; g.stroke(); }
// a round porthole window (decal paint) — brass rim, glows mint when lit
const porthole = (h, c) => (g, Q, k) => { const m = Q(0.5, h / 2), r = Math.abs(Q(1, 0)[0] - Q(0, 0)[0]) * 0.42, lv = lightOf(c); g.fillStyle = BRASS; g.beginPath(); D.ell(g, m[0], m[1], r, h * 0.48 * k); g.fill();
  g.fillStyle = lv === 1 ? '#C8FFF0' : lv ? '#A8C8C0' : '#2E3640'; g.beginPath(); D.ell(g, m[0], m[1], r * 0.7, h * 0.34 * k); g.fill(); g.fillStyle = BRASSD; [0, 1, 2, 3].forEach(i => { const a = i * TAU / 4 + 0.4; g.beginPath(); g.arc(m[0] + Math.cos(a) * r * 0.85, m[1] + Math.sin(a) * h * 0.41 * k, 0.8 * k, 0, TAU); g.fill(); }); };
// a riveted steel door (decal paint)
const plateDoor = (h, c) => (g, Q, k) => { const a = Q(0, 0), b = Q(1, 0), tp = Q(1, h), tq = Q(0, h); polyP(g, [a, b, tp, tq]); g.fillStyle = dim(c, STEELD); g.fill();
  g.strokeStyle = 'rgba(30,30,40,0.4)'; g.lineWidth = 0.9 * k; line(g, Q(0.5, 0), Q(0.5, h)); line(g, Q(0, h * 0.5), Q(1, h * 0.5)); g.fillStyle = BRASSL; [[0.12, 2], [0.88, 2], [0.12, h - 2], [0.88, h - 2], [0.38, h * 0.5], [0.62, h * 0.5]].forEach(([u, z]) => { const p = Q(u, z); g.beginPath(); g.arc(p[0], p[1], 0.9 * k, 0, TAU); g.fill(); });
  const hd = Q(0.6, h * 0.42); g.fillStyle = BRASS; g.beginPath(); g.arc(hd[0], hd[1], 1.6 * k, 0, TAU); g.fill(); };
// riveted plates over a whole face (decal paint)
const plates = (h, col, seed, rows) => (g, Q, k) => { const R = rnd(seed || 7), n = rows || Math.max(1, Math.round(h / 14)); g.strokeStyle = 'rgba(30,24,30,0.32)'; g.lineWidth = 0.9 * k;
  for(let i = 1; i < n; i++) line(g, Q(0, h * i / n), Q(1, h * i / n)); for(let i = 0; i < n; i++){ const off = (i % 2) * 0.17 + R() * 0.05; for(let u = off + 0.33; u < 0.99; u += 0.33) line(g, Q(u, h * i / n), Q(u, h * (i + 1) / n)); }
  g.fillStyle = 'rgba(255,240,200,0.75)'; for(let i = 0; i <= n; i++) for(let u = 0.06; u < 1; u += 0.16){ const p = Q(u, Math.min(h - 1.2, Math.max(1.2, h * i / n + (i === n ? -1.4 : 1.4)))); g.beginPath(); g.arc(p[0], p[1], 0.7 * k, 0, TAU); g.fill(); } };
// a box with riveted plates on its seen faces
function plateBox(B, x, y, z, w, d, h, col, seed){ const b = B.box(x, y, z, w, d, h, col || STEEL); ['front', 'right', 'left', 'back'].forEach((s, i) => B.decal(b, s, ...F(b, s), 0, h, col || STEEL, {paint: plates(h, col, (seed || 5) + i)})); return b; }
// red-brick walls (factory)
function brickBox(B, x, y, z, w, d, h, seed){ const b = B.box(x, y, z, w, d, h, BRICK); ['front', 'right', 'left', 'back'].forEach((s, i) => B.decal(b, s, ...F(b, s), 0, h, BRICK, {paint: blocks(h, BRICK, (seed || 5) + i, 9)})); return b; }
// a team band round a drum
function drumBand(B, L, c, x, y, z, r, h, o){ B.custom(x, y, (g, P, k) => { const r2 = P(x, y, z + h), rx = r * HTW * k * S2, col = dead(c) ? '#8A8090' : teamOf(L);
    g.fillStyle = col; g.beginPath(); g.ellipse(r2[0], r2[1] + h * k, rx, rx / 2, 0, 0, Math.PI); g.lineTo(r2[0] - rx, r2[1]); g.ellipse(r2[0], r2[1], rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill();
    if(!dead(c)) K.AR.patPaint(g, (s, vv) => { const u = -1 + s / (rx * 2 / k) * 2; return [r2[0] + u * rx, r2[1] + h * k + Math.sqrt(Math.max(0, 1 - u * u)) * rx / 2 - vv * k]; }, rx * 2 / k, h, patOf(L), inkOf(col), k); }, Object.assign({layer: 1, zb: z, top: z + h}, o || {})); }
// 🏭 a chimney pipe (drum) with a brass ring + steam puffs (fx)
function chimney(B, c, x, y, z, r, h, o){ o = o || {}; const br = dead(c); B.drum(x, y, z, r, br ? h * 0.4 : h, o.col || COPPER, {rings: 0}); if(br) return; B.drum(x, y, z + h - 4, r * 1.25, 4, BRASS, {rings: 0});
  B.custom(x, y, (g, P, k, t) => { if(still(c)) return; const q = P(x, y, z + h); T.puffs(g, q[0], q[1] - 2 * k, k, t, {n: o.n || 3, rise: o.rise || 24, period: 2.4, r: 2.4, col: 'rgba(250,250,255,0.82)'}); }, {layer: 6, zb: z + h, top: z + h + 30, fx: true}); }
const glowAt = (B, c, x, y, z, r, col, a, i) => { if(dead(c)) return; halo(B, x, y, z, r, col, a * (c ? 0.5 : 1), {pulse: t => still(c) ? 1 : 0.86 + Math.sin(ph(t, 2.4) + (i || 0)) * 0.09 + Math.cos(ph(t, 2.4) + (i || 0) * 2) * 0.05}); };
// a scrap patch: a bolt, a nut, a little spring (ground deco)
function scrap(B, x, y, c, seed){ B.custom(x, y, (g, P, k) => { const q = P(x, y, 0), R = rnd(seed || 4); g.fillStyle = 'rgba(40,36,40,0.25)'; g.beginPath(); D.ell(g, q[0], q[1], 9 * k, 3.6 * k); g.fill();
    cog(g, q[0] - 4 * k, q[1] - 2 * k, 3.6 * k, R() < 0.5 ? BRASS : COPPER, R() * 3, c, {sq: 0.5, plain: true}); g.fillStyle = dim(c, STEELD); g.beginPath(); D.rr(g, q[0] + 2 * k, q[1] - 3 * k, 6 * k, 2.2 * k, 0.8 * k); g.fill(); g.fillStyle = dim(c, STEEL); g.beginPath(); D.star(g, q[0] + 4 * k, q[1] + 1 * k, 1.8 * k, 1.5 * k, 6); g.fill(); }, {layer: 3, zb: 0, top: 8}); }
const GH = (slot, o, build) => building('gear', slot, o, build);
const team = (c, L) => dead(c) ? '#8A8090' : teamOf(L);
// a little cog that turns on a wall (live), in a world-space custom
function wallCog(B, c, x, y, z, r, col, sp, layer){ B.custom(x, y, (g, P, k, t) => { const q = P(x, y, z); cog(g, q[0], q[1], r * k, col, spin(t, c, sp), c); }, {layer: layer || 3, zb: z - r, top: z + r + 2}); }
/* ============================ 🏠 HOUSE — 3 levels, each a new SHAPE ============================ */
GH('house', {name: 'Clock-tower Hall', h: 140, names: {'1': 'Tool Shed', '2': 'Gear Workshop', '3': 'Clock-tower Hall'}, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond, lv = L.state || '1';
  if(lv === '1'){ // 🧰 a corrugated tool shed: a steel box with a shed roof, a wrench sign, a cog on the wall, a toolbox + oil can outside
    B.flat(0.1, 0.1, 2.8, 1.8, STEELL);
    const s = plateBox(B, 0.5, 0.35, 0, 1.7, 1.1, dead(c) ? 14 : 26, STEEL, 11);
    B.decal(s, 'front', 1.0, 0.5, 0, 20, STEELD, {k: 'door', paint: plateDoor(20, c)}); B.decal(s, 'right', 0.6, 0.3, 10, 12, GLASS, {paint: porthole(12, c)});
    trim(B, L, s, 20, 3);
    if(!dead(c)) B.roof(0.42, 0.27, 26, 1.86, 1.26, 12, COPPER, {ridge: 'x', ov: 0.08, kind: 'gable'});
    wallCog(B, c, 1.65, 1.46, 13, 5, BRASS, 1);
    B.custom(2.55, 1.5, (g, P, k) => { const q = P(2.55, 1.5, 0); g.fillStyle = dim(c, RED); g.beginPath(); D.rr(g, q[0] - 9 * k, q[1] - 9 * k, 18 * k, 8 * k, 1.6 * k); g.fill(); g.fillStyle = dim(c, STEELD); g.fillRect(q[0] - 3 * k, q[1] - 12 * k, 6 * k, 2 * k);   // 🧰 toolbox + oil can
      g.fillStyle = dim(c, COPPER); g.beginPath(); D.rr(g, q[0] + 10 * k, q[1] - 10 * k, 6 * k, 9 * k, 1.4 * k); g.fill(); g.strokeStyle = dim(c, COPPERD); g.lineWidth = 1.2 * k; line(g, [q[0] + 15 * k, q[1] - 9 * k], [q[0] + 20 * k, q[1] - 14 * k]); }, {layer: 3, zb: 0, top: 14});
    B.custom(0.35, 1.55, (g, P, k, t) => { const q = P(0.35, 1.55, 0), sw = still(c) ? 0 : Math.sin(ph(t, 2.4)) * 0.06 + Math.cos(ph(t, 2.4)) * 0.03; g.strokeStyle = IRON; g.lineWidth = 1.8 * k; line(g, q, [q[0], q[1] - 28 * k]);   // 🔧 a wrench sign
      g.save(); g.translate(q[0], q[1] - 26 * k); g.rotate(-0.6 + sw); g.fillStyle = dim(c, STEELL); g.beginPath(); D.rr(g, -2 * k, -2 * k, 16 * k, 4 * k, 1.4 * k); g.fill(); g.beginPath(); g.arc(16 * k, 0, 4.4 * k, 0, TAU); g.fill(); g.fillStyle = 'rgba(0,0,0,0)';
      g.globalCompositeOperation = 'destination-out'; g.fillRect(16 * k, -1.6 * k, 6 * k, 3.2 * k); g.globalCompositeOperation = 'source-over'; g.fillStyle = team(c, L); g.beginPath(); D.rr(g, 2 * k, -1.2 * k, 7 * k, 2.4 * k, 1 * k); g.fill(); g.restore(); }, {layer: 3, zb: 0, top: 40});
    scrap(B, 2.6, 0.4, c, 12);
    pennant(B, L, 0.25, 0.3, 0, 50, {emblem: cogEm, pole: IRON});
    return; }
  if(lv === '2'){ // 🏭 gear workshop: a brick workshop with a riveted copper roof, a BIG turning cog on the front, porthole windows, a chimney puffing steam, a pipe
    B.flat(0.1, 0.1, 2.8, 1.8, STEELL);
    const s = brickBox(B, 0.3, 0.25, 0, 2.3, 1.4, 34, 21);
    B.decal(s, 'front', 1.15, 0.6, 0, 26, STEELD, {k: 'door', paint: plateDoor(26, c)}); [0.5, 2.15].forEach(a => B.decal(s, 'front', a, 0.36, 14, 14, GLASS, {paint: porthole(14, c)})); [0.55, 1.05].forEach(a => B.decal(s, 'right', a, 0.34, 14, 14, GLASS, {paint: porthole(14, c)}));
    trim(B, L, s, 28, 4);
    B.roof(0.22, 0.17, 34, 2.46, 1.56, dead(c) ? 8 : 22, dim(c, COPPER), {ridge: 'x', ov: 0.08, kind: 'gable'});
    wallCog(B, c, 2.62, 1.05, 18, 10, BRASS, 1, 4); wallCog(B, c, 2.62, 0.62, 26, 6, COPPER, -1.6, 4);
    chimney(B, c, 2.3, 0.55, 30, 0.14, 40, {col: STEEL});
    B.custom(0.35, 1.0, (g, P, k) => { const a = P(0.3, 0.6, 30), b2 = P(0.15, 0.6, 30), d2 = P(0.15, 0.6, 0); g.strokeStyle = dim(c, COPPER); g.lineWidth = 3 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b2[0], b2[1]); g.lineTo(d2[0], d2[1]); g.stroke();   // a copper down-pipe
      g.fillStyle = BRASS; [a, b2].forEach(p => { g.beginPath(); g.arc(p[0], p[1], 2.4 * k, 0, TAU); g.fill(); }); }, {layer: 2, zb: 0, top: 34});
    scrap(B, 2.6, 1.7, c, 22);
    pennant(B, L, 2.75, 1.7, 0, 52, {emblem: cogEm, pole: IRON});
    return; }
  // 🕰️ L3 Clock-tower Hall: a brick hall with a copper roof, a tall riveted CLOCK TOWER in the middle (big clock face, a copper dome, a weathervane cog), 2 chimneys, pipes, bulbs
  const h = brickBox(B, 0.2, 0.3, 0, 2.6, 1.3, 36, 31);
  B.decal(h, 'front', 0.35, 0.36, 14, 14, GLASS, {paint: porthole(14, c)}); B.decal(h, 'front', 2.29, 0.36, 14, 14, GLASS, {paint: porthole(14, c)}); [0.45, 0.95].forEach(a => B.decal(h, 'right', a, 0.32, 14, 14, GLASS, {paint: porthole(14, c)}));
  trim(B, L, h, 30, 4);
  B.roof(0.12, 0.22, 36, 2.76, 1.46, dead(c) ? 6 : 18, dim(c, COPPER), {ridge: 'x', ov: 0.06, kind: 'gable'});
  const tw0 = plateBox(B, 1.12, 0.62, 0, 0.76, 0.76, dead(c) ? 50 : 96, STEEL, 33);
  B.decal(tw0, 'front', 1.22, 0.56, 0, 32, STEELD, {k: 'door', paint: plateDoor(32, c)});
  trim(B, L, tw0, dead(c) ? 36 : 44, 4);
  B.custom(1.5, 1.0, (g, P, k, t) => { const br = dead(c), z = br ? 34 : 70, q = P(1.5, 1.38, z), R = 15 * k;   // 🕰️ the clock face on the tower front
    g.fillStyle = BRASSD; g.beginPath(); D.ell(g, q[0] - R * 0.18, q[1], R * 1.05, R * 1.12); g.fill(); g.fillStyle = br ? '#B8B0A0' : CREAM; g.beginPath(); D.ell(g, q[0] - R * 0.18, q[1], R * 0.86, R * 0.94); g.fill();
    g.fillStyle = IRON; for(let i = 0; i < 12; i++){ const a = i / 12 * TAU; g.beginPath(); g.arc(q[0] - R * 0.18 + Math.cos(a) * R * 0.72, q[1] + Math.sin(a) * R * 0.8, (i % 3 ? 0.8 : 1.4) * k, 0, TAU); g.fill(); }
    if(br) return; const m = (t / 2.4) * TAU, hr = m / 12 + 1.1; g.strokeStyle = IRON; g.lineCap = 'round'; g.lineWidth = 1.8 * k; line(g, [q[0] - R * 0.18, q[1]], [q[0] - R * 0.18 + Math.cos(hr - Math.PI / 2) * R * 0.42, q[1] + Math.sin(hr - Math.PI / 2) * R * 0.46]);
    g.lineWidth = 1.2 * k; line(g, [q[0] - R * 0.18, q[1]], [q[0] - R * 0.18 + Math.cos(m - Math.PI / 2) * R * 0.66, q[1] + Math.sin(m - Math.PI / 2) * R * 0.72]); g.fillStyle = RED; g.beginPath(); g.arc(q[0] - R * 0.18, q[1], 1.6 * k, 0, TAU); g.fill(); }, {layer: 3, zb: 54, top: 88});
  B.custom(1.5, 1.0, (g, P, k, t) => { const br = dead(c), q = P(1.5, 1.0, br ? 50 : 96); if(br){ g.fillStyle = IRON; g.beginPath(); D.rr(g, q[0] - 8 * k, q[1] - 6 * k, 16 * k, 6 * k, 2 * k); g.fill(); return; }   // the copper dome + a weathervane cog
    const dm = dome(g, P, k, 1.5, 1.0, 96, 0.56, 22, dim(c, COPPER), {hi: COPPERL}); g.strokeStyle = 'rgba(80,40,20,0.35)'; g.lineWidth = 1 * k; for(let i = -2; i <= 2; i++){ g.beginPath(); g.ellipse(dm.c[0], dm.c[1], Math.abs(dm.rx * i / 2.4), dm.hh, 0, Math.PI, TAU); g.stroke(); }
    g.strokeStyle = IRON; g.lineWidth = 1.6 * k; line(g, [dm.c[0], dm.c[1] - dm.hh], [dm.c[0], dm.c[1] - dm.hh - 10 * k]); cog(g, dm.c[0], dm.c[1] - dm.hh - 14 * k, 5 * k, BRASS, spin(t, c, 1), c); }, {layer: 4, zb: 96, top: 138});
  chimney(B, c, 0.5, 0.55, 36, 0.13, 28); chimney(B, c, 2.5, 0.55, 36, 0.13, 22, {col: STEEL});
  wallCog(B, c, 0.9, 1.62, 26, 7, BRASS, 1.5); wallCog(B, c, 2.12, 1.62, 22, 5, COPPER, -2);
  [[0.7, 1.75], [2.3, 1.75]].forEach(([x, y], i) => { B.custom(x, y, (g, P, k) => { const q = P(x, y, 0); g.strokeStyle = IRON; g.lineWidth = 1.6 * k; line(g, q, [q[0], q[1] - 24 * k]); bulb(g, q[0], q[1] - 24 * k, 4 * k, c, lightOf(c)); }, {layer: 3, zb: 0, top: 34}); glowAt(B, c, x, y, 30, 12, '#FFE890', 0.4, i); });
  banner(B, L, h, 'right', 0.06, 0.24, 6, 20, cogEm);
  pennant(B, L, 0.25, 1.75, 0, 58, {emblem: cogEm, pole: IRON});
});
/* ============================ 🏕️ CAMP — Pogo Gym (a fenced yard with a bounce pad, 3 pogo sticks bouncing, a little steel hut with a coil sign) ============================ */
GH('camp', {name: 'Pogo Gym', h: 80, live: {period: 1.2, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, STEELL);
  const s = plateBox(B, 0.15, 0.15, 0, 0.8, 0.6, 26, STEEL, 41); B.decal(s, 'front', 0.3, 0.4, 0, 20, STEELD, {k: 'door', paint: plateDoor(20, c)}); trim(B, L, s, 20, 3); B.roof(0.1, 0.1, 26, 0.9, 0.7, 10, COPPER, {ridge: 'x', ov: 0.06, kind: 'gable'});
  B.custom(1.15, 1.15, (g, P, k, t) => { const q = P(1.2, 1.2, 0), rx = 0.55 * HTW * k * S2, br = dead(c), dip = still(c) || br ? 0 : Math.max(0, Math.sin(ph(t, 1.2))) * 3 * k;   // 🟡 the bounce pad
    g.fillStyle = IRON; g.beginPath(); D.ell(g, q[0], q[1], rx, rx / 2); g.fill(); for(let i = 0; i < 6; i++){ const a = i / 6 * TAU; g.fillRect(q[0] + Math.cos(a) * rx * 0.9 - 1 * k, q[1] + Math.sin(a) * rx * 0.45 - 4 * k, 2 * k, 4 * k); }
    g.fillStyle = br ? '#5A5A60' : team(c, L); g.beginPath(); D.ell(g, q[0], q[1] - 4 * k + dip * 0.5, rx * 0.84, rx * 0.4); g.fill(); g.strokeStyle = BRASS; g.lineWidth = 1.4 * k; g.beginPath(); D.ell(g, q[0], q[1] - 4 * k, rx * 0.9, rx * 0.44); g.stroke(); }, {layer: -1, zb: 0, top: 6});
  [[1.65, 0.45, 0], [0.5, 1.6, 1], [1.6, 1.6, 2]].forEach(([x, y, i]) => B.custom(x, y, (g, P, k, t) => { const q = P(x, y, 0), br = dead(c), f = still(c) || br ? 0 : Math.abs(Math.sin(ph(t, 1.2) + i * 1.3)), lift = f * 14 * k, squash = 1 - (1 - f) * 0.4;   // 🦘 a pogo stick bouncing
    g.fillStyle = 'rgba(40,36,40,0.25)'; g.beginPath(); D.ell(g, q[0], q[1], 5 * k * (1 - f * 0.4), 2 * k); g.fill(); if(br){ g.save(); g.translate(q[0], q[1] - 2 * k); g.rotate(1.3); g.fillStyle = STEELD; g.fillRect(-2, -1 * k, 24 * k, 2 * k); g.restore(); return; }
    const y0 = q[1] - lift; g.strokeStyle = STEELD; g.lineWidth = 1.4 * k; g.beginPath(); for(let j = 0; j <= 6; j++){ const yy = y0 - j * 1.6 * k * squash; g.lineTo(q[0] + (j % 2 ? 2.4 : -2.4) * k, yy); } g.stroke();
    g.strokeStyle = dim(c, i === 1 ? RED : BRASS); g.lineWidth = 2.4 * k; line(g, [q[0], y0 - 9 * k * squash], [q[0], y0 - 34 * k]); line(g, [q[0] - 6 * k, y0 - 30 * k], [q[0] + 6 * k, y0 - 30 * k]); line(g, [q[0] - 4 * k, y0 - 14 * k], [q[0] + 4 * k, y0 - 14 * k]);
    g.fillStyle = IRON; g.beginPath(); g.arc(q[0], y0, 1.6 * k, 0, TAU); g.fill(); }, {layer: 3, zb: 0, top: 54}));
  B.custom(1.0, 0.1, (g, P, k) => { const pts = [[0.1, 0.1], [1.9, 0.1], [1.9, 1.9]].map(p => P(p[0], p[1], 0)); g.strokeStyle = dim(c, STEELD); g.lineWidth = 1.2 * k; for(let i = 0; i < pts.length - 1; i++){ line(g, [pts[i][0], pts[i][1] - 10 * k], [pts[i + 1][0], pts[i + 1][1] - 10 * k]); line(g, [pts[i][0], pts[i][1] - 5 * k], [pts[i + 1][0], pts[i + 1][1] - 5 * k]); }
    pts.forEach(p => { g.fillStyle = dim(c, BRASS); g.fillRect(p[0] - 1.2 * k, p[1] - 12 * k, 2.4 * k, 12 * k); }); }, {layer: -1, zb: 0, top: 12});
  pennant(B, L, 1.85, 1.0, 0, 52, {emblem: cogEm, pole: IRON});
});
/* ============================ 🎠 RIDE — Steam-bike Garage (a brick garage with a striped roll-up door half open, a steam bike parked out front with a puffing boiler, a tyre stack) ============================ */
GH('ride', {name: 'Steam-bike Garage', h: 96, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 2.88, STEELL);
  const s = brickBox(B, 0.2, 0.2, 0, 1.6, 0.9, 34, 51);
  B.decal(s, 'front', 0.45, 1.1, 0, 26, STEELD, {k: 'door', paint: (g, Q, k) => { const op = dead(c) ? 0.2 : 0.5; polyP(g, [Q(0, 0), Q(1, 0), Q(1, 26), Q(0, 26)]); g.fillStyle = '#2A2630'; g.fill();
    for(let z = 26 * op; z < 26; z += 3){ polyP(g, [Q(0, z), Q(1, z), Q(1, Math.min(26, z + 3)), Q(0, Math.min(26, z + 3))]); g.fillStyle = Math.round(z / 3) % 2 ? STEELL : STEEL; g.fill(); }
    g.fillStyle = BULB; [0.2, 0.8].forEach(u => { const p = Q(u, 26 * op - 1); g.fillRect(p[0] - 2 * k, p[1] - 0.6 * k, 4 * k, 1.2 * k); }); }});
  trim(B, L, s, 28, 3);
  B.roof(0.12, 0.12, 34, 1.76, 1.06, 18, dim(c, STEEL), {ridge: 'x', ov: 0.08, kind: 'gable'});
  chimney(B, c, 1.55, 0.5, 30, 0.1, 30);
  B.custom(1.0, 2.0, (g, P, k, t) => { const q = P(1.0, 2.0, 0), br = dead(c), bob = still(c) || br ? 0 : Math.sin(ph(t, 2.4) * 2) * 0.6 + Math.cos(ph(t, 2.4)) * 0.3;   // 🏍️ the steam bike
    const wheel = (x, y) => { g.strokeStyle = IRON; g.lineWidth = 3 * k; g.beginPath(); D.ell(g, x, y, 9 * k, 9 * k); g.stroke(); g.strokeStyle = dim(c, BRASS); g.lineWidth = 1 * k; for(let i = 0; i < 6; i++){ const a = i / 6 * TAU + spin(t, c, 2); line(g, [x, y], [x + Math.cos(a) * 8 * k, y + Math.sin(a) * 8 * k]); } g.fillStyle = BRASS; g.beginPath(); g.arc(x, y, 1.6 * k, 0, TAU); g.fill(); };
    const wa = [q[0] - 17 * k, q[1] - 9 * k], wb = [q[0] + 17 * k, q[1] - 5 * k]; if(br){ g.save(); g.translate(q[0], q[1] - 4 * k); g.rotate(0.25); wheel(-14 * k, 0); g.restore(); return; }
    wheel(wa[0], wa[1]); wheel(wb[0], wb[1]); const by = q[1] - 18 * k + bob * k;
    g.fillStyle = dim(c, COPPER); g.beginPath(); D.rr(g, q[0] - 10 * k, by - 6 * k, 18 * k, 10 * k, 4 * k); g.fill(); g.fillStyle = BRASS; [-6, 0, 6].forEach(dx => g.fillRect(q[0] + dx * k - 0.6 * k, by - 6 * k, 1.2 * k, 10 * k));
    g.strokeStyle = IRON; g.lineWidth = 2 * k; line(g, wa, [q[0] - 8 * k, by]); line(g, wb, [q[0] + 10 * k, by - 4 * k]); line(g, [q[0] + 10 * k, by - 4 * k], [q[0] + 14 * k, by - 14 * k]); line(g, [q[0] + 10 * k, by - 15 * k], [q[0] + 18 * k, by - 13 * k]);
    g.fillStyle = team(c, L); g.beginPath(); D.rr(g, q[0] - 14 * k, by - 10 * k, 12 * k, 4 * k, 2 * k); g.fill(); bulb(g, q[0] + 19 * k, by - 9 * k, 2.6 * k, c, lightOf(c));
    g.strokeStyle = STEELD; g.lineWidth = 2.4 * k; line(g, [q[0] - 10 * k, by + 2 * k], [q[0] - 22 * k, by + 4 * k]); }, {layer: 3, zb: 0, top: 48});
  B.custom(1.0, 2.0, (g, P, k, t) => { if(dead(c) || still(c)) return; const q = P(1.0, 2.0, 0); T.puffs(g, q[0] - 24 * k, q[1] - 16 * k, k, t, {n: 3, rise: 16, period: 2.4, drift: -8, col: 'rgba(250,250,255,0.75)'}); }, {layer: 6, zb: 10, top: 48, fx: true});
  B.custom(1.75, 1.5, (g, P, k) => { const q = P(1.75, 1.5, 0); for(let i = 0; i < 3; i++){ g.fillStyle = dim(c, IRON); g.beginPath(); D.ell(g, q[0], q[1] - 3 * k - i * 5 * k, 7 * k, 3.2 * k); g.fill(); g.fillStyle = '#6A707A'; g.beginPath(); D.ell(g, q[0], q[1] - 4 * k - i * 5 * k, 3 * k, 1.2 * k); g.fill(); } }, {layer: 3, zb: 0, top: 20});
  banner(B, L, s, 'right', 0.06, 0.24, 6, 20, cogEm);
  pennant(B, L, 0.25, 2.75, 0, 50, {emblem: cogEm, pole: IRON});
});
/* ============================ 🪽 NEST — Gyro Hangar (a round riveted landing pad, a little gyrocopter with a spinning rotor, a striped wind sock, a fuel drum) ============================ */
GH('nest', {name: 'Gyro Hangar', h: 104, live: {period: 1.2, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, STEELL);
  B.drum(1, 1, 0, 0.82, 8, dim(c, STEEL), {rings: 1});
  B.custom(1, 1, (g, P, k) => { const q = P(1, 1, 8), rx = 0.82 * HTW * k * S2; g.fillStyle = dim(c, STEELL); g.beginPath(); D.ell(g, q[0], q[1], rx * 0.98, rx * 0.49); g.fill(); g.strokeStyle = dim(c, BRASS); g.lineWidth = 2.4 * k; g.beginPath(); D.ell(g, q[0], q[1], rx * 0.7, rx * 0.35); g.stroke();
    g.fillStyle = 'rgba(255,240,200,0.8)'; for(let i = 0; i < 12; i++){ const a = i / 12 * TAU; g.beginPath(); g.arc(q[0] + Math.cos(a) * rx * 0.9, q[1] + Math.sin(a) * rx * 0.45, 0.9 * k, 0, TAU); g.fill(); } }, {layer: 1, zb: 8, top: 9});
  drumBand(B, L, c, 1, 1, 1, 0.82, 4);
  B.custom(1, 1, (g, P, k, t) => { const q = P(1, 1, 8), br = dead(c), bob = still(c) || br ? 0 : Math.sin(ph(t, 1.2)) * 1.2 + Math.cos(ph(t, 1.2)) * 0.5, y = q[1] - 14 * k - bob * k;   // 🚁 the gyrocopter
    if(br){ g.fillStyle = dim(c, COPPER); g.beginPath(); D.ell(g, q[0], q[1] - 6 * k, 14 * k, 6 * k); g.fill(); return; }
    g.fillStyle = dim(c, COPPER); g.beginPath(); D.ell(g, q[0], y, 15 * k, 9 * k); g.fill(); g.fillStyle = GLASS; g.beginPath(); D.ell(g, q[0] + 6 * k, y - 3 * k, 6 * k, 4.4 * k); g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); D.ell(g, q[0] + 4 * k, y - 5 * k, 2 * k, 1.2 * k); g.fill();
    g.fillStyle = team(c, L); g.beginPath(); D.rr(g, q[0] - 12 * k, y - 1 * k, 12 * k, 4 * k, 2 * k); g.fill(); g.strokeStyle = dim(c, COPPERD); g.lineWidth = 2.4 * k; line(g, [q[0] - 14 * k, y], [q[0] - 28 * k, y - 4 * k]); cog(g, q[0] - 29 * k, y - 4 * k, 4 * k, BRASS, spin(t, c, 3), c, {plain: true});
    g.strokeStyle = IRON; g.lineWidth = 1.6 * k; line(g, [q[0] - 8 * k, y + 8 * k], [q[0] + 8 * k, y + 8 * k]); line(g, [q[0] - 5 * k, y + 5 * k], [q[0] - 6 * k, y + 8 * k]); line(g, [q[0] + 5 * k, y + 5 * k], [q[0] + 6 * k, y + 8 * k]);
    line(g, [q[0], y - 9 * k], [q[0], y - 16 * k]); const a = still(c) ? 0.3 : ph(t, 1.2) / 3 * 2; g.strokeStyle = STEELD; g.lineWidth = 2.6 * k; for(let i = 0; i < 2; i++){ const an = a + i * Math.PI; line(g, [q[0] - Math.cos(an) * 26 * k, y - 16 * k - Math.sin(an) * 5 * k], [q[0] + Math.cos(an) * 26 * k, y - 16 * k + Math.sin(an) * 5 * k]); }
    g.fillStyle = BRASS; g.beginPath(); g.arc(q[0], y - 16 * k, 2 * k, 0, TAU); g.fill(); }, {layer: 3, zb: 8, top: 54});
  B.custom(1.75, 0.3, (g, P, k, t) => { const q = P(1.75, 0.3, 0), fl = still(c) ? 0 : Math.sin(ph(t, 1.2)) * 2 + Math.cos(ph(t, 1.2)) * 1; g.strokeStyle = IRON; g.lineWidth = 1.8 * k; line(g, q, [q[0], q[1] - 40 * k]); if(dead(c)) return;   // 🎐 wind sock
    for(let i = 0; i < 4; i++){ g.fillStyle = i % 2 ? '#FFFFFF' : RED; const x0 = q[0] + i * 5 * k, w = 5 * k, h0 = (6 - i) * k; g.beginPath(); g.moveTo(x0, q[1] - 40 * k - h0 + fl * i * 0.3 * k); g.lineTo(x0 + w, q[1] - 40 * k - h0 + 1 * k + fl * (i + 1) * 0.3 * k); g.lineTo(x0 + w, q[1] - 40 * k + h0 - 1 * k + fl * (i + 1) * 0.3 * k); g.lineTo(x0, q[1] - 40 * k + h0 + fl * i * 0.3 * k); g.closePath(); g.fill(); } }, {layer: 3, zb: 0, top: 52});
  B.custom(0.3, 1.7, (g, P, k) => { const q = P(0.3, 1.7, 0); g.fillStyle = dim(c, RED); g.beginPath(); D.rr(g, q[0] - 6 * k, q[1] - 14 * k, 12 * k, 14 * k, 2 * k); g.fill(); g.fillStyle = BRASS; [-10, -4].forEach(dy => g.fillRect(q[0] - 6 * k, q[1] + dy * k, 12 * k, 1.4 * k)); }, {layer: 3, zb: 0, top: 16});
  pennant(B, L, 0.25, 0.3, 0, 54, {emblem: cogEm, pole: IRON});
});
/* ============================ 🩹 CARE — Wrench Clinic (a cream clinic with portholes, a big heart + wrench sign on the roof, an oil-can bench, a little helper robot) ============================ */
GH('care', {name: 'Wrench Clinic', h: 90, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, STEELL);
  const s = plateBox(B, 0.25, 0.2, 0, 1.4, 1.05, 28, CREAM, 61);
  B.decal(s, 'front', 0.75, 0.5, 0, 22, STEELD, {k: 'door', paint: plateDoor(22, c)}); B.decal(s, 'front', 0.35, 0.3, 10, 12, GLASS, {paint: porthole(12, c)}); B.decal(s, 'right', 0.5, 0.4, 10, 12, GLASS, {paint: porthole(12, c)});
  trim(B, L, s, 22, 3);
  B.box(0.2, 0.15, 28, 1.5, 1.15, 4, dim(c, STEEL));
  B.custom(0.95, 0.7, (g, P, k, t) => { const q = P(0.95, 0.72, 32), br = dead(c), b = still(c) ? 1 : 1 + Math.sin(ph(t, 2.4)) * 0.06 + Math.cos(ph(t, 2.4)) * 0.03;   // 💗 a big heart crossed with a wrench on the roof
    g.strokeStyle = IRON; g.lineWidth = 1.6 * k; line(g, [q[0] - 6 * k, q[1]], [q[0] - 6 * k, q[1] - 10 * k]); line(g, [q[0] + 6 * k, q[1]], [q[0] + 6 * k, q[1] - 10 * k]);
    g.save(); g.translate(q[0], q[1] - 22 * k); g.scale(b, b); g.fillStyle = br ? '#8A7A80' : '#FF6A8A'; g.beginPath(); g.moveTo(0, 12 * k); g.bezierCurveTo(-17 * k, 0, -11 * k, -13 * k, 0, -6 * k); g.bezierCurveTo(11 * k, -13 * k, 17 * k, 0, 0, 12 * k); g.fill();
    if(!br){ g.rotate(-0.7); g.fillStyle = STEELL; g.beginPath(); D.rr(g, -10 * k, -1.6 * k, 20 * k, 3.2 * k, 1.2 * k); g.fill(); [-1, 1].forEach(sd => { g.beginPath(); g.arc(sd * 11 * k, 0, 3.6 * k, 0, TAU); g.fill(); }); g.fillStyle = '#FF6A8A'; [-1, 1].forEach(sd => g.fillRect(sd * 11 * k + (sd > 0 ? 0 : -4.4 * k), -1.2 * k, 4.4 * k, 2.4 * k)); } g.restore(); }, {layer: 3, zb: 32, top: 70});
  B.custom(1.6, 1.55, (g, P, k, t) => { const q = P(1.6, 1.58, 0), br = dead(c), nod = still(c) || br ? 0 : Math.sin(ph(t, 2.4)) * 1.4 + Math.cos(ph(t, 2.4)) * 0.6;   // 🤖 a little helper robot with an oil can
    g.fillStyle = dim(c, STEELL); g.beginPath(); D.rr(g, q[0] - 6 * k, q[1] - 16 * k, 12 * k, 13 * k, 3 * k); g.fill(); g.fillStyle = dim(c, STEELD); g.fillRect(q[0] - 4 * k, q[1] - 3 * k, 2.4 * k, 3 * k); g.fillRect(q[0] + 1.6 * k, q[1] - 3 * k, 2.4 * k, 3 * k);
    g.fillStyle = dim(c, STEEL); g.beginPath(); D.rr(g, q[0] - 5 * k, q[1] - 25 * k + nod * k, 10 * k, 8 * k, 2.4 * k); g.fill(); g.fillStyle = br ? '#5A5A60' : MINT; [-2, 2].forEach(e => { g.beginPath(); g.arc(q[0] + e * k, q[1] - 21 * k + nod * k, 1.3 * k, 0, TAU); g.fill(); });
    g.strokeStyle = IRON; g.lineWidth = 1 * k; line(g, [q[0], q[1] - 25 * k + nod * k], [q[0], q[1] - 29 * k + nod * k]); g.fillStyle = br ? '#5A5A60' : RED; g.beginPath(); g.arc(q[0], q[1] - 30 * k + nod * k, 1.4 * k, 0, TAU); g.fill();
    g.fillStyle = team(c, L); g.beginPath(); D.rr(g, q[0] - 6 * k, q[1] - 12 * k, 12 * k, 3 * k, 1 * k); g.fill(); g.fillStyle = dim(c, COPPER); g.beginPath(); D.rr(g, q[0] + 7 * k, q[1] - 14 * k, 5 * k, 7 * k, 1.4 * k); g.fill(); }, {layer: 3, zb: 0, top: 34});
  B.custom(0.35, 1.6, (g, P, k) => { const q = P(0.35, 1.62, 0); g.fillStyle = dim(c, WOOD); g.beginPath(); D.rr(g, q[0] - 10 * k, q[1] - 7 * k, 20 * k, 3 * k, 1 * k); g.fill(); g.fillStyle = dim(c, IRON); g.fillRect(q[0] - 9 * k, q[1] - 4 * k, 2 * k, 4 * k); g.fillRect(q[0] + 7 * k, q[1] - 4 * k, 2 * k, 4 * k); }, {layer: 3, zb: 0, top: 10});
  pennant(B, L, 1.8, 0.25, 0, 54, {emblem: cogEm, pole: IRON});
});
/* ============================ 🔧 WORKSHOP — Catapult Works (a wood + brass catapult with a gear winch, a pile of iron balls, a little crane, a shed) ============================ */
GH('workshop', {name: 'Catapult Works', h: 92, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, STEELL);
  const s = plateBox(B, 0.15, 0.15, 0, 0.7, 0.55, 24, STEEL, 71); trim(B, L, s, 18, 3); B.roof(0.1, 0.1, 24, 0.8, 0.65, 10, COPPER, {ridge: 'y', ov: 0.06, kind: 'gable'});
  B.custom(1.1, 1.15, (g, P, k, t) => { const q = P(1.15, 1.2, 0), br = dead(c), arm = still(c) || br ? 0 : Math.sin(ph(t, 2.4)) * 0.08 + Math.cos(ph(t, 2.4)) * 0.04;   // 🪨 the catapult
    g.fillStyle = dim(c, WOOD); g.beginPath(); g.moveTo(q[0] - 22 * k, q[1] - 2 * k); g.lineTo(q[0] + 18 * k, q[1] + 6 * k); g.lineTo(q[0] + 18 * k, q[1] + 1 * k); g.lineTo(q[0] - 22 * k, q[1] - 7 * k); g.closePath(); g.fill();
    [[-14, -4], [12, 2]].forEach(([dx, dy]) => { g.strokeStyle = IRON; g.lineWidth = 2.6 * k; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, 5 * k, 5 * k); g.stroke(); });
    g.fillStyle = dim(c, WOODD); g.beginPath(); g.moveTo(q[0] - 4 * k, q[1] - 2 * k); g.lineTo(q[0] + 2 * k, q[1] - 26 * k); g.lineTo(q[0] + 6 * k, q[1] - 26 * k); g.lineTo(q[0] + 6 * k, q[1]); g.closePath(); g.fill();
    cog(g, q[0] + 4 * k, q[1] - 10 * k, 6 * k, BRASS, spin(t, c, -1), c);
    g.save(); g.translate(q[0] + 4 * k, q[1] - 24 * k); g.rotate(br ? 0.9 : -0.55 + arm); g.fillStyle = dim(c, WOOD); g.beginPath(); D.rr(g, -30 * k, -2 * k, 36 * k, 4 * k, 1.4 * k); g.fill();
    g.fillStyle = dim(c, COPPER); g.beginPath(); g.arc(-30 * k, -3 * k, 5 * k, 0, Math.PI); g.fill(); if(!br){ g.fillStyle = IRON; g.beginPath(); g.arc(-30 * k, -5 * k, 3.6 * k, 0, TAU); g.fill(); } g.restore();
    g.fillStyle = team(c, L); g.beginPath(); D.rr(g, q[0] - 18 * k, q[1] - 7 * k, 12 * k, 3 * k, 1 * k); g.fill(); }, {layer: 3, zb: 0, top: 56});
  B.custom(1.65, 0.45, (g, P, k) => { const q = P(1.65, 0.45, 0); [[0, 0], [-5, -1], [5, -1], [-2.5, -5], [2.5, -5], [0, -9]].forEach(([dx, dy]) => { g.fillStyle = D.rad(g, q[0] + dx * k - 1.4 * k, q[1] + dy * k - 1.6 * k, 0.4, 4 * k, [[0, '#8A92A0'], [1, dim(c, IRON)]]); g.beginPath(); g.arc(q[0] + dx * k, q[1] + dy * k - 3 * k, 3.4 * k, 0, TAU); g.fill(); }); }, {layer: 3, zb: 0, top: 14});
  B.custom(0.3, 1.7, (g, P, k, t) => { const q = P(0.3, 1.7, 0), sw = still(c) ? 0 : Math.sin(ph(t, 2.4)) * 1.6 + Math.cos(ph(t, 2.4)) * 0.8; g.strokeStyle = dim(c, BRASSD); g.lineWidth = 2.4 * k; line(g, q, [q[0], q[1] - 44 * k]); line(g, [q[0], q[1] - 44 * k], [q[0] + 18 * k, q[1] - 40 * k]);   // 🏗️ a little crane with a hook
    g.lineWidth = 0.9 * k; line(g, [q[0] + 16 * k, q[1] - 40 * k], [q[0] + 16 * k + sw * k, q[1] - 24 * k]); g.strokeStyle = IRON; g.lineWidth = 1.4 * k; g.beginPath(); g.arc(q[0] + 16 * k + sw * k, q[1] - 21 * k, 2.4 * k, -Math.PI / 2, Math.PI * 0.8); g.stroke(); }, {layer: 3, zb: 0, top: 50});
  pennant(B, L, 1.8, 1.8, 0, 52, {emblem: cogEm, pole: IRON});
});
/* ============================ 🗼 TOWER — Periscope Tower (a riveted steel column, a railed balcony, a bent periscope top with a glinting lens · stand + aim) ============================ */
GH('tower', {name: 'Periscope Tower', h: 136, stand: [0.5, 0.5, 80], aim: [0.5, 0.5, 98], live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.drum(0.5, 0.5, 0, 0.42, 10, dim(c, STEELD), {rings: 1});
  drumBand(B, L, c, 0.5, 0.5, 2, 0.42, 5);
  B.drum(0.5, 0.5, 10, 0.24, dead(c) ? 26 : 66, dim(c, STEEL), {rings: 4});
  B.custom(0.5, 0.5, (g, P, k) => { const br = dead(c); [24, 48].forEach(z => { if(br && z > 30) return; const q = P(0.5, 0.74, z); g.fillStyle = BRASS; g.beginPath(); g.arc(q[0], q[1], 3.6 * k, 0, TAU); g.fill(); g.fillStyle = lightOf(c) ? '#C8FFF0' : '#2E3640'; g.beginPath(); g.arc(q[0], q[1], 2.4 * k, 0, TAU); g.fill(); });
    const a = P(0.7, 0.5, 14), b2 = P(0.7, 0.5, br ? 30 : 74); g.strokeStyle = dim(c, COPPER); g.lineWidth = 2.4 * k; line(g, a, b2); }, {layer: 2, zb: 10, top: 76});
  B.custom(0.5, 0.5, (g, P, k) => { if(dead(c)) return; const q = P(0.5, 0.5, 76), rx = 0.46 * HTW * k * S2; g.fillStyle = STEELD; g.beginPath(); D.ell(g, q[0], q[1], rx, rx / 2); g.fill(); g.fillStyle = STEELL; g.beginPath(); D.ell(g, q[0], q[1] - 2 * k, rx, rx / 2); g.fill();   // balcony
    const col = team(c, L); g.strokeStyle = col; g.lineWidth = 3 * k; g.beginPath(); g.ellipse(q[0], q[1], rx, rx / 2, 0, 0, Math.PI); g.stroke();
    g.strokeStyle = IRON; g.lineWidth = 1.2 * k; for(let i = 0; i <= 8; i++){ const a = i / 8 * Math.PI, x = q[0] + Math.cos(a) * rx * 0.96, y = q[1] - 2 * k + Math.sin(a) * rx * 0.48; line(g, [x, y], [x, y - 10 * k]); } g.beginPath(); g.ellipse(q[0], q[1] - 12 * k, rx * 0.96, rx * 0.48, 0, 0, Math.PI); g.stroke(); }, {layer: 3, zb: 74, top: 92});
  B.custom(0.5, 0.5, (g, P, k, t) => { if(dead(c)) return; const q = P(0.5, 0.5, 92), turn = still(c) ? 0 : Math.sin(ph(t, 2.4)) * 0.25 + Math.cos(ph(t, 2.4)) * 0.1;   // 🔭 the periscope (turns)
    g.fillStyle = dim(c, BRASS); g.beginPath(); D.rr(g, q[0] - 3 * k, q[1] - 30 * k, 6 * k, 32 * k, 2 * k); g.fill(); g.save(); g.translate(q[0], q[1] - 30 * k); g.scale(Math.cos(turn) < 0 ? -1 : 1, 1);
    g.fillStyle = dim(c, BRASS); g.beginPath(); D.rr(g, -3 * k, -4 * k, 16 * k * Math.abs(Math.cos(turn)) + 3 * k, 7 * k, 2.4 * k); g.fill(); g.fillStyle = IRON; g.beginPath(); D.ell(g, 16 * k * Math.abs(Math.cos(turn)), -0.5 * k, 2.2 * k, 3.6 * k); g.fill(); g.fillStyle = GLASS; g.beginPath(); D.ell(g, 16 * k * Math.abs(Math.cos(turn)) + 0.6 * k, -0.5 * k, 1.4 * k, 2.6 * k); g.fill(); g.restore();
    g.fillStyle = dim(c, COPPER); [4, 18].forEach(dy => g.fillRect(q[0] - 3.6 * k, q[1] - dy * k, 7.2 * k, 2 * k)); }, {layer: 4, zb: 90, top: 128});
  B.custom(0.5, 0.5, (g, P, k, t) => { if(dead(c)) return; const q = P(0.5, 0.5, 92), s = tw(t, 1); g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); D.star(g, q[0] + 18 * k, q[1] - 32 * k, 3.4 * k * s, 1 * k, 4); g.fill(); }, {layer: 6, zb: 110, top: 132, fx: true});
  pennant(B, L, 0.16, 0.84, 78, 18, {emblem: cogEm, pole: IRON, layer: 3, w: 13, hh: 8});
});
/* ============================ 🎨 WARDROBE — Goggle Shop (a copper stall under a striped awning, goggles + a top hat on stands, a gear-framed mirror) ============================ */
GH('wardrobe', {name: 'Goggle Shop', h: 80, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 0.88, STEELL);
  [[0.24, 0.3], [1.3, 0.3], [0.24, 0.72], [1.3, 0.72]].forEach(([x, y]) => B.box(x, y, 0, 0.06, 0.06, 46, dim(c, BRASSD)));
  const ct = plateBox(B, 0.3, 0.34, 0, 1.0, 0.4, 16, COPPER, 81); trim(B, L, ct, 11, 3, ['front']);
  awning(B, 'front', 0.78, 0.2, 1.36, 50, 0.12, 6, dim(c, '#3A6A8A'), dim(c, CREAM), 6, {cond: c});
  B.box(0.2, 0.28, 46, 1.16, 0.5, 4, dim(c, COPPER), {layer: 1});
  B.custom(0.8, 0.5, (g, P, k, t) => { const br = dead(c), a = P(0.38, 0.52, 16), b2 = P(1.22, 0.52, 16);   // 🥽 goggles on stands + a top hat
    [0, 1, 2].forEach(i => { if(br && i) return; const f = 0.15 + i * 0.35, p = [a[0] + (b2[0] - a[0]) * f, a[1] + (b2[1] - a[1]) * f]; g.strokeStyle = IRON; g.lineWidth = 1.2 * k; line(g, p, [p[0], p[1] - 10 * k]);
      const gy = p[1] - 13 * k, col = br ? '#8A8090' : i === 1 ? teamOf(L) : [COPPER, BRASS, '#5A8AC8'][i]; g.fillStyle = col; g.beginPath(); D.rr(g, p[0] - 8 * k, gy - 1.6 * k, 16 * k, 3.2 * k, 1.4 * k); g.fill();
      [-4, 4].forEach(dx => { g.fillStyle = BRASS; g.beginPath(); g.arc(p[0] + dx * k, gy, 3.6 * k, 0, TAU); g.fill(); g.fillStyle = br ? '#5A5A60' : GLASS; g.beginPath(); g.arc(p[0] + dx * k, gy, 2.4 * k, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(p[0] + dx * k - 0.8 * k, gy - 0.8 * k, 0.7 * k, 0, TAU); g.fill(); }); });
    if(br) return; const h0 = P(1.0, 0.5, 46); g.fillStyle = '#2E2A36'; g.beginPath(); D.ell(g, h0[0], h0[1], 9 * k, 2.6 * k); g.fill(); g.fillRect(h0[0] - 6 * k, h0[1] - 12 * k, 12 * k, 12 * k); g.beginPath(); D.ell(g, h0[0], h0[1] - 12 * k, 6 * k, 1.8 * k); g.fill();
    g.fillStyle = BRASS; g.fillRect(h0[0] - 6 * k, h0[1] - 4 * k, 12 * k, 2 * k); cog(g, h0[0] + 3 * k, h0[1] - 7 * k, 2.6 * k, BRASSL, spin(t, c, 1), c, {plain: true}); }, {layer: 2, zb: 16, top: 64});
  B.custom(1.66, 0.5, (g, P, k, t) => { const q = P(1.66, 0.56, 0), br = dead(c); g.strokeStyle = IRON; g.lineWidth = 2 * k; line(g, [q[0], q[1]], [q[0], q[1] - 12 * k]);   // ⚙️ a round mirror in a cog frame
    cog(g, q[0], q[1] - 24 * k, 13 * k, BRASS, spin(t, c, 0.5), c, {plain: true, n: 12}); g.fillStyle = br ? '#7A7480' : D.lin(g, q[0] - 8 * k, q[1] - 32 * k, q[0] + 8 * k, q[1] - 16 * k, [[0, '#E8F4FF'], [1, '#A8C8F0']]); g.beginPath(); g.arc(q[0], q[1] - 24 * k, 8 * k, 0, TAU); g.fill();
    if(!br){ g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1 * k; line(g, [q[0] - 4 * k, q[1] - 28 * k], [q[0], q[1] - 22 * k]); } }, {layer: 3, zb: 0, top: 40});
  pennant(B, L, 0.16, 0.16, 0, 56, {emblem: cogEm, pole: IRON});
});
/* ============================ 🔮 SPELL — Tesla Workshop (a brick lab with a glass roof-light, a tall TESLA COIL with a brass ball, a second small coil, crackling arcs between them) ============================ */
GH('spell', {name: 'Tesla Workshop', h: 124, live: {period: 1.2, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, STEELL);
  const s = brickBox(B, 0.2, 0.7, 0, 1.6, 1.1, 30, 91);
  B.decal(s, 'front', 0.75, 0.5, 0, 24, STEELD, {k: 'door', paint: plateDoor(24, c)}); B.decal(s, 'front', 0.32, 0.3, 10, 12, GLASS, {paint: porthole(12, c)}); B.decal(s, 'right', 1.15, 0.36, 10, 12, GLASS, {paint: porthole(12, c)});
  trim(B, L, s, 24, 3);
  B.box(0.16, 0.66, 30, 1.68, 1.18, 4, dim(c, STEEL));
  B.custom(1.0, 1.25, (g, P, k) => { if(dead(c)) return; const a = P(0.6, 0.95, 34), b2 = P(1.4, 0.95, 34), d2 = P(1.4, 1.55, 34), e = P(0.6, 1.55, 34); polyP(g, [a, b2, d2, e]); g.fillStyle = 'rgba(160,230,255,0.65)'; g.fill(); g.strokeStyle = BRASS; g.lineWidth = 1.4 * k; g.stroke(); line(g, P(1.0, 0.95, 34), P(1.0, 1.55, 34)); }, {layer: 2, zb: 34, top: 35});
  [[0.5, 0.35, 1, 78], [1.65, 0.4, 0.62, 40]].forEach(([x, y, sc, H], i) => {   // ⚡ the coils
    B.drum(x, y, 0, 0.16 * sc + 0.06, 6, dim(c, STEELD), {rings: 0});
    B.custom(x, y, (g, P, k) => { const br = dead(c), q = P(x, y, 6), hh = (br ? H * 0.35 : H) * k, w = (5 + 4 * sc) * k; g.fillStyle = dim(c, COPPER); g.beginPath(); D.rr(g, q[0] - w, q[1] - hh, w * 2, hh, w * 0.4); g.fill();
      g.strokeStyle = dim(c, COPPERD); g.lineWidth = 1 * k; for(let z = 3; z < hh / k - 2; z += 3){ g.beginPath(); g.moveTo(q[0] - w, q[1] - z * k); g.lineTo(q[0] + w, q[1] - z * k - 1 * k); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(q[0] - w * 0.6, q[1] - hh, w * 0.3, hh); if(br) return;
      g.fillStyle = dim(c, STEELL); g.beginPath(); D.ell(g, q[0], q[1] - hh, w * 1.9, w * 0.7); g.fill(); g.fillStyle = D.rad(g, q[0] - 3 * k, q[1] - hh - 9 * sc * k, 1, 9 * k, [[0, '#FFFFFF'], [0.5, BRASSL], [1, BRASSD]]); g.beginPath(); g.arc(q[0], q[1] - hh - 7 * sc * k - 2 * k, 7 * sc * k, 0, TAU); g.fill(); }, {layer: 3, zb: 6, top: H + 22});
    if(i === 0) drumBand(B, L, c, x, y, 0, 0.16 * sc + 0.07, 4, {layer: 2}); });
  B.custom(1.0, 0.4, (g, P, k, t) => { if(dead(c) || still(c)) return; const a = P(0.5, 0.35, 6), b2 = P(1.65, 0.4, 6), A = [a[0], a[1] - 78 * k - 9 * k], Bp = [b2[0], b2[1] - 40 * 0.62 * k - 8 * k];   // ⚡ crackling arcs
    D.glow(g, A[0], A[1], 22 * k, '#A8F4FF', 0.45 * tw(t, 0, 1.2)); zap(g, A[0], A[1], Bp[0], Bp[1], k, t, 0); zap(g, A[0], A[1], A[0] - 14 * k, A[1] - 12 * k, k, t, 2); zap(g, A[0], A[1], A[0] + 10 * k, A[1] - 16 * k, k, t, 3); }, {layer: 6, zb: 40, top: 120, fx: true});
  pennant(B, L, 1.8, 1.8, 0, 56, {emblem: cogEm, pole: IRON});
});
/* ============================ 🕵️ HIDEOUT — Gear Tunnel (a mound of riveted plates, a round COG-shaped hatch rolled half open, eyes in the dark tunnel, pipes poking out) ============================ */
GH('hideout', {name: 'Gear Tunnel', h: 66, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, STEELL);
  B.custom(1, 1, (g, P, k) => { const q = P(1, 0.9, 0), rx = 1.0 * HTW * k * S2, br = dead(c); g.fillStyle = dim(c, '#8A8A96'); g.beginPath(); g.moveTo(q[0] - rx, q[1]); g.quadraticCurveTo(q[0] - rx * 0.9, q[1] - 36 * k, q[0] - rx * 0.2, q[1] - (br ? 34 : 46) * k); g.quadraticCurveTo(q[0] + rx * 0.5, q[1] - 50 * k, q[0] + rx * 0.82, q[1] - 30 * k); g.quadraticCurveTo(q[0] + rx, q[1] - 14 * k, q[0] + rx, q[1]); g.ellipse(q[0], q[1], rx, rx / 2, 0, 0, Math.PI); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(40,40,50,0.35)'; g.lineWidth = 1 * k; [[-0.6, -10, -0.1, -38], [0.1, -46, 0.5, -20], [-0.3, -20, 0.3, -28]].forEach(([a0, z0, a1, z1]) => line(g, [q[0] + a0 * rx, q[1] + z0 * k], [q[0] + a1 * rx, q[1] + z1 * k]));
    g.fillStyle = 'rgba(255,240,200,0.7)'; [[-0.5, -16], [-0.15, -34], [0.35, -30], [0.6, -14]].forEach(([fx, dy]) => { g.beginPath(); g.arc(q[0] + fx * rx, q[1] + dy * k, 1 * k, 0, TAU); g.fill(); });
    [[-0.55, -24], [0.4, -36]].forEach(([fx, dy], i) => { const p = [q[0] + fx * rx, q[1] + dy * k]; g.strokeStyle = dim(c, i ? STEEL : COPPER); g.lineWidth = 3.6 * k; g.lineCap = 'butt'; line(g, p, [p[0] + (i ? 4 : -4) * k, p[1] - 10 * k]); g.fillStyle = BRASS; g.beginPath(); D.ell(g, p[0] + (i ? 4 : -4) * k, p[1] - 10 * k, 2.8 * k, 1.3 * k); g.fill(); }); }, {layer: 0, zb: 0, top: 54});
  B.custom(1, 1.7, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const m = P(1.0, 1.62, 14), br = dead(c), op = br ? 0.2 : 0.55 + (still(c) ? 0 : Math.sin(ph(t, 2.4)) * 0.05 + Math.cos(ph(t, 2.4)) * 0.03);
    g.fillStyle = '#1E1A26'; g.beginPath(); g.arc(m[0], m[1], 13 * k, 0, TAU); g.fill();
    if(!br){ const bl = still(c) ? 1 : (Math.sin(ph(t, 2.4) * 2) > 0.92 ? 0.2 : 1); [[-4, -1], [5, 2]].forEach(([dx, dy], i) => { g.fillStyle = i ? MINT : BULB; [-1.6, 1.6].forEach(e => { g.beginPath(); D.ell(g, m[0] + dx * k + e * k, m[1] + dy * k, 1.1 * k, 1.3 * k * bl); g.fill(); }); }); }
    cog(g, m[0] + op * 22 * k, m[1] + op * 3 * k, 13 * k, dim(c, BRASS), op * 2, null, {n: 10}); g.fillStyle = team(c, L); g.beginPath(); g.arc(m[0] + op * 22 * k, m[1] + op * 3 * k, 3.6 * k, 0, TAU); g.fill(); }, {layer: 2, zb: 0, top: 30});
  pennant(B, L, 1.7, 0.4, 20, 26, {emblem: cogEm, pole: IRON});
});
/* ============================ 🐾 DEN — Clockwork Zoo (a little round pen with brass bars, a wind-up mouse with a turning key, a robot puppy, a bolt bowl) ============================ */
GH('den', {name: 'Clockwork Zoo', h: 66, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.flat(0.06, 0.06, 1.88, 1.88, STEELL);
  B.custom(1, 1, (g, P, k) => { const q = P(1, 1, 0.5), rx = 0.8 * HTW * k * S2; g.fillStyle = dim(c, STEEL); g.beginPath(); D.ell(g, q[0], q[1], rx, rx / 2); g.fill(); g.fillStyle = dim(c, '#C8D0D8'); g.beginPath(); D.ell(g, q[0], q[1] - 1 * k, rx * 0.92, rx * 0.46); g.fill();
    cog(g, q[0], q[1] - 1 * k, rx * 0.4, dim(c, BRASS), 0, null, {sq: 0.5, plain: true, n: 12}); }, {layer: -6, zb: 0, top: 2});
  const bars = (front) => B.custom(1, front ? 1.8 : 0.2, (g, P, k) => { const q = P(1, 1, 0), rx = 0.8 * HTW * k * S2, br = dead(c); g.strokeStyle = dim(c, BRASS); g.lineWidth = 1.6 * k;
    for(let i = 0; i <= 16; i++){ const a = i / 16 * TAU, sy = Math.sin(a); if(front ? sy <= 0 : sy > 0) continue; if(br && i % 3) continue; const x = q[0] + Math.cos(a) * rx * 0.96, y = q[1] + sy * rx * 0.48; line(g, [x, y], [x, y - 18 * k]); }
    if(br) return; g.lineWidth = 2 * k; g.beginPath(); g.ellipse(q[0], q[1] - 18 * k, rx * 0.96, rx * 0.48, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); g.stroke();
    if(front){ const col = teamOf(L); g.strokeStyle = col; g.lineWidth = 2.6 * k; g.beginPath(); g.ellipse(q[0], q[1] - 9 * k, rx * 0.97, rx * 0.485, 0, 0.3, Math.PI - 0.3); g.stroke(); } }, {layer: front ? 4 : -1, zb: 0, top: 20});
  bars(false);
  B.custom(1, 1, (g, P, k, t) => { const q = P(1, 1, 1), br = dead(c), walk = still(c) || br ? 0 : Math.sin(ph(t, 2.4)) * 6 + Math.cos(ph(t, 2.4)) * 2, mx = q[0] - 8 * k + walk * k, my = q[1] - 2 * k;   // 🐭 the wind-up mouse
    g.fillStyle = dim(c, STEELL); g.beginPath(); D.ell(g, mx, my - 4 * k, 7 * k, 4.6 * k); g.fill(); g.beginPath(); g.moveTo(mx + 6 * k, my - 6 * k); g.lineTo(mx + 11 * k, my - 3 * k); g.lineTo(mx + 6 * k, my - 2 * k); g.fill();
    g.fillStyle = dim(c, '#FFB0C0'); g.beginPath(); g.arc(mx + 3 * k, my - 9 * k, 2.4 * k, 0, TAU); g.fill(); g.fillStyle = '#1E1A26'; g.beginPath(); g.arc(mx + 7 * k, my - 5 * k, 0.8 * k, 0, TAU); g.fill();
    g.strokeStyle = dim(c, STEELD); g.lineWidth = 1 * k; g.beginPath(); g.moveTo(mx - 7 * k, my - 4 * k); g.quadraticCurveTo(mx - 12 * k, my - 2 * k, mx - 13 * k, my - 7 * k); g.stroke();
    const kr = br ? 0 : spin(t, c, 2) * 3; g.save(); g.translate(mx - 1 * k, my - 9 * k); g.scale(Math.cos(kr), 1); g.fillStyle = dim(c, BRASS); g.fillRect(-0.8 * k, -4 * k, 1.6 * k, 4 * k); g.beginPath(); D.ell(g, -2.6 * k, -5 * k, 2.4 * k, 1.8 * k); g.fill(); g.beginPath(); D.ell(g, 2.6 * k, -5 * k, 2.4 * k, 1.8 * k); g.fill(); g.restore();
    if(br) return; const dx = q[0] + 10 * k, dy = q[1] + 2 * k, wag = still(c) ? 0 : Math.sin(ph(t, 2.4) * 2) * 0.5 + Math.cos(ph(t, 2.4)) * 0.2;   // 🐕 a robot puppy
    g.fillStyle = COPPER; g.beginPath(); D.rr(g, dx - 7 * k, dy - 10 * k, 14 * k, 7 * k, 3 * k); g.fill(); g.fillStyle = IRON; [-5, 4].forEach(lx => g.fillRect(dx + lx * k, dy - 4 * k, 2 * k, 4 * k)); g.fillStyle = COPPERL; g.beginPath(); D.rr(g, dx + 4 * k, dy - 16 * k, 8 * k, 7 * k, 2.4 * k); g.fill();
    g.fillStyle = MINT; g.beginPath(); g.arc(dx + 9 * k, dy - 13 * k, 1.2 * k, 0, TAU); g.fill(); g.strokeStyle = IRON; g.lineWidth = 1.2 * k; line(g, [dx - 7 * k, dy - 8 * k], [dx - 11 * k, dy - 12 * k + wag * 4 * k]); g.fillStyle = BRASS; g.beginPath(); g.arc(dx + 6 * k, dy - 17 * k, 1.4 * k, 0, TAU); g.fill(); }, {layer: 2, zb: 0, top: 26});
  bars(true);
  B.custom(1.62, 0.4, (g, P, k) => { const q = P(1.62, 0.4, 0); g.fillStyle = dim(c, STEELD); g.beginPath(); g.ellipse(q[0], q[1] - 2 * k, 6 * k, 3 * k, 0, 0, Math.PI); g.lineTo(q[0] - 6 * k, q[1] - 4 * k); g.lineTo(q[0] + 6 * k, q[1] - 4 * k); g.closePath(); g.fill(); g.fillStyle = dim(c, BRASS); [-2, 2].forEach(dx => { g.beginPath(); D.star(g, q[0] + dx * k, q[1] - 4.6 * k, 1.6 * k, 1.3 * k, 6); g.fill(); }); }, {layer: 3, zb: 0, top: 8});
  pennant(B, L, 0.24, 1.76, 0, 52, {emblem: cogEm, pole: IRON});
});
/* ---------- 🟩 territory floor: riveted steel plates with seams · now and then a brass gear inlay · an oil spot · a little steam grate ---------- */
addFloor('gear', {name: 'Riveted plates + gear inlays + steam grates', top: '#B8C0CA', top2: '#ACB4BE', side: '#6E7680', paint: (g, q, s, i, j) => { const r = hash(i, j, 38), r2 = hash(j, i, 39);
  tileBase(g, q, s, '#BAC2CC', '#AEB6C0', r);
  g.strokeStyle = 'rgba(60,64,74,0.35)'; g.lineWidth = 0.8 * s; line(g, q(0.5, 0.04), q(0.5, 0.96)); line(g, q(0.04, 0.5), q(0.96, 0.5));
  g.fillStyle = 'rgba(255,245,220,0.75)'; [[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9], [0.4, 0.1], [0.6, 0.9]].forEach(([u, v]) => { const p = q(u, v); g.beginPath(); g.arc(p[0], p[1], 0.7 * s, 0, TAU); g.fill(); });
  if(r2 > 0.86){ const p = q(0.5, 0.5); cog(g, p[0], p[1], 9 * s, '#D9A441', r * 3, null, {sq: 0.5, plain: true, n: 10}); }
  else if(r2 < 0.14){ const p = q(0.3 + r * 0.4, 0.4 + r2); g.fillStyle = '#4A505A'; polyP(g, [q(0.3, 0.3), q(0.7, 0.3), q(0.7, 0.7), q(0.3, 0.7)]); g.fill(); g.strokeStyle = '#8A929E'; g.lineWidth = 0.8 * s; for(let u = 0.35; u < 0.7; u += 0.08) line(g, q(u, 0.32), q(u, 0.68)); }
  if(r < 0.2){ const p = q(0.72 - r, 0.3 + r2 * 0.4); g.fillStyle = 'rgba(40,36,44,0.28)'; g.beginPath(); D.ell(g, p[0], p[1], 4 * s, 1.8 * s); g.fill(); g.fillStyle = 'rgba(120,180,255,0.18)'; g.beginPath(); D.ell(g, p[0] - 1 * s, p[1] - 0.4 * s, 1.6 * s, 0.6 * s); g.fill(); } }});
/* ---------- ⚙️🟫🔋 own resource shapes (1 × 1, states full · half · empty) — Props.AR.resKey('gear', 'coin' | 'brick' | 'gem') ---------- */
// ⚙️ Cogs: a heap of brass + copper cogs, the top one slowly turning (half = 2 cogs · empty = one bent cog + a bolt)
function cogPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = dead(c); g.save(); g.translate(x, y); g.scale(k * 1.25 * (v % 3 === 1 ? -1 : 1), k * 1.25);
  g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, 0, 1, 15, 5); g.fill();
  if(st === 'empty'){ g.save(); g.translate(-2, -3); g.scale(1, 0.55); cog(g, 0, 0, 7, COPPER, 0.3, c, {plain: true}); g.restore(); g.strokeStyle = dim(c, COPPERD); g.lineWidth = 1.4; line(g, [-6, -6], [-3, -1]);
    g.fillStyle = dim(c, STEELD); g.beginPath(); D.rr(g, 6, -3, 6, 2.2, 0.8); g.fill(); g.fillStyle = dim(c, STEEL); g.beginPath(); D.star(g, 6, -1, 1.8, 1.5, 6); g.fill(); g.restore(); return; }
  const lay = st === 'full' ? [[-6, -2, 6, COPPER, 0.5, 0.55], [6, -1, 5.6, BRASS, 1.1, 0.55], [0, -4, 6.4, BRASSL, 0.2, 0.55], [-3, -9, 5, COPPERL, 0.7, 0.9], [4, -12, 5.6, BRASS, 0, 1]] : [[-4, -2, 6, COPPER, 0.5, 0.55], [4, -6, 6, BRASS, 0.2, 1]];
  lay.forEach(([cx, cy, r, col, a, sq], i) => { const last = i === lay.length - 1, rot = last && !c ? a + (ph(t, 2.4) / 6) : a; g.save(); g.translate(cx, cy); g.scale(1, sq); cog(g, 0, 0, r, col, rot, c); g.restore(); });
  if(st === 'full' && !c){ g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); D.star(g, 9, -18, 2.4 * tw(t, 1), 0.8, 4); g.fill(); }
  g.restore(); }
// 🟫 Copper Pipes: a stack of copper pipes tied on a little steel rack (half = 3 pipes · empty = the rack + one elbow pipe)
function pipePaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = dead(c); g.save(); g.translate(x, y); g.scale(k * 1.25 * (v % 3 === 1 ? -1 : 1), k * 1.25);
  g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, 0, 1, 15, 5); g.fill();
  g.strokeStyle = dim(c, STEELD); g.lineWidth = 1.6; [[-9, 2], [9, 2]].forEach(([px, py]) => { line(g, [px, py], [px, py - 14]); line(g, [px - 3, py - 14], [px + 3, py - 14]); });
  const pipe = (py, i) => { const col = dim(c, i % 3 === 1 ? COPPERL : COPPER); g.fillStyle = col; g.beginPath(); D.rr(g, -14, py - 2.4, 28, 4.8, 2.4); g.fill(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(-13, py - 1.8, 26, 1);
    g.fillStyle = dim(c, COPPERD); g.beginPath(); D.ell(g, 14, py, 1.6, 2.4); g.fill(); g.fillStyle = '#3A2A20'; g.beginPath(); D.ell(g, 14, py, 0.9, 1.4); g.fill(); };
  if(st === 'empty'){ g.strokeStyle = dim(c, COPPER); g.lineWidth = 4.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6, 0); g.lineTo(0, 0); g.quadraticCurveTo(4, 0, 4, -4); g.lineTo(4, -8); g.stroke(); g.restore(); return; }
  const ys = st === 'full' ? [-1, -5.6, -10.2, -14.8, -3.3, -7.9] : [-1, -5.6, -3.3]; ys.forEach((py, i) => pipe(py, i));
  if(!br){ g.strokeStyle = dim(c, BRASS); g.lineWidth = 1.2; [-4, 5].forEach(px => line(g, [px, st === 'full' ? -17.5 : -8.5], [px, 2])); }
  g.restore(); }
// 🔋 Crystal Batteries: a little charging rack with glowing crystal cells, sparks hopping between the caps (half = 1 cell · empty = empty sockets)
function battPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = dead(c); g.save(); g.translate(x, y); g.scale(k * 1.25 * (v % 3 === 1 ? -1 : 1), k * 1.25);
  g.fillStyle = 'rgba(40,24,30,0.22)'; g.beginPath(); D.ell(g, 0, 1, 15, 5); g.fill();
  g.fillStyle = dim(c, IRON); g.beginPath(); D.rr(g, -13, -4, 26, 6, 1.6); g.fill(); g.fillStyle = dim(c, STEEL); g.beginPath(); D.rr(g, -13, -6, 26, 3, 1.2); g.fill();
  const cells = [-7, 0, 7], n = st === 'full' ? 3 : st === 'half' ? 1 : 0, cols = v % 3 === 0 ? ['#7FE8FF', '#B8A8FF', '#7AF0B0'] : v % 3 === 1 ? ['#B8A8FF', '#7FE8FF', '#FFE070'] : ['#7AF0B0', '#7FE8FF', '#B8A8FF'];
  cells.forEach((cx, i) => { g.fillStyle = '#2A2630'; g.beginPath(); D.ell(g, cx, -5, 3, 1.2); g.fill(); if(i >= n) return; const col = dim(c, cols[i]);
    g.fillStyle = col; g.beginPath(); D.rr(g, cx - 2.6, -19, 5.2, 14, 1.6); g.fill(); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(cx - 1.8, -18, 1.2, 12);
    g.fillStyle = dim(c, BRASS); g.beginPath(); D.rr(g, cx - 3, -21, 6, 2.6, 1); g.fill(); g.fillRect(cx - 1, -23, 2, 2); });
  if(n && !c){ if(n > 1) zap(g, -7, -23, 7, -23, 1, t, 1, '#A8F4FF'); else { g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); D.star(g, -7 + 4 * Math.sin(ph(t, 2.4)), -25 + 2 * Math.cos(ph(t, 2.4)), 2, 0.7, 4); g.fill(); } }
  g.restore(); }
const RES = (slot, name, h, tag, paint, live) => organic('gear', 'gear_' + slot, Object.assign({name, look: 'gear', side: 'gear', slot, kind: 'thing', foot: [1, 1], h, variants: 3, block: true, states: ['full', 'half', 'empty'], state: 'full', dead: 'keep',
  tags: ['ar', 'ar-res', 'resource', tag, 'ar-gear'], conds: {'*': (g, x, y, k, t, v, c, L) => paint(g, x, y, k, t, v, L, c)}}, live ? {live, liveStates: ['full', 'half']} : {}), (g, x, y, k, t, v, L) => paint(g, x, y, k, t, v, L, null));
RES('coin', 'Cog heap', 36, 'coin', cogPaint, {period: 2.4, frames: 6}); RES('brick', 'Copper pipes', 34, 'brick', pipePaint); RES('gem', 'Crystal batteries', 40, 'gem', battPaint, {period: 2.4, frames: 6});
/* ---------- 🧱 walls: ⚙️ a riveted copper wall (plates + rivets, little cogs on top) · posts = steel pistons with a brass cap + a bulb · gate = two brass pillars under a GIANT half-cog arch over steel doors ·
   🏯 tall = a riveted steel rampart + round water-tank towers under copper caps puffing steam + a 🕰️ clock gatehouse ---------- */
(function(){ const {wallProp, gateProp, gateDoors, longFaces, tallWallProp, tallGateProp} = K.AR;
  const skin = {name: 'Riveted copper wall', gateName: 'Half-cog gate', h: 46, gateH: 92,
    seg(B, L, r, c, v){ const [x, y, w, d, ax] = r, H = 20, br = dead(c), b = B.box(x, y, 0, w, d, br ? 12 : H, COPPER);
      ['front', 'right', 'left', 'back'].forEach((s, i) => B.decal(b, s, ...F(b, s), 0, br ? 12 : H, COPPER, {paint: plates(br ? 12 : H, COPPER, 17 + i + Math.round((x + y) * 10), 2)}));
      trim(B, L, b, br ? 6 : 13, 3, longFaces(ax)); if(br) return; B.box(x, y, H, w, d, 2, BRASS);
      const len = ax === 'x' ? w : d, n = Math.max(1, Math.round(len / 0.34));
      B.custom(x + w / 2, y + d / 2, (g, P, k, t) => { for(let i = 0; i < n; i++){ const f = (i + 0.5) / n, px = ax === 'x' ? x + w * f : x + w / 2, py = ax === 'x' ? y + d / 2 : y + d * f, a = P(px, py, H + 2); cog(g, a[0], a[1] - 3.4 * k, 4 * k, i % 2 ? COPPERL : BRASS, i * 0.4, c, {plain: true}); } }, {layer: 1, zb: H + 2, top: H + 10}); },
    post(B, L, kind, c){ const br = dead(c); B.drum(0.5, 0.5, 0, 0.17, 4, IRON); B.drum(0.5, 0.5, 4, 0.12, br ? 12 : 24, STEEL, {rings: 2});
      B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 4), rx = 0.12 * HTW * k * S2, col = team(c, L); g.fillStyle = col; g.beginPath(); g.ellipse(q[0], q[1] - 6 * k, rx, rx / 2, 0, 0, Math.PI); g.lineTo(q[0] - rx, q[1] - 10 * k); g.ellipse(q[0], q[1] - 10 * k, rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill(); }, {layer: 1, zb: 4, top: 14});
      if(!br){ B.drum(0.5, 0.5, 28, 0.15, 4, BRASS, {rings: 0}); B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 32); bulb(g, q[0], q[1], 3.4 * k, c, (kind === 'end' || kind === 'solo') && lightOf(c)); }, {layer: 3, zb: 32, top: 42}); if(kind === 'end' || kind === 'solo') glowAt(B, c, 0.5, 0.5, 37, 12, '#FFE890', 0.35, 1); } },
    gate(B, L, open, c, v){ const t = 0.16, H = 46, br = dead(c);
      [[0.04, 0.22], [0.74, 0.22]].forEach(([x0, w]) => { const pb = plateBox(B, x0, 0.5 - t, 0, w, 2 * t, br ? 22 : H, BRASS, 61 + x0 * 10); trim(B, L, pb, 4, 3); B.box(x0 - 0.02, 0.5 - t - 0.02, br ? 22 : H, w + 0.04, 2 * t + 0.04, 3, BRASSD); });
      gateDoors(B, open, c, 32, STEELD, BRASS, {paint: (g, Q, k) => { plates(32, STEELD, 3, 3)(g, Q, k); const q = Q(0.5, 16); cog(g, q[0], q[1], 4 * k, BRASS, 0, c, {plain: true}); }});
      B.custom(0.5, 0.5, (g, P, k, t2) => { const m = P(0.5, 0.5, H + 2); if(br){ cog(g, m[0] - 10 * k, m[1] + 2 * k, 10 * k, '#8A8070', 0.3, c, {plain: true}); return; }   // ⚙️ the giant half-cog arch (turns a little)
        g.save(); g.beginPath(); g.rect(m[0] - 40 * k, m[1] - 40 * k, 80 * k, 40 * k); g.clip(); cog(g, m[0], m[1], 26 * k, BRASS, spin(t2 || 0, c, 0.5), c, {n: 14}); g.restore();
        const col = teamOf(L); g.fillStyle = col; g.beginPath(); g.arc(m[0], m[1] - 2 * k, 8 * k, Math.PI, TAU); g.fill(); cogEm(g, m[0], m[1] - 5 * k, 4.4 * k, inkOf(col)); }, {layer: 2, zb: H + 2, top: 80});
      if(!br) [[0.15], [0.85]].forEach(([x]) => pennant(B, L, x, 0.5, H + 3, 16, {w: 11, hh: 7, emblem: cogEm, pole: IRON})); } };
  wallProp('gear', 'gear', skin); gateProp('gear', 'gear', skin);
  const tall = {name: 'Riveted steel rampart', gateName: 'Clock gatehouse', base: 30, h: 120, gateH: 126,
    rampart(B, L, r, c, hb){ const [x, y, w, d, ax] = r, e = 0.08, b = ax === 'x' ? B.box(x, y - e, 0, w, d + 2 * e, hb, STEEL) : B.box(x - e, y, 0, w + 2 * e, d, hb, STEEL);
      ['front', 'right', 'left', 'back'].forEach((s, i) => B.decal(b, s, ...F(b, s), 0, hb, STEEL, {paint: plates(hb, STEEL, 31 + i + Math.round((x + y) * 10), 2)})); },
    tower(B, L, c, cx, cy, hb, kind, hw){ const br = dead(c), H = hb + (kind === 'gate' ? 30 : 38); B.drum(cx, cy, 0, hw * 1.05, br ? H - 14 : H, kind === 'gate' ? STEEL : COPPER, {rings: 3});
      drumBand(B, L, c, cx, cy, (br ? H - 14 : H) - 9, hw * 1.05, 5, {layer: 2});
      B.custom(cx, cy, (g, P, k) => { const w0 = P(cx, cy + hw * 1.05, hb + 8); g.fillStyle = BRASS; g.beginPath(); g.arc(w0[0], w0[1], 3.4 * k, 0, TAU); g.fill(); g.fillStyle = lightOf(c) ? '#C8FFF0' : '#2E3640'; g.beginPath(); g.arc(w0[0], w0[1], 2.2 * k, 0, TAU); g.fill(); }, {layer: 2, zb: hb, top: hb + 14});
      if(br) return; B.custom(cx, cy, (g, P, k) => { dome(g, P, k, cx, cy, H, hw * 1.15, kind === 'gate' ? 10 : 14, COPPER, {hi: COPPERL}); }, {layer: 3, zb: H, top: H + 16});
      chimney(B, c, cx, cy, H + 6, hw * 0.3, kind === 'gate' ? 12 : 16, {col: STEEL, n: 2, rise: 18});
      pennant(B, L, cx + hw * 0.6, cy, H + 4, kind === 'gate' ? 14 : 18, {w: 11, hh: 7, emblem: cogEm, pole: IRON}); },
    gatehouse(B, L, open, c, hb){ const br = dead(c), z0 = 44, t = 0.18;
      gateDoors(B, open, c, 40, STEELD, BRASS, {paint: (g, Q, k) => { plates(40, STEELD, 5, 4)(g, Q, k); }});
      const b = plateBox(B, 0.26, 0.5 - t, z0, 0.48, 2 * t, br ? 6 : 18, BRASS, 91); if(br) return; trim(B, L, b, 10, 3, ['front', 'back']); B.box(0.24, 0.5 - t - 0.02, z0 + 18, 0.52, 2 * t + 0.04, 3, BRASSD);
      B.custom(0.5, 0.5, (g, P, k, t2) => { const q = P(0.5, 0.5, z0 + 21), R = 15 * k, cy = q[1] - 16 * k;   // 🕰️ a big clock face standing over the gatehouse
        g.fillStyle = BRASSD; g.beginPath(); g.arc(q[0], cy, R * 1.1, 0, TAU); g.fill(); g.fillStyle = CREAM; g.beginPath(); g.arc(q[0], cy, R * 0.9, 0, TAU); g.fill();
        g.fillStyle = IRON; for(let i = 0; i < 12; i++){ const a = i / 12 * TAU; g.beginPath(); g.arc(q[0] + Math.cos(a) * R * 0.75, cy + Math.sin(a) * R * 0.75, (i % 3 ? 0.8 : 1.4) * k, 0, TAU); g.fill(); }
        const m = ((t2 || 0) / 2.4) * TAU; g.strokeStyle = IRON; g.lineCap = 'round'; g.lineWidth = 1.8 * k; line(g, [q[0], cy], [q[0] + Math.cos(m / 12 + 1) * R * 0.42, cy + Math.sin(m / 12 + 1) * R * 0.42]); g.lineWidth = 1.2 * k; line(g, [q[0], cy], [q[0] + Math.cos(m - Math.PI / 2) * R * 0.7, cy + Math.sin(m - Math.PI / 2) * R * 0.7]);
        g.fillStyle = RED; g.beginPath(); g.arc(q[0], cy, 1.6 * k, 0, TAU); g.fill(); [-1, 1].forEach(sd => cog(g, q[0] + sd * R * 1.15, cy + R * 0.6, 5 * k, COPPER, sd * m / 4, c, {plain: true})); }, {layer: 3, zb: z0 + 21, top: z0 + 60}); } };
  tallWallProp('gear', 'gear', skin, tall); tallGateProp('gear', 'gear', skin, tall);
})();
})();
K.loaded('gear', 'ip-4f');
})(window.Props && window.Props._K);
