
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

// ===== 🗺️ Brawenture ADV ENGINE (pure logic, no DOM) — 2.5D belt brawler: x = along the street, z = depth (0 back … ZD front), y = height =====
// ADV START
var BV = (function () {
  'use strict';
  var DT = 1 / 120, ZD = 2.4, GRAV = 22, VIEW = 11;
  var TAP2 = 0.26, CHORD = 0.06, DASH_T = 0.3, DASH_V = 8.4, DASH_CD = 1.2, CB_T = 0.42;   // round I: → → dash (1.2 s cooldown) · two buttons together = block / grapple
  function mkRng(seed) { var s = (seed >>> 0) || 1; function r() { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; } for (var i = 0; i < 6; i++) r(); return r; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sgn(v) { return v < 0 ? -1 : 1; }

  var DIFFS = {
    easy:   { name: 'Easy',     icon: '🌱', ehp: 0.7,  edmg: 0.5, aggr: 0.65, count: 0.8,  lives: -1, atk: 1, bells: 3, sort: 4, decay: 3,  code: 6, traps: 0, air: 1.0, period: 3.0, ctrW: 0.6, parry: 0, fguard: 0.3, clashN: 3, clashT: 7, hint: true, botBlk: 0.5 },
    normal: { name: 'Normal',   icon: '⭐', ehp: 1,    edmg: 1,   aggr: 1,    count: 1,    lives: 6,  atk: 2, bells: 3, sort: 6, decay: 6,  code: 6, traps: 1, air: 1.6, period: 2.5, ctrW: 0.5, parry: 0.25, fguard: 1, clashN: 4, clashT: 6.5, hint: true, botBlk: 0.45 },
    hard:   { name: 'Hard',     icon: '🔥', ehp: 1.3,  edmg: 1.4, aggr: 1.3,  count: 1.2,  lives: 4,  atk: 2, bells: 4, sort: 7, decay: 8,  code: 9, traps: 2, link: true, air: 2.2, period: 2.1, ctrW: 0.42, parry: 0.4, fguard: 1.3, clashN: 5, clashT: 6, hint: false, botBlk: 0.4 },
    skull:  { name: 'Hardcore', icon: '💀', ehp: 1.6,  edmg: 1.9, aggr: 1.6,  count: 1.35, lives: 2,  atk: 3, bells: 4, sort: 8, decay: 10, code: 9, traps: 2, link: true, air: 2.8, period: 1.8, ctrW: 0.36, parry: 0.5, fguard: 1.6, clashN: 6, clashT: 5.5, hint: false, botBlk: 0.35 }
  };
  var DIFF_KEYS = ['easy', 'normal', 'hard', 'skull'];

  // hero moves: `anim` = the Brawl Buddies move whose animation is played (same timings → same pictures)
  var HMOVES = {
    boop:   { anim: 'boop',  st: 0.07, ac: 0.07, rc: 0.12, dmg: 7,  reach: 1.05, kb: 1.2, stun: 0.38, pw: 6 },
    boop2:  { anim: 'lowboop', st: 0.07, ac: 0.07, rc: 0.12, dmg: 7, reach: 1.05, kb: 1.2, stun: 0.38, pw: 6 },
    finish: { anim: 'upper', st: 0.11, ac: 0.12, rc: 0.26, dmg: 12, reach: 1.15, kb: 3.4, knock: true, pw: 10, lift: 7 },
    bonk:   { anim: 'bonk',  st: 0.2,  ac: 0.09, rc: 0.26, dmg: 14, reach: 1.25, kb: 3.8, knock: true, pw: 10 },
    jboop:  { anim: 'jboop', st: 0.05, ac: 0.14, rc: 0.1,  dmg: 9,  reach: 1.1,  kb: 1.5, stun: 0.4, pw: 7, air: true },
    jbonk:  { anim: 'jbonk', st: 0.11, ac: 0.14, rc: 0.16, dmg: 13, reach: 1.2,  kb: 3,   knock: true, pw: 9, air: true },
    power:  { anim: 'power', st: 0.16, ac: 0.16, rc: 0.3,  dmg: 24, reach: 1.8,  kb: 6,   knock: true, pw: 0, around: true },
    toss:   { anim: 'boop',  st: 0.08, ac: 0.05, rc: 0.16, dmg: 0,  reach: 0,    pw: 0, toss: true },
    // round I: 💨 dash attacks · ⚡ counters (after a block) · 🔨 hold-bonk guard breaker · 🤼 grapple (miss = a grab at the air)
    dboop:  { anim: 'dboop', st: 0.06, ac: 0.08, rc: 0.16, dmg: 10, reach: 1.25, kb: 2.2, stun: 0.45, pw: 8, keep: true },
    dbonk:  { anim: 'dbonk', st: 0.13, ac: 0.1,  rc: 0.3,  dmg: 16, reach: 1.3,  kb: 4.2, knock: true, pw: 11, keep: true },
    cboop:  { anim: 'dboop', st: 0.04, ac: 0.08, rc: 0.2,  dmg: 12, reach: 1.5,  kb: 2.4, stun: 0.6, pw: 10, counter: true },
    cbonk:  { anim: 'dbonk', st: 0.07, ac: 0.1,  rc: 0.26, dmg: 18, reach: 1.55, kb: 4.4, knock: true, pw: 12, counter: true },
    charge: { anim: 'charge', st: 99,  ac: 0,    rc: 0,    dmg: 0,  reach: 0,    pw: 0 },
    gbreak: { anim: 'gbreak', st: 0.1, ac: 0.1,  rc: 0.3,  dmg: 14, reach: 1.35, kb: 3.6, knock: true, pw: 10, breaker: true },
    grab:   { anim: 'grab',  st: 0.07, ac: 0.08, rc: 0.38, dmg: 0,  reach: 0,    pw: 0, toss: true }
  };
  // 🤼 grapples (same six as Brawl Buddies, so the client can reuse their pictures)
  var GRABS = {
    suplex:    { name: 'Suplex', icon: '🤸', dmg: 16, imp: 0.62, dur: 0.95, land: 'behind' },
    skyslam:   { name: 'Sky Slam', icon: '🌩️', dmg: 17, imp: 0.7, dur: 1.0, land: 'front' },
    powerbomb: { name: 'Powerbomb', icon: '💣', dmg: 19, imp: 0.78, dur: 1.05, land: 'front' },
    swing:     { name: 'Giant Swing', icon: '🌀', dmg: 14, imp: 1.1, dur: 1.3, land: 'toss' },
    pancake:   { name: 'Pancake Flop', icon: '🥞', dmg: 15, imp: 0.66, dur: 1.0, land: 'front' },
    rocket:    { name: 'Rocket Toss', icon: '🚀', dmg: 12, imp: 0.5, dur: 0.8, land: 'up' }
  };
  var GRAB_KEYS = Object.keys(GRABS);
  // baddies: `atk` = their normal attack, `slow` = wind-up slowed down so kids can see it coming
  var FOES = {
    // tale 1 🛝
    rascal:    { name: 'Rascal',   hp: 30, spd: 1.6, reach: 0.95, atk: 'boop', dmg: 6, cd: 1.5, slow: 1.6, score: 100, look: 'rascal' },
    kicker:    { name: 'Kicker',   hp: 40, spd: 2.1, reach: 1.15, atk: 'bonk', dmg: 9, cd: 1.9, slow: 1.4, knock: true, score: 150, look: 'kicker' },
    splasher:  { name: 'Splasher', hp: 26, spd: 1.4, reach: 0.9,  atk: 'boop', dmg: 5, cd: 2.4, slow: 1.5, range: 5.5, keep: 3.6, shot: 'lob', proj: '🎈', pdmg: 7, score: 150, look: 'splasher' },
    brax:      { name: 'Big Brax', hp: 380, spd: 1.8, reach: 1.3, atk: 'bonk', dmg: 12, cd: 1.3, slow: 1.25, knock: true, boss: true, big: 1.3, score: 2000, look: 'brax', specials: ['charge', 'pound'], summon: ['rascal', 'rascal', 'kicker'] },
    // tale 2 🍭
    gummy:     { name: 'Gummy Grunt', hp: 32, spd: 1.7, reach: 0.95, atk: 'boop', dmg: 6, cd: 1.5, slow: 1.6, score: 100, look: 'gummy' },
    jawbreaker:{ name: 'Jawbreaker', hp: 58, spd: 1.2, reach: 1.0, atk: 'roll', dmg: 10, cd: 2.6, slow: 1.3, knock: true, big: 1.12, score: 200, look: 'jawbreaker' },
    sprinkler: { name: 'Sprinkler', hp: 26, spd: 1.5, reach: 0.9, atk: 'boop', dmg: 5, cd: 2.2, slow: 1.5, range: 5.5, keep: 3.4, shot: 'lob', proj: '🍬', pdmg: 7, score: 150, look: 'sprinkler' },
    fizz:      { name: 'Fizz', hp: 230, spd: 2.3, reach: 1.1, atk: 'boop', dmg: 9, cd: 1.0, slow: 1.2, boss: true, big: 1.15, score: 1500, look: 'fizz', specials: ['charge'], twin: true },
    fang:      { name: 'Fang', hp: 260, spd: 1.6, reach: 1.25, atk: 'bonk', dmg: 12, cd: 1.5, slow: 1.25, knock: true, boss: true, big: 1.2, score: 1500, look: 'fang', specials: ['pound'], summon: ['gummy', 'gummy'], twin: true },
    // tale 3 🏰
    guard:     { name: 'Guard', hp: 34, spd: 1.5, reach: 1.15, atk: 'boop', dmg: 6, cd: 1.8, slow: 1.5, score: 120, look: 'guard' },
    knight:    { name: 'Knight', hp: 50, spd: 1.3, reach: 1.1, atk: 'bonk', dmg: 10, cd: 2.0, slow: 1.4, knock: true, shield: true, score: 220, look: 'knight' },
    archer:    { name: 'Archer', hp: 26, spd: 1.5, reach: 0.9, atk: 'boop', dmg: 5, cd: 2.4, slow: 1.4, range: 7, keep: 4.2, shot: 'arrow', proj: '➶', pdmg: 6, score: 160, look: 'archer' },
    // tale 4 🧟 (goofy — they just want hugs)
    zombie:    { name: 'Zombie', hp: 34, spd: 1.0, reach: 0.95, atk: 'boop', dmg: 6, cd: 1.7, slow: 1.8, score: 100, look: 'zombie', undead: true },
    runner:    { name: 'Runner', hp: 22, spd: 2.4, reach: 0.9, atk: 'boop', dmg: 5, cd: 1.3, slow: 1.5, score: 120, look: 'runner', undead: true },
    bloater:   { name: 'Bloater', hp: 48, spd: 0.8, reach: 1.0, atk: 'bonk', dmg: 8, cd: 2.2, slow: 1.6, knock: true, big: 1.18, score: 180, look: 'bloater', undead: true, burst: 9 },
    mumble:    { name: 'King Mumblebones', hp: 220, spd: 1.3, reach: 1.25, atk: 'bonk', dmg: 10, cd: 1.5, slow: 1.3, knock: true, boss: true, big: 1.25, score: 2000, look: 'mumble', undead: true, specials: ['pound', 'charge'], summon: ['zombie', 'runner'], evolve: 'megamumble' },
    megamumble:{ name: 'Mega Mumblebones', hp: 260, spd: 1.4, reach: 1.2, atk: 'bonk', dmg: 11, cd: 1.8, slow: 1.3, knock: true, boss: true, big: 1.4, score: 3000, look: 'megamumble', undead: true, specials: ['pound', 'spin', 'charge'], summon: ['bloater', 'runner', 'zombie'] },
    // tale 5 👾
    blob:      { name: 'Blob', hp: 30, spd: 1.5, reach: 0.85, atk: 'boop', dmg: 5, cd: 1.5, slow: 1.6, score: 80, look: 'blob', monster: '🟢' },
    spiky:     { name: 'Spiky', hp: 46, spd: 1.8, reach: 1.0, atk: 'bonk', dmg: 8, cd: 1.8, slow: 1.4, knock: true, tough: true, score: 120, look: 'spiky', monster: '🦔' },
    flapper:   { name: 'Flapper', hp: 30, spd: 2.0, reach: 0.9, atk: 'boop', dmg: 5, cd: 2.2, slow: 1.4, range: 5, keep: 3.4, shot: 'lob', proj: '🥚', pdmg: 6, score: 120, look: 'flapper', monster: '🦇' },
    stomper:   { name: 'Stomper', hp: 95, spd: 1.0, reach: 1.25, atk: 'bonk', dmg: 11, cd: 2.4, slow: 1.4, knock: true, tough: true, big: 1.3, score: 250, look: 'stomper', monster: '🦏' },
    spikeback: { name: 'Sir Spikeback', hp: 240, spd: 1.7, reach: 1.2, atk: 'bonk', dmg: 10, cd: 1.5, slow: 1.3, knock: true, boss: true, mini: true, big: 1.3, score: 800, look: 'spikeback', monster: '🦔', specials: ['spin', 'charge'] },
    gloopula:  { name: 'Gloopula', hp: 260, spd: 1.2, reach: 1.2, atk: 'bonk', dmg: 9, cd: 1.6, slow: 1.4, knock: true, boss: true, mini: true, big: 1.35, score: 800, look: 'gloopula', monster: '🟣', specials: ['potions', 'pound'], summon: ['blob', 'blob'] },
    thunderhoof:{ name: 'Thunderhoof', hp: 280, spd: 2.0, reach: 1.3, atk: 'bonk', dmg: 11, cd: 1.4, slow: 1.25, knock: true, boss: true, mini: true, big: 1.4, score: 800, look: 'thunderhoof', monster: '🐂', specials: ['charge', 'charge', 'pound'] },
    megamaw:   { name: 'Megamaw', hp: 620, spd: 1.2, reach: 1.6, atk: 'bonk', dmg: 13, cd: 1.6, slow: 1.3, knock: true, boss: true, big: 1.7, score: 4000, look: 'megamaw', monster: '👾', specials: ['pound', 'spin', 'potions'], summon: ['blob', 'spiky', 'flapper'] },
    // tale 6 🧜
    crab:      { name: 'Crab', hp: 26, spd: 2.0, reach: 0.9, atk: 'boop', dmg: 6, cd: 1.5, slow: 1.5, score: 100, look: 'crab', monster: '🦀' },
    jelly:     { name: 'Jelly', hp: 22, spd: 0.9, reach: 0.9, atk: 'boop', dmg: 7, cd: 2.0, slow: 1.6, score: 100, look: 'jelly', monster: '🪼', float: true },
    shark:     { name: 'Shark', hp: 46, spd: 1.4, reach: 1.0, atk: 'roll', dmg: 10, cd: 2.4, slow: 1.3, knock: true, big: 1.2, score: 200, look: 'shark', monster: '🦈' },
    octopus:   { name: 'Octopus', hp: 28, spd: 1.4, reach: 0.9, atk: 'boop', dmg: 5, cd: 2.3, slow: 1.5, range: 5.5, keep: 3.6, shot: 'lob', proj: '⚫', pdmg: 6, score: 150, look: 'octopus', monster: '🐙' },
    barnacle:  { name: 'Captain Barnacle', hp: 200, spd: 1.6, reach: 1.3, atk: 'bonk', dmg: 10, cd: 1.5, slow: 1.3, knock: true, boss: true, big: 1.35, score: 1000, look: 'barnacle', specials: ['charge', 'spin'] },
    coralline: { name: 'Queen Coralline', hp: 300, spd: 1.5, reach: 1.25, atk: 'bonk', dmg: 10, cd: 1.5, slow: 1.3, knock: true, boss: true, big: 1.25, score: 2500, look: 'coralline', specials: ['potions', 'spin'], summon: ['jelly', 'jelly'] },
    finnegan:  { name: 'Prince Finnegan', hp: 300, spd: 1.7, reach: 1.25, atk: 'bonk', dmg: 10, cd: 1.4, slow: 1.3, knock: true, boss: true, big: 1.25, score: 2500, look: 'finnegan', specials: ['charge', 'pound'], summon: ['crab', 'crab'] },
    grumble:   { name: 'Baron Grumble', hp: 390, spd: 1.6, reach: 1.35, atk: 'bonk', dmg: 10, cd: 1.6, slow: 1.25, knock: true, boss: true, big: 1.3, score: 2500, look: 'grumble', specials: ['spin', 'potions'], summon: ['guard', 'archer'] }
  };
  var FGUARD = { guard: 0.25, brax: 0.12, fang: 0.2, fizz: 0.1, mumble: 0.12, megamumble: 0.18, spikeback: 0.15, gloopula: 0.1, thunderhoof: 0.1, megamaw: 0.12, barnacle: 0.2, coralline: 0.2, finnegan: 0.2, grumble: 0.25 };
  for (var fgk in FGUARD) FOES[fgk].guard = FGUARD[fgk];
  // floor things: food heals, boosts, things to throw / swing / wear / ride, puzzle items, hidden collectibles
  var PICKS = {
    juice:    { icon: '🧃', name: 'Juice box', heal: 30 },
    sticker:  { icon: '⭐', name: 'Super sticker', boost: 8 },
    ball:     { icon: '⚽', name: 'Ball', weapon: { dmg: 16, spd: 9, kind: 'roll', life: 1.6 } },
    frisbee:  { icon: '🥏', name: 'Frisbee', weapon: { dmg: 11, spd: 9.5, kind: 'back', life: 1.5 } },
    board:    { icon: '🛹', name: 'Skateboard', ride: 5 },
    clue:     { icon: '🔍', name: 'Clue' },
    teddy:    { icon: '🧸', name: 'Lost teddy', secret: true },
    cupcake:  { icon: '🧁', name: 'Cupcake', heal: 30 },
    sugar:    { icon: '🍬', name: 'Sugar rush', boost: 8 },
    lolly:    { icon: '🍭', name: 'Lollipop bat', melee: { uses: 8, dmg: 7, reach: 0.35 } },
    gumball:  { icon: '🟣', name: 'Gumball spray', weapon: { dmg: 9, spd: 8.5, kind: 'spray', life: 1.3 } },
    golden:   { icon: '🌟', name: 'Golden gummy', secret: true },
    drumstick:{ icon: '🍗', name: 'Drumstick', heal: 35 },
    potion:   { icon: '🧪', name: 'Power potion', boost: 8 },
    shield:   { icon: '🛡️', name: 'Shield', armour: 3 },
    firework: { icon: '🎆', name: 'Firework', weapon: { dmg: 18, spd: 7, kind: 'boom', life: 0.65 } },
    key:      { icon: '🗝️', name: 'Jail key' },
    crown:    { icon: '💎', name: 'Lost gem', secret: true },
    beans:    { icon: '🥫', name: 'Can of beans', heal: 30 },
    flashlight:{ icon: '🔦', name: 'Flashlight', light: 3 },
    chicken:  { icon: '🐔', name: 'Rubber chicken', melee: { uses: 10, dmg: 4, reach: 0.3, knock: true } },
    foambat:  { icon: '🏏', name: 'Foam bat', melee: { uses: 8, dmg: 7, reach: 0.4 } },
    fuel:     { icon: '⛽', name: 'Fuel can' },
    duck:     { icon: '🦆', name: 'Rubber duck', secret: true },
    herobar:  { icon: '🍫', name: 'Hero bar', heal: 35 },
    crystal:  { icon: '💎', name: 'Power crystal', boost: 8 },
    rocket:   { icon: '🚀', name: 'Rocket gloves', melee: { uses: 10, dmg: 9, reach: 0.5, knock: true } },
    net:      { icon: '🕸️', name: 'Net launcher', weapon: { dmg: 4, spd: 8, kind: 'net', life: 1.2 } },
    medal:    { icon: '🏅', name: 'Hero medal', secret: true },
    apple:    { icon: '🍎', name: 'Sea apple', heal: 30 },
    bubble:   { icon: '🫧', name: 'Air bubble', air: 45 },
    trident:  { icon: '🔱', name: 'Trident', melee: { uses: 10, dmg: 8, reach: 0.6 } },
    puffer:   { icon: '🐡', name: 'Pufferfish', weapon: { dmg: 15, spd: 6.5, kind: 'boom', life: 0.6 } },
    dolphin:  { icon: '🐬', name: 'Dolphin ride', ride: 6 },
    fishy:    { icon: '🐠', name: 'Lost fishy', secret: true }
  };
  var PROPS = { bin: { icon: '🗑️', hp: 2 }, box: { icon: '📦', hp: 2 }, bush: { icon: '🌳', hp: 2 }, cone: { icon: '🚧', hp: 1 }, crate: { icon: '🧺', hp: 2 }, barrel: { icon: '🛢️', hp: 2 }, vase: { icon: '🏺', hp: 1 }, armour: { icon: '🗿', hp: 3 }, car: { icon: '🚗', hp: 2 }, coral: { icon: '🪸', hp: 2 }, chest: { icon: '🧰', hp: 2 }, rock: { icon: '🪨', hp: 2 }, trash: { icon: '🗑️', hp: 2 }, tire: { icon: '🛞', hp: 1 } };

  // ---------- the tales (F: 1–3 · G adds 4–5 · H adds 6) ----------
  var TALES = [
    { id: 'playground', n: 1, name: 'Playground Rumble', icon: '🛝', villain: 'Big Brax & the Rumble Rascals', boss: 'brax', players: [1, 2], secret: 'teddy',
      blurb: 'The Rumble Rascals grabbed {who} at the playground! Bonk the bullies and find the clubhouse.',
      maps: [
        { name: 'Swing Park', icon: '🎠', len: 40, puzzle: 'steps',
          zones: [{ x: 9, waves: [['rascal', 'rascal'], ['rascal', 'rascal', 'rascal']] }, { x: 19, puzzle: 'steps' }, { x: 30, waves: [['rascal', 'rascal', 'rascal'], ['rascal', 'rascal', 'rascal', 'rascal']] }],
          props: [[5, 0.5, 'bin', 'juice'], [13, 1.9, 'box', 'ball'], [24.5, 0.3, 'bush', 'teddy'], [34, 1.7, 'bin', 'sticker']], picks: [[12, 1.2, 'juice'], [26, 1.6, 'frisbee']] },
        { name: 'Slide Street', icon: '🛝', len: 42, puzzle: 'bells',
          zones: [{ x: 9, waves: [['rascal', 'kicker'], ['rascal', 'rascal', 'kicker']] }, { x: 20, puzzle: 'bells' }, { x: 31, waves: [['kicker', 'kicker', 'rascal'], ['rascal', 'kicker', 'rascal', 'kicker']] }],
          props: [[6, 1.8, 'box', 'board'], [15, 0.4, 'bin', 'juice'], [26, 2.1, 'bush', 'teddy'], [36, 0.6, 'box', 'juice']], picks: [[27, 1, 'ball'], [37, 1.8, 'sticker']] },
        { name: 'Climbing Fort', icon: '🧗', len: 44, puzzle: 'clues',
          zones: [{ x: 9, waves: [['rascal', 'splasher', 'kicker'], ['splasher', 'rascal', 'kicker']] }, { x: 21, waves: [['kicker', 'splasher', 'rascal', 'rascal']] }, { x: 34, puzzle: 'clues' }],
          props: [[5, 2, 'box', 'clue'], [12, 0.4, 'bin', 'juice'], [17, 1.7, 'bush', 'clue'], [25, 0.5, 'box', 'frisbee'], [28, 2.1, 'bush', 'teddy'], [31, 1.2, 'bin', 'clue']], picks: [[22, 1.2, 'juice'], [36, 0.6, 'sticker']] },
        { name: "Brax's Clubhouse", icon: '🏚️', len: 22, boss: true,
          zones: [{ x: 9, boss: ['brax'] }], props: [[4, 0.5, 'bin', 'juice'], [5.5, 2, 'box', 'juice']], picks: [[3, 1.2, 'ball']] }
      ] },
    { id: 'candy', n: 2, name: 'Candy Factory Defense', icon: '🍭', villain: 'Fizz & Fang, the Sourbane Twins', boss: 'fang', players: [1, 2, 3], secret: 'golden',
      blurb: 'The Sourbane Twins stormed the candy factory and locked {who} in the twin tower! Guard the machines and find a way up.',
      maps: [
        { name: 'Sugar Gate', icon: '🍬', len: 40, puzzle: 'sort',
          zones: [{ x: 9, waves: [['gummy', 'gummy'], ['gummy', 'gummy', 'gummy']] }, { x: 20, puzzle: 'sort' }, { x: 31, waves: [['gummy', 'sprinkler', 'gummy'], ['gummy', 'gummy', 'sprinkler']] }],
          props: [[5, 1.9, 'crate', 'cupcake'], [14, 0.5, 'crate', 'lolly'], [26, 2.1, 'barrel', 'golden'], [35, 0.4, 'crate', 'sugar']], picks: [[12, 1.4, 'cupcake'], [28, 1, 'gumball']] },
        { name: 'Pipe Works', icon: '🔧', len: 42, puzzle: 'pipes',
          zones: [{ x: 9, waves: [['gummy', 'jawbreaker'], ['sprinkler', 'gummy', 'gummy']] }, { x: 20, puzzle: 'pipes' }, { x: 31, waves: [['jawbreaker', 'gummy', 'sprinkler'], ['gummy', 'jawbreaker', 'gummy', 'sprinkler']] }],
          props: [[6, 0.4, 'barrel', 'gumball'], [15, 2, 'crate', 'cupcake'], [25, 0.3, 'crate', 'golden'], [36, 1.8, 'barrel', 'cupcake']], picks: [[27, 1.4, 'lolly'], [38, 0.8, 'sugar']] },
        { name: 'Candy Vault', icon: '🔢', len: 42, puzzle: 'code',
          zones: [{ x: 9, waves: [['jawbreaker', 'sprinkler', 'gummy'], ['gummy', 'gummy', 'sprinkler', 'gummy']] }, { x: 21, waves: [['jawbreaker', 'jawbreaker', 'sprinkler']] }, { x: 32, puzzle: 'code' }],
          props: [[5, 2, 'crate', 'cupcake'], [16, 0.4, 'barrel', 'lolly'], [24, 2.1, 'crate', 'golden'], [27, 0.6, 'barrel', 'cupcake']], picks: [[13, 1.2, 'gumball'], [25, 1.2, 'sugar']] },
        { name: 'Mixing Hall', icon: '🏭', len: 40, puzzle: 'defend',
          zones: [{ x: 9, waves: [['gummy', 'sprinkler', 'gummy']] }, { x: 24, puzzle: 'defend', waves: [['gummy', 'gummy', 'jawbreaker'], ['sprinkler', 'gummy', 'gummy', 'jawbreaker'], ['jawbreaker', 'gummy', 'sprinkler', 'gummy', 'gummy']] }],
          props: [[6, 0.5, 'crate', 'cupcake'], [14, 2, 'barrel', 'golden'], [19, 0.4, 'crate', 'gumball'], [21, 1.9, 'crate', 'cupcake']], picks: [[17, 1.2, 'lolly'], [33, 1.2, 'cupcake']] },
        { name: 'Twin Tower Kitchen', icon: '🍳', len: 22, boss: true,
          zones: [{ x: 9, boss: ['fizz', 'fang'] }], props: [[4, 0.5, 'crate', 'cupcake'], [5.5, 2, 'barrel', 'cupcake']], picks: [[3, 1.2, 'lolly'], [4.5, 1.6, 'gumball']] }
      ] },
    { id: 'castle', n: 3, name: 'Castle Climb', icon: '🏰', villain: 'Baron Grumble', boss: 'grumble', players: [1, 2, 3], secret: 'crown', prisoner: true,
      blurb: 'Baron Grumble locked {who} at the top of his castle! Climb all 4 floors — and free the prisoner in the dungeon on the way.',
      maps: [
        { name: 'Drawbridge', icon: '🌉', len: 40, puzzle: 'crank',
          zones: [{ x: 9, waves: [['guard', 'guard'], ['guard', 'archer', 'guard']] }, { x: 20, puzzle: 'crank', waves: [['guard', 'guard'], ['archer', 'guard']] }, { x: 31, waves: [['guard', 'knight', 'guard']] }],
          props: [[5, 1.9, 'barrel', 'drumstick'], [14, 0.4, 'crate', 'shield'], [26, 2.1, 'vase', 'crown'], [35, 0.5, 'barrel', 'potion']], picks: [[12, 1.4, 'firework'], [28, 1, 'drumstick']] },
        { name: 'Great Hall', icon: '🕯️', len: 42, puzzle: 'levers',
          zones: [{ x: 9, waves: [['guard', 'knight'], ['archer', 'guard', 'guard']] }, { x: 20, puzzle: 'levers' }, { x: 31, waves: [['knight', 'archer', 'guard'], ['guard', 'knight', 'guard', 'archer']] }],
          props: [[6, 0.4, 'vase', 'firework'], [15, 2, 'barrel', 'drumstick'], [25, 0.3, 'vase', 'crown'], [36, 1.8, 'crate', 'drumstick']], picks: [[27, 1.4, 'shield'], [38, 0.8, 'potion']] },
        { name: 'Dungeon', icon: '⛓️', len: 42, puzzle: 'armour',
          zones: [{ x: 9, waves: [['knight', 'guard', 'archer'], ['guard', 'guard', 'knight']] }, { x: 21, waves: [['knight', 'knight', 'archer']] }, { x: 32, puzzle: 'armour' }],
          props: [[5, 2, 'barrel', 'drumstick'], [16, 0.4, 'vase', 'shield'], [24, 2.1, 'crate', 'crown'], [26, 0.6, 'barrel', 'drumstick']], picks: [[13, 1.2, 'firework'], [25, 1.2, 'potion']] },
        { name: 'Throne Room', icon: '👑', len: 32, boss: true,
          zones: [{ x: 9, puzzle: 'torches' }, { x: 21, boss: ['grumble'] }], props: [[4, 0.5, 'vase', 'drumstick'], [14, 2, 'barrel', 'crown'], [16, 0.4, 'crate', 'drumstick']], picks: [[15, 1.2, 'firework'], [17, 1.8, 'shield']] }
      ] },
    { id: 'zombie', n: 4, name: 'Zombie Crawl', icon: '🧟', villain: 'King Mumblebones', boss: 'mumble', players: [1, 2, 3, 4], secret: 'duck',
      blurb: 'Goofy zombies everywhere — they only want hugs! King Mumblebones took {who} to the old shelter. Get the bus going and find it.',
      maps: [
        { name: 'Bus Stop', icon: '🚌', len: 40, puzzle: 'fuel',
          zones: [{ x: 9, waves: [['zombie', 'zombie'], ['zombie', 'zombie', 'zombie']] }, { x: 20, puzzle: 'fuel' }, { x: 31, waves: [['zombie', 'runner', 'zombie'], ['runner', 'zombie', 'zombie', 'runner']] }],
          props: [[5, 1.9, 'trash', 'beans'], [13, 0.5, 'car', 'flashlight'], [24.5, 2.1, 'tire', 'duck'], [34, 0.5, 'trash', 'beans']], picks: [[12, 1.4, 'chicken'], [28, 1, 'beans']] },
        { name: 'Radio Shack', icon: '📻', len: 42, puzzle: 'radio',
          zones: [{ x: 9, waves: [['runner', 'zombie'], ['zombie', 'runner', 'zombie']] }, { x: 21, puzzle: 'radio' }, { x: 32, waves: [['bloater', 'zombie', 'runner'], ['zombie', 'bloater', 'runner', 'zombie']] }],
          props: [[6, 0.4, 'trash', 'foambat'], [15, 2, 'car', 'beans'], [26, 0.3, 'tire', 'duck'], [37, 1.8, 'trash', 'beans']], picks: [[27, 1.4, 'flashlight'], [38, 0.8, 'sticker']] },
        { name: 'Dark Alley', icon: '🌑', len: 42, puzzle: 'dark',
          zones: [{ x: 9, waves: [['bloater', 'zombie', 'runner'], ['runner', 'runner', 'zombie']] }, { x: 21, puzzle: 'dark' }, { x: 32, waves: [['bloater', 'bloater', 'runner'], ['zombie', 'runner', 'zombie', 'bloater']] }],
          props: [[5, 2, 'trash', 'beans'], [14, 0.4, 'car', 'chicken'], [27, 2.1, 'tire', 'duck'], [36, 0.6, 'trash', 'beans']], picks: [[13, 1.2, 'flashlight'], [29, 1.2, 'sticker']] },
        { name: 'Shelter Gate', icon: '🧱', len: 36, puzzle: 'barricade',
          zones: [{ x: 9, waves: [['zombie', 'runner', 'bloater']] }, { x: 22, puzzle: 'barricade' }],
          props: [[6, 0.5, 'trash', 'beans'], [14, 2, 'car', 'duck'], [17, 0.4, 'tire', 'foambat'], [18.5, 1.9, 'trash', 'beans']], picks: [[16, 1.2, 'flashlight'], [19, 1.2, 'beans']] },
        { name: 'Old Shelter', icon: '🏚️', len: 22, boss: true,
          zones: [{ x: 9, boss: ['mumble'] }], props: [[4, 0.5, 'trash', 'beans'], [5.5, 2, 'car', 'beans']], picks: [[3, 1.2, 'chicken'], [4.5, 1.6, 'flashlight']] }
      ] },
    { id: 'monsters', n: 5, name: 'Monster Outbreak', icon: '👾', villain: 'Megamaw & the mini-bosses', boss: 'megamaw', players: [1, 2, 3, 4], team: 4, noCaptive: true, secret: 'medal',
      blurb: 'Monsters are coming to town! You and 3 family heroes guard the town gate — 10 waves, 3 mini-bosses and Megamaw himself.',
      maps: [
        { name: 'Town Square', icon: '🏘️', len: 20, boss: true, puzzle: 'outbreak',
          zones: [{ x: 10, puzzle: 'outbreak' }], props: [[6, 0.4, 'crate', 'herobar'], [13, 2.1, 'barrel', 'medal'], [15, 0.5, 'crate', 'crystal']], picks: [[8, 1.2, 'rocket'], [12, 1.6, 'net']] }
      ] },
    { id: 'sea', n: 6, name: 'Undersea Rescue', icon: '🧜', villain: 'Queen Coralline or Prince Finnegan', boss: 'coralline', players: [1, 2, 3, 4], secret: 'fishy', water: true,
      blurb: 'A royal from the mermaid village swept {who} away to marry them! Dive through 4 depths — watch your 🫧 air — and say "We object!"',
      maps: [
        { name: 'Shallow Reef', icon: '🪸', len: 40, puzzle: 'shells', water: 1, vents: [6, 24, 35],
          zones: [{ x: 9, waves: [['crab', 'crab'], ['crab', 'jelly', 'crab']] }, { x: 19, puzzle: 'shells' }, { x: 30, waves: [['jelly', 'crab', 'jelly'], ['crab', 'crab', 'jelly', 'crab']] }],
          props: [[5, 1.9, 'coral', 'apple'], [13, 0.5, 'rock', 'trident'], [25.5, 2.1, 'coral', 'fishy'], [34, 0.5, 'chest', 'bubble']], picks: [[12, 1.4, 'bubble'], [27, 1, 'puffer']] },
        { name: 'Kelp Forest', icon: '🌿', len: 42, puzzle: 'currents', water: 2, vents: [5, 15, 27, 37],
          zones: [{ x: 9, waves: [['crab', 'octopus'], ['jelly', 'crab', 'octopus']] }, { x: 21, puzzle: 'currents' }, { x: 32, waves: [['octopus', 'crab', 'jelly'], ['crab', 'octopus', 'crab', 'jelly']] }],
          props: [[6, 0.4, 'rock', 'dolphin'], [14, 2, 'coral', 'apple'], [28, 0.3, 'coral', 'fishy'], [37, 1.8, 'chest', 'apple']], picks: [[16, 1.4, 'bubble'], [30, 0.8, 'trident']] },
        { name: 'Sunken Ship', icon: '🚢', len: 42, puzzle: 'pearls', water: 3, vents: [6, 17, 27, 36],
          zones: [{ x: 9, waves: [['shark', 'crab'], ['octopus', 'crab', 'crab']] }, { x: 21, puzzle: 'pearls' }, { x: 32, waves: [['shark', 'octopus', 'crab'], ['crab', 'shark', 'octopus', 'jelly']] }],
          props: [[5, 2, 'chest', 'apple'], [14, 0.4, 'rock', 'puffer'], [28, 2.1, 'chest', 'fishy'], [37, 0.6, 'coral', 'apple']], picks: [[16, 1.2, 'bubble'], [29, 1.2, 'trident']] },
        { name: 'Deep Trench', icon: '🌑', len: 42, puzzle: 'sonar', water: 4, vents: [5, 16, 27, 38],
          zones: [{ x: 9, waves: [['shark', 'jelly', 'octopus'], ['jelly', 'shark', 'jelly']] }, { x: 21, puzzle: 'sonar' }, { x: 32, waves: [['shark', 'shark', 'octopus'], ['octopus', 'jelly', 'shark', 'crab']] }],
          props: [[6, 0.5, 'rock', 'apple'], [14, 2, 'coral', 'fishy'], [29, 0.4, 'chest', 'puffer'], [36, 1.9, 'rock', 'apple']], picks: [[15, 1.2, 'bubble'], [30, 1.4, 'dolphin']] },
        { name: 'Mermaid Village', icon: '🏝️', len: 24, boss: true, puzzle: 'wedding',
          zones: [{ x: 10, puzzle: 'wedding' }], props: [[4, 0.5, 'coral', 'apple'], [5.5, 2, 'chest', 'apple']], picks: [[3, 1.2, 'trident'], [4.5, 1.6, 'puffer']] }
      ] }
  ];

  // ---------- making a run ----------
  var nextId = 100;
  function mkBody(o) {
    return { i: nextId++, name: o.name || '', x: o.x || 0, z: o.z == null ? ZD / 2 : o.z, y: 0, vx: 0, vz: 0, vy: 0, face: o.face || 1, act: null, stun: 0, bstun: 0, down: 0, ko: false, launched: false,
      dodge: null, dash: null, open: 0, dizzy: 0, held: null, grab: null, land: 0, cheer: 0, sad: 0, walkT: 0, safe: 0, hitFlash: 0, jug: 0, ctrl: { l: false, r: false, u: false, d: false }, kbx: 0 };
  }
  function mkHero(M, h, k, x, z) {
    var b = mkBody({ name: h.name, x: x == null ? 1.5 - k * 0.6 : x, z: z == null ? 0.5 + k * 0.5 : z, face: 1 });
    b.hero = true; b.seat = k; b.human = !!h.human; b.hp = b.maxHp = 100; b.power = 0; b.combo = { n: 0, t: 0 }; b.buf = null; b.item = null; b.uses = 0; b.carry = null; b.shield = 0; b.boost = 0; b.ride = 0; b.out = 0; b.ai = { t: 0, tgt: null };
    b.st = { hits: 0, kos: 0, hurt: 0, blocks: 0, counters: 0, grabs: 0, breaks: 0, dashes: 0, clash: 0 }; b.joined = !!h.joined;
    b.dashCd = 0; b.gd = 100; b.hold = { block: false, g: false }; b.blk = false; b.blkT = 0; b.blockTap = 0; b.ctr = null; b.pend = null; b.lastTap = null; b.grab = null; b.tap = !!h.tap; return b;
  }
  function newRun(o) {
    var tale = TALES[o.tale || 0], dk = DIFFS[o.diff] ? o.diff : 'normal';
    var M = { view: o.view || VIEW, tale: tale, ti: o.tale || 0, diff: dk, D: DIFFS[dk], rng: mkRng(o.seed || 7), t: 0, mapI: o.map || 0, heroes: [], foes: [], props: [], picks: [], shots: [], waves: [], booms: [], ev: [],
      lives: DIFFS[dk].lives, livesUsed: 0, found: 0, foundIn: [], score: 0, kos: 0, done: false, win: false, captive: o.captive || 'Buddy', prisoner: o.prisoner || 'Buddy', botPuzzles: !!o.botPuzzles, stats: { hits: 0, dmg: 0, picks: 0, puzzles: 0 } };
    var hs = (o.heroes || [{ name: 'Me', human: true }]).slice(); while (tale.team && hs.length < tale.team) hs.push({ name: 'Buddy ' + (hs.length + 1), human: false });
    hs.forEach(function (h, k) { M.heroes.push(mkHero(M, h, k)); });
    M.coins = 0;
    if (tale.water) M.royal = M.rng() < 0.5 ? 'coralline' : 'finnegan';
    loadMap(M, M.mapI);
    return M;
  }
  function loadMap(M, mi) {
    var mp = M.tale.maps[mi]; M.mapI = mi; M.map = mp; M.len = mp.len; M.cam = M.view / 2; M.zoneI = 0; M.zone = null; M.lock = null; M.puzzle = null; M.mapDone = false; M.exitOpen = false;
    M.foes = []; M.shots = []; M.waves = []; M.booms = []; M.cage = null; M.bosses = []; M.bossF = null; M.machine = null; M.door = null;
    M.props = mp.props.map(function (p) { return { i: nextId++, x: p[0], z: p[1], k: p[2], drop: p[3], hp: PROPS[p[2]].hp, hitT: 0, gone: false }; });
    M.picks = mp.picks.map(function (p) { return { i: nextId++, x: p[0], z: p[1], k: p[2], t: 0 }; });
    M.zones = mp.zones.map(function (z) { return { x: z.x, waves: z.waves, puzzle: z.puzzle, boss: z.boss, wi: 0, state: 'wait' }; });
    M.clues = mp.puzzle === 'clues' ? { got: 0, need: 3 } : null;
    M.heroes.forEach(function (h, k) { h.x = 1.4 - k * 0.5; h.z = 0.4 + k * 0.45; h.y = 0; h.vx = h.vz = h.vy = 0; h.act = null; h.launched = false; h.down = 0; h.stun = 0; h.carry = null; if (h.ko) { h.ko = false; h.out = 0; h.hp = Math.round(h.maxHp * 0.6); } h.safe = 1; });
    M.heroes.forEach(function (h) { h.air = 100; });
    var bz = mp.zones.filter(function (z) { return z.boss; })[0];
    if (bz) M.cage = { x: bz.x + Math.min(4.6, M.view / 2 - 0.7), z: ZD * 0.35, open: false, t: 0, zx: bz.x };
    M.wedding = mp.puzzle === 'wedding';
    M.ev.push({ k: 'map', i: mi, name: mp.name });
  }
  function nextMap(M) { if (M.mapI + 1 < M.tale.maps.length) { loadMap(M, M.mapI + 1); return true; } return false; }

  // ---------- spawning ----------
  function spawnFoe(M, type, x, z) {
    var F = FOES[type], b = mkBody({ name: F.name, x: x, z: z, face: -1 });
    b.foe = true; b.type = type; b.F = F; b.hp = b.maxHp = Math.round(F.hp * M.D.ehp); b.ai = { st: 'walk', t: 0.3 + M.rng() * 0.6, cd: 0.8 + M.rng() * F.cd, side: M.rng() < 0.5 ? -1 : 1, sp: 0, specT: 4 + M.rng() * 2 };
    b.boss = !!F.boss; b.big = F.big || 1; b.clashes = 0; b.clashMax = F.mini || F.twin ? 1 : 2; b.guarding = 0; b.poise = 0; b.summoned = 0; b.dead = 0; b.rage = 1;
    if (M.machine && !M.machine.broken && M.rng() < 0.5) b.ai.mach = true;   // 🏭 half of them go for the candy machine
    M.foes.push(b); return b;
  }
  function spawnWave(M, Z) {
    var list = Z.waves[Z.wi], n = Math.max(1, Math.round(list.length * M.D.count)), out = [];
    for (var k = 0; k < n; k++) out.push(list[k % list.length]);
    out.forEach(function (t, k) { var side = k % 2 ? -1 : 1, x = M.cam + side * (M.view / 2 + 0.8 + k * 0.5); spawnFoe(M, t, x, 0.3 + M.rng() * (ZD - 0.6)); });
    M.ev.push({ k: 'wave', n: out.length, i: Z.wi, of: Z.waves.length });
  }

  // ---------- puzzles: one per map. start / step / hit (a strike reaches it) / press (👊 near it) / bot (how a bot solves it) ----------
  function orderStart(M, P, n, noShow) { var r = M.rng; P.seq = []; for (var k = 0; k < M.D.bells; k++) { var b; do { b = Math.floor(r() * n); } while (k && b === P.seq[k - 1]); P.seq.push(b); } P.pos = 0; P.show = noShow ? 0 : 0.01; P.ring = []; P.lit = []; for (var j = 0; j < n; j++) { P.ring.push(0); P.lit.push(false); } P.wrong = 0; P.noShow = !!noShow; }
  function orderHit(M, P, k) {
    P.ring[k] = 0.6; M.ev.push({ k: P.k === 'bells' ? 'bell' : P.k === 'levers' ? 'lever' : 'torch', b: k });
    if (P.seq[P.pos] === k) { P.lit[k] = true; P.pos++; if (P.pos >= P.seq.length) puzzleSolved(M); }
    else { P.pos = 0; P.wrong = 1; P.show = P.noShow ? 0.6 : 1.2; P.lit = P.lit.map(function () { return false; }); M.ev.push({ k: 'wrong', p: P.k }); }
  }
  function orderBot(M, P, h, i, go, A) {
    var first = M.heroes.filter(function (o) { return !o.ko && !o.human; })[0];
    if ((!P.noShow && (P.show > 0 || orderShowing(P) >= 0)) || first !== h) { go(P.x - 3.4, 0.3 + i * 0.6); return; }
    var bb = P.bells[P.seq[P.pos]], sx = bb.x - 0.75; if (Math.abs(h.x - sx) < 0.2 && Math.abs(h.z - bb.z) < 0.15) { h.face = 1; if (A.t <= 0 && canAct(h)) { A.t = 0.55; press(M, i, 'boop'); } } else go(sx, bb.z, 0.1);
  }
  function hitAt(M, h, mv, o, extra) { return inFront(h, o, mv.reach + (extra || 0.25), 0.5); }
  function standHit(M, h, i, go, A, o, gap) { var sx = o.x - (gap || 0.75); if (Math.abs(h.x - sx) < 0.2 && Math.abs(h.z - o.z) < 0.15) { h.face = 1; if (A.t <= 0 && canAct(h)) { A.t = 0.32; press(M, i, 'boop'); } } else go(sx, o.z, 0.1); }
  var PZ = {
    steps: { // 👣 follow the footprints across the sandbox (shown, then they fade)
      start: function (M, P, Z) { var r = M.rng; P.cols = 6; P.rows = 3; P.cw = 1.15; P.x0 = Z.x - P.cols * P.cw / 2; P.path = []; var row = Math.floor(r() * 3); for (var c = 0; c < P.cols; c++) { if (c) row = clamp(row + Math.floor(r() * 3) - 1, 0, 2); P.path.push(row); } P.prog = -1; P.show = 3.2; P.gate = P.x0 + P.cols * P.cw + 0.5; P.mud = 0; },
      step: function (M, P, dt) {
        if (P.show > 0) P.show -= dt; if (P.mud > 0) P.mud -= dt;
        M.heroes.forEach(function (h) {
          if (h.ko || !onGround(h) || h.safe > 1.2) return;
          var c = Math.floor((h.x - P.x0) / P.cw), rh = ZD / P.rows, r = Math.floor(h.z / rh);
          if (c < 0 || c >= P.cols) return;
          var cx = P.x0 + (c + 0.5) * P.cw, cz = (r + 0.5) * rh;
          if (Math.abs(h.x - cx) > 0.3 || Math.abs(h.z - cz) > 0.24) return;   // only the middle of a tile counts (crossing a corner is fine)
          if (P.path[c] === clamp(r, 0, P.rows - 1) && c <= P.prog + 1) { if (c > P.prog) { P.prog = c; M.ev.push({ k: 'stepOk', c: c }); if (c === P.cols - 1) puzzleSolved(M); } }
          else { P.prog = -1; P.show = 2; P.mud = 0.8; M.ev.push({ k: 'mud', h: h.seat, x: h.x, z: h.z }); M.heroes.forEach(function (o) { if (!o.ko && o.x > P.x0 - 0.2) { o.x = P.x0 - 0.7; o.safe = Math.max(o.safe, 1.3); } }); }
        });
      },
      wait: function (P, i) { return [P.x0 - 1.1 - i * 0.3, 0.3 + i * 0.5]; },
      bot: function (M, P, h, i, go) { if (P.show > 0 && P.prog < 0) { go(P.x0 - 0.8, (P.path[0] + 0.5) * ZD / P.rows); return; } var nc = P.prog + 1, tx = P.x0 + (nc + 0.5) * P.cw, tz = (P.path[nc] + 0.5) * ZD / P.rows; if (Math.abs(h.x - tx) > 0.42) go(tx, h.z, 0.4); else if (Math.abs(h.z - tz) > 0.14) go(h.x, tz); else go(tx, tz, 0.08); }
    },
    bells: { // 🔔 watch the bells, then bonk them in the same order
      start: function (M, P, Z) { P.bells = [{ x: Z.x - 2.2, z: 0.5 }, { x: Z.x, z: 1.9 }, { x: Z.x + 2.2, z: 0.8 }]; orderStart(M, P, 3); P.gate = Z.x + 3.6; },
      step: function (M, P, dt) { if (P.show > 0) { P.show -= dt; if (P.show <= 0 && P.wrong) P.wrong = 0; } P.ring = P.ring.map(function (v) { return Math.max(0, v - dt); }); },
      hit: function (M, P, h, mv) { if (P.show > 0) return; P.bells.forEach(function (b, k) { if (hitAt(M, h, mv, b)) orderHit(M, P, k); }); },
      wait: function (P, i) { return [P.x - 3.4, 0.3 + i * 0.5]; },
      bot: orderBot
    },
    clues: { // 🔍 3 clues hidden in bins / boxes / bushes
      start: function (M, P, Z) { P.gate = Z.x + 1; P.need = 3; if (M.clues && M.clues.got >= M.clues.need) puzzleSolved(M); }
    },
    sort: { // 🎨 colour sort: candies ride the belt at the back — carry each to the bin of its colour
      start: function (M, P, Z) { var c = [0, 1, 2]; for (var i = 2; i > 0; i--) { var j = Math.floor(M.rng() * (i + 1)); var t = c[i]; c[i] = c[j]; c[j] = t; }
        P.bins = [{ x: Z.x - 2.3, z: 2.05, c: c[0] }, { x: Z.x, z: 2.05, c: c[1] }, { x: Z.x + 2.3, z: 2.05, c: c[2] }]; P.candies = []; P.spawnT = 0.3; P.got = 0; P.need = M.D.sort; P.gate = Z.x + 3.8; P.belt = { x0: Z.x - 4.4, x1: Z.x + 4.4, z: 0.25 }; },
      step: function (M, P, dt) {
        P.spawnT -= dt; if (P.spawnT <= 0) { P.spawnT = 1.6; P.candies.push({ i: nextId++, x: P.belt.x0, z: P.belt.z, c: Math.floor(M.rng() * 3) }); }
        P.candies.forEach(function (c) { c.x += 0.9 * dt; }); P.candies = P.candies.filter(function (c) { return c.x < P.belt.x1; });
      },
      press: function (M, P, h) {
        if (h.carry != null) { var bin = P.bins.filter(function (b) { return Math.abs(b.x - h.x) < 0.95 && Math.abs(b.z - h.z) < 0.6; })[0]; if (!bin) return false;
          if (bin.c === h.carry) { P.got++; M.score += 50; M.ev.push({ k: 'sortOk', got: P.got, need: P.need }); if (P.got >= P.need) puzzleSolved(M); } else M.ev.push({ k: 'wrong', p: 'sort' });
          h.carry = null; return true; }
        var c = P.candies.filter(function (q) { return Math.abs(q.x - h.x) < 0.7 && Math.abs(q.z - h.z) < 0.5; })[0]; if (!c) return false;
        h.carry = c.c; P.candies.splice(P.candies.indexOf(c), 1); M.ev.push({ k: 'carry', h: h.seat, c: c.c }); return true;
      },
      wait: function (P, i) { return [P.x - 3.6, 1.2 + i * 0.4]; },
      bot: function (M, P, h, i, go, A) {
        var act = function () { if (A.t <= 0 && canAct(h)) { A.t = 0.3; press(M, i, 'boop'); } };
        if (h.carry != null) { var b = P.bins.filter(function (q) { return q.c === h.carry; })[0]; if (Math.abs(h.x - b.x) < 0.3 && Math.abs(h.z - b.z) < 0.2) act(); else go(b.x, b.z, 0.1); return; }
        var c = P.candies.filter(function (q) { return q.x > h.x - 1; }).sort(function (a, b) { return a.x - b.x; })[0]; if (!c) { go(P.x, 0.4); return; }
        if (Math.abs(h.x - c.x) < 0.35 && Math.abs(h.z - c.z) < 0.2) act(); else go(c.x + 0.25, c.z, 0.1);
      }
    },
    pipes: { // 🔧 turn the 4 valves until every pipe arrow points up (Hard: a valve also turns its right neighbour)
      start: function (M, P, Z) { P.valves = []; for (var k = 0; k < 4; k++) P.valves.push({ x: Z.x - 2.4 + k * 1.6, z: k % 2 ? 1.7 : 0.6, r: 1 + Math.floor(M.rng() * 3), ring: 0 }); P.link = !!M.D.link; P.gate = Z.x + 3.8; },
      step: function (M, P, dt) { P.valves.forEach(function (v) { if (v.ring > 0) v.ring -= dt; }); },
      hit: function (M, P, h, mv) { P.valves.forEach(function (v, k) { if (!hitAt(M, h, mv, v)) return; var turn = function (w) { w.r = (w.r + 1) % 4; w.ring = 0.3; }; turn(v); if (P.link && P.valves[k + 1]) turn(P.valves[k + 1]); M.ev.push({ k: 'valve', v: k });
        if (P.valves.every(function (w) { return w.r === 0; })) puzzleSolved(M); }); },
      wait: function (P, i) { return [P.x - 3.8, 0.3 + i * 0.5]; },
      bot: function (M, P, h, i, go, A) { if (M.heroes.filter(function (o) { return !o.ko && !o.human; })[0] !== h) { go(P.x - 3.8, 0.3 + i * 0.6); return; } var v = P.valves.filter(function (w) { return w.r !== 0; })[0]; if (v) standHit(M, h, i, go, A, v); }
    },
    code: { // 🔢 count the sweets on the shelves → set the 3 vault dials
      start: function (M, P, Z) { var top = M.D.code; P.icons = ['🍬', '🍭', '🍫']; P.want = [0, 1, 2].map(function () { return 1 + Math.floor(M.rng() * top); }); P.dials = [{ x: Z.x - 1.7, z: 1.3, v: 0, ring: 0 }, { x: Z.x, z: 1.3, v: 0, ring: 0 }, { x: Z.x + 1.7, z: 1.3, v: 0, ring: 0 }];
        P.spots = []; P.want.forEach(function (n, k) { for (var j = 0; j < n; j++) P.spots.push({ icon: P.icons[k], x: Z.x - 4.6 + M.rng() * 9.2, y: 1.2 + M.rng() * 1.1 }); }); P.gate = Z.x + 3.8; },
      step: function (M, P, dt) { P.dials.forEach(function (d) { if (d.ring > 0) d.ring -= dt; }); },
      hit: function (M, P, h, mv) { P.dials.forEach(function (d, k) { if (!hitAt(M, h, mv, d)) return; d.v = (d.v + 1) % 10; d.ring = 0.3; M.ev.push({ k: 'dial', d: k, v: d.v }); if (P.dials.every(function (q, j) { return q.v === P.want[j]; })) puzzleSolved(M); }); },
      wait: function (P, i) { return [P.x - 3.6, 0.3 + i * 0.5]; },
      bot: function (M, P, h, i, go, A) { if (M.heroes.filter(function (o) { return !o.ko && !o.human; })[0] !== h) { go(P.x - 3.6, 0.3 + i * 0.6); return; } var k = [0, 1, 2].filter(function (j) { return P.dials[j].v !== P.want[j]; })[0]; if (k != null) standHit(M, h, i, go, A, P.dials[k]); }
    },
    defend: { // 🏭 keep the candy machine safe through 3 waves (a broken machine costs a team comeback)
      start: function (M, P, Z) { M.machine = { x: Z.x + 1.2, z: 0.45, hp: 100, max: 100, broken: false, hitT: 0 }; P.gate = Z.x + 4.4; P.botHelp = true; },
      step: function (M, P, dt) { if (M.machine.hitT > 0) M.machine.hitT -= dt; }
    },
    crank: { // ⚙️ crank the drawbridge down: 👊 the wheel fast — more heroes cranking = faster
      start: function (M, P, Z) { P.wheel = { x: Z.x, z: 1.2 }; P.prog = 0; P.last = {}; P.gate = Z.x + 2.6; P.botHelp = true; },
      step: function (M, P, dt) { if (P.prog > 0 && P.prog < 100) P.prog = Math.max(0, P.prog - M.D.decay * dt); },
      hit: function (M, P, h, mv) { if (!hitAt(M, h, mv, P.wheel, 0.35)) return; P.last[h.i] = M.t; var n = 0; for (var id in P.last) if (M.t - P.last[id] < 0.8) n++;
        P.prog = Math.min(100, P.prog + 6 * (1 + 0.5 * (n - 1))); M.ev.push({ k: 'crank', p: Math.round(P.prog), n: n }); if (P.prog >= 100) puzzleSolved(M); },
      wait: function (P, i) { return [P.wheel.x - 0.75, clamp(P.wheel.z + (i - 1) * 0.3, 0.2, ZD - 0.2)]; },
      bot: function (M, P, h, i, go, A) { var o = { x: P.wheel.x, z: clamp(P.wheel.z + (i - 1) * 0.3, 0.3, ZD - 0.3) }; var sx = o.x - 0.75; if (Math.abs(h.x - sx) < 0.2 && Math.abs(h.z - o.z) < 0.15) { h.face = 1; if (A.t <= 0 && canAct(h)) { A.t = 0.2; press(M, i, 'boop'); } } else go(sx, o.z, 0.1); }
    },
    levers: { // 🕹️ watch the lights, then pull the 4 levers in the same order
      start: function (M, P, Z) { P.bells = [0, 1, 2, 3].map(function (k) { return { x: Z.x - 2.7 + k * 1.8, z: k % 2 ? 1.8 : 0.6 }; }); orderStart(M, P, 4); P.gate = Z.x + 4.0; },
      step: function (M, P, dt) { PZ.bells.step(M, P, dt); },
      hit: function (M, P, h, mv) { PZ.bells.hit(M, P, h, mv); },
      wait: function (P, i) { return [P.x - 3.8, 0.3 + i * 0.5]; },
      bot: orderBot
    },
    torches: { // 🔥 light the 4 torches in the order the banner shows (read it — no need to remember)
      start: function (M, P, Z) { P.bells = [0, 1, 2, 3].map(function (k) { return { x: Z.x - 2.7 + k * 1.8, z: k % 2 ? 1.8 : 0.6 }; }); P.signs = ['🐉', '🦁', '🦅', '🐺']; orderStart(M, P, 4, true); var s = [0, 1, 2, 3]; for (var i = 3; i > 0; i--) { var j = Math.floor(M.rng() * (i + 1)), t = s[i]; s[i] = s[j]; s[j] = t; } P.seq = s; /* each torch once */ P.gate = Z.x + 4.0; },
      step: function (M, P, dt) { if (P.show > 0) P.show -= dt; P.ring = P.ring.map(function (v) { return Math.max(0, v - dt); }); },
      hit: function (M, P, h, mv) { P.bells.forEach(function (b, k) { if (hitAt(M, h, mv, b) && !P.lit[k]) orderHit(M, P, k); }); },
      wait: function (P, i) { return [P.x - 3.8, 0.3 + i * 0.5]; },
      bot: orderBot
    },
    armour: { // 🗝️ smash the suits of armour to find the jail key (some are knights in disguise!) → free the prisoner
      start: function (M, P, Z) { var n = 5, key = Math.floor(M.rng() * n), traps = [], k; while (traps.length < M.D.traps) { k = Math.floor(M.rng() * n); if (k !== key && traps.indexOf(k) < 0) traps.push(k); }
        for (k = 0; k < n; k++) M.props.push({ i: nextId++, x: Z.x - 3.4 + k * 1.6, z: k % 2 ? 1.9 : 0.5, k: 'armour', drop: k === key ? 'key' : traps.indexOf(k) >= 0 ? 'trap' : 'drumstick', hp: 3, hitT: 0, gone: false });
        M.door = { x: Z.x + 4.3, z: 0.35, open: false, t: 0 }; P.gate = Z.x + 3.9; }
    }
  };
  // tale 4 🧟 + tale 5 👾 puzzles
  var CARDS = {
    dmg:    { icon: '💪', name: 'Strong fists', text: '+25% bonk power for everyone', cost: 6, apply: function (M) { M.heroes.forEach(function (h) { h.dmgK = (h.dmgK || 1) * 1.25; }); } },
    hp:     { icon: '❤️', name: 'Big hearts', text: '+25 hearts and a full heal', cost: 6, apply: function (M) { M.heroes.forEach(function (h) { h.maxHp += 25; h.hp = h.maxHp; }); } },
    power:  { icon: '⚡', name: 'Quick power', text: '⚡ bars fill 50% faster', cost: 5, apply: function (M) { M.heroes.forEach(function (h) { h.pwK = (h.pwK || 1) * 1.5; }); } },
    shield: { icon: '🛡️', name: 'Shields', text: 'every hero blocks the next 3 hits', cost: 4, apply: function (M) { M.heroes.forEach(function (h) { h.shield = 3; }); } },
    speed:  { icon: '👟', name: 'Fast feet', text: 'everyone runs 15% faster', cost: 4, apply: function (M) { M.heroes.forEach(function (h) { h.spdK = (h.spdK || 1) * 1.15; }); } },
    gate:   { icon: '🧱', name: 'Stronger gate', text: 'gate +50 and fully repaired', cost: 5, apply: function (M) { if (M.machine) { M.machine.max += 50; M.machine.hp = M.machine.max; } } },
    cannon: { icon: '💣', name: 'Fast cannon', text: 'the town cannon reloads twice as fast', cost: 5, apply: function (M) { if (M.puzzle && M.puzzle.cannon) M.puzzle.cannon.reload *= 0.5; } }
  };
  var CARD_KEYS = Object.keys(CARDS);
  var OUTBREAK = [   // 10 waves; a mini-boss after 3, 6 and 9; Megamaw after 10
    ['blob', 'blob', 'blob'], ['blob', 'blob', 'spiky', 'blob'], ['blob', 'spiky', 'flapper', 'blob'],
    ['spiky', 'spiky', 'flapper', 'blob', 'blob'], ['stomper', 'blob', 'blob', 'blob'], ['flapper', 'flapper', 'spiky', 'stomper'],
    ['stomper', 'stomper', 'blob', 'blob', 'spiky'], ['flapper', 'flapper', 'spiky', 'spiky', 'blob', 'blob'], ['stomper', 'stomper', 'spiky', 'spiky', 'flapper'],
    ['stomper', 'spiky', 'spiky', 'flapper', 'flapper', 'blob', 'blob', 'blob']];
  var MINIS = { 3: 'spikeback', 6: 'gloopula', 9: 'thunderhoof' };
  function nearObj(h, o, dx, dz) { return Math.abs(o.x - h.x) < dx && Math.abs(o.z - h.z) < dz; }
  function outbreakRest(M, P) { P.state = 'rest'; P.restT = M.heroes.some(function (h) { return h.human; }) ? 25 : 3; P.cards = []; var pool = CARD_KEYS.slice(); while (P.cards.length < 3) P.cards.push(pool.splice(Math.floor(M.rng() * pool.length), 1)[0]); P.bought = false;
    M.heroes.forEach(function (h) { if (!h.ko) h.hp = Math.min(h.maxHp, h.hp + 40); }); M.ev.push({ k: 'rest', wave: P.wave, cards: P.cards.slice(), coins: M.coins }); }
  function outbreakNext(M, P) {
    if (P.wave >= P.of) { P.state = 'final'; var B = spawnFoe(M, 'megamaw', M.cam + M.view / 2 + 1, ZD / 2); M.bosses = [B]; M.ev.push({ k: 'boss', name: B.F.name }); return; }
    P.wave++; P.state = 'wave'; var list = OUTBREAK[P.wave - 1], n = Math.max(2, Math.round(list.length * M.D.count * (0.6 + 0.2 * M.heroes.length))); P.queue = []; for (var k = 0; k < n; k++) P.queue.push(list[k % list.length]); P.spawnT = 0.3;
    if (P.wave === 4) { P.cannon.on = true; M.ev.push({ k: 'cannonOn' }); }
    M.ev.push({ k: 'wave', n: n, i: P.wave - 1, of: P.of, outbreak: true });
  }
  function buyCard(M, key) { var P = M.puzzle; if (!P || P.k !== 'outbreak' || P.state !== 'rest' || P.bought || P.cards.indexOf(key) < 0) return false; var C = CARDS[key]; if (M.coins < C.cost) { M.ev.push({ k: 'poor', card: key }); return false; }
    M.coins -= C.cost; C.apply(M); P.bought = key; M.ev.push({ k: 'card', card: key }); return true; }
  function restReady(M) { var P = M.puzzle; if (P && P.k === 'outbreak' && P.state === 'rest') { P.restT = 0; return true; } return false; }
  PZ.fuel = { // ⛽ find 3 fuel cans and carry them to the bus (one at a time)
    start: function (M, P, Z) { P.bus = { x: Z.x + 1.6, z: 0.5 }; P.got = 0; P.need = 3; P.gate = Z.x + 4.0; P.trickT = 6;
      M.picks.push({ i: nextId++, x: Z.x - 3.6, z: 2.0, k: 'fuel', t: 0 }); M.picks.push({ i: nextId++, x: Z.x + 3.3, z: 1.9, k: 'fuel', t: 0 });
      M.props.push({ i: nextId++, x: Z.x - 1.4, z: 1.3, k: 'car', drop: 'fuel', hp: 2, hitT: 0, gone: false }); },
    step: function (M, P, dt) { if (M.D.lives < 0) return; P.trickT -= dt; if (P.trickT <= 0) { P.trickT = 7 / M.D.aggr; if (M.foes.filter(function (f) { return !f.dead; }).length < 2) { spawnFoe(M, M.rng() < 0.5 ? 'zombie' : 'runner', M.cam + M.view / 2 + 0.8, 0.4 + M.rng() * 1.6); } } },
    press: function (M, P, h) { if (h.carry !== 'fuel' || !nearObj(h, P.bus, 1.4, 0.8)) return false; h.carry = null; P.got++; M.score += 100; M.ev.push({ k: 'fuelIn', got: P.got, need: P.need }); if (P.got >= P.need) puzzleSolved(M); return true; },
    wait: function (P, i) { return [P.x - 3.4, 0.3 + i * 0.5]; },
    bot: function (M, P, h, i, go, A) {
      if (h.carry === 'fuel') { if (nearObj(h, P.bus, 0.5, 0.25)) { if (A.t <= 0 && canAct(h)) { A.t = 0.3; press(M, i, 'boop'); } } else go(P.bus.x - 0.3, P.bus.z, 0.1); return; }
      var can = M.picks.filter(function (p) { return p.k === 'fuel' && !(p.pop > 0); })[0]; if (can && !M.heroes.some(function (o) { return o !== h && o.carry === 'fuel'; })) { go(can.x, can.z, 0.1); return; }
      var car = M.props.filter(function (p) { return !p.gone && p.drop === 'fuel'; })[0]; if (car) { standHit(M, h, i, go, A, car, 0.8); return; }
      go(P.x - 3, 0.3 + i * 0.5); }
  };
  PZ.radio = { // 📻 read the 3 torn posters (🟥 first, 🟩 second, 🟦 third digit) and tune the radio wheels
    start: function (M, P, Z) { P.want = [0, 1, 2].map(function () { return 1 + Math.floor(M.rng() * 9); }); P.wheels = [{ x: Z.x - 1.5, z: 1.3, v: 0, ring: 0 }, { x: Z.x, z: 1.3, v: 0, ring: 0 }, { x: Z.x + 1.5, z: 1.3, v: 0, ring: 0 }];
      var xs = [Z.x - 4.4, Z.x - 2.6, Z.x + 2.8, Z.x + 4.4]; for (var i = 3; i > 0; i--) { var j = Math.floor(M.rng() * (i + 1)), t = xs[i]; xs[i] = xs[j]; xs[j] = t; }
      P.posters = [0, 1, 2].map(function (k) { return { x: xs[k], y: 1.3 + (k % 2) * 0.5, k: k }; }); P.gate = Z.x + 3.8; },
    step: function (M, P, dt) { P.wheels.forEach(function (d) { if (d.ring > 0) d.ring -= dt; }); },
    hit: function (M, P, h, mv) { P.wheels.forEach(function (d, k) { if (!hitAt(M, h, mv, d)) return; d.v = (d.v + 1) % 10; d.ring = 0.3; M.ev.push({ k: 'dial', d: k, v: d.v }); if (P.wheels.every(function (q, j) { return q.v === P.want[j]; })) puzzleSolved(M); }); },
    wait: function (P, i) { return [P.x - 3.6, 0.3 + i * 0.5]; },
    bot: function (M, P, h, i, go, A) { if (M.heroes.filter(function (o) { return !o.ko && !o.human; })[0] !== h) { go(P.x - 3.6, 0.3 + i * 0.6); return; } var k = [0, 1, 2].filter(function (j) { return P.wheels[j].v !== P.want[j]; })[0]; if (k != null) standHit(M, h, i, go, A, P.wheels[k]); }
  };
  PZ.dark = { // 🔦 a dark alley: the safe stones only show near the heroes' lights — step on goo and you slide back
    start: function (M, P, Z) { PZ.steps.start(M, P, Z); P.dark = true; P.show = 0; },
    step: function (M, P, dt) { PZ.steps.step(M, P, dt); P.show = 0; },
    wait: function (P, i) { return [P.x0 - 1.1 - i * 0.3, 0.3 + i * 0.5]; },
    bot: function (M, P, h, i, go) { PZ.steps.bot(M, P, h, i, go); }
  };
  PZ.barricade = { // 🧱 hold the barricade until the shelter door opens — 💥 bonk it to patch it up
    start: function (M, P, Z) { M.machine = { x: Z.x + 2.4, z: ZD / 2, hp: 130, max: 130, kind: 'barricade', broken: false, hitT: 0 }; P.time = { easy: 25, normal: 32, hard: 40, skull: 45 }[M.diff]; P.left = P.time; P.spawnT = 1; P.gate = Z.x + 2.0; P.botHelp = true; },
    step: function (M, P, dt) { if (M.machine.hitT > 0) M.machine.hitT -= dt; P.left -= dt; P.spawnT -= dt;
      if (P.spawnT <= 0) { P.spawnT = 2.4 / M.D.count; if (M.foes.filter(function (f) { return !f.dead; }).length < 3 + Math.round(M.D.count * 2)) { var r = M.rng(); spawnFoe(M, r < 0.5 ? 'zombie' : r < 0.85 ? 'runner' : 'bloater', M.cam + M.view / 2 + 0.8, 0.3 + M.rng() * (ZD - 0.6)); } }
      if (P.left <= 0) { M.foes.forEach(function (f) { if (!f.dead) { f.hp = 0; f.dead = 1; f.launched = true; f.vy = 4; f.kbx = 3; } }); M.ev.push({ k: 'flee' }); puzzleSolved(M); } },
    press: function (M, P, h, a) { if (a !== 'bonk' || !nearObj(h, M.machine, 1.2, 9)) return false; M.machine.hp = Math.min(M.machine.max, M.machine.hp + 6); M.machine.hitT = 0.15; M.ev.push({ k: 'fix', hp: M.machine.hp }); return true; },
    wait: function (P, i) { return [P.x, 0.3 + i * 0.5]; }
  };
  PZ.outbreak = { // 👾 defend the town gate: 10 waves, 3 mini-bosses, Megamaw — rest stops in between (heal, 1 upgrade card, fix the gate)
    start: function (M, P, Z) { P.wave = 0; P.of = 10; M.coins = M.coins || 0; M.machine = { x: Z.x - M.view / 2 + 0.9, z: ZD / 2, hp: 150, max: 150, kind: 'gate', broken: false, hitT: 0 };
      P.cannon = { x: M.machine.x + 1.3, z: 0.25, aim: ZD / 2, t: 0, cd: 0, reload: 1.6, on: false }; P.gate = null; P.state = 'ready'; P.restT = 3; P.cards = []; },
    step: function (M, P, dt) {
      if (M.machine.hitT > 0) M.machine.hitT -= dt;
      var C = P.cannon; C.t += dt; C.aim = ZD / 2 + Math.sin(C.t * 1.6) * (ZD / 2 - 0.15); if (C.cd > 0) C.cd -= dt;
      var alive = M.foes.filter(function (f) { return !f.dead; }).length;
      if (P.state === 'ready' || P.state === 'rest') { P.restT -= dt; if (P.restT <= 0) { if (P.state === 'rest' && !P.bought && !M.heroes.some(function (h) { return h.human; })) { var ok = P.cards.filter(function (k) { return CARDS[k].cost <= M.coins; })[0]; if (ok) buyCard(M, ok); } outbreakNext(M, P); } return; }
      if (P.state === 'wave') { P.spawnT -= dt; if (P.queue.length && P.spawnT <= 0) { P.spawnT = 2.6; for (var g = 0; g < 3 && P.queue.length; g++) spawnFoe(M, P.queue.shift(), M.cam + M.view / 2 + 0.6 + g * 0.5, 0.3 + (g + M.rng()) * (ZD - 0.6) / 3); }
        if (!P.queue.length && alive === 0) { if (MINIS[P.wave]) { P.state = 'mini'; var B = spawnFoe(M, MINIS[P.wave], M.cam + M.view / 2 + 0.8, ZD / 2); M.bosses = [B]; M.ev.push({ k: 'boss', name: B.F.name, mini: true }); } else outbreakRest(M, P); } return; }
      if (P.state === 'mini' && alive === 0) { M.bosses = []; outbreakRest(M, P); return; }
      if (P.state === 'final' && alive === 0 && M.bosses.length && M.bosses.every(function (b) { return b.dead; })) puzzleSolved(M);
    },
    press: function (M, P, h, a) { var C = P.cannon;
      if (C.on && nearObj(h, C, 0.9, 0.7)) { if (C.cd > 0) return true; C.cd = C.reload; M.shots.push({ i: nextId++, k: '💣', kind: 'roll', x: C.x + 0.6, z: C.aim, y: 0.6, vx: 10, vy: 0, dmg: 35, life: 1.6, t: 0, hero: true, owner: h, hitSet: {}, big: true }); M.ev.push({ k: 'cannon', z: C.aim }); return true; }
      if (P.state === 'rest' && a === 'bonk' && nearObj(h, M.machine, 1.2, 9) && M.machine.hp < M.machine.max) { M.machine.hp = Math.min(M.machine.max, M.machine.hp + 8); M.machine.hitT = 0.15; M.ev.push({ k: 'fix', hp: M.machine.hp }); return true; }
      return false; },
    wait: function (P, i) { return [P.x - 1.5 + (i % 2) * 1.2, 0.4 + i * 0.5]; }
  };
  PZ.shells = { // 🐚 open / close the 5 shells to match the big clam's pattern (Hard: a shell also flips its right neighbour)
    start: function (M, P, Z) { P.shells = []; P.target = []; for (var k = 0; k < 5; k++) { P.shells.push({ x: Z.x - 3.2 + k * 1.6, z: k % 2 ? 1.75 : 0.55, open: M.rng() < 0.5, ring: 0 }); P.target.push(M.rng() < 0.5); }
      if (P.shells.every(function (s, k) { return s.open === P.target[k]; })) P.shells[2].open = !P.shells[2].open; P.link = !!M.D.link; P.gate = Z.x + 4.0; },
    step: function (M, P, dt) { P.shells.forEach(function (s) { if (s.ring > 0) s.ring -= dt; }); },
    hit: function (M, P, h, mv) { P.shells.forEach(function (s, k) { if (!hitAt(M, h, mv, s)) return; var flip = function (q) { q.open = !q.open; q.ring = 0.3; }; flip(s); if (P.link && P.shells[k + 1]) flip(P.shells[k + 1]); M.ev.push({ k: 'shell', s: k });
      if (P.shells.every(function (q, j) { return q.open === P.target[j]; })) puzzleSolved(M); }); },
    wait: function (P, i) { return [P.x - 4.0, 0.3 + i * 0.5]; },
    bot: function (M, P, h, i, go, A) { if (M.heroes.filter(function (o) { return !o.ko && !o.human; })[0] !== h) { go(P.x - 4, 0.3 + i * 0.6); return; } var s = P.shells.filter(function (q, j) { return q.open !== P.target[j]; })[0]; if (s) standHit(M, h, i, go, A, s); }
  };
  PZ.currents = { // 🌊 swim across the current lanes — each lane calms down in turn (a wave you can ride); a running current pushes you back
    start: function (M, P, Z) { P.cols = 6; P.rows = 3; P.cw = 1.15; P.x0 = Z.x - P.cols * P.cw / 2; P.period = M.D.period; P.gate = P.x0 + P.cols * P.cw + 0.6; P.end = P.x0 + P.cols * P.cw + 0.1; },
    step: function (M, P, dt) {
      M.heroes.forEach(function (h) { if (h.ko) return; var c = Math.floor((h.x - P.x0) / P.cw); if (c < 0) return; if (c >= P.cols) { if (h.x > P.end) puzzleSolved(M); return; }
        if (!currentCalm(P, c)) { h.x -= 4.2 * dt; if (!(h.swirl > 0)) { h.swirl = 0.8; M.ev.push({ k: 'swirl', h: h.seat }); } } if (h.swirl > 0) h.swirl -= dt; }); },
    wait: function (P, i) { return [P.x0 - 1.1 - i * 0.3, 0.3 + i * 0.5]; },
    bot: function (M, P, h, i, go) { var c = Math.floor((h.x - P.x0) / P.cw); if (c >= P.cols) { go(P.end + 0.8, h.z); return; }
      var here = c < 0 || currentCalm(P, c), next = currentCalm(P, Math.min(P.cols - 1, c + 1), 0.15);
      if (here && next) go(P.end + 0.8, ZD / 2, 0.1); else if (c < 0) go(P.x0 - 0.35, ZD / 2, 0.1); }
  };
  function currentCalm(P, c, ahead) { return (((P.t + (ahead || 0)) / P.period - c * 0.17) % 1 + 1) % 1 < 0.5; }
  PZ.pearls = { // 🦪 pearl memory: open two clams — matching pearls stay open
    start: function (M, P, Z) { var cols = [0, 0, 1, 1, 2, 2]; for (var i = 5; i > 0; i--) { var j = Math.floor(M.rng() * (i + 1)), t = cols[i]; cols[i] = cols[j]; cols[j] = t; }
      P.clams = cols.map(function (cl, k) { return { x: Z.x - 2.6 + (k % 3) * 2.6, z: k < 3 ? 0.5 : 1.8, c: cl, open: false, done: false }; }); P.openNow = []; P.closeT = 0; P.gate = Z.x + 4.0; P.seen = {}; },
    step: function (M, P, dt) { if (P.closeT > 0) { P.closeT -= dt; if (P.closeT <= 0) { P.openNow.forEach(function (q) { q.open = false; }); P.openNow = []; } } },
    hit: function (M, P, h, mv) { if (P.closeT > 0) return; P.clams.forEach(function (q, k) { if (q.done || q.open || !hitAt(M, h, mv, q) || P.openNow.length >= 2) return; q.open = true; P.openNow.push(q); P.seen[k] = q.c; M.ev.push({ k: 'clam', c: q.c });
      if (P.openNow.length === 2) { var a = P.openNow[0], b = P.openNow[1]; if (a.c === b.c) { a.done = b.done = true; P.openNow = []; M.ev.push({ k: 'pair' }); if (P.clams.every(function (z) { return z.done; })) puzzleSolved(M); } else { P.closeT = 1.1; M.ev.push({ k: 'wrong', p: 'pearls' }); } } }); },
    wait: function (P, i) { return [P.x - 4.0, 0.3 + i * 0.5]; },
    bot: function (M, P, h, i, go, A) { if (M.heroes.filter(function (o) { return !o.ko && !o.human; })[0] !== h || P.closeT > 0) { go(P.x - 4, 0.3 + i * 0.6); return; }
      var t; if (P.openNow.length === 1) { var o = P.openNow[0]; t = P.clams.filter(function (q) { return q !== o && !q.done && q.c === o.c; })[0]; } else t = P.clams.filter(function (q) { return !q.done; })[0]; if (t) standHit(M, h, i, go, A, t); }
  };
  PZ.sonar = { // 📡 ping the sonar to see where 3 treasures are buried, then dig them up (👊 on the spot)
    start: function (M, P, Z) { P.station = { x: Z.x - 3.6, z: 1.2 }; P.spots = []; while (P.spots.length < 3) { var s = { x: Z.x - 1.8 + M.rng() * 5.6, z: 0.3 + M.rng() * (ZD - 0.6), found: false }; if (P.spots.every(function (q) { return Math.hypot(q.x - s.x, q.z - s.z) > 1.4; })) P.spots.push(s); }
      P.reveal = 0; P.cd = 0; P.got = 0; P.gate = Z.x + 4.2; P.pings = 0; },
    step: function (M, P, dt) { if (P.reveal > 0) P.reveal -= dt; if (P.cd > 0) P.cd -= dt; },
    hit: function (M, P, h, mv) { if (hitAt(M, h, mv, P.station, 0.3) && P.cd <= 0) { P.reveal = 3.5; P.cd = 1.2; P.pings++; M.ev.push({ k: 'ping' }); } },
    press: function (M, P, h) { var s = P.spots.filter(function (q) { return !q.found && Math.abs(q.x - h.x) < 0.65 && Math.abs(q.z - h.z) < 0.5; })[0]; if (!s) return false; s.found = true; P.got++; M.score += 150; M.ev.push({ k: 'dug', got: P.got, x: s.x, z: s.z }); if (P.got >= 3) puzzleSolved(M); return true; },
    wait: function (P, i) { return [P.station.x + 0.4, 0.3 + i * 0.5]; },
    bot: function (M, P, h, i, go, A) { if (M.heroes.filter(function (o) { return !o.ko && !o.human; })[0] !== h) { go(P.station.x + 0.3, 0.3 + i * 0.6); return; }
      if (!P.pings) { standHit(M, h, i, go, A, P.station); return; } var s = P.spots.filter(function (q) { return !q.found; })[0]; if (!s) return; if (Math.abs(h.x - s.x) < 0.3 && Math.abs(h.z - s.z) < 0.2) { if (A.t <= 0 && canAct(h)) { A.t = 0.4; press(M, i, 'boop'); } } else go(s.x, s.z, 0.1); }
  };
  PZ.wedding = { // 💍 the wedding: shout "We object!", win the Trial of Strength (3 rounds vs Captain Barnacle, then the royal), then choose the ending
    start: function (M, P, Z) { P.altar = { x: Z.x + Math.min(4, M.view / 2 - 0.9), z: 0.5 }; P.stage = 'walk'; P.round = 0; P.gate = P.altar.x - 1.0; P.royal = M.royal || 'coralline'; P.choiceT = 0; },
    step: function (M, P, dt) {
      var alive = M.foes.filter(function (f) { return !f.dead; }).length;
      if (P.stage === 'walk' && M.heroes.some(function (h) { return !h.ko && h.x > P.altar.x - 3.2; })) { P.stage = 'object'; P.t0 = M.t; M.ev.push({ k: 'wedding', royal: FOES[P.royal].name, who: M.captive }); }
      if (P.stage === 'object' && !M.heroes.some(function (h) { return h.human; }) && M.t - P.t0 > 1.5) objectNow(M, P);
      if (P.stage === 'trial' && alive === 0) { if (P.round < 3) nextRound(M, P); else { P.stage = 'royal'; var B = spawnFoe(M, P.royal, P.altar.x - 1, ZD * 0.55); B.inView = true; M.bosses = [B]; M.ev.push({ k: 'boss', name: B.F.name }); } }
      if (P.stage === 'royal' && alive === 0 && M.bosses.length && M.bosses.every(function (b) { return b.dead; })) { P.stage = 'choice'; P.choiceT = M.heroes.some(function (h) { return h.human; }) ? 999 : 1.5; M.ev.push({ k: 'choice', royal: FOES[P.royal].name, who: M.captive }); }
      if (P.stage === 'choice') { P.choiceT -= dt; if (P.choiceT <= 0) chooseEnding(M, 'home'); }
    },
    press: function (M, P, h) { if (P.stage !== 'object') return false; objectNow(M, P); return true; },
    wait: function (P, i) { return [P.altar.x - 2.6, 0.3 + i * 0.5]; }
  };
  function objectNow(M, P) { P.stage = 'trial'; M.ev.push({ k: 'object' }); nextRound(M, P); }
  function nextRound(M, P) { P.round++; M.heroes.forEach(function (h) { if (!h.ko) h.hp = Math.min(h.maxHp, h.hp + 30); });
    var B = spawnFoe(M, 'barnacle', P.altar.x - 1.2, ZD * 0.55); B.inView = true; B.hp = B.maxHp = Math.round(B.maxHp * [0.55, 0.75, 1][P.round - 1]); B.rage = [1, 1.1, 1.25][P.round - 1]; B.clashMax = P.round === 3 ? 1 : 0; M.bosses = [B]; M.ev.push({ k: 'trialRound', round: P.round, name: B.F.name }); }
  function chooseEnding(M, how) { var P = M.puzzle; if (!P || P.k !== 'wedding' || P.stage !== 'choice') return false; M.ending = how === 'wedding' ? 'wedding' : 'home'; P.stage = 'done'; M.ev.push({ k: 'ending', how: M.ending, who: M.captive, royal: FOES[P.royal].name }); puzzleSolved(M); M.done = true; M.win = true; M.ev.push({ k: 'win' }); return true; }
  function startPuzzle(M, Z) {
    var P = { k: Z.puzzle, x: Z.x, done: false, t: 0 }; M.puzzle = P; PZ[P.k].start(M, P, Z); M.ev.push({ k: 'puzzle', p: P.k });
  }
  function puzzleSolved(M) {
    var P = M.puzzle; if (!P || P.done) return; P.done = true; M.stats.puzzles++; M.score += 500; M.ev.push({ k: 'solved', p: P.k });
    if (P.k === 'outbreak') { M.done = true; M.win = true; M.ev.push({ k: 'saved' }); M.ev.push({ k: 'win' }); }
    if (P.k === 'armour' && M.door) { M.door.open = true; var h = mkHero(M, { name: M.prisoner, human: false, joined: true }, M.heroes.length, M.door.x - 0.3, M.door.z + 0.3); h.safe = 1.5; h.face = -1; M.heroes.push(h); M.ev.push({ k: 'join', name: M.prisoner, h: h.seat }); }
  }
  // the order the bells / levers flash (client shows it): -1 = gap
  function orderShowing(P) { if (!P || !P.seq || P.noShow || P.done) return -1; var T = P.t, per = 0.75, lead = 1.0; var u = (T - lead) % (P.seq.length * per + 2.2); if (P.pos > 0 || T < lead) return -1; var k = Math.floor(u / per); return k < P.seq.length && (u % per) < 0.55 ? P.seq[k] : -1; }

  // ---------- controls ----------
  function setCtrl(M, i, l, r, u, d) { var h = M.heroes[i]; if (!h) return; if (l && !h.ctrl.l) tapDir(M, h, -1); if (r && !h.ctrl.r) tapDir(M, h, 1); h.ctrl.l = !!l; h.ctrl.r = !!r; h.ctrl.u = !!u; h.ctrl.d = !!d; }
  // held buttons: block = both hit buttons (or the 🛡️ button) · g = the bonk button (hold = 🔨 guard breaker)
  function setHold(M, i, block, g) { var h = M.heroes[i]; if (!h) return; h.hold.block = !!block; h.hold.g = !!g; }
  // → → / ← ← = 💨 dash that way (1.2 s cooldown)
  function tapDir(M, h, dir) { if (h.lastTap && h.lastTap.d === dir && M.t - h.lastTap.t < TAP2) { h.lastTap = null; tryDash(M, h, dir); } else h.lastTap = { d: dir, t: M.t }; }
  function tryDash(M, h, dir) {
    if (M.clash || h.ko || h.blk || !onGround(h) || !canAct(h)) return false;
    if (h.dashCd > 0) { M.ev.push({ k: 'dashWait', h: h.seat }); return false; }
    h.dash = { t: 0, dir: dir }; h.face = dir; h.dashCd = DASH_CD; h.st.dashes++; M.ev.push({ k: 'dash', h: h.seat, x: h.x, z: h.z, dir: dir }); return true;
  }
  function dash(M, i, dir) { var h = M.heroes[i]; return h ? tryDash(M, h, dir) : false; }
  function canAct(p) { return !p.act && p.stun <= 0 && p.down <= 0 && !p.launched && !p.ko && !p.grab && !p.grabbedBy; }
  function onGround(p) { return p.y <= 0.0001 && p.vy <= 0; }
  function foeById(M, id) { for (var k = 0; k < M.foes.length; k++) if (M.foes[k].i === id) return M.foes[k]; return null; }
  function press(M, i, a) {
    var h = M.heroes[i]; if (!h || h.ko || M.done) return;
    if (M.clash) { if (a === 'boop' || a === 'bonk' || a === 'power' || a === 'jump') clashKey(M, i, a); return; }
    if (a === 'grab') { doGrab(M, h); return; }
    if (a === 'block') { h.blockTap = 0.35; h.pend = null; return; }
    // ⚡ counter: right after a block, boop / bonk hits straight back (no waiting)
    if (h.ctr && h.ctr.t > 0 && (a === 'boop' || a === 'bonk') && !h.launched && h.down <= 0 && h.stun <= 0) { counterMove(M, h, a); return; }
    // two hit buttons together: 👊+💥 = 🛡️ block · 💥+🌀 or 👊+🌀 = 🤼 grapple (a single press waits a blink for its partner)
    if (h.human && (a === 'boop' || a === 'bonk' || a === 'power')) {
      if (h.pend && h.pend.a !== a) { var pair = [h.pend.a, a].sort().join('+'); h.pend = null; if (pair === 'bonk+boop') { h.blockTap = 0.35; return; } doGrab(M, h); return; }
      if (!h.pend) { h.pend = { a: a, t: CHORD }; return; }
    }
    doPress(M, i, a);
  }
  function doPress(M, i, a) {
    var h = M.heroes[i]; if (!h || h.ko || M.done) return;
    if (h.blk) return;
    if (!canAct(h)) { if (h.act && (a === 'boop' || a === 'bonk')) h.buf = { a: a, t: 0.22 }; return; }
    if (a === 'jump') { if (onGround(h)) { h.vy = 7.6; h.dash = null; M.ev.push({ k: 'jump', h: i }); } return; }
    if (a === 'power') { if (h.power >= 100) { h.power = 0; h.dash = null; startAct(M, h, 'power'); } else M.ev.push({ k: 'nopower', h: i }); return; }
    var air = !onGround(h), P = M.puzzle;
    if (!air && (a === 'boop' || a === 'bonk') && P && !P.done && PZ[P.k].press && PZ[P.k].press(M, P, h, a)) { startAct(M, h, 'toss'); h.act.noThrow = true; return; }
    if (!air && !h.item && (a === 'boop' || a === 'bonk')) { var pk = nearPick(M, h, true); if (pk) { takePick(M, h, pk); return; } }
    if (h.item && (PICKS[h.item].weapon || PICKS[h.item].light) && (a === 'boop' || a === 'bonk')) { startAct(M, h, 'toss'); return; }
    if (h.dash && !air && (a === 'boop' || a === 'bonk')) { h.combo.n = 0; startAct(M, h, a === 'boop' ? 'dboop' : 'dbonk'); return; }   // 💨 dash attack
    if (a === 'boop') {
      if (air) return startAct(M, h, 'jboop');
      var k = h.combo.t > 0 && h.combo.n === 1 ? 'boop2' : h.combo.t > 0 && h.combo.n >= 2 ? 'finish' : 'boop';
      h.combo.n = k === 'boop' ? 1 : k === 'boop2' ? 2 : 0; h.combo.t = 0; startAct(M, h, k); return;
    }
    if (a === 'bonk') { h.combo.n = 0; startAct(M, h, air ? 'jbonk' : 'bonk'); }
  }
  function startAct(M, p, k) { p.act = { k: k, t: 0, hit: false, done: {} }; if (k === 'power') p.safe = Math.max(p.safe, 0.5); if (p.hero && !(HMOVES[k] && HMOVES[k].keep)) p.dash = null; M.ev.push({ k: 'swing', who: p.i, move: k }); }
  // ⚡ counter: hop in on the baddie whose hit you just blocked
  function counterMove(M, h, a) {
    var f = foeById(M, h.ctr.f), n = h.ctr.n; h.ctr = null; h.blk = false; h.blockTap = 0; h.pend = null; h.act = null; h.dash = null;
    if (!f || f.dead) { doPress(M, M.heroes.indexOf(h), a); return; }
    h.face = sgn(f.x - h.x) || h.face; var gap = 0.8 * (1 + 0.3 * ((f.big || 1) - 1)), tx = f.x - h.face * gap;
    if (Math.abs(tx - h.x) < 1.8) h.x = tx; h.z += (f.z - h.z) * 0.8;
    startAct(M, h, a === 'boop' ? 'cboop' : 'cbonk'); h.act.ctrN = n; h.act.tgt = f.i; h.st.counters++;
    M.ev.push({ k: 'counter', h: h.seat, n: n + 1, x: f.x, z: f.z });
  }
  // 🤼 grapple the baddie in front (bosses only while dizzy from a 🔨 guard break)
  function grabbable(h, f) { return !f.dead && !f.launched && f.down <= 0 && !f.grabbedBy && f.y < 0.3 && (!f.boss || f.dizzy > 0) && inFront(h, f, 1.1 * (f.big > 1 ? 1.2 : 1), 0.45); }
  function doGrab(M, h) {
    if (h.ko || h.blk || !canAct(h) || !onGround(h)) return false; h.dash = null; h.pend = null;
    var tgt = M.foes.filter(function (f) { return grabbable(h, f); })[0];
    if (!tgt) { startAct(M, h, 'grab'); h.act.noThrow = true; M.ev.push({ k: 'grabMiss', h: h.seat }); return false; }
    var k = GRAB_KEYS[Math.floor(M.rng() * GRAB_KEYS.length)], G = GRABS[k];
    h.grab = { k: k, t: 0, imp: G.imp, dur: G.dur, v: tgt.i, done: false }; h.safe = Math.max(h.safe, G.dur + 0.1); h.st.grabs++;
    tgt.grabbedBy = h.i; tgt.act = null; tgt.stun = 0; tgt.ai.spec = null; tgt.guarding = 0; tgt.kbx = 0;
    M.ev.push({ k: 'grab', h: h.seat, type: k, name: G.name, icon: G.icon, x: tgt.x, z: tgt.z }); return true;
  }
  function grabStep(M, h, dt) {
    var g = h.grab, f = foeById(M, g.v); g.t += dt;
    if (!g.done) {
      if (!f || (f.dead && !f.launched)) { h.grab = null; if (f) f.grabbedBy = null; return; }
      f.x = h.x + h.face * 0.62; f.z = h.z; f.y = 0; f.vy = 0; f.kbx = 0; f.face = -h.face;
      if (g.t >= g.imp) { g.done = true; f.grabbedBy = null; var G = GRABS[g.k];
        f.x = h.x + (G.land === 'behind' ? -0.8 : 0.8) * h.face; if (f.boss) f.poise = Math.ceil((f.poise + 1) / 3) * 3 - 1;
        var dmg = Math.round(G.dmg * 1.25 * (h.dmgK || 1) * (h.boost > 0 ? 1.5 : 1));
        if (hurt(M, f, h, dmg, G.land === 'toss' ? 7 : 2.6, true, 0, 'grab')) { h.st.hits++; M.stats.hits++; h.power = Math.min(100, h.power + 14 * (h.pwK || 1)); }
        if (f.launched) { if (G.land === 'up') f.vy = 9; if (G.land === 'toss') f.kbx = h.face * 7; if (G.land === 'behind') f.kbx = -h.face * 1.8; f.thrown = { by: h, t: 0.9, hit: {} }; }
        M.ev.push({ k: 'slam', h: h.seat, type: g.k, name: G.name, dmg: dmg, x: f.x, z: f.z }); }
    }
    if (g.t >= g.dur) h.grab = null;
  }

  // ---------- pickups ----------
  function nearPick(M, h, weaponOnly) {
    for (var k = 0; k < M.picks.length; k++) { var p = M.picks[k], P = PICKS[p.k]; if (weaponOnly && !(P.weapon || P.melee || P.light)) continue; if (Math.abs(p.x - h.x) < 0.75 && Math.abs(p.z - h.z) < 0.45) return p; }
    return null;
  }
  function takePick(M, h, p) {
    var P = PICKS[p.k]; M.picks.splice(M.picks.indexOf(p), 1); M.stats.picks++;
    if (P.heal) h.hp = Math.min(h.maxHp, h.hp + P.heal);
    if (P.air) h.air = Math.min(100, (h.air || 0) + P.air);
    if (P.boost) { h.boost = P.boost; h.power = Math.min(100, h.power + 50); }
    if (P.weapon) h.item = p.k;
    if (P.melee) { h.item = p.k; h.uses = P.melee.uses; }
    if (P.light) { h.item = p.k; h.uses = P.light; }
    if (p.k === 'fuel') h.carry = 'fuel';
    if (P.armour) h.shield = P.armour;
    if (P.ride) h.ride = P.ride;
    if (p.k === 'clue' && M.clues) { M.clues.got++; if (M.puzzle && M.puzzle.k === 'clues' && M.clues.got >= M.clues.need) puzzleSolved(M); }
    if (p.k === 'key' && M.puzzle && M.puzzle.k === 'armour') puzzleSolved(M);
    if (P.secret) { M.found++; M.foundIn.push(M.mapI); M.score += 300; }
    M.ev.push({ k: 'pick', h: h.seat, item: p.k, x: p.x, z: p.z });
  }

  // ---------- hits ----------
  function hurt(M, v, from, dmg, kb, knock, stun, kind) {
    if (v.ko || v.dead || v.safe > 0 || (v.hero && v.out > 0) || v.grabbedBy) return false;
    if (v.hero && v.blk && from && kind !== 'pound' && (sgn(from.x - v.x) === v.face || Math.abs(from.x - v.x) < 0.2)) return blockHit(M, v, from, Math.round(dmg * M.D.edmg), knock);
    if (v.hero) { dmg = Math.round(dmg * M.D.edmg); if (v.shield > 0) { v.shield--; v.hitFlash = 0.1; M.ev.push({ k: 'blocked', h: v.seat, left: v.shield, x: v.x, z: v.z }); return true; } if (v.carry === 'fuel') M.picks.push({ i: nextId++, x: v.x, z: v.z, k: 'fuel', t: 0, pop: 0.6 }); v.carry = null; }
    v.hp -= dmg; v.hitFlash = 0.12; var dir = from ? sgn(v.x - from.x) || 1 : -v.face;
    if (v.foe) { v.barT = 3; v.guarding = 0; }
    if (v.foe && v.boss && v.hp > 0 && v.clashes < v.clashMax && !M.clash) { var th = v.hp / v.maxHp; if ((th < 0.66 && v.clashes < 1) || (th < 0.33 && v.clashes < 2)) { v.clashes++; M.clashWant = v; } }
    if (v.foe && v.boss && knock) { v.poise++; if (v.poise % 3 !== 0 && v.hp > 0) knock = false; }
    if (v.foe && v.boss && v.ai.spec && v.hp > 0) { knock = false; stun = 0; }   // bosses don't flinch out of their big moves
    if (v.hp <= 0) { v.hp = 0; knock = true; }
    if (knock) { v.launched = true; v.vy = 5.2; v.kbx = dir * Math.max(2.2, kb); v.act = null; v.stun = 0; }
    else if (v.foe && v.F.tough) { v.kbx = dir * 0.4; }   // tough monsters shrug off light hits (big bonks still knock them over)
    else { v.stun = Math.max(v.stun, stun || 0.3); v.kbx = dir * (kb || 1) * 0.8; if (v.act && !(v.boss && v.ai.spec)) v.act = null; }
    v.face = -dir;
    M.ev.push({ k: 'hit', to: v.i, from: from ? from.i : 0, dmg: dmg, big: !!knock, hero: !!v.hero, x: v.x, z: v.z, y: v.y + 1.1, kind: kind || '' });
    if (v.hero) { v.st.hurt += dmg; M.stats.dmg += dmg; if (v.hp <= 0) heroDown(M, v); }
    else if (v.hp <= 0) { v.dead = 1; M.kos++; M.score += v.F.score; if (v.boss) M.bossKos = (M.bossKos || 0) + 1; if (from && from.hero) from.st.kos++; M.ev.push({ k: 'foeKo', to: v.i, boss: v.boss, x: v.x, z: v.z, name: v.F.name });
      if (v.F.twin) M.foes.forEach(function (o) { if (o !== v && o.F.twin && !o.dead) { o.rage = 1.35; M.ev.push({ k: 'rage', name: o.F.name }); } });
      if (v.F.burst) { M.waves.push({ x: v.x, z: v.z, r: 0.2, max: 1.8, t: 0, dmg: v.F.burst, hit: {}, goo: true }); M.ev.push({ k: 'burst', x: v.x, z: v.z }); }
      if (v.F.monster) M.coins = (M.coins || 0) + (v.F.mini ? 10 : v.boss ? 0 : Math.max(1, Math.round(v.F.score / 90)));
      if (v.F.evolve) { M.evolve = { t: 1.8, type: v.F.evolve, x: v.x, z: v.z }; M.ev.push({ k: 'evolving', name: v.F.name }); } }
    return true;
  }
  // 🛡️ blocked: no hearts lost (bosses chip a little), the guard bar drops; the attacker is left open → ⚡ counter window
  function blockHit(M, v, from, dmg, knock) {
    var perfect = v.blkT < 0.22, n = from.act && from.act.ctrN || 0;
    v.gd -= perfect ? 0 : dmg * (from.boss ? 1.6 : 1.2); v.hitFlash = 0.06; v.kbx = -v.face * (knock ? 1.6 : 0.7); v.st.blocks++;
    if (from.boss && !perfect) { v.hp = Math.max(1, v.hp - Math.round(dmg * 0.15)); }
    if (v.gd <= 0) { v.gd = 0; v.blk = false; v.blockTap = 0; v.stun = 0.9; v.dizzy = 0.9; M.ev.push({ k: 'guardBreak', h: v.seat, x: v.x, z: v.z }); return true; }
    var ctr = false;
    if (from.foe && !from.dead && Math.abs(from.x - v.x) < 2.4) { ctr = true; v.ctr = { t: M.D.ctrW * Math.pow(0.85, n) + (perfect ? 0.15 : 0), f: from.i, n: n };
      if (!(from.boss && from.ai.spec)) { from.cutAct = true; from.stun = Math.max(from.stun, 0.45); } }
    M.ev.push({ k: 'block', h: v.seat, x: v.x, z: v.z, perfect: perfect, ctr: ctr, n: n }); return true;
  }
  function heroDown(M, h) { h.ko = true; h.out = 3.2; h.item = null; h.ride = 0; h.carry = null; M.ev.push({ k: 'heroKo', h: h.seat }); }
  function inFront(a, v, reach, dz) { var dx = (v.x - a.x) * a.face; return dx > -0.25 && dx < reach && Math.abs(v.z - a.z) < (dz || 0.42); }

  function heroStrike(M, h, mv) {
    var dmgK = h.boost > 0 ? 2 : 1, any = false, mel = h.item && PICKS[h.item].melee, P = M.puzzle;
    if (mv.toss) { if (!h.act.noThrow) { if (h.item && PICKS[h.item].light) flash(M, h); else throwItem(M, h); } return; }
    if (mv.counter) { var cf = foeById(M, h.act.tgt), n = h.act.ctrN || 0;
      if (!cf || cf.dead || Math.abs(cf.x - h.x) > 2.2 || Math.abs(cf.z - h.z) > 0.8) return;
      if ((cf.boss || cf.F.guard) && !cf.launched && cf.down <= 0 && M.rng() < M.D.parry * Math.pow(0.8, n) * (cf.boss ? 1 : 0.4)) {   // 🛡️ they parry — and hit back fast: block it in time to counter again
        cf.face = -h.face; cf.stun = 0; cf.ai.spec = null; cf.act = { k: cf.F.atk === 'roll' ? 'bonk' : cf.F.atk, t: 0, hit: false, ctrN: n + 1, fast: true }; M.ev.push({ k: 'parry', name: cf.F.name, n: n + 2, x: cf.x, z: cf.z }); return; }
      if (cf.boss) cf.poise = Math.ceil((cf.poise + 1) / 3) * 3 - (mv.knock ? 1 : 0);
      if (hurt(M, cf, h, Math.round(mv.dmg * (h.dmgK || 1) * (1 + 0.15 * n) * (h.boost > 0 ? 2 : 1)), mv.kb, !!mv.knock, mv.stun, 'counter')) { h.st.hits++; M.stats.hits++; h.power = Math.min(100, h.power + mv.pw * (h.pwK || 1)); M.ev.push({ k: 'countered', h: h.seat, n: n + 1, x: cf.x, z: cf.z }); }
      return; }
    var reach = mv.reach + (mel ? mel.reach : 0), dmg = (mv.dmg + (mel ? mel.dmg : 0)) * (h.dmgK || 1), knock = mv.knock || !!(mel && mel.knock);
    M.foes.forEach(function (f) {
      if (f.dead || f.safe > 0) return;
      var ok = mv.around ? Math.abs(f.x - h.x) < reach && Math.abs(f.z - h.z) < 0.9 : inFront(h, f, reach * (f.big > 1 ? 1.1 + 0.4 * (f.big - 1) : 1), f.big > 1 ? 0.55 : 0.42);
      if (!ok || Math.abs(f.y - h.y) >= 1.4) return;
      if (f.grabbedBy) return;
      var front = f.face === -h.face && f.down <= 0 && !f.launched;
      // 🔨 guard breaker: smashes a shield / a raised guard → dizzy (bosses can be grabbed while dizzy)
      if (mv.breaker && front && (f.guarding > 0 || (f.F.shield && f.stun <= 0))) { f.guarding = 0; hurt(M, f, h, Math.round(mv.dmg * (h.dmgK || 1)), 1.5, false, 1.4, 'break'); f.stun = Math.max(f.stun, 1.4); f.dizzy = 1.4; if (!(f.boss && f.ai.spec)) f.act = null; else { f.act = null; f.ai.spec = null; } h.st.breaks++; h.st.hits++; any = true; M.ev.push({ k: 'gbreak', h: h.seat, x: f.x, z: f.z, name: f.F.name }); return; }
      // 🛡️ knights block light hits from the front — bonk, jump, power, throw or hit them from behind
      if (f.F.shield && !mv.knock && !mv.air && !mel && front && f.stun <= 0) { f.kbx = h.face * 0.8; M.ev.push({ k: 'clang', x: f.x, z: f.z }); any = true; return; }
      // 🛡️ some baddies raise a guard — hold 💥 for the 🔨 guard breaker (or grab / power / jump them)
      if (front && !mv.around && !mv.air && !mel && f.stun <= 0 && (f.guarding > 0 || (f.F.guard && !f.act && M.rng() < f.F.guard * M.D.fguard))) { f.guarding = Math.max(f.guarding, 0.9); f.kbx = h.face * 0.5; h.combo.n = 0; M.ev.push({ k: 'fblock', x: f.x, z: f.z, name: f.F.name }); any = true; return; }
      if (hurt(M, f, h, Math.round(dmg * dmgK), knock ? Math.max(mv.kb, 3) : mv.kb, knock, mv.stun)) { any = true; h.st.hits++; M.stats.hits++; h.power = Math.min(100, h.power + mv.pw * (h.boost > 0 ? 2 : 1) * (h.pwK || 1)); if (mv.lift && f.launched) f.vy = mv.lift * (f.big > 1 ? 0.5 : 1); }
    });
    M.props.forEach(function (p) { if (p.gone) return; var ok = mv.around ? Math.abs(p.x - h.x) < reach && Math.abs(p.z - h.z) < 0.9 : inFront(h, p, reach + 0.1, 0.5); if (ok) hitProp(M, p); });
    if (P && !P.done && PZ[P.k].hit) PZ[P.k].hit(M, P, h, mv);
    if (mel) { h.uses--; if (h.uses <= 0) { h.item = null; M.ev.push({ k: 'broke', h: h.seat, item: 'lolly' }); } }
    if (any) h.combo.t = 0.5;
  }
  function hitProp(M, p) {
    p.hp--; p.hitT = 0.25; M.ev.push({ k: 'prop', x: p.x, z: p.z, broke: p.hp <= 0, icon: PROPS[p.k].icon, kind: p.k });
    if (p.hp <= 0) { p.gone = true;
      if (p.drop === 'trap') { var f = spawnFoe(M, 'knight', p.x, p.z); f.inView = true; f.ai.cd = 1.2; M.ev.push({ k: 'trap', x: p.x, z: p.z }); }
      else if (p.drop) M.picks.push({ i: nextId++, x: p.x, z: p.z, k: p.drop, t: 0, pop: 0.4 }); }
  }
  function flash(M, h) {   // 🔦 zombies freeze in the beam
    var n = 0; M.foes.forEach(function (f) { if (!f.dead && f.F.undead && inFront(h, f, 4.6, 0.75)) { f.stun = Math.max(f.stun, f.boss ? 1.0 : 2.6); f.dizzy = f.stun; if (!(f.boss && f.ai.spec)) f.act = null; n++; } });
    h.uses--; M.ev.push({ k: 'flash', h: h.seat, n: n, x: h.x, z: h.z, face: h.face }); if (h.uses <= 0) { h.item = null; M.ev.push({ k: 'broke', h: h.seat, item: 'flashlight' }); }
  }
  function throwItem(M, h) {
    var P = PICKS[h.item], W = P.weapon, k = h.boost > 0 ? 2 : 1; h.item = null;
    var mk = function (dz) { M.shots.push({ i: nextId++, k: P.icon, kind: W.kind === 'spray' ? 'roll' : W.kind, x: h.x + h.face * 0.5, z: clamp(h.z + dz, 0.05, ZD - 0.05), y: 1.0, vx: h.face * W.spd, vy: W.kind === 'roll' || W.kind === 'spray' ? 0 : W.kind === 'boom' ? 0.8 : 0.3, dmg: W.dmg * k, life: W.life, t: 0, hero: true, owner: h, hitSet: {}, back: W.kind === 'back', boom: W.kind === 'boom' }); };
    if (W.kind === 'spray') { mk(-0.35); mk(0); mk(0.35); } else mk(0);
    M.ev.push({ k: 'throw', h: h.seat, item: P.icon });
  }

  // ---------- step ----------
  function step(M, dt) {
    if (M.done) return;
    M.t += dt;
    if (M.clash) { stepClash(M, dt); return; }
    if (M.clashWant) { var cw = M.clashWant; M.clashWant = null; if (!cw.dead && cw.hp > 0) { startClash(M, cw); return; } }
    stepZones(M, dt);
    M.heroes.forEach(function (h) { if (!h.human) heroBrain(M, h, dt); stepBody(M, h, dt); stepHero(M, h, dt); });
    M.foes.forEach(function (f) { if (!f.dead) foeBrain(M, f, dt); stepBody(M, f, dt); if (f.dead) f.dead += dt; });
    M.foes.forEach(function (f) { if (!f.thrown) return; f.thrown.t -= dt; if (f.thrown.t <= 0 || !f.launched) { f.thrown = null; return; }   // 🎳 a thrown baddie knocks the others over
      M.foes.forEach(function (o) { if (o === f || o.dead || o.grabbedBy || f.thrown.hit[o.i] || Math.abs(o.x - f.x) > 0.7 * (o.big || 1) || Math.abs(o.z - f.z) > 0.5 || o.y > 1.4) return; f.thrown.hit[o.i] = 1; if (hurt(M, o, f.thrown.by, 10, 3.5, true, 0, 'thrown')) M.ev.push({ k: 'bowl', x: o.x, z: o.z }); }); });
    M.foes = M.foes.filter(function (f) { return !(f.dead > 1.2 && !f.launched); });
    stepShots(M, dt); stepWaves(M, dt);
    M.picks.forEach(function (p) { p.t += dt; if (p.pop > 0) p.pop -= dt; });
    M.props.forEach(function (p) { if (p.hitT > 0) p.hitT -= dt; });
    if (M.puzzle) { M.puzzle.t += dt; if (!M.puzzle.done && PZ[M.puzzle.k].step) PZ[M.puzzle.k].step(M, M.puzzle, dt); }
    if (M.door && M.door.open) M.door.t += dt;
    if (M.evolve) { M.evolve.t -= dt; if (M.evolve.t <= 0) { var E = M.evolve; M.evolve = null; var nb = spawnFoe(M, E.type, E.x, E.z); nb.inView = true; nb.safe = 1; nb.ai.specT = 3; M.bosses.push(nb); M.ev.push({ k: 'evolve', name: nb.F.name }); } }
    if (M.cage && M.cage.open) { M.cage.t += dt; if (M.cage.t > 2.6 && !M.done) { M.done = true; M.win = true; M.ev.push({ k: 'win' }); } }
    // team out of lives and everyone down = run over
    if (!M.done && M.heroes.every(function (h) { return h.ko; }) && M.lives === 0) { M.done = true; M.win = false; M.ev.push({ k: 'lose' }); }
  }
  function aliveHeroes(M) { return M.heroes.filter(function (h) { return !h.ko; }); }
  function stepZones(M, dt) {
    var al = aliveHeroes(M), lead = al.length ? Math.max.apply(null, al.map(function (h) { return h.x; })) : M.cam, mid = al.length ? al.reduce(function (s, h) { return s + h.x; }, 0) / al.length : M.cam;
    var Z = M.zones[M.zoneI];
    if (Z && Z.state === 'wait' && lead > Z.x - (Z.puzzle ? 5 : 1.5)) {
      Z.state = 'on'; M.lock = Z.puzzle === 'clues' ? null : { c: Z.puzzle ? Z.x : Math.max(Z.x, M.cam), done: false };
      if (Z.puzzle) startPuzzle(M, Z);
      if (Z.waves) spawnWave(M, Z);
      if (Z.boss) { M.bosses = Z.boss.map(function (t, k) { var b = spawnFoe(M, t, Z.x + Math.min(3, M.view / 2 - 1.2) - k * 0.4, ZD / 2 + (k ? 0.6 : -0.2) * (Z.boss.length > 1 ? 1 : 0)); b.inView = true; return b; }); M.bossF = M.bosses[0]; M.ev.push({ k: 'boss', name: Z.boss.map(function (t) { return FOES[t].name; }).join(' & ') }); }
    }
    if (Z && Z.state === 'on') {
      var left = M.foes.filter(function (f) { return !f.dead; }).length;
      if (Z.waves && left === 0 && Z.wi < Z.waves.length) { Z.wi++; if (Z.wi < Z.waves.length) spawnWave(M, Z); else if (Z.puzzle === 'defend') puzzleSolved(M); else if (!Z.puzzle) zoneClear(M, Z); }
      if (Z.puzzle && M.puzzle && M.puzzle.done && left === 0 && (!Z.waves || Z.wi >= Z.waves.length || Z.puzzle === 'crank')) zoneClear(M, Z);
      if (Z.boss && M.bosses.length && !M.evolve && M.bosses.every(function (b) { return b.dead; }) && left === 0) { zoneClear(M, Z); if (M.cage) { M.cage.open = true; M.ev.push({ k: 'rescue', who: M.captive }); } }
    }
    // camera: only forward, centred on the team; locked on a fight zone
    var want = M.lock ? M.lock.c : Math.max(M.cam, mid);
    M.cam += (clamp(want, M.view / 2, M.len - M.view / 2) - M.cam) * Math.min(1, dt * 4);
    if (!M.zones[M.zoneI] && !M.exitOpen) { M.exitOpen = true; M.ev.push({ k: 'exitOpen' }); }
    if (M.exitOpen && !M.map.boss && al.some(function (h) { return h.x > M.len - 1.4; }) && !M.mapDone) { M.mapDone = true; M.ev.push({ k: 'mapEnd', i: M.mapI, last: M.mapI === M.tale.maps.length - 1 }); }
  }
  function zoneClear(M, Z) { Z.state = 'done'; M.lock = null; M.puzzle = null; M.machine = null; M.zoneI++; M.ev.push({ k: 'go' }); }
  function bounds(M, p) {
    var l = M.cam - M.view / 2 + 0.35, r = M.cam + M.view / 2 - 0.35;
    if (p.hero) { if (M.puzzle && !M.puzzle.done && M.puzzle.gate) r = Math.min(r, M.puzzle.gate); if (M.cage && !M.cage.open) r = Math.min(r, M.cage.x - 0.8); var Z = M.zones[M.zoneI]; if (Z && Z.state === 'on' && Z.waves && Z.wi < Z.waves.length && !Z.puzzle) r = Math.min(r, M.cam + M.view / 2 - 0.35); }
    else if (p.inView || (p.x > l && p.x < r)) { p.inView = true; l -= 0.1; r += 0.1; } else { l -= 4; r += 4; }
    var Mw = M.machine; if (Mw && Mw.kind && !Mw.broken) { if (p.hero && Mw.kind === 'barricade') r = Math.min(r, Mw.x - 0.35); if (!p.hero && p.x > Mw.x) l = Math.max(l, Mw.x + 0.4); if (p.hero && Mw.kind === 'gate') l = Math.max(l, Mw.x + 0.4); }
    return [l, Math.min(r, M.len - 0.4)];
  }
  function stepBody(M, p, dt) {
    if (p.safe > 0) p.safe -= dt; if (p.hitFlash > 0) p.hitFlash -= dt; if (p.land > 0) p.land -= dt;
    if (p.dizzy > 0) p.dizzy -= dt; if (p.guarding > 0) p.guarding -= dt; if (p.barT > 0) p.barT -= dt;
    if (p.grabbedBy) { p.vx = p.vz = 0; return; }
    if (p.stun > 0) p.stun -= dt;
    if (p.down > 0) { p.down -= dt; if (p.down <= 0 && !p.dead && !p.ko) p.safe = Math.max(p.safe, p.hero ? 1.1 : 0.45); }
    var mv = 0, mz = 0;
    if (p.launched || p.kbx) { p.x += p.kbx * dt; p.kbx *= Math.pow(0.02, dt); if (Math.abs(p.kbx) < 0.05) p.kbx = 0; }
    if (!p.launched && !p.ko && !p.dead && p.stun <= 0 && p.down <= 0) {
      var spd = p.hero ? 3.1 * (p.ride > 0 ? 1.8 : 1) * (p.spdK || 1) : p.F.spd * (p.ai && p.ai.run ? 1.6 : 1) * (0.85 + 0.15 * M.D.aggr) * (p.rage || 1);
      var busy = (p.act && !(HMOVES[p.act.k] && HMOVES[p.act.k].air)) || p.blk || p.grab || p.guarding > 0;
      if (!busy) { mv = (p.ctrl.r ? 1 : 0) - (p.ctrl.l ? 1 : 0); mz = (p.ctrl.d ? 1 : 0) - (p.ctrl.u ? 1 : 0); }
      else if (p.blk) { var tf = (p.ctrl.r ? 1 : 0) - (p.ctrl.l ? 1 : 0); if (tf) p.face = tf; }   // turn while blocking
      if (p.dash) { p.dash.t += dt; if (!p.act || (HMOVES[p.act.k] && HMOVES[p.act.k].keep)) { mv = p.dash.dir * DASH_V / spd * (p.act ? Math.max(0.2, 1 - p.act.t * 3) : 1); mz = 0; } if (!p.act && p.dash.t >= DASH_T) p.dash = null; }
      if (p.foe && p.act && (p.act.k === 'charge' || p.act.k === 'roll') && p.act.t > foeTimes(p, p.act.k).st && p.act.t < foeTimes(p, p.act.k).st + foeTimes(p, p.act.k).ac) { mv = p.face * (p.act.k === 'roll' ? 2.2 : 2.6); mz = 0; }
      p.vx = mv * spd; p.vz = mz * spd * 0.62;
      if (mv && !p.act) p.face = sgn(mv);
      p.x += p.vx * dt; p.z = clamp(p.z + p.vz * dt, 0.05, ZD - 0.05);
      if (mv || mz) p.walkT += dt;
    } else { p.vx = 0; p.vz = 0; }
    var B = bounds(M, p); p.x = clamp(p.x, B[0], B[1]);
    // gravity
    if (p.y > 0 || p.vy > 0) { p.y += p.vy * dt; p.vy -= GRAV * dt; if (p.y <= 0) { p.y = 0; p.vy = 0; p.land = 0.2;
      if (p.launched) { p.launched = false; p.down = p.dead ? 9 : p.hero ? 0.7 : 0.8; p.kbx *= 0.3; if (p.boss) p.down = 0.9; M.ev.push({ k: 'thud', x: p.x, z: p.z }); }
      else if (p.act && HMOVES[p.act.k] && HMOVES[p.act.k].air) p.act = null; } }
    // the move clock
    if (p.act) {
      p.act.t += dt;
      if (p.hero) { var m = HMOVES[p.act.k];
        // 🔨 hold 💥: the bonk wind-up turns into a charge; let go (after a moment) = guard breaker
        if (p.act.k === 'bonk' && p.act.t >= 0.17 && !p.act.hit && p.hold.g && onGround(p)) { p.act = { k: 'charge', t: 0, hit: false, done: {} }; M.ev.push({ k: 'charge', h: p.seat }); m = HMOVES.charge; }
        else if (p.act.k === 'charge') { if (!p.hold.g || p.act.t >= 1.4) { var full = p.act.t >= 0.28; p.act = null; startAct(M, p, full ? 'gbreak' : 'bonk'); if (!full) p.act.t = HMOVES.bonk.st - 0.02; m = HMOVES[p.act.k]; } }
        if (!p.act.hit && p.act.t >= m.st) { p.act.hit = true; heroStrike(M, p, m); }
        if (p.act && p.act.k !== 'charge' && p.act.t >= m.st + m.ac + m.rc) { var wasKeep = m.keep; p.act = null; if (wasKeep) p.dash = null; if (p.buf && p.buf.t > 0) { var a = p.buf.a; p.buf = null; doPress(M, M.heroes.indexOf(p), a); } } }
      else { foeAct(M, p, dt); if (p.cutAct) { p.cutAct = false; p.act = null; } }
    }
  }
  function stepAir(M, h, dt) {   // 🫧 underwater: air runs down; vents and bubbles refill it; no air = hearts drain
    if (!M.map.water) return; if (h.air == null) h.air = 100;
    var vent = (M.map.vents || []).some(function (x) { return Math.abs(h.x - x) < 0.7; });
    if (vent) h.air = Math.min(100, h.air + 30 * dt); else h.air = Math.max(0, h.air - M.D.air * dt);
    if (h.air <= 0 && !h.ko) { h.airT = (h.airT || 0) + dt; if (h.airT >= 0.5) { h.airT = 0; h.hp -= 2; h.hitFlash = 0.08; if (h.hp <= 0) { h.hp = 0; heroDown(M, h); } } }
    if (h.air < 25 && !h.airWarn) { h.airWarn = true; M.ev.push({ k: 'lowAir', h: h.seat }); } if (h.air > 40) h.airWarn = false;
  }
  function stepHero(M, h, dt) {
    stepAir(M, h, dt);
    if (h.combo.t > 0) h.combo.t -= dt; if (h.buf) { h.buf.t -= dt; if (h.buf.t <= 0) h.buf = null; }
    if (h.dashCd > 0) h.dashCd -= dt; if (h.blockTap > 0) h.blockTap -= dt; if (h.ctr) { h.ctr.t -= dt; if (h.ctr.t <= 0) h.ctr = null; }
    if (h.pend) { h.pend.t -= dt; if (h.pend.t <= 0) { var pa = h.pend.a; h.pend = null; doPress(M, M.heroes.indexOf(h), pa); } }
    if (h.grab) grabStep(M, h, dt);
    // 🛡️ block: hold both hit buttons (or 🛡️). Starts from standing or from the end of a move (so you can block a counter-attack)
    var wantBlk = (h.hold.block || h.blockTap > 0) && !h.ko && !h.launched && h.down <= 0 && h.stun <= 0 && onGround(h) && !h.grab && h.gd > 0 && !(h.dizzy > 0);
    if (wantBlk && h.act) { var am = HMOVES[h.act.k]; if (h.act.k === 'charge' || (h.act.hit && h.act.t >= am.st + am.ac)) h.act = null; }
    if (wantBlk && !h.act) { if (!h.blk) { h.blk = true; h.blkT = 0; h.dash = null; M.ev.push({ k: 'guardUp', h: h.seat }); } h.blkT += dt; h.gd = Math.max(0, h.gd - 5 * dt); if (h.gd <= 0) { h.blk = false; h.blockTap = 0; h.stun = 0.9; h.dizzy = 0.9; M.ev.push({ k: 'guardBreak', h: h.seat, x: h.x, z: h.z }); } }
    else { h.blk = false; h.gd = Math.min(100, h.gd + 22 * dt); }
    if (h.boost > 0) h.boost -= dt; if (h.ride > 0) h.ride -= dt;
    if (h.ko) { h.out -= dt; if (h.out <= 0 && (M.lives !== 0)) { if (M.lives > 0) M.lives--; M.livesUsed++; h.ko = false; h.launched = false; h.down = 0; h.hp = Math.round(h.maxHp * 0.6); h.air = 100; h.safe = 2.2; h.x = M.cam - 1; h.y = 2.5; h.vy = 0; M.ev.push({ k: 'respawn', h: h.seat }); } return; }
    // walk-over pickups (food, boosts, rides, armour, clues, keys, secrets); throw / swing things need a 👊 press
    for (var k = M.picks.length - 1; k >= 0; k--) { var p = M.picks[k], P = PICKS[p.k]; if (P.weapon || P.melee || P.light || p.pop > 0 || (p.k === 'fuel' && h.carry != null)) continue; if (Math.abs(p.x - h.x) < 0.55 && Math.abs(p.z - h.z) < 0.4 && onGround(h)) { if (P.heal && h.hp >= h.maxHp && M.heroes.some(function (o) { return o !== h && !o.ko && o.hp < o.maxHp; })) continue; takePick(M, h, p); } }
    // 🛹 skateboard ram
    if (h.ride > 0 && Math.abs(h.vx) > 1) M.foes.forEach(function (f) { if (!f.dead && Math.abs(f.x - h.x) < 0.7 && Math.abs(f.z - h.z) < 0.4 && f.safe <= 0) hurt(M, f, h, 9, 3, true, 0, 'ride'); });
  }
  function stepShots(M, dt) {
    M.shots.forEach(function (s) {
      s.t += dt; s.x += s.vx * dt; s.y = Math.max(0.15, s.y + s.vy * dt); if (s.kind === 'lob' || s.kind === 'boom') s.vy -= 9 * dt;
      if (s.back && s.t > s.life * 0.5 && !s.turned) { s.turned = true; s.vx = -s.vx; s.hitSet = {}; }
      if (s.boom) { if (s.t >= s.life - 0.001 || s.y <= 0.16) { s.life = 0; boom(M, s); } return; }
      var targets = s.hero ? M.foes : M.heroes;
      targets.forEach(function (v) { if (v.dead || v.ko || s.hitSet[v.i]) return; if (s.kind === 'arrow' && v.y > 0.6) return;
        if (Math.abs(v.x - s.x) < 0.55 * (v.big || 1) * (s.big ? 1.4 : 1) && Math.abs(v.z - s.z) < (s.big ? 0.6 : 0.42) && v.y < 1.6) { s.hitSet[v.i] = 1; if (s.kind === 'net') { hurt(M, v, s.owner, s.dmg, 0.3, false, v.boss ? 1 : 3, 'net'); s.life = 0; v.stun = Math.max(v.stun, v.boss ? 1 : 3); v.act = v.boss && v.ai.spec ? v.act : null; if (!v.boss) v.dizzy = 3; return; } if (hurt(M, v, s.owner || { x: s.x - sgn(s.vx), i: 0 }, s.dmg, 3, s.hero, 0.45, 'shot') && !s.hero) s.life = 0; if (s.hero && s.owner) { s.owner.st.hits++; M.stats.hits++; } } });
      if (s.back && s.turned && s.owner && Math.abs(s.owner.x - s.x) < 0.5 && Math.abs(s.owner.z - s.z) < 0.5) { s.life = 0; if (!s.owner.item && !s.owner.ko) s.owner.item = 'frisbee'; }
      if (s.kind === 'lob' && s.y <= 0.16) { s.life = 0; M.ev.push({ k: 'splash', x: s.x, z: s.z, icon: s.k }); }
    });
    M.shots = M.shots.filter(function (s) { return s.t < s.life && s.x > M.cam - M.view && s.x < M.cam + M.view; });
  }
  function boom(M, s) {   // 🎆 firework bursts: everyone close is knocked over
    M.ev.push({ k: 'boom', x: s.x, z: s.z });
    M.foes.forEach(function (f) { if (!f.dead && Math.hypot(f.x - s.x, (f.z - s.z) * 1.4) < 1.5) { hurt(M, f, { x: s.x - 0.01, i: 0 }, s.dmg, 4, true, 0, 'boom'); if (s.owner) s.owner.st.hits++; } });
    M.props.forEach(function (p) { if (!p.gone && Math.hypot(p.x - s.x, (p.z - s.z) * 1.4) < 1.3) hitProp(M, p); });
  }
  function stepWaves(M, dt) {   // 💥 ground-pound rings
    M.waves.forEach(function (w) { w.r += dt * 4.2; w.t += dt;
      M.heroes.forEach(function (h) { if (h.ko || w.hit[h.i] || h.y > 0.25) return; var d = Math.hypot(h.x - w.x, (h.z - w.z) * 1.6); if (Math.abs(d - w.r) < 0.32) { w.hit[h.i] = 1; hurt(M, h, { x: w.x, i: 0 }, w.dmg, 3, true, 0, 'pound'); } }); });
    M.waves = M.waves.filter(function (w) { return w.r < w.max; });
  }

  // ---------- baddie brains ----------
  function nearestHero(M, f) { var best = null, bd = 1e9; M.heroes.forEach(function (h) { if (h.ko) return; var d = Math.abs(h.x - f.x) + Math.abs(h.z - f.z) * 1.5; if (d < bd) { bd = d; best = h; } }); return best; }
  function attackers(M) { return M.foes.filter(function (f) { return !f.dead && f.act; }).length; }
  function foeBrain(M, f, dt) {
    var A = f.ai, F = f.F; f.ctrl.l = f.ctrl.r = f.ctrl.u = f.ctrl.d = false; A.run = false;
    if (f.launched || f.down > 0 || f.stun > 0 || f.act || f.grabbedBy || f.guarding > 0) return;
    A.cd -= dt * M.D.aggr * (f.rage || 1); A.t -= dt;
    var h = nearestHero(M, f); if (!h) return;
    if (!f.inView) { if (f.x < M.cam) f.ctrl.r = true; else f.ctrl.l = true; f.face = f.ctrl.r ? 1 : -1; return; }   // walk on screen first
    if (M.machine && M.machine.kind === 'barricade' && !f.boss) A.mach = true;   // the barricade: every zombie pushes it
    if (A.mach && M.machine && !M.machine.broken) h = M.machine.kind ? { x: M.machine.x, z: f.z, ko: false } : M.machine;   // 🏭 machine wreckers
    // boss: summon helpers at 2/3 and 1/3, big moves on a timer
    if (f.boss) {
      var th = f.hp / f.maxHp; if (F.summon && ((th < 0.67 && f.summoned < 1) || (th < 0.34 && f.summoned < 2))) { f.summoned++; F.summon.forEach(function (t, k) { spawnFoe(M, t, M.cam + (k % 2 ? -1 : 1) * (M.view / 2 + 0.6), 0.4 + k * 0.7); }); M.ev.push({ k: 'summon', name: F.name }); }
      A.specT -= dt * M.D.aggr * (f.rage || 1);
      if (A.specT <= 0 && Math.abs(h.x - f.x) < 7) { A.specT = 5 + M.rng() * 2.5; var sp = F.specials[Math.floor(M.rng() * F.specials.length)];
        if (sp === 'charge') { f.z += (h.z - f.z) * 0.6; f.face = sgn(h.x - f.x); }
        A.spec = sp; f.act = { k: sp, t: 0, hit: false }; M.ev.push({ k: 'special', move: sp, name: F.name }); return; }
    }
    var dx = h.x - f.x, dz = h.z - f.z;
    if (F.range) {   // 🎈🏹 throwers / archers keep their distance and shoot from the same lane
      var wantX = h.x - sgn(dx || 1) * F.keep; if (Math.abs(wantX - M.cam) > M.view / 2 - 0.6) wantX = h.x + sgn(dx || 1) * F.keep; f.face = sgn(h.x - f.x || 1);
      if (Math.abs(f.x - wantX) > 0.5) { if (f.x < wantX) f.ctrl.r = true; else f.ctrl.l = true; }
      if (Math.abs(dz) > 0.2) { if (dz > 0) f.ctrl.d = true; else f.ctrl.u = true; }
      if (A.cd <= 0 && Math.abs(dz) < 0.5 && Math.abs(dx) < F.range && attackers(M) < M.D.atk + 1) { A.cd = F.cd; f.act = { k: F.shot, t: 0, hit: false }; }
      return;
    }
    // walk to a spot beside the target; only a few attack at once
    var side = Math.abs(dx) > 0.4 ? -sgn(dx) : A.side, sx = h.x + side * (F.reach * 0.8 * f.big), sz = h.z;
    if (F.atk === 'roll') sx = h.x + side * 3.2;   // 🍬 jawbreakers back off, then roll in
    var crowd = attackers(M) >= M.D.atk && !f.boss;
    if (crowd) { sx = h.x + side * 2.4; sz = clamp(h.z + (A.side * 0.7), 0.1, ZD - 0.1); }
    var ex = sx - f.x, ez = sz - f.z;
    if (Math.abs(ex) > 0.12) { if (ex > 0) f.ctrl.r = true; else f.ctrl.l = true; }
    if (Math.abs(ez) > 0.1) { if (ez > 0) f.ctrl.d = true; else f.ctrl.u = true; }
    if (Math.abs(ex) > 3) A.run = true;
    if (!f.ctrl.l && !f.ctrl.r) f.face = sgn(dx || f.face);
    var inRange = F.atk === 'roll' ? Math.abs(ex) < 0.6 && Math.abs(dz) < 0.35 : Math.abs(dx) < F.reach * f.big + 0.15 && Math.abs(dz) < 0.35;
    if (!crowd && A.cd <= 0 && inRange) { f.face = sgn(dx || 1); A.cd = F.cd * (0.75 + M.rng() * 0.5); f.act = { k: F.atk, t: 0, hit: false }; f.ctrl.l = f.ctrl.r = f.ctrl.u = f.ctrl.d = false; }
  }
  function foeTimes(f, k) { var F = f.F, s = F.slow || 1;
    if (f.act && f.act.fast && f.act.k === k) { var m0 = HMOVES[k] || HMOVES.bonk; return { st: Math.max(0.26, CB_T * Math.pow(0.9, f.act.ctrN || 0)), ac: m0.ac, rc: m0.rc * 1.2 }; }
    if (k === 'charge') return { st: 0.55, ac: 1.3, rc: 0.5 }; if (k === 'roll') return { st: 0.6, ac: 1.2, rc: 0.6 }; if (k === 'pound') return { st: 0.9, ac: 0.1, rc: 0.6 };
    if (k === 'spin') return { st: 0.6, ac: 0.5, rc: 0.5 }; if (k === 'potions') return { st: 0.55, ac: 0.1, rc: 0.5 };
    if (k === 'lob' || k === 'arrow') return { st: 0.35 * s + (k === 'arrow' ? 0.25 : 0), ac: 0.05, rc: 0.3 }; var m = HMOVES[k]; return { st: m.st * s, ac: m.ac, rc: m.rc * 1.2 }; }
  function foeAct(M, f, dt) {
    var k = f.act.k, T = foeTimes(f, k), F = f.F;
    if (f.act.fast) T = { st: Math.max(0.26, CB_T * Math.pow(0.9, f.act.ctrN || 0)), ac: T.ac, rc: T.rc };
    if (k === 'pound') { if (f.act.t < 0.5) { f.y = Math.sin(f.act.t / 0.5 * Math.PI / 2) * 2.2; } else if (f.act.t < T.st) { f.y = Math.max(0, 2.2 * (1 - (f.act.t - 0.5) / 0.4)); } }
    if (!f.act.hit && f.act.t >= T.st) { f.act.hit = true;
      if (k === 'lob') { M.shots.push({ i: nextId++, k: F.proj, kind: 'lob', x: f.x + f.face * 0.4, z: f.z, y: 1.3, vx: f.face * 5.2, vy: 3.2, dmg: F.pdmg, life: 2.4, t: 0, hero: false, owner: f, hitSet: {} }); M.ev.push({ k: 'lob' }); }
      else if (k === 'arrow') { M.shots.push({ i: nextId++, k: F.proj, kind: 'arrow', x: f.x + f.face * 0.4, z: f.z, y: 1.15, vx: f.face * 8, vy: 0, dmg: F.pdmg, life: 1.4, t: 0, hero: false, owner: f, hitSet: {} }); M.ev.push({ k: 'arrow' }); }
      else if (k === 'potions') { [-0.6, 0, 0.6].forEach(function (dz) { M.shots.push({ i: nextId++, k: '🧪', kind: 'lob', x: f.x + f.face * 0.4, z: clamp(f.z + dz, 0.1, ZD - 0.1), y: 1.6, vx: f.face * (4 + Math.abs(dz) * 2), vy: 3.4, dmg: 9, life: 2.4, t: 0, hero: false, owner: f, hitSet: {} }); }); M.ev.push({ k: 'lob' }); }
      else if (k === 'pound') { f.y = 0; M.waves.push({ x: f.x, z: f.z, r: 0.3, max: 3.4, t: 0, dmg: 10, hit: {} }); M.ev.push({ k: 'pound', x: f.x, z: f.z }); }
      else if (k === 'spin') { M.ev.push({ k: 'spin', x: f.x, z: f.z }); }
      else if (k !== 'charge' && k !== 'roll') {
        M.heroes.forEach(function (h) { if (!h.ko && h.y < 0.9 && inFront(f, h, F.reach * f.big, f.big > 1 ? 0.5 : 0.38)) hurt(M, h, f, F.dmg, F.knock ? 3.2 : 1.2, !!F.knock, 0.4); });
        var Mc = M.machine; if (f.ai.mach && Mc && !Mc.broken && inFront(f, Mc.kind ? { x: Mc.x, z: f.z } : Mc, F.reach * f.big + 0.5, 0.7)) machineHit(M, F.dmg);
      }
    }
    if ((k === 'charge' || k === 'roll') && f.act.t > T.st && f.act.t < T.st + T.ac) {
      M.heroes.forEach(function (h) { if (!h.ko && h.y < 0.8 && Math.abs(h.x - f.x) < 0.9 && Math.abs(h.z - f.z) < 0.5 && !f.act['h' + h.i]) { f.act['h' + h.i] = 1; hurt(M, h, f, k === 'roll' ? F.dmg : 13, 4.5, true, 0, k); } });
      var Mc2 = M.machine; if (f.ai.mach && Mc2 && !Mc2.broken && Math.abs(Mc2.x - f.x) < 1.1 && (Mc2.kind || Math.abs(Mc2.z - f.z) < 0.7) && !f.act.mh) { f.act.mh = 1; machineHit(M, F.dmg); }
    }
    if (k === 'spin' && f.act.t > T.st && f.act.t < T.st + T.ac) M.heroes.forEach(function (h) { if (!h.ko && h.y < 0.9 && Math.abs(h.x - f.x) < 1.8 && Math.abs(h.z - f.z) < 0.8 && !f.act['h' + h.i]) { f.act['h' + h.i] = 1; hurt(M, h, f, 12, 4, true, 0, 'spin'); } });
    if (f.act.t >= T.st + T.ac + T.rc) { f.act = null; f.ai.spec = null; }
  }
  function machineHit(M, dmg) {
    var Mc = M.machine; Mc.hp -= Math.round(dmg * M.D.edmg * (Mc.kind === 'barricade' ? 0.6 : 1)); Mc.hitT = 0.25; M.ev.push({ k: 'machineHit', hp: Mc.hp });
    if (Mc.hp <= 0) { M.ev.push({ k: 'machineBroke' });
      if (M.lives === 0) { M.done = true; M.win = false; M.ev.push({ k: 'lose', why: 'machine' }); return; }
      if (M.lives > 0) M.lives--; M.livesUsed++; Mc.hp = Math.round(Mc.max * 0.6); }
  }

  // ---------- family bot heroes ----------
  function heroBrain(M, h, dt) {
    var A = h.ai, c = h.ctrl; c.l = c.r = c.u = c.d = false;
    if (A.relG && M.t >= A.relG) { h.hold.g = false; A.relG = 0; }
    if (h.ko || h.launched || h.down > 0 || h.grab) return;
    if (h.ctr && h.ctr.t > 0 && h.ctr.t < M.D.ctrW - 0.08) { press(M, M.heroes.indexOf(h), M.rng() < 0.5 ? 'boop' : 'bonk'); return; }   // ⚡ counter
    var thr = M.foes.filter(function (f) { return !f.dead && f.act && !f.act.hit && ['lob', 'arrow', 'potions', 'pound', 'spin'].indexOf(f.act.k) < 0 && Math.abs(f.x - h.x) < f.F.reach * f.big + 0.7 && Math.abs(f.z - h.z) < 0.6; })[0];
    if (thr) { if (A.seen !== thr.act) { A.seen = thr.act; A.doBlk = M.rng() < (thr.act.fast ? 0.7 : M.D.botBlk); } if (A.doBlk && h.stun <= 0) { h.face = sgn(thr.x - h.x) || h.face; h.blockTap = 0.25; return; } }
    A.t -= dt; var go = function (x, z, tol) { if (Math.abs(x - h.x) > (tol || 0.15)) { if (x > h.x) c.r = true; else c.l = true; } if (Math.abs(z - h.z) > 0.12) { if (z > h.z) c.d = true; else c.u = true; } };
    var i = M.heroes.indexOf(h), P = M.puzzle, foes = M.foes.filter(function (f) { return !f.dead; });
    // puzzles: kids solve them; bots wait at the side (all-bot runs + tests solve them; bots always help crank)
    if (P && !P.done && PZ[P.k].bot && !(foes.length && P.botHelp)) {
      if (M.botPuzzles || P.botHelp) { PZ[P.k].bot(M, P, h, i, go, A); return; }
      if (PZ[P.k].wait && !foes.length) { var w = PZ[P.k].wait(P, i); go(w[0], w[1]); return; }
    }
    var lead = M.heroes.filter(function (o) { return o.human && !o.ko; })[0];
    if (P && !P.done && !PZ[P.k].bot && PZ[P.k].wait && !foes.length) { var w2 = PZ[P.k].wait(P, i); go(w2[0], w2[1], 0.3); return; }
    if (M.map.water && h.air < 35) { var vs = (M.map.vents || []).filter(function (x) { return x > M.cam - M.view / 2 + 0.4 && x < M.cam + M.view / 2 - 0.4; }); var bub = M.picks.filter(function (p) { return p.k === 'bubble'; })[0];
      if (bub && Math.abs(bub.x - M.cam) < M.view / 2) { go(bub.x, bub.z); return; } if (vs.length) { var vx = vs.reduce(function (a, b) { return Math.abs(b - h.x) < Math.abs(a - h.x) ? b : a; }); if (Math.abs(vx - h.x) > 0.4 || h.air < 90) { go(vx, h.z, 0.3); return; } } }
    // low on hearts: grab food in view
    if (h.hp < 45) { var food = M.picks.filter(function (p) { return PICKS[p.k].heal && Math.abs(p.x - M.cam) < M.view / 2; })[0]; if (food) { go(food.x, food.z); return; } }
    if (foes.length) {
      var f = foes.reduce(function (a, b) { return Math.abs(b.x - h.x) + Math.abs(b.z - h.z) < Math.abs(a.x - h.x) + Math.abs(a.z - h.z) ? b : a; });
      // knights: walk round behind them (or bonk)
      var side = h.x < f.x ? -1 : 1; if (f.F.shield && f.face === -side * -1 && M.rng() < 0.002) side = -side;
      var sx2 = f.x + side * 0.78 * (1 + 0.3 * ((f.big || 1) - 1));
      if ((Math.abs(h.x - sx2) < 0.3 || (Math.abs(f.x - h.x) < 1.0 && sgn(f.x - h.x) === -side && !(f.F.shield))) && Math.abs(h.z - f.z) < 0.25) { h.face = -side;
        if (A.t <= 0 && canAct(h)) { A.t = 0.16 + M.rng() * 0.12; var near = foes.filter(function (o) { return Math.abs(o.x - h.x) < 1.6 && Math.abs(o.z - h.z) < 0.8; }).length;
          if (h.power >= 100 && near >= 2) press(M, i, 'power'); else if (h.item) press(M, i, 'boop');
          else if ((f.guarding > 0 || f.F.shield) && f.face === -h.face && M.rng() < 0.6) { h.hold.g = true; A.relG = M.t + 0.5; doPress(M, i, 'bonk'); }   // 🔨
          else if (grabbable(h, f) && !f.F.shield && M.rng() < 0.07) doGrab(M, h);
          else press(M, i, f.F.shield || M.rng() < 0.18 ? 'bonk' : 'boop'); }
        // hop away from a boss big move
        if (f.boss && f.ai.spec && onGround(h) && M.rng() < 0.05) press(M, i, 'jump');
      } else { if (Math.abs(sx2 - h.x) > 3 && Math.abs(f.z - h.z) < 0.3 && h.dashCd <= 0 && M.rng() < 0.03) tryDash(M, h, sgn(sx2 - h.x)); go(sx2, f.z, 0.2); }
      return;
    }
    var prop = M.props.filter(function (p) { return !p.gone && p.x - 0.8 > M.cam - M.view / 2 + 0.4 && p.x < M.cam + M.view / 2 - 0.3 && (p.drop === 'clue' || M.botPuzzles); })[0];
    if (prop) { var px = prop.x - 0.8; if (Math.abs(h.x - px) < 0.25 && Math.abs(h.z - prop.z) < 0.25) { h.face = 1; if (A.t <= 0 && canAct(h)) { A.t = 0.3; press(M, i, 'boop'); } } else go(px, prop.z, 0.15); return; }
    var pick = M.botPuzzles && M.picks.filter(function (p) { var Q = PICKS[p.k]; return !Q.weapon && !Q.melee && !Q.light && !(p.k === 'fuel' && h.carry != null) && Math.abs(p.x - h.x) < M.view / 2 && p.x > M.cam - M.view / 2 + 0.4; })[0];
    if (pick) { go(pick.x, pick.z); return; }
    if (lead && lead !== h) { go(lead.x - 1.3 - i * 0.3, clamp(lead.z + (i % 2 ? 0.6 : -0.6), 0.2, ZD - 0.2), 0.8); return; }
    go(M.cage && M.zones[M.zoneI] == null ? M.cam : M.cam + M.view / 2 + 1, ZD / 2 + (i - 1) * 0.5, 0.3);
  }

  // ---------- ⚔️ boss clash: at 2/3 and 1/3 of a boss's hearts the street freezes; each hero types their own key combos
  // (keyboard: any of ← → ↑ ↓ 👊 💥 🌀 ⤴️ · touch: the 4 buttons). Every finished combo adds damage (and the next combo is a bit longer);
  // when the clock runs out the boss takes it all — no combo at all = the boss hits everyone.
  var CLASH_SYMS = ['l', 'r', 'u', 'd', 'boop', 'bonk', 'power', 'jump'], CLASH_TAP = ['boop', 'bonk', 'power', 'jump'];
  function clashSeq(M, h, sets) { var al = h.tap ? CLASH_TAP : CLASH_SYMS, n = Math.min(8, M.D.clashN + Math.min(2, sets || 0)), q = [];
    for (var k = 0; k < n; k++) { var x; do { x = al[Math.floor(M.rng() * al.length)]; } while (k >= 2 && x === q[k - 1] && x === q[k - 2]); q.push(x); } return q; }
  function startClash(M, f) {
    var T = M.D.clashT; M.clash = { f: f.i, name: f.F.name, type: f.type, t: T, T: T, dmg: 0, sets: 0, per: {}, intro: 1.1, res: null, n: f.clashes };
    f.act = null; f.ai.spec = null; f.stun = 0; f.guarding = 0; M.waves = []; M.shots = M.shots.filter(function (x) { return x.hero; });
    M.heroes.forEach(function (h) { h.act = null; h.dash = null; h.blk = false; h.blockTap = 0; h.pend = null; h.ctr = null;
      if (h.grab) { var gf = foeById(M, h.grab.v); if (gf) gf.grabbedBy = null; h.grab = null; }
      if (!h.ko) M.clash.per[h.i] = { seq: clashSeq(M, h, 0), pos: 0, sets: 0, bad: 0, botT: 1.4 + M.rng() * 0.8, seat: h.seat }; });
    M.ev.push({ k: 'clash', name: f.F.name, t: T, n: f.clashes });
  }
  function clashKey(M, i, x) { var C = M.clash, h = M.heroes[i]; if (!C || !h || C.intro > 0 || C.res) return false; var p = C.per[h.i]; if (!p) return false;
    if (p.seq[p.pos] === x) { p.pos++; M.ev.push({ k: 'clashOk', h: h.seat }); if (p.pos >= p.seq.length) clashSet(M, h, p); return true; }
    p.pos = 0; p.bad = 0.35; M.ev.push({ k: 'clashBad', h: h.seat }); return false; }
  function clashSet(M, h, p) { var C = M.clash, f = foeById(M, C.f); p.sets++; C.sets++; var gain = Math.round((f ? f.maxHp : 200) * 0.035 * (1 + 0.25 * (p.sets - 1))); C.dmg += gain; h.st.clash++;
    p.seq = clashSeq(M, h, p.sets); p.pos = 0; M.ev.push({ k: 'clashSet', h: h.seat, sets: p.sets, gain: gain, total: C.dmg }); }
  function stepClash(M, dt) {
    var C = M.clash; for (var id in C.per) if (C.per[id].bad > 0) C.per[id].bad -= dt;
    if (C.intro > 0) { C.intro -= dt; return; }
    if (C.res) { C.res.t -= dt; if (C.res.t <= 0) M.clash = null; return; }
    C.t -= dt;
    M.heroes.forEach(function (h) { var p = C.per[h.i]; if (!p || h.human) return; p.botT -= dt; if (p.botT <= 0) { p.botT = (1.3 + M.rng() * 1.4) * p.seq.length / 4; if (M.rng() < 0.8) clashSet(M, h, p); else M.ev.push({ k: 'clashBad', h: h.seat }); } });
    if (C.t <= 0) endClash(M);
  }
  function endClash(M) {
    var C = M.clash, f = foeById(M, C.f), win = C.sets > 0, dmg = 0;
    if (f && !f.dead) {
      if (win) { dmg = Math.min(C.dmg, Math.round(f.maxHp * 0.3)); f.hp = Math.max(1, f.hp - dmg); f.launched = true; f.vy = 6; f.kbx = 3 * (sgn(f.x - M.cam) || 1); f.hitFlash = 0.3; f.barT = 3; f.act = null;
        var th = f.hp / f.maxHp; if (th < 0.33) f.clashes = Math.max(f.clashes, 2); else if (th < 0.66) f.clashes = Math.max(f.clashes, 1); M.score += 100 * C.sets; }
      else M.heroes.forEach(function (h) { if (!h.ko) { h.safe = 0; h.blk = false; hurt(M, h, f, 8, 3, true, 0, 'clash'); } });
    }
    C.res = { t: 1.2, win: win, dmg: dmg }; M.ev.push({ k: win ? 'clashWin' : 'clashLose', name: C.name, sets: C.sets, dmg: dmg });
  }
  // 💡 where the next puzzle step is (Easy / Normal hints): ask the puzzle's own bot solver where it would walk
  function hintFor(M) {
    var P = M.puzzle; if (!P || P.done || !PZ[P.k].bot || P.botHelp) return null;
    var fake = mkBody({ x: -99, z: ZD / 2 }), keep = M.heroes, evN = M.ev.length, out = null;
    fake.hero = true; fake.human = false; fake.hp = fake.maxHp = 100; fake.power = 0; fake.combo = { n: 0, t: 0 }; fake.air = 100; fake.ai = { t: 9 }; fake.st = { hits: 0, kos: 0, hurt: 0 }; fake.hold = { block: false, g: false }; fake.seat = 0;
    M.heroes = [fake]; try { PZ[P.k].bot(M, P, fake, 0, function (x, z) { if (!out) out = { x: x, z: z }; }, { t: 9 }); } catch (e) { out = null; }
    M.heroes = keep; M.ev.length = evN; return out;
  }
  function takeEvents(M) { var e = M.ev; M.ev = []; return e; }
  function starsFor(M) { if (!M.win) return 0; return M.livesUsed === 0 ? 3 : M.livesUsed <= 2 ? 2 : 1; }
  // whole tale, everyone a bot (tests): moves through every map
  function simulate(o) {
    var M = newRun(Object.assign({ botPuzzles: true }, o)); var maxT = o.maxT || 900;
    while (!M.done && M.t < maxT) { step(M, DT); var ev = takeEvents(M); if (o.onEv) o.onEv(ev, M); if (ev.some(function (e) { return e.k === 'mapEnd'; })) nextMap(M); }
    return M;
  }
  return { DT: DT, ZD: ZD, VIEW: VIEW, DIFFS: DIFFS, DIFF_KEYS: DIFF_KEYS, HMOVES: HMOVES, FOES: FOES, PICKS: PICKS, PROPS: PROPS, TALES: TALES, PZ: PZ,
    newRun: newRun, nextMap: nextMap, loadMap: loadMap, step: step, press: press, setCtrl: setCtrl, takeEvents: takeEvents, simulate: simulate, starsFor: starsFor,
    CARDS: CARDS, OUTBREAK: OUTBREAK, MINIS: MINIS, buyCard: buyCard, restReady: restReady, chooseEnding: chooseEnding, currentCalm: currentCalm,
    spawnFoe: spawnFoe, foeTimes: foeTimes, setHold: setHold, dash: dash, clashKey: clashKey, hintFor: hintFor, GRABS: GRABS, foeById: foeById, DASH_CD: DASH_CD, bellShowing: orderShowing, orderShowing: orderShowing, onGround: onGround, mkRng: mkRng };
})();
// ADV END

