
/* 🎬 Cover_word_board — 📏 b6a: the "word-board" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER word-board START — 🔤 Lettercraft: a cosy reading nook — bookshelves full of coloured spines, a round window with a moon-and-stars sky,
  //    a reading lamp; on the desk a blue word board with a crossword (STA? across, PLANT down, crossing on the A). Live: the R tile hops from the rack
  //    into its square, the word glows and a 📖 word card flips up with a drawn star, the rival 🦉 owl perched beside the board blinks and flaps.
  //    🏆 champions stand in front of the desk. (🧱 b3w6b, 2026-11-17)
  (function(){
    const N = 9, CYC = 5.6;
    const T = {wall1: '#FFE7A8', wall2: '#9FC2F2', board: '#5B7FBF', cell: '#E8EEF9', tile: '#FFFDF5', ink: '#1F2A44', p2t: '#9AD3F2', p3t: '#3D7DD8', p2e: '#F7B2BE', p3e: '#E5484D'};
    const BONUS = {'0,0': 'p3e', '8,0': 'p3e', '0,8': 'p3e', '8,8': 'p3e', '1,1': 'p2e', '7,1': 'p2e', '1,7': 'p2e', '7,7': 'p2e', '2,6': 'p2t', '6,2': 'p2t', '0,4': 'p3t', '8,4': 'p3t', '4,0': 'p3t', '4,8': 'p3t', '3,7': 'p2t', '3,1': 'p2t'};
    const SET = [[3, 4, 'S'], [4, 4, 'T'], [5, 4, 'A'], [5, 2, 'P'], [5, 3, 'L'], [5, 5, 'N'], [5, 6, 'T']];   // the R flies to (6, 4)
    const RACK = ['R', 'E', 'O', 'M', 'D'];
    const FONT = px => '700 ' + Math.max(6, Math.round(px)) + "px 'Fredoka', 'Nunito', sans-serif";
    const geo = (W, H) => {
      const wide = W > H * 1.05, hy = H * (wide ? 0.36 : 0.38);
      let fw = wide ? Math.min(W * 0.6, H * 1.2) : W * 0.92, cx = W / 2, bot = H * (wide ? 0.68 : 0.66), dep = Math.min(bot - hy - H * 0.05, fw * 0.5), top = bot - dep;
      if(Z){ const m = Math.max(8, Math.min(W, H) * 0.025), t2 = Z.y + Z.h + m, over = !(Z.x + Z.w + m <= cx - fw / 2 || Z.x - m >= cx + fw / 2);   /* 🏷️ 24j-e + b3w5b: the board stays centred and starts under the logo */
        if(over && t2 > top){ const room = bot - t2, room2 = (H - Math.max(6, H * 0.02) - t2) / 1.36;   /* 1.36 = the board + the rack in front of it */
          if(room >= dep * 0.5){ const k = Math.min(1, room / dep); fw *= k; dep *= k; top = t2; bot = top + dep; }
          else if(room2 >= dep * 0.45){ const k = Math.min(1, room2 / dep); fw *= k; dep *= k; top = t2; bot = top + dep; }   /* short art: the board + rack may come down to the bottom edge */
          else { const F = away(cx - fw / 2, top, fw, dep, W, H, {only: 'x', min: 0.6}); fw *= F.s; dep *= F.s; cx = F.x + fw / 2; bot = top + dep; } } }
      const B = (u, v) => { const s = lerp(0.76, 1, v); return {x: cx + (u - 0.5) * fw * s, y: lerp(top, bot, v), s}; };
      return {wide, hy, B, fw, dep, top, bot, cx};
    };
    const quad = (B, i, j, a) => [B((i + a) / N, (j + a) / N), B((i + 1 - a) / N, (j + a) / N), B((i + 1 - a) / N, (j + 1 - a) / N), B((i + a) / N, (j + 1 - a) / N)];
    function tileAt(g, B, i, j, ch, glow){
      const q = quad(B, i, j, 0.07), th = (q[3].y - q[0].y) * 0.22;
      poly(g, [[q[3].x, q[3].y], [q[2].x, q[2].y], [q[2].x, q[2].y + th], [q[3].x, q[3].y + th]], shade('#F2E4C4', -0.3));
      if(glow){ g.save(); g.shadowColor = 'rgba(255,220,90,' + (0.9 * glow) + ')'; g.shadowBlur = 14; }
      poly(g, q.map(p => [p.x, p.y]), glow ? mix(T.tile, '#FFE98A', glow * 0.7) : T.tile, shade('#F2E4C4', -0.4), 1.2);
      if(glow) g.restore();
      const cx = (q[0].x + q[2].x) / 2, cy = (q[0].y + q[2].y) / 2, cw = q[1].x - q[0].x, ch2 = q[3].y - q[0].y;
      g.save(); g.translate(cx, cy); g.scale(1, Math.min(1, ch2 / cw * 1.35)); g.fillStyle = T.ink; g.font = FONT(cw * 0.64); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, cw * 0.03); g.restore();
    }
    function upTile(g, x, y, w, ch, rot){
      g.save(); g.translate(x, y); if(rot) g.rotate(rot);
      g.fillStyle = shade('#F2E4C4', -0.3); g.beginPath(); g.roundRect(-w / 2, -w / 2 + w * 0.12, w, w, w * 0.16); g.fill();
      g.fillStyle = T.tile; g.strokeStyle = shade('#F2E4C4', -0.4); g.lineWidth = Math.max(1, w * 0.04); g.beginPath(); g.roundRect(-w / 2, -w / 2, w, w, w * 0.16); g.fill(); g.stroke();
      g.fillStyle = T.ink; g.font = FONT(w * 0.66); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, w * 0.04); g.restore();
    }
    const rackGeo = (B, dep) => { const a = B(0.22, 1.13), b = B(0.78, 1.13), w = Math.min((b.x - a.x) / 5.6, dep * 0.2); return {y: a.y + w * 0.5, w, x: k => (a.x + b.x) / 2 + (k - 2) * w * 1.08}; };
    const owlAt = (W, H, G) => { const p = G.B(-0.1, 0.46), s = G.fw / 560; return {x: Math.max(p.x, 30 * s + 4), y: p.y, s}; };   /* the rival perches on the desk beside the board */
    function owl(g, x, y, s, t, look, flap){
      g.save(); g.translate(x, y + Math.sin(t * 2) * 2 * s);
      const w = flap ? Math.sin(t * 16) * 0.6 + 0.5 : 0.08;
      [-1, 1].forEach(k => { g.save(); g.translate(k * 20 * s, -30 * s); g.rotate(-k * w); g.fillStyle = '#7A5230'; g.beginPath(); g.ellipse(k * 6 * s, 6 * s, 9 * s, 19 * s, k * 0.3, 0, 7); g.fill(); g.restore(); });
      g.fillStyle = '#A06B3C'; g.strokeStyle = '#5C3A1C'; g.lineWidth = 2 * s; g.beginPath(); g.ellipse(0, -32 * s, 24 * s, 32 * s, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#E8C99A'; g.beginPath(); g.ellipse(0, -22 * s, 14 * s, 18 * s, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(160,107,60,.6)'; g.lineWidth = 1.4 * s; for(let r = 0; r < 3; r++) for(let k = -1; k <= 1; k++){ g.beginPath(); g.arc(k * 6 * s, -28 * s + r * 7 * s, 3 * s, 0.2, Math.PI - 0.2); g.stroke(); }
      g.fillStyle = '#A06B3C'; [-1, 1].forEach(k => { g.beginPath(); g.moveTo(k * 12 * s, -58 * s); g.lineTo(k * 22 * s, -72 * s); g.lineTo(k * 20 * s, -54 * s); g.closePath(); g.fill(); });
      const bl = (t % 3.4) < 0.13 ? 0.15 : 1;
      [-1, 1].forEach(k => { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(k * 10 * s, -48 * s, 9 * s, 0, 7); g.fill(); g.strokeStyle = '#5C3A1C'; g.lineWidth = 1.6 * s; g.stroke();
        g.fillStyle = '#26324A'; g.beginPath(); g.ellipse(k * 10 * s + look * 3 * s, -48 * s, 4.4 * s, 4.4 * s * bl, 0, 0, 7); g.fill(); });
      g.fillStyle = '#FFB13B'; g.beginPath(); g.moveTo(-4 * s, -40 * s); g.lineTo(4 * s, -40 * s); g.lineTo(0, -33 * s); g.closePath(); g.fill();
      g.fillStyle = '#3D7DD8'; g.beginPath(); g.moveTo(-18 * s, -64 * s); g.lineTo(18 * s, -64 * s); g.lineTo(0, -71 * s); g.closePath(); g.fill(); g.fillRect(-11 * s, -66 * s, 22 * s, 4 * s);   // a little school cap
      g.restore();
    }
    function card(g, x, y, s, open, t){   // 📖 the word card flips up: a drawn star + lines (no words)
      const w = 64 * s, h = 80 * s; g.save(); g.translate(x, y); g.scale(Math.max(0.02, open), 1);
      g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.roundRect(-w / 2 + 3 * s, -h / 2 + 4 * s, w, h, 9 * s); g.fill();
      g.fillStyle = '#FFFFFF'; g.strokeStyle = '#3D7DD8'; g.lineWidth = 3 * s; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 9 * s); g.fill(); g.stroke();
      g.fillStyle = '#3D7DD8'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, 12 * s, [9 * s, 9 * s, 0, 0]); g.fill();
      g.save(); g.translate(0, -8 * s); g.rotate(Math.sin(t * 3) * 0.12); g.fillStyle = '#FFD23F'; g.strokeStyle = '#E09E00'; g.lineWidth = 1.6 * s; g.beginPath();
      for(let i = 0; i < 10; i++){ const a = i * Math.PI / 5 - Math.PI / 2, r = (i % 2 ? 7 : 16) * s; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); g.restore();
      g.fillStyle = 'rgba(31,42,68,.25)'; [0, 1].forEach(k => { g.beginPath(); g.roundRect(-w * 0.34, 18 * s + k * 9 * s, w * (k ? 0.48 : 0.68), 4 * s, 2 * s); g.fill(); });
      g.restore();
    }
    add('word-board', {
      still(g, W, H){
        const G = geo(W, H), {hy, B} = G, sc = Math.min(W, H) / 420;
        let gr = g.createLinearGradient(0, 0, W, hy); gr.addColorStop(0, T.wall1); gr.addColorStop(1, T.wall2); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 2);
        // bookshelves along the right of the wall (the top-left stays calm for the title)
        const shx = W * (G.wide ? 0.56 : 0.5), shw = W - shx - W * 0.04, rows = 3, rh = hy * 0.26, sy = hy * 0.14, BK = ['#E5484D', '#3D7DD8', '#FFB13B', '#4CB963', '#7A5CFA', '#2EC4B6', '#F7B2BE', '#9C6436'];
        g.fillStyle = '#8A5426'; g.fillRect(shx - 6 * sc, sy - 6 * sc, shw + 12 * sc, rh * rows + 12 * sc);
        for(let r = 0; r < rows; r++){ const y0 = sy + r * rh; g.fillStyle = '#5E3818'; g.fillRect(shx, y0, shw, rh - 5 * sc); let x = shx + 3 * sc, k = r * 3;
          while(x < shx + shw - 8 * sc){ const bw = (7 + ((k * 7) % 5) * 2) * sc, bh = rh * (0.62 + ((k * 13) % 4) * 0.08), tilt = (k % 9 === 4) ? 0.18 : 0;
            if(x + bw > shx + shw - 3 * sc) break; g.save(); g.translate(x, y0 + rh - 5 * sc); g.rotate(tilt); g.fillStyle = BK[k % BK.length]; g.fillRect(0, -bh, bw, bh); g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(bw * 0.2, -bh * 0.8, bw * 0.6, 2 * sc); g.fillRect(bw * 0.2, -bh * 0.3, bw * 0.6, 2 * sc); g.restore(); x += bw + (tilt ? 5 : 1.5) * sc; k++; }
          g.fillStyle = '#A8693A'; g.fillRect(shx - 6 * sc, y0 + rh - 5 * sc, shw + 12 * sc, 5 * sc); }
        // a round window with a night sky + moon (between the title corner and the shelves)
        { const r = Math.min(hy * 0.24, W * 0.08), wx = shx - r * 1.5, wy = hy * 0.55; if(wx - r > W * 0.36){
          g.fillStyle = '#20306A'; g.beginPath(); g.arc(wx, wy, r, 0, 7); g.fill(); g.fillStyle = '#FFF2B0'; g.beginPath(); g.arc(wx + r * 0.3, wy - r * 0.25, r * 0.28, 0, 7); g.fill();
          g.fillStyle = '#20306A'; g.beginPath(); g.arc(wx + r * 0.42, wy - r * 0.34, r * 0.24, 0, 7); g.fill(); [[-0.5, -0.3], [-0.2, 0.4], [0.4, 0.45], [-0.55, 0.25]].forEach(([a, b]) => sparkle(g, wx + a * r, wy + b * r, r * 0.09, 1));
          g.strokeStyle = '#FFFFFF'; g.lineWidth = 5 * sc; g.beginPath(); g.arc(wx, wy, r, 0, 7); g.stroke(); g.beginPath(); g.moveTo(wx - r, wy); g.lineTo(wx + r, wy); g.moveTo(wx, wy - r); g.lineTo(wx, wy + r); g.stroke(); } }
        // the desk
        gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, '#8E5A30'); gr.addColorStop(1, '#C88B55'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
        g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, hy, W, 4 * sc);
        g.strokeStyle = 'rgba(70,35,10,.18)'; g.lineWidth = 1.5; for(let k = 1; k < 7; k++){ const y = hy + (H - hy) * Math.pow(k / 7, 1.4); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        // a stack of books + a pencil at the desk's right edge
        { const p = B(1.12, 0.3), s = G.fw / 520; if(p.x + 40 * s < W - 4){ [['#4CB963', 0], ['#E5484D', 1], ['#FFB13B', 2]].forEach(([c, k]) => { g.fillStyle = c; g.beginPath(); g.roundRect(p.x - 34 * s + k * 3 * s, p.y - (k + 1) * 11 * s, 68 * s, 11 * s, 3 * s); g.fill(); g.fillStyle = '#FFFDF5'; g.fillRect(p.x + 26 * s + k * 3 * s, p.y - (k + 1) * 11 * s + 2 * s, 5 * s, 7 * s); }); } }
        // the board
        const c0 = B(-0.05, -0.05), c1 = B(1.05, -0.05), c2 = B(1.05, 1.06), c3 = B(-0.05, 1.06), th = G.dep * 0.05;
        poly(g, [[c0.x + 6 * sc, c0.y + 8 * sc], [c1.x + 6 * sc, c1.y + 8 * sc], [c2.x + 6 * sc, c2.y + th + 8 * sc], [c3.x + 6 * sc, c3.y + th + 8 * sc]], 'rgba(40,20,5,.3)');
        poly(g, [[c3.x, c3.y], [c2.x, c2.y], [c2.x, c2.y + th], [c3.x, c3.y + th]], shade(T.board, -0.35));
        poly(g, [[c0.x, c0.y], [c1.x, c1.y], [c2.x, c2.y], [c3.x, c3.y]], T.board, shade(T.board, -0.4), 1.5);
        for(let j = 0; j < N; j++) for(let i = 0; i < N; i++){ const q = quad(B, i, j, 0.05), k = BONUS[i + ',' + j]; poly(g, q.map(p => [p.x, p.y]), k ? T[k] : T.cell); }
        { const q = quad(B, 4, 4, 0.05); poly(g, q.map(p => [p.x, p.y]), '#FFD86B'); }
        SET.forEach(([i, j, ch]) => tileAt(g, B, i, j, ch, 0));
        const R = rackGeo(B, G.dep);
        g.fillStyle = '#6E4220'; g.beginPath(); g.roundRect(R.x(0) - R.w * 0.75, R.y + R.w * 0.42, R.w * 6.4, R.w * 0.4, R.w * 0.15); g.fill();
        RACK.forEach((ch, k) => { if(k) upTile(g, R.x(k), R.y, R.w, ch, 0); });
      },
      live(g, W, H, t){
        const G = geo(W, H), {B} = G, c = t % CYC, R = rackGeo(B, G.dep), dst = quad(B, 6, 4, 0.07);
        const tx = (dst[0].x + dst[2].x) / 2, ty = (dst[0].y + dst[2].y) / 2, fly = clamp((c - 0.5) / 0.75, 0, 1), landed = c >= 1.25 && c < CYC - 0.5;
        const glow = c > 1.3 && c < 3.9 ? Math.sin(clamp((c - 1.3) / 2.6, 0, 1) * Math.PI) : 0;
        const op = owlAt(W, H, G), look = c < 0.5 ? 0.6 : c < 1.25 ? lerp(0.6, clamp((tx - op.x) / 80, -1, 1), fly) : clamp((tx - op.x) / 80, -1, 1);
        owl(g, op.x, op.y, op.s, t, look, c > 1.3 && c < 2.2);
        if(glow > 0) [[3, 4, 'S'], [4, 4, 'T'], [5, 4, 'A']].forEach(([i, j, ch]) => tileAt(g, B, i, j, ch, glow));
        if(landed || c >= CYC - 0.5){ g.globalAlpha = c >= CYC - 0.5 ? 1 - (c - (CYC - 0.5)) / 0.5 : 1; tileAt(g, B, 6, 4, 'R', glow); g.globalAlpha = 1; }
        else if(fly > 0){ const e = fly * fly * (3 - 2 * fly), cw = dst[1].x - dst[0].x, x = lerp(R.x(0), tx, e), y = lerp(R.y, ty, e) - Math.sin(fly * Math.PI) * G.dep * 0.35;
          upTile(g, x, y, lerp(R.w, cw * 1.05, e), 'R', Math.sin(fly * Math.PI * 2) * 0.25); }
        else upTile(g, R.x(0), R.y - Math.max(0, Math.sin((c - 0.1) / 0.4 * Math.PI)) * R.w * 0.25, R.w, 'R', 0);
        if(c > 1.25 && c < 1.9){ const q = (c - 1.25) / 0.65; for(let i = 0; i < 6; i++){ const a = i * 1.05 + 0.4; sparkle(g, tx + Math.cos(a) * (10 + q * 26), ty + Math.sin(a) * (6 + q * 14), 4 * (1 - q) + 1.5, 1 - q); } }
        // 📖 the word card flips up beside the word, then folds away
        { const open = c < 1.6 ? 0 : c < 2.0 ? (c - 1.6) / 0.4 : c < 3.6 ? 1 : c < 3.95 ? 1 - (c - 3.6) / 0.35 : 0;
          if(open > 0){ const p = B(7.6 / N, 2.6 / N), s = G.fw / 520 * (0.9 + 0.08 * open); card(g, Math.min(p.x, W - 40 * s), p.y - 6 * s * open, s, open, t); } }
      },
      _s(W, H){ const wide = W > H * 1.05, k = clamp(Math.min(H, W * 1.15) / 520, 0.42, 1.0), fy = H - 36 * k - 4, X = f => clamp(W * f, 64 * k, W - 64 * k), W3 = wide ? [0.5, 0.2, 0.8] : [0.5, 0.17, 0.83];
        return [{x: X(W3[0]), y: fy, k}, {x: X(W3[1]), y: fy - 3 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: fy - 3 * k, k: k * 0.95, from: 1, dir: -1}]; },
      spots(W, H){ const z0 = Z; Z = null; try { return this._s(W, H); } finally { Z = z0; } },   /* champions stand where the plain art puts them (the logo zone is built from them) */
    });
  })();
  // 🎬 COVER word-board END
  K.loaded('word-board', 'b6a');
})(window.GameCovers && window.GameCovers._K);
