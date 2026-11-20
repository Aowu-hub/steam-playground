
/* ================= 🎨 AVATEER R0 PAINTERS (draft) — copied from Test Harness/avateer/src (01_draw · 04_world · 09_archipelago · 03_pets), R1 replaces them with IsoProps + its own files ================= */
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

/* 🧳 Avateer — 🇹🇭 Elephant Jungle: monsters, landmarks, props + the IsoKit island (av-r0a draft).
   Every painter: (g, x, y, k, t) → feet / ground point at (x, y), k = scale (1 ≈ IsoKit zoom 1). Facing: monsters face LEFT (toward the party). */
(function(){
'use strict';
const D = AVD, TAU = Math.PI * 2, RIM = '#2A1C14';
function eye(g, x, y, r, o){ o = o || {}; g.fillStyle = '#fff'; g.beginPath(); D.ell(g, x, y, r, r * 1.1); g.fill(); g.fillStyle = o.pupil || RIM; g.beginPath(); D.ell(g, x - r * 0.2, y + r * 0.1, r * 0.64, r * 0.74); g.fill(); g.fillStyle = '#fff'; g.beginPath(); D.ell(g, x - r * 0.38, y - r * 0.3, r * 0.24, r * 0.24); g.fill(); }
function shadow(g, x, y, rx, a){ g.fillStyle = 'rgba(30,40,20,' + (a || 0.22) + ')'; g.beginPath(); D.ell(g, x, y, rx, rx * 0.36); g.fill(); }
function leg(g, x, y, w, h){ D.rr(g, x - w / 2, y - h, w, h, w / 2); }

/* ---------------- 👾 friendly monsters (face left) ---------------- */
const MON = {
  mangobble: {name: 'Mangobble', el: '🌱', hp: 30, draw(g, k, t){ const b = Math.sin(t * 4) * 1.2 * k, rw = 1.8 * k;
    D.piece(g, [{path: g => { g.moveTo(-18 * k, 0); g.bezierCurveTo(-22 * k, -22 * k + b, -6 * k, -34 * k + b, 6 * k, -30 * k + b); g.bezierCurveTo(20 * k, -26 * k + b, 22 * k, -6 * k, 16 * k, 0); g.closePath(); }, fill: g => D.lin(g, -18 * k, -30 * k, 16 * k, 0, ['#FFE14D', '#FFB21A', '#FF7A2E'])},
      {path: g => { g.moveTo(4 * k, -29 * k + b); g.quadraticCurveTo(14 * k, -42 * k + b, 22 * k, -38 * k + b); g.quadraticCurveTo(14 * k, -30 * k + b, 4 * k, -29 * k + b); }, fill: '#4CB13A'}], RIM, rw);
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); D.ell(g, -8 * k, -20 * k + b, 4 * k, 6 * k, 0.4); g.fill();
    eye(g, -8 * k, -14 * k + b, 3.2 * k); eye(g, 2 * k, -15 * k + b, 3.2 * k); g.strokeStyle = RIM; g.lineWidth = 1.4 * k; g.beginPath(); g.arc(-3 * k, -8 * k + b, 3 * k, 0.2, 2.9); g.stroke(); }},
  cococlaw: {name: 'Cococlaw', el: '🪨', hp: 40, draw(g, k, t){ const rw = 1.8 * k, w = Math.sin(t * 6) * 0.2;
    D.piece(g, [{path: g => { for(let i = 0; i < 3; i++){ g.moveTo((-14 + i * 6) * k, -6 * k); g.lineTo((-22 + i * 6) * k, 0); g.lineTo((-12 + i * 6) * k, -3 * k); g.moveTo((8 + i * 4) * k, -6 * k); g.lineTo((16 + i * 4) * k, 0); g.lineTo((10 + i * 4) * k, -3 * k); } }, fill: '#E2553A'},
      {path: g => { g.save(); g.translate(-18 * k, -16 * k); g.rotate(-0.4 + w); D.ell(g, -6 * k, 0, 7 * k, 5 * k); g.restore(); }, fill: '#FF6A4A'},
      {path: g => D.ell(g, 0, -14 * k, 17 * k, 13 * k), fill: g => D.rad(g, -5 * k, -20 * k, 2 * k, 18 * k, ['#B07842', '#7A4A22', '#5A3418'])}], RIM, rw);
    g.strokeStyle = 'rgba(40,20,10,0.5)'; g.lineWidth = 1.2 * k; [[-8, -24], [0, -26], [8, -23]].forEach(p => { g.beginPath(); g.moveTo(p[0] * k, p[1] * k); g.lineTo(p[0] * k + 1, (p[1] + 6) * k); g.stroke(); });
    eye(g, -10 * k, -26 * k, 3 * k); eye(g, -2 * k, -27 * k, 3 * k); g.fillStyle = '#FFF3E0'; g.beginPath(); D.ell(g, -4 * k, -10 * k, 8 * k, 4 * k); g.fill(); }},
  toucanoo: {name: 'Toucanoo', el: '🌪️', hp: 34, draw(g, k, t){ const rw = 1.8 * k, f = Math.sin(t * 8) * 0.3, hov = Math.sin(t * 3) * 2 * k - 10 * k;
    g.save(); g.translate(0, hov);
    D.piece(g, [{path: g => { g.moveTo(6 * k, -18 * k); g.quadraticCurveTo(22 * k, -22 * k - f * 10 * k, 24 * k, -8 * k); g.quadraticCurveTo(16 * k, -10 * k, 6 * k, -10 * k); g.closePath(); }, fill: '#2B2D42'},
      {path: g => { g.moveTo(8 * k, -2 * k); g.lineTo(18 * k, 6 * k); g.lineTo(12 * k, -2 * k); g.closePath(); }, fill: '#2B2D42'},
      {path: g => D.ell(g, 0, -14 * k, 12 * k, 14 * k), fill: '#2B2D42'},
      {path: g => { g.moveTo(-8 * k, -26 * k); g.quadraticCurveTo(-34 * k, -30 * k, -34 * k, -20 * k); g.quadraticCurveTo(-28 * k, -14 * k, -8 * k, -18 * k); g.closePath(); }, fill: g => D.lin(g, -34 * k, 0, -8 * k, 0, ['#E63946', '#FF9F1C', '#FFD23F'])}], RIM, rw);
    g.fillStyle = '#FFF3B0'; g.beginPath(); D.ell(g, -4 * k, -12 * k, 7 * k, 8 * k); g.fill(); g.fillStyle = '#4CC9F0'; g.beginPath(); D.ell(g, -5 * k, -24 * k, 4 * k, 4 * k); g.fill(); eye(g, -5 * k, -24 * k, 2.6 * k);
    g.restore(); }},
  hissvine: {name: 'Hissvine', el: '🌱', hp: 90, mini: true, draw(g, k, t){ const rw = 2 * k, s = Math.sin(t * 3) * 2 * k;
    D.piece(g, [{path: g => { g.moveTo(26 * k, 0); g.bezierCurveTo(10 * k, -4 * k, 20 * k, -16 * k, 6 * k, -18 * k); g.bezierCurveTo(-8 * k, -20 * k, -2 * k, -40 * k + s, -12 * k, -48 * k + s); g.lineTo(-4 * k, -52 * k + s);
        g.bezierCurveTo(8 * k, -42 * k + s, 4 * k, -26 * k, 16 * k, -24 * k); g.bezierCurveTo(32 * k, -20 * k, 26 * k, -6 * k, 34 * k, 0); g.closePath(); }, fill: g => D.lin(g, 0, -50 * k, 0, 0, ['#9BE07A', '#4CB13A', '#2E7A26'])},
      {path: g => { g.moveTo(-8 * k, -50 * k + s); g.bezierCurveTo(-26 * k, -66 * k + s, -6 * k, -76 * k + s, 4 * k, -64 * k + s); g.bezierCurveTo(10 * k, -58 * k + s, 2 * k, -50 * k + s, -8 * k, -50 * k + s); }, fill: '#6FCB4A'},
      {path: g => D.ell(g, -16 * k, -54 * k + s, 10 * k, 7 * k, -0.2), fill: '#5DB43C'}], RIM, rw);
    eye(g, -20 * k, -57 * k + s, 3 * k, {pupil: '#7A2A12'}); g.strokeStyle = '#E63946'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(-26 * k, -52 * k + s); g.lineTo(-32 * k, -51 * k + s); g.lineTo(-34 * k, -54 * k + s); g.moveTo(-32 * k, -51 * k + s); g.lineTo(-34 * k, -48 * k + s); g.stroke();
    g.fillStyle = '#FF8FB0'; g.beginPath(); D.star(g, -2 * k, -66 * k + s, 4 * k, 2 * k, 5); g.fill(); }},
  grandyak: {name: 'Grand Yak', el: '🪨', hp: 300, boss: true, draw(g, k, t){ const rw = 2.4 * k, br = Math.sin(t * 2) * 1.5 * k;
    D.piece(g, [
      {path: g => { leg(g, -14 * k, 0, 16 * k, 30 * k); leg(g, 14 * k, 0, 16 * k, 30 * k); }, fill: '#2E7A5A'},
      {path: g => { g.moveTo(-30 * k, -26 * k); g.quadraticCurveTo(-34 * k, -70 * k + br, 0, -74 * k + br); g.quadraticCurveTo(34 * k, -70 * k + br, 30 * k, -26 * k); g.closePath(); }, fill: g => D.lin(g, 0, -74 * k, 0, -26 * k, ['#5BC48E', '#2E9A6A', '#1F6E4C'])},
      {path: g => { D.rr(g, -32 * k, -34 * k, 64 * k, 10 * k, 4 * k); }, fill: g => D.lin(g, 0, -34 * k, 0, -24 * k, ['#FFE58A', '#C98A00'])},
      {path: g => { g.save(); g.translate(-30 * k, -60 * k + br); g.rotate(-0.5); D.rr(g, -6 * k, 0, 12 * k, 30 * k, 6 * k); g.restore(); }, fill: '#2E9A6A'},
      {path: g => { g.moveTo(-50 * k, -100 * k); g.lineTo(-44 * k, -104 * k); g.lineTo(-30 * k, -60 * k); g.lineTo(-36 * k, -56 * k); g.closePath(); D.ell(g, -50 * k, -104 * k, 9 * k, 9 * k); }, fill: '#B07842'},
      {path: g => D.ell(g, 0, -90 * k + br, 20 * k, 18 * k), fill: g => D.lin(g, 0, -108 * k, 0, -72 * k, ['#6FD39E', '#2E9A6A'])},
      {path: g => { g.moveTo(-16 * k, -102 * k + br); for(let i = 0; i < 5; i++){ const x = -16 + i * 8; g.lineTo((x + 4) * k, (-112 - (i === 2 ? 26 : i % 2 ? 12 : 8)) * k + br); g.lineTo((x + 8) * k, -102 * k + br); } g.closePath(); }, fill: g => D.lin(g, 0, -138 * k, 0, -100 * k, ['#FFF0B0', '#FFC21A', '#B07800'])}], RIM, rw);
    eye(g, -8 * k, -92 * k + br, 4 * k, {pupil: '#7A2A12'}); eye(g, 6 * k, -92 * k + br, 4 * k, {pupil: '#7A2A12'});
    g.strokeStyle = RIM; g.lineWidth = 2.4 * k; g.beginPath(); g.moveTo(-14 * k, -99 * k + br); g.lineTo(-3 * k, -97 * k + br); g.moveTo(12 * k, -99 * k + br); g.lineTo(2 * k, -97 * k + br); g.stroke();
    g.fillStyle = '#7A2A12'; g.beginPath(); g.moveTo(-10 * k, -80 * k + br); g.quadraticCurveTo(0, -74 * k + br, 10 * k, -80 * k + br); g.lineTo(8 * k, -78 * k + br); g.quadraticCurveTo(0, -76 * k + br, -8 * k, -78 * k + br); g.fill();
    g.fillStyle = '#FFF'; [-9, 9].forEach(x => { g.beginPath(); g.moveTo(x * k, -80 * k + br); g.lineTo((x + (x < 0 ? 2 : -2)) * k, -87 * k + br); g.lineTo((x + (x < 0 ? 4 : -4)) * k, -79 * k + br); g.fill(); });
    g.fillStyle = '#E63946'; g.beginPath(); D.ell(g, 0, -29 * k, 4 * k, 4 * k); g.fill(); }},
};
function monster(g, id, x, y, k, t, o){ o = o || {}; const M = MON[id]; shadow(g, x, y, 18 * k * (M.boss ? 2 : M.mini ? 1.4 : 1)); g.save(); g.translate(x, y); if(o.faceRight) g.scale(-1, 1); M.draw(g, k, t || 0); g.restore();
  if(o.warn){ D.glow(g, x, y - 40 * k, 34 * k, '#FF5A1A', 0.35); D.txt(g, '⚠️', x, y - 76 * k, {size: 16 * k, align: 'center'}); } }

/* ---------------- 🌴 props + landmarks ---------------- */
function palm(g, x, y, k, t, s){ s = s || 1; const sw = Math.sin(t * 1.5 + x) * 0.05; shadow(g, x, y, 12 * k * s, 0.18); g.save(); g.translate(x, y); g.scale(k * s, k * s);
  D.piece(g, [{path: g => { g.moveTo(-3, 0); g.quadraticCurveTo(-6, -30, 4, -58); g.lineTo(9, -57); g.quadraticCurveTo(0, -30, 3, 0); g.closePath(); }, fill: g => D.lin(g, -4, 0, 6, 0, ['#C99257', '#8A5A2B'])}], RIM, 1.4);
  g.translate(6, -58); g.rotate(sw);
  for(let i = 0; i < 6; i++){ const a = -Math.PI / 2 + (i - 2.5) * 0.62; D.piece(g, [{path: g => { g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a - 0.3) * 18, Math.sin(a - 0.3) * 18 - 6, Math.cos(a) * 30, Math.sin(a) * 26 + 8); g.quadraticCurveTo(Math.cos(a + 0.3) * 16, Math.sin(a + 0.3) * 16, 0, 0); }, fill: i % 2 ? '#4CB13A' : '#5DC94A'}], RIM, 1.2); }
  g.fillStyle = '#7A4A22'; [[-2, 3], [3, 4], [0, 6]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 3, 3); g.fill(); }); g.restore(); }
