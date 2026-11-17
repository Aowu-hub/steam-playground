
/* ================= 🌳 IsoProps — shared 2.5D props on the IsoKit grid (ip-1 · ip-3, 🌳 IsoProps chat, 2026-11-17) =================
   ONE catalogue of houses · shops · trees · decor · landmarks drawn in code, that every IsoKit game picks from (🧳 Avateer · ⚔️ AvataRealm ·
   🏰 TD-Stories · 🏡 Family Room …). IsoKit = the engine (ground, camera, frame); IsoProps = the art on top. Plan: Drive "IsoProps — full plan.md".
   Page:  include('IsoProps') AFTER include('IsoKit'). Global `Props`. Pure canvas, no emoji in the art, no server tags in this file.
   Built from Test Harness/isoprops/kit (10_ip_head · 20_ip_core · 21_ip_catalogue · 22_ip_regions · 23_ip_farm · 24_ip_farm2 · 30_ip_api · 40_ip_town) by build_isoprops.py — never edit IsoProps.html by hand.

   📏 THE 13 RULES (every prop, every chat — a game that adds its own prop follows them too)
     1 🧱 corners follow the grid: anything with corners is built from iso parts in the prop's own footprint frame (x 0…w, y 0…d tiles, z px)
     2 ☀️ same light as the tiles: top +25 % · LEFT face (+y) +12 % · RIGHT face (+x) −16 %
     3 🎨 one palette (Props.MAT + the map look's colours, one accent per region)      4 ✏️ ONE rim #2A1C14 1.5 px made at bake — painters draw no rim
     5 🌳 organic = billboards on a 2 : 1 shadow (long round things lie along the grid)
     6 📐 heights at zoom 1: deco ≤ 24 · post / sign / small thing ≤ 50 · bush 20–36 · tree 50–90 · house 70–110 · big building ≤ 140 · landmark ≤ 200
     7 🏷️ no emoji in prop art (signs are drawn, words in Fredoka)     8 ⚡ baked once per zoom step (+ a tiny optional live layer)     9 🎈 Sky Pop mood
    10 🧩 variants by seed     11 🚪 front = +y (door side); turn 0–3 REBUILDS the model (never a mirrored picture)
    12 🧍 walkers on prop maps = Iso.avatar(who, {size: 0.6}) (≈ 48 px) → doors ≈ 42 px     13 🫥 a tall prop over a walker's pixels fades to 45 %
    14 🍂 every prop handles every CONDITION (🌿 fresh · 🍂 dry · 🏚️ ruined · games add more): its own version (def.conds[key] / build() reading look.cond)
       or the shared fallback (colour grade · cracks · holes · boarded windows · sagging roofs · rubble · bare trees · twig bushes · wilted plants · still live layer)

   CATALOGUE  Props.SETS {jungle, village, temple, bits, landmark, cherry, desert, snow, farm} · Props.list({set, kind, tag}) → [{key, name, set, kind, foot, h, variants, block, door, tags, live}]
   LOOKS      Props.LOOKS {jungle, cherry, desert, snow} · Props.addLook(key, {name, walls[], roofs[], trim, accent, stilts, curve, flat, snow}, base)
              a map picks ONE look; every building re-skins itself from it (a NEW shape → register your own prop with Props.add)
              ip-3: looks {jungle, cherry, desert, snow, farm}; a look may also carry swap {palm: 'datepalm', …} (its own trees) + roles {home: [...], …} (its own town)
   CONDITIONS Props.CONDS {fresh, dry, ruined} · Props.addCondition(key, {name, icon, sat, light, tint, tintA, leaves, crack, holes, boarded, sag, rubble, still}, base)
              WHAT HAPPENED here — stacks with the look (snow + ruined = frozen ruins): pass {cond: 'dry'} to pic / item / place / town
              the GROUND follows too: Iso.map({theme: Props.ground('meadow', 'ruined')}) (straw / ash grass, murky water — via IsoKit's public Iso.addTheme)
   PICTURES   Props.pic(key, {v, turn, look, pal, t}) → an Iso picture (Iso.drawPic / Iso.frame copy it; baked per zoom step)
              Props.canvas(key, {v, turn, look, k: zoom, s: device scale, rim}) → a plain canvas (cards, sheets, thumbnails)
   ON A MAP   it = Props.item(key, i, j, {v, turn, look, z}) → an IsoKit item {x: i, y: j (= the footprint's BACK corner), w, d, pic, alpha} — push it into
              your Iso.frame items; the footprint sort works for free
              it = Props.place(map, key, i, j, {v, turn, look}) → the same item + its footprint cells blocked (door cell + walk-on props stay walkable);
              null when it doesn't fit · Props.fits(map, key, i, j, {turn}) → true | false · Props.remove(map, it) → frees the cells
              it.door = {i, j, out: {i, j}} (inside the doorway / the cell in front of it) for walkers that go in
              Props.at(map, i, j) → the placed prop on a cell · Props.hit(view, items, px, py) → the prop whose PAINTED pixels are under a tap (roofs too)
   STATES     (ip-3b) a prop with def.states rebuilds per state like a turn: {state} in pic / item / place → it.state · Props.setState(it, state, map) flips a placed one
              in place (picture + map cells): 🚪 farmgate open · closed · new · 🌉 plankbridge down · lifted (def.deck: down = the water under it walkable) ·
              🌾 haybale whole · flat (def.walkStates: flat = walk-on) · 🎃 pumpkinpile 1 … 12 · Props.stateOf(key, s) → the state it would get
   WORDS      (ip-3b) a prop with def.text draws a short word at bake: {text: 'BANK →'} (≤ 10 letters, emoji dropped — rule 7) → it.text · 🪧 farmsign
   ANCHORS    (ip-3b) def.stand / def.aim = [x, y, zPx] → it.stand / it.aim = {x, y, z (levels, ground included)} — where a hero stands ON a tower prop and where
              its shots start (🏚️ barn2 deck · farmhouse porch roof · barn hayloft door) · it.mid = the footprint centre
              Props.ring(view, it, range, {g, color, fill, dash}) → {x, y, rx, ry, has(x, y)} the range circle round it.aim (draws when given g = groundFx's context)
   SLOW CELLS (ip-3b) def.cost → place sets the IsoKit cell cost (🕳️ mudpit · 🐷 pigpen = 3, walkers wade slowly); remove puts the old cost back
   EVERY FRAME Props.seeThrough(view, items, walkers) → 🫥 rule 13 (call when a walker moves) · Props.tick(items, t) → the live layer (palm sway,
              flags, smoke, boat bob, elephant steps); it stands still when Iso.budget.fx is low
   WARM       Props.warm(items, view, {onProgress}) → Promise (bakes every prop picture for this zoom step with a loading bar)
   YOUR OWN   Props.add(set, key, {name, kind, foot: [w, d], h, variants, block: true | false | 'posts', door: [dx, dy], organic, tags, live,
              build(B, v, look)}) — B.box · B.roof · B.drum · B.cone · B.flat · B.door · B.win · B.decal · B.bill · B.custom (a MODEL, not a painter:
              that is what makes turn + look work) · Props.check(key) → {ok, problems[]} (size rule, clipping, rim, bake time) */
(function(){
'use strict';
/* ---------- 🖌️ small drawing helpers (from the Avateer R0a painters; no emoji, no page state) ---------- */
const TAU = Math.PI * 2, FONT = "'Fredoka', 'Baloo 2', 'Nunito', sans-serif";
function rgb(h){ const n = parseInt(String(h).replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function sh(h, f){ if(String(h).indexOf('rgb') === 0){ const m = String(h).match(/\d+/g); h = '#' + ((1 << 24) + (+m[0] << 16) + (+m[1] << 8) + +m[2]).toString(16).slice(1); }
  const c = rgb(h), m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)))); return 'rgb(' + m(c[0]) + ',' + m(c[1]) + ',' + m(c[2]) + ')'; }
function rgba(h, a){ const c = rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
// ONE-PIECE parts: fills only here (the bake draws the ONE silhouette rim)
function piece(g, parts, rim, rw){ g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if(rw > 0){ g.strokeStyle = rim; g.lineWidth = rw * 2; parts.forEach(p => { if(p.noRim) return; g.beginPath(); p.path(g); g.stroke(); }); }
  parts.forEach(p => { g.beginPath(); p.path(g); if(p.fill){ g.fillStyle = typeof p.fill === 'function' ? p.fill(g) : p.fill; g.fill(); } if(p.after) p.after(g); }); g.restore(); }
function lin(g, x0, y0, x1, y1, stops){ const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => gr.addColorStop(Array.isArray(c) ? c[0] : i / Math.max(1, stops.length - 1), Array.isArray(c) ? c[1] : c)); return gr; }
function rad(g, x, y, r0, r1, stops){ const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((c, i) => gr.addColorStop(Array.isArray(c) ? c[0] : i / Math.max(1, stops.length - 1), Array.isArray(c) ? c[1] : c)); return gr; }
function glow(g, x, y, r, col, a){ g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rad(g, x, y, 0, r, [[0, rgba(col, a == null ? 0.55 : a)], [1, rgba(col, 0)]]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); }
function star(g, x, y, r1, r2, n, rot){ n = n || 5; rot = rot == null ? -Math.PI / 2 : rot; for(let i = 0; i < n * 2; i++){ const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; i ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function rr(g, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function ell(g, x, y, rx, ry, rot){ g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); }
function rnd(seed){ let s = seed >>> 0 || 1; return () => { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296; }; }
let TEXT_USED = false;   // set while a prop paints words → that picture is re-baked once the web font has landed
function txt(g, s, x, y, o){ o = o || {}; TEXT_USED = true; g.save(); const fam = o.font ? o.font + ', ' + FONT : FONT; g.font = (o.w || 700) + ' ' + (o.size || 16) + 'px ' + fam; g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  if(o.stroke){ g.lineJoin = 'round'; g.strokeStyle = o.stroke; g.lineWidth = o.sw || 4; g.strokeText(s, x, y); }
  g.fillStyle = o.col || '#2B2D42'; g.fillText(s, x, y); g.restore(); }
function card(g, x, y, w, h, o){ o = o || {}; g.save(); if(o.shadow !== false){ g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = o.blur || 14; g.shadowOffsetY = 4; }
  g.fillStyle = o.fill || '#fff'; g.beginPath(); rr(g, x, y, w, h, o.r == null ? 16 : o.r); g.fill(); g.shadowColor = 'transparent';
  if(o.line){ g.strokeStyle = o.line; g.lineWidth = o.lw || 2; g.stroke(); } g.restore(); }
const PD = {TAU, rgb, sh, rgba, piece, lin, rad, glow, star, rr, ell, rnd, txt, card};
/* ---------- 🧱 core: model builder · turner · renderer (one light recipe) · footprint shadow · looks · registry · bake ---------- */
const D = PD, RIM = '#2A1C14', HTW = 32, HTH = 16;
const LIGHT = {top: 0.25, L: 0.12, R: -0.16};
const EDGE = 'rgba(42,28,20,0.26)';
const MAT = {wood: '#C99257', plank: '#E2B07A', thatch: '#E3BE6A', clay: '#E2553A', stone: '#BDB6A2', iron: '#8E8A82', cloth: '#F4EFE4', dark: '#5A3418',
  leaf: '#4CB13A', water: '#5EC3EA', gold: '#F2B731', red: '#D83A34', teal: '#2EC4B6', white: '#FFFFFF', glass: '#FFE58A'};
function lit(c){ if(c && typeof c === 'object') return c; const m = MAT[c] || c; return {top: sh(m, LIGHT.top), L: sh(m, LIGHT.L), R: sh(m, LIGHT.R), base: m}; }

/* ---------- 🔄 turns: model frame → world frame (footprint stays at 0..W × 0..Dd) ---------- */
const NRM = {front: [0, 1], right: [1, 0], back: [0, -1], left: [-1, 0]};
function turner(w, d, turn){ turn = ((turn | 0) % 4 + 4) % 4;
  const f = [(x, y) => [x, y], (x, y) => [y, w - x], (x, y) => [w - x, d - y], (x, y) => [d - y, x]][turn];
  const n = [(a, b) => [a, b], (a, b) => [b, -a], (a, b) => [-a, -b], (a, b) => [-b, a]][turn];
  return {turn, W: turn % 2 ? d : w, D: turn % 2 ? w : d, pt: f, nrm: n}; }
function sideOf(n){ return n[1] > 0.5 ? 'L' : n[0] > 0.5 ? 'R' : null; }   // only the +y (L) and +x (R) faces can be seen

/* ---------- 🧱 the model builder (what a prop's build() receives) ---------- */
function builder(){ const parts = []; const B = {parts,
  box(x, y, z, w, d, h, c, o){ const p = Object.assign({t: 'box', x, y, z, w, d, h, c, decals: []}, o || {}); parts.push(p); return p; },
  // decal on a box side: s = front|right|back|left · a = where along that side it starts (tiles, model frame) · aw = width (tiles) · z0, h = px
  decal(b, s, a, aw, z0, h, fill, o){ b.decals.push(Object.assign({s, a, aw, z0, h, fill}, o || {})); return B; },
  door(b, s, a, aw, h, o){ return B.decal(b, s, a, aw, 0, h || 26, MAT.dark, Object.assign({k: 'door'}, o)); },
  win(b, s, a, aw, z0, h, o){ return B.decal(b, s, a, aw, z0, h || 11, MAT.glass, Object.assign({k: 'win'}, o)); },
  roof(x, y, z, w, d, rh, c, o){ const p = Object.assign({t: 'roof', x, y, z, w, d, rh, c, ridge: 'x', ov: 0.16, kind: 'gable'}, o || {}); parts.push(p); return p; },
  drum(cx, cy, z, r, h, c, o){ const p = Object.assign({t: 'drum', x: cx, y: cy, z, r, h, c}, o || {}); parts.push(p); return p; },
  cone(cx, cy, z, r, h, c, o){ const p = Object.assign({t: 'cone', x: cx, y: cy, z, r, h, c}, o || {}); parts.push(p); return p; },
  flat(x, y, w, d, c, o){ const p = Object.assign({t: 'flat', x, y, w, d, c, z: 0, layer: -9}, o || {}); parts.push(p); return p; },
  // billboard at a model point: paint(g, sx, sy, k, t, v) in screen space (organic things, creatures, flags, glows)
  bill(x, y, z, paint, o){ const p = Object.assign({t: 'bill', x, y, z: z || 0, paint}, o || {}); parts.push(p); return p; },
  // custom painter in world space: draw(g, P, k, t) where P(x, y, z) → screen point of a MODEL point (turn applied)
  custom(x, y, draw, o){ const p = Object.assign({t: 'custom', x, y, z: 0, draw}, o || {}); parts.push(p); return p; },
}; return B; }

/* ---------- 🖌️ painting ---------- */
function poly(g, pts){ g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }
function face(g, pts, fill, k, edge){ poly(g, pts); g.fillStyle = fill; g.fill(); if(edge !== false){ g.lineJoin = 'round'; g.strokeStyle = EDGE; g.lineWidth = Math.max(0.8, 1 * k); g.stroke(); } }
function render(g, model, o){ // o: {ox, oy, k, turn, t, v, w, d, cond}
  const C14 = o.cond && o.cond.key !== 'fresh' ? o.cond : null;   // 🍂 rule 14: the shared fallback for corners (cracks · holes · boards · sag)
  const k = o.k, T = turner(o.w, o.d, o.turn), V = (x, y, z) => [o.ox + (x - y) * HTW * k, o.oy + (x + y) * HTH * k - (z || 0) * k];
  const P = (x, y, z) => { const q = T.pt(x, y); return V(q[0], q[1], z); };
  const rect = p => { const a = T.pt(p.x, p.y), b = T.pt(p.x + p.w, p.y + p.d); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const key = p => { let cx, cy; if(p.t === 'box' || p.t === 'roof' || p.t === 'flat'){ const r = rect(p); cx = (r[0] + r[2]) / 2; cy = (r[1] + r[3]) / 2; } else { const q = T.pt(p.x, p.y); cx = q[0]; cy = q[1]; } return Math.round(((p.layer || 0) * 100 + cx + cy + (p.dz || 0)) * 1000) / 1000; };
  const list = model.parts.map((p, i) => ({p, i, k: key(p)})).sort((a, b) => a.k - b.k || (a.p.z || 0) - (b.p.z || 0) || a.i - b.i);   // same spot → lower part first
  const QL = (pts, u, w) => [pts[0][0] + (pts[1][0] - pts[0][0]) * u + (pts[3][0] - pts[0][0]) * w + (pts[0][0] - pts[1][0] + pts[2][0] - pts[3][0]) * u * w,
    pts[0][1] + (pts[1][1] - pts[0][1]) * u + (pts[3][1] - pts[0][1]) * w + (pts[0][1] - pts[1][1] + pts[2][1] - pts[3][1]) * u * w];   // bilinear point on a face (u along, w across)
  function crack(F, R, len){ let u = 0.18 + R() * 0.64, w = 0.02; g.save(); g.strokeStyle = 'rgba(42,28,20,0.62)'; g.lineWidth = 1.15 * k; g.lineJoin = 'round'; g.beginPath(); let q = F(u, w); g.moveTo(q[0], q[1]);
    const n = 3 + (R() * 2 | 0); for(let i = 0; i < n; i++){ u = Math.max(0.05, Math.min(0.95, u + (R() - 0.5) * 0.16)); w += len / n * (0.7 + R() * 0.6); q = F(u, Math.min(0.96, w)); g.lineTo(q[0], q[1]); } g.stroke(); g.restore(); }
  function hole(F, R, rafters, big){ const sz = big || 1, cu = 0.26 + R() * 0.48, cw = 0.3 + R() * 0.32, n = 8; g.save(); g.beginPath();
    for(let i = 0; i < n; i++){ const a = i / n * TAU, r = 0.5 + R() * 0.6, q = F(cu + Math.cos(a) * 0.15 * r * sz, cw + Math.sin(a) * 0.24 * r * sz); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
    g.closePath(); g.fillStyle = 'rgba(30,20,14,0.86)'; g.fill(); g.clip();
    if(rafters){ g.strokeStyle = '#A27A4E'; g.lineWidth = 2.2 * k; [-0.06, 0.06].forEach(du => { const a = F(cu + du, cw - 0.3), b = F(cu + du, cw + 0.3); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }); }
    g.restore(); }
  // rain stains running down from the top · dirt + dust creeping up from the ground
  function stains(F, R, n){ for(let i = 0; i < n; i++){ const u = 0.1 + R() * 0.8, w = 0.05 + R() * 0.04, L = 0.35 + R() * 0.45, a = F(u, 0), b = F(u, L), gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
      gr.addColorStop(0, 'rgba(40,30,22,0.34)'); gr.addColorStop(1, 'rgba(40,30,22,0)'); g.fillStyle = gr; g.beginPath(); [F(u - w / 2, 0), F(u + w / 2, 0), F(u + w * 0.3, L), F(u - w * 0.3, L)].forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fill(); } }
  function dirt(F, a){ const t = F(0.5, 0.45), b = F(0.5, 1), gr = g.createLinearGradient(t[0], t[1], b[0], b[1]); gr.addColorStop(0, 'rgba(120,88,50,0)'); gr.addColorStop(1, 'rgba(120,88,50,' + a + ')');
    g.fillStyle = gr; g.beginPath(); [F(0, 0.45), F(1, 0.45), F(1, 1), F(0, 1)].forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fill(); }
  let idx = 0;
  list.forEach(({p}) => { const R14 = C14 ? rnd(((o.v | 0) + 1) * 7919 + (idx++) * 104729 + 17) : null;
    if(p.t === 'flat'){ const r = rect(p), C = lit(p.c); face(g, [V(r[0], r[1], 0.5), V(r[2], r[1], 0.5), V(r[2], r[3], 0.5), V(r[0], r[3], 0.5)], p.fill || C.top, k); return; }
    if(p.t === 'box'){ const r = rect(p), C = lit(p.c), z0 = p.z, z1 = p.z + p.h;
      const FL = [V(r[0], r[3], z1), V(r[2], r[3], z1), V(r[2], r[3], z0), V(r[0], r[3], z0)], FR = [V(r[2], r[3], z1), V(r[2], r[1], z1), V(r[2], r[1], z0), V(r[2], r[3], z0)];
      face(g, [V(r[0], r[3], z0), V(r[2], r[3], z0), V(r[2], r[3], z1), V(r[0], r[3], z1)], C.L, k);
      face(g, [V(r[2], r[1], z0), V(r[2], r[3], z0), V(r[2], r[3], z1), V(r[2], r[1], z1)], C.R, k);
      if(p.top !== false) face(g, [V(r[0], r[1], z1), V(r[2], r[1], z1), V(r[2], r[3], z1), V(r[0], r[3], z1)], p.topFill || C.top, k);
      if(p.trim){ g.strokeStyle = 'rgba(42,28,20,0.22)'; g.lineWidth = 1 * k; for(let zz = z0 + p.trim; zz < z1 - 2; zz += p.trim){ g.beginPath(); const a = V(r[0], r[3], zz), b = V(r[2], r[3], zz), c = V(r[2], r[1], zz); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.stroke(); } }
      p.decals.forEach(dc => { const n = T.nrm(NRM[dc.s][0], NRM[dc.s][1]), side = sideOf(n); if(!side) return;
        // the decal's two ends on its side (model frame) → world
        const along = dc.s === 'front' || dc.s === 'back' ? (u => [u, dc.s === 'front' ? p.y + p.d : p.y]) : (u => [dc.s === 'right' ? p.x + p.w : p.x, u]);
        const e0 = along(dc.a), e1 = along(dc.a + dc.aw), A = T.pt(e0[0], e0[1]), Bq = T.pt(e1[0], e1[1]);
        const fill = side === 'L' ? sh(dc.fill, 0.04) : sh(dc.fill, -0.12), zb = z0 + dc.z0, zt = zb + dc.h;
        if(C14 && C14.boarded && (dc.k === 'win' || dc.k === 'door') && !p.keep){ const Q = (u, v) => V(A[0] + (Bq[0] - A[0]) * u, A[1] + (Bq[1] - A[1]) * u, zb + dc.h * v);
          face(g, [Q(0, 0), Q(1, 0), Q(1, dc.k === 'door' ? 0.82 : 1), Q(0.5, 1), Q(0, dc.k === 'door' ? 0.82 : 1)], '#3A2A20', k);   // dark, empty
          g.save(); g.strokeStyle = '#A27A4E'; g.lineCap = 'butt'; g.lineWidth = (dc.k === 'door' ? 3 : 2.4) * k; [[0.02, 0.22, 0.98, 0.78], [0.02, 0.8, 0.98, 0.3]].slice(0, dc.k === 'door' ? 1 : 2).forEach(b => { const a = Q(b[0], b[1]), c2 = Q(b[2], b[3]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c2[0], c2[1]); g.stroke(); }); g.restore(); return; }
        if(dc.k === 'door'){ const pts = [V(A[0], A[1], zb), V(Bq[0], Bq[1], zb), V(Bq[0], Bq[1], zt - dc.h * 0.18), V((A[0] + Bq[0]) / 2, (A[1] + Bq[1]) / 2, zt), V(A[0], A[1], zt - dc.h * 0.18)];
          face(g, pts, fill, k); g.fillStyle = MAT.gold; const kn = V(A[0] + (Bq[0] - A[0]) * 0.78, A[1] + (Bq[1] - A[1]) * 0.78, zb + dc.h * 0.45); g.beginPath(); g.arc(kn[0], kn[1], 1.4 * k, 0, TAU); g.fill(); return; }
        face(g, [V(A[0], A[1], zb), V(Bq[0], Bq[1], zb), V(Bq[0], Bq[1], zt), V(A[0], A[1], zt)], fill, k);
        if(dc.k === 'win'){ g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 1 * k; const m0 = V((A[0] + Bq[0]) / 2, (A[1] + Bq[1]) / 2, zb), m1 = V((A[0] + Bq[0]) / 2, (A[1] + Bq[1]) / 2, zt); g.beginPath(); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
          const sill = [V(A[0], A[1], zb), V(Bq[0], Bq[1], zb)]; g.strokeStyle = sh(MAT.wood, -0.3); g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(sill[0][0], sill[0][1]); g.lineTo(sill[1][0], sill[1][1]); g.stroke(); }
        if(dc.paint) dc.paint(g, (u, v) => V(A[0] + (Bq[0] - A[0]) * u, A[1] + (Bq[1] - A[1]) * u, zb + v), k, side); });
      if(C14 && !p.keep && p.h >= 12){ const big = p.h >= 22 && r[2] - r[0] >= 0.6, bigR = p.h >= 22 && r[3] - r[1] >= 0.6, fL = (u, w) => QL(FL, u, w), fR = (u, w) => QL(FR, u, w);
        if(z0 <= 8){ dirt(fL, 0.22 + 0.25 * C14.crack); dirt(fR, 0.22 + 0.25 * C14.crack); }
        if(C14.holes){ stains(fL, R14, big ? 3 : 1); stains(fR, R14, bigR ? 2 : 1); }
        if(C14.holes && big && R14() < 0.9) hole(fL, R14, true, 1.25); if(C14.holes && bigR && R14() < 0.6) hole(fR, R14, true, 1.1);
        if(R14() < C14.crack) crack((u, w) => QL(FL, u, w), R14, 0.55 + R14() * 0.3); if(R14() < C14.crack * 0.8) crack((u, w) => QL(FR, u, w), R14, 0.45 + R14() * 0.3); }
      return; }
    if(p.t === 'roof'){ const r = rect(p), C = lit(p.c), ov = p.ov, x0 = r[0] - ov, y0 = r[1] - ov, x1 = r[2] + ov, y1 = r[3] + ov, z = p.z, zr = p.z + p.rh * (C14 && !p.keep ? 1 - 0.12 * (C14.sag || 0) : 1);
      let ridge = p.ridge; if(T.turn % 2) ridge = ridge === 'x' ? 'y' : 'x';
      if(p.kind === 'hip'){ const ax = (x0 + x1) / 2, ay = (y0 + y1) / 2, a = V(ax, ay, zr);
        face(g, [V(x0, y1, z), V(x1, y1, z), a], C.L, k); face(g, [V(x1, y0, z), V(x1, y1, z), a], C.R, k);
        if(C14 && C14.holes && !p.keep && p.rh >= 14){ const b0 = V(x0, y1, z), b1 = V(x1, y1, z); hole((u, w) => { const e = [b0[0] + (b1[0] - b0[0]) * u, b0[1] + (b1[1] - b0[1]) * u]; return [e[0] + (a[0] - e[0]) * w * 0.8, e[1] + (a[1] - e[1]) * w * 0.8]; }, R14, true); } }
      else if(ridge === 'x'){ const ym = (y0 + y1) / 2, SL = [V(x0, ym, zr), V(x1, ym, zr), V(x1, y1, z), V(x0, y1, z)]; face(g, SL, C.L, k);
        if(C14 && C14.holes && !p.keep && p.rh >= 14){ hole((u, w) => QL(SL, u, w), R14, true, 1.35); if(x1 - x0 > 1.4) hole((u, w) => QL(SL, u, w), R14, true, 0.9); } face(g, [V(x1, y0, z), V(x1, y1, z), V(x1, ym, zr)], p.gable ? lit(p.gable).R : C.R, k);
        if(p.stripes){ g.strokeStyle = 'rgba(42,28,20,0.13)'; g.lineWidth = 1.1 * k; for(let i = 1; i < p.stripes; i++){ const u = x0 + (x1 - x0) * i / p.stripes, q1 = V(u, ym, zr), q2 = V(u, y1, z); g.beginPath(); g.moveTo(q1[0], q1[1]); g.lineTo(q2[0], q2[1]); g.stroke(); } } }
      else { const xm = (x0 + x1) / 2, SR = [V(xm, y1, zr), V(xm, y0, zr), V(x1, y0, z), V(x1, y1, z)]; face(g, [V(xm, y0, zr), V(xm, y1, zr), V(x1, y1, z), V(x1, y0, z)], C.R, k);
        if(C14 && C14.holes && !p.keep && p.rh >= 14){ hole((u, w) => QL(SR, u, w), R14, true, 1.35); if(y1 - y0 > 1.4) hole((u, w) => QL(SR, u, w), R14, true, 0.9); } face(g, [V(x0, y1, z), V(x1, y1, z), V(xm, y1, zr)], p.gable ? lit(p.gable).L : C.L, k);
        if(p.stripes){ g.strokeStyle = 'rgba(42,28,20,0.13)'; g.lineWidth = 1.1 * k; for(let i = 1; i < p.stripes; i++){ const u = y0 + (y1 - y0) * i / p.stripes, q1 = V(xm, u, zr), q2 = V(x1, u, z); g.beginPath(); g.moveTo(q1[0], q1[1]); g.lineTo(q2[0], q2[1]); g.stroke(); } } }
      if(p.finials){ g.fillStyle = MAT.gold; const ends = ridge === 'x' ? [V(x0, (y0 + y1) / 2, zr), V(x1, (y0 + y1) / 2, zr)] : [V((x0 + x1) / 2, y0, zr), V((x0 + x1) / 2, y1, zr)];
        ends.forEach((e, i) => { g.beginPath(); g.moveTo(e[0], e[1]); g.quadraticCurveTo(e[0] + (i ? 7 : -7) * k, e[1] - 8 * k, e[0] + (i ? 3 : -3) * k, e[1] - 13 * k); g.lineTo(e[0], e[1] - 4 * k); g.closePath(); g.fill(); }); }
      return; }
    if(p.t === 'drum' || p.t === 'cone'){ const q = T.pt(p.x, p.y), c = V(q[0], q[1], p.z), rx = p.r * HTW * k * Math.SQRT2, ry = rx / 2, C = lit(p.c);
      const gr = g.createLinearGradient(c[0] - rx, 0, c[0] + rx, 0); gr.addColorStop(0, C.L); gr.addColorStop(0.45, sh(C.base, 0.05)); gr.addColorStop(1, C.R);
      if(p.t === 'drum'){ const h = p.h * k; g.beginPath(); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI); g.lineTo(c[0] - rx, c[1] - h); g.ellipse(c[0], c[1] - h, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = EDGE; g.lineWidth = k; g.stroke();
        if(p.rings){ g.strokeStyle = 'rgba(42,28,20,0.2)'; for(let i = 1; i < p.rings; i++){ g.beginPath(); g.ellipse(c[0], c[1] - h * i / p.rings, rx, ry, 0, 0, Math.PI); g.stroke(); } }
        if(p.top !== false){ g.beginPath(); g.ellipse(c[0], c[1] - h, rx, ry, 0, 0, TAU); g.fillStyle = p.topFill || C.top; g.fill(); g.strokeStyle = EDGE; g.stroke(); }
        if(C14 && !p.keep && p.h >= 14 && R14() < C14.crack) crack((u, w) => [c[0] - rx * 0.8 + rx * 1.6 * u, c[1] - h + (h + ry) * w], R14, 0.6); }
      else { const a = [c[0], c[1] - p.h * k]; g.beginPath(); g.moveTo(c[0] - rx, c[1]); g.ellipse(c[0], c[1], rx, ry, 0, Math.PI, 0, true); g.lineTo(a[0], a[1]); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = EDGE; g.lineWidth = k; g.stroke();
        if(p.stripes){ g.strokeStyle = 'rgba(42,28,20,0.14)'; for(let i = 1; i < p.stripes; i++){ const u = -1 + 2 * i / p.stripes; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0] + u * rx, c[1] + Math.sqrt(1 - u * u) * ry); g.stroke(); } } }
      return; }
    if(p.t === 'bill'){ const q = T.pt(p.x, p.y), s = V(q[0], q[1], p.z); p.paint(g, s[0], s[1], k, o.t || 0, o.v || 0, T); return; }
    if(p.t === 'custom'){ p.draw(g, P, k, o.t || 0, T); return; }
  });
}
// ground shadow: footprint diamond (corners) or a 2 : 1 ellipse inside the footprint (organic)
function footShadow(g, ox, oy, k, W, Dd, organic, a){ const V = (x, y) => [ox + (x - y) * HTW * k, oy + (x + y) * HTH * k];
  g.fillStyle = 'rgba(30,40,20,' + (a || 0.2) + ')';
  if(organic){ const c = V(W / 2, Dd / 2), r = Math.min(W, Dd) * 0.5 * HTW * k * Math.SQRT2 * 0.92; g.beginPath(); g.ellipse(c[0], c[1], r, r / 2, 0, 0, TAU); g.fill(); return; }
  const e = 0.1; poly(g, [V(-e, -e + 0.15), V(W + e + 0.18, -e + 0.15), V(W + e + 0.18, Dd + e + 0.22), V(-e, Dd + e + 0.22)]); g.fill(); }

/* ---------- 🗺️ map looks: every map can re-skin the same models (Aowu 2026-11-17 14:17: new maps will need their own town / house tweaks) ----------
   A look = palette + small shape switches that EVERY prop reads (walls, roofs, trim, accent, snow caps, lanterns…). A map picks a look by key,
   a game can register its own with addLook(key, {...}, base); a map that needs a NEW shape registers its own prop with add() (same rules). */
// look fields: name · walls[] · roofs[] · trim · accent · stilts · curve · flat · snow (snow caps on every silhouette) ·
//   swap {key: otherKey} (ip-3: a jungle palm on a desert map draws as a date palm — organic props follow the look) · roles {…} (ip-3: the town's homes / shops / trees for this look)
const LOOKS = {};
function addLook(key, o, base){ LOOKS[key] = Object.assign({}, LOOKS[base || 'jungle'] || {}, o, {key}); return LOOKS[key]; }
addLook('jungle', {name: 'Jungle', walls: ['#E8B979', '#D9C7A0', '#F0CFA0', '#C9DDB0'], roofs: ['#E2553A', '#E3BE6A', '#2EC4B6'], trim: '#5A3418', accent: '#E2553A', stilts: true});
addLook('cherry', {name: 'Cherry', walls: ['#FFF3E8', '#F7E1D3', '#FBE9EE', '#EFE6D8'], roofs: ['#3E4A6B', '#B5172A', '#5A6E8C'], trim: '#3B2A2A', accent: '#FF8FB0', stilts: false, curve: true});
addLook('desert', {name: 'Desert', walls: ['#E9C891', '#F2D8A8', '#DDB37A', '#EBCB9C'], roofs: ['#D98E4A', '#C46F3A', '#E9C891'], trim: '#7A4A22', accent: '#2EC4B6', stilts: false, flat: true});
addLook('snow', {name: 'Snow', walls: ['#B98A5E', '#A5764C', '#C99A6C', '#9C6E46'], roofs: ['#5A6E8C', '#7A4A3A', '#3E5A4A'], trim: '#4A2E1C', accent: '#5EC3EA', stilts: false, snow: true});

/* ---------- 🍂 rule 14 — CONDITIONS (Aowu 2026-11-17 16:21 "dry branch, apocalypse, no life feeling … add little by little with a rule") ----------
   A condition = WHAT HAPPENED here (🌿 fresh · 🍂 dry · 🏚️ ruined …); it stacks with the map look (WHERE we are): snow + ruined = frozen ruins.
   Every prop handles every condition: its own version (def.conds[key] for organic painters, or build() reading look.cond) OR this shared fallback —
   colour grade (sat · light · tint) · cracks + holes on boxes / roofs / drums · boarded windows + doors · sagging roofs · rubble at the walls ·
   trees → bare branches (dry keeps a few brown leaves, ruined = snapped) · bushes → twigs · plants → wilted tufts · the live layer stands still.
   A game adds its own with Props.addCondition(key, {…}, base) — every old prop follows it through the fallback, nothing breaks. */
const CONDS = {};
function addCondition(key, o, base){ CONDS[key] = Object.assign({key, name: key, icon: '', sat: 1, light: 0, tint: null, tintA: 0, leaves: 1, crack: 0, holes: 0, boarded: 0, broken: 0, sag: 0, rubble: 0, still: false},
  base ? CONDS[base] : {}, o, {key}); return CONDS[key]; }
addCondition('fresh', {name: 'Fresh', icon: '🌿'});
addCondition('dry', {name: 'Dry', icon: '🍂', sat: 0.5, light: -0.05, tint: '#C9A26A', tintA: 0.2, leaves: 0.3, crack: 0.35, still: true});
addCondition('ruined', {name: 'Ruined', icon: '🏚️', sat: 0.28, light: -0.14, tint: '#8A7A6A', tintA: 0.22, leaves: 0, crack: 1, holes: 1, boarded: 1, broken: 1, sag: 1, rubble: 1, still: true});
function condOf(c){ c = typeof c === 'string' ? CONDS[c] : c; return c && c.key !== 'fresh' ? c : null; }
// 🎨 colour grade of a whole picture body (alpha kept)
function grade(body, c){ if(!c) return; const w = body.width, h = body.height, tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h; const tg = tmp.getContext('2d'); tg.drawImage(body, 0, 0);
  if(c.sat < 1){ tg.globalCompositeOperation = 'saturation'; tg.globalAlpha = 1 - c.sat; tg.fillStyle = '#808080'; tg.fillRect(0, 0, w, h); }
  if(c.tint && c.tintA){ tg.globalCompositeOperation = 'multiply'; tg.globalAlpha = c.tintA; tg.fillStyle = c.tint; tg.fillRect(0, 0, w, h); }
  if(c.light){ tg.globalCompositeOperation = c.light < 0 ? 'multiply' : 'screen'; tg.globalAlpha = Math.abs(c.light) * 2; tg.fillStyle = c.light < 0 ? '#6A6A6A' : '#FFFFFF'; tg.fillRect(0, 0, w, h); }
  tg.globalAlpha = 1; tg.globalCompositeOperation = 'destination-in'; tg.drawImage(body, 0, 0);
  const bg = body.getContext('2d'); bg.save(); bg.setTransform(1, 0, 0, 1, 0, 0); bg.globalCompositeOperation = 'copy'; bg.drawImage(tmp, 0, 0); bg.restore(); }
// ❄️ a look with snow caps the TOP of every silhouette (trees too — "looks reach the trees")
function snowcap(body, n){ n *= 1.35; const w = body.width, h = body.height, cap = document.createElement('canvas'); cap.width = w; cap.height = h; const cg = cap.getContext('2d');
  cg.drawImage(body, 0, 0); cg.globalCompositeOperation = 'source-in'; cg.fillStyle = '#F7FBFF'; cg.fillRect(0, 0, w, h); cg.globalCompositeOperation = 'destination-out'; cg.drawImage(body, 0, Math.max(2, Math.round(n)));
  const bg = body.getContext('2d'); bg.save(); bg.setTransform(1, 0, 0, 1, 0, 0); bg.drawImage(cap, 0, 0); bg.restore(); }
// 🧱 rubble at the foot of a ruined building's front walls
function rubble(g, ox, oy, k, W, Dd, seed){ const R = rnd(seed), V = (x, y, z) => [ox + (x - y) * HTW * k, oy + (x + y) * HTH * k - (z || 0) * k];
  const cols = ['#BDB6A2', '#9C9480', '#C99257', '#8A5A2B', '#A9A291'];
  for(let n = 0; n < 12; n++){ const front = R() < 0.6, u = 0.06 + R() * 0.88, x = front ? u * W : W - 0.04 - R() * 0.14, y = front ? Dd - 0.04 - R() * 0.14 : u * Dd, s = 0.06 + R() * 0.09, hz = 3 + R() * 5;
    const c = cols[(R() * cols.length) | 0], a = V(x - s, y, 0), b = V(x, y + s, 0), c2 = V(x + s, y, 0), top = V(x, y, hz);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c2[0], c2[1]); g.lineTo(top[0] + s * 9 * k, top[1]); g.lineTo(top[0] - s * 7 * k, top[1] - 1 * k); g.closePath(); g.fillStyle = sh(c, R() < 0.5 ? 0.12 : -0.12); g.fill(); g.strokeStyle = EDGE; g.lineWidth = 0.8 * k; g.stroke(); }
  const u = 0.2 + R() * 0.4, p0 = V(u * W, Dd + 0.08, 0), p1 = V(u * W + 0.5, Dd + 0.02, 14);   // one fallen plank leaning on the wall
  g.strokeStyle = '#8A6A44'; g.lineWidth = 3.4 * k; g.lineCap = 'butt'; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 0.8 * k; g.stroke(); }

/* ---------- 🌳 organic props + their shared condition fallback (bare tree · twig bush · wilted tuft) ---------- */
function bareTree(g, x, y, k, h, v, c){ const R = rnd(31 + v * 97), H = h * 0.94, bark = c && c.broken ? '#6E5E50' : '#7E5A3A', ends = [];
  g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = bark; g.fillStyle = bark;
  const snap = c && c.broken, T0 = snap ? H * 0.5 : H * 0.42;
  g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-4, -T0 * 0.5, -2.6, -T0); if(snap){ g.lineTo(-1, -T0 - 6); g.lineTo(0.6, -T0 + 1); g.lineTo(2, -T0 - 8); g.lineTo(3, -T0 - 1); } else g.lineTo(2.6, -T0);
  g.quadraticCurveTo(4, -T0 * 0.5, 6, 0); g.lineTo(10, 2); g.lineTo(4, -3); g.lineTo(-4, -3); g.lineTo(-10, 2); g.closePath(); g.fill();
  function br(x0, y0, ang, len, w, d){ const x1 = x0 + Math.sin(ang) * len, y1 = y0 - Math.cos(ang) * len; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0);
    g.quadraticCurveTo(x0 + Math.sin(ang) * len * 0.5 + (R() - 0.5) * 5, y0 - Math.cos(ang) * len * 0.5, x1, y1); g.stroke();
    if(d > 0){ const n = 2 + (R() < 0.35 ? 1 : 0); for(let i = 0; i < n; i++) br(x1, y1, ang + (i - (n - 1) / 2) * 0.75 + (R() - 0.5) * 0.35, len * (0.6 + R() * 0.14), Math.max(1.2, w * 0.6), d - 1); } else ends.push([x1, y1]); }
  if(snap){ br(-1.5, -T0 * 0.72, -0.9, H * 0.2, 3, 1); br(1.5, -T0 * 0.55, 1.1, H * 0.14, 2.4, 0); }
  else { const L = H * 0.27; br(-1.5, -T0 + 2, -0.45, L, 4.2, 2); br(1.5, -T0 + 2, 0.5, L * 0.95, 4, 2); br(0, -T0, 0.05, L * 1.05, 3.4, 2); }
  const lv = c ? c.leaves : 0; if(lv > 0){ const cols = ['#C98A3A', '#B5652A', '#D9A441', '#9C6A2E']; ends.forEach(([ex, ey], i) => { if(R() > lv * 1.6) return; g.fillStyle = cols[i % cols.length]; for(let n = 0; n < 3; n++){ g.beginPath(); ell(g, ex + (R() - 0.5) * 7, ey + (R() - 0.5) * 6, 3, 2, R() * 3); g.fill(); } }); }
  g.restore(); }
