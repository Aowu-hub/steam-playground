
(function(root){
  'use strict';
  const C = {};
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rng = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const hx = h => { h = String(h || '#888888').replace('#', ''); if(h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0); };
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; };
  const shade = (c, t) => t >= 0 ? mix(c, '#FFFFFF', t) : mix(c, '#000000', -t);
  function poly(g, pts, fill, stroke, lw){ g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); if(fill){ g.fillStyle = fill; g.fill(); } if(stroke){ g.strokeStyle = stroke; g.lineWidth = lw || 1; g.stroke(); } }
  function sparkle(g, x, y, r, a, col){ g.save(); g.globalAlpha = a; g.fillStyle = col || '#FFF7C2'; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill(); g.restore(); }
  function cloud(g, x, y, s, a){ g.save(); g.globalAlpha = a; g.fillStyle = '#FFFFFF'; [[0, 0, 22], [24, -8, 26], [52, 0, 20], [26, 6, 22]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); g.fill(); }); g.restore(); }
  // ground perspective: u 0..1 across, v 0 (horizon) .. 1 (bottom edge) → screen
  function persp(W, H, hy, spread){ return (u, v) => { const s = lerp(0.42, 1, Math.pow(v, 0.9)), y = hy + (H - hy) * Math.pow(v, 1.15); return {x: W / 2 + (u - 0.5) * W * spread * s, y, s}; }; }

  // 🏆 3 champion spots from candidate floor points [{x, y, s}]: middle, left, right — inside the visible art, name tag on screen, not in the title corner
  function pick3(cands, W, H, kOf){
    const ok = c => { const k = kOf(c.s); return c.x - 62 * k > 4 && c.x + 62 * k < W - 4 && c.y < H - 34 * k && c.y > H * 0.45; };   /* b2fix: the whole avatar + pet inside */
    const L = cands.filter(ok), used = [];
    const near = fx => { let b = null, bd = 1e9; L.forEach(c => { if(used.includes(c)) return; const d = Math.abs(c.x - W * fx) + Math.abs(c.y - H * 0.84) * 0.35; if(d < bd){ bd = d; b = c; } }); if(b) used.push(b); return b || {x: W * fx, y: H * 0.8, s: 1}; };
    const W3 = W > H ? [0.5, 0.24, 0.76] : [0.5, 0.2, 0.8], a = near(W3[0]), b = near(W3[1]), c = near(W3[2]);
    return [{x: a.x, y: a.y, k: kOf(a.s)}, {x: b.x, y: b.y, k: kOf(b.s) * 0.95, from: -1}, {x: c.x, y: c.y, k: kOf(c.s) * 0.95, from: 1, dir: -1}];
  }
  function add(id, def){ C[id] = def; }
  const get = id => C[id] || C._default;
  function still(id, g, W, H, o){ try { get(id).still(g, W, H, o || {}); } catch(e){ C._default.still(g, W, H, o || {}); } }
  function live(id, g, W, H, t, o){ const d = get(id); if(d.live) try { d.live(g, W, H, t, o || {}); } catch(e){} }
  function spots(id, W, H){ try { return get(id).spots(W, H); } catch(e){ return C._default.spots(W, H); } }

  // 🎬 COVER _default START — a game with no block yet: its two colours, soft shapes, its icon, a hill to stand on
  add('_default', {
    still(g, W, H, o){
      const c1 = o.c1 || '#FF8A3D', c2 = o.c2 || '#7C3AED', gr = g.createLinearGradient(0, 0, W, H);
      gr.addColorStop(0, shade(c1, 0.15)); gr.addColorStop(1, shade(c2, -0.1)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const R = rng(7); for(let i = 0; i < 14; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.05 + R() * 0.08) + ')'; g.beginPath(); g.arc(R() * W, R() * H * 0.8, 20 + R() * Math.min(W, H) * 0.18, 0, 7); g.fill(); }
      if(o.icon){ g.save(); g.globalAlpha = 0.16; g.font = Math.round(Math.min(W, H) * 0.5) + 'px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.icon, W * 0.72, H * 0.42); g.restore(); }
      g.fillStyle = shade(c2, -0.25); g.beginPath(); g.moveTo(0, H); g.lineTo(0, H * 0.84); g.quadraticCurveTo(W * 0.5, H * 0.72, W, H * 0.84); g.lineTo(W, H); g.fill();
    },
    live(g, W, H, t){ for(let i = 0; i < 5; i++){ const x = ((i * 0.23 + t * 0.012) % 1) * W, y = H * (0.2 + 0.12 * Math.sin(t * 0.7 + i * 2)); sparkle(g, x, y, 4 + 2 * Math.sin(t * 3 + i), 0.35 + 0.25 * Math.sin(t * 2 + i)); } },
    spots(W, H){ const k = clamp(Math.min(H, W * 1.15) / 470, 0.4, 0.95);   /* b2fix */ return [{x: W * 0.5, y: H * 0.8, k}, {x: W * 0.3, y: H * 0.86, k: k * 0.92, from: -1}, {x: W * 0.7, y: H * 0.86, k: k * 0.92, from: 1, dir: -1}]; }
  });
  // 🎬 COVER _default END

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

  // 🎬 COVER chess START — ♟️ Chess: a giant board in a warm hall, big pieces standing on it, the knight hops its L
  (function(){
    const geo = (W, H) => { const hy = H * (W > H ? 0.42 : 0.46), P = persp(W, H, hy, W > H ? 1.5 : 2.3); return {hy, P, sq: (c, r) => P((c + 0.5) / 8, (r + 0.5) / 8)}; };
    const LIGHT = '#F6ECD6', DARK = '#3B2A4A';
    function piece(g, kind, x, y, s, col){
      const dark = col === DARK, fill = col, edge = dark ? '#1E1328' : '#B49A72', hi = dark ? '#6A5580' : '#FFFFFF';
      g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round';
      g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(0, 0, 26, 7, 0, 0, 7); g.fill();
      const base = () => { g.beginPath(); g.moveTo(-22, 0); g.lineTo(22, 0); g.lineTo(18, -10); g.lineTo(-18, -10); g.closePath(); };
      g.fillStyle = fill; g.strokeStyle = edge; g.lineWidth = 2.2;
      base(); g.fill(); g.stroke();
      if(kind === 'pawn'){ g.beginPath(); g.moveTo(-12, -10); g.quadraticCurveTo(-6, -30, -8, -38); g.lineTo(8, -38); g.quadraticCurveTo(6, -30, 12, -10); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.ellipse(0, -39, 12, 4, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(0, -52, 11, 0, 7); g.fill(); g.stroke(); }
      else if(kind === 'rook'){ g.beginPath(); g.moveTo(-14, -10); g.lineTo(-12, -52); g.lineTo(12, -52); g.lineTo(14, -10); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(-17, -52); g.lineTo(-17, -68); g.lineTo(-10, -68); g.lineTo(-10, -61); g.lineTo(-3, -61); g.lineTo(-3, -68); g.lineTo(3, -68); g.lineTo(3, -61); g.lineTo(10, -61); g.lineTo(10, -68); g.lineTo(17, -68); g.lineTo(17, -52); g.closePath(); g.fill(); g.stroke(); }
      else if(kind === 'king' || kind === 'queen'){ g.beginPath(); g.moveTo(-15, -10); g.quadraticCurveTo(-8, -40, -12, -64); g.lineTo(12, -64); g.quadraticCurveTo(8, -40, 15, -10); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.ellipse(0, -66, 16, 5, 0, 0, 7); g.fill(); g.stroke();
        if(kind === 'king'){ g.beginPath(); g.moveTo(-11, -68); g.quadraticCurveTo(0, -88, 11, -68); g.closePath(); g.fill(); g.stroke(); g.fillStyle = fill; g.fillRect(-3, -102, 6, 18); g.strokeRect(-3, -102, 6, 18); g.fillRect(-9, -96, 18, 6); g.strokeRect(-9, -96, 18, 6); }
        else { g.beginPath(); g.moveTo(-15, -68); [-15, -9, -4, 0, 4, 9, 15].forEach((px, i) => g.lineTo(px, i % 2 ? -88 : -76)); g.lineTo(15, -68); g.closePath(); g.fill(); g.stroke(); [-9, 0, 9].forEach(px => { g.beginPath(); g.arc(px, -90, 3.4, 0, 7); g.fill(); g.stroke(); }); } }
      else if(kind === 'knight'){ g.beginPath(); g.moveTo(-16, -10); g.lineTo(-14, -34); g.quadraticCurveTo(-18, -58, -2, -74); g.lineTo(2, -84); g.lineTo(8, -74); g.quadraticCurveTo(22, -66, 24, -48); g.lineTo(22, -40); g.lineTo(8, -46);
        g.quadraticCurveTo(4, -30, 16, -10); g.closePath(); g.fill(); g.stroke(); g.fillStyle = edge; g.beginPath(); g.arc(9, -60, 2.6, 0, 7); g.fill(); }
      g.globalAlpha = dark ? 0.35 : 0.6; g.strokeStyle = hi; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-8, -14); g.lineTo(-6, kind === 'pawn' ? -34 : -46); g.stroke();
      g.restore();
    }
    let hopT0 = 0;
    add('chess', {
      still(g, W, H, o){
        const {hy, P, sq} = geo(W, H), c1 = o.c1 || '#7C4DFF', c2 = o.c2 || '#3B2A4A';
        let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, shade(c2, -0.35)); gr.addColorStop(1, shade(c1, -0.05)); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 2);
        // tall windows of light in the hall
        for(let i = 0; i < 5; i++){ const x = W * (0.12 + i * 0.2), w = W * 0.07; gr = g.createLinearGradient(x, 0, x, hy); gr.addColorStop(0, 'rgba(255,236,190,.0)'); gr.addColorStop(1, 'rgba(255,236,190,.22)'); g.fillStyle = gr;
          g.beginPath(); g.moveTo(x, hy * 0.15); g.arc(x + w / 2, hy * 0.15, w / 2, Math.PI, 0); g.lineTo(x + w, hy); g.lineTo(x, hy); g.fill(); }
        g.fillStyle = shade(c2, -0.5); g.fillRect(0, hy - 6, W, 6);
        // the giant board
        for(let r = 0; r < 8; r++) for(let c = 0; c < 8; c++){ const a = P(c / 8, r / 8), b = P((c + 1) / 8, r / 8), cc = P((c + 1) / 8, (r + 1) / 8), d = P(c / 8, (r + 1) / 8);
          poly(g, [[a.x, a.y], [b.x, b.y], [cc.x, cc.y], [d.x, d.y]], (r + c) % 2 ? shade('#8A5A3C', -0.05 + r * 0.02) : shade('#F3DDB5', -0.06 + r * 0.01)); }
        gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, 'rgba(30,15,40,.55)'); gr.addColorStop(0.35, 'rgba(30,15,40,0)'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
        // the pieces (far → near), the knight hops in the live layer
        const sc = s => s * H / 300;
        [['rook', 0, 0, DARK], ['king', 4, 0, DARK], ['queen', 3, 1, DARK], ['pawn', 6, 1, DARK], ['pawn', 1, 2, DARK], ['queen', 5, 3, LIGHT], ['rook', 7, 4, LIGHT], ['king', 2, 4, LIGHT], ['pawn', 0, 5, LIGHT], ['pawn', 3, 5, LIGHT]]   /* b2fix: the front rows = the champions' stage */
          .forEach(([k, c, r, col]) => { const p = sq(c, r); piece(g, k, p.x, p.y, sc(p.s) * 0.55, col); });
      },
      live(g, W, H, t){
        const {sq} = geo(W, H), sc = s => s * H / 300;
        // ♞ the knight hops an L every 4 s: up, over, down (a 3-beat hop with a squash on landing)
        const cyc = 4, ph = (t % cyc) / cyc, from = Math.floor(t / cyc) % 2, A = from ? [6, 2] : [5, 4], B = from ? [5, 4] : [6, 2];   /* b2fix: hops behind the stage */
        let p, lift = 0, sq2 = 1;
        if(ph < 0.7){ p = sq(A[0], A[1]); if(ph > 0.55){ sq2 = 1 - 0.12 * Math.sin((ph - 0.55) / 0.15 * Math.PI); } }
        else if(ph < 0.88){ const q = (ph - 0.7) / 0.18, e = q < 0.5 ? 2 * q * q : 1 - 2 * (1 - q) * (1 - q), a = sq(A[0], A[1]), b = sq(B[0], B[1]); p = {x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), s: lerp(a.s, b.s, e)}; lift = Math.sin(q * Math.PI) * 60 * p.s * H / 420; }
        else { p = sq(B[0], B[1]); const q = (ph - 0.88) / 0.12; sq2 = 1 - 0.15 * Math.sin(q * Math.PI); }
        g.save(); g.translate(p.x, p.y - lift); g.scale(1 / sq2 * 0.98 + 0.02, sq2); piece(g, 'knight', 0, 0, sc(p.s) * 0.55, LIGHT); g.restore();
        for(let i = 0; i < 6; i++){ const x = ((i * 0.17 + t * 0.01) % 1) * W, y = H * (0.12 + 0.25 * ((i * 0.37) % 1)) + Math.sin(t + i) * 6; sparkle(g, x, y, 2.5 + 1.5 * Math.sin(t * 2.4 + i), 0.45, '#FFE9B8'); }
      },
      spots(W, H){ const {sq} = geo(W, H), cands = [], busy = {'0,5': 1, '3,5': 1};   // b2fix: the front rows are free (two pawns on row 5)
        for(let r = 6; r < 8; r++) for(let c = 0; c < 8; c++) if(!busy[c + ',' + r]) cands.push(sq(c, r));
        return pick3(cands, W, H, s => clamp(s * Math.min(H, W * 1.15) / 520, 0.4, 1.0)); }   /* b2fix */
    });
  })();
  // 🎬 COVER chess END

  // 🎬 COVER memory START — 🃏 Memories Match (🃏 Memories Match chat, mm-1): a big card table under a warm lamp at night, rows of face-down cards,
  // two matched pairs already glowing gold; every 4 s two cards flip up, match with a sparkle burst and turn back. Champions stand on the floor in front.
  (function(){
    const COLS = 6, ROWS = 4, SPR = {};
    const MATCHED = [[0, 3, '⭐'], [5, 3, '⭐'], [1, 0, '🦄'], [4, 1, '🦄']], FLIP = [[2, 2], [3, 1]], FLIP_FACES = ['🚀', '🐶', '🌈', '🐙'];
    function spr(ch, px){ px = Math.max(8, Math.round(px / 4) * 4); const k = ch + px; if(SPR[k]) return SPR[k];
      const c = document.createElement('canvas'); c.width = c.height = Math.ceil(px * 1.35); const g = c.getContext('2d');
      g.font = px + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText(ch, c.width / 2, c.height / 2 + px * 0.06);
      return (SPR[k] = c); }
    function geo(W, H){ const hy = H * 0.34, P = persp(W, H, hy, W > H ? 1.18 : 1.55); return {hy, P}; }
    function quad(P, c, r){ const cw = 0.84 / COLS, rh = 0.6 / ROWS, u0 = 0.08 + c * cw + cw * 0.09, u1 = u0 + cw * 0.82, v0 = 0.07 + r * rh + rh * 0.1, v1 = v0 + rh * 0.8;
      return [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]; }
    // one card on the table: q = 4 corners, sx = squeeze for the flip (1 = flat, 0 = edge on), face = emoji or null (back), gold = matched glow
    function card(g, q, sx, face, o, gold){
      const cx = (q[0].x + q[1].x + q[2].x + q[3].x) / 4, pts = q.map(p => [cx + (p.x - cx) * sx, p.y]);
      const h = Math.abs(q[3].y - q[0].y), r = Math.max(2, h * 0.12);
      g.save(); g.fillStyle = 'rgba(0,0,0,.28)'; poly(g, pts.map(p => [p[0] + h * 0.05, p[1] + h * 0.07]), 'rgba(0,0,0,.25)'); g.restore();
      if(face){
        poly(g, pts, gold ? '#FFF4C2' : '#FFFFFF', gold ? '#FFC845' : 'rgba(42,30,68,.35)', gold ? Math.max(2, h * 0.07) : 1);
        if(sx > 0.25){ const px = h * 0.6, sp = spr(face, px), dw = px * 1.35 * sx, dh = px * 1.35; g.drawImage(sp, cx - dw / 2, (q[0].y + q[3].y) / 2 - dh / 2, dw, dh); }
      } else {
        const gr = g.createLinearGradient(pts[0][0], pts[0][1], pts[2][0], pts[2][1]); gr.addColorStop(0, o.c1 || '#9B5DE5'); gr.addColorStop(1, o.c2 || '#F15BB5');
        poly(g, pts, gr, 'rgba(255,255,255,.55)', 1.2);
        const ins = pts.map(p => [cx + (p[0] - cx) * 0.74, (q[0].y + q[3].y) / 2 + (p[1] - (q[0].y + q[3].y) / 2) * 0.74]);
        g.save(); g.setLineDash([Math.max(2, h * 0.06), Math.max(2, h * 0.05)]); poly(g, ins, null, 'rgba(255,255,255,.6)', Math.max(1, h * 0.025)); g.restore();
      }
    }
    add('memory', {
      still(g, W, H, o){
        const {hy, P} = geo(W, H), c1 = o.c1 || '#9B5DE5', c2 = o.c2 || '#F15BB5';
        // the room at night + a warm lamp over the table (top right — the title corner stays calm)
        let gr = g.createLinearGradient(0, 0, 0, hy + 10); gr.addColorStop(0, '#1C1238'); gr.addColorStop(1, shade(c1, -0.45)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        const lx = W * 0.62, ly = H * 0.02, rg = g.createRadialGradient(lx, hy * 1.4, 10, lx, hy * 1.4, Math.max(W, H) * 0.75); rg.addColorStop(0, 'rgba(255,214,140,.42)'); rg.addColorStop(0.5, 'rgba(255,170,120,.12)'); rg.addColorStop(1, 'rgba(255,170,120,0)');
        g.fillStyle = rg; g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, ly + H * 0.07); g.stroke();
        poly(g, [[lx - W * 0.07, ly + H * 0.13], [lx + W * 0.07, ly + H * 0.13], [lx + W * 0.035, ly + H * 0.07], [lx - W * 0.035, ly + H * 0.07]], '#FFC845', '#2A1E44', 2);
        g.fillStyle = '#FFF4C2'; g.beginPath(); g.ellipse(lx, ly + H * 0.13, W * 0.05, H * 0.012, 0, 0, 7); g.fill();
        // floating cards in the dark (memories) — far right only
        const R = rng(31); for(let i = 0; i < 7; i++){ const x = W * (0.5 + R() * 0.48), y = H * (0.04 + R() * 0.24), s = 8 + R() * 14; g.save(); g.translate(x, y); g.rotate(R() * 1.2 - 0.6); g.globalAlpha = 0.18 + R() * 0.2;
          g.fillStyle = R() < 0.5 ? c1 : c2; g.fillRect(-s * 0.7, -s, s * 1.4, s * 2); g.restore(); }
        // the floor + the big table (felt top, wooden edge)
        gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, '#3A2456'); gr.addColorStop(1, '#5B3A2E'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
        const t0 = P(-0.02, 0), t1 = P(1.02, 0), t2 = P(1.02, 0.72), t3 = P(-0.02, 0.72), e2 = P(1.02, 0.78), e3 = P(-0.02, 0.78);
        poly(g, [[t3.x, t3.y], [t2.x, t2.y], [e2.x, e2.y], [e3.x, e3.y]], '#7A4A2A', '#3A2014', 2);
        gr = g.createLinearGradient(0, t0.y, 0, t3.y); gr.addColorStop(0, '#2C6E63'); gr.addColorStop(1, '#3FA08E'); poly(g, [[t0.x, t0.y], [t1.x, t1.y], [t2.x, t2.y], [t3.x, t3.y]], gr, '#1E4A42', 3);
        const lg = g.createRadialGradient(lx, (t0.y + t3.y) / 2, 10, lx, (t0.y + t3.y) / 2, W * 0.5); lg.addColorStop(0, 'rgba(255,236,190,.28)'); lg.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = lg; g.fillRect(0, t0.y, W, t3.y - t0.y);
        // rows of cards (far → near); matched pairs glow gold; the 2 flipping cards are drawn in the live layer
        for(let r = 0; r < ROWS; r++) for(let c = 0; c < COLS; c++){
          if(FLIP.some(f => f[0] === c && f[1] === r)) continue;
          const m = MATCHED.find(x => x[0] === c && x[1] === r); card(g, quad(P, c, r), 1, m ? m[2] : null, o, !!m);
        }
        // a soft shadow under the table edge onto the floor (the champions' stage)
        gr = g.createLinearGradient(0, e3.y, 0, e3.y + H * 0.06); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, e3.y, W, H * 0.06);
      },
      live(g, W, H, t, o){
        const {P} = geo(W, H), cyc = 4, ph = (t % cyc) / cyc, face = FLIP_FACES[Math.floor(t / cyc) % FLIP_FACES.length];
        // beats: A flips up (0–.12) · B flips up (.22–.34) · hold + sparkle (.38–.7) · both flip down (.74–.86)
        const flipAt = (a, b) => ph < a ? 1 : ph < b ? Math.cos((ph - a) / (b - a) * Math.PI) : -1;   // 1 = back, -1 = face
        const sA = ph < 0.74 ? flipAt(0, 0.12) : -flipAt(0.74, 0.86), sB = ph < 0.74 ? flipAt(0.22, 0.34) : -flipAt(0.74, 0.86);
        [[FLIP[0], sA], [FLIP[1], sB]].forEach(([f, s]) => { const q = quad(P, f[0], f[1]), lift = (1 - Math.abs(s)) * Math.abs(q[3].y - q[0].y) * 0.35;
          const qq = q.map(p => ({x: p.x, y: p.y - lift})); card(g, qq, Math.max(0.1, Math.abs(s)), s < 0 ? face : null, o, s < 0 && ph > 0.38 && ph < 0.74); });
        if(ph > 0.36 && ph < 0.72){ const k = (ph - 0.36) / 0.36; FLIP.forEach(f => { const q = quad(P, f[0], f[1]), cx = (q[0].x + q[1].x) / 2, cy = (q[0].y + q[3].y) / 2, h = Math.abs(q[3].y - q[0].y);
          for(let i = 0; i < 7; i++){ const a = i / 7 * 6.28 + k, d = h * (0.5 + k * 1.1); sparkle(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, h * 0.12 * (1 - k * 0.6), 0.9 * (1 - k), '#FFE58A'); } }); }
        for(let i = 0; i < 5; i++){ const x = W * (0.45 + ((i * 0.21 + t * 0.008) % 0.55)), y = H * (0.06 + 0.2 * ((i * 0.37) % 1)) + Math.sin(t + i) * 5; sparkle(g, x, y, 2 + 1.4 * Math.sin(t * 2.2 + i), 0.45, '#FFE9B8'); }
      },
      spots(W, H){ const {P} = geo(W, H), cands = []; for(let v = 0.84; v <= 0.97; v += 0.045) for(let u = 0.06; u <= 0.94; u += 0.055) cands.push(P(u, v));
        return pick3(cands, W, H, s => clamp(s * Math.min(H, W * 1.15) / 520, 0.4, 1.0)); }
    });
  })();
  // 🎬 COVER memory END

  root.GameCovers = {add, still, live, spots, has: id => !!C[id], ids: () => Object.keys(C).filter(k => k !== '_default'), VERSION: 'b1b'};
})(window);
