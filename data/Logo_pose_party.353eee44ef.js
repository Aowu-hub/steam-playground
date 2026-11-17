// 🏷️ LOGO pose-party START — 📷 Pose Party, drawn in code from Aowu's picture (gl-20, round 7). Two kids striking poses (one-piece, depth from colour):
// the boy in a backwards cap + rainbow jacket mid-dance, the curly-haired girl jumping with peace signs; glowing pose silhouettes, a camera with a flash,
// gold "POSE" over pink "PARTY", confetti, "!" marks and zig-zag arrows, all inside a phone screen (the phone frame shows on scene + main only). One look.
GameLogos.add('pose-party', (function () {
  var BOX = { scene: [1024, 572], main: [1000, 560], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  var LOOK = { classic: { bg: ['#4a3ae8', '#2a1aa8', '#14086a'], gold: ['#fff7a8', '#ffd21a', '#ff8a0a'], pink: ['#ffc8f4', '#ff4fd8', '#b8148a'], ring: '#38d0ff', dark: '#1a0c5a' } };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#1a0c3a';
  /* ---------- background bits ---------- */
  function back(g, T, L, x, y, w, h, full) {
    g.fillStyle = T.rad(g, x + w * 0.5, y + h * 0.45, 30, w * 0.7, [0, L.bg[0], 0.55, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h);
    g.save(); g.globalAlpha = 0.18; g.fillStyle = '#8a7aff'; for (var i = 0; i < 9; i++) { g.beginPath(); g.moveTo(512, 300); g.arc(512, 300, 900, i * TAU / 9, i * TAU / 9 + 0.18); g.closePath(); g.fill(); } g.restore();
    var r = T.rng(11), C = ['#ff5aa8', '#ffd23a', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff'];
    for (var q = 0; q < (full ? 60 : 30); q++) { g.save(); g.translate(x + r() * w, y + r() * h); g.rotate(r() * TAU); g.fillStyle = C[q % 6]; GameLogos.tools.rr(g, -7, -3, 14, 6, 3); g.fill(); g.restore(); }
    for (var s = 0; s < 16; s++) { var sx = x + r() * w, sy = y + r() * h; if (s % 3) T.spark(g, sx, sy, 5 + r() * 8, '#fff', 0.85); else { g.fillStyle = s % 2 ? '#ffd23a' : '#ff5aa8'; T.star(g, sx, sy, 9, 4); g.fill(); } }
  }
  function bang(g, x, y, rot, col) { g.save(); g.translate(x, y); g.rotate(rot); g.lineJoin = 'round'; g.beginPath(); g.moveTo(-9, -44); g.lineTo(9, -44); g.lineTo(5, 6); g.lineTo(-5, 6); g.closePath(); g.moveTo(9, 22); g.arc(0, 22, 9, 0, TAU);
    g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 12; g.fill(); g.restore(); }
  function zig(g, x, y, rot, col, k) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.shadowColor = col; g.shadowBlur = 10; g.lineWidth = 7;
    g.beginPath(); g.moveTo(-40, 14); g.lineTo(-14, -8); g.lineTo(2, 8); g.lineTo(32, -18); g.stroke(); g.beginPath(); g.moveTo(40, -24); g.lineTo(16, -22); g.lineTo(34, -2); g.closePath(); g.fillStyle = col; g.fill(); g.restore(); }
  function marks(g, T) { bang(g, 76, 120, -0.35, '#38d0ff'); bang(g, 110, 92, 0.12, '#ff5aa8'); bang(g, 914, 84, 0.2, '#ff5aa8'); bang(g, 946, 92, 0.35, '#ffd23a');
    zig(g, 46, 262, -0.3, '#ffd23a', 0.9); zig(g, 166, 520, -0.6, '#38d0ff', 1); zig(g, 936, 452, -0.4, '#38d0ff', 1); zig(g, 954, 130, 0.4, '#ffd23a', 0.6); }
  /* ---------- glowing pose silhouettes (one piece each, cyan rim) ---------- */
  function ghost(g, T, x, y, k, kind) {
    var P = kind === 'flex' ? {
      b: function (h) { h.beginPath(); h.ellipse(x, y, 20 * k, 23 * k, 0, 0, TAU); h.fill(); h.beginPath(); h.moveTo(x - 34 * k, y + 26 * k); h.lineTo(x + 34 * k, y + 26 * k); h.lineTo(x + 24 * k, y + 110 * k); h.lineTo(x - 24 * k, y + 110 * k); h.closePath(); h.fill();
        T.limb(h, [x - 32 * k, y + 32 * k, x - 66 * k, y + 40 * k, x - 64 * k, y + 6 * k], 22 * k, 18 * k, 4 * k); T.limb(h, [x + 32 * k, y + 32 * k, x + 66 * k, y + 40 * k, x + 64 * k, y + 6 * k], 22 * k, 18 * k, 4 * k);
        h.beginPath(); h.arc(x - 62 * k, y - 2 * k, 12 * k, 0, TAU); h.arc(x + 62 * k, y - 2 * k, 12 * k, 0, TAU); h.fill(); } }
      : {
      b: function (h) { h.beginPath(); h.ellipse(x, y, 19 * k, 22 * k, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(x, y + 10 * k, 28 * k, 26 * k, 0, 0, Math.PI); h.fill(); h.beginPath(); h.moveTo(x - 28 * k, y + 28 * k); h.lineTo(x + 28 * k, y + 28 * k); h.lineTo(x + 34 * k, y + 110 * k); h.lineTo(x - 34 * k, y + 110 * k); h.closePath(); h.fill();
        T.limb(h, [x - 26 * k, y + 32 * k, x - 54 * k, y + 10 * k, x - 44 * k, y - 34 * k], 18 * k, 14 * k); T.limb(h, [x + 26 * k, y + 34 * k, x + 70 * k, y + 50 * k, x + 72 * k, y + 20 * k], 18 * k, 14 * k);
        h.beginPath(); h.arc(x - 44 * k, y - 38 * k, 10 * k, 0, TAU); h.fill(); h.save(); h.translate(x + 72 * k, y + 4 * k); h.scale(k, k); h.beginPath(); h.moveTo(0, 14); h.bezierCurveTo(-22, 0, -14, -18, 0, -6); h.bezierCurveTo(14, -18, 22, 0, 0, 14); h.fill(); h.restore(); } };
    T.onePiece(g, T, { x0: x - 100 * k, y0: y - 60 * k, W: 200 * k, H: 180 * k, rim: '#4ad8ff', rimW: 3, parts: P, order: ['b'], glow: '#38d0ff', glowBlur: 16,
      colour: function (B, put) { put(B, 'b', T.lg(B, 0, y - 30 * k, 0, y + 110 * k, [0, '#2a3ab8', 1, '#1a1a7a'])); } });
  }
  /* ---------- the camera with its flash ---------- */
  function camera(g, T, cx, cy, k, flash) {
    g.save(); g.translate(cx, cy); g.scale(k, k); g.rotate(0.08);
    g.shadowColor = 'rgba(10,0,40,.5)'; g.shadowBlur = 16; g.shadowOffsetY = 6;
    T.rr(g, -66, -76, 52, 26, 8); g.fillStyle = '#4a5a8a'; g.fill(); g.shadowColor = 'transparent';
    T.rr(g, -96, -58, 192, 120, 22); g.fillStyle = T.lin(g, 0, -58, 0, 62, [0, '#d8e4f8', 0.5, '#8a9ac8', 1, '#4a5a8a']); g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
    T.rr(g, -88, -50, 176, 22, 10); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill();
    T.rr(g, 54, -48, 30, 16, 5); g.fillStyle = '#fff6c0'; g.fill();
    g.beginPath(); g.arc(0, 6, 50, 0, TAU); g.fillStyle = '#2a2a4a'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.arc(0, 6, 42, 0, TAU); g.fillStyle = '#c8d4f0'; g.fill();
    var cols = ['#ff4fd8', '#b86aff', '#4a8aff', '#38d0ff', '#7ae84a', '#ffd23a'];
    for (var i = 0; i < 6; i++) { var a0 = i * TAU / 6; g.beginPath(); g.moveTo(Math.cos(a0) * 36, 6 + Math.sin(a0) * 36); g.arc(0, 6, 36, a0, a0 + TAU / 6); g.lineTo(Math.cos(a0 + TAU / 6 + 1.1) * 12, 6 + Math.sin(a0 + TAU / 6 + 1.1) * 12); g.closePath(); g.fillStyle = cols[i]; g.fill(); g.lineWidth = 1.5; g.strokeStyle = 'rgba(20,10,60,.6)'; g.stroke(); }
    g.beginPath(); g.arc(0, 6, 11, 0, TAU); g.fillStyle = '#1a1040'; g.fill(); g.beginPath(); g.ellipse(-14, -8, 9, 5, -0.7, 0, TAU); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill();
    if (flash) { g.save(); g.translate(82, -54); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 0, 0, 0, 70, [0, 'rgba(255,255,220,1)', 0.3, 'rgba(255,230,120,.7)', 1, 'rgba(255,200,80,0)']); g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.fill();
      g.fillStyle = '#fffbe0'; T.star(g, 0, 0, 46, 8, 8); g.fill(); g.restore(); }
    g.restore();
  }
  /* ---------- the boy: backwards cap, rainbow jacket, dancing step ---------- */
  function boy(g, T) {
    var SK = ['#ffd6b0', '#f2b080', '#c87a4a'], JE = ['#7a9ac0', '#4a6a90', '#2a3a5a'];
    var P = {
      legB: function (h) { T.limb(h, [162, 340, 158, 392, 146, 428], 32, 27); T.limb(h, [146, 428, 132, 460, 120, 486], 27, 22); },
      shoeB: function (h) { h.save(); T.around(h, 114, 498, -0.9); h.beginPath(); h.ellipse(118, 500, 30, 15, 0, 0, TAU); h.fill(); h.restore(); },
      armB: function (h) { T.limb(h, [132, 252, 104, 272, 94, 300], 34, 28); T.limb(h, [94, 300, 80, 324, 72, 344], 28, 24); h.beginPath(); h.arc(68, 350, 16, 0, TAU); h.fill(); },
      torso: function (h) { h.beginPath(); h.moveTo(126, 246); h.quadraticCurveTo(172, 226, 224, 240); h.lineTo(222, 300); h.quadraticCurveTo(226, 340, 214, 352); h.lineTo(136, 356); h.quadraticCurveTo(124, 320, 130, 290); h.closePath(); h.fill(); },
      legF: function (h) { T.limb(h, [194, 342, 230, 330, 262, 330], 34, 29); T.limb(h, [262, 330, 268, 372, 264, 408], 29, 24); },
      shoeF: function (h) { h.beginPath(); h.ellipse(274, 420, 30, 15, 0.25, 0, TAU); h.fill(); h.beginPath(); h.ellipse(262, 408, 15, 12, 0, 0, TAU); h.fill(); },
      armF: function (h) { T.limb(h, [214, 252, 240, 258, 254, 266], 32, 28); T.limb(h, [254, 266, 256, 236, 244, 216], 28, 24); h.beginPath(); h.arc(240, 206, 16, 0, TAU); h.fill(); },
      neck: function (h) { T.limb(h, [170, 214, 171, 226, 172, 238], 24, 24); },
      head: function (h) { h.beginPath(); h.ellipse(170, 180, 42, 46, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(130, 188, 9, 12, 0, 0, TAU); h.fill(); },
      cap: function (h) { h.beginPath(); h.moveTo(126, 168); h.bezierCurveTo(124, 120, 212, 108, 218, 156); h.quadraticCurveTo(172, 146, 126, 168); h.closePath(); h.fill(); h.beginPath(); h.moveTo(132, 160); h.quadraticCurveTo(108, 168, 96, 190); h.quadraticCurveTo(118, 188, 140, 176); h.closePath(); h.fill(); }
    };
    T.onePiece(g, T, { x0: 30, y0: 90, W: 290, H: 440, rim: INK, rimW: 4, parts: P, order: ['legB', 'shoeB', 'armB', 'torso', 'legF', 'shoeF', 'armF', 'neck', 'head', 'cap'],
      colour: function (B, put, inside) {
        put(B, 'legB', T.lg(B, 120, 0, 170, 0, [0, JE[2], 1, JE[1]]));
        put(B, 'shoeB', '#d8701a'); inside(B, 'shoeB', function (h) { h.save(); T.around(h, 114, 498, -0.9); h.fillStyle = '#fff'; h.fillRect(86, 506, 64, 8); h.fillStyle = '#ffb03a'; h.fillRect(90, 488, 30, 10); h.restore(); });
        put(B, 'armB', T.lg(B, 132, 252, 80, 336, [0, '#ffc21a', 0.5, '#ff9a1a', 1, '#e8801a']));
        inside(B, 'armB', function (h) { h.fillStyle = '#38d0ff'; h.save(); T.around(h, 104, 286, 0.9); h.fillRect(84, 280, 40, 9); h.restore(); h.fillStyle = '#8a3ac8'; h.beginPath(); h.arc(80, 334, 15, 0, TAU); h.fill(); h.fillStyle = SK[1]; h.beginPath(); h.arc(68, 350, 16, 0, TAU); h.fill(); h.strokeStyle = SK[2]; h.lineWidth = 2; h.beginPath(); h.moveTo(60, 352); h.lineTo(74, 344); h.stroke(); });
        put(B, 'torso', T.lg(B, 126, 240, 160, 356, [0, '#ffd23a', 0.3, '#ff4fd8', 1, '#9a3ad8']));
        inside(B, 'torso', function (h) {
          h.fillStyle = T.lg(h, 186, 240, 224, 350, [0, '#ffd23a', 0.45, '#38d0ff', 1, '#2a8ad8']); h.beginPath(); h.moveTo(186, 236); h.lineTo(230, 236); h.lineTo(230, 356); h.lineTo(194, 356); h.quadraticCurveTo(190, 300, 186, 236); h.closePath(); h.fill();
          h.fillStyle = T.lg(h, 160, 0, 190, 0, [0, '#ffffff', 1, '#dcd6f0']); h.beginPath(); h.moveTo(160, 240); h.lineTo(188, 238); h.quadraticCurveTo(190, 300, 194, 352); h.lineTo(158, 352); h.quadraticCurveTo(156, 300, 160, 240); h.closePath(); h.fill();
          h.fillStyle = '#ff4fd8'; h.beginPath(); h.moveTo(150, 238); h.quadraticCurveTo(172, 262, 192, 236); h.lineTo(196, 230); h.quadraticCurveTo(172, 256, 146, 232); h.closePath(); h.fill();
          h.fillStyle = '#ffb01a'; GameLogos.tools.rr(h, 136, 262, 18, 12, 3); h.fill();
          h.fillStyle = T.lg(h, 0, 338, 0, 356, [0, '#b86aff', 1, '#6a2aa8']); h.fillRect(120, 338, 120, 20);
          h.fillStyle = 'rgba(40,0,80,.18)'; h.beginPath(); h.moveTo(126, 300); h.quadraticCurveTo(136, 340, 140, 356); h.lineTo(120, 356); h.closePath(); h.fill(); });
        put(B, 'legF', T.lg(B, 194, 330, 264, 410, [0, JE[0], 1, JE[1]]));
        inside(B, 'legF', function (h) { h.strokeStyle = 'rgba(30,50,80,.35)'; h.lineWidth = 3; h.beginPath(); h.moveTo(232, 318); h.quadraticCurveTo(250, 326, 254, 344); h.stroke(); });
        put(B, 'shoeF', '#ffb03a'); inside(B, 'shoeF', function (h) { h.fillStyle = '#ff7a1a'; h.beginPath(); h.ellipse(282, 414, 20, 9, 0.25, 0, TAU); h.fill(); h.fillStyle = '#fff'; h.save(); T.around(h, 274, 420, 0.25); h.fillRect(244, 428, 62, 7); h.restore(); h.fillStyle = '#e8e8f8'; h.beginPath(); h.ellipse(262, 404, 15, 7, 0, 0, TAU); h.fill(); });
        put(B, 'armF', T.lg(B, 214, 0, 256, 0, [0, '#ffd23a', 1, '#ffb01a'])); inside(B, 'armF', function (h) { h.fillStyle = '#b86aff'; h.save(); T.around(h, 250, 232, -0.2); h.fillRect(234, 222, 30, 10); h.restore(); h.fillStyle = T.rg(h, 236, 200, 2, 18, [0, SK[0], 1, SK[1]]); h.beginPath(); h.arc(240, 206, 16, 0, TAU); h.fill(); h.strokeStyle = SK[2]; h.lineWidth = 2.2; h.beginPath(); h.moveTo(230, 198); h.quadraticCurveTo(240, 194, 250, 198); h.moveTo(232, 206); h.lineTo(246, 206); h.moveTo(236, 212); h.lineTo(250, 212); h.stroke(); });
        put(B, 'neck', SK[2]);
        put(B, 'head', T.rg(B, 178, 172, 4, 52, [0, SK[0], 0.7, SK[1], 1, SK[2]]));
        inside(B, 'head', function (h) { h.fillStyle = '#8a4a1a'; h.beginPath(); h.moveTo(128, 168); h.quadraticCurveTo(150, 176, 160, 160); h.quadraticCurveTo(176, 174, 214, 160); h.lineTo(214, 140); h.lineTo(128, 140); h.closePath(); h.fill(); h.beginPath(); h.ellipse(128, 194, 6, 16, 0, 0, TAU); h.fill(); h.beginPath(); h.moveTo(196, 152); h.quadraticCurveTo(214, 158, 212, 176); h.quadraticCurveTo(204, 164, 190, 162); h.closePath(); h.fill(); });
        put(B, 'cap', T.lg(B, 0, 112, 0, 170, [0, '#8a96aa', 1, '#4a5468'])); inside(B, 'cap', function (h) { h.fillStyle = '#2a8af0'; h.beginPath(); h.moveTo(176, 146); h.quadraticCurveTo(200, 140, 218, 156); h.lineTo(220, 140); h.quadraticCurveTo(200, 128, 176, 132); h.closePath(); h.fill(); h.fillStyle = 'rgba(255,255,255,.35)'; h.beginPath(); h.ellipse(160, 126, 22, 7, -0.2, 0, TAU); h.fill(); h.fillStyle = '#3a4458'; h.fillRect(90, 170, 60, 30); });
      } });
    [[154, 186], [190, 184]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 10, 12, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 2, e[1] + 1, 6, 0, TAU); g.fillStyle = '#2a8ad8'; g.fill(); g.beginPath(); g.arc(e[0] + 2, e[1] + 1, 3, 0, TAU); g.fillStyle = '#0a1a3a'; g.fill(); g.beginPath(); g.arc(e[0], e[1] - 2, 2, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.strokeStyle = '#5a2a0a'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(144, 168); g.quadraticCurveTo(154, 162, 164, 168); g.moveTo(182, 166); g.quadraticCurveTo(192, 160, 202, 166); g.stroke();
    g.strokeStyle = '#c87a4a'; g.lineWidth = 3; g.beginPath(); g.moveTo(174, 196); g.quadraticCurveTo(170, 204, 176, 206); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); g.moveTo(160, 214); g.quadraticCurveTo(176, 224, 192, 210); g.stroke();
  }
  /* ---------- the girl: big curls, crop top, jumping with peace signs ---------- */
  function girl(g, T) {
    var SK = ['#c88a5a', '#a8653a', '#6a3a1a'], JE = ['#6ac8f0', '#3a8ac8', '#1a4a8a'];
    function peace(h, x, y, a) { h.save(); T.around(h, x, y, a); h.beginPath(); h.ellipse(x, y, 13, 12, 0, 0, TAU); h.fill(); T.limb(h, [x - 5, y - 6, x - 9, y - 18, x - 12, y - 30], 9, 8); T.limb(h, [x + 4, y - 6, x + 6, y - 18, x + 8, y - 30], 9, 8); h.restore(); }
    var P = {
      hairB: function (h) { var r = T.rng(5); for (var i = 0; i < 22; i++) { var a = i / 22 * TAU, rr = 62 + (i % 2) * 8; h.beginPath(); h.arc(852 + Math.cos(a) * rr, 206 + Math.sin(a) * rr * 0.92, 22 + r() * 6, 0, TAU); h.fill(); } h.beginPath(); h.arc(852, 206, 66, 0, TAU); h.fill(); },
      legB: function (h) { T.limb(h, [866, 340, 890, 372, 904, 396], 34, 28); T.limb(h, [904, 396, 920, 392, 934, 378], 28, 24); },
      shoeB: function (h) { h.save(); T.around(h, 944, 374, -0.6); h.beginPath(); h.ellipse(948, 376, 26, 13, 0, 0, TAU); h.fill(); h.restore(); },
      armB: function (h) { T.limb(h, [810, 278, 790, 296, 792, 304], 22, 20); T.limb(h, [792, 304, 784, 288, 778, 272], 20, 18); peace(h, 776, 266, -0.4); },
      legF: function (h) { T.limb(h, [834, 340, 822, 388, 818, 420], 36, 30); T.limb(h, [818, 420, 830, 448, 842, 470], 30, 24); },
      shoeF: function (h) { h.beginPath(); h.ellipse(852, 482, 28, 14, 0.5, 0, TAU); h.fill(); },
      torso: function (h) { h.beginPath(); h.moveTo(808, 272); h.quadraticCurveTo(850, 258, 890, 270); h.lineTo(886, 318); h.quadraticCurveTo(886, 346, 874, 350); h.lineTo(826, 350); h.quadraticCurveTo(812, 346, 814, 318); h.closePath(); h.fill(); },
      armF: function (h) { T.limb(h, [886, 276, 914, 266, 930, 244], 22, 20); T.limb(h, [930, 244, 940, 222, 946, 200], 20, 18); peace(h, 948, 192, 0.25); },
      neck: function (h) { T.limb(h, [852, 252, 852, 260, 852, 268], 20, 20); },
      head: function (h) { h.beginPath(); h.ellipse(852, 220, 38, 38, 0, 0, TAU); h.fill(); },
      hairF: function (h) { [[820, 192, 15], [834, 180, 14], [870, 178, 14], [886, 190, 15], [816, 210, 11], [890, 208, 11]].forEach(function (c) { h.beginPath(); h.arc(c[0], c[1], c[2], 0, TAU); h.fill(); }); }
    };
    T.onePiece(g, T, { x0: 740, y0: 110, W: 250, H: 400, rim: INK, rimW: 4, parts: P, order: ['hairB', 'legB', 'shoeB', 'armB', 'legF', 'shoeF', 'torso', 'armF', 'neck', 'head', 'hairF'],
      colour: function (B, put, inside) {
        put(B, 'hairB', T.rg(B, 846, 186, 10, 96, [0, '#a8602a', 0.6, '#6a3416', 1, '#3a1a08']));
        inside(B, 'hairB', function (h) { var r = T.rng(5); h.strokeStyle = 'rgba(230,160,90,.7)'; h.lineWidth = 3.5; for (var i = 0; i < 46; i++) { var a = r() * TAU, d = 30 + r() * 50; h.beginPath(); h.arc(852 + Math.cos(a) * d, 206 + Math.sin(a) * d, 8, r() * 3, r() * 3 + 3); h.stroke(); } });
        put(B, 'legB', T.lg(B, 866, 0, 934, 0, [0, JE[2], 1, JE[1]]));
        put(B, 'shoeB', '#d83a8a'); inside(B, 'shoeB', function (h) { h.save(); T.around(h, 944, 374, -0.6); h.fillStyle = '#fff'; h.fillRect(920, 382, 56, 6); h.restore(); });
        put(B, 'armB', '#e0ac14'); inside(B, 'armB', function (h) { h.fillStyle = SK[1]; h.save(); T.around(h, 776, 266, -0.4); h.beginPath(); h.ellipse(776, 266, 13, 12, 0, 0, TAU); h.fill(); T.limb(h, [771, 260, 767, 248, 764, 236], 9, 8); T.limb(h, [780, 260, 782, 248, 784, 236], 9, 8); h.restore(); });
        put(B, 'legF', T.lg(B, 818, 340, 842, 470, [0, JE[0], 1, JE[1]])); inside(B, 'legF', function (h) { h.strokeStyle = 'rgba(20,60,120,.35)'; h.lineWidth = 3; h.beginPath(); h.moveTo(826, 396); h.quadraticCurveTo(816, 412, 824, 424); h.stroke(); });
        put(B, 'shoeF', '#ff5aa8'); inside(B, 'shoeF', function (h) { h.save(); T.around(h, 852, 482, 0.5); h.fillStyle = '#fff'; h.fillRect(822, 488, 60, 7); h.fillStyle = '#ff9ad0'; h.fillRect(838, 470, 20, 8); h.restore(); });
        put(B, 'torso', T.lg(B, 808, 0, 890, 0, [0, '#e8b81a', 0.4, '#ffe04a', 1, '#f0c41a']));
        inside(B, 'torso', function (h) { h.fillStyle = SK[1]; h.beginPath(); h.moveTo(816, 332); h.quadraticCurveTo(850, 340, 886, 330); h.lineTo(886, 352); h.lineTo(816, 352); h.closePath(); h.fill(); h.fillStyle = JE[1]; h.fillRect(810, 342, 82, 12); h.fillStyle = 'rgba(160,100,0,.25)'; h.beginPath(); h.moveTo(826, 290); h.quadraticCurveTo(850, 300, 876, 290); h.lineTo(876, 296); h.quadraticCurveTo(850, 306, 826, 296); h.closePath(); h.fill(); });
        put(B, 'armF', T.lg(B, 886, 276, 946, 200, [0, '#ffe04a', 1, '#f8cc2a'])); inside(B, 'armF', function (h) { h.fillStyle = SK[1]; h.save(); T.around(h, 948, 192, 0.25); h.beginPath(); h.ellipse(948, 192, 13, 12, 0, 0, TAU); h.fill(); T.limb(h, [943, 186, 939, 174, 936, 162], 9, 8); T.limb(h, [952, 186, 954, 174, 956, 162], 9, 8); h.restore(); h.fillStyle = '#ff5aa8'; h.save(); T.around(h, 944, 206, 0.4); h.fillRect(934, 202, 22, 6); h.restore(); });
        put(B, 'neck', SK[1]); inside(B, 'neck', function (h) { h.fillStyle = 'rgba(60,20,0,.35)'; h.beginPath(); h.ellipse(852, 254, 16, 6, 0, 0, TAU); h.fill(); });
        put(B, 'head', T.rg(B, 860, 216, 4, 46, [0, SK[0], 0.7, SK[1], 1, SK[2]]));
        put(B, 'hairF', T.lg(B, 0, 166, 0, 220, [0, '#a8602a', 1, '#5a2a10'])); inside(B, 'hairF', function (h) { h.strokeStyle = 'rgba(230,160,90,.75)'; h.lineWidth = 3; [[820, 192], [834, 180], [870, 178], [886, 190]].forEach(function (c) { h.beginPath(); h.arc(c[0], c[1], 7, 3.5, 5.8); h.stroke(); }); });
      } });
    g.strokeStyle = INK; g.lineWidth = 3.5; g.lineCap = 'round'; [[838, 210], [868, 208]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1] + 4, 8, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); });
    g.beginPath(); g.moveTo(838, 228); g.quadraticCurveTo(854, 232, 872, 226); g.quadraticCurveTo(868, 250, 854, 250); g.quadraticCurveTo(840, 250, 838, 228); g.closePath(); g.fillStyle = '#6a0a1a'; g.fill();
    g.save(); g.clip(); g.fillStyle = '#ff6a8a'; g.beginPath(); g.ellipse(855, 250, 12, 8, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(836, 224, 40, 6); g.restore(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = 'rgba(255,90,120,.35)'; g.beginPath(); g.ellipse(828, 226, 7, 4, 0, 0, TAU); g.ellipse(878, 224, 7, 4, 0, 0, TAU); g.fill();
    g.strokeStyle = '#ffc21a'; g.lineWidth = 3; g.beginPath(); g.arc(816, 236, 8, 0, TAU); g.moveTo(896, 234); g.arc(888, 234, 8, 0, TAU); g.stroke();
  }
  /* ---------- the words ---------- */
  function wo(L, c, size, glow) { return { spacing: size * 0.02, dark: L.dark, outline: size * 0.16, depth: size * 0.08, fat: size * 0.006, ring: L.ring, glow: glow, glowBlur: 0.3,
    edge: function () { return sh(c[2], -0.4); }, edgeW: size * 0.07, face: function () { return [0, c[0], 0.5, c[1], 1, c[2]]; } }; }
  function pose(g, T, L, cx, base, size) { var o = wo(L, L.gold, size, 'rgba(56,208,255,.8)'); o.wave = function (j) { return [6, 0, -2, 4][j] * size / 180; }; T.word(g, 'POSE', cx, base, size, o); T.gloss(g, 'POSE', cx, base, size, o, 0.5); }
  function party(g, T, L, cx, base, size, sparkle) { var o = wo(L, L.pink, size, 'rgba(56,208,255,.8)'); o.wave = function (j) { return [0, -3, -5, -3, 0][j] * size / 150; }; T.word(g, 'PARTY', cx, base, size, o); T.gloss(g, 'PARTY', cx, base, size, o, 0.45);
    if (sparkle) [[-0.36, -0.55], [-0.12, -0.3], [0.1, -0.62], [0.32, -0.4], [0.02, -0.15]].forEach(function (p) { T.spark(g, cx + p[0] * size * 3.2, base + p[1] * size, size * 0.07, '#fff', 1); }); }
  function phone(g, T, x, y, w, h) { g.save(); T.rr(g, x, y, w, h, 64); g.lineWidth = 18; g.strokeStyle = T.lin(g, x, y, x + w, y + h, [0, '#6a7ad8', 0.5, '#2a2a7a', 1, '#8a9af0']); g.stroke(); g.lineWidth = 3; g.strokeStyle = '#0a0a3a'; T.rr(g, x - 9, y - 9, w + 18, h + 18, 72); g.stroke(); T.rr(g, x + 9, y + 9, w - 18, h - 18, 56); g.stroke();
    T.rr(g, x + w - 26, y + h / 2 - 70, 20, 140, 10); g.fillStyle = '#0a0a2a'; g.fill(); g.beginPath(); g.arc(x + w - 16, y + h / 2 + 100, 6, 0, TAU); g.fillStyle = '#2a2a5a'; g.fill(); g.restore(); }
  var FX = 22, FY = 14, FW = 980, FH = 544;
  function screen(g, T, L, full) {
    g.save(); T.rr(g, FX, FY, FW, FH, 64); g.clip(); back(g, T, L, FX, FY, FW, FH, full);
    g.save(); g.globalAlpha = 0.85; ghost(g, T, 380, 78, 0.82, 'flex'); ghost(g, T, 512, 76, 0.82, 'heart'); if (full) ghost(g, T, 548, 498, 0.7, 'flex'); g.restore();
    camera(g, T, 726, 120, 0.95, true); marks(g, T); boy(g, T); girl(g, T); g.restore();
    pose(g, T, L, 510, 288, 186); party(g, T, L, 532, 432, 146, true);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = '#14086a'; g.fillRect(0, 0, 1024, 572); screen(g, T, L, true); phone(g, T, FX, FY, FW, FH); return; }
    if (kind === 'main') { g.translate(-12, -6); screen(g, T, L, px >= 300); phone(g, T, FX, FY, FW, FH); return; }
    if (kind === 'wide') { g.save(); g.translate(84, 104); camera(g, T, 0, 0, 0.74, false); g.restore(); pose(g, T, L, 318, 148, 98); party(g, T, L, 660, 148, 94, false); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 10, 10, 380, 380, 70); g.clip(); back(g, T, L, 10, 10, 380, 380, false); g.restore(); T.rr(g, 10, 10, 380, 380, 70); g.lineWidth = 10; g.strokeStyle = '#2a2a8a'; g.stroke();
      if (px >= 90) { camera(g, T, 300, 92, 0.62, true); pose(g, T, L, 190, 230, 118); party(g, T, L, 200, 346, 96, false); } else { camera(g, T, 200, 200, 1.4, true); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO pose-party END
