
/* 🌍 IsoLook_moon — 🚀 moon → Moonbase — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['moon'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/moon.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_moon: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🚀 moon · Moonbase (ip-4a). Runs after the engine with Props._K (kit insides) + T (tools). */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, puffs, bubbles, bang, innBoard, glowAt, halo, anvil, porthole, archDoor, ports} = T;
const D = PD, M = MAT, TAU = Math.PI * 2, S2 = Math.SQRT2;
const own = (set) => (key, o) => add(set, key, Object.assign({look: set}, o));
const org = (set) => (key, o, fn) => organic(set, key, Object.assign({look: set}, o), fn);
addSet('moon', {name: 'Moon', icon: '🚀', accent: '#5E8BFF'});
if(typeof Iso !== 'undefined' && Iso.addTheme){
  if(!Iso.THEMES.moon) Iso.addTheme('moon', {base: '#6E6E80', baseDark: '#4A4A5A', bg: ['#141A3A', '#3A3F78'], tile: {grass: {top: '#CFCFD8', top2: '#C2C2CC', lip: '#AEAEBA', side: '#7A7A8A', deco: 'crack'},
    flower: {top: '#D4D2DC', top2: '#C6C4D0', lip: '#AEAEBA', side: '#7A7A8A', deco: 'dot'}, path: {top: '#9A9EB0', top2: '#8E92A4', side: '#6A6E80', deco: 'pebble'}, stone: {top: '#B6BAC8', top2: '#A8ACBA', side: '#7A7E8E', deco: 'crack'}, sand: {top: '#E2E0E8', top2: '#D6D4DE', side: '#9A98A6', deco: 'dot'}}}, 'meadow');
}
/* ============================ 🚀 MOON — Moonbase (a bright, friendly colony on the moon) ============================ */
addLook('moon', {name: 'Moon', walls: ['#F2F4F8', '#E4E9F2', '#F6EEDD', '#DDE6EE'], roofs: ['#3A86FF', '#FF7A3A', '#8B5CF6'], trim: '#3A4256', accent: '#FFD23F', stilts: false, ground: 'moon'}, 'jungle');
const MA = own('moon'), MO = org('moon'), HULL = '#F2F4F8', METAL = '#9AA2B4', DARKM = '#4A5266', CYAN = '#5FE8FF';
const seams = (n, hgt) => (g, Q, k) => { g.strokeStyle = 'rgba(58,66,86,0.22)'; g.lineWidth = 0.9 * k; for(let i = 1; i < n; i++) line(g, Q(i / n, 0), Q(i / n, hgt)); g.fillStyle = 'rgba(58,66,86,0.35)'; for(let i = 0; i <= n; i++){ [3, hgt - 3].forEach(z => { const q = Q(Math.min(0.97, Math.max(0.03, i / n)), z); g.beginPath(); g.arc(q[0], q[1], 0.7 * k, 0, TAU); g.fill(); }); } };
const stripe = (col, z0, h) => (g, Q, k) => { g.fillStyle = col; polyP(g, [Q(0, z0), Q(1, z0), Q(1, z0 + h), Q(0, z0 + h)]); g.fill(); };
// ☀️ a tilted solar panel on a stick (world space): centre model point, size in tiles
function solar(g, P, k, x, y, z, w, d, lift){ const a = P(x - w / 2, y - d / 2, z + lift), b = P(x + w / 2, y - d / 2, z + lift), c2 = P(x + w / 2, y + d / 2, z), e = P(x - w / 2, y + d / 2, z), m = P(x, y, z - 6);
  g.strokeStyle = DARKM; g.lineWidth = 1.4 * k; line(g, m, [(a[0] + c2[0]) / 2, (a[1] + c2[1]) / 2]); polyP(g, [a, b, c2, e]); g.fillStyle = D.lin(g, a[0], a[1], c2[0], c2[1], ['#5A8AE8', '#2A4A9A']); g.fill();
  g.strokeStyle = 'rgba(200,220,255,0.6)'; g.lineWidth = 0.7 * k; for(let i = 1; i < 4; i++){ const f = i / 4; line(g, [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], [e[0] + (c2[0] - e[0]) * f, e[1] + (c2[1] - e[1]) * f]); } line(g, [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2], [(b[0] + c2[0]) / 2, (b[1] + c2[1]) / 2]); }
