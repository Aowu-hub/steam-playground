// 🏷️ LOGO chess START — ♟️ Chess, drawn in code from Aowu's picture (gl-21, round 7). A smiling KING piece in a red velvet robe with white fur and a gold
// crown, the BISHOP man in his mitre, the KNIGHT horse in armour (all one-piece, depth from colour), a glowing board floor, shooting stars, confetti,
// fat gold "CHESS". Looks = the game's 3 designs (Chess.html DESIGNS: classic wood · fantasy pearl / emerald · futuristic neon) → piece colour, floor, sky.
GameLogos.add('chess', (function () {
  var BOX = { scene: [1024, 572], main: [500, 520], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { sky: ['#4a7ae8', '#3a2aa8', '#1a0a5a'], floor: ['#5a2ab8', '#2a0a6a'], grid: '#5ad8ff', piece: ['#fffaf0', '#f2e2c4', '#cfb48a'], rim: ['#ffe08a', '#c8901a'], dark: '#3a1a08',
    word: ['#fff2a0', '#ffc21a', '#e8800a'] }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    fantasy: mk({ sky: ['#ff9ad8', '#8a3ab8', '#3a0a5a'], floor: ['#1F8A70', '#0a3a2a'], grid: '#ffb8e8', piece: ['#fff0f8', '#FF9ECB', '#d8508a'] }),
    futuristic: mk({ sky: ['#18E7FF', '#2a1a8a', '#05051f'], floor: ['#2a0a4a', '#05051f'], grid: '#FF4FD8', piece: ['#e8ffff', '#7af4ff', '#18a8c8'], rim: ['#9af8ff', '#18a8c8'] }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* ---------- the world: starry sky, glowing board floor, shooting stars, confetti ---------- */
  function world(g, T, L, x, y, w, h, full) {
    g.fillStyle = T.rad(g, x + w / 2, y + h * 0.42, 20, w * 0.75, [0, L.sky[0], 0.5, L.sky[1], 1, L.sky[2]]); g.fillRect(x, y, w, h);
    var fy = y + h * 0.66; g.fillStyle = T.lin(g, 0, fy, 0, y + h, [0, L.floor[0], 1, L.floor[1]]); g.fillRect(x, fy, w, y + h - fy);
    g.save(); g.strokeStyle = L.grid; g.lineWidth = 2.5; g.shadowColor = L.grid; g.shadowBlur = 10; g.globalAlpha = 0.85;
    for (var i = 0; i < 5; i++) { var yy = fy + Math.pow(i / 4, 1.5) * (y + h - fy); g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
    for (var k = -6; k <= 6; k++) { g.beginPath(); g.moveTo(x + w / 2 + k * 50, fy); g.lineTo(x + w / 2 + k * 150, y + h); g.stroke(); } g.restore();
    var r = T.rng(7); if (full) { g.save(); g.lineCap = 'round'; [[352, 150, 382, 92], [612, 124, 628, 64], [672, 128, 690, 76], [430, 132, 440, 80]].forEach(function (l, i) { g.strokeStyle = T.lin(g, l[0], l[1], l[2], l[3], [0, 'rgba(255,200,80,0)', 1, 'rgba(255,220,120,.9)']); g.lineWidth = 5; g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); g.fillStyle = '#ffd23a'; T.star(g, l[2], l[3], i % 2 ? 13 : 17, i % 2 ? 6 : 8); g.fill(); }); g.restore(); }
    for (var q = 0; q < 40; q++) { g.save(); g.translate(x + r() * w, y + r() * h * 0.6); g.rotate(r() * TAU); g.fillStyle = ['#ff5aa8', '#ffd23a', '#5ad8ff', '#7ae84a', '#ff8a3a'][q % 5]; g.globalAlpha = 0.85; GameLogos.tools.rr(g, -5, -2, 10, 4, 2); g.fill(); g.restore(); }
    for (var s = 0; s < 18; s++) T.spark(g, x + r() * w, y + r() * h * 0.62, 3 + r() * 6, '#fff', 0.7);
  }
  /* ---------- the king piece ---------- */
  function king(g, T, L) {
    var INK = '#3a1a10', RED = ['#ff5a6a', '#c8142a', '#7a0a1a'], FUR = ['#ffffff', '#ece6f2', '#c8c0d8'];
    function crownPath(h) { h.beginPath(); h.moveTo(458, 134); h.lineTo(452, 70); h.lineTo(480, 98); h.lineTo(496, 52); h.lineTo(512, 92); h.lineTo(530, 48); h.lineTo(544, 94); h.lineTo(572, 62); h.lineTo(568, 134); h.quadraticCurveTo(512, 148, 458, 134); h.closePath(); h.fill(); [[452, 66], [496, 48], [530, 44], [572, 58]].forEach(function (b) { h.beginPath(); h.arc(b[0], b[1], 7, 0, TAU); h.fill(); }); }
    var P = {
      robe: function (h) { h.beginPath(); h.moveTo(444, 230); h.quadraticCurveTo(512, 210, 584, 230); h.bezierCurveTo(612, 290, 628, 340, 640, 384); h.quadraticCurveTo(512, 404, 386, 384); h.bezierCurveTo(398, 340, 414, 290, 444, 230); h.closePath(); h.fill(); },
      body: function (h) { h.beginPath(); h.moveTo(486, 236); h.lineTo(540, 236); h.bezierCurveTo(536, 290, 546, 320, 572, 350); h.quadraticCurveTo(584, 372, 578, 392); h.lineTo(446, 392); h.quadraticCurveTo(440, 372, 452, 350); h.bezierCurveTo(478, 320, 490, 290, 486, 236); h.closePath(); h.fill(); },
      fur: function (h) { T.taper(h, [452, 234, 458, 300, 438, 384], function (t) { return 22 - t * 4; }); T.taper(h, [574, 234, 568, 300, 588, 384], function (t) { return 22 - t * 4; }); T.taper(h, [440, 234, 512, 214, 586, 234], function () { return 26; }); },
      head: function (h) { h.beginPath(); h.moveTo(468, 128); h.lineTo(558, 128); h.quadraticCurveTo(566, 128, 566, 140); h.lineTo(556, 222); h.quadraticCurveTo(512, 232, 470, 222); h.lineTo(460, 140); h.quadraticCurveTo(460, 128, 468, 128); h.closePath(); h.fill(); },
      crown: crownPath
    };
    g.fillStyle = 'rgba(20,10,40,.35)'; g.beginPath(); g.ellipse(512, 396, 120, 14, 0, 0, TAU); g.fill();
    T.onePiece(g, T, { x0: 360, y0: 30, W: 300, H: 380, rim: INK, rimW: 4.2, parts: P, order: ['robe', 'body', 'fur', 'head', 'crown'],
      colour: function (B, put, inside) {
        put(B, 'robe', T.lg(B, 386, 0, 640, 0, [0, RED[2], 0.25, RED[1], 0.5, RED[0], 0.75, RED[1], 1, RED[2]]));
        inside(B, 'robe', function (h) { h.strokeStyle = 'rgba(80,0,10,.45)'; h.lineWidth = 6; [[430, 260, 410, 380], [600, 260, 618, 380], [450, 300, 438, 384], [580, 300, 590, 384]].forEach(function (l) { h.beginPath(); h.moveTo(l[0], l[1]); h.lineTo(l[2], l[3]); h.stroke(); }); h.fillStyle = 'rgba(255,200,210,.25)'; h.fillRect(500, 220, 24, 170); });
        put(B, 'body', SHD(B), 0, 0);
        put(B, 'body', T.lg(B, 446, 0, 578, 0, [0, L.piece[2], 0.35, L.piece[0], 0.65, L.piece[1], 1, L.piece[2]]));
        inside(B, 'body', function (h) { h.fillStyle = T.rg(h, 512, 236, 4, 40, [0, 'rgba(80,40,0,.4)', 1, 'rgba(80,40,0,0)']); h.fillRect(470, 230, 90, 40); h.fillStyle = 'rgba(80,40,0,.25)'; h.fillRect(446, 366, 132, 8); });
        put(B, 'fur', T.lg(B, 0, 210, 0, 390, [0, FUR[0], 1, FUR[1]]));
        inside(B, 'fur', function (h) { h.fillStyle = '#2a2030'; var r = T.rng(3); for (var i = 0; i < 26; i++) { var t = r(), side = i % 3; var x = side === 0 ? 446 + (432 - 446) * t : side === 1 ? 580 + (594 - 580) * t : 446 + 140 * t, y = side === 2 ? 220 + Math.sin(t * Math.PI) * -10 : 240 + 140 * t; h.beginPath(); h.ellipse(x + (r() - 0.5) * 12, y + (r() - 0.5) * 8, 2.2, 4, 0, 0, TAU); h.fill(); } h.fillStyle = 'rgba(160,150,190,.35)'; h.fillRect(400, 300, 230, 90); });
        put(B, 'head', T.lg(B, 460, 0, 566, 0, [0, L.piece[1], 0.4, L.piece[0], 1, L.piece[2]]));
        inside(B, 'head', function (h) { h.fillStyle = 'rgba(255,255,255,.55)'; h.beginPath(); h.ellipse(482, 160, 8, 28, 0, 0, TAU); h.fill(); h.fillStyle = 'rgba(80,40,0,.3)'; h.beginPath(); h.ellipse(512, 130, 60, 12, 0, 0, TAU); h.fill(); });
        put(B, 'crown', T.lg(B, 0, 44, 0, 146, [0, '#fff2a0', 0.4, '#ffc21a', 1, '#c8800a']));
        inside(B, 'crown', function (h) { h.fillStyle = '#e8322a'; h.beginPath(); h.arc(512, 118, 7, 0, TAU); h.fill(); h.fillStyle = '#2a8af0'; h.beginPath(); h.arc(486, 120, 5, 0, TAU); h.arc(538, 120, 5, 0, TAU); h.fill(); h.fillStyle = 'rgba(255,255,255,.7)'; h.fillRect(462, 124, 100, 3); });
      } });
    function SHD(h) { return 'rgba(0,0,0,0)'; }
    // gold collar beads + face
    g.save(); g.fillStyle = '#ffc21a'; g.strokeStyle = '#8a5a04'; g.lineWidth = 1.5; for (var i = 0; i < 9; i++) { var t = i / 8, x = 482 + t * 60, y = 238 + Math.sin(t * Math.PI) * 10; g.beginPath(); g.arc(x, y, 4.5, 0, TAU); g.fill(); g.stroke(); } [[484, 238], [540, 238]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], 8, 0, TAU); g.fill(); g.stroke(); }); g.restore();
    [[490, 168], [534, 168]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 11, 14, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 1, e[1] + 2, 6.5, 0, TAU); g.fillStyle = '#4a2a10'; g.fill(); g.beginPath(); g.arc(e[0] - 1, e[1] - 1, 2.4, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.strokeStyle = INK; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(478, 146); g.quadraticCurveTo(490, 140, 500, 146); g.moveTo(524, 146); g.quadraticCurveTo(534, 140, 546, 146); g.stroke();
    function mouth() { g.beginPath(); g.moveTo(494, 192); g.quadraticCurveTo(512, 198, 530, 192); g.quadraticCurveTo(526, 212, 512, 212); g.quadraticCurveTo(498, 212, 494, 192); g.closePath(); }
    mouth(); g.fillStyle = '#7a1a1a'; g.fill(); g.save(); mouth(); g.clip(); g.fillStyle = '#ff7a8a'; g.beginPath(); g.ellipse(512, 212, 10, 6, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(498, 190, 28, 5); g.restore(); mouth(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    g.fillStyle = 'rgba(255,120,120,.35)'; g.beginPath(); g.ellipse(476, 194, 8, 5, 0, 0, TAU); g.ellipse(548, 194, 8, 5, 0, 0, TAU); g.fill();
  }
  /* ---------- the bishop man ---------- */
  function bishop(g, T, L) {
    var INK = '#3a1a10', SK = ['#ffd2a8', '#f0b07a', '#c8804a'];
    var P = {
      arm: function (h) { T.limb(h, [324, 300, 300, 296, 288, 280], 18, 15); h.beginPath(); h.ellipse(284, 274, 12, 10, -0.4, 0, TAU); h.fill(); [[-10, -10], [-4, -14], [4, -14], [10, -10]].forEach(function (f) { T.limb(h, [284, 272, 284 + f[0] * 0.5, 272 + f[1] * 0.5, 284 + f[0], 272 + f[1]], 5, 4); }); },
      robe: function (h) { h.beginPath(); h.moveTo(326, 288); h.quadraticCurveTo(356, 278, 388, 288); h.bezierCurveTo(400, 320, 408, 350, 414, 380); h.quadraticCurveTo(356, 392, 300, 380); h.bezierCurveTo(306, 350, 314, 320, 326, 288); h.closePath(); h.fill(); },
      head: function (h) { h.beginPath(); h.ellipse(356, 262, 26, 28, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(331, 264, 6, 9, 0, 0, TAU); h.ellipse(381, 264, 6, 9, 0, 0, TAU); h.fill(); },
      mitre: function (h) { h.beginPath(); h.moveTo(330, 246); h.bezierCurveTo(326, 210, 340, 182, 356, 168); h.bezierCurveTo(372, 182, 386, 210, 382, 246); h.closePath(); h.fill(); h.beginPath(); h.arc(356, 166, 6, 0, TAU); h.fill(); }
    };
    T.onePiece(g, T, { x0: 260, y0: 150, W: 170, H: 250, rim: INK, rimW: 3.6, parts: P, order: ['robe', 'arm', 'head', 'mitre'],
      colour: function (B, put, inside) {
        put(B, 'robe', T.lg(B, 300, 0, 414, 0, [0, '#9a1a2a', 0.3, '#e0304a', 0.7, '#e0304a', 1, '#8a1020']));
        inside(B, 'robe', function (h) { h.fillStyle = T.lg(h, 0, 290, 0, 390, [0, '#2ac8b8', 1, '#1a8a8a']); h.beginPath(); h.moveTo(346, 290); h.lineTo(366, 290); h.lineTo(376, 390); h.lineTo(336, 390); h.closePath(); h.fill(); h.strokeStyle = '#ffc21a'; h.lineWidth = 5; h.beginPath(); h.moveTo(344, 290); h.lineTo(334, 390); h.moveTo(368, 290); h.lineTo(378, 390); h.moveTo(326, 292); h.quadraticCurveTo(356, 300, 388, 292); h.stroke(); h.fillStyle = '#2a8a4a'; h.beginPath(); h.arc(356, 300, 6, 0, TAU); h.fill(); });
        put(B, 'arm', T.lg(B, 324, 0, 284, 0, [0, '#c8202a', 0.7, '#e0304a', 0.71, SK[1], 1, SK[0]]));
        put(B, 'head', T.rg(B, 348, 254, 3, 34, [0, SK[0], 0.6, SK[1], 1, SK[2]]));
        put(B, 'mitre', T.lg(B, 330, 0, 382, 0, [0, '#8a2ac8', 0.5, '#b84af0', 1, '#6a1aa8']));
        inside(B, 'mitre', function (h) { h.fillStyle = '#ffc21a'; h.fillRect(330, 232, 52, 12); h.fillRect(351, 172, 10, 64); h.fillStyle = '#e8322a'; h.beginPath(); h.arc(356, 238, 4, 0, TAU); h.fill(); });
      } });
    g.fillStyle = '#3a1a08'; [[346, 260], [366, 260]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 3.2, 4, 0, 0, TAU); g.fill(); });
    g.fillStyle = '#5a2a10'; g.beginPath(); g.moveTo(342, 274); g.quadraticCurveTo(356, 268, 370, 274); g.quadraticCurveTo(356, 282, 342, 274); g.fill();
    g.strokeStyle = '#3a1a08'; g.lineWidth = 2; g.beginPath(); g.arc(356, 278, 7, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  }
  /* ---------- the knight horse in armour: chibi — big helmeted head, short armoured neck, compact body, front legs up ---------- */
  function knight(g, T, L) {
    var INK = '#2a1a10', BR = ['#d8955a', '#a8622a', '#6a3a14'], ST = ['#f4f8fc', '#c0ccdc', '#7a8aa0'];
    function headPath(h) { h.beginPath(); h.moveTo(650, 222); h.bezierCurveTo(646, 176, 676, 156, 704, 162); h.bezierCurveTo(728, 168, 740, 192, 744, 216); h.bezierCurveTo(748, 236, 740, 252, 724, 254); h.lineTo(694, 254); h.bezierCurveTo(670, 252, 652, 242, 650, 222); h.closePath(); }
    var P = {
      tail: function (h) { T.taper(h, [604, 296, 576, 290, 584, 340], function (t) { return 18 + Math.sin(t * Math.PI) * 10; }); },
      legB: function (h) { T.limb(h, [620, 318, 616, 344, 612, 366], 18, 14); T.limb(h, [644, 326, 644, 350, 640, 372], 18, 14); h.beginPath(); h.ellipse(612, 370, 10, 7, 0, 0, TAU); h.ellipse(640, 376, 10, 7, 0, 0, TAU); h.fill(); },
      body: function (h) { h.beginPath(); h.ellipse(646, 302, 54, 36, -0.12, 0, TAU); h.fill(); },
      legF: function (h) { T.limb(h, [678, 314, 708, 306, 712, 336], 18, 14); T.limb(h, [670, 326, 694, 326, 694, 352], 18, 14); h.beginPath(); h.ellipse(713, 342, 9, 8, 0.3, 0, TAU); h.ellipse(695, 357, 9, 8, 0.3, 0, TAU); h.fill(); },
      neck: function (h) { T.limb(h, [664, 290, 668, 262, 678, 238], 46, 40); },
      ear: function (h) { h.beginPath(); h.moveTo(694, 168); h.lineTo(700, 140); h.lineTo(714, 166); h.closePath(); h.fill(); },
      head: function (h) { headPath(h); h.fill(); },
      plume: function (h) { for (var i = 0; i <= 10; i++) { var t = i / 10, u = 1 - t, x = u * u * 690 + 2 * u * t * 660 + t * t * 626, y = u * u * 160 + 2 * u * t * 118 + t * t * 168, r = 15 - t * 4 + (i % 2) * 3; h.beginPath(); h.arc(x, y, r, 0, TAU); h.fill(); } }
    };
    T.onePiece(g, T, { x0: 560, y0: 100, W: 200, H: 290, rim: INK, rimW: 3.6, parts: P, order: ['tail', 'legB', 'body', 'legF', 'neck', 'plume', 'ear', 'head'],
      colour: function (B, put, inside) {
        put(B, 'tail', T.lg(B, 576, 290, 604, 340, [0, BR[1], 1, BR[2]]));
        put(B, 'legB', BR[2]); inside(B, 'legB', function (h) { h.fillStyle = '#f4ece0'; h.fillRect(600, 354, 52, 12); h.fillStyle = '#2a2030'; h.fillRect(600, 366, 52, 14); });
        put(B, 'body', T.lg(B, 592, 270, 700, 338, [0, BR[0], 1, BR[1]]));
        inside(B, 'body', function (h) {   // blue cloth + gold trim, saddle, silver chest plate
          h.fillStyle = T.lg(h, 0, 296, 0, 340, [0, '#7ac0ff', 1, '#2a6ac8']); h.beginPath(); h.moveTo(594, 300); h.quadraticCurveTo(646, 286, 694, 296); h.lineTo(698, 340); h.lineTo(592, 340); h.closePath(); h.fill();
          h.strokeStyle = '#ffc21a'; h.lineWidth = 5; h.beginPath(); h.moveTo(594, 300); h.quadraticCurveTo(646, 286, 694, 296); h.stroke(); h.fillStyle = '#ffc21a'; h.beginPath(); h.moveTo(648, 304); h.lineTo(658, 316); h.lineTo(648, 328); h.lineTo(638, 316); h.closePath(); h.fill();
          h.fillStyle = T.lg(h, 0, 266, 0, 296, [0, '#a8703a', 1, '#6a3a14']); GameLogos.tools.rr(h, 612, 266, 48, 26, 10); h.fill();
          h.fillStyle = T.lg(h, 670, 270, 700, 320, [0, ST[0], 1, ST[2]]); h.beginPath(); h.ellipse(688, 296, 16, 24, -0.2, 0, TAU); h.fill(); });
        put(B, 'legF', BR[1]); inside(B, 'legF', function (h) { h.fillStyle = '#f4ece0'; h.beginPath(); h.arc(711, 330, 9, 0, TAU); h.arc(694, 346, 9, 0, TAU); h.fill(); h.fillStyle = '#2a2030'; h.beginPath(); h.ellipse(714, 343, 8, 6, 0.3, 0, TAU); h.ellipse(696, 358, 8, 6, 0.3, 0, TAU); h.fill(); });
        put(B, 'neck', T.lg(B, 650, 240, 690, 300, [0, BR[0], 1, BR[1]]));
        inside(B, 'neck', function (h) { for (var i = 0; i < 3; i++) { h.fillStyle = T.lg(h, 0, 246 + i * 14, 0, 262 + i * 14, [0, ST[0], 1, ST[2]]); h.beginPath(); h.ellipse(672, 254 + i * 14, 26, 9, -0.25, 0, TAU); h.fill(); } });
        put(B, 'plume', T.lg(B, 620, 110, 690, 175, [0, '#fffaf0', 0.55, '#f2d8a0', 1, '#c89a50']));
        inside(B, 'plume', function (h) { h.strokeStyle = 'rgba(150,100,40,.5)'; h.lineWidth = 2; for (var i = 0; i < 7; i++) { var t = i / 7, u = 1 - t, x = u * u * 690 + 2 * u * t * 660 + t * t * 626, y = u * u * 160 + 2 * u * t * 118 + t * t * 168; h.beginPath(); h.arc(x, y, 9, 0.4, 2.6); h.stroke(); } });
        put(B, 'ear', BR[1]);
        put(B, 'head', T.lg(B, 650, 200, 748, 254, [0, BR[1], 0.5, BR[0], 1, '#e8a870']));
        inside(B, 'head', function (h) {   // helmet over the top half, visor slits, white blaze, light muzzle
          h.fillStyle = T.lg(h, 650, 160, 740, 220, [0, ST[0], 0.5, ST[1], 1, ST[2]]); h.beginPath(); h.moveTo(640, 232); h.lineTo(640, 150); h.lineTo(750, 150); h.lineTo(750, 196); h.quadraticCurveTo(700, 196, 640, 232); h.closePath(); h.fill();
          h.fillStyle = '#ffc21a'; h.beginPath(); h.moveTo(640, 232); h.quadraticCurveTo(700, 196, 750, 196); h.lineTo(750, 202); h.quadraticCurveTo(700, 202, 640, 238); h.closePath(); h.fill();
          h.fillStyle = '#2a3040'; [0, 1, 2, 3].forEach(function (i) { GameLogos.tools.rr(h, 682 + i * 11, 172 - i * 1.5, 6, 18, 3); h.fill(); });
          h.fillStyle = 'rgba(255,255,255,.65)'; h.beginPath(); h.ellipse(668, 180, 10, 5, -0.6, 0, TAU); h.fill();
          h.fillStyle = '#fff4e8'; h.beginPath(); h.moveTo(722, 204); h.quadraticCurveTo(732, 216, 736, 230); h.lineTo(728, 232); h.quadraticCurveTo(724, 216, 716, 206); h.closePath(); h.fill();
          h.fillStyle = 'rgba(255,220,180,.8)'; h.beginPath(); h.ellipse(734, 238, 14, 12, 0, 0, TAU); h.fill(); });
      } });
    g.beginPath(); g.ellipse(704, 218, 9, 10, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(706, 220, 5, 0, TAU); g.fillStyle = '#2a1a08'; g.fill(); g.beginPath(); g.arc(704, 217, 1.8, 0, TAU); g.fillStyle = '#fff'; g.fill();
    g.strokeStyle = INK; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(712, 246); g.quadraticCurveTo(728, 254, 742, 244); g.stroke(); g.beginPath(); g.ellipse(740, 232, 2.5, 3.5, 0.3, 0, TAU); g.fillStyle = INK; g.fill();
    g.strokeStyle = '#6a3a14'; g.lineWidth = 3; g.beginPath(); g.moveTo(684, 244); g.lineTo(724, 240); g.stroke(); g.beginPath(); g.arc(704, 242, 4, 0, TAU); g.fillStyle = '#ffc21a'; g.fill();
  }
  function words(g, T, L, cx, base, size) {
    var c = L.word, o = { spacing: size * 0.01, dark: L.dark, outline: size * 0.14, depth: size * 0.08, fat: size * 0.006, ring: 'rgba(255,240,200,.95)', edge: function () { return sh(c[2], -0.45); }, edgeW: size * 0.075, face: function () { return [0, c[0], 0.45, c[1], 1, c[2]]; }, wave: function (j) { return [10, 3, 0, 3, 10][j] * size / 130; }, glow: 'rgba(255,200,80,.7)', glowBlur: 0.25 };
    T.word(g, 'CHESS', cx, base, size, o); T.gloss(g, 'CHESS', cx, base, size, o, 0.5);
  }
  var PX = 274, PY = 40, PW = 476, PH = 500;
  function frameRim(g, T, L) { T.rr(g, PX, PY, PW, PH, 64); g.lineWidth = 9; g.strokeStyle = T.lin(g, PX, PY, PX + PW, PY + PH, [0, L.rim[0], 0.5, L.rim[1], 1, L.rim[0]]); g.stroke(); }
  function grow(g, x, y, k, f) { g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y); f(); g.restore(); }
  function inner(g, T, L, full) { g.save(); T.rr(g, PX, PY, PW, PH, 64); g.clip(); world(g, T, L, PX, PY, PW, PH, full);
    g.fillStyle = T.rad(g, 512, 210, 10, 200, [0, 'rgba(200,250,255,.75)', 0.4, 'rgba(120,200,255,.3)', 1, 'rgba(120,200,255,0)']); g.fillRect(PX, PY, PW, PH);
    grow(g, 350, 384, 1.2, function () { bishop(g, T, L); }); grow(g, 640, 384, 1.08, function () { g.translate(-34, 0); knight(g, T, L); }); king(g, T, L); g.restore(); frameRim(g, T, L); words(g, T, L, 512, 494, 132); if (full) { T.spark(g, 322, 418, 22, '#ffe08a', 1); T.spark(g, 712, 404, 26, '#ffe08a', 1); } }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 40, 640, [0, '#3a3aa8', 1, '#14145a']); g.fillRect(0, 0, 1024, 572); inner(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-262, -30); inner(g, T, L, px >= 220); return; }
    if (kind === 'wide') { g.save(); g.translate(16, 6); g.scale(0.375, 0.375); g.translate(-PX, -PY); g.save(); T.rr(g, PX, PY, PW, PH, 64); g.clip(); world(g, T, L, PX, PY, PW, PH, false); king(g, T, L); g.restore(); frameRim(g, T, L); g.restore(); words(g, T, L, 520, 146, 118); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.76, 0.76); g.translate(-512, -290);
      if (px >= 90) inner(g, T, L, false); else { g.save(); T.rr(g, PX, PY, PW, PH, 64); g.clip(); world(g, T, L, PX, PY, PW, PH, false); g.translate(512, 300); g.scale(1.3, 1.3); g.translate(-512, -230); king(g, T, L); g.restore(); frameRim(g, T, L); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO chess END
