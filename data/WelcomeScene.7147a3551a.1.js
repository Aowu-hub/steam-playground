
/* ================= 🏝️ WelcomeScene — the floating island of the 🚀 Welcome Show (b6e, 🧱 Baseline chat, 2026-11-20) =================
   Plan: Drive "STEAM Motto — plan.md" §9 (b6e-p as drawn) + §11 (b6e as built). Loaded ONLY for the full daily show:
   online it comes from the site on demand (Code.gs INCLUDE_LAZY_ WelcomeShow → WelcomeShow.sources), together with IsoKit +
   IsoProps + ONE IsoLook; the 📲 offline app + the tests have it inline. ONE <script> block, no <style> (a lazy file = one part).
   The show itself (timing · skip · moods · special days · logo landing · motto · bar · curtains) lives in WelcomeShow.html.

   API  sc = WelcomeScene.build(canvas, {W, H, pad: {t, b, l, r}, mood: {look, theme, night}, seed})   → the island, built once
        sc.cast(crew, t)          crew = [{name, av}] (≤ 5) → they walk out of their doors to the plaza (from show time t on)
        sc.warm(onProgress) → Promise   bakes ground + props + every avatar frame in 12 ms slices (behind the first 0.3 s)
        sc.frame(t, B)            draws the island at show time t · B = beats {at (island start), cheer, done, exit}
        sc.resize(W, H, pad)      a new screen size (re-fit on a baked zoom step)
        sc.items · sc.view · sc.walkers · sc.LOG                                        (tests + pictures)
   Rules kept: the island zoom is always a baked IsoKit step (never in-between) · one IsoProps look · avatars from Iso.avatar (cached
   pictures, never painted live) · FX Bible F11: nothing is drawn on a face (door glows sit on the doors, not on the walkers). */
