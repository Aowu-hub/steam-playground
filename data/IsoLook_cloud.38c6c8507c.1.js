
/* 🌍 IsoLook_cloud — ☁️ Cloud Kingdom — AvataRealm side ⑤b on ❄️ snow: 11 buildings · own floor · own resource shapes (rain barrel · cloud bales · rainbow shards) · own walls (needs realm) — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['cloud'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/cloud.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_cloud: include IsoProps first'); return; }
if(!K.AR){ console.warn('IsoLook_cloud: load IsoLook_realm first (Props.need does it)'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — ☁️ cloud · Cloud Kingdom (AvataRealm side ⑤b, ip-4d pictures, 🌳 IsoProps chat 2026-11-20).
   Built ON ❄️ snow (its pines, ice crystals, snowmen, snowy ground, 🍂 versions — until a ☁️ Olympus look exists) — a sky town: puffy white clouds, sky-blue roofs, sunshine gold, rainbows, silver weather gear
   + 🏰 realm (team colours · 🏗️ site steps · slots · walls). 11 buildings = AvataRealm §14a:
   🏠 cloud puff → cloud cottage → Rainbow Castle · 🏕️ Puff Barracks · 🎠 Rainbow Stable · 🪽 Windmill Perch · 🩹 Sunbeam Spa · 🔧 Thunderhead Forge ·
   🗼 Lightning-rod Tower · 🎨 Fog Tailor · 🔮 Aurora Spire · 🕵️ Fog Bank · 🐾 Weather-pet Roost.
   Own resource shapes: 💧 cloud_coin = a rain barrel under a little rain cloud · ☁️ cloud_brick = cloud-puff bales · 🌈 cloud_gem = rainbow shards in a snowy rock.
   Own floor (soft cloud tiles + puffs + little rainbows + raindrops) and own walls (☁️ cloud-bank wall on a silver rail · 🧭 weathervane posts · ☀️ sunburst gate · 🏯 white cloud-stone rampart + gold-dome towers + ⚡ storm-cloud gatehouse). Keys cloud_<slot>. */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, halo} = T;
const {pennant, banner, trim, building, addSide, addFloor, tileBase, hash, teamOf, patOf, inkOf, blocks, awning} = K.AR;
const D = PD, TAU = Math.PI * 2, S2 = Math.SQRT2;
const CLOUD = '#FFFFFF', CLOUD2 = '#F2F6FF', CLOUDS = '#C6D4EE', SKY = '#8FD3F4', SKYD = '#4FA8E0', ROOF = '#6FB8F0', SUN = '#FFD23F', SUND = '#F2A72A', GOLD = '#F2B731', GOLDD = '#B8862A',
  SILVER = '#D2DAE6', SILVERD = '#8A96A8', STORM = '#6E7890', STORMD = '#4A5268', WALLW = '#F6F8FC', WOOD = '#B98A56', WOODD = '#6A4A2E', ICE = '#CFEFFF', BOLT = '#FFE14A';
const RAIN = ['#FF6B6B', '#FFB347', '#FFE66D', '#7BE495', '#6EC6FF', '#B28DFF'];
const dead = c => c && c.broken, dim = (c, col, f) => c ? (c.broken ? D.sh(col, -0.42) : D.sh(col, f == null ? -0.14 : f)) : col;
// ☁️ the side's emblem: a puffy cloud with a little lightning bolt under it
function cloudEm(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); g.arc(x - r * 0.45, y - r * 0.05, r * 0.42, 0, TAU); g.arc(x + r * 0.05, y - r * 0.32, r * 0.55, 0, TAU); g.arc(x + r * 0.55, y - r * 0.02, r * 0.4, 0, TAU); g.fill();
  g.beginPath(); D.rr(g, x - r * 0.85, y - r * 0.12, r * 1.75, r * 0.5, r * 0.25); g.fill();
  g.beginPath(); g.moveTo(x + r * 0.05, y + r * 0.35); g.lineTo(x - r * 0.25, y + r * 0.85); g.lineTo(x + r * 0.02, y + r * 0.8); g.lineTo(x - r * 0.12, y + r * 1.2); g.lineTo(x + r * 0.32, y + r * 0.62); g.lineTo(x + r * 0.06, y + r * 0.66); g.lineTo(x + r * 0.24, y + r * 0.35); g.closePath(); g.fill(); }
addSide('cloud', {name: 'Cloud Kingdom', icon: '☁️', look: 'cloud', accent: SKY, emblem: cloudEm, base: 'snow'});
addLook('cloud', {name: 'Cloud Kingdom', walls: [WALLW, '#EEF4FF', '#FFF8EC'], roofs: [ROOF, SKYD, '#F7A8C8'], trim: '#4A5A7A', accent: SKY, stilts: false, team: null, side: 'cloud',
  res: {coin: SKY, coinDk: SKYD, rock: '#8A96A8', brick: CLOUD, brickDk: CLOUDS, leaf: '#7BE495', bark: WOODD, gem: '#FFE66D', gemDk: '#B28DFF', gemHi: '#FFFFFF'}}, 'snow');
