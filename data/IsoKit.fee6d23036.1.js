
/* ================= 🧱 IsoKit — shared 2.5D diamond engine (iso-1, TD-Stories chat, 2026-11-15) =================
   ONE projection: 2:1 diamond "toy diorama" (Aowu 2026-11-15 01:06). Rule: every pretty thing is paid for ONCE, not every frame
   (🧱 baked into ground chunks · 🖼️ cached per unit · 🎬 live inside the budget). Plan: Drive "IsoKit + Pre-flight — full plan.md".
   Page:  include('IsoKit') after UiKit + AvatarKit (avatars optional). Global `Iso`. No server tags anywhere in this file.

   WORLD  x, y = tile units (cell i, j covers x ∈ [i, i+1), y ∈ [j, j+1)) · z = height in LEVELS (1 level = Iso.HZ px at zoom 1)
          screen (zoom 1): sx = (x − y)·TW/2 · sy = (x + y)·TH/2 − z·HZ        TW 64 · TH 32 · HZ 16
   MAP    m = Iso.map({w, h, theme: 'meadow', cell: (i, j) => ({t: 'grass', h: 0, block: 0, cost: 1}), seed})
          m.get(i, j) → {t, h, block, cost} · m.set(i, j, {t?, h?, block?, cost?}) (marks its chunk for re-bake) · m.inside(i, j) · m.heightAt(x, y) · m.walk(i, j)
          tiles: Iso.TILES (grass, flower, path, sand, water, stone, dirt, snow, lava, wood, moat) · themes: Iso.THEMES (meadow · storybook · beach · snow · lava)
          Iso.addTheme(key, {tile: {top, top2, side, sideL, sideR, deco}}, base) — new looks cost nothing per frame (baked)
   VIEW   v = Iso.view(canvas, m, {zoom, min, max, pan: true, bg: ['#cde', '#fff'], pad: {t, b, l, r}, snap: true})
          pad = screen edges your own buttons cover (CSS px) → fit + camera use the free area between them (v.setPad({b: 120}) after a layout change)
          v.fit() · v.centerOn(x, y) · v.follow(obj | null) · v.shake(px) · v.toScreen(x, y, z) → {x, y} (CSS px) · v.toWorld(px, py) → {x, y}
          v.hit(px, py) → {i, j} | null (height-aware) · v.onTap = (cell, px, py, e) => … · v.zoom · v.moving (true while a finger / wheel moves it)
          follow(obj): pass a STABLE object you update (never a slot of the items array — Iso.frame re-sorts it every frame)
          pan = drag · zoom = pinch / wheel / trackpad pinch, toward the finger / cursor · inertia · clamp to the map · v.resize() (auto via ResizeObserver)
   FRAME  stats = Iso.frame(v, {items, t, groundFx(g, v), airFx(g, v), overlay(g, v), shimmer: true})
          items = YOUR array of {x, y, z?, depth?, pic?, ax?, ay?, draw?(g, sx, sy, k, v)} — IsoKit keeps it sorted in place (insertion sort, it stays nearly sorted)
          pic = a picture from Iso.sprite / Iso.avatar (drawn at its anchor) · draw = your own painter (sx, sy = feet point in CSS px, k = zoom)
          only things on screen are drawn · ground chunks 8 × 8 are baked per zoom step, re-baked only when a cell changes
   PICS   Iso.sprite(key, w, h, paint(g, w, h), {ax, ay, outline}) → pic (w, h in iso px at zoom 1; baked per zoom step, outline + soft shadow optional)
          Iso.avatar(who, {pose: 'walk' | 'still' | <act key>, f, size}) → pic of an AvatarKit avatar (walk = 8 frames, act = 6 frames via Acting)
          Iso.drawPic(g, v, pic, x, y, z, {flip, alpha, scale}) — copy a picture at a world point (pixel-snapped)
   PATHS  Iso.path(m, a, b, {diag, climb, cost}) → [{x, y}] cell centres | null · Iso.pathAsync(…) → Promise (Web Worker when the map is > 48 × 48)
   NEAR   g = Iso.grid(cell = 2) → g.clear() · g.add(o) (o.x, o.y) · g.near(x, y, r, out) → out[] (nearby only, never all against all)
   POOLS  p = Iso.pool(() => ({…})) → p.get() · p.free(o) · p.live (array) · p.each(fn) — no new objects every frame
   LOOP   L = Iso.loop({update(dt), render(alpha, t), idle?() → true when nothing moves}) → L.stop() · fixed game step 30 / s, drawing every screen frame
   BUDGET Iso.budget = {level 0–4, fx (1 → 0.4), shimmer, fps (60 | 30), dpr cap, ms, units cap} — steps down when frames are slow, back up when fast
          Iso.phone = small touch screen → starts at 30 fps + dpr ≤ 2 + units cap 60
   MINI   mm = Iso.minimap(canvas, m, v, {dots: () => [{x, y, c}]}) → mm.draw() · tap = jump the camera there
   Real actions (🎬 beats, act-1) arrive later as Iso.act on top of Acting.play — see the plan §10. */
