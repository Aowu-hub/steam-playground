
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
UI.navBar(document.getElementById('back-btn'), {});
(function(){
'use strict';
const $ = id => document.getElementById(id);
let LOOK_KEYS = Object.keys(Props.LOOKS), SET_KEYS = Object.keys(Props.SETS);   /* 📦 ip-4a: filled again once every look file is in (keysNow) */
const inOrder = (keys, first) => first.filter(k => keys.indexOf(k) >= 0).concat(keys.filter(k => first.indexOf(k) < 0));
function keysNow(){ LOOK_KEYS = inOrder(Object.keys(Props.LOOKS), ['jungle', 'cherry', 'desert', 'snow', 'farm', 'lava', 'coral', 'moon', 'castle', 'raptor', 'bolt']);
  SET_KEYS = inOrder(Object.keys(Props.SETS), ['jungle', 'village', 'temple', 'bits', 'landmark', 'cherry', 'desert', 'snow', 'farm', 'grow', 'lava', 'coral', 'moon', 'castle', 'realm', 'raptor', 'bolt', 'wild', 'kitchen', 'horde', 'monster', 'myth', 'reef', 'cloud', 'wizard', 'gear', 'detective', 'toybox', 'dust', 'trail']); }
const S = {set: 'village', look: 'jungle', cond: null, hold: null, sel: null, props: [], walkers: [], items: [], walk: true, M: null, V: null, ghost: null, drag: null, placed: 0, missed: []};
const sound = k => { try{ if(window.UI && UI.sound) UI.sound(k); }catch(e){} };
const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

/* ---------- 🗺️ the test map: 18 × 18 meadow, a river with water on the left, two paths ---------- */
let N = 18;   // the sample map; 🏗️ Town maps are 16 / 22 / 30 (ip-2)
function makeMap(){ return Iso.map({w: N, h: N, theme: 'meadow', seed: 5, cell: (i, j) => {
  if(i === 2 || i === 3) return {t: 'water', h: 0};
  if(j === 9 || (i === 9 && j < 17)) return {t: 'path', h: 0, cost: 0.6};
  const r = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453 % 1); return {t: r < 0.1 ? 'flower' : 'grass', h: 0}; }}); }
// 🏘️ the sample village (every starter prop once or more) — [key, i, j, {v, turn}]
const VILLAGE = [['bridge', 1, 9], ['dock', 2, 13, {v: 1}], ['stilt', 5, 3], ['stilt', 11, 3, {v: 1, turn: 1}], ['stilt', 5, 15, {v: 2}], ['inn', 5, 11], ['smithy', 11, 11, {turn: 3}],
  ['stall', 10, 7, {v: 1}], ['well', 8, 7], ['qboard', 10, 10], ['lantern', 8, 10], ['lantern', 11, 8], ['fence', 5, 6], ['crates', 13, 7, {v: 2}], ['signpost', 8, 8],
  ['prang', 14, 13], ['gate', 14, 17], ['guardian', 13, 17], ['guardian', 17, 17], ['bell', 17, 14], ['shrine', 17, 11], ['stairs', 13, 14],
  ['palm', 1, 2], ['palm', 4, 7, {v: 1}], ['jtree', 16, 3], ['mango', 15, 7], ['bamboo', 0, 16], ['bush', 8, 15, {v: 1}], ['rock', 16, 9], ['flowers', 7, 5, {v: 2}],
  ['banana', 4, 1], ['log', 13, 6], ['elephant', 14, 0], ['campflag', 4, 14], ['chest', 10, 16, {v: 1}], ['stop', 9, 13, {v: 1}], ['marker', 12, 15]];

/* ---------- 🧺 tray: set tabs + prop cards (paged, never sideways) ---------- */
function label(el, txt){ const m = String(txt).match(/^(\S+)\s([\s\S]*)$/); if(!m){ el.textContent = txt; return; } el.innerHTML = '<span class="bi"></span> <span class="bl"></span>'; el.firstChild.textContent = m[1]; el.lastChild.textContent = m[2]; el.setAttribute('aria-label', m[2]); }
function renderTabs(){ $('tabs').innerHTML = ''; SET_KEYS.forEach(k => { const st = Props.SETS[k], b = document.createElement('button'); b.className = 'tab' + (k === S.set ? ' on' : ''); b.dataset.set = k; b.setAttribute('data-sound', 'none');
  label(b, (st.icon || '📦') + ' ' + st.name); b.onclick = () => { S.set = k; renderTabs(); renderCards(); sound('tap'); }; $('tabs').appendChild(b); }); }
function thumb(cv, key){ const dpr = Math.min(2, window.devicePixelRatio || 1), def = Props.DEFS[key], G = Props.geom(def, 0), W = cv.clientWidth || 64, H = cv.clientHeight || 56;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); const k = Math.min(W / G.w, H / G.h) * 1.12, c = Props.canvas(key, {k, s: dpr, look: S.look, cond: S.cond, state: def.grow ? '5a' : undefined}), g = cv.getContext('2d');
  g.clearRect(0, 0, cv.width, cv.height); g.drawImage(c, (cv.width - c.width) / 2, cv.height - c.height + 2 * dpr); }
