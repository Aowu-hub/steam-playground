
/* 🌍 IsoLook_farm — 🌾 farm → American countryside (+ 🏰 TD-Stories farm asks) — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['farm'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/farm.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_farm: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🌾 farm → American countryside (+ the 🏰 TD-Stories farm asks) (ip-4a split from the ip-3 files 22–27; each part below is the old file's own IIFE).
   Built into IsoLook_farm.html by build_isoprops.py; runs after the engine with Props._K (kit insides). */
/* 🌾 IsoProps — farm set (ip-3, 🌳 IsoProps chat, 2026-11-17) for 🏰 TD-Stories book 2 "Farmer Delusion" (mushroom-tree maze, hay walls,
   corn maze, pig pen, bee hives, sunflowers, rain barrels, ponds) and any farm map. Same 14 rules. Home look = 'farm' (cream walls, red / slate roofs). */
(function(){   // 🌾 farm set
'use strict';
const D = PD, M = MAT, TAU = Math.PI * 2;
const piece = (g, parts) => D.piece(g, parts, '#000', 0);
const line = (g, a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
const vis = (T, nx, ny) => sideOf(T.nrm(nx, ny));
addSet('farm', {name: 'Farm', icon: '🌾', accent: '#F2B731'});
addLook('farm', {name: 'Farm', walls: ['#F4EFE4', '#EED9B4', '#DCE6EE', '#F2DCC2'], roofs: ['#B8321F', '#5A6E8C', '#3E5A4A'], trim: '#5A3418', accent: '#F2B731', stilts: false}, 'jungle');
const FA = (key, o) => add('farm', key, Object.assign({look: 'farm'}, o)), FO = (key, o, fn) => organic('farm', key, Object.assign({look: 'farm'}, o), fn);

// 🏡 farmhouse: two floors, clapboard lines, a porch with posts, chimney
(function(){ const def = FA('farmhouse', {name: 'Farmhouse', foot: [2, 2], h: 98, variants: 4, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const wall = L.walls[v % L.walls.length], roof = L.roofs[v % L.roofs.length];
    B.box(0.12, 0.1, 0, 1.76, 1.4, 4, M.stone);
    const b = B.box(0.18, 0.15, 4, 1.64, 1.3, 50, wall, {trim: 5});
    B.door(b, 'front', 0.82, 0.36, 28, {fill: L.trim}); B.win(b, 'front', 0.36, 0.28, 12, 13); B.win(b, 'front', 1.4, 0.28, 12, 13); B.win(b, 'front', 0.36, 0.28, 34, 11); B.win(b, 'front', 1.4, 0.28, 34, 11);
    B.win(b, 'right', 0.4, 0.3, 12, 13); B.win(b, 'right', 0.9, 0.3, 34, 11);
    B.box(0.2, 1.45, 0, 1.6, 0.46, 5, M.plank);
    [[0.22, 1.78], [1.66, 1.78]].forEach(p => B.box(p[0], p[1], 5, 0.1, 0.1, 22, M.white, {layer: 1}));
    B.roof(0.2, 1.45, 27, 1.6, 0.46, 6, roof, {ov: 0.06, kind: 'hip', layer: 1});
    B.box(1.3, 0.3, 40, 0.28, 0.28, 52, '#B8644A', {layer: 1, dz: -3});
    B.roof(0.18, 0.15, 54, 1.64, 1.3, 36, roof, {ov: 0.2, stripes: 7, ridge: v % 2 ? 'y' : 'x'});
  }; })();
// 🐄 red barn: big doors with the white X on the gable end, hay loft door above
(function(){ const def = FA('barn', {name: 'Barn', foot: [2, 3], h: 116, variants: 2, door: [1, 3], tags: ['farm', 'animals', 'big']});
  const X = (g, Q, k, w, h) => { g.strokeStyle = '#FFFFFF'; g.lineWidth = 2.2 * k; line(g, Q(0.04, 1), Q(0.96, h - 1)); line(g, Q(0.04, h - 1), Q(0.96, 1)); line(g, Q(0.5, 1), Q(0.5, h - 1)); g.lineWidth = 2.6 * k; g.beginPath(); [Q(0, 0), Q(1, 0), Q(1, h), Q(0, h)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.stroke(); };
  def.build = (B, v, L) => { const red = ['#C8322A', '#5A6E8C'][v % 2], roof = ['#4A4A52', '#7A4A3A'][v % 2];
    B.box(0.06, 0.06, 0, 1.88, 2.88, 4, M.stone);
    const b = B.box(0.1, 0.1, 4, 1.8, 2.8, 50, red);
    B.decal(b, 'front', 0.52, 0.96, 0, 36, sh(red, -0.12), {paint: (g, Q, k) => X(g, Q, k, 1, 36)});
    B.decal(b, 'right', 0.5, 0.5, 14, 16, sh(red, -0.12), {paint: (g, Q, k) => X(g, Q, k, 1, 16)}); B.decal(b, 'right', 1.9, 0.5, 14, 16, sh(red, -0.12), {paint: (g, Q, k) => X(g, Q, k, 1, 16)});
    B.roof(0.1, 0.1, 54, 1.8, 2.8, 50, roof, {ridge: 'y', ov: 0.16, gable: red, stripes: 8});
    B.custom(1, 3, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; const y = 3.07, q = (x, z) => P(x, y, z); g.fillStyle = '#5A3418'; g.beginPath(); [q(0.78, 62), q(1.22, 62), q(1.22, 82), q(0.78, 82)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 2 * k; g.stroke(); line(g, q(0.78, 62), q(1.22, 82)); line(g, q(0.78, 82), q(1.22, 62)); g.fillStyle = '#E3BE6A'; g.beginPath(); D.ell(g, q(1, 64)[0], q(1, 64)[1], 5 * k, 2 * k); g.fill(); }, {layer: 3});
  }; })();
(function(){ const def = FA('silo', {name: 'Silo', foot: [1, 1], h: 124, tags: ['farm', 'tower']});
  def.build = (B) => { B.drum(0.5, 0.5, 0, 0.42, 94, '#C8CCD2', {rings: 9, top: false});
    B.custom(0.5, 0.5, (g, P, k, t, T) => { const c = P(0.5, 0.5, 94), rx = 0.42 * HTW * k * Math.SQRT2, hh = 18 * k, C = lit('#9EA6B0');
      g.beginPath(); g.moveTo(c[0] + rx, c[1]); g.ellipse(c[0], c[1], rx, rx / 2, 0, 0, Math.PI, false); g.ellipse(c[0], c[1], rx, hh, 0, Math.PI, TAU, false); g.closePath(); g.fillStyle = D.rad(g, c[0] - rx * 0.3, c[1] - hh * 0.7, 1, rx * 1.4, [[0, C.top], [0.5, C.L], [1, C.R]]); g.fill();
      const b = P(0.5, 0.5, 0); g.strokeStyle = '#6A6E76'; g.lineWidth = 1.2 * k; const lx = b[0] - rx * 0.35; for(const dx of [0, 5 * k]) line(g, [lx + dx, b[1] + rx * 0.45], [lx + dx, c[1] + rx * 0.4]); for(let z = 6; z < 92; z += 6){ const yy = b[1] + rx * 0.45 - z * k; line(g, [lx, yy], [lx + 5 * k, yy]); }
      g.fillStyle = '#6A6E76'; g.beginPath(); D.ell(g, c[0], c[1] - hh - 2 * k, 2.4 * k, 2 * k); g.fill(); }, {layer: 1});
  }; })();
(function(){ const def = FA('coop', {name: 'Chicken coop', foot: [1, 1], h: 46, kind: 'thing', variants: 2, door: [0.5, 1], tags: ['farm', 'animals']});
  def.build = (B, v) => { const c = ['#E2553A', '#E2B07A'][v % 2];
    [[0.18, 0.18], [0.72, 0.18], [0.18, 0.72], [0.72, 0.72]].forEach(p => B.box(p[0], p[1], 0, 0.08, 0.08, 10, M.dark));
    const b = B.box(0.14, 0.14, 10, 0.72, 0.72, 16, c); B.decal(b, 'front', 0.38, 0.22, 2, 10, '#3A2A20'); B.win(b, 'right', 0.36, 0.24, 6, 7);
    B.roof(0.14, 0.14, 26, 0.72, 0.72, 14, '#7A4A3A', {ov: 0.08, stripes: 4});
    B.custom(0.5, 1, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; const a = P(0.5, 0.86, 10), b = P(0.5, 1.12, 0); g.strokeStyle = M.plank; g.lineWidth = 5 * k; g.lineCap = 'butt'; line(g, a, b); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 1 * k; for(let f = 0.2; f < 1; f += 0.25) line(g, [a[0] + (b[0] - a[0]) * f - 2.5 * k, a[1] + (b[1] - a[1]) * f], [a[0] + (b[0] - a[0]) * f + 2.5 * k, a[1] + (b[1] - a[1]) * f]); }, {layer: 2});
  }; })();
(function(){ const def = FA('haybale', {name: 'Hay bale', foot: [1, 1], h: 26, kind: 'thing', variants: 2, tags: ['farm', 'wall', 'hay']});
  def.build = (B, v) => { if(v % 2){ B.drum(0.5, 0.5, 0, 0.38, 24, M.thatch, {rings: 4, topFill: '#D9A84A'}); return; }
    const b = B.box(0.12, 0.2, 0, 0.76, 0.6, 22, M.thatch);
    ['front', 'right'].forEach(s => B.decal(b, s, s === 'front' ? 0.12 : 0.2, s === 'front' ? 0.76 : 0.6, 0, 22, M.thatch, {paint: (g, Q, k) => { g.strokeStyle = '#8A5A2B'; g.lineWidth = 1.2 * k; line(g, Q(0.3, 0), Q(0.3, 22)); line(g, Q(0.7, 0), Q(0.7, 22)); g.strokeStyle = 'rgba(138,90,43,0.25)'; for(let i = 1; i < 6; i++) line(g, Q(0, i * 3.6), Q(1, i * 3.6)); }}));
  }; })();
(function(){ const def = FO('scarecrow', {name: 'Scarecrow', h: 50, kind: 'post', dead: 'keep', tags: ['farm', 'decoy']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { g.rect(-1.6, -40, 3.2, 40); g.rect(-17, -31, 34, 3); }, fill: '#8A5A2B'},
    {path: g => { g.moveTo(-9, -30); g.lineTo(9, -30); g.lineTo(11, -14); g.lineTo(-11, -14); g.closePath(); }, fill: '#C8322A'},
    {path: g => { g.moveTo(-19, -32); g.lineTo(-9, -30); g.lineTo(-9, -26); g.lineTo(-19, -27); g.closePath(); g.moveTo(19, -32); g.lineTo(9, -30); g.lineTo(9, -26); g.lineTo(19, -27); g.closePath(); }, fill: '#B8321F'},
    {path: g => D.ell(g, 0, -38, 6.5, 6.5), fill: '#D9B87A'},
    {path: g => { g.moveTo(-12, -42); g.lineTo(12, -42); g.lineTo(6, -44); g.lineTo(4, -51); g.lineTo(-4, -51); g.lineTo(-6, -44); g.closePath(); }, fill: '#E3BE6A'}]);
  g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 1; [-4, 0, 4].forEach(xx => { g.beginPath(); g.moveTo(xx - 9 * 0, -30); g.lineTo(xx, -14); g.stroke(); }); line(g, [-11, -22], [11, -22]);
  g.fillStyle = '#2A1C14'; g.beginPath(); D.ell(g, -2.4, -39, 1.1, 1.1); D.ell(g, 2.4, -39, 1.1, 1.1); g.fill(); g.strokeStyle = '#2A1C14'; g.beginPath(); g.moveTo(-3, -35); g.lineTo(-1, -34); g.lineTo(1, -35); g.lineTo(3, -34); g.stroke();
  g.strokeStyle = '#E3BE6A'; g.lineWidth = 1.2; [[-19, -29], [19, -29]].forEach(p => { for(let i = -1; i <= 1; i++) line(g, p, [p[0] + Math.sign(p[0]) * 3, p[1] + i * 2.4]); }); g.restore(); }); })();
FO('corn', {name: 'Corn rows', h: 36, kind: 'bush', variants: 2, tags: ['plant', 'farm', 'maze']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k); const R = D.rnd(41 + v);
  for(let i = 0; i < 6; i++){ const bx = -15 + i * 6 + (R() - 0.5) * 2, by = (i % 2) * 3 - 2, H = 30 + R() * 6; g.strokeStyle = '#5DA83E'; g.lineWidth = 2.2; g.lineCap = 'round'; line(g, [bx, by], [bx + (R() - 0.5) * 2, by - H]);
    for(let j = 0; j < 3; j++){ const yy = by - 8 - j * 8, s = j % 2 ? 1 : -1; piece(g, [{path: g => { g.moveTo(bx, yy); g.quadraticCurveTo(bx + s * 7, yy - 5, bx + s * 10, yy + 3); g.quadraticCurveTo(bx + s * 6, yy - 1, bx, yy + 2); }, fill: j % 2 ? '#6CBF4A' : '#4FA03A'}]); }
    if(i % 2 === 0){ g.fillStyle = '#F2C23A'; g.beginPath(); D.ell(g, bx + 2.5, by - 17, 2, 5, 0.2); g.fill(); g.fillStyle = '#7CC04E'; g.beginPath(); g.moveTo(bx + 1, by - 12); g.lineTo(bx + 4.5, by - 13); g.lineTo(bx + 3, by - 20); g.closePath(); g.fill(); }
    g.fillStyle = '#D9B87A'; g.beginPath(); D.ell(g, bx, by - H, 1.6, 2.6); g.fill(); } g.restore(); });
