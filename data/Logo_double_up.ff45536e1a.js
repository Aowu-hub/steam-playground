// 🏷️ LOGO double-up START — 🔀 Double Up, drawn in code from Aowu's picture (gl-15, round 5). Rounded icon, a REAL doubling row of tiles
// (8 · 16 · 32 · 64 · 128 · 256 · 512) climbing along green arrows, "DOUBLE" gold over a big green → blue "UP", winged clock, gauge, a "2" tile.
// Looks = the game's tile themes (DoubleUp.html THEMES: their tile colours, and their pictures on the tiles instead of numbers).
GameLogos.add('double-up', (function () {
  var BOX = { scene: [1024, 572], main: [580, 556], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, ROW = [8, 16, 32, 64, 128, 256, 512];
  function mk(o) { var b = { bg: ['#4a3ab8', '#2a1a78', '#120a3a'], rays: 'rgba(120,160,255,.16)', rim: ['#9ad8ff', '#5a6af0', '#2a1a78'], dark: '#2a1268', ink: '#ffffff',
    // tile colour per value index (2 → 0, 4 → 1 … 512 → 8): the picture's bright row
    col: ['#ff4a3a', '#ffa04a', '#ff8a2e', '#ff6a3a', '#3a9af5', '#ff4a6a', '#2a7ae8', '#b84af5', '#4ad86a', '#ffd23a', '#ff5ab8', '#3ad8d8', '#7a5cfa'], pics: null,
    a: ['#fff6a0', '#ffd21a', '#ff9a0a'], u: ['#c8ff7a', '#5ad83a', '#1a9a3a'], p: ['#8afff0', '#2ad8e8', '#1a6ae8'] };
    for (var k in o) b[k] = o[k]; return b; }
  function th(t, dark, extra) { var o = { col: t.col, pics: t.pics, bg: [t.bg[1], t.board, dark], rays: 'rgba(255,255,255,.12)', rim: [t.bg[0], t.bg[1], dark], dark: dark }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var TH = {
    numbers: { bg: ['#FFF4E6', '#FFD9B0'], board: '#BBA38D', col: ['#EEE4DA', '#EDE0C8', '#F2B179', '#F59563', '#F67C5F', '#F65E3B', '#EDCF72', '#EDCC61', '#EDC850', '#EDC53F', '#EDC22E', '#7A5CFA', '#3D3A8C'] },
    animals: { bg: ['#E8FBE0', '#9FDB86'], board: '#6BAE5A', pics: ['🥚', '🐣', '🐥', '🐔', '🐰', '🐱', '🐶', '🐷', '🐮', '🦁', '🐘', '🐳', '🦄'], col: ['#FFF8E1', '#FFF1C1', '#FFE38A', '#FFD166', '#FFB4A2', '#F7A072', '#E5989B', '#F28482', '#B5838D', '#E9C46A', '#90BE6D', '#43AA8B', '#9B5DE5'] },
    dino: { bg: ['#F5E6CC', '#C79A5A'], board: '#8C6239', pics: ['🥚', '🦴', '🦎', '🐊', '🐢', '🐍', '🦕', '🦖', '🐉', '🌋', '☄️', '🌍', '👑'], col: ['#F2E3C6', '#E9D5A8', '#C9D84A', '#A7C957', '#6A994E', '#7BC67E', '#5FB3B3', '#3E9B5A', '#D4A64A', '#E07A5F', '#BC4749', '#6D597A', '#3D405B'] },
    space: { bg: ['#1B1F4A', '#3C2A7A'], board: '#141634', pics: ['✨', '🌑', '🌙', '🌍', '🪐', '☀️', '⭐', '🌟', '💫', '☄️', '🌌', '🛸', '🚀'], col: ['#3A3F7A', '#45508F', '#4F63A8', '#4A7BC0', '#5E8FD8', '#7A6CF0', '#9B5DE5', '#C77DFF', '#F15BB5', '#FF8FAB', '#FFB703', '#FB8500', '#E63946'] },
    fantasy: { bg: ['#FCE7FF', '#C9A7FF'], board: '#7B4FB8', pics: ['🔹', '🔷', '💠', '💎', '🔮', '🪄', '👑', '🏰', '🦄', '🐉', '🧞', '🌈', '✨'], col: ['#EADCFF', '#D9C2FF', '#C7A7FF', '#B38CFF', '#A06CF5', '#FF9ED2', '#FF7AD9', '#FFB86B', '#FFD36E', '#7DFFB2', '#7AE7FF', '#5B8CFF', '#3D3A8C'] },
    sweets: { bg: ['#FFE8F0', '#FFB3CC'], board: '#D46A8C', pics: ['🍬', '🍭', '🍪', '🧁', '🍩', '🍰', '🍫', '🍦', '🍨', '🥧', '🎂', '🍯', '🏆'], col: ['#FFF0F5', '#FFE0EC', '#FFD1DF', '#FFC2D4', '#FFB3CC', '#FF9EBB', '#E07A9E', '#C9A27E', '#A67C52', '#FFD36E', '#FFB703', '#F28C28', '#E63946'] } };
  var LOOK = { classic: mk({}), numbers: th(TH.numbers, '#4a3a2a', { ink: '#776E65' }), animals: th(TH.animals, '#1e4a14'), dino: th(TH.dino, '#3a2410'), space: th(TH.space, '#070820'), fantasy: th(TH.fantasy, '#3a1a6a'), sweets: th(TH.sweets, '#6a1a38') };
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function c(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); } return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')'; }
  function lum(hex) { var n = parseInt(hex.slice(1), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) / 255; }
  /* one tile: glossy rounded square with a darker 3D bottom edge; the number (or the theme's picture for that value) */
  function tile(g, T, L, v, x, y, S, rot) {
    var i = Math.round(Math.log(v) / Math.LN2) - 1, c = L.col[Math.min(i, L.col.length - 1)];
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    g.save(); g.shadowColor = 'rgba(0,0,30,.45)'; g.shadowBlur = S * 0.2; g.shadowOffsetY = S * 0.06; T.rr(g, -S / 2, -S / 2, S, S, S * 0.2); g.fillStyle = shade(c, -0.4); g.fill(); g.restore();
    T.rr(g, -S / 2, -S / 2, S, S * 0.9, S * 0.2); g.fillStyle = T.lin(g, 0, -S / 2, 0, S * 0.4, [0, shade(c, 0.35), 0.5, c, 1, shade(c, -0.12)]); g.fill();
    T.rr(g, -S / 2 + S * 0.07, -S / 2 + S * 0.06, S * 0.86, S * 0.3, S * 0.14); g.fillStyle = 'rgba(255,255,255,.3)'; g.fill();
    if (L.pics) { g.font = Math.round(S * 0.56) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L.pics[Math.min(i, L.pics.length - 1)], 0, -S * 0.03); }
    else { var str = String(v), fs = S * (str.length > 2 ? 0.4 : str.length > 1 ? 0.5 : 0.62); g.font = '700 ' + fs + 'px ' + T.FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      var dk = lum(c) > 0.72; g.lineWidth = fs * 0.22; g.strokeStyle = dk ? 'rgba(255,255,255,.6)' : 'rgba(30,20,60,.55)'; g.strokeText(str, 0, -S * 0.03); g.fillStyle = dk ? (L.ink === '#ffffff' ? '#5a3a2a' : L.ink) : '#ffffff'; g.fillText(str, 0, -S * 0.03); }
    g.restore();
  }
  function arrow(g, T, pts, w, c, head) {
    g.save(); g.lineCap = 'round'; function path() { g.beginPath(); g.moveTo(pts[0], pts[1]); g.bezierCurveTo(pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]); }
    g.shadowColor = c[1]; g.shadowBlur = 14; path(); g.lineWidth = w + 6; g.strokeStyle = c[2]; g.stroke(); g.shadowBlur = 0; path(); g.lineWidth = w; g.strokeStyle = T.lin(g, pts[0], pts[1], pts[6], pts[7], [0, c[2], 0.5, c[1], 1, c[0]]); g.stroke();
    var a = Math.atan2(pts[7] - pts[5], pts[6] - pts[4]); g.translate(pts[6], pts[7]); g.rotate(a); g.beginPath(); g.moveTo(head, 0); g.lineTo(-head * 0.5, -head * 0.95); g.lineTo(-head * 0.25, 0); g.lineTo(-head * 0.5, head * 0.95); g.closePath(); g.shadowColor = c[1]; g.shadowBlur = 12; g.fillStyle = c[0]; g.fill(); g.lineWidth = 3; g.strokeStyle = c[2]; g.stroke(); g.restore();
  }
  function clock(g, T, x, y, r) {   // winged alarm clock
    g.save(); [-1, 1].forEach(function (k) { g.save(); g.translate(x + k * r * 0.9, y - r * 0.1); g.scale(k, 1); for (var f = 0; f < 3; f++) { g.beginPath(); g.ellipse(r * 0.55 + f * r * 0.18, -r * 0.1 - f * r * 0.22, r * 0.6, r * 0.2, -0.5 - f * 0.25, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#8ab0e0'; g.stroke(); } g.restore(); });
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.lin(g, 0, y - r, 0, y + r, [0, '#ff8a6a', 1, '#d8301a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#6a1a10'; g.stroke();
    g.beginPath(); g.arc(x, y, r * 0.74, 0, TAU); g.fillStyle = '#fff8ee'; g.fill(); g.strokeStyle = '#2a1a3a'; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - r * 0.5); g.moveTo(x, y); g.lineTo(x + r * 0.36, y + r * 0.1); g.stroke();
    [-1, 1].forEach(function (k) { g.beginPath(); g.arc(x + k * r * 0.55, y - r * 0.92, r * 0.24, 0, TAU); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#8a5a04'; g.stroke(); }); g.restore();
  }
  function gauge(g, T, x, y, r) {
    g.save(); g.shadowColor = '#7ae8ff'; g.shadowBlur = 16; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.lin(g, 0, y - r, 0, y + r, [0, '#e8f4ff', 1, '#a8c0e8']); g.fill(); g.restore(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.lineWidth = r * 0.14; g.strokeStyle = '#3a4a8a'; g.stroke();
    var cols = ['#4ad86a', '#ffd23a', '#ff8a2e', '#ff4a3a']; for (var i = 0; i < 4; i++) { g.beginPath(); g.arc(x, y, r * 0.72, Math.PI * (0.8 + i * 0.35), Math.PI * (0.8 + (i + 1) * 0.35)); g.lineWidth = r * 0.16; g.strokeStyle = cols[i]; g.stroke(); }
    g.save(); g.translate(x, y); g.rotate(0.6); g.beginPath(); g.moveTo(-r * 0.06, 0); g.lineTo(0, -r * 0.7); g.lineTo(r * 0.06, 0); g.closePath(); g.fillStyle = '#1a2a6a'; g.fill(); g.restore(); g.beginPath(); g.arc(x, y, r * 0.1, 0, TAU); g.fillStyle = '#1a2a6a'; g.fill();
  }
  function plate(g, T, L, x, y, w, h) {
    g.save(); g.shadowColor = L.rim[0]; g.shadowBlur = 26; T.rr(g, x, y, w, h, 76); g.fillStyle = L.bg[1]; g.fill(); g.restore();
    g.save(); T.rr(g, x, y, w, h, 76); g.clip(); g.fillStyle = T.rad(g, x + w / 2, y + h * 0.48, 20, w * 0.75, [0, L.bg[0], 0.6, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h);
    for (var i = 0; i < 18; i++) { var an = i * TAU / 18; g.beginPath(); g.moveTo(x + w / 2, y + h / 2); g.arc(x + w / 2, y + h / 2, w, an, an + 0.09); g.closePath(); g.fillStyle = L.rays; g.fill(); }
    var r = T.rng(31); for (var q = 0; q < 40; q++) { g.globalAlpha = 0.4 + r() * 0.5; g.fillStyle = ['#fff', '#a8e0ff', '#ffe8a0'][q % 3]; g.beginPath(); g.arc(x + r() * w, y + r() * h, 1 + r() * 2.6, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore();
    T.rr(g, x, y, w, h, 76); g.lineWidth = 7; g.strokeStyle = T.lin(g, x, y, x + w, y + h, [0, L.rim[0], 0.5, L.rim[1], 1, L.rim[2]]); g.stroke();
  }
  function o(L, c, size) { return { clean: true /* gl-r20 clean B */, spacing: size * 0.01, dark: L.dark, outline: size * 0.2, depth: size * 0.09, fat: size * 0.006, ring: 'rgba(255,255,255,.95)', edge: function () { return GameLogos.tools.shade(c[2], -0.45); }, edgeW: size * 0.075, glow: 'rgba(255,220,120,.6)', glowBlur: 0.25, face: function () { return [0, c[0], 0.45, c[1], 1, c[2]]; } }; }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    var s1 = 112 * k, s2 = 178 * k, A = o(L, L.a, s1), U = o(L, L.u, s2), P = o(L, L.p, s2); U.glow = P.glow = 'rgba(120,255,200,.55)';
    if (oneLine) { s2 = s1 * 1.12; U = o(L, L.u, s2); P = o(L, L.p, s2); g.save(); g.font = '700 ' + s1 + 'px ' + T.FONT; var w1 = g.measureText('DOUBLE').width + 5 * s1 * 0.01; g.font = '700 ' + s2 + 'px ' + T.FONT; var wu = g.measureText('U').width, wp = g.measureText('P').width; g.restore();
      var gap = 26 * k, x0 = cx - (w1 + gap + wu + wp) / 2; T.word(g, 'DOUBLE', x0 + w1 / 2, y1, s1, A); T.gloss(g, 'DOUBLE', x0 + w1 / 2, y1, s1, A, 0.5); T.word(g, 'U', x0 + w1 + gap + wu / 2, y1, s2, U); T.word(g, 'P', x0 + w1 + gap + wu + wp / 2, y1, s2, P); return; }
    A.wave = function (j) { return [10, 4, 0, 0, 4, 10][j] * k; };
    g.save(); g.font = '700 ' + s2 + 'px ' + T.FONT; var wu2 = g.measureText('U').width, wp2 = g.measureText('P').width; g.restore(); var xu = cx - (wu2 + wp2) / 2;
    T.word(g, 'DOUBLE', cx, y1, s1, A); T.gloss(g, 'DOUBLE', cx, y1, s1, A, 0.5);
    // gl-r10 (Aowu: "the UP is under DOUBLE"): UP sits below DOUBLE, drawn in front of it
    T.word(g, 'P', xu + wu2 + wp2 / 2 - 4 * k, y2 - 8 * k, s2, P); T.gloss(g, 'P', xu + wu2 + wp2 / 2 - 4 * k, y2 - 8 * k, s2, P, 0.45);
    T.word(g, 'U', xu + wu2 / 2, y2, s2, U); T.gloss(g, 'U', xu + wu2 / 2, y2, s2, U, 0.45);
  }
  // the climbing row: [x, y, size, turn] for 8 … 512
  var SPOT = [[306, 196, 50, -0.1], [354, 186, 54, -0.08], [408, 172, 58, -0.06], [464, 152, 62, -0.05], [524, 130, 66, -0.03], [588, 106, 72, 0], [664, 92, 84, 0.06]];
  function emblem(g, T, L, full) {
    plate(g, T, L, 232, 16, 560, 538);
    arrow(g, T, [472, 252, 560, 190, 650, 140, 742, 82], 18, ['#c8ff7a', '#4ad83a', '#1a7a2a'], 32); arrow(g, T, [500, 240, 600, 200, 680, 186, 748, 158], 12, ['#b8ffe0', '#3ad8a8', '#1a7a6a'], 24); arrow(g, T, [470, 236, 520, 196, 580, 168, 636, 150], 12, ['#ffe08a', '#ff9a2e', '#b8500a'], 22);
    ROW.forEach(function (v, i) { var s = SPOT[i]; tile(g, T, L, v, s[0], s[1], s[2], s[3]); });
    if (full) { clock(g, T, 330, 112, 24); [[400, 118, 8], [726, 50, 9], [770, 230, 8], [268, 330, 7], [750, 470, 9]].forEach(function (s) { T.spark(g, s[0], s[1], s[2] * 1.7, '#fff6c0', 0.95); }); }
    tile(g, T, L, 2, 344, 398, 96, -0.12); gauge(g, T, 688, 404, 50);
    words(g, T, L, 514, 296, 476, 1);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') {
      g.fillStyle = T.rad(g, 512, 286, 40, 640, [0, L.bg[1], 1, L.bg[2]]); g.fillRect(0, 0, 1024, 572);
      g.save(); g.globalAlpha = 0.22; g.filter = 'blur(6px)'; tile(g, T, L, 2, 110, 420, 120, -0.1); tile(g, T, L, 4, 150, 150, 70, -0.1); tile(g, T, L, 512, 900, 70, 110, 0.05); tile(g, T, L, 8, 960, 300, 80, 0.1); tile(g, T, L, 2, 70, 140, 60, -0.1); g.restore();
      emblem(g, T, L, true); return;
    }
    if (kind === 'main') { g.translate(-222, -8); emblem(g, T, L, false); return; }
    if (kind === 'wide') { ROW.slice(0, 4).forEach(function (v, i) { tile(g, T, L, v, 36 + i * 46, 136 - i * 22, 40 + i * 4, -0.06); }); arrow(g, T, [30, 168, 90, 150, 150, 110, 196, 40], 9, ['#c8ff7a', '#4ad83a', '#1a7a2a'], 18); words(g, T, L, 540, 152, 0, 0.82, true); return; }
    if (kind === 'badge') {
      if (px >= 90) { g.translate(200, 200); g.scale(0.7, 0.7); g.translate(-512, -285); emblem(g, T, L, false); return; }
      g.translate(200, 200); g.scale(0.7, 0.7); g.translate(-512, -285); plate(g, T, L, 232, 16, 560, 538); arrow(g, T, [330, 420, 420, 300, 560, 200, 700, 110], 34, ['#c8ff7a', '#4ad83a', '#1a7a2a'], 56); tile(g, T, L, 2, 380, 380, 200, -0.12); tile(g, T, L, 512, 630, 210, 170, 0.06); return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO double-up END
