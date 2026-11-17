// 🏷️ LOGO polyplot START — ⬛ Polyplot, drawn in code from Aowu's picture (gl-5)
GameLogos.add('polyplot', (function () {
  var BOX = { scene: [1024, 572], main: [560, 540], wide: [780, 200], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#2a1f6a', '#1a1450', '#120e3a'], plate: ['#33247e', '#261a62', '#1b124c'], rim: ['#6ad8ff', '#8a6af5', '#c05af0'], line: '#8fe6ff', dot: null,
    fill: ['#5fdc3a', '#2fc8c0', '#ff8a1a', '#2f7df5'], a: ['#d8fbff', '#6ae0f0', '#22b8e0', '#1a8ac8'], b: ['#fff0a0', '#ffc02a', '#ff8a14', '#f0600a'], dark: '#1a1250', dots: ['#ff8a2a', '#3fd8ff', '#f04ab8', '#8a6af5', '#ffd23e', '#3fd8ff', '#f04ab8', '#ff8a2a', '#ffd23e', '#3fd8ff'] };
    for (var k in o) b[k] = o[k]; return b; }
  function th(bg, paper, dot, line, extra) { var o = { sky: [paper, bg, bg], plate: [paper, bg, bg], line: line, dot: dot }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var LOOK = { classic: mk({}),
    dino: th('#17331F', '#21452A', '#E9F7D8', '#CFE8B0', { rim: ['#cfe8b0', '#6ab84a', '#a8782a'] }), sea: th('#0B2A48', '#123A60', '#E0F7FF', '#A8E2FF', { rim: ['#a8e2ff', '#3fb8e0', '#2a6ae0'] }),
    dance: th('#1E0D3A', '#2B1552', '#FFE8FA', '#E3B8FF', { rim: ['#ffb8f0', '#c05af0', '#3fd8ff'] }), robot: th('#15222E', '#1F3242', '#E8FBFF', '#9FE6F2', { rim: ['#9fe6f2', '#5a8ab8', '#c8d8e8'] }),
    space: th('#070A24', '#121640', '#FFFFFF', '#C9C2FF', { rim: ['#c9c2ff', '#6a5af0', '#3fd8ff'] }), sky: th('#2B6FA8', '#3B82BE', '#FFFFFF', '#FFF2B8', { rim: ['#fff2b8', '#ffffff', '#a8d8ff'], dark: '#12305a' }),
    hunter: th('#2A1D12', '#3A2A1A', '#FFE9C2', '#E7B776', { rim: ['#e7b776', '#c8782a', '#ffd23e'], dark: '#2a1608' }) };
  var TAU = Math.PI * 2;
  // a real little board: dots joined by lines, four closed shapes already claimed (picture coordinates)
  var P = { A: [336, 112], B: [492, 98], C: [600, 162], D: [520, 164], E: [318, 384], F: [524, 388], G: [402, 470], H: [526, 470], I: [628, 462], J: [706, 424], K: [704, 306], M: [506, 262], N: [342, 258], Q: [596, 250] };
  var SHAPES = [['A', 'B', 'D', 'M', 'N'], ['D', 'C', 'Q', 'M'], ['E', 'F', 'H', 'G'], ['F', 'K', 'J', 'I', 'H']];
  var EDGES = ['AB', 'BD', 'DC', 'CQ', 'QM', 'DM', 'MN', 'NA', 'NE', 'EF', 'FM', 'EG', 'GH', 'HF', 'HI', 'IJ', 'JK', 'KF', 'QK'];
  function poly(g, ids, f) { g.beginPath(); ids.forEach(function (k, i) { var p = P[k]; g[i ? 'lineTo' : 'moveTo'](f[0] + p[0] * f[2], f[1] + p[1] * f[2]); }); g.closePath(); }
  function board(g, T, L, ox, oy, k, words) {
    var f = [ox, oy, k];
    SHAPES.forEach(function (s, i) { var c = L.fill[i], xs = s.map(function (q) { return P[q][0]; }), ys = s.map(function (q) { return P[q][1]; }), cx = ox + k * (Math.min.apply(0, xs) + Math.max.apply(0, xs)) / 2, cy = oy + k * (Math.min.apply(0, ys) + Math.max.apply(0, ys)) / 2;
      g.save(); g.shadowColor = c; g.shadowBlur = 18 * k; poly(g, s, f); g.fillStyle = c; g.fill(); g.restore(); g.save(); poly(g, s, f); g.clip(); g.fillStyle = T.lin(g, 0, oy + k * Math.min.apply(0, ys), 0, oy + k * Math.max.apply(0, ys), [0, 'rgba(255,255,255,.2)', 0.35, 'rgba(255,255,255,0)', 1, 'rgba(0,0,60,.2)']); g.fillRect(ox, oy, 1024 * k, 572 * k); g.restore();
      g.save(); poly(g, s, f); g.clip(); g.globalAlpha = 0.6; g.fillStyle = '#fff'; g.lineJoin = 'round';        // the up-arrows + sparkles inside each shape
      for (var a = -1; a <= 1; a++) { var x = cx + a * 44 * k, y = cy + (a ? 16 : -4) * k, s2 = (a ? 21 : 30) * k; g.beginPath(); g.moveTo(x, y - s2); g.lineTo(x + s2 * 0.8, y); g.lineTo(x + s2 * 0.36, y); g.lineTo(x + s2 * 0.36, y + s2 * 0.3); g.lineTo(x - s2 * 0.36, y + s2 * 0.3); g.lineTo(x - s2 * 0.36, y); g.lineTo(x - s2 * 0.8, y); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x, y - s2 + s2 * 0.7); g.lineTo(x + s2 * 0.8, y + s2 * 0.7); g.lineTo(x + s2 * 0.36, y + s2 * 0.7); g.lineTo(x - s2 * 0.36, y + s2 * 0.7); g.lineTo(x - s2 * 0.8, y + s2 * 0.7); g.closePath(); g.fill(); }
      g.globalAlpha = 1; T.spark(g, cx - 44 * k, cy - 26 * k, 8 * k, '#fff', 0.95); T.spark(g, cx + 40 * k, cy - 34 * k, 6 * k, '#fff', 0.9); g.restore(); });
    g.save(); g.lineCap = 'round'; g.shadowColor = L.line; g.shadowBlur = 8 * k; EDGES.forEach(function (e) { var a = P[e[0]], b = P[e[1]]; g.beginPath(); g.moveTo(ox + a[0] * k, oy + a[1] * k); g.lineTo(ox + b[0] * k, oy + b[1] * k); g.lineWidth = 6 * k; g.strokeStyle = L.line; g.stroke(); }); g.restore();
    Object.keys(P).forEach(function (key, i) { if (key === 'M' || key === 'N' || key === 'Q') return; var p = P[key], c = L.dot || L.dots[i % L.dots.length], x = ox + p[0] * k, y = oy + p[1] * k, r = 17 * k;
      g.save(); g.shadowColor = c; g.shadowBlur = 14 * k; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.3, y - r * 0.35, 1, r * 1.2, [0, '#ffffff', 0.25, c, 1, c]); g.fill(); g.restore(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.lineWidth = 2.5 * k; g.strokeStyle = 'rgba(10,10,60,.55)'; g.stroke(); });
  }
  function star(g, T, x, y, R) { g.save(); g.shadowColor = '#ffd23e'; g.shadowBlur = 12; T.star(g, x, y, R, R * 0.52); g.fillStyle = T.lin(g, 0, y - R, 0, y + R, [0, '#fff3a0', 1, '#ffb02e']); g.fill(); g.restore(); T.star(g, x, y, R, R * 0.52); g.lineWidth = 3; g.strokeStyle = '#8a4a04'; g.lineJoin = 'round'; g.stroke();
    g.fillStyle = '#3a1c0a'; g.beginPath(); g.arc(x - R * 0.2, y - R * 0.02, R * 0.07, 0, TAU); g.arc(x + R * 0.2, y - R * 0.02, R * 0.07, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y + R * 0.06, R * 0.16, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = 2.5; g.lineCap = 'round'; g.strokeStyle = '#3a1c0a'; g.stroke(); }
  function chart(g, x, y, k) { var pts = [[0, 30], [26, 8], [52, 22], [80, -6]], cols = ['#b86af5', '#3fd8ff', '#ff8a2a', '#6ae04a']; g.save(); g.lineWidth = 3.5 * k; g.strokeStyle = '#d8c8ff'; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(function (p, i) { g[i ? 'lineTo' : 'moveTo'](x + p[0] * k, y + p[1] * k); }); g.stroke(); pts.forEach(function (p, i) { g.beginPath(); g.arc(x + p[0] * k, y + p[1] * k, 6 * k, 0, TAU); g.fillStyle = cols[i]; g.fill(); }); g.restore(); }
  function plate(g, T, L, x, y, S) {
    g.save(); g.shadowColor = L.rim[1]; g.shadowBlur = 30; T.rr(g, x, y, S, S * 0.96, S * 0.16); g.fillStyle = T.lin(g, x, y, x + S, y + S, [0, L.plate[0], 0.5, L.plate[1], 1, L.plate[2]]); g.fill(); g.shadowBlur = 0;
    g.lineWidth = 5; g.strokeStyle = T.lin(g, x, y, x + S, y + S, [0, L.rim[0], 0.5, L.rim[1], 1, L.rim[2]]); g.stroke();
    g.save(); T.rr(g, x, y, S, S * 0.96, S * 0.16); g.clip(); g.fillStyle = T.rad(g, x + S / 2, y + S * 0.45, 20, S * 0.7, [0, 'rgba(140,120,255,.35)', 1, 'rgba(0,0,0,0)']); g.fillRect(x, y, S, S); g.restore(); g.restore();
  }
  function words(g, T, L, cx, base, size) {
    function o(c) { return { spacing: size * 0.01, dark: L.dark, outline: size * 0.2, depth: size * 0.09, glow: 'rgba(120,100,255,.55)', face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: 'rgba(255,255,255,.4)' }; }
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var w1 = g.measureText('Poly').width + 3 * size * 0.01, w2 = g.measureText('Plot').width + 3 * size * 0.01; g.restore(); var x0 = cx - (w1 + w2) / 2;
    T.word(g, 'Plot', x0 + w1 + w2 / 2, base, size, o(L.b)); T.gloss(g, 'Plot', x0 + w1 + w2 / 2, base, size, o(L.b), 0.45); T.word(g, 'Poly', x0 + w1 / 2, base, size, o(L.a)); T.gloss(g, 'Poly', x0 + w1 / 2, base, size, o(L.a), 0.45);
  }
  function emblem(g, T, L) { plate(g, T, L, 262, 44, 500); board(g, T, L, 0, 0, 1); star(g, T, 652, 128, 24); chart(g, 624, 196, 1); words(g, T, L, 512, 334, 104); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.sky[0], 0.6, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-232, -14); emblem(g, T, L); return; }
    if (kind === 'wide') { g.save(); g.beginPath(); g.rect(0, 0, 190, 200); g.clip(); board(g, T, L, -106, -26, 0.42); g.restore(); words(g, T, L, 488, 138, 122); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.78, 0.78); g.translate(-512, -284); plate(g, T, L, 262, 44, 500); board(g, T, L, 0, 0, 1); star(g, T, 652, 128, 24); if (px >= 90) words(g, T, L, 512, 334, 104); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO polyplot END
