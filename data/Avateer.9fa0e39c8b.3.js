
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
const GAME_ID = 'avateer';
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});
if(UI.KINDS && !UI.KINDS.avateer) UI.KINDS.avateer = ['🧳', 'Packing your bag', 'bob'];   // 🧳 runtime until the UiKit lane moves it in (Open questions)
if(UI.GAME_HELP && !UI.GAME_HELP.avateer) UI.GAME_HELP.avateer = ['🧳 Travel the floating islands with your own avatar, a weapon and a pet.', 'Walk with 👆 tap or the 🕹️ stick, 🦘 jump, ⚔️ swing.', 'This is the speed test — ▶ runs it for 30 seconds.'];
UI.navBar(document.getElementById('back-btn'), {});
(function(){
'use strict';
const $ = id => document.getElementById(id);
const S = {count: 40, M: null, V: null, items: [], mons: [], ms: [], fpsT: [], ready: false, rng: 7, t: 0, run: null, pops: 0};
const rnd = () => (S.rng = (S.rng * 16807) % 2147483647) / 2147483647;
const KP = 1.24, KT = 1.45, KM = 0.96;   // prop / tree / monster scale at zoom 1 (the R0a2 sheet's sizes)

/* ---------- 🖼️ bake a painter once into an IsoKit picture (its real box measured once) ---------- */
function pic(key, paint){ const b = AVD.box('av:' + key, (q) => paint(q, 0, 0));
  return Iso.sprite('av:' + key, b.w, b.h, g => paint(g, -b.x0, -b.y0), {ax: -b.x0, ay: -b.y0}); }

/* ---------- 🗺️ the islets + where things stand (R0a2 sheet: 🛶 Landing Village + 🥭 Mango Grove) ---------- */
const PROPS = [];
function addProp(x, y, p, o){ const it = Object.assign({x, y, z: S.M.heightAt(Math.floor(x), Math.floor(y)), pic: p, prop: true}, o || {}); PROPS.push(it); S.items.push(it); return it; }
function buildWorld(){
  const A = AvArch.archipelago(); S.M = A.m; const t = 0.8, W2 = AvWorld, A2 = AvArch;
  const block = (x, y, r) => { for(let j = Math.floor(y - r); j <= Math.floor(y + r); j++) for(let i = Math.floor(x - r); i <= Math.floor(x + r); i++) if(S.M.inside(i, j) && Math.hypot(i + 0.5 - x, j + 0.5 - y) <= r + 0.2) S.M.set(i, j, {block: 1}); };
  const P = {
    inn: pic('inn', (g, x, y) => W2.inn(g, x, y, KP * 0.8, t)), shop: pic('shop', (g, x, y) => W2.shop(g, x, y, KP * 0.8, t)), smithy: pic('smithy', (g, x, y) => A2.smithy(g, x, y, KP * 0.8, t)),
    board: pic('board', (g, x, y) => A2.board(g, x, y, KP * 0.9)), elephant: pic('pudding', (g, x, y) => A2.babyElephant(g, x, y, KP * 0.95, t)), chest: pic('chest', (g, x, y) => W2.chest(g, x, y, KP, t, {brain: true})),
    house: ['#E8B979', '#D9C7A0', '#E8C8A0'].map((c, i) => pic('house' + i, (g, x, y) => A2.stiltHouse(g, x, y, KP * 0.75, t, c))),
    palm: [0, 1].map(i => pic('palm' + i, (g, x, y) => W2.palm(g, x, y, KT * (0.8 + i * 0.15), t + i, 1.1))), banana: pic('banana', (g, x, y) => W2.banana(g, x, y, KT * 0.85, t)),
    bamboo: pic('bamboo', (g, x, y) => W2.bamboo(g, x, y, KT * 0.8)), jtree: [0, 1].map(i => pic('jtree' + i, (g, x, y) => W2.jtree(g, x, y, KT * (0.7 + i * 0.12), t, 1))),
    mango: [0, 1].map(i => pic('mango' + i, (g, x, y) => A2.mangoTree(g, x, y, KT * (0.72 + i * 0.2), t))), flowers: [0, 1, 2].map(i => pic('fl' + i, (g, x, y) => W2.flowers(g, x, y, KT, 5 + i * 3)))
  };
  addProp(10.5, 22.2, P.inn); addProp(16.5, 29.8, P.shop); addProp(17.8, 22.6, P.smithy); addProp(13.6, 24.2, P.board); addProp(35.2, 10.4, P.elephant); addProp(41.6, 8.6, P.chest);
  [[10.5, 22.2, 1.2], [16.5, 29.8, 1.1], [17.8, 22.6, 1.1], [13.6, 24.2, 0.4], [35.2, 10.4, 0.8], [41.6, 8.6, 0.4]].forEach(b => block(b[0], b[1], b[2]));
  [[7.8, 20.4], [20.2, 30.2], [12.8, 32.4]].forEach((h, i) => { addProp(h[0], h[1], P.house[i]); block(h[0], h[1], 0.9); });
  const NPC = defaultAvatar('Grandma Noi'); addProp(8.6, 29.2, null, {draw: (g, sx, sy, k) => drawAvatar(g, {av: NPC, name: 'Grandma Noi', dir: -1}, sx, sy, k * 0.62 * 1.55, {t: S.t, still: true})}); block(8.6, 29.2, 0.3);
  [[31, 8.2], [36.4, 6.2], [40.6, 12.4], [32.8, 17.4], [44.2, 10.2], [38.8, 18.2], [29.6, 12.6], [42.4, 15.6]].forEach((p, i) => { addProp(p[0], p[1], P.mango[i % 2]); block(p[0], p[1], 0.4); });
  [[27.6, 6.6], [45.2, 6.8], [35.8, 20.6]].forEach(p => addProp(p[0], p[1], P.bamboo));
  [[4.5, 24.5], [7, 18.4], [21.4, 26.8], [10, 34.6], [18.6, 34], [23.4, 28.6], [15.6, 18.6]].forEach((p, i) => { addProp(p[0], p[1], i % 2 ? P.palm[i % 4 > 1 ? 1 : 0] : P.banana); block(p[0], p[1], 0.3); });
  const r = AVD.rnd(77), busy = [[10.5, 22.2], [16.5, 29.8], [17.8, 22.6], [13.6, 24.2], [7.8, 20.4], [20.2, 30.2], [12.8, 32.4], [8.6, 29.2], [35.2, 10.4], [41.6, 8.6]]; let placed = 0;
  for(let n = 0; n < 900 && placed < 90; n++){ const i = Math.floor(r() * S.M.w), j = Math.floor(r() * S.M.h), c = S.M.get(i, j); if(!c || c.t !== 'grass' || c.block) continue;
    if(busy.some(q => Math.hypot(q[0] - i - 0.5, q[1] - j - 0.5) < 2.4)) continue; placed++; const isA = Math.hypot(i - 14, j - 26) < 12, kind = r();
    if(kind < 0.35) addProp(i + 0.5, j + 0.5, P.flowers[n % 3], {depth: -1});
    else { addProp(i + 0.5, j + 0.5, kind < 0.55 ? (isA ? P.banana : P.bamboo) : kind < 0.8 ? (isA ? P.palm[n % 2] : P.mango[n % 2]) : P.jtree[n % 2]); S.M.set(i, j, {block: 1}); } }
  S.free = []; for(let j = 0; j < S.M.h; j++) for(let i = 0; i < S.M.w; i++){ const c = S.M.get(i, j); if(S.M.walk(i, j) && c.t !== 'path' && c.t !== 'wood') S.free.push([i, j]); }
}

/* ---------- 🧑 you (+ 🐾 Emberpup): drawn live — weapon in hand (🗡️ AvatarWeapons), walk / jump / swing / emote ---------- */
const ME = {name: CURRENT_PLAYER || 'Traveller'};
function heroAv(){ let av = null; try{ const s = JSON.parse(localStorage.getItem('sp_av:' + ME.name) || 'null'); if(s) av = s; }catch(e){} av = av || defaultAvatar(ME.name);
  return AvWeapons.arm(av, AvWeapons.idx('sword', 0), AvWeapons.idx('shield', 0)); }
const H = {x: 12.5, y: 26.5, z: 0, px: 12.5, py: 26.5, pz: 0, dir: 1, walkT: 0, path: null, pi: 0, spd: 3.1, jump: -1, swing: -1, gest: null, vx: 0, vy: 0, moving: false};
const PET = {x: 7.6, y: 31, z: 0, px: 7.6, py: 31, pz: 0, dir: 1};
H.it = {x: H.x, y: H.y, z: 0, draw: (g, sx, sy, k) => drawHero(g, sx, sy, k)};
PET.it = {x: PET.x, y: PET.y, z: 0, pic: null};
const SWING = {k: 'avswing', d: 0.42, f: p => { const a = p < 0.35 ? p / 0.35 : 1, b = p < 0.35 ? 0 : (p - 0.35) / 0.65; return {armR: 0.4 + a * 2.6 - b * 3.4, holdRot: -0.4 * a + b * 1.6, rot: -0.06 * a + b * 0.08}; }};
function drawHero(g, sx, sy, k){ const jh = H.jump >= 0 ? Math.sin(Math.min(1, H.jump / 0.5) * Math.PI) : 0;
  const a = {av: H.av, name: ME.name, dir: H.dir, walkT: H.moving && H.jump < 0 ? H.walkT : 0};
  if(H.swing >= 0) a.gest = {g: SWING, t: H.swing}; else if(H.gest) a.gest = {g: H.gest.g, t: H.gest.t};
  g.save(); if(jh){ g.fillStyle = 'rgba(30,40,20,.18)'; g.beginPath(); g.ellipse(sx, sy, 16 * k * (1 - jh * 0.4), 6 * k * (1 - jh * 0.4), 0, 0, 7); g.fill(); }
  drawAvatar(g, a, sx, sy - jh * 34 * k, k * 0.62 * 1.55, {t: S.t}); g.restore(); }
function heroTo(cell){ if(S.run) return; Iso.pathAsync(S.M, {x: H.x, y: H.y}, {x: cell.i + 0.5, y: cell.j + 0.5}).then(p => { if(p && p.length > 1){ H.path = p; H.pi = 1; } }); }
function heroStep(dt){
  H.px = H.x; H.py = H.y; let mx = 0, my = 0;
  if(H.vx || H.vy){ H.path = null; mx = H.vx; my = H.vy; }
  else if(H.path){ const tg = H.path[H.pi], dx = tg.x - H.x, dy = tg.y - H.y, d = Math.hypot(dx, dy); if(d < 0.12){ if(++H.pi >= H.path.length) H.path = null; } else { mx = dx / d; my = dy / d; } }
  H.moving = !!(mx || my);
  if(H.moving){ const sp = H.spd * dt, nx = H.x + mx * sp, ny = H.y + my * sp, okAt = (x, y) => S.M.walk(Math.floor(x), Math.floor(y)) || (H.jump >= 0 && !S.M.isVoid(Math.floor(x), Math.floor(y)));
    if(okAt(nx, ny)){ H.x = nx; H.y = ny; } else if(okAt(nx, H.y)) H.x = nx; else if(okAt(H.x, ny)) H.y = ny; else H.path = null;
    H.walkT += dt; const sdx = mx - my; if(Math.abs(sdx) > 0.05) H.dir = sdx > 0 ? 1 : -1; }
  H.z += (S.M.heightAt(Math.floor(H.x), Math.floor(H.y)) - H.z) * Math.min(1, dt * 10);
  if(H.jump >= 0){ H.jump += dt; if(H.jump > 0.5) H.jump = -1; }
  if(H.swing >= 0){ H.swing += dt; if(H.swing > SWING.d) H.swing = -1; }
  if(H.gest){ H.gest.t += dt; if(H.gest.t > H.gest.g.d) H.gest = null; }
  // 🐾 the pet trots after you
  PET.px = PET.x; PET.py = PET.y; const tx = H.x - H.dir * 0.7, ty = H.y + 0.5, dd = Math.hypot(tx - PET.x, ty - PET.y);
  if(dd > 0.25){ const s = Math.min(dd, (dd > 2 ? 4.2 : 2.8) * dt); PET.x += (tx - PET.x) / dd * s; PET.y += (ty - PET.y) / dd * s; if(Math.abs(tx - PET.x) > 0.02) PET.dir = tx > PET.x ? 1 : -1; }
  PET.z = S.M.heightAt(Math.floor(PET.x), Math.floor(PET.y));
}

/* ---------- 👾 roaming monsters (baked pictures, 4 frames) — touch one = a battle (R1); no surprise battles ---------- */
const KINDS = ['mangobble', 'mangobble', 'cococlaw', 'toucanoo', 'mangobble', 'cococlaw', 'toucanoo', 'hissvine'];
const MPIC = {};
function monPics(id){ if(MPIC[id]) return MPIC[id]; const mini = AvWorld.MON[id].mini; return MPIC[id] = [0, 1, 2, 3].map(f => pic('mon:' + id + ':' + f, (g, x, y) => AvWorld.monster(g, id, x, y, KM * 0.62 * 1.55 * (mini ? 1 : 1), f * 0.4, {warn: mini}))); }
function makeMon(n){ const id = KINDS[n % KINDS.length], s = S.free[Math.floor(rnd() * S.free.length)];
  const m = {id, x: s[0] + 0.5, y: s[1] + 0.5, px: 0, py: 0, home: [s[0] + 0.5, s[1] + 0.5], tx: 0, ty: 0, wait: rnd() * 2, spd: 0.6 + rnd() * 0.7, ph: rnd() * 4, flip: false, back: 0, frames: monPics(id)};
  m.px = m.x; m.py = m.y; m.it = {x: m.x, y: m.y, z: S.M.heightAt(s[0], s[1]), pic: m.frames[0], mon: m}; return m; }
function monStep(m, dt){ m.px = m.x; m.py = m.y; m.ph += dt;
  if(m.back > 0){ m.back -= dt; const d = Math.hypot(m.x - H.x, m.y - H.y) || 1, nx = m.x + (m.x - H.x) / d * dt * 3, ny = m.y + (m.y - H.y) / d * dt * 3; if(S.M.walk(Math.floor(nx), Math.floor(ny))){ m.x = nx; m.y = ny; } return; }
  if(m.wait > 0){ m.wait -= dt; if(m.wait <= 0){ for(let k = 0; k < 6; k++){ const a = rnd() * 6.283, r = 1 + rnd() * 4, x = m.home[0] + Math.cos(a) * r, y = m.home[1] + Math.sin(a) * r; if(S.M.walk(Math.floor(x), Math.floor(y))){ m.tx = x; m.ty = y; return; } } m.wait = 1; } return; }
  const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy); if(d < 0.1){ m.wait = 0.8 + rnd() * 2.4; return; }
  const s = Math.min(d, m.spd * dt), nx = m.x + dx / d * s, ny = m.y + dy / d * s;
  if(S.M.walk(Math.floor(nx), Math.floor(ny))){ m.x = nx; m.y = ny; const sdx = dx - dy; if(Math.abs(sdx) > 0.02) m.flip = sdx > 0; } else m.wait = 0.5;
  if(!S.run && Math.hypot(m.x - H.x, m.y - H.y) < 0.75 && H.jump < 0){ m.back = 0.6; battlePop(m); }
}
let popT = 0;
function battlePop(m){ const n = AvWorld.MON[m.id].name, el = $('pop'); S.pops++; lwDrop(m); el.textContent = '⚔️ ' + n + ' wants to battle! (R1)'; const p = S.V.toScreen(m.x, m.y, 2); el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
  el.classList.add('on'); clearTimeout(popT); popT = setTimeout(() => el.classList.remove('on'), 1300); if(window.UISound) UISound.play('pop'); }
function setCount(want){ const n = Math.min(want, Iso.budget.units || want); S.count = n;
  document.querySelectorAll('#counts [data-n]').forEach(b => b.classList.toggle('on', Number(b.dataset.n) === want));
  while(S.mons.length > n){ const m = S.mons.pop(), k = S.items.indexOf(m.it); if(k >= 0) S.items.splice(k, 1); }
  while(S.mons.length < n){ const m = makeMon(S.mons.length); S.mons.push(m); S.items.push(m.it); } }

/* ---------- ⏱️ loop + meter ---------- */
function step(dt){ heroStep(dt); for(const m of S.mons) monStep(m, dt); if(S.run) runStep(dt); }
function render(alpha, t){ S.t = t;
  H.it.x = H.px + (H.x - H.px) * alpha; H.it.y = H.py + (H.y - H.py) * alpha; H.it.z = H.z;
  PET.it.x = PET.px + (PET.x - PET.px) * alpha; PET.it.y = PET.py + (PET.y - PET.py) * alpha; PET.it.z = PET.z; PET.it.pic = PET.pics[Math.floor(t * 6) % 4]; PET.it.flip = PET.dir < 0;
  for(const m of S.mons){ const it = m.it; it.x = m.px + (m.x - m.px) * alpha; it.y = m.py + (m.y - m.py) * alpha; it.pic = m.frames[Math.floor(m.ph * 5) % 4]; it.flip = m.flip; }
  under(); lwFrame(t);
  const st = Iso.frame(S.V, {items: S.items, t, overlay: (g, V) => AvArch.ropePosts(g, [23.6, 20.8], [27.4, 17.2], V, 0, 0)});
  meter(st);
}
let lastShow = 0;
function meter(st){ const tn = performance.now(); S.ms.push(st.ms); S.fpsT.push(tn); while(S.fpsT.length && tn - S.fpsT[0] > 1000) S.fpsT.shift(); if(S.ms.length > 60) S.ms.shift();
  if(S.run){ S.run.frames.push(tn); S.run.draw.push(st.ms); S.run.level = Math.max(S.run.level, st.level || 0); }
  if(tn - lastShow < 300) return; lastShow = tn; const avg = S.ms.reduce((a, b) => a + b, 0) / S.ms.length, fps = S.fpsT.length;
  $('m-ms').textContent = avg.toFixed(1); $('m-ms').className = avg < 8 ? 'good' : avg < 14 ? 'ok' : 'bad'; $('m-fps').textContent = fps; $('m-fps').className = fps >= 50 || (Iso.budget.fps === 30 && fps >= 28) ? 'good' : fps >= 28 ? 'ok' : 'bad';
  $('m-more').textContent = '👾 ' + S.mons.length + ' · 🖼️ ' + st.pics + ' pics · 🎚️ level ' + st.level + (Iso.budget.fps === 30 ? ' · 30 fps' : '') + ' · zoom ' + S.V.zoom.toFixed(2) + ' · ✨ ' + S.V.dpr + '×'; }

/* ---------- 🪨 the floating rock under the islets: baked once per zoom, moved with the camera (never re-painted while you walk) ---------- */
const UN = {cv: null, z: 0, o: null};
function under(){ const V = S.V, c = $('under'), g = c.getContext('2d'), dpr = V.dpr || 1, W = c.clientWidth, Hh = c.clientHeight;
  if(c.width !== Math.round(W * dpr) || c.height !== Math.round(Hh * dpr)){ c.width = Math.round(W * dpr); c.height = Math.round(Hh * dpr); }
  const O = V.toScreen(0, 0, 0);
  if(!UN.cv || (!V.moving && Math.abs(UN.z - V.zoom) > 0.001)) bakeUnder();
  const r = V.zoom / UN.z; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, Hh);
  g.drawImage(UN.cv, O.x + UN.o[0] * r, O.y + UN.o[1] * r, UN.w * r, UN.h * r); }
