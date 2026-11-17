
/* ================= 🌳 IsoProps — shared 2.5D props on the IsoKit grid (ip-1, 🌳 IsoProps chat, 2026-11-17) =================
   ONE catalogue of houses · shops · trees · decor · landmarks drawn in code, that every IsoKit game picks from (🧳 Avateer · ⚔️ AvataRealm ·
   🏰 TD-Stories · 🏡 Family Room …). IsoKit = the engine (ground, camera, frame); IsoProps = the art on top. Plan: Drive "IsoProps — full plan.md".
   Page:  include('IsoProps') AFTER include('IsoKit'). Global `Props`. Pure canvas, no emoji in the art, no server tags in this file.
   Built from Test Harness/isoprops/kit (10_ip_head · 20_ip_core · 21_ip_catalogue · 30_ip_api) by build_isoprops.py — never edit IsoProps.html by hand.

   📏 THE 13 RULES (every prop, every chat — a game that adds its own prop follows them too)
     1 🧱 corners follow the grid: anything with corners is built from iso parts in the prop's own footprint frame (x 0…w, y 0…d tiles, z px)
     2 ☀️ same light as the tiles: top +25 % · LEFT face (+y) +12 % · RIGHT face (+x) −16 %
     3 🎨 one palette (Props.MAT + the map look's colours, one accent per region)      4 ✏️ ONE rim #2A1C14 1.5 px made at bake — painters draw no rim
     5 🌳 organic = billboards on a 2 : 1 shadow (long round things lie along the grid)
     6 📐 heights at zoom 1: deco ≤ 24 · post / sign / small thing ≤ 50 · bush 20–36 · tree 50–90 · house 70–110 · big building ≤ 140 · landmark ≤ 200
     7 🏷️ no emoji in prop art (signs are drawn, words in Fredoka)     8 ⚡ baked once per zoom step (+ a tiny optional live layer)     9 🎈 Sky Pop mood
    10 🧩 variants by seed     11 🚪 front = +y (door side); turn 0–3 REBUILDS the model (never a mirrored picture)
    12 🧍 walkers on prop maps = Iso.avatar(who, {size: 0.6}) (≈ 48 px) → doors ≈ 42 px     13 🫥 a tall prop over a walker's pixels fades to 45 %

   CATALOGUE  Props.SETS {jungle, village, temple, bits, landmark} · Props.list({set, kind, tag}) → [{key, name, set, kind, foot, h, variants, block, door, tags, live}]
   LOOKS      Props.LOOKS {jungle, cherry, desert, snow} · Props.addLook(key, {name, walls[], roofs[], trim, accent, stilts, curve, flat, snow}, base)
              a map picks ONE look; every building re-skins itself from it (a NEW shape → register your own prop with Props.add)
   PICTURES   Props.pic(key, {v, turn, look, pal, t}) → an Iso picture (Iso.drawPic / Iso.frame copy it; baked per zoom step)
              Props.canvas(key, {v, turn, look, k: zoom, s: device scale, rim}) → a plain canvas (cards, sheets, thumbnails)
   ON A MAP   it = Props.item(key, i, j, {v, turn, look, z}) → an IsoKit item {x: i, y: j (= the footprint's BACK corner), w, d, pic, alpha} — push it into
              your Iso.frame items; the footprint sort works for free
              it = Props.place(map, key, i, j, {v, turn, look}) → the same item + its footprint cells blocked (door cell + walk-on props stay walkable);
              null when it doesn't fit · Props.fits(map, key, i, j, {turn}) → true | false · Props.remove(map, it) → frees the cells
              it.door = {i, j, out: {i, j}} (inside the doorway / the cell in front of it) for walkers that go in
              Props.at(map, i, j) → the placed prop on a cell · Props.hit(view, items, px, py) → the prop whose PAINTED pixels are under a tap (roofs too)
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
function render(g, model, o){ // o: {ox, oy, k, turn, t, v, w, d}
  const k = o.k, T = turner(o.w, o.d, o.turn), V = (x, y, z) => [o.ox + (x - y) * HTW * k, o.oy + (x + y) * HTH * k - (z || 0) * k];
  const P = (x, y, z) => { const q = T.pt(x, y); return V(q[0], q[1], z); };
  const rect = p => { const a = T.pt(p.x, p.y), b = T.pt(p.x + p.w, p.y + p.d); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const key = p => { let cx, cy; if(p.t === 'box' || p.t === 'roof' || p.t === 'flat'){ const r = rect(p); cx = (r[0] + r[2]) / 2; cy = (r[1] + r[3]) / 2; } else { const q = T.pt(p.x, p.y); cx = q[0]; cy = q[1]; } return Math.round(((p.layer || 0) * 100 + cx + cy + (p.dz || 0)) * 1000) / 1000; };
  const list = model.parts.map((p, i) => ({p, i, k: key(p)})).sort((a, b) => a.k - b.k || (a.p.z || 0) - (b.p.z || 0) || a.i - b.i);   // same spot → lower part first
  list.forEach(({p}) => {
    if(p.t === 'flat'){ const r = rect(p), C = lit(p.c); face(g, [V(r[0], r[1], 0.5), V(r[2], r[1], 0.5), V(r[2], r[3], 0.5), V(r[0], r[3], 0.5)], p.fill || C.top, k); return; }
    if(p.t === 'box'){ const r = rect(p), C = lit(p.c), z0 = p.z, z1 = p.z + p.h;
      face(g, [V(r[0], r[3], z0), V(r[2], r[3], z0), V(r[2], r[3], z1), V(r[0], r[3], z1)], C.L, k);
      face(g, [V(r[2], r[1], z0), V(r[2], r[3], z0), V(r[2], r[3], z1), V(r[2], r[1], z1)], C.R, k);
      if(p.top !== false) face(g, [V(r[0], r[1], z1), V(r[2], r[1], z1), V(r[2], r[3], z1), V(r[0], r[3], z1)], p.topFill || C.top, k);
      if(p.trim){ g.strokeStyle = 'rgba(42,28,20,0.22)'; g.lineWidth = 1 * k; for(let zz = z0 + p.trim; zz < z1 - 2; zz += p.trim){ g.beginPath(); const a = V(r[0], r[3], zz), b = V(r[2], r[3], zz), c = V(r[2], r[1], zz); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.stroke(); } }
      p.decals.forEach(dc => { const n = T.nrm(NRM[dc.s][0], NRM[dc.s][1]), side = sideOf(n); if(!side) return;
        // the decal's two ends on its side (model frame) → world
        const along = dc.s === 'front' || dc.s === 'back' ? (u => [u, dc.s === 'front' ? p.y + p.d : p.y]) : (u => [dc.s === 'right' ? p.x + p.w : p.x, u]);
        const e0 = along(dc.a), e1 = along(dc.a + dc.aw), A = T.pt(e0[0], e0[1]), Bq = T.pt(e1[0], e1[1]);
        const fill = side === 'L' ? sh(dc.fill, 0.04) : sh(dc.fill, -0.12), zb = z0 + dc.z0, zt = zb + dc.h;
        if(dc.k === 'door'){ const pts = [V(A[0], A[1], zb), V(Bq[0], Bq[1], zb), V(Bq[0], Bq[1], zt - dc.h * 0.18), V((A[0] + Bq[0]) / 2, (A[1] + Bq[1]) / 2, zt), V(A[0], A[1], zt - dc.h * 0.18)];
          face(g, pts, fill, k); g.fillStyle = MAT.gold; const kn = V(A[0] + (Bq[0] - A[0]) * 0.78, A[1] + (Bq[1] - A[1]) * 0.78, zb + dc.h * 0.45); g.beginPath(); g.arc(kn[0], kn[1], 1.4 * k, 0, TAU); g.fill(); return; }
        face(g, [V(A[0], A[1], zb), V(Bq[0], Bq[1], zb), V(Bq[0], Bq[1], zt), V(A[0], A[1], zt)], fill, k);
        if(dc.k === 'win'){ g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 1 * k; const m0 = V((A[0] + Bq[0]) / 2, (A[1] + Bq[1]) / 2, zb), m1 = V((A[0] + Bq[0]) / 2, (A[1] + Bq[1]) / 2, zt); g.beginPath(); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
          const sill = [V(A[0], A[1], zb), V(Bq[0], Bq[1], zb)]; g.strokeStyle = sh(MAT.wood, -0.3); g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(sill[0][0], sill[0][1]); g.lineTo(sill[1][0], sill[1][1]); g.stroke(); }
        if(dc.paint) dc.paint(g, (u, v) => V(A[0] + (Bq[0] - A[0]) * u, A[1] + (Bq[1] - A[1]) * u, zb + v), k, side); });
      return; }
    if(p.t === 'roof'){ const r = rect(p), C = lit(p.c), ov = p.ov, x0 = r[0] - ov, y0 = r[1] - ov, x1 = r[2] + ov, y1 = r[3] + ov, z = p.z, zr = p.z + p.rh;
      let ridge = p.ridge; if(T.turn % 2) ridge = ridge === 'x' ? 'y' : 'x';
      if(p.kind === 'hip'){ const ax = (x0 + x1) / 2, ay = (y0 + y1) / 2, a = V(ax, ay, zr);
        face(g, [V(x0, y1, z), V(x1, y1, z), a], C.L, k); face(g, [V(x1, y0, z), V(x1, y1, z), a], C.R, k); }
      else if(ridge === 'x'){ const ym = (y0 + y1) / 2; face(g, [V(x0, ym, zr), V(x1, ym, zr), V(x1, y1, z), V(x0, y1, z)], C.L, k); face(g, [V(x1, y0, z), V(x1, y1, z), V(x1, ym, zr)], p.gable ? lit(p.gable).R : C.R, k);
        if(p.stripes){ g.strokeStyle = 'rgba(42,28,20,0.13)'; g.lineWidth = 1.1 * k; for(let i = 1; i < p.stripes; i++){ const u = x0 + (x1 - x0) * i / p.stripes, q1 = V(u, ym, zr), q2 = V(u, y1, z); g.beginPath(); g.moveTo(q1[0], q1[1]); g.lineTo(q2[0], q2[1]); g.stroke(); } } }
      else { const xm = (x0 + x1) / 2; face(g, [V(xm, y0, zr), V(xm, y1, zr), V(x1, y1, z), V(x1, y0, z)], C.R, k); face(g, [V(x0, y1, z), V(x1, y1, z), V(xm, y1, zr)], p.gable ? lit(p.gable).L : C.L, k);
        if(p.stripes){ g.strokeStyle = 'rgba(42,28,20,0.13)'; g.lineWidth = 1.1 * k; for(let i = 1; i < p.stripes; i++){ const u = y0 + (y1 - y0) * i / p.stripes, q1 = V(xm, u, zr), q2 = V(x1, u, z); g.beginPath(); g.moveTo(q1[0], q1[1]); g.lineTo(q2[0], q2[1]); g.stroke(); } } }
      if(p.finials){ g.fillStyle = MAT.gold; const ends = ridge === 'x' ? [V(x0, (y0 + y1) / 2, zr), V(x1, (y0 + y1) / 2, zr)] : [V((x0 + x1) / 2, y0, zr), V((x0 + x1) / 2, y1, zr)];
        ends.forEach((e, i) => { g.beginPath(); g.moveTo(e[0], e[1]); g.quadraticCurveTo(e[0] + (i ? 7 : -7) * k, e[1] - 8 * k, e[0] + (i ? 3 : -3) * k, e[1] - 13 * k); g.lineTo(e[0], e[1] - 4 * k); g.closePath(); g.fill(); }); }
      return; }
    if(p.t === 'drum' || p.t === 'cone'){ const q = T.pt(p.x, p.y), c = V(q[0], q[1], p.z), rx = p.r * HTW * k * Math.SQRT2, ry = rx / 2, C = lit(p.c);
      const gr = g.createLinearGradient(c[0] - rx, 0, c[0] + rx, 0); gr.addColorStop(0, C.L); gr.addColorStop(0.45, sh(C.base, 0.05)); gr.addColorStop(1, C.R);
      if(p.t === 'drum'){ const h = p.h * k; g.beginPath(); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI); g.lineTo(c[0] - rx, c[1] - h); g.ellipse(c[0], c[1] - h, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = EDGE; g.lineWidth = k; g.stroke();
        if(p.rings){ g.strokeStyle = 'rgba(42,28,20,0.2)'; for(let i = 1; i < p.rings; i++){ g.beginPath(); g.ellipse(c[0], c[1] - h * i / p.rings, rx, ry, 0, 0, Math.PI); g.stroke(); } }
        if(p.top !== false){ g.beginPath(); g.ellipse(c[0], c[1] - h, rx, ry, 0, 0, TAU); g.fillStyle = p.topFill || C.top; g.fill(); g.strokeStyle = EDGE; g.stroke(); } }
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
const LOOKS = {};
function addLook(key, o, base){ LOOKS[key] = Object.assign({}, LOOKS[base || 'jungle'] || {}, o, {key}); return LOOKS[key]; }
addLook('jungle', {name: 'Jungle', walls: ['#E8B979', '#D9C7A0', '#F0CFA0', '#C9DDB0'], roofs: ['#E2553A', '#E3BE6A', '#2EC4B6'], trim: '#5A3418', accent: '#E2553A', stilts: true});
addLook('cherry', {name: 'Cherry', walls: ['#FFF3E8', '#F7E1D3', '#FBE9EE', '#EFE6D8'], roofs: ['#3E4A6B', '#B5172A', '#5A6E8C'], trim: '#3B2A2A', accent: '#FF8FB0', stilts: false, curve: true});
addLook('desert', {name: 'Desert', walls: ['#E9C891', '#F2D8A8', '#DDB37A', '#EBCB9C'], roofs: ['#D98E4A', '#C46F3A', '#E9C891'], trim: '#7A4A22', accent: '#2EC4B6', stilts: false, flat: true});
addLook('snow', {name: 'Snow', walls: ['#B98A5E', '#A5764C', '#C99A6C', '#9C6E46'], roofs: ['#5A6E8C', '#7A4A3A', '#3E5A4A'], trim: '#4A2E1C', accent: '#5EC3EA', stilts: false, snow: true});

/* ---------- 📚 catalogue ---------- */
const SETS = {}, DEFS = {};
function addSet(key, o){ SETS[key] = Object.assign({key, props: []}, o); return SETS[key]; }
function add(set, key, def){ def = Object.assign({key, set, kind: 'building', foot: [1, 1], h: 40, variants: 1, block: true, turns: 4, organic: false, tags: []}, def); DEFS[key] = def; (SETS[set] || addSet(set, {name: set})).props.push(key); return def; }
/* 🌳 IsoProps — starter catalogue draft (IP-0). Every prop follows the 13 rules: corners = iso parts on the grid, tile light,
   one silhouette rim (from the bake — painters here draw NO rim of their own), organic = billboards on a 2 : 1 shadow, drawn signs (no emoji),
   variants by seed, a front (+y) that turn 0–3 repaints. Walkers on prop maps = Iso.avatar size 0.6 (≈ 48 px at zoom 1) → doors ≈ 42 px. */