function bareBush(g, x, y, k, h, v, c){ const R = rnd(53 + v * 31), H = h * (c && c.broken ? 0.55 : 0.85); g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round'; g.strokeStyle = '#8A6A44';
  for(let i = 0; i < 11; i++){ const a = (i / 10 - 0.5) * 2.2 + (R() - 0.5) * 0.2, L = H * (0.6 + R() * 0.45), x1 = Math.sin(a) * L, y1 = -Math.cos(a) * L * 0.95; g.lineWidth = 1.8; g.beginPath(); g.moveTo((R() - 0.5) * 6, 0); g.quadraticCurveTo(x1 * 0.4, y1 * 0.6, x1, y1); g.stroke();
    if(R() < 0.6){ g.lineWidth = 1.1; g.beginPath(); g.moveTo(x1 * 0.7, y1 * 0.7); g.lineTo(x1 * 0.7 + Math.sin(a + 0.8) * 6, y1 * 0.7 - Math.cos(a + 0.8) * 6); g.stroke(); } }
  if(c && c.leaves > 0){ g.fillStyle = '#C98A3A'; for(let n = 0; n < 5; n++){ g.beginPath(); ell(g, (R() - 0.5) * H * 1.1, -R() * H * 0.8, 2.6, 1.8, R() * 3); g.fill(); } }
  g.restore(); }
function wiltTuft(g, x, y, k, h, v, c){ const R = rnd(71 + v * 13); g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round';
  for(let i = 0; i < 7; i++){ const bx = (R() - 0.5) * 30, by = (R() - 0.5) * 10, s = R() < 0.5 ? 1 : -1, L = 6 + R() * 4; g.strokeStyle = '#9A8048'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + s * 2, by - L, bx + s * 5, by - L * 0.55); g.stroke();
    g.fillStyle = c && c.broken ? '#6E5E50' : '#A86A3A'; g.beginPath(); ell(g, bx + s * 5, by - L * 0.5, 1.8, 1.4); g.fill(); }
  g.restore(); }
const FALLBACK = {tree: bareTree, bush: bareBush, tuft: wiltTuft};
function deadOf(def){ if(def.dead) return def.dead; if(def.kind === 'tree') return 'tree'; if(def.kind === 'bush') return 'bush'; if(def.tags.indexOf('plant') >= 0) return 'tuft'; return 'keep'; }
// an organic prop = a billboard at the footprint centre; paint(g, x, y, k, t, v, look) — the condition is handled here (own def.conds[key] first)
function organic(set, key, o, fn){ const def = add(set, key, Object.assign({organic: true, kind: 'tree'}, o));
  def.build = (B, v, L) => B.bill(def.foot[0] / 2, def.foot[1] / 2, 0, (g, x, y, k, t) => { const c = L.cond;
    if(c){ const own = def.conds && (def.conds[c.key] || def.conds['*']); if(own) return own(g, x, y, k, t, v, c, L);
      const dead = deadOf(def); if(dead !== 'keep' && c.leaves < 1) return FALLBACK[dead](g, x, y, k, def.h, v, c); }
    fn(g, x, y, k, t, v, L); });
  return def; }

/* ---------- 📚 catalogue ---------- */
const SETS = {}, DEFS = {};
function addSet(key, o){ SETS[key] = Object.assign({key, props: []}, o); return SETS[key]; }
function add(set, key, def){ def = Object.assign({key, set, kind: 'building', foot: [1, 1], h: 40, variants: 1, block: true, turns: 4, organic: false, tags: []}, def); DEFS[key] = def; (SETS[set] || addSet(set, {name: set})).props.push(key); return def; }
/* 🌳 IsoProps — starter catalogue draft (IP-0). Every prop follows the 13 rules: corners = iso parts on the grid, tile light,
   one silhouette rim (from the bake — painters here draw NO rim of their own), organic = billboards on a 2 : 1 shadow, drawn signs (no emoji),
   variants by seed, a front (+y) that turn 0–3 repaints. Walkers on prop maps = Iso.avatar size 0.6 (≈ 48 px at zoom 1) → doors ≈ 42 px. */
(function(){   // 📚 starter catalogue (IP-0 drafts → ip-1)
'use strict';
const K = {add, addSet, MAT, DEFS, organic}, D = PD, M = K.MAT, TAU = Math.PI * 2, sh = D.sh;
const S = (set, o) => K.addSet(set, o);
S('jungle', {name: 'Jungle', icon: '🌴', accent: '#4CB13A'});
S('village', {name: 'Village', icon: '🏘️', accent: '#E2553A'});
S('temple', {name: 'Temple', icon: '🛕', accent: '#F2B731'});
S('bits', {name: 'Game bits', icon: '🎯', accent: '#3A8DFF'});
S('landmark', {name: 'Landmark', icon: '🐘', accent: '#9B5DE5'});
const piece = (g, parts) => D.piece(g, parts, '#000', 0);   // no own rim: the bake draws ONE silhouette rim
const mid = (def) => [def.foot[0] / 2, def.foot[1] / 2];

/* ================= 🌴 jungle (organic = billboards) ================= */
function palm(g, x, y, k, t, v){ const lean = [0, 0.12, -0.1][v % 3], sw = Math.sin(t * 1.5) * 0.05; g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { g.moveTo(-3, 0); g.quadraticCurveTo(-6 + lean * 40, -34, 4 + lean * 60, -66); g.lineTo(9 + lean * 60, -65); g.quadraticCurveTo(lean * 40, -34, 3, 0); g.closePath(); }, fill: g => D.lin(g, -4, 0, 6, 0, ['#D9A26A', '#8A5A2B'])}]);
  g.strokeStyle = 'rgba(42,28,20,0.22)'; g.lineWidth = 1; for(let i = 1; i < 7; i++){ const yy = -i * 9; g.beginPath(); g.moveTo(-3 + lean * i * 8, yy); g.lineTo(5 + lean * i * 8, yy - 2); g.stroke(); }
  g.translate(6 + lean * 60, -66); g.rotate(sw);
  for(let i = 0; i < 7; i++){ const a = -Math.PI / 2 + (i - 3) * 0.55; piece(g, [{path: g => { g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a - 0.3) * 20, Math.sin(a - 0.3) * 20 - 7, Math.cos(a) * 33, Math.sin(a) * 28 + 9); g.quadraticCurveTo(Math.cos(a + 0.3) * 17, Math.sin(a + 0.3) * 17, 0, 0); }, fill: i % 2 ? '#4CB13A' : '#62CC4C'}]); }
  g.fillStyle = '#7A4A22'; [[-2, 3], [3, 4], [0, 6]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 3, 3); g.fill(); }); g.restore(); }
function canopy(g, x, y, k, c, s, fruit, seed){ g.save(); g.translate(x, y); g.scale(k * s, k * s);
  piece(g, [{path: g => { g.moveTo(-6, 0); g.lineTo(-3.5, -30); g.lineTo(3.5, -30); g.lineTo(6, 0); g.closePath(); g.moveTo(-6, 0); g.lineTo(-11, 2); g.lineTo(-4, -5); g.moveTo(6, 0); g.lineTo(11, 2); g.lineTo(4, -5); }, fill: '#8A5A2B'},
    {path: g => { [[-13, -36, 14], [11, -38, 14], [0, -52, 17], [-7, -29, 12], [9, -27, 11]].forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }); }, fill: g => D.rad(g, -5, -54, 3, 38, [c[2], c[0], c[1]])}]);
  g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); D.ell(g, -5, -56, 9, 4.5, -0.3); g.fill();
  if(fruit){ const r = D.rnd(seed || 5); for(let i = 0; i < 6; i++){ g.fillStyle = r() < 0.5 ? '#FFB21A' : '#FF8A2A'; g.beginPath(); D.ell(g, (r() - 0.5) * 36, -(26 + r() * 30), 3.2, 3.9); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); D.ell(g, (r() - 0.5) * 2, 0, 0, 0); } }
  g.restore(); }
const HUES = [['#3FA34D', '#2E8540', '#5CC062'], ['#58B83F', '#3C8F2C', '#7DD05A'], ['#2F9A6A', '#22764F', '#4FC08A']];
function banana(g, x, y, k, t){ g.save(); g.translate(x, y); g.scale(k, k);
  for(let i = 0; i < 6; i++){ const a = -Math.PI / 2 + (i - 2.5) * 0.5; piece(g, [{path: g => { g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * 11 - 6, Math.sin(a) * 26, Math.cos(a) * 20, Math.sin(a) * 33); g.quadraticCurveTo(Math.cos(a) * 13 + 6, Math.sin(a) * 19, 0, 0); }, fill: i % 2 ? '#7FD35A' : '#5DC94A'}]); }
  g.fillStyle = '#FFD23F'; [[4, -14], [7, -12], [5, -10]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 2.2, 4.4, 0.5); g.fill(); }); g.restore(); }