function bakeUnder(){ const V = S.V, O = V.toScreen(0, 0, 0), ex = V.toScreen(1, 0, 0), ey = V.toScreen(0, 1, 0), ez = V.toScreen(0, 0, 1), M = S.M;
  const vec = (x, y, z) => ({x: (ex.x - O.x) * x + (ey.x - O.x) * y + (ez.x - O.x) * z, y: (ex.y - O.y) * x + (ey.y - O.y) * y + (ez.y - O.y) * z});
  const cs = [vec(0, 0, 0), vec(M.w, 0, 0), vec(0, M.h, 0), vec(M.w, M.h, 0)], x0 = Math.min(...cs.map(p => p.x)) - 80 * V.zoom, x1 = Math.max(...cs.map(p => p.x)) + 80 * V.zoom, y0 = Math.min(...cs.map(p => p.y)) - 40 * V.zoom, y1 = Math.max(...cs.map(p => p.y)) + 700 * V.zoom;
  const w = x1 - x0, h = y1 - y0, sc = Math.min(V.dpr || 1, Math.sqrt(3e6 / (w * h)));   // ≤ 3 million pixels (iPad canvas memory)
  const cv = UN.cv || document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * sc)); cv.height = Math.max(1, Math.round(h * sc)); const g = cv.getContext('2d'); g.setTransform(sc, 0, 0, sc, 0, 0); g.clearRect(0, 0, w, h);
  const fake = {zoom: V.zoom, toScreen: (x, y, z) => { const p = vec(x, y, z || 0); return {x: p.x - x0, y: p.y - y0}; }};
  AvWorld.underside(g, fake, M, 0, 0, 0.8);
  Object.assign(UN, {cv, z: V.zoom, o: [x0, y0], w, h}); }

