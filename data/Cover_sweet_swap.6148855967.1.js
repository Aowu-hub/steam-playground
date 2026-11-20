
/* 🎬 Cover_sweet_swap — 📏 b6a: the "sweet-swap" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER sweet-swap START — 🍬 Sweet Swap: a pink candy shop — striped wall, jars on shelves, a tray of sweets on the counter; two sweets swap, three in a row burst into sparkles and new ones drop in
  (function(){
    const COL = ['#FF4D8D', '#FFC21A', '#A855F7', '#22C55E', '#3DA5FF'];
    const TRAY = [[1, 3, 2, 0, 4, 1], [2, 0, 1, 2, 3, 0], [4, 2, 0, 3, 0, 2], [3, 1, 4, 1, 2, 4]];   // row 2: 0 · 0 at cols 2 and 4, the 0 at (3, 1) swaps down with the 3 at (3, 2) → 0 0 0 in row 2
    const geo = (W, H) => { const wide = W > H; let tw = Math.min(W * (wide ? 0.5 : 0.84), H * (wide ? 0.62 : 0.56)), tx = W / 2 - tw / 2 + (wide ? W * 0.05 : 0), ty = H * (wide ? 0.3 : 0.36);
      { const F = away(tx, ty - tw / 6 * 0.95, tw, tw / 6 * 5.45, W, H); tw *= F.s; tx = F.x; ty = F.y + tw / 6 * 0.95; }   /* 🏷️ 24j-e: tray + jars keep clear of the logo */
      const cell = tw / 6, th = cell * 4, cy = ty + th + cell * 0.5;
      return {wide, tw, cell, th, tx, ty, cy, at: (c, r) => ({x: tx + (c + 0.5) * cell, y: ty + (r + 0.5) * cell})}; };
    function sweet(g, k, x, y, r){
      const c = COL[k]; g.save(); g.translate(x, y);
      g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(r * 0.1, r * 0.9, r * 0.8, r * 0.22, 0, 0, 7); g.fill();
      g.fillStyle = c; g.strokeStyle = shade(c, -0.3); g.lineWidth = Math.max(1, r * 0.1); g.beginPath();
      if(k === 0){ g.arc(0, 0, r * 0.82, 0, 7); }                                                                  // round gum drop
      else if(k === 1){ g.moveTo(-r, -r * 0.5); g.lineTo(-r * 0.55, 0); g.lineTo(-r, r * 0.5); g.closePath(); g.moveTo(r, -r * 0.5); g.lineTo(r * 0.55, 0); g.lineTo(r, r * 0.5); g.closePath(); g.ellipse(0, 0, r * 0.62, r * 0.5, 0, 0, 7); }   // wrapped toffee
      else if(k === 2){ g.moveTo(0, r * 0.85); g.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.1, 0, -r * 0.4); g.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.3, -r * 0.1, 0, r * 0.85); }   // heart
      else if(k === 3){ g.roundRect(-r * 0.72, -r * 0.72, r * 1.44, r * 1.44, r * 0.3); }                          // jelly square
      else { for(let i = 0; i < 10; i++){ const a = i * Math.PI / 5 - Math.PI / 2, q = i % 2 ? 0.42 : 0.9; g.lineTo(Math.cos(a) * r * q, Math.sin(a) * r * q); } g.closePath(); }   // star
      g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-r * 0.28, -r * 0.3, r * 0.22, r * 0.12, -0.6, 0, 7); g.fill();
      g.restore();
    }
    add('sweet-swap', {
      still(g, W, H){
        const {tw, cell, th, tx, ty, cy} = geo(W, H);
        // striped wall
        for(let x = 0, i = 0; x < W; x += Math.max(18, W / 22), i++){ g.fillStyle = i % 2 ? '#FFD6E7' : '#FFF0F6'; g.fillRect(x, 0, Math.max(18, W / 22) + 1, cy); }
        // one shelf of candy jars just above the tray (the top of the picture stays calm for the title)
        const R = rng(31), y = ty - cell * 0.42; g.fillStyle = '#C97B4A'; g.fillRect(0, y, W, 7); g.fillStyle = '#9C5A32'; g.fillRect(0, y + 7, W, 3);
        for(let x = 14; x < W - 20; x += cell * 0.95 + R() * cell * 0.3){ const jw = cell * (0.5 + R() * 0.2), jh = cell * (0.62 + R() * 0.25); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.roundRect(x, y - jh, jw, jh, 6); g.fill();
          for(let j = 0; j < 5; j++){ g.fillStyle = COL[Math.floor(R() * 5)]; g.beginPath(); g.arc(x + jw * (0.2 + R() * 0.6), y - jh * (0.12 + R() * 0.55), Math.max(2.5, cell * 0.07), 0, 7); g.fill(); }
          g.fillStyle = COL[Math.floor(R() * 5)]; g.fillRect(x - 1, y - jh - 5, jw + 2, 6); }
        // the counter + its front
        g.fillStyle = '#FF7FB0'; g.fillRect(0, cy - cell * 0.15, W, cell * 0.25); g.fillStyle = '#FFFFFF'; for(let x = 0; x < W; x += cell * 0.5){ g.beginPath(); g.arc(x + cell * 0.25, cy + cell * 0.1, cell * 0.25, 0, Math.PI); g.fill(); }
        let gr = g.createLinearGradient(0, cy, 0, H); gr.addColorStop(0, '#F4A3C4'); gr.addColorStop(1, '#E27BA8'); g.fillStyle = gr; g.fillRect(0, cy + cell * 0.1, W, H - cy);
        // floor tiles under the shoppers' feet
        for(let x = 0, i = 0; x < W; x += cell * 0.7, i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,0)'; g.fillRect(x, H - (H - cy) * 0.42, cell * 0.7, (H - cy) * 0.42); }
        // the tray
        g.fillStyle = 'rgba(120,40,80,.18)'; g.beginPath(); g.roundRect(tx - cell * 0.22 + 4, ty - cell * 0.22 + 6, tw + cell * 0.44, th + cell * 0.44, cell * 0.3); g.fill();
        g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(tx - cell * 0.22, ty - cell * 0.22, tw + cell * 0.44, th + cell * 0.44, cell * 0.3); g.fill();
        g.strokeStyle = '#FF7FB0'; g.lineWidth = Math.max(2, cell * 0.06); g.stroke();
        for(let r = 0; r < 4; r++) for(let c = 0; c < 6; c++){ g.fillStyle = (r + c) % 2 ? '#FFE9F2' : '#FFF6FA'; g.beginPath(); g.roundRect(tx + c * cell + 2, ty + r * cell + 2, cell - 4, cell - 4, cell * 0.18); g.fill(); }
      },
      live(g, W, H, t){
        const {cell, at} = geo(W, H), R = cell * 0.38;
        // 6 s loop: wiggle → swap (3,1) ↔ (3,2) → row 2 cols 2–4 burst → new sweets fall in → rest
        const cyc = 6, ph = (t % cyc) / cyc, A = [3, 1], B = [3, 2];
        const swapQ = ph < 0.18 ? 0 : ph < 0.34 ? (ph - 0.18) / 0.16 : 1, e = swapQ * swapQ * (3 - 2 * swapQ);
        const burst = ph > 0.38 && ph < 0.56, gone = ph >= 0.38 && ph < 0.6, fallQ = ph < 0.6 ? 0 : Math.min(1, (ph - 0.6) / 0.14);
        for(let r = 0; r < 4; r++) for(let c = 0; c < 6; c++){
          let k = TRAY[r][c], p = at(c, r), s = 1;
          if(c === 3 && (r === 1 || r === 2)){ const from = r === 1 ? A : B, to = r === 1 ? B : A, a = at(from[0], from[1]), b = at(to[0], to[1]); p = {x: lerp(a.x, b.x, e) + (r === 1 ? 1 : -1) * Math.sin(e * Math.PI) * cell * 0.25, y: lerp(a.y, b.y, e)}; if(ph < 0.18) p.x += Math.sin(t * 30) * cell * 0.03; }
          const endsInRow2 = (r === 2 && (c === 2 || c === 4)) || (c === 3 && r === 1);
          if(endsInRow2 && gone){ if(burst){ const q = (ph - 0.38) / 0.18; s = 1 + q * 0.5; g.save(); g.globalAlpha = 1 - q; sweet(g, 0, p.x, p.y, R * s); g.restore(); } continue; }
          if(endsInRow2 && fallQ > 0){ const q = fallQ * fallQ; p = {x: p.x, y: lerp(at(c, -1.5).y, p.y, q)}; k = (c + 2) % 5; if(c === 3) p = {x: at(3, 2).x, y: lerp(at(3, -1.5).y, at(3, 2).y, q)}; }
          if(c === 3 && r === 1 && fallQ === 0 && !gone && swapQ >= 1){ /* the gum drop now sits in row 2 */ }
          sweet(g, k, p.x, p.y, R);
        }
        if(burst){ const q = (ph - 0.38) / 0.18; [2, 3, 4].forEach(c => { const p = at(c, 2); for(let i = 0; i < 6; i++){ const a = i / 6 * 7 + c; sparkle(g, p.x + Math.cos(a) * cell * (0.3 + q * 0.7), p.y + Math.sin(a) * cell * (0.3 + q * 0.7), cell * 0.12 * (1 - q * 0.5), 1 - q, i % 2 ? '#FFFFFF' : '#FFE38A'); } }); }
        if(ph > 0.38 && ph < 0.7){ const q = (ph - 0.38) / 0.32, p = at(3, 1); g.save(); g.globalAlpha = 1 - q; g.font = '800 ' + Math.round(cell * 0.42) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#FF2E7E'; g.strokeStyle = '#FFFFFF'; g.lineWidth = 4; g.strokeText('+30', p.x, p.y - q * cell * 0.8); g.fillText('+30', p.x, p.y - q * cell * 0.8); g.restore(); }
      },
      spots(W, H){ const {cy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 36 * k, cy + (H - cy) * 0.82);
        const W3 = W > H ? [0.5, 0.2, 0.8] : [0.5, 0.18, 0.82], X = f => clamp(W * f, 64 * k, W - 64 * k);
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 4 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER sweet-swap END
  K.loaded('sweet-swap', 'b6a');
})(window.GameCovers && window.GameCovers._K);
