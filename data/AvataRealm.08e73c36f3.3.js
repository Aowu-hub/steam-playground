
// ENGINE START — 🏰⚔️ AR = AvataRealm's rules with NO DOM (ar-r0b skeleton → ar-r1a 🌱 R1 engine, plan §13d + §16): node `AR.simulate` runs whole bot-vs-bot battles.
// Needs only an IsoKit map (Iso.map: w · h · inside · walk · get · set · setBlock · isVoid · ver) + a flow maker: AR.use({flow: Iso.flow}).
//   AR.land({size: 'S' | 'M' | 'L', teams: 2–6, seed}) → {w, h, cell(i, j), starts, centre, round, rich}   one floating island, FAIR start spots (mirrored / n-fold)
//   AR.resSpots · AR.freeNear · AR.fair(map, towns, centre) → walking-step spreads (middle · nearest rival · own 🪙 🧱)
//   M = AR.newMatch({map, teams: [{side, color, house: {i, j, w, d, turn?}, door: {i, j}, res: [{kind: 'c' | 'b', i, j, n}], human, level, ally}], level, seed, brawl, cap, rich, placer})
//   AR.step(M, dt) (30 / s) · AR.order(M, team, {attack} | {go: {x, y}} | {hold} | {home}, ids?) · AR.events: AR.takeEvents(M) → [{k, t, …}] (§13g names + build.* / bld.* / res.state)
//   🏘️ R1a: AR.SLOTS · AR.canPlace(M, t, slot, i, j, turn) → true | reason · AR.place(M, t, slot, i, j, turn) → building | reason · AR.autoSpot(M, t, slot) → {i, j, turn} | null
//           AR.train(M, t, role) → true | reason (queued at a finished building that makes it) · AR.houseUp(M, t) · AR.stageUp(M, t, role) (🎨 Wardrobe stages 1–3)
//           AR.guide(M, t) → 🌱 Basic step {k, n, of, text, slot?, spot?, role?, done} · AR.save(M) / AR.load(data, {map, placer}) · AR.inTerritory(M, t, i, j)
// Movement = ONE flow field per target house (shared by the whole army) + a small spatial hash for spacing. Damage lands on CONTACT (after a wind-up).
const AR = (function(){
'use strict';
const ROLES = {   // hp · atk · rng (tiles) · spd (tiles / s) · cd (s) · cost [🪙, 🧱] · tt = train seconds · from = the building that makes it
  worker: {hp: 40, atk: 3, rng: 0.9, spd: 2.3, cd: 1.2, cost: [50, 0], tt: 5, from: 'house'},
  foot:   {hp: 100, atk: 10, rng: 0.95, spd: 2.0, cd: 1.0, cost: [60, 20], tt: 7, from: 'camp'},
  spear:  {hp: 80, atk: 9, rng: 1.35, spd: 2.0, cd: 1.1, cost: [50, 30], tt: 7, from: 'camp'},
  archer: {hp: 60, atk: 8, rng: 4.5, spd: 2.0, cd: 1.4, cost: [60, 40], tt: 8, from: 'camp', shot: 1},
  rider:  {hp: 130, atk: 14, rng: 1.0, spd: 3.4, cd: 1.2, cost: [100, 50], tt: 11, from: 'ride'},
  flyer:  {hp: 70, atk: 8, rng: 2.2, spd: 3.0, cd: 1.1, cost: [90, 60], tt: 11, from: 'nest', fly: 1, shot: 1},
  healer: {hp: 60, atk: 0, heal: 9, rng: 3.0, spd: 2.1, cd: 1.5, cost: [70, 50], tt: 9, from: 'care'},
  siege:  {hp: 160, atk: 12, rng: 3.6, spd: 1.4, cd: 2.4, cost: [120, 120], tt: 15, from: 'workshop', bld: 3, shot: 1},
  mage:   {hp: 55, atk: 9, rng: 4.0, spd: 1.9, cd: 2.0, cost: [80, 60], tt: 11, from: 'spell', splash: 1.4, add: 1, shot: 1},
  spy:    {hp: 50, atk: 12, rng: 0.9, spd: 2.8, cd: 0.9, cost: [70, 40], tt: 9, from: 'hideout', add: 1},
  tamer:  {hp: 60, atk: 7, rng: 1.2, spd: 2.1, cd: 1.2, cost: [90, 50], tt: 11, from: 'den', add: 1},
  saint:  {hp: 70, atk: 0, heal: 6, rng: 2.5, spd: 1.9, cd: 2.0, cost: [110, 80], tt: 13, from: 'spell', add: 1, aura: 1},
  hero:   {hp: 320, atk: 18, rng: 1.2, spd: 2.4, cd: 1.0, cost: [0, 0], hero: 1},
};
const CORE = ['worker', 'foot', 'spear', 'archer', 'rider', 'flyer', 'healer', 'siege'], ADD = ['mage', 'spy', 'tamer', 'saint'], KEYS = Object.keys(ROLES);
// 🔄 counter wheel (§5 + §13l): attacker → roles it beats (× 1.5)
const BEATS = {foot: {spear: 1, spy: 1, siege: 1}, spear: {rider: 1}, archer: {flyer: 1, foot: 1}, rider: {archer: 1, mage: 1}, mage: {foot: 1, spear: 1},
  spy: {mage: 1, archer: 1, healer: 1, saint: 1}, tamer: {rider: 1}, flyer: {siege: 1}, hero: {}};
const CROWD = 1.5, HOUSE_HP = 1600, WIND = 0.2, HERO_BACK = 20, TERR = 4, QMAX = 5;
// 🏘️ the 11 building slots (same foot + door for EVERY side — 🌳 IsoProps `Props.AR.SLOTS`): foot w × d at turn 0, front = +y, door = column dx on the front edge
//   hp · cost [🪙, 🧱] · work = Bricklet-seconds to build · makes · add = 🔦+ only
const SLOTS = {
  house:    {w: 3, d: 2, dx: 1, hp: HOUSE_HP, makes: ['worker'], name: 'House'},
  camp:     {w: 2, d: 2, dx: 1, hp: 500, cost: [120, 60],  work: 18, makes: ['foot', 'spear', 'archer'], name: 'Costume Camp'},
  ride:     {w: 2, d: 3, dx: 1, hp: 550, cost: [150, 120], work: 22, makes: ['rider'], name: 'Ride-on House'},
  nest:     {w: 2, d: 2, dx: 1, hp: 450, cost: [150, 150], work: 22, makes: ['flyer'], name: 'Wing Nest'},
  care:     {w: 2, d: 2, dx: 1, hp: 400, cost: [100, 80],  work: 16, makes: ['healer'], name: 'Care Tent', heal: 3, healR: 2.5},
  workshop: {w: 2, d: 2, dx: 1, hp: 600, cost: [180, 200], work: 26, makes: ['siege'], name: 'Big Toy Workshop'},
  tower:    {w: 1, d: 1, dx: -1, hp: 500, cost: [80, 100], work: 16, makes: [], name: 'Watch Tower', shoot: {rng: 5, atk: 9, cd: 1.3}},
  wardrobe: {w: 2, d: 1, dx: 1, hp: 400, cost: [120, 120], work: 18, makes: [], name: 'Wardrobe', stages: 1},
  spell:    {w: 2, d: 2, dx: 1, hp: 450, cost: [160, 140], work: 22, makes: ['mage', 'saint'], name: 'Spell Tower', add: 1},
  hideout:  {w: 2, d: 2, dx: 1, hp: 420, cost: [140, 100], work: 20, makes: ['spy'], name: 'Hideout', add: 1},
  den:      {w: 2, d: 2, dx: 1, hp: 480, cost: [150, 110], work: 20, makes: ['tamer'], name: 'Critter Den', add: 1}};
const R1_SLOTS = ['camp', 'ride', 'nest', 'care', 'workshop', 'tower', 'wardrobe'];   // the 8 of R1 (+ 🏠 House); spell / hideout / den open at 🔦+
const HOUSE_UP = [null, null, {cost: [200, 150], work: 20, hp: 400}, {cost: [400, 300], work: 30, hp: 600}];   // 🏠 level 2 · 3 (each = more HP + a bigger army)
const STAGE_UP = [null, null, {cost: [60, 60], tt: 12}, {cost: [120, 120], tt: 16}];   // 🎨 Wardrobe: stage 2 🗡️ Armed (+10 % ⚔️) · stage 3 🎽 Trained (+10 % ❤️) (§14h)
// 🎚️ levels (§13d / §16h): the bot's speed, army size, build order, picks · cap top (🌱 12 · 🐣 16 · 🔦+ from the teams-alive table)
const LEVELS = [
  {k: 'basic', name: '🌱 Basic', max: 12, think: 7.5, wave: 9, waitYou: 1, workers: 3, add: 0, focus: 0, order: ['camp', 'care'], firstAttack: 360, upgrade: 0, house: 1, eco: 0.5},
  {k: 'junior', name: '🐣 Junior', max: 16, think: 5.0, wave: 8, workers: 4, add: 0, focus: 0, order: ['camp', 'tower', 'care', 'ride'], firstAttack: 270, upgrade: 0, house: 2, eco: 0.6},
  {k: 'inter', name: '🔦 Intermediate', max: 99, think: 4.0, wave: 8, workers: 5, add: 1, focus: 0.3, order: ['camp', 'ride', 'tower', 'care', 'wardrobe'], firstAttack: 170, upgrade: 2, house: 2, eco: 0.86},
  {k: 'hard', name: '⚡ Hard', max: 99, think: 3.4, wave: 9, workers: 5, add: 1, focus: 0.6, order: ['camp', 'ride', 'tower', 'wardrobe', 'care', 'nest'], firstAttack: 145, upgrade: 3, house: 3, eco: 0.93},
  {k: 'extreme', name: '🌋 Extreme', max: 99, think: 2.8, wave: 10, workers: 6, add: 1, focus: 0.8, order: ['camp', 'ride', 'wardrobe', 'tower', 'care', 'nest', 'workshop'], firstAttack: 135, upgrade: 3, house: 3, eco: 0.97, counter: 1},
  {k: 'hardcore', name: '💀 Hardcore', max: 99, think: 2.2, wave: 11, workers: 6, add: 1, focus: 1, order: ['camp', 'ride', 'wardrobe', 'tower', 'nest', 'care', 'workshop', 'spell'], firstAttack: 110, upgrade: 3, house: 3, eco: 1.08, counter: 1}];
// 👥 §14k: units per team by teams still alive (all together never over ~90) — a fallen town's share goes back to the others, never down mid-match
const CAP_ALIVE = {1: 20, 2: 20, 3: 18, 4: 16, 5: 15, 6: 14};
const MIX = ['foot', 'spear', 'archer', 'foot', 'rider', 'healer', 'archer', 'flyer', 'spear', 'siege'], MIX_ADD = ['mage', 'spy', 'tamer', 'saint'];
const SIZES = {S: [48, 32], M: [72, 48], L: [96, 64]};
const RES_N = 300, RES_RICH = 600, RES_BACK = 60, START = {c: 200, b: 100}, TRICKLE = {c: 2, b: 1};
let FLOW = null;

function rng(seed){ let a = (seed | 0) || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(i, j, s){ let h = (i * 374761393 + j * 668265263 + s * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

/* ---------- 🗺️ the land: one floating island + FAIR starts (Aowu 2026-11-18 00:03) ----------
   2 teams = the long island, point-mirrored · 3–6 teams = a ROUND island on a square map (S 40 · M 60 · L 78), towns evenly round it, ponds + edge n-fold.
   R1a: + `rich` = shared 💰 spots near the middle (one per team, same turn of the pattern for everyone) — they pull armies out of their towns. */
const ROUND = {S: 40, M: 60, L: 78};
function land(o){ o = o || {}; const key = SIZES[o.size] ? o.size : 'M', n = Math.max(2, Math.min(6, o.teams | 0 || 2)), seed = o.seed | 0 || 1, round = n >= 3;
  const w = round ? ROUND[key] : SIZES[key][0], h = round ? w : SIZES[key][1], cx = w / 2, cy = h / 2, starts = [], R0 = w * 0.33;
  const ang = t => Math.PI + t * 2 * Math.PI / n;
  if(!round){ const s0 = {i: Math.floor(w * 0.17), j: Math.floor(h / 2)}; starts.push(s0, {i: w - 1 - s0.i, j: h - 1 - s0.j}); }
  else for(let t = 0; t < n; t++){ const a = ang(t); starts.push({i: Math.round(cx - 0.5 + Math.cos(a) * R0), j: Math.round(cy - 0.5 + Math.sin(a) * R0)}); }
  const base = round ? [{rho: 0.62, phi: Math.PI / n, r: 2.3}, {rho: 1.18, phi: Math.PI / n * 0.55, r: 1.6}].concat(n <= 4 ? [{rho: 0.25, phi: Math.PI / n, r: 1.4}] : [])
                     : [{rho: 0.62, phi: Math.PI / 2, r: 2.4}, {rho: 1.05, phi: Math.PI / 3.2, r: 1.7}, {rho: 1.05, phi: -Math.PI / 3.2, r: 1.7}];
  const ponds = []; for(let t = 0; t < n; t++) base.forEach(b => { const a = ang(t) + b.phi, rr = b.rho * (round ? R0 : h * 0.42); ponds.push({x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, r: b.r}); });
  const edge = (x, y) => { const dx = x - cx, dy = y - cy, th = Math.atan2(dy, dx) - Math.PI, rho = Math.hypot(dx / (w / 2), dy / (h / 2));
    return rho + (round ? 0.025 * Math.cos(2 * n * th) + 0.015 * Math.cos(3 * n * th) : 0.03 * Math.cos(4 * th) + 0.02 * Math.cos(6 * th)); };
  const cell = (i, j) => { const x = i + 0.5, y = j + 0.5, d = edge(x, y); if(d > 1.0) return {t: 'void'};
    const c = {t: hash(Math.min(i, w - 1 - i), Math.min(j, h - 1 - j), seed) < 0.07 ? 'flower' : 'grass', h: 0};
    if(d > 0.94) c.fade = Math.max(0.15, (1.0 - d) / 0.06);
    for(const p of ponds){ const e = Math.hypot(x - p.x, y - p.y); if(e < p.r){ c.t = 'water'; c.block = 1; } else if(e < p.r + 0.9 && c.t !== 'water') c.t = 'sand'; }
    return c; };
  // 💰 rich spots: 2 teams = two, point-mirrored, beside the middle · 3–6 = one between each pair of neighbours, half-way out
  const rich = []; if(!round){ const r0 = {x: cx - 0.5, y: cy - h * 0.22}; rich.push({x: Math.floor(r0.x), y: Math.floor(r0.y)}, {x: w - 1 - Math.floor(r0.x), y: h - 1 - Math.floor(r0.y)}); }
  else for(let t = 0; t < n; t++){ const a = ang(t) + Math.PI / n; rich.push({x: Math.floor(cx + Math.cos(a) * R0 * 0.5), y: Math.floor(cy + Math.sin(a) * R0 * 0.5)}); }
  return {w, h, cell, starts, size: key, seed, round, rich, centre: {i: Math.floor(cx), j: Math.floor(cy)}}; }
const RES_PATTERN = [[-1, -4.5, 'c'], [-1, 4.5, 'c'], [2.5, -5.5, 'c'], [2.5, 5.5, 'c'], [-4.5, -3, 'b'], [-4.5, 3, 'b'], [-1.5, -7, 'b'], [-1.5, 7, 'b']];
function resSpots(map, s, centre){ const fx = centre.i - s.i, fy = centre.j - s.j, L = Math.hypot(fx, fy) || 1, f = [fx / L, fy / L], g = [-f[1], f[0]];
  return RES_PATTERN.map(([a, b, kind]) => ({kind, x: s.i + 0.5 + f[0] * a + g[0] * b, y: s.j + 0.5 + f[1] * a + g[1] * b})); }
function freeNear(map, x, y, home, ok){ const want = Math.hypot(x - home.i - 0.5, y - home.j - 0.5); let best = null, bs = 1e9;
  for(let r = 0; r <= 4 && !best; r++) for(let j = Math.floor(y) - r; j <= Math.floor(y) + r; j++) for(let i = Math.floor(x) - r; i <= Math.floor(x) + r; i++){
    if(!map.inside(i, j) || !map.walk(i, j) || (map.get(i, j).fade < 1) || (ok && !ok(i, j))) continue; const sc = Math.hypot(i + 0.5 - x, j + 0.5 - y) + Math.abs(Math.hypot(i + 0.5 - home.i - 0.5, j + 0.5 - home.j - 0.5) - want) * 2; if(sc < bs){ bs = sc; best = {i, j}; } }
  return best; }
function walkLen(map, from){ const w = map.w, h = map.h, G = new Float32Array(w * h).fill(Infinity), heap = [], k0 = from.j * w + from.i, free = (i, j) => i >= 0 && j >= 0 && i < w && j < h && map.walk(i, j);
  const push = k => { heap.push(k); let c = heap.length - 1; while(c > 0){ const q = (c - 1) >> 1; if(G[heap[q]] <= G[heap[c]]) break; [heap[q], heap[c]] = [heap[c], heap[q]]; c = q; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if(heap.length){ heap[0] = last; let c = 0; for(;;){ const l = c * 2 + 1, r = l + 1; let m = c; if(l < heap.length && G[heap[l]] < G[heap[m]]) m = l; if(r < heap.length && G[heap[r]] < G[heap[m]]) m = r; if(m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
  G[k0] = 0; push(k0); while(heap.length){ const k = pop(), i = k % w, j = (k / w) | 0;
    for(const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]){ const ni = i + a, nj = j + b; if(!free(ni, nj)) continue; if(a && b && (!free(i + a, j) || !free(i, j + b))) continue;
      const g2 = G[k] + (a && b ? 1.4142 : 1), nk = nj * w + ni; if(g2 < G[nk]){ G[nk] = g2; push(nk); } } }
  return (i, j) => (i < 0 || j < 0 || i >= w || j >= h || G[j * w + i] === Infinity) ? -1 : G[j * w + i]; }
function fair(map, towns, centre){ const cx = map.w / 2, cy = map.h / 2, mids = [];
  for(let j = Math.floor(cy - 2); j <= Math.ceil(cy + 2); j++) for(let i = Math.floor(cx - 2); i <= Math.ceil(cx + 2); i++) if(map.inside(i, j) && map.walk(i, j) && Math.hypot(i + 0.5 - cx, j + 0.5 - cy) <= 1.5) mids.push({i, j});
  const rows = towns.map((T, t) => { const at = walkLen(map, T.door), side = (i, j) => { let b = -1; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, c]) => { const v = at(i + a, j + c); if(v >= 0 && (b < 0 || v < b)) b = v; }); return b; };
    const enemy = Math.min(...towns.filter((_, q) => q !== t).map(o => { const v = at(o.door.i, o.door.j); return v < 0 ? 1e9 : v; })), rs = T.res.map(r => side(r.i, r.j)).filter(v => v >= 0);
    const mc = mids.map(c => at(c.i, c.j)).filter(v => v >= 0);
    return {centre: mc.length ? +Math.min(...mc).toFixed(1) : -1, enemy: +enemy.toFixed(1), res: rs.length ? +(rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) : -1, nres: rs.length}; });
  const spread = k => { const v = rows.map(r => r[k]); return (Math.max(...v) - Math.min(...v)) / Math.max(1, Math.max(...v)); };
  return {rows, centre: spread('centre'), enemy: spread('enemy'), res: spread('res'), ok: rows.every(r => r.centre >= 0 && r.enemy < 1e9 && r.nres === T0(towns))}; }
const T0 = towns => Math.min(...towns.map(T => T.res.length));

/* ---------- 🧱 footprints: the slot's foot at a turn (0 front +y · 1 front +x · 2 front −y · 3 front −x), its door cell OUTSIDE the front ---------- */
function foot(slot, i, j, turn){ const S = SLOTS[slot], t = ((turn | 0) % 4 + 4) % 4, w = t % 2 ? S.d : S.w, d = t % 2 ? S.w : S.d;
  let door = null; if(S.dx >= 0){ const a = S.dx, b = S.w - 1 - S.dx;
    door = t === 0 ? {i: i + a, j: j + d} : t === 1 ? {i: i + w, j: j + b} : t === 2 ? {i: i + b, j: j - 1} : {i: i - 1, j: j + a}; }
  return {i, j, w, d, turn: t, door}; }
// the default placer (node + tests): blocks the cells itself. The page passes its own (🌳 Props.place / Props.remove) through newMatch({placer}).
const PLAIN = {place(map, slot, f){ for(let j = f.j; j < f.j + f.d; j++) for(let i = f.i; i < f.i + f.w; i++) setBlock(map, i, j, 1); return {}; },
  remove(map, slot, f){ for(let j = f.j; j < f.j + f.d; j++) for(let i = f.i; i < f.i + f.w; i++) setBlock(map, i, j, 0); }};
function setBlock(map, i, j, b){ if(map.setBlock) map.setBlock(i, j, b); else map.set(i, j, {block: b}); }
function towardTurn(f0, from, to){ const dx = to.i - from.i, dy = to.j - from.j; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 0 : 2); }

/* ---------- 🧱 a plain town for node tests: a 3 × 2 House whose door faces the middle + the fair 🪙 🧱 pattern ---------- */
function plainTowns(map, starts, centre){ centre = centre || {i: map.w >> 1, j: map.h >> 1};
  return starts.map(s => { const turn = towardTurn(null, s, centre), f = foot('house', s.i - 1, s.j - 1, turn);
    PLAIN.place(map, 'house', f); let door = f.door; if(!map.walk(door.i, door.j)) door = freeNear(map, door.i + 0.5, door.j + 0.5, s) || door;
    const res = []; resSpots(map, door, centre).forEach(p => { const c = freeNear(map, p.x, p.y, door, (i, j) => Math.abs(i - door.i) + Math.abs(j - door.j) > 1 && !(i >= f.i - 1 && i <= f.i + f.w && j >= f.j - 1 && j <= f.j + f.d)); if(c){ setBlock(map, c.i, c.j, 1); res.push({kind: p.kind, i: c.i, j: c.j, n: RES_N}); } });
    return {house: {i: f.i, j: f.j, w: f.w, d: f.d, turn}, door, res}; }); }
function plainRich(map, Ld){ return (Ld.rich || []).map((p, q) => { const c = freeNear(map, p.x + 0.5, p.y + 0.5, {i: Ld.centre.i, j: Ld.centre.j}); if(!c) return null; setBlock(map, c.i, c.j, 1); return {kind: 'c', i: c.i, j: c.j, n: RES_RICH, rich: 1}; }).filter(Boolean); }

/* ---------- ⚔️ a match ---------- */
function newMatch(o){
  const map = o.map, L = Math.max(0, Math.min(5, o.level | 0)), R = rng(o.seed | 0 || 1);
  const M = {map, t: 0, R, level: L, lv: LEVELS[L], units: [], byId: new Map(), nid: 1, bid: 1, ev: [], teams: [], flows: new Map(), flowsMade: 0, over: false, winner: -1, youMoved: false,
    brawl: !!o.brawl, capOverride: o.cap || 0, grid: null, gw: 0, gh: 0, deadCount: 0, kills: 0, placer: o.placer || PLAIN, rich: (o.rich || []).map(r => Object.assign({n: RES_RICH, max: RES_RICH, rich: 1}, r)), blds: [], seed: o.seed | 0 || 1};
  M.rich.forEach(r => { r.max = r.max || r.n; r.back = -1; });
  M.gw = Math.ceil(map.w / 2); M.gh = Math.ceil(map.h / 2); M.grid = Array.from({length: M.gw * M.gh}, () => []);
  o.teams.forEach((T, t) => { const lv = LEVELS[T.level == null ? L : Math.max(0, Math.min(5, T.level))];
    const H = Object.assign({}, T.house), hb = {id: M.bid++, team: t, slot: 'house', i: H.i, j: H.j, w: H.w, d: H.d, turn: H.turn | 0, door: T.door, hp: HOUSE_HP, max: HOUSE_HP, prog: 1, done: true, lv: 1, q: [], qt: 0, up: null, it: T.houseIt || null};
    M.blds.push(hb);
    M.teams.push({id: t, side: T.side || 'blue', color: T.color || '#3A86FF', human: !!T.human, lv, house: hb, door: T.door, blds: [hb],
      res: (T.res || []).map(r => Object.assign({n: RES_N}, r, {max: r.max || r.n || RES_N, back: -1})), eco: {c: START.c, b: START.b}, alive: true, mode: 'hold', rally: null, think: 1 + R() * 2, mixI: t, trained: 0, lost: 0, kills: 0,
      cap: 0, heroT: -1, ally: T.ally == null ? t : T.ally, stage: {}, built: 0, counterHits: 0, sinceAttack: 0, waves: 0}); });
  M.teams.forEach(T => { T.cap = capFor(M, T.id); });
  M.teams.forEach(T => { spawn(M, T, 'hero'); const nw = M.brawl ? 2 : 3; for(let q = 0; q < nw; q++) spawn(M, T, 'worker'); });
  if(M.brawl){ M.teams.forEach(T => { T.mode = 'attack'; while(count(M, T) < T.cap) spawn(M, T, pickArmy(M, T, true)); }); }
  emit(M, 'match.start', {teams: M.teams.length});
  return M; }
function count(M, T){ let n = 0; for(const u of M.units) if(u.team === T.id && !u.dead && (M.brawl || u.role !== 'hero')) n++; return n; }   // 🧪 brawl (speed page) counts the hero like R0b
function queued(T){ let n = 0; for(const b of T.blds) n += b.q.filter(x => x.role).length; return n; }
// 👥 cap = the §14k table (teams alive) · topped by the level · the 🏠 House level: L1 −4 · L2 −2 · L3 full (🌱🐣: −2 · −1) · the 👑 hero never counts
function capFor(M, t){ if(M.capOverride) return M.capOverride; const T = M.teams[t], alive = M.teams.filter(x => x.alive).length, top = (T ? T.lv : M.lv).max;
  const full = Math.min(top, CAP_ALIVE[Math.max(1, alive)] || 14), hl = T && T.house ? T.house.lv : 3; return M.brawl ? full : Math.max(6, full - (3 - hl) * (top <= 16 ? 1 : 2)); }
function emit(M, k, o){ M.ev.push(Object.assign({k, t: +M.t.toFixed(2)}, o || {})); if(M.ev.length > 400) M.ev.splice(0, M.ev.length - 400); }
function takeEvents(M){ const e = M.ev; M.ev = []; return e; }
function stageOf(M, T, role){ return T.stage[role] || 1; }
function spawn(M, T, role, at){ const D = ROLES[role], d = at || T.door, a = M.R() * 6.283, r = 0.3 + M.R() * 0.6, st = stageOf(M, T, role), hp = Math.round(D.hp * (st >= 3 ? 1.1 : 1));
  const u = {id: M.nid++, team: T.id, role, x: d.i + 0.5 + Math.cos(a) * r, y: d.j + 0.5 + Math.sin(a) * r, px: 0, py: 0, hp, max: hp, cd: M.R() * 0.5, tgt: null, btg: null, swing: -1, hit: null,
    state: role === 'worker' ? 'seek' : 'army', carry: 0, res: null, dir: 1, walk: M.R() * 2, moving: false, fly: !!D.fly, born: M.t, dead: false, hurtT: -9, seed: (M.R() * 4) | 0, stage: st, sel: false};
  u.px = u.x; u.py = u.y; M.units.push(u); M.byId.set(u.id, u); return u; }
function canMake(M, T, role){ const D = ROLES[role]; if(!D || role === 'hero') return false; if(D.add && !T.lv.add) return false; return T.blds.some(b => b.done && b.hp > 0 && SLOTS[b.slot].makes.indexOf(role) >= 0); }
function pickArmy(M, T, any){ const add = T.lv.add || M.brawl, list0 = add && (T.mixI % 3 === 2) ? MIX_ADD : MIX;
  if(any){ const r = list0[T.mixI % list0.length]; T.mixI++; return r; }
  for(let k = 0; k < MIX.length + MIX_ADD.length; k++){ const list = add && (T.mixI % 3 === 2) ? MIX_ADD : MIX, r = list[T.mixI % list.length]; T.mixI++; if(canMake(M, T, r)) return r; }
  return null; }
// 👥 train = queue at a finished building that makes the role (cost paid now; the cap counts the queue) → spawns at that building's door after `tt` seconds
function train(M, t, role){ const T = M.teams[t]; if(!T || !T.alive) return 'down'; if(!ROLES[role] || role === 'hero') return 'role';
  if(ROLES[role].add && !T.lv.add) return 'locked';
  if(!M.brawl && !canMake(M, T, role)) return 'need';   // no finished building makes it yet
  if(count(M, T) + queued(T) >= T.cap) return 'cap';
  const c = ROLES[role].cost; if(T.eco.c < c[0] || T.eco.b < c[1]) return 'cost';
  if(M.brawl){ T.eco.c -= c[0]; T.eco.b -= c[1]; spawn(M, T, role); T.trained++; emit(M, 'unit.trained', {team: t, role}); return true; }
  let best = null; for(const b of T.blds) if(b.done && b.hp > 0 && SLOTS[b.slot].makes.indexOf(role) >= 0 && b.q.length < QMAX && (!best || b.q.length < best.q.length)) best = b;
  if(!best) return 'full'; T.eco.c -= c[0]; T.eco.b -= c[1]; best.q.push({role, tt: ROLES[role].tt}); emit(M, 'train.queued', {team: t, role, b: best.id}); return true; }
function stageUp(M, t, role){ const T = M.teams[t]; if(!T || !T.alive) return 'down'; const s = stageOf(M, T, role), next = STAGE_UP[s + 1]; if(!next || !ROLES[role] || role === 'hero') return 'max';
  const W = T.blds.find(b => b.slot === 'wardrobe' && b.done && b.hp > 0); if(!W) return 'need'; if(W.q.some(x => x.stage === role)) return 'busy'; if(W.q.length >= QMAX) return 'full';
  if(T.eco.c < next.cost[0] || T.eco.b < next.cost[1]) return 'cost'; T.eco.c -= next.cost[0]; T.eco.b -= next.cost[1]; W.q.push({stage: role, tt: next.tt}); return true; }
function houseUp(M, t){ const T = M.teams[t]; if(!T || !T.alive) return 'down'; const H = T.house, next = HOUSE_UP[H.lv + 1]; if(!next) return 'max'; if(H.up) return 'busy';
  if(T.eco.c < next.cost[0] || T.eco.b < next.cost[1]) return 'cost'; T.eco.c -= next.cost[0]; T.eco.b -= next.cost[1]; H.up = {prog: 0, work: next.work, to: H.lv + 1}; emit(M, 'house.up.start', {team: t, b: H.id, lv: H.lv + 1}); return true; }
function order(M, t, o, ids){ const T = M.teams[t]; if(!T) return; if(T.human && !o.hold && !o.home) M.youMoved = true;
  if(ids && ids.length){   // a picked group gets its own order (the rest keep the team's)
    for(const id of ids){ const u = M.byId.get(id); if(!u || u.dead || u.team !== t || u.role === 'worker') continue;
      if(o.attack) { u.own = {attack: true}; u.state = 'charge'; } else if(o.go) u.own = {go: {x: o.go.x + (M.R() - 0.5) * 1.6, y: o.go.y + (M.R() - 0.5) * 1.6}}; else if(o.target != null) u.own = {target: o.target}; else u.own = null; u.tgt = null; } return; }
  for(const u of M.units) if(u.team === t) { u.own = null; if(u.state === 'charge' && !o.attack) u.state = 'army'; }
  if(o.attack){ T.mode = 'attack'; T.rally = null; T.waves++; emit(M, 'army.attack', {team: t}); }
  else if(o.go){ T.mode = 'rally'; T.rally = {x: o.go.x, y: o.go.y}; } else if(o.hold || o.home){ T.mode = 'hold'; T.rally = null; } }

/* ---------- 🏘️ building: territory · can place · place · auto spot ---------- */
function inTerritory(M, t, i, j){ for(const b of M.teams[t].blds){ if(b.hp <= 0) continue; if(i >= b.i - TERR && i < b.i + b.w + TERR && j >= b.j - TERR && j < b.j + b.d + TERR) return true; } return false; }
function overlapsBld(M, f, gap){ for(const b of M.blds){ if(b.gone) continue; if(f.i < b.i + b.w + gap && f.i + f.w + gap > b.i && f.j < b.j + b.d + gap && f.j + f.d + gap > b.j) return b; } return null; }
function isRes(M, i, j){ for(const T of M.teams) for(const r of T.res) if(r.i === i && r.j === j) return true; for(const r of M.rich) if(r.i === i && r.j === j) return true; return false; }
function canPlace(M, t, slot, i, j, turn){ const T = M.teams[t], S = SLOTS[slot]; if(!T || !T.alive) return 'down'; if(!S || slot === 'house') return 'slot'; if(S.add && !T.lv.add) return 'locked';
  const f = foot(slot, i, j, turn), m = M.map;
  for(let y = f.j; y < f.j + f.d; y++) for(let x = f.i; x < f.i + f.w; x++){ if(!m.inside(x, y) || !m.walk(x, y) || m.get(x, y).fade < 1) return 'ground'; if(isRes(M, x, y)) return 'ground'; if(!inTerritory(M, t, x, y)) return 'territory'; }
  if(overlapsBld(M, f, 1)) return 'close';   // a free tile between buildings (IsoProps town rule T3)
  if(f.door && (!m.inside(f.door.i, f.door.j) || !m.walk(f.door.i, f.door.j))) return 'door';
  for(const u of M.units) if(!u.dead && !u.fly && u.x >= f.i && u.x < f.i + f.w && u.y >= f.j && u.y < f.j + f.d && u.team !== t) return 'units';
  if(seals(M, t, f)) return 'seal';
  return true; }
// 🚧 never seal: after blocking the foot, every House door must still reach the middle of the map
function seals(M, t, f){ const m = M.map, w = m.w, h = m.h, blocked = (i, j) => i >= f.i && i < f.i + f.w && j >= f.j && j < f.j + f.d, ok = (i, j) => i >= 0 && j >= 0 && i < w && j < h && m.walk(i, j) && !blocked(i, j);
  const seen = new Uint8Array(w * h), q = []; let goal = null; const cx = w >> 1, cy = h >> 1;
  for(let r = 0; r < 6 && !goal; r++) for(let j = cy - r; j <= cy + r && !goal; j++) for(let i = cx - r; i <= cx + r; i++) if(ok(i, j)){ goal = {i, j}; break; }
  if(!goal) return false; q.push(goal.j * w + goal.i); seen[goal.j * w + goal.i] = 1;
  for(let k = 0; k < q.length; k++){ const c = q[k], i = c % w, j = (c / w) | 0; for(const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const ni = i + a, nj = j + b; if(!ok(ni, nj)) continue; const n = nj * w + ni; if(seen[n]) continue; seen[n] = 1; q.push(n); } }
  return M.teams.some(T => T.alive && T.door && !seen[T.door.j * w + T.door.i]); }
function place(M, t, slot, i, j, turn, pre, force){ const ok = force ? true : canPlace(M, t, slot, i, j, turn); if(ok !== true) return ok;   /* force = 💾 load puts back what was saved */ const T = M.teams[t], S = SLOTS[slot];
  if(!pre){ if(T.eco.c < S.cost[0] || T.eco.b < S.cost[1]) return 'cost'; T.eco.c -= S.cost[0]; T.eco.b -= S.cost[1]; }
  const f = foot(slot, i, j, turn), it = M.placer.place(M.map, slot, f, T, 0); if(it === null) return 'ground';
  const b = {id: M.bid++, team: t, slot, i: f.i, j: f.j, w: f.w, d: f.d, turn: f.turn, door: f.door, hp: Math.round(S.hp * 0.2), max: S.hp, prog: 0, done: false, lv: 1, q: [], qt: 0, it, cd: 0, builders: 0};
  if(pre){ b.prog = 1; b.done = true; b.hp = b.max; }
  T.blds.push(b); M.blds.push(b); M.map.ver = M.map.ver; emit(M, 'build.place', {team: t, b: b.id, slot, i: f.i, j: f.j, turn: f.turn}); if(pre) emit(M, 'build.done', {team: t, b: b.id, slot});
  return b; }
// 🤖 / 🌱 a good free spot for a slot: rings round the House (behind first, never toward the rival), door turned toward the House door
function autoSpot(M, t, slot){ const T = M.teams[t], H = T.house, cx = H.i + H.w / 2, cy = H.j + H.d / 2, mx = M.map.w / 2, my = M.map.h / 2, fx = mx - cx, fy = my - cy, fl = Math.hypot(fx, fy) || 1;
  let best = null, bs = 1e9;
  for(let r = 2; r <= TERR + 3; r++) for(let j = Math.floor(cy) - r; j <= Math.floor(cy) + r; j++) for(let i = Math.floor(cx) - r; i <= Math.floor(cx) + r; i++){
    if(Math.max(Math.abs(i - cx), Math.abs(j - cy)) < r - 1) continue;
    for(let turn = 0; turn < 4; turn++){ const f = foot(slot, i, j, turn); if(!f.door && turn) break; const gx = f.i + f.w / 2 - cx, gy = f.j + f.d / 2 - cy, dist = Math.hypot(gx, gy), front = (gx * fx + gy * fy) / fl;
      let sc = dist + Math.max(0, front) * (slot === 'tower' ? -0.6 : 0.5) + (f.door ? Math.hypot(f.door.i - T.door.i, f.door.j - T.door.j) * 0.15 : 0);
      if(sc >= bs) continue; if(canPlace(M, t, slot, f.i, f.j, turn) !== true) continue; bs = sc; best = {i: f.i, j: f.j, turn}; } }
  return best; }

/* ---------- 🧭 flow fields: ONE per target house, every unit of every team that marches there shares it ---------- */
function goalsAround(M, H){ const out = [], m = M.map; for(let j = H.j - 1; j <= H.j + H.d; j++) for(let i = H.i - 1; i <= H.i + H.w; i++){ const inside = i >= H.i && i < H.i + H.w && j >= H.j && j < H.j + H.d; if(!inside && m.inside(i, j) && m.walk(i, j)) out.push({i, j}); } return out; }
function flowTo(M, tt){ return flowRect(M, 'h' + tt, M.teams[tt].house); }
function flowRect(M, key, R){ const k = key + ':' + M.map.ver; let F = M.flows.get(k); if(F) return F;
  for(const q of M.flows.keys()) if(q.indexOf(key + ':') === 0) M.flows.delete(q);
  F = (FLOW || plainFlow)(M.map, goalsAround(M, R), {diag: true}); M.flows.set(k, F); M.flowsAll = (M.flowsAll || 0) + 1; if(key[0] === 'h') M.flowsMade++; return F; }   /* flowsMade = House flows (shared by armies) */
// 🚶 walk to a rectangle (a site, a rock, a House) along its own flow field — never stuck behind a building
function goRect(M, u, key, R, dt, stop){ if(distRect(u.x, u.y, R) <= stop) { u.moving = false; return true; }
  const F = flowRect(M, key, R), i = Math.floor(u.x), j = Math.floor(u.y), n = F.next(i, j, {di: u.fdi || 0, dj: u.fdj || 0, seed: u.seed});
  if(!n || F.at(i, j) === 0) return moveToward(M, u, Math.max(R.i - 0.3, Math.min(u.x, R.i + R.w + 0.3)), Math.max(R.j - 0.3, Math.min(u.y, R.j + R.d + 0.3)), dt, 0.05) || distRect(u.x, u.y, R) <= stop;
  u.fdi = n.i - i; u.fdj = n.j - j; moveToward(M, u, n.i + 0.5, n.j + 0.5, dt); return false; }
// 🚩 walk to a point: straight when close, else along the flow field of the flag's cell (shared by everyone going there)
function walkTo(M, u, x, y, dt, stop, flag){ const f = flag || {x, y}, fi = Math.floor(f.x), fj = Math.floor(f.y); if(u.fly || Math.hypot(x - u.x, y - u.y) < 2.5 || !M.map.walk(fi, fj)) return moveToward(M, u, x, y, dt, stop);
  goRect(M, u, 'p' + fi + ',' + fj, {i: fi, j: fj, w: 1, d: 1}, dt, 1.5); return false; }
function plainFlow(m, goals){ const w = m.w, h = m.h, d = new Int32Array(w * h).fill(-1), q = []; goals.forEach(g => { d[g.j * w + g.i] = 0; q.push(g.j * w + g.i); });
  for(let k = 0; k < q.length; k++){ const c = q[k], i = c % w, j = (c / w) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const ni = i + a, nj = j + b; if(ni < 0 || nj < 0 || ni >= w || nj >= h) return; const n = nj * w + ni; if(d[n] >= 0 || !m.walk(ni, nj)) return; d[n] = d[c] + 1; q.push(n); }); }
  const at = (i, j) => (i < 0 || j < 0 || i >= w || j >= h) ? -1 : d[j * w + i];
  return {at, next(i, j){ let b = null, bv = at(i, j); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, c]) => { const v = at(i + a, j + c); if(v >= 0 && v < bv){ bv = v; b = {i: i + a, j: j + c}; } }); return b; }}; }