function jtree(g, x, y, k, t, s, hue){ s = s || 1; shadow(g, x, y, 20 * k * s, 0.2); g.save(); g.translate(x, y); g.scale(k * s, k * s); const c = hue || ['#3FA34D', '#2E8540', '#5CC062'];
  D.piece(g, [{path: g => { g.moveTo(-5, 0); g.lineTo(-3, -26); g.lineTo(3, -26); g.lineTo(5, 0); g.closePath(); g.moveTo(-5, 0); g.lineTo(-10, 2); g.lineTo(-4, -4); g.moveTo(5, 0); g.lineTo(10, 2); g.lineTo(4, -4); }, fill: '#8A5A2B'},
    {path: g => { [[-12, -32, 13], [10, -34, 13], [0, -46, 15], [-6, -26, 11], [8, -24, 10]].forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }); }, fill: g => D.rad(g, -4, -48, 3, 34, [c[2], c[0], c[1]])}], RIM, 1.4);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); D.ell(g, -4, -50, 8, 4, -0.3); g.fill(); g.restore(); }
function banana(g, x, y, k, t){ shadow(g, x, y, 10 * k, 0.16); g.save(); g.translate(x, y); g.scale(k, k);
  for(let i = 0; i < 5; i++){ const a = -Math.PI / 2 + (i - 2) * 0.55; D.piece(g, [{path: g => { g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * 10 - 6, Math.sin(a) * 24, Math.cos(a) * 18, Math.sin(a) * 30); g.quadraticCurveTo(Math.cos(a) * 12 + 6, Math.sin(a) * 18, 0, 0); }, fill: i % 2 ? '#7FD35A' : '#5DC94A'}], RIM, 1.2); }
  g.restore(); }
function bamboo(g, x, y, k){ shadow(g, x, y, 9 * k, 0.16); g.save(); g.translate(x, y); g.scale(k, k);
  [[-5, 46], [1, 58], [6, 40]].forEach(b => { D.piece(g, [{path: g => D.rr(g, b[0] - 2.5, -b[1], 5, b[1], 2), fill: '#8FCB4A'}], RIM, 1.1); g.strokeStyle = '#5E8A2E'; g.lineWidth = 1; for(let y = -8; y > -b[1]; y -= 10){ g.beginPath(); g.moveTo(b[0] - 2.5, y); g.lineTo(b[0] + 2.5, y); g.stroke(); } g.fillStyle = '#6FCB4A'; g.beginPath(); D.ell(g, b[0] + 5, -b[1] + 4, 5, 2, -0.5); g.fill(); });
  g.restore(); }
function flowers(g, x, y, k, seed){ const r = D.rnd(seed || 7); for(let i = 0; i < 4; i++){ const xx = x + (r() - 0.5) * 18 * k, yy = y + (r() - 0.5) * 8 * k; g.fillStyle = ['#FF8FB0', '#FFD23F', '#FFFFFF', '#FF7A5A'][i % 4]; g.beginPath(); for(let p = 0; p < 5; p++){ const a = p * TAU / 5; D.ell(g, xx + Math.cos(a) * 1.8 * k, yy + Math.sin(a) * 1.2 * k, 1.4 * k, 1.1 * k); } g.fill(); } }
// 🐘 the region's twist: a giant elephant carrying a walking temple
function elephantTemple(g, x, y, k, t){ const step = Math.sin(t * 1.6) * 2 * k; shadow(g, x, y, 62 * k, 0.24); g.save(); g.translate(x, y); g.scale(k, k);
  const grey = g => D.lin(g, 0, -90, 0, 0, ['#C9C3D6', '#9C95AE', '#7A7392']);
  D.piece(g, [
    {path: g => { leg(g, -36, 0, 18, 40); leg(g, -14, 0, 18, 38); leg(g, 18, 0, 18, 40); leg(g, 38, 0, 18, 38); }, fill: '#8E87A2'},
    {path: g => { g.moveTo(-54, -36); g.quadraticCurveTo(-60, -84, -10, -86); g.quadraticCurveTo(44, -88, 52, -48); g.quadraticCurveTo(50, -28, 30, -26); g.lineTo(-40, -26); g.quadraticCurveTo(-54, -26, -54, -36); g.closePath(); }, fill: grey},
    {path: g => { g.moveTo(-56, -50); g.quadraticCurveTo(-70, -54, -62, -36); }, fill: '#8E87A2', closedFill: false},
    {path: g => { D.ell(g, 58, -64, 20, 22); }, fill: grey},
    {path: g => { g.moveTo(70, -56); g.bezierCurveTo(84, -44, 80, -20, 88, -8); g.lineTo(80, -6); g.bezierCurveTo(72, -18, 72, -36, 62, -48); g.closePath(); }, fill: grey},
    {path: g => { g.moveTo(44, -80); g.quadraticCurveTo(30, -60, 42, -40); g.quadraticCurveTo(56, -46, 54, -70); g.closePath(); }, fill: '#B5AEC6'},
    // saddle cloth
    {path: g => { g.moveTo(-34, -84); g.lineTo(28, -86); g.lineTo(30, -60); g.quadraticCurveTo(0, -52, -32, -60); g.closePath(); }, fill: g => D.lin(g, 0, -86, 0, -54, ['#E63946', '#B5172A'])},
    // temple: base · two-tier roof · spire
    {path: g => { D.rr(g, -26, -112, 48, 28, 3); }, fill: '#FFF3DC'},
    {path: g => { g.moveTo(-36, -110); g.lineTo(-2, -134); g.lineTo(32, -110); g.lineTo(26, -106); g.lineTo(-30, -106); g.closePath(); }, fill: g => D.lin(g, 0, -134, 0, -106, ['#FF7A4A', '#C0392B'])},
    {path: g => { g.moveTo(-26, -128); g.lineTo(-2, -148); g.lineTo(22, -128); g.lineTo(18, -124); g.lineTo(-22, -124); g.closePath(); }, fill: g => D.lin(g, 0, -148, 0, -124, ['#4CB8A8', '#1F7A6E'])},
    {path: g => { g.moveTo(-5, -146); g.lineTo(-2, -172); g.lineTo(1, -146); g.closePath(); }, fill: '#FFC21A'}], RIM, 2);
  // chofa finials + gold trims
  g.fillStyle = '#FFC21A'; [[-36, -110], [32, -110], [-26, -128], [22, -128]].forEach((p, i) => { g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo(p[0] + (i % 2 ? 6 : -6), p[1] - 8, p[0] + (i % 2 ? 2 : -2), p[1] - 12); g.lineTo(p[0], p[1] - 4); g.fill(); });
  g.fillStyle = '#7A4A22'; D.rr(g, -8, -104, 12, 20, 6); g.fill(); g.fillStyle = '#FFC21A'; [[-20, -100], [14, -100]].forEach(p => { g.beginPath(); D.rr(g, p[0], p[1], 6, 10, 3); g.fill(); });
  g.strokeStyle = '#FFC21A'; g.lineWidth = 2; g.beginPath(); g.moveTo(-34, -64); g.quadraticCurveTo(0, -56, 30, -64); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(66, -50); g.quadraticCurveTo(80, -48, 82, -38); g.quadraticCurveTo(74, -44, 64, -44); g.fill();
  eye(g, 64, -68, 3); g.restore(); }
function inn(g, x, y, k, t){ shadow(g, x, y, 34 * k, 0.22); g.save(); g.translate(x, y); g.scale(k, k);
  D.piece(g, [{path: g => { g.moveTo(-28, 0); g.lineTo(-28, -30); g.lineTo(0, -16); g.lineTo(0, 14); g.closePath(); }, fill: '#C99257'}, {path: g => { g.moveTo(0, 14); g.lineTo(0, -16); g.lineTo(30, -30); g.lineTo(30, 0); g.closePath(); }, fill: '#A87442'},
    {path: g => { g.moveTo(-36, -26); g.lineTo(0, -64); g.lineTo(38, -26); g.lineTo(0, -10); g.closePath(); }, fill: g => D.lin(g, 0, -64, 0, -10, ['#F2D27A', '#D4A84A', '#B0862E'])}], RIM, 1.6);
  g.strokeStyle = 'rgba(120,80,20,0.5)'; g.lineWidth = 1; for(let i = -3; i <= 3; i++){ g.beginPath(); g.moveTo(i * 9, -54 + Math.abs(i) * 6); g.lineTo(i * 12, -18 - Math.abs(i) * 2); g.stroke(); }
  g.fillStyle = '#5A3418'; g.beginPath(); g.moveTo(8, 8); g.lineTo(8, -10); g.lineTo(20, -16); g.lineTo(20, 2); g.closePath(); g.fill();
  g.fillStyle = '#FFE58A'; g.beginPath(); g.moveTo(-20, -6); g.lineTo(-20, -18); g.lineTo(-10, -13); g.lineTo(-10, -2); g.closePath(); g.fill();
  D.glow(g, -26, -34, 14, '#FFD23F', 0.5); g.fillStyle = '#FFB23D'; g.beginPath(); D.ell(g, -30, -30, 3.4, 4.4); g.fill();
  D.card(g, -2, -82, 30, 16, {fill: '#fff', r: 5, shadow: false, line: RIM, lw: 1.4}); D.txt(g, '🛏️', 13, -69, {size: 11, align: 'center'}); g.restore(); }