function sunflower(g, x, y, k, t, v, dry){ g.save(); g.translate(x, y); g.scale(k, k);
  [[-8, 0, 30, -0.1], [7, 2, 24, 0.12], [0, -2, 36, 0]].slice(0, 2 + (v % 2)).sort((a, b) => a[2] - b[2]).forEach(([bx, by, H, a]) => { if(dry) a += a < 0 ? -0.35 : 0.35; const hx = bx + Math.sin(a) * H, hy = by - Math.cos(a) * H + (dry ? 5 : 0);
    g.strokeStyle = dry ? '#8A8A4A' : '#4FA03A'; g.lineWidth = 2.2; g.lineCap = 'round'; line(g, [bx, by], [hx, hy]); piece(g, [{path: g => { g.moveTo(bx, by - H * 0.4); g.quadraticCurveTo(bx - 9, by - H * 0.5, bx - 10, by - H * 0.35); g.quadraticCurveTo(bx - 5, by - H * 0.32, bx, by - H * 0.36); }, fill: '#5DB84A'}]);
    piece(g, [{path: g => { for(let i = 0; i < 12; i++){ const p = i / 12 * TAU; D.ell(g, hx + Math.cos(p) * (dry ? 5 : 6), hy + Math.sin(p) * (dry ? 5 : 6) + (dry ? 1.5 : 0), dry ? 2.4 : 3.4, 1.8, p); } }, fill: dry ? '#C8A04A' : '#FFD23F'}, {path: g => D.ell(g, hx, hy, 4.2, 4.2), fill: '#7A4A22'}]);
    g.fillStyle = 'rgba(42,28,20,0.35)'; for(let i = 0; i < 5; i++){ g.beginPath(); D.ell(g, hx + Math.cos(i * 2.4) * 2, hy + Math.sin(i * 2.4) * 2, 0.7, 0.7); g.fill(); } });
  g.restore(); }
