// 🏷️ LOGO avatarealm START — 🌍 AvataRealm, drawn in code from Aowu's picture (gl-31, round 10). A stone ring with a knot band and gold edges round a
// glowing sky globe; inside, a floating island in two tiers (gl-r19: each a BLOCK — rounded-diamond grass top with dirt paths, two cliff faces, rocky underside) (castle with blue cone roofs, houses, watchtowers, pines, waterfalls, rocky underside);
// little ships sail the clouds; a golden comet trail swirls round the ring; a hero in armour with a raised sword (left) and a young wizard with a
// glowing staff (right), drawn one-piece; tiny avatar faces float in the dark; "AVATA" gold + "REALM" royal blue in carved serif letters (T.serif, gl-r19), the R bigger.
// Look: classic only (AvataRealm has no game page yet).
GameLogos.add('avatarealm', (function () {
  var BOX = { scene: [1024, 572], main: [900, 540], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, INK = '#0c0a1a', CX = 512, CY = 280;
  var LOOK = { classic: { bg: ['#1a2030', '#05070c'], gold: ['#fff4b8', '#f2c23a', '#9a5a08'], blue: ['#e0f0ff', '#3a7af0', '#10287a'], stone: ['#9aa0aa', '#4a505a'] } };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* ---------- background ---------- */
  function back(g, T, L) {
    g.fillStyle = T.rad(g, 512, 290, 30, 640, [0, L.bg[0], 1, L.bg[1]]); g.fillRect(0, 0, 1024, 572);
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, CX, CY, 200, 330, [0, 'rgba(120,200,255,.25)', 1, 'rgba(0,0,0,0)']); g.fillRect(150, 0, 724, 572); g.restore();
    T.mystic(g, 0, 0, 1024, 572, { seed: 53, nebula: [[170, 140, 250, 'rgba(140,70,255,.55)', 0.5], [860, 130, 240, 'rgba(40,200,230,.5)', 0.45], [160, 460, 220, 'rgba(230,80,190,.45)', 0.35], [880, 450, 230, 'rgba(70,110,255,.5)', 0.4]],   /* gl-r20: mystic sky */
      aurora: [{ y: 120, amp: 30, h: 130, cols: ['rgba(90,255,200,.95)', 'rgba(110,120,255,.6)'], a: 0.5, f: 0.8 }, { y: 470, amp: 22, h: 110, cols: ['rgba(255,130,230,.85)', 'rgba(140,90,255,.5)'], a: 0.22, f: 1.2, ph: 1.1 }],
      stars: 140, motes: 30 });
    var r = T.rng(7); for (var i = 0; i < 50; i++) { g.fillStyle = 'rgba(255,240,200,' + (0.2 + r() * 0.5) + ')'; g.beginPath(); g.arc(r() * 1024, r() * 572, 0.6 + r() * 1.6, 0, TAU); g.fill(); }
  }
  function faces(g, T, a) {
    var F = [[186, 163, '#c87a3a', '#ffd8b0'], [308, 100, '#5a3a2a', '#f0c8a0'], [716, 110, '#2a2a3a', '#e8b890'], [868, 226, '#3a6aaa', '#ffd0b0'], [784, 378, '#7a5a2a', '#e0b088'], [744, 448, '#c84a4a', '#ffd0b8'], [694, 490, '#3a3a5a', '#d8a880'], [242, 376, '#5a5a5a', '#f0c8a0'], [214, 366, '#aa6a2a', '#ffd8b0'], [800, 430, '#2a5a3a', '#f0c8a0']];
    g.save(); g.globalAlpha = a; F.forEach(function (f, i) { var x = f[0], y = f[1], s = 9 + (i % 3) * 2; g.beginPath(); g.arc(x, y + s * 1.4, s * 1.1, Math.PI, TAU); g.fillStyle = ['#4a5a9a', '#7a3a6a', '#3a7a5a'][i % 3]; g.fill(); g.beginPath(); g.arc(x, y, s, 0, TAU); g.fillStyle = f[3]; g.fill(); g.beginPath(); g.arc(x, y - s * 0.25, s * 1.02, Math.PI * 1.05, TAU - 0.05); g.fillStyle = f[2]; g.fill(); g.fillStyle = '#1a1a2a'; g.beginPath(); g.arc(x - s * 0.35, y + s * 0.1, s * 0.13, 0, TAU); g.arc(x + s * 0.35, y + s * 0.1, s * 0.13, 0, TAU); g.fill(); }); g.restore();
  }
  /* ---------- the globe: sky, two-tier floating island ---------- */
  function pine(g, T, x, y, s) { g.fillStyle = '#5a3a1a'; g.fillRect(x - 1.5 * s, y - 4 * s, 3 * s, 5 * s); [[0, 14, 9], [-7, 10, 7], [-13, 6, 5]].forEach(function (q) { g.beginPath(); g.moveTo(x - q[1] * s * 0.6, y + q[0] * s * 0.6 - 4 * s); g.lineTo(x, y + q[0] * s * 0.6 - 4 * s - q[1] * s * 1.1); g.lineTo(x + q[1] * s * 0.6, y + q[0] * s * 0.6 - 4 * s); g.closePath(); g.fillStyle = T.lin(g, x - 8 * s, 0, x + 8 * s, 0, [0, '#2a8a3a', 0.5, '#4ab84a', 1, '#1a6a2a']); g.fill(); }); }
  function cone(g, T, x, y, w, h, col) { g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y - h); g.lineTo(x + w, y); g.quadraticCurveTo(x, y + w * 0.3, x - w, y); g.fillStyle = T.lin(g, x - w, 0, x + w, 0, [0, sh(col, 0.35), 0.45, col, 1, sh(col, -0.45)]); g.fill(); g.lineWidth = 1.6; g.strokeStyle = '#0a1a4a'; g.stroke(); }
  function tower(g, T, x, y, w, h, roof, col) { g.fillStyle = T.lin(g, x - w, 0, x + w, 0, [0, '#f0e8d8', 0.5, col || '#d0c4ac', 1, '#8a806c']); g.fillRect(x - w, y - h, w * 2, h); g.lineWidth = 1.5; g.strokeStyle = '#4a4030'; g.strokeRect(x - w, y - h, w * 2, h); for (var i = -w; i < w; i += w / 2) { g.fillStyle = '#d8ccb4'; g.fillRect(x + i, y - h - 4, w / 4, 4); }
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(x, y - h * 0.45, w * 0.28, Math.PI, TAU); g.fillRect(x - w * 0.28, y - h * 0.45, w * 0.56, h * 0.18); g.fill(); if (roof) cone(g, T, x, y - h - 2, w * 1.25, roof, '#3a7ae8'); }
  function flag(g, x, y, c) { g.strokeStyle = '#5a4a2a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 18); g.stroke(); g.fillStyle = c; g.beginPath(); g.moveTo(x, y - 18); g.quadraticCurveTo(x + 8, y - 20, x + 14, y - 15); g.quadraticCurveTo(x + 8, y - 12, x, y - 12); g.closePath(); g.fill(); }
  function house(g, T, x, y, s) { g.fillStyle = '#c8a878'; g.fillRect(x - 12 * s, y - 12 * s, 24 * s, 12 * s); g.strokeStyle = '#4a3a20'; g.lineWidth = 1.2; g.strokeRect(x - 12 * s, y - 12 * s, 24 * s, 12 * s); g.fillStyle = '#5a3a1a'; g.fillRect(x - 3 * s, y - 7 * s, 6 * s, 7 * s);
    g.beginPath(); g.moveTo(x - 16 * s, y - 11 * s); g.lineTo(x - 6 * s, y - 24 * s); g.lineTo(x + 10 * s, y - 24 * s); g.lineTo(x + 16 * s, y - 11 * s); g.closePath(); g.fillStyle = T.lin(g, 0, y - 24 * s, 0, y - 11 * s, [0, '#6aa8ff', 1, '#2a5ac8']); g.fill(); g.stroke(); }
  function falls(g, T, x, y0, y1, w) { g.save(); g.fillStyle = T.lin(g, 0, y0, 0, y1, [0, 'rgba(230,250,255,.95)', 0.75, 'rgba(150,215,255,.8)', 1, 'rgba(150,215,255,0)']); g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x + w / 2, y0); g.lineTo(x + w * 0.8, y1); g.lineTo(x - w * 0.8, y1); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.4; for (var i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * w * 0.25, y0 + 3); g.lineTo(x + i * w * 0.35, y1 - 10); g.stroke(); } g.restore(); }
  function tier(g, T, x, y, rx, ry, depth) {   // a grass top on a rocky cone
    g.beginPath(); g.moveTo(x - rx, y); g.bezierCurveTo(x - rx * 0.8, y + depth * 0.5, x - rx * 0.35, y + depth, x + rx * 0.05, y + depth * 1.1); g.bezierCurveTo(x + rx * 0.4, y + depth * 0.9, x + rx * 0.85, y + depth * 0.45, x + rx, y); g.closePath();
    g.fillStyle = T.lin(g, 0, y, 0, y + depth, [0, '#b88a5a', 0.4, '#7a5a3a', 1, '#3a2a1a']); g.fill(); g.lineWidth = 2; g.strokeStyle = '#2a1a10'; g.stroke();
    g.strokeStyle = 'rgba(40,24,12,.5)'; g.lineWidth = 1.5; for (var i = 0; i < 7; i++) { var px = x - rx * 0.7 + i * rx * 0.24; g.beginPath(); g.moveTo(px, y + 8); g.lineTo(px + 6, y + depth * (0.4 + (i % 3) * 0.15)); g.stroke(); }
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fillStyle = T.lin(g, 0, y - ry, 0, y + ry, [0, '#aaf07a', 0.6, '#5ac04a', 1, '#2a8a2a']); g.fill(); g.lineWidth = 2; g.strokeStyle = '#1a5a1a'; g.stroke();
  }
  function ship(g, T, x, y, s, flip) { g.save(); g.translate(x, y); g.scale(flip ? -s : s, s); g.beginPath(); g.moveTo(-18, 0); g.lineTo(18, 0); g.lineTo(13, 9); g.lineTo(-13, 9); g.closePath(); g.fillStyle = '#7a4a22'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#2a1a0a'; g.stroke();
    g.strokeStyle = '#4a2a10'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -28); g.stroke(); g.fillStyle = '#f4ecd8'; g.beginPath(); g.moveTo(2, -26); g.quadraticCurveTo(16, -16, 2, -4); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-2, -24); g.quadraticCurveTo(-14, -14, -2, -6); g.closePath(); g.fill(); g.fillStyle = '#e84a4a'; g.fillRect(0, -32, 7, 4);
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(0, 11, 24, 4, 0, 0, TAU); g.fill(); g.restore(); }
  /* gl-r19 draft 2: the picture's island is a BLOCK seen from above-front — a rounded diamond of grass with dirt paths, two cliff faces with
     rock layers, and a rocky underside — not an oval. block(g, T, L, B, R, F, cliff, under) draws one (corners Left / Back / Right / Front) */
  function block(g, T, P, cliff, under, seed) {
    var Lx = P[0], Bk = P[1], Rx = P[2], Fr = P[3], d = cliff;
    function q(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    // rocky underside to a point
    var tip = [Fr[0] - 24, Fr[1] + d + under];
    g.beginPath(); g.moveTo(Lx[0], Lx[1] + d * 0.7); g.quadraticCurveTo(Lx[0] + 20, Lx[1] + d + under * 0.5, tip[0], tip[1]); g.quadraticCurveTo(Rx[0] - 30, Rx[1] + d + under * 0.45, Rx[0], Rx[1] + d * 0.7); g.lineTo(Fr[0], Fr[1] + d); g.closePath();
    g.fillStyle = T.lin(g, 0, Fr[1], 0, tip[1], [0, '#7a5a3a', 0.5, '#4a3424', 1, '#241810']); g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#1a100a'; g.stroke();
    var r = T.rng(seed); g.save(); g.clip(); g.strokeStyle = 'rgba(20,12,6,.45)'; g.lineWidth = 2; for (var i = 0; i < 14; i++) { var x = Lx[0] + r() * (Rx[0] - Lx[0]), y = Fr[1] + d + r() * under * 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 16, y + 14 + r() * 20); g.stroke(); }
    g.fillStyle = 'rgba(160,130,100,.35)'; for (i = 0; i < 10; i++) { g.beginPath(); g.ellipse(Lx[0] + r() * (Rx[0] - Lx[0]), Fr[1] + d + r() * under * 0.6, 8 + r() * 10, 4 + r() * 4, 0, 0, TAU); g.fill(); } g.restore();
    // two cliff faces
    [[Lx, Fr, '#c8a070', '#8a6440'], [Fr, Rx, '#8a6a48', '#5a4028']].forEach(function (f, k) {
      g.beginPath(); g.moveTo(f[0][0], f[0][1]); g.lineTo(f[1][0], f[1][1]); g.lineTo(f[1][0], f[1][1] + d * (k ? 0.7 : 1)); g.lineTo(f[0][0], f[0][1] + d * (k ? 1 : 0.7)); g.closePath();
      g.fillStyle = T.lin(g, 0, Math.min(f[0][1], f[1][1]), 0, Math.max(f[0][1], f[1][1]) + d, [0, f[2], 1, f[3]]); g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#2a1a10'; g.stroke();
      g.save(); g.clip(); g.strokeStyle = 'rgba(40,24,12,.4)'; g.lineWidth = 1.6; for (var t = 0.3; t < 1; t += 0.28) { var a = [f[0][0], f[0][1] + d * t * (k ? 1 : 0.7)], b = [f[1][0], f[1][1] + d * t * (k ? 0.7 : 1)]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      for (t = 0.12; t < 1; t += 0.14) { var c = q(f[0], f[1], t); g.beginPath(); g.moveTo(c[0], c[1] + 6); g.lineTo(c[0] + 3, c[1] + d * 0.6); g.stroke(); } g.restore(); });
    // grass lip, then the rounded-diamond top
    function top(dy, grow) { var cx = (Lx[0] + Rx[0]) / 2, cy = (Bk[1] + Fr[1]) / 2, pts = [Lx, Bk, Rx, Fr].map(function (p) { return [cx + (p[0] - cx) * grow, cy + (p[1] - cy) * grow + dy]; }); g.beginPath();
      for (var i = 0; i < 4; i++) { var a = pts[i], b = pts[(i + 1) % 4], m0 = q(a, b, 0.12), m1 = q(a, b, 0.88); if (!i) g.moveTo(m0[0], m0[1]); else g.quadraticCurveTo(a[0], a[1], m0[0], m0[1]); g.lineTo(m1[0], m1[1]); } g.quadraticCurveTo(pts[0][0], pts[0][1], q(pts[0], pts[1], 0.12)[0], q(pts[0], pts[1], 0.12)[1]); g.closePath(); }
    top(7, 1.02); g.fillStyle = '#2a7a24'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#123a10'; g.stroke();
    top(0, 1); g.fillStyle = T.lin(g, 0, Bk[1], 0, Fr[1], [0, '#b8f47a', 0.55, '#6ac84a', 1, '#3a9a32']); g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#1a5a1a'; g.stroke();
    g.save(); top(0, 1); g.clip(); g.fillStyle = 'rgba(255,255,200,.18)'; for (i = 0; i < 26; i++) { g.beginPath(); g.ellipse(Lx[0] + r() * (Rx[0] - Lx[0]), Bk[1] + r() * (Fr[1] - Bk[1]), 6 + r() * 8, 2 + r() * 2, 0, 0, TAU); g.fill(); } g.restore();
    return top;
  }
  function path(g, pts, w) { g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(function (p, i) { g[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); g.strokeStyle = '#8a6a3a'; g.lineWidth = w + 3; g.stroke(); g.strokeStyle = '#e0c08a'; g.lineWidth = w; g.stroke(); g.restore(); }
  function rock(g, T, x, y, s) { g.beginPath(); g.moveTo(x - 9 * s, y); g.lineTo(x - 6 * s, y - 7 * s); g.lineTo(x + 2 * s, y - 9 * s); g.lineTo(x + 9 * s, y - 3 * s); g.lineTo(x + 8 * s, y); g.closePath(); g.fillStyle = T.lin(g, x - 9 * s, y - 9 * s, x + 9 * s, y, [0, '#e0e2e8', 0.5, '#a0a4ae', 1, '#5a5e68']); g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#2a2a34'; g.stroke(); }
  function globe(g, T, L, full) {
    g.save(); g.beginPath(); g.arc(CX, CY, 222, 0, TAU); g.clip();
    g.fillStyle = T.rad(g, CX, CY - 20, 20, 240, [0, '#fff4e4', 0.3, '#e4d4ff', 0.58, '#9a9cf4', 0.82, '#4a5ad0', 1, '#22287e']); g.fillRect(CX - 230, CY - 230, 460, 460);   /* gl-r20: twilight globe */
    T.mystic(g, CX - 222, CY - 222, 444, 300, { seed: 61, nebula: [[CX - 120, CY - 140, 110, 'rgba(190,100,255,.7)', 0.45], [CX + 130, CY - 130, 110, 'rgba(60,230,220,.7)', 0.4]],
      aurora: [{ y: CY - 150, amp: 18, h: 80, cols: ['rgba(110,255,210,.95)', 'rgba(120,140,255,.6)'], a: 0.55, f: 1.2, x0: CX - 222, x1: CX + 222 }, { y: CY - 175, amp: 12, h: 60, cols: ['rgba(255,140,235,.9)', 'rgba(170,100,255,.5)'], a: 0.4, f: 1.7, ph: 2.2, x0: CX - 222, x1: CX + 222 }],
      rays: full ? { x: CX, y: CY - 60, n: 14, len: 250, col: 'rgba(255,236,200,.9)', a: 0.16, spread: Math.PI * 2, rot: 0 } : null, moon: { x: CX - 138, y: CY - 132, r: 13 }, stars: full ? 60 : 30 });
    [[350, 300, 34], [676, 290, 30], [420, 480, 34], [640, 470, 30]].forEach(function (c) { g.fillStyle = 'rgba(244,232,255,.8)'; [[0, 0, 1], [-0.9, 0.2, 0.7], [0.9, 0.2, 0.7]].forEach(function (q) { g.beginPath(); g.arc(c[0] + q[0] * c[2], c[1] + q[1] * c[2], q[2] * c[2], 0, TAU); g.fill(); }); });
    // lower block: trees, rocks, a waterfall off its left edge
    falls(g, T, 372, 372, 470, 16); block(g, T, [[350, 352], [500, 318], [664, 350], [478, 392]], 34, 92, 9); falls(g, T, 380, 366, 462, 12);
    path(g, [[380, 356], [430, 362], [470, 352], [520, 362]], 4);
    [[402, 346], [430, 372], [458, 340], [536, 344], [560, 372], [590, 352], [620, 364], [506, 382], [380, 364], [640, 352]].forEach(function (p, i) { if (full || i < 6) pine(g, T, p[0], p[1], 0.9); });
    [[446, 384, 1.1], [600, 380, 1], [520, 366, 0.8], [366, 354, 0.8], [652, 364, 0.9]].forEach(function (q) { rock(g, T, q[0], q[1], q[2]); });
    // upper block + town, paths between the houses
    falls(g, T, 376, 212, 300, 14); falls(g, T, 650, 214, 290, 12);
    block(g, T, [[338, 204], [500, 136], [690, 206], [528, 264]], 40, 70, 5);
    path(g, [[372, 214], [420, 222], [470, 214], [516, 196]], 5); path(g, [[516, 196], [560, 210], [612, 214], [660, 206]], 5); path(g, [[516, 196], [520, 230], [528, 254]], 5);
    house(g, T, 418, 206, 1.35); house(g, T, 458, 230, 1.1); house(g, T, 590, 234, 1);
    tower(g, T, 604, 222, 9, 40, 0); g.fillStyle = '#7a5a3a'; g.fillRect(594, 180, 20, 4); tower(g, T, 650, 202, 11, 38, 24);
    [[366, 208], [392, 196], [628, 238], [674, 214], [446, 188], [600, 196], [548, 250], [480, 252], [400, 226]].forEach(function (p, i) { if (full || i < 6) pine(g, T, p[0], p[1], 1); });
    [[438, 244, 0.8], [628, 222, 0.7], [560, 240, 0.7]].forEach(function (q) { rock(g, T, q[0], q[1], q[2]); });
    if (full) { g.fillStyle = '#4a4a5a'; [[486, 214], [500, 222], [548, 222], [570, 214]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1] - 6, 2.5, 0, TAU); g.fill(); g.fillRect(p[0] - 2, p[1] - 4, 4, 6); }); }
    g.restore();
    // glass shine on the globe
    g.save(); g.globalAlpha = 0.3; g.fillStyle = T.rad(g, 430, 150, 4, 120, [0, '#ffffff', 1, 'rgba(255,255,255,0)']); g.beginPath(); g.arc(CX, CY, 222, 0, TAU); g.fill(); g.restore();
  }
  function castle(g, T) {   // drawn over the ring so its towers rise past the rim, like the picture
    g.save(); g.translate(516, 180); g.scale(1.18, 1.18); g.translate(-516, -158);
    g.fillStyle = T.lin(g, 450, 0, 580, 0, [0, '#f0e8d8', 0.5, '#cfc2a8', 1, '#8a806c']); g.fillRect(468, 116, 96, 42); g.lineWidth = 1.5; g.strokeStyle = '#4a4030'; g.strokeRect(468, 116, 96, 42); for (var i = 468; i < 564; i += 12) { g.fillStyle = '#d8ccb4'; g.fillRect(i, 110, 7, 6); }
    g.strokeStyle = 'rgba(90,80,60,.35)'; g.lineWidth = 1; for (var y = 124; y < 158; y += 8) { g.beginPath(); g.moveTo(468, y); g.lineTo(564, y); g.stroke(); }
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(516, 146, 9, Math.PI, TAU); g.fillRect(507, 146, 18, 12); g.fill();
    tower(g, T, 470, 150, 12, 54, 32); tower(g, T, 562, 150, 12, 54, 32); tower(g, T, 516, 112, 19, 42, 38); tower(g, T, 494, 128, 9, 30, 22); flag(g, 516, 30, '#ffd23a'); flag(g, 470, 66, '#ffd23a'); flag(g, 562, 66, '#ffd23a');
    g.restore();
  }
  function ring(g, T, L) {
    g.save(); g.lineWidth = 34; g.strokeStyle = INK; g.beginPath(); g.arc(CX, CY, 238, 0, TAU); g.stroke();
    g.lineWidth = 28; g.strokeStyle = T.lin(g, CX - 240, CY - 240, CX + 240, CY + 240, [0, '#b8bec8', 0.5, '#6a707a', 1, '#3a3e46']); g.stroke();
    // knot band: two interlaced waves
    g.lineWidth = 3.4; g.lineCap = 'round'; ['#2a2e36', '#d8dce4'].forEach(function (c, k) { g.strokeStyle = c; for (var w = 0; w < 2; w++) { g.beginPath(); for (var i = 0; i <= 360; i++) { var a = i / 360 * TAU, rr = 238 + Math.sin(a * 36 + w * Math.PI) * 8; var x = CX + Math.cos(a) * rr + (k ? -0.8 : 0.8), y = CY + Math.sin(a) * rr + (k ? -0.8 : 0.8); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); } });
    [[222, 5], [254, 6]].forEach(function (q) { g.lineWidth = q[1]; g.strokeStyle = T.lin(g, CX - 260, CY - 260, CX + 260, CY + 260, [0, L.gold[0], 0.35, L.gold[1], 0.65, L.gold[2], 1, L.gold[1]]); g.beginPath(); g.arc(CX, CY, q[0], 0, TAU); g.stroke(); });
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(function (a) { g.save(); g.translate(CX + Math.cos(a) * 238, CY + Math.sin(a) * 238); g.rotate(a); g.beginPath(); g.moveTo(-10, 0); g.lineTo(0, -16); g.lineTo(10, 0); g.lineTo(0, 16); g.closePath(); g.fillStyle = T.lin(g, -10, -16, 10, 16, [0, L.gold[0], 0.5, L.gold[1], 1, L.gold[2]]); g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.restore(); });
    g.restore();
  }
  function swirl(g, T, front, full) {   // golden comet trail round the ring (an ellipse tilted down-left)
    g.save(); g.translate(CX, CY + 10); g.rotate(-0.42); var A = 330, B = 128; g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    var a0 = front ? 0.35 : -2.8, a1 = front ? 3.3 : 0.35;
    for (var k = 0; k < 3; k++) { for (var i = 0; i < 80; i++) { var t = i / 80, a = a0 + (a1 - a0) * t, b = a0 + (a1 - a0) * (t + 1 / 80); var wv = (front ? Math.sin(t * Math.PI) : t) * [26, 15, 5][k]; g.strokeStyle = ['rgba(255,150,20,.38)', 'rgba(255,200,60,.55)', 'rgba(255,240,190,.62)'][k];   /* gl-r19: a thicker comet band */ g.lineWidth = Math.max(0.5, wv); g.beginPath(); g.moveTo(Math.cos(a) * A, Math.sin(a) * B); g.lineTo(Math.cos(b) * A, Math.sin(b) * B); g.stroke(); } }
    var r = T.rng(front ? 3 : 4); for (i = 0; i < (full ? 140 : 50); i++) { var aa = a0 + (a1 - a0) * r(), d = (r() - 0.5) * 44; g.fillStyle = ['#fff6c0', '#ffd23a', '#ffb02a'][i % 3]; g.beginPath(); g.arc(Math.cos(aa) * (A + d), Math.sin(aa) * (B + d * 0.5), 0.8 + r() * 2.4, 0, TAU); g.fill(); }
    g.restore();
  }
  /* ---------- the two heroes, one-piece ---------- */
  function knight(g, T) {   /* gl-r19: smaller (× 0.84), leaning into the sword, head 0.84 and tilted — the picture's knight is livelier */
    g.save(); g.translate(262, 238); g.rotate(-0.07); g.scale(0.84, 0.84); g.translate(-276, -262);
    var HT = function (h) { h.translate(270, 190); h.rotate(-0.12); h.scale(0.84, 0.84); h.translate(-270, -190); };
    var SK = ['#ffe0c4', '#f0b48a', '#c88058'], AR = ['#e8e0ff', '#a898e0', '#5a4aa8'];
    // flame behind the shoulder
    g.save(); g.globalCompositeOperation = 'lighter'; [[318, 150, 30, '#ff7a1a'], [308, 128, 22, '#ffb02a'], [326, 168, 18, '#ff5a1a']].forEach(function (f) { g.fillStyle = T.rad(g, f[0], f[1], 2, f[2], [0, '#fff4c0', 0.4, f[3], 1, 'rgba(255,60,0,0)']); g.beginPath(); g.moveTo(f[0] - f[2] * 0.6, f[1] + f[2] * 0.6); g.quadraticCurveTo(f[0] - f[2], f[1] - f[2] * 0.4, f[0], f[1] - f[2] * 1.4); g.quadraticCurveTo(f[0] + f[2], f[1] - f[2] * 0.4, f[0] + f[2] * 0.6, f[1] + f[2] * 0.6); g.closePath(); g.fill(); }); g.restore();
    // the sword (behind the fist): blade up-left
    g.save(); g.translate(196, 232); g.rotate(-0.93); g.beginPath(); g.moveTo(-11, -10); g.lineTo(-13, -118); g.lineTo(0, -138); g.lineTo(13, -118); g.lineTo(11, -10); g.closePath(); g.fillStyle = T.lin(g, -13, 0, 13, 0, [0, '#ffffff', 0.45, '#d8e4f4', 0.55, '#98a8c0', 1, '#c8d4e8']); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.strokeStyle = 'rgba(120,140,170,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -14); g.lineTo(0, -126); g.stroke();
    g.fillStyle = T.lin(g, -26, 0, 26, 0, [0, '#fff2b0', 0.5, '#e8b030', 1, '#9a6a10']); T.rr(g, -26, -12, 52, 10, 4); g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#6a3a1a'; g.fillRect(-5, -2, 10, 22); g.strokeRect(-5, -2, 10, 22); g.beginPath(); g.arc(0, 24, 6, 0, TAU); g.fillStyle = '#f0c040'; g.fill(); g.stroke(); g.restore();
    var P = {
      body: function (h) { h.beginPath(); h.moveTo(214, 214); h.bezierCurveTo(222, 186, 312, 180, 330, 212); h.bezierCurveTo(338, 240, 330, 262, 326, 276); h.lineTo(334, 312); h.lineTo(214, 312); h.lineTo(222, 276); h.bezierCurveTo(212, 256, 208, 236, 214, 214); h.closePath(); h.fill(); },   /* gl-r19: + armour skirt so nothing is cut above the word */
      padL: function (h) { h.beginPath(); h.ellipse(222, 206, 26, 20, -0.5, 0, TAU); h.fill(); },
      padR: function (h) { h.beginPath(); h.ellipse(318, 204, 26, 20, 0.5, 0, TAU); h.fill(); },
      armR: function (h) { T.limb(h, [326, 214, 344, 240, 330, 262], 22, 18, 2); h.beginPath(); h.ellipse(326, 262, 15, 13, 0, 0, TAU); h.fill(); },
      armL: function (h) { T.limb(h, [222, 214, 196, 222, 194, 238], 22, 20, 2); h.beginPath(); h.ellipse(196, 236, 16, 15, 0, 0, TAU); h.fill(); },
      neck: function (h) { h.fillRect(256, 168, 26, 24); },
      head: function (h) { h.beginPath(); h.ellipse(268, 140, 40, 42, -0.05, 0, TAU); h.fill(); h.beginPath(); h.ellipse(230, 146, 8, 11, 0, 0, TAU); h.fill(); },
      hair: function (h) { h.beginPath(); h.moveTo(226, 140); h.bezierCurveTo(220, 104, 238, 88, 250, 92); h.lineTo(248, 76); h.lineTo(268, 90); h.lineTo(276, 70); h.lineTo(288, 92); h.lineTo(308, 84); h.lineTo(304, 104); h.bezierCurveTo(316, 116, 310, 132, 306, 140); h.bezierCurveTo(298, 118, 286, 112, 266, 116); h.bezierCurveTo(250, 118, 236, 126, 226, 140); h.closePath(); h.fill(); }
    };
    T.onePiece(g, T, { x0: 170, y0: 50, W: 200, H: 272, rim: INK, rimW: 4, parts: P, order: ['armR', 'body', 'padR', 'neck', 'head', 'hair', 'padL', 'armL'], tf: { head: HT, hair: HT },
      colour: function (B, put, inside) {
        put(B, 'armR', T.lg(B, 320, 210, 340, 270, [0, AR[1], 1, AR[2]]));
        put(B, 'body', T.lg(B, 214, 190, 330, 276, [0, AR[0], 0.4, AR[1], 1, AR[2]]));
        inside(B, 'body', function (h) { h.fillStyle = T.lg(h, 0, 196, 0, 276, [0, '#5a7af0', 1, '#2a3aa8']); h.beginPath(); h.moveTo(240, 206); h.lineTo(304, 206); h.lineTo(296, 276); h.lineTo(248, 276); h.closePath(); h.fill(); h.strokeStyle = '#f0c040'; h.lineWidth = 5; h.stroke(); h.fillStyle = '#f0c040'; h.beginPath(); h.moveTo(272, 222); h.lineTo(284, 236); h.lineTo(272, 250); h.lineTo(260, 236); h.closePath(); h.fill(); h.fillStyle = T.lg(h, 0, 274, 0, 312, [0, AR[1], 1, AR[2]]); h.fillRect(210, 272, 130, 42); h.strokeStyle = 'rgba(20,10,50,.5)'; h.lineWidth = 2; [246, 274, 302].forEach(function (x) { h.beginPath(); h.moveTo(x, 276); h.lineTo(x, 312); h.stroke(); }); h.fillStyle = '#7a3a1a'; h.fillRect(218, 262, 112, 12); h.fillStyle = '#f0c040'; h.fillRect(264, 260, 16, 16); });
        put(B, 'padR', T.rg(B, 312, 196, 2, 30, [0, AR[0], 0.6, AR[1], 1, AR[2]])); inside(B, 'padR', function (h) { h.strokeStyle = '#f0c040'; h.lineWidth = 4; h.beginPath(); h.ellipse(318, 204, 22, 16, 0.5, 0.2, 3.0); h.stroke(); });
        put(B, 'neck', SK[2]); put(B, 'head', T.rg(B, 258, 128, 6, 50, [0, SK[0], 0.7, SK[1], 1, SK[2]]));
        put(B, 'hair', T.lg(B, 230, 70, 300, 140, [0, '#c87a3a', 0.6, '#8a4a1a', 1, '#5a2a0a']));
        inside(B, 'hair', function (h) { h.strokeStyle = 'rgba(255,200,140,.6)'; h.lineWidth = 3; [[250, 100, 262, 118], [276, 92, 280, 112], [296, 98, 296, 118]].forEach(function (l) { h.beginPath(); h.moveTo(l[0], l[1]); h.lineTo(l[2], l[3]); h.stroke(); }); });
        put(B, 'padL', 'rgba(20,10,40,.3)', 4, 6); put(B, 'padL', T.rg(B, 216, 198, 2, 30, [0, AR[0], 0.6, AR[1], 1, AR[2]])); inside(B, 'padL', function (h) { h.strokeStyle = '#f0c040'; h.lineWidth = 4; h.beginPath(); h.ellipse(222, 206, 22, 16, -0.5, 0.2, 3.0); h.stroke(); });
        put(B, 'armL', T.lg(B, 222, 214, 194, 240, [0, AR[1], 1, AR[2]])); inside(B, 'armL', function (h) { h.fillStyle = '#7a4a2a'; h.beginPath(); h.ellipse(196, 236, 16, 15, 0, 0, TAU); h.fill(); });
      } });
    // face: smirk, brows, eyes
    g.save(); HT(g); g.lineCap = 'round'; g.strokeStyle = '#5a2a0a'; g.lineWidth = 4; g.beginPath(); g.moveTo(244, 128); g.lineTo(260, 124); g.moveTo(278, 124); g.lineTo(296, 126); g.stroke();
    g.fillStyle = '#fff'; [[254, 142], [288, 142]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 7, 8, 0, 0, TAU); g.fill(); }); g.fillStyle = '#3a6a2a'; [[256, 143], [290, 143]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 4.5, 0, TAU); g.fill(); }); g.fillStyle = '#fff'; [[257.5, 141], [291.5, 141]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 1.5, 0, TAU); g.fill(); });
    g.strokeStyle = '#7a2a1a'; g.lineWidth = 3; g.beginPath(); g.moveTo(258, 164); g.quadraticCurveTo(276, 172, 292, 158); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(262, 165); g.quadraticCurveTo(276, 170, 288, 162); g.lineTo(286, 166); g.quadraticCurveTo(276, 171, 264, 167); g.closePath(); g.fill(); g.restore();
    g.restore();
  }
  function wizard(g, T) { g.save(); g.translate(-6, -26); wizard0(g, T); g.restore(); }   /* gl-r19: up so the robe shows above the word */
  function wizard0(g, T) {
    var SK = ['#ffe4cc', '#f4bc94', '#c88a60'], RB = ['#7ab0ff', '#3a6ad8', '#1a2a7a'], PU = ['#c89aff', '#7a3ad0', '#3a1a7a'];
    // staff behind the hand + orb
    g.save(); g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(828, 268); g.lineTo(852, 150); g.stroke(); g.strokeStyle = T.lin(g, 820, 0, 860, 0, [0, '#c88a4a', 1, '#6a3a12']); g.lineWidth = 6; g.stroke();
    g.strokeStyle = '#d8b060'; g.lineWidth = 4; g.beginPath(); g.arc(858, 132, 16, 2.2, 5.6); g.stroke();
    g.shadowColor = '#5ad8ff'; g.shadowBlur = 24; g.beginPath(); g.arc(860, 128, 10, 0, TAU); g.fillStyle = T.rad(g, 857, 124, 1, 11, [0, '#ffffff', 0.4, '#9af0ff', 1, '#2a8ae8']); g.fill(); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 860, 128, 2, 40, [0, 'rgba(120,230,255,.7)', 1, 'rgba(0,120,255,0)']); g.fillRect(820, 88, 80, 80); g.restore();
    var P = {
      robe: function (h) { h.beginPath(); h.moveTo(758, 202); h.bezierCurveTo(770, 190, 810, 190, 822, 204); h.bezierCurveTo(834, 230, 840, 262, 846, 282); h.lineTo(744, 282); h.bezierCurveTo(748, 256, 750, 226, 758, 202); h.closePath(); h.fill(); },
      cape: function (h) { h.beginPath(); h.moveTo(748, 198); h.bezierCurveTo(770, 214, 812, 214, 832, 198); h.lineTo(826, 186); h.bezierCurveTo(806, 198, 772, 198, 754, 186); h.closePath(); h.fill(); },
      armL: function (h) { T.limb(h, [760, 210, 738, 218, 724, 208], 18, 15, 2); h.beginPath(); h.ellipse(718, 204, 12, 9, -0.4, 0, TAU); h.fill(); [[-14, -6], [-12, 2], [-10, 8]].forEach(function (f) { T.limb(h, [718, 204, 718 + f[0] * 0.6, 204 + f[1] * 0.6, 718 + f[0], 204 + f[1]], 5, 4); }); },
      armR: function (h) { T.limb(h, [820, 212, 838, 230, 838, 214], 18, 15, 2); h.beginPath(); h.ellipse(840, 212, 10, 10, 0, 0, TAU); h.fill(); },
      hairB: function (h) { h.beginPath(); h.moveTo(762, 172); h.bezierCurveTo(752, 200, 758, 226, 770, 236); h.lineTo(778, 196); h.lineTo(806, 196); h.lineTo(816, 236); h.bezierCurveTo(830, 222, 832, 196, 820, 172); h.closePath(); h.fill(); },
      head: function (h) { h.beginPath(); h.ellipse(791, 176, 26, 28, 0, 0, TAU); h.fill(); },
      hat: function (h) { h.beginPath(); h.ellipse(791, 158, 50, 12, -0.06, 0, TAU); h.fill(); h.beginPath(); h.moveTo(758, 156); h.bezierCurveTo(764, 124, 778, 110, 800, 108); h.bezierCurveTo(814, 106, 822, 96, 812, 82); h.bezierCurveTo(836, 92, 832, 118, 826, 156); h.closePath(); h.fill(); }
    };
    T.onePiece(g, T, { x0: 690, y0: 70, W: 180, H: 220, rim: INK, rimW: 3.2, parts: P, order: ['hairB', 'robe', 'armR', 'cape', 'armL', 'head', 'hat'],
      colour: function (B, put, inside) {
        put(B, 'hairB', T.lg(B, 760, 170, 820, 236, [0, PU[0], 1, PU[2]]));
        put(B, 'robe', T.lg(B, 750, 196, 846, 282, [0, RB[0], 0.45, RB[1], 1, RB[2]])); inside(B, 'robe', function (h) { h.fillStyle = '#e8b030'; h.fillRect(744, 238, 104, 8); h.strokeStyle = 'rgba(255,220,120,.8)'; h.lineWidth = 3; h.beginPath(); h.moveTo(790, 208); h.lineTo(790, 282); h.stroke(); });
        put(B, 'armR', RB[2]); inside(B, 'armR', function (h) { h.fillStyle = SK[1]; h.beginPath(); h.ellipse(840, 212, 10, 10, 0, 0, TAU); h.fill(); });
        put(B, 'cape', T.lg(B, 750, 186, 830, 214, [0, PU[0], 0.5, PU[1], 1, PU[2]]));
        put(B, 'armL', T.lg(B, 760, 210, 716, 204, [0, RB[1], 1, RB[0]])); inside(B, 'armL', function (h) { h.fillStyle = SK[0]; h.beginPath(); h.ellipse(718, 204, 12, 9, -0.4, 0, TAU); h.fill(); [[-14, -6], [-12, 2], [-10, 8]].forEach(function (f) { h.save(); h.fillStyle = SK[0]; T.limb(h, [718, 204, 718 + f[0] * 0.6, 204 + f[1] * 0.6, 718 + f[0], 204 + f[1]], 5, 4); h.restore(); }); });
        put(B, 'head', T.rg(B, 784, 170, 4, 32, [0, SK[0], 0.7, SK[1], 1, SK[2]]));
        inside(B, 'head', function (h) { h.fillStyle = T.lg(h, 0, 150, 0, 180, [0, PU[1], 1, PU[0]]); h.beginPath(); h.moveTo(764, 176); h.bezierCurveTo(768, 156, 790, 152, 812, 158); h.bezierCurveTo(800, 162, 792, 170, 786, 166); h.bezierCurveTo(780, 170, 770, 172, 764, 176); h.closePath(); h.fill(); });
        put(B, 'hat', T.lg(B, 760, 80, 830, 160, [0, PU[0], 0.45, PU[1], 1, PU[2]])); inside(B, 'hat', function (h) { h.fillStyle = '#e8b030'; h.beginPath(); h.ellipse(791, 152, 34, 5, -0.06, 0, TAU); h.fill(); });
      } });
    g.save(); g.fillStyle = '#fff'; [[781, 180], [802, 180]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 5.5, 6.5, 0, 0, TAU); g.fill(); }); g.fillStyle = '#5a2ab8'; [[782, 181], [803, 181]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 3.8, 0, TAU); g.fill(); }); g.fillStyle = '#fff'; [[783, 179.5], [804, 179.5]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 1.2, 0, TAU); g.fill(); });
    g.strokeStyle = '#3a1a5a'; g.lineWidth = 2.4; g.lineCap = 'round'; [[776, 172, 786, 171], [797, 171, 807, 172]].forEach(function (b) { g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[2], b[3]); g.stroke(); }); g.strokeStyle = '#b84a4a'; g.beginPath(); g.arc(792, 192, 5, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
    g.fillStyle = 'rgba(255,120,140,.35)'; [[774, 190], [810, 190]].forEach(function (c) { g.beginPath(); g.ellipse(c[0], c[1], 5, 3, 0, 0, TAU); g.fill(); }); g.restore();
  }
  /* ---------- the word (gl-r19 draft 2): carved serif capitals (T.serif) like the picture — AVATA gold, REALM royal blue, the R bigger ---------- */
  function word(g, T, L, cx, base, size, glow) {
    var GD = [0, '#ffe680', 0.45, '#f4b81c', 0.8, '#c87a0a', 1, '#7a3e04'], BL = [0, '#a8d4ff', 0.45, '#2a72e8', 0.8, '#163aa8', 1, '#0a1858'];
    var o = { condense: 1.04, spacing: 0.035, dark: INK, outline: size * 0.13, depth: size * 0.07, side: '#1a1008', ring: '#ffe08a', ringW: size * 0.045,
      light: 0.45, glow: glow ? 'rgba(255,190,60,.32)' : null, glowBlur: 0.2, glowN: 2, scale: function (j) { return j === 5 ? 1.3 : 1; }, face: function (j) { return j < 5 ? GD : BL; } };
    T.serif(g, 'AVATAREALM', cx, base, size, o);
  }
  function emblem(g, T, L, full, glow) {
    swirl(g, T, false, full); ring(g, T, L); globe(g, T, L, full); castle(g, T);
    if (full) { ship(g, T, 330, 392, 1, true); ship(g, T, 584, 456, 0.9); ship(g, T, 686, 424, 0.8); }
    swirl(g, T, true, full);
  }
  function stars(g, T, full) { [[374, 74, 14], [612, 44, 18], [776, 262, 14], [196, 270, 12], [760, 70, 10], [346, 486, 10], [860, 300, 9], [650, 254, 12]].forEach(function (s, i) { if (full || i < 4) GameLogos.tools.spark(g, s[0], s[1], s[2], i % 2 ? '#fff6c8' : '#ffe08a', 1); }); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { back(g, T, L); faces(g, T, 0.55); emblem(g, T, L, true); knight(g, T); wizard(g, T); word(g, T, L, 500, 340, 84, true); stars(g, T, true); return; }
    if (kind === 'main') { g.translate(-62, -16); var f = px >= 300; emblem(g, T, L, f); knight(g, T); wizard(g, T); word(g, T, L, 500, 340, 84, f); stars(g, T, f); return; }
    if (kind === 'wide') { g.save(); g.translate(100, 100); g.scale(0.34, 0.34); g.translate(-CX, -CY); emblem(g, T, L, false); g.restore(); word(g, T, L, 540, 146, 66, false); return; }
    if (kind === 'badge') { g.save(); g.translate(200, 196); g.scale(0.66, 0.66); g.translate(-CX, -CY); emblem(g, T, L, false); g.restore(); if (px >= 90) { g.save(); g.translate(200, 236); g.scale(0.52, 0.52); word(g, T, L, 0, 0, 72, false); g.restore(); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO avatarealm END
