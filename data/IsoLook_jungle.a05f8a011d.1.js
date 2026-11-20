
/* 🌍 IsoLook_jungle — 🌴 jungle → 🇹🇭 Thailand (teak sala inn · bamboo forge · dragon-jar well · parasol stall · teak board · Lanna lantern) — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['jungle'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/jungle.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_jungle: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🌴 jungle → 🇹🇭 Thailand (the village set + Thai inn · forge · plaza things) (ip-4a split from the ip-3 files 22–27; each part below is the old file's own IIFE).
   Built into IsoLook_jungle.html by build_isoprops.py; runs after the engine with Props._K (kit insides). */
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

/* ===================== 🌴 THAILAND — teak stilt sala inn · bamboo forge ===================== */
(function(){ const def = IN('jungle', 'inn_thai', 'Teak sala inn', {h: 126, variants: 2});
  const panels = (g, Q, k) => { g.strokeStyle = 'rgba(60,30,10,0.35)'; g.lineWidth = 1 * k; for(let i = 1; i < 9; i++) line(g, Q(i / 9, 1), Q(i / 9, 33)); line(g, Q(0, 17), Q(1, 17)); };
  def.build = (B, v) => { const teak = ['#A8693A', '#8E5A34'][v % 2], roofA = ['#C8502A', '#B5172A'][v % 2], roofB = ['#2E8A5A', '#E3A43A'][v % 2];
    [[0.15, 0.15], [1.4, 0.15], [2.7, 0.15], [0.15, 1.65], [1.4, 1.65], [2.7, 1.65]].forEach(p => B.box(p[0], p[1], 0, 0.14, 0.14, 12, M.dark));
    B.box(0.1, 0.1, 12, 2.8, 1.82, 4, M.plank, {layer: -1});
    const b = B.box(0.22, 0.2, 16, 2.56, 1.32, 34, teak, {layer: 1}); B.decal(b, 'front', 0, 2.56, 0, 34, teak, {paint: panels}); B.decal(b, 'right', 0, 1.32, 0, 34, teak, {paint: panels});
    B.door(b, 'front', 1.08, 0.46, 28, {fill: '#5A3418'}); B.win(b, 'front', 0.3, 0.4, 12, 14, {fill: '#3A2A20'}); B.win(b, 'front', 1.95, 0.4, 12, 14, {fill: '#3A2A20'}); B.win(b, 'right', 0.45, 0.4, 12, 14, {fill: '#3A2A20'});
    B.box(1.12, 1.7, 0, 0.44, 0.24, 6, M.wood, {layer: 1}); B.box(1.12, 1.56, 6, 0.44, 0.2, 6, M.wood, {layer: 1});   // steps up to the deck
    B.custom(1.4, 1.95, (g, P, k) => { g.strokeStyle = '#7A4A26'; g.lineWidth = 1.4 * k; [[0.12, 1.08], [1.6, 2.88]].forEach(([a, c]) => { line(g, P(a, 1.9, 26), P(c, 1.9, 26)); for(let x = a; x <= c + 0.01; x += 0.24) line(g, P(x, 1.9, 16), P(x, 1.9, 26)); }); }, {layer: 2});
    B.roof(0.0, 0.0, 46, 3.0, 2.0, 12, roofB, {kind: 'hip', ov: 0.08, layer: 1});   // the lower skirt tier
    B.roof(0.22, 0.2, 54, 2.56, 1.6, 52, roofA, {ov: 0.16, stripes: 10, ridge: 'x', gable: '#C99A2E', layer: 1});
    B.custom(1.5, 1.0, (g, P, k) => { g.fillStyle = M.gold; g.strokeStyle = M.gold; [[0.06, 1], [2.94, -1]].forEach(([x, d]) => { const e = P(x, 1.0, 106); g.lineWidth = 2.2 * k; g.beginPath(); g.moveTo(e[0], e[1]); g.quadraticCurveTo(e[0] - d * 2 * k, e[1] - 10 * k, e[0] + d * 5 * k, e[1] - 14 * k); g.stroke(); g.beginPath(); D.ell(g, e[0] + d * 5 * k, e[1] - 14 * k, 1.8 * k, 1.8 * k); g.fill(); }); }, {layer: 3});   // chofa horns
    innSign(B, 0.62, 1.96, 44, {fill: '#5A3418', ink: '#F2C23A', w: 30, h: 14, layer: 3});
    B.custom(2.5, 1.95, (g, P, k) => { const c = P(2.45, 1.92, 16); g.fillStyle = '#C9A2E8'; [[-3, -2], [2, -4], [0, 0]].forEach(([dx, dy]) => { g.beginPath(); D.ell(g, c[0] + dx * k, c[1] - 6 * k + dy * k, 2.4 * k, 1.8 * k); g.fill(); }); g.fillStyle = '#B8644A'; g.fillRect(c[0] - 3 * k, c[1] - 4 * k, 6 * k, 4 * k); }, {layer: 2}); }; })();
