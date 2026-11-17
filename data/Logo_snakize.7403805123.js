// 🏷️ LOGO snakize START — 🐍 Snakize, drawn in code from Aowu's picture (gl-2)
GameLogos.add('snakize', (function () {
  // design space = Aowu's picture, 1024 × 572
  var BOX = { scene: [1024, 572], main: [836, 540], wide: [860, 280], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#0a1450', '#1a2a9a', '#3a1a8a'], grid: 'rgba(120,150,255,.16)', hex: ['#2f8df0', '#7a3fe0', '#3fc84a', '#1f58c8'],
    snake: ['#8eea3a', '#22b88a', '#e6f54a', '#1a7a4a'], belly: '#e9f76a', ink: '#0c1648',
    a: ['#d8ff3a', '#96ee18', '#3fc414', '#128a1a'], aRing: '#1f7a12', b: ['#ffee5a', '#ffbe14', '#ff7e0e', '#ee4a08'], bRing: '#b84a06', dust: ['#ff8ad8', '#7dff9a', '#9fe8ff', '#ffe27a'] };
    for (var k in o) b[k] = o[k]; return b; }
  var LOOK = {
    classic: mk({}),
    dino: mk({ a: ['#f0ff7a', '#c8e02a', '#7aa81a', '#4a7a12'], aRing: '#3a5a0a', b: ['#ffe9a0', '#f0b04a', '#c8782a', '#8a4a12'], bRing: '#6a3a0a', sky: ['#12381a', '#2a6a2a', '#6a4a12'], hex: ['#6ab82f', '#a8782a', '#3f9a3a', '#2a6a1a'], snake: ['#9ad83a', '#5a9a2a', '#f0d84a', '#2a5a1a'], dust: ['#ffd27a', '#b6f03a', '#fff0a0', '#ff9a4a'] }),
    sea: mk({ sky: ['#04264a', '#0a5a9a', '#0a7a8a'], hex: ['#2fb8e0', '#2a6ae0', '#3fd8c0', '#1a4a9a'], snake: ['#4ae0d0', '#1a9ac8', '#b0fff0', '#0a5a7a'], belly: '#d8fff4', a: ['#eaffff', '#8af0e0', '#2ac8c0', '#0a8a9a'], aRing: '#0a6a7a', dust: ['#9fe8ff', '#7dffd8', '#ffffff', '#ffe27a'] }),
    dance: mk({ sky: ['#2a0a4a', '#7a1a9a', '#c81a8a'], hex: ['#ff4ab8', '#8a3ff0', '#3fd8ff', '#c81a8a'], snake: ['#ff7ad8', '#c83ae0', '#ffe27a', '#7a1a8a'], belly: '#ffe9fa', a: ['#fff0ff', '#ff9ae8', '#f04ac8', '#b81a9a'], aRing: '#8a0a6a', b: ['#f0ffff', '#8af0ff', '#2ac8ff', '#1a8af0'], bRing: '#0a4ab8', dust: ['#ff8ad8', '#ffe27a', '#9fe8ff', '#ffffff'] }),
    robot: mk({ sky: ['#141a28', '#2a3a58', '#3a4a6a'], hex: ['#5a7aa8', '#8a9ab8', '#3fd8ff', '#3a4a6a'], snake: ['#c8d8e8', '#7a9ab8', '#5ff0ff', '#3a4a6a'], belly: '#f0f8ff', a: ['#ffffff', '#d8e8f8', '#9ab8d8', '#6a8ab0'], aRing: '#3a4a6a', b: ['#eaffff', '#7af0ff', '#2ac8f0', '#1a8ac8'], bRing: '#0a5a8a', dust: ['#5ff0ff', '#ffffff', '#ffe27a', '#9ab8d8'] }),
    space: mk({ sky: ['#06061e', '#1a1458', '#4a1a7a'], hex: ['#5a4af0', '#b84af0', '#2ad8f0', '#2a1a9a'], snake: ['#b88aff', '#6a4ae0', '#7af0ff', '#2a1a7a'], belly: '#f0e9ff', a: ['#f8f0ff', '#c8a8ff', '#8a5af0', '#5a2ad0'], aRing: '#3a1a9a', dust: ['#c8a8ff', '#7af0ff', '#ffffff', '#ffe27a'] }),
    sky: mk({ sky: ['#2a7ae0', '#5ab8ff', '#a8e0ff'], grid: 'rgba(255,255,255,.22)', hex: ['#ffffff', '#a8d8ff', '#ffe27a', '#5aa8f0'], snake: ['#ffe27a', '#ffb02e', '#ffffff', '#c87a0a'], belly: '#fffbe0', ink: '#12306a', a: ['#ffffff', '#eaf6ff', '#a8d8ff', '#5aa8f0'], aRing: '#2a6ac8', dust: ['#ffffff', '#ffe27a', '#ffb0d8', '#a8e0ff'] })
  };
  var TAU = Math.PI * 2;

  function bez(pts, step) { var C = [], cur = [pts[0], pts[1]], i, t; for (i = 2; i < pts.length; i += 6) { for (t = (i === 2 ? 0 : step); t <= 1.0001; t += step) { var u = 1 - t; C.push([u * u * u * cur[0] + 3 * u * u * t * pts[i] + 3 * u * t * t * pts[i + 2] + t * t * t * pts[i + 4], u * u * u * cur[1] + 3 * u * u * t * pts[i + 1] + 3 * u * t * t * pts[i + 3] + t * t * t * pts[i + 5]]); } cur = [pts[i + 4], pts[i + 5]]; } return C; }
  function hexPath(g, x, y, R) { g.beginPath(); for (var i = 0; i < 6; i++) { var a = i * TAU / 6; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * R, y + Math.sin(a) * R); } g.closePath(); }

  function bg(g, L, T) {
    g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572);
    g.fillStyle = T.rad(g, 512, 290, 40, 560, [0, 'rgba(70,130,255,.5)', 0.55, 'rgba(60,60,200,.1)', 1, 'rgba(0,0,20,.6)']); g.fillRect(0, 0, 1024, 572);
    g.strokeStyle = L.grid; g.lineWidth = 1; for (var x = 0; x <= 1024; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 572); g.stroke(); } for (var y = 6; y <= 572; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    var r = T.rng(31); for (var i = 0; i < 90; i++) { var s = r(); g.globalAlpha = 0.25 + s * 0.6; g.fillStyle = L.dust[i % 4]; g.beginPath(); g.arc(r() * 1024, r() * 572, 1 + s * 3.2, 0, TAU); g.fill(); } g.globalAlpha = 1;
    [[60, 470, 70, 'rgba(255,90,200,.28)'], [960, 150, 80, 'rgba(120,90,255,.3)'], [900, 470, 60, 'rgba(90,220,255,.2)'], [110, 120, 60, 'rgba(90,255,160,.16)']].forEach(function (b) { g.fillStyle = T.rad(g, b[0], b[1], 0, b[2], [0, b[3], 1, 'rgba(0,0,0,0)']); g.fillRect(0, 0, 1024, 572); });
  }
  function dust(g, L, T) {   // two sparkle comets swirling round the logo
    function arc(cx, cy, rx, ry, a0, a1, seed) { var r = T.rng(seed); for (var i = 0; i < 260; i++) { var f = r(), a = a0 + (a1 - a0) * f, d = 1 + (r() - 0.5) * 0.2 * (1.2 - f); g.globalAlpha = (0.35 + r() * 0.65) * (0.3 + f * 0.7); g.fillStyle = L.dust[(seed + i) % 4]; g.shadowColor = g.fillStyle; g.shadowBlur = 10; g.beginPath(); g.arc(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 1 + r() * 4.4 * f + 0.4, 0, TAU); g.fill(); } g.globalAlpha = 1; g.shadowBlur = 0; }
    arc(512, 290, 380, 226, Math.PI * 1.32, Math.PI * 0.62, 3); arc(512, 290, 384, 230, Math.PI * 0.32, -Math.PI * 0.4, 4);
    g.save(); g.shadowColor = '#fff'; g.shadowBlur = 14; g.fillStyle = '#fff'; g.beginPath(); g.arc(402, 492, 6, 0, TAU); g.fill(); g.beginPath(); g.arc(590, 76, 6, 0, TAU); g.fill(); g.restore();
    [[196, 150, 9], [840, 110, 8], [876, 420, 9], [150, 380, 7], [716, 64, 6], [282, 84, 6]].forEach(function (s) { T.spark(g, s[0], s[1], s[2], '#fff', 0.9); });
  }
  function hexes(g, L, T, cx, cy, k) {
    var R = 46 * k, dx = R * 1.5, dy = R * Math.sqrt(3), cells = [[-2, -1, 0], [-1, -2, 0], [0, -2, 1], [1, -2, 2], [2, -1, 0], [-2, 0, 1], [-1, -1, 3], [0, -1, 0], [1, -1, 1], [2, 0, 2], [-2, 1, 2], [-1, 0, 1], [0, 0, 3], [1, 0, 0], [2, 1, 1], [-1, 1, 0], [0, 1, 1], [1, 1, 2], [0, 2, 2], [-1, 2, 1], [1, 2, 0]];
    g.save(); g.shadowColor = 'rgba(90,160,255,.8)'; g.shadowBlur = 26 * k;
    cells.forEach(function (c) { var x = cx + c[0] * dx, y = cy + (c[1] + (Math.abs(c[0]) % 2 ? 0.5 : 0)) * dy; hexPath(g, x, y, R * 0.94); var col = L.hex[c[2]]; g.fillStyle = T.lin(g, x, y - R, x, y + R, [0, 'rgba(255,255,255,.55)', 0.25, col, 1, col]); g.fill(); g.shadowBlur = 0; g.lineWidth = 3 * k; g.strokeStyle = 'rgba(8,14,70,.65)'; g.stroke(); g.save(); g.shadowColor = col; g.shadowBlur = 14 * k; hexPath(g, x, y, R * 0.82); g.lineWidth = 3 * k; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke(); g.restore(); });
    g.restore();
  }
  /* a glossy striped snake body along a curve (far end first) */
  function tube(g, L, T, C, w0, w1) {
    var n = C.length, i; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    function wid(i) { var f = i / (n - 1); return w0 + (w1 - w0) * f; }
    function run(a, b, extra, col, cap) { g.lineCap = cap || 'round'; for (i = a; i < b; i++) { g.beginPath(); g.moveTo(C[i][0], C[i][1]); g.lineTo(C[i + 1][0], C[i + 1][1]); g.lineWidth = wid(i) + extra; g.strokeStyle = col; g.stroke(); } }
    g.save(); g.shadowColor = L.snake[2]; g.shadowBlur = 34; run(0, n - 1, 13, L.snake[0]); g.shadowColor = '#5ff0ff'; g.shadowBlur = 16; run(0, n - 1, 13, L.snake[0]); g.restore();   // neon halo round the body
    run(0, n - 1, 13, L.ink); run(0, n - 1, 0, L.snake[1]);
    // stripes: each band is ONE stroke (no seams), wide bands of 3 colours like the picture
    function poly(a, b) { g.beginPath(); g.moveTo(C[a][0], C[a][1]); for (var q = a + 1; q <= b; q++) g.lineTo(C[q][0], C[q][1]); }
    var band = 7, cols = [L.snake[0], L.snake[2], L.snake[0], L.snake[1], L.snake[3] ? L.snake[1] : L.snake[1]], bi = 0;
    for (var s2 = 0; s2 < n - 1; s2 += band, bi++) { var e = Math.min(n - 1, s2 + band); if (bi % 2) continue; poly(s2, e); g.lineCap = 'butt'; g.lineWidth = wid(s2 + (band >> 1)); g.strokeStyle = cols[(bi / 2) % 2 ? 1 : 0]; g.stroke(); }
    // soft shade on the low side, glossy dashes on the high side
    function side(o, lw, col, dash) { g.beginPath(); for (i = 0; i < n; i++) { var a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d; if (ny > 0) { nx = -nx; ny = -ny; } var oo = wid(i) * o; g[i ? 'lineTo' : 'moveTo'](C[i][0] + nx * oo, C[i][1] + ny * oo); } g.lineCap = 'round'; g.setLineDash(dash || []); g.lineWidth = lw; g.strokeStyle = col; g.stroke(); g.setLineDash([]); }
    side(-0.3, wid(n >> 1) * 0.3, 'rgba(4,60,90,.26)'); side(0.26, wid(n >> 1) * 0.15, 'rgba(255,255,255,.75)', [26, 30]); side(0.1, wid(n >> 1) * 0.22, 'rgba(255,255,255,.16)');
    g.restore();
  }
  function head(g, L, T, x, y, s, rot) {   // three-quarter view looking left, like the picture
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    var EDGE = L.snake[3] || '#1a7a4a';
    // forked tongue from the open mouth
    g.beginPath(); g.moveTo(-34, 30); g.quadraticCurveTo(-56, 44, -72, 36); g.moveTo(-58, 42); g.quadraticCurveTo(-68, 54, -80, 52); g.lineWidth = 10; g.strokeStyle = '#b83a5a'; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#ff8aa0'; g.stroke();
    // skull (back, darker green) then the snout (front, lime → yellow)
    function skull() { g.beginPath(); g.moveTo(-30, -44); g.bezierCurveTo(0, -62, 52, -56, 62, -16); g.bezierCurveTo(70, 18, 48, 46, 14, 50); g.bezierCurveTo(-12, 52, -40, 40, -48, 14); g.bezierCurveTo(-56, -12, -50, -34, -30, -44); g.closePath(); }
    g.save(); g.shadowColor = 'rgba(120,255,170,.7)'; g.shadowBlur = 22; skull(); g.fillStyle = L.snake[1]; g.fill(); g.restore();
    skull(); g.lineWidth = 6; g.strokeStyle = EDGE; g.stroke(); skull(); g.fillStyle = T.lin(g, 0, -56, 0, 50, [0, L.snake[1], 0.45, L.snake[0], 1, L.snake[0]]); g.fill();
    function snout() { g.beginPath(); g.moveTo(-70, 2); g.bezierCurveTo(-74, -22, -40, -30, -14, -18); g.bezierCurveTo(14, -6, 30, 6, 30, 22); g.bezierCurveTo(28, 40, -4, 46, -34, 40); g.bezierCurveTo(-58, 34, -68, 22, -70, 2); g.closePath(); }
    snout(); g.fillStyle = T.lin(g, 0, -26, 0, 44, [0, L.snake[2], 0.6, L.belly, 1, L.snake[2]]); g.fill(); g.lineWidth = 4; g.strokeStyle = EDGE; g.globalAlpha = 0.55; g.stroke(); g.globalAlpha = 1;
    g.save(); skull(); g.clip(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(20, -44, 30, 9, 0.2, 0, TAU); g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-44, -10, 16, 6, -0.2, 0, TAU); g.fill();
    // far eye (half hidden by the brow) and the big near eye
    [[-34, -36, 10, 13], [14, -22, 18, 21]].forEach(function (e, i) { g.beginPath(); g.ellipse(e[0], e[1], e[2] + 3, e[3] + 3, 0, 0, TAU); g.fillStyle = i ? L.snake[1] : L.snake[0]; g.fill(); g.lineWidth = 3; g.strokeStyle = EDGE; g.stroke();
      g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#1a4a5a'; g.stroke();
      g.beginPath(); g.ellipse(e[0] - e[2] * 0.14, e[1] + e[3] * 0.08, e[2] * 0.66, e[3] * 0.7, 0, 0, TAU); g.fillStyle = T.lin(g, 0, e[1] - e[3], 0, e[1] + e[3], [0, '#0c1a4a', 0.6, '#1f4a9a', 1, '#3fa8d8']); g.fill();
      g.beginPath(); g.ellipse(e[0] - e[2] * 0.14, e[1] + e[3] * 0.1, e[2] * 0.36, e[3] * 0.4, 0, 0, TAU); g.fillStyle = '#060c24'; g.fill();
      g.beginPath(); g.arc(e[0] - e[2] * 0.4, e[1] - e[3] * 0.3, e[2] * 0.26, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(e[0] + e[2] * 0.2, e[1] + e[3] * 0.4, e[2] * 0.12, 0, TAU); g.fill(); });
    // nostrils + wide smile with the mouth a little open
    g.fillStyle = '#6a4a12'; g.beginPath(); g.ellipse(-58, -4, 3, 4.5, 0.4, 0, TAU); g.ellipse(-44, -10, 3, 4.5, 0.4, 0, TAU); g.fill();
    function mouth() { g.beginPath(); g.moveTo(-62, 16); g.quadraticCurveTo(-30, 27, 4, 20); g.quadraticCurveTo(20, 16, 28, 6); g.quadraticCurveTo(22, 23, -4, 27); g.quadraticCurveTo(-38, 32, -62, 16); g.closePath(); }
    mouth(); g.fillStyle = '#b02a3a'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#5a1420'; g.stroke();
    g.fillStyle = 'rgba(255,120,130,.45)'; g.beginPath(); g.ellipse(36, 20, 10, 7, 0, 0, TAU); g.fill();
    g.restore();
  }
  function wordmark(g, L, T, cx, base, size) {   // big S + the rest a step smaller, like the picture
    var A = L.a, B = L.b, big = size * 1.3;
    function opt(sz, off) { return { spacing: -sz * 0.02, dark: L.ink, outline: sz * 0.19, depth: sz * 0.085, glow: 'rgba(110,255,150,1)', glowN: 3, glowBlur: 0.5,
      wave: function (j) { return [7, -5, 5, -3, 3, 6][j + off] * sz / 180 || 0; },
      face: function (j) { var c = (j + off) < 3 ? A : B; return [0, c[0], 0.28, c[1], 0.68, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.3)' }; }
    g.save(); g.font = '700 ' + big + 'px ' + T.FONT; var wS = g.measureText('S').width; g.font = '700 ' + size + 'px ' + T.FONT; var wR = 0; 'NAKIZE'.split('').forEach(function (ch) { wR += g.measureText(ch).width - size * 0.02; }); g.restore();
    var gap = -size * 0.02, W = wS + gap + wR, x0 = cx - W / 2;
    var oR = opt(size, 0); T.word(g, 'NAKIZE', x0 + wS + gap + wR / 2, base, size, oR); T.gloss(g, 'NAKIZE', x0 + wS + gap + wR / 2, base, size, oR, 0.34);
    var oS = opt(big, -9); oS.wave = null; oS.face = function () { return [0, A[0], 0.28, A[1], 0.68, A[2], 1, A[3]]; }; T.word(g, 'S', x0 + wS / 2, base + size * 0.06, big, oS); T.gloss(g, 'S', x0 + wS / 2, base + size * 0.06, big, oS, 0.34);
    return { W: W, x0: x0, wS: wS, big: big };
  }
  function sFace(g, L, x, y, k) {   // the S is the little snake: an eye + a smile on its top curl
    g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round';
    g.beginPath(); g.ellipse(0, 0, 9, 11, 0, 0, TAU); g.fillStyle = L.ink; g.fill(); g.beginPath(); g.arc(-3, -4, 3.4, 0, TAU); g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.moveTo(2, 20); g.quadraticCurveTo(14, 26, 24, 16); g.lineWidth = 5; g.strokeStyle = L.ink; g.stroke(); g.restore();
  }
  function tail(g, L, T, x, y, k) {   // the E ends in a curly tail (drawn before the word so it grows out of the letter)
    var C = bez([x - 30 * k, y, x + 10 * k, y + 14 * k, x + 46 * k, y + 2 * k, x + 50 * k, y - 28 * k, x + 52 * k, y - 50 * k, x + 34 * k, y - 60 * k, x + 28 * k, y - 46 * k], 0.05), n = C.length, i;
    g.save(); g.lineCap = 'round'; for (var p = 0; p < 2; p++) for (i = 0; i < n - 1; i++) { var w = (30 - 24 * i / (n - 1)) * k; g.beginPath(); g.moveTo(C[i][0], C[i][1]); g.lineTo(C[i + 1][0], C[i + 1][1]); g.lineWidth = w + (p ? 0 : 14 * k); g.strokeStyle = p ? T.lin(g, 0, y - 60 * k, 0, y + 14 * k, [0, L.b[1], 1, L.b[3]]) : L.ink; g.stroke(); } g.restore();
  }
  // the body: tail end → low wave under the word → up the right side → over the top → head
  var BODY = [352, 250, 296, 300, 262, 420, 352, 470, 430, 512, 470, 418, 548, 424, 626, 430, 660, 512, 730, 470, 800, 428, 760, 330, 716, 262, 672, 194, 700, 92, 612, 78, 566, 72, 548, 98, 540, 120];

  function emblem(g, L, T) {
    g.fillStyle = T.rad(g, 512, 300, 60, 400, [0, 'rgba(90,255,180,.6)', 0.55, 'rgba(70,160,255,.3)', 1, 'rgba(0,0,0,0)']); g.fillRect(100, 0, 824, 572);
    dust(g, L, T);
    hexes(g, L, T, 520, 280, 1.08);
    tube(g, L, T, bez(BODY, 0.02), 44, 62);
    g.save(); g.font = '700 176px ' + T.FONT; g.restore();
    // measure first so the tail can sit under the E
    var c = document.createElement('canvas').getContext('2d'); c.font = '700 ' + 176 * 1.3 + 'px ' + T.FONT; var wS = c.measureText('S').width; c.font = '700 176px ' + T.FONT; var wR = 0; 'NAKIZE'.split('').forEach(function (ch) { wR += c.measureText(ch).width - 3.52; }); var W = wS - 3.52 + wR, x0 = 512 - W / 2;
    tail(g, L, T, x0 + W + 4, 352, 1.15);
    var m = wordmark(g, L, T, 512, 366, 176);
    sFace(g, L, m.x0 + m.wS * 0.63, 366 - m.big * 0.585, 1.25);
    head(g, L, T, 500, 112, 1.22, -0.04);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { bg(g, L, T); emblem(g, L, T); return; }
    if (kind === 'main') { g.translate(-94, -22); g.fillStyle = T.rad(g, 512, 290, 120, 400, [0, 'rgba(70,130,255,.5)', 1, 'rgba(70,130,255,0)']); g.fillRect(94, 22, 836, 540); emblem(g, L, T); return; }
    if (kind === 'wide') { var cw = document.createElement('canvas').getContext('2d'); cw.font = '700 ' + 150 * 1.3 + 'px ' + T.FONT; var a1 = cw.measureText('S').width; cw.font = '700 150px ' + T.FONT; var a2 = 0; 'NAKIZE'.split('').forEach(function (ch) { a2 += cw.measureText(ch).width - 3; }); var Ww = a1 - 3 + a2; tail(g, L, T, 414 + Ww / 2 + 4, 190, 1.0); var m2 = wordmark(g, L, T, 414, 202, 150); sFace(g, L, m2.x0 + m2.wS * 0.63, 202 - m2.big * 0.585, 1.06); return; }
    if (kind === 'badge') {
      g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.lin(g, 0, 0, 400, 400, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fill(); g.clip();
      g.fillStyle = T.rad(g, 200, 200, 20, 260, [0, 'rgba(90,150,255,.6)', 1, 'rgba(0,0,0,.2)']); g.fillRect(0, 0, 400, 400);
      hexes(g, L, T, 200, 206, 0.86);
      tube(g, L, T, bez([70, 330, 150, 380, 300, 370, 322, 290, 340, 220, 250, 190, 210, 150], 0.03), 38, 54);
      var m3 = wordmark(g, L, T, 200, 352, 62); sFace(g, L, m3.x0 + m3.wS * 0.63, 352 - m3.big * 0.585, 0.44);
      head(g, L, T, 176, 122, 1.5, -0.1);
      g.restore(); T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 12; g.strokeStyle = L.ink; g.stroke(); g.lineWidth = 6; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.a[1], 1, L.b[2]]); g.stroke();
      return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO snakize END
