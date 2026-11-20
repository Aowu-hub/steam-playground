
// ======================= 🗺️ MotionGround (mo-15, 🎬 Motion chat, 2026-11-20) — the ground answers every step, slide, drag and stomp =======================
// Rules: Motion rules §42 B · §45 plan (Aowu 22:29 "go") · §46 look test (Aowu 23:16 "ok") · §47 as built · FX Bible F1–F16 · §2.5 (the ground is an ellipse) · Motion Bible M11 (landing by height).
// BORN SPLIT: its own file MotionGround.html, loads with AvatarKit after MotionCarry (Code.gs INCLUDE_ALSO_). IsoKit 0 bytes · AvatarKit 0 bytes. Works without AvatarKit (creatures).
//
// ⭐ Motion.GROUND[tileKey] = 'soft' | 'loose' | 'mud' | 'hard' | 'shallow' | 'deep' | 'snow' | 'lava' | 'room' | 'none'   (own tiles: set a key)
// ⭐ Motion.groundOn(isoMap, {mudNearWater})  → a reader (IsoKit diamond: m.get(i, j).t + m.heightAt + the map theme)
// ⭐ Motion.groundFlat(mat | (x) => mat, {floorY, k})  → a reader for a flat side-view game (x = screen px, y = floorY)
// ⭐ G = Motion.ground(reader, {k, calm, reduced, near: 4, onStep, seed, wind: {dir: [x, y], s}})
//      G.follow(unit, {who, x, y, z, t, weight, player, gait, walkT})   → auto: 👣 step · 🏃 run · 🛑 skid · ⬇️ fall · 💦 splash (+ wet prints · drips · shake-off)
//      G.fire(kind, {unit, x, y, z, t, weight, levels, dir, power, px, py, v})   → 🦘 land · 🛝 slide · 🗡️ drag · 🔨 charge · 💥 stomp (or any of the 10)
//      G.drawGround(g, v, t)  (IsoKit groundFx — under every body)   ·   G.drawAir(g, v, t)  (IsoKit airFx — over the bodies)
//      G.under(x, y) → {mat, cut, sink, liquid, wet, col}   ·   G.nudge(unit, t) → {dx, dy} (player only)   ·   G.idleHint(unit, t) → 'shiver' | 'hotfoot' | 'shake' | 'toes' | null
//      G.state(unit) → {gait, mat, tile, stillT, outT, shookT, x, y} (read-only)   ·   G.touch(unit, t, {foot, kind, gait}) → a standing foot touches down (mo-16)
// ⭐ mo-16: Motion.alive(who, {place, ground: G, unit}) acts the ground while standing — 🥶 shiver + breath clouds · 🔥 hot-foot · 🐶 shake-off · 🏜️ toe wiggle (Motion rules §48)
//      G.trail(unit, points, t)  → ONE contact per NEW tile a body / tail passes, joint by joint in order (creatures, 🐍)   ·   G.stats() → {bits, prints, decals, rings}
// ⭐ Motion.wade(g, under, sx, sy, k, paint(sx, sy2), t)  → legs cut at the waterline (💧 ankle 3 u · 🌊 knee 9 u) / feet sunk in snow, + the waterline ring
// ⭐ Motion.groundS({weight, gait, kind, levels, mat, power}) → {S, level}   (S = W × V × E × G → 0 none · 1 whisper · 2 light · 3 medium · 4 heavy)
(function () {
'use strict';
const M = window.Motion || (window.Motion = {}); if (M.ground) return;
const TAU = Math.PI * 2, cl = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, q) => a + (b - a) * q, outC = u => 1 - Math.pow(1 - cl(u, 0, 1), 3);
const hx = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const mix = (a, b, q) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], q)).toString(16).padStart(2, '0')).join(''); };
const rgba = (h, a) => { const A = hx(h); return 'rgba(' + A[0] + ',' + A[1] + ',' + A[2] + ',' + cl(a, 0, 1).toFixed(3) + ')'; };
function rng(s) { s = (s >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

// ---------- 🧱 8 materials (+ 🟫 mud = loose + wet) — G = give, life = how long a print stays (s), cut = legs under the surface (u) ----------
const MAT = {
  soft:    {give: 0.5, print: 1.5, bit: 'leaf', col: '#7CC45A', dark: '#5FA844', lite: '#C6F27A'},
  loose:   {give: 1,   print: 4,   bit: 'grain', puff: true, furrow: 3, col: '#EED493', dark: '#C9A86A', lite: '#FBEBC4'},
  mud:     {give: 1,   print: 2.5, bit: 'splat', furrow: 2.5, wet: true, col: '#8E6640', dark: '#3E2A18', lite: '#C9A27A'},
  hard:    {give: 0.3, print: 0,   bit: 'chip', scratch: 1, col: '#B9B5AC', dark: '#8E8A82', lite: '#ECEAE4', metal: true},
  shallow: {give: 1.2, print: 0,   bit: 'drop', liquid: true, cut: 3, col: '#5EC3EA', dark: '#3A8FBF', lite: '#DDF6FF'},
  deep:    {give: 1.3, print: 0,   bit: 'drop', liquid: true, cut: 9, col: '#6FC7DF', dark: '#3F8FAF', lite: '#E3FBFF'},
  snow:    {give: 1.1, print: 6,   bit: 'snow', puff: true, furrow: 3, sink: 1.5, col: '#E4EEFA', dark: '#B8C7DA', lite: '#FFFFFF'},
  lava:    {give: 0.9, print: 1.5, bit: 'ember', glow: true, col: '#F25A1C', dark: '#7A2A12', lite: '#FFC83D'},
  room:    {give: 0.2, print: 0,   bit: null, col: '#DCD5C6', dark: '#9A9080', lite: '#FFFFFF', quiet: true},
  none:    {give: 0,   print: 0,   bit: null, col: '#000000', dark: '#000000', lite: '#000000'}};
const GROUND = {grass: 'soft', flower: 'soft', lawn: 'soft', path: 'loose', sand: 'loose', dirt: 'loose', stone: 'hard', wood: 'hard',
  water: 'shallow', moat: 'deep', snow: 'snow', lava: 'lava', plank: 'room', panel: 'room', flag: 'room', gloss: 'room', tile: 'room', void: 'none', mud: 'mud'};
const THEME_MAT = {snow: {grass: 'snow', flower: 'snow', lawn: 'snow'}, lava: {grass: 'loose', flower: 'loose'}};
/* the tile tops (IsoKit BASE_THEME) so bits + prints take the ground's own colour; a theme's own tile colour wins */
const TOPS = {grass: '#8FD16A', flower: '#93D46E', path: '#EBCB93', sand: '#F6DFA4', water: '#5EC3EA', moat: '#6FC7DF', stone: '#C9C6BE', dirt: '#C79A68', snow: '#F4F8FF', lava: '#FF7A2E', wood: '#D9A46A', lawn: '#7CC36A', plank: '#E9C99A', tile: '#E8E2D6'};

// ---------- 💪 S = W × V × E × G ----------
const W_ = {light: 0.7, medium: 1, heavy: 1.4, tiny: 0.5, small: 0.8, big: 1.2, giant: 2};
const V_ = {stand: 0.1, walk: 0.4, run: 1, dash: 1.3};
const E_ = {step: 1, run: 1.1, land: 1, slide: 1.1, fall: 1.4, drag: 0.8, charge: 0.6, skid: 1.2, splash: 1.2, stomp: 1.5, drip: 0.5};
const OWN_FORCE = {land: 1, stomp: 1, charge: 1, fall: 1, drip: 1};
const LEVELS = [0.15, 0.35, 0.7, 1.2];
function groundS(o) {
  const w = typeof o.weight === 'number' ? o.weight : (W_[o.weight] || 1), v = OWN_FORCE[o.kind] ? 1 : (V_[o.gait] != null ? V_[o.gait] : 0.4);
  let e = E_[o.kind] || 1; if (o.kind === 'land') e = 1 + 0.5 * Math.min(3, o.levels || 0); if (o.kind === 'charge') e = 0.6 + 0.6 * cl(o.power || 0, 0, 1);
  const G = (MAT[o.mat] || MAT.hard).give, S = w * v * e * G; let level = 0; while (level < 4 && S > LEVELS[level]) level++; return {S, level};
}

// ---------- 📖 readers: where the ground is + what it is ----------
function groundOn(m, o) {
  o = o || {}; const theme = m.theme || 'meadow', TM = THEME_MAT[theme] || {}, TH = (window.Iso && Iso.THEMES && Iso.THEMES[theme] && Iso.THEMES[theme].tile) || {};
  const wetNear = (i, j) => { for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const c = m.get(i + di, j + dj); if (c && (c.t === 'water' || c.t === 'moat')) return true; } return false; };
  const cache = new Map();
  const cell = (i, j) => { const key = i + ',' + j; let r = cache.get(key); if (r) return r; const c = m.get(i, j);
    if (!c) r = {mat: 'none', tile: null, h: 0, col: '#000000'};
    else { let mat = TM[c.t] || M.GROUND[c.t] || (c.t === 'void' || c.block ? 'none' : 'hard');
      if (c.t === 'dirt' && o.mudNearWater !== false && wetNear(i, j)) mat = 'mud';
      const top = (TH[c.t] && TH[c.t].top) || TOPS[c.t] || MAT[mat].col; r = {mat, tile: c.t, h: c.h || 0, col: top}; }
    cache.set(key, r); return r; };
  return {kind: 'iso', map: m, at: (x, y) => cell(Math.floor(x), Math.floor(y)), cellAt: cell, clear: () => cache.clear(),
    scr: (V, x, y, z) => V.toScreen(x, y, z || 0), kpx: (V, G) => V.zoom * G.k,
    offW: (V, dx, dy) => { const a = dx / (32 * V.zoom), b = dy / (16 * V.zoom); return [(a + b) / 2, (b - a) / 2]; },
    dirS: (dx, dy) => [(dx - dy) * 32, (dx + dy) * 16]};
}
function groundFlat(mat, o) {
  o = o || {}; const f = typeof mat === 'function' ? mat : () => mat, Y = o.floorY || 0;
  return {kind: 'flat', at: x => { const k = f(x) || 'hard'; return {mat: k, tile: k, h: 0, col: (MAT[k] || MAT.hard).col}; }, clear() {},
    scr: (V, x, y, z) => ({x, y: Y + (y || 0) * 0.3 - (z || 0) * 16}), kpx: (V, G) => G.k, offW: (V, dx, dy) => [dx, dy / 0.3], dirS: (dx, dy) => [dx, dy * 0.3]};
}

// ---------- ⭐ the engine ----------
function ground(R, o) {
  o = o || {}; const G = {R, k: o.k || 0.62, calm: !!o.calm, reduced: !!o.reduced, near: o.near == null ? 4 : o.near, onStep: o.onStep || null, wind: o.wind || null, seed: o.seed || 7};
  const BITS = [], PRINTS = [], DECALS = [], RINGS = [], PUFFS = [], CAP = {bits: 60, prints: 48, decals: 24, rings: 16, puffs: 14};
  const U = new Map(); let nId = 0, rankT = -1, rankOK = new Set();
  const add = (P, cap, x) => { if (P.length >= cap) P.shift(); P.push(x); return x; };
  const st = u => { let s = U.get(u); if (!s) { s = {id: ++nId, x: null, y: 0, z: 0, t: 0, spd: 0, mat: null, wet: 0, n: null, acc: 0, foot: 0, last: {}, dir: [1, 0], skidT: -9, nudgeT: -9, stillT: 0, outT: -9}; U.set(u, s); } return s; };
  const budget = () => (window.Iso && Iso.budget) ? Iso.budget : null;
  function allowed(u, s, t) {
    if (!u || s.player) return 4; if (rankT !== t) { rankT = t; rankOK = new Set(); let P = null; U.forEach(q => { if (q.player) P = q; });
      if (P) [...U.values()].filter(q => q !== P && q.x != null).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y)).slice(0, G.near).forEach(q => rankOK.add(q)); else U.forEach(q => rankOK.add(q)); }
    return rankOK.has(s) ? 4 : 1;
  }
  function capLevel(L, u, s, t) {
    if (G.calm && L > 1) L -= 1; if (G.reduced) L = Math.min(L, 1); const B = budget(); if (B && B.level >= 3) L = Math.min(L, 1);
    if (s) L = Math.min(L, allowed(u, s, t)); return L;
  }
  // ⏱️ ONE moment: work out S → level, then paint what the material does
  function moment(kind, at, t, opt) {
    opt = opt || {}; const C = R.at(at.x, at.y), mat = opt.mat || C.mat; if (mat === 'none' && kind !== 'fall') return null;
    const u = opt.unit, s = u ? st(u) : null, res = groundS({weight: opt.weight || (s && s.weight) || 'medium', gait: opt.gait || (s && s.gait) || 'walk', kind, levels: opt.levels, mat: mat === 'none' ? 'hard' : mat, power: opt.power});
    const level = Math.min(capLevel(res.level, u, s, t), opt.cap != null ? opt.cap : 4); const E = {kind, mat, level, S: res.S, x: at.x, y: at.y, z: at.z || 0, t, foot: opt.foot || 0, dir: opt.dir || (s && s.dir) || [1, 0], col: C.col, wet: opt.wet || 0};
    if (level > 0) paintMoment(E, opt); if (G.onStep) G.onStep(E);
    if (level >= 4 && s && s.player && t - s.nudgeT > 0.6 && !G.calm) s.nudgeT = t; return E;
  }
  // 🎨 what each material does (FX Bible §2.1 phases: pop → peak → break-up → fade; seeded + pure)
  function paintMoment(E, opt) {
    const m = MAT[E.mat] || MAT.hard, L = E.level, r = rng(G.seed * 7919 + Math.round(E.t * 1000) * 31 + Math.round(E.x * 977 + E.y * 613)), B = budget(), fxK = (B ? B.fx : 1) * (G.calm ? 0.5 : 1);
    const nBits = Math.round([0, 0, 3, 8, 12][L] * fxK), kind = E.kind, dir = E.dir, back = [-dir[0], -dir[1]];
    const at = {x: E.x, y: E.y, z: E.z};
    // 👣 prints (every level ≥ 1 on a material that keeps them; wet feet print on ANY dry ground for 3 steps)
    const printy = kind === 'step' || kind === 'run' || kind === 'land' || kind === 'skid';
    if (printy && (m.print || E.wet) && !m.liquid) { const side = E.foot ? 1 : -1, px = -dir[1] * 0.06 * side, py = dir[0] * 0.06 * side, life = m.print || 1.6;
      add(PRINTS, CAP.prints, {x: E.x + px, y: E.y + py, z: E.z, t: E.t, life, dir, mat: E.mat, deep: m.sink || (E.mat === 'mud' ? 1 : 0), col: E.wet && !m.print ? '#3A8FBF' : (m.glow ? '#FF8A3D' : mix(E.col, m.dark, E.mat === 'mud' ? 0.9 : 0.7)), wet: E.wet && !m.print, glow: !!m.glow, big: (kind === 'land' ? 1.5 : 1) * (E.mat === 'mud' ? 1.3 : E.mat === 'snow' ? 1.2 : 1)}); }
    if (L < 2 && kind !== 'drag') return;
    // 💦 liquids: rings + drops (+ a crown when big)
    if (m.liquid) {
      const R0 = kind === 'splash' || kind === 'fall' || kind === 'stomp' ? 1.6 : kind === 'land' ? 1.3 : 0.9;
      add(RINGS, CAP.rings, {x: E.x, y: E.y, z: E.z, t: E.t, r: R0 * (L >= 4 ? 1.2 : 1) * 26, life: 0.75, col: '#FFFFFF', a: 0.8, w: 2});
      if (L >= 3) add(RINGS, CAP.rings, {x: E.x, y: E.y, z: E.z, t: E.t + 0.12, r: R0 * 40, life: 0.9, col: '#FFFFFF', a: 0.45, w: 1.4});
      const crown = kind === 'splash' || kind === 'fall' || kind === 'stomp' || kind === 'land';
      for (let i = 0; i < nBits; i++) { const a = crown ? (i / nBits) * TAU + r() * 0.4 : Math.atan2(back[1], back[0]) + (r() - 0.5) * 1.6, sp = crown ? 0.5 + r() * 0.5 : 0.7 + r() * 0.6;
        add(BITS, CAP.bits, {kind: 'drop', x: E.x, y: E.y, z: E.z, t: E.t, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, h: 2, vh: (crown ? 95 : 60) + r() * 50, g: 380, life: 0.7, s: 2 + r() * 1.5, col: m.lite, col2: m.col}); }
      return; }
    // 🛑 skid / 🛝 slide: a fan of bits ahead of the feet + a groove (loose · snow · mud) or squeak lines (hard · room)
    const fan = kind === 'skid' || kind === 'slide', crownK = kind === 'stomp' || kind === 'land' || kind === 'fall';
    if ((fan || kind === 'stomp' || (kind === 'land' && L >= 3)) && (m.furrow || m.quiet || m.metal)) {
      if (m.furrow) add(DECALS, CAP.decals, {kind: crownK ? 'crater' : 'groove', x: E.x, y: E.y, z: E.z, t: E.t, life: m.furrow, dir, r: crownK ? 22 + 6 * L : 14, col: mix(E.col, m.dark, 0.5), lite: m.lite});
      else if (m.metal && kind === 'stomp') add(DECALS, CAP.decals, {kind: 'crack', x: E.x, y: E.y, z: E.z, t: E.t, life: 2, r: 14 + 4 * L, seed: (r() * 1e6) | 0, col: m.dark});
      else add(DECALS, CAP.decals, {kind: 'squeak', x: E.x, y: E.y, z: E.z, t: E.t, life: 0.45, dir, col: '#FFFFFF'}); }
    if (m.quiet) { add(RINGS, CAP.rings, {x: E.x, y: E.y, z: E.z, t: E.t, r: 18 + 4 * L, life: 0.5, col: m.dark, a: 0.45, w: 1.2}); return; }
    // 💨 puff (loose · snow) — lumpy, rises, then ERODES (FX Bible §2.3 smoke)
    if (m.puff && (L >= 2 || kind === 'drag')) { const n = crownK && L >= 3 ? 3 : 1;
      for (let i = 0; i < n; i++) { const a = i / n * TAU + r(); add(PUFFS, CAP.puffs, {x: E.x + (n > 1 ? Math.cos(a) * 0.08 : back[0] * 0.04), y: E.y + (n > 1 ? Math.sin(a) * 0.08 : back[1] * 0.04), z: E.z, t: E.t, r: (5 + 2.2 * L) * (kind === 'drag' ? 0.8 : 1), life: 0.55 + 0.12 * L, col: mix(E.col, '#FFFFFF', 0.55), col2: mix(E.col, m.dark, 0.25), seed: (r() * 1e6) | 0}); } }
    if (crownK && (L >= 3 || kind === 'stomp')) add(RINGS, CAP.rings, {x: E.x, y: E.y, z: E.z, t: E.t, r: 24 + 6 * L, life: 0.55, col: m.glow ? '#FF8A3D' : mix(E.col, m.dark, 0.4), a: 0.6, w: 1.8});
    if (m.glow && crownK && L >= 3) add(DECALS, CAP.decals, {kind: 'scorch', x: E.x, y: E.y, z: E.z, t: E.t, life: 1.5, r: 16 + 4 * L, col: '#FF8A3D'});
    // 🫧 bits by material: run = kicked BACK · skid / slide = a fan AHEAD · land / stomp = a crown · charge = lift + circle · drag = off the tip
    const bk = m.bit; if (!bk) return;
    for (let i = 0; i < nBits; i++) {
      let a, sp, vh, h = 1;
      if (crownK) { a = i / nBits * TAU + r() * 0.5; sp = 0.35 + r() * 0.45; vh = 70 + r() * 60; }
      else if (fan) { a = Math.atan2(dir[1], dir[0]) + (r() - 0.5) * 1.4; sp = 0.6 + r() * 0.6; vh = 30 + r() * 40; }
      else if (kind === 'charge') { a = r() * TAU; sp = 0.12 + r() * 0.12; vh = 18 + r() * 20; h = 0; }
      else { a = Math.atan2(back[1], back[0]) + (r() - 0.5) * 1.1; sp = 0.45 + r() * 0.5; vh = 45 + r() * 45; }
      const life = bk === 'ember' ? 0.9 + r() * 0.5 : bk === 'leaf' ? 0.9 + r() * 0.4 : kind === 'charge' ? 0.8 : 0.45 + r() * 0.3;
      add(BITS, CAP.bits, {kind: bk, x: E.x, y: E.y, z: E.z, t: E.t, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, h, vh, g: bk === 'ember' ? -40 : bk === 'leaf' ? 120 : kind === 'charge' ? 10 : 360, life,
        s: (bk === 'chip' ? 2.6 : bk === 'snow' ? 2.8 : bk === 'splat' ? 2.8 : bk === 'leaf' ? 3.6 : 2) * (0.75 + r() * 0.6), col: bk === 'leaf' && E.col ? (r() < 0.3 && C_FLOWER(E) ? '#FF8CC6' : (r() < 0.5 ? m.col : m.lite)) : bk === 'ember' ? '#FFC83D' : r() < 0.5 ? mix(E.col, m.dark, 0.35) : mix(E.col, m.dark, 0.7),
        spin: (r() - 0.5) * 14, circle: kind === 'charge' ? (r() < 0.5 ? 1 : -1) * (2 + r() * 2) : 0, seed: (r() * 1e6) | 0}); }
  }
  const C_FLOWER = E => { const c = R.at(E.x, E.y); return c.tile === 'flower'; };

  // ---------- 🤖 follow: the unit's own moves become moments ----------
  G.follow = (u, f) => {
    const s = st(u), t = f.t; s.player = !!f.player; s.weight = f.weight || s.weight || 'medium'; s.who = f.who || null;
    if (s.x == null) { s.x = f.x; s.y = f.y; s.z = f.z || 0; s.t = t; s.mat = R.at(f.x, f.y).mat; return null; }
    const dt = Math.max(1e-3, t - s.t), dx = f.x - s.x, dy = f.y - s.y, d = Math.hypot(dx, dy), sp = d / dt, out = [];
    s.spd = s.spd ? lerp(s.spd, sp, 0.45) : sp; if (d > 1e-4) s.dir = [dx / d, dy / d];
    const gait = f.gait || (s.spd < 0.15 ? 'stand' : s.spd < 1.7 ? 'walk' : s.spd < 3.3 ? 'run' : 'dash'); s.gait = gait;
    s.hi = (s.hi || []).filter(q => t - q[0] <= 0.15); s.hi.push([t, s.spd]); const top = s.hi.reduce((a, q) => Math.max(a, q[1]), 0);
    const C = R.at(f.x, f.y), at = {x: f.x, y: f.y, z: f.z || 0}, prev = s.mat;
    // 💦 enter / leave a liquid = ONE moment
    if (C.mat !== prev) { const liqNow = MAT[C.mat] && MAT[C.mat].liquid, liqPrev = MAT[prev] && MAT[prev].liquid;
      if (liqNow && !liqPrev) out.push(moment('splash', at, t, {unit: u}));
      else if (!liqNow && liqPrev) { s.wet = 3; s.outT = t; out.push(moment('drip', at, t, {unit: u, mat: prev})); }
      else if (C.mat !== 'none' && prev && prev !== 'none') out.push(moment('step', at, t, {unit: u, foot: s.foot}));
      s.mat = C.mat; }
    // ⬇️ fall: off an edge (void under) or down ≥ 1 level
    const dz = (s.z || 0) - (f.z || 0);
    if (C.mat === 'none' && prev !== 'none') out.push(moment('fall', {x: s.x, y: s.y, z: s.z}, t, {unit: u, mat: prev}));
    else if (dz >= 0.9) out.push(dz >= 1.9 ? moment('land', at, t, {unit: u, levels: Math.round(dz)}) : moment('land', at, t, {unit: u, levels: 1}));
    // 🛑 skid: the speed falls by more than half within 150 ms (once per 0.6 s)
    if (top > 1.2 && s.spd < top * 0.45 && t - s.skidT > 0.6) { s.skidT = t; out.push(moment('skid', at, t, {unit: u, gait: 'run'})); }
    // 👣 steps: the walk phase (who.walkT: a foot lands at p = π/2 + nπ) or a stride by distance
    let stepped = false;
    if (f.walkT != null && f.walkT > 0) { const n = Math.floor((f.walkT * 11 - Math.PI / 2) / Math.PI); if (s.n != null && n !== s.n) stepped = true; s.n = n; }
    else if (gait !== 'stand') { s.acc += d; const stride = gait === 'walk' ? 0.36 : 0.55; if (s.acc >= stride) { s.acc -= stride; stepped = true; } }
    if (stepped && C.mat !== 'none') { s.foot ^= 1; out.push(moment(gait === 'run' || gait === 'dash' ? 'run' : 'step', at, t, {unit: u, foot: s.foot, wet: s.wet > 0 ? 1 : 0})); if (s.wet > 0) s.wet--; }
    // 🌊 a wake V behind a body moving through water (two lines that spread as they age)
    if (MAT[C.mat] && MAT[C.mat].liquid && gait !== 'stand' && d > 1e-3) add(DECALS, CAP.decals * 2, {kind: 'wakeV', x0: s.x, y0: s.y, x: f.x, y: f.y, z: f.z || 0, t, life: 0.9, dir: s.dir});
    // 🐶 shake-off: standing still within 2 s of leaving water
    if (gait === 'stand') { if (!s.stillT) s.stillT = t; if (s.outT > 0 && t - s.outT < 2.2 && t - s.stillT > 0.05 && !s.shook) { s.shook = 1; shake(at, t, u); } } else { s.stillT = 0; if (t - s.outT > 2.2) s.shook = 0; }
    s.x = f.x; s.y = f.y; s.z = f.z || 0; s.t = t; return out.filter(Boolean);
  };
  function shake(at, t, u) { const r = rng(G.seed + Math.round(t * 1000)), n = G.calm ? 5 : 10, PK = SHAKE_PEAKS;
    if (u) { const s = st(u); s.shookT = t; }
    for (let i = 0; i < n; i++) { const pk = i % PK.length, side = pk % 2 ? 1 : -1, a = (side > 0 ? 0 : Math.PI) + (r() - 0.5) * 1.9;   /* 🐶 mo-16: 3 bursts on the twist peaks, each thrown to the side the body swings to */
      add(BITS, CAP.bits, {kind: 'drop', x: at.x, y: at.y, z: at.z, t: t + PK[pk], vx: Math.cos(a) * 0.5, vy: Math.sin(a) * 0.5, h: 26 + r() * 10, vh: 40 + r() * 30, g: 300, life: 0.7, s: 2.6 + r() * 1.2, col: '#DDF6FF', col2: '#3BC9DB'}); } }

  // ---------- ✋ fire: the game's own moments ----------
  G.fire = (kind, f) => {
    f = f || {}; let x = f.x, y = f.y; const s = f.unit ? st(f.unit) : null;
    if (f.px != null && f.v && R.kind === 'iso') { const w = f.v.toWorld(f.px, f.py, f.z || 0); x = w.x; y = w.y; }
    if (kind === 'drag') return drag(f.unit, x, y, f.z || 0, f.t, f);
    if (s && s.last[kind] != null && f.t - s.last[kind] < (kind === 'charge' ? 0.18 : 0.05)) return null; if (s) s.last[kind] = f.t;
    return moment(kind, {x, y, z: f.z || 0}, f.t, {unit: f.unit, weight: f.weight, levels: f.levels, power: f.power, dir: f.dir, gait: f.gait});
  };
  // 🗡️ drag: a furrow (loose · snow · mud) / a scratch (hard) / a wake (water) that follows the tip + bits off it every ≥ 90 ms
  const DR = new Map();
  function drag(u, x, y, z, t, f) {
    const key = u || 'free', d = DR.get(key), C = R.at(x, y), m = MAT[C.mat] || MAT.hard;
    if (!d || t - d.t > 0.25) { DR.set(key, {x, y, t, bitT: -9, mat: C.mat}); return null; }
    if (Math.hypot(x - d.x, y - d.y) < 0.035) return null;
    if (C.mat !== d.mat) { moment('step', {x, y, z}, t, {unit: u, gait: 'walk'}); d.mat = C.mat; }
    const kindD = m.liquid ? 'wake' : m.furrow ? 'furrow' : m.scratch ? 'scratch' : m.print ? 'furrow' : null, deepC = mix(m.dark, '#5A3E22', C.mat === 'snow' ? 0 : 0.45);
    if (kindD) add(DECALS, CAP.decals * 2, {kind: kindD, x0: d.x, y0: d.y, x: x, y: y, z, t, life: kindD === 'scratch' ? m.scratch : kindD === 'wake' ? 0.8 : (m.furrow || m.print), col: kindD === 'scratch' ? C.col : deepC, lite: m.lite, glow: !!m.glow});
    let E = null; if (t - d.bitT > 0.09) { d.bitT = t; const dir = [x - d.x, y - d.y], L = Math.hypot(dir[0], dir[1]) || 1; E = moment('drag', {x, y, z}, t, {unit: u, weight: f.weight || 'heavy', gait: f.gait || 'run', dir: [dir[0] / L, dir[1] / L]}); if (E) E.metal = !!m.metal; }
    d.x = x; d.y = y; d.t = t; return E;
  }
  // 🐍 trail: one contact per NEW tile a body passes (joint by joint, in order)
  G.trail = (u, pts, t, f) => { const s = st(u); s.tiles = s.tiles || new Set(); const out = [];
    for (const p of pts) { const k = Math.floor(p.x) + ',' + Math.floor(p.y); if (!s.tiles.has(k)) { s.tiles.add(k); out.push(moment(p.kind || 'slide', {x: p.x, y: p.y, z: p.z || 0}, t, {unit: u, weight: (f && f.weight) || 'big'})); } }
    if (s.tiles.size > 64) s.tiles = new Set([...s.tiles].slice(-32)); return out.filter(Boolean); };

  // ---------- 🔎 what is under a spot ----------
  G.under = (x, y) => { const C = R.at(x, y), m = MAT[C.mat] || MAT.hard; return {mat: C.mat, cut: m.cut || 0, sink: m.sink || (C.mat === 'mud' ? 0.8 : C.mat === 'loose' && C.tile === 'sand' ? 0.8 : 0), liquid: !!m.liquid, col: C.col, wet: !!m.wet}; };
  G.nudge = (u, t) => { const s = U.get(u); if (!s || !s.player) return {dx: 0, dy: 0}; const a = t - s.nudgeT; if (a < 0 || a > 0.12) return {dx: 0, dy: 0}; const q = 1 - a / 0.12; return {dx: Math.sin(a * 140) * 1.5 * q, dy: Math.cos(a * 110) * 1 * q}; };
  G.idleHint = (u, t) => { const s = U.get(u); if (!s || s.gait !== 'stand') return null; if (s.outT > 0 && t - s.outT < 2.2) return 'shake'; const m = s.mat; return m === 'snow' ? 'shiver' : m === 'lava' ? 'hotfoot' : m === 'loose' && R.at(s.x, s.y).tile === 'sand' ? 'toes' : null; };
  // 🫁 mo-16: what Motion.alive needs to act the ground (read-only) · a foot of the standing body touches down (hot-foot hops · toe digs)
  G.state = u => { const s = U.get(u); if (!s || s.x == null) return null; const C = R.at(s.x, s.y); return {gait: s.gait || 'stand', mat: s.mat, tile: C.tile, stillT: s.stillT || 0, outT: s.outT, shookT: s.shookT != null ? s.shookT : -9, x: s.x, y: s.y}; };
  G.touch = (u, t, o) => { const s = U.get(u); if (!s || s.x == null) return null; o = o || {}; const at = {x: s.x, y: s.y, z: s.z};
    const E = moment(o.kind || 'step', at, t, {unit: u, foot: o.foot || 0, gait: o.gait || 'walk', cap: o.cap});
    if (o.dig && E && E.level > 0) { const m = MAT[E.mat] || MAT.hard, r = rng(G.seed + Math.round(t * 1000) * 7), n = G.calm ? 2 : 4;   /* 🏜️ a toe flicks a few grains (no puff) */
      for (let i = 0; i < n; i++) { const a = Math.atan2(s.dir[1], s.dir[0]) + (r() - 0.5) * 1.6; add(BITS, CAP.bits, {kind: m.bit || 'grit', x: at.x + s.dir[0] * 0.05, y: at.y + s.dir[1] * 0.05, z: at.z, t, vx: Math.cos(a) * 0.18, vy: Math.sin(a) * 0.18, h: 1, vh: 22 + r() * 16, g: 300, life: 0.4, s: 1.4 + r() * 0.6, col: mix(E.col, m.dark || '#7A5A3A', 0.35), spin: 0, circle: 0, seed: (r() * 1e6) | 0}); } }
    return E; };
  G.stats = () => ({bits: BITS.length, prints: PRINTS.length, decals: DECALS.length, rings: RINGS.length, puffs: PUFFS.length, units: U.size});
  G.clear = () => { BITS.length = PRINTS.length = DECALS.length = RINGS.length = PUFFS.length = 0; U.clear(); DR.clear(); };

  // ---------- 🎨 painters (cheap: paths + flat colours, no shadowBlur, no filters; the ground = an ellipse squashed 0.34) ----------
  const SQ = 0.34;
  const alive = (x, t) => t >= x.t && t - x.t < x.life;
  const fadeOf = (x, t, tail) => { const a = (t - x.t) / x.life; return a < 1 - tail ? 1 : cl((1 - a) / tail, 0, 1); };
  function windOff(a) { const w = G.wind; return w ? [w.dir[0] * w.s * a, w.dir[1] * w.s * a] : [0, 0]; }
  G.drawGround = (g, v, t) => {
    const k = R.kpx(v, G); g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    for (const d of DECALS) { if (!alive(d, t)) continue; const f = fadeOf(d, t, 0.45);
      if (d.kind === 'wakeV') { const age = t - d.t, off = 0.05 + age * 0.22, nx = -d.dir[1], ny = d.dir[0];
        for (const sd of [-1, 1]) { const a = R.scr(v, d.x0 + nx * off * sd, d.y0 + ny * off * sd, d.z), b = R.scr(v, d.x + nx * off * sd, d.y + ny * off * sd, d.z); g.strokeStyle = rgba('#FFFFFF', 0.7 * f); g.lineWidth = 1.5 * k * (1 - age * 0.6); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } continue; }
      if (d.kind === 'furrow' || d.kind === 'scratch' || d.kind === 'wake') { const a = R.scr(v, d.x0, d.y0, d.z), b = R.scr(v, d.x, d.y, d.z); g.lineCap = 'butt';
        if (d.kind === 'wake') { g.strokeStyle = rgba('#FFFFFF', 0.55 * f); g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); continue; }
        if (d.kind === 'scratch') { g.strokeStyle = rgba('#FFFFFF', 0.8 * f); g.lineWidth = 1.1 * k; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.strokeStyle = rgba(d.col, 0.5 * f); g.lineWidth = 0.6 * k; g.beginPath(); g.moveTo(a.x, a.y + 0.9 * k); g.lineTo(b.x, b.y + 0.9 * k); g.stroke(); continue; }
        g.strokeStyle = rgba(d.lite, 0.9 * f); g.lineWidth = 5.6 * k; g.beginPath(); g.moveTo(a.x, a.y - 0.9 * k); g.lineTo(b.x, b.y - 0.9 * k); g.stroke();
        g.strokeStyle = rgba(d.glow ? '#FF8A3D' : d.col, 0.92 * f); g.lineWidth = 3.4 * k; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); continue; }
      const p = R.scr(v, d.x, d.y, d.z), age = t - d.t;
      if (d.kind === 'crater' || d.kind === 'groove') { const r = d.r * k * (d.kind === 'groove' ? 1 : outC(age / 0.15)), ds = R.dirS(d.dir[0], d.dir[1]), an = d.kind === 'groove' ? Math.atan2(ds[1], ds[0]) : 0;
        g.save(); g.translate(p.x, p.y); g.rotate(an); g.fillStyle = rgba(d.lite, 0.8 * f); g.beginPath(); g.ellipse(0, -0.8 * k, r * (d.kind === 'groove' ? 1.2 : 1.05), r * SQ * (d.kind === 'groove' ? 0.75 : 1.05), 0, 0, TAU); g.fill();
        g.fillStyle = rgba(d.col, 0.7 * f); g.beginPath(); g.ellipse(0, 0.3 * k, r * (d.kind === 'groove' ? 1 : 0.82), r * SQ * (d.kind === 'groove' ? 0.5 : 0.8), 0, 0, TAU); g.fill(); g.restore(); }
      else if (d.kind === 'crack') { const r2 = rng(d.seed), path = () => { g.beginPath(); const q2 = rng(d.seed + 1); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + q2() * 0.6, L1 = d.r * k * (0.55 + q2() * 0.45); g.moveTo(p.x, p.y); const mx = p.x + Math.cos(a) * L1 * 0.5, my = p.y + Math.sin(a) * L1 * 0.5 * SQ; g.lineTo(mx + (q2() - 0.5) * 4 * k, my + (q2() - 0.5) * 1.5 * k); g.lineTo(p.x + Math.cos(a) * L1, p.y + Math.sin(a) * L1 * SQ); } };
        r2(); g.fillStyle = rgba(d.col, 0.35 * f); g.beginPath(); g.ellipse(p.x, p.y, 4.5 * k, 4.5 * k * SQ, 0, 0, TAU); g.fill();
        path(); g.strokeStyle = rgba('#FFFFFF', 0.6 * f); g.lineWidth = 2.6 * k; g.save(); g.translate(0, 0.9 * k); g.stroke(); g.restore(); path(); g.strokeStyle = rgba('#5A564F', 0.95 * f); g.lineWidth = 1.7 * k; g.stroke(); }
      else if (d.kind === 'scorch') { g.fillStyle = rgba(d.col, 0.4 * f); g.beginPath(); g.ellipse(p.x, p.y, d.r * k, d.r * k * SQ, 0, 0, TAU); g.fill(); }
      else if (d.kind === 'squeak') { const ds = R.dirS(d.dir[0], d.dir[1]), an = Math.atan2(ds[1], ds[0]); g.strokeStyle = rgba(d.col, 0.9 * f); g.lineWidth = 1.3 * k;
        for (let i = -1; i <= 1; i += 2) { g.beginPath(); g.moveTo(p.x + Math.cos(an + i * 0.9) * 8 * k, p.y + Math.sin(an + i * 0.9) * 8 * k * SQ - 2 * k); g.lineTo(p.x + Math.cos(an + i * 0.9) * 14 * k, p.y + Math.sin(an + i * 0.9) * 14 * k * SQ - 4 * k); g.stroke(); } } }
    g.lineCap = 'round';
    for (const q of PRINTS) { if (!alive(q, t)) continue; const f = fadeOf(q, t, 0.4), p = R.scr(v, q.x, q.y, q.z), ds = R.dirS(q.dir[0], q.dir[1]), an = Math.atan2(ds[1] * 1, ds[0]);
      g.save(); g.translate(p.x, p.y); g.scale(1, SQ * 1.6); g.rotate(an); const w = 5.2 * k * q.big, h = 2.6 * k * q.big;
      if (q.glow) { g.fillStyle = rgba('#FFC83D', 0.55 * f); g.beginPath(); g.ellipse(0, 0, w * 1.2, h * 1.3, 0, 0, TAU); g.fill(); }
      g.fillStyle = rgba(q.col, (q.wet ? 0.55 : q.deep ? 0.85 : 0.7) * f); g.beginPath(); g.ellipse(0, 0, w, h, 0, 0, TAU); g.fill();
      if (q.deep) { g.strokeStyle = rgba('#FFFFFF', 0.4 * f); g.lineWidth = 0.9 * k; g.beginPath(); g.ellipse(0, 0.5 * k, w * 1.05, h * 1.1, 0, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
      g.restore(); }
    for (const R0 of RINGS) { if (!alive(R0, t)) continue; const a = (t - R0.t) / R0.life, p = R.scr(v, R0.x, R0.y, R0.z), r = R0.r * k * outC(a);
      g.strokeStyle = rgba(R0.col, R0.a * (1 - a)); g.lineWidth = Math.max(0.6, R0.w * k * (1 - a * 0.7)); g.beginPath(); g.ellipse(p.x, p.y, r, r * SQ, 0, 0, TAU); g.stroke(); }
    g.restore();
  };
  G.drawAir = (g, v, t) => {
    const k = R.kpx(v, G); g.save();
    for (const P of PUFFS) { if (!alive(P, t)) continue; const a = (t - P.t) / P.life, w = windOff(t - P.t), p = R.scr(v, P.x + w[0], P.y + w[1], P.z), r2 = rng(P.seed), rise = 6 * k * outC(a);
      for (let i = 0; i < 4; i++) { const ox = (r2() - 0.5) * P.r * 1.3 * k, oy = (r2() - 0.5) * P.r * 0.5 * k, er = cl(1 - a * (0.9 + r2() * 0.6), 0, 1), rr = P.r * k * (0.55 + 0.45 * outC(a * 1.6)) * (0.6 + r2() * 0.5) * er;
        if (rr < 0.4) continue; g.fillStyle = rgba(P.col2, 0.85); g.beginPath(); g.arc(p.x + ox, p.y + oy - rise, rr, 0, TAU); g.fill();
        g.fillStyle = rgba(P.col, 0.95); g.beginPath(); g.arc(p.x + ox - rr * 0.15, p.y + oy - rise - rr * 0.22, rr * 0.72, 0, TAU); g.fill(); } }
    for (const b of BITS) { if (!alive(b, t)) continue; const a = t - b.t, f = fadeOf(b, t, 0.35), w = windOff(a);
      let x = b.x + b.vx * a * (1 - a * 0.6) + w[0], y = b.y + b.vy * a * (1 - a * 0.6) + w[1];
      if (b.circle) { const an = a * b.circle; x = b.x + Math.cos(an) * 0.14 * (0.6 + a); y = b.y + Math.sin(an) * 0.14 * (0.6 + a); }
      let h = Math.min(40, b.h + b.vh * a - 0.5 * b.g * a * a); const down = h <= 0; if (down) { if (b.kind === 'drop' || b.kind === 'splat') continue; h = 0; }
      const p = R.scr(v, x, y, b.z), sx = p.x, sy = p.y - h * k, s = b.s * k;
      if (b.kind === 'drop') { const vy = b.vh - b.g * a, an = Math.atan2(-vy * 0.02, 1) - Math.PI / 2; g.save(); g.translate(sx, sy); g.rotate(an + Math.PI / 2 * (vy > 0 ? 0 : 2));
        g.fillStyle = rgba(b.col2, 0.9 * f); g.beginPath(); g.moveTo(0, -s * 1.6); g.quadraticCurveTo(s, 0, 0, s); g.quadraticCurveTo(-s, 0, 0, -s * 1.6); g.fill(); g.fillStyle = rgba('#FFFFFF', 0.9 * f); g.beginPath(); g.arc(-s * 0.25, 0, s * 0.3, 0, TAU); g.fill(); g.restore(); }
      else if (b.kind === 'leaf') { g.save(); g.translate(sx + Math.sin(a * 9 + b.seed) * 2.5 * k, sy); g.rotate(b.spin * a); g.fillStyle = rgba(b.col, f); g.beginPath(); g.ellipse(0, 0, s, s * 0.42, 0, 0, TAU); g.fill();
        g.strokeStyle = rgba('#3F7A2E', 0.6 * f); g.lineWidth = 0.6 * k; g.beginPath(); g.moveTo(-s * 0.8, 0); g.lineTo(s * 0.8, 0); g.stroke(); g.restore(); }
      else if (b.kind === 'chip') { g.save(); g.translate(sx, sy); g.rotate(b.spin * a); g.fillStyle = rgba(b.col, f); g.fillRect(-s / 2, -s / 2, s, s); g.fillStyle = rgba('#FFFFFF', 0.45 * f); g.fillRect(-s / 2, -s / 2, s, s * 0.35); g.restore(); }
      else if (b.kind === 'ember') { g.fillStyle = rgba('#FF8A3D', 0.5 * f); g.beginPath(); g.arc(sx, sy, s * 1.8, 0, TAU); g.fill(); g.fillStyle = rgba(b.col, f); g.beginPath(); g.arc(sx, sy, s * 0.8, 0, TAU); g.fill(); }
      else if (b.kind === 'snow') { g.fillStyle = rgba('#B8C7DA', 0.8 * f); g.beginPath(); g.arc(sx, sy + s * 0.2, s, 0, TAU); g.fill(); g.fillStyle = rgba('#FFFFFF', f); g.beginPath(); g.arc(sx - s * 0.2, sy - s * 0.1, s * 0.75, 0, TAU); g.fill(); }
      else if (b.kind === 'splat') { g.fillStyle = rgba(b.col, 0.95 * f); g.beginPath(); g.ellipse(sx, sy, s * 1.1, s * 0.9, 0, 0, TAU); g.fill(); g.fillStyle = rgba('#FFFFFF', 0.35 * f); g.beginPath(); g.arc(sx - s * 0.3, sy - s * 0.3, s * 0.3, 0, TAU); g.fill(); }
      else { g.fillStyle = rgba(b.col, f); g.beginPath(); g.arc(sx, sy, s * 0.7, 0, TAU); g.fill(); } }
    g.restore();
  };
  return G;
}