(function(){ const def = SM('jungle', 'smithy_thai', 'Bamboo forge', {h: 100, live: {period: 1.2, frames: 6}});
  const bam = (B, x, y, h) => { B.drum(x, y, 0, 0.06, h, '#C9C26A', {rings: Math.max(2, Math.round(h / 10)), layer: 0}); };
  def.build = (B) => { B.flat(0.1, 0.1, 1.8, 1.8, '#B5452A', {fill: '#B98A5A'});
    const w = B.box(0.14, 0.14, 0, 1.72, 0.1, 30, '#D9C28A'); B.decal(w, 'front', 0, 1.72, 0, 30, '#D9C28A', {paint: (g, Q, k) => { g.strokeStyle = 'rgba(120,90,40,0.45)'; g.lineWidth = 1 * k; for(let i = 1; i < 12; i++) line(g, Q(i / 12, 0), Q(i / 12, 30)); for(let j = 5; j < 30; j += 5) line(g, Q(0, j), Q(1, j)); }});
    [[0.18, 0.18], [1.82, 0.18], [0.18, 1.82], [1.82, 1.82]].forEach(p => bam(B, p[0], p[1], 40));
    B.box(0.35, 0.45, 0, 0.62, 0.55, 14, '#C26A3A', {topFill: '#3A2A20', trim: 7}); glowAt(B, 0.66, 0.72, 14, 18, '#FF7A2E', 2);
    [[1.12, 0.42], [1.3, 0.42]].forEach(p => { B.drum(p[0], p[1], 0, 0.08, 26, '#B9AE5A', {rings: 3}); B.box(p[0] - 0.015, p[1] - 0.015, 26, 0.03, 0.03, 10, M.dark, {layer: 1}); });
    B.custom(1.2, 0.42, (g, P, k) => { [[1.12, 0.42], [1.3, 0.42]].forEach(p => { const c = P(p[0], p[1], 37); g.fillStyle = '#F4EFE4'; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] - 2.4 * k, c[1] - 6 * k); g.lineTo(c[0] + 2.4 * k, c[1] - 6 * k); g.closePath(); g.fill(); }); }, {layer: 2});   // feather plungers
    anvil(B, 0.9, 1.35); B.drum(1.55, 1.4, 0, 0.16, 12, '#C25A3A', {topFill: '#4A90C0'});
    B.roof(0.08, 0.08, 40, 1.84, 1.84, 30, M.thatch, {kind: 'hip', ov: 0.22, layer: 3});
    smoke(B, 0.66, 0.72, 74, {period: 1.2}); }; })();

/* ---------- 🗺️ hand them out through the looks (swap keeps every town's layout: same footprint + door as 'inn' / 'smithy') ---------- */
const COUNTRY = {jungle: ['inn_thai', 'smithy_thai']};
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

