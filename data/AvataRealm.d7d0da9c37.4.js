
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
const GAME_ID = 'avatarealm';
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});
if(UI.KINDS && !UI.KINDS.avatarealm) UI.KINDS.avatarealm = ['🏰', 'Raising the towns', 'bob'];   // 🏰 runtime until the UiKit lane moves it in (Open questions)
if(UI.GAME_HELP && !UI.GAME_HELP.avatarealm) UI.GAME_HELP.avatarealm = ['🏰⚔️ Build your avatar town, train a little army of Minivatars and knock down the rival House.', 'Bricklets gather by themselves · 🏗️ build · 👥 train · tap your units, then the ground or a rival · 🪢 Lasso picks many · drag the 🚩 banner to send them · drag + pinch to look around.', '🔱 beats 🐴 · 🐴 beats 🏹 · 🏹 beats 🛡️ · 🛡️ beats 🔱 — a ⚡ means a counter hit.'];
(function(){
'use strict';
const $ = id => document.getElementById(id);
/* ---------- 🎭 R1 sides (plan §2 ② + §14a/b) — names only; the art is the 🌳 IsoProps AR-1 look files raptor · bolt ---------- */
const SIDE = {
  raptor: {k: 'raptor', name: 'Raptor Ridge', icon: '🦖', res: {c: ['🟠', 'Amber Pebbles'], b: ['🌿', 'Fern Bundles']},
    bld: {house: 'Twig Nest', camp: 'Bone-fence Yard', ride: 'Rex Stable', nest: 'Ptera Cliff', care: 'Fern Hollow', workshop: 'Boulder Pit', tower: 'Tall-tree Lookout', wardrobe: 'Leaf Weaver'},
    house: ['Twig Nest', 'Fern Hut', 'Volcano-rock Fort'],
    role: {worker: 'Eggsplorer', foot: 'Stompling', spear: 'Horn-a-tops', archer: 'Pebble Spitter', rider: 'Rex Rider', flyer: 'Ptera-Pal', healer: 'Fern Doc', siege: 'Ankylo-Roller', hero: 'Rex King'}},
  bolt: {k: 'bolt', name: 'Bolt Works', icon: '🤖', res: {c: ['🔩', 'Bolts'], b: ['🔲', 'Scrap Plates']},
    bld: {house: 'Crate-bot', camp: 'Assembly Line', ride: 'Garage Bay', nest: 'Drone Pad', care: 'Oil Station', workshop: 'Magnet Plant', tower: 'Laser Turret', wardrobe: 'Paint Shop'},
    house: ['Crate-bot', 'Workshop Dome', 'Command Tower'],
    role: {worker: 'Scrapbot', foot: 'Clankster', spear: 'Drillbot', archer: 'Zap-Pip', rider: 'Wheelie Mech', flyer: 'Drone-y', healer: 'Fixit Oiler', siege: 'Mega Magnet', hero: 'Robo Boss'}}};
const ROLE = {worker: ['⛑️', 'Bricklet'], foot: ['🛡️', 'Stomper'], spear: ['🔱', 'Pokelancer'], archer: ['🏹', 'Twangster'], rider: ['🐴', 'Saddlebuddy'], flyer: ['🪽', 'Flapper'], healer: ['🩹', 'Patchie'], siege: ['🛞', 'Bonkwagon'], hero: ['👑', 'Hero']};
const SLOT_ICON = {house: '🏠', camp: '🏕️', ride: '🎠', nest: '🪽', care: '🩹', workshop: '🔧', tower: '🗼', wardrobe: '🎨'};
const FIGHT = ['hero', 'foot', 'spear', 'archer', 'rider', 'flyer', 'healer', 'siege'];
const TRAIN = ['worker', 'foot', 'spear', 'archer', 'rider', 'flyer', 'healer', 'siege'];
const LEVEL_NAMES = ['🌱 Basic', '🐣 Junior', '🔦 Intermediate', '🔥 Hard', '🌋 Extreme', '💀 Hardcore'];
const WHY = {ground: '🌊 Needs open ground', territory: '🟩 Build on your own land', close: '↔️ Leave one free tile', door: '🚪 The door needs room', units: '⚔️ Rivals stand there', seal: '🚧 That blocks your way out', cost: '🪙 Not enough yet', locked: '🔒 Later level', slot: '–'};
const BOTS = ['Robo', 'Mika', 'Nana', 'Ben', 'Zed'];
const qs = new URLSearchParams(location.search);
const pq = k => qs.get(k);
const S = {cfg: {size: pq('size') || 'M', teams: Math.max(2, Math.min(6, +pq('teams') || 2)), level: Math.max(0, Math.min(5, +(pq('lv') || 0))), side: pq('side') === 'bolt' ? 'bolt' : 'raptor', seed: +(pq('seed') || 7)},
  M: null, V: null, map: null, items: [], props: [], uit: new Map(), sparks: [], pics: {}, who: {}, acts: 0, frame: 0, t: 0, ready: false, paused: false, sel: new Set(), tab: 'build', ghost: null, arm: null, box: null, terr: null, faceC: {}, lastUI: 0};
AR.use({flow: Iso.flow});
const teamKey = t => Props.AR.TEAM_ORDER[t % 6], teamHex = t => Props.AR.TEAMS[teamKey(t)];
const sideOf = t => SIDE[S.M ? S.M.teams[t].side : (t === 0 ? S.cfg.side : (S.cfg.side === 'raptor' ? 'bolt' : 'raptor'))];

/* ---------- 🧍 Minivatar pictures: your avatar (team 0) / a bot avatar + the ARMini role costume, baked once per role × team ---------- */
function myAv(){ let av = null; try{ const s = JSON.parse(localStorage.getItem('sp_av:' + CURRENT_PLAYER) || 'null'); if(s) av = s; }catch(e){} return fixAv(av || defaultAvatar(CURRENT_PLAYER || 'Aowu')); }
const MINI_TEAM = ['blue', 'red', 'gold', 'green', 'purple', 'orange'];
function whoFor(t, role){ const name = t === 0 ? (CURRENT_PLAYER || 'Aowu') : BOTS[(t - 1) % BOTS.length]; return ARMini.mini(name, role, MINI_TEAM[t % 6], {av: t === 0 ? myAv() : defaultAvatar(name)}); }
/* 🎬 baked beat pictures (§16e): each swing plays a shared beat act through Iso.act (ready → anticipation → CONTACT → follow-through) — the engine's
   contact tick (AR WIND = 0.2 s after the swing starts) is the act's contact; pictures are baked once per role × team × beat frame by IsoKit */
const ACTS = {worker: 'move.punch.hammer', foot: 'move.slash.chop', spear: 'move.slash.thrust', archer: 'move.throw.bow', flyer: 'move.throw.sling', healer: 'move.power.heal',
  siege: 'move.punch.hammer', hero: 'move.slash.cross', mage: 'move.cast.bolt', spy: 'move.slash.flurry', tamer: 'move.cast.skycall', saint: 'move.cast.pray'};   // 🐴 rider keeps the lunge (an act would leave the horse behind)
const actOf = role => { const k = ACTS[role]; return k && typeof Acting !== 'undefined' && Acting.has && Acting.has('acts', k) ? k : null; };
function whoOf(t, role){ const key = t + ':' + role; return S.who[key] || (S.who[key] = whoFor(t, role)); }
function picsFor(t, role){ const key = t + ':' + role; if(S.pics[key]) return S.pics[key]; const who = whoOf(t, role);
  return S.pics[key] = [0, 2, 4, 6].map(f => Iso.avatar(who, {pose: 'walk', f, size: role === 'hero' ? 0.6 : 0.45})); }

/* ---------- 🗺️ world: AR.land → IsoKit map · 🌳 AR-1 House + 🪙 coin rocks / 🧱 brick trees on the same pattern from every door · jungle decor ---------- */
function freshCanvas(){ const old = $('iso'), c = document.createElement('canvas'); c.id = 'iso'; old.parentNode.replaceChild(c, old); return c; }
function addItem(it){ if(it){ S.items.push(it); S.props.push(it); } return it; }
function dropItem(it){ let k = S.items.indexOf(it); if(k >= 0) S.items.splice(k, 1); k = S.props.indexOf(it); if(k >= 0) S.props.splice(k, 1); }
const PLACER = {
  place(map, slot, f, T, build){ return addItem(Props.place(map, Props.AR.key(T.side, slot), f.i, f.j, {turn: f.turn, team: T.color, build: build || 0})); },
  remove(map, slot, f, it){ if(it){ Props.remove(map, it); dropItem(it); } }};
function build(){ const C = S.cfg, L = AR.land({size: C.size, teams: C.teams, seed: C.seed}); S.land = L;
  const map = Iso.map({w: L.w, h: L.h, theme: 'meadow', seed: C.seed, cell: L.cell}); S.map = map; S.items = []; S.props = []; S.uit.clear(); S.sparks = []; S.sel.clear();
  const ctr = L.centre, teams = [];
  L.starts.forEach((s, t) => { const side = t === 0 ? C.side : (t % 2 ? (C.side === 'raptor' ? 'bolt' : 'raptor') : C.side), key = Props.AR.key(side, 'house');
    let best = null, bd = 1e9; for(let turn = 0; turn < 4; turn++){ const it = Props.place(map, key, s.i - 1, s.j - 1, {turn, team: teamHex(t), state: '1'}); if(!it) continue; const o = it.door && it.door.out, d = o ? Math.hypot(o.i + 0.5 - ctr.i, o.j + 0.5 - ctr.j) : 1e9; Props.remove(map, it); if(d < bd){ bd = d; best = turn; } }
    const house = addItem(Props.place(map, key, s.i - 1, s.j - 1, {turn: best || 0, team: teamHex(t), state: '1'}));
    const H = {i: house.x, j: house.y, w: house.w, d: house.d, turn: house.turn}; let door = house.door ? house.door.out : {i: s.i, j: s.j + 2}; if(!map.walk(door.i, door.j)) door = AR.freeNear(map, door.i + 0.5, door.j + 0.5, s) || door;
    const res = []; AR.resSpots(map, door, ctr).forEach(p => { const c = AR.freeNear(map, p.x, p.y, door, (i, j) => Math.abs(i - door.i) + Math.abs(j - door.j) > 1 && !(i >= H.i - 1 && i <= H.i + H.w && j >= H.j - 1 && j <= H.j + H.d)); if(!c) return;
      const it = addItem(Props.place(map, p.kind === 'c' ? 'coinrock' : 'bricktree', c.i, c.j, {look: side, v: res.length % 3, state: 'full'})); if(it) res.push({kind: p.kind, i: it.x, j: it.y, n: 300, it}); });
    teams.push({side, color: teamHex(t), house: H, door, res, human: t === 0, houseIt: house}); });
  const rich = []; (L.rich || []).forEach(p => { const c = AR.freeNear(map, p.x + 0.5, p.y + 0.5, ctr); if(!c) return; const it = addItem(Props.place(map, 'coinrock', c.i, c.j, {look: 'realm', v: 1, state: 'full'})); if(it) rich.push({kind: 'c', i: c.i, j: c.j, n: 600, it}); });
  decor(map, L, teams);
  S.M = AR.newMatch({map, teams, level: C.level, seed: C.seed, placer: PLACER, rich});
  S.M.teams.forEach((T, t) => { T.res.forEach((r, q) => { r.it = teams[t].res[q].it; }); }); S.M.rich.forEach((r, q) => { r.it = rich[q] && rich[q].it; });
  S.M.blds.forEach(b => { if(b.slot === 'house') b.it = teams[b.team].houseIt; });
  S.terr = null; syncUnits(1); }
// 🌴 jungle decor far from every town + the middle lanes (never inside a territory: towns grow there)
function decor(map, L, teams){ const keys = ['palm', 'bush', 'fern', 'rock', 'flowerpot'].filter(k => { try{ return !!Props.list().find(p => p.key === k); }catch(e){ return false; } }); if(!keys.length) return;
  const far = (i, j) => teams.every(T => Math.hypot(i - T.house.i, j - T.house.j) > 11) && Math.hypot(i - L.centre.i, j - L.centre.j) > 6;
  let n = 0; for(let j = 2; j < L.h - 2; j++) for(let i = 2; i < L.w - 2; i++){ const c = map.get(i, j); if(!c || c.t === 'void' || c.fade < 1 || !map.walk(i, j) || !far(i, j)) continue;
    const h = Math.abs(Math.sin(i * 12.9898 + j * 78.233 + S.cfg.seed) * 43758.5453) % 1; if(h > 0.045) continue; if(addItem(Props.place(map, keys[n % keys.length], i, j, {look: 'jungle', v: n % 3}))) n++; } }

/* ---------- 🔁 engine units → IsoKit items (one stable item per unit; dead ones leave) ---------- */
function syncUnits(alpha){ const M = S.M, seen = S._seen || (S._seen = new Set()); seen.clear();
  for(const u of M.units){ if(u.dead) continue; seen.add(u.id); let it = S.uit.get(u.id);
    if(!it){ it = {x: u.x, y: u.y, z: 0, pic: null, u, unit: true}; S.uit.set(u.id, it); S.items.push(it); it.frames = picsFor(u.team, u.role); }
    let x = u.px + (u.x - u.px) * alpha, y = u.py + (u.y - u.py) * alpha;
    const ak = u.swing >= 0 && !u.fly ? actOf(u.role) : null;
    if(ak && (it.sw == null || it.sw < 0 || u.swing < it.sw)){ const h = u.hit || {}, B = h.b != null ? M.blds.find(b => b.id === h.b) : null, o = h.id != null ? M.byId.get(h.id) : null, tg = B ? {x: B.i + B.w / 2, y: B.j + B.d / 2} : o ? {x: o.x, y: o.y} : null, sp = S.speed || 1;
      Iso.act(it, whoOf(u.team, u.role), ak, {t: S.t, contactAt: S.t + Math.max(0, AR.WIND - u.swing) / sp, speed: sp, size: u.role === 'hero' ? 0.6 : 0.45, target: tg}); S.acts = (S.acts || 0) + 1; }
    it.sw = u.swing;
    if(u.swing >= 0 && !ak){ const p = Math.sin(Math.min(1, u.swing / 0.45) * Math.PI) * 0.22; x += u.dir * p * 0.7; y -= u.dir * p * 0.7; }
    it.x = x; it.y = y; it.z = S.map.heightAt(Math.floor(x), Math.floor(y)) + (u.fly ? 1.3 + Math.sin(S.t * 3 + u.id) * 0.15 : 0);
    it.pic = it.frames[u.moving ? Math.floor(u.walk / 0.571 * 4) % 4 : 0]; it.flip = u.dir < 0; }
  if(S.uit.size !== seen.size){ for(const [id, it] of S.uit) if(!seen.has(id)){ S.uit.delete(id); S.sel.delete(id); const k = S.items.indexOf(it); if(k >= 0) S.items.splice(k, 1); } } }

/* ---------- ⏱️ engine events → the AR-1 props (🏗️ 33 · 66 · 100 · 🏠 levels · 🪙🧱 states · 🏚️ ruins) ---------- */
function events(){ const M = S.M; for(const e of AR.takeEvents(M)){
    if(e.k === 'build.step' || e.k === 'build.done'){ const b = M.blds.find(x => x.id === e.b); if(b && b.it) Props.AR.set(b.it, {build: e.k === 'build.done' ? 100 : e.pct}, M.map); if(e.k === 'build.done') S.terr = null; }
    else if(e.k === 'house.up'){ const b = M.blds.find(x => x.id === e.b); if(b && b.it){ b.it.state = String(e.lv); Props.AR.set(b.it, {}, M.map); } }
    else if(e.k === 'res.state'){ const r = M.teams.flatMap(T => T.res).concat(M.rich).find(q => q.i === e.i && q.j === e.j); if(r && r.it){ r.it.state = e.state; Props.AR.set(r.it, {}, M.map); } }
    else if(e.k === 'build.place') S.terr = null;
    else if(e.k === 'counter.hit' && e.team === 0) S.ctrT = M.t;
    else if(e.k === 'match.win') UI.toast && UI.toast('🏆 ' + sideOf(e.team).icon + ' ' + sideOf(e.team).name + ' wins!'); }
  for(const b of M.blds) if(b.hp <= 0 && b.it && !b.ruined){ b.ruined = true; b.it.cond = 'ruined'; Props.AR.set(b.it, {}, M.map); } }
let lastHurt = new Map();
function step(dt){ if(S.paused || !S.M) return; const M = S.M; AR.step(M, dt * (S.speed || 1));
  for(const u of M.units){ if(u.hurtT === M.t && lastHurt.get(u.id) !== M.t){ lastHurt.set(u.id, M.t); if(S.sparks.length < 60) S.sparks.push({x: u.x, y: u.y, z: u.fly ? 1.3 : 0, t: S.t, c: teamHex(u.team)}); } }
  if(lastHurt.size > 400) lastHurt = new Map(); events(); }
function render(alpha, t){ S.t = t; S.frame++; syncUnits(alpha);
  Props.tick(S.props, t); if(S.frame % 6 === 0) Props.seeThrough(S.V, S.props, unitItems());
  const items = S.ghost && S.ghost.it ? S.items.concat([S.ghost.it]) : S.items;
  Iso.frame(S.V, {items, t, groundFx, airFx: sparks, overlay});
  if(S.mm && S.frame % 10 === 0) S.mm.draw();
  if(t - S.lastUI > 0.25){ S.lastUI = t; hud(); } placeDom(); }
const unitItems = () => { const a = []; S.uit.forEach(it => a.push(it)); return a; };

/* ---------- 🎨 ground: 🟩 territory floors (Props.AR.FLOORS) · rings under Minivatars (🟡 picked) · 👻 ghost footprint · 🌱 glowing spot · 🚩 rally ---------- */
function territory(){ const M = S.M; if(S.terr && S.terr.ver === M.blds.length + ':' + M.blds.filter(b => b.done).length) return S.terr.cells;
  const own = new Map(); M.teams.forEach((T, t) => { if(!T.alive) return; for(const b of T.blds){ if(b.hp <= 0) continue; const R = 2; for(let j = b.j - R; j < b.j + b.d + R; j++) for(let i = b.i - R; i < b.i + b.w + R; i++){ const c = M.map.get(i, j); if(!c || c.t === 'void' || c.t === 'water' || c.fade < 1) continue; const k = j * M.map.w + i; if(!own.has(k)) own.set(k, t); } } });
  const cells = []; own.forEach((t, k) => cells.push([k % M.map.w, (k / M.map.w) | 0, t])); S.terr = {ver: M.blds.length + ':' + M.blds.filter(b => b.done).length, cells}; return cells; }
function groundFx(g, V){ const M = S.M, s = V.zoom;
  for(const [i, j, t] of territory()){ const p = V.toScreen(i + 0.5, j + 0.5, 0); if(p.x < -40 || p.y < -30 || p.x > V.W + 40 || p.y > V.H + 30) continue; const F = Props.AR.FLOORS[M.teams[t].side]; if(!F) continue;
    const q = (u, v) => { const r = V.toScreen(i + u, j + v, 0); return [r.x, r.y]; }; g.save(); g.globalAlpha = 0.9; try{ F.paint(g, q, s, i, j); }catch(e){} g.restore(); }
  const by = {}; S.uit.forEach(it => { const p = V.toScreen(it.x, it.y, S.map.heightAt(Math.floor(it.x), Math.floor(it.y))); if(p.x < -30 || p.y < -30 || p.x > V.W + 30 || p.y > V.H + 30) return;
    const c = S.sel.has(it.u.id) ? 'sel' : teamHex(it.u.team), k = (it.u.role === 'hero' ? 1.35 : 1) * s; (by[c] || (by[c] = [])).push(p.x, p.y, k); });
  for(const c in by){ const a = by[c]; g.beginPath(); for(let q = 0; q < a.length; q += 3){ g.moveTo(a[q] + 11 * a[q + 2], a[q + 1]); g.ellipse(a[q], a[q + 1], 11 * a[q + 2], 4.6 * a[q + 2], 0, 0, 6.2832); }
    if(c === 'sel'){ g.fillStyle = 'rgba(255,214,60,.45)'; g.fill(); g.strokeStyle = '#FFC21A'; g.lineWidth = 2.4 * s; g.stroke(); } else { g.fillStyle = c; g.globalAlpha = 0.45; g.fill(); g.globalAlpha = 1; } }
  const gd = S.guide; if(gd && gd.spot && gd.slot && (!S.ghost || S.ghost.slot !== gd.slot || S.ghost.i !== gd.spot.i || S.ghost.j !== gd.spot.j)){ const f = AR.foot(gd.slot, gd.spot.i, gd.spot.j, gd.spot.turn), a = 0.45 + 0.35 * Math.sin(S.t * 5);
    diamond(g, V, f, 'rgba(94,224,160,' + (a * 0.5) + ')', 'rgba(34,168,103,' + (0.6 + a * 0.4) + ')', 3); }
  if(S.ghost){ const G = S.ghost, f = AR.foot(G.slot, G.i, G.j, G.turn), ok = G.ok === true; diamond(g, V, f, ok ? 'rgba(94,224,160,.42)' : 'rgba(255,77,109,.38)', ok ? '#22A867' : '#E5484D', 2.5);
    if(f.door){ const p = V.toScreen(f.door.i + 0.5, f.door.j + 0.5, 0); g.fillStyle = ok ? 'rgba(34,168,103,.85)' : 'rgba(229,72,77,.85)'; g.beginPath(); g.ellipse(p.x, p.y, 9 * s, 4.5 * s, 0, 0, 6.2832); g.fill(); } }
  if(S.drag && S.drag.pts){ const D = S.drag; Iso.footsteps(g, D.pts, (x, y) => V.toScreen(x, y, 0), {t: S.t, col: D.kind === 'attack' ? 'rgba(229,72,77,.9)' : 'rgba(42,107,255,.85)', size: 5 * s, pulse: true});
    const e = V.toScreen(D.cell.i + 0.5, D.cell.j + 0.5, 0); g.strokeStyle = D.kind === 'attack' ? '#E5484D' : '#2A6BFF'; g.lineWidth = 3; g.beginPath(); g.ellipse(e.x, e.y, 22 * s, 10 * s, 0, 0, 6.2832); g.stroke(); }
  if(S.goFx && S.t - S.goFx.t < 0.8){ const a = (S.t - S.goFx.t) / 0.8, e = V.toScreen(S.goFx.x, S.goFx.y, 0); g.strokeStyle = 'rgba(42,107,255,' + (1 - a) + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(e.x, e.y, (10 + 20 * a) * s, (5 + 9 * a) * s, 0, 0, 6.2832); g.stroke(); }
  const T0 = M.teams[0]; if(T0.rally){ const p = V.toScreen(T0.rally.x, T0.rally.y, 0); g.strokeStyle = 'rgba(42,107,255,.9)'; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.ellipse(p.x, p.y, 30 * s, 13 * s, 0, 0, 6.2832); g.stroke(); g.setLineDash([]); } }
function diamond(g, V, f, fill, line, lw){ const a = V.toScreen(f.i, f.j, 0), b = V.toScreen(f.i + f.w, f.j, 0), c = V.toScreen(f.i + f.w, f.j + f.d, 0), d = V.toScreen(f.i, f.j + f.d, 0);
  g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = line; g.lineWidth = lw; g.setLineDash([7, 5]); g.stroke(); g.setLineDash([]); }
function sparks(g, V, t){ for(let q = S.sparks.length - 1; q >= 0; q--){ const s = S.sparks[q], a = (t - s.t) / 0.3; if(a > 1 || a < 0){ S.sparks.splice(q, 1); continue; }
    const p = V.toScreen(s.x, s.y, s.z), r = (6 + a * 10) * V.zoom, y = p.y - 18 * V.zoom; g.strokeStyle = s.c; g.globalAlpha = 1 - a; g.lineWidth = 2.2 * V.zoom; g.beginPath();
    for(let k = 0; k < 6; k++){ const an = k * 1.047 + s.x; g.moveTo(p.x + Math.cos(an) * r * 0.4, y + Math.sin(an) * r * 0.4); g.lineTo(p.x + Math.cos(an) * r, y + Math.sin(an) * r); } g.stroke(); }
  g.globalAlpha = 1; }
// ❤️ HP bars (hurt units + buildings) · 🏗️ build % chips · 🏠 House pins
function overlay(g, V){ const M = S.M, s = V.zoom; ghostLine(g, V); g.lineWidth = 1;
  S.uit.forEach(it => { const u = it.u; if(M.t - u.hurtT > 2 || u.hp >= u.max) return; const p = V.toScreen(it.x, it.y, it.z), w = 22 * s, y = p.y - (u.role === 'hero' ? 52 : 42) * s - (u.role === 'rider' ? 12 * s : 0);
    if(p.x < -30 || p.y < -60 || p.x > V.W + 30 || p.y > V.H + 30) return; bar(g, p.x - w / 2, y, w, 3, u.hp / u.max); });
  for(const b of M.blds){ if(b.gone || b.hp <= 0) continue; const p = V.toScreen(b.i + b.w / 2, b.j + b.d / 2, 0), top = p.y - (b.slot === 'house' ? 112 : b.slot === 'tower' ? 96 : 80) * s;
    if(p.x < -60 || p.x > V.W + 60 || top < -40 || top > V.H + 40) continue;
    if(!b.done){ const w = 34 * s, pct = Math.round(b.prog * 100); bar(g, p.x - w / 2, top, w, 5 * Math.max(0.8, s), b.prog, '#FFC21A'); chip(g, p.x, top - 9 * s, '🔨 ' + pct + '%', s); }
    else if(b.hp < b.max || b.slot === 'house'){ const w = (b.slot === 'house' ? 46 : 30) * s; bar(g, p.x - w / 2, top, w, 5 * Math.max(0.8, s), b.hp / b.max, teamHex(b.team)); }
    if(b.slot === 'house'){ const r = Math.max(10, 13 * s), y = top - r - 6; g.fillStyle = '#fff'; g.strokeStyle = teamHex(b.team); g.lineWidth = 3; g.beginPath(); g.arc(p.x, y, r, 0, 6.2832); g.fill(); g.stroke(); if(typeof emo === 'function') emo(g, sideOf(b.team).icon, p.x, y, r * 1.15); } } }
function ghostLine(g, V){ if(!S.ghost) return; const G = S.ghost, f = AR.foot(G.slot, G.i, G.j, G.turn), ok = G.ok === true, a = V.toScreen(f.i, f.j, 0), b = V.toScreen(f.i + f.w, f.j, 0), c = V.toScreen(f.i + f.w, f.j + f.d, 0), d = V.toScreen(f.i, f.j + f.d, 0);
  g.save(); g.lineWidth = 3; g.setLineDash([8, 6]); g.lineDashOffset = -S.t * 20; g.strokeStyle = ok ? '#1E9E5A' : '#E5484D'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.stroke(); g.restore(); }
function bar(g, x, y, w, h, f, c){ g.fillStyle = 'rgba(30,30,50,.6)'; g.fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle = c || (f > 0.5 ? '#3DBE6A' : f > 0.25 ? '#FFC21A' : '#FF4D6D'); g.fillRect(x, y, w * Math.max(0, Math.min(1, f)), h); }
function chip(g, x, y, txt, s){ const fs = Math.round(Math.max(10, 11 * s)); g.font = '700 ' + fs + 'px Fredoka, sans-serif'; const parts = txt.split(' '), wTxt = g.measureText(parts.slice(1).join(' ')).width, w = wTxt + fs * 1.5 + 10;
  g.fillStyle = 'rgba(43,45,66,.82)'; g.beginPath(); g.roundRect ? g.roundRect(x - w / 2, y - fs * 0.75, w, fs * 1.5, fs * 0.75) : g.rect(x - w / 2, y - fs * 0.75, w, fs * 1.5); g.fill();
  if(typeof emo === 'function') emo(g, parts[0], x - w / 2 + fs * 0.85, y, fs); g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(parts.slice(1).join(' '), x - w / 2 + fs * 1.6, y + 1); }

/* ---------- 🧩 army card · 🏗️ tray · 🌼 ring — DOM, refreshed 4× a second ---------- */
function faceCanvas(t, role){ const key = t + ':' + role; if(S.faceC[key]) return S.faceC[key]; const pic = picsFor(t, role)[0], src = pic.bake(2), c = document.createElement('canvas'); c.width = c.height = 72;
  const g = c.getContext('2d'), hh = src.height * (role === 'hero' ? 0.5 : 0.5), sz = hh * 1.02; g.drawImage(src, (src.width - sz) / 2, src.height * 0.02, sz, sz, 2, 2, 68, 68); return S.faceC[key] = c; }
function cardPic(key, o, w, h){ const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const g = c.getContext('2d');
  let src = null; try{ src = Props.canvas(key, Object.assign({k: 0.62, s: 2}, o)); }catch(e){} if(!src) return c; const f = Math.min(c.width / src.width, c.height / src.height) * 0.98; g.drawImage(src, (c.width - src.width * f) / 2, c.height - src.height * f, src.width * f, src.height * f); return c; }
function buildFaces(){ const box = $('faces'); box.innerHTML = ''; FIGHT.forEach(r => { const b = document.createElement('button'); b.className = 'face'; b.dataset.role = r; b.title = ROLE[r][0] + ' ' + sideOf(0).role[r] + ' (' + ROLE[r][1] + ')';
    b.appendChild(faceCanvas(0, r)); const n = document.createElement('b'); n.textContent = '0'; b.appendChild(n); b.onclick = () => pickRole(r); box.appendChild(b); }); }
function buildCards(){ const box = $('cards'), side = sideOf(0), T = S.M.teams[0]; box.innerHTML = '';
  if(S.tab === 'build'){ const list = AR.R1_SLOTS.slice(); list.unshift('house'); list.forEach(slot => { const b = document.createElement('button'); b.className = 'tcard'; b.dataset.slot = slot;
      const lv = T.house.lv, up = AR.HOUSE_UP[lv + 1], cost = slot === 'house' ? (up ? up.cost : null) : AR.SLOTS[slot].cost;
      b.title = SLOT_ICON[slot] + ' ' + (slot === 'house' ? (up ? side.house[lv] + ' → Level ' + (lv + 1) : 'House at top level') : side.bld[slot]);
      b.appendChild(cardPic(Props.AR.key(side.k, slot), {team: teamHex(0), state: slot === 'house' ? String(Math.min(3, lv + 1)) : undefined}, 60, 50));
      const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = slot === 'house' ? '⬆️ ' + (up ? side.house[lv] : 'Top!') : side.bld[slot]; b.appendChild(nm);
      const c = document.createElement('span'); c.className = 't-cost'; c.innerHTML = cost ? costHtml(cost) : '✓'; b.appendChild(c); b.onclick = () => slot === 'house' ? houseUp() : startPlace(slot); box.appendChild(b); }); }
  else TRAIN.forEach(role => { const b = document.createElement('button'); b.className = 'tcard'; b.dataset.role = role; b.title = ROLE[role][0] + ' ' + side.role[role] + ' (' + ROLE[role][1] + ')';
    const cv = document.createElement('canvas'); cv.width = 120; cv.height = 100; const g = cv.getContext('2d'), src = picsFor(0, role)[0].bake(2), f = Math.min(120 / src.width, 100 / src.height) * 0.95; g.drawImage(src, (120 - src.width * f) / 2, 100 - src.height * f, src.width * f, src.height * f); b.appendChild(cv);
    const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = side.role[role]; b.appendChild(nm); const c = document.createElement('span'); c.className = 't-cost'; c.innerHTML = costHtml(AR.ROLES[role].cost); b.appendChild(c);
    const q = document.createElement('span'); q.className = 'q hidden'; q.innerHTML = '<i></i><span></span>'; b.appendChild(q); b.onclick = () => train(role); box.appendChild(b); });
  $('tab-build').classList.toggle('on', S.tab === 'build'); $('tab-train').classList.toggle('on', S.tab === 'train'); S.cardsFor = S.tab + ':' + T.house.lv; hud(true); }
function costHtml(c){ const side = sideOf(0), E = S.M.teams[0].eco; return '<span' + (E.c < c[0] ? ' class="no"' : '') + '>' + side.res.c[0] + c[0] + '</span>' + (c[1] ? '<span' + (E.b < c[1] ? ' class="no"' : '') + '>' + side.res.b[0] + c[1] + '</span>' : ''); }
function hud(force){ const M = S.M, T = M.teams[0], side = sideOf(0); if(!M) return;
  const army = AR.count(M, 0), workers = M.units.filter(u => u.team === 0 && !u.dead && u.role === 'worker').length;
  BAR.count('c', side.res.c[0], Math.floor(T.eco.c), side.res.c[1]); BAR.count('b', side.res.b[0], Math.floor(T.eco.b), side.res.b[1]); BAR.count('army', '👥', army + '/' + T.cap, 'Army / cap', army >= T.cap); BAR.time(Math.floor(M.t));
  $('army-who').innerHTML = side.icon + ' <b>' + army + ' / ' + T.cap + '</b> · ⛑️ ' + workers;
  const n = {}; M.units.forEach(u => { if(u.team === 0 && !u.dead) n[u.role] = (n[u.role] || 0) + 1; }); const pickedRoles = new Set(); S.sel.forEach(id => { const u = M.byId.get(id); if(u) pickedRoles.add(u.role); });
  document.querySelectorAll('#faces .face').forEach(b => { const r = b.dataset.role; b.querySelector('b').textContent = n[r] || 0; b.classList.toggle('none', !n[r]); b.classList.toggle('on', pickedRoles.has(r)); b.classList.toggle('ctr', S.ctrT != null && M.t - S.ctrT < 1.5 && pickedRoles.has(r)); });
  if(S.cardsFor !== S.tab + ':' + T.house.lv) return buildCards();
  document.querySelectorAll('#cards .tcard').forEach(b => { if(b.dataset.slot){ const slot = b.dataset.slot, up = AR.HOUSE_UP[T.house.lv + 1], cost = slot === 'house' ? (up ? up.cost : [1e9, 0]) : AR.SLOTS[slot].cost, can = T.eco.c >= cost[0] && T.eco.b >= cost[1];
        b.classList.toggle('off', !can || (slot === 'house' && !!T.house.up)); b.classList.toggle('on', !!(S.ghost && S.ghost.slot === slot)); b.classList.toggle('glow', !!(S.guide && S.guide.slot === slot && !S.ghost)); if(slot !== 'house' || up) b.querySelector('.t-cost').innerHTML = costHtml(cost); }
    else { const role = b.dataset.role, can = AR.canMake(M, T, role), cost = AR.ROLES[role].cost; b.classList.toggle('off', !can || T.eco.c < cost[0] || T.eco.b < cost[1]); b.classList.toggle('glow', !!(S.guide && S.guide.role === role)); b.querySelector('.t-cost').innerHTML = can ? costHtml(cost) : '🔒 ' + SLOT_ICON[AR.ROLES[role].from];
      const qq = T.blds.filter(x => x.done && x.hp > 0).flatMap(x => x.q.filter(y => y.role === role).map((y, k) => ({y, k, x}))), q = b.querySelector('.q');
      q.classList.toggle('hidden', !qq.length); if(qq.length){ const first = qq.find(z => z.k === 0), p = first ? 1 - first.y.tt / AR.ROLES[role].tt : 0; q.style.setProperty('--p', Math.round(p * 100) + '%'); q.querySelector('span').textContent = qq.length; } } });
  $('tab-train').classList.toggle('glow', !!(S.guide && S.guide.role && S.tab !== 'train')); $('tab-build').classList.toggle('glow', !!(S.guide && S.guide.slot && S.tab !== 'build'));
  $('army-all').classList.toggle('glow', !!(S.guide && S.guide.k === 'attack'));
  guideLine(); cmdBar(); }
function guideLine(){ const lv = S.cfg.level, el = $('goal'); if(lv > 1 || !S.M){ el.classList.add('hidden'); S.guide = null; return; } const G = AR.guide(S.M, 0); S.guide = lv === 0 || G.slot ? G : null;
  if(lv === 1){ el.classList.add('hidden'); return; } el.classList.remove('hidden'); $('goal-n').textContent = G.n + '/' + G.of; $('goal-t').textContent = G.text; }

/* ---------- 🕹️ orders: pick (tap · role face · ⚔️ ALL · 🔲 box) → go / attack · 🚩 rally · 🛡️ defend · ⚔️ charge ---------- */
function pickRole(r){ const ids = S.M.units.filter(u => u.team === 0 && !u.dead && u.role === r).map(u => u.id); const all = ids.length && ids.every(id => S.sel.has(id)) && S.sel.size === ids.length; S.sel.clear(); if(!all) ids.forEach(id => S.sel.add(id)); hud(); }
function pickAll(){ S.sel.clear(); S.M.units.forEach(u => { if(u.team === 0 && !u.dead && u.role !== 'worker') S.sel.add(u.id); }); hud(); tip('⚔️ Now tap a rival — or the ground to walk there'); }
function unitAt(px, py, team){ let best = null, bd = 34; S.uit.forEach(it => { const u = it.u; if(team != null && (u.team === team) !== (team === 0)) return; const p = S.V.toScreen(it.x, it.y, it.z), d = Math.hypot(px - p.x, py - (p.y - 16 * S.V.zoom)); if(d < bd * Math.max(0.7, S.V.zoom)){ bd = d; best = u; } }); return best; }
function bldAt(cell){ if(!cell) return null; return S.M.blds.find(b => !b.gone && b.hp > 0 && cell.i >= b.i - 0.5 && cell.i < b.i + b.w + 0.5 && cell.j >= b.j - 0.5 && cell.j < b.j + b.d + 0.5) || null; }
function onTap(cell, px, py){ const M = S.M; if(!M || S.paused) return; hideInfo(); $('bmenu').classList.add('hidden');
  if(S.ghost){ if(cell){ const f0 = AR.foot(S.ghost.slot, 0, 0, S.ghost.turn); moveGhost(cell.i - Math.floor(f0.w / 2), cell.j - Math.floor(f0.d / 2)); } return; }
  if(S.arm === 'rally'){ if(cell){ AR.order(M, 0, {go: {x: cell.i + 0.5, y: cell.j + 0.5}}); tip('🚩 New units walk to the flag'); } arm(null); return; }
  const mine = unitAt(px, py, 0); if(mine){ S.inspect = null; pickNear(mine); return; }
  const foe = unitAt(px, py, 1), fb = bldAt(cell), ids = [...S.sel];
  if(ids.length){   // units picked: enemy = attack · ground = walk there (✅ Aowu pick 1)
    if(foe && foe.team !== 0) { AR.order(M, 0, {target: foe.id}, ids); tip('⚔️ Attack!'); return; }
    if(fb && fb.team !== 0){ AR.order(M, 0, {attack: true}, ids); tip('⚔️ Attack the ' + nameOfBld(fb)); return; }
    if(cell){ AR.order(M, 0, {go: {x: cell.i + 0.5, y: cell.j + 0.5}}, ids); S.goFx = {x: cell.i + 0.5, y: cell.j + 0.5, t: S.t}; } return; }
  // nothing picked: a tap only LOOKS (Aowu Q1) — ℹ️ info card, never an order
  if(foe && foe.team !== 0) return showInfo({k: 'unit', u: foe}, px, py);
  if(fb) return showInfo({k: 'bld', b: fb}, px, py);
  const r = cell && resAt(cell); if(r) return showInfo({k: 'res', r}, px, py);
  if(cell) showInfo({k: 'land', cell}, px, py); }
function pickNear(u){ const M = S.M; S.sel.clear(); M.units.forEach(x => { if(x.team === 0 && !x.dead && x.role === u.role && Math.hypot(x.x - u.x, x.y - u.y) < 4) S.sel.add(x.id); }); hud(); }
function resAt(cell){ for(const r of S.M.teams.flatMap(T => T.res).concat(S.M.rich)) if(r.i === cell.i && r.j === cell.j) return r; return null; }
function nameOfBld(b){ const sd = sideOf(b.team); return b.slot === 'house' ? sd.house[(b.lv || 1) - 1] : sd.bld[b.slot]; }
function arm(k){ S.arm = S.arm === k ? null : k; cmdBar(true);
  if(S.arm === 'lasso') tip('🪢 Drag around your Minivatars to pick them'); else if(S.arm === 'rally') tip('🚩 Tap where new units should walk'); }
let tipT = 0; function tip(t){ const b = $('tipbox'); b.textContent = t; b.classList.remove('hidden'); clearTimeout(tipT); tipT = setTimeout(() => b.classList.add('hidden'), 2200); }
function train(role){ const r = AR.train(S.M, 0, role); if(r === true){ window.UISound && UISound.play && UISound.play('pop'); hud(); return; }
  tip(r === 'need' ? '🔒 Build ' + SLOT_ICON[AR.ROLES[role].from] + ' ' + sideOf(0).bld[AR.ROLES[role].from] + ' first' : r === 'cap' ? '👥 Your army is full — ⬆️ the House for more' : r === 'cost' ? '🪙 Not enough yet' : r === 'full' ? '⏳ Queue is full' : '–'); }
function houseUp(){ const r = AR.houseUp(S.M, 0); if(r === true){ tip('🏠 Bricklets are building Level ' + (S.M.teams[0].house.lv + 1)); hud(); } else tip(r === 'max' ? '🏠 Top level!' : r === 'busy' ? '🔨 Already building' : '🪙 Not enough yet'); }

/* ---------- 👻 placing: tray card → ghost at the screen middle (🌱 at the good spot) → drag / tap a cell · 🔄 · ✓ / ✕ ---------- */
function startPlace(slot){ const M = S.M, gd = S.guide && S.guide.slot === slot ? S.guide.spot : null; if(S.ghost && S.ghost.slot === slot){ cancelPlace(); return; }
  const at = gd || (() => { const w = S.V.toWorld(S.V.cx, S.V.cy, 0), au = AR.autoSpot(M, 0, slot), c = {i: Math.floor(w.x), j: Math.floor(w.y), turn: (au || {turn: 0}).turn};
    return AR.canPlace(M, 0, slot, c.i, c.j, c.turn) === true || !au ? c : au; })();   // the ghost starts where it fits (the screen middle, else the best spot near your town)
  S.ghost = {slot, i: at.i, j: at.j, turn: at.turn | 0}; refreshGhost(); const f = AR.foot(slot, at.i, at.j, at.turn | 0); S.V.follow(null); S.V.centerOn(f.i + f.w / 2, f.j + f.d / 2 - 1); hud(true); }
function moveGhost(i, j){ const G = S.ghost; if(!G || (G.i === i && G.j === j)) return; G.i = i; G.j = j; refreshGhost(); }
function refreshGhost(){ const G = S.ghost, M = S.M; if(!G) return; G.ok = AR.canPlace(M, 0, G.slot, G.i, G.j, G.turn); const c = AR.SLOTS[G.slot].cost, T = M.teams[0]; if(G.ok === true && (T.eco.c < c[0] || T.eco.b < c[1])) G.ok = 'cost';
  const f = AR.foot(G.slot, G.i, G.j, G.turn); try{ G.it = Props.item(Props.AR.key(T.side, G.slot), f.i, f.j, {turn: f.turn, team: teamHex(0), build: 100}); G.it.alpha = 0.55; }catch(e){ G.it = null; }
  $('gc-name').textContent = SLOT_ICON[G.slot] + ' ' + sideOf(0).bld[G.slot]; const mk = AR.SLOTS[G.slot].makes; $('gc-more').textContent = (mk.length ? 'makes ' + mk.map(r => ROLE[r][0]).join(' ') : G.slot === 'tower' ? 'shoots rivals near it' : G.slot === 'wardrobe' ? 'role stages 🗡️ 🎽' : '') + ' · ' + sideOf(0).res.c[0] + c[0] + ' ' + sideOf(0).res.b[0] + c[1]; $('gc-why').textContent = G.ok === true ? '' : (WHY[G.ok] || ''); $('gc-ok').disabled = G.ok !== true; $('ghost-card').classList.remove('hidden'); }
function cancelPlace(){ S.ghost = null; $('ghost-card').classList.add('hidden'); hud(true); }
function confirmPlace(){ const G = S.ghost; if(!G || G.ok !== true) return; const b = AR.place(S.M, 0, G.slot, G.i, G.j, G.turn); if(b && b.id){ window.UISound && UISound.play && UISound.play('pop'); cancelPlace(); tip('🔨 Bricklets are on their way'); } else { G.ok = b; refreshGhost(); } }
function placeDom(){ const V = S.V; if(!V) return;
  if(S.ghost){ const f = AR.foot(S.ghost.slot, S.ghost.i, S.ghost.j, S.ghost.turn), p = V.toScreen(f.i + f.w / 2, f.j + f.d / 2, 0), card = $('ghost-card'), top = p.y - (S.ghost.slot === 'tower' ? 96 : 86) * V.zoom - 10;
    const w = card.offsetWidth, x = Math.max(w / 2 + 6, Math.min(innerWidth - w / 2 - 6, p.x)), gl = $('goal'), gb = gl.classList.contains('hidden') ? S.top : gl.getBoundingClientRect().bottom + 6, y = Math.max(gb + card.offsetHeight + 4, Math.min(S.dockTop - 8, top)); card.style.left = x + 'px'; card.style.top = y + 'px'; } else $('ghost-card').classList.add('hidden');
  const gd = S.guide, hand = $('hand'); let hp = null;
  if(gd && S.cfg.level === 0){ if(gd.spot && gd.slot && S.ghost && S.ghost.slot === gd.slot){ if(S.ghost.i === gd.spot.i && S.ghost.j === gd.spot.j && S.ghost.ok === true){ const r = $('gc-ok').getBoundingClientRect(); hp = {x: r.left + r.width / 2, y: r.bottom - 4}; } else { const f = AR.foot(gd.slot, gd.spot.i, gd.spot.j, gd.spot.turn), p = V.toScreen(f.i + f.w / 2, f.j + f.d / 2, 0); hp = {x: p.x, y: p.y}; } }
    else { const el = document.querySelector('#cards .tcard.glow, #tabs .glow, #army-all.glow'); if(el){ const r = el.getBoundingClientRect(); hp = {x: r.right - 6, y: r.top + r.height * 0.5}; } } }   // 👆 at the button's right edge — its word stays readable
  hand.classList.toggle('hidden', !hp); if(hp){ hand.style.left = hp.x + 'px'; hand.style.top = hp.y + 'px'; }
  placeSquad(); if(S.infoAt && !$('info').classList.contains('hidden')){ const a = S.infoAt, w = a.k === 'unit' ? {x: a.u.x, y: a.u.y, z: 1.2} : a.k === 'bld' ? {x: a.b.i + a.b.w / 2, y: a.b.j + a.b.d / 2, z: 3} : a.k === 'res' ? {x: a.r.i + 0.5, y: a.r.j + 0.5, z: 1.5} : {x: a.cell.i + 0.5, y: a.cell.j + 0.5, z: 0}; const p = V.toScreen(w.x, w.y, w.z); placeInfo(p.x, p.y); }
  const T0 = S.M.teams[0], fl = $('flag'); fl.classList.toggle('hidden', !T0.rally); if(T0.rally){ const p = V.toScreen(T0.rally.x, T0.rally.y, 0); fl.style.left = p.x + 'px'; fl.style.top = p.y + 'px'; } }

/* ---------- 🔲 box pick + 👻 ghost drag (one finger; the camera stays still for that drag) ---------- */
function bindPointer(cv){ let drag = null;
  cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(), p = {x: e.clientX - r.left, y: e.clientY - r.top};
    if(S.arm === 'lasso'){ S.V.pan = false; drag = {k: 'box', x0: p.x, y0: p.y}; return; }
    if(S.ghost){ const c = S.V.hit(p.x, p.y), f = AR.foot(S.ghost.slot, S.ghost.i, S.ghost.j, S.ghost.turn); if(c && c.i >= f.i - 1 && c.i <= f.i + f.w && c.j >= f.j - 1 && c.j <= f.j + f.d){ S.V.pan = false; drag = {k: 'ghost', di: c.i - S.ghost.i, dj: c.j - S.ghost.j}; } } });
  cv.addEventListener('pointermove', e => { if(!drag) return; const r = cv.getBoundingClientRect(), p = {x: e.clientX - r.left, y: e.clientY - r.top};
    if(drag.k === 'box'){ const b = $('boxsel'); b.classList.remove('hidden'); b.style.left = Math.min(p.x, drag.x0) + 'px'; b.style.top = Math.min(p.y, drag.y0) + 'px'; b.style.width = Math.abs(p.x - drag.x0) + 'px'; b.style.height = Math.abs(p.y - drag.y0) + 'px'; drag.x1 = p.x; drag.y1 = p.y; }
    else { const c = S.V.hit(p.x, p.y); if(c) moveGhost(c.i - drag.di, c.j - drag.dj); } });
  const up = () => { if(!drag) return; S.V.pan = true; if(drag.k === 'box' && drag.x1 != null) boxPick(drag); $('boxsel').classList.add('hidden'); if(drag.k === 'box') { S.arm = null; cmdBar(true); } drag = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); }
