// 🏷️ LOGO georead START — 🔤 GeoRead, drawn in code from Aowu's picture (gl-19, round 7). Same family as GeoScout: cream rounded icon, a globe with an open book
// growing leaves, a rainbow sound wave + headphones + music notes, a winding road (green → orange) with a compass, pines, a tree and a map pin;
// "Geo" blue → green + "Read" orange. Looks = the game's houses (GeoRead.html HOUSES: top / bottom / ground → backdrop, rim, path).
GameLogos.add('georead', (function () {
  var BOX = { scene: [1024, 572], main: [500, 470], wide: [860, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { plate: ['#fffaf0', '#fbefd8', '#f2dfbc'], rim: '#e8d2a8', path: '#e9d79a', grass: '#8cc858', dark: '#123060',
    g: [['#7ad8ff', '#2a9aff', '#1a5ae0'], ['#7af0d8', '#2ac8a8', '#12907a'], ['#a8f070', '#4ac83a', '#1a9a3a']],
    s: [['#ffc08a', '#ff8a2e', '#f05a12'], ['#ffb87a', '#ff7a2a', '#e8500e'], ['#ffa07a', '#ff6a3a', '#e0401a'], ['#ffd07a', '#ffa01a', '#f07a0a']] };
    for (var k in o) b[k] = o[k]; return b; }
  function th(t, extra) { var o = { plate: [t.bot, t.top, t.top], rim: t.sw, path: t.ground, grass: t.grass }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var LOOK = { classic: mk({}),
    dino: th({ top: '#2F7A3A', bot: '#9BD36A', ground: '#7A5230', grass: '#5E8F33', sw: '#9BD36A' }), sea: th({ top: '#063A6B', bot: '#2E9BD6', ground: '#E3C88F', grass: '#D2B070', sw: '#2E9BD6' }),
    disco: th({ top: '#22073F', bot: '#5B1A86', ground: '#2E0F4F', grass: '#3D1260', sw: '#9B2BD1' }), robot: th({ top: '#13283A', bot: '#3C5A73', ground: '#4C5966', grass: '#4A6075', sw: '#3C5A73' }),
    space: th({ top: '#050826', bot: '#272065', ground: '#3B357A', grass: '#80849C', sw: '#272065' }), sky: th({ top: '#5AB0EB', bot: '#D5EEFF', ground: '#FFFFFF', grass: '#EAF4FF', sw: '#5AB0EB' }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
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
  function book(g, T, x, y, s, rot) {   // an open storybook with leaves growing out of it
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineJoin = 'round';
    g.fillStyle = '#8a5a2a'; g.beginPath(); g.moveTo(-92, 16); g.quadraticCurveTo(0, 34, 92, 16); g.lineTo(92, 26); g.quadraticCurveTo(0, 44, -92, 26); g.closePath(); g.fill();
    [-1, 1].forEach(function (k) { g.beginPath(); g.moveTo(0, 22); g.quadraticCurveTo(k * 40, 0, k * 88, 12); g.lineTo(k * 80, -48); g.quadraticCurveTo(k * 40, -62, 0, -40); g.closePath(); g.fillStyle = T.lin(g, k * 88, 0, 0, 0, [0, '#f2dcae', 1, '#fff6e2']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#a8763a'; g.stroke();
      g.strokeStyle = 'rgba(160,120,60,.45)'; g.lineWidth = 1.6; for (var i = 0; i < 4; i++) { g.beginPath(); g.moveTo(k * 14, -26 + i * 10); g.quadraticCurveTo(k * 44, -36 + i * 10, k * 72, -30 + i * 10); g.stroke(); } });
    g.restore();
    leaf(g, x - 14 * s, y - 70 * s, 16 * s, -1.1); leaf(g, x + 8 * s, y - 78 * s, 14 * s, -2.2); sprout(g, x - 4 * s, y - 44 * s, 1.1 * s);
    var r = T.rng(9); for (var q = 0; q < 6; q++) T.spark(g, x - 40 * s + r() * 80 * s, y - 90 * s + r() * 30 * s, 4 + r() * 4, '#ffd23a', 0.9);
  }
  function land(g, T, cx, cy, r) {   // bigger continents where they show (right side, lower left, top) — our own ragged shapes
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip(); var rr = T.rng(17);
    [[0.48, 0.05, 0.42, 30, '#5ac84a'], [-0.35, 0.45, 0.36, 24, '#6ad04a'], [0.05, -0.62, 0.26, 16, '#5ac84a'], [0.55, -0.5, 0.18, 10, '#7ad85a']].forEach(function (c) { g.fillStyle = c[4]; for (var i = 0; i < c[3]; i++) { var a = rr() * TAU, d = Math.sqrt(rr()) * c[2] * r * 0.85; g.beginPath(); g.ellipse(cx + c[0] * r + Math.cos(a) * d, cy + c[1] * r + Math.sin(a) * d * 0.85, c[2] * r * (0.2 + rr() * 0.25), c[2] * r * (0.15 + rr() * 0.2), rr() * 3, 0, TAU); g.fill(); } });
    g.fillStyle = 'rgba(30,110,40,.3)'; g.beginPath(); g.ellipse(cx + 0.55 * r, cy + 0.2 * r, 0.2 * r, 0.1 * r, 0.4, 0, TAU); g.fill(); g.restore();
  }
  function wave(g, x, y, w, h) {   // rainbow sound wave
    var cols = ['#ff4a8a', '#ff8a2e', '#ffd23a', '#4ac83a', '#2ab8e8', '#6a5af0', '#c04ae8'], n = 15;
    g.save(); g.lineCap = 'round'; g.lineWidth = w / n * 0.62; for (var i = 0; i < n; i++) { var t = i / (n - 1), a = Math.sin(t * Math.PI) * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7))) * h; g.strokeStyle = cols[Math.floor(t * (cols.length - 0.01))]; g.beginPath(); g.moveTo(x + t * w, y - a / 2); g.lineTo(x + t * w, y + a / 2); g.stroke(); } g.restore();
  }
  function phones(g, T, cx, cy, r) {   // headphones hugging the globe's right side
    g.save(); g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, r, -1.3, 0.12); g.lineWidth = 12; g.strokeStyle = '#1a6a7a'; g.stroke(); g.lineWidth = 7; g.strokeStyle = '#2ab8a8'; g.stroke();
    var ex = cx + Math.cos(0.18) * r, ey = cy + Math.sin(0.18) * r; T.rr(g, ex - 18, ey - 28, 36, 56, 16); g.fillStyle = T.lin(g, ex - 18, 0, ex + 18, 0, [0, '#3ad8c8', 1, '#1a7a8a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#124a5a'; g.stroke(); g.restore();
  }
  function note(g, T, x, y, s, c) { g.save(); g.fillStyle = c; g.strokeStyle = c; g.lineWidth = 3 * s; g.beginPath(); g.ellipse(x, y, 6 * s, 4.5 * s, -0.4, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x + 5 * s, y - 2 * s); g.lineTo(x + 5 * s, y - 22 * s); g.quadraticCurveTo(x + 12 * s, y - 18 * s, x + 14 * s, y - 10 * s); g.stroke(); g.restore(); }
  function tree(g, x, y, s) { g.fillStyle = '#7a4a1a'; g.fillRect(x - 3 * s, y - 10 * s, 6 * s, 14 * s); g.fillStyle = '#4ab83a'; g.beginPath(); g.arc(x, y - 22 * s, 14 * s, 0, TAU); g.fill(); g.fillStyle = '#6ad84a'; g.beginPath(); g.arc(x - 4 * s, y - 26 * s, 7 * s, 0, TAU); g.fill(); }
  function road(g, T, L) {   // the winding road under the word, green on the left turning orange on the right
    function path() { g.beginPath(); g.moveTo(330, 384); g.bezierCurveTo(330, 440, 420, 452, 470, 420); g.bezierCurveTo(520, 388, 560, 470, 620, 440); g.bezierCurveTo(660, 420, 690, 420, 700, 384); }
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; path(); g.lineWidth = 34; g.strokeStyle = 'rgba(40,60,30,.35)'; g.stroke(); path(); g.lineWidth = 28; g.strokeStyle = T.lin(g, 330, 0, 700, 0, [0, '#7ac84a', 0.5, '#c8c84a', 1, '#ffa03a']); g.stroke();
    path(); g.setLineDash([10, 10]); g.lineWidth = 3; g.strokeStyle = '#fffbe8'; g.stroke(); g.restore();
  }
  function scene(g, T, L) {
    leaf(g, 338, 198, 16, -0.4); leaf(g, 362, 176, 13, 0.6); leaf(g, 326, 380, 11, 0.3); leaf(g, 702, 376, 11, -0.4);
    globe(g, T, 528, 252, 128); land(g, T, 528, 252, 128); phones(g, T, 528, 252, 134);
    wave(g, 532, 222, 112, 64); note(g, T, 568, 104, 1.2, '#2a9a8a'); note(g, T, 696, 188, 1.1, '#ff8a2e'); note(g, T, 684, 240, 1, '#2a8af0');
    g.save(); g.strokeStyle = '#ff8a2e'; g.lineWidth = 3; g.lineCap = 'round'; [[680, 120, 690, 106], [690, 134, 704, 128]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); }); g.restore();
    book(g, T, 436, 236, 0.92, -0.22);
    sprout(g, 520, 132, 1.3);
    road(g, T, L); pine(g, 398, 408, 1.05); pine(g, 420, 412, 0.9); tree(g, 642, 392, 1.1); compass(g, T, 512, 430, 25); pin(g, T, 612, 400, 15);
    g.save(); g.fillStyle = '#ffc81a'; g.strokeStyle = '#c8901a'; g.lineWidth = 2; [[358, 380, 10], [452, 120, 11], [436, 376, 7], [466, 440, 8], [556, 440, 8], [668, 368, 7], [400, 128, 8]].forEach(function (q) { T.star(g, q[0], q[1], q[2], q[2] * 0.46); g.fill(); g.stroke(); }); g.restore();
    T.spark(g, 404, 146, 9, '#3ab8a8', 0.9); T.spark(g, 694, 160, 7, '#ffb84a', 0.9);
  }
  function words(g, T, L, cx, base, size) {
    function o(cols) { return { spacing: size * 0.005, dark: L.dark, outline: size * 0.11, depth: size * 0.06, fat: size * 0.006, ring: 'rgba(255,255,255,.95)', edge: function (j) { return sh(cols[j % cols.length][2], -0.45); }, edgeW: size * 0.045, face: function (j) { var c = cols[j % cols.length]; return [0, c[0], 0.45, c[1], 1, c[2]]; } }; }
    g.save(); g.font = '700 ' + size + 'px ' + T.FONT; var w1 = g.measureText('Geo').width, w2 = g.measureText('Read').width; g.restore(); var x0 = cx - (w1 + w2) / 2;
    var A = o(L.g), B = o(L.s); A.wave = function (j) { return [0, 3, 0][j]; }; B.wave = function (j) { return [0, 2, 3, 0][j]; };
    T.word(g, 'Read', x0 + w1 + w2 / 2, base, size, B); T.gloss(g, 'Read', x0 + w1 + w2 / 2, base, size, B, 0.5);
    T.word(g, 'Geo', x0 + w1 / 2, base, size, A); T.gloss(g, 'Geo', x0 + w1 / 2, base, size, A, 0.5);
  }
  var PX = 282, PY = 68, PW = 460, PH = 434;
  function emblem(g, T, L) { plate(g, T, L, PX, PY, PW, PH); g.save(); T.rr(g, PX, PY, PW, PH, 78); g.clip(); scene(g, T, L); g.restore(); words(g, T, L, 508, 350, 98); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 40, 640, [0, '#fbf6ec', 1, '#efe6d4']); g.fillRect(0, 0, 1024, 572); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-262, -48); emblem(g, T, L); return; }
    if (kind === 'wide') { g.save(); g.translate(12, 10); g.scale(0.41, 0.41); g.translate(-PX, -PY); plate(g, T, L, PX, PY, PW, PH, true); g.save(); T.rr(g, PX, PY, PW, PH, 78); g.clip(); scene(g, T, L); g.restore(); g.restore(); words(g, T, L, 530, 140, 106); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.82, 0.82); g.translate(-512, -285); if (px >= 90) { emblem(g, T, L); } else { plate(g, T, L, PX, PY, PW, PH); g.save(); T.rr(g, PX, PY, PW, PH, 78); g.clip(); scene(g, T, L); g.restore(); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO georead END
