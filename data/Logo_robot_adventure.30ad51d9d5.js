// 🏷️ LOGO robot-adventure START — 🤖 Code the Robot, drawn in code from Aowu's picture (gl-17, round 6). The friendly robot (one-piece body, depth from colour)
// waving and holding a ▶ ball, a glowing path of arrow tiles winding up to a FINISH gate, arrow signs, map pins, stars, pixel trees, floating code windows
// and </> tags, a neon grid floor; "CODE THE" gold over "ROBOT" ice-blue. Looks = the game's worlds (CodeRobot.html WORLDS: floor colours → sky, road, floor).
GameLogos.add('robot-adventure', (function () {
  var BOX = { scene: [1024, 572], main: [664, 560], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { sky: ['#5ac8ff', '#bdeeff', '#e8fbff'], hill: ['#6ad05a', '#3a9a4a'], road: ['#3a8ad8', '#2a5ab8'], edge: '#7af0ff', floor: ['#3a1a7a', '#1a0a4a'], grid: '#c05aff', tree: ['#2ac8a8', '#6ad86a', '#3a9ad8'], dark: '#0e1a4a',
    a: ['#fff6a0', '#ffd21a', '#ff9a0a'], b: ['#e0fbff', '#5ad0ff', '#1a6ae8'] };
    for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    park: mk({ sky: ['#7ad0ff', '#d8f4ff', '#eefaf0'], road: ['#E3F4D7', '#9ac87a'], edge: '#8affa8', hill: ['#8ad86a', '#4aa84a'] }),
    city: mk({ sky: ['#8ab8e8', '#d0e0f4', '#eef2f8'], road: ['#E7E9EE', '#9aa4b8'], edge: '#ffd23a', hill: ['#9aa8b8', '#6a7890'], tree: ['#7a8aa8', '#a8b8d0', '#5a6a88'] }),
    farm: mk({ sky: ['#8ad8ff', '#fff4d8', '#fff8e8'], road: ['#F6EBCF', '#d8b878'], edge: '#ffb84a', hill: ['#b8d86a', '#88a83a'] }),
    moon: mk({ sky: ['#0a0c2a', '#2C2F4A', '#363A5B'], road: ['#363A5B', '#1e2040'], edge: '#b0a0ff', hill: ['#4a4e70', '#2a2e4a'], tree: ['#6a5ad8', '#8a7af0', '#4a3ab8'] }),
    beach: mk({ sky: ['#4ac0f0', '#bff0ff', '#FFF2CC'], road: ['#FFF2CC', '#e8c878'], edge: '#3ad8f0', hill: ['#f0d898', '#d8b868'] }),
    snow: mk({ sky: ['#9ad0f8', '#e4f2ff', '#f4faff'], road: ['#EEF6FF', '#a8c8e8'], edge: '#8ad8ff', hill: ['#ffffff', '#c8dcf0'], tree: ['#3a8a6a', '#5aa88a', '#2a6a5a'] }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* ---------- the world ---------- */
  function sky(g, T, L) {
    g.fillStyle = T.lin(g, 0, 0, 0, 430, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 430);
    g.fillStyle = 'rgba(255,255,255,.85)'; [[640, 60, 50], [380, 40, 36], [980, 110, 40]].forEach(function (c) { g.beginPath(); g.ellipse(c[0], c[1], c[2] * 1.6, c[2] * 0.55, 0, 0, TAU); g.ellipse(c[0] + c[2] * 0.4, c[1] - c[2] * 0.3, c[2] * 0.8, c[2] * 0.5, 0, 0, TAU); g.fill(); });
    g.fillStyle = L.hill[0]; g.beginPath(); g.moveTo(0, 300); g.quadraticCurveTo(160, 230, 330, 290); g.lineTo(330, 430); g.lineTo(0, 430); g.closePath(); g.fill();
    g.fillStyle = L.hill[1]; g.beginPath(); g.moveTo(0, 340); g.quadraticCurveTo(140, 300, 280, 350); g.lineTo(280, 430); g.lineTo(0, 430); g.closePath(); g.fill();
  }
  function pixelTree(g, x, y, s, cols) {   // trunk + a crown made of squares
    g.fillStyle = '#7a4a2a'; g.fillRect(x - 6 * s, y - 70 * s, 12 * s, 70 * s); g.fillRect(x - 6 * s, y - 50 * s, -18 * s, 8 * s);
    var r = GameLogos.tools.rng(Math.round(x)); for (var i = 0; i < 110; i++) { var a = r() * TAU, d = Math.sqrt(r()) * 52 * s, q = (12 + r() * 10) * s; g.fillStyle = cols[i % cols.length]; g.globalAlpha = 0.85 + r() * 0.15; g.fillRect(x + Math.cos(a) * d * 1.2 - q / 2, y - 100 * s + Math.sin(a) * d * 0.8 - q / 2, q, q); } g.globalAlpha = 1;
  }
  function codeWin(g, T, x, y, w, h, c) { g.save(); g.shadowColor = c || '#5ad0ff'; g.shadowBlur = 10; T.rr(g, x, y, w, h, 8); g.fillStyle = c ? T.lin(g, 0, y, 0, y + h, [0, sh(c, 0.2), 1, c]) : '#1a2a5a'; g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x, y, w, h * 0.16); var cols = c ? ['rgba(255,255,255,.75)'] : ['#5ad0ff', '#ffd23a', '#ff6ab8', '#7af07a']; for (var i = 0; i < 3; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(x + w * 0.12, y + h * (0.32 + i * 0.2), w * (0.35 + (i % 2) * 0.3), h * 0.08); } }
  function tag(g, T, x, y, s, c) { g.save(); g.font = '700 ' + s + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = s * 0.22; g.lineJoin = 'round'; g.strokeStyle = '#1a2a5a'; g.strokeText('</>', x, y); g.fillStyle = c || '#ffc81a'; g.shadowColor = c || '#ffc81a'; g.shadowBlur = 10; g.fillText('</>', x, y); g.restore(); }
  function floor(g, T, L) {   // neon grid floor in perspective
    g.fillStyle = T.lin(g, 0, 400, 0, 572, [0, L.floor[0], 1, L.floor[1]]); g.fillRect(0, 400, 1024, 172);
    g.save(); g.strokeStyle = L.grid; g.lineWidth = 2; g.shadowColor = L.grid; g.shadowBlur = 8; g.globalAlpha = 0.8;
    for (var i = 0; i < 5; i++) { var y = 410 + Math.pow(i / 4, 1.6) * 160; g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    for (var k = -9; k <= 9; k++) { g.beginPath(); g.moveTo(512 + k * 40, 400); g.lineTo(512 + k * 140, 572); g.stroke(); } g.restore();
  }
  function road(g, T, L) {   // the glowing tile walkway, wide in front and narrowing into the distance, purple side wall, neon edges, arrow tiles
    var S1 = [560, 600, 800, 430, 742, 262], S2 = [742, 262, 700, 120, 872, 64];
    function pt(p, t) { var u = 1 - t; return [u * u * p[0] + 2 * u * t * p[2] + t * t * p[4], u * u * p[1] + 2 * u * t * p[3] + t * t * p[5]]; }
    function nrm(p, t) { var u = 1 - t, dx = 2 * u * (p[2] - p[0]) + 2 * t * (p[4] - p[2]), dy = 2 * u * (p[3] - p[1]) + 2 * t * (p[5] - p[3]), d = Math.hypot(dx, dy) || 1; return [-dy / d, dx / d]; }
    var L1 = [], R1 = [], RAILS = [], N = 40;
    for (var i = 0; i <= N; i++) { var t = i / N, seg = t < 0.62 ? S1 : S2, tt = t < 0.62 ? t / 0.62 : (t - 0.62) / 0.38, c = pt(seg, tt), n = nrm(seg, tt), w = 300 * Math.pow(1 - t, 1.35) + 34; L1.push([c[0] - n[0] * w / 2, c[1] - n[1] * w / 2]); R1.push([c[0] + n[0] * w / 2, c[1] + n[1] * w / 2]); RAILS.push([c, n, w]); }
    function poly(dy) { g.beginPath(); L1.forEach(function (q, i) { g[i ? 'lineTo' : 'moveTo'](q[0], q[1] + (dy || 0)); }); for (var j = R1.length - 1; j >= 0; j--) g.lineTo(R1[j][0], R1[j][1] + (dy || 0)); g.closePath(); }
    // purple side wall under the walkway
    g.save(); poly(26); g.fillStyle = T.lin(g, 0, 60, 0, 572, [0, '#5a2aa8', 1, '#2a0a6a']); g.fill(); g.restore();
    g.save(); poly(0); g.shadowColor = L.edge; g.shadowBlur = 26; g.fillStyle = T.lin(g, 0, 60, 0, 572, [0, sh(L.road[1], -0.15), 1, sh(L.road[1], -0.45)]); g.fill(); g.restore();
    g.save(); poly(0); g.clip();
    // tiles: cross lines every step (closer together far away) + lane lines
    g.strokeStyle = L.edge; g.lineWidth = 2.5; g.shadowColor = L.edge; g.shadowBlur = 8; g.globalAlpha = 0.85;
    for (var k = 0; k < N; k += 2) { var a = L1[k], b2 = R1[k]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b2[0], b2[1]); g.stroke(); }
    [-0.25, 0.25].forEach(function (f) { g.beginPath(); RAILS.forEach(function (r, i) { var x = r[0][0] + r[1][0] * r[2] * f, y = r[0][1] + r[1][1] * r[2] * f; g[i ? 'lineTo' : 'moveTo'](x, y); }); g.stroke(); });
    g.globalAlpha = 1; g.shadowBlur = 0; g.fillStyle = T.lin(g, 0, 60, 0, 572, [0, 'rgba(160,240,255,.25)', 1, 'rgba(160,240,255,0)']); g.fillRect(500, 0, 524, 572); g.restore();
    // neon edges
    g.save(); g.lineWidth = 6; g.strokeStyle = L.edge; g.shadowColor = L.edge; g.shadowBlur = 14; g.lineJoin = 'round'; [L1, R1].forEach(function (E) { g.beginPath(); E.forEach(function (q, i) { g[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); g.stroke(); }); g.restore();
    // arrow tiles along the middle
    [[0.1, 1.5], [0.3, 1.1], [0.5, 0.8]].forEach(function (q) { var i = Math.round(q[0] * N), r = RAILS[i], nx = RAILS[Math.min(N, i + 1)][0], an = Math.atan2(nx[1] - r[0][1], nx[0] - r[0][0]); g.save(); g.translate(r[0][0], r[0][1]); g.rotate(an); g.scale(q[1], q[1]); g.fillStyle = 'rgba(255,190,60,.95)'; g.shadowColor = '#ffb84a'; g.shadowBlur = 12; g.beginPath(); g.moveTo(22, 0); g.lineTo(-2, -20); g.lineTo(-2, -9); g.lineTo(-22, -9); g.lineTo(-22, 9); g.lineTo(-2, 9); g.lineTo(-2, 20); g.closePath(); g.fill(); g.restore(); });
  }
  function sign(g, T, x, y, s, dir) { g.fillStyle = '#5a6a8a'; g.fillRect(x - 2.5 * s, y, 5 * s, 34 * s); g.save(); g.shadowColor = '#5ad0ff'; g.shadowBlur = 10; T.rr(g, x - 18 * s, y - 32 * s, 36 * s, 32 * s, 6 * s); g.fillStyle = T.lin(g, 0, y - 32 * s, 0, y, [0, '#5a9aff', 1, '#1a4ab8']); g.fill(); g.restore();
    g.save(); g.translate(x, y - 16 * s); g.rotate(dir); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -11 * s); g.lineTo(9 * s, 0); g.lineTo(3.5 * s, 0); g.lineTo(3.5 * s, 10 * s); g.lineTo(-3.5 * s, 10 * s); g.lineTo(-3.5 * s, 0); g.lineTo(-9 * s, 0); g.closePath(); g.fill(); g.restore(); }
  function mapPin(g, x, y, s, c) { g.beginPath(); g.moveTo(x, y + 14 * s); g.bezierCurveTo(x - 12 * s, y + 2 * s, x - 10 * s, y - 12 * s, x, y - 12 * s); g.bezierCurveTo(x + 10 * s, y - 12 * s, x + 12 * s, y + 2 * s, x, y + 14 * s); g.fillStyle = c; g.fill(); g.beginPath(); g.arc(x, y - 2 * s, 5 * s, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
  function finish(g, T) { g.fillStyle = '#3a4a6a'; g.fillRect(784, 30, 5, 70); g.fillRect(842, 30, 5, 70); T.rr(g, 780, 32, 70, 26, 4); g.fillStyle = '#1a2a5a'; g.fill(); g.font = '700 15px ' + T.FONT; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FINISH', 815, 46); }
  /* ---------- the robot (one-piece body, depth from colour) ---------- */
  function robot(g, T, L, dx, dy, s) {
    g.save(); g.translate(dx, dy); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; var INK = '#1a2a5a', SH = 'rgba(30,50,110,';
    var WH = ['#ffffff', '#e4ecf6', '#b8c8dc', '#8aa0bc'], BL = ['#9ad0ff', '#4a8ae8', '#2a5ab8'];
    var P = {
      antenna: function (h) { h.fillRect(511, 40, 8, 34); h.beginPath(); h.arc(515, 36, 13, 0, TAU); h.fill(); },
      armL: function (h) { T.limb(h, [462, 252, 420, 262, 398, 236], 30, 26, 4); T.limb(h, [398, 236, 380, 216, 372, 196], 26, 22); h.beginPath(); h.ellipse(366, 186, 20, 24, -0.3, 0, TAU); h.fill(); [[-14, -26], [-4, -32], [8, -30], [18, -22]].forEach(function (f) { T.limb(h, [366, 182, 366 + f[0] * 0.6, 182 + f[1] * 0.6, 366 + f[0], 182 + f[1]], 9, 7); }); T.limb(h, [380, 196, 394, 190, 400, 178], 9, 7); },
      armR: function (h) { T.limb(h, [568, 256, 610, 272, 630, 250], 30, 26, 4); h.beginPath(); h.ellipse(636, 244, 18, 16, 0.4, 0, TAU); h.fill(); },
      torso: function (h) { h.beginPath(); h.moveTo(470, 238); h.bezierCurveTo(480, 228, 550, 228, 562, 238); h.bezierCurveTo(574, 270, 562, 320, 516, 326); h.bezierCurveTo(470, 320, 458, 270, 470, 238); h.closePath(); h.fill(); h.beginPath(); h.ellipse(470, 248, 18, 16, 0, 0, TAU); h.ellipse(562, 248, 18, 16, 0, 0, TAU); h.fill(); },
      ears: function (h) { h.beginPath(); h.ellipse(414, 152, 22, 30, 0, 0, TAU); h.ellipse(616, 152, 22, 30, 0, 0, TAU); h.fill(); },
      head: function (h) { h.beginPath(); h.moveTo(422, 150); h.bezierCurveTo(420, 92, 466, 66, 515, 66); h.bezierCurveTo(564, 66, 610, 92, 608, 150); h.bezierCurveTo(608, 200, 580, 230, 515, 232); h.bezierCurveTo(450, 230, 422, 200, 422, 150); h.closePath(); h.fill(); }
    };
    onePiece();
    function onePiece() {
      T.onePiece(g, T, { x0: 330, y0: 14, W: 330, H: 330, rim: INK, rimW: 4.4, parts: P, order: ['antenna', 'armR', 'torso', 'armL', 'ears', 'head'],
        colour: function (B, put, inside) {
          put(B, 'antenna', '#8aa0bc'); inside(B, 'antenna', function (h) { h.beginPath(); h.arc(515, 36, 13, 0, TAU); h.fillStyle = T.rad(h, 510, 31, 1, 14, [0, '#ffe08a', 0.5, '#ff9a2a', 1, '#d8600a']); h.fill(); });
          put(B, 'armR', T.lg(B, 568, 240, 640, 270, [0, WH[2], 1, WH[3]])); inside(B, 'armR', function (h) { h.beginPath(); h.ellipse(636, 244, 18, 16, 0.4, 0, TAU); h.fillStyle = BL[1]; h.fill(); });
          put(B, 'torso', T.lg(B, 470, 230, 562, 326, [0, WH[0], 0.55, WH[1], 1, WH[2]]));
          inside(B, 'torso', function (h) { h.fillStyle = T.rg(h, 515, 232, 4, 50, [0, SH + '.45)', 1, SH + '0)']); h.fillRect(460, 226, 110, 50); h.fillStyle = BL[1]; h.beginPath(); h.ellipse(470, 248, 18, 16, 0, 0, TAU); h.ellipse(562, 248, 18, 16, 0, 0, TAU); h.fill(); });
          put(B, 'armL', SH + '.3)', 5, 8); put(B, 'armL', T.lg(B, 460, 250, 366, 180, [0, WH[1], 0.5, WH[0], 1, WH[1]]));
          inside(B, 'armL', function (h) { h.fillStyle = BL[1]; h.beginPath(); h.ellipse(366, 186, 20, 24, -0.3, 0, TAU); h.fill(); [[-14, -26], [-4, -32], [8, -30], [18, -22]].forEach(function (f) { h.save(); h.fillStyle = BL[1]; T.limb(h, [366, 182, 366 + f[0] * 0.6, 182 + f[1] * 0.6, 366 + f[0], 182 + f[1]], 9, 7); h.restore(); }); h.save(); h.fillStyle = BL[1]; T.limb(h, [380, 196, 394, 190, 400, 178], 9, 7); h.restore(); h.fillStyle = BL[2]; h.beginPath(); h.ellipse(398, 236, 11, 11, 0, 0, TAU); h.fill(); });
          put(B, 'ears', T.rg(B, 410, 145, 2, 34, [0, '#ffe08a', 0.5, '#ffaa2a', 1, '#c8640a']));
          put(B, 'head', T.rg(B, 488, 104, 8, 150, [0, WH[0], 0.45, WH[1], 0.8, WH[2], 1, WH[3]]));
          inside(B, 'head', function (h) {   // orange visor band over the top, the dark screen face
            h.fillStyle = T.lg(h, 0, 70, 0, 110, [0, '#ffd04a', 1, '#ff8a1a']); h.beginPath(); h.moveTo(428, 112); h.bezierCurveTo(440, 74, 590, 74, 602, 112); h.lineTo(592, 120); h.bezierCurveTo(580, 92, 450, 92, 438, 120); h.closePath(); h.fill();
            GameLogos.tools.rr(h, 446, 108, 138, 104, 34); h.fillStyle = T.lg(h, 0, 108, 0, 212, [0, '#2a3a6a', 1, '#0a1230']); h.fill();
            h.fillStyle = 'rgba(255,255,255,.55)'; h.beginPath(); h.ellipse(452, 104, 18, 10, -0.5, 0, TAU); h.fill(); });
        } });
    }
    // face: glowing ring eyes + smile, highlight on the screen
    g.save(); g.shadowColor = '#5af0ff'; g.shadowBlur = 14; g.strokeStyle = '#6af4ff'; g.lineWidth = 6; [[484, 158], [546, 158]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 16, 0, TAU); g.stroke(); }); g.restore();
    g.fillStyle = '#e8ffff'; [[484, 158], [546, 158]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 8, 0, TAU); g.fill(); g.beginPath(); g.arc(e[0] - 4, e[1] - 4, 3, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.fillStyle = '#e8ffff'; });
    g.save(); g.shadowColor = '#ffd04a'; g.shadowBlur = 10; g.strokeStyle = '#ffd04a'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.arc(515, 182, 18, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); g.restore();
    g.fillStyle = 'rgba(255,255,255,.18)'; GameLogos.tools.rr(g, 456, 114, 40, 14, 7); g.fill();
    // chest light + the ▶ ball in the right hand
    g.save(); g.shadowColor = '#ffb84a'; g.shadowBlur = 16; g.beginPath(); g.arc(515, 282, 15, 0, TAU); g.fillStyle = T.rad(g, 511, 278, 1, 16, [0, '#fff4c0', 0.5, '#ffb81a', 1, '#d0700a']); g.fill(); g.restore(); g.beginPath(); g.arc(515, 282, 15, 0, TAU); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    g.save(); g.shadowColor = '#5ad0ff'; g.shadowBlur = 18; g.beginPath(); g.arc(650, 230, 28, 0, TAU); g.fillStyle = T.rad(g, 642, 222, 2, 30, [0, '#8ae0ff', 0.55, '#2a7ae8', 1, '#103a9a']); g.fill(); g.restore(); g.beginPath(); g.arc(650, 230, 28, 0, TAU); g.lineWidth = 4; g.strokeStyle = '#ffc81a'; g.stroke();
    g.beginPath(); g.moveTo(642, 216); g.lineTo(664, 230); g.lineTo(642, 244); g.closePath(); g.fillStyle = '#fff'; g.fill();
    g.save(); g.fillStyle = BL[1]; g.beginPath(); g.ellipse(632, 252, 12, 9, 0.2, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.restore();
    g.restore();
  }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    function o(c, sz) { return { spacing: sz * 0.01, dark: L.dark, outline: sz * 0.2, depth: sz * 0.09, fat: sz * 0.006, ring: 'rgba(255,255,255,.9)', edge: function () { return sh(c[2], -0.45); }, edgeW: sz * 0.075, face: function () { return [0, c[0], 0.45, c[1], 1, c[2]]; } }; }
    var s1 = 98 * k, s2 = 126 * k, A = o(L.a, s1), B = o(L.b, s2);
    if (oneLine) { s2 = s1; B = o(L.b, s2); g.save(); g.font = '700 ' + s1 + 'px ' + T.FONT; var w1 = g.measureText('CODE THE').width + 7 * s1 * 0.01, w2 = g.measureText('ROBOT').width + 4 * s1 * 0.01; g.restore(); var gap = 28 * k, x0 = cx - (w1 + gap + w2) / 2;
      T.word(g, 'CODE THE', x0 + w1 / 2, y1, s1, A); T.gloss(g, 'CODE THE', x0 + w1 / 2, y1, s1, A, 0.45); T.word(g, 'ROBOT', x0 + w1 + gap + w2 / 2, y1, s2, B); T.gloss(g, 'ROBOT', x0 + w1 + gap + w2 / 2, y1, s2, B, 0.45); return; }
    B.glow = '#5ad0ff'; B.glowN = 2; B.glowBlur = 0.3;
    T.word(g, 'ROBOT', cx, y2, s2, B); T.gloss(g, 'ROBOT', cx, y2, s2, B, 0.45);
    A.glow = 'rgba(255,200,60,.8)'; A.glowBlur = 0.25; T.word(g, 'CODE THE', cx, y1, s1, A); T.gloss(g, 'CODE THE', cx, y1, s1, A, 0.45);
  }
  function scene(g, T, L) {
    sky(g, T, L); floor(g, T, L);
    pixelTree(g, 70, 240, 1.15, L.tree); pixelTree(g, 210, 230, 0.9, L.tree.slice().reverse()); pixelTree(g, 130, 300, 0.7, L.tree);
    road(g, T, L); finish(g, T);
    sign(g, T, 746, 100, 0.9, 0); sign(g, T, 858, 180, 1, 0); sign(g, T, 912, 286, 1.1, Math.PI / 2); sign(g, T, 930, 470, 1.4, Math.PI / 2);
    mapPin(g, 718, 138, 1.3, '#a05af0'); mapPin(g, 796, 182, 1.1, '#ff8a2e'); mapPin(g, 756, 270, 1.2, '#a05af0');
    [[882, 66, 14], [924, 70, 10], [804, 244, 13], [770, 380, 10]].forEach(function (s2) { g.save(); g.fillStyle = '#ffc81a'; g.strokeStyle = '#c8901a'; g.lineWidth = 2; T.star(g, s2[0], s2[1], s2[2], s2[2] * 0.46); g.fill(); g.stroke(); g.restore(); });
    g.save(); g.translate(964, 46); g.fillStyle = T.lin(g, 0, -24, 0, 26, [0, '#ffd04a', 1, '#ff6a1a']); g.shadowColor = '#ffb84a'; g.shadowBlur = 12; g.beginPath(); g.moveTo(0, -26); g.lineTo(22, -2); g.lineTo(9, -2); g.lineTo(9, 26); g.lineTo(-9, 26); g.lineTo(-9, -2); g.lineTo(-22, -2); g.closePath(); g.fill(); g.restore();
    codeWin(g, T, 270, 34, 92, 58); codeWin(g, T, 120, 240, 108, 52, '#ff9a4a'); codeWin(g, T, 86, 330, 76, 40, '#ff9a4a'); codeWin(g, T, 920, 150, 90, 50); codeWin(g, T, 976, 446, 70, 60, '#ff9a4a');
    g.save(); g.shadowColor = '#a05af0'; g.shadowBlur = 12; T.rr(g, 40, 384, 64, 64, 10); g.fillStyle = '#7a3ad8'; g.fill(); g.restore(); tag(g, T, 72, 416, 26, '#fff');
    tag(g, T, 268, 312, 30); tag(g, T, 246, 464, 26);
    var r = T.rng(3); for (var i = 0; i < 22; i++) T.spark(g, r() * 1024, r() * 400, 4 + r() * 8, '#fff', 0.7 + r() * 0.3);
    robot(g, T, L, 0, 0, 1);
    words(g, T, L, 535, 398, 512, 1);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { scene(g, T, L); return; }
    if (kind === 'main') { g.save(); T.rr(g, 0, 0, 664, 560, 72); g.clip(); g.translate(-196, -6); scene(g, T, L); g.restore(); T.rr(g, 3, 3, 658, 554, 70); g.lineWidth = 6; g.strokeStyle = L.edge; g.stroke(); return; }
    if (kind === 'wide') { g.save(); g.beginPath(); g.arc(100, 100, 92, 0, TAU); g.clip(); g.fillStyle = T.lin(g, 0, 0, 0, 200, [0, L.sky[0], 1, L.sky[1]]); g.fillRect(0, 0, 200, 200); g.translate(100, 112); g.scale(0.62, 0.62); g.translate(-515, -170); robot(g, T, L, 0, 0, 1); g.restore();
      g.beginPath(); g.arc(100, 100, 92, 0, TAU); g.lineWidth = 6; g.strokeStyle = L.edge; g.stroke(); words(g, T, L, 540, 138, 0, 0.72, true); return; }
    if (kind === 'badge') {
      g.save(); T.rr(g, 10, 10, 380, 380, 86); g.clip();
      if (px >= 90) { g.translate(200, 200); g.scale(0.62, 0.62); g.translate(-532, -300); scene(g, T, L); }
      else { g.fillStyle = T.lin(g, 0, 0, 0, 400, [0, L.sky[0], 1, L.sky[1]]); g.fillRect(0, 0, 400, 400); g.translate(200, 230); g.scale(1.25, 1.25); g.translate(-515, -170); robot(g, T, L, 0, 0, 1); }
      g.restore(); T.rr(g, 12, 12, 376, 376, 84); g.lineWidth = 7; g.strokeStyle = L.edge; g.stroke(); return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO robot-adventure END
