// 🏷️ LOGO block-drop START — 🧱 Block Drop, drawn in code from Aowu's picture (gl-24, round 8). Glossy falling pieces in the game's OWN shapes + colours
// (SHAPES I O T L J S Z, THEMES col order I O T L J S Z), "Block" with every letter built from blocks (tile seams inside each letter), pink "Drop",
// sparkle trails, fireworks, drop arrows, a purple grid sky with faded blocks. Looks = the game's THEMES (classic · faces · dino · cargo · fantasy · jigsaw).
GameLogos.add('block-drop', (function () {
  var BOX = { scene: [1024, 572], main: [724, 500], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(col, bg) { return { col: col, bg: bg, dark: '#1a0838' }; }
  var LOOK = { classic: mk(['#3FD0E0', '#FFD23F', '#A06CF5', '#FF8A3D', '#3D8BFD', '#4CB963', '#FF5A5F'], ['#7a4ae8', '#3a1a9a', '#120838']),
    faces: mk(['#5ED6E8', '#FFD94F', '#B98CFF', '#FF9E57', '#5C9DFF', '#62CC77', '#FF6F73'], ['#8a6af0', '#4a2fb8', '#1a1050']),
    dino: mk(['#6DBE45', '#C9D84A', '#3E9B5A', '#D4A64A', '#2E7D5B', '#8BC34A', '#C0763E'], ['#a8703a', '#5a3418', '#1e1006']),
    cargo: mk(['#7FB3D5', '#F7DC6F', '#C39BD3', '#E0A458', '#5D8AA8', '#82E0AA', '#F1948A'], ['#2a3a8a', '#101a4a', '#03040F']),
    fantasy: mk(['#7AE7FF', '#FFD36E', '#B57CFF', '#FF9D6E', '#8FA8FF', '#7DFFB2', '#FF7AD9'], ['#b04ac8', '#5a1a7a', '#1e0628']),
    jigsaw: mk(['#A8DADC', '#E9C46A', '#B5838D', '#F4A261', '#7FA7D6', '#8AB17D', '#E76F51'], ['#a8806a', '#5a4436', '#241a14']) };
  var SH = { I: [[0, 0], [0, 1], [0, 2], [0, 3]], O: [[0, 0], [1, 0], [0, 1], [1, 1]], T: [[0, 0], [1, 0], [2, 0], [1, 1]], L: [[0, 0], [0, 1], [0, 2], [1, 2]], J: [[1, 0], [1, 1], [1, 2], [0, 2]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]] };
  var CI = { I: 0, O: 1, T: 2, L: 3, J: 4, S: 5, Z: 6 };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  function cell(g, T, x, y, s, c) {
    var r = s * 0.16; T.rr(g, x, y, s, s, r); g.fillStyle = T.lin(g, x, y, x + s, y + s, [0, sh(c, 0.45), 0.45, c, 1, sh(c, -0.35)]); g.fill();
    g.lineWidth = s * 0.06; g.strokeStyle = sh(c, -0.55); g.stroke();
    T.rr(g, x + s * 0.17, y + s * 0.17, s * 0.66, s * 0.66, r * 0.7); g.fillStyle = T.lin(g, x, y, x + s, y + s, [0, sh(c, 0.2), 1, sh(c, -0.1)]); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; T.rr(g, x + s * 0.12, y + s * 0.08, s * 0.5, s * 0.1, s * 0.05); g.fill();
  }
  function piece(g, T, L, k, x, y, s, rot, glow) {
    var cs = SH[k], c = L.col[CI[k]], mx = 0, my = 0; cs.forEach(function (p) { mx = Math.max(mx, p[0]); my = Math.max(my, p[1]); });
    g.save(); g.translate(x + (mx + 1) * s / 2, y + (my + 1) * s / 2); if (rot) g.rotate(rot); g.translate(-(mx + 1) * s / 2, -(my + 1) * s / 2);
    if (glow) { g.shadowColor = c; g.shadowBlur = 30; } g.shadowOffsetY = glow ? 0 : 6; if (!glow) { g.shadowColor = 'rgba(10,0,40,.45)'; g.shadowBlur = 14; }
    cs.forEach(function (p) { T.rr(g, p[0] * s, p[1] * s, s, s, s * 0.16); g.fillStyle = sh(c, -0.5); g.fill(); }); g.shadowColor = 'transparent';
    cs.forEach(function (p) { cell(g, T, p[0] * s, p[1] * s, s, c); }); g.restore();
  }
  /* ---------- background ---------- */
  function sky(g, T, L, x, y, w, h, full) {
    g.fillStyle = T.rad(g, x + w / 2, y + h * 0.45, 20, Math.max(w, h) * 0.7, [0, L.bg[0], 0.5, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h);
    g.fillStyle = T.rad(g, x + w / 2, y + h * 0.5, 10, Math.min(w, h) * 0.55, [0, 'rgba(255,150,120,.45)', 0.5, 'rgba(255,90,180,.18)', 1, 'rgba(255,90,180,0)']); g.fillRect(x, y, w, h);
    g.save(); g.strokeStyle = 'rgba(200,170,255,.12)'; g.lineWidth = 2; for (var gx = x; gx < x + w; gx += 48) { g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); } for (var gy = y; gy < y + h; gy += 48) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); } g.restore();
    if (full) { g.save(); g.globalAlpha = 0.3; var r = T.rng(5), K = 'IOTLJSZ'; [[0, 470], [0, 520], [48, 520], [96, 520], [920, 0], [968, 0], [968, 48], [920, 470], [968, 470], [920, 520], [968, 520], [872, 520], [0, 0], [48, 0], [0, 260], [968, 260]].forEach(function (p, i) { cell(g, T, p[0], p[1], 48, L.col[i % 7]); }); g.restore(); }
  }
  function trail(g, T, pts, col) { g.save(); g.lineCap = 'round'; g.globalCompositeOperation = 'lighter';
    for (var i = 3; i >= 1; i--) { g.lineWidth = i * 5; g.strokeStyle = col.replace('A', String(0.12 * (4 - i))); g.beginPath(); g.moveTo(pts[0], pts[1]); g.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); g.stroke(); } g.restore(); }
  function firework(g, T, x, y, dir, n, len) { g.save(); g.lineCap = 'round'; var r = T.rng(x | 0);
    for (var i = 0; i < n; i++) { var a = dir + (r() - 0.5) * 2.2, l = len * (0.5 + r() * 0.6); g.strokeStyle = ['#ffd23a', '#ff8a3a', '#fff2a0'][i % 3]; g.lineWidth = 3 + r() * 2; g.shadowColor = '#ffb03a'; g.shadowBlur = 8;
      g.beginPath(); g.moveTo(x + Math.cos(a) * l * 0.35, y + Math.sin(a) * l * 0.35); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } g.restore(); }
  function drops(g, T) { g.save(); g.lineCap = 'round'; [[332, 440, 50], [356, 470, 40], [474, 476, 44], [512, 462, 60], [550, 480, 40], [590, 474, 46], [694, 440, 50], [712, 470, 34]].forEach(function (d, i) {
      var c = i % 2 ? '#ffb8f0' : '#e8e0ff'; g.strokeStyle = c; g.lineWidth = 3; g.shadowColor = c; g.shadowBlur = 8; g.beginPath(); g.moveTo(d[0], d[1]); g.lineTo(d[0], d[1] + d[2]); g.stroke();
      g.beginPath(); g.moveTo(d[0] - 7, d[1] + d[2] - 8); g.lineTo(d[0], d[1] + d[2]); g.lineTo(d[0] + 7, d[1] + d[2] - 8); g.stroke(); }); g.restore(); }
  function gems(g, T, L) { [[402, 78, 0], [232, 248, 6], [280, 200, 1], [750, 128, 4], [810, 168, 5], [758, 214, 6], [222, 168, 3]].forEach(function (p) { g.save(); g.translate(p[0], p[1]); g.rotate(0.5); var c = L.col[p[2]];
      g.beginPath(); g.moveTo(0, -12); g.lineTo(10, 0); g.lineTo(0, 12); g.lineTo(-10, 0); g.closePath(); g.fillStyle = T.lin(g, -10, -12, 10, 12, [0, sh(c, 0.5), 1, sh(c, -0.3)]); g.fill(); g.lineWidth = 2; g.strokeStyle = sh(c, -0.55); g.stroke(); g.restore(); }); }
  function pieces(g, T, L) {
    trail(g, T, [196, 270, 220, 120, 360, 96], 'rgba(160,200,255,A)'); trail(g, T, [200, 300, 260, 150, 400, 120], 'rgba(255,180,240,A)'); trail(g, T, [840, 250, 820, 120, 700, 90], 'rgba(160,220,255,A)');
    piece(g, T, L, 'S', 560, 150, 50, 0); piece(g, T, L, 'Z', 328, 118, 50, 0); piece(g, T, L, 'J', 446, 70, 50, 0); piece(g, T, L, 'T', 518, 70, 50, 0);
    piece(g, T, L, 'I', 672, 70, 46, 0.16, true); piece(g, T, L, 'O', 784, 40, 26, 0.45); piece(g, T, L, 'L', 236, 176, 20, -0.5); gems(g, T, L);
  }
  /* ---------- the words: "Block" built from blocks ---------- */
  function seams(g, T, str, cx, base, size, o, step) {
    var c = document.createElement('canvas'); c.width = g.canvas.width; c.height = g.canvas.height; var h = c.getContext('2d'); h.setTransform(g.getTransform());
    T.word(h, str, cx, base, size, { clean: o.clean, spacing: o.spacing, wave: o.wave, rot: o.rot, dark: 'rgba(0,0,0,0)', outline: 0.01, depth: 0, face: function () { return [0, '#fff', 1, '#fff']; } });
    var m = c; c = document.createElement('canvas'); c.width = m.width; c.height = m.height; h = c.getContext('2d'); h.setTransform(g.getTransform()); h.lineCap = 'butt';   // lines on their own canvas, then kept only inside the letters
    var x0 = cx - size * 3, x1 = cx + size * 3, y0 = base - size, y1 = base + size * 0.3, k = size * 0.02;
    for (var yy = base - size * 0.1; yy > y0; yy -= step) { h.strokeStyle = 'rgba(0,0,40,.4)'; h.lineWidth = k * 1.3; h.beginPath(); h.moveTo(x0, yy); h.lineTo(x1, yy); h.stroke(); h.strokeStyle = 'rgba(255,255,255,.45)'; h.lineWidth = k * 0.7; h.beginPath(); h.moveTo(x0, yy + k * 1.1); h.lineTo(x1, yy + k * 1.1); h.stroke(); }
    for (var xx = cx - size * 2.52; xx < x1; xx += step) { h.strokeStyle = 'rgba(0,0,40,.35)'; h.lineWidth = k * 1.3; h.beginPath(); h.moveTo(xx, y0); h.lineTo(xx, y1); h.stroke(); h.strokeStyle = 'rgba(255,255,255,.35)'; h.lineWidth = k * 0.7; h.beginPath(); h.moveTo(xx + k * 1.1, y0); h.lineTo(xx + k * 1.1, y1); h.stroke(); }
    h.setTransform(1, 0, 0, 1, 0, 0); h.globalCompositeOperation = 'destination-in'; h.drawImage(m, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c, 0, 0); g.restore();
  }
  function block(g, T, L, cx, base, size) {
    var C = [L.col[4], L.col[0], L.col[5], L.col[1], L.col[3]];
    var o = { clean: true, spacing: size * 0.02, dark: L.dark, outline: size * 0.1, depth: size * 0.08, fat: size * 0.004, ring: 'rgba(255,255,255,.92)', glow: 'rgba(200,160,255,.6)', glowBlur: 0.3,   /* gl-r19: clean: true = the B's two holes are closed (no Fredoka notch) */
      edge: function (j) { return sh(C[j], -0.5); }, edgeW: size * 0.04, face: function (j) { return [0, sh(C[j], 0.45), 0.5, C[j], 1, sh(C[j], -0.25)]; }, wave: function (j) { return [0, -2, 0, 2, 0][j] * size / 150; } };
    T.word(g, 'Block', cx, base, size, o); seams(g, T, 'Block', cx, base, size, o, size * 0.36); T.gloss(g, 'Block', cx, base, size, o, 0.45);
  }
  function drop(g, T, L, cx, base, size) {
    var p = L.col[6], q = L.col[2];
    var o = { spacing: size * 0.02, dark: L.dark, outline: size * 0.15, depth: size * 0.08, fat: size * 0.006, ring: 'rgba(255,255,255,.92)', glow: 'rgba(255,120,220,.6)', glowBlur: 0.3,
      edge: function () { return sh(p, -0.5); }, edgeW: size * 0.06, face: function () { return [0, sh(p, 0.5), 0.5, p, 1, sh(q, -0.15)]; }, wave: function (j) { return [0, 2, 2, 0][j] * size / 120; } };
    T.word(g, 'Drop', cx, base, size, o); T.gloss(g, 'Drop', cx, base, size, o, 0.45);
  }
  function stage(g, T, L, full) {
    if (full) { firework(g, T, 240, 340, Math.PI, 14, 90); firework(g, T, 790, 340, 0, 14, 90); firework(g, T, 300, 420, 2.4, 8, 70); firework(g, T, 730, 420, 0.7, 8, 70); }
    pieces(g, T, L); drops(g, T); block(g, T, L, 512, 352, 152); drop(g, T, L, 516, 476, 124);
    if (full) { var r = T.rng(8); for (var i = 0; i < 20; i++) T.spark(g, 220 + r() * 600, 60 + r() * 460, 4 + r() * 8, '#fff', 0.85); [[300, 410], [750, 380], [620, 250]].forEach(function (s) { g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], 11, 5); g.fill(); }); }
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { sky(g, T, L, 0, 0, 1024, 572, true); stage(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-150, -30); stage(g, T, L, px >= 300); return; }
    if (kind === 'wide') { g.save(); g.translate(20, 10); g.scale(0.5, 0.5); g.translate(-330, -40); piece(g, T, L, 'T', 330, 160, 60, 0); piece(g, T, L, 'J', 420, 40, 60, 0); piece(g, T, L, 'S', 470, 220, 60, 0); piece(g, T, L, 'I', 610, 60, 60, 0.14, true); g.restore();
      block(g, T, L, 430, 148, 112); drop(g, T, L, 730, 148, 100); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 10, 10, 380, 380, 72); g.clip(); sky(g, T, L, 10, 10, 380, 380, false); g.translate(200, 200); g.scale(0.62, 0.62); g.translate(-512, -290);
      if (px >= 90) stage(g, T, L, false); else { piece(g, T, L, 'Z', 380, 180, 70, 0); piece(g, T, L, 'J', 470, 40, 70, 0); piece(g, T, L, 'T', 520, 250, 70, 0); piece(g, T, L, 'I', 650, 80, 70, 0.14, true); } g.restore();
      T.rr(g, 10, 10, 380, 380, 72); g.lineWidth = 8; g.strokeStyle = sh(L.bg[0], 0.3); g.stroke(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO block-drop END
