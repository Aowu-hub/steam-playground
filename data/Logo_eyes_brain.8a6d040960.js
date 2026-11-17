// 🏷️ LOGO eyes-brain START — 👀🧠 Eyes Brain Riot, drawn in code from Aowu's picture (gl-10)
GameLogos.add('eyes-brain', (function () {
  var BOX = { scene: [1024, 572], main: [900, 566], wide: [900, 190], badge: [400, 400] };
  var LOOK = { classic: { sky: ['#3a1a9a', '#24107a', '#12084a'], plate: ['#2a1470', '#1a0c52'], rim: ['#5ff0ff', '#8a6af5', '#ff5ad8'],
    w1: ['#d8ffff', '#5ff0ff', '#1fc8e8', '#1a8ad8'], w2: ['#ffd8f6', '#ff7ae0', '#f03ac8', '#b81aa8'], w3: ['#fff59a', '#ffd23a', '#ff9a1c', '#f0600a'], dark: '#1a0a52' } };
  var TAU = Math.PI * 2;
  function rays(g, T, cx, cy) { g.save(); var r = T.rng(5); for (var i = 0; i < 60; i++) { var a = r() * TAU, d0 = 260 + r() * 120, d1 = d0 + 60 + r() * 260; g.beginPath(); g.moveTo(cx + Math.cos(a) * d0, cy + Math.sin(a) * d0 * 0.6); g.lineTo(cx + Math.cos(a) * d1, cy + Math.sin(a) * d1 * 0.6); g.lineWidth = 1 + r() * 3.5; g.strokeStyle = ['rgba(120,240,255,', 'rgba(255,120,230,', 'rgba(180,150,255,'][i % 3] + (0.25 + r() * 0.45) + ')'; g.lineCap = 'round'; g.stroke(); } g.restore(); }
  function bolt(g, T, x, y, s, rot, col) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.beginPath(); g.moveTo(8, -40); g.lineTo(-18, 4); g.lineTo(-2, 4); g.lineTo(-12, 40); g.lineTo(20, -8); g.lineTo(4, -8); g.closePath(); g.shadowColor = col; g.shadowBlur = 16; g.fillStyle = col; g.fill(); g.shadowBlur = 0; g.lineWidth = 3; g.strokeStyle = '#6a3a04'; g.lineJoin = 'round'; g.stroke(); g.restore(); }
  function burst(g, T, x, y, R, col) { g.save(); g.shadowColor = col; g.shadowBlur = R * 0.5; T.star(g, x, y, R, R * 0.5, 9, 0.3); g.fillStyle = col; g.fill(); T.star(g, x, y, R * 0.6, R * 0.3, 9, 0.6); g.fillStyle = '#fffbe0'; g.fill(); g.restore(); }
  function eyes(g, T, x, y, s, rot) {   // a pair of big cartoon eyes
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s);
    [-1, 1].forEach(function (k) { g.save(); g.shadowColor = 'rgba(160,220,255,.9)'; g.shadowBlur = 18; g.beginPath(); g.ellipse(k * 34, 0, 34, 42, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); g.beginPath(); g.ellipse(k * 34, 0, 34, 42, 0, 0, TAU); g.lineWidth = 6; g.strokeStyle = '#1a0a52'; g.stroke();
      g.beginPath(); g.ellipse(k * 34 + 8, 6, 19, 24, 0, 0, TAU); g.fillStyle = T.lin(g, 0, -18, 0, 30, [0, '#1a2a9a', 0.6, '#3f7af0', 1, '#6ad0ff']); g.fill(); g.beginPath(); g.ellipse(k * 34 + 10, 8, 10, 13, 0, 0, TAU); g.fillStyle = '#0a0830'; g.fill(); g.beginPath(); g.arc(k * 34 + 2, -6, 7, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(k * 34 + 16, 16, 3, 0, TAU); g.fill(); });
    g.restore();
  }
  function brain(g, T, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    function lobes() { g.beginPath(); [[-34, -16, 30], [0, -30, 32], [36, -14, 30], [-40, 18, 26], [-4, 14, 34], [38, 20, 28], [10, 36, 22]].forEach(function (c) { g.moveTo(c[0] + c[2], c[1]); g.arc(c[0], c[1], c[2], 0, TAU); }); }
    g.save(); g.shadowColor = '#ff8af0'; g.shadowBlur = 36; lobes(); g.fillStyle = '#f06ad8'; g.fill(); g.restore();
    lobes(); g.lineWidth = 8; g.strokeStyle = '#5a1a8a'; g.stroke(); lobes(); g.fillStyle = T.lin(g, -60, -60, 60, 60, [0, '#ffb0f0', 0.5, '#f06ad8', 1, '#9a5af0']); g.fill();
    g.strokeStyle = '#8a2aa8'; g.lineWidth = 5; g.beginPath(); g.moveTo(-2, -58); g.quadraticCurveTo(-12, -10, 4, 50); g.moveTo(-50, -4); g.quadraticCurveTo(-28, 4, -30, 26); g.moveTo(20, -36); g.quadraticCurveTo(40, -20, 30, 4); g.moveTo(-30, -36); g.quadraticCurveTo(-20, -22, -34, -10); g.moveTo(34, 18); g.quadraticCurveTo(50, 26, 44, 40); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-22, -36, 16, 8, -0.4, 0, TAU); g.fill(); g.fillStyle = 'rgba(120,60,220,.3)'; g.beginPath(); g.ellipse(20, 30, 46, 24, 0.2, 0, TAU); g.fill();
    [[-78, -40, 9], [70, -56, 10], [80, 30, 8], [-70, 44, 7]].forEach(function (q) { T.spark(g, q[0], q[1], q[2], '#fff6b0', 1); });
    g.restore();
  }
  function chip(g, T, x, y, txt, col, size) { g.save(); g.font = '700 ' + size + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.shadowColor = col; g.shadowBlur = 14; g.lineWidth = size * 0.2; g.strokeStyle = '#1a0a52'; g.strokeText(txt, x, y); g.fillStyle = col; g.fillText(txt, x, y); g.restore(); }
  function clock(g, T, x, y, R) { g.save(); g.shadowColor = '#ffd23e'; g.shadowBlur = 12; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = '#ffb02e'; g.fill(); g.shadowBlur = 0; g.lineWidth = R * 0.14; g.strokeStyle = '#6a3a04'; g.stroke(); g.beginPath(); g.arc(x, y, R * 0.72, 0, TAU); g.fillStyle = '#fffbe8'; g.fill(); g.lineWidth = R * 0.14; g.lineCap = 'round'; g.strokeStyle = '#3a1c0a'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - R * 0.5); g.moveTo(x, y); g.lineTo(x + R * 0.36, y + R * 0.1); g.stroke(); g.restore(); }
  function plate(g, T, L, x, y, w, h) {
    g.save(); g.shadowColor = L.rim[0]; g.shadowBlur = 40; T.rr(g, x, y, w, h, 70); g.fillStyle = T.lin(g, x, y, x + w, y + h, [0, L.plate[0], 1, L.plate[1]]); g.fill(); g.shadowColor = L.rim[2]; g.shadowBlur = 22; g.fill(); g.shadowBlur = 0;
    g.save(); T.rr(g, x, y, w, h, 70); g.clip(); burst(g, T, x + w * 0.78, y + h * 0.74, 70, '#ffb02e'); burst(g, T, x + w * 0.2, y + h * 0.5, 44, '#ff5ad8'); bolt(g, T, x + w * 0.82, y + h * 0.2, 1.3, 0.3, '#ffe14a'); bolt(g, T, x + w * 0.14, y + h * 0.78, 1.1, -0.3, '#ffe14a'); bolt(g, T, x + w * 0.5, y + h * 0.9, 0.8, 0.9, '#5ff0ff');
    var r = T.rng(8); for (var i = 0; i < 50; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillStyle = ['#5ff0ff', '#ff7ae0', '#ffe14a', '#fff'][i % 4]; g.beginPath(); g.arc(x + r() * w, y + r() * h, 1 + r() * 2.5, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore();
    var rim = T.lin(g, x, y, x + w, y + h, [0, L.rim[0], 0.5, L.rim[1], 1, L.rim[2]]); g.shadowColor = L.rim[0]; g.shadowBlur = 18; T.rr(g, x, y, w, h, 70); g.lineWidth = 9; g.strokeStyle = rim; g.stroke(); g.shadowBlur = 0; T.rr(g, x, y, w, h, 70); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.9)'; g.stroke(); g.restore();
  }
  function line(g, T, L, str, cx, base, size, c, glow, rot) {
    var o = { spacing: size * 0.02, rot: rot || 0, dark: L.dark, outline: size * 0.2, depth: size * 0.09, fat: size * 0.02, glow: glow, glowN: 3, glowBlur: 0.42, face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.75)' };
    T.word(g, str, cx, base, size, o); T.gloss(g, str, cx, base, size, o, 0.5);
  }
  function words(g, T, L, cx, y, k) { line(g, T, L, 'EYES', cx - 6 * k, y, 124 * k, L.w1, 'rgba(95,240,255,1)', -0.03); line(g, T, L, 'BRAIN', cx + 4 * k, y + 116 * k, 122 * k, L.w2, 'rgba(255,110,230,1)', -0.02); line(g, T, L, 'RIOT', cx, y + 236 * k, 132 * k, L.w3, 'rgba(255,200,60,1)', -0.01); }
  function emblem(g, T, L) {
    eyes(g, T, 150, 118, 0.8, -0.2); g.save(); g.lineCap = 'round'; [[214, 96, 262, 84], [216, 122, 270, 118], [208, 150, 256, 152]].forEach(function (q) { g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[2], q[3]); g.lineWidth = 4; g.strokeStyle = 'rgba(200,230,255,.7)'; g.stroke(); }); g.restore();
    plate(g, T, L, 286, 62, 458, 456);
    brain(g, T, 868, 136, 0.86);
    chip(g, T, 150, 262, '3', '#5ff0ff', 54); chip(g, T, 160, 420, 'A', '#ff7ae0', 50); chip(g, T, 196, 508, '3', '#ff7ae0', 60); chip(g, T, 822, 290, '7', '#5ff0ff', 60); chip(g, T, 880, 330, '3', '#5ff0ff', 40); chip(g, T, 836, 420, 'A', '#ff7ae0', 46); chip(g, T, 896, 500, 'Z', '#ffd23e', 60);
    clock(g, T, 140, 250 - 2, 0); clock(g, T, 132, 252, 0); clock(g, T, 136, 250, 0);
    clock(g, T, 118, 248, 16); clock(g, T, 902, 404, 18);
    T.star(g, 118, 344, 24, 12); g.fillStyle = '#ffd23e'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#8a4a04'; g.lineJoin = 'round'; g.stroke();
    [[880, 262, '#ff5a4a'], [690, 466, '#ff5a4a']].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], 15, 0, TAU); g.fillStyle = b[2]; g.fill(); g.lineWidth = 3; g.strokeStyle = '#6a0a0a'; g.stroke(); chip(g, T, b[0], b[1] + 1, '!', '#fff', 22); });
    eyes(g, T, 318, 92, 0.9, -0.08);
    words(g, T, L, 512, 196, 1);
    [[262, 60, 9], [770, 80, 10], [250, 300, 7], [784, 220, 8], [470, 40, 6]].forEach(function (s) { T.spark(g, s[0], s[1], s[2], '#fff', 0.95); });
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); rays(g, T, 512, 286); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-62, -3); emblem(g, T, L); return; }
    if (kind === 'wide') { eyes(g, T, 66, 94, 0.6, -0.08); var s = 82, o = function (c, gl) { return { spacing: s * 0.02, dark: L.dark, outline: s * 0.2, depth: s * 0.09, glow: gl, glowN: 2, glowBlur: 0.36, face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.75)' }; };
      g.font = '700 ' + s + 'px ' + T.FONT; var w1 = g.measureText('EYES').width + 3 * s * 0.02, w2 = g.measureText('BRAIN').width + 4 * s * 0.02, w3 = g.measureText('RIOT').width + 3 * s * 0.02, gap = 26, x0 = 134;
      [['EYES', w1, L.w1, 'rgba(95,240,255,1)'], ['BRAIN', w2, L.w2, 'rgba(255,110,230,1)'], ['RIOT', w3, L.w3, 'rgba(255,200,60,1)']].forEach(function (q) { var oo = o(q[2], q[3]); T.word(g, q[0], x0 + q[1] / 2, 124, s, oo); T.gloss(g, q[0], x0 + q[1] / 2, 124, s, oo, 0.5); x0 += q[1] + gap; }); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.76, 0.76); g.translate(-515, -290); plate(g, T, L, 286, 62, 458, 456); if (px >= 90) { eyes(g, T, 336, 118, 0.98, -0.08); words(g, T, L, 512, 196, 1); } else { eyes(g, T, 515, 250, 2.1, -0.06); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO eyes-brain END