function boxPick(d){ const x0 = Math.min(d.x0, d.x1), x1 = Math.max(d.x0, d.x1), y0 = Math.min(d.y0, d.y1), y1 = Math.max(d.y0, d.y1); S.sel.clear();
  S.uit.forEach(it => { const u = it.u; if(u.team !== 0 || u.role === 'worker') return; const p = S.V.toScreen(it.x, it.y, it.z); if(p.x >= x0 && p.x <= x1 && p.y - 14 >= y0 && p.y - 14 <= y1) S.sel.add(u.id); }); hud();
  tip(S.sel.size ? '✅ ' + S.sel.size + ' picked — tap the ground or a rival' : 'Nobody inside — try a bigger box'); }

/* ---------- 🎛️ command bar: buttons follow what is picked (nothing · units · a building) — replaces the 🌼 ring (Aowu 10:33) ---------- */
const CMD = {
  none: [['lasso', '🪢', 'Lasso'], ['town', '🏠', 'Town'], ['rally', '🚩', 'Rally']],
  units: [['charge', '⚔️', 'Charge', 'sp-danger'], ['defend', '🛡️', 'Defend'], ['lasso', '🪢', 'Lasso'], ['unpick', '✕', 'Unpick']],   /* 👥 Group · 🔀 Formation · ✂️ Split arrive with the squads in R1b2 (no "coming soon" buttons for kids) */
  bld: [['train', '👥', 'Train', 'sp-primary'], ['level', '⬆️', 'Level'], ['rallyb', '🚩', 'Rally point'], ['town', '🏠', 'Town'], ['unpick', '✕', 'Close']]};