function antenna(g, P, k, x, y, z, h, on){ const a = P(x, y, z), b = [a[0], a[1] - h * k]; g.strokeStyle = DARKM; g.lineWidth = 1.2 * k; line(g, a, b); g.fillStyle = on ? '#FF4A4A' : '#6A5A5A'; g.beginPath(); g.arc(b[0], b[1], 2 * k, 0, TAU); g.fill(); }
// 🏠 moon dome: a white habitat dome with panel lines, a round airlock porch, an antenna + a solar panel
(function(){ const def = MA('moondome', {name: 'Moon dome', foot: [2, 2], h: 84, variants: 3, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const c = L.cond, band = L.roofs[v % L.roofs.length];
    B.drum(1, 1, 0, 0.9, 10, '#B6BAC8', {rings: 2, layer: -1});
    B.custom(1, 1, (g, P, k) => { const d = dome(g, P, k, 1, 1, 10, 0.8, 58, HULL, {hi: '#FFFFFF'}); g.strokeStyle = 'rgba(58,66,86,0.25)'; g.lineWidth = 0.9 * k;
      [0.33, 0.66].forEach(f => { g.beginPath(); g.ellipse(d.c[0], d.c[1] - d.hh * f, d.rx * Math.sqrt(1 - f * f), d.ry * Math.sqrt(1 - f * f), 0, 0, Math.PI); g.stroke(); }); [-0.5, 0, 0.5].forEach(u => { g.beginPath(); g.ellipse(d.c[0], d.c[1], d.rx * Math.abs(u) + 0.01, d.hh, 0, u < 0 ? Math.PI : Math.PI * 1.5, u < 0 ? Math.PI * 1.5 : TAU); g.stroke(); });
      g.strokeStyle = band; g.lineWidth = 3 * k; g.beginPath(); g.ellipse(d.c[0], d.c[1] - d.hh * 0.12, d.rx * 0.99, d.ry * 0.99, 0, 0.05, Math.PI - 0.05); g.stroke();
      const lv = lightOf(c); [[-0.45, 0.4], [0.4, 0.45]].forEach(([u, f]) => { g.fillStyle = METAL; g.beginPath(); D.ell(g, d.c[0] + u * d.rx, d.c[1] - d.hh * f, 5 * k, 4.4 * k); g.fill(); g.fillStyle = lv ? '#FFD27A' : '#4A4A55'; g.beginPath(); D.ell(g, d.c[0] + u * d.rx, d.c[1] - d.hh * f, 3.4 * k, 3 * k); g.fill(); });
      antenna(g, P, k, 1, 1, 68, 14, lv); solar(g, P, k, 1.7, 0.4, 30, 0.5, 0.36, 10); }, {layer: 0});
    const p = B.box(0.72, 1.5, 0, 0.56, 0.46, 34, HULL, {layer: 2}); B.decal(p, 'front', ...F(p, 'front'), 0, 34, HULL, {paint: stripe(band, 26, 4)});
    B.decal(p, 'front', 0.79, 0.42, 0, 26, DARKM, {paint: (g, Q, k) => { porthole(g, Q, k, 0.5, 13, 9, METAL, c ? '#3A3A44' : '#2A3A5A'); }});
    B.roof(0.72, 1.5, 34, 0.56, 0.46, 6, METAL, {kind: 'hip', ov: 0.04, layer: 2});
  }; })();
// 🏠 capsule pod: two stacked modules on landing legs, round windows, solar wings on the roof, a little ladder
(function(){ const def = MA('moonpod', {name: 'Capsule pod', foot: [2, 2], h: 96, variants: 3, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const c = L.cond, band = L.roofs[v % L.roofs.length], wall = L.walls[v % L.walls.length];
    [[0.18, 0.18], [1.68, 0.18], [0.18, 1.68], [1.68, 1.68]].forEach(p => B.box(p[0], p[1], 0, 0.14, 0.14, 10, METAL));
    const b = B.box(0.12, 0.12, 8, 1.76, 1.76, 40, wall); B.decal(b, 'front', ...F(b, 'front'), 0, 40, wall, {paint: seams(5, 40)}); B.decal(b, 'right', ...F(b, 'right'), 0, 40, wall, {paint: seams(5, 40)});
    B.decal(b, 'front', ...F(b, 'front'), 0, 40, wall, {paint: stripe(band, 30, 5)}); B.decal(b, 'right', ...F(b, 'right'), 0, 40, wall, {paint: stripe(band, 30, 5)});
    B.door(b, 'front', 0.82, 0.44, 28, {fill: DARKM}); B.decal(b, 'front', ...F(b, 'front'), 0, 40, wall, {paint: ports([[0.14, 18, 5], [0.84, 18, 5]], METAL, c)}); B.decal(b, 'right', ...F(b, 'right'), 0, 40, wall, {paint: ports([[0.3, 18, 5], [0.7, 18, 5]], METAL, c)});
    const u = B.box(0.36, 0.3, 48, 1.24, 1.2, 28, HULL, {layer: 1}); B.decal(u, 'front', ...F(u, 'front'), 0, 28, HULL, {paint: ports([[0.3, 14, 5], [0.7, 14, 5]], METAL, c)}); B.decal(u, 'right', ...F(u, 'right'), 0, 28, HULL, {paint: seams(4, 28)});
    B.box(0.42, 0.36, 76, 1.12, 1.08, 4, METAL, {layer: 1});
    B.custom(1, 1, (g, P, k) => { solar(g, P, k, 0.2, 0.9, 64, 0.34, 0.9, 6); solar(g, P, k, 1.84, 0.9, 64, 0.34, 0.9, 6); antenna(g, P, k, 1.2, 0.6, 80, 12, lightOf(c)); }, {layer: 3});
  }; })();
// 🏨 orbit hotel: a tall round tower with a glowing ring halo + a two-storey wing, portholes all round, a glowing INN panel
(function(){ const def = MA('inn_orbit', {name: 'Orbit hotel', foot: [3, 2], door: [1, 2], h: 132, variants: 2, tags: ['house', 'big', 'rest', 'inn']});
  def.build = (B, v, L) => { const c = L.cond, band = ['#3A86FF', '#8B5CF6'][v % 2];
    B.box(0.04, 0.04, 0, 2.92, 1.92, 4, '#B6BAC8', {layer: -1});
    const b = B.box(0.14, 0.4, 4, 1.7, 1.42, 58, HULL); B.decal(b, 'front', ...F(b, 'front'), 0, 58, HULL, {paint: seams(6, 58)}); B.decal(b, 'right', ...F(b, 'right'), 0, 58, HULL, {paint: seams(5, 58)});
    B.decal(b, 'front', ...F(b, 'front'), 0, 58, HULL, {paint: stripe(band, 26, 4)}); B.door(b, 'front', 0.88, 0.48, 24, {fill: DARKM});
    B.decal(b, 'front', ...F(b, 'front'), 0, 58, HULL, {paint: ports([[0.18, 12], [0.82, 12], [0.18, 42], [0.5, 42], [0.82, 42]], METAL, c)});
    B.box(0.1, 0.36, 62, 1.78, 1.5, 5, METAL, {layer: 1});
    B.drum(2.3, 0.9, 4, 0.56, 98, HULL, {rings: 7});
    B.custom(2.3, 0.9, (g, P, k) => { const q = P(2.3, 0.9, 4), r = 0.56 * HTW * k * S2, lv = lightOf(c); for(let n = 0; n < 6; n++){ const z = 18 + n * 14; [-0.5, 0.3].forEach(u => { const x = q[0] + u * r, y = q[1] - z * k + Math.sqrt(1 - u * u) * r * 0.5; g.fillStyle = METAL; g.beginPath(); D.ell(g, x, y, 3.6 * k, 3.6 * k); g.fill(); g.fillStyle = lv ? '#FFD27A' : '#4A4A55'; g.beginPath(); D.ell(g, x, y, 2.4 * k, 2.4 * k); g.fill(); }); }
      const t2 = P(2.3, 0.9, 102); dome(g, P, k, 2.3, 0.9, 102, 0.56, 20, band, {hi: '#FFFFFF'}); antenna(g, P, k, 2.3, 0.9, 122, 8, lv);
      g.strokeStyle = lv ? CYAN : '#6A6A7A'; g.lineWidth = 2.6 * k; g.beginPath(); g.ellipse(t2[0], t2[1] + 2 * k, r * 1.45, r * 0.55, 0, 0, Math.PI); g.stroke(); }, {layer: 2});
    B.custom(2.3, 0.9, (g, P, k) => { const lv = lightOf(c), t2 = P(2.3, 0.9, 102), r = 0.56 * HTW * k * S2; g.strokeStyle = lv ? CYAN : '#6A6A7A'; g.lineWidth = 2.6 * k; g.beginPath(); g.ellipse(t2[0], t2[1] + 2 * k, r * 1.45, r * 0.55, 0, Math.PI, TAU); g.stroke(); }, {layer: 1});
    innBoard(B, 0.62, 1.82, 34, {shape: 'panel', fill: '#2A3256', ink: CYAN, edge: CYAN, w: 32, h: 13, glow: c ? null : CYAN});
  }; })();
// ⚒️ robo workshop: a metal hangar with a glowing open garage door, a robot arm welding on the roof, sparks, a vent stack
(function(){ const def = MA('smithy_robo', {name: 'Robo workshop', foot: [2, 2], door: [0.86, 2], h: 100, tags: ['shop', 'forge', 'smithy'], live: {period: 0.8, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond;
    B.box(0.04, 0.04, 0, 1.92, 1.92, 4, '#B6BAC8', {layer: -1});
    const b = B.box(0.12, 0.12, 4, 1.76, 1.6, 46, '#E4E9F2'); B.decal(b, 'right', ...F(b, 'right'), 0, 46, HULL, {paint: seams(5, 46)}); B.decal(b, 'front', ...F(b, 'front'), 0, 46, HULL, {paint: stripe('#FFD23F', 38, 5)});
    B.decal(b, 'front', 0.2, 0.92, 0, 34, DARKM, {paint: (g, Q, k) => { const lv = lightOf(c); g.fillStyle = lv ? D.lin(g, 0, Q(0, 34)[1], 0, Q(0, 0)[1], ['#3A2A4A', '#FF9A3A']) : '#2A2A30'; polyP(g, [Q(0, 0), Q(1, 0), Q(1, 34), Q(0, 34)]); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1 * k; for(let z = 28; z < 34; z += 2) line(g, Q(0, z), Q(1, z)); }});
    B.decal(b, 'right', 0.8, 0.5, 18, 14, CYAN, {paint: (g, Q, k) => { g.fillStyle = lightOf(c) ? '#2A3256' : '#3A3A44'; polyP(g, [Q(0, 0), Q(1, 0), Q(1, 14), Q(0, 14)]); g.fill(); g.strokeStyle = lightOf(c) ? CYAN : '#6A6A7A'; g.lineWidth = 1 * k; for(let r = 0; r < 3; r++) line(g, Q(0.15, 3 + r * 4), Q(0.5 + (r % 2) * 0.3, 3 + r * 4)); }});
    B.box(0.08, 0.08, 50, 1.84, 1.68, 6, METAL, {layer: 1});
    B.drum(1.6, 0.4, 56, 0.14, 30, METAL, {rings: 3, layer: 2});
    if(lightOf(c)) halo(B, 0.66, 1.72, 10, 20, '#FF9A3A', 0.6 * lightOf(c));
    B.custom(0.7, 0.9, (g, P, k, t) => { const base = P(0.7, 0.9, 56), lv = lightOf(c), sw = c ? 0 : Math.sin(ph(t, 0.8)) * 0.15 + Math.cos(ph(t, 0.8)) * 0.05;
      g.fillStyle = '#FFD23F'; g.beginPath(); D.ell(g, base[0], base[1], 7 * k, 3.5 * k); g.fill(); const j1 = [base[0] + 4 * k, base[1] - 16 * k], j2 = [j1[0] + Math.cos(0.3 + sw) * 16 * k, j1[1] + Math.sin(0.3 + sw) * 10 * k];
      g.strokeStyle = '#FFD23F'; g.lineCap = 'round'; g.lineWidth = 4 * k; line(g, base, j1); line(g, j1, j2); g.fillStyle = DARKM; [base, j1].forEach(q => { g.beginPath(); g.arc(q[0], q[1], 2.4 * k, 0, TAU); g.fill(); });
      g.strokeStyle = DARKM; g.lineWidth = 1.6 * k; line(g, j2, [j2[0] + 3 * k, j2[1] + 4 * k]);
      if(lv && !c){ for(let i = 0; i < 6; i++){ const a = -2.4 + i * 0.5, f = ((t || 0) / 0.8 + i / 6) % 1; g.fillStyle = i % 2 ? '#FFFFFF' : '#FFD23F'; g.beginPath(); g.arc(j2[0] + 3 * k + Math.cos(a) * f * 10 * k, j2[1] + 4 * k + Math.sin(a) * f * 6 * k + f * f * 8 * k, 0.9 * k, 0, TAU); g.fill(); } } }, {layer: 3});
    B.box(1.2, 1.74, 0, 0.5, 0.2, 10, METAL, {layer: 1}); B.box(0.3, 1.7, 0, 0.26, 0.2, 14, '#FF7A3A', {layer: 1});
  }; })();
// ⛲ ice extractor: a little drill derrick over a glass tank of blue ice water, a pipe + a tap
(function(){ const def = MA('well_ice', {name: 'Ice extractor', foot: [1, 1], h: 66, tags: ['water', 'well'], live: {period: 2, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond;
    B.box(0.12, 0.12, 0, 0.76, 0.76, 5, METAL);
    B.custom(0.5, 0.5, (g, P, k, t) => { const q = P(0.5, 0.5, 5), r = 0.3 * HTW * k * S2, h = 24 * k, lv = lightOf(c);
      g.fillStyle = lv ? 'rgba(120,210,255,0.85)' : 'rgba(110,120,130,0.8)'; g.beginPath(); g.ellipse(q[0], q[1], r, r / 2, 0, 0, Math.PI); g.lineTo(q[0] - r, q[1] - h); g.ellipse(q[0], q[1] - h, r, r / 2, 0, Math.PI, 0, true); g.closePath(); g.fill();
      g.fillStyle = lv ? '#E8FAFF' : '#9AA0A8'; [[-4, 6], [3, 10], [-1, 15]].forEach(([dx, dz]) => { g.beginPath(); g.moveTo(q[0] + dx * k - 3 * k, q[1] - dz * k); g.lineTo(q[0] + dx * k, q[1] - dz * k - 4 * k); g.lineTo(q[0] + dx * k + 3 * k, q[1] - dz * k); g.lineTo(q[0] + dx * k, q[1] - dz * k + 2 * k); g.closePath(); g.fill(); });
      if(!c){ const p2 = ((t || 0) / 2) % 1; g.fillStyle = 'rgba(255,255,255,0.8)'; for(let i = 0; i < 3; i++){ const f = (p2 + i / 3) % 1; g.beginPath(); g.arc(q[0] + (i - 1) * 4 * k, q[1] - f * h, 1.2 * k, 0, TAU); g.fill(); } }
      g.strokeStyle = DARKM; g.lineWidth = 1.4 * k; g.beginPath(); g.ellipse(q[0], q[1] - h, r, r / 2, 0, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(q[0], q[1], r, r / 2, 0, 0, Math.PI); g.stroke();
      const top = [q[0], q[1] - 56 * k]; g.strokeStyle = '#FF7A3A'; g.lineWidth = 2 * k; line(g, [q[0] - r * 0.9, q[1] - h], top); line(g, [q[0] + r * 0.9, q[1] - h], top); g.lineWidth = 1 * k; for(let i = 1; i < 4; i++){ const f = i / 4; line(g, [q[0] - r * 0.9 * (1 - f), q[1] - h - (56 * k - h) * f], [q[0] + r * 0.9 * (1 - f), q[1] - h - (56 * k - h) * f]); }
      g.strokeStyle = METAL; g.lineWidth = 2.4 * k; line(g, top, [q[0], q[1] - h - 2 * k]); g.fillStyle = '#FFD23F'; g.beginPath(); g.arc(top[0], top[1], 2.4 * k, 0, TAU); g.fill(); }, {layer: 1});
    if(lightOf(c)) halo(B, 0.5, 0.5, 5, 14, CYAN, 0.4 * lightOf(c), {dy: -12});
  }; })();
// 🛒 space kiosk: a metal counter under a round dome canopy on one mast — star cookies, snack tubes, a glowing menu screen
(function(){ const def = MA('stall_space', {name: 'Space kiosk', foot: [2, 1], door: [1, 1], h: 64, variants: 3, tags: ['shop', 'stall']});
  def.build = (B, v, L) => { const c = L.cond, can = ['#3A86FF', '#FF7A3A', '#8B5CF6'][v % 3];
    const ct = B.box(0.18, 0.38, 0, 1.64, 0.46, 18, HULL, {topFill: '#DDE6EE'}); B.decal(ct, 'front', ...F(ct, 'front'), 0, 18, HULL, {paint: stripe(can, 12, 3)});
    B.box(0.94, 0.22, 18, 0.12, 0.12, 30, METAL);
    B.custom(1, 0.6, (g, P, k) => { const q1 = P(0.5, 0.6, 18), q3 = P(1.45, 0.6, 18), lv = lightOf(c);
      [[-4, '#FFD23F'], [1, '#FF8FB0'], [6, '#7FE8FF']].forEach(([dx, col]) => { g.fillStyle = c ? sh(col, -0.35) : col; g.beginPath(); D.star(g, q1[0] + dx * k, q1[1] - 3 * k, 3 * k, 1.4 * k, 5); g.fill(); });
      [['#FF7A3A', -3], ['#5FE8A0', 0], ['#3A86FF', 3]].forEach(([col, dx]) => { g.fillStyle = c ? sh(col, -0.35) : col; g.beginPath(); D.rr(g, q3[0] + dx * k - 1.2 * k, q3[1] - 9 * k, 2.4 * k, 9 * k, 1.2 * k); g.fill(); });
      const s2 = P(0.96, 0.24, 36); g.fillStyle = '#2A3256'; g.beginPath(); D.rr(g, s2[0] - 9 * k, s2[1] - 6 * k, 18 * k, 11 * k, 2 * k); g.fill(); g.fillStyle = lv ? CYAN : '#5A5A66'; for(let r = 0; r < 3; r++) g.fillRect(s2[0] - 6 * k, s2[1] - 3.5 * k + r * 3 * k, (8 + (r % 2) * 4) * k, 1.4 * k); }, {layer: 2});
    B.custom(1, 0.5, (g, P, k) => { dome(g, P, k, 1, 0.5, 48, 0.86, 16, c ? sh(can, -0.3) : can, {hi: '#FFFFFF'}); const q = P(1, 0.5, 48), r = 0.86 * HTW * k * S2; g.fillStyle = METAL; g.beginPath(); g.ellipse(q[0], q[1], r, r / 2, 0, 0, Math.PI); g.lineTo(q[0] - r, q[1]); g.ellipse(q[0], q[1] - 3 * k, r, r / 2, 0, Math.PI, 0, true); g.fill(); }, {layer: 3});
  }; })();
// 📜 holo board: a metal stand projecting a see-through cyan screen of notes, the "!" in a glowing ring
(function(){ const def = MA('qboard_holo', {name: 'Holo board', foot: [1, 1], h: 58, tags: ['quest', 'board']});
  def.build = (B, v, L) => { const c = L.cond;
    B.box(0.26, 0.4, 0, 0.48, 0.24, 8, DARKM); B.box(0.44, 0.46, 8, 0.12, 0.12, 14, METAL);
    B.custom(0.5, 0.52, (g, P, k) => { const lv = lightOf(c), a = P(0.16, 0.52, 22), b2 = P(0.84, 0.52, 22), a2 = P(0.16, 0.52, 50), b3 = P(0.84, 0.52, 50); polyP(g, [a, b2, b3, a2]);
      g.fillStyle = lv ? 'rgba(95,232,255,' + (0.3 + 0.25 * lv) + ')' : 'rgba(90,90,100,0.4)'; g.fill(); g.strokeStyle = lv ? CYAN : '#6A6A7A'; g.lineWidth = 1.2 * k; g.stroke();
      const Qp = (u, z) => P(0.16 + 0.68 * u, 0.52, 22 + z); g.strokeStyle = lv ? 'rgba(255,255,255,0.75)' : '#8A8A96'; g.lineWidth = 1 * k; for(let r = 0; r < 4; r++) line(g, Qp(0.08, 6 + r * 5), Qp(0.4 + (r % 2) * 0.12, 6 + r * 5));
      const q = Qp(0.75, 15); g.strokeStyle = lv ? '#FFD23F' : '#7A7A6A'; g.lineWidth = 1.6 * k; g.beginPath(); g.arc(q[0], q[1], 6 * k, 0, TAU); g.stroke(); bang(g, q[0], q[1] + 0.5 * k, k, {size: 10, col: lv ? '#FFD23F' : '#9A9A8A'}); }, {layer: 2});
    if(lightOf(c)) halo(B, 0.5, 0.52, 36, 18, CYAN, 0.35 * lightOf(c));
  }; })();
// 🏮 beacon mast: a thin lattice mast with a small solar panel and a blinking light on top
(function(){ const def = MA('lantern_beacon', {name: 'Beacon mast', foot: [1, 1], h: 50, kind: 'post', block: false, variants: 2, tags: ['light', 'night', 'lantern'], live: {period: 1.2, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, col = ['#FF4A4A', '#5FE8FF'][v % 2];
    B.box(0.38, 0.38, 0, 0.24, 0.24, 4, DARKM);
    B.custom(0.5, 0.5, (g, P, k, t) => { const a = P(0.5, 0.5, 4), top = [a[0], a[1] - 40 * k]; g.strokeStyle = METAL; g.lineWidth = 1.4 * k; line(g, [a[0] - 3 * k, a[1]], [top[0] - 1 * k, top[1]]); line(g, [a[0] + 3 * k, a[1]], [top[0] + 1 * k, top[1]]); g.lineWidth = 0.8 * k;
      for(let i = 0; i < 6; i++){ const y0 = a[1] - i * 6.6 * k, w0 = 3 - i * 0.33; line(g, [a[0] - w0 * k, y0], [a[0] + (w0 - 0.3) * k, y0 - 6.6 * k]); }
      const on = lightOf(c) * (0.55 + 0.3 * Math.sin(ph(t, 1.2)) + 0.15 * Math.cos(ph(t, 1.2))); g.fillStyle = DARKM; g.fillRect(top[0] - 3 * k, top[1] - 1 * k, 6 * k, 2.4 * k);
      g.fillStyle = on > 0.2 ? sh(col, (on - 0.55) * 0.8) : sh(col, -0.5); g.beginPath(); g.arc(top[0], top[1] - 3.4 * k, (2.6 + on * 0.8) * k, Math.PI, 0); g.fill(); if(on > 0.2){ g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(top[0] - 1 * k, top[1] - 4.4 * k, 0.9 * k, 0, TAU); g.fill(); }
      solar(g, P, k, 0.62, 0.5, 26, 0.24, 0.2, 5); }, {layer: 2});
    if(lightOf(c)) halo(B, 0.5, 0.5, 47, 14, col, 0.55 * lightOf(c), {pulse: t => 0.6 + 0.3 * Math.sin(ph(t, 1.2)) + 0.15 * Math.cos(ph(t, 1.2))});
  }; })();
// 🪨 moon rock: a grey boulder with little craters (stays a rock in every condition)
MO('moonrock', {name: 'Moon rock', h: 24, kind: 'deco', variants: 3, dead: 'keep', tags: ['stone']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k); const w = [16, 12, 19][v % 3], h = [16, 12, 13][v % 3];
  g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * 1.05, -h * 0.9, -w * 0.2, -h); g.quadraticCurveTo(w * 0.7, -h * 1.05, w, -h * 0.25); g.quadraticCurveTo(w * 1.05, 0, w * 0.8, 1); g.closePath(); g.fillStyle = D.lin(g, -w, -h, w, 0, ['#E4E4EC', '#AEAEBA', '#7E7E8E']); g.fill();
  [[-0.4, -0.55, 3], [0.3, -0.45, 2.4], [0.1, -0.2, 1.8]].forEach(([u, f, r]) => { g.fillStyle = 'rgba(80,80,96,0.35)'; g.beginPath(); D.ell(g, u * w, f * h, r, r * 0.7); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 0.7; g.beginPath(); g.ellipse(u * w, f * h, r, r * 0.7, 0, 0.2, Math.PI - 0.2); g.stroke(); });
  g.restore(); });
// 💎 crystal tree: a tall cluster of glowing crystals (the moon's "trees")
const CRY = [['#C9A8FF', '#8B5CF6', '#F0E4FF'], ['#9EF2FF', '#2EB8D8', '#E8FCFF'], ['#FFB8E8', '#E25AB0', '#FFE8F6']];
MO('crystaltree', {name: 'Crystal tree', h: 70, variants: 3, dead: 'keep', tags: ['tree', 'crystal']}, (g, x, y, k, t, v) => { const c = CRY[v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
  [[-11, 30, 6, -0.28], [9, 40, 6, 0.24], [0, 64, 8, 0.02], [-4, 22, 5, -0.6], [14, 20, 4, 0.6]].forEach(([sx, h, w, a]) => { g.save(); g.translate(sx, 0); g.rotate(a); g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w, -h * 0.78); g.lineTo(0, -h); g.lineTo(w, -h * 0.78); g.lineTo(w, 0); g.closePath();
    g.fillStyle = D.lin(g, -w, 0, w, 0, [c[2], c[0], c[1]]); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.moveTo(-w * 0.6, -h * 0.05); g.lineTo(-w * 0.6, -h * 0.74); g.lineTo(-w * 0.1, -h * 0.9); g.lineTo(-w * 0.1, -h * 0.05); g.closePath(); g.fill(); g.restore(); });
  g.fillStyle = '#9A98A6'; g.beginPath(); D.ell(g, 0, 0, 16, 4); g.fill(); g.restore(); });
// 🌱 moon garden: a little glass greenhouse dome full of green sprouts on a metal ring
(function(){ const def = MA('moongarden', {name: 'Moon garden', foot: [1, 1], h: 46, tags: ['plant', 'garden']});
  def.build = (B, v, L) => { const c = L.cond;
    B.drum(0.5, 0.5, 0, 0.42, 6, METAL);
    B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 6), R = D.rnd(5); for(let i = 0; i < 9; i++){ const x = q[0] + (R() - 0.5) * 24 * k, y = q[1] + (R() - 0.5) * 6 * k, h = (6 + R() * 12) * k; g.strokeStyle = c ? '#9A8048' : '#3FA34D'; g.lineWidth = 1.6 * k; line(g, [x, y], [x, y - h]); g.fillStyle = c ? '#A86A3A' : (i % 3 ? '#5DD86A' : '#FF8FB0'); g.beginPath(); D.ell(g, x, y - h, 3 * k, 2 * k); g.fill(); }
      g.save(); g.globalAlpha = c && c.broken ? 0.75 : 0.42; dome(g, P, k, 0.5, 0.5, 6, 0.4, 34, '#BFF0FF', {hi: '#FFFFFF'}); g.restore(); }, {layer: 1});
    B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 6), r = 0.4 * HTW * k * S2; g.strokeStyle = 'rgba(58,66,86,0.35)'; g.lineWidth = 0.9 * k; g.beginPath(); g.ellipse(q[0], q[1], r * 0.5, 34 * k, 0, Math.PI, TAU); g.stroke(); g.beginPath(); g.ellipse(q[0], q[1], r, 34 * k, 0, Math.PI, TAU); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); D.ell(g, q[0] - r * 0.45, q[1] - 22 * k, 2 * k, 5 * k, 0.3); g.fill(); }, {layer: 2});
  }; })();