function renderCards(){ const box = $('cards'); box.innerHTML = '';
  Props.list({set: S.set}).forEach(m => { const b = document.createElement('button'); b.className = 'pcard' + (S.hold && S.hold.key === m.key ? ' on' : ''); b.dataset.key = m.key; b.setAttribute('data-sound', 'none');
    b.title = m.name + ' · ' + m.foot.join('×') + ' · ' + m.h + ' px';
    const cv = document.createElement('canvas'), sp = document.createElement('span'); sp.textContent = m.grow ? m.grow.line : m.name;   /* ip-3c: 'Mushroom', not 'Mushroom (growing)' cut short */ b.appendChild(cv); b.appendChild(sp); box.appendChild(b); thumb(cv, m.key);
    b.addEventListener('pointerdown', e => cardDown(e, m.key)); });
  if(UI.pageRow) UI.pageRow(box, {rows: 1, swipe: false, edge: !wide()}); }   /* ip-3b: 9 set tabs → one card row a page on a phone held sideways too */
const wide = () => matchMedia('(max-height:520px) and (orientation:landscape)').matches;

/* ---------- ✋ holding / dragging a prop ---------- */
function holdKey(key, o){ o = o || {}; S.hold = {key, v: o.v || 0, turn: o.turn || 0, state: o.state, text: o.text}; select(null); $('iso').classList.add('holding'); [...document.querySelectorAll('.pcard')].forEach(c => c.classList.toggle('on', c.dataset.key === key)); showBar(); }
function drop(){ S.hold = null; S.ghost = null; $('iso').classList.remove('holding'); document.querySelectorAll('.pcard.on').forEach(c => c.classList.remove('on')); showBar(); }
function cardDown(e, key){ e.preventDefault(); const sx = e.clientX, sy = e.clientY; S.drag = {key, sx, sy, on: false, id: e.pointerId};
  const mv = ev => { if(!S.drag || ev.pointerId !== S.drag.id) return; if(!S.drag.on && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 9){ S.drag.on = true; holdKey(key); }
      if(S.drag.on) ghostAt(ev.clientX, ev.clientY); },
    up = ev => { if(!S.drag || ev.pointerId !== S.drag.id) return; removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); const d = S.drag; S.drag = null;
      if(!d.on){ if(S.hold && S.hold.key === key) drop(); else { holdKey(key); tip('👆 tap the map to place it · 🔄 turns it'); } sound('tap'); return; }
      ghostAt(ev.clientX, ev.clientY); const ok = S.ghost && S.ghost.ok; if(ok) placeHeld(); drop(); if(!ok) sound('error'); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up); }
// the ghost footprint under a screen point (CSS px) — green where it fits, red where it doesn't
function ghostAt(cx, cy){ const r = $('iso').getBoundingClientRect(), h = S.hold; if(!h){ S.ghost = null; return; } const def = Props.DEFS[h.key], T = Props.turner(def.foot[0], def.foot[1], h.turn);
  const g = Iso.place(S.V, cx - r.left, cy - r.top, {w: T.W, d: T.D}); if(!g){ S.ghost = null; return; }
  g.ok = Props.fits(S.M, h.key, g.i, g.j, {turn: h.turn}); g.it = Props.item(h.key, g.i, g.j, {v: h.v, turn: h.turn, look: S.look, cond: S.cond, state: h.state, text: h.text}); g.it.alpha = 0.62; S.ghost = g; }
function placeHeld(){ const g = S.ghost, h = S.hold; if(!g || !h) return null; const it = add(h.key, g.i, g.j, {v: h.v, turn: h.turn, state: h.state, text: h.text}); if(it){ sound('success'); pop(it); if(it.grow) tip('🌱 a ' + it.grow.names[it.state].toLowerCase() + ' — tap it, then 🌱 Grow'); } return it; }
function add(key, i, j, o){ const it = arPlace(key, i, j, Object.assign({look: S.look, cond: S.cond}, o || {})); if(!it){ S.missed.push(key + '@' + i + ',' + j); return null; }
  S.props.push(it); S.items.push(it); S.placed++; info(); return it; }
function del(it){ if(arWall(it.prop)) Props.AR.wallOff(S.M, it); else Props.remove(S.M, it); [S.props, S.items].forEach(a => { const k = a.indexOf(it); if(k >= 0) a.splice(k, 1); }); if(S.sel === it) select(null); info(); }
function pop(it){ it.popT = S.lastT || 0; }