/* ---------- 🖌️ cloud painters ---------- */
// one puff (screen space): lit from the upper left, a cool shade underneath
function puff(g, x, y, r, c, col){ const base = dim(c, col || CLOUD, -0.06), br = dead(c); g.fillStyle = D.rad(g, x - r * 0.35, y - r * 0.4, r * 0.1, r * 1.15, [[0, br ? D.sh(base, 0.1) : '#FFFFFF'], [0.55, base], [1, br ? D.sh(base, -0.25) : (col === STORM ? STORMD : CLOUDS)]]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
// ☁️ a cloud MASS sitting on (cx, cy, z) in model space: rings of puffs drawn back → front; r in tiles, h px; returns the top point
function cloudMass(g, P, k, cx, cy, z, r, h, c, o){ o = o || {}; const q = P(cx, cy, z), rx = r * HTW * k * S2, ry = rx / 2, hh = (dead(c) ? h * 0.55 : h) * k, list = [], col = o.col || CLOUD, n = o.n || 9;
  for(let i = 0; i < n; i++){ const a = i / n * TAU + (o.rot || 0.3); list.push([q[0] + Math.cos(a) * rx * 0.72, q[1] + Math.sin(a) * ry * 0.72 - hh * 0.22, rx * 0.36]); }
  for(let i = 0; i < Math.max(3, n - 4); i++){ const a = i / Math.max(3, n - 4) * TAU + 0.9; list.push([q[0] + Math.cos(a) * rx * 0.42, q[1] + Math.sin(a) * ry * 0.42 - hh * 0.55, rx * 0.34]); }
  list.push([q[0] - rx * 0.08, q[1] - hh * 0.82, rx * 0.34]); list.push([q[0] + rx * 0.22, q[1] - hh * 0.72, rx * 0.26]);
  list.sort((a, b) => a[1] + a[2] * 0.1 - (b[1] + b[2] * 0.1)).forEach(([x, y, rr]) => puff(g, x, y, rr, c, col));
  return [q[0], q[1] - hh]; }
// 🌈 a rainbow arc between two screen points, bulging up by lift px (6 bands, or 3 dim ones when broken)
function rainbow(g, a, b, lift, w, c){ const br = dead(c), n = br ? 3 : 6; for(let i = 0; i < n; i++){ const o = i * w * 0.9; g.strokeStyle = br ? D.sh(RAIN[i], -0.5) : c ? D.sh(RAIN[i], -0.18) : RAIN[i]; g.lineWidth = w; g.lineCap = 'butt'; g.beginPath();
  g.moveTo(a[0] + o * 0.5, a[1]); g.bezierCurveTo(a[0] + o * 0.5, a[1] - lift + o, b[0] - o * 0.5, b[1] - lift + o, b[0] - o * 0.5, b[1]); g.stroke(); } }
// ☀️ a sun disc with rays (screen space, live turn)
function sunDisc(g, x, y, r, t, c){ const br = dead(c), lv = lightOf(c), rot = c && c.still ? 0 : ph(t, 2.4) / 6; g.fillStyle = br ? '#B8A880' : lv === 1 ? SUND : '#D8B060';
  for(let i = 0; i < 12; i++){ const a = rot + i / 12 * TAU, r1 = r * (i % 2 ? 1.45 : 1.7); g.beginPath(); g.moveTo(x + Math.cos(a - 0.12) * r * 0.9, y + Math.sin(a - 0.12) * r * 0.9); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.lineTo(x + Math.cos(a + 0.12) * r * 0.9, y + Math.sin(a + 0.12) * r * 0.9); g.closePath(); g.fill(); }
  g.fillStyle = D.rad(g, x - r * 0.3, y - r * 0.35, r * 0.1, r, [[0, '#FFF6C0'], [0.6, br ? '#C8B890' : SUN], [1, br ? '#A89870' : SUND]]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  if(br) return; g.fillStyle = '#7A4A1A'; [-1, 1].forEach(s => { g.beginPath(); g.arc(x + s * r * 0.32, y - r * 0.12, r * 0.09, 0, TAU); g.fill(); }); g.strokeStyle = '#7A4A1A'; g.lineWidth = Math.max(0.6, r * 0.09); g.beginPath(); g.arc(x, y + r * 0.05, r * 0.32, 0.3, Math.PI - 0.3); g.stroke();
  g.fillStyle = 'rgba(255,140,120,0.5)'; [-1, 1].forEach(s => { g.beginPath(); g.arc(x + s * r * 0.55, y + r * 0.18, r * 0.13, 0, TAU); g.fill(); }); }
// ⚡ a little lightning bolt (screen space)
function bolt(g, x, y, s, col){ g.fillStyle = col || BOLT; g.beginPath(); g.moveTo(x + 2 * s, y - 10 * s); g.lineTo(x - 3 * s, y + 1 * s); g.lineTo(x + 0.5 * s, y + 1 * s); g.lineTo(x - 2 * s, y + 10 * s); g.lineTo(x + 4 * s, y - 2 * s); g.lineTo(x + 0.6 * s, y - 2 * s); g.lineTo(x + 4 * s, y - 10 * s); g.closePath(); g.fill(); }
// 💧 raindrops falling from y0 for len px (live)
function rainFall(g, x, y0, w, len, k, t, c, n){ if(dead(c) || (c && c.still)) return; g.strokeStyle = 'rgba(120,190,240,0.85)'; g.lineWidth = 1.2 * k; g.lineCap = 'round'; for(let i = 0; i < (n || 6); i++){ const f = ((t / 1.2) + i / (n || 6) * 1.7) % 1, xx = x + (i / ((n || 6) - 1) - 0.5) * w; line(g, [xx, y0 + f * len], [xx - 1 * k, y0 + f * len + 4 * k]); } }
// a round window (decal paint) — silver rim, sky glass, glows when lit
const roundWin = (h, c) => (g, Q, k) => { const m = Q(0.5, h / 2), r = Math.abs(Q(1, 0)[0] - Q(0, 0)[0]) * 0.42, lv = lightOf(c); g.fillStyle = SILVER; g.beginPath(); D.ell(g, m[0], m[1], r, h * 0.48 * k); g.fill();
  g.fillStyle = lv === 1 ? '#FFF2B8' : lv ? '#C8C0A0' : '#3A4458'; g.beginPath(); D.ell(g, m[0], m[1], r * 0.72, h * 0.35 * k); g.fill(); g.strokeStyle = SILVERD; g.lineWidth = 0.8 * k; line(g, [m[0] - r * 0.7, m[1]], [m[0] + r * 0.7, m[1]]); };
// a sky-blue round-top door (decal paint) with a gold sun knob
const skyDoor = (h, fill) => (g, Q, k) => { const a = Q(0, 0), b = Q(1, 0), sp = Q(0, h * 0.62), sq = Q(1, h * 0.62), tp = Q(0.5, h);
  g.fillStyle = SILVER; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(sp[0], sp[1]); g.quadraticCurveTo(sp[0], tp[1], tp[0], tp[1]); g.quadraticCurveTo(sq[0], tp[1], sq[0], sq[1]); g.lineTo(b[0], b[1]); g.closePath(); g.fill();
  const a2 = Q(0.12, 0), b2 = Q(0.88, 0), sp2 = Q(0.12, h * 0.6), sq2 = Q(0.88, h * 0.6), tp2 = Q(0.5, h - 2); g.fillStyle = fill || SKYD; g.beginPath(); g.moveTo(a2[0], a2[1]); g.lineTo(sp2[0], sp2[1]); g.quadraticCurveTo(sp2[0], tp2[1], tp2[0], tp2[1]); g.quadraticCurveTo(sq2[0], tp2[1], sq2[0], sq2[1]); g.lineTo(b2[0], b2[1]); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 0.9 * k; line(g, Q(0.5, 0.5), Q(0.5, h - 2.5)); g.fillStyle = GOLD; const q = Q(0.7, h * 0.42); g.beginPath(); g.arc(q[0], q[1], 1.3 * k, 0, TAU); g.fill(); };
const CL = (slot, o, build) => building('cloud', slot, o, build);
// 🧭 a weathervane (screen space): pole, N-S-E-W ticks, a turning arrow with a cloud tail
function vane(g, x, y, h, k, t, c){ const br = dead(c); g.strokeStyle = SILVERD; g.lineWidth = 1.6 * k; line(g, [x, y], [x, y - h * k]); if(br) return; const top = [x, y - h * k], a = c && c.still ? 0.4 : Math.sin(ph(t, 2.4)) * 0.6 + Math.cos(ph(t, 2.4)) * 0.3;
  g.strokeStyle = SILVERD; g.lineWidth = 1 * k; line(g, [top[0] - 5 * k, top[1] + 4 * k], [top[0] + 5 * k, top[1] + 4 * k]); g.fillStyle = GOLD; g.beginPath(); g.arc(top[0], top[1] + 4 * k, 1.4 * k, 0, TAU); g.fill();
  const dx = Math.cos(a) * 9 * k, dy = Math.sin(a) * 2.4 * k; g.strokeStyle = GOLDD; g.lineWidth = 1.4 * k; line(g, [top[0] - dx, top[1] - dy], [top[0] + dx, top[1] + dy]); g.fillStyle = GOLD; g.beginPath(); g.moveTo(top[0] + dx * 1.3, top[1] + dy * 1.3); g.lineTo(top[0] + dx - 2 * k, top[1] + dy - 3 * k); g.lineTo(top[0] + dx - 2 * k, top[1] + dy + 3 * k); g.closePath(); g.fill();
  puff(g, top[0] - dx * 1.05, top[1] - dy, 3 * k, c); }
// a little snowy patch with a pine sapling + a snowball (ground deco tied to the snow base)
function snowy(B, x, y, c){ B.custom(x, y, (g, P, k) => { const q = P(x, y, 0); g.fillStyle = dim(c, '#FFFFFF', -0.08); g.beginPath(); D.ell(g, q[0], q[1], 9 * k, 3.6 * k); g.fill(); g.fillStyle = dim(c, '#5A9A6A'); g.beginPath(); g.moveTo(q[0] - 4 * k, q[1] - 1 * k); g.lineTo(q[0] - 1 * k, q[1] - 14 * k); g.lineTo(q[0] + 2 * k, q[1] - 1 * k); g.closePath(); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(q[0] + 5 * k, q[1] - 2 * k, 2.6 * k, 0, TAU); g.fill(); g.beginPath(); g.moveTo(q[0] - 3 * k, q[1] - 6 * k); g.lineTo(q[0] - 1 * k, q[1] - 14 * k); g.lineTo(q[0] + 1 * k, q[1] - 6 * k); g.quadraticCurveTo(q[0] - 1 * k, q[1] - 7.4 * k, q[0] - 3 * k, q[1] - 6 * k); g.fill(); }, {layer: 3, zb: 0, top: 14}); }
/* ============================ 🏠 HOUSE — 3 levels, each a new SHAPE ============================ */
CL('house', {name: 'Rainbow Castle', h: 140, names: {'1': 'Cloud Puff', '2': 'Cloud Cottage', '3': 'Rainbow Castle'}, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond, lv = L.state || '1';
  if(lv === '1'){ // ☁️ a puffy cloud hut on a silver plate: a round sky-blue door, a little round window, a team ribbon round the base, a raindrop lamp
    B.box(0.2, 0.15, 0, 2.6, 1.7, 4, SILVER, {layer: -2});
    B.custom(1.5, 1.0, (g, P, k, t) => { const top = cloudMass(g, P, k, 1.5, 1.0, 4, 1.02, 56, c, {n: 10}), br = dead(c);
      const q = P(1.5, 1.0, 4), rx = 1.02 * HTW * k * S2, col = br ? '#8A8090' : teamOf(L); g.strokeStyle = col; g.lineWidth = 4 * k; g.beginPath(); g.ellipse(q[0], q[1] - 7 * k, rx * 0.88, rx * 0.36, 0, 0.12, Math.PI - 0.12); g.stroke();
      if(!br){ g.save(); g.beginPath(); g.ellipse(q[0], q[1] - 7 * k, rx * 0.88, rx * 0.36, 0, 0.12, Math.PI - 0.12); g.lineWidth = 4 * k; g.strokeStyle = inkOf(col); g.setLineDash([2 * k, 4 * k]); g.globalAlpha = 0.6; g.stroke(); g.restore(); }
      const d = P(1.5, 1.82, 4); g.fillStyle = SILVER; g.beginPath(); g.moveTo(d[0] - 9 * k, d[1]); g.lineTo(d[0] - 9 * k, d[1] - 16 * k); g.quadraticCurveTo(d[0], d[1] - 30 * k, d[0] + 9 * k, d[1] - 16 * k); g.lineTo(d[0] + 9 * k, d[1]); g.closePath(); g.fill();
      g.fillStyle = SKYD; g.beginPath(); g.moveTo(d[0] - 7 * k, d[1]); g.lineTo(d[0] - 7 * k, d[1] - 15 * k); g.quadraticCurveTo(d[0], d[1] - 27 * k, d[0] + 7 * k, d[1] - 15 * k); g.lineTo(d[0] + 7 * k, d[1]); g.closePath(); g.fill(); g.fillStyle = GOLD; g.beginPath(); g.arc(d[0] + 4 * k, d[1] - 9 * k, 1.2 * k, 0, TAU); g.fill();
      const w0 = P(2.2, 1.6, 30); g.fillStyle = SILVER; g.beginPath(); g.arc(w0[0], w0[1], 5 * k, 0, TAU); g.fill(); g.fillStyle = lightOf(c) === 1 ? '#FFF2B8' : lightOf(c) ? '#C8C0A0' : '#3A4458'; g.beginPath(); g.arc(w0[0], w0[1], 3.4 * k, 0, TAU); g.fill(); }, {layer: 1, zb: 4, top: 62});
    B.custom(0.4, 1.6, (g, P, k, t) => { const q = P(0.36, 1.62, 4), br = dead(c); g.strokeStyle = SILVERD; g.lineWidth = 1.6 * k; line(g, q, [q[0], q[1] - 28 * k]); const lp = [q[0], q[1] - 33 * k]; g.fillStyle = br ? '#8A96A8' : '#9AD8FF'; g.beginPath(); g.moveTo(lp[0], lp[1] - 6 * k); g.quadraticCurveTo(lp[0] + 5 * k, lp[1] + 1 * k, lp[0], lp[1] + 4 * k); g.quadraticCurveTo(lp[0] - 5 * k, lp[1] + 1 * k, lp[0], lp[1] - 6 * k); g.fill();
      if(lightOf(c)) D.glow(g, lp[0], lp[1], 10 * k, '#BDE8FF', 0.5 * lightOf(c)); }, {layer: 3, zb: 4, top: 42, fx: true});
    B.custom(1.5, 1.0, (g, P, k, t) => { if(dead(c)) return; const q = P(1.5, 1.0, 66), s2 = c && c.still ? 0 : Math.sin(ph(t, 2.4)) * 2.4 + Math.cos(ph(t, 2.4)) * 1.2; puff(g, q[0] + 18 * k, q[1] - 4 * k + s2 * k, 5 * k, c); puff(g, q[0] + 24 * k, q[1] - 2 * k + s2 * k, 4 * k, c);
      if(!(c && c.still)){ const z = 1 + 0.4 * Math.sin(ph(t, 2.4)) + 0.2 * Math.cos(ph(t, 2.4)); g.fillStyle = '#FFF2A0'; g.beginPath(); D.star(g, q[0] - 16 * k, q[1] + 2 * k, 2.6 * z * k, 0.9 * z * k, 4); g.fill(); } }, {layer: 4, zb: 60, top: 76, fx: true});
    snowy(B, 2.6, 0.4, c);
    pennant(B, L, 2.72, 1.72, 4, 50, {emblem: cloudEm, pole: SILVERD});
    return; }
  if(lv === '2'){ // 🏡 cloud cottage: white walls, a sky-blue gable roof heaped with cloud puffs, round windows, a rain barrel under a drainpipe, a weathervane
    B.box(0.15, 0.1, 0, 2.7, 1.8, 3, SILVER, {layer: -2});
    const w = B.box(0.4, 0.32, 3, 2.2, 1.2, 34, WALLW);
    B.decal(w, 'front', 1.2, 0.56, 0, 28, SKYD, {k: 'door', paint: skyDoor(28)}); [0.6, 2.0].forEach(a => B.decal(w, 'front', a, 0.36, 12, 16, '#FFF2B8', {paint: roundWin(16, c)})); [0.5, 1.0].forEach(a => B.decal(w, 'right', a, 0.34, 12, 16, '#FFF2B8', {paint: roundWin(16, c)}));
    trim(B, L, w, 30, 3.4);
    B.roof(0.3, 0.22, 37, 2.4, 1.4, 30, ROOF, {ridge: 'x', ov: 0.12, kind: 'gable'});
    B.custom(1.5, 0.92, (g, P, k) => { const br = dead(c); [[0.5, 0], [0.95, 0.15], [1.45, -0.05], [1.95, 0.12], [2.45, 0]].forEach(([x, dz], i) => { if(br && i % 2) return; const q = P(x, 0.92, 63 + dz * 20); puff(g, q[0], q[1], (10 + (i % 2) * 3) * k, c); puff(g, q[0] + 6 * k, q[1] + 3 * k, 7 * k, c); }); }, {layer: 3, zb: 58, top: 80});
    B.custom(2.5, 0.92, (g, P, k, t) => { const q = P(2.5, 0.92, 67); vane(g, q[0], q[1] - 6 * k, 22, k, t, c); }, {layer: 4, zb: 66, top: 98, fx: true});
    B.custom(2.7, 1.62, (g, P, k, t) => { const q = P(2.66, 1.62, 3), br = dead(c); g.strokeStyle = SILVERD; g.lineWidth = 2 * k; line(g, [q[0] - 4 * k, q[1] - 40 * k], [q[0] - 4 * k, q[1] - 16 * k]);
      g.fillStyle = WOOD; g.beginPath(); D.rr(g, q[0] - 9 * k, q[1] - 14 * k, 14 * k, 14 * k, 3 * k); g.fill(); g.strokeStyle = WOODD; g.lineWidth = 1.2 * k; [-10, -4].forEach(dy => line(g, [q[0] - 9 * k, q[1] + dy * k], [q[0] + 5 * k, q[1] + dy * k]));
      g.fillStyle = br ? '#8A96A8' : '#7FD0F8'; g.beginPath(); D.ell(g, q[0] - 2 * k, q[1] - 14 * k, 7 * k, 2.6 * k); g.fill(); }, {layer: 3, zb: 3, top: 42});
    B.custom(2.7, 0.3, (g, P, k) => { const q = P(2.72, 0.3, 3); [[0, 0, '#FF8AB0'], [5, 2, '#FFE66D'], [-4, 3, '#9AD8FF']].forEach(([dx, dy, col]) => { g.fillStyle = dim(c, col); g.beginPath(); g.arc(q[0] + dx * k, q[1] + dy * k - 3 * k, 2.4 * k, 0, TAU); g.fill(); }); }, {layer: 3, zb: 3, top: 8});
    banner(B, L, w, 'right', 0.66, 0.28, 6, 20, cloudEm);
    pennant(B, L, 0.24, 1.76, 3, 50, {emblem: cloudEm, pole: SILVERD});
    return; }
  // 🏰 L3 Rainbow Castle: a white keep with gold trim on a cloud base, 2 round white towers with gold domes, a GIANT rainbow arching from tower to tower, a smiling sun disc in the middle
  B.custom(1.5, 1.0, (g, P, k) => { cloudMass(g, P, k, 1.5, 1.0, 0, 1.4, 22, c, {n: 12}); }, {layer: -1, zb: 0, top: 24});
  const w = B.box(0.36, 0.3, 8, 2.28, 1.36, 40, WALLW);
  B.decal(w, 'front', 1.22, 0.56, 0, 32, SKYD, {k: 'door', paint: skyDoor(32)}); [0.5, 2.06].forEach(a => B.decal(w, 'front', a, 0.3, 14, 16, '#FFF2B8', {paint: roundWin(16, c)})); [0.5, 1.0].forEach(a => B.decal(w, 'right', a, 0.3, 14, 16, '#FFF2B8', {paint: roundWin(16, c)}));
  trim(B, L, w, 36, 4);
  B.box(0.3, 0.24, 48, 2.4, 1.48, 4, CLOUD2); B.box(0.28, 0.22, 46, 2.44, 1.52, 2, GOLD);
  B.custom(1.5, 1.0, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; for(let i = 0; i < 6; i++){ const q = P(0.5 + i * 0.4, 1.72, 52); puff(g, q[0], q[1] - 3 * k, 6 * k, c); } }, {layer: 2, zb: 52, top: 62});
  [[0.36, 0.42], [2.64, 0.42]].forEach(([x, y]) => { B.drum(x, y, 0, 0.3, 72, WALLW, {rings: 0}); B.custom(x, y, (g, P, k) => { const r2 = P(x, y, 68), rx = 0.3 * HTW * k * S2, col2 = dead(c) ? '#8A8090' : teamOf(L);
      g.fillStyle = col2; g.beginPath(); g.ellipse(r2[0], r2[1], rx, rx / 2, 0, 0, Math.PI); g.lineTo(r2[0] - rx, r2[1] - 6 * k); g.ellipse(r2[0], r2[1] - 6 * k, rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill();
      if(!dead(c)) K.AR.patPaint(g, (s, vv) => { const u = -1 + s / (rx * 2 / k) * 2; return [r2[0] + u * rx, r2[1] + Math.sqrt(Math.max(0, 1 - u * u)) * rx / 2 - vv * k]; }, rx * 2 / k, 6, patOf(L), inkOf(col2), k);
      const wq = P(x, y + 0.3, 44); g.fillStyle = SILVER; g.beginPath(); g.arc(wq[0], wq[1], 4 * k, 0, TAU); g.fill(); g.fillStyle = lightOf(c) ? '#FFF2B8' : '#3A4458'; g.beginPath(); g.arc(wq[0], wq[1], 2.6 * k, 0, TAU); g.fill();
      const b0 = P(x, y, 0); puff(g, b0[0] - rx * 0.6, b0[1] - 4 * k, 8 * k, c); puff(g, b0[0] + rx * 0.7, b0[1] - 2 * k, 7 * k, c); }, {layer: 1, zb: 0, top: 74});
    B.custom(x, y, (g, P, k) => { dome(g, P, k, x, y, 72, 0.34, dead(c) ? 10 : 22, dead(c) ? '#B8A880' : GOLD, {hi: '#FFF2B0'}); if(dead(c)) return; const q = P(x, y, 96); g.fillStyle = GOLD; g.beginPath(); D.star(g, q[0], q[1] - 2 * k, 3.4 * k, 1.4 * k, 4); g.fill(); }, {layer: 2, zb: 72, top: 100}); });
  B.custom(1.5, 0.42, (g, P, k) => { const a = P(0.36, 0.42, 92), b2 = P(2.64, 0.42, 92); rainbow(g, a, b2, (dead(c) ? 18 : 64) * k, 3.4 * k, c); }, {layer: 3, zb: 90, top: 140});
  B.custom(1.5, 1.0, (g, P, k, t) => { const q = P(1.5, 0.96, 52); g.strokeStyle = SILVERD; g.lineWidth = 2 * k; line(g, q, [q[0], q[1] - 22 * k]); sunDisc(g, q[0], q[1] - 34 * k, 12 * k, t, c); }, {layer: 3, zb: 52, top: 108, fx: false});
  halo(B, 1.5, 0.96, 86, 32, '#FFE58A', lightOf(c) * 0.38, {pulse: t => 0.86 + Math.sin(ph(t, 2.4)) * 0.1 + Math.cos(ph(t, 2.4)) * 0.05});
  banner(B, L, w, 'right', 0.66, 0.3, 6, 22, cloudEm);
  [0.36, 2.64].forEach(x => { if(!dead(c)) pennant(B, L, x, 0.42, 98, 14, {emblem: cloudEm, pole: SILVERD, layer: 3, w: 15, hh: 9}); });
});
/* ============================ 🏕️ CAMP — Puff Barracks (three puffy cloud tents in a ring, a weathervane, a little rain-cloud training dummy with a team target) ============================ */
CL('camp', {name: 'Puff Barracks', h: 72, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.box(0.06, 0.06, 0, 1.88, 1.88, 3, SILVER, {layer: -2});
  [[0.55, 0.55, 0.42, 30], [1.42, 0.6, 0.38, 26], [0.6, 1.38, 0.36, 24]].forEach(([x, y, r, h], i) => B.custom(x, y, (g, P, k) => { cloudMass(g, P, k, x, y, 3, r, h, c, {n: 7, rot: i}); const d = P(x, y + r * 0.85, 3); g.fillStyle = SKYD; g.beginPath(); g.moveTo(d[0] - 4 * k, d[1]); g.quadraticCurveTo(d[0], d[1] - 14 * k, d[0] + 4 * k, d[1]); g.closePath(); g.fill();
    const col = dead(c) ? '#8A8090' : teamOf(L); g.fillStyle = col; g.beginPath(); D.rr(g, d[0] - 6 * k, d[1] - 2 * k, 12 * k, 3 * k, 1.4 * k); g.fill(); }, {layer: 1, zb: 3, top: h + 6}));
  B.custom(1.45, 1.45, (g, P, k, t) => { const q = P(1.45, 1.45, 3), col = dead(c) ? '#8A8090' : teamOf(L), bob = c && c.still ? 0 : Math.sin(ph(t, 2.4)) * 1.4 + Math.cos(ph(t, 2.4)) * 0.6;   // 🌧️ the rain-cloud dummy with a target face
    g.strokeStyle = WOOD; g.lineWidth = 2.2 * k; line(g, q, [q[0], q[1] - 22 * k]); const cy = q[1] - 30 * k + bob * k; puff(g, q[0] - 7 * k, cy, 7 * k, c, STORM); puff(g, q[0] + 6 * k, cy + 1 * k, 6 * k, c, STORM); puff(g, q[0], cy - 5 * k, 8 * k, c, STORM);
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(q[0], cy - 2 * k, 5.4 * k, 0, TAU); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(q[0], cy - 2 * k, 3.6 * k, 0, TAU); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(q[0], cy - 2 * k, 1.6 * k, 0, TAU); g.fill();
    rainFall(g, q[0], cy + 6 * k, 12 * k, 14 * k, k, t, c, 4); }, {layer: 2, zb: 3, top: 46, fx: true});
  B.custom(1.7, 0.3, (g, P, k, t) => { const q = P(1.7, 0.3, 3); vane(g, q[0], q[1], 40, k, t, c); }, {layer: 3, zb: 3, top: 50, fx: true});
  pennant(B, L, 0.24, 1.76, 3, 50, {emblem: cloudEm, pole: SILVERD});
});
/* ============================ 🎠 RIDE — Rainbow Stable (a white stable with a sky-blue roof, a RAINBOW arching over it from cloud to cloud, a gold horseshoe sign, cloud hay) ============================ */
CL('ride', {name: 'Rainbow Stable', h: 104, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.box(0.06, 0.06, 0, 1.88, 2.88, 3, SILVER, {layer: -2});
  const s = B.box(0.3, 0.4, 3, 1.4, 2.0, 32, WALLW);
  B.decal(s, 'front', 0.5, 0.8, 0, 28, SKYD, {k: 'door', paint: skyDoor(28)});
  [0.6, 1.3].forEach(a => B.decal(s, 'right', a, 0.44, 12, 14, '#3A4458', {paint: (g, Q, k) => { const p0 = Q(0, 0), p1 = Q(1, 0), q0 = Q(0, 9), q1 = Q(1, 9), tp = Q(0.5, 14); g.fillStyle = SILVER; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(q0[0], q0[1]); g.quadraticCurveTo(q0[0], tp[1], tp[0], tp[1]); g.quadraticCurveTo(q1[0], tp[1], q1[0], q1[1]); g.lineTo(p1[0], p1[1]); g.closePath(); g.fill();
    g.fillStyle = '#3A4458'; const p2 = Q(0.14, 0), p3 = Q(0.86, 0), q2 = Q(0.14, 8), q3 = Q(0.86, 8), tp2 = Q(0.5, 12.5); g.beginPath(); g.moveTo(p2[0], p2[1]); g.lineTo(q2[0], q2[1]); g.quadraticCurveTo(q2[0], tp2[1], tp2[0], tp2[1]); g.quadraticCurveTo(q3[0], tp2[1], q3[0], q3[1]); g.lineTo(p3[0], p3[1]); g.closePath(); g.fill(); }}));
  trim(B, L, s, 28, 3);
  B.roof(0.22, 0.3, 35, 1.56, 2.2, 26, ROOF, {ridge: 'y', ov: 0.1, kind: 'gable'});
  B.custom(1, 1.4, (g, P, k) => { const a = P(0.12, 2.7, 0), b2 = P(1.88, 0.3, 0), lift = (dead(c) ? 30 : 96) * k; rainbow(g, a, b2, lift, 3.6 * k, c); puff(g, a[0], a[1] - 4 * k, 9 * k, c); puff(g, a[0] + 8 * k, a[1] - 1 * k, 6 * k, c); puff(g, b2[0], b2[1] - 4 * k, 9 * k, c); puff(g, b2[0] - 8 * k, b2[1] - 1 * k, 6 * k, c); }, {layer: 3, zb: 0, top: 100});
  B.custom(1, 2.42, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const q = P(1, 2.42, 50), br = dead(c); g.strokeStyle = br ? '#A89A80' : GOLD; g.lineWidth = 3.4 * k; g.lineCap = 'round'; g.beginPath(); g.arc(q[0], q[1], 7 * k, Math.PI * 0.15, Math.PI * 0.85, true); g.stroke();   // 🧲 a gold horseshoe sign
    g.fillStyle = '#FFFFFF'; [-0.6, 0, 0.6].forEach(a => { g.beginPath(); g.arc(q[0] + Math.sin(a) * 7 * k, q[1] - Math.cos(a) * 7 * k, 0.9 * k, 0, TAU); g.fill(); }); }, {layer: 3, zb: 40, top: 60});
  B.custom(1.62, 2.66, (g, P, k) => { const q = P(1.6, 2.68, 3); [[-4, 0], [4, 1], [0, -5]].forEach(([dx, dy]) => puff(g, q[0] + dx * k, q[1] + dy * k - 5 * k, 5.4 * k, c, '#FFF6D8')); g.strokeStyle = GOLD; g.lineWidth = 1.2 * k; g.beginPath(); D.ell(g, q[0], q[1] - 6 * k, 9 * k, 2.6 * k); g.stroke(); }, {layer: 3, zb: 3, top: 16});
  B.custom(1, 1.4, (g, P, k, t) => { if(dead(c) || (c && c.still)) return; const a2 = P(0.12, 2.7, 0), b2 = P(1.88, 0.3, 0), f = (t / 2.4) % 1, x = a2[0] + (b2[0] - a2[0]) * f, yb = a2[1] + (b2[1] - a2[1]) * f - Math.sin(f * Math.PI) * 88 * k, z = 1 + 0.3 * Math.cos(ph(t, 2.4));
    g.fillStyle = '#FFFFFF'; g.beginPath(); D.star(g, x, yb, 3.4 * z * k, 1.1 * z * k, 4); g.fill(); }, {layer: 4, zb: 0, top: 100, fx: true});
  banner(B, L, s, 'right', 0.06, 0.26, 6, 20, cloudEm);
  pennant(B, L, 1.0, 1.4, 61, 20, {emblem: cloudEm, pole: SILVERD});
});
/* ============================ 🪽 NEST — Windmill Perch (a white windmill with spinning sky-blue sails, a little perch deck with a birdhouse, clouds round the foot) ============================ */
CL('nest', {name: 'Windmill Perch', h: 124, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.box(0.06, 0.06, 0, 1.88, 1.88, 3, SILVER, {layer: -2});
  B.custom(1, 1, (g, P, k) => { frustum(g, P, k, 1, 1, 3, 0.56, 0.36, 66, dead(c) ? '#C8CCD4' : WALLW); const d = P(1, 1.56, 3); g.fillStyle = SKYD; g.beginPath(); g.moveTo(d[0] - 6 * k, d[1]); g.lineTo(d[0] - 6 * k, d[1] - 12 * k); g.quadraticCurveTo(d[0], d[1] - 20 * k, d[0] + 6 * k, d[1] - 12 * k); g.lineTo(d[0] + 6 * k, d[1]); g.closePath(); g.fill();
    const w0 = P(1, 1.4, 40); g.fillStyle = SILVER; g.beginPath(); g.arc(w0[0], w0[1], 3.6 * k, 0, TAU); g.fill(); g.fillStyle = lightOf(c) ? '#FFF2B8' : '#3A4458'; g.beginPath(); g.arc(w0[0], w0[1], 2.4 * k, 0, TAU); g.fill();
    const col = dead(c) ? '#8A8090' : teamOf(L), r2 = P(1, 1, 50), rx = 0.43 * HTW * k * S2; g.fillStyle = col; g.beginPath(); g.ellipse(r2[0], r2[1], rx, rx / 2, 0, 0, Math.PI); g.lineTo(r2[0] - rx, r2[1] - 6 * k); g.ellipse(r2[0], r2[1] - 6 * k, rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill();
    const b0 = P(1, 1, 3); puff(g, b0[0] - 22 * k, b0[1] - 3 * k, 9 * k, c); puff(g, b0[0] + 24 * k, b0[1] - 2 * k, 8 * k, c); puff(g, b0[0] - 10 * k, b0[1] + 4 * k, 7 * k, c); }, {layer: 1, zb: 3, top: 70});
  B.cone(1, 1, 69, 0.42, dead(c) ? 10 : 22, ROOF);
  B.custom(1, 1, (g, P, k, t) => { const hub = P(1, 1.4, 66), br = dead(c), a0 = br ? 0.5 : c && c.still ? 0.3 : (t / 2.4) * TAU / 4;   // 🌬️ the sails spin (a quarter turn a loop = 4-fold sails look the same at both ends)
    for(let i = 0; i < 4; i++){ if(br && i % 2) continue; const a = a0 + i * TAU / 4, cs = Math.cos(a), sn = Math.sin(a), L1 = 40 * k, ex = (x, y) => [hub[0] + x * 0.86, hub[1] + y]; const tip = ex(cs * L1, sn * L1);
      g.strokeStyle = WOODD; g.lineWidth = 2 * k; line(g, hub, tip); const nx = -sn, ny = cs, a1 = ex(cs * 10 * k, sn * 10 * k); g.fillStyle = br ? '#9AA8B8' : i % 2 ? SKY : '#FFFFFF';
      g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(tip[0], tip[1]); g.lineTo(tip[0] + nx * 8 * k * 0.86, tip[1] + ny * 8 * k); g.lineTo(a1[0] + nx * 7 * k * 0.86, a1[1] + ny * 7 * k); g.closePath(); g.fill(); g.strokeStyle = 'rgba(80,100,140,0.4)'; g.lineWidth = 0.8 * k; g.stroke(); }
    g.fillStyle = GOLD; g.beginPath(); g.arc(hub[0], hub[1], 3 * k, 0, TAU); g.fill(); }, {layer: 3, zb: 26, top: 110, fx: true});
  B.custom(1.62, 0.5, (g, P, k) => { const q = P(1.62, 0.48, 3), col = dead(c) ? '#8A8090' : teamOf(L); g.strokeStyle = WOODD; g.lineWidth = 2 * k; line(g, q, [q[0], q[1] - 30 * k]); g.fillStyle = WOOD; g.beginPath(); D.rr(g, q[0] - 9 * k, q[1] - 32 * k, 18 * k, 3 * k, 1.4 * k); g.fill();   // 🐦 perch + birdhouse
    g.fillStyle = col; g.beginPath(); D.rr(g, q[0] - 5 * k, q[1] - 43 * k, 10 * k, 11 * k, 1.6 * k); g.fill(); g.fillStyle = SKYD; g.beginPath(); g.moveTo(q[0] - 7 * k, q[1] - 42 * k); g.lineTo(q[0], q[1] - 49 * k); g.lineTo(q[0] + 7 * k, q[1] - 42 * k); g.closePath(); g.fill(); g.fillStyle = '#2A3448'; g.beginPath(); g.arc(q[0], q[1] - 38 * k, 2 * k, 0, TAU); g.fill(); }, {layer: 2, zb: 3, top: 52});
  pennant(B, L, 0.3, 0.3, 3, 52, {emblem: cloudEm, pole: SILVERD});
});
/* ============================ 🩹 CARE — Sunbeam Spa (a round warm golden pool, a big smiling SUN on a tall pole sending its rays, sun loungers + a heart sign) ============================ */
CL('care', {name: 'Sunbeam Spa', h: 100, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.box(0.06, 0.06, 0, 1.88, 1.88, 3, SILVER, {layer: -2});
  B.custom(1, 1, (g, P, k, t) => { const br = dead(c); frustum(g, P, k, 1.1, 1.1, 3, 0.72, 0.7, 10, br ? '#C8CCD4' : WALLW, {top: false}); const q = P(1.1, 1.1, 13), rx = 0.7 * HTW * k * S2;
    g.fillStyle = SILVER; g.beginPath(); D.ell(g, q[0], q[1], rx, rx / 2); g.fill(); g.fillStyle = br ? '#B8B0A0' : D.rad(g, q[0] - rx * 0.3, q[1] - rx * 0.12, 1, rx, [[0, '#FFF6C8'], [1, '#FFC24A']]); g.beginPath(); D.ell(g, q[0], q[1] + 1 * k, rx * 0.84, rx * 0.42); g.fill();
    if(!(br || (c && c.still))) for(let i = 0; i < 3; i++){ const f = ((t / 2.4) + i / 3) % 1; g.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - f)) + ')'; g.lineWidth = 0.9 * k; g.beginPath(); D.ell(g, q[0], q[1] + 1 * k, rx * (0.2 + f * 0.6), rx * (0.1 + f * 0.3)); g.stroke(); }
    if(!br) T.puffs(g, q[0] - rx * 0.3, q[1] - 2 * k, k, t, {col: 'rgba(255,255,255,0.6)', rise: 14, period: 2.4}); }, {layer: 1, zb: 3, top: 14});
  B.custom(0.4, 0.4, (g, P, k, t) => { const q = P(0.4, 0.4, 3); g.strokeStyle = SILVERD; g.lineWidth = 2.4 * k; line(g, q, [q[0], q[1] - 58 * k]); const sx = q[0], sy = q[1] - 72 * k;
    if(lightOf(c) && !(c && c.still)){ g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,220,120,0.22)'; const a = 0.9 + Math.sin(ph(t, 2.4)) * 0.08; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(a - 0.3) * 70 * k, sy + Math.sin(a - 0.3) * 70 * k); g.lineTo(sx + Math.cos(a + 0.3) * 70 * k, sy + Math.sin(a + 0.3) * 70 * k); g.closePath(); g.fill(); g.restore(); }
    sunDisc(g, sx, sy, 13 * k, t, c); }, {layer: 3, zb: 3, top: 96, fx: true});
  halo(B, 0.4, 0.4, 72, 26, '#FFD23F', lightOf(c) * 0.45, {pulse: t => 0.85 + Math.sin(ph(t, 2.4)) * 0.1 + Math.cos(ph(t, 2.4)) * 0.05});
  [[1.6, 1.78, 0], [0.5, 1.78, 1]].forEach(([x, y, i]) => B.custom(x, y, (g, P, k) => { const q = P(x, y, 3), col = i ? SKY : (dead(c) ? '#8A8090' : teamOf(L)); g.fillStyle = WOOD; g.fillRect(q[0] - 8 * k, q[1] - 3 * k, 16 * k, 1.6 * k); g.fillStyle = dim(c, col); g.beginPath(); g.moveTo(q[0] - 9 * k, q[1] - 4 * k); g.lineTo(q[0] + 4 * k, q[1] - 4 * k); g.lineTo(q[0] + 9 * k, q[1] - 11 * k); g.lineTo(q[0] + 6 * k, q[1] - 12 * k); g.lineTo(q[0] + 2 * k, q[1] - 6 * k); g.lineTo(q[0] - 9 * k, q[1] - 6 * k); g.closePath(); g.fill(); }, {layer: 3, zb: 3, top: 14}));
  B.custom(1.82, 0.3, (g, P, k) => { const q = P(1.82, 0.3, 3); g.fillStyle = SILVERD; g.fillRect(q[0] - 1.2 * k, q[1] - 36 * k, 2.4 * k, 36 * k); const br = dead(c), hx = q[0], hy = q[1] - 44 * k, r = 7 * k;
    g.fillStyle = br ? '#B8A0A8' : '#FF8AB0'; g.beginPath(); g.moveTo(hx, hy + r * 1.1); g.bezierCurveTo(hx - r * 1.6, hy - r * 0.1, hx - r * 0.8, hy - r * 1.2, hx, hy - r * 0.4); g.bezierCurveTo(hx + r * 0.8, hy - r * 1.2, hx + r * 1.6, hy - r * 0.1, hx, hy + r * 1.1); g.fill();
    g.fillStyle = '#FFFFFF'; g.fillRect(hx - 1.2 * k, hy - 3.6 * k, 2.4 * k, 6.4 * k); g.fillRect(hx - 3.2 * k, hy - 1.6 * k, 6.4 * k, 2.4 * k); }, {layer: 3, zb: 3, top: 54});
  pennant(B, L, 1.78, 1.2, 3, 46, {emblem: cloudEm, pole: SILVERD});
});
/* ============================ 🔧 WORKSHOP — Thunderhead Forge (a silver anvil on a stone plinth under a grumpy-cute STORM CLOUD on two poles, lightning crackling down, rain + a bellows) ============================ */
CL('workshop', {name: 'Thunderhead Forge', h: 104, live: {period: 1.2, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.box(0.06, 0.06, 0, 1.88, 1.88, 3, SILVER, {layer: -2});
  const pl = B.box(0.7, 0.7, 3, 0.62, 0.62, 12, '#C8CCD4'); ['front', 'right', 'left', 'back'].forEach(s => B.decal(pl, s, ...F(pl, s), 0, 12, '#C8CCD4', {paint: blocks(12, '#C8CCD4', 21, 6)})); trim(B, L, pl, 8, 2.4);
  B.box(0.84, 0.88, 15, 0.34, 0.26, 4, SILVERD); B.box(0.78, 0.84, 19, 0.46, 0.34, 6, SILVER);
  [[0.22, 0.22], [1.78, 1.78]].forEach(([x, y]) => B.box(x - 0.04, y - 0.04, 3, 0.08, 0.08, 70, SILVERD));
  B.custom(1, 1, (g, P, k, t) => { const br = dead(c), q = P(1, 1, 78), bob = c && c.still ? 0 : Math.sin(ph(t, 1.2)) * 1.2, cy = q[1] + bob * k;   // ⛈️ the thunderhead
    [[-22, 2, 12], [20, 3, 11], [-10, -8, 14], [8, -10, 15], [0, 4, 12], [-30, 8, 8], [30, 9, 8]].forEach(([dx, dy, r]) => puff(g, q[0] + dx * k, cy + dy * k, r * k, c, STORM));
    if(!br){ g.fillStyle = '#FFFFFF'; [-7, 7].forEach(dx => { g.beginPath(); g.arc(q[0] + dx * k, cy - 1 * k, 2.6 * k, 0, TAU); g.fill(); }); g.fillStyle = '#2A3448'; [-7, 7].forEach(dx => { g.beginPath(); g.arc(q[0] + dx * k + 0.6 * k, cy - 0.4 * k, 1.3 * k, 0, TAU); g.fill(); });
      g.strokeStyle = '#2A3448'; g.lineWidth = 1.2 * k; line(g, [q[0] - 10 * k, cy - 5 * k], [q[0] - 4 * k, cy - 3.6 * k]); line(g, [q[0] + 10 * k, cy - 5 * k], [q[0] + 4 * k, cy - 3.6 * k]); g.beginPath(); g.arc(q[0], cy + 6 * k, 2.4 * k, Math.PI + 0.4, -0.4); g.stroke(); }
    const an = P(1.01, 1.01, 25); rainFall(g, q[0], cy + 12 * k, 40 * k, an[1] - cy - 14 * k, k, t, c, 7);
    if(lightOf(c) === 1 && !(c && c.still)){ const on = Math.sin(ph(t, 1.2)) > 0.1; if(on){ g.strokeStyle = BOLT; g.lineWidth = 2.4 * k; g.lineJoin = 'round'; g.beginPath(); g.moveTo(q[0] + 2 * k, cy + 12 * k); g.lineTo(q[0] - 4 * k, cy + 26 * k); g.lineTo(q[0] + 3 * k, cy + 30 * k); g.lineTo(an[0], an[1] - 2 * k); g.stroke(); D.glow(g, an[0], an[1] - 2 * k, 12 * k, '#FFF2A0', 0.6); } } }, {layer: 3, zb: 58, top: 102, fx: true});
  halo(B, 1, 1, 30, 20, '#FFE14A', lightOf(c) * 0.35, {pulse: t => 0.8 + Math.sin(ph(t, 1.2)) * 0.15 + Math.cos(ph(t, 1.2)) * 0.05});
  B.custom(1.6, 1.62, (g, P, k) => { const q = P(1.62, 1.64, 3); g.fillStyle = WOOD; g.beginPath(); g.moveTo(q[0] - 10 * k, q[1] - 3 * k); g.lineTo(q[0] + 4 * k, q[1] - 9 * k); g.lineTo(q[0] + 4 * k, q[1] - 1 * k); g.closePath(); g.fill(); g.fillStyle = dim(c, '#B8504A'); g.beginPath(); D.ell(g, q[0] - 2 * k, q[1] - 5 * k, 7 * k, 3.4 * k, -0.4); g.fill(); g.fillStyle = SILVERD; g.fillRect(q[0] + 4 * k, q[1] - 6 * k, 6 * k, 2 * k); }, {layer: 3, zb: 3, top: 14});
  pennant(B, L, 1.78, 0.26, 3, 50, {emblem: cloudEm, pole: SILVERD});
});
/* ============================ 🗼 TOWER — Lightning-rod Tower (a slim silver lattice tower, a railed balcony, a copper rod on top with a little crackle · stand + aim) ============================ */
CL('tower', {name: 'Lightning-rod Tower', h: 136, stand: [0.5, 0.5, 80], aim: [0.5, 0.5, 98], live: {period: 1.2, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.drum(0.5, 0.5, 0, 0.4, 6, SILVER, {rings: 1});
  B.custom(0.5, 0.5, (g, P, k) => { frustum(g, P, k, 0.5, 0.5, 6, 0.3, 0.18, 68, dead(c) ? '#C8CCD4' : WALLW); const a = P(0.5, 0.5, 6), b2 = P(0.5, 0.5, 74), w0 = 0.3 * HTW * k * S2, w1 = 0.18 * HTW * k * S2;
    g.strokeStyle = SILVERD; g.lineWidth = 1 * k; for(let i = 0; i < 6; i++){ const f0 = i / 6, f1 = (i + 1) / 6, y0 = a[1] + (b2[1] - a[1]) * f0, y1 = a[1] + (b2[1] - a[1]) * f1, h0 = w0 + (w1 - w0) * f0, h1 = w0 + (w1 - w0) * f1; line(g, [a[0] - h0 * 0.8, y0 + h0 * 0.3], [a[0] + h1 * 0.8, y1 + h1 * 0.3]); line(g, [a[0] + h0 * 0.8, y0 + h0 * 0.3], [a[0] - h1 * 0.8, y1 + h1 * 0.3]); }
    const col = dead(c) ? '#8A8090' : teamOf(L), r2 = P(0.5, 0.5, 30), rx = 0.255 * HTW * k * S2; g.fillStyle = col; g.beginPath(); g.ellipse(r2[0], r2[1], rx, rx / 2, 0, 0, Math.PI); g.lineTo(r2[0] - rx, r2[1] - 6 * k); g.ellipse(r2[0], r2[1] - 6 * k, rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill(); }, {layer: 1, zb: 6, top: 74});
  B.drum(0.5, 0.5, 74, 0.46, 5, SILVER, {rings: 0});
  B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 77), rx = 0.46 * HTW * k * S2; if(dead(c)) return; g.strokeStyle = SILVERD; g.lineWidth = 1.3 * k; for(let i = 0; i <= 8; i++){ const a = i / 8 * Math.PI, x = q[0] + Math.cos(a) * rx * 0.96, y = q[1] + Math.sin(a) * rx * 0.48; line(g, [x, y - 2 * k], [x, y - 11 * k]); }
    g.beginPath(); g.ellipse(q[0], q[1] - 11 * k, rx * 0.96, rx * 0.48, 0, 0, Math.PI); g.stroke(); [0.25, 0.75].forEach(f => { const a = f * Math.PI; puff(g, q[0] + Math.cos(a) * rx * 1.1, q[1] + Math.sin(a) * rx * 0.55 + 2 * k, 5 * k, c); }); }, {layer: 3, zb: 74, top: 90});
  B.cone(0.5, 0.5, 79, 0.3, dead(c) ? 8 : 18, ROOF);
  B.custom(0.5, 0.5, (g, P, k, t) => { const q = P(0.5, 0.5, 97), br = dead(c); g.strokeStyle = '#C87A3A'; g.lineWidth = 2 * k; line(g, q, [q[0], q[1] - (br ? 8 : 30) * k]); if(br) return; g.fillStyle = '#E89A5A'; g.beginPath(); g.arc(q[0], q[1] - 30 * k, 2.4 * k, 0, TAU); g.fill();   // ⚡ the copper rod + a little crackle
    if(lightOf(c) === 1 && !(c && c.still)){ const s = 0.6 + 0.4 * Math.sin(ph(t, 1.2)) + 0.2 * Math.cos(ph(t, 1.2)); g.strokeStyle = BOLT; g.lineWidth = 1.2 * k; [-1, 1].forEach(sd => { g.beginPath(); g.moveTo(q[0], q[1] - 30 * k); g.lineTo(q[0] + sd * 4 * k * s, q[1] - 34 * k); g.lineTo(q[0] + sd * 2 * k, q[1] - 37 * k); g.lineTo(q[0] + sd * 6 * k * s, q[1] - 41 * k); g.stroke(); }); D.glow(g, q[0], q[1] - 30 * k, 8 * k, '#FFF2A0', 0.5 * s); } }, {layer: 4, zb: 97, top: 136, fx: true});
  pennant(B, L, 0.5, 0.5, 97, 22, {emblem: cloudEm, pole: SILVERD, layer: 4});
});
/* ============================ 🎨 WARDROBE — Fog Tailor (a silver rail of fluffy fog capes incl. the team one, a cloud-shaped mirror, a sky-blue striped awning) ============================ */
CL('wardrobe', {name: 'Fog Tailor', h: 78, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.box(0.06, 0.06, 0, 1.88, 0.88, 3, SILVER, {layer: -2});
  [[0.22, 0.3], [1.3, 0.3]].forEach(([x, y]) => B.box(x, y, 3, 0.06, 0.06, 42, SILVERD)); B.box(0.22, 0.3, 45, 1.14, 0.06, 2, SILVERD);
  awning(B, 'front', 0.6, 0.12, 1.42, 54, 0.22, 8, SKY, '#FFFFFF', 7, {cond: c, poles: SILVERD});
  B.custom(0.8, 0.34, (g, P, k, t) => { const br = dead(c), sw = c && c.still ? 0 : Math.sin(ph(t, 2.4)) * 1.4 + Math.cos(ph(t, 2.4)) * 0.6;   // 🧥 fog capes on hangers
    [0.18, 0.4, 0.62, 0.84].forEach((f, i) => { const a = P(0.26 + f * 1.06, 0.33, 46), col = br ? '#B8BCC4' : i === 1 ? teamOf(L) : ['#FFFFFF', 'x', '#DDEBFF', '#FFF0F6'][i]; g.strokeStyle = SILVERD; g.lineWidth = 0.9 * k; line(g, a, [a[0], a[1] + 3 * k]);
      g.fillStyle = col; g.beginPath(); g.moveTo(a[0] - 5 * k, a[1] + 4 * k); g.lineTo(a[0] + 5 * k, a[1] + 4 * k); g.quadraticCurveTo(a[0] + 8 * k + sw * k, a[1] + 18 * k, a[0] + 6 * k + sw * k, a[1] + 26 * k); g.lineTo(a[0] - 6 * k + sw * k, a[1] + 26 * k); g.quadraticCurveTo(a[0] - 8 * k + sw * k, a[1] + 18 * k, a[0] - 5 * k, a[1] + 4 * k); g.fill();
      if(!br){ puff(g, a[0] - 4 * k + sw * k, a[1] + 25 * k, 3.4 * k, c, i === 1 ? '#FFFFFF' : col); puff(g, a[0] + 1 * k + sw * k, a[1] + 26 * k, 3.4 * k, c, i === 1 ? '#FFFFFF' : col); puff(g, a[0] + 5 * k + sw * k, a[1] + 25 * k, 3 * k, c, i === 1 ? '#FFFFFF' : col); } }); }, {layer: 2, zb: 16, top: 46});
  B.custom(1.66, 0.5, (g, P, k) => { const q = P(1.66, 0.56, 3), br = dead(c); g.strokeStyle = SILVERD; g.lineWidth = 2 * k; line(g, q, [q[0], q[1] - 12 * k]);   // ☁️ the cloud mirror
    [[-7, -22, 7], [0, -27, 8.4], [7, -22, 7], [0, -18, 7]].forEach(([dx, dy, r]) => puff(g, q[0] + dx * k, q[1] + dy * k, r * k, c)); if(br) return;
    g.fillStyle = D.lin(g, q[0] - 6 * k, q[1] - 30 * k, q[0] + 6 * k, q[1] - 16 * k, [[0, '#E8F8FF'], [1, '#A8D0F0']]); g.beginPath(); D.ell(g, q[0], q[1] - 23 * k, 6.4 * k, 6 * k); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1 * k; line(g, [q[0] - 3 * k, q[1] - 26 * k], [q[0] + 1 * k, q[1] - 20 * k]); }, {layer: 3, zb: 3, top: 40});
  pennant(B, L, 1.84, 0.84, 3, 50, {emblem: cloudEm, pole: SILVERD});
});
/* ============================ 🔮 SPELL — Aurora Spire (a tall ice-crystal spire on a snowy plinth, aurora ribbons waving round it, sparkles) ============================ */
CL('spell', {name: 'Aurora Spire', h: 132, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.box(0.06, 0.06, 0, 1.88, 1.88, 3, SILVER, {layer: -2});
  B.drum(1, 1, 3, 0.7, 10, WALLW, {rings: 0}); B.drum(1, 1, 13, 0.56, 6, '#E6EEFA', {rings: 0});
  B.custom(1, 1, (g, P, k) => { const q = P(1, 1, 13), col = dead(c) ? '#8A8090' : teamOf(L), rx = 0.7 * HTW * k * S2, b0 = P(1, 1, 3); g.fillStyle = col; g.beginPath(); g.ellipse(b0[0], b0[1] - 2 * k, rx, rx / 2, 0, 0, Math.PI); g.lineTo(b0[0] - rx, b0[1] - 8 * k); g.ellipse(b0[0], b0[1] - 8 * k, rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill();
    if(!dead(c)) K.AR.patPaint(g, (s, vv) => { const u = -1 + s / (rx * 2 / k) * 2; return [b0[0] + u * rx, b0[1] - 2 * k + Math.sqrt(Math.max(0, 1 - u * u)) * rx / 2 - vv * k]; }, rx * 2 / k, 6, patOf(L), inkOf(col), k);
    g.fillStyle = '#FFFFFF'; [[-0.8, 2], [0.7, 3], [-0.2, 5]].forEach(([u, dy]) => { g.beginPath(); D.ell(g, b0[0] + u * rx, b0[1] + dy * k, 6 * k, 2.4 * k); g.fill(); }); }, {layer: 1, zb: 3, top: 14});
  B.custom(1, 1, (g, P, k) => { const q = P(1, 1, 19), br = dead(c), H = (br ? 30 : 92) * k, w = 15 * k, cols = ['#E8F8FF', '#BFE8FF', '#9AD8FF', '#D8ECFF', '#F2FAFF'];   // ❄️ the ice spire: a 5-facet prism
    for(let i = 0; i < 5; i++){ const u0 = -1 + i * 0.4, u1 = -1 + (i + 1) * 0.4, x0 = q[0] + u0 * w, x1 = q[0] + u1 * w, y0 = q[1] + Math.sqrt(1 - u0 * u0) * w * 0.35, y1 = q[1] + Math.sqrt(1 - u1 * u1) * w * 0.35, tip = [q[0], q[1] - H - w * 1.2];
      g.fillStyle = D.lin(g, x0, y0 - H, x1, y1, [[0, '#FFFFFF'], [1, D.sh(cols[i], (i - 2) * 0.06)]]); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y0 - H); if(!br) g.lineTo(tip[0], tip[1]); g.lineTo(x1, y1 - H); g.lineTo(x1, y1); g.closePath(); g.fill(); }
    if(br) return; [[-1, 0.4, 26], [1, 0.3, 32]].forEach(([sd, f, h]) => { const bx = q[0] + sd * w * 1.1, by = q[1] + 2 * k; g.fillStyle = sd < 0 ? '#D8F0FF' : '#B8E0FF'; g.beginPath(); g.moveTo(bx - 4 * k, by); g.lineTo(bx - 4 * k, by - h * k); g.lineTo(bx + sd * 2 * k, by - (h + 9) * k); g.lineTo(bx + 4 * k, by - h * k); g.lineTo(bx + 4 * k, by); g.closePath(); g.fill(); });
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.4 * k; line(g, [q[0] - w * 0.5, q[1] - H * 0.15], [q[0] - w * 0.5, q[1] - H * 0.85]); }, {layer: 2, zb: 19, top: 130});
  B.custom(1, 1, (g, P, k, t) => { if(dead(c)) return; const q = P(1, 1, 60), s = c && c.still ? 0 : 1;   // 🌌 aurora ribbons
    [['rgba(120,240,180,0.55)', 0, 1], ['rgba(170,140,255,0.5)', 1.6, -1], ['rgba(110,210,255,0.5)', 3.1, 1]].forEach(([col, off, dir], i) => { g.fillStyle = col; g.beginPath(); const N = 16, pts = [];
      for(let j = 0; j <= N; j++){ const f = j / N, a = off + f * Math.PI * 1.4 * dir + s * Math.sin(ph(t, 2.4)) * 0.2, x = q[0] + Math.cos(a) * 34 * k, y = q[1] - 24 * k + i * 16 * k + Math.sin(a) * 9 * k + s * Math.cos(ph(t, 2.4) + f * 4) * 2.4 * k; pts.push([x, y]); }
      pts.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for(let j = N; j >= 0; j--) g.lineTo(pts[j][0], pts[j][1] - (10 - Math.abs(j - N / 2) * 0.9) * k); g.closePath(); g.fill(); });
    for(let i = 0; i < 4; i++){ const a = i / 4 * TAU + Math.sin(ph(t, 2.4)) * 0.3, r = 26 * k * (0.8 + 0.2 * Math.cos(ph(t, 2.4) + i)), sz = (1.4 + 0.8 * Math.sin(ph(t, 2.4) + i * 1.7) + 0.5 * Math.cos(ph(t, 2.4) + i)) * k; g.fillStyle = '#FFFFFF'; g.beginPath(); D.star(g, q[0] + Math.cos(a) * r, q[1] - 40 * k + Math.sin(a) * r * 0.6, Math.max(0.5, sz * 1.6), Math.max(0.3, sz * 0.5), 4); g.fill(); } }, {layer: 4, zb: 40, top: 110, fx: true});
  pennant(B, L, 1.84, 0.2, 3, 56, {emblem: cloudEm, pole: SILVERD});
  snowy(B, 0.3, 1.66, c);
});
/* ============================ 🕵️ HIDEOUT — Fog Bank (a low rolling bank of grey-white fog with a round hatch, peeking eyes in the mist, a lost umbrella) ============================ */
CL('hideout', {name: 'Fog Bank', h: 56, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.custom(1, 1, (g, P, k, t) => { const s = c && c.still ? 0 : 1; cloudMass(g, P, k, 1, 0.95, 0, 0.98, 40, c, {n: 11, col: '#E4EAF4'}); const q = P(1, 1, 0);
    if(!dead(c)) [[-30, -8], [26, -12]].forEach(([dx, dy], i) => { g.fillStyle = 'rgba(240,244,252,0.7)'; g.beginPath(); g.arc(q[0] + dx * k + s * Math.sin(ph(t, 2.4) + i) * 3 * k, q[1] + dy * k, 8 * k, 0, TAU); g.fill(); }); }, {layer: 0, zb: 0, top: 46});
  B.custom(1, 1.7, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const d = P(1, 1.56, 0); g.fillStyle = SILVERD; g.beginPath(); D.ell(g, d[0], d[1] - 10 * k, 11 * k, 10 * k); g.fill(); g.fillStyle = '#2A3448'; g.beginPath(); D.ell(g, d[0], d[1] - 10 * k, 8.4 * k, 7.6 * k); g.fill();
    g.strokeStyle = SILVER; g.lineWidth = 1.2 * k; line(g, [d[0] - 8 * k, d[1] - 10 * k], [d[0] + 8 * k, d[1] - 10 * k]); line(g, [d[0], d[1] - 17 * k], [d[0], d[1] - 3 * k]);
    const bl = c && c.still ? 1 : (Math.sin(ph(t, 2.4) * 2) > 0.92 ? 0.2 : 1); if(!dead(c)) [[-22, -14], [18, -22], [26, -8]].forEach(([dx, dy], i) => { g.fillStyle = i === 1 ? '#FFE58A' : '#FFFFFF'; [-1.8, 1.8].forEach(e => { g.beginPath(); D.ell(g, d[0] + dx * k + e * k, d[1] + dy * k, 1.3 * k, 1.5 * k * bl); g.fill(); }); g.fillStyle = '#2A3448'; [-1.8, 1.8].forEach(e => { g.beginPath(); g.arc(d[0] + dx * k + e * k, d[1] + dy * k + 0.3 * k, 0.6 * k * bl, 0, TAU); g.fill(); }); });
    const col = dead(c) ? '#8A8090' : teamOf(L), mq = [P(0.66, 1.72, 0.4), P(1.34, 1.72, 0.4), P(1.34, 1.9, 0.4), P(0.66, 1.9, 0.4)]; polyP(g, mq); g.fillStyle = col; g.fill();
    if(!dead(c)){ g.save(); polyP(g, mq); g.clip(); K.AR.patPaint(g, (s, vv) => P(0.66 + s / 22, 1.9 - vv / 22, 0.4), 15, 4, patOf(L), inkOf(col), k); g.restore(); } }, {layer: 2, zb: 0, top: 30});
  B.custom(1.72, 1.4, (g, P, k) => { const q = P(1.74, 1.44, 0), br = dead(c); g.save(); g.translate(q[0], q[1] - 4 * k); g.rotate(-0.6); g.strokeStyle = WOODD; g.lineWidth = 1.4 * k; line(g, [0, 0], [0, -16 * k]); g.beginPath(); g.arc(1.6 * k, 0, 1.6 * k, Math.PI, 0, true); g.stroke();   // ☂️ a lost umbrella
    g.fillStyle = br ? '#9A90A0' : '#FF8AB0'; g.beginPath(); g.moveTo(-10 * k, -14 * k); g.quadraticCurveTo(0, -26 * k, 10 * k, -14 * k); g.quadraticCurveTo(5 * k, -16 * k, 3.4 * k, -14 * k); g.quadraticCurveTo(0, -16 * k, -3.4 * k, -14 * k); g.quadraticCurveTo(-5 * k, -16 * k, -10 * k, -14 * k); g.fill(); g.restore(); }, {layer: 3, zb: 0, top: 26});
  pennant(B, L, 1.7, 0.4, 0, 50, {emblem: cloudEm, pole: SILVERD});
});
/* ============================ 🐾 DEN — Weather-pet Roost (a cloud-tree: a silver trunk with a cloud canopy, little weather pets on its branches: a rain cloud · a sunny · a snowflake, a food bowl) ============================ */
CL('den', {name: 'Weather-pet Roost', h: 100, live: {period: 2.4, frames: 6}}, (B, v, L) => { const c = L.cond;
  B.box(0.06, 0.06, 0, 1.88, 1.88, 3, SILVER, {layer: -2});
  B.custom(1, 1, (g, P, k) => { const q = P(1, 1, 3), rx = 0.66 * HTW * k * S2; g.fillStyle = dim(c, '#FFFFFF', -0.06); g.beginPath(); D.ell(g, q[0], q[1], rx, rx / 2); g.fill(); for(let i = 0; i < 9; i++){ const a = i / 9 * TAU; g.fillStyle = 'rgba(200,215,240,0.6)'; g.beginPath(); g.arc(q[0] + Math.cos(a) * rx * 0.9, q[1] + Math.sin(a) * rx * 0.45, 3.4 * k, 0, TAU); g.fill(); } }, {layer: -7, zb: 3, top: 4});
  B.custom(1, 1, (g, P, k, t) => { const q = P(1, 1, 3), br = dead(c); g.strokeStyle = SILVERD; g.lineCap = 'round'; g.lineWidth = 6 * k; line(g, q, [q[0], q[1] - 40 * k]); g.lineWidth = 3 * k; line(g, [q[0], q[1] - 26 * k], [q[0] - 24 * k, q[1] - 34 * k]); line(g, [q[0], q[1] - 30 * k], [q[0] + 25 * k, q[1] - 38 * k]); line(g, [q[0], q[1] - 12 * k], [q[0] + 12 * k, q[1] - 10 * k]);
    const top = cloudMass(g, (x, y, z) => P(x, y, z), k, 1, 1, 40, 0.86, br ? 16 : 40, c, {n: 9}); if(br) return;
    const s = c && c.still ? 0 : 1, bob = i => s * (Math.sin(ph(t, 2.4) + i * 2) * 1.4 + Math.cos(ph(t, 2.4) + i) * 0.6) * k;
    const face = (x, y, r) => { g.fillStyle = '#2A3448'; [-1, 1].forEach(e => { g.beginPath(); g.arc(x + e * r * 0.32, y - r * 0.05, r * 0.12, 0, TAU); g.fill(); }); g.strokeStyle = '#2A3448'; g.lineWidth = Math.max(0.6, r * 0.1); g.beginPath(); g.arc(x, y + r * 0.12, r * 0.22, 0.3, Math.PI - 0.3); g.stroke(); };
    const p1 = [q[0] - 26 * k, q[1] - 40 * k + bob(0)]; puff(g, p1[0] - 6 * k, p1[1], 7 * k, c, '#9AA8C8'); puff(g, p1[0] + 6 * k, p1[1] + 1 * k, 6 * k, c, '#9AA8C8'); puff(g, p1[0], p1[1] - 4 * k, 8 * k, c, '#9AA8C8'); face(p1[0], p1[1] - 1 * k, 9 * k); rainFall(g, p1[0], p1[1] + 7 * k, 12 * k, 12 * k, k, t, c, 3);   // 🌧️ rain pet
    const p2 = [q[0] + 27 * k, q[1] - 44 * k + bob(1)]; sunDisc(g, p2[0], p2[1], 7.6 * k, t, c);   // ☀️ sunny pet
    const p3 = [q[0] + 12 * k, q[1] - 16 * k + bob(2)]; g.strokeStyle = '#9AD8FF'; g.lineWidth = 1.6 * k; for(let i = 0; i < 6; i++){ const a = i / 6 * TAU; line(g, p3, [p3[0] + Math.cos(a) * 9 * k, p3[1] + Math.sin(a) * 9 * k]); } g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(p3[0], p3[1], 5.4 * k, 0, TAU); g.fill(); face(p3[0], p3[1], 6 * k);   // ❄️ snowflake pet
  }, {layer: 2, zb: 3, top: 96, fx: false});
  B.custom(1.55, 1.6, (g, P, k) => { const q = P(1.55, 1.62, 3), col = dead(c) ? '#8A8090' : teamOf(L); g.fillStyle = col; g.beginPath(); g.ellipse(q[0], q[1] - 2 * k, 7 * k, 3 * k, 0, 0, Math.PI); g.lineTo(q[0] - 7 * k, q[1] - 4 * k); g.ellipse(q[0], q[1] - 4 * k, 7 * k, 2.6 * k, 0, Math.PI, 0, true); g.fill(); g.fillStyle = '#9AD8FF'; g.beginPath(); D.ell(g, q[0], q[1] - 4 * k, 5.4 * k, 1.8 * k); g.fill(); }, {layer: 3, zb: 3, top: 10});
  pennant(B, L, 1.8, 0.24, 3, 52, {emblem: cloudEm, pole: SILVERD});
});
/* ---------- 🟩 territory floor: soft cloud tiles — pale sky-blue with white puff bumps, a little rainbow arc now and then, raindrops + a sparkle ---------- */
addFloor('cloud', {name: 'Cloud puffs + little rainbows', top: '#EAF4FF', top2: '#E0EEFF', side: '#B8C8E4', paint: (g, q, s, i, j) => { const r = hash(i, j, 28), r2 = hash(j, i, 29);
  tileBase(g, q, s, '#EAF4FF', '#E2EEFC', r);
  [[0.28, 0.3, 0.2], [0.7, 0.32, 0.17], [0.3, 0.72, 0.17], [0.72, 0.7, 0.21], [0.5, 0.5, 0.15]].forEach(([u, v, rr], n) => { const p = q(u + (r - 0.5) * 0.06, v + (r2 - 0.5) * 0.06); g.fillStyle = D.rad(g, p[0] - 3 * s, p[1] - 2 * s, 0.5, rr * 40 * s, [[0, '#FFFFFF'], [1, 'rgba(255,255,255,0.15)']]); g.beginPath(); D.ell(g, p[0], p[1], rr * 40 * s, rr * 20 * s); g.fill(); });
  if(r2 > 0.92){ const a = q(0.25, 0.6), b = q(0.75, 0.6); for(let n = 0; n < 4; n++){ g.strokeStyle = RAIN[n + 1]; g.lineWidth = 1.4 * s; g.beginPath(); g.moveTo(a[0] + n * 1.3 * s, a[1]); g.bezierCurveTo(a[0] + n * 1.3 * s, a[1] - 12 * s + n * 1.3 * s, b[0] - n * 1.3 * s, b[1] - 12 * s + n * 1.3 * s, b[0] - n * 1.3 * s, b[1]); g.stroke(); } }
  if(r < 0.12){ const p = q(0.3 + r, 0.25 + r2 * 0.5); g.fillStyle = '#8FD3F4'; g.beginPath(); g.moveTo(p[0], p[1] - 4 * s); g.quadraticCurveTo(p[0] + 2.6 * s, p[1], p[0], p[1] + 1.6 * s); g.quadraticCurveTo(p[0] - 2.6 * s, p[1], p[0], p[1] - 4 * s); g.fill(); }
  if(r > 0.88){ const p = q(0.62, 0.22); g.fillStyle = 'rgba(255,230,120,0.95)'; g.beginPath(); D.star(g, p[0], p[1], 3.4 * s, 1.2 * s, 4); g.fill(); } }});
