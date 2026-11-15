
// ===== BlasOff ENGINE (pure logic, no DOM) — pasted into BlasOff.html between ENGINE START/END =====
// ENGINE START
var BO = (function () {
  'use strict';
  var DT = 1 / 120, GRAV = 9.8, BALL_R = 0.17;
  /* World: x along the pitch (side 0 defends x = -Lh and attacks +x, side 1 the other way), y across, z up. Metres + seconds.
     4v4 = 4 outfield players + a 🧤 robot keeper (formations 1-2-1 / 2-2 count outfield players) · 7v7 = 6 + keeper (2-3-1 / 3-2-1). */
  var SIZES = {
    4: {n: 4, Lh: 21, Wh: 13.5, goalW: 2.6, goalH: 2.0, boxL: 6, boxW: 7.5, spot: 7.5, cam: 1, forms: {'121': [[-0.62, 0], [-0.32, -0.55], [-0.32, 0.55], [-0.04, 0]], '22': [[-0.6, -0.42], [-0.6, 0.42], [-0.16, -0.46], [-0.16, 0.46]]}, formOrder: ['121', '22'], formName: {'121': '1-2-1 diamond', '22': '2-2 box'}},
    7: {n: 6, Lh: 31, Wh: 20, goalW: 3.1, goalH: 2.2, boxL: 9, boxW: 11, spot: 9, cam: 1.3, forms: {'231': [[-0.64, -0.42], [-0.64, 0.42], [-0.34, -0.66], [-0.36, 0], [-0.34, 0.66], [-0.04, 0]], '321': [[-0.66, -0.58], [-0.68, 0], [-0.66, 0.58], [-0.32, -0.36], [-0.32, 0.36], [-0.04, 0]]}, formOrder: ['231', '321'], formName: {'231': '2-3-1', '321': '3-2-1'}},
    // 🌍 bo-2a: 11v11 = 10 outfield + keeper on a kids-size full pitch (≈ 96 × 62 m), the camera goes semi-wide
    11: {n: 10, Lh: 48, Wh: 31, goalW: 3.66, goalH: 2.44, boxL: 15, boxW: 19, spot: 10.5, cam: 1.9, forms: {
      '442': [[-0.72, -0.62], [-0.75, -0.21], [-0.75, 0.21], [-0.72, 0.62], [-0.4, -0.66], [-0.42, -0.22], [-0.42, 0.22], [-0.4, 0.66], [-0.06, -0.2], [-0.06, 0.2]],
      '433': [[-0.72, -0.62], [-0.75, -0.21], [-0.75, 0.21], [-0.72, 0.62], [-0.44, -0.42], [-0.48, 0], [-0.44, 0.42], [-0.1, -0.58], [-0.04, 0], [-0.1, 0.58]],
      '352': [[-0.74, -0.42], [-0.77, 0], [-0.74, 0.42], [-0.42, -0.74], [-0.45, -0.34], [-0.5, 0], [-0.45, 0.34], [-0.42, 0.74], [-0.06, -0.2], [-0.06, 0.2]]},
      formOrder: ['442', '433', '352'], formName: {'442': '4-4-2', '433': '4-3-3', '352': '3-5-2'}},
    // 🏟️ bo-2b: futsal 5v5 = 4 + keeper on a 40 × 20 m court — heavier low-bounce ball, kick-ins (no throw-ins), no offside
    5: {n: 4, Lh: 20, Wh: 10, goalW: 1.5, goalH: 2.0, boxL: 6, boxW: 5.5, spot: 6, cam: 1.1, court: 'futsal', bounce: 0.28, fric: 6.2, kickin: true, noOffside: true, rangeK: 0.8,
      forms: {'121': [[-0.62, 0], [-0.32, -0.55], [-0.32, 0.55], [-0.04, 0]], '22': [[-0.6, -0.42], [-0.6, 0.42], [-0.16, -0.46], [-0.16, 0.46]], '31': [[-0.62, -0.5], [-0.68, 0], [-0.62, 0.5], [-0.08, 0]]},
      formOrder: ['121', '22', '31'], formName: {'121': '1-2-1 diamond', '22': '2-2 box', '31': '3-1 pivot'}},
    // 🏙️ bo-2b: street 1v1 in a tiny cage — no keepers, the ball bounces off the fence, a 🥜 nutmeg wins the point, first to 5
    1: {n: 1, Lh: 12, Wh: 7, goalW: 0.75, goalH: 0.85, boxL: 2.5, boxW: 2.5, spot: 5, cam: 0.66, court: 'cage', cage: true, nokeeper: true, firstTo: 5, oneHalf: true, nutPoint: true, noOffside: true, rangeK: 0.5, bounce: 0.45, fric: 4.2,
      forms: {'1': [[-0.4, 0]]}, formOrder: ['1'], formName: {'1': '1 v 1'}}
  };
  // 👮 rules by level (plan §7) · bo-1b (Aowu 2026-11-14): 🌋 Extreme ≈ 18 % / 💀 Hardcore ≈ 8–10 % wins for a simple test player: offside 0 off · 1 simple · 2 full; aim help 3 strong · 2 medium · 1 light · 0 none
  var LEVELS = [
    {name: 'Basic', half: 90, spd: 0.66, react: 0.55, tackle: 0.12, tkCd: 3.2, press: 1, smart: 0, passAcc: 0.5, shotAcc: 0.3, range: 11, keeper: 0.46, aim: 3, offside: 0, fouls: 0, cards: 0, stamina: 0, slide: 0, draw: 'golden', trickFail: 0, steal: 0.92, guided: 2},
    {name: 'Junior', half: 105, spd: 0.76, react: 0.42, tackle: 0.22, tkCd: 2.3, press: 1, smart: 0, passAcc: 0.66, shotAcc: 0.42, range: 13, keeper: 0.5, aim: 2, offside: 0, fouls: 0, cards: 0, stamina: 0, slide: 0, draw: 'golden', trickFail: 0.06, steal: 0.82, guided: 1},
    {name: 'Intermediate', half: 120, spd: 0.85, react: 0.32, tackle: 0.34, tkCd: 1.7, press: 1, smart: 0, passAcc: 0.76, shotAcc: 0.52, range: 15, keeper: 0.55, aim: 1, offside: 0, fouls: 1, cards: 0, stamina: 0, slide: 1, draw: 'golden', trickFail: 0.12, steal: 0.72, guided: 0},
    {name: 'Hard', half: 120, spd: 0.92, react: 0.25, tackle: 0.44, tkCd: 1.3, press: 2, smart: 0, passAcc: 0.83, shotAcc: 0.6, range: 16, keeper: 0.6, aim: 1, offside: 1, fouls: 1, cards: 0, stamina: 1, slide: 1, draw: 'pens', trickFail: 0.18, steal: 0.64, guided: 0},
    {name: 'Extreme', half: 180, spd: 0.875, react: 0.2, tackle: 0.5, tkCd: 1.05, press: 2, smart: 1, passAcc: 0.88, shotAcc: 0.68, range: 17, keeper: 0.57, aim: 0, offside: 2, fouls: 1, cards: 1, stamina: 1, slide: 1, draw: 'pens', trickFail: 0.25, steal: 0.58, guided: 0},
    {name: 'Hardcore', half: 180, spd: 0.86, react: 0.16, tackle: 0.54, tkCd: 0.85, press: 3, smart: 1, passAcc: 0.92, shotAcc: 0.75, range: 18, keeper: 0.58, aim: 0, offside: 2, fouls: 1, cards: 1, stamina: 1, slide: 1, draw: 'pens', trickFail: 0.3, steal: 0.52, guided: 0, hardcore: true}
  ];
  var RUN = 5.4, SPRINT = 7.4, ACC = 22;
  // ⚡ bo-2c: how long a critical-moment prompt stays (s) per level · 🎯 penalty marker speed per level
  var FLIP_T = 0.62;   // 🌀 one full spin in the air
  /* 🎬 bo-5a REAL ACTIONS — every avatar action = beats (Checklist §17, plan §2): ready → anticipation → contact → follow-through → settle.
     The ENGINE is the clock: p.act (key) · p.bi (beat index) · p.bq (0–1 inside the beat) · p.beat (name) · p.actN (a new number per action).
     The game happens ON CONTACT (take-off, dive, catch …) — never on the key press. The page only DRAWS the beat (🎭 BLOCK blasoff in AvatarActing).
     A beat with `air` lasts until the player lands (its q = air progress). 🌱 Basic: every beat × 1.15 except the contact snap. */
  var ACT_BEATS = {
    hop:    [{n: 'ready', ms: 30}, {n: 'anticipation', ms: 120}, {n: 'contact', ms: 60, go: 1}, {n: 'follow', air: 1}, {n: 'settle', ms: 120}],
    dodge:  [{n: 'ready', ms: 0}, {n: 'anticipation', ms: 70}, {n: 'contact', ms: 60, go: 1}, {n: 'follow', air: 1}, {n: 'settle', ms: 100}],
    gkhigh: [{n: 'ready', ms: 60}, {n: 'anticipation', ms: 150}, {n: 'contact', ms: 80, go: 1}, {n: 'follow', air: 1}, {n: 'settle', ms: 150}],
    gkdive: [{n: 'ready', ms: 40}, {n: 'anticipation', ms: 150}, {n: 'contact', ms: 100, go: 1}, {n: 'follow', air: 1}, {n: 'settle', ms: 200}]
  };
  // 🦘 jump height (m) per action (Aowu 00:48: "a header needs a higher jump, a spinning kick a higher jump + spin, a jump dodge over a slide…")
  var JUMPS = {hop: 0.5, dodge: 0.7, header: 1.0, dheader: 0.4, bicycle: 1.1, flip: 1.1, flippass: 0.5, blast: 0.3, gkhigh: 1.0, gkdive: 0.5};
  var MO_WIN = [1.8, 1.5, 1.25, 1.05, 0.85, 0.7], MO_KEY = {beat: 'L', air: 'K', oneone: 'K'}, PEN_SPD = [1.5, 1.9, 2.4, 3.0, 3.6, 4.2];
  /* 🎪 bo-3c pitch twists (🔥 Intermediate up, "🎪 Fun pitch" switch) + 🎉 party ball */
  var TWISTS = {jungle: {icon: '🟫', name: 'Mud + dino egg', about: 'Muddy patches slow the ball and you · a 🥚 dino egg rolls across once a half'},
    underwater: {icon: '🌊', name: 'Sea current', about: 'A current pushes high balls sideways (the arrows show which way)'},
    neon: {icon: '⚡', name: 'Power zone', about: 'Shoot from the flashing ⚡ power zone = a faster shot'},
    robot: {icon: '⚙️', name: 'Conveyor belts', about: 'The belts along the sides carry players and the ball'},
    moon: {icon: '🪐', name: 'Low gravity', about: 'Floaty jumps, high bounces, the ball rolls far'},
    olympus: {icon: '💨', name: 'Wind gusts', about: 'Gusts (the 💨 arrow) curve high balls'}};
  var PARTY = {bounce: 0.8, kick: 3.2, fric: 0.65};
  var TRICKS = {nutmeg: '🥜 Nutmeg!', stepover: '🦶 Stepover', elastico: '🐍 Elastico', roulette: '🌀 Roulette', rainbow: '🌈 Rainbow flick', heel: '👠 Heel pass', nolook: '🙈 No-look pass', chip: '🥄 Chip shot', rabona: '🦵 Rabona', bicycle: '🚲 Bicycle kick', flip: '🌀 Flip volley', flippass: '🌀 Flip pass', scorpion: '🦂 Scorpion kick'};

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hyp(x, y) { return Math.sqrt(x * x + y * y); }
  function dirOf(side, M) { var d = side === 0 ? 1 : -1; return M && M.swap ? -d : d; }   /* 🔁 Aowu 18:14: teams switch ends at half time (M.swap) */
  function ev(M, k, o) { var e = o || {}; e.k = k; e.t = Math.round(M.t * 100) / 100; M.events.push(e); M.log.push(e); if (M.log.length > 800) M.log.shift(); return e; }

  // ---------- match ----------
  function newMatch(o) {
    o = o || {};
    var S = SIZES[o.size] || SIZES[4], lv = clamp(o.level | 0, 0, 5), L = LEVELS[lv];
    var M = {S: S, size: SIZES[o.size] ? +o.size : 4, level: lv, L: L, theme: o.theme || 'classic', rnd: mulberry((o.seed | 0) || 1234567), t: 0, clock: 0, half: 1,
      halfLen: o.half || L.half, phase: 'kickoff', phaseT: 0, score: [0, 0], events: [], log: [], players: [], ctrls: [], forms: [o.form0 || S.formOrder[0], o.form1 || S.formOrder[0]],
      shout: [null, null], kickSide: 0, golden: false, goldenT: 0, pens: null, done: false, winner: -1, fast: !!o.fast, guided: o.guided == null ? L.guided : o.guided,
      stats: [newStats(), newStats()], rs: null, cards: [], noOffside: !!o.noOffside || !!S.noOffside, noPens: !!S.nokeeper, nut: null, pensOnly: !!o.pensOnly};
    if (!S.forms[M.forms[0]]) M.forms[0] = S.formOrder[0];
    if (!S.forms[M.forms[1]]) M.forms[1] = S.formOrder[0];
    for (var side = 0; side < 2; side++) {
      var names = (o.names && o.names[side]) || [];
      if (!S.nokeeper) M.players.push(newPlayer(M, side, -1, true, names[0] || (side ? 'Robo Keeper' : 'Keeper')));
      for (var s = 0; s < S.n; s++) M.players.push(newPlayer(M, side, s, false, names[s + 1] || ('Robo ' + (s + 1))));
    }
    M.ball = {x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, spin: 0, owner: -1, last: -1, lastSide: -1, passer: -1, passT: -99, lock: -1, lockT: 0, shot: null, offside: null, held: 0, pre: null};
    (o.humans || []).forEach(function (h, ci) { addCtrl(M, h.side | 0, h.name || 'Player', h.seat == null ? ci : h.seat); });
    kickoffSetup(M, 0);
    M.party = !!o.party; M.twist = o.twist !== false && lv >= 2 && TWISTS[M.theme] && !M.pensOnly ? M.theme : null; M.tw = {};
    if (M.twist) twistSetup(M);
    if (M.pensOnly) startPens(M);   // 🥅 penalty-shootout mode
    return M;
  }
  function newStats() { return {shots: 0, onTarget: 0, passes: 0, tackles: 0, fouls: 0, cards: 0, saves: 0, tricks: 0, volleys: 0, corners: 0, offsides: 0, poss: 0, nutmegs: 0}; }
  function newPlayer(M, side, slot, gk, name) {
    var p = {i: M.players.length, side: side, slot: slot, gk: gk, name: name, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, fx: dirOf(side, M), fy: 0, st: 'ok', stT: 0, immune: 0, stamina: 1, cd: 0, aiT: 0,
      tx: 0, ty: 0, run: 0, ctrl: -1, pressT: 0, burst: 0, cards: 0, dive: 0, diveT: 0, holdT: 0, celebrate: 0, kickT: 0, trickName: '', sprint: false,
      g: {goals: 0, assists: 0, tricks: 0, volleys: 0, tackles: 0, shoutSaves: 0, shots: 0, passes: 0, headers: 0, saves: 0, nutmegs: 0}};
    return p;
  }
  function addCtrl(M, side, name, seat) {
    var c = {ci: M.ctrls.length, side: side, name: name, seat: seat, pi: -1, ix: 0, iy: 0, sprint: false, ax: dirOf(side, M), ay: 0,
      J: 0, K: 0, Lk: 0, jAt: -1, kAt: -1, lAt: -1, lRest: -1, jTrick: false, kTrick: false, trickPend: -1, lastSp: -9, liftT: 0, swT: 0, moved: false, passes: 0,
      mo: null, moCd: 0, star: 0, curve: 0, perfects: 0, blasts: 0};
    M.ctrls.push(c);
    var team = M.players.filter(function (p) { return p.side === side && !p.gk && p.ctrl < 0; });
    if (team.length) { var p = team[team.length - 1]; setCtrl(M, c, p); }
    return c;
  }
  function setCtrl(M, c, p) {
    if (M.drill && M.players[c.pi]) return;   // 🎯 challenges: you stay you
    if (!p || p.gk) return;
    if (p.ctrl >= 0 && p.ctrl !== c.ci) return;   // a co-op mate has this one
    if (c.pi >= 0) M.players[c.pi].ctrl = -1;
    c.pi = p.i; p.ctrl = c.ci; c.swT = M.t;
  }
  function ctrlOf(M, p) { return p && p.ctrl >= 0 ? M.ctrls[p.ctrl] : null; }
  function teamOf(M, side) { return M.players.filter(function (p) { return p.side === side; }); }
  function keeperOf(M, side) { return M.players.find(function (p) { return p.side === side && p.gk; }); }
  function sideHuman(M, side) { return M.ctrls.some(function (c) { return c.side === side; }); }

  // ---------- formation / shape ----------
  function homeOf(M, p, attack) {
    var S = M.S, d = dirOf(p.side, M), b = M.ball;
    if (p.gk) return {x: -d * (S.Lh - 0.9), y: clamp(b.y * 0.4, -S.goalW * 0.75, S.goalW * 0.75)};
    var f = S.forms[M.forms[p.side]][p.slot], shift = clamp(b.x * d / S.Lh, -1, 1);
    var fx = f[0] + 0.42 * shift + (attack ? 0.3 : -0.04), fy = f[1] * 0.82 + 0.22 * b.y / S.Wh;
    if (attack && f[0] > -0.2) fx += 0.12;   // forwards push on
    fx = clamp(fx, -0.9, attack ? 0.86 : 0.55);
    return {x: d * fx * S.Lh, y: fy * S.Wh};
  }
  function kickoffSetup(M, side) {
    var S = M.S, b = M.ball;
    M.kickSide = side; M.phase = 'kickoff'; M.phaseT = 0; M.rs = null;
    b.x = b.y = b.z = b.vx = b.vy = b.vz = 0; b.owner = -1; b.shot = null; b.offside = null; b.spin = 0; b.held = 0; b.lock = -1; b.pre = null; M.nut = null;
    M.players.forEach(function (p) {
      var d = dirOf(p.side, M), h;
      if (p.gk) h = {x: -d * (S.Lh - 0.9), y: 0};
      else { var f = S.forms[M.forms[p.side]][p.slot]; h = {x: d * Math.min(-0.05, f[0] * 0.95) * S.Lh, y: f[1] * S.Wh * 0.85}; if (h.x * d > -2.2 && Math.abs(h.y) < S.boxW * 0.5 && p.side !== side) h.x = -d * Math.max(S.boxW * 0.5, 2.2); }
      p.x = h.x; p.y = h.y; p.z = 0; p.vx = p.vy = p.vz = 0; p.st = 'ok'; p.stT = 0; p.fx = d; p.fy = 0; p.dive = 0; p.diveT = 0; p.holdT = 0; p.celebrate = 0; p.pressT = 0; p.immune = 0; p.act = null; p.beat = ''; p.bi = 0; p.bq = 0;
    });
    // the kick-off taker stands by the ball
    var taker = nearestOf(M, side, 0, 0, true);
    var c = M.ctrls.find(function (cc) { return cc.side === side; });
    if (c) { setCtrl(M, c, taker && taker.ctrl < 0 ? taker : M.players[c.pi]); taker = M.players[c.pi] || taker; }
    if (taker) { taker.x = -dirOf(side, M) * 0.55; taker.y = 0; b.owner = taker.i; b.last = taker.i; b.lastSide = side; }
    M.ctrls.forEach(function (cc) { if (cc.side !== side) { var me = nearestOf(M, cc.side, 0, 0, true, cc); if (me) setCtrl(M, cc, me); } });
  }
  function nearestOf(M, side, x, y, outfield, notCtrl) {
    var best = null, bd = 1e9;
    M.players.forEach(function (p) {
      if (p.side !== side || (outfield && p.gk) || p.st === 'down') return;
      if (notCtrl && p.ctrl >= 0 && p.ctrl !== notCtrl.ci) return;
      var d = hyp(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; }
    });
    return best;
  }

  // ---------- input from the page / tests ----------
  // stick or keys as a WORLD direction (the page turns screen directions into the world with its camera)
  function input(M, ci, x, y, sprint) { var c = M.ctrls[ci]; if (!c) return; var m = hyp(x, y); if (m > 1) { x /= m; y /= m; m = 1; } c.ix = x; c.iy = y; c.sprint = !!sprint; if (m > 0.2) { c.ax = x / m; c.ay = y / m; c.moved = true; } }
  // logical keys: J pass · K shoot · L trick · SP jump · C switch (the page maps real keys / touch buttons onto these)
  function key(M, ci, k, down) {
    var c = M.ctrls[ci]; if (!c || M.done) return; var t = M.t, p = M.players[c.pi];
    if (M.phase === 'pens') { pensKey(M, c, k, down); return; }
    if (M.battle) { if (k === 'J') c.J = down ? 1 : 0; if (k === 'K') c.K = down ? 1 : 0; if (p) { if (down && (k === 'J' || k === 'K' || k === 'SP')) p.kickT = 0.3; if (down && k === 'L') p.flip = 0.45; } battleKey(M, c, k, down); return; }
    var mine = p && M.ball.owner === p.i, restart = (M.phase === 'restart' || M.phase === 'kickoff') && M.rs && M.rs.taker === (p ? p.i : -2);
    if (k === 'C') { if (down) switchNearest(M, c, true); return; }
    if (k === 'SP') {
      if (!down || !p) return;
      if (mine && t - c.lastSp < 0.32 && M.phase === 'play') { lift(M, p, c); c.lastSp = -9; return; }
      c.lastSp = t; jump(M, p); return;
    }
    if (down && M.drill && M.drill.id === 'juggle' && (k === 'J' || k === 'K' || k === 'SP') && p && M.phase === 'play') { juggle(M, p); return; }
    if (k === 'L') {
      c.Lk = down;
      if (!down) { if (restart && c.lRest >= 0 && !c.J && !c.K && M.rs && M.rs.kind !== 'throw') { c.curve = c.curve === 0 ? 1 : c.curve === 1 ? -1 : 0; ev(M, 'curve', {ci: c.ci, side: c.side, v: c.curve}); } c.lRest = -1; return; }
      if (restart && M.rs && M.rs.kind !== 'kickoff') {   // set piece: J + L = a high ball 🎈 · L tapped alone = bend it (→ ← none, on release)
        if (c.J) { c.jTrick = true; return; } if (c.K) { c.kTrick = true; return; }
        c.lRest = t; return; }
      c.lAt = t;
      if (c.J) { c.jTrick = true; return; }
      if (c.K) { c.kTrick = true; return; }
      c.trickPend = t; return;
    }
    if (k === 'J' || k === 'K') {
      var J = k === 'J';
      if (down) {
        if (J) { c.J = 1; c.jAt = t; } else { c.K = 1; c.kAt = t; }
        if (c.Lk && restart) { c.lRest = -1; if (J) c.jTrick = true; else c.kTrick = true; }
        if (c.trickPend >= 0 && t - c.trickPend < 0.14) { c.trickPend = -1; if (J) c.jTrick = true; else c.kTrick = true; }
        if (!p) return;
        if (J && askBall(M, c)) { c.J = 0; c.jAt = -1; return; }   // 🙋 our goal kick: J = ask the keeper for it
        if (restart) return;   // a set piece kicks on release
        if (!mine) {
          var b = M.ball;
          // volley: Space, Space (lift) then J / K while the ball is up
          if (c.liftT > 0 && b.owner < 0 && b.z > 0.25 && hyp(b.x - p.x, b.y - p.y) < 1.5) { volley(M, p, c, J ? 'pass' : 'shot'); c.J = c.K = 0; c.jAt = c.kAt = -1; return; }
          if (M.drill && M.drill.id === 'volley' && b.owner < 0 && b.z > 0.2 && b.z < 2.6 && hyp(b.x - p.x, b.y - p.y) < 2.1) { volley(M, p, c, J ? 'pass' : 'shot', false, true); c.J = c.K = 0; c.jAt = c.kAt = -1; return; }   // 🌀 drill: K = volley · jump first (Space) = flip
          if (c.mo && c.mo.kind === 'air' && b.owner < 0 && b.z > 0.25 && b.z < 2.6 && hyp(b.x - p.x, b.y - p.y) < 2.0) { perfect(M, c, p); volley(M, p, c, J ? 'pass' : 'shot', true); c.J = c.K = 0; c.jAt = c.kAt = -1; return; }   // ⚡ hit the high ball
          if (J) standTackle(M, p); else if (M.L.slide) slide(M, p); else standTackle(M, p);
          if (J) c.jAt = -1; else c.kAt = -1;
        }
        return;
      }
      // release = kick (hold = more power)
      var at = J ? c.jAt : c.kAt; if (J) { c.J = 0; c.jAt = -1; } else { c.K = 0; c.kAt = -1; }
      var trick = (J ? c.jTrick : c.kTrick) || c.Lk; if (J) c.jTrick = false; else c.kTrick = false;
      if (at < 0 || !p) return;
      var power = clamp((t - at) / 0.75, 0, 1);
      if (restart) { takeRestart(M, p, c, J ? 'pass' : 'shot', power, null, trick); return; }
      if (!mine) return;
      if (J) pass(M, p, {power: power, ax: c.ax, ay: c.ay, aimHelp: M.L.aim, trick: trick, human: true});
      else {
        var perf = c.mo && c.mo.kind === 'oneone'; if (perf) perfect(M, c, p);
        var blast = c.star >= 1 && !trick; if (blast) { c.star = 0; c.blasts++; }   // 🔥 a full star meter = the next shot is a BLAST
        shoot(M, p, {power: power, ax: c.ax, ay: c.ay, aimHelp: M.L.aim, trick: trick, human: true, perfect: perf, blast: blast});
      }
      if (trick) c.trickPend = -1;
    }
  }
  // 📣 shout to your robot keeper: ys = world y side (+1 / -1) the page worked out from the arrow on screen
  function shout(M, ci, ys) { var c = M.ctrls[ci]; if (!c) return; M.shout[c.side] = {s: ys > 0 ? 1 : -1, t: M.t}; ev(M, 'shout', {side: c.side, s: ys > 0 ? 1 : -1}); if (M.phase === 'pens') pensDive(M, c.side, ys > 0 ? 1 : -1); }
  function callPress(M, c) {
    var p = M.players[c.pi]; if (!p) return;
    var b = M.ball, mate = null, bd = 1e9;
    M.players.forEach(function (q) { if (q.side !== c.side || q.gk || q.ctrl >= 0) return; var d = hyp(q.x - b.x, q.y - b.y); if (d < bd) { bd = d; mate = q; } });
    if (mate) { mate.pressT = 3; ev(M, 'call', {by: p.i, mate: mate.i}); }
  }
  function switchNearest(M, c, forced) {
    var b = M.ball, best = null, bd = 1e9;
    M.players.forEach(function (q) { if (q.side !== c.side || q.gk || (q.ctrl >= 0 && q.ctrl !== c.ci) || q.st === 'down') return; var d = hyp(q.x - b.x, q.y - b.y) + (q.i === c.pi ? (forced ? 2.5 : 0) : 0); if (d < bd) { bd = d; best = q; } });
    if (best && best.i !== c.pi) { setCtrl(M, c, best); if (forced) ev(M, 'switch', {side: c.side, to: best.i}); }
  }

  // ---------- actions ----------
  function aimHalf(level) { return [0, 0.5, 0.8, 1.22][level]; }   // pass cone (radians, each side) for aim help 0..3
  function bestPass(M, p, ax, ay, cone, forTrick) {
    var d = dirOf(p.side, M), best = null, bs = -1e9, am = hyp(ax, ay) || 1; ax /= am; ay /= am;
    M.players.forEach(function (q) {
      if (q.side !== p.side || q.i === p.i || q.gk || q.st === 'down') return;
      var dx = q.x - p.x, dy = q.y - p.y, dist = hyp(dx, dy); if (dist < 2 || dist > 34) return;
      var ang = Math.acos(clamp((dx * ax + dy * ay) / dist, -1, 1)); if (ang > cone && !forTrick) return;
      var open = 9; M.players.forEach(function (o) { if (o.side === p.side) return; var t = clamp(((o.x - p.x) * dx + (o.y - p.y) * dy) / (dist * dist), 0, 1); var lx = p.x + dx * t - o.x, ly = p.y + dy * t - o.y; open = Math.min(open, hyp(lx, ly) + (t > 0.95 ? 1 : 0)); });
      var s = -ang * 2.4 + Math.min(open, 4) * 0.9 + (q.x - p.x) * d * 0.08 - Math.abs(dist - 12) * 0.05;
      if (s > bs) { bs = s; best = q; }
    });
    return best;
  }
  function kickBall(M, p, vx, vy, vz, spin) {
    var b = M.ball, S = M.S; b.owner = -1; b.x = p.x + p.fx * 0.35; b.y = p.y + p.fy * 0.35; b.z = Math.max(b.z, 0.05);
    b.y = clamp(b.y, -S.Wh + 0.3, S.Wh - 0.3); if (Math.abs(b.y) > S.goalW) b.x = clamp(b.x, -S.Lh + 0.3, S.Lh - 0.3);   /* a set piece on the line never starts outside */
    b.vx = vx; b.vy = vy; b.vz = vz; b.spin = spin || 0;
    b.last = p.i; b.lastSide = p.side; b.lock = p.i; b.lockT = 0.22; b.held = 0; p.kickT = 0.3; b.offside = null; b.fk = null;
    if (M.twist === 'neon') powerKick(M, p);
  }
  function pass(M, p, o) {
    var b = M.ball; if (b.owner !== p.i) return null;
    if (o.safe) { b.z = 0; b.held = 0; }   // 🧤 a goal kick is played off the ground (not from the keeper's hands)
    var ax = o.ax, ay = o.ay, am = hyp(ax, ay); if (am < 0.2) { ax = p.fx; ay = p.fy; am = 1; } ax /= am; ay /= am;
    var heel = o.trick && (ax * p.fx + ay * p.fy) < -0.3;
    var cone = o.trick ? 1.6 : aimHalf(o.aimHelp == null ? 3 : o.aimHelp), tgt = o.to && o.to.side === p.side ? o.to : cone > 0 || o.trick ? bestPass(M, p, ax, ay, cone, false) : null;
    var power = o.power || 0, speed, tx, ty, loft = o.loft || (power > 0.78 && !o.trick);
    if (tgt) {
      var dist = hyp(tgt.x - p.x, tgt.y - p.y), lead = clamp(dist / 14, 0.2, 0.9);
      tx = tgt.x + tgt.vx * lead; ty = tgt.y + tgt.vy * lead; dist = hyp(tx - p.x, ty - p.y);
      speed = clamp(5 + dist * 0.75 + power * 4, 7, 24) * (o.trick ? 1.12 : 1);
      if (!o.human) { var err = (1 - (o.acc == null ? 0.8 : o.acc)) * 0.5 * (M.rnd() - 0.5); var a = Math.atan2(ty - p.y, tx - p.x) + err; tx = p.x + Math.cos(a) * dist; ty = p.y + Math.sin(a) * dist; }
    } else { speed = 8 + power * 14; tx = p.x + ax * speed; ty = p.y + ay * speed; }
    if (o.safe) { tx = clamp(tx, -M.S.Lh + 3, M.S.Lh - 3); ty = clamp(ty, -M.S.Wh + 2, M.S.Wh - 2); if (!loft) { speed = Math.min(speed, 6 + hyp(tx - p.x, ty - p.y) * 0.62);   /* …and a rolling ball stops before a line: v² / 2·friction ≤ the room left */
        var ux = tx - p.x, uy = ty - p.y, um = hyp(ux, uy) || 1, room = 1e9; ux /= um; uy /= um;
        if (Math.abs(ux) > 0.01) room = Math.min(room, ((ux > 0 ? M.S.Lh : -M.S.Lh) - p.x) / ux); if (Math.abs(uy) > 0.01) room = Math.min(room, ((uy > 0 ? M.S.Wh : -M.S.Wh) - p.y) / uy);
        room = Math.max(4, room - 2); speed = Math.min(speed, Math.sqrt(2 * (M.S.fric || 3.6) * room)); } }   /* 🧤 a goal kick never flies out */
    var dx = tx - p.x, dy = ty - p.y, dm = hyp(dx, dy) || 1;
    if (loft) { var dd = dm, tt = clamp(dd / 16, 0.6, 1.4); kickBall(M, p, dx / tt * 0.82, dy / tt * 0.82, GRAV * tt * 0.5, o.spin || 0); }
    else kickBall(M, p, dx / dm * speed, dy / dm * speed, 0, o.spin || 0);
    b.passer = p.i; b.passT = M.t; b.passTo = tgt ? tgt.i : -1; M.stats[p.side].passes++; p.g.passes++;
    // offside: who is the pass meant for, and were they off when it was played?
    if (tgt && M.L.offside && !M.noOffside && isOffside(M, tgt, p)) b.offside = {i: tgt.i, x: tgt.x, y: tgt.y, side: p.side};
    var kind = heel ? 'heel' : o.trick ? 'nolook' : loft ? 'long' : 'ground';
    ev(M, 'pass', {by: p.i, to: tgt ? tgt.i : -1, kind: kind, side: p.side});
    if (o.trick) trickDone(M, p, heel ? 'heel' : 'nolook');
    var c = ctrlOf(M, p); if (c && tgt && tgt.ctrl < 0) { setCtrl(M, c, tgt); c.passes++; }
    return tgt;
  }
  function isOffside(M, q, passer) {
    var d = dirOf(q.side, M), qx = q.x * d; if (qx <= 0 || qx <= passer.x * d) return false;
    var defs = M.players.filter(function (o) { return o.side !== q.side; }).map(function (o) { return o.x * d; }).sort(function (a, b) { return b - a; });
    var second = defs[1] == null ? -1e9 : defs[1], tol = M.L.offside === 1 ? 1.5 : 0.2;
    return qx > second + tol;
  }
  function goalPoint(M, side) { return {x: dirOf(side, M) * M.S.Lh, y: 0}; }
  function shoot(M, p, o) {
    var b = M.ball; if (b.owner !== p.i && !o.volley) return;
    var S = M.S, d = dirOf(p.side, M), gx = d * S.Lh, power = clamp(o.power || 0, 0, 1), help = o.aimHelp == null ? 3 : o.aimHelp;
    var ax = o.ax, ay = o.ay, am = hyp(ax, ay); if (am < 0.2) { ax = d; ay = 0; am = 1; } ax /= am; ay /= am;
    var kind = 'shot', keeper = keeperOf(M, 1 - p.side), dist = hyp(gx - p.x, p.y);
    if (o.perfect || o.blast) { help = Math.max(help, 2); power = Math.max(power, o.blast ? 0.75 : 0.55); }
    if (o.trick) kind = b.z > 1.0 || (o.volley && b.z > 0.9) ? 'bicycle' : dist < 15 && keeper && Math.abs(keeper.x - gx) > 1.6 ? 'chip' : 'rabona';
    // where on the goal line: the stick's sideways part picks the corner; no stick = the far post
    var side = Math.abs(ay) > 0.25 ? Math.sign(ay) : (Math.abs(p.y) > 1.5 ? -Math.sign(p.y) : (M.rnd() < 0.5 ? -1 : 1));
    var ty = side * S.goalW * (0.55 + 0.25 * Math.abs(ay)), tz;
    if (help >= 1) ty = clamp(ty, -S.goalW + 0.45, S.goalW - 0.45);
    if (!o.human) { var acc = o.acc == null ? 0.6 : o.acc; ty += (M.rnd() - 0.5) * (1 - acc) * S.goalW * 2.4; }
    else ty += (M.rnd() - 0.5) * [1.8, 0.9, 0.5, 0.25][help] * (0.5 + power);
    if (help === 0 && Math.abs(ay) > 0.2 && o.human) ty = p.y + ay / Math.max(0.2, Math.abs(ax)) * dist * 0.8;   // no aim help = the stick decides
    var speed = 13 + power * 15, vz;
    if (kind === 'chip') { speed = 11; }
    if (o.volley) speed = Math.max(speed, 24);
    if (o.flip) kind = b.z > 1.25 ? 'bicycle' : 'flip';
    if (kind === 'bicycle' || kind === 'flip') speed = 25;
    if (o.blast) { kind = 'blast'; speed = 33; }
    var dx = gx - p.x, dy = ty - p.y, dm = hyp(dx, dy) || 1, tt = dm / speed;
    var hk = Math.min(1, S.goalH / 2);   /* small goals (street cage) = lower shots */
    tz = kind === 'chip' ? S.goalH - Math.min(0.55, S.goalH * 0.35) : clamp((0.25 + power * 1.3 + (help === 0 && o.human ? power * power * 1.2 : 0)) * hk, 0.15, help >= 2 ? S.goalH - 0.4 * hk : 3.2 * hk);
    vz = kind === 'chip' ? GRAV * tt * 0.5 + (tz - 0) / tt : (tz - Math.max(0.1, b.z)) / tt + GRAV * tt * 0.5 * 0.92;
    kickBall(M, p, dx / tt, dy / tt, vz, kind === 'rabona' ? -side * 5 : (o.spin || 0));
    if (kind === 'rabona') b.vy += side * 5 * tt * 0.5;   // curve back in on the way
    b.shot = {side: p.side, by: p.i, t: M.t, kind: kind, decided: false, power: power, perfect: !!o.perfect, blast: !!o.blast, fk: !!o.fk};
    M.stats[p.side].shots++; p.g.shots++;
    var e = ev(M, 'shot', {by: p.i, side: p.side, kind: kind, power: Math.round(power * 100) / 100, volley: !!o.volley, perfect: !!o.perfect, blast: !!o.blast, curve: o.spin ? Math.sign(o.spin) : 0});
    if (o.blast) ev(M, 'blast', {by: p.i, side: p.side});
    if (o.trick) trickDone(M, p, kind);
    return e;
  }
  function trickDone(M, p, name) { M.stats[p.side].tricks++; p.g.tricks++; p.trickName = name; ev(M, 'trick', {by: p.i, name: name, side: p.side, label: TRICKS[name] || name}); starAdd(M, ctrlOf(M, p), 0.1); }
  function trick(M, p, c) {
    var b = M.ball; if (b.owner !== p.i || p.cd > 0) return;
    var ax = c ? c.ix : 0, ay = c ? c.iy : 0, m = hyp(ax, ay), along = m > 0.2 ? (ax * p.fx + ay * p.fy) / m : 1;
    var name = m < 0.2 ? 'stepover' : along < -0.4 ? 'roulette' : along < 0.45 ? 'elastico' : c && c.sprint ? 'rainbow' : 'stepover';
    var nq = c || M.S.nutPoint ? nutTarget(M, p) : null; if (nq && (m < 0.2 || along >= 0.45) && !(c && c.sprint && !M.S.nutPoint)) { nutmeg(M, p, nq, c && c.mo && c.mo.kind === 'beat' ? (perfect(M, c, p), 'ok') : undefined); return; }
    // a defender close by can read it (never on 🌱 Basic: tricks always land)
    var close = M.players.some(function (o) { return o.side !== p.side && !o.gk && hyp(o.x - p.x, o.y - p.y) < 1.7; });
    var perf = c && c.mo && c.mo.kind === 'beat'; if (perf) { perfect(M, c, p); close = false; }   // ⚡ right on the prompt = it always lands p.st = 'stumble'; p.stT = 0.45; b.owner = -1; b.vx = p.fx * 2 + (M.rnd() - 0.5) * 3; b.vy = p.fy * 2 + (M.rnd() - 0.5) * 3; b.last = p.i; b.lock = p.i; b.lockT = 0.5; ev(M, 'trickfail', {by: p.i, name: name}); p.cd = 0.8; return; }
    p.immune = name === 'roulette' ? 0.7 : 0.55; p.cd = 0.8;
    if (name === 'elastico') { var sx = m > 0.2 ? ax / m : -p.fy, sy = m > 0.2 ? ay / m : p.fx; p.vx += sx * 6; p.vy += sy * 6; p.burst = 0.35; }
    else if (name === 'roulette') { p.fx = -p.fx; p.fy = -p.fy; p.burst = 0.3; }
    else if (name === 'rainbow') { b.owner = -1; b.x = p.x; b.y = p.y; b.z = 0.4; b.vx = p.fx * 6.5 + p.vx * 0.4; b.vy = p.fy * 6.5 + p.vy * 0.4; b.vz = 6.2; b.last = p.i; b.lastSide = p.side; b.lock = p.i; b.lockT = 0.55; p.immune = 1.2; }
    else p.burst = 0.4;
    trickDone(M, p, name);
  }
  // 🎤 bo-3b Tricks Battle: turns of tricks ON the beat, 3 judges (🎵 timing · 🌈 variety · ✨ style), best of 3 rounds
  var BTRICK = {J: ['stepover', '🦶 Stepover', 10], K: ['rainbow', '🌈 Rainbow', 20], L: ['atw', '🌀 Around the world', 25], SP: ['knee', '🦵 Knee juggle', 10], JK: ['neck', '🧢 Neck stall', 35]};
  var BPM = [80, 88, 96, 104, 112, 120], B_PERF = [0.12, 0.1, 0.085, 0.075, 0.065, 0.06], B_GOOD = [0.24, 0.2, 0.17, 0.15, 0.13, 0.12];
  var B_ROBOT = [[0.45, 0.2], [0.55, 0.3], [0.66, 0.4], [0.75, 0.52], [0.84, 0.62], [0.9, 0.72]];   // robot dancer per level: hit chance, perfect share
  function battleStart(M, o) {
    M.twist = null; M.party = false;
    o = o || {}; var lv = M.level;
    M.battle = {round: 1, rounds: 3, wins: [0, 0], turn: 0, t: 0, phase: 'intro', phaseT: 0, beat: 60 / BPM[lv], turnLen: o.turnLen || (M.fast ? 6 : 20), cur: null, cards: null, last: null, hist: [], score: [0, 0]};
    M.phase = 'battle'; M.ball.owner = -1; ev(M, 'battle', {rounds: 3, bpm: BPM[lv]}); battleTurn(M, 0);
    return M.battle;
  }
  function battleTurn(M, side) {
    var B = M.battle; B.turn = side; B.phase = 'intro'; B.phaseT = 0; B.cards = null;
    B.cur = {side: side, pts: 0, perfect: 0, good: 0, miss: 0, combo: 0, maxCombo: 0, used: {}, last: [], lastBeat: -1, beats: 0, robotNext: 0};
    ev(M, 'bturn', {side: side, round: B.round, human: sideHuman(M, side)});
  }
  function battleHit(M, key, off) {
    var B = M.battle, C = B.cur, lv = M.level, k = Math.round(B.phaseT / B.beat), tr = BTRICK[key];
    if (k === C.lastBeat) { C.miss++; C.combo = 0; ev(M, 'bmiss', {side: C.side, why: 'one trick a beat'}); return; }
    C.lastBeat = k;
    var a = Math.abs(off), grade = a <= B_PERF[lv] ? 'perfect' : a <= B_GOOD[lv] ? 'good' : 'miss';
    if (grade === 'miss') { C.miss++; C.combo = 0; ev(M, 'bmiss', {side: C.side, why: off < 0 ? 'early' : 'late', trick: tr[0]}); return; }
    var fresh = C.last.indexOf(tr[0]) < 0; C.combo = fresh ? C.combo + 1 : Math.max(1, Math.floor(C.combo / 2)); C.maxCombo = Math.max(C.maxCombo, C.combo);
    C.last.push(tr[0]); if (C.last.length > 2) C.last.shift(); C.used[tr[0]] = (C.used[tr[0]] || 0) + 1;
    if (grade === 'perfect') C.perfect++; else C.good++;
    var pts = Math.round(tr[2] * (grade === 'perfect' ? 1 : 0.6) * Math.min(5, 1 + Math.floor(C.combo / 2)));
    C.pts += pts; B.last = {side: C.side, trick: tr[0], t: M.t};
    ev(M, 'btrick', {side: C.side, trick: tr[0], label: tr[1], grade: grade, pts: pts, combo: C.combo});
  }
  function battleKey(M, c, k, down) {
    var B = M.battle; if (!B || B.phase !== 'turn' || B.cur.side !== c.side || !down) return;
    if (k !== 'J' && k !== 'K' && k !== 'L' && k !== 'SP') return;
    var key = (k === 'K' && c.J) || (k === 'J' && c.K) ? 'JK' : k;
    var tb = B.phaseT, off = tb - Math.round(tb / B.beat) * B.beat;
    if (key === 'JK' && B.cur.lastBeat === Math.round(tb / B.beat) && B.last && B.last.side === c.side) { B.cur.lastBeat = -1; B.cur.pts = Math.max(0, B.cur.pts - 10); }   // the 2nd key of a chord turns the trick into a neck stall
    battleHit(M, key, off);
  }
  function battleCards(M) {
    var B = M.battle, C = B.cur, beats = Math.max(1, Math.floor(B.turnLen / B.beat)), kinds = Object.keys(C.used).length;
    var timing = clamp(Math.round(10 * (C.perfect + 0.6 * C.good) / (beats * 0.7) - C.miss * 0.3), 1, 10);
    var variety = clamp(Math.round(kinds * 2 + (C.perfect + C.good > 0 ? 1 : 0) + Math.min(1, C.maxCombo / 6)), 1, 10);
    var style = clamp(Math.round(1 + C.maxCombo * 0.9 + C.pts / 250), 1, 10);
    B.cards = [timing, variety, style]; B.score[C.side] = timing + variety + style; B.pts = B.pts || [0, 0]; B.pts[C.side] = C.pts;
    ev(M, 'bcards', {side: C.side, cards: B.cards.slice(), total: B.score[C.side], pts: C.pts});
  }
  function battleRobot(M, dt) {   // a robot dancer: one trick per beat, aiming at the beat with level-based accuracy
    var B = M.battle, C = B.cur, R = B_ROBOT[M.level], k = Math.round(B.phaseT / B.beat), tNext = (C.beats + 1) * B.beat;
    if (B.phaseT >= tNext + (C.robotNext || 0)) {
      C.beats++;
      var off = M.rnd() < R[0] ? (M.rnd() < R[1] ? (M.rnd() - 0.5) * B_PERF[M.level] : (M.rnd() < 0.5 ? -1 : 1) * (B_PERF[M.level] + M.rnd() * (B_GOOD[M.level] - B_PERF[M.level]) * 0.9)) : (M.rnd() < 0.5 ? -1 : 1) * (B_GOOD[M.level] + 0.05);
      var keys = ['J', 'K', 'L', 'SP', 'JK'], pick = M.level < 2 && M.rnd() < 0.5 ? (C.last[C.last.length - 1] === 'stepover' ? 'J' : 'SP') : keys[Math.floor(M.rnd() * (M.level >= 3 ? 5 : 4))];
      battleHit(M, pick, off);
      C.robotNext = 0;
    }
  }
  function battleStep(M, dt) {
    var B = M.battle; B.phaseT += dt; B.t += dt;
    M.players.forEach(function (p) { p.vx *= 0.8; p.vy *= 0.8; if (p.celebrate > 0) p.celebrate -= dt; if (p.kickT > 0) p.kickT -= dt; });
    if (B.phase === 'intro') { if (B.phaseT > (M.fast ? 0.2 : 2.4)) { B.phase = 'turn'; B.phaseT = 0; ev(M, 'bgo', {side: B.turn}); } return; }
    if (B.phase === 'turn') {
      if (!sideHuman(M, B.turn)) battleRobot(M, dt);
      if (B.phaseT >= B.turnLen) { B.phase = 'cards'; B.phaseT = 0; battleCards(M); }
      return;
    }
    if (B.phase === 'cards') {
      if (B.phaseT < (M.fast ? 0.2 : 3.2)) return;
      if (B.turn === 0) { battleTurn(M, 1); return; }
      var w = B.score[0] > B.score[1] ? 0 : B.score[1] > B.score[0] ? 1 : (B.pts[0] >= B.pts[1] ? 0 : 1);
      B.wins[w]++; B.hist.push({round: B.round, score: B.score.slice(), pts: B.pts.slice(), winner: w}); M.score = B.wins.slice();
      ev(M, 'bround', {round: B.round, winner: w, score: B.score.slice(), wins: B.wins.slice()});
      if (B.wins[w] >= 2) { B.phase = 'done'; endMatch(M); return; }
      B.round++; battleTurn(M, B.round % 2 ? 0 : 1);   // the loser of… simply alternate who starts
    }
  }
  // 🎯 bo-3a skill challenges (⭐⭐⭐ each) — the match engine with a few players, no clock, no restarts
  var DRILLS = {
    target: {name: '🎯 Target shots', balls: 5, stars: [1, 2, 4], about: 'Hit the 4 corner targets — 5 balls'},
    bar: {name: '✖️ Crossbar', balls: 5, stars: [1, 2, 3], about: 'Hit the crossbar from 16 m — 5 balls'},
    cones: {name: '🔶 Dribble cones', time: true, about: 'Dribble through the cones to the flag — fast! (a cone hit = +1.5 s)'},
    juggle: {name: '🦶 Keepy-ups', stars: [5, 12, 25], about: 'Kick it up before it lands (J / K / Space)'},
    fk: {name: '🧱 Free kicks', balls: 5, stars: [1, 2, 3], keeper: true, wall: true, about: 'Over or round the wall — 5 free kicks'},
    long: {name: '🎯 Long pass', balls: 5, stars: [2, 3, 5], runner: true, about: 'Hit the running teammate — 5 passes (J + L = high)'},
    volley: {name: '🌀 Volleys', balls: 5, stars: [1, 2, 4], keeper: true, about: 'Volley the crosses — Space Space K = flip, or K'}
  };
  var CONE_STARS = [[30, 22, 16], [27, 20, 15], [25, 18, 14], [23, 17, 13], [21, 16, 12], [20, 15, 11.5]];   // seconds for ⭐ ⭐⭐ ⭐⭐⭐ per level
  function drill(M, id) {
    M.twist = null; M.party = false;
    var D = DRILLS[id]; if (!D) return null; var S = M.S, c = M.ctrls[0], me = c ? M.players[c.pi] : M.players.find(function (p) { return p.side === 0 && !p.gk; });
    var keep = [me];
    if (D.keeper) keep.push(keeperOf(M, 1));
    if (D.wall) M.players.filter(function (p) { return p.side === 1 && !p.gk; }).slice(0, 3).forEach(function (p) { keep.push(p); });
    if (D.runner) { var r = M.players.find(function (p) { return p.side === 0 && !p.gk && p !== me; }); r.drillRole = 'runner'; keep.push(r); }
    M.players = keep; keep.forEach(function (p, i) { p.i = i; p.ctrl = -1; p.st = 'ok'; p.vx = p.vy = 0; });
    M.ctrls.forEach(function (cc, i) { cc.pi = i === 0 ? 0 : -1; if (i === 0) me.ctrl = 0; });
    M.drill = {id: id, name: D.name, n: 0, score: 0, t: 0, limit: 90, live: false, deadT: 0, targets: [], cones: [], pen: 0, best: 0};
    M.noOffside = true; M.noPens = true; M.phase = 'play'; M.rs = null; M.clock = 0; M.halfLen = 1e9; M.drillCount = 0;
    if (id === 'target') { var gw = S.goalW - 0.45; M.drill.targets = [[-gw, 0.45], [gw, 0.45], [-gw, S.goalH - 0.45], [gw, S.goalH - 0.45]].map(function (t) { return {y: t[0], z: t[1], hit: false}; }); }
    if (id === 'cones') { for (var k = 0; k < 6; k++) M.drill.cones.push({x: -S.Lh * 0.5 + 4 + k * 3.4, y: (k % 2 ? 1 : -1) * 0.9, hit: false}); M.drill.finish = M.drill.cones[5].x + 4; }
    drillNext(M, true); ev(M, 'drill', {id: id, name: D.name, about: D.about}); return M.drill;
  }
  function drillMe(M) { return M.players[M.ctrls[0] ? M.ctrls[0].pi : 0]; }
  function drillNext(M, first) {
    var d = M.drill, D = DRILLS[d.id], S = M.S, b = M.ball, me = drillMe(M);
    if (!first && D.balls && d.n >= D.balls) { drillEnd(M); return; }
    if (!first && d.id === 'juggle') { drillEnd(M); return; }
    d.live = false; d.deadT = 0; d.shotAt = -1; b.shot = null; b.spin = 0; b.vx = b.vy = b.vz = 0; b.z = 0; b.lock = -1; b.fk = null; b.last = me.i; b.lastSide = 0; M.phase = 'play'; M.rs = null;
    me.st = 'ok'; me.vx = me.vy = 0; me.fx = 1; me.fy = 0; me.z = 0; me.vz = 0;
    var k = keeperOf(M, 1); if (k) { k.x = S.Lh - 0.4; k.y = 0; k.st = 'ok'; k.vx = k.vy = 0; }
    var y0 = (M.rnd() - 0.5) * 8;
    if (d.id === 'target' || d.id === 'bar') { me.x = S.Lh - 16; me.y = y0; b.owner = me.i; }
    else if (d.id === 'cones') { me.x = -S.Lh * 0.5; me.y = 0; b.owner = me.i; }
    else if (d.id === 'juggle') { me.x = 0; me.y = 0; b.owner = -1; b.x = 0.4; b.y = 0; b.z = 0.6; b.vz = 3.2; d.live = true; }
    else if (d.id === 'fk') { me.x = S.Lh - 21; me.y = y0 * 0.6; b.owner = me.i; b.x = me.x + 0.4; b.y = me.y; restart(M, 'free', 0, S.Lh - 20, y0 * 0.6); M.players.forEach(function (p) { if (p.side === 1 && !p.gk) p.drillRole = 'wallman'; }); if (M.rs && M.rs.wall) M.rs.wall.forEach(function (w) { var q = M.players[w.i]; q.x = w.x; q.y = w.y; }); }
    else if (d.id === 'long') { me.x = -S.Lh * 0.45; me.y = S.Wh * 0.4; b.owner = me.i; var r = M.players.find(function (p) { return p.drillRole === 'runner'; }); r.x = -S.Lh * 0.1; r.y = -S.Wh * 0.55 + M.rnd() * 3; r.vx = r.vy = 0; d.runFrom = r.x; }
    else if (d.id === 'volley') { me.x = S.Lh - 9; me.y = (M.rnd() - 0.5) * 3; b.owner = -1; var sy = (M.rnd() < 0.5 ? -1 : 1) * S.Wh * 0.75, sx = S.Lh - 13, T = 1.25; b.x = sx; b.y = sy; b.z = 0.3; b.vx = (me.x - sx) / T; b.vy = (me.y - sy) / T; b.vz = (1.2 - 0.3 + 0.5 * GRAV * T * T) / T; b.last = -1; b.lastSide = 1; d.live = true; d.n++; d.shotAt = M.t; ev(M, 'cross', {}); }
    if (!first || true) ev(M, 'drillball', {id: d.id, n: d.n, of: D.balls || 0});
  }
  function drillHit(M, what) { var d = M.drill; d.score++; ev(M, 'drillhit', {id: d.id, what: what, score: d.score}); }
  function drillGoal(M, side) {
    var d = M.drill, b = M.ball, S = M.S;
    if (side === 0 && d.id === 'target') { var hit = d.targets.filter(function (t) { return !t.hit && hyp(b.y - t.y, b.z - t.z) < 0.8; })[0]; if (hit) { hit.hit = true; drillHit(M, 'target'); } else ev(M, 'drillmiss', {why: 'goal, no target'}); }
    else if (side === 0 && (d.id === 'fk' || d.id === 'volley')) drillHit(M, 'goal');
    b.vx *= 0.15; b.vy *= 0.15; b.vz = 0; b.shot = null; drillDead(M, 'goal');
  }
  function drillDead(M, why) { var d = M.drill; if (d.deadT > 0) return; d.deadT = M.t; d.why = why; M.ball.shot = null; if (why === 'out') { M.ball.vx = M.ball.vy = M.ball.vz = 0; } }
  function juggle(M, p) {
    var b = M.ball, d = M.drill; if (b.owner >= 0 || b.z > 1.1 || hyp(b.x - p.x, b.y - p.y) > 1.5 || d.deadT) return;
    b.vz = 4.0 + M.rnd() * 0.6; b.vx = (p.x - b.x) * 0.8 + (M.rnd() - 0.5) * 1.2; b.vy = (p.y - b.y) * 0.8 + (M.rnd() - 0.5) * 1.2; p.kickT = 0.25;
    d.score++; ev(M, 'juggle', {n: d.score}); if (d.score % 5 === 0) starAdd(M, M.ctrls[0], 0.05);
  }
  function drillRunner(M, p, dt) {   // 🏃 the teammate for the long pass: runs up the far side; chases a ball that comes near
    var d = M.drill, b = M.ball;
    if (b.owner === p.i) { steer(p, 0, 0, dt); return; }
    if (d.passAt) { if (b.owner < 0 && hyp(b.x - p.x, b.y - p.y) < 6) { moveTo(M, p, b.x, b.y, dt, 1); return; } }
    moveTo(M, p, Math.min(M.S.Lh * 0.6, p.x + 4), p.y, dt, 0.55);
  }
  function drillStep(M, dt) {
    var d = M.drill, D = DRILLS[d.id], b = M.ball, S = M.S, me = drillMe(M);
    d.t += dt; M.clock = d.t;
    if (d.t > d.limit && !M.done) { drillEnd(M); return; }
    if (d.id === 'cones') {
      d.cones.forEach(function (cn) { if (!cn.hit && hyp(b.x - cn.x, b.y - cn.y) < 0.45) { cn.hit = true; d.pen += 1.5; ev(M, 'conehit', {pen: d.pen}); } });
      if (b.owner === me.i && me.x > d.finish) { d.time = Math.round((d.t + d.pen) * 10) / 10; drillEnd(M); }
      if (b.owner < 0 && hyp(b.vx, b.vy) < 0.3 && hyp(b.x - me.x, b.y - me.y) > 3) { b.x = me.x + me.fx * 0.4; b.y = me.y; }
      return;
    }
    if (d.id === 'juggle') { if (b.z <= 0.02 && b.vz <= 0.01 && d.t > 0.6) { ev(M, 'drillmiss', {why: 'it landed'}); drillEnd(M); } return; }
    if (d.id === 'long') {
      var r = M.players.find(function (q) { return q.drillRole === 'runner'; });
      if (!d.live && b.owner < 0 && b.last === me.i) { d.live = true; d.n++; d.passAt = M.t; }
      if (d.live && b.owner === r.i) { drillHit(M, 'pass'); d.passAt = 0; drillNext(M); return; }
      if (d.live && (M.t - d.passAt > 4 || d.deadT)) { ev(M, 'drillmiss', {why: 'missed'}); d.passAt = 0; drillNext(M); }
      return;
    }
    // shots: target · bar · fk · volley
    if (!d.live && b.shot && b.shot.by === me.i) { d.live = true; d.n++; d.shotAt = M.t; }
    if (!d.live && b.owner < 0 && d.id === 'fk' && M.phase === 'play' && b.last === me.i && hyp(b.vx, b.vy) > 3) { d.live = true; d.n++; d.shotAt = M.t; }
    var k = keeperOf(M, 1);
    if (d.live && !d.deadT && (b.owner >= 0 && (b.owner !== me.i || d.id === 'volley') || (b.owner < 0 && hyp(b.vx, b.vy) < 0.4 && b.z < 0.05 && M.t - d.shotAt > 0.8) || M.t - d.shotAt > 4)) drillDead(M, 'stopped');
    if (d.deadT && M.t - d.deadT > (M.fast ? 0.2 : 1.1)) drillNext(M);
  }
  function drillEnd(M) {
    var d = M.drill, D = DRILLS[d.id]; if (M.done) return;
    var lv = Math.min(5, M.level), st = 0;
    if (D.time) { var th = CONE_STARS[lv]; st = d.time == null ? 0 : d.time <= th[2] ? 3 : d.time <= th[1] ? 2 : d.time <= th[0] ? 1 : 0; }
    else st = d.score >= D.stars[2] ? 3 : d.score >= D.stars[1] ? 2 : d.score >= D.stars[0] ? 1 : 0;
    d.stars = st; M.score = [d.score, 0]; M.winner = st > 0 ? 0 : 1;
    M.done = true; M.phase = 'end'; M.phaseT = 0;
    ev(M, 'drillend', {id: d.id, score: d.score, time: d.time, stars: st});
    ev(M, 'end', {winner: M.winner, score: M.score.slice(), drill: d.id, stars: st});
  }
  // ⚡ bo-2c critical moments (people only): 'beat' a defender right in front (L) · 'air' a high ball by you in their box (K / J) · 'oneone' you alone at the keeper (K)
  function momentOf(M, p, c) {
    var b = M.ball, S = M.S, d = dirOf(p.side, M), gx = d * S.Lh;
    if (b.owner === p.i) {
      var dist = hyp(gx - p.x, p.y), k = keeperOf(M, 1 - p.side);
      var ahead = M.players.filter(function (o) { if (o.side === p.side || o.gk || o.st !== 'ok') return false; var dx = o.x - p.x, dy = o.y - p.y, dd = hyp(dx, dy); return dd < 2.2 && dd > 0.4 && (dx * p.fx + dy * p.fy) / dd > 0.55; });
      if (ahead.length) return 'beat';
      if (k && dist < Math.min(16, S.Lh * 0.75) && (p.x - gx) * -d > 0) {
        var block = M.players.some(function (o) { if (o.side === p.side || o.gk) return false; var t = ((o.x - p.x) * (gx - p.x) + (o.y - p.y) * (0 - p.y)) / (dist * dist); if (t < 0 || t > 1) return false; return hyp(p.x + (gx - p.x) * t - o.x, p.y - p.y * t - o.y) < 2.5; });
        if (!block) return 'oneone';
      }
      return null;
    }
    if (b.owner < 0 && b.z > 0.9 && b.z < 2.6 && hyp(b.x - p.x, b.y - p.y) < 2.4 && (b.x * d) > S.Lh - S.boxL - 4 && p.st === 'ok') return 'air';
    return null;
  }
  function moments(M) {
    M.ctrls.forEach(function (c) {
      var p = M.players[c.pi];
      if (!p || M.phase !== 'play') { c.mo = null; return; }
      if (c.mo) { if (M.t - c.mo.t > c.mo.win || momentOf(M, p, c) !== c.mo.kind) { ev(M, 'momentend', {ci: c.ci, kind: c.mo.kind}); c.mo = null; } return; }
      if (M.t < c.moCd) return;
      var kind = momentOf(M, p, c); if (!kind) return;
      c.mo = {kind: kind, key: MO_KEY[kind], t: M.t, win: MO_WIN[M.level]}; c.moCd = M.t + 3.2;
      ev(M, 'moment', {ci: c.ci, by: p.i, side: c.side, kind: kind, key: c.mo.key, win: c.mo.win});
    });
  }
  function perfect(M, c, p) { if (!c || !c.mo) return; ev(M, 'perfect', {ci: c.ci, by: p.i, side: c.side, kind: c.mo.kind}); c.mo = null; c.moCd = M.t + 2; c.perfects++; starAdd(M, c, 0.34); }
  // 🔥 star meter: perfect moments, tricks, tackles and goals fill it — full = the next shot is a 🔥 BLAST
  function starAdd(M, c, v) { if (!c) return; var was = c.star; c.star = Math.min(1, c.star + v); if (was < 1 && c.star >= 1) ev(M, 'starfull', {ci: c.ci, side: c.side}); }
  // 🥜 nutmeg: a defender right in front, facing you → the ball goes through their legs and you run round them
  function nutTarget(M, p) {
    var best = null, bd = 9;
    M.players.forEach(function (q) {
      if (q.side === p.side || q.gk || q.st !== 'ok' || q.z > 0.05) return;
      var dx = q.x - p.x, dy = q.y - p.y, d = hyp(dx, dy); if (d < 0.5 || d > 2.3) return;
      if ((dx * p.fx + dy * p.fy) / d < 0.75 || (q.fx * p.fx + q.fy * p.fy) > -0.2) return;
      if (d < bd) { bd = d; best = q; }
    });
    return best;
  }
  function nutmeg(M, p, q, force) {
    var b = M.ball; p.cd = 0.9;
    var fail = M.L.trickFail * (M.S.nutPoint ? 1.6 : 1.3) + (M.L.trickFail > 0 ? (ctrlOf(M, q) ? 0.12 : M.L.tackle * 0.25) : 0);
    if (force !== 'ok' && (force === 'fail' || M.rnd() < fail)) {   // they close their legs
      b.owner = q.i; b.last = q.i; b.lastSide = q.side; b.shot = null; b.offside = null; p.st = 'stumble'; p.stT = 0.45;
      ev(M, 'trickfail', {by: p.i, name: 'nutmeg', on: q.i}); M.nut = null; return false;
    }
    var dx = q.x - p.x, dy = q.y - p.y, d = hyp(dx, dy) || 1;
    b.owner = -1; b.x = p.x + dx / d * 0.35; b.y = p.y + dy / d * 0.35; b.z = 0; b.vx = dx / d * 5.6; b.vy = dy / d * 5.6; b.vz = 0; b.spin = 0;
    b.last = p.i; b.lastSide = p.side; b.lock = q.i; b.lockT = 0.75; b.held = 0; b.offside = null; b.shot = null;
    p.immune = 0.8; p.burst = 0.7; p.role = 'chase'; p.aiT = 0.6; q.st = 'stumble'; q.stT = 0.35;
    M.nut = {by: p.i, on: q.i, t: M.t, x: q.x, y: q.y, dx: dx / d, dy: dy / d};
    trickDone(M, p, 'nutmeg');
    return true;
  }
  function gravOf(M) { return GRAV * (M.twist === 'moon' ? 0.55 : 1); }
  function jumpV(M, h) { return Math.sqrt(2 * gravOf(M) * h); }
  function airTime(M, h) { return 2 * jumpV(M, h) / gravOf(M); }
  // 🎬 start an action: o.antic = the anticipation fitted to the game's moment (ms; < 60 = skipped, the B1 rule)
  function startAct(M, p, key, o) {
    o = o || {}; p.act = key; p.actN = (p.actN || 0) + 1; p.actT = 0; p.bi = 0; p.bt = 0; p.bq = 0; p.beat = ACT_BEATS[key][0].n; p.actAir = 0;
    p.actAnt = o.antic == null ? null : (o.antic < 60 ? 0 : o.antic); p.actK = M.level === 0 ? 1.15 : 1; p.actO = o;
    ev(M, 'act', {by: p.i, act: key}); actTick(M, p, 0);
  }
  function beatLen(p, i) { var b = ACT_BEATS[p.act][i]; var ms = i === 1 && p.actAnt != null ? p.actAnt : b.ms; return b.go ? ms : ms * p.actK; }
  function actTick(M, p, dt) {
    if (!p.act) return; var B = ACT_BEATS[p.act]; p.actT += dt; p.bt += dt * 1000;
    for (var n = 0; n < 8; n++) {
      var b = B[p.bi];
      if (b.air) {   // the follow-through in the air: until the feet are down again
        p.bq = p.actAir > 0 ? Math.min(0.98, p.bt / p.actAir) : 1;
        if (p.z <= 0 && p.vz <= 0 && p.bt > 30) { p.bi++; p.bt = 0; } else break;
      } else { var L = beatLen(p, p.bi); p.bq = L > 0 ? Math.min(1, p.bt / L) : 1; if (p.bt >= L) { p.bt -= L; p.bi++; } else break; }
      if (p.bi >= B.length) { p.act = null; p.beat = ''; p.bi = 0; return; }
      if (B[p.bi].go) actContact(M, p);
    }
    p.beat = B[p.bi] ? B[p.bi].n : '';
  }
  // 💥 THE CONTACT MOMENT — take-off / dive / catch happen here (events too)
  function actContact(M, p) {
    var k = p.act, h = JUMPS[k];
    if (k === 'hop' || k === 'dodge' || k === 'gkhigh') { p.vz = Math.max(p.vz, jumpV(M, h)); p.actAir = airTime(M, h) * 1000; ev(M, 'jump', {by: p.i, kind: k}); }
    else if (k === 'gkdive') { var a = airTime(M, h); p.vz = Math.max(p.vz, jumpV(M, h)); p.actAir = a * 1000; p.st = 'dive'; p.stT = 0.01; p.diveT = a + 0.08; ev(M, 'jump', {by: p.i, kind: k}); }   /* the game state stays as before (down 0.4 s, sims: win rates unchanged) — the page draws the flight toward diveY */
  }
  // a jump still in its anticipation → take off NOW (a K / volley right after Space)
  function jumpNow(M, p) { if ((p.act === 'hop' || p.act === 'dodge') && p.bi < 2) { p.bi = 2; p.bt = 0; actContact(M, p); p.beat = 'contact'; } }
  function rising(p) { return p.z > 0.02 || p.vz > 0 || ((p.act === 'hop' || p.act === 'dodge') && p.bi < 3); }
  // 🛝 a jump dodge (hurdle) when a slide comes or a leg is in the way, else a hop
  function threatened(M, p) {
    for (var i = 0; i < M.players.length; i++) { var q = M.players[i]; if (q.side === p.side) continue; var d = hyp(q.x - p.x, q.y - p.y); if ((q.st === 'slide' && d < 4.5) || (q.st === 'ok' && !q.gk && d < 1.4)) return true; }
    return false;
  }
  function jump(M, p) {
    if (p.z > 0.02 || p.st !== 'ok' || p.gk || p.act === 'hop' || p.act === 'dodge') return;
    var kind = threatened(M, p) ? 'dodge' : 'hop', B = ACT_BEATS[kind];
    p.immune = Math.max(p.immune, (B[0].ms + B[1].ms + B[2].ms) / 1000 + airTime(M, JUMPS[kind]) * 0.85);   // safe from the press on: the sliding leg passes under
    startAct(M, p, kind);
  }
  function lift(M, p, c) {
    var b = M.ball; if (b.owner !== p.i) return;
    b.owner = -1; b.x = p.x + p.fx * 0.3; b.y = p.y + p.fy * 0.3; b.z = 0.3; b.vx = p.vx * 0.9; b.vy = p.vy * 0.9; b.vz = 4.6; b.lock = p.i; b.lockT = 0.75; b.last = p.i; b.lastSide = p.side;
    if (c) c.liftT = 1.5; ev(M, 'lift', {by: p.i, side: p.side});
  }
  function volley(M, p, c, what, perf, plain) {
    var b = M.ball; c.liftT = 0; b.owner = p.i;
    M.stats[p.side].volleys++; p.g.volleys++;
    if (what === 'pass') pass(M, p, {power: 0.85, ax: c.ax, ay: c.ay, aimHelp: 3, human: true});
    else { var fl = plain ? rising(p) : (!perf || b.z > 1.1); if (fl) jumpNow(M, p);   // Space Space then K = 🌀 a spinning flip volley (Aowu 2026-11-14: "volley need to do a flip")
      shoot(M, p, {power: 0.85, ax: c.ax || dirOf(p.side, M), ay: c.ay, aimHelp: Math.max(perf ? 2 : 1, M.L.aim), human: true, volley: true, trick: c.Lk && !fl, flip: fl, perfect: !!perf});
      if (fl) { p.flip = FLIP_T; p.vz = Math.max(p.vz, 3.4); p.immune = Math.max(p.immune, 0.7); trickDone(M, p, 'flip'); } }
    ev(M, 'volley', {by: p.i, kind: what, side: p.side});
  }
  function standTackle(M, p) {
    if (p.cd > 0 || p.st !== 'ok') return;
    p.cd = 0.55; var b = M.ball, o = b.owner >= 0 ? M.players[b.owner] : null;
    if (!o || o.side === p.side) { ev(M, 'tackle', {by: p.i, ok: false, miss: true}); return; }
    var d = hyp(o.x - p.x, o.y - p.y);
    if (d > 1.45) { ev(M, 'tackle', {by: p.i, from: o.i, ok: false, miss: true}); return; }
    if (o.immune > 0) { ev(M, 'tackle', {by: p.i, from: o.i, ok: false, dodged: true}); p.st = 'stumble'; p.stT = 0.35; return; }
    var behind = ((p.x - o.x) * o.fx + (p.y - o.y) * o.fy) < -0.4 * d;
    var chance = ctrlOf(M, p) ? M.L.steal : M.L.tackle;
    if (M.rnd() < chance) {
      if (behind && M.L.fouls && M.rnd() < 0.3) { foul(M, p, o, false); return; }
      b.owner = p.i; b.last = p.i; b.lastSide = p.side; b.shot = null; b.offside = null; o.st = 'stumble'; o.stT = 0.3; M.stats[p.side].tackles++; p.g.tackles++;
      ev(M, 'tackle', {by: p.i, from: o.i, ok: true, side: p.side}); starAdd(M, ctrlOf(M, p), 0.08);
    } else { p.st = 'stumble'; p.stT = 0.4; ev(M, 'tackle', {by: p.i, from: o.i, ok: false}); }
  }
  function slide(M, p) {
    if (p.cd > 0 || p.st !== 'ok' || p.z > 0) return;
    p.st = 'slide'; p.stT = 0.5; p.cd = 1.4; var m = hyp(p.vx, p.vy); if (m > 0.5) { p.fx = p.vx / m; p.fy = p.vy / m; }
    p.vx = p.fx * 8.2; p.vy = p.fy * 8.2; ev(M, 'slide', {by: p.i, side: p.side});
  }
  function foul(M, by, on, hard) {
    M.stats[by.side].fouls++;
    ev(M, 'foul', {by: by.i, on: on.i, side: by.side});
    if (M.L.cards && (hard || M.rnd() < 0.35)) { by.cards++; M.stats[by.side].cards++; M.cards.push({i: by.i, t: M.t}); ev(M, 'card', {by: by.i, side: by.side, n: by.cards}); }
    on.st = 'down'; on.stT = 0.7;
    restart(M, 'free', on.side, on.x, on.y);
  }

  // ---------- set pieces ----------
  function restart(M, kind, side, x, y) {
    var S = M.S, b = M.ball;
    x = clamp(x, -S.Lh, S.Lh); y = clamp(y, -S.Wh, S.Wh);
    b.owner = -1; b.x = x; b.y = y; b.z = 0; b.vx = b.vy = b.vz = 0; b.shot = null; b.offside = null; b.spin = 0;
    var taker = kind === 'goalkick' ? keeperOf(M, side) : nearestOf(M, side, x, y, true);
    if (!taker) { taker = M.players.find(function (q) { return q.side === side && !q.gk; }); if (taker) { taker.st = 'ok'; taker.stT = 0; } }
    var c = M.ctrls.find(function (cc) { return cc.side === side; });
    if (c && taker && !taker.gk) { if (taker.ctrl < 0 || taker.ctrl === c.ci) setCtrl(M, c, taker); }
    M.phase = 'restart'; M.phaseT = 0; M.rs = {kind: kind, side: side, x: x, y: y, taker: taker ? taker.i : -1};
    if (kind === 'goalkick' && taker && taker.ctrl < 0 && c && !M.fast && !M.drill) { M.rs.ask = true; M.rs.wait = [9, 8, 7, 6, 6, 5][M.level] || 6; }   /* 🙋 Aowu 18:12: your keeper waits — run free + J = ask for it */
    M.ctrls.forEach(function (cc) { cc.curve = 0; });
    if (c && taker && c.pi === taker.i) {   // 🎯 your set piece starts aimed somewhere useful (the box · back into the pitch)
      var tx = kind === 'corner' || kind === 'free' ? dirOf(side, M) * (S.Lh - S.spot) : x + dirOf(side, M) * 4, ty = kind === 'corner' || kind === 'free' ? 0 : 0, am = hyp(tx - x, ty - y) || 1; c.ax = (tx - x) / am; c.ay = (ty - y) / am; }
    if (kind === 'free') { var gx = dirOf(side, M) * S.Lh, gd = hyp(gx - x, y);
      if (gd < 27 && gd > S.boxL * 0.5) {   // 🧱 a wall between the ball and the goal
        var defs = M.players.filter(function (q) { return q.side !== side && !q.gk && q.ctrl < 0 && q.st !== 'down'; }).sort(function (a, c) { return hyp(a.x - x, a.y - y) - hyp(c.x - x, c.y - y); });
        var nw = Math.min(S.n >= 6 ? 3 : 2, Math.max(0, defs.length - (M.drill ? 0 : 1))), wd = Math.min(6.5, gd * 0.42), ux = (gx - x) / gd, uy = -y / gd;
        M.rs.wall = defs.slice(0, nw).map(function (q, i) { var o = (i - (nw - 1) / 2) * 0.62; return {i: q.i, x: x + ux * wd - uy * o, y: y + uy * wd + ux * o}; });
        if (nw) ev(M, 'wall', {side: 1 - side, n: nw, set: true});
      } }
    if (kind === 'corner') M.stats[side].corners++;
    ev(M, kind === 'throw' ? 'throwin' : kind, {side: side, x: Math.round(x), y: Math.round(y)});
  }
  function takeRestart(M, p, c, what, power, to, high) {
    var rs = M.rs; if (!rs || rs.taker !== p.i || M.phaseT < 0.35) return;
    M.ball.owner = p.i; M.phase = 'play'; M.rs = null; p.st = 'ok';
    var spin = c && rs.kind !== 'throw' && rs.kind !== 'kickoff' ? c.curve * 6.5 : 0, ax = to ? to.x - p.x : c ? c.ax : dirOf(p.side, M), ay = to ? to.y - p.y : c ? c.ay : 0;
    if (c) c.curve = 0;
    if (rs.kind === 'kickoff' || what === 'pass' || rs.kind === 'throw') pass(M, p, {power: rs.kind === 'throw' ? Math.min(Math.max(power, high ? 0.5 : 0), high ? 0.7 : 0.55) : power, ax: ax, ay: ay, aimHelp: 3, human: !!c, spin: spin, loft: !!high, to: to, safe: rs.kind === 'goalkick'});
    if (high) flipPass(M, p, rs.kind);
    else if (what !== 'pass' && rs.kind !== 'kickoff' && rs.kind !== 'throw') shoot(M, p, {power: power, ax: ax, ay: ay, aimHelp: M.L.aim, human: !!c, spin: spin, fk: rs.kind === 'free'});
    if (rs.wall) { M.ball.fk = {wall: rs.wall.map(function (w) { return w.i; }), t: M.t}; if (M.level >= 2) rs.wall.forEach(function (w) { var q = M.players[w.i]; if (q && q.z <= 0) { q.vz = 3.4; q.immune = 0.5; } }); }
  }
  /* 🌀 J + L on a set piece (Aowu 14:37): a trick flip pass — the taker spins and flicks it up OVER the head: a much higher, floaty ball that lands where the aim says */
  function flipPass(M, p, kind) {
    var b = M.ball; if (b.owner >= 0 || b.vz <= 0) return;
    var k = 1.6; b.vz *= k; b.vx /= k; b.vy /= k;
    if (p.z <= 0) { p.flip = FLIP_T; p.vz = Math.max(p.vz, 2.6); }
    trickDone(M, p, 'flippass');
    ev(M, 'highball', {by: p.i, side: p.side, kind: kind, flip: true});
  }
  // 🙌 throw-in (people, 🔥 Intermediate+): tap a teammate on the screen = throw it to them
  function throwTo(M, ci, qi) {
    var c = M.ctrls[ci], rs = M.rs, p = c && M.players[c.pi], q = M.players[qi];
    if (!rs || rs.kind !== 'throw' || !p || rs.taker !== p.i || !q || q.side !== p.side || q === p || M.phaseT < 0.35) return false;
    p.x = rs.x - dirOf(p.side, M) * 0.3; p.y = rs.y; takeRestart(M, p, c, 'pass', clamp(hyp(q.x - p.x, q.y - p.y) / 22, 0.25, 0.55), q); return true;
  }
  /* 🙋 our goal kick (Aowu 18:12): the keeper waits — the player runs free and presses J (Pass) = "to me!" → the keeper plays it to them (lofted when far, always lands inside the pitch) */
  function askBall(M, c) {
    var rs = M.rs, p = M.players[c.pi]; if (M.phase !== 'restart' || !rs || !rs.ask || rs.side !== c.side || !p || p.gk || M.phaseT < 0.5) return false;
    var k = M.players[rs.taker]; if (!k) return false;
    k.x = rs.x - dirOf(k.side, M) * 0.3; k.y = rs.y; rs.asked = p.i;
    ev(M, 'askball', {by: p.i, side: p.side});
    takeRestart(M, k, null, 'pass', clamp(hyp(p.x - k.x, p.y - k.y) / 30, 0.3, 0.7), p);
    return true;
  }
  function robotRestart(M, p) {
    var d = dirOf(p.side, M), rs = M.rs;
    if (rs.kind === 'free' && hyp(d * M.S.Lh - p.x, p.y) < 22 && M.rnd() < 0.55) { var wl = rs.wall; takeRestart(M, p, null, 'shot', 0.6 + M.rnd() * 0.3); if (wl && M.ball.shot) { M.ball.fk = {wall: wl.map(function (w) { return w.i; }), t: M.t}; M.ball.shot.fk = true; } return; }
    if (rs.kind === 'corner') { M.ball.owner = p.i; M.phase = 'play'; M.rs = null; var tg = bestPass(M, p, d, -Math.sign(p.y) || 1, 1.6); pass(M, p, {power: 0.85, ax: tg ? tg.x - p.x : d, ay: tg ? tg.y - p.y : -p.y, aimHelp: 3, acc: M.L.passAcc}); return; }
    M.ball.owner = p.i; M.phase = 'play'; if (rs.kind === 'kickoff') ev(M, 'kickoff', {side: p.side}); M.rs = null;
    if (rs.wall) M.ball.fk = {wall: rs.wall.map(function (w) { return w.i; }), t: M.t};
    if (M.S.n === 1) { p.aiT = 0.3; return; }   // 🏙️ 1v1: no one to pass to — just dribble off
    var dirx = rs.kind === 'kickoff' ? -d * 0.4 : d, tgt = bestPass(M, p, dirx, rs.kind === 'kickoff' ? (M.rnd() < 0.5 ? 1 : -1) : 0, 1.6);
    if (rs.kind === 'goalkick') { var gt = tgt || bestPass(M, p, d, 0, 2.6); pass(M, p, {power: 0.6, ax: gt ? gt.x - p.x : d, ay: gt ? gt.y - p.y : 0, aimHelp: 3, acc: Math.max(0.85, M.L.passAcc || 0), to: gt, safe: true}); return; }   /* a rolling ball that stops inside the lines */
    pass(M, p, {power: 0.3, ax: tgt ? tgt.x - p.x : dirx, ay: tgt ? tgt.y - p.y : 0, aimHelp: 3, acc: M.L.passAcc});
  }

  // ---------- 🧤 keeper: dives for shots; a shout from your team tells the robot which way ----------
  function keeperRead(M) {
    var b = M.ball, sh = b.shot; if (!sh || sh.decided || b.owner >= 0) return;
    var S = M.S, ds = 1 - sh.side, k = keeperOf(M, ds), d = dirOf(sh.side, M), gx = d * S.Lh;
    if (!k || b.vx * d <= 0.5) return;
    var tc = (gx - b.x) / b.vx; if (tc > 1.1 || tc < 0) return;   // the keeper reacts in the last second of the shot
    sh.decided = true;
    var yc = b.y + b.vy * tc, zc = b.z + b.vz * tc - 0.5 * GRAV * tc * tc, on = Math.abs(yc) < S.goalW + 0.15 && zc < S.goalH + 0.1 && zc > -0.5;
    sh.yc = yc; sh.on = on; sh.tc = tc;
    if (on) M.stats[sh.side].onTarget++;
    if (!on) { sh.out = 'miss'; return; }
    var real = Math.abs(yc - k.y) < 0.7 ? 0 : Math.sign(yc - k.y), sw = M.shout[ds], fresh = sw && M.t - sw.t < 2.2, guess, pRight;
    if (fresh) guess = sw.s;   // 📣 a shout wins over the keeper's own guess
    else { pRight = sideHuman(M, ds) ? 0.5 : M.L.keeper; guess = M.rnd() < pRight ? real : (real === 0 ? (M.rnd() < 0.5 ? -1 : 1) : (M.rnd() < 0.5 ? 0 : -real)); }
    var right = guess === real || (real === 0 && Math.abs(yc - k.y) < 1.1);
    var corner = Math.abs(yc) > S.goalW - 0.55, fast = clamp((hyp(b.vx, b.vy) - 14) / 14, 0, 1), high = zc > S.goalH - 0.5;
    var pSave = right ? clamp(0.94 - fast * 0.3 - (corner ? 0.22 : 0) - (high && corner ? 0.1 : 0) - (sh.kind === 'chip' ? 0.35 : 0) - (sh.kind === 'bicycle' || sh.kind === 'flip' ? 0.15 : 0), 0.2, 0.95) : (Math.abs(yc - k.y) < 0.55 ? 0.5 : 0.03);
    if (sh.blast) pSave *= [0.3, 0.35, 0.45, 0.55, 0.62, 0.68][M.level]; else if (sh.perfect) pSave *= [0.45, 0.5, 0.55, 0.65, 0.75, 0.8][M.level];   // higher levels: keepers still read the big ones
    if (sh.forced) pSave = sh.forced === 'save' ? 1 : 0;
    sh.save = M.rnd() < pSave; sh.guess = guess; sh.right = right; sh.shout = fresh ? sw.s : 0;
    k.dive = guess; k.diveT = 0.7; k.st = 'ok';
    k.diveY = guess === 0 ? clamp(yc, k.y - 0.8, k.y + 0.8) : clamp(yc, k.y + (guess < 0 ? -2.6 : 0.2), k.y + (guess > 0 ? 2.6 : -0.2));
    /* 🎬 bo-5a: the dive / high jump gets its anticipation (step + load the near leg); it leaves the ground so the hands meet the ball */
    var lead = tc * 1000 - 40 - (guess ? 160 : 120), ant = clamp(lead, 0, 150);
    if (guess) startAct(M, k, 'gkdive', {antic: ant});
    else if (zc > 1.45 && k.z <= 0.02) startAct(M, k, 'gkhigh', {antic: ant});
    ev(M, 'dive', {by: k.i, side: ds, dir: guess, shout: sh.shout, right: right});
  }
  function shotAtLine(M) {
    // the ball reaches the keeper: save (parry / catch) or past him
    var b = M.ball, sh = b.shot; if (!sh || !sh.decided || sh.done || !sh.on) return false;
    var ds = 1 - sh.side, k = keeperOf(M, ds), d = dirOf(sh.side, M); if (!k) return false;
    if ((b.x - k.x) * d < -0.2) return false;
    sh.done = true;
    if (!sh.save) return false;
    var sp = hyp(b.vx, b.vy);
    M.stats[ds].saves++; k.g.saves++;
    var sv = ev(M, 'save', {by: k.i, side: ds, shot: sh.by, shout: sh.shout, right: sh.right, kind: sp < 17 && Math.abs(b.z - 1) < 0.9 ? 'catch' : 'parry'});
    if (sh.shout && sh.right) { M.ctrls.forEach(function (c) { if (c.side === ds) { var me = M.players[c.pi]; if (me) me.g.shoutSaves++; } }); sv.shoutSave = true; }
    if (sv.kind === 'catch') { b.owner = k.i; b.vx = b.vy = b.vz = 0; b.z = 0.6; b.last = k.i; b.lastSide = ds; b.shot = null; k.holdT = 0.9 + M.rnd() * 0.4; b.held = 1; }
    else { b.vx = -b.vx * 0.32; b.vy = (b.vy * 0.3) + (sh.guess || (M.rnd() < 0.5 ? -1 : 1)) * (4 + M.rnd() * 3); b.vz = 2.2 + M.rnd() * 2; b.last = k.i; b.lastSide = ds; b.shot = null; b.lock = k.i; b.lockT = 0.3; }
    return true;
  }

  // ---------- 🎪 pitch twists ----------
  function twistSetup(M) {
    var S = M.S, T = M.tw, r = M.rnd;
    if (M.twist === 'jungle') { T.mud = []; var R = clamp(S.Lh * 0.13, 1.1, 5.5); for (var i = 0; i < 3; i++) T.mud.push({x: (i - 1) * S.Lh * 0.5 + (r() - 0.5) * S.Lh * 0.2, y: (r() - 0.5) * S.Wh * 1.1, r: R * (0.8 + r() * 0.4)}); T.eggIn = M.halfLen * (0.25 + r() * 0.4); T.egg = null; T.eggHalf = 0; }
    if (M.twist === 'underwater') { T.cur = r() < 0.5 ? -1 : 1; T.curT = 14; }
    if (M.twist === 'neon') { T.zone = null; T.zoneT = 0; moveZone(M); }
    if (M.twist === 'robot') { T.belt = 1.5; T.beltY = S.Wh * 0.72; }
    if (M.twist === 'olympus') { T.wind = {x: 0, y: 0}; T.windT = 0; gust(M); }
  }
  function inMud(M, x, y) { var m = M.tw.mud; if (!m) return false; for (var i = 0; i < m.length; i++) if (hyp(x - m[i].x, (y - m[i].y) * 1.4) < m[i].r) return true; return false; }
  function moveZone(M) { var S = M.S, r = M.rnd, sd = r() < 0.5 ? -1 : 1; M.tw.zone = {x: sd * S.Lh * (0.35 + r() * 0.3), y: (r() - 0.5) * S.Wh * 0.8, r: clamp(S.Lh * 0.11, 1.4, 4.5)}; M.tw.zoneT = 8; ev(M, 'zone', {x: M.tw.zone.x, y: M.tw.zone.y}); }
  function gust(M) { var a = M.rnd() * Math.PI * 2, k = 2.2 + M.rnd() * 1.4; M.tw.wind = {x: Math.cos(a) * k, y: Math.sin(a) * k}; M.tw.windT = 9; ev(M, 'gust', {x: M.tw.wind.x, y: M.tw.wind.y}); }
  function inZone(M, x, y) { var z = M.tw.zone; return !!z && hyp(x - z.x, (y - z.y) * 1.4) < z.r; }
  function powerKick(M, p) {   /* ⚡ a shot (fast, towards their goal) from the power zone: +15 % speed, same height at the goal */
    var b = M.ball, d = dirOf(p.side, M), sp = hyp(b.vx, b.vy); if (!inZone(M, p.x, p.y) || sp < 12 || b.vx * d <= 0) return;
    var Tn = Math.abs((d * M.S.Lh - b.x) / b.vx), h = b.z + b.vz * Tn - 0.5 * GRAV * Tn * Tn, k = 1.15; b.vx *= k; b.vy *= k; var T2 = Tn / k; b.vz = (h - b.z + 0.5 * GRAV * T2 * T2) / T2;
    ev(M, 'power', {by: p.i, side: p.side});
  }
  function twistTick(M, dt) {   // timers (only while the ball is in play)
    var T = M.tw, S = M.S;
    if (M.twist === 'underwater' && (T.curT -= dt) <= 0) { T.cur = -T.cur; T.curT = 14; ev(M, 'current', {dir: T.cur}); }
    if (M.twist === 'neon' && (T.zoneT -= dt) <= 0) moveZone(M);
    if (M.twist === 'olympus' && (T.windT -= dt) <= 0) gust(M);
    if (M.twist === 'jungle') {
      if (!T.egg && T.eggHalf < M.half && M.clock - (M.half - 1) * M.halfLen >= T.eggIn) { var sy = M.rnd() < 0.5 ? -1 : 1; T.egg = {x: (M.rnd() - 0.5) * S.Lh * 0.8, y: sy * (S.Wh + 1.5), vy: -sy * 2.6, rot: 0}; T.eggHalf = M.half; ev(M, 'egg', {}); }
      var e = T.egg; if (e) { e.y += e.vy * dt; e.rot += e.vy * dt * 1.6; if (Math.abs(e.y) > S.Wh + 2) T.egg = null;
        else { var b = M.ball, dx = b.x - e.x, dy = b.y - e.y, dd = hyp(dx, dy); if (b.owner < 0 && b.z < 0.6 && dd < 0.75 && dd > 0) { var vn = b.vx * dx / dd + b.vy * dy / dd; if (vn < 0) { b.vx -= 1.8 * vn * dx / dd; b.vy -= 1.8 * vn * dy / dd; b.x = e.x + dx / dd * 0.76; b.y = e.y + dy / dd * 0.76; b.shot = null; ev(M, 'eggbump', {}); } } } }
    }
  }
  function twistBall(M, dt) {
    var b = M.ball, T = M.tw;
    if (M.twist === 'underwater' && b.z > 0.3) b.vy += T.cur * 1.6 * dt;
    if (M.twist === 'olympus' && b.z > 0.6) { b.vx += T.wind.x * dt; b.vy += T.wind.y * dt; }
    if (M.twist === 'robot' && b.z < 0.05 && Math.abs(b.y) > T.beltY && Math.abs(b.y) < M.S.Wh) b.x += (b.y > 0 ? 1 : -1) * T.belt * dt;
  }
  function twistPlayer(M, p, dt) {
    if (p.gk) return; var T = M.tw;
    if (M.twist === 'jungle' && p.z === 0 && inMud(M, p.x, p.y)) { p.x -= p.vx * dt * 0.3; p.y -= p.vy * dt * 0.3; }
    if (M.twist === 'robot' && Math.abs(p.y) > T.beltY && Math.abs(p.y) < M.S.Wh + 0.5) p.x += (p.y > 0 ? 1 : -1) * T.belt * dt;
  }

  // ---------- ball ----------
  function stepBall(M, dt) {
    var b = M.ball, S = M.S;
    if (b.lockT > 0) { b.lockT -= dt; if (b.lockT <= 0) b.lock = -1; }
    if (b.owner >= 0) {
      var p = M.players[b.owner];
      if (p.gk && b.held) { b.x = p.x + p.fx * 0.25; b.y = p.y + p.fy * 0.25; b.z = 0.9; b.vx = p.vx; b.vy = p.vy; b.vz = 0; return; }
      var sp = hyp(p.vx, p.vy), ahead = 0.42 + Math.min(0.35, sp * 0.05) + (p.sprint ? 0.25 : 0);
      var tx = p.x + p.fx * ahead, ty = p.y + p.fy * ahead;
      b.vx = (tx - b.x) / Math.max(dt, 1e-3) * 0.25 + p.vx * 0.75; b.vy = (ty - b.y) / Math.max(dt, 1e-3) * 0.25 + p.vy * 0.75;
      b.x += (tx - b.x) * Math.min(1, dt * 18); b.y += (ty - b.y) * Math.min(1, dt * 18); b.z = Math.max(0, b.z - dt * 4); b.vz = 0;
      if (p.z > 0.05) b.z = Math.min(0.6, p.z * 0.6);
      b.roll = (b.roll || 0) + sp * dt / BALL_R;
      return;
    }
    // flight
    b.vz -= GRAV * dt;
    if (b.spin) { var m = hyp(b.vx, b.vy) || 1; b.vx += (-b.vy / m) * b.spin * dt * 0.5; b.vy += (b.vx / m) * b.spin * dt * 0.5; b.spin *= Math.pow(0.4, dt); }
    var drag = Math.pow(b.z > 0.05 ? 0.93 : 1, dt); b.vx *= drag; b.vy *= drag;
    if (M.twist) twistBall(M, dt);
    var px = b.x, d0 = b.x;
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    if (b.z <= 0) {
      b.z = 0;
      if (b.vz < -1.2) { var rb = S.bounce || 0.52; if (M.party) rb = Math.max(rb, PARTY.bounce); if (M.twist === 'moon') rb = Math.min(0.78, rb * 1.35);
        var wild = M.party && b.vz < -2.5; b.vz = -b.vz * rb; if (wild) { b.vx += (M.rnd() - 0.5) * 2 * PARTY.kick; b.vy += (M.rnd() - 0.5) * 2 * PARTY.kick; }
        ev(M, 'bounce', {party: wild}); } else b.vz = 0;
    }
    if (b.z === 0 && b.vz === 0) { var sp2 = hyp(b.vx, b.vy); if (sp2 > 0) { var k = Math.max(0, sp2 - (S.fric || 3.6) * dt * (M.twist === 'moon' ? 0.5 : 1) * (M.party ? PARTY.fric : 1) * (M.twist === 'jungle' && inMud(M, b.x, b.y) ? 3.2 : 1)) / sp2; b.vx *= k; b.vy *= k; } }
    b.roll = (b.roll || 0) + hyp(b.vx, b.vy) * dt / BALL_R;
    if (b.fk) { if (M.t - b.fk.t > 1.2) b.fk = null; else for (var wi = 0; wi < b.fk.wall.length; wi++) { var wq = M.players[b.fk.wall[wi]]; if (wq && hyp(b.x - wq.x, b.y - wq.y) < 0.7 && b.z < 1.85 + wq.z) {   // 🧱 hits the wall
      b.vx *= -0.3; b.vy = b.vy * 0.3 + (M.rnd() - 0.5) * 6; b.vz = 2 + M.rnd() * 2; b.last = wq.i; b.lastSide = wq.side; b.shot = null; b.fk = null; b.lock = wq.i; b.lockT = 0.2; ev(M, 'wallblock', {by: wq.i, side: wq.side}); break; } } }
    keeperRead(M);
    if (shotAtLine(M)) return;
    // goal line, posts, bar
    for (var s = -1; s <= 1; s += 2) {
      var gx = s * S.Lh;
      if ((px - gx) * s < 0 && (b.x - gx) * s >= 0) {
        var ay = Math.abs(b.y);
        if (ay < S.goalW - BALL_R && b.z < S.goalH - BALL_R) { goal(M, s === dirOf(0, M) ? 0 : 1); return; }
        if (ay < S.goalW + BALL_R && b.z < S.goalH + BALL_R) {   // 🥅 off the post / bar
          if (b.z > S.goalH - BALL_R) b.vz = -Math.abs(b.vz) * 0.5 - 0.5; b.vx = -b.vx * 0.55; b.x = gx - s * 0.05; b.vy += (b.y > 0 ? 1 : -1) * 0.8; b.shot = null;
          ev(M, 'post', {side: b.lastSide, by: b.last, bar: b.z > S.goalH - 0.3}); if (M.drill && M.drill.id === 'bar' && b.z > S.goalH - 0.35) drillHit(M, 'bar'); return;
        }
        if (S.cage) { b.x = gx - s * BALL_R; b.vx = -b.vx * 0.62; b.shot = null; ev(M, 'wall', {}); return; }   // 🏙️ off the fence
        out(M, 'goalline', s); return;
      }
    }
    if (S.cage && Math.abs(b.y) > S.Wh - BALL_R) { b.y = Math.sign(b.y) * (S.Wh - BALL_R); b.vy = -b.vy * 0.62; if (Math.abs(b.vy) > 1.5) ev(M, 'wall', {}); return; }
    if (Math.abs(b.y) > S.Wh + BALL_R) { out(M, 'side', 0); return; }
  }
  function goal(M, side) {
    var b = M.ball, by = b.last >= 0 ? M.players[b.last] : null, own = by && by.side !== side;
    var assist = !own && b.passer >= 0 && b.passer !== b.last && M.players[b.passer].side === side && M.t - b.passT < 7 ? b.passer : -1;
    if (M.drill) { drillGoal(M, side); return; }
    M.score[side]++;
    if (by && !own) { by.g.goals++; by.celebrate = 2.4; starAdd(M, ctrlOf(M, by), 0.2); }
    if (assist >= 0) M.players[assist].g.assists++;
    var kind = b.shot ? b.shot.kind : 'shot';
    b.vx *= 0.15; b.vy *= 0.15; b.vz = 0; b.shot = null;
    M.phase = 'goal'; M.phaseT = 0; M.goalSide = side;
    ev(M, 'goal', {side: side, by: by ? by.i : -1, assist: assist, own: !!own, kind: kind, score: M.score.slice(), golden: M.golden});
    if (M.golden || (M.S.firstTo && M.score[side] >= M.S.firstTo)) { endMatch(M); return; }
    if (M.L.hardcore && M.score[1 - side] < M.score[side] - 2 && !sideHuman(M, side) && sideHuman(M, 1 - side)) { M.hcLost = true; }
  }
  function out(M, where, s) {
    var b = M.ball, S = M.S, ls = b.lastSide < 0 ? 0 : b.lastSide;
    if (M.drill) { drillDead(M, 'out'); return; }
    if (where === 'side') { restart(M, S.kickin ? 'kickin' : 'throw', 1 - ls, b.x, Math.sign(b.y) * S.Wh); return; }
    var defSide = s === dirOf(0, M) ? 1 : 0;   // the side that defends this goal line
    if (ls === defSide) restart(M, 'corner', 1 - defSide, s * (S.Lh - 0.3), Math.sign(b.y || 1) * (S.Wh - 0.3));
    else restart(M, 'goalkick', defSide, s * (S.Lh - 5), 0);
  }

  // ---------- players ----------
  function speedOf(M, p) {
    var c = ctrlOf(M, p), base = p.sprint && (!M.L.stamina || p.stamina > 0.08) ? SPRINT : RUN;
    if (!c) base *= M.L.spd * (sideHuman(M, p.side) ? 1 : 1);
    if (M.L.stamina) base *= 0.78 + 0.22 * p.stamina;
    if (M.ball.owner === p.i) base *= 0.9;
    if (p.burst > 0) base *= 1.3;
    if (p.cards) base *= 1;
    return base;
  }
  function moveTo(M, p, tx, ty, dt, slow) {
    var dx = tx - p.x, dy = ty - p.y, d = hyp(dx, dy), sp = speedOf(M, p) * (slow || 1);
    var want = d > 0.15 ? Math.min(sp, d * 3) : 0, wx = d > 0 ? dx / d * want : 0, wy = d > 0 ? dy / d * want : 0;
    steer(p, wx, wy, dt);
  }
  function steer(p, wx, wy, dt) {
    var ax = wx - p.vx, ay = wy - p.vy, am = hyp(ax, ay), lim = ACC * dt;
    if (am > lim) { ax *= lim / am; ay *= lim / am; }
    p.vx += ax; p.vy += ay;
  }
  function stepPlayer(M, p, dt) {
    var S = M.S;
    if (p.act) actTick(M, p, dt);
    if (p.cd > 0) p.cd -= dt; if (p.immune > 0) p.immune -= dt; if (p.burst > 0) p.burst -= dt; if (p.kickT > 0) p.kickT -= dt; if (p.flip > 0) p.flip -= dt; if (p.pressT > 0) p.pressT -= dt; if (p.celebrate > 0) p.celebrate -= dt;
    if (p.z > 0 || p.vz > 0) { p.vz -= GRAV * (M.twist === 'moon' ? 0.55 : 1) * dt; p.z += p.vz * dt; if (p.z <= 0) { p.z = 0; p.vz = 0; } }
    if (p.st !== 'ok') {
      p.stT -= dt;
      if (p.st === 'slide') {
        var b = M.ball; p.vx *= Math.pow(0.35, dt); p.vy *= Math.pow(0.35, dt);
        var o = b.owner >= 0 ? M.players[b.owner] : null;
        if (o && o.side !== p.side) {
          var bd = hyp(b.x - p.x - p.fx * 0.5, b.y - p.y - p.fy * 0.5), od = hyp(o.x - p.x, o.y - p.y);
          if (o.immune > 0 && od < 1.9) { /* jumped over it (the ball hops with you) */ }
          else if (bd < 0.75) { b.owner = -1; b.vx = p.fx * 7 + p.vx * 0.3; b.vy = p.fy * 7 + p.vy * 0.3; b.last = p.i; b.lastSide = p.side; b.lock = o.i; b.lockT = 0.5; o.st = 'stumble'; o.stT = 0.35; M.stats[p.side].tackles++; p.g.tackles++; ev(M, 'tackle', {by: p.i, from: o.i, ok: true, slide: true, side: p.side}); }
          else if (od < 0.85 && M.L.fouls) { p.st = 'down'; p.stT = 0.9; foul(M, p, o, ((p.x - o.x) * o.fx + (p.y - o.y) * o.fy) < -0.3); return; }
        } else if (b.owner < 0 && hyp(b.x - p.x, b.y - p.y) < 0.85 && b.z < 0.5) { b.vx = p.fx * 6; b.vy = p.fy * 6; b.last = p.i; b.lastSide = p.side; b.shot = null; }
        if (p.stT <= 0) { p.st = 'down'; p.stT = 0.55; }
      } else if (p.st === 'dive') { p.vx *= Math.pow(0.1, dt); p.vy = 0; if (p.diveY != null) p.y += (p.diveY - p.y) * Math.min(1, dt * 9); if (p.stT <= 0 || p.diveT <= 0) { p.st = 'down'; p.stT = 0.4; } }
      else { p.vx *= Math.pow(0.05, dt); p.vy *= Math.pow(0.05, dt); }
      if (p.diveT > 0) p.diveT -= dt;
      if (p.stT <= 0 && p.st !== 'slide') { p.st = 'ok'; p.dive = 0; }
      p.x += p.vx * dt; p.y += p.vy * dt; bounds(M, p); return;
    }
    var c = ctrlOf(M, p);
    if (c && M.phase !== 'goal' && M.phase !== 'half' && M.phase !== 'end' && !(p.gk)) {
      var m = hyp(c.ix, c.iy); p.sprint = c.sprint;   /* keys: Shift · touch: the page sends sprint when the stick is pushed far */
      if (M.phase === 'restart' && M.rs && M.rs.taker === p.i) { var rs = M.rs; moveTo(M, p, rs.x - dirOf(p.side, M) * 0.3, rs.y, dt); if (hyp(c.ix, c.iy) > 0.2) { p.fx = c.ix / m; p.fy = c.iy / m; } }
      else if (M.phase === 'kickoff' && M.rs == null) steer(p, 0, 0, dt);
      else if (m < 0.2 && M.phase === 'play' && M.ball.owner < 0 && M.ball.passTo === p.i && M.t - M.ball.passT < 3) { var bb = M.ball, v2 = bb.vx * bb.vx + bb.vy * bb.vy || 1, tt2 = clamp(((p.x - bb.x) * bb.vx + (p.y - bb.y) * bb.vy) / v2, 0, 1.5); moveTo(M, p, bb.x + bb.vx * tt2, bb.y + bb.vy * tt2, dt); }   /* the pass is for you: step onto its line */
      else { var sp = speedOf(M, p); steer(p, c.ix * sp, c.iy * sp, dt); }
    } else ai(M, p, dt);
    if (M.L.stamina) { var mv = hyp(p.vx, p.vy); p.stamina = clamp(p.stamina + (p.sprint && mv > RUN * 0.8 ? -0.11 : 0.05) * dt, 0, 1); }
    var mm = hyp(p.vx, p.vy); if (mm > 0.4 && !(c && M.ball.owner === p.i && M.phase === 'restart')) { p.fx += (p.vx / mm - p.fx) * Math.min(1, dt * 12); p.fy += (p.vy / mm - p.fy) * Math.min(1, dt * 12); var fm = hyp(p.fx, p.fy) || 1; p.fx /= fm; p.fy /= fm; }
    p.run += mm * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; if (M.twist) twistPlayer(M, p, dt); bounds(M, p);
  }
  function bounds(M, p) { var S = M.S, e = S.cage ? -0.3 : 2.5; p.x = clamp(p.x, -S.Lh - e, S.Lh + e); p.y = clamp(p.y, -S.Wh - e, S.Wh + e); }

  // ---------- 🤖 robots ----------
  function ai(M, p, dt) {
    var b = M.ball, S = M.S, L = M.L, d = dirOf(p.side, M), human = sideHuman(M, p.side);
    if (M.phase === 'goal' || M.phase === 'half' || M.phase === 'end' || M.phase === 'pens') {
      if (M.phase === 'pens') { steer(p, 0, 0, dt); return; }
      if (p.celebrate > 0) { steer(p, p.fx * 2, p.fy * 2, dt); return; }
      var hh = homeOf(M, p, false); moveTo(M, p, hh.x, hh.y, dt, 0.5); return;
    }
    if (p.drillRole === 'runner') { drillRunner(M, p, dt); return; }
    if (p.drillRole === 'wallman' && M.phase === 'play') { steer(p, 0, 0, dt); return; }
    if (p.gk) { aiKeeper(M, p, dt); return; }
    if (M.phase === 'kickoff') { if (M.rs && M.rs.taker === p.i) { steer(p, 0, 0, dt); return; } steer(p, 0, 0, dt); return; }
    if (M.phase === 'restart') {
      var rs = M.rs;
      if (rs && rs.taker === p.i) { moveTo(M, p, rs.x - d * 0.35, rs.y, dt); return; }
      var wm = rs && rs.wall && rs.wall.find(function (w) { return w.i === p.i; }); if (wm) { moveTo(M, p, wm.x, wm.y, dt); p.sprint = true; var wx = rs.x - p.x, wy = rs.y - p.y, wn = hyp(wx, wy) || 1; if (hyp(p.vx, p.vy) < 0.5) { p.fx = wx / wn; p.fy = wy / wn; } return; }
      var h = homeOf(M, p, rs && rs.side === p.side), hx = h.x, hy = h.y;
      if (rs && rs.side !== p.side && hyp(hx - rs.x, hy - rs.y) < 4.5) { var a = Math.atan2(hy - rs.y, hx - rs.x); hx = rs.x + Math.cos(a) * 4.6; hy = rs.y + Math.sin(a) * 4.6; }
      if (rs && rs.kind === 'corner' && rs.side === p.side && p.slot >= S.n - 3) { hx = d * (S.Lh - S.boxL * 0.6); hy = (p.slot - S.n + 2) * 2.5; }
      moveTo(M, p, hx, hy, dt, 0.8); return;
    }
    p.aiT -= dt;
    var owner = b.owner >= 0 ? M.players[b.owner] : null, mine = owner === p, ours = owner && owner.side === p.side;
    // with the ball
    if (mine) { aiCarrier(M, p, dt); return; }
    if (p.aiT <= 0) {
      p.aiT = L.react * (0.8 + M.rnd() * 0.4);
      var role = 'shape';
      if (!owner) {
        // loose ball: the closest of each team goes for it (a teammate of the human only if the human is far)
        var chaser = closestToBall(M, p.side, true);
        if (chaser === p) role = 'chase';
        if (human && chaser === p) { var me = M.ctrls.filter(function (c) { return c.side === p.side; }).map(function (c) { return M.players[c.pi]; }); if (me.some(function (q) { return q && hyp(q.x - b.x, q.y - b.y) < hyp(p.x - b.x, p.y - b.y) + 5; })) role = 'shape'; }
      } else if (!ours) {
        var pressers = pressersOf(M, p.side);
        if (pressers.indexOf(p) >= 0 || p.pressT > 0) role = 'press';
        else if (L.smart) role = 'mark';
      } else role = 'support';
      p.role = role;
    }
    var r = p.role || 'shape';
    if ((r === 'support' && !ours) || ((r === 'press' || r === 'mark') && (!owner || ours)) || (r === 'chase' && owner)) r = 'shape';
    if (r === 'chase') { var lead = hyp(b.vx, b.vy) > 2 ? 0.35 : 0; moveTo(M, p, b.x + b.vx * lead, b.y + b.vy * lead, dt); p.sprint = hyp(b.x - p.x, b.y - p.y) > 6; return; }
    if (r === 'press' && owner) {
      var gx = -d * S.Lh, ax = owner.x + (gx - owner.x) * 0.06, ay = owner.y - owner.y * 0.06;
      moveTo(M, p, ax, ay, dt); p.sprint = hyp(owner.x - p.x, owner.y - p.y) > 4 && L.press > 1;
      var dd = hyp(owner.x - p.x, owner.y - p.y);
      if (dd < 1.35 && p.cd <= 0 && owner.st === 'ok') {
        if (L.slide && M.rnd() < 0.18 && dd > 0.9 && owner.immune <= 0) { var m2 = dd || 1; p.fx = (owner.x - p.x) / m2; p.fy = (owner.y - p.y) / m2; slide(M, p); }
        else if (M.rnd() < 0.6) standTackleBot(M, p, owner);
        p.cd = Math.max(p.cd, L.tkCd * (0.7 + M.rnd() * 0.6));
      }
      return;
    }
    if (r === 'mark' && owner) {
      var opp = nearestOpp(M, p, owner);
      if (opp) { var gx2 = -d * S.Lh, mx = opp.x + (gx2 - opp.x) * 0.12, my = opp.y + (b.y - opp.y) * 0.2; moveTo(M, p, mx, my, dt, 0.9); return; }
    }
    var hm = homeOf(M, p, r === 'support');
    if (r === 'support') {
      // runs: forwards go ahead of the ball (but stay onside on offside levels), everyone keeps a passing lane
      if (p.slot >= M.S.n - 2) { hm.x = clamp(Math.max(hm.x * d, owner.x * d + 6), -S.Lh, S.Lh * 0.85) * d; if (L.offside) { var lineX = offsideLine(M, p.side); hm.x = Math.min(hm.x * d, lineX - 0.6) * d; } }
      var od = hyp(hm.x - owner.x, hm.y - owner.y); if (od < 5) { hm.y += (hm.y >= owner.y ? 1 : -1) * 3; }
    }
    moveTo(M, p, hm.x, hm.y, dt, r === 'support' ? 1 : 0.85);
    p.sprint = false;
  }
  function standTackleBot(M, p, o) {
    var b = M.ball;
    if (o.immune > 0) { p.st = 'stumble'; p.stT = 0.4; ev(M, 'tackle', {by: p.i, from: o.i, ok: false, dodged: true}); return; }
    var oc = ctrlOf(M, o), chance = oc ? M.L.tackle : 0.45;
    if (M.rnd() < chance) { b.owner = p.i; b.last = p.i; b.lastSide = p.side; b.offside = null; o.st = 'stumble'; o.stT = 0.3; M.stats[p.side].tackles++; p.g.tackles++; ev(M, 'tackle', {by: p.i, from: o.i, ok: true, side: p.side}); }
    else { p.st = 'stumble'; p.stT = 0.35; ev(M, 'tackle', {by: p.i, from: o.i, ok: false}); }
  }
  function offsideLine(M, side) { var d = dirOf(side, M), xs = M.players.filter(function (o) { return o.side !== side; }).map(function (o) { return o.x * d; }).sort(function (a, b) { return b - a; }); return Math.max(0, xs[1] == null ? M.S.Lh : xs[1]); }
  function closestToBall(M, side, outfield) {
    var b = M.ball, best = null, bd = 1e9;
    M.players.forEach(function (q) { if (q.side !== side || (outfield && q.gk) || q.st === 'down') return; var dd = hyp(q.x - b.x, q.y - b.y) / (speedOf(M, q) || 1); if (dd < bd) { bd = dd; best = q; } });
    return best;
  }
  function pressersOf(M, side) {
    var b = M.ball, n = M.L.press, list = M.players.filter(function (q) { return q.side === side && !q.gk && q.ctrl < 0; });
    list.sort(function (a, c) { return hyp(a.x - b.x, a.y - b.y) - hyp(c.x - b.x, c.y - b.y); });
    var humanNear = M.ctrls.some(function (c) { var q = M.players[c.pi]; return c.side === side && q && hyp(q.x - b.x, q.y - b.y) < 6; });
    return list.slice(0, humanNear ? Math.max(0, n - 1) : n);
  }
  function nearestOpp(M, p, owner) {
    var best = null, bd = 1e9, d = dirOf(p.side, M);
    M.players.forEach(function (o) { if (o.side === p.side || o.gk || o === owner) return; if (o.x * -d < -M.S.Lh * 0.1 && o.x * d > 0) return; var dd = hyp(o.x - p.x, o.y - p.y); if (dd < bd) { bd = dd; best = o; } });
    return best;
  }
  function aiCarrier(M, p, dt) {
    var b = M.ball, S = M.S, L = M.L, d = dirOf(p.side, M), gx = d * S.Lh;
    var press = M.players.filter(function (o) { return o.side !== p.side && !o.gk && hyp(o.x - p.x, o.y - p.y) < 2.6; });
    var front = press.filter(function (o) { return (o.x - p.x) * d > -0.3; }).length;
    var dist = hyp(gx - p.x, p.y);
    p.aiT -= dt;
    if (p.aiT <= 0) {
      p.aiT = L.react * (0.9 + M.rnd() * 0.6);
      var ang = Math.abs(Math.atan2(p.y, (gx - p.x) * d));
      if (dist < L.range * (S.rangeK || 1) && ang < 0.95 && M.rnd() < 0.75) { shoot(M, p, {power: clamp(0.4 + (dist / 25) + M.rnd() * 0.3, 0, 1), ax: d, ay: (M.rnd() - 0.5), aimHelp: 2, acc: L.shotAcc}); return; }
      if (front && M.rnd() < 0.35 + L.passAcc * 0.5) {
        var tg = bestPass(M, p, d, 0, 1.9);
        if (tg) { pass(M, p, {power: 0.3 + M.rnd() * 0.4, ax: tg.x - p.x, ay: tg.y - p.y, aimHelp: 3, acc: L.passAcc}); return; }
      }
      if (!front && M.rnd() < 0.18 * L.passAcc) { var tg2 = bestPass(M, p, d, 0, 1.0); if (tg2 && (tg2.x - p.x) * d > 4) { pass(M, p, {power: 0.4, ax: tg2.x - p.x, ay: tg2.y - p.y, aimHelp: 3, acc: L.passAcc}); return; } }
      var nq = L.trickFail > 0 && S.nutPoint ? nutTarget(M, p) : null;   /* robots nutmeg only in the street (keeps the bo-1b level feel) */ if (nq && M.rnd() < (S.nutPoint ? 0.35 + M.level * 0.05 : 0.05)) { nutmeg(M, p, nq); return; }
      if (front && L.trickFail > 0 && M.rnd() < 0.08 + M.level * 0.02) trick(M, p, null);
      p.weave = (M.rnd() - 0.5) * 6;
    }
    var ty = clamp(p.y * 0.6 + (p.weave || 0), -S.Wh + 2, S.Wh - 2), tx = gx - d * Math.max(4, dist * 0.2);
    if (front) { var o = press[0]; ty += (p.y > o.y ? 1 : -1) * 3; }
    moveTo(M, p, tx, ty, dt, 0.92); p.sprint = !front && M.level >= 3 && M.rnd() < 0.01 ? true : p.sprint;
  }
  function aiKeeper(M, p, dt) {
    var b = M.ball, S = M.S, d = dirOf(p.side, M), gx = -d * S.Lh;
    if (b.owner === p.i) {
      p.holdT -= dt;
      var hx = gx + d * 2.2; moveTo(M, p, hx, clamp(p.y, -S.goalW, S.goalW), dt, 0.5);
      if (p.holdT <= 0 && M.phase === 'play') {
        b.held = 0; var tg = bestPass(M, p, d, 0, 1.4);
        var rush = M.players.some(function (o) { return o.side !== p.side && hyp(o.x - p.x, o.y - p.y) < 5; });
        pass(M, p, {power: rush ? 0.95 : 0.5, ax: tg ? tg.x - p.x : d, ay: tg ? tg.y - p.y : 0, aimHelp: 3, acc: 0.85});
      }
      return;
    }
    if (p.st !== 'ok') return;
    var bx = b.x, by = b.y, inBox = (bx - gx) * d < S.boxL + 1 && Math.abs(by) < S.boxW + 1, loose = b.owner < 0 && !b.shot;
    var close = hyp(bx - p.x, by - p.y);
    if (inBox && loose && b.lastSide !== p.side && hyp(b.vx, b.vy) < 12 && closestToBall(M, p.side, false) === p) { moveTo(M, p, bx, by, dt); if (close < 1.0 && b.z < 2.1) { b.owner = p.i; b.held = 1; b.vx = b.vy = b.vz = 0; b.last = p.i; b.lastSide = p.side; b.shot = null; b.offside = null; p.holdT = 0.9; ev(M, 'claim', {by: p.i, side: p.side}); } return; }
    var far = hyp(bx - gx, by), out = clamp((26 - far) / 26, 0, 1) * 2.2 + 0.7;
    var ty = clamp(by * (0.25 + 0.25 * (1 - far / 40)), -S.goalW * 0.8, S.goalW * 0.8);
    moveTo(M, p, gx + d * out, ty, dt, 0.9);
    if (b.owner >= 0 && M.players[b.owner].side !== p.side && close < 1.2 && p.cd <= 0) { standTackleBot(M, p, M.players[b.owner]); p.cd = 1.2; }
  }

  // ---------- control of the ball ----------
  function pickup(M) {
    var b = M.ball; if (b.owner >= 0) return;
    if (M.drill && M.drill.id === 'juggle') return;   // 🦶 keepy-ups: the ball is only ever kicked
    var best = null, bd = 1e9;
    M.players.forEach(function (p) {
      if (p.st === 'down' || p.st === 'stumble' || p.st === 'slide') return;
      if (b.lock === p.i) return;
      if (M.nut && M.nut.by === p.i && ((b.x - M.nut.x) * M.nut.dx + (b.y - M.nut.y) * M.nut.dy) < 0.3 && M.t - M.nut.t < 1.2) return;   // 🥜 the ball first has to go through
      var reachZ = p.gk ? 2.2 : (p.z > 0.1 ? p.z + 1.9 : 0.75), dd = hyp(b.x - p.x, b.y - p.y);
      if (b.z > reachZ || dd > (p.gk ? 0.9 : 0.75)) return;
      var sp = hyp(b.vx, b.vy);
      if (!p.gk && sp > 15 && b.shot && b.shot.side !== p.side && M.rnd() < 0.6) return;   // a hard shot is hard to stop
      if (dd < bd) { bd = dd; best = p; }
    });
    if (!best) return;
    var p = best;
    // header: a jumping player meets a high ball
    if (!p.gk && b.z > 1.1) { header(M, p); return; }
    // offside: the player the pass was for touches it
    if (b.offside && b.offside.i === p.i && b.lastSide === p.side) { M.stats[p.side].offsides++; ev(M, 'offside', {by: p.i, side: p.side}); var o = b.offside; restart(M, 'free', 1 - o.side, o.x, o.y); return; }
    if (b.shot && p.gk && b.shot.side !== p.side) { b.held = 1; p.holdT = 0.9; M.stats[p.side].saves++; ev(M, 'save', {by: p.i, side: p.side, kind: 'catch', shot: b.shot.by}); }
    else if (p.gk && b.lastSide !== p.side && b.owner < 0) { b.held = 1; p.holdT = 0.9; ev(M, 'claim', {by: p.i, side: p.side}); }
    else if (p.gk && b.lastSide === p.side) { b.held = 0; }
    if (M.nut) {   // 🥜 the nutmeg: the same player gets the ball back past the defender
      var nu = M.nut; M.nut = null;
      if (nu.by === p.i && M.t - nu.t < 2.6 && ((b.x - nu.x) * nu.dx + (b.y - nu.y) * nu.dy) > 0) {
        M.stats[p.side].nutmegs++; p.g.nutmegs++; ev(M, 'nutmeg', {by: p.i, on: nu.on, side: p.side, point: !!M.S.nutPoint});
        if (M.S.nutPoint && M.phase === 'play') { b.last = p.i; b.lastSide = p.side; b.passer = -1; b.shot = {kind: 'nutmeg'}; goal(M, p.side); return; }
      }
    }
    var prev = b.last;
    b.owner = p.i; b.last = p.i; b.lastSide = p.side; b.shot = null; b.offside = null; b.vz = 0;
    if (prev >= 0 && M.players[prev].side !== p.side) ev(M, 'win', {by: p.i, side: p.side});
    ev(M, 'control', {by: p.i, side: p.side});
    var c = M.ctrls.find(function (cc) { return cc.side === p.side && cc.pi !== p.i; });
    if (c && p.ctrl < 0 && !p.gk) setCtrl(M, c, p);
  }
  function header(M, p) {
    var b = M.ball, d = dirOf(p.side, M), S = M.S, gx = d * S.Lh, near = hyp(gx - p.x, p.y) < S.boxL + 6;
    var tx = near ? gx : p.x + d * 12, ty = near ? (M.rnd() - 0.5) * S.goalW * 1.6 : p.y * 0.5, dx = tx - b.x, dy = ty - b.y, dm = hyp(dx, dy) || 1, sp = near ? 15 : 11;
    b.vx = dx / dm * sp; b.vy = dy / dm * sp; b.vz = near ? 1.2 : 3.5; b.last = p.i; b.lastSide = p.side; b.lock = p.i; b.lockT = 0.25; b.offside = null;
    if (near) { b.shot = {side: p.side, by: p.i, t: M.t, kind: 'header', decided: false, power: 0.6}; M.stats[p.side].shots++; p.g.shots++; }
    p.g.headers++; ev(M, 'header', {by: p.i, side: p.side, shot: near});
  }
  // keep players from walking through each other (light push)
  function separate(M) {
    var P = M.players;
    for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
      var a = P[i], c = P[j], dx = c.x - a.x, dy = c.y - a.y, d = hyp(dx, dy);
      if (d > 0 && d < 0.62) { var k = (0.62 - d) / d * 0.5; a.x -= dx * k; a.y -= dy * k; c.x += dx * k; c.y += dy * k; }
    }
  }

  // ---------- 🥅 penalty shootout (Hard+ when it's a draw) ----------
  function startPens(M) {
    M.phase = 'pens'; M.phaseT = 0; M.pens = {n: [0, 0], g: [0, 0], turn: M.kickSide === 0 ? 1 : 0, step: 'set', t: 0, aim: 0, dive: null, list: [[], []]};
    ev(M, 'pens', {});
    pensSet(M);
  }
  function pensSet(M) {
    var P = M.pens, S = M.S, side = P.turn, d = dirOf(side, M), b = M.ball;
    var kickers = M.players.filter(function (p) { return p.side === side && !p.gk; }), kicker = kickers[(kickers.length - 1 - P.n[side] % kickers.length + kickers.length) % kickers.length];
    var c = M.ctrls.find(function (cc) { return cc.side === side; }); if (c) setCtrl(M, c, kicker.ctrl < 0 || kicker.ctrl === c.ci ? kicker : M.players[c.pi]); if (c) kicker = M.players[c.pi];
    var k = keeperOf(M, 1 - side);
    M.players.forEach(function (p) { p.vx = p.vy = 0; p.st = 'ok'; p.dive = 0; if (p === kicker || p === k) return; p.x = (p.side === side ? -1 : 1) * 2 + (p.slot % 3) * 0.8; p.y = -S.Wh * 0.3 + p.slot * 1.1 + p.side * 4; });
    b.owner = -1; b.x = d * (S.Lh - S.spot); b.y = 0; b.z = 0; b.vx = b.vy = b.vz = 0; b.shot = null; b.spin = 0;
    kicker.x = b.x - d * 1.6; kicker.y = 0.3; kicker.fx = d; kicker.fy = 0;
    k.x = d * (S.Lh - 0.2); k.y = 0; k.fx = -d; k.fy = 0;
    P.kicker = kicker.i; P.keeper = k.i; P.step = 'set'; P.t = 0; P.aim = null; P.dive = null; P.mk = 0; P.mkPh = M.rnd() * 6;
  }
  function pensKey(M, c, k, down) {
    var P = M.pens; if (!P || !down) return;
    if (c.side === P.turn && (k === 'K' || k === 'J') && P.step === 'set' && P.t > 0.5) { P.aim = P.mk; P.human = true; pensKick(M); }   // 🎯 the kick goes where the moving target is
  }
  function pensDive(M, side, ys) { var P = M.pens; if (!P || side === P.turn || P.step !== 'set') return; P.dive = ys; }
  function pensKick(M) {
    var P = M.pens, S = M.S, side = P.turn, d = dirOf(side, M), b = M.ball, kicker = M.players[P.kicker], k = M.players[P.keeper];
    var kickHuman = sideHuman(M, side), keepHuman = sideHuman(M, 1 - side);
    var cont = P.human && P.aim != null, mk = cont ? P.aim : 0;   // 🎯 a person's kick: -1 … +1 across the goal (world y)
    var aim = cont ? (Math.abs(mk) < 0.3 ? 0 : Math.sign(mk)) : P.aim != null ? P.aim : (M.rnd() < 0.2 ? 0 : (M.rnd() < 0.5 ? -1 : 1));   // world y side: -1 / 0 / +1
    var dive = P.dive != null ? P.dive : (keepHuman ? 0 : (M.rnd() < M.L.keeper * 0.7 ? aim : [-1, 0, 1][Math.floor(M.rnd() * 3)]));
    var miss = cont ? Math.abs(mk) > 0.97 : !kickHuman && aim !== 0 && M.rnd() < 0.08;
    var save = aim === dive ? M.rnd() < (cont && Math.abs(mk) > 0.72 ? 0.4 : 0.82) : false;
    var ty = cont ? mk * S.goalW * (miss ? 1.25 : 0.88) : aim * S.goalW * 0.62 * (miss ? 1.6 : 1), tz = 0.4 + M.rnd() * 0.9;
    b.owner = kicker.i; kicker.x = b.x - d * 0.4;
    shoot(M, kicker, {power: 0.7, ax: d, ay: 0, aimHelp: 3, human: false, acc: 1});
    var tt = (S.spot) / 20; b.vx = d * S.spot / tt; b.vy = ty / tt; b.vz = (tz) / tt + GRAV * tt * 0.5; b.spin = 0;
    b.shot.forced = save ? 'save' : 'goal'; b.shot.pen = true;
    P.step = 'flight'; P.t = 0; P.res = miss ? 'miss' : save ? 'save' : 'goal'; P.aimW = aim; P.diveW = dive; P.human = false;
    if (miss) b.shot.forced = null;
  }
  function pensStep(M, dt) {
    var P = M.pens; P.t += dt; var b = M.ball;
    if (P.step === 'set') {
      var kickHuman = sideHuman(M, P.turn);
      if (kickHuman) P.mk = Math.sin(P.t * PEN_SPD[M.level] + P.mkPh);   // 🎯 the target slides across the goal
      if (!kickHuman && P.t > (M.fast ? 0.2 : 2.2)) pensKick(M);
      else if (kickHuman && P.t > (M.fast ? 0.4 : 6)) { P.aim = P.mk; P.human = true; pensKick(M); }
      return;
    }
    if (P.step === 'flight') {
      var pre = b.x; stepBallPens(M, dt);
      if (P.t > (M.fast ? 0.6 : 1.6) || b.shot == null) {
        var side = P.turn, scored = P.goalIn === true;
        P.n[side]++; if (scored) P.g[side]++; P.list[side].push(scored ? 1 : 0);
        ev(M, 'pen', {side: side, scored: scored, n: P.n.slice(), g: P.g.slice()});
        P.goalIn = false;
        // decided?
        var left0 = Math.max(0, 5 - P.n[0]), left1 = Math.max(0, 5 - P.n[1]);
        var done = (P.n[0] <= 5 && P.n[1] <= 5 && (P.g[0] + left0 < P.g[1] || P.g[1] + left1 < P.g[0])) || (P.n[0] >= 5 && P.n[0] === P.n[1] && P.g[0] !== P.g[1]);
        if (done) { M.winner = P.g[0] > P.g[1] ? 0 : 1; endMatch(M, true); return; }
        P.turn = 1 - side; pensSet(M);
      }
    }
  }
  function stepBallPens(M, dt) {
    var b = M.ball, S = M.S, P = M.pens, sh = b.shot;
    if (!sh) return;
    var px = b.x; b.vz -= GRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; if (b.z < 0) { b.z = 0; b.vz = Math.abs(b.vz) * 0.4; }
    var k = M.players[P.keeper], d = dirOf(P.turn, M);
    if (!sh.decided && (k.x - b.x) * d < 4) { sh.decided = true; k.dive = P.diveW; k.diveT = 0.7; k.st = P.diveW ? 'dive' : 'ok'; k.diveY = P.diveW * S.goalW * 0.62; ev(M, 'dive', {by: k.i, side: 1 - P.turn, dir: P.diveW, right: P.diveW === P.aimW}); }
    var gx = d * S.Lh;
    if ((b.x - k.x) * d >= -0.1 && P.res === 'save' && !sh.done) { sh.done = true; b.vx = -b.vx * 0.3; b.vy = P.diveW * 4; b.vz = 2; M.stats[1 - P.turn].saves++; k.g.saves++; ev(M, 'save', {by: k.i, side: 1 - P.turn, pen: true, right: true}); }
    if ((px - gx) * d < 0 && (b.x - gx) * d >= 0) {
      if (Math.abs(b.y) < S.goalW && b.z < S.goalH) { P.goalIn = true; b.vx *= 0.1; b.vy *= 0.1; ev(M, 'pengoal', {side: P.turn}); }
      else ev(M, 'penmiss', {side: P.turn});
      b.shot = null;
    }
  }

  // ---------- time ----------
  function endMatch(M, pens) {
    if (M.done) return;
    if (!pens) M.winner = M.score[0] > M.score[1] ? 0 : M.score[1] > M.score[0] ? 1 : -1;
    M.done = true; M.phase = 'end'; M.phaseT = 0;
    ev(M, 'end', {winner: M.winner, score: M.score.slice(), pens: M.pens ? M.pens.g.slice() : null, hcLost: !!M.hcLost});
  }
  function step(M, dt) {
    dt = dt || DT;
    if (M.done) { M.t += dt; M.phaseT += dt; M.players.forEach(function (p) { if (p.celebrate > 0) p.celebrate -= dt; p.vx *= 0.9; p.vy *= 0.9; }); return; }
    M.t += dt; M.phaseT += dt;
    M.ctrls.forEach(function (c) {
      if (c.liftT > 0) c.liftT -= dt;
      if (c.trickPend >= 0 && M.t - c.trickPend > 0.14) { c.trickPend = -1; var p = M.players[c.pi]; if (p && M.ball.owner === p.i && M.phase === 'play') trick(M, p, c); else if (p && M.phase === 'play') callPress(M, c); }
    });
    if (M.battle && !M.done) { battleStep(M, dt); return; }
    if (M.phase === 'pens') { pensStep(M, dt); M.players.forEach(function (p) { if (p.st !== 'ok') stepPlayer(M, p, dt); }); return; }
    if (M.phase === 'goal') {
      var gw = M.fast ? 0.3 : 2.6;
      if (M.phaseT > gw) { if (M.hcLost) { endMatch(M); return; } kickoffSetup(M, 1 - M.goalSide); }
    } else if (M.phase === 'half') {
      if (M.phaseT > (M.fast ? 0.3 : 3)) { M.half = 2; M.clock = M.halfLen; M.swap = true; kickoffSetup(M, 1); ev(M, 'swap', {}); }
      return;
    } else if (M.phase === 'kickoff') {
      var tk = M.ball.owner >= 0 ? M.players[M.ball.owner] : null;
      if (!M.rs) M.rs = {kind: 'kickoff', side: M.kickSide, x: 0, y: 0, taker: tk ? tk.i : -1};
      var hk = tk && ctrlOf(M, tk);
      if (tk && !hk && M.phaseT > (M.fast ? 0.15 : 1.4)) robotRestart(M, tk);
      else if (tk && hk && (M.phaseT > (M.fast ? 0.2 : 9) || (hk.moved && M.phaseT > 0.4 && hyp(hk.ix, hk.iy) > 0.3))) { M.phase = 'play'; M.rs = null; ev(M, 'kickoff', {side: M.kickSide}); }
    } else if (M.phase === 'restart') {
      var rs = M.rs, tp = rs ? M.players[rs.taker] : null;
      if (tp && hyp(tp.x - rs.x, tp.y - rs.y) < 1.2 && M.phaseT > 0.3) { M.ball.x = rs.x; M.ball.y = rs.y; M.ball.owner = -1; }
      if (tp && !ctrlOf(M, tp) && M.phaseT > (M.fast ? 0.25 : rs.ask ? rs.wait : 1.6 + M.L.react)) { tp.x = rs.x - dirOf(tp.side, M) * 0.3; tp.y = rs.y; robotRestart(M, tp); }
      else if (tp && ctrlOf(M, tp) && M.fast && M.phaseT > 0.3) {   /* a person's set piece waits for J / K (Aowu 2026-11-14) — only the test-speed mode takes it by itself */
        tp.x = rs.x - dirOf(tp.side, M) * 0.3; tp.y = rs.y; takeRestart(M, tp, ctrlOf(M, tp), 'pass', 0.4); }
    }
    for (var i = 0; i < M.players.length; i++) stepPlayer(M, M.players[i], dt);
    separate(M);
    if (M.phase === 'play' || M.phase === 'goal') stepBall(M, dt);
    if (M.phase === 'goal') { var gb = M.ball, gl = M.S.Lh + 1.1; if (Math.abs(gb.x) > gl) { gb.x = Math.sign(gb.x) * gl; gb.vx = 0; gb.vy *= 0.5; } }
    else if (M.phase === 'kickoff' || M.phase === 'restart') { var bb = M.ball; if (bb.owner >= 0) stepBall(M, dt); }
    if (M.phase === 'play') {
      pickup(M); moments(M); if (M.drill) { drillStep(M, dt); return; }
      if (M.twist) twistTick(M, dt);
      if (M.ball.owner >= 0) M.stats[M.players[M.ball.owner].side].poss += dt;
      autoSwitch(M);
      if (!M.golden) {
        M.clock += dt;
        if (M.half === 1 && !M.S.oneHalf && M.clock >= M.halfLen) { M.phase = 'half'; M.phaseT = 0; ev(M, 'half', {score: M.score.slice()}); }
        else if (M.clock >= M.halfLen * (M.S.oneHalf ? 1 : 2) && (M.half === 2 || M.S.oneHalf)) {
          if (M.score[0] !== M.score[1]) endMatch(M);
          else if (M.L.draw === 'pens' && !M.noPens) startPens(M);
          else if (!M.noGolden) { M.golden = true; M.goldenT = 0; ev(M, 'goldengoal', {}); }
          else endMatch(M);
        }
      } else { M.goldenT += dt; if (M.goldenT > 150) endMatch(M); }
    }
  }
  function autoSwitch(M) {
    var b = M.ball;
    M.ctrls.forEach(function (c) {
      var me = M.players[c.pi]; if (!me) return;
      if (b.owner >= 0 && M.players[b.owner].side === c.side) return;   // attacking: you keep the player you have (passes switch for you)
      if (M.t - c.swT < 0.9 || b.shot) return;
      if (b.owner < 0 && b.passTo === me.i && M.t - b.passT < 3) return;   // 🙋 a pass is on its way to you: keep your player
      var near = null, nd = 1e9; M.players.forEach(function (q) { if (q.side !== c.side || q.gk || (q.ctrl >= 0 && q.ctrl !== c.ci) || q.st === 'down') return; var d = hyp(q.x - b.x, q.y - b.y); if (d < nd) { nd = d; near = q; } });
      if (near && near.i !== me.i && hyp(me.x - b.x, me.y - b.y) > nd + 4) setCtrl(M, c, near);
    });
  }
  function takeEvents(M) { var e = M.events; M.events = []; return e; }
  // whole matches without a page (tests: robot vs robot, a level's feel)
  function simulate(M, secs, onStep) { var n = Math.round((secs || 600) / DT); for (var i = 0; i < n && !M.done; i++) { step(M, DT); if (onStep) onStep(M); } takeEvents(M); return M; }
  // 🌱 guided Basic: the teammate the glowing ring points at (same pick as an aimed pass)
  function hint(M, ci) {
    var c = M.ctrls[ci], p = c && M.players[c.pi]; if (!p || M.ball.owner !== p.i) return null;
    var d = dirOf(p.side, M), q = bestPass(M, p, d, 0, 1.4), goalD = hyp(d * M.S.Lh - p.x, p.y);
    return {pass: q ? q.i : -1, shoot: goalD < M.L.range + 3, goal: {x: d * M.S.Lh, y: 0}};
  }
  return {DT: DT, SIZES: SIZES, LEVELS: LEVELS, TRICKS: TRICKS, newMatch: newMatch, step: step, input: input, key: key, shout: shout, takeEvents: takeEvents, simulate: simulate,
    hint: hint, bestPass: bestPass, keeperOf: keeperOf, dirOf: dirOf, restart: restart, kickoffSetup: kickoffSetup, startPens: startPens, homeOf: homeOf, addCtrl: addCtrl, setCtrl: setCtrl,
    throwTo: throwTo, MO_WIN: MO_WIN, DRILLS: DRILLS, battleStart: battleStart, BTRICK: BTRICK, BPM: BPM, B_PERF: B_PERF, B_GOOD: B_GOOD, CONE_STARS: CONE_STARS, drill: drill, TWISTS: TWISTS, PARTY: PARTY, inMud: inMud, inZone: inZone, ACT_BEATS: ACT_BEATS, JUMPS: JUMPS,
    _: {startAct: startAct, actTick: actTick, jumpNow: jumpNow, jumpV: jumpV, airTime: airTime, threatened: threatened, askBall: askBall, kickBall: kickBall, pass: pass, shoot: shoot, trick: trick, nutmeg: nutmeg, nutTarget: nutTarget, momentOf: momentOf, moments: moments, starAdd: starAdd, lift: lift, standTackle: standTackle, slide: slide, isOffside: isOffside, foul: foul, endMatch: endMatch}};
})();
// ENGINE END
/* 🏷️ BlasLogo (bo-6, Aowu 2026-11-15 12:33 OK): the BlasOff logo + mode badges drawn in code — plan claude/blasoff-logo-plan.md */
const BlasLogo = (() => {
  const MODE = {
    match:  {key: 'match',  name: 'Match',  ac: '#FFB020', scene: 'goal',  pose: 'bicycle'},   // ⚽ Matches (4v4 · 7v7 · 11v11 · 🎉 Party)
    futsal: {key: 'futsal', name: 'Futsal', ac: '#38C8FF', scene: 'court', pose: 'kick'},      // 🏙️ Small games box + 🥅 Futsal card
    street: {key: 'street', name: 'Street', ac: '#7CF7A0', scene: 'cage',  pose: 'volley'},    // 🏙️ Street 1v1 card (Aowu 09:44)
    trick:  {key: 'trick',  name: 'Trick',  ac: '#FF5AD2', scene: 'swirl', pose: 'flick'},     // 🕺 Tricks + skills (🎤 battle · 🎯 skills · 🥅 shootout)
    cup:    {key: 'cup',    name: 'Cup',    ac: '#FFD23F', scene: 'cup',   pose: null}         // 🏆 R4 (Cup · League · 👑 Family cup)
  };
  const THEME = {   // glow · rim (2 metal stops) · back (centre, edge) · fire (tip, mid, base) · space (star fill)
    classic:    {glow: '#FF7A1A', rim: ['#FFFFFF', '#8A93A6'], back: ['#2A1A10', '#08060A'], fire: ['#FFF3A0', '#FF8A1E', '#D2280A'], space: ['#1C2A5A', '#070A18']},
    jungle:     {glow: '#9BE15D', rim: ['#F6E7A0', '#7A6A2A'], back: ['#1E2A10', '#070A04'], fire: ['#FFF3A0', '#FF9A2A', '#C2380A'], space: ['#22401C', '#060E05']},
    underwater: {glow: '#3BE0D0', rim: ['#E8FBFF', '#3A8AA0'], back: ['#06324A', '#020C14'], fire: ['#E8FFFF', '#3BE0D0', '#1C8FB0'], space: ['#0A4A6A', '#020C14']},
    neon:       {glow: '#FF2BD6', rim: ['#B8F3FF', '#3C5CFF'], back: ['#1A0A3C', '#05020E'], fire: ['#FFFFFF', '#3CF2FF', '#FF2BD6'], space: ['#2A0E5A', '#05020E']},
    robot:      {glow: '#5CC8FF', rim: ['#E6ECF2', '#5A6676'], back: ['#232B36', '#0A0D12'], fire: ['#FFF7C0', '#FFD23F', '#E0601A'], space: ['#2E3A4E', '#0A0D12']},
    moon:       {glow: '#B8C6FF', rim: ['#FFFFFF', '#7A7C90'], back: ['#151933', '#010208'], fire: ['#FFFFFF', '#B8C6FF', '#5B4EFF'], space: ['#151933', '#010208']},
    olympus:    {glow: '#FFC94A', rim: ['#FFF4C8', '#C9962A'], back: ['#2C5A8C', '#0E2440'], fire: ['#FFFFFF', '#FFD86A', '#E08A1A'], space: ['#3A72B0', '#0E2440']}
  };
  const FONT = (w, px) => w + ' ' + px + 'px Fredoka, Nunito, "Arial Rounded MT Bold", sans-serif';
  const cache = {}; let SC = 1;   // SC = current scale (shadow blur is not scaled by the canvas transform)
  const lin = (g, x0, y0, x1, y1, st) => { const q = g.createLinearGradient(x0, y0, x1, y1); st.forEach((c, i) => q.addColorStop(i / (st.length - 1), c)); return q; };
  const rad = (g, x, y, r, st) => { const q = g.createRadialGradient(x, y - r * 0.35, r * 0.05, x, y, r); st.forEach((c, i) => q.addColorStop(i / (st.length - 1), c)); return q; };

  function shield(g){   // unit shield: 200 wide, 240 tall, centre (0,0) — flat top with two notches like the sheet
    g.beginPath(); g.moveTo(-100, -108); g.lineTo(-40, -108); g.lineTo(-30, -96); g.lineTo(30, -96); g.lineTo(40, -108); g.lineTo(100, -108);
    g.lineTo(100, 10); g.quadraticCurveTo(94, 82, 0, 120); g.quadraticCurveTo(-94, 82, -100, 10); g.closePath();
  }
  function star(g, R, r){ g.beginPath(); for(let i = 0; i < 12; i++){ const a = -Math.PI / 2 + i * Math.PI / 6, q = i % 2 ? r : R; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); }   // 6-point star
  function sparks(g, T, n, R, seed){ g.save(); g.fillStyle = T.fire[1]; for(let i = 0; i < n; i++){ const a = i * 2.39996 + seed, d = R * (0.55 + 0.45 * ((i * 37 % 11) / 11)), s = 1.4 + (i % 3); g.globalAlpha = 0.5 + 0.5 * ((i * 13 % 7) / 7); g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d * 0.8, s, 0, 7); g.fill(); } g.restore(); }
  function rays(g, T, r, n){ g.save(); g.globalAlpha = 0.13; g.fillStyle = T.glow; for(let i = 0; i < n; i++){ const a = i * Math.PI * 2 / n; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a, a + Math.PI / n * 0.5); g.closePath(); g.fill(); } g.restore(); }
  function trail(g, T, x, y, r, ang){   // fire trail behind a flying ball (ang = direction the trail points to)
    g.save(); g.translate(x, y); g.rotate(ang);
    [[2.8, 1, T.fire[2]], [2.2, 0.78, T.fire[1]], [1.5, 0.5, T.fire[0]]].forEach(([L, W, c]) => {
      g.fillStyle = c; g.beginPath(); g.moveTo(0, -r * W);
      g.quadraticCurveTo(r * L * 0.5, -r * W * 1.2, r * L, -r * 0.2); g.quadraticCurveTo(r * L * 0.7, 0, r * L * 1.05, r * 0.35);
      g.quadraticCurveTo(r * L * 0.5, r * W * 1.2, 0, r * W); g.closePath(); g.fill();
    });
    g.restore();
  }
  function ball(g, x, y, r, spin){   // classic black + white football (pentagons), our own drawing
    g.save(); g.translate(x, y); g.rotate(spin || 0);
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = rad(g, 0, 0, r, ['#FFFFFF', '#F2F2F2', '#B9BEC8']); g.fill();
    g.save(); g.clip(); g.fillStyle = '#16181E';
    const pent = (cx, cy, s, rot) => { g.beginPath(); for(let i = 0; i < 5; i++){ const a = rot + i * Math.PI * 2 / 5; g.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s); } g.closePath(); g.fill(); };
    pent(0, 0, r * 0.36, -Math.PI / 2); for(let i = 0; i < 5; i++){ const a = -Math.PI / 2 + i * Math.PI * 2 / 5 + Math.PI / 5; pent(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98, r * 0.32, a + Math.PI / 2); }
    g.strokeStyle = '#16181E'; g.lineWidth = r * 0.05; for(let i = 0; i < 5; i++){ const a = -Math.PI / 2 + i * Math.PI * 2 / 5; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36); g.lineTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72); g.stroke(); }
    g.restore();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.45, r * 0.24, r * 0.13, -0.6, 0, 7); g.fill();   // shine
    g.lineWidth = r * 0.07; g.strokeStyle = 'rgba(10,12,20,.85)'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
    g.restore();
  }
  function rocket(g, T, x, y, r, ang){   // the BlasOff rocket-ball: football + 3 fins + exhaust flame
    g.save(); g.translate(x, y); g.rotate(ang);   // nose points along +x
    trail(g, T, -r * 0.9, 0, r * 0.75, Math.PI);
    g.fillStyle = lin(g, -r, -r, -r, r, [T.rim[0], T.rim[1]]); g.strokeStyle = 'rgba(10,12,20,.8)'; g.lineWidth = r * 0.06;
    [[-1], [1]].forEach(([s]) => { g.beginPath(); g.moveTo(-r * 0.2, s * r * 0.75); g.lineTo(-r * 1.25, s * r * 1.25); g.lineTo(-r * 0.95, s * r * 0.35); g.closePath(); g.fill(); g.stroke(); });
    g.beginPath(); g.moveTo(-r * 0.6, -r * 0.18); g.lineTo(-r * 1.35, 0); g.lineTo(-r * 0.6, r * 0.18); g.closePath(); g.fill(); g.stroke();
    ball(g, 0, 0, r, 0.3);
    g.restore();
  }
  /* 🏃 solid player silhouettes (Aowu 09:44: like the sheet, not stick figures) — side view, facing right.
     Pose = absolute segment angles (0 = straight down, + = toward +x): torso (hip → shoulder), neck, legs [thigh, shin, foot], arms [upper, fore].
     Each segment = a tapered capsule; the whole body is filled once in the look's fire colours, with a dark rim + glow behind. */
  const POSES = {
    kick:    {torso: Math.PI - 0.28, neck: Math.PI - 0.15, legs: [[0.18, 0.02, 1.57], [-0.75, -2.05, -1.2]], arms: [[1.95, 2.35], [-1.55, -1.15]], kickLeg: 1, plantLeg: 0},
    bicycle: {torso: -1.25, neck: -1.45, legs: [[2.85, 2.55, 1.7], [1.55, 1.05, 1.35]], arms: [[-0.25, 0.15], [-2.1, -2.5]], kickLeg: 0},
    flick:   {torso: Math.PI - 0.12, neck: Math.PI - 0.05, legs: [[0.06, -0.02, 1.57], [-0.45, -2.6, -2.2]], arms: [[2.05, 2.4], [-2.05, -2.4]], kickLeg: 1},
    volley:  {torso: Math.PI + 0.75, neck: Math.PI + 0.55, legs: [[1.95, 1.85, 1.65], [0.45, -0.55, 1.1]], arms: [[3.65, 3.3], [1.35, 1.15]], kickLeg: 0}
  };
  const SEG = {thigh: [0.24, 0.072, 0.05], shin: [0.23, 0.048, 0.032], foot: [0.1, 0.034, 0.026], upper: [0.16, 0.042, 0.034], fore: [0.15, 0.032, 0.026], torso: [0.3, 0.078, 0.098], neck: [0.06, 0.034, 0.034]};
  function figure(g, T, pose, x, y, h){
    const P = POSES[pose]; if(!P) return null;
    const dir = a => [Math.sin(a), Math.cos(a)], caps = [];
    const seg = (p, a, k) => { const [L, r1, r2] = SEG[k], d = dir(a), q = [p[0] + d[0] * L, p[1] + d[1] * L]; caps.push([p, q, r1, r2]); return q; };
    const hip = [0, 0], sh = seg(hip, P.torso, 'torso'), nk = seg(sh, P.neck, 'neck'), hd = dir(P.neck), head = [nk[0] + hd[0] * 0.07, nk[1] + hd[1] * 0.07];
    const toes = P.legs.map(([a, b, c]) => { const knee = seg([hip[0], hip[1]], a, 'thigh'), ank = seg(knee, b, 'shin'); return seg(ank, c, 'foot'); });
    P.arms.forEach(([a, b]) => { const el = seg([sh[0] - dir(P.torso)[0] * 0.03, sh[1] - dir(P.torso)[1] * 0.03], a, 'upper'); const hand = seg(el, b, 'fore'); caps.push([hand, hand, 0.034, 0.034]); });
    const W = (p) => [x + p[0] * h, y + p[1] * h];
    const path = (grow) => { g.beginPath();
      caps.forEach(([p, q, r1, r2]) => { const a = W(p), b = W(q), R1 = (r1 + grow) * h, R2 = (r2 + grow) * h, dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy);
        if(m < 0.01){ g.moveTo(a[0] + R1, a[1]); g.arc(a[0], a[1], R1, 0, 7); return; }
        const t = Math.atan2(dy, dx); g.moveTo(a[0] + Math.cos(t + Math.PI / 2) * R1, a[1] + Math.sin(t + Math.PI / 2) * R1);
        g.arc(a[0], a[1], R1, t + Math.PI / 2, t - Math.PI / 2); g.arc(b[0], b[1], R2, t - Math.PI / 2, t + Math.PI / 2); g.closePath(); });
      const c = W(head); g.moveTo(c[0] + (0.085 + grow) * h, c[1]); g.arc(c[0], c[1], (0.085 + grow) * h, 0, 7); };
    g.save(); g.shadowColor = T.glow; g.shadowBlur = 14 * SC; g.fillStyle = '#0B0D14'; path(0.022); g.fill('nonzero'); g.restore();   // dark rim + glow
    g.fillStyle = lin(g, x, y - h * 0.55, x, y + h * 0.5, [T.fire[0], T.fire[1], T.fire[2]]); path(0); g.fill('nonzero');
    g.save(); g.globalAlpha = 0.35; g.fillStyle = '#FFFFFF'; const hc = W(head); g.beginPath(); g.arc(hc[0] - 0.025 * h, hc[1] - 0.03 * h, 0.035 * h, 0, 7); g.fill(); g.restore();   // head shine
    return {toe: W(toes[P.kickLeg]), plant: W(toes[P.plantLeg == null ? 1 - P.kickLeg : P.plantLeg]), head: W(head)};
  }
  function swoosh(g, T, x, y, r, a0, a1){ g.save(); g.lineCap = 'round'; [[1, 5, T.fire[1]], [1.22, 3, T.glow], [1.42, 2, '#FFFFFF']].forEach(([k, w, c], i) => { g.globalAlpha = 0.85 - i * 0.2; g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.arc(x, y, r * k, a0, a1); g.stroke(); }); g.restore(); }
  function scene(g, T, kind){
    g.save();
    if(kind === 'goal'){   // goal frame + net, top-left
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.4;
      for(let x = -86; x <= -6; x += 9){ g.beginPath(); g.moveTo(x, -84); g.lineTo(x + 14, -20); g.stroke(); }
      for(let y = -84; y <= -20; y += 9){ g.beginPath(); g.moveTo(-86 + (y + 84) * 0.22, y); g.lineTo(-6 + (y + 84) * 0.22, y); g.stroke(); }
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 5; g.beginPath(); g.moveTo(-86, -20); g.lineTo(-86, -84); g.lineTo(-6, -84); g.lineTo(-6, -20); g.stroke();
    } else if(kind === 'court'){   // futsal court lines: halfway line + centre circle + small goal
      g.fillStyle = lin(g, 0, -10, 0, 120, ['rgba(56,200,255,.18)', 'rgba(56,200,255,.38)']); g.fillRect(-100, -10, 200, 130);
      g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(-100, 40); g.lineTo(100, 40); g.stroke(); g.beginPath(); g.ellipse(0, 40, 46, 18, 0, 0, 7); g.stroke();
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 4; g.beginPath(); g.moveTo(-38, -10); g.lineTo(-38, -58); g.lineTo(38, -58); g.lineTo(38, -10); g.stroke();
      g.lineWidth = 1.2; g.strokeStyle = 'rgba(255,255,255,.45)'; for(let x = -30; x <= 30; x += 8){ g.beginPath(); g.moveTo(x, -56); g.lineTo(x, -12); g.stroke(); }
    } else if(kind === 'swirl'){   // trick rings around the ball
      g.lineCap = 'round';
      [[64, 22, 0.35, T.glow], [52, 16, -0.4, '#FFFFFF']].forEach(([rx, ry, rot, c], i) => { g.strokeStyle = c; g.globalAlpha = i ? 0.8 : 1; g.lineWidth = i ? 3 : 6; g.beginPath(); g.ellipse(0, -30, rx, ry, rot, 0.2, Math.PI * 1.7); g.stroke(); });
      g.globalAlpha = 1;
    } else if(kind === 'cage'){   // 🏙️ street cage: wall + painted goal + wire fence + graffiti star
      g.fillStyle = lin(g, 0, -110, 0, 120, ['#3A3F4C', '#20232C']); g.fillRect(-100, -110, 200, 230);
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.2; for(let y = -100; y < 60; y += 16){ g.beginPath(); g.moveTo(-100, y); g.lineTo(100, y); g.stroke(); for(let x = -100 + (y / 16 % 2 ? 0 : 16); x < 100; x += 32){ g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); } }
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 5; g.beginPath(); g.moveTo(-60, 40); g.lineTo(-60, -40); g.lineTo(60, -40); g.lineTo(60, 40); g.stroke();
      g.save(); g.translate(-62, -76); g.rotate(-0.25); g.fillStyle = T.glow; g.globalAlpha = 0.9; star(g, 18, 8); g.fill(); g.restore();
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(-100, 40, 200, 80);
      g.strokeStyle = 'rgba(200,210,230,.45)'; g.lineWidth = 1.3; for(let k = -260; k < 260; k += 18){ g.beginPath(); g.moveTo(k, -110); g.lineTo(k + 230, 120); g.stroke(); g.beginPath(); g.moveTo(k, 120); g.lineTo(k + 230, -110); g.stroke(); }
    } else if(kind === 'cup'){   // trophy (R4)
      g.fillStyle = lin(g, -40, -90, 40, 40, ['#FFF4C8', '#FFD23F', '#B8861A']); g.strokeStyle = '#3A2A06'; g.lineWidth = 4;
      g.beginPath(); g.moveTo(-42, -84); g.lineTo(42, -84); g.quadraticCurveTo(40, -20, 8, -8); g.lineTo(8, 18); g.lineTo(26, 30); g.lineTo(-26, 30); g.lineTo(-8, 18); g.lineTo(-8, -8); g.quadraticCurveTo(-40, -20, -42, -84); g.closePath(); g.fill(); g.stroke();
      g.lineWidth = 7; g.strokeStyle = '#D9A82A'; [[-1], [1]].forEach(([s]) => { g.beginPath(); g.arc(s * 46, -60, 16, s > 0 ? -1.4 : 1.4 - Math.PI * 2, s > 0 ? 1.4 : Math.PI * 2 - 1.4 + Math.PI * 2, s < 0); g.stroke(); });
      g.fillStyle = '#5A3A10'; g.fillRect(-34, 30, 68, 16);
    }
    g.restore();
  }
  function word(g, x, y, px, a, b, fillA, fillB, ink){   // "Blas" + "Off", one word, two fills
    g.font = FONT('900 italic', px); g.textBaseline = 'middle'; g.lineJoin = 'round';
    const wa = g.measureText(a).width, wb = g.measureText(b).width, x0 = x - (wa + wb) / 2;
    g.lineWidth = px * 0.24; g.strokeStyle = ink; g.strokeText(a, x0, y); g.strokeText(b, x0 + wa, y);
    g.fillStyle = fillA; g.fillText(a, x0, y); g.fillStyle = fillB; g.fillText(b, x0 + wa, y);
    return wa + wb;
  }

  function badge(g, T, md, small){   // drawn in the unit box (≈ 220 × 260); small = icon only (the mode box shows the name)
    g.save(); g.shadowColor = T.glow; g.shadowBlur = 26 * SC; shield(g); g.lineWidth = 10; g.strokeStyle = T.glow; g.stroke(); g.restore();
    shield(g); g.fillStyle = rad(g, 0, -10, 150, [T.back[0], T.back[1]]); g.fill();
    g.save(); shield(g); g.clip();
    rays(g, T, 170, 22); sparks(g, T, 18, 110, 1);
    scene(g, T, md.scene);
    if(md.scene === 'cup'){ ball(g, 0, -40, small ? 24 : 18, 0.2); }
    else if(small){ const by = md.scene === 'swirl' ? -30 : -24; if(md.scene !== 'swirl') trail(g, T, 4, by, 42, -2.6); ball(g, 4, by, 42, 0.5); }
    else {
      const F = {match: [-2, 2, 124], futsal: [-34, -14, 124], trick: [8, 6, 124], street: [-16, 0, 128]}[md.key] || [0, 0, 124];
      const f = figure(g, T, md.pose, F[0], F[1], F[2]);
      if(md.pose === 'flick'){ ball(g, f.head[0] + 6, f.head[1] - 34, 18, 0.5); }
      else if(md.pose === 'kick'){ const bx = f.plant[0] + 30, by = f.plant[1] - 12; swoosh(g, T, f.toe[0] + 10, f.toe[1] + 6, 26, 2.2, 3.9); trail(g, T, bx, by, 15, -2.9); ball(g, bx, by, 15, 0.4); }
      else { const bx = f.toe[0] + 14, by = f.toe[1] - 10; swoosh(g, T, f.toe[0] - 16, f.toe[1] + 10, 30, md.pose === 'bicycle' ? 3.6 : 2.4, md.pose === 'bicycle' ? 5.4 : 4.2); trail(g, T, bx, by, 16, md.pose === 'bicycle' ? 2.3 : -2.7); ball(g, bx, by, 16, 0.6); }
    }
    g.restore();
    shield(g); g.lineWidth = 6; g.strokeStyle = lin(g, 0, -120, 0, 120, [T.rim[0], T.rim[1], T.rim[0], T.rim[1]]); g.stroke();
    if(small) return;
    g.save(); g.fillStyle = lin(g, 0, 62, 0, 100, ['#1A1206', '#08060A']);   // ribbon with the name
    g.beginPath(); g.moveTo(-112, 66); g.lineTo(112, 66); g.lineTo(104, 82); g.lineTo(112, 98); g.lineTo(-112, 98); g.lineTo(-104, 82); g.closePath(); g.fill();
    g.lineWidth = 3; g.strokeStyle = T.rim[0]; g.stroke(); g.restore();
    const px = 36; g.font = FONT('900 italic', px); const w = g.measureText(md.name).width, sc = Math.min(1, 190 / w);
    g.save(); g.translate(0, 82); g.scale(sc, sc); g.textAlign = 'left';
    word(g, 0, 1, px, '', md.name, '#FFFFFF', lin(g, 0, -18, 0, 18, ['#FFFFFF', md.ac, md.ac]), '#120A02'); g.restore();
  }

  function main(g, T, small){   // drawn in the unit box (≈ 480 × 360): star + rocket ball + "BlasOff" + tagline
    g.save(); g.translate(0, -36);
    g.save(); star(g, 150, 84); g.fillStyle = rad(g, 0, 0, 160, [T.space[0], T.space[1]]); g.fill(); g.clip();
    rays(g, T, 180, 26); sparks(g, T, 30, 130, 2);
    g.fillStyle = '#FFFFFF'; for(let i = 0; i < 14; i++){ const a = i * 2.1, d = 30 + (i * 53 % 90); g.globalAlpha = 0.6; g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 1.4, 0, 7); g.fill(); } g.globalAlpha = 1;
    g.restore();
    g.save(); g.shadowColor = T.glow; g.shadowBlur = 30 * SC; g.lineJoin = 'round'; g.lineWidth = 12;
    g.strokeStyle = lin(g, -150, -150, 150, 150, [T.rim[0], T.glow, T.rim[1]]); star(g, 150, 84); g.stroke(); g.restore();
    g.lineWidth = 4; g.strokeStyle = T.rim[0]; star(g, 150, 84); g.stroke();
    // twin rocket flames left + right (from the sheet)
    [[-1], [1]].forEach(([s]) => { g.save(); g.translate(s * 118, 60); g.rotate(s * 0.35); trail(g, T, 0, 0, 16, Math.PI / 2); g.restore(); });
    rocket(g, T, 24, -42, 44, -0.95);
    g.restore();
    const ink = '#120A02', chrome = lin(g, 0, 70, 0, 128, ['#FFFFFF', '#E3E7EF', '#9AA3B5', '#F4F6FA']), fire = lin(g, 0, 70, 0, 128, [T.fire[0], T.fire[1], T.fire[2]]);
    g.save(); g.shadowColor = T.glow; g.shadowBlur = 18 * SC; word(g, 0, 102, 84, 'Blas', 'Off', chrome, fire, ink); g.restore();
    word(g, 0, 102, 84, 'Blas', 'Off', chrome, fire, ink);
    if(small) return;   // tagline only where it can be read
    const tag = 'THE ULTIMATE KICK + GOAL GAME'; g.font = FONT('800', 20); const tw = g.measureText(tag).width + 34;
    g.fillStyle = 'rgba(8,6,10,.85)'; g.beginPath(); g.moveTo(-tw / 2, 138); g.lineTo(tw / 2, 138); g.lineTo(tw / 2 - 10, 162); g.lineTo(-tw / 2 + 10, 162); g.closePath(); g.fill();
    g.lineWidth = 2; g.strokeStyle = T.glow; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#FFFFFF'; g.fillText(tag, 0, 151); g.textAlign = 'start';
  }

  const BOX = {main: [520, 430], match: [272, 300], futsal: [272, 300], street: [272, 300], trick: [272, 300], cup: [272, 300]};   // room for the glow
  function draw(g, kind, x, y, px, look, css){   // px = width in canvas pixels · css = width on screen (size steps follow it; default px)
    const T = THEME[look] || THEME.classic, [bw] = BOX[kind] || BOX.match, s = px / bw; SC = s;
    g.save(); g.translate(x, y); g.scale(s, s); g.textAlign = 'start';
    const cw = css || px; kind === 'main' ? main(g, T, cw < 260) : badge(g, T, MODE[kind] || MODE.match, cw < 110);
    g.restore();
  }
  function pic(kind, look, px, css){
    css = css || px; const key = kind + ':' + (look || 'classic') + ':' + px + ':' + css; if(cache[key]) return cache[key];
    const [bw, bh0] = BOX[kind] || BOX.match, bh = kind === 'main' && css < 260 ? 370 : bh0, c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * bh / bw);   // small main: no tagline → a shorter picture
    draw(c.getContext('2d'), kind, px / 2, c.height / 2 + (kind === 'main' ? px * (css < 260 ? 0.025 : 0.04) : 0), px, look, css);
    return (cache[key] = c);
  }
  const url = (kind, look, px, css) => pic(kind, look, px, css).toDataURL('image/png');
  return {draw, pic, url, MODE, THEME, BOX};
})();
window.BlasLogo = BlasLogo;
