
/* 🌍 IsoLook_realm — 🏰⚔️ realm — AvataRealm shared pieces (6 teams + patterns · 11 slots · 🏗️ build steps · 🪙 coin rock · 🧱 brick tree · 🟩 floors) — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['realm'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/realm.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_realm: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌍 IsoProps LOOK file — 🏰⚔️ realm · AvataRealm's shared pieces (ar-1 pictures, 🌳 IsoProps chat 2026-11-17).
   Every AvataRealm side file (raptor · bolt · … one per side) builds ON this one:
     🎨 TEAMS — 6 team colours 🔵 🔴 🟡 🟢 🟣 🟠: a building reads look.team (pass {pal: {team: 'red'}} or any hex) → flags · banners · roof trim
     🏗️ SITE  — every building has 4 construction steps 0 · 33 · 66 · 100 % (pass {pal: {build: 33}}): 0 = staked-out slab + a pile of
               material · 33 = walls up to ⅓ inside scaffolding · 66 = ⅔ + roof frame + a little crane · 100 = done (same model, cut — never a 2nd drawing)
     🏚️ ruined = destroyed (rule 14 'ruined' — cracks · holes · boards · rubble · lights out)
     🧱 SLOTS — the 11 AvataRealm building slots, SAME footprint + door for every side (one town plan fits all 12 sides)
     🪙 coinrock + 🧱 bricktree (states full · half · empty) — ONE shape each, recoloured by the side's look.res
     🟩 FLOORS — each side's territory floor as an IsoKit-style tile painter (ar-1 build: handed to IsoKit as a tile type — ask the 🏰 IsoKit lane)
   Keys of a side's buildings: Props.AR.key(side, slot) → '<side>_<slot>' (raptor_house …). */
(function(){
'use strict';
const {vis, F, line, polyP, ph, lightOf, dome, frustum, halo} = T;
const D = PD, M = MAT, TAU = Math.PI * 2, S2 = Math.SQRT2;
addSet('realm', {name: 'Realm', icon: '🏰', accent: '#F2B731'});
/* ---------- 🎨 6 team colours (AvataRealm §14j) ---------- */
const TEAMS = {blue: '#2A6BFF', red: '#E3283A', gold: '#FFC81A', green: '#17A653', purple: '#A43BEA', orange: '#FF7A12'};   // ar-1p2: hues pulled further apart
const TEAM_ORDER = ['blue', 'red', 'gold', 'green', 'purple', 'orange'];
const teamOf = L => { const t = L && L.team; return !t ? TEAMS.blue : (TEAMS[t] || t); };
/* 🧵 ar-1p2 (Aowu 2026-11-18 "colour alone is still alike on some buildings"): every team ALSO owns a PATTERN, painted on every band · banner · flag · ground kerb
   🔵 dots · 🔴 slashes · 🟡 checks · 🟢 zigzag · 🟣 diamonds · 🟠 teeth — a custom hex gets one centre stripe */
const TEAM_PAT = {blue: 'dots', red: 'slash', gold: 'checks', green: 'zigzag', purple: 'diamond', orange: 'teeth'};
const patOf = L => { const t = L && L.team; return !t ? TEAM_PAT.blue : (TEAM_PAT[t] || 'stripe'); };
function lum(hex){ const h = String(hex).replace('#', ''), n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6), 16); return ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) / 255; }
const inkOf = col => lum(col) > 0.66 ? '#6A4200' : '#FFFFFF';
// paint pattern `pat` in a band: M(s, v) → screen point, s = 0..len along the band, v = 0..h across it (model px); k = zoom
function patPaint(g, M, len, h, pat, ink, k){ if(h < 2.5 || len < 2) return; g.save(); g.fillStyle = ink; g.strokeStyle = ink; g.lineJoin = 'round'; g.lineCap = 'round';
  const poly = pts => { polyP(g, pts.map(q => M(q[0], q[1]))); g.fill(); };
  if(pat === 'dots'){ const st = Math.max(4.2, h * 1.05), r = h * 0.25; for(let s = st / 2; s < len; s += st){ const c = M(s, h / 2); g.beginPath(); g.arc(c[0], c[1], r * k, 0, TAU); g.fill(); } }
  else if(pat === 'slash'){ const st = Math.max(4, h * 0.95), w = st * 0.42, lean = h * 0.55; for(let s = -lean; s < len; s += st) poly([[s, 0], [s + w, 0], [s + w + lean, h], [s + lean, h]]); }
  else if(pat === 'checks'){ const c = h / 2; for(let i = 0, s = 0; s < len; i++, s += c) poly([[s, (i % 2) * c], [s + c, (i % 2) * c], [s + c, (i % 2) * c + c], [s, (i % 2) * c + c]]); }
  else if(pat === 'zigzag'){ const st = Math.max(4, h * 0.9); g.lineWidth = Math.max(1, h * 0.24) * k; g.beginPath(); let up = 0; for(let s = 0; s <= len + st; s += st / 2, up ^= 1){ const q = M(Math.min(s, len), up ? h * 0.78 : h * 0.22); s === 0 ? g.moveTo(q[0], q[1]) : g.lineTo(q[0], q[1]); } g.stroke(); }
  else if(pat === 'diamond'){ const st = Math.max(4.4, h * 1.1), d = h * 0.36; for(let s = st / 2; s < len; s += st) poly([[s - d, h / 2], [s, h * 0.9], [s + d, h / 2], [s, h * 0.1]]); }
  else if(pat === 'teeth'){ const st = Math.max(4, h * 0.95); for(let s = 0; s < len; s += st) poly([[s, h], [s + st, h], [s + st / 2, h * 0.12]]); }
  else { g.lineWidth = Math.max(1, h * 0.2) * k; const a = M(0, h / 2), b = M(len, h / 2); line(g, a, b); }
  g.restore(); }
// a box-face band painter (decal paint): solid team colour + pattern + dark rims, so the band reads THICK
function bandPaint(L, H){ return (g, Q, k) => { const col = teamOf(L), c = L.cond, br = c && c.broken, fill = br ? D.sh(col, -0.42) : col;
  const a = Q(0, 0), b = Q(1, 0), len = Math.hypot(b[0] - a[0], b[1] - a[1]) / k;
  g.save(); polyP(g, [Q(0, 0), Q(1, 0), Q(1, H), Q(0, H)]); g.fillStyle = fill; g.fill(); g.clip();
  if(!br) patPaint(g, (s, v) => Q(s / len, v), len, H, patOf(L), inkOf(col), k);
  g.restore(); g.strokeStyle = D.sh(col, -0.5); g.lineWidth = 1.3 * k; line(g, Q(0, 0.4), Q(1, 0.4)); line(g, Q(0, H - 0.4), Q(1, H - 0.4)); }; }
/* ---------- 🧱 the 11 slots: same footprint + door for every side ---------- */
const SLOTS = {
  house: {foot: [3, 2], door: [1.5, 2], name: 'House', icon: '🏠', states: ['1', '2', '3']},   // 3 levels = 3 shapes (🐣 morph rule)
  camp: {foot: [2, 2], door: [1, 2], name: 'Camp', icon: '🏕️'}, ride: {foot: [2, 3], door: [1, 3], name: 'Ride-on house', icon: '🎠'},
  nest: {foot: [2, 2], door: [1, 2], name: 'Nest', icon: '🪽'}, care: {foot: [2, 2], door: [1, 2], name: 'Care', icon: '🩹'},
  workshop: {foot: [2, 2], door: [1, 2], name: 'Workshop', icon: '🔧'}, tower: {foot: [1, 1], door: null, name: 'Watch tower', icon: '🗼'},
  wardrobe: {foot: [2, 1], door: [1, 1], name: 'Wardrobe', icon: '🎨'}, spell: {foot: [2, 2], door: [1, 2], name: 'Spell tower', icon: '🔮'},
  hideout: {foot: [2, 2], door: [1, 2], name: 'Hideout', icon: '🕵️'}, den: {foot: [2, 2], door: [1, 2], name: 'Den', icon: '🐾'}};
