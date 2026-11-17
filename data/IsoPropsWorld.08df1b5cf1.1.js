
/* 🌍 IsoPropsWorld — the COUNTRY buildings of 🌳 IsoProps (ip-3c inns + smithies · ip-3d plaza things: well · market stall · quest board · lantern per look).
   Comes WITH include('IsoProps') (Code.gs INCLUDE_ALSO_) and runs right after it; it only adds props + look swaps through the kit's own insides (Props._K).
   Built from Test Harness/isoprops/kit (26_ip_lookinns · 27_ip_lookplaza) by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoPropsWorld: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd} = K;
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

/* ===================== 🌾 AMERICAN COUNTRYSIDE — country inn · horseshoe forge ===================== */
(function(){ const def = IN('farm', 'inn_country', 'Country inn', {h: 112, variants: 2});
  def.build = (B, v, L) => { const wall = ['#F4EFE4', '#DCE6EE'][v % 2], roof = ['#5A6E8C', '#3E5A4A'][v % 2], white = '#FFFFFF';
    B.box(0.06, 0.06, 0, 2.88, 1.88, 4, M.stone, {layer: -1});
    const b = B.box(0.22, 0.14, 4, 2.3, 1.22, 48, wall, {trim: 4}); B.door(b, 'front', 0.98, 0.46, 28, {fill: '#B5452A'});
    [[0.25, 12], [1.7, 12], [0.25, 32], [1.05, 32], [1.7, 32]].forEach(([a, z]) => { B.win(b, 'front', a, 0.36, z, 12, {fill: '#9FD3F0'}); });
    B.win(b, 'right', 0.4, 0.36, 12, 12, {fill: '#9FD3F0'}); B.win(b, 'right', 0.4, 0.36, 32, 12, {fill: '#9FD3F0'});
    B.box(0.08, 1.38, 4, 2.84, 0.54, 3, M.plank, {layer: -1}); B.box(2.54, 0.12, 4, 0.38, 1.3, 3, M.plank, {layer: -1});
    [[0.12, 1.84], [0.95, 1.84], [1.75, 1.84], [2.82, 1.84], [2.82, 0.95], [2.82, 0.16]].forEach(p => B.box(p[0], p[1], 7, 0.07, 0.07, 22, white, {layer: 1}));
    B.custom(1.5, 1.92, (g, P, k) => { g.strokeStyle = white; g.lineWidth = 1.3 * k; [[[0.12, 1.88], [0.95, 1.88]], [[1.75, 1.88], [2.86, 1.88]], [[2.86, 0.16], [2.86, 1.88]]].forEach(([a, c]) => { line(g, P(a[0], a[1], 16), P(c[0], c[1], 16));
      const n = Math.round(Math.hypot(c[0] - a[0], c[1] - a[1]) / 0.14); for(let i = 1; i < n; i++){ const f = i / n; line(g, P(a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f, 8), P(a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f, 16)); } }); }, {layer: 2});
    B.custom(0.55, 1.62, (g, P, k) => { const c = P(0.55, 1.62, 7); g.strokeStyle = '#8A5A2B'; g.lineWidth = 1.6 * k; g.beginPath(); g.ellipse(c[0], c[1] + 1 * k, 6 * k, 2.4 * k, 0, 0.1, Math.PI - 0.1); g.stroke(); line(g, [c[0] - 3 * k, c[1]], [c[0] - 3 * k, c[1] - 7 * k]); line(g, [c[0] + 3 * k, c[1]], [c[0] + 3 * k, c[1] - 7 * k]); line(g, [c[0] - 3 * k, c[1] - 12 * k], [c[0] - 3 * k, c[1] - 6 * k]); line(g, [c[0] - 3 * k, c[1] - 12 * k], [c[0] + 2 * k, c[1] - 13 * k]); line(g, [c[0] + 2 * k, c[1] - 13 * k], [c[0] + 3 * k, c[1] - 6 * k]); }, {layer: 2});   // rocking chair
    B.roof(0.06, 1.36, 29, 2.88, 0.58, 6, roof, {kind: 'hip', ov: 0.04, layer: 2}); B.roof(2.5, 0.08, 29, 0.44, 1.32, 6, roof, {kind: 'hip', ov: 0.04, layer: 2});
    B.roof(0.22, 0.14, 52, 2.3, 1.22, 32, roof, {ov: 0.2, stripes: 9, ridge: 'x'});
    [0.6, 1.5].forEach(x => { const d = B.box(x, 1.0, 58, 0.4, 0.3, 12, wall, {layer: 1}); B.win(d, 'front', 0.1, 0.2, 2, 8, {fill: '#9FD3F0'}); B.roof(x, 1.0, 70, 0.4, 0.3, 8, roof, {ov: 0.05, ridge: 'y', layer: 1}); });
    B.box(1.95, 0.35, 64, 0.26, 0.26, 26, '#B8644A', {layer: 1, trim: 5});
    B.custom(1.5, 1.85, (g, P, k) => { [[0.25, 'front', 1.36], [1.7, 'front', 1.36]].forEach(([a]) => { const c = P(a + 0.4, 1.38, 10); ['#FF5A7A', '#FFD23F', '#FF8A3A', '#B45AE8'].forEach((col, i) => { g.fillStyle = col; g.beginPath(); D.ell(g, c[0] + (i - 1.5) * 3.4 * k, c[1] - 2 * k, 1.8 * k, 1.8 * k); g.fill(); }); }); }, {layer: 2});
    innSign(B, 2.3, 1.94, 28, {shape: 'oval', fill: '#F2C23A', ink: '#5A3418', w: 28, h: 14, layer: 3}); }; })();
