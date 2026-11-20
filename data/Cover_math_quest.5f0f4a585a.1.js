
/* 🎬 Cover_math_quest — 📏 b6a: the "math-quest" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER math-quest START — 🧮 Math Quest: an adventure path over green hills — round stepping stones wind up to a glowing ⭐ gate on the far hill,
  //    a rocket waits on its pad beside a planet in the sky (the five worlds: school · space · lab · animals · market far away). A big question card floats
  //    over the path (6 + 2 = ?) with four answer bubbles and a shrinking time bar; the 🦉 owl sits on the card's corner. Live: the bubbles bob, the 8
  //    glows, flies up into the ? and clicks in, the card flashes green with a tick, the stones light up one by one towards the gate, the owl flaps;
  //    the rival ⏰ Ticky (an alarm clock on the hill) rings and spins its hands, then wobbles. 🏆 champions stand on the path in front. (🧱 b3w6c, 2026-11-17)
  (function(){
    const CYC = 6.2, ANS = ['5', '8', '3', '7'], RIGHT = 1;
    const FONT = px => '700 ' + Math.max(6, Math.round(px)) + "px 'Fredoka', 'Nunito', sans-serif";
    const geo = (W, H) => {
      const wide = W > H * 1.05, hy = H * (wide ? 0.5 : 0.52);
      let cw = wide ? Math.min(W * 0.42, H * 0.82) : Math.min(W * 0.78, H * 0.6), cx = W / 2 - cw / 2, cy = H * (wide ? 0.16 : 0.2);
      const ch = cw * 0.4, bh = cw * 0.24;   // the card + the answer row under it
      if(Z){ const m = Math.max(8, Math.min(W, H) * 0.025), bh0 = ch + bh * 1.25, t2 = Z.y + Z.h + m, over = !(Z.x + Z.w + m <= cx || Z.x - m >= cx + cw || Z.y - m >= cy + bh0 || t2 <= cy);
        if(over){ const room = (Z.floor > H * 0.4 ? Z.floor : H) - t2, room2 = H - Math.max(6, H * 0.02) - t2;   /* 🏷️ the card stays centred and starts under the logo */
          const k = Math.min(1, room / bh0), k2 = Math.min(1, room2 / bh0);
          if(k >= 0.6 || k2 >= 0.45){ const kk = k >= 0.6 ? k : k2; cw *= kk; cx = W / 2 - cw / 2; cy = t2; }   /* short art: the card + answers may come down to the bottom edge */
          else { const F = away(cx, cy, cw, bh0, W, H); cw *= F.s; cx = F.x; cy = F.y; } } }
      const ch2 = cw * 0.4, bh2 = cw * 0.24;
      return {wide, hy, cw, cx, cy, ch: ch2, bh: bh2, ay: cy + ch2 + bh2 * 0.72, ax: k => cx + cw * (0.14 + k * 0.24)};
    };
    const path = (W, H, hy) => { const P = persp(W, H, hy, 1.1); return v => { const u = 0.5 + Math.sin(v * 3.2 + 0.4) * 0.14 * (1 - v * 0.4) + (1 - v) * 0.08; return P(u, v); }; };
    const STONES = [0.98, 0.84, 0.71, 0.59, 0.48, 0.38, 0.29, 0.21, 0.14, 0.08];
    function owl(g, x, y, s, t, flap){
      g.save(); g.translate(x, y);
      const w = flap ? Math.sin(t * 24) * 0.7 : Math.sin(t * 1.5) * 0.08;
      [-1, 1].forEach(k => { g.save(); g.translate(k * 13 * s, -16 * s); g.rotate(k * (0.3 + w)); g.fillStyle = '#8A5A2E'; g.beginPath(); g.ellipse(k * 4 * s, 4 * s, 7 * s, 13 * s, 0, 0, 7); g.fill(); g.restore(); });
      g.fillStyle = '#B07A45'; g.strokeStyle = '#5E3A18'; g.lineWidth = 1.8 * s; g.beginPath(); g.ellipse(0, -18 * s, 15 * s, 19 * s, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#F3D9B1'; g.beginPath(); g.ellipse(0, -12 * s, 9 * s, 11 * s, 0, 0, 7); g.fill();
      [-1, 1].forEach(k => { g.fillStyle = '#5E3A18'; g.beginPath(); g.moveTo(k * 6 * s, -34 * s); g.lineTo(k * 13 * s, -42 * s); g.lineTo(k * 12 * s, -31 * s); g.fill(); });
      const bl = (t % 3.7) < 0.12 ? 0.15 : 1;
      [-1, 1].forEach(k => { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(k * 6 * s, -26 * s, 5.5 * s, 0, 7); g.fill(); g.fillStyle = '#20140A'; g.beginPath(); g.ellipse(k * 6 * s, -26 * s, 2.6 * s, 2.6 * s * bl, 0, 0, 7); g.fill(); });
      g.fillStyle = '#F2A23A'; g.beginPath(); g.moveTo(-2.5 * s, -21 * s); g.lineTo(2.5 * s, -21 * s); g.lineTo(0, -16 * s); g.fill();
      // a little graduation cap
      g.fillStyle = '#26324A'; poly(g, [[-13 * s, -40 * s], [0, -46 * s], [13 * s, -40 * s], [0, -35 * s]], '#26324A'); g.strokeStyle = '#FFC21A'; g.lineWidth = 1.4 * s; g.beginPath(); g.moveTo(8 * s, -40 * s); g.lineTo(11 * s, -33 * s); g.stroke();
      g.restore();
    }
    function ticky(g, x, y, s, t, ring, sad){   // ⏰ Ticky: the rival alarm clock on two legs
      g.save(); g.translate(x + (ring ? Math.sin(t * 60) * 1.6 * s : 0), y - (ring ? Math.abs(Math.sin(t * 9)) * 4 * s : 0)); if(sad) g.rotate(Math.sin(t * 7) * 0.14);
      g.strokeStyle = '#4A2E12'; g.lineWidth = 3.5 * s; g.lineCap = 'round'; [-1, 1].forEach(k => { g.beginPath(); g.moveTo(k * 8 * s, -8 * s); g.lineTo(k * 12 * s, 0); g.stroke(); });
      [-1, 1].forEach(k => { g.fillStyle = '#FFC21A'; g.strokeStyle = '#B07A0E'; g.lineWidth = 1.5 * s; g.beginPath(); g.arc(k * 13 * s, -42 * s, 6.5 * s, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); });
      g.fillStyle = '#FF5A5F'; g.strokeStyle = '#A3262B'; g.lineWidth = 2.2 * s; g.beginPath(); g.arc(0, -26 * s, 17 * s, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, -26 * s, 12.5 * s, 0, 7); g.fill();
      const spin = ring ? t * 14 : t * 0.6; g.strokeStyle = '#26324A'; g.lineWidth = 1.8 * s;
      [[spin, 9], [spin / 12 + 1, 6]].forEach(([a, l]) => { g.beginPath(); g.moveTo(0, -26 * s); g.lineTo(Math.sin(a) * l * s, -26 * s - Math.cos(a) * l * s); g.stroke(); });
      g.fillStyle = '#26324A'; [-1, 1].forEach(k => { g.beginPath(); g.arc(k * 4.5 * s, -31 * s, 1.5 * s, 0, 7); g.fill(); });
      g.restore();
    }
    function bubble(g, x, y, r, txt, col, glow){
      g.save(); if(glow){ g.shadowColor = 'rgba(80,255,140,' + glow + ')'; g.shadowBlur = r * 0.9; }
      g.fillStyle = col; g.strokeStyle = shade(col, -0.3); g.lineWidth = Math.max(1.5, r * 0.1); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.shadowBlur = 0; g.stroke();
      g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.4, r * 0.28, r * 0.15, -0.6, 0, 7); g.fill();
      g.fillStyle = '#FFFFFF'; g.font = FONT(r * 1.05); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y + r * 0.06); g.restore();
    }
    const BCOL = ['#FF8A5B', '#3DA5FF', '#A855F7', '#2FBF71'];
    add('math-quest', {
      still(g, W, H){
        const G = geo(W, H), {hy} = G, sc = Math.min(W, H) / 420, P = path(W, H, hy);
        let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#6EC6FF'); gr.addColorStop(1, '#DDF4FF'); g.fillStyle = gr; g.fillRect(0, 0, W, hy + 2);
        // the sky: a ringed planet + stars far up right, clouds
        const pr = Math.min(W, H) * 0.06, px = W * 0.86, py = hy * 0.22;
        g.fillStyle = '#B79CFF'; g.beginPath(); g.arc(px, py, pr, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.arc(px - pr * 0.3, py - pr * 0.3, pr * 0.35, 0, 7); g.fill();
        g.strokeStyle = '#FFE08A'; g.lineWidth = Math.max(2, pr * 0.16); g.beginPath(); g.ellipse(px, py, pr * 1.7, pr * 0.45, -0.3, 0, 7); g.stroke();
        cloud(g, W * 0.62, hy * 0.42, sc * 0.9, 0.85); cloud(g, W * 0.08, hy * 0.78, sc * 0.7, 0.7);
        // far hills: the ⭐ gate on the far hill, a little school + a rocket on its pad (the worlds)
        g.fillStyle = '#9BD77A'; g.beginPath(); g.moveTo(0, hy); for(let x = 0; x <= W; x += W / 24) g.lineTo(x, hy - (Math.sin(x / W * 6.3 + 1) * 0.5 + 0.6) * H * 0.05); g.lineTo(W, hy + 2); g.closePath(); g.fill();
        const gp = P(0.0), gs = Math.min(W, H) / 380;
        g.fillStyle = '#7FC35F'; g.beginPath(); g.ellipse(gp.x, hy + 2, W * 0.16, H * 0.07, 0, Math.PI, 0); g.fill();
        g.strokeStyle = '#FFFFFF'; g.lineWidth = 5 * gs; g.beginPath(); g.arc(gp.x, hy - H * 0.035, 16 * gs, Math.PI, 0); g.stroke();
        const sx = W * 0.14, sy = hy - H * 0.035;   // the school (left, low — under the title)
        g.fillStyle = '#FFB36B'; g.fillRect(sx - 18 * gs, sy - 16 * gs, 36 * gs, 16 * gs); poly(g, [[sx - 22 * gs, sy - 16 * gs], [sx, sy - 30 * gs], [sx + 22 * gs, sy - 16 * gs]], '#E0603C');
        g.fillStyle = '#FFFFFF'; [-10, 0, 10].forEach(d => g.fillRect(sx + d * gs - 3 * gs, sy - 11 * gs, 6 * gs, 6 * gs));
        g.strokeStyle = '#6B4A2A'; g.lineWidth = 1.5 * gs; g.beginPath(); g.moveTo(sx, sy - 30 * gs); g.lineTo(sx, sy - 44 * gs); g.stroke(); g.fillStyle = '#FF5A5F'; poly(g, [[sx, sy - 44 * gs], [sx + 10 * gs, sy - 40 * gs], [sx, sy - 36 * gs]], '#FF5A5F');
        const rx = W * 0.72, ry = hy - H * 0.02;   // the rocket on its pad (right)
        g.fillStyle = '#8A93A6'; g.fillRect(rx - 14 * gs, ry - 3 * gs, 28 * gs, 4 * gs);
        g.fillStyle = '#F2F4F8'; g.strokeStyle = '#5A6378'; g.lineWidth = 1.5 * gs; g.beginPath(); g.moveTo(rx, ry - 44 * gs); g.quadraticCurveTo(rx + 9 * gs, ry - 30 * gs, rx + 7 * gs, ry - 6 * gs); g.lineTo(rx - 7 * gs, ry - 6 * gs); g.quadraticCurveTo(rx - 9 * gs, ry - 30 * gs, rx, ry - 44 * gs); g.fill(); g.stroke();
        g.fillStyle = '#3DA5FF'; g.beginPath(); g.arc(rx, ry - 28 * gs, 3.5 * gs, 0, 7); g.fill(); g.fillStyle = '#FF5A5F'; poly(g, [[rx - 7 * gs, ry - 14 * gs], [rx - 13 * gs, ry - 4 * gs], [rx - 7 * gs, ry - 6 * gs]], '#FF5A5F'); poly(g, [[rx + 7 * gs, ry - 14 * gs], [rx + 13 * gs, ry - 4 * gs], [rx + 7 * gs, ry - 6 * gs]], '#FF5A5F');
        // the near meadow + the winding path of stones
        gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, '#8FD16E'); gr.addColorStop(1, '#5DB24A'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
        const R = rng(7); g.fillStyle = 'rgba(255,255,255,.5)'; for(let i = 0; i < 40; i++){ const x = R() * W, y = hy + Math.pow(R(), 0.7) * (H - hy); g.beginPath(); g.arc(x, y, (1 + R() * 2) * sc * (0.4 + (y - hy) / (H - hy)), 0, 7); g.fill(); }
        g.fillStyle = '#E9D6A8'; g.beginPath(); for(let i = 0; i <= 40; i++){ const p = P(i / 40); g.lineTo(p.x - W * 0.07 * p.s, p.y); } for(let i = 40; i >= 0; i--){ const p = P(i / 40); g.lineTo(p.x + W * 0.07 * p.s, p.y); } g.closePath(); g.fill();
        STONES.forEach(v => { const p = P(v); g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(p.x + 2 * p.s, p.y + 3 * p.s, W * 0.035 * p.s, W * 0.012 * p.s + 2, 0, 0, 7); g.fill();
          g.fillStyle = '#C9C2B4'; g.beginPath(); g.ellipse(p.x, p.y, W * 0.034 * p.s, W * 0.012 * p.s + 2, 0, 0, 7); g.fill(); });
        // the question card + its answer bubbles are drawn live (on top of the lit stones)
      },
      live(g, W, H, t){
        const G = geo(W, H), {hy, cx, cy, cw, ch, bh, ay} = G, c = t % CYC, P = path(W, H, hy), gs = Math.min(W, H) / 380;
        const pick = c > 1.0 && c < 1.4 ? (c - 1.0) / 0.4 : 0, fly = clamp((c - 1.4) / 0.6, 0, 1), done = c >= 2.0 && c < CYC - 0.4, flash = done ? Math.max(0, 1 - (c - 2.0) / 0.9) : 0;
        // the stones light up one by one towards the ⭐ gate
        STONES.forEach((v, i) => { const lit = done ? clamp((c - 2.1 - i * 0.16) / 0.25, 0, 1) : 0; if(lit <= 0) return; const p = P(v);
          g.save(); g.globalAlpha = lit * (c >= CYC - 0.8 ? clamp((CYC - 0.4 - c) / 0.4, 0, 1) : 1); g.shadowColor = 'rgba(255,220,80,.9)'; g.shadowBlur = 10 * p.s; g.fillStyle = '#FFD84A'; g.beginPath(); g.ellipse(p.x, p.y, W * 0.034 * p.s, W * 0.012 * p.s + 2, 0, 0, 7); g.fill(); g.restore(); });
        { const gp = P(0.0), gl = done ? clamp((c - 3.6) / 0.4, 0, 1) : 0, pulse = 0.5 + 0.5 * Math.sin(t * 3);   // the ⭐ in the gate
          g.save(); g.shadowColor = 'rgba(255,230,90,' + (0.5 + gl * 0.5) + ')'; g.shadowBlur = 14 * gs * (1 + gl); g.fillStyle = gl > 0 ? '#FFE36B' : '#FFD24A';
          const sy = hy - H * 0.035 - 6 * gs, rr = 8 * gs * (1 + gl * 0.4 + pulse * 0.08); g.beginPath(); for(let i = 0; i < 10; i++){ const a = i * Math.PI / 5 - Math.PI / 2, q = i % 2 ? 0.45 : 1; g.lineTo(gp.x + Math.cos(a) * rr * q, sy + Math.sin(a) * rr * q); } g.closePath(); g.fill(); g.restore(); }
        // 🚀 the rocket's flame flickers; 🦉 the owl on the card's corner flaps when it's right; ⏰ Ticky rings while the clock runs, wobbles after
        { const rx = W * 0.72, ry = hy - H * 0.02, fl = 0.7 + Math.sin(t * 30) * 0.3; g.fillStyle = 'rgba(255,170,40,.85)'; g.beginPath(); g.moveTo(rx - 4 * gs, ry - 6 * gs); g.quadraticCurveTo(rx, ry + 10 * gs * fl, rx + 4 * gs, ry - 6 * gs); g.fill(); }
        // the question card (6 + 2 = ?), over the lit path
        g.fillStyle = 'rgba(30,40,80,.18)'; g.beginPath(); g.roundRect(cx + 5 * gs, cy + 7 * gs, cw, ch, ch * 0.2); g.fill();
        g.fillStyle = '#FFFFFF'; g.strokeStyle = '#3D7DD8'; g.lineWidth = Math.max(2, cw * 0.012); g.beginPath(); g.roundRect(cx, cy, cw, ch, ch * 0.2); g.fill(); g.stroke();
        g.fillStyle = '#26324A'; g.font = FONT(ch * 0.44); g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText('6 + 2 =', cx + cw * 0.655, cy + ch * 0.45);
        // the time bar along the card's bottom (shrinks, stops when it's answered)
        const tb = c < 2.0 ? 1 - c / 4 : 0.5; g.fillStyle = '#E6ECF7'; g.beginPath(); g.roundRect(cx + cw * 0.08, cy + ch * 0.82, cw * 0.84, ch * 0.08, ch * 0.04); g.fill();
        g.fillStyle = tb < 0.6 ? '#FFC21A' : '#2FBF71'; g.beginPath(); g.roundRect(cx + cw * 0.08, cy + ch * 0.82, cw * 0.84 * tb, ch * 0.08, ch * 0.04); g.fill();
        if(flash > 0){ g.save(); g.globalAlpha = flash * 0.5; g.fillStyle = '#9CF2B6'; g.beginPath(); g.roundRect(cx, cy, cw, ch, ch * 0.2); g.fill(); g.restore(); }
        // the ? slot (empty → the 8 lands in it)
        const qx = cx + cw * 0.84, qy = cy + ch * 0.45, qr = ch * 0.3;
        if(!done){ g.fillStyle = '#EEF3FF'; g.strokeStyle = '#3D7DD8'; g.lineWidth = 2; g.setLineDash([4, 3]); g.beginPath(); g.arc(qx, qy, qr, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
          g.fillStyle = '#3D7DD8'; g.font = FONT(qr * 1.2); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', qx, qy + qr * 0.06); }
        // the answer bubbles bob; the right one glows, then flies up into the ?
        const r = bh * 0.42;
        ANS.forEach((a, k) => { const x = G.ax(k), y = ay + Math.sin(t * 2.4 + k * 1.3) * bh * 0.08;
          if(k === RIGHT){ if(fly > 0 || done) return; bubble(g, x, y - pick * bh * 0.15, r * (1 + pick * 0.12), a, BCOL[k], pick); }
          else { g.save(); g.globalAlpha = done ? 0.45 : 1; bubble(g, x, y, r, a, BCOL[k], 0); g.restore(); } });
        if(fly > 0 && !done){ const e = fly * fly * (3 - 2 * fly), x = lerp(G.ax(RIGHT), qx, e), y = lerp(ay, qy, e) - Math.sin(fly * Math.PI) * bh * 0.8; bubble(g, x, y, lerp(r, qr, e), ANS[RIGHT], BCOL[RIGHT], 0.6); }
        if(done){ const f = c >= CYC - 0.8 ? clamp((CYC - 0.4 - c) / 0.4, 0, 1) : 1; g.save(); g.globalAlpha = f; bubble(g, qx, qy, qr, ANS[RIGHT], '#2FBF71', flash);
          // ✔ the tick
          { const tx = cx + ch * 0.06, ty = cy + ch * 0.06, rr = ch * 0.24, k = rr * 0.5, pop = 1 + Math.max(0, 0.35 - (c - 2.0)) * 1.2;   /* the ✔ badge pops on the card's corner */
            g.fillStyle = '#2FBF71'; g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(2, rr * 0.18); g.beginPath(); g.arc(tx, ty, rr * pop, 0, 7); g.fill(); g.stroke();
            g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(2.5, rr * 0.26); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(tx - k, ty); g.lineTo(tx - k * 0.2, ty + k * 0.75); g.lineTo(tx + k * 1.05, ty - k * 0.8); g.stroke(); }
          g.restore();
          if(c < 2.7){ const q = (c - 2.0) / 0.7; for(let i = 0; i < 7; i++){ const a = i * 0.9; sparkle(g, qx + Math.cos(a) * qr * (1 + q * 1.6), qy + Math.sin(a) * qr * (1 + q * 1.6), Math.max(2, qr * 0.22) * (1 - q) + 1, 1 - q); } } }
        owl(g, cx + cw * 0.93, cy + 2, Math.max(0.5, ch / 120), t, done && c < 3.2);
        { const ts = Math.max(0.45, bh / 70), right = cx + cw + 24 * ts < W - 6, tx = right ? cx + cw + 20 * ts : cx - 20 * ts;   /* ⏰ beside the answer row (right, or left when there is no room) */
          if(tx - 20 * ts > 2 && tx + 20 * ts < W - 2) ticky(g, tx, ay + bh * 0.45, ts, t, c < 2.0, done && c < 3.4); }
      },
      _s(W, H){ const wide = W > H * 1.05, k = clamp(Math.min(H, W * 1.15) / 520, 0.42, 1.0), fy = H - 36 * k - 4, X = f => clamp(W * f, 64 * k, W - 64 * k), W3 = wide ? [0.5, 0.22, 0.78] : [0.5, 0.17, 0.83];
        return [{x: X(W3[0]), y: fy, k}, {x: X(W3[1]), y: fy - 4 * k, k: k * 0.95, from: -1}, {x: X(W3[2]), y: fy - 4 * k, k: k * 0.95, from: 1, dir: -1}]; },
      spots(W, H){ const z0 = Z; Z = null; try { return this._s(W, H); } finally { Z = z0; } },   /* champions stand where the plain art puts them */
    });
  })();
  // 🎬 COVER math-quest END
  K.loaded('math-quest', 'b6a');
})(window.GameCovers && window.GameCovers._K);