function shop(g, x, y, k, t){ shadow(g, x, y, 30 * k, 0.22); g.save(); g.translate(x, y); g.scale(k, k);
  D.piece(g, [{path: g => D.rr(g, -26, -22, 52, 22, 3), fill: '#C99257'}, {path: g => { D.rr(g, -24, -50, 4, 30, 2); D.rr(g, 20, -50, 4, 30, 2); }, fill: '#8A5A2B'},
    {path: g => { g.moveTo(-32, -44); g.lineTo(32, -44); g.lineTo(26, -60); g.lineTo(-26, -60); g.closePath(); }, fill: '#fff'}], RIM, 1.6);
  for(let i = 0; i < 6; i++){ g.fillStyle = i % 2 ? '#fff' : '#2EC4B6'; g.beginPath(); g.moveTo(-32 + i * 10.6, -44); g.lineTo(-26 + i * 8.6, -60); g.lineTo(-26 + (i + 1) * 8.6, -60); g.lineTo(-32 + (i + 1) * 10.6, -44); g.fill(); }
  g.fillStyle = '#2EC4B6'; for(let i = 0; i < 6; i++){ g.beginPath(); g.arc(-27 + i * 10.6, -44, 5.3, 0, Math.PI); g.fill(); }
  D.txt(g, '🍎🧪🛡️', 0, -27, {size: 11, align: 'center'}); g.restore(); }
function stopPad(g, x, y, k, n, o){ o = o || {}; g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); D.ell(g, 0, 3, 18, 7); g.fill();
  g.fillStyle = o.done ? '#FFE58A' : '#E8E1D2'; g.strokeStyle = RIM; g.lineWidth = 1.6; g.beginPath(); D.ell(g, 0, 0, 16, 6.5); g.fill(); g.stroke();
  g.fillStyle = '#8A5A2B'; g.fillRect(-1.5, -34, 3, 34);
  D.piece(g, [{path: g => { g.moveTo(1.5, -34); g.lineTo(22, -29); g.lineTo(1.5, -22); g.closePath(); }, fill: o.done ? '#4CC764' : o.here ? '#FF5A5A' : '#3A8DFF'}], RIM, 1.2);
  D.txt(g, String(n), 9, -25, {size: 9, align: 'center', col: '#fff'}); if(o.done) D.txt(g, '⭐', 0, 2, {size: 9, align: 'center', base: 'middle'}); g.restore(); }
function bossTemple(g, x, y, k, t){ shadow(g, x, y, 56 * k, 0.26); g.save(); g.translate(x, y); g.scale(k, k); const st = g => D.lin(g, 0, -110, 0, 0, ['#D8CCB0', '#AFA184', '#7E7058']);
  D.piece(g, [{path: g => { g.moveTo(-54, 0); g.lineTo(-48, -20); g.lineTo(48, -20); g.lineTo(54, 0); g.closePath(); }, fill: st},
    {path: g => { g.moveTo(-40, -20); g.lineTo(-34, -42); g.lineTo(34, -42); g.lineTo(40, -20); g.closePath(); }, fill: st},
    {path: g => { g.moveTo(-26, -42); g.quadraticCurveTo(-30, -100, 0, -126); g.quadraticCurveTo(30, -100, 26, -42); g.closePath(); }, fill: st},
    {path: g => { g.moveTo(-3, -124); g.lineTo(0, -146); g.lineTo(3, -124); g.closePath(); }, fill: '#FFC21A'}], RIM, 2);
  g.strokeStyle = 'rgba(80,60,40,0.45)'; g.lineWidth = 1.4; for(let y = -56; y > -112; y -= 10){ const w = 26 - (-56 - y) * 0.36; g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = '#2B1D14'; g.beginPath(); g.moveTo(-10, -20); g.lineTo(-10, -32); g.quadraticCurveTo(0, -42, 10, -32); g.lineTo(10, -20); g.closePath(); g.fill();
  D.glow(g, 0, -28, 22, '#9B5DE5', 0.45); g.fillStyle = '#4CB13A'; [[-44, -8], [40, -14], [-20, -60], [22, -80]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 6, 3, 0.4); g.fill(); });
  D.txt(g, '👑', 0, -152, {size: 16, align: 'center'}); g.restore(); }
function chest(g, x, y, k, t, o){ o = o || {}; shadow(g, x, y, 12 * k, 0.2); g.save(); g.translate(x, y); g.scale(k, k);
  D.piece(g, [{path: g => D.rr(g, -12, -14, 24, 14, 2), fill: '#B07842'}, {path: g => { g.moveTo(-12, -14); g.quadraticCurveTo(-12, -24, 0, -24); g.quadraticCurveTo(12, -24, 12, -14); g.closePath(); }, fill: '#C99257'}], RIM, 1.4);
  g.fillStyle = '#FFC21A'; g.fillRect(-12, -15, 24, 2.5); g.fillRect(-2.5, -18, 5, 8); if(o.brain){ D.glow(g, 0, -16, 16, '#9B5DE5', 0.5); D.txt(g, '🧩', 0, -28, {size: 12, align: 'center'}); } g.restore(); }
function campFlag(g, x, y, k, side){ g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#5A3418'; g.fillRect(-1.5, -40, 3, 40);
  const c = side === 'raptor' ? ['#E2553A', '🦖'] : ['#7D8AA0', '🤖']; D.piece(g, [{path: g => { g.moveTo(1.5, -40); g.lineTo(26, -36); g.lineTo(20, -30); g.lineTo(26, -24); g.lineTo(1.5, -26); g.closePath(); }, fill: c[0]}], RIM, 1.2);
  D.txt(g, c[1], 12, -29, {size: 9, align: 'center'}); g.restore(); }

/* ---------------- 🏝️ the island (IsoKit) ---------------- */
if(window.Iso && !Iso.THEMES || (window.Iso && Iso.THEMES && !Iso.THEMES.jungle)){
  try { Iso.addTheme('jungle', {base: '#8A5A36', baseDark: '#5E3C22', bg: ['#BDEBFF', '#FFF6DE'], tile: {grass: {top: '#7BC95A', top2: '#6BBB4C', lip: '#5CA942', side: '#8A5A36'}, flower: {top: '#82CE60', top2: '#73C152', lip: '#5CA942', side: '#8A5A36'},
    path: {top: '#E2B07A', top2: '#D6A26A', side: '#A8754A', deco: 'pebble'}, water: {top: '#4FC6D8', top2: '#3FB8CC', side: '#2F8FA8'}, sand: {top: '#F3D99A', top2: '#EACD88', side: '#C9A46A'}, stone: {top: '#BDB6A2', top2: '#ADA692', side: '#857E6C'}}}, 'meadow'); } catch(e){}
}
// a hand-designed 26 × 26 island: river, 5 stops on a path, inn, shop, boss temple at the top, two faction camps
function jungleIsland(){
  const N = 26, cx = 12.5, cy = 12.5, R = D.rnd(42);
  const noise = (i, j) => Math.sin(i * 0.9) * 0.7 + Math.cos(j * 0.7) * 0.6 + Math.sin((i + j) * 0.45) * 0.8;
  const pathPts = [[20, 21], [17, 18], [14, 17], [11, 16], [9, 13], [8, 10], [10, 7], [13, 6], [15, 4]];
  const onPath = (i, j) => { for(let a = 0; a < pathPts.length - 1; a++){ const [x0, y0] = pathPts[a], [x1, y1] = pathPts[a + 1], dx = x1 - x0, dy = y1 - y0, L = dx * dx + dy * dy, u = Math.max(0, Math.min(1, ((i - x0) * dx + (j - y0) * dy) / L)), px = x0 + u * dx - i, py = y0 + u * dy - j; if(px * px + py * py < 0.7) return true; } return false; };
  const river = (i, j) => { const x = 4 + j * 0.22 + Math.sin(j * 0.5) * 1.6; return Math.abs(i - x - (j > 14 ? (j - 14) * 0.5 : 0)) < 0.9 && j > 2; };
  const m = Iso.map({w: N, h: N, theme: 'jungle', base: 2.4, cell: (i, j) => { const d = Math.hypot((i - cx) / 11.8, (j - cy) / 11.8) + noise(i, j) * 0.035;
    if(d > 1) return {t: 'void'}; const edge = {};
    if(onPath(i, j)) return Object.assign({t: 'path', h: (j < 9 ? 1 : 0)}, edge);
    if(river(i, j)) return Object.assign({t: 'water'}, edge);
    if(d > 0.86) return Object.assign({t: 'sand'}, edge);
    if(j < 9 && i > 9 && i < 20) return {t: R() < 0.2 ? 'stone' : 'grass', h: 1};
    return Object.assign({t: R() < 0.12 ? 'flower' : 'grass'}, edge); }});
  return {m, pathPts};
}
// 🪨 the floating island's rocky underside + roots + a waterfall where the river leaves the island (drawn BEHIND the IsoKit canvas)
function underside(g, v, m, ox, oy, t, o){
  o = o || {}; const solid = (i, j) => !m.isVoid(i, j) && (m.get(i, j) || {}).t !== 'wood';
  if(!o.pts){ const seen = new Set(), comps = []; for(let j = 0; j < m.h; j++) for(let i = 0; i < m.w; i++){ const k = j * m.w + i; if(seen.has(k) || !solid(i, j)) continue; const st = [[i, j]], c = []; seen.add(k);
      while(st.length){ const [a, b] = st.pop(); c.push([a, b]); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const x = a + d[0], y = b + d[1], kk = y * m.w + x; if(x >= 0 && y >= 0 && x < m.w && y < m.h && !seen.has(kk) && solid(x, y)){ seen.add(kk); st.push([x, y]); } }); }
      if(c.length > 20) comps.push(c); }
    comps.forEach((c, n) => underside(g, v, m, ox, oy, t, {pts: c.map(q => v.toScreen(q[0] + 0.5, q[1] + 0.5, 0)), cells: c, seed: n + 3})); return; }
  const pts = o.pts;
  let L = pts[0], Rr = pts[0], yb = -1e9; pts.forEach(p => { if(p.x < L.x) L = p; if(p.x > Rr.x) Rr = p; yb = Math.max(yb, p.y); });
  const z = v.zoom, xl = ox + L.x - 20 * z, yl = oy + L.y + 30 * z, xr = ox + Rr.x + 20 * z, yr = oy + Rr.y + 30 * z, cx = (xl + xr) / 2, w = (xr - xl) / 2, top = Math.min(yl, yr), bot = oy + yb + w * 0.45, depth = bot - top;
  g.save();
  const rock = g => { g.moveTo(xl, yl); g.bezierCurveTo(xl + w * 0.05, yl + depth * 0.55, cx - w * 0.4, bot - depth * 0.12, cx - w * 0.06, bot); g.quadraticCurveTo(cx, bot + 14 * z, cx + w * 0.06, bot); g.bezierCurveTo(cx + w * 0.4, bot - depth * 0.12, xr - w * 0.05, yr + depth * 0.55, xr, yr); g.lineTo(cx, top - 200 * z); g.closePath(); };
  g.beginPath(); rock(g); g.fillStyle = D.lin(g, 0, top, 0, bot, ['#9A6B43', '#7A5034', '#5A3A24', '#3E281A']); g.fill();
  g.save(); g.beginPath(); rock(g); g.clip(); const r = D.rnd(9);
  for(let i = 0; i < 9; i++){ const y = top + depth * (0.18 + i * 0.09); g.strokeStyle = 'rgba(40,24,14,' + (0.12 + r() * 0.12) + ')'; g.lineWidth = 3 * z + r() * 4 * z; g.beginPath(); g.moveTo(cx - w, y + r() * 10); g.quadraticCurveTo(cx, y + 20 * z * (r() - 0.3), cx + w, y + r() * 10); g.stroke(); }
  for(let i = 0; i < 26; i++){ const x = cx + (r() - 0.5) * w * 1.6, y = top + depth * (0.1 + r() * 0.75); g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'; g.beginPath(); D.ell(g, x, y, (6 + r() * 14) * z, (4 + r() * 8) * z, r()); g.fill(); }
  g.restore();
  // hanging roots + vines
  const r2 = D.rnd(21); g.lineCap = 'round';
  for(let i = 0; i < 14; i++){ const x = cx + (r2() - 0.5) * w * 1.5, y = top + depth * 0.25 + Math.abs(r2() - 0.5) * 30 * z, L = (40 + r2() * 120) * z; g.strokeStyle = r2() < 0.5 ? '#4CB13A' : '#6B4A2A'; g.lineWidth = (2 + r2() * 2) * z; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 8 * z, y + L * 0.3, x - 8 * z, y + L * 0.6, x + 4 * z, y + L); g.stroke();
    if(g.strokeStyle === '#4cb13a'){ g.fillStyle = '#5DC94A'; for(let k = 1; k < 4; k++){ g.beginPath(); D.ell(g, x + (k % 2 ? 5 : -5) * z, y + L * k / 4, 4 * z, 2.2 * z, k); g.fill(); } } }
  // waterfall from the river mouth (bottom-left edge)
  let best = null; (o.cells || []).forEach(([i, j]) => { const c = m.get(i, j); if(!c || c.t !== 'water') return; const open = m.isVoid(i - 1, j) || m.isVoid(i, j + 1) || m.isVoid(i + 1, j + 1) || m.isVoid(i - 1, j + 1); if(open && (!best || i + j * 1.5 > best[0] + best[1] * 1.5)) best = [i, j]; });
  if(!best){ g.restore(); return; } const wf = v.toScreen(best[0] + 0.3, best[1] + 0.9, 0), wx = ox + wf.x, wy = oy + wf.y + 12 * z; g.fillStyle = D.lin(g, 0, wy, 0, wy + 260 * z, ['rgba(120,220,240,0.95)', 'rgba(170,235,250,0.55)', 'rgba(200,245,255,0)']);
  g.beginPath(); g.moveTo(wx - 16 * z, wy); g.quadraticCurveTo(wx - 22 * z, wy + 120 * z, wx - 30 * z, wy + 260 * z); g.lineTo(wx + 30 * z, wy + 260 * z); g.quadraticCurveTo(wx + 20 * z, wy + 120 * z, wx + 16 * z, wy); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 2 * z; for(let i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(wx + i * 6 * z, wy + 10 * z); g.lineTo(wx + i * 9 * z, wy + (100 + (i * 37 + t * 60) % 60) * z); g.stroke(); }
  g.restore();
}
window.AvWorld = {underside, MON, monster, palm, jtree, banana, bamboo, flowers, elephantTemple, inn, shop, stopPad, bossTemple, chest, campFlag, jungleIsland, shadow};
})();