(function(){
'use strict';
if(window.WelcomeScene) return;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, f) => a + (b - a) * f;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const sine = x => 0.5 - Math.cos(Math.PI * x) / 2;
const N = 20, C = (N - 1) / 2, RAD = 8.6, SIZE = 0.9;
const SPOTS = [[0.25, 0.85], [-0.9, 0.4], [0.95, -0.15], [-0.25, -0.75], [-1.1, -0.6]];   // where each walker stands on the plaza (the 1st = the hero, in front)
const WALK = 1.05, STAGGER = 0.09, ZSTEPS = [0.25, 0.33, 0.5, 0.75, 1, 1.5, 2, 3, 4];
const LOG = [];

function build(cv, o){
  o = o || {}; const M = o.mood || {}, t0 = performance.now();
  const m = Iso.map({w: N, h: N, theme: M.theme || 'storybook', seed: o.seed || 7, cell: (i, j) => {
    const d = Math.hypot(i - C, (j - C) * 1.08) + Math.sin(i * 1.7 + j * 0.9) * 0.5;
    if(d > RAD) return {t: 'void'};
    return {t: d > RAD - 0.9 ? 'sand' : 'grass', h: 0, fade: d > RAD - 0.5 ? 0.5 : undefined};
  }});
  const T = Props.town(m, {size: 'hamlet', seed: 5, look: M.look || 'cherry', roads: 'auto', area: {i: 3, j: 3, w: 14, d: 14}, trees: 1});
  const sc = {m, T, cv, night: !!M.night, walkers: [], items: T.items.slice(), doors: T.doors.slice(), LOG, look: M.look, theme: M.theme};
  sc.view = Iso.view(cv, m, {bg: 'none', pan: false, snap: true, shadow: true, pad: o.pad || {t: 0, b: 0, l: 0, r: 0}});
  fit(sc, o.pad);
  const plaza = T.plaza || {i: C - 1, j: C - 1, w: 2, d: 2};
  sc.pc = {x: plaza.i + plaza.w / 2, y: plaza.j + plaza.d / 2};
  sc.homes = T.doors.filter(d => d.role !== 'shop'); if(!sc.homes.length) sc.homes = T.doors.slice();
  sc.cast = (crew, t) => cast(sc, crew, t);
  sc.warm = cb => warm(sc, cb);
  sc.frame = (t, B) => frame(sc, t, B);
  sc.resize = (W, H, pad) => { sc.view.resize && sc.view.resize(); fit(sc, pad); };
  sc.buildMs = performance.now() - t0;
  LOG.push({k: 'build', ms: Math.round(sc.buildMs), look: M.look, theme: M.theme, doors: T.doors.length, zoom: sc.view.zoom});
  return sc;
}
// the island fills the free area between the show's words and its bar, on the biggest BAKED zoom step that fits (never an in-between zoom)
function fit(sc, pad){
  const v = sc.view; if(pad && v.setPad) v.setPad(pad);
  v.fit(); let best = v.zoom; const P = pad || {}, wide = Math.max(v.uw * 1.02, v.uw + 2 * Math.min(P.l || 0, P.r || 0));   // the sandy rim may use the side margins (the same on both sides), never off the screen
  for(const st of ZSTEPS){ const z = st / v.dpr; if(90.5 * RAD * z <= wide && (45.25 * RAD + 40) * z <= v.uh * 0.98) best = Math.max(best, z); }
  v.zoom = best; v.min = Math.min(v.min, best); v.centerOn(C + 0.5, C + 0.5);
  LOG.push({k: 'fit', zoom: +best.toFixed(3), uw: Math.round(v.uw), uh: Math.round(v.uh)});
}
// each walker: own door → a path to their spot on the plaza; pictures from Iso.avatar (cached, baked by warm)
function cast(sc, crew, t){
  (crew || []).slice(0, 5).forEach((who, n) => {
    if(sc.walkers.some(w => w.who.name === who.name)) return;
    const k = sc.walkers.length, d = sc.homes[k % sc.homes.length], a = {x: d.i + 0.5, y: d.j + 0.5}, goal = {x: sc.pc.x + SPOTS[k][0], y: sc.pc.y + SPOTS[k][1]};
    let P = null; try { P = Iso.path(sc.m, a, goal); } catch(e){}
    if(!P || P.length < 2) P = [a, goal];
    P[P.length - 1] = goal;
    let L = 0; const acc = [0]; for(let q = 1; q < P.length; q++){ L += Math.hypot(P[q].x - P[q - 1].x, P[q].y - P[q - 1].y); acc.push(L); }
    const w = {who: {name: who.name, av: who.av}, path: P, acc, len: L || 1, k, from: t || 0, item: {x: a.x, y: a.y, z: 0, pic: null, alpha: 0}, dir: 1};
    sc.walkers.push(w); sc.items.push(w.item);
  });
  LOG.push({k: 'cast', n: sc.walkers.length, t: +(t || 0).toFixed(2)});
}
function pics(sc, poses){ const out = [];
  sc.walkers.forEach(w => poses.forEach(p => { const n = p === 'walk' ? 8 : p === 'still' ? 1 : 6; for(let f = 0; f < n; f++) out.push(Iso.avatar(w.who, {pose: p, f, size: SIZE})); }));
  return out; }
// 🔥 bake behind the first 0.3 s: ground (one hidden frame) + props → the island may float up; the walkers' pictures keep baking
//    in 10 ms slices while it floats (walk first, then cheer + wave) — a picture not baked yet bakes itself when first drawn
function warm(sc, cb){
  const t0 = performance.now(), v = sc.view;
  return new Promise(res => setTimeout(() => {
    try { Iso.frame(v, {items: [], t: 0, shimmer: false}); } catch(e){}
    const g0 = performance.now() - t0;
    const p1 = Props.warm ? Props.warm(sc.items.filter(it => it.prop), v, {slice: 32}) : Promise.resolve();
    p1.catch(() => {}).then(() => { sc.warmMs = performance.now() - t0; LOG.push({k: 'warm', ms: Math.round(sc.warmMs), ground: Math.round(g0)}); res(sc);
      Iso.warm(pics(sc, ['walk', 'still']), v, {slice: 10}).then(() => Iso.warm(pics(sc, ['cheer', 'wave']), v, {slice: 10})).then(() => { sc.picsMs = performance.now() - t0; LOG.push({k: 'pics', ms: Math.round(sc.picsMs)}); if(cb) cb(1); }).catch(() => {}); });
  }, 0));
}
function walkerAt(sc, w, t, B){
  const start = Math.max(B.walk, w.from) + w.k * STAGGER, f = seg(t, start, start + WALK), d = sine(f) * w.len;
  let q = 1; while(q < w.acc.length - 1 && w.acc[q] < d) q++;
  const a = w.path[q - 1], b = w.path[q], u = clamp((d - w.acc[q - 1]) / Math.max(1e-6, w.acc[q] - w.acc[q - 1]), 0, 1);
  w.item.x = lerp(a.x, b.x, u); w.item.y = lerp(a.y, b.y, u);
  const moving = f > 0 && f < 1; if(moving) w.dir = (b.x - a.x) - (b.y - a.y) < 0 ? -1 : 1;
  const cheerT = t - B.cheer - w.k * 0.05;
  let pose = 'still', fr = 0;
  if(moving){ pose = 'walk'; fr = Math.floor(d * 3.2) % 8; }
  else if(f >= 1 && cheerT >= 0 && cheerT < 0.9){ pose = 'cheer'; fr = Math.min(5, Math.floor(cheerT / 0.9 * 6)); }
  else if(f >= 1 && B.done != null && t > B.done && t < B.exit && Math.floor((t - B.done) / 0.75) % 2 === (w.k % 2)){ pose = 'wave'; fr = Math.floor((t - B.done) * 8) % 6; }   // 👋 the hold stays alive: two wave, then the others
  w.item.pic = Iso.avatar(w.who, {pose, f: fr, size: SIZE});
  w.item.flip = w.dir < 0;
  w.item.alpha = f > 0 ? 1 : 0;   // still inside the house until their walk starts
  w.pose = pose;
}
// one frame of the island (B = beats on the show clock; B.still = reduce motion: everyone already on the plaza)
function frame(sc, t, B){
  const v = sc.view, lit = B.still ? 1 : seg(t, B.at + 0.45, B.at + 1.1);
  sc.walkers.forEach(w => { if(B.still){ w.item.x = w.path[w.path.length - 1].x; w.item.y = w.path[w.path.length - 1].y; w.item.pic = Iso.avatar(w.who, {pose: 'still', f: 0, size: SIZE}); w.item.alpha = 1; } else walkerAt(sc, w, t, B); });
  if(Props.tick && !B.still) Props.tick(sc.items, t);
  const t0 = performance.now();
  const st = Iso.frame(v, {items: sc.items, t, shimmer: false, overlay: (g, vv) => {
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    if(sc.night){ g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(28,18,70,0.38)'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.globalCompositeOperation = 'source-over'; }
    g.restore();
    if(lit <= 0) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    sc.doors.forEach((d, n) => { const on = clamp(lit * 1.6 - n * 0.08, 0, 1); if(on <= 0) return; const p = vv.toScreen(d.i + 0.5, d.j + 0.5, 0.6);
      const r = 24 * vv.zoom * (sc.night ? 1.25 : 1), gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      gr.addColorStop(0, 'rgba(255,214,110,' + ((sc.night ? 0.95 : 0.55) * on).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,190,80,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill(); });
    g.restore();
  }});
  sc.lastMs = performance.now() - t0;
  return st;
}
window.WelcomeScene = {build, LOG, N, RAD, SIZE, VERSION: 'b6e'};
})();