function bamboo(g, x, y, k, c){ g.save(); g.translate(x, y); g.scale(k, k); const snap = c && c.broken;   /* ip-3: c = 🍂 condition → straw canes, no leaves · ruined = snapped */
  [[-7, 50], [0, 62], [7, 44], [-2, 36]].forEach((b, i) => { const H = snap ? b[1] * [0.45, 0.6, 0.35, 0.5][i] : b[1]; piece(g, [{path: g => { if(snap){ g.moveTo(b[0] - 2.6, 0); g.lineTo(b[0] - 2.6, -H); g.lineTo(b[0], -H - 4); g.lineTo(b[0] + 2.6, -H + 1); g.lineTo(b[0] + 2.6, 0); g.closePath(); } else D.rr(g, b[0] - 2.6, -H, 5.2, H, 2); }, fill: c ? '#CDB872' : '#8FCB4A'}]);
    g.strokeStyle = c ? 'rgba(120,96,50,0.55)' : 'rgba(60,90,30,0.55)'; g.lineWidth = 1; for(let yy = -8; yy > -H; yy -= 10){ g.beginPath(); g.moveTo(b[0] - 2.6, yy); g.lineTo(b[0] + 2.6, yy); g.stroke(); } if(!c){ g.fillStyle = '#6FCB4A'; g.beginPath(); D.ell(g, b[0] + 5, -b[1] + 5, 5.5, 2.2, -0.5); g.fill(); } });
  g.restore(); }
function bush(g, x, y, k, v){ const c = HUES[v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { [[-10, -9, 10], [9, -10, 10], [0, -17, 12]].forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }); g.rect(-18, -9, 36, 9); }, fill: g => D.rad(g, -4, -22, 2, 24, [c[2], c[0], c[1]])}]);
  if(v % 2){ g.fillStyle = '#FF8FB0'; [[-8, -14], [6, -19], [10, -7]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 2.4, 2.4); g.fill(); }); } g.restore(); }
function rock(g, x, y, k, v){ g.save(); g.translate(x, y); g.scale(k, k); const sz = [1, 0.8, 1.15][v % 3];
  piece(g, [{path: g => { g.moveTo(-17 * sz, 0); g.quadraticCurveTo(-19 * sz, -14 * sz, -6 * sz, -20 * sz); g.quadraticCurveTo(8 * sz, -24 * sz, 15 * sz, -12 * sz); g.quadraticCurveTo(20 * sz, -3 * sz, 16 * sz, 0); g.closePath(); }, fill: g => D.lin(g, -16, -20, 16, 0, ['#D6D0C2', '#A9A291', '#857E6E'])}]);
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); D.ell(g, -6 * sz, -15 * sz, 5 * sz, 2.4 * sz, -0.3); g.fill(); g.fillStyle = '#6BBB4C'; g.beginPath(); D.ell(g, 8 * sz, -15 * sz, 5 * sz, 2.2 * sz); g.fill(); g.restore(); }
function flowers(g, x, y, k, v){ const r = D.rnd(11 + v * 7), cols = [['#FF8FB0', '#FFD23F'], ['#FFFFFF', '#FF7A5A'], ['#B48CFF', '#FFD23F'], ['#FF5A5A', '#FFFFFF']][v % 4];
  for(let i = 0; i < 6; i++){ const xx = x + (r() - 0.5) * 30 * k, yy = y + (r() - 0.5) * 12 * k; g.strokeStyle = '#4CA83A'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy - 7 * k); g.stroke();
    g.fillStyle = cols[i % 2]; g.beginPath(); for(let p = 0; p < 5; p++){ const a = p * TAU / 5; D.ell(g, xx + Math.cos(a) * 2 * k, yy - 8 * k + Math.sin(a) * 1.6 * k, 1.6 * k, 1.3 * k); } g.fill(); g.fillStyle = '#FFB21A'; g.beginPath(); D.ell(g, xx, yy - 8 * k, 1 * k, 1 * k); g.fill(); } }
const bill = (fn) => (B, v, pal, def) => B.bill(def.foot[0] / 2, def.foot[1] / 2, 0, (g, x, y, k, t) => fn(g, x, y, k, t, v));
const addOrganic = (set, key, o, fn) => K.organic(set, key, o, fn);   // ip-3: the core wrapper handles 🍂 conditions (own def.conds or the shared fallback)
addOrganic('jungle', 'palm', {name: 'Palm', h: 82, variants: 3, tags: ['tree', 'beach']}, (g, x, y, k, t, v) => palm(g, x, y, k, t, v));
addOrganic('jungle', 'jtree', {name: 'Jungle tree', h: 72, variants: 3, tags: ['tree']}, (g, x, y, k, t, v) => canopy(g, x, y, k, HUES[v % 3], 1.08));
addOrganic('jungle', 'mango', {name: 'Mango tree', h: 78, variants: 2, tags: ['tree', 'fruit']}, (g, x, y, k, t, v) => canopy(g, x, y, k, ['#4CA83A', '#2E7A26', '#7CCB55'], 1.12, true, 3 + v));
addOrganic('jungle', 'banana', {name: 'Banana', h: 36, kind: 'bush', tags: ['plant', 'fruit']}, (g, x, y, k, t) => banana(g, x, y, k, t));
addOrganic('jungle', 'bamboo', {name: 'Bamboo', h: 64, tags: ['plant']}, (g, x, y, k) => bamboo(g, x, y, k)).conds = {'*': (g, x, y, k, t, v, c) => bamboo(g, x, y, k, c)};
addOrganic('jungle', 'bush', {name: 'Bush', h: 30, kind: 'bush', variants: 4, tags: ['plant']}, (g, x, y, k, t, v) => bush(g, x, y, k, v));
addOrganic('jungle', 'rock', {name: 'Rock', h: 24, kind: 'deco', variants: 3, tags: ['stone']}, (g, x, y, k, t, v) => rock(g, x, y, k, v));
addOrganic('jungle', 'flowers', {name: 'Flowers', h: 12, kind: 'deco', variants: 4, block: false, shadowA: 0.08, tags: ['plant']}, (g, x, y, k, t, v) => flowers(g, x, y, k, v));
// a log is round but LONG → it lies along the grid and turns with it (custom painter in model space)
(function(){ const def = K.add('jungle', 'log', {name: 'Log', foot: [1, 1], h: 16, kind: 'deco', organic: true, tags: ['wood']});
  def.build = (B) => B.custom(0.5, 0.5, (g, P, k) => { const a = P(0.16, 0.5, 7), b = P(0.84, 0.5, 7), r = 7 * k, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    g.save(); g.translate(a[0], a[1]); g.rotate(ang); const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    g.fillStyle = D.lin(g, 0, -r, 0, r, ['#C99257', '#8A5A2B']); g.beginPath(); g.moveTo(0, -r); g.lineTo(L, -r); g.lineTo(L, r); g.lineTo(0, r); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(42,28,20,0.25)'; g.lineWidth = k; g.beginPath(); g.moveTo(4 * k, -r * 0.3); g.lineTo(L - 6 * k, -r * 0.2); g.stroke();
    const cap = Math.cos(ang) > 0 ? L : 0; g.fillStyle = '#E8C08A'; g.beginPath(); D.ell(g, cap, 0, r * 0.45, r); g.fill(); g.strokeStyle = 'rgba(138,90,43,0.6)'; g.beginPath(); D.ell(g, cap, 0, r * 0.22, r * 0.5); g.stroke();
    g.fillStyle = '#6BBB4C'; g.beginPath(); D.ell(g, L * 0.4, -r, 4 * k, 2 * k); g.fill(); g.restore(); }); })();

/* ================= 🏘️ village (corners on the grid) ================= */
(function(){ const def = K.add('village', 'stilt', {name: 'Stilt house', foot: [2, 2], h: 100, variants: 6, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const wall = L.walls[v % L.walls.length], roof = L.roofs[v % L.roofs.length], lift = L.stilts ? 14 : 0;
    if(lift){ [[0.18, 0.18], [1.66, 0.18], [0.18, 1.66], [1.66, 1.66]].forEach(p => B.box(p[0], p[1], 0, 0.16, 0.16, 14, L.trim));
      B.box(0.85, 1.82, 0, 0.42, 0.34, 4, M.plank); B.box(0.85, 1.82, 4, 0.42, 0.18, 4, M.plank); B.box(0.85, 1.82, 8, 0.42, 0.06, 6, M.plank); }   // steps up to the door
    else B.box(0.1, 0.1, 0, 1.8, 1.8, 4, M.stone);
    const b = B.box(0.15, 0.15, lift || 4, 1.7, 1.7, 46, wall, {trim: 9});
    B.door(b, 'front', 0.86, 0.4, 40, {fill: L.trim}); B.win(b, 'front', 0.3, 0.32, 18, 13); if(v % 2) B.win(b, 'front', 1.4, 0.26, 18, 13); B.win(b, 'right', 0.45, 0.34, 18, 13); B.win(b, 'right', 1.1, 0.3, 18, 13); B.win(b, 'back', 0.6, 0.4, 18, 13);
    const z = (lift || 4) + 46;
    if(L.flat){ B.box(0.1, 0.1, z, 1.8, 1.8, 6, roof, {trim: 0}); B.box(0.25, 0.25, z + 6, 0.5, 0.5, 10, wall); B.drum(1.4, 1.4, z + 6, 0.2, 12, L.accent, {topFill: sh(L.accent, 0.3)}); return; }
    B.roof(0.15, 0.15, z, 1.7, 1.7, L.curve ? 30 : 34, roof, {stripes: L.curve ? 0 : 7, ov: L.curve ? 0.28 : 0.2, ridge: v % 2 ? 'y' : 'x', finials: !!L.curve});
    if(L.snow) B.custom(1, 1, (g, P, k) => { const r = v % 2 ? 'y' : 'x', a = 0.15 - 0.2, b2 = 1.85 + 0.2; g.fillStyle = '#F7FBFF'; g.beginPath();
      if(r === 'x'){ [P(a, 1, z + 34), P(b2, 1, z + 34), P(b2, 1.35, z + 22), P(a, 1.35, z + 22)].forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); }
      else { [P(1, a, z + 34), P(1, b2, z + 34), P(1.35, b2, z + 22), P(1.35, a, z + 22)].forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); }
      g.closePath(); g.fill(); }, {layer: 3}); }; })();
(function(){ const def = K.add('village', 'inn', {name: 'Inn', foot: [3, 2], h: 112, door: [1, 2], tags: ['house', 'big', 'rest']});
  def.build = (B) => { const b = B.box(0.12, 0.12, 0, 2.76, 1.76, 52, M.wood, {trim: 10});
    B.door(b, 'front', 1.25, 0.46, 42); B.win(b, 'front', 0.35, 0.4, 20, 14); B.win(b, 'front', 2.1, 0.4, 20, 14); B.win(b, 'right', 0.45, 0.36, 20, 14); B.win(b, 'right', 1.05, 0.36, 20, 14); B.win(b, 'back', 1.2, 0.4, 20, 14);
    B.roof(0.12, 0.12, 52, 2.76, 1.76, 42, M.thatch, {stripes: 9, ov: 0.24});
    B.box(2.2, 0.35, 66, 0.3, 0.3, 40, M.stone, {layer: 1, dz: -3});   // chimney
    B.custom(1.48, 2, (g, P, k) => { const a = P(1.05, 1.92, 58), b2 = P(1.95, 1.92, 58), c = P(1.5, 1.92, 58); g.strokeStyle = '#5A3418'; g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(a[0], a[1] - 6 * k); g.lineTo(c[0], c[1] - 10 * k); g.lineTo(b2[0], b2[1] - 6 * k); g.stroke();
      const w = 34 * k, h = 16 * k; D.card(g, c[0] - w / 2, c[1] - 6 * k, w, h, {fill: '#FFF6E4', r: 4 * k, shadow: false, line: '#5A3418', lw: 1.4 * k}); D.txt(g, 'INN', c[0], c[1] + 6.5 * k, {size: 10.5 * k, align: 'center', col: '#2A1C14', w: 700}); }, {layer: 2}); }; })();