const SLOT_ORDER = ['house', 'camp', 'ride', 'nest', 'care', 'workshop', 'tower', 'wardrobe', 'spell', 'hideout', 'den'];
const SIDES = {};   // side → {name, look, icon, emblem}
/* ---------- 🚩 team pieces (world-space custom parts; zb / top tell the 🏗️ site cut where they sit) ---------- */
// a pole with a waving pennant in the team colour (+ the side's emblem in white)
function pennant(B, L, x, y, z, h, o){ o = o || {}; const col = teamOf(L), em = o.emblem;
  B.custom(x, y, (g, P, k, t) => { const a = P(x, y, z), tp = [a[0], a[1] - h * k], wu = (o.w || 20) * 1.35, hu = (o.hh || 12) * 1.35, w = wu * k, hh = hu * k, c = L.cond, wave = c && c.still ? 0 : Math.sin(ph(t, 1.6)) * 1.6 + Math.cos(ph(t, 1.6)) * 0.8;
    g.strokeStyle = o.pole || '#5A3418'; g.lineWidth = 2 * k; g.lineCap = 'round'; line(g, a, tp);
    const shape = () => { g.beginPath(); g.moveTo(tp[0] + 0.8 * k, tp[1] + 1 * k); g.quadraticCurveTo(tp[0] + w * 0.5, tp[1] + (2 + wave) * k, tp[0] + w, tp[1] + hh * 0.42 + wave * k);
      if(c && c.broken){ g.lineTo(tp[0] + w * 0.6, tp[1] + hh * 0.6); g.lineTo(tp[0] + w * 0.45, tp[1] + hh * 0.9); } g.quadraticCurveTo(tp[0] + w * 0.5, tp[1] + hh * 0.8 + wave * k, tp[0] + 0.8 * k, tp[1] + hh); g.closePath(); };
    shape(); g.fillStyle = c && c.broken ? D.sh(col, -0.45) : col; g.fill();
    if(!(c && c.broken)){ g.save(); shape(); g.clip(); const s0 = wu * 0.5;   // 🧵 the fly half wears the team pattern
      patPaint(g, (s, v) => [tp[0] + (s0 + s) * k, tp[1] + (hu - v) * k + wave * k * (s0 + s) / wu * 0.8], wu - s0, hu, patOf(L), inkOf(col), k); g.restore(); }
    shape(); g.strokeStyle = D.sh(col, -0.5); g.lineWidth = 1.1 * k; g.stroke();
    if(em && !(c && c.broken)) em(g, tp[0] + w * 0.25, tp[1] + hh * 0.5 + wave * 0.3 * k, hh * 0.3, inkOf(col));
    g.fillStyle = o.knob || '#F2B731'; g.beginPath(); g.arc(tp[0], tp[1], 2 * k, 0, TAU); g.fill(); }, {layer: o.layer == null ? 5 : o.layer, zb: z, top: z + h});
}
// a hanging banner on a box side (team colour, V tail, the side's emblem) — B.decal on a face
function banner(B, L, b, s, a, aw, z0, h, em){ const col = teamOf(L), side = s === 'front' || s === 'back' ? [b.x, b.w] : [b.y, b.d];
  const aw2 = Math.min(side[1] - 0.04, aw * 1.3), a2 = Math.max(side[0] + 0.02, Math.min(side[0] + side[1] - aw2 - 0.02, a - (aw2 - aw) / 2)), ink = inkOf(col);   // ar-1p2: 30 % wider
  B.decal(b, s, a2, aw2, z0, h, col, {paint: (g, Q, k) => { const c = L.cond, br = c && c.broken; g.fillStyle = br ? D.sh(col, -0.4) : col;
    const p0 = Q(0, 0), p1 = Q(1, 0), len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / k;
    polyP(g, [Q(0, 0.5), Q(0.5, -h * 0.3), Q(1, 0.5), Q(1, 0), Q(0, 0)]); g.fill();
    if(!br){ g.save(); polyP(g, [Q(0, h * 0.42), Q(1, h * 0.42), Q(1, 0), Q(0.5, -h * 0.3), Q(0, 0)]); g.clip(); patPaint(g, (s2, v) => Q(s2 / len, v - h * 0.3), len, h * 0.72, patOf(L), ink, k); g.restore(); }   // 🧵 lower part = pattern
    g.fillStyle = 'rgba(255,255,255,0.32)'; polyP(g, [Q(0, h), Q(1, h), Q(1, h - 2.4), Q(0, h - 2.4)]); g.fill();
    g.strokeStyle = D.sh(col, -0.5); g.lineWidth = 1.1 * k; polyP(g, [Q(0, h), Q(1, h), Q(1, 0), Q(0.5, -h * 0.3), Q(0, 0)]); g.stroke();
    if(em && !br){ const m = Q(0.5, h * 0.7), m2 = Q(0.9, h * 0.7); em(g, m[0], m[1], Math.min(h * 0.22, Math.abs(m2[0] - m[0]) * 1.1), ink); } }});
}
// roof trim / band in the team colour along a box's sides — ar-1p2: 2.25 × thicker (grows DOWN from its old top) + team pattern + dark rims
function trim(B, L, b, z0, h, sides){ const h0 = h || 4, H = Math.round(h0 * 2.25 * 10) / 10, zz = Math.max(0, z0 + h0 - H), col = teamOf(L);
  (sides || ['front', 'right', 'left', 'back']).forEach(s => B.decal(b, s, ...F(b, s), zz, H, col, {paint: bandPaint(L, H)})); }
// 🟦 team kerb: a patterned team-colour band round the footprint on the ground (every building, every build step) — reads from far away
function kerb(B, L, W, Dd){ const bld = L.build != null && +L.build < 100; B.custom(W / 2, Dd / 2, (g, P, k) => { const col = teamOf(L), c = L.cond, br = c && c.broken, e0 = bld ? -0.1 : 0.03, e1 = bld ? 0.05 : 0.19, U = 20, z = 0.4;   // 🏗️ while building = team tape just round the slab
  const edges = [[[e0, Dd - e0], [W - e0, Dd - e0], [0, -1]], [[W - e0, Dd - e0], [W - e0, e0], [-1, 0]], [[W - e0, e0], [e0, e0], [0, 1]], [[e0, e0], [e0, Dd - e0], [1, 0]]];
  edges.forEach(([p0, p1, n]) => { const L2 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), w = e1 - e0, len = L2 * U, hh = w * U;
    const M = (s, v) => { const f = s / len, x = p0[0] + (p1[0] - p0[0]) * f + n[0] * v / U, y = p0[1] + (p1[1] - p0[1]) * f + n[1] * v / U; return P(x, y, z); };
    g.save(); polyP(g, [M(0, 0), M(len, 0), M(len - hh, hh), M(hh, hh)]); g.fillStyle = br ? D.sh(col, -0.45) : col; g.fill(); g.clip();
    if(!br) patPaint(g, M, len, hh, patOf(L), inkOf(col), k); g.restore();
    g.strokeStyle = D.sh(col, -0.5); g.lineWidth = 1 * k; line(g, M(0, 0), M(len, 0)); }); }, {layer: -8, zb: -1, top: 0.3}); }
/* ---------- 🏗️ SITE: construction steps on ANY model (0 · 33 · 66 · 100 %) ---------- */
const BUILD_STEPS = [0, 33, 66, 100];
function topOf(p){ if(p.t === 'box' || p.t === 'drum' || p.t === 'cone') return p.z + p.h; if(p.t === 'roof') return p.z + p.rh; if(p.t === 'flat') return 1; return p.top != null ? p.top : (p.z || 0); }
function baseOf(p){ return p.zb != null ? p.zb : (p.z || 0); }
function clipDraw(p, cut){ // a custom / billboard part that crosses the cut → painted only below the cut (screen line through its own anchor)
  if(p.t === 'custom'){ const f = p.draw; p.draw = (g, P, k, t, T2) => { const a = P(p.x, p.y, cut); g.save(); g.beginPath(); g.rect(a[0] - 4000, a[1], 8000, 4000); g.clip(); f(g, P, k, t, T2); g.restore(); }; }
  else if(p.t === 'bill'){ const f = p.paint; p.paint = (g, sx, sy, k, t, v, T2) => { g.save(); g.beginPath(); g.rect(sx - 4000, sy - (cut - (p.z || 0)) * k, 8000, 4000); g.clip(); f(g, sx, sy, k, t, v, T2); g.restore(); }; } }
function site(def){ const inner = def.build;
  def.build = (B, v, L) => { inner(B, v, L); const pct = L.build == null ? 100 : Math.max(0, Math.min(100, +L.build)); if(pct >= 100) return;
    const W = def.foot[0], Dd = def.foot[1], all = B.parts.splice(0), keep = all.filter(p => !p.fx), H = Math.max(24, ...keep.map(topOf));
    const cut = pct <= 0 ? 0 : Math.round(H * (pct >= 66 ? 0.7 : 0.36)), roofs = [], col = teamOf(L), wood = '#B98A56', lumber = '#E3B57A';
    keep.forEach(p => { const z0 = baseOf(p), z1 = topOf(p);
      if(p.t === 'flat'){ if(pct > 0) B.parts.push(p); return; }
      if(z0 >= cut - 0.5){ if(p.t === 'roof') roofs.push(p); return; }   // all above the cut: not built yet
      if(z1 <= cut + 0.5){ B.parts.push(p); return; }                     // all below: built
      if(p.t === 'box'){ const nh = cut - p.z; p.h = nh; p.top = true; p.decals = p.decals.filter(dc => dc.z0 + dc.h <= nh + 0.5 || (dc.k === 'door' && dc.z0 < 2)).map(dc => dc.z0 + dc.h > nh ? Object.assign({}, dc, {h: nh - dc.z0}) : dc); p.trim = p.trim || 0; B.parts.push(p); return; }
      if(p.t === 'drum'){ p.h = cut - p.z; B.parts.push(p); return; }
      if(p.t === 'cone' || p.t === 'roof'){ if(p.t === 'roof') roofs.push(p); return; }
      clipDraw(p, cut); B.parts.push(p); });
    const e = 0.04, sb = B.box(e, e, 0, W - 2 * e, Dd - 2 * e, 3, '#C9BFA8', {layer: -2});   // the slab (every step)
    if(pct <= 0){ // 📐 staked-out slab: corner stakes + string, a pile of lumber + bricks, a team pennant
      B.custom(W / 2, Dd / 2, (g, P, k) => { const pts = [[0.16, 0.16], [W - 0.16, 0.16], [W - 0.16, Dd - 0.16], [0.16, Dd - 0.16]];
        g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1 * k; g.setLineDash([3 * k, 2 * k]); polyP(g, pts.map(q => P(q[0], q[1], 9))); g.stroke(); g.setLineDash([]);
        pts.forEach(q => { const a = P(q[0], q[1], 3), b2 = P(q[0], q[1], 12); g.strokeStyle = '#8A5A2B'; g.lineWidth = 2 * k; line(g, a, b2); g.fillStyle = col; g.beginPath(); g.arc(b2[0], b2[1], 1.6 * k, 0, TAU); g.fill(); }); }, {layer: 2});
      for(let i = 0; i < 3; i++) B.box(0.3, Dd - 0.62 + i * 0.01, 3 + i * 3, Math.min(1.1, W * 0.45), 0.22, 3, i % 2 ? lumber : wood, {layer: 1});
      for(let i = 0; i < 2; i++) for(let j = 0; j < 2 - i; j++) B.box(W - 0.82 + j * 0.24 + i * 0.12, Dd - 0.62, 3 + i * 5, 0.22, 0.3, 5, '#D2734A', {layer: 1});
      pennant(B, L, W - 0.3, 0.3, 3, 30, {w: 13, hh: 8, emblem: SIDES[def.side] && SIDES[def.side].emblem}); return; }
    // 🪜 scaffolding round the cut walls (poles at the corners, planks along the two seen sides, a ladder at the front)
    const top = cut + 12, px = [0.05, W - 0.17], py = [0.05, Dd - 0.17];
    px.forEach(x => py.forEach(y => B.box(x + 0.01, y + 0.01, 0, 0.09, 0.09, top, wood, {layer: 4})));
    for(let z = 22; z < top - 8; z += 24){ B.box(0.05, Dd - 0.13, z, W - 0.1, 0.08, 2, lumber, {layer: 4}); B.box(W - 0.13, 0.05, z, 0.08, Dd - 0.1, 2, lumber, {layer: 4}); }
    B.box(0.05, Dd - 0.13, top - 2.4, W - 0.1, 0.08, 2.4, lumber, {layer: 4}); B.box(W - 0.13, 0.05, top - 2.4, 0.08, Dd - 0.1, 2.4, lumber, {layer: 4});
    B.custom(0.4, Dd - 0.05, (g, P, k) => { const a = P(0.32, Dd - 0.02, 0), b2 = P(0.32, Dd - 0.02, top), c2 = P(0.52, Dd - 0.02, 0), d2 = P(0.52, Dd - 0.02, top);
      g.strokeStyle = '#8A5A2B'; g.lineWidth = 1.4 * k; line(g, a, b2); line(g, c2, d2); for(let z = 6; z < top; z += 7){ line(g, P(0.32, Dd - 0.02, z), P(0.52, Dd - 0.02, z)); } }, {layer: 6, zb: 0, top});
    if(pct >= 66){ // 🏠 roof frame (rafters) where the roofs will go + a little crane lifting a block in the team colour
      roofs.forEach(r => B.custom(r.x + r.w / 2, r.y + r.d / 2, (g, P, k) => { const z = Math.min(r.z, cut + 2), zr = z + r.rh * 0.9, x0 = r.x, x1 = r.x + r.w, y0 = r.y, y1 = r.y + r.d;
        g.strokeStyle = '#8A5A2B'; g.lineWidth = 1.6 * k; const n = Math.max(2, Math.round((r.ridge === 'y' ? r.d : r.w) / 0.45));
        for(let i = 0; i <= n; i++){ const f = i / n; if(r.ridge === 'y'){ const y = y0 + (y1 - y0) * f, m = P((x0 + x1) / 2, y, zr); line(g, P(x0, y, z), m); line(g, P(x1, y, z), m); }
          else { const x = x0 + (x1 - x0) * f, m = P(x, (y0 + y1) / 2, zr); line(g, P(x, y0, z), m); line(g, P(x, y1, z), m); } }
        line(g, r.ridge === 'y' ? P((x0 + x1) / 2, y0, zr) : P(x0, (y0 + y1) / 2, zr), r.ridge === 'y' ? P((x0 + x1) / 2, y1, zr) : P(x1, (y0 + y1) / 2, zr)); }, {layer: 3, zb: r.z, top: r.z + r.rh}));
      B.custom(W - 0.3, 0.3, (g, P, k) => { const a = P(W - 0.3, 0.3, 0), m = P(W - 0.3, 0.3, top + 26), arm = [m[0] - 30 * k, m[1] + 6 * k];
        g.strokeStyle = '#F2B731'; g.lineWidth = 2.6 * k; line(g, a, m); g.lineWidth = 2 * k; line(g, m, arm); line(g, [m[0] + 7 * k, m[1] - 2 * k], m);
        g.strokeStyle = 'rgba(42,28,20,0.6)'; g.lineWidth = 0.9 * k; for(let i = 1; i < 6; i++){ const f = i / 6; line(g, [a[0] - 2 * k, a[1] + (m[1] - a[1]) * f], [a[0] + 2 * k, a[1] + (m[1] - a[1]) * (f + 0.08)]); }
        const hk = [arm[0] + 4 * k, arm[1] + 16 * k]; g.strokeStyle = '#3A2A20'; g.lineWidth = 0.9 * k; line(g, [arm[0] + 4 * k, arm[1]], hk); g.fillStyle = col; g.fillRect(hk[0] - 4 * k, hk[1], 8 * k, 5 * k); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(hk[0] - 4 * k, hk[1], 8 * k, 1.6 * k); }, {layer: 7, zb: 0, top: top + 26});
    } else pennant(B, L, W - 0.11, 0.11, top, 14, {w: 12, hh: 7, emblem: SIDES[def.side] && SIDES[def.side].emblem, layer: 6});
    for(let i = 0; i < 2; i++) B.box(0.22, Dd - 0.5 + i * 0.01, 3 + i * 3, Math.min(0.9, W * 0.38), 0.18, 3, i % 2 ? lumber : wood, {layer: 3});
  };
  return def;
}
/* ---------- registering a side's building (same slot = same footprint + door for every side) ---------- */
function building(side, slot, o, build){ const S = SLOTS[slot], sd = SIDES[side];
  const def = add(side, side + '_' + slot, Object.assign({look: sd.look, side, slot, kind: 'building', foot: S.foot.slice(), door: S.door ? S.door.slice() : null, h: 80, variants: 1,
    tags: ['ar', 'ar-' + slot, 'ar-' + side]}, S.states ? {states: S.states.slice(), state: '1'} : {}, o));
  if(def.tags.indexOf('big') < 0 && def.h > 110) def.tags.push('big');
  def.build = (B, v, L) => { if(L.kerb !== false) kerb(B, L, def.foot[0], def.foot[1]); build(B, v, L); }; return site(def); }
