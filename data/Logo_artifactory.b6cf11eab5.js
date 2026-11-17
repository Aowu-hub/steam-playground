// 🏷️ LOGO artifactory START — 🏭 Artifactory, drawn in code from Aowu's picture (gl-29, round 11). A rounded-square workshop icon in a gold (left) +
// steel-blue (right) frame with gears and gem studs at the corners: a stone forge with fire, a crystal barrel, a tool shelf, a gnome tinkerer (pointy
// hat, goggles, white beard, hammer up) beside a big wooden crate bursting with light — a rainbow-swirl gear, crystals, planks, a scroll, a blueprint,
// a gold arrow, stars; carved fantasy lettering "ARTI" gold + "FACTORY" teal (T.serif — no web font) whose T is a sword and whose Y ends in a curl;
// gears, crystals and blueprints round the bottom; the blurred workshop island behind (scene). One look.
GameLogos.add('artifactory', (function () {
  var BOX = { scene: [1024, 572], main: [600, 600], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, IX = 252, IY = 28, IW = 520, IH = 517, ICX = 512, ICY = 286, INK = '#1a0e06';
  var LOOK = { classic: { gold: ['#fff2b0', '#f0c040', '#a86a10'], teal: ['#d8fff8', '#38d8d0', '#0a6a7a'], steel: ['#d8ecff', '#5a8ad0', '#1a3a7a'], wall: ['#3a4a6a', '#141a2c'] } };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  /* ---------- blurred workshop behind (scene) ---------- */
  function back(g, T) {
    g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, '#3a2a24', 0.45, '#2a3a2a', 1, '#24301e']); g.fillRect(0, 0, 1024, 572);
    function blob(x, y, rx, ry, c, a) { g.save(); g.globalAlpha = a; g.fillStyle = T.rad(g, x, y, 2, Math.max(rx, ry), [0, c, 0.3, c, 1, 'rgba(0,0,0,0)']); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.restore(); }
    blob(110, 120, 140, 160, '#5a5a66', 0.6); blob(140, 190, 70, 70, '#ff8a2a', 0.85); blob(140, 190, 34, 34, '#ffe08a', 0.9); blob(60, 300, 200, 60, '#5a3a24', 0.7); blob(170, 340, 40, 20, '#3ab8ff', 0.6); blob(110, 380, 30, 16, '#c86aff', 0.5);
    blob(90, 470, 120, 70, '#2a5a3a', 0.7); blob(200, 520, 90, 40, '#4a3a2a', 0.6); blob(30, 90, 30, 40, '#c86aff', 0.5);
    blob(900, 60, 160, 90, '#3a6a3a', 0.7); blob(980, 200, 80, 140, '#2a5a2a', 0.8); blob(830, 190, 70, 60, '#7a4a2a', 0.8); blob(840, 200, 20, 20, '#ffd23a', 0.6); blob(905, 240, 60, 70, '#6a6a7a', 0.8); blob(905, 250, 20, 20, '#c86aff', 0.8);
    blob(880, 390, 70, 80, '#6a6a7a', 0.8); blob(880, 400, 22, 22, '#ffa83a', 0.8); blob(990, 330, 60, 50, '#7a4a2a', 0.7); blob(960, 500, 80, 60, '#2a5a2a', 0.8); blob(820, 480, 60, 40, '#3a6a3a', 0.6);
    var r = T.rng(19); g.save(); g.globalCompositeOperation = 'lighter'; for (var i = 0; i < 30; i++) { var x = r() < 0.5 ? r() * 240 : 790 + r() * 234, y = r() * 572; g.fillStyle = T.rad(g, x, y, 0, 6, [0, 'rgba(255,220,150,.7)', 1, 'rgba(0,0,0,0)']); g.fillRect(x - 6, y - 6, 12, 12); } g.restore();
  }
  /* ---------- the icon ---------- */
  function shape(g, T) { T.rr(g, IX, IY, IW, IH, 66); }
  function frame(g, T, L, full) {
    g.save(); g.lineWidth = 18; shape(g, T); g.shadowColor = 'rgba(255,200,90,.8)'; g.shadowBlur = 22;
    g.save(); g.beginPath(); g.rect(0, 0, ICX, 572); g.clip(); shape(g, T); g.strokeStyle = T.lin(g, IX, IY, IX, IY + IH, [0, L.gold[0], 0.4, L.gold[1], 1, L.gold[2]]); g.stroke(); g.restore();
    g.shadowColor = 'rgba(90,170,255,.7)'; g.save(); g.beginPath(); g.rect(ICX, 0, 600, 572); g.clip(); shape(g, T); g.strokeStyle = T.lin(g, 0, IY, 0, IY + IH, [0, L.steel[0], 0.4, L.steel[1], 1, L.steel[2]]); g.stroke(); g.restore();
    g.shadowBlur = 0; g.lineWidth = 3; g.strokeStyle = INK; T.rr(g, IX - 9, IY - 9, IW + 18, IH + 18, 74); g.stroke(); T.rr(g, IX + 9, IY + 9, IW - 18, IH - 18, 58); g.stroke();
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.6)'; T.rr(g, IX - 4, IY - 4, IW + 8, IH + 8, 70); g.stroke();
    g.fillStyle = '#fff6c8'; [[ICX, IY - 9], [ICX, IY + IH + 9]].forEach(function (p) { g.fillRect(p[0] - 2, p[1] - 9, 4, 18); }); g.restore();
    [[IX + 26, IY + 46, L.gold, '#2ad8c8', 0], [IX + IW - 26, IY + 44, L.steel, '#2ad8c8', 1], [IX + 30, IY + IH - 40, L.gold, '#3a8aff', 2], [IX + IW - 28, IY + IH - 42, L.steel, '#c86aff', 3]].forEach(function (c) {
      T.gear(g, c[0] + (c[4] % 2 ? 12 : -12), c[1] + (c[4] < 2 ? -8 : 8), 34, 10, c[4] * 0.3, T.lin(g, c[0] - 34, c[1] - 34, c[0] + 34, c[1] + 34, [0, c[2][0], 0.5, c[2][1], 1, c[2][2]]), INK);
      g.fillStyle = T.rad(g, c[0] - 4, c[1] - 4, 1, 13, [0, '#ffffff', 0.4, c[3], 1, sh(c[3], -0.5)]); g.beginPath(); g.arc(c[0], c[1], 12, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); });
  }
  function wall(g, T, L) {
    g.fillStyle = T.lin(g, 0, IY, 0, IY + IH, [0, L.wall[0], 1, L.wall[1]]); g.fillRect(IX, IY, IW, IH);
    g.strokeStyle = 'rgba(10,14,28,.55)'; g.lineWidth = 2; for (var y = IY + 30, row = 0; y < IY + 300; y += 28, row++) { g.beginPath(); g.moveTo(IX, y); g.lineTo(IX + IW, y); g.stroke(); for (var x = IX + (row % 2) * 30; x < IX + IW; x += 60) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 28); g.stroke(); } }
    g.fillStyle = T.lin(g, 0, IY + 300, 0, IY + IH, [0, '#3a2a22', 1, '#1a120c']); g.fillRect(IX, IY + 300, IW, IH - 300);
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 520, 250, 10, 300, [0, 'rgba(255,220,150,.55)', 0.5, 'rgba(160,100,255,.2)', 1, 'rgba(0,0,0,0)']); g.fillRect(IX, IY, IW, IH); g.restore();
  }
  function forge(g, T) {
    g.save(); g.fillStyle = '#5a5e6a'; g.fillRect(300, 40, 46, 90); g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(300, 40, 46, 90);
    g.beginPath(); g.moveTo(268, 260); g.lineTo(268, 170); g.quadraticCurveTo(323, 100, 378, 170); g.lineTo(378, 260); g.closePath(); g.fillStyle = T.lin(g, 268, 0, 378, 0, [0, '#7a7e8a', 0.5, '#5a5e6a', 1, '#3a3e4a']); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(20,20,30,.6)'; g.lineWidth = 1.5; [[268, 200, 378, 200], [268, 230, 378, 230], [300, 170, 300, 200], [340, 200, 340, 230], [310, 230, 310, 260]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    g.beginPath(); g.moveTo(290, 250); g.lineTo(290, 196); g.quadraticCurveTo(323, 150, 356, 196); g.lineTo(356, 250); g.closePath(); g.fillStyle = '#1a0a04'; g.fill();
    g.save(); g.clip(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 323, 236, 2, 60, [0, '#fff4c0', 0.3, '#ffb02a', 0.7, '#ff4a0a', 1, 'rgba(120,20,0,.4)']); g.fillRect(286, 150, 74, 104);
    [[310, 248, 14, 30], [326, 248, 16, 42], [342, 248, 12, 28]].forEach(function (f) { g.fillStyle = T.lin(g, 0, f[1] - f[3], 0, f[1], [0, 'rgba(255,240,180,.9)', 1, 'rgba(255,120,20,.6)']); g.beginPath(); g.moveTo(f[0] - f[2] / 2, f[1]); g.quadraticCurveTo(f[0] - f[2] / 2, f[1] - f[3] * 0.6, f[0], f[1] - f[3]); g.quadraticCurveTo(f[0] + f[2] / 2, f[1] - f[3] * 0.6, f[0] + f[2] / 2, f[1]); g.fill(); }); g.restore();
    g.fillStyle = 'rgba(255,170,60,.35)'; g.beginPath(); g.ellipse(323, 262, 70, 12, 0, 0, TAU); g.fill(); g.restore();
  }
  function barrel(g, T) {
    g.save(); g.fillStyle = T.lin(g, 270, 0, 336, 0, [0, '#5a3418', 0.45, '#a8683a', 1, '#4a2a10']); g.beginPath(); g.moveTo(272, 286); g.quadraticCurveTo(266, 316, 274, 344); g.lineTo(334, 344); g.quadraticCurveTo(342, 316, 336, 286); g.closePath(); g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = '#3a3a44'; g.lineWidth = 4; [298, 330].forEach(function (y) { g.beginPath(); g.moveTo(270, y); g.lineTo(338, y); g.stroke(); }); g.fillStyle = '#2a1a0a'; g.beginPath(); g.ellipse(304, 286, 32, 7, 0, 0, TAU); g.fill();
    crystal(g, T, 294, 286, 12, 34, -0.3, '#c86aff'); crystal(g, T, 310, 288, 10, 26, 0.25, '#e8a0ff'); crystal(g, T, 318, 286, 8, 20, 0.5, '#a84aff'); g.restore();
  }
  function crystal(g, T, x, y, w, h, rot, col) {
    g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2, -h * 0.7); g.lineTo(0, -h); g.lineTo(w / 2, -h * 0.7); g.lineTo(w / 2, 0); g.closePath();
    g.fillStyle = T.lin(g, -w / 2, 0, w / 2, 0, [0, sh(col, 0.5), 0.5, col, 1, sh(col, -0.45)]); g.shadowColor = col; g.shadowBlur = 8; g.fill(); g.shadowBlur = 0; g.lineWidth = 1.6; g.strokeStyle = sh(col, -0.65); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(-w / 2 + 2, -h * 0.68); g.lineTo(0, -h + 3); g.lineTo(-1, -h * 0.4); g.closePath(); g.fill(); g.restore();
  }
  function shelf(g, T) {
    g.save(); g.fillStyle = '#6a4220'; g.fillRect(690, 268, 76, 10); g.fillRect(700, 278, 8, 40); g.fillRect(752, 278, 8, 40); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(690, 268, 76, 10);
    g.fillStyle = '#5a6aa8'; T.rr(g, 708, 230, 26, 38, 5); g.fill(); g.stroke(); g.strokeStyle = '#c8c8d0'; g.lineWidth = 3; [[714, 230, 708, 206], [722, 230, 726, 200], [730, 230, 740, 208]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    crystal(g, T, 748, 268, 10, 24, 0.2, '#3ad8ff'); g.restore();
  }
  function chevrons(g, T, x, y, n, s) { g.save(); g.strokeStyle = '#ffd23a'; g.shadowColor = '#ffb02a'; g.shadowBlur = 8; g.lineWidth = 3.5 * s; g.lineCap = 'round'; g.lineJoin = 'round'; for (var i = 0; i < n; i++) { var yy = y - i * 13 * s; g.globalAlpha = 1 - i * 0.18; g.beginPath(); g.moveTo(x - 8 * s, yy + 6 * s); g.lineTo(x, yy - 2 * s); g.lineTo(x + 8 * s, yy + 6 * s); g.stroke(); } g.restore(); }
  function plank(g, T, x, y, w, h, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = T.lin(g, 0, -h / 2, 0, h / 2, [0, '#d8964a', 1, '#8a5420']); g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = 2; g.strokeStyle = INK; g.strokeRect(-w / 2, -h / 2, w, h); g.strokeStyle = 'rgba(80,40,10,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-w / 2 + 4, -h * 0.1); g.lineTo(w / 2 - 6, -h * 0.15); g.stroke(); g.restore(); }
  function blueprint(g, T, x, y, w, h, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2 + 4); g.lineTo(w / 2 - 3, h / 2); g.lineTo(-w / 2 + 3, h / 2 - 3); g.closePath(); g.fillStyle = T.lin(g, -w / 2, 0, w / 2, 0, [0, '#4a8aff', 1, '#2a5ad0']); g.fill(); g.lineWidth = 2; g.strokeStyle = '#0a2a6a'; g.stroke();
    g.strokeStyle = 'rgba(220,240,255,.75)'; g.lineWidth = 1; for (var i = 1; i < 5; i++) { g.beginPath(); g.moveTo(-w / 2 + i * w / 5, -h / 2 + 3); g.lineTo(-w / 2 + i * w / 5, h / 2 - 3); g.stroke(); } g.beginPath(); g.rect(-w * 0.25, -h * 0.25, w * 0.4, h * 0.4); g.moveTo(w * 0.15, -h * 0.05); g.arc(w * 0.15, -h * 0.05, h * 0.15, 0, TAU); g.stroke(); g.restore(); }
  function crate(g, T) {
    g.save(); g.fillStyle = T.lin(g, 0, 290, 0, 370, [0, '#a8683a', 1, '#5a3418']); g.beginPath(); g.moveTo(392, 300); g.lineTo(636, 300); g.lineTo(624, 372); g.lineTo(404, 372); g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = 'rgba(60,30,10,.7)'; g.lineWidth = 2; [318, 336, 354].forEach(function (y) { g.beginPath(); g.moveTo(396, y); g.lineTo(632, y); g.stroke(); });
    g.beginPath(); g.moveTo(386, 300); g.lineTo(412, 276); g.lineTo(616, 276); g.lineTo(642, 300); g.closePath(); g.fillStyle = '#1a0e1e'; g.fill(); g.stroke();
    g.save(); g.clip(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 514, 288, 4, 120, [0, '#ffffff', 0.25, '#fff0a0', 0.6, 'rgba(200,120,255,.6)', 1, 'rgba(0,0,0,0)']); g.fillRect(380, 260, 270, 50); g.restore();
    g.fillStyle = '#4a4e5a'; [[392, 300], [636, 300], [404, 372], [624, 372]].forEach(function (p) { g.beginPath(); g.moveTo(p[0] - 10, p[1] - 8); g.lineTo(p[0] + 10, p[1] - 8); g.lineTo(p[0] + 10, p[1] + 8); g.lineTo(p[0] - 10, p[1] + 8); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#c8c8d0'; g.beginPath(); g.arc(p[0], p[1], 2.5, 0, TAU); g.fill(); g.fillStyle = '#4a4e5a'; });
    crystal(g, T, 446, 372, 10, 26, -0.2, '#c86aff'); crystal(g, T, 600, 368, 9, 22, 0.3, '#3ad8ff'); g.restore();
  }
  function burst(g, T, full) {
    g.save(); g.globalCompositeOperation = 'lighter';
    var r = T.rng(77); for (var i = 0; i < (full ? 26 : 14); i++) { var a = -Math.PI / 2 + (r() - 0.5) * 2.2, L = 120 + r() * 160, wd = 0.03 + r() * 0.05; g.globalAlpha = 0.25 + r() * 0.35; g.fillStyle = T.rad(g, 514, 284, 6, L, [0, ['rgba(255,240,180,1)', 'rgba(200,140,255,1)', 'rgba(120,230,255,1)'][i % 3], 1, 'rgba(0,0,0,0)']); g.beginPath(); g.moveTo(514, 284); g.arc(514, 284, L, a - wd, a + wd); g.closePath(); g.fill(); }
    g.globalAlpha = 1; g.fillStyle = T.rad(g, 514, 270, 4, 110, [0, 'rgba(255,250,220,.9)', 0.4, 'rgba(255,200,120,.35)', 1, 'rgba(0,0,0,0)']); g.fillRect(400, 160, 230, 140); g.restore();
    // the rainbow swirl gear
    var gx = 548, gy = 148; T.gear(g, gx, gy, 52, 12, 0.2, T.lin(g, gx - 50, gy - 50, gx + 50, gy + 50, [0, '#fff2b0', 0.5, '#f0c040', 1, '#a86a10']), INK);
    g.save(); g.lineCap = 'round'; ['#ff5a5a', '#ffb02a', '#7aff6a', '#3ad8ff', '#a86aff'].forEach(function (c, k) { g.strokeStyle = c; g.lineWidth = 5.5; g.beginPath(); for (var t = 0; t <= 1; t += 0.03) { var a = k * 1.2 + t * 6.5, rr = 4 + t * 26; g[t ? 'lineTo' : 'moveTo'](gx + Math.cos(a) * rr, gy + Math.sin(a) * rr); } g.stroke(); }); g.restore();
    g.save(); g.lineCap = 'round'; g.strokeStyle = '#3ac8a0'; g.lineWidth = 14; g.beginPath(); g.moveTo(530, 268); g.bezierCurveTo(470, 240, 520, 200, 548, 214); g.bezierCurveTo(580, 230, 560, 260, 540, 250); g.stroke(); g.strokeStyle = '#a8ffe0'; g.lineWidth = 4; g.stroke(); g.restore();
    crystal(g, T, 588, 128, 14, 48, 0.35, '#c86aff'); crystal(g, T, 612, 140, 11, 36, 0.7, '#3ad8ff'); crystal(g, T, 606, 104, 10, 34, 0.15, '#e88aff');
    plank(g, T, 414, 120, 48, 14, 0.7); plank(g, T, 592, 246, 50, 14, -0.4); if (full) plank(g, T, 470, 100, 36, 11, -0.4);
    g.save(); g.translate(580, 190); g.rotate(-0.2); g.fillStyle = '#f4e0b0'; g.fillRect(-26, -12, 52, 24); g.fillStyle = '#d8b878'; g.beginPath(); g.ellipse(-26, 0, 7, 12, 0, 0, TAU); g.ellipse(26, 0, 7, 12, 0, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = '#6a4a1a'; g.strokeRect(-26, -12, 52, 24); g.restore();
    blueprint(g, T, 650, 244, 60, 44, 0.2);
    g.save(); g.lineCap = 'round'; g.shadowColor = '#ffd23a'; g.shadowBlur = 12; g.strokeStyle = T.lin(g, 590, 210, 652, 74, [0, 'rgba(255,210,60,0)', 0.4, '#ffd23a', 1, '#fff2a0']); g.lineWidth = 10; g.beginPath(); g.moveTo(580, 220); g.lineTo(646, 82); g.stroke();
    g.translate(650, 74); g.rotate(Math.atan2(-138, 66)); g.fillStyle = '#ffe070'; g.beginPath(); g.moveTo(16, 0); g.lineTo(-10, -14); g.lineTo(-10, 14); g.closePath(); g.fill(); g.restore();
    if (full) { g.save(); g.translate(640, 150); g.rotate(-0.5); g.fillStyle = T.lin(g, 0, -6, 0, 6, [0, '#e8eef8', 1, '#7a8aa0']); g.fillRect(-28, -6, 56, 12); g.lineWidth = 2; g.strokeStyle = INK; g.strokeRect(-28, -6, 56, 12); g.restore(); }
    [[486, 82, 16, '#ffd23a'], [452, 150, 10, '#ffe08a'], [662, 196, 9, '#ffd23a']].forEach(function (s) { g.fillStyle = s[3]; g.strokeStyle = '#7a3a00'; g.lineWidth = 1.5; T.star(g, s[0], s[1], s[2], s[2] * 0.45); g.fill(); g.stroke(); });
    [[618, 74, 12, '#ffffff'], [380, 140, 12, '#e8a0ff'], [690, 120, 10, '#c8fcff'], [520, 60, 9, '#fff6c8']].forEach(function (s) { T.spark(g, s[0], s[1], s[2], s[3], 1); });
  }
  function gnome(g, T) {   // one silhouette, one rim: hat + goggles, white beard, blue tunic, belt, hammer raised in his right hand, left fist up
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    function out(path, fill, w) { path(); g.lineWidth = w || 3; g.strokeStyle = INK; g.stroke(); g.fillStyle = fill; path(); g.fill(); }
    // hammer + right arm (behind)
    g.save(); g.translate(394, 190); g.rotate(-0.5); out(function () { g.beginPath(); g.rect(-3, -6, 6, 46); }, '#8a5a2a'); out(function () { T.rr(g, -16, -22, 32, 18, 4); }, T.lin(g, 0, -22, 0, -4, [0, '#d8dce4', 1, '#6a7280'])); g.restore();
    out(function () { g.beginPath(); g.moveTo(420, 232); g.quadraticCurveTo(398, 222, 398, 200); g.lineTo(412, 196); g.quadraticCurveTo(414, 214, 428, 222); g.closePath(); }, '#3a6ad0');
    out(function () { g.beginPath(); g.arc(404, 196, 8, 0, TAU); }, '#f0b088');
    // legs + boots
    out(function () { g.beginPath(); g.moveTo(430, 262); g.lineTo(426, 282); g.lineTo(446, 282); g.lineTo(446, 262); g.closePath(); g.moveTo(452, 262); g.lineTo(454, 282); g.lineTo(474, 282); g.lineTo(468, 262); g.closePath(); }, '#5a3a8a');
    out(function () { g.beginPath(); g.ellipse(432, 284, 13, 6, 0, 0, TAU); g.moveTo(482, 284); g.ellipse(468, 284, 13, 6, 0, 0, TAU); }, '#6a3a1a');
    // body
    out(function () { g.beginPath(); g.moveTo(424, 214); g.quadraticCurveTo(450, 200, 476, 214); g.quadraticCurveTo(486, 240, 478, 266); g.lineTo(420, 266); g.quadraticCurveTo(414, 240, 424, 214); g.closePath(); }, T.lin(g, 420, 210, 480, 266, [0, '#5a8af0', 1, '#2a4aa8']));
    g.fillStyle = '#7a4a1a'; g.fillRect(419, 246, 62, 9); g.fillStyle = '#ffd23a'; g.fillRect(445, 245, 10, 11); g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(445, 245, 10, 11);
    // left arm up, fist
    out(function () { g.beginPath(); g.moveTo(474, 220); g.quadraticCurveTo(496, 214, 500, 192); g.lineTo(488, 188); g.quadraticCurveTo(486, 204, 470, 210); g.closePath(); }, '#3a6ad0');
    out(function () { g.beginPath(); g.arc(495, 184, 8, 0, TAU); }, '#f0b088');
    // head, beard, nose, hat, goggles
    out(function () { g.beginPath(); g.arc(450, 186, 20, 0, TAU); }, '#f4c098');
    out(function () { g.beginPath(); g.moveTo(430, 186); g.quadraticCurveTo(428, 222, 450, 236); g.quadraticCurveTo(472, 222, 470, 186); g.quadraticCurveTo(460, 200, 450, 198); g.quadraticCurveTo(440, 200, 430, 186); g.closePath(); }, T.lin(g, 0, 186, 0, 236, [0, '#ffffff', 1, '#c8ccd8']));
    out(function () { g.beginPath(); g.arc(451, 192, 5.5, 0, TAU); }, '#ff8a7a', 2);
    out(function () { g.beginPath(); g.moveTo(426, 176); g.quadraticCurveTo(436, 132, 470, 118); g.quadraticCurveTo(462, 140, 476, 176); g.quadraticCurveTo(450, 168, 426, 176); g.closePath(); }, T.lin(g, 430, 120, 476, 176, [0, '#5a7af0', 1, '#1a3a9a']));
    g.fillStyle = 'rgba(255,255,255,.85)'; [[448, 150], [458, 136], [440, 162]].forEach(function (s) { T.star(g, s[0], s[1], 3.5, 1.5); g.fill(); });
    [[440, 170], [460, 170]].forEach(function (e) { out(function () { g.beginPath(); g.arc(e[0], e[1], 7.5, 0, TAU); }, '#c88a3a', 2.5); g.fillStyle = T.rad(g, e[0] - 2, e[1] - 2, 1, 6, [0, '#e8ffff', 1, '#3ab8c8']); g.beginPath(); g.arc(e[0], e[1], 5, 0, TAU); g.fill(); });
    g.fillStyle = INK; [[443, 184], [457, 184]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 2.2, 0, TAU); g.fill(); });
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(450, 200, 6, 0.3, Math.PI - 0.3); g.stroke();
    g.restore();
  }
  function bottom(g, T, full) {
    T.gear(g, 300, 380, 40, 11, 0.1, T.lin(g, 260, 340, 340, 420, [0, '#d8dce4', 1, '#5a6270']), INK); T.gear(g, 344, 420, 26, 9, 0.4, T.lin(g, 320, 400, 370, 450, [0, '#fff2b0', 1, '#a86a10']), INK);
    T.gear(g, 718, 390, 30, 10, 0.3, T.lin(g, 690, 360, 750, 420, [0, '#d8dce4', 1, '#5a6270']), INK);
    blueprint(g, T, 550, 502, 82, 50, -0.12); if (full) blueprint(g, T, 360, 500, 60, 40, 0.25);
    plank(g, T, 470, 500, 60, 15, -0.3); crystal(g, T, 420, 486, 13, 34, -0.3, '#ffd23a'); crystal(g, T, 630, 512, 13, 34, 0.25, '#c86aff');
    chevrons(g, T, 362, 290, 3, 1); chevrons(g, T, 724, 168, 3, 1); if (full) { chevrons(g, T, 734, 300, 2, 0.9); chevrons(g, T, 700, 470, 2, 0.8); }
    [[478, 462, 10, '#fff6c8'], [600, 456, 9, '#c8fcff']].forEach(function (s) { T.spark(g, s[0], s[1], s[2], s[3], 1); });
  }
  /* ---------- the word: carved serif ARTI gold + FACTORY teal, the T is a sword, the Y curls ---------- */
  function word(g, T, L, cx, base, size, glow) {
    var o = { condense: 0.86, spacing: 0.02, dark: '#1a0a02', outline: size * 0.16, depth: size * 0.08, side: '#3a1c06', light: 0.7, ring: 'rgba(255,240,200,.55)', ringW: size * 0.04,
      glow: glow ? 'rgba(255,200,90,.5)' : null, glowBlur: 0.22, glowN: 2, scale: null, face: null };
    var A = 'ARTIFAC', B = 'ORY', sA = function (j) { return j === 0 || j === 4 ? 1.18 : 1; };
    var wA = T.serif.width(A, size, { condense: o.condense, spacing: o.spacing, scale: sA }), wT = size * 0.7, wB = T.serif.width(B, size, o), gap = size * 0.06, W = wA + gap + wT + gap + wB, x0 = cx - W / 2;
    function face(j, gold) { return gold ? [0, L.gold[0], 0.5, L.gold[1], 1, L.gold[2]] : [0, L.teal[0], 0.5, L.teal[1], 1, L.teal[2]]; }
    curl(g, T, L, x0 + W - wB * 0.18, base, size);
    var oa = Object.assign({}, o, { scale: sA, face: function (j) { return face(j, j < 4); } }), ob = Object.assign({}, o, { face: function () { return face(0, false); } });
    T.serif(g, A, x0 + wA / 2, base, size, oa); sword(g, T, L, x0 + wA + gap + wT / 2, base, size); T.serif(g, B, x0 + W - wB / 2, base, size, ob);
    return W;
  }
  function sword(g, T, L, x, base, s) {   // the T of FACTORY: crossguard = the T's bar, hilt + gem above, blade down to a point
    g.save(); g.translate(x, base); g.lineJoin = 'round';
    function both(path, fill) { path(); g.lineWidth = s * 0.14; g.strokeStyle = '#1a0a02'; g.stroke(); path(); g.fillStyle = fill; g.fill(); }
    both(function () { g.beginPath(); g.moveTo(-s * 0.09, -s * 0.9); g.lineTo(s * 0.09, -s * 0.9); g.lineTo(s * 0.07, -s * 0.05); g.lineTo(0, s * 0.12); g.lineTo(-s * 0.07, -s * 0.05); g.closePath(); }, T.lin(g, -s * 0.09, 0, s * 0.09, 0, [0, L.teal[0], 0.48, L.teal[1], 0.52, L.teal[2], 1, L.teal[1]]));
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = s * 0.015; g.beginPath(); g.moveTo(0, -s * 0.86); g.lineTo(0, s * 0.02); g.stroke();
    both(function () { g.beginPath(); g.moveTo(-s * 0.36, -s * 1.0); g.quadraticCurveTo(0, -s * 0.9, s * 0.36, -s * 1.0); g.lineTo(s * 0.4, -s * 0.9); g.quadraticCurveTo(0, -s * 0.8, -s * 0.4, -s * 0.9); g.closePath(); }, T.lin(g, 0, -s * 1.02, 0, -s * 0.85, [0, L.gold[0], 0.5, L.gold[1], 1, L.gold[2]]));
    both(function () { T.rr(g, -s * 0.05, -s * 1.24, s * 0.1, s * 0.26, s * 0.03); }, '#6a3a1a');
    both(function () { g.beginPath(); g.arc(0, -s * 1.28, s * 0.07, 0, TAU); }, T.rad(g, -s * 0.02, -s * 1.3, 1, s * 0.07, [0, '#ffffff', 0.4, '#3ad8ff', 1, '#0a6a8a']));
    g.restore();
  }
  function curl(g, T, L, x, base, s) {   // the Y's swash tail curling back under the word
    g.save(); g.lineCap = 'round'; var p = [[x, base - s * 0.04], [x + s * 0.5, base + s * 0.1], [x + s * 0.25, base + s * 0.42], [x - s * 0.06, base + s * 0.26]];
    function tr() { g.beginPath(); g.moveTo(p[0][0], p[0][1]); g.bezierCurveTo(p[1][0], p[1][1], p[2][0], p[2][1], p[3][0], p[3][1]); }
    tr(); g.strokeStyle = '#1a0a02'; g.lineWidth = s * 0.2; g.stroke(); tr(); g.strokeStyle = T.lin(g, x, base, x + s * 0.4, base + s * 0.4, [0, L.teal[1], 1, L.teal[2]]); g.lineWidth = s * 0.1; g.stroke();
    g.fillStyle = L.teal[1]; g.beginPath(); g.arc(p[3][0], p[3][1], s * 0.08, 0, TAU); g.fill(); g.lineWidth = s * 0.04; g.strokeStyle = '#1a0a02'; g.stroke(); g.restore();
  }
  function icon(g, T, L, full) {
    g.save(); shape(g, T); g.clip(); wall(g, T, L); forge(g, T); barrel(g, T); shelf(g, T); burst(g, T, full); crate(g, T); gnome(g, T); bottom(g, T, full);
    T.mystic(g, IX, IY, IW, IH, { seed: 5, motes: full ? 18 : 6 }); g.restore(); frame(g, T, L, full);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { back(g, T); icon(g, T, L, true); word(g, T, L, 508, 436, 66, true); return; }
    if (kind === 'main') { var f = px >= 300; g.translate(-212, 14); icon(g, T, L, f); word(g, T, L, 508, 436, 66, f); return; }
    if (kind === 'wide') { g.save(); g.translate(20, 10); g.scale(0.33, 0.33); g.translate(-(IX - 18), -(IY - 18)); icon(g, T, L, false); g.restore(); word(g, T, L, 552, 140, 74, false); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.7, 0.7); g.translate(-ICX, -ICY); icon(g, T, L, false); if (px >= 90) word(g, T, L, 508, 436, 66, false); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO artifactory END