(function(){
'use strict';
const TW = 64, TH = 32, HZ = 16, CH = 8;                         // tile size, height step, chunk size (cells)
const STEPS = [0.25, 0.33, 0.5, 0.75, 1, 1.5, 2, 3, 4];                          // zoom steps pictures are baked at (× device pixel ratio)
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const hasDoc = typeof document !== 'undefined';
function canvas(w, h){ if(hasDoc){ const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  if(typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h))); return null; }
function hash2(i, j, s){ let h = (i * 374761393 + j * 668265263 + (s | 0) * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function rgb(hex){ const n = parseInt(String(hex).replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function shade(hex, f){ const c = rgb(hex); const m = v => clamp(Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)), 0, 255); return 'rgb(' + m(c[0]) + ',' + m(c[1]) + ',' + m(c[2]) + ')'; }

/* ---------- 🎨 tiles + themes (palettes + small baked details) ---------- */
const TILES = ['grass', 'flower', 'path', 'sand', 'water', 'stone', 'dirt', 'snow', 'lava', 'wood', 'moat'];
const TID = {}; TILES.forEach((k, i) => TID[k] = i);
const BASE_THEME = {
  grass: {top: '#8FD16A', top2: '#7CC45A', side: '#9A6B43', lip: '#6FB24E', deco: 'tuft'},
  flower: {top: '#93D46E', top2: '#80C75D', side: '#9A6B43', lip: '#6FB24E', deco: 'flower'},
  path: {top: '#EBCB93', top2: '#DDB97E', side: '#B98D5A', deco: 'pebble'},
  sand: {top: '#F6DFA4', top2: '#EED493', side: '#D2AE6C', deco: 'dot'},
  water: {top: '#5EC3EA', top2: '#4BB2DE', side: '#3A8FBF', deco: 'ripple', liquid: 1},
  moat: {top: '#6FC7DF', top2: '#5AB8D3', side: '#3F8FAF', deco: 'ripple', liquid: 1},
  stone: {top: '#C9C6BE', top2: '#B9B5AC', side: '#8E8A82', deco: 'crack'},
  dirt: {top: '#C79A68', top2: '#B98B5A', side: '#8E6640', deco: 'dot'},
  snow: {top: '#F4F8FF', top2: '#E4EEFA', side: '#B8C7DA', deco: 'sparkle'},
  lava: {top: '#FF7A2E', top2: '#F25A1C', side: '#7A2A12', deco: 'glow', liquid: 1},
  wood: {top: '#D9A46A', top2: '#C99257', side: '#93633A', deco: 'plank'},
};
const THEMES = {
  meadow: {base: '#7B5434', baseDark: '#5A3C24', bg: ['#BFE6FF', '#F2FBFF'], tile: {}},
  storybook: {base: '#9C6B48', baseDark: '#6E4A30', bg: ['#FFD9E8', '#FFF6E3'], tile: {grass: {top: '#A6DC80', top2: '#94D06E', lip: '#7EBE5C'}, path: {top: '#F3D9AE', top2: '#E8C997', deco: 'cobble'}, moat: {top: '#8AD3EE', top2: '#74C5E4'}}},
  beach: {base: '#C9A46A', baseDark: '#9C7C48', bg: ['#9EDCFF', '#E8F8FF'], tile: {grass: {top: '#9AD772', top2: '#88CB60'}}},
  snow: {base: '#8C9BB0', baseDark: '#66758C', bg: ['#C9D9F2', '#F4F8FF'], tile: {grass: {top: '#EAF2FB', top2: '#DCE7F5', lip: '#C9D8EA', side: '#9BAAC0', deco: 'sparkle'}, flower: {top: '#EEF4FC', top2: '#E0EAF6', lip: '#C9D8EA', side: '#9BAAC0', deco: 'sparkle'}}},
  lava: {base: '#4A2A22', baseDark: '#2E1812', bg: ['#3B1E2E', '#7A3A2A'], tile: {grass: {top: '#6E5A4E', top2: '#5E4C42', lip: '#4E3E36', side: '#3A2C26', deco: 'crack'}, flower: {top: '#735E50', top2: '#634F44', lip: '#4E3E36', side: '#3A2C26', deco: 'glow'}}},
};
function themeTile(theme, t){ const T = THEMES[theme] || THEMES.meadow, k = TILES[t] || 'grass'; return Object.assign({}, BASE_THEME[k], (T.tile || {})[k] || {}); }
function addTheme(key, o, base){ THEMES[key] = Object.assign({}, THEMES[base || 'meadow'], o, {tile: Object.assign({}, (THEMES[base || 'meadow'] || {}).tile, o.tile || {})}); BAKE_VER++; return THEMES[key]; }
let BAKE_VER = 1;

/* ---------- 🗺️ map ---------- */
let MAP_ID = 0;
function makeMap(o){
  o = o || {}; const w = o.w | 0 || 16, h = o.h | 0 || 16, n = w * h;
  const M = {id: ++MAP_ID, w, h, theme: o.theme || 'meadow', seed: o.seed | 0, t: new Uint8Array(n), hgt: new Uint8Array(n), block: new Uint8Array(n), cost: new Float32Array(n).fill(1),
    ver: 1, dirty: new Set(), maxH: 0, base: o.base == null ? 1.6 : o.base};
  for(let j = 0; j < h; j++) for(let i = 0; i < w; i++){ const c = o.cell ? o.cell(i, j) || {} : {}, k = j * w + i;
    M.t[k] = TID[c.t] != null ? TID[c.t] : (c.t | 0); M.hgt[k] = c.h | 0; M.block[k] = c.block ? 1 : (TILES[M.t[k]] === 'water' || TILES[M.t[k]] === 'moat' || TILES[M.t[k]] === 'lava' ? 1 : 0); M.cost[k] = c.cost || 1; if(M.hgt[k] > M.maxH) M.maxH = M.hgt[k]; }
  M.inside = (i, j) => i >= 0 && j >= 0 && i < w && j < h;
  M.get = (i, j) => { if(!M.inside(i, j)) return null; const k = j * w + i; return {t: TILES[M.t[k]], h: M.hgt[k], block: M.block[k], cost: M.cost[k]}; };
  M.walk = (i, j) => M.inside(i, j) && !M.block[j * w + i];
  M.heightAt = (x, y) => { const i = Math.floor(x), j = Math.floor(y); return M.inside(i, j) ? M.hgt[j * w + i] : 0; };
  M.set = (i, j, c) => { if(!M.inside(i, j)) return; const k = j * w + i;
    if(c.t != null) M.t[k] = TID[c.t] != null ? TID[c.t] : c.t | 0; if(c.h != null){ M.hgt[k] = c.h | 0; if(c.h > M.maxH) M.maxH = c.h | 0; }
    if(c.block != null) M.block[k] = c.block ? 1 : 0; if(c.cost != null) M.cost[k] = c.cost;
    M.ver++; for(let dj = -1; dj <= 1; dj++) for(let di = -1; di <= 1; di++){ const ci = Math.floor((i + di) / CH), cj = Math.floor((j + dj) / CH); M.dirty.add(ci + ',' + cj); } };
  M.setTheme = th => { M.theme = th; M.ver++; M.dirty.add('*'); };
  return M;
}

/* ---------- 🧱 baked ground: tile pictures + 8 × 8 chunks per zoom step ---------- */
// screen offset (zoom 1, iso px) of the TOP corner of cell (i, j) at height h
const cellTop = (i, j, h) => ({x: (i - j) * TW / 2, y: (i + j) * TH / 2 - h * HZ});
function diamond(g, x, y, s, inset){ const a = TW / 2 * s, b = TH / 2 * s, d = inset || 0; g.beginPath(); g.moveTo(x, y + d); g.lineTo(x + a - d * 2, y + b); g.lineTo(x, y + 2 * b - d); g.lineTo(x - a + d * 2, y + b); g.closePath(); }
function paintTop(g, x, y, s, P, i, j, seed, liquid){
  const r = hash2(i, j, seed), r2 = hash2(j, i, seed + 7);
  g.fillStyle = r < 0.5 ? P.top : P.top2; diamond(g, x, y, s); g.fill();
  // gentle colour variation + rounded top edge (lighter inner diamond, darker rim)
  g.fillStyle = shade(r < 0.5 ? P.top : P.top2, (r2 - 0.5) * 0.08); diamond(g, x, y, s, 2.2 * s); g.fill();
  g.strokeStyle = 'rgba(255,255,255,' + (liquid ? 0.22 : 0.24) + ')'; g.lineWidth = Math.max(1, 1.4 * s);
  g.beginPath(); g.moveTo(x - TW / 2 * s + 3 * s, y + TH / 2 * s); g.lineTo(x, y + 1.5 * s); g.lineTo(x + TW / 2 * s - 3 * s, y + TH / 2 * s); g.stroke();   // lit top-left edges
  g.strokeStyle = 'rgba(0,0,0,0.065)'; g.beginPath(); g.moveTo(x - TW / 2 * s + 2 * s, y + TH / 2 * s); g.lineTo(x, y + TH * s - 1 * s); g.lineTo(x + TW / 2 * s - 2 * s, y + TH / 2 * s); g.stroke();
  // small details (seeded, stay put)
  const cx = x, cy = y + TH / 2 * s, n = 2 + Math.floor(r * 3), dot = (k, f) => ({dx: (hash2(i * 7 + k, j * 3, seed + f) - 0.5) * TW * 0.55 * s, dy: (hash2(i * 5, j * 11 + k, seed + f) - 0.5) * TH * 0.5 * s});
  switch(P.deco){
    case 'tuft': g.strokeStyle = shade(P.top, -0.22); g.lineWidth = Math.max(1, 1.2 * s); for(let k = 0; k < n; k++){ const d = dot(k, 1); g.beginPath(); g.moveTo(cx + d.dx - 2 * s, cy + d.dy); g.lineTo(cx + d.dx - 1 * s, cy + d.dy - 4 * s); g.moveTo(cx + d.dx, cy + d.dy); g.lineTo(cx + d.dx + 1 * s, cy + d.dy - 5 * s); g.moveTo(cx + d.dx + 2 * s, cy + d.dy); g.lineTo(cx + d.dx + 3 * s, cy + d.dy - 3.5 * s); g.stroke(); } break;
    case 'flower': for(let k = 0; k < n + 1; k++){ const d = dot(k, 2), c = ['#FFFFFF', '#FFE36B', '#FF8FB8', '#B9A4FF'][Math.floor(hash2(i + k, j, seed + 3) * 4)]; g.fillStyle = c; g.beginPath(); g.arc(cx + d.dx, cy + d.dy, 1.9 * s, 0, TAU); g.fill(); g.fillStyle = '#FFC845'; g.beginPath(); g.arc(cx + d.dx, cy + d.dy, 0.8 * s, 0, TAU); g.fill(); } break;
    case 'pebble': case 'cobble': g.fillStyle = shade(P.top, -0.12); for(let k = 0; k < (P.deco === 'cobble' ? 5 : n); k++){ const d = dot(k, 4); g.beginPath(); g.ellipse(cx + d.dx, cy + d.dy, (P.deco === 'cobble' ? 3.6 : 1.8) * s, (P.deco === 'cobble' ? 1.9 : 1.1) * s, 0, 0, TAU); g.fill(); } break;
    case 'dot': g.fillStyle = shade(P.top, -0.1); for(let k = 0; k < n + 2; k++){ const d = dot(k, 5); g.fillRect(cx + d.dx, cy + d.dy, 1.4 * s, 1.4 * s); } break;
    case 'ripple': g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = Math.max(1, 1.1 * s); for(let k = 0; k < 2; k++){ const d = dot(k, 6); g.beginPath(); g.moveTo(cx + d.dx - 5 * s, cy + d.dy); g.quadraticCurveTo(cx + d.dx - 2 * s, cy + d.dy - 2 * s, cx + d.dx + 1 * s, cy + d.dy); g.quadraticCurveTo(cx + d.dx + 4 * s, cy + d.dy + 2 * s, cx + d.dx + 6 * s, cy + d.dy); g.stroke(); } break;
    case 'crack': g.strokeStyle = shade(P.top, -0.2); g.lineWidth = Math.max(1, s); { const d = dot(0, 7); g.beginPath(); g.moveTo(cx + d.dx - 5 * s, cy + d.dy); g.lineTo(cx + d.dx, cy + d.dy + 2 * s); g.lineTo(cx + d.dx + 4 * s, cy + d.dy - 1 * s); g.stroke(); } break;
    case 'sparkle': g.fillStyle = 'rgba(255,255,255,.9)'; for(let k = 0; k < n; k++){ const d = dot(k, 8); g.fillRect(cx + d.dx, cy + d.dy, 1.3 * s, 1.3 * s); } break;
    case 'glow': g.fillStyle = 'rgba(255,230,120,.55)'; for(let k = 0; k < n; k++){ const d = dot(k, 9); g.beginPath(); g.arc(cx + d.dx, cy + d.dy, 2.2 * s, 0, TAU); g.fill(); } break;
    case 'plank': g.strokeStyle = shade(P.top, -0.18); g.lineWidth = Math.max(1, s); for(let k = -1; k <= 1; k++){ g.beginPath(); g.moveTo(cx - TW / 4 * s + k * 8 * s, cy - TH / 4 * s + k * 4 * s); g.lineTo(cx + TW / 4 * s + k * 8 * s, cy + TH / 4 * s + k * 4 * s); g.stroke(); } break;
  }
}
// side faces: left-front (lit, depth dl) and right-front (shade, depth dr) of a cell; edge = the diorama slab at the map edge
function paintSides(g, x, y, s, P, dl, dr, edgeL, edgeR){
  const a = TW / 2 * s, b = TH / 2 * s;
  const face = (sgn, d, col, edge) => { if(d <= 0) return; const x2 = x + sgn * a;
    g.fillStyle = col; g.beginPath(); g.moveTo(x2, y + b); g.lineTo(x, y + 2 * b); g.lineTo(x, y + 2 * b + d); g.lineTo(x2, y + b + d); g.closePath(); g.fill();
    if(P.lip){ const lp = Math.min(d, 4 * s); g.fillStyle = P.lip; g.beginPath(); g.moveTo(x2, y + b); g.lineTo(x, y + 2 * b); g.lineTo(x, y + 2 * b + lp); g.lineTo(x2, y + b + lp); g.closePath(); g.fill(); }
    if(edge){ const q = d * 0.62; g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.moveTo(x2, y + b + q); g.lineTo(x, y + 2 * b + q); g.lineTo(x, y + 2 * b + d); g.lineTo(x2, y + b + d); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = Math.max(1, s); g.beginPath(); g.moveTo(x2, y + b + d * 0.36); g.lineTo(x, y + 2 * b + d * 0.36); g.stroke(); } };
  face(-1, dl, P.sideL || shade(P.side, 0.12), edgeL); face(1, dr, P.sideR || shade(P.side, -0.16), edgeR);
  if(dl > 0 && dr > 0){ g.strokeStyle = 'rgba(0,0,0,.13)'; g.lineWidth = Math.max(1, 0.8 * s); g.beginPath(); g.moveTo(x, y + 2 * b); g.lineTo(x, y + 2 * b + Math.min(dl, dr)); g.stroke(); }
}
// one cell (top + its front faces) at (x, y) = its top corner on the canvas g, scale s — used by the chunk baker AND by the front-cliff redraw
function paintCell(g, M, i, j, x, y, s){
  const T = THEMES[M.theme] || THEMES.meadow, k = j * M.w + i, h = M.hgt[k], P = themeTile(M.theme, M.t[k]);
  const eL = j + 1 >= M.h, eR = i + 1 >= M.w, hl = eL ? -M.base : M.hgt[(j + 1) * M.w + i], hr = eR ? -M.base : M.hgt[j * M.w + i + 1];
  const dl = Math.max(0, h - hl) * HZ * s, dr = Math.max(0, h - hr) * HZ * s;
  if(dl > 0 || dr > 0){ const slab = Object.assign({}, P, {side: T.base, sideL: shade(T.base, 0.1), sideR: shade(T.base, -0.18)});
    // a face that drops to the base at the map edge = diorama slab colours below ground level
    paintSides(g, x, y, s, eL || eR ? (h > 0 ? P : slab) : P, dl, dr, eL, eR);
    if((eL || eR) && h > 0){ const yb = y + h * HZ * s; paintSides(g, x, yb, s, slab, eL ? M.base * HZ * s : 0, eR ? M.base * HZ * s : 0, eL, eR); } }
  paintTop(g, x, y, s, P, i, j, M.seed, P.liquid);
  const hb = j > 0 ? M.hgt[(j - 1) * M.w + i] : h, ha = i > 0 ? M.hgt[j * M.w + i - 1] : h;
  if(hb > h || ha > h){ g.fillStyle = 'rgba(40,30,20,.14)'; diamond(g, x, y, s); g.fill(); }   // 🌒 ambient darkening under a wall behind
}
// one chunk (CH × CH cells) baked at scale s (= zoom step × dpr) → {c, ox, oy} (ox, oy = where the chunk's origin sits, iso px at zoom 1)
function bakeChunk(M, ci, cj, s){
  const i0 = ci * CH, j0 = cj * CH, i1 = Math.min(M.w, i0 + CH), j1 = Math.min(M.h, j0 + CH); if(i0 >= M.w || j0 >= M.h) return null;
  const baseD = M.base * HZ, up = (M.maxH + 0.5) * HZ;
  const minX = (i0 - j1) * TW / 2, maxX = (i1 - j0) * TW / 2, minY = (i0 + j0) * TH / 2 - up, maxY = (i1 + j1) * TH / 2 + baseD + M.maxH * HZ + 2;
  const W = (maxX - minX) * s, H = (maxY - minY) * s, c = canvas(W + 2, H + 2); if(!c) return null; const g = c.getContext('2d');
  g.lineJoin = 'round'; g.lineCap = 'round';
  for(let d = (i0 + j0); d <= (i1 - 1) + (j1 - 1); d++) for(let i = i0; i < i1; i++){ const j = d - i; if(j < j0 || j >= j1) continue;
    const top = cellTop(i, j, M.hgt[j * M.w + i]); paintCell(g, M, i, j, (top.x - minX) * s, (top.y - minY) * s, s); }
  return {c, ox: minX, oy: minY, s, px: c.width * c.height};
}

/* ---------- 🎥 view: camera, input, culling ---------- */
function makeView(cv, M, o){
  o = o || {}; const V = {cv, map: M, zoom: o.zoom || 1, min: o.min || 0.35, max: o.max || 3, cam: {x: 0, y: 0}, pan: o.pan !== false, onTap: null,
    moving: false, lastMove: 0, snap: o.snap !== false, _snapTo: 0, vel: {x: 0, y: 0}, shakeA: 0, followObj: null, bg: o.bg || null, margin: o.margin == null ? 1 : o.margin, W: 0, H: 0, dpr: 1, step: 1,
    pad: Object.assign({t: 0, b: 0, l: 0, r: 0}, o.pad || {}), cx: 0, cy: 0, uw: 1, uh: 1, chunks: new Map(), chunkAny: new Map(), _px: 0, stepAt: 0, stats: {}, _ptr: new Map(), _down: null};
  const g = cv.getContext('2d'); V.g = g;
  V.resize = () => { const r = cv.getBoundingClientRect ? cv.getBoundingClientRect() : {width: cv.width, height: cv.height}; V.W = Math.max(1, r.width || cv.clientWidth || cv.width); V.H = Math.max(1, r.height || cv.clientHeight || cv.height);
    V.dpr = Math.min((typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1) || 1, BUDGET.dprCap); cv.width = Math.round(V.W * V.dpr); cv.height = Math.round(V.H * V.dpr); V._bgPic = null; centre(); };
  // 📐 pad = screen edges covered by the page's own buttons (CSS px): fit + the camera use the free area between them
  const centre = () => { const P = V.pad; V.uw = Math.max(40, V.W - P.l - P.r); V.uh = Math.max(40, V.H - P.t - P.b); V.cx = P.l + V.uw / 2; V.cy = P.t + V.uh / 2; };
  V.setPad = p => { Object.assign(V.pad, p || {}); centre(); if(V.cam) clampCam(); };
  V.isoBounds = () => { const b = M.base * HZ; return {x0: -M.h * TW / 2, x1: M.w * TW / 2, y0: -M.maxH * HZ, y1: (M.w + M.h) * TH / 2 + b}; };
  V.toScreen = (x, y, z) => ({x: ((x - y) * TW / 2 - V.cam.x) * V.zoom + V.cx + V._sx(), y: ((x + y) * TH / 2 - (z || 0) * HZ - V.cam.y) * V.zoom + V.cy + V._sy()});
  V.toWorld = (px, py, z) => { const sx = (px - V.cx) / V.zoom + V.cam.x, sy = (py - V.cy) / V.zoom + V.cam.y + (z || 0) * HZ; const a = sx / (TW / 2), b = sy / (TH / 2); return {x: (a + b) / 2, y: (b - a) / 2}; };
  V.hit = (px, py) => { for(let h = M.maxH; h >= 0; h--){ const w = V.toWorld(px, py, h), i = Math.floor(w.x), j = Math.floor(w.y); if(M.inside(i, j) && M.hgt[j * M.w + i] === h) return {i, j}; } return null; };
  V.centerOn = (x, y, z) => { V.cam.x = (x - y) * TW / 2; V.cam.y = (x + y) * TH / 2 - (z || 0) * HZ; clampCam(); };
  V.fit = pad => { const B = V.isoBounds(), p = pad == null ? 0.94 : pad, zf = Math.min(V.uw / (B.x1 - B.x0), V.uh / (B.y1 - B.y0)) * p; if(zf < V.min) V.min = zf * 0.66;   /* fit always shows the whole map */ V.zoom = clamp(zf, V.min, V.max); V._snapTo = 0;
    if(V.snap){ let best = 0; for(const st of STEPS){ const zz = st / V.dpr; if(zz <= V.zoom + 1e-9 && zz >= V.zoom * 0.7) best = zz; } if(best){ V.zoom = best; V.min = Math.min(V.min, best); } } V._fitZ = V.zoom;   /* the largest baked step that still fits; later snaps never go above it */ V.cam.x = (B.x0 + B.x1) / 2; V.cam.y = (B.y0 + B.y1) / 2; V.moving = true; V.lastMove = now(); };
  V.follow = obj => { V.followObj = obj || null; };
  V.shake = px => { V.shakeA = Math.max(V.shakeA, px || 6); };
  let shx = 0, shy = 0; V._sx = () => shx; V._sy = () => shy;
  // camera clamp per axis: a map BIGGER than the free area may show ≤ 35 % empty space past its edge; a SMALLER one stays wholly inside it (zoomed out, nothing hides under the buttons — Aowu 2026-11-15)
  const axis = (c, lo, hi, view) => { const size = hi - lo, m = 0.15; return size > view ? clamp(c, lo + view * m, hi - view * m) : clamp(c, hi - view / 2, lo + view / 2); };
  function clampCam(){ const B = V.isoBounds(); V.cam.x = axis(V.cam.x, B.x0, B.x1, V.uw / V.zoom); V.cam.y = axis(V.cam.y, B.y0, B.y1, V.uh / V.zoom); }
  V.clampCam = clampCam;
  // zoom toward a screen point: the iso point under the finger stays under the finger
  V.zoomAt = (z, px, py) => { V._snapTo = 0; V._fitZ = 0; const qx = (px - V.cx) / V.zoom + V.cam.x, qy = (py - V.cy) / V.zoom + V.cam.y; V.zoom = clamp(z, V.min, V.max);
    V.cam.x = qx - (px - V.cx) / V.zoom; V.cam.y = qy - (py - V.cy) / V.zoom; clampCam(); V.moving = true; V.lastMove = now(); };
  V.tick = dt => {   // camera motion: inertia, follow, shake (called by Iso.frame)
    if(!V._ptr.size && (Math.abs(V.vel.x) > 0.02 || Math.abs(V.vel.y) > 0.02)){ V.cam.x -= V.vel.x * dt * 60 / V.zoom; V.cam.y -= V.vel.y * dt * 60 / V.zoom; const f = Math.pow(0.88, dt * 60); V.vel.x *= f; V.vel.y *= f; clampCam(); V.moving = true; V.lastMove = now(); }
    if(V.followObj){ const o2 = V.followObj, tx = (o2.x - o2.y) * TW / 2, ty = (o2.x + o2.y) * TH / 2 - (o2.z || 0) * HZ, k = 1 - Math.pow(0.0015, dt); V.cam.x += (tx - V.cam.x) * k; V.cam.y += (ty - V.cam.y) * k; clampCam(); }
    if(V.shakeA > 0.2){ shx = (Math.random() - 0.5) * V.shakeA; shy = (Math.random() - 0.5) * V.shakeA; V.shakeA *= Math.pow(0.0008, dt); } else { shx = shy = 0; V.shakeA = 0; }
    if(V.moving && now() - V.lastMove > 180 && !V._ptr.size){ V.moving = false; if(V.snap) V._snapTo = snapZoom(V); }
    if(V._snapTo && !V._ptr.size){ const zt = V._snapTo, z = V.zoom + (zt - V.zoom) * (1 - Math.pow(0.0005, dt)); const px = V.cx, py = V.cy;
      const qx = (px - V.cx) / V.zoom + V.cam.x, qy = (py - V.cy) / V.zoom + V.cam.y; V.zoom = Math.abs(z - zt) < 0.002 ? zt : z; V.cam.x = qx; V.cam.y = qy; clampCam();
      if(V.zoom === zt) V._snapTo = 0; }
  };
  // 👆 input — drag pans, pinch / wheel zooms toward the finger, a short tap → onTap(cell)
  if(hasDoc && cv.addEventListener){
    cv.style.touchAction = 'none';
    const pos = e => { const r = cv.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
    const startPinch = () => { const [a, b] = [...V._ptr.values()], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;   // the fingers' first spread + the iso point between them
      V._pinch = {d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), z: V.zoom, qx: (mx - V.cx) / V.zoom + V.cam.x, qy: (my - V.cy) / V.zoom + V.cam.y}; };
    cv.addEventListener('pointerdown', e => { const p = pos(e); V._ptr.set(e.pointerId, p); try{ cv.setPointerCapture(e.pointerId); }catch(_){ }
      if(V._ptr.size === 1) V._down = {x: p.x, y: p.y, t: now(), moved: false}; V.vel.x = V.vel.y = 0; V._pinch = null; if(V._ptr.size === 2) startPinch(); });
    cv.addEventListener('pointermove', e => { if(!V._ptr.has(e.pointerId)) return; const p = pos(e), prev = V._ptr.get(e.pointerId); V._ptr.set(e.pointerId, p);
      if(V._ptr.size === 2){ const [a, b] = [...V._ptr.values()], d = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        // anchored pinch: the iso point under the fingers when the pinch began stays under the fingers (zoom = start × spread)
        if(!V._pinch) startPinch(); else { const P0 = V._pinch; V._snapTo = 0; V._fitZ = 0; V.zoom = clamp(P0.z * d / P0.d, V.min, V.max); V.cam.x = P0.qx - (mx - V.cx) / V.zoom; V.cam.y = P0.qy - (my - V.cy) / V.zoom; clampCam(); V.moving = true; V.lastMove = now(); V.followObj = null; }
        if(V._down) V._down.moved = true; return; }
      if(!V.pan) return; const dx = p.x - prev.x, dy = p.y - prev.y;
      if(V._down && Math.hypot(p.x - V._down.x, p.y - V._down.y) > 8) V._down.moved = true;
      if(V._down && V._down.moved){ V.cam.x -= dx / V.zoom; V.cam.y -= dy / V.zoom; clampCam(); V.vel.x = dx * 0.6 + V.vel.x * 0.4; V.vel.y = dy * 0.6 + V.vel.y * 0.4; V.moving = true; V.lastMove = now(); V.followObj = null; } });
    const up = e => { const p = V._ptr.get(e.pointerId); V._ptr.delete(e.pointerId); if(V._ptr.size < 2) V._pinch = null;
      if(V._down && !V._down.moved && p && V._ptr.size === 0 && now() - V._down.t < 450 && V.onTap){ V.vel.x = V.vel.y = 0; V.onTap(V.hit(p.x, p.y), p.x, p.y, e); }
      if(V._ptr.size === 0) V._down = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); const p = pos(e), f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0016)); V.zoomAt(V.zoom * f, p.x, p.y); }, {passive: false});
    if(typeof ResizeObserver !== 'undefined'){ const ro = new ResizeObserver(() => { V.resize(); }); ro.observe(cv); V._ro = ro; }
  }
  V.resize(); V.fit();
  return V;
}

