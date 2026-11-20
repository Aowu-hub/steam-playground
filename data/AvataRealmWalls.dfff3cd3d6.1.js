
window.ARWalls = (function(){ 'use strict';
let S, AR, $, sideOf, tip, hud, cmdBar, events, cancelPlace, hideInfo, placeInfo, sqTag, chip, bar, cardPic, teamHex, addItem, dropItem, PLACER;
/* ---------- 🧱 R2.4a WALLS page part (ar-r2-4a, plan §18p): 🏗️ tray card · wall mode (drag ONE line: straight + 1 corner · tap a piece = 🚪) · 👻 ghost of the REAL props ·
   ghost card (pieces · gates · cost · why) · ✓ Build · tap a wall = the whole-line card (🚪 / 🧱 · 🗑️ · 🔨 Fix) · 🚪 gates open for your team · build steps · 💥 breaks (rubble 3 s) ·
   🐣 one-time hint. Art = IsoProps `Props.AR.wall / gate / wallOff` only. The page hands its pieces in with ARWalls.init({…}). ---------- */
const WHY_W = {ground: '🌊 needs open ground', wall: '🧱 a wall is there', block: '🪨 something is there', shrine: '⭐ next to a shrine', territory: '🟩 too far from your town', door: '🚪 a door', units: '⚔️ rivals there', seal: '🚧 shuts your town in', locked: '🔒 from 🐣 Junior'};
const wSide = t => S.M.teams[t].side, wNames = t => { const W = Props.AR.WALLS[wSide(t)] || Props.AR.WALLS.realm || {}; const s = W.skin || {}; return {wall: s.name || 'Wall', gate: s.gateName || 'Gate'}; };
const wKeys = t => { const W = Props.AR.WALLS[wSide(t)] || {}; return {wall: W.wall || 'realm_wall', gate: W.gate || 'realm_gate'}; };
const wBuild = p => p >= 1 ? 100 : p >= 0.66 ? 66 : p >= 0.33 ? 33 : 0;
function wAt(M, i, j){ return AR.wallAt(M, i, j); }
// 🧩 placer (the engine calls these — on a match start, a load and every new piece)
const wallPlacer = {
  wall(map, W, T){ const team = teamHex(W.team), side = T.side, o = {team, build: wBuild(W.prog)}; let it = null;
    try{ it = W.k === 'g' ? Props.AR.gate(map, side, W.i, W.j, Object.assign({state: 'closed'}, o)) : Props.AR.wall(map, side, W.i, W.j, o); }catch(e){ it = null; }
    if(it){ addItem(it); if(W.k === 'g') map.setBlock(W.i, W.j, 0); } return it; },
  wallOff(map, W, broken){ const it = W.it; if(!it) return; if(broken){ try{ const r = Props.item(it.prop, it.x, it.y, {turn: it.turn, state: it.state, team: teamHex(W.team), cond: 'ruined'}); r.alpha = 0.95; S.wrub.push({it: r, t: S.t}); S.items.push(r); }catch(e){} }
    try{ Props.AR.wallOff(map, it); }catch(e){} dropItem(it); W.it = null; }};
// 🚪 a gate's look follows who is next to it (opens for its own team) — the map cell always stays walkable (the engine says who may stand there)
function gateLook(W, open){ if(!W.it) return; const st = open ? 'open' : 'closed'; if(W.it.state === st) return; try{ Props.setState(W.it, st, S.M.map); }catch(e){} S.M.map.setBlock(W.i, W.j, 0); }
function wallTick(){ const M = S.M; if(!M || !M.walls.length) return; if(S.frame % 6) return;
  for(const W of M.walls){ if(W.k !== 'g' || !W.it) continue; let open = false; for(const u of M.units){ if(u.dead || u.team !== W.team || u.fly) continue; if(Math.abs(u.x - W.i - 0.5) < 1.3 && Math.abs(u.y - W.j - 0.5) < 1.3){ open = true; break; } } gateLook(W, open); }
  for(let k = S.wrub.length - 1; k >= 0; k--){ const r = S.wrub[k], a = S.t - r.t; if(a > 3){ const n = S.items.indexOf(r.it); if(n >= 0) S.items.splice(n, 1); S.wrub.splice(k, 1); } else r.it.alpha = a > 2.2 ? Math.max(0, 0.95 * (3 - a) / 0.8) : 0.95; } }
// ⏱️ engine events → props + sparks + tags
function wallEvent(e){ const M = S.M;
  if(e.k === 'wall.step' || e.k === 'wall.done'){ const W = M.walls.find(x => x.id === e.id); if(W && W.it){ try{ Props.AR.set(W.it, {build: e.k === 'wall.done' ? 100 : e.pct}, M.map); }catch(_){} if(W.k === 'g') M.map.setBlock(W.i, W.j, 0); } }
  else if(e.k === 'wall.hit'){ const W = M.walls.find(x => x.id === e.id); if(W && S.sparks.length < 60) S.sparks.push({x: W.i + 0.5, y: W.j + 0.5, z: 0.8, t: S.t, c: teamHex(e.by >= 0 ? e.by : 1)}); }
  else if(e.k === 'wall.break'){ if(S.wfx.length < 8) try{ const V = S.V, p = V.toScreen(e.i + 0.5, e.j + 0.5, 0); S.wfx.push({x: e.i + 0.5, y: e.j + 0.5, E: Motion.fx('puff', {x: p.x, y: p.y - 18 * V.zoom, k: V.zoom * 0.8, seed: e.id})}); }catch(_){}
    if(e.team === 0 && S.t - (S.wbreakT || -9) > 3){ S.wbreakT = S.t; sqTag(e.i + 0.5, e.j + 0.5, 1.8, '💥 ' + wNames(0).wall + ' broken!', 'warn'); } if(S.wallSel) S.wallSel = S.wallSel.filter(W => M.walls.indexOf(W) >= 0); }
  else if(e.k === 'wall.place' && e.team === 0){ hud(true); }
  else if(e.k === 'bot.attack' && e.team !== 0 && M.level === 1 && !S.wHint){ S.wHint = 1; S.wHintT = S.t; tip('🧱 Rivals are coming — try a wall in front of your House!'); hud(true); } }
// 🏗️ tray card (Build tab, after the 🗼 tower)
function wallTrayCard(box){ const M = S.M, nm = wNames(0); const b = document.createElement('button'); b.className = 'tcard'; b.dataset.wall = '1'; b.title = '🧱 ' + nm.wall + ' — drag a line';
  b.appendChild(cardPic(wKeys(0).wall, {team: teamHex(0), state: '5', build: 100}, 60, 50)); const n = document.createElement('span'); n.className = 'nm'; n.textContent = nm.wall; b.appendChild(n);
  const c = document.createElement('span'); c.className = 't-cost'; b.appendChild(c); b.onclick = () => wallMode(!(S.wall && S.wall.on)); wallCardHud(b);
  const tw = box.querySelector('.tcard[data-slot="tower"]'); if(tw && tw.nextSibling) box.insertBefore(b, tw.nextSibling); else box.appendChild(b); }
function wallCardHud(b){ const M = S.M, T = M.teams[0], lock = M.level < AR.WALL_LV, cost = AR.WALL.cost, sd = sideOf(0);
  b.classList.toggle('off', lock || T.eco.b < cost[1]); b.classList.toggle('on', !!(S.wall && S.wall.on)); b.classList.toggle('glow', !!(S.wHint && S.t - S.wHintT < 8 && !(S.wall && S.wall.on)));
  const html = lock ? '🔒 🐣' : '<span' + (T.eco.b < cost[1] ? ' class="no"' : '') + '>' + sd.res.b[0] + cost[1] + '</span><span class="wpc">a piece</span>'; const c = b.querySelector('.t-cost'); if(c.innerHTML !== html) c.innerHTML = html; }
// 🧱 wall mode
function wallMode(on){ const M = S.M; if(on && M.level < AR.WALL_LV){ tip('🔒 Walls come at 🐣 Junior'); return; }
  if(on){ cancelPlace(); S.arm = null; S.sel.clear(); hideInfo(); S.wall = {on: true, a: null, b: null, first: null, plan: null, gates: [], items: []}; tip('🧱 Drag a line · tap a piece = 🚪 gate'); }
  else { S.wall = null; $('wall-card').classList.add('hidden'); }
  const dk = $('skdock'); if(dk) dk.style.visibility = on ? 'hidden' : ''; hud(true); cmdBar(true); if(on) wallCardPage(); }
// the tray page that holds the wall card (tray rows are paged ‹ ›, never scrolled)
function wallCardPage(){ const box = $('cards'), b = box && box.querySelector('.tcard[data-wall]'); if(!b || !UI.pageRow) return; try{ const pr = UI.pageRow(box, {rows: innerWidth / innerHeight < 0.8 ? 2 : 1, edge: true}), n = pr.pages ? pr.pages() : 1;
    for(let k = 0; k < n; k++){ pr.go(k); const r = b.getBoundingClientRect(), R = box.getBoundingClientRect(); if(r.width > 0 && r.left >= R.left - 2 && r.right <= R.right + 2) break; } }catch(e){} }
function wallDrag(a, b, first){ const W = S.wall; if(!W) return; W.a = a; W.b = b; if(first) W.first = first; wallReplan(); }
function wallReplan(){ const W = S.wall, M = S.M; if(!W || !W.a) return; const cells = AR.wallPath(W.a, W.b || W.a, W.first); W.gates = W.gates.filter(g => cells.some(c => c.i === g.i && c.j === g.j));
  W.plan = AR.wallPlan(M, 0, cells, W.gates); const ok = W.plan.cells.filter(c => c.ok === true), set = new Set(ok.map(c => c.i + ',' + c.j)), k = wKeys(0); W.items = [];
  for(const c of ok){ let m = 0; [[1, 0, 1], [0, 1, 2], [-1, 0, 4], [0, -1, 8]].forEach(([a, b2, bit]) => { const n = (c.i + a) + ',' + (c.j + b2); if(set.has(n) || (wAt(M, c.i + a, c.j + b2) && !(c.gate))) m |= bit; });
    const ns = set.has(c.i + ',' + (c.j - 1)) || set.has(c.i + ',' + (c.j + 1)), ew = set.has((c.i - 1) + ',' + c.j) || set.has((c.i + 1) + ',' + c.j);
    try{ const it = c.gate ? Props.item(k.gate, c.i, c.j, {turn: ns && !ew ? 1 : 0, team: teamHex(0), state: 'closed', build: 100}) : Props.item(k.wall, c.i, c.j, {state: String(m), team: teamHex(0), build: 100}); it.alpha = 0.6; W.items.push(it); }catch(e){} }
  wallCardShow(); }
function wallTapCell(c){ const W = S.wall; if(!W) return; if(W.plan && W.plan.cells.some(q => q.i === c.i && q.j === c.j && q.ok === true)){ const k = W.gates.findIndex(g => g.i === c.i && g.j === c.j); if(k >= 0) W.gates.splice(k, 1); else W.gates.push({i: c.i, j: c.j}); wallReplan(); return; }
  W.a = c; W.b = c; W.first = null; wallReplan(); }
function wallCardShow(){ const W = S.wall, el = $('wall-card'); if(!W || !W.plan){ el.classList.add('hidden'); return; } const P = W.plan, nm = wNames(0), sd = sideOf(0), bad = P.cells.filter(c => c.ok !== true);
  const why = bad.length ? (WHY_W[bad[0].ok] || '–') : '', T = S.M.teams[0], cost = (P.cost[0] ? sd.res.c[0] + ' ' + P.cost[0] + ' ' : '') + sd.res.b[0] + ' ' + P.cost[1];
  $('wc-name').textContent = '🧱 ' + nm.wall + ' × ' + P.walls; $('wc-more').textContent = '🚪 ' + P.gates + (P.gates === 1 ? ' gate' : ' gates') + ' · ' + cost + ' · ❤️ ' + AR.WALL.hp + ' each';
  $('wc-why').innerHTML = bad.length ? '✗ ' + bad.length + (bad.length > 1 ? ' tiles' : ' tile') + '<br>' + why : P.full ? '✂️ limit ' + P.cap : !P.afford ? '🪙 not enough' : '';
  $('wc-ok').disabled = !P.n || P.full || !P.afford; el.classList.remove('hidden'); wallCardPlace(); }
function wallCardPlace(){ const W = S.wall, el = $('wall-card'); if(!W || !W.plan || el.classList.contains('hidden')) return; const V = S.V, r = V.cv.getBoundingClientRect(); let top = 1e9, xs = [];
  for(const c of W.plan.cells){ const p = V.toScreen(c.i + 0.5, c.j + 0.5, 0); top = Math.min(top, p.y + r.top); xs.push(p.x + r.left); }
  const w = el.offsetWidth, h = el.offsetHeight, x = Math.max(w / 2 + 6, Math.min(innerWidth - w / 2 - 6, (Math.min(...xs) + Math.max(...xs)) / 2)), y = Math.max(S.top + 8 + h, Math.min((S.dockTop || innerHeight) - 12, top - 58 * V.zoom));
  el.style.left = x + 'px'; el.style.top = y + 'px'; }
function wallConfirm(){ const W = S.wall, M = S.M; if(!W || !W.plan) return; const cells = AR.wallPath(W.a, W.b || W.a, W.first), r = AR.buildWall(M, 0, cells, W.gates);
  if(Array.isArray(r)){ window.UISound && UISound.play && UISound.play('pop'); tip('🧱 Bricklets are building ' + r.length + (r.length > 1 ? ' pieces' : ' piece') + (r.some(x => x.k === 'g') ? ' + a 🚪' : '')); wallMode(false); events(); return; }
  tip(r === 'cost' ? '🪙 Not enough yet' : r === 'cap' ? '✂️ Wall limit reached (' + AR.WALL_CAP(M.map) + ')' : '🧱 Nothing to build there'); }
function wallGateBtn(){ const W = S.wall; if(!W || !W.plan) return; const ok = W.plan.cells.filter(c => c.ok === true); if(!ok.length) return; const mid = ok[Math.floor(ok.length / 2)]; wallTapCell(mid); }
// 👆 pointer (wall mode owns one-finger drags; the camera stays still)
function wallDown(p){ const c = S.V.hit(p.x, p.y); if(!c) return null; S.V.pan = false; return {k: 'wall', a: c, last: c, moved: false}; }
function wallMoveP(d, p){ const c = S.V.hit(p.x, p.y); if(!c || (c.i === d.last.i && c.j === d.last.j)) return; if(!d.moved){ d.moved = true; S.wall.gates = []; S.wall.first = c.i !== d.a.i ? 'x' : 'y'; } d.last = c; wallDrag(d.a, c); }
function wallUp(d){ S.V.pan = true; if(!d.moved) wallTapCell(d.a); }
// 🎨 ground: ghost diamonds (✓ green · ✗ red · 🚪 gold) + the picked line glow
function wdia(g, V, i, j, fill, line, lw){ const a = V.toScreen(i, j, 0), b = V.toScreen(i + 1, j, 0), c = V.toScreen(i + 1, j + 1, 0), d = V.toScreen(i, j + 1, 0); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = line; g.lineWidth = lw; g.setLineDash([6 * V.zoom, 4 * V.zoom]); g.stroke(); g.setLineDash([]); }
function wallGround(g, V){ const s = Math.max(0.8, V.zoom), W = S.wall;
  if(W && W.plan) for(const c of W.plan.cells){ const ok = c.ok === true; wdia(g, V, c.i, c.j, ok ? (c.gate ? 'rgba(255,194,26,.38)' : 'rgba(94,224,160,.36)') : 'rgba(255,77,109,.40)', ok ? (c.gate ? '#D99A00' : '#22A867') : '#E5484D', 2.4 * s); }
  if(S.wallSel && S.inspect && S.inspect.k === 'wall') for(const P of S.wallSel) wdia(g, V, P.i, P.j, 'rgba(255,214,60,.30)', '#FFC21A', 3 * s); }
function wallOver(g, V){ const s = V.zoom, M = S.M, W = S.wall;
  if(W && W.plan) for(const c of W.plan.cells){ const p = V.toScreen(c.i + 0.5, c.j + 0.5, 0); if(c.ok !== true){ g.save(); g.strokeStyle = '#E5484D'; g.lineWidth = 3.4 * s; g.lineCap = 'round'; const r = 6 * s; g.beginPath(); g.moveTo(p.x - r, p.y - r * 0.5); g.lineTo(p.x + r, p.y + r * 0.5); g.moveTo(p.x + r, p.y - r * 0.5); g.lineTo(p.x - r, p.y + r * 0.5); g.stroke(); g.restore(); }
    else if(c.gate) chip(g, p.x, p.y - 62 * s, '🚪 ' + (c.auto ? 'Gate (auto)' : 'Gate'), s); }
  // 🔨 lines going up: one chip a line · ❤️ bars on hurt pieces
  const lines = {}; for(const P of M.walls){ if(!P.done && P.team === 0){ (lines[P.line] || (lines[P.line] = [])).push(P); } else if(P.hp < P.max * 0.98 && M.t - P.hitT < 4){ const p = V.toScreen(P.i + 0.5, P.j + 0.5, 0), w = 24 * s; bar(g, p.x - w / 2, p.y - 46 * s, w, 4 * Math.max(0.8, s), P.hp / P.max, teamHex(P.team)); } }
  for(const k in lines){ const L = lines[k], P = L[Math.floor(L.length / 2)], p = V.toScreen(P.i + 0.5, P.j + 0.5, 0); chip(g, p.x, p.y - 50 * s, '🔨 ' + L.length + (L.length > 1 ? ' pieces going up' : ' piece going up'), s); }
  const now = performance.now(); for(let k = S.wfx.length - 1; k >= 0; k--){ const f = S.wfx[k]; try{ const p = V.toScreen(f.x, f.y, 0); if(f.E.move) f.E.move(p.x, p.y - 18 * V.zoom); if(Motion.drawFx(g, f.E, now) === false) S.wfx.splice(k, 1); }catch(e){ S.wfx.splice(k, 1); } if(f.t0 == null) f.t0 = S.t; if(S.t - f.t0 > 2) S.wfx.splice(k, 1); } }
// ℹ️ tap a wall = the whole-line card
function showWallCard(P, px, py){ const M = S.M, el = $('info'), mine = P.team === 0, sd = sideOf(P.team), nm = wNames(P.team), line = AR.lineOf(M, P.id), gates = line.filter(x => x.k === 'g').length, up = line.filter(x => !x.done).length, hp = line.reduce((a, x) => a + x.hp, 0), mx = line.reduce((a, x) => a + x.max, 0), gaps = mine ? AR.gapsOf(M, 0, P.line).length : 0;
  S.inspect = {k: 'wall', W: P}; S.wallSel = line; if(px == null){ const V = S.V, r = V.cv.getBoundingClientRect(), p = V.toScreen(P.i + 0.5, P.j + 0.5, 1.4); px = p.x + r.left; py = p.y + r.top; }
  let h = '<div class="ih"><span class="ic">' + (P.k === 'g' ? '🚪' : '🧱') + '</span><span>' + (P.k === 'g' ? nm.gate : nm.wall) + '</span><button class="sp-btn sp-ghost x" data-x="1">✕</button></div><div class="sub">' + sd.icon + ' ' + sd.name + ' · ' + (line.length - gates) + ' pieces' + (gates ? ' + 🚪 ' + gates : '') + '</div>'
    + '<div class="hp"><i style="width:' + Math.round(100 * hp / Math.max(1, mx)) + '%;background:' + teamHex(P.team) + '"></i></div><div class="wst"><span>❤️ ' + AR.WALL.hp + ' a piece</span>' + (up ? '<span>🔨 ' + up + ' going up</span>' : '') + (gaps ? '<span>💥 ' + gaps + (gaps > 1 ? ' gaps' : ' gap') + '</span>' : '') + '</div>';
  if(mine){ h += '<div class="row">' + (P.k === 'g' ? '<button class="sp-btn sp-secondary" data-wg="0">🧱 Make a wall</button>' : '<button class="sp-btn sp-secondary" data-wg="1">🚪 Make a gate</button>') + '<button class="sp-btn sp-secondary" data-woff="1">🗑️ Take down</button>' + (gaps ? '<button class="sp-btn sp-primary" data-wfix="1">🔨 Fix</button>' : '') + '</div>'
    + '<div class="tipl">🛞 Bonkwagons hit walls ×3 · 🪽 flyers fly over</div>'; }
  else h += '<div class="tipl">⚔️ In the way? Your army breaks it · 🛞 hits it ×3</div>';
  el.innerHTML = h; el.classList.remove('hidden'); cmdBar(true);
  el.querySelectorAll('[data-x]').forEach(b => b.onclick = () => hideInfo());
  el.querySelectorAll('[data-wg]').forEach(b => b.onclick = () => { const r = AR.wallGate(M, 0, P.id, b.dataset.wg === '1'); if(r === true){ events(); showWallCard(P); } else tip(r === 'seal' ? '🚧 That would shut your town in' : r === 'units' ? '⚔️ Someone is standing there' : '–'); });
  el.querySelectorAll('[data-woff]').forEach(b => b.onclick = () => { AR.wallOff(M, 0, P.id); hideInfo(); events(); tip('🗑️ Taken down — half the ' + sideOf(0).res.b[1] + ' back'); });
  el.querySelectorAll('[data-wfix]').forEach(b => b.onclick = () => { const r = AR.wallFix(M, 0, P.line); if(Array.isArray(r)){ events(); tip('🔨 Bricklets are fixing ' + r.length + (r.length > 1 ? ' gaps' : ' gap')); showWallCard(P); } else tip(r === 'cost' ? '🪙 Not enough yet' : r === 'cap' ? '✂️ Wall limit reached' : '🧱 Nothing to fix there'); });
  placeInfo(px, py); }
const WCSS = `#wall-card{position:absolute;z-index:28;display:flex;align-items:center;gap:6px;padding:5px 6px 5px 10px;transform:translate(-50%,-100%);white-space:nowrap;font-weight:700;font-size:.78rem;}
  #wall-card .gcn{display:flex;flex-direction:column;line-height:1.15;} #wall-card .gcn small{font-size:.66rem;color:var(--ink-soft);font-weight:700;}
  #wall-card .why{color:#E5484D;font-size:.7rem;font-weight:800;line-height:1.1;} #wall-card button{min-height:38px;min-width:42px;padding:3px 9px;font-size:1rem;border-radius:12px;}
  #info .wst{display:flex;gap:6px;flex-wrap:wrap;font-weight:800;font-size:.74rem;} #info .wst span{background:#F2F4FA;border-radius:9px;padding:3px 7px;}
  .tcard .t-cost .wpc{opacity:.7;margin-left:2px;}
  @media (min-width:1360px) and (min-height:800px){ #wall-card{font-size:.92rem;} #wall-card button{min-height:46px;min-width:50px;font-size:1.15rem;} }`;
function init(api){ ({S, AR, $, sideOf, tip, hud, cmdBar, events, cancelPlace, hideInfo, placeInfo, sqTag, chip, bar, cardPic, teamHex, addItem, dropItem, PLACER} = api); S.wrub = []; S.wfx = []; S.wall = null; Object.assign(PLACER, wallPlacer);
  if(!document.getElementById('wall-css')){ const st = document.createElement('style'); st.id = 'wall-css'; st.textContent = WCSS; document.head.appendChild(st); }
  if(!document.getElementById('wall-card')){ const el = document.createElement('div'); el.id = 'wall-card'; el.className = 'puff hidden';
    el.innerHTML = '<span class="gcn"><span id="wc-name"></span><small id="wc-more"></small></span><span class="why" id="wc-why"></span><button class="sp-btn sp-secondary" id="wc-gate" data-sound="tap" title="Gate">🚪</button><button class="sp-btn sp-secondary" id="wc-no" data-sound="tap" title="Cancel">✕</button><button class="sp-btn sp-primary" id="wc-ok" data-sound="tap" title="Build">✓</button>';
    (document.getElementById('scr-play') || document.body).appendChild(el); el.querySelector('#wc-ok').onclick = wallConfirm; el.querySelector('#wc-no').onclick = () => wallMode(false); el.querySelector('#wc-gate').onclick = wallGateBtn; }
  return {wallEvent, wallTick, wallTrayCard, wallCardHud, wallMode, wallDrag, wallConfirm, wallTapCell, wallGateBtn, wallDown, wallMoveP, wallUp, wallGround, wallOver, showWallCard, wallCardPlace}; }
return {init}; })();
