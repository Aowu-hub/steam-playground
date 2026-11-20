
/* 🎬 Cover_number_board — 📏 b6a: the "number-board" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER number-board START — ➗ Algebros: a warm maths room — a chalkboard with chalk signs on the wall, a crossword board of number sentences on the
  //    table (3 + 4 = ? across, 8 − 4 = 4 down, crossing on the ⭐). Live: the 7 tile hops from the rack into its square and clicks in, the sentence glows,
  //    the rival 🤖 robot standing beside the board blinks, follows the tile with its eyes and cheers when it lands. 🏆 champions stand in front of the table. (🧱 b3w6b, 2026-11-17)
  (function(){
    const N = 9, CYC = 5.2;
    const T = {wall1: '#FFB77A', wall2: '#9E7CF5', board: '#B9874E', cell: '#EBD3A8', tile: '#FFF3D6', ink: '#4A2E12', p2t: '#9AD3F2', p3t: '#3D7DD8', p2e: '#F7B2BE', p3e: '#E5484D'};
    const BONUS = {'0,0': 'p3e', '8,0': 'p3e', '0,8': 'p3e', '8,8': 'p3e', '1,1': 'p2e', '7,1': 'p2e', '1,7': 'p2e', '7,7': 'p2e', '2,6': 'p2t', '6,2': 'p2t', '0,4': 'p3t', '8,4': 'p3t', '4,0': 'p3t', '4,8': 'p3t', '3,7': 'p2t', '5,1': 'p2t'};
    const SET = [[2, 4, '3'], [3, 4, '+'], [4, 4, '4'], [5, 4, '='], [4, 2, '8'], [4, 3, '−'], [4, 5, '='], [4, 6, '4']];   // on the board; the 7 flies to (6, 4)
    const RACK = ['7', '2', '×', '9', '5'];
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
      poly(g, [[q[3].x, q[3].y], [q[2].x, q[2].y], [q[2].x, q[2].y + th], [q[3].x, q[3].y + th]], shade(T.tile, -0.32));
      if(glow){ g.save(); g.shadowColor = 'rgba(120,255,160,' + (0.85 * glow) + ')'; g.shadowBlur = 14; }
      poly(g, q.map(p => [p.x, p.y]), glow ? mix(T.tile, '#B8FFC9', glow * 0.6) : T.tile, shade(T.tile, -0.4), 1.2);
      if(glow) g.restore();
      const cx = (q[0].x + q[2].x) / 2, cy = (q[0].y + q[2].y) / 2, cw = q[1].x - q[0].x, ch2 = q[3].y - q[0].y;
      g.save(); g.translate(cx, cy); g.scale(1, Math.min(1, ch2 / cw * 1.35)); g.fillStyle = T.ink; g.font = FONT(cw * 0.66); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, cw * 0.03); g.restore();
    }
    function upTile(g, x, y, w, ch, rot){   // a tile standing up (the rack / the flying one), centre x, y
      g.save(); g.translate(x, y); if(rot) g.rotate(rot);
      g.fillStyle = shade(T.tile, -0.32); g.beginPath(); g.roundRect(-w / 2, -w / 2 + w * 0.12, w, w, w * 0.16); g.fill();
      g.fillStyle = T.tile; g.strokeStyle = shade(T.tile, -0.4); g.lineWidth = Math.max(1, w * 0.04); g.beginPath(); g.roundRect(-w / 2, -w / 2, w, w, w * 0.16); g.fill(); g.stroke();
      g.fillStyle = T.ink; g.font = FONT(w * 0.68); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, w * 0.04); g.restore();
    }
    const rackGeo = (B, dep) => { const a = B(0.22, 1.13), b = B(0.78, 1.13), w = Math.min((b.x - a.x) / 5.6, dep * 0.2); return {y: a.y + w * 0.5, w, x: k => (a.x + b.x) / 2 + (k - 2) * w * 1.08}; };
    const botAt = (W, H, G) => { const p = G.B(1.1, 0.46), s = G.fw / 560; return {x: Math.min(p.x, W - 30 * s - 4), y: p.y, s}; };   /* the rival stands on the table beside the board */
    function robot(g, x, y, s, t, look, cheer){
      g.save(); g.translate(x, y + Math.sin(t * 2.2) * 2 * s);
      const arm = cheer ? -2.3 - Math.sin(t * 14) * 0.25 : -0.5 + Math.sin(t * 1.7) * 0.15;
      [-1, 1].forEach(k => { g.save(); g.translate(k * 22 * s, -30 * s); g.rotate(k * arm); g.strokeStyle = '#5A6378'; g.lineWidth = 5 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 20 * s); g.stroke();
        g.fillStyle = '#E07A3F'; g.beginPath(); g.arc(0, 22 * s, 5 * s, 0, 7); g.fill(); g.restore(); });
      g.fillStyle = '#DCE3EE'; g.strokeStyle = '#3B4A66'; g.lineWidth = 2.2 * s; g.beginPath(); g.roundRect(-20 * s, -44 * s, 40 * s, 44 * s, 9 * s); g.fill(); g.stroke();
      g.fillStyle = '#7A5CFA'; g.beginPath(); g.roundRect(-11 * s, -22 * s, 22 * s, 10 * s, 4 * s); g.fill();
      g.fillStyle = '#E9EEF6'; g.beginPath(); g.roundRect(-24 * s, -82 * s, 48 * s, 36 * s, 11 * s); g.fill(); g.stroke();
      g.fillStyle = '#26324A'; g.beginPath(); g.roundRect(-19 * s, -76 * s, 38 * s, 22 * s, 7 * s); g.fill();
      const bl = (t % 3.1) < 0.12 ? 0.2 : 1; g.fillStyle = cheer ? '#FFE36B' : '#7FF2FF';
      [-1, 1].forEach(k => { g.beginPath(); g.ellipse(k * 8 * s + look * 3 * s, -65 * s, 4.2 * s, 4.2 * s * bl, 0, 0, 7); g.fill(); });
      if(cheer){ g.strokeStyle = '#FFE36B'; g.lineWidth = 2 * s; g.beginPath(); g.arc(0, -60 * s, 6 * s, 0.2, Math.PI - 0.2); g.stroke(); }
      g.strokeStyle = '#3B4A66'; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(0, -82 * s); g.lineTo(0, -92 * s); g.stroke();
      g.fillStyle = cheer && Math.sin(t * 20) > 0 ? '#FFE36B' : '#FF5C7A'; g.beginPath(); g.arc(0, -95 * s, 4 * s, 0, 7); g.fill();
      g.restore();
    }
    function chalk(g, x, y, s, kind){
      g.save(); g.strokeStyle = 'rgba(255,255,255,.82)'; g.lineWidth = 3 * s; g.lineCap = 'round'; g.beginPath();
      if(kind === '+'){ g.moveTo(x - 9 * s, y); g.lineTo(x + 9 * s, y); g.moveTo(x, y - 9 * s); g.lineTo(x, y + 9 * s); }
      if(kind === '-'){ g.moveTo(x - 9 * s, y); g.lineTo(x + 9 * s, y); }
      if(kind === 'x'){ g.moveTo(x - 7 * s, y - 7 * s); g.lineTo(x + 7 * s, y + 7 * s); g.moveTo(x + 7 * s, y - 7 * s); g.lineTo(x - 7 * s, y + 7 * s); }
      if(kind === '='){ g.moveTo(x - 9 * s, y - 4 * s); g.lineTo(x + 9 * s, y - 4 * s); g.moveTo(x - 9 * s, y + 4 * s); g.lineTo(x + 9 * s, y + 4 * s); }
      if(kind === '/'){ g.moveTo(x - 9 * s, y); g.lineTo(x + 9 * s, y); g.stroke(); g.fillStyle = 'rgba(255,255,255,.82)'; g.beginPath(); g.arc(x, y - 6 * s, 2 * s, 0, 7); g.arc(x, y + 6 * s, 2 * s, 0, 7); g.fill(); g.beginPath(); }
      if(kind === 'tri'){ g.moveTo(x - 14 * s, y + 10 * s); g.lineTo(x + 14 * s, y + 10 * s); g.lineTo(x - 6 * s, y - 12 * s); g.closePath(); }
      g.stroke(); g.restore();
    }
    add('number-board', {
      still(g, W, H){
        const G = geo(W, H), {hy, B} = G, sc = Math.min(W, H) / 420;
        let gr = g.createLinearGradient(0, 0, W, hy); gr.addColorStop(0, T.wall1); gr.addColorStop(1, T.wall2); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 2);
        g.fillStyle = 'rgba(255,255,255,.08)'; for(let x = 0; x < W; x += 34 * sc) g.fillRect(x, 0, 14 * sc, hy);
        // the chalkboard (right half of the wall — the top-left stays calm for the title)
        const cbw = Math.min(W * (G.wide ? 0.34 : 0.46), hy * 1.5), cbh = Math.min(hy * 0.62, cbw * 0.55), cbx = W - cbw - W * 0.05, cby = hy * 0.3;
        g.fillStyle = '#9C6436'; g.beginPath(); g.roundRect(cbx - 8 * sc, cby - 8 * sc, cbw + 16 * sc, cbh + 16 * sc, 8 * sc); g.fill();
        g.fillStyle = '#2E5E4E'; g.beginPath(); g.roundRect(cbx, cby, cbw, cbh, 5 * sc); g.fill();
        g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.ellipse(cbx + cbw * 0.4, cby + cbh * 0.5, cbw * 0.38, cbh * 0.3, -0.2, 0, 7); g.fill();
        [['+', 0.15, 0.3], ['x', 0.36, 0.62], ['=', 0.55, 0.3], ['/', 0.78, 0.66], ['tri', 0.82, 0.3], ['-', 0.2, 0.74]].forEach(([k, u, v]) => chalk(g, cbx + cbw * u, cby + cbh * v, cbh / 80, k));
        g.fillStyle = '#C98A52'; g.fillRect(cbx, cby + cbh + 8 * sc, cbw, 5 * sc); g.fillStyle = '#FFFFFF'; g.fillRect(cbx + cbw * 0.2, cby + cbh + 4 * sc, 14 * sc, 4 * sc);
        // the table
        gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, '#B7773F'); gr.addColorStop(1, '#E2A86A'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
        g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, hy, W, 4 * sc);
        g.strokeStyle = 'rgba(110,60,20,.16)'; g.lineWidth = 1.5; for(let k = 1; k < 7; k++){ const y = hy + (H - hy) * Math.pow(k / 7, 1.4); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        // the board: a shadow, a thick frame, the squares, the bonus squares, the ⭐ in the middle, the tiles already played
        const c0 = B(-0.05, -0.05), c1 = B(1.05, -0.05), c2 = B(1.05, 1.06), c3 = B(-0.05, 1.06), th = G.dep * 0.05;
        poly(g, [[c0.x + 6 * sc, c0.y + 8 * sc], [c1.x + 6 * sc, c1.y + 8 * sc], [c2.x + 6 * sc, c2.y + th + 8 * sc], [c3.x + 6 * sc, c3.y + th + 8 * sc]], 'rgba(60,30,10,.28)');
        poly(g, [[c3.x, c3.y], [c2.x, c2.y], [c2.x, c2.y + th], [c3.x, c3.y + th]], shade(T.board, -0.35));
        poly(g, [[c0.x, c0.y], [c1.x, c1.y], [c2.x, c2.y], [c3.x, c3.y]], T.board, shade(T.board, -0.4), 1.5);
        for(let j = 0; j < N; j++) for(let i = 0; i < N; i++){ const q = quad(B, i, j, 0.05), k = BONUS[i + ',' + j]; poly(g, q.map(p => [p.x, p.y]), k ? T[k] : T.cell); }
        { const q = quad(B, 4, 4, 0.05), cx = (q[0].x + q[2].x) / 2, cy = (q[0].y + q[2].y) / 2; poly(g, q.map(p => [p.x, p.y]), '#FFD86B'); }
        SET.forEach(([i, j, ch]) => tileAt(g, B, i, j, ch, 0));
        // the rack in front of the board (the 7 is drawn live)
        const R = rackGeo(B, G.dep);
        g.fillStyle = '#8A5426'; g.beginPath(); g.roundRect(R.x(0) - R.w * 0.75, R.y + R.w * 0.42, R.w * 6.4, R.w * 0.4, R.w * 0.15); g.fill();
        RACK.forEach((ch, k) => { if(k) upTile(g, R.x(k), R.y, R.w, ch, 0); });
      },
      live(g, W, H, t){
        const G = geo(W, H), {B} = G, c = t % CYC, R = rackGeo(B, G.dep), dst = quad(B, 6, 4, 0.07);
        const tx = (dst[0].x + dst[2].x) / 2, ty = (dst[0].y + dst[2].y) / 2, fly = clamp((c - 0.5) / 0.75, 0, 1), landed = c >= 1.25 && c < CYC - 0.5;
        const glow = c > 1.3 && c < 3.6 ? Math.sin(clamp((c - 1.3) / 2.3, 0, 1) * Math.PI) : 0;
        const bp = botAt(W, H, G), look = c < 0.5 ? -0.6 : c < 1.25 ? lerp(-0.6, clamp((tx - bp.x) / 80, -1, 1), fly) : clamp((tx - bp.x) / 80, -1, 1);
        // 🤖 the rival stands beside the board
        robot(g, bp.x, bp.y, bp.s, t, look, c > 1.25 && c < 2.6);
        // the sentence glows when it's right
        if(glow > 0) [[2, 4, '3'], [3, 4, '+'], [4, 4, '4'], [5, 4, '=']].forEach(([i, j, ch]) => tileAt(g, B, i, j, ch, glow));
        if(landed || (c >= CYC - 0.5)){ const fade = c >= CYC - 0.5 ? 1 - (c - (CYC - 0.5)) / 0.5 : 1; g.globalAlpha = fade; tileAt(g, B, 6, 4, '7', glow); g.globalAlpha = 1; }
        else if(fly > 0){ const e = fly * fly * (3 - 2 * fly), cw = dst[1].x - dst[0].x, x = lerp(R.x(0), tx, e), y = lerp(R.y, ty, e) - Math.sin(fly * Math.PI) * G.dep * 0.35;
          upTile(g, x, y, lerp(R.w, cw * 1.05, e), '7', Math.sin(fly * Math.PI * 2) * 0.25); }
        else upTile(g, R.x(0), R.y - Math.max(0, Math.sin((c - 0.1) / 0.4 * Math.PI)) * R.w * 0.25, R.w, '7', 0);
        if(c > 1.25 && c < 1.9){ const q = (c - 1.25) / 0.65; for(let i = 0; i < 6; i++){ const a = i * 1.05 + 0.4; sparkle(g, tx + Math.cos(a) * (10 + q * 26) * B(0.5, 0.5).s, ty + Math.sin(a) * (6 + q * 14), 4 * (1 - q) + 1.5, 1 - q); } }
        if(glow > 0.2){ const a = B(2 / N, 4.5 / N), b = B(7 / N, 4.5 / N); for(let i = 0; i < 3; i++) sparkle(g, lerp(a.x, b.x, ((t * 0.6 + i / 3) % 1)), a.y - 14 * a.s, 3.5, glow); }
      },
      _s(W, H){ const wide = W > H * 1.05, k = clamp(Math.min(H, W * 1.15) / 520, 0.42, 1.0), fy = H - 36 * k - 4, X = f => clamp(W * f, 64 * k, W - 64 * k), W3 = wide ? [0.5, 0.2, 0.8] : [0.5, 0.17, 0.83];
        return [{x: X(W3[0]), y: fy, k}, {x: X(W3[1]), y: fy - 3 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: fy - 3 * k, k: k * 0.95, from: 1, dir: -1}]; },
      spots(W, H){ const z0 = Z; Z = null; try { return this._s(W, H); } finally { Z = z0; } },   /* champions stand where the plain art puts them (the logo zone is built from them) */
    });
  })();
  // 🎬 COVER number-board END
  K.loaded('number-board', 'b6a');
})(window.GameCovers && window.GameCovers._K);
