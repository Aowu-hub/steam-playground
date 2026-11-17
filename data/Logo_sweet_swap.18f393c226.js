// 🏷️ LOGO sweet-swap START — 🍬 Sweet Swap, drawn in code from Aowu's picture (gl-13, round 5). Every letter its own candy colour, sprinkles on the S,
// striped ball · heart · wrapped candy · star on top, two swap arrows, peppermints, sparkle comet. Looks = the game's board themes.
GameLogos.add('sweet-swap', (function () {
  var BOX = { scene: [1024, 572], main: [620, 470], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { bg: ['#6a2fb0', '#3a0f6e', '#1e0640'], dark: '#3a0c66', glow: '#ff6ad8', rim: '#ffffff',
    // per letter: top · middle · bottom (sampled from the picture)
    a: [['#ffd0f0', '#ff7ac8', '#e8389a'], ['#fff6a0', '#ffd23a', '#ff9a14'], ['#fffbb0', '#ffe84a', '#f0b414'], ['#ffe27a', '#ffb81a', '#ff7a12'], ['#ff9a8a', '#ff3a3a', '#d0101e']],
    b: [['#b8fbff', '#3ad8f5', '#1a8ae8'], ['#c8ffb0', '#5ae84a', '#1aa83a'], ['#f4ffa0', '#b8f03a', '#6ac81a'], ['#ffd88a', '#ff9a22', '#f0520e']],
    candy: ['#ff3a4a', '#3ab8ff', '#b84af5', '#ffd23a'], rim2: 'rgba(190,110,255,.9)' };
    for (var k in o) b[k] = o[k]; return b; }
  // the game's board themes (SweetSwap.html THEMES: board + tile colours) → background, outline, glow
  function th(board, t0, t1, dark, extra) { var o = { bg: [t1, board, dark], dark: dark, glow: t1 }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var LOOK = { classic: mk({}),
    sweets: th('#C2588F', '#FFE3F1', '#FFB8D9', '#5a1238'), blocks: th('#4B5AA8', '#E9F0FF', '#B9C8F5', '#1a2260'), animals: th('#5D8F3A', '#EAF8DC', '#B9E59A', '#1e3a10'),
    dino: th('#8A5A2B', '#FFF1D6', '#F2C98A', '#3a2008'), alien: th('#4B3A8A', '#E6E0FF', '#B8A8F2', '#1e1248'), vehicles: th('#2F6FA0', '#E3F4FF', '#A8D8F5', '#0e2a48'),
    space: th('#120C2E', '#1B1440', '#3A2A7A', '#05030f', { bg: ['#3A2A7A', '#1B1440', '#05030f'], glow: '#8a6aff' }) };
  /* ---------- candies (the picture's four, glossy) ---------- */
  function gloss(g, x, y, rx, ry, a) { g.save(); g.globalAlpha = a || 0.7; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, y, rx, ry, -0.5, 0, TAU); g.fill(); g.restore(); }
  function ball(g, T, x, y, r, c) {   // red + white striped ball
    g.save(); g.shadowColor = c; g.shadowBlur = r * 0.6; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.translate(x, y); g.rotate(-0.6); g.fillStyle = c; for (var i = -4; i <= 4; i++) { g.beginPath(); g.ellipse(i * r * 0.42, 0, r * 0.12, r * 1.3, 0, 0, TAU); g.fill(); } g.rotate(0.6); g.fillStyle = T.rad(g, -r * 0.3, -r * 0.4, r * 0.1, r * 1.2, [0, 'rgba(255,255,255,0)', 0.7, 'rgba(80,0,20,0)', 1, 'rgba(80,0,20,.45)']); g.fillRect(-r, -r, r * 2, r * 2); g.restore();
    gloss(g, x - r * 0.35, y - r * 0.45, r * 0.28, r * 0.14);
  }
  function heartPath(g, x, y, s) { g.beginPath(); g.moveTo(x, y + s * 0.62); g.bezierCurveTo(x - s * 1.15, y - s * 0.05, x - s * 0.62, y - s * 0.95, x, y - s * 0.38); g.bezierCurveTo(x + s * 0.62, y - s * 0.95, x + s * 1.15, y - s * 0.05, x, y + s * 0.62); g.closePath(); }
  function heart(g, T, x, y, s, c) { g.save(); g.shadowColor = c; g.shadowBlur = s * 0.6; heartPath(g, x, y, s); g.fillStyle = T.lin(g, 0, y - s, 0, y + s * 0.7, [0, '#c8f0ff', 0.4, c, 1, '#1a5ad0']); g.fill(); g.restore(); gloss(g, x - s * 0.4, y - s * 0.35, s * 0.22, s * 0.1, 0.8); }
  function wrapped(g, T, x, y, r, c) {   // purple wrapped candy with big twisted bows
    g.save(); g.translate(x, y); g.rotate(-0.35);
    [-1, 1].forEach(function (k) { g.save(); g.shadowColor = c; g.shadowBlur = r * 0.4; g.beginPath(); g.moveTo(k * r * 0.7, 0); g.quadraticCurveTo(k * r * 1.3, -r * 0.3, k * r * 1.9, -r * 0.85); g.quadraticCurveTo(k * r * 1.62, 0, k * r * 1.9, r * 0.85); g.quadraticCurveTo(k * r * 1.3, r * 0.3, k * r * 0.7, 0); g.closePath(); g.fillStyle = T.lin(g, 0, -r, 0, r, [0, '#ffb8ff', 0.5, '#d05af0', 1, '#7a1ac8']); g.fill(); g.restore();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(k * r * 1.0, -r * 0.1); g.lineTo(k * r * 1.7, -r * 0.6); g.stroke(); });
    g.save(); g.shadowColor = c; g.shadowBlur = r * 0.7; g.beginPath(); g.ellipse(0, 0, r, r * 0.9, 0, 0, TAU); g.fillStyle = T.rad(g, -r * 0.3, -r * 0.35, r * 0.1, r * 1.1, [0, '#ffd8ff', 0.35, '#d070ff', 0.7, c, 1, '#5a0aa0']); g.fill(); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = r * 0.08; for (var i = -1; i <= 1; i++) { g.beginPath(); g.arc(0, 0, r * (0.5 + i * 0.18), -2.4, -0.9); g.stroke(); } g.restore(); gloss(g, x - r * 0.3, y - r * 0.4, r * 0.3, r * 0.14, 0.85);
    var rr = T.rng(4); for (var q = 0; q < 6; q++) T.spark(g, x - r + rr() * r * 2, y - r * 0.8 + rr() * r * 1.4, 3 + rr() * 4, '#fff', 0.9);
  }
  function star(g, T, x, y, R, c) { g.save(); g.shadowColor = c; g.shadowBlur = R * 0.6; g.lineJoin = 'round'; T.star(g, x, y, R, R * 0.55, 5, -Math.PI / 2 + 0.12); g.lineWidth = R * 0.32; g.strokeStyle = '#ffc21a'; g.stroke(); g.fillStyle = T.lin(g, 0, y - R, 0, y + R, [0, '#fff8b0', 0.5, c, 1, '#ff9a14']); g.fill(); g.restore(); gloss(g, x - R * 0.25, y - R * 0.35, R * 0.22, R * 0.1); }
  function mint(g, T, x, y, r) { g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = r * 0.4; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.fillStyle = '#ff3a5a'; for (var i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, i * TAU / 6, i * TAU / 6 + TAU / 14); g.closePath(); g.fill(); } g.restore(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.lineWidth = r * 0.12; g.strokeStyle = 'rgba(120,20,60,.4)'; g.stroke(); gloss(g, x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.12, 0.8); }
  /* ---------- swap arrows: glowing neon tubes ---------- */
  function arrow(g, T, pts, c, c2, head) {
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    function path() { g.beginPath(); g.moveTo(pts[0], pts[1]); g.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); }
    g.shadowColor = c; g.shadowBlur = 22; path(); g.lineWidth = 16; g.strokeStyle = c; g.stroke(); g.shadowBlur = 0; path(); g.lineWidth = 7; g.strokeStyle = c2; g.stroke();
    var a = Math.atan2(pts[5] - pts[3], pts[4] - pts[2]); g.translate(pts[4], pts[5]); g.rotate(a); g.shadowColor = c; g.shadowBlur = 18; g.beginPath(); g.moveTo(head, 0); g.lineTo(-head * 0.6, -head * 0.85); g.lineTo(-head * 0.6, head * 0.85); g.closePath(); g.fillStyle = c; g.fill(); g.shadowBlur = 0; g.beginPath(); g.moveTo(head * 0.55, 0); g.lineTo(-head * 0.3, -head * 0.42); g.lineTo(-head * 0.3, head * 0.42); g.closePath(); g.fillStyle = c2; g.fill(); g.restore();
  }
  function comet(g, T) {   // the sparkle comet looping out of the words up to a star
    function path() { g.beginPath(); g.moveTo(690, 250); g.bezierCurveTo(860, 236, 930, 150, 870, 96); g.bezierCurveTo(830, 62, 760, 80, 742, 110); }
    g.save(); g.lineCap = 'round'; g.shadowColor = '#ff8ae8'; g.shadowBlur = 18; [[18, 'rgba(255,120,220,.25)'], [9, 'rgba(255,190,240,.5)'], [3.5, 'rgba(255,255,255,.85)']].forEach(function (w) { path(); g.lineWidth = w[0]; g.strokeStyle = w[1]; g.stroke(); }); g.restore();
    var r = T.rng(21); for (var q = 0; q < 44; q++) { var t = r(), u = 1 - t, x = u * u * u * 690 + 3 * u * u * t * 860 + 3 * u * t * t * 930 + t * t * t * 870 + (r() - 0.5) * 34, y = u * u * u * 250 + 3 * u * u * t * 236 + 3 * u * t * t * 150 + t * t * t * 96 + (r() - 0.5) * 34; T.spark(g, x, y, 2 + r() * 6, ['#fff', '#ffd2f4', '#a8e8ff', '#fff6a0'][q % 4], 0.6 + r() * 0.4); }
    g.save(); g.shadowColor = '#fff6a0'; g.shadowBlur = 24; T.star(g, 878, 74, 26, 9, 4, 0); g.fillStyle = '#fffbe0'; g.fill(); g.restore();
    [[812, 150, '#ffd23a'], [890, 190, '#3ab8ff'], [800, 214, '#ff5aa8'], [770, 92, '#7ae84a'], [840, 120, '#fff']].forEach(function (d, i) { g.save(); g.translate(d[0], d[1]); g.rotate(i); T.rr(g, -6, -3, 12, 6, 3); g.fillStyle = d[2]; g.fill(); g.restore(); });
    ball(g, T, 770, 74, 13, '#ff3a4a'); heart(g, T, 868, 182, 14, '#3ab8ff');
  }
  function burst(g, T, x, y, R, c) { g.save(); g.strokeStyle = c; g.lineCap = 'round'; g.shadowColor = c; g.shadowBlur = 10; for (var i = 0; i < 14; i++) { var a = i * TAU / 14, l = R * (i % 2 ? 0.6 : 1); g.beginPath(); g.moveTo(x + Math.cos(a) * R * 0.25, y + Math.sin(a) * R * 0.25); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.lineWidth = 2.5; g.stroke(); } g.restore(); T.spark(g, x, y, R * 0.35, '#fff', 1); }
  /* ---------- the words: every letter its own candy colour, one thick dark outline that joins them into a plate ---------- */
  function o(L, cols, size) { return { spacing: size * 0.005, dark: L.dark, outline: size * 0.21, depth: size * 0.08, fat: size * 0.006, ring: L.rim2, edge: function (j) { return GameLogos.tools.shade(cols[j % cols.length][2], -0.45); }, edgeW: size * 0.075, glow: L.glow, glowN: 1, glowBlur: 0.22, face: function (j) { var c = cols[j % cols.length]; return [0, c[0], 0.42, c[1], 1, c[2]]; } }; }
  function sprinkles(g, x, y, w, h) { var r = GameLogos.tools.rng(8), cols = ['#ff3a5a', '#3ab8ff', '#ffd23a', '#7ae84a', '#fff', '#b84af5']; for (var i = 0; i < 14; i++) { g.save(); g.translate(x + r() * w, y + r() * h); g.rotate(r() * TAU); GameLogos.tools.rr(g, -6, -2.2, 12, 4.4, 2.2); g.fillStyle = cols[i % cols.length]; g.fill(); g.restore(); } }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    var s1 = 178 * k, s2 = 160 * k, A = o(L, L.a, s1), B = o(L, L.b, s2);
    if (oneLine) {
      g.save(); g.font = '700 ' + s1 + 'px ' + T.FONT; var w1 = g.measureText('Sweet').width - 4 * s1 * 0.01; g.font = '700 ' + s2 + 'px ' + T.FONT; var w2 = g.measureText('Swap').width - 3 * s2 * 0.01; g.restore();
      var gap = 74 * k, x0 = cx - (w1 + gap + w2) / 2; T.word(g, 'Swap', x0 + w1 + gap + w2 / 2, y1, s2, B); T.gloss(g, 'Swap', x0 + w1 + gap + w2 / 2, y1, s2, B, 0.55); T.word(g, 'Sweet', x0 + w1 / 2, y1, s1, A); T.gloss(g, 'Sweet', x0 + w1 / 2, y1, s1, A, 0.55); return;
    }
    A.wave = function (j) { return [0, 4, 2, 0, -6][j] * k; }; A.rot = -0.03; B.wave = function (j) { return [0, 3, 2, -6][j] * k; };
    B.glowBlur = 0.3; T.word(g, 'Swap', cx + 6 * k, y2, s2, B); T.gloss(g, 'Swap', cx + 6 * k, y2, s2, B, 0.5);
    A.glow = null; T.word(g, 'Sweet', cx, y1, s1, A); T.gloss(g, 'Sweet', cx, y1, s1, A, 0.5);
    g.save(); g.translate(cx, y1); g.rotate(-0.03); g.translate(-cx, -y1); sprinkles(g, cx - 220 * k, y1 - 126 * k, 74 * k, 40 * k); g.restore();
  }
  function emblem(g, T, L, full) {
    if (full) comet(g, T);
    if (full) { burst(g, T, 250, 372, 40, '#ffd23a'); burst(g, T, 792, 318, 44, '#ffd23a'); }
    g.fillStyle = T.rad(g, 512, 330, 10, 300, [0, 'rgba(255,200,120,.75)', 0.45, 'rgba(255,120,190,.35)', 1, 'rgba(255,120,200,0)']); g.fillRect(200, 40, 640, 520);
    words(g, T, L, 512, 316, 446, 1);
    arrow(g, T, [318, 470, 240, 440, 288, 364], '#3ae0ff', '#e0fbff', 22); arrow(g, T, [716, 350, 804, 372, 750, 452], '#e05af0', '#ffe0fb', 22);
    mint(g, T, 504, 342, 18); mint(g, T, 600, 333, 16); mint(g, T, 436, 458, 18);
    ball(g, T, 414, 184, 48, L.candy[0]); heart(g, T, 504, 170, 80, L.candy[1]); wrapped(g, T, 600, 160, 42, L.candy[2]); star(g, T, 692, 128, 56, L.candy[3]);
    if (full) [[350, 150, 9], [560, 92, 7], [760, 380, 8], [272, 462, 7], [570, 480, 9]].forEach(function (s) { T.spark(g, s[0], s[1], s[2] * 1.6, '#fff', 0.95); });
  }
  function backdrop(g, T, L, x, y, w, h) {
    g.fillStyle = T.rad(g, x + w / 2, y + h * 0.48, 30, Math.max(w, h) * 0.7, [0, L.bg[0], 0.5, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h);
    var r = T.rng(13); g.save(); g.globalAlpha = 0.16; for (var i = 0; i < 16; i++) { var cx = x + r() * w, cy = y + r() * h, rr = 18 + r() * 26; if (Math.abs(cx - x - w / 2) < w * 0.3 && Math.abs(cy - y - h / 2) < h * 0.36) continue; [ball, mint][i % 2](g, T, cx, cy, rr, '#ff5a8a'); } g.restore();
    for (var q = 0; q < 50; q++) { g.globalAlpha = 0.35 + r() * 0.5; g.fillStyle = ['#ffb86a', '#ff8ad8', '#fff6a0'][q % 3]; g.beginPath(); g.arc(x + r() * w, y + r() * h, 1 + r() * 3, 0, TAU); g.fill(); } g.globalAlpha = 1;
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { backdrop(g, T, L, 0, 0, 1024, 572); g.fillStyle = T.rad(g, 512, 300, 10, 330, [0, 'rgba(255,170,120,.45)', 1, 'rgba(255,120,200,0)']); g.fillRect(0, 0, 1024, 572); emblem(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-206, -52); g.fillStyle = T.rad(g, 512, 320, 10, 300, [0, L.glow, 1, 'rgba(0,0,0,0)']); g.globalAlpha = 0.35; g.fillRect(206, 52, 620, 470); g.globalAlpha = 1; emblem(g, T, L, false); return; }
    if (kind === 'wide') { ball(g, T, 56, 72, 30, L.candy[0]); heart(g, T, 110, 74, 30, L.candy[1]); wrapped(g, T, 82, 130, 24, L.candy[2]); star(g, T, 146, 132, 30, L.candy[3]); words(g, T, L, 520, 146, 0, 0.62, true); return; }
    if (kind === 'badge') {
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.clip(); backdrop(g, T, L, 14, 14, 372, 372); g.restore();
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.lineWidth = 8; g.strokeStyle = T.lin(g, 0, 14, 0, 386, [0, '#ffd0f0', 0.5, L.glow, 1, L.dark]); g.shadowColor = L.glow; g.shadowBlur = 16; g.stroke(); g.restore();
      if (px >= 90) { g.translate(200, 214); g.scale(0.6, 0.6); g.translate(-512, -300); emblem(g, T, L, false); }
      else { ball(g, T, 150, 160, 70, L.candy[0]); heart(g, T, 262, 168, 76, L.candy[1]); wrapped(g, T, 168, 282, 56, L.candy[2]); star(g, T, 278, 284, 66, L.candy[3]); }
      return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO sweet-swap END