function addSide(side, o){ SIDES[side] = Object.assign({key: side}, o); addSet(side, {name: o.name, icon: o.icon, accent: o.accent}); return SIDES[side]; }
/* ---------- 🪙 coin rock + 🧱 brick tree (1 × 1, states full · half · empty, recoloured by look.res) ---------- */
const RES0 = {coin: '#FFC93C', coinDk: '#C98A1A', rock: '#9C9AA8', brick: '#D2734A', brickDk: '#9A4A2A', leaf: '#5DBB46', bark: '#8A5A34'};
const resOf = L => Object.assign({}, RES0, L && L.res);
function nugget(g, x, y, r, R, c, lv){ g.fillStyle = R.coinDk; g.beginPath(); D.ell(g, x, y + r * 0.18, r, r * 0.86); g.fill(); g.fillStyle = lv ? R.coin : D.sh(R.coin, -0.35); g.beginPath(); D.ell(g, x, y, r, r * 0.86); g.fill();
  g.fillStyle = 'rgba(255,255,255,' + (lv ? 0.7 : 0.25) + ')'; g.beginPath(); D.ell(g, x - r * 0.32, y - r * 0.3, r * 0.3, r * 0.22); g.fill();
  g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.8; g.beginPath(); D.ell(g, x, y, r * 0.56, r * 0.46); g.stroke(); }
const coin = organic('realm', 'coinrock', {name: 'Coin rock', kind: 'thing', foot: [1, 1], h: 46, variants: 3, block: true, states: ['full', 'half', 'empty'], state: 'full', dead: 'keep',
  tags: ['ar', 'ar-res', 'resource', 'coin'], conds: {'*': (g, x, y, k, t, v, c, L) => coinPaint(g, x, y, k, t, v, L, c)}}, (g, x, y, k, t, v, L) => coinPaint(g, x, y, k, t, v, L, null));
function coinPaint(g, x, y, k, t, v, L, c){ const R = resOf(L), st = L.state || 'full', R2 = rnd(301 + v * 17), sc = st === 'full' ? 1 : st === 'half' ? 0.72 : 0.42, lv = !c, rock = c ? D.sh(R.rock, c.broken ? -0.2 : -0.08) : R.rock;
  g.save(); g.translate(x, y); g.scale(k, k);
  const lobes = st === 'empty' ? [[-6, -3, 12, 7], [7, -2, 9, 5]] : [[-9 * sc, -12 * sc, 15 * sc, 15 * sc], [9 * sc, -9 * sc, 12 * sc, 12 * sc], [0, -22 * sc, 12 * sc, 14 * sc], [-2, -4 * sc, 17 * sc, 8 * sc]];
  lobes.forEach(([lx, ly, rx, ry], i) => { g.fillStyle = D.rad(g, lx - rx * 0.4, ly - ry * 0.5, 1, rx * 1.6, [[0, D.sh(rock, 0.28)], [0.6, rock], [1, D.sh(rock, -0.3)]]); g.beginPath(); D.ell(g, lx, ly, rx, ry); g.fill(); });
  g.strokeStyle = 'rgba(42,28,20,0.28)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-14 * sc, -8 * sc); g.lineTo(-6 * sc, -14 * sc); g.lineTo(-2 * sc, -10 * sc); g.stroke();
  const spots = st === 'full' ? [[-10, -16, 4.2], [4, -26, 4.6], [10, -12, 3.8], [-3, -8, 3.4], [-12, -6, 3], [12, -3, 2.8], [2, -17, 3]] : st === 'half' ? [[-6, -12, 3.6], [5, -16, 3.2], [8, -5, 2.6]] : [];
  spots.forEach(([sx, sy, r], i) => nugget(g, sx * (st === 'half' ? 0.95 : 1) + (R2() - 0.5) * 1.5, sy * (st === 'half' ? 0.9 : 1), r, R, c, lv));
  if(st !== 'empty') [[-15, 1], [14, 2], [-4, 4]].slice(0, st === 'full' ? 3 : 1).forEach(([sx, sy]) => nugget(g, sx, sy, 2.4, R, c, lv));
  else { g.fillStyle = D.sh(rock, -0.1); [[-14, 3], [13, 4], [3, 6]].forEach(([sx, sy]) => { g.beginPath(); D.ell(g, sx, sy, 2.6, 1.6); g.fill(); }); }
  if(lv && st === 'full'){ g.fillStyle = 'rgba(255,255,255,0.95)'; D.star(g, 7, -30, 3.4, 1.2, 4); g.fill(); D.star(g, -14, -20, 2.4, 0.9, 4); g.fill(); }
  g.restore(); }
const tree = organic('realm', 'bricktree', {name: 'Brick tree', kind: 'tree', foot: [1, 1], h: 82, variants: 3, block: true, states: ['full', 'half', 'empty'], state: 'full', dead: 'keep',
  tags: ['ar', 'ar-res', 'resource', 'brick'], conds: {'*': (g, x, y, k, t, v, c, L) => treePaint(g, x, y, k, t, v, L, c)}}, (g, x, y, k, t, v, L) => treePaint(g, x, y, k, t, v, L, null));