function cmdBar(force){ const ctx = S.sel.size ? 'units' : S.inspect && S.inspect.k === 'bld' && S.inspect.b.team === 0 ? 'bld' : 'none', key = ctx + ':' + (S.arm || ''); if(!force && S.cmdKey === key) return; S.cmdKey = key;
  const box = $('cmd'); box.innerHTML = ''; CMD[ctx].forEach(([k, ic, lb, cls]) => { if(k === 'level' && !(S.inspect && S.inspect.b.slot === 'house')) return;
    const b = document.createElement('button'); b.className = 'sp-btn cb ' + (cls || 'sp-secondary') + (S.arm === k ? ' armed' : ''); b.dataset.k = k; b.dataset.sound = 'tap'; b.innerHTML = ic + '<small>' + lb + '</small>'; b.onclick = () => cmdDo(k); box.appendChild(b); });
  requestAnimationFrame(layout); }
function cmdDo(k){ const M = S.M, ids = [...S.sel];
  if(k === 'lasso' || k === 'rally') return arm(k);
  if(k === 'town'){ const H = M.teams[0].house; S.V.follow(null); S.V.centerOn(H.i + H.w / 2, H.j + H.d / 2); return; }
  if(k === 'unpick'){ S.sel.clear(); hideInfo(); $('bmenu').classList.add('hidden'); hud(); cmdBar(true); return; }
  if(k === 'charge'){ AR.order(M, 0, {attack: true}, ids.length ? ids : null); tip('⚔️ Charge!'); return; }
  if(k === 'defend'){ if(ids.length) AR.order(M, 0, {home: true}, ids); else AR.order(M, 0, {home: true}); tip('🛡️ Back home to defend'); return; }
  if(k === 'train'){ S.tab = 'train'; buildCards(); return; } if(k === 'level') return houseUp();
  if(k === 'rallyb') return arm('rally'); }