/* ---------- 💧☁️🌈 own resource shapes (1 × 1, states full · half · empty) — Props.AR.resKey('cloud', 'coin' | 'brick' | 'gem') ---------- */
// 💧 Raindrops: a wooden rain barrel under a little rain cloud that drips into it (half = lower water + a smaller cloud · empty = a dry barrel, no cloud)
function barrelPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = dead(c); g.save(); g.translate(x, y); g.scale(k * 1.3 * (v % 3 === 1 ? -1 : 1), k * 1.3);
  g.fillStyle = 'rgba(40,40,60,0.2)'; g.beginPath(); D.ell(g, 0, 1, 13, 4.6); g.fill();
  g.fillStyle = dim(c, WOOD); g.beginPath(); g.moveTo(-9, -16); g.quadraticCurveTo(-11, -8, -9, 0); g.quadraticCurveTo(0, 3, 9, 0); g.quadraticCurveTo(11, -8, 9, -16); g.closePath(); g.fill();
  g.strokeStyle = SILVERD; g.lineWidth = 1.4; [-13, -4].forEach(yy => { g.beginPath(); g.ellipse(0, yy, 10.2, 2.6, 0, 0, Math.PI); g.stroke(); }); g.strokeStyle = 'rgba(70,40,20,0.35)'; g.lineWidth = 0.7; [-4, 0, 4].forEach(xx => line(g, [xx, -15], [xx, 1]));
  g.fillStyle = dim(c, WOODD); g.beginPath(); D.ell(g, 0, -16, 9, 2.8); g.fill();
  if(st !== 'empty'){ g.fillStyle = br ? '#8A96A8' : D.rad(g, -2, -17, 0.5, 9, [[0, '#DFF6FF'], [1, '#5CB8EC']]); g.beginPath(); D.ell(g, 0, st === 'full' ? -16 : -15.4, 7.6, 2.2); g.fill();
    if(!br){ const sc = st === 'full' ? 1 : 0.75, cy = -30; [[-5, 0, 5], [4, 1, 4.4], [0, -3, 5.6]].forEach(([dx, dy, r]) => puff(g, dx * sc, cy + dy * sc, r * sc, c, '#B8C8E0')); g.fillStyle = '#2A3448'; [-1.6, 1.6].forEach(e => { g.beginPath(); g.arc(e * sc, cy - 0.5, 0.7 * sc, 0, TAU); g.fill(); });
      if(!(c && c.still)) for(let i = 0; i < 3; i++){ const f = ((t / 1.2) + i / 3) % 1; g.fillStyle = 'rgba(110,190,245,0.95)'; const dx = (i - 1) * 3.4 * sc, dy = cy + 5 + f * 10; g.beginPath(); g.moveTo(dx, dy - 2); g.quadraticCurveTo(dx + 1.4, dy + 0.6, dx, dy + 1.4); g.quadraticCurveTo(dx - 1.4, dy + 0.6, dx, dy - 2); g.fill(); } } }
  g.restore(); }