/* ---------- 🕹️ controls: tap the ground · stick · 🦘 jump · ⚔️ swing · 🎭 emote ---------- */
function controls(){
  S.V.onTap = cell => { if(cell) heroTo(cell); };
  const st = $('stick'), kn = st.querySelector('.knob'), T = UI.stickTracker(st, {player: CURRENT_PLAYER}); let on = null;
  const move = v => { const m = Math.min(1, v.m); kn.style.transform = 'translate(' + (v.fx * 30) + '%,' + (v.fy * 30) + '%)';
    if(m < 0.2){ H.vx = H.vy = 0; return; } const sx = v.x / (v.m || 1), sy = v.y / (v.m || 1), wx = sx / 2 + sy, wy = sy - sx / 2, L = Math.hypot(wx, wy) || 1; H.vx = wx / L * m; H.vy = wy / L * m; };
  st.addEventListener('pointerdown', e => { if(S.run) return; on = e.pointerId; st.setPointerCapture(e.pointerId); move(T.start(e)); e.preventDefault(); });
  UI.onFastMove(st, e => { if(e.pointerId === on) move(T.at(e)); });
  const up = e => { if(e.pointerId !== on) return; on = null; H.vx = H.vy = 0; kn.style.transform = ''; }; st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
  const jb = $('b-jump'), eb = $('b-emote'), sb = $('b-swing');
  UI.pad.dress(jb, '🦘', 'Jump', '#FF8A2A', true); UI.pad.dress(sb, '⚔️', 'Swing', '#E63946'); UI.pad.dress(eb, '🎭', 'Emote', '#9B5DE5');
  const press = (b, fn) => b.addEventListener('pointerdown', e => { e.preventDefault(); if(!S.run) fn(); });
  press(jb, () => { if(H.jump < 0){ H.jump = 0; if(window.UISound) UISound.play('pop'); } });
  press(sb, () => { if(H.swing < 0) H.swing = 0; });
  const EMOTES = ['wave', 'dance', 'cheer', 'bow', 'flex']; let ei = 0;
  press(eb, () => { const k = EMOTES[ei++ % EMOTES.length], G = (typeof GESTURES !== 'undefined' ? GESTURES : []).find(x => x.k === k); if(G) H.gest = {g: G, t: 0}; });
  addEventListener('keydown', e => { if(S.run || e.repeat) return; if(e.code === 'Space'){ jb.dispatchEvent(new PointerEvent('pointerdown')); e.preventDefault(); } if(e.code === 'KeyJ') sb.dispatchEvent(new PointerEvent('pointerdown')); if(e.code === 'KeyE') eb.dispatchEvent(new PointerEvent('pointerdown')); });
  const keys = {}; const kv = () => { const x = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0), y = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0);
    if(!x && !y){ if(on == null){ H.vx = H.vy = 0; } return; } const wx = x / 2 + y, wy = y - x / 2, L = Math.hypot(wx, wy); H.vx = wx / L; H.vy = wy / L; };
  addEventListener('keydown', e => { if(/^(Arrow|Key[WASD])/.test(e.code)){ keys[e.code] = 1; kv(); } }); addEventListener('keyup', e => { if(keys[e.code]){ delete keys[e.code]; kv(); } });
  document.querySelectorAll('#counts [data-n]').forEach(b => b.addEventListener('click', () => { setCount(Number(b.dataset.n)); if(window.UISound) UISound.play('tap'); }));
  $('t-fit').onclick = () => { const z = S.V.zoom; S.V.follow(null); S.V.fit(); setTimeout(() => { S.V.zoom = z; S.V.follow(H.it); }, 2500); };
  $('hud').addEventListener('click', e => e.currentTarget.classList.toggle('open'));
  $('t-run').onclick = startRun; $('r-again').onclick = () => { $('result').classList.add('hidden'); startRun(); }; $('r-close').onclick = () => $('result').classList.add('hidden'); $('r-send').onclick = sendResult;
  layoutPads(); addEventListener('resize', () => requestAnimationFrame(layoutPads));
  setTimeout(() => { $('tip').style.opacity = 0; }, 7000);
}
function layoutPads(){ const box = $('btns'), narrow = innerWidth < 600, eb = $('b-emote'), tools = $('tools');
  // 🎭 emote: a petal on wide screens, a dock button on narrow phones (the ring must leave room for the stick)
  if(narrow && eb.parentNode !== tools){ tools.appendChild(eb); eb.className = 'candy'; eb.removeAttribute('style'); eb.innerHTML = '🎭'; eb.title = 'Emote'; }
  if(!narrow && eb.parentNode !== box){ box.appendChild(eb); UI.pad.dress(eb, '🎭', 'Emote', '#9B5DE5'); }
  const G = UI.pad.petals(box, $('b-jump'), narrow ? [$('b-swing')] : [$('b-swing'), eb], {fit: true});
  const st = $('stick'); st.style.width = st.style.height = ''; const sr = st.getBoundingClientRect(), left = Math.min(...[...box.querySelectorAll('button')].filter(x => x.offsetParent).map(x => x.getBoundingClientRect().left));
  if(left - sr.left - 18 < sr.width) st.style.width = st.style.height = Math.max(110, Math.round(left - sr.left - 18)) + 'px';   // the stick never touches the ring (≥ 3 mm gap)
  // the dock sits under the top row when they would touch
  tools.style.top = ''; const tb = tools.getBoundingClientRect(), hb = $('hud').getBoundingClientRect(), bb = $('back-btn').getBoundingClientRect();
  if([hb, bb].some(q => q.left < tb.right && tb.left < q.right && q.top < tb.bottom && tb.top < q.bottom)) tools.style.top = Math.round(Math.max(hb.bottom, bb.bottom) + 8) + 'px';
  $('tip').style.top = Math.round(tools.getBoundingClientRect().bottom + 8) + 'px'; $('tip').style.bottom = 'auto';
  if(S.V){ const t = Math.max(hb.bottom, tools.getBoundingClientRect().bottom) + 6, b = innerHeight - Math.min($('stick').getBoundingClientRect().top, box.getBoundingClientRect().top) + 6; S.V.setPad({t: Math.round(t), b: Math.round(Math.min(b, innerHeight * 0.4))}); } }

