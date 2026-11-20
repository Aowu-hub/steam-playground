
/* 🎬 Cover_sciencetory — 📏 b6a: the "sciencetory" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER sciencetory START — 🔬 Sciencetory (🔬 Sciencetory chat, sc-7): a Glow Glass night lab — deep-blue room with soft nebula glows, a round
  //    observatory window (stars, a ringed planet, the Moon), a glowing periodic-table wall chart, turning gold gears, and a long glass lab bench:
  //    a white beam hits a prism and fans into a rainbow, lime / violet / cyan flasks bubble, a test-tube rack, a little microscope; an atom
  //    model floats over the bench with electrons racing round. Floor = dark glass with a cyan grid. 🏆 champions stand in front of the bench.
  (function(){
    const T = {wall1: '#0B1030', wall2: '#1B1150', floor1: '#0E1440', floor2: '#05081C', grid: 'rgba(90,220,255,', rim: '#2EE6FF', vio: '#A970FF',
      lime: '#9BFF4A', gold: '#FFC94A', bench: '#1E2A5E', benchTop: '#5FE3FF'};
    const RAIN = ['#FF4D6D', '#FF9F1C', '#FFE14D', '#5CFF7A', '#38C8FF', '#8C6CFF'];
    const geo = (W, H) => {
      const wide = W > H * 1.05, R = Math.min(W, H), bh = R * 0.075, m = Math.max(8, R * 0.025);
      let bw = wide ? Math.min(W * 0.56, H * 1.15) : W * 0.86, cx = W * 0.5, by = H * (wide ? 0.58 : 0.6);
      if(Z){ const need = Z.y + Z.h + m + bh * 3.4; if(need > by) by = Math.min(H * 0.84, need); }   /* 🏷️ the bench + glassware start under the logo block (logo · story line · 🏆 chip) */
      const hy = by + H * 0.02;
      const top = by - bh * 3.4;                                   /* the bench + its glassware = the main piece (the atom finds its own spot) */
      const A = away(cx - bw / 2, top, bw, by + bh - top, W, H, {only: 'x', min: 0.6});
      if(A.s < 1 || A.x !== cx - bw / 2){ bw *= A.s; cx = A.x + bw / 2; }
      const s = bw / (wide ? Math.min(W * 0.56, H * 1.15) : W * 0.86);
      const clear = (x, y, r) => !Z || x + r < Z.x - 10 || x - r > Z.x + Z.w + 10 || y + r < Z.y - 10 || y - r > Z.y + Z.h + 10;   /* 🏷️ keep clear of the cover logo */
      const wins = wide ? [[W * 0.86, H * 0.26, H * 0.17], [W * 0.88, H * 0.3, H * 0.13], [W * 0.9, H * 0.34, H * 0.1]]
                        : [[W * 0.78, H * 0.2, W * 0.17], [W * 0.875, H * 0.16, W * 0.105]];
      const wf = wins.find(q => clear(q[0], q[1], q[2] * 1.12)), win = wf ? {x: wf[0], y: wf[1], r: wf[2]} : null;
      const ar = R * 0.1 * s, atoms = [[cx - bw * 0.13, by - R * (wide ? 0.27 : 0.25) * s], [cx - bw * 0.3, by - R * 0.22 * s], [cx + bw * 0.12, by - R * 0.22 * s]];
      const af = atoms.find(q => clear(q[0], q[1], ar * 1.1) && (!win || Math.hypot(q[0] - win.x, q[1] - win.y) > win.r * 1.15 + ar));
            const free = (x, y, w, h) => !Z || ((x > Z.x + Z.w + m || x + w < Z.x - m || y > Z.y + Z.h + m || y + h < Z.y - m)
        && (y > Z.y + Z.h + m || y + h < Z.y + Z.h - 46));   /* the story line + 🏆 chip row can be wider than the zone → that row counts as taken edge to edge */
      const cw = Math.min(W * 0.016, H * 0.022), cy = [H * 0.36, Z ? Z.y + Z.h + m * 2 : -1].find(y => y > 0 && free(W * 0.04 - cw * 0.6, y - cw * 0.6, cw * 19.2, cw * 6.4) && y + cw * 5.8 < hy - R * 0.1);   /* 🧪 the wall chart, only where it is free */
      const chart = wide && cy ? {cw, y: cy} : null;
      const gr = R * (wide ? 0.045 : 0.06), gp = (wide ? [[W * 0.07, H * 0.555], [W * 0.07, hy - gr * 1.25]] : [[W * 0.8, H * 0.41], [W * 0.12, H * 0.44]]).find(q => free(q[0] - gr, q[1] - gr * 1.7, gr * 2.8, gr * 2.7) && q[1] + gr < hy + gr * 0.3
        && !(chart && q[1] + gr > chart.y - cw * 0.6 && q[1] - gr * 1.7 < chart.y + cw * 5.8 && q[0] - gr < W * 0.04 + cw * 18.6));   /* ⚙️ not over the chart */   /* ⚙️ gears, only where they are free */
      return {wide, hy, bw, cx, by, bh: bh * s, s, R, win, chart, gears: gp ? {x: gp[0], y: gp[1], r: gr} : null, atom: af ? {x: af[0], y: af[1], r: ar} : null};
    };
    function gear(g, x, y, r, n, a, col){
      g.save(); g.translate(x, y); g.rotate(a); g.beginPath();
      for(let i = 0; i < n * 2; i++){ const q = i * Math.PI / n, rr = i % 2 ? r * 0.8 : r; g.lineTo(Math.cos(q - 0.12) * rr, Math.sin(q - 0.12) * rr); g.lineTo(Math.cos(q + 0.12) * rr, Math.sin(q + 0.12) * rr); }
      g.closePath(); g.fillStyle = col; g.shadowColor = 'rgba(255,200,80,0.55)'; g.shadowBlur = r * 0.35; g.fill(); g.shadowBlur = 0;
      g.fillStyle = shade(col, -0.45); g.beginPath(); g.arc(0, 0, r * 0.32, 0, 7); g.fill();
      g.fillStyle = shade(col, 0.35); g.beginPath(); g.arc(0, 0, r * 0.14, 0, 7); g.fill(); g.restore();
    }
    function flask(g, x, y, h, col, kind){   // y = the bench top under the flask
      g.save(); const w = h * 0.62; g.lineWidth = Math.max(1.5, h * 0.05); g.strokeStyle = 'rgba(220,250,255,0.9)';
      g.beginPath();
      if(kind === 'cone'){ g.moveTo(x - w * 0.16, y - h); g.lineTo(x - w * 0.16, y - h * 0.62); g.lineTo(x - w * 0.5, y); g.lineTo(x + w * 0.5, y); g.lineTo(x + w * 0.16, y - h * 0.62); g.lineTo(x + w * 0.16, y - h); }
      else { g.moveTo(x - w * 0.13, y - h); g.lineTo(x - w * 0.13, y - h * 0.6); g.arc(x, y - h * 0.3, w * 0.42, -Math.PI / 2 - 0.32, Math.PI * 1.5 + 0.32, true); g.lineTo(x + w * 0.13, y - h); }
      g.save(); g.clip(); const lq = g.createLinearGradient(0, y - h * 0.5, 0, y); lq.addColorStop(0, shade(col, 0.25)); lq.addColorStop(1, shade(col, -0.25));
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x - w, y - h, w * 2, h); g.fillStyle = lq; g.shadowColor = col; g.shadowBlur = h * 0.5; g.fillRect(x - w, y - h * (kind === 'cone' ? 0.42 : 0.5), w * 2, h); g.restore();
      g.shadowColor = col; g.shadowBlur = h * 0.25; g.stroke(); g.shadowBlur = 0;
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x - w * 0.3, y - h * 0.45, w * 0.06, h * 0.3); g.restore();
    }
    function chart(g, x, y, cw){   // a periodic-table shape of glowing tiles (no letters)
      const cols = ['#FF7A8A', '#FFB86B', '#FFE07A', '#7CF29A', '#6FD3FF', '#A98BFF', '#FF8BD8'], pad = cw * 0.16;
      const rowsOf = r => r === 0 ? [0, 17] : r < 3 ? [0, 1, 12, 13, 14, 15, 16, 17] : Array.from({length: 18}, (_, i) => i);
      g.save(); g.fillStyle = 'rgba(10,20,60,0.75)'; g.strokeStyle = 'rgba(120,230,255,0.55)'; g.lineWidth = 1.5;
      g.beginPath(); g.roundRect ? g.roundRect(x - cw * 0.6, y - cw * 0.6, cw * 19.2, cw * 6.4, cw * 0.4) : g.rect(x - cw * 0.6, y - cw * 0.6, cw * 19.2, cw * 6.4); g.fill(); g.stroke();
      for(let r = 0; r < 5; r++) rowsOf(r).forEach(c => { const k = c < 2 ? 0 : c < 12 ? 1 + (c % 2) : 3 + Math.min(3, c - 12) % 4; g.fillStyle = cols[(k + r) % cols.length];
        g.globalAlpha = 0.85; g.fillRect(x + c * cw + pad / 2, y + r * cw + pad / 2, cw - pad, cw - pad); });
      g.restore();
    }
    function microscope(g, x, y, h){
      g.save(); g.strokeStyle = '#CFE8FF'; g.fillStyle = '#7FA3D8'; g.lineCap = 'round'; g.lineWidth = h * 0.09;
      g.beginPath(); g.moveTo(x - h * 0.3, y); g.lineTo(x + h * 0.25, y); g.stroke();
      g.beginPath(); g.moveTo(x + h * 0.12, y); g.quadraticCurveTo(x + h * 0.32, y - h * 0.5, x + h * 0.05, y - h * 0.8); g.stroke();
      g.lineWidth = h * 0.13; g.strokeStyle = '#E7F4FF'; g.beginPath(); g.moveTo(x - h * 0.05, y - h * 0.95); g.lineTo(x - h * 0.2, y - h * 0.45); g.stroke();
      g.fillStyle = T.rim; g.shadowColor = T.rim; g.shadowBlur = h * 0.2; g.beginPath(); g.arc(x - h * 0.22, y - h * 0.38, h * 0.05, 0, 7); g.fill(); g.restore();
    }
    add('sciencetory', {
      still(g, W, H){
        const G = geo(W, H), R = G.R;
        const wg = g.createLinearGradient(0, 0, 0, G.hy); wg.addColorStop(0, T.wall1); wg.addColorStop(1, T.wall2); g.fillStyle = wg; g.fillRect(0, 0, W, G.hy);
        [[0.18, 0.22, T.vio], [0.62, 0.12, '#2EC8FF'], [0.42, 0.5, '#FF5FC8']].forEach(([fx, fy, c]) => { const r = R * 0.55, gr = g.createRadialGradient(W * fx, H * fy, 0, W * fx, H * fy, r);
          gr.addColorStop(0, c + '33'); gr.addColorStop(1, c + '00'); g.fillStyle = gr; g.fillRect(0, 0, W, G.hy); });
        const Rn = rng(11); for(let i = 0; i < 60; i++){ g.fillStyle = 'rgba(200,230,255,' + (0.15 + Rn() * 0.35) + ')'; g.beginPath(); g.arc(Rn() * W, Rn() * G.hy * 0.95, 0.6 + Rn() * 1.3, 0, 7); g.fill(); }
        // 🪟 observatory window
        const w = G.win; if(w){ g.save(); g.beginPath(); g.arc(w.x, w.y, w.r, 0, 7); g.clip();
        const sk = g.createRadialGradient(w.x - w.r * 0.3, w.y - w.r * 0.3, 0, w.x, w.y, w.r * 1.1); sk.addColorStop(0, '#2B2A8C'); sk.addColorStop(1, '#070A26'); g.fillStyle = sk; g.fillRect(w.x - w.r, w.y - w.r, w.r * 2, w.r * 2);
        const Rs = rng(5); for(let i = 0; i < 40; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.4 + Rs() * 0.6) + ')'; g.beginPath(); g.arc(w.x - w.r + Rs() * w.r * 2, w.y - w.r + Rs() * w.r * 2, 0.6 + Rs() * 1.4, 0, 7); g.fill(); }
        const px = w.x + w.r * 0.25, py = w.y + w.r * 0.22, pr = w.r * 0.3; const pg = g.createRadialGradient(px - pr * 0.4, py - pr * 0.4, 0, px, py, pr); pg.addColorStop(0, '#FFD59A'); pg.addColorStop(1, '#E0703A');
        g.strokeStyle = 'rgba(255,220,170,0.85)'; g.lineWidth = pr * 0.12; g.beginPath(); g.ellipse(px, py, pr * 1.75, pr * 0.42, -0.35, Math.PI, 2 * Math.PI); g.stroke();
        g.fillStyle = pg; g.beginPath(); g.arc(px, py, pr, 0, 7); g.fill();
        g.beginPath(); g.ellipse(px, py, pr * 1.75, pr * 0.42, -0.35, 0, Math.PI); g.stroke();
        g.fillStyle = '#F4F1FF'; g.beginPath(); g.arc(w.x - w.r * 0.45, w.y - w.r * 0.35, w.r * 0.16, 0, 7); g.fill(); g.fillStyle = '#1B1A6A'; g.beginPath(); g.arc(w.x - w.r * 0.38, w.y - w.r * 0.4, w.r * 0.15, 0, 7); g.fill();
        g.restore();
        g.save(); g.strokeStyle = '#8FA8D8'; g.lineWidth = w.r * 0.11; g.shadowColor = T.rim; g.shadowBlur = w.r * 0.25; g.beginPath(); g.arc(w.x, w.y, w.r, 0, 7); g.stroke();
        g.shadowBlur = 0; g.lineWidth = w.r * 0.04; g.beginPath(); g.moveTo(w.x - w.r, w.y); g.lineTo(w.x + w.r, w.y); g.moveTo(w.x, w.y - w.r); g.lineTo(w.x, w.y + w.r); g.stroke();
        for(let i = 0; i < 8; i++){ const q = i * Math.PI / 4; g.fillStyle = '#C9D6F2'; g.beginPath(); g.arc(w.x + Math.cos(q) * w.r, w.y + Math.sin(q) * w.r, w.r * 0.035, 0, 7); g.fill(); }
        g.restore(); }
        // 🧪 wall chart (wide screens: left of the bench, under the title; tall: hidden — no room)
        if(G.chart) chart(g, W * 0.04, G.chart.y, G.chart.cw);
        // floor = dark glass + cyan grid
        const fg = g.createLinearGradient(0, G.hy, 0, H); fg.addColorStop(0, T.floor1); fg.addColorStop(1, T.floor2); g.fillStyle = fg; g.fillRect(0, G.hy, W, H - G.hy);
        const P = persp(W, H, G.hy, 2.2); g.lineWidth = 1;
        for(let i = -8; i <= 8; i++){ const a = P(0.5 + i / 16, 0), b = P(0.5 + i / 16, 1); g.strokeStyle = T.grid + (0.18 - Math.abs(i) * 0.012) + ')'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        for(let j = 1; j <= 7; j++){ const v = Math.pow(j / 7, 1.6), a = P(-0.5, v), b = P(1.5, v); g.strokeStyle = T.grid + (0.07 + v * 0.12) + ')'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        g.fillStyle = 'rgba(46,230,255,0.35)'; g.fillRect(0, G.hy - 1, W, 2);
        // 🔬 bench
        const bx = G.cx - G.bw / 2, bw = G.bw, by = G.by, bh = G.bh;
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(G.cx, by + bh * 2.6, bw * 0.55, bh * 0.7, 0, 0, 7); g.fill();
        g.fillStyle = shade(T.bench, -0.25); [0.06, 0.94].forEach(f => g.fillRect(bx + bw * f - bh * 0.25, by + bh * 0.5, bh * 0.5, bh * 2.1));
        const bg = g.createLinearGradient(0, by, 0, by + bh * 1.6); bg.addColorStop(0, '#2C3C86'); bg.addColorStop(1, T.bench); g.fillStyle = bg; g.fillRect(bx, by + bh * 0.25, bw, bh * 1.4);
        g.fillStyle = 'rgba(95,227,255,0.25)'; g.fillRect(bx, by, bw, bh * 0.3); g.save(); g.shadowColor = T.benchTop; g.shadowBlur = bh * 0.8; g.fillStyle = T.benchTop; g.fillRect(bx, by - 1, bw, Math.max(2, bh * 0.08)); g.restore();
        for(let i = 0; i < 4; i++){ g.strokeStyle = 'rgba(120,200,255,0.25)'; g.lineWidth = 1; g.strokeRect(bx + bw * (0.08 + i * 0.22), by + bh * 0.55, bw * 0.18, bh * 0.85); }
        // 🌈 prism on the left end (the beam + rainbow are live)
        const ps = bh * 2.1, prx = bx + bw * 0.2; g.save(); g.fillStyle = 'rgba(200,240,255,0.35)'; g.strokeStyle = '#E8FBFF'; g.lineWidth = 2; g.shadowColor = '#E8FBFF'; g.shadowBlur = ps * 0.3;
        poly(g, [[prx, by - ps], [prx - ps * 0.6, by], [prx + ps * 0.6, by]], 'rgba(200,240,255,0.35)', '#E8FBFF', 2); g.restore();
        const lx = bx + bw * 0.035, ly = by - ps * 0.5; g.fillStyle = '#6F86D6'; g.fillRect(lx + bh * 0.25, ly, bh * 0.3, by - ly); g.fillStyle = '#4B5FA8'; g.fillRect(lx, ly - bh * 0.4, bh * 1.1, bh * 0.8);
        g.save(); g.fillStyle = '#FFFFFF'; g.shadowColor = '#FFFFFF'; g.shadowBlur = bh * 0.7; g.beginPath(); g.arc(lx + bh * 1.1, ly, bh * 0.2, 0, 7); g.fill(); g.restore();
        // flasks + rack + microscope
        const fh = bh * 2.6;
        flask(g, bx + bw * 0.5, by, fh, T.lime, 'cone');
        flask(g, bx + bw * 0.62, by, fh * 0.85, T.vio, 'round');
        const rx = bx + bw * 0.73, rw = bw * 0.1; g.fillStyle = '#6E86C8'; g.fillRect(rx, by - bh * 0.7, rw, bh * 0.22);
        ['#FF5F8A', '#FFD34D', '#38D1FF'].forEach((c, i) => { const tx = rx + rw * (0.18 + i * 0.32); g.fillStyle = 'rgba(230,248,255,0.35)'; g.fillRect(tx - bh * 0.13, by - bh * 1.9, bh * 0.26, bh * 1.9);
          g.save(); g.shadowColor = c; g.shadowBlur = bh * 0.6; g.fillStyle = c; g.fillRect(tx - bh * 0.1, by - bh * (0.9 + i * 0.25), bh * 0.2, bh * (0.9 + i * 0.25)); g.restore(); });
        microscope(g, bx + bw * 0.91, by, bh * 2.4);
        // ⚛️ atom nucleus (orbits + electrons are live)
        const A = G.atom; if(A){ g.save(); g.shadowColor = T.rim; g.shadowBlur = A.r * 0.6;
        [[-0.12, -0.06, '#FF5F7A'], [0.1, -0.08, '#5FA8FF'], [0, 0.1, '#FF5F7A'], [-0.08, 0.1, '#5FA8FF'], [0.12, 0.08, '#FF5F7A']].forEach(([dx, dy, c]) => { const r = A.r * 0.13; const gr = g.createRadialGradient(A.x + dx * A.r - r * 0.4, A.y + dy * A.r - r * 0.4, 0, A.x + dx * A.r, A.y + dy * A.r, r);
          gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.3, c); gr.addColorStop(1, shade(c, -0.4)); g.fillStyle = gr; g.beginPath(); g.arc(A.x + dx * A.r, A.y + dy * A.r, r, 0, 7); g.fill(); });
        g.restore();
        g.save(); g.strokeStyle = 'rgba(46,230,255,0.55)'; g.lineWidth = Math.max(1.5, A.r * 0.035); g.shadowColor = T.rim; g.shadowBlur = A.r * 0.25;
        [0, Math.PI / 3, -Math.PI / 3].forEach(q => { g.beginPath(); g.ellipse(A.x, A.y, A.r, A.r * 0.34, q, 0, 7); g.stroke(); }); g.restore(); }
      },
      live(g, W, H, t){
        const G = geo(W, H), R = G.R, bx = G.cx - G.bw / 2, bw = G.bw, by = G.by, bh = G.bh;
        // ⚙️ gears on the wall (left; on tall screens they sit low-left, under the title)
        if(G.gears){ const gr = G.gears.r, gx = G.gears.x, gy = G.gears.y;
          gear(g, gx, gy, gr, 10, t * 0.6, T.gold); gear(g, gx + gr * 1.62, gy - gr * 0.62, gr * 0.65, 7, -t * 0.6 * 10 / 7 + 0.2, shade(T.gold, -0.12)); }
        // ✨ twinkles in the window
        const w = G.win; if(w) for(let i = 0; i < 4; i++){ const q = i * 1.7 + 0.6, rr = w.r * (0.35 + 0.15 * i); sparkle(g, w.x + Math.cos(q) * rr * 0.8, w.y + Math.sin(q) * rr * 0.7, w.r * 0.06 * (1 + 0.5 * Math.sin(t * 3 + i * 2)), 0.5 + 0.4 * Math.sin(t * 2.2 + i)); }
        // 🌈 the beam: white light in from the left → prism → a rainbow fanning out over the bench
        const ps = bh * 2.1, prx = bx + bw * 0.2, hit = {x: prx - ps * 0.3, y: by - ps * 0.5}, out = {x: prx + ps * 0.3, y: by - ps * 0.5}, pul = 0.75 + 0.25 * Math.sin(t * 2.4);
        g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,255,255,' + (0.7 * pul) + ')'; g.lineWidth = Math.max(2, bh * 0.14); g.shadowColor = '#FFFFFF'; g.shadowBlur = bh * 0.6;
        const lx = bx + bw * 0.035; g.beginPath(); g.moveTo(lx + bh * 1.1, hit.y); g.lineTo(hit.x, hit.y); g.stroke(); g.shadowBlur = 0;
        const len = bw * 0.16; RAIN.forEach((c, i) => { const a = -0.22 + i * 0.075; g.strokeStyle = c; g.globalAlpha = 0.55 * pul; g.lineWidth = Math.max(2, bh * 0.16);
          g.beginPath(); g.moveTo(out.x, out.y); g.lineTo(out.x + Math.cos(a) * len, out.y + Math.sin(a) * len); g.stroke(); }); g.restore();
        // 🫧 bubbles from the flasks
        const fh = bh * 2.6; [[bx + bw * 0.5, fh, T.lime], [bx + bw * 0.62, fh * 0.85, T.vio]].forEach(([fx, h, c], j) => { for(let i = 0; i < 4; i++){ const p = ((t * 0.45 + i / 4 + j * 0.13) % 1);
          g.globalAlpha = 0.85 * (1 - p); g.strokeStyle = shade(c, 0.4); g.lineWidth = 1.5; g.beginPath(); g.arc(fx + Math.sin(p * 9 + i) * h * 0.08, by - h - p * h * 0.9, h * (0.04 + p * 0.06), 0, 7); g.stroke(); } }); g.globalAlpha = 1;
        // ⚛️ electrons racing round the 3 orbits
        const A = G.atom; if(A) [0, Math.PI / 3, -Math.PI / 3].forEach((q, i) => { const a = t * (1.6 + i * 0.35) + i * 2.1, ex = Math.cos(a) * A.r, ey = Math.sin(a) * A.r * 0.34;
          const x = A.x + ex * Math.cos(q) - ey * Math.sin(q), y = A.y + ex * Math.sin(q) + ey * Math.cos(q);
          g.save(); g.fillStyle = '#E9FFFF'; g.shadowColor = T.rim; g.shadowBlur = A.r * 0.25; g.beginPath(); g.arc(x, y, Math.max(2.5, A.r * 0.07), 0, 7); g.fill(); g.restore(); });
      },
      spots(W, H){
        const G = geo(W, H), P = persp(W, H, G.hy, 2.2), cands = [];
        for(let u = 0.08; u <= 0.92; u += 0.04) for(const v of [0.45, 0.55, 0.65, 0.75, 0.85, 0.95]){ const p = P(u, v); if(p.y > Math.min(G.by + G.bh * 2.4, H - 60)) cands.push(p); }
        const kOf = s => clamp(Math.min(H, W * 1.15) / 470, 0.4, 0.95) * clamp(s, 0.8, 1.05);
        return pick3(cands, W, H, kOf);
      }
    });
  })();
  // 🎬 COVER sciencetory END
  K.loaded('sciencetory', 'b6a');
})(window.GameCovers && window.GameCovers._K);