(function(){ const def = K.add('village', 'stall', {name: 'Market stall', foot: [2, 1], h: 58, door: [1, 1], tags: ['shop']});
  def.build = (B, v) => { const aw = ['#2EC4B6', '#E2553A', '#9B5DE5'][v % 3];
    [[0.1, 0.08], [1.78, 0.08], [0.1, 0.78], [1.78, 0.78]].forEach(p => B.box(p[0], p[1], 0, 0.12, 0.12, 46, M.dark));
    const c = B.box(0.12, 0.2, 0, 1.76, 0.66, 20, M.wood, {trim: 7});
    B.custom(1, 0.5, (g, P, k) => { const goods = [[0.4, '#FF5A5A', 'ball'], [0.75, '#FFB21A', 'ball'], [1.05, '#6BC95A', 'ball'], [1.35, '#3A8DFF', 'pot'], [1.62, '#B8BCC6', 'shield']];
      goods.forEach(gd => { const p = P(gd[0], 0.55, 24); g.fillStyle = gd[1]; g.strokeStyle = 'rgba(42,28,20,0.5)'; g.lineWidth = k;
        if(gd[2] === 'ball'){ for(let i = 0; i < 3; i++){ g.beginPath(); D.ell(g, p[0] + (i - 1) * 3.5 * k, p[1] - (i === 1 ? 3 : 0) * k, 3.2 * k, 3 * k); g.fill(); g.stroke(); } }
        else if(gd[2] === 'pot'){ g.beginPath(); D.ell(g, p[0], p[1] - 3 * k, 4 * k, 4.4 * k); g.fill(); g.stroke(); g.fillStyle = '#E8E1D2'; g.fillRect(p[0] - 1.5 * k, p[1] - 11 * k, 3 * k, 4 * k); }
        else { g.beginPath(); g.moveTo(p[0] - 5 * k, p[1] - 10 * k); g.lineTo(p[0] + 5 * k, p[1] - 10 * k); g.lineTo(p[0] + 4 * k, p[1] - 2 * k); g.lineTo(p[0], p[1] + 1 * k); g.lineTo(p[0] - 4 * k, p[1] - 2 * k); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#F2B731'; g.fillRect(p[0] - 0.8 * k, p[1] - 9 * k, 1.6 * k, 8 * k); } }); }, {layer: 1});
    B.custom(1, 0.5, (g, P, k) => { const z0 = 44, z1 = 56, n = 8; for(let i = 0; i < n; i++){ const u0 = -0.05 + 2.1 * i / n, u1 = -0.05 + 2.1 * (i + 1) / n;
        const pts = [P(u0, 0.0, z1), P(u1, 0.0, z1), P(u1, 1.02, z0), P(u0, 1.02, z0)]; g.beginPath(); pts.forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fillStyle = i % 2 ? '#FFFFFF' : aw; g.fill(); g.strokeStyle = 'rgba(42,28,20,0.18)'; g.lineWidth = k; g.stroke();
        const a = P(u0, 1.02, z0), b = P(u1, 1.02, z0); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 6 * k, b[0], b[1]); g.closePath(); g.fill(); } }, {layer: 3}); }; })();
(function(){ const def = K.add('village', 'smithy', {name: 'Blacksmith', foot: [2, 2], h: 104, door: [0.86, 2], tags: ['shop', 'forge']});
  def.build = (B) => { const b = B.box(0.12, 0.12, 0, 1.76, 1.76, 44, M.stone, {trim: 11});
    B.decal(b, 'front', 0.55, 0.62, 0, 30, '#2B2D42', {paint: (g, Q, k) => { const f = Q(0.5, 6); D.glow(g, f[0], f[1], 20 * k, '#FF7A2E', 0.75); g.fillStyle = '#FF9A3E'; g.beginPath(); D.ell(g, f[0], f[1] + 2 * k, 9 * k, 4 * k); g.fill(); }});
    B.win(b, 'right', 0.5, 0.4, 18, 12);
    B.roof(0.12, 0.12, 44, 1.76, 1.76, 30, '#5A5470', {kind: 'hip', ov: 0.18});
    B.box(1.2, 0.25, 50, 0.36, 0.36, 46, M.stone, {layer: 1, trim: 8});
    B.box(0.55, 1.95, 0, 0.36, 0.22, 10, M.dark, {layer: 1}); B.box(0.5, 1.95, 10, 0.46, 0.22, 6, M.iron, {layer: 1});   // anvil out front
    B.custom(1.4, 0.4, (g, P, k, t) => { const c = P(1.38, 0.43, 100); g.fillStyle = 'rgba(220,220,228,0.75)'; for(let i = 0; i < 3; i++){ g.beginPath(); D.ell(g, c[0] + i * 4 * k, c[1] - i * 9 * k - ((t || 0) * 10 % 6) * k, (4 + i * 2) * k, (3 + i) * k); g.fill(); } }, {layer: 4}); }; })();
(function(){ const def = K.add('village', 'qboard', {name: 'Quest board', foot: [1, 1], h: 48, tags: ['quest']});
  def.build = (B) => { [0.12, 0.8].forEach(x => B.box(x, 0.45, 0, 0.1, 0.1, 40, M.dark));
    const b = B.box(0.08, 0.5, 14, 0.86, 0.1, 24, M.wood);
    B.decal(b, 'front', 0.16, 0.2, 9, 11, '#FFF3DC'); B.decal(b, 'front', 0.42, 0.22, 5, 13, '#FFF3DC'); B.decal(b, 'front', 0.7, 0.18, 10, 10, '#FFF3DC');
    B.box(0.02, 0.48, 38, 0.98, 0.16, 4, M.clay);
    B.custom(0.5, 0.6, (g, P, k) => { const c = P(0.5, 0.6, 52); D.card(g, c[0] - 8 * k, c[1] - 12 * k, 16 * k, 16 * k, {fill: '#FFC21A', r: 8 * k, shadow: false}); D.txt(g, '!', c[0], c[1] + 1.5 * k, {size: 13 * k, align: 'center', col: '#fff', w: 800, font: '"Baloo 2"'}); }, {layer: 2}); }; })();
(function(){ const def = K.add('village', 'well', {name: 'Well', foot: [1, 1], h: 56, tags: ['water']});
  def.build = (B) => { B.drum(0.5, 0.5, 0, 0.36, 16, M.stone, {rings: 2, topFill: '#3A8FBF'});
    [[0.2, 0.46], [0.74, 0.46]].forEach(p => B.box(p[0], p[1], 14, 0.07, 0.07, 26, M.dark, {layer: 1}));
    B.roof(0.16, 0.3, 40, 0.68, 0.4, 14, M.clay, {layer: 2, ov: 0.08}); }; })();
(function(){ const def = K.add('village', 'lantern', {name: 'Lantern post', foot: [1, 1], h: 50, kind: 'post', block: false, tags: ['light', 'night']});
  def.build = (B) => { B.box(0.44, 0.44, 0, 0.12, 0.12, 40, M.dark); B.box(0.36, 0.36, 0, 0.28, 0.28, 4, M.stone);
    B.box(0.41, 0.41, 36, 0.18, 0.18, 10, '#FFD23F', {topFill: '#5A3418'}); B.bill(0.5, 0.5, 41, (g, x, y, k) => D.glow(g, x, y, 16 * k, '#FFD23F', 0.45), {layer: 2}); }; })();
(function(){ const def = K.add('village', 'fence', {name: 'Fence', foot: [2, 1], h: 20, kind: 'fence', tags: ['wall']});
  def.build = (B) => { [0.05, 0.65, 1.25, 1.85].forEach(x => B.box(x, 0.45, 0, 0.1, 0.1, 20, M.wood)); B.box(0.02, 0.47, 7, 1.96, 0.06, 4, M.plank, {dz: 0.01}); B.box(0.02, 0.47, 14, 1.96, 0.06, 4, M.plank, {dz: 0.01}); }; })();
(function(){ const def = K.add('village', 'crates', {name: 'Crates', foot: [1, 1], h: 32, kind: 'thing', variants: 3, tags: ['cargo']});
  def.build = (B, v) => { const plank = c => ({trim: 6}); if(v === 0){ B.box(0.12, 0.3, 0, 0.5, 0.5, 16, M.plank, plank()); B.box(0.55, 0.1, 0, 0.38, 0.38, 12, M.plank, plank()); B.box(0.2, 0.36, 16, 0.36, 0.36, 12, M.wood, plank()); }
    else if(v === 1){ B.box(0.2, 0.2, 0, 0.6, 0.6, 18, M.wood, plank()); B.drum(0.78, 0.78, 0, 0.13, 14, '#B07842', {rings: 2}); }
    else { B.box(0.1, 0.1, 0, 0.4, 0.4, 14, M.plank, plank()); B.box(0.5, 0.5, 0, 0.42, 0.42, 14, M.plank, plank()); B.box(0.5, 0.1, 0, 0.4, 0.38, 12, M.wood, plank()); } }; })();
(function(){ const def = K.add('village', 'signpost', {name: 'Signpost', foot: [1, 1], h: 46, kind: 'post', block: false, tags: ['way']});
  def.build = (B) => { B.box(0.46, 0.46, 0, 0.09, 0.09, 42, M.dark);
    B.custom(0.5, 0.5, (g, P, k) => { [[[0.5, 0.5, 34], [1.05, 0.5, 34], '#E2B07A'], [[0.5, 0.5, 24], [0.5, 1.05, 24], '#C99257']].forEach(s => { const a = P(...s[0]), b = P(...s[1]), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, h = 5 * k;
      const tip = [b[0] + ux * 6 * k, b[1] + uy * 6 * k]; g.beginPath(); g.moveTo(a[0], a[1] - h); g.lineTo(b[0], b[1] - h); g.lineTo(tip[0], tip[1]); g.lineTo(b[0], b[1] + h); g.lineTo(a[0], a[1] + h); g.closePath(); g.fillStyle = s[2]; g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = k; g.stroke();
      g.fillStyle = '#5A3418'; for(let i = 1; i <= 3; i++){ g.beginPath(); g.arc(a[0] + dx * i / 4, a[1] + dy * i / 4, 1.3 * k, 0, TAU); g.fill(); } }); }, {layer: 1}); }; })();
(function(){ const def = K.add('village', 'dock', {name: 'Dock + boat', foot: [2, 2], h: 34, kind: 'bridge', block: false, tags: ['water', 'boat']});
  def.build = (B, v) => { [[0.1, 0.1], [0.1, 0.8], [1.8, 0.1], [1.8, 0.8]].forEach(p => B.box(p[0], p[1], -6, 0.12, 0.12, 16, M.dark));
    B.box(0, 0.05, 6, 2, 0.95, 4, M.plank, {trim: 0});
    B.custom(1, 1.45, (g, P, k, t) => { const bob = Math.sin((t || 0) * 2) * 1.2, z = 3 + bob, x0 = 0.2, x1 = 1.85, ym = 1.45, N = 14;
      const u2x = u => x0 + (x1 - x0) * u, wid = u => 0.27 * Math.pow(Math.sin(Math.PI * u), 0.7), lift = u => 7 * Math.pow(Math.abs(2 * u - 1), 3);
      const rim = side => { const a = []; for(let i = 0; i <= N; i++){ const u = i / N; a.push(P(u2x(u), ym + side * wid(u), z + 6 + lift(u))); } return a; };
      const keel = []; for(let i = 0; i <= N; i++){ const u = i / N; keel.push(P(u2x(u), ym + wid(u) * 0.35, z - 3 + lift(u) * 0.8)); }
      const L = rim(1), R = rim(-1), path = pts => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
      path(R.concat(L.slice().reverse())); g.fillStyle = '#7A4A22'; g.fill();                                   // inside of the boat
      for(let i = 3; i < N; i += 4){ const u = i / N; const a = P(u2x(u), ym - wid(u) * 0.9, z + 5), b = P(u2x(u), ym + wid(u) * 0.9, z + 5); g.strokeStyle = '#C99257'; g.lineWidth = 2.4 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }   // seats
      path(L.concat(keel.slice().reverse())); g.fillStyle = D.sh(['#E2553A', '#2EC4B6', '#FFB21A'][v % 3], 0.12); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = k; g.stroke();   // outer hull (left-lit)
      g.strokeStyle = '#FFF3DC'; g.lineWidth = 1.6 * k; g.beginPath(); L.forEach((q, i) => i ? g.lineTo(q[0], q[1] + 2.5 * k) : g.moveTo(q[0], q[1] + 2.5 * k)); g.stroke();
      const m = P(1.0, ym, z + 5); g.strokeStyle = '#5A3418'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(m[0], m[1]); g.lineTo(m[0], m[1] - 30 * k); g.stroke();
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(m[0] + 1.5 * k, m[1] - 29 * k); g.quadraticCurveTo(m[0] + 17 * k, m[1] - 18 * k, m[0] + 1.5 * k, m[1] - 6 * k); g.closePath(); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = k; g.stroke(); }, {layer: 1}); }; def.variants = 3; })();
(function(){ const def = K.add('village', 'bridge', {name: 'Rope bridge', foot: [3, 1], h: 30, kind: 'bridge', block: false, tags: ['bridge']});
  def.build = (B) => { [[0.05, 0.1], [0.05, 0.82], [2.83, 0.1], [2.83, 0.82]].forEach(p => B.box(p[0], p[1], 0, 0.12, 0.12, 26, M.dark));
    for(let i = 0; i < 12; i++){ const x = 0.18 + i * 0.22, sag = Math.sin(Math.PI * (i + 0.5) / 12) * 5; B.box(x, 0.16, -sag, 0.17, 0.72, 3, i % 3 ? M.plank : M.wood, {dz: -0.5}); }
    B.custom(1.5, 0.5, (g, P, k) => { [0.16, 0.86].forEach(y => { g.strokeStyle = '#8A5A2B'; g.lineWidth = 1.6 * k; g.beginPath(); for(let i = 0; i <= 16; i++){ const x = 0.11 + 2.78 * i / 16, z = 22 - Math.sin(Math.PI * i / 16) * 7, q = P(x, y, z); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
      g.lineWidth = k; for(let i = 1; i < 8; i++){ const x = 0.11 + 2.78 * i / 8, s0 = Math.sin(Math.PI * i / 8), a = P(x, y, 22 - s0 * 7), b = P(x, y, -s0 * 5 + 3); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } }); }, {layer: 2}); }; })();

/* ================= 🛕 temple ================= */
(function(){ const def = K.add('temple', 'prang', {name: 'Boss temple', foot: [3, 3], h: 160, kind: 'landmark', door: [1.5, 3], tags: ['boss', 'temple']});
  def.build = (B) => { const st = '#CBBE9E';
    const a = B.box(0.05, 0.05, 0, 2.9, 2.9, 14, st, {trim: 7}); B.box(0.4, 0.4, 14, 2.2, 2.2, 14, st, {trim: 7}); const c = B.box(0.75, 0.75, 28, 1.5, 1.5, 22, st, {trim: 11});
    B.box(1.25, 2.95, 0, 0.5, 0.05, 2, st);
    B.decal(c, 'front', 1.22, 0.56, 0, 18, '#2B1D14', {k: 'door', paint: (g, Q, k) => { const f = Q(0.5, 10); D.glow(g, f[0], f[1], 26 * k, '#9B5DE5', 0.55); }}); B.decal(c, 'right', 1.25, 0.5, 0, 18, '#2B1D14', {k: 'door'});
    B.drum(1.5, 1.5, 50, 0.6, 22, st, {rings: 2}); B.drum(1.5, 1.5, 72, 0.5, 20, st, {rings: 2}); B.drum(1.5, 1.5, 92, 0.38, 18, st, {rings: 2}); B.cone(1.5, 1.5, 110, 0.3, 30, st, {stripes: 5});
    B.bill(1.5, 1.5, 138, (g, x, y, k) => { g.fillStyle = '#F2B731'; g.beginPath(); g.moveTo(x - 2.5 * k, y + 2 * k); g.lineTo(x, y - 22 * k); g.lineTo(x + 2.5 * k, y + 2 * k); g.closePath(); g.fill(); g.beginPath(); D.ell(g, x, y - 23 * k, 2.6 * k, 2.6 * k); g.fill(); }, {layer: 1});
    B.bill(0.45, 2.55, 14, (g, x, y, k) => { g.fillStyle = '#4CB13A'; g.beginPath(); D.ell(g, x, y, 7 * k, 3 * k, 0.3); g.fill(); }, {layer: 1}); B.bill(2.4, 0.6, 28, (g, x, y, k) => { g.fillStyle = '#5DC94A'; g.beginPath(); D.ell(g, x, y, 6 * k, 2.6 * k, -0.3); g.fill(); }, {layer: 1}); }; })();
(function(){ const def = K.add('temple', 'shrine', {name: 'Spirit shrine', foot: [1, 1], h: 64, tags: ['temple', 'small']});
  def.build = (B) => { B.box(0.36, 0.36, 0, 0.28, 0.28, 4, M.stone); B.box(0.45, 0.45, 4, 0.1, 0.1, 22, M.white);
    B.box(0.2, 0.2, 26, 0.6, 0.6, 4, M.white); const h = B.box(0.27, 0.27, 30, 0.46, 0.46, 16, '#FFF3DC'); B.door(h, 'front', 0.15, 0.16, 12, {fill: '#C0392B'});
    B.roof(0.27, 0.27, 46, 0.46, 0.46, 10, M.red, {ov: 0.08, gable: M.gold, finials: true}); B.roof(0.32, 0.32, 54, 0.36, 0.36, 9, '#2E8F86', {ov: 0.05, finials: true, layer: 1}); }; })();
(function(){ const def = K.add('temple', 'stairs', {name: 'Stone stairs', foot: [1, 2], h: 26, kind: 'thing', block: false, tags: ['path', 'climb']});
  def.build = (B) => { for(let i = 0; i < 5; i++) B.box(0.05, 0.05 + i * 0.38, 0, 0.9, 0.4, 24 - i * 5, '#CBBE9E', {dz: i * 0.01}); }; })();
(function(){ const def = K.add('temple', 'guardian', {name: 'Lion guardian', foot: [1, 1], h: 58, tags: ['statue', 'temple']});
  def.build = (B) => { B.box(0.15, 0.15, 0, 0.7, 0.7, 16, '#CBBE9E', {trim: 8});
    B.bill(0.5, 0.5, 16, (g, x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); const st = g => D.lin(g, -14, -40, 14, 0, ['#E4DCC6', '#B8AC8E']);
      piece(g, [{path: g => { D.rr(g, -12, -16, 24, 16, 6); }, fill: st}, {path: g => { D.ell(g, 0, -28, 13, 13); }, fill: st}, {path: g => { for(let i = 0; i < 9; i++){ const a = i * TAU / 9; g.moveTo(Math.cos(a) * 16, -28 + Math.sin(a) * 16); g.arc(Math.cos(a) * 12, -28 + Math.sin(a) * 12, 5, 0, TAU); } }, fill: '#D9CDAE'}, {path: g => D.ell(g, 0, -27, 10, 10), fill: st}]);
      g.fillStyle = '#2A1C14'; [-4, 4].forEach(ex => { g.beginPath(); D.ell(g, ex, -30, 1.8, 2.2); g.fill(); }); g.strokeStyle = 'rgba(42,28,20,0.5)'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, -24, 3.5, 0.2, Math.PI - 0.2); g.stroke(); g.fillStyle = '#F2B731'; g.beginPath(); D.ell(g, 0, -13, 3, 3); g.fill(); g.restore(); }); }; })();
(function(){ const def = K.add('temple', 'gate', {name: 'Temple gate', foot: [3, 1], h: 88, kind: 'gate', door: [1.5, 1], block: 'posts', tags: ['temple', 'entrance']});
  def.build = (B) => { [0.1, 2.5].forEach(x => { B.box(x, 0.25, 0, 0.4, 0.5, 8, '#CBBE9E'); B.box(x + 0.06, 0.31, 8, 0.28, 0.38, 52, M.red, {trim: 13}); });
    const lt = B.box(0.05, 0.22, 60, 2.9, 0.56, 8, M.red); B.decal(lt, 'front', 1.05, 0.9, 1.5, 5, M.gold); B.roof(0.05, 0.22, 68, 2.9, 0.56, 16, '#2E8F86', {ov: 0.1, finials: true, gable: M.gold}); }; })();
(function(){ const def = K.add('temple', 'bell', {name: 'Temple bell', foot: [1, 1], h: 56, tags: ['temple', 'sound']});
  def.build = (B) => { [[0.12, 0.45], [0.8, 0.45]].forEach(p => B.box(p[0], p[1], 0, 0.1, 0.1, 46, M.red)); B.box(0.06, 0.42, 46, 0.88, 0.16, 6, M.dark);
    B.bill(0.5, 0.5, 44, (g, x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = '#5A3418'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 4); g.stroke();
      piece(g, [{path: g => { g.moveTo(-3, 4); g.quadraticCurveTo(-9, 8, -10, 22); g.lineTo(10, 22); g.quadraticCurveTo(9, 8, 3, 4); g.closePath(); }, fill: g => D.lin(g, -10, 0, 10, 0, ['#F6C95A', '#C98A1E', '#8E5E12'])}]);
      g.strokeStyle = 'rgba(42,28,20,0.3)'; g.beginPath(); g.moveTo(-9, 16); g.lineTo(9, 16); g.stroke(); g.restore(); }, {layer: 1}); }; })();

/* ================= 🎯 game bits ================= */
(function(){ const def = K.add('bits', 'stop', {name: 'Stop pad', foot: [1, 1], h: 40, kind: 'thing', block: false, variants: 3, tags: ['path', 'quest']});
  def.build = (B, v) => { B.drum(0.5, 0.5, 0, 0.36, 4, v === 1 ? '#FFE58A' : '#E8E1D2'); B.box(0.46, 0.46, 4, 0.08, 0.08, 34, M.dark);
    B.bill(0.5, 0.5, 36, (g, x, y, k) => { const col = ['#3A8DFF', '#4CC764', '#FF5A5A'][v % 3]; g.beginPath(); g.moveTo(x + 1.5 * k, y); g.lineTo(x + 22 * k, y + 5 * k); g.lineTo(x + 1.5 * k, y + 12 * k); g.closePath(); g.fillStyle = col; g.fill();
      D.txt(g, String(v + 1), x + 9 * k, y + 9.5 * k, {size: 9 * k, align: 'center', col: '#fff', w: 700}); if(v === 1){ g.fillStyle = '#FFC21A'; g.beginPath(); D.star(g, x, y + 30 * k, 5 * k, 2.2 * k); g.fill(); } }, {layer: 1}); }; })();
(function(){ const def = K.add('bits', 'chest', {name: 'Brain chest', foot: [1, 1], h: 34, kind: 'thing', variants: 2, tags: ['reward', 'puzzle']});
  def.build = (B, v) => { const b = B.box(0.2, 0.3, 0, 0.6, 0.4, 14, '#B07842'); B.decal(b, 'front', 0.44, 0.12, 6, 7, M.gold); B.decal(b, 'right', 0.3, 0.06, 0, 14, M.gold); B.decal(b, 'front', 0.22, 0.05, 0, 14, M.gold); B.decal(b, 'front', 0.73, 0.05, 0, 14, M.gold);
    B.roof(0.2, 0.3, 14, 0.6, 0.4, 8, '#C99257', {ov: 0.02, ridge: 'x', kind: 'gable'});
    if(v === 1) B.bill(0.5, 0.5, 30, (g, x, y, k) => { D.glow(g, x, y, 18 * k, '#9B5DE5', 0.55); g.save(); g.translate(x, y - 6 * k); g.scale(k, k); g.fillStyle = '#B48CFF'; g.strokeStyle = 'rgba(42,28,20,0.5)'; g.lineWidth = 1;   // a drawn puzzle piece
      g.beginPath(); g.moveTo(-6, -6); g.lineTo(-2, -6); g.arc(0, -7, 2.4, Math.PI, 0); g.lineTo(6, -6); g.lineTo(6, -2); g.arc(7, 0, 2.4, -Math.PI / 2, Math.PI / 2); g.lineTo(6, 6); g.lineTo(-6, 6); g.closePath(); g.fill(); g.stroke(); g.restore(); }, {layer: 1}); }; })();
(function(){ const SIDES = ['#E2553A', '#3A8DFF', '#4CC764', '#FFB21A', '#9B5DE5', '#2EC4B6', '#FF7AB6', '#7D8AA0'];
  const def = K.add('bits', 'campflag', {name: 'Camp flag', foot: [1, 1], h: 50, kind: 'post', block: false, variants: 8, tags: ['side', 'camp']});
  def.build = (B, v) => { B.drum(0.5, 0.5, 0, 0.16, 5, M.stone); B.box(0.47, 0.47, 5, 0.06, 0.06, 44, M.dark);
    B.bill(0.5, 0.5, 47, (g, x, y, k, t) => { const w = Math.sin((t || 0) * 4) * 2 * k; g.beginPath(); g.moveTo(x + 1.5 * k, y); g.quadraticCurveTo(x + 12 * k, y - 3 * k + w, x + 26 * k, y + 3 * k); g.lineTo(x + 19 * k, y + 8 * k); g.lineTo(x + 26 * k, y + 14 * k); g.quadraticCurveTo(x + 12 * k, y + 12 * k - w, x + 1.5 * k, y + 15 * k); g.closePath(); g.fillStyle = SIDES[v % 8]; g.fill();
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); D.star(g, x + 11 * k, y + 7.5 * k, 4.2 * k, 1.9 * k); g.fill(); }, {layer: 1}); }; })();
(function(){ const def = K.add('bits', 'marker', {name: 'Warning marker', foot: [1, 1], h: 34, kind: 'thing', block: false, tags: ['danger', 'event']});
  def.build = (B) => { B.flat(0.08, 0.08, 0.84, 0.84, '#FFD23F', {fill: 'rgba(255,90,90,0.28)'}); B.drum(0.5, 0.5, 0, 0.26, 4, '#5A5470');
    B.bill(0.5, 0.5, 6, (g, x, y, k) => { D.glow(g, x, y - 14 * k, 18 * k, '#FF5A5A', 0.4); g.beginPath(); g.moveTo(x, y - 28 * k); g.lineTo(x + 13 * k, y - 4 * k); g.lineTo(x - 13 * k, y - 4 * k); g.closePath(); g.fillStyle = '#FFD23F'; g.fill(); g.strokeStyle = '#E2553A'; g.lineWidth = 2 * k; g.stroke();
      D.txt(g, '!', x, y - 7.5 * k, {size: 15 * k, align: 'center', col: '#2A1C14', w: 800, font: '"Baloo 2"'}); }, {layer: 1}); }; })();

/* ================= 🐘 landmark ================= */
(function(){ const def = K.add('landmark', 'elephant', {name: 'Walking temple', foot: [3, 2], h: 186, kind: 'landmark', organic: true, wide: 20, tags: ['creature', 'temple', 'boss']});
  const leg = (g, x, y, w, h) => D.rr(g, x - w / 2, y - h, w, h, w / 2.4);
  def.build = (B) => B.bill(1.5, 1, 0, (g, x, y, k, t) => { const st = Math.sin(t * 1.6) * 2; g.save(); g.translate(x, y + 4 * k); g.scale(k * 1.12, k * 1.12);
    const grey = g => D.lin(g, 0, -90, 0, 0, ['#C9C3D6', '#9C95AE', '#7A7392']);
    piece(g, [{path: g => { leg(g, -36, st, 18, 40); leg(g, -14, -st, 18, 38); leg(g, 18, st, 18, 40); leg(g, 38, -st, 18, 38); }, fill: '#8E87A2'},
      {path: g => { g.moveTo(-54, -36); g.quadraticCurveTo(-60, -84, -10, -86); g.quadraticCurveTo(44, -88, 52, -48); g.quadraticCurveTo(50, -28, 30, -26); g.lineTo(-40, -26); g.quadraticCurveTo(-54, -26, -54, -36); g.closePath(); }, fill: grey},
      {path: g => D.ell(g, 58, -64, 20, 22), fill: grey},
      {path: g => { g.moveTo(70, -56); g.bezierCurveTo(84, -44, 80, -20, 88, -8); g.lineTo(80, -6); g.bezierCurveTo(72, -18, 72, -36, 62, -48); g.closePath(); }, fill: grey},
      {path: g => { g.moveTo(44, -80); g.quadraticCurveTo(30, -60, 42, -40); g.quadraticCurveTo(56, -46, 54, -70); g.closePath(); }, fill: '#B5AEC6'},
      {path: g => { g.moveTo(-34, -84); g.lineTo(28, -86); g.lineTo(30, -60); g.quadraticCurveTo(0, -52, -32, -60); g.closePath(); }, fill: g => D.lin(g, 0, -86, 0, -54, ['#E63946', '#B5172A'])},
      {path: g => D.rr(g, -26, -112, 48, 28, 3), fill: '#FFF3DC'},
      {path: g => { g.moveTo(-36, -110); g.lineTo(-2, -134); g.lineTo(32, -110); g.lineTo(26, -106); g.lineTo(-30, -106); g.closePath(); }, fill: g => D.lin(g, 0, -134, 0, -106, ['#FF7A4A', '#C0392B'])},
      {path: g => { g.moveTo(-26, -128); g.lineTo(-2, -148); g.lineTo(22, -128); g.lineTo(18, -124); g.lineTo(-22, -124); g.closePath(); }, fill: g => D.lin(g, 0, -148, 0, -124, ['#4CB8A8', '#1F7A6E'])},
      {path: g => { g.moveTo(-5, -146); g.lineTo(-2, -172); g.lineTo(1, -146); g.closePath(); }, fill: '#FFC21A'}]);
    g.fillStyle = '#FFC21A'; [[-36, -110], [32, -110], [-26, -128], [22, -128]].forEach((p, i) => { g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo(p[0] + (i % 2 ? 6 : -6), p[1] - 8, p[0] + (i % 2 ? 2 : -2), p[1] - 12); g.lineTo(p[0], p[1] - 4); g.fill(); });
    g.fillStyle = '#7A4A22'; D.rr(g, -8, -104, 12, 20, 6); g.fill(); g.strokeStyle = '#FFC21A'; g.lineWidth = 2; g.beginPath(); g.moveTo(-34, -64); g.quadraticCurveTo(0, -56, 30, -64); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(66, -50); g.quadraticCurveTo(80, -48, 82, -38); g.quadraticCurveTo(74, -44, 64, -44); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); D.ell(g, 64, -68, 3.2, 3.6); g.fill(); g.fillStyle = '#2A1C14'; g.beginPath(); D.ell(g, 63.4, -67.6, 2, 2.4); g.fill(); g.restore(); }); })();
/* 🎬 live layer (rule 8): period = the painter's own t cycle → Props.tick picks one of 6 baked frames */
[['palm', 2 * Math.PI / 1.5], ['smithy', 0.6], ['dock', Math.PI], ['campflag', Math.PI / 2], ['elephant', 2 * Math.PI / 1.6]].forEach(([k, p]) => { K.DEFS[k].live = {period: p, frames: 6}; });
})();
/* 🗾🏜️❄️ IsoProps — region sets (ip-3, 🌳 IsoProps chat, 2026-11-17): cherry · desert · snow. Same 14 rules as the starter catalogue:
   corners = iso parts on the grid · tile light · ONE rim from the bake (painters draw none) · organic = billboards on a 2 : 1 shadow · no emoji ·
   variants by seed · front = +y, turn rebuilds · 🍂 conditions through the core fallback (or a prop's own conds). Each prop's home look = its set
   (def.look) so a catalogue card shows it dressed right; any map can still place it with its own look. */
(function(){   // 🗾🏜️❄️ region sets
'use strict';
const D = PD, M = MAT, TAU = Math.PI * 2;
const piece = (g, parts) => D.piece(g, parts, '#000', 0);
const S = (set, o) => addSet(set, o);
S('cherry', {name: 'Cherry', icon: '🌸', accent: '#FF8FB0'});
S('desert', {name: 'Desert', icon: '🏜️', accent: '#E9A23B'});
S('snow', {name: 'Snow', icon: '❄️', accent: '#5EC3EA'});
const own = (set, look) => (key, o) => add(set, key, Object.assign({look}, o));
const org = (set, look) => (key, o, fn) => organic(set, key, Object.assign({look}, o), fn);

/* ---------- shared bits for this file ---------- */
// a dome sitting on z (round things = 2 : 1 ellipses): light from the upper left like the tiles
function dome(g, P, k, cx, cy, z, r, h, col){ const c = P(cx, cy, z), rx = r * HTW * k * Math.SQRT2, ry = rx / 2, hh = h * k, C = lit(col);
  g.beginPath(); g.moveTo(c[0] + rx, c[1]); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI, false); g.ellipse(c[0], c[1], rx, hh, 0, Math.PI, TAU, false); g.closePath();
  g.fillStyle = D.rad(g, c[0] - rx * 0.35, c[1] - hh * 0.62, 1, rx * 1.5, [[0, C.top], [0.45, C.L], [1, C.R]]); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = k; g.stroke(); return {c, rx, ry, hh}; }
// water inside a footprint: a ring of model points (looks round on the grid), rim colour around it
function pool(g, P, k, cx, cy, rr, rim, water, cond){ if(cond){ water = cond.holes ? ['#6E6458', '#4E463C'] : ['#8FA88A', '#6E8A6A']; if(cond.holes) rr *= 0.9; } const pts = []; for(let i = 0; i < 28; i++){ const a = i / 28 * TAU, w = 1 + 0.06 * Math.sin(a * 3); pts.push(P(cx + Math.cos(a) * rr * w, cy + Math.sin(a) * rr * w, 1)); }
  const path = (s) => { g.beginPath(); pts.forEach((q, i) => { i ? g.lineTo(q[0], q[1] + s) : g.moveTo(q[0], q[1] + s); }); g.closePath(); };
  path(0); g.fillStyle = rim; g.fill(); g.save(); g.translate(0, 2 * k); const sc = 0.86, m = pts.reduce((a, q) => [a[0] + q[0] / pts.length, a[1] + q[1] / pts.length], [0, 0]);
  g.beginPath(); pts.forEach((q, i) => { const x = m[0] + (q[0] - m[0]) * sc, y = m[1] + (q[1] - m[1]) * sc - 2 * k; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
  g.fillStyle = D.lin(g, 0, m[1] - 20 * k, 0, m[1] + 20 * k, [water[0], water[1]]); g.fill(); g.restore();
  if(cond){ g.strokeStyle = 'rgba(60,40,24,0.55)'; g.lineWidth = 1 * k; const R = D.rnd(3); for(let i = 0; i < 9; i++){ const a = R() * TAU, r0 = 4 * k + R() * 6 * k; g.beginPath(); g.moveTo(m[0] + Math.cos(a) * r0, m[1] + Math.sin(a) * r0 * 0.5); g.lineTo(m[0] + Math.cos(a + 0.2) * (r0 + 8 * k), m[1] + Math.sin(a + 0.2) * (r0 + 8 * k) * 0.5); g.stroke(); } return m; }
  g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.2 * k; g.beginPath(); g.ellipse(m[0] - 6 * k, m[1] - 2 * k, 7 * k, 2 * k, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return m; }
function reeds(g, x, y, k, n, seed, col){ const R = D.rnd(seed); for(let i = 0; i < n; i++){ const bx = x + (R() - 0.5) * 14 * k, L = (14 + R() * 10) * k; g.strokeStyle = col || '#5DA83E'; g.lineWidth = 1.6 * k; g.lineCap = 'round';
  g.beginPath(); g.moveTo(bx, y); g.quadraticCurveTo(bx + (R() - 0.5) * 5 * k, y - L * 0.6, bx + (R() - 0.5) * 6 * k, y - L); g.stroke(); if(R() < 0.5){ g.fillStyle = '#8A5A2B'; g.beginPath(); D.ell(g, bx + (R() - 0.5) * 4 * k, y - L * 0.8, 1.6 * k, 3.4 * k); g.fill(); } } }
const vis = (T, nx, ny) => sideOf(T.nrm(nx, ny));
const line = (g, a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };

/* ================= 🌸 CHERRY ================= */
const CA = own('cherry', 'cherry'), CO = org('cherry', 'cherry');
const BLOS = [['#FFB7CF', '#FF8FB0', '#FFDCE8'], ['#FFF2F6', '#F2C6D4', '#FFFFFF'], ['#FF86B0', '#E4508A', '#FFB0CC']];
function crown(g, list, c){ piece(g, [{path: g => list.forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }), fill: g => D.rad(g, -6, -64, 3, 44, [c[2], c[0], c[1]])}]); }
CO('blossom', {name: 'Blossom tree', h: 74, variants: 3, tags: ['tree', 'flower']}, (g, x, y, k, t, v) => { const c = BLOS[v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { g.moveTo(-6, 0); g.quadraticCurveTo(-2, -14, -6, -28); g.lineTo(-17, -40); g.lineTo(-13, -43); g.lineTo(-3, -33); g.quadraticCurveTo(2, -37, 9, -47); g.lineTo(13, -45); g.lineTo(5, -30); g.quadraticCurveTo(3, -14, 7, 0); g.lineTo(11, 2); g.lineTo(-11, 2); g.closePath(); }, fill: g => D.lin(g, -6, 0, 8, 0, ['#7A5240', '#4A2E24'])}]);
  crown(g, [[-18, -47, 13], [16, -50, 13], [0, -60, 15], [-6, -44, 12], [8, -41, 11], [-27, -39, 9], [25, -41, 9]], c);
  const R = D.rnd(7 + v); for(let i = 0; i < 24; i++){ g.fillStyle = i % 3 ? '#FFFFFF' : c[1]; g.globalAlpha = 0.85; g.beginPath(); D.ell(g, (R() - 0.5) * 52, -34 - R() * 34, 1.7, 1.3); g.fill(); } g.globalAlpha = 1;
  g.fillStyle = c[1]; [[-21, -14], [15, -20], [22, -7]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 2.2, 1.3, 0.6); g.fill(); }); g.restore(); });
CO('maple', {name: 'Maple', h: 68, variants: 2, tags: ['tree', 'autumn']}, (g, x, y, k, t, v) => { const c = [['#E2553A', '#B8321F', '#FF9A6A'], ['#F2A23A', '#D9772A', '#FFD07A']][v % 2]; g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { g.moveTo(-5, 0); g.lineTo(-3, -30); g.lineTo(3, -30); g.lineTo(5, 0); g.lineTo(9, 2); g.lineTo(-9, 2); g.closePath(); }, fill: '#6A4630'}]);
  piece(g, [{path: g => { for(let i = 0; i < 9; i++){ const a = i / 9 * TAU, px = Math.cos(a) * 17, py = -44 + Math.sin(a) * 15; D.star(g, px, py, 10, 6, 5, a); } D.star(g, 0, -46, 16, 10, 5); }, fill: g => D.rad(g, -6, -58, 3, 34, [c[2], c[0], c[1]])}]);
  g.fillStyle = c[0]; [[-19, -10], [13, -6]].forEach(p => { g.beginPath(); D.star(g, p[0], p[1], 3, 1.8, 5); g.fill(); }); g.restore(); });
CO('petalbush', {name: 'Azalea bush', h: 28, kind: 'bush', variants: 2, tags: ['plant', 'flower']}, (g, x, y, k, t, v) => { const fl = ['#FF8FB0', '#FFFFFF'][v % 2]; g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { [[-11, -9, 10], [10, -10, 10], [0, -16, 12]].forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }); g.rect(-19, -9, 38, 9); }, fill: g => D.rad(g, -4, -22, 2, 24, ['#6CC060', '#3F9A3E', '#2E7A30'])}]);
  const R = D.rnd(19 + v); g.fillStyle = fl; for(let i = 0; i < 14; i++){ g.beginPath(); D.ell(g, (R() - 0.5) * 34, -3 - R() * 22, 2.4, 2); g.fill(); } g.fillStyle = '#FF5A8A'; g.beginPath(); D.ell(g, -4, -17, 1, 1); g.fill(); g.restore(); });