/* ---------- ▶ the 30 s speed test: 40 monsters, you walk the village → bridge → grove loop, the camera follows ---------- */
const ROUTE = [[9, 28.6], [13.8, 25.8], [18.2, 23.6], [21.4, 21.8], [23.6, 20.8], [27.4, 17.2], [30.4, 14.8], [34.2, 12.8], [38.2, 10.2], [42, 8.4], [39.4, 15.4], [33.6, 13.4], [27.4, 17.2], [23.6, 20.8], [17.6, 24.4], [12, 27.2]];
function startRun(){ if(S.run) return; $('result').classList.add('hidden'); setCount(40);
  H.vx = H.vy = 0; H.path = null; H.x = ROUTE[0][0]; H.y = ROUTE[0][1]; PET.x = H.x - 0.7; PET.y = H.y + 0.5; S.V.follow(H.it);
  S.run = {t: 0, dur: Number(window.AV_RUN_S) || 30, frames: [], draw: [], level: 0, ri: 1}; document.body.classList.add('running'); $('runbar').classList.remove('hidden'); }
function runStep(dt){ const R = S.run; R.t += dt; if(!H.path){ const p = ROUTE[R.ri % ROUTE.length]; R.ri++; const q = Iso.path(S.M, {x: H.x, y: H.y}, {x: p[0], y: p[1]}); if(q && q.length > 1){ H.path = q; H.pi = 1; } }
  if(Math.floor(R.t * 2) !== Math.floor((R.t - dt) * 2)){ const left = Math.max(0, Math.ceil(R.dur - R.t)); $('run-txt').textContent = '⏱️ Speed test… ' + left + ' s · 👾 40'; $('run-bar').style.width = Math.min(100, R.t / R.dur * 100) + '%'; }
  if(R.t >= R.dur) finishRun(); }