/* ---------- 🖼️ picture cache (sprites + avatars), baked per zoom step ---------- */
const PICS = new Map(), BAKE_LOG = []; let PIC_HITS = 0, PIC_MISS = 0, BAKES = 0, BAKE_CAP = Infinity;
function snapZoom(V){ const z = V.zoom * V.dpr; let best = 0, bd = 1e9; for(const st of STEPS){ const zz = st / V.dpr; if(zz < V.min - 1e-6 || zz > V.max + 1e-6 || (V._fitZ && zz > V._fitZ + 1e-6)) continue; const d = Math.abs(Math.log(z / st)); if(d < bd){ bd = d; best = zz; } } return best && bd < 0.35 ? best : 0; }
function stepFor(z){ for(let i = 0; i < STEPS.length; i++) if(STEPS[i] >= z - 1e-6) return STEPS[i]; return STEPS[STEPS.length - 1]; }
function trimPics(){ const cap = BUDGET.pics; if(PICS.size <= cap) return; let n = PICS.size - Math.round(cap * 0.85); for(const k of PICS.keys()){ PICS.delete(k); if(--n <= 0) break; } }
// a picture: {key, w, h, ax, ay, bake(s) → canvas at scale s (cached; c._s = its scale, c._pad = padding)}
function sprite(key, w, h, paint, o){
  o = o || {}; const id = 's:' + key; let P = PICS.get(id); if(P){ PICS.delete(id); PICS.set(id, P); return P; }   // touch = keep it (LRU)
  P = {key: id, w, h, ax: o.ax == null ? w / 2 : o.ax, ay: o.ay == null ? h : o.ay, paint, outline: o.outline, shadow: o.shadow, by: new Map()};
  P.bake = (s, lazy) => { let c = P.by.get(s); if(c){ PIC_HITS++; return c; }
    if(lazy && BAKES >= BAKE_CAP){ for(const c2 of P.by.values()) return c2; return null; }   // over this frame's bake budget → any size we already have
    PIC_MISS++; BAKES++; BAKE_LOG.push(P.key.slice(0, 40)); if(BAKE_LOG.length > 20) BAKE_LOG.shift();
    const pad = 3, cw = (P.w + pad * 2) * s, ch = (P.h + pad * 2) * s; c = canvas(cw, ch); if(!c) return null; const g = c.getContext('2d');
    if(P.shadow){ g.fillStyle = 'rgba(30,20,10,.22)'; g.beginPath(); g.ellipse((P.ax + pad) * s, (P.ay + pad) * s - 1 * s, P.shadow * s, P.shadow * 0.42 * s, 0, 0, TAU); g.fill(); }
    if(P.outline){ const t = canvas(cw, ch), tg = t.getContext('2d'); tg.translate(pad * s, pad * s); tg.scale(s, s); P.paint(tg, P.w, P.h);
      const o2 = canvas(cw, ch), og = o2.getContext('2d'); og.drawImage(t, 0, 0); og.globalCompositeOperation = 'source-in'; og.fillStyle = P.outline; og.fillRect(0, 0, cw, ch);
      const r = Math.max(1, 1.1 * s); for(const [dx, dy] of [[-r, 0], [r, 0], [0, -r], [0, r]]) g.drawImage(o2, dx, dy); g.drawImage(t, 0, 0); }
    else { g.save(); g.translate(pad * s, pad * s); g.scale(s, s); P.paint(g, P.w, P.h); g.restore(); }
    c._pad = pad; c._s = s; P.by.set(s, c); if(P.by.size > 2){ const first = P.by.keys().next().value; if(first !== s) P.by.delete(first); } return c; };
  PICS.set(id, P); trimPics(); return P;
}
// 🧑 AvatarKit avatars → pictures (measured once, so every avatar fills the same height)
const AV_BOX = new Map(), WALK = 2 * Math.PI / 11, WALK_N = 8;   // AvatarKit walk = sin(walkT × 11) → one step cycle = 2π / 11 s, 8 pictures
function avKey(who){ return JSON.stringify(who.av || {}); }   // the look only — two friends with the same look share pictures
function measureAvatar(who, k0, paintFn){
  const c = canvas(420, 420); if(!c) return {x: -40, y: -110, w: 80, h: 120}; const g = c.getContext('2d'); paintFn(g, 210, 300, 1);
  let x0 = 420, y0 = 420, x1 = 0, y1 = 0; try{ const d = g.getImageData(0, 0, 420, 420).data; for(let y = 0; y < 420; y += 2) for(let x = 0; x < 420; x += 2){ if(d[(y * 420 + x) * 4 + 3] > 24){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; } } }catch(e){ x0 = 170; x1 = 250; y0 = 190; y1 = 300; }
  if(x1 <= x0){ x0 = 170; x1 = 250; y0 = 190; y1 = 300; }
  return {x: x0 - 210 - 2, y: y0 - 300 - 2, w: x1 - x0 + 4, h: Math.max(1, Math.max(y1, 300) - y0 + 4)};
}
function avatar(who, o){
  o = o || {}; const pose = o.pose || 'walk', f = o.f | 0, size = o.size || 1, key = 'a:' + avKey(who) + ':' + pose + ':' + f + ':' + size;
  let P = PICS.get(key); if(P) return P;
  const hasAK = typeof drawAvatar === 'function', hasAct = typeof Acting !== 'undefined' && Acting.has && Acting.has('acts', pose);
  const paintAt = (g, x, feet, k, ff) => { if(!hasAK){ g.fillStyle = '#7B4FE0'; g.beginPath(); g.arc(x, feet - 40 * k, 18 * k, 0, TAU); g.fill(); g.fillRect(x - 12 * k, feet - 26 * k, 24 * k, 26 * k); return; }
    const w2 = {name: who.name, av: who.av, dir: 1, walkT: pose === 'walk' ? 0.0001 + (ff % WALK_N) / WALK_N * WALK : 0};
    if(hasAct){ try{ Acting.draw(g, w2, x, feet, k, pose, {t: ff / 6 * 1.2}); return; }catch(e){} }
    drawAvatar(g, w2, x, feet, k, {t: 0, still: true}); };
  const bk = avKey(who) + ':' + (hasAct ? pose : 'body'); let box = AV_BOX.get(bk);
  if(!box){ box = measureAvatar(who, 1, (g, x, y, k) => paintAt(g, x, y, k, 0)); if(pose === 'walk'){ const b2 = measureAvatar(who, 1, (g, x, y, k) => paintAt(g, x, y, k, 2)); const x0 = Math.min(box.x, b2.x), y0 = Math.min(box.y, b2.y); box = {x: x0, y: y0, w: Math.max(box.x + box.w, b2.x + b2.w) - x0, h: Math.max(box.y + box.h, b2.y + b2.h) - y0}; } AV_BOX.set(bk, box); }
  const H = 80 * size, sc = H / box.h, W = box.w * sc;
  P = sprite('av:' + key, W, H, g => paintAt(g, -box.x * sc, -box.y * sc, sc, f), {ax: -box.x * sc, ay: -box.y * sc, outline: o.outline === false ? null : 'rgba(40,24,60,.55)', shadow: o.shadow === false ? 0 : 15 * size});
  const sk = 'set:' + avKey(who) + ':' + pose + ':' + size; let set = SIBS.get(sk); if(!set){ set = []; SIBS.set(sk, set); } set.push(P); P.sib = set;   // the other frames of this walk / act
  PICS.set(key, P); return P;
}
const SIBS = new Map();
// copy a picture at a world point; scale-aware (a picture baked at another step is stretched until the right one is baked)
function drawPic(g, V, P, x, y, z, o){
  if(!P) return false; o = o || {}; const s0 = V.zoom * V.dpr * (o.scale || 1), c = P.bake(stepFor(s0), true); if(!c) return false;
  const sc = s0 / c._s, p = V.toScreen(x, y, z || 0), pad = c._pad || 0, px = p.x * V.dpr, py = p.y * V.dpr;
  let dx = px - (P.ax + pad) * s0, dy = py - (P.ay + pad) * s0; const dw = c.width * sc, dh = c.height * sc;
  if(Math.abs(sc - 1) < 0.01){ dx = Math.round(dx); dy = Math.round(dy); }
  const al = o.alpha != null && o.alpha < 1; if(al) g.globalAlpha = Math.max(0, o.alpha);
  if(o.flip){ g.setTransform(-1, 0, 0, 1, Math.round(px) * 2, 0); g.drawImage(c, dx, dy, dw, dh); g.setTransform(1, 0, 0, 1, 0, 0); }
  else g.drawImage(c, dx, dy, dw, dh);
  if(al) g.globalAlpha = 1; return true;
}
// bake pictures a few at a time (a loading bar, or idle time) → onDone; scales = the zoom steps you need (default: this view's current one)
function warm(pics, V, o){ o = o || {}; const sc = o.scales || [stepFor(V.zoom * V.dpr)], list = []; pics.forEach(P => sc.forEach(s => list.push([P, s]))); let i = 0;
  return new Promise(res => { const run = () => { const t0 = now(); while(i < list.length && now() - t0 < (o.slice || 12)){ list[i][0].bake(list[i][1]); i++; } if(o.onProgress) o.onProgress(i / Math.max(1, list.length)); if(i < list.length) setTimeout(run, 0); else res(list.length); }; run(); }); }