(function(){   // 📚 starter catalogue (IP-0 drafts → ip-1)
'use strict';
const K = {add, addSet, MAT, DEFS}, D = PD, M = K.MAT, TAU = Math.PI * 2, sh = D.sh;
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
function bamboo(g, x, y, k){ g.save(); g.translate(x, y); g.scale(k, k);
  [[-7, 50], [0, 62], [7, 44], [-2, 36]].forEach(b => { piece(g, [{path: g => D.rr(g, b[0] - 2.6, -b[1], 5.2, b[1], 2), fill: '#8FCB4A'}]); g.strokeStyle = 'rgba(60,90,30,0.55)'; g.lineWidth = 1; for(let yy = -8; yy > -b[1]; yy -= 10){ g.beginPath(); g.moveTo(b[0] - 2.6, yy); g.lineTo(b[0] + 2.6, yy); g.stroke(); } g.fillStyle = '#6FCB4A'; g.beginPath(); D.ell(g, b[0] + 5, -b[1] + 5, 5.5, 2.2, -0.5); g.fill(); });
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
function addOrganic(set, key, o, fn){ const def = K.add(set, key, Object.assign({organic: true, kind: 'tree'}, o)); def.build = (B, v) => B.bill(def.foot[0] / 2, def.foot[1] / 2, 0, (g, x, y, k, t) => fn(g, x, y, k, t, v)); return def; }
addOrganic('jungle', 'palm', {name: 'Palm', h: 82, variants: 3, tags: ['tree', 'beach']}, (g, x, y, k, t, v) => palm(g, x, y, k, t, v));
addOrganic('jungle', 'jtree', {name: 'Jungle tree', h: 72, variants: 3, tags: ['tree']}, (g, x, y, k, t, v) => canopy(g, x, y, k, HUES[v % 3], 1.08));
addOrganic('jungle', 'mango', {name: 'Mango tree', h: 78, variants: 2, tags: ['tree', 'fruit']}, (g, x, y, k, t, v) => canopy(g, x, y, k, ['#4CA83A', '#2E7A26', '#7CCB55'], 1.12, true, 3 + v));
addOrganic('jungle', 'banana', {name: 'Banana', h: 36, kind: 'bush', tags: ['plant', 'fruit']}, (g, x, y, k, t) => banana(g, x, y, k, t));
addOrganic('jungle', 'bamboo', {name: 'Bamboo', h: 64, tags: ['plant']}, (g, x, y, k) => bamboo(g, x, y, k));
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
/* ---------- 🖼️ pictures: model → canvas with ONE silhouette rim (zoom k, device scale s) ---------- */
// geometry at zoom 1: the picture is (W + Dd)·32 + 2·MX wide; anchor = the footprint's BACK corner (= IsoKit item x, y)
const MX = 34, MT = 26, MB = 12;
function geom(def, turn){ const T = turner(def.foot[0], def.foot[1], turn), W = T.W, Dd = T.D, top = def.h + MT + (def.over || 0);
  return {W, Dd, w: (W + Dd) * HTW + 2 * MX + (def.wide || 0) * 2, h: top + (W + Dd) * HTH + MB, ax: Dd * HTW + MX + (def.wide || 0), ay: top}; }
const hasDoc = typeof document !== 'undefined';
function mkCanvas(w, h){ const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; }
// paint once (no cache): o = {v, turn, look, pal, t, k, s, rim}
function paint(def, o){ o = o || {}; const turn = ((o.turn | 0) % 4 + 4) % 4, v = (o.v | 0) % Math.max(1, def.variants), s = o.s || 1, k = o.k || 1, G = geom(def, turn);
  const t0 = performance.now(), cw = Math.ceil(G.w * k * s), ch = Math.ceil(G.h * k * s);
  const out = mkCanvas(cw, ch), og = out.getContext('2d'), body = mkCanvas(cw, ch), bg = body.getContext('2d');
  og.scale(s, s); footShadow(og, G.ax * k, G.ay * k, k, G.W, G.Dd, def.organic, def.shadowA);
  bg.scale(s, s); TEXT_USED = false; const model = builder(), look = Object.assign({}, LOOKS[o.look || def.look || 'jungle'] || LOOKS.jungle, o.pal || {});
  def.build(model, v, look); render(bg, model, {ox: G.ax * k, oy: G.ay * k, k, turn, t: o.t || 0, v, w: def.foot[0], d: def.foot[1]});
  if(TEXT_USED) def._text = true; out._text = TEXT_USED;
  if(o.rim !== false){ const sil = mkCanvas(cw, ch), sg = sil.getContext('2d'); sg.drawImage(body, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = RIM; sg.fillRect(0, 0, cw, ch);
    const r = 1.5 * k * s; for(let i = 0; i < 8; i++){ const a = i * TAU / 8; og.setTransform(1, 0, 0, 1, 0, 0); og.drawImage(sil, Math.cos(a) * r, Math.sin(a) * r); } }
  og.setTransform(1, 0, 0, 1, 0, 0); og.drawImage(body, 0, 0);
  out._ms = performance.now() - t0; out._g = G; out._k = k; out._s = s; out._pad = 0; return out; }
// cached canvas (cards, thumbnails, sheets) — a small LRU so a catalogue page never grows memory forever
const CACHE = new Map(), CACHE_MAX = 240;
function canvasOf(def, o){ o = o || {}; const id = [def.key, o.turn | 0, (o.v | 0) % Math.max(1, def.variants), o.s || 1, o.k || 1, o.t || 0, o.rim === false ? 0 : 1, o.look || '', o.pal ? JSON.stringify(o.pal) : ''].join('|');
  let c = CACHE.get(id); if(c){ CACHE.delete(id); CACHE.set(id, c); return c; }
  c = paint(def, o); CACHE.set(id, c); if(CACHE.size > CACHE_MAX) CACHE.delete(CACHE.keys().next().value); return c; }
// an IsoKit picture (duck-types Iso.sprite: bake(step, lazy) → canvas with _s / _pad). Same prop + variant + turn + look = ONE shared picture.
const PICTS = new Map(), PICT_MAX = 600; let bakeT = 0, bakeN = 0;
function pic(key, o){ o = o || {}; const def = DEFS[key]; if(!def) throw new Error('IsoProps: no prop "' + key + '"');
  const turn = ((o.turn | 0) % 4 + 4) % 4, v = (o.v | 0) % Math.max(1, def.variants), look = o.look || def.look || 'jungle', t = o.t || 0;
  const id = 'ip:' + key + ':' + turn + ':' + v + ':' + look + ':' + t + (o.pal ? ':' + JSON.stringify(o.pal) : ''); let P = PICTS.get(id); if(P) return P;
  const G = geom(def, turn), po = {turn, v, look, t, pal: o.pal};
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
function item(key, i, j, o){ o = o || {}; const def = DEFS[key]; if(!def) throw new Error('IsoProps: no prop "' + key + '"');
  const turn = ((o.turn | 0) % 4 + 4) % 4, T = turner(def.foot[0], def.foot[1], turn), v = (o.v | 0) % Math.max(1, def.variants), look = o.look || def.look || 'jungle';
  const it = {x: i, y: j, z: o.z || 0, w: T.W, d: T.D, pic: null, prop: key, v, turn, look, pal: o.pal, tall: def.h >= 50, alpha: 1, door: doorOf(def, T, i, j)};
  if(def.live){ const N = def.live.frames || 6; it.frames = []; for(let n = 0; n < N; n++) it.frames.push(pic(key, {turn, v, look, pal: o.pal, t: Math.round(def.live.period * n / N * 1000) / 1000}));
    it.frames.forEach(P => { P.sib = it.frames; }); it.pic = it.frames[0]; }
  else it.pic = pic(key, {turn, v, look, pal: o.pal});
  return it; }
// 🌊 cells a prop may stand on: walkable ground; bridges + docks may also stand on water
function liquidAt(M, a, b){ const c = M.get(a, b); return !!c && (c.t === 'water' || c.t === 'moat' || c.t === 'lava'); }
function fits(M, key, i, j, o){ o = o || {}; const def = DEFS[key]; if(!def) return false; const T = turner(def.foot[0], def.foot[1], o.turn), cells = cellsOf(def, T, i, j), occ = M._props || {};
  let h = null; for(const [a, b] of cells){ if(!M.inside(a, b)) return false; if(occ[b * M.w + a] && occ[b * M.w + a] !== o.ignore) return false;
    const c = M.get(a, b); if(c.t === 'void') return false; const wet = liquidAt(M, a, b);
    if(wet ? !(def.kind === 'bridge') : !M.walk(a, b)) return false;
    const hh = wet ? 0 : c.h; if(h == null) h = hh; else if(hh !== h && !wet) return false; }   // flat ground only
  return true; }
function place(M, key, i, j, o){ o = o || {}; if(!fits(M, key, i, j, o)) return null; const def = DEFS[key], T = turner(def.foot[0], def.foot[1], o.turn);
  const cells = cellsOf(def, T, i, j); let z = 0; cells.forEach(([a, b]) => { if(!liquidAt(M, a, b)) z = Math.max(z, M.get(a, b).h || 0); });
  const it = item(key, i, j, Object.assign({}, o, {z})); M._props = M._props || {}; it.cells = [];
  cells.forEach(([a, b, blk]) => { const k = b * M.w + a, isDoor = it.door && it.door.i === a && it.door.j === b, prev = M.get(a, b).block || 0;
    M._props[k] = it; it.cells.push([a, b, prev]); if(blk && !isDoor && !liquidAt(M, a, b)) M.set(a, b, {block: 1}); });
  return it; }
function remove(M, it){ if(!it || !it.cells) return; it.cells.forEach(([a, b, prev]) => { const k = b * M.w + a; if(M._props && M._props[k] === it) delete M._props[k]; if(M.inside(a, b) && (M.get(a, b).block || 0) !== prev) M.set(a, b, {block: prev}); }); it.cells = null; }
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

/* ---------- 📚 the catalogue as data + 📏 rule checks ---------- */
const KINDS = {deco: [0, 24], post: [0, 50], sign: [0, 50], thing: [0, 50], fence: [0, 50], bridge: [0, 50], bush: [20, 36], tree: [50, 90], building: [0, 140], gate: [0, 140], landmark: [0, 200]};
function sizeRange(def){ if(def.tags.indexOf('house') >= 0 && def.tags.indexOf('big') < 0) return [70, 110]; return KINDS[def.kind] || [0, 200]; }
function meta(def){ return {key: def.key, name: def.name, set: def.set, kind: def.kind, foot: def.foot.slice(), h: def.h, variants: def.variants, block: def.block, door: def.door || null, tags: def.tags.slice(), organic: !!def.organic, live: !!def.live}; }
function list(f){ f = f || {}; const keys = f.set ? (SETS[f.set] || {props: []}).props : Object.keys(DEFS);
  return keys.map(k => DEFS[k]).filter(d => (!f.kind || d.kind === f.kind) && (!f.tag || d.tags.indexOf(f.tag) >= 0)).map(meta); }
// a prop's rule check: size range for its kind · nothing clipped at any turn / variant · the rim is there · bake time
function check(key){ const def = DEFS[key], problems = []; if(!def) return {ok: false, problems: ['no prop ' + key]};
  const r = sizeRange(def); if(def.h < r[0] || def.h > r[1]) problems.push('height ' + def.h + ' outside ' + r[0] + '–' + r[1] + ' for a ' + (r[0] === 70 ? 'house' : def.kind));
  const times = []; let rim = false;
  for(let turn = 0; turn < 4; turn++) for(let v = 0; v < def.variants; v++){ const c = paint(def, {turn, v, k: 1, s: 1}); times.push(c._ms);
    const g = c.getContext('2d'), W = c.width, H = c.height, d = g.getImageData(0, 0, W, H).data, A = (x, y) => d[(y * W + x) * 4 + 3];
    let edge = 0; for(let x = 0; x < W; x++){ if(A(x, 0) > 30) edge++; if(A(x, H - 1) > 30) edge++; } for(let y = 0; y < H; y++){ if(A(0, y) > 30) edge++; if(A(W - 1, y) > 30) edge++; }
    if(edge) problems.push('clipped at turn ' + turn + ' v' + v + ' (' + edge + ' px on the edge)');
    if(!rim) for(let i = 0; i < d.length; i += 4) if(d[i + 3] > 200 && Math.abs(d[i] - 42) < 6 && Math.abs(d[i + 1] - 28) < 6 && Math.abs(d[i + 2] - 20) < 6){ rim = true; break; } }
  times.sort((x, y) => x - y); const ms = times[times.length >> 1];   // the usual bake (median — one slow frame of the browser is not the prop)
  if(!rim) problems.push('no rim'); if(ms > 12) problems.push('bake ' + ms.toFixed(1) + ' ms (> 12)');
  return {ok: !problems.length, problems, ms, msMax: times[times.length - 1]}; }

window.Props = {version: 'ip-1', RIM, LIGHT, MAT, KINDS, SETS, DEFS, LOOKS, addLook, addSet, add, list, check, lit, geom, turner, builder,
  pic, item, canvas: (key, o) => canvasOf(DEFS[key], o), place, fits, remove, at, hit, seeThrough, tick, warm, sizeRange, _paint: paint, _fontsLanded: fontsLanded};
})();