function device(){ const ua = navigator.userAgent, ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const os = ipad ? 'iPad' : /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'Mac' : 'Other';
  const br = /CriOS|Chrome\//.test(ua) && !/Edg\//.test(ua) ? 'Chrome' : /Edg\//.test(ua) ? 'Edge' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'browser';
  return os + ' · ' + br + ' · ' + screen.width + '×' + screen.height + ' · ' + innerWidth + '×' + innerHeight + ' · dpr ' + (devicePixelRatio || 1); }
function finishRun(){ const R = S.run; S.run = null; document.body.classList.remove('running'); $('runbar').classList.add('hidden'); H.path = null;
  const f = R.frames, n = f.length, secs = n > 1 ? (f[n - 1] - f[0]) / 1000 : 1, gaps = []; for(let i = 1; i < n; i++) gaps.push(f[i] - f[i - 1]); gaps.sort((a, b) => a - b);
  const p99 = gaps.length ? gaps[Math.min(gaps.length - 1, Math.floor(gaps.length * 0.99))] : 1000, avg = n > 1 ? (n - 1) / secs : 0, low = 1000 / p99, draw = R.draw.reduce((a, b) => a + b, 0) / Math.max(1, R.draw.length);
  const cap = Iso.budget.fps || 60, good = avg >= cap * 0.83 && low >= cap * 0.5, ok = avg >= 28;
  S.last = {avg: Math.round(avg), low: Math.round(low), draw: +draw.toFixed(1), level: Iso.budget.level, maxLevel: R.level, cap, mons: S.mons.length, secs: Math.round(secs), dev: device(), pops: S.pops};
  $('r-grade').textContent = good ? '🟢' : ok ? '🟡' : '🔴'; $('r-title').textContent = good ? 'Smooth!' : ok ? 'OK — a bit slow' : 'Too slow';
  $('r-sub').textContent = good ? 'Avateer can walk 40 monsters around here.' : ok ? 'Playable — R1 keeps fewer monsters on screen.' : 'R1 must draw less — the 📤 numbers tell me where.';
  $('r-fps').textContent = S.last.avg + (cap === 30 ? ' / 30' : ''); $('r-low').textContent = S.last.low; $('r-ms').textContent = S.last.draw; $('r-lv').textContent = S.last.level + ' / 4';
  $('r-dev').textContent = S.last.dev + ' · ' + S.last.mons + ' monsters · ' + S.last.secs + ' s'; $('r-send').disabled = false; $('r-send').innerHTML = '📤 Send to Claude';
  $('result').classList.remove('hidden'); if(window.UISound) UISound.play(good ? 'win' : 'pop'); }
