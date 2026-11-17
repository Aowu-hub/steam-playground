// 🏷️ LOGO checkers START — 🔴 Checkers, drawn in code from Aowu's picture (gl-22, round 8). The smug GOLD king piece with its crown beside the happy RED
// piece (one-piece discs: face + grooves + side band, depth from colour), a checkered path sweeping up behind them, orange → teal sky, sparkles + arrows,
// cream "CHECKERS" (with the S, Aowu 2026-11-16 17:0x) with a dark rim. Looks = the game's DESIGNS (classic · fantasy · futuristic · hero · pets · dance):
// the second piece takes the design's own colour (p1), the sky + path follow it.
GameLogos.add('checkers', (function () {
  var BOX = { scene: [1024, 572], main: [474, 474], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { sky: ['#ffc04a', '#f8802a', '#e8503a', '#2a8a8a', '#0e4a5a'], piece: '#e8303a', tileD: '#8a1a24', tileL: '#fff2d8', glow: '#ffd27a', rim: '#ffcf8a' }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    fantasy: mk({ sky: ['#ffb8e8', '#d86ad0', '#8a3ab8', '#1F8A70', '#0a3a3a'], piece: '#FF7EB9', tileD: '#1F8A70', tileL: '#fff0fa', glow: '#ffc8f0', rim: '#ffd0f0' }),
    futuristic: mk({ sky: ['#4af0ff', '#2a8ae0', '#3a1a9a', '#2a0a5a', '#0a0624'], piece: '#0FA3C7', tileD: '#B5179E', tileL: '#d8f8ff', glow: '#8af4ff', rim: '#8af4ff' }),
    hero: mk({ sky: ['#ffd84a', '#f0802a', '#c82a3a', '#2a2a8a', '#14104a'], piece: '#1565C0', tileD: '#4A148C', tileL: '#fff6d8', glow: '#ffe07a' }),
    pets: mk({ sky: ['#ffe0a0', '#f0b06a', '#d8804a', '#8a9ab0', '#4a5470'], piece: '#E07B22', tileD: '#6a7488', tileL: '#fff8ec', glow: '#ffe0a0' }),
    dance: mk({ sky: ['#ffd04a', '#ff8a00', '#e03a8a', '#2a5ae0', '#101a5a'], piece: '#FF8A00', tileD: '#0077FF', tileL: '#fff4e0', glow: '#ffd27a' }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#3a140c';
  /* ---------- sky + the checkered path ---------- */
  function sky(g, T, L, x, y, w, h) {
    g.fillStyle = T.lin(g, x, y, x + w, y + h * 0.7, [0, L.sky[0], 0.3, L.sky[1], 0.48, L.sky[2], 0.66, L.sky[3], 1, L.sky[4]]); g.fillRect(x, y, w, h);
    g.fillStyle = T.rad(g, x + w * 0.38, y + h * 0.42, 10, w * 0.5, [0, 'rgba(255,230,160,.55)', 1, 'rgba(255,230,160,0)']); g.fillRect(x, y, w, h);
    g.save(); g.globalAlpha = 0.5; g.fillStyle = sh(L.sky[4], -0.2); g.beginPath(); g.moveTo(x, y + h * 0.62); g.quadraticCurveTo(x + w * 0.3, y + h * 0.55, x + w * 0.5, y + h); g.lineTo(x, y + h); g.closePath(); g.fill(); g.restore();
  }
  function bez(p, t) { var u = 1 - t; return [u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6], u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7]]; }
  function path(g, T, L) {   // a band between two curves, tiled in perspective: far end top-right, near end bottom-left
    var A = [598, 58, 560, 150, 440, 260, 270, 352], B = [712, 58, 690, 190, 610, 360, 380, 470], N = 15, M = 5;
    g.save(); g.shadowColor = 'rgba(40,0,0,.45)'; g.shadowBlur = 18; g.beginPath(); for (var i = 0; i <= 30; i++) { var a = bez(A, i / 30); g[i ? 'lineTo' : 'moveTo'](a[0], a[1]); } for (i = 30; i >= 0; i--) { var b = bez(B, i / 30); g.lineTo(b[0], b[1]); } g.closePath(); g.fillStyle = L.tileD; g.fill(); g.restore();
    function P(u, v) { var a = bez(A, u), b = bez(B, u); return [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v]; }
    for (i = 0; i < N; i++) { var u0 = Math.pow(i / N, 1.25), u1 = Math.pow((i + 1) / N, 1.25); for (var j = 0; j < M; j++) { var v0 = j / M, v1 = (j + 1) / M, q = [P(u0, v0), P(u0, v1), P(u1, v1), P(u1, v0)];
      g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (var k = 1; k < 4; k++) g.lineTo(q[k][0], q[k][1]); g.closePath(); var dark = (i + j) % 2 === 0;
      g.fillStyle = dark ? T.lin(g, q[0][0], q[0][1], q[2][0], q[2][1], [0, sh(L.tileD, 0.15), 1, sh(L.tileD, -0.25)]) : T.lin(g, q[0][0], q[0][1], q[2][0], q[2][1], [0, '#ffffff', 1, L.tileL]); g.fill(); } }
    g.save(); g.lineWidth = 4; g.strokeStyle = L.glow; g.shadowColor = L.glow; g.shadowBlur = 10; g.beginPath(); for (i = 0; i <= 30; i++) { b = bez(B, i / 30); g[i ? 'lineTo' : 'moveTo'](b[0], b[1]); } g.stroke(); g.restore();
  }
  function arrow(g, T, x, y, a, len, col) { g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 7; g.lineCap = 'round'; g.globalAlpha = 0.8; g.shadowColor = col; g.shadowBlur = 10;
    g.beginPath(); g.moveTo(-len, 10); g.quadraticCurveTo(-len * 0.4, 8, 0, -4); g.stroke(); g.beginPath(); g.moveTo(14, -10); g.lineTo(-10, -18); g.lineTo(-2, 8); g.closePath(); g.fill(); g.restore(); }
  function bits(g, T, L, full) { var r = T.rng(4);
    arrow(g, T, 528, 98, -0.55, 70, 'rgba(255,230,140,.9)'); arrow(g, T, 716, 330, -0.9, 50, 'rgba(120,230,120,.95)');
    [[338, 140, 12], [318, 200, 15], [710, 220, 13], [458, 92, 9], [742, 290, 9]].forEach(function (s, i) { g.fillStyle = i % 2 ? '#ffe07a' : '#fff6c0'; T.star(g, s[0], s[1], s[2], s[2] * 0.45); g.fill(); });
    for (var i = 0; i < (full ? 22 : 10); i++) T.spark(g, 300 + r() * 430, 70 + r() * 340, 3 + r() * 6, '#fff', 0.7);
  }
  /* ---------- a checker piece: one silhouette (side band + face), grooves, face drawn after ---------- */
  function piece(g, T, cx, cy, R, col, tilt, pal) { pal = pal || [sh(col, 0.5), col, sh(col, -0.3), sh(col, -0.5)];
    var P = { side: function (h) { h.beginPath(); h.ellipse(cx + 4, cy + 14, R, R * 0.98, tilt, 0, TAU); h.fill(); }, face: function (h) { h.beginPath(); h.ellipse(cx, cy, R, R * 0.98, tilt, 0, TAU); h.fill(); } };
    T.onePiece(g, T, { x0: cx - R - 14, y0: cy - R - 14, W: R * 2 + 40, H: R * 2 + 46, rim: INK, rimW: 4.4, parts: P, order: ['side', 'face'],
      colour: function (B, put, inside) {
        put(B, 'side', pal[3]);
        put(B, 'face', T.rg(B, cx - R * 0.3, cy - R * 0.35, R * 0.1, R * 1.25, [0, pal[0], 0.45, pal[1], 1, pal[2]]));
        inside(B, 'face', function (h) {
          [0.86, 0.66, 0.46].forEach(function (k, i) { h.lineWidth = R * 0.075; h.strokeStyle = pal[3]; h.globalAlpha = 0.75; h.beginPath(); h.ellipse(cx + 2, cy + 2, R * k, R * k * 0.98, tilt, 0, TAU); h.stroke(); h.globalAlpha = 1; h.lineWidth = R * 0.04; h.strokeStyle = pal[0]; h.beginPath(); h.ellipse(cx - 2, cy - 3, R * k, R * k * 0.98, tilt, Math.PI * 1.05, Math.PI * 1.75); h.stroke(); });
          h.fillStyle = 'rgba(255,255,255,.45)'; h.beginPath(); h.ellipse(cx - R * 0.42, cy - R * 0.55, R * 0.28, R * 0.12, -0.6, 0, TAU); h.fill(); });
      } });
  }
  function eyes(g, cx, cy, k, smug) {
    [[-26, 0], [24, -2]].forEach(function (e, i) { var x = cx + e[0] * k, y = cy + e[1] * k; g.beginPath(); g.ellipse(x, y, 13 * k, 15 * k, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5 * k; g.strokeStyle = INK; g.stroke();
      g.beginPath(); g.arc(x + (smug ? 6 : 2) * k, y + (smug ? 2 : 2) * k, 7 * k, 0, TAU); g.fillStyle = '#3a2010'; g.fill(); g.beginPath(); g.arc(x + (smug ? 4 : 0) * k, y - 1 * k, 2.4 * k, 0, TAU); g.fillStyle = '#fff'; g.fill();
      if (smug) { g.save(); g.beginPath(); g.ellipse(x, y, 13.5 * k, 15.5 * k, 0, 0, TAU); g.clip(); g.fillStyle = '#d8a02a'; g.fillRect(x - 16 * k, y - 18 * k, 32 * k, 15 * k); g.restore(); g.lineWidth = 3 * k; g.strokeStyle = INK; g.beginPath(); g.moveTo(x - 13 * k, y - 3 * k); g.lineTo(x + 13 * k, y - 4 * k); g.stroke(); } });
  }
  function gold(g, T, L) {
    piece(g, T, 420, 284, 92, '#ffc21a', 0, ['#fff2a8', '#ffc21a', '#e88a0a', '#a8560a']);
    g.save(); g.translate(394, 172); g.rotate(-0.22); g.lineJoin = 'round';   // the crown, tilted
    g.beginPath(); g.moveTo(-46, 22); g.lineTo(-52, -26); g.lineTo(-24, -2); g.lineTo(0, -38); g.lineTo(24, -2); g.lineTo(52, -26); g.lineTo(46, 22); g.quadraticCurveTo(0, 32, -46, 22); g.closePath();
    g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); g.fillStyle = T.lin(g, 0, -40, 0, 30, [0, '#fff2a0', 0.5, '#ffc21a', 1, '#c8800a']); g.fill();
    [[-52, -28], [0, -40], [52, -28]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], 8, 0, TAU); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); });
    g.beginPath(); g.ellipse(0, 6, 7, 9, 0, 0, TAU); g.fillStyle = '#d8202a'; g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(-40, 14, 80, 4); g.restore();
    eyes(g, 440, 262, 1, true);
    g.strokeStyle = INK; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(410, 236); g.quadraticCurveTo(424, 228, 434, 236); g.moveTo(452, 232); g.quadraticCurveTo(462, 226, 474, 234); g.stroke();
    g.beginPath(); g.moveTo(424, 312); g.quadraticCurveTo(446, 320, 470, 300); g.stroke(); g.beginPath(); g.arc(471, 298, 3, 0, TAU); g.fillStyle = INK; g.fill();
    g.fillStyle = 'rgba(255,120,60,.3)'; g.beginPath(); g.ellipse(396, 300, 12, 7, 0, 0, TAU); g.ellipse(490, 290, 10, 6, 0, 0, TAU); g.fill();
  }
  function red(g, T, L) {
    piece(g, T, 602, 288, 90, L.piece, 0);
    eyes(g, 600, 262, 1.05, false);
    g.strokeStyle = INK; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(568, 228); g.quadraticCurveTo(578, 220, 590, 228); g.moveTo(612, 226); g.quadraticCurveTo(624, 218, 634, 226); g.stroke();
    g.beginPath(); g.moveTo(574, 296); g.quadraticCurveTo(600, 300, 628, 292); g.quadraticCurveTo(622, 326, 600, 326); g.quadraticCurveTo(578, 324, 574, 296); g.closePath(); g.fillStyle = '#6a0a14'; g.fill();
    g.save(); g.clip(); g.fillStyle = '#ff8a9a'; g.beginPath(); g.ellipse(602, 328, 14, 9, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(572, 292, 60, 7); g.restore(); g.lineWidth = 3; g.stroke();
  }
  function words(g, T, L, cx, base, size) {
    var o = { spacing: size * 0.01, dark: INK, outline: size * 0.17, depth: size * 0.09, fat: size * 0.006, ring: L.rim, edge: function () { return '#c89a5a'; }, edgeW: size * 0.05,
      face: function () { return [0, '#ffffff', 0.5, '#fff4dc', 1, '#f0d6a8']; }, wave: function (j) { return [3, 1, 0, 0, 0, 0, 1, 3][j] * size / 80; } };
    T.word(g, 'CHECKERS', cx, base, size, o); T.gloss(g, 'CHECKERS', cx, base, size, o, 0.35);
  }
  var PX = 288, PY = 58, PW = 454, PH = 454;
  function icon(g, T, L, full, chars) {
    g.save(); if (full) { g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 30; g.shadowOffsetY = 10; } T.rr(g, PX, PY, PW, PH, 76); g.fillStyle = L.sky[2]; g.fill(); g.restore();
    g.save(); T.rr(g, PX, PY, PW, PH, 76); g.clip(); sky(g, T, L, PX, PY, PW, PH); path(g, T, L); bits(g, T, L, full); if (chars !== false) { gold(g, T, L); red(g, T, L); } g.restore();
    T.rr(g, PX + 2, PY + 2, PW - 4, PH - 4, 74); g.lineWidth = 4; g.strokeStyle = 'rgba(255,240,210,.55)'; g.stroke();
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, sh(L.sky[1], -0.3), 0.5, sh(L.sky[2], -0.45), 1, sh(L.sky[4], -0.2)]); g.fillRect(0, 0, 1024, 572); icon(g, T, L, true); words(g, T, L, 515, 470, 78); return; }
    if (kind === 'main') { g.translate(-278, -48); icon(g, T, L, px >= 220); words(g, T, L, 515, 470, 78); return; }
    if (kind === 'wide') { g.save(); g.translate(14, 6); g.scale(0.414, 0.414); g.translate(-PX, -PY); icon(g, T, L, false); g.restore(); words(g, T, L, 530, 140, 96); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.84, 0.84); g.translate(-515, -285); icon(g, T, L, false); if (px >= 90) words(g, T, L, 515, 470, 78); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO checkers END