(function(){ const def = SM('farm', 'smithy_horseshoe', 'Horseshoe forge', {h: 104, live: {period: 1.2, frames: 6}});
  const batten = (g, Q, k) => { g.strokeStyle = 'rgba(70,20,10,0.35)'; g.lineWidth = 1.2 * k; for(let i = 1; i < 10; i++) line(g, Q(i / 10, 0), Q(i / 10, 36)); };
  def.build = (B) => { const red = '#B8402F';
    B.box(0.1, 0.1, 0, 1.8, 1.6, 4, M.stone, {layer: -1});
    const b = B.box(0.14, 0.14, 4, 1.5, 1.44, 34, red); B.decal(b, 'front', 0, 1.5, 0, 34, red, {paint: batten}); B.decal(b, 'right', 0, 1.44, 0, 34, red, {paint: batten});
    B.decal(b, 'front', 0.42, 0.7, 0, 26, '#2B2D42', {paint: (g, Q, k) => { const c = Q(0.5, 8); D.glow(g, c[0], c[1], 18 * k, '#FF7A2E', 0.8); g.fillStyle = '#FF9A3E'; g.beginPath(); D.ell(g, c[0], c[1] + 3 * k, 8 * k, 3 * k); g.fill(); g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.4 * k; line(g, Q(0, 0), Q(0, 26)); line(g, Q(1, 0), Q(1, 26)); line(g, Q(0, 26), Q(1, 26)); }});
    B.win(b, 'right', 0.5, 0.4, 16, 11, {fill: '#FFC86A'});
    B.roof(0.14, 0.14, 38, 1.5, 1.44, 26, '#5A5A62', {ov: 0.14, ridge: 'y', gable: red});
    B.custom(0.89, 1.58, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; const c = P(0.89, 1.58, 50); g.strokeStyle = '#8E8A82'; g.lineWidth = 3 * k; g.lineCap = 'round'; g.beginPath(); g.arc(c[0], c[1], 5 * k, 0.15, Math.PI - 0.15, true); g.stroke(); g.fillStyle = '#2A1C14'; [-0.8, -0.4, 0, 0.4, 0.8].forEach(a => { const ang = -Math.PI / 2 + a * 1.4; g.beginPath(); g.arc(c[0] + Math.cos(ang) * 5 * k, c[1] + Math.sin(ang) * 5 * k, 0.6 * k, 0, TAU); g.fill(); }); }, {layer: 2});
    B.box(1.62, 0.2, 0, 0.3, 0.3, 74, M.stone, {trim: 8}); glowAt(B, 1.77, 0.35, 74, 10, '#FF7A2E', 2); smoke(B, 1.77, 0.35, 78, {period: 1.2});
    anvil(B, 0.2, 1.72); B.box(1.2, 1.7, 0, 0.6, 0.22, 8, M.wood, {topFill: '#5AA0C8', layer: 1});
    B.custom(1.92, 1.3, (g, P, k) => { const c = P(1.95, 1.4, 9); g.strokeStyle = '#7A4A26'; g.lineWidth = 2 * k; g.beginPath(); D.ell(g, c[0], c[1], 6 * k, 9 * k); g.stroke(); g.lineWidth = 1 * k; for(let i = 0; i < 4; i++){ const a = i * Math.PI / 4; line(g, [c[0] - Math.cos(a) * 6 * k, c[1] - Math.sin(a) * 9 * k], [c[0] + Math.cos(a) * 6 * k, c[1] + Math.sin(a) * 9 * k]); } }, {layer: 3});   // wagon wheel
  }; })();