// 🏠 town house (machiya): stone base · dark wood ground floor with slatted fronts · eave skirt · white upper floor · curved tiled roof
(function(){ const def = CA('machiya', {name: 'Town house', foot: [2, 2], h: 92, variants: 4, door: [1, 2], tags: ['house', 'home']});
  const slats = (g, Q, k) => { g.strokeStyle = '#D9B48A'; g.lineWidth = 1.1 * k; for(let i = 1; i < 7; i++){ const a = Q(i / 7, 1), b = Q(i / 7, 23); line(g, a, b); } };
  def.build = (B, v, L) => { const wall = L.walls[v % L.walls.length], roof = L.roofs[v % L.roofs.length], wood = v % 2 ? '#6A4630' : '#7A5238';
    B.box(0.1, 0.1, 0, 1.8, 1.8, 4, M.stone);
    const b = B.box(0.15, 0.15, 4, 1.7, 1.7, 34, wood);
    B.decal(b, 'front', 0.22, 0.5, 4, 24, '#4A3022', {paint: slats}); B.door(b, 'front', 0.8, 0.42, 30, {fill: '#3B2A2A'}); B.decal(b, 'front', 1.3, 0.48, 4, 24, '#4A3022', {paint: slats});
    B.decal(b, 'right', 0.3, 1.2, 6, 20, '#4A3022', {paint: slats});
    B.roof(0.15, 0.15, 38, 1.7, 1.7, 7, roof, {kind: 'hip', ov: 0.2});
    const u = B.box(0.32, 0.32, 41, 1.36, 1.36, 20, wall); B.win(u, 'front', 0.48, 0.28, 6, 9); B.win(u, 'front', 1.2, 0.28, 6, 9); B.win(u, 'right', 0.7, 0.4, 6, 9);
    B.roof(0.32, 0.32, 61, 1.36, 1.36, 26, roof, {ov: 0.3, ridge: v % 2 ? 'y' : 'x', finials: !!L.curve});
    if(v >= 2) B.custom(1, 2, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; const a = P(1, 1.88, 36), w = 7 * k; g.fillStyle = '#E2553A'; g.beginPath(); D.ell(g, a[0], a[1], w * 0.8, w); g.fill(); g.fillStyle = '#FFE58A'; g.beginPath(); D.ell(g, a[0], a[1], w * 0.5, w * 0.6); g.fill(); g.fillStyle = '#2A1C14'; g.fillRect(a[0] - 1 * k, a[1] - w - 3 * k, 2 * k, 3 * k); }, {layer: 2});   // a paper lantern by the door
  }; })();
// 🍵 tea house: raised deck · posts · paper walls set back (a veranda in front) · big hip roof
(function(){ const def = CA('teahouse', {name: 'Tea house', foot: [2, 2], h: 84, variants: 3, door: [1, 2], tags: ['house', 'home', 'rest']});
  const shoji = (g, Q, k) => { g.strokeStyle = 'rgba(90,58,38,0.55)'; g.lineWidth = 1 * k; for(let i = 1; i < 6; i++) line(g, Q(i / 6, 0), Q(i / 6, 26)); for(let j = 1; j < 4; j++) line(g, Q(0, j * 6.5), Q(1, j * 6.5)); };
  def.build = (B, v, L) => { const roof = L.roofs[v % L.roofs.length];
    B.box(0, 0, 0, 2, 2, 8, '#8A5A3A');
    [[0.06, 0.06], [1.8, 0.06], [0.06, 1.8], [1.8, 1.8]].forEach(p => B.box(p[0], p[1], 8, 0.14, 0.14, 30, '#5A3A26'));
    const b = B.box(0.32, 0.3, 8, 1.36, 1.2, 30, '#FFF8EC');
    B.decal(b, 'front', 0.36, 1.28, 1, 27, '#FFF8EC', {paint: shoji}); B.decal(b, 'right', 0.34, 1.12, 1, 27, '#FFF8EC', {paint: shoji}); B.door(b, 'front', 0.82, 0.36, 26, {fill: '#E9DCC6'});
    B.box(0.75, 1.95, 0, 0.5, 0.25, 4, M.stone);   // step stone
    B.roof(0, 0, 38, 2, 2, 38, roof, {kind: 'hip', ov: 0.26});
    B.drum(1, 1, 74, 0.06, 6, M.gold, {layer: 1});
  }; })();
// ⛩️ pagoda: three red storeys, each with its own wide skirt roof, gold spire with rings
(function(){ const def = CA('pagoda', {name: 'Pagoda', foot: [2, 2], h: 126, variants: 2, door: [1, 2], tags: ['temple', 'big', 'tower']});
  def.build = (B, v, L) => { const red = ['#C8322A', '#B8462A'][v % 2], roof = L.roofs[0];
    B.box(0.08, 0.08, 0, 1.84, 1.84, 5, M.stone);
    const b1 = B.box(0.32, 0.32, 5, 1.36, 1.36, 24, red); B.door(b1, 'front', 0.8, 0.4, 20, {fill: '#3B2A2A'}); B.win(b1, 'right', 0.85, 0.3, 9, 9);
    B.roof(0.32, 0.32, 29, 1.36, 1.36, 12, roof, {kind: 'hip', ov: 0.34});
    const b2 = B.box(0.52, 0.52, 35, 0.96, 0.96, 17, red); B.win(b2, 'front', 0.86, 0.28, 5, 8); B.win(b2, 'right', 0.86, 0.28, 5, 8);
    B.roof(0.52, 0.52, 52, 0.96, 0.96, 10, roof, {kind: 'hip', ov: 0.3});
    const b3 = B.box(0.66, 0.66, 57, 0.68, 0.68, 13, red);
    B.roof(0.66, 0.66, 70, 0.68, 0.68, 22, roof, {kind: 'hip', ov: 0.28});
    B.custom(1, 1, (g, P, k) => { const a = P(1, 1, 86), b = P(1, 1, 118); g.strokeStyle = '#C99A2E'; g.lineWidth = 2.6 * k; line(g, a, b);
      g.fillStyle = M.gold; for(let i = 0; i < 4; i++){ const q = P(1, 1, 92 + i * 6); g.beginPath(); D.ell(g, q[0], q[1], (5 - i * 0.7) * k, 1.8 * k); g.fill(); } g.beginPath(); D.ell(g, b[0], b[1], 2.4 * k, 2.8 * k); g.fill(); }, {layer: 3});
  }; })();
(function(){ const def = CA('stonelantern', {name: 'Stone lantern', foot: [1, 1], h: 44, kind: 'post', block: false, tags: ['light', 'stone']});   /* like every light post: taken, not a wall (a blocking lantern cut a shop off its road in cherry towns) */
  def.build = (B) => { const st = '#BDB6A2';
    B.box(0.3, 0.3, 0, 0.4, 0.4, 5, st); B.box(0.41, 0.41, 5, 0.18, 0.18, 14, st); B.box(0.33, 0.33, 19, 0.34, 0.34, 4, st);
    const f = B.box(0.37, 0.37, 23, 0.26, 0.26, 9, st); B.decal(f, 'front', 0.43, 0.14, 2, 6, '#FFD35A'); B.decal(f, 'right', 0.43, 0.14, 2, 6, '#FFD35A');
    B.roof(0.3, 0.3, 32, 0.4, 0.4, 7, st, {kind: 'hip', ov: 0.12}); B.drum(0.5, 0.5, 39, 0.05, 4, st, {layer: 1}); }; })();
// ⛩️ arch gate: two red pillars (posts block, the middle is the way through), black top beam with lifted ends
(function(){ const def = CA('archgate', {name: 'Arch gate', foot: [3, 1], h: 84, kind: 'gate', door: [1.5, 1], block: 'posts', variants: 2, tags: ['entrance', 'shrine']});
  def.build = (B, v) => { const red = ['#D8322A', '#E06A2A'][v % 2];
    [0.32, 2.38].forEach(x => { B.box(x - 0.06, 0.29, 0, 0.42, 0.42, 7, '#2A2A2A'); B.box(x, 0.35, 7, 0.3, 0.3, 62, red); });
    B.box(0.12, 0.42, 54, 2.76, 0.16, 6, red);
    B.box(1.38, 0.42, 60, 0.24, 0.16, 9, red, {layer: 1});
    B.box(0.02, 0.38, 69, 2.96, 0.24, 5, red);
    B.custom(1.5, 0.5, (g, P, k) => { const a = P(-0.14, 0.5, 74), b = P(3.14, 0.5, 74), m = P(1.5, 0.5, 74); g.fillStyle = '#2A2A2A'; g.beginPath(); g.moveTo(a[0], a[1] - 5 * k);
      g.quadraticCurveTo(m[0], m[1] + 1 * k, b[0], b[1] - 5 * k); g.lineTo(b[0], b[1] + 2 * k); g.quadraticCurveTo(m[0], m[1] + 8 * k, a[0], a[1] + 2 * k); g.closePath(); g.fill(); }, {layer: 2});
  }; })();
(function(){ const def = CA('koipond', {name: 'Koi pond', foot: [2, 2], h: 16, kind: 'thing', organic: true, shadowA: 0.08, tags: ['water', 'garden']});
  def.build = (B, v, L) => B.custom(1, 1, (g, P, k) => { const m = pool(g, P, k, 1, 1, 0.82, '#A9A291', ['#4FB8DE', '#2E86B8'], L.cond); if(!L.cond)
    [['#FF8A2A', -8, -2, 0.4], ['#FFFFFF', 7, 3, -0.5], ['#E2553A', 2, -6, 2.6]].forEach(f => { g.save(); g.translate(m[0] + f[1] * k, m[1] + f[2] * k); g.rotate(f[3]); g.fillStyle = f[0]; g.beginPath(); D.ell(g, 0, 0, 5 * k, 2 * k); g.fill(); g.beginPath(); g.moveTo(-5 * k, 0); g.lineTo(-8 * k, -2 * k); g.lineTo(-8 * k, 2 * k); g.closePath(); g.fill(); g.restore(); });
    if(!L.cond){ g.fillStyle = '#5DB84A'; [[-14, 4], [12, -5]].forEach(p => { g.beginPath(); g.moveTo(m[0] + p[0] * k, m[1] + p[1] * k); g.arc(m[0] + p[0] * k, m[1] + p[1] * k, 4 * k, 0.4, TAU - 0.2); g.closePath(); g.fill(); }); }
    const R = D.rnd(5); for(let i = 0; i < 14; i++){ const a = i / 14 * TAU, q = P(1 + Math.cos(a) * 0.86, 1 + Math.sin(a) * 0.86, 0); g.fillStyle = D.sh('#BDB6A2', (R() - 0.5) * 0.3); g.beginPath(); D.ell(g, q[0], q[1] - 2 * k, (4 + R() * 3) * k, (3 + R()) * k); g.fill(); } }); })();
// 🌉 arched bridge over a stream (bridges may stand on water)
(function(){ const def = CA('archbridge', {name: 'Arched bridge', foot: [3, 1], h: 40, kind: 'bridge', block: false, tags: ['bridge', 'water']});
  def.build = (B) => B.custom(1.5, 0.5, (g, P, k, t, T) => { const N = 16, zf = u => 4 + 20 * Math.sin(Math.PI * u), X = u => -0.05 + u * 3.1;
    const rail = (y) => { g.strokeStyle = '#D8322A'; g.lineWidth = 2.4 * k; g.beginPath(); for(let i = 0; i <= N; i++){ const q = P(X(i / N), y, zf(i / N) + 12); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
      g.lineWidth = 2 * k; for(let i = 1; i < N; i += 3){ const a = P(X(i / N), y, zf(i / N)), b = P(X(i / N), y, zf(i / N) + 12); line(g, a, b); } };
    const fr = vis(T, 0, 1) ? 0.84 : 0.16, bk = fr > 0.5 ? 0.16 : 0.84;
    rail(bk);
    g.beginPath(); for(let i = 0; i <= N; i++){ const q = P(X(i / N), 0.16, zf(i / N)); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } for(let i = N; i >= 0; i--){ const q = P(X(i / N), 0.84, zf(i / N)); g.lineTo(q[0], q[1]); } g.closePath(); g.fillStyle = '#E2B07A'; g.fill(); g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = k; g.stroke();
    g.beginPath(); for(let i = 0; i <= N; i++){ const q = P(X(i / N), fr, zf(i / N)); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } for(let i = N; i >= 0; i--){ const q = P(X(i / N), fr, zf(i / N) - 5); g.lineTo(q[0], q[1]); } g.closePath(); g.fillStyle = '#C8322A'; g.fill();
    rail(fr); }); })();

/* ================= 🏜️ DESERT ================= */
const DA = own('desert', 'desert'), DO = org('desert', 'desert');
function datepalm(g, x, y, k, t, v, c){ const lean = [0.06, -0.08][v % 2], dead = c && c.leaves < 1, snap = c && c.broken; g.save(); g.translate(x, y); g.scale(k, k);
  const top = snap ? 40 : 70, tx = lean * top;
  piece(g, [{path: g => { g.moveTo(-4.5, 0); g.lineTo(tx - 3, -top); if(snap){ g.lineTo(tx - 1, -top - 5); g.lineTo(tx + 1, -top + 1); g.lineTo(tx + 3, -top - 4); } else g.lineTo(tx + 3, -top); g.lineTo(4.5, 0); g.lineTo(8, 2); g.lineTo(-8, 2); g.closePath(); }, fill: g => D.lin(g, -5, 0, 5, 0, ['#C9925A', '#8A5A2B'])}]);
  g.strokeStyle = 'rgba(42,28,20,0.28)'; g.lineWidth = 1; for(let i = 1; i < top / 6; i++){ const yy = -i * 6, xx = lean * i * 6; g.beginPath(); g.moveTo(xx - 4, yy + 2); g.lineTo(xx, yy - 1); g.lineTo(xx + 4, yy + 2); g.stroke(); }
  if(!snap){ g.translate(tx, -top); const sw = c && c.still ? 0 : Math.sin(t * 1.3) * 0.04; g.rotate(sw);
    for(let i = 0; i < 8; i++){ const a = -Math.PI / 2 + (i - 3.5) * 0.48, droop = dead ? 0.5 : 0.18; piece(g, [{path: g => { g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * 18, Math.sin(a) * 18 - 8, Math.cos(a + droop * Math.sign(Math.cos(a) || 1)) * 34, Math.sin(a) * 18 + 18); g.quadraticCurveTo(Math.cos(a) * 15, Math.sin(a) * 12, 0, 0); }, fill: dead ? (i % 2 ? '#B8945A' : '#9C7A44') : (i % 2 ? '#5FA83E' : '#7CC04E')}]); }
    if(!dead){ g.fillStyle = '#C8642A'; [[-5, 6], [5, 7], [0, 9]].forEach(p => { for(let n = 0; n < 4; n++){ g.beginPath(); D.ell(g, p[0] + (n % 2) * 2.4 - 1.2, p[1] + n * 1.8, 1.8, 2.2); g.fill(); } }); } }
  else { g.translate(tx, -top); [[-0.9, 1], [0.8, -1]].forEach(([a, s]) => piece(g, [{path: g => { g.moveTo(0, 2); g.quadraticCurveTo(s * 10, 4, s * 14, 22); g.lineTo(s * 11, 22); g.quadraticCurveTo(s * 7, 8, 0, 5); }, fill: '#9C7A44'}])); }
  g.restore(); }
(function(){ const def = DO('datepalm', {name: 'Date palm', h: 82, variants: 2, tags: ['tree', 'fruit']}, (g, x, y, k, t, v) => datepalm(g, x, y, k, t, v, null));
  def.conds = {'*': (g, x, y, k, t, v, c) => datepalm(g, x, y, k, t, v, c)}; def.live = {period: 2 * Math.PI / 1.3, frames: 6}; })();
DEFS.palm.conds = {'*': (g, x, y, k, t, v, c) => datepalm(g, x, y, k, t, v, c)};   /* a dry / ruined jungle palm = dead fronds / a snapped trunk, not a branching tree */
function cactus(g, x, y, k, t, v, c){ g.save(); g.translate(x, y); g.scale(k, k); const cs = c ? ['#C2BA72', '#959048', '#76703A'] : ['#7CC45A', '#4F9A3E', '#3A7A30'], col = g => D.lin(g, -10, 0, 10, 0, cs), snap = c && c.broken;
  const arm = (s, y0, up) => ({path: g => { g.moveTo(s * 4, -y0); g.lineTo(s * 13, -y0); g.quadraticCurveTo(s * 18, -y0, s * 18, -y0 - 6); g.lineTo(s * 18, -y0 - up); g.arc(s * 14.5, -y0 - up, 3.5, 0, Math.PI, true); g.lineTo(s * 11, -y0 - 6); g.lineTo(s * 4, -y0 - 6); g.closePath(); }, fill: col});
  if(snap){ piece(g, [{path: g => { g.moveTo(-6, 0); g.lineTo(-6, -30); g.lineTo(-3, -34); g.lineTo(-1, -29); g.lineTo(2, -35); g.lineTo(6, -31); g.lineTo(6, 0); g.closePath(); }, fill: col}, arm(-1, 16, 8),
      {path: g => { g.moveTo(9, 2); g.lineTo(28, -1); g.arc(28, 2.5, 3.5, -Math.PI / 2, Math.PI / 2); g.lineTo(9, 6); g.closePath(); }, fill: col}]); g.restore(); return; }
  piece(g, [{path: g => { g.moveTo(-6, 0); g.lineTo(-6, -50); g.arc(0, -50, 6, Math.PI, 0); g.lineTo(6, 0); g.closePath(); }, fill: col}, arm(-1, 22, 14), arm(1, v % 2 ? 30 : 16, v % 2 ? 12 : 18)]);
  g.strokeStyle = 'rgba(30,70,30,0.35)'; g.lineWidth = 1; [-2.5, 2.5].forEach(xx => { g.beginPath(); g.moveTo(xx, -2); g.lineTo(xx, -52); g.stroke(); });
  if(v % 2 && !c){ g.fillStyle = '#FF7AA8'; g.beginPath(); D.star(g, 0, -57, 4, 2, 6); g.fill(); g.fillStyle = '#FFD23F'; g.beginPath(); D.ell(g, 0, -57, 1.4, 1.4); g.fill(); } g.restore(); }
(function(){ const def = DO('cactus', {name: 'Tall cactus', h: 60, variants: 2, tags: ['plant', 'desert']}, (g, x, y, k, t, v) => cactus(g, x, y, k, t, v, null)); def.conds = {'*': (g, x, y, k, t, v, c) => cactus(g, x, y, k, t, v, c)}; })();
function rcactus(g, x, y, k, t, v, c){ g.save(); g.translate(x, y); g.scale(k, k); if(c && c.broken) g.scale(1.1, 0.62); const cs = c ? ['#C2BA72', '#959048', '#76703A'] : ['#8ACB5A', '#4F9A3E', '#3A7A30'];
  if(v % 2){ piece(g, [{path: g => { D.ell(g, -6, -10, 7, 10, -0.3); D.ell(g, 7, -9, 6, 9, 0.35); D.ell(g, 1, -21, 5, 7, 0.1); }, fill: g => D.lin(g, -12, 0, 12, 0, [cs[0], cs[1]])}]);
    if(!c){ g.fillStyle = '#FFD23F'; [[-6, -20], [3, -27], [9, -17]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 2.2, 2.2); g.fill(); }); } }
  else { piece(g, [{path: g => { g.moveTo(-12, 0); g.quadraticCurveTo(-14, -20, 0, -22); g.quadraticCurveTo(14, -20, 12, 0); g.closePath(); }, fill: g => D.lin(g, -12, 0, 12, 0, cs)}]);
    g.strokeStyle = 'rgba(30,70,30,0.4)'; g.lineWidth = 1; [-7, 0, 7].forEach(xx => { g.beginPath(); g.moveTo(xx * 0.9, -1); g.quadraticCurveTo(xx * 1.2, -12, xx * 0.6, -20); g.stroke(); });
    if(!c){ g.fillStyle = '#FF5A8A'; g.beginPath(); D.star(g, 0, -22, 4.5, 2.2, 6); g.fill(); g.fillStyle = '#FFD23F'; g.beginPath(); D.ell(g, 0, -22, 1.4, 1.4); g.fill(); } }
  g.restore(); }
(function(){ const def = DO('roundcactus', {name: 'Round cactus', h: 26, kind: 'bush', variants: 2, tags: ['plant', 'desert']}, (g, x, y, k, t, v) => rcactus(g, x, y, k, t, v, null)); def.conds = {'*': (g, x, y, k, t, v, c) => rcactus(g, x, y, k, t, v, c)}; })();
DO('mesarock', {name: 'Sandstone rock', h: 24, kind: 'deco', variants: 2, dead: 'keep', tags: ['stone', 'desert']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k); const s = [1, 0.8][v % 2];
  piece(g, [{path: g => { g.moveTo(-17 * s, 0); g.lineTo(-15 * s, -9 * s); g.lineTo(-11 * s, -11 * s); g.lineTo(-10 * s, -19 * s); g.lineTo(7 * s, -21 * s); g.lineTo(10 * s, -12 * s); g.lineTo(16 * s, -9 * s); g.lineTo(17 * s, 0); g.closePath(); }, fill: g => D.lin(g, -16, -20, 16, 0, ['#F2C48A', '#D98E4A', '#B5652A'])}]);
  g.strokeStyle = 'rgba(122,74,34,0.4)'; g.lineWidth = 1; [-6, -13].forEach(yy => { g.beginPath(); g.moveTo(-15 * s, yy * s); g.lineTo(15 * s, (yy + 1) * s); g.stroke(); }); g.restore(); });