/* ---------- 📍 spacing: a small spatial hash, rebuilt every step (never all-against-all) ---------- */
function rehash(M){ const G = M.grid; for(let k = 0; k < G.length; k++) G[k].length = 0;
  for(const u of M.units){ if(u.dead) continue; const gi = Math.max(0, Math.min(M.gw - 1, (u.x / 2) | 0)), gj = Math.max(0, Math.min(M.gh - 1, (u.y / 2) | 0)); G[gj * M.gw + gi].push(u); } }
function near(M, x, y, r, fn){ const i0 = Math.max(0, ((x - r) / 2) | 0), i1 = Math.min(M.gw - 1, ((x + r) / 2) | 0), j0 = Math.max(0, ((y - r) / 2) | 0), j1 = Math.min(M.gh - 1, ((y + r) / 2) | 0), r2 = r * r;
  for(let j = j0; j <= j1; j++) for(let i = i0; i <= i1; i++){ const a = M.grid[j * M.gw + i]; for(let q = 0; q < a.length; q++){ const o = a[q], dx = o.x - x, dy = o.y - y; if(dx * dx + dy * dy <= r2) fn(o, dx * dx + dy * dy); } } }
function enemies(M, a, b){ return M.teams[a].ally !== M.teams[b].ally; }

/* ---------- 🚶 moving ---------- */
function canStand(M, u, x, y){ const i = Math.floor(x), j = Math.floor(y); if(!M.map.inside(i, j)) return false; if(u.fly) return !(M.map.isVoid && M.map.isVoid(i, j)); return M.map.walk(i, j); }
function moveToward(M, u, tx, ty, dt, stopAt){ const dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy); if(d <= (stopAt || 0.05)) { u.moving = false; return true; }
  const s = Math.min(d, ROLES[u.role].spd * dt), nx = u.x + dx / d * s, ny = u.y + dy / d * s;
  if(canStand(M, u, nx, ny)){ u.x = nx; u.y = ny; } else if(canStand(M, u, nx, u.y)) u.x = nx; else if(canStand(M, u, u.x, ny)) u.y = ny; else { u.stuck = (u.stuck || 0) + dt; if(u.stuck > 0.6 && !u.fly){ const n = freeNear(M.map, u.x, u.y, {i: Math.floor(u.x), j: Math.floor(u.y)}); if(n){ u.x = n.i + 0.5; u.y = n.j + 0.5; } u.stuck = 0; } }
  u.moving = true; const sdx = dx - dy; if(Math.abs(sdx) > 0.02) u.dir = sdx > 0 ? 1 : -1; return false; }
