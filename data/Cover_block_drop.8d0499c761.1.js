
/* 🎬 Cover_block_drop — 📏 b6a: the "block-drop" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER block-drop START — 🧱 Block Drop: a glass well on a glowing grid floor under a starry evening sky; a shape falls into the gap, the full row flashes and clears, the rows above drop down
  (function(){
    const COL = ['#3D8BFD', '#FFC21A', '#A855F7', '#22C55E', '#FF4D8D', '#FF8A3D'];
    const NC = 8, NR = 10;
    // the pile (bottom row = index 9); '.' empty, digit = colour. Row 9 has a gap at cols 5–6, row 8 at col 6 → the falling L fills both
    const PILE = { 6: '..1.....', 7: '.21..4..', 8: '0213.4.2', 9: '13024..5' };
    const PIECE = [[5, 9], [6, 9], [6, 8], [6, 7]];   // an L: (5,9) (6,9) (6,8) (6,7) — fills row 9
    const geo = (W, H) => { const wide = W > H, wh = H * (wide ? 0.66 : 0.48), cell = Math.min(wh / NR, W * (wide ? 0.4 : 0.7) / NC), ww = cell * NC, wx = W / 2 - ww / 2 + (wide ? W * 0.06 : 0), wy = H * (wide ? 0.16 : 0.26), gy = wy + cell * NR + cell * 0.25;
      return {wide, cell, ww, wx, wy, gy, at: (c, r) => ({x: wx + c * cell, y: wy + r * cell})}; };
    function sq(g, x, y, s, col, flash){
      g.fillStyle = flash ? '#FFFFFF' : col; g.fillRect(x + 1, y + 1, s - 2, s - 2);
      if(flash) return;
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(x + 1, y + 1); g.lineTo(x + s - 1, y + 1); g.lineTo(x + s - s * 0.18, y + s * 0.18); g.lineTo(x + s * 0.18, y + s * 0.18); g.lineTo(x + s * 0.18, y + s - s * 0.18); g.lineTo(x + 1, y + s - 1); g.fill();
      g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.moveTo(x + s - 1, y + s - 1); g.lineTo(x + s - 1, y + 1); g.lineTo(x + s - s * 0.18, y + s * 0.18); g.lineTo(x + s - s * 0.18, y + s - s * 0.18); g.lineTo(x + s * 0.18, y + s - s * 0.18); g.lineTo(x + 1, y + s - 1); g.fill();
    }
    add('block-drop', {
      still(g, W, H){
        const {cell, ww, wx, wy, gy} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, gy); gr.addColorStop(0, '#1B1D4E'); gr.addColorStop(0.6, '#4B2C8A'); gr.addColorStop(1, '#C0558C'); g.fillStyle = gr; g.fillRect(0, 0, W, gy);
        const R = rng(11); for(let i = 0; i < 70; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.3 + R() * 0.6) + ')'; g.beginPath(); g.arc(R() * W, R() * gy * 0.7, R() * 1.4 + 0.4, 0, 7); g.fill(); }
        // far block towers on the horizon
        for(let x = -10; x < W; ){ const w = 18 + R() * 34, h = gy * (0.08 + R() * 0.18); g.fillStyle = 'rgba(30,20,70,.55)'; g.fillRect(x, gy - h, w, h); g.fillStyle = 'rgba(255,214,90,.35)'; for(let y = gy - h + 6; y < gy - 6; y += 9) for(let wx2 = x + 4; wx2 < x + w - 4; wx2 += 8) if(R() > 0.55) g.fillRect(wx2, y, 3, 4); x += w + 4; }
        // the glowing grid floor
        g.fillStyle = '#1E1446'; g.fillRect(0, gy, W, H - gy);
        g.strokeStyle = 'rgba(120,180,255,.45)'; g.lineWidth = 1.2; const vx = W / 2;
        for(let i = -14; i <= 14; i++){ g.beginPath(); g.moveTo(vx + i * W * 0.02, gy); g.lineTo(vx + i * W * 0.16, H); g.stroke(); }
        for(let j = 1; j < 8; j++){ const y = gy + (H - gy) * (j / 8) ** 1.6; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        // the well: glass back + frame
        g.fillStyle = 'rgba(160,200,255,.12)'; g.fillRect(wx, wy, ww, cell * NR);
        g.strokeStyle = 'rgba(160,200,255,.12)'; g.lineWidth = 1; for(let c = 1; c < NC; c++){ g.beginPath(); g.moveTo(wx + c * cell, wy); g.lineTo(wx + c * cell, wy + cell * NR); g.stroke(); }
        g.save(); g.shadowColor = '#7FB8FF'; g.shadowBlur = cell * 0.4; g.strokeStyle = '#8FC3FF'; g.lineWidth = Math.max(2, cell * 0.12);
        g.beginPath(); g.moveTo(wx - g.lineWidth / 2, wy - cell * 0.3); g.lineTo(wx - g.lineWidth / 2, wy + cell * NR + g.lineWidth / 2); g.lineTo(wx + ww + g.lineWidth / 2, wy + cell * NR + g.lineWidth / 2); g.lineTo(wx + ww + g.lineWidth / 2, wy - cell * 0.3); g.stroke(); g.restore();
      },
      live(g, W, H, t){
        const {cell, ww, wx, wy, at} = geo(W, H);
        // 6 s loop: the L falls (step by step) → lands → row 9 flashes 3× → clears → rows above drop one row → pause
        const cyc = 6, ph = (t % cyc) / cyc, landT = 0.42, flashEnd = 0.6, dropEnd = 0.68;
        const steps = Math.min(7, Math.floor(ph / landT * 8)), off = 7 - steps;   // falls 7 rows in steps
        const cleared = ph >= flashEnd, dropQ = ph < flashEnd ? 0 : Math.min(1, (ph - flashEnd) / (dropEnd - flashEnd)), flash = ph >= landT && ph < flashEnd && Math.floor((ph - landT) / (flashEnd - landT) * 6) % 2 === 0;
        Object.keys(PILE).forEach(rs => { const r = +rs; PILE[rs].split('').forEach((ch, c) => { if(ch === '.') return; if(r === 9 && cleared) return; const p = at(c, r + (cleared && r < 9 ? dropQ : 0)); sq(g, p.x, p.y, cell, COL[+ch], r === 9 && flash); }); });
        PIECE.forEach(([c, r]) => { if(r === 9 && cleared) return; const rr = ph < landT ? r - off : r + (cleared && r < 9 ? dropQ : 0); if(rr < -0.5) return; const p = at(c, rr); sq(g, p.x, p.y, cell, COL[5], r === 9 && flash); });
        if(ph >= landT && ph < dropEnd + 0.08){ const q = (ph - landT) / (dropEnd + 0.08 - landT), y = wy + cell * 9.5; for(let i = 0; i < 10; i++) sparkle(g, wx + ww * (i + 0.5) / 10, y + Math.sin(i * 2 + t * 6) * cell * 0.5 * q, cell * 0.25 * (1 - q * 0.6), 1 - q);
          if(cleared){ g.save(); g.globalAlpha = 1 - (ph - flashEnd) / (dropEnd + 0.08 - flashEnd); g.font = '900 ' + Math.round(cell * 0.9) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#FFE066'; g.strokeStyle = '#2A1E3A'; g.lineWidth = 4; g.strokeText('LINE!', wx + ww / 2, y - cell * 1.6); g.fillText('LINE!', wx + ww / 2, y - cell * 1.6); g.restore(); } }
      },
      spots(W, H){ const {gy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 36 * k, gy + (H - gy) * 0.84);
        const W3 = W > H ? [0.5, 0.2, 0.8] : [0.5, 0.17, 0.83], X = f => clamp(W * f, 64 * k, W - 64 * k);
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 4 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER block-drop END
  K.loaded('block-drop', 'b6a');
})(window.GameCovers && window.GameCovers._K);
