// 🏷️ LOGO soulbopper START — 👻💣 Soul Bopper, drawn in code from Aowu's picture (gl-7)
GameLogos.add('soulbopper', (function () {
  var BOX = { scene: [1024, 572], main: [1040, 590], wide: [860, 220], badge: [400, 400] };
  function mk(o) { var b = { sky: ['#3a1a9a', '#5a2fd0', '#1a6ac8'], tiles: ['#7a4af0', '#3f8df5', '#2fc8d8', '#b05af0', '#5ad06a', '#f0a02a'], ghost: ['#f4feff', '#aef0ff', '#74c4ff', '#8a8cf5'], gink: '#4a66e0',
    a: ['#c8fbff', '#74dcff', '#5a9cf8', '#9a62f0'], aRing: '#4a3ad0', b: ['#fff36a', '#ffd21a', '#ffa41a', '#ff7412'], bRing: '#c8580a', dark: '#2a1670', bomb: ['#5a4ae0', '#1f1a7a', '#ffd23e'], bat: ['#9a6af5', '#4a2ab0'], glow: 'rgba(120,220,255,.8)' };
    for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    dino: mk({ sky: ['#1a4a22', '#3a8a3a', '#8a6a1a'], tiles: ['#5ab84a', '#8ac83a', '#c8a84a', '#3f9a5a', '#a8782a', '#e0c84a'], dark: '#12381a', glow: 'rgba(190,255,150,.8)' }),
    sea: mk({ sky: ['#062a5a', '#0a5aa8', '#0a8a9a'], tiles: ['#2a8ae0', '#2fc8d8', '#3fd8b0', '#1a6ac8', '#5ae0e0', '#8af0d0'], dark: '#06224a' }),
    dance: mk({ sky: ['#3a0a5a', '#9a1aa8', '#e02a8a'], tiles: ['#f04ab8', '#8a3ff0', '#3fd8ff', '#ffb02e', '#c81a8a', '#5ad0ff'], dark: '#3a0a4a', glow: 'rgba(255,150,230,.8)' }),
    robot: mk({ sky: ['#1a2230', '#34485e', '#4a6078'], tiles: ['#5a7aa8', '#8a9ab8', '#3fd8ff', '#3a4a6a', '#a8b8c8', '#5ac8e0'], dark: '#141c28', bomb: ['#8a9ab8', '#2a3448', '#3fd8ff'] }),
    space: mk({ sky: ['#06061e', '#1a1458', '#4a1a7a'], tiles: ['#5a4af0', '#b84af0', '#2ad8f0', '#2a1a9a', '#8a5af5', '#3f6af5'], dark: '#0a0830' }),
    sky: mk({ sky: ['#2a7ae0', '#5ab8ff', '#a8e0ff'], tiles: ['#ffffff', '#a8d8ff', '#ffe27a', '#5aa8f0', '#ffd0e8', '#c8f0ff'], dark: '#163a7a', glow: 'rgba(255,255,255,.9)' }),
    zombie: mk({ sky: ['#1a2a1a', '#3a5a2a', '#5a3a6a'], tiles: ['#6a9a3a', '#8a5a9a', '#4a7a4a', '#a8c84a', '#5a3a7a', '#3a5a3a'], ghost: ['#f4ffe0', '#c8f08a', '#8ac84a', '#4a8a2a'], gink: '#3a7a1a', dark: '#162212', glow: 'rgba(190,255,120,.8)', a: ['#f4ffd8', '#c8f07a', '#8ac84a', '#4a9a3a'], aRing: '#2a6a1a' }) };
  var TAU = Math.PI * 2;
  function floor(g, T, L) {
    g.fillStyle = T.lin(g, 0, 0, 1024, 572, [0, L.sky[0], 0.5, L.sky[1], 1, L.sky[2]]); g.fillRect(0, 0, 1024, 572);
    // tile floor in a gentle perspective
    g.save(); g.translate(512, 286); g.transform(1, 0.1, -0.32, 0.8, 0, 0); var r = T.rng(41), s = 92;
    for (var y = -6; y < 6; y++) for (var x = -9; x < 9; x++) { var c = L.tiles[(r() * L.tiles.length) | 0]; T.rr(g, x * s + 4, y * s + 4, s - 8, s - 8, 12); g.fillStyle = c; g.globalAlpha = 0.55 + r() * 0.3; g.fill(); g.globalAlpha = 0.35; g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke(); }
    g.restore(); g.globalAlpha = 1;
    g.fillStyle = T.rad(g, 512, 300, 60, 560, [0, 'rgba(120,200,255,.5)', 0.5, 'rgba(60,40,160,.15)', 1, 'rgba(20,6,70,.7)']); g.fillRect(0, 0, 1024, 572);
  }
  function bomb(g, T, L, x, y, R, rot, face) {
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    // fuse + spark
    g.lineCap = 'round'; g.beginPath(); g.moveTo(R * 0.34, -R * 0.86); g.quadraticCurveTo(R * 0.66, -R * 1.34, R * 0.98, -R * 1.2); g.lineWidth = R * 0.2; g.strokeStyle = '#3a1c0a'; g.stroke(); g.lineWidth = R * 0.1; g.strokeStyle = '#d8a05a'; g.stroke();
    g.save(); g.shadowColor = '#ffb02e'; g.shadowBlur = R * 0.6; T.spark(g, R * 1.02, -R * 1.22, R * 0.5, '#ffd23e', 1); T.spark(g, R * 1.02, -R * 1.22, R * 0.26, '#fff', 1); g.restore();
    T.rr(g, R * 0.1, -R * 1.12, R * 0.46, R * 0.34, R * 0.08); g.fillStyle = '#5a4a8a'; g.fill(); g.lineWidth = R * 0.07; g.strokeStyle = L.dark; g.stroke();
    g.save(); g.shadowColor = '#b06aff'; g.shadowBlur = R * 0.7; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = L.bomb[0]; g.fill(); g.restore(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = T.rad(g, -R * 0.35, -R * 0.4, R * 0.1, R * 1.3, [0, L.bomb[0], 0.7, L.bomb[1], 1, L.dark]); g.fill(); g.lineWidth = R * 0.11; g.strokeStyle = L.dark; g.stroke(); g.beginPath(); g.arc(0, 0, R * 1.08, 0, TAU); g.lineWidth = R * 0.05; g.strokeStyle = 'rgba(200,160,255,.85)'; g.stroke();
    // glowing swirl marks
    g.save(); g.beginPath(); g.arc(0, 0, R * 0.92, 0, TAU); g.clip(); g.strokeStyle = L.bomb[2]; g.shadowColor = L.bomb[2]; g.shadowBlur = R * 0.3; g.lineWidth = R * 0.1; g.lineCap = 'round';
    if (face === 2) { g.shadowBlur = 0; g.fillStyle = '#ff6ad0'; [[-0.3, -0.34, 0.12], [0.36, -0.3, 0.1], [-0.52, 0.12, 0.09], [0.5, 0.26, 0.13], [-0.1, 0.56, 0.1], [0.08, -0.62, 0.08]].forEach(function (d) { g.beginPath(); g.arc(d[0] * R, d[1] * R, d[2] * R, 0, TAU); g.fill(); }); g.strokeStyle = '#3fd8ff'; g.shadowColor = '#3fd8ff'; g.shadowBlur = R * 0.3; g.beginPath(); g.arc(-R * 0.1, R * 0.06, R * 0.34, 3.6, 6.6); g.stroke(); g.beginPath(); g.arc(R * 0.28, R * 0.44, R * 0.22, 0.4, 2.6); g.stroke(); g.restore(); g.save(); g.beginPath(); g.arc(0, 0, R * 0.92, 0, TAU); g.clip(); face = 3; }
    if (!face) { g.beginPath(); for (var a = 0; a < 5.4; a += 0.2) { var rr = R * 0.08 + a * R * 0.085; g[a ? 'lineTo' : 'moveTo'](R * 0.12 + Math.cos(a) * rr, R * 0.14 + Math.sin(a) * rr); } g.stroke(); }
    if (face !== 3) { g.strokeStyle = '#3fd8ff'; g.shadowColor = '#3fd8ff'; g.beginPath(); g.arc(-R * 0.5, R * 0.52, R * 0.3, 3.4, 5.6); g.stroke(); g.strokeStyle = '#ff8a2a'; g.shadowColor = '#ff8a2a'; g.beginPath(); g.arc(R * 0.62, -R * 0.42, R * 0.26, 0.2, 2.4); g.stroke(); } g.restore();
    if (face === 3) face = 0;
    if (face) { [-1, 1].forEach(function (k) { g.beginPath(); g.ellipse(k * R * 0.3, -R * 0.06, R * 0.2, R * 0.25, 0, 0, TAU); g.fillStyle = '#fff3a0'; g.fill(); g.beginPath(); g.arc(k * R * 0.3 + R * 0.03, -R * 0.02, R * 0.11, 0, TAU); g.fillStyle = '#1a0a3a'; g.fill(); }); g.beginPath(); g.arc(0, R * 0.22, R * 0.3, 0.1 * Math.PI, 0.9 * Math.PI); g.closePath(); g.fillStyle = '#1a0a3a'; g.fill(); g.fillStyle = '#fff'; g.fillRect(-R * 0.12, R * 0.3, R * 0.1, R * 0.1); g.fillRect(R * 0.04, R * 0.3, R * 0.1, R * 0.1); }
    g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(-R * 0.4, -R * 0.5, R * 0.24, R * 0.13, -0.7, 0, TAU); g.fill();
    g.restore();
  }
  function burst(g, T, x, y, R, col) { g.save(); g.shadowColor = col; g.shadowBlur = R * 0.5; T.star(g, x, y, R, R * 0.5, 8, 0.2); g.fillStyle = col; g.fill(); T.star(g, x, y, R * 0.6, R * 0.3, 8, 0.5); g.fillStyle = '#fff6c0'; g.fill(); g.restore(); }
  function bat(g, T, L, x, y, s, rot) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(s, s); g.lineJoin = 'round';
    [-1, 1].forEach(function (k) { g.beginPath(); g.moveTo(k * 14, -4); g.quadraticCurveTo(k * 40, -40, k * 62, -22); g.quadraticCurveTo(k * 54, -8, k * 58, 6); g.quadraticCurveTo(k * 46, 0, k * 40, 12); g.quadraticCurveTo(k * 30, 4, k * 22, 14); g.quadraticCurveTo(k * 16, 8, k * 12, 10); g.closePath(); g.fillStyle = L.bat[1]; g.fill(); g.lineWidth = 4; g.strokeStyle = L.dark; g.stroke(); });
    [-1, 1].forEach(function (k) { g.beginPath(); g.moveTo(k * 8, -18); g.lineTo(k * 18, -38); g.lineTo(k * 20, -16); g.closePath(); g.fillStyle = L.bat[0]; g.fill(); g.lineWidth = 4; g.strokeStyle = L.dark; g.stroke(); });
    g.beginPath(); g.ellipse(0, 0, 21, 22, 0, 0, TAU); g.fillStyle = T.rad(g, -6, -8, 2, 26, [0, '#c8a8ff', 1, L.bat[0]]); g.fill(); g.lineWidth = 4; g.strokeStyle = L.dark; g.stroke();
    [-1, 1].forEach(function (k) { g.beginPath(); g.arc(k * 8, -3, 6.5, 0, TAU); g.fillStyle = '#ffe14a'; g.fill(); g.beginPath(); g.arc(k * 8 + 1, -2, 3.2, 0, TAU); g.fillStyle = '#1a0a3a'; g.fill(); });
    g.beginPath(); g.arc(0, 7, 7, 0.1 * Math.PI, 0.9 * Math.PI); g.lineWidth = 3; g.lineCap = 'round'; g.strokeStyle = '#1a0a3a'; g.stroke(); g.fillStyle = '#fff'; g.fillRect(-5, 9, 3, 4); g.fillRect(2, 9, 3, 4);
    g.restore();
  }
  function ghost(g, T, L, x, y, s, noBat) {   // the picture's ghost: big head with a curl, little body, two arms on the bat, two running legs
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    var G = L.ghost, RIM = L.gink, body = T.rad(g, -6, -50, 8, 190, [0, G[0], 0.3, G[1], 0.7, G[2], 1, G[3]]);
    function limb(pts, w) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 4) g.quadraticCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]); g.lineWidth = w + 7; g.strokeStyle = RIM; g.stroke(); g.lineWidth = w; g.strokeStyle = body; g.stroke(); g.lineWidth = w * 0.3; g.strokeStyle = 'rgba(255,255,255,.35)'; g.stroke(); }
    function blob(draw) { draw(); g.lineWidth = 7; g.strokeStyle = RIM; g.stroke(); draw(); g.fillStyle = body; g.fill(); }
    // soft glow behind the whole ghost
    
    if (!noBat) {
      // swing trails
      g.save(); g.lineCap = 'round'; [[150, 'rgba(120,230,255,.55)', 9], [170, 'rgba(190,130,255,.45)', 6], [132, 'rgba(255,255,255,.4)', 4]].forEach(function (a) { g.beginPath(); g.arc(-40, 30, a[0], Math.PI * 0.72, Math.PI * 1.42); g.lineWidth = a[2]; g.strokeStyle = a[1]; g.stroke(); }); g.restore();
      // rainbow bat, held in both hands, up over the shoulder
      g.save(); g.translate(-66, 42); g.rotate(-0.52); var cols = ['#b05af0', '#3fa8ff', '#5ad06a', '#ffe14a', '#ffa02e', '#ff5a8a'];
      function batShape() { g.beginPath(); g.moveTo(-10, 26); g.lineTo(-12, -40); g.lineTo(-27, -150); g.quadraticCurveTo(-28, -196, 0, -198); g.quadraticCurveTo(28, -196, 27, -150); g.lineTo(12, -40); g.lineTo(10, 26); g.closePath(); }
      batShape(); g.lineWidth = 11; g.strokeStyle = L.dark; g.stroke(); g.save(); batShape(); g.clip(); for (var i = 0; i < 8; i++) { g.fillStyle = cols[i % 6]; g.save(); g.rotate(0.45); g.fillRect(-120, -250 + i * 34, 240, 34); g.restore(); } g.fillStyle = '#3f7af0'; g.fillRect(-14, -44, 28, 80); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-20, -196, 9, 190); g.restore();
      g.beginPath(); g.ellipse(0, 34, 17, 10, 0, 0, TAU); g.fillStyle = '#ff7a3a'; g.fill(); g.lineWidth = 5; g.strokeStyle = L.dark; g.stroke(); g.restore(); }
    // ONE-PIECE body (Aowu): head, body, arms and legs are a single shape with one rim; depth comes from colour —
    // parts further back are darker, nearer parts drop a soft shadow on what they cover.
    var m = g.getTransform(), sc = Math.max(0.2, Math.hypot(m.a, m.b)), W = 270, H = 420, ox = 135, oy = 215;
    function cv() { var c = document.createElement('canvas'); c.width = Math.ceil(W * sc); c.height = Math.ceil(H * sc); var h = c.getContext('2d'); h.scale(sc, sc); h.translate(ox, oy); h.lineCap = 'round'; h.lineJoin = 'round'; return h; }
    function stroke3(h, p, w) { h.beginPath(); h.moveTo(p[0], p[1]); h.quadraticCurveTo(p[2], p[3], p[4], p[5]); h.lineWidth = w; h.stroke(); }
    var PART = {
      legB: function (h) { stroke3(h, [-16, 104, -44, 122, -58, 156], 34); h.beginPath(); h.ellipse(-66, 162, 23, 14, -0.5, 0, TAU); h.fill(); },
      torso: function (h) { h.beginPath(); h.ellipse(6, 76, 46, 54, 0.08, 0, TAU); h.fill(); },
      legF: function (h) { stroke3(h, [22, 110, 58, 118, 62, 150], 36); h.beginPath(); h.ellipse(74, 156, 25, 14, 0.2, 0, TAU); h.fill(); },
      head: function (h) { h.beginPath(); h.moveTo(-76, -36); h.bezierCurveTo(-82, -88, -62, -122, -38, -132); h.bezierCurveTo(-62, -146, -70, -176, -40, -188); h.bezierCurveTo(-48, -170, -34, -152, -2, -136); h.bezierCurveTo(60, -134, 100, -92, 96, -40); h.bezierCurveTo(92, 20, 54, 52, 10, 52); h.bezierCurveTo(-40, 52, -72, 14, -76, -36); h.closePath(); h.fill(); },
      armA: noBat ? function (h) { stroke3(h, [-30, 60, -62, 62, -74, 30], 30); h.beginPath(); h.arc(-76, 26, 18, 0, TAU); h.fill(); } : function (h) { stroke3(h, [-22, 58, -50, 40, -74, 30], 30); h.beginPath(); h.arc(-78, 28, 19, 0, TAU); h.fill(); },
      armB: noBat ? function (h) { stroke3(h, [40, 64, 72, 70, 84, 96], 30); h.beginPath(); h.arc(86, 100, 18, 0, TAU); h.fill(); } : function (h) { stroke3(h, [10, 70, -30, 72, -62, 54], 30); h.beginPath(); h.arc(-64, 54, 19, 0, TAU); h.fill(); }
    };
    function put(h, name, col, dx, dy) { h.save(); if (dx || dy) h.translate(dx, dy); h.fillStyle = col; h.strokeStyle = col; PART[name](h); h.restore(); }
    var ORDER = ['legB', 'torso', 'legF', 'head', 'armA', 'armB'];
    var M = cv(); ORDER.forEach(function (n) { put(M, n, '#fff'); });                      // the union = the silhouette
    var Rm = cv(); Rm.setTransform(1, 0, 0, 1, 0, 0); for (var a = 0; a < 16; a++) Rm.drawImage(M.canvas, Math.cos(a * TAU / 16) * 4.2 * sc, Math.sin(a * TAU / 16) * 4.2 * sc); Rm.globalCompositeOperation = 'source-in'; Rm.fillStyle = RIM; Rm.fillRect(0, 0, Rm.canvas.width, Rm.canvas.height);
    var B = cv(), SH = 'rgba(58,64,200,', lin = function (h, x0, y0, x1, y1, st) { var q = h.createLinearGradient(x0, y0, x1, y1); for (var k2 = 0; k2 < st.length; k2 += 2) q.addColorStop(st[k2], st[k2 + 1]); return q; };
    put(B, 'legB', G[3]); put(B, 'legB', SH + '.42)');                                        // far leg: darkest
    put(B, 'torso', lin(B, 0, 20, 0, 132, [0, G[2], 0.55, G[1], 1, G[2]]));
    put(B, 'legF', lin(B, 20, 104, 80, 166, [0, G[2], 0.5, G[1], 1, G[2]]));
    B.save(); B.beginPath(); B.ellipse(6, 76, 46, 54, 0.08, 0, TAU); B.clip(); put(B, 'legF', SH + '.3)', -5, -6); var ao = B.createRadialGradient(10, 44, 4, 10, 44, 70); ao.addColorStop(0, SH + '.55)'); ao.addColorStop(1, SH + '0)'); B.fillStyle = ao; B.fillRect(-60, 10, 140, 120); B.restore();   // the head shades the chest, the near leg shades the hip
    var hg = B.createRadialGradient(-10, -70, 8, 6, -40, 150); hg.addColorStop(0, G[0]); hg.addColorStop(0.3, G[1]); hg.addColorStop(0.72, G[2]); hg.addColorStop(1, G[3]); put(B, 'head', hg);
    B.save(); B.beginPath(); B.ellipse(10, -42, 84, 90, 0, 0, TAU); B.clip(); B.fillStyle = 'rgba(255,255,255,.6)'; B.beginPath(); B.ellipse(-40, -84, 16, 30, 0.6, 0, TAU); B.fill(); var ch = B.createLinearGradient(0, 10, 0, 54); ch.addColorStop(0, SH + '0)'); ch.addColorStop(1, SH + '.34)'); B.fillStyle = ch; B.fillRect(-90, 10, 190, 50);
    var r = T.rng(9); for (var q = 0; q < 26; q++) { B.globalAlpha = 0.4 + r() * 0.5; B.fillStyle = '#fff'; B.beginPath(); B.arc(-60 + r() * 140, -110 + r() * 150, 0.8 + r() * 1.8, 0, TAU); B.fill(); } B.restore(); B.globalAlpha = 1;
    ['armB', 'armA'].forEach(function (n, k2) { put(B, n, SH + '.34)', 5, 8); put(B, n, lin(B, -90, 20, 20, 90, [0, G[0], 0.25, G[1], 1, G[2]])); });   // arms are nearest: lightest, with a drop shadow
    if (!noBat) { B.strokeStyle = SH + '.45)'; B.lineWidth = 2.5; [[-78, 28], [-64, 54]].forEach(function (f) { [-6, 0, 6].forEach(function (d) { B.beginPath(); B.moveTo(f[0] - 10, f[1] + d); B.lineTo(f[0] + 5, f[1] + d - 2); B.stroke(); }); }); }
    B.setTransform(1, 0, 0, 1, 0, 0); B.globalCompositeOperation = 'destination-in'; B.drawImage(M.canvas, 0, 0);
    g.save(); g.shadowColor = L.glow; g.shadowBlur = 56 * s; g.drawImage(Rm.canvas, -ox, -oy, W, H); g.shadowColor = '#ffffff'; g.shadowBlur = 18 * s; g.drawImage(Rm.canvas, -ox, -oy, W, H); g.restore();
    g.drawImage(Rm.canvas, -ox, -oy, W, H); g.drawImage(B.canvas, -ox, -oy, W, H);
    // face: brows, big eyes looking right, open smile
    g.strokeStyle = '#6a5ae8'; g.lineWidth = 7; g.beginPath(); g.moveTo(-34, -84); g.quadraticCurveTo(-16, -96, 2, -86); g.stroke(); g.beginPath(); g.moveTo(40, -90); g.quadraticCurveTo(58, -98, 74, -84); g.stroke();
    [[-16, -52, 28, 33], [58, -54, 24, 30]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#3a52c8'; g.stroke();
      g.beginPath(); g.ellipse(e[0] + 7, e[1] + 3, e[2] * 0.66, e[3] * 0.7, 0, 0, TAU); g.fillStyle = T.lin(g, 0, e[1] - e[3], 0, e[1] + e[3], [0, '#3a2ab0', 0.6, '#3f7af0', 1, '#6ad0ff']); g.fill();
      g.beginPath(); g.ellipse(e[0] + 9, e[1] + 4, e[2] * 0.36, e[3] * 0.4, 0, 0, TAU); g.fillStyle = '#1a1250'; g.fill(); g.beginPath(); g.arc(e[0] + 1, e[1] - 8, e[2] * 0.22, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(e[0] + 14, e[1] + 12, e[2] * 0.1, 0, TAU); g.fill(); });
    g.fillStyle = 'rgba(190,120,255,.5)'; g.beginPath(); g.ellipse(-40, -8, 15, 10, 0, 0, TAU); g.ellipse(80, -14, 10, 9, 0, 0, TAU); g.fill();
    function mouth() { g.beginPath(); g.moveTo(-6, -8); g.quadraticCurveTo(26, 4, 62, -16); g.quadraticCurveTo(60, 30, 26, 32); g.quadraticCurveTo(-2, 30, -6, -8); g.closePath(); }
    mouth(); g.fillStyle = '#3a1a7a'; g.fill(); g.save(); mouth(); g.clip(); g.fillStyle = '#fff'; g.fillRect(-8, -16, 76, 14); g.fillStyle = '#ff7ab0'; g.beginPath(); g.ellipse(30, 30, 22, 13, -0.1, 0, TAU); g.fill(); g.restore(); mouth(); g.lineWidth = 4; g.strokeStyle = '#3a52c8'; g.stroke();
    g.restore();
  }
  /* the picture's lettering: fat bubble letters, "Soul" cyan → violet tilted a little, "Bopper" yellow → orange on a gentle arch, the o is a bomb */
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    var s1 = 198 * k, s2 = 168 * k;
    function o(c, sz, ring) { return { clean: true /* gl-r20 clean B */, spacing: -sz * 0.012, dark: L.dark, outline: sz * 0.17, depth: sz * 0.07, fat: sz * 0.022, inner: 'rgba(255,255,255,.35)', glow: ring === L.bRing ? 'rgba(255,190,60,1)' : 'rgba(110,235,255,1)', glowN: 3, glowBlur: 0.42, face: function () { return [0, c[0], 0.32, c[1], 0.7, c[2], 1, c[3]]; } }; }
    function width(str, sz) { g.save(); g.font = '700 ' + sz + 'px ' + T.FONT; var w = 0; for (var q = 0; q < str.length; q++) w += g.measureText(str[q]).width - (q < str.length - 1 ? sz * 0.012 : 0); g.restore(); return w; }
    function soul(x, base) { var a = o(L.a, s1, L.aRing); a.rot = -0.045; a.wave = function (j) { return [4, 0, -2, -4][j] * k; }; T.word(g, 'Soul', x, base, s1, a); T.gloss(g, 'Soul', x, base, s1, a, 0.7); }
    function bopper(x, base) {   // "B" + bomb + "pper", arched: the ends sit lower than the middle
      var wB = width('B', s2), wo = s2 * 0.6, wp = width('pper', s2), W = wB + wo + wp - s2 * 0.06, x0 = x - W / 2, b = o(L.b, s2, L.bRing);
      var pp = o(L.b, s2, L.bRing); pp.wave = function (j) { return [-8, -9, -4, 8][j] * k; }; pp.rot = 0.012;
      T.word(g, 'pper', x0 + wB + wo - s2 * 0.06 + wp / 2, base, s2, pp); T.gloss(g, 'pper', x0 + wB + wo - s2 * 0.06 + wp / 2, base, s2, pp, 0.5);
      b.rot = -0.03; T.word(g, 'B', x0 + wB / 2, base + 8 * k, s2 * 1.06, b); T.gloss(g, 'B', x0 + wB / 2, base + 8 * k, s2 * 1.06, b, 0.5);
      bomb(g, T, L, x0 + wB + wo * 0.44, base - s2 * 0.3, s2 * 0.36, -0.12, 2); return W; }
    if (oneLine) { var w1 = width('Soul', s1), w2 = width('B', s2) + s2 * 0.6 + width('pper', s2), gap = 40 * k, x0 = cx - (w1 + gap + w2) / 2; soul(x0 + w1 / 2, y1); bopper(x0 + w1 + gap + w2 / 2, y1 + 2 * k); return; }
    soul(cx + 37 * k, y1); bopper(cx + 6 * k, y2);
  }
  function emblem(g, T, L) {   // picture coordinates
    burst(g, T, 470, 96, 50, '#ffb02e'); burst(g, T, 852, 132, 60, '#ffb02e'); burst(g, T, 800, 400, 70, '#ffb02e'); burst(g, T, 350, 300, 44, '#ffd23e'); burst(g, T, 96, 330, 40, '#ffd23e');
    bomb(g, T, L, 470, 84, 34, -0.3); bomb(g, T, L, 858, 124, 62, 0.2, true); bomb(g, T, L, 84, 336, 34, 0.5); bomb(g, T, L, 792, 262, 40, 0.5);
    bat(g, T, L, 578, 172, 1.05, -0.05); bat(g, T, L, 912, 262, 0.9, 0.25);
    ghost(g, T, L, 250, 236, 1.2);
    var r = T.rng(12); for (var i = 0; i < 70; i++) { var a = r() * TAU, d = 170 + r() * 330; g.globalAlpha = 0.5 + r() * 0.5; g.fillStyle = ['#ffd23e', '#ff9a2a', '#7fe8ff', '#ffffff'][i % 4]; g.beginPath(); g.ellipse(540 + Math.cos(a) * d, 300 + Math.sin(a) * d * 0.56, 1.5 + r() * 3.5, 1 + r() * 2, a, 0, TAU); g.fill(); } g.globalAlpha = 1;
    words(g, T, L, 540, 320, 463, 1);
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { floor(g, T, L); bomb(g, T, L, 100, 486, 70, -0.3); bomb(g, T, L, 936, 500, 60, 0.3); emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(26, 18); g.fillStyle = T.rad(g, 545, 300, 100, 400, [0, 'rgba(120,200,255,.6)', 0.5, 'rgba(130,90,255,.4)', 1, 'rgba(110,90,255,0)']); g.fillRect(-26, -18, 1040, 590); emblem(g, T, L); return; }
    if (kind === 'wide') { ghost(g, T, L, 92, 116, 0.5, true); words(g, T, L, 516, 150, 0, 0.6, true); return; }
    if (kind === 'badge') { g.save(); T.rr(g, 8, 8, 384, 384, 86); g.fillStyle = T.lin(g, 0, 0, 400, 400, [0, L.sky[0], 0.5, L.sky[1], 1, L.sky[2]]); g.fill(); g.clip(); g.fillStyle = T.rad(g, 200, 180, 20, 280, [0, 'rgba(140,220,255,.6)', 1, 'rgba(0,0,0,.25)']); g.fillRect(0, 0, 400, 400);
      if (px >= 90) { burst(g, T, 300, 110, 40, '#ffb02e'); bomb(g, T, L, 304, 104, 34, 0.2); ghost(g, T, L, 120, 128, 0.74); words(g, T, L, 196, 268, 352, 0.58); } else { ghost(g, T, L, 190, 190, 1.35, true); bomb(g, T, L, 320, 300, 44, 0.2); }
      g.restore(); T.rr(g, 8, 8, 384, 384, 86); g.lineWidth = 12; g.strokeStyle = L.dark; g.stroke(); g.lineWidth = 6; g.strokeStyle = T.lin(g, 0, 0, 400, 400, [0, L.a[2], 1, L.b[2]]); g.stroke(); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO soulbopper END
