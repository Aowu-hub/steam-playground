
// ===== SlaBrall ENGINE (pure logic, no DOM) — pasted into SlaBrall.html between ENGINE START/END =====
// ENGINE START
var SB = (function () {
  'use strict';
  var G = 14;            // gravity (game units / s²)
  var SIDE_ACC = 5.5;    // curve acceleration per unit of side spin
  var DT = 1 / 120;

  // ---------- sports ----------
  var SPORTS = {
    slashot: { id: 'slashot', name: 'SlaShot', icon: '🏒', kind: 'puck', Lh: 9, Wh: 5.2, goal: 2.3, malletR: 0.72, puckR: 0.42,
      scoring: 'goals', targets: [5, 5, 7, 7, 7, 7], V: 13, about: 'Table hockey — slide your paddle anywhere on your half, forward and back. Score in the goal!' },
    slapoof: { id: 'slapoof', name: 'SlaPoof', icon: '🥒', kind: 'ball', Lh: 9, Wh: 4.6, net: 0.85, kitchen: 2.1, twoBounce: true,
      scoring: 'rally', targets: [7, 7, 11, 11, 11, 11], V: 10.5, serve: 'under', reach: 1.35, about: 'Underhand serve. The ball bounces once on each side first. No volley in the 🥒 kitchen by the net!' },
    slaball: { id: 'slaball', name: 'SlaBall', icon: '🎾', kind: 'ball', Lh: 11, Wh: 5, net: 0.9, serveLock: true,
      scoring: 'tennis', targets: [2, 2, 3, 3, 4, 3], V: 13, reach: 1.45, about: 'Tennis! Serve, one bounce allowed. Points go 15 · 30 · 40 · game.' },
    slapong: { id: 'slapong', name: 'SlaPong', icon: '🏓', kind: 'ball', Lh: 6.5, Wh: 3.7, net: 0.5, table: true, mustBounce: true, pongServe: true,
      scoring: 'pong', targets: [7, 7, 11, 11, 11, 11], V: 8.6, reach: 1.3, standMin: -2.6, about: 'Ping-pong! The serve bounces on your side first. Every ball must bounce once on the table. Serve swaps every 2 points.' },
    // 🏸 sb2-2 badminton: no bounce at all, the shuttle has air drag (fast hit, slow drop)
    slabam: { id: 'slabam', name: 'SlaBam', icon: '🏸', kind: 'shuttle', Lh: 6.7, Wh: 3.05, net: 1.55, noBounce: true, drag: 0.2, shortLine: 1.98,
      scoring: 'rally', targets: [7, 7, 11, 11, 15, 11], V: 18, reach: 1.6, serve: 'under', noPowers: ['broken', 'splorf', 'wall'],
      about: 'Badminton! Fast hit, slow drop: the shuttle shoots off the racket, then floats down. It must never touch the floor on your side.' },
    // 🧱 sb2-2 squash room (was padel): one shared floor, 4 walls, no net — players take turns
    slawall: { id: 'slawall', name: 'SlaWall', icon: '🧱', kind: 'ball', Lh: 5, Wh: 3.2, squash: true, walls: true, wallH: 4.6,
      scoring: 'rally', targets: [7, 7, 9, 11, 11, 11], V: 12, reach: 1.45, noPowers: ['wall', 'smallgoal', 'broken', 'splorf', 'mirage', 'split'],
      about: 'Squash room! No net — hit the ball at ANY wall. It may bounce on the floor once, then it is the other player\'s turn. Two bounces = point.' }
  };
  var SPORT_ORDER = ['slashot', 'slapoof', 'slaball', 'slapong', 'slabam', 'slawall'];

  // ---------- levels (robot) ----------
  var LEVELS = [
    { name: 'Basic',        speed: 4.4, react: 0.42, err: 1.25, miss: 0.16, smart: 0,   power: 0, autoSwing: true,  vMul: 0.78 },
    { name: 'Junior',       speed: 5.0, react: 0.34, err: 1.0,  miss: 0.11, smart: 0.15, power: 0, autoSwing: true,  vMul: 0.86 },
    { name: 'Intermediate', speed: 5.8, react: 0.26, err: 0.75, miss: 0.07, smart: 0.35, power: 0.5, autoSwing: false, vMul: 0.94 },
    { name: 'Hard',         speed: 6.6, react: 0.19, err: 0.55, miss: 0.045, smart: 0.6, power: 0.8, autoSwing: false, vMul: 1.0, timing: true },
    { name: 'Extreme',      speed: 7.4, react: 0.13, err: 0.38, miss: 0.025, smart: 0.8, power: 1, autoSwing: false, vMul: 1.08, timing: true },
    { name: 'Hardcore',     speed: 8.1, react: 0.09, err: 0.28, miss: 0.012, smart: 1,  power: 1, autoSwing: false, vMul: 1.14, timing: true, hardcore: true }
  ];

  // ---------- shots ----------
  var SHOTS = {
    // st-1 one depth table for every net sport (share of the other half): smash mid→end, slice mid near the net, lob end court, drop just over the net
    normal: { depth: 0.68, speed: 1.0,  top: 0.15, label: 'Normal' },
    smash:  { depth: 0.66, speed: 1.75, top: 0.35, label: '💥 Smash', straight: true },
    drop:   { depth: 0.14, speed: 0.55, top: -0.55, label: '🪶 Drop' },
    lob:    { depth: 0.93, speed: 0.5,  top: 0.25, label: '🌈 Lob', lob: true },
    slice:  { depth: 0.36, speed: 0.82, top: -0.85, label: '🔪 Slice' }
  };

  // ---------- powers (14) ----------
  var POWERS = {
    big:      { tier: 0, icon: '🏓', name: 'Big Paddle',   gentle: true, about: 'Your paddle is much bigger for 10 s' },
    slowmo:   { tier: 0, icon: '🐢', name: 'Slow-mo',      gentle: true, about: 'The ball slows down on your side for 6 s' },
    magnet:   { tier: 0, icon: '🧲', name: 'Magnet Paddle', gentle: true, about: 'The ball bends toward your paddle for 3 returns' },
    wall:     { tier: 0, icon: '🧱', name: 'Buddy Wall',   gentle: true, about: 'A wall on your back line blocks 1 ball' },
    double:   { tier: 1, icon: '⚽', name: 'Double Ball',  gentle: true, about: 'A 2nd ball until one scores' },
    smallgoal:{ tier: 1, icon: '🥅', name: 'Smaller Goal', gentle: true, about: 'Your court / goal shrinks for 10 s — harder for them to hit it' },
    mirage:   { tier: 1, icon: '🎭', name: 'Mirage Slice', about: 'Looks like a Legendary… then brakes hard and drops short' },
    broken:   { tier: 1, icon: '💔', name: 'Broken Spin',  about: 'Extreme backspin — after it bounces the ball kicks back toward the net' },
    splorf:   { tier: 1, icon: '🌊', name: 'Tidal Splorf', about: 'Extreme topspin — dives down, SPLORF, then shoots forward low and fast' },
    ghost:    { tier: 1, icon: '👻', name: 'Ghost Ball',   about: 'The ball turns invisible in the air — watch the shadow!' },
    mirror:   { tier: 1, icon: '🪞', name: 'Mirror Mix',   about: "The other side's left and right swap for 5 s" },
    legend:   { tier: 2, icon: '⭐', name: 'Legendary Shot', about: 'A golden blast — only a perfect-timed hit sends it back' },
    elemental:{ tier: 2, icon: '🌋', name: 'Elemental Trail', about: 'Your next 3 hits leave Court Chaos patches on their side' },
    split:    { tier: 2, icon: '✂️', name: 'Triple Split', about: 'The ball splits into 3 — only the one with a shadow is real' }
  };
  var POWER_KEYS = Object.keys(POWERS);
  var ELEMENTS = {
    fire:    { icon: '🔥', col: '#ff6a2b', name: 'Fire' },
    ice:     { icon: '🧊', col: '#8fe3ff', name: 'Ice' },
    puddle:  { icon: '💧', col: '#3d8bff', name: 'Puddle' },
    wind:    { icon: '🌪️', col: '#c9d6e3', name: 'Wind' },
    thunder: { icon: '⚡', col: '#ffe14a', name: 'Thunder' },
    vines:   { icon: '🌿', col: '#3fbf5a', name: 'Vines' },
    rocks:   { icon: '🪨', col: '#9b8a7a', name: 'Rocks' }
  };
  var ORB_AT = [6, 10, 15];

  // ---------- rng ----------
  function mkRng(seed) {
    var s = (seed >>> 0) || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sgn(v) { return v < 0 ? -1 : 1; }

  // ---------- match ----------
  // opts: {sport, level, players:[{name, side, human, ctrl}], powers:true, theme, seed}
  function newMatch(opts) {
    var sp = SPORTS[opts.sport] || SPORTS.slaball;
    var lv = LEVELS[clamp(opts.level | 0, 0, 5)];
    var M = {
      sp: sp, lv: lv, level: clamp(opts.level | 0, 0, 5), t: 0, rnd: mkRng(opts.seed || (Date.now() & 0xffffff)),
      powersOn: opts.powers !== false, theme: opts.theme || 'classic',
      players: [], balls: [], patches: [], fx: [], events: [], orb: null,
      score: { pts: [0, 0], games: [0, 0], serveSide: 0, serveCount: 0, done: false, winner: -1, hcLost: 0 },
      side: [mkSide(), mkSide()], rally: 0, state: 'serve', stateT: 0, pointWho: -1, msg: '',
      stats: [mkStats(), mkStats()], target: opts.target || sp.targets[clamp(opts.level | 0, 0, 5)]
    };
    (opts.players || []).forEach(function (p, i) {
      var side = p.side | 0;
      var mates = M.players.filter(function (q) { return q.side === side; }).length;
      M.players.push({
        i: i, name: p.name || ('P' + (i + 1)), side: side, human: !!p.human, robot: !p.human,
        x: 0, y: 0, vx: 0, vy: 0, lane: 0, slot: mates, swing: 0, swingShot: 'normal', face: 1,
        queued: null, queuedT: -9, power: null, big: 0, stun: 0, mirror: 0, magnet: 0, wallBuddy: 0,
        ai: { tx: 0, ty: 0, think: 0, plan: null, shot: 'normal' }, input: { x: 0, y: 0 }, drag: null,
        av: p.av || null, racket: p.racket || null, hits: 0, cheer: 0, sad: 0
      });
    });
    // doubles lanes
    [0, 1].forEach(function (s) {
      var team = M.players.filter(function (p) { return p.side === s; });
      team.forEach(function (p, k) { p.lane = team.length > 1 ? (k === 0 ? -1 : 1) : 0; });
    });
    M.score.serveSide = 0;
    resetPositions(M);
    if (sp.kind === 'puck') startFaceoff(M, 0); else setupServe(M);
    return M;
  }
  function mkSide() { return { slow: 0, shrink: 0, legendNext: 0, nextShot: null, elemental: 0 }; }
  function mkStats() { return { rally: 0, smash: 0, aces: 0, perfect: 0, powers: 0, legend: 0, points: 0, hits: 0, goals: 0, splorf: 0, jumps: 0, jumpHits: 0, jumpPerfect: 0, dives: 0, diveSaves: 0 }; }

  function dirOf(side) { return side === 0 ? 1 : -1; }     // side 0 is at x<0 and hits toward +x
  function courtW(M, side) { return M.sp.Wh * (M.side[side].shrink > 0 ? 0.68 : 1); }
  function courtL(M, side) { return M.sp.Lh * (M.side[side].shrink > 0 ? 0.8 : 1); }
  function goalHalf(M, side) { return M.sp.goal * (M.side[side].shrink > 0 ? 0.6 : 1); }

  function fwdOf(M, p) { return M.sp.squash ? 1 : dirOf(p.side); }   // sb2-2: in the squash room everyone faces the front wall (+x)
  function homeOf(M, p) {
    var sp = M.sp, s = -dirOf(p.side);
    if (sp.noBounce) return { x: s * sp.Lh * 0.5, y: p.lane * sp.Wh * 0.5 };   // 🏸 mid-court
    if (sp.squash) return { x: p.lane < 0 ? -sp.Lh * 0.5 : p.lane > 0 ? -sp.Lh * 0.05 : -sp.Lh * 0.3, y: (p.side === 0 ? -1 : 1) * sp.Wh * 0.4 };
    if (sp.kind === 'puck') return { x: s * sp.Lh * 0.72, y: p.lane * sp.Wh * 0.45 };
    var depth = sp.table ? sp.Lh + 1.0 : sp.Lh * 0.92;
    if (sp.twoBounce || sp.walls) depth = sp.Lh * 0.82;
    return { x: s * depth, y: p.lane * sp.Wh * 0.5 };
  }
  function resetPositions(M) {
    M.players.forEach(function (p) { var h = homeOf(M, p); p.x = h.x; p.y = h.y; p.vx = p.vy = 0; p.swing = 0; });
  }
  function limits(M, p) {
    var sp = M.sp, s = -dirOf(p.side);   // s = -1 left, +1 right
    if (sp.kind === 'puck') {
      var r = sp.malletR;
      return { x0: s < 0 ? -sp.Lh + r : 0.35 + r, x1: s < 0 ? -0.35 - r : sp.Lh - r, y0: -sp.Wh + r, y1: sp.Wh - r };
    }
    if (sp.squash) return { x0: -sp.Lh + 0.4, x1: sp.Lh - 0.6, y0: -sp.Wh + 0.35, y1: sp.Wh - 0.35 };
    var near = sp.table ? sp.Lh + (sp.standMin || 0.5) : 0.6;
    var far = sp.table ? sp.Lh + 3.6 : sp.Lh + (sp.walls ? 0.2 : 3.0);
    var wy = sp.Wh + (sp.walls ? -0.2 : (sp.table ? 2.6 : 2.2));
    return s < 0 ? { x0: -far, x1: -near, y0: -wy, y1: wy } : { x0: near, x1: far, y0: -wy, y1: wy };
  }
  function moveSpeed(M, p) {
    var base = p.robot ? M.lv.speed : 7.2;
    if (M.sp.table) base *= 0.8;
    if (M.sp.kind === 'puck' && p.robot) base *= 0.62 + 0.38 * M.lv.smart;
    var pt = patchAt(M, p.x, p.y);
    if (pt && pt.el === 'vines') base *= 0.5;
    if (p.robot && p.mirror > 0) base *= 0.7;
    return base;
  }
  function reachOf(M, p) {
    var r = M.sp.kind === 'puck' ? M.sp.malletR : (M.sp.reach || 1.4);
    return (p.big > 0 ? r * 1.6 : r) * (p.lunge > 0 ? 1.9 : 1);   // 🏒 le-1 a SlaShot dive stretches the mallet
  }

  // ---------- balls ----------
  function mkBall(M, x, y, z) {
    return { x: x, y: y, z: z, vx: 0, vy: 0, vz: 0, top: 0, side: 0, owner: -1, b: [0, 0], live: true, real: true,
      serve: false, pongServeBounce: false, hits: 0, by: -1, kind: null, t0: 0, flight: 1, ghost: false, braked: false,
      wallHit: false, trail: [], id: (M._bid = (M._bid || 0) + 1), magnetSide: -1, buddyUsed: false, elem: null, out: false };
  }

  function setupServe(M) {
    var sp = M.sp, s = M.score.serveSide;
    M.balls = []; M.rally = 0; M.orb = null; M.state = 'serve'; M.stateT = 0;
    M.players.forEach(function (p) { p.swing = 0; });
    resetPositions(M);
    var server = serverOf(M);
    var b = mkBall(M, server.x + fwdOf(M, server) * 0.5, server.y, sp.table ? 0.55 : 1.0);
    b.held = server.i; b.owner = -1;
    M.balls.push(b);
    M.server = server.i;
  }
  function serverOf(M) {
    var team = M.players.filter(function (p) { return p.side === M.score.serveSide; });
    if (!team.length) return M.players[0];
    var k = Math.floor(M.score.serveCount / (M.sp.scoring === 'pong' ? 2 : 1)) % team.length;
    return team[k] || team[0];
  }

  function startFaceoff(M, toSide) {
    var sp = M.sp;
    M.balls = []; M.rally = 0; M.orb = null; M.state = 'play'; M.stateT = 0;
    resetPositions(M);
    var b = mkBall(M, -dirOf(toSide) * sp.Lh * 0.32, 0, 0);
    b.vx = 0; b.vy = 0; b.owner = 1 - toSide;
    M.balls.push(b);
  }

  // serve: called when the server presses a shot (or the robot decides)
  function doServe(M, shot) {
    if (M.state !== 'serve') return false;
    var b = M.balls[0]; if (!b || b.held == null) return false;
    var p = M.players[b.held], sp = M.sp, d = dirOf(p.side);
    b.held = null; b.owner = p.side; b.by = p.i; b.serve = true; b.b = [0, 0]; b.hits = 0;
    b.x = p.x + d * 0.4; b.y = p.y; b.z = sp.table ? 0.45 : (sp.serve === 'under' ? 0.6 : 1.9);
    var r = M.rnd, lw = courtW(M, 1 - p.side);
    var ty = clamp((-p.y * 0.6) + (r() - 0.5) * lw * 0.9, -lw * 0.75, lw * 0.75);
    var V = sp.V * M.lv.vMul * (p.robot ? 1 : 0.95);
    if (sp.squash) {
      // 🧱 serve at the FRONT wall, to the other player's half; it comes back to them
      var fy = -sgn(p.y || 0.01) * sp.Wh * (0.15 + r() * 0.3), fz = 2.1 + r() * 0.7;
      b.x = p.x + 0.4; b.z = 1.0; b.fb = 0;
      var sdx = sp.Lh - b.x, sdy = fy - b.y, sdd = Math.sqrt(sdx * sdx + sdy * sdy), sT = sdd / (V * 0.75);
      b.vx = sdx / sT; b.vy = sdy / sT; b.vz = (fz - b.z + 0.5 * G * sT * sT) / sT; b.top = 0; b.side = 0;
    } else if (sp.pongServe) {
      // first bounce on own side, then over the net: search a speed that works
      var z0 = b.z, best = null;
      for (var vx = V * 0.55; vx <= V * 1.2 && !best; vx += V * 0.05) {
        for (var f2 = 0.75; f2 >= 0.35 && !best; f2 -= 0.05) {
          var x2 = d * sp.Lh * f2;
          var vi;  // impact speed at the first bounce
          // try first-bounce spots on own side
          for (var f1 = 0.7; f1 >= 0.2; f1 -= 0.05) {
            var x1 = -d * sp.Lh * f1, T2 = Math.abs(x2 - x1) / vx, vzUp = 0.5 * G * T2;
            vi = vzUp / 0.86;
            var T1 = Math.abs(x1 - b.x) / vx;
            var vz0 = (0 - z0 + 0.5 * G * T1 * T1) / T1;
            if (Math.abs((vz0 - G * T1) + vi) > 0.6) continue;
            var tn = Math.abs(x1) / vx, zn = vzUp * tn - 0.5 * G * tn * tn;
            if (zn < sp.net + 0.12) continue;
            best = { vx: vx, vz0: vz0, T1: T1, x1: x1 }; break;
          }
        }
      }
      if (!best) { var T1b = 0.5; best = { vx: V * 0.8, vz0: (0 - z0 + 0.5 * G * T1b * T1b) / T1b, T1: T1b }; }
      b.vx = d * best.vx; b.vy = (ty * 0.5 - b.y) / (best.T1 * 3); b.vz = best.vz0;
      b.pongServeBounce = true; b.top = 0; b.side = 0;
    } else {
      var minX = sp.twoBounce ? sp.kitchen + 0.8 : 1.2;
      var maxX = sp.serveLock ? courtL(M, 1 - p.side) * 0.62 : courtL(M, 1 - p.side) * 0.8;
      var tx = d * (minX + (maxX - minX) * (0.45 + r() * 0.45));
      aimBall(M, b, tx, ty, V * (sp.serve === 'under' ? 0.85 : 1.05), sp.serve === 'under' ? 0.1 : 0.35, 0);
    }
    b.t0 = M.t; p.swing = 1; p.swingShot = shot || 'normal'; M.state = 'play'; M.stateT = 0;
    M.events.push({ k: 'serve', side: p.side, p: p.i });
    M.lastServeSide = p.side; M.receiverTouched = false;
    return true;
  }

  // compute a velocity so the ball lands at (tx,ty) — clears the net
  // 🏸 sb2-2 shuttle flight (gravity + air drag) — used by the aim search, predictions and the page
  function flyShuttle(M, x, y, z, vx, vy, vz, maxT) {
    var sp = M.sp, h = 1 / 60, t = 0, netOk = true, k = sp.drag;
    while (t < (maxT || 6)) {
      vz -= G * h; var v = Math.sqrt(vx * vx + vy * vy + vz * vz), f = 1 / (1 + k * v * h); vx *= f; vy *= f; vz *= f;
      var ox = x; x += vx * h; y += vy * h; z += vz * h; t += h;
      if ((ox < 0) !== (x < 0) && z < sp.net + 0.15) netOk = false;
      if (z <= 0) break;
    }
    return { x: x, y: y, t: t, netOk: netOk };
  }
  function aimShuttle(M, b, tx, ty, speed) {
    var dx = tx - b.x, dy = ty - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d, best = null;
    var sMax = b.shotKind === 'lob' ? Math.max(speed * 2.4, 32) : speed * 2.4;   // st-1 a 🌈 clear to the back needs a really big hit
    for (var s = speed * 0.45; s <= sMax; s *= 1.1) for (var el = -0.65; el <= 1.4; el += 0.07) {
      var vh = s * Math.cos(el), vz = s * Math.sin(el), res = flyShuttle(M, b.x, b.y, b.z, ux * vh, uy * vh, vz);
      if (!res.netOk) continue;
      var err = Math.sqrt((res.x - tx) * (res.x - tx) + (res.y - ty) * (res.y - ty)) + Math.abs(s - speed) * 0.06, kind = b.shotKind;
      // st-1 shape: 💥 smash = straight / down (no arc) · 🌈 lob = high · 🔪 slice = flat · 🪶 drop = a soft little arc
      if (kind === 'smash') err += Math.max(0, el + 0.05) * 6; else if (kind === 'lob') err += Math.max(0, 0.5 - el) * 2; else if (kind === 'slice') err += Math.max(0, el - 0.25) * 3; else if (kind === 'drop') err += Math.max(0, el - 0.7) * 2;
      if (!best || err < best.err) best = { err: err, vx: ux * vh, vy: uy * vh, vz: vz, T: res.t };
    }
    if (!best) best = { vx: ux * speed * 0.4, vy: uy * speed * 0.4, vz: speed * 0.8, T: 1.5 };
    b.vx = best.vx; b.vy = best.vy; b.vz = best.vz; b.top = 0; b.side = 0; b.flight = best.T;
    return best.T;
  }
  function aimBall(M, b, tx, ty, speed, top, side) {
    var sp = M.sp;
    if (sp.drag) return aimShuttle(M, b, tx, ty, speed);
    b.top = top; b.side = side;
    var dx = tx - b.x, dy = ty - b.y, dist = Math.sqrt(dx * dx + dy * dy);
    var T = Math.max(0.35, dist / Math.max(2, speed));
    var ge = G * (1 + 0.45 * top), ay = side * SIDE_ACC;
    if (b.shotKind === 'smash' && b.z > 0.5) { var Tf = Math.sqrt(2 * b.z / ge) * 1.05; if (dist / Tf <= speed * 1.6) T = Math.min(T, Math.max(0.3, Tf)); }   // st-1 💥 a smash flies straight (down), no arc
    for (var k = 0; k < 40; k++) {
      var vx = dx / T, vy = (dy - 0.5 * ay * T * T) / T, vz = (0 - b.z + 0.5 * ge * T * T) / T;
      var ok = true;
      if (sp.net && (b.x < 0) !== (tx < 0)) {
        var tn = -b.x / vx;
        if (tn > 0 && tn < T) {
          var zn = b.z + vz * tn - 0.5 * ge * tn * tn;
          if (zn < sp.net + 0.35) ok = false;
        }
      }
      if (sp.walls && vz * vz / (2 * ge) + b.z > sp.wallH * 1.6) ok = ok; // high lobs fine
      if (ok) { b.vx = vx; b.vy = vy; b.vz = vz; b.flight = T; return T; }
      T *= 1.07;
    }
    b.vx = dx / T; b.vy = dy / T; b.vz = (0 - b.z + 0.5 * ge * T * T) / T; b.flight = T;
    return T;
  }

  // ---------- hitting ----------
  function canHit(M, p, b) {
    var sp = M.sp;
    if (b.held != null || !b.live) return false;
    if (sp.squash) return b.owner !== p.side && (b.fb || 0) < 2 && (b.wallHit || (b.fb || 0) > 0 || b.owner < 0) && b.z <= 3.9 && b.z >= -0.05;   // 🧱 your turn = the other team hit it last + it touched a wall (or the floor) first
    if (b.owner === p.side) return false;
    var onSide = p.side === 0 ? b.x < 0 : b.x > 0;
    if (!onSide) return false;
    if (sp.kind === 'puck') return true;
    if (b.pongServeBounce) return false;
    if (sp.mustBounce && b.b[p.side] < 1) return false;
    if (sp.serveLock && b.serve && b.b[p.side] < 1) return false;
    if (sp.twoBounce && b.hits < 2 && b.b[p.side] < 1) return false;
    if (b.z > 3.9 || b.z < -0.05) return false;   // sb2-3: high balls are for a 🦘 jump smash
    if (b.wallFault) return false;
    return true;
  }
  function paddlePos(M, p) {
    // paddle sits a little toward the net and toward the racket hand
    var d = fwdOf(M, p);
    return { x: p.x + d * 0.35, y: p.y };
  }

  function wantShot(M, p) {
    if (p.robot) return p.ai.shot || 'normal';
    if (p.queued && M.t - p.queuedT < 0.55) return p.queued;
    return null;
  }

  // 🧱 sb2-2 squash: the stick / keys at the hit = the DIRECTION the ball flies (any wall); robots aim at the front wall, sometimes a side wall
  function squashDir(M, p) {
    var sp = M.sp, r = M.rnd;
    if (p.human && !p.auto) { var ix = p.input.x || 0, iy = p.input.y || 0, m = Math.sqrt(ix * ix + iy * iy); if (m > 0.3) return { x: ix / m, y: iy / m }; }
    var opp = M.players.filter(function (q) { return q.side !== p.side; })[0], tx = sp.Lh, ty;
    if (p.robot && r() < 0.12 + 0.25 * M.lv.smart) { ty = (r() < 0.5 ? -1 : 1) * sp.Wh; tx = p.x + (sp.Lh - p.x) * (0.45 + 0.4 * r()); }
    else ty = (opp ? -sgn(opp.y || 0.01) : (r() < 0.5 ? -1 : 1)) * sp.Wh * (0.2 + 0.6 * r()) + (p.robot ? (r() - 0.5) * M.lv.err * 1.5 : 0);
    var dx = tx - p.x, dy = ty - p.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dx / d, y: dy / d };
  }
  var SQUASH_VZ = { normal: 3.4, smash: 0.9, drop: 2.3, lob: 7.2, slice: 2.4 };
  function hitSquash(M, p, b) {
    var sp = M.sp, r = M.rnd, J = M._jump, picked = J === 'v' ? 'smash' : J === 'h' ? 'lob' : wantShot(M, p), shot = picked || 'normal';
    var perfect = !!(picked && p.human && M.t - p.queuedT < 0.22), weak = !!(M.lv.timing && p.human && !picked);
    if (p.robot && r() < M.lv.smart * 0.5) perfect = true;
    if (b.kind === 'legend') {
      var lok = p.human ? perfect : (r() < (M.level >= 5 ? 0.55 : M.level >= 3 ? 0.35 : 0.2));
      if (!lok) { b.legendMiss = p.i; p.swing = 1; p.swingShot = 'normal'; M.events.push({ k: 'legendmiss', p: p.i }); return false; }
    }
    var S = SHOTS[shot], V = (p.human ? sp.V * (0.86 + 0.14 * Math.min(1, M.level / 3)) : sp.V * M.lv.vMul) * (perfect ? 1.12 : 1) * (weak ? 0.86 : 1);
    if (J === 'v') V *= perfect ? 1.3 : 1.16;
    var dir = J === 'h' ? { x: 1, y: (r() - 0.5) * 0.5 } : squashDir(M, p), hs = V * S.speed * 0.8, vz = SQUASH_VZ[shot] || 3.4;
    if (shot === 'lob') hs = Math.min(hs, V * 0.5);
    var nx = M.side[p.side].nextShot;
    b.kind = null; b.ghost = false; b.braked = false; b.legendMiss = null;
    if (nx) { M.side[p.side].nextShot = null; b.kind = nx; if (nx === 'legend') { hs = V * 1.6; vz = 2; } if (nx === 'ghost') b.ghost = true; M.events.push({ k: 'special', kind: nx, side: p.side, p: p.i }); }
    vz += b.z < 0.5 ? 0.6 : 0;
    var apex = b.z + vz * vz / (2 * G); if (vz > 0 && apex > sp.wallH - 0.5) vz = Math.sqrt(Math.max(0, 2 * G * (sp.wallH - 0.5 - b.z)));   // never over the red line by itself
    var jFail = J === 'v' && r() < jumpFail(M, p, perfect); if (jFail) vz = 9.5;   // 🦘 too wild: over the red line
    b.vx = dir.x * hs; b.vy = dir.y * hs; b.vz = vz; b.top = S.top * 0.3; b.side = 0; b.jr = null; b.diveMiss = null;
    b.owner = p.side; b.by = p.i; b.b = [0, 0]; b.fb = 0; b.hits++; b.serve = false; b.t0 = M.t; b.wallHit = false; b.wallFault = false;
    if (M.side[p.side].elemental > 0) { b.elem = pickElement(M); M.side[p.side].elemental--; } else b.elem = null;
    p.swing = 1; p.swingShot = shot; p.queued = null; p.hits++;
    M.rally++; M.stats[p.side].hits++;
    if (M.rally > M.stats[p.side].rally) M.stats[p.side].rally = M.rally;
    if (M.rally > M.stats[1 - p.side].rally) M.stats[1 - p.side].rally = M.rally;
    if (shot === 'smash') M.stats[p.side].smash++;
    if (perfect) M.stats[p.side].perfect++;
    if (p.side !== M.lastServeSide) M.receiverTouched = true;
    M.events.push({ k: 'hit', p: p.i, side: p.side, shot: shot, perfect: perfect, weak: weak, rally: M.rally, jump: J || null });
    if (J) jumpEvent(M, p, J, !jFail, perfect);
    checkOrb(M);
    return true;
  }
  // 🦘🤸 sb2-3 jumps: ONE shot button does both — a ball high above you = vertical jump SMASH, a ball just out of reach to the side = DIVE save (always a lob).
  // People: you jump / dive when you pressed a shot button just before (0.55 s). Robots: from Intermediate, a roll per ball. Fail % grows with the level (10 % Basic → 25 % Hardcore), less on a PERFECT.
  var JUMP_AIR = 0.55, JUMP_STAND = 0.85, DIVE_T = 0.8;
  function wantJump(M, p, b, kind) {
    if (p.robot || p.auto) {
      if (p.robot && M.level < 2) return false;
      if (M.t - (p.lastJump || -99) < 30) return false;   // a robot jumps / dives at most every 30 s — rare = special
      b.jr = b.jr || {}; var key = p.i + kind;
      if (b.jr[key] == null) b.jr[key] = M.rnd() < (kind === 'v' ? 0.06 + 0.14 * M.lv.smart : 0.05 + 0.12 * M.lv.smart);
      if (b.jr[key]) p.lastJump = M.t;
      return b.jr[key];
    }
    return !!(p.queued && M.t - p.queuedT < 0.55);
  }
  // dv-1: does the ball come into your reach by itself in the next moment (its path + where you're moving)? Then no dive — just wait and hit it.
  function willReach(M, p, b, R) {
    var pp = paddlePos(M, p), drag = M.sp.drag || 0, x = b.x, y = b.y, z = b.z, vx = b.vx, vy = b.vy, vz = b.vz, h = 1 / 60;
    for (var t = h; t <= 0.45; t += h) {
      if (drag) { var k = Math.exp(-drag * Math.sqrt(vx * vx + vy * vy + vz * vz) * h * 0.25); vx *= k; vy *= k; vz *= k; }
      vz -= G * h; x += vx * h; y += vy * h; z += vz * h; if (z < 0) { if (M.sp.noBounce) return false; z = -z * 0.5; vz = -vz * 0.6; }
      var px = pp.x + (p.vx || 0) * t * 0.8, py = pp.y + (p.vy || 0) * t * 0.8, ex = x - px, ey = y - py, bx = x - p.x, by = y - p.y;
      if (z <= 2.5 && (ex * ex + ey * ey <= R * R || bx * bx + by * by <= R * R * 1.1)) return true;
    }
    return false;
  }
  function jumpFail(M, p, perfect) { return (0.1 + 0.03 * M.level) * (perfect ? 0.45 : 1); }
  function hitBall(M, p, b, perfectWindow) {
    if (M.sp.squash) return hitSquash(M, p, b);
    var sp = M.sp, d = dirOf(p.side), r = M.rnd, oside = 1 - p.side, J = M._jump;
    var picked = J === 'v' ? 'smash' : J === 'h' ? 'lob' : wantShot(M, p), shot = picked || 'normal';
    if (shot === 'smash' && b.z < 1.15 && sp.kind !== 'puck') shot = 'normal';
    var timing = M.lv.timing && p.human;
    var perfect = false, weak = false;
    if (picked && p.human && M.t - p.queuedT < 0.22) perfect = true;
    if (timing && !picked) weak = true;
    if (p.robot && r() < M.lv.smart * 0.5) perfect = true;
    // Legendary ball: only a perfect hit sends it back
    if (b.kind === 'legend' && !b.braked) {
      var ok = p.human ? perfect : (r() < (M.level >= 5 ? 0.55 : M.level >= 3 ? 0.35 : 0.2));
      if (!ok) { b.legendMiss = p.i; p.swing = 1; p.swingShot = 'normal'; M.events.push({ k: 'legendmiss', p: p.i }); return false; }
    }
    var S = SHOTS[shot], V = sp.V * M.lv.vMul;
    if (p.human) V = sp.V * (0.86 + 0.14 * Math.min(1, M.level / 3));
    if (perfect) V *= 1.12;
    if (weak) V *= 0.86;
    if (J === 'v') V *= perfect ? 1.3 : 1.16;   // 🦘 extreme smash
    // spin from how you move into the ball
    var ms = moveSpeed(M, p) || 1;
    var fwd = clamp((p.vx * d) / ms, -1, 1), lat = clamp(p.vy / ms, -1, 1);
    var top = S.top + (shot === 'normal' ? fwd * 0.8 : fwd * 0.3);
    var side = shot === 'smash' ? 0 : lat * 0.7;
    if (sp.kind === 'puck') return hitPuck(M, p, b, shot, perfect);
    var lw = courtW(M, oside), ll = courtL(M, oside);
    var aimY;
    if (p.robot) {
      var opp = M.players.filter(function (q) { return q.side === oside; });
      var oy = opp.length ? opp[0].y : 0;
      var away = -sgn(oy) * lw * (0.35 + 0.45 * M.lv.smart);
      aimY = (r() < 0.5 + 0.4 * M.lv.smart ? away : (r() - 0.5) * lw * 1.4) + (r() - 0.5) * M.lv.err * 2.2;
    } else {
      // 🎯 sb2-1: the player AIMS with the stick / keys held at the hit — sideways = left / right, forward / back = deep / short
      var off = clamp((b.y - p.y) / reachOf(M, p), -1, 1), am = J === 'h' ? { f: 0, l: (r() - 0.5) * 0.8 } : humanAim(M, p);   // 🤸 a dive can't aim
      aimY = am.l * lw * 0.78 - off * lw * 0.15 + (r() - 0.5) * (weak ? 1.4 : 0.4);
      var aimF = am.f;
    }
    var lim = lw * (weak ? 0.95 : 0.84);
    aimY = clamp(aimY, -lim, lim);
    var depth = S.depth;
    if (p.human && aimF) depth = clamp(depth * (1 + 0.3 * aimF), 0.2, 0.97);   // 🎯 sb2-1 deep / short
    if (sp.twoBounce && shot === 'drop') depth = (sp.kitchen * 0.75) / ll;
    if (sp.table) depth = clamp(depth, 0.18, 0.9);
    var tx = d * clamp(depth * ll + (p.robot ? (r() - 0.5) * M.lv.err * 1.5 : (r() - 0.5) * 0.6), 0.6, ll * 0.95);
    // side spin curves the ball: shift aim so it curves back in
    var spd = V * S.speed;
    var nextSpecial = M.side[p.side].nextShot;
    b.kind = null; b.ghost = false; b.braked = false; b.legendMiss = null;
    if (nextSpecial) {
      M.side[p.side].nextShot = null;
      b.kind = nextSpecial;
      if (nextSpecial === 'legend' || nextSpecial === 'mirage') { spd = V * 1.95; top = 0.4; side = 0; tx = d * ll * 0.8; }
      if (nextSpecial === 'broken') { top = -1.6; spd = V * 0.9; tx = d * ll * 0.55; }
      if (nextSpecial === 'splorf') { top = 1.9; spd = V * 1.25; tx = d * ll * 0.45; }
      if (nextSpecial === 'ghost') { b.ghost = true; }
      if (nextSpecial === 'split') { b.splitPending = true; }
      M.events.push({ k: 'special', kind: nextSpecial, side: p.side, p: p.i });
    }
    if (shot === 'lob' && !sp.drag) { spd = Math.min(spd, V * 0.55); }   // st-1: a shuttle lob needs a big hit to fly deep (the air brakes it)
    b.shotKind = shot; aimBall(M, b, tx, aimY, spd, top, side);
    if (shot === 'lob' && !sp.drag) { b.vz += 2.2; b.vx *= 0.88; b.vy *= 0.88; }
    var jFail = J === 'v' && r() < jumpFail(M, p, perfect);
    if (jFail) { if (r() < 0.5) aimBall(M, b, d * (ll + 2.4), aimY, spd * 1.05, top, 0); else aimBall(M, b, tx, (aimY >= 0 ? 1 : -1) * (lw + 1.8), spd, top, 0); }   // 🦘 too wild: long or wide = out
    b.jr = null; b.diveMiss = null;
    b.owner = p.side; b.by = p.i; b.b = [0, 0]; b.hits++; b.serve = false; b.t0 = M.t; b.wallHit = false; b.wallFault = false;
    if (M.side[p.side].elemental > 0) { b.elem = pickElement(M); M.side[p.side].elemental--; } else b.elem = null;
    if (p.magnet > 0 && b.magnetSide !== p.side) { /* magnet works on balls coming TO the holder */ }
    p.swing = 1; p.swingShot = shot; p.queued = null; p.hits++;
    M.rally++; M.stats[p.side].hits++;
    if (M.rally > M.stats[p.side].rally) M.stats[p.side].rally = M.rally;
    if (M.rally > M.stats[oside].rally) M.stats[oside].rally = M.rally;
    if (shot === 'smash') M.stats[p.side].smash++;
    if (perfect) M.stats[p.side].perfect++;
    if (p.side !== M.lastServeSide) M.receiverTouched = true;
    M.events.push({ k: 'hit', p: p.i, side: p.side, shot: shot, perfect: perfect, weak: weak, rally: M.rally, jump: J || null });
    if (J) jumpEvent(M, p, J, !jFail, perfect);
    checkOrb(M);
    return true;
  }
  function jumpEvent(M, p, kind, ok, perfect) {
    var S = M.stats[p.side]; if (kind === 'v' && ok) S.jumpHits++; if (kind === 'v' && ok && perfect) S.jumpPerfect++; if (kind === 'h' && ok) S.diveSaves++;
    M.events.push({ k: 'jump', kind: kind, p: p.i, side: p.side, ok: ok, perfect: !!perfect, rally: M.rally });
  }

  function hitPuck(M, p, b, shot, perfect) { return false; } // puck uses collisions (see stepPuck)

  function pickElement(M) {
    var byTheme = { dino: ['fire', 'vines', 'rocks'], sea: ['puddle', 'ice', 'wind'], dance: ['thunder', 'fire', 'wind'],
      classic: ['fire', 'ice', 'puddle', 'wind', 'thunder', 'vines', 'rocks'], space: ['ice', 'rocks', 'thunder'], sky: ['wind', 'thunder', 'ice'] };
    var list = byTheme[M.theme] || byTheme.classic;
    return list[Math.floor(M.rnd() * list.length)];
  }

  // ---------- orbs + powers ----------
  function checkOrb(M) {
    if (!M.powersOn || M.orb) return;
    var tier = ORB_AT.indexOf(M.rally);
    if (tier < 0) return;
    var sp = M.sp;
    M.orb = { x: (M.rnd() - 0.5) * sp.Lh * 0.5, y: (M.rnd() - 0.5) * sp.Wh * 1.2, z: sp.kind === 'puck' ? 0 : 1.1 + M.rnd() * 0.6,
      vy: (M.rnd() < 0.5 ? -1 : 1) * 0.9, tier: tier, t: 0 };
    M.events.push({ k: 'orb', tier: tier });
  }
  function rollPower(M, tier) {
    var gentle = M.level <= 1;
    var no = M.sp.noPowers || [];
    var pool = POWER_KEYS.filter(function (k) { return POWERS[k].tier === tier && (!gentle || POWERS[k].gentle) && no.indexOf(k) < 0; });
    if (!pool.length) pool = POWER_KEYS.filter(function (k) { return POWERS[k].gentle && no.indexOf(k) < 0; });
    return pool[Math.floor(M.rnd() * pool.length)];
  }
  function grantOrb(M, side) {
    var o = M.orb; M.orb = null;
    var team = M.players.filter(function (p) { return p.side === side; });
    if (!team.length) return;
    var p = team.filter(function (q) { return !q.power; })[0] || team[0];
    p.power = rollPower(M, o.tier);
    M.events.push({ k: 'gotpower', p: p.i, power: p.power, tier: o.tier });
  }
  function usePower(M, pi) {
    var p = M.players[pi]; if (!p || !p.power || M.score.done) return false;
    var k = p.power, S = M.side[p.side], opp = 1 - p.side;
    p.power = null; M.stats[p.side].powers++;
    switch (k) {
      case 'big': p.big = 10; break;
      case 'slowmo': S.slow = 6; break;
      case 'magnet': p.magnet = 3; break;
      case 'wall': p.wallBuddy = 1; break;
      case 'double': {
        var b0 = M.balls.filter(function (b) { return b.live && b.real && b.held == null; })[0];
        if (b0) { var b2 = JSON.parse(JSON.stringify(b0)); b2.id = ++M._bid; b2.y = -b0.y * 0.6 + (b0.y === 0 ? 1 : 0); b2.vy = -b0.vy; b2.trail = []; M.balls.push(b2); }
        else S.pendingDouble = true;
        break;
      }
      case 'smallgoal': S.shrink = 10; break;
      case 'mirror': M.players.forEach(function (q) { if (q.side === opp) q.mirror = 5; }); break;
      case 'elemental': S.elemental = 3; break;
      default: S.nextShot = k;     // legend, mirage, broken, splorf, ghost, split
    }
    M.events.push({ k: 'power', p: pi, power: k, side: p.side });
    return true;
  }

  function patchAt(M, x, y) {
    for (var i = 0; i < M.patches.length; i++) {
      var q = M.patches[i]; var dx = x - q.x, dy = y - q.y;
      if (dx * dx + dy * dy < q.r * q.r) return q;
    }
    return null;
  }

  // ---------- points ----------
  function pointTo(M, side, why) {
    if (M.state !== 'play') return;
    var sc = M.score, sp = M.sp;
    M.state = 'point'; M.stateT = 0; M.pointWho = side; M.pointWhy = why || '';
    M.stats[side].points++;
    if (why === 'ace') M.stats[side].aces++;
    M.events.push({ k: 'point', side: side, why: why, rally: M.rally });
    M.players.forEach(function (p) { if (p.side === side) p.cheer = 1.4; else p.sad = 1.4; });
    if (M.lv.hardcore && M.players.some(function (p) { return p.human && p.side === 1 - side; }) && M.players.some(function (p) { return p.robot && p.side === side; })) {
      sc.hcLost++;
    }
    if (sp.scoring === 'tennis') {
      sc.pts[side]++;
      var a = sc.pts[side], o = sc.pts[1 - side];
      var noAd = M.level <= 1;
      if (a >= 4 && (a - o >= 2 || (noAd && a > o))) {
        sc.games[side]++; sc.pts = [0, 0];
        M.events.push({ k: 'game', side: side });
        sc.serveSide = 1 - sc.serveSide; sc.serveCount++;
        if (sc.games[side] >= M.target) finish(M, side);
      }
    } else {
      sc.pts[side]++;
      var t = M.target, a2 = sc.pts[side], o2 = sc.pts[1 - side];
      var cap = t + 4;
      if ((a2 >= t && a2 - o2 >= 2) || a2 >= cap) finish(M, side);
      if (sp.scoring === 'pong') {
        sc.serveCount++;
        var every = (sc.pts[0] >= t - 1 && sc.pts[1] >= t - 1) ? 1 : 2;
        if (sc.serveCount % every === 0) sc.serveSide = 1 - sc.serveSide;
      } else if (sp.scoring === 'rally') {
        if (sc.serveSide !== side) { sc.serveSide = side; sc.serveCount++; }
      } else if (sp.scoring === 'goals') {
        sc.serveSide = 1 - side;
      }
    }
    if (M.lv.hardcore && sc.hcLost >= 3 && !sc.done) {
      var robotSide = M.players.filter(function (p) { return p.robot; })[0];
      if (robotSide) finish(M, robotSide.side, 'hardcore');
    }
  }
  function finish(M, side, why) {
    if (M.score.done) return;
    M.score.done = true; M.score.winner = side; M.score.why = why || '';
    M.events.push({ k: 'match', side: side, why: why || '' });
  }
  function pointText(M, side) {
    var sc = M.score;
    if (M.sp.scoring !== 'tennis') return String(sc.pts[side]);
    var a = sc.pts[side], o = sc.pts[1 - side];
    if (a >= 3 && o >= 3) { if (a === o) return '40'; return a > o ? 'AD' : '40'; }
    return ['0', '15', '30', '40', '40'][Math.min(a, 4)];
  }

  // ---------- step ----------
  function step(M, dt) {
    dt = dt || DT;
    M.t += dt; M.stateT += dt;
    M.side.forEach(function (S) { if (S.slow > 0) S.slow -= dt; if (S.shrink > 0) S.shrink -= dt; });
    M.patches = M.patches.filter(function (q) { q.t -= dt; return q.t > 0; });
    M.fx = M.fx.filter(function (f) { f.t += dt; return f.t < (f.life || 1); });
    M.players.forEach(function (p) {
      if (p.big > 0) p.big -= dt; if (p.mirror > 0) p.mirror -= dt; if (p.stun > 0) p.stun -= dt;
      if (p.swing > 0) p.swing = Math.max(0, p.swing - dt * 3.2);
      if (p.cheer > 0) p.cheer -= dt; if (p.sad > 0) p.sad -= dt;
      if (p.air > 0) p.air -= dt; if (p.stand > 0) p.stand -= dt; if (p.diveT > 0) p.diveT -= dt;   // 🦘🤸 sb2-3
      if (p.lunge > 0){ p.lunge -= dt; if (p.lunge <= 0 && !p.lungeHit) M.events.push({ k: 'jump', kind: 'h', p: p.i, side: p.side, ok: false, perfect: false, rally: M.rally }); }   // 🏒 le-1 a lunge that missed
    });
    if (M.score.done) { movePlayers(M, dt, true); return; }
    if (M.state === 'point') {
      movePlayers(M, dt, true);
      if (M.stateT > 1.3) {
        if (M.sp.kind === 'puck') startFaceoff(M, M.score.serveSide); else setupServe(M);
      }
      return;
    }
    if (M.state === 'serve') {
      robots(M, dt);
      movePlayers(M, dt, false);
      var b = M.balls[0], p = b && M.players[b.held];
      if (p) {
        // ball stays at the server's hand
        b.x = p.x + fwdOf(M, p) * 0.5; b.y = p.y; b.z = M.sp.table ? 0.55 : 1.0 + Math.sin(M.t * 5) * 0.12;
        if ((p.robot || p.auto) && M.stateT > 0.9 + M.rnd() * 0.2) doServe(M, 'normal');
        if (p.human && p.queued && M.t - p.queuedT < 0.6) { doServe(M, p.queued); p.queued = null; }
        if (p.human && M.stateT > (M.autoServe || 99)) doServe(M, 'normal');
      }
      return;
    }
    // play
    robots(M, dt);
    movePlayers(M, dt, false);
    if (M.orb) { var o = M.orb; o.t += dt; o.y += o.vy * dt; if (Math.abs(o.y) > M.sp.Wh * 0.8) o.vy = -o.vy; }
    if (M.sp.kind === 'puck') stepPuck(M, dt);
    else M.balls.slice().forEach(function (b) { stepBall(M, b, dt); });
    // stuck ball guard
    if (M.state === 'play' && M.sp.kind !== 'puck' && M.stateT > 40) { pointTo(M, M.score.serveSide, 'stuck'); }
  }

  function movePlayers(M, dt, idle) {
    M.players.forEach(function (p) {
      var L = limits(M, p), sp = moveSpeed(M, p), ix = 0, iy = 0;
      if (idle) { var h = homeOf(M, p); ix = clamp(h.x - p.x, -1, 1); iy = clamp(h.y - p.y, -1, 1); if (Math.abs(h.x - p.x) < 0.2) ix = 0; if (Math.abs(h.y - p.y) < 0.2) iy = 0; }
      else if (p.robot || p.auto) { ix = p.input.x; iy = p.input.y; }
      else if (p.drag) {
        var dx = p.drag.x - p.x, dy = p.drag.y - p.y, dd = Math.sqrt(dx * dx + dy * dy);
        if (dd > 0.08) { ix = dx / Math.max(dd, 0.6); iy = dy / Math.max(dd, 0.6); }
      } else {
        ix = p.input.x; iy = p.input.y;                       // world directions (the page turns screen keys into world)
        if (p.mirror > 0) iy = -iy;
      }
      if (p.stun > 0 || p.stand > 0) { ix = 0; iy = 0; }   // 🦘🤸 stand still after a jump / getting up after a dive
      var len = Math.sqrt(ix * ix + iy * iy); if (len > 1) { ix /= len; iy /= len; }
      var tvx = ix * sp, tvy = iy * sp;
      var pt = patchAt(M, p.x, p.y);
      var acc = pt && pt.el === 'ice' ? 2.2 : 28;
      if (pt && pt.el === 'thunder' && !pt.zapped) { pt.zapped = true; p.stun = 0.5; M.events.push({ k: 'zap', p: p.i }); }
      p.vx += clamp(tvx - p.vx, -acc * dt, acc * dt);
      p.vy += clamp(tvy - p.vy, -acc * dt, acc * dt);
      p.x = clamp(p.x + p.vx * dt, L.x0, L.x1); p.y = clamp(p.y + p.vy * dt, L.y0, L.y1);
      if (p.x === L.x0 || p.x === L.x1) p.vx = 0;
      if (p.y === L.y0 || p.y === L.y1) p.vy = 0;
      if (Math.abs(p.vy) > 0.3) p.face = p.vy > 0 ? 1 : -1;
    });
    // doubles partners don't overlap
    for (var i = 0; i < M.players.length; i++) for (var j = i + 1; j < M.players.length; j++) {
      var a = M.players[i], c = M.players[j]; if (a.side !== c.side) continue;
      var dx2 = c.x - a.x, dy2 = c.y - a.y, d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 0.01, min = 0.9;
      if (d2 < min) { var push = (min - d2) / 2; a.x -= dx2 / d2 * push; a.y -= dy2 / d2 * push; c.x += dx2 / d2 * push; c.y += dy2 / d2 * push; }
    }
  }

  function stepBall(M, b, dt) {
    if (!b.live || b.held != null) return;
    var sp = M.sp;
    var onSide = sp.squash ? (b.owner >= 0 ? 1 - b.owner : 0) : (b.x < 0 ? 0 : 1);
    var k = M.side[onSide].slow > 0 ? 0.5 : 1;
    var h = dt * k;
    var ge = G * (1 + 0.45 * b.top);
    if (b.kind === 'splorf' && b.b[0] + b.b[1] === 0) ge = G * 2.3;
    // magnet: ball bends toward the holder's paddle
    M.players.forEach(function (p) {
      if (p.magnet > 0 && b.owner !== p.side && (sp.squash || (p.side === 0) === (b.x < 0))) b.vy += clamp(p.y - b.y, -2, 2) * 2.4 * h;
    });
    // wind patch
    var wp = patchAt(M, b.x, b.y);
    if (wp && wp.el === 'wind') b.vy += wp.dir * 6 * h;
    var ox = b.x;
    b.vz -= ge * h; b.vy += b.side * SIDE_ACC * h;
    if (sp.drag) { var bv = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz), bf = 1 / (1 + sp.drag * bv * h); b.vx *= bf; b.vy *= bf; b.vz *= bf; }   // 🏸 air drag
    b.x += b.vx * h; b.y += b.vy * h; b.z += b.vz * h;
    // mirage: brake hard after it crosses the net
    if (b.kind === 'mirage' && !b.braked && Math.abs(b.x) > 1.6 && (b.x > 0) === (b.vx > 0)) {
      b.braked = true; b.vx *= 0.28; b.vy *= 0.28; b.vz = Math.min(b.vz, 0.6); M.events.push({ k: 'mirage', x: b.x, y: b.y });
    }
    // split
    if (b.splitPending && Math.abs(b.x) > 1.0 && (b.x > 0) === (b.vx > 0)) {
      b.splitPending = false;
      for (var s = -1; s <= 1; s += 2) {
        var f = JSON.parse(JSON.stringify(b)); f.id = ++M._bid; f.real = false; f.vy = b.vy + s * (2.2 + M.rnd() * 1.2); f.trail = []; f.kind = null;
        M.balls.push(f);
      }
      if (M.rnd() < 0.5) { var swap = M.balls[M.balls.length - 1]; var tx = b.vy; b.vy = swap.vy; swap.vy = tx; }
      M.events.push({ k: 'split' });
    }
    // trail
    b.trail.push({ x: b.x, y: b.y, z: b.z }); if (b.trail.length > 18) b.trail.shift();
    // orb
    if (M.orb && b.real && b.owner >= 0) {
      var o = M.orb, dx = b.x - o.x, dy = b.y - o.y, dz = b.z - o.z;
      if (dx * dx + dy * dy + dz * dz < 0.85 * 0.85) grantOrb(M, b.owner);
    }
    // net
    if (sp.net && (ox < 0) !== (b.x < 0)) {
      if (b.z < sp.net) {
        b.x = ox; b.vx *= -0.15; b.vy *= 0.3; b.vz = Math.min(b.vz, 0);
        if (b.real) pointTo(M, 1 - b.owner, 'net'); else b.live = false;
        return;
      }
    }
    // 🧱 squash room walls: bounce off any wall below the red line; above it = out
    if (sp.squash) {
      var hitW = false;
      if (Math.abs(b.y) > sp.Wh) { if (b.z < sp.wallH) { b.y = sgn(b.y) * sp.Wh; b.vy *= -0.8; b.vx *= 0.94; hitW = true; } else { if (b.real) pointTo(M, b.owner >= 0 ? 1 - b.owner : 0, 'out'); else b.live = false; return; } }
      if (Math.abs(b.x) > sp.Lh) { if (b.z < sp.wallH) { b.x = sgn(b.x) * sp.Lh; b.vx *= b.x > 0 ? -0.85 : -0.7; b.vy *= 0.94; hitW = true; } else { if (b.real) pointTo(M, b.owner >= 0 ? 1 - b.owner : 0, 'out'); else b.live = false; return; } }
      if (b.z > sp.wallH + 1.2) { b.vz = Math.min(b.vz, 0); b.z = sp.wallH + 1.2; }   // ceiling
      if (hitW) { b.wallHit = true; M.fx.push({ k: 'wallhit', x: b.x, y: b.y, z: b.z, t: 0, life: 0.45 }); M.events.push({ k: 'wallhit' }); }
    }
    // walls (padel)
    else if (sp.walls) {
      var Wh = sp.Wh, Lh = sp.Lh;
      if (Math.abs(b.y) > Wh && b.z < sp.wallH) { b.y = sgn(b.y) * Wh; b.vy *= -0.75; wallTouch(M, b); }
      if (Math.abs(b.x) > Lh && b.z < sp.wallH) { b.x = sgn(b.x) * Lh; b.vx *= -0.72; wallTouch(M, b); }
      if (!b.live) return;
    }
    // buddy wall
    var bs = b.x < 0 ? 0 : 1;
    if (!sp.squash && b.owner !== bs && Math.abs(b.x) > sp.Lh + 0.3 && b.z < 2.2) {
      var holder = M.players.filter(function (p) { return p.side === bs && p.wallBuddy > 0; })[0];
      if (holder) {
        holder.wallBuddy = 0; b.x = sgn(b.x) * (sp.Lh + 0.3);
        aimBall(M, b, dirOf(bs) * sp.Lh * 0.6, (M.rnd() - 0.5) * sp.Wh, sp.V * 0.8, 0, 0);
        b.owner = bs; b.b = [0, 0]; b.hits++; M.rally++;
        M.events.push({ k: 'buddywall', side: bs });
      }
    }
    // hitting
    M.players.forEach(function (p) {
      if (!b.live || b.held != null) return;
      if (!canHit(M, p, b)) return;
      if (b.legendMiss === p.i) return;
      var pp = paddlePos(M, p), dx = b.x - pp.x, dy = b.y - pp.y, R = reachOf(M, p), d2 = dx * dx + dy * dy, jump = null;
      if (p.air > 0 || p.diveT > 0 || b.diveMiss === p.i) return;   // in the air / on the floor
      if (b.z > 2.5) {   // 🦘 high ball right above you
        if (sp.kind === 'puck' || d2 > R * R * 1.15 || b.z > 3.9 || !b.real || !wantJump(M, p, b, 'v')) return;
        jump = 'v';
      } else if (d2 > R * R) {   // 🤸 just out of reach to the side
        if (sp.kind === 'puck' || sp.table || d2 > R * R * 4.4 || b.z > 1.8 || b.z < 0.08 || !b.real) return;
        var bdx = b.x - p.x, bdy = b.y - p.y;
        if (bdx * bdx + bdy * bdy <= R * R * 1.3) return;   // dv-1 close to your body (over your head / at your feet) = no dive
        if (p.human && !p.auto && p.queued === 'smash') return;   // dv-1 💥 Smash never dives
        if (willReach(M, p, b, R)) return;   // dv-1 it's still coming to you — wait
        if (!wantJump(M, p, b, 'h')) return;
        jump = 'h';
      }
      // robot sometimes misses (by level)
      if (p.robot && !b.robotRolled) {
        b.robotRolled = true;
        if (M.rnd() < (M.lv.miss + M.rally * 0.006) * (b.real ? 1 : 0) || (!b.real && M.rnd() < 0.6)) { b.robotMiss = p.i; }
      }
      if (b.robotMiss === p.i) return;
      // pickle kitchen: volley inside the kitchen = fault
      if (sp.kitchen && b.b[p.side] === 0 && Math.abs(p.x) < sp.kitchen) {
        if (p.robot) return;
        if (b.real) { p.swing = 1; M.fx.push({ k: 'text', txt: '🥒 Kitchen volley!', x: p.x, y: p.y, t: 0, life: 1.4 }); pointTo(M, 1 - p.side, 'kitchen'); }
        return;
      }
      if (!b.real) { b.live = false; M.fx.push({ k: 'poof', x: b.x, y: b.y, z: b.z, t: 0, life: 0.6 }); p.swing = 1; return; }
      if (jump === 'h') {   // 🤸 the dive: lunge at the ball, then lie on the floor + get up
        var dd = Math.sqrt(d2) || 1; p.diveDx = dx / dd; p.diveDy = dy / dd; p.vx = p.diveDx * 8.5; p.vy = p.diveDy * 8.5; p.diveT = DIVE_T; p.stand = DIVE_T; M.stats[p.side].dives++;
        var dPerf = p.human && !p.auto && M.t - p.queuedT < 0.22, missP = p.human && !p.auto ? (dPerf ? 0.05 : 0.15) : 0.22 - 0.12 * M.lv.smart;
        if (M.rnd() < missP) { b.diveMiss = p.i; p.swing = 1; p.swingShot = 'lob'; M.events.push({ k: 'jump', kind: 'h', p: p.i, side: p.side, ok: false, perfect: false, rally: M.rally }); return; }
      }
      if (jump === 'v') { p.air = JUMP_AIR; p.stand = JUMP_STAND; M.stats[p.side].jumps++; }
      M._jump = jump; var hitOk = hitBall(M, p, b); M._jump = null;
      if (hitOk) { b.robotRolled = false; b.robotMiss = null; }
    });
    if (!b.live || M.state !== 'play') return;
    // ground
    if (b.z <= 0 && b.vz < 0) {
      b.z = 0;
      landing(M, b);
      if (!b.live || M.state !== 'play') return;
      var rest = sp.table ? 0.86 : 0.72;
      var pt = patchAt(M, b.x, b.y);
      if (pt && pt.el === 'fire') { rest *= 1.3; b.vx *= 1.2; b.vy *= 1.2; }
      if (pt && pt.el === 'puddle') { rest *= 0.4; }
      if (pt && pt.el === 'rocks') { b.vy += (M.rnd() - 0.5) * 6; }
      b.vz = -b.vz * rest;
      var spinK = 1 + 0.22 * b.top;
      if (b.kind === 'broken' && b.b[0] + b.b[1] === 1) { b.vx *= -0.45; b.vy *= 0.5; b.vz *= 0.75; M.events.push({ k: 'broken', x: b.x, y: b.y }); }
      else if (b.kind === 'splorf' && b.b[0] + b.b[1] === 1) { b.vx *= 1.45; b.vz *= 0.35; M.fx.push({ k: 'splat', x: b.x, y: b.y, t: 0, life: 1.2 }); M.events.push({ k: 'splorf', x: b.x, y: b.y }); }
      else { b.vx *= clamp(spinK, 0.55, 1.35); b.vy *= 0.92; }
      if (b.top < -0.5) b.vz *= 0.8;
      b.top *= 0.4; b.side *= 0.5;
      if (b.elem && b.real && b.owner >= 0 && (sp.squash || (b.x < 0) !== (b.owner === 0))) {
        var el = b.elem; b.elem = null;
        M.patches.push({ x: b.x, y: b.y, r: 1.25, el: el, t: 6, dir: M.rnd() < 0.5 ? -1 : 1, side: b.x < 0 ? 0 : 1 });
        M.events.push({ k: 'patch', el: el });
      }
    }
    // far away = out
    if (Math.abs(b.x) > sp.Lh + 7 || Math.abs(b.y) > sp.Wh + 7) {
      if (b.real) {
        var side2 = b.x < 0 ? 0 : 1;
        if (b.b[side2] >= 1 || b.owner !== 1 - side2 && b.owner >= 0 && b.b[side2] >= 1) pointTo(M, b.owner, 'past');
        else pointTo(M, b.b[side2] >= 1 ? b.owner : 1 - b.owner, 'out');
      } else b.live = false;
    }
  }

  function wallTouch(M, b) {
    var side = b.x < 0 ? 0 : 1;
    if (!b.real) { b.live = false; return; }
    if (b.owner >= 0 && side !== b.owner && b.b[side] === 0) {
      // hit the glass before the floor on their side = out
      b.wallFault = true; pointTo(M, side, 'wall');
    }
    if (b.owner >= 0 && side === b.owner && b.b[1 - side] === 0) { b.wallFault = true; pointTo(M, 1 - side, 'wall'); }
  }

  function landing(M, b) {
    var sp = M.sp, side = b.x < 0 ? 0 : 1, own = b.owner;
    if (!b.real) { b.live = false; M.fx.push({ k: 'poof', x: b.x, y: b.y, z: 0, t: 0, life: 0.6 }); return; }
    M.fx.push({ k: 'bounce', x: b.x, y: b.y, t: 0, life: 0.5 });
    // 🧱 squash: one floor bounce is fine, the 2nd = point to the hitter · 🏸 badminton: ANY floor touch ends the rally
    if (sp.squash) { if (own < 0) return; b.fb = (b.fb || 0) + 1; if (b.fb >= 2) pointTo(M, own, b.hits <= 1 && !M.receiverTouched ? 'ace' : 'twice'); return; }
    if (sp.noBounce && own >= 0) {
      var nIn = Math.abs(b.x) <= courtL(M, side) + 0.05 && Math.abs(b.y) <= courtW(M, side) + 0.05;
      if (side === own) { pointTo(M, 1 - own, 'own'); return; }
      pointTo(M, nIn ? own : side, nIn ? (b.hits <= 1 && !M.receiverTouched ? 'ace' : 'floor') : 'out'); return;
    }
    var inX = Math.abs(b.x) <= courtL(M, side) + 0.05, inY = Math.abs(b.y) <= courtW(M, side) + 0.05;
    var inside = inX && inY;
    if (b.pongServeBounce) {
      b.pongServeBounce = false;
      if (side !== own || !inside) pointTo(M, 1 - own, 'serve');
      return;
    }
    if (own < 0) return;
    if (side === own) {
      // landed back on the hitter's side
      if (b.b[1 - own] >= 1) { pointTo(M, own, b.hits === 1 && !M.receiverTouched ? 'ace' : 'twice'); return; }
      pointTo(M, 1 - own, 'own'); return;
    }
    if (b.b[side] >= 1) { pointTo(M, own, (b.hits === 1 && !M.receiverTouched) ? 'ace' : 'twice'); return; }
    if (!inside && !(sp.walls && b.b[side] >= 1)) { pointTo(M, side, 'out'); return; }
    b.b[side]++;
    if (sp.table && !inside) { pointTo(M, side, 'out'); return; }
  }

  // ---------- puck (SlaShot) ----------
  function stepPuck(M, dt) {
    var sp = M.sp;
    M.balls.slice().forEach(function (b) {
      if (!b.live) return;
      var side = b.x < 0 ? 0 : 1, k = M.side[side].slow > 0 ? 0.5 : 1, h = dt * k;
      var sub = 4, hh = h / sub;
      for (var s = 0; s < sub; s++) {
        b.vy += b.side * SIDE_ACC * hh;
        if (b.kind === 'mirage' && !b.braked && Math.abs(b.x) > 2 && (b.x > 0) === (b.vx > 0)) { b.braked = true; b.vx *= 0.3; b.vy *= 0.3; }
        if (b.kind === 'broken' && !b.braked && Math.abs(b.x) > sp.Lh * 0.45 && (b.x > 0) === (b.vx > 0)) { b.braked = true; b.vx *= -0.6; }
        if (b.kind === 'splorf' && !b.braked && Math.abs(b.x) > 2) { b.braked = true; b.vx *= 1.4; b.vy = -b.vy; M.fx.push({ k: 'splat', x: b.x, y: b.y, t: 0, life: 1 }); }
        if (b.splitPending && Math.abs(b.x) > 1.2) {
          b.splitPending = false;
          for (var q = -1; q <= 1; q += 2) { var f = JSON.parse(JSON.stringify(b)); f.id = ++M._bid; f.real = false; f.vy = b.vy + q * 3; f.trail = []; M.balls.push(f); }
        }
        b.x += b.vx * hh; b.y += b.vy * hh;
        var fr = Math.pow(0.9, hh); b.vx *= fr; b.vy *= fr;
        if (b.zt > 0) { b.zt -= hh; b.z = Math.max(0, Math.sin(Math.PI * (1 - b.zt / 0.7)) * 0.9); } else b.z = 0;
        var R = sp.puckR, W = sp.Wh - R, L = sp.Lh - R;
        if (Math.abs(b.y) > W) { b.y = sgn(b.y) * W; b.vy = -b.vy * 0.9; b.side *= -0.5; }
        if (Math.abs(b.x) > L) {
          var gs = b.x < 0 ? 0 : 1;
          if (Math.abs(b.y) < goalHalf(M, gs) - R * 0.4) {
            if (b.real) {
              var wall = M.players.filter(function (p) { return p.side === gs && p.wallBuddy > 0; })[0];
              if (wall) { wall.wallBuddy = 0; b.x = sgn(b.x) * L; b.vx = -b.vx * 0.8; M.events.push({ k: 'buddywall', side: gs }); }
              else { M.stats[1 - gs].goals++; pointTo(M, 1 - gs, b.kind === 'legend' ? 'legend' : 'goal'); if (b.kind === 'legend') M.stats[1 - gs].legend++; b.live = false; return; }
            } else { b.live = false; return; }
          } else { b.x = sgn(b.x) * L; b.vx = -b.vx * 0.85; }
        }
        // mallets
        for (var i = 0; i < M.players.length; i++) {
          var p = M.players[i];
          if (b.z > 0.35) continue;
          var mr = reachOf(M, p), dx = b.x - p.x, dy = b.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
          // 🏒 le-1 SlaShot dive: the puck is racing at your goal just out of reach → press a shot button (robots: rare) → the mallet lunges (long reach), then you get up
          if (b.real && !(p.lunge > 0) && !(p.diveT > 0) && b.owner !== p.side && ((p.side === 0) === (b.x < 0)) && b.vx * dirOf(p.side) < -1 && d >= mr + R && d < (mr + R) * 2.2 && wantJump(M, p, b, 'h')) {
            p.lunge = 0.22; p.lungeHit = false; p.diveT = DIVE_T * 0.75; p.stand = DIVE_T * 0.75; p.diveDx = dx / d; p.diveDy = dy / d; M.stats[p.side].dives++; mr = reachOf(M, p);
          }
          if (d < mr + R && d > 0.0001) {
            var nx = dx / d, ny = dy / d;
            if (!b.real) { b.live = false; M.fx.push({ k: 'poof', x: b.x, y: b.y, z: 0, t: 0, life: 0.6 }); return; }
            if (b.kind === 'legend' && b.owner !== p.side && !b.braked) {
              var ok = p.human ? (p.queued && M.t - p.queuedT < 0.25) : M.rnd() < (M.level >= 5 ? 0.5 : 0.25);
              if (!ok) { continue; }
            }
            b.x = p.x + nx * (mr + R + 0.01); b.y = p.y + ny * (mr + R + 0.01);
            var rvx = b.vx - p.vx, rvy = b.vy - p.vy, vn = rvx * nx + rvy * ny;
            if (vn < 0) {
              b.vx -= 1.9 * vn * nx; b.vy -= 1.9 * vn * ny;
              b.vx += p.vx * 0.55; b.vy += p.vy * 0.55;
              puckShot(M, p, b); b.jr = null;
              if (p.lunge > 0 && !p.lungeHit) { p.lungeHit = true; jumpEvent(M, p, 'h', true, false); }   // 🏒 le-1 the lunge reached it
            }
          }
        }
        var maxV = sp.V * M.lv.vMul * (b.kind === 'legend' ? 1.9 : 1.25);
        var vv = Math.sqrt(b.vx * b.vx + b.vy * b.vy); if (vv > maxV) { b.vx *= maxV / vv; b.vy *= maxV / vv; }
      }
      b.trail.push({ x: b.x, y: b.y, z: b.z }); if (b.trail.length > 18) b.trail.shift();
      if (M.orb && b.real && b.owner >= 0) { var o = M.orb, ddx = b.x - o.x, ddy = b.y - o.y; if (ddx * ddx + ddy * ddy < 0.9) grantOrb(M, b.owner); }
      // dead puck: nudge it after 6 s still
      var spd = Math.abs(b.vx) + Math.abs(b.vy);
      b.still = spd < 0.4 ? (b.still || 0) + dt : 0;
      var sd = b.x < 0 ? 0 : 1;
      if (b.sd !== sd) { b.sd = sd; b.sideT = 0; } else b.sideT = (b.sideT || 0) + dt;
      if (b.sideT > 9 && b.real) { b.x = (sd === 0 ? -1 : 1) * 1.5; b.y = 0; b.vx = (sd === 0 ? 1 : -1) * 3; b.vy = 0; b.sideT = 0; M.events.push({ k: 'unstick' }); }
      if (b.still > 5) { b.vx = (b.x < 0 ? 1 : -1) * 4; b.vy = (M.rnd() - 0.5) * 3; b.still = 0; }
    });
    if (M.state === 'play' && !M.balls.some(function (b) { return b.live && b.real; })) {
      // the real one scored or vanished
    }
  }
  function puckShot(M, p, b) {
    var picked = wantShot(M, p), shot = picked || 'normal', d = dirOf(p.side);
    var hard = M.t - (b.lastTouch || -9) < 0.12 && b.lastP === p.i; b.lastTouch = M.t; b.lastP = p.i;
    if (hard) return;
    var ns = M.side[p.side].nextShot; b.kind = null; b.braked = false; b.ghost = false;
    if (ns) { M.side[p.side].nextShot = null; b.kind = ns; if (ns === 'ghost') b.ghost = true; if (ns === 'split') b.splitPending = true; M.events.push({ k: 'special', kind: ns, side: p.side, p: p.i }); }
    var V = M.sp.V * M.lv.vMul;
    if (p.robot) {
      // aim at the goal with some error
      var gx = d * M.sp.Lh, gy = (M.rnd() < 0.5 ? -1 : 1) * M.sp.goal * (0.5 + M.rnd() * 0.4) + (M.rnd() - 0.5) * M.lv.err * 2.4;
      if (M.rnd() < 0.25) gy = -gy * 2.2;   // bank shot off the side wall
      var dx = gx - b.x, dy = gy - b.y, dd = Math.sqrt(dx * dx + dy * dy);
      var spd = Math.max(Math.sqrt(b.vx * b.vx + b.vy * b.vy), V * (0.8 + 0.35 * M.lv.smart));
      if (M.rnd() < 0.75 + 0.25 * M.lv.smart) { b.vx = dx / dd * spd; b.vy = dy / dd * spd; }
    }
    if (shot === 'smash') { b.vx = Math.abs(b.vx) * d + d * V * 0.6; M.stats[p.side].smash++; }
    if (shot === 'drop') { b.vx *= 0.45; b.vy *= 0.45; }
    if (shot === 'lob') { b.zt = 0.7; }
    if (shot === 'slice') { b.side = (p.vy >= 0 ? 1 : -1) * 0.9; }
    if (b.kind === 'legend' || b.kind === 'mirage') { b.vx = d * V * 1.8; b.vy *= 0.3; }
    if ((b.vx * d) < 0.5) b.vx = d * Math.max(0.5, Math.abs(b.vx));
    b.owner = p.side; b.by = p.i; p.swing = 1; p.swingShot = shot; p.queued = null; p.hits++;
    if (M.side[p.side].elemental > 0) { M.side[p.side].elemental--; var el = pickElement(M); M.patches.push({ x: -d * (2 + M.rnd() * 4) * -1, y: (M.rnd() - 0.5) * M.sp.Wh, r: 1.2, el: el, t: 6, dir: 1, side: 1 - p.side }); M.events.push({ k: 'patch', el: el }); }
    M.rally++; M.stats[p.side].hits++;
    if (M.rally > M.stats[p.side].rally) M.stats[p.side].rally = M.rally;
    M.events.push({ k: 'hit', p: p.i, side: p.side, shot: shot, rally: M.rally });
    checkOrb(M);
  }

  // ---------- robots ----------
  function predictBall(M, b, p, maxT) {
    // simulate the ball forward (no rules) and find the first spot this player may hit it
    var sp = M.sp, c = { x: b.x, y: b.y, z: b.z, vx: b.vx, vy: b.vy, vz: b.vz, top: b.top, side: b.side, bn: sp.squash ? (b.fb || 0) : b.b[p.side], pong: b.pongServeBounce, w: !sp.squash || b.wallHit || (b.fb || 0) > 0 || b.owner < 0 };
    var h = 1 / 60, t = 0, best = null, first = null;
    var mustB = sp.mustBounce || (sp.serveLock && b.serve) || (sp.twoBounce && b.hits < 2);
    while (t < maxT) {
      var ge = G * (1 + 0.45 * c.top);
      c.vz -= ge * h; c.vy += c.side * SIDE_ACC * h;
      if (sp.drag) { var cv = Math.sqrt(c.vx * c.vx + c.vy * c.vy + c.vz * c.vz), cf = 1 / (1 + sp.drag * cv * h); c.vx *= cf; c.vy *= cf; c.vz *= cf; }
      c.x += c.vx * h; c.y += c.vy * h; c.z += c.vz * h; t += h;
      if (sp.walls) { if (Math.abs(c.y) > sp.Wh) { c.y = sgn(c.y) * sp.Wh; c.vy *= sp.squash ? -0.8 : -0.75; c.w = true; } if (Math.abs(c.x) > sp.Lh) { c.x = sgn(c.x) * sp.Lh; c.vx *= sp.squash ? (c.x > 0 ? -0.85 : -0.7) : -0.72; c.w = true; } }
      if (c.z <= 0 && c.vz < 0) {
        if (sp.noBounce) break; c.w = true;
        c.z = 0; c.vz = -c.vz * (sp.table ? 0.86 : 0.72); c.vx *= clamp(1 + 0.22 * c.top, 0.55, 1.35); c.top *= 0.4;
        if (c.pong) c.pong = false; else if (sp.squash || (c.x < 0) === (p.side === 0)) c.bn++;
        if (c.bn >= 2) break;
      }
      var mine = sp.squash || (c.x < 0) === (p.side === 0);
      if (!mine || c.pong || !c.w) continue;
      if (mustB && c.bn < 1) continue;
      if (c.z > 2.2) continue;
      var L = limits(M, p), px = clamp(c.x - fwdOf(M, p) * 0.35, L.x0, L.x1), py = clamp(c.y, L.y0, L.y1);
      if (sp.kitchen && c.bn === 0 && Math.abs(px) < sp.kitchen + 0.2) continue;
      var dist = Math.sqrt((px - p.x) * (px - p.x) + (py - p.y) * (py - p.y));
      var need = dist / moveSpeed(M, p) + M.lv.react * 0.5;
      var cand = { x: px, y: py, t: t, ok: need <= t, late: need - t, z: c.z, bn: c.bn };
      if (!first) first = cand;
      // prefer a comfortable height after the bounce
      if (cand.ok && (!best || (c.z > 0.4 && c.z < 1.5 && !(best.z > 0.4 && best.z < 1.5)))) { best = cand; if (c.z > 0.5 && c.z < 1.4) break; }
      if (!cand.ok && (!best || (!best.ok && cand.late < best.late))) best = cand;
    }
    return best || first;
  }

  function robots(M, dt) {
    M.players.forEach(function (p) {
      if (!p.robot && !p.auto) return;
      var ai = p.ai; ai.think -= dt;
      if (M.state === 'serve' || M.state === 'point') { var h0 = homeOf(M, p); setRobotMove(M, p, h0.x, h0.y); return; }
      if (M.sp.kind === 'puck') return robotPuck(M, p, dt);
      // pick the most urgent live ball coming at us
      var balls = M.balls.filter(function (b) { return b.live && b.held == null && b.owner !== p.side && (b.real || M.rnd() > 0.5); });
      var team = M.players.filter(function (q) { return q.side === p.side; });
      if (ai.think <= 0) {
        ai.think = M.lv.react * (0.6 + M.rnd() * 0.8);
        ai.plan = null;
        var bestPlan = null;
        balls.forEach(function (b) {
          var pr = predictBall(M, b, p, 3);
          if (pr && (!bestPlan || pr.t < bestPlan.t)) bestPlan = pr;
        });
        if (bestPlan && team.length > 1) {
          // doubles: lane split — leave balls in the partner's lane
          var mate = team.filter(function (q) { return q !== p; })[0];
          var mine = Math.abs(bestPlan.y - p.y) <= Math.abs(bestPlan.y - mate.y) + 0.3;
          if (!mine) bestPlan = null;
        }
        if (bestPlan) {
          var e = M.lv.err * 0.35;
          ai.plan = { x: bestPlan.x + (M.rnd() - 0.5) * e, y: bestPlan.y + (M.rnd() - 0.5) * e };
          // pick a shot
          var opp = M.players.filter(function (q) { return q.side !== p.side; })[0];
          var shot = 'normal', sm = M.lv.smart;
          if (bestPlan.z > 1.5 && M.rnd() < sm) shot = 'smash';
          else if (opp && Math.abs(opp.x) > M.sp.Lh * 0.85 && M.rnd() < sm * 0.5) shot = 'drop';
          else if (opp && Math.abs(opp.x) < M.sp.Lh * 0.45 && M.rnd() < sm * 0.6) shot = 'lob';
          else if (M.rnd() < sm * 0.25) shot = 'slice';
          if (M.sp.twoBounce && M.rnd() < 0.3) shot = 'drop';
          ai.shot = shot;
        }
        // powers
        if (p.power && M.lv.power > 0 && M.rnd() < M.lv.power * 0.5) usePower(M, p.i);
      }
      if (ai.plan) setRobotMove(M, p, ai.plan.x, ai.plan.y);
      else { var hm = homeOf(M, p); setRobotMove(M, p, hm.x, hm.y * 0.6 + (balls[0] ? balls[0].y * 0.4 : 0)); }
    });
  }
  function setRobotMove(M, p, tx, ty) {
    var dx = tx - p.x, dy = ty - p.y, d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.08) { p.input.x = 0; p.input.y = 0; return; }
    var s = Math.min(1, d / 0.5);
    p.input.x = dx / d * s; p.input.y = dy / d * s;
  }
  function robotPuck(M, p, dt) {
    var sp = M.sp, b = M.balls.filter(function (q) { return q.live && q.real; })[0];
    var home = homeOf(M, p), d = dirOf(p.side);
    if (!b) return setRobotMove(M, p, home.x, home.y);
    var ai = p.ai; ai.think -= dt;
    if (ai.think > 0 && ai.pt) return setRobotMove(M, p, ai.pt.x, ai.pt.y);
    ai.think = M.lv.react * (0.6 + M.rnd() * 0.8);
    var mine = (b.x < 0) === (p.side === 0);
    var goalX = -d * sp.Lh;
    var tx, ty;
    if (mine && (b.vx * d > -2.5 || Math.abs(b.x - goalX) < sp.Lh * 0.35)) {
      // attack: get behind the puck (between puck and own goal) and push through it
      var bx = b.x + b.vx * M.lv.react, by = b.y + b.vy * M.lv.react;
      var gx = d * sp.Lh, gy = 0, ax = gx - bx, ay = gy - by, al = Math.sqrt(ax * ax + ay * ay) || 1;
      var behind = { x: bx - ax / al * 0.6, y: by - ay / al * 0.6 };
      var dd = Math.hypot(behind.x - p.x, behind.y - p.y);
      if (dd < 0.7) { tx = bx + ax / al * 1.2; ty = by + ay / al * 1.2; }
      else { tx = behind.x; ty = behind.y; }
    } else {
      // defend: stand on the defence line where the puck will cross it (better levels guess better)
      tx = goalX + d * (1.0 + 1.4 * (1 - M.lv.smart));
      var yint = b.y;
      if (b.vx * d < -0.5) { var tt = (tx - b.x) / b.vx; if (tt > 0) yint = b.y + b.vy * tt; }
      while (Math.abs(yint) > sp.Wh) yint = sgn(yint) * (2 * sp.Wh) - yint;   // wall bounce
      ty = clamp(yint * (0.25 + 0.7 * M.lv.smart), -sp.goal, sp.goal);
      // each new shot: sometimes the robot guesses wrong (more on easy levels, more on fast shots)
      var shotId = b.id + ':' + (b.lastTouch || 0);
      if (ai.shotId !== shotId) {
        ai.shotId = shotId;
        var spdNow = Math.sqrt(b.vx * b.vx + b.vy * b.vy) / sp.V;
        ai.wrong = M.rnd() < 0.14 + (1 - M.lv.smart) * 0.3 + spdNow * 0.12 ? (M.rnd() < 0.5 ? -1 : 1) * (1.3 + M.rnd()) : 0;
      }
      ty += ai.wrong || 0;
    }
    if (p.power && M.lv.power > 0 && M.rnd() < M.lv.power * 0.01) usePower(M, p.i);
    var e = (M.rnd() - 0.5) * M.lv.err * 1.4;
    ai.pt = { x: tx, y: ty + e };
    setRobotMove(M, p, tx, ty + e);
  }

  // 🎯 sb2-1 aim: world input → forward (toward the net, -1..1) + lateral (-1..1)
  function humanAim(M, p) {
    var ix = p.input ? p.input.x || 0 : 0, iy = p.input ? p.input.y || 0 : 0;
    return { f: clamp(ix * dirOf(p.side), -1, 1), l: clamp(iy, -1, 1) };
  }
  // where a hit by this player with this shot would land right now (no randomness) — the aim guide
  function aimPreview(M, p, shot) {
    var sp = M.sp; if (sp.kind === 'puck') return null;
    if (sp.squash) {   // 🧱 where the ball will hit the first wall in the aimed direction
      var dq = squashDir(M, p), tt = 99;
      if (dq.x > 0.01) tt = Math.min(tt, (sp.Lh - p.x) / dq.x); if (dq.x < -0.01) tt = Math.min(tt, (-sp.Lh - p.x) / dq.x);
      if (dq.y > 0.01) tt = Math.min(tt, (sp.Wh - p.y) / dq.y); if (dq.y < -0.01) tt = Math.min(tt, (-sp.Wh - p.y) / dq.y);
      return { x: p.x + dq.x * tt, y: p.y + dq.y * tt, wall: true };
    }
    var S = SHOTS[shot || 'normal'] || SHOTS.normal, oside = 1 - p.side, d = dirOf(p.side), lw = courtW(M, oside), ll = courtL(M, oside), am = humanAim(M, p);
    var depth = clamp(S.depth * (1 + 0.3 * am.f), 0.2, 0.97);
    if (sp.twoBounce && shot === 'drop') depth = (sp.kitchen * 0.75) / ll;
    if (sp.table) depth = clamp(depth, 0.18, 0.9);
    return { x: d * clamp(depth * ll, 0.6, ll * 0.95), y: clamp(am.l * lw * 0.78, -lw * 0.84, lw * 0.84) };
  }
  // where a flying ball first touches the floor (no rules) — the 🎯 landing ring
  function landingOf(M, b, maxT) {
    if (!b || !b.live || b.held != null) return null;
    var sp = M.sp, c = { x: b.x, y: b.y, z: b.z, vx: b.vx, vy: b.vy, vz: b.vz, top: b.top, side: b.side }, h = 1 / 60, t = 0;
    maxT = maxT || 3;
    while (t < maxT) {
      c.vz -= G * (1 + 0.45 * c.top) * h; c.vy += c.side * SIDE_ACC * h;
      if (sp.drag) { var lv = Math.sqrt(c.vx * c.vx + c.vy * c.vy + c.vz * c.vz), lf = 1 / (1 + sp.drag * lv * h); c.vx *= lf; c.vy *= lf; c.vz *= lf; }
      c.x += c.vx * h; c.y += c.vy * h; c.z += c.vz * h; t += h;
      if (sp.squash && c.z < sp.wallH) { if (Math.abs(c.y) > sp.Wh) { c.y = sgn(c.y) * sp.Wh; c.vy *= -0.8; } if (Math.abs(c.x) > sp.Lh) { c.x = sgn(c.x) * sp.Lh; c.vx *= c.x > 0 ? -0.85 : -0.7; } }
      if (c.z <= 0 && c.vz < 0) return { x: c.x, y: c.y, t: t };
    }
    return null;
  }

  // human: press a shot (queued for the next contact or serves)
  function pressShot(M, pi, shot) {
    var p = M.players[pi]; if (!p) return;
    p.queued = shot || 'normal'; p.queuedT = M.t;
    if (M.state === 'serve' && M.balls[0] && M.balls[0].held === pi) { doServe(M, p.queued); p.queued = null; }
  }

  function takeEvents(M) { var e = M.events; M.events = []; return e; }

  // run a whole robot vs robot match (tests)
  function simulate(opts, maxT) {
    var M = newMatch(opts); var t = 0; maxT = maxT || 1200;
    while (!M.score.done && t < maxT) { step(M, DT); t += DT; takeEvents(M); }
    return M;
  }

  return {
    SPORTS: SPORTS, SPORT_ORDER: SPORT_ORDER, LEVELS: LEVELS, SHOTS: SHOTS, POWERS: POWERS, POWER_KEYS: POWER_KEYS, ELEMENTS: ELEMENTS, ORB_AT: ORB_AT,
    newMatch: newMatch, step: step, DT: DT, pressShot: pressShot, usePower: usePower, takeEvents: takeEvents, pointText: pointText,
    simulate: simulate, courtW: courtW, courtL: courtL, goalHalf: goalHalf, limits: limits, dirOf: dirOf, paddlePos: paddlePos,
    reachOf: reachOf, doServe: doServe, patchAt: patchAt, mkRng: mkRng, homeOf: homeOf, G: G,
    humanAim: humanAim, aimPreview: aimPreview, jumpFail: jumpFail, JUMP_AIR: JUMP_AIR, DIVE_T: DIVE_T, landingOf: landingOf, fwdOf: fwdOf, flyShuttle: flyShuttle, squashDir: squashDir
  };
})();
// ENGINE END