// 🏠 mud-brick house: flat roof with a low wall round it, beams poking out, sometimes a little room on top
(function(){ const def = DA('mudhouse', {name: 'Mud-brick house', foot: [2, 2], h: 80, variants: 4, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const wall = L.walls[v % L.walls.length], dark = '#7A4A22';
    const b = B.box(0.15, 0.15, 0, 1.7, 1.7, 42, wall);
    B.door(b, 'front', 0.8, 0.4, 30, {fill: dark}); B.win(b, 'front', 0.34, 0.24, 20, 10, {fill: '#5A3A26'}); B.win(b, 'right', 0.5, 0.26, 20, 10, {fill: '#5A3A26'}); B.win(b, 'right', 1.2, 0.26, 20, 10, {fill: '#5A3A26'});
    const pw = sh(wall, -0.04); B.box(0.15, 0.15, 42, 1.7, 0.12, 5, pw); B.box(0.15, 1.73, 42, 1.7, 0.12, 5, pw); B.box(0.15, 0.27, 42, 0.12, 1.46, 5, pw); B.box(1.73, 0.27, 42, 0.12, 1.46, 5, pw);
    [0.4, 0.8, 1.2, 1.6].forEach(x => B.box(x, 1.84, 36, 0.08, 0.12, 3, dark, {layer: 1}));
    if(v % 2){ const u = B.box(0.3, 0.3, 42, 0.8, 0.8, 24, wall); B.win(u, 'front', 0.55, 0.26, 9, 9, {fill: '#5A3A26'}); B.box(0.28, 0.28, 66, 0.84, 0.84, 3, pw); }
    if(v >= 2) B.box(0.72, 1.85, 30, 0.56, 0.22, 2, L.accent, {layer: 1});   // cloth awning over the door
  }; })();
// 🕌 dome house: whitewashed walls, coloured dome, gold tip
(function(){ const def = DA('domehouse', {name: 'Dome house', foot: [2, 2], h: 86, variants: 3, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const wall = ['#F7F1E4', '#F2E4CC', '#EFE8DA'][v % 3], top = [L.accent || '#2EC4B6', '#3A8DFF', '#E9A23B'][v % 3];
    B.box(0.1, 0.1, 0, 1.8, 1.8, 4, '#D9B87A');
    const b = B.box(0.18, 0.18, 4, 1.64, 1.64, 38, wall); B.door(b, 'front', 0.8, 0.4, 30, {fill: '#5A3A26'}); B.win(b, 'front', 0.38, 0.24, 18, 12, {fill: top}); B.win(b, 'right', 0.85, 0.3, 18, 12, {fill: top});
    B.box(0.18, 0.18, 42, 1.64, 1.64, 3, sh(wall, -0.06));
    B.custom(1, 1, (g, P, k) => { const d = dome(g, P, k, 1, 1, 45, 0.6, 30, top); g.strokeStyle = '#C99A2E'; g.lineWidth = 2 * k; const a = [d.c[0], d.c[1] - d.hh]; line(g, a, [a[0], a[1] - 9 * k]); g.fillStyle = M.gold; g.beginPath(); D.ell(g, a[0], a[1] - 10 * k, 2.4 * k, 2.6 * k); g.fill(); }, {layer: 2});
  }; })();
// ⛺ market tent: cloth roof on posts, open at the front, rug + goods inside
(function(){ const def = DA('tent', {name: 'Market tent', foot: [2, 2], h: 64, variants: 3, door: [1, 2], tags: ['shop', 'tent']});
  def.build = (B, v) => { const cloth = ['#E2553A', '#2EC4B6', '#9B5DE5'][v % 3];
    B.flat(0.12, 0.12, 1.76, 1.76, '#B5452A', {fill: '#C25A3A'});
    B.box(0.12, 0.12, 0, 1.76, 0.1, 30, M.cloth); B.box(1.78, 0.12, 0, 0.1, 1.76, 30, M.cloth);
    [[0.12, 1.76], [1.76, 1.76]].forEach(p => B.box(p[0], p[1], 0, 0.1, 0.1, 30, M.dark));
    B.custom(1, 0.6, (g, P, k) => { [[0.5, 0.45, '#D98E4A'], [0.85, 0.4, '#3A8DFF'], [1.35, 0.5, '#D98E4A']].forEach(q => { const p = P(q[0], q[1], 0); g.fillStyle = q[2]; g.beginPath(); D.ell(g, p[0], p[1] - 7 * k, 5 * k, 7 * k); g.fill(); g.fillStyle = sh(q[2], -0.2); g.fillRect(p[0] - 2 * k, p[1] - 16 * k, 4 * k, 3 * k); });
      [[1.5, 1.0, '#9B5DE5'], [1.55, 1.3, '#FFD23F']].forEach(q => { const a = P(q[0], q[1], 4), b = P(q[0], q[1] + 0.25, 4); g.strokeStyle = q[2]; g.lineWidth = 6 * k; g.lineCap = 'round'; line(g, a, b); }); }, {layer: 1});
    B.roof(0.02, 0.02, 30, 1.96, 1.96, 26, cloth, {ov: 0.14, stripes: 8});
    B.custom(1, 2, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; for(let i = 0; i < 7; i++){ const a = P(0.0 + i * 0.29, 2.13, 30), b = P(0.29 + i * 0.29, 2.13, 30), m = P(0.145 + i * 0.29, 2.13, 25); g.fillStyle = i % 2 ? '#FFF6E4' : cloth; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(m[0], m[1]); g.closePath(); g.fill(); } }, {layer: 3});
  }; })();
(function(){ const def = DA('oasis', {name: 'Oasis pool', foot: [2, 2], h: 30, kind: 'thing', organic: true, shadowA: 0.08, tags: ['water']});
  def.build = (B, v, L) => B.custom(1, 1, (g, P, k) => { const m = pool(g, P, k, 1, 1, 0.8, '#E2C48A', ['#49C2D8', '#1E8FB0'], L.cond), dry = L.cond ? '#A8905A' : null;
    reeds(g, m[0] - 24 * k, m[1] - 2 * k, k, L.cond && L.cond.holes ? 2 : 5, 3, dry); reeds(g, m[0] + 20 * k, m[1] + 6 * k, k, L.cond && L.cond.holes ? 1 : 4, 8, dry); if(L.cond) return;
    g.fillStyle = '#5DB84A'; g.beginPath(); g.moveTo(m[0] + 6 * k, m[1] - 4 * k); g.arc(m[0] + 6 * k, m[1] - 4 * k, 4 * k, 0.3, TAU - 0.2); g.closePath(); g.fill(); }); })();
(function(){ const def = DA('pots', {name: 'Clay pots', foot: [1, 1], h: 28, kind: 'thing', variants: 3, tags: ['cargo', 'clay']});
  def.build = (B, v) => { const c = ['#D98E4A', '#C46F3A', '#3A8DFF'][v % 3];
    [[0.36, 0.38, 0.17, 15], [0.66, 0.5, 0.14, 12], [0.42, 0.7, 0.12, 9]].slice(0, 2 + (v % 2)).forEach(p => { B.drum(p[0], p[1], 0, p[2], p[3], c); B.drum(p[0], p[1], p[3], p[2] * 0.5, 5, c, {topFill: '#4A2E1C'}); }); }; })();
(function(){ const def = DA('hitch', {name: 'Hitching post', foot: [1, 1], h: 40, kind: 'post', tags: ['camel', 'rest']});
  def.build = (B) => { B.box(0.12, 0.42, 0, 0.12, 0.12, 34, M.wood); B.box(0.76, 0.42, 0, 0.12, 0.12, 34, M.wood); B.box(0.08, 0.42, 30, 0.84, 0.12, 5, M.wood, {layer: 1});
    B.custom(0.5, 0.5, (g, P, k) => { const a = P(0.3, 0.48, 30), b = P(0.7, 0.48, 30); g.fillStyle = '#E2553A'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(b[0], b[1] + 16 * k); g.lineTo(a[0], a[1] + 16 * k); g.closePath(); g.fill();
      g.fillStyle = '#FFD23F'; [0.3, 0.6].forEach(f => { g.fillRect(a[0], a[1] + 16 * k * f, b[0] - a[0], 2.2 * k); }); }, {layer: 2});
    B.drum(0.5, 0.82, 0, 0.12, 8, M.wood, {topFill: '#5EC3EA'}); }; })();
// 🔺 pyramid: a puzzle machine — stone courses, gold cap, a glowing glyph band and a doorway at the front
(function(){ const def = DA('pyramid', {name: 'Pyramid', foot: [3, 3], h: 132, kind: 'landmark', door: [1.5, 3], tags: ['landmark', 'puzzle', 'big']});
  def.build = (B) => { const H = 118, z0 = 6;
    B.box(0.02, 0.02, 0, 2.96, 2.96, z0, '#D9B87A');
    B.roof(0.1, 0.1, z0, 2.8, 2.8, H, '#E9C891', {kind: 'hip', ov: 0});
    B.roof(1.29, 1.29, z0 + H * 0.85, 0.42, 0.42, H * 0.15, M.gold, {kind: 'hip', ov: 0, layer: 1});
    B.custom(1.5, 1.5, (g, P, k, t, T) => { const hw = z => 1.4 * (1 - (z - z0) / H);
      const sides = [[0, 1, (z, u) => [1.5 + u * hw(z), 1.5 + hw(z)]], [1, 0, (z, u) => [1.5 + hw(z), 1.5 - u * hw(z)]], [0, -1, (z, u) => [1.5 - u * hw(z), 1.5 - hw(z)]], [-1, 0, (z, u) => [1.5 - hw(z), 1.5 + u * hw(z)]]];
      g.strokeStyle = 'rgba(122,74,34,0.3)'; g.lineWidth = 1 * k;
      sides.forEach(([nx, ny, F]) => { if(!vis(T, nx, ny)) return; for(let z = z0 + 12; z < z0 + H * 0.84; z += 12){ const a = F(z, -1), b = F(z, 1); line(g, P(a[0], a[1], z), P(b[0], b[1], z)); } });
      if(vis(T, 0, 1)){ const F = sides[0][2], q = (z, u) => { const p = F(z, u); return P(p[0], p[1], z); };
        g.fillStyle = '#4A2E1C'; g.beginPath(); [q(z0, -0.16), q(z0, 0.16), q(z0 + 22, 0.16), q(z0 + 28, 0), q(z0 + 22, -0.16)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
        g.strokeStyle = '#C99A2E'; g.lineWidth = 2 * k; line(g, q(z0 + 50, -0.8), q(z0 + 50, 0.8)); line(g, q(z0 + 38, -0.8), q(z0 + 38, 0.8));
        g.fillStyle = '#2EC4B6'; for(let i = -2; i <= 2; i++){ const p = q(z0 + 44, i * 0.3); if(i % 2){ g.beginPath(); g.moveTo(p[0], p[1] - 3.4 * k); g.lineTo(p[0] + 3 * k, p[1] + 2.4 * k); g.lineTo(p[0] - 3 * k, p[1] + 2.4 * k); g.closePath(); g.fill(); } else { g.beginPath(); D.ell(g, p[0], p[1], 2.8 * k, 2.8 * k); g.fill(); } } }
    }, {layer: 2});
  }; })();

/* ================= ❄️ SNOW (the snow look caps every silhouette with snow — pines, cabins, rocks alike) ================= */
const NA = own('snow', 'snow'), NO = org('snow', 'snow');
function pine(g, x, y, k, t, v, dry){ const c = dry ? ['#C08A4A', '#8A5A2A', '#D9AA6A'] : [['#2F7A4A', '#1F5A36', '#4C9A62'], ['#3A8A4E', '#25683A', '#5AAE6A'], ['#2A6E5A', '#1A4E40', '#46947A']][v % 3], w = [1, 0.88, 1.1][v % 3];
  g.save(); g.translate(x, y); g.scale(k, k); piece(g, [{path: g => { g.rect(-3.5, -14, 7, 14); }, fill: '#6A4630'}]);
  [[-12, 26, 22], [-30, 21, 20], [-46, 16, 18], [-60, 10, 18]].forEach(([yy, ww, hh]) => piece(g, [{path: g => { g.moveTo(0, yy - hh); g.quadraticCurveTo(ww * w * 0.3, yy - hh * 0.4, ww * w, yy); g.quadraticCurveTo(0, yy + 4, -ww * w, yy); g.quadraticCurveTo(-ww * w * 0.3, yy - hh * 0.4, 0, yy - hh); }, fill: g => D.lin(g, -ww, 0, ww, 0, [c[2], c[0], c[1]])}]));
  g.restore(); }
(function(){ const def = NO('pine', {name: 'Pine', h: 80, variants: 3, tags: ['tree', 'evergreen']}, (g, x, y, k, t, v) => pine(g, x, y, k, t, v, false));
  def.conds = {dry: (g, x, y, k, t, v) => pine(g, x, y, k, t, v, true)}; })();   /* dry pine = rust needles (an evergreen doesn't go bare); ruined → the shared snapped tree */
(function(){ const def = NO('baretree', {name: 'Bare tree', h: 64, variants: 2, tags: ['tree', 'winter']}, (g, x, y, k, t, v) => bareTree(g, x, y, k, 64, v + 3, {leaves: 0, broken: 0})); })();
NO('icecrystal', {name: 'Ice crystal', h: 44, kind: 'thing', variants: 2, dead: 'keep', tags: ['ice', 'magic']}, (g, x, y, k, t, v) => { g.save(); g.translate(x, y); g.scale(k, k);
  const shards = [[-9, 0, 26, -0.25, 6], [8, 0, 22, 0.3, 5.5], [0, 2, 38, 0.02, 7.5], [-15, 2, 14, -0.5, 4.5], [15, 2, 13, 0.55, 4]].slice(0, v % 2 ? 5 : 4);
  shards.forEach(([sx, sy, L, a, w]) => { g.save(); g.translate(sx, sy); g.rotate(a); piece(g, [{path: g => { g.moveTo(-w, 0); g.lineTo(-w, -L * 0.78); g.lineTo(0, -L); g.lineTo(w, -L * 0.78); g.lineTo(w, 0); g.closePath(); }, fill: g => D.lin(g, -w, 0, w, 0, ['#E8FBFF', '#9FE3F5', '#5EC3EA'])}]);
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.moveTo(-w * 0.6, -2); g.lineTo(-w * 0.6, -L * 0.74); g.lineTo(-w * 0.1, -L * 0.85); g.lineTo(-w * 0.1, -2); g.closePath(); g.fill(); g.restore(); });
  g.restore(); });
// 🪵 log cabin: corner posts, log lines, stone chimney, steep roof (the snow look caps it)
(function(){ const def = NA('cabin', {name: 'Log cabin', foot: [2, 2], h: 88, variants: 4, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const wall = L.walls[v % L.walls.length], roof = L.roofs[v % L.roofs.length];
    B.box(0.1, 0.1, 0, 1.8, 1.8, 5, M.stone);
    const b = B.box(0.16, 0.16, 5, 1.68, 1.68, 40, wall, {trim: 5});
    [[0.1, 1.74], [1.74, 1.74], [1.74, 0.1]].forEach(p => B.box(p[0], p[1], 5, 0.16, 0.16, 40, sh(wall, -0.12), {layer: 1}));
    B.door(b, 'front', 0.8, 0.4, 30, {fill: L.trim}); B.win(b, 'front', 0.32, 0.3, 16, 13, {fill: '#FFD35A'}); B.win(b, 'right', 0.6, 0.34, 16, 13, {fill: '#FFD35A'});
    B.box(1.35, 0.3, 30, 0.34, 0.34, 54, M.stone, {layer: 1, dz: -3});
    B.roof(0.16, 0.16, 45, 1.68, 1.68, 36, roof, {ov: 0.24, stripes: 6, ridge: v % 2 ? 'y' : 'x'});
    if(v >= 2) B.custom(2, 1, (g, P, k, t, T) => { if(!vis(T, 1, 0)) return; for(let i = 0; i < 6; i++){ const p = P(1.96, 0.4 + (i % 3) * 0.12, 6 + Math.floor(i / 3) * 6); g.fillStyle = '#C99257'; g.beginPath(); D.ell(g, p[0], p[1], 3.4 * k, 3 * k); g.fill(); g.fillStyle = '#E8C08A'; g.beginPath(); D.ell(g, p[0] - 0.6 * k, p[1], 1.6 * k, 1.5 * k); g.fill(); } }, {layer: 2});
  }; })();
// 🔺 A-frame: the roof IS the walls, glass front with a door
(function(){ const def = NA('aframe', {name: 'A-frame house', foot: [2, 2], h: 104, variants: 3, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const roof = L.roofs[v % L.roofs.length];
    B.box(0.12, 0.12, 0, 1.76, 1.76, 8, '#8A5A3A');
    B.roof(0.15, 0.15, 8, 1.7, 1.7, 86, roof, {ridge: 'y', ov: 0.12, gable: '#A0703E', stripes: 6});
    B.custom(1, 2, (g, P, k, t, T) => { if(!vis(T, 0, 1)) return; const y = 1.98, q = (x, z) => P(x, y, z);
      g.fillStyle = '#9FD8F0'; g.beginPath(); [q(0.32, 12), q(1.68, 12), q(1, 74)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
      g.strokeStyle = '#5A3418'; g.lineWidth = 1.6 * k; [[0.66, 12, 0.66, 50], [1.34, 12, 1.34, 50], [0.5, 32, 1.5, 32], [0.75, 52, 1.25, 52]].forEach(l => line(g, q(l[0], l[1]), q(l[2], l[3])));
      g.fillStyle = '#5A3418'; g.beginPath(); [q(0.84, 9), q(1.16, 9), q(1.16, 34), q(0.84, 34)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); }, {layer: 3});
  }; })();
// ⛄ igloo: ice-block dome, a tunnel at the front
(function(){ const def = NA('igloo', {name: 'Igloo', foot: [2, 2], h: 56, variants: 2, door: [1, 2], tags: ['home', 'ice']});
  def.build = (B, v) => { const ice = ['#E8F6FF', '#DDEEFF'][v % 2];
    B.custom(1, 1, (g, P, k, t, T) => { const tun = P(1, 1.72, 0), cen = P(1, 0.92, 0), front = tun[1] > cen[1];
      const tunnel = () => { const n = T.nrm(0, 1), s = sideOf(n) === 'R' ? -1 : 1, a = P(1, 1.98, 0), w = 12 * k, h = 20 * k; g.save(); g.translate(a[0], a[1]); g.transform(1, s * -0.5 * 0.0, 0, 1, 0, 0);
        g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w, -h * 0.5); g.arc(0, -h * 0.5, w, Math.PI, 0); g.lineTo(w, 0); g.closePath(); g.fillStyle = D.lin(g, -w, 0, w, 0, ['#FFFFFF', '#C8E2F2']); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = k; g.stroke();
        if(front){ g.beginPath(); g.moveTo(-w * 0.55, 0); g.lineTo(-w * 0.55, -h * 0.42); g.arc(0, -h * 0.42, w * 0.55, Math.PI, 0); g.lineTo(w * 0.55, 0); g.closePath(); g.fillStyle = '#2E4A66'; g.fill(); } g.restore(); };
      if(!front) tunnel();
      const d = dome(g, P, k, 1, 0.92, 0, 0.82, 46, ice);
      g.save(); g.beginPath(); g.moveTo(d.c[0] + d.rx, d.c[1]); g.ellipse(d.c[0], d.c[1], d.rx, d.ry, 0, 0, Math.PI, false); g.ellipse(d.c[0], d.c[1], d.rx, d.hh, 0, Math.PI, TAU, false); g.closePath(); g.clip();
      g.strokeStyle = 'rgba(90,140,180,0.35)'; g.lineWidth = 1.1 * k; for(let i = 1; i < 4; i++){ const f = i / 4; g.beginPath(); g.ellipse(d.c[0], d.c[1] - d.hh * f, d.rx * Math.sqrt(1 - f * f), d.ry * Math.sqrt(1 - f * f), 0, 0, Math.PI); g.stroke();
        for(let j = -3; j <= 3; j++){ const xx = d.c[0] + j * d.rx * 0.28 + (i % 2) * d.rx * 0.14; line(g, [xx, d.c[1] - d.hh * (f - 0.25) + d.ry * 0.6], [xx, d.c[1] - d.hh * f + d.ry * 0.6]); } }
      g.restore(); if(front) tunnel(); });
  }; })();
NO('snowman', {name: 'Snowman', h: 44, kind: 'thing', variants: 3, dead: 'keep', tags: ['winter', 'fun']}, (g, x, y, k, t, v) => { const scarf = ['#E2553A', '#3A8DFF', '#4CB13A'][v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
  g.strokeStyle = '#6A4630'; g.lineWidth = 1.6; g.lineCap = 'round'; line(g, [-8, -22], [-19, -30]); line(g, [8, -22], [19, -31]); line(g, [-16, -28], [-19, -24]);
  piece(g, [{path: g => { D.ell(g, 0, -9, 12, 10); D.ell(g, 0, -24, 9, 8); D.ell(g, 0, -36, 7, 6.5); }, fill: g => D.rad(g, -4, -38, 2, 30, ['#FFFFFF', '#E6F2FA', '#C2D8E8'])}]);
  g.fillStyle = scarf; g.beginPath(); D.rr(g, -8, -31, 16, 4, 2); g.fill(); g.fillRect(3, -30, 4, 9);
  g.fillStyle = '#2A1C14'; [[-2.6, -38], [2.6, -38], [0, -23], [0, -18], [0, -13]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 1.2, 1.2); g.fill(); });
  g.fillStyle = '#FF8A2A'; g.beginPath(); g.moveTo(0, -36.5); g.lineTo(8, -35); g.lineTo(0, -34); g.closePath(); g.fill();
  g.fillStyle = '#2A2A2A'; g.fillRect(-6, -43, 12, 2); g.fillRect(-4, -50, 8, 7); g.restore(); });
(function(){ const def = NA('sled', {name: 'Sled', foot: [1, 1], h: 16, kind: 'deco', block: false, tags: ['winter', 'fun']});
  def.build = (B) => { B.box(0.2, 0.32, 5, 0.6, 0.36, 3, '#C99257'); [0.36, 0.64].forEach(y => B.custom(0.5, y, (g, P, k) => { const a = P(0.18, y, 2), b = P(0.82, y, 2), c = P(0.94, y, 9); g.strokeStyle = '#D8322A'; g.lineWidth = 2.2 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.quadraticCurveTo(c[0] + 2 * k, b[1], c[0], c[1]); g.stroke(); line(g, P(0.3, y, 2), P(0.3, y, 5)); line(g, P(0.7, y, 2), P(0.7, y, 5)); }, {layer: y > 0.5 ? 1 : -1})); }; })();
(function(){ const def = NA('firepit', {name: 'Campfire', foot: [1, 1], h: 24, kind: 'deco', tags: ['fire', 'camp', 'light']});
  def.build = (B) => { for(let i = 0; i < 8; i++){ const a = i / 8 * TAU; B.drum(0.5 + Math.cos(a) * 0.3, 0.5 + Math.sin(a) * 0.3, 0, 0.07, 4, '#9C9480'); }
    B.bill(0.5, 0.5, 2, (g, x, y, k, t) => { g.strokeStyle = '#8A5A2B'; g.lineWidth = 3.4 * k; g.lineCap = 'round'; line(g, [x - 8 * k, y + 1 * k], [x + 7 * k, y - 3 * k]); line(g, [x - 7 * k, y - 3 * k], [x + 8 * k, y + 1 * k]);
      const f = 1 + Math.sin(t * 9) * 0.12; g.fillStyle = '#FF8A2A'; g.beginPath(); g.moveTo(x - 7 * k, y - 1 * k); g.quadraticCurveTo(x - 6 * k, y - 12 * k * f, x, y - 20 * k * f); g.quadraticCurveTo(x + 6 * k, y - 12 * k * f, x + 7 * k, y - 1 * k); g.closePath(); g.fill();
      g.fillStyle = '#FFD23F'; g.beginPath(); g.moveTo(x - 3.5 * k, y - 1 * k); g.quadraticCurveTo(x - 3 * k, y - 7 * k * f, x, y - 12 * k * f); g.quadraticCurveTo(x + 3 * k, y - 7 * k * f, x + 3.5 * k, y - 1 * k); g.closePath(); g.fill(); });
  }; def.live = {period: 2 * Math.PI / 9, frames: 6}; })();
(function(){ const def = NA('aurorapost', {name: 'Glow lantern', foot: [1, 1], h: 50, kind: 'post', block: false, tags: ['light', 'night', 'ice']});
  def.build = (B) => { B.box(0.42, 0.42, 0, 0.16, 0.16, 46, '#6A4630'); B.box(0.42, 0.42, 42, 0.16, 0.42, 4, '#6A4630', {layer: 1});
    B.custom(0.5, 0.8, (g, P, k) => { const a = P(0.5, 0.78, 42), b = [a[0], a[1] + 7 * k]; g.strokeStyle = '#2A1C14'; g.lineWidth = 1 * k; line(g, a, b);
      g.fillStyle = '#7CF5D0'; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[0] + 5 * k, b[1] + 7 * k); g.lineTo(b[0], b[1] + 15 * k); g.lineTo(b[0] - 5 * k, b[1] + 7 * k); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.moveTo(b[0], b[1] + 2 * k); g.lineTo(b[0] - 2.4 * k, b[1] + 7 * k); g.lineTo(b[0], b[1] + 11 * k); g.closePath(); g.fill(); }, {layer: 2}); }; })();

/* ---------- 🗺️ the region looks: their own trees (swap) + their own town (roles) ---------- */
Object.assign(LOOKS.cherry, {swap: {palm: 'blossom', jtree: 'blossom', mango: 'maple', banana: 'petalbush', bush: 'petalbush'},
  roles: {home: ['machiya', 'teahouse', 'machiya'], light: 'stonelantern', tall: ['blossom', 'maple', 'blossom', 'bamboo', 'blossom'], small: ['petalbush', 'petalbush', 'flowers', 'rock', 'flowers']}});
Object.assign(LOOKS.desert, {swap: {palm: 'datepalm', jtree: 'datepalm', mango: 'datepalm', bamboo: 'cactus', banana: 'roundcactus', bush: 'roundcactus', flowers: 'roundcactus', log: 'mesarock'},
  roles: {home: ['mudhouse', 'domehouse', 'mudhouse'], shop: 'tent', cargo: 'pots', tall: ['datepalm', 'cactus', 'datepalm', 'cactus'], small: ['roundcactus', 'mesarock', 'roundcactus', 'rock']}});
Object.assign(LOOKS.snow, {swap: {palm: 'pine', jtree: 'pine', mango: 'pine', bamboo: 'baretree', banana: 'bush', flowers: 'rock'},
  roles: {home: ['cabin', 'aframe', 'cabin', 'igloo'], light: 'aurorapost', tall: ['pine', 'pine', 'baretree', 'pine'], small: ['bush', 'rock', 'snowman', 'log', 'rock']}});
})();
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
/* ---------- 🖼️ pictures: model → canvas with ONE silhouette rim (zoom k, device scale s) ---------- */
// geometry at zoom 1: the picture is (W + Dd)·32 + 2·MX wide; anchor = the footprint's BACK corner (= IsoKit item x, y)
const MX = 34, MT = 26, MB = 12;
function geom(def, turn){ const T = turner(def.foot[0], def.foot[1], turn), W = T.W, Dd = T.D, top = def.h + MT + (def.over || 0);
  return {W, Dd, w: (W + Dd) * HTW + 2 * MX + (def.wide || 0) * 2, h: top + (W + Dd) * HTH + MB, ax: Dd * HTW + MX + (def.wide || 0), ay: top}; }
