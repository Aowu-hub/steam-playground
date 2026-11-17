// 🏷️ LOGO hopper START — 🐸 Dodgy Hopper, drawn in code from Aowu's picture (gl-26, round 9). The green long-eared hopper in a leather pilot cap and
// goggles mid-leap (one-piece, depth from colour) over a cracked curving road; a flaming meteor, tumbling rocks, an orange car, coins, stars, arrows,
// a puddle; cheese-yellow "DODGY" (with cheese holes) over green "HOPPER"; a rainbow frame. Looks = Hopper.html THEMES (swamp · city · dino · zombie ·
// fantasy · sky): sky, grass and road colours.
GameLogos.add('hopper', (function () {
  var BOX = { scene: [1024, 572], main: [572, 552], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { sky: ['#bfe8ff', '#7ac8f0'], grass: ['#8ad85a', '#4a9a3a'], road: '#6a6e78', line: '#ffd23a' }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    swamp: mk({ sky: ['#c8e8b0', '#6aa86a'], grass: ['#6DA34D', '#2F5B37'], road: '#7A5A3A', line: '#c8a070' }), city: mk({ sky: ['#d8e4f0', '#8aa0c0'], grass: ['#C9CED6', '#8a94a4'], road: '#4A4F5A', line: '#F4F4F4' }),
    dino: mk({ sky: ['#ffd8a0', '#e8905a'], grass: ['#a8b84a', '#6a7a2a'], road: '#B8925A', line: '#fff0c0' }), zombie: mk({ sky: ['#8a6aa8', '#3a2a5a'], grass: ['#6a8a4a', '#2a3a2a'], road: '#3D3A45', line: '#b6ff5c' }),
    fantasy: mk({ sky: ['#ffd0f0', '#a88ae8'], grass: ['#9ae8b0', '#4aa88a'], road: '#C9B5F0', line: '#ffffff' }), sky: mk({ sky: ['#e8f6ff', '#4C8FD6'], grass: ['#ffffff', '#c8e0f8'], road: '#A9D8FF', line: '#ffd23a' }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#1a1408', PX = 240, PY = 22, PW = 548, PH = 528;
  /* ---------- the world inside the frame ---------- */
  function world(g, T, L, full) {
    g.fillStyle = T.lin(g, 0, PY, 0, PY + 300, [0, L.sky[1], 1, L.sky[0]]); g.fillRect(PX, PY, PW, PH);
    g.save(); g.globalAlpha = 0.35; g.fillStyle = '#fff'; for (var i = 0; i < 14; i++) { g.beginPath(); g.moveTo(560, 120); g.arc(560, 120, 600, i * TAU / 14, i * TAU / 14 + 0.12); g.closePath(); g.fill(); } g.restore();
    g.fillStyle = 'rgba(255,255,255,.85)'; [[300, 150, 40], [340, 140, 30], [700, 170, 34], [740, 160, 26]].forEach(function (c) { g.beginPath(); g.arc(c[0], c[1], c[2], 0, TAU); g.fill(); });
    g.fillStyle = T.lin(g, 0, 200, 0, 550, [0, L.grass[0], 1, L.grass[1]]); g.beginPath(); g.moveTo(PX, 250); g.quadraticCurveTo(420, 210, 560, 250); g.quadraticCurveTo(700, 290, PX + PW, 240); g.lineTo(PX + PW, PY + PH); g.lineTo(PX, PY + PH); g.closePath(); g.fill();
    // the road: a band between two curves
    function bez(p, t) { var u = 1 - t; return [u * u * p[0] + 2 * u * t * p[2] + t * t * p[4], u * u * p[1] + 2 * u * t * p[3] + t * t * p[5]]; }
    var A = [PX, 270, 330, 236, 360, 330], A2 = [360, 330, 380, 470, 460, 560], B = [PX, 318, 290, 300, 300, 380], B2 = [300, 380, 310, 480, 360, 560];
    g.beginPath(); var k; for (k = 0; k <= 20; k++) { var a = bez(A, k / 20); g[k ? 'lineTo' : 'moveTo'](a[0], a[1]); } for (k = 0; k <= 20; k++) { a = bez(A2, k / 20); g.lineTo(a[0], a[1]); }
    g.lineTo(780, 560); g.lineTo(780, 470); g.quadraticCurveTo(560, 470, 480, 520); g.lineTo(560, 560); g.lineTo(360, 560); for (k = 20; k >= 0; k--) { a = bez(B2, k / 20); g.lineTo(a[0], a[1]); } for (k = 20; k >= 0; k--) { a = bez(B, k / 20); g.lineTo(a[0], a[1]); } g.closePath();
    g.fillStyle = L.road; g.fill(); g.lineWidth = 5; g.strokeStyle = sh(L.road, 0.4); g.stroke();
    g.save(); g.setLineDash([16, 14]); g.lineWidth = 5; g.strokeStyle = L.line; g.beginPath(); g.moveTo(PX, 296); g.quadraticCurveTo(310, 270, 330, 350); g.quadraticCurveTo(342, 470, 410, 560); g.stroke(); g.setLineDash([]); g.restore();
    g.strokeStyle = 'rgba(20,10,0,.75)'; g.lineWidth = 3; [[310, 300, 1], [470, 530, 1.4], [600, 500, 1]].forEach(function (c) { g.save(); g.translate(c[0], c[1]); g.scale(c[2], c[2]); g.beginPath(); g.moveTo(-18, -4); g.lineTo(-6, 2); g.lineTo(0, -6); g.lineTo(8, 4); g.lineTo(20, -2); g.moveTo(0, -6); g.lineTo(2, -16); g.stroke(); g.restore(); });
    g.fillStyle = T.lin(g, 0, 470, 0, 510, [0, '#8ad8ff', 1, '#2a8ae0']); g.beginPath(); g.ellipse(702, 492, 62, 16, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.ellipse(690, 488, 30, 5, 0, 0, TAU); g.stroke();
    g.fillStyle = '#3a8a2a'; [[262, 470, 26], [290, 500, 30], [768, 420, 24], [760, 460, 20]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fill(); });
  }
  function meteor(g, T, x, y) { g.save(); g.fillStyle = T.lin(g, x - 80, y - 60, x, y, [0, 'rgba(255,90,20,0)', 0.5, 'rgba(255,110,30,.85)', 1, 'rgba(255,220,90,1)']);
    g.beginPath(); g.moveTo(x - 90, y - 70); g.lineTo(x + 16, y - 16); g.lineTo(x - 14, y + 18); g.closePath(); g.fill(); g.restore();
    g.beginPath(); g.arc(x, y, 24, 0, TAU); g.fillStyle = T.rad(g, x - 6, y - 6, 2, 26, [0, '#b8804a', 1, '#5a3418']); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    g.fillStyle = '#4a2a10'; [[-8, -4, 5], [6, 6, 6], [8, -10, 4]].forEach(function (c) { g.beginPath(); g.arc(x + c[0], y + c[1], c[2], 0, TAU); g.fill(); }); }
  function rock(g, T, x, y, r) { g.beginPath(); for (var i = 0; i < 7; i++) { var a = i * TAU / 7, q = r * (0.8 + (i % 3) * 0.12); g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fillStyle = T.lin(g, x - r, y - r, x + r, y + r, [0, '#c8c4bc', 1, '#6a665e']); g.fill(); g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke(); }
  function coin(g, T, x, y, r) { g.beginPath(); g.ellipse(x, y, r * 0.86, r, 0, 0, TAU); g.fillStyle = T.lin(g, x - r, y - r, x + r, y + r, [0, '#fff2a0', 0.5, '#ffc21a', 1, '#c8800a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#8a5a04'; g.stroke(); g.font = '700 ' + (r * 1.1) + 'px ' + T.FONT; g.textAlign = 'center'; g.fillStyle = '#a86a04'; g.fillText('$', x, y + r * 0.38); }
  function arrow(g, T, pts, col, w) { g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); g.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); g.lineWidth = w + 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = w; g.strokeStyle = col; g.stroke();
    var a = Math.atan2(pts[5] - pts[3], pts[4] - pts[2]); g.translate(pts[4], pts[5]); g.rotate(a); g.beginPath(); g.moveTo(20, 0); g.lineTo(-8, -16); g.lineTo(-8, 16); g.closePath(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.fillStyle = col; g.fill(); g.restore(); }
  function car(g, T) {
    var P = { body: function (h) { h.beginPath(); h.moveTo(266, 412); h.lineTo(268, 380); h.quadraticCurveTo(272, 368, 290, 366); h.lineTo(300, 340); h.quadraticCurveTo(306, 330, 320, 330); h.lineTo(346, 330); h.quadraticCurveTo(358, 332, 364, 346); h.lineTo(372, 366); h.quadraticCurveTo(388, 370, 388, 386); h.lineTo(386, 412); h.closePath(); h.fill(); },
      wheels: function (h) { h.beginPath(); h.arc(296, 414, 17, 0, TAU); h.arc(362, 414, 17, 0, TAU); h.fill(); } };
    T.onePiece(g, T, { x0: 250, y0: 316, W: 156, H: 124, rim: INK, rimW: 4, parts: P, order: ['body', 'wheels'],
      colour: function (B, put, inside) { put(B, 'body', T.lg(B, 0, 330, 0, 412, [0, '#ffb05a', 0.5, '#f0701a', 1, '#b8480a']));
        inside(B, 'body', function (h) { h.fillStyle = T.lg(h, 0, 336, 0, 366, [0, '#d8f4ff', 1, '#5aa8e0']); h.beginPath(); h.moveTo(304, 364); h.lineTo(312, 340); h.lineTo(330, 340); h.lineTo(330, 364); h.closePath(); h.moveTo(338, 340); h.lineTo(352, 340); h.lineTo(362, 364); h.lineTo(338, 364); h.closePath(); h.fill();
          h.fillStyle = '#fff6c0'; h.beginPath(); h.ellipse(380, 384, 6, 5, 0, 0, TAU); h.fill(); h.fillStyle = 'rgba(80,20,0,.3)'; h.fillRect(260, 396, 140, 20); h.fillStyle = '#d8d8e0'; h.fillRect(262, 398, 128, 5); });
        put(B, 'wheels', '#1a1c24'); inside(B, 'wheels', function (h) { h.fillStyle = '#c8ccd8'; h.beginPath(); h.arc(296, 414, 7, 0, TAU); h.arc(362, 414, 7, 0, TAU); h.fill(); }); } });
  }
  /* ---------- the hopper ---------- */
  function hopper(g, T) {
    var GR = ['#c8f08a', '#7ad84a', '#3a9a2a', '#226a1a'], CAP = ['#c8905a', '#8a5a2a', '#5a3414'];
    var tf = { };
    var P = {
      earB: function (h) { T.taper(h, [512, 104, 466, 70, 420, 96], function (t) { return 26 - t * 8 + Math.sin(t * Math.PI) * 6; }); },
      legB: function (h) { T.limb(h, [524, 268, 498, 288, 474, 300], 28, 20); h.beginPath(); h.ellipse(454, 304, 24, 11, -0.15, 0, TAU); h.fill(); },
      armB: function (h) { T.limb(h, [514, 214, 488, 238, 462, 236], 22, 17); h.beginPath(); h.arc(455, 234, 12, 0, TAU); h.fill(); },
      body: function (h) { h.save(); T.around(h, 544, 240, -0.55); h.beginPath(); h.ellipse(544, 236, 32, 46, 0, 0, TAU); h.fill(); h.restore(); },
      legF: function (h) { T.limb(h, [560, 268, 596, 260, 602, 286], 28, 20); h.beginPath(); h.ellipse(616, 294, 24, 11, 0.2, 0, TAU); h.fill(); },
      armF: function (h) { T.limb(h, [570, 212, 608, 222, 636, 206], 22, 18); h.beginPath(); h.arc(646, 202, 15, 0, TAU); h.fill(); },
      earF: function (h) { T.taper(h, [524, 98, 500, 44, 474, 30], function (t) { return 30 - t * 10 + Math.sin(t * Math.PI) * 6; }); },
      head: function (h) { h.beginPath(); h.ellipse(548, 142, 52, 50, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(572, 168, 38, 28, 0.1, 0, TAU); h.fill(); },
      cap: function (h) { h.beginPath(); h.moveTo(494, 134); h.bezierCurveTo(492, 74, 600, 66, 604, 126); h.quadraticCurveTo(550, 112, 494, 134); h.closePath(); h.fill(); h.beginPath(); h.ellipse(500, 150, 12, 22, 0.1, 0, TAU); h.fill(); }
    };
    T.onePiece(g, T, { x0: 400, y0: 16, W: 270, H: 310, rim: INK, rimW: 4.2, parts: P, tf: tf, order: ['earB', 'legB', 'armB', 'body', 'legF', 'armF', 'earF', 'head', 'cap'],
      colour: function (B, put, inside) {
        put(B, 'earB', GR[2]); inside(B, 'earB', function (h) { h.fillStyle = '#e8a0a8'; T.taper(h, [508, 104, 466, 76, 430, 96], function (t) { return 10 - t * 4; }); });
        put(B, 'legB', T.lg(B, 520, 270, 440, 300, [0, GR[2], 1, GR[3]]));
        put(B, 'armB', GR[2]);
        put(B, 'body', T.rg(B, 556, 228, 4, 60, [0, GR[0], 0.5, GR[1], 1, GR[2]])); inside(B, 'body', function (h) { h.save(); T.around(h, 552, 248, -0.55); h.fillStyle = 'rgba(240,255,200,.6)'; h.beginPath(); h.ellipse(556, 250, 18, 32, 0, 0, TAU); h.fill(); h.restore(); });
        put(B, 'legF', T.lg(B, 560, 260, 620, 300, [0, GR[1], 1, GR[2]]));
        put(B, 'armF', T.lg(B, 570, 0, 650, 0, [0, GR[1], 1, GR[0]])); inside(B, 'armF', function (h) { h.strokeStyle = GR[3]; h.lineWidth = 2; h.beginPath(); h.moveTo(640, 196); h.lineTo(652, 198); h.moveTo(640, 204); h.lineTo(654, 206); h.stroke(); });
        put(B, 'earF', T.lg(B, 474, 30, 524, 100, [0, GR[1], 1, GR[2]])); inside(B, 'earF', function (h) { h.fillStyle = '#f0a8b0'; T.taper(h, [522, 96, 502, 52, 482, 38], function (t) { return 12 - t * 5; }); });
        put(B, 'head', T.rg(B, 560, 130, 6, 70, [0, GR[0], 0.55, GR[1], 1, GR[2]])); inside(B, 'head', function (h) { h.fillStyle = 'rgba(240,255,200,.55)'; h.beginPath(); h.ellipse(580, 172, 28, 18, 0.1, 0, TAU); h.fill(); });
        put(B, 'cap', T.lg(B, 0, 70, 0, 170, [0, CAP[0], 0.5, CAP[1], 1, CAP[2]])); inside(B, 'cap', function (h) { h.strokeStyle = 'rgba(60,30,10,.6)'; h.lineWidth = 2.5; h.beginPath(); h.moveTo(548, 74); h.quadraticCurveTo(552, 100, 550, 118); h.stroke(); h.fillStyle = 'rgba(255,230,190,.35)'; h.beginPath(); h.ellipse(530, 90, 16, 8, -0.5, 0, TAU); h.fill(); });
      } });
    // goggles on the cap
    g.save(); g.lineWidth = 4; g.strokeStyle = INK; T.rr(g, 512, 94, 96, 12, 6); g.fillStyle = '#5a3414'; g.fill(); g.stroke();
    [[540, 96], [580, 94]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 16, 0, TAU); g.fillStyle = '#b8c0cc'; g.fill(); g.stroke(); g.beginPath(); g.arc(e[0], e[1], 11, 0, TAU); g.fillStyle = T.lin(g, e[0] - 10, e[1] - 10, e[0] + 10, e[1] + 10, [0, '#d8f4ff', 1, '#3a8ad8']); g.fill(); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(e[0] - 4, e[1] - 4, 4, 2.5, -0.6, 0, TAU); g.fill(); }); g.restore();
    // face
    [[536, 140, 14, 17], [568, 138, 15, 18]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 3, e[1] + 2, 8, 0, TAU); g.fillStyle = '#5a3010'; g.fill(); g.beginPath(); g.arc(e[0] + 3, e[1] + 2, 4, 0, TAU); g.fillStyle = '#100800'; g.fill(); g.beginPath(); g.arc(e[0], e[1] - 2, 3, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.beginPath(); g.ellipse(592, 156, 7, 5, 0, 0, TAU); g.fillStyle = '#ff7a9a'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
    function mouth() { g.beginPath(); g.moveTo(538, 168); g.quadraticCurveTo(572, 178, 606, 164); g.quadraticCurveTo(600, 204, 570, 206); g.quadraticCurveTo(542, 204, 538, 168); g.closePath(); }
    mouth(); g.fillStyle = '#6a0a14'; g.fill(); g.save(); mouth(); g.clip(); g.fillStyle = '#ff6a7a'; g.beginPath(); g.ellipse(572, 206, 20, 12, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; T.rr(g, 562, 166, 12, 14, 3); g.fill(); T.rr(g, 576, 166, 12, 13, 3); g.fill(); g.restore(); mouth(); g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
  }
  function cheese(g, T, str, cx, base, size, o) {   // cheese holes kept inside the letter faces
    var c = document.createElement('canvas'); c.width = g.canvas.width; c.height = g.canvas.height; var m = c.getContext('2d'); m.setTransform(g.getTransform());
    T.word(m, str, cx, base, size, { spacing: o.spacing, wave: o.wave, rot: o.rot, dark: 'rgba(0,0,0,0)', outline: 0.01, depth: 0, face: function () { return [0, '#fff', 1, '#fff']; } });
    var d = document.createElement('canvas'); d.width = c.width; d.height = c.height; var h = d.getContext('2d'); h.setTransform(g.getTransform()); var r = T.rng(31);
    for (var i = 0; i < str.length * 5; i++) { var x = cx - size * 1.8 + r() * size * 3.6, y = base - size * 0.65 + r() * size * 0.6, rr = size * (0.035 + r() * 0.05); h.beginPath(); h.ellipse(x, y, rr, rr * 0.8, 0, 0, TAU); h.fillStyle = 'rgba(200,120,0,.55)'; h.fill(); h.beginPath(); h.ellipse(x - rr * 0.25, y - rr * 0.25, rr * 0.6, rr * 0.45, 0, 0, TAU); h.fillStyle = 'rgba(255,250,200,.6)'; h.fill(); }
    h.setTransform(1, 0, 0, 1, 0, 0); h.globalCompositeOperation = 'destination-in'; h.drawImage(c, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(d, 0, 0); g.restore();
  }
  function words(g, T, cx, y1, s1, y2, s2) {
    var A = { spacing: s1 * 0.01, dark: '#4a2004', outline: s1 * 0.15, depth: s1 * 0.09, fat: s1 * 0.006, ring: '#fff6d0', rot: -0.03, edge: function () { return '#b8700a'; }, edgeW: s1 * 0.06, wave: function (j) { return [4, 0, -2, 0, 4][j] * s1 / 110; },
      face: function () { return [0, '#fff6a0', 0.5, '#ffd21a', 1, '#f0960a']; } };
    var B = { spacing: s2 * 0.01, dark: '#0a2a04', outline: s2 * 0.15, depth: s2 * 0.09, fat: s2 * 0.006, ring: '#f0ffd0', rot: -0.02, edge: function () { return '#1a6a10'; }, edgeW: s2 * 0.06, wave: function (j) { return [0, 2, 4, 4, 2, 0][j] * s2 / 110; },
      face: function (j) { return j < 2 ? [0, '#fff6a0', 0.5, '#ffd21a', 1, '#f0960a'] : [0, '#d8ff8a', 0.5, '#6ad83a', 1, '#2a9a1a']; } };
    T.word(g, 'HOPPER', cx + 10, y2, s2, B); T.gloss(g, 'HOPPER', cx + 10, y2, s2, B, 0.45);
    T.word(g, 'DODGY', cx - 4, y1, s1, A); cheese(g, T, 'DODGY', cx - 4, y1, s1, A); T.gloss(g, 'DODGY', cx - 4, y1, s1, A, 0.45);
  }
  function frame(g, T, glow) { T.rr(g, PX, PY, PW, PH, 76); g.lineWidth = 16; g.strokeStyle = T.lin(g, PX, PY, PX + PW, PY + PH, [0, '#ffe04a', 0.35, '#a8e83a', 0.65, '#3ad88a', 1, '#3ab8ff']); if (glow) { g.save(); g.shadowColor = 'rgba(120,255,160,.7)'; g.shadowBlur = 24; g.stroke(); g.restore(); } g.stroke();
    T.rr(g, PX - 8, PY - 8, PW + 16, PH + 16, 84); g.lineWidth = 3; g.strokeStyle = 'rgba(40,60,20,.7)'; g.stroke(); T.rr(g, PX + 8, PY + 8, PW - 16, PH - 16, 68); g.strokeStyle = 'rgba(255,255,255,.6)'; g.stroke(); }
  function icon(g, T, L, full, chars) {
    g.save(); T.rr(g, PX, PY, PW, PH, 76); g.clip(); world(g, T, L, full); meteor(g, T, 356, 122); rock(g, T, 306, 206, 24); rock(g, T, 342, 234, 12); rock(g, T, 330, 272, 18);
    arrow(g, T, [372, 214, 400, 190, 428, 170], '#ffb03a', 10); arrow(g, T, [400, 230, 430, 200, 452, 166], '#ffd23a', 10); arrow(g, T, [600, 290, 700, 260, 742, 172], '#3ac85a', 14);
    [[686, 74, 26], [636, 76, 17], [690, 160, 13]].forEach(function (s) { g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], s[2], s[2] * 0.48); g.fill(); g.lineWidth = 3; g.strokeStyle = '#a86a04'; g.stroke(); });
    [[742, 246], [730, 296], [700, 342], [398, 270], [376, 296]].forEach(function (c) { coin(g, T, c[0], c[1], 15); });
    g.save(); g.translate(-12, 18); car(g, T); g.restore(); if (chars !== false) hopper(g, T);
    var r = T.rng(26); for (var i = 0; i < (full ? 14 : 6); i++) T.spark(g, PX + 20 + r() * (PW - 40), PY + 20 + r() * (PH - 40), 4 + r() * 6, '#fff', 0.85);
    g.restore(); frame(g, T, full);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, '#5a9a4a', 0.5, '#3a7a3a', 1, '#2a5a2a']); g.fillRect(0, 0, 1024, 572); icon(g, T, L, true); words(g, T, 556, 392, 100, 478, 100); return; }
    if (kind === 'main') { g.translate(-226, -10); icon(g, T, L, px >= 220); words(g, T, 556, 392, 100, 478, 100); return; }
    if (kind === 'wide') { g.save(); g.translate(14, 6); g.scale(0.356, 0.356); g.translate(-PX, -PY); icon(g, T, L, false); g.restore(); words(g, T, 520, 92, 80, 182, 80); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.7, 0.7); g.translate(-514, -286); icon(g, T, L, false); if (px >= 90) words(g, T, 556, 392, 100, 478, 100); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO hopper END
