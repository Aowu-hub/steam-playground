
/* 🎬 Cover_maze — 📏 b6a: the "maze" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER maze START — 🧭 Maze Explorer: a hedge maze at dawn seen from its entrance, a glowing treasure far away, a dotted trail
  (function(){
    const N = 7, M = 5, GW = 2 * N + 1, GH = 2 * M + 1;   // cells → block grid (walls + floor)
    let grid = null, path = null;
    function build(){
      if(grid) return; const R = rng(2026); grid = []; for(let y = 0; y < GH; y++){ grid.push(new Array(GW).fill(1)); }
      const seen = new Set(), st = [[3, M - 1]]; seen.add('3,' + (M - 1)); grid[2 * (M - 1) + 1][7] = 0;
      while(st.length){ const [cx, cy] = st[st.length - 1], nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy, dx, dy]).filter(([x, y]) => x >= 0 && y >= 0 && x < N && y < M && !seen.has(x + ',' + y));
        if(!nb.length){ st.pop(); continue; } const [nx, ny, dx, dy] = nb[Math.floor(R() * nb.length)]; seen.add(nx + ',' + ny);
        grid[2 * cy + 1 + dy][2 * cx + 1 + dx] = 0; grid[2 * ny + 1][2 * nx + 1] = 0; st.push([nx, ny]); }
      grid[GH - 1][7] = 0;   // the entrance (near, middle)
      // solution: entrance → the far middle cell (the treasure)
      const goal = [7, 1], key = p => p[0] + ',' + p[1], prev = {}, q = [[7, GH - 1]]; prev[key(q[0])] = null;
      while(q.length){ const p = q.shift(); if(p[0] === goal[0] && p[1] === goal[1]) break; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const n = [p[0] + dx, p[1] + dy]; if(n[0] < 0 || n[1] < 0 || n[0] >= GW || n[1] >= GH || grid[n[1]][n[0]] || key(n) in prev) return; prev[key(n)] = p; q.push(n); }); }
      path = []; let p = goal; while(p){ path.unshift(p); p = prev[key(p)]; }
    }
    const geo = (W, H) => { const hy = H * (W > H ? 0.36 : 0.4), P = persp(W, H, hy, W > H ? 1.25 : 1.9); return {hy, P, at: (bx, by, dz) => P((bx + 0.5) / GW, clamp((by + 0.5 + (dz || 0)) / GH, 0, 1))}; };
    add('maze', {
      still(g, W, H){
        build(); const {hy, P} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#6EC8F5'); gr.addColorStop(0.65, '#BDEBFF'); gr.addColorStop(1, '#FFE3B3'); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 2);
        g.fillStyle = 'rgba(255,214,120,.55)'; g.beginPath(); g.arc(W * 0.78, hy * 0.62, Math.min(W, H) * 0.09, 0, 7); g.fill();
        g.fillStyle = '#9BCB7E'; g.beginPath(); g.moveTo(0, hy); for(let x = 0; x <= W; x += W / 12) g.lineTo(x, hy - 10 - 16 * Math.abs(Math.sin(x / W * 7.3))); g.lineTo(W, hy); g.fill();
        g.fillStyle = '#7DB862'; g.beginPath(); g.moveTo(0, hy + 1); for(let x = 0; x <= W; x += W / 18) g.lineTo(x, hy - 4 - 7 * Math.abs(Math.sin(x / W * 13 + 1))); g.lineTo(W, hy + 1); g.fill();
        gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, '#CDB27A'); gr.addColorStop(1, '#E9D29A'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
        // hedge blocks, far → near: top face + front face + a few leaves
        const R = rng(11);
        for(let by = 0; by < GH; by++) for(let bx = 0; bx < GW; bx++){
          if(!grid[by][bx]) continue;
          const a = P(bx / GW, by / GH), b = P((bx + 1) / GW, by / GH), c = P((bx + 1) / GW, (by + 1) / GH), d = P(bx / GW, (by + 1) / GH), hh = 26 * c.s * (H / 420);
          const up = p => [p.x, p.y - hh * (p.s / c.s)];
          poly(g, [up(d), up(c), [c.x, c.y], [d.x, d.y]], shade('#2F8A3E', -0.15 + by / GH * 0.15));
          poly(g, [up(a), up(b), up(c), up(d)], shade('#4FB45A', -0.08 + by / GH * 0.18), 'rgba(20,70,30,.35)', 1);
          if(R() < 0.5){ const m = up({x: (a.x + c.x) / 2, y: (a.y + c.y) / 2, s: c.s}); g.fillStyle = 'rgba(190,240,170,.55)'; g.beginPath(); g.arc(m[0] + (R() - 0.5) * 8 * c.s, m[1], 2.2 * c.s * (H / 420) + 1, 0, 7); g.fill(); }
          if(R() < 0.08){ const m = up({x: (a.x + c.x) / 2, y: (a.y + c.y) / 2, s: c.s}); g.fillStyle = ['#FF7BA9', '#FFD84A', '#FFFFFF'][Math.floor(R() * 3)]; g.beginPath(); g.arc(m[0], m[1] - 1, 2.6 * c.s + 1, 0, 7); g.fill(); }
        }
        // the treasure chest far away
        const T = P((7 + 0.5) / GW, 1.5 / GH), s = T.s * (H / 420);
        g.fillStyle = 'rgba(255,230,120,.45)'; g.beginPath(); g.arc(T.x, T.y - 10 * s, 22 * s, 0, 7); g.fill();
        g.fillStyle = '#A0602A'; g.fillRect(T.x - 10 * s, T.y - 13 * s, 20 * s, 12 * s); g.fillStyle = '#C8843E'; g.fillRect(T.x - 10 * s, T.y - 17 * s, 20 * s, 5 * s);
        g.fillStyle = '#FFD84A'; g.fillRect(T.x - 1.5 * s, T.y - 14 * s, 3 * s, 5 * s);
      },
      live(g, W, H, t){
        build(); const {at} = geo(W, H);
        cloud(g, ((t * 9) % (W + 200)) - 100, H * 0.1, Math.min(W, H) / 700, 0.75); cloud(g, ((t * 5 + W * 0.6) % (W + 260)) - 130, H * 0.2, Math.min(W, H) / 900, 0.6);
        // the dotted trail runs from the entrance to the treasure
        const pts = path.map(p => at(p[0], p[1], 0)); g.save(); g.lineCap = 'round';
        for(let i = 0; i < pts.length - 1; i++){ const a = pts[i], b = pts[i + 1], sc = (a.s + b.s) / 2 * (H / 420); g.strokeStyle = 'rgba(255,138,61,.9)'; g.lineWidth = 3.2 * sc; g.setLineDash([2 * sc, 7 * sc]); g.lineDashOffset = -t * 18 * sc; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        g.restore();
        const T = at(7, 1, 0), s = T.s * (H / 420); for(let i = 0; i < 4; i++){ const a = t * 1.6 + i * 1.57; sparkle(g, T.x + Math.cos(a) * 18 * s, T.y - 14 * s + Math.sin(a) * 9 * s, (3 + Math.sin(t * 4 + i) * 1.5) * s + 1, 0.85); }
      },
      spots(W, H){ build(); const {at} = geo(W, H), cands = [];
        for(let by = GH - 4; by < GH; by++) for(let bx = 1; bx < GW - 1; bx++) if(!grid[by][bx]) cands.push(at(bx, by, 0));
        return pick3(cands, W, H, s => clamp(s * Math.min(H, W * 1.15) / 520, 0.4, 1.0)); }   /* b2fix: smaller on tall phones */
    });
  })();
  // 🎬 COVER maze END
  K.loaded('maze', 'b6a');
})(window.GameCovers && window.GameCovers._K);
