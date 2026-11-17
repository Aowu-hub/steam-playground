// 🏷️ LOGO numbergrid START — 🔢 Digitinct (GameID numbergrid), drawn in code from Aowu's picture (gl-3)
GameLogos.add('numbergrid', (function () {
  // design space = Aowu's picture, 1024 × 572
  var BOX = { scene: [1024, 572], main: [560, 548], wide: [760, 200], badge: [400, 400] };
  // a real, finished 3 × 3 box (each of 1–9 once); the middle-bottom square is the one being solved (smiley)
  var CELLS = [3, 8, 1, 6, 7, 9, 2, 0, 4], MISSING = 5;
  var TILE = ['#ffa63a', '#ff8fc4', '#3fd0c0', '#ffd23e', '#9a6cf5', '#5ad06a', '#ff6a5a', '#ff9ad0', '#62d84a'];
  function mk(o) { var b = { bg: ['#3fc8ff', '#5aa0fa', '#b45af5'], icon: ['#4f9cff', '#5a62f0', '#9a4ae8'], rim: '#bfe9ff', plate: ['#8a7af5', '#5a48c8'], tile: TILE, ink: '#3b2f9a', word: ['#ffffff', '#f4f0ff', '#dcd4ff'], out: ['#5a6af0', '#35298f'], arrow: ['#7ad0ff', '#4a7af0'], syms: null, glow: 'rgba(140,220,255,.9)' }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = {
    classic: mk({}),   // the game's 'numbers' theme has no entry on purpose: an unknown look falls back to classic
    animals: mk({ bg: ['#9ae86a', '#4fc87a', '#2a9a8a'], icon: ['#6ad85a', '#3fb06a', '#2a8a7a'], rim: '#e0ffc8', plate: ['#5ab84a', '#2f7a2a'], ink: '#1f5a1a', out: ['#3fa84a', '#1f6a2a'], arrow: ['#d8ff8a', '#5ac83a'], glow: 'rgba(190,255,150,.9)', syms: ['🐶', '🐱', '🐰', '🐸', '🐵', '🐷', '🐮', '🦁', '🐼'] }),
    monsters: mk({ bg: ['#b08aff', '#7a52e8', '#3a1a9a'], icon: ['#9a7af5', '#6a3fe0', '#3a1a9a'], rim: '#e8dcff', plate: ['#6a4ae0', '#2a1470'], ink: '#2a1470', out: ['#7a4af0', '#3a1a9a'], arrow: ['#c8ffa0', '#5ad06a'], glow: 'rgba(200,170,255,.9)', syms: ['👽', '👾', '🤖', '👻', '👹', '🐲', '🦑', '🎃', '🧟'] }),
    vehicles: mk({ bg: ['#ffd88a', '#ffa84a', '#f06a3a'], icon: ['#ffc05a', '#f58a3a', '#e0582a'], rim: '#fff0c8', plate: ['#f0903a', '#a8500e'], ink: '#7a3a0a', out: ['#f0802a', '#a84a0e'], arrow: ['#fff2a0', '#ffb02e'], glow: 'rgba(255,220,150,.9)', syms: ['🚗', '🚌', '🚑', '🚒', '🚜', '🚲', '🚀', '🚁', '🚂'] }),
    fantasy: mk({ bg: ['#ffb0e0', '#f070c0', '#a04ae0'], icon: ['#ff9ad8', '#e85ab8', '#a04ae0'], rim: '#ffe6f6', plate: ['#e060b0', '#8a1f6a'], ink: '#7a1f5c', out: ['#e85ab8', '#8a2a9a'], arrow: ['#fff0a0', '#ffb8e8'], glow: 'rgba(255,190,235,.9)', syms: ['🦄', '🧚', '🐉', '🏰', '🔮', '👑', '🧞', '🌈', '💎'] }),
    space: mk({ bg: ['#2a2a7a', '#1a1458', '#06061e'], icon: ['#3a3aa8', '#2a1f7a', '#12104a'], rim: '#9fb0ff', plate: ['#3a2aa0', '#12104a'], ink: '#12104a', out: ['#5a5af0', '#1a1470'], arrow: ['#9fe8ff', '#5a7af0'], glow: 'rgba(130,160,255,.9)', syms: ['🚀', '🛸', '🛰️', '🪐', '🌍', '🌙', '☄️', '⭐', '👨‍🚀'] })
  };
  var TAU = Math.PI * 2;

  function bg(g, L, T) {
    g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, L.bg[0], 0.5, L.bg[1], 1, L.bg[2]]); g.fillRect(0, 0, 1024, 572);
    g.fillStyle = T.rad(g, 512, 270, 150, 380, [0, 'rgba(140,255,255,.95)', 0.55, 'rgba(120,235,255,.4)', 1, 'rgba(120,230,255,0)']); g.fillRect(0, 0, 1024, 572);
  }
  function icon(g, L, T, x, y, S, gk) { gk = gk || 1;   // the glowing rounded-square plate
    g.save(); g.shadowColor = L.glow; g.shadowBlur = 90 * gk; T.rr(g, x, y, S, S, S * 0.2); g.fillStyle = L.rim; g.fill(); g.shadowBlur = 44 * gk; g.fill(); g.shadowBlur = 0;
    T.rr(g, x + 5, y + 5, S - 10, S - 10, S * 0.19); g.fillStyle = T.lin(g, x, y, x + S, y + S, [0, L.icon[0], 0.5, L.icon[1], 1, L.icon[2]]); g.fill();
    g.save(); T.rr(g, x + 5, y + 5, S - 10, S - 10, S * 0.19); g.clip();
    g.fillStyle = T.rad(g, x + S * 0.3, y + S * 0.2, 0, S * 0.8, [0, 'rgba(255,255,255,.4)', 1, 'rgba(255,255,255,0)']); g.fillRect(x, y, S, S);
    // tiny floating bits: 0 / 1 and dots
    var r = T.rng(8); g.font = '700 ' + S * 0.045 + 'px ' + T.FONT; g.textAlign = 'center';
    for (var i = 0; i < 26; i++) { var px = x + S * (0.08 + r() * 0.84), py = y + S * (0.08 + r() * 0.6); g.globalAlpha = 0.35 + r() * 0.4; g.fillStyle = '#eaf6ff'; if (i % 3 === 0) g.fillText(i % 2 ? '0' : '1', px, py); else { g.beginPath(); g.arc(px, py, 1.4 + r() * 2, 0, TAU); g.fill(); } }
    g.globalAlpha = 1; g.restore();
    // neon rim: a bright tube with a soft halo, inside the edge
    g.shadowColor = L.glow; g.shadowBlur = 18; T.rr(g, x + 10, y + 10, S - 20, S - 20, S * 0.175); g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.9)'; g.stroke(); g.shadowBlur = 0; g.restore();
  }
  function swoosh(g, L, T, cx, cy, k) {   // the arrow sweeping up behind the tiles
    g.save(); g.translate(cx, cy); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round';
    function body() { g.beginPath(); g.moveTo(-150, 96); g.bezierCurveTo(-60, 150, 90, 110, 138, -40); }
    body(); g.lineWidth = 22; g.strokeStyle = 'rgba(30,40,150,.35)'; g.stroke(); g.shadowColor = L.arrow[0]; g.shadowBlur = 22; body(); g.lineWidth = 15; g.strokeStyle = T.lin(g, -150, 100, 140, -60, [0, 'rgba(255,255,255,0)', 0.35, L.arrow[1], 1, L.arrow[0]]); g.stroke();
    g.save(); g.translate(140, -46); g.rotate(-1.22); g.beginPath(); g.moveTo(26, 0); g.lineTo(-12, -24); g.lineTo(-6, 0); g.lineTo(-12, 24); g.closePath(); g.fillStyle = L.arrow[0]; g.fill(); g.lineWidth = 4; g.strokeStyle = 'rgba(30,40,150,.4)'; g.stroke(); g.restore();
    g.restore();
  }
  function smile(g, x, y, s, ink) { g.save(); g.translate(x, y); g.fillStyle = ink; g.beginPath(); g.arc(-s * 0.2, -s * 0.1, s * 0.07, 0, TAU); g.arc(s * 0.2, -s * 0.1, s * 0.07, 0, TAU); g.fill(); g.beginPath(); g.arc(0, s * 0.02, s * 0.24, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = s * 0.07; g.lineCap = 'round'; g.strokeStyle = ink; g.stroke(); g.fillStyle = 'rgba(255,90,120,.4)'; g.beginPath(); g.arc(-s * 0.3, s * 0.1, s * 0.08, 0, TAU); g.arc(s * 0.3, s * 0.1, s * 0.08, 0, TAU); g.fill(); g.restore(); }
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; function m(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); } return 'rgb(' + m(r) + ',' + m(gg) + ',' + m(b) + ')'; }
  function tiles(g, L, T, cx, cy, s, tilt) {   // s = tile size
    var gap = s * 0.1, W = s * 3 + gap * 2, pad = s * 0.16;
    g.save(); g.translate(cx, cy); g.rotate(tilt == null ? 0.1 : tilt); g.transform(1, 0, -0.05, 0.95, 0, 0);
    // base plate with a thick lower lip
    g.shadowColor = 'rgba(20,20,110,.45)'; g.shadowBlur = 20; g.shadowOffsetY = 10; T.rr(g, -W / 2 - pad, -W / 2 - pad + s * 0.12, W + pad * 2, W + pad * 2, s * 0.26); g.fillStyle = L.plate[1]; g.fill(); g.shadowColor = 'transparent';
    T.rr(g, -W / 2 - pad, -W / 2 - pad, W + pad * 2, W + pad * 2, s * 0.26); g.fillStyle = T.lin(g, 0, -W / 2, 0, W / 2, [0, L.plate[0], 1, shade(L.plate[0], -0.18)]); g.fill(); g.lineWidth = s * 0.04; g.strokeStyle = 'rgba(255,255,255,.35)'; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (var i = 0; i < 9; i++) { var x = -W / 2 + (i % 3) * (s + gap), y = -W / 2 + ((i / 3) | 0) * (s + gap), c = L.tile[i], empty = CELLS[i] === 0;
      T.rr(g, x, y + s * 0.09, s, s, s * 0.22); g.fillStyle = shade(c, -0.3); g.fill();                         // lip
      g.save(); g.shadowColor = c; g.shadowBlur = s * 0.42; T.rr(g, x, y, s, s, s * 0.22); g.fillStyle = T.lin(g, 0, y, 0, y + s, [0, shade(c, 0.35), 0.5, c, 1, shade(c, -0.08)]); g.fill(); g.restore(); T.rr(g, x + s * 0.03, y + s * 0.03, s * 0.94, s * 0.94, s * 0.2); g.lineWidth = s * 0.035; g.strokeStyle = 'rgba(255,255,255,.7)'; g.stroke();
      T.rr(g, x + s * 0.09, y + s * 0.07, s * 0.82, s * 0.36, s * 0.16); g.fillStyle = 'rgba(255,255,255,.3)'; g.fill();  // gloss
      if (empty) { smile(g, x + s / 2, y + s * 0.52, s * 0.9, shade(c, -0.55)); continue; }
      if (L.syms) { g.font = s * 0.6 + 'px ' + T.FONT + ', "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"'; g.fillStyle = '#000'; g.fillText(L.syms[CELLS[i] - 1], x + s / 2, y + s * 0.56); }
      else { g.font = '700 ' + s * 0.7 + 'px ' + T.FONT; g.lineJoin = 'round'; g.lineWidth = s * 0.1; g.strokeStyle = shade(c, -0.42); g.strokeText(String(CELLS[i]), x + s / 2, y + s * 0.55); g.fillStyle = '#fff'; g.fillText(String(CELLS[i]), x + s / 2, y + s * 0.55); }
    }
    g.restore();
  }
  function word(g, L, T, cx, base, size) {
    var o = { spacing: size * 0.01, dark: L.out[1], side: L.out[0], ring: L.out[0], outline: size * 0.24, depth: size * 0.11, glow: L.glow, face: function () { return [0, L.word[0], 0.6, L.word[1], 1, L.word[2]]; } };
    var W = T.word(g, 'Digitinct', cx, base, size, o);
    T.gloss(g, 'Digitinct', cx, base, size, o, 0.5); return W;
  }
  function sparks(g, T, cx, cy, k) { [[-196, -150, 11], [150, -176, 13], [206, -60, 8], [-214, 30, 8], [176, 96, 9], [-150, 120, 7], [60, -196, 6]].forEach(function (s, i) { T.spark(g, cx + s[0] * k, cy + s[1] * k, s[2] * k, i % 2 ? '#fff6b0' : '#ffffff', 0.95); }); }
  function star(g, T, x, y, R) { T.star(g, x, y, R, R * 0.5); g.fillStyle = '#ffe14a'; g.fill(); g.lineWidth = R * 0.16; g.strokeStyle = '#c8860a'; g.lineJoin = 'round'; g.stroke(); }

  function emblem(g, L, T, gk) {   // picture coordinates
    icon(g, L, T, 300, 72, 424, gk);
    swoosh(g, L, T, 556, 262, 1.02); sparks(g, T, 512, 250, 0.95);
    tiles(g, L, T, 514, 238, 62);
    T.spark(g, 388, 142, 17, '#ffe14a', 1); T.spark(g, 648, 146, 13, '#d9a8ff', 1); star(g, T, 676, 330, 9);
    word(g, L, T, 512, 412, 100);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { bg(g, L, T); emblem(g, L, T); return; }
    if (kind === 'main') { g.translate(-232, -12); emblem(g, L, T); return; }
    if (kind === 'wide') { tiles(g, L, T, 96, 96, 46, -0.1); word(g, L, T, 466, 132, 108); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.82, 0.82); g.translate(-512, -284); if (px >= 90) { emblem(g, L, T, 0.28); } else { icon(g, L, T, 300, 72, 424, 0.28); tiles(g, L, T, 512, 284, 100); } return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO numbergrid END