/* ---------- 🖌️ one frame ---------- */
// ☁️ the sky is a CSS background behind the canvas (free every frame); set once per theme
function skyCss(V){ const T = THEMES[V.map.theme] || THEMES.meadow, bg = V.bg || T.bg, key = bg.join(); if(V._sky === key || !V.cv.style) return; V._sky = key;
  V.cv.style.background = 'radial-gradient(ellipse 30% 9% at 22% 14%, rgba(255,255,255,.55), transparent 70%), radial-gradient(ellipse 24% 7% at 74% 9%, rgba(255,255,255,.45), transparent 70%), linear-gradient(' + bg[0] + ', ' + bg[1] + ')'; }
function frame(V, o){
  o = o || {}; const t0 = now(), M = V.map, g = V.g, dt = Math.min(0.05, (t0 - (V._last || t0)) / 1000); V._last = t0; V.tick(dt);
  if(M.dirty.size){ if(M.dirty.has('*')){ V.chunks.clear(); V.chunkAny.clear(); } else M.dirty.forEach(k => { for(const key of [...V.chunks.keys()]) if(key.endsWith('|' + k)) V.chunks.delete(key); V.chunkAny.delete(k); }); M.dirty.clear(); V._liquid = null; }
  // 🔍 zoom step: keep the current step while the camera moves (stretched), re-bake crisp once it settles
  const want = stepFor(V.zoom * V.dpr); if(!V.moving || !V.step || want / V.step > 2.01 || want / V.step < 0.49) V.step = want; const s = V.step;
  const held = V._ptr.size > 0; BAKES = 0; BAKE_CAP = V._warmed ? (held ? 0 : V.moving ? 1 : 3) : Infinity;   // fingers down: stretch what we have, bake when they lift
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, V.cv.width, V.cv.height); skyCss(V);
  // soft shadow under the whole diorama (one ellipse)
  const cx = V.toScreen(M.w / 2, M.h / 2, -M.base), R = (M.w + M.h) / 2 * TW / 2 * V.zoom * V.dpr;
  g.fillStyle = 'rgba(40,30,60,.07)'; g.beginPath(); g.ellipse(cx.x * V.dpr, cx.y * V.dpr + R * 0.04, R * 0.74, R * 0.27, 0, 0, TAU); g.fill();
  g.imageSmoothingEnabled = !V.moving && !V._snapTo;   // moving: nearest-pixel copies (fast); settled: smooth
  // 🧱 ground chunks on screen (back → front)
  const ncx = Math.ceil(M.w / CH), ncy = Math.ceil(M.h / CH); let chunks = 0, baked = 0;
  const vx0 = -V.cx / V.zoom + V.cam.x - TW, vx1 = (V.W - V.cx) / V.zoom + V.cam.x + TW, vy0 = -V.cy / V.zoom + V.cam.y - TH * 2 - (M.maxH + M.base) * HZ, vy1 = (V.H - V.cy) / V.zoom + V.cam.y + TH * 2 + M.maxH * HZ;
  V._vis = [vx0, vx1, vy0, vy1];
  for(let d = 0; d <= ncx + ncy - 2; d++) for(let ci = 0; ci < ncx; ci++){ const cj = d - ci; if(cj < 0 || cj >= ncy) continue;
    const i0 = ci * CH, j0 = cj * CH, i1 = Math.min(M.w, i0 + CH), j1 = Math.min(M.h, j0 + CH);
    const bx0 = (i0 - j1) * TW / 2, bx1 = (i1 - j0) * TW / 2, by0 = (i0 + j0) * TH / 2 - (M.maxH + 1) * HZ, by1 = (i1 + j1) * TH / 2 + (M.base + M.maxH) * HZ;
    if(bx1 < vx0 || bx0 > vx1 || by1 < vy0 || by0 > vy1) continue;
    const ck = ci + ',' + cj, key = s + ':' + BAKE_VER + ':' + M.id + '|' + ck; let C = V.chunks.get(key);
    if(!C){ const old = V.chunkAny.get(ck); if(old && old.ver === BAKE_VER && baked >= (V._warmed ? (held ? 0 : V.moving ? 1 : 2) : 999)) C = old;   // keep the stretched old one this frame
      else { C = bakeChunk(M, ci, cj, s); if(!C) continue; C.ver = BAKE_VER; V.chunks.set(key, C); V.chunkAny.set(ck, C); V._px += C.px; baked++; } }
    const k2 = V.zoom * V.dpr / C.s; let dx = ((C.ox - V.cam.x) * V.zoom + V.cx + V._sx()) * V.dpr, dy = ((C.oy - V.cam.y) * V.zoom + V.cy + V._sy()) * V.dpr;
    if(Math.abs(k2 - 1) < 0.01){ dx = Math.round(dx); dy = Math.round(dy); }
    g.drawImage(C.c, dx, dy, C.c.width * k2, C.c.height * k2); chunks++; }
  V._warmed = true; const tG = now();
  if(V._px > BUDGET.chunkPx){ for(const [k, C] of [...V.chunks]){ if(V._px <= BUDGET.chunkPx * 0.75) break; if(!k.startsWith(s + ':')){ V.chunks.delete(k); V._px -= C.px; } } }   // 🧹 pixel budget: other zoom steps go first
  const T = (o.t != null ? o.t : t0 / 1000);
  if(o.shimmer !== false && BUDGET.shimmer) shimmer(V, T, vx0, vx1, vy0, vy1);   // 💧 live shimmer on liquid cells (budget)
  g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  if(o.groundFx) o.groundFx(g, V, T);
  // 🧍 items: keep the caller's array sorted (insertion sort — it barely changes between frames), cull, draw, then redraw a higher cliff in front of it
  const items = o.items || [], n = items.length; let drawn = 0, cliffs = 0;
  for(let a = 1; a < n; a++){ const it = items[a], dk = depthOf(it); let b = a - 1; while(b >= 0 && depthOf(items[b]) > dk){ items[b + 1] = items[b]; b--; } items[b + 1] = it; }
  g.setTransform(1, 0, 0, 1, 0, 0); const occl = o.occlude !== false && M.maxH > 0;
  for(let a = 0; a < n; a++){ const it = items[a]; if(it.hidden) continue; const z = it.z || 0, p = V.toScreen(it.x, it.y, z);
    if(p.x < -140 || p.x > V.W + 140 || p.y < -60 || p.y > V.H + 220) continue;
    if(it.pic) drawPic(g, V, it.pic, it.x, it.y, z, it);
    if(it.draw){ g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0); it.draw(g, p.x, p.y, V.zoom, V, T); g.setTransform(1, 0, 0, 1, 0, 0); }
    if(occl) cliffs += frontCliffs(g, V, it, z, items, a);
    drawn++; }
  g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  if(o.airFx) o.airFx(g, V, T);
  if(o.overlay) o.overlay(g, V, T);
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = true;
  // 🔥 settled on a zoom step: bake the other frames of every drawn walker now (≤ 2 ms a frame), so no frame bakes later when it first shows
  const wk = s + ':' + n; if(!V.moving && !V._snapTo && V._warmFor !== wk){ const tw = now(); let done = true;
    for(let a = 0; a < n && done; a++){ const sib = items[a].pic && items[a].pic.sib; if(!sib) continue; const st = stepFor(V.zoom * V.dpr);
      for(let q = 0; q < sib.length; q++) if(!sib[q].by.has(st)){ if(now() - tw > 2){ done = false; break; } sib[q].bake(st); } }
    if(done) V._warmFor = wk; }
  const ms = now() - t0; BUDGET._note(ms);
  V.stats = {ms, msGround: tG - t0, msItems: now() - tG, chunks, baked, drawn, items: n, step: s, cliffs, bakes: BAKES, picHits: PIC_HITS, picMiss: PIC_MISS, pics: PICS.size, chunkMB: Math.round(V._px * 4 / 1e6), level: BUDGET.level};
  return V.stats;
}
const depthOf = it => it.depth != null ? it.depth : it.x + it.y + (it.z || 0) * 0.01;
// ⛰️ a unit behind a higher cell: redraw that cell (its own small baked picture) over the unit — walking behind hills looks right
function cellPic(M, i, j){ const k = j * M.w + i, h = M.hgt[k], id = 'cell:' + M.id + ':' + M.theme + ':' + i + ',' + j + ':' + M.ver;
  return sprite(id, TW + 2, TH + (h + M.base + 1) * HZ + 2, (g) => paintCell(g, M, i, j, TW / 2 + 1, 1, 1), {ax: TW / 2 + 1, ay: TH / 2 + 1}); }