function followFlow(M, u, F, dt){ const i = Math.floor(u.x), j = Math.floor(u.y);
  if(u.fly){ const H = M.teams[u.goalT].house; return moveToward(M, u, H.i + H.w / 2, H.j + H.d / 2, dt, 1.2); }
  const n = F.next(i, j, {di: u.fdi || 0, dj: u.fdj || 0, seed: u.seed});
  if(!n){ if(F.at(i, j) === 0) { u.moving = false; return true; } const H = M.teams[u.goalT].house; return moveToward(M, u, H.i + H.w / 2, H.j + H.d / 2, dt, 1); }
  u.fdi = n.i - i; u.fdj = n.j - j; moveToward(M, u, n.i + 0.5, n.j + 0.5, dt); return false; }
function distRect(x, y, B){ const cx = Math.max(B.i, Math.min(x, B.i + B.w)), cy = Math.max(B.j, Math.min(y, B.j + B.d)); return Math.hypot(x - cx, y - cy); }
const distHouse = (u, H) => distRect(u.x, u.y, H);

/* ---------- 🎯 who to hit ---------- */
function canHit(a, b){ return !(b.fly && !ROLES[a.role].shot && !ROLES[a.role].hero && a.role !== 'spear'); }
function findTarget(M, u, r){ let best = null, bs = 1e9; const focus = M.teams[u.team].lv.focus;
  near(M, u.x, u.y, r, (o, d2) => { if(o.dead || !enemies(M, u.team, o.team) || !canHit(u, o)) return;
    let s = d2; if(BEATS[u.role] && BEATS[u.role][o.role]) s *= 0.55; if(focus) s *= 1 - focus * 0.4 * (1 - o.hp / o.max);
    if(u.role === 'spy' && (ROLES[o.role].shot || ROLES[o.role].heal)) s *= 0.5; if(s < bs){ bs = s; best = o; } }); return best; }
