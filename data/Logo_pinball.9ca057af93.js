// 🏷️ LOGO pinball START — 🎯 Pinball, drawn in code from Aowu's picture (gl-27, round 9). A chrome ball smashing through glass in a gold + neon framed
// icon, a "JACKPOT!" marquee with bulbs, stars, coins and fireworks above it, chrome "PINBALL" (silver → blue → red, the arcade chrome look); the table's
// flippers, slingshots, lanes and arrows either side on `scene` + `main` only. Looks = Pinball.html DESIGNS (carnival · castle · space · sea · zombie ·
// sport · monster): table, icon and marquee colours.
GameLogos.add('pinball', (function () {
  var BOX = { scene: [1024, 572], main: [900, 540], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(bg, wall, edge) { return { bg: bg, wall: wall, edge: edge, icon: [sh0(bg[1], -0.55), '#04060e'] }; }
  function sh0(c, f) { return GameLogos.tools.shade(c, f); }
  var LOOK = { classic: { bg: ['#5a2ac8', '#12083a'], wall: '#2a2a8a', edge: '#3ad8ff', icon: ['#2a2a7a', '#08061e'] },
    carnival: mk(['#FFB86B', '#E8445A'], '#8E1238', '#FFD166'), castle: mk(['#3B2A7A', '#140C33'], '#6C5BB3', '#D9CCFF'), space: mk(['#1B1446', '#03030F'], '#0E6E8C', '#18E7FF'),
    sea: mk(['#14B4D6', '#062A57'], '#0B5E7A', '#7FF6FF'), zombie: mk(['#5A2E80', '#120A1F'], '#3E6B2A', '#B6FF5C'), sport: mk(['#45C463', '#1A6A30'], '#1F4FA8', '#FFFFFF'), monster: mk(['#3BC9A0', '#123B4A'], '#6B2FA8', '#FFD84D') };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var INK = '#05040c', PX = 262, PY = 34, PW = 502, PH = 502;
  /* ---------- the table either side ---------- */
  function table(g, T, L) {
    g.fillStyle = T.rad(g, 512, 300, 40, 640, [0, L.bg[0], 0.6, sh(L.bg[0], -0.25), 1, L.bg[1]]); g.beginPath(); g.moveTo(60, 60); g.lineTo(964, 60); g.lineTo(1024, 572); g.lineTo(0, 572); g.closePath(); g.fill();
    g.save(); g.globalAlpha = 0.5; [[160, 300, '#ff4fd8'], [860, 300, '#3ad8ff'], [130, 120, '#ffd23a'], [890, 110, '#7ae84a']].forEach(function (q) { g.fillStyle = T.rad(g, q[0], q[1], 4, 150, [0, q[2], 1, 'rgba(0,0,0,0)']); g.fillRect(q[0] - 150, q[1] - 150, 300, 300); }); g.restore();
    var LC = ['#ff5aa8', '#ffd23a', '#38d0ff', '#7ae84a', '#ff8a3a']; g.save(); [[96, 330, 0], [904, 330, 1]].forEach(function (b) { for (var i = 0; i < 6; i++) { var c = LC[(i + b[2]) % 5]; g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 10; g.beginPath(); g.arc(b[0] + (b[2] ? -i * 4 : i * 4), b[1] - i * 22, 6, 0, TAU); g.fill(); } }); g.restore();
    g.save(); g.strokeStyle = sh(L.wall, -0.3); g.lineWidth = 26; g.beginPath(); g.moveTo(70, 60); g.lineTo(10, 572); g.moveTo(954, 60); g.lineTo(1014, 572); g.stroke(); g.strokeStyle = L.edge; g.lineWidth = 4; g.shadowColor = L.edge; g.shadowBlur = 14; g.stroke(); g.beginPath(); g.moveTo(88, 60); g.lineTo(30, 572); g.moveTo(936, 60); g.lineTo(994, 572); g.strokeStyle = '#ff4fd8'; g.shadowColor = '#ff4fd8'; g.lineWidth = 3; g.stroke(); g.restore();
    function flipper(x, y, a, s) { g.save(); g.translate(x, y); g.rotate(a); g.scale(s, 1); g.beginPath(); g.arc(0, 0, 18, Math.PI / 2, Math.PI * 1.5); g.lineTo(96, -6); g.arc(96, 0, 6, -Math.PI / 2, Math.PI / 2); g.closePath(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
      g.fillStyle = T.lin(g, 0, -18, 0, 18, [0, '#fff2a0', 0.5, '#ffb01a', 1, '#c86a04']); g.fill(); g.beginPath(); g.arc(0, 0, 8, 0, TAU); g.fillStyle = '#c8ccd8'; g.fill(); g.restore(); }
    function sling(x, y, flip) { g.save(); g.translate(x, y); g.scale(flip, 1); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -96); g.lineTo(44, 4); g.closePath(); g.lineWidth = 8; g.strokeStyle = '#e8eef8'; g.lineJoin = 'round'; g.stroke(); g.fillStyle = T.lin(g, 0, -96, 0, 0, [0, '#ff5aa8', 1, '#8a2ad8']); g.fill(); g.fillStyle = '#ffd23a'; T.star(g, 14, -26, 13, 6); g.fill(); g.restore(); }
    function chev(x, y, a, c) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 10; for (var i = 0; i < 3; i++) { g.beginPath(); g.moveTo(i * 18, -10); g.lineTo(i * 18 + 12, 0); g.lineTo(i * 18, 10); g.lineTo(i * 18 + 6, 0); g.closePath(); g.fill(); } g.restore(); }
    function bumper(x, y, r, c) { g.save(); g.shadowColor = c; g.shadowBlur = 22; g.beginPath(); g.ellipse(x, y - 4, r + 4, r * 0.6 + 4, 0, 0, TAU); g.fillStyle = c; g.globalAlpha = 0.5; g.fill(); g.restore(); g.beginPath(); g.ellipse(x, y, r, r * 0.6, 0, 0, TAU); g.fillStyle = sh(c, -0.4); g.fill(); g.beginPath(); g.ellipse(x, y - 6, r, r * 0.6, 0, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.3, y - 10, 2, r, [0, '#fff', 0.4, c, 1, sh(c, -0.3)]); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); }
    sling(130, 400, 1); sling(894, 400, -1); flipper(160, 470, 0.45, 1); flipper(864, 470, Math.PI - 0.45, 1);
    chev(176, 238, -0.5, '#ff5aa8'); chev(190, 270, -0.5, '#ffd23a'); chev(810, 236, -2.6, '#5ad84a'); chev(800, 268, -2.6, '#38d0ff'); bumper(236, 140, 24, '#ff5a5a'); bumper(212, 190, 18, '#ffd23a'); bumper(790, 150, 22, '#5ad84a'); bumper(812, 200, 16, '#38d0ff'); bumper(250, 330, 16, '#ff5aa8'); bumper(776, 330, 16, '#ffd23a');
    g.save(); g.lineCap = 'round'; g.strokeStyle = '#ff5a3a'; g.lineWidth = 10; g.shadowColor = '#ff5a3a'; g.shadowBlur = 12; g.beginPath(); g.moveTo(820, 200); g.lineTo(846, 70); g.stroke(); g.beginPath(); g.moveTo(828, 70); g.lineTo(848, 50); g.lineTo(866, 76); g.stroke();
    g.strokeStyle = '#3a8aff'; g.shadowColor = '#3a8aff'; g.beginPath(); g.moveTo(870, 260); g.lineTo(876, 160); g.stroke(); g.beginPath(); g.moveTo(858, 170); g.lineTo(876, 150); g.lineTo(894, 172); g.stroke();
    g.strokeStyle = '#38d0ff'; g.shadowColor = '#38d0ff'; g.beginPath(); g.moveTo(170, 432); g.quadraticCurveTo(210, 420, 250, 426); g.stroke(); g.beginPath(); g.moveTo(236, 412); g.lineTo(254, 426); g.lineTo(236, 440); g.stroke(); g.restore();
    [[140, 200], [880, 240], [850, 340]].forEach(function (s) { g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], 20, 9); g.fill(); g.lineWidth = 3; g.strokeStyle = '#8a5a04'; g.stroke(); });
    [[118, 228], [802, 104], [70, 160], [950, 180], [210, 520], [820, 520]].forEach(function (p, i) { T.spark(g, p[0], p[1], 20 + (i % 2) * 10, ['#fff2a0', '#ffd0f4', '#c8f8ff'][i % 3], 1); });
    var rr = T.rng(44), CC = ['#ff5aa8', '#ffd23a', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff']; for (var q = 0; q < 26; q++) { var cx = r2(rr), cy = 80 + rr() * 470; g.save(); g.translate(cx, cy); g.rotate(rr() * TAU); g.fillStyle = CC[q % 6]; GameLogos.tools.rr(g, -6, -2.5, 12, 5, 2); g.fill(); g.restore(); }
    function r2(r) { var v = r(); return v < 0.5 ? 70 + v * 2 * 180 : 774 + (v - 0.5) * 2 * 180; }
  }
  /* ---------- the icon ---------- */
  function plate(g, T, L, glow) {
    g.save(); T.rr(g, PX, PY, PW, PH, 64); g.fillStyle = T.rad(g, 512, 280, 20, 360, [0, L.icon[0], 1, L.icon[1]]); if (glow) { g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; } g.fill(); g.restore();
  }
  function rim(g, T, L, glow) { g.save(); T.rr(g, PX - 8, PY - 8, PW + 16, PH + 16, 72); g.lineWidth = 5; g.strokeStyle = '#ff4fd8'; if (glow) { g.shadowColor = '#ff4fd8'; g.shadowBlur = 22; } g.stroke(); g.restore(); g.save(); T.rr(g, PX, PY, PW, PH, 64); g.lineWidth = 12; g.strokeStyle = T.lin(g, PX, PY, PX + PW, PY + PH, [0, '#ffe08a', 0.3, '#c8901a', 0.55, '#fff2c0', 1, '#c8901a']); g.stroke();
    T.rr(g, PX + 9, PY + 9, PW - 18, PH - 18, 56); g.lineWidth = 4; g.strokeStyle = L.edge; if (glow) { g.shadowColor = L.edge; g.shadowBlur = 16; } g.stroke(); g.restore(); }
  function burst(g, T, full) {
    g.save(); var RC = ['rgba(255,220,90,.42)', 'rgba(255,90,200,.34)', 'rgba(70,220,255,.34)', 'rgba(255,140,40,.42)', 'rgba(150,110,255,.3)'];
    for (var i = 0; i < 20; i++) { var a = i * TAU / 20 + 0.08, w = 0.07 + (i % 3) * 0.03; g.beginPath(); g.moveTo(522, 272); g.arc(522, 272, 330, a - w, a + w); g.closePath(); g.fillStyle = RC[i % 5]; g.fill(); }
    g.fillStyle = T.rad(g, 512, 285, 6, 230, [0, 'rgba(255,255,230,1)', 0.25, 'rgba(255,200,80,.95)', 0.5, 'rgba(255,110,40,.55)', 0.8, 'rgba(220,40,160,.25)', 1, 'rgba(120,40,255,0)']); g.beginPath(); g.arc(512, 285, 230, 0, TAU); g.fill();
    g.lineCap = 'round'; g.shadowColor = '#ffd23a'; g.shadowBlur = 16; [[292, 392, '#fff2a0', 9], [318, 362, '#ffb01a', 7], [346, 412, '#ff7ad8', 6], [306, 338, '#7af4ff', 5], [366, 380, '#ffd23a', 8]].forEach(function (p) {
      g.strokeStyle = T.lin(g, p[0], p[1], 470, 300, [0, 'rgba(255,255,255,0)', 1, p[2]]); g.lineWidth = p[3]; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(470, 300); g.stroke(); }); g.shadowBlur = 0;
    var r0 = T.rng(9), SC = ['#ffd23a', '#ff5aa8', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff', '#ffffff'];
    for (i = 0; i < (full ? 70 : 34); i++) { var aa = r0() * TAU, d = 90 + r0() * 170, x = 522 + Math.cos(aa) * d, y = 272 + Math.sin(aa) * d * 0.9; g.fillStyle = SC[i % 7]; g.shadowColor = SC[i % 7]; g.shadowBlur = 8; g.beginPath(); g.arc(x, y, 1.5 + r0() * 3.5, 0, TAU); g.fill(); }
    g.restore();
    // cracked glass: rays + rings of short segments
    var r = T.rng(27); g.save(); g.strokeStyle = 'rgba(200,245,255,.95)'; g.shadowColor = '#7af4ff'; g.shadowBlur = 6; g.lineWidth = 2.4;
    for (var i = 0; i < 18; i++) { var a = i * TAU / 18 + r() * 0.2, l0 = 80, l1 = 160 + r() * 90; g.beginPath(); g.moveTo(522 + Math.cos(a) * l0, 272 + Math.sin(a) * l0); var px = 522 + Math.cos(a) * l1, py = 272 + Math.sin(a) * l1; g.lineTo(px, py); g.stroke(); }
    [110, 150].forEach(function (R) { for (var j = 0; j < 18; j++) { var a0 = j * TAU / 18, a1 = a0 + TAU / 18; if (r() < 0.35) continue; g.beginPath(); g.moveTo(522 + Math.cos(a0) * R, 272 + Math.sin(a0) * R); g.lineTo(522 + Math.cos(a1) * (R + 8), 272 + Math.sin(a1) * (R + 8)); g.stroke(); } });
    for (i = 0; i < (full ? 26 : 12); i++) { var sx = 330 + r() * 380, sy = 140 + r() * 260; g.fillStyle = ['rgba(200,240,255,.9)', 'rgba(255,200,240,.85)', 'rgba(255,240,180,.9)'][i % 3]; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 6 + r() * 8, sy + r() * 6); g.lineTo(sx + r() * 4, sy + 8 + r() * 6); g.closePath(); g.fill(); }
    g.restore();
  }
  function ball(g, T) { var x = 522, y = 272, R = 74;
    g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 20; g.shadowOffsetY = 10; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = T.rad(g, x - 26, y - 30, 4, R * 1.1, [0, '#ffffff', 0.16, '#eef2fa', 0.42, '#9aa6bc', 0.7, '#3a4256', 0.9, '#141a28', 1, '#4a5a7a']); g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(x - 28, y - 34, 20, 11, -0.6, 0, TAU); g.fill(); g.fillStyle = 'rgba(160,200,255,.45)'; g.beginPath(); g.ellipse(x + 18, y + 40, 36, 12, -0.3, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(x, y, R, 0, TAU); g.clip(); g.globalAlpha = 0.35; [['#ff5aa8', 0.3], ['#38d0ff', 1.6], ['#ffd23a', 2.6]].forEach(function (q) { g.fillStyle = q[0]; g.beginPath(); g.ellipse(x + Math.cos(q[1]) * R * 0.6, y + Math.sin(q[1]) * R * 0.6, R * 0.5, R * 0.18, q[1] + 1.4, 0, TAU); g.fill(); }); g.restore();
    g.lineWidth = 3; g.strokeStyle = '#05060c'; g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke(); g.save(); g.lineWidth = 4; g.strokeStyle = 'rgba(255,240,180,.8)'; g.shadowColor = '#ffd23a'; g.shadowBlur = 20; g.beginPath(); g.arc(x, y, R + 3, Math.PI * 0.9, Math.PI * 1.6); g.stroke(); g.restore(); }
  function marquee(g, T, L, full) {
    if (full) { g.save(); g.lineCap = 'round'; [['#ff3a3a', -1.9], ['#ffd23a', -1.6], ['#ff5aa8', -1.3], ['#ffb01a', -1.1]].forEach(function (q, i) { g.strokeStyle = q[0]; g.lineWidth = 16; g.beginPath(); g.moveTo(512, 140); g.lineTo(512 + Math.cos(q[1]) * 110 - 30 + i * 10, 140 + Math.sin(q[1]) * 70); g.stroke(); }); g.restore();
      [[420, 84, 18], [600, 92, 18], [454, 70, 13], [636, 108, 14], [330, 70, 12], [700, 66, 12]].forEach(function (s, i) { g.fillStyle = ['#ffd23a', '#ff5aa8', '#38d0ff', '#7ae84a', '#ff8a3a', '#b86aff'][i]; T.star(g, s[0], s[1], s[2], s[2] * 0.45); g.fill(); g.lineWidth = 3; g.strokeStyle = '#a8300a'; g.stroke(); });
      [[466, 52], [566, 52], [688, 104], [668, 210], [340, 120], [320, 200], [700, 170], [512, 46]].forEach(function (c) { g.beginPath(); g.ellipse(c[0], c[1], 13, 15, 0, 0, TAU); g.fillStyle = T.lin(g, c[0] - 13, c[1] - 15, c[0] + 13, c[1] + 15, [0, '#fff2a0', 0.5, '#ffc21a', 1, '#c8800a']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#8a5a04'; g.stroke(); });
      g.save(); [[360, 128, 46], [664, 132, 42], [430, 64, 26], [600, 58, 24]].forEach(function (f, k) { for (var i = 0; i < 18; i++) { var a = i * TAU / 18; g.strokeStyle = [['#ffd23a', '#ff5aa8', '#fff'], ['#38d0ff', '#ffd23a', '#fff'], ['#7ae84a', '#ff8a3a', '#fff'], ['#b86aff', '#ff5aa8', '#fff']][k][i % 3]; g.lineWidth = 3; g.shadowColor = g.strokeStyle; g.shadowBlur = 8; g.beginPath(); g.moveTo(f[0] + Math.cos(a) * f[2] * 0.3, f[1] + Math.sin(a) * f[2] * 0.3); g.lineTo(f[0] + Math.cos(a) * f[2], f[1] + Math.sin(a) * f[2]); g.stroke(); } }); g.restore(); }   /* gl-r16d: the fireworks' white shadow no longer leaks onto JACKPOT */
    g.save(); g.beginPath(); g.moveTo(374, 140); g.lineTo(480, 140); g.lineTo(512, 112); g.lineTo(544, 140); g.lineTo(650, 140); g.lineTo(650, 200); g.lineTo(374, 200); g.closePath();
    g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); g.fillStyle = T.lin(g, 0, 112, 0, 200, [0, '#1c1c26', 1, '#050508']); g.fill(); g.lineWidth = 5; g.strokeStyle = '#ff2a3a'; g.shadowColor = 'rgba(255,42,58,.55)'; g.shadowBlur = 4; g.stroke();   /* gl-r16d: sign glow dimmed (Aowu 15:19) */ g.shadowBlur = 0;
    var pts = []; for (var i = 0; i <= 12; i++) pts.push([380 + i * 22.5, 146], [380 + i * 22.5, 194]); [[490, 132], [512, 118], [534, 132]].forEach(function (p) { pts.push(p); });
    pts.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 3.5, 0, TAU); g.fillStyle = '#f4e2a0'; g.shadowColor = 'rgba(255,210,58,.5)'; g.shadowBlur = 2; g.fill(); }); g.restore();
    var o = { spacing: 1.5, dark: '#3a0604', outline: 4.4, depth: 2.5, ring: '#fff2a0', glow: 'rgba(255,200,70,.16)', glowBlur: 0.1, face: function () { return [0, '#fffbe0', 0.45, '#ffd23a', 1, '#ff7a0a']; } };
    T.word(g, 'JACKPOT!', 512, 189, 47, o); T.gloss(g, 'JACKPOT!', 512, 189, 47, o, 0.45);
  }
  function word(g, T, L, cx, base, size, glow) {
    if (glow) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, cx, base - size * 0.35, 10, size * 2.6, [0, 'rgba(255,140,60,.45)', 0.5, 'rgba(255,60,160,.2)', 1, 'rgba(255,60,160,0)']); g.fillRect(cx - size * 3, base - size * 1.6, size * 6, size * 2.4); g.restore(); }
    var o = { clean: true, spacing: size * 0.01, dark: '#03050f', outline: size * 0.16,   /* gl-r19: clean B (no Fredoka notch) */
      depth: size * 0.08, fat: size * 0.004, ring: '#7af0ff', skew: -0.14, glow: glow ? 'rgba(60,200,255,.85)' : null, glowBlur: 0.3, glowN: 2,
      edge: function () { return '#0a1a4a'; }, edgeW: size * 0.04, face: function () { return [0, '#ffffff', 0.3, '#b8d8ff', 0.5, '#2a6ae0', 0.52, '#ff8a9a', 0.75, '#e8203a', 1, '#8a0a20']; } };
    T.word(g, 'PINBALL', cx, base, size, o); T.gloss(g, 'PINBALL', cx, base, size, o, 0.5);
  }
  function icon(g, T, L, full) { plate(g, T, L, full); g.save(); T.rr(g, PX, PY, PW, PH, 64); g.clip(); burst(g, T, full); ball(g, T); marquee(g, T, L, full); g.restore(); rim(g, T, L, full); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = '#05050c'; g.fillRect(0, 0, 1024, 572); table(g, T, L); icon(g, T, L, true); word(g, T, L, 514, 458, 112, true); return; }
    if (kind === 'main') { g.translate(-62, -16); g.save(); T.rr(g, 66, 40, 892, 506, 70); g.clip(); table(g, T, L); g.restore(); icon(g, T, L, px >= 300); word(g, T, L, 514, 458, 112, px >= 300); return; }
    if (kind === 'wide') { g.save(); g.translate(22, 14); g.scale(0.34, 0.34); g.translate(-PX, -PY); icon(g, T, L, false); g.restore(); word(g, T, L, 540, 140, 108, false); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.76, 0.76); g.translate(-513, -285); icon(g, T, L, false); if (px >= 90) word(g, T, L, 514, 458, 112, false); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO pinball END