(function(){ const def = FO('sunflower', {name: 'Sunflowers', h: 36, kind: 'bush', variants: 2, tags: ['plant', 'flower', 'farm']}, (g, x, y, k, t, v) => sunflower(g, x, y, k, t, v, false));
  def.conds = {dry: (g, x, y, k, t, v) => sunflower(g, x, y, k, t, v, true)}; })();   /* dry = heads hang down, petals brown; ruined → the shared twigs */
FO('pumpkins', {name: 'Pumpkin patch', h: 18, kind: 'deco', variants: 3, dead: 'keep', tags: ['plant', 'farm', 'fruit']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k); const R = D.rnd(61 + v);
  g.strokeStyle = '#4FA03A'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-16, 2); g.bezierCurveTo(-6, -4, 4, 6, 16, -2); g.stroke(); g.fillStyle = '#5DB84A'; [[-10, -1], [6, 2], [13, -4]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 4, 2.6, 0.4); g.fill(); });
  [[-8, 2, 7], [6, -2, 5.5], [12, 5, 4.5]].slice(0, 2 + (v % 2)).forEach(([px, py, r]) => { piece(g, [{path: g => { D.ell(g, px - r * 0.45, py - r * 0.6, r * 0.62, r * 0.66); D.ell(g, px + r * 0.45, py - r * 0.6, r * 0.62, r * 0.66); D.ell(g, px, py - r * 0.62, r * 0.6, r * 0.68); }, fill: g => D.lin(g, px - r, 0, px + r, 0, ['#FFAA4A', '#F2852A', '#D9662A'])}]);
    g.fillStyle = '#5A7A2A'; g.fillRect(px - 0.8, py - r * 1.42, 1.8, 3); }); g.restore(); });
// 🍄 mushroom tree — the walls of the Farmer's maze
(function(){ const MUSH = [['#E2453A', '#B8321F', '#FF7A6A', true], ['#C99257', '#8A5A2B', '#E8B87A', false], ['#5EB8F0', '#2E86C8', '#A8E4FF', true]];
  function mush(g, x, y, k, t, v, cd){ const c = cd ? ['#A89070', '#7A6248', '#C2AA88', MUSH[v % 3][3]] : MUSH[v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
    if(cd && cd.broken){ piece(g, [{path: g => { g.moveTo(-7, 0); g.quadraticCurveTo(-4, -10, -6, -18); g.lineTo(-2, -15); g.lineTo(1, -20); g.lineTo(4, -15); g.lineTo(6, -18); g.quadraticCurveTo(3, -10, 7, 0); g.closePath(); }, fill: '#D2C6AE'},
        {path: g => { g.save(); g.translate(18, -6); g.rotate(0.5); g.moveTo(-22, 0); g.quadraticCurveTo(-22, -24, 0, -25); g.quadraticCurveTo(22, -24, 22, 0); g.quadraticCurveTo(0, 6, -22, 0); g.restore(); }, fill: g => D.lin(g, 0, -30, 0, 0, [c[2], c[0], c[1]])}]); g.restore(); return; }
    const dr = cd ? 6 : 0;
    piece(g, [{path: g => { g.moveTo(-8, 0); g.quadraticCurveTo(-4, -20, -6, -40); g.lineTo(6, -40); g.quadraticCurveTo(3, -20, 8, 0); g.lineTo(12, 2); g.lineTo(-12, 2); g.closePath(); }, fill: g => D.lin(g, -8, 0, 8, 0, ['#FFF6E4', '#E8DCC6', '#C9BBA0'])}]);
    piece(g, [{path: g => { g.moveTo(-30, -40 + dr); g.quadraticCurveTo(-30, -72, 0, -73 + dr * 0.5); g.quadraticCurveTo(30, -72, 30, -40 + dr); g.quadraticCurveTo(0, -32, -30, -40 + dr); g.closePath(); }, fill: g => D.rad(g, -10, -66, 3, 40, [c[2], c[0], c[1]])}]);
    g.fillStyle = '#E8DCC6'; g.beginPath(); g.moveTo(-28, -40 + dr); g.quadraticCurveTo(0, -32, 28, -40 + dr); g.quadraticCurveTo(0, -36, -28, -40 + dr); g.fill();
    if(c[3]){ g.fillStyle = 'rgba(255,255,255,0.92)'; [[-16, -56, 4], [2, -64, 5], [17, -52, 3.6], [-4, -48, 3], [12, -62, 2.6], [-22, -46, 2.4]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], p[2], p[2] * 0.8); g.fill(); }); }
    g.restore(); }
  const def = FO('mushtree', {name: 'Mushroom tree', h: 72, variants: 3, tags: ['tree', 'farm', 'maze']}, (g, x, y, k, t, v) => mush(g, x, y, k, t, v, null));
  def.conds = {'*': (g, x, y, k, t, v, c) => mush(g, x, y, k, t, v, c)}; })();   /* a mushroom doesn't grow branches: dry = faded drooping cap · ruined = snapped, cap on the ground */
// 🐷 pig pen: fence all round, mud inside, one happy pig
(function(){ const def = FA('pigpen', {name: 'Pig pen', foot: [2, 2], h: 24, kind: 'fence', tags: ['farm', 'animals', 'mud']});
  def.build = (B, v, L) => { B.flat(0.1, 0.1, 1.8, 1.8, '#9A7A54', {fill: '#8F6E48'});
    B.custom(1, 1, (g, P, k) => { g.fillStyle = '#6E5236'; [[0.7, 0.8, 0.3], [1.3, 1.25, 0.22]].forEach(([a, b, r]) => { g.beginPath(); for(let i = 0; i < 12; i++){ const t = i / 12 * TAU, q = P(a + Math.cos(t) * r, b + Math.sin(t) * r, 0.6); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.closePath(); g.fill(); }); }, {layer: -8});
    const rail = (x, y, w, d) => { B.box(x, y, 0, w, d, 4, M.wood); B.box(x, y, 9, w, d, 3, M.wood); B.box(x, y, 17, w, d, 3, M.wood); };
    const post = (x, y) => B.box(x, y, 0, 0.1, 0.1, 22, M.dark);
    rail(0.05, 0.05, 1.9, 0.06); rail(0.05, 0.11, 0.06, 1.78); rail(1.89, 0.11, 0.06, 1.78); rail(0.05, 1.89, 0.7, 0.06); rail(1.25, 1.89, 0.7, 0.06);
    [[0.02, 0.02], [0.95, 0.02], [1.88, 0.02], [0.02, 0.95], [1.88, 0.95], [0.02, 1.88], [0.7, 1.88], [1.2, 1.88], [1.88, 1.88]].forEach(p => post(p[0], p[1]));
    if(!(L.cond && L.cond.holes)) B.bill(1.1, 0.9, 0, (g, x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); piece(g, [{path: g => { D.ell(g, 0, -7, 10, 7); g.rect(-7, -3, 2.4, 4); g.rect(4, -3, 2.4, 4); }, fill: '#FFAFC0'}, {path: g => D.ell(g, 10, -9, 5, 4.6), fill: '#FFAFC0'}]);
      g.fillStyle = '#FF8FA6'; g.beginPath(); D.ell(g, 14, -8, 2.2, 1.8); g.fill(); g.fillStyle = '#2A1C14'; g.beginPath(); D.ell(g, 11, -11, 0.9, 0.9); g.fill(); g.fillStyle = '#E87A92'; g.beginPath(); g.moveTo(8, -13); g.lineTo(10, -17); g.lineTo(12, -13); g.fill();
      g.fillStyle = '#7A5A3A'; g.beginPath(); D.ell(g, -4, -4, 3, 1.4); g.fill(); g.restore(); });
  }; })();
