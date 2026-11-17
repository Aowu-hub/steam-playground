// 🏷️ LOGO geoscout START — 🔢 GeoScout, drawn in code from Aowu's picture (gl-18, round 6). Cream rounded icon, a globe with a map pin and leaves,
// stacks of OUR OWN counting blocks (smooth cubes, no studs — the picture's studded bricks look like a toy brand's) marked 10 · 100 · 1000 with sprouts,
// a smiling top block, floating 1 2 3 5 10, compass, backpack, magnifying glass, a winding path with pines; "Geo" green → blue + "Scout" orange → gold.
// Looks = the game's house themes (GeoScout.html THEMES: sky top / bottom + ground → the icon's backdrop, rim and path).
GameLogos.add('geoscout', (function () {
  var BOX = { scene: [1024, 572], main: [460, 470], wide: [860, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { plate: ['#fffaf0', '#fbefd8', '#f2dfbc'], rim: '#e8d2a8', path: '#e9d79a', grass: '#8cc858', dark: '#123060',
    g: [['#a8f070', '#4ac83a', '#1a9a3a'], ['#8ae8a8', '#2ac88a', '#12a07a'], ['#7ad8ff', '#2a9aff', '#1a5ae0']],
    s: [['#ffc08a', '#ff8a2e', '#f05a12'], ['#ffb87a', '#ff7a2a', '#e8500e'], ['#ffa07a', '#ff6a3a', '#e0401a'], ['#ffe07a', '#ffb81a', '#f08a0a'], ['#fff08a', '#ffd23a', '#f0a80a']] };
    for (var k in o) b[k] = o[k]; return b; }
  function th(t, extra) { var o = { plate: [t.bot, t.top, t.top], rim: t.sw, path: t.ground, grass: t.grass }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var LOOK = { classic: mk({}),
    dino: th({ top: '#2E5A2F', bot: '#7FB04A', ground: '#8B6A43', grass: '#5E8F33', sw: '#7FB04A' }), sea: th({ top: '#0A3D6B', bot: '#2A8FC2', ground: '#E2C58A', grass: '#D2B070', sw: '#2A8FC2' }),
    disco: th({ top: '#1B0533', bot: '#5A1A7E', ground: '#2A0B45', grass: '#3D1260', sw: '#9B2BD1' }), robot: th({ top: '#102534', bot: '#2D4E66', ground: '#3B4D60', grass: '#4A6075', sw: '#2D4E66' }),
    space: th({ top: '#05061F', bot: '#232070', ground: '#6B6F86', grass: '#80849C', sw: '#232070' }), sky: th({ top: '#4FA3E0', bot: '#CDEBFF', ground: '#FFFFFF', grass: '#EAF4FF', sw: '#4FA3E0' }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* our own counting block: a smooth bevelled cube in 2.5D (front + top + side), optional label on the front */
  function cube(g, T, x, y, w, h, c, label, face) {
    var d = w * 0.28;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + d, y - d * 0.7); g.lineTo(x + w + d, y - d * 0.7); g.lineTo(x + w, y); g.closePath(); g.fillStyle = sh(c, 0.35); g.fill();
    g.beginPath(); g.moveTo(x + w, y); g.lineTo(x + w + d, y - d * 0.7); g.lineTo(x + w + d, y + h - d * 0.7); g.lineTo(x + w, y + h); g.closePath(); g.fillStyle = sh(c, -0.3); g.fill();
    T.rr(g, x, y, w, h, w * 0.08); g.fillStyle = T.lin(g, 0, y, 0, y + h, [0, sh(c, 0.12), 1, sh(c, -0.12)]); g.fill();
    g.lineWidth = 2; g.strokeStyle = sh(c, -0.45); g.lineJoin = 'round'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.35)'; T.rr(g, x + w * 0.08, y + h * 0.1, w * 0.18, h * 0.5, w * 0.06); g.fill();
    if (label) { var fs = Math.min(h * 0.5, w * 1.6 / label.length); g.font = '700 ' + fs + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = sh(c, -0.55); g.fillText(label, x + w / 2, y + h * 0.54); }
    if (face) { g.fillStyle = '#123060'; g.beginPath(); g.arc(x + w * 0.36, y + h * 0.42, w * 0.06, 0, TAU); g.arc(x + w * 0.64, y + h * 0.42, w * 0.06, 0, TAU); g.fill(); g.beginPath(); g.arc(x + w * 0.5, y + h * 0.55, w * 0.14, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = 2.5; g.strokeStyle = '#123060'; g.stroke(); }
  }
  function sprout(g, x, y, s) { g.save(); g.strokeStyle = '#3a8a2a'; g.lineWidth = 3 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 2 * s, y - 10 * s, x, y - 16 * s); g.stroke();
    g.fillStyle = '#5ac83a'; [[-1, -0.6], [1, 0.6]].forEach(function (k) { g.beginPath(); g.ellipse(x + k[0] * 9 * s, y - 16 * s, 10 * s, 5 * s, k[1], 0, TAU); g.fill(); }); g.restore(); }
  function leaf(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(0, -s * 0.7, s, 0); g.quadraticCurveTo(0, s * 0.7, -s, 0); g.fillStyle = '#4ab83a'; g.fill(); g.strokeStyle = '#2a7a2a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-s * 0.8, 0); g.lineTo(s * 0.8, 0); g.stroke(); g.restore(); }
  function globe(g, T, x, y, r) {
    g.save(); g.shadowColor = 'rgba(60,120,200,.4)'; g.shadowBlur = 16; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.35, y - r * 0.35, r * 0.1, r * 1.1, [0, '#9ae4ff', 0.55, '#3aa0e8', 1, '#1a5ab8']); g.fill(); g.restore();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.fillStyle = '#5ac84a';   // our own land shapes
    // continents = ragged outlines (our own shapes, seeded), each made of many small lumps
    var rr = T.rng(5); [[-0.45, -0.3, 0.36, 9], [-0.15, 0.35, 0.28, 8], [0.42, -0.2, 0.3, 8], [0.55, 0.45, 0.16, 5], [-0.8, 0.25, 0.12, 4]].forEach(function (c) { for (var i = 0; i < c[3] * 3; i++) { var a = rr() * TAU, d = rr() * c[2] * r * 0.8; g.beginPath(); g.ellipse(x + c[0] * r + Math.cos(a) * d, y + c[1] * r + Math.sin(a) * d * 0.8, c[2] * r * (0.25 + rr() * 0.3), c[2] * r * (0.18 + rr() * 0.22), rr() * 3, 0, TAU); g.fill(); } });
    g.fillStyle = 'rgba(30,110,40,.35)'; g.beginPath(); g.ellipse(x - 0.38 * r, y - 0.3 * r, 0.25 * r, 0.12 * r, 0.4, 0, TAU); g.fill();
    g.fillStyle = T.rad(g, x - r * 0.4, y - r * 0.45, 2, r, [0, 'rgba(255,255,255,.45)', 1, 'rgba(255,255,255,0)']); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.lineWidth = 3; g.strokeStyle = '#1a4a9a'; g.stroke();
  }
  function pin(g, T, x, y, s) { g.save(); g.beginPath(); g.moveTo(x, y + s * 1.2); g.bezierCurveTo(x - s * 1.1, y + s * 0.1, x - s * 0.9, y - s, x, y - s); g.bezierCurveTo(x + s * 0.9, y - s, x + s * 1.1, y + s * 0.1, x, y + s * 1.2); g.fillStyle = T.lin(g, 0, y - s, 0, y + s, [0, '#7ad84a', 1, '#2a9a2a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#1a6a1a'; g.stroke(); g.beginPath(); g.arc(x, y - s * 0.2, s * 0.38, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); }
  function compass(g, T, x, y, r) {
    g.beginPath(); g.arc(x, y - r * 1.1, r * 0.18, 0, TAU); g.lineWidth = 4; g.strokeStyle = '#c8901a'; g.stroke();
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.lin(g, 0, y - r, 0, y + r, [0, '#ffe08a', 1, '#c8901a']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#7a5a0a'; g.stroke();
    g.beginPath(); g.arc(x, y, r * 0.8, 0, TAU); g.fillStyle = '#fffaf0'; g.fill();
    g.save(); g.translate(x, y); g.rotate(0.6); g.beginPath(); g.moveTo(0, -r * 0.68); g.lineTo(r * 0.14, 0); g.lineTo(-r * 0.14, 0); g.closePath(); g.fillStyle = '#e8322a'; g.fill(); g.beginPath(); g.moveTo(0, r * 0.68); g.lineTo(r * 0.14, 0); g.lineTo(-r * 0.14, 0); g.closePath(); g.fillStyle = '#2a6ae8'; g.fill(); g.restore();
    g.font = '700 ' + r * 0.32 + 'px ' + T.FONT; g.fillStyle = '#5a4a2a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('N', x, y - r * 0.58); g.fillText('W', x - r * 0.58, y); g.fillText('E', x + r * 0.58, y);
  }
  function pack(g, T, x, y, s) { T.rr(g, x - s * 0.5, y - s * 0.6, s, s * 1.15, s * 0.3); g.fillStyle = T.lin(g, 0, y - s, 0, y + s, [0, '#c8945a', 1, '#8a5a2a']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#5a3a1a'; g.stroke();
    T.rr(g, x - s * 0.36, y - s * 0.05, s * 0.72, s * 0.42, s * 0.1); g.fillStyle = '#a8743a'; g.fill(); g.stroke(); g.beginPath(); g.arc(x, y - s * 0.6, s * 0.22, Math.PI, 0); g.stroke(); }
  function glass(g, x, y, r) { g.save(); g.lineCap = 'round'; g.lineWidth = r * 0.3; g.strokeStyle = '#8a5a2a'; g.beginPath(); g.moveTo(x + r * 0.7, y + r * 0.7); g.lineTo(x + r * 1.5, y + r * 1.5); g.stroke(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = 'rgba(200,235,255,.75)'; g.fill(); g.lineWidth = r * 0.22; g.strokeStyle = '#3a4a6a'; g.stroke(); g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.15, -0.6, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); }
  function pine(g, x, y, s) { g.fillStyle = '#7a4a1a'; g.fillRect(x - 2 * s, y, 4 * s, 8 * s); g.fillStyle = '#3a9a3a'; for (var i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x, y - 24 * s + i * 7 * s); g.lineTo(x + (9 + i * 3) * s, y - 8 * s + i * 7 * s); g.lineTo(x - (9 + i * 3) * s, y - 8 * s + i * 7 * s); g.closePath(); g.fill(); } }
  function num(g, T, str, x, y, sz, c, rot) { g.save(); g.translate(x, y); g.rotate(rot || 0); g.font = '700 ' + sz + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = sz * 0.18; g.strokeStyle = '#fffaf0'; g.strokeText(str, 0, 0); g.fillStyle = c; g.fillText(str, 0, 0); g.restore(); }
  function plate(g, T, L, x, y, w, h, flat) {
    g.save(); if (!flat) { g.shadowColor = 'rgba(120,90,40,.35)'; g.shadowBlur = 30; g.shadowOffsetY = 10; } T.rr(g, x, y, w, h, w * 0.17); g.fillStyle = T.lin(g, 0, y, 0, y + h, [0, L.plate[0], 0.5, L.plate[1], 1, L.plate[2]]); g.fill(); g.restore();
    T.rr(g, x, y, w, h, w * 0.17); g.lineWidth = 4; g.strokeStyle = L.rim; g.stroke();
  }
  function scene(g, T, L) {
    // path + grass + pines (left, under the globe)
    g.fillStyle = L.grass; g.beginPath(); g.ellipse(372, 322, 62, 36, 0, 0, TAU); g.fill();
    g.save(); g.strokeStyle = L.path; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(330, 350); g.quadraticCurveTo(360, 320, 340, 300); g.quadraticCurveTo(320, 282, 352, 262); g.stroke(); g.restore();
    pine(g, 332, 284, 1); pine(g, 404, 330, 1.25); leaf(g, 352, 218, 18, -0.6); leaf(g, 338, 238, 14, 0.3);
    globe(g, T, 470, 252, 102); pin(g, T, 408, 150, 26);
    // the block stacks: [x, y top-left of front, w, h, colour, label, face]
    [[424, 330, 64, 40, '#e8322a', '10'], [460, 296, 64, 40, '#ffc81a', '100'], [462, 336, 64, 34, '#ffb01a'], [512, 270, 70, 40, '#ffb81a', '1000'], [512, 310, 70, 40, '#e8322a'],
     [552, 218, 50, 40, '#4ac83a'], [552, 258, 50, 40, '#3ab83a'], [530, 342, 44, 28, '#4ac83a'],
     [596, 178, 44, 38, '#2a8af0', null, true], [596, 216, 44, 38, '#2a7ae8'], [596, 254, 44, 38, '#2a8af0']].forEach(function (b) { cube(g, T, b[0], b[1], b[2], b[3], b[4], b[5], b[6]); });
    sprout(g, 488, 290, 1); sprout(g, 558, 212, 1); sprout(g, 618, 166, 1.1); sprout(g, 480, 254, 0.8);
    compass(g, T, 604, 342, 30); pack(g, T, 668, 318, 46); glass(g, 664, 232, 18);
    num(g, T, '1', 462, 102, 30, '#3ab83a', -0.1); num(g, T, '2', 492, 98, 30, '#2a8af0', 0); num(g, T, '3', 526, 102, 34, '#e8322a', 0.05); num(g, T, '5', 584, 100, 40, '#2a8af0', 0.1); num(g, T, '10', 666, 186, 34, '#ff8a2e', 0.1);
    g.save(); g.fillStyle = '#ffc81a'; g.strokeStyle = '#c8901a'; g.lineWidth = 2.5; T.star(g, 654, 124, 18, 8); g.fill(); g.stroke(); T.star(g, 618, 110, 10, 4.5); g.fill(); T.star(g, 556, 116, 9, 4); g.fill(); g.restore();
    T.spark(g, 680, 156, 8, '#3ab8a8', 0.9);
  }
  function words(g, T, L, cx, base, size) {
    function o(cols) { return { spacing: size * 0.005, dark: L.dark, outline: size * 0.2, depth: size * 0.08, fat: size * 0.006, ring: 'rgba(255,255,255,.95)', edge: function (j) { return sh(cols[j % cols.length][2], -0.45); }, edgeW: size * 0.075, face: function (j) { var c = cols[j % cols.length]; return [0, c[0], 0.45, c[1], 1, c[2]]; } }; }
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var w1 = g.measureText('Geo').width, w2 = g.measureText('Scout').width; g.restore(); var x0 = cx - (w1 + w2) / 2;
    var A = o(L.g), B = o(L.s); A.wave = function (j) { return [0, 3, 0][j]; }; B.wave = function (j) { return [0, 3, 2, 0, -2][j]; };
    T.word(g, 'Scout', x0 + w1 + w2 / 2, base, size, B); T.gloss(g, 'Scout', x0 + w1 + w2 / 2, base, size, B, 0.5);
    T.word(g, 'Geo', x0 + w1 / 2, base, size, A); T.gloss(g, 'Geo', x0 + w1 / 2, base, size, A, 0.5);
  }
  function emblem(g, T, L, small) { plate(g, T, L, 300, 68, 422, 430); g.save(); T.rr(g, 300, 68, 422, 430, 72); g.clip(); scene(g, T, L); g.restore(); words(g, T, L, 512, 440, 84); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 40, 640, [0, '#fbf6ec', 1, '#efe6d4']); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-282, -48); emblem(g, T, L); return; }
    if (kind === 'wide') { g.save(); g.translate(12, 9); g.scale(0.42, 0.42); g.translate(-300, -68); plate(g, T, L, 300, 68, 422, 430, true); g.save(); T.rr(g, 300, 68, 422, 430, 72); g.clip(); scene(g, T, L); g.restore(); g.restore(); words(g, T, L, 530, 140, 100); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.86, 0.86); g.translate(-511, -283); if (px >= 90) { emblem(g, T, L); } else { plate(g, T, L, 300, 68, 422, 430); g.save(); T.rr(g, 300, 68, 422, 430, 72); g.clip(); g.translate(512, 270); g.scale(1.25, 1.25); g.translate(-512, -250); scene(g, T, L); g.restore(); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO geoscout END