const hasDoc = typeof document !== 'undefined';
function mkCanvas(w, h){ const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; }
// 🗺️ a look may swap an organic prop for its own (palm → date palm on a desert map); a prop's own home look never swaps
function swapKey(key, look){ const L = LOOKS[look], d = DEFS[key]; if(!L || !L.swap || !d || d.look === look) return key; const k2 = L.swap[key]; return k2 && DEFS[k2] ? k2 : key; }
// 🔀 ip-3b STATES — a prop with def.states (['down', 'lifted'] · ['closed', 'open', 'new'] · [1 … 12]) REBUILDS its model per state, like a turn:
//   o.state picks one (unknown → def.state, else the first) · build(B, v, look) reads look.state · Props.setState(it, state, map) flips a placed one
function stateOf(def, s){ const S = def.states; if(!S) return null; if(s != null){ const i = S.indexOf(s), j = i < 0 ? S.indexOf(+s) : i; if(j >= 0) return S[j]; } return def.state != null ? def.state : S[0]; }
// 🪧 ip-3b TEXT — a prop with def.text draws a short word at bake (o.text, ≤ 10 letters, never emoji — rule 7); it re-bakes when the web font lands
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;
function textOf(def, t){ if(def.text == null) return null; return String(t == null ? def.text : t).replace(EMOJI, '').trim().slice(0, 10) || String(def.text); }
// paint once (no cache): o = {v, turn, look, pal, t, k, s, rim, cond, state, text}
function paint(def, o){ o = o || {}; const turn = ((o.turn | 0) % 4 + 4) % 4, v = (o.v | 0) % Math.max(1, def.variants), s = o.s || 1, k = o.k || 1, G = geom(def, turn);
  const t0 = performance.now(), cw = Math.ceil(G.w * k * s), ch = Math.ceil(G.h * k * s);
  const out = mkCanvas(cw, ch), og = out.getContext('2d'), body = mkCanvas(cw, ch), bg = body.getContext('2d');
  og.scale(s, s); footShadow(og, G.ax * k, G.ay * k, k, G.W, G.Dd, def.organic, def.shadowA);
  bg.scale(s, s); TEXT_USED = false; const cond = condOf(o.cond), model = builder(), look = Object.assign({}, LOOKS[o.look || def.look || 'jungle'] || LOOKS.jungle, o.pal || {}, {cond, state: stateOf(def, o.state), text: textOf(def, o.text)});
  def.build(model, v, look); render(bg, model, {ox: G.ax * k, oy: G.ay * k, k, turn, t: cond && cond.still ? 0 : o.t || 0, v, w: def.foot[0], d: def.foot[1], cond});
  if(cond && cond.rubble && !def.organic && def.block === true && def.kind !== 'thing' && def.kind !== 'fence' && !def.noRubble) rubble(bg, G.ax * k, G.ay * k, k, G.W, G.Dd, 97 + v * 13 + turn);
  grade(body, cond); if(look.snow && def.snowcap !== false) snowcap(body, 3 * k * s);
  if(TEXT_USED) def._text = true; out._text = TEXT_USED;
  if(o.rim !== false){ const sil = mkCanvas(cw, ch), sg = sil.getContext('2d'); sg.drawImage(body, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = RIM; sg.fillRect(0, 0, cw, ch);
    const r = 1.5 * k * s; for(let i = 0; i < 8; i++){ const a = i * TAU / 8; og.setTransform(1, 0, 0, 1, 0, 0); og.drawImage(sil, Math.cos(a) * r, Math.sin(a) * r); } }
  og.setTransform(1, 0, 0, 1, 0, 0); og.drawImage(body, 0, 0);
  out._ms = performance.now() - t0; out._g = G; out._k = k; out._s = s; out._pad = 0; return out; }
// cached canvas (cards, thumbnails, sheets) — a small LRU so a catalogue page never grows memory forever
const CACHE = new Map(), CACHE_MAX = 240;
function canvasOf(def, o){ o = o || {}; if(o.look) def = DEFS[swapKey(def.key, o.look)]; const id = [def.key, o.cond || '', o.turn | 0, (o.v | 0) % Math.max(1, def.variants), o.s || 1, o.k || 1, o.t || 0, o.rim === false ? 0 : 1, o.look || '', o.pal ? JSON.stringify(o.pal) : '', stateOf(def, o.state) == null ? '' : stateOf(def, o.state), textOf(def, o.text) || ''].join('|');
  let c = CACHE.get(id); if(c){ CACHE.delete(id); CACHE.set(id, c); return c; }
  c = paint(def, o); CACHE.set(id, c); if(CACHE.size > CACHE_MAX) CACHE.delete(CACHE.keys().next().value); return c; }
// an IsoKit picture (duck-types Iso.sprite: bake(step, lazy) → canvas with _s / _pad). Same prop + variant + turn + look = ONE shared picture.
const PICTS = new Map(), PICT_MAX = 600; let bakeT = 0, bakeN = 0;
function pic(key, o){ o = o || {}; if(!DEFS[key]) throw new Error('IsoProps: no prop "' + key + '"'); if(o.look) key = swapKey(key, o.look); const def = DEFS[key];
  const turn = ((o.turn | 0) % 4 + 4) % 4, v = (o.v | 0) % Math.max(1, def.variants), look = o.look || def.look || 'jungle', cond = condOf(o.cond), t = cond && cond.still ? 0 : o.t || 0, st = stateOf(def, o.state), tx = textOf(def, o.text);
  const id = 'ip:' + key + ':' + turn + ':' + v + ':' + look + ':' + t + (cond ? ':' + cond.key : '') + (o.pal ? ':' + JSON.stringify(o.pal) : '') + (st != null ? ':s=' + st : '') + (tx != null ? ':w=' + tx : ''); let P = PICTS.get(id); if(P) return P;
  const G = geom(def, turn), po = {turn, v, look, t, pal: o.pal, cond: cond ? cond.key : null, state: st, text: tx};
  P = {key: id, prop: key, w: G.w, h: G.h, ax: G.ax, ay: G.ay, by: new Map(), def, o: po};
  P.bake = (s, lazy) => { let c = P.by.get(s); if(c) return c;
    if(lazy && P.by.size){ const n = performance.now(); if(n - bakeT > 12){ bakeT = n; bakeN = 0; } if(bakeN >= 4) return P.by.values().next().value; }   // a few new bakes a frame; stretch the rest
    bakeN++; c = paint(def, Object.assign({}, po, {s, k: 1})); P.by.set(s, c); if(P.by.size > 3){ const first = P.by.keys().next().value; if(first !== s) P.by.delete(first); } return c; };
  PICTS.set(id, P); if(PICTS.size > PICT_MAX) PICTS.delete(PICTS.keys().next().value); return P; }
// 🔤 words on signs: bake again once the web font has landed (a picture baked with the fall-back font would keep it)
function fontsLanded(){ PICTS.forEach(P => { if(P.def._text) P.by.clear(); }); for(const [id, c] of [...CACHE]) if(c._text) CACHE.delete(id); MASKS.clear(); }
if(hasDoc && document.fonts){ try{ document.fonts.ready.then(fontsLanded); document.fonts.addEventListener('loadingdone', fontsLanded); }catch(e){} }

/* ---------- 🧍 on a map: items, footprints, doors ---------- */
function doorOf(def, T, i, j){ if(!def.door) return null; const p = T.pt(def.door[0], def.door[1]), W = T.W, Dd = T.D, e = 1e-6;
  const onY = Math.abs(p[1]) < e || Math.abs(p[1] - Dd) < e, s = onY ? (p[1] > Dd / 2 ? 1 : -1) : (p[0] > W / 2 ? 1 : -1);
  const a = Math.max(0, Math.min(Math.floor((onY ? p[0] : p[1]) + e), (onY ? W : Dd) - 1));
  const inn = onY ? [a, s > 0 ? Dd - 1 : 0] : [s > 0 ? W - 1 : 0, a], out = onY ? [a, s > 0 ? Dd : -1] : [s > 0 ? W : -1, a];
  return {i: i + inn[0], j: j + inn[1], out: {i: i + out[0], j: j + out[1]}}; }
// footprint cells in WORLD cells, each marked: does it block walkers?
function cellsOf(def, T, i, j){ const out = [], w = def.foot[0], d = def.foot[1];
  for(let mx = 0; mx < w; mx++) for(let my = 0; my < d; my++){ const q = T.pt(mx + 0.5, my + 0.5), a = i + Math.floor(q[0]), b = j + Math.floor(q[1]);
    const blk = def.block === true || (def.block === 'posts' && (mx === 0 || mx === w - 1)); out.push([a, b, blk]); }
  return out; }
// 🎯 ip-3b ANCHORS (TD-Stories book 2): def.stand = [x, y, zPx] where a hero stands ON the prop · def.aim = [x, y, zPx] where shots start (default = stand)
//   → it.stand / it.aim = {x, y, z} in WORLD units (z in IsoKit levels, 16 px each, ground height included), turned with the prop · it.mid = the footprint centre
function anchors(it, def, T){ const at = a => { const q = T.pt(a[0], a[1]); return {x: it.x + q[0], y: it.y + q[1], z: (it.z || 0) + (a[2] || 0) / 16}; };
  it.mid = {x: it.x + it.w / 2, y: it.y + it.d / 2, z: it.z || 0};
  if(def.stand) it.stand = at(def.stand); if(def.aim || def.stand) it.aim = at(def.aim || def.stand); return it; }
function item(key, i, j, o){ o = o || {}; if(!DEFS[key]) throw new Error('IsoProps: no prop "' + key + '"'); const asked = key; if(o.look) key = swapKey(key, o.look); const def = DEFS[key];
  const turn = ((o.turn | 0) % 4 + 4) % 4, T = turner(def.foot[0], def.foot[1], turn), v = (o.v | 0) % Math.max(1, def.variants), look = o.look || def.look || 'jungle', cond = condOf(o.cond);
  const it = {x: i, y: j, z: o.z || 0, w: T.W, d: T.D, pic: null, prop: key, asked, v, turn, look, cond: cond ? cond.key : null, pal: o.pal, tall: def.h >= 50, alpha: 1, door: doorOf(def, T, i, j),
    state: stateOf(def, o.state), text: textOf(def, o.text)};
  anchors(it, def, T);
  const po = {turn, v, look, pal: o.pal, cond: it.cond, state: it.state, text: it.text};
  if(def.live && !(cond && cond.still)){ const N = def.live.frames || 6; it.frames = []; for(let n = 0; n < N; n++) it.frames.push(pic(key, Object.assign({}, po, {t: Math.round(def.live.period * n / N * 1000) / 1000})));
    it.frames.forEach(P => { P.sib = it.frames; }); it.pic = it.frames[0]; }
  else it.pic = pic(key, po);
  return it; }
// 🌊 cells a prop may stand on: walkable ground; bridges + docks may also stand on water
function liquidAt(M, a, b){ const c = M.get(a, b); return !!c && (c.t === 'water' || c.t === 'moat' || c.t === 'lava'); }
function fits(M, key, i, j, o){ o = o || {}; if(o.look && DEFS[key]) key = swapKey(key, o.look); const def = DEFS[key]; if(!def) return false; const T = turner(def.foot[0], def.foot[1], o.turn), cells = cellsOf(def, T, i, j), occ = M._props || {};
  let h = null; for(const [a, b] of cells){ if(!M.inside(a, b)) return false; if(occ[b * M.w + a] && occ[b * M.w + a] !== o.ignore) return false;
    const c = M.get(a, b); if(c.t === 'void') return false; const wet = liquidAt(M, a, b);
    if(wet ? !(def.kind === 'bridge') : !M.walk(a, b)) return false;
    const hh = wet ? 0 : c.h; if(h == null) h = hh; else if(hh !== h && !wet) return false; }   // flat ground only
  return true; }
function place(M, key, i, j, o){ o = o || {}; if(!fits(M, key, i, j, o)) return null; const def = DEFS[o.look ? swapKey(key, o.look) : key], T = turner(def.foot[0], def.foot[1], o.turn);
  const cells = cellsOf(def, T, i, j); let z = 0; cells.forEach(([a, b]) => { if(!liquidAt(M, a, b)) z = Math.max(z, M.get(a, b).h || 0); });
  const it = item(key, i, j, Object.assign({}, o, {z})); M._props = M._props || {}; it.cells = []; const walkNow = !!def.walkStates && def.walkStates.indexOf(it.state) >= 0;   // 🌾 a flattened bale / an open gate lets walkers through
  cells.forEach(([a, b, blk]) => { const k = b * M.w + a, isDoor = it.door && it.door.i === a && it.door.j === b, c0 = M.get(a, b), prev = c0.block || 0;
    M._props[k] = it; it.cells.push([a, b, prev, c0.cost]); if(blk && !walkNow && !isDoor && !liquidAt(M, a, b)) M.set(a, b, {block: 1});
    if(def.cost && !liquidAt(M, a, b)) M.set(a, b, {cost: def.cost}); });   // 🐷 ip-3b: mud slows walkers (IsoKit paths read the cost)
  it.map = M; deckCells(M, it, def); return it; }
// 🌉 ip-3b a DECK prop (plank bridge) makes the water under it walkable while its state is in def.deck ('down'); lifted → blocked again
function deckCells(M, it, def){ if(!def.deck || !it.cells) return; const on = def.deck.indexOf(it.state) >= 0; it.cells.forEach(([a, b]) => { if(liquidAt(M, a, b)) M.set(a, b, {block: on ? 0 : 1}); }); }
function remove(M, it){ if(!it || !it.cells) return; it.cells.forEach(([a, b, prev, cost]) => { const k = b * M.w + a; if(M._props && M._props[k] === it) delete M._props[k]; if(!M.inside(a, b)) return;
    if((M.get(a, b).block || 0) !== prev) M.set(a, b, {block: prev}); if(cost != null && M.get(a, b).cost !== cost) M.set(a, b, {cost}); }); it.cells = null; it.map = null; }
// 🔀 ip-3b flip a placed (or plain) item to another state in place: new picture(s), anchors, and its map cells (a lifted bridge blocks again)
function setState(it, state, M){ const def = DEFS[it.prop]; if(!def || !def.states) return it; const st = stateOf(def, state); if(st === it.state) return it; M = M || it.map;
  const o = {v: it.v, turn: it.turn, look: it.look, z: it.z, cond: it.cond, pal: it.pal, state: st, text: it.text};
  if(M && it.cells){ remove(M, it); const n = place(M, it.prop, it.x, it.y, o); if(n){ const keep = {alpha: it.alpha, role: it.role, popT: it.popT}; Object.assign(it, n, keep); it.cells.forEach(([a, b]) => { M._props[b * M.w + a] = it; }); return it; } }
  const n = item(it.prop, it.x, it.y, o); it.state = st; it.pic = n.pic; it.frames = n.frames; it.stand = n.stand; it.aim = n.aim; return it; }
// 🎯 ip-3b range ring for tower placing: the ground circle of `range` tiles round it.aim (or the centre), as the screen ellipse of the view
//   → {x, y, rx, ry, cx, cy, range, has(x, y)}; with o.g (the groundFx / airFx context of Iso.frame) it also draws it (o.color, o.fill, o.dash, o.width)
function ring(view, it, range, o){ o = o || {}; const a = it.aim || it.mid || {x: it.x + it.w / 2, y: it.y + it.d / 2}, z = it.z || 0, c = view.toScreen(a.x, a.y, z), rx = range * HTW * Math.SQRT2 * view.zoom, ry = rx / 2;
  const R = {x: c.x, y: c.y, rx, ry, cx: a.x, cy: a.y, range, has: (x, y) => Math.hypot(x - a.x, y - a.y) <= range};
  if(o.g){ const g = o.g, col = o.color || '#FFC845'; g.save(); g.beginPath(); g.ellipse(c.x, c.y, rx, ry, 0, 0, TAU); g.fillStyle = o.fill || rgbaHex(col, 0.16); g.fill();
    g.setLineDash(o.dash || [10, 7]); g.lineWidth = o.width || 2.5; g.strokeStyle = col; g.stroke(); g.setLineDash([]); g.restore(); }
  return R; }
function rgbaHex(h, a){ return D.rgba(h, a); }
// which placed prop covers a cell (for taps)
function at(M, a, b){ return (M._props || {})[b * M.w + a] || null; }

/* ---------- 🫥 never lose your hero: a tall prop drawn AFTER a walker fades only when its PAINTED pixels cover the walker ---------- */
const MASKS = new Map();
function maskOf(it){ const P = it.pic; let m = MASKS.get(P.key); if(m) return m; const c = paint(DEFS[it.prop], Object.assign({}, P.o, {s: 0.5, k: 1})), w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data, a = new Uint8Array(w * h);
  for(let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 140 ? 1 : 0; m = {w, h, a, s: 0.5}; MASKS.set(P.key, m); if(MASKS.size > 300) MASKS.delete(MASKS.keys().next().value); return m; }
function covers(it, wk, view, hy){ const z = view.zoom, m = maskOf(it), q = view.toScreen(it.x, it.y, it.z || 0), p = view.toScreen(wk.x, wk.y, wk.z || 0);
  let hit = 0; for(const f of [0.25, 0.55, 0.85]){ const sx = p.x, sy = p.y - hy * f * z, u = Math.round(((sx - q.x) / z + it.pic.ax) * m.s), v = Math.round(((sy - q.y) / z + it.pic.ay) * m.s);
    if(u >= 0 && v >= 0 && u < m.w && v < m.h && m.a[v * m.w + u]) hit++; } return hit >= 1; }
function seeThrough(view, items, walkers, o){ o = o || {}; const a = o.alpha == null ? 0.45 : o.alpha, hy = o.h || 48; let n = 0;
  items.forEach(it => { if(!it.prop) return; it.alpha = 1; if(!it.tall) return;
    for(const w of walkers){ if(Iso.drawOrder(w, it) < 0 && Math.abs(w.x - it.x - it.w / 2) < it.w / 2 + 3 && Math.abs(w.y - it.y - it.d / 2) < it.d / 2 + 3 && covers(it, w, view, hy)){ it.alpha = a; n++; break; } } });
  return n; }
// 👆 which prop is under a screen point (CSS px in the view) — by its PAINTED pixels, front-most first (tap a roof → that house)
function hit(view, items, px, py){ for(let n = items.length - 1; n >= 0; n--){ const it = items[n]; if(!it.prop || it.hidden) continue;
    const m = maskOf(it), q = view.toScreen(it.x, it.y, it.z || 0), z = view.zoom, u = Math.round(((px - q.x) / z + it.pic.ax) * m.s), v = Math.round(((py - q.y) / z + it.pic.ay) * m.s);
    if(u >= 0 && v >= 0 && u < m.w && v < m.h && m.a[v * m.w + u]) return it; }
  return null; }
// 🎬 the tiny live layer: palm sway · flags · smoke · boat bob · elephant steps (frames baked like any picture; still when the budget is low)
function tick(items, t){ const calm = typeof Iso !== 'undefined' && Iso.budget && Iso.budget.fx < 0.6;
  for(const it of items){ if(!it.frames) continue; const L = DEFS[it.prop].live, N = it.frames.length; it.pic = calm ? it.frames[0] : it.frames[Math.floor(((t % L.period) + L.period) % L.period / L.period * N) % N]; } }
function warm(items, view, o){ const set = new Set(); items.forEach(it => { if(it.frames) it.frames.forEach(P => set.add(P)); else if(it.pic && it.prop) set.add(it.pic); }); return Iso.warm([...set], view, o || {}); }

/* ---------- 🍂 the ground follows the condition too (Aowu: "no life feeling" — a dead town on bright green grass is not dead) ----------
   Props.ground(theme, cond) → an IsoKit theme key '<theme>~<cond>' (grass → straw / ash, water → murky, snow → dirty) registered once with IsoKit's
   PUBLIC Iso.addTheme — IsoKit's own file is untouched. Use it when you make the map: Iso.map({theme: Props.ground('meadow', 'ruined'), …}).
   A condition may carry its own ground: addCondition(key, {ground: {grass: {top, top2, lip, side, deco}, …}}). */
const GROUND_FX = {
  dry: {grass: {top: '#CBBE70', top2: '#BDB062', lip: '#A89A52', deco: 'dot'}, flower: {top: '#CFC274', top2: '#C1B466', lip: '#A89A52', deco: 'dot'}, lawn: {top: '#C2B86E', top2: '#B4AA60'},
    water: {top: '#93B2A2', top2: '#84A494'}, moat: {top: '#93B2A2', top2: '#84A494'}, sand: {top: '#F2DDA8', top2: '#E8D096'}, dirt: {top: '#C9A672', top2: '#BC9864'}},
  ruined: {grass: {top: '#9C9486', top2: '#8E8678', lip: '#7C7468', side: '#6E6052', deco: 'crack'}, flower: {top: '#A0988A', top2: '#928A7C', lip: '#7C7468', side: '#6E6052', deco: 'crack'}, lawn: {top: '#98907F', top2: '#8A8272'},
    path: {top: '#B9AC94', top2: '#AB9E86'}, sand: {top: '#CEC2A2', top2: '#C2B694', deco: 'crack'}, dirt: {top: '#8E7C66', top2: '#82705A'}, stone: {top: '#A8A49C', top2: '#9A968E'},
    water: {top: '#6E7468', top2: '#62685C'}, moat: {top: '#6E7468', top2: '#62685C'}, snow: {top: '#D9D6D0', top2: '#CCC8C0', deco: 'crack'}},
};
const SNOWY = {dry: {}, ruined: {top: '#D9D6D0', top2: '#CCC8C0', lip: '#BDB8B0', deco: 'crack'}};
function ground(theme, cond){ theme = theme || 'meadow'; const c = condOf(cond); if(!c || typeof Iso === 'undefined' || !Iso.addTheme) return theme; const key = theme + '~' + c.key; if(Iso.THEMES[key]) return key;
  const base = Iso.THEMES[theme] || Iso.THEMES.meadow, kind = c.holes ? 'ruined' : 'dry', fx = c.ground || GROUND_FX[c.key] || GROUND_FX[kind], tile = {};
  const snowy = t => { const o = (base.tile || {})[t]; return !!o && !!o.top && parseInt(o.top.slice(1, 3), 16) > 215 && parseInt(o.top.slice(5, 7), 16) > 215; };   // a snow map's grass is white: it gets dirty, never straw
  Object.keys(fx).forEach(t => { tile[t] = Object.assign({}, (base.tile || {})[t] || {}, snowy(t) ? (c.ground ? fx[t] : SNOWY[kind]) : fx[t]); });
  Iso.addTheme(key, {tile, bg: kind === 'ruined' ? ['#9AA0A8', '#D8D4CE'] : ['#F2D8A8', '#FFF4DC']}, theme); return key; }

/* ---------- 📚 the catalogue as data + 📏 rule checks ---------- */
const KINDS = {deco: [0, 24], post: [0, 50], sign: [0, 50], thing: [0, 50], fence: [0, 50], bridge: [0, 50], bush: [20, 36], tree: [50, 90], building: [0, 140], gate: [0, 140], landmark: [0, 200]};
function sizeRange(def){ if(def.tags.indexOf('house') >= 0 && def.tags.indexOf('big') < 0) return [70, 110]; return KINDS[def.kind] || [0, 200]; }
function meta(def){ return {key: def.key, name: def.name, set: def.set, look: def.look || null, kind: def.kind, foot: def.foot.slice(), h: def.h, variants: def.variants, block: def.block, door: def.door || null, tags: def.tags.slice(), organic: !!def.organic, live: !!def.live,
  states: def.states ? def.states.slice() : null, state: def.states ? stateOf(def) : null, text: def.text == null ? null : def.text, stand: !!def.stand, aim: !!(def.aim || def.stand), cost: def.cost || 1, deck: def.deck ? def.deck.slice() : null}; }
function list(f){ f = f || {}; const keys = f.set ? (SETS[f.set] || {props: []}).props : Object.keys(DEFS);
  return keys.map(k => DEFS[k]).filter(d => (!f.kind || d.kind === f.kind) && (!f.tag || d.tags.indexOf(f.tag) >= 0)).map(meta); }
// a prop's rule check: size range for its kind · nothing clipped at any turn / variant · the rim is there · bake time
function check(key){ const def = DEFS[key], problems = []; if(!def) return {ok: false, problems: ['no prop ' + key]};
  const r = sizeRange(def); if(def.h < r[0] || def.h > r[1]) problems.push('height ' + def.h + ' outside ' + r[0] + '–' + r[1] + ' for a ' + (r[0] === 70 ? 'house' : def.kind));
  const times = []; let rim = false;
  for(const state of (def.states || [null])) for(let turn = 0; turn < 4; turn++) for(let v = 0; v < def.variants; v++){ const c = paint(def, {turn, v, k: 1, s: 1, state}); times.push(c._ms);
    const g = c.getContext('2d'), W = c.width, H = c.height, d = g.getImageData(0, 0, W, H).data, A = (x, y) => d[(y * W + x) * 4 + 3];
    let edge = 0; for(let x = 0; x < W; x++){ if(A(x, 0) > 30) edge++; if(A(x, H - 1) > 30) edge++; } for(let y = 0; y < H; y++){ if(A(0, y) > 30) edge++; if(A(W - 1, y) > 30) edge++; }
    if(edge) problems.push('clipped at turn ' + turn + ' v' + v + (state != null ? ' state ' + state : '') + ' (' + edge + ' px on the edge)');
    if(!rim) for(let i = 0; i < d.length; i += 4) if(d[i + 3] > 200 && Math.abs(d[i] - 42) < 6 && Math.abs(d[i + 1] - 28) < 6 && Math.abs(d[i + 2] - 20) < 6){ rim = true; break; } }
  times.sort((x, y) => x - y); const ms = times[times.length >> 1];   // the usual bake (median — one slow frame of the browser is not the prop)
  if(!rim) problems.push('no rim'); if(ms > 12) problems.push('bake ' + ms.toFixed(1) + ' ms (> 12)');
  return {ok: !problems.length, problems, ms, msMax: times[times.length - 1]}; }
/* ---------- 🏘️ town helper (ip-2): one call lays out a whole village on an IsoKit map ----------
   T = Props.town(map, {set: 'village', size: 'hamlet' | 'village' | 'town', seed, look, roads: 'auto' | 'cross' | 'ring' | 'street',
                        area: {i, j, w, d}, avoid: [[i, j]], roles: {inn: 'myInn', …}, trees: 0–2, roadTile: 'path', plazaTile: 'stone'})
     → {items, plaza: {i, j, w, d}, roads: [[i, j]], doors: [{i, j, out, key, role}], exits: [{i, j}], spawn: {x, y}, missed: [], style, seed, count}
   Props.town.remove(map, T) → props gone, ground tiles + blocked cells back to how they were.
   🎲 roads 'auto' (Aowu 2026-11-17 "D — not all towns are perfect, mix and match"): each seed mixes the styles inside ONE town —
   a straight main road meets a bendy lane, short alleys branch off, a ring road may have a gap, houses sit a step back now and then.
   🏘️ TOWN RULES  T1 every door is reachable from the plaza · T2 doors face a road (or a short front path) · T3 one free tile between buildings ·
   T4 tall buildings at the back (top of the screen), small ones in front · T5 trees at the edges, never on a road / the plaza / a door's front ·
   T6 same seed = same town, a look only re-skins it · T7 hamlet ≤ 60 items · village ≤ 120 · town ≤ 200 */
const TOWN_SIZES = {
  hamlet:  {n: 14, plaza: 3, homes: [4, 6],   shops: 1, inn: 0, smith: 0, temple: 0, spokes: [2, 3], alleys: [0, 1], cap: 60},
  village: {n: 20, plaza: 4, homes: [7, 10],  shops: 2, inn: 1, smith: 1, temple: 0, spokes: [3, 4], alleys: [1, 2], cap: 120},
  town:    {n: 28, plaza: 5, homes: [12, 18], shops: 4, inn: 1, smith: 1, temple: 1, spokes: [4, 4], alleys: [3, 6], cap: 200, wide: true}};
const TOWN_ROLES = {village: {centre: 'well', light: 'lantern', board: 'qboard', inn: 'inn', smith: 'smithy', shop: 'stall', home: 'stilt', fence: 'fence',
  cargo: 'crates', sign: 'signpost', dock: 'dock', shrine: 'shrine', bell: 'bell', statue: 'guardian',
  tall: ['palm', 'jtree', 'mango', 'bamboo', 'jtree', 'palm'], small: ['bush', 'bush', 'banana', 'flowers', 'flowers', 'rock', 'log']}};
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
function town(M, o){ o = o || {}; const seed = o.seed == null ? 1 : (o.seed | 0), R = rnd(seed * 7919 + 101), chance = p => R() < p, pick = a => a[Math.floor(R() * a.length)];
  const shuf = a => { for(let n = a.length - 1; n > 0; n--){ const m = Math.floor(R() * (n + 1)), t = a[n]; a[n] = a[m]; a[m] = t; } return a; };   /* never sort(() => R() − 0.5): a random comparator made the same seed give two towns */
  const between = (a, b) => a + Math.floor(R() * (b - a + 1)), sizeKey = TOWN_SIZES[o.size] ? o.size : 'village', SZ = TOWN_SIZES[sizeKey];
  const look = o.look || 'jungle', cond = o.cond || null, roles = Object.assign({}, TOWN_ROLES[o.set] || TOWN_ROLES.village, (LOOKS[look] || {}).roles || {}, o.roles || {}), roadT = o.roadTile || 'path', plazaT = o.plazaTile || 'stone';
  const A = o.area || {i: 1, j: 1, w: M.w - 2, d: M.h - 2}, K = (i, j) => j * M.w + i, avoid = new Set((o.avoid || []).map(c => K(c[0], c[1])));
  const T = {seed, size: sizeKey, style: '', items: [], roads: [], plaza: null, doors: [], exits: [], spawn: null, missed: [], tiles: [], count: {homes: 0, shops: 0, trees: 0, deco: 0}};
  const inA = (i, j) => i >= A.i && j >= A.j && i < A.i + A.w && j < A.j + A.d;
  const ROAD = new Set(), PLAZA = new Set(), BLD = new Set(), FRONT = new Set(), RESERVE = new Set(), prev = new Map();
  let H0 = 0;
  const free = (i, j, any) => M.inside(i, j) && (any || inA(i, j)) && !avoid.has(K(i, j)) && M.get(i, j).t !== 'void' && M.walk(i, j) && !at(M, i, j) && (M.get(i, j).h | 0) === H0;
  const wet = (i, j) => M.inside(i, j) && liquidAt(M, i, j);
  const open = (i, j) => free(i, j) && !RESERVE.has(K(i, j)) && !ROAD.has(K(i, j)) && !PLAZA.has(K(i, j)) && !FRONT.has(K(i, j));   /* a free spot for a little thing: off every road, the plaza and door fronts */
  function paint(i, j, t, cost){ const k = K(i, j); if(!prev.has(k)){ const c = M.get(i, j); prev.set(k, {i, j, t: c.t, cost: c.cost}); } M.set(i, j, {t, cost}); }
  function road(i, j){ const k = K(i, j); if(ROAD.has(k) || PLAZA.has(k)) return; ROAD.add(k); T.roads.push([i, j]); paint(i, j, roadT, 0.6); }
  function add(key, i, j, po, role){ const it = place(M, key, i, j, Object.assign({look, cond}, po || {})); if(!it) return null;
    if(role !== 'tree' && role !== 'plant' && it.cells.some(([a, b]) => !inA(a, b) && !liquidAt(M, a, b))){ remove(M, it); return null; }   /* only trees may grow outside the town's area */ it.role = role || ''; T.items.push(it); return it; }
  function drop(it){ remove(M, it); const n = T.items.indexOf(it); if(n >= 0) T.items.splice(n, 1); it.cells = null; }

  /* ⛲ 1. the plaza — a little off-centre, sometimes not square (no town is perfect) */
  const pw = Math.max(3, SZ.plaza + (chance(0.3) ? -1 : 0)), pd = Math.max(3, pw + (chance(0.45) ? (chance(0.5) ? 1 : -1) : 0));
  const cx = A.i + Math.floor(A.w / 2) + Math.round((R() - 0.5) * A.w * 0.16), cy = A.j + Math.floor(A.d / 2) + Math.round((R() - 0.5) * A.d * 0.16);
  H0 = M.inside(cx, cy) ? (M.get(cx, cy).h | 0) : 0;
  let P = null; for(let r = 0; r <= 5 && !P; r++) for(let dy = -r; dy <= r && !P; dy++) for(let dx = -r; dx <= r && !P; dx++){ if(Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const i0 = cx + dx - (pw >> 1), j0 = cy + dy - (pd >> 1); let ok = true; for(let a = -1; a <= pw && ok; a++) for(let b = -1; b <= pd && ok; b++){ const fi = i0 + a, fj = j0 + b, edge = a < 0 || b < 0 || a === pw || b === pd;
      if(!(edge ? M.inside(fi, fj) && !wet(fi, fj) : free(fi, fj))) ok = false; }
    if(ok) P = {i: i0, j: j0, w: pw, d: pd}; }
  if(!P){ T.missed.push('plaza'); return finish(); }
  T.plaza = P; for(let a = 0; a < P.w; a++) for(let b = 0; b < P.d; b++){ PLAZA.add(K(P.i + a, P.j + b)); paint(P.i + a, P.j + b, plazaT, 0.5); }
  const PC = {i: P.i + (P.w - 1) / 2, j: P.j + (P.d - 1) / 2};

  /* 🛤️ 2. roads — a lane walker that may bend (a sideways step = a staircase lane on the diamond grid) */
  function lane(i, j, d, lo){ lo = lo || {}; const [di, dj] = DIRS[d], cells = []; let steps = 0, last = -9, why = 'len';
    while(steps < (lo.len || 99)){ const ni = i + di, nj = j + dj;
      if(!free(ni, nj, lo.any) && !(ROAD.has(K(ni, nj)))){ why = !M.inside(ni, nj) ? 'map' : wet(ni, nj) ? 'water' : !inA(ni, nj) ? 'edge' : 'blocked'; break; }
      i = ni; j = nj; if((ROAD.has(K(i, j)) || PLAZA.has(K(i, j))) && steps > 0 && lo.join !== false){ why = 'join'; break; }
      cells.push([i, j]); steps++;
      if(lo.bend && steps - last > 2 && R() < lo.bend){ const s = lo.side || (R() < 0.5 ? 1 : -1), si = i - dj * s, sj = j + di * s; if(free(si, sj, lo.any)){ i = si; j = sj; cells.push([i, j]); last = steps; } } }
    cells.forEach(c => road(c[0], c[1]));
    if(lo.wide && cells.length){ const s = R() < 0.5 ? 1 : -1; cells.forEach(([a, b]) => { const wi = a - dj * s, wj = b + di * s; if(free(wi, wj)) road(wi, wj); }); }
    return {cells, end: [i, j], d, why}; }
  // a door on each plaza side (its middle, nudged ±1)
  const sideStart = d => { const [di, dj] = DIRS[d]; let i, j; if(di){ i = di > 0 ? P.i + P.w - 1 : P.i; j = P.j + Math.max(0, Math.min(P.d - 1, (P.d >> 1) + between(-1, 1))); }
    else { j = dj > 0 ? P.j + P.d - 1 : P.j; i = P.i + Math.max(0, Math.min(P.w - 1, (P.w >> 1) + between(-1, 1))); } return [i, j]; };
  const ends = [];
  let style = o.roads && o.roads !== 'auto' ? o.roads : pick(['cross', 'cross', 'ring', 'street', 'street']); T.style = style;
  const order = shuf([0, 1, 2, 3]);
  if(style === 'cross'){ const n = between(SZ.spokes[0], SZ.spokes[1]);
    order.slice(0, n).forEach((d, k) => { const [i, j] = sideStart(d); ends.push(lane(i, j, d, {bend: k === 0 ? 0 : 0.22, wide: SZ.wide && k < 2})); }); }
  else if(style === 'street'){ const ax = chance(0.5) ? 0 : 1;
    [ax, ax + 2].forEach((d, k) => { const [i, j] = sideStart(d); ends.push(lane(i, j, d, {bend: 0.3, wide: SZ.wide})); });
    if(SZ.spokes[1] >= 4 && chance(0.6)){ const d = ax + 1 + (chance(0.5) ? 2 : 0), [i, j] = sideStart(d % 4); ends.push(lane(i, j, d % 4, {bend: 0.25, len: between(3, 6)})); } }
  else { const r = 2 + (sizeKey === 'town' ? 1 : 0) + (chance(0.4) ? 1 : 0), gap = between(0, 3), skip = chance(0.6) ? Math.floor(R() * 4) : -1;
    const x0 = P.i - r, y0 = P.j - r, x1 = P.i + P.w - 1 + r, y1 = P.j + P.d - 1 + r, ring = [];
    for(let x = x0; x <= x1; x++) ring.push([x, y0, 3]); for(let y = y0; y <= y1; y++) ring.push([x1, y, 0]); for(let x = x1; x >= x0; x--) ring.push([x, y1, 1]); for(let y = y1; y >= y0; y--) ring.push([x0, y, 2]);
    const cut = (x, y) => (x === x0 || x === x1) && (y === y0 || y === y1) && chance(0.5);   // corners cut round now and then
    ring.forEach(([x, y, side]) => { if(side === skip && gap){ const mid = side % 2 ? (x0 + x1) >> 1 : (y0 + y1) >> 1, at2 = side % 2 ? x : y; if(Math.abs(at2 - mid) < gap) return; }
      if(cut(x, y)) return; if(free(x, y)) road(x, y); });
    order.slice(0, between(2, 4)).forEach(d => { const [i, j] = sideStart(d); const L = lane(i, j, d, {join: false, bend: 0.15, len: r + 1});
      ends.push(lane(L.end[0], L.end[1], d, {bend: 0.25})); }); }
  // 🎲 mix: short alleys off any road (any style) — the "this and that" of a real town
  function growAlley(){ const pool = T.roads.filter(([a, b]) => Math.abs(a - PC.i) + Math.abs(b - PC.j) > 3 && inA(a, b)); if(!pool.length) return null;
    for(let n = 0; n < 8; n++){ const [a, b] = pick(pool), d = Math.floor(R() * 4), [di, dj] = DIRS[d]; if(!free(a + di, b + dj) || ROAD.has(K(a + di, b + dj)) || !free(a + 2 * di, b + 2 * dj)) continue;
      const L = lane(a, b, d, {bend: 0.35, len: between(3, 6), join: true}); L.cells.forEach(([x, y]) => RESERVE.add(K(x, y))); if(L.cells.length >= 2) return L; }
    return null; }
  for(let n = between(SZ.alleys[0], SZ.alleys[1]); n > 0; n--) growAlley();
  T.style = style + '+alleys';
  // roads that reach the town's edge carry on to the map edge (the way in) → an exit
  ends.forEach(L => { if(L.why === 'edge'){ T.exits.push({i: L.end[0], j: L.end[1], d: L.d}); const out = lane(L.end[0], L.end[1], L.d, {any: true, bend: 0.2, join: false});
      out.cells.forEach(([a, b]) => { RESERVE.add(K(a, b)); }); }
    else if(L.why === 'water') T.exits.push({i: L.end[0], j: L.end[1], d: L.d, water: true}); });
  T.roads.forEach(([a, b]) => RESERVE.add(K(a, b)));

  /* 🧭 reach check (T1): from the plaza over walkable cells */
  const spawn = () => { let best = null, bd = 1e9; PLAZA.forEach(k => { const i = k % M.w, j = (k / M.w) | 0; if(!M.walk(i, j)) return; const dd = Math.abs(i - PC.i) + Math.abs(j - PC.j); if(dd < bd){ bd = dd; best = [i, j]; } }); return best; };
  function reach(){ const s = spawn(), seen = new Uint8Array(M.w * M.h); if(!s) return seen; const q = [s]; seen[K(s[0], s[1])] = 1;
    while(q.length){ const [i, j] = q.pop(); for(const [di, dj] of DIRS){ const a = i + di, b = j + dj; if(!M.inside(a, b) || seen[K(a, b)] || !M.walk(a, b)) continue; seen[K(a, b)] = 1; q.push([a, b]); } }
    return seen; }
  const targets = () => T.doors.map(d => [d.out.i, d.out.j]).concat(T.exits.filter(e => !e.water).map(e => [e.i, e.j]));
  const allReach = () => { const s = reach(); return targets().every(([a, b]) => s[K(a, b)]); };
  // put a blocking thing down only if every door + exit can still be reached
  function addSafe(key, i, j, po, role){ const it = add(key, i, j, po, role); if(!it) return null; if(!allReach()){ drop(it); return null; } return it; }

  /* 🏠 3. buildings — each gets a job and a spot that faces a road */
  const rel = {}; function doorRel(key, turn){ const id = key + turn; if(!(id in rel)){ const it = item(key, 0, 0, {turn}); rel[id] = it.door; } return rel[id]; }
  const tooClose = (cells, ownFront) => cells.some(([a, b]) => { for(let x = -1; x <= 1; x++) for(let y = -1; y <= 1; y++) if(BLD.has(K(a + x, b + y))) return true; return FRONT.has(K(a, b)) && K(a, b) !== ownFront; });
  function spotFor(key, role, prefer){ const def = DEFS[key], cand = [], tall = def.h >= 100, plazaOk = role !== 'home';
    const doors = []; ROAD.forEach(k => doors.push(k)); if(plazaOk) PLAZA.forEach(k => doors.push(k));
    for(const k of doors){ const ri = k % M.w, rj = (k / M.w) | 0;
      for(let turn = 0; turn < 4; turn++){ let dr = doorRel(key, turn);
        if(!dr){ if(turn) continue; const dd = DIRS[Math.floor(R() * 4)]; dr = {i: 0, j: 0, out: {i: dd[0], j: dd[1]}}; if(def.foot[0] > 1 || def.foot[1] > 1) continue; }   // a doorless 1 × 1 thing: right beside the road
        const ux = dr.out.i - dr.i, uy = dr.out.j - dr.j;
        for(const back of (role === 'home' ? [0, 1] : [0])){ const oi = ri - ux * back - dr.out.i, oj = rj - uy * back - dr.out.j, fi = oi + dr.out.i, fj = oj + dr.out.j;
          if(back && !free(fi, fj)) continue;
          if(!fits(M, key, oi, oj, {turn})) continue; const T2 = turner(def.foot[0], def.foot[1], turn), cells = cellsOf(def, T2, oi, oj);
          if(cells.some(([a, b]) => !inA(a, b) || RESERVE.has(K(a, b)) || ROAD.has(K(a, b)) || PLAZA.has(K(a, b)) || avoid.has(K(a, b)))) continue;
          if(tooClose(cells, K(fi, fj))) continue;
          const mx = oi + T2.W / 2, my = oj + T2.D / 2, dist = Math.hypot(mx - PC.i - 0.5, my - PC.j - 0.5);
          let sc = prefer(dist, mx, my) + R() * 1.6 - back * 0.4 + (turn < 2 ? 0.5 : 0);
          if(tall) sc += Math.max(-2, Math.min(3, ((PC.i + PC.j) - (mx + my)) * 0.35));   // T4 tall at the back
          cand.push({sc, oi, oj, turn, back, fi, fj, cells}); } } }
    cand.sort((a, b) => b.sc - a.sc); return cand; }
  function build(key, role, prefer, po){ if(!DEFS[key]) { T.missed.push(role + ':' + key); return null; }
    const cand = spotFor(key, role, prefer); for(let n = 0; n < Math.min(6, cand.length); n++){ const c = cand[n];
      const it = add(key, c.oi, c.oj, Object.assign({turn: c.turn}, po || {}), role); if(!it) continue;
      if(c.back) road(c.fi, c.fj);   // the short front path
      if(!it.door){ if(!allReach()){ drop(it); continue; } it.cells.forEach(([a, b]) => BLD.add(K(a, b))); return it; }   // a doorless thing (shrine)
      T.doors.push({i: it.door.i, j: it.door.j, out: {i: it.door.out.i, j: it.door.out.j}, key, role, it});
      if(!allReach()){ T.doors.pop(); drop(it); continue; }
      it.cells.forEach(([a, b]) => BLD.add(K(a, b))); FRONT.add(K(it.door.out.i, it.door.out.j)); return it; }
    if((role === 'home' || role === 'shrine') && grown < (sizeKey === 'town' ? 14 : 6) && (!po || (po._again | 0) < 2)){ grown++; if(growAlley()) return build(key, role, prefer, Object.assign({}, po || {}, {_again: ((po && po._again) | 0) + 1})); }   // a crowded street grows one more lane
    T.missed.push(role + ':' + key); return null; }
  let grown = 0;
  const nearPlaza = d => -d, midRing = target => d => -Math.abs(d - target) * 0.9;
  const vars = (key) => { const n = DEFS[key] ? DEFS[key].variants : 1, list = []; for(let i = 0; i < n; i++) list.push(i); return shuf(list); };
  if(SZ.inn && roles.inn) build(roles.inn, 'inn', nearPlaza);
  for(let n = 0; n < SZ.shops; n++) if(build(roles.shop, 'shop', d => -d + (n % 2 ? 0.8 : 0), {v: n % (DEFS[roles.shop] ? DEFS[roles.shop].variants : 1)})) T.count.shops++;
  if(SZ.smith && roles.smith && build(roles.smith, 'smith', midRing(P.w / 2 + 3))) T.count.shops++;
  if(SZ.temple && roles.shrine && chance(0.85)){ const sh = build(roles.shrine, 'shrine', (d, x, y) => d * 0.4 - (x + y) * 0.5);   // a little temple corner at the back
    if(sh){ const near = [[sh.x - 1, sh.y], [sh.x + 1, sh.y], [sh.x, sh.y - 1], [sh.x, sh.y + 1]].filter(([a, b]) => open(a, b));
      near.slice(0, 2).forEach(([a, b], n) => { const k = n === 0 ? roles.statue : roles.bell; if(k && addSafe(k, a, b, {turn: 0}, n ? 'bell' : 'statue')) T.count.deco++; }); } }
  const HK = [].concat(roles.home), HV = {}; HK.forEach(k => { if(!HV[k]) HV[k] = vars(k); });   /* ip-3: a look may list several home shapes (cabin · A-frame · igloo …); one home key = the same random steps as ip-2 → old towns stay the same */
  const homes = between(SZ.homes[0], SZ.homes[1]);
  for(let n = 0; n < homes; n++){ if(T.items.length > SZ.cap * 0.55) break; const hk = HK[n % HK.length], hv = HV[hk]; const it = build(hk, 'home', midRing(P.w / 2 + 2 + R() * 4), {v: hv[Math.floor(n / HK.length) % hv.length]}); if(it) T.count.homes++; }

  /* ⛲ 4. the plaza + little things: well in the middle (a bit off), lanterns on some corners, the quest board, signposts, docks, fences, crates */
  if(roles.centre){ const ci = P.i + ((P.w - 1) >> 1) + (P.w % 2 ? 0 : (chance(0.5) ? 1 : 0)), cj = P.j + ((P.d - 1) >> 1) + (P.d % 2 ? 0 : (chance(0.5) ? 1 : 0)); addSafe(roles.centre, ci, cj, {}, 'centre'); }
  const corners = [[P.i, P.j], [P.i + P.w - 1, P.j], [P.i, P.j + P.d - 1], [P.i + P.w - 1, P.j + P.d - 1]]; shuf(corners);
  if(roles.board){ for(const [a, b] of corners){ if(addSafe(roles.board, a, b, {turn: b > PC.j ? 0 : 1}, 'board')){ corners.splice(corners.findIndex(c => c[0] === a && c[1] === b), 1); break; } } }
  corners.slice(0, between(1, 3)).forEach(([a, b]) => { if(roles.light) add(roles.light, a, b, {}, 'light'); });
  // a lantern at a few road bends / joins (walk-on, never blocks)
  T.roads.filter(() => chance(0.06)).forEach(([a, b]) => { for(const [di, dj] of DIRS){ const x = a + di, y = b + dj; if(open(x, y) && add(roles.light, x, y, {}, 'light')) break; } });
  T.exits.forEach(e => { if(e.water){ if(!roles.dock) return; const [di, dj] = DIRS[e.d]; for(const [a, b] of [[e.i + di, e.j + dj], [e.i + di - 1, e.j + dj], [e.i + di, e.j + dj - 1], [e.i + di - 1, e.j + dj - 1]]) if(add(roles.dock, a, b, {turn: (e.d + 3) % 4}, 'dock')) break; return; }
    if(!roles.sign || !chance(0.85)) return; const [di, dj] = DIRS[e.d]; for(const s of [1, -1]){ const x = e.i - dj * s, y = e.j + di * s; if(open(x, y) && add(roles.sign, x, y, {turn: e.d % 2 ? 0 : 1}, 'sign')) break; } });
  // fences behind some homes (T3 keeps a lane between houses; a fence that would cut a door off is taken away again)
  T.doors.filter(d => d.role === 'home' && chance(0.45)).forEach(d => { const it = d.it, ux = d.out.i - d.i, uy = d.out.j - d.j;
    const spot = uy > 0 ? [it.x, it.y - 1, 0] : uy < 0 ? [it.x, it.y + it.d, 0] : ux > 0 ? [it.x - 1, it.y, 1] : [it.x + it.w, it.y, 1];
    if(roles.fence && open(spot[0], spot[1]) && open(spot[0] + (spot[2] ? 0 : 1), spot[1] + (spot[2] ? 1 : 0)) && addSafe(roles.fence, spot[0], spot[1], {turn: spot[2]}, 'fence')) T.count.deco++; });
  // crates beside the shops
  T.doors.filter(d => d.role === 'shop' || d.role === 'smith').forEach(d => { if(!roles.cargo || !chance(0.75)) return; const it = d.it;
    const ring = []; for(let x = it.x - 1; x <= it.x + it.w; x++) for(let y = it.y - 1; y <= it.y + it.d; y++) if(x < it.x || y < it.y || x >= it.x + it.w || y >= it.y + it.d) ring.push([x, y]);
    shuf(ring); for(const [x, y] of ring){ if(open(x, y) && addSafe(roles.cargo, x, y, {v: Math.floor(R() * 3)}, 'cargo')){ T.count.deco++; break; } } });

  /* 🌳 5. trees at the edges (T5): thicker further out, in clumps, tall ones at the back, small ones in front */
  const dist = new Int16Array(M.w * M.h).fill(-1), q = [];
  for(let j = 0; j < M.h; j++) for(let i = 0; i < M.w; i++){ const k = K(i, j); if(ROAD.has(k) || PLAZA.has(k) || BLD.has(k) || RESERVE.has(k) || at(M, i, j)){ dist[k] = 0; q.push(k); } }
  for(let h = 0; h < q.length; h++){ const k = q[h], i = k % M.w, j = (k / M.w) | 0; for(const [di, dj] of DIRS){ const a = i + di, b = j + dj; if(!M.inside(a, b) || dist[K(a, b)] >= 0) continue; dist[K(a, b)] = dist[k] + 1; q.push(K(a, b)); } }
  const clump = (i, j) => { const f = (x, y) => { let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const x = i / 3.2, y = j / 3.2, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, s = t => t * t * (3 - 2 * t);
    const a = f(x0, y0) + (f(x0 + 1, y0) - f(x0, y0)) * s(fx), b = f(x0, y0 + 1) + (f(x0 + 1, y0 + 1) - f(x0, y0 + 1)) * s(fx); return a + (b - a) * s(fy); };
  const many = o.trees == null ? 1 : +o.trees, cap = SZ.cap;
  const spots = []; for(let j = 0; j < M.h; j++) for(let i = 0; i < M.w; i++) spots.push([i, j]);
  for(let n = spots.length - 1; n > 0; n--){ const m = Math.floor(R() * (n + 1)), t = spots[n]; spots[n] = spots[m]; spots[m] = t; }
  // 🌼 little gardens: flowers / a bush beside some homes (never on a road or a door's front)
  T.doors.filter(d => d.role === 'home' && chance(0.4)).forEach(d => { const it = d.it; for(let n = 0; n < 6; n++){ const x = it.x - 1 + Math.floor(R() * (it.w + 2)), y = it.y - 1 + Math.floor(R() * (it.d + 2));
      if(open(x, y)){ const k = chance(0.6) ? 'flowers' : 'bush'; if(DEFS[k] && add(k, x, y, {v: Math.floor(R() * DEFS[k].variants)}, 'garden')){ T.count.deco++; break; } } } });
  if(many > 0) for(const [i, j] of spots){ if(T.items.length >= cap) break; const d = dist[K(i, j)]; if(d < 2 || avoid.has(K(i, j))) continue;
    const c = clump(i, j), p = (d === 2 ? 0.1 : Math.min(0.55, 0.2 + 0.08 * (d - 3))) * (0.25 + 1.3 * c) * many; if(R() >= p) continue;
    const front = (i + j) - (PC.i + PC.j), small = d === 2 || (front > 5 && chance(0.7)) || chance(0.18), key = small ? pick(roles.small) : pick(roles.tall);
    if(!DEFS[key]) continue; const it = add(key, i, j, {v: Math.floor(R() * DEFS[key].variants)}, small ? 'plant' : 'tree'); if(it){ if(small) T.count.deco++; else T.count.trees++; } }
  return finish();
  function finish(){ T.tiles = [...prev.values()]; const s = spawn(); T.spawn = s ? {x: s[0] + 0.5, y: s[1] + 0.5} : null;
    if(T.plaza){ const ok = reach(); T.doors.forEach(d => { if(!ok[K(d.out.i, d.out.j)]) T.missed.push('unreached:' + d.key); }); }
    T.doors.forEach(d => { delete d.it; }); T.count.items = T.items.length; return T; } }
town.remove = function(M, T){ if(!T) return; [...T.items].reverse().forEach(it => remove(M, it)); T.items = []; (T.tiles || []).forEach(c => M.set(c.i, c.j, {t: c.t, cost: c.cost})); T.tiles = []; };
town.SIZES = TOWN_SIZES; town.ROLES = TOWN_ROLES;
window.Props = {version: 'ip-3b', RIM, LIGHT, MAT, KINDS, SETS, DEFS, LOOKS, CONDS, addLook, addCondition, ground, addSet, add, organic, swapKey, list, check, lit, geom, turner, builder,
  pic, item, canvas: (key, o) => canvasOf(DEFS[key], o), place, fits, remove, setState, ring, stateOf: (key, st) => stateOf(DEFS[key], st), town, at, hit, seeThrough, tick, warm, sizeRange, _paint: paint, _fontsLanded: fontsLanded};
})();