function sendResult(){ const L = S.last, b = $('r-send'); if(!L) return;
  const text = '🧪 Avateer speed test (av-r0b): ' + L.avg + ' fps average (cap ' + L.cap + ') · slowest 1 % ' + L.low + ' fps · ' + L.draw + ' ms a frame · quality level ' + L.level + ' (max ' + L.maxLevel + ') · ' + L.mons + ' monsters · ' + L.secs + ' s';
  UI.busy(b, 'avateer', 'Sending…');
  google.script.run.withSuccessHandler(() => { UI.idle(b); b.textContent = '✅ Sent — thank you!'; b.disabled = true; if(UI.toast) UI.toast('📤 Sent — the Avateer chat will read it'); })
    .withFailureHandler(e => { UI.idle(b); if(UI.toast) UI.toast('⚠️ ' + ((e && e.message) || 'Could not send')); })
    .sendFeedback({kind: 'idea', player: CURRENT_PLAYER, text, page: 'avateer', game: 'avateer', level: 'proto', device: L.dev}); }

/* ---------- 🎁 av-wear4: 🎒 bag · 👗 my look · 🧱 map drops (LootKit + AvatarWear + LootWear) ----------
   speed page only: the bag + look live in localStorage (sp_avateer_bag / sp_avateer_look:<Name>) — R1 moves them into the GF.saves character.
   Touching a monster now also drops loot (a ⚠️ mini-boss roll, so the test always shows a drop) → hop to a free cell → 🌟 tier beam → 🧲 into the 🎒. */
