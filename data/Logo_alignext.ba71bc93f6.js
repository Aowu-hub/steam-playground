// 🏷️ LOGO alignext START — 🔴 Alignext, drawn in code from Aowu's picture (gl-16, round 6). Glossy pills, pegs and balls lined up on neon diagonals,
// a light beam behind the big ball, dashed guide lines + dots, thin rounded neon word "Align" blue + "ext" pink → orange with a ↗ over the x.
// Looks = the game's board themes (Alignext.html THEMES: background + edge colour → backdrop, guide lines, glow).
GameLogos.add('alignext', (function () {
  var BOX = { scene: [1024, 572], main: [560, 470], wide: [860, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, ANG = -0.6;
  function mk(o) { var b = { bg: ['#123a7a', '#0a1f4a', '#050d26'], line: ['#ff9a3a', '#3ad8ff'], glow: '#3ab8ff', dark: '#0a1640',
    a: ['#d0faff', '#6ad4ff', '#2a8af0'], e: [['#ff9ad8', '#ff4aa8', '#e0208a'], ['#ffb08a', '#ff6a5a', '#f0403a'], ['#ffd08a', '#ff9a3a', '#f06a1a']] };
    for (var k in o) b[k] = o[k]; return b; }
  function th(bg, edge, extra) { var o = { bg: [bg[2], bg[1], bg[0]], line: [edge, edge], glow: edge }; for (var k in (extra || {})) o[k] = extra[k]; return mk(o); }
  var LOOK = { classic: mk({}),
    dino: th(['#14432A', '#4E9A4A', '#9BD06A'], '#9BD06A'), sea: th(['#03224F', '#0F6DB0', '#3FB8E8'], '#FFD1C7'), dance: th(['#12051F', '#3A0E5C', '#7A1C8C'], '#FF3DA5'),
    robot: th(['#081128', '#16305E', '#2C5A9A'], '#18E7FF'), space: th(['#02030F', '#10144A', '#2B2C7A'], '#B9C6FF'), sky: th(['#5BB4EE', '#A8DBFA', '#EAF7FF'], '#E2B13C', { dark: '#2B1F45' }) };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* glossy pieces (one light from the upper left) */
  function ball(g, T, x, y, r, c) { g.save(); g.shadowColor = c; g.shadowBlur = r * 0.9; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.35, y - r * 0.4, r * 0.1, r * 1.15, [0, sh(c, 0.7), 0.35, c, 1, sh(c, -0.45)]); g.fill(); g.restore();
    g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.42, r * 0.34, r * 0.18, -0.5, 0, TAU); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill(); }
  function pill(g, T, x, y, len, w, c1, c2, rot) {   // two-tone capsule along the diagonal
    g.save(); g.translate(x, y); g.rotate(rot == null ? ANG : rot); var r = w / 2;
    function path() { g.beginPath(); g.moveTo(-len / 2 + r, -r); g.lineTo(len / 2 - r, -r); g.arc(len / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2); g.lineTo(-len / 2 + r, r); g.arc(-len / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5); g.closePath(); }
    g.save(); g.shadowColor = c2 || c1; g.shadowBlur = w * 0.7; path(); g.fillStyle = c1; g.fill(); g.restore();
    g.save(); path(); g.clip(); if (c2) { g.fillStyle = c2; g.fillRect(0, -w, len, w * 2); }
    g.fillStyle = T.lin(g, 0, -r, 0, r, [0, 'rgba(255,255,255,.55)', 0.35, 'rgba(255,255,255,.08)', 0.75, 'rgba(0,0,40,.12)', 1, 'rgba(0,0,40,.4)']); g.fillRect(-len, -w, len * 2, w * 2);
    g.fillStyle = 'rgba(255,255,255,.75)'; GameLogos.tools.rr(g, -len / 2 + r * 0.7, -r * 0.72, len - r * 1.4, r * 0.32, r * 0.16); g.fill(); g.restore(); g.restore();
  }
  function peg(g, T, x, y, r, h, c) {   // a short cylinder seen from above-front
    g.save(); g.shadowColor = c; g.shadowBlur = r * 0.8; g.beginPath(); g.ellipse(x, y + h / 2, r, r * 0.42, 0, 0, Math.PI); g.lineTo(x - r, y - h / 2); g.ellipse(x, y - h / 2, r, r * 0.42, 0, Math.PI, 0, true); g.closePath();
    g.fillStyle = T.lin(g, x - r, 0, x + r, 0, [0, sh(c, 0.25), 0.4, c, 1, sh(c, -0.4)]); g.fill(); g.restore();
    g.beginPath(); g.ellipse(x, y - h / 2, r, r * 0.42, 0, 0, TAU); g.fillStyle = T.rad(g, x - r * 0.3, y - h / 2 - r * 0.1, 1, r, [0, sh(c, 0.75), 1, sh(c, 0.2)]); g.fill();
    g.beginPath(); g.ellipse(x - r * 0.62, y + h * 0.05, r * 0.12, h * 0.32, 0, 0, TAU); g.fillStyle = 'rgba(255,255,255,.5)'; g.fill();
  }
  function guides(g, T, L) {   // dashed neon diagonals + dots
    g.save(); g.lineWidth = 2.5; g.setLineDash([7, 8]); g.lineCap = 'round';
    [[360, 300, 520, 186, 0], [400, 356, 600, 214, 1], [470, 360, 640, 240, 0], [416, 232, 560, 130, 1], [520, 306, 668, 196, 0]].forEach(function (l) { g.strokeStyle = L.line[l[4]]; g.shadowColor = L.line[l[4]]; g.shadowBlur = 8; g.globalAlpha = 0.75; g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    g.setLineDash([]); g.globalAlpha = 1; var r = T.rng(12); for (var i = 0; i < 34; i++) { var t = r(), x = 370 + t * 300 + (r() - 0.5) * 90, y = 330 - t * 220 + (r() - 0.5) * 90; g.fillStyle = [L.line[0], L.line[1], '#ff5ad8'][i % 3]; g.globalAlpha = 0.5 + r() * 0.5; g.beginPath(); g.arc(x, y, 1.5 + r() * 2.5, 0, TAU); g.fill(); } g.restore();
  }
  function emblem(g, T, L, full) {
    g.save(); g.translate(512, 222); g.scale(0.88, 0.88); g.translate(-512, -222);
    guides(g, T, L);
    // light beam behind the big ball, down the main diagonal
    g.save(); g.translate(616, 128); g.rotate(2.41); g.fillStyle = T.lin(g, 0, 0, 170, 0, [0, 'rgba(120,220,255,.55)', 1, 'rgba(120,220,255,0)']); g.beginPath(); g.moveTo(0, -36); g.lineTo(170, -22); g.lineTo(170, 22); g.lineTo(0, 36); g.closePath(); g.fill(); g.restore();
    // the thread joining the main diagonal (as pictured)
    g.save(); g.strokeStyle = 'rgba(255,190,140,.8)'; g.lineWidth = 3; g.shadowColor = '#ffb07a'; g.shadowBlur = 8; g.beginPath(); g.moveTo(405, 316); g.lineTo(616, 128); g.stroke(); g.restore();
    pill(g, T, 446, 194, 128, 42, '#3ab8ff', null); pill(g, T, 420, 252, 104, 42, '#ff8a2e', '#ff4aa8');
    pill(g, T, 524, 300, 104, 40, '#ff4a6a', '#3a9aff'); pill(g, T, 566, 262, 84, 38, '#ff9a2e', '#3ab8ff'); pill(g, T, 612, 212, 70, 34, '#ff5a7a', null);
    ball(g, T, 405, 316, 30, '#2a9aff'); ball(g, T, 460, 281, 27, '#e04ad8'); peg(g, T, 512, 234, 30, 30, '#2ad8f5'); peg(g, T, 563, 180, 32, 34, '#ff8a3a'); ball(g, T, 616, 128, 36, '#2ad8ff');
    if (full) { T.spark(g, 556, 116, 13, '#ff7ad8', 0.95); T.spark(g, 656, 168, 12, '#ffb84a', 0.95); T.spark(g, 586, 88, 7, '#ffd23a', 0.9); g.save(); g.strokeStyle = '#ff8a3a'; g.lineWidth = 4; g.lineCap = 'round'; [[630, 84, 634, 70], [652, 98, 664, 88], [660, 122, 674, 120]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); }); g.restore(); }
    g.restore();
  }
  /* thin rounded neon word */
  function words(g, T, L, cx, base, size) {
    var s = size, w = { weight: 600, spacing: s * 0.01, dark: L.dark, outline: s * 0.05, depth: 0, glow: null, inner: null };
    g.save(); g.font = '600 ' + s + 'px ' + T.FONT; var wa = g.measureText('Align').width + 4 * s * 0.01, we = g.measureText('ext').width + 2 * s * 0.01; g.restore();
    var x0 = cx - (wa + we) / 2;
    var A = Object.assign({}, w, { face: function (j) { var k = j / 4; return [0, L.a[0], 0.5, k < 0.5 ? L.a[1] : L.a[2], 1, L.a[2]]; }, glow: L.glow, glowN: 3, glowBlur: 0.4 });
    var E = Object.assign({}, w, { face: function (j) { var c = L.e[j]; return [0, c[0], 0.5, c[1], 1, c[2]]; }, glow: '#ff6ab8', glowN: 3, glowBlur: 0.4 });
    T.word(g, 'Align', x0 + wa / 2, base, s, A); T.gloss(g, 'Align', x0 + wa / 2, base, s, A, 0.4);
    T.word(g, 'ext', x0 + wa + we / 2, base, s, E); T.gloss(g, 'ext', x0 + wa + we / 2, base, s, E, 0.4);
    // the little ↗ over the x
    g.save(); g.font = '600 ' + s + 'px ' + T.FONT; var xx = x0 + wa + g.measureText('e').width + g.measureText('x').width * 0.55; g.restore();
    g.save(); g.translate(xx, base - s * 0.78); g.rotate(-0.75); g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = '#3ad8ff'; g.shadowBlur = s * 0.12;
    g.strokeStyle = T.lin(g, -s * 0.22, 0, s * 0.22, 0, [0, '#ff8a3a', 1, '#3ad8ff']); g.lineWidth = s * 0.07; g.beginPath(); g.moveTo(-s * 0.22, 0); g.lineTo(s * 0.18, 0); g.stroke();
    g.beginPath(); g.moveTo(s * 0.06, -s * 0.11); g.lineTo(s * 0.2, 0); g.lineTo(s * 0.06, s * 0.11); g.stroke(); g.restore();
  }
  function backdrop(g, T, L, x, y, w, h) { g.fillStyle = T.rad(g, x + w / 2, y + h * 0.4, 20, Math.max(w, h) * 0.7, [0, L.bg[0], 0.5, L.bg[1], 1, L.bg[2]]); g.fillRect(x, y, w, h); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { backdrop(g, T, L, 0, 0, 1024, 572); emblem(g, T, L, true); words(g, T, L, 512, 460, 112); return; }
    if (kind === 'main') { g.translate(-232, -40); emblem(g, T, L, px >= 220); words(g, T, L, 512, 460, 112); return; }
    if (kind === 'wide') { g.save(); g.translate(104, 100); g.scale(0.56, 0.56); g.translate(-512, -222); emblem(g, T, L, false); g.restore(); words(g, T, L, 530, 138, 112); return; }
    if (kind === 'badge') {
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.clip(); backdrop(g, T, L, 14, 14, 372, 372); g.restore();
      g.save(); T.rr(g, 14, 14, 372, 372, 84); g.lineWidth = 6; g.strokeStyle = L.glow; g.shadowColor = L.glow; g.shadowBlur = 14; g.stroke(); g.restore();
      if (px >= 90) { g.translate(200, 196); g.scale(0.66, 0.66); g.translate(-512, -290); emblem(g, T, L, false); words(g, T, L, 512, 460, 112); }
      else { g.translate(200, 200); g.scale(1.05, 1.05); g.translate(-512, -222); emblem(g, T, L, false); }
      return;
    }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO alignext END
