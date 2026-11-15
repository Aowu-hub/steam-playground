
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
UI.navBar(document.getElementById('back-btn'), {});
(function(){
'use strict';
const $ = id => document.getElementById(id);
const NAMES = ['Mia', 'Leo', 'Aowu', 'Sasha', 'Kai', 'Nina', 'Tom', 'Ploy', 'Bam', 'Fah', 'Joe', 'Mint', 'Ben', 'Ivy', 'Max', 'Zoe', 'Pim', 'Ray', 'Ann', 'Sam'];
const COUNTS = [10, 40, 100, 200], THEMES = [['meadow', 'Meadow'], ['storybook', 'Storybook'], ['beach', 'Beach'], ['snow', 'Snow'], ['lava', 'Lava']];
const S = {count: Iso.phone ? 40 : 40, theme: 0, edit: false, big: false, follow: false, units: [], items: [], M: null, V: null, mm: null, ms: [], fpsT: [], ready: false, rng: 1};
const rnd = () => (S.rng = (S.rng * 16807) % 2147483647) / 2147483647;

/* ---------- 🗺️ a little world: river + bridges, terraced hills, paths, flowers, a beach ---------- */
function makeWorld(n){
  const W = n, H = n, cx = W * 0.62, cy = H * 0.3, river = j => Math.round(W * 0.42 + Math.sin(j / H * 5.2) * W * 0.08);
  return Iso.map({w: W, h: H, theme: THEMES[S.theme][0], seed: 7, cell: (i, j) => {
    const rv = river(j), dr = i - rv;
    if(dr >= 0 && dr < Math.max(2, Math.round(W / 16))){ return (j % Math.round(H / 3)) === Math.round(H / 6) ? {t: 'wood', h: 0} : {t: 'water', h: 0}; }
    const hill = Math.max(0, 3.4 - Math.hypot(i - cx, (j - cy) * 1.2) / (W / 12)), h2 = Math.max(0, 2.2 - Math.hypot(i - W * 0.2, j - H * 0.72) / (W / 14));
    const h = Math.min(3, Math.floor(Math.max(hill, h2)));
    if(i + j > W * 1.65) return {t: 'sand', h: 0};
    if(Math.abs(j - Math.round(H * 0.55)) < 1 || (Math.abs(i - Math.round(W * 0.18)) < 1 && j < H * 0.55)) return {t: h ? 'grass' : 'path', h, cost: 0.6};
    if(h >= 3) return {t: 'stone', h};
    const r = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453 % 1;
    return {t: Math.abs(r) < 0.12 ? 'flower' : 'grass', h};
  }});
}
function walkable(M){ const out = []; for(let j = 0; j < M.h; j++) for(let i = 0; i < M.w; i++) if(M.walk(i, j)) out.push([i, j]); return out; }

/* ---------- 🧍 walkers ---------- */
function makeUnit(k){
  const name = NAMES[k % NAMES.length] + (k >= NAMES.length ? ' ' + (1 + Math.floor(k / NAMES.length)) : ''), av = typeof defaultAvatar === 'function' ? defaultAvatar(name) : {};
  const who = {name, av}, spot = S.free[Math.floor(rnd() * S.free.length)];
  return {who, x: spot[0] + 0.5, y: spot[1] + 0.5, z: S.M.heightAt(spot[0], spot[1]), path: null, pi: 0, spd: 1.3 + rnd() * 0.8, dist: rnd() * 8, flip: false, wait: rnd() * 2, asking: false, pic: null,
    frames: null, px: 0, py: 0, pz: 0};
}
function framesOf(u){ const F = []; for(let f = 0; f < Iso.WALK_N; f++) F.push(Iso.avatar(u.who, {pose: 'walk', f})); return F; }
function goTo(u, tx, ty){ if(u.asking) return; u.asking = true;
  Iso.pathAsync(S.M, u, {x: tx, y: ty}).then(p => { u.asking = false; if(p && p.length > 1){ u.path = p; u.pi = 1; } else u.wait = 0.5 + rnd(); }); }
function wander(u){ const s = S.free[Math.floor(rnd() * S.free.length)]; goTo(u, s[0] + 0.5, s[1] + 0.5); }
function step(dt){
  for(const u of S.units){ u.px = u.x; u.py = u.y; u.pz = u.z;
    if(!u.path){ u.wait -= dt; if(u.wait <= 0 && !u.asking) wander(u); continue; }
    const tgt = u.path[u.pi], dx = tgt.x - u.x, dy = tgt.y - u.y, d = Math.hypot(dx, dy), mv = u.spd * dt;
    if(d <= mv){ u.x = tgt.x; u.y = tgt.y; if(++u.pi >= u.path.length){ u.path = null; u.wait = 0.4 + rnd() * 2.5; } }
    else { u.x += dx / d * mv; u.y += dy / d * mv; }
    u.dist += mv; const sdx = dx - dy; if(Math.abs(sdx) > 0.05) u.flip = sdx < 0;
    const hz = S.M.heightAt(u.x, u.y); u.z += (hz - u.z) * Math.min(1, dt * 10);   // smooth step up / down a terrace
  }
}
function render(alpha, t){
  if(S.followU && S.V.followObj !== S.followU.it) stopFollow();   // a drag / minimap tap stops following
  for(let q = 0; q < S.units.length; q++){ const u = S.units[q], it = u.it;
    it.x = u.px + (u.x - u.px) * alpha; it.y = u.py + (u.y - u.py) * alpha; it.z = u.pz + (u.z - u.pz) * alpha;
    it.pic = u.frames[u.path ? Math.floor(u.dist * 3.2) % Iso.WALK_N : 0]; it.flip = u.flip; }
  const st = Iso.frame(S.V, {items: S.items, t, groundFx: ringFx});
  S.mm.draw(); meter(st);
}
// ◇ pulsing ring under the followed friend + where friends were called to
function ringFx(g, V, t){
  const ring = (x, y, z, c, a) => { const p = V.toScreen(x, y, z), k = V.zoom, pul = 1 + Math.sin(t * 6) * 0.08; g.save(); g.translate(p.x, p.y); g.scale(pul, pul);
    g.strokeStyle = c; g.globalAlpha = a; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -14 * k); g.lineTo(28 * k, 0); g.lineTo(0, 14 * k); g.lineTo(-28 * k, 0); g.closePath(); g.stroke(); g.restore(); };
  if(S.followU){ const it = S.followU.it; ring(it.x, it.y, it.z, '#FFC845', 0.95); const p = V.toScreen(it.x, it.y, it.z); g.font = "700 13px 'Fredoka', sans-serif"; g.textAlign = 'center'; const nm = '🎯 ' + S.followU.who.name, w = g.measureText(nm).width + 14;
    g.fillStyle = 'rgba(255,200,69,.95)'; g.beginPath(); g.roundRect ? g.roundRect(p.x - w / 2, p.y + 10, w, 20, 10) : g.rect(p.x - w / 2, p.y + 10, w, 20); g.fill(); g.fillStyle = '#2A2440'; g.fillText(nm, p.x, p.y + 25); }
  if(S.call && t - S.call.t < 1.4) ring(S.call.x, S.call.y, S.call.z, '#FF5C9A', 1 - (t - S.call.t) / 1.4);
}

/* ---------- ⏱️ speed meter ---------- */
let lastShow = 0;
function meter(st){
  const tn = performance.now(); S.ms.push(st.ms); S.fpsT.push(tn); while(S.fpsT.length && tn - S.fpsT[0] > 1000) S.fpsT.shift(); if(S.ms.length > 60) S.ms.shift();
  if(tn - lastShow < 300) return; lastShow = tn; const avg = S.ms.reduce((a, b) => a + b, 0) / S.ms.length, fps = S.fpsT.length;
  $('m-ms').textContent = avg.toFixed(1); $('m-ms').className = avg < 8 ? 'good' : avg < 14 ? 'ok' : 'bad'; $('m-fps').textContent = fps; $('m-fps').className = fps >= 50 || (Iso.budget.fps === 30 && fps >= 28) ? 'good' : fps >= 28 ? 'ok' : 'bad';
  $('m-more').textContent = '👥 ' + S.units.length + ' · 🧱 ' + st.chunks + ' chunks · 🖼️ ' + st.pics + ' pics · 🎚️ level ' + st.level + (Iso.budget.fps === 30 ? ' · 30 fps' : '') + ' · zoom ' + S.V.zoom.toFixed(2);
}

/* ---------- 🔧 setup ---------- */
// the free area: below the top chips, above the tool buttons (the map is fitted + kept there)
function pads(){ const t = $('hud').getBoundingClientRect(), b = $('tools').getBoundingClientRect(); return {t: Math.round(t.bottom) + 4, b: Math.round(innerHeight - b.top) + 6}; }
async function build(){
  const n = S.big ? 96 : 32; S.M = makeWorld(n); S.free = walkable(S.M); S.units.length = 0; S.items.length = 0;   // a new map → everyone gets a new spot
  if(!S.V){ S.V = Iso.view($('iso'), S.M, {min: 0.3, max: 3, pad: pads()}); S.V.onTap = tap; S.mm = Iso.minimap($('mini'), S.M, S.V, {dots: () => S.items}); addEventListener('resize', () => S.V.setPad(pads())); }
  else { S.V.map = S.M; S.V.chunks.clear(); S.V.chunkAny.clear(); S.V._px = 0; S.V._liquid = null; S.V._sky = null; S.mm = Iso.minimap($('mini'), S.M, S.V, {dots: () => S.items}); S.V.fit(); }
  if(!S.big){ S.V.fit(); const tall = S.V.H > S.V.W * 1.3; if(S.V.W > 700 || tall) S.V.zoomAt(S.V.zoom * (tall ? 2 : 1.25), S.V.W / 2, S.V.H / 2); }   // phone held upright: start closer (pan to explore, 🔍 Fit shows all)
  await setCount(S.count);
}
async function setCount(n){
  const want = n; n = Math.min(n, Iso.budget.units); S.count = n; $('t-count').textContent = '👥 ' + n + (want > n ? ' (phone max)' : '');
  while(S.units.length > n){ const u = S.units.pop(), k = S.items.indexOf(u.it); if(k >= 0) S.items.splice(k, 1); if(S.followU === u) stopFollow(); }
  const add = []; while(S.units.length < n){ const u = makeUnit(S.units.length); u.it = {x: u.x, y: u.y, z: u.z, pic: null, u}; S.units.push(u); S.items.push(u.it); add.push(u); }
  // the same 20 family looks repeat → their pictures are shared; bake what's new with a loading bar
  const pics = []; add.forEach(u => { u.frames = framesOf(u); pics.push(...u.frames); });
  const fresh = pics.filter(p => !p.by.size); if(fresh.length > 12){ $('loading').classList.remove('hidden'); $('loading').style.opacity = 1; $('load-text').textContent = 'Baking ' + fresh.length + ' little pictures…'; }
  await Iso.warm(fresh, S.V, {onProgress: f => { $('load-bar').style.width = Math.round(f * 100) + '%'; }});
  $('loading').style.opacity = 0; setTimeout(() => $('loading').classList.add('hidden'), 350);
  S.units.forEach(u => { if(!u.frames) u.frames = framesOf(u); });
  S.ready = true;
}
function tap(cell){
  if(!cell) return;
  if(S.edit){ const c = S.M.get(cell.i, cell.j); if(c.t === 'water' || c.t === 'wood') return; S.M.set(cell.i, cell.j, {h: (c.h + 1) % 4, t: (c.h + 1) % 4 === 3 ? 'stone' : c.t === 'stone' ? 'grass' : c.t}); S.free = walkable(S.M); return; }
  if(!S.M.walk(cell.i, cell.j)) return;
  S.call = {x: cell.i + 0.5, y: cell.j + 0.5, z: S.M.hgt[cell.j * S.M.w + cell.i], t: performance.now() / 1000};
  S.units.map(u => [u, Math.hypot(u.x - cell.i, u.y - cell.j)]).sort((a, b) => a[1] - b[1]).slice(0, 6).forEach(([u]) => { u.asking = false; goTo(u, cell.i + 0.5, cell.j + 0.5); });
  if(window.UI && UI.sound) try{ UI.sound('tap'); }catch(e){}
}
$('t-count').onclick = () => { const i = COUNTS.indexOf(S.count); setCount(S.count >= Iso.budget.units && i < COUNTS.length - 1 && COUNTS[i + 1] > Iso.budget.units ? COUNTS[0] : COUNTS[(i + 1) % COUNTS.length] || 40); };
$('t-theme').onclick = () => { S.theme = (S.theme + 1) % THEMES.length; S.M.setTheme(THEMES[S.theme][0]); S.V._sky = null; S.mm = Iso.minimap($('mini'), S.M, S.V, {dots: () => S.items}); $('t-theme').textContent = '🎨 ' + THEMES[S.theme][1]; };
$('t-edit').onclick = () => { S.edit = !S.edit; $('t-edit').classList.toggle('on', S.edit); $('tip').textContent = S.edit ? '⛰️ tap a tile to raise it (4th tap = flat again)' : '👆 drag to move · 🤏 pinch or wheel to zoom · tap the ground to call friends'; $('tip').style.opacity = 1; };
$('t-big').onclick = () => { S.big = !S.big; $('t-big').classList.toggle('on', S.big); $('t-big').textContent = S.big ? '🗺️ 96 × 96' : '🗺️ Big map'; build(); };
// 🎯 Follow = the friend nearest the middle of the screen (tap again = stop); dragging the map also stops it
function stopFollow(){ S.followU = null; S.V.follow(null); $('t-follow').classList.remove('on'); $('t-follow').textContent = '🎯 Follow'; }
$('t-follow').onclick = () => { if(S.followU){ stopFollow(); return; }
  let best = null, bd = 1e9; S.units.forEach(u => { const p = S.V.toScreen(u.it.x, u.it.y, u.it.z), d = Math.hypot(p.x - S.V.cx, p.y - S.V.cy); if(d < bd){ bd = d; best = u; } });
  if(!best) return; S.followU = best; S.V.follow(best.it); $('t-follow').classList.add('on'); $('t-follow').textContent = '🎯 ' + best.who.name; };
$('t-fit').onclick = () => { if(S.followU) stopFollow(); S.V.fit(); };
setTimeout(() => { $('tip').style.opacity = 0; }, 6000);
$('iso').addEventListener('pointerdown', () => { if(!S.edit) setTimeout(() => { $('tip').style.opacity = 0; }, 1200); });
S.setCount = setCount; window.ISOTEST = S;
build().then(() => { S.loop = Iso.loop({update: step, render}); });
})();
