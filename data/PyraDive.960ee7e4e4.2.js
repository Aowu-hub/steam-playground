
// ===== PyraDive ENGINE (pure logic, no DOM) — pasted into PyraDive.html between ENGINE START/END =====
// ENGINE START
var PD = (function () {
  'use strict';
  // World (metres): x along the court (net at x = 0, team 0 lives at x < 0, team 1 at x > 0), y across (+ = near the camera), z up.
  // Team-local: u = distance from the net into your own court (always ≥ 0 on your side), v = across.
  var DT = 1 / 120;
  var PGRAV = 15.5, JUMPV = 4.4;         // players: a ~0.6 m jump, ~0.55 s in the air
  // 🦘 pd-6b2: jump height by power — p.jf scales the height (and the gravity, so the air time stays the same); every RULE reads rz(p) = the
  //   height of the plain 0.62 m jump, so reach / dunk / block / net / robot timing are exactly as before (seeded matches replay the same)
  var JF = { hop: 1, attack: 1.6, power: 2.0, pyra: 2.4 };   // 0.62 · 1.0 · 1.25 · 1.5 m
  function rz(p) { return p.z / (p.jf || 1); }
  var BALL_R = 0.12;

  // ---------- 🏐 PyraSpike modes (R1). R2 adds 🦶 PyraStrike, R3 ⚡ PyraSpark (same engine, own rules) ----------
  var MODES = {
    beach: { id: 'beach', sport: 'spike', name: 'Beach 2v2', icon: '🏖️', n: 2, L: 8, W: 8, net: 2.1, sand: true,
      roles: [['drive', 'dunk'], ['dink']],
      base: function (L, W) { return [[L * 0.55, -0.22 * W], [L * 0.55, 0.22 * W]]; } },
    small: { id: 'small', sport: 'spike', name: 'Small 3v3', icon: '🏫', n: 3, L: 7, W: 7, net: 2.1,
      roles: [['drive'], ['dink'], ['dunk']],
      base: function (L, W) { return [[L * 0.72, 0], [1.5, 0.2 * W], [L * 0.42, -0.25 * W]]; } },
    full: { id: 'full', sport: 'spike', name: 'Full 6v6', icon: '🏟️', n: 6, L: 9, W: 9, net: 2.24,
      roles: [['drive'], ['dunk'], ['dink'], ['dunk'], ['drive'], ['drive']],
      base: function (L, W) { return [[L * 0.78, 0.3 * W], [1.4, 0.3 * W], [1.4, 0], [1.4, -0.3 * W], [L * 0.78, -0.3 * W], [L * 0.66, 0]]; } }
  };
  /* 🦶 PyraStrike (pd-2b, sepak takraw ตะกร้อ): feet, knees, head — never hands. Low net, narrow court, a woven rattan ball.
     One player may use 1, 2 or all 3 touches (no double-touch fault); the serve is a kick off a teammate's toss (the feed). */
  MODES.strikesolo = { id: 'strikesolo', sport: 'strike', name: 'Strike 1v1', icon: '🦶', n: 1, L: 6.7, W: 6.1, net: 1.52,
    roles: [['drive', 'dink', 'dunk']], base: function (L, W) { return [[L * 0.5, 0]]; } };
  MODES.strikeduo = { id: 'strikeduo', sport: 'strike', name: 'Strike Duo 2v2', icon: '🦵', n: 2, L: 6.7, W: 6.1, net: 1.52,
    roles: [['drive', 'dink'], ['dunk']], base: function (L, W) { return [[L * 0.62, -0.18 * W], [1.6, 0.2 * W]]; } };
  MODES.strikeregu = { id: 'strikeregu', sport: 'strike', name: 'Strike Regu 3v3', icon: '🧶', n: 3, L: 6.7, W: 6.1, net: 1.52,
    roles: [['drive'], ['dink'], ['dunk']], base: function (L, W) { return [[L * 0.66, 0], [1.4, 0.26 * W], [1.4, -0.26 * W]]; } };
  /* ⭕ Hoop takraw (pd-2c, ตะกร้อลอดห่วง): your team stands in a circle under a hanging hoop and keeps the ball up with feet, knees and
     head — kick it THROUGH the hoop for points (harder moves score more). Each team gets a timed turn; most points wins. */
  MODES.hoop = { id: 'hoop', sport: 'hoop', name: 'Hoop Takraw', icon: '⭕', n: 3, L: 3.4, W: 6.4, net: 0,
    roles: [['dunk'], ['dink'], ['drive']], base: function () { return [[0, 0], [0, 0], [0, 0]]; } };
  /* ⚡ PyraSpark (pd-3a, plan §2/§9/§10): a curved net-TABLE game (our own version — never the brand name). Players stand off the table ends;
     the ball must bounce ONCE on your half (twice on 🌱 Basic), then your side gets up to 3 touches — feet, knees, chest, head, never
     hands — and sends it back onto the other half. 💥 EDGE balls count. 2 serve tries; the serve changes every 4 points.
     Duo (2v2): from 🐣 Junior both partners must touch it before it goes back. M.L / M.W = the floor area (view); the table is SPARK.* */
  var SPARK = { Z: 0.76, L: 1.5, W: 1.7, NET: 0.14, EDGE: 0.05 };
  MODES.sparksolo = { id: 'sparksolo', sport: 'spark', name: 'Spark 1v1', icon: '⚡', n: 1, L: 3.0, W: 3.8, net: SPARK.Z + SPARK.NET,
    roles: [['drive', 'dink', 'dunk']], base: function () { return [[2.35, 0]]; } };
  MODES.sparkduo = { id: 'sparkduo', sport: 'spark', name: 'Spark Duo 2v2', icon: '🌩️', n: 2, L: 3.0, W: 3.8, net: SPARK.Z + SPARK.NET,
    roles: [['drive', 'dink'], ['dunk']], base: function () { return [[2.4, -0.75], [2.25, 0.75]]; } };
  /* 🎯 TRAINING (pd-4a, plan §10): drills on the ⚡ table (a 🧑‍🏫 Coach robot feeds you) + 🤹 Keepy-up on the ⭕ circle floor.
     🎪 FUN: 🌀 Spark Party — a bouncy ball + extra balls at once. Ids letters only (UI.modeLink). */
  var DRILL = {
    zone: { time: [90, 75, 60, 60, 55, 45], cells: [[1, 2], [2, 2], [3, 2], [3, 2], [3, 3], [3, 3]], help: [1, 0.7, 0.4, 0.2, 0, 0], stars: [[15, 30, 45], [15, 30, 45], [15, 28, 40], [15, 28, 40], [12, 24, 36], [10, 20, 32]] },
    combo: { time: [90, 75, 60, 60, 55, 45], stars: [[8, 18, 30], [8, 18, 30], [8, 18, 30], [8, 18, 30], [8, 16, 26], [8, 16, 26]] },
    run: { time: [90, 90, 90, 90, 90, 90], lives: [5, 4, 3, 3, 2, 1], up: 1.05, cap: 1.9, stars: [[6, 12, 20], [6, 12, 20], [6, 12, 20], [8, 14, 22], [6, 12, 18], [4, 8, 12]] },
    juggle: { time: [60, 60, 50, 45, 45, 40], stars: [[15, 30, 50], [15, 30, 50], [15, 32, 52], [15, 32, 52], [15, 32, 52], [12, 28, 48]] }
  };
  var PARTY = { balls: [2, 3, 3, 3, 3, 3], bounce: 0.94, target: [9, 13, 17, 21, 21, 21] };
  MODES.zonehits = { id: 'zonehits', sport: 'spark', drill: 'zone', name: 'Zone Hits', icon: '🎯', n: 1, L: 3.0, W: 3.8, net: SPARK.Z + SPARK.NET,
    roles: [['drive', 'dink', 'dunk']], base: function () { return [[2.35, 0]]; } };
  MODES.combo = { id: 'combo', sport: 'spark', drill: 'combo', name: 'Body Combo', icon: '🔗', n: 1, L: 3.0, W: 3.8, net: SPARK.Z + SPARK.NET,
    roles: [['drive', 'dink', 'dunk']], base: function () { return [[2.35, 0]]; } };
  MODES.rallyrun = { id: 'rallyrun', sport: 'spark', drill: 'run', name: 'Rally Run', icon: '🏃', n: 1, L: 3.0, W: 3.8, net: SPARK.Z + SPARK.NET,
    roles: [['drive', 'dink', 'dunk']], base: function () { return [[2.35, 0]]; } };
  MODES.juggle = { id: 'juggle', sport: 'hoop', drill: 'juggle', name: 'Juggle', icon: '🤹', n: 1, L: 3.4, W: 6.4, net: 0, noHoop: true,
    roles: [['dunk']], base: function () { return [[0, 0]]; } };
  MODES.party = { id: 'party', sport: 'spark', party: true, name: 'Spark Party', icon: '🌀', n: 1, L: 3.0, W: 3.8, net: SPARK.Z + SPARK.NET,
    roles: [['drive', 'dink', 'dunk']], base: function () { return [[2.35, 0]]; } };
  var MODE_ORDER = ['beach', 'small', 'full', 'strikesolo', 'strikeduo', 'strikeregu', 'hoop', 'sparksolo', 'sparkduo', 'zonehits', 'combo', 'rallyrun', 'juggle', 'party'];
  // takraw names for the same moves (auto body part by height): dig = 🦶 toe save · bump = 🦵 thigh trap · set = 🙆 head set · dink = 🦶 heel tip · dunk = 🌀 roll spike / 🚲 bicycle · block = 🧱 back block · serve = 🦶 kick serve
  var STRIKE_NAME = { drive: 'Kick Serve', bump: 'Trap', dig: 'Toe Save', dive: 'Dive', set: 'Head Set', dink: 'Heel Tip', dunk: 'Roll Strike', bicycle: 'Bicycle', block: 'Back Block', pinch: 'Tip Serve', jumpserve: 'Power Kick' };
  var STRIKE_PART = { dig: 'foot', bump: 'thigh', dive: 'foot', set: 'head', dink: 'heel', dunk: 'foot', drive: 'foot', block: 'back' };
  function isStrike(M) { return M.sp.sport === 'strike' || M.sp.sport === 'hoop'; }   // ⭕ hoop takraw is takraw too (feet, poses, ball)
  function isSpark(M) { return M.sp.sport === 'spark'; }
  function noHands(M) { return M.sp.sport !== 'spike'; }   // 🦶 ⭕ ⚡ feet, knees, chest, head — never hands
  var SPARK_NAME = { drive: 'Drive', bump: 'Trap', set: 'Pop', dig: 'Dig', dive: 'Dive', dink: 'Dink', dunk: 'Dunk', edge: 'Edge', block: 'Block' };
  function actName(M, act) { return (isSpark(M) ? SPARK_NAME[act] : isStrike(M) ? STRIKE_NAME[act] : null) || ACT_NAME[act] || act; }
  var ROLE_ICON = { drive: '🚀', dink: '🪶', dunk: '💥' };
  var ROLE_NAME = { drive: 'Drive', dink: 'Dink', dunk: 'Dunk' };

  // ---------- levels (plan §9) ----------
  // spd = ball speed · fill = meter fill · four / dbl / net = faults on · rot = roles rotate · aim = aim help (m kept inside the lines)
  // bot = the robots: react (s), err (m), reach (×), miss (chance to whiff), move (m/s), spike (chance to dunk the 3rd touch), block (chance to jump a block), dink
  // assist = the people: reach (×), slowmo (🌱 the ball waits for you: 1 = always, n = first n touches), autoMove, autoDig (m), setToYou (the 3rd touch is yours)
  var LEVELS = [
    { name: 'Basic', spd: 0.72, fill: 1.6, four: false, dbl: false, net: false, rot: false, aim: 1.3, target: 7, sets: 1,
      bot: { react: 0.55, err: 1.6, reach: 0.85, miss: 0.22, move: 3.0, spike: 0.25, block: 0, dink: 0.5, smart: 0 },
      assist: { reach: 1.75, slowmo: 1, autoMove: 1, autoDig: 0.9, setToYou: true, autoPower: true } },
    { name: 'Junior', spd: 0.82, fill: 1.3, four: true, dbl: false, net: false, rot: false, aim: 0.9, target: 11, sets: 1,
      bot: { react: 0.45, err: 1.2, reach: 0.95, miss: 0.14, move: 3.5, spike: 0.5, block: 0.1, dink: 0.4, smart: 0.2 },
      assist: { reach: 1.4, slowmo: 6, autoMove: 0.55, autoDig: 0.7, setToYou: true, autoPower: true } },
    { name: 'Intermediate', spd: 1.0, fill: 1.0, four: true, dbl: true, net: true, rot: false, aim: 0.5, target: 15, sets: 1,
      bot: { react: 0.36, err: 0.85, reach: 1.0, miss: 0.08, move: 4.1, spike: 0.7, block: 0.3, dink: 0.3, smart: 0.5 },
      assist: { reach: 1.15, slowmo: 0, autoMove: 0, autoDig: 0.55, setToYou: false, autoPower: false } },
    { name: 'Hard', spd: 1.0, fill: 1.0, four: true, dbl: true, net: true, rot: true, aim: 0.4, target: 21, sets: 1,
      bot: { react: 0.28, err: 0.6, reach: 1.05, miss: 0.05, move: 4.6, spike: 0.8, block: 0.45, dink: 0.25, smart: 0.7 },
      assist: { reach: 1.05, slowmo: 0, autoMove: 0, autoDig: 0.5, setToYou: false, autoPower: false } },
    { name: 'Extreme', spd: 1.15, fill: 0.8, four: true, dbl: true, net: true, rot: true, aim: 0, target: 15, sets: 3,
      bot: { react: 0.22, err: 0.45, reach: 1.1, miss: 0.03, move: 5.0, spike: 0.9, block: 0.6, dink: 0.2, smart: 0.85 },
      assist: { reach: 0.97, slowmo: 0, autoMove: 0, autoDig: 0.45, setToYou: false, autoPower: false } },
    { name: 'Hardcore', spd: 1.3, fill: 0.6, four: true, dbl: true, net: true, rot: true, aim: 0, target: 15, sets: 3, hardcore: true,
      bot: { react: 0.18, err: 0.35, reach: 1.15, miss: 0.02, move: 5.4, spike: 1, block: 0.7, dink: 0.2, smart: 1 },
      assist: { reach: 0.92, slowmo: 0, autoMove: 0, autoDig: 0.4, setToYou: false, autoPower: false } }
  ];
  // 🔥 Pyra meter (plan §5): points per source, × the level's fill
  var FILL = { serve: 4, ace: 12, bump: 2, set: 4, assist: 8, dunk: 5, kill: 12, dink: 3, dinkKill: 10, save: 8, block: 6, stuff: 10, rally: 3, lose: 2 };
  var PYRA_COST = 50, METER_MAX = 100;
  var ACT_NAME = { jumpserve: 'Jump Serve', pinch: 'Pinch Serve', drive: 'Drive', bump: 'Bump', dig: 'Dig', dive: 'Dive', set: 'Set', dink: 'Dink', dunk: 'Dunk', block: 'Block' };
  function pyraName(act, M) { return 'Pyra…' + (M ? actName(M, act) : ACT_NAME[act] || act); }
  /* 🔥🔥 Spirit Dive (pd-2a, plan §6–7): a FULL flame + 🔥 arms a Spirit Dive — the next Dunk / Block / Drive (serve) / Dink / Save
     calls a creature (2 per slot in R2, 5 in R4) and costs the whole flame. Bumps + sets on the way keep it armed. */
  var SPIRIT_COST = 100;
  var SP_ = function (k, name, icon, col) { return { k: k, name: name, icon: icon, col: col }; };
  var SPIRITS = {   // 🔥🔥 one full flame (R3: 4 per slot — the same keys + names as SpiritBestiary)
    dunk: [SP_('dragon', 'Dragon', '🐉', '#E5304B'), SP_('singha', 'Singha', '🦁', '#FFB627'), SP_('thunderbird', 'Thunderbird', '⚡', '#2F7BEA'), SP_('ifrit', 'Ifrit', '🧞', '#FF6B1A'), SP_('minotaur', 'Minotaur', '🐂', '#8C4A2F')],
    block: [SP_('golem', 'Golem', '🗿', '#8C7B6B'), SP_('gajasiha', 'Gajasiha', '🐘', '#7B4FE0'), SP_('titan', 'Titan', '⛰️', '#5C6B80'), SP_('kraken', 'Kraken', '🦑', '#2FA3A3'), SP_('colossus', 'Colossus', '🏛️', '#C9A86A')],
    drive: [SP_('phoenix', 'Phoenix', '🐦‍🔥', '#FF6B1A'), SP_('hongsa', 'Hongsa', '🦢', '#F2D79E'), SP_('pegasus', 'Pegasus', '🐎', '#9BB6E0'), SP_('griffin', 'Griffin', '🦅', '#C98A2F'), SP_('roc', 'Roc', '🪶', '#A07850')],
    dink: [SP_('kitsune', 'Kitsune', '🦊', '#FF8A3D'), SP_('kinnaree', 'Kinnaree', '🧚', '#E6A3FF'), SP_('ghost', 'Ghost', '👻', '#C9D4E8'), SP_('sphinx', 'Sphinx', '🏺', '#E0B85A'), SP_('wisp', 'Will-o\'-wisp', '✨', '#BFE3FF')],
    save: [SP_('naga', 'Naga', '🐍', '#2FBF71'), SP_('makara', 'Makara', '🐊', '#2F7BEA'), SP_('salamander', 'Salamander', '🦎', '#FF8A3D'), SP_('leviathan', 'Leviathan', '🐋', '#2F5FB8'), SP_('kappa', 'Kappa', '🐢', '#4DAF50')]
  };   // pd-4b: R4 = 5 per slot (all 25 solo)
  var SPIRITS_DUO = {   // 🔥🔥×2 two full flames on one team
    dunk: [SP_('garuda', 'Garuda', '🦅', '#E5304B'), SP_('gandaberunda', 'Gandaberunda', '🦅🦅', '#FFB627'), SP_('twindragon', 'Twin Dragon', '🐉🐉', '#FF4D8D'), SP_('paksa', 'Paksa Hasadin', '🐘🦅', '#7B4FE0'), SP_('twingriffin', 'Twin Griffin', '🦅🦁', '#C98A2F')],
    block: [SP_('orthrus', 'Orthrus', '🐕🐕', '#8C4A2F'), SP_('twinsingha', 'Twin Singha', '🦁🦁', '#FFB627'), SP_('twinyaksha', 'Twin Yaksha', '🛡️🛡️', '#2FBF71'), SP_('amphisbaena', 'Amphisbaena', '🐍🐍', '#4DAF50'), SP_('twingolem', 'Twin Golem', '🗿🗿', '#8C7B6B')],
    dink: [SP_('twinghost', 'Twin Ghost', '👻👻', '#C9D4E8'), SP_('kitsunepair', 'Kitsune pair', '🦊🦊', '#FF8A3D'), SP_('mirrorimp', 'Mirror Imp', '🪞', '#9BB6E0'), SP_('wisppair', 'Wisp pair', '✨✨', '#BFE3FF'), SP_('shadowtwins', 'Shadow Twins', '🌑🌑', '#5C5C8A')]
  };
  var SPIRITS_TRIO = {   // 🔥🔥×3 three full flames: the Combo (dig → set → spike, the point counts double) or the Block
    combo: [SP_('chimera', 'Chimera', '🦁🐐🐍', '#FF6B1A'), SP_('hydra', 'Hydra', '🐲🐲🐲', '#2FBF71'), SP_('erawan', 'Erawan', '🐘🐘🐘', '#F2D79E'), SP_('asura', 'Asura', '💪💪💪', '#E5304B'), SP_('geryon', 'Geryon', '🛡️🛡️🛡️', '#5C6B80')],
    block: [SP_('cerberus', 'Cerberus', '🐕🐕🐕', '#8C4A2F'), SP_('nagathree', 'Three-headed Naga', '🐍🐍🐍', '#2FBF71'), SP_('tripletitan', 'Triple Titan', '⛰️⛰️⛰️', '#5C6B80'), SP_('orochi', 'Orochi', '🐲', '#7B4FE0'), SP_('jiulong', 'Jiulong', '🐉🐉🐉', '#FFB627')]
  };
  var SPIRIT_MOVE = { dunk: 'Dunk', block: 'Block', drive: 'Drive', dink: 'Dink', save: 'Save', combo: 'Combo' }, SPIRIT_MOVE_STRIKE = { dunk: 'Strike', block: 'Block', drive: 'Kick', dink: 'Tip', save: 'Save', combo: 'Combo' };
  var TIER_NAME = { solo: 'Spirit Dive', duo: 'Spirit Duo Dive', trio: 'Spirit Trio Dive' };
  function slotOf(act) { return act === 'dunk' ? 'dunk' : act === 'drive' ? 'drive' : act === 'dink' ? 'dink' : act === 'block' ? 'block' : act === 'dig' || act === 'dive' ? 'save' : null; }
  function pickSpirit(M, p, tier, slot, list) {   // ⭐ pd-4b favourite pin (🔥 Intermediate +): the creature this player pinned for the slot, else random
    var k = M.level >= 2 && p.pins ? p.pins[tier + ':' + slot] : null, c = k ? list.filter(function (x) { return x.k === k; })[0] : null;
    return c || list[Math.floor(M.rnd() * list.length)];
  }
  function teamSpiritOf(M, p) { var ts = M.teamSpirit && M.teamSpirit[p.team]; return ts && ts.ids.indexOf(p.id) >= 0 ? ts : null; }
  function spiritGo(M, p, act) {   // → the creature, or null when this move has no Spirit slot / nothing armed
    var ts = teamSpiritOf(M, p);
    if (ts) {   // 🔥🔥×2 / ×3: only the team's own slots fire it (no solo spirit while the team waits)
      var tslot = ts.tier === 'duo' ? { dunk: 'dunk', block: 'block', dink: 'dink', edge: 'dink', hoop: 'dunk' }[act] : act === 'block' ? 'block' : ts.combo && ts.combo.step >= 2 && (act === 'dunk' || act === 'drive' || act === 'dink' || act === 'hoop') ? 'combo' : null;
      if (!tslot) return null;
      var mem = ts.ids.map(function (id) { return byId(M, id); });
      if (mem.some(function (q) { return q.meter < SPIRIT_COST; })) { M.teamSpirit[p.team] = null; return null; }
      var tl = (ts.tier === 'duo' ? SPIRITS_DUO : SPIRITS_TRIO)[tslot], tc = pickSpirit(M, p, ts.tier, tslot, tl);
      mem.forEach(function (q) { q.meter -= SPIRIT_COST; q.spiritArm = false; q.pyraArm = false; q.st[ts.tier + 's'] = (q.st[ts.tier + 's'] || 0) + 1; });
      M.teamSpirit[p.team] = null; if (tslot === 'combo') M.trioPoint = p.team;
      var tsp = { slot: tslot, tier: ts.tier, k: tc.k, name: tc.name, icon: tc.icon, col: tc.col, ids: ts.ids.slice(), full: TIER_NAME[ts.tier] + ' : ' + tc.name + ' ' + (isStrike(M) || isSpark(M) ? SPIRIT_MOVE_STRIKE : SPIRIT_MOVE)[tslot] };
      ev(M, 'spirit', { p: p.id, team: p.team, act: act, slot: tslot, tier: ts.tier, ids: ts.ids.slice(), creature: tc.k, cname: tc.name, icon: tc.icon, name: tsp.full });
      return tsp;
    }
    var slot = slotOf(act === 'hoop' ? 'dunk' : act); if (!slot || !p.spiritArm || p.meter < SPIRIT_COST) return null;
    var list = SPIRITS[slot], c = pickSpirit(M, p, 'solo', slot, list);
    p.meter -= SPIRIT_COST; p.spiritArm = false; p.pyraArm = false; p.st.spirits = (p.st.spirits || 0) + 1;
    var sp = { slot: slot, tier: 'solo', k: c.k, name: c.name, icon: c.icon, col: c.col, ids: [p.id], full: 'Spirit Dive : ' + c.name + ' ' + (isStrike(M) || isSpark(M) ? SPIRIT_MOVE_STRIKE : SPIRIT_MOVE)[slot] };
    ev(M, 'spirit', { p: p.id, team: p.team, act: act, slot: slot, tier: 'solo', ids: [p.id], creature: c.k, cname: c.name, icon: c.icon, name: sp.full });
    return sp;
  }
  // 🔥🔥 arming: 2 or 3 full flames on one team arm TOGETHER (×2 Duo / ×3 Trio); the trio's combo starts at the team's next first touch
  function armTeam(M, p) {
    var T = p.team; if (!M.teamSpirit) M.teamSpirit = [null, null];
    if (!p.spiritArm) { if (teamSpiritOf(M, p)) M.teamSpirit[T] = null; return; }
    var full = teamOf(M, T).filter(function (q) { return q.meter >= SPIRIT_COST; });
    full.sort(function (a, c) { return (a.id === p.id ? -1 : 0) - (c.id === p.id ? -1 : 0); });
    if (full.length < 2) return;
    var ids = full.slice(0, 3).map(function (q) { return q.id; }), tier = ids.length === 3 ? 'trio' : 'duo';
    M.teamSpirit[T] = { tier: tier, ids: ids, combo: null };
    ids.forEach(function (id) { var q = byId(M, id); q.spiritArm = true; q.pyraArm = true; });
    ev(M, 'teamSpirit', { team: T, tier: tier, ids: ids });
  }
  function comboStep(M, p, attack) {   // 🔥🔥×3 Trio Combo: count the team's touches (dig → set → spike)
    var ts = M.teamSpirit && M.teamSpirit[p.team]; if (!ts || ts.tier !== 'trio') return;
    if (!ts.combo) { if (attack) return; ts.combo = { step: 1 }; ev(M, 'spiritCombo', { team: p.team, p: p.id, step: 1 }); return; }
    if (!attack) { ts.combo.step = Math.min(2, ts.combo.step + 1); ev(M, 'spiritCombo', { team: p.team, p: p.id, step: ts.combo.step }); }
  }
  function comboEnd(M, T) { var ts = M.teamSpirit && M.teamSpirit[T]; if (ts && ts.combo) ts.combo = null; }


  // ---------- helpers ----------
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sgn(team) { return team === 0 ? -1 : 1; }
  function uOf(team, x) { return x * sgn(team); }
  function hyp(a, b) { return Math.sqrt(a * a + b * b); }
  function ev(M, k, o) { var e = o || {}; e.k = k; e.t = Math.round(M.t * 1000) / 1000; M.events.push(e); if (M.log.length > 600) M.log.shift(); M.log.push(e); return e; }
  // 🪐 pd-4c theme arenas: the moon court is floaty (less gravity — every shot is still solved with the same g, so aims stay right)
  var ARENA_GRAV = { moon: 0.7 };
  function ballG(M) { return 9.8 * M.lv.spd * M.lv.spd * 0.55 * (M.grav || 1); }
  function teamOf(M, t) { return M.players.filter(function (p) { return p.team === t; }); }
  function byId(M, id) { return id == null ? null : M.players[id]; }
  function isPerson(p) { return !!p.human && !p.auto; }
  function has(p, role) { return p.roles.indexOf(role) >= 0; }

  // ---------- new match ----------
  // cfg = {mode, level, seed, teams: [[{name, av, human: 0|1|2}], [...]]} — missing seats become 🤖 robots
  function newMatch(cfg) {
    var sp = MODES[cfg.mode] || MODES.beach, lv = LEVELS[clamp(cfg.level | 0, 0, 5)], M = {
      arena: cfg.arena || 'classic', grav: ARENA_GRAV[cfg.arena] || 1,
      mode: sp.id, sp: sp, level: clamp(cfg.level | 0, 0, 5), lv: lv, rnd: rng(cfg.seed || 7), L: sp.L, W: sp.W, netH: sp.net,
      t: 0, acc: 0, realT: 0, players: [], teams: [], events: [], log: [], phase: 'serve', phaseT: 0,
      ball: { x: 0, y: 0, z: 1, vx: 0, vy: 0, vz: 0, held: null, pyra: null, hitT: -9, trail: [] },
      serveTeam: 0, side: 0, n: 0, lastP: null, lastAct: null, lastTeam: null, lastBlock: false, serveFresh: false,
      recv: [null, null], cp: [null, null], spiker: [null, null], setter: [null, null], assignT: 0,
      rally: 0, rallyMax: 0, tscale: 1, guide: null, waitReal: 0, guidedLeft: lv.assist.slowmo > 1 ? lv.assist.slowmo : 0,
      target: cfg.target || lv.target, setsTo: lv.sets === 3 && !cfg.oneSet ? 2 : 1, setNo: 1, winner: null, deficit: [0, 0], over: false, teamSpirit: [null, null], trioPoint: null
    };
    for (var t = 0; t < 2; t++) {
      var want = (cfg.teams && cfg.teams[t]) || [], seats = [], n = sp.n;
      // people first get a 💥 Dunk slot (the fun one), then 🪶 / 🚀; robots fill the rest
      var order = [];
      for (var s = 0; s < n; s++) order.push(s);
      order.sort(function (a, b) { return rank(sp.roles[a]) - rank(sp.roles[b]); });
      var people = want.filter(function (w) { return w && w.human; }), bots = want.filter(function (w) { return w && !w.human; });
      for (s = 0; s < n; s++) seats[s] = null;
      people.forEach(function (w, i) { if (i < n) seats[order[i]] = w; });
      var bi = 0;
      for (s = 0; s < n; s++) if (!seats[s]) seats[s] = bots[bi++] || { name: '🤖', bot: true };
      M.teams.push({ i: t, score: 0, sets: 0, slots: [] });
      for (s = 0; s < n; s++) {
        var w = seats[s], p = {
          id: M.players.length, team: t, slot: s, name: w.name || '🤖', av: w.av || null, pins: w.pins || null, human: w.human || 0, auto: !!w.auto, bot: !w.human,
          roles: sp.roles[s].slice(), x: 0, y: 0, z: 0, vz: 0, vx: 0, vy: 0, dir: t === 0 ? 1 : -1, walkT: 0, state: 'ready', stT: 0, act: null, actT: 9,
          input: { x: 0, y: 0 }, want: null, dive: null, block: 0, recover: 0, meter: 0, pyraArm: false, pyraBlock: false, charge: -1, aimF: 0, aimS: 0,
          willMiss: false, missFor: -1, gest: null, cheerT: 0,
          st: { aces: 0, kills: 0, assists: 0, digs: 0, dives: 0, blocks: 0, stuffs: 0, bumps: 0, sets: 0, dinks: 0, dunks: 0, drives: 0, pyras: 0, touches: 0, jumpServes: 0, pinches: 0, spirits: 0 }
        };
        M.players.push(p); M.teams[t].slots[s] = p.id;
      }
    }
    if (sp.drill) drillInit(M);
    if (sp.party) { M.setsTo = 1; M.target = cfg.target || PARTY.target[M.level]; M.extras = []; for (var xb = 0; xb < PARTY.balls[M.level]; xb++) M.extras.push(partyBall(M, xb, 1.2 + xb * 1.4)); }
    if (sp.sport === 'hoop') hoopInit(M); else if (sp.sport === 'spark') sparkServe(M, sp.drill ? 1 : 0, true); else startServe(M, 0);
    return M;
  }
  function rank(roles) { return roles.indexOf('dunk') >= 0 ? 0 : roles.indexOf('dink') >= 0 ? 1 : 2; }

  function baseOf(M, p) { var b = M.sp.base(M.L, M.W)[p.slot]; return { x: b[0] * sgn(p.team), y: b[1] * (p.team === 0 ? 1 : -1) }; }
  function serveSpot(M, team) { return { x: (M.L + 0.7) * sgn(team), y: -0.24 * M.W }; }   // the far corner: never behind the touch stick / buttons
  function serverOf(M, team) { return byId(M, M.teams[team].slots[0]); }
  /* 🧺 pd-5e (Aowu 12:20 "the toss person should have the ball and need to be in the court corner circle and toss the ball to the server"):
     🦶 PyraStrike like real takraw — the server (tekong) stands in the SERVICE CIRCLE, a teammate holds the ball in the QUARTER CIRCLE
     at the net and tosses it to the server's foot. 1v1 has no buddy: you toss it to yourself in the circle. */
  function isKick(M) { return M.sp.sport === 'strike'; }
  function circleSpot(M, team) { return { x: (M.L - 2.45) * sgn(team), y: 0 }; }   // the service circle (drawn at L − 2.45)
  function feedSpot(M, team) { return { x: 0.5 * sgn(team), y: M.W / 2 - 0.5 }; }   // the NEAR quarter circle at the net (the far one hides behind the net post; the middle of the screen is free of the stick + buttons)
  function feederOf(M, team) {
    var s = serverOf(M, team), mates = teamOf(M, team).filter(function (q) { return q.id !== s.id; }); if (!mates.length) return null;
    var fs = feedSpot(M, team), d = function (q) { var b = baseOf(M, q); return hyp(b.x - fs.x, b.y - fs.y); };
    return mates.filter(function (q) { return has(q, 'dink'); })[0] || mates.sort(function (a, c) { return d(a) - d(c); })[0];
  }

  function startServe(M, team) {
    M.phase = 'serve'; M.phaseT = 0; M.serveTeam = team; M.side = team; M.n = 0; M.lastP = null; M.lastAct = null; M.lastTeam = null; M.lastBlock = false;
    M.recv = [null, null]; M.cp = [null, null]; M.spiker = [null, null]; M.setter = [null, null]; M.rally = 0; M.serveFresh = false;
    M.players.forEach(function (p) { var b = baseOf(M, p); p.x = b.x; p.y = b.y; p.z = 0; p.vz = 0; p.jf = 1; p.approach = null; p.dive = null; p.block = 0; p.want = null; p.state = 'ready'; p.act = null; p.charge = -1; p.recover = 0; });
    M.players.forEach(function (q) { q.jumpServe = null; q.feed = null; });
    var s = serverOf(M, team), sp = isKick(M) ? circleSpot(M, team) : serveSpot(M, team); s.x = sp.x; s.y = sp.y;
    M.feeder = null; if (isKick(M)) { var fd = feederOf(M, team); if (fd) { var fq = feedSpot(M, team); fd.x = fq.x; fd.y = fq.y; fd.dir = team === 0 ? -1 : 1; M.feeder = fd.id; } }   // 🧺 the tosser faces the server
    var b = M.ball; b.held = s.id; b.pyra = null; b.spirit = null; b.spiritSlot = null; b.spiritTier = null; b.vx = b.vy = b.vz = 0; b.trail = []; placeHeld(M);
    M.serveWait = (M.level === 0 ? 1.6 : 0.9) + M.rnd() * 0.8;
    ev(M, 'serveReady', { team: team, p: s.id });
  }
  function placeHeld(M) { var b = M.ball, p = byId(M, b.held); if (!p) return;
    if (p.feed) {   // 🦶 the feed: a teammate (or you, in 1v1) tosses the ball up to your kicking foot
      var f = clamp((M.t - p.feed.t0) / (p.feed.T || FEED_T), 0, 1), fd = byId(M, p.feed.by) || p, kx = p.x - 0.45 * sgn(p.team), sx = fd === p ? p.x - 0.2 * sgn(p.team) : fd.x, sy = fd === p ? p.y : fd.y;
      b.x = sx + (kx - sx) * f; b.y = sy + (p.y - sy) * f; b.z = 1.0 + 0.3 * f + (fd === p ? 1.5 : 1.7) * Math.sin(Math.PI * f); return; }
    var hf = M.feeder != null && byId(M, M.feeder); if (hf && M.phase === 'serve') { b.x = hf.x + 0.3 * hf.dir; b.y = hf.y; b.z = 0.95; return; }   // 🧺 in the tosser's hands
    b.x = p.x + 0.35 * p.dir; b.y = p.y; b.z = p.jumpServe ? p.z + 2.7 + 0.6 * Math.max(0, p.vz) / JUMPV : 1.1 + (p.charge >= 0 ? 0.6 : 0); }   // 🦘 jump serve: the ball is tossed above the head

  // ---------- ball flight maths ----------
  // aim from (b) to (tx, ty, tz) with the top of the arc at height apex
  function lob(M, b, tx, ty, tz, apex) {
    var g = ballG(M); apex = Math.max(apex, b.z + 0.25, tz + 0.25);
    var vz = Math.sqrt(2 * g * (apex - b.z)), t1 = vz / g, t2 = Math.sqrt(2 * (apex - tz) / g), T = t1 + t2;
    b.vx = (tx - b.x) / T; b.vy = (ty - b.y) / T; b.vz = vz; return T;
  }
  // a hit with a flight time T (straighter); makes T longer until the ball clears the net by `clear`
  function shoot(M, b, tx, ty, tz, speed, clear) {
    if (M.drill && M.drill.spd) speed *= M.drill.spd;   // 🏃 Rally Run: the ball gets faster
    var g = ballG(M), d = hyp(tx - b.x, ty - b.y), T = Math.max(0.25, d / speed);
    for (var i = 0; i < 14; i++) {
      var vx = (tx - b.x) / T, vz = (tz - b.z + 0.5 * g * T * T) / T;
      if (clear == null || (b.x === 0 || (tx * b.x) > 0)) { b.vx = vx; b.vy = (ty - b.y) / T; b.vz = vz; return T; }
      var tc = -b.x / vx, zc = b.z + vz * tc - 0.5 * g * tc * tc;
      if (tc <= 0 || zc >= M.netH + clear) { b.vx = vx; b.vy = (ty - b.y) / T; b.vz = vz; return T; }
      T *= 1.12;
    }
    b.vx = (tx - b.x) / T; b.vy = (ty - b.y) / T; b.vz = (tz - b.z + 0.5 * g * T * T) / T; return T;
  }
  // where will the ball be when it comes DOWN to height z (first time, descending)? also crossing / landing. Simple copy, no players.
  function predict(M, zLevel) {
    var b = M.ball, g = ballG(M), x = b.x, y = b.y, z = b.z, vx = b.vx, vy = b.vy, vz = b.vz, h = 1 / 90, t = 0, at = null;
    for (var i = 0; i < 900; i++) {
      var px = x; vz -= g * h; x += vx * h; y += vy * h; z += vz * h; t += h;
      if (px * x < 0 && z < M.netH && Math.abs(y) < M.W / 2 + 0.5) { x = px; vx = -vx * 0.2; }
      if (!at && vz < 0 && z <= zLevel) at = { x: x, y: y, z: z, t: t };
      if (z <= BALL_R) return { at: at || { x: x, y: y, z: z, t: t }, land: { x: x, y: y, t: t } };
    }
    return { at: at || { x: x, y: y, z: z, t: t }, land: { x: x, y: y, t: t } };
  }
  function inCourt(M, x, y, m) { m = m || 0; return Math.abs(x) <= M.L + BALL_R - m && Math.abs(y) <= M.W / 2 + BALL_R - m; }

  // ---------- who plays the next touch ----------
  function nextNOf(M, team) { return (team === M.side ? M.n : 0) + 1; }
  function assign(M) {
    var pr = predict(M, BALL_R), land = pr.land, T = land.x < 0 ? 0 : 1, nn = nextNOf(M, T);
    M.recv = [null, null]; M.cp = [null, null];
    var zc = nn === 3 ? 2.7 : nn === 2 ? 2.0 : 1.0, cpr = predict(M, zc), cp = cpr.at;
    if (cpr.at.z > zc + 0.6) cp = cpr.land;
    var out = !inCourt(M, land.x, land.y, -0.25);
    var cands = teamOf(M, T).filter(function (p) { return !(M.lastTeam === T && M.lastP === p.id && !M.lastBlock && T === M.side) || (isStrike(M) && teamOf(M, T).length === 1); });
    if (!cands.length) return;
    var who = null, person = cands.filter(isPerson)[0];
    var dist = function (p) { return hyp(p.x - cp.x, p.y - cp.y); };
    if (nn === 3 && M.spiker[T] != null && cands.some(function (p) { return p.id === M.spiker[T]; })) who = byId(M, M.spiker[T]);
    else if (nn === 3 && person && M.lv.assist.setToYou) who = person;
    else if (nn === 2) who = cands.filter(function (p) { return has(p, 'dink'); }).sort(function (a, b) { return dist(a) - dist(b); })[0] || null;
    else if (nn === 3) who = cands.filter(function (p) { return has(p, 'dunk'); }).sort(function (a, b) { return dist(a) - dist(b); })[0] || null;
    if (!who) {
      cands.sort(function (a, b) { return dist(a) - dist(b); }); who = cands[0];
      var gen = M.lv.assist.setToYou ? 2 : 1.25, add = M.lv.assist.setToYou ? 1.5 : 0.4;   // 🌱 Basic / Junior: the kid gets more of the balls
      if (person && person !== who && dist(person) <= dist(who) * gen + add) who = person;
    }
    // a smart robot lets a ball that flies out drop
    var team = teamOf(M, T), anyBot = !isPerson(who);
    M.letGo = anyBot && out && M.rnd() < (M.lv.bot.smart * (who.team === humanTeam(M) ? 0.6 : 1));
    M.recv[T] = who.id; M.cp[T] = cp; M.assignT = M.t; M.landing = land; M.landTeam = T;
    who.willMiss = !isPerson(who) && M.rnd() < botMiss(M, who); who.missFor = M.rally;
    if (team.length && nn === 1) M.spiker[T] = null;
  }
  function humanTeam(M) { var h = M.players.filter(isPerson)[0]; return h ? h.team : -1; }
  function botMiss(M, p) { var m = M.lv.bot.miss * (p.team === humanTeam(M) ? 0.5 : 1); if (M.ball.pyra && M.lastTeam !== p.team) m += 0.25; if (M.ball.spirit && M.lastTeam !== p.team) m += 0.5; return m; }
  function planSpiker(M, T, setterId) {
    var c = teamOf(M, T).filter(function (p) { return p.id !== setterId; }); if (!c.length) c = teamOf(M, T);   // 🦶 1v1: you set yourself
    var person = c.filter(isPerson)[0];
    if (person && M.lv.assist.setToYou) return person;
    var d = c.filter(function (p) { return has(p, 'dunk'); });
    if (person && d.indexOf(person) >= 0) return person;
    return (d.length ? d : c).sort(function (a, b) { return uOf(T, a.x) - uOf(T, b.x); })[0] || null;
  }

  // ---------- reach + touches ----------
  function reachOf(M, p, key) {
    var r = 0.8 * (isPerson(p) ? M.lv.assist.reach : p.team === humanTeam(M) ? Math.max(1, M.lv.bot.reach) : M.lv.bot.reach);
    if (p.dive) r += 0.6;
    if (M.lastTeam != null && M.lastTeam !== p.team && (M.lastAct === 'dunk' || M.lastAct === 'drive') && M.ball.z < 1.2) r += 0.35;   // digging a hard hit: arms out wide
    if (M.ball.pyra && M.lastTeam !== p.team && M.lastTeam != null) r *= isPerson(p) ? 0.8 : 0.65;
    if (M.ball.spirit && M.lastTeam !== p.team && M.lastTeam != null) r *= M.ball.spiritTier && M.ball.spiritTier !== 'solo' ? 0.15 : M.level >= 5 ? 0.45 : 0.3;   // 🔥🔥 a Spirit attack: (almost) nobody gets there
    if (p.spiritArm && p.meter >= SPIRIT_COST && M.lastTeam !== p.team && M.lastTeam != null) r *= 1.8;   // 🔥🔥 Spirit Save: the creature carries you to the ball
    if (M.ball.pyra === 'set' && M.lastTeam === p.team) r *= 1.3;
    return r;
  }
  function canReach(M, p, key) {
    var b = M.ball; if (M.phase !== 'rally' || b.held != null) return false;
    if (M.lastP === p.id && M.t - b.hitT < 0.25) return false;
    if (uOf(p.team, b.x) < -0.05) return false;
    var hz = b.z - rz(p), dh = hyp(b.x - p.x, b.y - p.y);
    var hi = 2.45 + (key === 'drive' || key === 'dink' ? 0.25 : 0), lo = -0.05;
    return dh <= reachOf(M, p, key) && hz >= lo && hz <= hi;
  }
  function aimOf(M, p) { return { f: p.aimF || 0, s: p.aimS || 0 }; }
  function errPt(M, p, q, pyra) {
    if (pyra) return { x: 0, y: 0 };
    var e = (isPerson(p) ? 0.35 : M.lv.bot.err * (p.team === humanTeam(M) ? 0.6 : 1)) * (1.15 - q);
    return { x: (M.rnd() * 2 - 1) * e, y: (M.rnd() * 2 - 1) * e };
  }
  function keepIn(M, team, u, v, isPerson_) {   // 🎯 aim help: keep a person's hit inside the lines (robots may miss by a little)
    var m = isPerson_ ? M.lv.aim : 0;
    if (m > 0) return { u: clamp(u, 0.8, M.L - m), v: clamp(v, -M.W / 2 + m, M.W / 2 - m) };
    return { u: clamp(u, 0.6, M.L + 0.5), v: clamp(v, -M.W / 2 - 0.4, M.W / 2 + 0.4) };
  }
  function emptiest(M, team) {   // the spot of the other court furthest from its players (🔥 Pyra…Dink)
    var best = null, bs = -1, opp = 1 - team;
    for (var i = 0; i < 9; i++) {
      var u = 1.2 + (i % 3) * 0.9, v = (Math.floor(i / 3) - 1) * M.W * 0.33, x = u * sgn(opp), d = 99;
      teamOf(M, opp).forEach(function (q) { d = Math.min(d, hyp(q.x - x, q.y - v)); });
      if (d > bs) { bs = d; best = { u: u, v: v }; }
    }
    return best;
  }

  // doTouch: a player touches the ball. key: 'touch' (J) · 'drive' (K) · 'dink' (L) — the body part is picked by the ball's height.
  function doTouch(M, p, key, opt) {
    opt = opt || {};
    var b = M.ball, T = p.team, opp = 1 - T, nn = nextNOf(M, T), hz = b.z - rz(p), lv = M.lv, person = isPerson(p);
    // faults: same player twice in a row · a 4th touch
    if (M.side === T && M.lastP === p.id && !M.lastBlock && M.lastTeam === T) {
      if (lv.dbl && !isStrike(M)) return fault(M, T, 'double', p.id);   // 🦶 takraw: one player may touch it again
    }
    var forceOver = false;
    if (nn > 3) { if (lv.four) return fault(M, T, 'four', p.id); forceOver = true; }
    var act;
    if (key === 'dink') act = 'dink';
    else if (key === 'drive') act = hz >= (isStrike(M) ? 1.2 : 1.5) && (rz(p) > 0.15 || hz >= (isStrike(M) ? 1.45 : 1.75)) ? 'dunk' : 'drive';
    else act = p.dive ? 'dive' : hz < 0.75 ? 'dig' : hz < 1.75 ? 'bump' : 'set';
    if (key === 'touch' && (nn >= 3 || forceOver)) forceOver = true;
    M.lastStyle = act === 'dunk' && isStrike(M) && ((rz(p) > 0.5 && hz >= 2.1) || (p.pyraArm && p.meter >= PYRA_COST)) ? 'bicycle' : act === 'dunk' && isStrike(M) ? 'roll' : null;   // 🚲 high ball / flame = bicycle kick
    var atk = act === 'dunk' || act === 'drive' || act === 'dink'; comboStep(M, p, atk);
    var pyra = false, spirit = spiritGo(M, p, act);
    if (atk && !(spirit && spirit.slot === 'combo')) comboEnd(M, T);
    if (spirit) pyra = true;   // a Spirit move is a Pyra move and more (exact, unblockable, hard to reach)
    else if (p.pyraArm && p.meter >= PYRA_COST && !p.spiritArm) { pyra = true; p.meter -= PYRA_COST; p.pyraArm = false; p.st.pyras++; }
    var dh = hyp(b.x - p.x, b.y - p.y), q = spirit ? 1 : clamp(1 - dh / (reachOf(M, p, key) + 0.01), 0, 1), e = errPt(M, p, q, pyra), a = aimOf(M, p);
    var spd = lv.spd, tx, ty, tgt;
    if (act === 'dunk' || act === 'drive') {
      var deep = act === 'dunk' ? 0.55 : 0.68;
      tgt = keepIn(M, opp, M.L * (deep + 0.28 * a.f) + e.x, (a.s * 0.36 * M.W) + e.y, person);
      if (!person) { var gap = emptiest(M, T); if (M.rnd() < 0.6) tgt = { u: clamp(gap.u + M.L * 0.35, 1.5, M.L - 0.4) + e.x, v: gap.v + e.y }; }
      if (spirit) { var gp = emptiest(M, T); tgt = { u: clamp(gp.u + 1.2, 1.4, M.L - 0.6), v: gp.v }; }
      var v0 = (act === 'dunk' ? (person ? 11.5 : 8.6 + 2.4 * lv.bot.spike) : 8.5) * spd * (spirit ? 1.65 : pyra ? 1.4 : 1);
      shoot(M, b, tgt.u * sgn(opp), tgt.v, BALL_R, v0, spirit ? 0.45 : act === 'dunk' ? 0.12 : 0.3);
    } else if (act === 'dink') {
      tgt = pyra ? emptiest(M, T) : keepIn(M, opp, 1.6 + 0.9 * a.f + e.x * 0.5, a.s * 0.34 * M.W + e.y * 0.5, person);
      lob(M, b, tgt.u * sgn(opp), tgt.v, BALL_R, M.netH + (spirit ? 0.45 : pyra ? 0.6 : 1.0));
    } else if (forceOver) {   // a free ball over the net
      tgt = keepIn(M, opp, M.L * 0.55 + e.x, a.s * 0.3 * M.W + e.y, person);
      lob(M, b, tgt.u * sgn(opp), tgt.v, BALL_R, Math.max(M.netH + 1.6, 3.6));
    } else if (nn === 1) {   // pass to the setter's spot
      var st = teamOf(M, T).filter(function (q2) { return has(q2, 'dink') && q2.id !== p.id; })[0];
      var sv = st ? clamp(st.y * 0.4, -1.2, 1.2) : 0, su = 1.4;
      lob(M, b, su * sgn(T) + e.x * 0.6, sv + e.y * 0.6, 2.0, (act === 'dig' || act === 'dive' ? 3.2 : 3.7) + (pyra ? 0.2 : 0));
      M.setter[T] = st ? st.id : null;
    } else {   // nn === 2: set it up for the spiker
      var sk = planSpiker(M, T, p.id); M.spiker[T] = sk ? sk.id : null; M.setter[T] = p.id;
      var vv = sk ? clamp(sk.y, -M.W * 0.35, M.W * 0.35) : 0;
      lob(M, b, 0.95 * sgn(T) + e.x * 0.5, vv + e.y * 0.5, 2.75, 3.9 + (pyra ? 0.15 : 0));
    }
    b.pyra = pyra ? (act === 'dunk' || act === 'drive' || act === 'dink' ? act : act === 'set' || act === 'bump' || act === 'dig' || act === 'dive' ? 'set' : null) : null;
    b.spirit = spirit ? spirit.k : null; b.spiritSlot = spirit ? spirit.slot : null; b.spiritTier = spirit ? spirit.tier : null;
    b.hitT = M.t;
    M.side = T; M.n = Math.min(nn, 4);
    var wasBlock = M.lastBlock;
    M.lastP = p.id; M.lastAct = act; M.lastTeam = T; M.lastBlock = false;
    if (M.serveFresh && T !== M.serveTeam) M.serveFresh = false;
    M.rally++; M.rallyMax = Math.max(M.rallyMax, M.rally);
    p.act = act; p.actT = 0; p.want = null; p.st.touches++; p.style = M.lastStyle;
    var stK = { drive: 'drives', bump: 'bumps', dig: 'digs', dive: 'dives', set: 'sets', dink: 'dinks', dunk: 'dunks' }[act]; if (stK) p.st[stK]++;
    if (act === 'dig' || act === 'dive') fill(M, p, FILL.save);
    else if (act === 'set') fill(M, p, FILL.set);
    else if (act === 'dunk') fill(M, p, FILL.dunk);
    else if (act === 'dink') fill(M, p, FILL.dink);
    else if (act === 'bump') fill(M, p, FILL.bump);
    ev(M, act, { p: p.id, team: T, n: M.n, pyra: pyra, part: isStrike(M) ? STRIKE_PART[act] || 'foot' : act === 'set' || act === 'dink' || act === 'dunk' ? 'hands' : 'arms', style: M.lastStyle, name: actName(M, M.lastStyle === 'bicycle' ? 'bicycle' : act), q: Math.round(q * 100) / 100, over: forceOver, auto: !!opt.auto });
    if (pyra && !spirit) ev(M, 'pyra', { p: p.id, team: T, act: act, name: pyraName(M.lastStyle === 'bicycle' && act === 'dunk' ? 'bicycle' : act, M) });
    if (act === 'dig' || act === 'dive') ev(M, 'save', { p: p.id, team: T, act: act, spirit: spirit ? spirit.k : null });
    if (M.rally > 0 && M.rally % 5 === 0) { M.players.forEach(function (q2) { fill(M, q2, FILL.rally); }); ev(M, 'rally', { n: M.rally }); if (M.rally >= 10) ev(M, 'longRally', { n: M.rally }); }
    if (act === 'dunk' || act === 'dink' || act === 'drive' || forceOver) M.attack = { p: p.id, team: T, act: act, t: M.t }; else M.attack = null;
    if (wasBlock) M.lastBlock = false;
    assign(M);
    return act;
  }
  function fill(M, p, amt) {
    var before = p.meter; p.meter = clamp(p.meter + amt * M.lv.fill, 0, METER_MAX);
    if (before < PYRA_COST && p.meter >= PYRA_COST) ev(M, 'meterHalf', { p: p.id });
    if (before < METER_MAX && p.meter >= METER_MAX) ev(M, 'meterFull', { p: p.id });
  }

  // ---------- serve ----------
  /* serve kinds (pd-1c, Aowu 2026-11-14): 'float' = 💥 K / J (hold K = power) · 'jump' = ⬆️ Space: toss, jump, smash it from up high
     (fast + steep, a bit wilder) · 'pinch' = 🪶 L: a soft lob that drops just over the net into a corner */
  function serve(M, p, power, pyra, kind) {
    var b = M.ball, T = p.team, opp = 1 - T, a = aimOf(M, p), person = isPerson(p), lv = M.lv;
    kind = kind || 'float'; if (isStrike(M) && kind === 'float') kind = 'kick'; power = clamp(power, 0, 1); p.feed = null;
    if (M.feeder != null) { var tsr = byId(M, M.feeder); if (tsr) tsr.dir = tsr.team === 0 ? 1 : -1; M.feeder = null; }   // 🧺 the tosser turns back to the net
    var spirit = spiritGo(M, p, 'drive');
    if (spirit) pyra = true;
    else if (p.pyraArm && p.meter >= PYRA_COST && !p.spiritArm) { pyra = true; p.meter -= PYRA_COST; p.pyraArm = false; p.st.pyras++; }
    var u = M.L * (0.4 + 0.5 * power + 0.08 * a.f), v = a.s * 0.36 * M.W, e = errPt(M, p, kind === 'jump' ? (person ? 0.55 : 0.45) : kind === 'pinch' ? 0.9 : person ? 0.8 : 0.6, pyra);
    if (!person) { u = M.L * (0.45 + 0.4 * M.rnd() * (0.4 + lv.bot.smart)); v = (M.rnd() * 2 - 1) * 0.32 * M.W; if (M.level === 0) { var h = M.players.filter(function (q) { return isPerson(q) && q.team === opp; })[0]; if (h) { u = clamp(uOf(opp, h.x), 2, M.L - 1); v = h.y; } } }
    if (kind === 'jump') { u = M.L * (person ? 0.74 + 0.16 * a.f : 0.62 + 0.28 * M.rnd()); }
    if (kind === 'kick' && person) u = M.L * (0.5 + 0.3 * power + 0.12 * a.f);
    if (kind === 'pinch') { u = 1.1 + 0.35 * (person ? a.f + 1 : M.rnd() * 2); v = (person && Math.abs(a.s) > 0.2 ? Math.sign(a.s) : M.rnd() < 0.5 ? -1 : 1) * 0.36 * M.W; }
    var t = keepIn(M, opp, u + e.x, v + e.y, person);
    if (kind === 'pinch') t.u = Math.max(t.u, 0.7);
    if (spirit) { var gs = emptiest(M, T); t = { u: clamp(kind === 'pinch' ? Math.min(gs.u, 2.2) : gs.u + 1, 0.9, M.L - 0.6), v: gs.v }; }
    if (person && !lv.aim && (kind === 'float' || kind === 'kick') && power > 0.92) t.u = M.L * (0.9 + power * 0.18);   // too much power on a high level: long!
    b.held = null; b.x = p.x + 0.3 * p.dir;
    if (isStrike(M) && kind === 'jump') { b.z = 1.5; shoot(M, b, t.u * sgn(opp), t.v, BALL_R, (10.5 + 2.2 * power) * lv.spd * (pyra ? 1.3 : 1), 0.22); }   // 🦶 power kick
    else if (kind === 'kick') { b.z = 1.3; shoot(M, b, t.u * sgn(opp), t.v, BALL_R, (7.6 + 3.4 * power) * lv.spd * (pyra ? 1.35 : 1), 0.3); }   // 🦶 kick serve
    else if (kind === 'jump') { b.z = Math.max(3.0, p.z + 2.7); shoot(M, b, t.u * sgn(opp), t.v, BALL_R, (11 + 2.5 * power) * lv.spd * (pyra ? 1.3 : 1), 0.2); }
    else if (kind === 'pinch') { b.z = 1.6; shoot(M, b, t.u * sgn(opp), t.v, BALL_R, (4.6 + 0.8 * power) * lv.spd * (pyra ? 1.2 : 1), 0.5); }
    else { b.z = 2.2; shoot(M, b, t.u * sgn(opp), t.v, BALL_R, (6.5 + 4 * power) * lv.spd * (pyra ? 1.35 : 1), 0.35); }
    p.jumpServe = null;
    b.pyra = pyra ? 'drive' : null; b.spirit = spirit ? spirit.k : null; b.spiritSlot = spirit ? 'drive' : null; b.hitT = M.t;
    M.phase = 'rally'; M.phaseT = 0; M.side = T; M.n = 0; M.lastP = p.id; M.lastAct = 'drive'; M.lastTeam = T; M.lastBlock = false; M.serveFresh = true; M.rally = 0; M.attack = null;
    p.act = 'serve'; p.actT = 0; p.charge = -1; p.st.drives++;
    fill(M, p, FILL.serve);
    if (kind === 'jump') p.st.jumpServes++; if (kind === 'pinch') p.st.pinches++;
    ev(M, 'serve', { p: p.id, team: T, power: Math.round(power * 100) / 100, pyra: !!pyra, kind: kind });
    if (pyra && !spirit) ev(M, 'pyra', { p: p.id, team: T, act: 'drive', serve: kind, name: pyraName(kind === 'jump' ? 'jumpserve' : kind === 'pinch' ? 'pinch' : 'drive', M) });
    assign(M);
  }

  // ---------- points ----------
  function fault(M, team, why, pid) {
    ev(M, 'fault', { team: team, why: why, p: pid });
    point(M, 1 - team, why);
    return null;
  }
  function point(M, w, why) {
    if (M.phase !== 'rally') return;
    if (M.drill) return drillMiss(M, w, why);
    var l = 1 - w, lastP = byId(M, M.lastP), T = M.teams;
    M.phase = 'point'; M.phaseT = 0; M.tscale = 1; M.guide = null;
    T[w].score++;
    if (M.trioPoint === w && why !== 'out' && why !== 'own') { T[w].score++; ev(M, 'double', { team: w }); }   // 🔥🔥×3 Trio Combo: the point counts double
    M.trioPoint = null; comboEnd(M, 0); comboEnd(M, 1);
    var kind = why;
    if (why === 'in' || why === 'land') {
      if (M.serveFresh && M.lastTeam === w && M.lastAct === 'drive' && lastP && M.serveTeam === w) { kind = 'ace'; lastP.st.aces++; fill(M, lastP, FILL.ace); ev(M, 'ace', { p: lastP.id, team: w }); }
      else if (M.lastTeam === w && lastP && (M.lastAct === 'dunk' || M.lastAct === 'dink' || M.lastAct === 'drive')) {
        kind = 'kill'; lastP.st.kills++; fill(M, lastP, M.lastAct === 'dink' ? FILL.dinkKill : FILL.kill);
        ev(M, 'kill', { p: lastP.id, team: w, by: M.lastAct, pyra: !!M.ball.pyra, spirit: M.ball.spirit || null });
        var st = byId(M, M.setter[w]); if (st && st.id !== lastP.id) { st.st.assists++; fill(M, st, FILL.assist); ev(M, 'assist', { p: st.id, team: w }); }
      }
      else if (M.lastTeam === w && M.lastAct === 'block' && lastP) { kind = 'stuff'; lastP.st.stuffs++; fill(M, lastP, FILL.stuff); ev(M, 'stuff', { p: lastP.id, team: w }); }
    }
    teamOf(M, l).forEach(function (q) { fill(M, q, FILL.lose); q.gest = { k: 'oops', t: 0 }; });
    teamOf(M, w).forEach(function (q) { q.gest = { k: 'cheer', t: 0 }; });
    M.deficit[w] = Math.max(M.deficit[w], T[l].score - T[w].score + 1);
    ev(M, 'point', { team: w, why: kind, rally: M.rally, score: [T[0].score, T[1].score] });
    var tg = M.target, sw = T[w].score, sl = T[l].score;
    if ((sw >= tg && sw - sl >= 2) || sw >= tg + 4) {
      T[w].sets++;
      ev(M, 'setWon', { team: w, sets: [T[0].sets, T[1].sets], score: [T[0].score, T[1].score] });
      if (T[w].sets >= M.setsTo) {
        M.winner = w; M.over = true;
        if (M.deficit[w] >= 4) ev(M, 'comeback', { team: w, was: M.deficit[w] });
        ev(M, 'match', { winner: w, sets: [T[0].sets, T[1].sets], score: [T[0].score, T[1].score] });
      } else { M.nextSet = true; M.setLoser = l; }
    } else {
      if (sw === tg - 1 && sw > sl) ev(M, T[w].sets + 1 >= M.setsTo ? 'matchPoint' : 'setPoint', { team: w });
    }
    M.nextServe = w;
    if (w !== M.serveTeam) { M.sideOut = true; ev(M, 'sideout', { team: w }); } else M.sideOut = false;
  }
  function afterPoint(M) {
    if (M.over) { M.phase = 'over'; return; }
    var w = M.nextServe;
    if (M.nextSet) {
      M.nextSet = false; M.teams.forEach(function (t) { t.score = 0; }); M.setNo++; M.deficit = [0, 0];
      ev(M, 'newSet', { n: M.setNo }); w = M.setLoser;
    } else if (M.sideOut && M.lv.rot) rotate(M, w);
    startServe(M, w);
  }
  function rotate(M, team) {   // 🔄 Hard+: everyone moves one seat, the new seat 0 serves (🚀)
    var ids = M.teams[team].slots, n = ids.length, last = ids[n - 1];
    for (var i = n - 1; i > 0; i--) ids[i] = ids[i - 1];
    ids[0] = last;
    ids.forEach(function (id, s) { var p = byId(M, id); p.slot = s; p.roles = M.sp.roles[s].slice(); });
    ev(M, 'rotate', { team: team });
  }

  // ---------- input from the page ----------
  function input(M, pid, x, y) { var p = byId(M, pid); if (!p) return; var m = hyp(x, y); if (m > 1) { x /= m; y /= m; } p.input.x = x; p.input.y = y; if (m > 0.2) { p.aimF = x * p.dir; p.aimS = y; } else { p.aimF = 0; p.aimS = 0; } }
  // key: 'touch' (J) · 'drive' (K, hold on a serve = power) · 'dink' (L) · 'jump' (Space) · 'dive' (Shift) · 'pyra' (🔥 F)
  function press(M, pid, key) {
    var p = byId(M, pid); if (!p || M.over || M.phase === 'over') return false;
    if (key === 'pyra') {
      if (p.meter >= PYRA_COST) { p.pyraArm = !p.pyraArm; p.spiritArm = p.pyraArm && p.meter >= SPIRIT_COST; armTeam(M, p); ev(M, 'pyraArm', { p: p.id, on: p.pyraArm, full: p.meter >= METER_MAX, spirit: p.spiritArm, team: teamSpiritOf(M, p) ? teamSpiritOf(M, p).tier : null }); if (p.spiritArm && typeof PD.SPIRIT === 'function') PD.SPIRIT(M, p); }
      else ev(M, 'pyraLow', { p: p.id, meter: Math.round(p.meter) });
      return true;
    }
    if (M.sp.sport === 'hoop') return hoopPress(M, p, key);
    if (M.sp.sport === 'spark') return sparkPress(M, p, key);
    if (M.phase === 'serve') {
      if (isKick(M) && M.feeder === p.id && M.ball.held !== p.id) {   // 🧺 pd-5e you are the tosser: any kick key tosses it to your robot server
        var rs = byId(M, M.ball.held); if (!rs || rs.feed || rs.jumpServe || isPerson(rs) || (key !== 'drive' && key !== 'touch' && key !== 'jump' && key !== 'dink')) return false;
        return botServe(M, rs) !== false; }
      if (M.ball.held !== p.id || p.jumpServe || p.feed || (key !== 'drive' && key !== 'touch' && key !== 'jump' && key !== 'dink')) return false;
      if (isStrike(M)) return feedServe(M, p, key === 'jump' ? 0.85 : M.lv.assist.autoPower ? 0.6 : 0.72, key === 'dink' ? 'pinch' : key === 'jump' ? 'jump' : 'kick');
      if (key === 'jump') return jumpServe(M, p, M.lv.assist.autoPower ? 0.6 : p.charge >= 0 ? clamp(p.charge / 0.9, 0.3, 1) : 0.75);
      if (key === 'dink') { serve(M, p, 0.5, false, 'pinch'); return true; }
      if (M.lv.assist.autoPower || key === 'touch') { serve(M, p, M.level === 0 ? 0.55 : 0.62); return true; }
      if (p.charge < 0) { p.charge = 0; ev(M, 'charge', { p: p.id }); }
      return true;
    }
    if (M.phase !== 'rally') return false;
    if (key === 'jump') return jump(M, p);
    if (key === 'dive') {
      if (p.z > 0 || p.dive || p.recover > 0) return false;
      var dx = p.input.x, dy = p.input.y, m = hyp(dx, dy);
      if (m < 0.2) { dx = M.ball.x - p.x; dy = M.ball.y - p.y; m = hyp(dx, dy) || 1; }
      p.dive = { t: 0.45, dx: dx / m, dy: dy / m }; p.want = { key: 'touch', t: 0.55 }; ev(M, 'diveGo', { p: p.id });
      return true;
    }
    if (M.lastP === p.id && M.t - M.ball.hitT < 0.35) return false;   // a second tap right after your own touch = a button mash, not a double touch
    p.want = { key: key, t: 0.42 };
    // K on a high ball near the net = jump + dunk in one press (people) — the jump starts now
    // 💥 pd-6b2 run-up: your team's ball still going up (or high and far) → run to the spot under its way down, jump at the right moment
    var bb = M.ball, ttd = bb.vz < 0 ? (bb.z - 2.9) / Math.max(0.5, -bb.vz) : 9;
    if ((key === 'drive' || (key === 'dink' && !isStrike(M))) && p.z === 0 && !p.dive && M.side === p.team && M.n >= 1 && bb.held == null && uOf(p.team, bb.x) > 0 && uOf(p.team, bb.x) < 3.6 && bb.z > 1.4 && ttd > 0.32) { p.approach = { key: key, t: 1.6 }; p.want = { key: key, t: 0.6 }; ev(M, 'approach', { p: p.id }); }
    else if (key === 'drive' && p.z === 0 && !p.dive && M.ball.z > 2.0 && uOf(p.team, p.x) < 3.2 && hyp(M.ball.x - p.x, M.ball.y - p.y) < 2.4) jump(M, p, true);
    return true;
  }
  function release(M, pid, key) {
    var p = byId(M, pid); if (!p) return;
    if (key === 'drive' && M.phase === 'serve' && M.ball.held === p.id && p.charge >= 0) serve(M, p, clamp(p.charge / 0.9, 0.15, 1));
  }
  function jump(M, p, forSpike) {
    if (p.z > 0 || p.dive || p.recover > 0) return false;
    p.state = 'jump'; p.approach = null;
    var oppHasIt = M.lastTeam != null && M.lastTeam !== p.team || (M.side !== p.team && M.phase === 'rally');
    if (!forSpike && uOf(p.team, p.x) < 1.7 && oppHasIt) { p.block = 0.75; if (p.pyraArm && p.meter >= PYRA_COST) { p.pyraBlock = true; } }
    var big = forSpike || p.block > 0;   // 🦘 pd-6b2: spike / block jumps go higher with power (same air time, same rules)
    p.jf = !big ? JF.hop : (p.pyraArm && p.meter >= PYRA_COST) || p.spiritArm ? JF.pyra : p.meter >= PYRA_COST ? JF.power : JF.attack;
    p.vz = JUMPV * p.jf;
    ev(M, p.block > 0 ? 'blockJump' : 'jump', { p: p.id, h: Math.round(JUMPV * JUMPV * p.jf / (2 * PGRAV) * 100) / 100 });
    return true;
  }

  // 🦶 PyraStrike serve: the feed toss first, the kick comes when the ball reaches your foot (step → serve phase)
  var FEED_T = 0.6;
  function feedServe(M, p, power, kind) {
    if (p.feed) return false;
    var mates = teamOf(M, p.team).filter(function (q) { return q.id !== p.id; }).sort(function (a, c) { return hyp(a.x - p.x, a.y - p.y) - hyp(c.x - p.x, c.y - p.y); });
    p.feed = { t0: M.t, power: clamp(power, 0, 1), kind: kind || 'kick', by: M.feeder != null ? M.feeder : mates.length ? mates[0].id : p.id }; p.charge = -1;
    var tz = byId(M, p.feed.by); p.feed.T = tz && tz.id !== p.id ? clamp(FEED_T + 0.13 * hyp(tz.x - p.x, tz.y - p.y), FEED_T, 1.25) : FEED_T;   // 🧺 a longer toss takes a little longer
    var fb = byId(M, p.feed.by); if (fb && fb.id !== p.id) fb.st.feeds = (fb.st.feeds || 0) + 1;   // pd-4b: 🤲 Toss Buddy
    ev(M, 'serveToss', { p: p.id, team: p.team, kind: p.feed.kind, by: p.feed.by });
    return true;
  }
  // 🦘 jump serve: toss + jump now, the hit comes at the top of the jump (step → serve phase)
  function jumpServe(M, p, power) {
    if (p.jumpServe || p.z > 0) return false;
    p.jumpServe = { power: clamp(power, 0, 1) }; p.charge = -1; p.vz = JUMPV * 1.1; p.state = 'jump';
    ev(M, 'serveToss', { p: p.id, team: p.team, kind: 'jump' });
    return true;
  }
  // robots pick a serve: Basic = float only · Junior = some pinch · Intermediate+ = jump + pinch too
  function botServe(M, p) {
    var r = M.rnd(), L = M.level, pw = 0.45 + M.rnd() * 0.4 * (0.5 + M.lv.bot.smart);
    var k = L >= 2 && r < 0.18 + 0.05 * L ? 'jump' : L >= 1 && r < (L >= 2 ? 0.45 : 0.2) + 0.04 * L ? 'pinch' : 'float';
    if (isStrike(M)) return feedServe(M, p, pw, k === 'float' ? 'kick' : k);
    if (k === 'jump') return jumpServe(M, p, pw);
    if (k === 'pinch') return serve(M, p, pw, false, 'pinch');
    return serve(M, p, pw);
  }

  // ---------- robots (and test autopilot) ----------
  function aiThink(M, p, dt) {
    var T = p.team, lv = M.lv, b = M.ball, tgt = null, run = lv.bot.move * Math.max(0.85, lv.spd) * (p.team === humanTeam(M) ? 1.1 : 1);
    if (M.phase === 'serve') {
      var pt = M.feeder != null && byId(M, M.feeder), waitToss = pt && isPerson(pt) && M.phaseT < 8;   // 🧺 a person tosser decides when
      if (b.held === p.id) { if (M.phaseT > M.serveWait && !waitToss && !p.jumpServe && !p.feed) botServe(M, p); return null; }
      if (M.feeder === p.id) return null;   // 🧺 the tosser waits in the quarter circle
      return baseOf(M, p);
    }
    if (M.phase !== 'rally') return baseOf(M, p);
    var mine = M.recv[T] === p.id, nn = nextNOf(M, T);
    if (mine && !M.letGo) {
      var cp = M.cp[T] || M.landing, behind = 0.15;
      tgt = { x: cp.x + sgn(T) * behind, y: cp.y };
      if (nn === 3 && (has(p, 'dunk') || p.id === M.spiker[T])) tgt = { x: cp.x + sgn(T) * 0.45, y: cp.y };
      // jump for the spike when the ball comes down to reach
      if (nn === 3 && p.z === 0 && !p.dive && b.vz < 0 && M.side === T && M.n === 2) {
        var hz = b.z - 2.9, tt = hz / Math.max(0.5, -b.vz);
        if (tt < 0.32 && tt > 0 && hyp(b.x - p.x, b.y - p.y) < 1.5 && M.rnd() < 0.5 + 0.5 * lv.bot.spike) jump(M, p, true);
      }
      if (M.t - M.assignT >= lv.bot.react * (b.pyra && M.lastTeam !== T ? 1.3 : 1) && !(p.willMiss && p.missFor === M.rally)) {
        // one plan per touch: 3rd touch = 💥 dunk / 🪶 dink when the ball is high, else a free ball or a drive over
        var plan = M.rally + '/' + nn;
        if (p.planFor !== plan) { p.planFor = plan; p.planDink = M.rnd() < lv.bot.dink; p.planHard = M.rnd() < 0.15 + lv.bot.spike; p.planLow = M.rnd() < 0.5 ? 'touch' : 'drive'; }
        var key = 'touch';
        if (nn >= 3) key = (b.z - rz(p)) >= 1.5 && p.planHard ? (p.planDink ? 'dink' : 'drive') : p.planLow;
        if (nn >= 3 && rz(p) > 0.1) key = p.planDink ? 'dink' : 'drive';
        if (canReach(M, p, key)) {
          if (p.meter >= PYRA_COST && !isPerson(p) && (key === 'drive' || key === 'dink') && M.rnd() < 0.35) { p.pyraArm = true; p.spiritArm = p.meter >= SPIRIT_COST && M.level >= 1; if (p.spiritArm && M.level >= 2) armTeam(M, p); }
          p.aimF = (M.rnd() * 2 - 1) * 0.6; p.aimS = (M.rnd() * 2 - 1) * 0.8;
          doTouch(M, p, key, { auto: true });
          return null;
        }
        // a low ball just out of reach → dive
        if (b.vz < 0 && b.z < 1.0 && !p.dive && p.z === 0 && hyp(b.x - p.x, b.y - p.y) < reachOf(M, p, 'touch') + 1.3 && M.rnd() < 0.08) { p.input.x = b.x - p.x; p.input.y = b.y - p.y; press(M, p.id, 'dive'); }
      }
    } else if (M.side === T && M.n >= 1 && has(p, 'dink') && M.recv[T] !== p.id && nn === 2) tgt = { x: 1.4 * sgn(T), y: p.y * 0.4 };
    else if (M.side === T && M.n === 1 && p.id === M.spiker[T]) tgt = { x: 2.6 * sgn(T), y: clamp(p.y, -M.W * 0.33, M.W * 0.33) };
    else if (M.lastTeam != null && M.lastTeam !== T && M.attack == null && M.n === 2 && M.side === 1 - T) {
      // the other side is about to attack → front row comes to the net to block
      var front = isBlocker(M, p);
      if (front) { var ak = byId(M, M.spiker[1 - T]); tgt = { x: 0.7 * sgn(T), y: ak ? ak.y : 0 };
        if (ak && rz(ak) > 0.2 && p.z === 0 && Math.abs(p.y - ak.y) < 1.2 && uOf(T, p.x) < 1.2 && (p.blockTry !== M.rally)) { p.blockTry = M.rally; if (M.rnd() < lv.bot.block) jump(M, p); } }
    }
    if (!tgt) { var bs = baseOf(M, p); tgt = bs; if (M.phase === 'rally' && M.landTeam === T && !mine) tgt = { x: bs.x * 0.8 + (M.landing ? M.landing.x * 0.2 : 0), y: bs.y * 0.8 + (M.landing ? M.landing.y * 0.2 : 0) }; }
    return { x: tgt.x, y: tgt.y, run: run };
  }

  // who goes up to block: the front row (6v6) · the player nearest the net (3v3) · in 2v2 the 🪶 one (the other one digs)
  function isBlocker(M, p) {
    if (M.sp.n >= 6) return uOf(p.team, baseOf(M, p).x) < 2.2;
    var t = teamOf(M, p.team).slice().sort(function (a, b) { return uOf(p.team, baseOf(M, a).x) - uOf(p.team, baseOf(M, b).x) || b.slot - a.slot; });
    return t[0] === p;
  }

  // ---------- one tick ----------
  function tick(M, dt) {
    if (M.sp.sport === 'hoop') return hoopTick(M, dt);
    if (M.sp.sport === 'spark') return sparkTick(M, dt);
    M.t += dt; M.phaseT += dt;
    var b = M.ball, lv = M.lv;
    // players
    M.players.forEach(function (p) {
      p.actT += dt; if (p.gest) { p.gest.t += dt; if (p.gest.t > 1.4) p.gest = null; }
      if (p.block > 0) p.block -= dt;
      if (p.recover > 0) p.recover -= dt;
      if (p.charge >= 0) p.charge += dt;
      if (p.want) { p.want.t -= dt; if (p.want.t <= 0) { ev(M, 'whiff', { p: p.id }); p.want = null; } }
      var vx = 0, vy = 0, run = 4.6 * Math.max(0.85, lv.spd);
      var tgt = null;
      if (!isPerson(p)) tgt = aiThink(M, p, dt);
      else {
        vx = p.input.x * run; vy = p.input.y * run;
        // 🌱 guided levels walk you to the ball when it's yours
        if (lv.assist.autoMove && M.phase === 'rally' && M.recv[p.team] === p.id && M.cp[p.team]) {
          var cp = M.cp[p.team], dx = cp.x + sgn(p.team) * 0.15 - p.x, dy = cp.y - p.y, d = hyp(dx, dy);
          if (d > 0.12) { var k = (hyp(p.input.x, p.input.y) > 0.2 ? 0.35 : 1) * lv.assist.autoMove; vx += dx / d * run * k; vy += dy / d * run * k; }
        }
      }
      if (p.approach && isPerson(p)) {   // 💥 pd-6b2 run-up
        var ap = p.approach; ap.t -= dt;
        if (ap.t <= 0 || M.phase !== 'rally' || M.side !== p.team || b.held != null || p.dive || p.z > 0 || uOf(p.team, b.x) < 0) p.approach = null;
        else {
          var gB = ballG(M), at = b.vz < 0 ? Math.max(0, (b.z - 2.9) / Math.max(0.5, -b.vz)) : (b.vz / gB + Math.sqrt(Math.max(0, 2 * (b.z + b.vz * b.vz / (2 * gB) - 2.9) / gB)));
          var ax = b.x + b.vx * at + sgn(p.team) * 0.45, ay = b.y + b.vy * at, adx = ax - p.x, ady = ay - p.y, ad = hyp(adx, ady);
          if (ad > 0.1) { var asp = Math.min(run * 1.05, ad / Math.max(dt, at * 0.6 + dt)); vx = adx / ad * asp; vy = ady / ad * asp; } else { vx = 0; vy = 0; }
          if (p.want) p.want.t = Math.max(p.want.t, 0.6); else p.want = { key: ap.key, t: 0.6 };
          if (b.vz < 0) { var tta = (b.z - 2.9) / Math.max(0.5, -b.vz); if (tta < 0.32 && hyp(b.x - p.x, b.y - p.y) < 1.8) { jump(M, p, true); p.want = { key: ap.key, t: 0.6 }; } }
        }
      }
      if (tgt) { var tdx = tgt.x - p.x, tdy = tgt.y - p.y, td = hyp(tdx, tdy), r2 = tgt.run || run; if (td > 0.08) { var sp = Math.min(r2, td / dt); vx = tdx / td * sp; vy = tdy / td * sp; } }
      if (M.phase === 'serve' && (M.ball.held === p.id || M.feeder === p.id)) { vx = 0; vy = 0; }
      if (p.dive) { p.dive.t -= dt; vx = p.dive.dx * 6.2 * Math.max(0.85, lv.spd); vy = p.dive.dy * 6.2 * Math.max(0.85, lv.spd); if (p.dive.t <= 0) { p.dive = null; p.recover = 0.4; } }
      else if (p.recover > 0) { vx *= 0.1; vy *= 0.1; }
      if (p.z > 0) { vx *= 0.35; vy *= 0.35; }
      p.vx = vx; p.vy = vy;
      p.x += vx * dt; p.y += vy * dt;
      // stay on your side (people may come close to the net; robots keep a little away)
      var u = uOf(p.team, p.x), umin = isPerson(p) ? 0.15 : 0.42;
      if (!(M.phase === 'serve' && M.ball.held === p.id)) u = clamp(u, umin, M.L + 3);
      p.x = u * sgn(p.team); p.y = clamp(p.y, -M.W / 2 - 2, M.W / 2 + 2);
      if (p.z > 0 || p.vz > 0) { p.vz -= PGRAV * (p.jf || 1) * dt; p.z += p.vz * dt; if (p.z <= 0) { p.z = 0; p.vz = 0; p.jf = 1; p.state = 'ready'; p.land = 0.12; if (!p.block) p.pyraBlock = false; } }
      if (p.land > 0) p.land -= dt;
      var mv = hyp(vx, vy); p.walkT = mv > 0.4 && p.z === 0 ? p.walkT + dt * Math.min(1.6, mv / 3) : 0;
      // net touch (Intermediate+): a person jumping right into the net
      if (M.phase === 'rally' && lv.net && rz(p) > 0.15 && uOf(p.team, p.x) < 0.24 && isPerson(p) && M.lastTeam != null) { fault(M, p.team, 'net', p.id); }
    });
    if (M.phase === 'serve') {
      placeHeld(M);
      var srv = byId(M, b.held);
      if (srv && isPerson(srv) && srv.charge >= 1.4 && !srv.jumpServe) serve(M, srv, 1);
      if (srv && srv.feed && M.t - srv.feed.t0 >= (srv.feed.T || FEED_T)) serve(M, srv, srv.feed.power, false, srv.feed.kind);   // 🦶 kick it off the feed
      if (srv && srv.jumpServe && srv.z > 0.1 && srv.vz <= 0.4) serve(M, srv, srv.jumpServe.power, false, 'jump');   // top of the jump: smash
      if (srv && srv.jumpServe && srv.z <= 0 && srv.vz <= 0 && M.phase === 'serve') serve(M, srv, srv.jumpServe.power * 0.8, false, 'jump');   // safety: landed before the hit
      return;
    }
    if (M.phase === 'point' || M.phase === 'over') {
      ballFly(M, dt, true);
      if (M.phase === 'point' && M.phaseT > 1.7) afterPoint(M);
      return;
    }
    // people: a pressed key touches the ball as soon as it is in reach
    M.players.forEach(function (p) {
      if (M.phase !== 'rally') return;
      if (p.want && canReach(M, p, p.want.key)) doTouch(M, p, p.want.key);
      else if (isPerson(p) && !p.want && M.recv[p.team] === p.id && b.z - rz(p) < 0.6 && b.vz < 0) {   // 🌱 auto dig: a low ball right at your feet
        if (hyp(b.x - p.x, b.y - p.y) <= lv.assist.autoDig && uOf(p.team, b.x) > 0 && M.lastTeam != null) doTouch(M, p, 'touch', { auto: true });
      }
    });
    if (M.phase === 'rally') ballFly(M, dt, false);
  }

  function ballFly(M, dt, dead) {
    var b = M.ball, g = ballG(M), px = b.x;
    b.vz -= g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    if (!dead && b.trail) { b.trail.push({ x: b.x, y: b.y, z: b.z }); if (b.trail.length > 14) b.trail.shift(); }
    if (dead) { if (b.z < BALL_R) { b.z = BALL_R; b.vz = Math.abs(b.vz) * 0.45; b.vx *= 0.6; b.vy *= 0.6; if (b.vz < 0.4) b.vz = 0; } return; }
    // crossing the net plane
    if (px !== 0 && px * b.x <= 0) {
      var from = px < 0 ? 0 : 1, to = 1 - from;
      if (Math.abs(b.y) > M.W / 2 + 0.45) { ev(M, 'out', { team: M.lastTeam, why: 'antenna' }); point(M, 1 - (M.lastTeam == null ? from : M.lastTeam), 'out'); return; }
      // 🧱 block?
      var blk = b.spirit && b.spiritSlot !== 'block' ? null : teamOf(M, to).filter(function (q) { return q.block > 0 && rz(q) > 0.12 && uOf(to, q.x) < 1.1 && Math.abs(b.y - q.y) <= 0.62 * (q.spiritArm && q.meter >= SPIRIT_COST ? 2.6 : q.pyraBlock ? 1.8 : 1) && b.z >= M.netH - 0.15 && b.z <= rz(q) + 2.65 + (q.spiritArm ? 0.6 : 0); })[0];   // a Spirit attack can't be blocked
      if (blk && M.lastTeam === from) {
        var spB = spiritGo(M, blk, 'block');
        var pyraB = !spB && blk.pyraBlock && blk.meter >= PYRA_COST && !blk.spiritArm;
        if (pyraB) { blk.meter -= PYRA_COST; blk.pyraArm = false; blk.st.pyras++; }
        blk.pyraBlock = false;
        if (spB) { b.spirit = spB.k; b.spiritSlot = 'block'; b.pyra = 'dunk'; }
        var stuff = !!spB || pyraB || M.rnd() < (isPerson(blk) ? 0.75 : 0.55 + 0.3 * M.lv.bot.smart);
        b.x = px; b.hitT = M.t;
        if (stuff) { b.vx = -b.vx * 0.5; b.vz = -Math.abs(b.vz) * 0.3 - 1.2; M.side = from; }
        else { b.x = 0.05 * sgn(to); b.vx = b.vx * 0.22; b.vz = 2.6; M.side = to; }
        M.n = 0; M.lastP = blk.id; M.lastTeam = to; M.lastAct = 'block'; M.lastBlock = true; M.attack = null; M.serveFresh = false;
        blk.st.blocks++; fill(M, blk, FILL.block); blk.act = 'block'; blk.actT = 0;
        ev(M, 'block', { p: blk.id, team: to, stuff: stuff, pyra: pyraB || !!spB, spirit: spB ? spB.k : null });
        if (pyraB) ev(M, 'pyra', { p: blk.id, team: to, act: 'block', name: pyraName('block', M) });
        assign(M); return;
      }
      if (b.z < M.netH + BALL_R && Math.abs(b.y) <= M.W / 2 + 0.45 && !(b.spirit && b.spiritSlot !== 'block')) {   // the creature carries a Spirit ball over the net
        if (b.z < M.netH - 0.18) { b.x = px; b.vx = -b.vx * 0.2; b.vz *= 0.4; ev(M, 'net', { team: M.lastTeam }); assign(M); return; }
        b.vx *= 0.45; b.vz = Math.abs(b.vz) * 0.3 + 0.6; ev(M, 'tape', { team: M.lastTeam });
      }
      M.side = to; M.n = 0; M.lastBlock = false;
      ev(M, 'over', { team: from });
    }
    if (b.z <= BALL_R) {
      b.z = BALL_R;
      var landT = b.x < 0 ? 0 : 1, isIn = inCourt(M, b.x, b.y);
      ev(M, 'land', { x: Math.round(b.x * 100) / 100, y: Math.round(b.y * 100) / 100, in: isIn, team: landT });
      if (isIn) point(M, 1 - landT, M.lastTeam === landT ? 'drop' : 'in');
      else { ev(M, 'out', { team: M.lastTeam, why: 'long' }); point(M, M.lastTeam == null ? 1 - landT : 1 - M.lastTeam, 'out'); }
      b.vz = Math.abs(b.vz) * 0.45; b.vx *= 0.55; b.vy *= 0.55;
    }
  }

  // ---------- 🌱 guide: which key the person should press next, and the waiting ball ----------
  function guideFor(M) {
    var people = M.players.filter(isPerson), g = null;
    for (var i = 0; i < people.length; i++) {
      var h = people[i], T = h.team;
      if (M.phase === 'serve' && M.ball.held === h.id) { g = { p: h.id, key: 'drive', why: 'serve', reach: true }; break; }
      if (M.phase === 'serve' && M.feeder === h.id) { var hs = byId(M, M.ball.held); if (hs && !isPerson(hs) && !hs.feed) { g = { p: h.id, key: 'touch', why: 'toss', reach: true }; break; } }   // 🧺 pd-5e
      if (M.phase === 'rally' && M.recv[T] === h.id && M.lastTeam != null) {
        var nn = nextNOf(M, T), key = nn >= 3 ? 'drive' : 'touch', b = M.ball, hz = b.z - h.z;
        var why = nn >= 3 ? 'dunk' : hz < 0.75 ? 'dig' : hz < 1.75 ? 'bump' : 'set';
        if (nn === 1) why = hz > 1.75 ? 'set' : why === 'dig' ? 'dig' : 'bump';
        g = { p: h.id, key: key, why: why, n: nn, reach: canReach(M, h, key) && (b.vz < 0.6 || hz < 2.3) }; break;
      }
    }
    return g;
  }

  // ---------- step (page calls this every frame) ----------
  function step(M, realDt) {
    if (M.sp.sport === 'hoop') return hoopStep(M, realDt);
    if (M.sp.sport === 'spark') return sparkStep(M, realDt);
    realDt = Math.min(realDt, 0.1); M.realT += realDt;
    if (M.phase === 'over') return;
    var g = guideFor(M), lv = M.lv; M.guide = g;
    // 🌱 Basic (and the first touches of Junior): the ball waits — slow motion until you press the key
    var slow = g && g.reach && M.phase === 'rally' && lv.assist.slowmo && (lv.assist.slowmo === 1 || M.guidedLeft > 0) && !byId(M, g.p).want;
    if (slow) {
      M.tscale = 0.06; M.waitReal += realDt; M.waiting = true;
      if (M.waitReal > 6) { var h = byId(M, g.p); ev(M, 'autoHelp', { p: h.id }); h.want = { key: g.key, t: 0.5 }; if (canReach(M, h, g.key)) doTouch(M, h, g.key, { auto: true }); M.waitReal = 0; }
    } else { if (M.waiting && g == null && M.guidedLeft > 0) M.guidedLeft--; M.tscale = M.tscale < 1 ? Math.min(1, M.tscale + realDt * 6) : 1; M.waitReal = 0; M.waiting = false; }
    M.acc += realDt * M.tscale;
    var n = 0;
    while (M.acc >= DT && n < 40) { tick(M, DT); M.acc -= DT; n++; if (M.phase === 'over') break; }
    M.guide = guideFor(M);   // fresh for the page (glow + 👆) after this frame's touches
  }
  function takeEvents(M) { var e = M.events; M.events = []; return e; }

  // ===================== ⭕ HOOP TAKRAW engine (pd-2c) =====================
  var HOOP_Z = 3.0, HOOP_R = 0.4, RING = 2.1, HOOP_T = [75, 70, 60, 60, 50, 45], FEED_UP = 0.7;
  var HOOP_PTS = { foot: 2, knee: 3, head: 4, heel: 5, bicycle: 8 }, HOOP_NAME = { foot: 'Inside Kick', knee: 'Knee', head: 'Header', heel: 'Back Heel', bicycle: 'Bicycle' };
  var HOOP_ERR = { foot: 0.8, knee: 0.95, head: 1.05, heel: 1.5, bicycle: 1.3 };
  function hoopActive(M) { return teamOf(M, M.turn); }
  function hoopHome(M, p) {   // a seat on the circle (the turn team) or a bench at the side (the other team)
    var mates = teamOf(M, p.team), i = mates.indexOf(p), n = mates.length;
    if (p.team !== M.turn) return { x: (RING + 1.6 + i * 1.0) * (p.team === 0 ? -1 : 1), y: -RING - 0.9 + i * 0.5 };   // the bench: a row behind the circle
    var a = Math.PI / 2 + (i - (n - 1) / 2) * (2 * Math.PI / Math.max(3, n)) * (n < 3 ? 1.6 : 1);   // a person starts nearest the camera
    return { x: Math.cos(a) * RING, y: Math.sin(a) * RING };
  }
  function hoopInit(M) {
    M.turn = 0; M.serveTeam = 0; M.side = 0; M.timeLeft = M.drill ? M.drill.time : HOOP_T[M.level]; M.hoops = [0, 0]; M.drops = [0, 0]; M.combo = 0; M.shot = null; M.target = 0; M.setsTo = 1;
    M.players.forEach(function (p) { var h = hoopHome(M, p); p.x = h.x; p.y = h.y; p.st.hoops = 0; p.st.hoopPts = 0; p.st.passes = 0; p.dir = p.x > 0 ? -1 : 1; });
    ev(M, 'hoopTurn', { team: 0, time: M.timeLeft });
    hoopToss(M, teamOf(M, 0).filter(isPerson)[0] || teamOf(M, 0)[0]);
  }
  function hoopToss(M, p) {   // a self-toss to start (and after the ball touched the floor)
    var b = M.ball; M.phase = 'serve'; M.phaseT = 0; b.held = p.id; b.pyra = null; b.spirit = null; b.vx = b.vy = b.vz = 0; b.trail = [];
    M.shot = null; M.lastP = null; M.lastTeam = null; M.n = 0; M.recv = [null, null]; M.recv[M.turn] = p.id; M.tosser = p.id;
    b.x = p.x * 0.85; b.y = p.y * 0.85; b.z = 1.0;
  }
  function hoopLaunch(M) {
    var b = M.ball, p = byId(M, b.held); b.held = null; M.phase = 'rally'; M.phaseT = 0;
    lob(M, b, p.x * 0.88, p.y * 0.88, 1.15, 2.7); b.hitT = M.t; M.recv[M.turn] = p.id; M.assignT = M.t;
    ev(M, 'serveToss', { p: p.id, team: p.team, kind: 'hoop' });
  }
  function hoopNext(M, p) {   // the teammate a pass goes to: the stick picks the side, robots prefer a person
    var mates = hoopActive(M).filter(function (q) { return q.id !== p.id; }); if (!mates.length) return p;
    if (isPerson(p) && hyp(p.input.x, p.input.y) > 0.3) { mates.sort(function (a, c) { return ((a.x - p.x) * p.input.x + (a.y - p.y) * p.input.y < (c.x - p.x) * p.input.x + (c.y - p.y) * p.input.y) ? 1 : -1; }); return mates[0]; }
    var person = mates.filter(isPerson)[0]; if (person && (M.lv.assist.setToYou || M.rnd() < 0.6)) return person;
    return mates[Math.floor(M.rnd() * mates.length)];
  }
  function hoopStyle(M, p, key) { var hz = M.ball.z - p.z; return key === 'dink' ? 'heel' : key === 'drive' && p.z > 0.3 && hz > 1.4 ? 'bicycle' : hz < 0.8 ? 'foot' : hz < 1.5 ? 'knee' : 'head'; }
  function hoopReach(M, p) { var b = M.ball, hz = b.z - p.z; return hyp(b.x - p.x, b.y - p.y) <= 0.95 * (isPerson(p) ? M.lv.assist.reach : 1.15) && hz >= 0.25 && hz <= 2.5 && b.vz < 1.5; }
  function hoopTouch(M, p, key) {
    if (M.drill) key = 'touch';   // 🤹 Keepy-up: every touch keeps it up (no hoop)
    var b = M.ball, T = p.team, style = hoopStyle(M, p, key), person = isPerson(p);
    if (M.lastP === p.id && M.t - b.hitT < 0.3) return null;
    var q = clamp(1 - hyp(b.x - p.x, b.y - p.y) / 1.2, 0, 1);
    p.act = key === 'touch' ? (style === 'head' ? 'set' : style === 'foot' ? 'dig' : 'bump') : style === 'heel' ? 'dink' : 'dunk'; p.actT = 0; p.style = style === 'bicycle' ? 'bicycle' : null; p.want = null; p.st.touches++;
    b.hitT = M.t; M.lastP = p.id; M.lastTeam = T; M.n = Math.min(3, M.n + 1); M.combo++; M.rally++; M.rallyMax = Math.max(M.rallyMax, M.rally);
    if (key === 'touch') {
      var to = hoopNext(M, p), e = (person ? 0.3 : M.lv.bot.err * 0.5) * (1.1 - q);
      lob(M, b, to.x * 0.9 + (M.rnd() * 2 - 1) * e, to.y * 0.9 + (M.rnd() * 2 - 1) * e, 1.2, 3.2 + M.rnd() * 0.5);
      M.recv[T] = to.id; M.assignT = M.t; M.shot = null; p.st.passes++; fill(M, p, FILL.set); comboStep(M, p, false);
      ev(M, 'hpass', { p: p.id, team: T, to: to.id, part: STRIKE_PART[p.act] || 'foot', style: style, name: HOOP_NAME[style], combo: M.combo });
      if (M.drill) juggleTouch(M, p, style);
      return 'pass';
    }
    // a shot at the hoop: Spirit (full flame) always goes in, Pyra (half) nearly always
    var spirit = spiritGo(M, p, 'hoop'), pyra = !!spirit; comboEnd(M, T); M.trioPoint = null;
    if (!spirit && p.pyraArm && p.meter >= PYRA_COST && !p.spiritArm) { pyra = true; p.meter -= PYRA_COST; p.pyraArm = false; p.st.pyras++; }
    var err = (person ? 0.52 + 0.06 * M.level : 0.14 + M.lv.bot.err * 0.3) * (1.2 - 0.5 * q) * HOOP_ERR[style] * (spirit ? 0 : pyra ? 0.2 : 1);
    var ang = M.rnd() * Math.PI * 2, r = err * Math.sqrt(M.rnd());
    lob(M, b, Math.cos(ang) * r, Math.sin(ang) * r, HOOP_Z, HOOP_Z + 0.8 + (style === 'head' ? 0.2 : 0));
    var pts = HOOP_PTS[style] * (spirit ? (spirit.tier === 'trio' ? 6 : spirit.tier === 'duo' ? 4 : 3) : pyra ? 2 : 1);   // 🔥 ×2 · 🔥🔥 ×3 · ×2 Duo ×4 · ×3 Trio ×6
    M.shot = { p: p.id, team: T, style: style, pts: pts, pyra: pyra, spirit: spirit ? spirit.k : null };
    b.pyra = pyra ? 'dunk' : null; b.spirit = spirit ? spirit.k : null; b.spiritSlot = spirit ? 'dunk' : null;
    M.recv = [null, null];
    ev(M, 'hshot', { p: p.id, team: T, style: style, part: STRIKE_PART[p.act] || 'foot', name: HOOP_NAME[style], pts: pts, pyra: pyra });
    if (pyra && !spirit) ev(M, 'pyra', { p: p.id, team: T, act: 'hoop', name: 'Pyra…' + HOOP_NAME[style] });
    return 'shot';
  }
  function hoopPress(M, p, key) {
    if (M.phase === 'over' || p.team !== M.turn) return false;
    if (key === 'jump') { if (p.z > 0 || M.phase !== 'rally') return false; p.vz = JUMPV; ev(M, 'jump', { p: p.id }); return true; }
    if (key === 'dive') { if (M.phase !== 'rally' || p.z > 0) return false; p.lunge = 0.3; p.want = { key: 'touch', t: 0.5 }; ev(M, 'diveGo', { p: p.id }); return true; }   // 🤸 a quick lunge to the ball
    if (key !== 'touch' && key !== 'drive' && key !== 'dink') return false;
    if (M.phase === 'serve') { if (M.ball.held === p.id && M.phaseT > 0.2) { hoopLaunch(M); return true; } return false; }
    if (M.phase !== 'rally') return false;
    p.want = { key: key, t: 0.42 }; return true;
  }
  function hoopEndTurn(M) {
    if (M.drill) return drillEnd(M);
    var T = M.turn; ev(M, 'hoopTurnEnd', { team: T, score: M.teams[T].score, hoops: M.hoops[T] });
    if (T === 0) {
      M.turn = 1; M.serveTeam = 1; M.side = 1; M.timeLeft = HOOP_T[M.level]; M.combo = 0; M.phase = 'switch'; M.phaseT = 0; M.ball.held = null; M.ball.vx = M.ball.vy = 0;
      M.players.forEach(function (p) { p.want = null; });
      return;
    }
    var s0 = M.teams[0].score, s1 = M.teams[1].score, w = s0 > s1 ? 0 : s1 > s0 ? 1 : M.hoops[0] >= M.hoops[1] ? 0 : 1;
    M.winner = w; M.over = true; M.teams[w].sets = 1;
    ev(M, 'setWon', { team: w, sets: [M.teams[0].sets, M.teams[1].sets], score: [s0, s1] });
    ev(M, 'match', { winner: w, sets: [M.teams[0].sets, M.teams[1].sets], score: [s0, s1] });
    M.phase = 'over';
  }
  function hoopTick(M, dt) {
    var b = M.ball, lv = M.lv, T = M.turn; M.t += dt; M.phaseT += dt;
    if (M.phase === 'over') return;
    if (M.phase === 'rally' || M.phase === 'serve') { M.timeLeft -= dt; if (M.timeLeft <= 0 && !M.shot) { M.timeLeft = 0; hoopEndTurn(M); return; } }
    if (M.phase === 'switch') { if (M.phaseT > 2.4) { ev(M, 'hoopTurn', { team: M.turn, time: M.timeLeft }); hoopToss(M, teamOf(M, M.turn).filter(isPerson)[0] || teamOf(M, M.turn)[0]); } }
    // people + robots move: the receiver runs under the ball, the others go back to their seat
    var land = M.phase === 'rally' ? predict(M, 1.15).at : null;
    M.players.forEach(function (p) {
      var h = hoopHome(M, p), tx = h.x, ty = h.y, sp = 3.4 * Math.max(0.85, lv.spd);
      if (p.team === M.turn && M.phase === 'rally' && M.recv[p.team] === p.id && land) { tx = land.x; ty = land.y; var d0 = hyp(tx, ty); if (d0 > RING + 0.6) { tx *= (RING + 0.6) / d0; ty *= (RING + 0.6) / d0; } if (d0 < RING - 1.4) { var k0 = (RING - 1.4) / Math.max(0.01, d0); tx *= k0; ty *= k0; } }
      var person = isPerson(p), vx = 0, vy = 0;
      if (person && hyp(p.input.x, p.input.y) > 0.15) { vx = p.input.x * sp; vy = p.input.y * sp; }
      else if (!person || lv.assist.autoMove || p.team !== M.turn || M.recv[p.team] !== p.id) { var dx = tx - p.x, dy = ty - p.y, d = hyp(dx, dy); if (d > 0.06) { var v = Math.min(sp * (person ? Math.max(0.5, lv.assist.autoMove) : lv.bot.move / 3.4 + 0.2), d / dt); vx = dx / d * v; vy = dy / d * v; } }
      if (p.lunge > 0) { p.lunge -= dt; var lx = b.x - p.x, ly = b.y - p.y, ld = hyp(lx, ly) || 1; vx = lx / ld * 6; vy = ly / ld * 6; }
      if (p.z > 0) { vx *= 0.4; vy *= 0.4; }
      p.x += vx * dt; p.y += vy * dt; p.vx = vx; p.vy = vy;
      var mv = hyp(vx, vy); p.walkT = mv > 0.4 && p.z === 0 ? p.walkT + dt * Math.min(1.6, mv / 3) : 0;
      if (Math.abs(vx) > 0.3) p.dir = vx > 0 ? 1 : -1; else if (p.team === M.turn) p.dir = p.x > 0 ? -1 : 1;
      if (p.z > 0 || p.vz > 0) { p.vz -= PGRAV * dt; p.z += p.vz * dt; if (p.z <= 0) { p.z = 0; p.vz = 0; p.land = 0.12; } }
      if (p.land > 0) p.land -= dt; if (p.act) p.actT += dt; if (p.want) { p.want.t -= dt; if (p.want.t <= 0) p.want = null; }
      if (p.gest) { p.gest.t += dt; if (p.gest.t > 1.6) p.gest = null; }
    });
    if (M.phase === 'serve') { var tp = byId(M, b.held); if (tp) { b.x = tp.x * 0.85; b.y = tp.y * 0.85; b.z = 1.0; if (M.phaseT > FEED_UP && !isPerson(tp)) hoopLaunch(M); else if (M.phaseT > 2.5) hoopLaunch(M); } return; }
    if (M.phase === 'reset') { if (M.phaseT > 0.9) { var nx = byId(M, M.nextTosser) || hoopActive(M)[0]; hoopToss(M, nx); } return; }
    if (M.phase !== 'rally') return;
    // touches: people when they pressed, robots on their own (react time · a whiff now and then)
    hoopActive(M).forEach(function (p) {
      if (M.phase !== 'rally' || !hoopReach(M, p) || M.lastP === p.id && M.t - b.hitT < 0.3) return;
      if (isPerson(p)) { if (p.want) hoopTouch(M, p, p.want.key); return; }
      if (M.recv[T] !== p.id || M.t - M.assignT < lv.bot.react) return;
      if (b.z - p.z > 2.0 && p.z === 0 && M.rnd() < 0.05 * (1 + lv.bot.smart)) { p.vz = JUMPV; return; }   // jump for a bicycle now and then
      if (p.missFor !== b.hitT) { p.missFor = b.hitT; p.willMiss = M.rnd() < lv.bot.miss * 0.6; }   // pd-4a: one roll per ball (the rally count restarts after a drop)
      if (p.willMiss) return;
      var shoot = M.combo >= 2 && M.rnd() < 0.35 + 0.25 * lv.bot.smart;
      if (shoot && p.meter >= PYRA_COST && M.rnd() < 0.4) { p.pyraArm = true; p.spiritArm = p.meter >= SPIRIT_COST && M.level >= 1; if (p.spiritArm && M.level >= 2) armTeam(M, p); }
      hoopTouch(M, p, shoot ? (p.z > 0.3 ? 'drive' : M.rnd() < 0.15 * lv.bot.smart ? 'dink' : 'drive') : 'touch');
    });
    // ball flight + the hoop
    var pz = b.z, px = b.x, py = b.y, g = ballG(M);
    b.vz -= g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    b.trail.push({ x: b.x, y: b.y, z: b.z }); if (b.trail.length > 14) b.trail.shift();
    if (pz >= HOOP_Z && b.z < HOOP_Z) {
      var d = hyp(b.x, b.y);
      if (d < HOOP_R - BALL_R * 0.5 && M.shot) {   // ⭕ through the hoop!
        var sh = M.shot, sp2 = byId(M, sh.p); M.teams[sh.team].score += sh.pts; M.hoops[sh.team]++; sp2.st.hoops++; sp2.st.hoopPts += sh.pts; fill(M, sp2, FILL.kill);
        ev(M, 'hoop', { p: sh.p, team: sh.team, style: sh.style, pts: sh.pts, name: HOOP_NAME[sh.style], pyra: sh.pyra, spirit: sh.spirit, score: M.teams[sh.team].score });
        teamOf(M, sh.team).forEach(function (q) { if (q.id !== sh.p) fill(M, q, FILL.assist * 0.5); });
        sh.scored = true;
      } else if (d < HOOP_R + BALL_R * 1.5) {   // 😮 the rim
        var nx2 = b.x / (d || 1), ny2 = b.y / (d || 1); b.vx = nx2 * 1.6 + b.vx * 0.2; b.vy = ny2 * 1.6 + b.vy * 0.2; b.vz = Math.abs(b.vz) * 0.25; b.z = HOOP_Z + 0.01;
        ev(M, 'rim', { p: M.shot ? M.shot.p : M.lastP, team: T });
        if (M.shot) { M.shot.rim = true; }
        var catcher = hoopActive(M).slice().sort(function (a, c) { return hyp(a.x - b.x * 3, a.y - b.y * 3) - hyp(c.x - b.x * 3, c.y - b.y * 3); })[0]; if (catcher) { M.recv[T] = catcher.id; M.assignT = M.t; }
      }
    }
    if (b.z <= BALL_R) {   // the floor: after a shot = a fresh toss, else a drop (the combo breaks)
      b.z = BALL_R; b.vx = b.vy = b.vz = 0;
      var shot = M.shot, last = byId(M, M.lastP);
      if (!(shot && (shot.scored || !shot.rim)) || !shot) { M.drops[T]++; ev(M, 'drop', { team: T, p: M.lastP }); if (M.drill) { M.drill.streak = 0; M.drill.drops++; } }
      else if (!shot.scored) ev(M, 'miss', { p: shot.p, team: T });
      M.combo = 0; M.rally = 0; M.shot = null; M.phase = 'reset'; M.phaseT = 0;
      var mates = hoopActive(M), li = last ? mates.indexOf(last) : -1; M.nextTosser = mates[(li + 1 + mates.length) % mates.length].id;
      if (M.timeLeft <= 0) hoopEndTurn(M);
    }
    if (b.vz < 0 && M.phase === 'rally' && M.recv[T] == null) { var near = hoopActive(M).slice().sort(function (a, c) { return hyp(a.x - b.x, a.y - b.y) - hyp(c.x - b.x, c.y - b.y); })[0]; if (near && !M.shot) { M.recv[T] = near.id; M.assignT = M.t; } }
  }
  function hoopGuide(M) {
    var people = hoopActive(M).filter(isPerson); if (!people.length || M.phase === 'over') return null;
    if (M.phase === 'serve') { var tp = byId(M, M.ball.held); if (tp && isPerson(tp)) return { p: tp.id, key: 'touch', why: 'htoss', reach: true }; return null; }
    if (M.phase !== 'rally' || M.shot) return null;
    var h = byId(M, M.recv[M.turn]); if (!h || !isPerson(h)) return null;
    if (M.drill) return { p: h.id, key: 'touch', why: 'jkeep', reach: hoopReach(M, h) };   // 🤹 keepy-up: always keep it up
    var key = M.combo >= 2 ? 'drive' : 'touch';
    return { p: h.id, key: key, why: key === 'drive' ? 'hshoot' : 'hpass', reach: hoopReach(M, h) };
  }
  function hoopStep(M, realDt) {
    realDt = Math.min(realDt, 0.1); M.realT += realDt; if (M.phase === 'over') return;
    var g = hoopGuide(M), lv = M.lv; M.guide = g;
    var slow = g && g.reach && g.why !== 'htoss' && lv.assist.slowmo === 1 && !byId(M, g.p).want;   // 🌱 Basic: the ball waits for you
    if (slow) { M.tscale = 0.08; M.waitReal += realDt; M.waiting = true; if (M.waitReal > 6) { var h = byId(M, g.p); h.want = { key: g.key, t: 0.5 }; ev(M, 'autoHelp', { p: h.id }); M.waitReal = 0; } }
    else { M.tscale = M.tscale < 1 ? Math.min(1, M.tscale + realDt * 6) : 1; M.waitReal = 0; M.waiting = false; }
    M.acc += realDt * M.tscale; var n = 0;
    while (M.acc >= DT && n < 40) { hoopTick(M, DT); M.acc -= DT; n++; if (M.phase === 'over') break; }
    M.guide = hoopGuide(M);
  }

  // ===================== ⚡ PYRASPARK engine (pd-3a) =====================
  var SPARK_PART = [[0.55, 'foot'], [1.05, 'thigh'], [1.45, 'chest'], [9, 'head']], SPARK_PARTS = ['foot', 'thigh', 'chest', 'head'];
  function sparkBounces(M) { return M.level === 0 ? 2 : 1; }
  function onTable(x, y) { return Math.abs(x) <= SPARK.L + BALL_R && Math.abs(y) <= SPARK.W / 2 + BALL_R; }
  function sparkServe(M, team, first) {   // the serve: 2 tries; a try is kept when the first one missed
    startServe(M, team);
    M.bounces = [0, 0]; M.touched = []; M.sparkTry = M.sparkTry || 0; if (first) { M.sparkTry = 0; M.sparkFirst = team; }
    var s = serverOf(M, team), mates = teamOf(M, team); s.x = (SPARK.L + 0.55) * sgn(team); s.y = mates.length > 1 ? (s.slot === 0 ? -0.4 : 0.4) * (team === 0 ? 1 : -1) : 0; placeHeld(M);
    if (M.sparkTry) ev(M, 'secondServe', { team: team, p: s.id });
  }
  function sparkPart(M, p) {   // the body part by height; Hard+: never the same part twice in a row (the next one is used)
    var hz = M.ball.z - p.z, part = 'head'; for (var i = 0; i < SPARK_PART.length; i++) if (hz < SPARK_PART[i][0]) { part = SPARK_PART[i][1]; break; }
    if (M.level >= 3 && p.lastPart === part) { var k = SPARK_PARTS.indexOf(part); part = SPARK_PARTS[k + (k < 3 ? 1 : -1)]; }
    return part;
  }
  function sparkTarget(M, p, team, u, v, e) {   // a spot on the OTHER half of the table (+ the error); aim levels keep people on it
    var o = 1 - team, a = M.rnd() * Math.PI * 2, r = e * Math.sqrt(M.rnd()), tu = u + Math.cos(a) * r, tv = v + Math.sin(a) * r;
    if (isPerson(p) && M.lv.aim > 0) { tu = clamp(tu, 0.12, SPARK.L - 0.06); tv = clamp(tv, -SPARK.W / 2 + 0.06, SPARK.W / 2 - 0.06); }
    return { x: tu * sgn(o), y: tv };
  }
  function sparkEmpty(M, team) {   // the corner of the other half furthest from its players
    var o = 1 - team, best = null, bd = -1;
    [[0.3, -0.7], [0.3, 0.7], [1.35, -0.7], [1.35, 0.7], [0.8, 0]].forEach(function (c) { var x = c[0] * sgn(o), y = c[1], d = Math.min.apply(null, teamOf(M, o).map(function (q) { return hyp(q.x - x, q.y - y); })); if (d > bd) { bd = d; best = { u: c[0], v: c[1] }; } });
    return best;
  }
  function sparkPredict(M, zHit) {   // where the ball comes down to zHit after its bounce on the side it's flying to (a copy of the flight with the table)
    var b = M.ball, g = ballG(M), x = b.x, y = b.y, z = b.z, vx = b.vx, vy = b.vy, vz = b.vz, h = 1 / 90, t = 0, bounced = M.bounces[M.side] > 0, top = null;
    for (var i = 0; i < 700; i++) {
      vz -= g * h; x += vx * h; y += vy * h; z += vz * h; t += h;
      if (vz < 0 && z <= SPARK.Z + BALL_R && z > SPARK.Z - 0.15 && onTable(x, y)) { z = SPARK.Z + BALL_R; vz = -vz * 0.8; bounced = true; top = null; continue; }
      if (bounced && vz < 0) { if (!top) top = { x: x, y: y, z: z, t: t }; if (z <= zHit) return { x: x, y: y, z: z, t: t }; }
      if (z <= BALL_R) return top || { x: x, y: y, z: z, t: t };
    }
    return top || { x: x, y: y, z: z, t: t };
  }
  function sparkReach(M, p) { var b = M.ball, hz = b.z - p.z; return hyp(b.x - p.x, b.y - p.y) <= 0.8 * (isPerson(p) ? M.lv.assist.reach : 1.1) && hz >= 0.12 && hz <= 2.3; }
  function sparkCanPlay(M, T) { return M.phase === 'rally' && M.side === T && M.bounces[T] >= 1 && M.lastTeam !== T || (M.phase === 'rally' && M.lastTeam === T && M.side === T && M.n > 0 && M.n < 3); }
  function sparkTouch(M, p, key) {
    var b = M.ball, T = p.team, o = 1 - T, lv = M.lv, person = isPerson(p), duo = teamOf(M, T).length > 1;
    if (M.lastP === p.id && M.t - b.hitT < 0.3) return null;
    var mate = duo ? teamOf(M, T).filter(function (q) { return q.id !== p.id; })[0] : null, mateDone = !duo || M.touched.indexOf(mate.id) >= 0;
    var send = key === 'drive' || key === 'dink' || key === 'edge';
    if (M.n >= 2 && !send) { send = true; key = 'drive'; }   // the 3rd touch always goes over
    if (send && duo && !mateDone && M.level >= 1) {   // 🤝 Duo, Junior+: your partner touches it first
      if (M.level >= 3 && person) { ev(M, 'partnerFault', { p: p.id, team: T }); return fault(M, T, 'partner', p.id); }
      send = false; key = 'touch'; if (person) ev(M, 'partnerHint', { p: p.id, team: T });
    }
    var part = sparkPart(M, p), hz = b.z - p.z, q = clamp(1 - hyp(b.x - p.x, b.y - p.y) / 1.0, 0, 1);
    var act = !send ? (M.n === 0 ? (part === 'foot' ? 'dig' : 'bump') : 'set') : key === 'dink' ? 'dink' : key === 'edge' ? 'edge' : (hz >= 1.25 && Math.abs(b.x) < SPARK.L + 0.75 ? 'dunk' : 'drive');
    var spirit = spiritGo(M, p, act === 'edge' ? 'dink' : act), pyra = !!spirit;
    if (!spirit && p.pyraArm && p.meter >= PYRA_COST && !p.spiritArm && (send || act === 'dig')) { pyra = true; p.meter -= PYRA_COST; p.pyraArm = false; p.st.pyras++; }
    p.act = act === 'edge' ? 'dink' : act; p.actT = 0; p.want = null; p.lastPart = part; p.st.touches++; p.style = null;
    M.lastP = p.id; M.lastTeam = T; M.lastAct = act === 'edge' ? 'dink' : act; M.n++; M.rally++; M.rallyMax = Math.max(M.rallyMax, M.rally); M.serveFresh = false; M.touched.push(p.id); b.hitT = M.t;
    var e = (person ? 0.16 + 0.05 * M.level : 0.08 + 0.22 * lv.bot.err) * (1.25 - 0.5 * q) * (pyra ? 0.15 : 1) * (spirit ? 0 : 1);
    if (!send) {   // keep it on our side: up to yourself (1v1) or to your partner (Duo)
      var to = duo && !mateDone ? mate : duo ? mate : p, tx = to.x - 0.25 * sgn(T), ty = to.y * 0.85;
      lob(M, b, tx, ty, 1.0, Math.max(b.z + 0.7, 1.7 + M.rnd() * 0.3)); M.recv = [null, null]; M.recv[T] = to.id; M.assignT = M.t;
      if (act === 'dig') p.st.digs++; else if (act === 'bump') p.st.traps = (p.st.traps || 0) + 1; else p.st.pops = (p.st.pops || 0) + 1;   // pd-4b: 🦵 Sticky Feet · ⬆️ Pop Star
      fill(M, p, act === 'dig' ? FILL.dig : FILL.set);
    } else {
      var a = aimOf(M, p), tg;
      if (act === 'edge') { var side = Math.abs(a.s) > 0.3; tg = side ? sparkTarget(M, p, T, 0.4 + 0.8 * (a.f + 1) / 2, Math.sign(a.s) * (SPARK.W / 2 - 0.025), e * 1.3) : sparkTarget(M, p, T, SPARK.L - 0.025, a.s * 0.6, e * 1.3); }
      else if (spirit || pyra && act !== 'dink') { var ep = sparkEmpty(M, T); tg = sparkTarget(M, p, T, ep.u, ep.v, e); }
      else if (act === 'dink') tg = sparkTarget(M, p, T, 0.3 + 0.12 * a.f, a.s * 0.55, e * 0.8);
      else tg = sparkTarget(M, p, T, (act === 'dunk' ? 1.05 : 0.85) + 0.3 * a.f, a.s * 0.6, e);
      if (!person) { var corner = M.rnd() < 0.2 + 0.45 * lv.bot.smart ? sparkEmpty(M, T) : null; tg = act === 'dink' ? sparkTarget(M, p, T, 0.3, (M.rnd() * 2 - 1) * 0.6, e) : spirit || pyra ? tg : corner ? sparkTarget(M, p, T, corner.u, corner.v, e) : sparkTarget(M, p, T, 0.5 + M.rnd() * 0.8, (M.rnd() * 2 - 1) * 0.65, e); }
      if (M.drill && M.drill.k === 'zone' && T === 0) tg = zoneAim(M, p, tg, e);   // 🎯 aim help towards the glowing zone (less from level to level)
      if (act === 'dink') lob(M, b, tg.x, tg.y, SPARK.Z + BALL_R, M.netH + (spirit ? 0.18 : 0.3));
      else shoot(M, b, tg.x, tg.y, SPARK.Z + BALL_R, (act === 'dunk' ? 7.5 : 5.2) * lv.spd * (spirit ? 1.6 : pyra ? 1.3 : 1) * (person ? 1 : 1 + 0.25 * lv.bot.smart), act === 'dunk' ? 0.05 : 0.1);
      if (M.drill) M.drill.send = { n: M.n, act: act, p: p.id, team: T };
      M.side = o; M.n = 0; M.bounces[o] = 0; M.touched = []; M.recv = [null, null]; M.landTeam = o; M.assignT = M.t;
      fill(M, p, act === 'dunk' ? FILL.set : FILL.set * 0.6);
    }
    b.pyra = pyra ? (send ? (act === 'edge' ? 'dink' : act) : 'set') : null; b.spirit = spirit ? spirit.k : null; b.spiritSlot = spirit ? spirit.slot : null; b.spiritTier = spirit ? spirit.tier : null;
    ev(M, act === 'edge' ? 'dink' : act, { p: p.id, team: T, n: M.n, part: part, name: actName(M, act), over: send, edgeTry: act === 'edge' });
    if (pyra && !spirit) ev(M, 'pyra', { p: p.id, team: T, act: act, name: pyraName(act, M) });
    if (act === 'dig') ev(M, 'save', { p: p.id, team: T, act: act, spirit: spirit ? spirit.k : null });
    return act;
  }
  function sparkPress(M, p, key) {
    if (M.phase === 'serve') {
      if (M.ball.held !== p.id || (key !== 'drive' && key !== 'touch' && key !== 'dink')) return false;
      sparkServeHit(M, p, M.lv.assist.autoPower ? 0.55 : 0.65, key === 'dink'); return true;
    }
    if (M.phase !== 'rally') return false;
    if (key === 'jump') { if (p.z > 0) return false; p.vz = JUMPV * 0.9; ev(M, 'jump', { p: p.id }); return true; }
    if (key === 'dive') { if (p.z > 0) return false; p.lunge = 0.28; p.want = { key: 'touch', t: 0.5 }; ev(M, 'diveGo', { p: p.id }); return true; }
    if (key !== 'touch' && key !== 'drive' && key !== 'dink') return false;
    if (p.want && p.want.t > 0.25 && ((p.want.key === 'dink' && key === 'drive') || (p.want.key === 'drive' && key === 'dink'))) key = 'edge';   // L + K = 💥 Edge
    p.want = { key: key, t: 0.45 }; return true;
  }
  function sparkServeHit(M, p, power, soft) {
    var b = M.ball, T = p.team, a = aimOf(M, p), person = isPerson(p), e = person ? 0.12 + 0.04 * M.level : 0.06 + 0.2 * M.lv.bot.err;
    var spirit = spiritGo(M, p, 'drive'), pyra = !!spirit;
    if (!spirit && p.pyraArm && p.meter >= PYRA_COST && !p.spiritArm) { pyra = true; p.meter -= PYRA_COST; p.pyraArm = false; p.st.pyras++; }
    b.held = null; b.x = p.x - 0.3 * sgn(T); b.y = p.y; b.z = 0.95;
    if (M.drill && T === 1) soft = true;   // 🧑‍🏫 the Coach feeds an easy lob
    var tg = M.drill && T === 1 ? sparkTarget(M, p, T, 0.55 + M.rnd() * 0.6, (M.rnd() * 2 - 1) * 0.5, 0.05) : spirit ? (function () { var ep = sparkEmpty(M, T); return sparkTarget(M, p, T, ep.u, ep.v, 0); })() : person ? sparkTarget(M, p, T, (soft ? 0.45 : 0.75 + 0.5 * power) + 0.25 * a.f, a.s * 0.55, e * (pyra ? 0.15 : 1)) : sparkTarget(M, p, T, 0.5 + M.rnd() * 0.8, (M.rnd() * 2 - 1) * 0.6, e);
    if (soft) lob(M, b, tg.x, tg.y, SPARK.Z + BALL_R, M.netH + 0.35); else shoot(M, b, tg.x, tg.y, SPARK.Z + BALL_R, (4.2 + 2 * power) * M.lv.spd * (spirit ? 1.5 : pyra ? 1.25 : 1), 0.12);
    M.phase = 'rally'; M.phaseT = 0; M.side = 1 - T; M.n = 0; M.bounces = [0, 0]; M.touched = []; M.lastP = p.id; M.lastTeam = T; M.lastAct = 'drive'; M.serveFresh = true; M.rally = 0;
    M.recv = [null, null]; M.landTeam = 1 - T; M.assignT = M.t; b.hitT = M.t; b.pyra = pyra ? 'drive' : null; b.spirit = spirit ? spirit.k : null; b.spiritSlot = spirit ? 'drive' : null;
    p.act = 'drive'; p.actT = 0; p.st.touches++;
    ev(M, 'serve', { p: p.id, team: T, power: power, pyra: pyra, kind: soft ? 'pinch' : 'spark', try: M.sparkTry + 1 });
    if (pyra && !spirit) ev(M, 'pyra', { p: p.id, team: T, act: 'drive', serve: 'spark', name: pyraName('drive', M) });
  }
  function sparkMiss(M, team, why) {   // a serve that never reached the other half: the 1st try comes again
    if (M.serveFresh && M.lastAct === 'drive' && M.sparkTry === 0 && M.lastTeam === team) {
      M.sparkTry = 1; ev(M, 'serveMiss', { team: team, why: why }); M.phase = 'point'; M.phaseT = 0.9; M.retryServe = true; return; }
    point(M, 1 - team, why);
  }
  function sparkAfter(M) {   // after a point: the serve changes every 4 points (Duo: partners take turns)
    if (M.over) { M.phase = 'over'; return; }
    if (M.drill) { M.retryServe = false; M.sparkTry = 0; if (M.drill.done) return drillEnd(M); return sparkServe(M, 1); }
    if (M.retryServe) { M.retryServe = false; sparkServe(M, M.serveTeam); return; }
    M.sparkTry = 0;
    if (M.nextSet) { M.nextSet = false; M.teams.forEach(function (t) { t.score = 0; }); M.setNo++; M.deficit = [0, 0]; ev(M, 'newSet', { n: M.setNo }); M.sparkFirst = M.setLoser; }
    var tot = M.teams[0].score + M.teams[1].score, block = Math.floor(tot / 4), team = block % 2 === 0 ? M.sparkFirst : 1 - M.sparkFirst;
    if (tot > 0 && tot % 4 === 0) {   // a new block of 4: the other team serves; in Duo the partners take turns each time their team gets it
      var tm = M.teams[team], sl = tm.slots; tm.turns = (tm.turns || 0) + 1;
      if (sl.length > 1 && tm.turns % 2 === 0) { sl.push(sl.shift()); sl.forEach(function (id, i) { byId(M, id).slot = i; }); }
      ev(M, 'serveChange', { team: team });
    }
    sparkServe(M, team);
  }
  function sparkTick(M, dt) {
    var b = M.ball, lv = M.lv; M.t += dt; M.phaseT += dt;
    if (M.drill && M.phase !== 'over' && M.drill.time != null) { M.drill.time -= dt; if (M.drill.time <= 0) { M.drill.time = 0; M.drill.done = true; if (M.phase !== 'rally') return drillEnd(M); } }
    if (M.extras && M.phase !== 'over') partyTick(M, dt);
    if (M.phase === 'point' || M.phase === 'over') { if (M.phase === 'point' && M.phaseT > 1.7) sparkAfter(M); }
    // players: the receiver goes under the ball (after its bounce), the others to their spot; nobody steps onto the table
    var hitAt = M.phase === 'rally' ? sparkPredict(M, 1.0) : null;
    if (M.phase === 'rally' && M.recv[M.side] == null && M.lastTeam !== M.side && hitAt) {
      var c = teamOf(M, M.side).slice().sort(function (a, d) { return hyp(a.x - hitAt.x, a.y - hitAt.y) - hyp(d.x - hitAt.x, d.y - hitAt.y); });
      if (teamOf(M, M.side).length > 1 && M.level >= 1) { var hum = c.filter(isPerson)[0]; if (hum && M.lv.assist.setToYou) c = [hum]; }
      M.recv[M.side] = c[0].id; M.assignT = M.t;
    }
    M.players.forEach(function (p) {
      var bs = baseOf(M, p), tx = bs.x, ty = bs.y, sp = 3.2 * Math.max(0.85, lv.spd), person = isPerson(p), vx = 0, vy = 0;
      if (M.phase === 'serve' && b.held === p.id) { tx = p.x; ty = p.y; }
      else if (M.phase === 'rally' && M.recv[p.team] === p.id && hitAt) { tx = hitAt.x + 0.25 * sgn(p.team); ty = hitAt.y; }
      if (person && hyp(p.input.x, p.input.y) > 0.15 && M.phase !== 'serve') { vx = p.input.x * sp; vy = p.input.y * sp; }
      else if (!person || lv.assist.autoMove || M.recv[p.team] !== p.id || M.phase !== 'rally') { var dx = tx - p.x, dy = ty - p.y, d = hyp(dx, dy); if (d > 0.05) { var v = Math.min(sp * (person ? Math.max(0.5, lv.assist.autoMove || 1) : lv.bot.move / 3.4 + 0.25), d / dt); vx = dx / d * v; vy = dy / d * v; } }
      if (p.lunge > 0) { p.lunge -= dt; var lx = b.x - p.x, ly = b.y - p.y, ld = hyp(lx, ly) || 1; vx = lx / ld * 5.5; vy = ly / ld * 5.5; }
      if (p.z > 0) { vx *= 0.5; vy *= 0.5; }
      if (M.phase !== 'serve' || b.held !== p.id) { p.x += vx * dt; p.y += vy * dt; }
      // keep off the table + on your own side, inside the hall
      var u = uOf(p.team, p.x); if (u < 0.35) u = 0.35; if (u < SPARK.L + 0.28 && Math.abs(p.y) < SPARK.W / 2 + 0.28) { if (SPARK.L + 0.28 - u < SPARK.W / 2 + 0.28 - Math.abs(p.y)) u = SPARK.L + 0.28; else p.y = (SPARK.W / 2 + 0.28) * (p.y < 0 ? -1 : 1); }
      p.x = clamp(u, 0.35, M.L + 1.2) * sgn(p.team); p.y = clamp(p.y, -M.W / 2 - 0.6, M.W / 2 + 0.8);
      p.vx = vx; p.vy = vy; var mv = hyp(vx, vy); p.walkT = mv > 0.4 && p.z === 0 ? p.walkT + dt * Math.min(1.6, mv / 3) : 0;
      p.dir = p.team === 0 ? 1 : -1;   // facing the table
      if (p.z > 0 || p.vz > 0) { p.vz -= PGRAV * dt; p.z += p.vz * dt; if (p.z <= 0) { p.z = 0; p.vz = 0; p.land = 0.12; } }
      if (p.land > 0) p.land -= dt; if (p.act) p.actT += dt; if (p.want) { p.want.t -= dt; if (p.want.t <= 0) p.want = null; }
      if (p.gest) { p.gest.t += dt; if (p.gest.t > 1.6) p.gest = null; }
    });
    if (M.phase === 'serve') { placeHeld(M); var srv = byId(M, b.held); if (srv && !isPerson(srv) && M.phaseT > M.serveWait) sparkServeHit(M, srv, 0.45 + 0.4 * M.rnd(), M.level >= 1 && M.rnd() < 0.15); return; }
    if (M.phase !== 'rally') return;
    // touches: people when they pressed, robots on their own
    var T = M.side;
    teamOf(M, T).forEach(function (p) {
      if (M.phase !== 'rally' || !sparkReach(M, p)) return;
      var ok = (M.bounces[T] >= 1 && M.lastTeam !== T) || (M.lastTeam === T && M.n > 0 && M.n < 3);
      if (!ok || (M.lastP === p.id && M.t - b.hitT < 0.3)) return;
      if (isPerson(p)) { if (p.want) sparkTouch(M, p, p.want.key); return; }
      if (M.recv[T] !== p.id || M.t - M.assignT < lv.bot.react * 0.7 || b.vz > 0.6) return;
      if (p.missFor !== b.hitT) { p.missFor = b.hitT;   /* pd-4a: one roll per ball — the old rally:n key repeated after every serve */ var fast = hyp(b.vx, b.vy) > 5.5 * lv.spd ? 0.14 : 0, smash = M.lastAct === 'dunk' ? 0.12 : M.lastAct === 'edge' ? 0.2 : 0; var tired = Math.max(0, M.rally - 16) * 0.015;   /* 🥵 pd-3c: tired legs — after ~8 crossings robots miss a bit more each touch, so robot-vs-robot rallies end */
        p.willMiss = M.rnd() < lv.bot.miss * (M.ball.spirit ? 3 : M.ball.pyra ? 1.6 : 0.7) + fast + smash + tired; }
      if (M.drill && M.drill.k === 'run' && p.team === 1) p.willMiss = false;   // 🏃 the Coach returns everything (only the speed beats you)
      if (p.willMiss) return;
      var duo = teamOf(M, T).length > 1, mateDone = !duo || teamOf(M, T).every(function (q) { return M.touched.indexOf(q.id) >= 0 || q.id === p.id; });
      var direct = !duo && M.n === 0 && b.z - p.z > 0.7 && b.z - p.z < 1.4 && M.rnd() < 0.45;
      var sendNow = M.n >= 2 || (duo ? M.n >= 1 && mateDone : M.n >= 1 || direct);
      if (duo && M.level === 0) sendNow = M.n >= 1 || M.rnd() < 0.4;
      if (M.drill && M.drill.k === 'combo' && T === 0) sendNow = M.n >= 2;   // 🔗 autopilot practises all 3 touches
      if (sendNow && p.meter >= PYRA_COST && M.rnd() < 0.3) { p.pyraArm = true; p.spiritArm = p.meter >= SPIRIT_COST && M.level >= 1; if (p.spiritArm && M.level >= 2) armTeam(M, p); }
      sparkTouch(M, p, sendNow ? (M.rnd() < 0.2 + 0.1 * lv.bot.smart ? 'dink' : M.level >= 3 && M.rnd() < 0.06 ? 'edge' : 'drive') : 'touch');
    });
    if (M.phase !== 'rally') return;
    // flight: net, table, floor
    var px = b.x; b.vz -= ballG(M) * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    b.trail.push({ x: b.x, y: b.y, z: b.z }); if (b.trail.length > 14) b.trail.shift();
    if (px * b.x < 0 && b.z < M.netH && b.z > SPARK.Z - 0.1 && Math.abs(b.y) <= SPARK.W / 2 && !(b.spirit && b.spiritSlot !== 'block')) { b.x = px; b.vx = -b.vx * 0.25; b.vy *= 0.5; ev(M, 'tape', { team: M.lastTeam }); }
    if (b.vz < 0 && b.z <= SPARK.Z + BALL_R && b.z > SPARK.Z - 0.15 && onTable(b.x, b.y)) {   // 🏓 the table
      b.z = SPARK.Z + BALL_R; b.vz = -b.vz * 0.8; var s2 = b.x < 0 ? 0 : 1;
      var edge = Math.abs(b.x) > SPARK.L - SPARK.EDGE || Math.abs(b.y) > SPARK.W / 2 - SPARK.EDGE;
      ev(M, 'bounce', { side: s2, x: b.x, y: b.y, edge: edge });
      if (edge) { var lp = byId(M, M.lastP); if (lp && M.lastTeam !== s2) { lp.st.edges = (lp.st.edges || 0) + 1; fill(M, lp, FILL.set); } ev(M, 'edge', { p: M.lastP, team: M.lastTeam, x: b.x, y: b.y }); }
      if (s2 === M.lastTeam) return M.serveFresh ? sparkMiss(M, M.lastTeam, 'own') : point(M, 1 - s2, 'own');   // on your own half
      if (M.drill && s2 === 1 && M.lastTeam === 0 && drillHit(M, b.x, b.y, edge)) return;   // 🎯 your shot landed on the Coach's half
      M.bounces[s2]++; M.side = s2;
      if (M.bounces[s2] > sparkBounces(M)) return point(M, 1 - s2, 'land');   // they let it bounce too often
    }
    if (b.z <= BALL_R) {   // the floor
      var bs2 = M.bounces[M.side] > 0 && M.side !== M.lastTeam;
      if (bs2) return point(M, M.lastTeam, 'land');   // it bounced on their half and they didn't get it back
      if (M.serveFresh) return sparkMiss(M, M.lastTeam, 'out');
      return point(M, 1 - M.lastTeam, 'out');
    }
  }
  function sparkGuide(M) {
    if (M.phase === 'serve') { var s0 = byId(M, M.ball.held); return s0 && isPerson(s0) ? { p: s0.id, key: 'drive', why: 'serve', reach: true } : null; }
    if (M.phase !== 'rally') return null;
    var T = M.side, h = byId(M, M.recv[T]); if (!h || !isPerson(h)) return null;
    var waiting = M.lastTeam !== T && M.bounces[T] < 1, duo = teamOf(M, T).length > 1, mateDone = !duo || teamOf(M, T).every(function (q) { return M.touched.indexOf(q.id) >= 0 || q.id === h.id; });
    if (waiting) return { p: h.id, key: null, why: 'sbounce', reach: false };
    var send = duo ? M.n >= 1 && mateDone : M.n >= (M.drill && M.drill.k === 'combo' ? 2 : 1);
    var why = send ? (M.drill && M.drill.k === 'combo' ? 'csmash' : M.drill && M.drill.k === 'zone' ? 'zaim' : 'ssend') : (M.drill && M.drill.k === 'combo' ? (M.n === 0 ? 'ctrap' : 'cpop') : 'strap');
    return { p: h.id, key: send ? 'drive' : 'touch', why: why, reach: sparkReach(M, h) };
  }
  function sparkStep(M, realDt) {
    realDt = Math.min(realDt, 0.1); M.realT += realDt; if (M.phase === 'over') return;
    var g = sparkGuide(M), lv = M.lv; M.guide = g;
    var slow = g && g.reach && g.key && g.why !== 'serve' && lv.assist.slowmo === 1 && !byId(M, g.p).want;   // 🌱 Basic: the ball waits for you
    if (slow) { M.tscale = 0.08; M.waitReal += realDt; M.waiting = true; if (M.waitReal > 6) { var h = byId(M, g.p); h.want = { key: g.key, t: 0.5 }; ev(M, 'autoHelp', { p: h.id }); M.waitReal = 0; } }
    else { M.tscale = M.tscale < 1 ? Math.min(1, M.tscale + realDt * 6) : 1; M.waitReal = 0; M.waiting = false; }
    M.acc += realDt * M.tscale; var n = 0;
    while (M.acc >= DT && n < 40) { sparkTick(M, DT); M.acc -= DT; n++; if (M.phase === 'over') break; }
    M.guide = sparkGuide(M);
  }

  // ---------- whole matches in node (robots only, people on autopilot) ----------
  // ===================== 🎯 TRAINING drills + 🌀 SPARK PARTY (pd-4a) =====================
  function drillInit(M) {
    var k = M.sp.drill, D = DRILL[k], L = M.level;
    M.drill = { k: k, score: 0, hits: 0, zoneHits: 0, combos: 0, streak: 0, bestStreak: 0, drops: 0, feeds: 0, misses: 0, spd: 1, done: false, stars: 0,
      time: D.time ? D.time[L] : null, lives: D.lives ? D.lives[L] : null, livesMax: D.lives ? D.lives[L] : null, targets: D.stars[L], zone: null, lastPart: null };
    M.target = 0; M.setsTo = 1;
    if (k === 'zone') newZone(M);
    ev(M, 'drillStart', { k: k, time: M.drill.time, lives: M.drill.lives, targets: M.drill.targets });
  }
  function zoneCells(M) { var c = DRILL.zone.cells[M.level]; return { nu: c[0], nv: c[1] }; }
  function zoneRect(M, i) {   // cell i on the Coach's half: u from the net (0) to the far end (SPARK.L), v across
    var g = zoneCells(M), iu = i % g.nu, iv = Math.floor(i / g.nu), du = (SPARK.L - 0.1) / g.nu, dv = SPARK.W / g.nv;
    return { u0: 0.1 + iu * du, u1: 0.1 + (iu + 1) * du, v0: -SPARK.W / 2 + iv * dv, v1: -SPARK.W / 2 + (iv + 1) * dv, i: i };
  }
  function newZone(M) { var g = zoneCells(M), n = g.nu * g.nv, last = M.drill.zone ? M.drill.zone.i : -1, i = Math.floor(M.rnd() * n); if (n > 1 && i === last) i = (i + 1 + Math.floor(M.rnd() * (n - 1))) % n; M.drill.zone = zoneRect(M, i); ev(M, 'zone', { i: i, rect: M.drill.zone }); }
  function zoneAim(M, p, tg, e) {   // blend the stick aim with the zone's middle: 🌱 always · 🐣 mostly · 🔥 a bit · ⚡+ your aim only
    var help = isPerson(p) ? DRILL.zone.help[M.level] : 0.65, z = M.drill.zone; if (!z || help <= 0) return tg;
    var cu = (z.u0 + z.u1) / 2, cv = (z.v0 + z.v1) / 2, a = M.rnd() * Math.PI * 2, r = e * 0.6 * Math.sqrt(M.rnd()) * (1 - 0.5 * help);
    return { x: (cu * help + uOf(1, tg.x) * (1 - help) + Math.cos(a) * r) * sgn(1), y: cv * help + tg.y * (1 - help) + Math.sin(a) * r };
  }
  function drillHit(M, x, y, edge) {   // your shot bounced on the Coach's half → score it (zone + combo stop the rally, rally run keeps going)
    var D = M.drill, sd = D.send || {}, pts = 1, kind = 'hit'; D.hits++; D.streak++; D.bestStreak = Math.max(D.bestStreak, D.streak);
    if (D.k === 'zone') { var z = D.zone, u = uOf(1, x); if (z && u >= z.u0 - BALL_R && u <= z.u1 + BALL_R && y >= z.v0 - BALL_R && y <= z.v1 + BALL_R) { pts = 3; kind = 'zone'; D.zoneHits++; } if (edge) pts += 1; }
    else if (D.k === 'combo') { if (sd.n >= 3 && sd.act === 'dunk') { pts = 5; kind = 'combo'; D.combos++; } else if (sd.n >= 3) { pts = 2; kind = 'three'; } }
    else if (D.k === 'run') { D.spd = Math.min(DRILL.run.cap, D.spd * DRILL.run.up); kind = 'return'; }
    D.score += pts; var me = byId(M, sd.p); if (me) fill(M, me, kind === 'hit' || kind === 'return' ? FILL.set * 0.5 : FILL.kill * 0.5);
    ev(M, 'drillHit', { kind: kind, pts: pts, score: D.score, streak: D.streak, x: x, y: y, spd: D.spd, p: sd.p, team: 0 });
    if (D.k === 'run') return false;   // the Coach plays it back
    if (D.k === 'zone' && kind === 'zone') newZone(M);
    D.send = null; M.phase = 'point'; M.phaseT = 0.9; M.tscale = 1; M.guide = null; M.rally = 0;
    return true;
  }
  function drillMiss(M, w, why) {   // the rally ended without a score (or the Coach missed in Rally Run)
    var D = M.drill; M.phase = 'point'; M.phaseT = 0.6; M.tscale = 1; M.guide = null; M.trioPoint = null;
    if (w === 0) { ev(M, 'drillCoachMiss', { why: why }); M.rally = 0; return; }   // the Coach missed: a fresh feed
    D.misses++; D.streak = 0; D.spd = 1; M.rally = 0;
    if (D.lives != null) { D.lives--; ev(M, 'drillLife', { lives: D.lives, why: why }); if (D.lives <= 0) { D.done = true; M.phaseT = 0.9; return; } }
    ev(M, 'drillMiss', { why: why, score: D.score });
  }
  function juggleTouch(M, p, style) {
    var D = M.drill, part = STRIKE_PART[p.act] || style, pts = 1, change = D.lastPart && D.lastPart !== style;
    if (change) pts++; D.lastPart = style; D.streak++; D.hits++; D.bestStreak = Math.max(D.bestStreak, D.streak);
    if (D.streak % 10 === 0) pts += 5;
    D.score += pts; ev(M, 'drillHit', { kind: change ? 'switch' : 'keep', pts: pts, score: D.score, streak: D.streak, part: part, style: style, p: p.id, team: 0 });
  }
  function drillEnd(M) {
    var D = M.drill; if (M.over) { M.phase = 'over'; return; }
    D.done = true; D.stars = D.targets.filter(function (t) { return D.score >= t; }).length;
    M.over = true; M.phase = 'over'; M.winner = D.stars > 0 ? 0 : 1; M.teams[0].score = D.score;
    ev(M, 'drillEnd', { k: D.k, score: D.score, stars: D.stars, hits: D.hits, zoneHits: D.zoneHits, combos: D.combos, bestStreak: D.bestStreak, targets: D.targets });
  }
  // 🌀 Spark Party: the extra balls follow the table rules on their own (1 bounce each side, any player sends them back). A point from an extra ball does not stop the main rally.
  function partyBall(M, i, wait) { return { i: i, x: 0, y: 0, z: 2.6, vx: 0, vy: 0, vz: 0, wait: wait || 1.5, live: false, side: -1, bounces: 0, lastTeam: -1, hitT: -9, trail: [] }; }
  function partyDrop(M, e) {   // a new extra ball falls from above the net onto a random half
    var side = M.rnd() < 0.5 ? 0 : 1; e.live = true; e.x = (0.05 + M.rnd() * 0.2) * sgn(side); e.y = (M.rnd() * 2 - 1) * 0.55; e.z = 2.3 + M.rnd() * 0.4;
    e.vx = (0.6 + M.rnd() * 0.8) * sgn(side); e.vy = (M.rnd() * 2 - 1) * 0.4; e.vz = 0.5; e.side = side; e.bounces = 0; e.lastTeam = -1; e.trail = [];
    ev(M, 'partyDrop', { i: e.i, side: side });
  }
  function partyHit(M, p, e) {
    var T = p.team, o = 1 - T, tg = sparkTarget(M, p, T, 0.35 + M.rnd() * 1.0, (M.rnd() * 2 - 1) * 0.65, 0.1);
    lob(M, e, tg.x, tg.y, SPARK.Z + BALL_R, M.netH + 0.25 + M.rnd() * 0.3); e.lastTeam = T; e.side = o; e.bounces = 0; e.hitT = M.t;
    p.act = 'set'; p.actT = 0; p.st.touches++; p.st.partyHits = (p.st.partyHits || 0) + 1; fill(M, p, FILL.set * 0.4);
    ev(M, 'partyHit', { i: e.i, p: p.id, team: T });
  }
  function partyPoint(M, e, w, why) {
    var T = M.teams, l = 1 - w; e.live = false; e.wait = 1.4; T[w].score++;
    ev(M, 'partyPoint', { i: e.i, team: w, why: why, x: e.x, y: e.y, score: [T[0].score, T[1].score] });
    if ((T[w].score >= M.target && T[w].score - T[l].score >= 2) || T[w].score >= M.target + 4) {
      T[w].sets++; M.winner = w; M.over = true;
      ev(M, 'setWon', { team: w, sets: [T[0].sets, T[1].sets], score: [T[0].score, T[1].score] });
      ev(M, 'match', { winner: w, sets: [T[0].sets, T[1].sets], score: [T[0].score, T[1].score] });
      if (M.phase === 'rally' || M.phase === 'serve') { M.phase = 'point'; M.phaseT = 0; }
    }
  }
  function partyTick(M, dt) {
    var g = ballG(M) * 0.8; if (M.over) return;
    M.extras.forEach(function (e) {
      if (M.over) return;
      if (!e.live) { if (M.phase !== 'over' && (e.wait -= dt) <= 0) partyDrop(M, e); return; }
      // touches: robots when the ball is low enough after its bounce; people when they press (the main ball first)
      if (e.bounces >= 1 && e.lastTeam !== e.side && e.vz < 0.8) {
        teamOf(M, e.side).forEach(function (p) {
          if (!e.live || e.lastTeam === e.side || M.t - e.hitT < 0.3) return;
          var hz = e.z - p.z; if (hyp(e.x - p.x, e.y - p.y) > 0.95 * (isPerson(p) ? M.lv.assist.reach : 1.05) || hz < 0.1 || hz > 2.4) return;
          if (isPerson(p)) { if (p.want || M.level === 0) { if (p.want && M.recv[p.team] === p.id && M.phase === 'rally' && sparkReach(M, p)) return; partyHit(M, p, e); p.want = null; } return; }
          if (e.decided !== e.bounceId) { e.decided = e.bounceId; e.willMiss = M.rnd() < M.lv.bot.miss * 1.6 + 0.08; }   // one try per bounce
          if (!e.willMiss) partyHit(M, p, e);
        });
      }
      e.vz -= g * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.z += e.vz * dt; e.trail.push({ x: e.x, y: e.y, z: e.z }); if (e.trail.length > 10) e.trail.shift();
      if (e.vz < 0 && e.z <= SPARK.Z + BALL_R && e.z > SPARK.Z - 0.15 && onTable(e.x, e.y)) {
        e.z = SPARK.Z + BALL_R; e.vz = -e.vz * PARTY.bounce; var s2 = e.x < 0 ? 0 : 1; e.bounceId = (e.bounceId || 0) + 1;
        ev(M, 'partyBounce', { i: e.i, side: s2, x: e.x, y: e.y });
        if (s2 === e.lastTeam) return partyPoint(M, e, 1 - s2, 'own');
        e.side = s2; e.bounces++; if (e.bounces > sparkBounces(M) + 1) return partyPoint(M, e, 1 - s2, 'land');
      }
      if (e.z <= BALL_R) { if (e.bounces > 0 && e.side !== e.lastTeam) return partyPoint(M, e, 1 - e.side, 'land'); if (e.lastTeam >= 0) return partyPoint(M, e, 1 - e.lastTeam, 'out'); e.live = false; e.wait = 0.8; }
      if (Math.abs(e.x) > M.L + 2 || Math.abs(e.y) > M.W) { if (e.lastTeam >= 0) return partyPoint(M, e, 1 - e.lastTeam, 'out'); e.live = false; e.wait = 0.8; }
    });
  }
  function simulate(cfg, maxSec) {
    cfg = Object.assign({}, cfg); cfg.teams = (cfg.teams || [[], []]).map(function (t) { return t.map(function (w) { return Object.assign({}, w, { auto: true }); }); });
    var M = newMatch(cfg), lim = maxSec || 1800, ev2 = [];
    while (M.phase !== 'over' && M.t < lim) { step(M, 1 / 30); takeEvents(M).forEach(function (e) { ev2.push(e); }); }
    return { M: M, winner: M.winner, score: M.teams.map(function (t) { return t.score; }), sets: M.teams.map(function (t) { return t.sets; }), t: M.t, events: ev2 };
  }

  return { DT: DT, ARENA_GRAV: ARENA_GRAV, MODES: MODES, MODE_ORDER: MODE_ORDER, LEVELS: LEVELS, FILL: FILL, PYRA_COST: PYRA_COST, METER_MAX: METER_MAX, ROLE_ICON: ROLE_ICON, ROLE_NAME: ROLE_NAME, STRIKE_NAME: STRIKE_NAME, actName: actName, isStrike: isStrike, ACT_NAME: ACT_NAME,
    pyraName: pyraName, SPIRITS: SPIRITS, SPIRITS_DUO: SPIRITS_DUO, SPIRITS_TRIO: SPIRITS_TRIO, armTeam: armTeam, SPIRIT_COST: SPIRIT_COST, spiritGo: spiritGo, slotOf: slotOf, newMatch: newMatch, step: step, tick: tick, input: input, press: press, release: release, takeEvents: takeEvents, simulate: simulate,
    canReach: canReach, doTouch: doTouch, sparkTouch: sparkTouch, sparkTick: sparkTick, sparkReach: sparkReach, sparkPredict: sparkPredict, SPARK: SPARK, isSpark: isSpark, noHands: noHands, hoopTouch: hoopTouch, hoopTick: hoopTick, hoopReach: hoopReach, HOOP: { Z: HOOP_Z, R: HOOP_R, RING: RING, PTS: HOOP_PTS, NAME: HOOP_NAME, T: HOOP_T, UP: FEED_UP }, serve: serve, feedServe: feedServe, feederOf: feederOf, feedSpot: feedSpot, circleSpot: circleSpot, jumpServe: jumpServe, botServe: botServe, startServe: startServe, predict: predict, assign: assign, nextNOf: nextNOf, fill: fill, isPerson: isPerson, uOf: uOf, sgn: sgn, baseOf: baseOf, guideFor: guideFor,
    BALL_R: BALL_R, DRILL: DRILL, PARTY: PARTY, zoneRect: zoneRect, drillEnd: drillEnd, partyTick: partyTick, SPIRIT: null };   // 🔥🔥 SPIRIT = R2 hook: Spirit Dive supers (full meter) plug in here
})();
if (typeof module !== 'undefined') module.exports = PD;
// ENGINE END