(function(){ const def = FA('beehive', {name: 'Bee hive', foot: [1, 1], h: 34, kind: 'thing', tags: ['farm', 'bees']});
  def.build = (B, v, L) => { B.box(0.3, 0.3, 0, 0.4, 0.4, 8, M.wood);
    B.bill(0.5, 0.5, 8, (g, x, y, k, t) => { g.save(); g.translate(x, y); g.scale(k, k); piece(g, [{path: g => { g.moveTo(-11, 0); g.quadraticCurveTo(-13, -22, 0, -24); g.quadraticCurveTo(13, -22, 11, 0); g.closePath(); }, fill: g => D.lin(g, -12, 0, 12, 0, ['#F2C46A', '#D9A040', '#B8802A'])}]);
      g.strokeStyle = 'rgba(122,74,34,0.55)'; g.lineWidth = 1; [-5, -10, -15, -19].forEach(yy => { const w = Math.sqrt(Math.max(0, 1 - Math.pow((yy + 2) / 24, 2))) * 12; g.beginPath(); g.moveTo(-w, yy); g.quadraticCurveTo(0, yy + 2, w, yy); g.stroke(); });
      g.fillStyle = '#4A2E1C'; g.beginPath(); D.ell(g, 0, -3, 3, 2.2); g.fill();
      if(!L.cond) [[-14, -20], [12, -26], [16, -12]].forEach((p, i) => { g.fillStyle = '#FFD23F'; g.beginPath(); D.ell(g, p[0], p[1], 2.2, 1.6); g.fill(); g.fillStyle = '#2A1C14'; g.fillRect(p[0] - 0.4, p[1] - 1.5, 0.9, 3); g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); D.ell(g, p[0] - 0.6, p[1] - 2.2, 1.2, 0.8); g.fill(); }); g.restore(); });
  }; })();
(function(){ const def = FA('rainbarrel', {name: 'Rain barrel', foot: [1, 1], h: 30, kind: 'thing', tags: ['farm', 'water']});
  def.build = (B) => { B.drum(0.5, 0.5, 0, 0.3, 26, '#A27A4E', {rings: 3, topFill: '#5EC3EA'});
    B.custom(0.5, 0.5, (g, P, k, t, T) => { const c = P(0.5, 0.5, 0), rx = 0.3 * HTW * k * Math.SQRT2; g.strokeStyle = '#6A6E76'; g.lineWidth = 1.8 * k; [6, 20].forEach(z => { g.beginPath(); g.ellipse(c[0], c[1] - z * k, rx, rx / 2, 0, 0.05, Math.PI - 0.05); g.stroke(); });
      g.fillStyle = '#8E8A82'; g.fillRect(c[0] + rx * 0.4, c[1] - 6 * k, 5 * k, 2.4 * k); }, {layer: 1}); }; })();
(function(){ const def = FA('trough', {name: 'Water trough', foot: [1, 1], h: 14, kind: 'deco', tags: ['farm', 'water']});
  def.build = (B) => { B.box(0.12, 0.28, 0, 0.76, 0.44, 10, M.wood, {topFill: '#5EC3EA'}); }; })();