/* ============================ 🌴 THAILAND ============================ */
// ⛲ dragon-jar well: a glazed jar with a golden dragon round its belly, under a little Thai roof with chofa horns
(function(){ const def = WELL('jungle', 'well_thai', 'Dragon jar well', {h: 66});
  def.build = (B, v, L) => { const c = L.cond, teak = '#8E5A34';
    B.box(0.06, 0.06, 0, 0.88, 0.88, 4, M.plank, {layer: -1, trim: 0});
    [0.08, 0.82].forEach(x => B.box(x, 0.45, 4, 0.1, 0.1, 42, teak));
    B.bill(0.5, 0.52, 4, (g, x, y, k) => { const r = 12 * k, h = 28 * k;
      g.beginPath(); g.moveTo(x - 6 * k, y); g.bezierCurveTo(x - r * 1.5, y - h * 0.22, x - r * 1.35, y - h * 0.95, x - 7.5 * k, y - h); g.lineTo(x + 7.5 * k, y - h); g.bezierCurveTo(x + r * 1.35, y - h * 0.95, x + r * 1.5, y - h * 0.22, x + 6 * k, y); g.closePath();
      g.fillStyle = D.lin(g, x - r * 1.4, 0, x + r * 1.4, 0, ['#B0603A', '#7A3A1E', '#4A2412']); g.fill();
      g.save(); g.clip(); g.strokeStyle = '#F2C23A'; g.lineWidth = 3.2 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r * 1.5, y - h * 0.42);   // 🐉 the dragon band
      g.bezierCurveTo(x - r * 0.8, y - h * 0.72, x - r * 0.2, y - h * 0.18, x + r * 0.4, y - h * 0.5); g.quadraticCurveTo(x + r * 0.75, y - h * 0.68, x + r * 0.95, y - h * 0.55); g.stroke();
      g.strokeStyle = '#C9902A'; g.lineWidth = 0.9 * k; for(let i = 0; i < 6; i++){ const u = -1.1 + i * 0.32; g.beginPath(); g.arc(x + r * u, y - h * (0.5 + Math.sin(u * 2.6) * 0.12), 1.2 * k, 0, Math.PI); g.stroke(); }
      g.fillStyle = '#F2C23A'; g.beginPath(); D.ell(g, x + r * 0.98, y - h * 0.56, 3 * k, 2.4 * k); g.fill(); g.fillStyle = '#E2453A'; g.beginPath(); g.moveTo(x + r * 1.15, y - h * 0.58); g.lineTo(x + r * 1.5, y - h * 0.66); g.lineTo(x + r * 1.42, y - h * 0.52); g.closePath(); g.fill();
      g.fillStyle = '#2A1C14'; g.beginPath(); g.arc(x + r * 1.02, y - h * 0.58, 0.7 * k, 0, TAU); g.fill(); g.restore();
      g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); D.ell(g, x - r * 0.62, y - h * 0.62, 2.4 * k, 6 * k, 0.2); g.fill();
      g.fillStyle = '#5A2C14'; g.beginPath(); D.ell(g, x, y - h, 8.6 * k, 3.6 * k); g.fill();   // lip + water (dry = mud, ruined = cracked + chipped)
      g.fillStyle = !c ? '#3A8FBF' : c.broken ? '#2A1C14' : '#7A5A3A'; g.beginPath(); D.ell(g, x, y - h, 6.8 * k, 2.6 * k); g.fill();
      if(!c){ g.fillStyle = '#FFFFFF'; for(let p = 0; p < 5; p++){ const a = p * TAU / 5; g.beginPath(); D.ell(g, x + 2 * k + Math.cos(a) * 1.5 * k, y - h + Math.sin(a) * 0.8 * k, 1.2 * k, 0.8 * k); g.fill(); } g.fillStyle = '#FFC21A'; g.beginPath(); D.ell(g, x + 2 * k, y - h, 0.7 * k, 0.5 * k); g.fill(); }   // a frangipani floating
      if(c && c.broken){ g.strokeStyle = 'rgba(30,16,8,0.8)'; g.lineWidth = 1 * k; g.beginPath(); g.moveTo(x - 3 * k, y - h); g.lineTo(x - 5 * k, y - h * 0.6); g.lineTo(x - 2 * k, y - h * 0.3); g.stroke(); }
      g.strokeStyle = '#7A4A22'; g.lineWidth = 1.2 * k; line(g, [x - 9 * k, y - h - 6 * k], [x - 1 * k, y - h]); g.fillStyle = '#6B4222'; g.beginPath(); g.ellipse(x - 10.5 * k, y - h - 5 * k, 3.6 * k, 2.4 * k, -0.4, 0, Math.PI); g.fill(); }, {layer: 1});   // coconut-shell dipper
    B.roof(0.0, 0.3, 46, 1.0, 0.4, 13, '#C8502A', {ridge: 'x', ov: 0.08, stripes: 4, gable: '#C99A2E', layer: 2});
    chofa(B, -0.08, 1.08, 0.5, 59); }; })();
