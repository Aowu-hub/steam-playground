
// ENGINE START
// 👻💣 Soul Bopper engine — pure JS, no DOM (the harness loads it in node). Grid units: cell centres at whole numbers.
var BOP = (function () {
  var DT = 1 / 60;
  var LEVELS = [
    {name: 'Basic', startle: 0.35, panic: 0.6, notice: 1.15, look: 3, w: 9, h: 9, soft: 0.38, bots: 1, kinds: ['sleepy'], fuse: 3, glow: true, lives: 3, sudden: 150, pu: 0.25, botSpeed: 0.62, power: ['bomb', 'fire', 'speed']},
    {name: 'Junior', startle: 0.25, panic: 0.45, notice: 1.35, look: 4, w: 11, h: 9, soft: 0.46, bots: 2, kinds: ['sleepy', 'smart'], fuse: 3, glow: true, lives: 2, sudden: 135, pu: 0.25, botSpeed: 0.72, power: ['bomb', 'fire', 'speed']},
    {name: 'Intermediate', startle: 0.15, panic: 0.3, notice: 1.6, look: 5, w: 11, h: 11, soft: 0.55, bots: 3, kinds: ['smart', 'sleepy', 'hunter'], fuse: 2.5, glow: true, lives: 2, sudden: 120, pu: 0.25, botSpeed: 0.85, power: ['bomb', 'fire', 'speed', 'kick', 'toss']},
    {name: 'Hard', startle: 0, panic: 0.1, notice: 2.0, look: 7, w: 13, h: 11, soft: 0.62, bots: 3, kinds: ['hunter', 'smart', 'hunter'], fuse: 2.5, glow: true, lives: 1, sudden: 110, pu: 0.35, botSpeed: 0.95, power: 'all'},
    {name: 'Extreme', startle: 0, panic: 0, notice: 2.4, look: 10, w: 15, h: 13, soft: 0.66, bots: 4, kinds: ['hunter', 'trapper', 'smart', 'hunter'], fuse: 2, glow: true, lives: 1, sudden: 100, pu: 0.35, botSpeed: 1.05, power: 'all'},
    {name: 'Hardcore', startle: 0, panic: 0, notice: 99, look: 14, w: 17, h: 13, soft: 0.72, bots: 5, kinds: ['trapper', 'hunter', 'smart', 'trapper', 'hunter'], fuse: 2, glow: false, lives: 1, sudden: 90, pu: 0.35, botSpeed: 1.1, power: 'all'}
  ];
  var POWERS = ['bomb', 'fire', 'speed', 'kick', 'toss', 'shield', 'remote', 'dash', 'error'];
  var CAP = {bomb: 8, fire: 8, speed: 5};
  var HOLD_TARGET = [60, 60, 90, 90, 120, 120];
  var STAGE_FOES = [['sleepy', 'sleepy'], ['sleepy', 'smart'], ['smart', 'hunter', 'sleepy'], ['hunter', 'smart', 'sleepy'], ['hunter', 'trapper', 'smart']];
  var BOSSES = {dino: ['🦖', 'T-Rex'], sea: ['🐙', 'Kraken'], dance: ['🪩', 'DJ Bot'], robot: ['🤖', 'Mega-bot'], space: ['🌌', 'Black-hole beast'], sky: ['🌩️', 'Storm titan'], zombie: ['🧟', 'Zombie king']};
  var DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  function mkRng(seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function sgn(v) { return v > 0 ? 1 : v < 0 ? -1 : 0; }
  function idx(M, x, y) { return y * M.W + x; }
  function inb(M, x, y) { return x >= 0 && y >= 0 && x < M.W && y < M.H; }
  function cellX(p) { return Math.round(p.x); }
  function cellY(p) { return Math.round(p.y); }
  function bombAt(M, x, y) { for (var i = 0; i < M.bombs.length; i++) { var b = M.bombs[i]; if (!b.carry && !b.fly && Math.round(b.x) === x && Math.round(b.y) === y) return b; } return null; }
  function itemAt(M, x, y) { for (var i = 0; i < M.items.length; i++) { var it = M.items[i]; if (it.x === x && it.y === y) return it; } return null; }
  function solid(M, x, y) { if (!inb(M, x, y)) return true; var g = M.grid[idx(M, x, y)]; return g !== 0; }
  function passable(M, x, y, p) {
    if (solid(M, x, y)) return false;
    var b = bombAt(M, x, y); if (b && !(p && b.pass[p.i])) return false;
    if (M.boss && M.boss.alive && p && Math.round(M.boss.x) === x && Math.round(M.boss.y) === y) return true;
    return true;
  }
  function ev(M, k, o) { o = o || {}; o.k = k; o.t = M.t; M.ev.push(o); return o; }
  function speedOf(M, p) { var s = 2.7 + 0.42 * p.spd; if (!p.human) s *= p.botSpeed || M.L.botSpeed; if (p.slow > 0) s *= 0.5; return s; }
  function alivePlayers(M) { return M.P.filter(function (p) { return p.alive && !p.ghost && !p.edge && !p.gone; }); }

  /* ---------- map ---------- */
  function spawnPts(W, H) {
    var mx = Math.floor((W - 1) / 2), my = Math.floor((H - 1) / 2);
    if (mx % 2 === 0) mx -= 1; if (my % 2 === 0) my -= 1;
    return [[1, 1], [W - 2, H - 2], [W - 2, 1], [1, H - 2], [mx, 1], [mx, H - 2], [1, my], [W - 2, my]];
  }
  function buildMap(M, opt) {
    var W = M.W, H = M.H, L = M.L, rnd = M.rng, x, y;
    M.grid = new Uint8Array(W * H); M.hidden = {}; M.exit = -1;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1 || (x % 2 === 0 && y % 2 === 0)) M.grid[idx(M, x, y)] = 1;
    }
    var keep = {};
    M.spawns.forEach(function (s) { keep[idx(M, s[0], s[1])] = 1; DIRS.forEach(function (d) { var nx = s[0] + d[0], ny = s[1] + d[1]; if (!solid(M, nx, ny)) keep[idx(M, nx, ny)] = 1; }); });
    if (opt.zone) for (y = opt.zone.y; y < opt.zone.y + opt.zone.h; y++) for (x = opt.zone.x; x < opt.zone.x + opt.zone.w; x++) keep[idx(M, x, y)] = 1;
    var dens = opt.soft != null ? opt.soft : L.soft, softs = [];
    for (y = 1; y < H - 1; y++) for (x = 1; x < W - 1; x++) {
      var i = idx(M, x, y); if (M.grid[i] || keep[i]) continue;
      if (rnd() < dens) { M.grid[i] = 2; softs.push(i); }
    }
    M.soft = softs.length;
    // hidden power-ups: ~25 % small maps (mostly 💣 🔥 👟), ~35 % big maps (all kinds, 😵 from Hard)
    var big = W * H > 121, pool = L.power === 'all' ? POWERS.filter(function (k) { return k !== 'error' || M.level >= 3; }) : L.power;
    var weights = pool.map(function (k) { return k === 'bomb' || k === 'fire' ? 4 : k === 'speed' ? 3 : k === 'error' ? 1 : big ? 1.4 : 1; });
    var tw = weights.reduce(function (a, b) { return a + b; }, 0), rate = opt.pu != null ? opt.pu : L.pu;
    softs.forEach(function (i) { if (rnd() < rate) { var r = rnd() * tw, k = pool[0]; for (var j = 0; j < pool.length; j++) { r -= weights[j]; if (r <= 0) { k = pool[j]; break; } } M.hidden[i] = k; } });
    if (opt.exit && softs.length) {   // 🗺️ Stage: the 🚪 exit sits under a block far from the start
      var far = softs.slice().sort(function (a, b) { var ax = a % W, ay = Math.floor(a / W), bx = b % W, by = Math.floor(b / W); return (bx + by) - (ax + ay); });
      M.exit = far[Math.floor(rnd() * Math.min(6, far.length))]; delete M.hidden[M.exit];
    }
    M.gridVer = (M.gridVer || 0) + 1;
  }

  /* ---------- match + rounds ---------- */
  function newMatch(o) {
    o = o || {};
    var level = Math.max(0, Math.min(5, o.level | 0)), L = LEVELS[level];
    if (o.size && o.size[0] >= 9 && o.size[1] >= 9) L = Object.assign({}, L, {w: o.size[0] | 1, h: o.size[1] | 1});   // 🗺️ p3c: a maze size picked apart from the difficulty
    var M = {level: level, L: L, mode: o.mode || 'battle', theme: o.theme || 'dino', seed: (o.seed >>> 0) || 7, specs: (o.players || []).slice(), teams: !!o.teams,
      stage: o.stage || null, ev: [], round: 0, wins: [], done: false, winner: -1, popId: 1, t: 0, gridVer: 0, ghosts: o.ghosts != null ? o.ghosts : level > 0, totalT: 0};
    M.rng = mkRng(M.seed);
    M.need = M.mode === 'battle' ? (level >= 3 ? 3 : 2) : 1;
    if (o.need) M.need = o.need;
    M.stats = M.specs.map(function () { return mkStats(); });
    M.specs.forEach(function (s, i) { M.wins[i] = 0; });
    newRound(M);
    return M;
  }
  function mkStats() { return {blocks: 0, catches: 0, bots: 0, chains: 0, kicks: 0, tosses: 0, comebacks: 0, swaps: 0, multi: 0, triple: 0, pickups: 0, self: 0, hold: 0, rounds: 0, throws: 0, bossHits: 0, hits: 0, carries: 0, homeruns: 0, selfbops: 0}; }
  function newRound(M) {
    var L = M.L, st = M.stage;
    M.round++; M.t = 0; M.state = 'ready'; M.readyT = 2.6; M.endT = 0; M.roundWinner = -1;
    M.W = L.w; M.H = L.h;
    if (st && st.boss) { M.W = Math.max(11, L.w); M.H = Math.max(11, L.h); }
    M.spawns = spawnPts(M.W, M.H);
    M.bombs = []; M.items = []; M.fl = {}; M.warn = []; M.sd = null; M.boss = null; M.zone = null; M.addBotT = 0; M.lastOutT = 0; M.puT = 0; M.horde = null; M.exitOpen = false; M.pops = {};
    var opt = {};
    if (M.mode === 'hold') { var zw = 3, zx = Math.floor((M.W - zw) / 2), zy = Math.floor((M.H - zw) / 2); M.zone = {x: zx, y: zy, w: zw, h: zw, moveT: 0}; opt.zone = M.zone; M.hold = {}; }
    if (M.mode === 'stage') { opt.exit = !st.boss; opt.soft = st.boss ? 0.18 : Math.min(0.7, L.soft - 0.08 + st.n * 0.03); opt.pu = st.boss ? 0.5 : L.pu; }
    buildMap(M, opt);
    // players: specs = humans + bots (+ stage foes)
    var specs = M.specs.slice();
    if (M.mode === 'stage') {
      specs = specs.filter(function (s) { return s.human; });
      if (!st.boss) (STAGE_FOES[Math.min(4, st.n)] || []).forEach(function (k, j) { specs.push({name: (st.foeNames && st.foeNames[j]) || ('Bot ' + (j + 1)), kind: k, human: false, foe: true}); });
    }
    M.P = specs.map(function (s, i) { var sp = M.spawns[i % M.spawns.length]; return mkP(M, s, i, sp); });
    while (M.stats.length < M.P.length) M.stats.push(mkStats());
    while (M.wins.length < M.P.length) M.wins.push(0);
    if (M.mode === 'hold' && M.teams) M.P.forEach(function (p) { var sp = M.spawns[[0, 3, 2, 1][p.i % 4]]; if (p.i < 4) { p.x = p.sx = sp[0]; p.y = p.sy = sp[1]; } });
    if (M.mode === 'stage' && st.boss) {
      var bx = M.W - 3, by = Math.floor(M.H / 2); if (by % 2 === 0) by -= 1;
      for (var yy = by - 1; yy <= by + 1; yy++) for (var xx = bx - 1; xx <= bx + 1; xx++) if (M.grid[idx(M, xx, yy)] === 2) M.grid[idx(M, xx, yy)] = 0;
      M.boss = {x: bx, y: by, hp: 3, inv: 0, alive: true, atkT: 3, path: [], kind: M.theme, icon: (BOSSES[M.theme] || BOSSES.dino)[0], name: (BOSSES[M.theme] || BOSSES.dino)[1], face: -1, hitT: 0};
    }
    ev(M, 'round', {n: M.round});
  }
  function mkP(M, s, i, sp) {
    var human = !!s.human;
    return {i: i, name: s.name || ('P' + (i + 1)), human: human, kind: s.kind || (human ? '' : 'smart'), team: M.teams ? (s.team != null ? s.team : i % 2) : i, foe: !!s.foe, auto: !!s.auto,
      x: sp[0], y: sp[1], sx: sp[0], sy: sp[1], dx: 0, dy: 1, face: 1, alive: true, ghost: false, edge: false, gone: false,
      lives: human ? (M.mode === 'hold' ? 99 : M.L.lives) : 1, base: {bomb: 1, fire: 2}, bombsMax: 1, fire: 2, spd: 0, kick: false, toss: false, shield: false, remote: false, dash: false,
      err: 0, inv: 0, lock: 0, lockBy: -1, lockCd: 0, stun: 0, slow: 0, pick: [], ctrl: {u: false, d: false, l: false, r: false}, lastAxis: 'v', buf: {}, walkT: 0, moving: false,
      act: null, dashCd: 0, lastSkill: -9, respawnT: 0, caughtT: 0, ai: {path: [], think: 0, mode: '', stillT: 0, lastCell: -1, plantAt: -1, wait: 0}, botSpeed: s.botSpeed || 0, edgePos: 0, joinT: 0};
  }

  /* ---------- input ---------- */
  function setCtrl(M, i, u, d, l, r) {
    var p = M.P[i]; if (!p) return; var c = p.ctrl;
    if ((u && !c.u) || (d && !c.d)) p.lastAxis = 'v';
    if ((l && !c.l) || (r && !c.r)) p.lastAxis = 'h';
    c.u = !!u; c.d = !!d; c.l = !!l; c.r = !!r;
  }
  function setHold(M, i, on) { var p = M.P[i]; if (p) p.hold = !!on; }   // sb-9: 💣 held down (carry needs 🤾🏏)
  function press(M, i, a, dx, dy) { var p = M.P[i]; if (!p) return; p.buf[a] = a === 'dash' ? {dx: dx, dy: dy} : true; }

  /* ---------- movement (grid with turn-assist) ---------- */
  function free(M, x, y, p) {
    if (!inb(M, x, y) || x <= 0 || y <= 0 || x >= M.W - 1 || y >= M.H - 1) return false;
    return passable(M, x, y, p);
  }
  function moveAxis(M, p, dx, dy, dist) {
    var cx = Math.round(p.x), cy = Math.round(p.y), moved = false, s;
    if (dx) {
      var off = p.y - cy;
      if (Math.abs(off) > 0.001) {
        if (free(M, cx + dx, cy, p) || (p.x - cx) * dx < -0.02) { s = Math.min(dist, Math.abs(off)); p.y -= sgn(off) * s; dist -= s; moved = s > 0; if (dist <= 0) return moved; }
        else { var cy2 = cy + sgn(off); if (Math.abs(off) > 0.4 && free(M, cx + dx, cy2, p) && free(M, cx, cy2, p)) { s = Math.min(dist, 1 - Math.abs(off)); p.y += sgn(off) * s; return s > 0; } s = Math.min(dist, Math.abs(off)); p.y -= sgn(off) * s; return s > 0; }   // sb-9a: a wall ahead → line up straight (no slide into a side path unless you're clearly nearer it)
      }
      var nx = p.x + dx * dist;
      if (!free(M, cx + dx, cy, p) && (nx - cx) * dx > 0) nx = (p.x - cx) * dx > 0 ? p.x : cx;
      if (nx !== p.x) moved = true; p.x = nx;
    } else if (dy) {
      var offx = p.x - cx;
      if (Math.abs(offx) > 0.001) {
        if (free(M, cx, cy + dy, p) || (p.y - cy) * dy < -0.02) { s = Math.min(dist, Math.abs(offx)); p.x -= sgn(offx) * s; dist -= s; moved = s > 0; if (dist <= 0) return moved; }
        else { var cx2 = cx + sgn(offx); if (Math.abs(offx) > 0.4 && free(M, cx2, cy + dy, p) && free(M, cx2, cy, p)) { s = Math.min(dist, 1 - Math.abs(offx)); p.x += sgn(offx) * s; return s > 0; } s = Math.min(dist, Math.abs(offx)); p.x -= sgn(offx) * s; return s > 0; }
      }
      var ny = p.y + dy * dist;
      if (!free(M, cx, cy + dy, p) && (ny - cy) * dy > 0) ny = (p.y - cy) * dy > 0 ? p.y : cy;
      if (ny !== p.y) moved = true; p.y = ny;
    }
    return moved;
  }
  function wantDir(p) {
    var c = p.ctrl, h = (c.r ? 1 : 0) - (c.l ? 1 : 0), v = (c.d ? 1 : 0) - (c.u ? 1 : 0);
    if (p.err > 0) { h = -h; v = -v; }
    if (h && v) return p.lastAxis === 'h' ? [h, 0] : [0, v];
    if (h) return [h, 0]; if (v) return [0, v]; return null;
  }

  /* ---------- bombs ---------- */
  function ownBombs(M, p) { var n = 0; M.bombs.forEach(function (b) { if (b.owner === p.i && !b.edgeBy) n++; }); return n; }
  function overlapPass(M, x, y) { var pass = {}; M.P.forEach(function (q) { if (Math.abs(q.x - x) < 0.95 && Math.abs(q.y - y) < 0.95) pass[q.i] = true; }); return pass; }
  function plant(M, p) {
    if (!p.alive || p.ghost || p.lock > 0 || p.stun > 0) return false;
    if (p.edge) return edgeThrow(M, p);
    var x = cellX(p), y = cellY(p);
    if (solid(M, x, y) || bombAt(M, x, y) || ownBombs(M, p) >= p.bombsMax) return false;
    var b = {id: M.popId++, owner: p.i, x: x, y: y, r: p.fire, t: M.L.fuse, max: M.L.fuse, pass: overlapPass(M, x, y), slide: null, fly: null, carry: false, poo: M.mode === 'classic', born: M.t, skin: p.skin || ''};
    M.bombs.push(b); p.act = {k: 'plant', t: 0}; ev(M, 'plant', {i: p.i, x: x, y: y, id: b.id, poo: b.poo}); return true;
  }
  function facingCell(p) { return [cellX(p) + p.dx, cellY(p) + p.dy]; }
  function skill(M, p) {
    if (p.ghost) return trapLock(M, p);
    if (!p.alive || p.edge || p.lock > 0 || p.stun > 0) return false;
    var x = cellX(p), y = cellY(p), f = facingCell(p), done = false;
    if (p.toss) {   // sb-9 🤾🏏: carrying → hit · on your bomb → toss 2 · a bomb in front (anyone's) → 🏏 hit 4
      var cb = carriedBy(M, p);
      if (cb) { cb.carry = false; cb.x = x; cb.y = y; hitBomb(M, p, cb); done = true; }
      else { var b = bombAt(M, x, y); if (b && b.owner === p.i && !b.slide) { tossBomb(M, p, b); done = true; }
        else { var b2 = bombAt(M, f[0], f[1]); if (b2 && !b2.slide && !b2.fly) { hitBomb(M, p, b2); done = true; } } }
    }
    if (!done && p.kick) { var kb = bombAt(M, f[0], f[1]); if (kb && !kb.slide && !kb.fly) { kb.slide = {dx: p.dx, dy: p.dy, prog: 0}; kb.pass = {}; p.act = {k: 'kick', t: 0}; M.stats[p.i].kicks++; ev(M, 'kick', {i: p.i, id: kb.id}); done = true; } }
    if (!done && p.remote && M.t - p.lastSkill < 0.42 && p.lastSkillNone) { var n = 0; M.bombs.forEach(function (bb) { if (bb.owner === p.i && !bb.fly && !bb.carry && !bb.edgeBy) { bb.t = 0; n++; } }); if (n) { ev(M, 'remote', {i: p.i, n: n}); done = true; } }
    p.lastSkillNone = !done; p.lastSkill = M.t; return done;
  }
  function tossBomb(M, p, b) {
    var dx = p.dx || 0, dy = p.dy || 0; if (!dx && !dy) dy = 1;
    b.pass = {}; b.slide = null; p.act = {k: 'toss', t: 0}; M.stats[p.i].tosses++;
    startFly(M, b, Math.round(b.x), Math.round(b.y), dx, dy, 2, p.i);
    ev(M, 'toss', {i: p.i, id: b.id});
  }
  function hitBomb(M, p, b) {
    var dx = p.dx || 0, dy = p.dy || 0; if (!dx && !dy) dy = 1;
    b.pass = {}; b.slide = null; b.hitBy = p.i; p.act = {k: 'hit', t: 0}; M.stats[p.i].hits++;
    startFly(M, b, Math.round(b.x), Math.round(b.y), dx, dy, 4, p.i); b.fly.dur = 0.5; b.fly.hit = true;   // flies over walls like a toss, a bit higher
    ev(M, 'hit', {i: p.i, id: b.id, from: b.owner});
  }
  function carriedBy(M, p) { for (var i = 0; i < M.bombs.length; i++) if (M.bombs[i].carry && M.bombs[i].carrier === p.i) return M.bombs[i]; return null; }
  function stepCarry(M, p, dt) {   // sb-9: hold 💣 on your bomb (with 🤾🏏) → lift it; let go → toss 2 the way you face
    var cb = carriedBy(M, p);
    if (cb) { if (!p.hold || p.stun > 0) { cb.carry = false; cb.x = cellX(p); cb.y = cellY(p); tossBomb(M, p, cb); } else { cb.x = p.x; cb.y = p.y; } p.holdT = 0; return; }
    if (!p.toss || !p.hold || p.lock > 0 || p.stun > 0) { p.holdT = 0; return; }
    p.holdT = (p.holdT || 0) + dt; if (p.holdT < 0.22) return;
    var b = bombAt(M, cellX(p), cellY(p)); if (!b || b.owner !== p.i || b.slide || b.fly || b.t < 0.15) return;
    b.carry = true; b.carrier = p.i; b.pass = {}; p.act = {k: 'carry', t: 0}; M.stats[p.i].carries++; p.holdT = 0; ev(M, 'carry', {i: p.i, id: b.id});
  }
  function wrap(M, v, n) { var lo = 1, hi = n - 2; if (v < lo) return hi - (lo - v - 1); if (v > hi) return lo + (v - hi - 1); return v; }
  function startFly(M, b, fx, fy, dx, dy, n, by) {
    var tx = wrap(M, fx + dx * n, M.W), ty = wrap(M, fy + dy * n, M.H);
    b.fly = {fx: fx, fy: fy, tx: tx, ty: ty, dx: dx, dy: dy, t: 0, dur: n > 1 ? 0.42 : 0.2, by: by, wrapped: Math.abs(tx - fx) > n || Math.abs(ty - fy) > n};
  }
  function landFly(M, b) {
    var f = b.fly, x = f.tx, y = f.ty, bounce = solid(M, x, y) || !!bombAt(M, x, y) || (M.boss && M.boss.alive && Math.round(M.boss.x) === x && Math.round(M.boss.y) === y);
    M.P.forEach(function (q) { if (q.alive && !q.ghost && !q.edge && cellX(q) === x && cellY(q) === y) { bounce = true; if (q.shield) { q.shield = false; dropPick(q, 'shield'); ev(M, 'shieldoff', {i: q.i}); } q.stun = Math.max(q.stun, 0.6); ev(M, 'bonk', {i: q.i}); } });
    b.bounces = (b.bounces || 0) + 1;
    if (bounce && b.bounces < 40) { startFly(M, b, x, y, f.dx, f.dy, 1, f.by); ev(M, 'bounce', {id: b.id, x: x, y: y}); return; }
    b.x = x; b.y = y; b.fly = null; b.pass = overlapPass(M, x, y); b.bounces = 0; ev(M, 'land', {id: b.id, x: x, y: y});
  }
  function stepBomb(M, b, dt) {
    if (b.carry) { var cq = M.P[b.carrier]; if (!cq || !cq.alive || cq.ghost || cq.edge) { b.carry = false; if (cq) { b.x = cellX(cq); b.y = cellY(cq); } b.pass = overlapPass(M, Math.round(b.x), Math.round(b.y)); } else { b.x = cq.x; b.y = cq.y; } b.t -= dt; return; }
    if (b.fly) { var f = b.fly; f.t += dt; var q = Math.min(1, f.t / f.dur); b.x = f.fx + (f.wrapped ? f.dx * q : (f.tx - f.fx) * q); b.y = f.fy + (f.wrapped ? f.dy * q : (f.ty - f.fy) * q); if (q >= 1) landFly(M, b); return; }
    if (b.slide) {
      var s = b.slide, cx = Math.round(b.x - s.dx * s.prog), cy = Math.round(b.y - s.dy * s.prog);
      if (s.prog === 0) { cx = Math.round(b.x); cy = Math.round(b.y); if (!slideFree(M, cx + s.dx, cy + s.dy, b)) { b.slide = null; b.x = cx; b.y = cy; return; } }
      s.prog += 7 * dt;
      if (s.prog >= 1) { cx += s.dx; cy += s.dy; s.prog = 0; b.x = cx; b.y = cy; if (!slideFree(M, cx + s.dx, cy + s.dy, b)) { b.slide = null; ev(M, 'stop', {id: b.id}); } }
      else { b.x = cx + s.dx * s.prog; b.y = cy + s.dy * s.prog; }
    }
    // the planter walks off its bomb: once nobody overlaps, it blocks
    for (var k in b.pass) { var q2 = M.P[k]; if (!q2 || Math.abs(q2.x - b.x) >= 0.95 || Math.abs(q2.y - b.y) >= 0.95) delete b.pass[k]; }
    b.t -= dt;
  }
  function slideFree(M, x, y, b) {
    if (solid(M, x, y)) return false;
    for (var i = 0; i < M.bombs.length; i++) { var o = M.bombs[i]; if (o !== b && !o.fly && !o.carry && Math.round(o.x) === x && Math.round(o.y) === y) return false; }
    if (itemAt(M, x, y)) return false;
    for (var j = 0; j < M.P.length; j++) { var q = M.P[j]; if (q.alive && !q.ghost && !q.edge && Math.abs(q.x - x) < 0.7 && Math.abs(q.y - y) < 0.7) return false; }
    if (M.boss && M.boss.alive && Math.abs(M.boss.x - x) < 0.8 && Math.abs(M.boss.y - y) < 0.8) return false;
    return true;
  }
  function blastCells(M, x, y, r) {
    var out = [[x, y, 'c']];
    DIRS.forEach(function (d, di) {
      for (var k = 1; k <= r; k++) {
        var nx = x + d[0] * k, ny = y + d[1] * k; if (!inb(M, nx, ny)) break;
        var g = M.grid[idx(M, nx, ny)]; if (g === 1 || g === 3) break;
        out.push([nx, ny, di, k === r]);
        if (g === 2) break;
        if (bombAt(M, nx, ny)) break;
      }
    });
    return out;
  }
  function explode(M, b) {
    var x = Math.round(b.x), y = Math.round(b.y), cells = blastCells(M, x, y, b.r), pid = b.id, owner = b.edgeBy != null ? b.edgeBy : b.hitBy != null ? b.hitBy : b.owner;   // sb-9: a 🏏 hit bomb counts for the hitter
    M.bombs.splice(M.bombs.indexOf(b), 1);
    M.pops[pid] = {owner: owner, n: 0, edge: b.edgeBy != null, t: M.t, hit: b.hitBy != null};
    cells.forEach(function (c) {
      var i = idx(M, c[0], c[1]), g = M.grid[i];
      if (g === 2) breakBlock(M, c[0], c[1], owner);
      var ob = bombAt(M, c[0], c[1]); if (ob && ob !== b) { if (ob.t > 0.06) { ob.t = 0.06; ob.chainBy = owner; } }
      var it = itemAt(M, c[0], c[1]); if (it && !(it.safe > 0) && !it.exit) { M.items.splice(M.items.indexOf(it), 1); ev(M, 'burnitem', {x: c[0], y: c[1], pk: it.k}); }
      M.fl[i] = {t: 0.55, o: owner, pid: pid, d: c[2], end: c[3], k: Math.abs(c[0] - x) + Math.abs(c[1] - y)};
    });
    if (b.chainBy != null && M.stats[b.chainBy]) M.stats[b.chainBy].chains++;
    if (b.concrete && M.grid[idx(M, x, y)] === 0 && !M.P.some(function (q) { return q.alive && !q.ghost && !q.edge && cellX(q) === x && cellY(q) === y; })) { M.grid[idx(M, x, y)] = 3; M.gridVer++; ev(M, 'concrete', {x: x, y: y}); }
    ev(M, 'pop', {x: x, y: y, cells: cells, owner: owner, id: pid, chain: b.chainBy != null, poo: b.poo, skin: b.realSkin || b.skin});
  }
  function breakBlock(M, x, y, owner) {
    var i = idx(M, x, y); M.grid[i] = 0; M.soft--; M.gridVer++;
    if (owner >= 0 && M.stats[owner]) M.stats[owner].blocks++;
    var k = M.hidden[i]; if (k) { delete M.hidden[i]; M.items.push({x: x, y: y, k: k, t: null, safe: 0.6, born: M.t}); ev(M, 'reveal', {x: x, y: y, pk: k}); }
    if (i === M.exit) { M.items.push({x: x, y: y, k: 'exit', exit: true, t: null, safe: 99, born: M.t}); ev(M, 'door', {x: x, y: y}); }
    ev(M, 'break', {x: x, y: y, by: owner});
  }

  /* ---------- power-ups ---------- */
  function applyPower(M, p, k) {
    var took = true;
    if (k === 'bomb') { if (p.bombsMax < CAP.bomb) p.bombsMax++; else took = false; }
    else if (k === 'fire') { if (p.fire < CAP.fire) p.fire++; else took = false; }
    else if (k === 'speed') { if (p.spd < CAP.speed) p.spd++; else took = false; }
    else if (k === 'error') { if (p.human || p.auto) p.err = 6; else p.slow = Math.max(p.slow, 4); return 'error'; }
    else if (p[k]) took = false; else p[k] = true;
    if (took) p.pick.push(k);
    return took;
  }
  function resetPowers(p) { p.bombsMax = p.base.bomb; p.fire = p.base.fire; p.spd = 0; p.kick = p.toss = p.shield = p.remote = p.dash = false; p.pick = []; }
  function dropPick(p, k) { var j = p.pick.lastIndexOf(k); if (j >= 0) p.pick.splice(j, 1); }
  function scatter(M, p, list, x, y) {
    if (!list.length) return;
    var seen = {}, q = [[x, y, 0]], spots = [];
    seen[idx(M, x, y)] = 1;
    while (q.length && spots.length < list.length + 6) {
      var c = q.shift();
      if (c[2] > 0 && !itemAt(M, c[0], c[1]) && !bombAt(M, c[0], c[1]) && !M.fl[idx(M, c[0], c[1])]) spots.push(c);
      if (c[2] >= 5) continue;
      DIRS.forEach(function (d) { var nx = c[0] + d[0], ny = c[1] + d[1], i = idx(M, nx, ny); if (inb(M, nx, ny) && !seen[i] && !solid(M, nx, ny)) { seen[i] = 1; q.push([nx, ny, c[2] + 1]); } });
    }
    list.forEach(function (k, j) {
      var s = spots.length ? spots.splice(Math.floor(M.rng() * Math.min(spots.length, 6)), 1)[0] : null; if (!s) return;
      M.items.push({x: s[0], y: s[1], k: k, t: 10, drop: true, fx: x, fy: y, born: M.t, safe: 0.4});
    });
    ev(M, 'scatter', {i: p.i, n: list.length, x: x, y: y});
  }

  /* ---------- catching ---------- */
  function hit(M, p, src) {
    if (p.inv > 0 || !p.alive || p.ghost || p.edge) return;
    if (p.shield) { p.shield = false; dropPick(p, 'shield'); p.inv = 1.2; ev(M, 'shieldoff', {i: p.i}); return; }
    var by = src && src.o != null ? src.o : -1, x = cellX(p), y = cellY(p);
    // 👻 soul swap: a ghost locked this player and the pop caught them → the ghost takes the body
    if (p.lock > 0 && p.lockBy >= 0 && M.P[p.lockBy] && M.P[p.lockBy].ghost) { soulSwap(M, M.P[p.lockBy], p, by); return; }
    credit(M, p, by, src);
    if (src && src.pid != null && M.pops[src.pid] && M.pops[src.pid].hit && by >= 0 && by !== p.i) { if (M.stats[by]) M.stats[by].homeruns++; ev(M, 'homerun', {i: by, victim: p.i}); }   // sb-9 🏏
    var cb0 = carriedBy(M, p); if (cb0) { cb0.carry = false; cb0.x = x; cb0.y = y; cb0.pass = overlapPass(M, x, y); }
    p.act = {k: 'caught', t: 0}; p.caughtT = 0; p.lock = 0;
    var list = p.pick.slice(), mode = M.mode;
    ev(M, 'caught', {i: p.i, by: by, x: p.x, y: p.y, theme: M.theme});
    if (mode === 'hold') {
      var keep = list.slice(-2), drop = list.slice(0, Math.max(0, list.length - 2));
      resetPowers(p); keep.forEach(function (k) { applyPower(M, p, k); });
      scatter(M, p, drop, x, y); p.alive = false; p.respawnT = 3; return;
    }
    resetPowers(p); scatter(M, p, list, x, y);
    if (mode === 'classic') {
      if (p.joined) { p.alive = false; p.gone = true; var k2 = POWERS[Math.floor(M.rng() * 6)]; M.items.push({x: x, y: y, k: k2, t: 10, drop: true, fx: x, fy: y, born: M.t, safe: 0.4}); ev(M, 'botdrop', {i: p.i, pk: k2}); return; }
      p.alive = false; p.edge = true; p.edgeT = 0.9; placeOnEdge(M, p, x, y); M.lastOutT = M.t; return;
    }
    p.lives--;
    if (p.lives > 0) { p.inv = 2.2; if (mode === 'stage' && p.human) { p.x = p.sx; p.y = p.sy; } ev(M, 'life', {i: p.i, lives: p.lives}); return; }
    p.alive = false; M.lastOutT = M.t;
    if (mode === 'battle' && M.ghosts) { p.ghostT = 1.1; }
    else p.out = true;
  }
  function credit(M, p, by, src) {
    if (by === -2 || by == null) return;
    if (by < 0) return;
    var s = M.stats[by]; if (!s) return;
    if (by === p.i) { s.self++; return; }
    if (p.human) s.catches++; else s.bots++;
    if (src && src.pid && M.pops[src.pid]) { var pp = M.pops[src.pid]; pp.n++; if (pp.n > s.multi) s.multi = pp.n; if (pp.n === 3) s.triple++; if (pp.edge) comeback(M, M.P[by], p); }
  }
  function soulSwap(M, g, v, by) {
    credit(M, v, by, null);
    var x = v.x, y = v.y;
    g.alive = true; g.ghost = false; g.x = x; g.y = y; g.lives = 1; g.inv = 1.5;
    ['bombsMax', 'fire', 'spd', 'kick', 'toss', 'shield', 'remote', 'dash'].forEach(function (k) { g[k] = v[k]; }); g.pick = v.pick.slice(); g.dx = v.dx; g.dy = v.dy; g.face = v.face;
    v.alive = false; v.ghost = true; v.lock = 0; v.lockBy = -1; v.lives = 0; resetPowers(v); v.lockCd = 3; v.ghostT = 0; v.act = {k: 'caught', t: 0};
    g.ai.path = []; g.ai.mode = ''; v.ai.path = [];
    g.lockCd = 10; M.stats[g.i].swaps++; M.stats[g.i].comebacks++;
    ev(M, 'swap', {ghost: g.i, body: v.i, x: x, y: y});
  }
  function trapLock(M, g) {
    if (g.lockCd > 0) return false;
    var best = null, bd = 0.8;
    M.P.forEach(function (q) { if (q !== g && q.alive && !q.ghost && !q.edge && q.inv <= 0) { var d = Math.hypot(q.x - g.x, q.y - g.y); if (d < bd) { bd = d; best = q; } } });
    if (!best) { ev(M, 'nolock', {i: g.i}); g.lockCd = 0.6; return false; }
    best.lock = 1; best.lockBy = g.i; g.lockCd = 10; ev(M, 'lock', {ghost: g.i, i: best.i}); return true;
  }
  // 💩 Classic: out players stand on the border ring (edgePos = index along the ring)
  function ringCells(M) {
    if (M._ring && M._ringW === M.W) return M._ring;
    var W = M.W, H = M.H, r = [], x, y;
    for (x = 1; x < W - 1; x++) r.push([x, 0, 0, 1]);
    for (y = 1; y < H - 1; y++) r.push([W - 1, y, -1, 0]);
    for (x = W - 2; x >= 1; x--) r.push([x, H - 1, 0, -1]);
    for (y = H - 2; y >= 1; y--) r.push([0, y, 1, 0]);
    M._ring = r; M._ringW = W; return r;
  }
  function placeOnEdge(M, p, x, y) {
    var r = ringCells(M), best = 0, bd = 1e9;
    r.forEach(function (c, j) { var d = Math.abs(c[0] - x) + Math.abs(c[1] - y); if (d < bd) { bd = d; best = j; } });
    p.edgePos = best; p.x = r[best][0]; p.y = r[best][1];
  }
  function edgeThrow(M, p) {
    if (M.t < 60 || p.edgeCd > 0 || p.edgeT > 0) return false;
    var r = ringCells(M), c = r[p.edgePos], b = {id: M.popId++, owner: p.i, edgeBy: p.i, x: c[0], y: c[1], r: 2, t: 1.4, max: 1.4, pass: {}, poo: true, concrete: M.t >= 90, born: M.t};
    M.bombs.push(b); startFly(M, b, c[0], c[1], c[2], c[3], 3, p.i); b.fly.noWrap = true;
    p.edgeCd = 2.2; p.act = {k: 'toss', t: 0}; M.stats[p.i].throws++; ev(M, 'edgethrow', {i: p.i, id: b.id}); return true;
  }
  function comeback(M, t, caught) {
    if (!t || !t.edge) return;
    t.edge = false; t.alive = true; t.x = cellX(caught); t.y = cellY(caught); t.inv = 1.5; t.act = {k: 'cheer', t: 0};
    M.stats[t.i].comebacks++; ev(M, 'comeback', {i: t.i, x: t.x, y: t.y});
  }

  /* ---------- sudden death (per theme) ---------- */
  function startSudden(M) {
    M.sd = {t: 0, ring: 0, ringCells: null, ringI: 0, fillT: 0, strikeT: 2, pullOn: M.theme === 'space', swapT: 6};
    ev(M, 'sudden', {theme: M.theme});
  }
  function ringOf(M, n) {
    var W = M.W, H = M.H, x0 = 1 + n, y0 = 1 + n, x1 = W - 2 - n, y1 = H - 2 - n, out = [], x, y;
    if (x0 > x1 || y0 > y1) return out;
    for (x = x0; x <= x1; x++) out.push([x, y0]);
    for (y = y0 + 1; y <= y1; y++) out.push([x1, y]);
    if (y1 > y0) for (x = x1 - 1; x >= x0; x--) out.push([x, y1]);
    if (x1 > x0) for (y = y1 - 1; y > y0; y--) out.push([x0, y]);
    return out;
  }
  function fillCell(M, x, y, how) {
    var i = idx(M, x, y); if (M.grid[i] === 1 || M.grid[i] === 3) return;
    if (M.grid[i] === 2) M.soft--;
    delete M.hidden[i];
    M.grid[i] = 3; M.gridVer++;
    var b = bombAt(M, x, y); if (b) b.t = 0;
    M.items = M.items.filter(function (it) { return !(it.x === x && it.y === y) || it.exit; });
    M.P.forEach(function (q) { if (q.alive && !q.ghost && !q.edge && cellX(q) === x && cellY(q) === y) { q.inv = 0; q.shield = false; hit(M, q, {o: -1}); if (q.alive && cellX(q) === x && cellY(q) === y) { var s = nearestFree(M, x, y); if (s) { q.x = s[0]; q.y = s[1]; } } } });
    ev(M, 'fill', {x: x, y: y, how: how || M.theme});
  }
  function nearestFree(M, x, y) {
    var seen = {}, q = [[x, y]]; seen[idx(M, x, y)] = 1;
    while (q.length) { var c = q.shift(); if (!solid(M, c[0], c[1]) && (c[0] !== x || c[1] !== y)) return c; DIRS.forEach(function (d) { var nx = c[0] + d[0], ny = c[1] + d[1]; if (nx > 0 && ny > 0 && nx < M.W - 1 && ny < M.H - 1 && !seen[idx(M, nx, ny)]) { seen[idx(M, nx, ny)] = 1; q.push([nx, ny]); } }); }
    return null;
  }
  function randFloor(M, avoid) {
    for (var tries = 0; tries < 80; tries++) { var x = 1 + Math.floor(M.rng() * (M.W - 2)), y = 1 + Math.floor(M.rng() * (M.H - 2)); if (M.grid[idx(M, x, y)] === 0 && !(avoid && avoid(x, y))) return [x, y]; }
    return null;
  }
  function stepSudden(M, dt) {
    var S = M.sd, slow = M.L.slowSudden ? 1.6 : 1;
    S.t += dt;
    // the map closes in from the edge, one cell at a time (themed: craters, flood, dark tiles, metal, holes, clouds, graves)
    S.fillT -= dt;
    if (S.fillT <= 0) {
      if (!S.ringCells || S.ringI >= S.ringCells.length) { S.ringCells = ringOf(M, S.ring); S.ringI = 0; S.ring++; }
      if (S.ringCells.length) { var c = S.ringCells[S.ringI++]; fillCell(M, c[0], c[1]); }
      S.fillT = (M.level >= 5 ? 0.22 : 0.32) * slow;
    }
    // themed strikes: warned cells, then a pop (no owner)
    S.strikeT -= dt;
    if (S.strikeT <= 0) { themeStrike(M); S.strikeT = (M.level >= 4 ? 2.4 : 3.2) * slow; }
    if (M.theme === 'robot') { S.swapT -= dt; if (S.swapT <= 0) { S.swapT = 8; var al = alivePlayers(M); if (al.length >= 2) { var a = al[Math.floor(M.rng() * al.length)], b = al.filter(function (q) { return q !== a; })[Math.floor(M.rng() * (al.length - 1))]; var tx = a.x, ty = a.y; a.x = b.x; a.y = b.y; b.x = tx; b.y = ty; ev(M, 'portal', {a: a.i, b: b.i}); } } }
    if (M.theme === 'space') { var cx = (M.W - 1) / 2, cy = (M.H - 1) / 2; alivePlayers(M).forEach(function (q) { var ddx = cx - q.x, ddy = cy - q.y; if (Math.abs(ddx) > 0.3) moveAxis(M, q, sgn(ddx), 0, 0.35 * dt); else if (Math.abs(ddy) > 0.3) moveAxis(M, q, 0, sgn(ddy), 0.35 * dt); }); }
    if (M.theme === 'zombie') {
      if (!M.horde) { var row = 1 + 2 * Math.floor(M.rng() * Math.floor((M.H - 1) / 2)); M.horde = {y: row, x: 0, dir: M.rng() < 0.5 ? 1 : -1}; M.horde.x = M.horde.dir > 0 ? 0 : M.W - 1; ev(M, 'horde', {y: row}); }
      var H = M.horde; H.x += H.dir * 1.1 * dt;
      alivePlayers(M).forEach(function (q) { if (Math.abs(q.y - H.y) < 0.6 && Math.abs(q.x - H.x) < 0.7 && q.slow <= 0) { q.slow = 3; ev(M, 'zombified', {i: q.i}); } });
      if (H.x < -1 || H.x > M.W) M.horde = null;
    }
  }
  function themeStrike(M) {
    var cells = [], th = M.theme, n, r;
    var near = function () { var al = alivePlayers(M); if (al.length && M.rng() < 0.6) { var q = al[Math.floor(M.rng() * al.length)]; return [cellX(q), cellY(q)]; } return randFloor(M); };
    if (th === 'sea') { var y = 1 + Math.floor(M.rng() * (M.H - 2)); for (var x = 1; x < M.W - 1; x++) cells.push([x, y]); }
    else if (th === 'dance') { var cx = 1 + Math.floor(M.rng() * (M.W - 2)); for (var yy = 1; yy < M.H - 1; yy++) cells.push([cx, yy]); }
    else if (th === 'robot') { var c0 = near() || [1, 1]; for (var x2 = 1; x2 < M.W - 1; x2++) cells.push([x2, c0[1]]); for (var y2 = 1; y2 < M.H - 1; y2++) if (y2 !== c0[1]) cells.push([c0[0], y2]); }
    else { n = th === 'sky' ? 4 : 3; for (r = 0; r < n; r++) { var c1 = near(); if (c1) cells.push(c1); } }
    cells = cells.filter(function (c) { return !solid(M, c[0], c[1]) || M.grid[idx(M, c[0], c[1])] === 2; });
    if (!cells.length) return;
    M.warn.push({cells: cells, t: 1.1, max: 1.1, theme: th, crater: th === 'dino'});
    ev(M, 'warn', {cells: cells, theme: th});
  }
  function stepWarn(M, dt) {
    for (var i = M.warn.length - 1; i >= 0; i--) {
      var w = M.warn[i]; w.t -= dt;
      if (w.t <= 0) {
        M.warn.splice(i, 1);
        w.cells.forEach(function (c) { var j = idx(M, c[0], c[1]); if (M.grid[j] === 2) breakBlock(M, c[0], c[1], -1); if (M.grid[j] === 0) { M.fl[j] = {t: 0.45, o: -1, pid: 0, d: 'c', strike: w.theme}; var b = bombAt(M, c[0], c[1]); if (b) b.t = Math.min(b.t, 0.05); } });
        ev(M, 'strike', {cells: w.cells, theme: w.theme});
      }
    }
  }

  /* ---------- 🤖 bots ---------- */
  function dangerMap(M, extra, seen) {
    var D = new Float32Array(M.W * M.H); D.fill(Infinity);
    // seen = {self, notice}: a bot only notices someone else's bomb when it has `notice` s left before it pops
    // (Basic 1.15 s → Extreme 2.4 s, Hardcore always) — so on easy levels a well-placed bomb can box a bot in (Aowu 2026-11-07)
    var bs = M.bombs.filter(function (b) { return !b.carry && !(seen && b.owner !== seen.self && b.t > seen.notice); }).map(function (b) {
      var x = Math.round(b.fly ? b.fly.tx : b.x), y = Math.round(b.fly ? b.fly.ty : b.y);
      return {x: x, y: y, r: b.r, t: Math.max(0, b.t) + (b.fly ? (b.fly.dur - b.fly.t) + 0.3 : 0) + (b.slide ? 0.4 : 0), slide: !!b.slide};
    });
    if (extra) bs.push(extra);
    var cellsOf = bs.map(function (a) { return blastCells(M, a.x, a.y, a.r).concat(a.slide ? blastCells(M, a.x, a.y, a.r + 2) : []); });
    for (var it = 0; it < 3; it++) bs.forEach(function (a, ai) { cellsOf[ai].forEach(function (c) { bs.forEach(function (b2) { if (b2 !== a && b2.x === c[0] && b2.y === c[1] && b2.t > a.t) b2.t = a.t; }); }); });
    bs.forEach(function (a, ai) { cellsOf[ai].forEach(function (c) { var j = idx(M, c[0], c[1]); if (a.t < D[j]) D[j] = a.t; }); });
    for (var k in M.fl) if (M.fl[k].t > 0.04) D[k] = Math.min(D[k], -M.fl[k].t);
    M.warn.forEach(function (w) { w.cells.forEach(function (c) { var j = idx(M, c[0], c[1]); D[j] = Math.min(D[j], w.t); }); });
    if (M.sd && M.sd.ringCells) { for (var r = M.sd.ringI; r < Math.min(M.sd.ringCells.length, M.sd.ringI + 6); r++) { var c = M.sd.ringCells[r]; D[idx(M, c[0], c[1])] = Math.min(D[idx(M, c[0], c[1])], (r - M.sd.ringI) * 0.3); } var nr = ringOf(M, M.sd.ring); if (M.sd.ringCells && M.sd.ringI > M.sd.ringCells.length - 6) nr.slice(0, 4).forEach(function (c) { D[idx(M, c[0], c[1])] = Math.min(D[idx(M, c[0], c[1])], 1); }); }
    if (M.horde) for (var x = 0; x < M.W; x++) if ((x - M.horde.x) * M.horde.dir > -0.5 && (x - M.horde.x) * M.horde.dir < 4) D[idx(M, x, M.horde.y)] = Math.min(D[idx(M, x, M.horde.y)], 0.8);
    if (M.boss && M.boss.alive) { var bx = Math.round(M.boss.x), by = Math.round(M.boss.y); DIRS.concat([[0, 0]]).forEach(function (d) { var j = idx(M, bx + d[0], by + d[1]); if (inb(M, bx + d[0], by + d[1])) D[j] = Math.min(D[j], 0.2); }); }
    return D;
  }
  function bfs(M, p, start, D, goal, maxD, startBombOk) {
    var W = M.W, sp = speedOf(M, p), prev = new Int32Array(W * M.H).fill(-2), dist = new Int16Array(W * M.H), q = [start], h = 0;
    prev[start] = -1;
    while (h < q.length) {
      var c = q[h++], cx = c % W, cy = (c - cx) / W, d = dist[c];
      if (goal(c, d)) { var path = []; while (c !== start) { path.unshift(c); c = prev[c]; } return path; }
      if (d >= maxD) continue;
      for (var k = 0; k < 4; k++) {
        var nx = cx + DIRS[k][0], ny = cy + DIRS[k][1], n = ny * W + nx;
        if (prev[n] !== -2 || !free(M, nx, ny, p)) continue;
        var arrive = (d + 1) / sp;
        if (D && D[n] !== Infinity && (D[n] < 0 ? -D[n] > arrive - 0.6 / sp - 0.05 : (D[n] > arrive - 0.75 && D[n] < arrive + 0.7))) continue;   // don't walk through a pop (pops last ~0.55 s)
        prev[n] = c; dist[n] = d + 1; q.push(n);
      }
    }
    return null;
  }
  function escapeFrom(M, p, start, D, limit) {
    var sp = speedOf(M, p);
    return bfs(M, p, start, D, function (c, d) { return D[c] === Infinity && (limit == null || d / sp < limit); }, lookOf(M, p));
  }
  // how far a bot looks for a way out (Basic 3 cells → Hardcore 14); the player autopilot in tests sees everything
  function lookOf(M, p) { return (p.human || p.auto) ? 14 : (M.L.look || 14); }
  // the danger map this bot knows about (cached per bot per step)
  function botDanger(M, p) {
    if (p.human || p.auto || !(M.L.notice < 50)) return M._D || (M._D = dangerMap(M));
    if (p._Dt !== M.totalT) { p._D = dangerMap(M, null, {self: p.i, notice: M.L.notice}); p._Dt = M.totalT; }
    return p._D;
  }
  function safePlant(M, p, c) {
    var x = c % M.W, y = (c - x) / M.W, D2 = dangerMap(M, {x: x, y: y, r: p.fire, t: M.L.fuse});
    var fake = Object.assign({}, p, {i: p.i}); // can walk off the new bomb (it isn't in the list yet)
    var path = bfs(M, fake, c, D2, function (cc, d) { return D2[cc] === Infinity; }, 10);
    return path && path.length / speedOf(M, p) < M.L.fuse - 0.45 ? path : null;
  }
  function enemiesOf(M, p) {
    return M.P.filter(function (q) { return q !== p && q.alive && !q.ghost && !q.edge && !q.gone && (M.teams ? q.team !== p.team : true) && !(M.mode === 'stage' && q.foe && p.foe); });
  }
  function inLine(M, p, q) {
    var px = cellX(p), py = cellY(p), qx = cellX(q), qy = cellY(q);
    if (px !== qx && py !== qy) return false;
    var dist = Math.abs(px - qx) + Math.abs(py - qy); if (dist > p.fire) return false;
    var sx = sgn(qx - px), sy = sgn(qy - py);
    for (var k = 1; k < dist; k++) if (solid(M, px + sx * k, py + sy * k)) return false;
    return true;
  }
  function think(M, p, dt) {
    var kind = kind || (M.mode === 'stage' ? 'hunter' : 'smart');
    var A = p.ai; A.think -= dt; if (A.wait > 0) A.wait -= dt;
    var c = idx(M, cellX(p), cellY(p));
    if (c !== A.lastCell) { A.lastCell = c; A.stillT = 0; } else A.stillT += dt;
    if (A.think > 0 && !(A.path.length === 0 && A.mode !== 'wait')) { followPath(M, p); return; }
    A.think = kind === 'sleepy' ? 0.35 : 0.12;
    // 😴 naps: Sleepy bots stand still 1.2–2.2 s every 4–7 s; on Basic + Junior every bot dawdles 0.6–1 s every 6–9 s.
    // A napping bot only wakes when a pop it knows about is under 0.9 s away — this is what lets kids box a bot in (Aowu 2026-11-07)
    if (!p.human && !p.auto && (kind === 'sleepy' || M.level <= 1)) {
      var cz = idx(M, cellX(p), cellY(p)), Dz = botDanger(M, p);
      var now = M.totalT;
      if (A.napUntil > now) { if (!(Dz[cz] !== Infinity && Dz[cz] < 0.9)) { A.path = []; A.nap = A.napUntil - now; setCtrl(M, p.i, false, false, false, false); return; } A.napUntil = 0; A.nap = 0; }
      else { A.nap = 0; if (A.napAt == null) A.napAt = now + 2 + M.rng() * 3; if (now >= A.napAt && Dz[cz] === Infinity) { var sl = kind === 'sleepy'; A.napUntil = now + (sl ? 1.2 + M.rng() : 0.6 + M.rng() * 0.4); A.napAt = A.napUntil + (sl ? 4 + M.rng() * 3 : 6 + M.rng() * 3); A.nap = A.napUntil - now; A.path = []; setCtrl(M, p.i, false, false, false, false); ev(M, 'nap', {i: p.i}); return; } }
    }
    var D = botDanger(M, p), here = D[c];
    var react = kind === 'sleepy' ? 1.7 : 99;
    // 😲 startled: the moment a bot first notices someone's bomb it freezes a moment (Basic 0.35 s, Junior 0.25, Intermediate 0.15)
    if (A.startleUntil > M.totalT) { setCtrl(M, p.i, false, false, false, false); return; }
    if (here !== Infinity && here < react && A.mode !== 'flee' && !A.startled && !p.human && !p.auto && M.L.startle) { A.startled = true; A.startleUntil = M.totalT + M.L.startle; A.path = []; setCtrl(M, p.i, false, false, false, false); return; }
    if (here === Infinity) A.startled = false;
    // 😱 panic (Basic 60 % → Hard 10 %): a startled bot runs straight down the corridor away from the bomb instead of stepping aside
    if (A.panicUntil > M.totalT && A.path.length) { followPath(M, p); return; }
    if (here !== Infinity && here < react && A.mode !== 'flee' && !p.human && !p.auto && M.L.panic && M.rng() < M.L.panic) {
      var pb = null, pd = 1e9; M.bombs.forEach(function (b) { var bx = Math.round(b.x), by = Math.round(b.y), d = Math.abs(bx - cellX(p)) + Math.abs(by - cellY(p)); if (b.owner !== p.i && (bx === cellX(p) || by === cellY(p)) && d < pd) { pd = d; pb = b; } });
      if (pb) { var ddx = sgn(cellX(p) - Math.round(pb.x)), ddy = sgn(cellY(p) - Math.round(pb.y)); if (!ddx && !ddy) ddx = 1; var run = [], x = cellX(p), y = cellY(p);
        while (run.length < 6 && free(M, x + ddx, y + ddy, p)) { x += ddx; y += ddy; run.push(idx(M, x, y)); }
        if (run.length) { A.path = run; A.mode = 'flee'; A.panicUntil = M.totalT + 1.6; ev(M, 'panic', {i: p.i}); followPath(M, p); return; } }
    }
    if (here !== Infinity && here < react) {
      var esc = escapeFrom(M, p, c, D); if (!esc) esc = bfs(M, p, c, null, function (cc) { return D[cc] === Infinity; }, lookOf(M, p));
      if (esc) { A.path = esc; A.mode = 'flee'; followPath(M, p); return; }
      A.path = []; followPath(M, p); return;
    }
    if (A.mode === 'flee' && A.path.length) { followPath(M, p); return; }
    // reached a planned spot → plant
    if (A.plantAt === c) { A.plantAt = -1; var esc2 = safePlant(M, p, c); if (esc2 && plant(M, p)) { A.path = esc2; A.mode = 'flee'; A.think = 0.05; followPath(M, p); return; } }
    if (A.wait > 0 && M.bombs.some(function (b) { return b.owner === p.i; })) { A.path = []; followPath(M, p); return; }
    var foes = enemiesOf(M, p), sp = speedOf(M, p), agg = {sleepy: 0.25, smart: 0.6, hunter: 1, trapper: 1}[kind] || 0.6;
    if (M.mode === 'classic' && M.t < 8) agg *= 0.3;
    // 1. a foe in my + line → plant (if I can get away)
    if (ownBombs(M, p) < p.bombsMax && foes.some(function (q) { return inLine(M, p, q) && (kind !== 'sleepy' || M.rng() < 0.3); }) && M.rng() < agg + 0.15) {
      var e1 = safePlant(M, p, c); if (e1 && plant(M, p)) { A.path = e1; A.mode = 'flee'; A.wait = 0.5; followPath(M, p); return; }
    }
    // 1b. trapper / kicker: kick a bomb toward a foe in line
    if (p.kick && kind !== 'sleepy') { for (var k = 0; k < 4; k++) { var bx = cellX(p) + DIRS[k][0], by = cellY(p) + DIRS[k][1], b = bombAt(M, bx, by); if (b && !b.slide && foes.some(function (q) { return (DIRS[k][0] ? cellY(q) === by && sgn(cellX(q) - bx) === DIRS[k][0] : cellX(q) === bx && sgn(cellY(q) - by) === DIRS[k][1]); })) { p.dx = DIRS[k][0]; p.dy = DIRS[k][1]; skill(M, p); A.think = 0.3; return; } } }
    // 1c. sb-9 🏏: from Hard, hit a bomb next to me toward a foe in line 3–6 blocks away (max once ~6 s)
    if (p.toss && M.level >= 3 && kind !== 'sleepy' && M.t - (A.hitT || -9) > 6) { for (var k2 = 0; k2 < 4; k2++) { var hx = cellX(p) + DIRS[k2][0], hy = cellY(p) + DIRS[k2][1], hb = bombAt(M, hx, hy); if (hb && !hb.slide && !hb.fly && foes.some(function (q) { var ddx = cellX(q) - hx, ddy = cellY(q) - hy; return DIRS[k2][0] ? (cellY(q) === hy && sgn(ddx) === DIRS[k2][0] && Math.abs(ddx) >= 3 && Math.abs(ddx) <= 6) : (cellX(q) === hx && sgn(ddy) === DIRS[k2][1] && Math.abs(ddy) >= 3 && Math.abs(ddy) <= 6); })) { p.dx = DIRS[k2][0]; p.dy = DIRS[k2][1]; if (p.dx) p.face = p.dx; A.hitT = M.t; skill(M, p); A.think = 0.3; return; } } }
    // 2. hold the land: go to the zone
    if (M.zone && M.mode === 'hold') {
      var Z = M.zone, inZ = function (cc) { var x = cc % M.W, y = (cc - x) / M.W; return x >= Z.x && y >= Z.y && x < Z.x + Z.w && y < Z.y + Z.h; };
      if (!inZ(c)) { var pz = bfs(M, p, c, D, function (cc) { return inZ(cc) && D[cc] === Infinity; }, 40); if (pz) { A.path = pz; A.mode = 'zone'; followPath(M, p); return; } }
      else if (foes.some(function (q) { return inZ(idx(M, cellX(q), cellY(q))); }) && ownBombs(M, p) < p.bombsMax) { var e2 = safePlant(M, p, c); if (e2 && plant(M, p)) { A.path = e2; A.mode = 'flee'; followPath(M, p); return; } }
      else { A.path = []; followPath(M, p); return; }
    }
    // 2b. 🗺️ stage autopilot (tests): open exit → go there (break the block on it); boss → chase it
    if (M.mode === 'stage' && (p.human || p.auto)) {
      if (M.exitOpen && M.exit >= 0) {
        if (M.grid[M.exit] === 0) { var pe = bfs(M, p, c, D, function (cc) { return cc === M.exit; }, 60); if (pe) { A.path = pe; A.mode = 'exit'; followPath(M, p); return; } }
        else { var ex = M.exit % M.W, ey = (M.exit - ex) / M.W; var pn = bfs(M, p, c, D, function (cc) { var x = cc % M.W, y = (cc - x) / M.W; return Math.abs(x - ex) + Math.abs(y - ey) === 1 && !!safePlant(M, p, cc); }, 60); if (pn) { if (!pn.length) { var e0 = safePlant(M, p, c); if (e0 && plant(M, p)) { A.path = e0; A.mode = 'flee'; followPath(M, p); return; } } else { A.path = pn; A.plantAt = pn[pn.length - 1]; A.mode = 'block'; followPath(M, p); return; } } }
      }
      if (M.boss && M.boss.alive) {
        var bq = {x: M.boss.x, y: M.boss.y};
        if (inLine(M, p, bq) && ownBombs(M, p) < p.bombsMax) { var eb = safePlant(M, p, c); if (eb && plant(M, p)) { A.path = eb; A.mode = 'flee'; A.wait = 0.6; followPath(M, p); return; } }
        var pbq = bfs(M, p, c, D, function (cc) { var x = cc % M.W, y = (cc - x) / M.W; return D[cc] === Infinity && inLine(M, {x: x, y: y, fire: p.fire}, bq) && Math.abs(x - bq.x) + Math.abs(y - bq.y) >= 1.5; }, 40);
        if (pbq && pbq.length) { A.path = pbq; A.mode = 'boss'; followPath(M, p); return; }
      }
    }
    // 3. power-ups nearby (sleepy only when close; nobody wants 😵)
    var reach = kind === 'sleepy' ? 3 : 9;
    var pi = bfs(M, p, c, D, function (cc) { var x = cc % M.W, y = (cc - x) / M.W, it = itemAt(M, x, y); return it && it.k !== 'error' && !it.exit; }, reach);
    if (pi && pi.length) { A.path = pi; A.mode = 'item'; followPath(M, p); return; }
    // 4. hunters + trappers walk to the nearest foe and plant two cells away
    if ((kind === 'hunter' || kind === 'trapper' || (kind === 'smart' && M.rng() < 0.3)) && foes.length) {
      var foeCells = {}; foes.forEach(function (q) { foeCells[idx(M, cellX(q), cellY(q))] = 1; });
      var ph = bfs(M, p, c, D, function (cc) { return foeCells[cc]; }, 30);
      if (ph) {
        var stopAt = kind === 'trapper' ? 2 : 1;
        if (ph.length <= stopAt + 1 && ownBombs(M, p) < p.bombsMax) { var e3 = safePlant(M, p, c); if (e3 && plant(M, p)) { A.path = e3; A.mode = 'flee'; A.wait = 0.6; followPath(M, p); return; } }
        A.path = ph.slice(0, Math.max(1, ph.length - stopAt)); A.mode = 'hunt'; followPath(M, p); return;
      }
    }
    // 5. break blocks: walk next to a soft block where planting is safe
    if (ownBombs(M, p) < p.bombsMax && M.soft > 0) {
      var tries = 0;
      var pb = bfs(M, p, c, D, function (cc, d) {
        var x = cc % M.W, y = (cc - x) / M.W; var nextTo = false;
        for (var k2 = 0; k2 < 4; k2++) if (M.grid[idx(M, x + DIRS[k2][0], y + DIRS[k2][1])] === 2) nextTo = true;
        if (!nextTo || tries > 6) return false; tries++;
        return !!safePlant(M, p, cc);
      }, 24);
      if (pb) { if (!pb.length) { var e4 = safePlant(M, p, c); if (e4 && plant(M, p)) { A.path = e4; A.mode = 'flee'; A.wait = 0.4; followPath(M, p); return; } } else { A.path = pb; A.plantAt = pb[pb.length - 1]; A.mode = 'block'; followPath(M, p); return; } }
    }
    // 6. no blocks left → go near a foe even if not a hunter
    if (foes.length && M.soft <= 0) { var fc = {}; foes.forEach(function (q) { fc[idx(M, cellX(q), cellY(q))] = 1; }); var pf = bfs(M, p, c, D, function (cc) { return fc[cc]; }, 40); if (pf && pf.length > 1) { A.path = pf.slice(0, pf.length - 1); A.mode = 'hunt'; followPath(M, p); return; } if (pf && ownBombs(M, p) < p.bombsMax) { var e5 = safePlant(M, p, c); if (e5 && plant(M, p)) { A.path = e5; A.mode = 'flee'; followPath(M, p); return; } } }
    // 7. wander (never stand still for long)
    if (!A.path.length || A.stillT > 1.5) {
      var want = 1 + Math.floor(M.rng() * 4), pw = bfs(M, p, c, D, function (cc, d) { return d >= want && D[cc] === Infinity; }, 6);
      if (pw) { A.path = pw; A.mode = 'wander'; }
    }
    followPath(M, p);
  }
  function followPath(M, p) {
    var A = p.ai;
    if (!A.path.length) { setCtrl(M, p.i, false, false, false, false); return; }
    var n = A.path[0], tx = n % M.W, ty = (n - tx) / M.W;
    // a path from an old spot (soul swap, portal, black hole) or a bot that can't move → plan again
    if (Math.abs(Math.round(p.x) - tx) + Math.abs(Math.round(p.y) - ty) > 1 || A.stillT > 1.6) { A.path = []; A.think = 0; A.stillT = 0; A.mode = ''; setCtrl(M, p.i, false, false, false, false); return; }
    if (Math.abs(p.x - tx) < 0.07 && Math.abs(p.y - ty) < 0.07) { A.path.shift(); if (!A.path.length) { p.x = tx; p.y = ty; setCtrl(M, p.i, false, false, false, false); return; } n = A.path[0]; tx = n % M.W; ty = (n - tx) / M.W; }
    if (!free(M, tx, ty, p) && !(Math.round(p.x) === tx && Math.round(p.y) === ty)) { A.path = []; A.think = 0; setCtrl(M, p.i, false, false, false, false); return; }
    if (A.mode !== 'flee') { var D = botDanger(M, p), dn = D[n], arr = (Math.abs(tx - p.x) + Math.abs(ty - p.y)) / speedOf(M, p); if (dn !== Infinity && (dn < 0 ? -dn > arr - 0.6 / speedOf(M, p) - 0.05 : dn < arr + 0.7)) { A.path = []; A.think = 0; setCtrl(M, p.i, false, false, false, false); return; } }
    var dx = tx - p.x, dy = ty - p.y;
    if (Math.abs(dx) > Math.abs(dy)) { setCtrl(M, p.i, false, false, dx < 0, dx > 0); p.lastAxis = 'h'; }
    else { setCtrl(M, p.i, dy < 0, dy > 0, false, false); p.lastAxis = 'v'; }
  }
  // 👻 a bot ghost (Hard+) drifts to a living player near a pop and locks them
  function ghostThink(M, g, dt) {
    var D = M._D || (M._D = dangerMap(M)), best = null, bs = 1e9;
    M.P.forEach(function (q) { if (q !== g && q.alive && !q.ghost && !q.edge) { var d = Math.hypot(q.x - g.x, q.y - g.y), dz = D[idx(M, cellX(q), cellY(q))]; var score = d - (dz !== Infinity && dz < 1.3 ? 6 : 0); if (score < bs) { bs = score; best = q; } } });
    if (!best) return;
    var dx = best.x - g.x, dy = best.y - g.y, d = Math.hypot(dx, dy) || 1, sp = 2.6;
    g.x += dx / d * Math.min(d, sp * dt); g.y += dy / d * Math.min(d, sp * dt); if (Math.abs(dx) > 0.1) g.face = dx > 0 ? 1 : -1;
    var dz2 = D[idx(M, cellX(best), cellY(best))];
    if (d < 0.7 && g.lockCd <= 0 && dz2 !== Infinity && dz2 < 1.0 && M.level >= 3) trapLock(M, g);
  }
  // 💩 Classic: an out bot slides along the edge to line up with a foe, then throws
  function edgeBotThink(M, p, dt) {
    var r = ringCells(M), c = r[p.edgePos], foes = enemiesOf(M, p); if (!foes.length) return;
    var q = foes[0], want = p.edgePos, bd = 1e9;
    r.forEach(function (cc, j) { var tx = cc[0] + cc[2] * 3, ty = cc[1] + cc[3] * 3, d = Math.abs(tx - q.x) + Math.abs(ty - q.y); if (d < bd) { bd = d; want = j; } });
    p.edgeMove = want > p.edgePos ? 1 : want < p.edgePos ? -1 : 0;
    if (want === p.edgePos && bd < 2 && M.rng() < 0.05) edgeThrow(M, p);
  }

  /* ---------- 🗺️ boss ---------- */
  function stepBoss(M, dt) {
    var B = M.boss; if (!B || !B.alive) return;
    if (B.inv > 0) B.inv -= dt; if (B.hitT > 0) B.hitT -= dt;
    var foes = alivePlayers(M).filter(function (q) { return q.human; }); if (!foes.length) return;
    var q = foes[0], sp = 1.3 + (3 - B.hp) * 0.35;
    B.think = (B.think || 0) - dt;
    if (B.think <= 0 || !B.path.length) {
      B.think = 0.5; var c = idx(M, Math.round(B.x), Math.round(B.y)), goal = idx(M, cellX(q), cellY(q)), D = dangerMap(M);
      var fake = {i: -9, human: true, spd: 0, slow: 0, botSpeed: 1};
      B.path = bfs(M, fake, c, D, function (cc) { return cc === goal; }, 40) || bfs(M, fake, c, D, function (cc, d) { return d >= 2 && D[cc] === Infinity; }, 4) || [];
    }
    if (B.path.length) { var n = B.path[0], tx = n % M.W, ty = (n - tx) / M.W, dx = tx - B.x, dy = ty - B.y, d = Math.hypot(dx, dy); if (d < 0.05) B.path.shift(); else { B.x += dx / d * Math.min(d, sp * dt); B.y += dy / d * Math.min(d, sp * dt); if (Math.abs(dx) > 0.05) B.face = dx > 0 ? 1 : -1; } }
    // stomp on players it touches
    alivePlayers(M).forEach(function (p) { if (Math.abs(p.x - B.x) < 0.7 && Math.abs(p.y - B.y) < 0.7) hit(M, p, {o: -2}); });
    // attack: a big pop around itself every few seconds (it doesn't hurt itself)
    B.atkT -= dt;
    if (B.atkT <= 0) { B.atkT = 4.2 - (3 - B.hp) * 0.6; var bx = Math.round(B.x), by = Math.round(B.y); if (!bombAt(M, bx, by) && !solid(M, bx, by)) { M.bombs.push({id: M.popId++, owner: -2, x: bx, y: by, r: 2 + (3 - B.hp), t: 1.6, max: 1.6, pass: {}, boss: true, born: M.t}); ev(M, 'bossbomb', {x: bx, y: by}); } }
    // hit by a player's pop
    var f = M.fl[idx(M, Math.round(B.x), Math.round(B.y))];
    if (f && f.o >= 0 && B.inv <= 0) { B.hp--; B.inv = 2; B.hitT = 0.6; if (M.stats[f.o]) M.stats[f.o].bossHits++; ev(M, 'bosshit', {hp: B.hp, by: f.o}); if (B.hp <= 0) { B.alive = false; ev(M, 'bossdown', {x: B.x, y: B.y}); } }
  }

  /* ---------- step ---------- */
  function stepPlayer(M, p, dt) {
    if (p.act) { p.act.t += dt; if (p.act.t > 1.2) p.act = null; }
    if (p.inv > 0) p.inv -= dt; if (p.err > 0) p.err -= dt; if (p.slow > 0) p.slow -= dt; if (p.stun > 0) p.stun -= dt; if (p.lockCd > 0) p.lockCd -= dt; if (p.dashCd > 0) p.dashCd -= dt; if (p.edgeCd > 0) p.edgeCd -= dt; if (p.edgeT > 0) p.edgeT -= dt;
    if (p.lock > 0) { p.lock -= dt; if (p.lock <= 0) { p.lock = 0; p.lockBy = -1; } }
    p.caughtT += dt;
    if (p.gone || p.out) { p.buf = {}; return; }
    // hold the land: respawn at the edge after 3 s
    if (M.mode === 'hold' && !p.alive) { p.respawnT -= dt; if (p.respawnT <= 0) respawnEdge(M, p); p.buf = {}; return; }
    if (!p.alive && !p.ghost && !p.edge) { if (p.ghostT > 0) { p.ghostT -= dt; if (p.ghostT <= 0) { p.ghost = true; p.lockCd = 1.5; ev(M, 'ghost', {i: p.i}); } } p.buf = {}; return; }
    if (!p.human && !p.auto) { if (p.ghost) ghostThink(M, p, dt); else if (p.edge) edgeBotThink(M, p, dt); else if (p.stun <= 0) think(M, p, dt); }
    else if (p.auto) { if (p.ghost) ghostThink(M, p, dt); else if (p.edge) edgeBotThink(M, p, dt); else think(M, p, dt); }
    var d = wantDir(p);
    if (p.ghost) {
      if (p.human && d) { p.x = Math.max(0.6, Math.min(M.W - 1.6, p.x + d[0] * 3.2 * dt)); p.y = Math.max(0.6, Math.min(M.H - 1.6, p.y + d[1] * 3.2 * dt)); if (d[0]) p.face = d[0]; p.walkT += dt; }
      if (p.buf.skill || p.buf.plant) trapLock(M, p);
      p.buf = {}; return;
    }
    if (p.edge) {
      var r = ringCells(M), mv = p.human ? 0 : p.edgeMove || 0;
      if (p.human && d) { var c = r[p.edgePos]; if (c[3]) mv = c[3] > 0 ? d[0] : -d[0]; else mv = c[2] > 0 ? -d[1] : d[1]; if (!mv) mv = d[0] || d[1]; }
      p.edgeAcc = (p.edgeAcc || 0) + mv * 4 * dt;
      if (Math.abs(p.edgeAcc) >= 1) { p.edgePos = (p.edgePos + sgn(p.edgeAcc) + r.length) % r.length; p.edgeAcc = 0; p.walkT += 0.25; }
      var cc = r[p.edgePos]; p.x += (cc[0] - p.x) * Math.min(1, dt * 12); p.y += (cc[1] - p.y) * Math.min(1, dt * 12);
      if (p.buf.plant || p.buf.skill) edgeThrow(M, p);
      p.buf = {}; return;
    }
    if (p.buf.dash && p.dash && p.dashCd <= 0 && p.lock <= 0) {
      var dd = p.buf.dash, n2 = 0; for (var k = 0; k < 2; k++) { var nx = cellX(p) + dd.dx, ny = cellY(p) + dd.dy; if (!free(M, nx, ny, p)) break; p.x = nx; p.y = ny; n2++; }
      if (n2) { p.dashCd = 1.2; p.dx = dd.dx; p.dy = dd.dy; if (dd.dx) p.face = dd.dx; p.act = {k: 'dash', t: 0}; ev(M, 'dash', {i: p.i}); }
    }
    p.moving = false;
    if (d && p.lock <= 0 && p.stun <= 0) {
      p.dx = d[0]; p.dy = d[1]; if (d[0]) p.face = d[0];
      if (moveAxis(M, p, d[0], d[1], speedOf(M, p) * dt)) { p.moving = true; p.walkT += dt; }
    }
    if (p.buf.plant && !carriedBy(M, p)) plant(M, p);
    if (p.buf.skill) skill(M, p);
    p.buf = {};
    if (p.human || p.auto) stepCarry(M, p, dt);
    // pick up power-ups
    var it = itemAt(M, cellX(p), cellY(p));
    if (it && Math.abs(p.x - it.x) < 0.45 && Math.abs(p.y - it.y) < 0.45) {
      if (it.exit) { if (M.mode === 'stage' && M.exitOpen && p.human) { M.stageDone = true; ev(M, 'exit', {i: p.i}); } }
      else { var took = applyPower(M, p, it.k); M.items.splice(M.items.indexOf(it), 1); M.stats[p.i].pickups++; p.act = {k: 'grab', t: 0, item: it.k}; ev(M, 'pick', {i: p.i, pk: it.k, took: took}); }
    }
  }
  function respawnEdge(M, p) {
    var Z = M.zone, best = null, bd = -1, D = dangerMap(M);
    for (var tries = 0; tries < 60; tries++) {
      var side = Math.floor(M.rng() * 4), x = side === 0 ? 1 : side === 1 ? M.W - 2 : 1 + Math.floor(M.rng() * (M.W - 2)), y = side === 2 ? 1 : side === 3 ? M.H - 2 : 1 + Math.floor(M.rng() * (M.H - 2));
      if (M.grid[idx(M, x, y)] !== 0 || bombAt(M, x, y) || D[idx(M, x, y)] !== Infinity) continue;
      var dz = Z ? Math.abs(x - (Z.x + 1)) + Math.abs(y - (Z.y + 1)) : 0; if (dz > bd) { bd = dz; best = [x, y]; }
    }
    if (!best) best = nearestFree(M, 1, 1) || [1, 1];
    p.x = best[0]; p.y = best[1]; p.alive = true; p.inv = 1; p.act = {k: 'cheer', t: 0}; p.ai.path = [];
    ev(M, 'respawn', {i: p.i, x: p.x, y: p.y});
  }
  function step(M, dt) {
    dt = dt || DT; M._D = null;
    if (M.done && M.state !== 'end') return;
    if (M.state === 'ready') { M.readyT -= dt; if (M.readyT <= 0) { M.state = 'play'; ev(M, 'go'); } return; }
    if (M.state === 'end') { M.endT -= dt; M.P.forEach(function (p) { if (p.act) p.act.t += dt; }); if (M.endT <= 0 && !M.done) nextRound(M); return; }
    M.t += dt; M.totalT += dt;
    var L = M.L;
    if (!M.sd && M.mode !== 'hold' && M.mode !== 'stage' && M.t >= L.sudden) startSudden(M);
    if (M.mode === 'stage' && M.t >= stageTime(M)) { M.timeUp = true; }
    if (M.sd) stepSudden(M, dt);
    stepWarn(M, dt);
    M.P.forEach(function (p) { stepPlayer(M, p, dt); });
    for (var i = M.bombs.length - 1; i >= 0; i--) { var b = M.bombs[i]; stepBomb(M, b, dt); }   // sb-9: carried bombs tick too (stepBomb moves them with the carrier)
    var guard = 0;
    M.bombs.forEach(function (b) { if (b.carry && b.t <= 0) { var cq = M.P[b.carrier]; b.carry = false; if (cq) { b.x = cellX(cq); b.y = cellY(cq); if (M.stats[cq.i]) M.stats[cq.i].selfbops++; ev(M, 'selfbop', {i: cq.i, id: b.id}); } } });   // sb-9: popped in your hands = self bop
    while (guard++ < 40) { var due = M.bombs.filter(function (b) { return !b.fly && !b.carry && b.t <= 0; }); if (!due.length) break; due.forEach(function (b) { if (M.bombs.indexOf(b) >= 0) explode(M, b); }); }
    for (var k in M.fl) { M.fl[k].t -= dt; if (M.fl[k].t <= 0) delete M.fl[k]; }
    for (var j = M.items.length - 1; j >= 0; j--) { var it = M.items[j]; if (it.safe > 0) it.safe -= dt; if (it.t != null) { it.t -= dt; if (it.t <= 0) { M.items.splice(j, 1); ev(M, 'vanish', {x: it.x, y: it.y}); } } }
    // catches: anyone standing in a pop
    M.P.forEach(function (p) { if (!p.alive || p.ghost || p.edge) return; var f = M.fl[idx(M, cellX(p), cellY(p))]; if (f) hit(M, p, f); });
    if (M.boss) stepBoss(M, dt);
    if (M.mode === 'hold') stepHold(M, dt);
    if (M.mode === 'classic') stepClassic(M, dt);
    if (M.mode === 'stage') stepStage(M, dt);
    checkEnd(M);
  }
  function stepHold(M, dt) {
    var Z = M.zone, sides = {}, inside = [];
    M.P.forEach(function (p) { if (p.alive && !p.ghost && cellX(p) >= Z.x && cellY(p) >= Z.y && cellX(p) < Z.x + Z.w && cellY(p) < Z.y + Z.h) { sides[p.team] = 1; inside.push(p); } });
    var keys = Object.keys(sides); M.zoneSide = keys.length === 1 ? Number(keys[0]) : keys.length > 1 ? -2 : -1;
    if (keys.length === 1) { var s = Number(keys[0]); M.hold[s] = (M.hold[s] || 0) + dt; inside.forEach(function (p) { M.stats[p.i].hold += dt / inside.length; }); }
    if (M.level >= 3) { Z.moveT += dt; if (Z.moveT >= 40) { Z.moveT = 0; moveZone(M); } }
    // long games stay fair: every block broken → a new power-up every 20 s away from the zone
    var hiddenLeft = Object.keys(M.hidden).length;
    if (M.soft <= 0 || (M.soft < 2 && !hiddenLeft)) { M.puT += dt; if (M.puT >= 20) { M.puT = 0; var spot = randFloor(M, function (x, y) { return (x >= Z.x - 1 && x <= Z.x + Z.w && y >= Z.y - 1 && y <= Z.y + Z.h) || itemAt(M, x, y) || bombAt(M, x, y); }); if (spot) { var pool = ['bomb', 'fire', 'speed', 'kick', 'shield', 'toss']; var k = pool[Math.floor(M.rng() * pool.length)]; M.items.push({x: spot[0], y: spot[1], k: k, t: null, safe: 0.6, born: M.t}); ev(M, 'newpower', {x: spot[0], y: spot[1], pk: k}); } } }
  }
  function moveZone(M) {
    var Z = M.zone, best = null, bd = -1;
    for (var t = 0; t < 40; t++) {
      var x = 1 + Math.floor(M.rng() * (M.W - 4)), y = 1 + Math.floor(M.rng() * (M.H - 4)), open = 0;
      for (var yy = y; yy < y + 3; yy++) for (var xx = x; xx < x + 3; xx++) if (M.grid[idx(M, xx, yy)] === 0) open++;
      var d = Math.abs(x - Z.x) + Math.abs(y - Z.y); if (open >= 5 && d >= 3 && open * 2 + d > bd) { bd = open * 2 + d; best = [x, y]; }
    }
    if (best) { Z.x = best[0]; Z.y = best[1]; for (var y2 = Z.y; y2 < Z.y + 3; y2++) for (var x2 = Z.x; x2 < Z.x + 3; x2++) if (M.grid[idx(M, x2, y2)] === 2 && (x2 + y2) % 2) breakBlock(M, x2, y2, -1); ev(M, 'zonemove', {x: Z.x, y: Z.y}); }
  }
  function stepClassic(M, dt) {
    // 2:00 → other family avatars jump in as bots, one every 10 s (up to 4)
    if (M.t >= 120) {
      M.addBotT -= dt;
      var joined = M.P.filter(function (p) { return p.joined; }).length;
      if (M.addBotT <= 0 && joined < 4 && M.P.length < 12) {
        M.addBotT = 10; var names = M.joinNames || []; var spot = randFloor(M, function (x, y) { return alivePlayers(M).some(function (q) { return Math.abs(cellX(q) - x) + Math.abs(cellY(q) - y) < 4; }) || bombAt(M, x, y); });
        if (spot) { var kinds = ['smart', 'hunter', 'sleepy', 'trapper']; var p = mkP(M, {name: names[joined % Math.max(1, names.length)] || ('Family bot ' + (joined + 1)), kind: kinds[joined % 4]}, M.P.length, spot); p.joined = true; p.inv = 1.2; M.P.push(p); M.stats.push(mkStats()); M.wins.push(0); ev(M, 'join', {i: p.i, x: spot[0], y: spot[1]}); }
      }
    }
  }
  function stageTime(M) { return M.stage.time || [240, 220, 200, 180, 180, 150][M.level]; }
  function stepStage(M, dt) {
    var foes = M.P.filter(function (p) { return p.foe && p.alive; });
    if (!M.stage.boss && !M.exitOpen && !foes.length) { M.exitOpen = true; ev(M, 'exitopen', {broken: M.grid[M.exit] === 0}); }
  }
  function checkEnd(M) {
    if (M.state !== 'play') return;
    var al = alivePlayers(M), win = -1, end = false;
    if (M.mode === 'battle') {
      if (al.length <= 1) { end = true; win = al.length ? al[0].i : -1; }
    } else if (M.mode === 'classic') {
      var edges = M.P.filter(function (p) { return p.edge; }).length;
      if (al.length === 0) { end = true; }
      else if (al.length === 1 && (!edges || (M.t >= 60 && M.t - Math.max(M.lastOutT, 60) > 9))) { end = true; win = al[0].i; }
      if (M.t > 300) { end = true; win = al.length === 1 ? al[0].i : -1; }
    } else if (M.mode === 'hold') {
      var tg = HOLD_TARGET[M.level];
      for (var s in M.hold) if (M.hold[s] >= tg) { end = true; win = Number(s); }
      if (!end && M.t > 420) { end = true; var best = -1, bv = -1; for (var s2 in M.hold) if (M.hold[s2] > bv) { bv = M.hold[s2]; best = Number(s2); } win = best; }
      M.winSide = win;
      if (end && !M.teams) win = win; else if (end) { var w2 = M.P.find(function (p) { return p.team === win; }); win = w2 ? w2.i : -1; }
    } else if (M.mode === 'stage') {
      var humans = M.P.filter(function (p) { return p.human; });
      if (humans.every(function (p) { return !p.alive; })) { end = true; win = -1; M.stageFail = 'caught'; }
      else if (M.timeUp) { end = true; win = -1; M.stageFail = 'time'; }
      else if (M.stage.boss ? (M.boss && !M.boss.alive) : M.stageDone) { end = true; win = humans[0].i; M.stageClear = true; }
    }
    if (!end) return;
    M.state = 'end'; M.endT = M.mode === 'battle' && !M.matchOverSoon ? 2.4 : 2.0; M.roundWinner = win;
    M.P.forEach(function (p) { if (M.stats[p.i]) M.stats[p.i].rounds++; });
    if (win >= 0) M.wins[win]++;
    if (M.mode !== 'battle' || (win >= 0 && M.wins[win] >= M.need)) { M.done = true; M.winner = win; ev(M, 'matchend', {winner: win}); }
    if (win >= 0 && M.P[win]) M.P[win].act = {k: 'win', t: 0};
    ev(M, 'roundend', {winner: win, round: M.round});
  }
  function nextRound(M) { if (M.done) return; newRound(M); }
  function takeEvents(M) { var e = M.ev; M.ev = []; return e; }
  function scoreFor(M, i) { var s = M.stats[i] || mkStats(); var sc = M.wins[i] * 500 + s.catches * 120 + s.bots * 60 + s.blocks * 5 + s.chains * 40 + s.comebacks * 150 + Math.round(s.hold) * 10; if (M.level === 5) sc *= 3; return Math.round(sc); }
  function starsFor(M, i) {
    if (M.mode !== 'stage' || !M.stageClear) return 0; var p = M.P[i], par = M.stage.boss ? 75 : 90 + M.stage.n * 10;
    var st = 1; if (p && p.lives >= M.L.lives) st = 2; if (st === 2 && M.t <= par) st = 3; return st;
  }
  // robot-vs-robot game for tests (every seat is an autopilot)
  function simulate(opts, maxT) {
    var o = Object.assign({}, opts); o.players = (o.players || []).map(function (s) { return Object.assign({}, s, s.human ? {auto: true} : {}); });
    var M = newMatch(o), t = 0; maxT = maxT || 900;
    while (!M.done && t < maxT) { step(M, DT); t += DT; if (M.ev.length > 400) M.ev = []; }
    return M;
  }
  return {DT: DT, LEVELS: LEVELS, POWERS: POWERS, CAP: CAP, HOLD_TARGET: HOLD_TARGET, BOSSES: BOSSES, STAGE_FOES: STAGE_FOES, DIRS: DIRS,
    newMatch: newMatch, newRound: newRound, step: step, setCtrl: setCtrl, press: press, takeEvents: takeEvents, simulate: simulate, scoreFor: scoreFor, starsFor: starsFor,
    blastCells: blastCells, dangerMap: dangerMap, bombAt: bombAt, itemAt: itemAt, idx: idx, solid: solid, free: free, plant: plant, skill: skill, explode: explode, hit: hit,
    applyPower: applyPower, setHold: setHold, hitBomb: hitBomb, carriedBy: carriedBy, alivePlayers: alivePlayers, ringCells: ringCells, startSudden: startSudden, spawnPts: spawnPts, mkRng: mkRng, moveAxis: moveAxis, trapLock: trapLock, edgeThrow: edgeThrow};
})();
// ENGINE END
