
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
  // 🎬 COVER hopper START — 🐸 Dodgy Hopper: lanes of grass, road and river seen from the start line; cars + trucks zoom, logs + lily pads drift, a frog hops, coins sparkle
  (function(){
    // bands from the horizon (v 0) to the near edge (v 1)
    const BANDS = [[0, 0.08, 'grass'], [0.08, 0.26, 'water'], [0.26, 0.33, 'grass'], [0.33, 0.52, 'road'], [0.52, 0.58, 'grass'], [0.58, 0.68, 'road1'], [0.68, 1.0, 'start']];
    const geo = (W, H) => { const hy = H * (W > H ? 0.34 : 0.4), P = persp(W, H, hy, W > H ? 1.35 : 2.0); return {hy, P}; };
    const sc = (p, H) => p.s * (H / 420);
    function band(g, P, v0, v1, fill){ const a = P(-1, v0), b = P(2, v0), c = P(2, v1), d = P(-1, v1); poly(g, [[a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y]], fill); }
    function car(g, x, y, s, col, dir, truck){
      const w = (truck ? 62 : 40) * s, h = 18 * s; g.save(); g.translate(x, y);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 1 * s, w * 0.55, 4 * s, 0, 0, 7); g.fill();
      g.fillStyle = '#2B2B35'; [-w * 0.32, w * 0.32].forEach(dx => { g.beginPath(); g.arc(dx, -2 * s, 5 * s, 0, 7); g.fill(); });
      g.fillStyle = col; g.beginPath(); g.roundRect(-w / 2, -h - 2 * s, w, h, 6 * s); g.fill();
      g.fillStyle = shade(col, -0.25); g.fillRect(-w / 2, -6 * s, w, 3 * s);
      if(truck){ g.fillStyle = shade(col, 0.35); g.beginPath(); g.roundRect(dir > 0 ? w * 0.12 : -w / 2 + 2 * s, -h - 8 * s, w * 0.36, 10 * s, 3 * s); g.fill(); }
      else { g.fillStyle = 'rgba(200,235,255,.95)'; g.beginPath(); g.roundRect(-w * 0.28, -h - 9 * s, w * 0.56, 10 * s, 4 * s); g.fill(); }
      g.fillStyle = '#FFF4B0'; g.beginPath(); g.arc(dir * w * 0.47, -h * 0.55 - 2 * s, 2.6 * s, 0, 7); g.fill();
      g.restore();
    }
    function log(g, x, y, s, len){ const w = len * s, h = 11 * s; g.save(); g.translate(x, y);
      g.fillStyle = 'rgba(20,60,110,.35)'; g.beginPath(); g.ellipse(0, 2 * s, w * 0.55, 4 * s, 0, 0, 7); g.fill();
      g.fillStyle = '#8A5A2B'; g.beginPath(); g.roundRect(-w / 2, -h, w, h, h / 2); g.fill();
      g.strokeStyle = 'rgba(60,30,10,.45)'; g.lineWidth = 1.4 * s; for(let i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(-w / 2 + h, -h * 0.5 + i * 1.6 * s); g.lineTo(w / 2 - h, -h * 0.5 + i * 1.6 * s); g.stroke(); }
      g.fillStyle = '#C89A5E'; g.beginPath(); g.ellipse(w / 2 - h / 3, -h / 2, h / 3, h / 2, 0, 0, 7); g.fill(); g.restore(); }
    function pad(g, x, y, s){ g.fillStyle = '#4CB85A'; g.beginPath(); g.ellipse(x, y, 11 * s, 4.5 * s, 0, 0.35, 6.0); g.lineTo(x, y); g.fill(); g.fillStyle = '#FF8FB8'; g.beginPath(); g.arc(x + 3 * s, y - 1.5 * s, 2 * s, 0, 7); g.fill(); }
    function frog(g, x, y, s, hop){ const up = Math.sin(hop * Math.PI) * 18 * s; g.save(); g.translate(x, y);
      g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 0, 9 * s * (1 - hop * 0.3), 3 * s, 0, 0, 7); g.fill(); g.translate(0, -up);
      const st = hop > 0 && hop < 1 ? 1.15 : 1; g.scale(1 / st, st);   // stretch in the air, squash on the ground
      g.fillStyle = '#3FBF55'; g.beginPath(); g.ellipse(0, -7 * s, 10 * s, 7 * s, 0, 0, 7); g.fill();
      g.fillStyle = '#2E9A44'; [-1, 1].forEach(k => { g.beginPath(); g.ellipse(k * 9 * s, -2 * s, 4 * s, 2.5 * s, 0, 0, 7); g.fill(); });
      [-1, 1].forEach(k => { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(k * 4.5 * s, -13 * s, 3.4 * s, 0, 7); g.fill(); g.fillStyle = '#1E1E28'; g.beginPath(); g.arc(k * 4.5 * s, -13.4 * s, 1.6 * s, 0, 7); g.fill(); });
      g.restore(); }
    add('hopper', {
      still(g, W, H){
        const {hy, P} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#7FD3FF'); gr.addColorStop(1, '#D8F4FF'); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 2);
        g.fillStyle = '#A8DB7A'; g.beginPath(); g.moveTo(0, hy + 1); for(let x = 0; x <= W; x += W / 10) g.lineTo(x, hy - 8 - 14 * Math.abs(Math.sin(x / W * 5.1))); g.lineTo(W, hy + 1); g.fill();
        { const R0 = rng(5); for(let i = 0; i < 9; i++){ const x = R0() * W, y = hy - 6 - R0() * 10, r = 7 + R0() * 9; g.fillStyle = '#5FAF55'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#4C9645'; g.beginPath(); g.arc(x + r * 0.35, y + r * 0.2, r * 0.7, 0, 7); g.fill(); } }
        BANDS.forEach(([v0, v1, k]) => {
          if(k === 'grass' || k === 'start') band(g, P, v0, v1, k === 'start' ? '#8FD86A' : '#7ACB5C');
          if(k === 'water'){ band(g, P, v0, v1, '#4FA8E8'); for(let i = 0; i < 3; i++) band(g, P, v0 + (v1 - v0) * (0.22 + i * 0.3), v0 + (v1 - v0) * (0.25 + i * 0.3), 'rgba(255,255,255,.18)'); }
          if(k === 'road' || k === 'road1'){ band(g, P, v0, v1, '#4A4E5C'); band(g, P, v0, v0 + 0.006, '#E9E2CF'); band(g, P, v1 - 0.006, v1, '#E9E2CF');
            if(k === 'road'){ const m = (v0 + v1) / 2; for(let u = -0.15; u < 1.15; u += 0.12){ const a = P(u, m - 0.004), b = P(u + 0.06, m - 0.004), c = P(u + 0.06, m + 0.004), d = P(u, m + 0.004); poly(g, [[a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y]], '#F2D45C'); } } }
        });
        // little blocks + flowers on the grass rows, a 🏁 start line near the front
        const R = rng(31);
        [[0.02, 0.07], [0.27, 0.32], [0.53, 0.57], [0.8, 1.0]].forEach(([v0, v1], bi) => { for(let i = 0; i < (bi === 3 ? 14 : 6); i++){ const p = P(R() * 1.1 - 0.05, v0 + R() * (v1 - v0)), s = sc(p, H);
          if(R() < 0.45){ g.fillStyle = '#3E9A4A'; g.beginPath(); g.arc(p.x, p.y - 8 * s, 9 * s, 0, 7); g.fill(); g.fillStyle = '#7A4E2A'; g.fillRect(p.x - 2 * s, p.y - 2 * s, 4 * s, 5 * s); }
          else { g.fillStyle = ['#FFFFFF', '#FFD84A', '#FF7BA9'][Math.floor(R() * 3)]; g.beginPath(); g.arc(p.x, p.y - 2 * s, 2.4 * s + 0.6, 0, 7); g.fill(); } } });
        for(let row = 0; row < 2; row++) for(let i = 0; i < 40; i++){ const u = i * 0.05 - 0.5, v = 0.705 + row * 0.014, a = P(u, v), b = P(u + 0.05, v), c = P(u + 0.05, v + 0.014), d = P(u, v + 0.014); poly(g, [[a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y]], (i + row) % 2 ? '#2B2B35' : '#FFFFFF'); }
      },
      live(g, W, H, t){
        const {P} = geo(W, H);
        cloud(g, ((t * 8) % (W + 220)) - 110, H * 0.08, Math.min(W, H) / 760, 0.8);
        // river: logs + lily pads drift (one row each way)
        [[0.13, 1, 0.06, 70], [0.21, -1, 0.045, 52]].forEach(([v, dir, sp, len], li) => { for(let i = 0; i < 4; i++){ const u = ((i * 0.37 + li * 0.2 + dir * t * sp) % 1.4 + 1.4) % 1.4 - 0.2, p = P(u, v), s = sc(p, H);
          if(li === 1 && i % 2) pad(g, p.x, p.y, s); else log(g, p.x, p.y, s, len); } });
        // roads: cars + trucks
        const COLS = ['#FF5C5C', '#FFB23F', '#7C5CFF', '#2EC4B6', '#FF7BA9'];
        [[0.39, 1, 0.09], [0.49, -1, 0.07], [0.655, 1, 0.12]].forEach(([v, dir, sp], li) => { for(let i = 0; i < 3; i++){ const u = ((i * 0.47 + li * 0.13 + dir * t * sp) % 1.5 + 1.5) % 1.5 - 0.25, p = P(u, v), s = sc(p, H);
          car(g, p.x, p.y, s, COLS[(i + li * 2) % COLS.length], dir, (i + li) % 3 === 2); } });
        // the frog hops lane by lane across the grass row in the middle
        const cyc = (t % 6) / 6, hopN = Math.floor(cyc * 6), hop = (cyc * 6) % 1, fu = 0.18 + (hopN + Math.min(1, hop / 0.5)) * 0.1, fp = P(fu, 0.31);
        frog(g, fp.x, fp.y, sc(fp, H), hop < 0.5 ? hop / 0.5 : 0);
        // coins on the far grass
        for(let i = 0; i < 3; i++){ const p = P(0.25 + i * 0.25, 0.05 + (i % 2) * 0.02), s = sc(p, H), w = Math.abs(Math.cos(t * 2.4 + i)) * 6 * s + 1;
          g.fillStyle = '#FFCF3F'; g.beginPath(); g.ellipse(p.x, p.y - 9 * s, w, 6 * s, 0, 0, 7); g.fill(); sparkle(g, p.x + 5 * s, p.y - 15 * s, 2.5 * s + 1, 0.5 + 0.4 * Math.sin(t * 4 + i)); }
      },
      spots(W, H){ const {P} = geo(W, H), cands = [];
        for(let v = 0.84; v <= 0.99; v += 0.03) for(let u = 0.05; u <= 0.95; u += 0.05) cands.push(P(u, v));
        return pick3(cands, W, H, s => clamp(s * Math.min(H, W * 1.15) / 520, 0.4, 1.0)); }
    });
  })();
  // 🎬 COVER hopper END
  // 🎬 COVER robot-adventure START — 🤖 Code the Robot: a big tile floor in a tech lab, a trail of arrow blocks, a little robot steps along them to a glowing ⭐ goal
  (function(){
    const N = 7, PATH = [[1, 4], [1, 3], [2, 3], [3, 3], [3, 2], [4, 2], [4, 1], [5, 1], [5, 0]];   // [col, row] — row 0 = far; rows 5–6 = the champions' stage
    const BLOCKS = [[2, 4], [4, 3], [0, 2], [6, 3], [2, 1]], LAVA = [[5, 2], [0, 4]];
    const geo = (W, H) => { const hy = H * (W > H ? 0.36 : 0.4), P = persp(W, H, hy, W > H ? 1.25 : 1.9); return {hy, P, cell: (c, r, du, dv) => P((c + (du == null ? 0.5 : du)) / N, (r + (dv == null ? 0.5 : dv)) / N)}; };
    const sc = (p, H) => p.s * (H / 420);
    function robot(g, x, y, s, t, hop, face){
      const up = Math.sin(hop * Math.PI) * 14 * s; g.save(); g.translate(x, y);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 0, 16 * s * (1 - hop * 0.25), 5 * s, 0, 0, 7); g.fill();
      g.translate(0, -up); const sq = hop > 0.05 && hop < 0.95 ? 1.08 : 1; g.scale(1 / sq, sq);
      g.fillStyle = '#5A6378'; [-1, 1].forEach(k => { g.beginPath(); g.roundRect(k * 8 * s - 4 * s, -9 * s, 8 * s, 9 * s, 2 * s); g.fill(); });   // legs
      g.fillStyle = '#E9EEF6'; g.strokeStyle = '#3B4A66'; g.lineWidth = 2 * s; g.beginPath(); g.roundRect(-15 * s, -34 * s, 30 * s, 26 * s, 7 * s); g.fill(); g.stroke();   // body
      g.fillStyle = '#4FD1A5'; g.beginPath(); g.arc(0, -21 * s, 4.5 * s, 0, 7); g.fill();   // chest light
      g.fillStyle = 'rgba(79,209,165,' + (0.35 + 0.35 * Math.sin(t * 6)) + ')'; g.beginPath(); g.arc(0, -21 * s, 8 * s, 0, 7); g.fill();
      g.fillStyle = '#E9EEF6'; g.beginPath(); g.roundRect(-13 * s, -56 * s, 26 * s, 20 * s, 8 * s); g.fill(); g.stroke();   // head
      g.fillStyle = '#26324A'; g.beginPath(); g.roundRect(-10 * s, -52 * s, 20 * s, 12 * s, 5 * s); g.fill();   // visor
      const blink = (t % 3.2) < 0.12 ? 0.25 : 1; g.fillStyle = '#7FF2FF'; [-1, 1].forEach(k => { g.beginPath(); g.ellipse(k * 4.5 * s + face * 1.5 * s, -46 * s, 2.6 * s, 2.6 * s * blink, 0, 0, 7); g.fill(); });
      g.strokeStyle = '#3B4A66'; g.beginPath(); g.moveTo(0, -56 * s); g.lineTo(0, -64 * s); g.stroke(); g.fillStyle = '#FF5C7A'; g.beginPath(); g.arc(0, -66 * s, 3.2 * s, 0, 7); g.fill();   // antenna
      g.fillStyle = '#5A6378'; [-1, 1].forEach(k => { g.beginPath(); g.roundRect(k * 17 * s - 3 * s, -31 * s + Math.sin(t * 5 + k) * 1.5 * s, 6 * s, 16 * s, 3 * s); g.fill(); });   // arms
      g.restore();
    }
    function arrowChip(g, p, dir, s, lit){ g.save(); g.translate(p.x, p.y); g.scale(1, 0.55);
      g.fillStyle = lit ? '#FFD84A' : '#7C5CFF'; g.beginPath(); g.roundRect(-12 * s, -12 * s, 24 * s, 24 * s, 6 * s); g.fill();
      g.rotate([-Math.PI / 2, 0, Math.PI / 2, Math.PI][dir]); g.fillStyle = lit ? '#5A3A00' : '#FFFFFF'; g.beginPath(); g.moveTo(8 * s, 0); g.lineTo(-3 * s, -7 * s); g.lineTo(-3 * s, -3 * s); g.lineTo(-8 * s, -3 * s); g.lineTo(-8 * s, 3 * s); g.lineTo(-3 * s, 3 * s); g.lineTo(-3 * s, 7 * s); g.closePath(); g.fill(); g.restore(); }
    const dirOf = (a, b) => b[1] < a[1] ? 0 : b[0] > a[0] ? 1 : b[1] > a[1] ? 2 : 3;
    add('robot-adventure', {
      still(g, W, H){
        const {hy, P, cell} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#2B2F6B'); gr.addColorStop(1, '#5B4FB8'); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 2);
        // the lab wall: panels, pipes, screens
        g.strokeStyle = 'rgba(160,190,255,.16)'; g.lineWidth = 1; for(let x = 0; x < W; x += 46){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, hy); g.stroke(); } for(let y = 20; y < hy; y += 46){ g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        const R = rng(17), NS = W > H ? 4 : 2; for(let i = 0; i < NS; i++){ const w = 44 + 26 * R(), h = 30 + 14 * R(), x = W * (0.52 + 0.44 * i / NS), y = hy * (i % 2 ? 0.42 : 0.24);
          g.fillStyle = '#1A1E44'; g.beginPath(); g.roundRect(x, y, w, h, 6); g.fill(); g.strokeStyle = '#7C9CFF'; g.lineWidth = 2; g.stroke();
          g.strokeStyle = '#4FD1A5'; g.lineWidth = 2; g.beginPath(); for(let k = 0; k <= 8; k++) g.lineTo(x + 6 + k * (w - 12) / 8, y + h / 2 + Math.sin(k * 1.3 + i) * h * 0.25); g.stroke(); }
        g.fillStyle = '#3E4A7A'; g.fillRect(0, hy - 18, W, 18); g.fillStyle = '#FFD84A'; for(let x = -10; x < W; x += 28){ g.beginPath(); g.moveTo(x, hy); g.lineTo(x + 12, hy - 18); g.lineTo(x + 22, hy - 18); g.lineTo(x + 10, hy); g.fill(); }
        gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, '#9AA6C8'); gr.addColorStop(1, '#C9D2EA'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
        // tiles (wider than the 7×7 board so the floor reaches the edges)
        for(let r = 0; r < N; r++) for(let c = -6; c < N + 6; c++){
          const a = P(c / N, r / N), b = P((c + 1) / N, r / N), cc = P((c + 1) / N, (r + 1) / N), d = P(c / N, (r + 1) / N), on = c >= 0 && c < N;
          const lava = LAVA.some(([x, y]) => x === c && y === r);
          poly(g, [[a.x, a.y], [b.x, b.y], [cc.x, cc.y], [d.x, d.y]], lava ? '#FF7A3D' : on ? ((c + r) % 2 ? '#E7ECF8' : '#D3DBF0') : ((c + r) % 2 ? '#B9C3E0' : '#AEB8D6'), 'rgba(60,80,130,.35)', 1);
          if(on && r >= N - 2){ g.fillStyle = 'rgba(79,209,165,.16)'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(cc.x, cc.y); g.lineTo(d.x, d.y); g.fill(); }
          if(lava){ g.fillStyle = 'rgba(255,214,90,.7)'; const m = cell(c, r); g.beginPath(); g.ellipse(m.x, m.y, 10 * sc(m, H), 3.5 * sc(m, H), 0, 0, 7); g.fill(); }
        }
        // crates on some tiles
        BLOCKS.forEach(([c, r]) => { const m = cell(c, r), s = sc(m, H), w = 30 * s, h = 26 * s;
          g.fillStyle = '#B07A3E'; g.fillRect(m.x - w / 2, m.y - h, w, h); g.fillStyle = '#D29A58'; g.fillRect(m.x - w / 2, m.y - h - 7 * s, w, 7 * s);
          g.strokeStyle = '#7A4E22'; g.lineWidth = 2 * s; g.strokeRect(m.x - w / 2, m.y - h, w, h); g.beginPath(); g.moveTo(m.x - w / 2, m.y - h); g.lineTo(m.x + w / 2, m.y); g.stroke(); });
      },
      live(g, W, H, t){
        const {cell} = geo(W, H), STEP = 0.7, n = PATH.length, cyc = t % ((n + 2) * STEP), k = Math.min(n - 1, Math.floor(cyc / STEP)), f = cyc / STEP - k;
        // the code trail: arrow chips light up as the robot passes
        for(let i = 0; i < n - 1; i++){ const m = cell(PATH[i][0], PATH[i][1]); arrowChip(g, m, dirOf(PATH[i], PATH[i + 1]), sc(m, H), i < k); }
        // the goal star at the end
        const G = cell(PATH[n - 1][0], PATH[n - 1][1]), gs = sc(G, H), got = k >= n - 1;
        g.fillStyle = 'rgba(255,230,120,' + (0.35 + 0.2 * Math.sin(t * 4)) + ')'; g.beginPath(); g.arc(G.x, G.y - 10 * gs, (got ? 28 : 18) * gs, 0, 7); g.fill();
        if(!got){ g.save(); g.translate(G.x, G.y - 16 * gs - Math.sin(t * 3) * 3 * gs); g.rotate(t * 0.8); g.fillStyle = '#FFD84A'; g.beginPath(); for(let i = 0; i < 10; i++){ const a = i * Math.PI / 5 - Math.PI / 2, r = (i % 2 ? 5 : 12) * gs; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.restore(); }
        else for(let i = 0; i < 6; i++){ const a = t * 2 + i * 1.05; sparkle(g, G.x + Math.cos(a) * 22 * gs, G.y - 30 * gs + Math.sin(a) * 12 * gs, 4 * gs + 1, 0.9); }
        // the robot: hop from tile k to k+1 (ready → squash → hop → land)
        const A = cell(PATH[k][0], PATH[k][1]), B = cell(PATH[Math.min(n - 1, k + 1)][0], PATH[Math.min(n - 1, k + 1)][1]), mv = k < n - 1 ? clamp((f - 0.25) / 0.6, 0, 1) : 0, e = mv * mv * (3 - 2 * mv);
        const x = lerp(A.x, B.x, e), y = lerp(A.y, B.y, e), s = lerp(sc(A, H), sc(B, H), e), face = k < n - 1 ? (B.x > A.x + 1 ? 1 : B.x < A.x - 1 ? -1 : 0) : 0;
        robot(g, x, y, s * 1.15, t, mv > 0 && mv < 1 ? mv : 0, face);
      },
      spots(W, H){ const {cell} = geo(W, H), cands = [], busy = PATH.concat(BLOCKS, LAVA);
        for(let r = N - 2; r < N; r++) for(let c = -3; c < N + 3; c++) if(!busy.some(([x, y]) => x === c && y === r)) cands.push(cell(c, r));
        return pick3(cands, W, H, s => clamp(s * Math.min(H, W * 1.15) / 520, 0.4, 1.0)); }
    });
  })();
  // 🎬 COVER robot-adventure END
  // 🎬 COVER stacking-sim START — 📦 Stack It!: a tall wobbly tower of shaped boxes on a platform, a 🏁 line above it, a crane swings the next box in
  (function(){
    const COLS = ['#FF6B6B', '#FFB23F', '#4FD1A5', '#5AA9FF', '#B57CFF', '#FF7BA9'];
    // the tower: [shape, w, h, dx] from the bottom up (units of the platform width ≈ 1)
    const TOWER = [['box', 0.62, 0.22, 0], ['box', 0.48, 0.2, -0.04], ['box', 0.36, 0.26, 0.05], ['round', 0.42, 0.2, -0.02], ['tri', 0.3, 0.18, 0.02]];
    const geo = (W, H) => { const gy = H * (W > H ? 0.8 : 0.78), u = Math.min(W * (W > H ? 0.24 : 0.46), H * 0.32), cx = W * (W > H ? 0.5 : 0.48); return {gy, u, cx}; };
    function shape(g, kind, w, h, col){
      g.fillStyle = col; g.strokeStyle = shade(col, -0.35); g.lineWidth = Math.max(1.5, w * 0.03); g.lineJoin = 'round'; g.beginPath();
      if(kind === 'box') g.roundRect(-w / 2, -h, w, h, h * 0.15);
      if(kind === 'tri'){ g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.lineTo(0, -h); g.closePath(); }
      if(kind === 'round'){ g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.lineTo(w / 2, -h * 0.4); g.quadraticCurveTo(w / 2, -h, 0, -h); g.quadraticCurveTo(-w / 2, -h, -w / 2, -h * 0.4); g.closePath(); }
      if(kind === 'star'){ for(let i = 0; i < 10; i++){ const a = i * Math.PI / 5 - Math.PI / 2, r = (i % 2 ? 0.22 : 0.5) * Math.min(w, h * 2); g.lineTo(Math.cos(a) * r, -h / 2 + Math.sin(a) * r); } g.closePath(); }
      g.fill(); g.stroke();
      // a happy face on each piece
      const fy = kind === 'star' ? -h / 2 : kind === 'tri' ? -h * 0.32 : -h * 0.5, e = Math.max(1.5, Math.min(w, h) * 0.07);
      g.fillStyle = '#2A1E3A'; [-1, 1].forEach(k => { g.beginPath(); g.arc(k * e * 2.2, fy - e * 0.6, e, 0, 7); g.fill(); });
      g.strokeStyle = '#2A1E3A'; g.lineWidth = Math.max(1, e * 0.7); g.beginPath(); g.arc(0, fy + e * 0.2, e * 1.6, 0.2, Math.PI - 0.2); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(-w / 2 + w * 0.1, -h + h * 0.12, w * 0.18, h * 0.12);
    }
    add('stacking-sim', {
      still(g, W, H){
        const {gy, u, cx} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, gy); gr.addColorStop(0, '#FFB7A0'); gr.addColorStop(0.55, '#FFE1B8'); gr.addColorStop(1, '#FFF4DC'); g.fillStyle = gr; g.fillRect(0, 0, W, gy);
        g.fillStyle = 'rgba(255,240,200,.8)'; g.beginPath(); g.arc(W * 0.16, gy * 0.42, Math.min(W, H) * 0.08, 0, 7); g.fill();
        // far city blocks in a soft colour
        const R = rng(23); for(let x = -10; x < W; ){ const w = 30 + R() * 60, h = gy * (0.12 + R() * 0.22); g.fillStyle = 'rgba(200,120,140,' + (0.18 + R() * 0.12) + ')'; g.fillRect(x, gy - h, w, h); x += w + 6; }
        // ground + the platform
        gr = g.createLinearGradient(0, gy, 0, H); gr.addColorStop(0, '#9ED36A'); gr.addColorStop(1, '#7FBF55'); g.fillStyle = gr; g.fillRect(0, gy, W, H - gy);
        g.fillStyle = '#6E7B91'; g.beginPath(); g.roundRect(cx - u * 0.42, gy - u * 0.08, u * 0.84, u * 0.1, u * 0.02); g.fill(); g.fillStyle = '#4E596C'; g.fillRect(cx - u * 0.36, gy + u * 0.02, u * 0.72, u * 0.05);
        // the crane (right side): mast + jib
        const mx = cx + u * (W > H ? 1.25 : 0.82), top = gy - u * 2.15;
        g.strokeStyle = '#E8A21E'; g.lineWidth = Math.max(3, u * 0.03); for(let y = gy; y > top; y -= u * 0.12){ g.beginPath(); g.moveTo(mx - u * 0.05, y); g.lineTo(mx + u * 0.05, y - u * 0.12); g.moveTo(mx + u * 0.05, y); g.lineTo(mx - u * 0.05, y - u * 0.12); g.stroke(); }
        g.fillStyle = '#F2B632'; g.fillRect(mx - u * 0.06, top, u * 0.12, gy - top); g.fillRect(cx - u * 0.35, top - u * 0.06, mx - cx + u * 0.55, u * 0.08);
        g.fillStyle = '#C27A12'; g.fillRect(mx + u * 0.08, top - u * 0.02, u * 0.16, u * 0.14); g.fillStyle = '#9FD8FF'; g.fillRect(mx - u * 0.04, top + u * 0.08, u * 0.1, u * 0.08);
        // the 🏁 line high above the tower
        const fy = gy - u * 1.72; g.setLineDash([u * 0.05, u * 0.04]); g.strokeStyle = 'rgba(42,30,58,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - u * 0.8, fy); g.lineTo(cx + u * 0.6, fy); g.stroke(); g.setLineDash([]);
        for(let i = 0; i < 6; i++) for(let j = 0; j < 2; j++){ g.fillStyle = (i + j) % 2 ? '#2A1E3A' : '#FFFFFF'; g.fillRect(cx - u * 0.8 + i * u * 0.035, fy - u * 0.1 + j * u * 0.035, u * 0.035, u * 0.035); }
        g.fillStyle = '#2A1E3A'; g.fillRect(cx - u * 0.8 - 2, fy - u * 0.1, 3, u * 0.12);
      },
      live(g, W, H, t){
        const {gy, u, cx} = geo(W, H), sway = Math.sin(t * 1.3) * 0.022;
        // the tower sways from its base (each piece a bit more)
        g.save(); g.translate(cx, gy - u * 0.08); let y = 0;
        TOWER.forEach(([k, w, h, dx], i) => { g.save(); g.rotate(sway * (i + 1) * 0.35); g.translate(dx * u + sway * u * i * 0.6, -y); shape(g, k, w * u, h * u, COLS[i % COLS.length]); g.restore(); y += h * u * 0.98; });
        g.restore();
        // the crane hook swings, lowers a box, then rises again (a 6 s loop)
        const top = gy - u * 2.15, c = (t % 6) / 6, low = c < 0.5 ? c / 0.5 : 1 - (c - 0.5) / 0.5, e = low * low * (3 - 2 * low), hx = cx + u * 0.12 + Math.sin(t * 1.7) * u * 0.06, hy = top + u * 0.1 + e * u * 0.32;
        g.strokeStyle = '#3A3A48'; g.lineWidth = Math.max(1.5, u * 0.012); g.beginPath(); g.moveTo(cx + u * 0.12, top + u * 0.02); g.lineTo(hx, hy); g.stroke();
        g.save(); g.translate(hx, hy + u * 0.2); g.rotate(Math.sin(t * 1.7) * 0.12); shape(g, 'star', u * 0.3, u * 0.2, '#FFD84A'); g.restore();
        for(let i = 0; i < 3; i++) sparkle(g, cx - u * 0.6 + i * u * 0.45, gy - u * 1.72 - u * 0.12 + Math.sin(t * 2 + i) * 4, u * 0.02 + 2, 0.5 + 0.4 * Math.sin(t * 3 + i));
      },
      spots(W, H){ const {gy, u, cx} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), fy = Math.min(H - 36 * k, gy + (H - gy) * 0.86), sy = gy + (H - gy) * 0.45;
        const inX = x => clamp(x, 64 * k, W - 64 * k);   // the middle champion stands in front of the platform, the others either side of the tower
        return [{x: inX(cx), y: fy, k}, {x: inX(cx - u * 0.82), y: sy, k: k * 0.95, from: -1}, {x: inX(cx + u * 0.82), y: sy, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER stacking-sim END

  root.GameCovers = {add, still, live, spots, has: id => !!C[id], ids: () => Object.keys(C).filter(k => k !== '_default'), VERSION: 'b1b'};
})(window);