// ☁️ Cloud Puffs: soft cloud bales tied with gold rope, stacked (half = 2 bales · empty = one little wisp + a loose rope)
function balePaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = dead(c); g.save(); g.translate(x, y); g.scale(k * 1.3 * (v % 3 === 1 ? -1 : 1), k * 1.3);
  g.fillStyle = 'rgba(40,40,60,0.18)'; g.beginPath(); D.ell(g, 0, 1, 16, 5.6); g.fill();
  const bale = (bx, by, s) => { [[-5, 0, 6], [5, 0, 6], [0, -4, 7], [-2, 2, 5], [3, 2, 5]].forEach(([dx, dy, r]) => puff(g, bx + dx * s, by + dy * s, r * s, c)); g.strokeStyle = br ? '#A89A80' : GOLD; g.lineWidth = 1.4; g.beginPath(); g.ellipse(bx, by - 1 * s, 3 * s, 7 * s, 0, 0, TAU); g.stroke(); };
  if(st === 'empty'){ puff(g, -4, -3, 4, c); g.strokeStyle = br ? '#A89A80' : GOLD; g.lineWidth = 1.2; g.beginPath(); g.moveTo(2, 0); g.bezierCurveTo(6, -4, 10, 2, 13, -2); g.stroke(); g.restore(); return; }
  bale(-6, -5, 1); bale(7, -4, 0.9); if(st === 'full') bale(1, -15, 0.95);
  if(!br && !(c && c.still)){ const s = 1 + 0.4 * Math.sin(ph(t, 2.4)) + 0.2 * Math.cos(ph(t, 2.4)); g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); D.star(g, 11, -18, 2 * s, 0.7 * s, 4); g.fill(); }
  g.restore(); }
