
// ENGINE START
var SN = (function () {
  'use strict';
  /* 🐍 Snakize engine — pure JS (no DOM), the harness loads it in node.
     Modes: 'feast' = 🍎 Snakeast (grid snake) · 'gate' = 🧭 Snakigate (free steering arena) · 'castle' = 🏰 Snakastle (land grab, grid). */
  function rng(seed){ var s = (seed >>> 0) || 1; return function(){ s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  var DIRS = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }, OPP = { u: 'd', d: 'u', l: 'r', r: 'l' }, DK = ['u', 'r', 'd', 'l'];
  var LEVEL_NAMES = ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'];
  var SKILLS = {
    dash:   { icon: '💨', name: 'Dash',      what: '2 s of speed (free boost in Snakigate)' },
    shield: { icon: '🛡️', name: 'Shield',    what: 'Survive 1 bump' },
    ghost:  { icon: '👻', name: 'Ghost',     what: 'Pass through your body / trails for 2 s' },
    magnet: { icon: '🧲', name: 'Magnet',    what: 'Pull food to you for 5 s' },
    slow:   { icon: '⏳', name: 'Slow time', what: 'Everyone else slows down for 3 s' },
    drop:   { icon: '✂️', name: 'Tail drop', what: 'Drop half your tail — a wall (Snakeast) or food (Snakigate)' }
  };
  var SKILL_KEYS = Object.keys(SKILLS);
  var POWERS = {
    star:    { icon: '⭐', name: 'Double points', t: 8 },
    mush:    { icon: '🍄', name: 'Shrink' },
    chili:   { icon: '🌶️', name: 'Fire — burns 1 obstacle' },
    ice:     { icon: '❄️', name: 'Freeze the others', t: 2 },
    rainbow: { icon: '🌈', name: 'Rainbow — any colour counts', t: 8 },
    bomb:    { icon: '💣', name: 'Bomb — clears rocks nearby' }
  };
  var COLS = ['red', 'blue', 'gold'];   // food colours (side quests: "eat 3 blue")

  // 🍎 Snakeast levels — n = grid size, tick = seconds per step, speedUp = tick cut per `every` food, min = fastest
  var FEAST = [
    { n: 12, tick: 0.24, speedUp: 0,     every: 0, min: 0.24, target: 15, wrap: true,  lives: 3, ghost: true,  foods: 2, gold: 0,    bad: 0,    rocks: 0, movers: 0, maze: false, portals: 0, falling: false, runaway: false, power: false, gift: 30, par: 50 },
    { n: 14, tick: 0.22, speedUp: 0.003, every: 1, min: 0.17, target: 20, wrap: true,  lives: 3, ghost: false, foods: 2, gold: 0.14, bad: 0,    rocks: 0, movers: 0, maze: false, portals: 0, falling: false, runaway: false, power: false, gift: 34, par: 60 },
    { n: 16, tick: 0.19, speedUp: 0.012, every: 5, min: 0.13, target: 25, wrap: false, lives: 3, ghost: false, foods: 2, gold: 0.12, bad: 0,    rocks: 6, movers: 0, maze: false, portals: 0, falling: false, runaway: false, power: true,  gift: 40, par: 70 },
    { n: 18, tick: 0.14, speedUp: 0.003, every: 1, min: 0.1,  target: 30, wrap: false, lives: 2, ghost: false, foods: 2, gold: 0.12, bad: 0.14, rocks: 4, movers: 3, maze: false, portals: 0, falling: false, runaway: false, power: true,  gift: 45, par: 75 },
    { n: 21, tick: 0.12, speedUp: 0.002, every: 1, min: 0.085, target: 40, wrap: false, lives: 1, ghost: false, foods: 2, gold: 0.12, bad: 0.14, rocks: 0, movers: 2, maze: true,  portals: 2, falling: false, runaway: true,  power: true,  gift: 52, par: 95 },
    { n: 24, tick: 0.11, speedUp: 0.0025, every: 1, min: 0.065, target: 50, wrap: false, lives: 1, ghost: false, foods: 1, gold: 0.1, bad: 0.12, rocks: 0, movers: 2, maze: true,  portals: 2, falling: true,  runaway: true,  power: true,  gift: 60, par: 110 }
  ];
  // 🧭 Snakigate levels — R = arena radius (world units), spd = bot speed factor, react = s between bot thoughts
  var GATE = [
    { R: 17, bots: 3,  time: 120, lives: 3, edge: 'soft',   soft: true, keep: 0.6,   spd: 0.72, react: 0.5,  greed: 0.25, avoid: 0.8,  chase: 0,    cut: 0,    boost: 0,    circle: 0,    team: 0,    trap: 0,   dots: 0.42, gift: 30 },
    { R: 18, bots: 4,  time: 120, lives: 3, edge: 'soft',   keep: 0.5,   spd: 0.8,  react: 0.4,  greed: 0.4,  avoid: 0.92, chase: 0,    cut: 0,    boost: 0,    circle: 0,    team: 0,    trap: 0,   dots: 0.42, gift: 34 },
    { R: 24, bots: 6,  time: 180, lives: 3, edge: 'pop',    keep: 0.4,    spd: 0.88, react: 0.3,  greed: 0.62, avoid: 0.96, chase: 0.1,  cut: 0.12, boost: 0.1,  circle: 0,    team: 0,    trap: 0,   dots: 0.4,  gift: 40 },
    { R: 25, bots: 8,  time: 180, lives: 2, edge: 'pop',    keep: 0.3,    spd: 0.95, react: 0.22, greed: 0.75, avoid: 0.97, chase: 0.25, cut: 0.35, boost: 0.35, circle: 0,    team: 0,    trap: 0,   dots: 0.38, gift: 45 },
    { R: 31, bots: 10, time: 240, lives: 2, edge: 'pop',    spd: 1.0,  react: 0.16, greed: 0.85, avoid: 0.98, chase: 0.35, cut: 0.45, boost: 0.5,  circle: 0.45, team: 0.4,  trap: 0,   dots: 0.36, gift: 52 },
    { R: 33, bots: 12, time: 0,   lives: 1, edge: 'shrink', spd: 1.04, react: 0.13, greed: 0.9,  avoid: 0.99, chase: 0.45, cut: 0.55, boost: 0.65, circle: 0.55, team: 0.5,  trap: 0.5, dots: 0.36, gift: 60, shrinkT: 150, minR: 9 }
  ];

  // ======================================================================
  // shared snake bits
  function baseSnake(i, p){
    return { i: i, name: p.name || ('P' + (i + 1)), human: !!p.human, bot: !p.human, col: p.col || null, av: p.av || null, alive: true,
      lives: 1, score: 0, eaten: 0, gold: 0, goldRow: 0, goldRowBest: 0, maxLen: 0, popped: 0, skillsUsed: 0, powers: 0, hurt: 0, flags: 0, land: 0,
      start: p.skill || null, cd: 0, extra: [], shield: 0, dashT: 0, ghostT: 0, magT: 0, starT: 0, rainT: 0, chili: 0, frozenT: 0,
      quest: null, offer: null, down: 0, react: '', reactT: 0 };
  }
  function push(M, e){ M.ev.push(e); if(M.ev.length > 200) M.ev.shift(); }
  function takeEvents(M){ var e = M.ev; M.ev = []; return e; }
  function lenOf(M, s){ return M.mode === 'gate' || M.mode === 'castle' ? Math.round(s.len) : s.body.length + (s.grow || 0); }
  function giveSkill(M, s, k, why){ while(s.extra.length >= 2) s.extra.shift(); s.extra.push(k); push(M, { k: 'gift', s: s.i, skill: k, why: why }); }
  function useSkill(M, i){
    var s = M.snakes[i]; if(!s || !s.alive || M.over || s.down > 0) return null;
    var k = null;
    if(s.useStart && s.start && s.cd <= 0) { k = s.start; s.cd = M.skillCd; }
    else if(s.extra.length) k = s.extra.pop();
    else if(s.start && s.cd <= 0) { k = s.start; s.cd = M.skillCd; }
    if(!k) return null;
    s.skillsUsed++; s.useStart = false;
    if(k === 'dash') s.dashT = 2;
    else if(k === 'shield') s.shield = 1;
    else if(k === 'ghost') s.ghostT = 2;
    else if(k === 'magnet') s.magT = 5;
    else if(k === 'slow'){ M.slowT = 3; M.slowBy = i; }
    else if(k === 'drop') tailDrop(M, s);
    push(M, { k: 'skill', s: i, skill: k });
    return k;
  }
  function switchSkill(M, i){ var s = M.snakes[i]; if(!s) return; if(s.extra.length > 1) s.extra.unshift(s.extra.pop()); else s.useStart = !s.useStart; push(M, { k: 'switch', s: i }); }
  function pickSkill(M, i, k){ var s = M.snakes[i]; if(!s || !s.offer || s.offer.indexOf(k) < 0) return false; s.offer = null; giveSkill(M, s, k, 'quest'); return true; }
  function tickCommon(M, s, dt){
    ['cd', 'dashT', 'ghostT', 'magT', 'starT', 'rainT', 'frozenT', 'reactT'].forEach(function(k){ if(s[k] > 0) s[k] = Math.max(0, s[k] - dt); });
    if(s.offer){ s.offerT -= dt; if(s.offerT <= 0){ var k = s.offer[0]; s.offer = null; giveSkill(M, s, k, 'quest'); } }
  }
  function tickGifts(M, dt){
    if(!M.skills) return;
    M.giftT -= dt;
    if(M.giftT <= 0){ M.giftT = M.giftEvery; M.snakes.forEach(function(s){ if(s.alive && !s.bot) giveSkill(M, s, SKILL_KEYS[Math.floor(M.rnd() * SKILL_KEYS.length)], 'timed'); }); }
    // 🗺️ side quests: one at a time per human, a new one a little after the last
    M.snakes.forEach(function(s){
      if(s.bot || !s.alive) return;
      if(!s.quest){ s.questWait = (s.questWait == null ? 8 : s.questWait) - dt; if(s.questWait <= 0){ s.quest = makeQuest(M, s); s.questWait = 14; if(s.quest) push(M, { k: 'quest', s: s.i, q: s.quest }); } return; }
      var q = s.quest; q.t -= dt;
      if(q.kind === 'visit'){ var h = headPos(M, s); if(Math.hypot(h[0] - q.x, h[1] - q.y) <= (M.mode === 'gate' ? 2.2 : 0.6)) q.have = q.need; }
      if(q.kind === 'grow'){ q.have = Math.max(0, lenOf(M, s) - q.from); }
      if(q.have >= q.need){ s.quest = null; s.questsDone = (s.questsDone || 0) + 1; s.offer = shuffle(M, SKILL_KEYS.slice()).slice(0, 3); s.offerT = 6; push(M, { k: 'questDone', s: s.i, q: q }); }
      else if(q.t <= 0){ s.quest = null; push(M, { k: 'questFail', s: s.i }); }
    });
  }
  function shuffle(M, a){ for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(M.rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function headPos(M, s){ if(M.mode === 'gate') return [s.x, s.y]; return s.body[0]; }
  function makeQuest(M, s){
    var lv = M.lv, r = M.rnd();
    var hard = 1 + lv * 0.35, t = Math.round(30 - lv * 2);
    if(r < 0.4){ var c = COLS[Math.floor(M.rnd() * 3)]; return { kind: 'eatc', c: c, need: Math.round(2 + lv * 0.6), have: 0, t: t + 10, text: 'Eat ' + Math.round(2 + lv * 0.6) + ' ' + c + ' food' }; }
    if(r < 0.75){
      var p = M.mode === 'gate' ? randInArena(M, M.R * 0.75) : freeCell(M, 3);
      if(!p) return null;
      return { kind: 'visit', x: p[0], y: p[1], need: 1, have: 0, t: t, text: 'Visit the 🚩 flag' };
    }
    var need = Math.round((M.mode === 'gate' ? 8 : 4) * hard);
    return { kind: 'grow', from: lenOf(M, s), need: need, have: 0, t: t + 8, text: 'Grow ' + need + ' longer' };
  }
  function questEat(M, s, col){ var q = s.quest; if(q && q.kind === 'eatc' && (col === q.c || s.rainT > 0)) q.have++; }

  // ======================================================================
  // 🍎 SNAKEAST — grid snake
  function newFeast(o){
    var L = o.mods ? Object.assign({}, FEAST[o.level], o.mods) : FEAST[o.level], n = o.n || ((o.players || []).length > 2 ? Math.max(18, L.n) : L.n);
    var M = { mode: 'feast', L: L, lv: o.level, n: n, rnd: rng(o.seed || 1), t: 0, ev: [], over: false, winner: -1, endless: !!o.endless,
      target: o.endless ? Infinity : (o.target || L.target), tick: L.tick, wall: new Uint8Array(n * n), foods: [], movers: [], portals: [], falling: [], walls2: [],
      snakes: [], skills: !!o.skills, skillCd: 14, giftEvery: L.gift, giftT: L.gift, slowT: 0, slowBy: -1, freezeT: 0, duel: (o.players || []).length > 1 && !o.coop, coop: !!o.coop, eatenAll: 0, story: o.story || null, leadI: 0 };
    var P = o.players && o.players.length ? o.players : [{ name: 'You', human: true }];
    // walls first (maze), then snakes, then rocks/movers/portals/food
    if(L.maze) buildMaze(M);
    var starts = startSpots(M, P.length);
    P.forEach(function(p, i){
      var s = baseSnake(i, p), st = starts[i]; s.lives = o.lives || (M.duel ? 1 : L.lives);
      if(M.coop) s.lives = o.lives || L.lives;
      s.dir = st.d; s.q = []; s.grow = 0; s.acc = 0; s.prev = null; s.body = [];
      for(var k = 0; k < 3; k++) s.body.push([st.x - DIRS[st.d][0] * k, st.y - DIRS[st.d][1] * k]);
      clearAround(M, st.x, st.y, 2);
      M.snakes.push(s);
    });
    for(var r = 0; r < L.rocks; r++){ var c = freeCell(M, 3, true); if(c) M.wall[c[1] * n + c[0]] = 2; }
    for(var m = 0; m < L.movers; m++) addMover(M);
    for(var pt = 0; pt < L.portals; pt += 2){ for(var pz = 0; pz < 40; pz++){ var a = freeCell(M, 4, true), b = a && freeCell(M, 4, true, a); var edge = function(c){ return !c || c[0] < 2 || c[1] < 2 || c[0] > n - 3 || c[1] > n - 3; }; if(!edge(a) && !edge(b)){ M.portals.push({ a: a, b: b }); break; } } }
    for(var f = 0; f < L.foods; f++) spawnFood(M);
    M.fallT = 5;
    return M;
  }
  function startSpots(M, count){
    var n = M.n, mid = Math.floor(n / 2), out = [];
    var spots = [{ x: 3, y: mid, d: 'r' }, { x: n - 4, y: mid - 1 + (n % 2), d: 'l' }, { x: mid, y: 3, d: 'd' }, { x: mid - 1 + (n % 2), y: n - 4, d: 'u' }];
    if(count === 1) spots[0] = { x: Math.max(3, mid - 2), y: mid, d: 'r' };
    for(var i = 0; i < count; i++) out.push(spots[i]);
    return out;
  }
  function inb(M, x, y){ return x >= 0 && y >= 0 && x < M.n && y < M.n; }
  function clearAround(M, x, y, r){ for(var yy = y - r; yy <= y + r; yy++) for(var xx = x - r - 2; xx <= x + r + 2; xx++) if(inb(M, xx, yy)) M.wall[yy * M.n + xx] = 0; }
  function buildMaze(M){
    // short wall bars on a coarse lattice (never a dead end: every free cell stays reachable)
    var n = M.n;
    for(var tries = 0; tries < 30; tries++){
      M.wall.fill(0);
      for(var y = 3; y < n - 2; y += 4) for(var x = 3; x < n - 2; x += 4){
        if(M.rnd() < 0.25) continue;
        var horiz = M.rnd() < 0.5, len = 2 + Math.floor(M.rnd() * 2);
        for(var k = 0; k < len; k++){ var xx = horiz ? x + k - 1 : x, yy = horiz ? y : y + k - 1; if(inb(M, xx, yy)) M.wall[yy * n + xx] = 1; }
      }
      // keep the start lanes open
      var mid = Math.floor(n / 2); for(var xx2 = 0; xx2 < n; xx2++){ M.wall[mid * n + xx2] = 0; }
      if(connected(M)) return;
    }
    M.wall.fill(0);
  }
  function connected(M){
    var n = M.n, seen = new Uint8Array(n * n), stack = [], free = 0, start = -1;
    for(var i = 0; i < n * n; i++) if(!M.wall[i]){ free++; if(start < 0) start = i; }
    if(start < 0) return false;
    stack.push(start); seen[start] = 1; var cnt = 0;
    while(stack.length){ var c = stack.pop(); cnt++; var x = c % n, y = (c / n) | 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){ var xx = x + d[0], yy = y + d[1]; if(!inb(M, xx, yy)) return; var j = yy * n + xx; if(!seen[j] && !M.wall[j]){ seen[j] = 1; stack.push(j); } }); }
    return cnt === free;
  }
  function occupied(M, x, y, opts){
    opts = opts || {};
    var n = M.n; if(!inb(M, x, y)) return 'out';
    if(M.wall[y * n + x]) return M.wall[y * n + x] === 1 ? 'wall' : 'rock';
    for(var i = 0; i < M.movers.length; i++){ var mv = M.movers[i]; if(mv.x === x && mv.y === y) return 'mover'; }
    for(var j = 0; j < M.falling.length; j++){ var fr = M.falling[j]; if(fr.landed && fr.x === x && fr.y === y) return 'rock2'; }
    for(var w = 0; w < M.walls2.length; w++){ var wc = M.walls2[w]; if(wc.x === x && wc.y === y && (!opts.owner || wc.by !== opts.owner)) return 'tailwall'; }
    if(!opts.noSnakes) for(var s = 0; s < M.snakes.length; s++){ var sn = M.snakes[s]; if(!sn.alive) continue; for(var b = 0; b < sn.body.length; b++) if(sn.body[b][0] === x && sn.body[b][1] === y) return 'snake'; }
    return null;
  }
  function nearHeads(M, x, y, r){ return M.snakes.some(function(s){ return s.alive && s.body && s.body.length && Math.abs(s.body[0][0] - x) + Math.abs(s.body[0][1] - y) <= r; }); }
  function freeCell(M, keep, noSnakeZone, not){
    for(var t = 0; t < 400; t++){
      var x = Math.floor(M.rnd() * M.n), y = Math.floor(M.rnd() * M.n);
      if(occupied(M, x, y)) continue;
      if(M.foods.some(function(f){ return f.x === x && f.y === y; })) continue;
      if(M.portals.some(function(p){ return (p.a[0] === x && p.a[1] === y) || (p.b[0] === x && p.b[1] === y); })) continue;
      if(not && Math.abs(not[0] - x) + Math.abs(not[1] - y) < 5) continue;
      if(keep && nearHeads(M, x, y, keep)) continue;
      if(noSnakeZone && M.snakes.some(function(s){ return s.dir && (s.dir === 'r' || s.dir === 'l') && y === s.body[0][1]; })) continue;   // keep the starting rows clear
      return [x, y];
    }
    return null;
  }
  function addMover(M){
    // a hazard sliding back and forth on a free line of 4–6 cells
    for(var t = 0; t < 80; t++){
      var c = freeCell(M, 4, true); if(!c) return;
      var horiz = M.rnd() < 0.5, len = 4 + Math.floor(M.rnd() * 3), okLine = true;
      for(var k = 0; k < len; k++){ var x = horiz ? c[0] + k : c[0], y = horiz ? c[1] : c[1] + k; if(!inb(M, x, y) || M.wall[y * M.n + x]) { okLine = false; break; } }
      if(!okLine) continue;
      M.movers.push({ x: c[0], y: c[1], x0: c[0], y0: c[1], dx: horiz ? 1 : 0, dy: horiz ? 0 : 1, len: len, k: 0, s: 1, acc: 0, every: 0.55 });
      return;
    }
  }
  function spawnFood(M, kind){
    var c = freeCell(M, 2); if(!c) return null;
    var L = M.L, r = M.rnd();
    if(!kind){
      kind = 'n';
      if(M.story && M.story.goal === 'gold' && r < 0.45 && !M.foods.some(function(f){ return f.k === 'g'; })) kind = 'g';
      else if(L.power && r < 0.12 && !M.foods.some(function(f){ return POWERS[f.k]; })) kind = pickPower(M);
      else if(L.gold && r < 0.12 + L.gold) kind = 'g';
      else if(L.bad && r < 0.12 + L.gold + L.bad && M.foods.filter(function(f){ return f.k === 'b'; }).length < 1) kind = 'b';
    }
    var f = { x: c[0], y: c[1], k: kind, c: COLS[Math.floor(M.rnd() * 3)], born: M.t, run: 0 };
    M.foods.push(f);
    // bad fruit is not food: always keep enough real food
    if(kind === 'b' || POWERS[kind]) { if(M.foods.filter(function(x){ return x.k === 'n' || x.k === 'g'; }).length < M.L.foods) spawnFood(M, 'n'); }
    return f;
  }
  function pickPower(M){ var k = Object.keys(POWERS); if(M.mode === 'gate') k = ['star', 'mush', 'ice', 'rainbow']; return k[Math.floor(M.rnd() * k.length)]; }
  function turn(M, i, d){
    var s = M.snakes[i]; if(!s || !s.alive || !DIRS[d]) return false;
    var last = s.q.length ? s.q[s.q.length - 1] : s.dir;
    if(d === last || d === OPP[last]) return false;   // no instant U-turn into yourself
    if(s.q.length >= 2) return false;                   // 2 quick turns are kept, more are dropped
    s.q.push(d); s.qStick = false; return true;
  }
  // r36 🕹️ a thumb stick says "go this way NOW": a newer stick direction replaces a stick turn that is still waiting
  // (a wobble r → u → r while going right = keep going right, not a zigzag); a quick turn + turn (u then l) still queues.
  function stickTurn(M, i, d){
    var s = M.snakes[i]; if(!s || !s.alive || !DIRS[d]) return false;
    if(s.qStick && s.q.length === 1){
      if(d === s.dir){ s.q.length = 0; s.qStick = false; return true; }
      if(d !== OPP[s.dir]){ s.q[0] = d; return true; }
    }
    var ok = turn(M, i, d); if(ok) s.qStick = s.q.length === 1; return ok;
  }
  function wrapXY(M, x, y){ return [(x + M.n) % M.n, (y + M.n) % M.n]; }
  function nextCell(M, x, y, d){
    var nx = x + DIRS[d][0], ny = y + DIRS[d][1];
    if(M.L.wrap) { var w = wrapXY(M, nx, ny); nx = w[0]; ny = w[1]; }
    for(var p = 0; p < M.portals.length; p++){ var P = M.portals[p];
      if(P.a[0] === nx && P.a[1] === ny) return { x: P.b[0] + DIRS[d][0], y: P.b[1] + DIRS[d][1], portal: p };
      if(P.b[0] === nx && P.b[1] === ny) return { x: P.a[0] + DIRS[d][0], y: P.a[1] + DIRS[d][1], portal: p }; }
    return { x: nx, y: ny };
  }
  // what the snake would hit stepping to (x, y)
  function hitAt(M, s, x, y){
    if(!inb(M, x, y)) return { why: 'wall' };
    var o = occupied(M, x, y, { noSnakes: true, owner: M.L && M.lv < 2 ? s.i + 1 : 0 });
    if(o) return { why: o === 'out' ? 'wall' : o };
    var growing = s.grow > 0;
    for(var j = 0; j < M.snakes.length; j++){
      var sn = M.snakes[j]; if(!sn.alive) continue;
      var lenB = sn.body.length - (sn === s && !growing ? 1 : 0);
      for(var b = 0; b < lenB; b++) if(sn.body[b][0] === x && sn.body[b][1] === y){
        if(sn === s && s.ghostT > 0) continue;
        if(sn === s) return { why: 'self' };
        return { why: 'snake', by: sn.i, head: b === 0 };
      }
    }
    return null;
  }
  function ghostPath(M, i, k){
    // where the snake goes next (queued turns first) — stops at the first thing it would bump
    var s = M.snakes[i], out = []; if(!s || !s.alive) return out;
    var x = s.body[0][0], y = s.body[0][1], d = s.dir, q = s.q.slice();
    for(var t = 0; t < (k || 6); t++){
      if(q.length) d = q.shift();
      var c = nextCell(M, x, y, d); var h = hitAt(M, s, c.x, c.y);
      out.push({ x: c.x, y: c.y, bad: !!h }); if(h) break; x = c.x; y = c.y;
    }
    return out;
  }
  function stepFeast(M, dt){
    if(M.over) return;
    M.t += dt;
    if(M.slowT > 0) M.slowT = Math.max(0, M.slowT - dt);
    if(M.freezeT > 0) M.freezeT = Math.max(0, M.freezeT - dt);
    tickGifts(M, dt);
    // hazards
    if(!(M.freezeT > 0)) M.movers.forEach(function(mv){ mv.acc += dt * (M.slowT > 0 ? 0.5 : 1); if(mv.acc < mv.every) return; mv.acc = 0;
      var nk = mv.k + mv.s; if(nk < 0 || nk >= mv.len){ mv.s = -mv.s; nk = mv.k + mv.s; }
      var nx = mv.x0 + mv.dx * nk, ny = mv.y0 + mv.dy * nk;
      var onSnake = M.snakes.some(function(s){ return s.alive && s.body.some(function(b){ return b[0] === nx && b[1] === ny; }); });
      if(onSnake){ mv.s = -mv.s; return; }   // movers never run into a snake — they turn back
      mv.k = nk; mv.x = nx; mv.y = ny; });
    if(M.L.falling){
      M.fallT -= dt;
      if(M.fallT <= 0){ M.fallT = Math.max(2.2, 5 - M.t / 60); var c = freeCell(M, 3); if(c) M.falling.push({ x: c[0], y: c[1], warn: 1.6, landed: false, life: 9 }); }
      M.falling.forEach(function(fr){
        if(!fr.landed){ fr.warn -= dt; if(fr.warn <= 0){ var o = occupied(M, fr.x, fr.y); if(o){ fr.life = 0; push(M, { k: 'crumble', x: fr.x, y: fr.y }); } else { fr.landed = true; push(M, { k: 'rockfall', x: fr.x, y: fr.y }); } } }
        else fr.life -= dt; });
      M.falling = M.falling.filter(function(fr){ return fr.life > 0; });
    }
    M.walls2.forEach(function(w){ w.life -= dt; }); M.walls2 = M.walls2.filter(function(w){ return w.life > 0; });
    if(M.L.runaway){ M.runT = (M.runT || 0) + dt; if(M.runT > 0.5){ M.runT = 0; runFood(M); } }
    // snakes
    for(var si = 0; si < M.snakes.length; si++){
      var s = M.snakes[si]; if(!s.alive) continue;
      tickCommon(M, s, dt);
      if(s.down > 0){ s.down -= dt; continue; }
      if(s.frozenT > 0) continue;
      s.acc += dt * (M.slowT > 0 && M.slowBy !== s.i ? 0.5 : 1);
      var iv = M.tick / (s.dashT > 0 ? 2 : 1);
      var guard = 0;
      while(s.acc >= iv && guard++ < 4 && s.alive && !M.over && !(s.down > 0)){ s.acc -= iv; moveSnake(M, s); }
      if(s.down > 0) s.acc = 0;
    }
  }
  function moveSnake(M, s){
    if(s.q.length) s.dir = s.q.shift();
    var c = nextCell(M, s.body[0][0], s.body[0][1], s.dir);
    if(M.L.wrap) { var w = wrapXY(M, c.x, c.y); c.x = w[0]; c.y = w[1]; }
    var h = hitAt(M, s, c.x, c.y);
    if(h && s.chili && (h.why === 'rock' || h.why === 'mover' || h.why === 'rock2' || h.why === 'tailwall' || (h.why === 'wall' && inb(M, c.x, c.y)))){
      burnAt(M, c.x, c.y); s.chili = 0; push(M, { k: 'burn', s: s.i, x: c.x, y: c.y }); h = null;
    }
    if(h){ bump(M, s, h); return; }
    s.prev = s.body.map(function(b){ return b.slice(); });
    s.body.unshift([c.x, c.y]);
    if(s.grow > 0) s.grow--; else s.body.pop();
    if(c.portal != null) push(M, { k: 'portal', s: s.i });
    // magnet: food within 3 cells drifts 1 step toward the head
    if(s.magT > 0) M.foods.forEach(function(f){ if(Math.abs(f.x - c.x) + Math.abs(f.y - c.y) <= 4){ var sx = Math.sign(c.x - f.x), sy = Math.sign(c.y - f.y); var nx = f.x + (Math.abs(c.x - f.x) >= Math.abs(c.y - f.y) ? sx : 0), ny = f.y + (Math.abs(c.x - f.x) >= Math.abs(c.y - f.y) ? 0 : sy); if(!occupied(M, nx, ny, { noSnakes: true }) && !M.foods.some(function(o){ return o !== f && o.x === nx && o.y === ny; })){ f.x = nx; f.y = ny; } } });
    for(var fi = M.foods.length - 1; fi >= 0; fi--){ var f = M.foods[fi]; if(f.x === c.x && f.y === c.y){ M.foods.splice(fi, 1); eatFeast(M, s, f); } }
    var L = lenOf(M, s); if(L > s.maxLen) s.maxLen = L;
    if(L >= M.target && !M.over){ finish(M, s.i, 'target'); }
  }
  function burnAt(M, x, y){
    if(inb(M, x, y)) M.wall[y * M.n + x] = 0;
    M.movers = M.movers.filter(function(m){ return !(m.x === x && m.y === y); });
    M.falling = M.falling.filter(function(f){ return !(f.x === x && f.y === y); });
    M.walls2 = M.walls2.filter(function(w){ return !(w.x === x && w.y === y); });
  }
  function eatFeast(M, s, f){
    var pts = 10 * (M.lv + 1) * (s.starT > 0 ? 2 : 1);
    M.eatenAll++;
    if(f.k === 'n'){ s.grow += 1; s.eaten++; s.score += pts; s.goldRow = 0; questEat(M, s, f.c); push(M, { k: 'eat', s: s.i, x: f.x, y: f.y, f: f.k }); }
    else if(f.k === 'g'){ s.grow += 3; s.eaten++; s.gold++; s.goldRow++; s.goldRowBest = Math.max(s.goldRowBest, s.goldRow); s.score += pts * 3; questEat(M, s, 'gold'); push(M, { k: 'gold', s: s.i, x: f.x, y: f.y }); }
    else if(f.k === 'b'){ var cut = Math.min(2, Math.max(0, s.body.length - 3)); s.body.splice(s.body.length - cut, cut); s.goldRow = 0; push(M, { k: 'bad', s: s.i, x: f.x, y: f.y }); }
    else if(POWERS[f.k]) { applyPower(M, s, f.k); s.powers++; push(M, { k: 'power', s: s.i, p: f.k, x: f.x, y: f.y }); }
    // speed-ups
    var L = M.L;
    if(L.speedUp && f.k !== 'b' && !POWERS[f.k] && L.every && (s.eaten % L.every === 0)) { var old = M.tick; M.tick = Math.max(L.min, M.tick - L.speedUp); if(M.tick < old && L.every >= 5) push(M, { k: 'faster' }); }
    var L2 = lenOf(M, s); if(Math.floor(L2 / 10) > Math.floor((L2 - (f.k === 'g' ? 3 : 1)) / 10) && f.k !== 'b') push(M, { k: 'grow10', s: s.i, len: L2 });
    // keep the field stocked
    var real = M.foods.filter(function(x){ return x.k === 'n' || x.k === 'g'; }).length;
    while(real < M.L.foods){ if(!spawnFood(M)) break; real = M.foods.filter(function(x){ return x.k === 'n' || x.k === 'g'; }).length; }
  }
  function applyPower(M, s, k){
    if(k === 'star') s.starT = POWERS.star.t;
    else if(k === 'mush'){ if(M.mode === 'gate') s.len = Math.max(6, s.len - 6); else { var cut = Math.min(3, Math.max(0, s.body.length - 3)); s.body.splice(s.body.length - cut, cut); } }
    else if(k === 'chili') s.chili = 1;
    else if(k === 'ice'){ M.freezeT = 2; M.snakes.forEach(function(o){ if(o !== s && o.alive) o.frozenT = 2; }); }
    else if(k === 'rainbow') s.rainT = POWERS.rainbow.t;
    else if(k === 'bomb'){ var h = s.body[0]; for(var y = h[1] - 2; y <= h[1] + 2; y++) for(var x = h[0] - 2; x <= h[0] + 2; x++) if(inb(M, x, y) && M.wall[y * M.n + x] === 2) { M.wall[y * M.n + x] = 0; push(M, { k: 'boom', x: x, y: y }); }
      M.falling = M.falling.filter(function(fr){ return Math.abs(fr.x - h[0]) > 2 || Math.abs(fr.y - h[1]) > 2; }); }
  }
  function runFood(M){
    // 🏃 food runs away from a head that comes close (Extreme + Hardcore)
    M.foods.forEach(function(f){
      if(f.k !== 'n' && f.k !== 'g') return;
      var near = null, dmin = 99; M.snakes.forEach(function(s){ if(!s.alive) return; var d = Math.abs(s.body[0][0] - f.x) + Math.abs(s.body[0][1] - f.y); if(d < dmin){ dmin = d; near = s; } });
      if(!near || dmin > 3 || dmin < 2 || f.run > 6) return;
      var h = near.body[0], best = null, bd = dmin;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){ var x = f.x + d[0], y = f.y + d[1]; if(!inb(M, x, y) || occupied(M, x, y)) return; var dd = Math.abs(h[0] - x) + Math.abs(h[1] - y); if(dd > bd){ bd = dd; best = [x, y]; } });
      if(best){ f.x = best[0]; f.y = best[1]; f.run++; push(M, { k: 'run', x: f.x, y: f.y }); }
    });
  }
  function safeDirs(M, s){
    var h = s.body[0], out = [];
    DK.forEach(function(d){ if(d === OPP[s.dir] && s.body.length > 1) return; var c = nextCell(M, h[0], h[1], d); if(M.L.wrap){ var w = wrapXY(M, c.x, c.y); c.x = w[0]; c.y = w[1]; } if(hitAt(M, s, c.x, c.y)) return;
      var room = 0; DK.forEach(function(d2){ var c2 = nextCell(M, c.x, c.y, d2); if(M.L.wrap){ var w2 = wrapXY(M, c2.x, c2.y); c2.x = w2[0]; c2.y = w2[1]; } if(!hitAt(M, s, c2.x, c2.y)) room++; });
      out.push({ d: d, room: room }); });
    out.sort(function(a, b){ return b.room - a.room; });
    return out;
  }
  function bump(M, s, h){
    s.q = [];
    if(s.shield){ s.shield = 0; push(M, { k: 'shieldHit', s: s.i }); var sd = safeDirs(M, s); if(sd.length) s.dir = sd[0].d; s.down = 0.35; return; }
    s.lives--; s.hurt++; s.goldRow = 0;
    push(M, { k: 'bump', s: s.i, why: h.why, by: h.by, x: s.body[0][0], y: s.body[0][1] });
    if(h.why === 'snake' && h.by != null){ var o = M.snakes[h.by]; if(o && h.head && o.alive){ o.lives--; o.hurt++; push(M, { k: 'bump', s: o.i, why: 'snake', by: s.i, x: o.body[0][0], y: o.body[0][1] });
      if(o.lives <= 0 && s.lives <= 0){ o.alive = false; s.alive = false; push(M, { k: 'out', s: o.i }); push(M, { k: 'out', s: s.i }); var left = M.snakes.filter(function(x){ return x.alive; }); if(left.length === 1 && M.duel) finish(M, left[0].i, 'last'); else if(!left.length) finish(M, -1, 'draw'); return; }
      if(o.lives <= 0) out(M, o); else fallOff(M, o); } }
    if(s.lives <= 0){ out(M, s); return; }
    fallOff(M, s);
  }
  function fallOff(M, s){
    // the rider falls off, bounces, gets back on: the snake turns to the safest way (or drops half its tail if boxed in)
    s.down = 1.3; s.q = [];
    var sd = safeDirs(M, s);
    if(sd.length) s.dir = sd[0].d;
    else { var keep = Math.max(3, Math.ceil(s.body.length / 2)); s.body = s.body.slice(0, keep); var sd2 = safeDirs(M, s); if(sd2.length) s.dir = sd2[0].d; else { s.body = s.body.slice(0, 2); s.body.reverse(); s.dir = OPP[s.dir]; } }
  }
  function out(M, s){
    s.alive = false; s.lives = 0; push(M, { k: 'out', s: s.i });
    var alive = M.snakes.filter(function(x){ return x.alive; });
    if(M.snakes.length === 1) finish(M, -1, 'out');
    else if(alive.length === 1 && M.duel) finish(M, alive[0].i, 'last');
    else if(alive.length === 0) finish(M, -1, 'out');
  }
  function tailDrop(M, s){
    if(M.mode === 'gate'){ var half = Math.max(0, (s.len - 6) / 2); if(half < 1) return; dropDots(M, s.pts.slice(Math.floor(s.pts.length / 2)), half * 0.9, s.i); s.len -= half; return; }
    var keep = Math.max(3, Math.ceil(s.body.length / 2)), cut = s.body.slice(keep); s.body = s.body.slice(0, keep);
    if(M.mode === 'castle') return;
    if(M.lv < 2) { cut.forEach(function(c, i){ if(i % 2 === 0 && !M.foods.some(function(f){ return f.x === c[0] && f.y === c[1]; })) M.foods.push({ x: c[0], y: c[1], k: 'n', c: COLS[i % 3], born: M.t, run: 0, leaf: true }); }); return; }   // Basic / Junior: no walls that knock anyone out
    cut.forEach(function(c){ M.walls2.push({ x: c[0], y: c[1], life: 10, by: s.i + 1 }); });
  }
  function finish(M, winner, why){
    if(M.over) return; M.over = true; M.winner = winner; M.why = why; push(M, { k: 'over', winner: winner, why: why });
  }
  function feastStars(M, i){
    var s = M.snakes[i]; if(M.endless || M.winner !== i) return 0;
    var st = 1; if(s.hurt === 0) st = 2; if(s.hurt === 0 && M.t <= M.L.par) st = 3; return st;
  }
  function feastScore(M, i){
    var s = M.snakes[i], L = lenOf(M, s), won = M.winner === i;
    return Math.round(s.score + L * 5 + (won && !M.endless ? Math.max(0, M.L.par - M.t) * 4 * (M.lv + 1) : 0)) * (M.lv === 5 ? 3 : 1);
  }

  // ======================================================================
  // 🧭 SNAKIGATE — free steering arena
  var SP = 0.42, BASE_V = 5.0, BOOST_K = 1.85;
  function radius(s){ return 0.4 + Math.min(0.45, s.len / 250); }
  function newGate(o){
    var L = o.mods ? Object.assign({}, GATE[o.level], o.mods) : GATE[o.level];
    var M = { mode: 'gate', L: L, lv: o.level, rnd: rng(o.seed || 1), t: 0, ev: [], over: false, winner: -1, R: L.R, R0: L.R, dots: [], snakes: [],
      time: o.time != null ? o.time : L.time, skills: !!o.skills, skillCd: 14, giftEvery: L.gift, giftT: L.gift, slowT: 0, slowBy: -1, freezeT: 0, duel: false, respawn: !(L.edge === 'shrink'), story: o.story || null, goalLen: o.goalLen || 0 };
    var P = o.players && o.players.length ? o.players : [{ name: 'You', human: true }];
    M.duel = P.filter(function(p){ return p.human; }).length > 1 && !o.coop; M.coop = !!o.coop; if(M.story) M.time = 0;
    var bots = o.bots != null ? o.bots : L.bots, avs = o.botAvs || [];
    var all = P.slice(); for(var b = 0; b < bots; b++) all.push({ name: (avs[b] && avs[b].name) || ('Robo ' + (b + 1)), human: false, av: avs[b] ? avs[b].av : null, robo: !(avs[b] && avs[b].name), col: avs[b] && avs[b].col });
    all.forEach(function(p, i){
      var s = baseSnake(i, p); s.robo = !!p.robo; s.lives = p.human ? (o.lives || L.lives) : 1;
      var a = (i / all.length) * Math.PI * 2 + 0.3, r = M.R * (p.human ? 0.35 : 0.6);
      placeGate(M, s, Math.cos(a) * r, Math.sin(a) * r, a + Math.PI * (p.human ? 0.5 : 0.5), p.human ? 10 : 8 + Math.floor(M.rnd() * 10)); if(p.human) s.inv = 3;
      s.think = M.rnd() * L.react; s.wander = s.ang;
      M.snakes.push(s);
    });
    if(o.boss){ var bs = baseSnake(M.snakes.length, { name: o.boss.name, human: false, av: o.boss.av || null, col: o.boss.col }); bs.boss = true; bs.icon = o.boss.icon; bs.lives = 1; bs.spdK = o.boss.spd || 0.9;
      placeGate(M, bs, 0, -M.R * 0.5, 0, o.boss.len || 60); bs.think = 0; bs.wander = 0; M.snakes.push(bs); M.boss = bs; }
    var want = Math.round(M.R * M.R * L.dots); for(var d = 0; d < want; d++) addDot(M);
    return M;
  }
  function placeGate(M, s, x, y, ang, len){
    s.x = x; s.y = y; s.ang = ang; s.aim = ang; s.len = len; s.boost = false; s.alive = true; s.dropT = 0; s.inv = 1.5;
    s.pts = []; for(var k = 0; k <= Math.ceil(len) + 1; k++) s.pts.push([x - Math.cos(ang) * SP * k, y - Math.sin(ang) * SP * k]);
  }
  function randInArena(M, rmax){ var a = M.rnd() * Math.PI * 2, r = Math.sqrt(M.rnd()) * rmax; return [Math.cos(a) * r, Math.sin(a) * r]; }
  function addDot(M, x, y, v, big, col){
    if(x == null){ var p = randInArena(M, M.R - 1); x = p[0]; y = p[1]; }
    M.dots.push({ x: x, y: y, v: v || 1, big: !!big, c: col || COLS[Math.floor(M.rnd() * 3)], k: 'n' });
    if(M.L && M.lv >= 2 && !big && M.rnd() < 0.02 && !M.dots.some(function(d){ return POWERS[d.k]; })) { var q = M.dots[M.dots.length - 1]; q.k = pickPower(M); q.v = 1; }
  }
  function dropDots(M, pts, total, by){
    if(!pts.length || total <= 0) return;
    var n = Math.max(1, Math.min(pts.length, Math.round(total / 1.5))), each = total / n;
    for(var i = 0; i < n; i++){ var p = pts[Math.floor(i * pts.length / n)]; M.dots.push({ x: p[0] + (M.rnd() - 0.5) * 0.6, y: p[1] + (M.rnd() - 0.5) * 0.6, v: each, big: true, c: COLS[i % 3], k: 'n', by: by }); }
  }
  function steer(M, i, ang){ var s = M.snakes[i]; if(s) s.aim = ang; }
  function setBoost(M, i, on){ var s = M.snakes[i]; if(s) s.boost = !!on; }
  function stepGate(M, dt){
    if(M.over) return;
    var h = 1 / 60, n = Math.max(1, Math.round(dt / h)); h = dt / n;
    for(var k = 0; k < n && !M.over; k++) gateTick(M, h);
  }
  function angDiff(a, b){ var d = (b - a) % (Math.PI * 2); if(d > Math.PI) d -= Math.PI * 2; if(d < -Math.PI) d += Math.PI * 2; return d; }
  function gateTick(M, dt){
    var L = M.L; M.t += dt;
    if(M.slowT > 0) M.slowT = Math.max(0, M.slowT - dt);
    if(M.freezeT > 0) M.freezeT = Math.max(0, M.freezeT - dt);
    if(L.edge === 'shrink') M.R = Math.max(L.minR, M.R0 - (M.R0 - L.minR) * Math.min(1, M.t / L.shrinkT));
    tickGifts(M, dt);
    var alive = M.snakes.filter(function(s){ return s.alive; });
    // bots think
    M.snakes.forEach(function(s){ if(!s.alive || s.human) return; s.think -= dt; if(s.think <= 0){ s.think = L.react * (0.7 + M.rnd() * 0.6); botThink(M, s); } });
    // move
    M.snakes.forEach(function(s){
      if(!s.alive){ if(s.respawnT != null){ s.respawnT -= dt; if(s.respawnT <= 0) respawnGate(M, s); } return; }
      tickCommon(M, s, dt); if(s.inv > 0) s.inv -= dt;
      if(s.frozenT > 0) return;
      var slow = M.slowT > 0 && M.slowBy !== s.i ? 0.5 : 1;
      var turnRate = 3.8 / (1 + s.len / 420);
      var d = angDiff(s.ang, s.aim), mx = turnRate * dt; s.turning = Math.max(-1, Math.min(1, d / (mx * 6 || 1)));
      s.ang += Math.max(-mx, Math.min(mx, d));
      var boosting = (s.boost && s.len > 6) || s.dashT > 0;
      var v = BASE_V * (s.human ? 1 : (s.spdK || L.spd)) * (boosting ? BOOST_K : 1) * slow;
      s.boosting = boosting;
      if(s.boost && s.len > 6 && !(s.dashT > 0)){ s.len -= 1.5 * dt; s.dropT -= dt; if(s.dropT <= 0){ s.dropT = 0.3; var tl = s.pts[s.pts.length - 1]; M.dots.push({ x: tl[0], y: tl[1], v: 0.45, big: false, c: COLS[Math.floor(M.rnd() * 3)], k: 'n' }); } }
      s.x += Math.cos(s.ang) * v * dt; s.y += Math.sin(s.ang) * v * dt;
      // edge
      var dist = Math.hypot(s.x, s.y), r = radius(s);
      if(dist > M.R - r){
        if(L.edge === 'soft' && !s.story){ var a = Math.atan2(s.y, s.x); s.x = Math.cos(a) * (M.R - r); s.y = Math.sin(a) * (M.R - r); s.ang = a + Math.PI + angDiff(a + Math.PI, s.ang) * 0.3; s.aim = s.ang; if(s.human) push(M, { k: 'edge', s: s.i }); }
        else { popSnake(M, s, -1, 'edge'); return; }
      }
      // body points
      s.pts[0] = [s.x, s.y];
      var p1 = s.pts[1]; if(!p1 || Math.hypot(s.x - p1[0], s.y - p1[1]) >= SP) s.pts.splice(1, 0, [s.x, s.y]);
      var want = Math.ceil(s.len) + 1; if(s.pts.length > want) s.pts.length = want;
      if(s.len > s.maxLen) s.maxLen = Math.round(s.len);
    });
    // eat
    var eatR = 0.9;
    M.snakes.forEach(function(s){
      if(!s.alive) return; var r = radius(s) + (s.human ? eatR : eatR * 0.6), mag = s.magT > 0 ? 5 : 0;
      for(var i = M.dots.length - 1; i >= 0; i--){ var d = M.dots[i], dx = d.x - s.x, dy = d.y - s.y, dd = dx * dx + dy * dy;
        if(mag && dd < mag * mag && dd > r * r){ var q = Math.sqrt(dd); d.x -= dx / q * 0.25; d.y -= dy / q * 0.25; continue; }
        if(dd < r * r){ M.dots.splice(i, 1); eatGate(M, s, d); } }
    });
    // collisions (spatial hash over body points)
    var cell = 2, H = {};
    M.snakes.forEach(function(s){ if(!s.alive) return; for(var j = 2; j < s.pts.length; j++){ var p = s.pts[j], key = Math.floor(p[0] / cell) + ',' + Math.floor(p[1] / cell); (H[key] || (H[key] = [])).push(s.i, j); } });
    var dead = [];
    M.snakes.forEach(function(s){
      if(!s.alive || s.inv > 0) return;
      var r = radius(s) * (s.human ? 0.6 : 0.8), cx = Math.floor(s.x / cell), cy = Math.floor(s.y / cell), hit = -1;
      for(var gx = cx - 1; gx <= cx + 1 && hit < 0; gx++) for(var gy = cy - 1; gy <= cy + 1 && hit < 0; gy++){
        var list = H[gx + ',' + gy]; if(!list) continue;
        for(var q = 0; q < list.length; q += 2){ var o = M.snakes[list[q]]; if(o === s) continue; if(s.ghostT > 0) continue; var p = o.pts[list[q + 1]]; var rr = r + radius(o) * 0.85;
          if((p[0] - s.x) * (p[0] - s.x) + (p[1] - s.y) * (p[1] - s.y) < rr * rr){ hit = o.i; break; } }
      }
      if(hit >= 0) dead.push([s, hit]);
    });
    // head to head: the shorter one pops (both when equal)
    for(var a = 0; a < M.snakes.length; a++) for(var b = a + 1; b < M.snakes.length; b++){
      var A = M.snakes[a], B = M.snakes[b]; if(!A.alive || !B.alive || A.inv > 0 || B.inv > 0) continue;
      var rr2 = radius(A) + radius(B); if((A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y) < rr2 * rr2 * 0.8){ if(A.len <= B.len + 0.5) dead.push([A, B.i]); if(B.len <= A.len + 0.5) dead.push([B, A.i]); }
    }
    dead.forEach(function(d){
      var s = d[0]; if(!s.alive) return;
      if(L.soft && s.human && !M.duel){ s.inv = 1; s.ang += Math.PI * 0.75; s.aim = s.ang; s.len = Math.max(6, s.len - 2); s.hurt++; push(M, { k: 'bounce', s: s.i }); return; }   // 🌱 Basic: you bounce off, no pop
      popSnake(M, s, d[1], 'bump'); });
    // stock
    var want2 = Math.round(M.R0 * M.R0 * L.dots * Math.min(1, (M.R / M.R0) * (M.R / M.R0) + 0.2));
    if(M.dots.length < want2 && M.rnd() < 0.5) addDot(M);
    M.dots = M.dots.filter(function(d){ return Math.hypot(d.x, d.y) < M.R + 0.5; });
    // end
    if(M.time && M.t >= M.time){ var rank = gateRank(M); finish(M, rank[0].i, 'time'); return; }
    var aliveH = M.snakes.filter(function(s){ return s.alive || (s.respawnT != null); });
    if(!M.respawn && M.snakes.filter(function(s){ return s.alive; }).length <= 1){ var last = M.snakes.filter(function(s){ return s.alive; })[0]; finish(M, last ? last.i : -1, 'last'); return; }
    if(M.goalLen && !M.over){ M.snakes.forEach(function(s){ if(s.human && s.alive && s.len >= M.goalLen) finish(M, s.i, 'target'); }); }
    var humansLeft = M.snakes.filter(function(s){ return s.human && (s.alive || s.respawnT != null); });
    if(!humansLeft.length){ finish(M, -1, 'out'); }
    else if(M.duel && humansLeft.length === 1 && !M.respawn){ finish(M, humansLeft[0].i, 'last'); }
    alive = null; aliveH = null;
  }
  function eatGate(M, s, d){
    var pts = Math.round(d.v * 10 * (M.lv + 1) * (s.starT > 0 ? 2 : 1));
    if(POWERS[d.k]){ applyPower(M, s, d.k); s.powers++; push(M, { k: 'power', s: s.i, p: d.k, x: d.x, y: d.y }); return; }
    var before = s.len; s.len += d.v * 0.5; s.eaten++; s.score += pts; questEat(M, s, d.c);
    if(d.big) push(M, { k: 'eatBig', s: s.i, x: d.x, y: d.y }); else if(s.human && s.eaten % 4 === 0) push(M, { k: 'eat', s: s.i, x: d.x, y: d.y });
    if(Math.floor(s.len / 10) > Math.floor(before / 10)) push(M, { k: 'grow10', s: s.i, len: Math.round(s.len) });
  }
  function popSnake(M, s, by, why){
    if(!s.alive) return;
    if(s.shield){ s.shield = 0; s.inv = 1.2; s.ang += Math.PI; s.aim = s.ang; push(M, { k: 'shieldHit', s: s.i }); return; }
    s.alive = false; s.hurt++;
    dropDots(M, s.pts, s.len * 0.65, s.i);
    var o = by >= 0 ? M.snakes[by] : null; if(o && o.alive){ o.popped++; o.score += Math.round(s.len * 5); }
    push(M, { k: 'pop', s: s.i, by: by, why: why, x: s.x, y: s.y, len: Math.round(s.len), human: s.human });
    if(s.human){ s.lives--; s.keepLen = s.len * (M.L.keep || 0); if(s.lives > 0) s.respawnT = 1.6; else { s.respawnT = null; push(M, { k: 'out', s: s.i }); } }
    else if(M.respawn && !s.boss) s.respawnT = 2.5;
    else s.respawnT = null;
  }
  function respawnGate(M, s){
    s.respawnT = null;
    for(var t = 0; t < 60; t++){
      var p = randInArena(M, M.R * 0.8), safe = M.snakes.every(function(o){ return !o.alive || o.pts.every(function(q){ return Math.hypot(q[0] - p[0], q[1] - p[1]) > 4; }); });
      if(safe || t === 59){ placeGate(M, s, p[0], p[1], Math.atan2(-p[1], -p[0]), s.human ? Math.max(10, Math.round(s.keepLen || 0)) : 8 + Math.floor(M.rnd() * 8)); push(M, { k: 'respawn', s: s.i }); return; }
    }
  }
  function gateRank(M){ return M.snakes.slice().sort(function(a, b){ return (b.alive ? b.len : b.len * 0.5) - (a.alive ? a.len : a.len * 0.5); }); }
  // ray check: free distance ahead along angle a (bodies of others + own far body + the edge)
  function freeAhead(M, s, a, look){
    var r = radius(s) + 0.6, best = look, cs = Math.cos(a), sn = Math.sin(a);
    var edgeD = rayCircle(s.x, s.y, cs, sn, M.R - r); if(edgeD < best) best = edgeD;
    for(var i = 0; i < M.snakes.length; i++){ var o = M.snakes[i]; if(!o.alive) continue; var start = o === s ? 12 : 0;
      for(var j = start; j < o.pts.length; j += 2){ var p = o.pts[j], dx = p[0] - s.x, dy = p[1] - s.y, along = dx * cs + dy * sn; if(along < 0 || along > best) continue; var side = Math.abs(dx * sn - dy * cs); if(side < r + radius(o)) best = along; } }
    return best;
  }
  function rayCircle(x, y, cs, sn, R){ var b = x * cs + y * sn, c = x * x + y * y - R * R, disc = b * b - c; if(disc < 0) return 0; return -b + Math.sqrt(disc); }
  function botThink(M, s){
    var L = M.L, goal = s.ang;
    // 1) a goal: food, a cut-in, a circle, the leader
    var me = M.snakes.filter(function(o){ return o.human && o.alive; });
    var target = null, boost = false;
    if(M.rnd() < L.cut && me.length){ var h = me[0], dd = Math.hypot(h.x - s.x, h.y - s.y); if(dd < 9 && s.len > 9){ target = [h.x + Math.cos(h.ang) * 4, h.y + Math.sin(h.ang) * 4]; boost = M.rnd() < L.boost; } }
    if(!target && M.rnd() < L.circle){ var small = M.snakes.filter(function(o){ return o !== s && o.alive && o.len < s.len * 0.6 && Math.hypot(o.x - s.x, o.y - s.y) < 10; })[0]; if(small) { var ca = Math.atan2(small.y - s.y, small.x - s.x) + 1.2; target = [small.x - Math.cos(ca) * 3, small.y - Math.sin(ca) * 3]; } }
    if(!target && M.rnd() < L.team){ var lead = gateRank(M)[0]; if(lead && lead !== s && lead.alive && Math.hypot(lead.x - s.x, lead.y - s.y) < 14) { target = [lead.x + Math.cos(lead.ang) * 5, lead.y + Math.sin(lead.ang) * 5]; boost = M.rnd() < L.trap; } }
    if(!target && M.rnd() < L.greed){ var bestD = 1e9, bd = null; for(var i = 0; i < M.dots.length; i++){ var d = M.dots[i], q = (d.x - s.x) * (d.x - s.x) + (d.y - s.y) * (d.y - s.y) - (d.big ? 30 : 0); if(q < bestD){ bestD = q; bd = d; } } if(bd && bestD < 140) target = [bd.x, bd.y]; }
    if(target) goal = Math.atan2(target[1] - s.y, target[0] - s.x);
    else { if(M.rnd() < 0.3) s.wander = s.ang + (M.rnd() - 0.5) * 1.6; goal = s.wander; }
    // Basic: never go for the player
    if(L.chase === 0 && me.length){ var hp = me[0], ap = Math.atan2(hp.y - s.y, hp.x - s.x); if(Math.abs(angDiff(goal, ap)) < 0.6 && Math.hypot(hp.x - s.x, hp.y - s.y) < 8) goal = ap + Math.PI * 0.7; }
    // 2) safety: look ahead on a fan of angles, take the free one closest to the goal
    var look = 3.5 + BASE_V * 0.45, choices = [0, 0.35, -0.35, 0.75, -0.75, 1.2, -1.2, 1.8, -1.8, 2.6, -2.6], best = goal, bestScore = -1e9;
    if(M.rnd() < L.avoid){
      for(var c = 0; c < choices.length; c++){
        var a = s.ang + choices[c] + angDiff(s.ang, goal) * (c === 0 ? 1 : 0), free = freeAhead(M, s, a, look);
        var sc = free * 3 - Math.abs(angDiff(a, goal)) * 1.2 - Math.abs(choices[c]) * 0.3;
        if(free >= look * 0.98) sc += 6;
        if(sc > bestScore){ bestScore = sc; best = a; }
      }
    }
    s.aim = best; s.boost = boost && s.len > 10;
  }
  function gateStars(M, i){ var s = M.snakes[i]; if(M.winner !== i) return 0; var st = 1; if(s.hurt === 0) st = 2; if(s.hurt === 0 && s.maxLen >= 40 + M.lv * 15) st = 3; return st; }
  function gateScore(M, i){ var s = M.snakes[i]; return Math.round(s.score + s.maxLen * 6 + s.popped * 60 + (M.winner === i ? 300 * (M.lv + 1) : 0)) * (M.lv === 5 ? 3 : 1); }

  // ======================================================================
  function make(mode, o){ return mode === 'gate' ? newGate(o) : mode === 'castle' ? (SN.newCastle ? SN.newCastle(o) : null) : newFeast(o); }
  function step(M, dt){ if(M.mode === 'gate') stepGate(M, dt); else if(M.mode === 'castle') SN.stepCastle(M, dt); else stepFeast(M, dt); if(M.story) storyCheck(M); }
  // 📜 Snaketale goals (shared by all heroes in co-op)
  function storyCheck(M){
    var st = M.story; if(!st || M.over) return;
    var H = M.snakes.filter(function(s){ return s.human; }), sum = function(k){ return H.reduce(function(a, s){ return a + (s[k] || 0); }, 0); };
    if(st.goal === 'lead' && st.flags && M.leadI < st.flags.length){ var f = st.flags[M.leadI]; if(H.some(function(s){ if(!s.alive) return false; var h = headPos(M, s); return M.mode === 'gate' ? Math.hypot(h[0] - f[0], h[1] - f[1]) < 2.2 : h[0] === f[0] && h[1] === f[1]; })){ M.leadI++; push(M, { k: 'lead', n: M.leadI, x: f[0], y: f[1] }); } }
    var have = st.goal === 'gold' ? sum('gold') : st.goal === 'grow' ? Math.max.apply(null, H.map(function(s){ return lenOf(M, s); })) : st.goal === 'pop' ? sum('popped') : st.goal === 'land' ? Math.floor(H.reduce(function(a, s){ return a + (s.land || 0); }, 0)) : st.goal === 'lead' ? M.leadI : st.goal === 'escape' ? Math.floor(M.t) : st.goal === 'boss' ? (M.boss && !M.boss.alive ? 1 : 0) : 0;
    st.have = have;
    if(have >= st.need){ finish(M, H[0].i, 'story'); return; }
    if(st.time && M.t >= st.time){ if(st.goal === 'boss' && M.boss && H.some(function(s){ return s.alive && s.len > M.boss.len; })) finish(M, H[0].i, 'story'); else finish(M, -1, 'time'); }
  }
  function stars(M, i){ return M.mode === 'gate' ? gateStars(M, i) : M.mode === 'castle' ? SN.castleStars(M, i) : feastStars(M, i); }
  function score(M, i){ return M.mode === 'gate' ? gateScore(M, i) : M.mode === 'castle' ? SN.castleScore(M, i) : feastScore(M, i); }
  // pure auto-player for tests: grid modes = BFS to the nearest food avoiding danger; arena = the Hard bot brain
  function autoFeast(M, i){
    var s = M.snakes[i]; if(!s || !s.alive || s.q.length) return null;
    var n = M.n, h = s.body[0], seen = {}, Q = [[h[0], h[1], null]], k0 = h[0] + ',' + h[1]; seen[k0] = 1;
    var goal = null;
    while(Q.length && !goal){ var c = Q.shift();
      for(var di = 0; di < 4; di++){ var d = DK[di]; if(c[2] == null && d === OPP[s.dir]) continue; var nc = nextCell(M, c[0], c[1], d); if(M.L.wrap){ var w = wrapXY(M, nc.x, nc.y); nc.x = w[0]; nc.y = w[1]; }
        var key = nc.x + ',' + nc.y; if(seen[key]) continue; seen[key] = 1; if(hitAt(M, s, nc.x, nc.y)) continue;
        var first = c[2] || d;
        if(M.foods.some(function(f){ return f.x === nc.x && f.y === nc.y && (f.k === 'n' || f.k === 'g'); })){ goal = first; break; }
        Q.push([nc.x, nc.y, first]); } }
    var sd = safeDirs(M, s);
    var pick = goal && sd.some(function(x){ return x.d === goal && x.room >= 1; }) ? goal : (sd[0] && sd[0].d);
    if(pick && pick !== s.dir) turn(M, i, pick);
    return pick;
  }
  function autoDir(M, i){ var s = M.snakes[i]; if(!s || !s.alive || s.q.length) return null; var keep = s.q; s.q = []; var d = autoFeast(M, i); s.q = keep; return d && d !== s.dir ? d : null; }
  function autoGate(M, i){
    // a careful player: food close by, but safety first (wide fan, long look, keeps away from big heads)
    var s = M.snakes[i]; if(!s || !s.alive) return;
    var goal = s.ang, bestD = 1e9, bd = null;
    for(var k = 0; k < M.dots.length; k++){ var d = M.dots[k], q = (d.x - s.x) * (d.x - s.x) + (d.y - s.y) * (d.y - s.y) - (d.big ? 20 : 0) + Math.hypot(d.x, d.y) * 2; if(q < bestD){ bestD = q; bd = d; } }
    if(bd) goal = Math.atan2(bd.y - s.y, bd.x - s.x);
    if(Math.hypot(s.x, s.y) > M.R * 0.75) goal = Math.atan2(-s.y, -s.x);
    var look = 7, best = goal, bestScore = -1e9;
    for(var c = -8; c <= 8; c++){
      var a = c === 0 ? goal : s.ang + c * 0.32, free = freeAhead(M, s, a, look), danger = 0;
      M.snakes.forEach(function(o){ if(o === s || !o.alive) return; var ex = o.x + Math.cos(o.ang) * 2.5, ey = o.y + Math.sin(o.ang) * 2.5, px = s.x + Math.cos(a) * 2.5, py = s.y + Math.sin(a) * 2.5; var dd = Math.hypot(ex - px, ey - py); if(dd < 3.5) danger += (3.5 - dd) * 3; });
      var sc = free * 4 - danger - Math.abs(angDiff(a, goal)) * 1.0;
      if(free >= look * 0.98) sc += 8;
      if(sc > bestScore){ bestScore = sc; best = a; }
    }
    s.aim = best; s.boost = false;
  }
  function auto(M, i){ if(M.mode === 'gate') autoGate(M, i); else if(M.mode === 'castle') SN.autoCastle(M, i); else autoFeast(M, i); }

  return { rng: rng, DIRS: DIRS, OPP: OPP, DK: DK, LEVEL_NAMES: LEVEL_NAMES, FEAST: FEAST, GATE: GATE, SKILLS: SKILLS, SKILL_KEYS: SKILL_KEYS, POWERS: POWERS, COLS: COLS,
    make: make, step: step, storyCheck: storyCheck, autoDir: autoDir, stars: stars, score: score, auto: auto, takeEvents: takeEvents, lenOf: lenOf, push: push, finish: finish, baseSnake: baseSnake, tickCommon: tickCommon, tickGifts: tickGifts, shuffle: shuffle,
    newFeast: newFeast, stepFeast: stepFeast, turn: turn, stickTurn: stickTurn, ghostPath: ghostPath, hitAt: hitAt, nextCell: nextCell, occupied: occupied, connected: connected, safeDirs: safeDirs, freeCell: freeCell, spawnFood: spawnFood,
    newGate: newGate, stepGate: stepGate, steer: steer, setBoost: setBoost, radius: radius, gateRank: gateRank, popSnake: popSnake, freeAhead: freeAhead, botThink: botThink, angDiff: angDiff,
    useSkill: useSkill, switchSkill: switchSkill, pickSkill: pickSkill, giveSkill: giveSkill, applyPower: applyPower, makeQuest: makeQuest, inb: inb };
})();
// ---------- 🏰 SNAKASTLE (land grab on a grid) — part of the engine ----------
(function(SN){
  'use strict';
  var DIRS = SN.DIRS, OPP = SN.OPP, DK = SN.DK;
  // n = map size · win = land % to win (0 = timer, most land wins) · steal = loops take other snakes' land · cut = bots cut trails (chance to go for one)
  var CASTLE = [
    { n: 22, bots: 1, win: 30, time: 0,   tick: 0.19, botTick: 0.36, rest: 3,    lives: 0, steal: false, botsCut: false, chase: 0,    fire: 0, trailK: 5, startLen: 6, foods: 4, gift: 30 },
    { n: 22, bots: 2, win: 40, time: 0,   tick: 0.18, botTick: 0.32, rest: 2.5, lives: 0, steal: false, botsCut: true,  chase: 0.08, fire: 0, trailK: 4, startLen: 6, foods: 4, gift: 34 },
    { n: 28, bots: 3, win: 45, time: 0,   tick: 0.16, botTick: 0.27, rest: 2,    lives: 0, steal: false, botsCut: true,  chase: 0.3,  fire: 0, trailK: 4, startLen: 6, foods: 5, gift: 40 },
    { n: 28, bots: 4, win: 50, time: 0,   tick: 0.15, botTick: 0.22, rest: 1.5, lives: 0, steal: true,  botsCut: true,  chase: 0.4,  fire: 0, trailK: 3, startLen: 6, foods: 5, gift: 45 },
    { n: 34, bots: 5, win: 0,  time: 180, tick: 0.14, botTick: 0.18, rest: 1,   lives: 0, steal: true,  botsCut: true,  chase: 0.5,  fire: 3, trailK: 3, startLen: 6, foods: 6, gift: 52, bonus: 60 },
    { n: 34, bots: 6, win: 0,  time: 180, tick: 0.13, botTick: 0.16, rest: 0.8, lives: 1, steal: true,  botsCut: true,  chase: 0.6,  fire: 3, trailK: 1, startLen: 8, foods: 7, gift: 60, bonus: 60 }
  ];
  function newCastle(o){
    var L = o.mods ? Object.assign({}, CASTLE[o.level], o.mods) : CASTLE[o.level], P = o.players && o.players.length ? o.players : [{ name: 'You', human: true }], n = o.n || (P.length > 2 ? Math.max(28, L.n) : L.n);
    var duo = P.filter(function(p){ return p.human; }).length > 1 && !o.coop;
    var M = { mode: 'castle', L: L, lv: o.level, n: n, rnd: SN.rng(o.seed || 1), t: 0, ev: [], over: false, winner: -1, own: new Int8Array(n * n), trail: new Int8Array(n * n), flags: [], foods: [], fires: [], snakes: [],
      time: o.story ? 0 : duo ? (o.time || 120) : (o.time != null ? o.time : L.time), win: o.story || duo ? 0 : (o.win != null ? o.win : L.win), coop: !!o.coop, duo: duo, duel: duo, skills: !!o.skills, skillCd: 14, giftEvery: L.gift, giftT: L.gift, slowT: 0, slowBy: -1, freezeT: 0, landRev: 0, story: o.story || null,
      wall: new Uint8Array(n * n), movers: [], portals: [], falling: [], walls2: [] };
    var bots = duo ? 0 : (o.bots != null ? o.bots : L.bots), avs = o.botAvs || [];
    var all = P.slice(); for(var b = 0; b < bots; b++) all.push({ name: (avs[b] && avs[b].name) || ('Robo ' + (b + 1)), human: false, av: avs[b] ? avs[b].av : null, robo: !(avs[b] && avs[b].name), col: avs[b] && avs[b].col });
    var spots = homeSpots(n, all.length, M.rnd);
    all.forEach(function(p, i){
      var s = SN.baseSnake(i, p); s.robo = !!p.robo; s.lives = L.lives || 0; s.len = o.startLen || L.startLen; s.home = spots[i];
      s.q = []; s.acc = M.rnd() * 0.1; s.tick = p.human ? L.tick : Math.max(L.tick, L.botTick); s.plan = null; s.cuts = 0; s.flags = 0; s.homes = 0;
      for(var y = s.home[1] - 1; y <= s.home[1] + 1; y++) for(var x = s.home[0] - 1; x <= s.home[0] + 1; x++) M.own[y * n + x] = i + 1;
      s.body = [[s.home[0], s.home[1]]]; s.dir = s.home[0] < n / 2 ? 'r' : 'l';
      M.snakes.push(s);
    });
    for(var f = 0; f < L.foods; f++) spawnFood(M);
    for(var h = 0; h < L.fire; h++) M.fires.push(newFire(M));
    M.snakes.forEach(function(s){ s.land = landPct(M, s.i); });
    return M;
  }
  function homeSpots(n, count, rnd){
    var m = 3, out = [], cand = [[m, m], [n - 1 - m, n - 1 - m], [n - 1 - m, m], [m, n - 1 - m], [Math.floor(n / 2), m], [Math.floor(n / 2), n - 1 - m], [m, Math.floor(n / 2)], [n - 1 - m, Math.floor(n / 2)]];
    for(var i = 0; i < count; i++) out.push(cand[i % cand.length]);
    return out;
  }
  function inb(M, x, y){ return x >= 0 && y >= 0 && x < M.n && y < M.n; }
  function landPct(M, i){ var c = 0, id = i + 1; for(var k = 0; k < M.own.length; k++) if(M.own[k] === id) c++; return c / M.own.length * 100; }
  function trailLen(M, s){ return s.trailCells ? s.trailCells.length : 0; }
  function maxTrail(M, s){ return Math.max(10, Math.round(s.len * M.L.trailK)); }
  function spawnFood(M){
    for(var t = 0; t < 200; t++){ var x = Math.floor(M.rnd() * M.n), y = Math.floor(M.rnd() * M.n);
      if(M.foods.some(function(f){ return f.x === x && f.y === y; })) continue;
      if(M.snakes.some(function(s){ return s.body.some(function(b){ return b[0] === x && b[1] === y; }); })) continue;
      var k = 'n', r = M.rnd(); if(M.lv >= 2 && r < 0.1 && !M.foods.some(function(f){ return SN.POWERS[f.k]; })) k = ['star', 'ice', 'rainbow', 'magnet'][Math.floor(M.rnd() * 4)]; else if(r < 0.22) k = 'g';
      if(k === 'magnet') k = 'star';
      M.foods.push({ x: x, y: y, k: k, c: SN.COLS[Math.floor(M.rnd() * 3)] }); return; }
  }
  function newFire(M){ var x = 2 + Math.floor(M.rnd() * (M.n - 4)), y = 2 + Math.floor(M.rnd() * (M.n - 4)); return { x: x, y: y, dx: M.rnd() < 0.5 ? 1 : -1, dy: M.rnd() < 0.5 ? 1 : -1, acc: 0, every: 0.45 }; }
  function sendHome(M, s, why, by){
    if(s.shield && why !== 'time'){ s.shield = 0; SN.push(M, { k: 'shieldHit', s: s.i }); clearTrail(M, s); return; }
    clearTrail(M, s); s.hurt++; s.homes++; s.q = []; s.plan = null;
    var o = by != null && by >= 0 ? M.snakes[by] : null; if(o && o !== s){ o.cuts++; o.score += 50; }
    SN.push(M, { k: 'cut', s: s.i, by: by, why: why, x: s.body[0][0], y: s.body[0][1] });
    if(M.L.lives){ s.lives--; if(s.lives <= 0){ s.alive = false; SN.push(M, { k: 'out', s: s.i });
      if(s.human && !M.duo){ SN.finish(M, -1, 'out'); return; }
      var al = M.snakes.filter(function(x){ return x.alive && x.human; }); if(!al.length) SN.finish(M, -1, 'out'); return; } }
    // back to the home land: the owned cell nearest the start spot
    var best = null, bd = 1e9; for(var k = 0; k < M.own.length; k++) if(M.own[k] === s.i + 1){ var x = k % M.n, y = (k / M.n) | 0, d = Math.abs(x - s.home[0]) + Math.abs(y - s.home[1]); if(d < bd){ bd = d; best = [x, y]; } }
    if(!best){ best = s.home.slice(); for(var yy = best[1] - 1; yy <= best[1] + 1; yy++) for(var xx = best[0] - 1; xx <= best[0] + 1; xx++) if(inb(M, xx, yy)) M.own[yy * M.n + xx] = s.i + 1; M.landRev++; }
    s.body = [best]; s.down = 1.1; s.acc = 0;
  }
  function clearTrail(M, s){ (s.trailCells || []).forEach(function(c){ if(M.trail[c] === s.i + 1) M.trail[c] = 0; }); s.trailCells = []; }
  // 🏰 claim: my land + my trail = a fence; flood the map from the edge — what the flood can't reach is inside the loop
  function claim(M, s){
    var n = M.n, id = s.i + 1, N = n * n, fence = new Uint8Array(N), seen = new Uint8Array(N), stack = [];
    for(var k = 0; k < N; k++) if(M.own[k] === id || M.trail[k] === id) fence[k] = 1;
    for(var x = 0; x < n; x++){ [x, (n - 1) * n + x].forEach(function(c){ if(!fence[c] && !seen[c]){ seen[c] = 1; stack.push(c); } }); }
    for(var y = 0; y < n; y++){ [y * n, y * n + n - 1].forEach(function(c){ if(!fence[c] && !seen[c]){ seen[c] = 1; stack.push(c); } }); }
    while(stack.length){ var c = stack.pop(), cx = c % n, cy = (c / n) | 0;
      if(cx > 0 && !seen[c - 1] && !fence[c - 1]){ seen[c - 1] = 1; stack.push(c - 1); }
      if(cx < n - 1 && !seen[c + 1] && !fence[c + 1]){ seen[c + 1] = 1; stack.push(c + 1); }
      if(cy > 0 && !seen[c - n] && !fence[c - n]){ seen[c - n] = 1; stack.push(c - n); }
      if(cy < n - 1 && !seen[c + n] && !fence[c + n]){ seen[c + n] = 1; stack.push(c + n); } }
    var got = 0, sx = 0, sy = 0, cells = [];
    for(var q = 0; q < N; q++){
      if(M.own[q] === id) continue;
      var inside = M.trail[q] === id || (!seen[q] && !fence[q]);
      if(!inside) continue;
      var other = M.own[q];
      if(other && other !== id){
        var oth = M.snakes[other - 1];
        if(M.duo && oth && oth.human){ M.own[q] = 0; continue; }   // 🚩🚩 land with both flags = no one's
        if(!M.L.steal) continue;                                    // below Hard: other snakes' land is safe
      }
      M.own[q] = id; got++; sx += q % n; sy += (q / n) | 0; cells.push(q);
    }
    clearTrail(M, s); M.landRev++;
    if(got){
      // enclosed snakes (their head inside the new land) are sent home
      M.snakes.forEach(function(o){ if(o === s || !o.alive) return; var h = o.body[0], c = h[1] * n + h[0]; if(M.own[c] === id && cells.indexOf(c) >= 0 && M.L.steal) sendHome(M, o, 'enclosed', s.i); });
      var fx = Math.round(sx / got), fy = Math.round(sy / got);
      if(M.own[fy * n + fx] !== id){ var c0 = cells[Math.floor(cells.length / 2)]; fx = c0 % n; fy = (c0 / n) | 0; }
      if(got >= 4){ M.flags.push({ x: fx, y: fy, by: s.i, t: M.t }); if(M.flags.length > 24) M.flags.shift(); }
      s.flags++; s.score += got * 5 * (M.lv + 1);
      SN.push(M, { k: 'claim', s: s.i, cells: got, x: fx, y: fy });
    }
    M.snakes.forEach(function(o){ o.land = landPct(M, o.i); });
    if(M.win && !M.over){ M.snakes.forEach(function(o){ if(!M.over && o.land >= M.win) SN.finish(M, o.i, 'land'); }); }
    return got;
  }
  function turnC(M, i, d){ return SN.turn(M, i, d); }
  function stepCastle(M, dt){
    if(M.over) return;
    M.t += dt; if(M.slowT > 0) M.slowT = Math.max(0, M.slowT - dt); if(M.freezeT > 0) M.freezeT = Math.max(0, M.freezeT - dt);
    SN.tickGifts(M, dt);
    // 🔥 fire hazards burn trails (Extreme +)
    if(!(M.freezeT > 0)) M.fires.forEach(function(f){ f.acc += dt; if(f.acc < f.every) return; f.acc = 0;
      var nx = f.x + f.dx, ny = f.y + f.dy; if(nx < 1 || nx > M.n - 2) { f.dx = -f.dx; nx = f.x + f.dx; } if(ny < 1 || ny > M.n - 2){ f.dy = -f.dy; ny = f.y + f.dy; }
      f.x = nx; f.y = ny; var c = ny * M.n + nx, tr = M.trail[c]; if(tr){ var o = M.snakes[tr - 1]; SN.push(M, { k: 'burnTrail', s: o.i, x: nx, y: ny }); sendHome(M, o, 'fire', -1); } });
    M.snakes.forEach(function(s){
      if(!s.alive) return;
      SN.tickCommon(M, s, dt);
      if(s.down > 0){ s.down -= dt; return; }
      if(s.frozenT > 0) return;
      s.acc += dt * (M.slowT > 0 && M.slowBy !== s.i ? 0.5 : 1);
      var iv = s.tick / (s.dashT > 0 ? 2 : 1), guard = 0;
      while(s.acc >= iv && guard++ < 3 && s.alive && !M.over && !(s.down > 0)){ s.acc -= iv; if(!s.human) castleBot(M, s); moveC(M, s); }
    });
    // the map is full and nobody reached the land % → the biggest land wins
    if(M.win && !M.over && Math.floor(M.t) !== Math.floor(M.t - dt)){ var free = 0; for(var k = 0; k < M.own.length; k++) if(!M.own[k]) free++; if(free / M.own.length < 0.03){ var rr = M.snakes.slice().sort(function(a, b){ return b.land - a.land; }); SN.finish(M, rr[0].i, 'full'); } }
    if(M.time && M.t >= M.time && !M.over){ var r = M.snakes.slice().sort(function(a, b){ return b.land - a.land; }); SN.finish(M, r[0].i, 'time'); }
  }
  function moveC(M, s){
    if(s.q.length) s.dir = s.q.shift();
    var h = s.body[0], nx = h[0] + DIRS[s.dir][0], ny = h[1] + DIRS[s.dir][1], n = M.n;
    if(!inb(M, nx, ny)){
      if(M.lv >= 4 && s.trailCells && s.trailCells.length){ SN.push(M, { k: 'bump', s: s.i, why: 'wall', x: h[0], y: h[1] }); sendHome(M, s, 'wall', -1); return; }
      var opts = DK.filter(function(d){ var x = h[0] + DIRS[d][0], y = h[1] + DIRS[d][1]; return d !== OPP[s.dir] && inb(M, x, y) && M.trail[y * n + x] !== s.i + 1; });
      s.dir = opts.length ? opts[Math.floor(M.rnd() * opts.length)] : OPP[s.dir]; s.q = []; SN.push(M, { k: 'edge', s: s.i }); return;
    }
    var c = ny * n + nx, id = s.i + 1;
    // trails: your own trail sends you home, someone else's trail sends THEM home
    var tr = M.trail[c];
    if(tr && !(s.ghostT > 0)){
      if(tr === id){ SN.push(M, { k: 'bump', s: s.i, why: 'self', x: nx, y: ny }); sendHome(M, s, 'self', s.i); return; }
      var victim = M.snakes[tr - 1], canCut = s.human || M.L.botsCut || !victim.human;
      if(victim && victim.alive && canCut && !(M.lv < 2 && victim.human && !s.human && false)) sendHome(M, victim, 'cut', s.i);
    }
    s.prev = s.body.map(function(b){ return b.slice(); });
    s.body.unshift([nx, ny]); var vis = Math.min(10, Math.max(3, Math.round(s.len / 2))); while(s.body.length > vis) s.body.pop();
    // food
    for(var fi = M.foods.length - 1; fi >= 0; fi--){ var f = M.foods[fi]; if(f.x === nx && f.y === ny){ M.foods.splice(fi, 1); eatC(M, s, f); spawnFood(M); } }
    if(s.magT > 0) M.foods.forEach(function(f){ if(Math.abs(f.x - nx) + Math.abs(f.y - ny) <= 4){ f.x += Math.sign(nx - f.x); f.y += Math.sign(ny - f.y); } });
    // land / trail
    if(M.own[c] === id){ if(s.trailCells && s.trailCells.length) claim(M, s); }
    else {
      if(!s.trailCells) s.trailCells = [];
      if(M.trail[c] !== id){ M.trail[c] = id; s.trailCells.push(c); }
      if(s.trailCells.length > maxTrail(M, s)){ SN.push(M, { k: 'tooLong', s: s.i }); sendHome(M, s, 'long', -1); return; }
    }
    if(s.quest && s.quest.kind === 'visit' && s.quest.x === nx && s.quest.y === ny) s.quest.have = s.quest.need;
  }
  function eatC(M, s, f){
    var pts = 10 * (M.lv + 1) * (s.starT > 0 ? 2 : 1);
    if(SN.POWERS[f.k]){ SN.applyPower(M, s, f.k); s.powers++; SN.push(M, { k: 'power', s: s.i, p: f.k, x: f.x, y: f.y }); return; }
    var g = f.k === 'g' ? 3 : 1; s.len += g; s.eaten++; s.score += pts * g; if(f.k === 'g'){ s.gold++; SN.push(M, { k: 'gold', s: s.i, x: f.x, y: f.y }); } else SN.push(M, { k: 'eat', s: s.i, x: f.x, y: f.y });
    if(s.quest && s.quest.kind === 'eatc' && (f.c === s.quest.c || s.rainT > 0)) s.quest.have++;
    if(s.len > s.maxLen) s.maxLen = s.len;
  }
  // 🤖 bot: out from its land, a rectangle loop, back home. Chases a human trail sometimes (cut levels).
  function castleBot(M, s){
    if(s.puppet) return;   // tests steer the snake by hand
    var n = M.n, h = s.body[0], id = s.i + 1, onLand = M.own[h[1] * n + h[0]] === id;
    if(M.L.botsCut && M.rnd() < M.L.chase * 0.25){
      var tgt = null, bd = 9; M.snakes.forEach(function(o){ if(o === s || !o.trailCells || !o.trailCells.length) return; if(!o.human && M.rnd() < 0.7) return; o.trailCells.forEach(function(c){ var x = c % n, y = (c / n) | 0, d = Math.abs(x - h[0]) + Math.abs(y - h[1]); if(d < bd){ bd = d; tgt = [x, y]; } }); });
      if(tgt){ s.plan = [{ x: tgt[0], y: tgt[1] }]; }
    }
    if(onLand && s.planDone && s.human === false){ s.rest = (s.rest || 0) + s.tick; if(s.rest < M.L.rest){ var ins = DK.filter(function(d){ var x = h[0] + DIRS[d][0], y = h[1] + DIRS[d][1]; return d !== OPP[s.dir] && inb(M, x, y) && M.own[y * n + x] === id; }); if(ins.length){ var dd = ins.indexOf(s.dir) >= 0 && M.rnd() < 0.6 ? s.dir : ins[Math.floor(M.rnd() * ins.length)]; if(dd !== s.dir) s.q = [dd]; return; } } s.rest = 0; }
    if(onLand && (!s.plan || !s.plan.length || s.planDone)){ s.plan = makeLoop(M, s); s.planDone = false; }
    if(!onLand && (!s.plan || !s.plan.length)) s.plan = [{ home: true }];
    var step = s.plan && s.plan[0], want = null;
    if(step){
      if(step.home){ want = towardHome(M, s); if(onLand){ s.plan.shift(); s.planDone = true; } }
      else { if(h[0] === step.x && h[1] === step.y){ s.plan.shift(); return castleBot(M, s); } want = Math.abs(step.x - h[0]) >= Math.abs(step.y - h[1]) ? (step.x > h[0] ? 'r' : 'l') : (step.y > h[1] ? 'd' : 'u'); }
    }
    // safety: never into its own trail or off the map; long trail → go home now
    if(s.trailCells && s.trailCells.length > maxTrail(M, s) - 4) want = towardHome(M, s);
    var ok = function(d){ var x = h[0] + DIRS[d][0], y = h[1] + DIRS[d][1]; return d !== OPP[s.dir] && inb(M, x, y) && M.trail[y * n + x] !== id && !M.fires.some(function(f){ return f.x === x && f.y === y; }); };
    if(!want || !ok(want)){ var alt = DK.filter(ok); if(alt.length){ var th = towardHome(M, s); want = alt.indexOf(th) >= 0 && !onLand ? th : alt[Math.floor(M.rnd() * alt.length)]; } }
    if(want && want !== s.dir && want !== OPP[s.dir]){ s.q = [want]; }
  }
  function towardHome(M, s){
    var n = M.n, h = s.body[0], id = s.i + 1, best = null, bd = 1e9;
    for(var k = 0; k < M.own.length; k++) if(M.own[k] === id){ var x = k % n, y = (k / n) | 0, d = Math.abs(x - h[0]) + Math.abs(y - h[1]); if(d < bd){ bd = d; best = [x, y]; } }
    if(!best) best = s.home;
    var opts = [];
    if(best[0] > h[0]) opts.push('r'); if(best[0] < h[0]) opts.push('l'); if(best[1] > h[1]) opts.push('d'); if(best[1] < h[1]) opts.push('u');
    var free = opts.filter(function(d){ var x = h[0] + DIRS[d][0], y = h[1] + DIRS[d][1]; return d !== OPP[s.dir] && M.trail[y * n + x] !== id; });
    return free[0] || opts[0] || s.dir;
  }
  function makeLoop(M, s){
    var n = M.n, h = s.body[0], mt = maxTrail(M, s), a = 1 + Math.floor(M.rnd() * Math.max(1, Math.min(6, mt / 4))), b = 1 + Math.floor(M.rnd() * Math.max(1, Math.min(5, mt / 3)));
    var dirs = DK.filter(function(d){ var x = h[0] + DIRS[d][0] * (a + 1), y = h[1] + DIRS[d][1] * (a + 1); return inb(M, x, y) && M.own[y * n + x] !== s.i + 1; });
    var d1 = dirs.length ? dirs[Math.floor(M.rnd() * dirs.length)] : DK[Math.floor(M.rnd() * 4)];
    var side = (M.rnd() < 0.5 ? 1 : -1), perp = DIRS[d1][0] ? [0, side] : [side, 0];
    var p1 = { x: clampI(h[0] + DIRS[d1][0] * a, n), y: clampI(h[1] + DIRS[d1][1] * a, n) };
    var p2 = { x: clampI(p1.x + perp[0] * b, n), y: clampI(p1.y + perp[1] * b, n) };
    return [p1, p2, { home: true }];
  }
  function clampI(v, n){ return Math.max(0, Math.min(n - 1, v)); }
  function castleStars(M, i){ var s = M.snakes[i]; if(M.winner !== i) return 0; if(!M.win) return s.land >= (M.L.bonus || 60) ? 3 : s.hurt === 0 ? 2 : 1; var st = 1; if(s.hurt === 0) st = 2; if(s.hurt === 0 && M.t < 60 + M.lv * 30) st = 3; return st; }
  function castleScore(M, i){ var s = M.snakes[i]; return Math.round(s.score + s.land * 20 * (M.lv + 1) + s.cuts * 50 + (M.winner === i ? 400 * (M.lv + 1) : 0)) * (M.lv === 5 ? 3 : 1); }
  function autoCastle(M, i){
    // the careful player = the bot brain with short loops, no chasing
    var s = M.snakes[i]; if(!s || !s.alive || s.q.length || s.down > 0) return;
    var keep = M.L; M.L = Object.assign({}, keep, { botsCut: false }); var len = s.len; s.len = Math.min(len, 6); castleBot(M, s); s.len = len; M.L = keep;
  }
  SN.CASTLE = CASTLE; SN.newCastle = newCastle; SN.stepCastle = stepCastle; SN.claim = claim; SN.castleStars = castleStars; SN.castleScore = castleScore; SN.autoCastle = autoCastle; SN.landPct = landPct; SN.sendHome = sendHome; SN.maxTrail = maxTrail; SN.trailLen = trailLen; SN.castleBot = castleBot;
})(SN);
// ENGINE END