function brick(g, x, y, w, h, R, c){ g.fillStyle = c ? D.sh(R.brick, -0.3) : R.brick; g.beginPath(); D.rr(g, x - w / 2, y - h / 2, w, h, 1.2); g.fill(); g.fillStyle = R.brickDk; g.fillRect(x - w / 2, y + h * 0.15, w, h * 0.35);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x - w / 2 + 1, y - h / 2 + 0.8, w - 2, 1.2); g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x, y - h / 2); g.lineTo(x, y + h / 2); g.stroke(); }
function treePaint(g, x, y, k, t, v, L, c){ const R = resOf(L), st = L.state || 'full', R2 = rnd(77 + v * 31), sway = c && c.still ? 0 : Math.sin(ph(t, 3)) * 1.2 + Math.cos(ph(t, 3)) * 0.4;
  const leaf = c ? (c.broken ? '#8A7A5A' : D.sh(R.leaf, -0.2)) : R.leaf; g.save(); g.translate(x, y); g.scale(k * (v % 3 === 1 ? -1 : 1) * (v % 3 === 2 ? 0.92 : 1), k * (v % 3 === 2 ? 0.92 : 1));   // 3 variants: as is · mirrored · a little smaller
  if(st === 'empty'){ g.fillStyle = R.bark; g.beginPath(); g.moveTo(-9, 0); g.lineTo(-8, -12); g.lineTo(-4, -14); g.lineTo(-1, -11); g.lineTo(3, -15); g.lineTo(8, -12); g.lineTo(9, 0); g.closePath(); g.fill();
    g.fillStyle = '#E8C08A'; g.beginPath(); D.ell(g, 0, -12.5, 8, 3); g.fill(); g.strokeStyle = 'rgba(138,90,43,0.6)'; g.lineWidth = 0.9; g.beginPath(); D.ell(g, 0, -12.5, 4.6, 1.7); g.stroke(); g.beginPath(); D.ell(g, 0, -12.5, 1.8, 0.7); g.stroke();
    [[-12, 2], [11, 3]].forEach(([sx, sy]) => brick(g, sx, sy - 2, 7, 4, R, c)); g.restore(); return; }
  const H = st === 'full' ? 1 : 0.86; g.fillStyle = R.bark; g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-4, -26 * H, -3, -40 * H); g.lineTo(3, -40 * H); g.quadraticCurveTo(4, -26 * H, 6, 0); g.lineTo(10, 2); g.lineTo(-10, 2); g.closePath(); g.fill();
  g.fillStyle = 'rgba(42,28,20,0.18)'; g.fillRect(-1, -34 * H, 1.6, 30 * H);
  const blobs = st === 'full' ? [[-14, -50, 15], [13, -52, 14], [0, -64, 17], [-6, -44, 12], [8, -42, 12]] : [[-10, -46, 11], [9, -48, 10], [0, -56, 12]];
  blobs.forEach(([bx, by, r], i) => { g.fillStyle = D.rad(g, bx - r * 0.4 + sway, by - r * 0.5, 1, r * 1.5, [[0, D.sh(leaf, 0.3)], [0.6, leaf], [1, D.sh(leaf, -0.28)]]); g.beginPath(); g.arc(bx + sway * (i % 2 ? 1 : 0.6), by, r, 0, TAU); g.fill(); });
  const fruit = st === 'full' ? [[-15, -46], [-4, -58], [10, -60], [15, -46], [2, -46], [-10, -62], [7, -36]] : [[-8, -44], [8, -52]];
  fruit.forEach(([fx, fy]) => { g.strokeStyle = 'rgba(60,40,20,0.6)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(fx + sway, fy - 4); g.lineTo(fx + sway, fy - 1); g.stroke(); brick(g, fx + sway, fy + 1.5, 10, 5.6, R, c); });
  if(st === 'half') [[-11, 1], [12, 2]].forEach(([sx, sy]) => brick(g, sx, sy - 2, 7, 4, R, c));
  g.restore(); }
/* ---------- 🟩 territory FLOORS: an IsoKit-style tile painter per side ----------
   floor(g, q, s, i, j, r) paints ONE tile top, q(u, v) → screen point of (u, v) ∈ 0..1 on that tile (u along +x, v along +y), s = zoom.
   ar-1 pictures paint them in groundFx; the build round hands them to IsoKit as tile types (🏰 IsoKit lane: Iso.addTile with a painter). */
const FLOORS = {};
function hash(i, j, s){ const x = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453; return x - Math.floor(x); }
function tileBase(g, q, s, a, b, r){ const pts = (e) => [q(e, e), q(1 - e, e), q(1 - e, 1 - e), q(e, 1 - e)];
  polyP(g, pts(0)); g.fillStyle = D.sh(r < 0.5 ? a : b, -0.1); g.fill(); polyP(g, pts(0.04)); g.fillStyle = r < 0.5 ? a : b; g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.26)'; g.lineWidth = Math.max(1, 1.1 * s); g.beginPath(); g.moveTo(...q(0.04, 0.96)); g.lineTo(...q(0.04, 0.04)); g.lineTo(...q(0.96, 0.04)); g.stroke(); }
function addFloor(side, o){ FLOORS[side] = o; return o; }
/* ================= 🧱 AR-4 (pictures 2026-11-18, 🌳 IsoProps chat) — WALLS + GATE · ⭐ SHRINE / FLAG · 💎 GEM ORE (AvataRealm R2) =================
   🧱 a wall = ONE 1 × 1 prop per cell, its STATE = the neighbours it joins: bits E 1 (+x) · S 2 (+y) · W 4 (−x) · N 8 (−y) → '0' … '15'
      (straight · corner · T · cross · end · lone post — the model is REBUILT per state, never a stretched picture). Walls never turn (the mask is world-based).
      Props.AR.wall(M, side, i, j, o) places one and re-joins its 4 neighbours · AR.wallLine(M, side, cells, o) · AR.wallOff(M, it) · AR.rejoin(M, i, j) · AR.wallMask(M, i, j)
   🚪 a gate = 1 × 1, joins the wall along its turn (turn 0 / 2 = wall along x, walkers pass along y · turn 1 / 3 = the other way), states closed · open
      (open = walkable through IsoKit — WHO may pass is the game's rule: open it for your own team). AR.gate(M, side, i, j, o) picks the turn from the walls round it.
   🏗️ walls + gates have the same 0 · 33 · 66 · 100 % steps ({team, build}) · 🏚️ ruined = broken · each SIDE has its own wall + gate (realm = plain stone)
   ⭐ realm_shrine (2 × 2, walk-on): owner {team} (none = neutral) + capture {by, cap 0–100}: ring + flag rise in the capturing team's colour, the owner's flag sinks
   💎 gemore (1 × 1, states full · half · empty, 3 variants: crystal rock · geode · meteor chunk) — ONE shape, recoloured by the side's look.res.gem */
const WBIT = {E: 1, S: 2, W: 4, N: 8}, WSTATES = Array.from({length: 16}, (_, m) => String(m)), WT = 0.17, WP = 0.21;
const WALLS = {};   // side → {wall, gate, skin}
const wallKindOf = m => { const n = [1, 2, 4, 8].filter(b => m & b).length; return n === 0 ? 'solo' : n === 1 ? 'end' : n === 2 ? (m === 5 || m === 10 ? 'line' : 'corner') : n === 3 ? 't' : 'cross'; };
// the straight runs of a wall cell (tiles): [x, y, w, d, axis] — a straight line is ONE run (no post), anything else = a centre post + half runs
function wallRuns(m){ const t = WT, P = WP, runs = [];
  if(m === 5) return {post: false, runs: [[0, 0.5 - t, 1, 2 * t, 'x']]};
  if(m === 10) return {post: false, runs: [[0.5 - t, 0, 2 * t, 1, 'y']]};
  if(m & 1) runs.push([0.5 + P, 0.5 - t, 0.5 - P, 2 * t, 'x']); if(m & 4) runs.push([0, 0.5 - t, 0.5 - P, 2 * t, 'x']);
  if(m & 2) runs.push([0.5 - t, 0.5 + P, 2 * t, 0.5 - P, 'y']); if(m & 8) runs.push([0.5 - t, 0, 2 * t, 0.5 - P, 'y']);
  return {post: true, runs}; }
const longFaces = ax => ax === 'x' ? ['front', 'back'] : ['right', 'left'];
// 🪨 cut stone blocks on a face (decal paint), h = face height px
const blocks = (h, col, seed, rowH) => (g, Q, k) => { const R = rnd(seed || 11), rh = rowH || 7; for(let z = 0, row = 0; z < h - 0.5; z += rh, row++){ let u = row % 2 ? -0.1 : 0; const zh = Math.min(rh, h - z);
  while(u < 1){ const w = 0.22 + R() * 0.16, u0 = Math.max(0, u + 0.01), u1 = Math.min(1, u + w - 0.01); if(u1 > u0 + 0.02){ polyP(g, [Q(u0, z + 0.7), Q(u1, z + 0.7), Q(u1, z + zh - 0.7), Q(u0, z + zh - 0.7)]);
      g.fillStyle = D.sh(col, (R() - 0.5) * 0.14); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.22)'; g.lineWidth = 0.8 * k; g.stroke(); } u += w; } } };
// 🏗️ a wall's build steps (lighter than a building's site: no scaffolding — a long wall in scaffolding is too busy): 0 = stakes + team tape · 33 / 66 = the same model cut low
function wallSite(B, L, runs, post){ const pct = L.build == null ? 100 : Math.max(0, Math.min(100, +L.build)); if(pct >= 100) return;
  const all = B.parts.splice(0), col = teamOf(L), H = Math.max(20, ...all.filter(p => !p.fx).map(topOf)), cut = pct <= 0 ? 0 : Math.round(H * (pct >= 66 ? 0.62 : 0.3));
  if(pct > 0) all.forEach(p => { if(p.fx) return; const z0 = baseOf(p), z1 = topOf(p); if(p.t === 'flat'){ B.parts.push(p); return; } if(z0 >= cut - 0.5) return; if(z1 <= cut + 0.5){ B.parts.push(p); return; }
    if(p.t === 'box'){ const nh = cut - p.z; p.h = nh; p.decals = p.decals.filter(dc => dc.z0 < nh - 0.5).map(dc => dc.z0 + dc.h > nh ? clipDecal(dc, nh - dc.z0) : dc); B.parts.push(p); return; }
    if(p.t === 'drum'){ p.h = cut - p.z; B.parts.push(p); return; } if(p.t === 'cone' || p.t === 'roof') return; clipDraw(p, cut); B.parts.push(p); });
  const segs = runs.map(r => r[4] === 'x' ? [[r[0], 0.5], [r[0] + r[2], 0.5]] : [[0.5, r[1]], [0.5, r[1] + r[3]]]); if(post || !segs.length) segs.push([[0.5, 0.5], [0.5, 0.5]]);
  B.custom(0.5, 0.5, (g, P, k) => { g.lineCap = 'round';   // 📐 stakes + team tape along the runs (every step), a little pile of blocks at 0 %
    segs.forEach(([a, b2]) => { const z = (pct <= 0 ? 7 : cut + 4), A2 = P(a[0], a[1], z), B2 = P(b2[0], b2[1], z); g.strokeStyle = col; g.lineWidth = 2.2 * k; g.setLineDash([4 * k, 2.4 * k]); line(g, A2, B2); g.setLineDash([]);
      [a, b2].forEach(q => { const s0 = P(q[0], q[1], pct <= 0 ? 0 : cut), s1 = P(q[0], q[1], z + 3); g.strokeStyle = '#8A5A2B'; g.lineWidth = 1.8 * k; line(g, s0, s1); }); }); }, {layer: 6, zb: 0, top: (pct <= 0 ? 10 : cut + 7)});
  if(pct <= 0) for(let i = 0; i < 2; i++) for(let j = 0; j < 2 - i; j++) B.box(0.26 + j * 0.22 + i * 0.11, 0.3, i * 5, 0.2, 0.18, 5, '#BDB4A2', {layer: 1}); }
// a decal cut shorter keeps its painter (made for the full height) INSIDE the new height (rivets / seams / stones never float above a cut wall)
function clipDecal(dc, h){ const f = dc.paint; return Object.assign({}, dc, {h, paint: f ? (g, Q, k) => { g.save(); polyP(g, [Q(0, 0), Q(1, 0), Q(1, h), Q(0, h)]); g.clip(); f(g, Q, k); g.restore(); } : f}); }
// a wall prop for a side: skin = {name, h, seg(B, L, run, c, v), post(B, L, kind, c, v)}
function wallProp(set, side, skin){ const key = side + '_wall', def = add(set, key, {name: skin.name || 'Wall', look: skin.look || null, side, slot: 'wall', kind: 'fence', foot: [1, 1], door: null, h: skin.h || 48,
    variants: 1, block: true, states: WSTATES.slice(), state: '0', wall: true, tags: ['ar', 'ar-wall', 'ar-' + side, 'wall']});
  def.build = (B, v, L) => { const m = (+L.state | 0) & 15, R = wallRuns(m), c = L.cond; R.runs.forEach(r => skin.seg(B, L, r, c, v, m)); if(R.post) skin.post(B, L, wallKindOf(m), c, v, m); wallSite(B, L, R.runs, R.post); };
  WALLS[side] = Object.assign(WALLS[side] || {}, {wall: key, skin}); return def; }
// a gate prop for a side: model spans x 0..1 (turn 0), walkers pass along y; skin.gate(B, L, open, c, v)
function gateProp(set, side, skin){ const key = side + '_gate', def = add(set, key, {name: skin.gateName || 'Gate', look: skin.look || null, side, slot: 'gate', kind: 'gate', foot: [1, 1], door: null, h: skin.gateH || 96,
    variants: 1, block: true, states: ['closed', 'open'], state: 'closed', walkStates: ['open'], wall: true, gate: true, tags: ['ar', 'ar-gate', 'ar-' + side, 'gate', 'wall'], live: skin.live || null});
  def.build = (B, v, L) => skin.gate(B, L, L.state === 'open', L.cond, v);
  WALLS[side] = Object.assign(WALLS[side] || {}, {gate: key, skin}); return site(def); }
/* ---------- 🧱 the plain STONE wall + gate (realm = the neutral "Avatar Town" look; a side without its own uses these) ---------- */
const STONE = '#BDB6A8', STONE2 = '#D8D1C2', STONED = '#A39C8E', OAK = '#9A6A3E', IRONW = '#5A5560';
const stoneSkin = {name: 'Stone wall', gateName: 'Stone gate', h: 48, gateH: 100,
  seg(B, L, r, c, v){ const [x, y, w, d, ax] = r, H = 27, b = B.box(x, y, 0, w, d, H, STONE); ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, H, STONE, {paint: blocks(H, STONE, 13 + Math.round((x + y) * 10))}));
    trim(B, L, b, 19, 3, longFaces(ax)); const len = ax === 'x' ? w : d, n = Math.max(1, Math.round(len / 0.3)), mw = Math.min(0.15, len / n * 0.55);
    for(let i = 0; i < n; i++){ if(c && c.broken && i % 2) continue; const p = (ax === 'x' ? x : y) + (i + 0.5) * len / n - mw / 2; B.box(ax === 'x' ? p : x, ax === 'x' ? y : p, H, ax === 'x' ? mw : w, ax === 'x' ? d : mw, 7, STONE2); } },
  post(B, L, kind, c){ const P = WP, H = 34, b = B.box(0.5 - P, 0.5 - P, 0, 2 * P, 2 * P, H, STONED); ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, H, STONED, {paint: blocks(H, STONED, 29, 6)}));
    trim(B, L, b, 25, 3); B.box(0.5 - P - 0.04, 0.5 - P - 0.04, H, 2 * P + 0.08, 2 * P + 0.08, 4, STONE2);
    if(kind === 'end' || kind === 'solo'){ B.drum(0.5, 0.5, H + 4, 0.1, 2, STONED); B.custom(0.5, 0.5, (g, P2, k) => { const q = P2(0.5, 0.5, H + 6), col = c && c.broken ? D.sh(teamOf(L), -0.45) : teamOf(L);
      g.fillStyle = D.rad(g, q[0] - 1.6 * k, q[1] - 2.6 * k, 0.5, 5.4 * k, [[0, D.sh(col, 0.45)], [0.6, col], [1, D.sh(col, -0.3)]]); g.beginPath(); g.arc(q[0], q[1] - 3.4 * k, 3.8 * k, 0, TAU); g.fill(); }, {layer: 3, zb: H + 6, top: H + 13.5}); } },
  gate(B, L, open, c, v){ const t = 0.22, H = 58, oz = 44;   // 2 towers + a lintel over a 44 px opening · oak doors with iron straps
    [[0, 0.26], [0.74, 0.26]].forEach(([x0, w]) => { const b = B.box(x0, 0.5 - t, 0, w, 2 * t, H, STONED); ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, H, STONED, {paint: blocks(H, STONED, 41 + x0 * 10, 7)}));
      trim(B, L, b, 48, 3); for(let i = 0; i < 2; i++) if(!(c && c.broken && i)) B.box(x0 + 0.02 + i * (w - 0.12), 0.5 - t + 0.02, H, 0.1, 2 * t - 0.04, 7, STONE2); });
    const li = B.box(0.26, 0.5 - 0.15, oz, 0.48, 0.3, H - oz - 2, STONE); ['front', 'back'].forEach(s => B.decal(li, s, ...F(li, s), 0, H - oz - 2, STONE, {paint: blocks(H - oz - 2, STONE, 57, 6)}));
    trim(B, L, li, 4, 3, ['front', 'back']);
    gateDoors(B, open, c, oz - 1, OAK, IRONW);
    if(!(c && c.broken)) [[0.13], [0.87]].forEach(([x]) => pennant(B, L, x, 0.5, H + 7, 22, {w: 12, hh: 8})); } };