// 🌬️ windmill: white tower, cap, four sails turning slowly (live layer)
(function(){ const def = FA('windmill', {name: 'Windmill', foot: [2, 2], h: 176, kind: 'landmark', door: [1, 2], tags: ['farm', 'landmark', 'wind']});
  const sails = (g, P, k, t, T) => { const hub = P(1, 1.62, 116), n = T.nrm(0, 1), sd = sideOf(n) || (n[0] < 0 ? 'Lb' : 'Rb'), e1 = (sd === 'L' || sd === 'Rb') ? [0.894, 0.447] : [-0.894, 0.447], a0 = t * 1.6;
    for(let i = 0; i < 4; i++){ const a = a0 + i * Math.PI / 2, pt = (r, w) => { const ca = Math.cos(a), sa = Math.sin(a), cp = Math.cos(a + Math.PI / 2), sp = Math.sin(a + Math.PI / 2); return [hub[0] + (ca * r + cp * w) * e1[0] * k, hub[1] + (ca * r + cp * w) * e1[1] * k - (sa * r + sp * w) * k]; };
      g.strokeStyle = '#6A4630'; g.lineWidth = 2.2 * k; line(g, pt(0, 0), pt(62, 0));
      g.fillStyle = 'rgba(255,246,228,0.95)'; g.beginPath(); [pt(14, 1), pt(60, 1), pt(60, 11), pt(14, 9)].forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(106,70,48,0.6)'; g.lineWidth = 1 * k; for(let r = 20; r < 60; r += 8) line(g, pt(r, 1), pt(r, 10)); }
    g.fillStyle = '#6A4630'; g.beginPath(); D.ell(g, hub[0], hub[1], 4 * k, 4 * k); g.fill(); };
  def.build = (B, v, L) => { B.box(0.1, 0.1, 0, 1.8, 1.8, 4, M.stone);
    B.drum(1, 1, 4, 0.72, 40, '#F4EFE4'); B.drum(1, 1, 44, 0.6, 38, '#F4EFE4'); B.drum(1, 1, 82, 0.5, 26, '#F4EFE4');
    B.custom(1, 1.7, (g, P, k, t, T) => { const f = P(1, 1.72, 4), c = P(1, 1, 4); if(f[1] <= c[1]) return; const w = 8 * k, h = 26 * k; g.fillStyle = '#5A3418'; g.beginPath(); g.moveTo(f[0] - w, f[1]); g.lineTo(f[0] - w, f[1] - h + w); g.arc(f[0], f[1] - h + w, w, Math.PI, 0); g.lineTo(f[0] + w, f[1]); g.closePath(); g.fill();
      const ww = P(1, 1.6, 60); g.fillStyle = '#FFE58A'; g.beginPath(); D.rr(g, ww[0] - 4 * k, ww[1] - 6 * k, 8 * k, 10 * k, 3 * k); g.fill(); }, {layer: 1});
    B.cone(1, 1, 108, 0.62, 30, '#B8321F', {stripes: 8});
    B.custom(1, 2, (g, P, k, t, T) => { if(vis(T, 0, 1)) sails(g, P, k, t, T); }, {layer: 6});
    B.custom(1, 0, (g, P, k, t, T) => { if(!vis(T, 0, 1)) sails(g, P, k, t, T); }, {layer: -6});
  }; def.live = {period: Math.PI / 2 / 1.6, frames: 6}; })();
(function(){ const def = FA('pond', {name: 'Farm pond', foot: [2, 2], h: 24, kind: 'thing', organic: true, shadowA: 0.08, tags: ['water', 'farm']});
  def.build = (B, v, L) => B.custom(1, 1, (g, P, k) => { const C = L.cond, pts = []; for(let i = 0; i < 24; i++){ const a = i / 24 * TAU, w = 0.8 * (1 + 0.08 * Math.sin(a * 2 + 1)); pts.push(P(1 + Math.cos(a) * w, 1 + Math.sin(a) * w, 0)); }
    const m = pts.reduce((a, q) => [a[0] + q[0] / pts.length, a[1] + q[1] / pts.length], [0, 0]); g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fillStyle = '#7A9A4A'; g.fill();
    g.beginPath(); pts.forEach((q, i) => { const x = m[0] + (q[0] - m[0]) * 0.86, y = m[1] + (q[1] - m[1]) * 0.86; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fillStyle = D.lin(g, 0, m[1] - 16 * k, 0, m[1] + 16 * k, C ? (C.holes ? ['#6E6458', '#4E463C'] : ['#8FA88A', '#6E8A6A']) : ['#6CC8E8', '#3A96C0']); g.fill();
    if(C){ g.strokeStyle = 'rgba(60,40,24,0.55)'; g.lineWidth = 1 * k; for(let i = 0; i < 7; i++){ const a = i * 0.9, r0 = 5 * k; g.beginPath(); g.moveTo(m[0] + Math.cos(a) * r0, m[1] + Math.sin(a) * r0 * 0.5); g.lineTo(m[0] + Math.cos(a + 0.25) * (r0 + 10 * k), m[1] + Math.sin(a + 0.25) * (r0 + 10 * k) * 0.5); g.stroke(); } return; }
    g.fillStyle = '#5DB84A'; [[-12, 3], [9, -4]].forEach(p => { g.beginPath(); g.moveTo(m[0] + p[0] * k, m[1] + p[1] * k); g.arc(m[0] + p[0] * k, m[1] + p[1] * k, 3.6 * k, 0.4, TAU - 0.2); g.closePath(); g.fill(); });
    const d = [m[0] + 4 * k, m[1] + 3 * k]; g.fillStyle = '#FFFFFF'; g.beginPath(); D.ell(g, d[0], d[1], 5 * k, 3 * k); D.ell(g, d[0] + 4 * k, d[1] - 4 * k, 2.4 * k, 2.4 * k); g.fill(); g.fillStyle = '#FF9A2A'; g.beginPath(); g.moveTo(d[0] + 6 * k, d[1] - 4 * k); g.lineTo(d[0] + 9 * k, d[1] - 3.5 * k); g.lineTo(d[0] + 6 * k, d[1] - 3 * k); g.fill();
    const R = D.rnd(9); for(let i = 0; i < 3; i++){ const q = pts[(i * 7 + 3) % pts.length]; const bx = q[0], by = q[1]; g.strokeStyle = '#4FA03A'; g.lineWidth = 1.6 * k; g.lineCap = 'round'; for(let n = 0; n < 4; n++){ const xx = bx + (R() - 0.5) * 10 * k; line(g, [xx, by], [xx + (R() - 0.5) * 3 * k, by - (10 + R() * 8) * k]); } } }); })();

/* ---------- 🗺️ the farm look's own town + trees ---------- */
Object.assign(LOOKS.farm, {swap: {palm: 'jtree', bamboo: 'corn', banana: 'sunflower'},
  roles: {home: ['farmhouse'], smith: 'barn', cargo: 'haybale', fence: 'fence', tall: ['mango', 'jtree', 'mushtree', 'jtree'], small: ['pumpkins', 'haybale', 'sunflower', 'corn', 'flowers', 'bush']}});
})();

/* 🌾 IsoProps — farm set part 2 (ip-3b, 🌳 IsoProps chat, 2026-11-17): the 🏰 TD-Stories book-2 asks (fd-p1, "IsoProps request — farm book.md").
   NEW here: 🏚️ hayloft barn 2 × 2 with a `stand` spot on top · 🪧 farm sign with a word (`text`) · 🕳️ mud pit (walk-on, slows) ·
   🎃 pumpkin pile (state = how many, 1–12) · 🚪 farm gate (state open · closed · new 🚧) · 🌉 plank bridge (state down · lifted — down makes the water walkable) ·
   wheelbarrow · tilled rows · flower patch. Same 14 rules. The API bits they use (states · walkStates · text · stand / aim · cost · deck · Props.setState · Props.ring)
   live in 30_ip_api.js; the farm-1 tweaks (farmhouse + barn stand spots, pig pen walk-on mud, bees flying, hay bale flat) are at the end of this file. */
(function(){   // 🌾 farm set part 2
'use strict';
const D = PD, M = MAT, TAU = Math.PI * 2;
const piece = (g, parts) => D.piece(g, parts, '#000', 0);
const line = (g, a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
const FA = (key, o) => add('farm', key, Object.assign({look: 'farm'}, o)), FO = (key, o, fn) => organic('farm', key, Object.assign({look: 'farm'}, o), fn);
const X = (g, Q, k, h) => { g.strokeStyle = '#FFFFFF'; g.lineWidth = 2.2 * k; line(g, Q(0.04, 1), Q(0.96, h - 1)); line(g, Q(0.04, h - 1), Q(0.96, 1)); line(g, Q(0.5, 1), Q(0.5, h - 1));
  g.lineWidth = 2.6 * k; g.beginPath(); [Q(0, 0), Q(1, 0), Q(1, h), Q(0, h)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.stroke(); };

// 🏚️ hayloft barn 2 × 2 — a TOWER prop: the hero stands on the hayloft deck (def.stand), shots start at the hero's hands (def.aim)
(function(){ const def = FA('barn2', {name: 'Hayloft barn', foot: [2, 2], h: 104, variants: 2, door: [1, 2], stand: [1, 1, 84], aim: [1, 1, 108], tags: ['farm', 'animals', 'big', 'tower']});
  def.build = (B, v, L) => { const red = ['#C8322A', '#5A6E8C'][v % 2], roof = ['#4A4A52', '#7A4A3A'][v % 2];
    B.box(0.06, 0.06, 0, 1.88, 1.88, 4, M.stone);
    const b = B.box(0.1, 0.1, 4, 1.8, 1.8, 46, red);
    B.decal(b, 'front', 0.52, 0.96, 0, 36, sh(red, -0.12), {paint: (g, Q, k) => X(g, Q, k, 36)});
    B.win(b, 'right', 0.36, 0.3, 26, 12); B.win(b, 'right', 1.14, 0.3, 26, 12);
    B.roof(0.1, 0.1, 50, 1.8, 1.8, 18, roof, {kind: 'hip', ov: 0.06});
    const loft = B.box(0.5, 0.5, 56, 1, 1, 24, red, {layer: 1});
    B.decal(loft, 'front', 0.28, 0.44, 0, 16, '#5A3418', {k: 'door', paint: (g, Q, k) => { g.fillStyle = '#E3BE6A'; g.beginPath(); const a = Q(0.06, 0), c = Q(0.94, 0), m = Q(0.5, 7); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1] - 3 * k, c[0], c[1]); g.closePath(); g.fill(); }});
    B.decal(loft, 'right', 0.3, 0.4, 6, 10, sh(red, -0.12), {paint: (g, Q, k) => X(g, Q, k, 10)});
    B.box(0.42, 0.42, 80, 1.16, 1.16, 4, M.plank, {layer: 2, topFill: '#E8C18A'});   // the deck the hero stands on
    const post = (x, y, lay) => B.box(x, y, 84, 0.08, 0.08, 14, M.dark, {layer: lay});
    post(0.44, 0.44, 2.2); post(1.48, 0.44, 2.2); post(0.44, 1.48, 4); post(1.48, 1.48, 4);
    B.box(0.46, 0.46, 94, 1.08, 0.05, 3, M.wood, {layer: 2.4}); B.box(0.46, 0.46, 94, 0.05, 1.08, 3, M.wood, {layer: 2.4});   // back rails
    B.box(0.46, 1.49, 94, 1.08, 0.05, 3, M.wood, {layer: 4.2}); B.box(1.49, 0.46, 94, 0.05, 1.08, 3, M.wood, {layer: 4.2});   // front rails (drawn last)
    B.bill(0.62, 0.62, 84, (g, x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); piece(g, [{path: g => { g.moveTo(-9, 0); g.quadraticCurveTo(-8, -9, 0, -9); g.quadraticCurveTo(8, -9, 9, 0); g.closePath(); }, fill: '#E3BE6A'}]);
      g.strokeStyle = 'rgba(138,90,43,0.45)'; g.lineWidth = 0.9; for(let i = -6; i <= 6; i += 3) line(g, [i, -1], [i * 0.8, -7]); g.restore(); }, {layer: 3});   // a little hay in the back corner
  }; })();

// 🪧 farm sign — a board on two posts with a SHORT WORD drawn on its front face (o.text, ≤ 10 letters, default FARM); the back shows planks
function signWords(g, Q, k, s, h){ const o = Q(0, h), e = Q(1, h), len = Math.hypot(e[0] - o[0], e[1] - o[1]), W = len / k;
  g.save(); g.transform((e[0] - o[0]) / W, (e[1] - o[1]) / W, 0, k, o[0], o[1]);
  g.font = '700 12px ' + FONT; const tw = g.measureText(s).width || 1, size = Math.max(6, Math.min(h * 0.62, 12 * W * 0.84 / tw));
  D.txt(g, s, W / 2, h / 2 + size * 0.06, {size, align: 'center', base: 'middle', col: '#3A2416', w: 700}); g.restore(); }
(function(){ const def = FA('farmsign', {name: 'Farm sign', foot: [1, 1], h: 44, kind: 'sign', variants: 2, text: 'FARM', noRubble: true, tags: ['farm', 'way', 'words']});
  def.build = (B, v, L) => { const wood = v % 2 ? M.plank : '#D9A46A';
    [0.12, 0.8].forEach(x => B.box(x, 0.46, 0, 0.08, 0.08, 40, M.dark));
    const b = B.box(0.04, 0.44, 16, 0.92, 0.1, 22, wood, {layer: 1});
    B.decal(b, 'front', 0.04, 0.92, 0, 22, sh(wood, 0.1), {paint: (g, Q, k) => { g.fillStyle = '#5A3418'; [[0.05, 3], [0.95, 3], [0.05, 19], [0.95, 19]].forEach(([u, z]) => { const p = Q(u, z); g.beginPath(); g.arc(p[0], p[1], 1.1 * k, 0, TAU); g.fill(); });
      signWords(g, Q, k, L.text || 'FARM', 22); }});
    B.decal(b, 'back', 0.04, 0.92, 0, 22, wood, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = k; [7.3, 14.6].forEach(z => line(g, Q(0, z), Q(1, z))); }});
  }; })();