function findBld(M, u, r){ let best = null, bs = 1e9; for(const b of M.blds){ if(b.hp <= 0 || b.gone || !enemies(M, u.team, b.team)) continue; const d = distRect(u.x, u.y, b); if(d > r) continue; const s = d + (b.slot === 'tower' ? -1.5 : 0) + (b.slot === 'house' ? 1 : 0); if(s < bs){ bs = s; best = b; } } return best; }
function atkMul(M, u){ return stageOf(M, M.teams[u.team], u.role) >= 2 ? 1.1 : 1; }
function damage(M, a, b, base){ let dmg = base * atkMul(M, a), counter = false; if(BEATS[a.role] && BEATS[a.role][b.role]){ dmg *= CROWD; counter = true; }
  b.hp -= dmg; b.hurtT = M.t; if(counter){ M.teams[a.team].counterHits++; emit(M, 'counter.hit', {team: a.team, role: a.role, vs: b.role, x: +b.x.toFixed(1), y: +b.y.toFixed(1)}); }
  if(b.hp <= 0 && !b.dead) kill(M, b, a.team); }
function kill(M, b, by){ b.dead = true; M.kills++; if(by != null) M.teams[by].kills++; M.teams[b.team].lost++;
  if(b.role === 'hero'){ emit(M, 'hero.ko', {team: b.team}); M.teams[b.team].heroT = M.t + HERO_BACK; } }