/* ---------- 🧱 ar-4 AvataRealm walls: a piece JOINS its neighbours (Props.AR.wall / gate) · drag on the map = a wall line · ⭐ shrine capture steps ---------- */
const arWall = key => { const d = Props.DEFS[key]; return !!(d && d.wall && Props.AR); };
function arPlace(key, i, j, o){ const d = Props.DEFS[key]; if(!arWall(key)) return Props.place(S.M, key, i, j, o);
  const op = Object.assign({}, o, {tall: !!d.tall}); if(d.gate){ if(!(o.turn | 0)) delete op.turn; return Props.AR.gate(S.M, d.side, i, j, op); }
  delete op.state; return Props.AR.wall(S.M, d.side, i, j, op); }
const AR_CAP = [[{team: null, by: null, cap: null}, '⚪ neutral'], [{by: 'red', cap: 30}, '🔴 capturing 30 %'], [{by: 'red', cap: 70}, '🔴 capturing 70 %'], [{team: 'red', by: null, cap: null}, '🔴 owns it'],
  [{by: 'blue', cap: 50}, '🔵 taking it 50 %'], [{team: 'blue', by: null, cap: null}, '🔵 owns it']];
function arCapStep(it){ const pal = it.pal || {}, k = AR_CAP.findIndex(([q]) => ['team', 'by', 'cap'].every(f => (q[f] == null ? null : q[f]) === (pal[f] == null ? null : pal[f]))), nx = AR_CAP[(k + 1) % AR_CAP.length];
  Props.AR.set(it, nx[0], S.M); pop(it); return nx[1]; }
// ✋ holding a wall card: press on the map and drag → every cell you pass gets a piece (the map doesn't pan while you draw)
(function(){ let line = null; const cellAt = e => { const r = $('iso').getBoundingClientRect(), g = S.V && Iso.place(S.V, e.clientX - r.left, e.clientY - r.top, {w: 1, d: 1}); return g ? [g.i, g.j] : null; };
  const lay = e => { const c = cellAt(e); if(!c) return; const k = c[0] + ',' + c[1]; if(line.done[k]) return; line.done[k] = 1;
    if(Props.fits(S.M, line.key, c[0], c[1], {turn: 0}) && add(line.key, c[0], c[1], {v: S.hold.v})){ line.n++; sound('tap'); } };
  addEventListener('pointerdown', e => { if(e.target !== $('iso') || !S.hold || !arWall(S.hold.key) || Props.DEFS[S.hold.key].gate) return; e.stopPropagation(); e.preventDefault();
    line = {key: S.hold.key, id: e.pointerId, done: {}, n: 0}; lay(e); }, true);
  addEventListener('pointermove', e => { if(line && e.pointerId === line.id){ e.stopPropagation(); lay(e); } }, true);
  const end = e => { if(!line || e.pointerId !== line.id) return; e.stopPropagation(); const n = line.n; line = null; if(n) tip('🧱 ' + n + ' wall piece' + (n > 1 ? 's' : '') + ' — they join by themselves'); else { sound('error'); tip('❌ no free cell there'); } };
  addEventListener('pointerup', end, true); addEventListener('pointercancel', end, true); window.__arLine = () => line; })();
/* ---------- 🎯 picking a placed prop + the selection bar ---------- */
function select(it){ S.sel = it; showBar(); }
function showBar(){ const it = S.sel, h = S.hold, bar = $('selbar'); if(!it && !h){ bar.classList.add('hidden'); return; }
  const key = it ? it.prop : h.key, def = Props.DEFS[key]; $('sel-name').textContent = (h ? '✋ ' : '') + def.name + ' · ' + def.foot.join('×');
  const stNow = it ? it.state : h.state != null ? h.state : def.states ? Props.stateOf(key) : null; const plainWall = def.wall && !def.gate, shrine = key === 'realm_shrine' && !!it; $('s-state').classList.toggle('hidden', !(def.states && !plainWall) && !shrine); if(def.states && !plainWall) $('sel-name').textContent += ' · ' + stNow;   /* 🧱 ar-4: a wall's state = its joins (made by the helper) · ⭐ shrine = capture steps */
  growBar(def, stNow); touchBar(def, it);   /* 🌍 ip-6a */
  $('s-move').classList.toggle('hidden', !it); $('s-del').classList.toggle('hidden', !it); $('s-var').classList.toggle('hidden', def.variants < 2); bar.classList.remove('hidden'); placeUi(); }
// re-place a prop with new settings (turn / variant); it stays put when the new shape doesn't fit
function reshape(it, o){ const keep = {v: it.v, turn: it.turn, state: it.state, text: it.text}; Props.remove(S.M, it); const n = Props.place(S.M, it.prop, it.x, it.y, Object.assign({look: S.look, cond: S.cond}, keep, o));
  if(!n){ const back = Props.place(S.M, it.prop, it.x, it.y, Object.assign({look: S.look, cond: S.cond}, keep)); swap(it, back); shake($('selbar')); sound('error'); return; } swap(it, n); pop(n); select(n); sound('tap'); }