// 🚀 rocket (landmark 2 × 2): a launch pad, a white rocket with a red nose + fins + a porthole, a service tower with blinking lights
(function(){ const def = MA('rocket', {name: 'Rocket', foot: [2, 2], h: 192, kind: 'landmark', tags: ['landmark', 'tower'], live: {period: 1.4, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond;
    B.box(0.06, 0.06, 0, 1.88, 1.88, 8, '#8E92A4', {layer: -1, topFill: '#B6BAC8'});
    B.box(1.62, 0.12, 8, 0.24, 0.24, 150, '#FF7A3A', {trim: 15});
    B.custom(1.1, 1.1, (g, P, k, t) => { const q = P(1.1, 1.1, 8), r = 0.36 * HTW * k * S2, H = 120 * k, lv = lightOf(c);
      [[-1, 0.35], [1, 0.35], [0, 1]].forEach(([s, f]) => { g.fillStyle = s ? '#D83A34' : '#B8321F'; g.beginPath(); g.moveTo(q[0] + s * r * 0.9, q[1] - 34 * k + f * 6 * k); g.lineTo(q[0] + s * r * 1.9, q[1] + f * 4 * k); g.lineTo(q[0] + s * r * 0.95, q[1] - 4 * k + f * 6 * k); g.closePath(); g.fill(); });
      g.beginPath(); g.ellipse(q[0], q[1], r, r / 2, 0, 0, Math.PI); g.lineTo(q[0] - r, q[1] - H); g.ellipse(q[0], q[1] - H, r, r / 2, 0, Math.PI, 0, true); g.closePath(); g.fillStyle = D.lin(g, q[0] - r, 0, q[0] + r, 0, ['#FFFFFF', '#E4E9F2', '#B6BAC8']); g.fill();
      [[30, 6, '#D83A34'], [92, 4, '#3A86FF']].forEach(([z, h2, col]) => { g.fillStyle = col; g.beginPath(); g.ellipse(q[0], q[1] - z * k, r, r / 2, 0, 0, Math.PI); g.lineTo(q[0] - r, q[1] - (z + h2) * k); g.ellipse(q[0], q[1] - (z + h2) * k, r, r / 2, 0, Math.PI, 0, true); g.closePath(); g.fill(); });
      const nose = [q[0], q[1] - H - 44 * k]; g.fillStyle = D.lin(g, q[0] - r, 0, q[0] + r, 0, ['#FF6A5A', '#D83A34', '#9C1F2A']); g.beginPath(); g.moveTo(q[0] - r, q[1] - H); g.ellipse(q[0], q[1] - H, r, r / 2, 0, Math.PI, 0, true); g.quadraticCurveTo(q[0] + r * 0.9, nose[1] + 16 * k, nose[0], nose[1]); g.quadraticCurveTo(q[0] - r * 0.9, nose[1] + 16 * k, q[0] - r, q[1] - H); g.fill();
      g.fillStyle = METAL; g.beginPath(); D.ell(g, q[0] - r * 0.2, q[1] - 70 * k, 7 * k, 7 * k); g.fill(); g.fillStyle = lv ? '#9EE8F2' : '#4A4A55'; g.beginPath(); D.ell(g, q[0] - r * 0.2, q[1] - 70 * k, 5 * k, 5 * k); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(q[0] - r * 0.7, q[1] - H + 6 * k, 2.4 * k, H - 40 * k);
      const tw = P(1.74, 0.24, 160), on = lv && Math.sin(ph(t, 1.4)) + 0.3 * Math.cos(ph(t, 1.4)) > 0; g.fillStyle = on ? '#FF4A4A' : '#6A3A3A'; g.beginPath(); g.arc(tw[0], tw[1], 2.6 * k, 0, TAU); g.fill(); }, {layer: 1});
    B.custom(1.1, 1.6, (g, P, k, t) => { if(c) return; const q = P(1.1, 1.1, 8), r = 0.36 * HTW * k * S2; puffs(g, q[0] - r * 1.6, q[1] + 2 * k, k, t, {period: 1.4, rise: 10, drift: -6, n: 3, r: 3}); puffs(g, q[0] + r * 1.6, q[1] + 4 * k, k, (t || 0) + 0.7, {period: 1.4, rise: 10, drift: 6, n: 3, r: 3}); }, {layer: 3});   // the pad vents a little steam (live)
    B.box(1.3, 0.2, 96, 0.34, 0.12, 3, '#FF7A3A', {layer: 2});
  }; })();
// 🗺️ moon look: its own trees (crystals) + town; plaza things + inn + smithy by swap
Object.assign(LOOKS.moon, {swap: {palm: 'crystaltree', jtree: 'crystaltree', mango: 'crystaltree', bamboo: 'crystaltree', banana: 'moongarden', bush: 'moonrock', flowers: 'moonrock', log: 'moonrock', rock: 'moonrock',
    inn: 'inn_orbit', smithy: 'smithy_robo', well: 'well_ice', stall: 'stall_space', qboard: 'qboard_holo', lantern: 'lantern_beacon'},
  roles: {home: ['moondome', 'moonpod', 'moondome'], tall: ['crystaltree', 'crystaltree', 'moongarden'], small: ['moonrock', 'moonrock', 'moongarden', 'moonrock']}});
/*@@CASTLE@@*/
})();
K.loaded('moon', 'ip-5');
})(window.Props && window.Props._K);
