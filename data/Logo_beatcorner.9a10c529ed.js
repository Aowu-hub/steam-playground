// 🏷️ LOGO beatcorner START — 🎵 BeatCorner, drawn in code from Aowu's picture (gl-28, round 11). A neon rounded-square stage icon: glowing beat
// discs flying to the corners with light trails, a keyboard, a drum kit, two guitars (our own shapes, no real models), a speaker and a mixer, a
// firework burst, music notes on a curling staff, up arrows, equaliser bars, a cheering crowd; "Beat" pink → orange + "Corner" cyan → green with a
// ▶ inside the o and a sound wave over "ner"; a gold disc swooping under the word; "×50" combo; the gold corner stage. Looks = BeatCorner.html
// THEMES (neon = classic · candy · space · jungle · robot · ocean): background, icon rim and the 4 disc colours.
GameLogos.add('beatcorner', (function () {
  var BOX = { scene: [1024, 572], main: [620, 600], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, IX = 236, IY = 22, IW = 556, IH = 528, ICX = 514, ICY = 286;
  function mk(bg, rim, d) { return { bg: bg, rim: rim, disc: d }; }
  var LOOK = { classic: mk(['#2a1868', '#0a0626'], ['#ff5ad8', '#9a6aff', '#3ae8ff', '#ffd23a'], ['#ff3a5a', '#3adf5a', '#3a8aff', '#ffd23a']),
    candy: mk(['#ff8ac8', '#7a1a5a'], ['#ff4d8d', '#ffb020', '#7a5cfa', '#4cb963'], ['#ff4d4d', '#ffb020', '#7a5cfa', '#4cb963']),
    space: mk(['#25285a', '#05061a'], ['#8ec5ff', '#c39bff', '#7cffcb', '#ffd84d'], ['#ffa94d', '#7cffcb', '#8ec5ff', '#c39bff']),
    jungle: mk(['#3a7a3a', '#0e2a12'], ['#f9a825', '#2e7d32', '#00897b', '#c2185b'], ['#c2185b', '#2e7d32', '#00897b', '#f9a825']),
    robot: mk(['#4a525e', '#14181e'], ['#3d8bfd', '#14b8a6', '#ff7a1a', '#facc15'], ['#e5484d', '#14b8a6', '#3d8bfd', '#facc15']),
    ocean: mk(['#1a7ab8', '#062a57'], ['#00b4d8', '#2a9d8f', '#f4a261', '#ff8fa3'], ['#ff8fa3', '#2a9d8f', '#0077b6', '#e9c46a']) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* ---------- the blurred concert stage behind the icon (scene only) ---------- */
  function stage(g, T, L) {
    g.fillStyle = T.lin(g, 0, 0, 0, 572, [0, '#0e1430', 0.55, '#1a1440', 1, '#06060e']); g.fillRect(0, 0, 1024, 572);
    g.save(); g.globalCompositeOperation = 'lighter';
    [[120, 130, '#3ab8ff'], [205, 150, '#3ab8ff'], [820, 140, '#3ab8ff'], [900, 120, '#3ab8ff']].forEach(function (s) { g.fillStyle = T.rad(g, s[0], s[1], 2, 60, [0, 'rgba(200,240,255,.9)', 0.3, 'rgba(80,170,255,.35)', 1, 'rgba(0,0,0,0)']); g.fillRect(s[0] - 60, s[1] - 60, 120, 120);
      g.fillStyle = T.lin(g, 0, s[1], 0, 520, [0, 'rgba(120,200,255,.22)', 1, 'rgba(0,0,0,0)']); g.beginPath(); g.moveTo(s[0] - 8, s[1]); g.lineTo(s[0] + 8, s[1]); g.lineTo(s[0] + 90, 520); g.lineTo(s[0] - 90, 520); g.closePath(); g.fill(); });
    g.restore();
    g.strokeStyle = 'rgba(70,80,110,.6)'; g.lineWidth = 6; [[70, 70, 70, 400], [230, 80, 230, 400], [800, 80, 800, 400], [960, 70, 960, 400], [60, 96, 240, 96], [790, 96, 970, 96]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    var r = T.rng(9); for (var i = 0; i < 26; i++) { var x = i < 13 ? 20 + i * 16 : 790 + (i - 13) * 16, hh = 30 + r() * 90; g.fillStyle = 'hsla(' + (i * 22) % 360 + ',90%,60%,.25)'; for (var y = 0; y < hh; y += 7) g.fillRect(x, 330 - y, 12, 5); }
    g.fillStyle = 'rgba(10,8,24,.85)'; crowd(g, T, 0, 1024, 470, 1.3, 3);
    g.save(); g.globalAlpha = 0.35; g.font = '700 54px ' + T.FONT; g.fillStyle = '#ff7ad8'; g.fillText('×50', 120, 260); g.restore();
    [[150, 300], [195, 300]].forEach(function (s) { g.globalAlpha = 0.35; g.fillStyle = '#ffd23a'; T.star(g, s[0], s[1], 18, 8); g.fill(); }); g.globalAlpha = 1;
  }
  function crowd(g, T, x0, x1, y, s, seed) {   // dark silhouettes with raised hands
    var r = T.rng(seed); for (var x = x0; x < x1; x += 22 * s + r() * 10 * s) { var h = (26 + r() * 18) * s, hx = x + r() * 6;
      g.beginPath(); g.arc(hx, y - h, 8 * s, 0, TAU); g.fill(); g.beginPath(); g.ellipse(hx, y - h * 0.35, 12 * s, h * 0.6, 0, 0, TAU); g.fill();
      if (r() < 0.6) { var a = r() < 0.5 ? -1 : 1; g.beginPath(); g.moveTo(hx + a * 6 * s, y - h * 0.7); g.lineTo(hx + a * (14 + r() * 8) * s, y - h - (14 + r() * 14) * s); g.lineWidth = 5 * s; g.strokeStyle = g.fillStyle; g.lineCap = 'round'; g.stroke(); } }
  }
  /* ---------- the icon ---------- */
  function shape(g, T) { T.rr(g, IX, IY, IW, IH, 70); }
  function rim(g, T, L) {
    g.save(); shape(g, T); g.shadowColor = L.rim[0]; g.shadowBlur = 26; g.lineWidth = 16; g.strokeStyle = T.lin(g, IX, IY, IX + IW, IY + IH, [0, L.rim[0], 0.35, L.rim[1], 0.65, L.rim[2], 1, L.rim[3]]); g.stroke(); g.shadowBlur = 0;
    g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.75)'; T.rr(g, IX + 5, IY + 5, IW - 10, IH - 10, 65); g.stroke(); g.lineWidth = 3; g.strokeStyle = '#120a2a'; T.rr(g, IX + 11, IY + 11, IW - 22, IH - 22, 60); g.stroke(); g.restore();
  }
  function inside(g, T, L, full) {
    g.fillStyle = T.rad(g, 480, 220, 20, 420, [0, sh(L.bg[0], 0.15), 0.6, L.bg[0], 1, L.bg[1]]); g.fillRect(IX, IY, IW, IH);
    // equaliser bars round the edges
    var r = T.rng(4); for (var i = 0; i < 36; i++) { var x = IX + 20 + i * 15, hh = 20 + Math.abs(Math.sin(i * 0.7)) * 70 + r() * 30, top = i < 7 || i > 28; if (!top && !full) continue;
      for (var y = 0; y < hh; y += 7) { g.fillStyle = 'hsla(' + ((i * 14 + y) % 360) + ',95%,62%,' + (0.18 + 0.4 * (1 - y / hh)) + ')'; g.fillRect(x, 300 - y, 11, 5); } }
    for (i = 0; i < 18; i++) { var bx = 520 + i * 15, bh = 14 + Math.abs(Math.sin(i * 0.9 + 1)) * 40; for (y = 0; y < bh; y += 7) { g.fillStyle = 'hsla(' + (280 + i * 8) % 360 + ',90%,65%,.45)'; g.fillRect(bx, 520 - y, 11, 5); } }
    T.mystic(g, IX, IY, IW, 280, { seed: 8, stars: full ? 40 : 16 });
    // spotlight burst behind the keyboard + firework
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 430, 200, 4, 170, [0, 'rgba(255,240,180,.9)', 0.25, 'rgba(255,170,80,.35)', 1, 'rgba(0,0,0,0)']); g.fillRect(250, 30, 360, 340);
    var rr = T.rng(12); for (i = 0; i < (full ? 46 : 22); i++) { var a = -Math.PI / 2 + (rr() - 0.5) * 2.6, len = 60 + rr() * 110, x0 = 430, y0 = 200; g.strokeStyle = ['#ffe28a', '#ffb43a', '#fff4c8', '#ff8ad8'][i % 4]; g.lineWidth = 1.4 + rr() * 1.6; g.globalAlpha = 0.5 + rr() * 0.5; g.beginPath(); g.moveTo(x0 + Math.cos(a) * len * 0.35, y0 + Math.sin(a) * len * 0.35); g.lineTo(x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); g.stroke(); }
    g.restore(); g.globalAlpha = 1;
    // crowd in the middle band + front
    g.fillStyle = 'rgba(30,14,60,.92)'; crowd(g, T, IX + 10, IX + IW - 10, 290, 1, 7);
    if (full) { notes(g, T); arrows(g, T); }
    [[384, 72, 20, '#ffd23a'], [420, 94, 14, '#ffe08a'], [600, 176, 17, '#ffd23a'], [640, 150, 13, '#ffe08a'], [668, 132, 15, '#ffd23a'], [356, 120, 11, '#ffe08a']].forEach(function (s, i) { if (!full && i > 2) return; g.fillStyle = s[3]; g.strokeStyle = '#7a3a00'; g.lineWidth = 1.5; T.star(g, s[0], s[1], s[2], s[2] * 0.45); g.fill(); g.stroke(); });
    speaker(g, T, 296, 236); guitar(g, T, 460, 112, 0.42, '#d8342a', 1); drums(g, T, L, 590, 230); guitar(g, T, 690, 180, -0.5, '#f0a030', 0.9); if (full) mixer(g, T, 700, 262);
    keyboard(g, T, 340, 222);
    g.fillStyle = 'rgba(16,8,36,.95)'; crowd(g, T, IX + 6, IX + IW - 6, 548, 1.15, 13);
    corner(g, T, L);
  }
  function notes(g, T) {
    g.save(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.35)'; for (var k = 0; k < 4; k++) { g.beginPath(); g.moveTo(520, 140 + k * 7); g.bezierCurveTo(580, 80 + k * 7, 620, 130 + k * 7, 700, 60 + k * 7); g.stroke(); }
    [[548, 112, '#ff7ad8'], [578, 98, '#ffd23a'], [606, 104, '#3ae8ff'], [636, 84, '#7aff6a'], [664, 70, '#c87aff'], [652, 46, '#ff5ad8']].forEach(function (n, i) { g.fillStyle = n[2]; g.strokeStyle = n[2]; g.shadowColor = n[2]; g.shadowBlur = 8; g.beginPath(); g.ellipse(n[0], n[1], 7, 5.2, -0.4, 0, TAU); g.fill(); g.lineWidth = 2.4; g.beginPath(); g.moveTo(n[0] + 6, n[1] - 1); g.lineTo(n[0] + 6, n[1] - 26); g.quadraticCurveTo(n[0] + 14, n[1] - 20, n[0] + 16, n[1] - 12); g.stroke(); });
    g.shadowBlur = 0; g.restore();
  }
  function arrows(g, T) {
    [[620, 200, 760, 96, '#3ae8ff'], [640, 250, 750, 150, '#ff6ad8']].forEach(function (a) { g.save(); g.lineCap = 'round'; g.shadowColor = a[4]; g.shadowBlur = 12; g.strokeStyle = a[4]; g.lineWidth = 9; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[2], a[3]); g.stroke();
      var an = Math.atan2(a[3] - a[1], a[2] - a[0]); g.translate(a[2], a[3]); g.rotate(an); g.fillStyle = a[4]; g.beginPath(); g.moveTo(14, 0); g.lineTo(-12, -14); g.lineTo(-12, 14); g.closePath(); g.fill(); g.restore(); });
  }
  function speaker(g, T, x, y) {
    g.save(); g.translate(x, y); g.rotate(-0.08); T.rr(g, -24, -40, 48, 80, 6); g.fillStyle = T.lin(g, -24, 0, 24, 0, [0, '#4a4a5a', 1, '#1a1a24']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#0a0a12'; g.stroke();
    [[0, -18, 11], [0, 16, 15]].forEach(function (c) { g.fillStyle = '#0c0c14'; g.beginPath(); g.arc(c[0], c[1], c[2], 0, TAU); g.fill(); g.strokeStyle = '#6a6a7a'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#3a3a48'; g.beginPath(); g.arc(c[0], c[1], c[2] * 0.4, 0, TAU); g.fill(); }); g.restore();
  }
  function keyboard(g, T, x, y) {   // tilted synth: dark body, white + black keys, knobs + a small screen
    g.save(); g.translate(x, y); g.transform(1, -0.22, 0.42, 1, 0, 0);
    T.rr(g, 0, 0, 180, 62, 6); g.fillStyle = T.lin(g, 0, 0, 0, 62, [0, '#4a4a58', 1, '#16161e']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#08080e'; g.stroke();
    g.fillStyle = '#3ae8ff'; g.fillRect(12, 6, 34, 10); [60, 76, 92, 108].forEach(function (k) { g.fillStyle = '#c8c8d8'; g.beginPath(); g.arc(k, 11, 4, 0, TAU); g.fill(); }); g.fillStyle = '#ff5ad8'; g.fillRect(130, 6, 38, 6);
    for (var i = 0; i < 17; i++) { g.fillStyle = '#f8f8ff'; g.fillRect(8 + i * 9.8, 22, 8.6, 34); }
    for (i = 0; i < 16; i++) { if ([2, 6, 9, 13].indexOf(i % 14) >= 0) continue; g.fillStyle = '#14141c'; g.fillRect(13.5 + i * 9.8, 22, 5.6, 20); }
    g.restore();
  }
  function guitar(g, T, x, y, rot, col, s) {   // our own electric guitar: body, neck, head, strings
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    g.fillStyle = '#5a3a1a'; g.fillRect(-4, -96, 8, 100); g.fillStyle = '#2a1a0a'; T.rr(g, -7, -118, 14, 24, 4); g.fill(); g.fillStyle = '#e8e8f0'; [-110, -103, -96].forEach(function (k) { g.beginPath(); g.arc(-9, k, 2.4, 0, TAU); g.arc(9, k, 2.4, 0, TAU); g.fill(); });
    g.beginPath(); g.moveTo(0, -6); g.bezierCurveTo(-30, -14, -34, 18, -22, 28); g.bezierCurveTo(-30, 46, -10, 62, 0, 56); g.bezierCurveTo(18, 64, 34, 44, 24, 26); g.bezierCurveTo(32, 14, 22, -16, 0, -6); g.closePath();
    g.fillStyle = T.lin(g, -30, -10, 30, 60, [0, sh(col, 0.35), 0.5, col, 1, sh(col, -0.4)]); g.fill(); g.lineWidth = 3; g.strokeStyle = '#1a0a08'; g.stroke();
    g.fillStyle = '#f4f0e0'; g.beginPath(); g.ellipse(-2, 28, 12, 18, 0.3, 0, TAU); g.fill(); g.fillStyle = '#2a2a30'; g.fillRect(-8, 22, 16, 4); g.fillRect(-8, 34, 16, 4);
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 0.8; [-2, 0, 2].forEach(function (d) { g.beginPath(); g.moveTo(d, -96); g.lineTo(d, 44); g.stroke(); }); g.restore();
  }
  function drums(g, T, L, x, y) {
    function drum(cx, cy, rx, ry, h, col) { g.fillStyle = T.lin(g, cx - rx, 0, cx + rx, 0, [0, sh(col, -0.3), 0.4, sh(col, 0.25), 1, sh(col, -0.5)]); g.beginPath(); g.ellipse(cx, cy + h, rx, ry, 0, 0, Math.PI); g.lineTo(cx - rx, cy); g.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = '#1a0608'; g.stroke();
      g.fillStyle = '#f4f4fa'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.fill(); g.stroke(); g.strokeStyle = '#d8d8e0'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(cx, cy + h, rx, ry, 0, 0, Math.PI); g.stroke(); }
    function cymbal(cx, cy, r) { g.strokeStyle = '#8a8a90'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (cx < x ? 8 : -8), cy + 70); g.stroke(); g.fillStyle = T.lin(g, cx - r, cy, cx + r, cy, [0, '#a8781a', 0.5, '#ffe08a', 1, '#a8781a']); g.beginPath(); g.ellipse(cx, cy, r, r * 0.26, -0.08, 0, TAU); g.fill(); g.strokeStyle = '#6a4a0a'; g.lineWidth = 1.5; g.stroke(); }
    cymbal(x - 58, y - 62, 34); cymbal(x + 56, y - 52, 32);
    drum(x - 28, y - 40, 22, 8, 22, '#d8342a'); drum(x + 22, y - 36, 22, 8, 22, '#d8342a'); drum(x + 58, y - 6, 18, 7, 26, '#d8342a');
    g.fillStyle = T.lin(g, x - 40, 0, x + 40, 0, [0, '#8a1a1a', 0.5, '#e84a3a', 1, '#6a0a0a']); g.beginPath(); g.ellipse(x - 6, y + 22, 36, 38, 0, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = '#1a0608'; g.stroke();
    g.fillStyle = '#f8f4ec'; g.beginPath(); g.ellipse(x, y + 22, 28, 32, 0, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = '#d8d8e0'; g.stroke(); g.fillStyle = '#1a1a24'; g.beginPath(); g.arc(x + 2, y + 24, 8, 0, TAU); g.fill();
  }
  function mixer(g, T, x, y) { g.save(); g.translate(x, y); g.rotate(-0.12); T.rr(g, -26, -16, 52, 34, 5); g.fillStyle = '#2a2a36'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#0a0a10'; g.stroke(); for (var i = 0; i < 4; i++) { g.fillStyle = ['#3ae8ff', '#ffd23a', '#ff5ad8', '#7aff6a'][i]; g.fillRect(-20 + i * 11, -10, 6, 4); g.fillStyle = '#c8c8d0'; g.fillRect(-18 + i * 11, -2, 2, 14); g.fillRect(-20 + i * 11, 2 + (i % 2) * 5, 6, 3); } g.restore(); }
  function disc(g, T, x, y, r, col, trail) {   // a glowing beat button with a light trail behind it
    g.save(); if (trail) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = T.lin(g, x, y, x + trail[0], y + trail[1], [0, col, 1, 'rgba(0,0,0,0)']); g.lineCap = 'round'; g.lineWidth = r * 1.3; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x, y); g.lineTo(x + trail[0], y + trail[1]); g.stroke(); g.lineWidth = r * 0.5; g.globalAlpha = 0.8; g.strokeStyle = T.lin(g, x, y, x + trail[0], y + trail[1], [0, 'rgba(255,255,255,.9)', 1, 'rgba(255,255,255,0)']); g.stroke(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    g.shadowColor = col; g.shadowBlur = r * 0.9; g.fillStyle = sh(col, -0.45); g.beginPath(); g.ellipse(x, y + r * 0.22, r, r * 0.62, 0, 0, TAU); g.fill(); g.shadowBlur = 0;
    g.fillStyle = T.rad(g, x - r * 0.3, y - r * 0.2, 1, r, [0, sh(col, 0.6), 0.5, col, 1, sh(col, -0.25)]); g.beginPath(); g.ellipse(x, y, r, r * 0.62, 0, 0, TAU); g.fill(); g.lineWidth = Math.max(1.5, r * 0.1); g.strokeStyle = sh(col, 0.7); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(x - r * 0.25, y - r * 0.22, r * 0.4, r * 0.14, -0.2, 0, TAU); g.fill(); g.restore();
  }
  function corner(g, T, L) {   // the gold corner stage at the bottom (a V)
    g.save(); g.lineJoin = 'round'; g.beginPath(); g.moveTo(360, 448); g.lineTo(514, 520); g.lineTo(668, 448); g.lineTo(650, 440); g.lineTo(514, 500); g.lineTo(378, 440); g.closePath();
    g.fillStyle = T.lin(g, 0, 440, 0, 520, [0, '#fff2a0', 0.5, '#f0b030', 1, '#8a5a08']); g.shadowColor = '#ffc83a'; g.shadowBlur = 14; g.fill(); g.restore();
  }
  function discs(g, T, L, full) {
    var D = L.disc; disc(g, T, 340, 100, 24, D[0], [60, 70]); disc(g, T, 312, 160, 22, D[1], [70, 34]);
    disc(g, T, 398, 228, 20, D[2], [40, -14]); disc(g, T, 508, 280, 22, D[1], [-20, -60]);
    disc(g, T, 340, 474, 24, D[0], [80, -40]); disc(g, T, 430, 476, 20, D[2], [50, -60]);
  }
  function word(g, T, L, cx, base, sizeMax, maxW, glow) {
    var P = [['#ffd0f4', '#ff4ad8', '#c01a9a'], ['#ffd8f0', '#ff5ab8', '#c02a7a'], ['#ffe0d0', '#ff7a8a', '#d0384a'], ['#fff0c0', '#ffa03a', '#d0600a'],
      ['#d8fcff', '#3ae8ff', '#0a8ab8'], ['#d0f4ff', '#3abaff', '#0a62c8'], ['#d8e4ff', '#4a8aff', '#1a3ac8'], ['#c8fff0', '#2adcb0', '#0a8a6a'], ['#d8ffd0', '#5aea4a', '#1a9a2a'], ['#f8ffc0', '#c8ec2a', '#6a9a0a']];
    g.save(); g.font = '700 100px ' + T.FONT; var w100 = g.measureText('BeatCorner').width; g.restore();
    var size = Math.min(sizeMax, maxW * 100 / w100);
    var o = { clean: true, spacing: 0, dark: '#14082e', outline: size * 0.2, depth: size * 0.08, fat: size * 0.006, ring: 'rgba(255,255,255,.95)', edge: function (j) { return sh(P[j][2], -0.35); }, edgeW: size * 0.07,
      glow: glow ? 'rgba(200,120,255,.9)' : null, glowN: 2, glowBlur: 0.3, rot: -0.03, wave: function (j) { return [3, 1, 0, 0, -1, -2, -2, -1, 0, 1][j] * size / 80; }, face: function (j) { return [0, P[j][0], 0.45, P[j][1], 1, P[j][2]]; } };
    var W = T.word(g, 'BeatCorner', cx, base, size, o); T.gloss(g, 'BeatCorner', cx, base, size, o, 0.5);
    // ▶ inside the o of Corner, and the sound wave over "ner"
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var xo = cx - W / 2 + g.measureText('BeatC').width + g.measureText('o').width / 2, xn = cx - W / 2 + g.measureText('BeatCor').width, wn = g.measureText('ner').width; g.restore();
    g.save(); g.translate(cx, base); g.rotate(-0.03); g.translate(-cx, -base);
    var oy = base - size * 0.26 + o.wave(5) ; g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(xo - size * 0.07, oy - size * 0.1); g.lineTo(xo + size * 0.1, oy); g.lineTo(xo - size * 0.07, oy + size * 0.1); g.closePath(); g.fill(); g.fillStyle = '#ff5ad8'; g.beginPath(); g.moveTo(xo - size * 0.05, oy - size * 0.065); g.lineTo(xo + size * 0.06, oy); g.lineTo(xo - size * 0.05, oy + size * 0.065); g.closePath(); g.fill();
    if (glow !== 'small') { g.shadowColor = '#3ae8ff'; g.shadowBlur = 8; for (var i = 0; i < 18; i++) { var h = (0.08 + Math.abs(Math.sin(i * 0.9)) * 0.28 * (1 - Math.abs(i - 9) / 11)) * size; g.fillStyle = 'hsl(' + (190 + i * 6) + ',100%,65%)'; g.fillRect(xn + i * wn / 18, base - size * 0.92 - h, wn / 30, h); } }
    g.restore(); return W;
  }
  function swoop(g, T, full) {   // gold disc swooping under the word
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.strokeStyle = T.lin(g, 470, 420, 640, 400, [0, 'rgba(255,220,90,.9)', 1, 'rgba(255,220,90,0)']); g.lineWidth = 10; g.beginPath(); g.moveTo(476, 418); g.quadraticCurveTo(560, 450, 640, 404); g.stroke(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.8)'; g.stroke(); g.restore();
    disc(g, T, 476, 418, 18, '#ffc83a', null);
  }
  function combo(g, T) { T.word(g, '×50', 692, 470, 54, { dark: '#14082e', outline: 10, depth: 4, ring: 'rgba(255,255,255,.95)', glow: 'rgba(255,120,220,.9)', glowBlur: 0.3, face: function (j) { return [0, '#ffe0f8', 0.5, ['#ff5ad8', '#ffd23a', '#ffd23a'][j], 1, '#c03a9a']; } }); }
  function icon(g, T, L, full) {
    g.save(); shape(g, T); g.clip(); inside(g, T, L, full); discs(g, T, L, full); if (full) { swoop(g, T); combo(g, T); } g.restore(); rim(g, T, L);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { stage(g, T, L); icon(g, T, L, true); word(g, T, L, 520, 384, 96, 470, true); return; }
    if (kind === 'main') { var f = px >= 300; g.translate(-206, 6); icon(g, T, L, f); word(g, T, L, 520, 384, 96, 470, f); return; }
    if (kind === 'wide') { g.save(); g.translate(24, 12); g.scale(0.33, 0.33); g.translate(-IX, -IY); icon(g, T, L, false); g.restore(); word(g, T, L, 540, 138, 110, 640, 'small'); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.7, 0.7); g.translate(-ICX, -ICY); icon(g, T, L, false); if (px >= 90) word(g, T, L, 514, 386, 96, 470, false); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO beatcorner END
