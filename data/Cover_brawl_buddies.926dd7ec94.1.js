
/* 🎬 Cover_brawl_buddies — 📏 b6a: the "brawl-buddies" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
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
  K.loaded('brawl-buddies', 'b6a');
})(window.GameCovers && window.GameCovers._K);
