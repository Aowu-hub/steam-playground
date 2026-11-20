
/* 🎬 Cover_beat_corner — 📏 b6a: the "beat-corner" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER beat-corner START — 🎵 BeatCorner: a neon dance stage (speakers, disco ball, coloured light beams) with the game's 4 glowing corner buttons round a middle pad — beats fly out from the middle to the corners in time (≈ 120 BPM), each ring closes and a "PERFECT!" / "GREAT!" pops; every 4th beat the big 🔴 middle beat rings in, the floor tiles pulse to the music, notes float up from the speakers
  (function(){
    const BTN = [['#FF4F8B', -1, -1], ['#2F8CFF', -1, 1], ['#22C3A1', 1, -1], ['#FFC845', 1, 1]];   // corner colour + side x / y (top-left, bottom-left, top-right, bottom-right)
    const WORDS = ['PERFECT!', 'GREAT!', 'PERFECT!', 'GOOD!'];
    const geo = (W, H) => { const wide = W > H, cx = W * (wide ? 0.66 : 0.5), cy = H * (wide ? 0.56 : 0.45), rx = Math.min(W * (wide ? 0.2 : 0.33), H * (wide ? 0.32 : 0.4)), ry = Math.min(H * (wide ? 0.19 : 0.14), rx * 0.8), br = Math.max(12, Math.min(rx, ry) * 0.3), fy = H * (wide ? 0.72 : 0.66);
      return {wide, cx, cy, rx, ry, br, fy}; };
    add('beat-corner', {
      still(g, W, H){
        const {wide, cx, cy, rx, ry, br, fy} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, fy); gr.addColorStop(0, '#120A2E'); gr.addColorStop(1, '#2A0F4F'); g.fillStyle = gr; g.fillRect(0, 0, W, fy);
        // back wall: a neon skyline of equaliser bars
        const R = rng(9); for(let i = 0; i < 28; i++){ const x = i / 28 * W, h = fy * (0.12 + R() * 0.22); g.fillStyle = 'rgba(124,58,237,' + (0.18 + R() * 0.15) + ')'; g.fillRect(x + 2, fy - h, W / 28 - 4, h); }
        // speakers left + right
        [[W * 0.06, 1], [W * 0.94, -1]].forEach(([x]) => { const sw = Math.min(W * 0.1, 80), sh = sw * 1.6; g.fillStyle = '#1B1430'; g.beginPath(); g.roundRect(x - sw / 2, fy - sh, sw, sh, 8); g.fill(); g.strokeStyle = '#3B2D63'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#2E2550'; [0.3, 0.7].forEach(f => { g.beginPath(); g.arc(x, fy - sh * (1 - f), sw * (f < 0.5 ? 0.22 : 0.34), 0, 7); g.fill(); g.strokeStyle = '#7C3AED'; g.stroke(); }); });
        // the dance floor: a lit grid in perspective
        gr = g.createLinearGradient(0, fy, 0, H); gr.addColorStop(0, '#1A1038'); gr.addColorStop(1, '#0B0620'); g.fillStyle = gr; g.fillRect(0, fy, W, H - fy);
        const P = persp(W, H, fy, wide ? 1.4 : 2.1); g.strokeStyle = 'rgba(255,79,139,.35)'; g.lineWidth = 1.2;
        for(let i = 0; i <= 10; i++){ const a = P(i / 10, 0), b = P(i / 10, 1); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        for(let j = 0; j <= 5; j++){ const a = P(0, j / 5), b = P(1, j / 5); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        // the play board behind the corners: a rounded panel
        g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 20; g.fillStyle = 'rgba(20,12,44,.85)'; g.beginPath(); g.roundRect(cx - rx - br * 1.4, cy - ry - br * 1.4, (rx + br * 1.4) * 2, (ry + br * 1.4) * 2, br); g.fill(); g.restore();
        g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.beginPath(); g.roundRect(cx - rx - br * 1.4, cy - ry - br * 1.4, (rx + br * 1.4) * 2, (ry + br * 1.4) * 2, br); g.stroke();
      },
      live(g, W, H, t){
        const {wide, cx, cy, rx, ry, br, fy} = geo(W, H), bpm = 120, spb = 60 / bpm, beat = t / spb, bi = Math.floor(beat), bp = beat - bi;
        // light beams sweep from the ceiling
        [['#FF4F8B', 0.2, 0], ['#2F8CFF', 0.8, 1.7], ['#22C3A1', 0.5, 3.1]].forEach(([c, fx, o]) => { const a = Math.sin(t * 0.7 + o) * 0.45; g.save(); g.globalAlpha = 0.12; g.fillStyle = c; g.translate(W * fx, 0); g.rotate(a);
          g.beginPath(); g.moveTo(0, 0); g.lineTo(-W * 0.12, fy * 1.1); g.lineTo(W * 0.12, fy * 1.1); g.closePath(); g.fill(); g.restore(); });
        // the disco ball
        const dx = W * (wide ? 0.8 : 0.86), dy = fy * 0.12, dr = Math.max(14, br * 0.9); g.strokeStyle = '#888'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(dx, 0); g.lineTo(dx, dy - dr); g.stroke();
        g.save(); g.beginPath(); g.arc(dx, dy, dr, 0, 7); g.clip(); g.fillStyle = '#B9C2D9'; g.fillRect(dx - dr, dy - dr, dr * 2, dr * 2);
        for(let y = -dr; y < dr; y += dr / 4) for(let x = -dr; x < dr; x += dr / 4){ const k = (Math.floor((x + t * dr) / (dr / 4)) + Math.floor(y / (dr / 4))) % 3; g.fillStyle = ['#E8EEFF', '#9AA6C4', '#FFFFFF'][(k + 3) % 3]; g.fillRect(dx + x + 1, dy + y + 1, dr / 4 - 2, dr / 4 - 2); } g.restore();
        for(let i = 0; i < 4; i++) sparkle(g, dx + Math.cos(t * 2 + i * 1.6) * dr * 1.6, dy + Math.sin(t * 2 + i * 1.6) * dr * 1.1, 4, 0.5 + 0.5 * Math.sin(t * 5 + i), '#FFFFFF');
        // floor tiles pulse on the beat
        const P = persp(W, H, fy, wide ? 1.4 : 2.1), pulse = Math.max(0, 1 - bp * 2.5);
        for(let i = 0; i < 10; i++) for(let j = 0; j < 5; j++) if((i + j + bi) % 3 === 0){ const a = P(i / 10, j / 5), b = P((i + 1) / 10, j / 5), c = P((i + 1) / 10, (j + 1) / 5), d = P(i / 10, (j + 1) / 5);
          poly(g, [[a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y]], 'rgba(' + ['255,79,139', '47,140,255', '34,195,161', '255,200,69'][(i + j) % 4] + ',' + (0.1 + pulse * 0.35) + ')'); }
        // the middle pad + the big 🔴 beat every 4th beat
        const big = bi % 4 === 3; g.save(); g.fillStyle = big ? '#E11D48' : '#3B2D63'; g.shadowColor = big ? '#FF4F8B' : 'transparent'; g.shadowBlur = big ? 20 : 0; g.beginPath(); g.arc(cx, cy, br * (0.9 + (big ? pulse * 0.25 : 0)), 0, 7); g.fill(); g.restore();
        if(big){ g.save(); g.strokeStyle = '#FF4F8B'; g.lineWidth = 3; g.globalAlpha = 1 - bp; g.beginPath(); g.arc(cx, cy, br * (2.6 - bp * 1.7), 0, 7); g.stroke(); g.restore(); }
        g.fillStyle = '#fff'; g.font = Math.round(br * 0.9) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('💃', cx, cy);
        // the 4 corner buttons; beats fly out from the middle, one corner per beat
        BTN.forEach(([col, sx, sy], k) => { const x = cx + sx * rx, y = cy + sy * ry, hitNow = !big && (bi % 4) === k, glow = hitNow ? pulse : 0;
          g.save(); g.shadowColor = col; g.shadowBlur = 8 + glow * 24; g.fillStyle = col; g.beginPath(); g.arc(x, y, br * (1 + glow * 0.15), 0, 7); g.fill(); g.restore();
          g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, br * 0.72, 0, 7); g.stroke();
          // the beat on its way to this corner (it arrives on the next beat)
          const next = (bi + 1) % 4 === k && (bi + 1) % 4 !== 3; if(next){ const q = bp, bx = cx + (x - cx) * q, by = cy + (y - cy) * q; g.save(); g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 12; g.beginPath(); g.arc(bx, by, br * 0.5, 0, 7); g.fill(); g.restore();
            g.save(); g.globalAlpha = 0.8; g.strokeStyle = '#FFFFFF'; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, br * (2.2 - q * 1.2), 0, 7); g.stroke(); g.restore(); }
          if(hitNow && bp < 0.7){ const q = bp / 0.7, w = WORDS[(Math.floor(bi / 4) + k) % 4]; g.save(); g.globalAlpha = 1 - q; g.fillStyle = col; g.strokeStyle = '#120A2E'; g.lineWidth = 4;
            g.font = '900 ' + Math.round(br * 0.62) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const ty = y + sy * br * 1.6 - q * br * 0.6; g.strokeText(w, x, ty); g.fillText(w, x, ty); g.restore();
            for(let i = 0; i < 6; i++){ const an = i / 6 * 6.283; sparkle(g, x + Math.cos(an) * br * (1.1 + q), y + Math.sin(an) * br * (1.1 + q), br * 0.16, 1 - q, '#FFFFFF'); } } });
        // notes float up from the speakers
        for(let i = 0; i < 6; i++){ const side = i % 2, q = ((t * 0.35 + i * 0.17) % 1), x = side ? W * 0.94 : W * 0.06, y = fy - q * fy * 0.8;
          g.save(); g.globalAlpha = 1 - q; g.fillStyle = ['#FF4F8B', '#FFC845', '#22C3A1'][i % 3]; g.font = '800 ' + Math.round(br * 0.6) + 'px sans-serif'; g.textAlign = 'center'; g.fillText(i % 3 ? '♪' : '♫', x + Math.sin(t * 2 + i) * 12, y); g.restore(); }
      },
      spots(W, H){ const {fy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 36 * k, fy + (H - fy) * 0.85), X = f => clamp(W * f, 64 * k, W - 64 * k), W3 = W > H ? [0.6, 0.3, 0.86] : [0.5, 0.17, 0.83];
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 4 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER beat-corner END
  K.loaded('beat-corner', 'b6a');
})(window.GameCovers && window.GameCovers._K);