// two door leaves between the posts: closed = across the opening · open = swung back along the walls (behind) — plank + strap paint
function gateDoors(B, open, c, h, wood, strap, o){ o = o || {}; const x0 = 0.26, x1 = 0.74, th = 0.07, plank = (g, Q, k) => { g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.9 * k; for(let u = 0.25; u < 1; u += 0.25) line(g, Q(u, 1), Q(u, h - 1));
    g.strokeStyle = strap; g.lineWidth = 2.2 * k; [h * 0.22, h * 0.7].forEach(z => line(g, Q(0.04, z), Q(0.96, z))); g.fillStyle = strap; [0.15, 0.85].forEach(u => [h * 0.22, h * 0.7].forEach(z => { const q = Q(u, z); g.beginPath(); g.arc(q[0], q[1], 1.1 * k, 0, TAU); g.fill(); })); };
  if(c && c.broken){ const b = B.box(x0 + 0.02, 0.5 - th / 2, 0, 0.2, th, h * 0.55, D.sh(wood, -0.25)); ['front', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, h * 0.55, wood, {paint: plank})); return; }
  if(!open){ [[x0, 0.24], [0.5, 0.24]].forEach(([x, w]) => { const b = B.box(x, 0.5 - th / 2, 0, w, th, h, wood); ['front', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, h, wood, {paint: o.paint || plank})); }); return; }
  [[x0, 1], [x1 - th, -1]].forEach(([x]) => { const b = B.box(x, 0.5 - th / 2 - 0.26, 0, th, 0.26, h, D.sh(wood, -0.08)); ['right', 'left'].forEach(s => B.decal(b, s, ...F(b, s), 0, h, wood, {paint: o.paint || plank})); }); }
wallProp('realm', 'realm', stoneSkin); gateProp('realm', 'realm', stoneSkin);
/* ---------- 🏯 TALL WALL + gatehouse (Aowu 2026-11-18 10:56 "add tall wall too") — the side's OWN wall standing on a high rampart (a walkway ledge on top)
   + a TOWER at every corner · T · cross · end · lone post (v 1 = a tower on a straight piece too: wallLine {towers: n} puts one every n cells).
   Same 16 joins as the low wall and it joins low walls + gates of any side. Keys <side>_tallwall / <side>_tallgate. kind 'building' (towers ≈ 100 px).
   tall = {name, gateName, base (rampart px), h, gateH, rampart(B, L, run, c, hb), tower(B, L, c, cx, cy, hb, kind, hw), gatehouse(B, L, open, c, hb)} ---------- */
const TB = 30;
// every part a skin painter adds through this B sits dz higher (boxes · drums · cones · roofs · bills; customs get a lifted P) — the low wall reused on top of a rampart
function lifted(B, dz){ const L2 = Object.create(B);
  ['box', 'drum', 'cone', 'roof', 'bill'].forEach(f => { L2[f] = function(){ const a = Array.prototype.slice.call(arguments); a[2] = (a[2] || 0) + dz; return B[f].apply(B, a); }; });
  L2.custom = (x, y, draw, o) => { o = Object.assign({}, o); if(o.zb != null) o.zb += dz; if(o.top != null) o.top += dz;
    return B.custom(x, y, (g, P, k, t, T2) => draw(g, (a, b, z) => P(a, b, (z || 0) + dz), k, t, T2), o); };
  return L2; }
function tallWallProp(set, side, skin, tall){ const key = side + '_tallwall', def = add(set, key, {name: tall.name || 'Tall wall', look: skin.look || null, side, slot: 'tallwall', kind: 'building', foot: [1, 1], door: null,
    h: tall.h || 110, variants: 2, block: true, states: WSTATES.slice(), state: '5', wall: true, tall: true, noRubble: true, stand: [0.5, 0.5, tall.base || TB], tags: ['ar', 'ar-wall', 'ar-tallwall', 'ar-' + side, 'wall', 'tall']});
  def.build = (B, v, L) => { const m = (+L.state | 0) & 15, R = wallRuns(m), c = L.cond, hb = tall.base || TB, tw = R.post || (v % 2 === 1);
    R.runs.forEach(r => { tall.rampart(B, L, r, c, hb); skin.seg(lifted(B, hb), L, r, c, v, m); });
    if(tw) tall.tower(B, L, c, 0.5, 0.5, hb, R.post ? wallKindOf(m) : 'line', 0.27); wallSite(B, L, R.runs, tw); };
  WALLS[side] = Object.assign(WALLS[side] || {}, {tallwall: key, tall}); return def; }
