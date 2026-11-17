// 🏷️ LOGO memory START — 🃏 Memories Match, drawn in code from Aowu's picture (gl-4)
GameLogos.add('memory', (function () {
  var BOX = { scene: [1024, 572], main: [500, 520], wide: [820, 200], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#1c2c4e', '#2a3f66'], icon: ['#3f9af5', '#62b4f8', '#ff9fb4', '#ff7a52'], rim: '#dff0ff', cardA: ['#d6ecff', '#6fb0f5'], cardB: ['#fffaf0', '#f3dcc0'], edge: '#7a2a52',
    w1: ['#fff59a', '#ffd23a', '#ffa41c', '#ff8a14'], w2: ['#ffd0e6', '#ff7ab8', '#f04a98', '#d82a80'], w2b: ['#ffffff', '#fff0f6', '#ffd0e6', '#ffb0d4'], dark: '#6a1f4a', sym: null, heart: ['#ff8a70', '#ff4a78', '#d82a6a'], ring: '#ffe27a' };
    for (var k in o) b[k] = o[k]; return b; }
  var LOOK = {
    classic: mk({}),
    monsters: mk({ icon: ['#7b2ff7', '#6a6af0', '#3fc8c0', '#2ec4b6'], sym: '👾', w2: ['#d8fff8', '#6af0e0', '#2ec4b6', '#1a9a8a'], dark: '#2a1470', edge: '#2a1470', ring: '#b8fff0' }),
    heroes: mk({ icon: ['#e63946', '#f06a4a', '#ffa82a', '#ffb703'], sym: '🦸', w2: ['#fff0c8', '#ffd04a', '#ffb703', '#e08a00'], dark: '#7a1420', edge: '#7a1420' }),
    animals: mk({ icon: ['#4cb963', '#7ad06a', '#d8d04a', '#ffc845'], sym: '🐶', w2: ['#f0ffd8', '#a8e86a', '#4cb963', '#2a8a3a'], dark: '#1f5a2a', edge: '#1f5a2a', ring: '#fff2a0' }),
    people: mk({ icon: ['#ff8fb1', '#e080c0', '#a06ae0', '#7b5fe0'], sym: '😊', dark: '#4a1f7a', edge: '#4a1f7a' }),
    vehicles: mk({ icon: ['#3a86ff', '#3aa8e8', '#1ac8b0', '#06d6a0'], sym: '🚗', w2: ['#e0fff6', '#6af0c8', '#06d6a0', '#04a07a'], dark: '#0f3a7a', edge: '#0f3a7a', ring: '#c8fff0' })
  };
  var TAU = Math.PI * 2;
  function heart(g, T, L, x, y, s, rainbow) {
    function p() { g.beginPath(); g.moveTo(0, s * 0.34); g.bezierCurveTo(-s * 0.62, -s * 0.08, -s * 0.36, -s * 0.52, 0, -s * 0.22); g.bezierCurveTo(s * 0.36, -s * 0.52, s * 0.62, -s * 0.08, 0, s * 0.34); g.closePath(); }
    g.save(); g.translate(x, y); p(); g.fillStyle = rainbow ? T.lin(g, -s * 0.5, 0, s * 0.5, 0, [0, '#ff6a7a', 0.25, '#ffb04a', 0.5, '#ffe45a', 0.72, '#6ad88a', 1, '#5aa8ff']) : T.lin(g, 0, -s * 0.4, 0, s * 0.34, [0, L.heart[0], 0.5, L.heart[1], 1, L.heart[2]]); g.fill();
    g.lineWidth = s * 0.07; g.strokeStyle = L.edge; g.lineJoin = 'round'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-s * 0.2, -s * 0.2, s * 0.1, s * 0.06, -0.6, 0, TAU); g.fill();
    g.fillStyle = '#3a1428'; g.beginPath(); g.arc(-s * 0.13, -s * 0.02, s * 0.04, 0, TAU); g.arc(s * 0.13, -s * 0.02, s * 0.04, 0, TAU); g.fill();
    g.beginPath(); g.arc(0, s * 0.03, s * 0.08, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = s * 0.035; g.lineCap = 'round'; g.strokeStyle = '#3a1428'; g.stroke();
    g.fillStyle = 'rgba(255,110,140,.5)'; g.beginPath(); g.arc(-s * 0.24, s * 0.06, s * 0.05, 0, TAU); g.arc(s * 0.24, s * 0.06, s * 0.05, 0, TAU); g.fill(); g.restore();
  }
  function card(g, T, L, x, y, w, rot, col) {
    var h = w * 1.36; g.save(); g.translate(x, y); g.rotate(rot);
    g.shadowColor = 'rgba(40,20,80,.4)'; g.shadowBlur = w * 0.14; g.shadowOffsetY = w * 0.06; T.rr(g, -w / 2, -h / 2, w, h, w * 0.14); g.fillStyle = '#fff'; g.fill(); g.shadowColor = 'transparent';
    g.lineWidth = w * 0.045; g.strokeStyle = L.edge; g.stroke();
    T.rr(g, -w / 2 + w * 0.08, -h / 2 + w * 0.08, w * 0.84, h - w * 0.16, w * 0.09); g.fillStyle = T.lin(g, 0, -h / 2, 0, h / 2, [0, col[0], 1, col[1]]); g.fill();
    if (L.sym) { g.font = w * 0.56 + 'px ' + T.FONT + ', "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText(L.sym, 0, w * 0.04); }
    else heart(g, T, L, 0, 0, w * 0.9);          // a REAL pair: both cards show the same heart
    g.fillStyle = 'rgba(255,255,255,.35)'; T.rr(g, -w / 2 + w * 0.12, -h / 2 + w * 0.12, w * 0.3, w * 0.12, w * 0.06); g.fill();
    g.restore();
  }
  function pair(g, T, L, cx, cy, k) {
    // golden swirl round both cards
    g.save(); g.translate(cx, cy + 22 * k); g.rotate(-0.08); g.lineCap = 'round';
    [[150, 46, 7, 0.95], [168, 54, 3, 0.6]].forEach(function (e) { g.beginPath(); g.ellipse(0, 0, e[0] * k, e[1] * k, 0, Math.PI * 0.08, Math.PI * 0.98); g.lineWidth = e[2] * k; g.strokeStyle = L.ring; g.globalAlpha = e[3]; g.shadowColor = L.ring; g.shadowBlur = 12 * k; g.stroke(); }); g.restore();
    card(g, T, L, cx - 62 * k, cy, 118 * k, -0.2, L.cardA); card(g, T, L, cx + 62 * k, cy - 6 * k, 118 * k, 0.17, L.cardB);
    g.save(); g.translate(cx, cy + 22 * k); g.rotate(-0.08); g.lineCap = 'round'; g.beginPath(); g.ellipse(0, 0, 150 * k, 46 * k, 0, Math.PI * 1.06, Math.PI * 1.94, true); g.lineWidth = 6 * k; g.strokeStyle = L.ring; g.shadowColor = L.ring; g.shadowBlur = 12 * k; g.globalAlpha = 0.9; g.stroke(); g.restore();
    // the spark where they meet + wiggle lines
    g.save(); g.shadowColor = '#fff6b0'; g.shadowBlur = 20 * k; T.spark(g, cx, cy - 18 * k, 34 * k, '#fffbe0', 1); T.spark(g, cx, cy - 18 * k, 18 * k, '#ffe14a', 1); g.restore();
    g.strokeStyle = L.edge; g.lineWidth = 3 * k; g.lineCap = 'round'; [[-150, -52, -138, -30], [-160, -30, -150, -12], [150, -62, 140, -40], [162, -38, 152, -20]].forEach(function (q) { g.beginPath(); g.moveTo(cx + q[0] * k, cy + q[1] * k); g.lineTo(cx + q[2] * k, cy + q[3] * k); g.stroke(); });
  }
  function confetti(g, T, x, y, w, h, seed, n) { var r = T.rng(seed), cols = ['#ffd23e', '#ff7ab8', '#7ad0ff', '#ffffff', '#ff9a4a', '#a8e86a']; for (var i = 0; i < n; i++) { var px = x + r() * w, py = y + r() * h, s = 3 + r() * 6; g.save(); g.translate(px, py); g.rotate(r() * 6); g.globalAlpha = 0.6 + r() * 0.4; g.fillStyle = cols[i % 6]; if (i % 3 === 0) T.spark(g, 0, 0, s * 1.3, cols[i % 6], 0.95); else if (i % 3 === 1) g.fillRect(-s, -s * 0.4, s * 2, s * 0.8); else { g.beginPath(); g.arc(0, 0, s * 0.45, 0, TAU); g.fill(); } g.restore(); } }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    function o(face, sz) { return { spacing: sz * 0.012, dark: L.dark, outline: sz * 0.2, depth: sz * 0.085, face: face, inner: 'rgba(255,255,255,.5)' }; }
    function white(str, x, y, sz, op) { g.save(); g.font = '700 ' + sz + 'px ' + T.FONT; g.lineJoin = 'round'; g.restore(); var w = { spacing: op.spacing, dark: '#ffffff', outline: sz * 0.36, depth: op.depth, face: function () { return [0, '#fff', 1, '#fff']; } }; T.word(g, str, x, y, sz, w); }
    var f1 = function () { return [0, L.w1[0], 0.3, L.w1[1], 0.7, L.w1[2], 1, L.w1[3]]; }, f2 = function (j) { var c = j < 2 ? L.w2 : L.w2b; return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; };
    var s1 = 70 * k, s2 = 76 * k, a = o(f1, s1), b = o(f2, s2);
    if (oneLine) { g.font = '700 ' + s1 + 'px ' + T.FONT; var wa = g.measureText('Memories').width + 7 * s1 * 0.012; g.font = '700 ' + s2 + 'px ' + T.FONT; var wb = g.measureText('Match').width + 4 * s2 * 0.012, gap = 22 * k, x0 = cx - (wa + gap + wb) / 2; white('Memories', x0 + wa / 2, y1, s1, a); white('Match', x0 + wa + gap + wb / 2, y1, s2, b); T.word(g, 'Memories', x0 + wa / 2, y1, s1, a); T.gloss(g, 'Memories', x0 + wa / 2, y1, s1, a, 0.5); T.word(g, 'Match', x0 + wa + gap + wb / 2, y1, s2, b); T.gloss(g, 'Match', x0 + wa + gap + wb / 2, y1, s2, b, 0.5); return; }
    white('Memories', cx, y1, s1, a); white('Match', cx, y2, s2, b);
    T.word(g, 'Memories', cx, y1, s1, a); T.gloss(g, 'Memories', cx, y1, s1, a, 0.5); T.word(g, 'Match', cx, y2, s2, b); T.gloss(g, 'Match', cx, y2, s2, b, 0.5);
  }
  function icon(g, T, L, x, y, S) {
    g.save(); g.shadowColor = 'rgba(10,20,60,.55)'; g.shadowBlur = 30; g.shadowOffsetY = 12; T.rr(g, x, y, S, S * 1.04, S * 0.19); g.fillStyle = T.lin(g, x, y, x + S, y + S, [0, L.icon[0], 0.4, L.icon[1], 0.72, L.icon[2], 1, L.icon[3]]); g.fill(); g.shadowColor = 'transparent';
    g.save(); T.rr(g, x, y, S, S * 1.04, S * 0.19); g.clip(); g.fillStyle = T.rad(g, x + S * 0.5, y + S * 0.38, 10, S * 0.6, [0, 'rgba(255,250,220,.6)', 0.6, 'rgba(255,255,255,.1)', 1, 'rgba(255,255,255,0)']); g.fillRect(x, y, S, S * 1.04); confetti(g, T, x, y, S, S * 1.04, 14, 110); g.restore();
    T.rr(g, x + 2, y + 2, S - 4, S * 1.04 - 4, S * 0.185); g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.55)'; g.stroke(); g.restore();
  }
  function emblem(g, T, L) { icon(g, T, L, 298, 62, 428); pair(g, T, L, 512, 218, 1.28); words(g, T, L, 512, 404, 476, 1.08); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, L.sky[0], 1, L.sky[1]]); g.fillRect(0, 0, 1024, 572); g.fillStyle = 'rgba(255,255,255,.04)'; T.rr(g, 232, -40, 560, 660, 60); g.fill(); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-262, -30); emblem(g, T, L); return; }
    if (kind === 'wide') { card(g, T, L, 66, 104, 74, -0.2, L.cardA); card(g, T, L, 132, 100, 74, 0.17, L.cardB); T.spark(g, 99, 90, 20, '#ffe14a', 1); words(g, T, L, 502, 128, 0, 1.0, true); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.84, 0.84); g.translate(-512, -285); icon(g, T, L, 298, 62, 428); if (px >= 90) { pair(g, T, L, 512, 232, 1.05); words(g, T, L, 512, 410, 478, 1); } else pair(g, T, L, 512, 290, 1.4); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO memory END