/* ---------- 🗺️ hand them out through the looks (swap keeps every town's layout: same footprint + door as 'inn' / 'smithy') ---------- */
const COUNTRY = {jungle: ['inn_thai', 'smithy_thai'], cherry: ['inn_ryokan', 'smithy_katana'], desert: ['inn_caravan', 'smithy_dome'], snow: ['inn_chalet', 'smithy_nordic'], farm: ['inn_country', 'smithy_horseshoe']};
Object.keys(COUNTRY).forEach(lk => { const L = LOOKS[lk]; if(!L) return; L.swap = Object.assign({}, L.swap || {}, {inn: COUNTRY[lk][0], smithy: COUNTRY[lk][1]}); });
if(LOOKS.farm && LOOKS.farm.roles && LOOKS.farm.roles.smith === 'barn') LOOKS.farm.roles = Object.assign({}, LOOKS.farm.roles, {smith: 'smithy', home: ['farmhouse', 'farmhouse', 'barn2']});
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
(function(){ const def = LAMP('desert', 'lantern_brass', 'Brass lantern', {h: 50, live: {period: 1.6, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, lv = lightOf(c);
    B.box(0.38, 0.38, 0, 0.24, 0.24, 4, '#E9C891'); B.drum(0.5, 0.5, 4, 0.05, 25, '#C9962E', {rings: 3}); B.drum(0.5, 0.5, 26, 0.09, 3, '#B07A22', {layer: 1});
    B.bill(0.5, 0.5, 29, (g, x, y, k, t) => { const f = 0.85 + 0.1 * Math.sin((t || 0) / 1.6 * TAU) + 0.06 * Math.cos((t || 0) / 1.6 * TAU), body = c ? '#9A7A3A' : '#C9962E';
      if(lv) D.glow(g, x, y - 9 * k, 20 * k * f, '#FFB84A', 0.5 * lv);
      g.fillStyle = body; g.beginPath(); g.moveTo(x - 5 * k, y - 1 * k); g.lineTo(x + 5 * k, y - 1 * k); g.lineTo(x + 6 * k, y - 12 * k); g.lineTo(x - 6 * k, y - 12 * k); g.closePath(); g.fill();
      [[-4.2, '#2EA7A0'], [-0.9, '#E2453A'], [2.4, '#2EA7A0']].forEach(([dx, col], i) => { g.fillStyle = lv ? col : sh(col, -0.4); g.beginPath(); g.moveTo(x + dx * k, y - 2.5 * k); g.lineTo(x + (dx + 1.9) * k, y - 2.5 * k); g.lineTo(x + (dx + 2.1) * k, y - 10.5 * k); g.lineTo(x + (dx - 0.2) * k, y - 10.5 * k); g.closePath(); g.fill(); if(c && c.broken && i === 1){ g.fillStyle = '#2A1C14'; g.fill(); } });
      g.fillStyle = 'rgba(255,240,180,' + (0.8 * lv * f) + ')'; [[-3.2, -6], [0, -4], [3.2, -7], [0, -9]].forEach(([dx, dy]) => { g.beginPath(); D.star(g, x + dx * k, y + dy * k, 1.2 * k, 0.5 * k, 4); g.fill(); });
      g.fillStyle = body; g.beginPath(); g.moveTo(x - 6.4 * k, y - 12 * k); g.bezierCurveTo(x - 7 * k, y - 17 * k, x - 1 * k, y - 18 * k, x, y - 22 * k); g.bezierCurveTo(x + 1 * k, y - 18 * k, x + 7 * k, y - 17 * k, x + 6.4 * k, y - 12 * k); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); D.ell(g, x - 2.6 * k, y - 15.5 * k, 1.4 * k, 2.2 * k, 0.4); g.fill();
      g.strokeStyle = body; g.lineWidth = 1.1 * k; line(g, [x, y - 22 * k], [x, y - 25 * k]); g.fillStyle = body; g.beginPath(); D.ell(g, x, y - 25.6 * k, 1.3 * k, 1.3 * k); g.fill();
      g.beginPath(); g.moveTo(x - 5 * k, y - 1 * k); g.lineTo(x + 5 * k, y - 1 * k); g.lineTo(x, y + 2.5 * k); g.closePath(); g.fill(); }, {layer: 2}); }; })();

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

/* ============================ 🌾 AMERICAN COUNTRYSIDE ============================ */
// ⛲ pump well: a red-brick curb with a plank lid, a green cast-iron hand pump with a long handle, a tin pail on the spout, a few wildflowers
(function(){ const def = WELL('farm', 'well_pump', 'Pump well', {h: 50});
  def.build = (B, v, L) => { const c = L.cond, iron = c && c.broken ? '#6A6A5A' : '#2E7D4F';
    B.drum(0.5, 0.5, 0, 0.36, 12, '#B8644A', {rings: 3, topFill: '#C99257'});
    B.custom(0.5, 0.5, (g, P, k) => { g.strokeStyle = 'rgba(90,52,24,0.5)'; g.lineWidth = 0.8 * k; [-0.16, 0, 0.16].forEach(d => line(g, P(0.22, 0.5 + d, 12), P(0.78, 0.5 + d, 12)));
      if(c && c.broken){ const h = P(0.66, 0.36, 12); g.fillStyle = '#2A1C14'; g.beginPath(); D.ell(g, h[0], h[1], 5 * k, 2.4 * k); g.fill(); } }, {layer: 1});
    B.drum(0.5, 0.46, 12, 0.07, 20, iron, {rings: 2, layer: 2}); B.cone(0.5, 0.46, 32, 0.085, 5, iron, {layer: 2});
    B.custom(0.5, 0.46, (g, P, k) => { const s0 = P(0.5, 0.52, 26), s1 = P(0.5, 0.72, 25); g.strokeStyle = iron; g.lineCap = 'round'; g.lineWidth = 2.6 * k; g.beginPath(); g.moveTo(s0[0], s0[1]); g.quadraticCurveTo(s1[0], s1[1] - 2 * k, s1[0], s1[1] + 2.5 * k); g.stroke();
      const h0 = P(0.5, 0.4, 33), h1 = P(0.5, 0.06, 42); g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(h0[0], h0[1]); g.quadraticCurveTo((h0[0] + h1[0]) / 2, h1[1] - 2 * k, h1[0], h1[1]); g.stroke(); g.fillStyle = '#2A1C14'; g.beginPath(); D.ell(g, h1[0], h1[1], 1.5 * k, 1.5 * k); g.fill();
      if(!(c && c.broken)){ const p = P(0.5, 0.74, 12); g.strokeStyle = '#7A7A82'; g.lineWidth = 0.7 * k; g.beginPath(); g.arc(p[0], p[1] - 7 * k, 3.4 * k, Math.PI, 0); g.stroke(); g.fillStyle = D.lin(g, p[0] - 3.4 * k, 0, p[0] + 3.4 * k, 0, ['#D8DCE2', '#A8ADB6', '#7E848E']); g.beginPath(); g.moveTo(p[0] - 3.4 * k, p[1] - 7 * k); g.lineTo(p[0] + 3.4 * k, p[1] - 7 * k); g.lineTo(p[0] + 2.6 * k, p[1]); g.lineTo(p[0] - 2.6 * k, p[1]); g.closePath(); g.fill();
        g.fillStyle = c ? '#8A8A8A' : '#7CC3E8'; g.beginPath(); D.ell(g, p[0], p[1] - 7 * k, 3.4 * k, 1.1 * k); g.fill(); g.strokeStyle = '#6E737C'; g.lineWidth = 0.6 * k; line(g, [p[0] - 3.1 * k, p[1] - 4 * k], [p[0] + 3.1 * k, p[1] - 4 * k]); } }, {layer: 3});
    B.bill(0.86, 0.8, 0, (g, x, y, k) => { if(c) return; [[-3, '#FFD23F'], [0, '#FFFFFF'], [3, '#B48CFF']].forEach(([dx, col], i) => { g.strokeStyle = '#4CA83A'; g.lineWidth = 0.8 * k; line(g, [x + dx * k, y], [x + dx * k, y - (6 + i) * k]); g.fillStyle = col; g.beginPath(); D.ell(g, x + dx * k, y - (6.5 + i) * k, 1.5 * k, 1.3 * k); g.fill(); }); }, {layer: 1}); }; })();
// 🛒 farm stand: three stepped shelves of crates (apples · corn · pumpkins · greens), a checked cloth, a tin lean-to roof, a chalkboard "FRESH"
(function(){ const def = STALL('farm', 'stall_farm', 'Farm stand', {h: 62, tags: ['shop', 'stall', 'food']});
  def.build = (B, v, L) => { const c = L.cond, post = '#8E5A34';
    [[0.08, 0.08, 54], [1.84, 0.08, 54], [0.08, 0.84, 42], [1.84, 0.84, 42]].forEach(([x, y, h]) => B.box(x, y, 0, 0.08, 0.08, h, post));
    const s1 = B.box(0.14, 0.62, 0, 1.72, 0.24, 11, '#C99257'), s2 = B.box(0.14, 0.38, 0, 1.72, 0.24, 19, '#B98A5E'), s3 = B.box(0.14, 0.14, 0, 1.72, 0.24, 27, '#C99257');
    B.decal(s1, 'front', 0, 1.72, 0, 11, '#FFFFFF', {paint: (g, Q, k) => { if(c && c.broken) return; g.fillStyle = '#D83A34'; for(let i = 0; i < 16; i++) for(let r = 0; r < 3; r++) if((i + r) % 2 === 0) polyP(g, [Q(i / 16, r * 3.67), Q((i + 1) / 16, r * 3.67), Q((i + 1) / 16, (r + 1) * 3.67), Q(i / 16, (r + 1) * 3.67)]), g.fill(); }});
    B.custom(1, 0.5, (g, P, k) => { const goods = [['apple', ['#D83A34', '#E8503A']], ['corn', ['#F2C23A', '#E8B030']], ['pump', ['#F28C28', '#E87A1A']], ['green', ['#5DBB4A', '#3FA34D']]], rot = v % 4;
      [[0.74, 11], [0.5, 19], [0.26, 27]].forEach(([y, z], row) => { [0.5, 1.5].forEach((x, i) => { const gd = goods[(row * 2 + i + rot) % 4], q = P(x, y, z); g.fillStyle = '#A27A4E'; g.fillRect(q[0] - 12 * k, q[1] - 3 * k, 24 * k, 4 * k);
        const col = c ? ['#8A7A5A', '#7A6A4A'] : gd[1]; heap(g, [q[0], q[1] - 3.5 * k], k, gd[0] === 'pump' ? 5 : 9, col, gd[0] === 'pump' ? 3.4 : gd[0] === 'corn' ? 2.4 : 2.2, 3 + row * 2 + i, {cob: gd[0] === 'corn'}); }); }); }, {layer: 1});
    B.custom(1, 0.5, (g, P, k) => { const q = [P(-0.06, 0.02, 57), P(2.06, 0.02, 57), P(2.06, 1.02, 43), P(-0.06, 1.02, 43)]; g.fillStyle = c && c.broken ? '#8A7E72' : '#A9B4BF'; polyP(g, q); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 0.9 * k; for(let i = 1; i < 14; i++){ const f = i / 14; line(g, mix(q[0], q[1], f), mix(q[3], q[2], f)); }
      if(c && c.broken){ g.fillStyle = 'rgba(30,20,14,0.86)'; polyP(g, [mix(q[0], q[1], 0.55), mix(q[0], q[1], 0.8), mix(mix(q[3], q[2], 0.8), mix(q[0], q[1], 0.8), 0.4), mix(mix(q[3], q[2], 0.6), mix(q[0], q[1], 0.6), 0.5)]); g.fill(); }
      g.fillStyle = '#6E7A86'; polyP(g, [q[3], q[2], [q[2][0], q[2][1] + 2 * k], [q[3][0], q[3][1] + 2 * k]]); g.fill(); }, {layer: 4});
    B.custom(1.8, 0.95, (g, P, k) => { const q = P(1.86, 1.0, 0); g.strokeStyle = '#8E5A34'; g.lineWidth = 1.4 * k; line(g, [q[0] - 7 * k, q[1]], [q[0] - 4 * k, q[1] - 16 * k]); line(g, [q[0] + 7 * k, q[1]], [q[0] + 4 * k, q[1] - 16 * k]);
      g.fillStyle = '#8E5A34'; g.fillRect(q[0] - 9 * k, q[1] - 17 * k, 18 * k, 11 * k); g.fillStyle = '#2E3A34'; g.fillRect(q[0] - 7.8 * k, q[1] - 15.8 * k, 15.6 * k, 8.6 * k);
      if(!(c && c.broken)) D.txt(g, 'FRESH', q[0], q[1] - 9.4 * k, {size: 5.6 * k, align: 'center', col: '#F4EFE4', w: 700}); }, {layer: 5}); }; })();
// 📜 barn-door board: a red board with a white X brace, notes, a nailed horseshoe, a tin roof and a rooster weathervane
(function(){ const def = BOARD('farm', 'qboard_barn', 'Barn-door board', {h: 66});
  def.build = (B, v, L) => { const c = L.cond, red = '#B8402F';
    [0.1, 0.8].forEach(x => B.box(x, 0.45, 0, 0.1, 0.1, 40, '#8E5A34'));
    const b = B.box(0.06, 0.5, 8, 0.88, 0.1, 30, red);
    B.decal(b, 'front', 0.02, 0.84, 1, 28, red, {paint: (g, Q, k) => { g.strokeStyle = '#F4EFE4'; g.lineWidth = 1.8 * k; polyP(g, [Q(0.04, 1.5), Q(0.96, 1.5), Q(0.96, 26.5), Q(0.04, 26.5)]); g.stroke(); line(g, Q(0.04, 1.5), Q(0.96, 26.5)); line(g, Q(0.04, 26.5), Q(0.96, 1.5));
      [[0.1, 4, 0.26, 12], [0.62, 6, 0.28, 13], [0.36, 14, 0.24, 9]].forEach(([u, z, w, h], i) => { if(c && c.broken && i === 1) return; g.fillStyle = c ? '#D8CCB0' : '#FFFDF4'; polyP(g, [Q(u, z), Q(u + w, z), Q(u + w, z + h), Q(u, z + h)]); g.fill(); g.strokeStyle = 'rgba(60,60,80,0.4)'; g.lineWidth = 0.6 * k; for(let r = 3; r < h - 1; r += 2.6) line(g, Q(u + 0.04, z + r), Q(u + w - 0.05, z + r)); }); }});
    B.roof(0.0, 0.38, 38, 1.0, 0.34, 10, '#7E8892', {ridge: 'x', ov: 0.08, stripes: 6, layer: 1});
    B.custom(0.5, 0.55, (g, P, k) => { const top = P(0.5, 0.55, 48), p2 = [top[0], top[1] - 10 * k]; g.strokeStyle = '#3A3A42'; g.lineWidth = 1 * k; line(g, top, p2); line(g, [p2[0] - 6 * k, p2[1] + 3 * k], [p2[0] + 6 * k, p2[1] + 3 * k]);
      g.fillStyle = '#2A2A32'; g.beginPath(); g.moveTo(p2[0] - 4 * k, p2[1]); g.quadraticCurveTo(p2[0] - 4.5 * k, p2[1] - 5 * k, p2[0] - 1 * k, p2[1] - 4 * k); g.lineTo(p2[0], p2[1] - 7 * k); g.lineTo(p2[0] + 1.6 * k, p2[1] - 4.5 * k); g.lineTo(p2[0] + 3.6 * k, p2[1] - 4 * k); g.lineTo(p2[0] + 2 * k, p2[1] - 2.4 * k); g.quadraticCurveTo(p2[0] + 3 * k, p2[1], p2[0], p2[1]); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(p2[0] - 4 * k, p2[1] - 1 * k); g.lineTo(p2[0] - 7.5 * k, p2[1] - 5 * k); g.lineTo(p2[0] - 6 * k, p2[1] - 0.5 * k); g.closePath(); g.fill(); }, {layer: 3});
    B.custom(0.5, 0.62, (g, P, k) => { const q = P(0.5, 0.61, 30); g.fillStyle = c ? '#B8A870' : '#FFD23F'; g.beginPath(); D.ell(g, q[0], q[1], 5 * k, 5 * k); g.fill(); g.fillStyle = '#5A5A62'; [[-3.6, -3.6], [3.6, -3.6]].forEach(([dx, dy]) => { g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, 0.7 * k, 0.7 * k); g.fill(); }); bang(g, q[0], q[1], k, {size: 9, col: '#2A1C14'});
      const h = P(0.86, 0.6, 33); g.strokeStyle = '#8E8A82'; g.lineWidth = 1.6 * k; g.lineCap = 'round'; g.beginPath(); g.arc(h[0], h[1], 2.6 * k, 0.2, Math.PI - 0.2, true); g.stroke(); }, {layer: 2}); }; })();
