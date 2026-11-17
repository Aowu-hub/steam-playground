
// ENGINE START — 🏰⚔️ AR = AvataRealm's rules with NO DOM (ar-r0b skeleton, plan §13d): node `AR.simulate` runs whole bot-vs-bot battles.
// Needs only an IsoKit map (Iso.map: w · h · inside · walk · isVoid · block · ver) + a flow maker: AR.use({flow: Iso.flow}).
//   AR.land({size: 'S' | 'M' | 'L', teams: 2–6, seed}) → {w, h, cell(i, j), starts: [{i, j}], centre, round}   one floating island, FAIR start spots (mirrored / n-fold)
//   AR.resSpots(map, start, centre) · AR.freeNear(map, x, y, home, ok) · AR.fair(map, towns, centre) → walking-step spreads (middle · nearest rival · own 🪙 🧱)
//   M = AR.newMatch({map, teams: [{side, color, house: {i, j, w, d}, door: {i, j}, res: [{kind: 'c' | 'b', i, j, n}], human, level}], level, seed, brawl, cap})
//   AR.step(M, dt) (30 / s) · AR.order(M, team, {attack: true} | {go: {x, y}} | {hold: true}) · AR.train(M, team, role) → true | reason
//   AR.takeEvents(M) → [{k, t, …}] (§13g names) · AR.capFor(M, team) · AR.simulate(o) → {winner, t, alive, trained, kills, events}
// Movement = ONE flow field per target house (shared by the whole army) + a small spatial hash for spacing. Damage lands on CONTACT (after a wind-up).
const AR = (function(){
'use strict';
const ROLES = {   // hp · atk · rng (tiles) · spd (tiles / s) · cd (s) · cost [🪙, 🧱] — first numbers, tuned with simulate in R1
  worker: {hp: 40, atk: 3, rng: 0.9, spd: 2.3, cd: 1.2, cost: [50, 0]},
  foot:   {hp: 100, atk: 10, rng: 0.95, spd: 2.0, cd: 1.0, cost: [60, 20]},
  spear:  {hp: 80, atk: 9, rng: 1.35, spd: 2.0, cd: 1.1, cost: [50, 30]},
  archer: {hp: 60, atk: 8, rng: 4.5, spd: 2.0, cd: 1.4, cost: [60, 40], shot: 1},
  rider:  {hp: 130, atk: 14, rng: 1.0, spd: 3.4, cd: 1.2, cost: [100, 50]},
  flyer:  {hp: 70, atk: 8, rng: 2.2, spd: 3.0, cd: 1.1, cost: [90, 60], fly: 1, shot: 1},
  healer: {hp: 60, atk: 0, heal: 9, rng: 3.0, spd: 2.1, cd: 1.5, cost: [70, 50]},
  siege:  {hp: 160, atk: 12, rng: 3.6, spd: 1.4, cd: 2.4, cost: [120, 120], bld: 3, shot: 1},
  mage:   {hp: 55, atk: 9, rng: 4.0, spd: 1.9, cd: 2.0, cost: [80, 60], splash: 1.4, add: 1, shot: 1},
  spy:    {hp: 50, atk: 12, rng: 0.9, spd: 2.8, cd: 0.9, cost: [70, 40], add: 1},
  tamer:  {hp: 60, atk: 7, rng: 1.2, spd: 2.1, cd: 1.2, cost: [90, 50], add: 1},
  saint:  {hp: 70, atk: 0, heal: 6, rng: 2.5, spd: 1.9, cd: 2.0, cost: [110, 80], add: 1, aura: 1},
  hero:   {hp: 320, atk: 18, rng: 1.2, spd: 2.4, cd: 1.0, cost: [0, 0], hero: 1},
};
const CORE = ['worker', 'foot', 'spear', 'archer', 'rider', 'flyer', 'healer', 'siege'], ADD = ['mage', 'spy', 'tamer', 'saint'], KEYS = Object.keys(ROLES);
// 🔄 counter wheel (§5 + §13l): attacker → roles it beats (× 1.5) — Stomper > Pokelancer · Pokelancer > rider · Twangster > Flapper + Stomper · rider > Twangster ·
//   Wizzle > crowds (Stomper / Pokelancer) · Sneakster > Wizzle + back row · Stomper + towers spot Sneakster · Bonkwagon × 3 on buildings
const BEATS = {foot: {spear: 1, spy: 1}, spear: {rider: 1}, archer: {flyer: 1, foot: 1}, rider: {archer: 1, mage: 1}, mage: {foot: 1, spear: 1},
  spy: {mage: 1, archer: 1, healer: 1, saint: 1}, tamer: {rider: 1}, flyer: {siege: 1}, hero: {}};
const CROWD = 1.5, HOUSE_HP = 1600, WIND = 0.2, HERO_BACK = 20;
// 🎚️ levels (§13d): the bot's speed, wave size, picks · cap top (🌱 12 · 🐣 16 · 🔦+ from the teams-alive table)
const LEVELS = [
  {k: 'basic', name: '🌱 Basic', max: 12, think: 6.0, wave: 9, waitYou: 1, workers: 3, add: 0, focus: 0},
  {k: 'junior', name: '🐣 Junior', max: 16, think: 4.8, wave: 8, workers: 4, add: 0, focus: 0},
  {k: 'inter', name: '🔦 Intermediate', max: 99, think: 3.9, wave: 7, workers: 4, add: 1, focus: 0.3},
  {k: 'hard', name: '⚡ Hard', max: 99, think: 3.2, wave: 7, workers: 5, add: 1, focus: 0.6},
  {k: 'extreme', name: '🌋 Extreme', max: 99, think: 2.6, wave: 6, workers: 5, add: 1, focus: 0.8},
  {k: 'hardcore', name: '💀 Hardcore', max: 99, think: 2.1, wave: 6, workers: 6, add: 1, focus: 1}];
// 👥 §14k: units per team by teams still alive (all together never over ~90) — a fallen town's share goes back to the others, never down mid-match
const CAP_ALIVE = {1: 20, 2: 20, 3: 18, 4: 16, 5: 15, 6: 14};
const MIX = ['foot', 'spear', 'archer', 'foot', 'rider', 'healer', 'archer', 'flyer', 'spear', 'siege'], MIX_ADD = ['mage', 'spy', 'tamer', 'saint'];
const SIZES = {S: [48, 32], M: [72, 48], L: [96, 64]};
let FLOW = null;

function rng(seed){ let a = (seed | 0) || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(i, j, s){ let h = (i * 374761393 + j * 668265263 + s * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

/* ---------- 🗺️ the land: one floating island + FAIR starts (Aowu 2026-11-18 00:03 "starting point vs each landing point — balance it out") ----------
   2 teams = the long island, everything point-mirrored (cell i, j ↔ w−1−i, h−1−j): both ends see the same ground, ponds and edge.
   3–6 teams = a ROUND island on a square map (S 40 · M 60 · L 78 — about the same ground as 48 × 32 · 72 × 48 · 96 × 64), towns evenly round it like a clock,
   ponds + edge repeat once per team (n-fold), so every start has the same way to the middle, its neighbours and its own 🪙 🧱. AR.fair() measures it. */
const ROUND = {S: 40, M: 60, L: 78};
function land(o){ o = o || {}; const key = SIZES[o.size] ? o.size : 'M', n = Math.max(2, Math.min(6, o.teams | 0 || 2)), seed = o.seed | 0 || 1, round = n >= 3;
  const w = round ? ROUND[key] : SIZES[key][0], h = round ? w : SIZES[key][1], cx = w / 2, cy = h / 2, starts = [], R0 = round ? w * 0.33 : w * 0.33;
  const ang = t => Math.PI + t * 2 * Math.PI / n;
  if(!round){ const s0 = {i: Math.floor(w * 0.17), j: Math.floor(h / 2)}; starts.push(s0, {i: w - 1 - s0.i, j: h - 1 - s0.j}); }
  else for(let t = 0; t < n; t++){ const a = ang(t); starts.push({i: Math.round(cx - 0.5 + Math.cos(a) * R0), j: Math.round(cy - 0.5 + Math.sin(a) * R0)}); }
  // 💧 ponds: ONE pattern per team (polar, from the team's own angle), copied round for every team
  const base = round ? [{rho: 0.62, phi: Math.PI / n, r: 2.3}, {rho: 1.18, phi: Math.PI / n * 0.55, r: 1.6}].concat(n <= 4 ? [{rho: 0.25, phi: Math.PI / n, r: 1.4}] : [])
                     : [{rho: 0.62, phi: Math.PI / 2, r: 2.4}, {rho: 1.05, phi: Math.PI / 3.2, r: 1.7}, {rho: 1.05, phi: -Math.PI / 3.2, r: 1.7}];
  const ponds = []; for(let t = 0; t < n; t++) base.forEach(b => { const a = ang(t) + b.phi, rr = b.rho * (round ? R0 : h * 0.42); ponds.push({x: cx + Math.cos(a) * rr * (round ? 1 : 1), y: cy + Math.sin(a) * rr, r: b.r}); });
  const edge = (x, y) => { const dx = x - cx, dy = y - cy, th = Math.atan2(dy, dx) - Math.PI, rho = Math.hypot(dx / (w / 2), dy / (h / 2));
    return rho + (round ? 0.025 * Math.cos(2 * n * th) + 0.015 * Math.cos(3 * n * th) : 0.03 * Math.cos(4 * th) + 0.02 * Math.cos(6 * th)); };   /* n-fold / point symmetric wobble */
  const cell = (i, j) => { const x = i + 0.5, y = j + 0.5, d = edge(x, y); if(d > 1.0) return {t: 'void'};
    const c = {t: hash(Math.min(i, w - 1 - i), Math.min(j, h - 1 - j), seed) < 0.07 ? 'flower' : 'grass', h: 0};
    if(d > 0.94) c.fade = Math.max(0.15, (1.0 - d) / 0.06);
    for(const p of ponds){ const e = Math.hypot(x - p.x, y - p.y); if(e < p.r){ c.t = 'water'; c.block = 1; } else if(e < p.r + 0.9 && c.t !== 'water') c.t = 'sand'; }
    return c; };
  return {w, h, cell, starts, size: key, seed, round, centre: {i: Math.floor(cx), j: Math.floor(cy)}}; }
// 🪙 🧱 the SAME resource pattern for every team, turned to face the middle (forward = toward the centre, mirrored left / right)
const RES_PATTERN = [[-1, -4.5, 'c'], [-1, 4.5, 'c'], [2.5, -5.5, 'c'], [2.5, 5.5, 'c'], [-4.5, -3, 'b'], [-4.5, 3, 'b'], [-1.5, -7, 'b'], [-1.5, 7, 'b']];
function resSpots(map, s, centre){ const fx = centre.i - s.i, fy = centre.j - s.j, L = Math.hypot(fx, fy) || 1, f = [fx / L, fy / L], g = [-f[1], f[0]];
  return RES_PATTERN.map(([a, b, kind]) => ({kind, x: s.i + 0.5 + f[0] * a + g[0] * b, y: s.j + 0.5 + f[1] * a + g[1] * b})); }
// the nearest free cell to a wanted spot, keeping the same distance from home as close as we can
function freeNear(map, x, y, home, ok){ const want = Math.hypot(x - home.i - 0.5, y - home.j - 0.5); let best = null, bs = 1e9;
  for(let r = 0; r <= 4 && !best; r++) for(let j = Math.floor(y) - r; j <= Math.floor(y) + r; j++) for(let i = Math.floor(x) - r; i <= Math.floor(x) + r; i++){
    if(!map.inside(i, j) || !map.walk(i, j) || (map.get(i, j).fade < 1) || (ok && !ok(i, j))) continue; const sc = Math.hypot(i + 0.5 - x, j + 0.5 - y) + Math.abs(Math.hypot(i + 0.5 - home.i - 0.5, j + 0.5 - home.j - 0.5) - want) * 2; if(sc < bs){ bs = sc; best = {i, j}; } }
  return best; }
// ⚖️ fairness: walking steps from every House door → the middle · the nearest rival door · its own coin rocks + brick trees
function walkLen(map, from){ const w = map.w, h = map.h, G = new Float32Array(w * h).fill(Infinity), heap = [], k0 = from.j * w + from.i, free = (i, j) => i >= 0 && j >= 0 && i < w && j < h && map.walk(i, j);   /* real walking length: 8 ways, a diagonal = 1.41, no corner cutting */
  const push = k => { heap.push(k); let c = heap.length - 1; while(c > 0){ const q = (c - 1) >> 1; if(G[heap[q]] <= G[heap[c]]) break; [heap[q], heap[c]] = [heap[c], heap[q]]; c = q; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if(heap.length){ heap[0] = last; let c = 0; for(;;){ const l = c * 2 + 1, r = l + 1; let m = c; if(l < heap.length && G[heap[l]] < G[heap[m]]) m = l; if(r < heap.length && G[heap[r]] < G[heap[m]]) m = r; if(m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
  G[k0] = 0; push(k0); while(heap.length){ const k = pop(), i = k % w, j = (k / w) | 0;
    for(const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]){ const ni = i + a, nj = j + b; if(!free(ni, nj)) continue; if(a && b && (!free(i + a, j) || !free(i, j + b))) continue;
      const g2 = G[k] + (a && b ? 1.4142 : 1), nk = nj * w + ni; if(g2 < G[nk]){ G[nk] = g2; push(nk); } } }
  return (i, j) => (i < 0 || j < 0 || i >= w || j >= h || G[j * w + i] === Infinity) ? -1 : G[j * w + i]; }
function fair(map, towns, centre){ const cx = map.w / 2, cy = map.h / 2, mids = [];   /* the middle = every free cell within 1.5 tiles of the true centre (the same for everyone) */
  for(let j = Math.floor(cy - 2); j <= Math.ceil(cy + 2); j++) for(let i = Math.floor(cx - 2); i <= Math.ceil(cx + 2); i++) if(map.inside(i, j) && map.walk(i, j) && Math.hypot(i + 0.5 - cx, j + 0.5 - cy) <= 1.5) mids.push({i, j});
  const rows = towns.map((T, t) => { const at = walkLen(map, T.door), side = (i, j) => { let b = -1; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, c]) => { const v = at(i + a, j + c); if(v >= 0 && (b < 0 || v < b)) b = v; }); return b; };
    const enemy = Math.min(...towns.filter((_, q) => q !== t).map(o => { const v = at(o.door.i, o.door.j); return v < 0 ? 1e9 : v; })), rs = T.res.map(r => side(r.i, r.j)).filter(v => v >= 0);
    const mc = mids.map(c => at(c.i, c.j)).filter(v => v >= 0);
    return {centre: mc.length ? +Math.min(...mc).toFixed(1) : -1, enemy: +enemy.toFixed(1), res: rs.length ? +(rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) : -1, nres: rs.length}; });
  const spread = k => { const v = rows.map(r => r[k]); return (Math.max(...v) - Math.min(...v)) / Math.max(1, Math.max(...v)); };
  return {rows, centre: spread('centre'), enemy: spread('enemy'), res: spread('res'), ok: rows.every(r => r.centre >= 0 && r.enemy < 1e9 && r.nres === T0(towns))}; }
const T0 = towns => Math.min(...towns.map(T => T.res.length));

/* ---------- 🧱 a plain town for node tests (the page uses 🌳 IsoProps towns instead): a 2 × 2 house whose door faces the middle + the fair 🪙 🧱 pattern ---------- */
function plainTowns(map, starts, centre){ centre = centre || {i: map.w >> 1, j: map.h >> 1};
  return starts.map(s => { const house = {i: s.i - 1, j: s.j - 1, w: 2, d: 2};
    for(let j = house.j; j < house.j + house.d; j++) for(let i = house.i; i < house.i + house.w; i++) map.set(i, j, {block: 1, t: 'grass'});
    const dx = centre.i - s.i, dy = centre.j - s.j, door = Math.abs(dx) > Math.abs(dy) ? {i: dx > 0 ? house.i + 2 : house.i - 1, j: s.j} : {i: s.i, j: dy > 0 ? house.j + 2 : house.j - 1};
    const res = []; resSpots(map, door, centre).forEach(p => { const c = freeNear(map, p.x, p.y, door, (i, j) => Math.abs(i - door.i) + Math.abs(j - door.j) > 1); if(c){ map.set(c.i, c.j, {block: 1}); res.push({kind: p.kind, i: c.i, j: c.j, n: 600}); } });
    return {house, door, res}; }); }

/* ---------- ⚔️ a match ---------- */
function newMatch(o){
  const map = o.map, L = Math.max(0, Math.min(5, o.level | 0)), R = rng(o.seed | 0 || 1);
  const M = {map, t: 0, R, level: L, lv: LEVELS[L], units: [], byId: new Map(), nid: 1, ev: [], teams: [], flows: new Map(), flowsMade: 0, over: false, winner: -1,
    brawl: !!o.brawl, capOverride: o.cap || 0, grid: null, gw: 0, gh: 0, deadCount: 0, kills: 0};
  M.gw = Math.ceil(map.w / 2); M.gh = Math.ceil(map.h / 2); M.grid = Array.from({length: M.gw * M.gh}, () => []);
  o.teams.forEach((T, t) => { const lv = LEVELS[T.level == null ? L : Math.max(0, Math.min(5, T.level))];
    M.teams.push({id: t, side: T.side || 'blue', color: T.color || '#3A86FF', human: !!T.human, lv, house: Object.assign({hp: HOUSE_HP, max: HOUSE_HP}, T.house), door: T.door,
      res: (T.res || []).map(r => Object.assign({n: 600}, r)), eco: {c: 150, b: 100}, alive: true, mode: 'hold', rally: null, think: 1 + R() * 2, mixI: t, trained: 0, lost: 0, kills: 0,
      cap: 0, heroT: -1, ally: T.ally == null ? t : T.ally}); });
  M.teams.forEach(T => { T.cap = capFor(M, T.id); });
  M.teams.forEach(T => { spawn(M, T, 'hero'); const nw = M.brawl ? 2 : T.lv.workers - 1; for(let q = 0; q < nw; q++) spawn(M, T, 'worker'); });
  if(M.brawl){ M.teams.forEach(T => { T.mode = 'attack'; while(count(M, T) < T.cap) spawn(M, T, pickArmy(M, T)); }); }
  emit(M, 'match.start', {teams: M.teams.length});
  return M; }
function count(M, T){ let n = 0; for(const u of M.units) if(u.team === T.id && !u.dead) n++; return n; }
function capFor(M, t){ if(M.capOverride) return M.capOverride; const T = M.teams[t], alive = M.teams.filter(x => x.alive).length, top = (T ? T.lv : M.lv).max;
  return Math.min(top, CAP_ALIVE[Math.max(1, alive)] || 14); }
function emit(M, k, o){ M.ev.push(Object.assign({k, t: +M.t.toFixed(2)}, o || {})); if(M.ev.length > 400) M.ev.splice(0, M.ev.length - 400); }
function takeEvents(M){ const e = M.ev; M.ev = []; return e; }
function spawn(M, T, role){ const D = ROLES[role], d = T.door, a = M.R() * 6.283, r = 0.3 + M.R() * 0.6;
  const u = {id: M.nid++, team: T.id, role, x: d.i + 0.5 + Math.cos(a) * r, y: d.j + 0.5 + Math.sin(a) * r, px: 0, py: 0, hp: D.hp, max: D.hp, cd: M.R() * 0.5, tgt: null, swing: -1, hit: null,
    state: role === 'worker' ? 'seek' : 'army', carry: 0, res: null, dir: 1, walk: M.R() * 2, moving: false, fly: !!D.fly, born: M.t, dead: false, hurtT: -9, seed: (M.R() * 4) | 0};
  u.px = u.x; u.py = u.y; M.units.push(u); M.byId.set(u.id, u); return u; }
function pickArmy(M, T){ const add = T.lv.add || M.brawl, list = add && (T.mixI % 3 === 2) ? MIX_ADD : MIX; const r = list[T.mixI % list.length]; T.mixI++; return r; }
function train(M, t, role){ const T = M.teams[t]; if(!T || !T.alive) return 'down'; if(!ROLES[role] || role === 'hero') return 'role';
  if(ROLES[role].add && !T.lv.add) return 'locked';
  if(count(M, T) >= T.cap - (T.heroT > 0 ? 1 : 0)) return 'cap';   /* a knocked-out hero keeps its place */ const c = ROLES[role].cost; if(T.eco.c < c[0] || T.eco.b < c[1]) return 'cost';
  T.eco.c -= c[0]; T.eco.b -= c[1]; const u = spawn(M, T, role); T.trained++; if(T.mode === 'attack' && role !== 'worker') u.state = 'army'; emit(M, 'unit.trained', {team: t, role}); return true; }
function order(M, t, o){ const T = M.teams[t]; if(!T) return; if(o.attack){ T.mode = 'attack'; T.rally = null; }
  else if(o.go){ T.mode = 'rally'; T.rally = {x: o.go.x, y: o.go.y}; } else if(o.hold){ T.mode = 'hold'; T.rally = null; } }

/* ---------- 🧭 flow fields: ONE per target house, every unit of every team that marches there shares it ---------- */
function goalsAround(M, H){ const out = [], m = M.map; for(let j = H.j - 1; j <= H.j + H.d; j++) for(let i = H.i - 1; i <= H.i + H.w; i++){ const inside = i >= H.i && i < H.i + H.w && j >= H.j && j < H.j + H.d; if(!inside && m.inside(i, j) && m.walk(i, j)) out.push({i, j}); } return out; }
function flowTo(M, tt){ const key = 'h' + tt + ':' + M.map.ver; let F = M.flows.get(key); if(F) return F;
  for(const k of M.flows.keys()) if(k.indexOf('h' + tt + ':') === 0) M.flows.delete(k);
  F = (FLOW || plainFlow)(M.map, goalsAround(M, M.teams[tt].house), {diag: true}); M.flows.set(key, F); M.flowsMade++; return F; }
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

/* ---------- 🚶 moving: walk the flow field (ground) or fly straight (Flapper), slide along blocked cells ---------- */
function canStand(M, u, x, y){ const i = Math.floor(x), j = Math.floor(y); if(!M.map.inside(i, j)) return false; if(u.fly) return !(M.map.isVoid && M.map.isVoid(i, j)); return M.map.walk(i, j); }
function moveToward(M, u, tx, ty, dt, stopAt){ const dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy); if(d <= (stopAt || 0.05)) { u.moving = false; return true; }
  const s = Math.min(d, ROLES[u.role].spd * dt), nx = u.x + dx / d * s, ny = u.y + dy / d * s;
  if(canStand(M, u, nx, ny)){ u.x = nx; u.y = ny; } else if(canStand(M, u, nx, u.y)) u.x = nx; else if(canStand(M, u, u.x, ny)) u.y = ny;
  u.moving = true; const sdx = dx - dy; if(Math.abs(sdx) > 0.02) u.dir = sdx > 0 ? 1 : -1; return false; }
function followFlow(M, u, F, dt){ const i = Math.floor(u.x), j = Math.floor(u.y);
  if(u.fly){ const H = M.teams[u.goalT].house; return moveToward(M, u, H.i + H.w / 2, H.j + H.d / 2, dt, 1.2); }
  const n = F.next(i, j, {di: u.fdi || 0, dj: u.fdj || 0, seed: u.seed});
  if(!n){ if(F.at(i, j) === 0) { u.moving = false; return true; } const H = M.teams[u.goalT].house; return moveToward(M, u, H.i + H.w / 2, H.j + H.d / 2, dt, 1); }
  u.fdi = n.i - i; u.fdj = n.j - j; moveToward(M, u, n.i + 0.5, n.j + 0.5, dt); return false; }
function distHouse(u, H){ const cx = Math.max(H.i, Math.min(u.x, H.i + H.w)), cy = Math.max(H.j, Math.min(u.y, H.j + H.d)); return Math.hypot(u.x - cx, u.y - cy); }

/* ---------- 🎯 who to hit ---------- */
function canHit(a, b){ return !(b.fly && !ROLES[a.role].shot && !ROLES[a.role].hero && a.role !== 'spear'); }
function findTarget(M, u, r){ let best = null, bs = 1e9; const focus = M.teams[u.team].lv.focus;
  near(M, u.x, u.y, r, (o, d2) => { if(o.dead || !enemies(M, u.team, o.team) || !canHit(u, o)) return;
    let s = d2; if(BEATS[u.role] && BEATS[u.role][o.role]) s *= 0.55; if(focus) s *= 1 - focus * 0.4 * (1 - o.hp / o.max);   // a smarter bot finishes the hurt ones
    if(u.role === 'spy' && (ROLES[o.role].shot || ROLES[o.role].heal)) s *= 0.5; if(s < bs){ bs = s; best = o; } }); return best; }
function damage(M, a, b, base){ let dmg = base, counter = false; if(BEATS[a.role] && BEATS[a.role][b.role]){ dmg *= CROWD; counter = true; }
  b.hp -= dmg; b.hurtT = M.t; if(counter) emit(M, 'counter.hit', {team: a.team, role: a.role, vs: b.role});
  if(b.hp <= 0 && !b.dead){ b.dead = true; M.kills++; M.teams[a.team].kills++; M.teams[b.team].lost++;
    if(b.role === 'hero'){ emit(M, 'hero.ko', {team: b.team}); M.teams[b.team].heroT = M.t + HERO_BACK; } } }

/* ---------- ⏱️ one step (dt = 1 / 30 s) ---------- */
function step(M, dt){
  if(M.over && !M.brawl) return; M.t += dt; rehash(M);
  for(const T of M.teams){ if(!T.alive) continue; T.eco.c += 1.6 * dt; T.eco.b += 0.9 * dt;   // the 🏠 House trickles a little in
    if(T.heroT > 0 && M.t >= T.heroT){ T.heroT = -1; spawn(M, T, 'hero'); }
    if(M.brawl){ T.refill = (T.refill || 0) - dt; if(T.refill <= 0 && count(M, T) < T.cap - (T.heroT > 0 ? 1 : 0)){ T.refill = 0.2; const u = spawn(M, T, pickArmy(M, T)); u.state = 'army'; } continue; }
    if(!T.human){ T.think -= dt; if(T.think <= 0){ T.think = T.lv.think * (0.8 + M.R() * 0.4); brain(M, T); } } }
  for(const u of M.units){ if(u.dead) continue; u.px = u.x; u.py = u.y; u.moving = false; if(u.cd > 0) u.cd -= dt; if(u.swing >= 0) swingStep(M, u, dt);
    else if(u.role === 'worker') workerStep(M, u, dt); else armyStep(M, u, dt);
    if(u.moving) u.walk += dt; }
  // 📍 spacing (friends + foes push apart a little, flyers only from flyers)
  for(const u of M.units){ if(u.dead) continue; near(M, u.x, u.y, 0.55, (o, d2) => { if(o === u || o.dead || o.fly !== u.fly || d2 < 1e-6) return; const d = Math.sqrt(d2), p = (0.55 - d) * 0.25, nx = u.x - (o.x - u.x) / d * p, ny = u.y - (o.y - u.y) / d * p; if(canStand(M, u, nx, ny)){ u.x = nx; u.y = ny; } }); }
  // 💀 clean up + 🏠 fallen towns
  let removed = false; for(let k = M.units.length - 1; k >= 0; k--){ const u = M.units[k]; if(u.dead){ M.units.splice(k, 1); M.byId.delete(u.id); M.deadCount++; removed = true; } }
  for(const T of M.teams){ if(T.alive && T.house.hp <= 0 && !M.brawl){ T.alive = false; emit(M, 'team.down', {team: T.id});
      for(const u of M.units) if(u.team === T.id) u.dead = true;
      const before = M.teams.map(x => x.cap); M.teams.forEach(x => { if(x.alive) x.cap = Math.max(x.cap, capFor(M, x.id)); });
      M.teams.forEach((x, q) => { if(x.alive && x.cap > before[q]) emit(M, 'army.up', {team: q, cap: x.cap, plus: x.cap - before[q]}); });
      const left = M.teams.filter(x => x.alive), allies = new Set(left.map(x => x.ally)); if(allies.size <= 1){ M.over = true; M.winner = left.length ? left[0].id : -1; emit(M, 'match.win', {team: M.winner}); } } }
  if(removed) rehash(M);
}
function swingStep(M, u, dt){ u.swing += dt; const D = ROLES[u.role];
  if(u.swing >= WIND && u.hit){ const h = u.hit; u.hit = null;   // 💥 CONTACT — the game fires here (beats rule)
    if(h.house != null){ const H = M.teams[h.house].house; if(H.hp > 0){ H.hp -= D.atk * (D.bld || 1); emit(M, 'house.hit', {team: h.house, by: u.team}); } }
    else { const b = M.byId.get(h.id); if(b && !b.dead){ if(D.heal){ b.hp = Math.min(b.max, b.hp + D.heal); if(D.aura) near(M, b.x, b.y, 1.8, o => { if(!o.dead && o.team === u.team) o.hp = Math.min(o.max, o.hp + D.heal * 0.5); }); }
        else { damage(M, u, b, D.atk); if(D.splash) near(M, b.x, b.y, D.splash, o => { if(o !== b && !o.dead && enemies(M, u.team, o.team)) damage(M, u, o, D.atk * 0.5); }); } } } }
  if(u.swing >= WIND + 0.25) u.swing = -1; }
function startSwing(M, u, hit){ u.swing = 0; u.hit = hit; u.cd = ROLES[u.role].cd * (0.92 + M.R() * 0.16); const tx = hit.house != null ? M.teams[hit.house].house.i + 1 : M.byId.get(hit.id).x, ty = hit.house != null ? M.teams[hit.house].house.j + 1 : M.byId.get(hit.id).y; const sdx = (tx - u.x) - (ty - u.y); if(Math.abs(sdx) > 0.02) u.dir = sdx > 0 ? 1 : -1; }
function armyStep(M, u, dt){ const D = ROLES[u.role], T = M.teams[u.team];
  // 💚 healers look for hurt friends first
  if(D.heal){ let best = null, bh = 0.95; near(M, u.x, u.y, 6, o => { if(o.dead || o.team !== u.team || o === u) return; const f = o.hp / o.max; if(f < bh){ bh = f; best = o; } });
    if(best){ const d = Math.hypot(best.x - u.x, best.y - u.y); if(d <= D.rng){ if(u.cd <= 0) startSwing(M, u, {id: best.id}); } else moveToward(M, u, best.x, best.y, dt, D.rng * 0.8); return; } }
  else { let tg = u.tgt ? M.byId.get(u.tgt) : null; if(!tg || tg.dead || Math.hypot(tg.x - u.x, tg.y - u.y) > 7) tg = findTarget(M, u, D.shot ? D.rng + 2.5 : 5); u.tgt = tg ? tg.id : null;
    if(tg){ const d = Math.hypot(tg.x - u.x, tg.y - u.y); if(d <= D.rng + 0.15){ if(u.cd <= 0) startSwing(M, u, {id: tg.id}); } else moveToward(M, u, tg.x, tg.y, dt, D.rng * 0.9); return; } }
  // 🏠 no foe near: march (attack) · go to the 🚩 rally · wait by home (hold)
  if(T.mode === 'attack' || u.state === 'charge'){ const gt = goalTeam(M, u.team); if(gt < 0) return; u.goalT = gt; const H = M.teams[gt].house;
    if(distHouse(u, H) <= D.rng + 0.6 && !D.heal){ if(u.cd <= 0) startSwing(M, u, {house: gt}); return; }
    followFlow(M, u, flowTo(M, gt), dt); return; }
  if(T.mode === 'rally' && T.rally){ moveToward(M, u, T.rally.x + Math.cos(u.id) * 1.2, T.rally.y + Math.sin(u.id) * 1.2, dt, 0.3); return; }
  const d = T.door, gx = d.i + 0.5 + Math.cos(u.id * 1.7) * 3, gy = d.j + 2.5 + Math.sin(u.id * 1.7) * 2; moveToward(M, u, gx, gy, dt, 0.4); }
function goalTeam(M, t){ let best = -1, bd = 1e9; const me = M.teams[t].house;
  M.teams.forEach((T, q) => { if(!T.alive || !enemies(M, t, q)) return; const d = Math.hypot(T.house.i - me.i, T.house.j - me.j) + (T.human && M.teams[t].lv.waitYou ? 0 : 0); if(d < bd){ bd = d; best = q; } }); return best; }
function workerStep(M, u, dt){ const T = M.teams[u.team];
  if(u.state === 'seek'){ let best = null, bd = 1e9; const want = T.eco.b < T.eco.c * 0.6 ? 'b' : 'c'; for(const r of T.res){ if(r.n <= 0) continue; const d = Math.hypot(r.i + 0.5 - u.x, r.j + 0.5 - u.y) * (r.kind === want ? 1 : 1.6); if(d < bd){ bd = d; best = r; } }
    if(!best){ u.state = 'idle'; return; } u.res = best; u.state = 'go'; }
  if(u.state === 'go'){ const r = u.res; if(!r || r.n <= 0){ u.state = 'seek'; return; } if(moveToward(M, u, r.i + 0.5, r.j + 0.5, dt, 0.95)){ u.state = 'dig'; u.dig = 1.6; } return; }
  if(u.state === 'dig'){ u.dig -= dt; if(u.dig <= 0){ const r = u.res, n = Math.min(10, r.n); r.n -= n; u.carry = n; u.ck = r.kind; u.state = 'back'; } return; }
  if(u.state === 'back'){ const H = T.house; if(distHouse(u, H) <= 0.8 || moveToward(M, u, T.door.i + 0.5, T.door.j + 0.5, dt, 0.5)){ T.eco[u.ck] += u.carry; u.carry = 0; u.state = 'seek'; } return; }
  if(u.state === 'idle'){ u.state = 'seek'; } }

/* ---------- 🤖 the bot brain (one per team, thinks every few seconds by level) ---------- */
function brain(M, T){ const lv = T.lv; let workers = 0, army = 0; for(const u of M.units){ if(u.team !== T.id || u.dead) continue; if(u.role === 'worker') workers++; else if(u.role !== 'hero') army++; }
  if(workers < lv.workers) train(M, T.id, 'worker'); else train(M, T.id, pickArmy(M, T));
  if(T.mode !== 'attack' && army >= Math.min(lv.wave, T.cap - lv.workers - 1)){ const you = M.teams.find(x => x.human && x.alive);
    if(!(lv.waitYou && you && !M.youMoved)) { T.mode = 'attack'; emit(M, 'bot.attack', {team: T.id, army}); } } }

/* ---------- 🧪 node: whole battles, bot vs bot ---------- */
function simulate(o){ o = o || {}; const Iso = o.Iso, Ld = land({size: o.size || 'S', teams: o.teams || 2, seed: o.seed || 1});
  const map = Iso.map({w: Ld.w, h: Ld.h, theme: 'meadow', seed: Ld.seed, cell: Ld.cell}), towns = plainTowns(map, Ld.starts, Ld.centre);
  const lv = o.levels || [], teams = towns.map((T, t) => Object.assign({side: 'side' + t, level: lv[t] == null ? o.level : lv[t], ally: o.allies ? o.allies[t] : t}, T));
  const M = newMatch({map, teams, level: o.level | 0, seed: o.seed || 1, brawl: o.brawl, cap: o.cap}); const dt = 1 / 30, tmax = o.tmax || 900, ev = {}; let maxUnits = 0;
  while(!M.over && M.t < tmax){ step(M, dt); for(const e of takeEvents(M)){ ev[e.k] = (ev[e.k] || 0) + 1; if(o.onEvent) o.onEvent(e, M); } if(M.units.length > maxUnits) maxUnits = M.units.length; if(o.onStep) o.onStep(M); }
  return {winner: M.winner, t: Math.round(M.t), alive: M.teams.map(T => T.alive), trained: M.teams.map(T => T.trained), kills: M.kills, events: ev, flows: M.flowsMade, maxUnits, caps: M.teams.map(T => T.cap), M}; }

return {walkLen, ROLES, CORE, ADD, KEYS, BEATS, LEVELS, CAP_ALIVE, SIZES, ROUND, RES_PATTERN, CROWD, HERO_BACK, land, plainTowns, resSpots, freeNear, fair, newMatch, step, order, train, takeEvents, capFor, simulate, count: (M, t) => count(M, M.teams[t]),
  use(o){ if(o && o.flow) FLOW = o.flow; }, _flowTo: flowTo, _spawn: (M, t, r) => spawn(M, M.teams[t], r)};
})();
if(typeof module !== 'undefined') module.exports = AR;
// ENGINE END

