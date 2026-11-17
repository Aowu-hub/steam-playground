// 🏷️ LOGO maze START — 🧭 Maze Explorer, drawn in code from Aowu's picture (gl-23, round 8). A REAL round neon maze (a perfect polar maze, made by a
// seeded walk, so it always has exactly one way through) in a glowing rounded-square badge; the explorer kid (pith helmet, backpack, torch with a beam —
// one-piece); the game's own dangers around it: a lava volcano, tornadoes, a flood wave, jungle ruins, a glowing tile path; "MAZE" orange-gold over
// "EXPLORER" green. One look.
GameLogos.add('maze', (function () {
  var BOX = { scene: [1024, 572], main: [728, 520], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  var LOOK = { classic: { bg: ['#16283a', '#0a1420', '#05090f'], plate: ['#1a2a5a', '#0e1838'], rim: '#38d8ff', walls: ['#38a8ff', '#48d86a', '#a86aff', '#38d0ff', '#7ae84a', '#c87aff'], dark: '#3a1404',
    maze: ['#fff6a0', '#ffc21a', '#ff7a1a'], exp: ['#d8ff8a', '#5ad84a', '#1a8a3a'] } };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#1a0c08', CX = 512, CY = 280;
  /* ---------- a perfect polar maze ---------- */
  var MZ = null;
  function build() {
    if (MZ) return MZ;
    var N = [1, 8, 16, 16, 32, 32, 32], R0 = 44, DR = 31, rng = GameLogos.tools.rng(23), cells = [];
    N.forEach(function (n, r) { for (var i = 0; i < n; i++) cells.push({ r: r, i: i, id: cells.length, out: false, cw: false, inw: false }); });
    function at(r, i) { var s = 0; for (var k = 0; k < r; k++) s += N[k]; return cells[s + ((i % N[r]) + N[r]) % N[r]]; }
    function nb(c) { var L = []; if (c.r > 0) { if (N[c.r] > 1) { L.push([at(c.r, c.i + 1), 'cw']); L.push([at(c.r, c.i - 1), 'ccw']); } L.push([at(c.r - 1, Math.floor(c.i * N[c.r - 1] / N[c.r])), 'in']); }
      if (c.r < N.length - 1) { var k = N[c.r + 1] / N[c.r]; for (var j = 0; j < k; j++) L.push([at(c.r + 1, c.i * k + j), 'out']); } else if (c.r === 0) {} return L; }
    var seen = {}, open = {}, stack = [cells[0]]; seen[0] = 1;
    function key(a, b) { return a < b ? a + '-' + b : b + '-' + a; }
    while (stack.length) { var c = stack[stack.length - 1], opts = nb(c).filter(function (q) { return !seen[q[0].id]; });
      if (!opts.length) { stack.pop(); continue; } var p = opts[Math.floor(rng() * opts.length)][0]; open[key(c.id, p.id)] = 1; seen[p.id] = 1; stack.push(p); }
    MZ = { N: N, R0: R0, DR: DR, at: at, open: function (a, b) { return !!open[key(a.id, b.id)]; }, cells: cells, exit: 9 };
    return MZ;
  }
  function wallCol(L, a) { var t = ((a / TAU) % 1 + 1) % 1; return L.walls[t < 0.25 ? 1 : t < 0.5 ? 3 : t < 0.75 ? 2 : 0]; }
  function maze(g, T, L, glow) {
    var M = build(), N = M.N, rOf = function (r) { return M.R0 + (r - 1) * M.DR; }, Rout = rOf(N.length);
    g.save(); g.lineCap = 'round'; g.lineWidth = 9;
    var segs = []; function seg(f, a) { segs.push([f, wallCol(L, a)]); }
    for (var r = 1; r < N.length; r++) { var n = N[r], ri = rOf(r), ro = rOf(r + 1);
      for (var i = 0; i < n; i++) { var c = M.at(r, i), a0 = -Math.PI / 2 + i * TAU / n, a1 = a0 + TAU / n;
        // inner arc of this cell: open when this cell connects inwards (ring 1 always opens to the middle)
        var inner = M.at(r - 1, Math.floor(i * N[r - 1] / n)); if (!M.open(c, inner)) (function (a0, a1, ri) { seg(function () { g.arc(CX, CY, ri, a0, a1); }, (a0 + a1) / 2); })(a0, a1, ri);
        // the radial wall at the start of the cell
        var prev = M.at(r, i - 1); if (!M.open(c, prev)) (function (a0, ri, ro) { seg(function () { g.moveTo(CX + Math.cos(a0) * ri, CY + Math.sin(a0) * ri); g.lineTo(CX + Math.cos(a0) * ro, CY + Math.sin(a0) * ro); }, a0); })(a0, ri, ro);
      } }
    var n = N[N.length - 1]; for (i = 0; i < n; i++) { if (i === M.exit) continue; var a0 = -Math.PI / 2 + i * TAU / n; (function (a0) { seg(function () { g.arc(CX, CY, Rout, a0, a0 + TAU / n); }, a0 + 0.1); })(a0); }
    // tube walls: a dark under-stroke, the colour (with a glow), then a light top line
    g.lineWidth = 17; g.strokeStyle = 'rgba(4,8,30,.85)'; segs.forEach(function (q) { g.beginPath(); q[0](); g.stroke(); });
    g.lineWidth = 12; segs.forEach(function (q) { g.strokeStyle = q[1]; if (glow) { g.shadowColor = q[1]; g.shadowBlur = 14; } g.beginPath(); q[0](); g.stroke(); }); g.shadowBlur = 0;
    g.lineWidth = 3.5; g.strokeStyle = 'rgba(255,255,255,.4)'; segs.forEach(function (q) { g.save(); g.translate(-2, -2); g.beginPath(); q[0](); g.stroke(); g.restore(); });
    g.restore();
  }
  /* ---------- the world around it ---------- */
  function plate(g, T, L, glowOn) {
    g.save(); T.rr(g, 292, 52, 440, 448, 70); g.fillStyle = T.rad(g, CX, CY, 20, 300, [0, L.plate[0], 1, L.plate[1]]); g.fill();
    g.lineWidth = 10; g.strokeStyle = T.lin(g, 292, 52, 732, 500, [0, L.rim, 0.5, '#4a7aff', 1, L.rim]); if (glowOn) { g.shadowColor = L.rim; g.shadowBlur = 26; } g.stroke(); g.restore();
    T.rr(g, 300, 60, 424, 432, 64); g.lineWidth = 3; g.strokeStyle = 'rgba(160,240,255,.45)'; g.stroke();
  }
  function volcano(g, T) {
    g.save(); g.lineJoin = 'round';
    g.beginPath(); g.moveTo(214, 336); g.lineTo(256, 210); g.quadraticCurveTo(272, 196, 290, 210); g.lineTo(330, 330); g.closePath(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
    g.fillStyle = T.lin(g, 214, 0, 330, 0, [0, '#7a3a24', 0.5, '#5a2a1a', 1, '#3a1a10']); g.fill();
    g.fillStyle = '#ff7a1a'; g.beginPath(); g.moveTo(258, 212); g.quadraticCurveTo(272, 204, 288, 212); g.lineTo(296, 252); g.quadraticCurveTo(290, 270, 284, 252); g.lineTo(278, 236); g.lineTo(270, 290); g.quadraticCurveTo(262, 300, 258, 280); g.lineTo(262, 240); g.lineTo(250, 256); g.closePath(); g.fill();
    g.fillStyle = '#ffd23a'; g.beginPath(); g.ellipse(272, 214, 14, 6, 0, 0, TAU); g.fill();
    var P = [[272, 200, 13], [272, 184, 15], [240, 156, 22], [304, 156, 22], [256, 136, 26], [290, 134, 26], [272, 118, 24], [226, 146, 14], [318, 146, 14]];   // the blast cloud
    P.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], p[2] + 4, 0, TAU); g.fillStyle = INK; g.fill(); }); P.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], p[2], 0, TAU); g.fillStyle = T.rad(g, p[0] - 6, p[1] - 6, 2, p[2], [0, '#ffd27a', 0.5, '#ff8a2a', 1, '#e8501a']); g.fill(); });
    [[224, 200], [312, 194], [236, 236]].forEach(function (d) { g.beginPath(); g.ellipse(d[0], d[1], 6, 9, 0.4, 0, TAU); g.fillStyle = '#ff6a1a'; g.fill(); });
    g.restore();
  }
  function tornado(g, T, x, y, k) { g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round';
    for (var i = 0; i < 6; i++) { var w = 34 - i * 5, yy = -30 + i * 11; g.beginPath(); g.ellipse(Math.sin(i * 1.3) * 5, yy, w, 6, 0, 0, TAU); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.lineWidth = 4.5; g.strokeStyle = i % 2 ? '#8a9ab4' : '#c8d4e4'; g.stroke(); } g.restore(); }
  function wave(g, T) { g.save(); g.lineJoin = 'round';
    g.beginPath(); g.moveTo(206, 460); g.bezierCurveTo(200, 410, 240, 370, 280, 386); g.bezierCurveTo(250, 392, 244, 420, 268, 428); g.bezierCurveTo(286, 434, 300, 440, 318, 460); g.closePath();
    g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.fillStyle = T.lin(g, 0, 380, 0, 460, [0, '#7ad8ff', 0.5, '#2a8ae0', 1, '#1a4ab8']); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(222, 412); g.bezierCurveTo(234, 386, 262, 378, 280, 386); g.bezierCurveTo(258, 388, 240, 400, 236, 416); g.closePath(); g.fill();
    [[214, 444, 6], [300, 450, 5], [276, 372, 4], [286, 380, 7], [296, 390, 5], [262, 376, 6], [304, 402, 4]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fill(); });
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3; g.beginPath(); g.moveTo(230, 452); g.quadraticCurveTo(236, 430, 254, 424); g.moveTo(262, 452); g.quadraticCurveTo(272, 440, 290, 446); g.stroke(); g.restore(); }
  function ruins(g, T) { g.save();
    g.fillStyle = '#2a6a2a'; [[810, 300, 40], [790, 360, 46], [836, 380, 34]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fill(); });
    [[760, 316], [812, 316]].forEach(function (p) { g.fillStyle = T.lin(g, p[0], 0, p[0] + 22, 0, [0, '#c8b890', 1, '#8a7a5a']); g.fillRect(p[0], p[1], 22, 76); g.lineWidth = 3; g.strokeStyle = INK; g.strokeRect(p[0], p[1], 22, 76); });
    g.fillStyle = T.lin(g, 0, 300, 0, 318, [0, '#d8c8a0', 1, '#9a8a6a']); g.fillRect(750, 300, 94, 18); g.strokeRect(750, 300, 94, 18);
    function leaf(x, y, a, s, c) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.5, -s * 0.35, s, 0); g.quadraticCurveTo(s * 0.5, s * 0.35, 0, 0); g.fillStyle = c; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(0,40,0,.6)'; g.stroke(); g.restore(); }
    [[760, 300, -2.4, 44], [800, 296, -1.2, 40], [846, 330, -0.4, 46], [744, 390, 2.6, 40], [830, 396, 0.3, 44], [770, 408, 1.9, 38], [852, 290, -0.9, 36]].forEach(function (l, i) { leaf(l[0], l[1], l[2], l[3], i % 2 ? '#5ad84a' : '#2aa83a'); });
    g.restore(); }
  function tiles(g, T) { g.save(); g.translate(766, 418); g.transform(1, 0.28, -0.9, 0.5, 0, 0); g.shadowColor = '#c86aff'; g.shadowBlur = 14;
    g.fillStyle = 'rgba(80,30,160,.85)'; g.fillRect(-10, -50, 110, 80); g.lineWidth = 4; g.strokeStyle = '#d88aff'; g.strokeRect(-10, -50, 110, 80);
    g.beginPath(); g.moveTo(-10, -10); g.lineTo(40, -10); g.lineTo(40, 30); g.moveTo(40, -50); g.lineTo(40, -30); g.lineTo(70, -30); g.lineTo(70, 10); g.stroke(); g.restore(); }
  function arrowUp(g, T) { g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(560, 166); g.lineTo(600, 132); g.lineTo(630, 150); g.lineTo(690, 98);
    g.lineWidth = 22; g.strokeStyle = INK; g.stroke(); g.lineWidth = 14; g.strokeStyle = '#3ac84a'; g.shadowColor = '#5aff5a'; g.shadowBlur = 10; g.stroke();
    g.beginPath(); g.moveTo(724, 74); g.lineTo(676, 82); g.lineTo(710, 118); g.closePath(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#3ac84a'; g.fill(); g.restore(); }
  /* ---------- the explorer kid (upper body above the word) ---------- */
  function kid(g, T) {
    var SK = ['#ffd6b0', '#f2b080', '#c87a4a'], KH = ['#d8c08a', '#b89a5a', '#7a6034'];
    var P = {
      pack: function (h) { h.beginPath(); h.ellipse(700, 236, 26, 34, 0.2, 0, TAU); h.fill(); h.beginPath(); h.ellipse(694, 204, 22, 12, 0.2, 0, TAU); h.fill(); },
      body: function (h) { h.beginPath(); h.moveTo(708, 230); h.quadraticCurveTo(740, 220, 772, 232); h.lineTo(776, 282); h.quadraticCurveTo(742, 290, 710, 282); h.closePath(); h.fill(); },
      arm: function (h) { T.limb(h, [766, 240, 786, 262, 806, 262], 22, 18); h.beginPath(); h.arc(808, 262, 11, 0, TAU); h.fill(); },
      torch: function (h) { h.save(); T.around(h, 820, 258, -0.25); GameLogos.tools.rr(h, 800, 250, 30, 14, 5); h.fill(); GameLogos.tools.rr(h, 826, 245, 14, 24, 5); h.fill(); h.restore(); },
      head: function (h) { h.beginPath(); h.ellipse(742, 194, 38, 40, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(706, 200, 8, 11, 0, 0, TAU); h.fill(); },
      hat: function (h) { h.beginPath(); h.ellipse(744, 168, 70, 18, -0.08, 0, TAU); h.fill(); h.beginPath(); h.moveTo(704, 168); h.bezierCurveTo(700, 116, 790, 112, 786, 164); h.closePath(); h.fill(); }
    };
    T.onePiece(g, T, { x0: 660, y0: 100, W: 200, H: 210, rim: INK, rimW: 4, parts: P, order: ['pack', 'body', 'arm', 'torch', 'head', 'hat'],
      colour: function (B, put, inside) {
        put(B, 'pack', T.lg(B, 670, 0, 726, 0, [0, '#5a4024', 1, '#8a6a3a'])); inside(B, 'pack', function (h) { h.strokeStyle = '#3a2810'; h.lineWidth = 3; h.beginPath(); h.moveTo(678, 218); h.lineTo(716, 226); h.moveTo(676, 246); h.lineTo(716, 254); h.stroke(); });
        put(B, 'body', T.lg(B, 704, 0, 782, 0, [0, KH[1], 0.5, KH[0], 1, KH[1]]));
        inside(B, 'body', function (h) { h.fillStyle = KH[2]; h.beginPath(); h.moveTo(730, 226); h.lineTo(742, 250); h.lineTo(754, 226); h.closePath(); h.fill(); h.fillStyle = SK[1]; h.beginPath(); h.moveTo(734, 226); h.lineTo(742, 240); h.lineTo(750, 226); h.closePath(); h.fill(); h.fillStyle = '#6a4a20'; h.fillRect(714, 232, 9, 56); h.fillStyle = KH[2]; GameLogos.tools.rr(h, 752, 256, 18, 16, 3); h.fill(); });
        put(B, 'arm', KH[1]); inside(B, 'arm', function (h) { h.fillStyle = SK[1]; h.beginPath(); h.arc(808, 262, 11, 0, TAU); h.fill(); });
        put(B, 'torch', T.lg(B, 0, 245, 0, 270, [0, '#c8d4e8', 1, '#5a6a8a']));
        put(B, 'head', T.rg(B, 750, 186, 4, 46, [0, SK[0], 0.7, SK[1], 1, SK[2]]));
        inside(B, 'head', function (h) { h.fillStyle = '#7a4a1a'; h.beginPath(); h.moveTo(704, 176); h.quadraticCurveTo(724, 196, 744, 176); h.quadraticCurveTo(764, 192, 782, 176); h.lineTo(782, 160); h.lineTo(704, 160); h.closePath(); h.fill(); });
        put(B, 'hat', T.lg(B, 0, 116, 0, 186, [0, '#f0dca8', 0.6, '#c8aa6a', 1, '#8a6a3a'])); inside(B, 'hat', function (h) { h.fillStyle = '#7a5a2a'; h.beginPath(); h.moveTo(706, 158); h.quadraticCurveTo(744, 150, 784, 156); h.lineTo(786, 166); h.quadraticCurveTo(744, 160, 704, 168); h.closePath(); h.fill(); h.fillStyle = 'rgba(255,255,255,.4)'; h.beginPath(); h.ellipse(730, 128, 16, 6, -0.4, 0, TAU); h.fill(); });
      } });
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.lin(g, 836, 0, 900, 0, [0, 'rgba(255,240,170,.8)', 1, 'rgba(255,240,170,0)']); g.beginPath(); g.moveTo(838, 248); g.lineTo(900, 214); g.lineTo(906, 270); g.closePath(); g.fill(); g.restore();
    g.beginPath(); g.arc(838, 254, 7, 0, TAU); g.fillStyle = '#fffbe0'; g.fill();
    [[730, 196], [762, 194]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 9, 11, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 2, e[1] + 1, 5.5, 0, TAU); g.fillStyle = '#3a2010'; g.fill(); g.beginPath(); g.arc(e[0] + 1, e[1] - 2, 2, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.strokeStyle = '#5a2a0a'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(720, 180); g.quadraticCurveTo(730, 174, 740, 180); g.moveTo(754, 178); g.quadraticCurveTo(764, 172, 774, 178); g.stroke();
    g.beginPath(); g.moveTo(734, 212); g.quadraticCurveTo(748, 216, 764, 210); g.quadraticCurveTo(760, 230, 748, 230); g.quadraticCurveTo(736, 228, 734, 212); g.closePath(); g.fillStyle = '#6a0a14'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    g.save(); g.clip(); g.fillStyle = '#ff8a9a'; g.beginPath(); g.ellipse(749, 230, 9, 6, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(732, 209, 34, 5); g.restore();
    g.fillStyle = 'rgba(255,110,90,.35)'; g.beginPath(); g.ellipse(718, 214, 7, 4, 0, 0, TAU); g.ellipse(776, 210, 6, 4, 0, 0, TAU); g.fill();
  }
  function confetti(g, T, full) { var r = T.rng(17), C = ['#ff5aa8', '#ffd23a', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff'];
    for (var q = 0; q < (full ? 24 : 10); q++) { var x = 740 + r() * 110, y = 60 + r() * 120; g.save(); g.translate(x, y); g.rotate(r() * TAU); g.fillStyle = C[q % 6]; GameLogos.tools.rr(g, -6, -2.5, 12, 5, 2); g.fill(); g.restore(); }
    for (q = 0; q < 10; q++) { var xx = 740 + r() * 130, yy = 420 + r() * 80; g.save(); g.translate(xx, yy); g.rotate(r() * TAU); g.fillStyle = C[q % 6]; GameLogos.tools.rr(g, -6, -2.5, 12, 5, 2); g.fill(); g.restore(); }
    [[264, 92, 15], [674, 74, 13], [348, 84, 10], [338, 476, 13], [268, 488, 9]].forEach(function (s) { g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], s[2], s[2] * 0.45, 4); g.fill(); });
    for (q = 0; q < 12; q++) T.spark(g, 220 + r() * 600, 60 + r() * 440, 3 + r() * 5, '#fff', 0.6);
  }
  function words(g, T, L, cx, y1, s1, y2, s2) {
    function o(c, size) { return { spacing: size * 0.01, dark: L.dark, outline: size * 0.18, depth: size * 0.09, fat: size * 0.006, ring: 'rgba(255,240,200,.9)', glow: 'rgba(255,200,80,.45)', glowBlur: 0.25,
      edge: function () { return sh(c[2], -0.45); }, edgeW: size * 0.07, face: function () { return [0, c[0], 0.5, c[1], 1, c[2]]; } }; }
    var A = o(L.maze, s1), B = o(L.exp, s2); A.rot = -0.04; B.rot = -0.03; A.wave = function (j) { return [4, 0, -2, 0][j] * s1 / 120; }; B.wave = function (j) { return [0, 1, 2, 2, 2, 2, 1, 0][j] * s2 / 100; };
    T.word(g, 'EXPLORER', cx + 4, y2, s2, B); T.gloss(g, 'EXPLORER', cx + 4, y2, s2, B, 0.45);
    T.word(g, 'MAZE', cx - 6, y1, s1, A); T.gloss(g, 'MAZE', cx - 6, y1, s1, A, 0.5);
  }
  function all(g, T, L, full) {
    plate(g, T, L, full); g.save(); T.rr(g, 296, 56, 432, 440, 66); g.clip(); maze(g, T, L, full); g.restore();
    volcano(g, T); tornado(g, T, 210, 270, 0.9); tornado(g, T, 196, 318, 1.05); wave(g, T); ruins(g, T); tiles(g, T); arrowUp(g, T); kid(g, T); confetti(g, T, full);
    words(g, T, L, 512, 270, 124, 374, 92);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 40, 640, [0, L.bg[0], 0.6, L.bg[1], 1, L.bg[2]]); g.fillRect(0, 0, 1024, 572); all(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-156, -26); all(g, T, L, px >= 300); return; }
    if (kind === 'wide') { g.save(); g.translate(18, 4); g.scale(0.43, 0.43); g.translate(-292, -52); plate(g, T, L, false); g.save(); T.rr(g, 296, 56, 432, 440, 66); g.clip(); maze(g, T, L, false); g.restore(); g.restore();
      words(g, T, L, 540, 96, 86, 182, 72); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.86, 0.86); g.translate(-512, -276); plate(g, T, L, false); g.save(); T.rr(g, 296, 56, 432, 440, 66); g.clip(); maze(g, T, L, false); g.restore();
      if (px >= 90) words(g, T, L, 512, 270, 116, 370, 86); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO maze END