/* 🧳 Avateer — R0a2: Elephant Jungle as connected islets (Landing Village + Mango Grove + rope bridge) on IsoKit. */
(function(){
'use strict';
const D = AVD, W2 = AvWorld;
// stilt house, blacksmith, quest board, NPC marker, mango tree, rope-bridge posts
function stiltHouse(g, x, y, k, t, col){ W2.shadow(g, x, y, 26 * k, 0.2); g.save(); g.translate(x, y); g.scale(k, k);
  D.piece(g, [{path: g => { [-18, -6, 6, 18].forEach(px => D.rr(g, px - 2, -16, 4, 16, 1)); }, fill: '#8A5A2B'},
    {path: g => { g.moveTo(-24, -16); g.lineTo(0, -6); g.lineTo(26, -16); g.lineTo(26, -40); g.lineTo(0, -30); g.lineTo(-24, -40); g.closePath(); }, fill: col || '#E8B979'},
    {path: g => { g.moveTo(-30, -38); g.lineTo(0, -66); g.lineTo(32, -38); g.lineTo(0, -26); g.closePath(); }, fill: g => D.lin(g, 0, -66, 0, -26, ['#E2553A', '#B5372A'])}], '#2A1C14', 1.5);
  g.fillStyle = '#5A3418'; g.beginPath(); g.moveTo(6, -14); g.lineTo(6, -28); g.lineTo(14, -31); g.lineTo(14, -17); g.closePath(); g.fill();
  g.fillStyle = '#FFE58A'; g.beginPath(); g.moveTo(-16, -22); g.lineTo(-16, -31); g.lineTo(-8, -28); g.lineTo(-8, -19); g.closePath(); g.fill();
  g.fillStyle = '#FFC21A'; g.beginPath(); g.moveTo(0, -66); g.quadraticCurveTo(4, -74, 0, -80); g.quadraticCurveTo(-3, -72, 0, -66); g.fill(); g.restore(); }
function smithy(g, x, y, k, t){ W2.shadow(g, x, y, 28 * k, 0.22); g.save(); g.translate(x, y); g.scale(k, k);
  D.piece(g, [{path: g => D.rr(g, -26, -30, 52, 30, 3), fill: '#8E8A82'}, {path: g => { g.moveTo(-32, -28); g.lineTo(0, -50); g.lineTo(32, -28); g.closePath(); }, fill: '#5A5470'}, {path: g => D.rr(g, 12, -62, 10, 24, 2), fill: '#6E6A62'}], '#2A1C14', 1.5);
  D.glow(g, -8, -12, 18, '#FF7A2E', 0.7); g.fillStyle = '#2B2D42'; g.beginPath(); D.rr(g, -18, -22, 20, 22, 4); g.fill(); g.fillStyle = '#FF7A2E'; g.beginPath(); D.ell(g, -8, -8, 6, 4); g.fill();
  g.fillStyle = 'rgba(200,200,210,0.6)'; for(let i = 0; i < 3; i++){ g.beginPath(); D.ell(g, 17 + i * 3, -68 - i * 9 - (t * 10 % 6), 4 + i * 2, 3 + i); g.fill(); }
  D.txt(g, '🔨', 0, -34, {size: 12, align: 'center'}); g.restore(); }
function board(g, x, y, k){ W2.shadow(g, x, y, 12 * k, 0.18); g.save(); g.translate(x, y); g.scale(k, k);
  D.piece(g, [{path: g => { D.rr(g, -12, -30, 3, 30, 1); D.rr(g, 9, -30, 3, 30, 1); }, fill: '#8A5A2B'}, {path: g => D.rr(g, -15, -40, 30, 20, 3), fill: '#C99257'}], '#2A1C14', 1.3);
  g.fillStyle = '#FFF3DC'; [[-11, -37], [0, -36], [-6, -29], [5, -28]].forEach(p => { g.fillRect(p[0], p[1], 7, 6); }); D.txt(g, '📋', 0, -46, {size: 10, align: 'center'}); g.restore(); }
function npc(g, x, y, k, t, who, mark){ const a = defaultAvatar(who); drawAvatar(g, {av: a, name: who, dir: -1}, x, y, k, {t, still: true});
  if(mark){ const by = y - 104 * k - Math.abs(Math.sin(t * 3)) * 4 * k; D.card(g, x - 12 * k, by - 26 * k, 24 * k, 30 * k, {fill: '#FFC21A', r: 12 * k, line: '#fff', lw: 2.5, shadow: false}); D.txt(g, mark, x, by - 3 * k, {size: 24 * k, align: 'center', col: '#fff', w: 800, font: '"Baloo 2"'}); } }
function mangoTree(g, x, y, k, t){ W2.jtree(g, x, y, k, t, 1.1, ['#4CA83A', '#2E7A26', '#7CCB55']); const r = D.rnd((x * 7 | 0) + 3); for(let i = 0; i < 5; i++){ g.fillStyle = r() < 0.5 ? '#FFB21A' : '#FF8A2A'; g.beginPath(); D.ell(g, x + (r() - 0.5) * 34 * k, y - (30 + r() * 26) * k, 3 * k, 3.6 * k); g.fill(); } }
function babyElephant(g, x, y, k, t){ W2.shadow(g, x, y, 20 * k, 0.2); g.save(); g.translate(x, y); g.scale(-k * 0.9, k * 0.9);
  const grey = g => D.lin(g, 0, -40, 0, 0, ['#D8D2E4', '#A8A0BC']);
  D.piece(g, [{path: g => { [-12, -4, 8, 15].forEach(px => D.rr(g, px - 4, -14, 8, 14, 4)); }, fill: '#9C95AE'}, {path: g => D.ell(g, 0, -20, 20, 14), fill: grey}, {path: g => D.ell(g, 22, -28, 12, 12), fill: grey},
    {path: g => { g.moveTo(30, -24); g.quadraticCurveTo(40, -18, 36, -6); g.lineTo(32, -7); g.quadraticCurveTo(34, -16, 26, -20); g.closePath(); }, fill: grey}, {path: g => D.ell(g, 14, -30, 8, 10), fill: '#E8C8D8'}], '#2A1C14', 1.6);
  g.fillStyle = '#2A1C14'; g.beginPath(); D.ell(g, 25, -31, 2, 2.4); g.fill(); g.fillStyle = 'rgba(255,120,150,0.4)'; g.beginPath(); D.ell(g, 27, -24, 3, 2); g.fill(); g.restore(); }
function ropePosts(g, a, b, v, ox, oy){ // ropes along a bridge between two world points (drawn in screen space)
  const pa = v.toScreen(a[0], a[1], 0), pb = v.toScreen(b[0], b[1], 0), z = v.zoom; g.save(); g.strokeStyle = '#8A5A2B'; g.lineWidth = 2.4 * z;
  [-1, 1].forEach(s => { const dx = s * 9 * z, dy = -s * 4 * z; g.beginPath(); g.moveTo(ox + pa.x + dx, oy + pa.y + dy - 18 * z); g.quadraticCurveTo(ox + (pa.x + pb.x) / 2 + dx, oy + (pa.y + pb.y) / 2 + dy - 4 * z, ox + pb.x + dx, oy + pb.y + dy - 18 * z); g.stroke(); }); g.restore(); }
// the map: two round islets + a plank bridge (wood cells) between them
function archipelago(){
  const W = 52, H = 40, A = {cx: 14, cy: 26, r: 11.5}, B = {cx: 36, cy: 12, r: 10.5}, R = D.rnd(9);
  const noise = (i, j) => Math.sin(i * 0.8) * 0.6 + Math.cos(j * 0.9) * 0.5 + Math.sin((i + j) * 0.4) * 0.7;
  const inIsle = (I, i, j) => Math.hypot(i - I.cx, j - I.cy) / I.r + noise(i, j) * 0.03;
  const bridge = (i, j) => { const ax = 23.6, ay = 20.8, bx = 27.4, by = 17.2, dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, u = Math.max(0, Math.min(1, ((i + 0.5 - ax) * dx + (j + 0.5 - ay) * dy) / L)), px = ax + u * dx - i - 0.5, py = ay + u * dy - j - 0.5; return px * px + py * py < 0.45; };
  const pathA = [[6, 30], [10, 27], [14, 26], [18, 24], [21, 22], [23.6, 20.8]], pathB = [[27.4, 17.2], [30, 15], [34, 13], [38, 10], [42, 8]];
  const onPath = (pts, i, j) => { for(let a = 0; a < pts.length - 1; a++){ const [x0, y0] = pts[a], [x1, y1] = pts[a + 1], dx = x1 - x0, dy = y1 - y0, L = dx * dx + dy * dy, u = Math.max(0, Math.min(1, ((i - x0) * dx + (j - y0) * dy) / L)), px = x0 + u * dx - i, py = y0 + u * dy - j; if(px * px + py * py < 0.6) return true; } return false; };
  const m = Iso.map({w: W, h: H, theme: 'jungle', base: 2.6, cell: (i, j) => {
    const dA = inIsle(A, i, j), dB = inIsle(B, i, j);
    if(dA > 1 && dB > 1) return bridge(i, j) ? {t: 'wood'} : {t: 'void'};
    const d = Math.min(dA, dB), isA = dA <= 1;
    if(onPath(isA ? pathA : pathB, i, j)) return {t: 'path'};
    if(d > 0.88) return {t: 'sand'};
    if(isA && Math.hypot(i - 6, j - 32) < 3.2) return {t: 'water'};   // the dock bay
    if(!isA && Math.hypot(i - 33, j - 7) < 2.2) return {t: 'water'};   // a pond in the grove
    const hill = !isA && Math.hypot(i - 41, j - 13) < 3.4 ? 1 : isA && Math.hypot(i - 9, j - 22) < 2.8 ? 1 : 0;
    return {t: R() < 0.1 ? 'flower' : 'grass', h: hill}; }});
  return {m, A, B};
}
window.AvArch = {stiltHouse, smithy, board, npc, mangoTree, babyElephant, ropePosts, archipelago};
})();

