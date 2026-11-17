// 🏷️ LOGO mathquest START — ➗ Math Quest, drawn in code from Aowu's picture (gl-9)
GameLogos.add('mathquest', (function () {
  var BOX = { scene: [1024, 572], main: [760, 520], wide: [800, 200], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#2a7ad8', '#1a5ab8', '#12408a'], core: ['#7ad8ff', '#3f7af0', '#5a3fd0', '#1a1a6a'], ring: ['#fff0a0', '#ffc531', '#c9820a'], path: ['#f1dca6', '#c9a55c'],
    a: ['#d8f6ff', '#6ac8ff', '#2a8af0', '#1a5ad0'], b: ['#fff27a', '#ffc21a', '#ff8a12', '#f0540a'], dark: '#12205e', ops: ['#ffd23e', '#ff6a4a', '#ff8a2a', '#b6e03a'] }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    school: mk({ sky: ['#ffb878', '#ff9f68', '#e0703a'], core: ['#fff2c8', '#ffd08a', '#ff9f68', '#c85a2a'], dark: '#5a2a0a' }),
    space: mk({ sky: ['#3a2a8a', '#241a5c', '#0e0a2e'], core: ['#b8a8ff', '#5b3bd8', '#3a1f9a', '#12104a'] }),
    lab: mk({ sky: ['#8ae0e8', '#5bc0eb', '#2a8ac8'], core: ['#e0fff8', '#8aeee0', '#3fb8d8', '#1a6a9a'], dark: '#0f3a5a' }),
    animals: mk({ sky: ['#8ae07a', '#5cc45a', '#2f8a3a'], core: ['#f0ffd8', '#a8e88a', '#5cc45a', '#1f6a2a'], dark: '#12401a' }),
    market: mk({ sky: ['#ffa8c0', '#ff7aa2', '#d84a7a'], core: ['#fff0f4', '#ffc0d4', '#ff7aa2', '#a82a5a'], dark: '#5a1230' }) };
  var TAU = Math.PI * 2;
  function faceOn(g, x, y, s, wink) { g.save(); g.translate(x, y); g.fillStyle = '#3a1c0a'; g.strokeStyle = '#3a1c0a'; g.lineCap = 'round'; g.lineWidth = s * 0.09;
    if (wink) { g.beginPath(); g.arc(-s * 0.3, -s * 0.06, s * 0.13, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); g.beginPath(); g.arc(s * 0.3, -s * 0.06, s * 0.13, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    else { g.beginPath(); g.arc(-s * 0.3, -s * 0.08, s * 0.1, 0, TAU); g.arc(s * 0.3, -s * 0.08, s * 0.1, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(-s * 0.33, -s * 0.12, s * 0.035, 0, TAU); g.arc(s * 0.27, -s * 0.12, s * 0.035, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(0, s * 0.04, s * 0.2, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke(); g.fillStyle = 'rgba(255,90,110,.45)'; g.beginPath(); g.arc(-s * 0.5, s * 0.1, s * 0.1, 0, TAU); g.arc(s * 0.5, s * 0.1, s * 0.1, 0, TAU); g.fill(); g.restore(); }
  function solid(g, T, col, ink, lw, draw) { g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.shadowColor = 'rgba(255,250,190,.95)'; g.shadowBlur = 22; draw(); g.lineWidth = lw + 5; g.strokeStyle = '#fff'; g.stroke(); g.shadowColor = 'transparent'; draw(); g.lineWidth = lw; g.strokeStyle = ink; g.stroke(); g.shadowColor = 'transparent'; draw(); g.fillStyle = col; g.fill(); g.restore(); }
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; function m(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); } return 'rgb(' + m(r) + ',' + m(gg) + ',' + m(b) + ')'; }
  function op(g, T, L, kind, x, y, s, rot) {   // + − × ÷ with faces
    g.save(); g.translate(x, y); g.rotate(rot || 0); var c = L.ops[{ plus: 0, minus: 1, times: 2, div: 3 }[kind]], ink = shade(c, -0.6), grad = T.lin(g, 0, -s, 0, s, [0, shade(c, 0.45), 0.5, c, 1, shade(c, -0.2)]);
    function bar(w, h) { T.rr(g, -w / 2, -h / 2, w, h, h * 0.42); }
    if (kind === 'minus') { solid(g, T, grad, ink, s * 0.14, function () { bar(s * 2, s * 0.7); }); g.fillStyle = 'rgba(255,255,255,.4)'; T.rr(g, -s * 0.8, -s * 0.26, s * 1.6, s * 0.14, s * 0.07); g.fill(); faceOn(g, 0, s * 0.02, s * 0.5, true); }
    else if (kind === 'div') { solid(g, T, grad, ink, s * 0.14, function () { bar(s * 2, s * 0.6); }); solid(g, T, shade(c, 0.1), ink, s * 0.12, function () { g.beginPath(); g.arc(0, -s * 0.72, s * 0.26, 0, TAU); }); solid(g, T, shade(c, 0.1), ink, s * 0.12, function () { g.beginPath(); g.arc(0, s * 0.72, s * 0.26, 0, TAU); }); faceOn(g, 0, s * 0.02, s * 0.46, false); }
    else { if (kind === 'times') g.rotate(Math.PI / 4); solid(g, T, grad, ink, s * 0.14, function () { g.beginPath(); var a = s * 0.36, b = s; g.moveTo(-a, -b); g.lineTo(a, -b); g.lineTo(a, -a); g.lineTo(b, -a); g.lineTo(b, a); g.lineTo(a, a); g.lineTo(a, b); g.lineTo(-a, b); g.lineTo(-a, a); g.lineTo(-b, a); g.lineTo(-b, -a); g.lineTo(-a, -a); g.closePath(); });
      g.fillStyle = 'rgba(255,255,255,.4)'; T.rr(g, -s * 0.24, -s * 0.86, s * 0.48, s * 0.14, s * 0.07); g.fill(); if (kind === 'times') g.rotate(-Math.PI / 4); faceOn(g, 0, 0, s * 0.56, kind === 'times'); }
    g.restore();
  }
  function ringWorld(g, T, L, cx, cy, R) {
    g.save(); g.shadowColor = 'rgba(130,240,255,1)'; g.shadowBlur = 60; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fillStyle = L.core[2]; g.fill(); g.shadowBlur = 30; g.fill(); g.shadowBlur = 0;
    g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fillStyle = T.rad(g, cx - R * 0.2, cy - R * 0.1, 10, R * 1.1, [0, L.core[0], 0.35, L.core[1], 0.7, L.core[2], 1, L.core[3]]); g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip();
    g.globalAlpha = 0.35; g.strokeStyle = '#fff'; g.lineWidth = 16; g.beginPath(); g.ellipse(cx, cy, R * 0.8, R * 0.44, -0.5, 0, TAU); g.stroke(); g.strokeStyle = L.core[2]; g.lineWidth = 22; g.beginPath(); g.ellipse(cx, cy + 10, R * 0.56, R * 0.9, 0.6, 0, TAU); g.stroke(); g.globalAlpha = 1;
    // the winding quest path
    function p() { g.beginPath(); g.moveTo(cx - R * 0.2, cy + R * 1.02); g.bezierCurveTo(cx + R * 0.5, cy + R * 0.62, cx - R * 0.6, cy + R * 0.3, cx + R * 0.06, cy + R * 0.04); g.bezierCurveTo(cx + R * 0.56, cy - R * 0.16, cx + R * 0.1, cy - R * 0.5, cx + R * 0.3, cy - R * 0.72); }
    g.lineCap = 'round'; p(); g.lineWidth = 40; g.strokeStyle = 'rgba(20,20,90,.4)'; g.stroke(); p(); g.lineWidth = 30; g.strokeStyle = L.path[1]; g.stroke(); p(); g.lineWidth = 22; g.strokeStyle = L.path[0]; g.stroke(); p(); g.setLineDash([2, 20]); g.lineWidth = 5; g.strokeStyle = 'rgba(140,100,40,.6)'; g.stroke(); g.setLineDash([]);
    var r = T.rng(6); for (var i = 0; i < 50; i++) { var an = r() * TAU, d = Math.sqrt(r()) * R * 0.96; g.globalAlpha = 0.3 + r() * 0.6; g.fillStyle = '#fff'; g.beginPath(); g.arc(cx + Math.cos(an) * d, cy + Math.sin(an) * d, 0.8 + r() * 1.8, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore();
    g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.lineWidth = 24; g.strokeStyle = '#4e2c04'; g.stroke(); g.lineWidth = 16; g.strokeStyle = T.lin(g, cx - R, cy - R, cx + R, cy + R, [0, L.ring[0], 0.3, L.ring[1], 0.6, L.ring[2], 1, L.ring[0]]); g.stroke();
    g.shadowColor = '#fff6b0'; g.shadowBlur = 16; g.beginPath(); g.arc(cx, cy, R + 12, 0, TAU); g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,246,190,.9)'; g.stroke(); g.beginPath(); g.arc(cx, cy, R - 12, 0, TAU); g.lineWidth = 2.5; g.strokeStyle = 'rgba(150,240,255,.9)'; g.shadowColor = '#7af0ff'; g.stroke(); g.shadowBlur = 0; g.restore();
  }
  function compass(g, T, x, y, R) { g.save(); g.translate(x, y); g.beginPath(); g.arc(0, -R * 1.2, R * 0.2, 0, TAU); g.lineWidth = R * 0.14; g.strokeStyle = '#c9820a'; g.stroke(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = '#ffc531'; g.fill(); g.lineWidth = R * 0.12; g.strokeStyle = '#4e2c04'; g.stroke(); g.beginPath(); g.arc(0, 0, R * 0.76, 0, TAU); g.fillStyle = '#f4fbff'; g.fill(); g.lineWidth = R * 0.06; g.stroke();
    g.rotate(0.6); g.beginPath(); g.moveTo(0, -R * 0.62); g.lineTo(R * 0.16, 0); g.lineTo(-R * 0.16, 0); g.closePath(); g.fillStyle = '#ef3b33'; g.fill(); g.beginPath(); g.moveTo(0, R * 0.62); g.lineTo(R * 0.16, 0); g.lineTo(-R * 0.16, 0); g.closePath(); g.fillStyle = '#3f7af0'; g.fill(); g.beginPath(); g.arc(0, 0, R * 0.1, 0, TAU); g.fillStyle = '#4e2c04'; g.fill(); g.restore(); }
  function sword(g, T, x, y, k, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.lineJoin = 'round'; g.beginPath(); g.moveTo(-9, 20); g.lineTo(-9, -92); g.lineTo(0, -112); g.lineTo(9, -92); g.lineTo(9, 20); g.closePath(); g.fillStyle = T.lin(g, -9, 0, 9, 0, [0, '#f4fbff', 0.5, '#c8dcf0', 0.5, '#9ab4d0', 1, '#dcecf8']); g.fill(); g.lineWidth = 5; g.strokeStyle = '#1a2a5e'; g.stroke();
    T.rr(g, -26, 18, 52, 12, 5); g.fillStyle = '#ffc531'; g.fill(); g.stroke(); T.rr(g, -7, 30, 14, 30, 5); g.fillStyle = '#b8562a'; g.fill(); g.stroke(); g.beginPath(); g.arc(0, 64, 8, 0, TAU); g.fillStyle = '#ffc531'; g.fill(); g.stroke(); g.restore(); }
  function pencil(g, T, x, y, k, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.lineJoin = 'round'; T.rr(g, -10, -70, 20, 110, 3); g.fillStyle = T.lin(g, -10, 0, 10, 0, [0, '#ffd23e', 0.5, '#ffb02e', 1, '#e88a0a']); g.fill(); g.lineWidth = 5; g.strokeStyle = '#3a1c0a'; g.stroke(); T.rr(g, -10, -84, 20, 16, 5); g.fillStyle = '#ff8aa8'; g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-10, 40); g.lineTo(0, 66); g.lineTo(10, 40); g.closePath(); g.fillStyle = '#f0d0a0'; g.fill(); g.stroke(); g.beginPath(); g.moveTo(-4, 56); g.lineTo(0, 66); g.lineTo(4, 56); g.closePath(); g.fillStyle = '#3a1c0a'; g.fill(); g.restore(); }
  function gem(g, x, y, s, c1, c2, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.86, -s * 0.5); g.lineTo(0, 0); g.lineTo(-s * 0.86, -s * 0.5); g.closePath(); g.fillStyle = c1; g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); g.beginPath(); g.moveTo(-s * 0.86, -s * 0.5); g.lineTo(0, 0); g.lineTo(0, s); g.lineTo(-s * 0.86, s * 0.5); g.closePath(); g.fillStyle = c1; g.fill(); g.beginPath(); g.moveTo(s * 0.86, -s * 0.5); g.lineTo(0, 0); g.lineTo(0, s); g.lineTo(s * 0.86, s * 0.5); g.closePath(); g.fillStyle = c2; g.fill(); g.restore(); }
  function words(g, T, L, cx, base, size) {
    function o(c) { return { spacing: size * 0.008, dark: L.dark, outline: size * 0.2, depth: size * 0.1, glow: 'rgba(130,235,255,.95)', face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.5)' }; }
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var w1 = g.measureText('Math').width + 3 * size * 0.008, w2 = g.measureText('Quest').width + 4 * size * 0.008; g.restore(); var x0 = cx - (w1 + w2) / 2;
    T.word(g, 'Quest', x0 + w1 + w2 / 2, base, size, o(L.b)); T.gloss(g, 'Quest', x0 + w1 + w2 / 2, base, size, o(L.b), 0.45); T.word(g, 'Math', x0 + w1 / 2, base, size, o(L.a)); T.gloss(g, 'Math', x0 + w1 / 2, base, size, o(L.a), 0.5);
  }
  function neon(g, T, cx, cy, R) {   // glowing orbit lines + comet dust round the ring
    g.save(); g.lineCap = 'round';
    [[1.16, 0.5, -0.42, '#6af0ff', 9, 3.4, 6.0], [1.26, 0.56, -0.42, '#ff7af0', 6, 0.2, 2.8], [1.1, 0.62, 0.5, '#b08aff', 7, 3.7, 6.2], [1.2, 0.7, 0.5, '#7dffb0', 5, 0.5, 2.6], [1.34, 0.46, -0.3, '#ffe27a', 4.5, 3.2, 5.4], [1.4, 0.6, 0.2, '#6af0ff', 3.5, 0.4, 2.2]].forEach(function (o) {
      g.save(); g.translate(cx, cy); g.rotate(o[2]); g.shadowColor = o[3]; g.shadowBlur = 26; g.beginPath(); g.ellipse(0, 0, R * o[0], R * o[1], 0, o[5], o[6]); g.lineWidth = o[4] + 4; g.strokeStyle = o[3]; g.globalAlpha = 0.35; g.stroke(); g.globalAlpha = 1; g.lineWidth = o[4]; g.stroke(); g.lineWidth = o[4] * 0.4; g.strokeStyle = '#fff'; g.stroke();
      var ex = Math.cos(o[6]) * R * o[0], ey = Math.sin(o[6]) * R * o[1]; g.beginPath(); g.arc(ex, ey, o[4] * 1.5, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); });
    var r = T.rng(33); for (var i = 0; i < 90; i++) { var a = r() * TAU, d = R * (1.04 + r() * 0.34); g.globalAlpha = 0.4 + r() * 0.6; g.fillStyle = ['#6af0ff', '#ff9af0', '#ffe27a', '#ffffff'][i % 4]; g.shadowColor = g.fillStyle; g.shadowBlur = 8; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.9, 1 + r() * 2.6, 0, TAU); g.fill(); }
    g.restore();
  }
  function emblem(g, T, L) {
    g.fillStyle = T.rad(g, 512, 290, 150, 330, [0, 'rgba(110,235,255,.75)', 0.6, 'rgba(120,120,255,.3)', 1, 'rgba(110,110,255,0)']); g.fillRect(132, 0, 760, 572);
    neon(g, T, 512, 290, 212);
    ringWorld(g, T, L, 512, 290, 212);
    gem(g, 286, 400, 16, '#5aa8ff', '#2a5fd0', 0.3); gem(g, 600, 92, 14, '#f2b63a', '#a86a10', -0.3); gem(g, 744, 250, 18, '#9a5cf0', '#5a2fb8', 0.4); gem(g, 300, 196, 13, '#f2b63a', '#a86a10', 0.6); gem(g, 690, 470, 13, '#f2b63a', '#a86a10', 0.2);
    pencil(g, T, 684, 276, 1.0, 0.62); sword(g, T, 690, 236, 1.05, 0.72); compass(g, T, 610, 184, 30);
    op(g, T, L, 'plus', 398, 142, 62, -0.12); op(g, T, L, 'minus', 574, 122, 52, 0.06); op(g, T, L, 'times', 398, 420, 60, 0); op(g, T, L, 'div', 600, 432, 50, -0.06);
    g.save(); g.font = '700 86px ' + T.FONT; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#6a3a04'; g.strokeText('?', 736, 440); g.fillStyle = T.lin(g, 0, 370, 0, 440, [0, '#fff3a0', 1, '#ffb02e']); g.fillText('?', 736, 440); g.restore();
    words(g, T, L, 512, 326, 134);
    [[250, 150, 11], [770, 150, 12], [470, 86, 8], [300, 300, 8], [786, 330, 9], [520, 500, 8], [250, 440, 7]].forEach(function (s, i) { T.spark(g, s[0], s[1], s[2], i % 2 ? '#ffe14a' : '#ffffff', 0.95); });
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-132, -30); emblem(g, T, L); return; }
    if (kind === 'wide') { ringWorld(g, T, L, 96, 100, 70); op(g, T, L, 'plus', 96, 98, 46, -0.12); words(g, T, L, 492, 136, 112); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.lin(g, 0, 0, 400, 400, [0, L.sky[0], 0.55, L.sky[1], 1, L.sky[2]]); g.fill(); g.clip(); g.translate(200, 200); if (px >= 90) { g.scale(0.72, 0.72); g.translate(-512, -290); emblem(g, T, L); } else { g.translate(-200, -200); ringWorld(g, T, L, 200, 200, 150); op(g, T, L, 'plus', 200, 200, 86, -0.12); } g.restore(); T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 12; g.strokeStyle = L.dark; g.stroke(); g.lineWidth = 6; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.ring[0], 0.5, L.ring[1], 1, L.ring[2]]); g.stroke(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO mathquest END