function swap(a, b){ [S.props, S.items].forEach(arr => { const k = arr.indexOf(a); if(k >= 0) arr[k] = b; }); if(S.sel === a) S.sel = b; }
$('s-turn').onclick = () => { if(S.hold){ S.hold.turn = (S.hold.turn + 1) % 4; sound('tap'); return; } if(S.sel) reshape(S.sel, {turn: (S.sel.turn + 1) % 4}); };
$('s-var').onclick = () => { const d = Props.DEFS[S.hold ? S.hold.key : S.sel && S.sel.prop]; if(!d) return; if(S.hold){ S.hold.v = (S.hold.v + 1) % d.variants; sound('tap'); return; } reshape(S.sel, {v: (S.sel.v + 1) % d.variants}); };
$('s-move').onclick = () => { const it = S.sel; if(!it) return; const o = {v: it.v, turn: it.turn, state: it.state, text: it.text}; del(it); holdKey(it.prop, o); tip('👆 tap where it should go'); sound('tap'); };
// 🔀 ip-3b a prop with states (gate open · closed · new, bridge down · lifted, hay bale whole · flat, pumpkin pile 1–12): flip it in place — the map follows (Props.setState)
$('s-state').onclick = () => { const key = S.hold ? S.hold.key : S.sel && S.sel.prop, d = Props.DEFS[key];
  if(!S.hold && S.sel && d && d.gate){ const open = S.sel.state !== 'ready'; Props.setGate(S.sel, open, S.M); if(open) S.sel.touchT = S.lastT || 0; showBar(); sound(open ? 'success' : 'tap'); tip((open ? '✨ ' : '🔒 ') + d.name + ' · ' + S.sel.state); return; }   /* 🧭 ip-6a gates */ if(!S.hold && S.sel && key === 'realm_shrine'){ tip('⭐ ' + arCapStep(S.sel)); sound('tap'); return; } if(!d || !d.states) return; const cur = S.hold ? (S.hold.state != null ? S.hold.state : Props.stateOf(key)) : S.sel.state, nx = d.states[(d.states.indexOf(cur) + 1) % d.states.length];
  if(S.hold){ S.hold.state = nx; } else { Props.setState(S.sel, nx, S.M); pop(S.sel); } showBar(); sound('tap'); tip('🔀 ' + d.name + ' · ' + nx); };
// 🌱 ip-3c growing props: ◀ Shrink · 🌱 Grow (at the young stage: ① / ② = the two branches, in their SkillKit colours) — Props.grow + the ✨ morph moment
function growBar(def, st){ const G = def.grow, ids = ['s-shrink', 's-grow', 's-grow2']; if(!G){ ids.forEach(x => $(x).classList.add('hidden')); return; }
  $('s-state').classList.add('hidden'); const n = parseInt(st, 10), br = String(st).slice(1) || null, young = n === G.branchAt - 1;
  $('sel-name').textContent = (S.hold && !S.sel ? '✋ ' : '🌱 ') + G.names[st];   /* the stage name says it all (a long prop name + size got cut on phones) */
  $('s-shrink').classList.toggle('hidden', n <= 1); $('s-grow').classList.toggle('hidden', n >= G.stages); $('s-grow2').classList.toggle('hidden', !young);
  const g1 = $('s-grow'), g2 = $('s-grow2'); label(g1, young ? '① ' + G.names[G.branchAt + 'a'] : '🌱 Grow'); label(g2, '② ' + G.names[G.branchAt + 'b']); g1.title = young ? '🌱 ① ' + G.names[G.branchAt + 'a'] : '🌱 Grow'; g2.title = '🌱 ② ' + G.names[G.branchAt + 'b'];
  g1.style.boxShadow = young ? 'inset 0 -4px 0 ' + G.colHex[G.branchAt + 'a'] : ''; g2.style.boxShadow = 'inset 0 -4px 0 ' + G.colHex[G.branchAt + 'b']; g1.dataset.branch = young ? 'a' : (br || ''); }
function growTo(delta, branch){ const key = S.hold ? S.hold.key : S.sel && S.sel.prop, d = Props.DEFS[key]; if(!d || !d.grow) return; const it = S.sel, cur = it ? it.state : (S.hold.state != null ? S.hold.state : Props.stateOf(key));
  const n = parseInt(cur, 10) + delta, br = branch || String(cur).slice(1) || 'a', nx = Props.growKey(key, n, br);
  if(S.hold){ S.hold.state = nx; } else { Props.grow(it, n, br, S.M); it.morphT = S.lastT || 0; } showBar(); sound(delta > 0 ? 'success' : 'tap'); tip((delta > 0 ? '✨ ' : '◀ ') + d.grow.names[nx]); }