function tallGateProp(set, side, skin, tall){ const key = side + '_tallgate', def = add(set, key, {name: tall.gateName || 'Gatehouse', look: skin.look || null, side, slot: 'tallgate', kind: 'gate', foot: [1, 1], door: null,
    h: tall.gateH || 120, variants: 1, block: true, states: ['closed', 'open'], state: 'closed', walkStates: ['open'], wall: true, gate: true, tall: true, tags: ['ar', 'ar-gate', 'ar-tallgate', 'ar-' + side, 'gate', 'wall', 'tall']});
  def.build = (B, v, L) => { const c = L.cond, hb = tall.base || TB; tall.tower(B, L, c, 0.13, 0.5, hb, 'gate', 0.13); tall.tower(B, L, c, 0.87, 0.5, hb, 'gate', 0.13); tall.gatehouse(B, L, L.state === 'open', c, hb); };
  WALLS[side] = Object.assign(WALLS[side] || {}, {tallgate: key}); return site(def); }
// 🏰 plain stone: a battered rampart of big blocks · square towers with arrow slits, merlons + a team pennant · gatehouse = a stone bridge with crenels + a team banner
const stoneTall = {name: 'Tall stone wall', gateName: 'Stone gatehouse', base: TB, h: 112, gateH: 116,
  rampart(B, L, r, c, hb){ const [x, y, w, d, ax] = r, e = 0.07, b = ax === 'x' ? B.box(x, y - e, 0, w, d + 2 * e, hb, STONED) : B.box(x - e, y, 0, w + 2 * e, d, hb, STONED);
    ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, hb, STONED, {paint: blocks(hb, STONED, 71 + Math.round((x + y) * 10), 10)})); },
  tower(B, L, c, cx, cy, hb, kind, hw){ const H = hb + 40, br = c && c.broken, b = B.box(cx - hw, cy - hw, 0, 2 * hw, 2 * hw, br ? H - 12 : H, STONED), HH = br ? H - 12 : H;
    ['front', 'right', 'left', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, HH, STONED, {paint: blocks(HH, STONED, 83 + Math.round(cx * 10), 8)}));
    ['front', 'right'].forEach(s => B.decal(b, s, (s === 'front' ? cx : cy) - 0.025, 0.05, hb + 10, 12, '#2A2430', {k: 'win'}));
    trim(B, L, b, HH - 12, 3); if(br) return; const m = Math.min(0.11, hw * 0.55);
    B.box(cx - hw - 0.03, cy - hw - 0.03, H, 2 * hw + 0.06, 2 * hw + 0.06, 4, STONE2);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => B.box(cx + sx * (hw + 0.03) - (sx > 0 ? m : 0), cy + sy * (hw + 0.03) - (sy > 0 ? m : 0), H + 4, m, m, 8, STONE2));
    pennant(B, L, cx, cy, H + 4, kind === 'gate' ? 22 : 28, {w: kind === 'gate' ? 11 : 13, hh: kind === 'gate' ? 7 : 8}); },
  gatehouse(B, L, open, c, hb){ const br = c && c.broken, z0 = 46, H = hb + 36, t = 0.2;
    gateDoors(B, open, c, z0 - 1, OAK, IRONW);
    const b = B.box(0.26, 0.5 - t, z0, 0.48, 2 * t, br ? 10 : H - z0, STONE); ['front', 'back'].forEach(s => B.decal(b, s, ...F(b, s), 0, br ? 10 : H - z0, STONE, {paint: blocks(br ? 10 : H - z0, STONE, 91, 7)}));
    if(br) return; trim(B, L, b, H - z0 - 9, 3, ['front', 'back']); banner(B, L, b, 'front', 0.4, 0.2, 2, 12, null);
    for(let i = 0; i < 3; i++) B.box(0.28 + i * 0.16, 0.5 - t, H, 0.1, 2 * t, 7, STONE2); } };
tallWallProp('realm', 'realm', stoneSkin, stoneTall); tallGateProp('realm', 'realm', stoneSkin, stoneTall);
/* ---------- 🧱 helpers: place a wall / gate and RE-JOIN the neighbours (any side's walls join each other) ---------- */
const NB4 = [['E', 1, 0, 'W'], ['S', 0, 1, 'N'], ['W', -1, 0, 'E'], ['N', 0, -1, 'S']];
const propAt = (M, i, j) => M && M._props && M.inside(i, j) ? M._props[j * M.w + i] : null;
const isWall = it => !!(it && DEFS[it.prop] && DEFS[it.prop].wall);
function joins(it, dir){ if(!DEFS[it.prop].gate) return true; const ax = (it.turn | 0) % 2 ? 'y' : 'x'; return ax === 'x' ? (dir === 'E' || dir === 'W') : (dir === 'N' || dir === 'S'); }
function wallMask(M, i, j){ let m = 0; NB4.forEach(([dir, di, dj, back]) => { const it = propAt(M, i + di, j + dj); if(isWall(it) && joins(it, back)) m |= WBIT[dir]; }); return m; }
function rejoin(M, i, j){ [[0, 0]].concat(NB4.map(n => [n[1], n[2]])).forEach(([di, dj]) => { const it = propAt(M, i + di, j + dj);
  if(!isWall(it) || DEFS[it.prop].gate) return; const s = String(wallMask(M, i + di, j + dj)); if(it.state !== s) Props.setState(it, s, M); }); }
const wallKeyOf = (side, tall) => tall ? ((WALLS[side] && WALLS[side].tallwall) || 'realm_tallwall') : (WALLS[side] && WALLS[side].wall) || 'realm_wall',
  gateKeyOf = (side, tall) => tall ? ((WALLS[side] && WALLS[side].tallgate) || 'realm_tallgate') : (WALLS[side] && WALLS[side].gate) || 'realm_gate';
const wo = o => { o = Object.assign({}, o); const tall = !!o.tall, tw = o.towers | 0; delete o.tall; delete o.towers; return [o, tall, tw]; };   // 🏯 {tall: true} = the side's tall wall / gatehouse
function wallAt(M, side, i, j, o){ const [o2, tall] = wo(o), it = Props.place(M, wallKeyOf(side, tall), i, j, Object.assign(o2, {turn: 0, state: String(wallMask(M, i, j))})); if(it) rejoin(M, i, j); return it; }
function wallLine(M, side, cells, o){ const out = [], [o2, tall, tw] = wo(o);   // 🏯 {tall: true, towers: n} = a tower on every n-th straight piece
  cells.forEach(([i, j], n) => { const it = Props.place(M, wallKeyOf(side, tall), i, j, Object.assign({}, o2, {turn: 0, state: '0'}, tall && tw > 0 && n % tw === tw - 1 ? {v: 1} : {})); if(it) out.push(it); });
  cells.forEach(([i, j]) => rejoin(M, i, j)); return out; }
function gateAt(M, side, i, j, o){ const [o3, tall] = wo(o); o = Object.assign({state: 'closed'}, o3); if(o.turn == null){ const ns = isWall(propAt(M, i, j - 1)) || isWall(propAt(M, i, j + 1)), ew = isWall(propAt(M, i - 1, j)) || isWall(propAt(M, i + 1, j)); o.turn = ns && !ew ? 1 : 0; }
  const it = Props.place(M, gateKeyOf(side, tall), i, j, o); if(it) rejoin(M, i, j); return it; }