/* ---------- ℹ️ info card: tap a building · an enemy · a rock / tree · the land (nothing picked) ---------- */
function hideInfo(){ $('info').classList.add('hidden'); if(S.inspect){ S.inspect = null; cmdBar(true); } }
function showInfo(it, px, py){ const M = S.M, el = $('info'), side0 = sideOf(0); S.inspect = it; let h = '';
  const head = (ic, nm, sub) => '<div class="ih"><span class="ic">' + ic + '</span><span>' + nm + '</span><button class="sp-btn sp-ghost x" data-x="1">✕</button></div>' + (sub ? '<div class="sub">' + sub + '</div>' : '');
  const hp = (f, c) => '<div class="hp"><i style="width:' + Math.round(Math.max(0, Math.min(1, f)) * 100) + '%;background:' + c + '"></i></div>';
  if(it.k === 'unit'){ const u = it.u, sd = sideOf(u.team), beat = Object.keys(AR.BEATS).filter(r => r !== 'hero' && AR.BEATS[r][u.role] && FIGHT.indexOf(r) >= 0);
    h = head(ROLE[u.role][0], sd.role[u.role], sd.icon + ' ' + sd.name + ' · ' + ROLE[u.role][1]) + hp(u.hp / u.max, teamHex(u.team)) + '❤️ ' + Math.ceil(u.hp) + ' / ' + u.max
      + (beat.length ? '<div class="tipl">⚡ ' + beat.map(r => ROLE[r][0] + ' ' + side0.role[r]).join(' · ') + ' beat' + (beat.length > 1 ? '' : 's') + ' this ' + ROLE[u.role][0] + '</div>' : ''); }
  else if(it.k === 'bld'){ const b = it.b, sd = sideOf(b.team), mine = b.team === 0, mk = AR.SLOTS[b.slot].makes;
    h = head(SLOT_ICON[b.slot], nameOfBld(b), sd.icon + ' ' + sd.name + (b.slot === 'house' ? ' · Level ' + b.lv : '') + (b.done ? '' : ' · 🔨 ' + Math.round(b.prog * 100) + '%')) + hp(b.hp / b.max, teamHex(b.team)) + '❤️ ' + Math.ceil(b.hp) + ' / ' + b.max;
    if(mine && mk.length) h += '<div class="row">' + (b.q.length ? '<span class="q">' + b.q.map(x => x.role ? ROLE[x.role][0] : '🎨').join('') + '</span>' : '<span class="sub">Queue empty</span>') + '</div><div class="row">' + mk.map(r => '<button class="sp-btn sp-primary" data-train="' + r + '">' + ROLE[r][0] + ' ' + side0.role[r] + '</button>').join('') + '</div>';
    if(mine && b.slot === 'house' && AR.HOUSE_UP[b.lv + 1]){ const c = AR.HOUSE_UP[b.lv + 1].cost; h += '<div class="row"><button class="sp-btn sp-secondary" data-up="1">⬆️ ' + sd.house[b.lv] + ' · ' + costHtml(c) + '</button></div>'; }
    if(!mine) h += '<div class="tipl">⚡ 🛞 ' + side0.role.siege + ' hits buildings ×3</div>'; }
  else if(it.k === 'res'){ const r = it.r, coin = r.kind === 'c', ic = coin ? side0.res.c[0] : side0.res.b[0];
    h = head(coin ? '🪨' : '🌳', coin ? (r.rich ? '💰 Rich coin rock' : 'Coin rock') : 'Brick tree', 'Bricklets gather it by themselves') + hp(r.n / r.max, coin ? '#FFC21A' : '#3DBE6A') + ic + ' ' + Math.round(r.n) + ' / ' + r.max + ' left' + '<div class="sub">grows back 60 s after it is empty</div>'; }
  else { const c = it.cell, cl = S.map.get(c.i, c.j) || {}, own = territory().find(q => q[0] === c.i && q[1] === c.j), who = own ? sideOf(own[2]) : null, can = AR.canPlace(M, 0, 'tower', c.i, c.j, 0) === true;
    const TN = {grass: '🌿 Grass', flower: '🌼 Meadow', sand: '🏖️ Sand', water: '🌊 Water', path: '🟫 Path'};
    h = head('🗺️', TN[cl.t] || '🌿 Land', who ? who.icon + ' ' + who.name + ' land' : 'Nobody\'s land yet') + '<div class="tipl" style="' + (can ? '' : 'background:#FFF0F2;color:#C92C4A') + '">' + (can ? '✓ You can build here' : cl.t === 'water' ? '✗ Too wet to build' : who && own[2] !== 0 ? '✗ Rival land' : '✗ Build next to your own buildings') + '</div>'; }
  el.innerHTML = h; el.classList.remove('hidden'); cmdBar(true);
  el.querySelectorAll('[data-x]').forEach(b => b.onclick = () => hideInfo()); el.querySelectorAll('[data-train]').forEach(b => b.onclick = () => train(b.dataset.train)); el.querySelectorAll('[data-up]').forEach(b => b.onclick = () => houseUp());
  S.infoAt = it; placeInfo(px, py); }
