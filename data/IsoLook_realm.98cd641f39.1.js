
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
// 🔀 ar-1 flip a placed (or plain) AvataRealm building to another team / build step / kerb in place (same footprint → same cells)
function set(it, patch, M){ if(!it || !DEFS[it.prop]) return it; M = M || it.map; const pal = Object.assign({}, it.pal, patch || {});
  Object.keys(pal).forEach(k => { if(pal[k] == null) delete pal[k]; });
  const o = {v: it.v, turn: it.turn, look: it.look, z: it.z, cond: it.cond, pal, state: it.state, text: it.text};
  if(M && it.cells){ Props.remove(M, it); const n = Props.place(M, it.prop, it.x, it.y, o); if(n){ const keep = {alpha: it.alpha, role: it.role, popT: it.popT, morph: it.morph}; Object.assign(it, n, keep); it.cells.forEach(([a, b]) => { M._props[b * M.w + a] = it; }); return it; } }
  const n = Props.item(it.prop, it.x, it.y, o); ['pal', 'pic', 'frames', 'stand', 'aim', 'mid'].forEach(f => { if(f in n) it[f] = n[f]; }); return it; }
Props.AR = {set, TEAMS, TEAM_ORDER, TEAM_PAT, teamOf, patOf, SLOTS, SLOT_ORDER, SIDES, BUILD_STEPS, FLOORS, key: (side, slot) => side + '_' + slot,
  slotOf: key => (DEFS[key] || {}).slot || null, sideOf: key => (DEFS[key] || {}).side || null};
K.AR = {TEAMS, teamOf, patOf, inkOf, patPaint, bandPaint, kerb, pennant, banner, trim, site, building, addSide, addFloor, tileBase, hash, resOf, SLOTS, SIDES};
})();
K.loaded('realm', 'ar-1');
})(window.Props && window.Props._K);
