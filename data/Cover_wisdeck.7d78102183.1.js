
/* 🎬 Cover_wisdeck — 📏 b6a: the "wisdeck" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER wisdeck START — 🃏 WisDeck: a quiz-show stage in an owl temple (columns, warm spotlights, curtain) — a fan of 5 cards; the middle card flips over (🦖 · 🪐 · 🗺️ · 🚀 in turn) with its ⚡ power, a "✅ Right!" pop, then the card flies into the glowing deck box (+1 🃏); the 🦉 professor owl blinks on its podium
  (function(){
    const FACES = [['🦖', 'T. rex', 8, '#16A34A'], ['🪐', 'Saturn', 9, '#7C3AED'], ['🌍', 'Earth', 6, '#0EA5E9'], ['🚀', 'Rocket', 7, '#EF4444']];
    const geo = (W, H) => { const wide = W > H, fy = H * (wide ? 0.7 : 0.66); let u = Math.min(W * (wide ? 0.085 : 0.15), H * (wide ? 0.2 : 0.14)), cx = W * (wide ? 0.6 : 0.5), cy = H * (wide ? 0.42 : 0.4);
      { const F = away(cx - u * 2.15, cy - u * 1.45, u * 4.3, u * 2.75, W, H, {bot: (wide ? 0.7 : 0.66) + 0.04}); u *= F.s; cx = F.x + u * 2.15; cy = F.y + u * 1.45; }   /* 🏷️ 24j-e: the card fan keeps clear of the logo */
      return {wide, u, cx, cy, fy}; };
    function cardBack(g, w, h){ g.fillStyle = '#1E2A5A'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * 0.12); g.fill(); g.strokeStyle = '#FFC845'; g.lineWidth = Math.max(2, w * 0.05); g.stroke();
      g.strokeStyle = 'rgba(255,200,69,.45)'; g.lineWidth = 1.5; g.beginPath(); g.roundRect(-w * 0.36, -h * 0.4, w * 0.72, h * 0.8, w * 0.08); g.stroke();
      g.fillStyle = '#FFC845'; g.font = Math.round(w * 0.42) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🦉', 0, 0); }
    function cardFace(g, w, h, F){ g.fillStyle = '#FFFDF7'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * 0.12); g.fill(); g.strokeStyle = F[3]; g.lineWidth = Math.max(2.5, w * 0.06); g.stroke();
      g.fillStyle = F[3]; g.beginPath(); g.roundRect(-w / 2 + 4, -h / 2 + 4, w - 8, h * 0.18, w * 0.08); g.fill();
      g.fillStyle = '#FFFFFF'; g.font = '800 ' + Math.round(w * 0.15) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(F[1], 0, -h / 2 + 4 + h * 0.09);
      g.font = Math.round(w * 0.5) + 'px sans-serif'; g.fillText(F[0], 0, h * 0.02);
      g.fillStyle = '#2A1E3A'; g.font = '900 ' + Math.round(w * 0.17) + 'px Fredoka, sans-serif'; g.fillText('⚡ ' + F[2], 0, h * 0.36); }
    add('wisdeck', {
      still(g, W, H){
        const {wide, u, cx, fy} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, fy); gr.addColorStop(0, '#2B1B4D'); gr.addColorStop(1, '#4A2F6E'); g.fillStyle = gr; g.fillRect(0, 0, W, fy);
        // temple columns + a pediment
        const cols = wide ? 6 : 4; for(let i = 0; i < cols; i++){ const x = W * (0.06 + i * (0.88 / (cols - 1))), cw = u * 0.42; gr = g.createLinearGradient(x - cw / 2, 0, x + cw / 2, 0); gr.addColorStop(0, '#CDBF98'); gr.addColorStop(0.5, '#F2E8CC'); gr.addColorStop(1, '#B3A47C');
          g.fillStyle = gr; g.fillRect(x - cw / 2, fy * 0.16, cw, fy * 0.84); g.fillStyle = '#E9DDB8'; g.fillRect(x - cw * 0.7, fy * 0.13, cw * 1.4, fy * 0.04); g.fillRect(x - cw * 0.7, fy - fy * 0.03, cw * 1.4, fy * 0.03); }
        poly(g, [[0, fy * 0.13], [W / 2, 0], [W, fy * 0.13]], '#E9DDB8'); poly(g, [[W * 0.08, fy * 0.115], [W / 2, fy * 0.02], [W * 0.92, fy * 0.115]], '#D8C99E');
        // red stage curtain swags
        g.fillStyle = '#B4233C'; for(let i = 0; i < 9; i++){ const x = i / 8 * W; g.beginPath(); g.ellipse(x, fy * 0.13, W / 14, fy * 0.06, 0, 0, Math.PI); g.fill(); }
        // spotlights
        [[0.25, -0.3], [0.75, 0.3]].forEach(([fx, tilt]) => { g.save(); g.globalAlpha = 0.16; g.fillStyle = '#FFF3C4'; g.beginPath(); g.moveTo(W * fx, 0); g.lineTo(cx - u * 2.2 + tilt * u, fy); g.lineTo(cx + u * 2.2 + tilt * u, fy); g.closePath(); g.fill(); g.restore(); });
        // the stage floor (wooden, glossy)
        gr = g.createLinearGradient(0, fy, 0, H); gr.addColorStop(0, '#9B5E2C'); gr.addColorStop(1, '#6E3F1B'); g.fillStyle = gr; g.fillRect(0, fy, W, H - fy);
        g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1; for(let x = -H; x < W; x += 34){ g.beginPath(); g.moveTo(x, H); g.lineTo(x + (H - fy) * 0.6, fy); g.stroke(); }
        g.fillStyle = '#FFC845'; g.fillRect(0, fy - 3, W, 5);
        // the professor owl on its podium (left on wide screens, small right on phones)
        const ox = wide ? W * 0.18 : W * 0.14, oy = fy, os = u * (wide ? 0.9 : 0.6);
        g.fillStyle = '#5B3A9B'; g.beginPath(); g.roundRect(ox - os * 0.8, oy - os * 1.0, os * 1.6, os * 1.0, os * 0.15); g.fill(); g.fillStyle = '#FFC845'; g.font = '800 ' + Math.round(os * 0.26) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WisDeck', ox, oy - os * 0.5);
      },
      live(g, W, H, t){
        const {wide, u, cx, cy, fy} = geo(W, H), cyc = 4.2, n = Math.floor(t / cyc), ph = t % cyc, F = FACES[n % FACES.length], w = u * 1.25, h = u * 1.75;
        // the owl blinks on its podium
        const ox = wide ? W * 0.18 : W * 0.14, os = u * (wide ? 0.9 : 0.6), blink = (t % 3.1) < 0.12;
        g.save(); g.font = Math.round(os * 1.1) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillText(blink ? '😑' : '🦉', ox, fy - os * 0.98 + Math.sin(t * 2) * 2); g.restore();
        // the fan: 2 + 2 backs, the middle card flips
        [-2, -1, 1, 2].forEach(i => { g.save(); g.translate(cx + i * w * 0.55, cy + Math.abs(i) * h * 0.08 + Math.sin(t * 1.5 + i) * 2); g.rotate(i * 0.16); cardBack(g, w * 0.92, h * 0.92); g.restore(); });
        // 0–1 rest · 1–1.5 flip · 1.5–2.6 shown (✅ pop) · 2.6–3.4 fly into the deck · 3.4–4.2 a new card slides in
        const deckX = W * (wide ? 0.9 : 0.86), deckY = fy - u * 0.45;
        let x = cx, y = cy, sx = 1, sc = 1, face = false, a = 1;
        if(ph < 1){ y = cy - Math.sin(ph * Math.PI) * u * 0.08; }
        else if(ph < 1.5){ const q = (ph - 1) / 0.5; sx = Math.abs(Math.cos(q * Math.PI)); face = q > 0.5; y = cy - u * 0.2 * Math.sin(q * Math.PI); }
        else if(ph < 2.6){ face = true; sc = 1 + 0.06 * Math.sin((ph - 1.5) * 6); }
        else if(ph < 3.4){ const q = (ph - 2.6) / 0.8, e = q * q * (3 - 2 * q); face = true; x = cx + (deckX - cx) * e; y = cy + (deckY - cy) * e - Math.sin(q * Math.PI) * u * 1.2; sc = 1 - 0.6 * e; }
        else { const q = (ph - 3.4) / 0.8; y = cy + (1 - q) * u * 1.5; a = q; }
        g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(sx * sc, sc); if(face) cardFace(g, w, h, F); else cardBack(g, w, h); g.restore();
        if(ph >= 1.5 && ph < 2.6){ const q = (ph - 1.5) / 1.1, s = Math.min(1, q * 5); g.save(); g.globalAlpha = Math.min(1, (1 - q) * 3); g.translate(cx + w * 0.75, cy - h * 0.55); g.scale(s, s);
          g.fillStyle = '#22C55E'; g.beginPath(); g.roundRect(-u * 0.75, -u * 0.26, u * 1.5, u * 0.52, u * 0.26); g.fill(); g.fillStyle = '#fff'; g.font = '900 ' + Math.round(u * 0.3) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✅ Right!', 0, 1); g.restore();
          for(let i = 0; i < 8; i++){ const an = i / 8 * 6.283; sparkle(g, cx + Math.cos(an) * w * (0.7 + q * 0.5), cy + Math.sin(an) * h * (0.6 + q * 0.4), u * 0.08, 1 - q, '#FFE14D'); } }
        // the deck box glows (+1 🃏 when the card lands)
        g.save(); g.translate(deckX, deckY); const land = ph >= 3.3 && ph < 3.9 ? Math.sin((ph - 3.3) / 0.6 * Math.PI) : 0; g.scale(1 + land * 0.12, 1 + land * 0.12);
        g.shadowColor = '#FFC845'; g.shadowBlur = 10 + land * 20; g.fillStyle = '#7C3AED'; g.beginPath(); g.roundRect(-u * 0.55, -u * 0.38, u * 1.1, u * 0.76, u * 0.12); g.fill(); g.shadowBlur = 0;
        g.fillStyle = '#FFC845'; g.font = '800 ' + Math.round(u * 0.28) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🃏 ' + (12 + n), 0, 1); g.restore();
        if(land){ g.save(); g.globalAlpha = land; g.fillStyle = '#FFE14D'; g.font = '900 ' + Math.round(u * 0.32) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('+1', deckX, deckY - u * 0.6 - land * u * 0.2); g.restore(); }
        // floating dust in the spotlights
        for(let i = 0; i < 6; i++){ const x2 = ((i * 0.21 + t * 0.01) % 1) * W, y2 = fy * (0.25 + ((i * 0.31) % 0.6)) + Math.sin(t + i) * 6; sparkle(g, x2, y2, 3, 0.35 + 0.3 * Math.sin(t * 2 + i), '#FFF7C2'); }
      },
      spots(W, H){ const {fy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 36 * k, fy + (H - fy) * 0.85), X = f => clamp(W * f, 64 * k, W - 64 * k), W3 = W > H ? [0.6, 0.38, 0.8] : [0.5, 0.17, 0.83];
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 4 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER wisdeck END
  K.loaded('wisdeck', 'b6a');
})(window.GameCovers && window.GameCovers._K);
