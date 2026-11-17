
/* ================= 🧍 MINIVATAR PAINTERS (AvataRealm R0a look pack — Test Harness/avatarealm/src/01_draw.js + 10_minis.js): the player's avatar + role costume through AK_WEAR ================= */
/* 🧳 Avateer — drawing helpers (av-r0a). Pure canvas, no emoji, no page state. */
(function(){
'use strict';
const TAU = Math.PI * 2;
function rgb(h){ const n = parseInt(String(h).replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function sh(h, f){ const c = rgb(h), m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)))); return 'rgb(' + m(c[0]) + ',' + m(c[1]) + ',' + m(c[2]) + ')'; }
function rgba(h, a){ const c = rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
// ONE-PIECE: every part gets the same dark rim first, then all fills → one silhouette, no inner outlines
function piece(g, parts, rim, rw){
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if(rw > 0){ g.strokeStyle = rim; g.lineWidth = rw * 2; parts.forEach(p => { if(p.noRim) return; g.beginPath(); p.path(g); g.stroke(); if(p.closedFill !== false){ g.fillStyle = rim; g.fill(); } }); }
  parts.forEach(p => { g.beginPath(); p.path(g); if(p.fill){ g.fillStyle = typeof p.fill === 'function' ? p.fill(g) : p.fill; g.fill(); } if(p.after) p.after(g); });
  g.restore();
}
function lin(g, x0, y0, x1, y1, stops){ const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => gr.addColorStop(Array.isArray(c) ? c[0] : i / Math.max(1, stops.length - 1), Array.isArray(c) ? c[1] : c)); return gr; }
function rad(g, x, y, r0, r1, stops){ const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((c, i) => gr.addColorStop(Array.isArray(c) ? c[0] : i / Math.max(1, stops.length - 1), Array.isArray(c) ? c[1] : c)); return gr; }
function glow(g, x, y, r, col, a){ g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rad(g, x, y, 0, r, [[0, rgba(col, a == null ? 0.55 : a)], [1, rgba(col, 0)]]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); }
function star(g, x, y, r1, r2, n, rot){ n = n || 5; rot = rot == null ? -Math.PI / 2 : rot; for(let i = 0; i < n * 2; i++){ const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; i ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function rr(g, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function ell(g, x, y, rx, ry, rot){ g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); }
function sparkle(g, x, y, r, col){ g.save(); g.fillStyle = col || '#fff'; g.beginPath(); star(g, x, y, r, r * 0.22, 4, 0); g.fill(); g.restore(); }
// seeded random
function rnd(seed){ let s = seed >>> 0 || 1; return () => { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296; }; }
// text helpers (sheets + mocks)
function txt(g, s, x, y, o){ o = o || {}; g.save(); g.font = (o.w || 700) + ' ' + (o.size || 16) + 'px ' + (o.font || 'Fredoka'); g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  if(o.max){ let f = o.size || 16; while(g.measureText(s).width > o.max && f > 6){ f -= 0.5; g.font = (o.w || 700) + ' ' + f + 'px ' + (o.font || 'Fredoka'); } }
  if(o.stroke){ g.lineJoin = 'round'; g.strokeStyle = o.stroke; g.lineWidth = o.sw || 4; g.strokeText(s, x, y); }
  if(o.shadow){ g.shadowColor = o.shadow; g.shadowBlur = o.blur || 6; g.shadowOffsetY = o.sy == null ? 2 : o.sy; }
  g.fillStyle = o.col || '#2B2D42'; g.fillText(s, x, y); g.restore(); }
function wrap(g, s, x, y, w, lh, o){ o = o || {}; g.save(); g.font = (o.w || 600) + ' ' + (o.size || 14) + 'px ' + (o.font || 'Fredoka'); const words = s.split(' '); let line = '', yy = y;
  words.forEach(wd => { const t = line ? line + ' ' + wd : wd; if(g.measureText(t).width > w && line){ txt(g, line, x, yy, o); line = wd; yy += lh; } else line = t; }); if(line) txt(g, line, x, yy, o); g.restore(); return yy + lh; }
function card(g, x, y, w, h, o){ o = o || {}; g.save(); if(o.shadow !== false){ g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = o.blur || 14; g.shadowOffsetY = 4; }
  g.fillStyle = o.fill || '#fff'; g.beginPath(); rr(g, x, y, w, h, o.r == null ? 16 : o.r); g.fill(); g.shadowColor = 'transparent';
  if(o.line){ g.strokeStyle = o.line; g.lineWidth = o.lw || 2; g.stroke(); } g.restore(); }
function pill(g, s, x, y, o){ o = o || {}; g.save(); g.font = (o.w || 700) + ' ' + (o.size || 13) + 'px Fredoka'; const w = g.measureText(s).width + (o.pad || 12) * 2, h = (o.size || 13) * 1.9;
  const xx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x; card(g, xx, y, w, h, {fill: o.fill || '#2B2D42', r: h / 2, shadow: o.shadow, line: o.line});
  txt(g, s, xx + w / 2, y + h * 0.68, {align: 'center', size: o.size || 13, col: o.col || '#fff', w: o.w || 700}); g.restore(); return w; }
// a canvas of size w × h at device scale s
function cv(w, h, s){ s = s || 1; const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s); const g = c.getContext('2d'); g.scale(s, s); c.W = w; c.H = h; return c; }
// paint something at a big scale off-screen, find its real painted box, then draw it centred + scaled into (x, y, w, h)
const FITC = new Map();
function box(key, paint){ fit(null, key, paint); return FITC.get(key); }
function fit(g, key, paint, x, y, w, h, o){ o = o || {}; let e = FITC.get(key);
  if(!e){ const S = 600, c = document.createElement('canvas'); c.width = S; c.height = S; const q = c.getContext('2d'); q.translate(S / 2, S / 2); paint(q, 1); const d = q.getImageData(0, 0, S, S).data;
    let x0 = S, y0 = S, x1 = 0, y1 = 0; for(let j = 0; j < S; j++) for(let i = 0; i < S; i++) if(d[(j * S + i) * 4 + 3] > 12){ if(i < x0) x0 = i; if(i > x1) x1 = i; if(j < y0) y0 = j; if(j > y1) y1 = j; }
    e = {x0: x0 - S / 2, y0: y0 - S / 2, w: Math.max(1, x1 - x0 + 1), h: Math.max(1, y1 - y0 + 1)}; FITC.set(key, e); }
  if(!g) return 0;
  const k = o.k || Math.min(w / e.w, h / e.h, o.max || 99), dx = x + (w - e.w * k) / 2 - e.x0 * k, dy = o.bottom ? y + h - (e.y0 + e.h) * k : y + (h - e.h * k) / 2 - e.y0 * k;
  g.save(); g.translate(dx, dy); g.scale(k, k); paint(g, 1); g.restore(); return k; }
window.AVD = {fit, box, TAU, rgb, sh, rgba, piece, lin, rad, glow, star, rr, ell, sparkle, rnd, txt, wrap, card, pill, cv};
})();