// 🌈 Rainbow Shards: crystal shards in rainbow colours growing out of a snowy rock (half = 3 shards · empty = stumps only)
function shardPaint(g, x, y, k, t, v, L, c){ const st = L.state || 'full', br = dead(c); g.save(); g.translate(x, y); g.scale(k * 1.3 * (v % 3 === 1 ? -1 : 1), k * 1.3);
  g.fillStyle = 'rgba(40,40,60,0.2)'; g.beginPath(); D.ell(g, 0, 1, 15, 5); g.fill();
  g.fillStyle = dim(c, '#9AA4B4'); g.beginPath(); g.moveTo(-14, 0); g.quadraticCurveTo(-14, -9, -5, -11); g.quadraticCurveTo(4, -14, 12, -8); g.quadraticCurveTo(15, -3, 13, 0); g.quadraticCurveTo(0, 3, -14, 0); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(-12, -6); g.quadraticCurveTo(-6, -13, 2, -12); g.quadraticCurveTo(10, -12, 12, -7); g.quadraticCurveTo(4, -8, -2, -7); g.quadraticCurveTo(-8, -5, -12, -6); g.fill();
  const order = v % 3 === 2 ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5], spots = [[-8, -8, 14, -0.35], [-3, -10, 22, -0.12], [2, -11, 26, 0.05], [7, -9, 19, 0.25], [11, -6, 12, 0.45], [-11, -5, 9, -0.55]];
  const n = st === 'full' ? 6 : st === 'half' ? 3 : 6; for(let i = 0; i < n; i++){ const [sx, sy, h0, a] = spots[i], h = st === 'empty' ? 3 : h0, col = br ? '#B8B4C0' : c ? D.sh(RAIN[order[i]], -0.15) : RAIN[order[i]]; g.save(); g.translate(sx, sy); g.rotate(a);
    g.fillStyle = col; g.beginPath(); g.moveTo(-2.4, 0); g.lineTo(-2.4, -h * 0.8); g.lineTo(0, -h); g.lineTo(2.4, -h * 0.8); g.lineTo(2.4, 0); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.moveTo(-2.4, -1); g.lineTo(-2.4, -h * 0.78); g.lineTo(0, -h * 0.96); g.lineTo(-0.6, -1); g.closePath(); g.fill(); g.restore(); }
  if(!br && st !== 'empty' && !(c && c.still)){ const s = 1 + 0.4 * Math.sin(ph(t, 2.4)) + 0.2 * Math.cos(ph(t, 2.4)); g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); D.star(g, 4, -30, 2.2 * s, 0.8 * s, 4); g.fill(); }
  g.restore(); }
