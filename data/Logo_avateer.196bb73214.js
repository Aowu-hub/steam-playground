// 🏷️ LOGO avateer START — 🧳 Avateer, drawn in code from Aowu's picture (gl-30, round 10). A glowing rune ring (cyan runes on a navy band, gold rims)
// behind a gold-and-bronze shield frame with 8 emblem gems; inside: a floating island with a big tree, waterfalls, little islands + palms, clouds and
// four heroes (one-piece, action poses — gl-r19); below the word a swirling purple-cyan portal; green vines curling round the frame; "Avateer" in carved serif letters (T.serif, gl-r19) gold + teal with a dark outline.
// Look: classic only (the game has no themes yet).
GameLogos.add('avateer', (function () {
  var BOX = { scene: [1024, 572], main: [640, 560], wide: [880, 200], badge: [400, 400] };
  var TAU = Math.PI * 2, INK = '#0a1430';
  var LOOK = { classic: { sky: ['#0a2a4a', '#04081a'], rune: '#5af0ff', gold: ['#fff2b0', '#f0c040', '#a86a10'], teal: ['#d8fff8', '#38d8d0', '#0a7a8a'] } };
  function sh(c, f) { return GameLogos.tools.shade(c, f); }
  var T0 = GameLogos.tools;
  function shield(g) { g.beginPath(); g.moveTo(300, 34); g.lineTo(724, 34); g.quadraticCurveTo(762, 34, 762, 72); g.lineTo(762, 372); g.bezierCurveTo(762, 466, 622, 518, 512, 556); g.bezierCurveTo(402, 518, 262, 466, 262, 372); g.lineTo(262, 72); g.quadraticCurveTo(262, 34, 300, 34); g.closePath(); }
  /* ---------- background: night sky + rune ring ---------- */
  function sky(g, T, L) {
    g.fillStyle = T.rad(g, 512, 300, 40, 640, [0, '#14506a', 0.45, L.sky[0], 1, L.sky[1]]); g.fillRect(0, 0, 1024, 572);
    g.save(); g.globalAlpha = 0.5; [[180, 250, '#2a8aff', 220], [860, 200, '#2ad8c8', 200], [512, 420, '#8a3aff', 260]].forEach(function (q) { g.fillStyle = T.rad(g, q[0], q[1], 4, q[3], [0, q[2], 1, 'rgba(0,0,0,0)']); g.fillRect(q[0] - q[3], q[1] - q[3], q[3] * 2, q[3] * 2); }); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 512, 290, 120, 360, [0, 'rgba(60,220,255,.45)', 0.6, 'rgba(40,160,220,.18)', 1, 'rgba(0,0,0,0)']); g.fillRect(150, 0, 724, 572); g.restore();
    T.mystic(g, 0, 0, 1024, 572, { seed: 41, nebula: [[150, 120, 260, 'rgba(150,80,255,.55)', 0.55], [880, 110, 240, 'rgba(40,220,200,.5)', 0.5], [120, 470, 230, 'rgba(60,120,255,.5)', 0.45], [910, 470, 230, 'rgba(230,80,200,.45)', 0.4]],   /* gl-r20: mystic sky */
      aurora: [{ y: 150, amp: 34, h: 150, cols: ['rgba(90,255,200,.95)', 'rgba(120,120,255,.6)'], a: 0.42, f: 0.9 }, { y: 112, amp: 26, h: 120, cols: ['rgba(255,120,230,.9)', 'rgba(150,90,255,.5)'], a: 0.3, f: 1.3, ph: 2.4 }],
      stars: 120, motes: 26 });
    var r = T.rng(5); for (var i = 0; i < 90; i++) { var x = r() * 1024, y = r() * 572; g.fillStyle = ['#bff8ff', '#ffe9a0', '#ffffff'][i % 3]; g.globalAlpha = 0.35 + r() * 0.6; g.beginPath(); g.arc(x, y, 0.8 + r() * 2.2, 0, TAU); g.fill(); } g.globalAlpha = 1;
  }
  function ring(g, T, L, R0, R1, cx, cy, n) {
    g.save(); g.lineWidth = R1 - R0; g.strokeStyle = T.rad(g, cx, cy, R0, R1, [0, '#1a2a5a', 0.5, '#0c1636', 1, '#1a2a5a']); g.beginPath(); g.arc(cx, cy, (R0 + R1) / 2, 0, TAU); g.stroke();
    [[R0 - 3, 6], [R1 + 3, 6]].forEach(function (q) { g.lineWidth = q[1]; g.strokeStyle = T.lin(g, cx - R1, cy - R1, cx + R1, cy + R1, [0, L.gold[0], 0.3, L.gold[1], 0.6, L.gold[2], 1, L.gold[1]]); g.beginPath(); g.arc(cx, cy, q[0], 0, TAU); g.stroke(); });
    g.lineWidth = 2; g.strokeStyle = 'rgba(90,240,255,.35)'; [R0 + 6, R1 - 6].forEach(function (q) { g.beginPath(); g.arc(cx, cy, q, 0, TAU); g.stroke(); });
    var r = T.rng(17), Rm = (R0 + R1) / 2, s = (R1 - R0) * 0.26; g.strokeStyle = L.rune; g.shadowColor = L.rune; g.shadowBlur = 10; g.lineWidth = Math.max(2, s * 0.32); g.lineCap = 'round'; g.lineJoin = 'round';
    for (var i = 0; i < n; i++) { var a = i * TAU / n + 0.03; g.save(); g.translate(cx + Math.cos(a) * Rm, cy + Math.sin(a) * Rm); g.rotate(a + Math.PI / 2); g.beginPath();
      glyph(g, Math.floor(r() * 8), s); g.stroke(); g.restore(); }
    g.restore();
  }
  function glyph(g, k, s) {   // our own rune shapes: hooks, curls, eyes, forks (never a real alphabet)
    if (k === 0) { g.arc(0, -s * 0.2, s * 0.7, Math.PI * 0.9, Math.PI * 2.1); g.moveTo(0, -s * 0.2); g.lineTo(0, s); }
    else if (k === 1) { g.moveTo(-s, s); g.quadraticCurveTo(-s, -s, 0, -s); g.quadraticCurveTo(s, -s, s * 0.6, 0); g.moveTo(-s * 0.2, s * 0.2); g.lineTo(s * 0.5, s); }
    else if (k === 2) { g.arc(0, 0, s * 0.45, 0, TAU); g.moveTo(-s, -s); g.quadraticCurveTo(0, -s * 0.5, s, -s); g.moveTo(-s, s); g.quadraticCurveTo(0, s * 0.5, s, s); }
    else if (k === 3) { g.moveTo(0, s); g.lineTo(0, -s * 0.3); g.moveTo(-s, -s); g.quadraticCurveTo(0, 0, s, -s); }
    else if (k === 4) { g.moveTo(-s * 0.8, -s); g.bezierCurveTo(s, -s, -s, s * 0.2, s * 0.8, s); g.moveTo(s * 0.6, -s * 0.6); g.lineTo(s, -s * 0.2); }
    else if (k === 5) { g.moveTo(0, -s); g.lineTo(s * 0.7, 0); g.lineTo(0, s); g.moveTo(-s * 0.7, -s * 0.5); g.lineTo(-s * 0.7, s * 0.5); }
    else if (k === 6) { g.moveTo(-s, s * 0.6); g.quadraticCurveTo(-s * 0.2, -s * 1.4, s * 0.6, -s * 0.2); g.arc(s * 0.4, s * 0.25, s * 0.45, -Math.PI / 2, Math.PI); }
    else { g.moveTo(0, -s); g.lineTo(0, s); g.moveTo(-s * 0.7, -s * 0.4); g.quadraticCurveTo(0, s * 0.2, s * 0.7, -s * 0.4); g.moveTo(-s * 0.4, s * 0.7); g.lineTo(s * 0.4, s * 0.7); }
  }
  /* ---------- the world inside the shield ---------- */
  function cloud(g, x, y, s, a) { g.save(); g.globalAlpha = a || 1; g.fillStyle = T0.lin(g, 0, y - s, 0, y + s, [0, '#fff8f0', 0.55, '#f0e0ff', 1, '#b8a0f0']); [[0, 0, 1], [-0.9, 0.25, 0.7], [0.95, 0.2, 0.75], [0.4, -0.45, 0.7], [-0.45, -0.3, 0.6]].forEach(function (c) { g.beginPath(); g.arc(x + c[0] * s, y + c[1] * s, c[2] * s, 0, TAU); g.fill(); }); g.fillStyle = 'rgba(150,110,230,.45)'; g.beginPath(); g.ellipse(x, y + s * 0.55, s * 1.6, s * 0.3, 0, 0, TAU); g.fill(); g.restore(); }
  function islet(g, T, x, y, w, h) {
    g.beginPath(); g.moveTo(x - w, y); g.bezierCurveTo(x - w * 0.8, y + h * 0.5, x - w * 0.3, y + h, x, y + h * 1.25); g.bezierCurveTo(x + w * 0.3, y + h, x + w * 0.8, y + h * 0.5, x + w, y); g.closePath();
    g.fillStyle = T.lin(g, 0, y, 0, y + h * 1.25, [0, '#a8784a', 0.5, '#6a4626', 1, '#3a2414']); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#2a1a10'; g.stroke();
    g.beginPath(); g.ellipse(x, y, w, h * 0.28, 0, 0, TAU); g.fillStyle = T.lin(g, 0, y - h * 0.28, 0, y + h * 0.28, [0, '#9af06a', 1, '#3aa83a']); g.fill(); g.stroke();
  }
  function palm(g, x, y, s) { g.save(); g.strokeStyle = '#7a4a22'; g.lineWidth = 3 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4 * s, y - 14 * s, x + 2 * s, y - 26 * s); g.stroke(); g.fillStyle = '#3ac04a'; [-2.4, -1.8, -1.3, -0.7, -0.2].forEach(function (a) { g.save(); g.translate(x + 2 * s, y - 26 * s); g.rotate(a); g.beginPath(); g.ellipse(9 * s, 0, 10 * s, 3.2 * s, 0, 0, TAU); g.fill(); g.restore(); }); g.restore(); }
  /* gl-r19 draft 2: the picture's big tree — a wide twisted trunk with roots + moss, a crown of leafy clumps (scalloped, lit top-left,
     darker underneath), branches between the clumps, hanging vines and pink blossoms */
  function tree(g, T) {
    g.save(); g.lineJoin = 'round';
    g.beginPath(); g.moveTo(452, 226); g.bezierCurveTo(476, 214, 484, 196, 486, 170); g.bezierCurveTo(488, 140, 476, 116, 466, 100); g.lineTo(488, 94); g.bezierCurveTo(500, 112, 508, 116, 512, 104);
    g.lineTo(530, 88); g.lineTo(552, 98); g.bezierCurveTo(536, 122, 530, 150, 536, 180); g.bezierCurveTo(540, 204, 552, 216, 578, 226); g.bezierCurveTo(550, 230, 538, 222, 530, 228); g.bezierCurveTo(514, 222, 500, 222, 494, 228); g.bezierCurveTo(482, 222, 470, 228, 452, 226); g.closePath();
    g.fillStyle = T.lin(g, 470, 0, 560, 0, [0, '#4a2810', 0.3, '#8a5428', 0.55, '#b07a40', 0.8, '#7a4620', 1, '#3a2010']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#2a160a'; g.stroke();
    g.strokeStyle = 'rgba(40,20,8,.55)'; g.lineWidth = 2.2; g.lineCap = 'round';
    [[496, 222, 506, 170, 488, 120], [516, 220, 504, 172, 522, 112], [530, 218, 520, 170, 538, 120], [504, 200, 520, 160, 506, 128]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.quadraticCurveTo(l[2], l[3], l[4], l[5]); g.stroke(); });
    g.strokeStyle = 'rgba(255,220,170,.28)'; g.lineWidth = 3; [[520, 214, 512, 168, 528, 124]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.quadraticCurveTo(l[2], l[3], l[4], l[5]); g.stroke(); });
    g.fillStyle = 'rgba(90,190,70,.75)'; [[466, 222, 14, 4], [562, 222, 14, 4]].forEach(function (m) { g.beginPath(); g.ellipse(m[0], m[1], m[2], m[3], 0, 0, TAU); g.fill(); });
    g.restore();
  }
  function clump(g, T, x, y, r, back) {
    g.save(); var n = 9;
    function blob(dx, dy) { g.beginPath(); g.arc(x + dx, y + dy, r * 0.72, 0, TAU); for (var i = 0; i < n; i++) { var a = i * TAU / n + 0.3; g.moveTo(x + dx + Math.cos(a) * r * 0.74 + r * 0.32, y + dy + Math.sin(a) * r * 0.74); g.arc(x + dx + Math.cos(a) * r * 0.74, y + dy + Math.sin(a) * r * 0.74, r * 0.32, 0, TAU); } }
    blob(2, 5); g.fillStyle = back ? '#0e4a1e' : '#145a24'; g.fill();
    blob(0, 0); g.fillStyle = T.rad(g, x - r * 0.35, y - r * 0.45, 2, r * 1.15, back ? [0, '#7ad050', 0.5, '#3a9a36', 1, '#1a6a26'] : [0, '#c8f47a', 0.45, '#62c444', 1, '#24822e']); g.fill();
    g.strokeStyle = back ? 'rgba(170,240,120,.35)' : 'rgba(225,255,160,.6)'; g.lineWidth = 2; g.lineCap = 'round';
    for (var i = 0; i < 4; i++) { var a = -2.4 + i * 0.42; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, r * 0.22, Math.PI * 1.1, Math.PI * 1.7); g.stroke(); }
    g.restore();
  }
  function crown(g, T) {
    g.save(); g.lineCap = 'round';
    [[446, 62, 30], [580, 60, 30], [512, 46, 34], [416, 96, 24], [608, 94, 24]].forEach(function (c) { clump(g, T, c[0], c[1], c[2], true); });
    g.fillStyle = '#6a3e1a'; g.strokeStyle = '#2a160a'; g.lineWidth = 2;
    [[[510, 118, 488, 90, 450, 76], 12, 5], [[514, 116, 540, 88, 584, 74], 12, 5], [[506, 112, 474, 106, 428, 104], 9, 4], [[520, 112, 556, 106, 600, 104], 9, 4], [[512, 112, 512, 80, 512, 52], 11, 5]].forEach(function (b) { T.limb(g, b[0], b[1], b[2]); });
    [[472, 32, 26], [548, 26, 30], [418, 70, 22], [610, 68, 22], [504, 72, 32], [446, 92, 26], [580, 90, 28], [512, 104, 22], [474, 112, 16], [552, 110, 18]].forEach(function (c) { clump(g, T, c[0], c[1], c[2], false); });
    var VN = [[436, 108, 430, 150, 2], [596, 106, 604, 152, 2], [470, 118, 464, 166, 1.6], [560, 118, 568, 160, 1.6], [404, 104, 398, 138, 1.4]];
    VN.forEach(function (v) { g.strokeStyle = '#1a5a22'; g.lineWidth = v[4] + 1.6; g.beginPath(); g.moveTo(v[0], v[1]); g.quadraticCurveTo(v[0] + 8, (v[1] + v[3]) / 2, v[2], v[3]); g.stroke(); g.strokeStyle = '#5ab83e'; g.lineWidth = v[4]; g.stroke();
      [0.4, 0.75].forEach(function (t) { var x = v[0] + (v[2] - v[0]) * t + 4, y = v[1] + (v[3] - v[1]) * t; g.beginPath(); g.ellipse(x, y, 4, 2.2, 0.6, 0, TAU); g.fillStyle = '#7ad04a'; g.fill(); }); });
    var r = T.rng(41); for (var i = 0; i < 16; i++) { var a = r() * TAU, d = 20 + r() * 70; var x = 512 + Math.cos(a) * d * 1.3, y = 66 + Math.sin(a) * d * 0.5; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fillStyle = ['#ff8ad8', '#ffd0f0', '#ff5ab8'][i % 3]; g.fill(); }
    g.restore();
  }
  /* gl-r19 draft 2: heroes drawn ONE-PIECE (one silhouette, one rim, depth from colour) in action poses like the picture — feet at 0,0, ≈ 74 tall */
  function hero(g, T, x, y, s, o) {
    var lean = o.lean || 0.12, cx = 0, cy = -22;
    function rot(p) { var c = Math.cos(lean), n = Math.sin(lean); return [cx + (p[0] - cx) * c - (p[1] - cy) * n, cy + (p[0] - cx) * n + (p[1] - cy) * c]; }
    var up = o.armUp == null ? 1 : o.armUp, hand = up ? [21, -54] : [24, -32], elbow = up ? [17, -43] : [20, -36];
    var P = {
      cape: function (h) { if (!o.cape) return; h.beginPath(); h.moveTo(-9, -42); h.quadraticCurveTo(-22, -26, -26, -8); h.quadraticCurveTo(-14, -12, -4, -16); h.lineTo(6, -40); h.closePath(); h.fill(); },
      legB: function (h) { T.limb(h, [-3, -24, -10, -13, -14, -2], 9.5, 8); h.beginPath(); h.ellipse(-14, -2.5, 7.5, 4.2, -0.1, 0, TAU); h.fill(); },
      legF: function (h) { T.limb(h, [4, -24, 12, -15, 14, -2], 9.5, 8); h.beginPath(); h.ellipse(16, -2.5, 8, 4.2, 0.1, 0, TAU); h.fill(); },
      armB: function (h) { T.limb(h, [-8, -38, -16, -33, -20, -26], 7.5, 6.5); h.beginPath(); h.arc(-20, -25, 4.4, 0, TAU); h.fill(); },
      torso: function (h) { h.beginPath(); h.moveTo(-12, -42); h.bezierCurveTo(-4, -46, 4, -46, 12, -42); h.bezierCurveTo(13, -34, 10, -27, 9, -21); h.lineTo(-9, -21); h.bezierCurveTo(-10, -27, -13, -34, -12, -42); h.closePath(); h.fill();
        h.beginPath(); h.ellipse(-11, -41, 7, 5.5, -0.3, 0, TAU); h.ellipse(11, -41, 7, 5.5, 0.3, 0, TAU); h.fill(); },
      armF: function (h) { T.limb(h, [9, -38, elbow[0], elbow[1], hand[0], hand[1]], 7.5, 6.5); h.beginPath(); h.arc(hand[0], hand[1], 4.6, 0, TAU); h.fill(); },
      head: function (h) { h.beginPath(); h.arc(1, -56, 14, 0, TAU); h.fill(); if (o.ears) { h.beginPath(); h.moveTo(-11, -58); h.lineTo(-24, -66); h.lineTo(-12, -52); h.closePath(); h.fill(); } },
      hair: function (h) { h.beginPath(); if (o.helm) { h.moveTo(-14, -54); h.bezierCurveTo(-16, -74, 18, -76, 16, -54); h.lineTo(10, -58); h.lineTo(-8, -58); h.closePath(); }
        else { h.moveTo(-14, -52); h.lineTo(-18, -62); h.lineTo(-10, -64); h.lineTo(-12, -74); h.lineTo(-2, -68); h.lineTo(4, -78); h.lineTo(8, -68); h.lineTo(18, -72); h.lineTo(14, -60); h.lineTo(17, -52); h.quadraticCurveTo(8, -64, 0, -60); h.quadraticCurveTo(-8, -62, -14, -52); h.closePath(); }
        h.fill(); if (o.tail) { h.beginPath(); h.moveTo(-10, -62); h.quadraticCurveTo(-28, -60, -26, -40); h.quadraticCurveTo(-20, -52, -8, -54); h.closePath(); h.fill(); } }
    };
    var TF = {}; ['cape', 'armB', 'torso', 'armF', 'head', 'hair'].forEach(function (k) { TF[k] = function (h) { T.around(h, cx, cy, lean); }; });
    var A = o.armor, A2 = o.trim || '#f0c040';
    g.save(); g.translate(x, y); g.scale((o.flip ? -1 : 1) * s, s);
    if (o.weapon && o.weaponBack) weapon(g, T, o, rot(hand), lean);
    T.onePiece(g, T, { x0: -34, y0: -84, W: 70, H: 88, rim: INK, rimW: 2.4, parts: P, order: ['cape', 'legB', 'armB', 'torso', 'legF', 'head', 'hair', 'armF'], tf: TF,
      colour: function (B, put, inside) {
        if (o.cape) put(B, 'cape', T.lg(B, -20, -40, -6, -8, [0, sh(o.cape, -0.2), 1, sh(o.cape, -0.55)]));
        put(B, 'legB', sh(o.leg, -0.35)); inside(B, 'legB', function (h) { h.fillStyle = sh(A, -0.4); h.fillRect(-24, -9, 20, 10); });
        put(B, 'armB', sh(A, -0.35)); inside(B, 'armB', function (h) { h.fillStyle = '#c88a5a'; h.beginPath(); h.arc(-20, -25, 4.4, 0, TAU); h.fill(); });
        put(B, 'torso', T.lg(B, -12, -44, 12, -20, [0, sh(A, 0.4), 0.5, A, 1, sh(A, -0.35)]));
        inside(B, 'torso', function (h) { h.fillStyle = T.lg(h, 0, -47, 0, -36, [0, sh(A2, 0.4), 1, sh(A2, -0.25)]); h.beginPath(); h.ellipse(-11, -41, 7, 5.5, -0.3, 0, TAU); h.ellipse(11, -41, 7, 5.5, 0.3, 0, TAU); h.fill();
          h.fillStyle = sh(A2, -0.1); h.fillRect(-12, -26, 24, 4); h.fillStyle = '#fff2b0'; h.fillRect(-2, -26, 4, 4); h.fillStyle = sh(A, -0.25); h.beginPath(); h.moveTo(-6, -36); h.lineTo(6, -36); h.lineTo(0, -29); h.closePath(); h.fill(); });
        put(B, 'legF', o.leg); inside(B, 'legF', function (h) { h.fillStyle = sh(A, -0.15); h.fillRect(4, -9, 22, 10); h.fillStyle = sh(A2, 0); h.fillRect(5, -10, 20, 2); });
        put(B, 'head', T.rg(B, -3, -61, 2, 17, [0, '#ffe8d0', 1, '#e8a878']));
        put(B, 'hair', o.helm ? T.lg(B, 0, -76, 0, -54, [0, sh(o.helm, 0.45), 1, sh(o.helm, -0.3)]) : T.lg(B, 0, -78, 0, -52, [0, sh(o.hair, 0.35), 1, sh(o.hair, -0.25)]));
        put(B, 'armF', sh(A, 0.05), 0, 0); inside(B, 'armF', function (h) { h.fillStyle = '#e8b088'; h.beginPath(); h.arc(hand[0], hand[1], 4.6, 0, TAU); h.fill(); h.fillStyle = sh(A2, -0.1); h.beginPath(); h.arc(elbow[0], elbow[1], 3.4, 0, TAU); h.fill(); });
      } });
    // face (in the leaned head frame)
    g.save(); T.around(g, cx, cy, lean); g.fillStyle = '#1a1a3a'; [[-3, -55], [7, -55]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], 2.2, 3, 0, 0, TAU); g.fill(); });
    g.fillStyle = '#fff'; [[-2.3, -56.2], [7.7, -56.2]].forEach(function (e) { g.beginPath(); g.arc(e[0], e[1], 0.9, 0, TAU); g.fill(); });
    g.strokeStyle = '#3a1a0a'; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6, -60.5); g.lineTo(-1, -59.2); g.moveTo(10, -60.5); g.lineTo(5, -59.2); g.stroke();
    g.strokeStyle = '#8a2a2a'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -49.5); g.quadraticCurveTo(3, -48, 6, -50); g.stroke();
    g.fillStyle = 'rgba(255,120,120,.35)'; g.beginPath(); g.ellipse(-6, -51, 2.6, 1.6, 0, 0, TAU); g.ellipse(10, -51, 2.6, 1.6, 0, 0, TAU); g.fill();
    if (o.helm && o.plume) { g.fillStyle = o.plume; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-2, -70); g.quadraticCurveTo(-8, -88, -22, -82); g.quadraticCurveTo(-12, -80, -8, -68); g.closePath(); g.fill(); g.stroke(); }
    if (o.helm && o.wings) { g.fillStyle = '#e8f4ff'; g.strokeStyle = INK; g.lineWidth = 1.4; [-1, 1].forEach(function (d) { g.beginPath(); g.moveTo(1 + d * 12, -64); g.quadraticCurveTo(1 + d * 22, -76, 1 + d * 26, -72); g.quadraticCurveTo(1 + d * 20, -66, 1 + d * 14, -60); g.closePath(); g.fill(); g.stroke(); }); }
    g.restore();
    if (o.shield) { var sp = rot([-21, -27]); g.beginPath(); g.ellipse(sp[0], sp[1], 9, 10.5, 0, 0, TAU); g.fillStyle = T.rad(g, sp[0] - 3, sp[1] - 4, 1, 12, [0, '#fff2b0', 0.4, o.shield, 1, sh(o.shield, -0.45)]); g.fill(); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke();
      g.lineWidth = 1.6; g.strokeStyle = '#f0c040'; g.beginPath(); g.ellipse(sp[0], sp[1], 6.5, 8, 0, 0, TAU); g.stroke(); g.fillStyle = '#f0c040'; g.beginPath(); g.arc(sp[0], sp[1], 2.4, 0, TAU); g.fill(); }
    if (o.weapon && !o.weaponBack) weapon(g, T, o, rot(hand), lean);
    g.restore();
  }
  function weapon(g, T, o, p, lean) {
    g.save(); g.translate(p[0], p[1]); g.rotate((o.wa || -0.5) + lean); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 2;
    if (o.weapon === 'axe') { g.fillStyle = '#7a4a22'; g.fillRect(-1.8, -30, 3.6, 40); g.strokeRect(-1.8, -30, 3.6, 40); g.beginPath(); g.moveTo(1, -28); g.quadraticCurveTo(18, -34, 16, -16); g.quadraticCurveTo(10, -20, 1, -18); g.closePath(); g.fillStyle = T.lin(g, 0, -34, 16, -16, [0, '#ffffff', 0.5, '#c8d4e8', 1, '#7a8aa8']); g.fill(); g.stroke(); }
    else if (o.weapon === 'blade') { g.beginPath(); g.moveTo(-2.8, 2); g.lineTo(-3.4, -28); g.lineTo(0, -40); g.lineTo(3.4, -28); g.lineTo(2.8, 2); g.closePath(); g.fillStyle = T.lin(g, 0, 0, 0, -40, [0, '#b86aff', 1, '#f8e0ff']); g.shadowColor = '#d08aff'; g.shadowBlur = 10; g.fill(); g.shadowBlur = 0; g.stroke(); g.fillStyle = '#f0c040'; g.fillRect(-6, 1, 12, 3.4); g.strokeRect(-6, 1, 12, 3.4); }
    else { g.beginPath(); g.moveTo(-2.6, 2); g.lineTo(-2.6, -30); g.lineTo(0, -37); g.lineTo(2.6, -30); g.lineTo(2.6, 2); g.closePath(); g.fillStyle = T.lin(g, -3, 0, 3, 0, [0, '#ffffff', 0.5, '#d8e4f4', 1, '#8aa0c0']); g.fill(); g.stroke(); g.fillStyle = '#f0c040'; g.fillRect(-7, 1, 14, 3.4); g.strokeRect(-7, 1, 14, 3.4); g.fillStyle = '#7a3a1a'; g.fillRect(-1.6, 4.4, 3.2, 6); }
    g.restore();
  }
  function falls(g, T, x, y0, y1, w) { g.save(); g.fillStyle = T.lin(g, 0, y0, 0, y1, [0, 'rgba(220,250,255,.95)', 0.7, 'rgba(140,220,255,.8)', 1, 'rgba(140,220,255,0)']); g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x + w / 2, y0); g.lineTo(x + w * 0.7, y1); g.lineTo(x - w * 0.7, y1); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1.5; for (var i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * w * 0.25, y0 + 4); g.lineTo(x + i * w * 0.32, y1 - 8); g.stroke(); } g.restore(); }
  function world(g, T, L, full) {
    /* gl-r20 (Aowu "add some sky mystic feeling"): twilight — deep violet top, aurora curtains, star dust, a warm glow + light shafts behind the tree, pink-gold horizon */
    g.fillStyle = T.lin(g, 0, 34, 0, 560, [0, '#160e52', 0.12, '#2c2a96', 0.25, '#3a6ad4', 0.36, '#7ccaf2', 0.43, '#f4c8e4', 0.5, '#8a6ad8', 0.58, '#2a2c86', 0.72, '#141c5c', 1, '#080c30']); g.fillRect(262, 34, 500, 522);
    T.mystic(g, 262, 34, 500, 230, { seed: 17, nebula: [[330, 90, 120, 'rgba(180,90,255,.7)', 0.5], [700, 84, 110, 'rgba(60,230,210,.7)', 0.45]],
      aurora: [{ y: 110, amp: 16, h: 74, cols: ['rgba(110,255,210,.95)', 'rgba(110,140,255,.6)'], a: 0.68, f: 1.1, x0: 262, x1: 762 }, { y: 86, amp: 12, h: 56, cols: ['rgba(255,140,235,.9)', 'rgba(160,100,255,.5)'], a: 0.5, f: 1.6, ph: 1.9, x0: 262, x1: 762 }], moon: { x: 352, y: 80, r: 11 },
      rays: full ? { x: 512, y: 150, n: 13, len: 260, col: 'rgba(255,236,190,.9)', a: 0.22, spread: TAU * 0.9, rot: -Math.PI / 2 } : null, stars: full ? 70 : 34, motes: full ? 10 : 0 });
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = T.rad(g, 512, 140, 4, 190, [0, 'rgba(255,240,200,.85)', 0.4, 'rgba(255,190,230,.3)', 1, 'rgba(0,0,0,0)']); g.fillRect(312, 0, 400, 330); g.restore();
    cloud(g, 340, 120, 26, 0.95); cloud(g, 690, 112, 24, 0.95); cloud(g, 300, 250, 30, 0.9); cloud(g, 724, 244, 30, 0.9); cloud(g, 400, 236, 22, 0.85); cloud(g, 630, 238, 22, 0.85);
    islet(g, T, 430, 130, 24, 18); islet(g, T, 610, 124, 26, 18); palm(g, 426, 128, 0.9); palm(g, 618, 122, 0.9);
    if (full) { islet(g, T, 380, 170, 14, 10); islet(g, T, 662, 168, 14, 10); palm(g, 386, 170, 0.55); palm(g, 652, 166, 0.55); }
    falls(g, T, 442, 140, 186, 6); falls(g, T, 600, 136, 186, 6);
    islet(g, T, 512, 222, 160, 40); g.save(); g.beginPath(); g.ellipse(512, 222, 160, 11, 0, 0, TAU); g.clip(); g.restore();
    [[470, 230, 278, 12], [544, 232, 284, 14], [420, 230, 262, 8]].forEach(function (f) { falls(g, T, f[0], f[1], f[2], f[3]); });
    g.save(); g.fillStyle = 'rgba(120,200,255,.7)'; g.beginPath(); g.ellipse(512, 226, 54, 8, 0, 0, TAU); g.fill(); g.restore();
    tree(g, T);
    g.fillStyle = '#ff7ad0'; [[380, 214], [640, 212], [600, 218]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1] - 10, 6, 0, TAU); g.fill(); g.fillStyle = '#7a4a22'; g.fillRect(p[0] - 1.5, p[1] - 6, 3, 8); g.fillStyle = '#ff7ad0'; });
    hero(g, T, 404, 222, 1, { hair: '#ffcf3a', armor: '#d8642a', trim: '#f0c040', leg: '#5a3a2a', weapon: 'axe', wa: -0.35, lean: 0.2 });
    hero(g, T, 452, 226, 1, { hair: '#b05ae8', armor: '#6a5ad8', trim: '#f0c040', leg: '#3a2a5a', weapon: 'blade', wa: 0.25, ears: 1, tail: 1, cape: '#8a3ad8', lean: 0.1, armUp: 0 });
    hero(g, T, 594, 228, 1, { armor: '#3a9ad0', trim: '#e8d070', leg: '#2a3a5a', weapon: 'sword', wa: 0.55, shield: '#2ad8c8', helm: '#d8e4f4', wings: 1, flip: 1, lean: 0.08, armUp: 0 });
    hero(g, T, 642, 222, 1, { armor: '#b83a7a', trim: '#f0c040', leg: '#3a2a3a', weapon: 'sword', wa: -0.3, helm: '#e8b0c8', plume: '#ff4a7a', cape: '#7a1a4a', flip: 1, lean: 0.16 });
    if (full) { T.mystic(g, 300, 60, 430, 190, { seed: 29, motes: 16 }); [[372, 150, 7], [668, 140, 8], [560, 64, 6], [450, 190, 5], [700, 196, 6]].forEach(function (q, i) { T.spark(g, q[0], q[1], q[2], i % 2 ? '#c8fcff' : '#fff2c0', 0.9); }); }   /* gl-r20 fireflies */
    portal(g, T, full);
  }
  function portal(g, T, full) {
    var cx = 512, cy = 430; g.save(); g.fillStyle = T.rad(g, cx, cy, 4, 150, [0, 'rgba(255,255,255,.95)', 0.12, 'rgba(160,240,255,.9)', 0.4, 'rgba(110,80,255,.8)', 0.75, 'rgba(60,30,160,.75)', 1, 'rgba(20,20,90,.0)']); g.beginPath(); g.ellipse(cx, cy, 170, 130, 0, 0, TAU); g.fill();
    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; var C = ['#5af0ff', '#b86aff', '#3a8aff', '#ff6ad8', '#7af4c8'];
    for (var k = 0; k < (full ? 10 : 6); k++) { g.strokeStyle = C[k % 5]; g.globalAlpha = 0.55; g.lineWidth = 9 - (k % 3) * 2; g.beginPath(); for (var t = 0; t <= 1; t += 0.02) { var a = k * TAU / (full ? 10 : 6) + t * 4.2, r = 14 + t * 150; var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.72; if (t === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
    g.restore();
  }
  /* ---------- the frame: gold + bronze shield, teal neon line, 8 gems, vines ---------- */
  function frame(g, T, L) {
    g.save(); shield(g); g.lineWidth = 30; g.strokeStyle = INK; g.stroke(); g.lineWidth = 24; g.strokeStyle = T.lin(g, 262, 34, 762, 556, [0, '#fff2b0', 0.2, '#e8b040', 0.45, '#8a5a1a', 0.6, '#f0c860', 0.8, '#a86a10', 1, '#f0d070']); g.stroke();
    g.lineWidth = 6; g.strokeStyle = '#5a3a1a'; g.stroke(); g.restore();
    g.save(); shield(g); g.clip(); g.lineWidth = 62; g.strokeStyle = T.lin(g, 0, 34, 0, 556, [0, '#14306a', 1, '#0a1640']); shield(g); g.stroke(); g.restore();
    g.save(); g.strokeStyle = L.rune; g.shadowColor = L.rune; g.shadowBlur = 8; g.lineWidth = 2.6; g.lineCap = 'round'; g.lineJoin = 'round'; var r = T.rng(31), RP = [];
    for (var x = 330; x <= 700; x += 34) RP.push([x, 52, 0]); for (var y = 100; y <= 360; y += 34) { RP.push([280, y, -Math.PI / 2]); RP.push([744, y, Math.PI / 2]); }
    RP.forEach(function (q) { if (Math.abs(q[1] - 166) < 26 && q[1] > 100) return; g.save(); g.translate(q[0], q[1]); g.rotate(q[2]); g.beginPath(); glyph(g, Math.floor(r() * 8), 7); g.stroke(); g.restore(); }); g.restore();
    g.save(); g.translate(512, 295); g.scale(0.876, 0.89); g.translate(-512, -295); shield(g); g.lineWidth = 5; g.strokeStyle = T.lin(g, 262, 34, 762, 556, [0, '#fff2b0', 0.5, '#c8901a', 1, '#f0d070']); g.stroke(); g.lineWidth = 2.5; g.strokeStyle = '#7af8ff'; g.shadowColor = '#5af0ff'; g.shadowBlur = 14; g.stroke(); g.restore();
    [[262, 72, 0], [762, 72, 1]].forEach(function (c) { g.save(); g.translate(c[0], c[1]); g.beginPath(); g.moveTo(0, -30); g.lineTo(14, -6); g.lineTo(0, 24); g.lineTo(-14, -6); g.closePath(); g.fillStyle = T.lin(g, 0, -30, 0, 24, [0, '#c8fff8', 0.5, '#2ad8c8', 1, '#0a6a7a']); g.fill(); g.lineWidth = 3; g.strokeStyle = '#a86a10'; g.stroke(); g.restore(); });
    var G = [[312, 166, '#8a4ae8', 'leaf'], [712, 166, '#ffb81a', 'sun'], [318, 418, '#a84ae8', 'claw'], [706, 418, '#ff9a2a', 'flame'], [384, 480, '#e83a3a', 'flame'], [468, 508, '#ffb81a', 'sword'], [556, 508, '#2ad8a0', 'leaf'], [640, 480, '#3a8aff', 'shield']];
    G.forEach(function (q) { gem(g, T, q[0], q[1], 26, q[2], q[3]); });
    g.save(); g.translate(512, 540); g.beginPath(); g.moveTo(0, -22); g.lineTo(16, 0); g.lineTo(0, 22); g.lineTo(-16, 0); g.closePath(); g.fillStyle = T.lin(g, 0, -22, 0, 22, [0, '#d8fff8', 0.5, '#38d8d0', 1, '#0a6a7a']); g.shadowColor = '#5af0ff'; g.shadowBlur = 12; g.fill(); g.shadowBlur = 0; g.lineWidth = 4; g.strokeStyle = '#a86a10'; g.stroke(); g.restore();
  }
  /* gl-r19: a cut jewel in a bevelled gold setting with the emblem in raised gold on top (the picture's medallions) */
  function gem(g, T, x, y, R, col, k) {
    g.save(); g.beginPath(); g.arc(x, y, R + 7, 0, TAU); g.fillStyle = INK; g.fill();
    g.beginPath(); g.arc(x, y, R + 5, 0, TAU); g.fillStyle = T.lin(g, x - R, y - R, x + R, y + R, [0, '#fff6c0', 0.35, '#f0c040', 0.7, '#a86a10', 1, '#e8c060']); g.fill();
    g.beginPath(); g.arc(x, y, R + 1.5, 0, TAU); g.fillStyle = T.lin(g, x + R, y + R, x - R, y - R, [0, '#fff2b0', 0.5, '#b07818', 1, '#6a4008']); g.fill();
    var n = 8, r0 = R - 0.5, r1 = R * 0.5; for (var i = 0; i < n; i++) { var a0 = i * TAU / n - Math.PI / 2, a1 = a0 + TAU / n, am = (a0 + a1) / 2, li = Math.cos(am + 2.3);
      g.beginPath(); g.moveTo(x + Math.cos(a0) * r0, y + Math.sin(a0) * r0); g.lineTo(x + Math.cos(a1) * r0, y + Math.sin(a1) * r0); g.lineTo(x + Math.cos(a1) * r1, y + Math.sin(a1) * r1); g.lineTo(x + Math.cos(a0) * r1, y + Math.sin(a0) * r1); g.closePath();
      g.fillStyle = sh(col, li > 0 ? 0.45 * li : 0.55 * li); g.fill(); }
    g.beginPath(); for (i = 0; i < n; i++) { var aa = i * TAU / n - Math.PI / 2; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(aa) * r1, y + Math.sin(aa) * r1); } g.closePath(); g.fillStyle = T.rad(g, x - r1 * 0.3, y - r1 * 0.4, 1, r1 * 1.2, [0, sh(col, 0.55), 0.6, col, 1, sh(col, -0.35)]); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; for (i = 0; i < n; i++) { var ab = i * TAU / n - Math.PI / 2; g.beginPath(); g.moveTo(x + Math.cos(ab) * r1, y + Math.sin(ab) * r1); g.lineTo(x + Math.cos(ab) * r0, y + Math.sin(ab) * r0); g.stroke(); }
    g.translate(x, y); g.beginPath(); var s = R * 0.5;
    if (k === 'leaf') { g.moveTo(0, -s); g.quadraticCurveTo(s, -s * 0.2, 0, s); g.quadraticCurveTo(-s, -s * 0.2, 0, -s); g.moveTo(-s * 0.9, -s * 0.1); g.quadraticCurveTo(-s * 0.5, s * 0.6, 0, s); g.quadraticCurveTo(-s * 0.9, s * 0.4, -s * 0.9, -s * 0.1); g.moveTo(s * 0.9, -s * 0.1); g.quadraticCurveTo(s * 0.5, s * 0.6, 0, s); g.quadraticCurveTo(s * 0.9, s * 0.4, s * 0.9, -s * 0.1); }
    else if (k === 'sun') { for (var j = 0; j < 16; j++) { var b = j * TAU / 16, q = j % 2 ? s * 0.55 : s; g.lineTo(Math.cos(b) * q, Math.sin(b) * q); } g.closePath(); }
    else if (k === 'claw') { [-0.5, 0, 0.5].forEach(function (d) { g.moveTo(d * s * 1.2, s * 0.6); g.quadraticCurveTo(d * s * 1.6, -s * 0.2, d * s * 0.8, -s); g.quadraticCurveTo(d * s * 0.8 + s * 0.15, -s * 0.2, d * s * 1.2 + s * 0.2, s * 0.6); }); }
    else if (k === 'flame') { g.moveTo(0, -s); g.quadraticCurveTo(s * 0.9, -s * 0.1, s * 0.5, s * 0.7); g.quadraticCurveTo(0, s, -s * 0.5, s * 0.7); g.quadraticCurveTo(-s * 0.9, -s * 0.1, 0, -s); }
    else if (k === 'sword') { g.moveTo(0, -s); g.lineTo(s * 0.18, s * 0.4); g.lineTo(s * 0.55, s * 0.4); g.lineTo(s * 0.55, s * 0.55); g.lineTo(-s * 0.55, s * 0.55); g.lineTo(-s * 0.55, s * 0.4); g.lineTo(-s * 0.18, s * 0.4); g.closePath(); }
    else { g.moveTo(-s * 0.8, -s * 0.8); g.lineTo(s * 0.8, -s * 0.8); g.lineTo(s * 0.8, 0); g.quadraticCurveTo(s * 0.7, s * 0.7, 0, s); g.quadraticCurveTo(-s * 0.7, s * 0.7, -s * 0.8, 0); g.closePath(); }
    g.lineWidth = 3; g.strokeStyle = 'rgba(40,20,0,.7)'; g.lineJoin = 'round'; g.stroke(); g.fillStyle = T.lin(g, 0, -s, 0, s, [0, '#fff6c0', 0.5, '#f0c040', 1, '#b07818']); g.fill();
    g.restore(); g.save(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(x - R * 0.35, y - R * 0.45, R * 0.28, R * 0.12, -0.6, 0, TAU); g.fill(); g.restore();
  }
  function vines(g, T, full, outer) {
    var V = [[240, 220, 180, 320, 282, 470, 1], [282, 470, 320, 530, 270, 572, 0.8], [70, 340, 140, 450, 200, 572, 0.9], [790, 180, 850, 280, 760, 420, 1], [760, 420, 720, 500, 660, 530, 0.8], [830, 470, 880, 530, 900, 572, 0.7]];
    if (!outer) V = [V[0], V[1], V[3], V[4]];
    g.save(); g.lineCap = 'round'; V.forEach(function (v) { g.beginPath(); g.moveTo(v[0], v[1]); g.quadraticCurveTo(v[2], v[3], v[4], v[5]); g.strokeStyle = '#123a14'; g.lineWidth = 15 * v[6]; g.stroke(); g.strokeStyle = '#3a9a34'; g.lineWidth = 10.5 * v[6]; g.stroke(); g.strokeStyle = 'rgba(190,255,140,.55)'; g.lineWidth = 3 * v[6]; g.save(); g.translate(-2.5 * v[6], -2 * v[6]); g.stroke(); g.restore();   /* gl-r19: thicker vines with a light edge */
      g.strokeStyle = '#2a7a28'; g.lineWidth = 3 * v[6]; for (var t = 0.08; t < 0.95; t += 0.11) { var u = 1 - t, x = u * u * v[0] + 2 * u * t * v[2] + t * t * v[4], y = u * u * v[1] + 2 * u * t * v[3] + t * t * v[5]; g.beginPath(); g.arc(x, y, 7 * v[6], 0.2, 1.4); g.stroke(); } });
    var r = T.rng(11); V.forEach(function (v) { for (var i = 1; i <= 4; i++) { var t = i / 5, u = 1 - t, x = u * u * v[0] + 2 * u * t * v[2] + t * t * v[4], y = u * u * v[1] + 2 * u * t * v[3] + t * t * v[5]; leaf(g, T, x, y, 20 * v[6], r() * TAU); } });
    if (full) [[214, 214, 24, -2.2], [236, 196, 19, -1.4], [800, 172, 24, -0.6], [820, 200, 19, 0.4], [100, 400, 22, 3.6], [880, 510, 19, 2.2]].forEach(function (l, i) { if (outer || i < 4) leaf(g, T, l[0], l[1], l[2], l[3]); });
    g.restore();
  }
  function leaf(g, T, x, y, s, a) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.6, -s * 0.55, s * 1.6, 0); g.quadraticCurveTo(s * 0.6, s * 0.55, 0, 0); g.fillStyle = T.lin(g, 0, -s * 0.5, 0, s * 0.5, [0, '#9af06a', 1, '#2a8a2a']); g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#174a17'; g.stroke(); g.beginPath(); g.moveTo(0, 0); g.lineTo(s * 1.4, 0); g.strokeStyle = 'rgba(20,70,20,.6)'; g.stroke(); g.restore(); }
  function dust(g, T, full) { var r = T.rng(23); g.save(); for (var i = 0; i < (full ? 60 : 24); i++) { var x = 220 + r() * 600, y = 30 + r() * 520; if (x > 280 && x < 744 && y > 50 && y < 530) continue; var c = ['#ffe28a', '#7af8ff', '#ffffff'][i % 3]; g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 8; g.beginPath(); g.arc(x, y, 1.2 + r() * 2.6, 0, TAU); g.fill(); } g.restore();
    [[748, 62, 26], [262, 300, 16], [808, 130, 14], [232, 420, 14], [790, 350, 16]].forEach(function (s, i) { if (full || i < 2) GameLogos.tools.spark(g, s[0], s[1], s[2], i % 2 ? '#c8fcff' : '#fff6c8', 1); }); }
  /* gl-r19 draft 2: carved serif letters (T.serif) like the picture — A gold-into-teal, v a teal, t e e gold, r teal; dark ink outline + gold rim */
  function word(g, T, L, cx, base, size, glow) {
    var GD = [0, '#fff6c0', 0.4, '#f6cc4a', 0.75, '#d08a1a', 1, '#8a4a08'], TL = [0, '#e0fffa', 0.4, '#4ae0d0', 0.75, '#12a0a8', 1, '#06505a'], AG = [0, '#fff2b0', 0.35, '#f0c040', 0.6, '#3ad0c0', 1, '#0a6a7a'], P = [AG, TL, TL, GD, GD, GD, TL];
    var o = { spacing: 0.02, dark: INK, outline: size * 0.13, depth: size * 0.07, side: '#06243a', condense: 0.84, ring: '#ffe28a', ringW: size * 0.04, glow: glow ? 'rgba(90,240,255,.42)' : null, glowBlur: 0.22, glowN: 2,
      scale: function (j) { return j ? 1.13 : 1; }, face: function (j) { return P[j]; } };
    T.serif(g, 'Avateer', cx, base, size, o);
  }
  function emblem(g, T, L, full, outer) { g.save(); shield(g); g.clip(); world(g, T, L, full); g.restore(); vines(g, T, full, outer); frame(g, T, L); crown(g, T); word(g, T, L, 510, 394, 136, full); dust(g, T, full); }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { sky(g, T, L); ring(g, T, L, 446, 494, 512, 290, 46); emblem(g, T, L, true, true); return; }
    if (kind === 'main') { g.translate(-192, -6); emblem(g, T, L, px >= 300); return; }
    if (kind === 'wide') { g.save(); g.translate(24, 14); g.scale(0.32, 0.32); g.translate(-262, -12); g.save(); shield(g); g.clip(); world(g, T, L, false); g.restore(); frame(g, T, L); crown(g, T); g.restore(); word(g, T, L, 530, 160, 122, false); return; }
    if (kind === 'badge') { g.translate(200, 196); g.scale(0.68, 0.68); g.translate(-512, -290); g.save(); shield(g); g.clip(); world(g, T, L, false); g.restore(); frame(g, T, L); crown(g, T); if (px >= 90) word(g, T, L, 512, 392, 116, false); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO avateer END
