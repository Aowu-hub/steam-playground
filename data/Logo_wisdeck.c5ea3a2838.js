// 🏷️ LOGO wisdeck START — 🃏 WisDeck, drawn in code from Aowu's picture (gl-6)
GameLogos.add('wisdeck', (function () {
  var BOX = { scene: [1024, 572], main: [600, 470], wide: [760, 200], badge: [400, 400] };
  var LOOK = { classic: { sky: ['#2a303c', '#1c212b', '#12161d'], a: ['#fff3a0', '#ffc83a', '#ff9a1c', '#f0700a'], b: ['#d8ff8a', '#8ae03a', '#3fb82a', '#1f8a1a'], dark: '#1a2a1a', vine: ['#7ae04a', '#2fa83a', '#1a7a2a'],
    cards: [['#b08af5', '#7a4ae0'], ['#5ad0a8', '#2a9a7a'], ['#ff9a5a', '#f0603a'], ['#ffd85a', '#f0a81a'], ['#5ac8f0', '#2a8ad8'], ['#c08af5', '#8a4ae0'], ['#fffaf0', '#f0e0c0']] } };
  var TAU = Math.PI * 2;
  // the seven card faces: brain · light bulb · brain · star · star · question · sprout (WisDeck's learn / quiz / collect / grow)
  function face(g, T, i, s) {
    g.lineJoin = 'round'; g.lineCap = 'round';
    if (i === 0 || i === 2) { g.fillStyle = i ? '#ff8ab0' : '#ffb0d0'; g.beginPath(); [[-0.16, -0.08, 0.2], [0.14, -0.1, 0.2], [-0.2, 0.1, 0.17], [0.18, 0.1, 0.18], [0, 0.02, 0.2]].forEach(function (c) { g.moveTo(c[0] * s + c[2] * s, c[1] * s); g.arc(c[0] * s, c[1] * s, c[2] * s, 0, TAU); }); g.fill(); g.lineWidth = s * 0.035; g.strokeStyle = '#a03a6a'; g.stroke(); g.beginPath(); g.moveTo(0, -s * 0.26); g.quadraticCurveTo(-s * 0.06, 0, 0, s * 0.24); g.moveTo(-s * 0.2, -s * 0.04); g.quadraticCurveTo(-s * 0.1, s * 0.02, -s * 0.16, s * 0.12); g.moveTo(s * 0.2, -s * 0.04); g.quadraticCurveTo(s * 0.1, s * 0.02, s * 0.16, s * 0.12); g.stroke(); return; }
    if (i === 1) { g.beginPath(); g.arc(0, -s * 0.06, s * 0.22, 0, TAU); g.fillStyle = T.rad(g, -s * 0.06, -s * 0.12, 1, s * 0.26, [0, '#fffbd0', 1, '#ffd23e']); g.shadowColor = '#fff2a0'; g.shadowBlur = s * 0.2; g.fill(); g.shadowBlur = 0; g.lineWidth = s * 0.035; g.strokeStyle = '#8a5a04'; g.stroke(); T.rr(g, -s * 0.1, s * 0.14, s * 0.2, s * 0.14, s * 0.03); g.fillStyle = '#9aa8b8'; g.fill(); g.stroke(); return; }
    if (i === 3 || i === 4) { T.star(g, 0, 0, s * 0.27, s * 0.13); g.fillStyle = i === 3 ? '#fff6c0' : '#ffe14a'; g.fill(); g.lineWidth = s * 0.035; g.strokeStyle = i === 3 ? '#c8860a' : '#1a5a9a'; g.stroke(); return; }
    if (i === 5) { g.font = '700 ' + s * 0.62 + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = s * 0.08; g.strokeStyle = '#3a1a7a'; g.strokeText('?', 0, s * 0.03); g.fillStyle = '#ffe14a'; g.fillText('?', 0, s * 0.03); return; }
    // sprout growing from a little mound
    g.beginPath(); g.ellipse(0, s * 0.26, s * 0.26, s * 0.1, 0, Math.PI, 0); g.fillStyle = '#8a5a2a'; g.fill(); g.beginPath(); g.moveTo(0, s * 0.2); g.quadraticCurveTo(-s * 0.02, 0, 0, -s * 0.12); g.lineWidth = s * 0.05; g.strokeStyle = '#2f9a3a'; g.stroke();
    [[-1, -0.06], [1, -0.16]].forEach(function (q) { g.beginPath(); g.moveTo(0, q[1] * s); g.quadraticCurveTo(q[0] * s * 0.26, q[1] * s - s * 0.18, q[0] * s * 0.3, q[1] * s - s * 0.02); g.quadraticCurveTo(q[0] * s * 0.14, q[1] * s + s * 0.06, 0, q[1] * s); g.fillStyle = '#6ad04a'; g.fill(); g.lineWidth = s * 0.03; g.strokeStyle = '#1f7a2a'; g.stroke(); });
  }
  function fan(g, T, L, cx, cy, k, n) {   // cards fanned round a pivot at (cx, cy)
    var cnt = n || 7, w = 104 * k, h = 152 * k, lift = 56 * k, spread = cnt === 7 ? 1.7 : 1.0;
    for (var i = 0; i < cnt; i++) { var u = cnt === 1 ? 0 : (i / (cnt - 1) - 0.5), a = u * spread - 0.04, c = L.cards[cnt === 7 ? i : [0, 3, 6][i] || 0], fi = cnt === 7 ? i : [1, 3, 6][i];
      g.save(); g.translate(cx, cy); g.rotate(a); g.translate(0, -lift);
      g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 14 * k; g.shadowOffsetX = -4 * k; T.rr(g, -w / 2, -h, w, h, 13 * k); g.fillStyle = '#fffdf6'; g.fill(); g.shadowColor = 'transparent';
      g.lineWidth = 3.5 * k; g.strokeStyle = '#23263a'; g.stroke();
      T.rr(g, -w / 2 + 8 * k, -h + 8 * k, w - 16 * k, h - 16 * k, 8 * k); g.fillStyle = T.lin(g, 0, -h, 0, 0, [0, c[0], 1, c[1]]); g.fill();
      g.fillStyle = 'rgba(255,255,255,.3)'; T.rr(g, -w / 2 + 13 * k, -h + 13 * k, w * 0.36, 9 * k, 4 * k); g.fill();
      g.translate(i === cnt - 1 ? 0 : -w * 0.17, i === cnt - 1 ? -h * 0.56 : -h * 0.66); face(g, T, fi, w * (i === cnt - 1 ? 1.0 : 0.72)); g.restore(); }
  }
  function leaf(g, x, y, s, rot, c) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.5, -s * 0.5, s, 0); g.quadraticCurveTo(s * 0.5, s * 0.5, 0, 0); g.fillStyle = c; g.fill(); g.lineWidth = Math.max(1, s * 0.07); g.strokeStyle = '#1a6a2a'; g.lineJoin = 'round'; g.stroke(); g.beginPath(); g.moveTo(s * 0.1, 0); g.lineTo(s * 0.86, 0); g.lineWidth = Math.max(1, s * 0.05); g.stroke(); g.restore(); }
  function vine(g, T, L, k, ox, oy) {   // the green swoosh that grows into an arrow
    function X(x) { return ox + x * k; } function Y(y) { return oy + y * k; }
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    function path() { g.beginPath(); g.moveTo(X(292), Y(404)); g.bezierCurveTo(X(360), Y(470), X(600), Y(470), X(690), Y(370)); g.bezierCurveTo(X(740), Y(310), X(748), Y(220), X(742), Y(160)); }
    path(); g.lineWidth = 22 * k; g.strokeStyle = L.vine[2]; g.stroke(); path(); g.lineWidth = 14 * k; g.strokeStyle = T.lin(g, X(292), 0, X(748), 0, [0, L.vine[1], 0.6, L.vine[0], 1, '#b8f06a']); g.stroke();
    g.save(); g.translate(X(741), Y(150)); g.rotate(-0.06); g.beginPath(); g.moveTo(0, -34 * k); g.lineTo(28 * k, 6 * k); g.lineTo(8 * k, 2 * k); g.lineTo(-8 * k, 2 * k); g.lineTo(-28 * k, 6 * k); g.closePath(); g.fillStyle = '#b8f06a'; g.fill(); g.lineWidth = 5 * k; g.strokeStyle = L.vine[2]; g.stroke(); g.restore();
    leaf(g, X(330), Y(430), 30 * k, 2.4, L.vine[0]); leaf(g, X(650), Y(408), 28 * k, -0.5, L.vine[0]); leaf(g, X(712), Y(330), 26 * k, 0.2, '#a8e86a'); leaf(g, X(736), Y(240), 24 * k, 3.5, L.vine[0]); leaf(g, X(708), Y(120), 22 * k, -2.4, '#a8e86a'); leaf(g, X(430), Y(462), 22 * k, 0.9, '#a8e86a');
    g.restore();
  }
  function bits(g, T, k, ox, oy) { var r = T.rng(17), cols = ['#ffb02e', '#6ad04a', '#5ac8f0', '#ff6a8a', '#ffd23e']; for (var i = 0; i < 30; i++) { var a = Math.PI * (1 + r()), d = 190 + r() * 90, x = ox + (512 + Math.cos(a) * d * 1.15) * k, y = oy + (250 + Math.sin(a) * d * 0.8) * k; if (i % 3 === 0) { T.star(g, x, y, (5 + r() * 5) * k, (2.5 + r() * 2) * k); g.fillStyle = cols[i % 5]; g.fill(); } else if (i % 3 === 1) T.spark(g, x, y, (5 + r() * 6) * k, cols[i % 5], 0.95); else { g.save(); g.translate(x, y); g.rotate(r() * 6); g.fillStyle = cols[i % 5]; g.fillRect(-6 * k, -2 * k, 12 * k, 4 * k); g.restore(); } } }
  function words(g, T, L, cx, base, size) {
    function o(c) { return { spacing: size * 0.005, dark: L.dark, outline: size * 0.2, depth: size * 0.09, face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.45)' }; }
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var w1 = g.measureText('Wis').width + 2 * size * 0.005, w2 = g.measureText('Deck').width + 3 * size * 0.005; g.restore(); var x0 = cx - (w1 + w2) / 2;
    T.word(g, 'Deck', x0 + w1 + w2 / 2, base, size, o(L.b)); T.gloss(g, 'Deck', x0 + w1 + w2 / 2, base, size, o(L.b), 0.45); T.word(g, 'Wis', x0 + w1 / 2, base, size, o(L.a)); T.gloss(g, 'Wis', x0 + w1 / 2, base, size, o(L.a), 0.45);
  }
  function emblem(g, T, L) { bits(g, T, 1, 0, 0); vine(g, T, L, 1, 0, 0); fan(g, T, L, 512, 322, 1.0); words(g, T, L, 508, 400, 136); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 270, 40, 620, [0, L.sky[0], 0.6, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-212, -40); emblem(g, T, L); return; }
    if (kind === 'wide') { fan(g, T, L, 96, 178, 0.74, 3); words(g, T, L, 480, 140, 128); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.rad(g, 200, 180, 20, 300, [0, '#3a4252', 1, L.sky[2]]); g.fill(); g.clip(); if (px >= 90) { g.translate(200, 206); g.scale(0.66, 0.66); g.translate(-512, -262); emblem(g, T, L); } else fan(g, T, L, 200, 340, 1.45, 3); g.restore(); T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 10; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.a[1], 1, L.b[2]]); g.stroke(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO wisdeck END