// 🛒 market stall under a big square parasol: bamboo table, woven trays of mangosteen · rambutan · mango, jasmine garlands
(function(){ const def = STALL('jungle', 'stall_thai', 'Thai market stall', {h: 66});
  def.build = (B, v, L) => { const c = L.cond, can = ['#F28C28', '#3FA34D', '#3A86FF'][v % 3];
    [[0.14, 0.22], [1.76, 0.22], [0.14, 0.72], [1.76, 0.72]].forEach(p => B.box(p[0], p[1], 0, 0.1, 0.1, 16, '#C9C26A'));
    B.box(0.1, 0.18, 16, 1.8, 0.7, 4, '#D9B77A', {trim: 0});
    B.box(0.2, 0.3, 0, 0.5, 0.4, 9, '#B98A5E', {trim: 3});   // a woven basket under the table
    B.box(0.97, 0.47, 20, 0.07, 0.07, 32, M.dark, {layer: 1});   // parasol pole
    B.custom(1, 0.5, (g, P, k) => { const trays = [[0.45, 0.55, ['#5A2A4A', '#6E3358'], 0], [1.0, 0.68, ['#E2453A', '#C8302A'], 1], [1.52, 0.52, ['#FFC21A', '#F2A81A'], 0]], rot = v % 3;
      trays.forEach(([x, y, col, sp], i) => { const tr = trays[(i + rot) % 3], p = P(x, y, 20); g.fillStyle = '#C9A26A'; g.beginPath(); D.ell(g, p[0], p[1], 11 * k, 5 * k); g.fill(); g.strokeStyle = 'rgba(90,52,24,0.45)'; g.lineWidth = 0.8 * k; g.beginPath(); D.ell(g, p[0], p[1], 8 * k, 3.6 * k); g.stroke();
        heap(g, [p[0], p[1] - 2 * k], k, 7, c ? ['#8A7A5A', '#7A6A4A'] : tr[2], 2.4, 7 + i, {spiky: !c && tr[3] === 1}); });
      if(!c){ const b = P(1.62, 0.3, 20); g.fillStyle = '#FFD23F'; for(let i = 0; i < 4; i++){ g.beginPath(); D.ell(g, b[0] + (i - 1.5) * 2.6 * k, b[1] - 3 * k, 1.6 * k, 4.6 * k, 0.5); g.fill(); } } }, {layer: 2});   // bananas at the back
    B.roof(-0.12, -0.25, 52, 2.24, 1.5, 12, c && c.broken ? '#8A7A6A' : can, {kind: 'hip', ov: 0, layer: 4});
    B.custom(1, 0.5, (g, P, k, t, T) => { const edges = [[[-0.12, 1.25], [2.12, 1.25], [0, 1]], [[2.12, -0.25], [2.12, 1.25], [1, 0]], [[-0.12, -0.25], [-0.12, 1.25], [-1, 0]], [[-0.12, -0.25], [2.12, -0.25], [0, -1]]];
      edges.forEach(([a, b, n]) => { if(!vis(T, n[0], n[1])) return; const n2 = 9; for(let i = 0; i < n2; i++){ const p0 = P(a[0] + (b[0] - a[0]) * i / n2, a[1] + (b[1] - a[1]) * i / n2, 52), p1 = P(a[0] + (b[0] - a[0]) * (i + 1) / n2, a[1] + (b[1] - a[1]) * (i + 1) / n2, 52), m = mix(p0, p1, 0.5);
        g.fillStyle = i % 2 ? '#FFFFFF' : sh(can, -0.15); g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(m[0], m[1] + 7 * k, p1[0], p1[1]); g.closePath(); g.fill(); }
        if(!c && n[1] === 1 || !c && n[0] === 1) [0.25, 0.75].forEach(f => { const q = P(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 52); g.fillStyle = '#FFFFFF'; for(let j = 0; j < 4; j++){ g.beginPath(); D.ell(g, q[0], q[1] + (2 + j * 2.4) * k, 1.4 * k, 1.2 * k); g.fill(); } g.fillStyle = '#E2453A'; g.beginPath(); D.ell(g, q[0], q[1] + 12.5 * k, 1.8 * k, 1.8 * k); g.fill(); g.strokeStyle = '#FFC21A'; g.lineWidth = 1 * k; line(g, [q[0], q[1] + 14 * k], [q[0], q[1] + 17 * k]); }); }); }, {layer: 5}); }; })();