function frontCliffs(g, V, it, z, items, a){
  const M = V.map, i = Math.floor(it.x), j = Math.floor(it.y); let n = 0;
  for(let q = 0; q < 6; q++){ const ci = i + [1, 0, 1, 2, 1, 2][q], cj = j + [0, 1, 1, 1, 2, 2][q]; if(!M.inside(ci, cj)) continue; const h = M.hgt[cj * M.w + ci];
    if(h <= z + 0.05 || (h - z) * HZ <= ((ci + cj) - (it.x + it.y)) * TH / 2) continue;   // too low to hide anything
    drawPic(g, V, cellPic(M, ci, cj), ci + 0.5, cj + 0.5, h); n++;
    // anything standing on that cell (drawn before) must come back on top
    for(let b = 0; b < a; b++){ const o2 = items[b]; if(Math.floor(o2.x) === ci && Math.floor(o2.y) === cj && (o2.z || 0) >= h - 0.05 && o2.pic) drawPic(g, V, o2.pic, o2.x, o2.y, o2.z || 0, o2); } }
  return n;
}
function shimmer(V, T, vx0, vx1, vy0, vy1){
  const M = V.map, g = V.g, k = V.zoom * V.dpr; let n = 0;
  if(!V._liquid){ V._liquid = []; for(let j = 0; j < M.h; j++) for(let i = 0; i < M.w; i++){ const P = BASE_THEME[TILES[M.t[j * M.w + i]]]; if(P && P.liquid) V._liquid.push(i, j); } }
  const L = V._liquid; if(!L.length) return; g.setTransform(1, 0, 0, 1, 0, 0); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = Math.max(1, 1.3 * k); g.lineCap = 'round'; g.beginPath();
  for(let q = 0; q < L.length; q += 2){ const i = L[q], j = L[q + 1], h = M.hgt[j * M.w + i], top = cellTop(i, j, h);
    if(top.x < vx0 || top.x > vx1 || top.y < vy0 || top.y > vy1) continue; const ph = Math.sin(T * 2.2 + i * 1.7 + j * 2.3); if(ph < 0.55) continue;
    const p = V.toScreen(i + 0.5, j + 0.5, h), w = 7 * k * (ph - 0.5) * 2, oy = (hash2(i, j, 5) - 0.5) * 8 * k; g.moveTo(p.x * V.dpr - w, p.y * V.dpr + oy); g.lineTo(p.x * V.dpr + w, p.y * V.dpr + oy); if(++n > 500) break; }
  g.stroke();
}