function placeInfo(px, py){ const el = $('info'); if(el.classList.contains('hidden')) return; const w = el.offsetWidth, h = el.offsetHeight, top = S.top + 6, x = Math.max(w / 2 + 8, Math.min(innerWidth - w / 2 - 8, px)), y = Math.max(top + h, Math.min(S.dockTop - 14, py - 24));
  el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.setProperty('--tail', Math.max(18, Math.min(w - 18, px - (x - w / 2))) + 'px'); }

/* ---------- 🚩 squad banner over the picked units: drag = order with a 👣 path (ground = go · rival = attack · own House = defend) · tap = its buttons ---------- */
function squadCentre(){ let x = 0, y = 0, n = 0; S.sel.forEach(id => { const it = S.uit.get(id); if(it){ x += it.x; y += it.y; n++; } }); return n ? {x: x / n, y: y / n, n} : null; }
function placeSquad(){ const c = S.sel.size ? squadCentre() : null, el = $('squad'); if(!c){ el.classList.add('hidden'); $('bmenu').classList.add('hidden'); return; }
  const p = S.V.toScreen(c.x, c.y, 0); el.classList.remove('hidden'); el.style.left = p.x + 'px'; el.style.top = Math.max(S.top + 62, Math.min(S.dockTop - 4, p.y - 34 * S.V.zoom)) + 'px'; el.style.left = Math.max(8, Math.min(innerWidth - 90, p.x)) + 'px'; el.style.setProperty('--sq', teamHex(0));
  const roles = {}; S.sel.forEach(id => { const u = S.M.byId.get(id); if(u) roles[u.role] = (roles[u.role] || 0) + 1; });
  const txt = '<b>' + c.n + '</b>' + Object.keys(roles).sort((a, b) => roles[b] - roles[a]).slice(0, 3).map(r => '<span class="ri">' + ROLE[r][0] + '</span>').join('');
  if($('sq-fl').innerHTML !== txt) $('sq-fl').innerHTML = txt;
  const m = $('bmenu'); if(!m.classList.contains('hidden')){ const r = el.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight; let x, y;
    if(r.right + 6 + w <= innerWidth - 6){ x = r.right + 6; y = r.top + 14; } else if(r.left - 6 - w >= 6){ x = r.left - 6 - w; y = r.top + 14; } else { x = Math.max(6, Math.min(innerWidth - w - 6, r.left + r.width / 2 - w / 2)); y = r.top - 8 - h / 2; if(y - h / 2 < S.top) y = r.bottom + 8 + h / 2; }
    y = Math.max(S.top + h / 2, Math.min(S.dockTop - h / 2 - 6, y)); const hitsOf = (yy) => ['mini', 'goal'].some(id => { const q = $(id).getBoundingClientRect(); return q.width && x < q.right && x + w > q.left && yy - h / 2 < q.bottom && yy + h / 2 > q.top; });
    if(hitsOf(y)){ const y2 = Math.min(S.dockTop - h / 2 - 6, r.bottom + 8 + h / 2); if(!hitsOf(y2)) y = y2; }
    m.style.left = x + 'px'; m.style.top = y + 'px'; } }