// 📜 teak quest board: dark teak, a gold carved frame, palm-leaf notes, a marigold garland, a little tiered roof + a gold lotus "!"
(function(){ const def = BOARD('jungle', 'qboard_thai', 'Teak quest board', {h: 64});
  def.build = (B, v, L) => { const c = L.cond, teak = '#7E4A28';
    [0.1, 0.8].forEach(x => B.box(x, 0.45, 0, 0.1, 0.1, 40, teak));
    const b = B.box(0.06, 0.5, 12, 0.88, 0.1, 26, '#6E4024');
    B.decal(b, 'front', 0.02, 0.84, 1, 24, '#5A3418', {paint: (g, Q, k) => { g.strokeStyle = '#E3B23A'; g.lineWidth = 1.3 * k; polyP(g, [Q(0.03, 1.5), Q(0.97, 1.5), Q(0.97, 22.5), Q(0.03, 22.5)]); g.stroke();
      [[0.12, 0.3, 17, 5], [0.42, 0.28, 13, 4], [0.68, 0.24, 16, 6]].forEach(([u, w, z, z0]) => { g.fillStyle = c && c.broken ? '#A89878' : '#EAD9A8'; polyP(g, [Q(u, z0), Q(u + w, z0), Q(u + w, z0 + 4), Q(u, z0 + 4)]); g.fill(); polyP(g, [Q(u, z0 + 6), Q(u + w, z0 + 6), Q(u + w, z0 + 10), Q(u, z0 + 10)]); g.fill();
        g.strokeStyle = 'rgba(90,52,24,0.6)'; g.lineWidth = 0.6 * k; line(g, Q(u + 0.02, z0 + 2), Q(u + w - 0.02, z0 + 2)); line(g, Q(u + 0.02, z0 + 8), Q(u + w - 0.02, z0 + 8)); });
      if(!c) for(let i = 0; i <= 12; i++){ const u = 0.06 + i * 0.073, z = 21 - Math.sin(i / 12 * Math.PI) * 4, q = Q(u, z); g.fillStyle = i % 3 === 1 ? '#FFC21A' : '#FF8A1A'; g.beginPath(); D.ell(g, q[0], q[1], 1.6 * k, 1.6 * k); g.fill(); } }});
    B.roof(0.0, 0.38, 40, 1.0, 0.34, 12, '#C8502A', {ridge: 'x', ov: 0.08, stripes: 4, gable: '#C99A2E', layer: 1});
    chofa(B, -0.08, 1.08, 0.55, 52);
    B.custom(0.5, 0.56, (g, P, k) => { const q = P(0.5, 0.55, 56); g.fillStyle = c ? '#B89A5A' : '#F2C23A';
      for(let i = -2; i <= 2; i++){ g.beginPath(); g.ellipse(q[0] + i * 2.6 * k, q[1] + 1 * k, 2.2 * k, 5.4 * k, i * 0.32, 0, TAU); g.fill(); }
      g.fillStyle = c ? '#8A7A5A' : '#E89A1A'; g.beginPath(); D.ell(g, q[0], q[1] - 1 * k, 4.6 * k, 4.6 * k); g.fill(); bang(g, q[0], q[1] - 1 * k, k, {size: 9}); }, {layer: 5}); }; })();
