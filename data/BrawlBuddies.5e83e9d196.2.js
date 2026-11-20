
// ===== Brawl Buddies ENGINE (pure logic, no DOM) — pasted into BrawlBuddies.html between ENGINE START/END =====
// ENGINE START
var BB = (function () {
  'use strict';
  var DT = 1 / 120;
  var GRAV = 24, JUMP_V = 9.4, WALK = 3.3, BACK = 2.3, ARENA = 6.2, MIN_GAP = 0.78;
  var JUGGLE_MAX = 5, BUF = 0.16, GROUND_COMBO_CAP = 8;
  var CHORD = 0.05, TAP2 = 0.26, TECH = 0.34, DASH_V = 8.4, BDASH_V = 7, DASH_T = 0.34;
  var STAND_H = 1.6, DUCK_H = 0.95, AIR_H = 0.9;
  var CTR_W = 0.42, CB_W = 0.3;   // round I: ⚡ counter window after a block · a counter can be blocked only by a 🛡️ press this close before it lands

  // lvl: high (whiffs over a ducking buddy) · mid · low (needs a sitting block) · over (jump attacks: needs a standing block)
  // st / ac / rc = start-up, active, recovery (s) · reach = forward range from your middle · h = height range above your feet
  var MOVES = {
    boop:    { name: 'Boop', icon: '👊', lvl: 'high', st: 0.07, ac: 0.07, rc: 0.14, dmg: 6, kb: 1.5, stun: 0.34, reach: [0.2, 1.1], h: [0.96, 1.55], pw: 8 },
    bonk:    { name: 'Big Bonk', icon: '💥', lvl: 'mid', st: 0.2, ac: 0.09, rc: 0.26, dmg: 12, kb: 3.2, stun: 0.5, reach: [0.2, 1.25], h: [0.45, 1.6], pw: 12 },
    power:   { name: 'Power Push', icon: '🌀', lvl: 'mid', st: 0.16, ac: 0.14, rc: 0.34, dmg: 22, kb: 7.5, stun: 0.7, reach: [0.2, 1.6], h: [0.2, 1.7], pw: 0, chip: 0.25, needs: true, knock: true, lunge: 3 },
    lowboop: { name: 'Low boop', icon: '👊', lvl: 'low', st: 0.07, ac: 0.07, rc: 0.16, dmg: 5, kb: 1.3, stun: 0.32, reach: [0.2, 1.1], h: [0.05, 0.8], pw: 7, duck: true },
    lowbonk: { name: 'Low bonk', icon: '🦶', lvl: 'low', st: 0.17, ac: 0.09, rc: 0.28, dmg: 9, kb: 1.6, stun: 0.5, reach: [0.2, 1.35], h: [0, 0.45], pw: 10, duck: true, trip: true },
    upper:   { name: 'Uppercut', icon: '🚀', lvl: 'mid', st: 0.11, ac: 0.12, rc: 0.34, dmg: 10, kb: 0.7, stun: 0.6, reach: [0.1, 1.05], h: [0.3, 2.4], pw: 12, duck: true, launch: 9.4 },
    jboop:   { name: 'Jump boop', icon: '👊', lvl: 'over', st: 0.05, ac: 0.12, rc: 0.1, dmg: 7, kb: 1.2, stun: 0.38, reach: [0.05, 1.1], h: [-0.6, 1.3], pw: 8, air: true },
    jbonk:   { name: 'Jump Big Bonk', icon: '💥', lvl: 'over', st: 0.11, ac: 0.14, rc: 0.16, dmg: 12, kb: 2.4, stun: 0.5, reach: [0.05, 1.2], h: [-0.9, 1.2], pw: 12, air: true, spike: true },
    jpower:  { name: 'Diving Push', icon: '🌠', lvl: 'over', st: 0.1, ac: 0.24, rc: 0.2, dmg: 18, kb: 6, stun: 0.65, reach: [0.0, 1.4], h: [-1.1, 1.3], pw: 0, air: true, needs: true, chip: 0.25, dive: true, knock: true },
    // round A: → → dash attacks, grapples, guard breaker
    dboop:   { name: 'Dash boop', icon: '💨', lvl: 'high', st: 0.06, ac: 0.08, rc: 0.16, dmg: 7, kb: 2.2, stun: 0.38, reach: [0.2, 1.2], h: [0.9, 1.55], pw: 9, keep: true, lunge: 4.5 },
    dbonk:   { name: 'Dash bonk', icon: '💨', lvl: 'mid', st: 0.13, ac: 0.1, rc: 0.3, dmg: 13, kb: 4.2, stun: 0.5, reach: [0.2, 1.3], h: [0.4, 1.6], pw: 12, keep: true, lunge: 4, knock: true },
    fly:     { name: 'Flying boop + bonk', icon: '🚀', lvl: 'over', st: 0.1, ac: 0.3, rc: 0.2, dmg: 7, kb: 1.2, stun: 0.45, reach: [0.05, 1.25], h: [-0.4, 1.5], pw: 14, air: true, hop: [6.5, 5.2], open: 0.75,
               hits: [{ t: 0.1, d: 0.1 }, { t: 0.27, d: 0.12, dmg: 12, kb: 3.4, knock: true }] },
    grab:    { name: 'Grapple', icon: '🤼', lvl: 'throw', st: 0.07, ac: 0.08, rc: 0.38, dmg: 0, kb: 0, stun: 0, reach: [0.1, 0.95], h: [0, 1.7], pw: 0, grab: true },
    charge:  { name: 'Charging', icon: '🔨', lvl: 'none', st: 99, ac: 0, rc: 0, dmg: 0, kb: 0, stun: 0, reach: [0, 0], h: [0, 0], pw: 0 },
    gbreak:  { name: 'Guard breaker', icon: '🔨', lvl: 'mid', st: 0.1, ac: 0.1, rc: 0.3, dmg: 14, kb: 3.6, stun: 0.55, reach: [0.2, 1.35], h: [0.3, 1.7], pw: 10, breaker: true, knock: true, lunge: 2.5 },
    // round I: ⚡ counters (right after you block)
    cboop:   { name: 'Counter boop', icon: '⚡', lvl: 'mid', st: 0.04, ac: 0.08, rc: 0.2, dmg: 9, kb: 2.4, stun: 0.5, reach: [0.1, 1.5], h: [0.3, 1.7], pw: 10, lunge: 4, counter: true },
    cbonk:   { name: 'Counter bonk', icon: '⚡', lvl: 'mid', st: 0.07, ac: 0.1, rc: 0.26, dmg: 14, kb: 4, stun: 0.5, reach: [0.1, 1.55], h: [0.3, 1.7], pw: 12, lunge: 4, knock: true, counter: true }
  };
  // 🤼 six cartoon grapples (random): imp = when it lands (s), dur = whole move, land = where the buddy ends up
  var GRABS = {
    suplex:    { name: 'Suplex', icon: '🤸', dmg: 16, imp: 0.62, dur: 0.95, land: 'behind' },
    skyslam:   { name: 'Sky Slam', icon: '🌩️', dmg: 17, imp: 0.7, dur: 1.0, land: 'front' },
    powerbomb: { name: 'Powerbomb', icon: '💣', dmg: 19, imp: 0.78, dur: 1.05, land: 'front' },
    swing:     { name: 'Giant Swing', icon: '🌀', dmg: 14, imp: 1.1, dur: 1.3, land: 'toss' },
    pancake:   { name: 'Pancake Flop', icon: '🥞', dmg: 15, imp: 0.66, dur: 1.0, land: 'front' },
    rocket:    { name: 'Rocket Toss', icon: '🚀', dmg: 12, imp: 0.5, dur: 0.8, land: 'up' }
  };
  var GRAB_KEYS = Object.keys(GRABS);
  // 🤖 bot styles (round D): each robot gets one at random; it leans the level's brain a little (a 0 stays 0, so Basic stays gentle)
  var STYLES = {
    bruiser:   { name: 'Bruiser',   icon: '💪', col: '#FF4D6D', mod: { grab: 1.8, aggr: 1.12, chain: 1 }, pref: 'bonk' },
    speedy:    { name: 'Speedy',    icon: '⚡', col: '#FFC845', mod: { dash: 1.9, react: 0.85, fly: 1.5 }, pref: 'boop' },
    trickster: { name: 'Trickster', icon: '🌀', col: '#9B5DE5', mod: { dodge: 2.2, tech: 1.6, read: 1.1 } },
    wall:      { name: 'Wall',      icon: '🧱', col: '#9AA5B1', mod: { block: 1.45, brk: 1.6, aggr: 0.85 } },
    juggler:   { name: 'Juggler',   icon: '🚀', col: '#3D8BFD', mod: { anti: 1.4, aggr: 1.05 }, pref: 'upper' },
    showoff:   { name: 'Show-off',  icon: '🌟', col: '#F4B400', mod: { powerUse: 1.6, fly: 2.2 } }
  };
  var STYLE_KEYS = Object.keys(STYLES);
  function styled(L, st) {
    var S = STYLES[st]; if (!S) return L;
    var o = {}; for (var k in L) o[k] = L[k];
    for (var m in S.mod) { var v = L[m]; if (typeof v !== 'number') continue;
      if (m === 'chain' || m === 'jug') o[m] = Math.min(m === 'jug' ? JUGGLE_MAX : 6, Math.round(v * S.mod[m] + (S.mod[m] >= 1 && v > 0 ? 0.4 : 0)));
      else if (m === 'react') o[m] = v * S.mod[m];
      else o[m] = v === 0 ? 0 : Math.min(0.95, v * S.mod[m]); }
    if (S.pref && L.moves) { o.moves = L.moves.slice(); if (L.moves.indexOf(S.pref) >= 0) { o.moves.push(S.pref, S.pref); } }
    return o;
  }
  var MOVE_KEYS = Object.keys(MOVES);

  // 🤖 robot per level: react = seconds between thoughts · aggr = attack chance in range · block = chance to guard a seen attack
  // read = picks the right guard (stand / sit) · dodge · anti = uppercut a jumper · chain = longest combo · jug = most air bounces it goes for
  var LEVELS = [
    { name: 'Basic', team: 1, tagCd: 10, dash: 0, grab: 0, brk: 0, tech: 0, fly: 0,        react: 0.6,  aggr: 0.35, block: 0.08, read: 0.3,  dodge: 0,    anti: 0,    chain: 1, jug: 0, powerUse: 0,   speed: 0.7,  dmgK: 0.6,  meHp: 100, botHp: 70,  rounds: 1, time: 75, moves: ['boop', 'bonk'] },
    { name: 'Junior', team: 1, tagCd: 10, dash: 0.25, grab: 0, brk: 0, tech: 0, fly: 0,       react: 0.46, aggr: 0.45, block: 0.22, read: 0.4,  dodge: 0.04, anti: 0.1,  chain: 2, jug: 2, powerUse: 0.3, speed: 0.8,  dmgK: 0.75, meHp: 100, botHp: 85,  rounds: 2, time: 60, moves: ['boop', 'bonk', 'jboop'] },
    { name: 'Intermediate', team: 1, tagCd: 10, dash: 0.35, grab: 0.12, brk: 0, tech: 0.1, fly: 0, react: 0.34, aggr: 0.55, block: 0.38, read: 0.5,  dodge: 0.1,  anti: 0.25, chain: 3, jug: 2, powerUse: 0.6, speed: 0.9,  dmgK: 0.9,  meHp: 100, botHp: 100, rounds: 2, time: 60, moves: ['boop', 'bonk', 'jboop', 'jbonk', 'upper'] },
    { name: 'Hard', team: 2, tagCd: 10, dash: 0.45, grab: 0.16, brk: 0.5, tech: 0.25, fly: 0.08,         react: 0.25, aggr: 0.6,  block: 0.52, read: 0.66, dodge: 0.16, anti: 0.45, chain: 4, jug: 3, powerUse: 0.8, speed: 1.0,  dmgK: 1.0,  meHp: 100, botHp: 110, rounds: 2, time: 80, moves: ['boop', 'bonk', 'lowboop', 'lowbonk', 'upper', 'jboop', 'jbonk'] },
    { name: 'Extreme', team: 3, tagCd: 10, dash: 0.5, grab: 0.2, brk: 0.7, tech: 0.5, fly: 0.12,      react: 0.17, aggr: 0.68, block: 0.66, read: 0.8,  dodge: 0.24, anti: 0.62, chain: 5, jug: 5, powerUse: 1,   speed: 1.1,  dmgK: 1.1,  meHp: 100, botHp: 120, rounds: 2, time: 95, moves: ['boop', 'bonk', 'lowboop', 'lowbonk', 'upper', 'jboop', 'jbonk'] },
    { name: 'Hardcore', team: 3, tagCd: 15, dash: 0.55, grab: 0.22, brk: 0.8, tech: 0.65, fly: 0.15,     react: 0.13, aggr: 0.74, block: 0.74, read: 0.86, dodge: 0.3,  anti: 0.72, chain: 5, jug: 5, powerUse: 1,   speed: 1.15, dmgK: 1.2,  meHp: 50,  botHp: 92, rounds: 1, time: 95, moves: ['boop', 'bonk', 'lowboop', 'lowbonk', 'upper', 'jboop', 'jbonk'], hardcore: true }
  ];

  function mkRng(seed) { var s = (seed >>> 0) || 1; var f = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; for (var w = 0; w < 6; w++) f(); return f; }   // warm-up: small seeds start with tiny numbers
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function newFighter(o, i, hp) {
    return { i: i, name: o.name, human: !!o.human, robot: !o.human, auto: !!o.auto, av: o.av || null, side: i,
      x: i === 0 ? -2.4 : 2.4, y: 0, vx: 0, vy: 0, kbx: 0, face: i === 0 ? 1 : -1,
      hp: hp, maxHp: hp, power: 0, ctrl: { l: false, r: false, d: false, g: false, b: false }, buf: {}, ctr: null, cblk: 0, blkTap: 0, blkAt: -9, lastTap: null, dash: null, grab: null, held: null, open: 0, dizzy: 0, blockHeat: 0,
      act: null, stun: 0, bstun: 0, down: 0, safe: 0, launched: false, jug: 0, dodge: null, dodgeCd: 0, ko: false,
      combo: 0, guard: '', walkT: 0, land: 0, hitFlash: 0, cheer: 0, sad: 0, actId: 0, lastHitBy: -1, groundCombo: 0,
      ai: { t: 0.3, seenAct: -1, guardUntil: 0, guardLow: false, chain: 0, wantJump: 0, plan: '', releaseG: 0, dashAtk: '', techAt: 0 } };
  }

  function newMatch(opts) {
    var L = LEVELS[opts.level || 0], duo = opts.mode === 'duo';
    var hp0 = duo ? 100 : L.meHp, hp1 = duo ? 100 : L.botHp;
    // 🔁 tag teams: each side has a roster; M.f[side] is whoever is in the ring
    var T = opts.teams;
    if (!T) { var n = duo ? (opts.teamSize || 1) : L.team; T = [0, 1].map(function (s) { var o = opts.players[s], list = [o]; for (var j = 1; j < n; j++) list.push({ name: (o.name || 'Buddy') + ' ' + (j + 1), human: o.human, auto: o.auto }); return list; }); }
    var tk = [T[0].length, T[1].length].map(function (n) { return n >= 3 ? 0.6 : n === 2 ? 0.7 : 1; });   // a team shares out its hearts (whole team ≈ 1.4–1.8 × one buddy)
    var sq = [T[0].map(function (o, j) { var f = newFighter(o, 0, Math.round(hp0 * tk[0])); f.slot = j; return f; }), T[1].map(function (o, j) { var f = newFighter(o, 1, Math.round(hp1 * tk[1])); f.slot = j; return f; })];
    sq.forEach(function (tm) { tm.forEach(function (f, j) { var o = T[f.i][j]; if (!f.human) f.style = o.style && STYLES[o.style] ? o.style : null; }); });
    var M = { level: opts.level || 0, lv: L, duo: duo, rng: mkRng(opts.seed || 7), t: 0, ev: [], sq: sq, tagCd: [0, 0], swapT: [0, 0],
      f: [sq[0][0], sq[1][0]],
      round: 1, wins: [0, 0], need: duo ? 2 : L.rounds, state: 'intro', stateT: 1.2, clock: L.time, roundsPlayed: 0, winner: -1, done: false,
      stats: [mkStats(), mkStats()], roundHurt: [0, 0] };
    M.sq.forEach(function (tm) { tm.forEach(function (f) { if (!f.human && !f.style) f.style = STYLE_KEYS[Math.floor(M.rng() * STYLE_KEYS.length)]; }); });   // 🤖 random style per bot
    return M;
  }
  function mkStats() { return { dmg: 0, hits: 0, bestCombo: 0, comboPts: 0, powers: 0, uppers: 0, juggle: 0, sky: 0, perfects: 0, blocks: 0, dodges: 0, rounds: 0, grabs: 0, breaks: 0, techs: 0, dashes: 0, flys: 0, tags: 0, counters: 0 }; }

  function resetRound(M) {
    M.f = [M.sq[0][0], M.sq[1][0]]; M.tagCd = [0, 0]; M.swapT = [0, 0];
    M.sq[0].concat(M.sq[1]).forEach(function (p) { p.hp = p.maxHp; p.ko = false; p.restCap = p.maxHp; p.tags = 0; });
    M.f.forEach(function (p, i) {
      p.x = i === 0 ? -2.4 : 2.4; p.y = 0; p.vx = p.vy = p.kbx = 0; p.face = i === 0 ? 1 : -1; p.hp = p.maxHp;
      p.act = null; p.stun = p.bstun = p.down = p.safe = 0; p.launched = false; p.jug = 0; p.dodge = null; p.ko = false; p.combo = 0; p.buf = {}; p.groundCombo = 0;
      p.dash = p.grab = p.held = p.lastTap = null; p.open = p.dizzy = p.blockHeat = 0; p.ctrl.g = false; p.ctrl.b = false; p.ctr = null; p.cblk = 0; p.blkTap = 0;
      p.cheer = p.sad = 0;
    });
    M.state = 'intro'; M.stateT = 1.2; M.clock = M.lv.time; M.roundHurt = [0, 0];
    M.ev.push({ k: 'round', n: M.round });
  }

  // ---------- input ----------
  function press(M, i, a) { var p = M.f[i]; if (!p) return; p.buf[a] = BUF; }
  function setCtrl(M, i, l, r, d) {
    var p = M.f[i]; if (!p) return;
    if (l && !p.ctrl.l) tap(M, p, -1); if (r && !p.ctrl.r) tap(M, p, 1);
    p.ctrl.l = !!l; p.ctrl.r = !!r; p.ctrl.d = !!d;
  }
  // → → = dash, ← ← = dash back (directions are on screen; forward = toward the other buddy)
  function tap(M, p, dir) {
    if (p.lastTap && p.lastTap.d === dir && M.t - p.lastTap.t < TAP2) { p.buf[dir === p.face ? 'dash' : 'bdash'] = BUF; p.lastTap = null; }
    else p.lastTap = { d: dir, t: M.t };
  }
  function setHold(M, i, on) { var p = M.f[i]; if (p) p.ctrl.g = !!on; }
  // 🛡️ hold both hit buttons (or the 🛡️ button) = block where you stand (duck too = sitting block)
  function setBlock(M, i, on) { var p = M.f[i]; if (!p) return; if (on && !p.ctrl.b) p.blkAt = M.t; p.ctrl.b = !!on; }
  function blockHeld(p) { return p.ctrl.b || p.blkTap > 0; }
  function opp(M, p) { return M.f[1 - p.i]; }
  function onGround(p) { return p.y <= 0.0001 && p.vy <= 0; }
  function canAct(p) { return !p.act && p.stun <= 0 && p.bstun <= 0 && p.down <= 0 && !p.launched && !p.dodge && !p.ko && !p.grab && !p.held; }
  function backHeld(p) { return p.face > 0 ? p.ctrl.l : p.ctrl.r; }
  function fwdHeld(p) { return p.face > 0 ? p.ctrl.r : p.ctrl.l; }
  function ducking(p) { return onGround(p) && p.ctrl.d && !p.launched && p.down <= 0 && !p.dodge && (!p.act || (MOVES[p.act.k].duck)); }
  // auto block: walking back = standing block · ducking + back = sitting block
  function guardOf(p) {
    if (!onGround(p) || p.launched || p.down > 0 || p.dodge || p.ko || p.stun > 0 || p.dash || p.grab || p.held) return '';
    if (p.act) return '';
    if (blockHeld(p)) return p.ctrl.d ? 'low' : 'high';
    if (!backHeld(p)) return '';
    return p.ctrl.d ? 'low' : 'high';
  }
  function hurtTop(p) { return p.launched ? AIR_H : ducking(p) ? DUCK_H : STAND_H; }

  function startMove(M, p, k) {
    var m = MOVES[k];
    if (m.needs && p.power < 100) { M.ev.push({ k: 'nopower', p: p.i }); return false; }
    if (m.needs) { p.power = 0; M.ev.push({ k: 'powerUse', p: p.i, move: k }); }
    p.actId++; p.act = { k: k, t: 0, hit: false, id: p.actId, n: 0 };
    if (!m.air && !m.keep) p.vx = 0;
    if (m.hop) { p.vx = p.face * m.hop[0]; p.vy = m.hop[1]; if (p.y < 0.01) p.y = 0.01; }
    if (p.dash && !m.keep) p.dash = null;
    M.ev.push({ k: 'swing', p: p.i, move: k });
    return true;
  }

  function useBuffers(M, p) {
    var b = p.buf, air = !onGround(p), team = M.sq[p.i].length > 1;
    if (team && (b.tag > 0 || (b.dodge > 0 && b.bonk > 0))) {
      b.tag = 0; if (b.dodge > 0 && b.bonk > 0) b.dodge = b.bonk = 0;
      if (canTag(M, p)) { doTag(M, p); return; }
      M.ev.push({ k: 'notag', p: p.i, cd: M.tagCd[p.i] });
    }
    if (team && b.dodge > 0 && p.human && !p.auto && b.dodge > BUF - CHORD) { /* wait: G may still join for a tag */ }
    else if (b.dodge > 0 && !air && p.dodgeCd <= 0) {
      b.dodge = 0; var dir = fwdHeld(p) ? 1 : -1; p.dash = null;
      p.dodge = { t: 0, dir: dir }; p.dodgeCd = 1.0; M.stats[p.i].dodges++; M.ev.push({ k: 'dodge', p: p.i, dir: dir }); return;
    }
    // 🤼 two attack buttons together (F+G / G+H / F+H) = grapple
    if (b.boop > 0 && b.bonk > 0 && !(b.power > 0) && !air) { b.boop = b.bonk = 0; p.blkTap = 0.35; p.blkAt = M.t; p.dash = null; return; }   // 🛡️
    var nb = (b.boop > 0 ? 1 : 0) + (b.bonk > 0 ? 1 : 0) + (b.power > 0 ? 1 : 0);
    if ((b.grab > 0 || nb >= 2) && !air) { b.grab = b.boop = b.bonk = b.power = 0; p.dash = null; startMove(M, p, 'grab'); return; }
    var atk = b.boop > 0 ? 'boop' : b.bonk > 0 ? 'bonk' : b.power > 0 ? 'power' : '';
    // a single press waits a moment (CHORD) so a second button can still join it for a grapple
    if (atk && p.human && !p.auto && b[atk] > BUF - CHORD) atk = '';
    if (atk) {
      b[atk] = 0;
      var k;
      if (p.dash && p.dash.dir > 0) { k = atk === 'boop' ? 'dboop' : atk === 'bonk' ? 'dbonk' : 'fly'; M.stats[p.i].dashes++; if (k === 'fly') M.stats[p.i].flys++; }
      else if (air) k = atk === 'boop' ? 'jboop' : atk === 'bonk' ? 'jbonk' : 'jpower';
      else if (p.ctrl.d) k = atk === 'boop' ? 'lowboop' : atk === 'bonk' ? 'lowbonk' : 'upper';
      else k = atk;
      startMove(M, p, k); return;
    }
    if (!air && !p.dash && (b.dash > 0 || b.bdash > 0)) {
      var fwd = b.dash > 0; b.dash = b.bdash = 0;
      p.dash = { t: 0, dir: fwd ? 1 : -1 };
      if (!fwd) { p.vy = 3.2; p.y = 0.01; }
      M.ev.push({ k: fwd ? 'dash' : 'bdash', p: p.i, x: p.x }); return;
    }
    if (b.jump > 0 && !air && !p.dash) {
      b.jump = 0; p.vy = JUMP_V * (p.robot ? Math.min(1.05, 0.9 + M.lv.speed * 0.1) : 1);
      var dx = (p.ctrl.r ? 1 : 0) - (p.ctrl.l ? 1 : 0); p.vx = dx * WALK * 0.95;
      M.ev.push({ k: 'jump', p: p.i });
    }
  }

  // ---------- 🔁 tag teams ----------
  function nextMate(M, p) { var L = M.sq[p.i]; for (var j = 1; j < L.length; j++) { var q = L[(p.slot + j) % L.length]; if (q !== p && !q.ko && q.hp > 0) return q; } return null; }
  function canTag(M, p) { return M.sq[p.i].length > 1 && M.tagCd[p.i] <= 0 && M.swapT[p.i] <= 0 && !!nextMate(M, p) && onGround(p) && M.state === 'fight'; }
  function freshIn(q, p) {
    q.act = null; q.stun = q.bstun = q.down = 0; q.launched = false; q.jug = 0; q.dodge = q.dash = q.grab = q.held = null; q.open = q.dizzy = 0; q.buf = {}; q.lastTap = null;
    q.ctrl = { l: false, r: false, d: false, g: false }; q.vx = q.vy = q.kbx = 0; q.face = p.face; q.y = 0; q.combo = 0;
  }
  // T+G: a resting buddy flies in with a boop + bonk; the tired one rests (heals back up to half of what they lost)
  function doTag(M, p) {
    var q = nextMate(M, p); if (!q) return false;
    p.restCap = Math.min(p.maxHp, p.hp + (p.maxHp - p.hp) * 0.5); p.act = p.dash = null; p.vx = p.kbx = 0;
    freshIn(q, p); q.x = clamp(p.x - p.face * 1.3, -ARENA, ARENA); q.y = 0.05;
    M.f[p.i] = q; M.tagCd[p.i] = M.duo ? 10 : M.lv.tagCd; M.stats[p.i].tags = (M.stats[p.i].tags || 0) + 1;
    M.ev.push({ k: 'tag', p: p.i, from: p.name, to: q.name, slot: q.slot, x: q.x });
    startMove(M, q, 'fly'); return true;
  }
  function bringIn(M, side) {
    var p = M.f[side], q = nextMate(M, p); if (!q) return;
    freshIn(q, p); q.x = clamp(p.x - p.face * 1.0, -ARENA, ARENA); q.face = side === 0 ? 1 : -1; q.safe = 0.9; q.vy = 5; q.y = 0.05;
    M.f[side] = q; M.ev.push({ k: 'tagin', p: side, to: q.name, slot: q.slot, x: q.x });
  }

  // ---------- 🤼 grapples ----------
  function startGrapple(M, a, t) {
    var k = GRAB_KEYS[Math.floor(M.rng() * GRAB_KEYS.length)], G = GRABS[k];
    a.act = null; a.vx = a.kbx = 0; t.act = null; t.dash = null; t.vx = t.kbx = 0; t.stun = 0; t.bstun = 0;
    a.grab = { k: k, t: 0, v: t.i, dur: G.dur, imp: G.imp, done: false };
    t.held = { by: a.i, t: 0, k: k };
    t.ai.techAt = 0;
    if (t.robot || t.auto) { var lv = t.brain != null ? LEVELS[t.brain] : M.duo ? LEVELS[3] : M.lv; if (M.rng() < lv.tech) t.ai.techAt = 0.1 + M.rng() * 0.16; }
    M.stats[a.i].grabs++;
    M.ev.push({ k: 'grab', p: a.i, to: t.i, type: k, name: G.name, icon: G.icon, x: t.x, y: 1.2 });
    return 'grab';
  }
  function grappleStep(M, a, dt) {
    var g = a.grab, t = M.f[g.v], G = GRABS[g.k];
    g.t += dt;
    if (!g.done) {
      t.x = clamp(a.x + a.face * 0.62, -ARENA, ARENA); t.y = 0; t.vy = 0; t.face = -a.face;
      if (g.t >= g.imp) {
        g.done = true; t.held = null;
        var dk = a.robot && !M.duo ? M.lv.dmgK : 1, dmg = Math.max(1, Math.round(G.dmg * dk));
        if (G.land === 'behind') t.x = clamp(a.x - a.face * 0.8, -ARENA, ARENA);
        else t.x = clamp(a.x + a.face * 0.78, -ARENA, ARENA);
        t.lastHitBy = a.i; a.combo = 1;
        if (G.land === 'up') { t.launched = true; t.jug = JUGGLE_MAX - 2; t.vy = 10.5; t.y = 0.3; t.kbx = a.face * 1.2; }
        else if (G.land === 'toss') { t.launched = true; t.jug = JUGGLE_MAX; t.vy = 4.5; t.y = 0.4; t.kbx = a.face * 7.5; }
        else { t.down = 0.85; t.kbx = a.face * (G.land === 'behind' ? -0.6 : 0.8); }
        hurt(M, t, dmg, a); M.stats[a.i].dmg += dmg; M.stats[a.i].hits++;
        a.power = Math.min(100, a.power + 14); t.power = Math.min(100, t.power + 6);
        M.ev.push({ k: 'slam', p: a.i, to: t.i, type: g.k, name: G.name, dmg: dmg, x: t.x, y: 0.2, up: G.land === 'up' || G.land === 'toss' });
      }
    }
    if (g.t >= g.dur) a.grab = null;
  }
  // ← ← in the first moment of a grab = wriggle out
  function wriggle(M, t) {
    var a = M.f[t.held.by]; if (!a || !a.grab) { t.held = null; return; }
    t.held = null; a.grab = null; a.bstun = 0.55; a.open = 0.55;
    t.safe = 0.35; t.kbx = a.face * 3.4; t.buf.bdash = 0;
    M.stats[t.i].techs++;
    M.ev.push({ k: 'tech', p: t.i, by: a.i, x: t.x, y: 1.3 });
  }

  // ---------- hits ----------
  function tryHit(M, a, m) {
    var t = opp(M, a);
    if (t.ko || t.safe > 0 || t.down > 0 || t.held || t.grab) return false;
    if (t.dodge && t.dodge.t < 0.3) return false;
    if (t.dash && t.dash.dir < 0 && t.dash.t < 0.12) return false;   // back dash slips away
    if (m.grab && (t.launched || t.y > 0.3)) return false;
    if (t.launched && t.jug >= JUGGLE_MAX) return false;    // 5 bounces — falls safely
    var d = (t.x - a.x) * a.face;
    if (d < m.reach[0] - 0.3 || d > m.reach[1] + 0.32) return false;
    var a0 = a.y + m.h[0], a1 = a.y + m.h[1], t0 = t.y, t1 = t.y + hurtTop(t);
    if (!(a1 > t0 + 0.001 && a0 < t1 - 0.001)) return false;
    if (m.grab) return startGrapple(M, a, t);
    // block?
    var g = guardOf(t), blocked = false, cn = a.act.ctrN || 0;
    if (g === 'high' && (m.lvl === 'high' || m.lvl === 'mid' || m.lvl === 'over')) blocked = true;
    if (g === 'low' && (m.lvl === 'low' || m.lvl === 'mid')) blocked = true;
    if (m.counter && blocked && !(blockHeld(t) && M.t - t.blkAt < CB_W * Math.pow(0.9, cn))) blocked = false;   // ⚡ a counter only stops on a well-timed 🛡️
    var S = M.stats[a.i], dk = a.robot && !M.duo ? M.lv.dmgK : 1;
    var S0 = M.stats[a.i];
    if (blocked && m.breaker) {   // 🔨 guard breaker smashes the block: dizzy and open
      var bd = Math.max(1, Math.round(8 * dk)); hurt(M, t, bd, a);
      t.stun = 1.0; t.dizzy = 1.0; t.kbx = a.face * 1.6; t.bstun = 0; t.blockHeat = 0;
      S0.breaks++; S0.hits++; S0.dmg += bd; a.power = Math.min(100, a.power + 10);
      M.ev.push({ k: 'gbreak', p: a.i, to: t.i, x: t.x, y: t.y + 1.2 });
      return 'hit';
    }
    if (blocked) {
      t.blockHeat = Math.min(4, t.blockHeat + 1);
      var chip = Math.round(m.dmg * (m.chip || 0) * dk);
      if (chip) hurt(M, t, chip, a);
      t.bstun = 0.16 + m.stun * 0.35; t.kbx = a.face * m.kb * 0.6; a.power = Math.min(100, a.power + 2); t.power = Math.min(100, t.power + 3);
      M.stats[t.i].blocks++; M.ev.push({ k: 'block', p: t.i, by: a.i, move: a.act.k, x: t.x, y: t.y + 1.1, low: g === 'low', n: cn, timed: !!m.counter });
      t.ctr = { t: CTR_W * Math.pow(0.85, cn) + (m.counter ? 0.08 : 0), n: m.counter ? cn + 1 : cn }; a.cblk = 0.7;   // ⚡ blocker may counter · attacker may still block that counter
      if (m.open) { a.act = null; a.bstun = m.open; a.open = m.open; a.vx *= 0.3; M.ev.push({ k: 'open', p: a.i, x: a.x, y: a.y + 1.4 }); }   // 🚀 blocked = guard wide open
      return 'block';
    }
    if (m.counter) { M.stats[a.i].counters = (M.stats[a.i].counters || 0) + 1; M.ev.push({ k: 'counter', p: a.i, to: t.i, n: cn + 1, x: t.x, y: t.y + 1.6 }); }
    var wasAir = t.y > 0.05 || t.launched, inCombo = t.stun > 0 || t.launched;
    a.combo = inCombo && t.lastHitBy === a.i ? a.combo + 1 : 1; t.lastHitBy = a.i;
    var scale = Math.max(0.45, 1 - 0.07 * Math.max(0, a.combo - 1)) * (wasAir ? Math.pow(0.88, t.jug) : 1);
    var dmg = Math.max(1, Math.round(m.dmg * scale * dk * (m.counter ? 1 + 0.15 * cn : 1)));
    t.act = null; t.dodge = null;
    hurt(M, t, dmg, a);
    a.power = Math.min(100, a.power + m.pw); t.power = Math.min(100, t.power + 4);
    S.hits++; S.dmg += dmg; if (a.combo > S.bestCombo) S.bestCombo = a.combo;
    if (a.act.k === 'upper') S.uppers++;
    if (m.needs) S.powers++;
    t.kbx = a.face * m.kb; t.hitFlash = 0.18;
    var ev = { k: 'hit', p: a.i, to: t.i, move: a.act.k, lvl: m.lvl, kb: m.kb, dmg: dmg, combo: a.combo, x: t.x, y: t.y + (ducking(t) ? 0.6 : 1.1), air: wasAir };
    if (wasAir || m.launch) {
      if (!t.launched) { t.launched = true; t.jug = m.launch ? 0 : 1; } else t.jug++;
      t.vy = m.spike ? -7 : m.launch ? m.launch : Math.max(t.vy, 5.4 - 0.25 * t.jug);
      if (t.y < 0.02) t.y = 0.02;
      t.stun = 0; ev.jug = t.jug; if (t.jug > S.juggle) S.juggle = t.jug;
      if (t.jug >= JUGGLE_MAX) { S.sky++; M.ev.push({ k: 'sky', p: a.i, x: t.x, y: t.y + 1 }); }
      if (m.spike && t.launched) t.kbx *= 0.5;
    } else if (m.trip || m.knock) {
      t.down = m.trip ? 0.55 : 0.75; t.stun = 0; t.kbx = a.face * m.kb * (m.knock ? 1 : 0.4);
      ev.down = true;
    } else {
      t.stun = m.stun;
      t.groundCombo = inCombo ? t.groundCombo + 1 : 1;
      if (t.groundCombo >= GROUND_COMBO_CAP) { t.stun = 0; t.safe = 0.7; t.groundCombo = 0; M.ev.push({ k: 'escape', p: t.i }); }
    }
    M.ev.push(ev);
    if (a.combo >= 3) { S.comboPts += a.combo * 40; M.ev.push({ k: 'combo', p: a.i, n: a.combo, x: t.x, y: t.y + 1.8 }); }
    return 'hit';
  }
  function hurt(M, t, dmg, a) {
    t.hp = Math.max(0, t.hp - dmg); M.roundHurt[t.i] += dmg;
    if (t.hp <= 0 && !t.ko) {
      t.ko = true; t.launched = t.y > 0.05; t.down = 9; t.act = null; t.held = null; t.grab = null; t.dash = null; t.kbx = (a ? a.face : -t.face) * 4; if (t.y < 0.05) t.vy = 4;
      if (nextMate(M, t)) { M.swapT[t.i] = 1.1; M.ev.push({ k: 'out', p: t.i, name: t.name, by: a ? a.i : -1, x: t.x, y: t.y + 1 }); return; }
      M.state = 'ko'; M.stateT = 2.0;
      M.ev.push({ k: 'ko', p: t.i, by: a ? a.i : -1, x: t.x, y: t.y + 1 });
    }
  }

  // ---------- 🤖 robot ----------
  function think(M, p, dt) {
    var L = M.lv, A = p.ai, o = opp(M, p), R = M.rng;
    var lvl = p.brain != null ? LEVELS[p.brain] : M.duo ? LEVELS[3] : L;   // brain: tests give the stand-in player one fixed kid-level brain
    if (p.style) { if (A.styBase !== lvl) { A.sty = styled(lvl, p.style); A.styBase = lvl; } lvl = A.sty; }   // 🤖 style leans the brain
    var dx = o.x - p.x, dist = Math.abs(dx), toward = dx > 0 ? 'r' : 'l', away = dx > 0 ? 'l' : 'r';
    A.t -= dt;
    if (A.releaseG && M.t >= A.releaseG) { p.ctrl.g = false; A.releaseG = 0; }
    if (A.releaseB && M.t >= A.releaseB) { p.ctrl.b = false; A.releaseB = 0; }
    if (p.grab || p.held) return;
    if (p.ctr && A.ctrSeen !== p.ctr) { A.ctrSeen = p.ctr; A.ctrAt = M.t + 0.06 + (1 - lvl.read) * 0.25; A.ctrGo = R() < 0.15 + lvl.chain * 0.14; }
    if (p.ctr && A.ctrGo && M.t >= A.ctrAt) { A.ctrGo = false; press(M, p.i, R() < 0.5 ? 'boop' : 'bonk'); return; }
    if (o.act && MOVES[o.act.k].counter && A.cSeen !== o.act.id && p.cblk > 0) { A.cSeen = o.act.id; if (R() < lvl.block * 0.75) { setBlock(M, p.i, true); A.releaseB = M.t + 0.35; return; } }
    // 🔁 tired: tag a fresher buddy in
    if (canTag(M, p) && canAct(p) && p.hp < p.maxHp * 0.38) { var q = nextMate(M, p); if (q && q.hp > p.hp * 1.4 && R() < 0.6 * dt * 8) { press(M, p.i, 'tag'); return; } }
    // 💨 dashing in: attack once close
    if (p.dash && p.dash.dir > 0 && !p.act && dist < 1.5 && A.dashAtk) { press(M, p.i, A.dashAtk); A.dashAtk = ''; return; }
    // 🔨 a buddy charging a guard breaker: poke them before it comes out (smart robots), else get away
    if (o.act && o.act.k === 'charge' && o.act.id !== A.seenAct && canAct(p) && dist < 2) {
      A.seenAct = o.act.id;
      if (R() < lvl.read * 0.8) { press(M, p.i, dist < 1.2 ? 'boop' : 'dash'); A.dashAtk = 'boop'; return; }
      if (R() < lvl.dash) { press(M, p.i, 'bdash'); return; }
    }
    // guard against an attack I saw (once per attack)
    if (o.act && o.act.id !== A.seenAct && canAct(p) && onGround(p) && dist < 2.4) {
      A.seenAct = o.act.id; var m = MOVES[o.act.k];
      if (R() < lvl.dodge * (m.needs ? 2 : 1)) { press(M, p.i, 'dodge'); p.ctrl.l = away === 'l'; p.ctrl.r = away === 'r'; p.ctrl.d = false; return; }
      if (R() < lvl.block) {
        var low = m.lvl === 'low', right = R() < lvl.read;
        A.guardLow = right ? low : !low; if (m.lvl === 'mid') A.guardLow = R() < 0.5;
        A.guardUntil = M.t + m.st + m.ac + 0.12;
      }
    }
    if (M.t < A.guardUntil && !p.act) { p.ctrl.l = away === 'l'; p.ctrl.r = away === 'r'; p.ctrl.d = A.guardLow; return; }
    if (A.wantJump > 0) { A.wantJump -= dt; if (A.wantJump <= 0 && !onGround(p) && !p.act) press(M, p.i, A.jumpAtk || 'boop'); }
    // a flying buddy the robot may not juggle (Basic never, Junior / Intermediate ≤ 2 bounces): wait for them to land
    if (o.launched && o.jug >= lvl.jug) { p.ctrl.l = p.ctrl.r = p.ctrl.d = false; return; }
    // juggle a launched buddy
    if (o.launched && o.jug < lvl.jug && !o.ko && (canAct(p) || (!onGround(p) && !p.act))) {
      p.ctrl.d = false; p.ctrl.l = dist > 0.9 && toward === 'l'; p.ctrl.r = dist > 0.9 && toward === 'r';
      if (dist < 1.5) {
        if (o.y > 1.0 && onGround(p)) { press(M, p.i, 'jump'); A.wantJump = 0.1; A.jumpAtk = 'boop'; }
        else if (!onGround(p)) press(M, p.i, 'boop');
        else press(M, p.i, o.y < 0.6 && o.jug < lvl.jug - 1 ? 'bonk' : 'boop');
      }
      return;
    }
    // anti-air: uppercut a jumping buddy
    if (!o.launched && o.y > 0.4 && o.vy < 2 && dist < 1.5 && canAct(p) && onGround(p) && R() < lvl.anti * dt * 12) {
      p.ctrl.d = true; p.ctrl.l = p.ctrl.r = false; press(M, p.i, 'power'); return;
    }
    // keep a combo going
    if (A.chain > 0 && canAct(p) && dist < 1.4 && (o.stun > 0 || o.bstun > 0)) {
      A.chain--; var nk = A.chain === 0 && lvl.moves.indexOf('upper') >= 0 && R() < 0.5 ? 'upper' : R() < 0.6 ? 'boop' : 'bonk';
      p.ctrl.d = nk === 'upper'; press(M, p.i, nk === 'upper' ? 'power' : nk); return;
    }
    if (A.t > 0) return;
    A.t = lvl.react * (0.7 + R() * 0.6) / lvl.speed;
    if (!canAct(p)) return;
    p.ctrl.d = false;
    // power push when the bar is full
    if (p.power >= 100 && dist < 1.7 && R() < lvl.powerUse) { p.ctrl.l = p.ctrl.r = false; press(M, p.i, 'power'); return; }
    // 🔨 the buddy keeps blocking: guard breaker
    if (o.blockHeat >= 0.9 && dist < 1.4 && R() < lvl.brk) { p.ctrl.l = p.ctrl.r = p.ctrl.d = false; p.ctrl.g = true; press(M, p.i, 'bonk'); A.releaseG = M.t + 0.5 + R() * 0.2; return; }
    // 🤼 grapple when very close
    if (dist < 0.95 && R() < lvl.grab && !o.launched && o.down <= 0) { p.ctrl.l = p.ctrl.r = p.ctrl.d = false; press(M, p.i, 'grab'); return; }
    if (dist < 1.35) {
      if (R() < lvl.aggr) {
        var mv = lvl.moves[Math.floor(R() * lvl.moves.length)];
        A.chain = Math.max(0, Math.floor(R() * lvl.chain));
        p.ctrl.l = p.ctrl.r = false;
        if (mv === 'jboop' || mv === 'jbonk') { if (dist > 0.8) { p.ctrl[toward] = true; press(M, p.i, 'jump'); A.wantJump = 0.18; A.jumpAtk = mv === 'jboop' ? 'boop' : 'bonk'; } else press(M, p.i, 'boop'); return; }
        if (mv === 'lowboop' || mv === 'lowbonk' || mv === 'upper') { p.ctrl.d = true; press(M, p.i, mv === 'lowboop' ? 'boop' : mv === 'lowbonk' ? 'bonk' : 'power'); return; }
        press(M, p.i, mv); return;
      }
      // back off a little or stand
      var r = R(); p.ctrl.l = r < 0.3 && away === 'l'; p.ctrl.r = r < 0.3 && away === 'r'; return;
    }
    // walk in (sometimes 💨 dash in, sometimes jump in on Junior+)
    p.ctrl.l = toward === 'l'; p.ctrl.r = toward === 'r';
    if (dist > 2.1 && dist < 4.5 && R() < lvl.dash * 0.5) { press(M, p.i, 'dash'); var rr = R(); A.dashAtk = rr < lvl.fly ? 'power' : rr < 0.6 ? 'boop' : 'bonk'; return; }
    if (dist < 3 && dist > 1.7 && lvl.moves.indexOf('jbonk') >= 0 && R() < 0.12) { press(M, p.i, 'jump'); A.wantJump = 0.32; A.jumpAtk = R() < 0.5 ? 'bonk' : 'boop'; }
  }

  // ---------- step ----------
  function stepFighter(M, p, dt) {
    var o = opp(M, p), m;
    for (var k in p.buf) { if (p.buf[k] > 0) p.buf[k] -= dt; }
    if (p.stun > 0) p.stun -= dt; if (p.bstun > 0) p.bstun -= dt; if (p.safe > 0) p.safe -= dt; if (p.dodgeCd > 0) p.dodgeCd -= dt;
    if (p.hitFlash > 0) p.hitFlash -= dt; if (p.land > 0) p.land -= dt; if (p.cheer > 0) p.cheer -= dt; if (p.sad > 0) p.sad -= dt;
    if (p.open > 0) p.open -= dt; if (p.dizzy > 0) p.dizzy -= dt; if (p.blockHeat > 0) p.blockHeat = Math.max(0, p.blockHeat - dt * 0.35);
    if (p.ctr) { p.ctr.t -= dt; if (p.ctr.t <= 0) p.ctr = null; } if (p.cblk > 0) p.cblk -= dt; if (p.blkTap > 0) p.blkTap -= dt;
    // 🤼 held in a grapple: only ← ← (wriggle) works, early on
    if (p.held) {
      p.held.t += dt; p.vx = p.kbx = 0; p.act = null;
      var wantOut = p.buf.bdash > 0 || (p.ai.techAt > 0 && p.held.t >= p.ai.techAt);
      if (wantOut && p.held.t < TECH && M.state === 'fight') wriggle(M, p);
      return;
    }
    if (p.grab) { grappleStep(M, p, dt); p.vx = p.kbx = 0; return; }
    if (p.down > 0 && onGround(p) && !p.launched) { p.down -= dt; if (p.down <= 0 && !p.ko) { p.down = 0; p.safe = 0.9; M.ev.push({ k: 'getup', p: p.i }); } }
    if (p.stun <= 0 && !p.launched && onGround(p) && p.down <= 0) { if (o.combo) o.combo = 0; p.groundCombo = 0; }
    var fight = M.state === 'fight';
    if (fight && (p.robot || p.auto) && !p.ko) think(M, p, dt);
    // act
    if (p.act) {
      m = MOVES[p.act.k]; p.act.t += dt;
      var t = p.act.t;
      // 🔨 hold G: a Big Bonk wind-up turns into a charge; let go = guard breaker (short hold = normal bonk)
      if (p.act.k === 'bonk' && t >= 0.17 && t < m.st && p.ctrl.g) { p.act = { k: 'charge', t: 0, hit: false, id: p.act.id, n: 0 }; M.ev.push({ k: 'charge', p: p.i }); m = MOVES.charge; t = 0; }
      else if (p.act.k === 'charge') {
        if (!p.ctrl.g || t >= 1.4) {
          if (t >= 0.28) { p.act = null; startMove(M, p, 'gbreak'); }
          else { p.act = { k: 'bonk', t: MOVES.bonk.st - 0.02, hit: false, id: p.act.id, n: 0 }; }
          m = MOVES[p.act.k]; t = p.act.t;
        }
      }
      if (m.lunge && t > m.st && t < m.st + m.ac) p.vx = p.face * m.lunge;
      if (m.keep && t >= m.st + m.ac) p.vx *= Math.exp(-9 * dt);
      if (m.dive && t > m.st) { p.vx = p.face * 7.5; p.vy = Math.min(p.vy, -8); }
      if (m.hits) {
        var w = m.hits[p.act.n];
        if (w && fight) {
          if (t >= w.t && t <= w.t + w.d) { var hm = {}; for (var q in m) hm[q] = m[q]; for (var q2 in w) hm[q2] = w[q2]; var r = tryHit(M, p, hm); if (r) { if (p.act) { p.act.n++; p.act.hit = true; } } }
          else if (t > w.t + w.d) p.act.n++;
        }
      } else if (!p.act.hit && t >= m.st && t <= m.st + m.ac && fight) { if (tryHit(M, p, m)) { if (p.act) p.act.hit = true; } }
      if (p.act && t >= m.st + m.ac + m.rc && p.act.k !== 'charge') { p.act = null; if (m.lunge) p.vx = 0; }
      if (p.act && m.air && onGround(p) && t > 0.02) { p.act = null; p.bstun = Math.max(p.bstun, m.dive ? 0.18 : 0.06); }   // landing ends a jump attack
      if (p.act && m.duck && !p.ctrl.d && t < m.st) p.act.k = p.act.k;   // keep the duck move once started
    }
    if (p.safe > 0 && p.act) p.safe = 0;   // getting up safe ends when you attack
    if (p.dodge) { p.dodge.t += dt; p.vx = p.dodge.dir * p.face * 6.8; if (p.dodge.t >= 0.34) { p.dodge = null; p.vx = 0; } }
    if (p.dash && !p.act) {
      p.dash.t += dt; p.vx = p.dash.dir * p.face * (p.dash.dir > 0 ? DASH_V : BDASH_V);
      if (p.dash.dir > 0 && p.dash.t >= DASH_T) { p.dash = null; p.vx = 0; }
    }
    // ⚡ counter: right after a block, boop / bonk hits straight back (even out of block stun)
    if (fight && p.ctr && (p.buf.boop > 0 || p.buf.bonk > 0) && !(p.buf.boop > 0 && p.buf.bonk > 0) && !p.launched && p.down <= 0 && p.stun <= 0 && !p.grab && !p.held && !p.ko && onGround(p)) {
      var ck = p.buf.boop > 0 ? 'cboop' : 'cbonk', cn0 = p.ctr.n; p.buf.boop = p.buf.bonk = 0; p.ctr = null; p.bstun = 0; p.act = null; p.dash = null; p.blkTap = 0;
      p.face = o.x > p.x ? 1 : -1; startMove(M, p, ck); p.act.ctrN = cn0; M.ev.push({ k: 'ctrGo', p: p.i, n: cn0 + 1 });
    }
    // 🛡️ the attacker whose move was blocked may block the counter (cut the end of the move)
    if (p.act && blockHeld(p) && p.cblk > 0 && p.act.hit && p.act.t >= MOVES[p.act.k].st + MOVES[p.act.k].ac && !MOVES[p.act.k].air) { p.act = null; p.vx = 0; }
    if (p.bstun > 0 && blockHeld(p) && p.cblk > 0) p.bstun = 0;
    if (fight && canAct(p)) {
      useBuffers(M, p);
      if (!p.act && !p.dodge && !p.dash && onGround(p) && p.vy <= 0) {
        var dx = (p.ctrl.r ? 1 : 0) - (p.ctrl.l ? 1 : 0);
        if (p.ctrl.d) dx = 0;
        var sp = dx === 0 ? 0 : (dx === p.face ? WALK : BACK) * (p.robot && !M.duo ? M.lv.speed : 1);
        p.vx = dx * sp;
      }
    } else if (fight && !onGround(p) && !p.launched && !p.act && !p.ko) {
      useBuffers(M, p);   // jump attacks: W then F / G / H
    } else if (!fight || p.stun > 0 || p.bstun > 0 || p.down > 0) { if (onGround(p) && !p.dodge && !(p.act && MOVES[p.act.k].lunge)) p.vx = 0; }
    // physics
    var wasAir = p.y > 0.0001 || p.vy > 0;
    if (wasAir) { p.vy -= GRAV * dt * (p.launched ? 0.86 : 1); p.y += p.vy * dt; }
    p.x += (p.vx + p.kbx) * dt;
    p.kbx *= Math.exp(-(onGround(p) ? 7 : 1.6) * dt);
    if (Math.abs(p.kbx) < 0.02) p.kbx = 0;
    if (p.y <= 0 && wasAir) {
      p.y = 0; p.vy = 0;
      if (p.launched) { p.launched = false; p.jug = 0; if (!p.ko) { p.down = 0.55; } M.ev.push({ k: 'land', p: p.i, hard: true, x: p.x }); p.land = 0.25; }
      else { p.land = 0.15; if (!p.act) p.vx = 0; if (p.dash && p.dash.dir < 0) p.dash = null; }
    }
    if (p.x < -ARENA) { p.x = -ARENA; if (p.kbx < 0) p.kbx = 0; }
    if (p.x > ARENA) { p.x = ARENA; if (p.kbx > 0) p.kbx = 0; }
    if (Math.abs(p.vx) > 0.2 && onGround(p)) p.walkT += dt; else p.walkT = 0;
  }

  function step(M, dt) {
    if (M.done) return;
    M.t += dt;
    var a = M.f[0], b = M.f[1];
    if (M.state === 'intro') { M.stateT -= dt; if (M.stateT <= 0) { M.state = 'fight'; M.ev.push({ k: 'fight', n: M.round }); } }
    else if (M.state === 'fight') {
      M.clock -= dt;
      for (var sd = 0; sd < 2; sd++) {
        if (M.tagCd[sd] > 0) M.tagCd[sd] = Math.max(0, M.tagCd[sd] - dt);
        if (M.swapT[sd] > 0) { M.swapT[sd] -= dt; if (M.swapT[sd] <= 0) { M.swapT[sd] = 0; bringIn(M, sd); } }
        M.sq[sd].forEach(function (q) { if (q !== M.f[sd] && !q.ko && q.hp < (q.restCap || q.maxHp)) q.hp = Math.min(q.restCap || q.maxHp, q.hp + 2 * dt); });
      }
      if (M.clock <= 0) { M.clock = 0; endRound(M, null); }
    }
    stepFighter(M, a, dt); stepFighter(M, b, dt);
    // keep the two apart on the ground (you can jump over, and roll through while dodging)
    var dx = b.x - a.x, close = Math.abs(dx) < MIN_GAP, overlapY = Math.min(a.y, b.y) < 0.9 && Math.abs(a.y - b.y) < 1.2;
    if (close && overlapY && !a.dodge && !b.dodge && !a.ko && !b.ko && !a.grab && !b.grab && !a.held && !b.held) {
      var push = (MIN_GAP - Math.abs(dx)) / 2, s = dx >= 0 ? 1 : -1;
      a.x -= push * s; b.x += push * s;
      if (a.x < -ARENA) { b.x += -ARENA - a.x; a.x = -ARENA; } if (b.x > ARENA) { a.x -= b.x - ARENA; b.x = ARENA; }
      if (a.x > ARENA) { b.x -= a.x - ARENA; a.x = ARENA; } if (b.x < -ARENA) { a.x += -ARENA - b.x; b.x = -ARENA; }
    }
    // face each other (only when free on the ground)
    [a, b].forEach(function (p) { var o = opp(M, p); if (onGround(p) && !p.act && !p.dodge && !p.dash && !p.grab && !p.held && p.stun <= 0 && !p.launched && Math.abs(o.x - p.x) > 0.05) p.face = o.x > p.x ? 1 : -1; });
    if (M.state === 'ko') {
      M.stateT -= dt;
      if (M.stateT <= 0) { var loser = a.ko ? 0 : 1; endRound(M, 1 - loser); }
    }
  }

  function endRound(M, winner) {
    if (M.state === 'over' || M.done) return;
    var a = M.f[0], b = M.f[1];
    if (winner == null) { var ra = teamHp(M, 0), rb = teamHp(M, 1); winner = Math.abs(ra - rb) < 0.005 ? -1 : ra > rb ? 0 : 1; }
    M.roundsPlayed++;
    if (winner >= 0) {
      M.wins[winner]++; M.stats[winner].rounds++;
      if (M.roundHurt[winner] === 0) { M.stats[winner].perfects++; M.ev.push({ k: 'perfect', p: winner }); }
      M.f[winner].cheer = 2; M.f[1 - winner].sad = 2;
    }
    M.ev.push({ k: 'roundEnd', winner: winner, n: M.round, timeUp: M.clock <= 0 });
    if ((winner >= 0 && M.wins[winner] >= M.need) || M.roundsPlayed >= 5) {
      M.winner = winner >= 0 && M.wins[winner] >= M.need ? winner : M.wins[0] >= M.wins[1] ? 0 : 1;
      M.state = 'over'; M.done = true; M.ev.push({ k: 'match', winner: M.winner });
      return;
    }
    M.round++; resetRound(M);
  }

  function teamHp(M, side) { var h = 0, mx = 0; M.sq[side].forEach(function (q) { h += q.ko ? 0 : q.hp; mx += q.maxHp; }); return mx ? h / mx : 0; }
  function takeEvents(M) { var e = M.ev; M.ev = []; return e; }

  function scoreFor(M, side) {
    var S = M.stats[side], won = M.winner === side;
    var hpLeft = Math.round(100 * teamHp(M, side));
    var s = S.dmg * 10 + S.comboPts + S.sky * 500 + S.perfects * 300 + S.uppers * 20 + S.powers * 60 + S.grabs * 80 + S.breaks * 60 + S.techs * 60 + (won ? 1000 + hpLeft * 5 : 0);
    return Math.round(s * (M.lv.hardcore && !M.duo ? 3 : 1));
  }
  function starsFor(M, side) { if (M.winner !== side) return 0; var r = teamHp(M, side); return r >= 0.6 ? 3 : r >= 0.3 ? 2 : 1; }

  // test helper: a whole match with both sides on autopilot (robot brains)
  function simulate(opts, maxT) {
    var M = newMatch(opts); maxT = maxT || 900; M.sq[0].concat(M.sq[1]).forEach(function (p) { if (p.human) { p.auto = true; if (opts.brain != null) p.brain = opts.brain; } });
    while (!M.done && M.t < maxT) { step(M, DT); takeEvents(M); }
    return M;
  }

  return { DT: DT, MOVES: MOVES, MOVE_KEYS: MOVE_KEYS, LEVELS: LEVELS, JUGGLE_MAX: JUGGLE_MAX, ARENA: ARENA, GRAV: GRAV, JUMP_V: JUMP_V,
    STYLES: STYLES, STYLE_KEYS: STYLE_KEYS, styled: styled, GRABS: GRABS, GRAB_KEYS: GRAB_KEYS, canTag: canTag, teamHp: teamHp, nextMate: nextMate, TECH: TECH, TAP2: TAP2, CHORD: CHORD, setHold: setHold,
    newMatch: newMatch, step: step, press: press, setCtrl: setCtrl, setBlock: setBlock, CTR_W: CTR_W, CB_W: CB_W, takeEvents: takeEvents, guardOf: guardOf, ducking: ducking, onGround: onGround,
    canAct: canAct, hurtTop: hurtTop, scoreFor: scoreFor, starsFor: starsFor, simulate: simulate, mkRng: mkRng, think: think, endRound: endRound };
})();
// ENGINE END

/* 📏 s-brawl adv#0 → BrawlBuddies_adv.html */

