
/* 🎬 Cover_turbo — 📏 b6a: the "turbo" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER turbo START — 🏎️ Turbo Trail: a road winding into green hills, a chequered START banner over the grid, race cars zoom up the road, flags wave
  (function(){
    const geo = (W, H) => { const wide = W > H, hy = H * (wide ? 0.38 : 0.36), cx = W / 2;
      // the road: centre bends to the right then left as it goes away; half-width shrinks with distance (v 0 = horizon, 1 = near)
      const mid = v => cx + Math.sin((1 - v) * 3.2) * W * 0.12 * (1 - v), half = v => (wide ? W * 0.2 : W * 0.34) * (0.06 + 0.94 * v * v), y = v => hy + (H - hy) * v * v * 0.98 + (H - hy) * 0.02 * v;
      return {wide, hy, cx, mid, half, y}; };
    function car(g, x, y, s, col, t, k){
      g.save(); g.translate(x, y + Math.sin(t * 18 + k) * 0.6 * s);
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(0, 2 * s, 26 * s, 6 * s, 0, 0, 7); g.fill();
      g.fillStyle = '#2B2B35'; [-18, 18].forEach(dx => { g.fillRect(dx * s - 5 * s, -9 * s, 10 * s, 11 * s); });
      g.fillStyle = col; g.beginPath(); g.moveTo(-20 * s, -4 * s); g.lineTo(20 * s, -4 * s); g.lineTo(16 * s, -18 * s); g.lineTo(-16 * s, -18 * s); g.closePath(); g.fill();
      g.fillStyle = shade(col, -0.3); g.fillRect(-20 * s, -6 * s, 40 * s, 3 * s);
      g.fillStyle = 'rgba(190,230,255,.95)'; g.beginPath(); g.moveTo(-11 * s, -18 * s); g.lineTo(11 * s, -18 * s); g.lineTo(8 * s, -26 * s); g.lineTo(-8 * s, -26 * s); g.closePath(); g.fill();
      g.fillStyle = shade(col, 0.2); g.fillRect(-22 * s, -20 * s, 44 * s, 4 * s);   // spoiler
      g.fillStyle = '#FFF4B0'; [-1, 1].forEach(d => { g.beginPath(); g.arc(d * 13 * s, -9 * s, 2.6 * s, 0, 7); g.fill(); });
      g.restore();
    }
    function arch(g, W, H, t){ const {hy, mid, half, y} = geo(W, H);
      // the START arch: two posts + a chequered banner across the road
      const av = 0.74, ay = y(av), am = mid(av), ah = half(av) * 1.25, ph = (H - hy) * 0.42;
      g.fillStyle = '#E9E2CF'; [-1, 1].forEach(d => g.fillRect(am + d * ah - 5, ay - ph, 10, ph));
      const bw = ah * 2, bh = ph * 0.2, sq = bh / 2, cols = Math.ceil(bw / sq);
      for(let r = 0; r < 2; r++) for(let c = 0; c < cols; c++){ g.fillStyle = (r + c) % 2 ? '#1E1E28' : '#FFFFFF'; g.fillRect(am - ah + c * sq, ay - ph + r * sq, Math.min(sq, am + ah - (am - ah + c * sq)), sq); }
      g.fillStyle = '#FF5A4F'; g.fillRect(am - ah * 0.42, ay - ph - bh * 0.95, ah * 0.84, bh * 0.9); g.fillStyle = '#FFFFFF'; g.font = '800 ' + Math.round(bh * 0.62) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('START', am, ay - ph - bh * 0.5);
      return {am, ah, ay, ph};
    }
    add('turbo', {
      still(g, W, H){
        const {hy, mid, half, y, wide} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#5EC8FF'); gr.addColorStop(1, '#DDF5FF'); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 2);
        g.fillStyle = 'rgba(255,240,170,.9)'; g.beginPath(); g.arc(W * 0.8, hy * 0.35, Math.min(W, H) * 0.06, 0, 7); g.fill();
        // far hills (2 layers)
        [['#9BD77A', 0.07, 1.7], ['#7CC45E', 0.035, 2.6]].forEach(([c, a, f], i) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, hy + 2); for(let x = 0; x <= W; x += W / 40) g.lineTo(x, hy - H * a * (1.2 + Math.sin(x / W * Math.PI * f + i * 2))); g.lineTo(W, hy + 2); g.fill(); });
        gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, '#8ED36B'); gr.addColorStop(1, '#5DB04A'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
        // the road: rumble strips + asphalt + centre dashes (drawn in slices from far to near)
        const N = 60; for(let i = 0; i < N; i++){ const v0 = i / N, v1 = (i + 1) / N, y0 = y(v0), y1 = y(v1), m0 = mid(v0), m1 = mid(v1), h0 = half(v0), h1 = half(v1);
          const stripe = Math.floor(v0 * v0 * 40) % 2; poly(g, [[m0 - h0 * 1.12, y0], [m0 + h0 * 1.12, y0], [m1 + h1 * 1.12, y1], [m1 - h1 * 1.12, y1]], stripe ? '#FF5A4F' : '#FFFFFF');
          poly(g, [[m0 - h0, y0], [m0 + h0, y0], [m1 + h1, y1], [m1 - h1, y1]], stripe ? '#5A5E6C' : '#535766');
          if(stripe) poly(g, [[m0 - h0 * 0.03, y0], [m0 + h0 * 0.03, y0], [m1 + h1 * 0.03, y1], [m1 - h1 * 0.03, y1]], '#F2E7B0'); }
        // trees beside the road
        const R = rng(12); for(let i = 0; i < 22; i++){ const v = 0.08 + R() * 0.6, side = R() < 0.5 ? -1 : 1, x = mid(v) + side * half(v) * (1.5 + R() * 2.4), yy = y(v), s = 0.25 + v * 1.3;
          if(x < -30 || x > W + 30) continue; g.fillStyle = '#6B4424'; g.fillRect(x - 3 * s, yy - 14 * s, 6 * s, 14 * s); g.fillStyle = ['#2F8F46', '#3BA552', '#2C7E3F'][i % 3]; g.beginPath(); g.moveTo(x, yy - 52 * s); g.lineTo(x + 16 * s, yy - 12 * s); g.lineTo(x - 16 * s, yy - 12 * s); g.closePath(); g.fill(); }
        // the starting grid: white boxes painted on the near road
        const gv = 0.86, gy = y(gv), gm = mid(gv), gh = half(gv); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3;
        [-0.55, 0, 0.55].forEach(d => { const x = gm + d * gh; g.beginPath(); g.moveTo(x - gh * 0.18, gy); g.lineTo(x - gh * 0.18, gy + (H - gy) * 0.5); g.moveTo(x - gh * 0.18, gy); g.lineTo(x + gh * 0.18, gy); g.lineTo(x + gh * 0.18, gy + (H - gy) * 0.5); g.stroke(); });
      },
      live(g, W, H, t){
        const {hy, mid, half, y} = geo(W, H);
        cloud(g, ((t * 10) % (W + 260)) - 130, hy * 0.3, Math.min(W, H) / 700, 0.9); cloud(g, ((t * 6 + W * 0.6) % (W + 260)) - 130, hy * 0.55, Math.min(W, H) / 900, 0.7);
        // cars race AWAY up the road (near → far), looping, each in its lane — the ones past the START arch are drawn behind it
        const COLS = ['#FF5C5C', '#FFB23F', '#7C5CFF', '#2EC4B6'], cars = [];
        for(let i = 0; i < 4; i++){ const k = ((t * 0.16 + i * 0.25) % 1), v = 0.82 - k * 0.8, lane = [-0.45, 0.45, -0.15, 0.2][i], s = (0.15 + v * 1.6) * Math.min(W, H) / 480; if(v >= 0.03) cars.push({v, x: mid(v) + lane * half(v), s, i}); }
        cars.sort((a, b) => a.v - b.v); const AV = 0.74;
        cars.filter(c => c.v < AV).forEach(c => car(g, c.x, y(c.v), c.s, COLS[c.i], t, c.i));
        arch(g, W, H, t);
        cars.filter(c => c.v >= AV).forEach(c => car(g, c.x, y(c.v), c.s, COLS[c.i], t, c.i));
        // the chequered flags on the arch posts wave
        const av = 0.74, ay = y(av), am = mid(av), ah = half(av) * 1.25, ph = (H - hy) * 0.42, fw = ph * 0.22;
        [-1, 1].forEach(d => { const x0 = am + d * ah, y0 = ay - ph - 4; g.save(); g.beginPath(); for(let i = 0; i <= 8; i++){ const u = i / 8; g.lineTo(x0 + d * u * fw, y0 - fw * 0.55 + Math.sin(t * 7 + u * 5) * 4 * u); } for(let i = 8; i >= 0; i--){ const u = i / 8; g.lineTo(x0 + d * u * fw, y0 + Math.sin(t * 7 + u * 5) * 4 * u); } g.closePath(); g.fillStyle = '#FFFFFF'; g.fill(); g.clip();
          for(let a = 0; a < 6; a++) for(let b = 0; b < 3; b++) if((a + b) % 2){ g.fillStyle = '#1E1E28'; g.fillRect(x0 + d * a * fw / 6 - (d < 0 ? fw / 6 : 0), y0 - fw * 0.6 + b * fw * 0.22, fw / 6, fw * 0.22); } g.restore(); });
        // the start lights blink red → green
        const lit = Math.floor((t % 3) / 0.75); for(let i = 0; i < 3; i++){ g.fillStyle = lit === 3 ? '#4CD964' : i < lit ? '#FF3B30' : 'rgba(40,40,50,.8)'; g.beginPath(); g.arc(am - 18 + i * 18, ay - ph - (ph * 0.2) * 1.55, 6, 0, 7); g.fill(); }
      },
      spots(W, H){ const {mid, half, y} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), gv = 0.86, gy = y(gv), gm = mid(gv), gh = half(gv), fy = Math.min(H - 34 * k, gy + (H - gy) * 0.55), sp = Math.max(0.6 * gh, 132 * k);
        const inX = x => clamp(x, 64 * k, W - 64 * k);   // champions on the starting grid (P1 in the middle, the others beside it — on the kerb if the road is narrow)
        return [{x: inX(gm), y: fy, k}, {x: inX(gm - sp), y: fy, k: k * 0.95, from: -1}, {x: inX(gm + sp), y: fy, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER turbo END
  K.loaded('turbo', 'b6a');
})(window.GameCovers && window.GameCovers._K);