// ---------- 🌊 wade: legs cut at the waterline (AvatarKit untouched — a clip + a ring) ----------
function wade(g, U, sx, sy, k, paint, t) {
  const cut = (U && (U.cut || U.sink)) || 0; if (!cut) { paint(sx, sy); return; }
  const c = cut * k; g.save(); g.beginPath(); g.rect(sx - 400 * k, sy - 600 * k, 800 * k, 600 * k + (U.liquid ? 0 : 0.2 * k)); g.clip(); paint(sx, sy + c); g.restore();
  if (U.liquid) { const w = (U.cut > 5 ? 13 : 11) * k, ph = ((t || 0) * 1.6) % 1;
    g.save(); g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.ellipse(sx, sy, w, w * 0.34, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.5 * k; g.beginPath(); g.ellipse(sx, sy, w, w * 0.34, 0, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - ph)).toFixed(3) + ')'; g.lineWidth = 1 * k; g.beginPath(); g.ellipse(sx, sy, w * (1 + ph * 0.8), w * 0.34 * (1 + ph * 0.8), 0, 0, TAU); g.stroke(); g.restore(); }
  else { const col = U.mat === 'snow' ? ['#FFFFFF', '#DCE7F5'] : [mix(U.col || '#C79A68', '#FFFFFF', 0.25), mix(U.col || '#C79A68', '#000000', 0.25)];
    g.save(); [[-5, 0.2], [5, -0.1], [-1, 0.5]].forEach(([dx, dy]) => { g.fillStyle = col[1]; g.beginPath(); g.ellipse(sx + dx * k, sy + dy * k + 0.6 * k, 4.2 * k, 1.8 * k, 0, 0, TAU); g.fill(); g.fillStyle = col[0]; g.beginPath(); g.ellipse(sx + dx * k - 0.4 * k, sy + dy * k, 3.4 * k, 1.4 * k, 0, 0, TAU); g.fill(); }); g.restore(); }
}