// 🕳️ mud pit — flat, walk-on, slows walkers (cost 3 on its cell)
(function(){ const def = FA('mudpit', {name: 'Mud pit', foot: [1, 1], h: 8, kind: 'deco', block: false, cost: 3, variants: 2, organic: true, shadowA: 0.05, tags: ['farm', 'mud', 'trap']});
  def.build = (B, v, L) => B.custom(0.5, 0.5, (g, P, k) => { const C = L.cond, R = D.rnd(5 + v * 11), pts = [];
    for(let i = 0; i < 18; i++){ const a = i / 18 * TAU, w = 0.4 * (1 + 0.12 * Math.sin(a * 3 + v * 2) + (R() - 0.5) * 0.08); pts.push(P(0.5 + Math.cos(a) * w, 0.5 + Math.sin(a) * w, 0)); }
    const m = pts.reduce((a, q) => [a[0] + q[0] / pts.length, a[1] + q[1] / pts.length], [0, 0]), path = f => { g.beginPath(); pts.forEach((q, i) => { const x = m[0] + (q[0] - m[0]) * f, y = m[1] + (q[1] - m[1]) * f; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
    path(1); g.fillStyle = '#6E5236'; g.fill(); path(0.78); g.fillStyle = C && C.holes ? '#8E7C66' : '#5A4028'; g.fill();
    if(C && C.holes){ g.strokeStyle = 'rgba(42,28,20,0.55)'; g.lineWidth = 0.9 * k; for(let i = 0; i < 6; i++){ const a = i * 1.05; g.beginPath(); g.moveTo(m[0], m[1]); g.lineTo(m[0] + Math.cos(a) * 12 * k, m[1] + Math.sin(a) * 6 * k); g.stroke(); } return; }
    g.fillStyle = C ? 'rgba(150,120,80,0.5)' : 'rgba(150,190,210,0.55)'; g.beginPath(); D.ell(g, m[0] - 6 * k, m[1] - 1 * k, 6 * k, 2.2 * k); D.ell(g, m[0] + 7 * k, m[1] + 3 * k, 4 * k, 1.6 * k); g.fill();
    g.fillStyle = '#7A5A3A'; [[3, -3, 1.8], [-2, 4, 1.4], [10, -2, 1.2]].forEach(([x, y, r]) => { g.beginPath(); D.ell(g, m[0] + x * k, m[1] + y * k - r * k, r * k, r * k); g.fill(); });
    g.fillStyle = 'rgba(255,255,255,0.45)'; [[3, -3, 1.8], [-2, 4, 1.4]].forEach(([x, y, r]) => { g.beginPath(); D.ell(g, m[0] + (x - r * 0.35) * k, m[1] + (y - r * 1.4) * k, r * 0.35 * k, r * 0.3 * k); g.fill(); }); }, {layer: -8}); })();

// 🎃 pumpkin pile — state = how many pumpkins (1 … 12): shows the player's 🎃 hearts by the farmhouse door; fills the bottom row first, then stacks up
(function(){ const SLOTS = [   // [x, y, r, layer] in screen units at zoom 1 — fill order (front of the bottom row first)
    [-2, 5, 7.2, 0], [-14, 3, 6.8, 0], [10, 4, 6.8, 0], [4, -4, 6.8, 0], [-9, -5, 6.6, 0], [16, -3, 6.4, 0],
    [-8, -6, 6.2, 1], [4, -5, 6.2, 1], [-2, -12, 6, 1], [10, -11, 6, 1], [-3, -15, 5.6, 2], [5, -14, 5.6, 2]];
  const COLS = [['#FFAA4A', '#F2852A', '#D9662A'], ['#FFB85A', '#F29234', '#D97030'], ['#FF9E3E', '#EE7A24', '#CC5C22']];
  function pump(g, x, y, r, c){ piece(g, [{path: g => { D.ell(g, x - r * 0.45, y - r * 0.6, r * 0.62, r * 0.66); D.ell(g, x + r * 0.45, y - r * 0.6, r * 0.62, r * 0.66); D.ell(g, x, y - r * 0.62, r * 0.6, r * 0.68); }, fill: g => D.lin(g, x - r, 0, x + r, 0, c)}]);
    g.strokeStyle = 'rgba(160,70,20,0.35)'; g.lineWidth = 0.8; [-0.3, 0.3].forEach(f => { g.beginPath(); g.moveTo(x + r * f, y - r * 1.2); g.quadraticCurveTo(x + r * f * 1.5, y - r * 0.6, x + r * f, y - 0.5); g.stroke(); });
    g.fillStyle = '#5A7A2A'; g.fillRect(x - 0.8, y - r * 1.42, 1.8, 3); }
  const def = FO('pumpkinpile', {name: 'Pumpkin pile', h: 30, kind: 'thing', dead: 'keep', block: true, states: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], state: 3, tags: ['farm', 'fruit', 'hearts']}, (g, x, y, k, t, v, L) => {
    const n = Math.max(1, Math.min(12, L.state | 0 || 3)); g.save(); g.translate(x, y); g.scale(k, k);
    SLOTS.slice(0, n).map((s, i) => [s, i]).sort((a, b) => a[0][3] - b[0][3] || a[0][1] - b[0][1]).forEach(([s, i]) => pump(g, s[0], s[1], s[2], COLS[i % 3]));
    g.restore(); }); })();

// 🚪 farm gate — where the collectors come in. state open (walkers pass) · closed (blocks) · new 🚧 (open, a barrier pushed aside: "the lender found a new route")
(function(){ const def = FA('farmgate', {name: 'Farm gate', foot: [1, 1], h: 46, kind: 'gate', noRubble: true, states: ['open', 'closed', 'new'], walkStates: ['open', 'new'], tags: ['farm', 'entrance', 'gate']});
  def.build = (B, v, L) => { const st = L.state || 'open';
    [0.04, 0.86].forEach(x => B.box(x, 0.44, 0, 0.1, 0.1, 44, M.dark));
    B.box(0.02, 0.43, 36, 0.96, 0.12, 6, M.wood, {layer: 2});   // the board across the top
    const brace = (g, Q, k) => { g.strokeStyle = 'rgba(90,52,24,0.75)'; g.lineWidth = 1.8 * k; line(g, Q(0.04, 2), Q(0.96, 22)); };
    if(st === 'closed'){ [[0.14, 0.36], [0.5, 0.36]].forEach(([x, w]) => { const p = B.box(x, 0.47, 6, w, 0.06, 24, M.plank, {trim: 8, layer: 1}); B.decal(p, 'front', x, w, 0, 24, M.plank, {paint: brace}); }); return; }
    [[0.14, 0], [0.8, 0]].forEach(([x]) => { const p = B.box(x, 0.54, 6, 0.06, 0.34, 24, M.plank, {trim: 8, layer: 1}); B.decal(p, 'right', 0.54, 0.34, 0, 24, M.plank, {paint: brace}); });
    if(st === 'new'){   // 🚧 a striped barrier pushed to the side + fresh planks
      B.custom(0.5, 0.82, (g, P, k) => { const a = P(0.56, 0.86, 0), b = P(0.94, 0.86, 0); g.strokeStyle = '#6A6E76'; g.lineWidth = 1.6 * k; [a, b].forEach(q => { line(g, [q[0] - 3 * k, q[1]], [q[0], q[1] - 12 * k]); line(g, [q[0] + 3 * k, q[1]], [q[0], q[1] - 12 * k]); });
        const t0 = [a[0], a[1] - 12 * k], t1 = [b[0], b[1] - 12 * k], up = 5 * k; g.save(); g.beginPath(); [[t0[0], t0[1] - up], [t1[0], t1[1] - up], [t1[0], t1[1]], [t0[0], t0[1]]].forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fillStyle = '#FFC21A'; g.fill(); g.clip();
        g.fillStyle = '#2A2A2E'; for(let i = -2; i < 8; i++){ const x0 = t0[0] + (t1[0] - t0[0]) * i / 6, y0 = t0[1] + (t1[1] - t0[1]) * i / 6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 4 * k, y0 - up); g.lineTo(x0 + 7 * k, y0 - up); g.lineTo(x0 + 3 * k, y0); g.closePath(); g.fill(); } g.restore();
        const c = P(0.24, 0.84, 0); g.fillStyle = '#FF7A2E'; g.beginPath(); g.moveTo(c[0] - 4 * k, c[1]); g.lineTo(c[0] + 4 * k, c[1]); g.lineTo(c[0] + 1 * k, c[1] - 11 * k); g.lineTo(c[0] - 1 * k, c[1] - 11 * k); g.closePath(); g.fill();
        g.fillStyle = '#FFFFFF'; g.fillRect(c[0] - 2.4 * k, c[1] - 6 * k, 4.8 * k, 2 * k); }, {layer: 3});
      B.box(0.3, 0.14, 0, 0.5, 0.08, 3, '#F2D49A', {layer: -1}); B.box(0.34, 0.24, 0, 0.46, 0.08, 3, '#F2D49A', {layer: -1}); }
  }; })();

// 🌉 plank bridge over a canal — state down (the water under it becomes walkable: def.deck) · lifted (the plank stands up, the canal blocks again)
(function(){ const def = FA('plankbridge', {name: 'Plank bridge', foot: [1, 1], h: 46, kind: 'bridge', block: false, states: ['down', 'lifted'], deck: ['down'], tags: ['farm', 'bridge', 'canal']});
  def.build = (B, v, L) => { const st = L.state || 'down';
    [[0.02, 0.06], [0.02, 0.84]].forEach(p => B.box(p[0], p[1], -4, 0.1, 0.1, st === 'lifted' ? 48 : 14, M.dark));
    if(st === 'lifted'){ B.box(0.02, 0.06, 38, 0.1, 0.88, 4, M.wood, {layer: 1});
      const deck = B.box(0.14, 0.14, -2, 0.1, 0.72, 40, M.plank, {trim: 7, layer: 1});
      B.custom(0.2, 0.5, (g, P, k) => { g.strokeStyle = '#6A6E76'; g.lineWidth = 1.3 * k; [[0.16, 0.28], [0.16, 0.72]].forEach(([x, y]) => { const a = P(0.06, y, 40), b = P(x + 0.08, y, 37); g.setLineDash([2 * k, 1.2 * k]); line(g, a, b); g.setLineDash([]); }); }, {layer: 2});
      [[0.88, 0.06], [0.88, 0.84]].forEach(p => B.box(p[0], p[1], -4, 0.1, 0.1, 10, M.dark));
      return; }
    for(let i = 0; i < 6; i++) B.box(0.02 + i * 0.16, 0.12, 0, 0.15, 0.76, 4, i % 2 ? M.wood : M.plank, {dz: -0.5});
    [[0.88, 0.06], [0.88, 0.84]].forEach(p => B.box(p[0], p[1], -4, 0.1, 0.1, 14, M.dark));
    B.box(0.02, 0.08, 7, 0.96, 0.05, 3, M.wood, {layer: -0.5}); B.box(0.02, 0.86, 7, 0.96, 0.05, 3, M.wood, {layer: 1});
  }; })();

// 🛒 wheelbarrow (v0 empty · v1 carries hay)
(function(){ const def = FA('wheelbarrow', {name: 'Wheelbarrow', foot: [1, 1], h: 30, kind: 'thing', variants: 2, tags: ['farm', 'tool']});
  def.build = (B, v) => { const c = ['#C8322A', '#3E8E5A'][v % 2];
    B.custom(0.2, 0.5, (g, P, k) => { const pts = []; for(let i = 0; i < 20; i++){ const a = i / 20 * TAU; pts.push(P(0.18, 0.5 + Math.cos(a) * 0.15, 9 + Math.sin(a) * 9)); }
      g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fillStyle = '#3A3A40'; g.fill(); const h = P(0.18, 0.5, 9); g.fillStyle = '#B8BCC4'; g.beginPath(); D.ell(g, h[0], h[1], 1.8 * k, 2.4 * k); g.fill(); }, {layer: -1});
    [[0.62, 0.34], [0.62, 0.6]].forEach(p => B.box(p[0], p[1], 0, 0.06, 0.06, 9, M.dark));
    B.box(0.26, 0.3, 8, 0.46, 0.4, 12, c, {topFill: v % 2 ? '#E3BE6A' : '#5A3418'});
    [0.32, 0.62].forEach(y => B.box(0.7, y, 14, 0.28, 0.05, 3, M.wood, {layer: 0.5}));
    if(v % 2) B.bill(0.49, 0.5, 20, (g, x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); piece(g, [{path: g => { g.moveTo(-12, 0); g.quadraticCurveTo(-9, -9, 0, -9); g.quadraticCurveTo(9, -9, 12, 0); g.closePath(); }, fill: '#E3BE6A'}]);
      g.strokeStyle = 'rgba(138,90,43,0.45)'; g.lineWidth = 0.9; for(let i = -8; i <= 8; i += 4) line(g, [i, -1], [i * 0.8, -7]); g.restore(); }, {layer: 1});
  }; })();