function hitBld(M, b, dmg, by){ if(b.hp <= 0) return; b.hp -= dmg; b.hurtT = M.t; emit(M, b.slot === 'house' ? 'house.hit' : 'bld.hit', {team: b.team, by, b: b.id});
  if(b.hp <= 0 && b.slot !== 'house'){ b.hp = 0; b.ruinT = M.t; b.q.forEach(x => { if(x.role){ const c = ROLES[x.role].cost; M.teams[b.team].eco.c += c[0] * 0.5; M.teams[b.team].eco.b += c[1] * 0.5; } }); b.q = [];
    emit(M, b.slot === 'tower' ? 'tower.down' : 'bld.down', {team: b.team, by, b: b.id, slot: b.slot}); } }

/* ---------- ⏱️ one step (dt = 1 / 30 s) ---------- */
function step(M, dt){
  if(M.over && !M.brawl) return; M.t += dt; rehash(M);
  for(const T of M.teams){ if(!T.alive) continue; const em = T.human ? 1 : T.lv.eco; T.eco.c += TRICKLE.c * dt * em; T.eco.b += TRICKLE.b * dt * em;
    if(T.heroT > 0 && M.t >= T.heroT){ T.heroT = -1; spawn(M, T, 'hero'); }
    if(M.brawl){ T.refill = (T.refill || 0) - dt; if(T.refill <= 0 && count(M, T) < T.cap - (T.heroT > 0 ? 1 : 0)){ T.refill = 0.2; const u = spawn(M, T, pickArmy(M, T, true)); u.state = 'army'; } continue; }
    bldStep(M, T, dt); assignBuilders(M, T, dt);
    if(!T.human || T.auto){ T.think -= dt; if(T.think <= 0){ T.think = (T.auto ? T.auto.think : T.lv.think) * (0.8 + M.R() * 0.4); (T.auto ? autoBrain : brain)(M, T); } } }
  if(!M.brawl) resStep(M, dt);
  for(const u of M.units){ if(u.dead) continue; u.px = u.x; u.py = u.y; u.moving = false; if(u.cd > 0) u.cd -= dt; if(u.swing >= 0) swingStep(M, u, dt);
    else if(u.role === 'worker') workerStep(M, u, dt); else armyStep(M, u, dt);
    if(u.moving) u.walk += dt; }
  for(const u of M.units){ if(u.dead) continue; near(M, u.x, u.y, 0.55, (o, d2) => { if(o === u || o.dead || o.fly !== u.fly || d2 < 1e-6) return; const d = Math.sqrt(d2), p = (0.55 - d) * 0.25, nx = u.x - (o.x - u.x) / d * p, ny = u.y - (o.y - u.y) / d * p; if(canStand(M, u, nx, ny)){ u.x = nx; u.y = ny; } }); }
  let removed = false; for(let k = M.units.length - 1; k >= 0; k--){ const u = M.units[k]; if(u.dead){ M.units.splice(k, 1); M.byId.delete(u.id); M.deadCount++; removed = true; } }
  // 🏚️ ruins go away after 6 s (the cells open again)
  for(const b of M.blds){ if(b.hp <= 0 && !b.gone && b.slot !== 'house' && M.t - b.ruinT > 6){ b.gone = true; M.placer.remove(M.map, b.slot, b, b.it); const T = M.teams[b.team]; T.blds = T.blds.filter(x => x !== b); emit(M, 'bld.gone', {team: b.team, b: b.id}); } }
  M.blds = M.blds.filter(b => !b.gone);
  for(const T of M.teams){ if(T.alive && T.house.hp <= 0 && !M.brawl){ T.alive = false; emit(M, 'team.down', {team: T.id});
      for(const u of M.units) if(u.team === T.id) u.dead = true; T.blds.forEach(b => { if(b.hp > 0 && b !== T.house){ b.hp = 0; b.ruinT = M.t; } }); T.blds.forEach(b => { b.q = []; });
      const before = M.teams.map(x => x.cap); M.teams.forEach(x => { if(x.alive) x.cap = Math.max(x.cap, capFor(M, x.id)); });
      M.teams.forEach((x, q) => { if(x.alive && x.cap > before[q]) emit(M, 'army.up', {team: q, cap: x.cap, plus: x.cap - before[q]}); });
      const left = M.teams.filter(x => x.alive), allies = new Set(left.map(x => x.ally)); if(allies.size <= 1){ M.over = true; M.winner = left.length ? left[0].id : -1; emit(M, 'match.win', {team: M.winner}); } } }
  if(removed) rehash(M);
}
// 🏠 buildings each step: train queues · Wardrobe stages · House level-ups · 🗼 towers shoot · 🩹 Care Tent heals near it
function bldStep(M, T, dt){
  for(const b of T.blds){ if(b.hp <= 0) continue; const S = SLOTS[b.slot];
    if(b.done && b.q.length){ const x = b.q[0]; x.tt -= dt; if(x.tt <= 0){ b.q.shift();
        if(x.role){ if(count(M, T) < T.cap){ const u = spawn(M, T, x.role, b.door || T.door); T.trained++; emit(M, 'unit.trained', {team: T.id, role: x.role, b: b.id});
            if(T.mode === 'attack' && x.role !== 'worker') u.state = 'army'; if(T.mode === 'rally' && T.rally) u.state = 'army'; } else { const c = ROLES[x.role].cost; T.eco.c += c[0]; T.eco.b += c[1]; } }
        else if(x.stage){ T.stage[x.stage] = stageOf(M, T, x.stage) + 1; const st = T.stage[x.stage]; for(const u of M.units) if(u.team === T.id && u.role === x.stage){ u.stage = st; if(st === 3){ u.max = Math.round(u.max * 1.1); u.hp = Math.min(u.max, u.hp * 1.1); } }
          emit(M, 'stage.up', {team: T.id, role: x.stage, stage: st}); } } }
    if(S.shoot && b.done){ b.cd -= dt; if(b.cd <= 0 && b.wind == null){ const c = {x: b.i + 0.5, y: b.j + 0.5}; let best = null, bd = 1e9; near(M, c.x, c.y, S.shoot.rng, (o, d2) => { if(!o.dead && enemies(M, T.id, o.team) && d2 < bd){ bd = d2; best = o; } });
        if(best){ b.wind = 0.3; b.aim = best.id; emit(M, 'tower.aim', {team: T.id, b: b.id, to: best.id}); } else b.cd = 0.3; }
      if(b.wind != null){ b.wind -= dt; if(b.wind <= 0){ b.wind = null; b.cd = S.shoot.cd; const o = M.byId.get(b.aim); if(o && !o.dead){ o.hp -= S.shoot.atk; o.hurtT = M.t; emit(M, 'tower.shot', {team: T.id, b: b.id, to: o.id}); if(o.hp <= 0) kill(M, o, T.id); } } } }
    if(S.heal && b.done){ b.ht = (b.ht || 0) - dt; if(b.ht <= 0){ b.ht = 1; const c = {x: b.i + b.w / 2, y: b.j + b.d / 2}; near(M, c.x, c.y, S.healR + 1, o => { if(!o.dead && o.team === T.id && o.hp < o.max) o.hp = Math.min(o.max, o.hp + S.heal); }); } } } }
