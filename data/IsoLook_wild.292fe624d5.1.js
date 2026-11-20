
/* 🌍 IsoLook_wild — 🐾 Wild Realm — AvataRealm dens · boss lair · relics · drops · path marks · boss egg + fight ring / beam / shield painters (needs realm) — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['wild'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/wild.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_wild: include IsoProps first'); return; }
if(!K.AR){ console.warn('IsoLook_wild: load IsoLook_realm first (Props.need does it)'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🐾 wild · AvataRealm's WILD REALM pieces (AR-7 pictures, 🌳 IsoProps chat 2026-11-18, AvataRealm plan §17).
   Builds ON realm (team colours, patterns, pennants). Nothing here draws a creature — creatures + bosses are 🐾 CreatureKit units the game draws.
     🕳️ wild_den      2 × 2 creature den (door = the cave mouth)  states sleep · awake · empty · claimed (a 🚩 team totem)
     👑 wild_lair     3 × 3 boss lair / arena (walk-on)          states sleep · awake · beaten
     🏺 wild_relic    1 × 1 relic stand next to the 🏠 House      states empty · gold · silver · bronze   v 0 🐉 heart · 1 🦣 tusk · 2 🔥 feather
     ✨ wild_drop     1 × 1 a DROPPED relic (walk-on)             states gold · silver · bronze           v = relic kind
     ⚠️ wild_warn     1 × 1 boss-path mark (walk-on, flat)        states path · stomp   (turn = which way the path points)
     🥚 wild_egg      1 × 1 boss egg (🥇 prize)                   states whole · crack · hatched
   SKIN = the map look under it: jungle (+ raptor · lava · grow) · coral · moon (+ bolt) · anything else = old stone ruin; force one with {pal: {skin: 'coral'}}.
   Overlays the game paints itself (not props): Props.AR.WILD.fightRing · beam · shield (proposals — final names at the AR-7 build). */
(function(){
'use strict';
const {vis, line, polyP, ph, lightOf, halo, puffs, bubbles} = T;
const D = PD, TAU = Math.PI * 2, S2 = Math.SQRT2, A = K.AR;
addSet('wild', {name: 'Wild', icon: '🐾', accent: '#B07CFF'});
/* ---------- 🎨 skins: one per AvataRealm map look ---------- */
const SKIN = {
  jungle: {k: 'jungle', name: 'Vine cave', rock: '#86796A', rock2: '#9C8E7C', moss: '#6DB247', floor: '#5C4632', rim: '#7A6A58', glow: '#FF8A2A', eye: '#FFD23A', mouth: '#1E1712', egg: ['#CFE59A', '#6E9A3A']},
  coral: {k: 'coral', name: 'Coral grotto', rock: '#E8907A', rock2: '#F2AE96', moss: '#FFC861', floor: '#EAD7A8', rim: '#D98A6E', glow: '#FF6FB5', eye: '#7CF6FF', mouth: '#16324C', egg: ['#FFE4EE', '#E58AB0']},
  moon: {k: 'moon', name: 'Crater burrow', rock: '#8E8EA0', rock2: '#A8A8BA', moss: '#7FE8FF', floor: '#4E4E62', rim: '#6C6C80', glow: '#B07CFF', eye: '#9BFF6A', mouth: '#0E0E1E', egg: ['#D8CCFF', '#6A4AC8']},
  stone: {k: 'stone', name: 'Old ruin', rock: '#A8A090', rock2: '#BEB6A6', moss: '#7FA65A', floor: '#6A5E50', rim: '#8E8676', glow: '#FFC93C', eye: '#FF5A4A', mouth: '#1A1614', egg: ['#FFF0C0', '#C9962A']}};
const BYLOOK = {jungle: 'jungle', raptor: 'jungle', lava: 'jungle', grow: 'jungle', coral: 'coral', moon: 'moon', bolt: 'moon'};
const skinOf = L => SKIN[(L && L.skin) || BYLOOK[L && L.key] || 'stone'] || SKIN.stone;
/* ---------- small painters ---------- */
// a rock lobe (screen ellipse at a model point) lit from the upper left like every tile
function lobe(g, q, rx, ry, col, k){ g.fillStyle = D.rad(g, q[0] - rx * 0.35 * k, q[1] - ry * 0.55 * k, 1, Math.max(rx, ry) * 1.7 * k, [[0, D.sh(col, 0.26)], [0.55, col], [1, D.sh(col, -0.32)]]);
  g.beginPath(); D.ell(g, q[0], q[1], rx * k, ry * k); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.22)'; g.lineWidth = 0.9 * k; g.stroke(); }
const mossCap = (g, q, rx, ry, col, k) => { g.save(); g.beginPath(); D.ell(g, q[0], q[1], rx * k, ry * k); g.clip(); g.fillStyle = col; g.beginPath();
  for(let i = 0; i <= 10; i++){ const u = -1 + i / 5, y = q[1] - ry * k * 0.2 + Math.sin(i * 1.9) * ry * 0.18 * k; i ? g.lineTo(q[0] + u * rx * k, y) : g.moveTo(q[0] + u * rx * k, y); } g.lineTo(q[0] + rx * k, q[1] - ry * k); g.lineTo(q[0] - rx * k, q[1] - ry * k); g.closePath(); g.fill(); g.restore(); };
function zee(g, x, y, s, col, a){ g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(42,28,20,0.55)'; g.lineWidth = s * 0.5; g.lineJoin = 'round'; g.lineCap = 'round';
  const path = () => { g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y - s); g.lineTo(x - s, y + s); g.lineTo(x + s, y + s); }; path(); g.stroke(); g.strokeStyle = col; g.lineWidth = s * 0.28; path(); g.stroke(); g.restore(); }
function eyes(g, x, y, k, col, blink, w){ const h = (blink ? 0.35 : 1) * 2.4 * k; [-1, 1].forEach(sx => { const ex = x + sx * (w || 5) * k; D.glow(g, ex, y, 7 * k, col, 0.6);
  g.fillStyle = col; g.beginPath(); D.ell(g, ex, y, 2.6 * k, h, sx * 0.25); g.fill(); g.fillStyle = '#1A0E0A'; g.beginPath(); D.ell(g, ex + sx * 0.3 * k, y, 0.8 * k, h * 0.8); g.fill(); }); }
function bone(g, x, y, len, ang, k, col){ g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = col || '#F2EBDA'; g.strokeStyle = 'rgba(42,28,20,0.45)'; g.lineWidth = 0.8 * k;
  g.beginPath(); g.rect(-len / 2 * k, -1.1 * k, len * k, 2.2 * k); g.fill(); g.stroke(); [-1, 1].forEach(s => [-1, 1].forEach(t2 => { g.beginPath(); g.arc(s * len / 2 * k, t2 * 1.4 * k, 1.5 * k, 0, TAU); g.fill(); g.stroke(); })); g.restore(); }
function vine(g, x, y, len, k, t, col, still){ const sw = still ? 0 : Math.sin(ph(t, 2)) * 1.2 + Math.cos(ph(t, 2)) * 0.5; g.strokeStyle = D.sh(col, -0.25); g.lineWidth = 1.4 * k; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (2 + sw) * k, y + len * 0.5 * k, x + sw * 1.5 * k, y + len * k); g.stroke(); g.fillStyle = col;
  for(let i = 1; i <= 3; i++){ const f = i / 3.4, lx = x + (sw * f * 1.5 + (i % 2 ? 2.4 : -2.4)) * k, ly = y + len * f * k; g.beginPath(); D.ell(g, lx, ly, 2.4 * k, 1.3 * k, i % 2 ? 0.5 : -0.5); g.fill(); } }
function crystal(g, x, y, w, h, lean, col, k, lv){ const tip = [x + lean * h * k, y - h * k], hw = w / 2 * k; g.fillStyle = D.sh(col, -0.3);
  g.beginPath(); g.moveTo(x - hw, y); g.lineTo(x - hw + lean * h * 0.8 * k, y - h * 0.78 * k); g.lineTo(tip[0], tip[1]); g.lineTo(x, y + 1 * k); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(x, y + 1 * k); g.lineTo(tip[0], tip[1]); g.lineTo(x + hw + lean * h * 0.8 * k, y - h * 0.76 * k); g.lineTo(x + hw, y); g.closePath(); g.fill();
  if(lv){ g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.moveTo(x + hw * 0.2, y - h * 0.15 * k); g.lineTo(x + hw * 0.2 + lean * h * 0.7 * k, y - h * 0.7 * k); g.lineTo(x + hw * 0.5 + lean * h * 0.7 * k, y - h * 0.68 * k); g.lineTo(x + hw * 0.5, y - h * 0.12 * k); g.closePath(); g.fill(); } }
function coralTree(g, x, y, s, col, k){ g.strokeStyle = col; g.lineCap = 'round'; const br = (x0, y0, a, L, w, n) => { const x1 = x0 + Math.sin(a) * L * k, y1 = y0 - Math.cos(a) * L * k; g.lineWidth = w * k; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    if(n > 0){ br(x1, y1, a - 0.5, L * 0.68, w * 0.72, n - 1); br(x1, y1, a + 0.45, L * 0.62, w * 0.72, n - 1); } else { g.fillStyle = D.sh(col, 0.25); g.beginPath(); g.arc(x1, y1, w * 0.75 * k, 0, TAU); g.fill(); } };
  br(x, y, -0.15, 9 * s, 3.2 * s, 2); }