$('s-grow').onclick = () => growTo(1, $('s-grow').dataset.branch || null);
$('s-grow2').onclick = () => growTo(1, 'b');
$('s-shrink').onclick = () => growTo(-1);
// ✨ the morph moment over a plant that just changed stage (🐣 rule: 1.2 s)
function morphs(g, V, t){ S.props.forEach(it => { if(it.morphT == null) return; if(!Props.morphFx(g, V, it, (t - it.morphT) / 1.2)) it.morphT = null; }); }
// 🌍 ip-6a ELEMENT TOUCH: a lamp / gate / any prop with def.touch shows ONE button = the next element that would change it (🔥 when out, 💧 when lit …);
//   tap = Props.touch + the ✨ 5-beat moment (Props.touchFx, 0.9 s) · the "try it here" ring (Props.touchHint) shows while it is picked
const EL_ICON = {fire: '🔥', water: '💧', nature: '🌱', earth: '🪨', wind: '🌪️', zap: '⚡', light: '✨', shadow: '🌑', ice: '❄️'};
S.touchI = 0;
function touchEls(it){ const d = it && Props.DEFS[it.prop]; return d && d.touch ? Object.keys(d.touch).filter(e => Props.canTouch(it, e) != null) : []; }
function touchElNow(){ const els = S.sel && !S.hold ? touchEls(S.sel) : []; return els.length ? els[S.touchI % els.length] : null; }
function touchBar(def, it){ const b = $('s-touch'), el = it && !S.hold ? touchElNow() : null; b.classList.toggle('hidden', !el); if(!el) return; label(b, EL_ICON[el] + ' ' + Props.ELEMENTS[el].name); b.title = EL_ICON[el] + ' touch with ' + Props.ELEMENTS[el].name; }
function touchNow(el){ const it = S.sel; el = el || touchElNow(); if(!it || !el) return null; const r = Props.touch(it, el, S.M); if(!r.changed) return r; it.touchT = S.lastT || 0; S.touchI++; showBar(); sound('success');
  tip(EL_ICON[el] + ' ' + Props.DEFS[it.prop].name + ' → ' + it.state); return r; }
$('s-touch').onclick = () => touchNow();
function touches(g, V, t){ S.props.forEach(it => { if(it.touchT == null) return; if(!Props.touchFx(g, V, it, (t - it.touchT) / (Props.TOUCH_MS / 1000))) it.touchT = null; }); }
function touchHints(g, V, t){ const el = touchElNow(); if(el) Props.touchHint(g, V, S.sel, el, t); }
S.touchNow = touchNow; S.touchElNow = touchElNow;
$('s-del').onclick = () => { if(S.sel){ del(S.sel); sound('pop'); } };
$('s-x').onclick = () => { drop(); select(null); };

/* ---------- 🧍 friends walking through (rule 12: avatar size 0.6 → ≈ 48 px, doors fit) ---------- */
const NAMES = ['Mia', 'Leo', 'Ploy', 'Kai'];
function makeWalkers(){ S.walkers.forEach(w => { const k = S.items.indexOf(w.it); if(k >= 0) S.items.splice(k, 1); }); S.walkers = [];
  if(!S.walk) return; const free = []; for(let j = 0; j < S.M.h; j++) for(let i = 0; i < S.M.w; i++) if(S.M.walk(i, j) && !Props.at(S.M, i, j)) free.push([i, j]);
  NAMES.forEach((name, n) => { const who = {name, av: typeof defaultAvatar === 'function' ? defaultAvatar(name) : {}}, sp = S.town ? townSpot(n, free) : [[9, 5], [12, 9], [9, 12], [6, 9]][n];
    const w = {who, x: sp[0] + 0.5, y: sp[1] + 0.5, path: null, pi: 0, wait: n * 0.6, dist: 0, flip: false, frames: [], free};
    for(let f = 0; f < Iso.WALK_N; f++) w.frames.push(Iso.avatar(who, {pose: 'walk', f, size: 0.6}));
    w.it = {x: w.x, y: w.y, z: 0, pic: w.frames[0], walker: true}; S.walkers.push(w); S.items.push(w.it); }); }
function wander(w){ let tgt = null; const doors = S.props.filter(p => p.door && S.M.walk(p.door.out.i, p.door.out.j));
  if(doors.length && Math.random() < 0.55){ const d = doors[Math.floor(Math.random() * doors.length)]; tgt = [d.door.out.i, d.door.out.j]; }   // visit a door now and then
  else { const fr = w.free.filter(c => S.M.walk(c[0], c[1])); if(!fr.length) return; tgt = fr[Math.floor(Math.random() * fr.length)]; }
  const p = Iso.path(S.M, {x: w.x, y: w.y}, {x: tgt[0] + 0.5, y: tgt[1] + 0.5}); if(p && p.length > 1){ w.path = p; w.pi = 1; } else w.wait = 0.5; }