const RES = (slot, name, h, tag, paint, live) => organic('cloud', 'cloud_' + slot, Object.assign({name, look: 'cloud', side: 'cloud', slot, kind: 'thing', foot: [1, 1], h, variants: 3, block: true, states: ['full', 'half', 'empty'], state: 'full', dead: 'keep',
  tags: ['ar', 'ar-res', 'resource', tag, 'ar-cloud'], conds: {'*': (g, x, y, k, t, v, c, L) => paint(g, x, y, k, t, v, L, c)}}, live ? {live, liveStates: ['full', 'half']} : {}), (g, x, y, k, t, v, L) => paint(g, x, y, k, t, v, L, null));
RES('coin', 'Rain barrel', 48, 'coin', barrelPaint, {period: 1.2, frames: 6}); RES('brick', 'Cloud bales', 40, 'brick', balePaint, {period: 2.4, frames: 6}); RES('gem', 'Rainbow shards', 44, 'gem', shardPaint, {period: 2.4, frames: 6});
/* ---------- 🧱 walls: ☁️ a cloud-bank wall (a silver rail base with a row of puffy clouds on top, team band) · posts = silver weathervane posts ·
   gate = two cloud pillars under a SUNBURST arch over sky-blue doors · 🏯 tall = a white cloud-stone rampart with puffs on top + round towers with gold domes + a ⚡ storm-cloud gatehouse ---------- */
