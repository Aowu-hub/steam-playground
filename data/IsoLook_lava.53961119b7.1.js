
/* 🌍 IsoLook_lava — 🌋 lava → Ember Isles — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['lava'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/lava.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_lava: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🌋 lava · Ember Isles (ip-4a). Runs after the engine with Props._K (kit insides) + T (tools). */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, puffs, bubbles, bang, innBoard, glowAt, halo, anvil, porthole, archDoor, ports} = T;
const D = PD, M = MAT, TAU = Math.PI * 2, S2 = Math.SQRT2;
const own = (set) => (key, o) => add(set, key, Object.assign({look: set}, o));
const org = (set) => (key, o, fn) => organic(set, key, Object.assign({look: set}, o), fn);
addSet('lava', {name: 'Lava', icon: '🌋', accent: '#FF7A2E'});
/* ============================ 🌋 LAVA — Ember Isles ============================ */
addLook('lava', {name: 'Lava', walls: ['#6B6274', '#7A6E7E', '#5E5668', '#857684'], roofs: ['#E2553A', '#F28C28', '#C8322A'], trim: '#2E2630', accent: '#FF7A2E', stilts: false, ground: 'lava'}, 'jungle');
const LA = own('lava'), LO = org('lava'), EMBER = '#FF7A2E', EMBER2 = '#FFC23A', BASALT = '#5E5668';
// hex basalt columns on a face (vertical lines with little steps on top)
const columns = (n, hgt) => (g, Q, k) => { g.strokeStyle = 'rgba(30,22,34,0.45)'; g.lineWidth = 1 * k; for(let i = 1; i < n; i++){ const u = i / n, d = (i % 2) * 3; line(g, Q(u, 0), Q(u, hgt - d)); }
  g.strokeStyle = 'rgba(255,255,255,0.14)'; for(let i = 0; i < n; i++){ const u = (i + 0.5) / n; line(g, Q(u - 0.3 / n, hgt - 2 - (i % 2) * 3), Q(u + 0.3 / n, hgt - 2 - (i % 2) * 3)); } };