function wallOff(M, it){ const i = it.x, j = it.y; Props.remove(M, it); rejoin(M, i, j); }
/* ---------- ⭐ SHRINE / FLAG (2 × 2, walk-on): stone ring + standing stones + a floating star on a pedestal + a tall flagpole ---------- */
function starPath(g, x, y, r, ri){ g.beginPath(); for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? ri : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
const starEm = (g, x, y, r, col) => { g.fillStyle = col; starPath(g, x, y, r * 1.05, r * 0.45); g.fill(); };
const NEUTRAL = '#F4EFE2';
(function(){ const def = add('realm', 'realm_shrine', {name: 'Star shrine', kind: 'building', foot: [2, 2], door: null, h: 108, variants: 1, block: false, side: 'realm', slot: 'shrine',
    tags: ['ar', 'ar-shrine', 'shrine', 'flag', 'capture'], live: {period: 1.8, frames: 6}});
  def.build = (B, v, L) => { const c = L.cond, own = L.team || null, by = L.by || null, cap = by ? Math.max(0, Math.min(100, +L.cap || 0)) : 0, lv = lightOf(c);
    B.drum(1, 1, 0, 0.92, 5, '#CFC6B4', {rings: 1, topFill: c ? '#B9B2A2' : '#DDD5C4'});
    B.custom(1, 1, (g, P, k) => { const ring = (r0, r1, a0, a1, fill, pat, ink) => { const n = 40, pts = [], at = (r, a) => P(1 + Math.cos(a) * r, 1 + Math.sin(a) * r, 5.2);
        for(let i = 0; i <= n; i++) pts.push(at(r1, a0 + (a1 - a0) * i / n)); for(let i = n; i >= 0; i--) pts.push(at(r0, a0 + (a1 - a0) * i / n)); polyP(g, pts); g.fillStyle = fill; g.fill();
        if(pat){ g.save(); g.clip(); const len = (a1 - a0) * (r0 + r1) / 2 * 36, hh = (r1 - r0) * 36; patPaint(g, (s, vv) => at(r0 + vv / 36, a0 + s / len * (a1 - a0)), len, hh, pat, ink, k); g.restore(); }
        g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = 0.9 * k; g.stroke(); };
      const br = c && c.broken, base = own ? teamOf({team: own}) : '#E9DFC6'; ring(0.6, 0.8, 0, TAU, br ? D.sh(base, -0.4) : base, own && !br ? patOf({team: own}) : null, own ? inkOf(base) : null);
      if(!own && !br) for(let i = 0; i < 12; i++){ const a = i / 12 * TAU, q = P(1 + Math.cos(a) * 0.7, 1 + Math.sin(a) * 0.7, 5.2); g.fillStyle = '#E2B53A'; g.beginPath(); D.ell(g, q[0], q[1], 1.6 * k, 0.9 * k); g.fill(); }
      if(by && cap > 0 && !br){ const bc = teamOf({team: by}), a0 = -Math.PI * 0.75; ring(0.58, 0.82, a0, a0 + TAU * cap / 100, bc, patOf({team: by}), inkOf(bc)); } }, {layer: 1, zb: 5, top: 6});
    [[0.45, 0.45], [1.55, 0.45], [0.45, 1.55], [1.55, 1.55]].forEach(([x, y], i) => { if(c && c.broken && i === 1) return; B.box(x - 0.08, y - 0.08, 5, 0.16, 0.16, 15, '#A8A090'); B.drum(x, y, 20, 0.09, 3, c ? '#9A8A60' : '#E2B53A'); });
    B.drum(1, 1, 5, 0.25, 22, '#B8B0A0', {rings: 3}); B.drum(1, 1, 27, 0.33, 4, c ? '#A89A70' : '#E2B53A');
    const glowC = own ? teamOf({team: own}) : '#FFE27A';
    if(lv) halo(B, 1, 1, 50, 36, glowC, 0.42 * lv, {pulse: t => 0.92 + 0.06 * Math.sin(ph(t, 1.8)) + 0.04 * Math.cos(ph(t, 1.8))});
    B.custom(1, 1, (g, P, k, t) => { const bob = c && c.still ? 0 : Math.sin(ph(t, 1.8)) * 1.6 + Math.cos(ph(t, 1.8)) * 0.6, q = P(1, 1, c && c.broken ? 31 : 50 + bob), r = 15 * k;
      if(c && c.broken){ g.save(); g.translate(q[0], q[1]); g.rotate(0.9); starPath(g, 0, 0, r * 0.9, r * 0.4); g.fillStyle = '#8A8070'; g.fill(); g.strokeStyle = '#2A1C14'; g.lineWidth = 1.3 * k; g.stroke(); g.restore(); return; }
      starPath(g, q[0], q[1], r, r * 0.46); g.fillStyle = D.rad(g, q[0] - r * 0.3, q[1] - r * 0.4, 0.5, r * 1.3, [[0, '#FFF6C8'], [0.5, c ? '#D9B048' : '#FFC93C'], [1, '#C98A1A']]); g.fill();
      g.strokeStyle = '#2A1C14'; g.lineWidth = 1.4 * k; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.7)'; starPath(g, q[0] - r * 0.12, q[1] - r * 0.14, r * 0.34, r * 0.16); g.fill(); }, {fx: true, layer: 10});
    // 🚩 the flagpole (back right corner): neutral = a cream flag with a gold star · owned = the owner's team flag · capturing = the capturer's flag rises, the owner's sinks
    const px = 1.74, py = 0.26, top = 92; B.custom(px, py, (g, P, k) => { const a = P(px, py, 0), b2 = P(px, py, top + 2); g.strokeStyle = '#4A3828'; g.lineWidth = 2.4 * k; g.lineCap = 'round'; line(g, a, b2);
      g.fillStyle = '#E2B53A'; g.beginPath(); g.arc(b2[0], b2[1] - 1.5 * k, 2.6 * k, 0, TAU); g.fill(); }, {layer: 4, zb: 0, top: top + 4});
    B.box(px - 0.1, py - 0.1, 0, 0.2, 0.2, 6, '#A8A090');
    if(c && c.broken) return;
    const flag = (team, z) => pennant(B, Object.assign({}, L, {team: team || NEUTRAL}), px, py, 0, z, {w: 22, hh: 14, emblem: team ? null : starEm, pole: '#4A3828', layer: 5});
    if(by && cap >= 100) flag(by, top);   // 🚩 captured
    else if(by && cap > 0){ if(own && own !== by) flag(own, top - 38 * cap / 100); flag(by, 18 + 30 * cap / 100); }   // owner sinks 92 → 54, capturer climbs 18 → 48: they never meet
    else flag(own, top); };
})();
/* ---------- 💎 GEM ORE (1 × 1, states full · half · empty): crystal rock · geode · meteor chunk — recoloured by look.res.gem ---------- */
Object.assign(RES0, {gem: '#B65CFF', gemDk: '#6A2BB8', gemHi: '#F2DCFF', ore: '#6E6880'});
function shard(g, x, y, w, h, lean, R, c, lv){ const col = c ? (c.broken ? '#8A8296' : D.sh(R.gem, -0.25)) : R.gem, dk = c ? D.sh(col, -0.3) : R.gemDk, tip = [x + lean * h, y - h], hw = w / 2;
  g.fillStyle = dk; g.beginPath(); g.moveTo(x - hw, y); g.lineTo(x - hw + lean * h * 0.8, y - h * 0.78); g.lineTo(tip[0], tip[1]); g.lineTo(x + lean * h * 0.8, y - h * 0.8); g.lineTo(x, y + w * 0.12); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(x, y + w * 0.12); g.lineTo(x + lean * h * 0.8, y - h * 0.8); g.lineTo(tip[0], tip[1]); g.lineTo(x + hw + lean * h * 0.8, y - h * 0.76); g.lineTo(x + hw, y); g.closePath(); g.fill();
  if(lv){ g.fillStyle = R.gemHi; g.globalAlpha = 0.75; g.beginPath(); g.moveTo(x + hw * 0.25, y - h * 0.15); g.lineTo(x + hw * 0.25 + lean * h * 0.7, y - h * 0.72); g.lineTo(x + hw * 0.55 + lean * h * 0.7, y - h * 0.7); g.lineTo(x + hw * 0.55, y - h * 0.12); g.closePath(); g.fill(); g.globalAlpha = 1; } }
function stump(g, x, y, w, R, c){ g.fillStyle = c ? '#7A7286' : R.gemDk; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - w * 0.6); g.lineTo(x, y - w * 0.9); g.lineTo(x + w / 2, y - w * 0.55); g.lineTo(x + w / 2, y); g.closePath(); g.fill();
  g.fillStyle = c ? '#9A92A6' : R.gem; g.beginPath(); g.moveTo(x - w / 2, y - w * 0.6); g.lineTo(x, y - w * 0.9); g.lineTo(x + w / 2, y - w * 0.55); g.lineTo(x, y - w * 0.3); g.closePath(); g.fill(); }
organic('realm', 'gemore', {name: 'Gem ore', kind: 'thing', foot: [1, 1], h: 48, variants: 3, block: true, states: ['full', 'half', 'empty'], state: 'full', dead: 'keep',
  tags: ['ar', 'ar-res', 'resource', 'gem'], conds: {'*': (g, x, y, k, t, v, c, L) => gemPaint(g, x, y, k, t, v, L, c)}}, (g, x, y, k, t, v, L) => gemPaint(g, x, y, k, t, v, L, null));
function gemPaint(g, x, y, k, t, v, L, c){ const R = resOf(L), st = L.state || 'full', lv = !c, kind = v % 3, br = c && c.broken;
  const rock = kind === 2 ? (c ? '#4A4450' : '#3A3440') : (c ? D.sh(R.ore, -0.1) : R.ore); g.save(); g.translate(x, y); g.scale(k, k);
  const lobes = st === 'empty' ? [[-6, -4, 13, 7], [7, -3, 10, 6]] : kind === 1 ? [[-11, -10, 12, 13], [11, -10, 12, 13], [0, -4, 18, 9]] : [[-9, -10, 14, 13], [9, -8, 12, 11], [0, -16, 12, 12], [-1, -3, 17, 8]];
  lobes.forEach(([lx, ly, rx, ry]) => { g.fillStyle = D.rad(g, lx - rx * 0.4, ly - ry * 0.5, 1, rx * 1.6, [[0, D.sh(rock, 0.28)], [0.6, rock], [1, D.sh(rock, -0.32)]]); g.beginPath(); D.ell(g, lx, ly, rx, ry); g.fill(); });
  if(kind === 2 && st !== 'empty' && lv){ g.strokeStyle = '#FF9A4A'; g.lineWidth = 1.4; g.lineCap = 'round'; [[[-14, -6], [-6, -12], [-2, -8]], [[6, -4], [12, -12], [16, -9]], [[-4, -18], [2, -22]]].forEach(pts => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); });
    g.strokeStyle = 'rgba(255,230,160,0.8)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(-14, -6); g.lineTo(-6, -12); g.stroke(); }
  if(st === 'empty'){ [[-7, -6, 6], [5, -5, 5], [12, 1, 4]].forEach(([sx, sy, w]) => stump(g, sx, sy, w, R, c)); g.fillStyle = D.sh(rock, -0.1); [[-14, 3], [13, 4], [2, 6]].forEach(([sx, sy]) => { g.beginPath(); D.ell(g, sx, sy, 2.4, 1.5); g.fill(); }); g.restore(); return; }
  if(kind === 1){ // 🥚 geode: a split rock showing a ring of small crystals inside
    g.fillStyle = D.sh(R.gemDk, -0.2); g.beginPath(); D.ell(g, 0, -12, 11, 9); g.fill(); g.fillStyle = '#F6F0FA'; g.beginPath(); D.ell(g, 0, -12, 12.5, 10.5); g.lineWidth = 2.6; g.strokeStyle = '#E8E0EE'; g.stroke();
    const n = st === 'full' ? 7 : 4; for(let i = 0; i < n; i++){ const a = Math.PI * (0.15 + 0.7 * i / Math.max(1, n - 1)), sx = -Math.cos(a) * 8, sy = -12 + Math.sin(a) * 5; shard(g, sx, sy + 3, 5.4, 9 + (i % 3) * 2, Math.cos(a) * 0.3, R, c, lv); }
    if(st === 'full'){ shard(g, -3, -6, 7, 19, -0.08, R, c, lv); shard(g, 4, -5, 6, 15, 0.14, R, c, lv); } }
  else { const S = st === 'full' ? [[-9, -9, 7, 22, -0.3], [3, -12, 9, 30, 0.06], [11, -6, 6, 17, 0.32], [-2, -2, 6, 13, -0.12], [14, 2, 4, 9, 0.4]] : [[-6, -7, 6, 15, -0.25], [6, -7, 7, 19, 0.18], [0, -1, 5, 10, 0]];
    S.forEach(([sx, sy, w, h, ln]) => shard(g, sx, sy, w, h * (br ? 0.55 : 1), ln, R, c, lv)); }
  if(lv && st === 'full'){ g.fillStyle = 'rgba(255,255,255,0.95)'; D.star(g, 9, -36, 3.2, 1.1, 4); g.fill(); D.star(g, -13, -26, 2.2, 0.8, 4); g.fill(); }
  g.restore(); }
/* ---------- 🍳🍽️ ip-4b shared painters (pictures 2026-11-18, 🌳 IsoProps chat) — striped tents + awnings · tile walls · checker bands · per-side resource shapes.
   Any side file may use them (K.AR.tent / awning / tiles / checker / quadStripes / faceOf). They add NEW helpers only: every older prop draws byte-identical. ---------- */