function kelp(g, x, y, len, k, t, col, still){ const sw = still ? 0 : Math.sin(ph(t, 2)) * 2 + Math.cos(ph(t, 2)) * 0.8; g.fillStyle = col; g.strokeStyle = D.sh(col, -0.3); g.lineWidth = 0.8 * k;
  g.beginPath(); g.moveTo(x - 2 * k, y); g.bezierCurveTo(x - 4 * k + sw * k * 0.5, y - len * 0.4 * k, x + 3 * k + sw * k, y - len * 0.7 * k, x + sw * 1.4 * k, y - len * k);
  g.bezierCurveTo(x + 5 * k + sw * k, y - len * 0.7 * k, x + 2 * k + sw * k * 0.5, y - len * 0.4 * k, x + 2 * k, y); g.closePath(); g.fill(); g.stroke(); }
function fern(g, x, y, k, col){ g.strokeStyle = col; g.lineWidth = 1.3 * k; g.lineCap = 'round'; [-0.9, -0.35, 0.25, 0.85].forEach(a => { const L = 9 + Math.abs(a) * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.sin(a) * L * 0.6 * k, y - L * k, x + Math.sin(a) * L * k, y - L * 0.55 * k); g.stroke(); }); }
/* ---------- 🕳️ DEN (2 × 2): a rock mound with a cave mouth on the front (+y) ---------- */
const DEN_BACK = [[0.55, 0.5, 26, 24, 20], [1.45, 0.42, 30, 26, 22], [1.62, 1.05, 22, 22, 19], [0.4, 1.1, 18, 20, 17], [1.0, 0.85, 44, 34, 24]];
(function(){ const def = add('wild', 'wild_den', {name: 'Creature den', kind: 'building', foot: [2, 2], door: [1, 2], h: 80, variants: 1, states: ['sleep', 'awake', 'empty', 'claimed'], state: 'sleep',
    side: 'wild', slot: 'den', tags: ['ar', 'ar-wild', 'den', 'lair', 'creature'], live: {period: 2, frames: 6}});
  def.build = (B, v, L) => { const S = skinOf(L), c = L.cond, br = c && c.broken, lv = lightOf(c), st = L.state || 'sleep', still = c && c.still, R = rnd(41 + v * 13);
    const rock = (i) => i % 2 ? S.rock2 : S.rock;
    // ground in front of the mouth: a worn dirt / sand / dust patch + litter
    B.custom(1, 1.6, (g, P, k) => { const q = P(1, 1.95, 0); g.fillStyle = D.sh(S.floor, 0.12); g.beginPath(); D.ell(g, q[0], q[1], 25 * k, 9 * k); g.fill();
      if(st !== 'claimed' || br){ [[0.7, 2.0, 7, 0.4], [1.3, 2.05, 6, -0.7]].forEach(([x, y, l, a], i) => { if(S.k === 'coral' && i) return; const p = P(x, y, 0); bone(g, p[0], p[1], l, a, k, S.k === 'moon' ? '#CFD2E4' : '#F2EBDA'); }); }
      if(S.k === 'moon') for(let i = 0; i < 4; i++){ const p = P(0.75 + i * 0.16, 1.82 + (i % 2) * 0.12, 0); g.fillStyle = 'rgba(30,30,50,0.4)'; g.beginPath(); D.ell(g, p[0], p[1], 2.4 * k, 1.2 * k); g.fill(); } }, {layer: -5, zb: 0, top: 1});
    // back mass
    B.custom(0.9, 0.6, (g, P, k, t) => { DEN_BACK.forEach(([x, y, z, rx, ry], i) => { const zz = br && i === 4 ? z * 0.55 : z; const q = P(x, y, zz); lobe(g, q, rx, ry, rock(i), k);
        if(S.k === 'jungle' && !br) mossCap(g, q, rx, ry, c ? '#9AA25A' : S.moss, k);
        if(S.k === 'moon'){ g.fillStyle = 'rgba(40,40,60,0.28)'; [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.14], [0.05, -0.45, 0.1]].forEach(([u, w, r]) => { g.beginPath(); D.ell(g, q[0] + u * rx * k, q[1] + w * ry * k, r * rx * k, r * rx * 0.55 * k); g.fill(); }); }
        if(S.k === 'coral'){ g.fillStyle = 'rgba(120,40,30,0.25)'; for(let n = 0; n < 6; n++){ g.beginPath(); g.arc(q[0] + (R() - 0.5) * rx * 1.3 * k, q[1] + (R() - 0.5) * ry * 1.1 * k, 1.1 * k, 0, TAU); g.fill(); } }
        if(S.k === 'stone'){ g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.9 * k; line(g, [q[0] - rx * 0.8 * k, q[1]], [q[0] + rx * 0.8 * k, q[1]]); line(g, [q[0] - rx * 0.1 * k, q[1] - ry * 0.9 * k], [q[0] - rx * 0.1 * k, q[1]]); } });
      if(br) return; const top = P(1.0, 0.85, 24 + 34);
      if(S.k === 'coral'){ coralTree(g, top[0] - 14 * k, top[1] + 6 * k, 1.1, c ? '#D9B0A0' : '#FF7A5A', k); coralTree(g, top[0] + 12 * k, top[1] + 8 * k, 0.85, c ? '#E0C8A0' : '#FFB347', k); }
      if(S.k === 'moon'){ crystal(g, top[0] - 10 * k, top[1] + 10 * k, 7, 20, -0.25, c ? '#9AA6B0' : S.moss, k, lv); crystal(g, top[0] + 6 * k, top[1] + 8 * k, 6, 15, 0.3, c ? '#A0A0B8' : '#B9A4FF', k, lv); }
      if(S.k === 'jungle'){ fern(g, top[0] - 8 * k, top[1] + 4 * k, k, c ? '#9A9A50' : '#4C9A34'); fern(g, top[0] + 10 * k, top[1] + 6 * k, k, c ? '#8A8A48' : '#5DBB46'); }
      if(S.k === 'stone'){ g.fillStyle = c ? '#8A8A5A' : '#6E9A48'; for(let n = 0; n < 9; n++){ g.beginPath(); D.ell(g, top[0] + (n - 4) * 4 * k, top[1] + (8 + Math.abs(n - 4) * 2.4) * k, 3 * k, 2 * k, n * 0.4); g.fill(); } } }, {zb: 0, top: 72});
    // the cave mouth on the front (turned away → just more rock)
    B.custom(1, 1.8, (g, P, k, t, T2) => {
      if(!vis(T2, 0, 1)){ lobe(g, P(1, 1.6, 16), 34, 20, S.rock, k); return; }
      const a = P(0.52, 1.93, 0), b = P(1.48, 1.93, 0), a2 = P(0.52, 1.93, 18), b2 = P(1.48, 1.93, 18), c1 = P(0.56, 1.93, 38), c2 = P(1.44, 1.93, 38);
      const arch = () => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a2[0], a2[1]); g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], b2[0], b2[1]); g.lineTo(b[0], b[1]); g.closePath(); };
      // rim stones round the mouth
      lobe(g, P(0.22, 1.72, 12), 17, 15, rock(1), k);
      for(let i = 0; i <= 10; i++){ const u = i / 10, z = u < 0.12 ? u / 0.12 * 20 : u > 0.88 ? (1 - u) / 0.12 * 20 : 20 + Math.sin((u - 0.12) / 0.76 * Math.PI) * 16; lobe(g, P(0.42 + u * 1.16, 1.95, z + 4), 9 + (i % 3), 8, S.k === 'stone' ? S.rock2 : rock(i + 1), k); }
      arch(); const mid = P(1, 1.92, 14); g.fillStyle = D.rad(g, mid[0], mid[1], 2 * k, 30 * k, [[0, D.sh(S.mouth, st === 'awake' && lv ? 0.35 : 0.08)], [1, S.mouth]]); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.5)'; g.lineWidth = 1.2 * k; g.stroke();
      if(S.k === 'stone' && !br){ g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 1 * k; for(let i = 1; i < 6; i++){ const u = i / 6, z = 22 + Math.sin(u * Math.PI) * 17, q1 = P(0.4 + u * 1.2, 1.92, z), q2 = P(0.4 + u * 1.2 + (u - 0.5) * 0.12, 1.92, z + 9); line(g, q1, q2); } }
      if(br){ [[0.62, 6, 13], [1.0, 9, 15], [1.38, 5, 12], [0.82, 18, 10], [1.2, 17, 9]].forEach(([x, z, r], i) => lobe(g, P(x, 1.96, z), r, r * 0.8, rock(i), k)); return; }
      if(st === 'empty' || st === 'claimed'){ g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 0.6 * k; const w0 = P(0.56, 1.93, 30), w1 = P(0.74, 1.93, 36), w2 = P(0.58, 1.93, 20);
        [[w0, w1], [w0, w2], [w1, w2]].forEach(([p, q]) => line(g, p, q)); for(let f = 0.3; f < 1; f += 0.3){ line(g, [w0[0] + (w1[0] - w0[0]) * f, w0[1] + (w1[1] - w0[1]) * f], [w0[0] + (w2[0] - w0[0]) * f, w0[1] + (w2[1] - w0[1]) * f]); } }
      // skin dressing over the mouth
      if(S.k === 'jungle'){ for(let i = 0; i < 5; i++){ const q = P(0.55 + i * 0.22, 1.94, 38 - Math.abs(i - 2) * 4); vine(g, q[0], q[1], 12 + (i % 2) * 7, k, t + i * 0.3, c ? '#9AA25A' : S.moss, still); } const f1 = P(0.25, 1.98, 0), f2 = P(1.78, 1.96, 0); fern(g, f1[0], f1[1], k, c ? '#9A9A50' : '#3E9A34'); fern(g, f2[0], f2[1], k, c ? '#9A9A50' : '#4CA83A'); }
      if(S.k === 'coral'){ const k1 = P(0.24, 1.96, 0), k2 = P(1.8, 1.9, 0); kelp(g, k1[0], k1[1], 30, k, t, c ? '#A89A5A' : '#3EAA6A', still); kelp(g, k2[0], k2[1], 24, k, t + 0.7, c ? '#A89A5A' : '#2E9A5E', still);
        const s = P(1.62, 1.98, 0); g.fillStyle = c ? '#D8B0A0' : '#FF9A3C'; g.beginPath(); D.star(g, s[0], s[1] - 2 * k, 4.4 * k, 1.9 * k, 5, -1.3); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 0.7 * k; g.stroke(); }
      if(!br) lobe(g, P(1.86, 1.5, 9), 13, 12, rock(2), k);
      if(S.k === 'moon'){ const p1 = P(0.3, 1.96, 0), p2 = P(1.72, 1.94, 0); crystal(g, p1[0], p1[1], 6, 16, -0.3, c ? '#9AA6B0' : S.moss, k, lv); crystal(g, p2[0], p2[1], 5, 12, 0.35, c ? '#A0A0B8' : '#B9A4FF', k, lv); } }, {zb: 0, top: 46});
    // state: 💤 sleep · 👀 awake · 🚩 claimed
    if(br) return;
    if(st === 'awake' && lv){ halo(B, 1, 1.92, 16, 30, S.glow, 0.5 * lv, {pulse: tt => 0.92 + 0.05 * Math.sin(ph(tt, 2)) + 0.03 * Math.cos(ph(tt, 2))});
      B.custom(1, 1.92, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const blink = (Math.sin(ph(t, 2)) + Math.cos(ph(t, 2))) > 1.25, e1 = P(0.86, 1.93, 15), e2 = P(1.22, 1.93, 10);
        eyes(g, e1[0], e1[1], k * 1.3, S.eye, blink, 4); eyes(g, e2[0], e2[1], k * 1.05, S.eye, !blink, 3.6); }, {fx: true, layer: 10});
      B.custom(1, 2, (g, P, k, t) => { if(still) return; const q = P(1, 2.1, 0); puffs(g, q[0], q[1], k, t, {period: 2, n: 3, r: 2.4, rise: 10, drift: 8, col: S.k === 'moon' ? 'rgba(200,200,230,0.6)' : 'rgba(200,170,130,0.55)'}); }, {layer: 2}); }
    if(st === 'sleep'){ B.custom(1, 1.92, (g, P, k, t, T2) => { if(!vis(T2, 0, 1)) return; const q = P(1.05, 1.9, 40), p = still ? 0.3 : ((t || 0) / 2) % 1;
        [0, 0.34, 0.67].forEach((o2, i) => { const f = (p + o2) % 1; zee(g, q[0] + (f * 12 + i * 2) * k, q[1] - f * 26 * k, (2.4 + f * 2.4) * k, '#FFFFFF', f < 0.15 ? f / 0.15 : f > 0.8 ? (1 - f) / 0.2 : 1); });
        if(S.k === 'coral' && !still){ const b = P(1, 1.95, 18); bubbles(g, b[0], b[1], k, t, {period: 2, n: 3, rise: 20}); } }, {fx: true, layer: 10}); }
    if(st === 'claimed'){ A.pennant(B, L, 1.78, 1.82, 0, 46, {w: 15, hh: 10, layer: 6}); B.box(1.7, 1.74, 0, 0.16, 0.16, 12, '#8A6A48');
      B.custom(1.78, 1.82, (g, P, k) => { const col = A.teamOf(L), q = P(1.78, 1.82, 22); g.fillStyle = col; g.beginPath(); D.rr(g, q[0] - 3.2 * k, q[1] - 5 * k, 6.4 * k, 10 * k, 2 * k); g.fill(); g.strokeStyle = D.sh(col, -0.5); g.lineWidth = 1 * k; g.stroke();
        g.fillStyle = A.inkOf(col); g.beginPath(); D.star(g, q[0], q[1], 2.6 * k, 1.1 * k, 5); g.fill(); }, {layer: 7, zb: 18, top: 28}); } };
})();
/* ---------- 👑 BOSS LAIR (3 × 3, walk-on arena): a sunken stone ring · 7 pillars round it (gap at the front) · the boss's bed in the middle ---------- */
const LAIR_N = 7, lairA = i => Math.PI / 2 + 0.78 + i * (TAU - 1.56) / (LAIR_N - 1);
(function(){ const def = add('wild', 'wild_lair', {name: 'Boss lair', kind: 'landmark', foot: [3, 3], door: [1.5, 3], h: 168, variants: 1, block: false, states: ['sleep', 'awake', 'beaten'], state: 'sleep',
    side: 'wild', slot: 'lair', tags: ['ar', 'ar-wild', 'lair', 'boss', 'landmark', 'walkon'], live: {period: 2.4, frames: 6}});
  def.build = (B, v, L) => { const S = skinOf(L), c = L.cond, br = c && c.broken, lv = lightOf(c), st = L.state || 'sleep', still = c && c.still, aw = st === 'awake' && lv > 0, bt = st === 'beaten';
    const at = (r, a) => [1.5 + Math.cos(a) * r, 1.5 + Math.sin(a) * r];
    // 🟤 the arena floor: rim band with 8 runes + a cracked inner floor (awake: the cracks glow)
    B.custom(1.5, 1.5, (g, P, k, t) => { const ring = (r, fill, stroke) => { const pts = []; for(let i = 0; i <= 48; i++){ const [x, y] = at(r, i / 48 * TAU); pts.push(P(x, y, 0)); } polyP(g, pts); if(fill){ g.fillStyle = fill; g.fill(); } if(stroke){ g.strokeStyle = stroke; g.lineWidth = 1 * k; g.stroke(); } };
      ring(1.48, D.sh(S.rim, -0.12), 'rgba(42,28,20,0.35)'); ring(1.24, S.floor, 'rgba(42,28,20,0.3)');
      const glowOn = aw ? 1 : bt && lv ? 0.6 : 0, rc = bt ? '#9BFFC8' : S.glow;
      for(let i = 0; i < 8; i++){ const a = i / 8 * TAU + 0.2, [x, y] = at(1.36, a), q = P(x, y, 0); g.fillStyle = glowOn ? rc : D.sh(S.rim, 0.25); g.strokeStyle = 'rgba(42,28,20,0.45)'; g.lineWidth = 0.8 * k; g.beginPath();
        if(i % 3 === 0) D.ell(g, q[0], q[1], 3.4 * k, 1.8 * k); else if(i % 3 === 1){ g.moveTo(q[0], q[1] - 2 * k); g.lineTo(q[0] + 3.6 * k, q[1] + 1.4 * k); g.lineTo(q[0] - 3.6 * k, q[1] + 1.4 * k); g.closePath(); } else D.rr(g, q[0] - 3 * k, q[1] - 1.5 * k, 6 * k, 3 * k, 1 * k); g.fill(); g.stroke();
        if(glowOn) D.glow(g, q[0], q[1], 9 * k, rc, 0.35 * glowOn); }
      const R2 = rnd(7); g.lineCap = 'round'; g.lineJoin = 'round';
      for(let n = 0; n < 6; n++){ let a = n / 6 * TAU + R2() * 0.4, r = 0.25; const pts = [P(...at(r, a), 0)]; while(r < 1.15){ r += 0.16 + R2() * 0.1; a += (R2() - 0.5) * 0.35; pts.push(P(...at(r, a), 0)); }
        g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.strokeStyle = 'rgba(30,20,14,0.5)'; g.lineWidth = 1.6 * k; g.stroke();
        if(glowOn){ g.strokeStyle = bt ? 'rgba(170,255,210,0.75)' : S.glow; g.lineWidth = 1.1 * k; g.stroke(); } } }, {layer: -6, zb: 0, top: 1});
    // 🪨 7 pillars (the 2 by the front gap carry braziers: lit when awake)
    for(let i = 0; i < LAIR_N; i++){ const a = lairA(i), [x, y] = at(1.3, a), front = i === 0 || i === LAIR_N - 1, fallen = (br && i % 2 === 1) || (bt && (i === 2 || i === 4)), h0 = front ? 58 : 70 + (i % 3) * 10, h1 = fallen ? 14 : h0;
      B.custom(x, y, (g, P, k, t, T2) => { const base = P(x, y, 0), wq = T2 ? T2.pt(x, y) : [x, y], low = !fallen && wq[0] + wq[1] > 3.3, h = low ? (front ? 22 : 16) : h1;   // pillars on the camera side stay low stumps, so the arena (and the boss) is never hidden — on every turn
        if(low && !front){ lobe(g, P(x, y, 6), 11, 9, S.rock, k); lobe(g, P(x + 0.12, y + 0.1, 3), 7, 6, S.rock2, k); if(S.k === 'moon') crystal(g, base[0] + 3 * k, base[1] - 2 * k, 7, 14, 0.2, c ? '#A8A0C0' : '#8FE6FF', k, lv); if(S.k === 'coral') coralTree(g, base[0], base[1] - 6 * k, 0.6, c ? '#D9B0A0' : '#FF7A5A', k); if(S.k === 'jungle' && !br) fern(g, base[0], base[1] - 2 * k, k, '#4C9A34'); return; }
        if(fallen){ const tip = P(x + Math.cos(a + 1.2) * 0.55, y + Math.sin(a + 1.2) * 0.55, 6); g.strokeStyle = 'rgba(42,28,20,0.45)'; g.lineCap = 'round'; g.lineWidth = 15 * k; line(g, base, tip); g.strokeStyle = S.k === 'coral' ? S.rock : S.k === 'moon' ? '#9A8ACF' : S.rock2; g.lineWidth = 12.5 * k; line(g, base, tip); lobe(g, P(x, y, 5), 9, 7, S.rock, k); return; }
        if(S.k === 'moon'){ lobe(g, P(x, y, 4), 12, 8, S.rock, k); crystal(g, base[0], base[1] - 3 * k, 13, h, (i % 2 ? 0.1 : -0.12), c ? '#A8A0C0' : (i % 2 ? '#B9A4FF' : '#8FE6FF'), k, lv); return; }
        if(S.k === 'coral'){ const col = c ? '#D9B0A0' : ['#FF7A5A', '#F2A3B4', '#FFB347'][i % 3]; g.fillStyle = D.lin(g, base[0] - 8 * k, 0, base[0] + 8 * k, 0, [D.sh(col, 0.15), col, D.sh(col, -0.25)]);
          g.beginPath(); g.moveTo(base[0] - 8 * k, base[1]); g.quadraticCurveTo(base[0] - 9 * k, base[1] - h * 0.6 * k, base[0] - 3 * k, base[1] - h * k); g.lineTo(base[0] + 3 * k, base[1] - h * k); g.quadraticCurveTo(base[0] + 9 * k, base[1] - h * 0.6 * k, base[0] + 8 * k, base[1]); g.closePath(); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.9 * k; g.stroke();
          g.fillStyle = 'rgba(120,40,30,0.28)'; for(let n = 0; n < 8; n++){ g.beginPath(); g.arc(base[0] + ((n * 37) % 11 - 5) * k, base[1] - (6 + n * h / 9) * k, 1.1 * k, 0, TAU); g.fill(); }
          coralTree(g, base[0] - 2 * k, base[1] - h * k + 2 * k, 0.7, D.sh(col, 0.1), k); return; }
        // jungle basalt (hex column) · stone ruin column
        const w = 9 * k, top = [base[0], base[1] - h * k], col = S.k === 'jungle' ? '#6B6274' : S.rock2;
        g.fillStyle = D.sh(col, 0.12); g.beginPath(); g.rect(base[0] - w, top[1], w, h * k); g.fill(); g.fillStyle = D.sh(col, -0.18); g.beginPath(); g.rect(base[0], top[1], w, h * k); g.fill();
        g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 0.9 * k; g.strokeRect(base[0] - w, top[1], 2 * w, h * k);
        if(S.k === 'stone'){ g.strokeStyle = 'rgba(42,28,20,0.25)'; for(let z = 12; z < h; z += 12) line(g, [base[0] - w, base[1] - z * k], [base[0] + w, base[1] - z * k]); }
        else { g.strokeStyle = 'rgba(30,22,34,0.35)'; line(g, [base[0] - w * 0.5, base[1]], [base[0] - w * 0.5, top[1]]); line(g, [base[0] + w * 0.5, base[1]], [base[0] + w * 0.5, top[1]]); }
        g.fillStyle = D.sh(col, 0.3); g.beginPath(); D.ell(g, top[0], top[1], w, w * 0.5); g.fill(); g.stroke();
        if(S.k === 'jungle' && !br){ g.strokeStyle = c ? '#8A9A50' : '#3E9A34'; g.lineWidth = 1.6 * k; g.beginPath(); for(let z = 4; z < h - 4; z += 3){ const s = Math.sin(z * 0.35 + i); z === 4 ? g.moveTo(base[0] + s * w, base[1] - z * k) : g.lineTo(base[0] + s * w, base[1] - z * k); } g.stroke();
          g.fillStyle = c ? '#9AA25A' : S.moss; g.beginPath(); D.ell(g, top[0], top[1] - 1 * k, w * 1.05, w * 0.55); g.fill(); } }, {zb: 0, top: h1 + 18, layer: 0});
      if(front && !fallen){ B.custom(x, y, (g, P, k, t, T2) => { const wq = T2 ? T2.pt(x, y) : [x, y], q = P(x, y, (wq[0] + wq[1] > 3.3 ? 22 : h1) + 2); g.fillStyle = '#4A3A30'; g.beginPath(); g.moveTo(q[0] - 8 * k, q[1] - 6 * k); g.lineTo(q[0] + 8 * k, q[1] - 6 * k); g.lineTo(q[0] + 5 * k, q[1] + 2 * k); g.lineTo(q[0] - 5 * k, q[1] + 2 * k); g.closePath(); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.6)'; g.lineWidth = 0.9 * k; g.stroke();
          if(!aw) return; const fl = still ? 0 : Math.sin(ph(t, 2.4)) * 1.4 + Math.cos(ph(t, 2.4)) * 0.7; D.glow(g, q[0], q[1] - 12 * k, 22 * k, S.k === 'moon' ? S.glow : '#FF8A2A', 0.55);
          g.fillStyle = S.k === 'moon' ? '#C9A4FF' : S.k === 'coral' ? '#7CF6FF' : '#FF7A2E'; g.beginPath(); g.moveTo(q[0] - 6 * k, q[1] - 6 * k); g.quadraticCurveTo(q[0] - 7 * k, q[1] - 16 * k, q[0] + fl * k, q[1] - (24 + fl) * k); g.quadraticCurveTo(q[0] + 7 * k, q[1] - 16 * k, q[0] + 6 * k, q[1] - 6 * k); g.closePath(); g.fill();
          g.fillStyle = '#FFF2B0'; g.beginPath(); g.moveTo(q[0] - 3 * k, q[1] - 6 * k); g.quadraticCurveTo(q[0] - 3 * k, q[1] - 12 * k, q[0] + fl * 0.5 * k, q[1] - 16 * k); g.quadraticCurveTo(q[0] + 3 * k, q[1] - 12 * k, q[0] + 3 * k, q[1] - 6 * k); g.closePath(); g.fill(); }, {fx: true, layer: 9}); } }
    // 🛏️ the boss's bed in the middle (where the CreatureKit boss sleeps — the game draws the boss on top)
    B.custom(1.5, 1.5, (g, P, k, t) => { const q = P(1.5, 1.5, 0);
      if(S.k === 'jungle' || S.k === 'stone'){ // a giant twig nest (stone: a cracked altar slab under it)
        if(S.k === 'stone'){ const a0 = P(1.0, 1.05, 0), a1 = P(2.0, 1.05, 0), a2 = P(2.0, 1.95, 0), a3 = P(1.0, 1.95, 0), up = 10 * k;
          g.fillStyle = D.sh(S.rock, -0.2); polyP(g, [a3, a2, [a2[0], a2[1] - up], [a3[0], a3[1] - up]]); g.fill(); g.fillStyle = D.sh(S.rock, -0.35); polyP(g, [a1, a2, [a2[0], a2[1] - up], [a1[0], a1[1] - up]]); g.fill();
          g.fillStyle = S.rock2; polyP(g, [a0, a1, a2, a3].map(p => [p[0], p[1] - up])); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 0.9 * k; g.stroke(); }
        const lift = S.k === 'stone' ? 10 : 0, R2 = rnd(19), spread = bt ? 1.22 : 1, sticks = 34;
        g.fillStyle = D.sh('#8A6A3E', -0.1); g.beginPath(); D.ell(g, q[0], q[1] - lift * k, 46 * k * spread, 20 * k * spread); g.fill();
        g.fillStyle = bt ? '#6E5A3E' : '#B89A5E'; g.beginPath(); D.ell(g, q[0], q[1] - (lift + 4) * k, 30 * k, 12 * k); g.fill();
        g.lineCap = 'round'; for(let n = 0; n < sticks; n++){ const a = R2() * TAU, r = (bt ? 20 + R2() * 46 : 30 + R2() * 14), cx = q[0] + Math.cos(a) * r * k, cy = q[1] - lift * k + Math.sin(a) * r * 0.44 * k - (bt ? 0 : 5 + R2() * 5) * k, l = (7 + R2() * 9) * k, b = a + Math.PI / 2 + (R2() - 0.5) * 0.9;
          g.strokeStyle = n % 3 ? '#7A5A34' : '#A07A48'; g.lineWidth = 2.2 * k; line(g, [cx - Math.cos(b) * l, cy - Math.sin(b) * l * 0.5], [cx + Math.cos(b) * l, cy + Math.sin(b) * l * 0.5]); }
        if(!bt){ bone(g, q[0] - 22 * k, q[1] - (lift + 2) * k, 12, 0.3, k); bone(g, q[0] + 18 * k, q[1] + 3 * k, 10, -0.5, k); }
        else { g.fillStyle = '#7FD06A'; for(let n = 0; n < 7; n++){ const a = n / 7 * TAU, x2 = q[0] + Math.cos(a) * 26 * k, y2 = q[1] + Math.sin(a) * 11 * k; g.beginPath(); D.ell(g, x2, y2 - 3 * k, 2.2 * k, 3.4 * k, 0.4); g.fill(); g.fillStyle = n % 2 ? '#FFD2E6' : '#FFF2A0'; g.beginPath(); g.arc(x2 + 2 * k, y2 - 6 * k, 1.6 * k, 0, TAU); g.fill(); g.fillStyle = '#7FD06A'; } } }
      else if(S.k === 'coral'){ // a giant clam bed: open + a pearl when awake, half shut when asleep, shut + cracked when beaten
        const open = aw ? 1 : bt ? 0 : 0.35, lip = q[1] - 6 * k, W = 44 * k, H = 22 * k, sc = (y0, h, up, fill) => { g.fillStyle = fill; g.beginPath(); g.moveTo(q[0] - W, y0);
          for(let i = 0; i <= 8; i++){ const u = -1 + i / 4, yy = y0 + (up ? -1 : 1) * Math.sqrt(Math.max(0, 1 - u * u)) * h - (i % 2 ? 0 : (up ? -2.5 : 2.5) * k); g.lineTo(q[0] + u * W, yy); } g.closePath(); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 1 * k; g.stroke();
          g.strokeStyle = 'rgba(120,60,80,0.35)'; for(let i = 1; i < 8; i++){ const u = -1 + i / 4; line(g, [q[0], y0], [q[0] + u * W * 0.9, y0 + (up ? -1 : 1) * Math.sqrt(Math.max(0, 1 - u * u)) * h * 0.92]); } };
        sc(lip, H * 0.75, false, c ? '#D9C2BC' : '#F6C6D4');
        if(open > 0.2){ g.fillStyle = c ? '#C9A0A8' : '#FF9AB8'; g.beginPath(); D.ell(g, q[0], lip, W * 0.8, H * 0.3); g.fill(); if(aw){ const pg = [q[0], lip - 6 * k]; D.glow(g, pg[0], pg[1], 20 * k, '#FFE6F2', 0.6); g.fillStyle = D.rad(g, pg[0] - 2 * k, pg[1] - 3 * k, 1, 9 * k, [[0, '#FFFFFF'], [0.6, '#F2E4F8'], [1, '#C9B4D8']]); g.beginPath(); g.arc(pg[0], pg[1], 7 * k, 0, TAU); g.fill(); } }
        sc(lip - (open * 26 + 1) * k, H * (0.55 + open * 0.3), true, c ? '#E4CCC4' : '#FFD6E2');
        if(bt){ g.strokeStyle = 'rgba(42,28,20,0.6)'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(q[0] - 4 * k, lip - 18 * k); g.lineTo(q[0] + 3 * k, lip - 10 * k); g.lineTo(q[0] - 2 * k, lip - 4 * k); g.stroke(); }
        if(!still && !bt) bubbles(g, q[0] + 10 * k, lip - 20 * k, k, t, {period: 2.4, n: aw ? 5 : 2, rise: aw ? 60 : 26}); }
      else { // 🚀 moon: a meteor floating over a 4-stone altar (beaten: fallen + cracked on the altar)
        [[1.05, 1.05], [1.95, 1.05], [1.05, 1.95], [1.95, 1.95]].forEach(([x, y]) => lobe(g, P(x, y, 5), 8, 7, S.rock, k));
        const bob = still || bt ? 0 : Math.sin(ph(t, 2.4)) * 3 + Math.cos(ph(t, 2.4)) * 1.2, z = bt ? 10 : aw ? 52 + bob : 30 + bob * 0.4, m = P(1.5, 1.5, z);
        if(!bt){ g.fillStyle = 'rgba(20,10,40,0.3)'; g.beginPath(); D.ell(g, q[0], q[1], 26 * k, 11 * k); g.fill(); }
        if(aw){ D.glow(g, m[0], m[1], 50 * k, S.glow, 0.5); for(let n = 0; n < 5; n++){ const a = n / 5 * TAU + ph(t, 2.4) * 0.2, r = 34 * k; lobe(g, [m[0] + Math.cos(a) * r, m[1] + Math.sin(a) * r * 0.45 + 6 * k], 3.4, 3, S.rock2, k); } }
        [[0, 0, 22, 19], [-12, 4, 12, 10], [13, -3, 11, 10], [2, -12, 12, 9]].forEach(([dx, dy, rx, ry], i) => lobe(g, [m[0] + dx * k, m[1] + dy * k], rx, ry, i ? '#5E5470' : '#4E465E', k));
        g.strokeStyle = bt ? '#2A2436' : lv ? (aw ? '#E2C4FF' : '#9A7ADA') : '#5A5070'; g.lineWidth = 1.8 * k; g.lineCap = 'round';
        [[[-14, -4], [-4, 2], [4, -6], [14, -2]], [[-6, 8], [2, 2], [10, 9]], [[-2, -16], [3, -8]]].forEach(pts => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(m[0] + p[0] * k, m[1] + p[1] * k) : g.moveTo(m[0] + p[0] * k, m[1] + p[1] * k)); g.stroke(); });
        if(bt){ g.strokeStyle = 'rgba(42,28,20,0.7)'; g.lineWidth = 1.4 * k; line(g, [m[0] - 2 * k, m[1] - 18 * k], [m[0] + 3 * k, m[1] + 16 * k]); } } }, {zb: 0, top: 96, layer: 1});
    // ✨ state glow: awake = the skin's glow + embers / bubbles · beaten = a calm 🌈 aurora shimmer + sparkles · asleep = a faint breathing light
    if(lv && !br){ if(aw) halo(B, 1.5, 1.5, 30, 70, S.glow, S.k === 'moon' ? 0.26 : 0.42, {pulse: tt => 0.9 + 0.07 * Math.sin(ph(tt, 2.4)) + 0.03 * Math.cos(ph(tt, 2.4))});
      else if(st === 'sleep') halo(B, 1.5, 1.5, 16, 40, S.glow, 0.16, {pulse: tt => 0.85 + 0.1 * Math.sin(ph(tt, 2.4)) + 0.05 * Math.cos(ph(tt, 2.4))});
      if(aw && S.k === 'jungle') B.custom(1.5, 1.5, (g, P, k, t) => { if(still) return; const q = P(1.5, 1.5, 8); const p = (t / 2.4) % 1; for(let n = 0; n < 9; n++){ const f = (p + n / 9) % 1, x = q[0] + Math.sin(n * 2.3) * 40 * k + Math.sin(f * 6 + n) * 3 * k, y = q[1] - f * 70 * k; g.globalAlpha = f < 0.2 ? f * 5 : 1 - f; D.glow(g, x, y, 5 * k, '#FF8A2A', 0.8); g.fillStyle = '#FFD27A'; g.beginPath(); g.arc(x, y, 1.4 * k, 0, TAU); g.fill(); } g.globalAlpha = 1; }, {fx: true, layer: 9});
      if(bt) B.custom(1.5, 1.5, (g, P, k, t) => { const q = P(1.5, 1.5, 40), sw = still ? 0 : Math.sin(ph(t, 2.4)) * 4 + Math.cos(ph(t, 2.4)) * 2; g.save(); g.globalCompositeOperation = 'lighter';
        ['#7CF6FF', '#9BFF6A', '#FFE27A', '#FF9AD6', '#B07CFF'].forEach((col, i) => { g.strokeStyle = D.rgba(col, 0.32); g.lineWidth = 6 * k; g.beginPath(); for(let n = 0; n <= 20; n++){ const u = -1 + n / 10, x = q[0] + u * 70 * k, y = q[1] - (40 + i * 7) * k + Math.sin(u * 3 + i + sw * 0.1) * 6 * k; n ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); });
        g.restore(); g.fillStyle = 'rgba(255,255,255,0.95)'; [[-40, -10], [36, -26], [-8, -50], [22, 6], [-26, -64]].forEach(([dx, dy], i) => { const tw = still ? 1 : 0.6 + 0.4 * Math.abs(Math.sin(ph(t, 2.4) + i)); g.beginPath(); D.star(g, q[0] + dx * k, q[1] + dy * k, 3.4 * k * tw, 1.1 * k, 4); g.fill(); }); }, {fx: true, layer: 11}); } };
})();
/* ---------- 🏺 relics: 🐉 dragon heart · 🦣 titan tusk · 🔥 phoenix feather — drawn in 3 sizes (🥇 big · 🥈 smaller · 🥉 small) ---------- */
const MEDAL = {gold: {s: 1, col: '#FFC93C', dk: '#C98A1A', glow: '#FFE27A'}, silver: {s: 0.82, col: '#DDE3EE', dk: '#8E98AE', glow: '#E6F0FF'}, bronze: {s: 0.68, col: '#E09A5A', dk: '#9A5A2A', glow: '#FFC08A'}};
const RELICS = ['Dragon Heart', 'Titan Tusk', 'Phoenix Feather'];
function relic(g, x, y, k, kind, medal, lv){ const M2 = MEDAL[medal] || MEDAL.gold, s = M2.s * k; g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  if(kind === 0){ // 🐉 heart: a ruby heart in a gold cage
    g.beginPath(); g.moveTo(0, 9); g.bezierCurveTo(-13, 0, -11, -12, -4, -11); g.quadraticCurveTo(-1, -10.5, 0, -7); g.quadraticCurveTo(1, -10.5, 4, -11); g.bezierCurveTo(11, -12, 13, 0, 0, 9); g.closePath();
    g.fillStyle = D.rad(g, -4, -6, 1, 16, [[0, '#FF9AA0'], [0.45, lv ? '#E3283A' : '#9A4048'], [1, '#7A0A1A']]); g.fill(); g.strokeStyle = '#2A1C14'; g.lineWidth = 1.3; g.stroke();
    g.strokeStyle = M2.col; g.lineWidth = 1.6; [[-7, -9, -2, 6], [7, -9, 2, 6], [-10, -2, 10, -2]].forEach(([a, b, c2, d]) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo(0, (b + d) / 2 - 2, c2, d); g.stroke(); });
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); D.ell(g, -5, -6, 2.4, 1.4, -0.6); g.fill(); }
  else if(kind === 1){ // 🦣 tusk: an ivory crescent with 2 gold bands
    g.beginPath(); g.moveTo(-11, 7); g.bezierCurveTo(-12, -6, -2, -14, 12, -12); g.bezierCurveTo(2, -9, -4, -2, -5, 8); g.closePath();
    g.fillStyle = D.lin(g, -12, 0, 12, 0, ['#FFF8E6', '#F2E2C0', '#D8C094']); g.fill(); g.strokeStyle = '#2A1C14'; g.lineWidth = 1.3; g.stroke();
    g.strokeStyle = M2.col; g.lineWidth = 2.6; [[-10.5, 1, -5.5, 2.6], [-8.5, -6, -3.6, -3.4]].forEach(([a, b, c2, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c2, d); g.stroke(); }); }
  else { // 🔥 feather: a flame feather in orange → gold
    g.beginPath(); g.moveTo(0, 11); g.bezierCurveTo(-9, 2, -8, -10, 2, -14); g.quadraticCurveTo(-1, -9, 3, -7); g.quadraticCurveTo(9, -11, 6, -16); g.bezierCurveTo(13, -8, 8, 4, 0, 11); g.closePath();
    g.fillStyle = D.lin(g, 0, 11, 0, -16, [lv ? '#E3283A' : '#8A4A40', lv ? '#FF7A12' : '#A0703A', lv ? '#FFC93C' : '#B0985A']); g.fill(); g.strokeStyle = '#2A1C14'; g.lineWidth = 1.3; g.stroke();
    g.strokeStyle = 'rgba(255,240,180,0.85)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 11); g.quadraticCurveTo(-1, -2, 2, -12); g.stroke(); for(let i = 0; i < 4; i++){ g.beginPath(); g.moveTo(-0.5, 5 - i * 4); g.lineTo(-5, 1 - i * 4); g.moveTo(0, 5 - i * 4); g.lineTo(4, 1 - i * 4.2); g.stroke(); } }
  g.restore(); }