function bindSquad(){ const el = $('squad'); let d = null;
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try{ el.setPointerCapture(e.pointerId); }catch(_){} d = {x: e.clientX, y: e.clientY, moved: false}; });
  el.addEventListener('pointermove', e => { if(!d) return; if(!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8){ d.moved = true; el.classList.add('drag'); $('bmenu').classList.add('hidden'); } if(d.moved) dragTo(e.clientX, e.clientY); });
  const up = e => { if(!d) return; const was = d; d = null; el.classList.remove('drag'); if(was.moved) dropAt(e.clientX, e.clientY); else squadMenu(); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', () => { d = null; el.classList.remove('drag'); S.drag = null; $('dragflag').classList.add('hidden'); }); }
function dragTo(x, y){ const r = S.V.cv.getBoundingClientRect(), cell = S.V.hit(x - r.left, y - r.top), f = $('dragflag'); f.classList.remove('hidden'); f.style.left = x + 'px'; f.style.top = y + 'px';
  if(!cell) return; const c = squadCentre(); if(!c) return; const key = cell.i + ',' + cell.j; if(S.drag && S.drag.key === key) return;
  const foe = unitAt(x - r.left, y - r.top, 1), fb = bldAt(cell), kind = (foe && foe.team !== 0) || (fb && fb.team !== 0) ? 'attack' : fb && fb.slot === 'house' && fb.team === 0 ? 'home' : 'go';
  let pts = null; try{ pts = Iso.path(S.map, {x: c.x, y: c.y}, {x: cell.i + 0.5, y: cell.j + 0.5}, {diag: true}); }catch(e){} if(!pts || pts.length < 2) pts = [{x: c.x, y: c.y}, {x: cell.i + 0.5, y: cell.j + 0.5}];
  f.textContent = kind === 'attack' ? '⚔️' : kind === 'home' ? '🛡️' : '🚩'; S.drag = {key, cell, kind, pts, foe: foe && foe.team !== 0 ? foe : null}; }
function dropAt(x, y){ const D = S.drag, ids = [...S.sel]; $('dragflag').classList.add('hidden'); S.drag = null; if(!D || !ids.length) return;
  if(D.kind === 'attack'){ if(D.foe) AR.order(S.M, 0, {target: D.foe.id}, ids); else AR.order(S.M, 0, {attack: true}, ids); tip('⚔️ Attack!'); }
  else if(D.kind === 'home'){ AR.order(S.M, 0, {home: true}, ids); tip('🛡️ Defend the House'); }
  else { AR.order(S.M, 0, {go: {x: D.cell.i + 0.5, y: D.cell.j + 0.5}}, ids); S.goFx = {x: D.cell.i + 0.5, y: D.cell.j + 0.5, t: S.t}; } }
function squadMenu(){ const m = $('bmenu'); if(!m.classList.contains('hidden')){ m.classList.add('hidden'); return; }
  m.innerHTML = [['charge', '⚔️', 'Charge', 'sp-danger'], ['defend', '🛡️', 'Defend'], ['town', '🏠', 'Town'], ['unpick', '✕', 'Unpick']].map(([k, ic, lb, cls]) => '<button class="sp-btn ' + (cls || 'sp-secondary') + '" data-k="' + k + '">' + ic + '<small>' + lb + '</small></button>').join('');
  m.querySelectorAll('button').forEach(b => b.onclick = () => { cmdDo(b.dataset.k); m.classList.add('hidden'); }); m.classList.remove('hidden'); placeSquad(); }

/* ---------- 📐 layout: bar → minimap + goal line; dock → the camera's free area ---------- */
function layout(){ const gb = $('gbar').getBoundingClientRect(); S.top = Math.round(gb.bottom + 6); document.documentElement.style.setProperty('--top', S.top + 'px');
  const short = innerHeight < 520, up = innerWidth / innerHeight < 0.8, mm = Math.round(up ? Math.min(118, innerWidth * 0.3) : short ? 112 : Math.min(170, innerWidth * 0.13 + 40)); document.documentElement.style.setProperty('--mm-w', mm + 'px');
  const dock = $('dock').getBoundingClientRect(); let dt = innerHeight; ['army', 'tray', 'cmd'].forEach(id => { const q = $(id).getBoundingClientRect(); if(q.height) dt = Math.min(dt, q.top); }); S.dockTop = dt; document.documentElement.style.setProperty('--dock-top', Math.round(dt) + 'px');
  if(S.V){ S.V.setPad({t: S.top + (up ? 0 : 0), b: Math.round(Math.min(innerHeight - dt + 4, innerHeight * 0.45))}); }
  const pr = $('cards').__pr; if(pr){ const rows = up ? 2 : 1; if(pr.o.rows !== rows){ pr.o.rows = rows; pr.lay(true); } }
  if(S.mm && S.mm.resize) S.mm.resize(); }

/* ---------- 🎛️ the shared game bar ---------- */
let BAR = null;
function makeBar(){ BAR = UI.gameBar($('gbar'), {game: GAME_ID, icon: '🏰', name: 'AvataRealm', levels: () => UI.toast && UI.toast('🎚️ Levels come with the setup page (R1c)'), playing: () => !!S.M && !S.M.over,
    pauseButton: true, pause: {pause: () => { S.paused = true; }, resume: () => { S.paused = false; }}, onFit: () => requestAnimationFrame(layout), scoreMin: '4ch'});
  BAR.level(LEVEL_NAMES[S.cfg.level]); const side = SIDE[S.cfg.side]; BAR.count('c', side.res.c[0], 0, side.res.c[1]); BAR.count('b', side.res.b[0], 0, side.res.b[1]); BAR.count('army', '👥', '0/10'); BAR.time(0); BAR.fit(); }

/* ---------- 🔧 boot ---------- */
async function start(){ S.ready = false; const lb = p => { $('load-bar').style.width = Math.round(p * 100) + '%'; };
  $('loading').classList.remove('hidden'); $('loading').style.opacity = 1; lb(0.05); await new Promise(r => setTimeout(r, 30));
  await new Promise(res => Props.need(['raptor', 'bolt', 'jungle'], () => res())); lb(0.15);
  build(); lb(0.25);
  // ⚠️ UiKit tx-1 UI.fitScan() runs once at DOMContentLoaded on every [data-fit] — and UI.gameBar writes data-fit (its stage) on the bar: a bar made BEFORE that scan gets its insides re-written
  //    (stale numbers forever). Make the bar after the scan (📨 note to the ✨ UiKit lane, Lessons Learned 2026-11-18).
  await new Promise(r => { const go = () => setTimeout(r, 5); if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go(); });
  S.V = Iso.view(freshCanvas(), S.map, {bg: 'none', shadow: true, min: 0.3, max: 2.4}); S.V.resize(); S.V.onTap = (c, px, py) => onTap(c, px, py); bindPointer(S.V.cv);
  makeBar(); layout(); const small = Math.min(innerWidth, innerHeight) < 600, d = S.V.dpr || 1; S.V.zoom = Iso.stepFor((small ? 0.75 : 1) * d) / d;
  const H = S.M.teams[0].house; S.V.centerOn(H.i + H.w / 2 + 3, H.j + H.d / 2 + 1);
  S.mm = Iso.minimap($('mini-cv'), S.map, S.V, {dots: () => { const a = []; S.uit.forEach(it => a.push({x: it.x, y: it.y, c: teamHex(it.u.team)})); return a; }});
  buildFaces(); buildCards(); UI.pageRow($('cards'), {rows: innerWidth / innerHeight < 0.8 ? 2 : 1, edge: true}); layout();
  const pics = []; for(let t = 0; t < S.M.teams.length; t++) TRAIN.concat(['hero']).forEach(r => pics.push(...picsFor(t, r)));
  lb(0.3); await Props.warm(S.props, S.V, {onProgress: f => lb(0.3 + f * 0.3)}); await Iso.warm(pics, S.V, {onProgress: f => lb(0.6 + f * 0.4)});
  $('loading').style.opacity = 0; setTimeout(() => $('loading').classList.add('hidden'), 350);
  S.ready = true; S.loop = Iso.loop({update: step, render}); hud(true); }
function controls(){
  $('tab-build').onclick = () => { S.tab = 'build'; buildCards(); }; $('tab-train').onclick = () => { S.tab = 'train'; cancelPlace(); buildCards(); };
  $('army-all').onclick = pickAll;
  bindSquad();
  $('gc-ok').onclick = confirmPlace; $('gc-no').onclick = cancelPlace; $('gc-turn').onclick = () => { if(S.ghost){ S.ghost.turn = (S.ghost.turn + 1) % 4; refreshGhost(); } };
  addEventListener('keydown', e => { if(!S.M || e.repeat) return; const k = e.key.toLowerCase(); const mv = {w: [0, -1], arrowup: [0, -1], s: [0, 1], arrowdown: [0, 1], a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0]}[k];
    if(mv && !(k === 'a' && !e.shiftKey && false)){ S.V.cam.x += mv[0] * 60; S.V.cam.y += mv[1] * 40; S.V.clampCam(); return; }
    if(/^[1-8]$/.test(k)){ train(TRAIN[+k - 1]); return; } if(k === 'r') arm('rally'); else if(k === 'l') arm('lasso'); else if(k === 'h') cmdDo('defend'); else if(k === ' ') { e.preventDefault(); S.paused = !S.paused; } else if(k === 'escape') { cancelPlace(); S.arm = null; S.sel.clear(); hideInfo(); cmdBar(true); } });
  addEventListener('resize', () => requestAnimationFrame(layout)); }

/* ---------- 🧪 test + picture hooks ---------- */
function ff(sec){ const M = S.M, dt = 1 / 30; for(let k = 0; k < sec * 30 && !M.over; k++){ AR.step(M, dt); events(); } syncUnits(1); hud(true); }
window.AVATAREALM = {bar: () => BAR, showInfo, cmdDo, cmdBar, dragTo, dropAt, squadMenu, pickNear, S, AR, SIDE, ff, start, onTap, startPlace, moveGhost, cancelPlace, confirmPlace, pickRole, pickAll, arm, boxPick, train, houseUp, layout, hud, buildCards, territory};
controls(); start();
})();
