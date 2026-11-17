// 🏷️ LOGO pokadif START — 🔍 Pokadif, drawn in code from Aowu's picture (gl-8)
GameLogos.add('pokadif', (function () {
  var BOX = { scene: [1024, 572], main: [700, 560], wide: [800, 210], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#2c3038', '#1c1f26', '#121419'], top: ['#ffd84a', '#ffb21a', '#f08a0a'], band: ['#2fb0b8', '#1a8a94', '#126a74'], ink: '#2a1a0a', lens: ['#9fd8ff', '#2f7af0', '#12245a'], hat: ['#b08a5a', '#7a5a34'],
    w: ['#fff59a', '#ffd23a', '#ffa41c', '#f07a0a'], dark: '#1a1a22', accent: ['#ff7a3a', '#3fd0c8', '#5a8af5', '#6ad04a'] }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    dino: mk({ sky: ['#21452a', '#17331f', '#0e2014'], band: ['#6ab84a', '#3f8a2a', '#2a6a1a'], accent: ['#f0c84a', '#6ab84a', '#a8782a', '#cfe8b0'] }),
    sea: mk({ sky: ['#123a60', '#0b2a48', '#061a30'], top: ['#8af0ff', '#3fc8e8', '#1a8ac8'], band: ['#2a6ae0', '#1a4ab0', '#12347a'], w: ['#eaffff', '#8af0ff', '#3fc8e8', '#1a8ac8'], accent: ['#a8e2ff', '#3fd8c0', '#5a8af5', '#fff2a0'] }),
    disco: mk({ sky: ['#2b1552', '#1e0d3a', '#120624'], top: ['#ff9ae8', '#f04ac8', '#b81a9a'], band: ['#8a3ff0', '#5a1fc0', '#3a0f8a'], w: ['#fff0ff', '#ff9ae8', '#f04ac8', '#c81aa8'], accent: ['#ffb8f0', '#3fd8ff', '#ffe27a', '#c05af0'] }),
    robot: mk({ sky: ['#1f3242', '#15222e', '#0c141c'], top: ['#e8f0f8', '#b8c8d8', '#8a9ab8'], band: ['#5a7aa8', '#3a5a88', '#2a3f66'], w: ['#ffffff', '#d8e8f8', '#9ab8d8', '#6a8ab0'], accent: ['#9fe6f2', '#5ff0ff', '#c8d8e8', '#ffd23e'] }),
    space: mk({ sky: ['#121640', '#070a24', '#030414'], top: ['#c8a8ff', '#8a5af0', '#5a2ad0'], band: ['#3a3ac8', '#2a1f9a', '#1a1470'], w: ['#f8f0ff', '#c8a8ff', '#8a5af0', '#5a2ad0'], accent: ['#c9c2ff', '#7af0ff', '#ffe27a', '#ff8ad8'] }),
    sky: mk({ sky: ['#5aa8e8', '#3b82be', '#2b6fa8'], band: ['#5aa8f0', '#2a7ae0', '#1a5ab8'], dark: '#12305a', accent: ['#ffffff', '#fff2b8', '#a8d8ff', '#ffb0d8'] }) };
  var TAU = Math.PI * 2;
  function shutter(g, T, cx, cy, R, ring, dark) {   // the camera-shutter "O"
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fillStyle = dark; g.fill();
    g.beginPath(); g.arc(cx, cy, R * 0.88, 0, TAU); g.fillStyle = T.lin(g, cx, cy - R, cx, cy + R, ring); g.fill();
    g.beginPath(); g.arc(cx, cy, R * 0.62, 0, TAU); g.fillStyle = dark; g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, R * 0.58, 0, TAU); g.clip(); for (var i = 0; i < 6; i++) { var a = i * TAU / 6 + 0.3; g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 0.62, cy + Math.sin(a) * R * 0.62); g.lineTo(cx + Math.cos(a + 1.05) * R * 0.62, cy + Math.sin(a + 1.05) * R * 0.62); g.lineTo(cx + Math.cos(a + 2.3) * R * 0.2, cy + Math.sin(a + 2.3) * R * 0.2); g.closePath(); g.fillStyle = i % 2 ? '#3a3f4c' : '#565c6c'; g.fill(); g.lineWidth = R * 0.03; g.strokeStyle = dark; g.stroke(); } g.restore();
    g.beginPath(); g.arc(cx, cy, R * 0.2, 0, TAU); g.fillStyle = '#0c0e14'; g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(cx - R * 0.26, cy - R * 0.3, R * 0.1, 0, TAU); g.fill(); g.restore();
  }
  function word(g, T, L, cx, base, size) {   // P + shutter + K A D i F
    var o = { spacing: size * 0.02, dark: L.dark, outline: size * 0.2, depth: size * 0.1, glow: 'rgba(255,190,60,.35)', face: function () { return [0, L.w[0], 0.3, L.w[1], 0.7, L.w[2], 1, L.w[3]]; }, inner: 'rgba(255,255,255,.5)' };
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var wP = g.measureText('P').width, wO = size * 0.78, wR = 0; 'KADiF'.split('').forEach(function (c) { wR += g.measureText(c).width + size * 0.02; }); g.restore();
    var W = wP + wO + wR, x0 = cx - W / 2;
    T.word(g, 'KADiF', x0 + wP + wO + wR / 2, base, size, o); T.gloss(g, 'KADiF', x0 + wP + wO + wR / 2, base, size, o, 0.5);
    T.word(g, 'P', x0 + wP / 2, base, size, o); T.gloss(g, 'P', x0 + wP / 2, base, size, o, 0.5);
    var oy = base - size * 0.34; g.save(); g.beginPath(); g.arc(x0 + wP + wO / 2, oy + size * 0.05, size * 0.44, 0, TAU); g.fillStyle = L.dark; g.fill(); g.restore();
    shutter(g, T, x0 + wP + wO / 2, oy, size * 0.36, [0, L.w[0], 0.5, L.w[1], 1, L.w[3]], L.dark); return W;
  }
  function hat(g, T, L) {   // deerstalker with a little houndstooth
    g.save(); g.lineJoin = 'round';
    function crown() { g.beginPath(); g.moveTo(-86, -128); g.bezierCurveTo(-80, -196, 80, -196, 86, -128); g.closePath(); }
    g.beginPath(); g.moveTo(-70, -132); g.quadraticCurveTo(-132, -134, -120, -112); g.quadraticCurveTo(-96, -108, -70, -118); g.closePath(); g.fillStyle = L.hat[1]; g.fill(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();
    g.beginPath(); g.moveTo(70, -132); g.quadraticCurveTo(132, -134, 120, -112); g.quadraticCurveTo(96, -108, 70, -118); g.closePath(); g.fill(); g.stroke();
    crown(); g.fillStyle = T.lin(g, 0, -196, 0, -128, [0, L.hat[0], 1, L.hat[1]]); g.fill();
    g.save(); crown(); g.clip(); g.fillStyle = 'rgba(60,36,12,.4)'; for (var y = -196; y < -120; y += 14) for (var x = -90 + ((y / 14) & 1) * 7; x < 90; x += 14) { g.fillRect(x, y, 7, 7); } g.restore();
    crown(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();
    T.rr(g, -90, -140, 180, 18, 8); g.fillStyle = L.hat[1]; g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, -190, 16, 10, 0, 0, TAU); g.fillStyle = L.hat[0]; g.fill(); g.stroke(); g.beginPath(); g.moveTo(-14, -190); g.quadraticCurveTo(0, -206, 14, -190); g.lineWidth = 4; g.stroke();
    g.restore();
  }
  function glove(g, L, x, y, s, rot, point) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; g.fillStyle = '#fff'; g.strokeStyle = L.ink; g.lineWidth = 5;
    if (point) { T_rr(g, -8, -62, 16, 44, 8); g.fill(); g.stroke(); }
    g.beginPath(); g.ellipse(0, 0, 24, 22, 0, 0, TAU); g.fill(); g.stroke(); T_rr(g, -20, 16, 40, 16, 6); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(-22, -4, 8, 12, -0.5, 0, TAU); g.fill(); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(-6, -2); g.lineTo(-6, 10); g.moveTo(4, -2); g.lineTo(4, 10); g.stroke(); g.restore();
  }
  function T_rr(g, x, y, w, h, r) { GameLogos.tools.rr(g, x, y, w, h, r); }
  function camera(g, T, L, cx, cy, k, bare) {
    g.save(); g.translate(cx, cy); g.scale(k, k); g.lineJoin = 'round'; g.lineCap = 'round';
    // arms
    if (!bare) { g.beginPath(); g.moveTo(-130, 40); g.quadraticCurveTo(-170, 50, -160, 10); g.moveTo(130, 30); g.quadraticCurveTo(170, 20, 150, -40); g.lineWidth = 16; g.strokeStyle = L.ink; g.stroke(); g.lineWidth = 8; g.strokeStyle = '#3a3f4c'; g.stroke(); }
    // top hump + body
    T.rr(g, -70, -128, 140, 60, 18); g.fillStyle = T.lin(g, 0, -128, 0, -70, [0, L.top[0], 1, L.top[1]]); g.fill(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();
    function body() { T.rr(g, -134, -92, 268, 176, 30); } body(); g.fillStyle = T.lin(g, 0, -92, 0, 84, [0, L.top[0], 0.5, L.top[1], 1, L.top[2]]); g.fill();
    g.save(); body(); g.clip(); g.fillStyle = T.lin(g, 0, -10, 0, 84, [0, L.band[0], 0.6, L.band[1], 1, L.band[2]]); g.fillRect(-140, -6, 280, 96); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-140, -90, 280, 14); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-140, -10, 280, 6); g.restore();
    body(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();
    T.rr(g, 78, -104, 34, 14, 6); g.fillStyle = '#ff7a3a'; g.fill(); g.lineWidth = 4; g.stroke(); T.rr(g, -110, -78, 40, 22, 6); g.fillStyle = '#eaf6ff'; g.fill(); g.stroke(); g.beginPath(); g.arc(104, 56, 9, 0, TAU); g.fillStyle = '#ff7a3a'; g.fill(); g.stroke();
    // eyes on the top half
    [-1, 1].forEach(function (q) { g.beginPath(); g.ellipse(q * 32, -62, 20, 24, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 5; g.strokeStyle = L.ink; g.stroke(); g.beginPath(); g.ellipse(q * 32 + 4, -58, 11, 14, 0, 0, TAU); g.fillStyle = '#3a2412'; g.fill(); g.beginPath(); g.arc(q * 32, -64, 5, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.lineWidth = 5; g.strokeStyle = L.ink; g.beginPath(); g.moveTo(-54, -92); g.quadraticCurveTo(-36, -102, -16, -94); g.moveTo(54, -92); g.quadraticCurveTo(36, -102, 16, -94); g.stroke();
    // lens
    g.beginPath(); g.arc(0, 22, 76, 0, TAU); g.fillStyle = '#23262e'; g.fill(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();
    g.beginPath(); g.arc(0, 22, 62, 0, TAU); g.fillStyle = T.lin(g, 0, -40, 0, 84, [0, '#6a7080', 1, '#2a2e38']); g.fill();
    g.beginPath(); g.arc(0, 22, 50, 0, TAU); g.fillStyle = T.rad(g, -14, 6, 4, 62, [0, L.lens[0], 0.45, L.lens[1], 1, L.lens[2]]); g.fill(); g.lineWidth = 4; g.strokeStyle = '#0c0e14'; g.stroke();
    g.beginPath(); g.arc(0, 22, 20, 0, TAU); g.fillStyle = '#0a1024'; g.fill();
    // two spot-the-difference marks in the glass
    T.star(g, -22, 40, 8, 4); g.fillStyle = '#ffe14a'; g.fill(); g.beginPath(); g.arc(24, 42, 6, 0, TAU); g.fillStyle = '#ff7a8a'; g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-22, -2, 14, 8, -0.6, 0, TAU); g.fill(); g.beginPath(); g.arc(20, 2, 4, 0, TAU); g.fill();
    if (!bare) { hat(g, T, L);
      // magnifying glass in the left hand
      g.save(); g.translate(-132, -14); g.rotate(-0.5); g.beginPath(); g.moveTo(0, 46); g.lineTo(0, 96); g.lineWidth = 20; g.strokeStyle = L.ink; g.stroke(); g.lineWidth = 11; g.strokeStyle = '#8a5a2a'; g.stroke();
      g.beginPath(); g.arc(0, 0, 46, 0, TAU); g.fillStyle = 'rgba(190,235,255,.5)'; g.fill(); g.lineWidth = 16; g.strokeStyle = L.ink; g.stroke(); g.lineWidth = 9; g.strokeStyle = '#ffc83a'; g.stroke(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(-16, -18, 12, 6, -0.7, 0, TAU); g.fill(); g.restore();
      glove(g, L, -166, 52, 0.9, 0.2, false); glove(g, L, 148, -52, 1, 0.25, true); }
    g.restore();
  }
  function bits(g, T, L, cx, cy, k) {
    var A = L.accent;
    [[-250, -170, 1, 1, A[0]], [250, -150, -1, 1, A[1]], [246, -60, -1, -1, A[3]], [-256, 30, 1, -1, A[2]]].forEach(function (b) { g.save(); g.translate(cx + b[0] * k, cy + b[1] * k); g.scale(b[2], b[3]); g.beginPath(); g.moveTo(0, 30 * k); g.lineTo(0, 0); g.lineTo(30 * k, 0); g.lineWidth = 7 * k; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = b[4]; g.stroke(); g.restore(); });
    [[-268, -90, 16, A[1]], [-226, 96, 14, A[0]], [226, 30, 13, A[2]]].forEach(function (s) { shutter(g, T, cx + s[0] * k, cy + s[1] * k, s[2] * k, [0, s[3], 1, s[3]], '#1a1a22'); });
    [[-300, 150], [-270, 190], [282, 110], [308, 150]].forEach(function (f, i) { g.save(); g.translate(cx + f[0] * k, cy + f[1] * k); g.rotate(i < 2 ? -0.4 : 0.4); g.fillStyle = 'rgba(190,200,220,.35)'; g.beginPath(); g.ellipse(0, 0, 9 * k, 14 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(0, 22 * k, 7 * k, 7 * k, 0, 0, TAU); g.fill(); g.restore(); });
    [[-190, -196, 10], [176, -206, 12], [286, -10, 9], [-300, -20, 8], [210, 190, 8], [-150, 160, 7]].forEach(function (s, i) { T.spark(g, cx + s[0] * k, cy + s[1] * k, s[2] * k, i % 2 ? '#ffe14a' : '#ffffff', 0.95); });
  }
  function emblem(g, T, L) { bits(g, T, L, 512, 270, 1.12); camera(g, T, L, 512, 300, 1.26); word(g, T, L, 512, 520, 122); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 280, 40, 640, [0, L.sky[0], 0.6, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-162, -8); emblem(g, T, L); return; }
    if (kind === 'wide') { camera(g, T, L, 96, 122, 0.52, true); word(g, T, L, 500, 142, 118); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.rad(g, 200, 180, 20, 300, [0, '#3c424e', 1, L.sky[2]]); g.fill(); g.clip(); if (px >= 90) { camera(g, T, L, 200, 196, 0.86); word(g, T, L, 200, 356, 64); } else camera(g, T, L, 200, 214, 1.25, true); g.restore(); T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 10; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.w[1], 1, L.band[0]]); g.stroke(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO pokadif END