// 🏮 hurricane lantern: a fence post with an iron shepherd's hook, a red kerosene lantern with a glass globe and a little flame
(function(){ const def = LAMP('farm', 'lantern_hurricane', 'Hurricane lantern', {h: 50, live: {period: 1.4, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, lv = lightOf(c);
    B.box(0.41, 0.41, 0, 0.18, 0.18, 38, '#8E5A34'); B.box(0.39, 0.39, 38, 0.22, 0.22, 2, '#6E4024', {layer: 1});
    B.custom(0.5, 0.8, (g, P, k, t) => { const a = P(0.5, 0.5, 40), b = P(0.5, 0.62, 47), d = P(0.5, 0.84, 46); g.strokeStyle = '#3A3A42'; g.lineWidth = 1.3 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1] - 2 * k, d[0], d[1]); g.lineTo(d[0], d[1] + 2.5 * k); g.stroke();
      const x = d[0], y = d[1] + 11 * k, f = 0.85 + 0.1 * Math.sin((t || 0) / 1.4 * TAU) + 0.06 * Math.cos((t || 0) / 1.4 * TAU), red = c ? '#8A5A4A' : '#C8302A';
      g.strokeStyle = '#3A3A42'; g.lineWidth = 0.8 * k; g.beginPath(); g.arc(x, y - 5.5 * k, 3.6 * k, Math.PI * 1.05, -0.05 * Math.PI); g.stroke();
      if(lv) D.glow(g, x, y, 14 * k * f, '#FFC86A', 0.55 * lv);
      g.fillStyle = red; g.beginPath(); g.moveTo(x - 2.6 * k, y - 6 * k); g.lineTo(x + 2.6 * k, y - 6 * k); g.lineTo(x + 3.4 * k, y - 4.5 * k); g.lineTo(x - 3.4 * k, y - 4.5 * k); g.closePath(); g.fill();
      g.fillStyle = c && c.broken ? 'rgba(80,80,80,0.6)' : 'rgba(255,240,190,0.85)'; g.beginPath(); D.ell(g, x, y, 3.6 * k, 4.6 * k); g.fill();
      if(lv){ g.fillStyle = '#FF9A2E'; g.beginPath(); g.moveTo(x, y - 2.6 * k * f); g.quadraticCurveTo(x + 1.5 * k, y + 0.5 * k, x, y + 1.2 * k); g.quadraticCurveTo(x - 1.5 * k, y + 0.5 * k, x, y - 2.6 * k * f); g.fill(); }
      g.strokeStyle = '#3A3A42'; g.lineWidth = 0.6 * k; [-2, 0, 2].forEach(dx => line(g, [x + dx * k, y - 4.5 * k], [x + dx * 1.2 * k, y + 4.4 * k]));
      g.fillStyle = red; g.beginPath(); D.ell(g, x, y + 5.6 * k, 4.4 * k, 1.8 * k); g.fill(); g.fillRect(x - 4.4 * k, y + 5.6 * k, 8.8 * k, 2 * k); g.beginPath(); D.ell(g, x, y + 7.6 * k, 4.4 * k, 1.6 * k); g.fill(); }, {layer: 2}); }; })();