/* 🏰⚔️ AvataRealm R0a — Minivatars: the player's OWN avatar (face kept, Aowu §11 #3) wearing a role costume through the AK_WEAR hook
   (page-drawn wear, never saved). One silhouette per role so a unit reads at phone size: head piece + hand item + back / body piece (+ ride / wings / wagon).
   Team = ground ring + plume / pennant colour. A side (theme) only re-skins the SAME 8 role silhouettes (R3). Pure canvas, no emoji. */
(function(){
'use strict';
const D = AVD, RIM = '#2A1C14';
const TEAM = {blue: {c: '#3A86FF', d: '#1F5FCC', l: '#9CC3FF', n: 'Blue'}, red: {c: '#FF4D6D', d: '#C92C4A', l: '#FFB0BF', n: 'Red'}, gold: {c: '#FFC21A', d: '#C98E00', l: '#FFE48A', n: 'Gold'}, green: {c: '#3DBE6A', d: '#23874A', l: '#A8E6BC', n: 'Green'},
  purple: {c: '#9B5DE5', d: '#6B34B8', l: '#D2B8F5', n: 'Purple'}, orange: {c: '#FF8A2A', d: '#C85F12', l: '#FFC79A', n: 'Orange'}};   // ar-r0b: 6 teams (§14j)
const MAT = {wood: '#C99257', woodD: '#8A5A2E', iron: '#B7BCC6', ironD: '#7D8592', gold: '#FFC21A', cloth: '#FFF6E8', leaf: '#6FC24E', brick: '#E2704A'};
// 8 role slots (plan §5) — default Avatar Town names
const ROLES = [
  {k: 'worker', name: 'Bricklet', slot: 'Worker', what: 'gathers + builds', beats: '—', cost: [50, 0], hp: 40},
  {k: 'foot', name: 'Stomper', slot: 'Footman', what: 'sturdy all-rounder', beats: 'beats Spear', cost: [60, 20], hp: 100},
  {k: 'spear', name: 'Pokelancer', slot: 'Spearman', what: 'stops riders', beats: 'beats Rider', cost: [50, 30], hp: 80},
  {k: 'archer', name: 'Twangster', slot: 'Archer', what: 'shoots from far', beats: 'beats Flyer + Footman', cost: [60, 40], hp: 60},
  {k: 'rider', name: 'Saddlebuddy', slot: 'Rider', what: 'fast, hits hard', beats: 'beats Archer', cost: [100, 50], hp: 130},
  {k: 'flyer', name: 'Flapper', slot: 'Flyer', what: 'flies over walls', beats: 'over walls', cost: [90, 60], hp: 70},
  {k: 'healer', name: 'Patchie', slot: 'Healer', what: 'heals friends', beats: 'heals', cost: [70, 50], hp: 60},
  {k: 'siege', name: 'Bonkwagon', slot: 'Siege', what: 'breaks buildings', beats: 'beats buildings', cost: [120, 120], hp: 160},
  // ➕ Aowu 2026-11-17 23:12: mage · spy · tamer · saint (names picked by the AvataRealm chat)
  {k: 'mage', name: 'Wizzle', slot: 'Mage', what: 'magic splash from far', beats: 'beats crowds', cost: [80, 60], hp: 55, add: 1},
  {k: 'spy', name: 'Sneakster', slot: 'Spy', what: 'hides, strikes the back row', beats: 'beats Mage + back row', cost: [70, 40], hp: 50, add: 1},
  {k: 'tamer', name: 'Critterpal', slot: 'Tamer', what: 'calls a tamed monster', beats: 'pet holds the front', cost: [90, 50], hp: 60, add: 1},
  {k: 'saint', name: 'Halojoy', slot: 'Saint', what: 'heal circle + brings one back', beats: 'heals all near', cost: [110, 80], hp: 70, add: 1},
];
const RK = {}; ROLES.forEach((r, i) => { RK[r.k] = r; r.i = i; });
// ---- gear painters: (g, k, o, team, look) in the avatar's own frame (feet = 0, head centre ≈ −61k, hand = origin for 'hand') ----
const P = (g, parts, k) => D.piece(g, parts, RIM, 1.25 * k);
function plume(g, k, x, y, T, s){ s = s || 1; P(g, [{path: g => { g.moveTo(x, y); g.quadraticCurveTo(x + 10 * k * s, y - 14 * k * s, x + 2 * k * s, y - 20 * k * s); g.quadraticCurveTo(x - 6 * k * s, y - 10 * k * s, x, y); }, fill: T.c}], k); }
const HEAD = {
  hardhat(g, k, y, T){ P(g, [{path: g => D.ell(g, 0, y - 6 * k, 18 * k, 4.5 * k), fill: '#F2B21A'}, {path: g => { g.moveTo(-13 * k, y - 7 * k); g.quadraticCurveTo(-13 * k, y - 25 * k, 0, y - 25 * k); g.quadraticCurveTo(13 * k, y - 25 * k, 13 * k, y - 7 * k); g.closePath(); }, fill: g => D.lin(g, 0, y - 25 * k, 0, y - 7 * k, ['#FFE070', '#FFC21A'])}], k);
    g.fillStyle = T.c; g.fillRect(-2.2 * k, y - 25 * k, 4.4 * k, 18 * k); },
  helm(g, k, y, T){ plume(g, k, 0, y - 24 * k, T, 1.1); P(g, [{path: g => { g.moveTo(-15 * k, y - 4 * k); g.quadraticCurveTo(-15 * k, y - 27 * k, 0, y - 27 * k); g.quadraticCurveTo(15 * k, y - 27 * k, 15 * k, y - 4 * k); g.lineTo(11 * k, y - 4 * k); g.lineTo(11 * k, y - 10 * k); g.lineTo(-11 * k, y - 10 * k); g.lineTo(-11 * k, y - 4 * k); g.closePath(); }, fill: g => D.lin(g, -15 * k, 0, 15 * k, 0, ['#E6EAF0', MAT.iron, MAT.ironD])}], k);
    g.fillStyle = MAT.ironD; g.fillRect(-1.6 * k, y - 26 * k, 3.2 * k, 16 * k); },
  cone(g, k, y, T){ P(g, [{path: g => { g.moveTo(-14 * k, y - 8 * k); g.lineTo(0, y - 36 * k); g.lineTo(14 * k, y - 8 * k); g.quadraticCurveTo(0, y - 3 * k, -14 * k, y - 8 * k); }, fill: g => D.lin(g, -14 * k, 0, 14 * k, 0, ['#E6EAF0', MAT.iron, MAT.ironD])}, {path: g => D.ell(g, 0, y - 37 * k, 3.2 * k, 3.2 * k), fill: T.c}], k);
    g.fillStyle = T.c; g.beginPath(); g.moveTo(-13 * k, y - 10 * k); g.quadraticCurveTo(0, y - 5 * k, 13 * k, y - 10 * k); g.lineTo(12 * k, y - 13.5 * k); g.quadraticCurveTo(0, y - 9 * k, -12 * k, y - 13.5 * k); g.fill(); },
  feather(g, k, y, T){ P(g, [{path: g => { g.moveTo(-17 * k, y - 8 * k); g.quadraticCurveTo(-6 * k, y - 30 * k, 12 * k, y - 18 * k); g.lineTo(18 * k, y - 8 * k); g.quadraticCurveTo(0, y - 3 * k, -17 * k, y - 8 * k); }, fill: g => D.lin(g, 0, y - 28 * k, 0, y - 6 * k, ['#8FD16A', '#4E9A3A'])}], k);
    P(g, [{path: g => { g.moveTo(8 * k, y - 18 * k); g.quadraticCurveTo(22 * k, y - 34 * k, 30 * k, y - 34 * k); g.quadraticCurveTo(20 * k, y - 22 * k, 10 * k, y - 15 * k); g.closePath(); }, fill: T.c}], k); },
  knight(g, k, y, T){ plume(g, k, 2 * k, y - 26 * k, T, 1.3); P(g, [{path: g => { g.moveTo(-15 * k, y + 6 * k); g.lineTo(-15 * k, y - 16 * k); g.quadraticCurveTo(-15 * k, y - 28 * k, 0, y - 28 * k); g.quadraticCurveTo(15 * k, y - 28 * k, 15 * k, y - 16 * k); g.lineTo(15 * k, y + 6 * k); g.lineTo(7 * k, y + 6 * k); g.lineTo(7 * k, y - 4 * k); g.lineTo(-7 * k, y - 4 * k); g.lineTo(-7 * k, y + 6 * k); g.closePath(); }, fill: g => D.lin(g, -15 * k, 0, 15 * k, 0, ['#F0F2F6', MAT.iron, MAT.ironD])}], k);
    g.fillStyle = MAT.gold; g.fillRect(-15 * k, y - 15 * k, 30 * k, 3 * k); },
  goggles(g, k, y, T){ P(g, [{path: g => { g.moveTo(-15 * k, y - 5 * k); g.quadraticCurveTo(-15 * k, y - 26 * k, 0, y - 26 * k); g.quadraticCurveTo(15 * k, y - 26 * k, 15 * k, y - 5 * k); g.closePath(); }, fill: g => D.lin(g, 0, y - 26 * k, 0, y - 5 * k, ['#B97A45', '#8A5A2E'])}], k);
    [-6.5, 6.5].forEach(x => P(g, [{path: g => D.ell(g, x * k, y - 14 * k, 5.2 * k, 4.6 * k), fill: g => D.rad(g, x * k - 1.5 * k, y - 15.5 * k, 0.5, 5 * k, ['#E8FBFF', '#7FD8F2'])}], k)); },
  nurse(g, k, y, T){ P(g, [{path: g => { g.moveTo(-13 * k, y - 10 * k); g.lineTo(-10 * k, y - 26 * k); g.quadraticCurveTo(0, y - 30 * k, 10 * k, y - 26 * k); g.lineTo(13 * k, y - 10 * k); g.quadraticCurveTo(0, y - 6 * k, -13 * k, y - 10 * k); }, fill: '#FFFFFF'}], k);
    g.fillStyle = '#FF4D6D'; g.fillRect(-2 * k, y - 25 * k, 4 * k, 11 * k); g.fillRect(-5.5 * k, y - 21.5 * k, 11 * k, 4 * k); },
  bandana(g, k, y, T){ P(g, [{path: g => { g.moveTo(-15 * k, y - 9 * k); g.quadraticCurveTo(0, y - 30 * k, 15 * k, y - 9 * k); g.quadraticCurveTo(0, y - 14 * k, -15 * k, y - 9 * k); }, fill: T.c}, {path: g => { g.moveTo(14 * k, y - 11 * k); g.lineTo(23 * k, y - 4 * k); g.lineTo(20 * k, y - 14 * k); g.closePath(); }, fill: T.d}], k); },
  crown(g, k, y, T){ P(g, [{path: g => { g.moveTo(-13 * k, y - 14 * k); g.lineTo(-14 * k, y - 32 * k); g.lineTo(-7 * k, y - 23 * k); g.lineTo(0, y - 35 * k); g.lineTo(7 * k, y - 23 * k); g.lineTo(14 * k, y - 32 * k); g.lineTo(13 * k, y - 14 * k); g.closePath(); }, fill: g => D.lin(g, 0, y - 35 * k, 0, y - 14 * k, ['#FFE98A', MAT.gold])}], k);
    [[-14, -32], [0, -35], [14, -32]].forEach(p => { g.fillStyle = T.c; g.beginPath(); g.arc(p[0] * k, y + p[1] * k, 2.6 * k, 0, 7); g.fill(); }); },
  wizhat(g, k, y, T){ P(g, [{path: g => D.ell(g, 0, y - 8 * k, 21 * k, 5 * k), fill: '#6B4FD8'}, {path: g => { g.moveTo(-13 * k, y - 9 * k); g.quadraticCurveTo(-6 * k, y - 30 * k, 2 * k, y - 44 * k); g.quadraticCurveTo(10 * k, y - 50 * k, 18 * k, y - 44 * k); g.quadraticCurveTo(8 * k, y - 40 * k, 9 * k, y - 26 * k); g.lineTo(13 * k, y - 9 * k); g.closePath(); }, fill: g => D.lin(g, -13 * k, 0, 13 * k, 0, ['#9A7BFF', '#5A3EC8'])}], k);
    g.fillStyle = T.c; g.fillRect(-12.5 * k, y - 14 * k, 25 * k, 4 * k); g.fillStyle = '#FFE070'; [[-3, -24, 3], [5, -33, 2.4], [-6, -16, 2]].forEach(p => { g.beginPath(); D.star(g, p[0] * k, y + p[1] * k, p[2] * k, p[2] * 0.45 * k, 5); g.fill(); }); },
  hood(g, k, y, T){ P(g, [{path: g => { g.moveTo(-16 * k, y + 8 * k); g.quadraticCurveTo(-19 * k, y - 26 * k, 0, y - 30 * k); g.quadraticCurveTo(14 * k, y - 30 * k, 19 * k, y - 18 * k); g.lineTo(26 * k, y - 22 * k); g.lineTo(18 * k, y - 8 * k); g.quadraticCurveTo(19 * k, y + 2 * k, 16 * k, y + 8 * k); g.lineTo(11 * k, y + 2 * k); g.quadraticCurveTo(12 * k, y - 18 * k, 0, y - 19 * k); g.quadraticCurveTo(-12 * k, y - 18 * k, -11 * k, y + 2 * k); g.closePath(); }, fill: g => D.lin(g, 0, y - 30 * k, 0, y + 8 * k, ['#4A4E66', '#2B2D42'])}], k);
    P(g, [{path: g => D.rr(g, -12 * k, y - 4 * k, 24 * k, 6 * k, 3 * k), fill: '#2B2D42'}], k); g.fillStyle = T.c; g.fillRect(-12 * k, y - 18.5 * k, 24 * k, 2.4 * k); },
  beast(g, k, y, T){ P(g, [{path: g => { g.moveTo(-16 * k, y - 3 * k); g.quadraticCurveTo(-17 * k, y - 28 * k, 0, y - 28 * k); g.quadraticCurveTo(17 * k, y - 28 * k, 16 * k, y - 3 * k); g.quadraticCurveTo(0, y - 12 * k, -16 * k, y - 3 * k); }, fill: g => D.lin(g, 0, y - 28 * k, 0, y - 4 * k, ['#E9B57A', '#B97A45'])},
      {path: g => { g.moveTo(-14 * k, y - 20 * k); g.lineTo(-18 * k, y - 36 * k); g.lineTo(-6 * k, y - 27 * k); g.closePath(); }, fill: '#B97A45'}, {path: g => { g.moveTo(14 * k, y - 20 * k); g.lineTo(18 * k, y - 36 * k); g.lineTo(6 * k, y - 27 * k); g.closePath(); }, fill: '#B97A45'}], k);
    g.fillStyle = '#FFF3DC'; [[-12, -22], [12, -22]].forEach(p => { g.beginPath(); g.moveTo(p[0] * k, y + p[1] * k); g.lineTo((p[0] + (p[0] < 0 ? -2 : 2)) * k, y + (p[1] - 8) * k); g.lineTo((p[0] + (p[0] < 0 ? 3 : -3)) * k, y + (p[1] - 3) * k); g.fill(); });
    g.fillStyle = T.c; g.fillRect(-13 * k, y - 10 * k, 26 * k, 3 * k); },
  halo(g, k, y, T){ g.save(); g.strokeStyle = RIM; g.lineWidth = 4.6 * k; g.beginPath(); D.ell(g, 0, y - 32 * k, 13 * k, 4 * k); g.stroke(); g.strokeStyle = '#FFD54A'; g.lineWidth = 2.6 * k; g.stroke(); g.restore(); D.glow(g, 0, y - 32 * k, 20 * k, '#FFE98A', 0.5);
    P(g, [{path: g => { g.moveTo(-13 * k, y - 12 * k); g.quadraticCurveTo(0, y - 20 * k, 13 * k, y - 12 * k); g.lineTo(12 * k, y - 9 * k); g.quadraticCurveTo(0, y - 16 * k, -12 * k, y - 9 * k); g.closePath(); }, fill: '#FFFFFF'}], k); g.fillStyle = T.c; g.beginPath(); D.ell(g, 0, y - 16 * k, 2.4 * k, 2.4 * k); g.fill(); },
  // a side re-skin examples (R3 shows all 12 sides) — same silhouette slot, new costume
  toque(g, k, y, T){ P(g, [{path: g => { g.moveTo(-12 * k, y - 10 * k); g.lineTo(-12 * k, y - 22 * k); g.arc(-7 * k, y - 28 * k, 8 * k, Math.PI * 0.8, Math.PI * 1.7); g.arc(3 * k, y - 33 * k, 9 * k, Math.PI * 1.1, Math.PI * 1.9); g.arc(9 * k, y - 26 * k, 7 * k, Math.PI * 1.4, Math.PI * 0.25); g.lineTo(12 * k, y - 10 * k); g.closePath(); }, fill: '#FFFFFF'}], k);
    g.fillStyle = T.c; g.fillRect(-12 * k, y - 14 * k, 24 * k, 4 * k); },
  bucket(g, k, y, T){ P(g, [{path: g => { D.rr(g, -15 * k, y - 28 * k, 30 * k, 24 * k, 5 * k); }, fill: g => D.lin(g, -15 * k, 0, 15 * k, 0, ['#E6EAF0', '#A9B3C2', '#7D8592'])}, {path: g => { g.rect(-1.3 * k, y - 40 * k, 2.6 * k, 12 * k); }, fill: MAT.ironD}, {path: g => D.ell(g, 0, y - 41 * k, 3.4 * k, 3.4 * k), fill: T.c}], k);
    g.fillStyle = '#2B2D42'; D.rr(g, -11 * k, y - 20 * k, 22 * k, 7 * k, 3 * k); g.fill(); g.fillStyle = '#7FF2E8'; g.fillRect(-8 * k, y - 18 * k, 16 * k, 3 * k); },
  dino(g, k, y, T){ P(g, [{path: g => { g.moveTo(-16 * k, y - 2 * k); g.quadraticCurveTo(-17 * k, y - 30 * k, 2 * k, y - 30 * k); g.quadraticCurveTo(22 * k, y - 30 * k, 18 * k, y - 8 * k); g.lineTo(10 * k, y - 10 * k); g.quadraticCurveTo(0, y - 14 * k, -10 * k, y - 8 * k); g.lineTo(-12 * k, y - 2 * k); g.closePath(); }, fill: g => D.lin(g, 0, y - 30 * k, 0, y - 4 * k, ['#9BE07A', '#5DB04A'])}], k);
    g.fillStyle = '#FFFFFF'; [[-6, -10], [0, -11], [6, -10]].forEach(p => { g.beginPath(); g.moveTo((p[0] - 2) * k, y + p[1] * k); g.lineTo(p[0] * k, y + (p[1] + 4) * k); g.lineTo((p[0] + 2) * k, y + p[1] * k); g.fill(); });
    g.fillStyle = T.c; [[-8, -31], [0, -34], [8, -31]].forEach(p => { g.beginPath(); g.moveTo((p[0] - 3) * k, y + (p[1] + 3) * k); g.lineTo(p[0] * k, y + (p[1] - 4) * k); g.lineTo((p[0] + 3) * k, y + (p[1] + 3) * k); g.fill(); }); },
};
const HAND = {
  hammer(g, k, T){ P(g, [{path: g => g.rect(-1.6 * k, -22 * k, 3.2 * k, 26 * k), fill: MAT.wood}, {path: g => D.rr(g, -7 * k, -28 * k, 14 * k, 8 * k, 2 * k), fill: g => D.lin(g, 0, -28 * k, 0, -20 * k, ['#E6EAF0', MAT.ironD])}], k); },
  sword(g, k, T){ P(g, [{path: g => { g.moveTo(-2.4 * k, -6 * k); g.lineTo(-2.4 * k, -30 * k); g.lineTo(0, -35 * k); g.lineTo(2.4 * k, -30 * k); g.lineTo(2.4 * k, -6 * k); g.closePath(); }, fill: g => D.lin(g, -2.4 * k, 0, 2.4 * k, 0, ['#FFFFFF', '#B7BCC6'])}, {path: g => D.rr(g, -7 * k, -7 * k, 14 * k, 3.4 * k, 1.5 * k), fill: MAT.gold}, {path: g => g.rect(-1.6 * k, -4 * k, 3.2 * k, 7 * k), fill: MAT.woodD}], k); },
  spear(g, k, T){ P(g, [{path: g => g.rect(-1.5 * k, -64 * k, 3 * k, 74 * k), fill: MAT.wood}, {path: g => { g.moveTo(-4.5 * k, -62 * k); g.lineTo(0, -76 * k); g.lineTo(4.5 * k, -62 * k); g.closePath(); }, fill: g => D.lin(g, -4 * k, 0, 4 * k, 0, ['#FFFFFF', MAT.iron])}], k);
    g.fillStyle = T.c; g.beginPath(); g.moveTo(1.5 * k, -60 * k); g.lineTo(11 * k, -57 * k); g.lineTo(1.5 * k, -53 * k); g.fill(); },
  bow(g, k, T){ g.save(); g.lineCap = 'round'; g.strokeStyle = RIM; g.lineWidth = 5 * k; g.beginPath(); g.arc(-12 * k, -12 * k, 20 * k, -1.15, 1.15); g.stroke(); g.strokeStyle = '#A8642E'; g.lineWidth = 2.8 * k; g.stroke();
    const a = 20 * k, x0 = -12 * k + Math.cos(-1.15) * a, y0 = -12 * k + Math.sin(-1.15) * a, y1 = -12 * k + Math.sin(1.15) * a; g.strokeStyle = '#FFF6E8'; g.lineWidth = 0.9 * k; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.stroke(); g.restore(); },
  lance(g, k, T){ P(g, [{path: g => { g.moveTo(-3 * k, 4 * k); g.lineTo(-1 * k, -52 * k); g.lineTo(1 * k, -52 * k); g.lineTo(3 * k, 4 * k); g.closePath(); }, fill: g => D.lin(g, -3 * k, 0, 3 * k, 0, [T.l, T.c])}, {path: g => D.ell(g, 0, 0, 6.5 * k, 3.5 * k), fill: MAT.iron}], k); },
  staff(g, k, T){ P(g, [{path: g => g.rect(-1.5 * k, -34 * k, 3 * k, 42 * k), fill: MAT.wood}, {path: g => { const y = -40 * k; g.moveTo(0, y + 8 * k); g.bezierCurveTo(-10 * k, y - 1 * k, -5 * k, y - 9 * k, 0, y - 4 * k); g.bezierCurveTo(5 * k, y - 9 * k, 10 * k, y - 1 * k, 0, y + 8 * k); }, fill: '#FF4D6D'}], k);
    D.glow(g, 0, -40 * k, 12 * k, '#FFD0DA', 0.6); },
  mallet(g, k, T){ P(g, [{path: g => g.rect(-1.8 * k, -34 * k, 3.6 * k, 40 * k), fill: MAT.wood}, {path: g => D.rr(g, -12 * k, -46 * k, 24 * k, 14 * k, 4 * k), fill: g => D.lin(g, 0, -46 * k, 0, -32 * k, ['#E9B57A', '#B97A45'])}], k);
    g.fillStyle = T.c; g.fillRect(-12 * k, -41 * k, 24 * k, 3.5 * k); },
  sceptre(g, k, T){ P(g, [{path: g => g.rect(-1.6 * k, -30 * k, 3.2 * k, 36 * k), fill: MAT.gold}, {path: g => D.ell(g, 0, -33 * k, 5.5 * k, 5.5 * k), fill: g => D.rad(g, -1.5 * k, -35 * k, 0.5, 6 * k, ['#FFFFFF', T.c])}], k); D.glow(g, 0, -33 * k, 12 * k, T.l, 0.5); },
  spatula(g, k, T){ P(g, [{path: g => g.rect(-1.5 * k, -20 * k, 3 * k, 26 * k), fill: '#2B2D42'}, {path: g => D.rr(g, -6 * k, -34 * k, 12 * k, 15 * k, 3 * k), fill: g => D.lin(g, -6 * k, 0, 6 * k, 0, ['#FFFFFF', '#B7BCC6'])}], k); },
  wrench(g, k, T){ P(g, [{path: g => g.rect(-2 * k, -24 * k, 4 * k, 30 * k), fill: MAT.iron}, {path: g => { g.arc(0, -28 * k, 7 * k, Math.PI * 0.35, Math.PI * 2.65); g.lineTo(2.5 * k, -33 * k); g.lineTo(-2.5 * k, -33 * k); g.closePath(); }, fill: g => D.lin(g, -7 * k, 0, 7 * k, 0, ['#E6EAF0', MAT.ironD])}], k); },
  orbstaff(g, k, T){ P(g, [{path: g => g.rect(-1.6 * k, -38 * k, 3.2 * k, 46 * k), fill: MAT.wood}, {path: g => { g.moveTo(-5 * k, -38 * k); g.quadraticCurveTo(-8 * k, -48 * k, 0, -50 * k); g.quadraticCurveTo(8 * k, -48 * k, 5 * k, -38 * k); }, fill: MAT.woodD}, {path: g => D.ell(g, 0, -45 * k, 5.5 * k, 5.5 * k), fill: g => D.rad(g, -1.5 * k, -47 * k, 0.5, 6 * k, ['#FFFFFF', T.c])}], k); D.glow(g, 0, -45 * k, 15 * k, T.l, 0.7); },
  dagger(g, k, T){ P(g, [{path: g => { g.moveTo(-2 * k, -6 * k); g.lineTo(-2 * k, -20 * k); g.lineTo(0, -25 * k); g.lineTo(2 * k, -20 * k); g.lineTo(2 * k, -6 * k); g.closePath(); }, fill: g => D.lin(g, -2 * k, 0, 2 * k, 0, ['#FFFFFF', '#9AA3B2'])}, {path: g => D.rr(g, -5 * k, -7 * k, 10 * k, 2.8 * k, 1.2 * k), fill: '#2B2D42'}, {path: g => g.rect(-1.4 * k, -4 * k, 2.8 * k, 6 * k), fill: '#2B2D42'}], k); },
  crook(g, k, T){ g.save(); g.lineCap = 'round'; const path = q => { q.beginPath(); q.moveTo(0, 8 * k); q.lineTo(0, -38 * k); q.arc(6 * k, -38 * k, 6 * k, Math.PI, Math.PI * 2.1); }; path(g); g.strokeStyle = RIM; g.lineWidth = 5.4 * k; g.stroke(); path(g); g.strokeStyle = MAT.wood; g.lineWidth = 3 * k; g.stroke(); g.restore();
    P(g, [{path: g => D.ell(g, 0, -26 * k, 3.5 * k, 3.5 * k), fill: T.c}], k); },
  bell(g, k, T){ P(g, [{path: g => g.rect(-1.4 * k, -14 * k, 2.8 * k, 16 * k), fill: '#FFFFFF'}, {path: g => { g.moveTo(-9 * k, -14 * k); g.quadraticCurveTo(-9 * k, -32 * k, 0, -32 * k); g.quadraticCurveTo(9 * k, -32 * k, 9 * k, -14 * k); g.closePath(); }, fill: g => D.lin(g, -9 * k, 0, 9 * k, 0, ['#FFF3A8', '#FFC21A'])}], k); D.glow(g, 0, -24 * k, 16 * k, '#FFE98A', 0.55); },
  bone(g, k, T){ P(g, [{path: g => { g.rect(-2.2 * k, -28 * k, 4.4 * k, 32 * k); }, fill: '#FFF3DC'}, {path: g => { D.ell(g, -3.5 * k, -31 * k, 4 * k, 4 * k); }, fill: '#FFF3DC'}, {path: g => { D.ell(g, 3.5 * k, -31 * k, 4 * k, 4 * k); }, fill: '#FFF3DC'}], k); },
};
const BODY = {
  shield(g, k, T, look){ const x = -13 * k, y = -30 * k, r = 11 * k;   // round shield on the arm in front of the body
    const face = look === 'kitchen' ? ['#FFFFFF', '#B7BCC6'] : look === 'robot' ? ['#E6EAF0', '#8E97A6'] : look === 'dino' ? ['#9BE07A', '#4E9A3A'] : [T.l, T.c];
    P(g, [{path: g => D.ell(g, x, y, r, r), fill: g => D.rad(g, x - 3 * k, y - 4 * k, 1, r, face)}], k);
    if(look === 'robot'){ g.strokeStyle = '#5D6675'; g.lineWidth = 2.2 * k; g.beginPath(); for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4; g.moveTo(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45); g.lineTo(x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85); } g.stroke(); g.fillStyle = T.c; g.beginPath(); g.arc(x, y, 3.5 * k, 0, 7); g.fill(); }
    else if(look === 'kitchen'){ g.fillStyle = '#2B2D42'; g.beginPath(); D.ell(g, x, y, 3 * k, 2 * k); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.15)'; g.lineWidth = 1 * k; g.beginPath(); g.arc(x, y, r * 0.7, 0, 7); g.stroke(); }
    else if(look === 'dino'){ g.fillStyle = '#E8F7C8'; [[-3, -3], [3, 1], [-1, 5]].forEach(p => { g.beginPath(); g.arc(x + p[0] * k, y + p[1] * k, 2 * k, 0, 7); g.fill(); }); }
    else { g.fillStyle = '#FFFFFF'; g.beginPath(); D.star(g, x, y, 5.5 * k, 2.4 * k, 5); g.fill(); } },
  wagon(g, k, T){ // a toy wagon round the legs: the unit stands IN it
    P(g, [{path: g => { g.moveTo(-22 * k, -24 * k); g.lineTo(22 * k, -24 * k); g.lineTo(19 * k, -4 * k); g.lineTo(-19 * k, -4 * k); g.closePath(); }, fill: g => D.lin(g, 0, -24 * k, 0, -4 * k, ['#F2B26A', '#C9824A'])}], k);
    g.fillStyle = T.c; g.fillRect(-21 * k, -19 * k, 42 * k, 4 * k); g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 1 * k; [-8, 6].forEach(x => { g.beginPath(); g.moveTo(x * k, -24 * k); g.lineTo(x * k, -4 * k); g.stroke(); });
    [-13, 13].forEach(x => { P(g, [{path: g => D.ell(g, x * k, -2 * k, 6.5 * k, 6.5 * k), fill: '#5A3418'}], k); g.fillStyle = MAT.gold; g.beginPath(); g.arc(x * k, -2 * k, 2.2 * k, 0, 7); g.fill(); }); },
  sash(g, k, T){ g.save(); g.fillStyle = T.c; g.beginPath(); g.moveTo(-11 * k, -44 * k); g.lineTo(-6 * k, -45 * k); g.lineTo(11 * k, -20 * k); g.lineTo(6 * k, -18 * k); g.closePath(); g.fill(); g.restore(); },
  bag(g, k, T){ P(g, [{path: g => D.rr(g, 6 * k, -30 * k, 12 * k, 11 * k, 3 * k), fill: '#FFFFFF'}], k); g.fillStyle = '#FF4D6D'; g.fillRect(10.8 * k, -28 * k, 2.4 * k, 7 * k); g.fillRect(8.6 * k, -25.7 * k, 6.8 * k, 2.4 * k); },
  robe(g, k, T){ P(g, [{path: g => { g.moveTo(-12 * k, -40 * k); g.lineTo(12 * k, -40 * k); g.lineTo(16 * k, -2 * k); g.lineTo(-16 * k, -2 * k); g.closePath(); }, fill: g => D.lin(g, 0, -40 * k, 0, -2 * k, ['#8E6BF0', '#5A3EC8'])}], k); g.fillStyle = '#FFE070'; g.fillRect(-16 * k, -6 * k, 32 * k, 2.6 * k); g.fillStyle = T.c; g.fillRect(-12 * k, -24 * k, 24 * k, 3 * k); },
  scarf(g, k, T){ P(g, [{path: g => { g.moveTo(-12 * k, -46 * k); g.lineTo(12 * k, -46 * k); g.lineTo(12 * k, -40 * k); g.lineTo(-2 * k, -40 * k); g.lineTo(4 * k, -26 * k); g.lineTo(-3 * k, -26 * k); g.lineTo(-9 * k, -40 * k); g.lineTo(-12 * k, -40 * k); g.closePath(); }, fill: T.c}], k);
    P(g, [{path: g => { g.moveTo(-11 * k, -40 * k); g.lineTo(11 * k, -40 * k); g.lineTo(13 * k, -14 * k); g.lineTo(-13 * k, -14 * k); g.closePath(); }, fill: 'rgba(43,45,66,0.92)'}], k); },
  stole(g, k, T){ P(g, [{path: g => { g.moveTo(-12 * k, -40 * k); g.lineTo(12 * k, -40 * k); g.lineTo(15 * k, -2 * k); g.lineTo(-15 * k, -2 * k); g.closePath(); }, fill: g => D.lin(g, 0, -40 * k, 0, -2 * k, ['#FFFFFF', '#E6ECF5'])}], k);
    g.fillStyle = '#FFC21A'; g.fillRect(-6 * k, -40 * k, 3 * k, 36 * k); g.fillRect(3 * k, -40 * k, 3 * k, 36 * k); g.fillStyle = T.c; g.beginPath(); D.ell(g, 0, -30 * k, 3 * k, 3 * k); g.fill(); },
  apron(g, k, T){ P(g, [{path: g => { g.moveTo(-10 * k, -38 * k); g.lineTo(10 * k, -38 * k); g.lineTo(12 * k, -14 * k); g.lineTo(-12 * k, -14 * k); g.closePath(); }, fill: '#FFFFFF'}], k); g.fillStyle = T.c; g.fillRect(-12 * k, -18 * k, 24 * k, 3 * k); },
};
const BACK = {
  bricks(g, k, T){ [[-8, -40], [2, -40], [-3, -48]].forEach(p => P(g, [{path: g => D.rr(g, p[0] * k, p[1] * k, 10 * k, 7 * k, 1.5 * k), fill: MAT.brick}], k)); },
  quiver(g, k, T){ P(g, [{path: g => { g.save(); g.translate(8 * k, -44 * k); g.rotate(0.35); D.rr(g, -4 * k, -10 * k, 8 * k, 24 * k, 3 * k); g.restore(); }, fill: '#A8642E'}], k);
    g.fillStyle = T.c; [[10, -58], [14, -56], [6, -57]].forEach(p => { g.beginPath(); g.moveTo(p[0] * k, p[1] * k); g.lineTo((p[0] + 3) * k, (p[1] - 6) * k); g.lineTo((p[0] + 5) * k, (p[1] + 1) * k); g.fill(); }); },
  wings(g, k, T, o){ const fl = Math.sin((o.t || 0) * 14) * 0.25; [-1, 1].forEach(s => { g.save(); g.translate(s * 6 * k, -42 * k); g.rotate(s * (0.25 + fl)); g.scale(s, 1);
      P(g, [{path: g => { g.moveTo(0, 0); g.quadraticCurveTo(14 * k, -26 * k, 34 * k, -20 * k); g.quadraticCurveTo(28 * k, -12 * k, 30 * k, -6 * k); g.quadraticCurveTo(22 * k, -4 * k, 24 * k, 2 * k); g.quadraticCurveTo(12 * k, 4 * k, 0, 0); }, fill: g => D.lin(g, 0, 0, 30 * k, -16 * k, ['#FFFFFF', T.l])}], k); g.restore(); }); },
  cape(g, k, T){ P(g, [{path: g => { g.moveTo(-11 * k, -46 * k); g.lineTo(11 * k, -46 * k); g.quadraticCurveTo(20 * k, -20 * k, 17 * k, -6 * k); g.lineTo(-17 * k, -6 * k); g.quadraticCurveTo(-20 * k, -20 * k, -11 * k, -46 * k); }, fill: g => D.lin(g, 0, -46 * k, 0, -6 * k, [T.c, T.d])}], k); },
  cloak(g, k, T){ P(g, [{path: g => { g.moveTo(-12 * k, -46 * k); g.lineTo(12 * k, -46 * k); g.quadraticCurveTo(22 * k, -18 * k, 20 * k, -4 * k); g.lineTo(-20 * k, -4 * k); g.quadraticCurveTo(-22 * k, -18 * k, -12 * k, -46 * k); }, fill: g => D.lin(g, 0, -46 * k, 0, -4 * k, ['#3A3E58', '#24263A'])}], k); },
  pennant(g, k, T){ g.save(); g.strokeStyle = RIM; g.lineWidth = 2.6 * k; g.beginPath(); g.moveTo(9 * k, -36 * k); g.lineTo(9 * k, -76 * k); g.stroke(); g.strokeStyle = MAT.woodD; g.lineWidth = 1.4 * k; g.stroke(); g.restore();
    P(g, [{path: g => { g.moveTo(9 * k, -76 * k); g.lineTo(24 * k, -70 * k); g.lineTo(9 * k, -63 * k); g.closePath(); }, fill: T.c}], k); },
};
// role → costume (default Avatar Town) · a side look re-skins head / hand / shield only (R3 = all 12 sides)
const COSTUME = {
  worker: {head: 'hardhat', hand: 'hammer', back: 'bricks'},
  foot: {head: 'helm', hand: 'sword', body: 'shield'},
  spear: {head: 'cone', hand: 'spear', body: 'sash'},
  archer: {head: 'feather', hand: 'bow', back: 'quiver'},
  rider: {head: 'knight', hand: 'lance', ride: 9},
  flyer: {head: 'goggles', back: 'wings', fly: 16},
  healer: {head: 'nurse', hand: 'staff', body: 'bag'},
  siege: {head: 'bandana', hand: 'mallet', body: 'wagon'},
  mage: {head: 'wizhat', hand: 'orbstaff', body: 'robe'},
  spy: {head: 'hood', hand: 'dagger', body: 'scarf', back: 'cloak'},
  tamer: {head: 'beast', hand: 'crook', pet: 'emberpup'},
  saint: {head: 'halo', hand: 'bell', body: 'stole', aura: '#FFE98A'},
  hero: {head: 'crown', hand: 'sceptre', back: 'cape'},
};
const LOOKS = {kitchen: {foot: {head: 'toque', hand: 'spatula', body: 'shield'}, worker: {head: 'toque', hand: 'spatula', body: 'apron'}},
  robot: {foot: {head: 'bucket', hand: 'wrench', body: 'shield'}}, dino: {foot: {head: 'dino', hand: 'bone', body: 'shield'}}};
function costumeOf(role, look){ return Object.assign({}, COSTUME[role], (LOOKS[look] || {})[role] || {}); }
// the wear hook (chained, like Avateer's AvHero)
const prevWear = window.AK_WEAR;
window.AK_WEAR = function(g, slot, it, o){
  if(it && it.ar){ const T = TEAM[it.team] || TEAM.blue, k = o.k;
    if(slot === 'head' && HEAD[it.ar]) return HEAD[it.ar](g, k, o.hy, T);
    if(slot === 'hand' && HAND[it.ar]) return HAND[it.ar](g, k, T);
    if(slot === 'suit' && BODY[it.ar]) return BODY[it.ar](g, k, T, it.look);
    if(slot === 'back' && BACK[it.ar]) return BACK[it.ar](g, k, T, o);
    return; }
  if(prevWear) return prevWear(g, slot, it, o);
};
// who = {av, name} for drawAvatar / Iso.avatar — the player's avatar + the role costume
function mini(name, role, team, o){ o = o || {}; const C = costumeOf(role, o.look), a = Object.assign({}, o.av || defaultAvatar(name));
  a.cw = {}; const W = (slot, key) => { if(key) a.cw[slot] = {td: 1, ar: key, team, look: o.look}; };
  W('head', C.head); W('hand', C.hand); W('suit', C.body); W('back', C.back || (['hero', 'flyer', 'siege', 'mage', 'saint'].indexOf(role) < 0 ? 'pennant' : null));
  a.eq = Object.assign({}, a.eq || {}); delete a.eq.hand; delete a.eq.back; delete a.eq.pet; delete a.eq.trail; delete a.eq.ride;
  if(C.ride != null) a.eq.ride = {id: 'rideon', v: C.ride};
  if(C.head) a.acc = 0;
  return {av: a, name, dir: 1, role, team, fly: C.fly || 0, pet: C.pet || null, aura: C.aura || null}; }
// draw one unit on the ground: team ring + shadow, avatar (lifted when it flies)
function draw(g, who, x, y, k, o){ o = o || {}; const T = TEAM[who.team] || TEAM.blue, lift = (who.fly || 0) * k * (1 + Math.sin((o.t || 0) * 3) * 0.12);
  if(o.ring !== false){ g.save(); g.lineWidth = Math.max(1.5, 3 * k); g.strokeStyle = T.c; g.fillStyle = D.rgba(T.c, 0.22); g.beginPath(); D.ell(g, x, y, 17 * k, 7 * k); g.fill(); g.stroke(); g.restore(); }
  if(who.aura){ g.save(); g.lineWidth = Math.max(1, 2 * k); g.setLineDash([5 * k, 4 * k]); g.strokeStyle = D.rgba('#FFC21A', 0.9); g.fillStyle = D.rgba(who.aura, 0.25); g.beginPath(); D.ell(g, x, y, 34 * k, 14 * k); g.fill(); g.stroke(); g.restore(); }
  // 🐾 a tamer walks with its tamed monster (CreatureKit — never our own monster art)
  if(who.pet && typeof Creatures !== 'undefined'){ const def = Creatures.get(who.pet); if(def) try { Creatures.drawFor(g, def, x - 30 * k * (o.dir || 1), y + 2 * k, 80 * k, {t: o.t || 0, face: (o.dir || 1) > 0 ? 'right' : 'left', pet: true}); } catch(e){} }
  if(lift){ g.save(); g.fillStyle = 'rgba(30,30,50,0.22)'; g.beginPath(); D.ell(g, x, y, 11 * k, 4.5 * k); g.fill(); g.restore(); }
  drawAvatar(g, {av: who.av, name: who.name, dir: o.dir || 1, walkT: o.walkT}, x, y - lift, k, {t: o.t || 0, still: !o.walkT, pose: o.pose}); }
window.ARMini = {TEAM, ROLES, RK, COSTUME, LOOKS, mini, draw, costumeOf};
})();