// 🏮 Lanna paper lantern (khom) hanging from a bamboo pole, paper fringe + two tails that sway
(function(){ const def = LAMP('jungle', 'lantern_thai', 'Lanna lantern', {h: 50, live: {period: 2, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, lv = lightOf(c);
    B.box(0.36, 0.36, 0, 0.28, 0.28, 3, M.stone); B.drum(0.5, 0.5, 3, 0.055, 41, '#C9C26A', {rings: 4});
    B.box(0.47, 0.5, 41, 0.06, 0.4, 3, '#B5AE5A', {layer: 1});
    B.custom(0.5, 0.86, (g, P, k, t) => { const top = P(0.5, 0.86, 41), ph = (t || 0) / 2 * TAU, sw = Math.sin(ph) * 0.09, tw = Math.cos(ph) * 0.09, x = top[0] + sw * 18 * k, y = top[1] + 9 * k, col = c && c.broken ? '#9A7A5A' : '#F28C28';
      g.strokeStyle = '#2A1C14'; g.lineWidth = 0.8 * k; line(g, top, [x, y - 5 * k]);
      g.fillStyle = M.gold; g.beginPath(); g.moveTo(x - 2.5 * k, y - 5 * k); g.lineTo(x + 2.5 * k, y - 5 * k); g.lineTo(x + 4 * k, y - 3 * k); g.lineTo(x - 4 * k, y - 3 * k); g.closePath(); g.fill();
      g.fillStyle = D.lin(g, x - 6 * k, 0, x + 6 * k, 0, [sh(col, 0.2), col, sh(col, -0.25)]); g.beginPath(); g.moveTo(x - 4 * k, y - 3 * k); g.bezierCurveTo(x - 7.5 * k, y, x - 7.5 * k, y + 6 * k, x - 4 * k, y + 8 * k); g.lineTo(x + 4 * k, y + 8 * k); g.bezierCurveTo(x + 7.5 * k, y + 6 * k, x + 7.5 * k, y, x + 4 * k, y - 3 * k); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(120,40,10,0.45)'; g.lineWidth = 0.7 * k; [-2.5, 0, 2.5].forEach(d => { g.beginPath(); g.moveTo(x + d * 0.6 * k, y - 3 * k); g.quadraticCurveTo(x + d * 1.6 * k, y + 2.5 * k, x + d * 0.6 * k, y + 8 * k); g.stroke(); });
      g.fillStyle = c ? '#B89A5A' : '#FFD23F'; for(let i = 0; i < 5; i++){ g.beginPath(); g.moveTo(x - 4 * k + i * 2 * k, y + 8 * k); g.lineTo(x - 3 * k + i * 2 * k, y + 12 * k); g.lineTo(x - 2 * k + i * 2 * k, y + 8 * k); g.closePath(); g.fill(); }   // paper fringe
      g.strokeStyle = c ? '#9A7A5A' : '#E2453A'; g.lineWidth = 1.3 * k; g.lineCap = 'round'; [-1.5, 1.5].forEach((d, i) => { g.beginPath(); g.moveTo(x + d * k, y + 11 * k); g.quadraticCurveTo(x + d * k + tw * (i ? 30 : 22) * k, y + 16 * k, x + d * 1.4 * k + tw * 40 * k, y + 21 * k); g.stroke(); });
      if(c && c.broken){ g.fillStyle = '#2A1C14'; g.beginPath(); D.ell(g, x + 2 * k, y + 2 * k, 2 * k, 2.6 * k); g.fill(); }
      if(lv) D.glow(g, x, y + 3 * k, 16 * k, '#FFC86A', 0.5 * lv); }, {layer: 2}); }; })();

/* ---------- 🗺️ hand them out through the looks (same footprint + door + block as the village ones → every town keeps its plan, T6) ---------- */
const PLAZA = {jungle: {well: 'well_thai', stall: 'stall_thai', qboard: 'qboard_thai', lantern: 'lantern_thai'}};
Object.keys(PLAZA).forEach(lk => { const L = LOOKS[lk]; if(!L) return; const sw = {}; Object.keys(PLAZA[lk]).forEach(a => { if(DEFS[PLAZA[lk][a]]) sw[a] = PLAZA[lk][a]; }); L.swap = Object.assign({}, L.swap || {}, sw); });
})();
K.loaded('jungle', 'ip-4e');
})(window.Props && window.Props._K);