// 🟫 tilled rows (v1 = sprouts) — flat, walk-on
(function(){ const def = FA('tilled', {name: 'Tilled rows', foot: [1, 1], h: 10, kind: 'deco', block: false, variants: 2, tags: ['farm', 'soil']});
  def.build = (B, v, L) => { B.flat(0.04, 0.04, 0.92, 0.92, '#8A5A2B', {fill: '#946236'});
    for(let r = 0; r < 4; r++) B.box(0.08, 0.1 + r * 0.22, 0, 0.84, 0.1, 3, '#7E5230', {topFill: '#A87444', dz: -0.4});
    if(v % 2 && !L.cond) for(let r = 0; r < 4; r++) for(let c = 0; c < 3; c++) B.bill(0.22 + c * 0.28, 0.15 + r * 0.22, 3, (g, x, y, k) => { g.fillStyle = '#5DB84A'; g.beginPath(); D.ell(g, x - 2 * k, y - 2.5 * k, 2.2 * k, 1.2 * k, -0.5); D.ell(g, x + 2 * k, y - 2.5 * k, 2.2 * k, 1.2 * k, 0.5); g.fill(); g.strokeStyle = '#4FA03A'; g.lineWidth = k; line(g, [x, y], [x, y - 3 * k]); }, {layer: 1});
  }; })();