// ======================= 🫁 mo-16 (🎬 Motion chat, 2026-11-21): the body answers the ground — 4 Motion.alive moments (Motion rules §48) =======================
// A = Motion.alive(who, {place, ground: G, unit}) → while the avatar STANDS, the tile under it starts ONE moment (3–5 beats), picked by G.state(unit):
//   🥶 shiver + breath clouds (❄️ snow, still 1.2 s · loops) · 🔥 hot-foot hops (🔥 lava, still 0.4 s · 3 hops every 4 s, each touch = a glow print + embers) ·
//   🐶 shake-off (≤ 2.2 s after water · once, 600 ms, the drops fly on the twist peaks) · 🏜️ toe wiggle (sand, idle story 🥱 = 30 s still · once a spell · map + menu)
// ⚔️ battle: breath clouds only · hot-foot · a 400 ms shake · no toes. 🌱 calm: no shiver jitter, ½ clouds, 2 hops, 2 twists, 1 tap. A.poke ends a moment (120 ms ease-out), it starts
// again after its wait. Moving = nothing (the gait acts). Pure on t (state stamps from G) · no ground passed = today's picture.
const SHAKE_PEAKS = [0.09, 0.18, 0.27];
(function floorMoments() {
  const AL = M.ALIVE; if (!AL || !AL.addMoment) return;
  const sio = u => 0.5 - 0.5 * Math.cos(Math.PI * cl(u, 0, 1)), hump = u => Math.sin(Math.PI * cl(u, 0, 1));
  const hs = (k, i) => { let h = 2166136261 ^ (i * 2654435761); for (let j = 0; j < k.length; j++) { h ^= k.charCodeAt(j); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10007) / 10007; };
  // the moment's clock: starts `after` s after the body stood still (or after the last poke) · a poke during it = 120 ms ease-out
  function run(A, t, base, after) {
    const pk = A.lastPoke(t), st = Math.max(base, pk) + after;
    if (t >= st) return {s: t - st, w: 1, start: st};
    if (pk > base + after && t - pk < 0.12) return {s: pk - (base + after), w: 1 - sio((t - pk) / 0.12), start: base + after};
    return null;
  }
  const over = (P, T, w) => Object.assign({}, P, AL.blend(P, Object.assign({}, P, T), w));
  const res = (R, P, marks, key) => Object.assign({}, R, {P, marks: (R.marks || []).concat(marks || []), floor: key});
  const standing = (F, mat) => { const S = F.G.state(F.unit); return S && S.gait === 'stand' && (!mat || S.mat === mat) ? S : null; };
  // ---------- 🥶 shiver + breath clouds ----------
  AL.addMoment('shiver', {at(A, F, t, R) {
    const S = standing(F, 'snow'); if (!S) return null; const r = run(A, t, S.stillT, 1.2); if (!r) return null;
    const calm = A.calm || F.G.calm, P = Object.assign({}, R.P); P._br = AL.breathAt(t, A.seed); P._brCalm = calm ? 1 : 0;
    if (A.place === 'battle') return res(R, P, ['motion.breath'], 'shiver');
    const g = A.gear, w = r.w * sio(r.s / 0.35), T = {shrugL: 0.55, shrugR: 0.55, nod: 0.1, kneeL: 0.14, kneeR: 0.14, bend: 0.04};
    if (g.id === 'none') Object.assign(T, {armL: -0.15, elbowL: -1.9, armR: 0.15, elbowR: 1.9});   /* forearms across the chest (reads in all 4 views) */
    else if (g.w !== 'heavy' && !g.two && !g.off) Object.assign(T, {armL: -0.15, elbowL: -1.9});
    let Q = over(P, T, w);
    if (!calm) { const n = Math.floor(t / 0.06), j = hs('sv' + A.seed, n) - 0.5, j2 = hs('sw' + A.seed, n) - 0.5; Q.rot = (Q.rot || 0) + 0.024 * j * w; Q.dy = (Q.dy || 0) + 0.7 * j2 * w; }   /* stepped every 60 ms (F12) */
    const ch = Math.floor(t / 0.12) % 2; Q.face = w > 0.3 ? {eyes: 'squeeze', brows: 'worried', mouth: ch ? 'tiny' : 'wobbly', extras: ['flush']} : Q.face;   /* chattering · light features (a turned face crowds big ones) */
    return res(R, Q, ['motion.breath', 'motion.cold'], 'shiver');
  }});
  // ---------- 🔥 hot-foot hops (a 4 s clock: 3 hops, settle, again) ----------
  const HOP = 0.18;
  AL.addMoment('hotfoot', {at(A, F, t, R) {
    const S = standing(F, 'lava'); if (!S) return null; const r = run(A, t, S.stillT, 0.4); if (!r) return null;
    const calm = A.calm || F.G.calm, n = calm ? 2 : 3, c = Math.floor(r.s / 4), s = r.s - c * 4, g = A.gear, P = Object.assign({}, R.P);
    for (let h = 1; h <= n; h++) { const tt = r.start + c * 4 + h * HOP, key = 'hf' + Math.round(tt * 1000); if (t >= tt && t - tt < 0.25 && !F.fired.has(key)) { F.fired.add(key); if (F.fired.size > 40) F.fired.delete(F.fired.values().next().value); F.G.touch(F.unit, tt, {foot: h % 2}); } }
    if (s < n * HOP) { const h = Math.floor(s / HOP), u = (s - h * HOP) / HOP, L = h % 2 === 0, k = hump(u) * r.w * (calm ? 0.55 : 1), T = {};
      if (L) Object.assign(T, {kneeL: 1.1 * k, legL: 0.35 * k, footL: -0.35 * k, kneeR: 0.12}); else Object.assign(T, {kneeR: 1.1 * k, legR: -0.35 * k, footR: -0.35 * k, kneeL: 0.12});
      T.dy = -3.2 * k; T.rot = (L ? -0.05 : 0.05) * k;
      if (g.id === 'none') Object.assign(T, {armL: -0.7 * k - 0.2, elbowL: -0.6, armR: 0.7 * k + 0.2, elbowR: 0.6}); else Object.assign(T, {armL: -0.6 * k - 0.15, elbowL: -0.5});
      const Q = AL.addP(Object.assign({}, P), {dy: T.dy, rot: T.rot}); delete T.dy; delete T.rot; const Z = over(Q, T, 1); Z.face = {eyes: 'dot', brows: 'up', mouth: 'wobbly'};   /* ouch · light features (an O mouth reads as a dark blob on a ¾-turned face) */ return res(R, Z, [], 'hotfoot'); }
    const u = (s - n * HOP) / 1.0; if (u < 1) { const Q = over(P, {shrugL: 0.3, shrugR: 0.3, kneeL: 0.1, kneeR: 0.1}, (1 - sio(u)) * r.w); Q.face = 'relieved'; return res(R, Q, [], 'hotfoot'); }
    return null;
  }});
  // ---------- 🐶 shake-off (head leads, hips last) ----------
  const TWK = [[0, 0], [0.09, -0.25], [0.18, 0.22], [0.27, -0.15], [0.36, 0]];
  const twAt = (s, amp, upto) => { if (s <= 0 || s >= upto) return 0; for (let i = 1; i < TWK.length; i++) if (s < TWK[i][0]) { const a = TWK[i - 1], b = TWK[i]; return (a[1] + (b[1] - a[1]) * sio((s - a[0]) / (b[0] - a[0]))) * amp; } return 0; };
  AL.addMoment('shake', {at(A, F, t, R) {
    const S = standing(F); if (!S || S.shookT < -1 || t < S.shookT) return null; const s = t - S.shookT, len = A.place === 'battle' ? 0.4 : 0.6; if (s >= len) return null;
    if (A.lastPoke(t) > S.shookT && t - A.lastPoke(t) > 0.12) return null;
    const calm = A.calm || F.G.calm, amp = calm ? 0.6 : 1, upto = calm ? 0.27 : 0.36, tw = twAt(s, amp, upto), lead = twAt(s + 0.03, amp, upto), lag = twAt(s - 0.03, amp, upto), g = A.gear;
    const w = s < 0.36 ? 1 : 1 - sio((s - 0.36) / (len - 0.36)), P = Object.assign({}, R.P);
    const Q = AL.addP(P, {twist: tw, neckTurn: lead * 0.9, rot: lag * 0.08, shrugL: 0.3 * w, shrugR: 0.3 * w, kneeL: 0.1 * w, kneeR: 0.1 * w});
    if (g.id === 'none') { Q.armL = (Q.armL || 0) - 0.35 * w + lag * 0.5; Q.armR = (Q.armR || 0) + 0.35 * w + lag * 0.5; }
    Q.face = s < 0.42 ? {eyes: 'squeeze', mouth: 'smile'} : Q.face; return res(R, Q, [], 'shake');
  }});
  // ---------- 🏜️ toe wiggle (idle story 🥱: 30 s still on sand, once a spell) ----------
  AL.addMoment('toes', {at(A, F, t, R) {
    if (A.place === 'battle') return null; const S = standing(F, 'loose'); if (!S || S.tile !== 'sand') return null;
    const st = Math.max(A.sessionT(t), S.stillT) + AL.STAGE_AT[3], s = t - st; if (s < 0 || s >= 1.2) return null; if (A.lastPoke(t) > st) return null;
    const calm = A.calm || F.G.calm, taps = calm ? [0.4] : [0.35, 0.7], P = Object.assign({}, R.P), w = sio(s / 0.25) * (1 - sio((s - 0.95) / 0.25));
    taps.forEach((tt, i) => { const T0 = st + tt + 0.12, key = 'tz' + Math.round(T0 * 1000); if (t >= T0 && t - T0 < 0.25 && !F.fired.has(key)) { F.fired.add(key); F.G.touch(F.unit, T0, {foot: 1, cap: 1, dig: 1}); } });
    let k = 0; for (const tt of taps) { const u = (s - tt) / 0.22; if (u >= 0 && u < 1) k = hump(u); }
    const Q = over(P, {nod: 0.25, neckTilt: 0.06, kneeR: 0.6 * k + 0.05, footR: -0.7 * k + 0.2 * (1 - k), legR: 0.18 * k, bend: 0.06}, w); Q.face = w > 0.3 ? 'content' : Q.face;
    return res(R, Q, [], 'toes');
  }});
  // ---------- 🫧 marks (head frame, shapes only — emoji lag rule · never over the face, F11) ----------
  if (window.Acting && Acting.add && !(Acting.get && Acting.get('marks', 'motion.breath'))) Acting.add({marks: {
    'motion.breath'(g, hy, k, t, ctx) {   /* a cloud on each exhale, born BESIDE the mouth (past the cheek), drifting out + up, eroding */
      const B = ctx && ctx.P && ctx.P._br; if (!B || B.u < 0.45) return; const age = (B.u - 0.45) * B.d, life = 1.3; if (age >= life) return;
      const a = age / life, half = ctx.P._brCalm, n = half ? 2 : 3, x0 = 18 * k, y0 = hy + 5 * k;
      g.save(); for (let i = 0; i < n; i++) { const q = cl(a * 1.15 - i * 0.12, 0, 1); if (q <= 0) continue; const r = (3 + 6 * q) * k * (1 - i * 0.12) * (half ? 0.8 : 1), x = x0 + (3 + 14 * q) * k + i * 4.5 * k, y = y0 - (1 + 10 * q) * k - i * 2.5 * k, al = q < 0.6 ? 0.95 : 0.95 * (1 - q) / 0.4;
        g.globalAlpha = al; g.fillStyle = '#A9BFDA'; g.beginPath(); g.arc(x, y + 0.9 * k, r, 0, TAU); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x - 0.6 * k, y, r * 0.86, 0, TAU); g.fill(); }
      g.restore(); },
    'motion.cold'(g, hy, k, t) {   /* frost shiver ticks at both cheeks, stepped every 60 ms */
      const n = Math.floor(t / 0.06); g.save(); g.strokeStyle = '#6FB7FF'; g.lineWidth = 1.2 * k; g.lineCap = 'round';
      [-1, 1].forEach(sd => { for (let i = 0; i < 2; i++) { const j = (hs('cd', n * 4 + i + (sd > 0 ? 2 : 0)) - 0.5) * 1.4 * k, x = sd * (18 + i * 3) * k + j, y = hy + (-2 + i * 5) * k; g.beginPath(); g.moveTo(x, y); g.lineTo(x + sd * 3.2 * k, y - 1 * k); g.stroke(); } });
      g.restore(); }}}, {by: '🎬 Motion chat', block: 'motion'});
})();

Object.assign(M, {GROUND, groundMAT: MAT, groundS, groundOn, groundFlat, ground, wade, GROUND15: {VERSION: 'mo-16', W: W_, V: V_, E: E_, LEVELS}});
})();
