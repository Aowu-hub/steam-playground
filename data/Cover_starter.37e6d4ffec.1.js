
/* 🎬 Cover_starter — 📏 b6a: the "starter" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER starter START — ⭐ Star Catch (the 🧩 GameStarter demo, 🧱 B4a 2026-11-18): a starry night over a round grassy hill, a big golden star
  // tumbling down with a sparkle trail, little stars falling into the meadow, fireflies; the 🏆 champions stand on the hill catching.
  // A NEW game replaces this whole block with its own art (new_game.py copies it as a starting point, renamed to the game's id).
  (function(){
    const geo = (W, H) => { const hy = H * (W > H ? 0.74 : 0.78); return {hy}; };
    function hill(g, W, H, hy){
      let gr = g.createLinearGradient(0, hy - H * 0.08, 0, H); gr.addColorStop(0, '#3F8F57'); gr.addColorStop(1, '#245E3A'); g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, H); g.lineTo(0, hy + H * 0.04); g.quadraticCurveTo(W * 0.5, hy - H * 0.1, W, hy + H * 0.04); g.lineTo(W, H); g.fill();
      g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.moveTo(0, hy + H * 0.06); g.quadraticCurveTo(W * 0.5, hy - H * 0.06, W, hy + H * 0.06); g.quadraticCurveTo(W * 0.5, hy - H * 0.03, 0, hy + H * 0.06); g.fill();
    }
    function star(g, x, y, r, rot, col, glow){
      g.save(); g.translate(x, y); g.rotate(rot);
      if(glow){ const rg = g.createRadialGradient(0, 0, 0, 0, 0, r * 2.4); rg.addColorStop(0, 'rgba(255,230,120,.55)'); rg.addColorStop(1, 'rgba(255,230,120,0)'); g.fillStyle = rg; g.beginPath(); g.arc(0, 0, r * 2.4, 0, 7); g.fill(); }
      g.fillStyle = col; g.strokeStyle = 'rgba(120,70,0,.55)'; g.lineWidth = Math.max(1, r * 0.08); g.beginPath();
      for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(-r * 0.2, -r * 0.25, r * 0.16, 0, 7); g.fill(); g.restore();
    }
    add('starter', {
      still(g, W, H){
        const {hy} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#141A4A'); gr.addColorStop(0.6, '#3A2D7A'); gr.addColorStop(1, '#7B4FA8'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        const R = rng(11); for(let i = 0; i < 90; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.25 + R() * 0.6) + ')'; g.beginPath(); g.arc(R() * W, R() * hy * 0.95, 0.6 + R() * 1.6, 0, 7); g.fill(); }
        const m = Math.min(W, H), mx = W * 0.82, my = H * 0.16; g.fillStyle = 'rgba(255,248,214,.95)'; g.beginPath(); g.arc(mx, my, m * 0.06, 0, 7); g.fill();
        g.fillStyle = '#3A2D7A'; g.beginPath(); g.arc(mx + m * 0.025, my - m * 0.012, m * 0.052, 0, 7); g.fill();
        // far hills + the main hill the champions stand on
        g.fillStyle = '#2C5A6E'; g.beginPath(); g.moveTo(0, hy); for(let x = 0; x <= W; x += W / 8) g.lineTo(x, hy - H * 0.05 - H * 0.04 * Math.abs(Math.sin(x / W * 4.2))); g.lineTo(W, hy); g.fill();
        hill(g, W, H, hy);
        const R2 = rng(3); for(let i = 0; i < 26; i++){ const x = R2() * W, y = hy + H * 0.02 + R2() * (H - hy) * 0.9; g.fillStyle = ['#FFFFFF', '#FFD84A', '#FF9BC4'][Math.floor(R2() * 3)]; g.beginPath(); g.arc(x, y, 1.6 + R2() * 1.6, 0, 7); g.fill(); }
      },
      live(g, W, H, t){
        const {hy} = geo(W, H), m = Math.min(W, H);
        // the main piece: a big golden star tumbling down an arc (keeps clear of the logo when there is one)
        const p = (t * 0.16) % 1, bw = m * 0.2, a = away(W * 0.58, H * 0.1, bw * 2.4, bw * 2.2, W, H);
        const x = a.x + bw * 1.2 * a.s + Math.sin(p * Math.PI) * W * 0.08, y = a.y + (hy * 0.7 - a.y) * p, r = bw * 0.38 * a.s;
        for(let i = 1; i <= 8; i++){ const q = Math.max(0, p - i * 0.018); sparkle(g, a.x + bw * 1.2 * a.s + Math.sin(q * Math.PI) * W * 0.08, a.y + (hy * 0.7 - a.y) * q, r * (0.5 - i * 0.04), 0.5 - i * 0.05); }
        star(g, x, y, r, t * 1.6, '#FFD447', true);
        // little stars falling into the meadow, fireflies
        for(let i = 0; i < 6; i++){ const q = ((t * 0.22 + i * 0.17) % 1), sx = W * (0.08 + i * 0.16) + Math.sin(i * 3.1) * W * 0.03, sy = -10 + q * (hy + 10); star(g, sx, sy, m * 0.016, t * 2 + i, '#FFF0A8', false); }
        for(let i = 0; i < 7; i++){ const fx = W * (0.1 + 0.13 * i) + 12 * Math.sin(t * 0.9 + i * 2), fy = hy + H * 0.04 + 10 * Math.sin(t * 1.3 + i); sparkle(g, fx, fy, 3 + Math.sin(t * 4 + i), 0.3 + 0.3 * Math.sin(t * 3 + i), '#E8FF9A'); }
      },
      spots(W, H){
        const {hy} = geo(W, H), cands = [];
        for(let i = 0; i <= 20; i++){ const u = i / 20, x = W * (0.06 + u * 0.88), top = hy + H * 0.04 - 4 * (H * 0.1) * u * (1 - u); for(let j = 0; j < 3; j++) cands.push({x, y: top + (H - top) * (0.35 + j * 0.2), s: 1}); }
        return pick3(cands, W, H, () => clamp(Math.min(H, W * 1.15) / 470, 0.4, 0.95));
      }
    });
  })();
  // 🎬 COVER starter END
  K.loaded('starter', 'b6a');
})(window.GameCovers && window.GameCovers._K);
