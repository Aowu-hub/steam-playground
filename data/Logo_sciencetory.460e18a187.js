// 🏷️ LOGO sciencetory START — 🔬 Sciencetory, drawn in code from Aowu's picture (gl-12)
GameLogos.add('sciencetory', (function () {
  var BOX = { scene: [1024, 572], main: [780, 520], wide: [860, 200], badge: [400, 400] };
  var LOOK = { classic: { sky: ['#141a4a', '#0a0e30', '#05071c'], plate: ['#141a52', '#0c1038'], rim: ['#c05af0', '#6a8af5', '#3fe0f0'], dark: '#140a4a',
    letters: [['#fff36a', '#ffb81a', '#ff7a14'], ['#ffd23a', '#ff9a1c', '#ff6a2a'], ['#ffb02a', '#ff7a3a', '#ff4a6a'], ['#ff8a4a', '#ff5a7a', '#f03aa8'], ['#ff6a8a', '#f04ac0', '#c83ae0'], ['#f05ad0', '#b04af0', '#7a5af5'], ['#b06af5', '#6a7af5', '#3f9af5'], ['#6a9af5', '#3fb4f5', '#2fd0f0'], ['#4fc0f5', '#2fd8f0', '#3fe8d8'], ['#3fd8f5', '#3fe8d0', '#6af0b0'], ['#5ae8f0', '#6af0c0', '#a8f58a']] } };
  var TAU = Math.PI * 2;
  function flask(g, T, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.12); g.lineJoin = 'round'; g.lineCap = 'round';
    function body() { g.beginPath(); g.moveTo(-14, -70); g.lineTo(-14, -22); g.quadraticCurveTo(-56, 16, -48, 50); g.quadraticCurveTo(-42, 70, 0, 70); g.quadraticCurveTo(42, 70, 48, 50); g.quadraticCurveTo(56, 16, 14, -22); g.lineTo(14, -70); g.closePath(); }
    g.save(); g.shadowColor = '#7dffb0'; g.shadowBlur = 26; body(); g.fillStyle = 'rgba(190,240,255,.35)'; g.fill(); g.restore();
    g.save(); body(); g.clip(); g.fillStyle = T.lin(g, -50, 0, 50, 70, [0, '#ffe14a', 0.3, '#7dff7a', 0.6, '#3fe0d8', 1, '#b06af5']); g.fillRect(-60, 8, 120, 70); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(0, 8, 44, 7, 0, 0, TAU); g.fill(); [[-18, 34, 8], [14, 46, 6], [24, 26, 5], [-6, 54, 5]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fillStyle = 'rgba(255,255,255,.55)'; g.fill(); }); g.restore();
    body(); g.lineWidth = 6; g.strokeStyle = '#bfeaff'; g.stroke(); g.lineWidth = 2.5; g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(-34, 18); g.quadraticCurveTo(-40, 42, -24, 58); g.stroke();
    T.rr(g, -20, -80, 40, 12, 6); g.fillStyle = '#dff6ff'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#8fc8f0'; g.stroke();
    [[-6, -104, 11, '#ff8ad8'], [18, -124, 8, '#ffb02e'], [-22, -134, 6, '#7dff7a'], [8, -150, 9, '#ff6a4a']].forEach(function (b) { g.save(); g.shadowColor = b[3]; g.shadowBlur = 12; g.beginPath(); g.arc(b[0], b[1], b[2], 0, TAU); g.fillStyle = b[3]; g.fill(); g.restore(); });
    g.restore();
  }
  function atom(g, T, x, y, R) { g.save(); g.translate(x, y); g.lineCap = 'round'; [0.5, -0.55, 1.57].forEach(function (a, i) { g.save(); g.rotate(a); var c = ['#ff8ad8', '#5ff0ff', '#ffb02e'][i]; g.shadowColor = c; g.shadowBlur = 14; g.beginPath(); g.ellipse(0, 0, R, R * 0.36, 0, 0, TAU); g.lineWidth = 4.5; g.strokeStyle = c; g.stroke(); g.beginPath(); g.arc(R, 0, 6, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); }); g.shadowColor = '#ffb02e'; g.shadowBlur = 22; g.beginPath(); g.arc(0, 0, R * 0.2, 0, TAU); g.fillStyle = T.rad(g, -3, -3, 1, R * 0.22, [0, '#fff6c0', 1, '#ff8a2a']); g.fill(); g.restore(); }
  function dna(g, T, x, y, len, rot, k) { g.save(); g.translate(x, y); g.rotate(rot); g.lineCap = 'round'; var n = 26; for (var pass = 0; pass < 2; pass++) { g.beginPath(); for (var i = 0; i <= n; i++) { var t = i / n, yy = (t - 0.5) * len, xx = Math.sin(t * Math.PI * 3 + pass * Math.PI) * 16 * k; g[i ? 'lineTo' : 'moveTo'](xx, yy); } var c = pass ? '#5ff0ff' : '#ff8ad8'; g.shadowColor = c; g.shadowBlur = 12; g.lineWidth = 5 * k; g.strokeStyle = c; g.stroke(); }
    g.shadowBlur = 0; for (i = 1; i < n; i += 2) { var t2 = i / n, y2 = (t2 - 0.5) * len, x2 = Math.sin(t2 * Math.PI * 3) * 16 * k; g.beginPath(); g.moveTo(-x2, y2); g.lineTo(x2, y2); g.lineWidth = 2.5 * k; g.strokeStyle = ['#ffe14a', '#7dff7a', '#b08aff'][i % 3]; g.stroke(); } g.restore(); }
  function robot(g, T, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; var INK = '#2a3a8a', W = ['#ffffff', '#dceaff', '#a8c0f0'];
    g.save(); g.shadowColor = 'rgba(140,220,255,.9)'; g.shadowBlur = 26; T.rr(g, -50, -44, 100, 78, 34); g.fillStyle = W[1]; g.fill(); g.restore();
    g.beginPath(); g.moveTo(-34, 44); g.quadraticCurveTo(-66, 30, -70, -4); g.lineWidth = 18; g.strokeStyle = INK; g.stroke(); g.lineWidth = 11; g.strokeStyle = W[1]; g.stroke(); g.beginPath(); g.arc(-72, -14, 13, 0, TAU); g.fillStyle = W[0]; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    [-0.5, 0, 0.5].forEach(function (a) { g.beginPath(); g.moveTo(-72 + Math.sin(a) * 9, -14 - Math.cos(a) * 9); g.lineTo(-72 + Math.sin(a) * 24, -14 - Math.cos(a) * 24); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.lineWidth = 5; g.strokeStyle = W[0]; g.stroke(); });
    g.beginPath(); g.moveTo(-30, 36); g.quadraticCurveTo(0, 28, 30, 36); g.quadraticCurveTo(40, 76, 26, 100); g.quadraticCurveTo(0, 108, -26, 100); g.quadraticCurveTo(-40, 76, -30, 36); g.closePath(); g.fillStyle = T.lin(g, -36, 0, 36, 0, [0, W[0], 0.6, W[1], 1, W[2]]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.arc(0, 64, 10, 0, TAU); g.fillStyle = '#5ff0ff'; g.shadowColor = '#5ff0ff'; g.shadowBlur = 12; g.fill(); g.shadowBlur = 0;
    g.beginPath(); g.moveTo(0, -44); g.lineTo(0, -62); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(0, -66, 7, 0, TAU); g.fillStyle = '#ffb02e'; g.shadowColor = '#ffd23e'; g.shadowBlur = 12; g.fill(); g.shadowBlur = 0;
    [-1, 1].forEach(function (k) { T.rr(g, k * 54 - 8, -18, 16, 30, 7); g.fillStyle = '#6a8af5'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); });
    T.rr(g, -50, -44, 100, 78, 34); g.fillStyle = T.lin(g, -50, -44, 50, 34, [0, W[0], 0.6, W[1], 1, W[2]]); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    T.rr(g, -38, -30, 76, 50, 22); g.fillStyle = '#10163c'; g.fill(); g.strokeStyle = '#5ff0ff'; g.shadowColor = '#5ff0ff'; g.shadowBlur = 10; g.lineWidth = 6; g.beginPath(); g.arc(-17, -6, 8, 0, TAU); g.stroke(); g.beginPath(); g.arc(17, -6, 8, 0, TAU); g.stroke(); g.lineWidth = 4.5; g.beginPath(); g.arc(0, 4, 10, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = 'rgba(255,120,170,.6)'; g.beginPath(); g.ellipse(-28, 8, 5, 3.5, 0, 0, TAU); g.ellipse(28, 8, 5, 3.5, 0, 0, TAU); g.fill();
    g.restore();
  }
  function scope(g, T, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = '#5a4a9a'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 18); g.lineTo(-22, 74); g.moveTo(0, 18); g.lineTo(22, 74); g.moveTo(0, 18); g.lineTo(0, 76); g.stroke();
    g.rotate(-0.5); T.rr(g, -50, -16, 84, 32, 8); g.fillStyle = T.lin(g, 0, -16, 0, 16, [0, '#d8c8ff', 0.5, '#a88af5', 1, '#6a4ad0']); g.fill(); g.lineWidth = 5; g.strokeStyle = '#2a1a6a'; g.stroke(); T.rr(g, 30, -22, 30, 44, 8); g.fillStyle = '#b89af8'; g.fill(); g.stroke(); T.rr(g, -66, -10, 20, 20, 5); g.fillStyle = '#8a6ae8'; g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(-44, -11, 70, 5); g.restore(); }
  function plate(g, T, L, x, y, w, h) {
    g.save(); g.shadowColor = L.rim[0]; g.shadowBlur = 36; T.rr(g, x, y, w, h, 66); g.fillStyle = T.lin(g, x, y, x + w, y + h, [0, L.plate[0], 1, L.plate[1]]); g.fill(); g.shadowColor = L.rim[2]; g.shadowBlur = 20; g.fill(); g.shadowBlur = 0;
    g.save(); T.rr(g, x, y, w, h, 66); g.clip(); g.globalAlpha = 0.5; g.strokeStyle = '#7a5af0'; g.lineWidth = 26; g.beginPath(); g.ellipse(x + w * 0.5, y + h * 0.56, w * 0.6, h * 0.22, -0.3, 0, TAU); g.stroke(); g.strokeStyle = '#3fd0f0'; g.lineWidth = 12; g.beginPath(); g.ellipse(x + w * 0.5, y + h * 0.6, w * 0.5, h * 0.14, -0.3, 0, TAU); g.stroke(); g.globalAlpha = 1;
    var r = T.rng(4); for (var i = 0; i < 70; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillStyle = ['#fff', '#ffe14a', '#ff8ad8', '#5ff0ff'][i % 4]; g.beginPath(); g.arc(x + r() * w, y + r() * h, 0.8 + r() * 2, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore();
    g.shadowColor = L.rim[1]; g.shadowBlur = 18; T.rr(g, x, y, w, h, 66); g.lineWidth = 8; g.strokeStyle = T.lin(g, x, y, x + w, y + h, [0, L.rim[0], 0.5, L.rim[1], 1, L.rim[2]]); g.stroke(); g.shadowBlur = 0; T.rr(g, x, y, w, h, 66); g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,255,255,.9)'; g.stroke(); g.restore();
  }
  function word(g, T, L, cx, base, size) {   // every letter its own step of the rainbow
    var o = { spacing: size * 0.004, dark: L.dark, outline: size * 0.2, depth: size * 0.08, fat: size * 0.02, glow: 'rgba(190,120,255,1)', glowN: 3, glowBlur: 0.4, wave: function (j) { return [0, -3, 2, -2, 2, -3, 1, -2, 3, -2, 2][j] * size / 110; }, face: function (j) { var c = L.letters[j]; return [0, c[0], 0.5, c[1], 1, c[2]]; }, inner: 'rgba(255,255,255,.6)' };
    var W = T.word(g, 'Sciencetory', cx, base, size, o); T.gloss(g, 'Sciencetory', cx, base, size, o, 0.5); return W;
  }
  function emblem(g, T, L) {
    plate(g, T, L, 296, 74, 434, 438);
    dna(g, T, 322, 232, 120, 0.5, 1); dna(g, T, 396, 426, 130, 1.1, 1.1);
    atom(g, T, 498, 150, 56); scope(g, T, 694, 176, 0.9); flask(g, T, 372, 184, 0.86); robot(g, T, 606, 176, 0.86);
    T.star(g, 664, 400, 16, 8); g.fillStyle = '#ffd23e'; g.fill(); T.star(g, 590, 424, 11, 5.5); g.fillStyle = '#5ff0ff'; g.fill();
    [[430, 106, 9], [700, 128, 11], [330, 330, 7], [704, 330, 8], [560, 470, 9], [470, 390, 7]].forEach(function (s, i) { T.spark(g, s[0], s[1], s[2], i % 2 ? '#ffe14a' : '#fff', 0.95); });
    word(g, T, L, 512, 330, 122);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); var r = T.rng(2); for (var i = 0; i < 130; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillStyle = ['#fff', '#ffe14a', '#ff8ad8', '#8fd0ff'][i % 4]; g.beginPath(); g.arc(r() * 1024, r() * 572, 0.6 + r() * 1.8, 0, TAU); g.fill(); } g.globalAlpha = 1; emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-122, -32); emblem(g, T, L); return; }
    if (kind === 'wide') { flask(g, T, 70, 126, 0.56); word(g, T, L, 480, 138, 112); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.84, 0.84); g.translate(-513, -293); plate(g, T, L, 296, 74, 434, 438); if (px >= 90) { atom(g, T, 498, 162, 56); flask(g, T, 372, 196, 0.86); robot(g, T, 606, 192, 0.86); dna(g, T, 396, 426, 130, 1.1, 1.1); word(g, T, L, 513, 330, 70); } else { atom(g, T, 513, 293, 150); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO sciencetory END
