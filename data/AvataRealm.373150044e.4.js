
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
const GAME_ID = 'avatarealm';
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});
if(UI.KINDS && !UI.KINDS.avatarealm) UI.KINDS.avatarealm = ['🏰', 'Raising the towns', 'bob'];   // 🏰 runtime until the UiKit lane moves it in (Open questions)
if(UI.GAME_HELP && !UI.GAME_HELP.avatarealm) UI.GAME_HELP.avatarealm = ['🏰⚔️ Build your avatar town, train a little army of Minivatars and win the realm.', 'Tap the ground to send your army · ⚔️ Attack · 🛡️ Hold · drag + pinch to look around.', 'This is the speed test — ▶ runs it for 30 seconds.'];
UI.navBar(document.getElementById('back-btn'), {});
(function(){
'use strict';
const $ = id => document.getElementById(id);
// 🎭 the 6 test teams = 6 of the 12 sides (§14a), each town on its own IsoProps world look + territory floor (§10c) + team colour (§14j)
const SIDES = [
  {k: 'raptor', name: 'Raptor Ridge', icon: '🦖', look: 'jungle', team: 'blue', floor: 'dirt'},
  {k: 'bolt', name: 'Bolt Works', icon: '🤖', look: 'moon', team: 'red', floor: 'panel'},
  {k: 'kitchen', name: 'Kitchen Crew', icon: '🍳', look: 'cherry', team: 'gold', floor: 'tile'},
  {k: 'horde', name: 'Hungry Horde', icon: '🍽️', look: 'farm', team: 'green', floor: 'plank'},
  {k: 'dust', name: 'Dust Bunny Gang', icon: '🐰', look: 'desert', team: 'purple', floor: 'sand'},
  {k: 'cloud', name: 'Cloud Kingdom', icon: '☁️', look: 'snow', team: 'orange', floor: 'snow'}];
const BOTS = ['Robo', 'Mika', 'Nana', 'Ben', 'Zed', 'Pip'];
const ROLE_LIST = AR.KEYS;   // 12 roles + 👑 hero
const SIZE_OF = r => r === 'hero' ? 0.6 : 0.45, FRAMES = [0, 2, 4, 6];   // ≈ 36 px at zoom 1 (hero ≈ 48) · 4 of the 8 walk pictures (half the baking)
const S = {cfg: {size: 'L', towns: 6, n: 90}, M: null, V: null, map: null, items: [], props: [], uit: new Map(), sparks: [], ms: [], fpsT: [], ready: false, t: 0, run: null, pics: {}, frame: 0, flag: null, building: false};
AR.use({flow: Iso.flow});

/* ---------- 🧍 Minivatar pictures: your avatar (team 1) / a bot avatar + the ARMini role costume, baked once per role × team by Iso.avatar ---------- */
function myAv(){ let av = null; try{ const s = JSON.parse(localStorage.getItem('sp_av:' + CURRENT_PLAYER) || 'null'); if(s) av = s; }catch(e){} return fixAv(av || defaultAvatar(CURRENT_PLAYER || 'Aowu')); }
function picsFor(t, role){ const key = t + ':' + role; if(S.pics[key]) return S.pics[key]; const side = SIDES[t], name = t === 0 ? (CURRENT_PLAYER || 'Aowu') : BOTS[t - 1];
  const who = ARMini.mini(name, role, side.team, {av: t === 0 ? myAv() : defaultAvatar(name)});
  return S.pics[key] = FRAMES.map(f => Iso.avatar(who, {pose: 'walk', f, size: SIZE_OF(role)})); }

/* ---------- 🗺️ build the world: AR.land → IsoKit map · territory floors · 🌳 IsoProps towns + coin rocks / brick trees (stand-ins, §13k AR-1…3) ---------- */
function freshCanvas(){ const old = $('iso'), c = document.createElement('canvas'); c.id = 'iso'; old.parentNode.replaceChild(c, old); return c; }
function build(){ const C = S.cfg, L = AR.land({size: C.size, teams: C.towns, seed: 7}); S.land = L;
  const map = Iso.map({w: L.w, h: L.h, theme: 'meadow', seed: 7, cell: L.cell}); S.map = map; S.items = []; S.props = []; S.uit.clear(); S.sparks = [];
  const teams = [];
  const ctr = L.centre;
  L.starts.forEach((s, t) => { const side = SIDES[t];
    for(let j = s.j - 7; j <= s.j + 7; j++) for(let i = s.i - 8; i <= s.i + 8; i++){ const c = map.get(i, j); if(c && (c.t === 'grass' || c.t === 'flower') && !(c.fade < 1) && Math.hypot((i - s.i) / 8, (j - s.j) / 7) < 1) map.set(i, j, {t: side.floor}); }
    // ⚖️ fair start (Aowu 00:03): the 🏠 House stands ON the start spot with its door turned toward the middle, the same 🪙 🧱 pattern faces the middle,
    //    the decor town fills the land BEHIND (never in front of the door) — AR.fair() measures the walking steps
    let house = null; for(const key of ['inn', 'stilt']){ let best = null, bd = 1e9;   /* try the 4 turns one at a time (each removed again), keep the door nearest the middle */
      for(let turn = 0; turn < 4; turn++){ const it = Props.place(map, key, s.i - 1, s.j - 1, {look: side.look, turn}); if(!it) continue; const o = it.door && it.door.out, d = o ? Math.hypot(o.i + 0.5 - L.w / 2, o.j + 0.5 - L.h / 2) : 1e9; Props.remove(map, it); if(d < bd){ bd = d; best = turn; } }
      if(best != null){ house = Props.place(map, key, s.i - 1, s.j - 1, {look: side.look, turn: best}); if(house) break; } }
    if(house){ S.items.push(house); S.props.push(house); }
    const H = house ? {i: house.x, j: house.y, w: house.w, d: house.d} : {i: s.i - 1, j: s.j - 1, w: 2, d: 2};
    let door = house && house.door ? house.door.out : {i: s.i, j: s.j + 1}; if(!map.walk(door.i, door.j)) door = nearWalk(map, door.i, door.j);
    const fx = ctr.i - s.i, fy = ctr.j - s.j, fl = Math.hypot(fx, fy) || 1, avoid = [];
    for(let q = 0; q <= 6; q++) for(let w2 = -1; w2 <= 1; w2++) avoid.push([Math.round(door.i + fx / fl * q - fy / fl * w2), Math.round(door.j + fy / fl * q + fx / fl * w2)]);   /* the way out to the middle stays open */
    const res = []; AR.resSpots(map, door, ctr).forEach((p, q) => { for(let k = 0; k < 3; k++){ const c = AR.freeNear(map, p.x, p.y, door, (i, j) => Math.abs(i - door.i) + Math.abs(j - door.j) > 1 && !avoid.some(a => a[0] === i && a[1] === j)); if(!c) break;
        const it = Props.place(map, p.kind === 'c' ? 'mesarock' : 'mango', c.i, c.j, {look: p.kind === 'c' ? 'desert' : 'jungle', v: q % 3}); if(it){ S.items.push(it); S.props.push(it); res.push({kind: p.kind, i: it.x, j: it.y, n: 900}); avoid.push([it.x, it.y]); break; }
        avoid.push([c.i, c.j]); } });
    for(let j = H.j - 1; j <= H.j + H.d; j++) for(let i = H.i - 1; i <= H.i + H.w; i++) avoid.push([i, j]);
    const bx = Math.round(s.i - fx / fl * 6), by = Math.round(s.j - fy / fl * 6), area = {i: Math.max(1, bx - 7), j: Math.max(1, by - 6), w: 15, d: 13}; area.w = Math.min(area.w, L.w - 1 - area.i); area.d = Math.min(area.d, L.h - 1 - area.j);
    let T = null; try { T = Props.town(map, {size: 'hamlet', seed: 11 + t * 5, look: side.look, area, avoid, trees: 1}); } catch(e){ console.warn('town', e); }
    (T ? T.items : []).forEach(it => { S.items.push(it); S.props.push(it); });
    teams.push({side: side.k, color: ARMini.TEAM[side.team].c, house: H, door, res, human: t === 0, houseIt: house}); });
  S.fair = AR.fair(map, teams, ctr);
  S.teamInfo = teams;
  S.M = AR.newMatch({map, teams, level: 3, seed: 5, brawl: true, cap: Math.floor(C.n / C.towns)});
  syncUnits(1);
}
function nearWalk(map, i, j){ for(let r = 1; r < 6; r++) for(let dj = -r; dj <= r; dj++) for(let di = -r; di <= r; di++) if(map.inside(i + di, j + dj) && map.walk(i + di, j + dj)) return {i: i + di, j: j + dj}; return {i, j}; }
function mulberry(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- 🔁 engine units → IsoKit items (one stable item per unit; dead ones leave) ---------- */
function syncUnits(alpha){ const M = S.M, seen = S._seen || (S._seen = new Set()); seen.clear();
  for(const u of M.units){ seen.add(u.id); let it = S.uit.get(u.id);
    if(!it){ it = {x: u.x, y: u.y, z: 0, pic: null, u, unit: true}; S.uit.set(u.id, it); S.items.push(it); it.frames = picsFor(u.team, u.role); }
    let x = u.px + (u.x - u.px) * alpha, y = u.py + (u.y - u.py) * alpha;
    if(u.swing >= 0){ const p = Math.sin(Math.min(1, u.swing / 0.45) * Math.PI) * 0.22; x += u.dir * p * 0.7; y -= u.dir * p * 0.7; }   // ⚔️ lunge toward the foe (contact at the far point)
    it.x = x; it.y = y; it.z = S.map.heightAt(Math.floor(x), Math.floor(y)) + (u.fly ? 1.3 + Math.sin(S.t * 3 + u.id) * 0.15 : 0);
    it.pic = it.frames[u.moving ? Math.floor(u.walk / 0.571 * 4) % 4 : 0]; it.flip = u.dir < 0; }
  if(S.uit.size !== seen.size){ for(const [id, it] of S.uit) if(!seen.has(id)){ S.uit.delete(id); const k = S.items.indexOf(it); if(k >= 0) S.items.splice(k, 1); } } }

/* ---------- ⏱️ loop: engine at 30 / s, drawing every screen frame ---------- */
let lastHurt = new Map();
function step(dt){ const M = S.M; AR.step(M, dt);
  for(const u of M.units){ if(u.hurtT === M.t && lastHurt.get(u.id) !== M.t){ lastHurt.set(u.id, M.t); if(S.sparks.length < 60) S.sparks.push({x: u.x, y: u.y, z: u.fly ? 1.3 : 0, t: S.t, c: ARMini.TEAM[SIDES[u.team].team].c}); } }
  for(const e of AR.takeEvents(M)){ if(e.k === 'army.up' && e.team === 0) banner('🎉 Army +' + e.plus + '!'); if(e.k === 'match.win') banner('🏆 ' + SIDES[e.team].icon + ' ' + SIDES[e.team].name + ' wins!'); }
  if(lastHurt.size > 400) lastHurt = new Map();
  if(S.run) runStep(dt); }
function render(alpha, t){ S.t = t; S.frame++; syncUnits(alpha);
  Props.tick(S.props, t); if(S.frame % 6 === 0) Props.seeThrough(S.V, S.props, S.unitItems());
  const st = Iso.frame(S.V, {items: S.items, t, groundFx: rings, airFx: sparks, overlay: hudOver});
  if(S.mm && S.frame % 10 === 0) S.mm.draw();
  if(S.frame % 15 === 0) armyChip();
  meter(st); }
S.unitItems = () => { const a = []; S.uit.forEach(it => a.push(it)); return a; };
// 🔵 team ring under every Minivatar (part of the Minivatar look §13c) — one path per team, not one per unit
function rings(g, V){ const by = {}; S.uit.forEach(it => { const p = V.toScreen(it.x, it.y, S.map.heightAt(Math.floor(it.x), Math.floor(it.y))); if(p.x < -30 || p.y < -30 || p.x > V.W + 30 || p.y > V.H + 30) return;
    const c = ARMini.TEAM[SIDES[it.u.team].team].c, k = (it.u.role === 'hero' ? 1.35 : 1) * V.zoom; (by[c] || (by[c] = [])).push(p.x, p.y, k); });
  for(const c in by){ const a = by[c]; g.fillStyle = c; g.globalAlpha = 0.42; g.beginPath(); for(let q = 0; q < a.length; q += 3){ g.moveTo(a[q] + 11 * a[q + 2], a[q + 1]); g.ellipse(a[q], a[q + 1], 11 * a[q + 2], 4.6 * a[q + 2], 0, 0, 6.2832); } g.fill(); }
  g.globalAlpha = 1; if(S.M.teams[0].rally){ const r = S.M.teams[0].rally, p = V.toScreen(r.x, r.y, 0); g.strokeStyle = 'rgba(58,134,255,.9)'; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.ellipse(p.x, p.y, 34 * V.zoom, 15 * V.zoom, 0, 0, 6.2832); g.stroke(); g.setLineDash([]); } }
// 💥 contact sparks (0.3 s)
function sparks(g, V, t){ for(let q = S.sparks.length - 1; q >= 0; q--){ const s = S.sparks[q], a = (t - s.t) / 0.3; if(a > 1 || a < 0){ S.sparks.splice(q, 1); continue; }
    const p = V.toScreen(s.x, s.y, s.z), r = (6 + a * 10) * V.zoom, y = p.y - 18 * V.zoom; g.strokeStyle = s.c; g.globalAlpha = 1 - a; g.lineWidth = 2.2 * V.zoom; g.beginPath();
    for(let k = 0; k < 6; k++){ const an = k * 1.047 + s.x; g.moveTo(p.x + Math.cos(an) * r * 0.4, y + Math.sin(an) * r * 0.4); g.lineTo(p.x + Math.cos(an) * r, y + Math.sin(an) * r); } g.stroke(); }
  g.globalAlpha = 1; }
// ❤️ HP bars on hurt units (2 s) + 🏠 town pins with the house HP
function hudOver(g, V){ const M = S.M; g.lineWidth = 1;
  S.uit.forEach(it => { const u = it.u; if(M.t - u.hurtT > 2 || u.hp >= u.max) return; const p = V.toScreen(it.x, it.y, it.z), w = 22 * V.zoom, y = p.y - (u.role === 'hero' ? 52 : 42) * V.zoom - (u.role === 'rider' ? 12 * V.zoom : 0);
    if(p.x < -30 || p.y < -60 || p.x > V.W + 30 || p.y > V.H + 30) return; g.fillStyle = 'rgba(30,30,50,.6)'; g.fillRect(p.x - w / 2 - 1, y - 1, w + 2, 5); g.fillStyle = u.hp / u.max > 0.5 ? '#3DBE6A' : u.hp / u.max > 0.25 ? '#FFC21A' : '#FF4D6D'; g.fillRect(p.x - w / 2, y, w * Math.max(0, u.hp / u.max), 3); });
  S.teamInfo.forEach((T, t) => { const H = M.teams[t].house, p = V.toScreen(H.i + H.w / 2, H.j + H.d / 2, 0), y = p.y - 92 * V.zoom; if(p.x < -40 || p.x > V.W + 40 || y < -40 || y > V.H + 40) return;
    const c = ARMini.TEAM[SIDES[t].team].c, r = Math.max(11, 15 * V.zoom); g.fillStyle = '#fff'; g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.arc(p.x, y, r, 0, 6.2832); g.fill(); g.stroke();
    if(typeof emo === 'function') emo(g, SIDES[t].icon, p.x, y, r * 1.15);
    const w = r * 3; g.fillStyle = 'rgba(30,30,50,.55)'; g.fillRect(p.x - w / 2, y + r + 3, w, 5); g.fillStyle = c; g.fillRect(p.x - w / 2, y + r + 3, w * Math.max(0, H.hp / H.max), 5); });
  if(S.flag && M.teams[0].rally){ const r = M.teams[0].rally, p = V.toScreen(r.x, r.y, 0); S.flag.style.left = p.x + 'px'; S.flag.style.top = p.y + 'px'; } }
let lastShow = 0;
function meter(st){ const tn = performance.now(); S.ms.push(st.ms); S.fpsT.push(tn); while(S.fpsT.length && tn - S.fpsT[0] > 1000) S.fpsT.shift(); if(S.ms.length > 60) S.ms.shift();
  if(S.run){ S.run.frames.push(tn); S.run.draw.push(st.ms); S.run.level = Math.max(S.run.level, Iso.budget.level || 0); S.run.units = Math.max(S.run.units, S.uit.size); }
  if(tn - lastShow < 300) return; lastShow = tn; const avg = S.ms.reduce((a, b) => a + b, 0) / S.ms.length, fps = S.fpsT.length;
  $('m-ms').textContent = avg.toFixed(1); $('m-ms').className = avg < 8 ? 'good' : avg < 14 ? 'ok' : 'bad'; $('m-fps').textContent = fps; $('m-fps').className = fps >= 50 || (Iso.budget.fps === 30 && fps >= 28) ? 'good' : fps >= 28 ? 'ok' : 'bad';
  $('m-more').textContent = '👥 ' + S.uit.size + ' · 🏘️ ' + S.cfg.towns + ' · 🗺️ ' + S.cfg.size + ' ' + S.map.w + '×' + S.map.h + ' · 🖼️ ' + st.pics + ' pics · 🎚️ ' + Iso.budget.level + (Iso.budget.fps === 30 ? ' · 30 fps' : '') + ' · zoom ' + S.V.zoom.toFixed(2) + ' · 🧭 ' + S.M.flowsMade + ' flows · ⚖️ ' + fairTxt(); }
function fairTxt(){ const f = S.fair; return f ? 'middle ±' + Math.round(f.centre * 100) + '% · rival ±' + Math.round(f.enemy * 100) + '% · 🪙🧱 ±' + Math.round(f.res * 100) + '%' : '–'; }
function armyChip(){ const T = S.M.teams[0]; $('army-n').textContent = SIDES[0].icon + ' ' + AR.count(S.M, 0) + ' / ' + T.cap + ' · ' + (T.mode === 'attack' ? '⚔️ attacking' : T.mode === 'rally' ? '🚩 going' : '🛡️ holding');
  $('a-attack').classList.toggle('on', T.mode === 'attack'); $('a-hold').classList.toggle('on', T.mode === 'hold'); }
let banT = 0; function banner(txt){ const b = $('banner'); b.textContent = txt; b.classList.add('on'); clearTimeout(banT); banT = setTimeout(() => b.classList.remove('on'), 1600); }

/* ---------- 🕹️ controls: tap ground = 🚩 rally · ⚔️ attack · 🛡️ hold · picks (size · towns · units) rebuild the world ---------- */
function controls(){
  S.flag = $('flag');
  $('a-attack').onclick = () => { AR.order(S.M, 0, {attack: true}); S.M.youMoved = true; S.flag.classList.remove('on'); armyChip(); };
  $('a-hold').onclick = () => { AR.order(S.M, 0, {hold: true}); S.flag.classList.remove('on'); armyChip(); };
  $('hud').addEventListener('click', e => e.currentTarget.classList.toggle('open'));
  $('t-home').onclick = () => { const H = S.M.teams[0].house; S.V.follow(null); S.V.centerOn(H.i + H.w / 2, H.j + H.d / 2); };
  const pick = (sel, attr, fn) => document.querySelectorAll(sel).forEach(b => b.addEventListener('click', () => { if(S.run || S.building) return; fn(b.dataset[attr]); }));
  pick('#sizes [data-size]', 'size', v => { const c = Object.assign({}, S.cfg, {size: v}); if(v !== 'L' && c.towns > 2) c.towns = 2; rebuild(c); });   // 5–6 teams need the L map (§14j)
  pick('#towns [data-towns]', 'towns', v => { const c = Object.assign({}, S.cfg, {towns: +v}); if(+v > 2) c.size = 'L'; rebuild(c); });
  pick('#counts [data-n]', 'n', v => { S.cfg.n = +v; S.M.capOverride = Math.floor(S.cfg.n / S.cfg.towns); S.M.teams.forEach(T => { T.cap = S.M.capOverride; }); trimTo(); marks(); });
  $('t-run').onclick = startRun; $('r-again').onclick = () => { $('result').classList.add('hidden'); startRun(); }; $('r-close').onclick = () => $('result').classList.add('hidden'); $('r-send').onclick = sendResult;
  layoutPads(); addEventListener('resize', () => requestAnimationFrame(layoutPads));
  setTimeout(() => { $('tip').style.opacity = 0; }, 8000); }
function bindView(){ S.V.onTap = cell => { if(!cell || S.run) return; AR.order(S.M, 0, {go: {x: cell.i + 0.5, y: cell.j + 0.5}}); S.M.youMoved = true; S.flag.classList.add('on'); armyChip(); if(window.UISound) UISound.play('tap'); }; }
function trimTo(){ const M = S.M; M.teams.forEach((T, t) => { let n = AR.count(M, t); for(let k = M.units.length - 1; k >= 0 && n > T.cap; k--){ const u = M.units[k]; if(u.team === t && u.role !== 'hero' && u.role !== 'worker'){ u.dead = true; n--; } } }); }
function marks(){ const C = S.cfg; document.querySelectorAll('#sizes [data-size]').forEach(b => b.classList.toggle('on', b.dataset.size === C.size)); document.querySelectorAll('#towns [data-towns]').forEach(b => b.classList.toggle('on', +b.dataset.towns === C.towns)); document.querySelectorAll('#counts [data-n]').forEach(b => b.classList.toggle('on', +b.dataset.n === C.n)); }
function layoutPads(){ const tools = $('tools'), hud = $('hud'), back = $('back-btn'); tools.style.top = '';
  const tb = tools.getBoundingClientRect(), hb = hud.getBoundingClientRect(), bb = back.getBoundingClientRect();
  if([hb, bb].some(q => q.left < tb.right && tb.left < q.right && q.top < tb.bottom && tb.top < q.bottom)) tools.style.top = Math.round(Math.max(hb.bottom, bb.bottom) + 8) + 'px';
  const tb2 = tools.getBoundingClientRect(); $('tip').style.top = Math.round(tb2.bottom + 8) + 'px';
  // the minimap + army chip never touch: on narrow screens the minimap shrinks
  const ar = $('army').getBoundingClientRect(), mm = $('mini'); mm.style.width = mm.style.height = ''; const mr = mm.getBoundingClientRect();
  if(mr.left < ar.right + 8){ const w = Math.max(88, Math.round(innerWidth - ar.right - 8 - (innerWidth - mr.right))); mm.style.width = w + 'px'; mm.style.height = Math.round(w * 0.66) + 'px'; }
  if(S.V){ const t = Math.max(hb.bottom, tb2.bottom) + 6, b = innerHeight - Math.min(ar.top, mm.getBoundingClientRect().top) + 6; S.V.setPad({t: Math.round(t), b: Math.round(Math.min(b, innerHeight * 0.4))}); } }

/* ---------- ▶ the 30 s speed test: the battle keeps going, the camera tours every town + the middle ---------- */
function startRun(){ if(S.run || S.building) return; $('result').classList.add('hidden'); const L = S.land, way = L.starts.map(s => ({x: s.i, y: s.j})); way.splice(1, 0, {x: L.w / 2, y: L.h / 2}); way.push({x: L.w / 2, y: L.h / 2});
  S.tour = {x: way[0].x, y: way[0].y}; S.V.follow(S.tour); S.run = {t: 0, dur: Number(window.AR_RUN_S) || 30, frames: [], draw: [], level: 0, units: 0, way, wi: 1};
  document.body.classList.add('running'); $('runbar').classList.remove('hidden'); }
function runStep(dt){ const R = S.run; R.t += dt; const seg = R.dur / R.way.length, k = Math.min(R.way.length - 1, Math.floor(R.t / seg)), a = R.way[k], b = R.way[Math.min(R.way.length - 1, k + 1)], f = Math.min(1, (R.t - k * seg) / seg), e = f * f * (3 - 2 * f);
  S.tour.x = a.x + (b.x - a.x) * e; S.tour.y = a.y + (b.y - a.y) * e;
  if(Math.floor(R.t * 2) !== Math.floor((R.t - dt) * 2)){ $('run-txt').textContent = '⏱️ Speed test… ' + Math.max(0, Math.ceil(R.dur - R.t)) + ' s · 👥 ' + S.uit.size; $('run-bar').style.width = Math.min(100, R.t / R.dur * 100) + '%'; }
  if(R.t >= R.dur) finishRun(); }
function device(){ const ua = navigator.userAgent, ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const os = ipad ? 'iPad' : /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'Mac' : 'Other';
  const br = /CriOS|Chrome\//.test(ua) && !/Edg\//.test(ua) ? 'Chrome' : /Edg\//.test(ua) ? 'Edge' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'browser';
  return os + ' · ' + br + ' · ' + screen.width + '×' + screen.height + ' · ' + innerWidth + '×' + innerHeight + ' · dpr ' + (devicePixelRatio || 1); }
function finishRun(){ const R = S.run; S.run = null; document.body.classList.remove('running'); $('runbar').classList.add('hidden'); S.V.follow(null);
  const f = R.frames, n = f.length, secs = n > 1 ? (f[n - 1] - f[0]) / 1000 : 1, gaps = []; for(let i = 1; i < n; i++) gaps.push(f[i] - f[i - 1]); gaps.sort((a, b) => a - b);
  const p99 = gaps.length ? gaps[Math.min(gaps.length - 1, Math.floor(gaps.length * 0.99))] : 1000, avg = n > 1 ? (n - 1) / secs : 0, low = 1000 / p99, draw = R.draw.reduce((a, b) => a + b, 0) / Math.max(1, R.draw.length);
  const cap = Iso.budget.fps || 60, good = avg >= cap * 0.83 && low >= cap * 0.5, ok = avg >= 25, C = S.cfg;
  S.last = {avg: Math.round(avg), low: Math.round(low), draw: +draw.toFixed(1), level: Iso.budget.level, maxLevel: R.level, cap, units: R.units, secs: Math.round(secs), dev: device(), size: C.size + ' ' + S.map.w + '×' + S.map.h, towns: C.towns, props: S.props.length, budget: Iso.budget.units, flows: S.M.flowsMade, fair: fairTxt()};
  $('r-grade').textContent = good ? '🟢' : ok ? '🟡' : '🔴'; $('r-title').textContent = good ? 'Smooth!' : ok ? 'OK — a bit slow' : 'Too slow';
  $('r-sub').textContent = good ? 'AvataRealm can run ' + S.last.units + ' Minivatars + ' + C.towns + ' towns here.' : ok ? 'Playable — R1 keeps fewer units on screen.' : 'R1 must draw less — the 📤 numbers tell me where.';
  $('r-fps').textContent = S.last.avg + (cap === 30 ? ' / 30' : ''); $('r-low').textContent = S.last.low; $('r-ms').textContent = S.last.draw; $('r-lv').textContent = S.last.level + ' / 4';
  $('r-dev').textContent = S.last.dev + ' · 🗺️ ' + S.last.size + ' · 🏘️ ' + C.towns + ' towns (' + S.last.props + ' props) · 👥 ' + S.last.units + ' Minivatars · ' + S.last.secs + ' s';
  $('r-send').disabled = false; $('r-send').innerHTML = '📤 Send to Claude'; $('result').classList.remove('hidden'); if(window.UISound) UISound.play(good ? 'win' : 'pop'); }
function sendResult(){ const L = S.last, b = $('r-send'); if(!L) return;
  const text = '🧪 AvataRealm speed test (ar-r0b): ' + L.avg + ' fps average (cap ' + L.cap + ') · slowest 1 % ' + L.low + ' fps · ' + L.draw + ' ms a frame · quality level ' + L.level + ' (max ' + L.maxLevel + ') · map ' + L.size + ' · ' + L.towns + ' towns (' + L.props + ' props) · ' + L.units + ' Minivatars (unit budget ' + L.budget + ') · ' + L.flows + ' flow fields · ⚖️ fair starts ' + L.fair + ' · ' + L.secs + ' s';
  UI.busy(b, 'avatarealm', 'Sending…');
  google.script.run.withSuccessHandler(() => { UI.idle(b); b.textContent = '✅ Sent — thank you!'; b.disabled = true; if(UI.toast) UI.toast('📤 Sent — the AvataRealm chat will read it'); })
    .withFailureHandler(e => { UI.idle(b); if(UI.toast) UI.toast('⚠️ ' + ((e && e.message) || 'Could not send')); })
    .sendFeedback({kind: 'idea', player: CURRENT_PLAYER, text, page: 'avatarealm', game: 'avatarealm', level: 'proto', device: L.dev}); }

/* ---------- 🔧 boot + rebuild (a new size / town count = a fresh map, canvas and view) ---------- */
async function rebuild(cfg){ if(S.building) return; S.building = true; S.ready = false; if(S.loop){ S.loop.stop(); S.loop = null; }
  S.cfg = cfg || S.cfg; marks(); const lb = p => { $('load-bar').style.width = Math.round(p * 100) + '%'; };
  $('loading').classList.remove('hidden'); $('loading').style.opacity = 1; $('load-text').textContent = 'Building ' + S.cfg.towns + ' towns on a ' + S.cfg.size + ' island…'; lb(0.05);
  await new Promise(r => setTimeout(r, 30));
  await new Promise(res => Props.need(SIDES.slice(0, S.cfg.towns).map(s => s.look), () => res()));
  build(); lb(0.2);
  S.V = Iso.view(freshCanvas(), S.map, {bg: 'none', shadow: true, min: 0.3, max: 2.4}); S.V.resize(); bindView(); layoutPads();
  const small = Math.min(innerWidth, innerHeight) < 600, d = S.V.dpr || 1; S.V.zoom = Iso.stepFor((small ? 0.75 : 1) * d) / d;   // a baked zoom step (an in-between zoom costs ~4× per frame)
  const H = S.M.teams[0].house; S.V.centerOn(H.i + H.w / 2 + 4, H.j + H.d / 2);
  S.mm = Iso.minimap($('mini-cv'), S.map, S.V, {dots: () => { const a = []; S.uit.forEach(it => a.push({x: it.x, y: it.y, c: ARMini.TEAM[SIDES[it.u.team].team].c})); return a; }});
  const pics = []; for(let t = 0; t < S.cfg.towns; t++) ROLE_LIST.forEach(r => pics.push(...picsFor(t, r)));
  lb(0.3); await Props.warm(S.props, S.V, {onProgress: f => lb(0.3 + f * 0.3)});
  await Iso.warm(pics, S.V, {onProgress: f => lb(0.6 + f * 0.4)});
  $('loading').style.opacity = 0; setTimeout(() => $('loading').classList.add('hidden'), 350);
  S.building = false; S.ready = true; S.loop = Iso.loop({update: step, render}); armyChip(); }
window.AVATAREALM = {S, SIDES, rebuild, startRun, finishRun, AR};
controls(); rebuild();
})();
