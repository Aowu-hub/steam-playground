// 🏷️ LOGO turbo START — 🏎️ Turbo Trail, drawn in code from Aowu's picture (gl-25, round 9). A neon frame (purple → cyan) with progress bars, slanted
// fire-orange "TURBO" with speed streaks over neon blue-green "TRAIL", our own red sports car with yellow stripes and a flame trail racing a looping road;
// cones, striped barriers, tyres, gears, a bomb with a face, coins, checkered flags, splashes, a "Level Up!" tag (scene + main only).
// Looks = Turbo.html THEMES (roadtrip · space · jungle · dragon · horse · ship): road, frame and sky colours.
GameLogos.add('turbo', (function () {
  var BOX = { scene: [1024, 572], main: [880, 540], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { bg: ['#1a1f3a', '#0a0e1c', '#04060c'], road: '#4A4E57', line: '#ffd23a', frame: ['#b04aff', '#3ad8ff'], car: '#e8202a', fire: ['#fff2a0', '#ffb01a', '#ff4a1a'] }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}), roadtrip: mk({ bg: ['#2a5a2a', '#123018', '#061008'], road: '#4A4E57', frame: ['#7ae84a', '#ffd23a'] }), space: mk({ bg: ['#2a2266', '#0E0B2A', '#04030f'], road: '#2A2266', line: '#7FE7FF', frame: ['#FF4DD8', '#7FE7FF'] }),
    jungle: mk({ bg: ['#2E6B33', '#123018', '#06100a'], road: '#9A6B3E', frame: ['#ffd23a', '#7ae84a'] }), dragon: mk({ bg: ['#86CDF5', '#3a7ab8', '#14305a'], road: '#c8d8e8', line: '#ff8a3a', frame: ['#ff5a8a', '#ffd23a'] }),
    horse: mk({ bg: ['#5E9E45', '#2a4a1a', '#101a08'], road: '#C79A5A', line: '#fff', frame: ['#ff8a3a', '#ffd23a'] }), ship: mk({ bg: ['#2E86C1', '#123a5a', '#06141e'], road: '#2E86C1', line: '#fff', frame: ['#3ad8ff', '#ffffff'] }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#14080c';
  function road(g, T, L, pts, w) {
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; function p() { g.beginPath(); g.moveTo(pts[0], pts[1]); g.bezierCurveTo(pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]); }
    p(); g.lineWidth = w + 12; g.strokeStyle = 'rgba(0,0,0,.6)'; g.stroke(); p(); g.lineWidth = w + 6; g.strokeStyle = sh(L.road, 0.35); g.stroke(); p(); g.lineWidth = w; g.strokeStyle = L.road; g.stroke();
    p(); g.setLineDash([18, 16]); g.lineWidth = 4; g.strokeStyle = L.line; g.stroke(); g.setLineDash([]); g.restore();
  }
  function frame(g, T, L, glow, bars) {
    g.save(); T.rr(g, 272, 42, 486, 476, 70); g.fillStyle = T.rad(g, 512, 280, 20, 340, [0, '#1a2448', 1, '#0a0e22']); g.fill();
    g.lineWidth = 10; g.strokeStyle = T.lin(g, 272, 0, 758, 0, [0, L.frame[0], 1, L.frame[1]]); if (glow) { g.shadowColor = L.frame[1]; g.shadowBlur = 26; } g.stroke(); g.shadowBlur = 0;
    T.rr(g, 284, 54, 462, 452, 60); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.35)'; g.stroke(); g.restore();
    if (bars) { T.rr(g, 378, 66, 302, 20, 10); g.fillStyle = '#0a1028'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#3a4a7a'; g.stroke(); T.rr(g, 382, 70, 160, 12, 6); g.fillStyle = T.lin(g, 382, 0, 542, 0, [0, '#3ad8ff', 1, '#7ae84a']); g.fill();
      T.rr(g, 416, 478, 80, 20, 8); g.fillStyle = '#0a1028'; g.fill(); g.stroke(); T.rr(g, 420, 482, 72, 12, 6); g.fillStyle = T.lin(g, 420, 0, 492, 0, [0, '#3ad8ff', 1, '#2a8af0']); g.fill(); }
  }
  /* ---------- props ---------- */
  function cone(g, T, x, y, k, col) { g.save(); g.translate(x, y); g.scale(k, k); g.beginPath(); g.moveTo(-6, -46); g.lineTo(6, -46); g.lineTo(18, 0); g.lineTo(-18, 0); g.closePath(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.fillStyle = T.lin(g, -18, 0, 18, 0, [0, sh(col, 0.3), 1, sh(col, -0.3)]); g.fill(); g.fillStyle = '#fff'; g.fillRect(-11, -30, 22, 8); g.fillRect(-15, -14, 30, 6); T.rr(g, -26, -4, 52, 10, 3); g.fillStyle = sh(col, -0.2); g.fill(); g.stroke(); g.restore(); }
  function barrier(g, T, x, y, w, rot) { g.save(); g.translate(x, y); g.rotate(rot); T.rr(g, -w / 2, -14, w, 28, 5); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#ff8a1a'; g.fill(); g.save(); g.clip(); g.fillStyle = '#fff';
    for (var i = -w; i < w; i += 22) { g.beginPath(); g.moveTo(i, 14); g.lineTo(i + 11, 14); g.lineTo(i + 25, -14); g.lineTo(i + 14, -14); g.closePath(); g.fill(); } g.restore(); g.fillStyle = '#6a7080'; g.fillRect(-w / 2 + 8, 14, 6, 22); g.fillRect(w / 2 - 14, 14, 6, 22); g.restore(); }
  function tyre(g, T, x, y, r, a) { g.save(); g.translate(x, y); g.rotate(a || 0); g.beginPath(); g.ellipse(0, 0, r, r * 0.92, 0, 0, TAU); g.fillStyle = '#20222a'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#000'; g.stroke();
    g.beginPath(); g.ellipse(0, 0, r * 0.5, r * 0.46, 0, 0, TAU); g.fillStyle = T.rad(g, -r * 0.1, -r * 0.1, 1, r * 0.5, [0, '#e8eef8', 1, '#7a8494']); g.fill(); g.strokeStyle = '#4a4e58'; g.lineWidth = 2; for (var i = 0; i < 5; i++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(i * 1.256) * r * 0.45, Math.sin(i * 1.256) * r * 0.42); g.stroke(); } g.restore(); }
  function gear(g, T, x, y, r) { g.save(); g.translate(x, y); g.beginPath(); for (var i = 0; i < 16; i++) { var a = i * TAU / 16, q = i % 2 ? r : r * 1.28; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); g.fillStyle = T.lin(g, -r, -r, r, r, [0, '#e8eef8', 1, '#7a8494']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#2a2e38'; g.stroke(); g.beginPath(); g.arc(0, 0, r * 0.38, 0, TAU); g.fillStyle = '#2a2e38'; g.fill(); g.restore(); }
  function bomb(g, T, x, y) { g.beginPath(); g.arc(x, y, 22, 0, TAU); g.fillStyle = T.rad(g, x - 7, y - 7, 2, 24, [0, '#5a6070', 1, '#14161c']); g.fill(); g.lineWidth = 4; g.strokeStyle = '#000'; g.stroke();
    g.strokeStyle = '#8a6a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 12, y - 18); g.quadraticCurveTo(x - 22, y - 34, x - 34, y - 32); g.stroke(); T.spark(g, x - 36, y - 34, 10, '#ffd23a', 1);
    [[-7, -3], [7, -3]].forEach(function (e) { g.beginPath(); g.ellipse(x + e[0], y + e[1], 5, 6, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(x + e[0] + 1, y + e[1] + 1, 2.5, 0, TAU); g.fillStyle = '#000'; g.fill(); });
    g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y + 6, 7, 0.2, Math.PI - 0.2); g.stroke(); }
  function coin(g, T, x, y, r) { g.beginPath(); g.ellipse(x, y, r * 0.86, r, 0, 0, TAU); g.fillStyle = T.lin(g, x - r, y - r, x + r, y + r, [0, '#fff2a0', 0.5, '#ffc21a', 1, '#c8800a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#8a5a04'; g.stroke(); g.beginPath(); g.ellipse(x, y, r * 0.55, r * 0.68, 0, 0, TAU); g.stroke(); }
  function flag(g, T, x, y, k) { g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#ccc'; g.fillRect(-2, 0, 4, 40); for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#fff'; g.fillRect(2 + i * 7, j * 7 + Math.sin(i) * 2, 7, 7); } g.restore(); }
  function splash(g, T, x, y, a, k) { g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k); g.fillStyle = T.lin(g, 0, -40, 0, 20, [0, '#d8f4ff', 1, '#3a9ae8']); for (var i = 0; i < 5; i++) { g.beginPath(); g.ellipse(-20 + i * 10, -10 - (i % 2) * 14, 6, 18, -0.6 + i * 0.3, 0, TAU); g.fill(); } g.restore(); }
  function arrow(g, T, x, y, a, len) { g.save(); g.translate(x, y); g.rotate(a); g.shadowColor = '#3a8aff'; g.shadowBlur = 10; g.fillStyle = T.lin(g, -len, 0, 0, 0, [0, 'rgba(60,140,255,0)', 1, '#3a8aff']); g.fillRect(-len, -6, len, 12);
    g.beginPath(); g.moveTo(22, 0); g.lineTo(-4, -18); g.lineTo(-4, 18); g.closePath(); g.fillStyle = '#5aa8ff'; g.fill(); g.restore(); }
  function tag(g, T) { g.save(); g.translate(806, 74); g.rotate(-0.12); T.rr(g, -42, -26, 84, 52, 12); g.fillStyle = '#1a1030'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#ffd23a'; g.stroke(); g.font = '700 20px ' + T.FONT; g.textAlign = 'center'; g.fillStyle = '#ffd23a'; g.fillText('Level', 0, -3); g.fillText('Up!', 0, 19); g.restore(); }
  /* ---------- our own car (one piece) + flame trail ---------- */
  function fire(g, T, L) { g.save(); g.globalCompositeOperation = 'lighter';
    [[34, 0.35], [24, 0.6], [12, 0.9]].forEach(function (q, i) { g.beginPath(); g.moveTo(812, 344); g.quadraticCurveTo(880, 280, 874, 150); g.quadraticCurveTo(904, 250, 824, 392); g.closePath(); g.fillStyle = T.lin(g, 812, 360, 874, 150, [0, L.fire[2 - i], 1, 'rgba(255,90,20,0)']); g.globalAlpha = q[1]; g.fill(); g.translate(4, 6); });
    g.restore(); }
  function car(g, T, L) {
    var C = L.car, P = {
      wheelB: function (h) { h.beginPath(); h.ellipse(802, 422, 19, 23, -0.2, 0, TAU); h.fill(); },
      body: function (h) { h.beginPath(); h.moveTo(600, 466); h.lineTo(598, 432); h.quadraticCurveTo(606, 410, 636, 402); h.lineTo(690, 388); h.lineTo(726, 352); h.quadraticCurveTo(760, 336, 796, 340); h.lineTo(818, 360); h.lineTo(824, 396); h.quadraticCurveTo(822, 414, 806, 420); h.lineTo(760, 440); h.lineTo(704, 470); h.quadraticCurveTo(650, 480, 600, 466); h.closePath(); h.fill(); },
      wheelF: function (h) { h.beginPath(); h.ellipse(700, 470, 21, 24, -0.15, 0, TAU); h.fill(); h.beginPath(); h.ellipse(608, 468, 12, 16, 0, 0, TAU); h.fill(); }
    };
    T.onePiece(g, T, { x0: 580, y0: 320, W: 260, H: 180, rim: INK, rimW: 4.2, parts: P, order: ['wheelB', 'body', 'wheelF'],
      colour: function (B, put, inside) {
        put(B, 'wheelB', '#1a1c24');
        put(B, 'body', T.lg(B, 640, 360, 820, 440, [0, sh(C, 0.35), 0.5, C, 1, sh(C, -0.35)]));
        inside(B, 'body', function (h) {
          h.fillStyle = sh(C, -0.25); h.beginPath(); h.moveTo(600, 466); h.lineTo(598, 432); h.lineTo(690, 446); h.lineTo(704, 470); h.closePath(); h.fill();   // the front face
          h.fillStyle = '#1a1c24'; GameLogos.tools.rr(h, 618, 448, 54, 12, 4); h.fill(); h.strokeStyle = '#4a4e58'; h.lineWidth = 2; for (var i = 0; i < 5; i++) { h.beginPath(); h.moveTo(626 + i * 10, 449); h.lineTo(624 + i * 10, 459); h.stroke(); }
          h.fillStyle = T.lg(h, 700, 350, 800, 390, [0, '#9ad8ff', 0.5, '#2a6ab8', 1, '#0a1a4a']); h.beginPath(); h.moveTo(700, 386); h.lineTo(730, 356); h.quadraticCurveTo(760, 344, 792, 348); h.lineTo(806, 364); h.lineTo(786, 384); h.closePath(); h.fill();
          h.strokeStyle = sh(C, -0.4); h.lineWidth = 4; h.beginPath(); h.moveTo(760, 346); h.lineTo(752, 386); h.stroke();
          h.fillStyle = 'rgba(255,255,255,.5)'; h.beginPath(); h.moveTo(712, 380); h.lineTo(734, 360); h.lineTo(742, 360); h.lineTo(720, 382); h.closePath(); h.fill();
          h.fillStyle = '#ffd23a'; [[0, 0], [20, 3]].forEach(function (o) { h.beginPath(); h.moveTo(616 + o[0], 432 + o[1]); h.lineTo(688 + o[0] * 0.6, 392 + o[1] * 0.3); h.lineTo(700 + o[0] * 0.6, 392 + o[1] * 0.3); h.lineTo(630 + o[0], 434 + o[1]); h.closePath(); h.fill(); });
          h.beginPath(); h.moveTo(740, 350); h.lineTo(784, 342); h.lineTo(788, 348); h.lineTo(746, 356); h.closePath(); h.fill();
          h.fillStyle = 'rgba(255,255,255,.45)'; h.beginPath(); h.ellipse(650, 408, 22, 5, -0.25, 0, TAU); h.fill(); h.fillStyle = 'rgba(60,0,0,.25)'; h.beginPath(); h.moveTo(704, 470); h.lineTo(824, 406); h.lineTo(824, 440); h.lineTo(704, 490); h.closePath(); h.fill();
          h.fillStyle = '#fff6c8'; h.beginPath(); h.ellipse(608, 440, 9, 6, 0.1, 0, TAU); h.ellipse(680, 452, 10, 6, 0.1, 0, TAU); h.fill(); });
        put(B, 'wheelF', '#1a1c24'); inside(B, 'wheelF', function (h) { h.fillStyle = T.rg(h, 700, 468, 2, 14, [0, '#f0f4fa', 1, '#7a8494']); h.beginPath(); h.ellipse(702, 470, 11, 14, -0.15, 0, TAU); h.fill(); });
      } });
    g.save(); g.globalCompositeOperation = 'lighter'; [[608, 440], [680, 452]].forEach(function (p) { g.fillStyle = T.rad(g, p[0], p[1], 1, 26, [0, 'rgba(255,255,220,1)', 0.3, 'rgba(255,240,170,.55)', 1, 'rgba(255,240,170,0)']); g.beginPath(); g.arc(p[0], p[1], 26, 0, TAU); g.fill(); }); g.restore();
  }
  function bigCar(g, T, L) { g.save(); g.translate(515, 300); g.scale(1.7, 1.7); g.translate(-712, -400); fire(g, T, L); car(g, T, L); g.restore(); }
  function words(g, T, L, cx, y1, s1, y2, s2, streaks) {
    var A = { spacing: s1 * 0.01, dark: '#3a0a04', outline: s1 * 0.16, depth: s1 * 0.09, fat: s1 * 0.006, ring: '#ffd27a', skew: -0.24, rot: -0.03, glow: 'rgba(255,120,40,.7)', glowBlur: 0.3,
      edge: function () { return '#a8300a'; }, edgeW: s1 * 0.06, face: function () { return [0, L.fire[0], 0.45, L.fire[1], 1, L.fire[2]]; } };
    var B = { spacing: s2 * 0.02, dark: '#04122a', outline: s2 * 0.14, depth: s2 * 0.08, fat: s2 * 0.006, ring: '#7aff6a', skew: -0.24, rot: -0.03, glow: 'rgba(90,255,140,.8)', glowBlur: 0.3, glowN: 2,
      edge: function () { return '#0a3a8a'; }, edgeW: s2 * 0.05, face: function () { return [0, '#b8f8ff', 0.45, '#3ad8ff', 1, '#2a6af0']; } };
    if (streaks) { g.save(); g.lineCap = 'round'; [[y1 - s1 * 0.6, 70], [y1 - s1 * 0.36, 100], [y1 - s1 * 0.12, 56], [y2 - s2 * 0.45, 50]].forEach(function (q, i) { var x1 = cx - s1 * 1.5, x0 = x1 - q[1]; g.fillStyle = T.lin(g, x0, 0, x1, 0, [0, 'rgba(255,120,30,0)', 1, i < 3 ? '#ff9a2a' : '#7aff6a']); g.beginPath(); g.moveTo(x0, q[0]); g.lineTo(x1, q[0] - 7); g.lineTo(x1, q[0] + 7); g.closePath(); g.fill(); }); g.restore();
      g.save(); g.strokeStyle = '#7aff6a'; g.shadowColor = '#7aff6a'; g.shadowBlur = 10; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - s2 * 1.6, y2 + 18); g.lineTo(cx + s2 * 1.4, y2 + 10); g.moveTo(cx + s2 * 1.2, y2 - s2 * 0.95); g.lineTo(cx + s2 * 2, y2 - s2 * 0.98); g.stroke(); g.restore(); }
    T.word(g, 'TRAIL', cx + 8, y2, s2, B); T.gloss(g, 'TRAIL', cx + 8, y2, s2, B, 0.4);
    T.word(g, 'TURBO', cx - 6, y1, s1, A); T.gloss(g, 'TURBO', cx - 6, y1, s1, A, 0.5);
  }
  function all(g, T, L, full) {
    road(g, T, L, [250, 40, 60, 160, 40, 420, 190, 560], 64); road(g, T, L, [780, 40, 940, 160, 900, 360, 560, 580], 70);
    if (full) { splash(g, T, 128, 112, -0.4, 1.1); splash(g, T, 96, 360, -1.2, 1.2); }
    tyre(g, T, 180, 150, 18, 0.3); gear(g, T, 210, 160, 14); gear(g, T, 218, 236, 20); bomb(g, T, 156, 206); barrier(g, T, 144, 270, 74, -0.15); barrier(g, T, 176, 324, 90, 0.05); tyre(g, T, 232, 392, 34, 0);
    barrier(g, T, 168, 430, 60, -0.6); g.fillStyle = '#6a7080'; [[136, 480, 18], [176, 494, 14], [200, 470, 10]].forEach(function (r) { g.beginPath(); g.arc(r[0], r[1], r[2], 0, TAU); g.fill(); });
    frame(g, T, L, full, full); tyre(g, T, 800, 180, 22, 0.5);
    if (full) tag(g, T); arrow(g, T, 640, 116, -0.85, 70); arrow(g, T, 868, 56, -0.9, 60); flag(g, T, 776, 82, 0.9); flag(g, T, 876, 82, 0.9); flag(g, T, 930, 230, 1);
    [[868, 150], [886, 196], [902, 240], [920, 330], [880, 286]].forEach(function (c) { coin(g, T, c[0], c[1], 15); }); g.beginPath(); g.arc(940, 286, 20, 0, TAU); g.fillStyle = '#8a8e98'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#2a2e38'; g.stroke();
    fire(g, T, L); car(g, T, L); cone(g, T, 800, 528, 1.2, '#ff8a1a'); cone(g, T, 846, 504, 1, '#b86aff'); cone(g, T, 880, 466, 0.9, '#5ad84a');
    var r = T.rng(25), Cc = ['#ff5aa8', '#ffd23a', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff']; for (var q = 0; q < (full ? 36 : 14); q++) { g.save(); g.translate(30 + r() * 960, 20 + r() * 530); g.rotate(r() * TAU); g.fillStyle = Cc[q % 6]; GameLogos.tools.rr(g, -6, -2.5, 12, 5, 2); g.fill(); g.restore(); }
    for (q = 0; q < 14; q++) T.spark(g, 40 + r() * 950, 30 + r() * 500, 4 + r() * 7, '#fff', 0.8);
    [[520, 132], [566, 116], [610, 106]].forEach(function (s, i) { g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], 16 + i * 2, 7 + i); g.fill(); g.lineWidth = 2; g.strokeStyle = '#8a5a04'; g.stroke(); });
    words(g, T, L, 500, 248, 146, 366, 128, true);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 40, 620, [0, L.bg[0], 0.6, L.bg[1], 1, L.bg[2]]); g.fillRect(0, 0, 1024, 572); all(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-72, -16); all(g, T, L, px >= 300); return; }
    if (kind === 'wide') { g.save(); g.translate(20, 12); g.scale(0.37, 0.37); g.translate(-272, -42); frame(g, T, L, false, false); g.save(); T.rr(g, 272, 42, 486, 476, 70); g.clip(); bigCar(g, T, L); g.restore(); g.restore();
      words(g, T, L, 540, 96, 84, 182, 74, false); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.8, 0.8); g.translate(-515, -280); frame(g, T, L, false, false); g.save(); T.rr(g, 272, 42, 486, 476, 70); g.clip(); if (px >= 90) { fire(g, T, L); car(g, T, L); words(g, T, L, 512, 240, 108, 350, 100, false); } else bigCar(g, T, L); g.restore(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO turbo END