/* ---------- 🧭 paths (A*), worker for big maps ---------- */
function astar(w, h, block, hgt, cost, ax, ay, bx, by, diag, climb){
  const n = w * h, G = new Float32Array(n).fill(Infinity), F = new Float32Array(n), P = new Int32Array(n).fill(-1), C = new Uint8Array(n), heap = [];
  let cmin = 1; for(let k = 0; k < n; k++) if(cost[k] < cmin && !block[k]) cmin = cost[k];   // cheapest cell → the estimate never over-guesses (roads stay attractive)
  const H = (i, j) => { const dx = Math.abs(i - bx), dy = Math.abs(j - by); return cmin * (diag ? (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy) : dx + dy); };
  const push = k => { heap.push(k); let c = heap.length - 1; while(c > 0){ const p = (c - 1) >> 1; if(F[heap[p]] <= F[heap[c]]) break; const t = heap[p]; heap[p] = heap[c]; heap[c] = t; c = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if(heap.length){ heap[0] = last; let c = 0; for(;;){ const l = c * 2 + 1, r = l + 1; let m = c; if(l < heap.length && F[heap[l]] < F[heap[m]]) m = l; if(r < heap.length && F[heap[r]] < F[heap[m]]) m = r; if(m === c) break; const t = heap[m]; heap[m] = heap[c]; heap[c] = t; c = m; } } return top; };
  if(ax < 0 || ay < 0 || ax >= w || ay >= h || bx < 0 || by < 0 || bx >= w || by >= h || block[by * w + bx]) return null;
  const s = ay * w + ax, goal = by * w + bx; G[s] = 0; F[s] = H(ax, ay); push(s);
  const N8 = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]], lim = diag ? 8 : 4;
  while(heap.length){ const k = pop(); if(k === goal) break; if(C[k]) continue; C[k] = 1; const i = k % w, j = (k / w) | 0;
    for(let q = 0; q < lim; q++){ const ni = i + N8[q][0], nj = j + N8[q][1]; if(ni < 0 || nj < 0 || ni >= w || nj >= h) continue; const nk = nj * w + ni; if(block[nk] || C[nk]) continue;
      if(Math.abs(hgt[nk] - hgt[k]) > climb) continue; if(q >= 4 && (block[j * w + ni] || block[nj * w + i])) continue;   // no corner cutting
      const g2 = G[k] + N8[q][2] * cost[nk]; if(g2 < G[nk]){ G[nk] = g2; F[nk] = g2 + H(ni, nj); P[nk] = k; push(nk); } } }
  if(P[goal] < 0 && goal !== s) return null; const out = []; for(let k = goal; k >= 0; k = P[k]){ out.push(k); if(k === s) break; } out.reverse(); return out;
}
function toPts(w, ks){ return ks ? ks.map(k => ({x: k % w + 0.5, y: ((k / w) | 0) + 0.5})) : null; }
function path(M, a, b, o){ o = o || {}; return toPts(M.w, astar(M.w, M.h, M.block, M.hgt, M.cost, Math.floor(a.x), Math.floor(a.y), Math.floor(b.x), Math.floor(b.y), o.diag !== false, o.climb == null ? 1 : o.climb)); }
let WORKER = null, WREQ = 0; const WCB = new Map(), WMAP = {};
function worker(){ if(WORKER !== null) return WORKER; WORKER = false; if(typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') return false;
  try{ const src = 'const maps = {};' + astar.toString() + 'onmessage = e => { const d = e.data; if(d.map){ maps[d.map.id] = d.map; return; } const m = maps[d.id]; postMessage({q: d.q, r: m ? astar(m.w, m.h, m.block, m.hgt, m.cost, d.ax, d.ay, d.bx, d.by, d.diag, d.climb) : null}); };';
    WORKER = new Worker(URL.createObjectURL(new Blob([src], {type: 'text/javascript'}))); WORKER.onmessage = e => { const cb = WCB.get(e.data.q); WCB.delete(e.data.q); if(cb) cb(e.data.r); };
    WORKER.onerror = () => { WORKER = false; WCB.forEach(cb => cb(undefined)); WCB.clear(); }; }catch(e){ WORKER = false; } return WORKER; }
function pathAsync(M, a, b, o){ o = o || {}; const big = o.force || M.w * M.h > 48 * 48, W = big && worker();
  if(!W) return Promise.resolve(path(M, a, b, o));
  if(WMAP[M.id] !== M.ver){ W.postMessage({map: {id: M.id, w: M.w, h: M.h, block: M.block, hgt: M.hgt, cost: M.cost}}); WMAP[M.id] = M.ver; }
  return new Promise(res => { const q = ++WREQ; WCB.set(q, r => res(r === undefined ? path(M, a, b, o) : toPts(M.w, r)));
    W.postMessage({q, id: M.id, ax: Math.floor(a.x), ay: Math.floor(a.y), bx: Math.floor(b.x), by: Math.floor(b.y), diag: o.diag !== false, climb: o.climb == null ? 1 : o.climb}); }); }

/* ---------- 📍 spatial grid + ♻️ pools ---------- */
function grid(cell){ cell = cell || 2; const G = {cell, m: new Map(), clear(){ G.m.forEach(a => a.length = 0); }, add(o){ const k = Math.floor(o.x / cell) + ',' + Math.floor(o.y / cell); let a = G.m.get(k); if(!a){ a = []; G.m.set(k, a); } a.push(o); },
  near(x, y, r, out){ out = out || []; out.length = 0; const i0 = Math.floor((x - r) / cell), i1 = Math.floor((x + r) / cell), j0 = Math.floor((y - r) / cell), j1 = Math.floor((y + r) / cell), r2 = r * r;
    for(let j = j0; j <= j1; j++) for(let i = i0; i <= i1; i++){ const a = G.m.get(i + ',' + j); if(!a) continue; for(let q = 0; q < a.length; q++){ const o = a[q], dx = o.x - x, dy = o.y - y; if(dx * dx + dy * dy <= r2) out.push(o); } } return out; }}; return G; }
function pool(make){ const P = {_free: [], live: [], made: 0, get(){ const o = P._free.pop() || (P.made++, make()); P.live.push(o); return o; }, free(o){ const i = P.live.indexOf(o); if(i >= 0){ P.live[i] = P.live[P.live.length - 1]; P.live.pop(); P._free.push(o); } },
  each(fn){ for(let i = P.live.length - 1; i >= 0; i--){ const o = P.live[i]; if(fn(o) === false){ P.live[i] = P.live[P.live.length - 1]; P.live.pop(); P._free.push(o); } } }}; return P; }

/* ---------- ⏱️ loop + quality budget ---------- */
const isPhone = hasDoc && typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 700;
const BUDGET = {chunkPx: isPhone ? 12e6 : 28e6, pics: isPhone ? 900 : 2600, level: 0, fx: 1, shimmer: true, fps: isPhone ? 30 : 60, dprCap: isPhone ? 2 : 3, units: isPhone ? 60 : 200, ms: 0, avg: 8, _slow: 0, _fast: 0,
  _note(ms){ this.ms = ms; this.avg = this.avg * 0.92 + ms * 0.08; const lim = this.fps === 30 ? 26 : 13; if(this.avg > lim){ this._slow++; this._fast = 0; } else if(this.avg < lim * 0.5){ this._fast++; this._slow = 0; } else { this._slow = Math.max(0, this._slow - 1); }
    if(this._slow > 90 && this.level < 4){ this.set(this.level + 1); this._slow = 0; } else if(this._fast > 300 && this.level > 0 && !this.locked){ this.set(this.level - 1); this._fast = 0; } },
  set(l){ this.level = clamp(l, 0, 4); this.fx = [1, 0.7, 0.5, 0.45, 0.4][this.level]; this.shimmer = this.level < 2; this.fps = this.level >= 3 || isPhone ? 30 : 60; this.dprCap = this.level >= 4 ? 1.5 : isPhone ? 2 : 3; }};
function loop(o){
  let raf = 0, acc = 0, last = now(), stopped = false, skip = false; const step = 1 / (o.hz || 30), t0 = last;
  const tick = () => { if(stopped) return; raf = requestAnimationFrame(tick); const t = now(), dt = Math.min(0.25, (t - last) / 1000);
    if(BUDGET.fps === 30){ skip = !skip; if(skip) return; } last = t; acc += dt; let n = 0; while(acc >= step && n < 5){ if(o.update) o.update(step); acc -= step; n++; } if(n >= 5) acc = 0;
    if(o.idle && o.idle()) return; if(o.render) o.render(acc / step, (t - t0) / 1000); };
  raf = requestAnimationFrame(tick); return {stop(){ stopped = true; cancelAnimationFrame(raf); }}; }

/* ---------- 🗺️ minimap ---------- */
function minimap(cv, M, V, o){
  o = o || {}; const g = cv.getContext('2d'); let pic = null, ver = -1, a = 1, ox = 0, oy = 0, W = 0, H = 0;
  const P = (x, y) => ({x: ox + (x - y) * a, y: oy + (x + y) * a / 2});
  const MM = {P, draw(){ if(cv.width !== W || cv.height !== H || !pic || ver !== M.ver){ W = cv.width; H = cv.height;
        a = Math.min(W / (M.w + M.h), 2 * H / (M.w + M.h)) * 0.94; ox = W / 2 - (M.w - M.h) * a / 2; oy = (H - (M.w + M.h) * a / 2) / 2;
        pic = canvas(W, H); const pg = pic.getContext('2d');
        for(let j = 0; j < M.h; j++) for(let i = 0; i < M.w; i++){ const k = j * M.w + i, P0 = themeTile(M.theme, M.t[k]), p = P(i, j), q = P(i + 1, j), r = P(i + 1, j + 1), l = P(i, j + 1);
          pg.fillStyle = M.hgt[k] ? shade(P0.top, 0.08 * M.hgt[k]) : P0.top; pg.beginPath(); pg.moveTo(p.x, p.y); pg.lineTo(q.x, q.y); pg.lineTo(r.x, r.y); pg.lineTo(l.x, l.y); pg.closePath(); pg.fill(); }
        ver = M.ver; }
      g.clearRect(0, 0, W, H); g.drawImage(pic, 0, 0);
      const dots = o.dots ? o.dots() : []; for(let q = 0; q < dots.length; q++){ const d = dots[q], p = P(d.x, d.y); g.fillStyle = d.c || '#FF5C9A'; g.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
      g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = Math.max(1.5, W / 120); g.beginPath();
      [[0, 0], [V.W, 0], [V.W, V.H], [0, V.H]].forEach(([x, y], q) => { const w = V.toWorld(x, y), p = P(w.x, w.y); if(q) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); }); g.closePath(); g.stroke(); }};
  // tap / drag on the minimap = move the camera there
  if(hasDoc && cv.addEventListener){ cv.style.touchAction = 'none'; let down = false;
    const go = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height, dx = (x - ox) / a, dy = (y - oy) / (a / 2);
      V.followObj = null; V.vel.x = V.vel.y = 0; V.centerOn((dx + dy) / 2, (dy - dx) / 2); V.moving = true; V.lastMove = now(); };
    cv.addEventListener('pointerdown', e => { down = true; try{ cv.setPointerCapture(e.pointerId); }catch(_){ } go(e); e.stopPropagation(); });
    cv.addEventListener('pointermove', e => { if(down) go(e); }); cv.addEventListener('pointerup', () => { down = false; }); cv.addEventListener('pointercancel', () => { down = false; }); }
  return MM;
}

const Iso = {TW, TH, HZ, CH, STEPS, TILES, THEMES, TID, map: makeMap, view: makeView, frame, sprite, avatar, drawPic, warm, WALK_N, path, pathAsync, grid, pool, loop, minimap, addTheme,
  budget: BUDGET, phone: isPhone, workerOn: () => !!WORKER, stepFor, cellTop, _astar: astar, _bakeChunk: bakeChunk, _pics: PICS, _bakeLog: BAKE_LOG, version: 'iso-1b'};
if(typeof window !== 'undefined') window.Iso = Iso; else if(typeof globalThis !== 'undefined') globalThis.Iso = Iso;
})();