const LW = (window.LootWear && window.Loot) ? {bag: null, look: {}, D: null, cool: new Map(), seed: 1} : null;
const LW_POOL = LW ? LootWear.IDS.filter(id => /^wear\.isl\./.test(id)) : [];
function lwSave(){ try { localStorage.setItem('sp_avateer_bag:' + ME.name, JSON.stringify(LW.bag.toJSON())); localStorage.setItem('sp_avateer_look:' + ME.name, JSON.stringify(LW.look)); } catch(e){} }
function lwLoad(){ let s = null, l = null; try { s = JSON.parse(localStorage.getItem('sp_avateer_bag:' + ME.name) || 'null'); l = JSON.parse(localStorage.getItem('sp_avateer_look:' + ME.name) || 'null'); } catch(e){}
  LW.bag = Loot.bag(s || {}); LW.look = l || {};
  if(!s){ ['head', 'body', 'feet'].forEach((sl, i) => { LW.bag.add({base: 'wear.isl.jungle.' + sl, tier: 0, lv: 1, seed: 11 + i, sock: 0, runes: []}); LW.bag.wear(LW.bag.g.length - 1, sl); }); lwSave(); } }
function lwDress(){ if(!LW) return; H.av = LootWear.dressFor(H.base || H.av, LW.bag, LW.look); }
function lwDrop(m, src){ if(!LW || !LW.D) return; const now = S.t || 0; if((LW.cool.get(m) || -9) > now - 3) return; LW.cool.set(m, now);
  const res = Loot.roll(src || (AvWorld.MON[m.id] && AvWorld.MON[m.id].mini ? 'boss' : 'mini'), {seed: 'av:' + ME.name + ':' + (LW.seed++), pool: LW_POOL, state: LW.bag.st, lv: 3, noMats: true});
  LW.bag.st = res.state; if(res.items.length) LW.D.addMany(res.items, {i: Math.floor(m.x), j: Math.floor(m.y)}, {t: now}); }