/* 🧳 Avateer — 🐾 the 3 starter pets × 5 stages (Baby · Young · Grown · Hero · Legendary) — av-r0a draft.
   AvPets.draw(g, id, stage 0–4, x, y, size, {t, flip}) — feet on (x, y), facing right; size ≈ the Legendary height.
   🐣 morph rule: each stage changes ≥ 3 shape things (size · proportions · head piece · tail · extras); one-piece rim. */
(function(){
'use strict';
const D = AVD, TAU = Math.PI * 2, RIM = '#2A1C14';
const PETS = {
  emberpup: {name: 'Emberpup', el: 'fire', icon: '🔥', col: '#FF8A3D', stages: ['Emberpup', 'Blazepaw', 'Flarewolf', 'Pyroguard', 'Solar Howl']},
  splashell: {name: 'Splashell', el: 'water', icon: '💧', col: '#2EC4B6', stages: ['Splashell', 'Waveshell', 'Coralback', 'Tidecannon', 'Tidal Wyrm']},
  leaflop: {name: 'Leaflop', el: 'leaf', icon: '🌱', col: '#6FCB4A', stages: ['Leaflop', 'Sproutear', 'Vinehare', 'Bloomknight', 'Grove Spirit']},
};
const STAGES = ['Baby', 'Young', 'Grown', 'Hero', 'Legendary'];

function eye(g, x, y, r, o){ o = o || {}; g.fillStyle = o.white || '#fff'; g.beginPath(); D.ell(g, x, y, r, r * 1.12); g.fill(); g.fillStyle = o.pupil || '#2A1C14'; g.beginPath(); D.ell(g, x + r * 0.22, y + r * 0.08, r * 0.66, r * 0.78); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); D.ell(g, x + r * 0.42, y - r * 0.3, r * 0.26, r * 0.26); g.fill(); if(o.glow){ D.glow(g, x, y, r * 3, o.glow, 0.5); } }
function blush(g, x, y, r){ g.fillStyle = 'rgba(255,110,110,0.35)'; g.beginPath(); D.ell(g, x, y, r, r * 0.6); g.fill(); }
function flame(g, x, y, w, h, t, lean){ lean = lean || 0; const f = Math.sin(t * 9 + x) * 0.12; g.moveTo(x - w / 2, y); g.bezierCurveTo(x - w * 0.7, y - h * 0.45, x + lean * h - w * 0.2, y - h * (0.7 + f), x + lean * h, y - h); g.bezierCurveTo(x + lean * h + w * 0.1, y - h * 0.6, x + w * 0.75, y - h * 0.4, x + w / 2, y); g.closePath(); }
const FIRE = g => D.lin(g, 0, -1, 0, 1, ['#FFF3B0', '#FFC23D', '#FF5A1A']);
function fireFill(g, y0, y1){ return D.lin(g, 0, y0, 0, y1, ['#FFF3B0', '#FFC23D', '#FF6A1A']); }
function leg(g, x, y, w, h){ D.rr(g, x - w / 2, y - h, w, h, w / 2); }

/* ---------------- 🔥 Emberpup line ---------------- */
function ember(g, S, u, t){
  const B = '#FF8A3D', B2 = '#E8642A', C = '#FFE6C8', rw = Math.max(1, 2.2 * u);
  const body = g => D.lin(g, 0, -60 * u, 0, 0, [D.sh(B, 0.25), B, B2]);
  if(S === 0){   // Baby — a round pup: big head, stub legs, floppy ears, ember tail tip
    D.piece(g, [
      {path: g => { flame(g, -24 * u, -18 * u, 8 * u, 14 * u, t, -0.5); }, fill: g => fireFill(g, -34 * u, -18 * u)},
      {path: g => { g.moveTo(-14 * u, -14 * u); g.quadraticCurveTo(-26 * u, -18 * u, -24 * u, -26 * u); g.lineTo(-20 * u, -24 * u); g.quadraticCurveTo(-20 * u, -16 * u, -10 * u, -12 * u); g.closePath(); }, fill: B},
      {path: g => { leg(g, -10 * u, 0, 7 * u, 10 * u); leg(g, 6 * u, 0, 7 * u, 10 * u); }, fill: B2},
      {path: g => D.ell(g, -4 * u, -13 * u, 16 * u, 11 * u), fill: body},
      {path: g => D.ell(g, 8 * u, -30 * u, 16 * u, 15 * u), fill: body},
      {path: g => { D.ell(g, -4 * u, -40 * u, 6 * u, 10 * u, 0.6); }, fill: B2},
      {path: g => D.ell(g, 20 * u, -25 * u, 7 * u, 5 * u), fill: C}], RIM, rw);
    g.fillStyle = C; g.beginPath(); D.ell(g, -2 * u, -9 * u, 9 * u, 5 * u); g.fill();
    eye(g, 13 * u, -33 * u, 3.6 * u); blush(g, 9 * u, -24 * u, 3 * u);
    g.fillStyle = RIM; g.beginPath(); D.ell(g, 26 * u, -27 * u, 2.4 * u, 1.8 * u); g.fill();
    g.fillStyle = '#FFD23F'; g.beginPath(); flame(g, 6 * u, -44 * u, 4 * u, 6 * u, t, 0.2); g.fill();
  } else if(S === 1){   // Young — longer body + legs, pointy ears with flame tips, flame tuft, longer tail flame
    D.piece(g, [
      {path: g => { g.moveTo(-22 * u, -24 * u); g.quadraticCurveTo(-34 * u, -28 * u, -36 * u, -40 * u); g.lineTo(-31 * u, -40 * u); g.quadraticCurveTo(-28 * u, -30 * u, -18 * u, -28 * u); g.closePath(); }, fill: B},
      {path: g => flame(g, -34 * u, -38 * u, 10 * u, 18 * u, t, -0.3), fill: g => fireFill(g, -56 * u, -38 * u)},
      {path: g => { leg(g, -16 * u, 0, 7 * u, 20 * u); leg(g, -6 * u, 0, 7 * u, 18 * u); leg(g, 10 * u, 0, 7 * u, 20 * u); leg(g, 19 * u, 0, 7 * u, 18 * u); }, fill: B2},
      {path: g => D.ell(g, 0, -24 * u, 24 * u, 11 * u), fill: body},
      {path: g => D.ell(g, 20 * u, -40 * u, 13 * u, 12 * u), fill: body},
      {path: g => { g.moveTo(26 * u, -40 * u); g.quadraticCurveTo(40 * u, -40 * u, 40 * u, -34 * u); g.quadraticCurveTo(34 * u, -30 * u, 24 * u, -32 * u); g.closePath(); }, fill: C},
      {path: g => { g.moveTo(10 * u, -48 * u); g.lineTo(9 * u, -64 * u); g.lineTo(18 * u, -50 * u); g.closePath(); g.moveTo(18 * u, -50 * u); g.lineTo(22 * u, -66 * u); g.lineTo(26 * u, -49 * u); g.closePath(); }, fill: B2}], RIM, rw);
    g.fillStyle = C; g.beginPath(); D.ell(g, 4 * u, -18 * u, 15 * u, 5 * u); g.fill();
    g.beginPath(); flame(g, 9 * u, -62 * u, 4 * u, 7 * u, t); flame(g, 22 * u, -64 * u, 4 * u, 7 * u, t); g.fillStyle = '#FFD23F'; g.fill();
    eye(g, 24 * u, -43 * u, 3.4 * u); g.fillStyle = RIM; g.beginPath(); D.ell(g, 39 * u, -36 * u, 2.2 * u, 1.8 * u); g.fill();
    g.fillStyle = '#FFD23F'; g.beginPath(); flame(g, 16 * u, -51 * u, 5 * u, 9 * u, t, 0.3); g.fill();
  } else if(S === 2){   // Grown — wolf shape: long snout, chest mane of flame, bushy flame tail
    D.piece(g, [
      {path: g => flame(g, -36 * u, -30 * u, 16 * u, 30 * u, t, -0.6), fill: g => fireFill(g, -60 * u, -30 * u)},
      {path: g => { leg(g, -22 * u, 0, 8 * u, 26 * u); leg(g, -12 * u, 0, 8 * u, 24 * u); leg(g, 12 * u, 0, 8 * u, 26 * u); leg(g, 22 * u, 0, 8 * u, 24 * u); }, fill: B2},
      {path: g => { g.moveTo(-32 * u, -34 * u); g.quadraticCurveTo(-10 * u, -46 * u, 20 * u, -40 * u); g.quadraticCurveTo(30 * u, -28 * u, 22 * u, -20 * u); g.quadraticCurveTo(-6 * u, -16 * u, -30 * u, -22 * u); g.closePath(); }, fill: body},
      {path: g => { for(let i = 0; i < 4; i++) flame(g, (8 + i * 6) * u, (-24 - i * 3) * u, 10 * u, (18 + i * 2) * u, t, -0.4); }, fill: g => fireFill(g, -54 * u, -20 * u)},
      {path: g => { g.moveTo(16 * u, -58 * u); g.quadraticCurveTo(30 * u, -64 * u, 36 * u, -54 * u); g.lineTo(50 * u, -50 * u); g.quadraticCurveTo(52 * u, -44 * u, 46 * u, -42 * u); g.lineTo(30 * u, -40 * u); g.quadraticCurveTo(18 * u, -40 * u, 14 * u, -48 * u); g.closePath(); }, fill: body},
      {path: g => { g.moveTo(18 * u, -56 * u); g.lineTo(16 * u, -76 * u); g.lineTo(26 * u, -60 * u); g.closePath(); g.moveTo(25 * u, -60 * u); g.lineTo(30 * u, -78 * u); g.lineTo(34 * u, -58 * u); g.closePath(); }, fill: B2}], RIM, rw);
    g.fillStyle = C; g.beginPath(); g.moveTo(36 * u, -46 * u); g.lineTo(48 * u, -46 * u); g.quadraticCurveTo(44 * u, -41 * u, 32 * u, -41 * u); g.closePath(); g.fill();
    eye(g, 31 * u, -53 * u, 3 * u, {white: '#FFF3B0'}); g.fillStyle = RIM; g.beginPath(); D.ell(g, 50 * u, -48 * u, 2.2 * u, 1.8 * u); g.fill();
  } else if(S === 3){   // Hero — bigger, gold collar + chest plate, banded paws, flame mane spikes, flame marks
    D.piece(g, [
      {path: g => flame(g, -42 * u, -36 * u, 20 * u, 40 * u, t, -0.7), fill: g => fireFill(g, -76 * u, -36 * u)},
      {path: g => { leg(g, -26 * u, 0, 10 * u, 30 * u); leg(g, -14 * u, 0, 10 * u, 28 * u); leg(g, 14 * u, 0, 10 * u, 30 * u); leg(g, 26 * u, 0, 10 * u, 28 * u); }, fill: B2},
      {path: g => { g.moveTo(-38 * u, -40 * u); g.quadraticCurveTo(-10 * u, -56 * u, 24 * u, -48 * u); g.quadraticCurveTo(36 * u, -32 * u, 26 * u, -22 * u); g.quadraticCurveTo(-6 * u, -18 * u, -36 * u, -26 * u); g.closePath(); }, fill: body},
      {path: g => { for(let i = 0; i < 6; i++) flame(g, (-6 + i * 6) * u, (-46 - i * 2) * u, 12 * u, (22 + i * 3) * u, t, -0.5); }, fill: g => fireFill(g, -84 * u, -40 * u)},
      {path: g => { g.moveTo(18 * u, -68 * u); g.quadraticCurveTo(34 * u, -76 * u, 42 * u, -64 * u); g.lineTo(58 * u, -60 * u); g.quadraticCurveTo(60 * u, -52 * u, 52 * u, -50 * u); g.lineTo(34 * u, -48 * u); g.quadraticCurveTo(20 * u, -48 * u, 16 * u, -58 * u); g.closePath(); }, fill: body},
      {path: g => { g.moveTo(20 * u, -66 * u); g.lineTo(17 * u, -90 * u); g.lineTo(29 * u, -70 * u); g.closePath(); g.moveTo(29 * u, -70 * u); g.lineTo(36 * u, -92 * u); g.lineTo(40 * u, -67 * u); g.closePath(); }, fill: B2},
      {path: g => { g.moveTo(12 * u, -52 * u); g.quadraticCurveTo(24 * u, -40 * u, 34 * u, -48 * u); g.lineTo(36 * u, -40 * u); g.quadraticCurveTo(24 * u, -30 * u, 10 * u, -42 * u); g.closePath(); }, fill: g => D.lin(g, 0, -52 * u, 0, -30 * u, ['#FFF0B0', '#FFC21A', '#B07800'])},
      {path: g => { [-26, -14, 14, 26].forEach(x => D.rr(g, (x - 5.6) * u, -10 * u, 11.2 * u, 5 * u, 2 * u)); }, fill: '#FFC21A'}], RIM, rw);
    g.fillStyle = '#E63946'; g.beginPath(); D.ell(g, 24 * u, -39 * u, 2.6 * u, 2.6 * u); g.fill();
    g.fillStyle = '#FFE14D'; g.beginPath(); flame(g, -14 * u, -28 * u, 6 * u, 10 * u, t); flame(g, -4 * u, -26 * u, 6 * u, 8 * u, t); g.fill();
    g.fillStyle = C; g.beginPath(); g.moveTo(42 * u, -56 * u); g.lineTo(56 * u, -56 * u); g.quadraticCurveTo(52 * u, -50 * u, 36 * u, -50 * u); g.closePath(); g.fill();
    eye(g, 37 * u, -63 * u, 3.2 * u, {white: '#FFF3B0', glow: '#FFB23D'}); g.fillStyle = RIM; g.beginPath(); D.ell(g, 58 * u, -58 * u, 2.4 * u, 2 * u); g.fill();
  } else {   // Legendary — Solar Howl: flame wings, sun halo, comet tail, glowing eyes
    D.glow(g, 22 * u, -84 * u, 40 * u, '#FFC23D', 0.5);
    g.save(); g.strokeStyle = '#FFD23F'; g.lineWidth = 4 * u; g.globalAlpha = 0.9; g.beginPath(); g.arc(30 * u, -78 * u, 22 * u, 0, TAU); g.stroke();
    for(let i = 0; i < 12; i++){ const a = i * TAU / 12 + t * 0.4; g.beginPath(); g.moveTo(30 * u + Math.cos(a) * 26 * u, -78 * u + Math.sin(a) * 26 * u); g.lineTo(30 * u + Math.cos(a) * 32 * u, -78 * u + Math.sin(a) * 32 * u); g.stroke(); } g.restore();
    D.piece(g, [
      {path: g => { g.moveTo(-34 * u, -40 * u); g.bezierCurveTo(-70 * u, -60 * u, -80 * u, -30 * u, -96 * u, -40 * u); g.bezierCurveTo(-80 * u, -20 * u, -60 * u, -26 * u, -36 * u, -28 * u); g.closePath(); }, fill: g => D.lin(g, -96 * u, 0, -34 * u, 0, ['rgba(255,90,26,0.2)', '#FF6A1A', '#FFD23F'])},
      {path: g => { g.moveTo(-8 * u, -56 * u); g.bezierCurveTo(-30 * u, -98 * u, -60 * u, -104 * u, -74 * u, -100 * u); g.bezierCurveTo(-62 * u, -92 * u, -64 * u, -84 * u, -70 * u, -80 * u); g.bezierCurveTo(-54 * u, -82 * u, -48 * u, -72 * u, -54 * u, -66 * u); g.bezierCurveTo(-36 * u, -70 * u, -26 * u, -60 * u, -20 * u, -52 * u); g.closePath(); }, fill: g => D.lin(g, -70 * u, -100 * u, -10 * u, -52 * u, ['#FFF3B0', '#FFB23D', '#FF5A1A'])},
      {path: g => { leg(g, -26 * u, 0, 10 * u, 32 * u); leg(g, -14 * u, 0, 10 * u, 30 * u); leg(g, 16 * u, 0, 10 * u, 32 * u); leg(g, 28 * u, 0, 10 * u, 30 * u); }, fill: '#FFB23D'},
      {path: g => { g.moveTo(-38 * u, -42 * u); g.quadraticCurveTo(-10 * u, -60 * u, 26 * u, -50 * u); g.quadraticCurveTo(38 * u, -32 * u, 28 * u, -22 * u); g.quadraticCurveTo(-6 * u, -18 * u, -36 * u, -26 * u); g.closePath(); }, fill: g => D.lin(g, 0, -60 * u, 0, -20 * u, ['#FFE8A0', '#FFB23D', '#FF7A2E'])},
      {path: g => { for(let i = 0; i < 7; i++) flame(g, (-8 + i * 6) * u, (-46 - i * 2) * u, 12 * u, (26 + i * 3) * u, t, -0.6); }, fill: g => fireFill(g, -96 * u, -40 * u)},
      {path: g => { g.moveTo(20 * u, -70 * u); g.quadraticCurveTo(36 * u, -78 * u, 44 * u, -66 * u); g.lineTo(60 * u, -62 * u); g.quadraticCurveTo(62 * u, -54 * u, 54 * u, -52 * u); g.lineTo(36 * u, -50 * u); g.quadraticCurveTo(22 * u, -50 * u, 18 * u, -60 * u); g.closePath(); }, fill: g => D.lin(g, 0, -78 * u, 0, -50 * u, ['#FFF3C8', '#FFB23D'])},
      {path: g => { g.moveTo(22 * u, -68 * u); g.lineTo(18 * u, -96 * u); g.lineTo(31 * u, -72 * u); g.closePath(); g.moveTo(31 * u, -72 * u); g.lineTo(39 * u, -98 * u); g.lineTo(42 * u, -69 * u); g.closePath(); }, fill: '#FF8A3D'}], RIM, rw);
    eye(g, 39 * u, -65 * u, 3.2 * u, {white: '#FFFBE0', pupil: '#FF5A1A', glow: '#FFD23F'}); g.fillStyle = RIM; g.beginPath(); D.ell(g, 60 * u, -60 * u, 2.4 * u, 2 * u); g.fill();
    for(let i = 0; i < 5; i++){ const a = t * 2 + i; D.sparkle(g, (-90 + i * 10 + Math.sin(a) * 4) * u, (-38 - i * 2 + Math.cos(a) * 3) * u, 3 * u, '#FFF3B0'); }
  }
}

/* ---------------- 💧 Splashell line ---------------- */
function shell(g, S, u, t){
  const SK = '#7FD3FF', SK2 = '#3FA6DE', SH = '#2EC4B6', SH2 = '#1C8F86', C = '#E8FBFF', rw = Math.max(1, 2.2 * u);
  const skin = g => D.lin(g, 0, -70 * u, 0, 0, [D.sh(SK, 0.3), SK, SK2]), shellF = g => D.lin(g, 0, -80 * u, 0, -5 * u, [D.sh(SH, 0.35), SH, SH2]);
  const waves = (x0, y0, w, n) => { g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 2 * u; g.beginPath(); for(let i = 0; i <= n; i++){ const x = x0 + i * w / n; i ? g.quadraticCurveTo(x - w / n / 2, y0 - 4 * u, x, y0) : g.moveTo(x, y0); } g.stroke(); };
  if(S === 0){   // Baby — a round shell with a head peeking out, a water drop on top
    D.piece(g, [{path: g => { leg(g, -10 * u, 0, 7 * u, 6 * u); leg(g, 8 * u, 0, 7 * u, 6 * u); }, fill: SK2},
      {path: g => D.ell(g, 18 * u, -16 * u, 11 * u, 10 * u), fill: skin},
      {path: g => { g.moveTo(-20 * u, -5 * u); g.quadraticCurveTo(-20 * u, -34 * u, 0, -34 * u); g.quadraticCurveTo(18 * u, -34 * u, 18 * u, -5 * u); g.closePath(); }, fill: shellF},
      {path: g => { g.moveTo(26 * u, -32 * u); g.quadraticCurveTo(30 * u, -38 * u, 26 * u, -44 * u); g.quadraticCurveTo(22 * u, -38 * u, 26 * u, -32 * u); }, fill: '#9BE8FF'}], RIM, rw);
    g.fillStyle = 'rgba(255,255,255,0.35)'; [[-8, -20], [4, -24], [-2, -12], [10, -14]].forEach(p => { g.beginPath(); D.ell(g, p[0] * u, p[1] * u, 4 * u, 3 * u); g.fill(); });
    eye(g, 21 * u, -19 * u, 3.4 * u); blush(g, 23 * u, -11 * u, 2.6 * u);
  } else if(S === 1){   // Young — on 4 legs, wave pattern + a little crest on the shell, tail
    D.piece(g, [{path: g => { leg(g, -16 * u, 0, 8 * u, 12 * u); leg(g, -4 * u, 0, 8 * u, 10 * u); leg(g, 10 * u, 0, 8 * u, 12 * u); leg(g, 20 * u, 0, 8 * u, 10 * u); }, fill: SK2},
      {path: g => { g.moveTo(-24 * u, -10 * u); g.lineTo(-36 * u, -6 * u); g.lineTo(-24 * u, -4 * u); g.closePath(); }, fill: SK},
      {path: g => { g.moveTo(20 * u, -14 * u); g.quadraticCurveTo(26 * u, -34 * u, 34 * u, -34 * u); g.quadraticCurveTo(44 * u, -32 * u, 42 * u, -24 * u); g.quadraticCurveTo(38 * u, -18 * u, 26 * u, -10 * u); g.closePath(); }, fill: skin},
      {path: g => { g.moveTo(-28 * u, -8 * u); g.quadraticCurveTo(-26 * u, -42 * u, 0, -42 * u); g.quadraticCurveTo(26 * u, -42 * u, 26 * u, -8 * u); g.closePath(); }, fill: shellF},
      {path: g => { g.moveTo(-10 * u, -41 * u); g.quadraticCurveTo(-4 * u, -54 * u, 6 * u, -50 * u); g.quadraticCurveTo(0, -48 * u, 2 * u, -41 * u); g.closePath(); }, fill: '#9BE8FF'}], RIM, rw);
    waves(-20 * u, -22 * u, 40 * u, 4); waves(-14 * u, -32 * u, 28 * u, 3);
    eye(g, 36 * u, -27 * u, 3.2 * u); blush(g, 38 * u, -20 * u, 2.4 * u);
  } else if(S === 2){   // Grown — big shell with coral spikes, fin flippers, a fin on the head
    D.piece(g, [{path: g => { leg(g, -22 * u, 0, 11 * u, 16 * u); leg(g, 20 * u, 0, 11 * u, 16 * u); }, fill: SK2},
      {path: g => { g.moveTo(10 * u, -12 * u); g.quadraticCurveTo(24 * u, -4 * u, 34 * u, 0); g.quadraticCurveTo(22 * u, 2 * u, 6 * u, -4 * u); g.closePath(); }, fill: SK},
      {path: g => { g.moveTo(26 * u, -20 * u); g.quadraticCurveTo(30 * u, -48 * u, 44 * u, -50 * u); g.quadraticCurveTo(58 * u, -48 * u, 56 * u, -38 * u); g.quadraticCurveTo(52 * u, -30 * u, 34 * u, -14 * u); g.closePath(); }, fill: skin},
      {path: g => { g.moveTo(40 * u, -50 * u); g.quadraticCurveTo(40 * u, -64 * u, 52 * u, -62 * u); g.quadraticCurveTo(46 * u, -56 * u, 48 * u, -48 * u); g.closePath(); }, fill: '#9BE8FF'},
      {path: g => { g.moveTo(-36 * u, -12 * u); g.quadraticCurveTo(-32 * u, -56 * u, 0, -56 * u); g.quadraticCurveTo(32 * u, -56 * u, 34 * u, -12 * u); g.closePath(); }, fill: shellF},
      {path: g => { [[-18, -50, -6], [-4, -56, 0], [12, -52, 6], [24, -42, 10]].forEach(p => { g.moveTo((p[0] - 5) * u, (p[1] + 5) * u); g.lineTo((p[0] + p[2] * 0.4) * u, (p[1] - 10) * u); g.lineTo((p[0] + 5) * u, (p[1] + 4) * u); g.closePath(); }); }, fill: '#FF8FB0'}], RIM, rw);
    waves(-28 * u, -22 * u, 56 * u, 6); waves(-22 * u, -36 * u, 44 * u, 5);
    g.fillStyle = C; g.beginPath(); D.ell(g, 0, -12 * u, 30 * u, 4 * u); g.fill();
    eye(g, 48 * u, -40 * u, 3.2 * u); g.strokeStyle = RIM; g.lineWidth = 1.4 * u; g.beginPath(); g.arc(52 * u, -32 * u, 3 * u, 0.2, 1.6); g.stroke();
  } else if(S === 3){   // Hero — shell becomes armour with 2 water cannons + gold rim, helmet fin
    D.piece(g, [{path: g => { leg(g, -26 * u, 0, 13 * u, 22 * u); leg(g, 24 * u, 0, 13 * u, 22 * u); }, fill: SK2},
      {path: g => { g.moveTo(30 * u, -26 * u); g.quadraticCurveTo(34 * u, -60 * u, 52 * u, -62 * u); g.quadraticCurveTo(68 * u, -60 * u, 66 * u, -46 * u); g.quadraticCurveTo(62 * u, -36 * u, 40 * u, -18 * u); g.closePath(); }, fill: skin},
      {path: g => { g.moveTo(42 * u, -60 * u); g.quadraticCurveTo(52 * u, -76 * u, 66 * u, -66 * u); g.lineTo(56 * u, -58 * u); g.closePath(); }, fill: g => D.lin(g, 0, -76 * u, 0, -56 * u, ['#FFF0B0', '#FFC21A'])},
      {path: g => { [[-12, -68], [10, -70]].forEach(p => { D.rr(g, (p[0] - 5) * u, (p[1] - 16) * u, 10 * u, 22 * u, 3 * u); }); }, fill: g => D.lin(g, 0, -86 * u, 0, -60 * u, ['#D7DEEA', '#7D8AA0'])},
      {path: g => { g.moveTo(-42 * u, -18 * u); g.quadraticCurveTo(-38 * u, -68 * u, 0, -68 * u); g.quadraticCurveTo(38 * u, -68 * u, 40 * u, -18 * u); g.closePath(); }, fill: shellF},
      {path: g => { g.moveTo(-44 * u, -14 * u); g.quadraticCurveTo(0, -26 * u, 42 * u, -14 * u); g.lineTo(42 * u, -8 * u); g.quadraticCurveTo(0, -18 * u, -44 * u, -8 * u); g.closePath(); }, fill: '#FFC21A'}], RIM, rw);
    [[-12, -84], [10, -86]].forEach((p, i) => { g.fillStyle = '#9BE8FF'; g.beginPath(); for(let k = 0; k < 3; k++){ const pp = (t * 2 + k / 3 + i * 0.5) % 1; D.ell(g, (p[0] + Math.sin(k * 2) * 3) * u, (p[1] - pp * 16) * u, (2.4 - pp) * u, (3 - pp) * u); } g.fill(); });
    waves(-34 * u, -30 * u, 68 * u, 7); waves(-26 * u, -44 * u, 52 * u, 6);
    eye(g, 55 * u, -48 * u, 3.4 * u, {glow: '#5FE1FF'}); g.strokeStyle = RIM; g.lineWidth = 1.6 * u; g.beginPath(); g.moveTo(58 * u, -38 * u); g.lineTo(64 * u, -40 * u); g.stroke();
  } else {   // Legendary — Tidal Wyrm: a long dragon neck with a wave mane, whirlpool shell, floating bubbles
    D.glow(g, 10 * u, -60 * u, 60 * u, '#5FE1FF', 0.35);
    D.piece(g, [{path: g => { leg(g, -28 * u, 0, 13 * u, 22 * u); leg(g, 22 * u, 0, 13 * u, 22 * u); }, fill: SK2},
      {path: g => { g.moveTo(-40 * u, -22 * u); g.bezierCurveTo(-60 * u, -26 * u, -74 * u, -10 * u, -84 * u, -24 * u); g.bezierCurveTo(-74 * u, -2 * u, -56 * u, -8 * u, -38 * u, -12 * u); g.closePath(); }, fill: skin},
      {path: g => { g.moveTo(22 * u, -40 * u); g.bezierCurveTo(30 * u, -80 * u, 40 * u, -100 * u, 56 * u, -104 * u); g.quadraticCurveTo(78 * u, -104 * u, 80 * u, -92 * u); g.lineTo(76 * u, -84 * u); g.quadraticCurveTo(60 * u, -86 * u, 50 * u, -76 * u); g.bezierCurveTo(44 * u, -62 * u, 40 * u, -48 * u, 36 * u, -30 * u); g.closePath(); }, fill: skin},
      {path: g => { for(let i = 0; i < 6; i++){ const y = -92 + i * 11, x = 40 - i * 2.5; g.moveTo(x * u, y * u); g.quadraticCurveTo((x - 14) * u, (y - 6) * u, (x - 12) * u, (y + 6) * u); g.quadraticCurveTo((x - 6) * u, (y + 2) * u, (x + 2) * u, (y + 8) * u); g.closePath(); } }, fill: g => D.lin(g, 0, -100 * u, 0, -30 * u, ['#E8FDFF', '#5FE1FF', '#2CA6DE'])},
      {path: g => { g.moveTo(58 * u, -104 * u); g.quadraticCurveTo(52 * u, -118 * u, 44 * u, -122 * u); g.quadraticCurveTo(58 * u, -120 * u, 64 * u, -106 * u); g.closePath(); }, fill: '#FFC21A'},
      {path: g => { g.moveTo(-46 * u, -16 * u); g.quadraticCurveTo(-42 * u, -72 * u, -2 * u, -72 * u); g.quadraticCurveTo(38 * u, -72 * u, 40 * u, -16 * u); g.closePath(); }, fill: shellF}], RIM, rw);
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2.4 * u; g.beginPath(); for(let a = 0; a < 5 * Math.PI; a += 0.2){ const r = (2 + a * 2.2) * u, x = -3 * u + Math.cos(a + t) * r, y = -42 * u + Math.sin(a + t) * r * 0.75; a ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    eye(g, 66 * u, -96 * u, 3.2 * u, {white: '#E8FDFF', pupil: '#1C6FA8', glow: '#5FE1FF'}); g.fillStyle = RIM; g.beginPath(); D.ell(g, 80 * u, -88 * u, 1.8 * u, 1.4 * u); g.fill();
    for(let i = 0; i < 6; i++){ const p = (t * 0.6 + i / 6) % 1, x = (-60 + i * 22) * u, y = (-20 - p * 70) * u; g.strokeStyle = 'rgba(255,255,255,' + (1 - p) + ')'; g.lineWidth = 1.4 * u; g.beginPath(); g.arc(x, y, (2 + i % 3) * u, 0, TAU); g.stroke(); }
  }
}

/* ---------------- 🌱 Leaflop line ---------------- */
function leaf(g, S, u, t){
  const B = '#9BE07A', B2 = '#5DB43C', C = '#F4FFE8', P = '#FF8FB0', rw = Math.max(1, 2.2 * u);
  const fur = g => D.lin(g, 0, -80 * u, 0, 0, [D.sh(B, 0.3), B, B2]);
  const leafEar = (x, y, w, h, rot) => { g.save(); g.translate(x, y); g.rotate(rot); g.moveTo(0, 0); g.quadraticCurveTo(-w, -h * 0.5, 0, -h); g.quadraticCurveTo(w, -h * 0.5, 0, 0); g.restore(); };
  const vein = (x, y, h, rot) => { g.save(); g.translate(x, y); g.rotate(rot); g.strokeStyle = 'rgba(40,110,30,0.6)'; g.lineWidth = 1.2 * u; g.beginPath(); g.moveTo(0, -2 * u); g.lineTo(0, -h + 3 * u); g.stroke(); g.restore(); };
  const flower = (x, y, r, col) => { g.fillStyle = col || P; g.beginPath(); for(let i = 0; i < 5; i++){ const a = i * TAU / 5; D.ell(g, x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.8, r * 0.8); } g.fill(); g.fillStyle = '#FFD23F'; g.beginPath(); D.ell(g, x, y, r * 0.6, r * 0.6); g.fill(); };
  if(S === 0){   // Baby — a round bun, two leaf ears, a sprout tail
    D.piece(g, [{path: g => { leafEar(4 * u, -26 * u, 6 * u, 20 * u, -0.25); leafEar(12 * u, -26 * u, 6 * u, 18 * u, 0.3); }, fill: g => D.lin(g, 0, -46 * u, 0, -26 * u, ['#C9FF9A', B2])},
      {path: g => D.ell(g, -18 * u, -12 * u, 5 * u, 5 * u), fill: C},
      {path: g => D.ell(g, 0, -15 * u, 18 * u, 15 * u), fill: fur}], RIM, rw);
    vein(4 * u, -26 * u, 20 * u, -0.25); vein(12 * u, -26 * u, 18 * u, 0.3);
    g.fillStyle = C; g.beginPath(); D.ell(g, 4 * u, -8 * u, 10 * u, 6 * u); g.fill();
    eye(g, 10 * u, -19 * u, 3.4 * u); blush(g, 13 * u, -11 * u, 3 * u); g.fillStyle = P; g.beginPath(); D.ell(g, 17 * u, -14 * u, 1.8 * u, 1.4 * u); g.fill();
  } else if(S === 1){   // Young — sitting bunny, long leaf ears, a flower on the head, fluffy tail
    D.piece(g, [{path: g => { leafEar(10 * u, -40 * u, 7 * u, 30 * u, -0.2); leafEar(18 * u, -40 * u, 7 * u, 28 * u, 0.25); }, fill: g => D.lin(g, 0, -70 * u, 0, -40 * u, ['#C9FF9A', B2])},
      {path: g => D.ell(g, -22 * u, -14 * u, 7 * u, 7 * u), fill: C},
      {path: g => { leg(g, 8 * u, 0, 8 * u, 10 * u); }, fill: B2},
      {path: g => D.ell(g, -4 * u, -16 * u, 18 * u, 16 * u), fill: fur},
      {path: g => D.ell(g, 14 * u, -34 * u, 12 * u, 11 * u), fill: fur}], RIM, rw);
    vein(10 * u, -40 * u, 30 * u, -0.2); vein(18 * u, -40 * u, 28 * u, 0.25);
    g.fillStyle = C; g.beginPath(); D.ell(g, 2 * u, -10 * u, 11 * u, 7 * u); g.fill();
    flower(6 * u, -44 * u, 3.4 * u);
    eye(g, 19 * u, -36 * u, 3 * u); blush(g, 20 * u, -28 * u, 2.6 * u); g.fillStyle = P; g.beginPath(); D.ell(g, 25 * u, -31 * u, 1.6 * u, 1.3 * u); g.fill();
  } else if(S === 2){   // Grown — standing hare: long legs, vine tail, leaf collar, longer veined ears
    D.piece(g, [{path: g => { g.moveTo(-14 * u, -30 * u); g.bezierCurveTo(-34 * u, -30 * u, -40 * u, -50 * u, -30 * u, -56 * u); g.bezierCurveTo(-34 * u, -46 * u, -28 * u, -38 * u, -14 * u, -36 * u); g.closePath(); }, fill: B2},
      {path: g => { leafEar(6 * u, -64 * u, 8 * u, 38 * u, -0.3); leafEar(15 * u, -64 * u, 8 * u, 36 * u, 0.15); }, fill: g => D.lin(g, 0, -100 * u, 0, -64 * u, ['#C9FF9A', B2])},
      {path: g => { leg(g, -6 * u, 0, 8 * u, 24 * u); leg(g, 8 * u, 0, 8 * u, 24 * u); D.ell(g, -2 * u, -2 * u, 9 * u, 3.4 * u); D.ell(g, 12 * u, -2 * u, 9 * u, 3.4 * u); }, fill: B2},
      {path: g => D.ell(g, 0, -36 * u, 15 * u, 18 * u), fill: fur},
      {path: g => D.ell(g, 12 * u, -58 * u, 12 * u, 11 * u), fill: fur},
      {path: g => { for(let i = 0; i < 5; i++){ const a = Math.PI * (0.15 + i * 0.18); leafEar(Math.cos(a) * 14 * u + 2 * u, -46 * u + Math.sin(a) * 4 * u, 4 * u, 12 * u, a - Math.PI * 0.5 + 0.2); } }, fill: '#4CB13A'}], RIM, rw);
    vein(6 * u, -64 * u, 38 * u, -0.3); vein(15 * u, -64 * u, 36 * u, 0.15);
    g.fillStyle = C; g.beginPath(); D.ell(g, 3 * u, -32 * u, 9 * u, 12 * u); g.fill();
    flower(-30 * u, -56 * u, 3 * u, '#FFF3B0');
    eye(g, 17 * u, -60 * u, 3 * u); g.fillStyle = P; g.beginPath(); D.ell(g, 23 * u, -55 * u, 1.6 * u, 1.3 * u); g.fill();
  } else if(S === 3){   // Hero — petal cape, leaf crown, a vine staff, bigger
    D.piece(g, [{path: g => { g.moveTo(-6 * u, -64 * u); g.bezierCurveTo(-30 * u, -60 * u, -38 * u, -30 * u, -34 * u, -6 * u); g.quadraticCurveTo(-24 * u, -12 * u, -18 * u, -4 * u); g.quadraticCurveTo(-12 * u, -14 * u, -2 * u, -8 * u); g.closePath(); }, fill: g => D.lin(g, 0, -64 * u, 0, 0, ['#FFC2D8', P, '#E63E7A'])},
      {path: g => { leafEar(6 * u, -78 * u, 9 * u, 42 * u, -0.3); leafEar(16 * u, -78 * u, 9 * u, 40 * u, 0.15); }, fill: g => D.lin(g, 0, -118 * u, 0, -78 * u, ['#C9FF9A', B2])},
      {path: g => { g.moveTo(30 * u, 2 * u); g.bezierCurveTo(26 * u, -30 * u, 34 * u, -60 * u, 28 * u, -86 * u); g.lineTo(33 * u, -86 * u); g.bezierCurveTo(38 * u, -60 * u, 31 * u, -30 * u, 34 * u, 2 * u); g.closePath(); }, fill: '#8A5A2B'},
      {path: g => { leg(g, -6 * u, 0, 9 * u, 28 * u); leg(g, 9 * u, 0, 9 * u, 28 * u); D.ell(g, -2 * u, -2 * u, 10 * u, 3.6 * u); D.ell(g, 13 * u, -2 * u, 10 * u, 3.6 * u); }, fill: B2},
      {path: g => D.ell(g, 1 * u, -42 * u, 17 * u, 20 * u), fill: fur},
      {path: g => { g.moveTo(14 * u, -38 * u); g.lineTo(28 * u, -46 * u); g.lineTo(30 * u, -40 * u); g.lineTo(16 * u, -32 * u); g.closePath(); }, fill: B},
      {path: g => D.ell(g, 13 * u, -68 * u, 13 * u, 12 * u), fill: fur},
      {path: g => { [-0.5, -0.1, 0.3].forEach((r, i) => leafEar((6 + i * 7) * u, -78 * u, 3.4 * u, 10 * u, r)); }, fill: '#FFC21A'}], RIM, rw);
    vein(6 * u, -78 * u, 42 * u, -0.3); vein(16 * u, -78 * u, 40 * u, 0.15);
    g.fillStyle = C; g.beginPath(); D.ell(g, 4 * u, -38 * u, 10 * u, 13 * u); g.fill();
    g.save(); g.strokeStyle = '#4CB13A'; g.lineWidth = 2.4 * u; g.beginPath(); for(let y = -10; y > -84; y -= 4){ const x = 31 + Math.sin(y * 0.3) * 4; y === -10 ? g.moveTo(x * u, y * u) : g.lineTo(x * u, y * u); } g.stroke(); g.restore();
    flower(31 * u, -90 * u, 4.2 * u); D.glow(g, 31 * u, -90 * u, 12 * u, '#FFD23F', 0.4);
    eye(g, 18 * u, -70 * u, 3.2 * u, {glow: '#9BFF8A'}); g.fillStyle = P; g.beginPath(); D.ell(g, 25 * u, -64 * u, 1.7 * u, 1.4 * u); g.fill();
  } else {   // Legendary — Grove Spirit: deer-like legs, blossom antler-branches, glowing, floating petals
    D.glow(g, 6 * u, -70 * u, 60 * u, '#C9FF9A', 0.35);
    D.piece(g, [
      {path: g => { const br = (x, y, s) => { g.moveTo(x, y); g.quadraticCurveTo(x + s * 4 * u, y - 18 * u, x + s * 14 * u, y - 30 * u); g.lineTo(x + s * 16 * u, y - 28 * u); g.quadraticCurveTo(x + s * 8 * u, y - 18 * u, x + s * 3 * u, y + 1 * u); g.closePath();
          g.moveTo(x + s * 6 * u, y - 14 * u); g.lineTo(x + s * 18 * u, y - 16 * u); g.lineTo(x + s * 17 * u, y - 13 * u); g.lineTo(x + s * 7 * u, y - 11 * u); g.closePath(); }; br(8 * u, -94 * u, -1); br(18 * u, -94 * u, 1); }, fill: '#A87442'},
      {path: g => { leafEar(4 * u, -94 * u, 8 * u, 30 * u, -0.9); leafEar(22 * u, -94 * u, 8 * u, 30 * u, 0.9); }, fill: g => D.lin(g, 0, -120 * u, 0, -90 * u, ['#E8FFD0', B2])},
      {path: g => { leg(g, -26 * u, 0, 6 * u, 36 * u); leg(g, -16 * u, 0, 6 * u, 34 * u); leg(g, 18 * u, 0, 6 * u, 36 * u); leg(g, 28 * u, 0, 6 * u, 34 * u); }, fill: g => D.lin(g, 0, -36 * u, 0, 0, [B, '#3E8E2A'])},
      {path: g => { g.moveTo(-32 * u, -44 * u); g.quadraticCurveTo(-10 * u, -58 * u, 22 * u, -52 * u); g.quadraticCurveTo(36 * u, -40 * u, 30 * u, -30 * u); g.quadraticCurveTo(0, -26 * u, -32 * u, -32 * u); g.closePath(); }, fill: g => D.lin(g, 0, -58 * u, 0, -26 * u, ['#E8FFD0', B, B2])},
      {path: g => { g.moveTo(-32 * u, -40 * u); g.bezierCurveTo(-48 * u, -46 * u, -50 * u, -60 * u, -40 * u, -66 * u); g.bezierCurveTo(-42 * u, -56 * u, -36 * u, -50 * u, -28 * u, -48 * u); g.closePath(); }, fill: '#E8FFD0'},
      {path: g => { g.moveTo(16 * u, -50 * u); g.quadraticCurveTo(14 * u, -70 * u, 14 * u, -82 * u); g.lineTo(22 * u, -82 * u); g.quadraticCurveTo(28 * u, -66 * u, 30 * u, -44 * u); g.closePath(); }, fill: fur},
      {path: g => { g.moveTo(8 * u, -90 * u); g.quadraticCurveTo(14 * u, -100 * u, 24 * u, -96 * u); g.lineTo(36 * u, -86 * u); g.quadraticCurveTo(36 * u, -80 * u, 30 * u, -80 * u); g.lineTo(18 * u, -80 * u); g.quadraticCurveTo(8 * u, -82 * u, 8 * u, -90 * u); g.closePath(); }, fill: fur}], RIM, rw);
    [[-6, -124], [4, -130], [-10, -114], [30, -124], [40, -128], [34, -114], [12, -108]].forEach((p, i) => flower(p[0] * u, p[1] * u, (2.6 + i % 2) * u, i % 3 ? P : '#FFF3B0'));
    g.fillStyle = C; g.beginPath(); D.ell(g, 22 * u, -40 * u, 9 * u, 6 * u); g.fill();
    eye(g, 24 * u, -89 * u, 2.8 * u, {white: '#F4FFE8', pupil: '#2E8A2E', glow: '#9BFF8A'}); g.fillStyle = P; g.beginPath(); D.ell(g, 35 * u, -84 * u, 1.6 * u, 1.3 * u); g.fill();
    for(let i = 0; i < 7; i++){ const p = (t * 0.4 + i / 7) % 1; g.globalAlpha = 1 - p * 0.7; g.fillStyle = i % 2 ? P : '#FFF3B0'; g.beginPath(); D.ell(g, (-50 + i * 15 + Math.sin(t + i) * 5) * u, (-30 - p * 80) * u, 2.6 * u, 1.6 * u, i); g.fill(); } g.globalAlpha = 1;
  }
}

const PAINT = {emberpup: ember, splashell: shell, leaflop: leaf};
function draw(g, id, stage, x, y, size, o){ o = o || {}; const u = size / 100; g.save(); g.translate(x, y); if(o.flip) g.scale(-1, 1); (PAINT[id] || ember)(g, Math.max(0, Math.min(4, stage | 0)), u, o.t || 0); g.restore(); }
window.AvPets = {PETS, STAGES, draw};
})();

