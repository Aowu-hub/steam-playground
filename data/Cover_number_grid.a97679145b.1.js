
/* 🎬 Cover_number_grid — 📏 b6a: the "number-grid" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER number-grid START — 🔢 Digitinct: a sunny puzzle room — a round window with sky and a kite, a wooden 4 × 4 picture grid lying on the table
  //    (thick lines round the four 2 × 2 boxes, the 🔒 clue squares darker with a frame and a corner notch, like in the game). Live: the empty square
  //    glows, the green token hops from the tray into it and clicks in, the whole row does its happy wave with sparkles; the rival 0 "Zippo" standing
  //    beside the board follows the token with its eyes and wobbles when the row is done. 🏆 champions stand in front of the table. (🧱 b3w6c, 2026-11-17)
  (function(){
    const N = 4, CYC = 5.4;
    const SOL = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];   // every row, column and 2 × 2 box has each token once
    const CLUE = {'0,0': 1, '0,3': 1, '1,1': 1, '1,2': 1, '2,0': 1, '2,3': 1, '3,1': 1, '3,3': 1};   // 'row,col' = a locked clue square
    const HR = 2, HC = 2;   // the empty square (row 2, col 2): the green token flies in → row 2 waves
    const COL = ['#FF5A5F', '#FFC21A', '#3DA5FF', '#2FBF71'];
    const T = {wall1: '#BFE3FF', wall2: '#E8D9FF', board: '#9A6436', cell: '#FFF7E6', clue: '#E2CDA6', line: '#5B3A1E'};
    const geo = (W, H) => {
      const wide = W > H * 1.05, hy = H * 0.4;
      let fw = wide ? Math.min(W * 0.46, H * 0.92) : W * 0.8, cx = W / 2, bot = H * (wide ? 0.72 : 0.68), dep = Math.min(fw * 0.6, bot - hy - H * 0.03), top = bot - dep;
      if(Z){ const m = Math.max(8, Math.min(W, H) * 0.025), t2 = Z.y + Z.h + m, over = !(Z.x + Z.w + m <= cx - fw / 2 || Z.x - m >= cx + fw / 2);   /* 🏷️ the board stays centred and starts under the logo */
        if(over && t2 > top){ const room = bot - t2, room2 = (H - Math.max(6, H * 0.02) - t2) / 1.3;   /* 1.3 = the board + the tray in front of it */
          if(room >= dep * 0.5){ const k = Math.min(1, room / dep); fw *= k; dep *= k; top = t2; bot = top + dep; }
          else if(room2 >= dep * 0.45){ const k = Math.min(1, room2 / dep); fw *= k; dep *= k; top = t2; bot = top + dep; }
          else { const F = away(cx - fw / 2, top, fw, dep, W, H, {only: 'x', min: 0.6}); fw *= F.s; dep *= F.s; cx = F.x + fw / 2; bot = top + dep; } } }
      const B = (u, v) => { const s = lerp(0.8, 1, v); return {x: cx + (u - 0.5) * fw * s, y: lerp(top, bot, v), s}; };
      return {wide, hy, B, fw, dep, top, bot, cx};
    };
    const quad = (B, c, r, a) => [B((c + a) / N, (r + a) / N), B((c + 1 - a) / N, (r + a) / N), B((c + 1 - a) / N, (r + 1 - a) / N), B((c + a) / N, (r + 1 - a) / N)];
    const mid = q => ({x: (q[0].x + q[2].x) / 2, y: (q[0].y + q[2].y) / 2, w: q[1].x - q[0].x, h: q[3].y - q[0].y});
    function tok(g, k, x, y, r, sq, glow){   // a picture token: 🔴 round · ⭐ star · 🔷 drop · 🟩 rounded square (shape AND colour differ)
      const c = COL[k]; g.save(); g.translate(x, y); g.scale(1, sq || 1);
      if(glow){ g.shadowColor = 'rgba(255,255,170,' + (0.9 * glow) + ')'; g.shadowBlur = r * 1.1; }
      g.fillStyle = c; g.strokeStyle = shade(c, -0.35); g.lineWidth = Math.max(1, r * 0.12); g.beginPath();
      if(k === 0) g.arc(0, 0, r * 0.82, 0, 7);
      else if(k === 1){ for(let i = 0; i < 10; i++){ const a = i * Math.PI / 5 - Math.PI / 2, q = i % 2 ? 0.45 : 0.98; g.lineTo(Math.cos(a) * r * q, Math.sin(a) * r * q); } g.closePath(); }
      else if(k === 2){ g.moveTo(0, -r * 0.95); g.bezierCurveTo(r * 0.55, -r * 0.3, r * 0.85, r * 0.15, r * 0.7, r * 0.5); g.arc(0, r * 0.25, r * 0.72, 0.35, Math.PI - 0.35); g.bezierCurveTo(-r * 0.85, r * 0.15, -r * 0.55, -r * 0.3, 0, -r * 0.95); }
      else g.roundRect(-r * 0.74, -r * 0.74, r * 1.48, r * 1.48, r * 0.3);
      g.fill(); g.shadowBlur = 0; g.stroke();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-r * 0.28, -r * 0.3, r * 0.22, r * 0.12, -0.6, 0, 7); g.fill();
      g.restore();
    }
    const trayGeo = (B, dep) => { const a = B(0.12, 1.16), b = B(0.88, 1.16), w = Math.min((b.x - a.x) / 4.6, dep * 0.24); return {y: a.y + w * 0.4, w, x: k => (a.x + b.x) / 2 + (k - 1.5) * w * 1.15}; };
    const zipAt = (W, H, G) => { const p = G.B(1.12, 0.62), s = G.fw / 520; return {x: Math.min(p.x, W - 30 * s - 4), y: p.y, s}; };   /* the rival stands on the table beside the board */
    function zippo(g, x, y, s, t, look, mood){   // 0️⃣ Zippo: a round orange zero on two little feet
      g.save(); g.translate(x, y + (mood === 'oh' ? Math.sin(t * 22) * 1.5 * s : Math.sin(t * 2.4) * 2 * s));
      if(mood === 'oh') g.rotate(Math.sin(t * 18) * 0.12);
      g.fillStyle = 'rgba(60,30,10,.22)'; g.beginPath(); g.ellipse(0, 2 * s, 24 * s, 6 * s, 0, 0, 7); g.fill();
      g.strokeStyle = '#7A3A10'; g.lineWidth = 5 * s; g.lineCap = 'round'; [-1, 1].forEach(k => { g.beginPath(); g.moveTo(k * 9 * s, -10 * s); g.lineTo(k * 11 * s, 0); g.stroke(); });
      g.fillStyle = '#FF8A2A'; g.strokeStyle = '#B4520F'; g.lineWidth = 2.5 * s; g.beginPath(); g.ellipse(0, -40 * s, 24 * s, 32 * s, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#FFE2BF'; g.beginPath(); g.ellipse(0, -36 * s, 10 * s, 16 * s, 0, 0, 7); g.fill();
      const arm = mood === 'oh' ? -2.4 + Math.sin(t * 16) * 0.3 : -0.4 + Math.sin(t * 1.8) * 0.15;
      [-1, 1].forEach(k => { g.save(); g.translate(k * 22 * s, -40 * s); g.rotate(k * arm); g.strokeStyle = '#B4520F'; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 14 * s); g.stroke(); g.restore(); });
      const bl = (t % 3.3) < 0.12 ? 0.2 : 1; g.fillStyle = '#2A1606';
      [-1, 1].forEach(k => { g.beginPath(); g.ellipse(k * 9 * s + look * 3 * s, -60 * s, 3.6 * s, 3.6 * s * bl, 0, 0, 7); g.fill(); });
      g.strokeStyle = '#2A1606'; g.lineWidth = 2 * s; g.beginPath(); if(mood === 'oh') g.arc(0, -15 * s, 4 * s, 0, 7); else g.arc(0, -19 * s, 5 * s, 0.25, Math.PI - 0.25); g.stroke();
      g.restore();
    }
    add('number-grid', {
      still(g, W, H){
        const G = geo(W, H), {hy, B} = G, sc = Math.min(W, H) / 420;
        let gr = g.createLinearGradient(0, 0, W, hy); gr.addColorStop(0, T.wall1); gr.addColorStop(1, T.wall2); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 2);
        g.fillStyle = 'rgba(255,255,255,.12)'; for(let x = 0, i = 0; x < W; x += 30 * sc, i++) if(i % 2) g.fillRect(x, 0, 30 * sc, hy);
        // the round window (right side — the top-left stays calm for the title): sky, sun, clouds, a kite on its string
        const ww = Math.min(W * (G.wide ? 0.2 : 0.3), hy * 0.78), wx = W - ww - W * 0.06, wy = hy * 0.16, wh = Math.min(hy * 0.74, ww * 1.15);
        g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(wx - 7 * sc, wy - 7 * sc, ww + 14 * sc, wh + 14 * sc, [ww / 2 + 7 * sc, ww / 2 + 7 * sc, 8 * sc, 8 * sc]); g.fill();
        g.save(); g.beginPath(); g.roundRect(wx, wy, ww, wh, [ww / 2, ww / 2, 4 * sc, 4 * sc]); g.clip();
        gr = g.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, '#5DB8FF'); gr.addColorStop(1, '#CDEBFF'); g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
        g.fillStyle = '#FFE36B'; g.beginPath(); g.arc(wx + ww * 0.25, wy + wh * 0.3, ww * 0.1, 0, 7); g.fill();
        cloud(g, wx + ww * 0.45, wy + wh * 0.62, ww / 200, 0.9);
        g.fillStyle = '#9ED36A'; g.beginPath(); g.ellipse(wx + ww * 0.5, wy + wh * 1.02, ww * 0.8, wh * 0.18, 0, 0, 7); g.fill();
        g.restore();
        g.strokeStyle = '#FFFFFF'; g.lineWidth = 4 * sc; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh * 0.55); g.lineTo(wx + ww, wy + wh * 0.55); g.stroke();
        // a little shelf of numbered blocks on the left wall, low (under the title spot)
        const shy = hy * 0.86, shx = W * 0.05, bw = Math.min(26 * sc, W * 0.05);
        g.fillStyle = '#B97B46'; g.fillRect(shx - 6 * sc, shy, bw * 5.2, 5 * sc);
        [0, 3, 1, 2].forEach((k, i) => { g.fillStyle = COL[k]; g.beginPath(); g.roundRect(shx + i * bw * 1.2, shy - bw, bw, bw, 4 * sc); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(shx + i * bw * 1.2 + 3 * sc, shy - bw + 3 * sc, bw * 0.3, bw * 0.3); });
        // the table
        gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, '#B97A44'); gr.addColorStop(1, '#E6AE74'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
        g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(0, hy, W, 4 * sc);
        g.strokeStyle = 'rgba(110,60,20,.15)'; g.lineWidth = 1.5; for(let k = 1; k < 7; k++){ const y = hy + (H - hy) * Math.pow(k / 7, 1.4); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        // the board: shadow, thick wooden frame, squares (🔒 clues darker + frame + notch), box lines, the tokens already in
        const c0 = B(-0.06, -0.06), c1 = B(1.06, -0.06), c2 = B(1.06, 1.07), c3 = B(-0.06, 1.07), th = G.dep * 0.06;
        poly(g, [[c0.x + 6 * sc, c0.y + 8 * sc], [c1.x + 6 * sc, c1.y + 8 * sc], [c2.x + 6 * sc, c2.y + th + 8 * sc], [c3.x + 6 * sc, c3.y + th + 8 * sc]], 'rgba(60,30,10,.28)');
        poly(g, [[c3.x, c3.y], [c2.x, c2.y], [c2.x, c2.y + th], [c3.x, c3.y + th]], shade(T.board, -0.35));
        poly(g, [[c0.x, c0.y], [c1.x, c1.y], [c2.x, c2.y], [c3.x, c3.y]], T.board, shade(T.board, -0.4), 1.5);
        for(let r = 0; r < N; r++) for(let c = 0; c < N; c++){
          const q = quad(B, c, r, 0.04), cl = CLUE[r + ',' + c], m = mid(q);
          poly(g, q.map(p => [p.x, p.y]), cl ? T.clue : T.cell, cl ? shade(T.clue, -0.3) : null, cl ? Math.max(1.2, m.w * 0.04) : 0);
          if(cl){ poly(g, [[q[0].x, q[0].y], [q[0].x + m.w * 0.22, q[0].y], [q[0].x, q[0].y + m.h * 0.22]], shade(T.clue, -0.32)); }   /* 🔒 the corner notch */
          if(!(r === HR && c === HC)) tok(g, SOL[r][c], m.x, m.y, m.w * 0.32, m.h / m.w);
        }
        g.strokeStyle = T.line; g.lineCap = 'round';
        [0.5].forEach(f => { const a = B(f, 0), b = B(f, 1), d = B(0, f), e = B(1, f); g.lineWidth = Math.max(3, G.fw * 0.012); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.moveTo(d.x, d.y); g.lineTo(e.x, e.y); g.stroke(); });
        // the tray in front of the board (the green token is drawn live)
        const R = trayGeo(B, G.dep);
        g.fillStyle = '#8A5426'; g.beginPath(); g.roundRect(R.x(0) - R.w * 0.7, R.y - R.w * 0.55, R.w * 4.85, R.w * 1.1, R.w * 0.3); g.fill();
        g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(R.x(0) - R.w * 0.6, R.y - R.w * 0.5, R.w * 4.65, R.w * 0.12);
        [0, 1, 2].forEach(k => tok(g, k, R.x(k), R.y, R.w * 0.36, 0.8));
      },
      live(g, W, H, t){
        const G = geo(W, H), {B} = G, c = t % CYC, R = trayGeo(B, G.dep), q = quad(B, HC, HR, 0.04), m = mid(q);
        const fly = clamp((c - 0.6) / 0.75, 0, 1), landed = c >= 1.35 && c < CYC - 0.5, wave = c > 1.45 && c < 3.3;
        const zp = zipAt(W, H, G), look = c < 0.6 ? -0.6 : c < 1.35 ? lerp(-0.6, clamp((m.x - zp.x) / 80, -1, 1), fly) : clamp((m.x - zp.x) / 80, -1, 1);
        zippo(g, zp.x, zp.y, zp.s, t, look, wave ? 'oh' : '');
        // the empty square glows (the next move glows — like 🌱 Basic)
        if(c < 1.35 || c >= CYC - 0.5){ const pulse = 0.45 + 0.35 * Math.sin(t * 5); g.save(); g.shadowColor = 'rgba(255,230,90,' + pulse + ')'; g.shadowBlur = m.w * 0.35; poly(g, q.map(p => [p.x, p.y]), null, 'rgba(255,200,40,' + (0.5 + pulse * 0.5) + ')', Math.max(2, m.w * 0.06)); g.restore(); }
        // row 2's happy wave: each token hops in turn, the squares flash
        for(let col = 0; col < N; col++){
          if(col === HC && !landed && !(c >= CYC - 0.5)) continue;
          const qq = quad(B, col, HR, 0.04), mm = mid(qq), d = wave ? clamp((c - 1.45 - col * 0.14) / 0.42, 0, 1) : 0, hop = Math.sin(d * Math.PI), fl = wave ? Math.max(0, 1 - Math.abs(c - 1.7 - col * 0.14) * 2.5) : 0;
          if(col !== HC && !wave) continue;
          if(fl > 0){ g.save(); g.globalAlpha = fl * 0.55; poly(g, qq.map(p => [p.x, p.y]), '#FFF2A8'); g.restore(); }
          if(col !== HC || landed || c >= CYC - 0.5){ const fade = col === HC && c >= CYC - 0.5 ? 1 - (c - (CYC - 0.5)) / 0.5 : 1; g.save(); g.globalAlpha = fade;
            if(col !== HC){ g.fillStyle = CLUE[HR + ',' + col] ? T.clue : T.cell; poly(g, quad(B, col, HR, 0.1).map(p => [p.x, p.y]), CLUE[HR + ',' + col] ? T.clue : T.cell); }
            tok(g, SOL[HR][col], mm.x, mm.y - hop * mm.h * 0.55, mm.w * 0.32 * (1 + hop * 0.12), mm.h / mm.w, hop); g.restore(); }
          if(d > 0.3 && d < 0.8) for(let i = 0; i < 3; i++) sparkle(g, mm.x + (i - 1) * mm.w * 0.35, mm.y - mm.h * (0.7 + hop * 0.4), Math.max(2, mm.w * 0.08), 1 - Math.abs(d - 0.55) * 3);
        }
        // the green token: wiggles in the tray → hops in an arc → clicks into the square
        if(fly > 0 && !landed && c < CYC - 0.5){ const e = fly * fly * (3 - 2 * fly), x = lerp(R.x(3), m.x, e), y = lerp(R.y, m.y, e) - Math.sin(fly * Math.PI) * G.dep * 0.45;
          tok(g, SOL[HR][HC], x, y, lerp(R.w * 0.36, m.w * 0.32, e), lerp(0.8, m.h / m.w, e)); }
        else if(c < 0.6 || c >= CYC - 0.5) tok(g, SOL[HR][HC], R.x(3) + (c < 0.6 ? Math.sin(t * 26) * R.w * 0.04 : 0), R.y - Math.max(0, Math.sin(c / 0.6 * Math.PI)) * R.w * 0.2, R.w * 0.36, 0.8);
        if(c > 1.35 && c < 1.95){ const k = (c - 1.35) / 0.6; for(let i = 0; i < 6; i++){ const a = i * 1.05 + 0.3; sparkle(g, m.x + Math.cos(a) * m.w * (0.25 + k * 0.6), m.y + Math.sin(a) * m.h * (0.25 + k * 0.6), Math.max(2, m.w * 0.09) * (1 - k) + 1, 1 - k); } }
      },
      _s(W, H){ const wide = W > H * 1.05, k = clamp(Math.min(H, W * 1.15) / 520, 0.42, 1.0), fy = H - 36 * k - 4, X = f => clamp(W * f, 64 * k, W - 64 * k), W3 = wide ? [0.5, 0.2, 0.8] : [0.5, 0.17, 0.83];
        return [{x: X(W3[0]), y: fy, k}, {x: X(W3[1]), y: fy - 3 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: fy - 3 * k, k: k * 0.95, from: 1, dir: -1}]; },
      spots(W, H){ const z0 = Z; Z = null; try { return this._s(W, H); } finally { Z = z0; } },   /* champions stand where the plain art puts them (the logo zone is built from them) */
    });
  })();
  // 🎬 COVER number-grid END
  K.loaded('number-grid', 'b6a');
})(window.GameCovers && window.GameCovers._K);
