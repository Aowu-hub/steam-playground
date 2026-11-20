
/* 🎬 Cover_alignext — 📏 b6a: the "alignext" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER alignext START — 🔴 Alignext: an upright 7 × 6 frame on a fairground stage at sunset, discs drop in and bounce; four in a row light up + confetti
  (function(){
    const RED = '#E63946', YEL = '#FFC21A', BLUE = '#2F6BD8';
    const GRID = ['.......', '.......', '.......', '....ry.', '..yryr.', 'yrryry.'];   // the pile before the drop (top → bottom)
    const geo = (W, H) => { const wide = W > H; let fw = Math.min(W * (wide ? 0.4 : 0.66), H * (wide ? 0.6 : 0.44)), fx = W / 2 - fw / 2 + (wide ? W * 0.06 : 0), fy = H * (wide ? 0.22 : 0.31);
      { const F = away(fx, fy - fw / 7 * 0.6, fw, fw / 7 * 7.15, W, H); fw *= F.s; fx = F.x; fy = F.y + fw / 7 * 0.6; }   /* 🏷️ 24j-e: frame + falling disc keep clear of the logo */
      const cell = fw / 7, fh = cell * 6, sy = fy + fh + cell * 0.55;
      return {fw, cell, fh, fx, fy, sy, at: (c, r) => ({x: fx + (c + 0.5) * cell, y: fy + (r + 0.5) * cell})}; };
    function disc(g, x, y, r, col, glow){
      if(glow){ g.save(); g.shadowColor = '#FFF4A3'; g.shadowBlur = r * 1.2; }
      g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); if(glow) g.restore();
      g.strokeStyle = shade(col, -0.22); g.lineWidth = Math.max(1, r * 0.12); g.beginPath(); g.arc(x, y, r * 0.66, 0, 7); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.4, r * 0.28, r * 0.15, -0.6, 0, 7); g.fill();
    }
    add('alignext', {
      still(g, W, H){
        const {fw, cell, fh, fx, fy, sy} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, sy); gr.addColorStop(0, '#5B3A8E'); gr.addColorStop(0.55, '#E86A6A'); gr.addColorStop(1, '#FFC36B'); g.fillStyle = gr; g.fillRect(0, 0, W, sy);
        // fairground silhouettes: a big wheel + tents
        const wx = W * 0.14, wy = sy - H * 0.2, wr = Math.min(W, H) * 0.17; g.strokeStyle = 'rgba(70,30,90,.45)'; g.lineWidth = 3; g.beginPath(); g.arc(wx, wy, wr, 0, 7); g.stroke();
        for(let i = 0; i < 10; i++){ const a = i / 10 * 7; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); g.stroke(); }
        g.beginPath(); g.moveTo(wx - wr * 0.5, sy); g.lineTo(wx, wy); g.lineTo(wx + wr * 0.5, sy); g.stroke();
        [[0.86, 0.11], [0.72, 0.08]].forEach(([u, h]) => { const x = W * u, w = Math.min(W, H) * 0.16, t = sy - H * h - w * 0.4; g.fillStyle = 'rgba(70,30,90,.42)'; g.beginPath(); g.moveTo(x - w / 2, sy); g.lineTo(x - w / 2, t + w * 0.4); g.lineTo(x, t); g.lineTo(x + w / 2, t + w * 0.4); g.lineTo(x + w / 2, sy); g.fill(); });
        // the stage
        gr = g.createLinearGradient(0, sy, 0, H); gr.addColorStop(0, '#B5653A'); gr.addColorStop(1, '#7E3F22'); g.fillStyle = gr; g.fillRect(0, sy, W, H - sy);
        g.strokeStyle = 'rgba(60,25,10,.35)'; g.lineWidth = 1.5; for(let i = 1; i < 6; i++){ const y = sy + (H - sy) * (i / 6) ** 1.3; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        g.fillStyle = '#FFD84A'; for(let x = cell * 0.4; x < W; x += cell * 0.9){ g.beginPath(); g.arc(x, sy + 3, 3.5, 0, 7); g.fill(); }
        // the frame: legs, a blue board with 42 holes
        g.fillStyle = shade(BLUE, -0.35); g.fillRect(fx - cell * 0.35, fy + fh * 0.4, cell * 0.22, sy - fy - fh * 0.4); g.fillRect(fx + fw + cell * 0.13, fy + fh * 0.4, cell * 0.22, sy - fy - fh * 0.4);
        g.fillStyle = shade(BLUE, -0.35); g.fillRect(fx - cell * 0.55, sy - cell * 0.18, cell * 0.62, cell * 0.18); g.fillRect(fx + fw - cell * 0.07, sy - cell * 0.18, cell * 0.62, cell * 0.18);
      },
      live(g, W, H, t){
        const {fw, cell, fh, fx, fy, at} = geo(W, H), R = cell * 0.38;
        // 7 s loop: red drops into column 5 (lands on row 2) → the diagonal (2,5)(3,4)(4,3)(5,2) — four reds light up → confetti
        const cyc = 7, ph = (t % cyc) / cyc, dropC = 5, landR = 2;
        GRID.forEach((row, r) => row.split('').forEach((ch, c) => { if(ch === 'r' || ch === 'y'){ const p = at(c, r), win = ph > 0.48 && ch === 'r' && c + r === 7 && c >= 2 && c <= 4; disc(g, p.x, p.y, R, ch === 'r' ? RED : YEL, win && Math.sin(t * 9) > -0.3); } }));
        // the falling disc (squash on landing)
        let y, sq = 1; const top = fy - cell * 0.9, land = at(dropC, landR).y;
        if(ph < 0.12){ y = top - (0.12 - ph) * cell * 4; }
        else if(ph < 0.3){ const q = (ph - 0.12) / 0.18; y = lerp(top, land, q * q); }
        else { y = land; if(ph < 0.36) sq = 1 - 0.18 * Math.sin((ph - 0.3) / 0.06 * Math.PI); }
        g.save(); g.beginPath(); g.rect(fx - cell, 0, fw + cell * 2, fy + fh); g.clip(); g.translate(at(dropC, 0).x, y); g.scale(1 + (1 - sq) * 0.7, sq); disc(g, 0, 0, R, RED, ph > 0.48 && Math.sin(t * 9) > -0.3); g.restore();
        // the blue board in front of the discs, holes cut out
        g.save(); g.fillStyle = BLUE; g.beginPath(); g.roundRect(fx - cell * 0.1, fy - cell * 0.1, fw + cell * 0.2, fh + cell * 0.2, cell * 0.25);
        for(let r = 0; r < 6; r++) for(let c = 0; c < 7; c++){ const p = at(c, r); g.moveTo(p.x + R * 1.08, p.y); g.arc(p.x, p.y, R * 1.08, 0, 7, true); }
        g.fill('evenodd'); g.strokeStyle = shade(BLUE, -0.3); g.lineWidth = Math.max(2, cell * 0.06); g.stroke(); g.restore();
        g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(fx, fy - cell * 0.05, fw, cell * 0.08);
        if(ph > 0.48){ const a = at(2, 5), b = at(5, 2), on = 0.6 + 0.4 * Math.sin(t * 9); g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(255,244,163,' + (on * 0.75) + ')'; g.lineWidth = cell * 0.11; g.shadowColor = '#FFF4A3'; g.shadowBlur = cell * 0.5;
          g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.restore(); [[2, 5], [3, 4], [4, 3], [5, 2]].forEach(([c, r]) => { const p = at(c, r); g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(2, cell * 0.07); g.beginPath(); g.arc(p.x, p.y, R * 1.05, 0, 7); g.stroke(); }); }
        if(ph > 0.48){ const q = (ph - 0.48) / 0.52, C = ['#FF4D8D', '#FFC21A', '#4FD1A5', '#5AA9FF', '#FFFFFF']; for(let i = 0; i < 26; i++){ const a = i * 2.4, sp = 0.4 + (i % 5) * 0.15, x = W / 2 + Math.cos(a) * fw * sp * q * 1.1, yy = fy + fh * 0.4 + Math.sin(a) * fh * 0.4 * q + q * q * H * 0.25;
          g.save(); g.globalAlpha = 1 - q; g.translate(x, yy); g.rotate(a + t * 4); g.fillStyle = C[i % 5]; g.fillRect(-cell * 0.08, -cell * 0.04, cell * 0.16, cell * 0.08); g.restore(); } }
        for(let i = 0; i < 5; i++) sparkle(g, W * (0.08 + i * 0.21), H * 0.08 + Math.sin(t + i) * 5, 3, 0.4 + 0.3 * Math.sin(t * 2 + i));
      },
      spots(W, H){ const {sy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 36 * k, sy + (H - sy) * 0.72);
        const W3 = W > H ? [0.5, 0.22, 0.78] : [0.5, 0.18, 0.82], X = f => clamp(W * f, 64 * k, W - 64 * k);
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 6 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 6 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER alignext END
  K.loaded('alignext', 'b6a');
})(window.GameCovers && window.GameCovers._K);
