// 🏷️ LOGO pop-blocks START — 🫧 Pop Blocks, drawn in code from Aowu's picture (gl-14, round 5). Jelly blocks bursting behind the word
// = the game's own kinds (PopBlocks.html THEMES: colour + shape pairs, red ● · yellow ▲ · green ■ · blue ◆ · purple ★ · orange ♥).
// "Pop" orange · yellow · red over "Blocks" blue → green. Looks = the game's block themes (their colours + pictures).
GameLogos.add('pop-blocks', (function () {
  var BOX = { scene: [1024, 572], main: [620, 520], wide: [860, 200], badge: [400, 400] };
  var TAU = Math.PI * 2;
  function mk(o) { var b = { bg: ['#7a3ad8', '#3a1a8a', '#160a40'], dark: '#2a0c5a', glow: '#ffb84a', ring: 'rgba(170,110,255,.9)',
    col: ['#FF5A5F', '#FFC845', '#4CB963', '#3D8BFD', '#A06CF5', '#FF8A3D'], syms: null,
    a: [['#ffd08a', '#ff9a2e', '#f06a10'], ['#fff6a0', '#ffd21a', '#ffaa0a'], ['#ffa08a', '#ff5a3a', '#d8201e']],
    b: [['#6ae4ff', '#1ab0ff', '#1050e8'], ['#5af0e0', '#1ad0b0', '#0e9a8a'], ['#6af0a0', '#2ad870', '#12a050'], ['#9af07a', '#4ad83a', '#1a9a2a'], ['#c0f06a', '#86e02a', '#3aa81a'], ['#e0f870', '#b0e82a', '#6ab81a']] };
    for (var k in o) b[k] = o[k]; return b; }
  // the game's themes: block colours, pictures and background (PopBlocks.html THEMES)
  function th(col, syms, bg, dark) { return mk({ col: col, syms: syms, bg: [bg[1], bg[0], dark], dark: dark }); }
  var LOOK = { classic: mk({}),
    animals: th(['#F6B26B', '#FFD966', '#93C47D', '#C9A27E', '#F4A6C1', '#B4C7E7'], ['🐶', '🐱', '🐸', '🐵', '🐷', '🐼'], ['#1E5E3A', '#4CB963'], '#0e2a18'),
    dino: th(['#7BC67E', '#5FB3B3', '#E8C547', '#E07A5F', '#B39DDB', '#F2E3C6'], ['🦖', '🦕', '🦎', '🐊', '🐢', '🥚'], ['#3E2A14', '#B5651D'], '#1e1408'),
    monsters: th(['#7CF29A', '#C58CFF', '#9FB6CD', '#E8F1FF', '#FF7B7B', '#FF9ED2'], ['👽', '👾', '🤖', '👻', '👹', '🐙'], ['#120C2E', '#3B1F7A'], '#0a0620'),
    vehicles: th(['#FF6B6B', '#FFD24C', '#FF8F5A', '#8BCB5E', '#9EC9FF', '#C9B6FF'], ['🚗', '🚌', '🚒', '🚜', '🚑', '🚲'], ['#2C3E50', '#5D6D7E'], '#121a24'),
    space: th(['#9EC9FF', '#B9F3C9', '#D7D2FF', '#FFC48C', '#FFF2A8', '#FF9EB5'], ['🚀', '🛸', '🛰️', '🪐', '🌙', '☄️'], ['#05061A', '#1E2A78'], '#03040e') };
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function c(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); } return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')'; }
  function symPath(g, k, s) {   // the game's shapes: ● ▲ ■ ◆ ★ ♥
    g.beginPath();
    if (k === 0) g.arc(0, 0, s, 0, TAU);
    else if (k === 1) { g.moveTo(0, -s * 1.05); g.lineTo(s * 1.0, s * 0.75); g.lineTo(-s * 1.0, s * 0.75); g.closePath(); }
    else if (k === 2) GameLogos.tools.rr(g, -s * 0.85, -s * 0.85, s * 1.7, s * 1.7, s * 0.25);
    else if (k === 3) { g.moveTo(0, -s * 1.1); g.lineTo(s * 0.9, 0); g.lineTo(0, s * 1.1); g.lineTo(-s * 0.9, 0); g.closePath(); }
    else if (k === 4) GameLogos.tools.star(g, 0, 0, s * 1.1, s * 0.5, 5);
    else { g.moveTo(0, s * 0.85); g.bezierCurveTo(-s * 1.4, -s * 0.1, -s * 0.7, -s * 1.15, 0, -s * 0.45); g.bezierCurveTo(s * 0.7, -s * 1.15, s * 1.4, -s * 0.1, 0, s * 0.85); g.closePath(); }
  }
  /* a jelly block: glossy rounded cube, a lighter top, a darker bottom edge, the kind's shape pressed into the face (or the theme's picture) */
  function block(g, T, L, k, x, y, S, rot, a) {
    var c = L.col[k % 6]; g.save(); g.translate(x, y); g.rotate(rot || 0); g.globalAlpha = a == null ? 1 : a;
    g.save(); g.shadowColor = c; g.shadowBlur = S * 0.35; T.rr(g, -S / 2, -S / 2, S, S, S * 0.22); g.fillStyle = shade(c, -0.45); g.fill(); g.restore();
    T.rr(g, -S / 2, -S / 2, S, S * 0.92, S * 0.22); g.fillStyle = T.lin(g, 0, -S / 2, 0, S / 2, [0, shade(c, 0.45), 0.45, c, 1, shade(c, -0.25)]); g.fill();
    T.rr(g, -S / 2 + S * 0.06, -S / 2 + S * 0.05, S * 0.88, S * 0.34, S * 0.16); g.fillStyle = 'rgba(255,255,255,.32)'; g.fill();
    if (L.syms) { g.font = Math.round(S * 0.52) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L.syms[k % 6], 0, S * 0.02); }
    else { var s = S * 0.22; g.save(); g.translate(1.5, 2); symPath(g, k % 6, s); g.fillStyle = 'rgba(255,255,255,.45)'; g.fill(); g.restore(); symPath(g, k % 6, s); g.fillStyle = shade(c, -0.32); g.fill(); g.lineWidth = S * 0.03; g.strokeStyle = shade(c, -0.5); g.stroke(); }
    g.beginPath(); g.ellipse(-S * 0.22, -S * 0.28, S * 0.14, S * 0.06, -0.4, 0, TAU); g.fillStyle = 'rgba(255,255,255,.85)'; g.fill();
    g.restore();
  }
  function bubble(g, T, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.3, y - r * 0.3, 0, r, [0, 'rgba(255,255,255,.05)', 0.75, 'rgba(180,220,255,.25)', 1, 'rgba(220,240,255,.75)']); g.fill(); g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.12, -0.6, 0, TAU); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill(); }
  function trail(g, T) {
    g.save(); g.lineCap = 'round'; g.shadowColor = '#ff8ad8'; g.shadowBlur = 16; [[16, 'rgba(255,120,220,.22)'], [8, 'rgba(255,190,240,.45)'], [3, 'rgba(255,255,255,.8)']].forEach(function (w) { g.beginPath(); g.moveTo(560, 160); g.bezierCurveTo(640, 80, 720, 60, 800, 70); g.lineWidth = w[0]; g.strokeStyle = w[1]; g.stroke(); }); g.restore();
    var r = T.rng(5); for (var q = 0; q < 26; q++) { var t = r(); T.spark(g, 570 + t * 230 + (r() - 0.5) * 40, 150 - t * 90 + (r() - 0.5) * 40, 2 + r() * 6, ['#fff', '#ffd2f4', '#fff6a0'][q % 3], 0.7 + r() * 0.3); }
  }
  function splash(g, x, y) { g.save(); g.fillStyle = '#ff9a2e'; g.shadowColor = '#ffb84a'; g.shadowBlur = 10; [[0, 0, 14, 10, 0.3], [-20, -18, 7, 9, 0.6], [12, -26, 6, 8, -0.3], [-30, 6, 5, 5, 0], [26, -6, 5, 6, 0]].forEach(function (d) { g.beginPath(); g.ellipse(x + d[0], y + d[1], d[2], d[3], d[4], 0, TAU); g.fill(); }); g.restore(); }
  function o(L, cols, size) { return { clean: true /* gl-r20 clean B */, spacing: size * 0.005, dark: L.dark, outline: size * 0.21, depth: size * 0.08, fat: size * 0.006, ring: L.ring, edge: function (j) { return GameLogos.tools.shade(cols[j % cols.length][2], -0.45); }, edgeW: size * 0.075, face: function (j) { var c = cols[j % cols.length]; return [0, c[0], 0.42, c[1], 1, c[2]]; } }; }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    var s1 = 200 * k, s2 = 168 * k, A = o(L, L.a, s1), B = o(L, L.b, s2);
    if (oneLine) {
      g.save(); g.font = '700 ' + s1 + 'px ' + T.FONT; var w1 = g.measureText('Pop').width; g.font = '700 ' + s2 + 'px ' + T.FONT; var w2 = g.measureText('Blocks').width; g.restore();
      var gap = 62 * k, x0 = cx - (w1 + gap + w2) / 2; T.word(g, 'Blocks', x0 + w1 + gap + w2 / 2, y1, s2, B); T.gloss(g, 'Blocks', x0 + w1 + gap + w2 / 2, y1, s2, B, 0.5); T.word(g, 'Pop', x0 + w1 / 2, y1, s1, A); T.gloss(g, 'Pop', x0 + w1 / 2, y1, s1, A, 0.5); return;
    }
    A.wave = function (j) { return [0, 8, 2][j] * k; }; A.rot = -0.02; B.wave = function (j) { return [0, -2, 2, 4, 0, -4][j] * k; }; B.glow = L.glow; B.glowBlur = 0.25;
    // neon halo round BOTH words first (the picture's warm glow), then the words on top
    var hA = o(L, L.a, s1), hB = o(L, L.b, s2); hA.wave = A.wave; hA.rot = A.rot; hB.wave = B.wave; [[hB, 'Blocks', cx + 8 * k, y2, s2], [hA, 'Pop', cx - 34 * k, y1, s1]].forEach(function (h) { h[0].glow = L.glow; h[0].glowN = 2; h[0].glowBlur = 0.4; T.word(g, h[1], h[2], h[3], h[4], h[0]); });
    B.glow = null; T.word(g, 'Blocks', cx + 8 * k, y2, s2, B); T.gloss(g, 'Blocks', cx + 8 * k, y2, s2, B, 0.5);
    T.word(g, 'Pop', cx - 34 * k, y1, s1, A); T.gloss(g, 'Pop', cx - 34 * k, y1, s1, A, 0.5);
  }
  // blocks behind the word: [kind, x, y, size, turn] — the picture's spots
  var PILE = [[3, 420, 150, 96, -0.16], [0, 512, 108, 90, 0.04], [4, 612, 152, 88, 0.2], [2, 506, 202, 80, -0.05], [1, 690, 218, 88, 0.26], [2, 300, 306, 84, -0.22], [5, 708, 326, 92, 0.14]];
  var FLY = [[1, 690, 58, 28, 0.3], [0, 744, 64, 22, -0.3], [3, 784, 82, 24, 0.5], [4, 778, 130, 22, -0.2], [5, 760, 184, 16, 0.6], [2, 640, 52, 18, -0.4]];
  function emblem(g, T, L, full) {
    g.fillStyle = T.rad(g, 470, 250, 10, 330, [0, 'rgba(255,230,150,.9)', 0.3, 'rgba(255,150,80,.45)', 0.65, 'rgba(255,90,200,.18)', 1, 'rgba(255,120,200,0)']); g.fillRect(140, 0, 760, 572);
    if (full) { g.save(); g.globalCompositeOperation = 'lighter'; for (var i = 0; i < 16; i++) { var an = i * TAU / 16 + 0.1; g.beginPath(); g.moveTo(470, 250); g.arc(470, 250, 420, an, an + 0.07); g.closePath(); g.fillStyle = T.rad(g, 470, 250, 10, 420, [0, 'rgba(255,200,120,.22)', 1, 'rgba(255,120,200,0)']); g.fill(); } g.restore(); }
    if (full) trail(g, T);
    PILE.forEach(function (b) { block(g, T, L, b[0], b[1], b[2], b[3], b[4]); });
    if (full) { FLY.forEach(function (b) { block(g, T, L, b[0], b[1], b[2], b[3], b[4]); }); splash(g, 296, 178); [[560, 50, 10], [668, 120, 7], [806, 240, 13], [770, 300, 8], [630, 96, 6]].forEach(function (b) { bubble(g, T, b[0], b[1], b[2]); }); }
    T.spark(g, 548, 140, 22, '#fff', 1);
    words(g, T, L, 512, 330, 470, 1);
    if (full) [[318, 102, 10], [432, 318, 9], [526, 360, 8], [262, 436, 9], [796, 400, 8]].forEach(function (s) { T.spark(g, s[0], s[1], s[2] * 1.7, '#fff', 0.95); });
  }
  function backdrop(g, T, L, x, y, w, h) {
    g.fillStyle = T.rad(g, x + w / 2, y + h * 0.45, 30, Math.max(w, h) * 0.7, [0, L.bg[0], 0.5, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h);
    var r = T.rng(17); for (var i = 0; i < 18; i++) { var bx = x + (i % 2 ? w - 50 - r() * 90 : 30 + r() * 90), by = y + 20 + r() * (h - 40); block(g, T, L, i % 6, bx, by, 46 + r() * 30, (r() - 0.5) * 0.3, 0.13); }
    for (var q = 0; q < 50; q++) { g.globalAlpha = 0.35 + r() * 0.5; g.fillStyle = ['#ffb86a', '#ff8ad8', '#fff6a0'][q % 3]; g.beginPath(); g.arc(x + r() * w, y + r() * h, 1 + r() * 3, 0, TAU); g.fill(); } g.globalAlpha = 1;
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { backdrop(g, T, L, 0, 0, 1024, 572); emblem(g, T, L, true); return; }
    if (kind === 'main') { g.translate(-200, -36); emblem(g, T, L, false); return; }
    if (kind === 'wide') { block(g, T, L, 3, 56, 70, 56, -0.16); block(g, T, L, 0, 114, 60, 50, 0.06); block(g, T, L, 5, 90, 124, 54, 0.12); block(g, T, L, 1, 148, 124, 46, 0.24); words(g, T, L, 520, 150, 0, 0.62, true); return; }
    if (kind === 'badge') {
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.clip(); backdrop(g, T, L, 14, 14, 372, 372); g.restore();
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.lineWidth = 8; g.strokeStyle = T.lin(g, 0, 14, 0, 386, [0, '#ffe0a0', 0.5, '#ff8ad8', 1, L.dark]); g.shadowColor = '#ff8ad8'; g.shadowBlur = 16; g.stroke(); g.restore();
      if (px >= 90) { g.translate(200, 206); g.scale(0.6, 0.6); g.translate(-512, -290); emblem(g, T, L, false); }
      else { block(g, T, L, 3, 140, 150, 120, -0.16); block(g, T, L, 0, 262, 140, 110, 0.06); block(g, T, L, 5, 160, 268, 116, 0.12); block(g, T, L, 1, 270, 264, 104, 0.24); }
      return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO pop-blocks END