function step(dt){ for(const w of S.walkers){ w.px = w.x; w.py = w.y;
    if(!w.path){ w.wait -= dt; if(w.wait <= 0) wander(w); continue; }
    const t = w.path[w.pi], dx = t.x - w.x, dy = t.y - w.y, d = Math.hypot(dx, dy), mv = 1.4 * dt;
    if(!S.M.walk(Math.floor(t.x), Math.floor(t.y))){ w.path = null; w.wait = 0.2; continue; }   // a prop landed on the path → think again
    if(d <= mv){ w.x = t.x; w.y = t.y; if(++w.pi >= w.path.length){ w.path = null; w.wait = 0.6 + Math.random() * 1.8; } } else { w.x += dx / d * mv; w.y += dy / d * mv; }
    w.dist += mv; const sdx = dx - dy; if(Math.abs(sdx) > 0.05) w.flip = sdx < 0; } }

/* ---------- 🎬 drawing ---------- */
let seeT = 0, lastInfo = 0;
function render(alpha, t){ S.lastT = t;
  for(const w of S.walkers){ const it = w.it; it.x = w.px + (w.x - w.px) * alpha; it.y = w.py + (w.y - w.py) * alpha; it.pic = w.frames[w.path ? Math.floor(w.dist * 3.2) % Iso.WALK_N : 0]; it.flip = w.flip; }
  Props.tick(S.props, t);
  if(t - seeT > 0.1){ seeT = t; Props.seeThrough(S.V, S.props, S.walkers.map(w => w.it)); }
  const st = Iso.frame(S.V, {items: S.items, t, groundFx: (g, V) => touchHints(g, V, t), overlay: (g, V) => { burst(g, V, t); morphs(g, V, t); touches(g, V, t); ringSel(g, V, t); ghostDraw(g, V, t); }});
  if(performance.now() - lastInfo > 400){ lastInfo = performance.now(); S.ms = st.ms; info(); }
}
function diamond(g, V, x, y, w, d, z){ const p = (a, b) => { const s = V.toScreen(a, b, z || 0); return [s.x - V._sx(), s.y - V._sy()]; }; g.beginPath(); [p(x, y), p(x + w, y), p(x + w, y + d), p(x, y + d)].forEach((q, k) => k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); }
// ✨ a placed prop lands with a ring burst (0.45 s)
function burst(g, V, t){ S.props.forEach(it => { if(!it.popT) return; const a = (t - it.popT) / 0.45; if(a >= 1 || a < 0){ if(a >= 1) it.popT = 0; return; }
    diamond(g, V, it.x + it.w / 2 - (it.w / 2 + a * 0.8), it.y + it.d / 2 - (it.d / 2 + a * 0.8), it.w + a * 1.6, it.d + a * 1.6, it.z); g.lineWidth = 3 * (1 - a) + 1; g.strokeStyle = 'rgba(255,214,90,' + (1 - a) + ')'; g.stroke(); }); }
function ringSel(g, V, t){ const it = S.sel; if(!it) return; diamond(g, V, it.x - 0.06, it.y - 0.06, it.w + 0.12, it.d + 0.12, it.z); g.lineWidth = 3; g.strokeStyle = 'rgba(255,200,69,' + (0.6 + 0.4 * Math.sin(t * 6)) + ')'; g.stroke();
  if(it.door){ diamond(g, V, it.door.out.i + 0.2, it.door.out.j + 0.2, 0.6, 0.6, it.z); g.fillStyle = 'rgba(46,196,182,.35)'; g.fill(); } }
function ghostDraw(g, V, t){ const G = S.ghost; if(!G || !S.hold) return; Iso.footprint(g, V, G, t); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); Iso.drawPic(g, V, G.it.pic, G.it.x, G.it.y, 0, {alpha: G.ok ? 0.7 : 0.4}); g.restore(); }
function info(){ const n = S.props.length, ms = S.ms != null ? ' · ⏱️ ' + S.ms.toFixed(1) + ' ms' : ''; $('info').textContent = n + ' props · 🎨 ' + Props.LOOKS[S.look].name + (S.cond ? ' · ' + Props.CONDS[S.cond].icon + ' ' + Props.CONDS[S.cond].name : '') + ms; }
function tip(s){ $('tip').textContent = s; $('tip').style.opacity = 1; clearTimeout(tip.t); tip.t = setTimeout(() => { $('tip').style.opacity = 0; }, 3200); }

/* ---------- 👆 taps on the map ---------- */
function tap(cell, px, py){ if(S.hold){ const r = $('iso').getBoundingClientRect(); ghostAt(px + r.left, py + r.top); if(S.ghost && S.ghost.ok){ placeHeld(); } else { sound('error'); tip('❌ it doesn’t fit there — try a free, flat spot'); } return; }
  const it = Props.hit(S.V, S.items, px, py) || (cell && Props.at(S.M, cell.i, cell.j)); select(it && it !== S.sel ? it : null); if(it) sound('tap'); }
const hover = e => { if(S.hold && !S.drag && e.pointerType === 'mouse') ghostAt(e.clientX, e.clientY); };
$('iso').addEventListener('pointermove', hover);