/* ---------- 🗺️ hand them out through the looks (same footprint + door + block as the village ones → every town keeps its plan, T6) ---------- */
const PLAZA = {jungle: {well: 'well_thai', stall: 'stall_thai', qboard: 'qboard_thai', lantern: 'lantern_thai'},
  cherry: {well: 'well_ido', stall: 'stall_yatai', qboard: 'qboard_ema', lantern: 'stonelantern'},
  desert: {well: 'well_mosaic', qboard: 'qboard_scroll', lantern: 'lantern_brass'},   // its stall = the 2 × 2 market tent (roles.shop) — a hand-placed 2 × 1 stall keeps the village one
  snow: {well: 'well_log', stall: 'stall_chalet', qboard: 'qboard_rune', lantern: 'aurorapost'},
  farm: {well: 'well_pump', stall: 'stall_farm', qboard: 'qboard_barn', lantern: 'lantern_hurricane'}};
Object.keys(PLAZA).forEach(lk => { const L = LOOKS[lk]; if(!L) return; const sw = {}; Object.keys(PLAZA[lk]).forEach(a => { if(DEFS[PLAZA[lk][a]]) sw[a] = PLAZA[lk][a]; }); L.swap = Object.assign({}, L.swap || {}, sw); });
})();
window.Props.world = 'ip-3d';
})(window.Props && window.Props._K);