const glowWin = (c) => ({fill: c ? (c.broken ? '#2A1C14' : '#C98A4A') : '#FFB347'});
// 🏠 basalt house: hex-column walls · glowing windows · ember-red roof · a stone chimney with steam
(function(){ const def = LA('basalthouse', {name: 'Basalt house', foot: [2, 2], h: 98, variants: 3, door: [1, 2], tags: ['house', 'home'], live: {period: 1.6, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, wall = L.walls[v % L.walls.length], roof = L.roofs[v % L.roofs.length];
    B.box(0.06, 0.06, 0, 1.88, 1.88, 5, '#3E3644', {layer: -1});
    const b = B.box(0.18, 0.18, 5, 1.64, 1.6, 40, wall); B.decal(b, 'front', ...F(b, 'front'), 0, 40, wall, {paint: columns(9, 40)}); B.decal(b, 'right', ...F(b, 'right'), 0, 40, wall, {paint: columns(9, 40)});
    B.door(b, 'front', 0.86, 0.44, 30, {fill: '#8A4A22'}); B.win(b, 'front', 0.24, 0.36, 15, 13, glowWin(c)); B.win(b, 'front', 1.38, 0.24, 15, 13, glowWin(c)); B.win(b, 'right', 0.5, 0.5, 15, 13, glowWin(c));
    B.decal(b, 'front', ...F(b, 'front'), 36, 4, EMBER, {paint: (g, Q, k) => { if(c) return; g.strokeStyle = EMBER2; g.lineWidth = 1 * k; line(g, Q(0, 2), Q(1, 2)); }});   // a glowing ember band under the eaves
    B.roof(0.18, 0.18, 45, 1.64, 1.6, 34, roof, {ridge: v % 2 ? 'y' : 'x', ov: 0.2, stripes: 7, gable: '#4A3E52'});
    B.box(1.34, 0.36, 60, 0.3, 0.3, 32, BASALT, {trim: 7}); B.box(1.3, 0.32, 92, 0.38, 0.38, 4, '#3E3644', {layer: 1});
    B.custom(1.49, 0.51, (g, P, k, t) => { if(c && c.broken) return; const q = P(1.49, 0.51, 96); puffs(g, q[0], q[1], k, t, {period: 1.6, col: c ? 'rgba(200,196,190,0.5)' : 'rgba(255,255,255,0.75)'}); }, {layer: 6});
    B.box(0.88, 1.84, 0, 0.44, 0.2, 3, '#3E3644', {layer: 1});
  }; })();
// 🏠 obsidian dome hut: a glossy black-glass dome on a basalt ring, glowing seams, an arched entrance porch
(function(){ const def = LA('emberdome', {name: 'Obsidian dome', foot: [2, 2], h: 82, variants: 3, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const c = L.cond, seam = c ? (c.broken ? '#4A3A3A' : '#B86A3A') : [EMBER, EMBER2, '#FF5A3A'][v % 3];
    B.drum(1, 1, 0, 0.92, 10, '#4A4252', {layer: -1, rings: 2});
    B.custom(1, 1, (g, P, k) => { const d = dome(g, P, k, 1, 1, 10, 0.82, 64, '#2E2838', {hi: '#7A6E92'}); g.strokeStyle = seam; g.lineWidth = 1.4 * k; g.lineCap = 'round';
      [-0.62, -0.2, 0.25].forEach((u, i) => { g.beginPath(); g.moveTo(d.c[0] + u * d.rx, d.c[1] + Math.sqrt(1 - u * u) * d.ry * 0.9); g.quadraticCurveTo(d.c[0] + u * d.rx * 0.8 + i * 3 * k, d.c[1] - d.hh * 0.5, d.c[0] + u * d.rx * 0.3, d.c[1] - d.hh * 0.95); g.stroke(); });
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); D.ell(g, d.c[0] - d.rx * 0.38, d.c[1] - d.hh * 0.62, d.rx * 0.12, d.hh * 0.18, -0.5); g.fill(); }, {layer: 0});
    if(!c) halo(B, 1, 1, 10, 0.82 * HTW * S2 * 0.9, EMBER, 0.18, {dy: -26});
    const p = B.box(0.72, 1.46, 0, 0.56, 0.5, 36, BASALT, {layer: 2}); B.door(p, 'front', 0.78, 0.44, 28, {fill: '#8A4A22'});
    B.roof(0.72, 1.46, 36, 0.56, 0.5, 9, L.roofs[v % L.roofs.length], {ridge: 'y', ov: 0.08, layer: 2});
    B.custom(0.6, 1.9, (g, P, k) => { if(c && c.broken) return; const q = P(0.6, 1.94, 14); D.glow(g, q[0], q[1], 9 * k, EMBER2, 0.6 * lightOf(c)); g.fillStyle = c ? '#8A6A5A' : '#FFD27A'; g.beginPath(); D.ell(g, q[0], q[1], 2.4 * k, 3 * k); g.fill(); g.fillStyle = '#2E2630'; g.fillRect(q[0] - 0.7 * k, q[1] + 3 * k, 1.4 * k, 11 * k); }, {layer: 3});
  }; })();
// 🏨 hot-spring inn: two-storey basalt lodge, a wooden bath deck with a steaming turquoise pool on the right, red hip roof
(function(){ const def = LA('inn_ember', {name: 'Hot-spring inn', foot: [3, 2], door: [1, 2], h: 124, variants: 2, tags: ['house', 'big', 'rest', 'inn'], live: {period: 1.8, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, wall = L.walls[v % 2], roof = ['#C8322A', '#E2553A'][v % 2];
    B.box(0.06, 0.06, 0, 2.88, 1.88, 5, '#3E3644', {layer: -1});
    const b = B.box(0.16, 0.14, 5, 1.92, 1.5, 62, wall); B.decal(b, 'front', ...F(b, 'front'), 0, 62, wall, {paint: columns(11, 62)}); B.decal(b, 'right', ...F(b, 'right'), 0, 62, wall, {paint: columns(9, 62)});
    B.door(b, 'front', 0.88, 0.46, 30, {fill: '#8A4A22'}); [0.24, 1.46].forEach(u => B.win(b, 'front', u, 0.28, 14, 13, glowWin(c))); [0.2, 0.8, 1.4].forEach(u => B.win(b, 'front', u, 0.3, 40, 13, glowWin(c))); B.win(b, 'right', 0.5, 0.5, 40, 13, glowWin(c));
    B.box(0.12, 1.62, 32, 1.98, 0.26, 3, M.plank, {layer: 2});   // balcony
    B.custom(1.1, 1.9, (g, P, k) => { g.strokeStyle = '#7A4A26'; g.lineWidth = 1.2 * k; line(g, P(0.12, 1.88, 43), P(2.1, 1.88, 43)); for(let x = 0.12; x <= 2.11; x += 0.22) line(g, P(x, 1.88, 35), P(x, 1.88, 43)); }, {layer: 3});
    B.roof(0.16, 0.14, 67, 1.92, 1.5, 40, roof, {kind: 'hip', ov: 0.18});
    B.box(2.18, 0.5, 0, 0.74, 1.42, 8, M.plank, {layer: -1, trim: 0});   // bath deck
    B.custom(2.55, 1.2, (g, P, k, t) => { const pts = []; for(let i = 0; i < 20; i++){ const a = i / 20 * TAU; pts.push(P(2.55 + Math.cos(a) * 0.3, 1.2 + Math.sin(a) * 0.55, 8.5)); }
      polyP(g, pts); g.fillStyle = '#5E5668'; g.fill(); const m = P(2.55, 1.2, 8.5); g.save(); g.translate(m[0], m[1]); g.scale(0.8, 0.8); g.translate(-m[0], -m[1]); polyP(g, pts);
      g.fillStyle = !c ? D.lin(g, 0, m[1] - 12 * k, 0, m[1] + 12 * k, ['#7FE8E0', '#2EB8C4']) : c.broken ? '#3A3036' : '#8A9A8A'; g.fill(); g.restore();
      if(!c){ puffs(g, m[0] - 6 * k, m[1] - 2 * k, k, t, {period: 1.8, rise: 22, n: 3}); puffs(g, m[0] + 7 * k, m[1] + 2 * k, k, (t || 0) + 0.9, {period: 1.8, rise: 18, n: 2}); } }, {layer: 1});
    [[2.2, 0.52], [2.82, 0.52]].forEach(p => B.box(p[0], p[1], 8, 0.08, 0.08, 34, M.dark, {layer: 1}));
    B.roof(2.18, 0.46, 42, 0.74, 0.5, 8, '#8A4A22', {ridge: 'x', ov: 0.06, layer: 2});   // little bath canopy
    innBoard(B, 0.62, 1.96, 30, {fill: '#2E2630', ink: EMBER2, edge: EMBER, w: 30, h: 13, glow: c ? null : EMBER});
  }; })();
// ⚒️ lava forge: an open basalt shed over a glowing lava channel · a big hooded chimney · anvil + quench trough · sparks
(function(){ const def = LA('smithy_lava', {name: 'Lava forge', foot: [2, 2], door: [0.86, 2], h: 106, tags: ['shop', 'forge', 'smithy'], live: {period: 0.9, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond;
    B.box(0.04, 0.04, 0, 1.92, 1.92, 4, '#3E3644', {layer: -1});
    const back = B.box(0.12, 0.12, 4, 1.76, 0.4, 46, BASALT); B.decal(back, 'right', ...F(back, 'right'), 0, 46, BASALT, {paint: columns(3, 46)});
    const side = B.box(1.5, 0.52, 4, 0.38, 1.2, 46, BASALT); B.decal(side, 'right', ...F(side, 'right'), 0, 46, BASALT, {paint: columns(6, 46)}); B.decal(side, 'front', ...F(side, 'front'), 0, 46, BASALT, {paint: columns(2, 46)}); B.win(side, 'right', 0.95, 0.3, 18, 13, glowWin(c));
    B.box(0.12, 1.66, 4, 0.14, 0.14, 46, '#3E3644'); B.box(0.12, 0.5, 4, 0.14, 0.14, 46, '#3E3644');
    B.roof(0.06, 0.06, 50, 1.86, 1.0, 20, L.roofs[0], {ridge: 'x', ov: 0.1, stripes: 6, gable: '#4A3E52'});   // the roof covers the back half: the forge is open to the street
    B.flat(0.3, 0.66, 1.12, 0.24, EMBER, {fill: c ? (c.broken ? '#3A3036' : '#8A5A3A') : EMBER, layer: -8});   // the lava channel
    if(!c) glowAt(B, 0.86, 0.78, 4, 28, EMBER, 0.5, 1);
    B.box(0.36, 0.2, 4, 0.5, 0.36, 22, '#3E3644');   // forge hearth (under the roof)
    B.box(0.48, 0.26, 26, 0.24, 0.24, 76, '#4A4252', {layer: 3, trim: 9});   // chimney up through the roof
    if(lightOf(c)) halo(B, 0.6, 0.56, 18, 16, EMBER, 0.75 * lightOf(c));
    B.custom(0.6, 0.38, (g, P, k, t) => { const q = P(0.6, 0.56, 18);
      if(!c){ const p = (t || 0) / 0.9; for(let i = 0; i < 6; i++){ const f = (p + i / 6) % 1, a = -1.2 + i * 0.45 + Math.sin(i * 3.1) * 0.2; g.fillStyle = i % 2 ? EMBER2 : '#FFFFFF'; g.beginPath(); g.arc(q[0] + Math.cos(a) * f * 16 * k + 8 * k, q[1] - 6 * k + Math.sin(a) * f * 10 * k + f * f * 12 * k, 1 * k, 0, TAU); g.fill(); } } }, {layer: 3});
    B.custom(0.6, 0.38, (g, P, k, t) => { if(c && c.broken) return; const q = P(0.6, 0.38, 102); puffs(g, q[0], q[1], k, t, {period: 0.9, col: 'rgba(120,110,120,0.6)', rise: 16}); }, {layer: 6});
    anvil(B, 0.3, 1.36, '#3E3644'); B.box(1.0, 1.6, 0, 0.42, 0.22, 7, '#5E5668', {topFill: c ? '#6A5A50' : '#5AA0C8', layer: 1});
  }; })();
// ⛲ geyser well: a ring of basalt stones round a hot pool, a little geyser puffing steam, a wooden ladle
(function(){ const def = LA('well_geyser', {name: 'Geyser well', foot: [1, 1], h: 62, tags: ['water', 'well'], live: {period: 2.2, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond;
    B.drum(0.5, 0.5, 0, 0.42, 12, '#5E5668', {rings: 2, topFill: !c ? '#5FD8D0' : c.broken ? '#3A3036' : '#8A8A7A'});
    B.custom(0.5, 0.5, (g, P, k, t) => { const q = P(0.5, 0.5, 12), R = D.rnd(5); for(let i = 0; i < 9; i++){ const a = i / 9 * TAU, x = q[0] + Math.cos(a) * 15 * k, y = q[1] + Math.sin(a) * 7.5 * k; g.fillStyle = sh('#6B6274', (R() - 0.5) * 0.3); g.beginPath(); D.ell(g, x, y, 4 * k, 2.6 * k); g.fill(); }
      if(c) return; const s = 0.6 + 0.4 * Math.sin(ph(t, 2.2)) + 0.15 * Math.cos(ph(t, 2.2)); g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.moveTo(q[0] - 2.4 * k, q[1]); g.quadraticCurveTo(q[0] - 1 * k, q[1] - 22 * k * s, q[0], q[1] - 30 * k * s); g.quadraticCurveTo(q[0] + 1 * k, q[1] - 22 * k * s, q[0] + 2.4 * k, q[1]); g.closePath(); g.fill();
      puffs(g, q[0], q[1] - 26 * k * s, k, t, {period: 2.2, rise: 12, n: 3}); }, {layer: 1});
    B.custom(0.86, 0.8, (g, P, k) => { const a = P(0.86, 0.62, 20), b = P(0.94, 0.86, 2); g.strokeStyle = '#8A5A2B'; g.lineWidth = 1.6 * k; line(g, a, b); g.fillStyle = '#6B4222'; g.beginPath(); g.ellipse(a[0], a[1], 3.4 * k, 2.2 * k, 0.3, 0, Math.PI); g.fill(); }, {layer: 2});
  }; })();
// 🛒 ember market stall: basalt counter, a striped heat-proof awning on poles, glowing fire-crystals + chilli bunches
(function(){ const def = LA('stall_ember', {name: 'Ember stall', foot: [2, 1], door: [1, 1], h: 62, variants: 3, tags: ['shop', 'stall']});
  def.build = (B, v, L) => { const c = L.cond, can = [EMBER, '#2EC4B6', '#C8322A'][v % 3];
    [[0.12, 0.16], [1.78, 0.16], [0.12, 0.74], [1.78, 0.74]].forEach(p => B.box(p[0], p[1], 0, 0.1, 0.1, 44, '#3E3644'));
    const ct = B.box(0.22, 0.42, 0, 1.56, 0.42, 16, BASALT, {topFill: '#4A4252'}); B.decal(ct, 'front', ...F(ct, 'front'), 0, 16, BASALT, {paint: columns(8, 16)});
    B.custom(1, 0.6, (g, P, k) => { const L1 = lightOf(c); [[0.5, ['#FF9A3A', '#FFD23F']], [0.95, ['#5FE0D0', '#2EC4B6']]].forEach(([x, cols], i) => { const q = P(x, 0.62, 16);
        for(let n = 0; n < 3; n++){ const dx = (n - 1) * 4 * k, hh = (7 + n % 2 * 3) * k; g.fillStyle = c ? sh(cols[0], -0.4) : cols[n % 2]; g.beginPath(); g.moveTo(q[0] + dx - 2 * k, q[1]); g.lineTo(q[0] + dx, q[1] - hh); g.lineTo(q[0] + dx + 2 * k, q[1]); g.closePath(); g.fill(); } });
      const q = P(1.45, 0.62, 16); for(let n = 0; n < 5; n++){ g.fillStyle = c ? '#7A4A3A' : (n % 2 ? '#E2453A' : '#C8322A'); g.beginPath(); D.ell(g, q[0] + (n - 2) * 3 * k, q[1] - 2 * k - (n % 2) * 2 * k, 1.6 * k, 3.8 * k, 0.4); g.fill(); } }, {layer: 2});
    if(lightOf(c)){ halo(B, 0.5, 0.62, 16, 10, '#FF9A3A', 0.5 * lightOf(c), {dy: -5}); halo(B, 0.95, 0.62, 16, 10, '#5FE0D0', 0.5 * lightOf(c), {dy: -5}); }
    B.roof(0.06, 0.1, 44, 1.88, 0.82, 12, can, {ridge: 'x', ov: 0.1, stripes: 8, layer: 3});
  }; })();
// 📜 obsidian quest board: a black-glass slab on a basalt foot, glowing ember runes, the "!" in a flame badge
(function(){ const def = LA('qboard_ember', {name: 'Obsidian board', foot: [1, 1], h: 58, tags: ['quest', 'board']});
  def.build = (B, v, L) => { const c = L.cond;
    B.box(0.2, 0.36, 0, 0.6, 0.3, 10, BASALT, {trim: 5});
    const s = B.box(0.24, 0.44, 10, 0.52, 0.14, 40, '#2E2838', {topFill: '#4A4258'});
    if(lightOf(c)) halo(B, 0.5, 0.58, 54, 12, EMBER, 0.5 * lightOf(c));
    B.decal(s, 'front', 0.28, 0.44, 4, 30, '#2E2838', {paint: (g, Q, k) => { const L1 = lightOf(c); g.strokeStyle = L1 ? (c ? '#B86A3A' : EMBER) : '#4A3A3A'; g.lineWidth = 1.2 * k;
      for(let r = 0; r < 4; r++){ const z = 6 + r * 6; line(g, Q(0.08, z), Q(0.3 + (r % 2) * 0.2, z)); line(g, Q(0.5 + (r % 2) * 0.1, z), Q(0.85, z)); }
      g.fillStyle = 'rgba(255,255,255,0.18)'; polyP(g, [Q(0.05, 29), Q(0.25, 29), Q(0.05, 18)]); g.fill(); }});
    B.custom(0.5, 0.58, (g, P, k) => { const q = P(0.5, 0.58, 54), L1 = lightOf(c);
      g.fillStyle = L1 ? EMBER : '#6A5A5A'; g.beginPath(); g.moveTo(q[0], q[1] - 9 * k); g.quadraticCurveTo(q[0] + 7 * k, q[1] - 1 * k, q[0] + 4 * k, q[1] + 5 * k); g.quadraticCurveTo(q[0], q[1] + 7 * k, q[0] - 4 * k, q[1] + 5 * k); g.quadraticCurveTo(q[0] - 7 * k, q[1] - 1 * k, q[0], q[1] - 9 * k); g.fill();
      bang(g, q[0], q[1] + 0.5 * k, k, {size: 10, col: '#FFFFFF'}); }, {layer: 3});
  }; })();
// 🏮 magma lantern: a basalt column post with an iron cage round a glowing magma orb (pulses)
(function(){ const def = LA('lantern_magma', {name: 'Magma lantern', foot: [1, 1], h: 50, kind: 'post', block: false, tags: ['light', 'night', 'lantern'], live: {period: 1.5, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond;
    B.box(0.36, 0.36, 0, 0.28, 0.28, 4, '#3E3644'); B.box(0.41, 0.41, 4, 0.18, 0.18, 30, BASALT, {trim: 8});
    if(lightOf(c)) halo(B, 0.5, 0.5, 42, 15, EMBER, 0.6 * lightOf(c), {pulse: t => 0.85 + 0.1 * Math.sin(ph(t, 1.5)) + 0.07 * Math.cos(ph(t, 1.5))});
    B.custom(0.5, 0.5, (g, P, k, t) => { const q = P(0.5, 0.5, 42), lv = lightOf(c), f = 0.85 + 0.1 * Math.sin(ph(t, 1.5)) + 0.07 * Math.cos(ph(t, 1.5));
      g.fillStyle = lv ? D.rad(g, q[0] - 1.5 * k, q[1] - 2 * k, 0.5, 6 * k, [EMBER2, EMBER, '#C8322A']) : '#4A3A3A'; g.beginPath(); g.arc(q[0], q[1], 5.2 * k, 0, TAU); g.fill();
      g.strokeStyle = '#2E2630'; g.lineWidth = 1 * k; [-3, 0, 3].forEach(dx => { g.beginPath(); g.moveTo(q[0] + dx * k, q[1] - 7.5 * k); g.quadraticCurveTo(q[0] + dx * 2.2 * k, q[1], q[0] + dx * k, q[1] + 7 * k); g.stroke(); });
      g.fillStyle = '#2E2630'; g.fillRect(q[0] - 4 * k, q[1] - 9 * k, 8 * k, 2 * k); g.fillRect(q[0] - 4 * k, q[1] + 6.5 * k, 8 * k, 2 * k); g.beginPath(); g.moveTo(q[0] - 3 * k, q[1] - 9 * k); g.lineTo(q[0], q[1] - 12 * k); g.lineTo(q[0] + 3 * k, q[1] - 9 * k); g.fill(); }, {layer: 2});
  }; })();
// 🌳 ember tree: a dark charcoal trunk with a crown of warm red · orange · gold leaves (a fire-coloured autumn tree, not burning)
const EMB = [['#FF7A2E', '#C8322A', '#FFC23A'], ['#F2B731', '#E2553A', '#FFE58A'], ['#E2453A', '#9C1F2A', '#FF8A5A']];
LO('embertree', {name: 'Ember tree', h: 74, variants: 3, tags: ['tree']}, (g, x, y, k, t, v) => { const c = EMB[v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
  D.piece(g, [{path: g => { g.moveTo(-5, 0); g.quadraticCurveTo(-3, -18, -8, -32); g.lineTo(-4, -34); g.lineTo(0, -24); g.lineTo(5, -36); g.lineTo(8, -33); g.quadraticCurveTo(3, -18, 5, 0); g.lineTo(9, 2); g.lineTo(-9, 2); g.closePath(); }, fill: g => D.lin(g, -6, 0, 6, 0, ['#4A3E46', '#2A2228'])}], '#000', 0);
  D.piece(g, [{path: g => { [[-14, -44, 13], [13, -46, 13], [0, -58, 15], [-4, -40, 11], [9, -36, 10], [-20, -36, 8], [21, -38, 8]].forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }); }, fill: g => D.rad(g, -6, -60, 3, 44, [c[2], c[0], c[1]])}], '#000', 0);
  const R = D.rnd(11 + v); g.fillStyle = c[2]; for(let i = 0; i < 14; i++){ g.beginPath(); D.ell(g, (R() - 0.5) * 44, -34 - R() * 30, 2.2, 1.4, R() * 3); g.fill(); }
  g.fillStyle = c[0]; [[-16, -6], [14, -10]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 2.2, 1.3, 0.6); g.fill(); }); g.restore(); });
// 🌺 fire bloom: a low bush of flame-shaped flowers (warm glow at night)
LO('firebloom', {name: 'Fire bloom', h: 28, kind: 'bush', variants: 2, tags: ['plant', 'flower']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k);
  D.piece(g, [{path: g => { [[-10, -8, 9], [10, -9, 9], [0, -13, 10]].forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }); g.rect(-17, -8, 34, 8); }, fill: g => D.rad(g, -4, -18, 2, 22, ['#5A8A4A', '#3E6A36', '#2E4E2A'])}], '#000', 0);
  const R = D.rnd(23 + v), cols = v % 2 ? ['#FFC23A', '#FF7A2E'] : ['#FF5A3A', '#FFC23A']; for(let i = 0; i < 7; i++){ const fx = (R() - 0.5) * 28, fy = -6 - R() * 16; g.fillStyle = cols[i % 2]; g.beginPath(); g.moveTo(fx, fy - 6); g.quadraticCurveTo(fx + 4, fy - 1, fx + 1.6, fy + 2); g.quadraticCurveTo(fx, fy + 3, fx - 1.6, fy + 2); g.quadraticCurveTo(fx - 4, fy - 1, fx, fy - 6); g.fill(); }
  g.restore(); });
// 🪨 obsidian spikes: black-glass crystals with a purple sheen (a rock — stays a rock in every condition)
LO('obsidian', {name: 'Obsidian spikes', h: 34, kind: 'thing', variants: 2, dead: 'keep', tags: ['stone', 'crystal']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k);
  const sp = v ? [[-10, 0, 4, 20, -0.3], [2, 0, 6, 32, 0.05], [12, 0, 4, 18, 0.35], [-3, 2, 3, 12, -0.1]] : [[-8, 0, 5, 26, -0.2], [6, 0, 5, 22, 0.25], [0, 2, 3, 14, 0], [13, 1, 3, 10, 0.5]];
  sp.forEach(([sx, sy, w, h, a]) => { g.save(); g.translate(sx, sy); g.rotate(a); g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w * 0.7, -h * 0.75); g.lineTo(0, -h); g.lineTo(w * 0.7, -h * 0.75); g.lineTo(w, 0); g.closePath();
    g.fillStyle = D.lin(g, -w, 0, w, 0, ['#5A4E78', '#2A2438', '#1A1622']); g.fill(); g.fillStyle = 'rgba(200,180,255,0.35)'; g.beginPath(); g.moveTo(-w * 0.6, -h * 0.2); g.lineTo(-w * 0.45, -h * 0.72); g.lineTo(-w * 0.1, -h * 0.85); g.lineTo(-w * 0.2, -h * 0.2); g.closePath(); g.fill(); g.restore(); });
  g.restore(); });
// 🌋 friendly volcano (landmark 3 × 3): a stubby cone with green skirts, two glowing lava rivers, a warm crater and puffy smoke
(function(){ const def = LA('volcano', {name: 'Volcano', foot: [3, 3], h: 168, kind: 'landmark', tags: ['landmark', 'mountain'], live: {period: 2.4, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond;
    if(lightOf(c)) halo(B, 1.5, 1.5, 136, 0.52 * HTW * S2 * 1.6, EMBER, 0.55 * lightOf(c));
    B.custom(1.5, 1.5, (g, P, k, t, T) => { const tn = T ? T.turn : 0, RU = [[-0.45, 0.38], [-0.12, 0.6], [0.45, -0.3], [0.12, -0.62]][tn]; const f = frustum(g, P, k, 1.5, 1.5, 0, 1.42, 0.52, 136, '#6B5A62', {top: false});
      g.save(); g.beginPath(); g.ellipse(f.c0[0], f.c0[1], f.a, f.a / 2, 0, 0, Math.PI); g.lineTo(f.c1[0] - f.b, f.c1[1]); g.ellipse(f.c1[0], f.c1[1], f.b, f.b / 2, 0, Math.PI, 0, true); g.closePath(); g.clip();
      g.fillStyle = c ? (c.broken ? '#6A645A' : '#8A8A5A') : '#5DA84A'; g.beginPath(); for(let i = 0; i <= 24; i++){ const u = -1 + i / 12, x = f.c0[0] + u * f.a, y = f.c0[1] + Math.sqrt(Math.max(0, 1 - u * u)) * f.a / 2 - (30 + 12 * Math.sin(i * 1.7)) * k; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.lineTo(f.c0[0] + f.a, f.c0[1] + f.a); g.lineTo(f.c0[0] - f.a, f.c0[1] + f.a); g.closePath(); g.fill();
      const lv = lightOf(c); [[RU[0], 0.75, 0], [RU[1], 0.55, 1.3]].forEach(([u, len, w0], i) => { g.strokeStyle = lv ? (i ? EMBER2 : EMBER) : '#4A3A3A'; g.lineWidth = (5.5 - i) * k; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
        for(let n = 0; n <= 14; n++){ const f2 = n / 14 * len, uu = u * (1 + f2 * 0.25) + Math.sin(n * 0.9 + w0) * 0.05, r = f.b + (f.a - f.b) * f2, x = f.c1[0] + uu * r, y = f.c1[1] + (f.c0[1] - f.c1[1]) * f2 + Math.sqrt(Math.max(0, 1 - uu * uu)) * r / 2; n ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke(); if(lv){ g.strokeStyle = 'rgba(255,240,180,0.6)'; g.lineWidth = 1.3 * k; g.stroke(); } });
      g.restore();
      g.beginPath(); g.ellipse(f.c1[0], f.c1[1], f.b, f.b / 2, 0, 0, TAU); g.fillStyle = '#4A3E46'; g.fill(); g.beginPath(); g.ellipse(f.c1[0], f.c1[1] + 1 * k, f.b * 0.72, f.b * 0.32, 0, 0, TAU); g.fillStyle = lv ? EMBER : '#3A3036'; g.fill();
      if(!(c && c.broken)) puffs(g, f.c1[0], f.c1[1] - 6 * k, k, t, {period: 2.4, rise: 28, r: 5, n: 3, drift: 10, col: c ? 'rgba(140,130,130,0.6)' : 'rgba(255,255,255,0.82)'}); }, {layer: 0});
  }; })();
// 🗺️ lava look: its own trees + town; plaza things + inn + smithy by swap (same footprints as the village ones)
Object.assign(LOOKS.lava, {swap: {palm: 'embertree', jtree: 'embertree', mango: 'embertree', bamboo: 'obsidian', banana: 'firebloom', bush: 'firebloom', flowers: 'firebloom',
    inn: 'inn_ember', smithy: 'smithy_lava', well: 'well_geyser', stall: 'stall_ember', qboard: 'qboard_ember', lantern: 'lantern_magma'},
  roles: {home: ['basalthouse', 'emberdome', 'basalthouse'], tall: ['embertree', 'embertree', 'obsidian', 'embertree'], small: ['firebloom', 'obsidian', 'rock', 'firebloom', 'rock']}});
})();
K.loaded('lava', 'ar-1');
})(window.Props && window.Props._K);
