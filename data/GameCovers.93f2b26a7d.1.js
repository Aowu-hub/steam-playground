
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

  // 🎬 COVER maze → Cover_maze.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER chess → Cover_chess.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER memory → Cover_memory.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER hopper → Cover_hopper.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER robot-adventure → Cover_robot_adventure.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER stacking-sim → Cover_stacking_sim.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER pinball → Cover_pinball.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER turbo → Cover_turbo.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER alignext → Cover_alignext.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER block-drop → Cover_block_drop.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER checkers → Cover_checkers.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER double-up → Cover_double_up.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER pop-blocks → Cover_pop_blocks.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER sweet-swap → Cover_sweet_swap.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER eyes-brain → Cover_eyes_brain.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER geoscout → Cover_geoscout.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER georead → Cover_georead.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER beat-corner → Cover_beat_corner.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER polyplot → Cover_polyplot.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER wisdeck → Cover_wisdeck.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER sla-brall → Cover_sla_brall.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER soul-bopper → Cover_soul_bopper.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER snakeast → Cover_snakeast.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER brawl-buddies → Cover_brawl_buddies.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER minigames → Cover_minigames.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER number-board → Cover_number_board.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER word-board → Cover_word_board.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER number-grid → Cover_number_grid.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER math-quest → Cover_math_quest.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER sciencetory → Cover_sciencetory.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  // 🎬 COVER avatarealm → Cover_avatarealm.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)
  // 🎬 COVER starter → Cover_starter.html (📏 b6a: one file per cover, loaded on demand — GameCovers.need)

  root.GameCovers = {add, still, live, spots, away, has: id => !!C[id], ids: () => Object.keys(C).filter(k => k !== '_default'), VERSION: '24j-e'};

  // 📏 b6a LOADER START — one cover per game (🧱 Baseline chat, 2026-11-20 · STEAM Motto plan §4 · Rules "📏 Born split + split your own")
  // Each game's art lives in its OWN file Cover_<id>.html (id → letters + _, e.g. Cover_sla_brall). include('GameFrame') lists them all
  // (Code.gs INCLUDE_ALSO_ GameFrame), so the 📲 offline app + every test have them inline; ONLINE they are on-demand files
  // (Code.gs INCLUDE_LAZY_ GameFrame → ONE GameCovers.sources({id: {src, alt, integrity}}) line) and GameFrame asks need() before it paints.
  //   GameCovers.need(id, cb) → cb(true) once that cover is here (at once when it already is) · cb(false) = no file / both copies failed
  //                             → the _default art · also returns a Promise(ok)
  //   GameCovers.sources(map) ← Code.gs only · GameCovers.files() = covers loaded from a file · GameCovers.fileOf(id) · GameCovers._K = what a Cover file runs on
  // A NEW game's cover = a NEW Cover_<id>.html (Test Harness/newgame/new_game.py makes it) + its name in Code.gs INCLUDE_ALSO_ + INCLUDE_LAZY_ GameFrame
  // + steam-source tools/remote.json kits. Never put a cover block back into this file (it stays small: helpers + _default + this loader).
  const SRC = {}, WAIT = {}, HAVE = {};
  const fileOf = id => 'Cover_' + String(id).replace(/[^A-Za-z0-9]/g, '_');
  function sources(map){ Object.keys(map || {}).forEach(k => { SRC[k] = map[k]; }); return Object.assign({}, SRC); }
  function loaded(id, round){ HAVE[id] = round || true; const w = WAIT[id]; delete WAIT[id]; if(w) w.forEach(f => f(true)); }
  function need(id, cb){
    return new Promise(res => {
      const done = ok => { if(typeof cb === 'function') try { cb(ok); } catch(e){} res(ok); };
      if(C[id]) return done(true);
      const s = SRC[id]; if(!s || typeof document === 'undefined') return done(false);
      if(WAIT[id]) return WAIT[id].push(done);
      WAIT[id] = [done];
      const fail = () => { const w = WAIT[id] || []; delete WAIT[id]; try { console.warn('🎬 GameCovers: ' + fileOf(id) + ' did not load (site + backup copy) → the default art'); } catch(e){} w.forEach(f => f(false)); };
      const tag = (url, next) => { if(!url) return next(); const el = document.createElement('script'); el.charset = 'utf-8'; el.async = true;
        if(s.integrity){ el.integrity = s.integrity; el.crossOrigin = 'anonymous'; }
        el.onload = () => { if(!C[id]) next(); }; el.onerror = () => { if(el.parentNode) el.parentNode.removeChild(el); next(); };
        el.src = url; (document.head || document.documentElement).appendChild(el); };
      tag(s.src || s, () => tag(s.alt, fail));
    });
  }
  // a Cover file's block keeps its own Z: the kit copies its Z in before each still / live / spots, away() runs on the file's Z
  function addPart(id, def, setZ){ ['still', 'live', 'spots'].forEach(k => { const f = def[k]; if(typeof f === 'function') def[k] = function(){ setZ(Z); return f.apply(this, arguments); }; }); add(id, def); }
  function awayIn(z, x, y, w, h, W, H, opt){ const z0 = Z; Z = z; try { return away(x, y, w, h, W, H, opt); } finally { Z = z0; } }
  Object.assign(root.GameCovers, {need, sources, fileOf, files: () => Object.assign({}, HAVE), VERSION: 'b6a',
    _K: {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root, add: addPart, awayIn, loaded}});
  // 📏 b6a LOADER END
})(window);