// fill a face given as Q(u, v) (u along, v across, 0..1) with n alternating stripes A / Bc, shaded by its screen side (L lighter · R darker · up = sunlit)
function quadStripes(g, Q, n, A, Bc, shd){ for(let i = 0; i < n; i++){ polyP(g, [Q(i / n, 0), Q((i + 1) / n, 0), Q((i + 1) / n, 1), Q(i / n, 1)]); g.fillStyle = D.sh(i % 2 ? Bc : A, shd); g.fill(); }
  g.strokeStyle = 'rgba(42,28,20,0.22)'; g.lineWidth = 0.9; polyP(g, [Q(0, 0), Q(1, 0), Q(1, 1), Q(0, 1)]); g.stroke(); }
const faceOf = (T2, nx, ny) => sideOf(T2.nrm(nx, ny));
// ⛺ a striped tent / canopy roof (ridge along x or y), any turn: only the faces that face the camera are painted (a tent is convex → they never overlap)
function tent(B, x, y, z, w, d, h, A, Bc, n, o){ o = o || {}; const ry = o.ridge === 'y', hem = o.hem !== false;
  B.custom(x + w / 2, y + d / 2, (g, P, k, t, T2) => { const c = o.cond, br = c && c.broken, cA = br ? D.sh(A, -0.35) : A, cB = br ? D.sh(Bc, -0.3) : Bc, ym = y + d / 2, xm = x + w / 2, sag = br ? 0.7 : 1;
    const faces = ry ? [
      [[1, 0], (u, v) => P(x + w - (w / 2) * v, y + d * u, z + h * v * sag)], [[-1, 0], (u, v) => P(x + (w / 2) * v, y + d * u, z + h * v * sag)],
      [[0, 1], (u, v) => P((x + w * u) * (1 - v) + xm * v, y + d, z + h * v * sag)], [[0, -1], (u, v) => P((x + w * u) * (1 - v) + xm * v, y, z + h * v * sag)]]
    : [[[0, 1], (u, v) => P(x + w * u, y + d - (d / 2) * v, z + h * v * sag)], [[0, -1], (u, v) => P(x + w * u, y + (d / 2) * v, z + h * v * sag)],
      [[1, 0], (u, v) => P(x + w, (y + d - d * u) * (1 - v) + ym * v, z + h * v * sag)], [[-1, 0], (u, v) => P(x, (y + d - d * u) * (1 - v) + ym * v, z + h * v * sag)]];
    faces.forEach(([nn, Q]) => { const sd = faceOf(T2, nn[0], nn[1]); if(!sd) return; const slope = ry ? nn[0] !== 0 : nn[1] !== 0, m = slope ? n : Math.max(3, Math.round(n * (ry ? w : d) / (ry ? d : w)));
      quadStripes(g, Q, m, cA, cB, (sd === 'L' ? 0.05 : -0.13) + (slope ? 0.08 : 0));
      if(hem && slope){ for(let i = 0; i < m; i++){ const a = Q(i / m, 0), b2 = Q((i + 1) / m, 0), mid = [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2 + 3.2 * k]; g.fillStyle = D.sh(i % 2 ? cB : cA, -0.05); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(mid[0], mid[1] + 1.4 * k, b2[0], b2[1]); g.closePath(); g.fill(); } } });
    if(o.top !== false){ const a = ry ? P(xm, y, z + h * sag) : P(x, ym, z + h * sag), b2 = ry ? P(xm, y + d, z + h * sag) : P(x + w, ym, z + h * sag); g.strokeStyle = D.sh(cA, -0.35); g.lineWidth = 1.6 * k; g.lineCap = 'round'; line(g, a, b2); } },
    {layer: o.layer || 0, zb: z, top: z + h}); }
// 🎪 a striped awning hanging off a box face: face 'front' (y = at) or 'right' (x = at), from a0 to a1 along it, out `out` tiles, dropping `drop` px; scalloped hem
function awning(B, face, at, a0, a1, z, out, drop, A, Bc, n, o){ o = o || {}; const fr = face === 'front', nn = fr ? [0, 1] : [1, 0];
  B.custom(fr ? (a0 + a1) / 2 : at + out, fr ? at + out : (a0 + a1) / 2, (g, P, k, t, T2) => { const sd = faceOf(T2, nn[0], nn[1]); if(!sd) return; const c = o.cond, br = c && c.broken;
    const Q = (u, v) => fr ? P(a0 + (a1 - a0) * u, at + out * v, z - drop * v) : P(at + out * v, a1 - (a1 - a0) * u, z - drop * v), cA = br ? D.sh(A, -0.35) : A, cB = br ? D.sh(Bc, -0.3) : Bc;
    quadStripes(g, Q, n, cA, cB, sd === 'L' ? 0.1 : -0.04);
    for(let i = 0; i < n; i++){ if(br && i % 3 === 1) continue; const a = Q(i / n, 1), b2 = Q((i + 1) / n, 1); g.fillStyle = D.sh(i % 2 ? cB : cA, -0.08); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2 + 5 * k, b2[0], b2[1]); g.closePath(); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.18)'; g.lineWidth = 0.8 * k; g.stroke(); }
    if(o.poles) [0, 1].forEach(u => { const a = Q(u, 1), b2 = fr ? P(a0 + (a1 - a0) * u, at + out, 0) : P(at + out, a1 - (a1 - a0) * u, 0); g.strokeStyle = o.poles; g.lineWidth = 1.6 * k; line(g, a, b2); }); },
    {layer: o.layer || 0, zb: o.poles ? 0 : z - drop, top: z}); }
// 🔲 glazed tiles on a face (decal paint): a grid n tiles across × rows of `row` px, every few tiles a coloured one (o.dot)
const tiles = (h, col, n, row, o) => (g, Q, k) => { o = o || {}; const R = rnd(o.seed || 5); g.strokeStyle = o.grout || 'rgba(42,28,20,0.16)'; g.lineWidth = 0.8 * k;
  if(o.dot) for(let z = 0; z < h - 1; z += row) for(let i = 0; i < n; i++) if(R() < (o.p || 0.12)){ polyP(g, [Q(i / n + 0.01, z + 0.6), Q((i + 1) / n - 0.01, z + 0.6), Q((i + 1) / n - 0.01, Math.min(h, z + row) - 0.6), Q(i / n + 0.01, Math.min(h, z + row) - 0.6)]); g.fillStyle = o.dot; g.fill(); }
  for(let z = row; z < h - 0.5; z += row) line(g, Q(0, z), Q(1, z)); for(let i = 1; i < n; i++) line(g, Q(i / n, 0), Q(i / n, h));
  g.strokeStyle = 'rgba(255,255,255,0.4)'; for(let z = 1; z < h - 0.5; z += row) line(g, Q(0.01, z), Q(0.99, z)); };
// 🏁 a checker band (decal paint): n squares across, `rows` rows over the decal height h
const checker = (h, A, Bc, n, rows) => (g, Q, k) => { const rh = h / (rows || 1); for(let r = 0; r < (rows || 1); r++) for(let i = 0; i < n; i++){ polyP(g, [Q(i / n, r * rh), Q((i + 1) / n, r * rh), Q((i + 1) / n, (r + 1) * rh), Q(i / n, (r + 1) * rh)]); g.fillStyle = (i + r) % 2 ? Bc : A; g.fill(); } };
// 🪙🧱💎 ip-4b: a side can draw its OWN resource shapes (<side>_coin · _brick · _gem); resKey(side, kind) falls back to the shared coin rock / brick tree / gem ore
const RES_KEYS = {coin: 'coinrock', brick: 'bricktree', gem: 'gemore'};
// 🏺 ip-4g ⑤ one fixed order for the 12 Origin Relics (HUD strip, hall, lists) = AvataRealm's side order: ② raptor · bolt, ① kitchen · horde, then ③ ④ ⑤ ⑥
const ORIGIN = {}, ORIGIN_ORDER = Object.freeze(['raptor', 'bolt', 'kitchen', 'horde', 'monster', 'myth', 'toybox', 'dust', 'reef', 'cloud', 'wizard', 'gear']);
const origins = () => ORIGIN_ORDER.filter(s => Props.AR.ORIGIN[s]).map(s => Object.assign({side: s}, Props.AR.ORIGIN[s]));   // the LOADED relics, always in ORIGIN_ORDER
const resKey = (side, kind) => DEFS[side + '_' + kind] ? side + '_' + kind : RES_KEYS[kind];
// 🔀 ar-1 flip a placed (or plain) AvataRealm building to another team / build step / kerb in place (same footprint → same cells)
function set(it, patch, M){ if(!it || !DEFS[it.prop]) return it; M = M || it.map; const pal = Object.assign({}, it.pal, patch || {});
  Object.keys(pal).forEach(k => { if(pal[k] == null) delete pal[k]; });
  const o = {v: it.v, turn: it.turn, look: it.look, z: it.z, cond: it.cond, pal, state: it.state, text: it.text};
  if(M && it.cells){ Props.remove(M, it); const n = Props.place(M, it.prop, it.x, it.y, o); if(n){ const keep = {alpha: it.alpha, role: it.role, popT: it.popT, morph: it.morph}; Object.assign(it, n, keep); it.cells.forEach(([a, b]) => { M._props[b * M.w + a] = it; }); return it; } }
  const n = Props.item(it.prop, it.x, it.y, o); ['pal', 'pic', 'frames', 'stand', 'aim', 'mid'].forEach(f => { if(f in n) it[f] = n[f]; }); return it; }
Props.AR = {set, TEAMS, TEAM_ORDER, TEAM_PAT, teamOf, patOf, SLOTS, SLOT_ORDER, SIDES, BUILD_STEPS, FLOORS, key: (side, slot) => side + '_' + slot,
  slotOf: key => (DEFS[key] || {}).slot || null, sideOf: key => (DEFS[key] || {}).side || null,
  wall: wallAt, wallLine, gate: gateAt, wallOff, rejoin, wallMask, wallKindOf, WALLS, WBIT,   // 🧱 ar-4
  resKey, RES_KEYS,   // 🪙 ip-4b: own resource shapes per side
  ORIGIN, ORIGIN_ORDER, origins};   // 🏺 ip-4g: each side file fills ORIGIN[side] = {key, name, icon} · ORIGIN_ORDER = the fixed HUD order · origins() = the loaded ones in that order
K.AR = {TEAMS, teamOf, patOf, inkOf, patPaint, bandPaint, kerb, pennant, banner, trim, site, building, addSide, addFloor, tileBase, hash, resOf, SLOTS, SIDES,
  wallProp, gateProp, gateDoors, longFaces, blocks, WT, WP, tallWallProp, tallGateProp, lifted, TB,   // 🧱 ar-4 · 🏯 tall
  quadStripes, faceOf, tent, awning, tiles, checker, RES0};   // 🍳🍽️ ip-4b
})();
K.loaded('realm', 'ip-7a');
})(window.Props && window.Props._K);
