
/* 🌍 IsoLook_coral — 🌊 coral → Coral Cove — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['coral'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/coral.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_coral: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🌊 coral · Coral Cove (ip-4a). Runs after the engine with Props._K (kit insides) + T (tools). */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, puffs, bubbles, bang, innBoard, glowAt, halo, anvil, porthole, archDoor, ports} = T;
const D = PD, M = MAT, TAU = Math.PI * 2, S2 = Math.SQRT2;
const own = (set) => (key, o) => add(set, key, Object.assign({look: set}, o));
const org = (set) => (key, o, fn) => organic(set, key, Object.assign({look: set}, o), fn);
addSet('coral', {name: 'Coral', icon: '🌊', accent: '#FF6F91'});
if(typeof Iso !== 'undefined' && Iso.addTheme){
  if(!Iso.THEMES.coral) Iso.addTheme('coral', {base: '#C9A46A', baseDark: '#8C6E44', bg: ['#2A86C8', '#9EE8F2'], tile: {grass: {top: '#7FD0B2', top2: '#6CC2A2', lip: '#5AAE8E', side: '#B08A58', deco: 'tuft'},
    flower: {top: '#86D4B8', top2: '#72C6A8', lip: '#5AAE8E', side: '#B08A58', deco: 'flower'}, sand: {top: '#F6E2B4', top2: '#EED4A0', side: '#C9A46A', deco: 'dot'}, path: {top: '#FBE8C4', top2: '#F0DAAE', deco: 'pebble'}}}, 'beach');
}
/* ============================ 🌊 CORAL — Coral Cove (a cheerful reef town under the sea) ============================ */
addLook('coral', {name: 'Coral', walls: ['#FFB4A2', '#FFE9D2', '#C9B6F2', '#9EE6E0'], roofs: ['#2EC4B6', '#5A8DEE', '#FF6F91'], trim: '#3A4A6A', accent: '#FFD23F', stilts: false, ground: 'coral'}, 'jungle');
const CA = own('coral'), CO = org('coral'), SEA = '#2EC4B6', PEARL = '#FFF4E8', LIP = '#FF8FA3', DRIFT = '#C9B49A';
// coral-stone pits on a wall
const pits = (n, hgt, seed) => (g, Q, k) => { const R = D.rnd(seed); g.fillStyle = 'rgba(120,60,60,0.22)'; for(let i = 0; i < n; i++){ const q = Q(0.05 + R() * 0.9, 3 + R() * (hgt - 6)); g.beginPath(); D.ell(g, q[0], q[1], 1.3 * k, 1 * k); g.fill(); } };
function starfish(g, x, y, k, col, r){ g.fillStyle = col; g.beginPath(); D.star(g, x, y, (r || 5) * k, (r || 5) * 0.45 * k, 5, -Math.PI / 2 + 0.2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(x, y, 0.8 * k, 0, TAU); g.fill(); }
function pearl(g, x, y, r){ g.fillStyle = D.rad(g, x - r * 0.35, y - r * 0.4, r * 0.1, r * 1.1, ['#FFFFFF', PEARL, '#D9C8E8']); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
// a spiral whorl stack (the conch house + the pearl spire): rings getting smaller, each with a pink lip line
function whorls(g, P, k, cx, cy, z, list, col, lip){ let top = null; list.forEach(([r0, r1, h], i) => { const f = frustum(g, P, k, cx + i * 0.02, cy - i * 0.02, z, r0, r1, h, i % 2 ? sh(col, 0.08) : col, {topFill: sh(col, 0.2)});
  g.strokeStyle = lip; g.lineWidth = 2 * k; g.beginPath(); g.ellipse(f.c0[0], f.c0[1] - 2 * k, f.a * 0.98, f.a * 0.49, 0, 0.1, Math.PI - 0.1); g.stroke(); z += h; top = f; }); return top; }
// 🐚 spiral-shell house: a giant conch on a sand ring, a pink arched porch, round windows
(function(){ const def = CA('shellhouse', {name: 'Shell house', foot: [2, 2], h: 96, variants: 3, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const c = L.cond, col = ['#FFE3C8', '#FFD0D8', '#E8DCFF'][v % 3];
    B.drum(1, 1, 0, 0.9, 6, '#F2D8A8', {layer: -1});
    B.custom(1, 0.9, (g, P, k) => { const top = whorls(g, P, k, 1, 0.9, 6, [[0.82, 0.68, 26], [0.66, 0.5, 22], [0.5, 0.32, 18], [0.32, 0.16, 14]], col, LIP);
      const tip = [top.c1[0], top.c1[1] - 10 * k]; g.fillStyle = sh(col, 0.2); g.beginPath(); g.moveTo(top.c1[0] - top.b, top.c1[1]); g.lineTo(tip[0], tip[1]); g.lineTo(top.c1[0] + top.b, top.c1[1]); g.closePath(); g.fill();
      const q = P(1, 0.9, 40), lv = lightOf(c); [[-14, 2], [12, 6]].forEach(([dx, dy]) => { g.fillStyle = LIP; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, 5.4 * k, 6.4 * k); g.fill(); g.fillStyle = lv ? '#9EE8F2' : '#4A4A55'; g.beginPath(); D.ell(g, q[0] + dx * k, q[1] + dy * k, 3.6 * k, 4.6 * k); g.fill(); }); }, {layer: 0});
    const p = B.box(0.7, 1.42, 0, 0.6, 0.5, 34, LIP, {layer: 2}); B.decal(p, 'front', 0.75, 0.5, 0, 30, '#6A3A4A', {paint: archDoor('#6A3A4A', '#FFD9E0')});
    B.custom(1.0, 1.92, (g, P, k) => { const q = P(1.0, 1.92, 34); g.fillStyle = LIP; g.beginPath(); for(let i = 0; i <= 8; i++){ const a = Math.PI + i / 8 * Math.PI, r = (i % 2 ? 10 : 12) * k; g.lineTo(q[0] + Math.cos(a) * r * 1.1, q[1] + Math.sin(a) * r * 0.7); } g.closePath(); g.fill();
      g.strokeStyle = 'rgba(160,60,80,0.5)'; g.lineWidth = 0.8 * k; for(let i = 1; i < 6; i++){ const a = Math.PI + i / 6 * Math.PI; line(g, q, [q[0] + Math.cos(a) * 11 * k, q[1] + Math.sin(a) * 7.5 * k]); } }, {layer: 3});   // scallop over the door
  }; })();
// 🏠 coral-stone house: pastel coral walls with portholes, a sea-glass dome roof, a starfish by the door
(function(){ const def = CA('coralhouse', {name: 'Coral house', foot: [2, 2], h: 92, variants: 4, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const c = L.cond, wall = L.walls[v % L.walls.length], glass = ['#7FE0E8', '#9EB8FF', '#FFB0C8', '#A8F0C8'][v % 4];
    B.box(0.06, 0.06, 0, 1.88, 1.88, 4, '#E8D2A8', {layer: -1});
    const b = B.box(0.16, 0.16, 4, 1.68, 1.68, 44, wall); B.decal(b, 'front', ...F(b, 'front'), 0, 44, wall, {paint: pits(14, 44, 3 + v)}); B.decal(b, 'right', ...F(b, 'right'), 0, 44, wall, {paint: pits(14, 44, 7 + v)});
    B.door(b, 'front', 0.72, 0.44, 30, {fill: '#3A4A6A'}); B.decal(b, 'front', ...F(b, 'front'), 0, 44, wall, {paint: ports([[0.2, 24, 5], [0.82, 26, 5]], '#F2C23A', c)}); B.decal(b, 'right', ...F(b, 'right'), 0, 44, wall, {paint: ports([[0.3, 26, 5], [0.72, 26, 5]], '#F2C23A', c)});
    B.box(0.12, 0.12, 48, 1.76, 1.76, 4, sh(wall, -0.15), {layer: 1});
    B.custom(1, 1, (g, P, k) => { const d = dome(g, P, k, 1, 1, 52, 0.74, 38, c ? sh(glass, -0.3) : glass, {hi: '#FFFFFF'}); g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1 * k; [-0.4, 0.15].forEach(u => { g.beginPath(); g.ellipse(d.c[0] + u * d.rx * 0.3, d.c[1], d.rx * (1 - Math.abs(u) * 0.6), d.hh, 0, Math.PI * 1.05, Math.PI * 1.6); g.stroke(); });
      if(c && c.broken){ g.fillStyle = 'rgba(30,30,40,0.7)'; g.beginPath(); D.ell(g, d.c[0] + d.rx * 0.2, d.c[1] - d.hh * 0.6, d.rx * 0.28, d.hh * 0.22); g.fill(); } }, {layer: 2});
    B.custom(0.5, 1.98, (g, P, k) => { const q = P(0.62, 1.88, 12); starfish(g, q[0], q[1], k, '#FF8A3A', 4.6); }, {layer: 3});
    B.bill(1.9, 1.86, 0, (g, x, y, k) => { g.strokeStyle = '#FF6F91'; g.lineCap = 'round'; g.lineWidth = 2.4 * k; [[-0.4, 16], [0.1, 22], [0.5, 14]].forEach(([a, l]) => { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.sin(a) * l * 0.5 * k, y - l * 0.5 * k, x + Math.sin(a) * l * k, y - l * k); g.stroke(); g.fillStyle = '#FF8FA3'; g.beginPath(); g.arc(x + Math.sin(a) * l * k, y - l * k, 2.2 * k, 0, TAU); g.fill(); }); }, {layer: 3});
  }; })();
// 🏨 pearl inn: two storeys of pastel coral stone, portholes all round, a giant open clam-shell roof with a glowing pearl on top
(function(){ const def = CA('inn_pearl', {name: 'Pearl inn', foot: [3, 2], door: [1, 2], h: 128, variants: 2, tags: ['house', 'big', 'rest', 'inn']});
  def.build = (B, v, L) => { const c = L.cond, wall = ['#FFE9D2', '#C9B6F2'][v % 2], shell = ['#FFC8D2', '#FFE3B0'][v % 2];
    B.box(0.06, 0.06, 0, 2.88, 1.88, 4, '#E8D2A8', {layer: -1});
    const b = B.box(0.16, 0.16, 4, 2.68, 1.6, 64, wall); B.decal(b, 'front', ...F(b, 'front'), 0, 64, wall, {paint: pits(22, 64, 11)}); B.decal(b, 'right', ...F(b, 'right'), 0, 64, wall, {paint: pits(14, 64, 13)});
    B.door(b, 'front', 0.88, 0.48, 32, {fill: '#3A4A6A'}); B.decal(b, 'front', ...F(b, 'front'), 0, 64, wall, {paint: ports([[0.12, 22], [0.62, 22], [0.85, 22], [0.12, 48], [0.38, 48], [0.62, 48], [0.85, 48]], '#F2C23A', c)});
    B.decal(b, 'right', ...F(b, 'right'), 0, 64, wall, {paint: ports([[0.3, 22], [0.7, 22], [0.3, 48], [0.7, 48]], '#F2C23A', c)});
    B.decal(b, 'front', ...F(b, 'front'), 34, 4, SEA, {}); B.decal(b, 'right', ...F(b, 'right'), 34, 4, SEA, {});
    B.roof(0.16, 0.16, 68, 2.68, 1.6, 30, shell, {kind: 'hip', ov: 0.22, layer: 1});
    B.custom(1.5, 0.96, (g, P, k) => { const a = P(0.16 - 0.22, 1.98, 68), b2 = P(2.84 + 0.22, 1.98, 68), top = P(1.5, 0.96, 98); g.strokeStyle = 'rgba(160,70,90,0.35)'; g.lineWidth = 1 * k; for(let i = 1; i < 9; i++){ const f = i / 9; line(g, top, [a[0] + (b2[0] - a[0]) * f, a[1] + (b2[1] - a[1]) * f]); }
      g.strokeStyle = LIP; g.lineWidth = 2.2 * k; g.beginPath(); for(let i = 0; i <= 18; i++){ const f = i / 18, x = a[0] + (b2[0] - a[0]) * f, y = a[1] + (b2[1] - a[1]) * f + Math.abs(Math.sin(f * Math.PI * 9)) * 2.4 * k; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      const q = P(1.5, 0.96, 104); pearl(g, q[0], q[1], 7 * k); }, {layer: 2});
    if(lightOf(c)) halo(B, 1.5, 0.96, 104, 18, '#BFF4FF', 0.45 * lightOf(c));
    innBoard(B, 0.62, 1.98, 30, {shape: 'shell', fill: '#FFF4E8', edge: LIP, ink: '#3A4A6A', w: 32, h: 15});
    B.custom(2.5, 1.95, (g, P, k) => { const q = P(2.5, 1.86, 0); starfish(g, q[0] - 6 * k, q[1] - 3 * k, k, '#FFB03A', 4); starfish(g, q[0] + 6 * k, q[1] - 1 * k, k, '#FF6F91', 3.4); }, {layer: 3});
  }; })();
// ⚒️ bubble-vent forge: a coral-stone smithy over a warm sea vent — a coral-tube chimney blowing bubbles · anvil · kelp-wrapped trough
(function(){ const def = CA('smithy_vent', {name: 'Bubble forge', foot: [2, 2], door: [0.86, 2], h: 104, tags: ['shop', 'forge', 'smithy'], live: {period: 1.6, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, wall = '#FFB4A2';
    B.box(0.04, 0.04, 0, 1.92, 1.92, 4, '#E8D2A8', {layer: -1});
    const back = B.box(0.12, 0.12, 4, 1.76, 0.4, 46, wall); B.decal(back, 'right', ...F(back, 'right'), 0, 46, wall, {paint: pits(5, 46, 3)});
    const side = B.box(1.5, 0.52, 4, 0.38, 1.2, 46, wall); B.decal(side, 'right', ...F(side, 'right'), 0, 46, wall, {paint: pits(10, 46, 5)}); B.decal(side, 'right', ...F(side, 'right'), 0, 46, wall, {paint: ports([[0.45, 26, 5]], '#F2C23A', c)});
    B.box(0.12, 1.66, 4, 0.14, 0.14, 46, DRIFT); B.box(0.12, 0.5, 4, 0.14, 0.14, 46, DRIFT);
    B.roof(0.06, 0.06, 50, 1.86, 1.0, 22, SEA, {ridge: 'x', ov: 0.1, stripes: 8, gable: sh(wall, -0.1)});
    B.box(0.36, 0.2, 4, 0.5, 0.36, 20, '#7A6A7A');   // the vent hearth
    B.custom(0.6, 0.6, (g, P, k) => { const q = P(0.6, 0.6, 14), lv = lightOf(c); g.fillStyle = lv ? '#FFC86A' : '#5A4A4A'; g.beginPath(); D.ell(g, q[0], q[1], 7 * k, 3 * k); g.fill(); }, {layer: 3});
    if(lightOf(c)) halo(B, 0.6, 0.6, 14, 18, '#FFB03A', 0.7 * lightOf(c));
    B.drum(0.6, 0.38, 24, 0.13, 74, '#FF8A7A', {rings: 6, layer: 3, topFill: '#C85A5A'});   // coral-tube chimney
    B.custom(0.6, 0.38, (g, P, k, t) => { if(c && c.broken) return; const q = P(0.6, 0.38, 98); bubbles(g, q[0], q[1], k, t, {period: 1.6, rise: 24, n: 5}); }, {layer: 6});
    anvil(B, 0.3, 1.36, DRIFT); B.box(1.0, 1.6, 0, 0.42, 0.22, 7, DRIFT, {topFill: c ? '#7A8A80' : '#5AC0D8', layer: 1});
    B.custom(1.2, 1.82, (g, P, k) => { const q = P(1.0, 1.82, 7); g.strokeStyle = '#4FA05A'; g.lineWidth = 1.6 * k; g.lineCap = 'round'; for(let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(q[0] + i * 4 * k, q[1]); g.quadraticCurveTo(q[0] + i * 4 * k + 3 * k, q[1] + 4 * k, q[0] + i * 4 * k - 1 * k, q[1] + 8 * k); g.stroke(); } }, {layer: 3});
  }; })();
// ⛲ clam fountain: a giant clam open on a rock, a big pearl inside, bubbles rising
(function(){ const def = CA('well_clam', {name: 'Clam fountain', foot: [1, 1], h: 60, tags: ['water', 'well'], live: {period: 2, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond;
    B.drum(0.5, 0.5, 0, 0.4, 10, '#B8A7C8', {rings: 2, topFill: '#C9B8D8'});
    if(lightOf(c)) halo(B, 0.5, 0.5, 10, 15, '#BFF4FF', 0.45 * lightOf(c), {dy: -8});
    B.bill(0.5, 0.5, 10, (g, x, y, k, t) => { const w = 18 * k, sc = '#FFC8D2';
      g.fillStyle = sh(sc, 0.1); g.beginPath(); g.moveTo(x - w, y - 4 * k); g.quadraticCurveTo(x - w * 1.1, y - 36 * k, x, y - 42 * k); g.quadraticCurveTo(x + w * 1.1, y - 36 * k, x + w, y - 4 * k); g.closePath(); g.fill();   // the upper shell, open
      g.strokeStyle = 'rgba(160,70,90,0.4)'; g.lineWidth = 1 * k; for(let i = 1; i < 8; i++){ const a = Math.PI + i / 8 * Math.PI; line(g, [x, y - 4 * k], [x + Math.cos(a) * w * 0.95, y - 4 * k + Math.sin(a) * 36 * k]); }
      g.fillStyle = !c ? '#7FE0E8' : c.broken ? '#3A3040' : '#8A9A90'; g.beginPath(); D.ell(g, x, y - 4 * k, w * 0.86, 5 * k); g.fill();
      pearl(g, x, y - 8 * k, 6 * k);
      g.fillStyle = sc; g.beginPath(); g.moveTo(x - w, y - 4 * k); g.quadraticCurveTo(x - w * 0.9, y + 6 * k, x, y + 7 * k); g.quadraticCurveTo(x + w * 0.9, y + 6 * k, x + w, y - 4 * k); g.closePath(); g.fill();   // the lower shell (front)
      g.strokeStyle = LIP; g.lineWidth = 1.6 * k; g.beginPath(); for(let i = 0; i <= 10; i++){ const f = i / 10, xx = x - w + 2 * w * f, yy = y - 4 * k + Math.abs(Math.sin(f * Math.PI * 5)) * 2 * k; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
      if(!c) bubbles(g, x, y - 14 * k, k, t, {period: 2, rise: 22, n: 4}); }, {layer: 1});
  }; })();
// 🛒 reef stall: a coral-stone counter under a scallop-shell awning on driftwood poles — shells, pearls, sea-fruit
(function(){ const def = CA('stall_reef', {name: 'Reef stall', foot: [2, 1], door: [1, 1], h: 64, variants: 3, tags: ['shop', 'stall']});
  def.build = (B, v, L) => { const c = L.cond, aw = ['#FFC8D2', '#FFE3B0', '#C8F0E8'][v % 3];
    [[0.12, 0.2], [1.78, 0.2]].forEach(p => B.box(p[0], p[1], 0, 0.1, 0.1, 46, DRIFT));
    const ct = B.box(0.2, 0.4, 0, 1.6, 0.44, 16, '#FFB4A2', {topFill: '#FFD8C8'}); B.decal(ct, 'front', ...F(ct, 'front'), 0, 16, '#FFB4A2', {paint: pits(8, 16, 9)});
    B.custom(1, 0.62, (g, P, k) => { const q1 = P(0.45, 0.62, 16), q2 = P(1.0, 0.62, 16), q3 = P(1.5, 0.62, 16);
      [[-4, '#FFE3C8'], [0, '#FFC8D2'], [4, '#E8DCFF']].forEach(([dx, col]) => { g.fillStyle = c ? sh(col, -0.3) : col; g.beginPath(); g.moveTo(q1[0] + dx * k - 3 * k, q1[1]); g.quadraticCurveTo(q1[0] + dx * k, q1[1] - 8 * k, q1[0] + dx * k + 3 * k, q1[1]); g.closePath(); g.fill(); });
      [0, 1, 2, 3].forEach(i => pearl(g, q2[0] + (i - 1.5) * 4 * k, q2[1] - 2.4 * k - (i % 2) * 1.5 * k, 2.2 * k));
      [['#FF6F91', -4], ['#8B5CF6', 0], ['#FFB03A', 4]].forEach(([col, dx]) => { g.fillStyle = c ? sh(col, -0.35) : col; g.beginPath(); g.arc(q3[0] + dx * k, q3[1] - 3 * k, 2.6 * k, 0, TAU); g.fill(); g.strokeStyle = sh(col, -0.3); g.lineWidth = 0.6 * k; for(let a = 0; a < 8; a++){ const an = a * TAU / 8; line(g, [q3[0] + dx * k + Math.cos(an) * 2.6 * k, q3[1] - 3 * k + Math.sin(an) * 2.6 * k], [q3[0] + dx * k + Math.cos(an) * 3.8 * k, q3[1] - 3 * k + Math.sin(an) * 3.8 * k]); } }); }, {layer: 2});
    B.roof(0.04, 0.08, 46, 1.92, 0.84, 14, aw, {ridge: 'x', ov: 0.1, stripes: 10, layer: 3});
    B.custom(1, 0.95, (g, P, k) => { const a = P(-0.06, 1.02, 46), b2 = P(2.06, 1.02, 46); g.fillStyle = sh(aw, -0.12); g.beginPath(); g.moveTo(a[0], a[1]); for(let i = 0; i <= 10; i++){ const f = i / 10, x = a[0] + (b2[0] - a[0]) * f, y = a[1] + (b2[1] - a[1]) * f; g.lineTo(x, y); if(i < 10){ const m = [x + (b2[0] - a[0]) * 0.05, y + (b2[1] - a[1]) * 0.05]; g.quadraticCurveTo(m[0], m[1] + 7 * k, x + (b2[0] - a[0]) * 0.1, y + (b2[1] - a[1]) * 0.1); } } g.closePath(); g.fill(); }, {layer: 4});   // scalloped edge
  }; })();
// 📜 driftwood board: planks on two posts, kelp draped over the top, paper notes, the "!" on a starfish
(function(){ const def = CA('qboard_drift', {name: 'Driftwood board', foot: [1, 1], h: 58, tags: ['quest', 'board']});
  def.build = (B, v, L) => { const c = L.cond;
    [0.18, 0.74].forEach(x => B.box(x, 0.46, 0, 0.08, 0.08, 46, sh(DRIFT, -0.15)));
    const bd = B.box(0.14, 0.52, 14, 0.72, 0.08, 30, DRIFT);
    B.decal(bd, 'front', ...F(bd, 'front'), 0, 30, DRIFT, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(90,70,50,0.35)'; g.lineWidth = 0.8 * k; [8, 15, 22].forEach(z => line(g, Q(0, z), Q(1, z)));
      [[0.12, 5, '#FFF6E4'], [0.45, 13, '#E8F6FF'], [0.62, 4, '#FFE8EE']].forEach(([u, z, col]) => { if(c && c.broken && u > 0.4) return; g.fillStyle = col; polyP(g, [Q(u, z), Q(u + 0.26, z), Q(u + 0.26, z + 11), Q(u, z + 11)]); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.6 * k; for(let r = 0; r < 3; r++) line(g, Q(u + 0.04, z + 3 + r * 2.6), Q(u + 0.21, z + 3 + r * 2.6)); }); }});
    B.custom(0.5, 0.6, (g, P, k) => { const a = P(0.12, 0.6, 44), b2 = P(0.88, 0.6, 44); g.strokeStyle = c ? '#8A8A5A' : '#3E9A4A'; g.lineWidth = 2 * k; g.lineCap = 'round';
      [0.1, 0.35, 0.7, 0.9].forEach((f, i) => { const x = a[0] + (b2[0] - a[0]) * f, y = a[1] + (b2[1] - a[1]) * f; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4 * k, y + 6 * k, x - 1 * k, y + (10 + i * 3) * k); g.stroke(); });
      const q = P(0.5, 0.6, 52); starfish(g, q[0], q[1], k, c ? '#9A7A6A' : '#FF8A3A', 9); bang(g, q[0], q[1] + 0.5 * k, k, {size: 9}); }, {layer: 3});
  }; })();
// 🏮 jellyfish lamp: a twisted coral post, a glowing jellyfish lamp hanging from a hook, bobbing gently
(function(){ const def = (K.lamp || (d => d))(CA('lantern_jelly', {name: 'Jellyfish lamp', foot: [1, 1], h: 50, kind: 'post', block: false, variants: 2, tags: ['light', 'night', 'lantern'], live: {period: 2.2, frames: 6}}));   // 💡 ip-6a lit · out
  def.build = (B, v, L) => { const c = L.cond, col = ['#FF8FD0', '#7FE8FF'][v % 2];
    B.drum(0.4, 0.4, 0, 0.11, 6, '#B8A7C8'); B.drum(0.4, 0.4, 6, 0.06, 38, '#FF8A7A', {rings: 5});
    if(lightOf(c)) halo(B, 0.4, 0.68, 44, 15, col, 0.6 * lightOf(c), {dy: 9, dyT: t => (Math.sin(ph(t, 2.2)) + 0.4 * Math.cos(ph(t, 2.2))) * 1.6});
    B.custom(0.5, 0.6, (g, P, k, t) => { const a = P(0.4, 0.4, 44), d = P(0.4, 0.68, 44); g.strokeStyle = '#C85A5A'; g.lineWidth = 1.4 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + d[0]) / 2, a[1] - 5 * k, d[0], d[1]); g.stroke();
      const lv = lightOf(c), bob = (Math.sin(ph(t, 2.2)) + 0.4 * Math.cos(ph(t, 2.2))) * 1.6 * k, x = d[0], y = d[1] + 9 * k + bob;
      g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 0.6 * k; line(g, [x, d[1]], [x, y - 5 * k]);
      g.fillStyle = lv ? col : '#7A6A7A'; g.beginPath(); g.moveTo(x - 6 * k, y + 1 * k); g.quadraticCurveTo(x - 6 * k, y - 7 * k, x, y - 7 * k); g.quadraticCurveTo(x + 6 * k, y - 7 * k, x + 6 * k, y + 1 * k); g.closePath(); g.fill();
      g.strokeStyle = lv ? sh(col, 0.2) : '#7A6A7A'; g.lineWidth = 1 * k; for(let i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(x + i * 2.2 * k, y + 1 * k); g.quadraticCurveTo(x + i * 2.2 * k + Math.sin(ph(t, 2.2) + i) * 1.5 * k, y + 5 * k, x + i * 2 * k, y + 8 * k); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); D.ell(g, x - 2.4 * k, y - 4 * k, 1.4 * k, 1 * k); g.fill(); }, {layer: 2});
  }; })();
// 🪸 coral tree: a branching coral fan (pink · orange · purple), round tips — 🍂 dry = bleached white · 🏚️ ruined = bleached + broken stubs (coral never turns into a land tree)
function coralFan(g, x, y, k, v, c, depth, broken){ const R = D.rnd(41 + v); g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round';
  const tips = []; function br(x0, y0, a, len, w, d){ const x1 = x0 + Math.sin(a) * len, y1 = y0 - Math.cos(a) * len; g.strokeStyle = c[1]; g.lineWidth = w + 2; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + Math.sin(a) * len * 0.5 + (R() - 0.5) * 6, y0 - Math.cos(a) * len * 0.5, x1, y1); g.stroke();
    g.strokeStyle = c[0]; g.lineWidth = w; g.stroke(); if(d > 0){ br(x1, y1, a - 0.45 - R() * 0.2, len * 0.72, w * 0.72, d - 1); br(x1, y1, a + 0.4 + R() * 0.2, len * 0.7, w * 0.72, d - 1); } else tips.push([x1, y1, w]); }
  br(0, 0, -0.08, 22, 7, depth);
  tips.forEach(([tx, ty, w]) => { g.fillStyle = c[2]; g.beginPath(); g.arc(tx, ty, w * 0.75 + 1, 0, TAU); g.fill(); });
  if(broken){ g.fillStyle = c[1]; [[-14, 1], [9, 2], [16, 0]].forEach(([bx, by]) => { g.beginPath(); D.ell(g, bx, by, 3, 1.6, 0.3); g.fill(); }); }
  g.restore(); }
const CORS = [['#FF8FA3', '#E2557A', '#FFC8D2'], ['#FFB03A', '#E2763A', '#FFE0A0'], ['#B58BF2', '#8B5CF6', '#E0D0FF']], BLEACH = ['#F4EEE6', '#CFC6BA', '#FFFFFF'], BLEACH2 = ['#D8D0C4', '#A8A094', '#E6E0D8'];
CO('coraltree', {name: 'Coral tree', h: 70, variants: 3, tags: ['tree', 'coral'], conds: {'*': (g, x, y, k, t, v, c) => coralFan(g, x, y, k, v, c.broken ? BLEACH2 : BLEACH, c.broken ? 1 : 3, !!c.broken)}},
  (g, x, y, k, t, v) => coralFan(g, x, y, k, v, CORS[v % 3], 3, false));
// 🌿 kelp: tall swaying ribbons with leaf blades and little floats (live sway) — 🍂 dry = brown + drooping · 🏚️ ruined = short broken stubs
function kelpDraw(g, x, y, k, t, v, cols, hs, still){ g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round'; const sw = still ? 0.3 : Math.sin(ph(t, 3)) + 0.4 * Math.cos(ph(t, 3));
  [[-7, 76, 0], [2, 82, 1.3], [9, 64, 2.4], [-1, 58, 3.6]].forEach(([bx, h, p0]) => { h *= hs; g.strokeStyle = cols[1]; g.lineWidth = 2.6; g.beginPath(); g.moveTo(bx, 0);
    const pts = []; for(let i = 1; i <= 10; i++){ const f = i / 10, px = bx + Math.sin(f * 4 + p0) * 4 + sw * f * f * 6 + (still ? f * f * 10 : 0), py = -h * f + (still ? f * f * h * 0.25 : 0); pts.push([px, py, f]); g.lineTo(px, py); } g.stroke();
    pts.forEach(([px, py, f], i) => { if(i % 2) return; const s = i % 4 ? 1 : -1; g.fillStyle = cols[0]; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + s * 9, py - 2 + (still ? 5 : 0), px + s * 10, py - 8 + (still ? 10 : 0)); g.quadraticCurveTo(px + s * 4, py - 4, px, py); g.fill();
      if(i === 4 && cols[2]){ g.fillStyle = cols[2]; g.beginPath(); g.arc(px - s * 2, py + 2, 1.8, 0, TAU); g.fill(); } }); });
  g.restore(); }
CO('kelp', {name: 'Kelp', h: 82, variants: 2, tags: ['tree', 'plant'], live: {period: 3, frames: 6}, conds: {'*': (g, x, y, k, t, v, c) => c.broken ? kelpDraw(g, x, y, k, 0, v, ['#8A7A5A', '#6A5A40'], 0.28, true) : kelpDraw(g, x, y, k, 0, v, ['#A8884A', '#7A5E30', '#8A6A3A'], 0.7, true)}},
  (g, x, y, k, t, v) => kelpDraw(g, x, y, k, t, v, v % 2 ? ['#5DB84A', '#3E8A3A', '#C9A23A'] : ['#8AB83A', '#5A8A2A', '#C9A23A'], 1, false));
// 🌸 anemone: a soft tuft of waving tentacles with bright tips — 🍂 dry = pale + short · 🏚️ ruined = a closed grey blob
function anemoneDraw(g, x, y, k, v, c, L0){ g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round'; g.fillStyle = sh(c[1], -0.1); g.beginPath(); D.ell(g, 0, -2, 12, 4); g.fill();
  for(let i = 0; i < 13; i++){ const a = (i / 12 - 0.5) * 2.4, L2 = (14 + (i % 3) * 4) * L0; g.strokeStyle = c[1]; g.lineWidth = 3.2; g.beginPath(); g.moveTo(Math.sin(a) * 7, -3); g.quadraticCurveTo(Math.sin(a) * 12, -L2 * 0.6, Math.sin(a) * 14 + Math.cos(i) * 2, -L2); g.stroke(); g.fillStyle = c[0]; g.beginPath(); g.arc(Math.sin(a) * 14 + Math.cos(i) * 2, -L2, 2, 0, TAU); g.fill(); }
  g.restore(); }
CO('anemone', {name: 'Anemone', h: 26, kind: 'bush', variants: 2, tags: ['plant', 'coral'], conds: {'*': (g, x, y, k, t, v, c) => { if(!c.broken) return anemoneDraw(g, x, y, k, v, ['#EDE2DC', '#C4B4AC'], 0.6);
    g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = D.rad(g, -3, -8, 1, 12, ['#B8AEA6', '#8A8078']); g.beginPath(); g.moveTo(-11, 0); g.quadraticCurveTo(-10, -11, 0, -11); g.quadraticCurveTo(10, -11, 11, 0); g.closePath(); g.fill(); g.restore(); }}},
  (g, x, y, k, t, v) => anemoneDraw(g, x, y, k, v, v % 2 ? ['#FF8FD0', '#C8507A'] : ['#7FE8D0', '#2E9A8A'], 1));
// 🗼 pearl spire (landmark 2 × 2): a tall tower of shell whorls with round windows, crowned by a giant glowing pearl
(function(){ const def = CA('pearlspire', {name: 'Pearl spire', foot: [2, 2], h: 188, kind: 'landmark', tags: ['landmark', 'tower']});
  def.build = (B, v, L) => { const c = L.cond;
    B.drum(1, 1, 0, 0.92, 8, '#E8D2A8', {layer: -1, rings: 2});
    B.custom(1, 1, (g, P, k) => { const top = whorls(g, P, k, 1, 1, 8, [[0.8, 0.66, 34], [0.64, 0.52, 32], [0.5, 0.4, 30], [0.38, 0.28, 26], [0.26, 0.16, 22]], '#FFD8E0', LIP);
      const lv = lightOf(c); [[50, -0.4], [50, 0.35], [86, -0.2], [118, 0.15]].forEach(([z, u]) => { const q = P(1, 1, z), r = (0.8 - z / 260) * HTW * k * S2; g.fillStyle = '#F2C23A'; g.beginPath(); D.ell(g, q[0] + u * r, q[1] + 6 * k, 4.6 * k, 5.6 * k); g.fill(); g.fillStyle = lv ? '#9EE8F2' : '#4A4A55'; g.beginPath(); D.ell(g, q[0] + u * r, q[1] + 6 * k, 3 * k, 3.8 * k); g.fill(); });
      const q = [top.c1[0], top.c1[1] - 12 * k]; pearl(g, q[0], q[1], 13 * k); }, {layer: 0});
    if(lightOf(c)) halo(B, 1.08, 0.92, 152, 30, '#BFF4FF', 0.45 * lightOf(c), {dy: -12});
    const p = B.box(0.72, 1.6, 0, 0.56, 0.36, 30, LIP, {layer: 2}); B.decal(p, 'front', 0.77, 0.46, 0, 28, '#6A3A4A', {paint: archDoor('#6A3A4A', '#FFD9E0')});
  }; })();
// 🗺️ coral look: its own trees + town; plaza things + inn + smithy by swap
Object.assign(LOOKS.coral, {swap: {palm: 'kelp', jtree: 'coraltree', mango: 'coraltree', bamboo: 'kelp', banana: 'anemone', bush: 'anemone', flowers: 'anemone',
    inn: 'inn_pearl', smithy: 'smithy_vent', well: 'well_clam', stall: 'stall_reef', qboard: 'qboard_drift', lantern: 'lantern_jelly'},
  roles: {home: ['coralhouse', 'shellhouse', 'coralhouse'], tall: ['coraltree', 'kelp', 'coraltree', 'kelp'], small: ['anemone', 'rock', 'anemone', 'rock']}});
})();
K.loaded('coral', 'ip-7a');
})(window.Props && window.Props._K);