(function(){ const {wallProp, gateProp, gateDoors, longFaces, tallWallProp, tallGateProp} = K.AR;
  const skin = {name: 'Cloud-bank wall', gateName: 'Sunburst gate', h: 46, gateH: 96,
    seg(B, L, r, c, v){ const [x, y, w, d, ax] = r, H = 12, br = dead(c), b = B.box(x, y, 0, w, d, H, SILVER);
      ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, H, SILVER, {paint: (g, Q, k) => { g.strokeStyle = SILVERD; g.lineWidth = 0.8 * k; line(g, Q(0, 3), Q(1, 3)); line(g, Q(0, 9), Q(1, 9)); }}));
      trim(B, L, b, 4, 2.6, longFaces(ax));
      const len = ax === 'x' ? w : d, n = Math.max(1, Math.round(len / 0.22));
      B.custom(x + w / 2, y + d / 2, (g, P, k) => { for(let i = 0; i < n; i++){ if(br && i % 2) continue; const f = (i + 0.5) / n, px = ax === 'x' ? x + w * f : x + w / 2, py = ax === 'x' ? y + d / 2 : y + d * f, a = P(px, py, H); const rr = (br ? 5 : 8 + (i % 2) * 2) * k; puff(g, a[0], a[1] - rr * 0.6, rr, c); puff(g, a[0] + rr * 0.7, a[1] - rr * 0.2, rr * 0.7, c); } }, {layer: 1, zb: H, top: H + 22}); },
    post(B, L, kind, c){ const br = dead(c); B.drum(0.5, 0.5, 0, 0.2, 4, SILVER); B.drum(0.5, 0.5, 4, 0.1, br ? 12 : 26, SILVER, {rings: 0});
      B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 4), rx = 0.1 * HTW * k * S2, col = br ? '#8A8090' : teamOf(L); g.fillStyle = col; g.beginPath(); g.ellipse(q[0], q[1] - 6 * k, rx, rx / 2, 0, 0, Math.PI); g.lineTo(q[0] - rx, q[1] - 11 * k); g.ellipse(q[0], q[1] - 11 * k, rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill(); }, {layer: 1, zb: 4, top: 16});
      if(!br) B.custom(0.5, 0.5, (g, P, k, t) => { const q = P(0.5, 0.5, 30); if(kind === 'end' || kind === 'solo') vane(g, q[0], q[1], 14, k, t, c); else { puff(g, q[0], q[1] - 4 * k, 6 * k, c); puff(g, q[0] + 5 * k, q[1] - 1 * k, 4 * k, c); } }, {layer: 3, zb: 30, top: 46}); },
    gate(B, L, open, c, v){ const t = 0.18, H = 46, br = dead(c);
      [[0.02, 0.24], [0.74, 0.24]].forEach(([x0, w]) => { const pb = B.box(x0, 0.5 - t, 0, w, 2 * t, H, WALLW); trim(B, L, pb, 34, 3); B.box(x0 - 0.02, 0.5 - t - 0.02, H, w + 0.04, 2 * t + 0.04, 3, SILVER);
        if(!br) B.custom(x0 + w / 2, 0.5, (g, P, k) => { const q = P(x0 + w / 2, 0.5, H + 3); puff(g, q[0] - 3 * k, q[1] - 4 * k, 7 * k, c); puff(g, q[0] + 4 * k, q[1] - 2 * k, 6 * k, c); puff(g, q[0], q[1] - 9 * k, 6 * k, c); }, {layer: 3, zb: H + 3, top: H + 20}); });
      gateDoors(B, open, c, 32, SKYD, SILVER, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 0.9 * k; for(let u = 0.25; u < 1; u += 0.25) line(g, Q(u, 1), Q(u, 31)); const q = Q(0.5, 20); cloudEm(g, q[0], q[1], 3 * k, '#FFFFFF'); }});
      B.custom(0.5, 0.5, (g, P, k, t2) => { const m = P(0.5, 0.5, 56); if(br){ g.fillStyle = '#A89A80'; g.beginPath(); g.arc(m[0] - 8 * k, m[1] + 4 * k, 7 * k, 0, TAU); g.fill(); return; } sunDisc(g, m[0], m[1] + 4 * k, 13 * k, t2 || 0, c); }, {layer: 2, zb: 46, top: 96});
      if(!br) [[0.14], [0.86]].forEach(([x]) => pennant(B, L, x, 0.5, 54, 16, {w: 11, hh: 7, emblem: cloudEm, pole: SILVERD})); } };
  wallProp('cloud', 'cloud', skin); gateProp('cloud', 'cloud', skin);
  const tall = {name: 'Cloud-stone rampart', gateName: 'Storm-cloud gatehouse', base: 30, h: 120, gateH: 126,
    rampart(B, L, r, c, hb){ const [x, y, w, d, ax] = r, e = 0.08, b = ax === 'x' ? B.box(x, y - e, 0, w, d + 2 * e, hb, WALLW) : B.box(x - e, y, 0, w + 2 * e, d, hb, WALLW);
      ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, hb, WALLW, {paint: blocks(hb, '#E8EEF8', 31 + Math.round((x + y) * 10), 10)}));
      if(!dead(c)){ const len = ax === 'x' ? w : d, n = Math.max(1, Math.round(len / 0.3)); B.custom(x + w / 2, y + d / 2, (g, P, k) => { for(let i = 0; i < n; i++){ const f = (i + 0.5) / n, a = P(ax === 'x' ? x + w * f : x + w / 2, ax === 'x' ? y + d / 2 : y + d * f, hb); puff(g, a[0], a[1] - 4 * k, 8 * k, c); } }, {layer: 2, zb: hb, top: hb + 12}); } },
    tower(B, L, c, cx, cy, hb, kind, hw){ const br = dead(c), H = hb + (kind === 'gate' ? 30 : 38); B.drum(cx, cy, 0, hw * 1.05, br ? H - 14 : H, WALLW, {rings: 0});
      B.custom(cx, cy, (g, P, k) => { const rx = hw * 1.05 * HTW * k * S2, b0 = P(cx, cy, (br ? H - 14 : H) - 7), col = br ? '#8A8090' : teamOf(L); g.fillStyle = col; g.beginPath(); g.ellipse(b0[0], b0[1], rx, rx / 2, 0, 0, Math.PI); g.lineTo(b0[0] - rx, b0[1] - 5 * k); g.ellipse(b0[0], b0[1] - 5 * k, rx, rx / 2, 0, Math.PI, 0, true); g.closePath(); g.fill();
        const w0 = P(cx, cy + hw * 1.05, hb + 8); g.fillStyle = SILVER; g.beginPath(); g.arc(w0[0], w0[1], 3 * k, 0, TAU); g.fill(); g.fillStyle = lightOf(c) ? '#FFF2B8' : '#3A4458'; g.beginPath(); g.arc(w0[0], w0[1], 2 * k, 0, TAU); g.fill(); }, {layer: 2, zb: hb, top: H});
      if(br) return; B.custom(cx, cy, (g, P, k) => { dome(g, P, k, cx, cy, H, hw * 1.2, kind === 'gate' ? 14 : 18, GOLD, {hi: '#FFF2B0'}); }, {layer: 2, zb: H, top: H + 18});
      pennant(B, L, cx, cy, H + (kind === 'gate' ? 14 : 18), kind === 'gate' ? 12 : 16, {w: 11, hh: 7, emblem: cloudEm, pole: SILVERD}); },
    gatehouse(B, L, open, c, hb){ const br = dead(c), z0 = 44, t = 0.18;
      gateDoors(B, open, c, 40, SKYD, SILVER, {paint: (g, Q, k) => { g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 0.9 * k; for(let z = 4; z < 38; z += 5) line(g, Q(0.08, z), Q(0.92, z)); }});
      const b = B.box(0.26, 0.5 - t, z0, 0.48, 2 * t, br ? 6 : 16, WALLW); if(br) return; trim(B, L, b, 8, 3, ['front', 'back']); B.box(0.24, 0.5 - t - 0.02, z0 + 16, 0.52, 2 * t + 0.04, 3, SILVER);
      B.custom(0.5, 0.5, (g, P, k, t2) => { const q = P(0.5, 0.5, z0 + 34), on = Math.sin(ph(t2 || 0, 1.2)) > -0.2;   // ⛈️ a storm cloud with a big lightning bolt
        [[-14, 2, 9], [13, 3, 8], [-5, -6, 11], [6, -7, 10], [0, 4, 9]].forEach(([dx, dy, r]) => puff(g, q[0] + dx * k, q[1] + dy * k, r * k, c, STORM)); bolt(g, q[0], q[1] + 16 * k, 1.5 * k, on ? BOLT : '#E8C840'); }, {layer: 3, zb: z0 + 19, top: z0 + 64});
      B.custom(0.5, 0.5, (g, P, k, t2) => { const q = P(0.5, 0.5, z0 + 34); if(Math.sin(ph(t2 || 0, 1.2)) > -0.2) D.glow(g, q[0], q[1] + 14 * k, 14 * k, '#FFF2A0', 0.45); }, {layer: 4, zb: z0 + 19, top: z0 + 64, fx: true}); } };
  tallWallProp('cloud', 'cloud', skin, tall); tallGateProp('cloud', 'cloud', skin, tall);
})();
})();
K.loaded('cloud', 'ip-4e');
})(window.Props && window.Props._K);
