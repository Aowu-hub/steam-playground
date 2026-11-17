// 🏷️ LOGO brawl-buddies START — 🥊 Brawl Buddies, drawn in code from Aowu's picture (gl-11; draft 3 gl-r9: one-piece characters). People as pictured (Aowu).
GameLogos.add('brawl-buddies', (function () {
  var BOX = { scene: [1024, 572], main: [760, 566], wide: [880, 200], badge: [400, 400] };
  function mk(o) { var b = { bg: ['#262a34', '#16181f'], sky: ['#6ac8ff', '#dff5ff'], hill: '#7ad06a', floor: '#b8bcc8', floor2: '#9aa0b0', wall: ['#d8663a', '#a84424'], frame: ['#fff0a0', '#ffc531', '#c9820a'],
    w1: ['#fff36a', '#ffb81a', '#ff6a14', '#e8320a'], w2: ['#d8f4ff', '#5ac0ff', '#2a84f0', '#1a52c8'], dark: '#1a1040', ink: '#2a1408' }; for (var k in o) b[k] = o[k]; return b; }
  var LOOK = { classic: mk({}),
    playground: mk({ sky: ['#8ED6FF', '#E8F7FF'], hill: '#9BD77A', floor: '#D9B77A', floor2: '#C9A46A' }), candy: mk({ sky: ['#FFC1E3', '#FFF0F8'], hill: '#FFD9EC', floor: '#FF9AC9', floor2: '#FF84BC', wall: ['#ff8ac0', '#d85a98'] }),
    dino: mk({ sky: ['#2F6B33', '#B5DE8F'], hill: '#4E8F3A', floor: '#8A6633', floor2: '#7A5A2E', wall: ['#8a6a3a', '#5a4220'] }), moon: mk({ sky: ['#05041A', '#2A1E5C'], hill: '#3A3470', floor: '#C1BED3', floor2: '#A9A6BE', wall: ['#5a5a8a', '#3a3a6a'] }),
    dojo: mk({ sky: ['#F6D7A7', '#FFF4E2'], hill: '#E9C08A', floor: '#D29A5A', floor2: '#C08648', wall: ['#b8562a', '#7a2a12'] }), beach: mk({ sky: ['#4FC3F7', '#E1F5FE'], hill: '#29B6F6', floor: '#F2D49B', floor2: '#E8C27E', wall: ['#e8a85a', '#b87a3a'] }) };
  var TAU = Math.PI * 2;
  function boom(g, T, x, y, R, c1, c2, rot) { g.save(); g.shadowColor = c1; g.shadowBlur = R * 0.3; T.star(g, x, y, R, R * 0.58, 11, rot || 0.2); g.fillStyle = c1; g.fill(); g.restore(); T.star(g, x, y, R * 0.74, R * 0.42, 11, (rot || 0.2) + 0.3); g.fillStyle = c2; g.fill(); }
  function world(g, T, L, x, y, w, h) {   // sky, brick wall on the left, hills + path on the right, pavement
    g.fillStyle = T.lin(g, 0, y, 0, y + h * 0.9, [0, L.sky[0], 0.55, L.sky[0], 1, L.sky[1]]); g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,.85)'; [[x + w * 0.5, y + h * 0.3, 40], [x + w * 0.62, y + h * 0.26, 30], [x + w * 0.3, y + h * 0.4, 26]].forEach(function (c) { g.beginPath(); g.ellipse(c[0], c[1], c[2] * 1.6, c[2] * 0.6, 0, 0, TAU); g.fill(); });
    g.beginPath(); g.moveTo(x + w * 0.56, y + h); g.quadraticCurveTo(x + w * 0.76, y + h * 0.5, x + w, y + h * 0.58); g.lineTo(x + w, y + h); g.closePath(); g.fillStyle = L.hill; g.fill();
    g.beginPath(); g.moveTo(x + w * 0.7, y + h); g.quadraticCurveTo(x + w * 0.96, y + h * 0.82, x + w * 0.86, y + h * 0.7); g.quadraticCurveTo(x + w * 0.8, y + h * 0.64, x + w * 0.92, y + h * 0.6); g.lineWidth = 22; g.strokeStyle = '#e8d49a'; g.lineCap = 'round'; g.stroke();
    // brick wall
    var wx = x, ww = w * 0.3, wy = y + h * 0.3; g.fillStyle = T.lin(g, 0, wy, 0, y + h, [0, L.wall[0], 1, L.wall[1]]); g.fillRect(wx, wy, ww, h * 0.6); g.strokeStyle = 'rgba(60,20,8,.45)'; g.lineWidth = 2; for (var r = 0; r < 12; r++) { var yy = wy + r * 22; g.beginPath(); g.moveTo(wx, yy); g.lineTo(wx + ww, yy); g.stroke(); for (var cx = (r % 2 ? 0 : 22); cx < ww; cx += 44) { g.beginPath(); g.moveTo(wx + cx, yy); g.lineTo(wx + cx, yy + 22); g.stroke(); } }
    g.fillStyle = '#7a8090'; g.fillRect(wx, wy - 12, ww + 10, 14);
    g.save(); g.font = '700 30px ' + T.FONT; g.translate(wx + ww * 0.36, wy + h * 0.32); g.rotate(-0.08); g.lineJoin = 'round'; g.lineWidth = 6; g.strokeStyle = '#1a2a6a'; g.strokeText('GO!', 0, 0); g.fillStyle = '#5ff0ff'; g.fillText('GO!', 0, 0); g.restore();
    g.fillStyle = T.lin(g, 0, y + h * 0.84, 0, y + h, [0, L.floor, 1, L.floor2]); g.fillRect(x, y + h * 0.84, w, h * 0.16); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 2; for (var i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x + i * w / 5, y + h * 0.84); g.lineTo(x + i * w / 5 - 30, y + h); g.stroke(); }
  }
  /* ONE-PIECE characters (same method as the Soul Bopper ghost, Aowu 2026-11-16): every body part goes into ONE silhouette with ONE dark rim,
     no inner outlines; depth comes from colour — far parts darker, near parts drop a soft shadow on what they cover. Parts are in the picture's own
     1024 × 572 coordinates, so the characters stand exactly where they stand in Aowu's picture. o.tf[part] = the part's own transform (lean, head tilt). */
  function onePiece(g, T, o) {
    var m = g.getTransform(), sc = Math.max(0.15, Math.hypot(m.a, m.b)), W = o.W, H = o.H, TF = o.tf || {};
    function cv() { var c = document.createElement('canvas'); c.width = Math.max(2, Math.ceil(W * sc)); c.height = Math.max(2, Math.ceil(H * sc)); var h = c.getContext('2d'); h.scale(sc, sc); h.translate(-o.x0, -o.y0); h.lineCap = 'round'; h.lineJoin = 'round'; return h; }
    function put(h, name, col, dx, dy) { h.save(); if (TF[name]) TF[name](h); if (dx || dy) h.translate(dx, dy); h.fillStyle = col; h.strokeStyle = col; o.parts[name](h); h.restore(); }
    function inside(h, name, painter) { var t = cv(), k = cv(); t.save(); if (TF[name]) TF[name](t); painter(t); t.restore(); put(k, name, '#fff'); t.setTransform(1, 0, 0, 1, 0, 0); t.globalCompositeOperation = 'destination-in'; t.drawImage(k.canvas, 0, 0); h.save(); h.setTransform(1, 0, 0, 1, 0, 0); h.drawImage(t.canvas, 0, 0); h.restore(); }   // paint only inside one part
    var M = cv(); o.order.forEach(function (n) { put(M, n, '#fff'); });
    var Rm = cv(); Rm.setTransform(1, 0, 0, 1, 0, 0); var rw = (o.rimW || 4.4) * sc; for (var a = 0; a < 16; a++) Rm.drawImage(M.canvas, Math.cos(a * TAU / 16) * rw, Math.sin(a * TAU / 16) * rw); Rm.globalCompositeOperation = 'source-in'; Rm.fillStyle = o.rim; Rm.fillRect(0, 0, Rm.canvas.width, Rm.canvas.height);
    var B = cv(); o.colour(B, put, inside);
    B.setTransform(1, 0, 0, 1, 0, 0); B.globalCompositeOperation = 'destination-in'; B.drawImage(M.canvas, 0, 0);
    if (o.glow) { g.save(); g.shadowColor = o.glow; g.shadowBlur = o.glowBlur || 26; g.drawImage(Rm.canvas, o.x0, o.y0, W, H); g.restore(); }
    g.drawImage(Rm.canvas, o.x0, o.y0, W, H); g.drawImage(B.canvas, o.x0, o.y0, W, H);
  }
  function lg(h, x0, y0, x1, y1, st) { var q = h.createLinearGradient(x0, y0, x1, y1); for (var i = 0; i < st.length; i += 2) q.addColorStop(st[i], st[i + 1]); return q; }
  function rg(h, x, y, r0, r1, st) { var q = h.createRadialGradient(x, y, r0, x, y, r1); for (var i = 0; i < st.length; i += 2) q.addColorStop(st[i], st[i + 1]); return q; }
  // a tapered, bendy shape along a quadratic centre line (limbs, tails, ribbons): width w(t) for t 0 → 1, round ends
  function taper(h, p, w, n) { n = n || 20; var L1 = [], R1 = []; for (var i = 0; i <= n; i++) { var t = i / n, u = 1 - t, x = u * u * p[0] + 2 * u * t * p[2] + t * t * p[4], y = u * u * p[1] + 2 * u * t * p[3] + t * t * p[5], dx = 2 * u * (p[2] - p[0]) + 2 * t * (p[4] - p[2]), dy = 2 * u * (p[3] - p[1]) + 2 * t * (p[5] - p[3]), d = Math.hypot(dx, dy) || 1, ww = w(t) / 2; L1.push([x - dy / d * ww, y + dx / d * ww]); R1.push([x + dy / d * ww, y - dx / d * ww]); }
    h.beginPath(); L1.forEach(function (q, i) { h[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); for (var j = R1.length - 1; j >= 0; j--) h.lineTo(R1[j][0], R1[j][1]); h.closePath(); h.fill(); h.beginPath(); h.arc(p[0], p[1], w(0) / 2, 0, TAU); h.arc(p[4], p[5], w(1) / 2, 0, TAU); h.fill(); }
  function limb(h, p, w0, w1, bulge) { taper(h, p, function (t) { return w0 + (w1 - w0) * t + Math.sin(t * Math.PI) * (bulge || 0); }); }
  function around(h, x, y, a) { h.translate(x, y); h.rotate(a); h.translate(-x, -y); }
  var SKIN = ['#ffd6ae', '#f6b480', '#e08c56', '#b8673a'], WRAP = ['#ffffff', '#f3ede1', '#d3c9b8'];
  /* 🥊 the fighter: chibi head tilted into the punch, swept spiky hair, red headband with flying tails, right fist punching out to the left,
     left fist up in guard, upper body leaning into the punch, wide running stride */
  function boy(g, T, L, dx, dy, s) {
    g.save(); g.translate(dx, dy); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; var INK = L.ink, SH = 'rgba(110,40,10,';
    function UP(h) { around(h, 442, 436, -0.1); }                 // the upper body leans into the punch
    function HD(h) { UP(h); around(h, 434, 372, -0.07); }         // + the head tilts a little more
    function fistF(h) { h.save(); h.translate(304, 340); h.rotate(-0.42); T.rr(h, -31, -26, 60, 52, 20); h.fill(); h.beginPath(); h.ellipse(16, 18, 15, 11, 0.4, 0, TAU); h.fill(); h.restore(); }
    function fistB(h) { h.save(); h.translate(487, 366); h.rotate(0.25); T.rr(h, -20, -18, 40, 36, 14); h.fill(); h.restore(); }
    var HB = [[374, 314], [370, 282], [382, 256], [404, 240], [430, 236], [456, 242], [476, 260], [488, 288], [484, 314]], HT = [[342, 292], [346, 246], [366, 212], [398, 196], [436, 198], [474, 214], [504, 250], [504, 300]];
    function hair(h) { h.beginPath(); h.moveTo(HB[0][0], HB[0][1]); for (var i = 0; i < HT.length; i++) { var p0 = HB[i], p1 = HB[i + 1], t = HT[i]; h.quadraticCurveTo(p0[0] + (t[0] - p0[0]) * 0.5 - 10, p0[1] + (t[1] - p0[1]) * 0.55 + 2, t[0], t[1]); h.quadraticCurveTo(p1[0] + (t[0] - p1[0]) * 0.45 - 4, p1[1] + (t[1] - p1[1]) * 0.4 + 6, p1[0], p1[1]); } h.quadraticCurveTo(430, 270, HB[0][0], HB[0][1]); h.closePath(); h.fill(); }
    var P = {
      tails: function (h) { taper(h, [470, 292, 512, 262, 548, 280], function (t) { return 17 - t * 7; }); taper(h, [470, 298, 512, 306, 532, 330], function (t) { return 15 - t * 7; }); },
      legB: function (h) { limb(h, [462, 446, 482, 448, 488, 466], 31, 25); limb(h, [488, 466, 498, 474, 498, 488], 24, 17); h.beginPath(); h.ellipse(506, 492, 18, 10, 0.55, 0, TAU); h.fill(); },
      armB: function (h) { limb(h, [474, 384, 494, 388, 496, 410], 25, 20, 4); limb(h, [496, 410, 504, 394, 490, 380], 20, 18); fistB(h); },
      torso: function (h) { h.beginPath(); h.moveTo(394, 380); h.bezierCurveTo(408, 364, 470, 362, 486, 378); h.bezierCurveTo(484, 398, 470, 410, 468, 432); h.lineTo(412, 432); h.bezierCurveTo(408, 410, 394, 398, 394, 380); h.closePath(); h.fill(); h.beginPath(); h.ellipse(436, 368, 14, 10, 0, 0, TAU); h.fill(); },
      shorts: function (h) { h.beginPath(); h.moveTo(406, 422); h.lineTo(474, 420); h.quadraticCurveTo(490, 440, 494, 462); h.lineTo(454, 468); h.lineTo(442, 452); h.lineTo(428, 470); h.quadraticCurveTo(406, 468, 390, 458); h.quadraticCurveTo(394, 436, 406, 422); h.closePath(); h.fill(); },
      legF: function (h) { limb(h, [420, 448, 404, 452, 400, 466], 33, 26); limb(h, [400, 466, 392, 476, 394, 488], 25, 17); h.beginPath(); h.ellipse(382, 494, 25, 11, -0.06, 0, TAU); h.fill(); },
      head: function (h) { h.beginPath(); h.moveTo(428, 260); h.bezierCurveTo(462, 260, 480, 284, 480, 314); h.bezierCurveTo(480, 348, 458, 372, 430, 374); h.bezierCurveTo(400, 374, 378, 350, 378, 316); h.bezierCurveTo(378, 284, 396, 260, 428, 260); h.closePath(); h.fill(); h.beginPath(); h.ellipse(380, 324, 10, 13, -0.2, 0, TAU); h.ellipse(479, 322, 9, 13, 0.2, 0, TAU); h.fill(); },
      hair: hair,
      armF: function (h) { limb(h, [406, 386, 380, 372, 360, 372], 27, 21, 5); limb(h, [360, 372, 344, 364, 330, 352], 21, 20); fistF(h); }
    };
    g.fillStyle = 'rgba(30,20,40,.28)'; g.beginPath(); g.ellipse(444, 501, 88, 10, 0, 0, TAU); g.fill();
    onePiece(g, T, { x0: 270, y0: 190, W: 300, H: 325, rim: INK, rimW: 4.6, parts: P, order: ['tails', 'legB', 'armB', 'torso', 'shorts', 'legF', 'head', 'hair', 'armF'],
      tf: { tails: HD, armB: UP, torso: UP, head: HD, hair: HD, armF: UP },
      colour: function (B, put, inside) {
        put(B, 'tails', lg(B, 470, 270, 548, 330, [0, '#ff5a42', 0.6, '#d8221a', 1, '#9a1010']));
        inside(B, 'tails', function (h) { h.strokeStyle = 'rgba(255,200,180,.6)'; h.lineWidth = 2.5; h.beginPath(); h.moveTo(480, 286); h.quadraticCurveTo(512, 266, 540, 278); h.stroke(); });
        put(B, 'legB', lg(B, 460, 446, 506, 494, [0, SKIN[2], 1, SKIN[3]]));
        inside(B, 'legB', function (h) { h.fillStyle = WRAP[2]; h.fillRect(486, 474, 40, 40); h.strokeStyle = 'rgba(110,90,70,.55)'; h.lineWidth = 2; [476, 483, 490, 497].forEach(function (y) { h.beginPath(); h.moveTo(484, y); h.lineTo(526, y + 7); h.stroke(); }); });
        put(B, 'armB', lg(B, 470, 380, 506, 420, [0, SKIN[2], 1, SKIN[3]]));
        inside(B, 'armB', function (h) { h.fillStyle = rg(h, 480, 360, 2, 30, [0, WRAP[0], 0.6, WRAP[1], 1, WRAP[2]]); h.fillRect(462, 340, 54, 52); h.strokeStyle = 'rgba(110,90,70,.5)'; h.lineWidth = 2; [362, 370, 378].forEach(function (y) { h.beginPath(); h.moveTo(470, y); h.lineTo(506, y - 3); h.stroke(); }); });
        put(B, 'torso', lg(B, 396, 362, 486, 432, [0, SKIN[0], 0.45, SKIN[1], 1, SKIN[2]]));
        inside(B, 'torso', function (h) {   // pecs + six-pack as soft shade, the head + punching arm shade the chest
          h.strokeStyle = SH + '.34)'; h.lineWidth = 3.4; h.beginPath(); h.moveTo(412, 388); h.quadraticCurveTo(428, 400, 442, 390); h.moveTo(446, 390); h.quadraticCurveTo(462, 400, 478, 388); h.moveTo(444, 396); h.lineTo(442, 426); [406, 416].forEach(function (y) { h.moveTo(428, y); h.quadraticCurveTo(435, y + 3, 442, y); h.moveTo(446, y); h.quadraticCurveTo(452, y + 3, 460, y); }); h.stroke();
          h.fillStyle = rg(h, 436, 368, 4, 40, [0, SH + '.5)', 1, SH + '0)']); h.fillRect(390, 356, 100, 44);
          h.fillStyle = 'rgba(255,240,220,.35)'; h.beginPath(); h.ellipse(418, 404, 10, 18, 0.2, 0, TAU); h.fill(); });
        put(B, 'legF', SH + '.34)', 5, -5);
        put(B, 'legF', lg(B, 380, 448, 420, 498, [0, SKIN[1], 1, SKIN[2]]));
        inside(B, 'legF', function (h) { h.fillStyle = WRAP[1]; h.fillRect(356, 472, 60, 40); h.strokeStyle = 'rgba(110,90,70,.55)'; h.lineWidth = 2; [476, 483, 490, 497].forEach(function (y) { h.beginPath(); h.moveTo(360, y + 4); h.lineTo(410, y - 1); h.stroke(); }); });
        put(B, 'shorts', lg(B, 390, 420, 494, 470, [0, '#42b0ee', 0.5, '#2478c8', 1, '#154690']));
        inside(B, 'shorts', function (h) { h.fillStyle = 'rgba(10,30,80,.38)'; h.beginPath(); h.moveTo(442, 452); h.lineTo(454, 468); h.lineTo(494, 462); h.quadraticCurveTo(490, 444, 476, 430); h.closePath(); h.fill();
          h.fillStyle = lg(h, 0, 416, 0, 436, [0, '#ff5a44', 1, '#c01c16']); h.beginPath(); h.moveTo(400, 418); h.quadraticCurveTo(440, 428, 482, 414); h.lineTo(484, 432); h.quadraticCurveTo(440, 442, 398, 434); h.closePath(); h.fill(); h.fillStyle = 'rgba(255,220,200,.4)'; h.fillRect(404, 420, 74, 3); });
        put(B, 'head', rg(B, 414, 300, 6, 90, [0, SKIN[0], 0.55, SKIN[1], 1, SKIN[2]]));
        inside(B, 'head', function (h) { h.fillStyle = 'rgba(255,120,110,.35)'; h.beginPath(); h.ellipse(398, 344, 11, 7, 0, 0, TAU); h.ellipse(464, 342, 9, 7, 0, 0, TAU); h.fill(); h.fillStyle = SH + '.25)'; h.beginPath(); h.ellipse(472, 330, 10, 30, 0, 0, TAU); h.fill(); });
        put(B, 'hair', SH + '.42)', 0, 8);   // the hair shades the forehead
        put(B, 'hair', lg(B, 370, 206, 480, 306, [0, '#c99052', 0.4, '#8c5428', 1, '#4a280e']));
        inside(B, 'hair', function (h) { h.strokeStyle = 'rgba(255,224,176,.6)'; h.lineWidth = 3.4; HT.forEach(function (t, i) { var b0 = HB[i], b1 = HB[i + 1], mx = (b0[0] + b1[0]) / 2, my = (b0[1] + b1[1]) / 2 + 10; h.beginPath(); h.moveTo(mx + (t[0] - mx) * 0.2, my + (t[1] - my) * 0.2); h.quadraticCurveTo(mx + (t[0] - mx) * 0.5 - 6, my + (t[1] - my) * 0.5, mx + (t[0] - mx) * 0.78, my + (t[1] - my) * 0.78); h.stroke(); });
          // the headband across the forehead sits on top of the hair line
          h.fillStyle = lg(h, 0, 284, 0, 306, [0, '#ff6a52', 1, '#c01c16']); h.beginPath(); h.moveTo(370, 300); h.quadraticCurveTo(430, 270, 488, 292); h.lineTo(488, 308); h.quadraticCurveTo(430, 288, 372, 316); h.closePath(); h.fill(); });
        inside(B, 'head', function (h) { h.fillStyle = lg(h, 0, 284, 0, 306, [0, '#ff6a52', 1, '#c01c16']); h.beginPath(); h.moveTo(370, 300); h.quadraticCurveTo(430, 270, 488, 292); h.lineTo(488, 308); h.quadraticCurveTo(430, 288, 372, 316); h.closePath(); h.fill(); h.fillStyle = 'rgba(255,230,210,.45)'; h.beginPath(); h.moveTo(380, 300); h.quadraticCurveTo(430, 278, 480, 293); h.lineTo(480, 296); h.quadraticCurveTo(430, 282, 380, 304); h.closePath(); h.fill(); });
        put(B, 'armF', SH + '.34)', 6, 10);
        put(B, 'armF', lg(B, 410, 386, 330, 350, [0, SKIN[1], 0.6, SKIN[0], 1, SKIN[1]]));
        inside(B, 'armF', function (h) { h.save(); h.translate(304, 340); h.rotate(-0.42); h.fillStyle = rg(h, -8, -10, 2, 46, [0, WRAP[0], 0.6, WRAP[1], 1, WRAP[2]]); h.fillRect(-40, -34, 120, 70); h.restore(); h.fillStyle = WRAP[1]; h.beginPath(); h.moveTo(326, 330); h.lineTo(356, 352); h.lineTo(350, 380); h.lineTo(318, 366); h.closePath(); h.fill();
          h.strokeStyle = 'rgba(110,90,70,.5)'; h.lineWidth = 2; [0, 8, 16].forEach(function (d) { h.beginPath(); h.moveTo(332 + d, 342 + d * 0.6); h.lineTo(322 + d, 374 + d * 0.2); h.stroke(); }); });
      } });
    // details on top: fingers on the fists, face (in the head's own tilt)
    g.save(); UP(g); g.strokeStyle = 'rgba(110,90,70,.6)'; g.lineWidth = 2.4; g.save(); g.translate(304, 340); g.rotate(-0.42); [-12, 0, 12].forEach(function (x) { g.beginPath(); g.moveTo(x - 6, -22); g.quadraticCurveTo(x - 2, -6, x - 6, 8); g.stroke(); }); g.beginPath(); g.moveTo(-26, 8); g.quadraticCurveTo(0, 14, 24, 6); g.stroke(); g.restore();
    g.save(); g.translate(487, 366); g.rotate(0.25); [-8, 0, 8].forEach(function (x) { g.beginPath(); g.moveTo(x, -14); g.lineTo(x, 2); g.stroke(); }); g.restore(); g.restore();
    g.save(); HD(g);
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(392, 314); g.quadraticCurveTo(406, 314, 420, 324); g.moveTo(466, 312); g.quadraticCurveTo(452, 312, 440, 322); g.stroke();
    [[407, 334, 11.5, 13], [452, 333, 11, 13]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 2, e[1] + 1, 7, 0, TAU); g.fillStyle = T.lin(g, 0, e[1] - 7, 0, e[1] + 8, [0, '#16606c', 1, '#46d0d4']); g.fill(); g.beginPath(); g.arc(e[0] + 2, e[1] + 1, 3.3, 0, TAU); g.fillStyle = '#081820'; g.fill(); g.beginPath(); g.arc(e[0] - 1, e[1] - 3, 2.4, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.strokeStyle = 'rgba(120,50,20,.55)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(430, 340); g.quadraticCurveTo(426, 350, 432, 352); g.stroke();
    function grin() { g.beginPath(); g.moveTo(398, 352); g.quadraticCurveTo(430, 364, 464, 348); g.quadraticCurveTo(456, 374, 430, 374); g.quadraticCurveTo(404, 372, 398, 352); g.closePath(); }
    grin(); g.fillStyle = '#fff'; g.fill(); g.save(); grin(); g.clip(); g.strokeStyle = 'rgba(80,60,60,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(398, 362); g.quadraticCurveTo(430, 370, 462, 358); [414, 430, 446].forEach(function (x) { g.moveTo(x, 352); g.lineTo(x, 376); }); g.stroke(); g.restore(); grin(); g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
    g.restore(); g.restore();
  }
  /* 🐾 the red panda buddy: chubby, running to the right and leaning in, front mitt up at the chest, back mitt punching up-right,
     back leg kicking out behind, front knee up with the paw pads showing, big bushy striped tail curling up behind */
  function panda(g, T, L, dx, dy, s) {
    g.save(); g.translate(dx, dy); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; var INK = L.ink, SH = 'rgba(70,20,0,', F = ['#ffb052', '#f27e22', '#c8540e', '#8a3208'], DK = ['#8a4422', '#5c2a10', '#3a1806'];
    var TAIL = [578, 452, 484, 458, 514, 338];
    function mitt(h, x, y, rot, k) { h.save(); h.translate(x, y); h.rotate(rot); h.scale(k, k); T.rr(h, -26, -24, 50, 46, 18); h.fill(); h.beginPath(); h.ellipse(-22, 8, 11, 15, 0.3, 0, TAU); h.fill(); T.rr(h, -20, 18, 38, 16, 6); h.fill(); h.restore(); }
    var P = {
      tail: function (h) { taper(h, TAIL, function (t) { return 26 + Math.sin(t * Math.PI * 0.9) * 32 - t * 4; }); },
      legB: function (h) { limb(h, [584, 456, 566, 470, 554, 478], 34, 27); limb(h, [554, 478, 546, 484, 540, 486], 27, 24); h.beginPath(); h.ellipse(530, 490, 24, 13, -0.3, 0, TAU); h.fill(); },
      armB: function (h) { limb(h, [644, 386, 680, 384, 706, 352], 30, 24, 4); mitt(h, 724, 326, -0.65, 1.05); },
      body: function (h) { h.beginPath(); h.ellipse(604, 410, 60, 66, -0.32, 0, TAU); h.fill(); },
      legF: function (h) { limb(h, [636, 456, 664, 444, 676, 458], 34, 28); h.beginPath(); h.ellipse(686, 462, 24, 18, -0.75, 0, TAU); h.fill(); },
      ears: function (h) { [[568, 276, -0.55], [676, 270, 0.5]].forEach(function (e) { h.save(); h.translate(e[0], e[1]); h.rotate(e[2]); h.beginPath(); h.moveTo(-28, 24); h.quadraticCurveTo(-26, -28, 0, -36); h.quadraticCurveTo(26, -28, 28, 24); h.closePath(); h.fill(); h.restore(); }); },
      head: function (h) { h.beginPath(); h.moveTo(560, 312); h.bezierCurveTo(562, 274, 592, 260, 622, 260); h.bezierCurveTo(654, 260, 684, 274, 686, 310); h.lineTo(702, 316); h.lineTo(690, 328); h.lineTo(700, 340); h.lineTo(682, 344); h.bezierCurveTo(668, 366, 646, 372, 622, 372); h.bezierCurveTo(598, 372, 576, 366, 562, 346); h.lineTo(544, 342); h.lineTo(554, 330); h.lineTo(542, 318); h.closePath(); h.fill(); },
      armF: function (h) { limb(h, [612, 404, 598, 414, 588, 400], 28, 24); mitt(h, 578, 384, 0.15, 1); }
    };
    g.fillStyle = 'rgba(30,20,40,.28)'; g.beginPath(); g.ellipse(606, 500, 94, 10, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3.5; [[516, 462, 488, 452], [512, 476, 480, 474], [516, 490, 490, 500], [700, 488, 724, 496]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    onePiece(g, T, { x0: 460, y0: 216, W: 310, H: 300, rim: INK, rimW: 4.6, parts: P, order: ['tail', 'legB', 'armB', 'body', 'legF', 'ears', 'head', 'armF'],
      colour: function (B, put, inside) {
        put(B, 'tail', lg(B, 480, 340, 586, 450, [0, F[0], 0.5, F[1], 1, F[2]]));
        inside(B, 'tail', function (h) { for (var i = 1; i <= 5; i += 2) { var t = i / 6.3, u = 1 - t, x = u * u * TAIL[0] + 2 * u * t * TAIL[2] + t * t * TAIL[4], y = u * u * TAIL[1] + 2 * u * t * TAIL[3] + t * t * TAIL[5], an = Math.atan2(2 * u * (TAIL[3] - TAIL[1]) + 2 * t * (TAIL[5] - TAIL[3]), 2 * u * (TAIL[2] - TAIL[0]) + 2 * t * (TAIL[4] - TAIL[2])); h.save(); h.translate(x, y); h.rotate(an + Math.PI / 2); h.fillStyle = DK[1]; h.beginPath(); h.ellipse(0, 0, 50, 9, 0, 0, TAU); h.fill(); h.restore(); }
          h.fillStyle = 'rgba(70,20,0,.3)'; h.beginPath(); h.ellipse(560, 430, 40, 30, 0, 0, TAU); h.fill(); });   // the body shades the tail root
        put(B, 'legB', lg(B, 582, 446, 530, 492, [0, DK[1], 1, DK[2]]));
        put(B, 'armB', lg(B, 644, 390, 706, 350, [0, F[2], 0.6, F[1], 1, F[2]]));
        inside(B, 'armB', function (h) { h.save(); h.translate(724, 326); h.rotate(-0.65); h.scale(1.05, 1.05); h.fillStyle = rg(h, -8, -10, 2, 40, [0, '#9096ac', 0.5, '#4a4e60', 1, '#22242e']); h.fillRect(-40, -34, 80, 52); h.fillStyle = '#30323c'; h.fillRect(-22, 18, 38, 16); h.fillStyle = 'rgba(255,255,255,.28)'; h.fillRect(-22, 20, 38, 3); h.restore(); });
        put(B, 'body', rg(B, 616, 380, 8, 86, [0, F[0], 0.5, F[1], 1, F[3]]));
        inside(B, 'body', function (h) { h.fillStyle = rg(h, 626, 404, 4, 60, [0, '#8e4824', 0.75, '#6a3014', 1, '#5a2810']); h.beginPath(); h.ellipse(616, 420, 42, 52, -0.32, 0, TAU); h.fill(); h.fillStyle = rg(h, 622, 370, 4, 50, [0, SH + '.55)', 1, SH + '0)']); h.fillRect(560, 340, 120, 60); });
        put(B, 'legF', SH + '.3)', -3, -5);
        put(B, 'legF', lg(B, 636, 440, 694, 474, [0, F[2], 0.4, DK[0], 1, DK[1]]));
        inside(B, 'legF', function (h) { h.fillStyle = '#e8908e'; h.beginPath(); h.ellipse(690, 466, 11, 8, -0.75, 0, TAU); h.fill(); [[674, 455], [681, 447], [691, 445], [699, 450]].forEach(function (p) { h.beginPath(); h.arc(p[0], p[1], 4, 0, TAU); h.fill(); }); });
        put(B, 'ears', F[2]);
        inside(B, 'ears', function (h) { [[568, 276, -0.55], [676, 270, 0.5]].forEach(function (e) { h.save(); h.translate(e[0], e[1]); h.rotate(e[2]); h.fillStyle = '#fff6ea'; h.beginPath(); h.moveTo(-21, 22); h.quadraticCurveTo(-18, -20, 0, -28); h.quadraticCurveTo(18, -20, 21, 22); h.closePath(); h.fill(); h.fillStyle = DK[1]; h.beginPath(); h.moveTo(-11, 22); h.quadraticCurveTo(-9, -6, 0, -12); h.quadraticCurveTo(9, -6, 11, 22); h.closePath(); h.fill(); h.restore(); }); });
        put(B, 'head', rg(B, 610, 292, 8, 100, [0, F[0], 0.5, F[1], 1, F[2]]));
        inside(B, 'head', function (h) {   // face mask: white brows, white cheeks + muzzle, dark tear marks round the eyes
          h.fillStyle = '#fff8ee'; h.beginPath(); h.ellipse(598, 286, 14, 7, 0.35, 0, TAU); h.ellipse(646, 284, 14, 7, -0.35, 0, TAU); h.fill();
          h.beginPath(); h.ellipse(566, 334, 26, 22, 0.25, 0, TAU); h.ellipse(678, 330, 26, 22, -0.25, 0, TAU); h.ellipse(622, 342, 34, 28, 0, 0, TAU); h.fill();
          h.fillStyle = DK[1]; h.beginPath(); h.moveTo(586, 300); h.quadraticCurveTo(612, 300, 610, 322); h.quadraticCurveTo(602, 346, 586, 352); h.quadraticCurveTo(580, 326, 586, 300); h.closePath(); h.moveTo(658, 298); h.quadraticCurveTo(632, 298, 634, 320); h.quadraticCurveTo(642, 344, 658, 350); h.quadraticCurveTo(664, 324, 658, 298); h.closePath(); h.fill();
          h.fillStyle = 'rgba(255,220,170,.4)'; h.beginPath(); h.ellipse(604, 274, 22, 8, -0.2, 0, TAU); h.fill(); });
        put(B, 'armF', SH + '.36)', 6, 8);
        put(B, 'armF', lg(B, 612, 404, 588, 396, [0, F[1], 1, F[2]]));
        inside(B, 'armF', function (h) { h.save(); h.translate(578, 384); h.rotate(0.15); h.fillStyle = rg(h, -8, -10, 2, 40, [0, '#9096ac', 0.5, '#4a4e60', 1, '#22242e']); h.fillRect(-40, -34, 80, 52); h.fillStyle = '#30323c'; h.fillRect(-22, 18, 40, 16); h.fillStyle = 'rgba(255,255,255,.28)'; h.fillRect(-22, 20, 40, 3); h.restore(); });
      } });
    // details on top: mitt fingers + shine, eyes, nose, open happy mouth, belly fur
    g.strokeStyle = 'rgba(10,10,20,.6)'; g.lineWidth = 2.4;
    [[724, 326, -0.65, 1.05], [578, 384, 0.15, 1]].forEach(function (m) { g.save(); g.translate(m[0], m[1]); g.rotate(m[2]); g.scale(m[3], m[3]); [-10, 2, 13].forEach(function (x) { g.beginPath(); g.moveTo(x, -22); g.lineTo(x, -4); g.stroke(); }); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-6, -14, 10, 5, -0.2, 0, TAU); g.fill(); g.restore(); });
    [[600, 316, 9.5, 11], [644, 314, 9.5, 11]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(e[0] + 1, e[1] + 1, 6.5, 0, TAU); g.fillStyle = T.lin(g, 0, e[1] - 6, 0, e[1] + 7, [0, '#5a2a0a', 1, '#d08030']); g.fill(); g.beginPath(); g.arc(e[0] + 1, e[1] + 1, 3, 0, TAU); g.fillStyle = '#1a0a04'; g.fill(); g.beginPath(); g.arc(e[0] - 2, e[1] - 2, 2.2, 0, TAU); g.fillStyle = '#fff'; g.fill(); });
    g.strokeStyle = INK; g.lineWidth = 4.5; g.beginPath(); g.moveTo(586, 296); g.lineTo(610, 304); g.moveTo(658, 294); g.lineTo(634, 302); g.stroke();
    g.beginPath(); g.moveTo(612, 326); g.quadraticCurveTo(622, 320, 632, 326); g.quadraticCurveTo(630, 336, 622, 338); g.quadraticCurveTo(614, 336, 612, 326); g.fillStyle = '#2a1408'; g.fill(); g.beginPath(); g.ellipse(619, 326, 3.5, 2, 0, 0, TAU); g.fillStyle = 'rgba(255,255,255,.7)'; g.fill();
    function mouth() { g.beginPath(); g.moveTo(596, 344); g.quadraticCurveTo(622, 354, 650, 342); g.quadraticCurveTo(646, 372, 622, 372); g.quadraticCurveTo(598, 370, 596, 344); g.closePath(); }
    mouth(); g.fillStyle = '#6a1018'; g.fill(); g.save(); mouth(); g.clip(); g.fillStyle = '#ff7a8a'; g.beginPath(); g.ellipse(624, 372, 16, 10, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(602, 340, 9, 7); g.fillRect(634, 340, 9, 7); g.restore(); mouth(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = 'rgba(30,8,0,.45)'; g.lineWidth = 2; [[600, 408, 606, 418], [612, 400, 616, 410], [626, 414, 628, 424], [604, 432, 610, 440]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    g.restore();
  }
  function words(g, T, L, cx, y1, y2, k, oneLine) {
    function o(c, sz, glow, white) { return { clean: true /* gl-r20 clean B */, spacing: sz * 0.015, dark: L.dark, outline: sz * 0.2, depth: sz * 0.1, fat: sz * 0.02, glow: glow, glowN: 2, glowBlur: 0.36, face: function () { return [0, c[0], 0.3, c[1], 0.7, c[2], 1, c[3]]; }, inner: white }; }
    var s1 = 96 * k, s2 = 86 * k, a = o(L.w1, s1, 'rgba(255,170,40,1)', 'rgba(255,250,200,.6)'), b = o(L.w2, s2, 'rgba(110,200,255,1)', 'rgba(255,255,255,.9)');
    if (oneLine) { g.save(); g.font = '700 ' + s1 + 'px ' + T.FONT; var w1 = g.measureText('BRAWL').width + 4 * s1 * 0.015; g.font = '700 ' + s2 + 'px ' + T.FONT; var w2 = g.measureText('BUDDIES').width + 6 * s2 * 0.015; g.restore(); var gap = 26 * k, x0 = cx - (w1 + gap + w2) / 2; T.word(g, 'BRAWL', x0 + w1 / 2, y1, s1, a); T.gloss(g, 'BRAWL', x0 + w1 / 2, y1, s1, a, 0.5); T.word(g, 'BUDDIES', x0 + w1 + gap + w2 / 2, y1, s2, b); T.gloss(g, 'BUDDIES', x0 + w1 + gap + w2 / 2, y1, s2, b, 0.5); return; }
    a.wave = function (j) { return [8, 1, -3, 1, 8][j] * k; }; a.rot = -0.02; b.wave = function (j) { return [5, 1, -2, -3, -2, 1, 5][j] * k; };
    T.word(g, 'BUDDIES', cx, y2, s2, b); T.gloss(g, 'BUDDIES', cx, y2, s2, b, 0.5); T.word(g, 'BRAWL', cx, y1, s1, a); T.gloss(g, 'BRAWL', cx, y1, s1, a, 0.5);
  }
  function frame(g, T, L, x, y, w, h, inner) {
    g.save(); T.rr(g, x, y, w, h, 56); g.clip(); inner(); g.restore();
    g.save(); g.shadowColor = '#ffd23e'; g.shadowBlur = 26; T.rr(g, x, y, w, h, 56); g.lineWidth = 20; g.strokeStyle = '#5a3404'; g.stroke(); g.shadowBlur = 0; g.lineWidth = 14; g.strokeStyle = T.lin(g, x, y, x + w, y + h, [0, L.frame[0], 0.3, L.frame[1], 0.6, L.frame[2], 1, L.frame[0]]); g.stroke(); T.rr(g, x - 9, y - 9, w + 18, h + 18, 64); g.lineWidth = 3; g.strokeStyle = '#5ff0ff'; g.shadowColor = '#5ff0ff'; g.shadowBlur = 14; g.stroke(); g.restore();
  }
  function emblem(g, T, L) {
    boom(g, T, 236, 320, 120, '#ff9a1c', '#ffe14a', 0.1); boom(g, T, 794, 230, 130, '#ff9a1c', '#ffe14a', 0.4); boom(g, T, 246, 130, 70, '#ff5a2a', '#ffb02e', 0.6); boom(g, T, 790, 440, 80, '#ff5a2a', '#ffb02e', 0.2);
    frame(g, T, L, 268, 36, 488, 500, function () { world(g, T, L, 268, 36, 488, 500); panda(g, T, L, 0, 0, 1); boy(g, T, L, 0, 0, 1); });
    words(g, T, L, 512, 126, 218, 1.18);
    [[300, 60, 10], [730, 70, 12], [770, 400, 9], [250, 440, 8]].forEach(function (s) { T.star(g, s[0], s[1], s[2], s[2] * 0.5); g.fillStyle = '#ffe14a'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#8a4a04'; g.lineJoin = 'round'; g.stroke(); });
  }
  function paint(g, kind, L, px, T) {
    if (kind === 'scene') { g.fillStyle = T.rad(g, 512, 286, 60, 640, [0, L.bg[0], 1, L.bg[1]]); g.fillRect(0, 0, 1024, 572); var r = T.rng(7); for (var i = 0; i < 40; i++) { g.globalAlpha = 0.5 + r() * 0.5; g.fillStyle = ['#ff8a2a', '#5ff0ff', '#ff5ad8', '#ffe14a'][i % 4]; g.beginPath(); g.arc(r() * 1024, r() * 572, 2 + r() * 5, 0, TAU); g.fill(); } g.globalAlpha = 1; emblem(g, T, L); return; }
    if (kind === 'main') { g.translate(-132, -4); emblem(g, T, L); return; }
    if (kind === 'wide') { g.save(); g.translate(22, 28); g.scale(0.3, 0.3); g.translate(-268, -36); frame(g, T, L, 268, 36, 488, 500, function () { world(g, T, L, 268, 36, 488, 500); panda(g, T, L, 0, 0, 1); boy(g, T, L, 0, 0, 1); }); g.restore(); words(g, T, L, 526, 134, 0, 0.82, true); return; }
    if (kind === 'badge') { g.translate(200, 200); g.scale(0.74, 0.74); g.translate(-512, -286); frame(g, T, L, 268, 36, 488, 500, function () { world(g, T, L, 268, 36, 488, 500); if (px >= 90) { panda(g, T, L, 0, 0, 1); boy(g, T, L, 0, 0, 1); } else { g.save(); g.translate(512, 300); g.scale(1.3, 1.3); g.translate(-520, -400); panda(g, T, L, 0, 0, 1); boy(g, T, L, 0, 0, 1); g.restore(); } }); if (px >= 90) words(g, T, L, 512, 126, 218, 1.18); return; }
  }
  return { BOX: BOX, LOOK: LOOK, paint: paint };
})());
// 🏷️ LOGO brawl-buddies END