// 🪙 🧱 empty rocks / trees come back after a minute (a stump → a tree again)
function resStep(M, dt){ const each = r => { if(r.n <= 0 && r.back < 0){ r.back = RES_BACK; } if(r.back >= 0){ r.back -= dt; if(r.back < 0){ r.n = r.max; emit(M, 'res.state', {i: r.i, j: r.j, state: 'full', kind: r.kind}); } } };
  for(const T of M.teams) T.res.forEach(each); M.rich.forEach(each); }
function resState(r){ return r.n <= 0 ? 'empty' : r.n <= r.max / 2 ? 'half' : 'full'; }
function swingStep(M, u, dt){ u.swing += dt; const D = ROLES[u.role];
  if(u.swing >= WIND && u.hit){ const h = u.hit; u.hit = null;   // 💥 CONTACT — the game fires here (beats rule)
    if(h.b != null){ const B = M.blds.find(x => x.id === h.b); if(B && B.hp > 0) hitBld(M, B, D.atk * atkMul(M, u) * (D.bld || 1), u.team); }
    else { const b = M.byId.get(h.id); if(b && !b.dead){ if(D.heal){ b.hp = Math.min(b.max, b.hp + D.heal); if(D.aura) near(M, b.x, b.y, 1.8, o => { if(!o.dead && o.team === u.team) o.hp = Math.min(o.max, o.hp + D.heal * 0.5); }); }
        else { damage(M, u, b, D.atk); if(D.splash) near(M, b.x, b.y, D.splash, o => { if(o !== b && !o.dead && enemies(M, u.team, o.team)) damage(M, u, o, D.atk * 0.5); }); } } } }
  if(u.swing >= WIND + 0.25) u.swing = -1; }
function startSwing(M, u, hit){ u.swing = 0; u.hit = hit; u.cd = ROLES[u.role].cd * (0.92 + M.R() * 0.16);
  let tx, ty; if(hit.b != null){ const B = M.blds.find(x => x.id === hit.b); tx = B.i + B.w / 2; ty = B.j + B.d / 2; } else { const o = M.byId.get(hit.id); tx = o.x; ty = o.y; }
  const sdx = (tx - u.x) - (ty - u.y); if(Math.abs(sdx) > 0.02) u.dir = sdx > 0 ? 1 : -1; }
function armyStep(M, u, dt){ const D = ROLES[u.role], T = M.teams[u.team];
  if(D.heal){ let best = null, bh = 0.95; near(M, u.x, u.y, 6, o => { if(o.dead || o.team !== u.team || o === u) return; const f = o.hp / o.max; if(f < bh){ bh = f; best = o; } });
    if(best){ const d = Math.hypot(best.x - u.x, best.y - u.y); if(d <= D.rng){ if(u.cd <= 0) startSwing(M, u, {id: best.id}); } else moveToward(M, u, best.x, best.y, dt, D.rng * 0.8); return; } }
  else { const going = !u.own && T.mode === 'rally' && T.rally && Math.hypot(T.rally.x - u.x, T.rally.y - u.y) > 2.5;   /* 🚩 walking to the rally flag: only hit what is in reach, never chase */
    let tg = u.tgt ? M.byId.get(u.tgt) : null; if(going) tg = findTarget(M, u, D.rng + 0.3); else if(!tg || tg.dead || Math.hypot(tg.x - u.x, tg.y - u.y) > 7) tg = findTarget(M, u, D.shot ? D.rng + 2.5 : 5); u.tgt = tg ? tg.id : null;
    if(tg && !(u.own && u.own.go)){ const d = Math.hypot(tg.x - u.x, tg.y - u.y); if(d <= D.rng + 0.15){ if(u.cd <= 0) startSwing(M, u, {id: tg.id}); } else moveToward(M, u, tg.x, tg.y, dt, D.rng * 0.9); return; }
    // 🏚️ an enemy building near (not while walking to a picked spot)
    const marching = T.mode === 'attack' || u.state === 'charge' || (u.own && (u.own.attack || u.own.target != null));
    if(!(u.own && u.own.go)){ const B = (u.own && u.own.target != null) ? M.blds.find(x => x.id === u.own.target && x.hp > 0) : findBld(M, u, marching ? 4 : 2.5);
      if(B){ const d = distRect(u.x, u.y, B); if(d <= D.rng + 0.6){ if(u.cd <= 0) startSwing(M, u, {b: B.id}); } else if(u.fly || d < 4) moveToward(M, u, B.i + B.w / 2, B.j + B.d / 2, dt, D.rng + 0.4); else { u.goalT = B.team; followFlow(M, u, flowTo(M, B.team), dt); } return; }
      if(u.own && u.own.target != null) u.own = null; } }
  if(u.own && u.own.go){ if(walkTo(M, u, u.own.go.x, u.own.go.y, dt, 0.3)) u.own = {hold: true}; return; }
  if(u.own && u.own.hold) return;
  if(T.mode === 'attack' || u.state === 'charge' || (u.own && u.own.attack)){ const gt = goalTeam(M, u.team); if(gt < 0) return; u.goalT = gt; const H = M.teams[gt].house;
    if(distHouse(u, H) <= D.rng + 0.6 && !D.heal){ if(u.cd <= 0) startSwing(M, u, {b: H.id}); return; }
    followFlow(M, u, flowTo(M, gt), dt); return; }
  if(T.mode === 'rally' && T.rally){ walkTo(M, u, T.rally.x + Math.cos(u.id) * 1.2, T.rally.y + Math.sin(u.id) * 1.2, dt, 0.3, T.rally); return; }
  const d = T.door, gx = d.i + 0.5 + Math.cos(u.id * 1.7) * 3, gy = d.j + 0.5 + Math.sin(u.id * 1.7) * 2; if(canStand(M, u, gx, gy)) moveToward(M, u, gx, gy, dt, 0.4); else moveToward(M, u, d.i + 0.5, d.j + 0.5, dt, 1.2); }
