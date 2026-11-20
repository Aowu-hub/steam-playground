
/* 🎬 Cover_eyes_brain — 📏 b6a: the "eyes-brain" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER eyes-brain START — 👀🧠 Eyes Brain Riot: a night game-show stage; the big flip board shows a number in little chunks (4 7 · 2 9), flips to 🙈 ? ? · ? ?, then the digits come back one by one with green ticks; the riot meter fills, spotlights sweep, confetti
  (function(){
    const NUM = ['4', '7', '2', '9', '5', '1'];
    const geo = (W, H) => { const wide = W > H; let bw = Math.min(W * (wide ? 0.52 : 0.86), H * (wide ? 0.62 : 0.5)), bx = W / 2 - bw / 2 + (wide ? W * 0.05 : 0), by = H * (wide ? 0.24 : 0.3);
      { const F = away(bx, by, bw, bw * 0.5, W, H); bw *= F.s; bx = F.x; by = F.y; }   /* 🏷️ 24j-e: the flip board keeps clear of the logo */
      const bh = bw * 0.42, fy = by + bh + bw * 0.16;
      return {wide, bw, bh, bx, by, fy}; };
    function tile(g, x, y, w, h, ch, col, flip){   // one flip tile: dark card, a split line, a big digit
      g.save(); g.translate(x + w / 2, y + h / 2); g.scale(1, Math.max(0.04, Math.abs(Math.cos(flip || 0))));
      g.fillStyle = '#1E1B3A'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * 0.14); g.fill();
      g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h / 2, [w * 0.14, w * 0.14, 0, 0]); g.fill();
      g.font = '900 ' + Math.round(h * 0.72) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(ch, 0, h * 0.04);
      g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = Math.max(1, h * 0.03); g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.stroke();
      g.restore();
    }
    add('eyes-brain', {
      still(g, W, H){
        const {bw, bh, bx, by, fy} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, fy); gr.addColorStop(0, '#120B33'); gr.addColorStop(1, '#3B1E73'); g.fillStyle = gr; g.fillRect(0, 0, W, fy);
        const R = rng(11); for(let i = 0; i < 40; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.25 + R() * 0.5) + ')'; g.beginPath(); g.arc(R() * W, R() * fy * 0.7, 0.6 + R() * 1.3, 0, 7); g.fill(); }
        // stage curtains
        [[0, 1], [W, -1]].forEach(([x0, d]) => { g.fillStyle = '#B4234F'; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + d * W * 0.12, 0); g.quadraticCurveTo(x0 + d * W * 0.05, fy * 0.5, x0 + d * W * 0.09, fy); g.lineTo(x0, fy); g.fill();
          g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; for(let k = 1; k < 4; k++){ g.beginPath(); g.moveTo(x0 + d * W * 0.03 * k, 0); g.quadraticCurveTo(x0 + d * W * 0.012 * k, fy * 0.5, x0 + d * W * 0.024 * k, fy); g.stroke(); } });
        g.fillStyle = '#E8B04A'; g.fillRect(0, 0, W, Math.max(10, H * 0.02));
        // stage floor
        gr = g.createLinearGradient(0, fy, 0, H); gr.addColorStop(0, '#5B2A86'); gr.addColorStop(1, '#2A1250'); g.fillStyle = gr; g.fillRect(0, fy, W, H - fy);
        g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1; for(let i = -8; i <= 8; i++){ g.beginPath(); g.moveTo(W / 2 + i * W * 0.02, fy); g.lineTo(W / 2 + i * W * 0.16, H); g.stroke(); }
        // the board frame with bulbs
        g.fillStyle = '#E8B04A'; g.beginPath(); g.roundRect(bx - bw * 0.05, by - bw * 0.07, bw * 1.1, bh + bw * 0.12, bw * 0.05); g.fill();
        g.fillStyle = '#2A1B52'; g.beginPath(); g.roundRect(bx - bw * 0.025, by - bw * 0.045, bw * 1.05, bh + bw * 0.07, bw * 0.035); g.fill();
        // legs
        g.fillStyle = '#C48A2C'; [0.15, 0.85].forEach(f => g.fillRect(bx + bw * f - bw * 0.02, by + bh + bw * 0.05, bw * 0.04, fy - by - bh - bw * 0.05 + 4));
      },
      live(g, W, H, t){
        const {bw, bh, bx, by, fy} = geo(W, H);
        // sweeping spotlights
        [[0.15, 1], [0.85, -1]].forEach(([f, d], i) => { const a = Math.sin(t * 0.7 + i * 2) * 0.35; g.save(); g.translate(W * f, 0); g.rotate(-d * 0.2 + a);
          const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,240,170,.35)'); gr.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-6, 0); g.lineTo(6, 0); g.lineTo(W * 0.16, H); g.lineTo(-W * 0.16, H); g.fill(); g.restore(); });
        // bulbs chase round the frame
        const nb = 22; for(let i = 0; i < nb; i++){ const q = i / nb, per = 2 * (bw * 1.1 + bh + bw * 0.12); let d = q * per, x, y; const w1 = bw * 1.1, h1 = bh + bw * 0.12, x0 = bx - bw * 0.05, y0 = by - bw * 0.07;
          if(d < w1){ x = x0 + d; y = y0; } else if((d -= w1) < h1){ x = x0 + w1; y = y0 + d; } else if((d -= h1) < w1){ x = x0 + w1 - d; y = y0 + h1; } else { d -= w1; x = x0; y = y0 + h1 - d; }
          const on = (Math.floor(t * 6) + i) % 3 === 0; g.fillStyle = on ? '#FFF7C2' : '#9A6A1E'; if(on){ g.shadowColor = '#FFE066'; g.shadowBlur = 8; } g.beginPath(); g.arc(x, y, Math.max(2, bw * 0.011), 0, 7); g.fill(); g.shadowBlur = 0; }
        // 7 s loop: show in chunks (0–2.2 s) → flip to ? (2.2–2.6) → hidden (2.6–3.6) → typed back one by one with ticks (3.6–6.2) → riot! (6.2–7)
        const cyc = 7, ph = t % cyc, n = 6, gap = bw * 0.02, chunkGap = bw * 0.05, tw = (bw - gap * 4 - chunkGap * 1 - bw * 0.04) / n, th = Math.min(bh * 0.72, tw * 1.35), ty = by + (bh - th) / 2 - bw * 0.01;
        for(let i = 0; i < n; i++){
          const x = bx + bw * 0.02 + i * (tw + gap) + (i >= 3 ? chunkGap - gap : 0) + (i > 0 && i !== 3 ? 0 : 0);
          let ch = NUM[i], col = '#FFFFFF', flip = 0;
          const shownAt = i < 3 ? 0.2 : 1.0;
          if(ph < shownAt){ ch = ''; } else if(ph < 2.2){ col = i < 3 ? '#FFE066' : '#7CE7FF'; }
          else if(ph < 2.6){ flip = (ph - 2.2) / 0.4 * Math.PI; if(flip > Math.PI / 2) ch = '?'; col = '#B9A7FF'; }
          else { const typedAt = 3.6 + i * 0.42; if(ph < typedAt){ ch = '?'; col = '#B9A7FF'; } else { col = '#5BE38A'; flip = ph < typedAt + 0.18 ? (1 - (ph - typedAt) / 0.18) * Math.PI / 2 : 0; } }
          tile(g, x, ty, tw, th, ch, col, flip);
          if(ph > 3.6 + i * 0.42 + 0.2 && ph < 6.9){ g.fillStyle = '#22C55E'; g.beginPath(); g.arc(x + tw * 0.86, ty + th * 0.08, tw * 0.17, 0, 7); g.fill(); g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(1.5, tw * 0.05); g.beginPath(); g.moveTo(x + tw * 0.79, ty + th * 0.08); g.lineTo(x + tw * 0.85, ty + th * 0.13); g.lineTo(x + tw * 0.94, ty + th * 0.02); g.stroke(); }
        }
        // 🙈 hide cue + riot meter under the board
        const my = by + bh + bw * 0.005, mw = bw * 0.6, mx = bx + (bw - mw) / 2, fill = ph < 3.6 ? 0.15 : Math.min(1, 0.15 + (ph - 3.6) / 2.6 * 0.85);
        g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.roundRect(mx, my - bw * 0.035, mw, bw * 0.03, bw * 0.015); g.fill();
        const mg = g.createLinearGradient(mx, 0, mx + mw, 0); mg.addColorStop(0, '#22C55E'); mg.addColorStop(0.6, '#FFE066'); mg.addColorStop(1, '#FF4D8D'); g.fillStyle = mg; g.beginPath(); g.roundRect(mx, my - bw * 0.035, mw * fill, bw * 0.03, bw * 0.015); g.fill();
        if(ph >= 2.4 && ph < 3.6){ g.save(); g.globalAlpha = Math.min(1, (ph - 2.4) * 4); g.font = Math.round(bw * 0.09) + 'px sans-serif'; g.textAlign = 'center'; g.fillText('🙈', bx + bw / 2, by - bw * 0.1 + Math.sin(ph * 8) * 3); g.restore(); }
        if(ph >= 6.2){ const q = (ph - 6.2) / 0.8; g.save(); g.globalAlpha = 1 - q * 0.6; g.font = '900 ' + Math.round(bw * 0.1) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#2A1B52'; g.fillStyle = '#FF4D8D';
          const s = 1 + Math.sin(q * Math.PI) * 0.15; g.translate(bx + bw / 2, by - bw * 0.08); g.scale(s, s); g.strokeText('RIOT!', 0, 0); g.fillText('RIOT!', 0, 0); g.restore();
          for(let i = 0; i < 16; i++){ const a = i / 16 * 7, x = bx + bw / 2 + Math.cos(a) * bw * 0.6 * q, y = by + Math.sin(a) * bw * 0.3 * q + q * q * bw * 0.3; g.save(); g.globalAlpha = 1 - q; g.translate(x, y); g.rotate(a + t * 5); g.fillStyle = ['#FFE066', '#FF4D8D', '#7CE7FF', '#5BE38A'][i % 4]; g.fillRect(-4, -2, 8, 4); g.restore(); } }
        // a peeking 👀 above the board, eyes follow the tiles
        const ex = bx + bw / 2, ey = by - bw * 0.035, er = bw * 0.035, look = ph < 2.2 ? Math.sin(ph * 2) : ph < 3.6 ? 0 : -1 + (ph - 3.6) / 1.3;
        if(ph < 2.4 || ph >= 3.6) [-1, 1].forEach(k => { g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(ex + k * er * 1.2, ey, er, er * 1.15, 0, 0, 7); g.fill(); g.fillStyle = '#1E1B3A'; g.beginPath(); g.arc(ex + k * er * 1.2 + clamp(look, -1, 1) * er * 0.45, ey + er * 0.15, er * 0.45, 0, 7); g.fill(); });
        for(let i = 0; i < 5; i++) sparkle(g, W * (0.1 + i * 0.2), fy * (0.15 + (i % 2) * 0.12), 4 + (i % 3) * 2, 0.4 + 0.4 * Math.sin(t * 3 + i), '#FFF7C2');
      },
      spots(W, H){ const {fy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 38 * k, fy + (H - fy) * 0.8);
        const W3 = W > H ? [0.5, 0.22, 0.78] : [0.5, 0.18, 0.82], X = f => clamp(W * f, 64 * k, W - 64 * k);
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 4 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER eyes-brain END
  K.loaded('eyes-brain', 'b6a');
})(window.GameCovers && window.GameCovers._K);