// 🌼 flower patch — small, walk-on, three colour sets
FO('flowerpatch', {name: 'Flower patch', h: 18, kind: 'deco', block: false, variants: 3, tags: ['plant', 'flower', 'farm']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k); const R = D.rnd(83 + v * 7);
  const C = [['#FF8FB0', '#FFD23F', '#FFFFFF'], ['#9B5DE5', '#5EC3EA', '#FFFFFF'], ['#FF6B4A', '#FFB21A', '#FFE58A']][v % 3], F = [];
  for(let i = 0; i < 10; i++) F.push([(R() - 0.5) * 34, (R() - 0.5) * 12, 6 + R() * 7, C[i % 3]]);
  F.sort((a, b) => a[1] - b[1]).forEach(([fx, fy, H, c]) => { g.strokeStyle = '#4FA03A'; g.lineWidth = 1.2; g.lineCap = 'round'; line(g, [fx, fy], [fx, fy - H]);
    g.fillStyle = '#5DB84A'; g.beginPath(); D.ell(g, fx + 2, fy - H * 0.4, 2.2, 1.1, 0.5); g.fill();
    g.fillStyle = c; for(let p = 0; p < 5; p++){ const a = p / 5 * TAU; g.beginPath(); D.ell(g, fx + Math.cos(a) * 2.2, fy - H + Math.sin(a) * 2.2, 1.8, 1.8); g.fill(); }
    g.fillStyle = c === '#FFD23F' || c === '#FFB21A' ? '#B8642A' : '#FFD23F'; g.beginPath(); D.ell(g, fx, fy - H, 1.3, 1.3); g.fill(); });
  g.restore(); });

/* ---------- 🔧 farm-1 tweaks for book 2 (props from 23_ip_farm.js) ---------- */
// 🎯 stand spots: farmhouse = on the porch roof · barn = in the hayloft door
Object.assign(DEFS.farmhouse, {stand: [1, 1.66, 33], aim: [1, 1.66, 57]});
Object.assign(DEFS.barn, {stand: [1, 2.94, 62], aim: [1, 2.94, 86]});
// 🐷 pig pen: mud inside is walk-on but slow (a trap) — the fence ring is drawn, walkers wade through
Object.assign(DEFS.pigpen, {block: false, cost: 3});
// 🌾 hay bale: state whole | flat (the 🚜 Golden Tractor flattened it → walkers pass)
(function(){ const def = DEFS.haybale, whole = def.build; Object.assign(def, {states: ['whole', 'flat'], walkStates: ['flat']});
  def.build = (B, v, L) => { if(L.state !== 'flat') return whole(B, v, L);
    B.custom(0.5, 0.5, (g, P, k) => { const R = D.rnd(19 + v * 5), pts = []; for(let i = 0; i < 16; i++){ const a = i / 16 * TAU, w = 0.42 * (1 + (R() - 0.5) * 0.18); pts.push(P(0.5 + Math.cos(a) * w, 0.5 + Math.sin(a) * w, 2)); }
      g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fillStyle = '#D9B05A'; g.fill();
      const m = P(0.5, 0.5, 3); g.strokeStyle = '#B88A3A'; g.lineWidth = 1 * k; for(let i = 0; i < 16; i++){ const a = R() * TAU, r0 = R() * 12, r1 = r0 + 4 + R() * 6; line(g, [m[0] + Math.cos(a) * r0 * k, m[1] + Math.sin(a) * r0 * k * 0.5], [m[0] + Math.cos(a + 0.3) * r1 * k, m[1] + Math.sin(a + 0.3) * r1 * k * 0.5]); }
      g.strokeStyle = '#8A5A2B'; g.lineWidth = 1.2 * k; line(g, [m[0] - 10 * k, m[1] + 2 * k], [m[0] + 6 * k, m[1] - 3 * k]); }, {layer: -8}); }; })();
// 🐝 bee hive: the bees fly round it (live layer, still in a ruin / when the budget is low)
(function(){ const def = DEFS.beehive, old = def.build; def.live = {period: 2.4, frames: 6};
  def.build = (B, v, L) => { old(B, v, Object.assign({}, L, {cond: L.cond || {key: '_bees'}}));   // the old painter draws no bees when cond is set → we draw them flying
    if(L.cond) return;
    B.bill(0.5, 0.5, 8, (g, x, y, k, t) => { for(let i = 0; i < 3; i++){ const a = (t || 0) / 2.4 * TAU * (i === 1 ? -1 : 1) + i * 2.1, rr = 22 - i * 3, bx = x + Math.cos(a) * rr * k, by = y - 16 * k + Math.sin(a) * 8 * k + Math.sin(a * 2) * 2 * k;
      g.fillStyle = '#2A1C14'; g.beginPath(); D.ell(g, bx, by, 3 * k, 2.3 * k); g.fill(); g.fillStyle = '#FFD23F'; g.beginPath(); D.ell(g, bx, by, 2.3 * k, 1.6 * k); g.fill(); g.fillStyle = '#2A1C14'; g.fillRect(bx - 0.5 * k, by - 1.6 * k, 1.1 * k, 3.2 * k);
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); D.ell(g, bx - 0.6 * k, by - 2.2 * k, 1.2 * k, 0.8 * k); g.fill(); } }, {layer: 2}); }; })();
})();

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
const COUNTRY = {farm: ['inn_country', 'smithy_horseshoe']};
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
const PLAZA = {farm: {well: 'well_pump', stall: 'stall_farm', qboard: 'qboard_barn', lantern: 'lantern_hurricane'}};
Object.keys(PLAZA).forEach(lk => { const L = LOOKS[lk]; if(!L) return; const sw = {}; Object.keys(PLAZA[lk]).forEach(a => { if(DEFS[PLAZA[lk][a]]) sw[a] = PLAZA[lk][a]; }); L.swap = Object.assign({}, L.swap || {}, sw); });
})();
K.loaded('farm', 'ip-4g');
})(window.Props && window.Props._K);
