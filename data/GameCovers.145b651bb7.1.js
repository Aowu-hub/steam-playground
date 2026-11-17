
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
  // 🏷️ 24j-e: the logo spot of the cover being drawn (set by still / live / spots from GameFrame) — main pieces keep clear of it
  let Z = null;
  function away(x, y, w, h, W, H, opt){
    opt = opt || {}; if(!Z) return {x, y, s: 1};
    const m = Math.max(8, Math.min(W, H) * 0.025), z = {l: Z.x - m, t: Z.y - m, r: Z.x + Z.w + m, b: Z.y + Z.h + m};
    const hit = (cx, cy, cw, ch) => !(cx >= z.r || cx + cw <= z.l || cy >= z.b || cy + ch <= z.t);
    if(!hit(x, y, w, h)) return {x, y, s: 1};
    const top = H * (opt.top || 0.1), bot = Math.min(H * (opt.bot || 0.94), Z.floor > H * 0.4 ? Z.floor : H), L = 4, R = W - 4, C = [];
    const add = (cx, cy, cs) => { if(cs <= 0.2) return; cs = Math.min(1, cs); cx = clamp(cx, L, Math.max(L, R - w * cs)); if(opt.only !== 'x') cy = clamp(cy, top, Math.max(top, bot - h * cs));
      C.push({x: cx, y: cy, s: cs, d: Math.abs(cx - x) + Math.abs(cy - y), clear: !hit(cx, cy, w * cs, h * cs)}); };
    add(z.r, y + h * (1 - Math.min(1, (R - z.r) / w)) / 2, (R - z.r) / w);                               // → right of the logo
    add(z.l - w * Math.min(1, (z.l - L) / w), y + h * (1 - Math.min(1, (z.l - L) / w)) / 2, (z.l - L) / w);   // ← left of it
    { const sB = (y + h - z.b) / h; if(sB > 0) add(x + w * (1 - Math.min(1, sB)) / 2, z.b, sB); }                     // ⇣ shrink in place, standing on its own ground
    if(opt.only !== 'x'){
      const sD = Math.min((bot - z.b) / h, (R - L) / w); add(x + w * (1 - Math.min(1, sD)) / 2, z.b, sD);     // ↓ under it
      const sU = (z.t - top) / h; add(x + w * (1 - Math.min(1, sU)) / 2, z.t - h * Math.min(1, sU), sU);      // ↑ above it
    }
    const good = C.filter(c => c.clear && c.s >= (opt.min || 0.55)), list = good.length ? good : C.filter(c => c.clear);
    const best = (list.length ? list : C).sort((a, b) => (b.s - a.s) > 0.04 || (b.s - a.s) < -0.04 ? b.s - a.s : a.d - b.d)[0];
    return best ? {x: best.x, y: best.y, s: best.s} : {x, y, s: 1};
  }
  function add(id, def){ C[id] = def; }
  const get = id => C[id] || C._default;
  const zoneOf = z => z && z.w > 0 && z.h > 0 ? z : null;   /* 🏷️ 24j-e */
  function still(id, g, W, H, o){ Z = zoneOf(o && o.logo); try { get(id).still(g, W, H, o || {}); } catch(e){ C._default.still(g, W, H, o || {}); } }
  function live(id, g, W, H, t, o){ Z = zoneOf(o && o.logo); const d = get(id); if(d.live) try { d.live(g, W, H, t, o || {}); } catch(e){} }
  function spots(id, W, H, zone){ Z = zoneOf(zone); try { return get(id).spots(W, H); } catch(e){ return C._default.spots(W, H); } }

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
  // 🎬 COVER pinball START — 🎯 Pinball: a glowing tilted table in a dark arcade — bumpers flash when the ball hits, flippers flick, a backbox scoreboard blinks
  (function(){
    const geo = (W, H) => { const wide = W > H, tw = Math.min(W * (wide ? 0.42 : 0.74), H * 0.95), cx = W / 2, top = H * (wide ? 0.2 : 0.22), bot = H * (wide ? 0.82 : 0.72);
      // the table: a trapezoid (narrower at the far end) — tp(u, v): u 0..1 across, v 0 = far end, 1 = flippers
      const tp = (u, v) => { const w = tw * (0.62 + 0.38 * v); return {x: cx + (u - 0.5) * w, y: top + (bot - top) * v, s: 0.62 + 0.38 * v}; };
      return {wide, tw, cx, top, bot, tp}; };
    const BUMP = [[0.32, 0.3, '#FF4FA0'], [0.66, 0.28, '#4FD1FF'], [0.5, 0.46, '#FFD84A']];
    function ballAt(t){ // a looping path: launch up the right lane, bounce round the bumpers, down to the flippers
      const k = (t % 4.8) / 4.8, P = [[0.9, 0.95], [0.9, 0.2], [0.72, 0.1], [0.62, 0.24], [0.4, 0.22], [0.36, 0.38], [0.56, 0.5], [0.46, 0.66], [0.58, 0.84], [0.5, 0.9], [0.9, 0.95]];
      const f = k * (P.length - 1), i = Math.floor(f), e = f - i, a = P[i], b = P[Math.min(P.length - 1, i + 1)]; return [lerp(a[0], b[0], e), lerp(a[1], b[1], e)]; }
    add('pinball', {
      still(g, W, H){
        const {cx, top, bot, tp, tw} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#120A2E'); gr.addColorStop(1, '#2A1250'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        // arcade glow: neon strips + other machines in the dark
        const R = rng(9); for(let i = 0; i < 7; i++){ const x = R() * W, h = H * (0.25 + R() * 0.25), w = 40 + R() * 50; if(Math.abs(x - cx) < tw * 0.6) continue;
          g.fillStyle = 'rgba(70,40,130,.55)'; g.fillRect(x - w / 2, H * 0.62 - h, w, h); g.fillStyle = ['#FF4FA0', '#4FD1FF', '#FFD84A'][i % 3]; g.globalAlpha = 0.5; g.fillRect(x - w / 2 + 6, H * 0.62 - h + 8, w - 12, 10); g.globalAlpha = 1; }
        g.fillStyle = '#1B0F38'; g.fillRect(0, H * 0.62, W, H * 0.38); g.strokeStyle = 'rgba(255,79,160,.25)'; g.lineWidth = 1;
        for(let y = H * 0.66; y < H; y += 22){ g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        // the backbox at the far end
        const bx0 = tp(0.08, 0).x, bx1 = tp(0.92, 0).x, bh = (bot - top) * 0.2;
        g.fillStyle = '#30185E'; g.beginPath(); g.roundRect(bx0, top - bh - 6, bx1 - bx0, bh, 10); g.fill(); g.strokeStyle = '#FFD84A'; g.lineWidth = 3; g.stroke();
        g.fillStyle = '#0B0620'; g.fillRect(bx0 + 10, top - bh + 4, bx1 - bx0 - 20, bh - 20);
        // the table bed
        const c = [tp(0, 0), tp(1, 0), tp(1, 1), tp(0, 1)];
        g.save(); g.shadowColor = 'rgba(124,92,255,.8)'; g.shadowBlur = 24; poly(g, c.map(p => [p.x, p.y]), '#3B1C7A'); g.restore();
        gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, '#5B2BB0'); gr.addColorStop(1, '#2B1468'); poly(g, [tp(0.04, 0.02), tp(0.96, 0.02), tp(0.96, 0.99), tp(0.04, 0.99)].map(p => [p.x, p.y]), gr);
        // lanes + rollover lights at the top, the launch lane on the right, slingshots above the flippers
        g.strokeStyle = '#E9E2FF'; g.lineWidth = 3; [[0.82, 0.1, 0.82, 0.98]].forEach(([u0, v0, u1, v1]) => { const a = tp(u0, v0), b = tp(u1, v1); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); });
        [[0.12, 0.62, 0.24, 0.78, 0.14, 0.82], [0.7, 0.62, 0.58, 0.78, 0.68, 0.82]].forEach(t => { const a = tp(t[0], t[1]), b = tp(t[2], t[3]), d = tp(t[4], t[5]); poly(g, [[a.x, a.y], [b.x, b.y], [d.x, d.y]], '#FF7A3D', '#FFFFFF', 2); });
        for(let i = 0; i < 3; i++){ const p = tp(0.3 + i * 0.16, 0.1); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(p.x, p.y, 5 * p.s * tw / 300, 0, 7); g.fill(); }
        // the floor stage in front (champions stand here)
        g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, bot + 4, W, H - bot);
      },
      live(g, W, H, t){
        const {top, bot, tp, tw} = geo(W, H), u = tw / 300, [bu, bv] = ballAt(t), B = tp(bu, bv);
        // backbox: blinking score dots
        const bx0 = tp(0.08, 0).x, bx1 = tp(0.92, 0).x, bh = (bot - top) * 0.2, n = 18;
        for(let i = 0; i < n; i++){ const on = Math.sin(t * 6 + i * 0.7) > 0.2; g.fillStyle = on ? '#FFD84A' : 'rgba(255,216,74,.15)'; g.beginPath(); g.arc(bx0 + 18 + i * (bx1 - bx0 - 36) / (n - 1), top - bh / 2 - 4, 2.6 * u + 0.8, 0, 7); g.fill(); }
        // bumpers flash when the ball is near
        BUMP.forEach(([bu0, bv0, col], i) => { const p = tp(bu0, bv0), r = 20 * p.s * u, near = Math.hypot(bu - bu0, bv - bv0) < 0.1, pulse = near ? 1 : 0.35 + 0.15 * Math.sin(t * 3 + i);
          g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(p.x, p.y + r * 0.35, r, r * 0.45, 0, 0, 7); g.fill();
          g.save(); g.shadowColor = col; g.shadowBlur = near ? 26 : 8; g.fillStyle = col; g.beginPath(); g.ellipse(p.x, p.y, r, r * 0.62, 0, 0, 7); g.fill(); g.restore();
          g.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.5 * pulse) + ')'; g.beginPath(); g.ellipse(p.x, p.y - r * 0.12, r * 0.55, r * 0.32, 0, 0, 7); g.fill();
          if(near) for(let k = 0; k < 5; k++) sparkle(g, p.x + Math.cos(k * 1.26 + t * 5) * r * 1.4, p.y + Math.sin(k * 1.26 + t * 5) * r * 0.9, 3 * u + 1, 0.9); });
        // rollover lights blink in turn
        for(let i = 0; i < 3; i++){ const p = tp(0.3 + i * 0.16, 0.1); if(Math.floor(t * 2) % 3 === i){ g.fillStyle = '#7FF2FF'; g.beginPath(); g.arc(p.x, p.y, 5 * p.s * u + 0.5, 0, 7); g.fill(); } }
        // flippers: flick up when the ball comes down to them
        const fl = (side) => { const up = bv > 0.82 && (side < 0 ? bu < 0.55 : bu >= 0.45) ? 1 : 0, piv = tp(side < 0 ? 0.3 : 0.7, 0.9), len = 52 * piv.s * u, ang = side < 0 ? (up ? -0.45 : 0.42) : Math.PI + (up ? 0.45 : -0.42);
          g.save(); g.translate(piv.x, piv.y); g.rotate(ang); g.fillStyle = '#FFFFFF'; g.strokeStyle = '#FF4FA0'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -6 * u); g.lineTo(len, -2.5 * u); g.lineTo(len, 2.5 * u); g.lineTo(0, 6 * u); g.closePath(); g.fill(); g.stroke(); g.restore(); };
        fl(-1); fl(1);
        // the ball + its trail
        for(let k = 4; k >= 1; k--){ const [tu, tv] = ballAt(t - k * 0.03), q = tp(tu, tv); g.fillStyle = 'rgba(200,220,255,' + (0.08 * (5 - k)) + ')'; g.beginPath(); g.arc(q.x, q.y, 7 * q.s * u, 0, 7); g.fill(); }
        const rg = g.createRadialGradient(B.x - 3 * u, B.y - 3 * u, 1, B.x, B.y, 8 * B.s * u + 2); rg.addColorStop(0, '#FFFFFF'); rg.addColorStop(0.5, '#C9D2DC'); rg.addColorStop(1, '#3E4558');
        g.fillStyle = rg; g.beginPath(); g.arc(B.x, B.y, 8 * B.s * u + 1, 0, 7); g.fill();
      },
      spots(W, H){ const {cx, bot, tw, wide} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), fy = Math.min(H - 36 * k, bot + (H - bot) * 0.8), side = tw * (wide ? 0.62 : 0.36);
        const inX = x => clamp(x, 64 * k, W - 64 * k);   // champions stand on the arcade floor: one in front of the flippers, the others either side of the machine
        return [{x: inX(cx), y: H - 36 * k, k: k * 0.95}, {x: inX(cx - side), y: fy, k: k * 0.92, from: -1}, {x: inX(cx + side), y: fy, k: k * 0.92, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER pinball END
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

  // 🎬 COVER alignext START — 🔴 Alignext: an upright 7 × 6 frame on a fairground stage at sunset, discs drop in and bounce; four in a row light up + confetti
  (function(){
    const RED = '#E63946', YEL = '#FFC21A', BLUE = '#2F6BD8';
    const GRID = ['.......', '.......', '.......', '....ry.', '..yryr.', 'yrryry.'];   // the pile before the drop (top → bottom)
    const geo = (W, H) => { const wide = W > H; let fw = Math.min(W * (wide ? 0.4 : 0.66), H * (wide ? 0.6 : 0.44)), fx = W / 2 - fw / 2 + (wide ? W * 0.06 : 0), fy = H * (wide ? 0.22 : 0.31);
      { const F = away(fx, fy - fw / 7 * 0.6, fw, fw / 7 * 7.15, W, H); fw *= F.s; fx = F.x; fy = F.y + fw / 7 * 0.6; }   /* 🏷️ 24j-e: frame + falling disc keep clear of the logo */
      const cell = fw / 7, fh = cell * 6, sy = fy + fh + cell * 0.55;
      return {fw, cell, fh, fx, fy, sy, at: (c, r) => ({x: fx + (c + 0.5) * cell, y: fy + (r + 0.5) * cell})}; };
    function disc(g, x, y, r, col, glow){
      if(glow){ g.save(); g.shadowColor = '#FFF4A3'; g.shadowBlur = r * 1.2; }
      g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); if(glow) g.restore();
      g.strokeStyle = shade(col, -0.22); g.lineWidth = Math.max(1, r * 0.12); g.beginPath(); g.arc(x, y, r * 0.66, 0, 7); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.4, r * 0.28, r * 0.15, -0.6, 0, 7); g.fill();
    }
    add('alignext', {
      still(g, W, H){
        const {fw, cell, fh, fx, fy, sy} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, sy); gr.addColorStop(0, '#5B3A8E'); gr.addColorStop(0.55, '#E86A6A'); gr.addColorStop(1, '#FFC36B'); g.fillStyle = gr; g.fillRect(0, 0, W, sy);
        // fairground silhouettes: a big wheel + tents
        const wx = W * 0.14, wy = sy - H * 0.2, wr = Math.min(W, H) * 0.17; g.strokeStyle = 'rgba(70,30,90,.45)'; g.lineWidth = 3; g.beginPath(); g.arc(wx, wy, wr, 0, 7); g.stroke();
        for(let i = 0; i < 10; i++){ const a = i / 10 * 7; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); g.stroke(); }
        g.beginPath(); g.moveTo(wx - wr * 0.5, sy); g.lineTo(wx, wy); g.lineTo(wx + wr * 0.5, sy); g.stroke();
        [[0.86, 0.11], [0.72, 0.08]].forEach(([u, h]) => { const x = W * u, w = Math.min(W, H) * 0.16, t = sy - H * h - w * 0.4; g.fillStyle = 'rgba(70,30,90,.42)'; g.beginPath(); g.moveTo(x - w / 2, sy); g.lineTo(x - w / 2, t + w * 0.4); g.lineTo(x, t); g.lineTo(x + w / 2, t + w * 0.4); g.lineTo(x + w / 2, sy); g.fill(); });
        // the stage
        gr = g.createLinearGradient(0, sy, 0, H); gr.addColorStop(0, '#B5653A'); gr.addColorStop(1, '#7E3F22'); g.fillStyle = gr; g.fillRect(0, sy, W, H - sy);
        g.strokeStyle = 'rgba(60,25,10,.35)'; g.lineWidth = 1.5; for(let i = 1; i < 6; i++){ const y = sy + (H - sy) * (i / 6) ** 1.3; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        g.fillStyle = '#FFD84A'; for(let x = cell * 0.4; x < W; x += cell * 0.9){ g.beginPath(); g.arc(x, sy + 3, 3.5, 0, 7); g.fill(); }
        // the frame: legs, a blue board with 42 holes
        g.fillStyle = shade(BLUE, -0.35); g.fillRect(fx - cell * 0.35, fy + fh * 0.4, cell * 0.22, sy - fy - fh * 0.4); g.fillRect(fx + fw + cell * 0.13, fy + fh * 0.4, cell * 0.22, sy - fy - fh * 0.4);
        g.fillStyle = shade(BLUE, -0.35); g.fillRect(fx - cell * 0.55, sy - cell * 0.18, cell * 0.62, cell * 0.18); g.fillRect(fx + fw - cell * 0.07, sy - cell * 0.18, cell * 0.62, cell * 0.18);
      },
      live(g, W, H, t){
        const {fw, cell, fh, fx, fy, at} = geo(W, H), R = cell * 0.38;
        // 7 s loop: red drops into column 5 (lands on row 2) → the diagonal (2,5)(3,4)(4,3)(5,2) — four reds light up → confetti
        const cyc = 7, ph = (t % cyc) / cyc, dropC = 5, landR = 2;
        GRID.forEach((row, r) => row.split('').forEach((ch, c) => { if(ch === 'r' || ch === 'y'){ const p = at(c, r), win = ph > 0.48 && ch === 'r' && c + r === 7 && c >= 2 && c <= 4; disc(g, p.x, p.y, R, ch === 'r' ? RED : YEL, win && Math.sin(t * 9) > -0.3); } }));
        // the falling disc (squash on landing)
        let y, sq = 1; const top = fy - cell * 0.9, land = at(dropC, landR).y;
        if(ph < 0.12){ y = top - (0.12 - ph) * cell * 4; }
        else if(ph < 0.3){ const q = (ph - 0.12) / 0.18; y = lerp(top, land, q * q); }
        else { y = land; if(ph < 0.36) sq = 1 - 0.18 * Math.sin((ph - 0.3) / 0.06 * Math.PI); }
        g.save(); g.beginPath(); g.rect(fx - cell, 0, fw + cell * 2, fy + fh); g.clip(); g.translate(at(dropC, 0).x, y); g.scale(1 + (1 - sq) * 0.7, sq); disc(g, 0, 0, R, RED, ph > 0.48 && Math.sin(t * 9) > -0.3); g.restore();
        // the blue board in front of the discs, holes cut out
        g.save(); g.fillStyle = BLUE; g.beginPath(); g.roundRect(fx - cell * 0.1, fy - cell * 0.1, fw + cell * 0.2, fh + cell * 0.2, cell * 0.25);
        for(let r = 0; r < 6; r++) for(let c = 0; c < 7; c++){ const p = at(c, r); g.moveTo(p.x + R * 1.08, p.y); g.arc(p.x, p.y, R * 1.08, 0, 7, true); }
        g.fill('evenodd'); g.strokeStyle = shade(BLUE, -0.3); g.lineWidth = Math.max(2, cell * 0.06); g.stroke(); g.restore();
        g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(fx, fy - cell * 0.05, fw, cell * 0.08);
        if(ph > 0.48){ const a = at(2, 5), b = at(5, 2), on = 0.6 + 0.4 * Math.sin(t * 9); g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(255,244,163,' + (on * 0.75) + ')'; g.lineWidth = cell * 0.11; g.shadowColor = '#FFF4A3'; g.shadowBlur = cell * 0.5;
          g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.restore(); [[2, 5], [3, 4], [4, 3], [5, 2]].forEach(([c, r]) => { const p = at(c, r); g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(2, cell * 0.07); g.beginPath(); g.arc(p.x, p.y, R * 1.05, 0, 7); g.stroke(); }); }
        if(ph > 0.48){ const q = (ph - 0.48) / 0.52, C = ['#FF4D8D', '#FFC21A', '#4FD1A5', '#5AA9FF', '#FFFFFF']; for(let i = 0; i < 26; i++){ const a = i * 2.4, sp = 0.4 + (i % 5) * 0.15, x = W / 2 + Math.cos(a) * fw * sp * q * 1.1, yy = fy + fh * 0.4 + Math.sin(a) * fh * 0.4 * q + q * q * H * 0.25;
          g.save(); g.globalAlpha = 1 - q; g.translate(x, yy); g.rotate(a + t * 4); g.fillStyle = C[i % 5]; g.fillRect(-cell * 0.08, -cell * 0.04, cell * 0.16, cell * 0.08); g.restore(); } }
        for(let i = 0; i < 5; i++) sparkle(g, W * (0.08 + i * 0.21), H * 0.08 + Math.sin(t + i) * 5, 3, 0.4 + 0.3 * Math.sin(t * 2 + i));
      },
      spots(W, H){ const {sy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 36 * k, sy + (H - sy) * 0.72);
        const W3 = W > H ? [0.5, 0.22, 0.78] : [0.5, 0.18, 0.82], X = f => clamp(W * f, 64 * k, W - 64 * k);
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 6 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 6 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER alignext END
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
  // 🎬 COVER checkers START — 🔴 Checkers: a giant board laid out on a sunny park lawn, red + black discs on it; a red disc jumps a black one (poof!) and lands on the far row → 👑 crowned
  (function(){
    const RED = '#E2554F', BLK = '#2B2B3A';
    const geo = (W, H) => { const hy = H * (W > H ? 0.34 : 0.4), P = persp(W, H, hy, W > H ? 1.55 : 1.3);
      const sq = (c, r, du, dv) => P(0.12 + (c + (du == null ? 0.5 : du)) / 8 * 0.76, 0.03 + (r + (dv == null ? 0.5 : dv)) / 8 * 0.56); return {hy, P, sq}; };
    const rad = (sq, c, r) => (sq(c, r, 1, 0.5).x - sq(c, r, 0, 0.5).x) * 0.36;
    function disc(g, x, y, r, col, crown){
      const h = r * 0.32; g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(x + r * 0.08, y + h * 0.6, r * 1.05, r * 0.5, 0, 0, 7); g.fill();
      g.fillStyle = shade(col, -0.35); g.beginPath(); g.ellipse(x, y, r, r * 0.48, 0, 0, Math.PI); g.lineTo(x - r, y - h); g.ellipse(x, y - h, r, r * 0.48, 0, Math.PI, 0, true); g.closePath(); g.fill();
      g.fillStyle = col; g.beginPath(); g.ellipse(x, y - h, r, r * 0.48, 0, 0, 7); g.fill();
      g.strokeStyle = shade(col, col === BLK ? 0.25 : -0.18); g.lineWidth = Math.max(1, r * 0.08); g.beginPath(); g.ellipse(x, y - h, r * 0.68, r * 0.32, 0, 0, 7); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.ellipse(x - r * 0.35, y - h - r * 0.14, r * 0.28, r * 0.1, -0.3, 0, 7); g.fill();
      if(crown){ const c = r * 0.72, cy = y - h - r * 0.45; poly(g, [[x - c, cy + c * 0.3], [x - c, cy - c * 0.45], [x - c * 0.5, cy - c * 0.05], [x, cy - c * 0.7], [x + c * 0.5, cy - c * 0.05], [x + c, cy - c * 0.45], [x + c, cy + c * 0.3]], '#FFD84A', '#B8860B', Math.max(1, r * 0.06)); }
    }
    const PIECES = [[1, 0, BLK], [3, 0, BLK], [7, 0, BLK], [0, 1, BLK], [4, 1, BLK], [6, 1, BLK], [5, 2, BLK], [2, 3, BLK], [0, 5, RED], [4, 5, RED], [6, 5, RED], [1, 6, RED], [5, 6, RED], [0, 7, RED], [4, 7, RED], [6, 7, RED]];
    add('checkers', {
      still(g, W, H){
        const {hy, P} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#7FC8F8'); gr.addColorStop(1, '#D8F1FF'); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 1);
        cloud(g, W * 0.62, hy * 0.28, Math.min(W, H) / 420, 0.9); cloud(g, W * 0.12, hy * 0.5, Math.min(W, H) / 520, 0.75);
        // far trees + a park path
        const R = rng(7); for(let x = -20; x < W + 20; x += 26 + R() * 30){ const r = 18 + R() * 26; g.fillStyle = shade('#3E9A50', -0.1 + R() * 0.2); g.beginPath(); g.arc(x, hy - r * 0.55, r, 0, 7); g.fill(); }
        gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, '#8ED36B'); gr.addColorStop(1, '#5DB352'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
        for(let i = 0; i < 160; i++){ const x = R() * W, y = hy + R() * (H - hy); g.strokeStyle = 'rgba(40,110,40,' + (0.2 + R() * 0.25) + ')'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 3, y - 3 - R() * 5); g.stroke(); }
        // the board: a thick wooden edge, then 8×8
        const a = P(0.1, 0.015), b = P(0.9, 0.015), c = P(0.9, 0.605), d = P(0.1, 0.605);
        poly(g, [[d.x, d.y], [c.x, c.y], [c.x, c.y + 10 * c.s], [d.x, d.y + 10 * d.s]], '#7A4A2A');
        poly(g, [[a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y]], '#A8683C');
        for(let r = 0; r < 8; r++) for(let col = 0; col < 8; col++){ const {sq} = geo(W, H), p1 = sq(col, r, 0, 0), p2 = sq(col, r, 1, 0), p3 = sq(col, r, 1, 1), p4 = sq(col, r, 0, 1);
          poly(g, [[p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y], [p4.x, p4.y]], (r + col) % 2 ? shade('#B23A3A', r * 0.015) : shade('#F5E6C8', -r * 0.01)); }
        // 🧺 a picnic basket at the side
        const pb = P(W > H ? 0.95 : 1.02, 0.78), s = pb.s * Math.min(W, H) / 380; g.fillStyle = '#C98B4A'; g.beginPath(); g.roundRect(pb.x - 30 * s, pb.y - 28 * s, 60 * s, 30 * s, 6 * s); g.fill();
        g.strokeStyle = '#8C5A2B'; g.lineWidth = 3 * s; g.beginPath(); g.arc(pb.x, pb.y - 28 * s, 22 * s, Math.PI, 0); g.stroke(); g.fillStyle = '#E2554F'; g.fillRect(pb.x - 30 * s, pb.y - 28 * s, 60 * s, 7 * s);
      },
      live(g, W, H, t){
        const {sq} = geo(W, H);
        // a 6 s loop: a black disc winds up → hops over the red one at (2, 5) → poof → slides to the near row (2, 7) → 👑 crowned, big and close
        const cyc = 6, ph = (t % cyc) / cyc, jumped = ph > 0.38, crowned = ph > 0.8;
        let c, r, lift = 0, sqz = 1;
        if(ph < 0.22){ c = 1; r = 4; if(ph > 0.14) sqz = 1 - 0.2 * Math.sin((ph - 0.14) / 0.08 * Math.PI); }
        else if(ph < 0.38){ const q = (ph - 0.22) / 0.16, e = q * q * (3 - 2 * q); c = lerp(1, 3, e); r = lerp(4, 6, e); lift = Math.sin(q * Math.PI) * rad(sq, 2, 5) * 3; }
        else if(ph < 0.5){ c = 3; r = 6; sqz = 1 - 0.16 * Math.sin((ph - 0.38) / 0.12 * Math.PI); }
        else if(ph < 0.76){ const q = (ph - 0.5) / 0.26, e = q * q * (3 - 2 * q); c = lerp(3, 2, e); r = lerp(6, 7, e); }
        else { c = 2; r = 7; if(ph < 0.86) sqz = 1 - 0.12 * Math.sin((ph - 0.8) / 0.06 * Math.PI); }
        const list = PIECES.map(p => p.concat([false, 0, 1])); if(!jumped) list.push([2, 5, RED, false, 0, 1]); list.push([c, r, BLK, crowned, lift, sqz, 1]);
        list.sort((a, b) => a[1] - b[1]).forEach(([c, r, col, crown, lift, sqz]) => { const p = sq(c, r); g.save(); g.translate(p.x, p.y - (lift || 0)); g.scale(1 + (1 - sqz) * 0.6, sqz); disc(g, 0, 0, rad(sq, c, r), col, crown); g.restore(); });
        if(ph > 0.36 && ph < 0.54){ const p = sq(2, 5), q = (ph - 0.36) / 0.18, R = rad(sq, 2, 5); g.save(); g.globalAlpha = 1 - q;
          for(let i = 0; i < 9; i++){ const a = i / 9 * 7; g.fillStyle = i % 2 ? '#FFFFFF' : '#FFD9D6'; g.beginPath(); g.arc(p.x + Math.cos(a) * R * (0.5 + q * 1.8), p.y - R * 0.4 + Math.sin(a) * R * (0.3 + q), R * (0.38 - q * 0.22), 0, 7); g.fill(); } g.restore(); }
        if(crowned){ const p = sq(2, 7), R = rad(sq, 2, 7), q = Math.min(1, (ph - 0.8) / 0.08); for(let i = 0; i < 6; i++) sparkle(g, p.x + Math.cos(i * 1.05 + t * 2) * R * 1.7, p.y - R * (1.3 + 0.5 * Math.sin(i + t * 3)), R * 0.22, q * 0.9, '#FFE38A'); }
      },
      spots(W, H){ const {P} = geo(W, H), cands = []; for(let i = 0; i <= 12; i++) for(const v of [0.78, 0.86, 0.94]) cands.push(P(0.08 + i / 12 * 0.84, v));
        return pick3(cands, W, H, s => clamp(s * Math.min(H, W * 1.15) / 520, 0.4, 1.0)); }
    });
  })();
  // 🎬 COVER checkers END
  // 🎬 COVER double-up START — ⬆️ Double Up: a sunny farmyard, a red barn behind a wooden crate board of number tiles; two 8s slide together and merge into 16 (pop!), a hen + chicks wander past
  (function(){
    const TC = {2: '#9CA3AF', 4: '#F59E0B', 8: '#F28C28', 16: '#E11D48', 32: '#C026D3', 64: '#7C3AED', 128: '#2563EB'};
    const BOARD = [[2, 0, 4, 64], [8, 0, 0, 8], [4, 32, 2, 0], [128, 2, 0, 0]];   // swipe ← : the 8 at (3, 1) slides into the 8 at (0, 1) → 16
    const geo = (W, H) => { const wide = W > H; let bw = Math.min(W * (wide ? 0.42 : 0.62), H * (wide ? 0.6 : 0.42)), bx = W / 2 - bw / 2 + (wide ? W * 0.06 : 0), by = H * (wide ? 0.22 : 0.3);
      { const F = away(bx - bw * 0.06, by - bw * 0.06, bw * 1.12, bw * 1.15, W, H); bw *= F.s; bx = F.x + bw * 0.06; by = F.y + bw * 0.06; }   /* 🏷️ 24j-e */
      const cell = bw / 4, gy = by + bw + cell * 0.3;
      return {wide, bw, cell, bx, by, gy, at: (c, r) => ({x: bx + (c + 0.5) * cell, y: by + (r + 0.5) * cell})}; };
    function tile(g, x, y, s, n, sc){
      g.save(); g.translate(x, y); g.scale(sc || 1, sc || 1);
      const c = TC[n] || '#2A1E3A'; g.fillStyle = shade(c, -0.25); g.beginPath(); g.roundRect(-s * 0.44, -s * 0.4, s * 0.88, s * 0.88, s * 0.16); g.fill();
      g.fillStyle = c; g.beginPath(); g.roundRect(-s * 0.44, -s * 0.44, s * 0.88, s * 0.84, s * 0.16); g.fill();
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.roundRect(-s * 0.36, -s * 0.38, s * 0.5, s * 0.12, s * 0.06); g.fill();
      g.fillStyle = '#FFFFFF'; g.font = '900 ' + Math.round(s * (String(n).length > 2 ? 0.34 : 0.44)) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 0, s * 0.01);
      g.restore();
    }
    function hen(g, x, y, s, step, chick){
      g.save(); g.translate(x, y); g.scale(s, s);
      const body = chick ? '#FFE066' : '#FFFFFF', leg = '#F28C28';
      g.strokeStyle = leg; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-4, 0); g.lineTo(-4 + step * 3, 10); g.moveTo(4, 0); g.lineTo(4 - step * 3, 10); g.stroke();
      g.fillStyle = body; g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; g.beginPath(); g.ellipse(0, -6, 13, 10, 0, 0, 7); g.fill(); g.stroke();
      g.beginPath(); g.arc(10, -15, 7, 0, 7); g.fill(); g.stroke();
      if(!chick){ g.fillStyle = '#E2554F'; g.beginPath(); g.arc(9, -22, 2.6, 0, 7); g.arc(12, -21.5, 2.4, 0, 7); g.fill(); g.beginPath(); g.ellipse(14, -10, 2, 3, 0, 0, 7); g.fill(); }
      g.fillStyle = '#F28C28'; g.beginPath(); g.moveTo(16, -16); g.lineTo(21, -14); g.lineTo(16, -12); g.fill();
      g.fillStyle = '#2A1E3A'; g.beginPath(); g.arc(12, -16, 1.4, 0, 7); g.fill();
      g.fillStyle = shade(body, -0.1); g.beginPath(); g.ellipse(-2, -6, 7, 5, 0.3, 0, 7); g.fill();
      g.restore();
    }
    add('double-up', {
      still(g, W, H){
        const {bw, cell, bx, by, gy} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, gy); gr.addColorStop(0, '#8FD3FF'); gr.addColorStop(1, '#E6F7FF'); g.fillStyle = gr; g.fillRect(0, 0, W, gy);
        cloud(g, W * 0.1, H * 0.14, Math.min(W, H) / 470, 0.9); cloud(g, W * 0.7, H * 0.07, Math.min(W, H) / 560, 0.75);
        // the barn behind the board (left) + a fence
        const bh = Math.min(W, H) * 0.34, bx0 = W * (W > H ? 0.04 : -0.06), bwid = bh * 0.95, by0 = gy - bh;
        g.fillStyle = '#C8372D'; g.fillRect(bx0, by0 + bh * 0.32, bwid, bh * 0.68); poly(g, [[bx0 - bwid * 0.06, by0 + bh * 0.34], [bx0 + bwid / 2, by0], [bx0 + bwid * 1.06, by0 + bh * 0.34]], '#8E2620');
        g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.strokeRect(bx0 + bwid * 0.3, by0 + bh * 0.55, bwid * 0.4, bh * 0.45); g.beginPath(); g.moveTo(bx0 + bwid * 0.3, by0 + bh * 0.55); g.lineTo(bx0 + bwid * 0.7, gy); g.moveTo(bx0 + bwid * 0.7, by0 + bh * 0.55); g.lineTo(bx0 + bwid * 0.3, gy); g.stroke();
        g.fillStyle = '#FFF4D6'; g.beginPath(); g.arc(bx0 + bwid / 2, by0 + bh * 0.3, bh * 0.07, 0, 7); g.fill();
        g.strokeStyle = '#D9B98A'; g.lineWidth = 4; for(let x = 0; x < W; x += 22){ g.beginPath(); g.moveTo(x, gy - 26); g.lineTo(x, gy); g.stroke(); } g.lineWidth = 3; [gy - 20, gy - 9].forEach(y => { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); });
        // the yard
        gr = g.createLinearGradient(0, gy, 0, H); gr.addColorStop(0, '#E9C98F'); gr.addColorStop(1, '#D6AE6B'); g.fillStyle = gr; g.fillRect(0, gy, W, H - gy);
        const R = rng(3); for(let i = 0; i < 40; i++){ g.strokeStyle = 'rgba(214,170,60,.7)'; g.lineWidth = 1.4; const x = R() * W, y = gy + R() * (H - gy); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 - R() * 12, y - 2 - R() * 3); g.stroke(); }
        // the crate board
        g.fillStyle = 'rgba(80,50,20,.25)'; g.beginPath(); g.roundRect(bx - cell * 0.14 + 5, by - cell * 0.14 + 7, bw + cell * 0.28, bw + cell * 0.28, cell * 0.18); g.fill();
        g.fillStyle = '#B9874F'; g.beginPath(); g.roundRect(bx - cell * 0.14, by - cell * 0.14, bw + cell * 0.28, bw + cell * 0.28, cell * 0.18); g.fill();
        g.strokeStyle = '#8C5F30'; g.lineWidth = 2; for(let i = 1; i < 5; i++){ g.beginPath(); g.moveTo(bx - cell * 0.14, by - cell * 0.14 + i * (bw + cell * 0.28) / 5); g.lineTo(bx + bw + cell * 0.14, by - cell * 0.14 + i * (bw + cell * 0.28) / 5); g.stroke(); }
        for(let r = 0; r < 4; r++) for(let c = 0; c < 4; c++){ g.fillStyle = 'rgba(255,244,214,.85)'; g.beginPath(); g.roundRect(bx + c * cell + cell * 0.06, by + r * cell + cell * 0.06, cell * 0.88, cell * 0.88, cell * 0.14); g.fill(); }
      },
      live(g, W, H, t){
        const {cell, at, gy} = geo(W, H);
        // 5 s loop: the right 8 slides left into the other 8 → merge → 16 pops (bounce) + "+16" → a new 2 appears at (3, 2) → rest
        const cyc = 5, ph = (t % cyc) / cyc, mQ = ph < 0.2 ? 0 : Math.min(1, (ph - 0.2) / 0.16), e = mQ * mQ * (3 - 2 * mQ), merged = ph >= 0.36;
        BOARD.forEach((row, r) => row.forEach((n, c) => { if(!n) return; if(r === 1) return; const p = at(c, r); tile(g, p.x, p.y, cell, n); }));
        if(!merged){ const a = at(0, 1), b = at(3, 1); tile(g, a.x, a.y, cell, 8); g.save(); g.globalAlpha = 0.25 * (mQ > 0 && mQ < 1 ? 1 : 0); g.fillStyle = TC[8]; g.fillRect(lerp(b.x, a.x, e), b.y - cell * 0.2, (b.x - lerp(b.x, a.x, e)), cell * 0.4); g.restore(); tile(g, lerp(b.x, a.x, e), b.y, cell, 8); }
        else { const q = Math.min(1, (ph - 0.36) / 0.12), sc = 1 + 0.22 * Math.sin(q * Math.PI), p = at(0, 1); tile(g, p.x, p.y, cell, 16, sc);
          if(ph < 0.56){ for(let i = 0; i < 8; i++){ const a = i / 8 * 7; sparkle(g, p.x + Math.cos(a) * cell * (0.4 + q * 0.5), p.y + Math.sin(a) * cell * (0.4 + q * 0.5), cell * 0.1, 1 - q, '#FFE38A'); } }
          if(ph < 0.7){ const k = (ph - 0.36) / 0.34; g.save(); g.globalAlpha = 1 - k; g.font = '900 ' + Math.round(cell * 0.34) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#FFFFFF'; g.fillStyle = '#E11D48'; g.strokeText('+16', p.x + cell * 0.95, p.y - cell * k * 0.5); g.fillText('+16', p.x + cell * 0.95, p.y - cell * k * 0.5); g.restore(); }
          if(ph > 0.5){ const q2 = Math.min(1, (ph - 0.5) / 0.08), p2 = at(3, 2); tile(g, p2.x, p2.y, cell, 2, 0.3 + 0.7 * q2); } }
        // 🐔 a hen and two chicks walk across the yard (behind the champions' feet line)
        const yy = gy + (cell * 0.35), span = W + 120, x0 = ((t * 28) % span) - 60;
        hen(g, x0, yy, Math.max(0.8, cell / 42), Math.sin(t * 9), false); hen(g, x0 - cell * 0.55, yy + 3, Math.max(0.5, cell / 80), Math.sin(t * 11 + 1), true); hen(g, x0 - cell * 0.9, yy + 2, Math.max(0.5, cell / 80), Math.sin(t * 11 + 2), true);
      },
      spots(W, H){ const {gy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 36 * k, gy + (H - gy) * 0.86);
        const W3 = W > H ? [0.5, 0.2, 0.8] : [0.5, 0.17, 0.83], X = f => clamp(W * f, 64 * k, W - 64 * k);
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 4 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER double-up END
  // 🎬 COVER pop-blocks START — 🫧 Pop Blocks: a wall of squishy jelly blocks on a sunny hill; a group of four pink blocks glows, POPs into bubbles + confetti, the blocks above drop down
  (function(){
    const COL = ['#FF4D8D', '#FF9F1C', '#3D7DD8', '#22C55E', '#A855F7'];
    const WALL = [[1, 2, 4, 2, 1, 3, 2], [3, 0, 0, 1, 4, 1, 4], [2, 0, 0, 3, 2, 4, 1], [4, 1, 3, 3, 1, 2, 3], [1, 2, 4, 2, 4, 3, 2]];   // top → bottom; the 0-group = cols 1–2, rows 1–2
    const GROUP = [[1, 1], [2, 1], [1, 2], [2, 2]];
    const geo = (W, H) => { const wide = W > H; let ww = Math.min(W * (wide ? 0.5 : 0.82), H * (wide ? 0.66 : 0.58)), wx = W / 2 - ww / 2 + (wide ? W * 0.06 : 0), wy = H * (wide ? 0.25 : 0.33);
      { const F = away(wx, wy, ww, ww / 7 * 5.12, W, H); ww *= F.s; wx = F.x; wy = F.y; }   /* 🏷️ 24j-e */
      const cell = ww / 7, wh = cell * 5, gy = wy + wh + cell * 0.12;
      return {wide, ww, cell, wh, wx, wy, gy, at: (c, r) => ({x: wx + (c + 0.5) * cell, y: wy + (r + 0.5) * cell})}; };
    function block(g, x, y, s, col, glow, sq){
      g.save(); g.translate(x, y + s * 0.5); g.scale(1 + (1 - (sq || 1)) * 0.5, sq || 1); g.translate(0, -s * 0.5);
      if(glow){ g.shadowColor = '#FFFFFF'; g.shadowBlur = s * 0.5; }
      g.fillStyle = col; g.beginPath(); g.roundRect(-s * 0.46, -s * 0.46, s * 0.92, s * 0.92, s * 0.22); g.fill(); g.shadowBlur = 0;
      g.fillStyle = shade(col, -0.18); g.beginPath(); g.roundRect(-s * 0.46, s * 0.12, s * 0.92, s * 0.34, [0, 0, s * 0.22, s * 0.22]); g.fill();
      g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.roundRect(-s * 0.32, -s * 0.36, s * 0.3, s * 0.12, s * 0.06); g.fill();
      // a tiny face
      g.fillStyle = '#2A1E3A'; [-1, 1].forEach(k => { g.beginPath(); g.arc(k * s * 0.13, -s * 0.04, s * 0.045, 0, 7); g.fill(); });
      g.strokeStyle = '#2A1E3A'; g.lineWidth = Math.max(1, s * 0.035); g.beginPath(); g.arc(0, s * 0.04, s * 0.08, 0.3, Math.PI - 0.3); g.stroke();
      g.restore();
    }
    add('pop-blocks', {
      still(g, W, H){
        const {ww, cell, wh, wx, wy, gy} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, gy); gr.addColorStop(0, '#6EC6FF'); gr.addColorStop(1, '#D9F2FF'); g.fillStyle = gr; g.fillRect(0, 0, W, gy);
        g.fillStyle = 'rgba(255,240,180,.9)'; g.beginPath(); g.arc(W * 0.85, H * 0.12, Math.min(W, H) * 0.07, 0, 7); g.fill();
        cloud(g, W * 0.08, H * 0.2, Math.min(W, H) / 480, 0.85); cloud(g, W * 0.55, H * 0.1, Math.min(W, H) / 560, 0.7);
        // rolling hills
        [['#9BDB7A', 0.35, 0], ['#7CCB62', 0.18, 1.3]].forEach(([c, a, ph]) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, gy); for(let x = 0; x <= W; x += 8) g.lineTo(x, gy - H * a * (0.5 + 0.5 * Math.sin(x / W * 4 + ph)) * 0.55); g.lineTo(W, H); g.lineTo(0, H); g.fill(); });
        gr = g.createLinearGradient(0, gy, 0, H); gr.addColorStop(0, '#6BC25A'); gr.addColorStop(1, '#4FA946'); g.fillStyle = gr; g.fillRect(0, gy, W, H - gy);
        const R = rng(5); for(let i = 0; i < 18; i++){ const x = R() * W, y = gy + 8 + R() * (H - gy - 10); g.fillStyle = ['#FFFFFF', '#FFE066', '#FF9FC6'][i % 3]; for(let p = 0; p < 5; p++){ g.beginPath(); g.arc(x + Math.cos(p * 1.26) * 3, y + Math.sin(p * 1.26) * 3, 2.2, 0, 7); g.fill(); } }
        // the wall's frame (a toy crate)
        g.fillStyle = '#C98B4A'; g.beginPath(); g.roundRect(wx - cell * 0.18, wy - cell * 0.18, ww + cell * 0.36, wh + cell * 0.3, cell * 0.2); g.fill();
        g.fillStyle = '#FFF4E0'; g.beginPath(); g.roundRect(wx - cell * 0.06, wy - cell * 0.06, ww + cell * 0.12, wh + cell * 0.08, cell * 0.14); g.fill();
      },
      live(g, W, H, t){
        const {cell, wh, ww, wx, wy, at} = geo(W, H), S = cell * 0.98;
        // 5 s loop: the pink group glows (tap!) → squash → POP → blocks above fall 2 rows → new ones drop in
        const cyc = 5, ph = (t % cyc) / cyc, glow = ph > 0.12 && ph < 0.36, popped = ph >= 0.36, fallQ = ph < 0.42 ? 0 : Math.min(1, (ph - 0.42) / 0.16), e = fallQ * fallQ;
        WALL.forEach((row, r) => row.forEach((k, c) => {
          const inG = GROUP.some(([gc, gr]) => gc === c && gr === r);
          if(inG){ if(!popped){ const p = at(c, r), sq = glow ? 1 - 0.08 * Math.max(0, Math.sin((ph - 0.12) / 0.24 * Math.PI * 3)) : 1; block(g, p.x, p.y, S, COL[k], glow && Math.sin(t * 14) > 0, sq); } return; }
          let p = at(c, r); if(popped && (c === 1 || c === 2) && r === 0){ const a = at(c, 0), b = at(c, 2); p = {x: a.x, y: lerp(a.y, b.y, e)}; }
          block(g, p.x, p.y, S, COL[k], false, (popped && fallQ >= 1 && ph < 0.66 && (c === 1 || c === 2) && r === 0) ? 1 - 0.14 * Math.sin((ph - 0.58) / 0.08 * Math.PI) : 1);
        }));
        if(popped && fallQ > 0){ g.save(); g.beginPath(); g.rect(wx - cell * 0.1, wy - cell * 0.06, ww + cell * 0.2, wh + cell); g.clip(); [[1, 0], [2, 0], [1, 1], [2, 1]].forEach(([c, r], i) => { const a = at(c, r - 2.6), b = at(c, r); block(g, b.x, lerp(a.y, b.y, e), S, COL[(c + r * 2 + 1) % 5], false); }); g.restore(); }
        // 🫧 the pop: bubbles fly up + confetti
        if(popped && ph < 0.8){ const q = (ph - 0.36) / 0.44, mid = at(1.5, 1.5);
          for(let i = 0; i < 9; i++){ const a = i * 0.7, x = mid.x + Math.cos(a * 2.3) * cell * (0.4 + q * 1.4), y = mid.y - q * cell * 2.6 - (i % 3) * cell * 0.3, r = cell * (0.12 + (i % 3) * 0.06);
            g.save(); g.globalAlpha = 1 - q; g.fillStyle = 'rgba(224,242,254,.55)'; g.strokeStyle = 'rgba(61,125,216,.8)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, 7); g.fill(); g.restore(); }
          for(let i = 0; i < 14; i++){ const a = i / 14 * 7, x = mid.x + Math.cos(a) * cell * 2 * q, y = mid.y + Math.sin(a) * cell * 1.4 * q + q * q * cell; g.save(); g.globalAlpha = 1 - q; g.translate(x, y); g.rotate(a + t * 5); g.fillStyle = COL[i % 5]; g.fillRect(-cell * 0.07, -cell * 0.035, cell * 0.14, cell * 0.07); g.restore(); }
          if(ph < 0.62){ g.save(); g.globalAlpha = 1 - (ph - 0.36) / 0.26; g.font = '900 ' + Math.round(cell * 0.6) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#FFFFFF'; g.fillStyle = '#FF4D8D'; g.strokeText('POP!', mid.x, mid.y - cell * 0.3); g.fillText('POP!', mid.x, mid.y - cell * 0.3); g.restore(); } }
        for(let i = 0; i < 4; i++){ const x = W * (0.1 + i * 0.27), y = H * 0.9 - ((t * 22 + i * 90) % (H * 0.7)), r = 5 + i * 2; g.save(); g.globalAlpha = 0.5; g.strokeStyle = 'rgba(61,125,216,.7)'; g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x + Math.sin(t + i) * 8, y, r, 0, 7); g.fill(); g.stroke(); g.restore(); }
      },
      spots(W, H){ const {gy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 36 * k, gy + (H - gy) * 0.84);
        const W3 = W > H ? [0.5, 0.2, 0.8] : [0.5, 0.18, 0.82], X = f => clamp(W * f, 64 * k, W - 64 * k);
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 4 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER pop-blocks END
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
  // 🎬 COVER geoscout START — 🔢 GeoScout: Dino Quarry at sunset; two number-block towers (2 and 3, faces on top) slide together and SNAP into a 5 tower, "2 + 3 = 5" floats up; a wooden balance scale beside tips and levels; a little 🦕 peeks over the hill
  (function(){
    const COL = {2: '#FF7A59', 3: '#4C9AFF', 5: '#22C3A1'};
    const geo = (W, H) => { const wide = W > H, gy = H * (wide ? 0.66 : 0.6); let u = Math.min(W * (wide ? 0.07 : 0.115), H * (wide ? 0.1 : 0.075)), cx = W * (wide ? 0.42 : 0.34), sx = W * (wide ? 0.72 : 0.8);
      { const F = away(cx - u * 2.8, gy - u * 6.9, u * 5.6, u * 7.3, W, H, {only: 'x'}); u *= F.s; cx = F.x + u * 2.8;
        const S = away(sx - u * 2.3, gy - u * 3.1, u * 4.6, u * 3.5, W, H, {only: 'x', min: 0.9}); sx = S.x + u * 2.3 * S.s; }   /* 🏷️ 24j-e: towers + scale slide along the ground */
      return {wide, u, gy, cx, sx}; };
    function cube(g, x, y, u, col, face, num){   // one cube: front + top + side, optional face / number sign
      const d = u * 0.22;
      g.fillStyle = shade(col, 0.18); g.beginPath(); g.moveTo(x, y); g.lineTo(x + d, y - d); g.lineTo(x + u + d, y - d); g.lineTo(x + u, y); g.fill();
      g.fillStyle = shade(col, -0.22); g.beginPath(); g.moveTo(x + u, y); g.lineTo(x + u + d, y - d); g.lineTo(x + u + d, y + u - d); g.lineTo(x + u, y + u); g.fill();
      g.fillStyle = col; g.fillRect(x, y, u, u); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, u - 1, u - 1);
      if(face){ g.fillStyle = '#FFFFFF'; [0.32, 0.68].forEach(f => { g.beginPath(); g.arc(x + u * f, y + u * 0.42, u * 0.11, 0, 7); g.fill(); });
        g.fillStyle = '#1F2937'; [0.32, 0.68].forEach(f => { g.beginPath(); g.arc(x + u * f + u * 0.02, y + u * 0.44, u * 0.055, 0, 7); g.fill(); });
        g.strokeStyle = '#1F2937'; g.lineWidth = Math.max(1.2, u * 0.05); g.beginPath(); g.arc(x + u / 2, y + u * 0.58, u * 0.14, 0.25, Math.PI - 0.25); g.stroke(); }
      if(num){ const r = u * 0.26; g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(x + u / 2 - r, y - u * 0.62, r * 2, r * 1.7, r * 0.4); g.fill(); g.strokeStyle = col; g.lineWidth = 2; g.stroke();
        g.fillStyle = shade(col, -0.35); g.font = '900 ' + Math.round(r * 1.35) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(num, x + u / 2, y - u * 0.62 + r * 0.88); }
    }
    function tower(g, x, base, u, n, col, sq){ for(let i = 0; i < n; i++){ const y = base - (i + 1) * u * (sq || 1); cube(g, x, y, u, col, i === n - 1, i === n - 1 ? String(n) : ''); } }
    add('geoscout', {
      still(g, W, H){
        const {gy, u, sx} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, gy); gr.addColorStop(0, '#FFB46B'); gr.addColorStop(0.55, '#FFD9A0'); gr.addColorStop(1, '#BFE3A0'); g.fillStyle = gr; g.fillRect(0, 0, W, gy);
        g.fillStyle = 'rgba(255,236,170,.95)'; g.beginPath(); g.arc(W * 0.8, gy * 0.32, Math.min(W, H) * 0.08, 0, 7); g.fill();
        // volcano far away + hills
        g.fillStyle = '#9C7AA8'; g.beginPath(); g.moveTo(W * 0.02, gy); g.lineTo(W * 0.16, gy * 0.42); g.lineTo(W * 0.22, gy * 0.42); g.lineTo(W * 0.38, gy); g.fill();
        g.fillStyle = '#FF7A59'; g.beginPath(); g.ellipse(W * 0.19, gy * 0.42, W * 0.03, gy * 0.02, 0, 0, 7); g.fill();
        [['#7FB04A', 0.22, 0.4], ['#5E8F33', 0.12, 2.1]].forEach(([c, a, ph]) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, gy); for(let x = 0; x <= W; x += 8) g.lineTo(x, gy - H * a * (0.5 + 0.5 * Math.sin(x / W * 5 + ph)) * 0.5); g.lineTo(W, H); g.lineTo(0, H); g.fill(); });
        gr = g.createLinearGradient(0, gy, 0, H); gr.addColorStop(0, '#A9814F'); gr.addColorStop(1, '#8B6A43'); g.fillStyle = gr; g.fillRect(0, gy, W, H - gy);
        const R = rng(7); for(let i = 0; i < 22; i++){ g.fillStyle = 'rgba(60,40,20,' + (0.15 + R() * 0.2) + ')'; g.beginPath(); g.ellipse(R() * W, gy + 6 + R() * (H - gy - 8), 3 + R() * 6, 2 + R() * 3, 0, 0, 7); g.fill(); }
        // palm + fern
        g.strokeStyle = '#7A4E2A'; g.lineWidth = Math.max(3, u * 0.14); g.beginPath(); g.moveTo(W * 0.06, gy + 4); g.quadraticCurveTo(W * 0.04, gy - u * 2, W * 0.08, gy - u * 3.4); g.stroke();
        g.fillStyle = '#3F8F3A'; for(let i = 0; i < 5; i++){ const a = -Math.PI / 2 + (i - 2) * 0.6; g.beginPath(); g.ellipse(W * 0.08 + Math.cos(a) * u * 0.8, gy - u * 3.4 + Math.sin(a) * u * 0.5 + u * 0.3, u * 0.9, u * 0.22, a, 0, 7); g.fill(); }
        // scale post
        g.fillStyle = '#7A4E2A'; g.fillRect(sx - u * 0.12, gy - u * 2.6, u * 0.24, u * 2.6); g.beginPath(); g.ellipse(sx, gy, u * 0.8, u * 0.18, 0, 0, 7); g.fill();
      },
      live(g, W, H, t){
        const {gy, u, cx, sx} = geo(W, H);
        // 🦕 peeks over the far hill
        const peek = Math.max(0, Math.sin(t * 0.8)) * u * 0.9; g.save(); g.beginPath(); g.rect(0, 0, W, gy - H * 0.05); g.clip();
        g.fillStyle = '#6FBF73'; g.beginPath(); g.ellipse(W * 0.55, gy - H * 0.05 - peek + u * 0.6, u * 0.55, u * 0.4, 0, 0, 7); g.fill(); g.fillStyle = '#1F2937'; g.beginPath(); g.arc(W * 0.55 + u * 0.2, gy - H * 0.05 - peek + u * 0.45, u * 0.07, 0, 7); g.fill(); g.restore();
        // 6 s loop: 2 and 3 slide together (0.8–2) → SNAP (2–2.3) → 5 tower + "2 + 3 = 5" (2.3–4.6) → split back (4.6–6)
        const cyc = 6, ph = t % cyc, far = u * 1.6;
        let off = ph < 0.8 ? far : ph < 2 ? lerp(far, 0, ((ph - 0.8) / 1.2) ** 2) : ph < 4.6 ? 0 : ph < 5.4 ? lerp(0, far, (ph - 4.6) / 0.8) : far;
        const joined = ph >= 2 && ph < 4.6, base = gy + u * 0.4, sq = ph >= 2 && ph < 2.3 ? 1 - 0.12 * Math.sin((ph - 2) / 0.3 * Math.PI) : 1;
        if(joined){ tower(g, cx - u / 2, base, u, 5, COL[5], sq); }
        else { tower(g, cx - u - off / 2 - u * 0.05, base, u, 2, COL[2]); tower(g, cx + off / 2 + u * 0.05, base, u, 3, COL[3]); }
        if(ph >= 2 && ph < 2.5){ const q = (ph - 2) / 0.5; for(let i = 0; i < 10; i++){ const a = i / 10 * 7; sparkle(g, cx + Math.cos(a) * u * (0.6 + q * 1.2), base - u * 2.5 + Math.sin(a) * u * (0.6 + q * 1.2), 5, 1 - q, '#FFE14D'); } }
        if(ph >= 2.2 && ph < 4.6){ const q = Math.min(1, (ph - 2.2) / 0.4); g.save(); g.globalAlpha = q; g.font = '900 ' + Math.round(u * 0.75) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#FFFFFF'; g.fillStyle = '#E07B12';
          const y = base - u * 6.15 - (1 - q) * u * 0.5; g.strokeText('2 + 3 = 5', cx, y); g.fillText('2 + 3 = 5', cx, y); g.restore(); }
        // ⚖️ the balance: tips toward the heavier pan, levels when both are 4
        const tip = Math.sin(t * 1.1) * 0.18 * (Math.sin(t * 0.37) > 0 ? 1 : 0.15), bw = Math.min(u * 1.9, (W - sx) - u * 0.7), top = gy - u * 2.6;
        g.save(); g.translate(sx, top); g.rotate(tip); g.fillStyle = '#C08A4A'; g.beginPath(); g.roundRect(-bw, -u * 0.1, bw * 2, u * 0.2, u * 0.1); g.fill(); g.restore();
        g.fillStyle = '#E8C25A'; g.beginPath(); g.arc(sx, top, u * 0.16, 0, 7); g.fill();
        [-1, 1].forEach(k => { const px = sx + Math.cos(tip) * bw * k, py = top + Math.sin(tip) * bw * k, pd = u * 1.1;
          g.strokeStyle = '#7A4E2A'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px, py); g.lineTo(px - u * 0.5, py + pd); g.moveTo(px, py); g.lineTo(px + u * 0.5, py + pd); g.stroke();
          g.fillStyle = '#F4E6C2'; g.beginPath(); g.ellipse(px, py + pd, u * 0.62, u * 0.16, 0, 0, 7); g.fill(); g.strokeStyle = '#C9A86A'; g.lineWidth = 2; g.stroke();
          const n = k < 0 ? 1 : 2, uu = u * 0.42; for(let i = 0; i < n; i++) cube(g, px - uu / 2 + (i - (n - 1) / 2) * uu * 1.05, py + pd - uu - u * 0.05, uu, k < 0 ? '#9B6BFF' : '#FF7A59', true, ''); });
        for(let i = 0; i < 3; i++){ const x = W * (0.2 + i * 0.3) + Math.sin(t * 0.6 + i) * 10, y = H * 0.05 + i * 6; cloud(g, x, y, Math.min(W, H) / 700, 0.45); }
      },
      spots(W, H){ const {gy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 38 * k, gy + (H - gy) * 0.86);
        const W3 = W > H ? [0.5, 0.18, 0.84] : [0.55, 0.16, 0.86], X = f => clamp(W * f, 64 * k, W - 64 * k);
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 4 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER geoscout END
  // 🎬 COVER georead START — 🔤 GeoRead: a cosy reading room (bookshelves, window, rug); three letter boxes c · a · t each glow and "say" their sound (c… a… t…), then bump together, a big "cat!" bubble pops and a cat jumps out of the box; then s · u · n → "sun!" ☀️
  (function(){
    const WORDS = [['c', 'a', 't', '🐱', 'cat!'], ['s', 'u', 'n', '☀️', 'sun!']];
    const BOX = ['#FDE68A', '#BAE6FD', '#FBCFE8'];
    const geo = (W, H) => { const wide = W > H, u = Math.min(W * (wide ? 0.095 : 0.16), H * (wide ? 0.15 : 0.1)), fy = H * (wide ? 0.66 : 0.62), cx = W * (wide ? 0.5 : 0.5);
      return {wide, u, fy, cx}; };
    function box(g, x, y, u, ch, col, glow, sq){
      g.save(); g.translate(x, y); g.scale(1 + (1 - (sq || 1)) * 0.6, sq || 1);
      if(glow){ g.shadowColor = '#FFE14D'; g.shadowBlur = u * 0.5; }
      g.fillStyle = col; g.beginPath(); g.roundRect(-u / 2, -u, u, u, u * 0.12); g.fill(); g.shadowBlur = 0;
      g.fillStyle = shade(col, -0.15); g.fillRect(-u / 2, -u * 0.62, u, u * 0.08);   // tape
      g.strokeStyle = shade(col, -0.35); g.lineWidth = 2; g.beginPath(); g.roundRect(-u / 2, -u, u, u, u * 0.12); g.stroke();
      g.fillStyle = '#1F2937'; g.font = '900 ' + Math.round(u * 0.62) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, -u * 0.36);
      g.restore();
    }
    add('georead', {
      still(g, W, H){
        const {fy, u, wide} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, fy); gr.addColorStop(0, '#FFE8C7'); gr.addColorStop(1, '#F8D3A5'); g.fillStyle = gr; g.fillRect(0, 0, W, fy);
        // window with sky
        const wx = W * (wide ? 0.4 : 0.36), ww = W * (wide ? 0.2 : 0.28), wy = fy * 0.1, wh = fy * 0.34;
        g.fillStyle = '#8B5A2B'; g.beginPath(); g.roundRect(wx - 6, wy - 6, ww + 12, wh + 12, 10); g.fill();
        gr = g.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, '#7CC6FF'); gr.addColorStop(1, '#D6F0FF'); g.fillStyle = gr; g.beginPath(); g.roundRect(wx, wy, ww, wh, 6); g.fill();
        cloud(g, wx + ww * 0.15, wy + wh * 0.4, ww / 260, 0.9);
        g.fillStyle = '#8B5A2B'; g.fillRect(wx + ww / 2 - 3, wy, 6, wh); g.fillRect(wx, wy + wh / 2 - 3, ww, 6);
        // bookshelves left + right
        const R = rng(3);
        [[0, W * (wide ? 0.26 : 0.24)], [W - W * (wide ? 0.26 : 0.24), W * (wide ? 0.26 : 0.24)]].forEach(([x0, sw]) => {
          g.fillStyle = '#9A6534'; g.fillRect(x0, fy * 0.08, sw, fy * 0.92);
          for(let r = 0; r < 4; r++){ const sy = fy * (0.12 + r * 0.22), sh = fy * 0.18; g.fillStyle = '#6E4423'; g.fillRect(x0 + 6, sy, sw - 12, sh);
            let bx = x0 + 9; while(bx < x0 + sw - 14){ const bw = 6 + R() * 9, bh = sh * (0.65 + R() * 0.3); g.fillStyle = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#A855F7', '#14B8A6'][Math.floor(R() * 6)]; g.fillRect(bx, sy + sh - bh, bw, bh); bx += bw + 1.5; }
            g.fillStyle = '#B87A44'; g.fillRect(x0 + 4, sy + sh, sw - 8, 4); } });
        // floor + rug
        gr = g.createLinearGradient(0, fy, 0, H); gr.addColorStop(0, '#C98B4A'); gr.addColorStop(1, '#A86F36'); g.fillStyle = gr; g.fillRect(0, fy, W, H - fy);
        g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 1; for(let y = fy + 14; y < H; y += 16){ g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        g.fillStyle = '#7C3AED'; g.beginPath(); g.ellipse(W / 2, fy + (H - fy) * 0.45, W * 0.42, (H - fy) * 0.32, 0, 0, 7); g.fill();
        g.strokeStyle = '#FDE68A'; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.ellipse(W / 2, fy + (H - fy) * 0.45, W * 0.38, (H - fy) * 0.26, 0, 0, 7); g.stroke(); g.setLineDash([]);
      },
      live(g, W, H, t){
        const {fy, u, cx} = geo(W, H);
        // 8 s loop per word: sounds (0–3) → bump (3–3.6) → word + picture (3.6–6.4) → apart (6.4–8)
        const cyc = 8, n = Math.floor(t / cyc) % 2, ph = t % cyc, Wd = WORDS[n], gap = u * 0.45;
        const apart = ph < 3 ? 1 : ph < 3.6 ? 1 - ((ph - 3) / 0.6) ** 2 : ph < 6.4 ? 0 : Math.min(1, (ph - 6.4) / 0.8), base = fy + u * 0.15;
        const say = ph < 3 ? Math.floor(ph) : -1;
        [0, 1, 2].forEach(i => { const x = cx + (i - 1) * (u + gap * apart + u * 0.04), on = say === i, hop = on ? Math.sin((ph % 1) * Math.PI) * u * 0.25 : 0,
            sq = ph >= 3.5 && ph < 3.75 ? 1 - 0.12 * Math.sin((ph - 3.5) / 0.25 * Math.PI) : 1;
          box(g, x, base - hop, u, Wd[i], BOX[i], on, sq);
          if(on){ const q = ph % 1; g.save(); g.globalAlpha = 1 - q; g.strokeStyle = '#F59E0B'; g.lineWidth = 2.5; for(let k = 1; k <= 3; k++){ g.beginPath(); g.arc(x, base - u * 1.25 - hop, u * 0.18 * k * (0.6 + q), -2.4, -0.7); g.stroke(); }
            g.globalAlpha = 1; g.font = '800 ' + Math.round(u * 0.34) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#B45309'; g.fillText(Wd[i] + Wd[i] + '…', x, base - u * 1.55 - hop - q * u * 0.2); g.restore(); } });
        if(ph >= 3.5 && ph < 3.9){ const q = (ph - 3.5) / 0.4; for(let i = 0; i < 10; i++){ const a = i / 10 * 7; sparkle(g, cx + Math.cos(a) * u * (1 + q * 1.2), base - u * 0.5 + Math.sin(a) * u * (0.5 + q * 0.8), 5, 1 - q, '#FFE14D'); } }
        if(ph >= 3.6 && ph < 6.4){ const q = Math.min(1, (ph - 3.6) / 0.35), s = 0.6 + 0.4 * q + Math.sin(Math.min(1, (ph - 3.6) / 0.5) * Math.PI) * 0.12;
          // the picture jumps out of the middle box, the word bubble above
          const py = base - u * 1.2 - q * u * 0.9; g.save(); g.font = Math.round(u * 0.9 * s) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(Wd[3], cx, py); g.restore();
          const by = py - u * 1.05, bw = u * 2.2; g.save(); g.globalAlpha = q; g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(cx - bw / 2, by - u * 0.42, bw, u * 0.78, u * 0.3); g.fill();
          g.beginPath(); g.moveTo(cx - u * 0.12, by + u * 0.34); g.lineTo(cx + u * 0.12, by + u * 0.34); g.lineTo(cx, by + u * 0.55); g.fill();
          g.fillStyle = '#7C3AED'; g.font = '900 ' + Math.round(u * 0.56) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(Wd[4], cx, by); g.restore(); }
        // floating letters drift past the window
        const L = 'abcdefghijklmnop'; for(let i = 0; i < 6; i++){ const x = (W * (0.1 + i * 0.17) + t * 14 * (i % 2 ? 1 : -1) + W * 2) % W, y = fy * (0.55 + (i % 3) * 0.08) + Math.sin(t * 1.3 + i) * 6;
          g.save(); g.globalAlpha = 0.35; g.font = '800 ' + Math.round(u * 0.3) + 'px Fredoka, sans-serif'; g.fillStyle = ['#7C3AED', '#0EA5E9', '#EF4444'][i % 3]; g.textAlign = 'center'; g.fillText(L[(i * 3 + Math.floor(t / 4)) % L.length], x, y); g.restore(); }
      },
      spots(W, H){ const {fy} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = Math.min(H - 38 * k, fy + (H - fy) * 0.86);
        const W3 = W > H ? [0.5, 0.2, 0.8] : [0.5, 0.16, 0.84], X = f => clamp(W * f, 64 * k, W - 64 * k);
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 4 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER georead END
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
  // 🎬 COVER polyplot START — ⬛ Polyplot: a dot map on a mossy jungle board (Dino Jungle look) — a coloured line draws itself dot to dot, a box closes, fills with the player's colour and pops; a chain of 3 boxes closes in a row; a 🦕 creature hops in a closed box, ⚠️ a theme event spark flashes; then the board clears
  (function(){
    const COLS = ['#2F8CFF', '#FF4F8B', '#22C3A1', '#FFC845'];
    const geo = (W, H) => { const wide = W > H, n = wide ? 7 : 5, m = 4, cell = Math.min(W * (wide ? 0.6 : 0.84) / n, H * (wide ? 0.5 : 0.36) / m),
      bw0 = cell * n, bh0 = cell * m, F = away(wide ? W * 0.62 - bw0 / 2 : (W - bw0) / 2, wide ? H * 0.18 : H * 0.3, bw0, bh0, W, H), c2 = cell * F.s;   /* 🏷️ 24j-e: the dot board keeps clear of the logo */
      return {wide, n, m, cell: c2, x0: F.x, y0: F.y, bw: c2 * n, bh: c2 * m}; };
    // the scripted game: [side, cell x, cell y, player] (side 0 top · 1 right · 2 bottom · 3 left); every 4th side of a cell closes it
    const SCRIPT = [[0, 1, 1, 0], [3, 1, 1, 1], [2, 1, 1, 0], [1, 1, 1, 1], [0, 2, 1, 0], [2, 2, 1, 1], [1, 2, 1, 1], [0, 3, 1, 0], [2, 3, 1, 0], [1, 3, 1, 1], [0, 2, 2, 0], [3, 2, 2, 1], [2, 2, 2, 0], [1, 2, 2, 0]];
    function edges(n, m){ const E = []; SCRIPT.forEach(([s, cx, cy, p]) => { const a = s === 0 ? [cx, cy, cx + 1, cy] : s === 1 ? [cx + 1, cy, cx + 1, cy + 1] : s === 2 ? [cx, cy + 1, cx + 1, cy + 1] : [cx, cy, cx, cy + 1]; E.push({a, p, k: a.join(',')}); }); return E; }
    function closedAt(E, upto){ const have = new Set(E.slice(0, upto).map(e => e.k)), out = [];
      for(let cy = 0; cy < 4; cy++) for(let cx = 0; cx < 7; cx++){ const sides = [[cx, cy, cx + 1, cy], [cx + 1, cy, cx + 1, cy + 1], [cx, cy + 1, cx + 1, cy + 1], [cx, cy, cx, cy + 1]].map(a => a.join(','));
        if(sides.every(k => have.has(k))){ const last = Math.max(...sides.map(k => E.findIndex(e => e.k === k))); out.push({cx, cy, by: E[last].p, at: last}); } }
      return out; }
    add('polyplot', {
      still(g, W, H){
        const {x0, y0, bw, bh, cell, n, m, wide} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0F2A1A'); gr.addColorStop(0.55, '#17331F'); gr.addColorStop(1, '#0B1F12'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        // jungle leaves round the edges
        const R = rng(5); for(let i = 0; i < 26; i++){ const side = i % 4, x = side === 0 ? R() * W * 0.18 : side === 1 ? W - R() * W * 0.18 : R() * W, y = side < 2 ? R() * H : side === 2 ? R() * H * 0.12 : H - R() * H * 0.1, r = 18 + R() * 30;
          g.save(); g.translate(x, y); g.rotate(R() * 6.3); g.fillStyle = ['#1E5631', '#2D6A3E', '#3A7D44', '#25502F'][i % 4]; g.beginPath(); g.ellipse(0, 0, r, r * 0.42, 0, 0, 7); g.fill();
          g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.stroke(); g.restore(); }
        // the board: a paper square with a soft shadow, chequered like the game
        g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 10; g.fillStyle = '#21452A'; g.beginPath(); g.roundRect(x0 - cell * 0.45, y0 - cell * 0.45, bw + cell * 0.9, bh + cell * 0.9, cell * 0.3); g.fill(); g.restore();
        for(let cy = 0; cy < m; cy++) for(let cx = 0; cx < n; cx++) if((cx + cy) % 2){ g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x0 + cx * cell, y0 + cy * cell, cell, cell); }
        // the floor where the champions stand
        gr = g.createLinearGradient(0, H * 0.7, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = gr; g.fillRect(0, H * 0.7, W, H * 0.3);
        // a fossil coin + a hexagon tile in the corner as a hint of the tilings
        g.save(); g.globalAlpha = 0.5; g.strokeStyle = '#CFE8B0'; g.lineWidth = 2; const hx = wide ? W * 0.14 : W * 0.86, hy = wide ? H * 0.62 : H * 0.08 + 30, hr = cell * 0.45;
        g.beginPath(); for(let i = 0; i < 6; i++){ const a = i / 6 * 6.283 + 0.52; i ? g.lineTo(hx + Math.cos(a) * hr, hy + Math.sin(a) * hr) : g.moveTo(hx + Math.cos(a) * hr, hy + Math.sin(a) * hr); } g.closePath(); g.stroke(); g.restore();
      },
      live(g, W, H, t){
        const {x0, y0, cell, n, m} = geo(W, H), E = edges(n, m), cyc = SCRIPT.length * 0.55 + 3.2, ph = t % cyc, step = 0.55, drawn = Math.min(E.length, Math.floor(ph / step)), part = (ph % step) / step;
        const P = (x, y) => [x0 + x * cell, y0 + y * cell], fade = ph > cyc - 1 ? 1 - (ph - (cyc - 1)) : 1;
        // closed boxes fill + pop
        const shut = closedAt(E, drawn); shut.forEach(c => { const age = ph - (c.at + 1) * step, pop = age < 0.3 ? 1 + Math.sin(age / 0.3 * Math.PI) * 0.18 : 1, [x, y] = P(c.cx + 0.5, c.cy + 0.5), s = cell * 0.92 * pop;
          g.save(); g.globalAlpha = 0.85 * fade; g.fillStyle = COLS[c.by]; g.beginPath(); g.roundRect(x - s / 2, y - s / 2, s, s, cell * 0.12); g.fill(); g.restore();
          if(age < 0.5) for(let i = 0; i < 6; i++){ const a = i / 6 * 6.283 + c.cx; sparkle(g, x + Math.cos(a) * cell * (0.4 + age), y + Math.sin(a) * cell * (0.4 + age), cell * 0.1, 1 - age * 2, '#FFF7C2'); } });
        // the lines (the newest one grows dot → dot)
        g.save(); g.lineCap = 'round'; g.globalAlpha = fade;
        for(let i = 0; i < Math.min(E.length, drawn + 1); i++){ const e = E[i], [ax, ay] = P(e.a[0], e.a[1]), [bx, by] = P(e.a[2], e.a[3]), q = i < drawn ? 1 : part;
          g.strokeStyle = COLS[e.p]; g.lineWidth = Math.max(3, cell * 0.11); g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + (bx - ax) * q, ay + (by - ay) * q); g.stroke(); }
        g.restore();
        // the dots
        g.fillStyle = '#E9F7D8'; for(let y = 0; y <= m; y++) for(let x = 0; x <= n; x++){ const [px, py] = P(x, y); g.beginPath(); g.arc(px, py, Math.max(2.5, cell * 0.07), 0, 7); g.fill(); }
        // a 🦕 creature hops in the middle closed box, the "+1" floats up
        const big = shut.find(c => c.cx === 2 && c.cy === 1); if(big){ const age = ph - (big.at + 1) * step, [x, y] = P(2.5, 1.5), hop = Math.abs(Math.sin(t * 3)) * cell * 0.12;
          g.save(); g.globalAlpha = fade; g.font = Math.round(cell * 0.62) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🦕', x, y - hop); g.restore();
          if(age < 1.2){ g.save(); g.globalAlpha = 1 - age / 1.2; g.fillStyle = '#FFE14D'; g.font = '900 ' + Math.round(cell * 0.4) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('+1', x + cell * 0.35, y - cell * 0.5 - age * cell * 0.5); g.restore(); } }
        // "CHAIN!" when the 3 in a row close
        const chain = shut.filter(c => c.cy === 1).length >= 3 ? shut.filter(c => c.cy === 1).reduce((a, c) => Math.max(a, c.at), 0) : -1;
        if(chain >= 0){ const age = ph - (chain + 1) * step; if(age >= 0 && age < 1.4){ const [x, y] = P(n / 2, 0), s = 0.8 + Math.min(1, age / 0.2) * 0.2;
          g.save(); g.globalAlpha = Math.min(1, (1.4 - age) / 0.4); g.translate(x, y - cell * 0.7); g.scale(s, s); g.fillStyle = '#FFFDF7'; g.strokeStyle = '#2A1E3A'; g.lineWidth = 3; g.beginPath(); g.roundRect(-cell * 1.2, -cell * 0.32, cell * 2.4, cell * 0.64, cell * 0.3); g.fill(); g.stroke();
          g.fillStyle = '#FF4F8B'; g.font = '900 ' + Math.round(cell * 0.38) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🔗 CHAIN ×3!', 0, 2); g.restore(); } }
        // fireflies
        for(let i = 0; i < 7; i++){ const x = ((i * 0.149 + t * 0.018) % 1) * W, y = H * (0.1 + ((i * 0.37) % 0.55)) + Math.sin(t * 1.4 + i) * 10; sparkle(g, x, y, 3.5, 0.45 + 0.4 * Math.sin(t * 3 + i), '#FFF3A0'); }
      },
      spots(W, H){ const k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), y = H - 40 * k, X = f => clamp(W * f, 64 * k, W - 64 * k), W3 = W > H ? [0.5, 0.22, 0.78] : [0.5, 0.18, 0.82];
        return [{x: X(W3[0]), y, k}, {x: X(W3[1]), y: y - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: y - 4 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER polyplot END
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
  // 🎬 COVER sla-brall START — 🏓 SlaBrall: a night arena under floodlights — a glowing court seen from behind the near baseline, the net band across it,
  //    the ball flies back and forth over the net with a comet trail (☄️ ball trails) while its shadow runs on the court (the game's "watch the shadow"), a bounce ring
  //    where it lands, camera flashes in the stands, beams sweep. 🏆 champions stand on the near baseline.
  (function(){
    const geo = (W, H) => { const wide = W > H, hy = H * (wide ? 0.4 : 0.38);
      // court box (before away): far baseline at the horizon band, near baseline low on the screen
      let cw = wide ? Math.min(W * 0.62, H * 1.25) : W * 0.94, cx = W / 2, top = hy + (H - hy) * 0.06, bot = H * (wide ? 0.9 : 0.86);
      const F = away(cx - cw / 2, top, cw, bot - top, W, H, {only: 'x', min: 0.6}); cw *= F.s; cx = F.x + cw / 2;   /* 🏷️ 24j-e: the court keeps clear of the logo */
      const P = (u, v) => { const s = lerp(0.46, 1, v); return {x: cx + (u - 0.5) * cw * s, y: lerp(top, bot, Math.pow(v, 1.12)), s}; };   // u 0..1 across, v 0 far .. 1 near
      return {wide, hy, cx, cw, top, bot, P, netV: 0.44}; };
    function quad(g, P, u0, v0, u1, v1, fill){ const a = P(u0, v0), b = P(u1, v0), c = P(u1, v1), d = P(u0, v1); poly(g, [[a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y]], fill); }
    function line(g, P, u0, v0, u1, v1, w){ const a = P(u0, v0), b = P(u1, v1); g.lineWidth = w * a.s; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
    // the rally: ball from the near side (u .3) over the net to the far side (u .72) and back, height h above the court (court units)
    function ballAt(t){ const per = 2.6, k = (t % per) / per, back = k >= 0.5, q = back ? (k - 0.5) * 2 : k * 2, ease = q * q * (3 - 2 * q);
      const u = back ? lerp(0.74, 0.28, ease) : lerp(0.28, 0.74, ease), v = back ? lerp(0.12, 0.86, q) : lerp(0.86, 0.12, q);
      const h = Math.sin(q * Math.PI) * 0.34 + 0.05; return {u, v, h, q, back}; }
    add('sla-brall', {
      still(g, W, H){
        const {wide, hy, P, netV} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0B1030'); gr.addColorStop(0.42, '#2A1A5C'); gr.addColorStop(1, '#120C2E'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        // the stands: three tiers of seats + tiny fans (dots) around the court
        const R = rng(7); [[0.55, '#24184F'], [0.78, '#2E2163'], [1, '#3A2A78']].forEach(([f, c], i) => { const y0 = hy * (0.55 + i * 0.16);
          g.fillStyle = c; g.beginPath(); g.moveTo(0, y0 + 30); for(let x = 0; x <= W; x += W / 30) g.lineTo(x, y0 - Math.sin(x / W * Math.PI) * hy * 0.12); g.lineTo(W, H); g.lineTo(0, H); g.fill();
          for(let n = 0; n < W / 9; n++){ const x = R() * W, y = y0 - Math.sin(x / W * Math.PI) * hy * 0.12 + 6 + R() * hy * 0.1; g.fillStyle = ['#FF7AA8', '#FFD45E', '#7CE3FF', '#B9F27C', '#FFFFFF'][n % 5]; g.globalAlpha = 0.45 + R() * 0.35; g.beginPath(); g.arc(x, y, 1.6 + R() * 1.6, 0, 7); g.fill(); } g.globalAlpha = 1; });
        // floodlight towers
        [0.08, 0.92].forEach(fx => { const x = W * fx, y = hy * 0.22; g.fillStyle = '#1A1238'; g.fillRect(x - 3, y, 6, hy * 0.9);
          g.fillStyle = '#E9E6FF'; g.beginPath(); g.roundRect(x - 26, y - 14, 52, 18, 4); g.fill(); g.fillStyle = '#FFF7C9'; for(let i = 0; i < 4; i++){ g.beginPath(); g.arc(x - 18 + i * 12, y - 5, 4, 0, 7); g.fill(); } });
        // the floor around the court + the court (hard court blue, green outside) + lines
        g.fillStyle = '#163B5E'; g.fillRect(0, hy + (H - hy) * 0.02, W, H);
        quad(g, P, -0.12, -0.04, 1.12, 1.06, '#1E7A55'); quad(g, P, 0, 0, 1, 1, '#2F6FE0');
        for(let i = 0; i < 8; i++) quad(g, P, 0, i / 8, 1, (i + 1) / 8, i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.03)');
        g.strokeStyle = 'rgba(255,255,255,.92)';
        line(g, P, 0, 0, 1, 0, 3); line(g, P, 0, 1, 1, 1, 4); line(g, P, 0, 0, 0, 1, 3); line(g, P, 1, 0, 1, 1, 3);
        line(g, P, 0.12, 0, 0.12, 1, 2); line(g, P, 0.88, 0, 0.88, 1, 2); line(g, P, 0.12, 0.2, 0.88, 0.2, 2); line(g, P, 0.12, 0.72, 0.88, 0.72, 2); line(g, P, 0.5, 0.2, 0.5, 0.72, 2);
        // the net: posts + a dark mesh band with a white top tape
        const a = P(-0.05, netV), b = P(1.05, netV), nh = 46 * a.s * (wide ? H / 600 : W / 420);
        g.fillStyle = '#D9DDE8'; [a, b].forEach(p => g.fillRect(p.x - 3 * p.s, p.y - nh * 1.1, 6 * p.s, nh * 1.1));
        g.fillStyle = 'rgba(10,14,30,.55)'; g.fillRect(a.x, a.y - nh, b.x - a.x, nh * 0.92);
        g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; for(let x = a.x; x < b.x; x += 7){ g.beginPath(); g.moveTo(x, a.y - nh); g.lineTo(x, a.y - nh * 0.08); g.stroke(); }
        for(let y = a.y - nh; y < a.y - nh * 0.1; y += 7){ g.beginPath(); g.moveTo(a.x, y); g.lineTo(b.x, y); g.stroke(); }
        g.fillStyle = '#FFFFFF'; g.fillRect(a.x, a.y - nh - 3, b.x - a.x, 5);
      },
      live(g, W, H, t){
        const {hy, P, netV, wide} = geo(W, H), U = wide ? H / 600 : W / 420;
        // beams sweep from the floodlights
        [0.08, 0.92].forEach((fx, i) => { const x = W * fx, y = hy * 0.22, ang = Math.PI / 2 + Math.sin(t * 0.5 + i * 2) * 0.35 * (i ? -1 : 1) + (i ? 0.35 : -0.35);
          g.save(); g.globalAlpha = 0.13; const gr = g.createLinearGradient(x, y, x + Math.cos(ang) * H, y + Math.sin(ang) * H); gr.addColorStop(0, '#FFF6C8'); gr.addColorStop(1, 'rgba(255,246,200,0)'); g.fillStyle = gr;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang - 0.13) * H * 1.2, y + Math.sin(ang - 0.13) * H * 1.2); g.lineTo(x + Math.cos(ang + 0.13) * H * 1.2, y + Math.sin(ang + 0.13) * H * 1.2); g.closePath(); g.fill(); g.restore(); });
        // camera flashes in the stands
        for(let i = 0; i < 4; i++){ const k = (t * 1.3 + i * 0.37) % 1; if(k < 0.08){ const x = ((i * 0.29 + Math.floor(t * 1.3 + i * 0.37) * 0.17) % 1) * W, y = hy * (0.62 + (i % 3) * 0.14); sparkle(g, x, y, 9, 1 - k / 0.08, '#FFFFFF'); } }
        // the ball: trail of past positions (☄️), its shadow on the court, a bounce ring where it lands
        const scr = b => { const p = P(b.u, b.v); return {x: p.x, y: p.y - b.h * 190 * p.s * U, gx: p.x, gy: p.y, s: p.s}; };
        const cur = ballAt(t), cs = scr(cur);
        g.save(); g.globalAlpha = 0.35; g.fillStyle = '#000'; g.beginPath(); g.ellipse(cs.gx, cs.gy, 9 * cs.s * U * (1 - cur.h), 3.5 * cs.s * U * (1 - cur.h * 0.6), 0, 0, 7); g.fill(); g.restore();
        for(let i = 14; i >= 1; i--){ const b = ballAt(t - i * 0.022); if(Math.abs(b.q - cur.q) > 0.5 && b.back !== cur.back) continue; const p = scr(b), a = 1 - i / 15;
          g.globalAlpha = a * 0.7; g.fillStyle = i < 5 ? '#FFF2A8' : '#FF8A3D'; g.beginPath(); g.arc(p.x, p.y, (8 * a + 2) * p.s * U, 0, 7); g.fill(); } g.globalAlpha = 1;
        g.save(); g.shadowColor = '#FFE45C'; g.shadowBlur = 16; g.fillStyle = '#FFF9D6'; g.beginPath(); g.arc(cs.x, cs.y, 9 * cs.s * U, 0, 7); g.fill(); g.restore();
        g.strokeStyle = '#F2C53D'; g.lineWidth = 2 * cs.s * U; g.beginPath(); g.arc(cs.x, cs.y, 9 * cs.s * U, -0.6, 1.2); g.stroke();
        if(cur.q > 0.9 || cur.q < 0.06){ const k = cur.q > 0.9 ? (cur.q - 0.9) / 0.16 : 0.62 + cur.q / 0.16; const p = P(cur.u, cur.v);
          g.save(); g.globalAlpha = Math.max(0, 1 - k); g.strokeStyle = '#7CE3FF'; g.lineWidth = 3; g.beginPath(); g.ellipse(p.x, p.y, 30 * k * p.s * U + 4, 11 * k * p.s * U + 2, 0, 0, 7); g.stroke(); g.restore(); }
        // a racket swings up from each baseline as the ball reaches it (no people: the 🏆 champions are the players)
        [[0.28, 0.9, cur.back ? cur.q : 0], [0.74, 0.1, cur.back ? 0 : cur.q]].forEach(([u, v, q], i) => { const p = P(u + (i ? 0.08 : -0.08), v), sw = q > 0.75 ? (q - 0.75) * 4 : 0;
          g.save(); g.translate(p.x, p.y - 40 * p.s * U); g.rotate((i ? 0.5 : -0.5) - sw * (i ? -1.6 : 1.6) * 0.6); const r = 18 * p.s * U;
          g.fillStyle = '#5B3A1E'; g.fillRect(-2 * p.s * U, 0, 4 * p.s * U, r * 1.3); g.fillStyle = i ? '#3EC1FF' : '#FF4F6D'; g.beginPath(); g.ellipse(0, -r * 0.4, r * 0.8, r, 0, 0, 7); g.fill();
          g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.5; g.stroke(); g.restore(); });
      },
      spots(W, H){ const z0 = Z; Z = null; try { return this._s(W, H); } finally { Z = z0; } },   /* champions stand where the plain art puts them (the logo zone is built from them) */
      _s(W, H){ const {P} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), fy = Math.min(H - 34 * k, P(0.5, 1).y + 26 * k), X = u => clamp(P(u, 1).x, 64 * k, W - 64 * k), sp = W > H ? 0.36 : 0.4;
        return [{x: X(0.5), y: fy, k}, {x: X(0.5 - sp), y: fy - 3 * k, k: k * 0.95, from: -1}, {x: X(0.5 + sp), y: fy - 3 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER sla-brall END

  // 🎬 COVER soul-bopper START — 👻💣 Soul Bopper: a stone maze in a moonlit garden at dusk, seen from above at a tilt — stone pillars, wooden crates, glowing
  //    mushrooms; a bomb's fuse fizzes, it blinks, then a + of flame bursts down the lanes, crates crack, and a little ghost floats up out of the smoke; then the
  //    crates are back and it starts again. 🏆 champions stand on the near edge of the maze.
  (function(){
    const N = 9, M = 7, PIL = (i, j) => i % 2 === 1 && j % 2 === 1, CR = [[2, 1], [4, 1], [6, 2], [1, 4], [3, 2], [5, 4], [7, 4], [4, 5], [2, 5], [6, 6], [0, 2], [8, 3]];
    const BOMB = [4, 3], ARM = 2;   // bomb in the middle, flames 2 tiles each way
    const geo = (W, H) => { const wide = W > H; let cell = wide ? Math.min(W * 0.56 / N, H * 0.5 / M) : Math.min(W * 0.92 / N, H * 0.5 / M);
      let bw = cell * N, bh = cell * M * 0.78, bx = (W - bw) / 2, by = wide ? H * 0.22 : H * 0.42;
      const F = away(bx, by - cell * 0.5, bw, bh + cell * 0.5, W, H, {min: 0.6}); cell *= F.s; bw = cell * N; bh = cell * M * 0.78; bx = F.x; by = F.y + cell * 0.5;   /* 🏷️ 24j-e */
      const T = (i, j) => ({x: bx + i * cell, y: by + j * cell * 0.78}); return {wide, cell, bw, bh, bx, by, T}; };
    function block(g, T, cell, i, j, top, side, lift){ const p = T(i, j), h = cell * (lift || 0.42), d = cell * 0.78;
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(p.x + 2, p.y + d - 2, cell - 2, cell * 0.12);                 // shadow on the floor
      g.fillStyle = side; g.fillRect(p.x + 1, p.y + d - h, cell - 2, h);                                         // front face
      g.fillStyle = top; g.fillRect(p.x + 1, p.y - h, cell - 2, d);                                              // top face (lifted by h)
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(p.x + 1, p.y - h, cell - 2, Math.max(1.5, cell * 0.06)); }
    // phase of the loop (4.2 s): 0..1.6 fuse, 1.6..2.4 blink, 2.4..3.0 flames, 3.0..4.2 ghost floats + smoke
    const phase = t => t % 4.2;
    add('soul-bopper', {
      still(g, W, H){
        const {wide, cell, bw, bh, bx, by, T} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1C1446'); gr.addColorStop(0.45, '#4B2E78'); gr.addColorStop(1, '#2A1C44'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,248,214,.95)'; g.beginPath(); g.arc(W * (wide ? 0.86 : 0.82), H * 0.11, Math.min(W, H) * 0.06, 0, 7); g.fill();
        g.fillStyle = '#4B2E78'; g.beginPath(); g.arc(W * (wide ? 0.86 : 0.82) + Math.min(W, H) * 0.025, H * 0.1, Math.min(W, H) * 0.055, 0, 7); g.fill();
        // far hills + crooked trees + tiny gravestones
        g.fillStyle = '#2C1E52'; g.beginPath(); g.moveTo(0, by - cell * 0.6); for(let x = 0; x <= W; x += W / 24) g.lineTo(x, by - cell * (1.2 + 0.5 * Math.sin(x / W * 7))); g.lineTo(W, H); g.lineTo(0, H); g.fill();
        const R = rng(31); for(let n = 0; n < 7; n++){ const x = R() * W, y = by - cell * (0.9 + R() * 0.5); g.strokeStyle = '#1A1233'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4, y - cell * 0.9); g.lineTo(x - 8, y - cell * 1.3); g.moveTo(x + 3, y - cell * 0.7); g.lineTo(x + 14, y - cell * 1.0); g.stroke(); }
        for(let n = 0; n < 6; n++){ const x = R() * W, y = by - cell * (0.55 + R() * 0.3); g.fillStyle = '#5A527A'; g.beginPath(); g.roundRect(x, y - cell * 0.3, cell * 0.22, cell * 0.3, [cell * 0.11, cell * 0.11, 0, 0]); g.fill(); }
        // the maze floor (mossy tiles), with a dark rim
        g.fillStyle = '#1B2A22'; g.beginPath(); g.roundRect(bx - cell * 0.25, by - cell * 0.35, bw + cell * 0.5, bh + cell * 0.55, cell * 0.2); g.fill();
        for(let j = 0; j < M; j++) for(let i = 0; i < N; i++){ const p = T(i, j); g.fillStyle = (i + j) % 2 ? '#4E8A55' : '#5C9A60'; g.fillRect(p.x, p.y, cell, cell * 0.78 + 1); }
        // glowing mushrooms on the rim
        for(let n = 0; n < 8; n++){ const x = bx - cell * 0.15 + R() * (bw + cell * 0.3), y = n % 2 ? by - cell * 0.28 : by + bh + cell * 0.12; g.fillStyle = '#EDE6FF'; g.fillRect(x - 1.5, y - 6, 3, 6); g.fillStyle = ['#7CF2D0', '#FF9AE0', '#9AB8FF'][n % 3]; g.beginPath(); g.arc(x, y - 6, 5, Math.PI, 0); g.fill(); }
        // pillars (stone) — drawn back to front so the near ones overlap
        for(let j = 0; j < M; j++) for(let i = 0; i < N; i++) if(PIL(i, j)) block(g, T, cell, i, j, '#A9A4BF', '#6E6886', 0.55);
      },
      live(g, W, H, t){
        const {cell, T, bx, by} = geo(W, H), ph = phase(t);
        // crates (they break while the flames are out, then come back)
        const lit = ph >= 2.4 && ph < 3.0, burnt = ph >= 2.4;
        const inFlame = (i, j) => (j === BOMB[1] && Math.abs(i - BOMB[0]) <= ARM) || (i === BOMB[0] && Math.abs(j - BOMB[1]) <= ARM);
        CR.forEach(([i, j]) => { if(burnt && inFlame(i, j)) return; const p = T(i, j); block(g, T, cell, i, j, '#C88A4A', '#8A5528', 0.42);
          g.strokeStyle = '#6B3F1B'; g.lineWidth = Math.max(1, cell * 0.04); g.strokeRect(p.x + cell * 0.14, p.y - cell * 0.08, cell * 0.72, cell * 0.66); g.beginPath(); g.moveTo(p.x + cell * 0.14, p.y - cell * 0.08); g.lineTo(p.x + cell * 0.86, p.y + cell * 0.58); g.stroke(); });
        // flames: a + down the lanes, stopped by pillars
        if(lit){ const k = (ph - 2.4) / 0.6, a = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8;
          const cells = [[BOMB[0], BOMB[1]]]; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { for(let s = 1; s <= ARM; s++){ const i = BOMB[0] + dx * s, j = BOMB[1] + dy * s; if(i < 0 || j < 0 || i >= N || j >= M || PIL(i, j)) break; cells.push([i, j]); } });
          g.save(); g.globalAlpha = Math.max(0, a); cells.forEach(([i, j]) => { const p = T(i, j), cxp = p.x + cell / 2, cyp = p.y + cell * 0.39;
            const gr = g.createRadialGradient(cxp, cyp, 0, cxp, cyp, cell * 0.62); gr.addColorStop(0, '#FFFBD0'); gr.addColorStop(0.45, '#FFB13B'); gr.addColorStop(1, 'rgba(255,70,40,0)'); g.fillStyle = gr; g.fillRect(p.x - cell * 0.15, p.y - cell * 0.2, cell * 1.3, cell * 1.2); }); g.restore();
          // crate splinters
          CR.forEach(([i, j], n) => { if(!inFlame(i, j)) return; const p = T(i, j); for(let s = 0; s < 4; s++){ const ang = n + s * 1.7, d = k * cell * 0.8; g.fillStyle = '#B07A3E'; g.fillRect(p.x + cell / 2 + Math.cos(ang) * d, p.y + cell * 0.3 + Math.sin(ang) * d - k * cell * 0.4, cell * 0.12, cell * 0.06); } });
        }
        // the bomb: sits, fuse sparks, blinks red, gone during the flames
        if(ph < 2.4){ const p = T(BOMB[0], BOMB[1]), cxp = p.x + cell / 2, cyp = p.y + cell * 0.28, blink = ph > 1.6 && Math.floor(ph * 8) % 2 === 0, sq = 1 + (ph > 1.6 ? Math.sin(ph * 30) * 0.06 : Math.sin(ph * 5) * 0.03);
          g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(cxp, cyp + cell * 0.32, cell * 0.32, cell * 0.1, 0, 0, 7); g.fill();
          g.save(); g.translate(cxp, cyp); g.scale(sq, 1 / sq); g.fillStyle = blink ? '#E8343E' : '#2B2440'; g.beginPath(); g.arc(0, 0, cell * 0.33, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(-cell * 0.11, -cell * 0.11, cell * 0.08, 0, 7); g.fill(); g.restore();
          const fl = Math.max(0, 1 - ph / 2.4), fx = cxp + cell * 0.18, fy = cyp - cell * (0.32 + 0.22 * fl); g.strokeStyle = '#E9D9B0'; g.lineWidth = Math.max(1.5, cell * 0.05); g.beginPath(); g.moveTo(cxp + cell * 0.12, cyp - cell * 0.28); g.quadraticCurveTo(fx + cell * 0.1, fy + cell * 0.1, fx, fy); g.stroke();
          sparkle(g, fx, fy, cell * (0.12 + 0.06 * Math.sin(t * 30)), 1, '#FFE17A'); }
        // the ghost floats up out of the smoke, wobbling, then fades
        if(ph >= 2.7){ const k = (ph - 2.7) / 1.5, p = T(BOMB[0], BOMB[1]), x = p.x + cell / 2 + Math.sin(k * 9) * cell * 0.25, y = p.y - k * cell * 2.1, a = k < 0.15 ? k / 0.15 : k > 0.75 ? (1 - k) / 0.25 : 1, s = cell * 0.5;
          for(let n = 0; n < 5; n++){ g.globalAlpha = 0.25 * (1 - k); g.fillStyle = '#B9B2CF'; g.beginPath(); g.arc(p.x + cell / 2 + (n - 2) * cell * 0.25, p.y + cell * 0.2 - k * cell * 0.5 - n % 2 * cell * 0.15, cell * (0.25 + k * 0.3), 0, 7); g.fill(); }
          g.globalAlpha = Math.max(0, a); g.fillStyle = '#F4F1FF'; g.beginPath(); g.arc(x, y, s, Math.PI, 0); g.lineTo(x + s, y + s * 0.9); for(let w = 0; w < 4; w++) g.quadraticCurveTo(x + s - (w + 0.5) * s / 2, y + s * (w % 2 ? 0.9 : 1.25), x + s - (w + 1) * s / 2, y + s * 0.9); g.closePath(); g.fill();
          g.fillStyle = '#2B2440'; [-1, 1].forEach(d => { g.beginPath(); g.ellipse(x + d * s * 0.35, y - s * 0.05, s * 0.12, s * 0.18, 0, 0, 7); g.fill(); }); g.beginPath(); g.ellipse(x, y + s * 0.35, s * 0.12, s * 0.09, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
        // fireflies
        for(let n = 0; n < 7; n++){ const x = ((n * 0.17 + t * 0.012 * (n % 2 ? 1 : -1)) % 1 + 1) % 1 * W, y = by - cell * (0.6 + (n % 3) * 0.5) + Math.sin(t * 1.3 + n) * cell * 0.3; sparkle(g, x, y, 3.5, 0.4 + 0.4 * Math.sin(t * 3 + n * 2), '#E6FF8A'); }
      },
      spots(W, H){ const z0 = Z; Z = null; try { return this._s(W, H); } finally { Z = z0; } },   /* champions stand where the plain art puts them (the logo zone is built from them) */
      _s(W, H){ const {T, cell, wide} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), base = T(0, M).y + cell * 0.1, fy = Math.min(H - 34 * k, base + (H - base) * 0.55),
          X = f => clamp(W * f, 64 * k, W - 64 * k), W3 = wide ? [0.5, 0.3, 0.7] : [0.5, 0.18, 0.82];
        return [{x: X(W3[0]), y: fy, k}, {x: X(W3[1]), y: fy - 3 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: fy - 3 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER soul-bopper END

  // 🎬 COVER snakeast START — 🐍 Snakize: a sunny meadow grid running into the distance — a long striped snake glides in loops and gulps a shiny apple (a new one pops
  //    up with sparkles and the snake grows a little); a 🏰 castle patch of claimed land on one side (Snakastle), a golden gate ring on the other (Snakigate).
  //    🏆 champions stand on the near edge of the meadow.
  (function(){
    const geo = (W, H) => { const wide = W > H, hy = H * (wide ? 0.32 : 0.33);
      let fw = wide ? Math.min(W * 0.78, H * 1.6) : W * 1.1, cx = W / 2, top = hy + 2, bot = H * (wide ? 0.88 : 0.84);
      if(Z){ const m = Math.max(8, Math.min(W, H) * 0.025), over = !(Z.x + Z.w + m <= cx - fw / 2 || Z.x - m >= cx + fw / 2), t2 = Z.y + Z.h + m;   /* 🏷️ 24j-e + b3w5b: the field starts under the logo (the meadow + sky stay behind it) */
        if(over && t2 > top){ const bot2 = H - Math.max(6, H * 0.02); if(bot - t2 >= (bot - top) * 0.35) top = t2; else if(bot2 - t2 >= (bot - top) * 0.3){ top = t2; bot = bot2; }   /* short art: the meadow runs to the bottom edge */ else { const F = away(cx - fw / 2, top, fw, bot - top, W, H, {only: 'x', min: 0.6}); fw *= F.s; cx = F.x + fw / 2; } } }
      const P = (u, v) => { const s = lerp(0.42, 1, v); return {x: cx + (u - 0.5) * fw * s, y: lerp(top, bot, Math.pow(v, 1.15)), s}; };
      return {wide, hy, P, fw, top, bot}; };
    // the snake's head follows a looping path on the field (u, v)
    const path = t => ({u: 0.5 + 0.3 * Math.sin(t * 0.7) * Math.cos(t * 0.23), v: 0.52 + 0.3 * Math.sin(t * 0.46 + 1.1)});
    const APPLE_EVERY = 3.4;
    add('snakeast', {
      still(g, W, H){
        const {wide, hy, P} = geo(W, H);
        let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#6FD3FF'); gr.addColorStop(1, '#E6FAFF'); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 2);
        g.fillStyle = 'rgba(255,236,150,.95)'; g.beginPath(); g.arc(W * 0.84, hy * 0.38, Math.min(W, H) * 0.055, 0, 7); g.fill();
        [['#A6DE7E', 0.08, 2.2], ['#86CF62', 0.045, 3.1]].forEach(([c, a, f], i) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, hy + 2); for(let x = 0; x <= W; x += W / 40) g.lineTo(x, hy - H * a * (1.1 + Math.sin(x / W * Math.PI * f + i))); g.lineTo(W, hy + 2); g.fill(); });
        g.fillStyle = '#6CBF4F'; g.fillRect(0, hy, W, H - hy);
        // the grid field: checker tiles from far to near
        const NU = 14, NV = 10; for(let j = 0; j < NV; j++) for(let i = 0; i < NU; i++){ const a = P(i / NU, j / NV), b = P((i + 1) / NU, j / NV), c = P((i + 1) / NU, (j + 1) / NV), d = P(i / NU, (j + 1) / NV);
          poly(g, [[a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y]], (i + j) % 2 ? '#9BE06A' : '#8CD45C'); }
        // 🏰 Snakastle land: a claimed patch (purple tint) + a little castle tower, right side
        for(let j = 1; j < 4; j++) for(let i = 10; i < 13; i++){ const a = P(i / NU, j / NV), b = P((i + 1) / NU, j / NV), c = P((i + 1) / NU, (j + 1) / NV), d = P(i / NU, (j + 1) / NV); poly(g, [[a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y]], (i + j) % 2 ? '#B89CF4' : '#A98AEB'); }
        { const p = P(11.5 / NU, 1.6 / NV), s = p.s * Math.min(W, H) / 420; g.fillStyle = '#C9B8F2'; g.fillRect(p.x - 14 * s, p.y - 46 * s, 28 * s, 46 * s); g.fillStyle = '#9C84DB'; for(let n = 0; n < 4; n++) g.fillRect(p.x - 14 * s + n * 8 * s, p.y - 54 * s, 5 * s, 8 * s);
          g.fillStyle = '#5B3FA8'; g.beginPath(); g.roundRect(p.x - 5 * s, p.y - 16 * s, 10 * s, 16 * s, [5 * s, 5 * s, 0, 0]); g.fill(); g.strokeStyle = '#5B3FA8'; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(p.x, p.y - 54 * s); g.lineTo(p.x, p.y - 72 * s); g.stroke();
          g.fillStyle = '#FF6FA8'; g.beginPath(); g.moveTo(p.x, p.y - 72 * s); g.lineTo(p.x + 14 * s, p.y - 67 * s); g.lineTo(p.x, p.y - 62 * s); g.fill(); }
        // flowers + border bushes
        const R = rng(5); for(let n = 0; n < 26; n++){ const side = n % 2, p = P(side ? 1.02 + R() * 0.08 : -0.1 + R() * 0.08, R()), r = 5 * p.s * Math.min(W, H) / 420; g.fillStyle = ['#FF7AB0', '#FFE15C', '#FFFFFF', '#9AD8FF'][n % 4]; for(let a = 0; a < 5; a++){ g.beginPath(); g.arc(p.x + Math.cos(a * 1.26) * r, p.y + Math.sin(a * 1.26) * r, r * 0.6, 0, 7); g.fill(); } g.fillStyle = '#FFB020'; g.beginPath(); g.arc(p.x, p.y, r * 0.5, 0, 7); g.fill(); }
      },
      live(g, W, H, t){
        const {P, wide} = geo(W, H), U = Math.min(W, H) / 420;
        cloud(g, ((t * 9) % (W + 260)) - 130, H * 0.08, U * 0.9, 0.9);
        // 🌀 Snakigate gate ring (left), it glows
        { const p = P(0.14, 0.3), r = 26 * p.s * U; g.save(); g.shadowColor = '#FFD84D'; g.shadowBlur = 10 + 8 * Math.sin(t * 3); g.strokeStyle = '#FFC93D'; g.lineWidth = 6 * p.s * U; g.beginPath(); g.ellipse(p.x, p.y - r, r * 0.7, r, 0, 0, 7); g.stroke(); g.restore();
          g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2 * p.s * U; g.beginPath(); g.ellipse(p.x, p.y - r, r * 0.7, r, 0, -1.2 + t * 2, -0.4 + t * 2); g.stroke(); }
        // the apple: a new spot every APPLE_EVERY s (the head reaches it near the end of each cycle → gulp + sparkles)
        const cyc = Math.floor(t / APPLE_EVERY), into = (t % APPLE_EVERY) / APPLE_EVERY, at = (cyc + 1) * APPLE_EVERY, ap = path(at), apS = P(ap.u, ap.v), grow = Math.min(4, cyc % 5);
        if(into < 0.97){ const r = 13 * apS.s * U, bob = Math.sin(t * 4) * 2; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(apS.x, apS.y + 2, r, r * 0.35, 0, 0, 7); g.fill();
          g.fillStyle = '#FF3D4F'; g.beginPath(); g.arc(apS.x, apS.y - r + bob, r, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(apS.x - r * 0.35, apS.y - r * 1.3 + bob, r * 0.25, 0, 7); g.fill();
          g.fillStyle = '#3B8A2E'; g.beginPath(); g.ellipse(apS.x + r * 0.3, apS.y - r * 2 + bob, r * 0.35, r * 0.18, -0.5, 0, 7); g.fill(); }
        if(into < 0.12){ const p0 = P(path(cyc * APPLE_EVERY).u, path(cyc * APPLE_EVERY).v); for(let n = 0; n < 6; n++){ const a = n * 1.05, d = into / 0.12 * 30 * U; sparkle(g, p0.x + Math.cos(a) * d, p0.y - 20 * U + Math.sin(a) * d, 6 * U, 1 - into / 0.12, '#FFE97A'); } }
        // the snake body: samples back along the path; thick near the head, thinner to the tail
        const L = 26 + grow * 3, pts = []; for(let n = 0; n <= L; n++){ const q = path(t - n * 0.1), p = P(q.u, q.v); pts.push(p); }
        for(let n = L; n >= 0; n--){ const p = pts[n], w = (19 - 9 * n / L) * p.s * U; g.fillStyle = n % 4 < 2 ? '#2FB36A' : '#FFD43B'; g.beginPath(); g.arc(p.x, p.y - w * 0.6, w, 0, 7); g.fill(); }
        // head: eyes look ahead, tongue flicks
        const h = pts[0], h2 = pts[2], ang = Math.atan2(h.y - h2.y, h.x - h2.x), hw = 23 * h.s * U; g.save(); g.translate(h.x, h.y - hw * 0.6); g.rotate(ang);
        g.fillStyle = '#26A15C'; g.beginPath(); g.ellipse(0, 0, hw * 1.15, hw * 0.9, 0, 0, 7); g.fill();
        if(Math.sin(t * 9) > 0.3){ g.strokeStyle = '#FF3D6E'; g.lineWidth = 2.5 * U; g.beginPath(); g.moveTo(hw * 1.1, 0); g.lineTo(hw * 1.6, 0); g.lineTo(hw * 1.8, -hw * 0.18); g.moveTo(hw * 1.6, 0); g.lineTo(hw * 1.8, hw * 0.18); g.stroke(); }
        [-1, 1].forEach(d => { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(hw * 0.35, d * hw * 0.42, hw * 0.3, 0, 7); g.fill(); g.fillStyle = '#1F2235'; g.beginPath(); g.arc(hw * 0.45, d * hw * 0.42, hw * 0.15, 0, 7); g.fill(); }); g.restore();
      },
      spots(W, H){ const z0 = Z; Z = null; try { return this._s(W, H); } finally { Z = z0; } },   /* champions stand where the plain art puts them (the logo zone is built from them) */
      _s(W, H){ const {P} = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), base = P(0.5, 1).y, fy = Math.min(H - 34 * k, base + Math.max(10 * k, (H - base) * 0.5)), X = f => clamp(W * f, 64 * k, W - 64 * k), W3 = W > H ? [0.5, 0.3, 0.7] : [0.5, 0.18, 0.82];
        return [{x: X(W3[0]), y: fy, k}, {x: X(W3[1]), y: fy - 3 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: fy - 3 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER snakeast END

  // 🎬 COVER brawl-buddies START — 🥊 Brawl Buddies: a cartoon boxing ring under spotlights — red + blue corner posts, three ropes that wobble, a cheering dark
  //    hall with camera flashes; two big cartoon gloves dance in the ring, the red one jabs, the blue one ducks, then a big punch lands with a star burst and the ropes
  //    shake (no blood, no faces hurt — just fun). 🏆 champions stand on the ring apron in front.
  (function(){
    const geo = (W, H) => { const wide = W > H; let rw = wide ? Math.min(W * 0.62, H * 1.05) : W * 0.96, cx = W / 2, fy = H * (wide ? 0.7 : 0.64), dep = rw * 0.24;
      /* 🏷️ 24j-e + b3w5b: the ring keeps clear of the logo — it stays centred on the same floor line and shrinks under the logo (the champions in front keep their spots);
         only when there is too little room under it, it steps aside (away) */
      if(Z){ const m = Math.max(8, Math.min(W, H) * 0.025), over = !(Z.x + Z.w + m <= cx - rw / 2 || Z.x - m >= cx + rw / 2), bot = fy + rw * 0.108, room = bot - (Z.y + Z.h + m), need = rw * 0.668;
        const bot2 = H - Math.max(6, H * 0.02), room2 = bot2 - (Z.y + Z.h + m);   /* short art (phone held sideways): the ring may step down to the bottom edge, the champions stand in front of it */
        if(over && room < need){ if(room / need >= 0.3){ rw *= room / need; fy = bot - rw * 0.108; } else if(room2 / need >= 0.3){ rw *= Math.min(1, room2 / need); fy = bot2 - rw * 0.108; }
          else { const F = away(cx - rw / 2, fy - dep - rw * 0.32, rw, dep + rw * 0.32 + rw * 0.09, W, H, {only: 'x', min: 0.5}); rw *= F.s; cx = F.x + rw / 2; } }
        dep = rw * 0.24; }
      // floor corners: far edge narrower + higher (a little perspective)
      const near = {l: cx - rw / 2, r: cx + rw / 2, y: fy}, far = {l: cx - rw * 0.36, r: cx + rw * 0.36, y: fy - dep}, post = rw * 0.3, apron = rw * 0.08;
      return {wide, rw, cx, fy, dep, near, far, post, apron}; };
    function ropes(g, G, t, shake){ const {near, far, post} = G, cols = ['#FF5A5F', '#FFFFFF', '#4D8CFF'];
      for(let r = 0; r < 3; r++){ const h = post * (0.35 + r * 0.25), wob = (k) => Math.sin(k * Math.PI) * (2 + shake * 9) * Math.sin(t * 14 + r);
        g.strokeStyle = cols[r]; g.lineWidth = Math.max(2, post * 0.035); g.beginPath();
        for(let i = 0; i <= 16; i++){ const k = i / 16; g.lineTo(lerp(near.l, near.r, k), near.y - h + wob(k)); } g.stroke(); } }
    function glove(g, x, y, s, col, ang, sq){ g.save(); g.translate(x, y); g.rotate(ang); g.scale(1 + sq, 1 - sq * 0.6);
      g.fillStyle = shade(col, -0.25); g.beginPath(); g.roundRect(-34 * s, -10 * s, 26 * s, 26 * s, 6 * s); g.fill();            // cuff
      g.fillStyle = col; g.beginPath(); g.ellipse(4 * s, 0, 34 * s, 28 * s, 0, 0, 7); g.fill();                                        // fist
      g.beginPath(); g.ellipse(-2 * s, 16 * s, 14 * s, 11 * s, 0.4, 0, 7); g.fill();                                                     // thumb
      g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(10 * s, -12 * s, 14 * s, 7 * s, -0.3, 0, 7); g.fill();
      g.fillStyle = '#FFFFFF'; g.fillRect(-34 * s, -2 * s, 26 * s, 5 * s); g.restore(); }
    add('brawl-buddies', {
      still(g, W, H){
        const G = geo(W, H), {cx, fy, near, far, post, apron, wide} = G;
        let gr = g.createRadialGradient(cx, fy - G.dep, 10, cx, fy - G.dep, Math.max(W, H) * 0.8); gr.addColorStop(0, '#3B2F6E'); gr.addColorStop(1, '#0E0A1F'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        // the crowd: rows of round heads in the dark, lit from the ring
        const R = rng(9); for(let row = 0; row < 4; row++){ const y = far.y - post * (1.2 - row * 0.18), n = Math.ceil(W / (18 + row * 4)); for(let i = 0; i < n; i++){ const x = (i + R() * 0.6) * W / n, r = 7 + row * 2.2;
          g.fillStyle = ['#2A2250', '#332A60', '#3D336F', '#473C7E'][row]; g.beginPath(); g.arc(x, y + R() * 6, r, 0, 7); g.fill(); g.fillRect(x - r * 1.1, y + r * 0.6, r * 2.2, r * 2); } }
        // the hall floor + the ring platform (apron = the side skirt)
        g.fillStyle = '#17112E'; g.fillRect(0, far.y, W, H - far.y);
        poly(g, [[far.l, far.y], [far.r, far.y], [near.r, near.y], [near.l, near.y]], '#4C8FE8');
        gr = g.createLinearGradient(0, far.y, 0, near.y); gr.addColorStop(0, 'rgba(255,255,255,.08)'); gr.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = gr; poly(g, [[far.l, far.y], [far.r, far.y], [near.r, near.y], [near.l, near.y]], null); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, (far.y + near.y) / 2, G.rw * 0.16, G.dep * 0.28, 0, 0, 7); g.stroke();
        g.fillStyle = '#E8454A'; g.fillRect(near.l, near.y, near.r - near.l, apron); g.fillStyle = 'rgba(255,255,255,.85)'; for(let i = 0; i < 9; i++){ const x = lerp(near.l, near.r, (i + 0.5) / 9); g.beginPath(); g.arc(x, near.y + apron / 2, apron * 0.18, 0, 7); g.fill(); }
        g.fillStyle = '#8E1F2D'; g.fillRect(near.l, near.y + apron, near.r - near.l, apron * 0.35);
        // back ropes (between the far posts) + far posts
        const cols = ['#FF5A5F', '#FFFFFF', '#4D8CFF']; for(let r = 0; r < 3; r++){ g.strokeStyle = cols[r]; g.globalAlpha = 0.8; g.lineWidth = Math.max(1.5, post * 0.025); const h = post * 0.75 * (0.35 + r * 0.25);
          g.beginPath(); g.moveTo(far.l, far.y - h); g.lineTo(far.r, far.y - h); g.moveTo(far.l, far.y - h); g.lineTo(near.l, near.y - post * (0.35 + r * 0.25)); g.moveTo(far.r, far.y - h); g.lineTo(near.r, near.y - post * (0.35 + r * 0.25)); g.stroke(); } g.globalAlpha = 1;
        [[far.l, far.y, '#E8454A', 0.75], [far.r, far.y, '#3E7BFF', 0.75]].forEach(([x, y, c, f]) => { g.fillStyle = c; g.fillRect(x - post * 0.04, y - post * f, post * 0.08, post * f); });
      },
      live(g, W, H, t){
        const G = geo(W, H), {cx, fy, near, far, post, rw} = G, s = rw / 620;
        // spotlights from above + camera flashes
        [0.3, 0.7].forEach((f, i) => { const x = W * f + Math.sin(t * 0.6 + i * 3) * W * 0.05; g.save(); g.globalAlpha = 0.12; g.fillStyle = '#FFF4C8'; g.beginPath(); g.moveTo(x, 0); g.lineTo(cx - rw * 0.32 + i * rw * 0.2, fy); g.lineTo(cx - rw * 0.08 + i * rw * 0.36, fy); g.closePath(); g.fill(); g.restore(); });
        for(let i = 0; i < 5; i++){ const k = (t * 1.1 + i * 0.29) % 1; if(k < 0.07){ const x = ((i * 0.23 + Math.floor(t * 1.1 + i * 0.29) * 0.31) % 1) * W, y = far.y - post * (0.6 + (i % 3) * 0.2); sparkle(g, x, y, 10, 1 - k / 0.07, '#FFFFFF'); } }
        // the bout (3 s loop): 0..1.4 dance, 1.4..1.7 red jab (blue ducks), 1.7..2.2 wind-up, 2.2..2.5 BIG punch lands + star, 2.5..3 blue wobbles back
        const ph = t % 3, mid = (far.y + near.y) / 2 - post * 0.55, bob = Math.sin(t * 6) * 6 * s;
        let rx = cx - rw * 0.17, bx = cx + rw * 0.17, ra = 0, ba = Math.PI, rq = 0, bq = 0, by = mid + bob, ryy = mid - bob, hit = 0;
        if(ph >= 1.4 && ph < 1.7){ const k = Math.sin((ph - 1.4) / 0.3 * Math.PI); rx += rw * 0.12 * k; by += 26 * s * k; }
        else if(ph >= 1.7 && ph < 2.2){ const k = (ph - 1.7) / 0.5; rx -= rw * 0.06 * k; ra = -0.25 * k; rq = 0.06 * k; }               // anticipation: pull back
        else if(ph >= 2.2 && ph < 2.5){ const k = Math.min(1, (ph - 2.2) / 0.08); rx += rw * (0.16 * k - 0.06); ra = -0.25 + 0.25 * k; rq = -0.1 * k; hit = 1 - (ph - 2.2) / 0.3; bx += rw * 0.05 * k; ba = Math.PI + 0.3 * k; bq = 0.12 * hit; }   // contact (held)
        else if(ph >= 2.5){ const k = (ph - 2.5) / 0.5; bx += rw * 0.05 * (1 - k) + Math.sin(k * 12) * 6 * s * (1 - k); ba = Math.PI + 0.3 * (1 - k); }   // follow-through + settle
        glove(g, bx, by, s * 1.25, '#3E7BFF', ba, bq); glove(g, rx, ryy, s * 1.25, '#FF4B55', ra, rq);
        if(hit > 0){ const x = (rx + bx) / 2 + rw * 0.02, y = (ryy + by) / 2, r = (40 + 30 * (1 - hit)) * s;
          g.save(); g.globalAlpha = Math.min(1, hit * 1.6); g.fillStyle = '#FFE14D'; g.strokeStyle = '#FF8A1F'; g.lineWidth = 3 * s; g.beginPath(); for(let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2, rr = i % 2 ? r * 0.5 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke();
          for(let i = 0; i < 6; i++){ const a = i * 1.05 + 0.3, d = r * (1.1 + (1 - hit) * 0.8); sparkle(g, x + Math.cos(a) * d, y + Math.sin(a) * d, 7 * s, hit, '#FFFFFF'); } g.restore(); }
        // near posts + front ropes (in front of the gloves), they shake on the big hit
        ropes(g, G, t, hit);
        [[near.l, '#E8454A'], [near.r, '#3E7BFF']].forEach(([x, c]) => { g.fillStyle = c; g.fillRect(x - post * 0.05, near.y - post, post * 0.1, post); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x, near.y - post, post * 0.07, 0, 7); g.fill(); });
      },
      spots(W, H){ const z0 = Z; Z = null; try { return this._s(W, H); } finally { Z = z0; } },   /* champions stand where the plain art puts them (the logo zone is built from them) */
      _s(W, H){ const G = geo(W, H), k = clamp(Math.min(H, W * 1.15) / 560, 0.4, 0.95), base = G.near.y + G.apron * 1.35, fy = Math.min(H - 34 * k, base + Math.max(14 * k, (H - base) * 0.6)), X = f => clamp(W * f, 64 * k, W - 64 * k), W3 = W > H ? [0.5, 0.3, 0.7] : [0.5, 0.18, 0.82];
        return [{x: X(W3[0]), y: fy, k}, {x: X(W3[1]), y: fy - 3 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: fy - 3 * k, k: k * 0.95, from: 1, dir: -1}]; }
    });
  })();
  // 🎬 COVER brawl-buddies END

  root.GameCovers = {add, still, live, spots, away, has: id => !!C[id], ids: () => Object.keys(C).filter(k => k !== '_default'), VERSION: '24j-e'};
})(window);