function goalTeam(M, t){ let best = -1, bd = 1e9; const me = M.teams[t].house;
  M.teams.forEach((T, q) => { if(!T.alive || !enemies(M, t, q)) return; let d = Math.hypot(T.house.i - me.i, T.house.j - me.j); const mine = M.teams[t]; if(!mine.human && !T.human && (mine.lv.k === 'basic' || mine.lv.k === 'junior')) d *= 0.6;   /* 🌱🐣 bots pick on other bots first */
    if(d < bd){ bd = d; best = q; } }); return best; }

/* ---------- ⛑️ Bricklets: gather (own rocks / trees + 💰 rich spots) · build sites (up to 2 a site, 3 for the House) ---------- */
function sitesOf(T){ return T.blds.filter(b => b.hp > 0 && (!b.done || b.up)); }
function assignBuilders(M, T, dt){ T.aT = (T.aT || 0) - dt; if(T.aT > 0) return; T.aT = 0.5;
  const sites = sitesOf(T); for(const s of sites){ const want = s.slot === 'house' ? 3 : 2; let have = 0; for(const u of M.units) if(u.team === T.id && u.role === 'worker' && u.site === s.id) have++;
    while(have < want){ let best = null, bd = 1e9; for(const u of M.units){ if(u.team !== T.id || u.role !== 'worker' || u.dead || u.site) continue; const d = distRect(u.x, u.y, s) + (u.carry ? 4 : 0); if(d < bd){ bd = d; best = u; } }
      if(!best) break; best.site = s.id; best.state = 'build'; have++; } } }
function workerStep(M, u, dt){ const T = M.teams[u.team];
  if(u.state === 'build'){ const s = T.blds.find(b => b.id === u.site && b.hp > 0 && (!b.done || b.up)); if(!s){ u.site = null; u.state = u.carry ? 'back' : 'seek'; return; }
    if(!goRect(M, u, 'b' + s.id, s, dt, 0.9)) return;
    u.working = M.t;
    if(!s.done){ const S = SLOTS[s.slot], p0 = s.prog; s.prog = Math.min(1, s.prog + dt / S.work); s.hp = Math.min(s.max, s.hp + s.max * 0.8 * dt / S.work);
      [0.33, 0.66].forEach(k => { if(p0 < k && s.prog >= k) emit(M, 'build.step', {team: T.id, b: s.id, pct: Math.round(k * 100)}); });
      if(s.prog >= 1){ s.done = true; s.hp = Math.max(s.hp, Math.round(s.max * 0.98)); T.built++; emit(M, 'build.done', {team: T.id, b: s.id, slot: s.slot}); } }
    else if(s.up){ const p0 = s.up.prog; s.up.prog = Math.min(1, s.up.prog + dt / s.up.work); if(s.up.prog >= 1){ s.lv = s.up.to; const add = HOUSE_UP[s.lv].hp; s.max += add; s.hp += add; s.up = null;
        const c0 = T.cap; T.cap = Math.max(T.cap, capFor(M, T.id)); emit(M, 'house.up', {team: T.id, b: s.id, lv: s.lv}); if(T.cap > c0) emit(M, 'army.up', {team: T.id, cap: T.cap, plus: T.cap - c0}); } }
    return; }
  const pool = () => T.res.concat(M.rich);
  if(u.state === 'seek'){ let best = null, bd = 1e9; const want = T.eco.b > 300 ? 'c' : T.eco.c > 300 ? 'b' : T.eco.c / 1.6 < T.eco.b ? 'c' : 'b'; for(const r of pool()){ if(r.n <= 0) continue; const d = Math.hypot(r.i + 0.5 - u.x, r.j + 0.5 - u.y) * (r.kind === want ? 1 : 1.6) * (r.rich ? 1.2 : 1); if(d < bd){ bd = d; best = r; } }
    if(!best){ u.state = 'idle'; u.idleT = 1.5; return; } u.res = best; u.state = 'go'; }
  if(u.state === 'go'){ const r = u.res; if(!r || r.n <= 0){ u.state = 'seek'; return; } if(goRect(M, u, 'r' + r.i + ',' + r.j, {i: r.i, j: r.j, w: 1, d: 1}, dt, 0.5)){ u.state = 'dig'; u.dig = 1.6; } return; }
  if(u.state === 'dig'){ u.dig -= dt; if(u.dig <= 0){ const r = u.res, n = Math.min(10, r.n), s0 = resState(r); r.n -= n; u.carry = n; u.ck = r.kind; u.state = 'back'; const s1 = resState(r); if(s1 !== s0) emit(M, 'res.state', {i: r.i, j: r.j, state: s1, kind: r.kind}); } return; }
  if(u.state === 'back'){ const H = T.house; if(goRect(M, u, 'h' + T.id, H, dt, 0.8)){ T.eco[u.ck] += u.carry * (T.human ? 1 : T.lv.eco); u.carry = 0; u.state = 'seek'; } return; }
  if(u.state === 'idle'){ u.idleT -= dt; if(u.idleT <= 0) u.state = 'seek'; } }

/* ---------- 🤖 the bot brain (one per team, thinks every few seconds by level) ---------- */
function armyCount(M, T){ let n = 0; for(const u of M.units) if(u.team === T.id && !u.dead && u.role !== 'worker' && u.role !== 'hero') n++; return n; }
function workerCount(M, T){ let n = 0; for(const u of M.units) if(u.team === T.id && !u.dead && u.role === 'worker') n++; for(const b of T.blds) n += b.q.filter(x => x.role === 'worker').length; return n; }
function nextBuild(M, T, order){ for(const s of order){ if(SLOTS[s].add && !T.lv.add) continue; if(!T.blds.some(b => b.slot === s && b.hp > 0)) return s; } return null; }
function botBuild(M, T, order){ if(sitesOf(T).some(b => !b.done)) return false; const s = nextBuild(M, T, order); if(!s) return false; const S = SLOTS[s];
  if(T.eco.c < S.cost[0] || T.eco.b < S.cost[1]) return 'save'; const sp = autoSpot(M, T.id, s); if(!sp) return false; return place(M, T.id, s, sp.i, sp.j, sp.turn) && true; }
function counterPick(M, T){ const seen = {}; for(const u of M.units) if(!u.dead && enemies(M, T.id, u.team) && u.role !== 'worker' && u.role !== 'hero') seen[u.role] = (seen[u.role] || 0) + 1;
  let top = null, tn = 0; for(const r in seen) if(seen[r] > tn){ tn = seen[r]; top = r; } if(!top || tn < 3) return null;
  for(const a in BEATS) if(BEATS[a][top] && canMake(M, T, a)) return a; return null; }
function brain(M, T){ const lv = T.lv, workers = workerCount(M, T), army = armyCount(M, T);
  if(workers < lv.workers){ train(M, T.id, 'worker'); }
  const b = botBuild(M, T, lv.order);
  if(b !== 'save' || army < 3){ const r = (lv.counter && counterPick(M, T)) || pickArmy(M, T); if(r) train(M, T.id, r); }
  if(lv.house > T.house.lv && !T.house.up && army >= 4) houseUp(M, T.id);
  if(lv.upgrade && army >= 5){ const roles = Object.keys(ROLES).filter(r => r !== 'hero' && r !== 'worker' && canMake(M, T, r)); for(const r of roles) if(stageOf(M, T, r) < Math.min(3, lv.upgrade)) { if(stageUp(M, T.id, r) === true) break; } }
  if(T.mode !== 'attack'){ const you = M.teams.find(x => x.human && x.alive && enemies(M, T.id, x.id));
    const ready = army >= Math.min(lv.wave, T.cap - lv.workers) && M.t >= lv.firstAttack * Math.max(1, Math.min(1.3, 60 / M.map.w));   /* a small map = a short walk → the bot waits a little longer (same fairness on S · M · L) */
    if(ready && !(lv.waitYou && you && !M.youMoved && armyCount(M, you) < 6)) { T.mode = 'attack'; T.waves++; emit(M, 'bot.attack', {team: T.id, army}); } }
  else if(army < 2){ T.mode = 'hold'; } }   // 🏠 the wave is gone → build up again
// 🧑 the "careful player" auto-brain for balance tests (node): good build order, counter picks, attacks with a full army, comes home when it melts
const AUTO = {think: 2.5, workers: 6, order: ['camp', 'ride', 'tower', 'wardrobe', 'care', 'nest', 'workshop'], wave: 12, house: 3, upgrade: 3};
function autoBrain(M, T){ const A = T.auto, workers = workerCount(M, T), army = armyCount(M, T), wantW = Math.min(A.workers, Math.max(3, Math.round(T.cap * 0.3)));
  if(workers < wantW) train(M, T.id, 'worker');
  const camp = T.blds.some(b => b.slot === 'camp' && b.done), under = M.units.some(u => !u.dead && enemies(M, T.id, u.team) && u.role !== 'worker' && distRect(u.x, u.y, T.house) < TERR + 3);
  let save = false; if(camp && A.house > T.house.lv && !T.house.up){ if(houseUp(M, T.id) !== true) save = !under && army >= 3; }
  if(!save){ const b = botBuild(M, T, A.order); if(b !== 'save' || army < 4 || under){ const r = counterPick(M, T) || pickArmy(M, T); if(r) train(M, T.id, r); } }
  if(!save && army >= 5 && T.eco.c > 250){ const roles = Object.keys(ROLES).filter(r => r !== 'hero' && r !== 'worker' && canMake(M, T, r)); for(const r of roles) if(stageOf(M, T, r) < A.upgrade) { if(stageUp(M, T.id, r) === true) break; } }
  const full = Math.max(5, Math.min(A.wave, T.cap - wantW)); if(T.mode !== 'attack' && army >= full) { order(M, T.id, {attack: true}); T.wave0 = army; }
  else if(T.mode === 'attack' && army < Math.max(2, (T.wave0 || 6) * 0.35)) order(M, T.id, {home: true}); }