/* ---------- 🎨 map looks, tools, layout ---------- */
function setLook(k){ S.look = k; reskin(); 
  label($('t-look'), '🎨 ' + Props.LOOKS[k].name); renderCards(); info(); }
$('t-look').onclick = () => { setLook(LOOK_KEYS[(LOOK_KEYS.indexOf(S.look) + 1) % LOOK_KEYS.length]); sound('tap'); };
// 🍂 ip-3b rule 14: the condition (what happened here) stacks with the look (where) — every prop + the ground follow it
const COND_KEYS = Object.keys(Props.CONDS);
function reskin(){ S.props.forEach(it => { const n = Props.item(it.asked || it.prop, it.x, it.y, {v: it.v, turn: it.turn, look: S.look, cond: S.cond, z: it.z, state: it.state, text: it.text}); it.pic = n.pic; it.frames = n.frames; it.look = S.look; it.cond = n.cond; it.prop = n.prop; it.asked = n.asked; }); }   /* ip-3c: re-ask the swap */
function ground(){ if(S.M && S.M.setTheme) S.M.setTheme(Props.ground('meadow', S.cond)); }
function setCond(c){ S.cond = c && c !== 'fresh' ? c : null; reskin(); ground(); const C = Props.CONDS[S.cond || 'fresh']; label($('t-cond'), (C.icon || '🌿') + ' ' + C.name); renderCards(); info(); }
$('t-cond').onclick = () => { const cur = S.cond || 'fresh'; setCond(COND_KEYS[(COND_KEYS.indexOf(cur) + 1) % COND_KEYS.length]); sound('tap'); tip(S.cond ? (S.cond === 'ruined' ? '🏚️ ruined — holes, boards, rubble, bare trees' : '🍂 dry — faded, cracked, few leaves') : '🌿 fresh'); };
$('t-walk').onclick = () => { S.walk = !S.walk; $('t-walk').classList.toggle('on', S.walk); makeWalkers(); sound('tap'); };
$('t-village').onclick = () => { village(); sound('success'); };
$('t-clear').onclick = () => { [...S.props].forEach(del); drop(); makeWalkers(); sound('pop'); tip('🧹 an empty meadow — drag props on'); };
// the map fills the free area; a phone held upright starts closer (pan to explore, 🔍 Fit shows all)
function fitMap(close){ S.V.fit(); const p = pads(), fw = S.V.W - p.l - p.r, fh = S.V.H - p.t - p.b; if(close && fh > fw * 1.15) S.V.zoomAt(S.V.zoom * 1.6, p.l + fw / 2, p.t + fh / 2); }
$('t-fit').onclick = () => { fitMap(false); sound('tap'); };
function village(){ if(S.town || S.M.w !== 18){ S.town = null; N = 18; S.props = []; S.items = []; S.sel = null; newView(makeMap()); } [...S.props].forEach(del); S.missed = []; VILLAGE.forEach(([k, i, j, o]) => add(k, i, j, o)); select(null); drop(); makeWalkers(); }
function pads(){ const h = $('hud').getBoundingClientRect(), tr = $('tray').getBoundingClientRect(), sb = $('selbar');
  if(wide()) return {t: Math.round(h.bottom) + 6, b: 12, l: Math.round(tr.right) + 6, r: 6};
  return {t: Math.round(h.bottom) + 6, b: Math.round(innerHeight - tr.top) + 8, l: 6, r: 6}; }
function placeUi(){ const tr = $('tray').getBoundingClientRect(); document.documentElement.style.setProperty('--tray-h', Math.round(tr.height) + 'px'); document.documentElement.style.setProperty('--tray-w', wide() ? Math.round(tr.right) + 'px' : '0px');
  if(S.V) S.V.setPad(pads()); }   // 💬 Tell us finds its own free spot (UiKit UI.avoid keeps it off words + buttons)
setInterval(placeUi, 800); let lastWide = null; addEventListener('resize', () => requestAnimationFrame(() => { if(wide() !== lastWide){ lastWide = wide(); renderCards(); } placeUi(); }));

/* ---------- 🏗️ town tool (ip-2): Props.town lays out a whole village on a fresh map — 🎲 every seed mixes the road styles ---------- */
const TOWN_N = {hamlet: 16, village: 22, town: 30}, TOWN_SIZES = [['hamlet', '🏡 Hamlet'], ['village', '🏘️ Village'], ['town', '🏰 Town']];
function newView(M){ const old = $('iso'); if(S.V && S.V._ro) S.V._ro.disconnect(); if(S.V){ const cv = document.createElement('canvas'); cv.id = 'iso'; old.replaceWith(cv); cv.addEventListener('pointermove', hover); }
  S.M = M; if(S.cond) ground(); S.V = Iso.view($('iso'), M, {min: 0.35, max: 3, pad: pads()}); S.V.onTap = tap; placeUi(); }