// 🏺 RELIC STAND (1 × 1, next to the 🏠 House — one stand per relic slot): a stone column with a cushion; the relic floats over it
(function(){ const def = add('wild', 'wild_relic', {name: 'Relic stand', kind: 'thing', foot: [1, 1], door: null, h: 50, variants: 3, block: true, states: ['empty', 'gold', 'silver', 'bronze'], state: 'empty',
    side: 'wild', slot: 'relic', tags: ['ar', 'ar-wild', 'relic', 'reward'], live: {period: 2, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, br = c && c.broken, lv = lightOf(c), st = L.state || 'empty', M2 = MEDAL[st];
    B.drum(0.5, 0.5, 0, 0.36, 6, '#B9B0A0', {rings: 1}); B.drum(0.5, 0.5, 6, 0.2, br ? 8 : 16, '#CFC6B4', {rings: 2}); if(br) return;
    B.drum(0.5, 0.5, 22, 0.31, 4, M2 ? M2.col : '#B9A27A');
    B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 26), cu = [['#9A1A2A', '#D8354A'], ['#1E4A8A', '#3A7AD8'], ['#7A3AA8', '#A35ACF']][v % 3]; g.fillStyle = cu[0]; g.beginPath(); D.ell(g, q[0], q[1], 11 * k, 5 * k); g.fill(); g.fillStyle = cu[1]; g.beginPath(); D.ell(g, q[0], q[1] - 1.4 * k, 9 * k, 3.6 * k); g.fill();
      [-1, 1].forEach(sx => { g.fillStyle = '#FFC93C'; g.beginPath(); g.arc(q[0] + sx * 10 * k, q[1] + 1 * k, 1.5 * k, 0, TAU); g.fill(); }); }, {layer: 1, zb: 26, top: 29});
    if(!M2 && lightOf(c)) B.custom(0.5, 0.5, (g, P, k, t) => { const q = P(0.5, 0.5, 30), tw = c && c.still ? 0.6 : 0.6 + 0.25 * Math.sin(ph(t, 2)) + 0.15 * Math.cos(ph(t, 2)); g.fillStyle = 'rgba(255,240,190,' + (0.5 + tw * 0.5) + ')'; g.beginPath(); D.star(g, q[0] + 7 * k, q[1] - 4 * k, 3.2 * k * tw, 1 * k, 4); g.fill(); }, {fx: true, layer: 10});   // an empty cushion waits for a relic (a small twinkle)
    if(!M2) return;
    if(lv) halo(B, 0.5, 0.5, 40, 26 * M2.s, M2.glow, 0.5 * lv, {pulse: t => 0.9 + 0.06 * Math.sin(ph(t, 2)) + 0.04 * Math.cos(ph(t, 2))});
    B.custom(0.5, 0.5, (g, P, k, t) => { const bob = c && c.still ? 0 : Math.sin(ph(t, 2)) * 1.6 + Math.cos(ph(t, 2)) * 0.6, q = P(0.5, 0.5, 42 + bob); relic(g, q[0], q[1], k * 1.2, v % 3, st, lv);
      if(lv){ g.fillStyle = 'rgba(255,255,255,0.95)'; [[-12, -10], [12, -4], [6, -16]].forEach(([dx, dy], i) => { g.beginPath(); D.star(g, q[0] + dx * k * M2.s, q[1] + dy * k * M2.s, (2.6 - i * 0.5) * k, 0.9 * k, 4); g.fill(); }); } }, {fx: true, layer: 10}); };
})();
// ✨ DROPPED RELIC (1 × 1, walk-on): what falls when a carrier is knocked out or a House falls — any hero may pick it up
(function(){ const def = add('wild', 'wild_drop', {name: 'Dropped relic', kind: 'thing', foot: [1, 1], door: null, h: 44, variants: 3, block: false, states: ['gold', 'silver', 'bronze'], state: 'gold',
    side: 'wild', slot: 'drop', tags: ['ar', 'ar-wild', 'relic', 'pickup', 'walkon'], live: {period: 1.6, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, lv = lightOf(c), st = L.state || 'gold', M2 = MEDAL[st] || MEDAL.gold;
    B.custom(0.5, 0.5, (g, P, k, t) => { const q = P(0.5, 0.5, 0), pulse = c && c.still ? 0.5 : 0.5 + 0.25 * Math.sin(ph(t, 1.6)) + 0.12 * Math.cos(ph(t, 1.6));
      g.strokeStyle = D.rgba(M2.col, 0.95); g.lineWidth = 2.2 * k; g.setLineDash([5 * k, 3.5 * k]); g.lineDashOffset = -pulse * 10 * k; g.beginPath(); D.ell(g, q[0], q[1], 24 * k, 12 * k); g.stroke(); g.setLineDash([]);
      g.strokeStyle = D.rgba(M2.col, 0.4 + pulse * 0.4); g.lineWidth = 1.2 * k; g.beginPath(); D.ell(g, q[0], q[1], (16 + pulse * 6) * k, (8 + pulse * 3) * k); g.stroke(); }, {layer: -4, zb: 0, top: 1, fx: true});
    if(lv) B.custom(0.5, 0.5, (g, P, k, t) => { const q = P(0.5, 0.5, 0), gr = g.createLinearGradient(0, q[1], 0, q[1] - 44 * k); gr.addColorStop(0, D.rgba(M2.glow, 0.55 * lv)); gr.addColorStop(1, D.rgba(M2.glow, 0));
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.beginPath(); g.moveTo(q[0] - 9 * k, q[1]); g.lineTo(q[0] - 5 * k, q[1] - 44 * k); g.lineTo(q[0] + 5 * k, q[1] - 44 * k); g.lineTo(q[0] + 9 * k, q[1]); g.closePath(); g.fill(); g.restore(); }, {fx: true, layer: 8});
    B.custom(0.5, 0.5, (g, P, k) => { const q = P(0.5, 0.5, 5); g.save(); g.translate(q[0], q[1]); g.rotate(-0.5); relic(g, 0, 0, k * 0.85, v % 3, st, lv); g.restore(); }, {fx: true, layer: 9}); };
})();
// ⚠️ BOSS-PATH MARK (1 × 1, walk-on, flat on the ground, no rim — like a tile mark): path = a big claw print + 2 chevrons (they point along +y; turn the mark to point another way) · stomp = a cracked crater + a red ring
(function(){ const def = add('wild', 'wild_warn', {name: 'Boss path mark', kind: 'deco', foot: [1, 1], door: null, h: 6, variants: 1, block: false, states: ['path', 'stomp'], state: 'path',
    side: 'wild', slot: 'warn', tags: ['ar', 'ar-wild', 'warn', 'walkon', 'decal'], live: {period: 1.2, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, st = L.state || 'path';
    B.custom(0.5, 0.5, (g, P, k, t) => { const lv = lightOf(c), pulse = (c && c.still ? 0.7 : 0.7 + 0.2 * Math.sin(ph(t, 1.2)) + 0.1 * Math.cos(ph(t, 1.2))) * (0.45 + 0.55 * lv), red = lv === 1 ? '#FF3A3A' : lv ? '#C8684E' : '#8A6A5A', ink = 'rgba(80,30,18,' + (0.3 + 0.4 * lv) + ')';   /* 🍂 dry = faded · 🏚️ ruined = almost washed out */
      const poly = (pts, fill, a, edge) => { g.globalAlpha = a == null ? 1 : a; polyP(g, pts.map(p => P(p[0], p[1], 0))); g.fillStyle = fill; g.fill(); if(edge){ g.strokeStyle = edge; g.lineWidth = 1.2 * k; g.stroke(); } g.globalAlpha = 1; };
      const oval = (cx, cy, rx, ry, rot, n) => { const pts = []; for(let i = 0; i < (n || 16); i++){ const an = i / (n || 16) * TAU, px = Math.cos(an) * rx, py = Math.sin(an) * ry; pts.push([cx + px * Math.cos(rot) - py * Math.sin(rot), cy + px * Math.sin(rot) + py * Math.cos(rot)]); } return pts; };
      if(st === 'stomp'){ const pts = []; for(let i = 0; i < 14; i++){ const an = i / 14 * TAU, r = i % 2 ? 0.27 : 0.35; pts.push([0.5 + Math.cos(an) * r, 0.5 + Math.sin(an) * r]); } poly(pts, 'rgba(120,80,50,0.55)', 1, 'rgba(70,34,22,0.5)');
        poly(oval(0.5, 0.5, 0.17, 0.17, 0), 'rgba(70,40,24,0.55)'); poly(oval(0.5, 0.5, 0.06, 0.06, 0), '#2A1C14');
        g.strokeStyle = ink; g.lineWidth = 1.4 * k; g.lineCap = 'round'; for(let i = 0; i < 7; i++){ const an = i / 7 * TAU + 0.3; line(g, P(0.5 + Math.cos(an) * 0.2, 0.5 + Math.sin(an) * 0.2, 0), P(0.5 + Math.cos(an + 0.12) * 0.45, 0.5 + Math.sin(an + 0.12) * 0.45, 0)); }
        const ring = []; for(let i = 0; i <= 40; i++){ const an = i / 40 * TAU; ring.push(P(0.5 + Math.cos(an) * 0.46, 0.5 + Math.sin(an) * 0.46, 0)); } g.globalAlpha = pulse; polyP(g, ring); g.strokeStyle = red; g.lineWidth = 2.6 * k; g.setLineDash([6 * k, 4 * k]); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; return; }
      // claw print: a pad + 3 toes with claws (toes toward +y), then 2 red chevrons further along
      poly(oval(0.5, 0.3, 0.19, 0.15, 0), ink); [[-0.22, 0.52, -0.4], [0, 0.58, 0], [0.22, 0.52, 0.4]].forEach(([dx, y, a]) => { poly(oval(0.5 + dx, y, 0.07, 0.11, a, 12), ink);
        const tx = 0.5 + dx + Math.sin(a) * 0.11, ty = y + Math.cos(a) * 0.11; poly([[tx - 0.025, ty - 0.01], [tx + 0.025, ty - 0.01], [tx + Math.sin(a) * 0.08, ty + Math.cos(a) * 0.09]], '#2A1C14'); /* claws in the rim ink: the mark has no baked rim */ });
      [0.74, 0.86].forEach((y0, i) => poly([[0.3, y0], [0.5, y0 + 0.08], [0.7, y0], [0.7, y0 + 0.06], [0.5, y0 + 0.14], [0.3, y0 + 0.06]], red, pulse * (i ? 1 : 0.65), 'rgba(90,10,10,0.6)')); }, {layer: -8, zb: 0, top: 1, fx: true}); };
})();
// 🥚 BOSS EGG (1 × 1, the 🥇 team's prize — hatches a pet later in the match): a big speckled egg in a nest (shell colours follow the map skin)
(function(){ const def = add('wild', 'wild_egg', {name: 'Boss egg', kind: 'thing', foot: [1, 1], door: null, h: 46, variants: 1, block: true, states: ['whole', 'crack', 'hatched'], state: 'whole',
    side: 'wild', slot: 'egg', tags: ['ar', 'ar-wild', 'egg', 'reward'], live: {period: 2, frames: 6}});
  def.build = (B, v, L) => { const S = skinOf(L), c = L.cond, lv = lightOf(c), st = L.state || 'whole', [e1, e2] = S.egg;
    B.custom(0.5, 0.5, (g, P, k, t) => { const q = P(0.5, 0.5, 0), R = rnd(5);
      if(L.team){ const col = A.teamOf(L); g.strokeStyle = col; g.lineWidth = 3 * k; g.beginPath(); D.ell(g, q[0], q[1] + 1 * k, 21 * k, 10 * k); g.stroke(); }
      g.fillStyle = S.k === 'coral' ? '#E9D3A2' : S.k === 'moon' ? '#6C6C80' : '#A07A48'; g.beginPath(); D.ell(g, q[0], q[1], 17 * k, 7.5 * k); g.fill();
      g.strokeStyle = S.k === 'coral' ? '#D9B880' : S.k === 'moon' ? '#8E8EA0' : '#7A5A34'; g.lineWidth = 1.8 * k; for(let n = 0; n < 14; n++){ const a = R() * TAU, r = 12 + R() * 5; line(g, [q[0] + Math.cos(a) * r * k, q[1] + Math.sin(a) * r * 0.45 * k], [q[0] + Math.cos(a + 0.5) * r * k, q[1] + Math.sin(a + 0.5) * r * 0.45 * k]); }
      const wob = st === 'crack' && !(c && c.still) ? Math.sin(ph(t, 2) * 3) * 0.06 + Math.cos(ph(t, 2) * 3) * 0.03 : 0, ex = q[0], ey = q[1] - 3 * k, sh = (top) => { g.beginPath(); g.moveTo(ex - 11 * k, ey); g.bezierCurveTo(ex - 12 * k, ey - 22 * k, ex + 12 * k, ey - 22 * k, ex + 11 * k, ey); if(top) return; g.bezierCurveTo(ex + 10 * k, ey + 8 * k, ex - 10 * k, ey + 8 * k, ex - 11 * k, ey); g.closePath(); };
      const shell = D.rad(g, ex - 4 * k, ey - 14 * k, 1, 26 * k, [[0, '#FFFFFF'], [0.35, e1], [1, D.sh(e1, -0.28)]]);
      if(st === 'hatched'){ [[-9, 1, -0.5], [9, 2, 0.6]].forEach(([dx, dy, rot]) => { g.save(); g.translate(ex + dx * k, ey + dy * k); g.rotate(rot); g.beginPath(); g.moveTo(-8 * k, 0); g.bezierCurveTo(-8 * k, 8 * k, 8 * k, 8 * k, 8 * k, 0);
          for(let i = 0; i <= 4; i++) g.lineTo((8 - i * 4) * k, (i % 2 ? -3 : 0) * k); g.closePath(); g.fillStyle = e1; g.fill(); g.strokeStyle = '#2A1C14'; g.lineWidth = 1.1 * k; g.stroke(); g.restore(); });
        return; }
      g.save(); g.translate(ex, ey + 4 * k); g.rotate(wob); g.translate(-ex, -(ey + 4 * k)); sh(false); g.fillStyle = shell; g.fill(); g.strokeStyle = '#2A1C14'; g.lineWidth = 1.2 * k; g.stroke();
      g.fillStyle = e2; [[-4, -12, 2.2], [5, -8, 1.8], [-6, -3, 1.6], [2, -16, 1.4], [6, -1, 1.4]].forEach(([dx, dy, r]) => { g.beginPath(); D.ell(g, ex + dx * k, ey + dy * k, r * k, r * 0.8 * k); g.fill(); });
      { const br2 = c && c.still ? 0.4 : 0.4 + 0.18 * Math.sin(ph(t, 2)) + 0.1 * Math.cos(ph(t, 2)); g.fillStyle = 'rgba(255,255,255,' + br2 + ')'; g.beginPath(); D.ell(g, ex - 4 * k, ey - 12 * k, 3 * k, 4.6 * k, -0.4); g.fill(); }
      if(st === 'crack'){ g.strokeStyle = '#2A1C14'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(ex - 10 * k, ey - 7 * k); [[-6, -10], [-3, -6], [1, -11], [4, -6], [8, -9], [10, -6]].forEach(([dx, dy]) => g.lineTo(ex + dx * k, ey + dy * k)); g.stroke();
        if(lv){ g.strokeStyle = 'rgba(255,240,170,0.9)'; g.lineWidth = 0.7 * k; g.stroke(); } }
      g.restore(); }, {zb: 0, top: 40});
    if(lv && st !== 'whole') B.custom(0.5, 0.5, (g, P, k, t) => { const q = P(0.5, 0.5, 0), ex = q[0], ey = q[1] - 3 * k;
      if(st === 'crack'){ D.glow(g, ex, ey - 8 * k, 18 * k, '#FFE27A', 0.45); return; }
      g.fillStyle = 'rgba(255,255,255,0.95)'; [[-4, -18], [6, -24], [0, -10]].forEach(([dx, dy], i) => { const tw = c && c.still ? 1 : 0.7 + 0.2 * Math.sin(ph(t, 2) + i * 2) + 0.1 * Math.cos(ph(t, 2) + i * 2); g.beginPath(); D.star(g, ex + dx * k, ey + dy * k, 3.4 * k * tw, 1.1 * k, 4); g.fill(); }); }, {fx: true, layer: 10}); };
})();
/* ---------- overlays the GAME paints (not props): fight ring · team beam · town shield. to(x, y, z) → screen [x, y] (e.g. V.toScreen), k = zoom ---------- */
// ⭕ the boss FIGHT RING on the ground (cx, cy = lair centre in tiles, r in tiles): mode 'awake' red · 'truce' gold (no team hurts another inside) · 'heal' green (0–5 s after the KO) · 'aurora' rainbow
function fightRing(g, to, cx, cy, r, k, o){ o = o || {}; const mode = o.mode || 'awake', t = o.t || 0, col = {awake: '#E3283A', truce: '#FFC93C', heal: '#3EDC7A', aurora: '#7CF6FF'}[mode] || '#E3283A';
  const ring = (rr) => { g.beginPath(); for(let i = 0; i <= 64; i++){ const a = i / 64 * TAU, q = to(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.closePath(); };
  g.save(); ring(r); g.fillStyle = D.rgba(col, mode === 'heal' ? 0.16 : 0.08); g.fill();
  if(mode === 'aurora'){ const c0 = to(cx - r, cy + r, 0), c1 = to(cx + r, cy - r, 0), gr = g.createLinearGradient(c0[0], 0, c1[0], 0); ['#7CF6FF', '#9BFF6A', '#FFE27A', '#FF9AD6', '#B07CFF'].forEach((cc, i) => gr.addColorStop(i / 4, cc)); g.strokeStyle = gr; }
  else g.strokeStyle = col;
  g.lineWidth = 4 * k; g.setLineDash(mode === 'awake' ? [14 * k, 8 * k] : []); g.lineDashOffset = -t * 30 * k; g.stroke(); g.setLineDash([]);
  ring(r - 0.12); g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.4 * k; g.stroke();
  const n = 8; for(let i = 0; i < n; i++){ const a = i / n * TAU + t * 0.4, q = to(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0); g.fillStyle = mode === 'aurora' ? ['#7CF6FF', '#9BFF6A', '#FFE27A', '#FF9AD6'][i % 4] : col; g.strokeStyle = 'rgba(42,28,20,0.7)'; g.lineWidth = 1.2 * k; g.beginPath();
    if(mode === 'heal'){ D.rr(g, q[0] - 1.6 * k, q[1] - 5 * k, 3.2 * k, 10 * k, 1 * k); D.rr(g, q[0] - 5 * k, q[1] - 1.6 * k, 10 * k, 3.2 * k, 1 * k); }
    else if(mode === 'truce') D.star(g, q[0], q[1], 5.5 * k, 2.4 * k, 5);
    else if(mode === 'aurora') D.star(g, q[0], q[1], 5 * k, 1.6 * k, 4);
    else { g.moveTo(q[0], q[1] - 6 * k); g.lineTo(q[0] + 5 * k, q[1] + 3 * k); g.lineTo(q[0] - 5 * k, q[1] + 3 * k); g.closePath(); }
    g.fill(); g.stroke(); }
  g.restore(); }
// ✨ TEAM BEAM: a light pillar up from a town (the House) while its team fights the boss — the town can't be attacked meanwhile (pattern bands climb the beam)
function beam(g, to, x, y, k, team, o){ o = o || {}; const t = o.t || 0, col = A.teamOf({team}), pat = A.patOf({team}), b = to(x, y, 0), H = (o.h || 300) * k, w = (o.w || 26) * k, fade = o.fade == null ? 1 : o.fade;
  g.save(); g.globalAlpha = fade; g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(0, b[1], 0, b[1] - H); gr.addColorStop(0, D.rgba(col, 0.75)); gr.addColorStop(0.7, D.rgba(col, 0.35)); gr.addColorStop(1, D.rgba(col, 0));
  g.fillStyle = gr; g.beginPath(); g.moveTo(b[0] - w, b[1]); g.lineTo(b[0] - w * 0.55, b[1] - H); g.lineTo(b[0] + w * 0.55, b[1] - H); g.lineTo(b[0] + w, b[1]); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.moveTo(b[0] - w * 0.25, b[1]); g.lineTo(b[0] - w * 0.12, b[1] - H * 0.9); g.lineTo(b[0] + w * 0.12, b[1] - H * 0.9); g.lineTo(b[0] + w * 0.25, b[1]); g.closePath(); g.fill(); g.restore();
  g.save(); g.globalAlpha = fade; for(let i = 0; i < 4; i++){ const f = ((t * 0.5 + i / 4) % 1), yy = b[1] - f * H * 0.8, ww = w * (1 - f * 0.4); g.globalAlpha = fade * (1 - f) * 0.9;
    g.fillStyle = col; g.beginPath(); D.rr(g, b[0] - ww, yy - 4 * k, ww * 2, 8 * k, 4 * k); g.fill(); g.save(); g.clip(); A.patPaint(g, (s, v) => [b[0] - ww + s * k, yy - 4 * k + v * k], ww * 2 / k, 8, pat, A.inkOf(col), k); g.restore(); }
  g.restore(); }
// 🛡️ TOWN SHIELD: a see-through dome over a town (cx, cy, r in tiles) — kind 'aurora' (after the boss falls, ≈ 60 s) or 'team' (the boss-truce beam) · fade 0..1
function shield(g, to, cx, cy, r, k, o){ o = o || {}; const t = o.t || 0, kind = o.kind || 'aurora', fade = o.fade == null ? 1 : o.fade, col = kind === 'team' ? A.teamOf({team: o.team}) : '#7CF6FF';
  const c = to(cx, cy, 0), e = to(cx + r, cy - r, 0), rx = Math.abs(e[0] - c[0]), ry = rx / 2, hh = rx * 0.8;
  g.save(); g.globalAlpha = fade; g.beginPath(); g.moveTo(c[0] + rx, c[1]); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI, false); g.ellipse(c[0], c[1], rx, hh, 0, Math.PI, TAU, false); g.closePath();
  let fill; if(kind === 'aurora'){ fill = g.createLinearGradient(c[0] - rx, c[1] - hh, c[0] + rx, c[1]); ['#7CF6FF', '#9BFF6A', '#FFE27A', '#FF9AD6', '#B07CFF'].forEach((cc, i) => fill.addColorStop((i / 4 + t * 0.1) % 1, D.rgba(cc, 0.22))); }
  else fill = D.rgba(col, 0.16);
  g.fillStyle = fill; g.fill(); g.strokeStyle = D.rgba(kind === 'aurora' ? '#FFFFFF' : col, 0.85); g.lineWidth = 2.4 * k; g.stroke(); g.clip();
  g.strokeStyle = D.rgba(kind === 'aurora' ? '#FFFFFF' : col, 0.35); g.lineWidth = 1 * k; for(let i = 1; i < 6; i++){ const f = i / 6; g.beginPath(); g.ellipse(c[0], c[1] - hh * f * 0.95, rx * Math.sqrt(1 - f * f), ry * Math.sqrt(1 - f * f), 0, 0, TAU); g.stroke(); }
  for(let i = -3; i <= 3; i++){ g.beginPath(); g.ellipse(c[0], c[1], Math.abs(rx * i / 3.2), hh, 0, Math.PI, TAU); g.stroke(); }
  g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); D.ell(g, c[0] - rx * 0.4, c[1] - hh * 0.6, rx * 0.18, hh * 0.1, -0.5); g.fill(); g.restore(); }
Props.AR.WILD = {SKIN, skinOf, RELICS, MEDAL, fightRing, beam, shield, relic};
})();
K.loaded('wild', 'ip-6a');
})(window.Props && window.Props._K);