function lwStart(){ if(!LW) return; H.base = H.av; lwLoad(); lwDress();
  LW.D = LootWear.dropper(S.V, S.M, {to: () => ({x: H.it.x, y: H.it.y}), blocked: (i, j) => PROPS.some(p => Math.floor(p.x) === i && Math.floor(p.y) === j), calm: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),
    onBag: it => { const where = LW.bag.add(it); lwSave(); const p = S.V.toScreen(H.it.x, H.it.y, 5); LootWear.chip($('scr-play'), it, p.x, p.y, where); if(window.UISound) UISound.play('pop'); return where; }});
  $('t-bag').onclick = () => { if(window.Loot && Loot.react) Loot.react(); document.body.classList.add('lw-open');   // the page's ◀ buttons step aside while the bag is open (they sat on the bag header on phones)
    LootWear.bagSheet($('scr-play'), LW.bag, {av: H.base, look: LW.look, jobs: {knight: 7}, theme: 'gold', basic: true,
    onLook: l => { LW.look = l; lwDress(); lwSave(); }, onChange: () => { lwDress(); lwSave(); }, onClose: () => document.body.classList.remove('lw-open')}); };
  if(!document.getElementById('lw-av-css')){ const st = document.createElement('style'); st.id = 'lw-av-css'; st.textContent = 'body.lw-open #back-btn, body.lw-open #home-btn, body.lw-open #hud, body.lw-open #tools{visibility:hidden!important;}'; document.head.appendChild(st); }
  window.AV_WEAR = {LW, drop: (tier, n) => { const it = {base: LW_POOL[(LW.seed++ * 7) % LW_POOL.length], tier: tier | 0, lv: 3, seed: LW.seed, sock: 0, runes: []}; LW.D.addMany(new Array(n || 1).fill(0).map((_, k) => Object.assign({}, it, {seed: it.seed + k})), {i: Math.floor(H.x + 2), j: Math.floor(H.y)}, {t: S.t || 0}); }, dress: lwDress}; }
function lwFrame(t){ if(!LW || !LW.D) return; for(let i = S.items.length - 1; i >= 0; i--) if(S.items[i].drop) S.items.splice(i, 1); LW.D.update(t).forEach(it => S.items.push(it)); }

/* ---------- 🔧 boot ---------- */
async function boot(){
  const lb = p => { $('load-bar').style.width = Math.round(p * 100) + '%'; };
  buildWorld(); lb(0.25);
  H.av = heroAv(); PET.pics = [0, 1, 2, 3].map(f => pic('pet:ember:' + f, (g, x, y) => AvPets.draw(g, 'emberpup', 0, x, y, 52, {t: f * 0.25})));
  S.items.push(H.it, PET.it);
  S.V = Iso.view($('iso'), S.M, {bg: 'none', shadow: false, min: 0.35, max: 2.6}); S.V.resize(); lb(0.4);
  controls(); setCount(S.count); lwStart();
  const tall = S.V.H > S.V.W * 1.2, d = S.V.dpr || 1; S.V.zoom = Iso.stepFor((tall ? 1 : S.V.W > 1000 ? 1 : 0.8) * d) / d; S.V.follow(H.it); S.V.centerOn(H.x, H.y);   // a baked zoom step (an in-between zoom costs ~4× per frame)
  const pics = PROPS.map(p => p.pic).filter(Boolean).concat(PET.pics, ...Object.values(MPIC));
  await Iso.warm(pics, S.V, {onProgress: f => lb(0.4 + f * 0.6)});
  $('loading').style.opacity = 0; setTimeout(() => $('loading').classList.add('hidden'), 350);
  S.ready = true; S.loop = Iso.loop({update: step, render});
}
window.AVATEER = {S, H, PET, setCount, startRun, finishRun, heroTo, ROUTE, under: UN};
boot();
})();