function townMap(size, seed){ const n = TOWN_N[size], river = seed % 3 === 1 ? 1 : (seed % 3 === 2 && size !== 'hamlet' ? 2 : 0);
  const M = Iso.map({w: n, h: n, theme: 'meadow', seed, cell: (i, j) => { if(river === 1 && i < 2) return {t: 'water', h: 0}; if(river === 2 && j >= n - 2) return {t: 'water', h: 0};
    const r = Math.abs(Math.sin(i * 12.9898 + j * 78.233 + seed) * 43758.5453 % 1); return {t: r < 0.08 ? 'flower' : 'grass', h: 0}; }});
  return {M, area: river === 1 ? {i: 3, j: 1, w: n - 4, d: n - 2} : river === 2 ? {i: 1, j: 1, w: n - 2, d: n - 4} : null}; }
function makeTown(size, seed){ select(null); drop(); S.props = []; S.items = []; S.tsize = size; S.tseed = seed; N = TOWN_N[size];
  const G = townMap(size, seed); newView(G.M); const t0 = performance.now(), T = Props.town(G.M, {size, seed, look: S.look, cond: S.cond, area: G.area || undefined}); T.ms = performance.now() - t0;
  S.town = T; T.items.forEach(it => { S.props.push(it); S.items.push(it); }); S.placed = S.props.length; S.missed = T.missed.slice();
  makeWalkers(); fitMap(true); townInfo(); info(); return T; }
// walkers start on the town's plaza (the cells nearest T.spawn)
function townSpot(n, free){ const sp = S.town.spawn || {x: S.M.w / 2, y: S.M.h / 2}; const near = free.slice().sort((a, b) => Math.hypot(a[0] + 0.5 - sp.x, a[1] + 0.5 - sp.y) - Math.hypot(b[0] + 0.5 - sp.x, b[1] + 0.5 - sp.y)); return near[n * 2] || near[0] || [0, 0]; }
function townInfo(){ const T = S.town; if(!T){ $('towninfo').textContent = '📌 the hand-made sample village'; return; }
  $('towninfo').textContent = '🎲 seed ' + T.seed + ' · ' + T.style.replace('+', ' + ') + ' · 🏠 ' + T.count.homes + ' · 🛒 ' + T.count.shops + ' · 🌳 ' + T.count.trees + ' · ' + T.count.items + ' props'; }
function renderTownRow(){ const row = $('townrow'); row.innerHTML = '';
  const chip = (id, txt, on, fn) => { const b = document.createElement('button'); b.className = 'tab' + (on ? ' on' : ''); b.id = id; b.setAttribute('data-sound', 'none'); label(b, txt); b.onclick = () => { fn(); renderTownRow(); sound('tap'); }; row.appendChild(b); };
  TOWN_SIZES.forEach(([k, t]) => chip('tw-' + k, t, S.town && S.tsize === k, () => makeTown(k, S.tseed || 7)));
  chip('tw-new', '🎲 New town', false, () => { makeTown(S.tsize || 'village', ((S.tseed || 7) * 31 + 17) % 997); sound('success'); });
  chip('tw-sample', '📌 Sample', !S.town, () => { village(); fitMap(true); townInfo(); }); }
function townMode(on){ S.towning = on; $('tray').classList.toggle('towning', on); $('t-town').classList.toggle('on', on); $('townrow').classList.toggle('hidden', !on); $('towninfo').classList.toggle('hidden', !on);
  if(on){ if(!S.town) makeTown('village', 7); renderTownRow(); townInfo(); tip('🎲 every town mixes its roads — tap 🎲 New town for another'); } else renderCards(); placeUi(); }
$('t-town').onclick = () => { townMode(!S.towning); sound('tap'); };

/* ---------- 🔧 start ---------- */
async function start(){ const lt = $('load-text'), lt0 = lt.textContent; lt.textContent = '🌍 Fetching every look…';   /* 📦 ip-4a: the lab asks for all look files */
  S.lookFiles = await Props.need(Props.FILES); keysNow(); lt.textContent = lt0;
  renderTabs(); renderCards(); lastWide = wide(); label($('t-look'), '🎨 ' + Props.LOOKS[S.look].name);
  newView(makeMap());
  if(document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
  village(); fitMap(true);
  await Props.warm(S.props, S.V, {onProgress: f => { $('load-bar').style.width = Math.round(f * 100) + '%'; }});
  $('loading').style.opacity = 0; setTimeout(() => $('loading').classList.add('hidden'), 350); setTimeout(() => { $('tip').style.opacity = 0; }, 5000);
  S.loop = Iso.loop({update: step, render}); S.ready = true; }
S.add = add; S.del = del; S.holdKey = holdKey; S.drop = drop; S.ghostAt = ghostAt; S.placeHeld = placeHeld; S.select = select; S.setLook = setLook; S.setCond = setCond; S.growTo = growTo; S.village = village; S.makeTown = makeTown; S.townMode = townMode; S.reshape = reshape; S.tap = tap; S.pads = pads;
window.PLAB = S;
start();
})();