/* ---------- 🌱 Basic guide: one goal line at a time (§16h) ---------- */
const GUIDE = [
  {k: 'gather', text: '⛑️ Bricklets gather by themselves — train 1 more at the 🏠 House', role: 'worker', done: (M, T) => workerCount(M, T) >= 4},
  {k: 'camp', text: '🏕️ Build a Costume Camp — the glowing spot is a good one', slot: 'camp', done: (M, T) => T.blds.some(b => b.slot === 'camp')},
  {k: 'wait', text: '🔨 Your Bricklets are building it…', done: (M, T) => T.blds.some(b => b.slot === 'camp' && b.done)},
  {k: 'train', text: '🛡️ Train 3 Stompers at the Camp', role: 'foot', n: 3, done: (M, T) => roleCount(M, T, 'foot') >= 3},
  {k: 'more', text: '🔱 Train 3 Pokelancers — they stop riders!', role: 'spear', n: 3, done: (M, T) => roleCount(M, T, 'spear') >= 3},
  {k: 'attack', text: '⚔️ Tap ALL, then the rival 🏠 House!', done: (M, T) => T.mode === 'attack' || M.units.some(u => u.team === T.id && u.own && (u.own.attack || u.own.target != null))},
  {k: 'win', text: '🏠 Knock down the rival House!', done: M => M.over}];
function roleCount(M, T, r){ let n = 0; for(const u of M.units) if(u.team === T.id && !u.dead && u.role === r) n++; for(const b of T.blds) n += b.q.filter(x => x.role === r).length; return n; }
function guide(M, t){ const T = M.teams[t]; T.gi = T.gi || 0; while(T.gi < GUIDE.length - 1 && GUIDE[T.gi].done(M, T)) T.gi++;
  const G = GUIDE[T.gi], out = {k: G.k, n: T.gi + 1, of: GUIDE.length, text: G.text, done: G.done(M, T)}; if(G.role) out.role = G.role; if(G.slot){ out.slot = G.slot; out.spot = autoSpot(M, t, G.slot); } return out; }

/* ---------- 💾 save / load a battle (plan §13f: counts, not logs) ---------- */
const r1 = v => Math.round(v * 10) / 10;
function save(M){ return {v: 1, t: r1(M.t), lv: M.level, seed: M.seed, mv: M.youMoved ? 1 : 0,
  teams: M.teams.map(T => ({s: T.side, c: T.color, h: T.human ? 1 : 0, lv: LEVELS.indexOf(T.lv), a: T.alive ? 1 : 0, al: T.ally, e: [Math.round(T.eco.c), Math.round(T.eco.b)], m: T.mode, r: T.rally ? [r1(T.rally.x), r1(T.rally.y)] : 0,
    st: T.stage, hT: T.heroT > 0 ? r1(T.heroT - M.t) : 0, tr: T.trained, k: T.kills, lo: T.lost, bu: T.built, ch: T.counterHits, gi: T.gi || 0,
    res: T.res.map(r => [r.kind, r.i, r.j, r.n, r.max]), door: [T.door.i, T.door.j],
    b: T.blds.filter(b => b.hp > 0).map(b => [b.slot, b.i, b.j, b.turn, Math.round(b.hp), r1(b.prog), b.lv, b.q.map(x => [x.role || ('*' + x.stage), r1(x.tt)]), b.up ? r1(b.up.prog) : 0, b.max])})),
  rich: M.rich.map(r => [r.kind, r.i, r.j, r.n, r.max]),
  u: M.units.filter(u => !u.dead).map(u => [u.team, u.role, r1(u.x), r1(u.y), Math.round(u.hp), u.state === 'charge' ? 1 : 0])}; }
// load: rebuild the match on a FRESH map of the same land (the page builds the island + decor again; this puts every building + unit back)
function load(data, o){ const map = o.map, placer = o.placer || PLAIN;
  const M = newMatch({map, placer, level: data.lv, seed: (data.seed | 0) + 7, rich: data.rich.map(r => ({kind: r[0], i: r[1], j: r[2], n: r[3], max: r[4]})),
    teams: data.teams.map((T, t) => { const hb = T.b.find(b => b[0] === 'house'); return {side: T.s, color: T.c, human: !!T.h, level: T.lv, ally: T.al, house: {i: hb[1], j: hb[2], w: SLOTS.house.w, d: SLOTS.house.d, turn: hb[3]}, door: {i: T.door[0], j: T.door[1]}, res: T.res.map(r => ({kind: r[0], i: r[1], j: r[2], n: r[3], max: r[4]})), houseIt: o.houseIt ? o.houseIt(t) : null}; })});
  M.units.length = 0; M.byId.clear(); M.t = data.t; M.youMoved = !!data.mv;
  data.teams.forEach((S, t) => { const T = M.teams[t]; T.eco = {c: S.e[0], b: S.e[1]}; T.alive = !!S.a; T.mode = S.m; T.rally = S.r ? {x: S.r[0], y: S.r[1]} : null; T.stage = S.st || {}; T.heroT = S.hT ? M.t + S.hT : -1;
    T.trained = S.tr; T.kills = S.k; T.lost = S.lo; T.built = S.bu; T.counterHits = S.ch; T.gi = S.gi;
    S.b.forEach(B => { let b; if(B[0] === 'house'){ b = T.house; f2(b, B); b.lv = B[6]; }
      else { b = place(M, t, B[0], B[1], B[2], B[3], true, true); if(!b || !b.id) return; f2(b, B); }
      b.q = B[7].map(x => x[0][0] === '*' ? {stage: x[0].slice(1), tt: x[1]} : {role: x[0], tt: x[1]}); if(B[8]) b.up = {prog: B[8], work: HOUSE_UP[b.lv + 1].work, to: b.lv + 1}; });
    T.cap = capFor(M, t); });
  function f2(b, B){ b.hp = B[4]; b.prog = B[5]; b.done = B[5] >= 1; b.max = B[9] || b.max; }
  data.u.forEach(U => { const T = M.teams[U[0]]; if(!T.alive) return; const u = spawn(M, T, U[1]); u.x = u.px = U[2]; u.y = u.py = U[3]; u.hp = Math.min(u.max, U[4]); if(U[5]) u.state = 'charge'; });
  takeEvents(M); return M; }

/* ---------- 🧪 node: whole battles, bot vs bot (or the careful auto-player vs a level) ---------- */
function setup(o){ const Iso = o.Iso, Ld = land({size: o.size || 'S', teams: o.teams || 2, seed: o.seed || 1});
  const map = Iso.map({w: Ld.w, h: Ld.h, theme: 'meadow', seed: Ld.seed, cell: Ld.cell}), towns = plainTowns(map, Ld.starts, Ld.centre), rich = plainRich(map, Ld);
  const lv = o.levels || [], teams = towns.map((T, t) => Object.assign({side: 'side' + t, level: lv[t] == null ? o.level : lv[t], ally: o.allies ? o.allies[t] : t, human: !!(o.auto && t === 0)}, T));
  const M = newMatch({map, teams, level: o.level | 0, seed: o.seed || 1, brawl: o.brawl, cap: o.cap, rich});
  if(o.auto){ M.teams[0].auto = Object.assign({}, AUTO, o.auto === true ? {} : o.auto); M.teams[0].lv = LEVELS[o.autoLevel == null ? 3 : o.autoLevel]; M.teams[0].cap = capFor(M, 0); }
  return {M, Ld, map}; }
function simulate(o){ o = o || {}; const {M} = setup(o); const dt = 1 / 30, tmax = o.tmax || 1200, ev = {}; let maxUnits = 0;
  while(!M.over && M.t < tmax){ step(M, dt); for(const e of takeEvents(M)){ ev[e.k] = (ev[e.k] || 0) + 1; if(o.onEvent) o.onEvent(e, M); } if(M.units.length > maxUnits) maxUnits = M.units.length; if(o.onStep) o.onStep(M); }
  return {winner: M.winner, t: Math.round(M.t), alive: M.teams.map(T => T.alive), trained: M.teams.map(T => T.trained), built: M.teams.map(T => T.built), kills: M.kills, events: ev, flows: M.flowsMade, maxUnits, caps: M.teams.map(T => T.cap), M}; }

return {walkLen, ROLES, CORE, ADD, KEYS, BEATS, LEVELS, CAP_ALIVE, SIZES, ROUND, RES_PATTERN, CROWD, HERO_BACK, SLOTS, R1_SLOTS, HOUSE_UP, STAGE_UP, GUIDE, AUTO, TERR, QMAX,
  land, plainTowns, plainRich, resSpots, freeNear, fair, foot, newMatch, step, order, train, stageUp, houseUp, canPlace, place, autoSpot, inTerritory, canMake, guide, save, load, takeEvents, capFor, setup, simulate, resState,
  count: (M, t) => count(M, M.teams[t]), army: (M, t) => armyCount(M, M.teams[t]),
  use(o){ if(o && o.flow) FLOW = o.flow; }, _flowTo: flowTo, _spawn: (M, t, r) => spawn(M, M.teams[t], r)};
})();
if(typeof module !== 'undefined') module.exports = AR;
// ENGINE END

