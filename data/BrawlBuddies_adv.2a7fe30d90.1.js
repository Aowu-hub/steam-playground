
/* 📏 s-brawl adv#0 */
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
/* 📏 s-brawl adv#1 */
const ADV_SEAT = ['#FF4D6D', '#3D8BFD', '#18B8A6', '#FFC845'];
const ADV_STORIES = [   // per tale: what the villain says, how the rescue ends
  {say: 'Ha! {who} is OUR playground buddy now! — Big Brax', win: '{who} is free! The Rumble Rascals say sorry and share the swings. 🛝'},
  {say: 'Sour power! The factory — and {who} — belong to the Sourbane Twins! — Fizz & Fang', win: '{who} is free and the machines hum again. The twins get a job: taste-testers! 🍭'},
  {say: 'Hmph! {who} stays in MY tower — and nobody climbs MY castle! — Baron Grumble', win: '{who} is free! Baron Grumble lowers the drawbridge and says sorry with a royal tea party. 🏰🫖'},
  {say: 'Mmmrrrhhh… huuuug… {who} is MY hug buddy now… — King Mumblebones', win: '{who} is safe in the shelter! The zombies just wanted a group hug after all. 🧟🤗'},
  {say: 'ROOOAAAR! Your town looks DELICIOUS! — Megamaw', win: 'The town is saved! Megamaw shrinks back into a tiny, sleepy monster. 👾💤'},
  {say: '{who} will make the perfect royal partner! The wedding is at sunset! — {royal}', win: '{who} is free!', wedding: '{who} and {royal} get married after all — a fair fight, a happy wedding! 👑💍', home: '{who} comes home — beach party for the whole family! 🏖️🎉'}];
const ADV_SOON = [   // tales still to come (rounds G–H) — shown on the tale list
  {icon: '🧟', name: 'Zombie Crawl', villain: 'King Mumblebones'}, {icon: '👾', name: 'Monster Outbreak', villain: 'Megamaw'}, {icon: '🧜', name: 'Undersea Rescue', villain: 'Queen Coralline'}].slice(BV.TALES.length - 3);
function advPrefsKey(){ return store('advprefs'); }
function advLoad(){ try{ const p = JSON.parse(ls(advPrefsKey()) || '{}'); if(BV.DIFFS[p.diff]) ADV.diff = p.diff; if(['off', 'bot', 'player'].indexOf(p.seat2) >= 0) ADV.seat2 = p.seat2; if(p.p2) ADV.p2 = p.p2; ['3', '4'].forEach(s => { if(['off', 'bot', 'player'].indexOf(p['seat' + s]) >= 0) ADV['seat' + s] = p['seat' + s]; if(p['p' + s]) ADV['p' + s] = p['p' + s]; }); if(p.tale >= 0 && p.tale < BV.TALES.length) ADV.tale = p.tale; if(p.macro === false) ADV.macro = false; }catch(e){} }
function advSavePrefs(){ ls(advPrefsKey(), JSON.stringify({tale: ADV.tale, diff: ADV.diff, seat2: ADV.seat2, p2: ADV.p2, seat3: ADV.seat3, p3: ADV.p3, seat4: ADV.seat4, p4: ADV.p4, macro: ADV.macro})); }
function advBest(){ try{ return JSON.parse(ls(store('advbest')) || '{}'); }catch(e){ return {}; } }
function advServer(){ return (S.progressAdv || {})[S.player] || {unlocked: 0, best: []}; }
function advTaleOpen(i){ if(i === 0 || advServer().unlocked >= i) return true; const b = advBest(); return BV.DIFF_KEYS.some(d => b[(i - 1) + '_' + d] && b[(i - 1) + '_' + d].stars > 0); }
function advStarsOf(i){ const b = advBest(), sv = (advServer().best || [])[i]; return Math.max(sv && sv.stars || 0, ...BV.DIFF_KEYS.map(d => (b[i + '_' + d] || {}).stars || 0)); }
/* 📏 s-brawl adv#2 */
function renderAdv(){
  const T = BV.TALES[ADV.tale], b = advBest();
  $('tale-list').innerHTML = BV.TALES.map((t, i) => { const open = advTaleOpen(i), st = advStarsOf(i);
    return '<button class="tale' + (i === ADV.tale ? ' on' : '') + (open ? '' : ' locked') + '" data-i="' + i + '" data-sound="' + (open ? 'pop' : 'none') + '"><span class="num">' + t.n + '</span><div class="big">' + t.icon + '</div><div class="nm">' + t.name + '</div><div class="vil">😈 ' + t.villain + '</div><div class="sub">' + t.maps.length + ' maps · ' + t.players.join('–') + ' players</div><div class="stars">' + (st ? '⭐'.repeat(st) : open ? 'Not rescued yet' : '🔒') + '</div></button>'; }).join('') +
    ADV_SOON.map((t, k) => '<div class="tale locked"><span class="num">' + (BV.TALES.length + k + 1) + '</span><div class="big">' + t.icon + '</div><div class="nm">' + t.name + '</div><div class="vil">😈 ' + t.villain + '</div><span class="soon">🔨 coming soon</span></div>').join('');
  $('tale-list').querySelectorAll('button.tale').forEach(el => el.onclick = () => { const i = Number(el.dataset.i); if(!advTaleOpen(i)){ UISound.play('error'); UI.toast('Rescue the tale before first!'); return; } ADV.tale = i; advSavePrefs(); renderAdv(); });
  $('diff-row').innerHTML = BV.DIFF_KEYS.map(k => { const D = BV.DIFFS[k], r = b[ADV.tale + '_' + k]; return '<button class="chip' + (k === ADV.diff ? ' on' : '') + '" data-k="' + k + '" data-sound="tap">' + D.icon + ' ' + D.name + (r && r.stars ? ' ' + '⭐'.repeat(r.stars) : '') + '</button>'; }).join('');
  $('diff-row').querySelectorAll('.chip').forEach(el => el.onclick = () => { ADV.diff = el.dataset.k; advSavePrefs(); renderAdv(); });
  const D = BV.DIFFS[ADV.diff];
  $('diff-note').textContent = (D.lives < 0 ? '❤️ Unlimited comebacks' : '❤️ ' + D.lives + ' team comebacks') + ' · baddies ' + (D.edmg < 1 ? 'hit softly' : D.edmg > 1.5 ? 'hit very hard' : D.edmg > 1 ? 'hit hard' : 'hit normally') + (ADV.diff === 'skull' ? ' · 💀 for brave heroes only' : '');
  // heroes: me + seats 2 (and 3 on bigger tales): nobody / a family bot / another player on this device
  const others = S.players.map(p => p.Name).filter(n => n !== S.player), max = T.players[T.players.length - 1];
  ['2', '3', '4'].forEach(s => { const k = 'p' + s; if(ADV[k] === S.player || (ADV[k] && ADV[k] !== 'Guest' && others.indexOf(ADV[k]) < 0)) ADV[k] = ''; });
  if(!ADV.p2) ADV.p2 = others[0] || 'Guest'; if(!ADV.p3 || ADV.p3 === ADV.p2) ADV.p3 = others.filter(n => n !== ADV.p2)[0] || 'Guest'; if(!ADV.p4 || ADV.p4 === ADV.p2 || ADV.p4 === ADV.p3) ADV.p4 = others.filter(n => n !== ADV.p2 && n !== ADV.p3)[0] || 'Guest';
  let html = '<div class="hseat"><canvas width="96" height="112" data-av="' + UI.esc(S.player) + '"></canvas><div class="nm">' + UI.esc(S.player) + '</div><div class="note">⌨️ ' + kk(KEYS[0].left) + kk(KEYS[0].right) + kk(KEYS[0].jump) + kk(KEYS[0].duck) + ' walk</div></div>';
  const team = T.team || 0; const seatBox = s => { let mode = ADV['seat' + s]; if(team && mode === 'off') mode = 'bot'; const nm = ADV['p' + s], humansBefore = 1 + ['2', '3'].filter(q => q < s && ADV['seat' + q] === 'player').length;
    const how = humansBefore === 1 ? '⌨️ ' + kk(KEYS[1].left) + kk(KEYS[1].right) + kk(KEYS[1].jump) + kk(KEYS[1].duck) + ' walk · 🎮 game pad ' + (humansBefore + 1) + ' works too' : '🎮 needs game pad ' + (humansBefore + 1);
    return '<div class="hseat"><canvas width="96" height="112" data-av="' + UI.esc(mode === 'player' ? nm : '') + '" data-seat2="' + mode + '"></canvas><div class="chips">' +
      [['off', '🚫 Nobody'], ['bot', '🤖 Family bot'], ['player', '👥 Player ' + s]].filter(o => !(team && o[0] === 'off')).map(([k, n]) => '<button class="chip' + (mode === k ? ' on' : '') + '" data-s="' + s + '" data-mode="' + k + '" data-sound="tap">' + n + '</button>').join('') + '</div>' +
      (mode === 'player' ? '<div class="chips">' + others.concat(['Guest']).map(n => '<button class="chip' + (n === nm ? ' on' : '') + '" data-s="' + s + '" data-pick="' + UI.esc(n) + '" data-sound="tap">' + UI.esc(n) + '</button>').join('') + '</div><div class="note">' + how + '</div>' : mode === 'bot' ? '<div class="note">A random family member helps you</div>' : '') + '</div>'; };
  if(max > 1) html += seatBox('2');
  if(max > 2) html += seatBox('3');
  if(max > 3) html += seatBox('4');
  if(team) html += '<div class="note" style="grid-column:1/-1">👾 This tale always has a team of ' + team + ' heroes — empty seats are family bots.</div>';
  $('hero-seats').innerHTML = html;
  $('hero-seats').querySelectorAll('[data-mode]').forEach(el => el.onclick = () => { ADV['seat' + el.dataset.s] = el.dataset.mode; advSavePrefs(); renderAdv(); });
  $('hero-seats').querySelectorAll('[data-pick]').forEach(el => el.onclick = () => { ADV['p' + el.dataset.s] = el.dataset.pick; advSavePrefs(); renderAdv(); });
  $('hero-seats').querySelectorAll('canvas').forEach(c => { if(c.dataset.seat2 === 'bot' || c.dataset.seat2 === 'off'){ const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); emo(x, c.dataset.seat2 === 'bot' ? '🤖' : '🚫', c.width / 2, c.height / 2, 46); return; } drawPreviewCanvas(c, myAvatar(c.dataset.av === 'Guest' ? 'Guest' : c.dataset.av), {name: c.dataset.av, t: 1}); });
  const K0 = KEYS[0];
  $('hero-note').innerHTML = '👊 ' + kk(K0.boop) + ' boop (3 in a row = combo) · 💥 ' + kk(K0.bonk) + ' big bonk · 🌀 ' + kk(K0.power) + ' power (full ⚡) · ⤴️ ' + kk(K0.dodge) + ' jump · walk ' + kk(K0.jump) + ' / ' + kk(K0.duck) + ' = up / down the street. Stand on a ⚽ and press 👊 to pick it up, 👊 again to throw.' +
    '<br>💨 ' + kk(K0.right) + kk(K0.right) + ' dash · 🛡️ hold ' + kk(K0.boop) + '+' + kk(K0.bonk) + ' block → then ' + kk(K0.boop) + ' / ' + kk(K0.bonk) + ' = ⚡ counter · 🔨 hold ' + kk(K0.bonk) + ' = guard breaker · 🤼 ' + kk(K0.bonk) + '+' + kk(K0.power) + ' grab · ⚔️ boss clash: type the keys you see!' +
    (isTouch() ? '<div class="chips" style="margin-top:6px;justify-content:center"><span class="note" style="margin:0 6px 0 0">📱 Extra buttons 🛡️ Block + 🤼 Grab:</span><button class="chip' + (ADV.macro ? ' on' : '') + '" data-macro="1" data-sound="tap">On</button><button class="chip' + (ADV.macro ? '' : ' on') + '" data-macro="0" data-sound="tap">Off</button></div>' : '');
  $('hero-note').querySelectorAll('[data-macro]').forEach(el => el.onclick = () => { ADV.macro = el.dataset.macro === '1'; advSavePrefs(); renderAdv(); });
  const gb = $('adv-go'); if(gb) gb.textContent = '🗺️ Start ' + T.icon + ' ' + T.name + '!';
}
function advPickFamily(exclude){ const pool = S.players.map(p => p.Name).filter(n => exclude.indexOf(n) < 0); return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null; }
function advGo(){
  const T = BV.TALES[ADV.tale], max = T.players[T.players.length - 1], heroes = [{name: S.player, human: true}], seats = [['2', ADV.seat2, ADV.p2], ['3', ADV.seat3, ADV.p3], ['4', ADV.seat4, ADV.p4]].filter(s => Number(s[0]) <= max).map(s => T.team && s[1] === 'off' ? [s[0], 'bot', s[2]] : s);
  seats.forEach(([s, mode, nm]) => { if(mode === 'player'){ let n = nm || 'Guest'; if(n !== 'Guest' && heroes.some(h => h.name === n)) n = 'Guest'; heroes.push({name: n, human: true}); } });
  const taken = () => heroes.map(h => h.name), captive = T.noCaptive ? '' : advPickFamily(taken()) || 'Teddy';
  seats.forEach(([s, mode]) => { if(mode === 'bot') heroes.push({name: advPickFamily(taken().concat([captive])) || 'Buddy ' + (heroes.length + 1), human: false}); });
  const prisoner = T.prisoner ? (advPickFamily(taken().concat([captive])) || 'Buddy') : '';
  startAdv(heroes, captive, prisoner ? {prisoner} : null);
}
const FOE_LOOK = {rascal: 0, kicker: 1, splasher: 4, brax: 8, gummy: 3, jawbreaker: 8, sprinkler: 7, fizz: 6, fang: 1, guard: 9, knight: 5, archer: 3, grumble: 6, zombie: 3, runner: 5, bloater: 2, mumble: 8, megamumble: 6, barnacle: 8, coralline: 4, finnegan: 5};
function foeAvatar(type, n){
  const a = defaultAvatar(type + ' ' + n); a.acc = 0; a.eq = {};
  a.outfitColor = FOE_LOOK[type] != null ? FOE_LOOK[type] : 6;
  if(type === 'brax' || type === 'grumble'){ a.hair = 2; a.hairColor = 1; }
  if(type === 'coralline'){ a.hair = 6; a.hairColor = 4; } if(type === 'finnegan'){ a.hair = 1; a.hairColor = 6; } if(type === 'barnacle'){ a.hair = 0; }
  if(type === 'fizz' || type === 'fang'){ a.hair = 5; a.hairColor = type === 'fizz' ? 6 : 2; a.skin = 1; }
  return fixAv(a);
}
function advHeroAv(h, k){ const raw = myAvatar(h.name === 'Guest' ? 'Guest' : h.name); h.avF = fightAv(raw); h.ring = ADV_SEAT[k % 4]; h.glove = ADV_SEAT[k % 4]; h.noHelm = true; h.gear = h.human ? (S.gear[h.name] != null ? S.gear[h.name] : null) : null; }
function startAdv(heroes, captive, opts){
  hideResult();
  const M = BV.newRun(Object.assign({tale: ADV.tale, diff: ADV.diff, seed: (Date.now() & 0xffffff) ^ 0x51, heroes, captive, view: advViewW()}, opts || {}));
  M.heroes.forEach((h, k) => advHeroAv(h, k));
  const capAv = myAvatar(captive || 'Buddy'), prisAv = M.prisoner ? fightAv(myAvatar(M.prisoner)) : null;
  GameComic._reset('adv');   // 💥 ck-room: fresh log per tale
  AV = {M, t: 0, acc: 0, last: 0, raf: 0, paused: true, held: new Set(), pads: [null, null], gp: {}, tbBlk: {}, tbG: {}, hint: {t: 0, lvl: 0, k: ''}, ghost: {}, fx: [], vis: {}, foeAvs: {}, capAv: fightAv(capAv), prisAv, capName: captive, shake: 0, over: false, story: true, trans: 0, faceKey: '', startAt: performance.now()};
  window.NO_FEEDBACK_BUTTON = true; showScreen('advplay'); layoutAdv(); M.view = advViewW(); M.cam = M.view / 2; M.heroes.forEach(h => { h.tap = h.human && AV.touch; }); advHudBuild();
  advStory();
  AV.last = performance.now(); AV.raf = requestAnimationFrame(advFrame);
}
function advStory(){
  const T = AV.M.tale, st = ADV_STORIES[AV.M.ti] || ADV_STORIES[0], d = document.createElement('div'); d.className = 'astory'; d.id = 'adv-story';
  d.innerHTML = '<div class="card"><div style="font-size:2rem">' + T.icon + '</div><h2>' + T.name + '</h2><div class="who"><canvas width="96" height="112" id="story-cap"></canvas><div class="vs">😈</div><canvas width="96" height="112" id="story-vil"></canvas></div>' +
    '<p><b>' + UI.esc(T.blurb.replace('{who}', AV.capName)) + '</b></p><p class="note">💬 “' + UI.esc(st.say.replace('{who}', AV.capName).replace('{royal}', AV.M.royal ? BV.FOES[AV.M.royal].name : '')) + '”</p>' +
    '<div class="note" style="margin:6px 0">' + T.maps.map(m => m.icon + ' ' + m.name).join(' → ') + '</div><button class="btn sp-btn sp-primary" id="story-go" data-sound="pop">🗺️ Let\'s go!</button></div>';
  $('adv-stage').appendChild(d);
  if(T.noCaptive){ const x = $('story-cap').getContext('2d'); emo(x, '🏘️', 48, 56, 60); } else drawPreviewCanvas($('story-cap'), AV.capAv, {name: AV.capName, t: 1}); if(AV.M.royal) drawPreviewCanvas($('story-vil'), foeAvatar(AV.M.royal, 0), {name: BV.FOES[AV.M.royal].name, t: 1}); else if(BV.FOES[T.boss].monster){ const x = $('story-vil').getContext('2d'); emo(x, BV.FOES[T.boss].monster, 48, 56, 70); } else drawPreviewCanvas($('story-vil'), foeAvatar(T.boss, 0), {name: BV.FOES[T.boss].name, t: 1});
  if(T.prisoner) $('adv-story').querySelector('.note').insertAdjacentHTML('afterend', '<p class="note">⛓️ Someone else is locked in the dungeon too…</p>');
  $('story-go').onclick = () => { d.remove(); AV.story = false; AV.paused = false; advBanner('🗺️ ' + AV.M.map.name + ' — go right ➡️', 'good'); };
}
function leaveAdv(){
  if(!AV) return; const was = AV.paused; AV.paused = true;
  if(AV.over){ advToMenu(); return; }
  UI.confirm({icon: '◀', title: 'Leave this tale?', body: 'The tale starts again from map 1 next time.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(!AV) return; AV.paused = was; if(ok) advToMenu(); });
}
function advToMenu(){ if(AV) cancelAnimationFrame(AV.raf); AV = null; window.NO_FEEDBACK_BUTTON = false; hideResult(); $('adv-bottom').innerHTML = ''; document.querySelectorAll('#adv-arena .actl').forEach(e => e.remove()); renderAdv(); showScreen('adv'); }
function pauseAdv(){ if(!AV || AV.over || AV.story) return; AV.paused = !AV.paused; UI.pauseIcon($('adv-pause'), AV.paused); advBanner(AV.paused ? '⏸ Paused — tap ▶ to play' : '🗺️ Go!', 'good'); if(!AV.paused) AV.held.clear(); }
let advBannerT = 0;
function advBanner(text, kind, ms){ const b = $('adv-banner'); b.textContent = text; b.className = 'banner on' + (kind ? ' ' + kind : ''); clearTimeout(advBannerT); advBannerT = setTimeout(() => b.classList.remove('on'), ms || 2000); }

/* ---------- layout + touch controls ---------- */
function layoutAdv(){
  const sp = $('scr-advplay'), arena = $('adv-arena'), W = window.innerWidth, H = window.innerHeight;
  arena.querySelectorAll('.actl').forEach(e => e.remove()); $('adv-bottom').innerHTML = '';
  const touch = isTouch(), humans = AV.M.heroes.filter(h => h.human); sp.classList.toggle('port', touch && H > W * 1.05);
  sp.classList.toggle('ovl', touch && !(H > W * 1.05) && H < 560); AV.ovl = sp.classList.contains('ovl');   /* 🗺️ 24z-b ovl: phone held sideways = see-through controls + closer camera (advViewW) */
  AV.touch = touch;
  if(!touch){ $('adv-bottom').innerHTML = advLegend(); }
  else if(H > W * 1.05){ const w = document.createElement('div'); w.className = 'ctl-wrap adv-wrap';   // tall screen: pads under the picture
    if(humans.length > 1){ w.appendChild(advCtl(0, 'l', true)); w.appendChild(advCtl(1, 'r', true)); } else { w.appendChild(advCtl(0, 'l', false, 'pad')); w.appendChild(advCtl(0, 'r', false, 'btn')); }
    $('adv-bottom').appendChild(w); if(humans.length === 1) pzFitStick(w, ADV.macro ? 4 : 3); }
  else if(humans.length > 1){ arena.appendChild(advCtl(0, 'l', true)); arena.appendChild(advCtl(1, 'r', true)); }
  else { arena.appendChild(advCtl(0, 'l', false, 'pad')); arena.appendChild(advCtl(0, 'r', false, 'btn')); }
  pzArcAll($('scr-advplay')); advOvlOn();
  requestAnimationFrame(advResize); advResize();
  if(AV.M && !AV.M.t) AV.M.view = advViewW();
}
function advOvlOn(){   /* 🗺️ 24z-b */
  document.querySelectorAll('#adv-arena .actl').forEach(e => { const on = new Set(), set = () => e.classList.toggle('on', on.size > 0);
    e.addEventListener('pointerdown', ev => { on.add(ev.pointerId); set(); }, true);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(k => e.addEventListener(k, ev => { on.delete(ev.pointerId); set(); }, true)); });
}
function advLegend(){
  const set = (K, who) => '<span><b>' + who + '</b> ' + kk(K.left) + kk(K.right) + kk(K.jump) + kk(K.duck) + ' walk · ' + kk(K.boop) + '👊 ' + kk(K.bonk) + '💥 ' + kk(K.power) + '🌀 ' + kk(K.dodge) + '⤴️</span>';
  const two = AV.M.heroes.filter(h => h.human).length > 1;
  return '<div class="legend">' + set(KEYS[0], two ? '🟥' : '⌨️') + (two ? set(KEYS[1], '🟦') : '') + '<span>→ → 💨 dash · hold 👊+💥 🛡️ block → 👊/💥 ⚡ counter · hold 💥 🔨 breaker · 💥+🌀 🤼 grab · 👊 on a ⚽ = pick up · Esc = pause</span></div>';
}
function advCtl(pi, side, both, only){
  const d = document.createElement('div'); d.className = 'actl ' + side + ' p' + (pi + 1);
  const pad = '<div class="tpad" data-p="' + pi + '"><span class="ar u">▲</span><span class="ar d">▼</span><span class="ar l">◀</span><span class="ar r">▶</span><div class="knob"></div></div>';
  const btn = '<div class="tbtns"><button class="tb" data-a="boop" aria-label="Boop">👊</button><button class="tb" data-a="bonk" aria-label="Big bonk">💥</button><button class="tb pwr" data-a="power" aria-label="Power">🌀</button><button class="tb" data-a="jump" aria-label="Jump">⤴️</button>' +
    (ADV.macro ? '<button class="tb grab half blk" data-a="block" aria-label="Block (hold)">🛡️ Block</button><button class="tb grab half" data-a="grab" aria-label="Grab">🤼 Grab</button>' : '') + '</div>';
  d.innerHTML = only === 'pad' ? pad : only === 'btn' ? btn : (side === 'l' ? pad + btn : btn + pad);
  d.querySelectorAll('.tpad').forEach(el => advBindPad(el, pi));
  pzSize(d, !!both);   // 🕹️ pz-1
  if(only === 'btn' && window.UI && UI.pad){ d.classList.add('pz-r'); pzFan(d.querySelector('.tbtns'), ['bonk', 'jump', 'power'].concat(ADV.macro ? ['grab'] : []), (on) => { if(AV) AV.tbBlk[pi] = on; }); }
  d.querySelectorAll('.tb').forEach(b => { const a = b.dataset.a;
    b.addEventListener('pointerdown', e => { e.preventDefault(); if(!AV || AV.paused || AV.over || AV.hold) return; b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 140); if(navigator.vibrate) try{ navigator.vibrate(8); }catch(err){}
      if(a === 'block' || a === 'bonk'){ (a === 'block' ? AV.tbBlk : AV.tbG)[pi] = true; try{ b.setPointerCapture(e.pointerId); }catch(err){} }   // 🛡️ hold = block · 💥 hold = 🔨 breaker
      if(a === 'block') return;
      BV.press(AV.M, advHumanIdx(pi), a); });
    if(a === 'block' || a === 'bonk'){ const up = () => { if(AV) (a === 'block' ? AV.tbBlk : AV.tbG)[pi] = false; }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); } });
  return d;
}
function advBindPad(el, pi){
  const st = {id: null, l: false, r: false, u: false, d: false}; AV.pads[pi] = st;
  const T = UI.stickTracker(el), kn = el.querySelector('.knob'), ar = {l: el.querySelector('.ar.l'), r: el.querySelector('.ar.r'), d: el.querySelector('.ar.d'), u: el.querySelector('.ar.u')};
  const set = (e, first) => { const v = first ? T.start(e) : T.at(e);
    st.l = v.fx < -0.3; st.r = v.fx > 0.3; st.u = v.fy < -0.3; st.d = v.fy > 0.3;
    const m = Math.min(1, Math.hypot(v.fx, v.fy)), a = Math.atan2(v.fy, v.fx); kn.style.transform = 'translate(' + (Math.cos(a) * m * 30) + '%,' + (Math.sin(a) * m * 30) + '%)';
    ['l', 'r', 'u', 'd'].forEach(k => ar[k].classList.toggle('lit', st[k])); };
  const clear = () => { st.id = null; st.l = st.r = st.u = st.d = false; kn.style.transform = ''; el.querySelectorAll('.ar').forEach(a => a.classList.remove('lit')); };
  el.addEventListener('pointerdown', e => { e.preventDefault(); st.id = e.pointerId; try{ el.setPointerCapture(e.pointerId); }catch(err){} set(e, true); });
  UI.onFastMove(el, e => { if(st.id === e.pointerId) set(e); });
  el.addEventListener('pointerup', e => { if(st.id === e.pointerId) clear(); }); el.addEventListener('pointercancel', clear);
}
function advResize(){ if(!AV) return; const cv = $('acv'), st = $('adv-stage'); DPR = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.max(10, Math.round(st.clientWidth * DPR)); cv.height = Math.max(10, Math.round(st.clientHeight * DPR)); }
window.addEventListener('resize', () => { if(AV && !$('scr-advplay').classList.contains('hidden')) layoutAdv(); });
(function(){   // 📱 ls-1b OWN SIDEWAYS GUARD (✨ polish chat): iPhone sideways can skip the last 'resize' → watch the play box itself
  if(!window.ResizeObserver) return;
  const box = id => { const e = document.getElementById(id); return e ? e.clientWidth + 'x' + e.clientHeight : '-'; };
  const watch = (scr, boxes, ok, run) => { let last = null, n = 0, t0 = 0, later = 0;
    const check = () => { const s = document.getElementById(scr);
      if(!s || s.classList.contains('hidden') || !ok()){ last = null; return; }          // only while that screen is open
      const k = [scr].concat(boxes).map(box).join('|'); if(k === last) return;                          // same size → nothing (no loops)
      const now = Date.now(); if(now - t0 > 1000){ t0 = now; n = 0; }
      if(++n > 4){ if(!later) later = setTimeout(() => { later = 0; check(); }, 1000); return; }   // safety net: ≤ 4 runs a second
      last = k; const R = window.LS1B_RUNS || (window.LS1B_RUNS = {}); R[scr] = (R[scr] || 0) + 1;   // run count per screen (tests + device checks)
      try{ run(); }catch(e){ if(window.console) console.warn('ls-1b', scr, e); } };
    const ro = new ResizeObserver(check); [scr].concat(boxes).forEach(id => { const e = document.getElementById(id); if(e) ro.observe(e); }); };
  watch('scr-advplay', [], () => !!AV, () => layoutAdv());
})();   // 📱 ls-1b END

/* ---------- input: keys (left set = hero 1, right set = hero 2 or also hero 1 when alone) + game pads ---------- */
const CLASH_MAP = [['left', 'l'], ['right', 'r'], ['jump', 'u'], ['duck', 'd'], ['boop', 'boop'], ['bonk', 'bonk'], ['power', 'power'], ['dodge', 'jump']];
const CLASH_ICON = {l: '◀', r: '▶', u: '▲', d: '▼', boop: '👊', bonk: '💥', power: '🌀', jump: '⤴️'};
function advHumanIdx(rank){ let r = -1; for(let k = 0; k < AV.M.heroes.length; k++) if(AV.M.heroes[k].human && ++r === rank) return k; return 0; }
function advRank(i){ let r = -1; for(let k = 0; k <= i; k++) if(AV.M.heroes[k] && AV.M.heroes[k].human) r++; return r; }
function advSeatKeys(i){ const humans = AV.M.heroes.filter(h => h.human).length, r = advRank(i); return humans > 1 ? (r < 2 ? [KEYS[r]] : []) : r === 0 ? [KEYS[0], KEYS[1]] : []; }
document.addEventListener('keydown', e => {
  if(!AV || $('scr-advplay').classList.contains('hidden')) return;
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Quote', 'Semicolon', 'Slash'].indexOf(e.code) >= 0) e.preventDefault();
  if(e.code === 'Escape'){ pauseAdv(); return; }
  if(e.code === 'Enter' && AV.story){ const b = $('story-go'); if(b) b.click(); return; }
  if(e.repeat) return; AV.held.add(e.code);
  if(AV.paused || AV.over || AV.hold) return;
  if(AV.M.clash){ AV.M.heroes.forEach((h, i) => { if(!h.human) return; advSeatKeys(i).forEach(K => { CLASH_MAP.forEach(([key, sym]) => { if(K[key] === e.code) BV.clashKey(AV.M, i, sym); }); }); }); return; }
  AV.M.heroes.forEach((h, i) => { if(!h.human) return; advSeatKeys(i).forEach(K => { [['boop', 'boop'], ['bonk', 'bonk'], ['power', 'power'], ['dodge', 'jump']].forEach(([key, act]) => { if(K[key] === e.code) BV.press(AV.M, i, act); }); }); });
});
document.addEventListener('keyup', e => { if(AV) AV.held.delete(e.code); });
window.addEventListener('blur', () => { if(AV) AV.held.clear(); });
function advInputs(){
  let pads = []; try{ pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; }catch(e){}
  AV.M.heroes.forEach((h, i) => { if(!h.human) return;
    let l = false, r = false, u = false, d = false, gpBlk = false, gpG = false;
    advSeatKeys(i).forEach(K => { if(AV.held.has(K.left)) l = true; if(AV.held.has(K.right)) r = true; if(AV.held.has(K.jump)) u = true; if(AV.held.has(K.duck)) d = true; });
    const rk = advRank(i), tp = AV.pads[rk]; if(tp && tp.id != null){ l = l || tp.l; r = r || tp.r; u = u || tp.u; d = d || tp.d; }
    const gp = pads[rk]; if(gp){ const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, B = k => !!(gp.buttons[k] && gp.buttons[k].pressed);
      l = l || ax < -0.35 || B(14); r = r || ax > 0.35 || B(15); u = u || ay < -0.35 || B(12); d = d || ay > 0.35 || B(13);
      const was = AV.gp[i] || {}, now = {a: B(0), x: B(2), y: B(3), b: B(1)};
      if(now.a && !was.a) BV.press(AV.M, i, 'jump'); if(now.x && !was.x) BV.press(AV.M, i, 'boop'); if(now.y && !was.y) BV.press(AV.M, i, 'bonk'); if(now.b && !was.b) BV.press(AV.M, i, 'power'); AV.gp[i] = now;
      now.g = B(6) || B(7); if(now.g && !was.g) BV.press(AV.M, i, 'grab'); gpBlk = B(4) || B(5); gpG = now.y; }
    let blk = !!AV.tbBlk[rk] || gpBlk, gg = !!AV.tbG[rk] || gpG; advSeatKeys(i).forEach(K => { if(AV.held.has(K.boop) && AV.held.has(K.bonk)) blk = true; if(AV.held.has(K.bonk)) gg = true; });
    BV.setHold(AV.M, i, blk, gg && !blk);
    BV.setCtrl(AV.M, i, l && !r, r && !l, u && !d, d && !u);
  });
}

/* ---------- loop ---------- */
function advFrame(now){
  if(!AV) return;
  const dt = Math.min(0.05, Math.max(0, (now - AV.last) / 1000)); AV.last = now;
  if(!AV.paused && !AV.over && !AV.hold){
    advInputs(); AV.acc += dt;
    while(AV.acc >= BV.DT){ AV.acc -= BV.DT; BV.step(AV.M, BV.DT); advEvents(BV.takeEvents(AV.M)); if(AV.over) break; }
    AV.t += dt; advStepFx(dt);
    if(AV.trans > 0){ AV.trans -= dt; if(AV.trans <= 0){ BV.nextMap(AV.M); advEvents(BV.takeEvents(AV.M)); } }
  }
  advDraw(); advHud();
  AV.raf = requestAnimationFrame(advFrame);
}
function advFx(o){ if(AV.fx.length < 80) AV.fx.push(Object.assign({t: 0, life: 0.8}, o)); }
function advStepFx(dt){ if(AV.M) advHintStep(dt); AV.fx.forEach(f => f.t += dt); AV.fx = AV.fx.filter(f => f.t < f.life); if(AV.shake > 0) AV.shake -= dt; Object.keys(AV.vis).forEach(k => { const v = AV.vis[k]; if(v.react) v.react.t += dt; if(v.getup != null) v.getup += dt; }); }
const ADV_WORDS = ['BONK!', 'POW!', 'BOOP!', 'WHAM!', 'ZONK!'];
const ADV_PUZ = {steps: '👣 Follow the footprints across the sandbox — watch first!', bells: '🔔 Watch the bells, then bonk them in the same order!', clues: '🔍 Find 3 clues — break the bins, boxes and bushes!',
  sort: '🎨 Grab candies off the belt (👊) and drop each in the bin of its colour (👊)!', pipes: '🔧 Bonk the valves until every arrow points UP!', code: '🔢 Count the sweets on the wall — set the 3 dials to the counts!',
  defend: '🏭 Protect the candy machine from the baddies!', fuel: '⛽ Find 3 fuel cans and carry them to the bus (👊 at the bus)!', radio: '📻 Read the 3 torn posters — set the radio wheels (🟥 🟩 🟦)!', dark: '🔦 It\'s dark! Safe stones only show near you — follow them across!',
  shells: '🐚 Open and close the shells to match the big clam!', currents: '🌊 Wait for a lane to go calm ✨ — then swim with the calm wave!', pearls: '🦪 Pearl memory: open two clams — find the matching pairs!', sonar: '📡 Bonk the sonar to see where the 3 treasures are — then 👊 dig on the ❌!',
  wedding: '💍 The wedding! Walk up to the arch…', barricade: '🧱 Hold the barricade until the shelter opens — 💥 bonk it to fix it!', outbreak: '👾 Defend the town gate! 10 waves are coming…', crank: '⚙️ Bonk the wheel fast to lower the drawbridge — crank together!', levers: '🕹️ Watch the lights, then pull the levers in the same order!',
  torches: '🔥 Light the torches in the order the banner shows!', armour: '🗝️ Smash the suits of armour to find the jail key!'};
function advEvents(list){
  GameComic._feed('adv', list);   // 💥 ck-room
  const M = AV.M;
  list.forEach(e => {
    if(ADV_PROG.indexOf(e.k) >= 0 && AV.hint){ AV.hint.t = 0; AV.hint.lvl = 0; }
    if(e.k === 'hit'){ const v = AV.vis[e.to] || (AV.vis[e.to] = {}); v.react = {t: 0, kind: e.big ? 'big' : 'high'};
      advFx({k: 'star', x: e.x, z: e.z, y: e.y, big: e.big, word: e.big && !e.hero ? pickOne(ADV_WORDS) : '', life: 0.6});
      boing(e.hero ? 240 : e.big ? 160 : 320, e.big ? 0.22 : 0.1, e.hero ? 'square' : 'triangle', e.hero ? 0.12 : 0.16); if(e.big) AV.shake = Math.max(AV.shake, 0.15); }
    else if(e.k === 'foeKo'){ advFx({k: 'poof', x: e.x, z: e.z, y: 0.6, life: 1.1}); if(e.boss){ boing(110, 0.6, 'sawtooth', 0.2); AV.shake = 0.5; } }
    else if(e.k === 'pick'){ const P = BV.PICKS[e.item]; advFx({k: 'float', x: e.x, z: e.z, y: 1.4, txt: P.icon + ' ' + (P.heal ? '+' + P.heal + ' ❤️' : P.boost ? 'Super!' : P.secret ? 'Found!' : P.name), life: 1.1});
      UISound.play(P.secret ? 'success' : 'pop'); if(P.secret) advBanner('🧸 You found a lost teddy! (' + M.found + ' / 3)', 'gold'); if(e.item === 'clue' && M.clues) advBanner('🔍 Clue ' + M.clues.got + ' of ' + M.clues.need + (M.clues.got >= M.clues.need ? ' — the hideout is open!' : ''), 'good'); }
    else if(e.k === 'prop'){ advFx({k: 'chip', x: e.x, z: e.z, y: 0.5, icon: e.icon, life: 0.5}); boing(e.broke ? 140 : 220, 0.12, 'square', 0.1); }
    else if(e.k === 'wave'){ advRestHide(); if(e.outbreak) advBanner('🌊 Wave ' + (e.i + 1) + ' of ' + e.of + '!', 'bad', 1600); else if(e.i === 0) advBanner('😈 Rumble! Bonk them all!', 'bad', 1500); }
    else if(e.k === 'go'){ advBanner('GO ➡️', 'good', 1400); UISound.play('success'); }
    else if(e.k === 'puzzle'){ advBanner(ADV_PUZ[e.p], 'gold', 4200); }
    else if(e.k === 'clang'){ advFx({k: 'float', x: e.x, z: e.z, y: 1.6, txt: '🛡️ CLANG!', life: 0.7}); boing(900, 0.12, 'square', 0.1); if(!AV.clangTip){ AV.clangTip = 1; advBanner('🛡️ Knights block boops — use 💥 big bonk, jump, or hit them from behind!', 'gold', 3200); } }
    else if(e.k === 'blocked'){ advFx({k: 'float', x: e.x, z: e.z, y: 1.8, txt: '🛡️ ' + e.left, life: 0.7}); boing(700, 0.1, 'square', 0.1); }
    else if(e.k === 'trap'){ advBanner('😱 That armour was a knight in disguise!', 'bad', 1800); }
    else if(e.k === 'carry'){ boing(600, 0.06, 'sine', 0.1); }
    else if(e.k === 'sortOk'){ advFx({k: 'float', x: M.heroes[0].x, z: 2, y: 1.6, txt: '🍬 ' + e.got + '/' + e.need, life: 0.9}); boing(700 + e.got * 40, 0.12, 'sine', 0.15); }
    else if(e.k === 'valve' || e.k === 'dial'){ boing(520, 0.08, 'triangle', 0.12); }
    else if(e.k === 'crank'){ boing(300 + e.p * 4, 0.05, 'square', 0.06); }
    else if(e.k === 'lever' || e.k === 'torch'){ boing([520, 620, 740, 880][e.b], 0.25, 'sine', 0.16); }
    else if(e.k === 'machineHit'){ if(e.hp < 40 && !AV.machTip){ AV.machTip = 1; advBanner('🏭 The candy machine needs help!', 'bad', 1600); } }
    else if(e.k === 'machineBroke'){ advBanner('💥 The machine broke! It costs a comeback to fix it…', 'bad', 2000); AV.shake = 0.4; }
    else if(e.k === 'join'){ const h = M.heroes[e.h]; advHeroAv(h, e.h); advHudBuild(); advBanner('🎉 ' + e.name + ' is free and joins the team!', 'gold', 2600); if(FX) confetti(['🎉', '⭐', '🗝️'], 22); UISound.play('success'); }
    else if(e.k === 'rage'){ advBanner('😡 ' + e.name + ' is FURIOUS — faster now!', 'bad', 1800); }
    else if(e.k === 'boom'){ advFx({k: 'poof', x: e.x, z: e.z, y: 0.8, life: 0.8}); advFx({k: 'star', x: e.x, z: e.z, y: 1, big: true, word: 'BOOM!', life: 0.7}); AV.shake = 0.3; boing(90, 0.4, 'sawtooth', 0.2); }
    else if(e.k === 'spin'){ AV.shake = 0.25; boing(200, 0.3, 'sawtooth', 0.14); }
    else if(e.k === 'lowAir'){ advBanner('🫧 ' + M.heroes[e.h].name + ' is low on air — swim to the bubbles!', 'bad', 1800); boing(300, 0.2, 'sine', 0.1); }
    else if(e.k === 'swirl'){ advFx({k: 'float', x: M.heroes[e.h].x, z: M.heroes[e.h].z, y: 1.8, txt: '🌀 whoosh!', life: 0.7}); }
    else if(e.k === 'shell' || e.k === 'clam'){ boing(e.k === 'clam' ? 500 + e.c * 120 : 640, 0.12, 'sine', 0.14); }
    else if(e.k === 'pair'){ advBanner('✨ A pair!', 'good', 900); boing(880, 0.25, 'sine', 0.16); }
    else if(e.k === 'ping'){ boing(1500, 0.5, 'sine', 0.12); }
    else if(e.k === 'dug'){ advFx({k: 'float', x: e.x, z: e.z, y: 1, txt: '💎 ' + e.got + '/3', life: 1}); UISound.play('success'); }
    else if(e.k === 'wedding'){ advBanner('💍 ' + e.royal + ' is marrying ' + e.who + '! 👊 to shout “WE OBJECT!”', 'gold', 4000); }
    else if(e.k === 'object'){ if(FX) bigWordAdv('WE OBJECT!'); boing(200, 0.5, 'sawtooth', 0.2); AV.shake = 0.3; }
    else if(e.k === 'trialRound'){ advBanner('⚔️ Trial of Strength — round ' + e.round + ' of 3 vs ' + e.name + '!', 'bad', 2400); }
    else if(e.k === 'choice'){ advChoice(e); }
    else if(e.k === 'ending'){ const ch = $('adv-choice'); if(ch) ch.remove(); if(FX) confetti(e.how === 'wedding' ? ['💍', '👑', '💖', '🐚'] : ['🏖️', '🎉', '🍉', '⭐'], 36); }
    else if(e.k === 'flash'){ advFx({k: 'beam', x: e.x, z: e.z, face: e.face, y: 1.1, life: 0.5}); boing(1200, 0.15, 'sine', 0.12); if(e.n) advFx({k: 'float', x: e.x + e.face * 2, z: e.z, y: 2, txt: '🔦 FREEZE!', life: 0.9}); }
    else if(e.k === 'fuelIn'){ advBanner('⛽ Fuel ' + e.got + ' of ' + e.need + (e.got >= e.need ? ' — VROOM! The bus works!' : ''), 'good', 1600); boing(300 + e.got * 120, 0.2, 'square', 0.12); }
    else if(e.k === 'fix'){ boing(660, 0.06, 'square', 0.08); }
    else if(e.k === 'flee'){ advBanner('🚪 The shelter door opens — the zombies wander off!', 'gold', 2200); }
    else if(e.k === 'burst'){ advFx({k: 'poof', x: e.x, z: e.z, y: 0.5, life: 0.8}); advFx({k: 'float', x: e.x, z: e.z, y: 1.2, txt: '🤢 SPLORT!', life: 0.9}); boing(110, 0.3, 'sawtooth', 0.14); }
    else if(e.k === 'evolving'){ advBanner('😱 ' + e.name + ' is… changing…', 'bad', 1800); AV.shake = 0.6; }
    else if(e.k === 'evolve'){ advBanner('👑 ' + e.name + '!!', 'bad', 2200); if(FX) bigWordAdv(e.name.toUpperCase() + '!'); boing(70, 0.7, 'sawtooth', 0.22); }
    else if(e.k === 'cannonOn'){ advBanner('💣 The town cannon is ready — stand at it and 👊 when the 🎯 lines up!', 'gold', 3000); }
    else if(e.k === 'cannon'){ AV.shake = 0.25; boing(80, 0.35, 'sawtooth', 0.2); }
    else if(e.k === 'rest'){ advRestShow(); }
    else if(e.k === 'card'){ const C = BV.CARDS[e.card]; advBanner(C.icon + ' ' + C.name + '!', 'gold', 1600); UISound.play('success'); advRestShow(); }
    else if(e.k === 'poor'){ advBanner('🪙 Not enough coins for that one', 'bad', 1200); }
    else if(e.k === 'saved'){ if(FX) confetti(['🎉', '🏘️', '⭐', '👾'], 34); }
    else if(e.k === 'broke'){ advFx({k: 'float', x: M.heroes[e.h].x, z: M.heroes[e.h].z, y: 2, txt: '🍭 crunch!', life: 0.9}); }
    else if(e.k === 'solved'){ advBanner('🧩 Puzzle solved! +500', 'gold'); UISound.play('success'); if(FX) confetti(['⭐', '🧩', '✨'], 18); }
    else if(e.k === 'mud'){ const dk = M.puzzle && M.puzzle.dark; advFx({k: 'float', x: e.x, z: e.z, y: 0.6, txt: dk ? '🟢 Gloop!' : '💩 Squelch!', life: 1}); boing(120, 0.25, 'sawtooth', 0.12); advBanner(dk ? 'Eww, goo! Back to the start — only step on the glowing stones ✨' : 'Oops, mud! Watch the footprints again 👣', 'bad', 1500); }
    else if(e.k === 'stepOk'){ boing(500 + e.c * 60, 0.08, 'sine', 0.12); }
    else if(e.k === 'bell'){ boing([660, 880, 990][e.b], 0.35, 'sine', 0.2); }
    else if(e.k === 'wrong'){ advBanner('❌ Wrong bell — listen again!', 'bad', 1400); }
    else if(e.k === 'heroKo'){ const h = M.heroes[e.h]; advBanner('💫 ' + h.name + ' is bonked out!' + (M.lives === 0 ? '' : ' Back in a moment…'), 'bad', 1600); }
    else if(e.k === 'respawn'){ advFx({k: 'float', x: M.heroes[e.h].x, z: M.heroes[e.h].z, y: 2, txt: '⭐ Back!', life: 1}); }
    else if(e.k === 'boss'){ advRestHide(); advBanner((e.mini ? '⭐ Mini-boss: ' : '😈 ') + e.name + '!', 'bad', 2200); if(FX) bigWordAdv(e.name.toUpperCase() + '!'); }
    else if(e.k === 'summon'){ advBanner('📣 ' + e.name + ': "' + ({brax: 'Rascals, get them!', fang: 'Gummies, attack!', grumble: 'Guards! GUARDS!', mumble: 'Huuuug squad!', megamumble: 'MORE HUUUGS!', gloopula: 'Little blobs, go!', megamaw: 'Minions, FEAST!'}[M.bosses[0] && M.bosses[M.bosses.length - 1].type] || 'Get them!') + '"', 'bad', 1800); }
    else if(e.k === 'special'){ advBanner({charge: '💨 ' + e.name + ' charges — jump or step aside!', pound: '💥 Ground pound — jump over the ring!', spin: '🌀 ' + e.name + ' spins his sword — back off!', potions: '🧪 Potion bottles — change lanes!'}[e.move] || '😈 Watch out!', 'bad', 1400); }
    else if(e.k === 'pound'){ AV.shake = 0.4; boing(80, 0.4, 'sawtooth', 0.2); }
    else if(e.k === 'splash'){ advFx({k: 'chip', x: e.x, z: e.z, y: 0.2, icon: '💦', life: 0.5}); }
    else if(e.k === 'throw' || e.k === 'lob' || e.k === 'swing'){ if(e.k !== 'swing') boing(420, 0.08, 'triangle', 0.08); }
    else if(e.k === 'exitOpen'){ if(!M.map.boss) advBanner('➡️ Head to the end of ' + M.map.name + '!', 'good'); }
    else if(e.k === 'mapEnd'){ advBanner(e.last ? '' : '🗺️ ' + M.map.name + ' cleared!', 'gold', 1500); AV.trans = 1.4; UISound.play('success'); }
    else if(e.k === 'map'){ if(e.i > 0){ advBanner(M.map.icon + ' ' + M.map.name, 'good', 2200); } advHudBuild(); }
    else if(e.k === 'rescue'){ advBanner('🎉 ' + e.who + ' is free!', 'gold', 2400); if(FX) confetti(['🎉', '⭐', '💖', '🧸'], 34); UISound.play('success'); }
    else if(e.k === 'dash'){ advFx({k: 'chip', x: e.x - e.dir * 0.3, z: e.z, y: 0.3, icon: '💨', life: 0.4}); boing(760, 0.06, 'sine', 0.06); }
    else if(e.k === 'block'){ const h = M.heroes[e.h]; advFx({k: 'float', x: e.x + h.face * 0.4, z: e.z, y: 1.9, txt: e.perfect ? '✨ PERFECT BLOCK!' : '🛡️ BLOCK!', life: 0.7}); boing(e.perfect ? 980 : 640, 0.07, 'sine', 0.1);
      if(e.ctr && h.human && !AV.ctrTip){ AV.ctrTip = 1; advBanner('⚡ Blocked! Press 👊 or 💥 right now to COUNTER!', 'gold', 2200); } }
    else if(e.k === 'counter'){ advFx({k: 'star', x: e.x, z: e.z, y: 1.3, big: true, word: e.n > 1 ? 'COUNTER ×' + e.n + '!' : 'COUNTER!', life: 0.8}); boing(1100, 0.12, 'square', 0.08); AV.shake = Math.max(AV.shake, 0.12); }
    else if(e.k === 'parry'){ advFx({k: 'float', x: e.x, z: e.z, y: 2.3, txt: '🛡️ ' + e.name + ' blocks — 🛡️ block back!', life: 1.1}); boing(500, 0.1, 'square', 0.1); }
    else if(e.k === 'grab'){ advFx({k: 'float', x: e.x, z: e.z, y: 2.3, txt: '🤼 ' + e.icon + ' ' + e.name + '!', life: 1.1}); UISound.play('whoosh'); }
    else if(e.k === 'slam'){ advFx({k: 'star', x: e.x, z: e.z, y: 0.6, big: true, word: 'SLAM!', life: 0.7}); AV.shake = Math.max(AV.shake, 0.3); boing(90, 0.3, 'sawtooth', 0.18); }
    else if(e.k === 'bowl'){ advFx({k: 'star', x: e.x, z: e.z, y: 1, big: true, word: '🎳 STRIKE!', life: 0.7}); }
    else if(e.k === 'charge'){ boing(240, 0.25, 'sawtooth', 0.05); }
    else if(e.k === 'gbreak'){ advFx({k: 'star', x: e.x, z: e.z, y: 1.4, big: true, word: '🔨 GUARD BREAK!', life: 0.9}); AV.shake = Math.max(AV.shake, 0.3); boing(130, 0.35, 'sawtooth', 0.18); }
    else if(e.k === 'fblock'){ advFx({k: 'float', x: e.x, z: e.z, y: 2.1, txt: '🛡️ BLOCKED!', life: 0.6}); boing(900, 0.08, 'square', 0.08); if(!AV.guardTip){ AV.guardTip = 1; advBanner('🛡️ ' + e.name + ' blocks! Hold 💥 for a 🔨 guard breaker — or 🤼 grab!', 'gold', 3000); } }
    else if(e.k === 'guardBreak'){ advFx({k: 'float', x: e.x, z: e.z, y: 2.2, txt: '😵 Guard broken!', life: 1}); boing(150, 0.3, 'sawtooth', 0.14); }
    else if(e.k === 'clash'){ if(FX) bigWordAdv('⚔️ CLASH!'); boing(70, 0.6, 'sawtooth', 0.2); AV.shake = 0.4; AV.held.clear(); }
    else if(e.k === 'clashOk'){ boing(700 + Math.random() * 200, 0.05, 'sine', 0.08); }
    else if(e.k === 'clashBad'){ boing(140, 0.15, 'square', 0.08); }
    else if(e.k === 'clashSet'){ boing(1200, 0.18, 'square', 0.1); if(M.heroes[e.h] && M.heroes[e.h].human && FX) bigWordAdv('COMBO ×' + e.sets + '!'); }
    else if(e.k === 'clashWin'){ AV.shake = 0.6; boing(60, 0.6, 'sawtooth', 0.22); if(FX) confetti(['💥', '⭐', '⚔️'], 18); }
    else if(e.k === 'clashLose'){ AV.shake = 0.4; advBanner('😵 ' + e.name + ' won the clash — next time type faster!', 'bad', 1800); }
    else if(e.k === 'win'){ advEnd(true); }
    else if(e.k === 'lose'){ advEnd(false); }
  });
}
// 💍 after the Trial of Strength: the captive decides — the wedding goes on, or home to a beach party
function advChoice(e){
  const d = document.createElement('div'); d.className = 'astory'; d.id = 'adv-choice';
  d.innerHTML = '<div class="card"><div style="font-size:2rem">💍🏖️</div><h2>You won the Trial of Strength!</h2><p><b>' + UI.esc(e.who) + '</b> gets to choose. What happens now?</p><div class="go-row"><button class="btn soft sp-btn sp-secondary" id="end-wed" data-sound="pop">👑 Let the wedding go on</button><button class="btn sp-btn sp-primary" id="end-home" data-sound="pop">🏖️ Come home — beach party!</button></div></div>';
  $('adv-stage').appendChild(d); $('end-wed').onclick = () => { BV.chooseEnding(AV.M, 'wedding'); advEvents(BV.takeEvents(AV.M)); }; $('end-home').onclick = () => { BV.chooseEnding(AV.M, 'home'); advEvents(BV.takeEvents(AV.M)); };
}
// 🍹 refreshment stop between outbreak waves: heal, buy one upgrade card with coins, fix the gate, then Ready
function advRestShow(){
  const M = AV.M, P = M.puzzle; if(!P || P.k !== 'outbreak' || P.state !== 'rest') return; let d = $('adv-rest'); if(!d){ d = document.createElement('div'); d.id = 'adv-rest'; d.className = 'arest'; $('adv-stage').appendChild(d); }
  d.innerHTML = '<div class="card"><h3>🍹 Refreshment stop — wave ' + P.wave + ' of ' + P.of + ' done!</h3><div class="note">Everyone healed ❤️ · 🪙 ' + (M.coins || 0) + ' coins · 💥 bonk the gate to fix it</div><div class="cards">' +
    P.cards.map((k, i) => { const C = BV.CARDS[k], can = !P.bought && M.coins >= C.cost; return '<button class="ucard' + (P.bought === k ? ' got' : '') + (can ? '' : ' off') + '" data-c="' + k + '" data-sound="pop"><b>' + C.icon + '</b><span>' + C.name + '</span><small>' + C.text + '</small><em>' + (P.bought === k ? '✅' : '🪙 ' + C.cost) + '</em><i>' + (i + 1) + '</i></button>'; }).join('') +
    '</div><button class="btn sp-btn sp-primary" id="rest-go" data-sound="pop">▶ Ready! (Enter)</button></div>';
  d.querySelectorAll('.ucard').forEach(b => b.onclick = () => { BV.buyCard(M, b.dataset.c); advEvents(BV.takeEvents(M)); advRestShow(); }); $('rest-go').onclick = () => { BV.restReady(M); advRestHide(); };
}
function advRestHide(){ const d = $('adv-rest'); if(d) d.remove(); }
document.addEventListener('keydown', e => { if(!AV || !$('adv-rest')) return; const P = AV.M.puzzle; if(!P || P.state !== 'rest') return;
  if(e.code === 'Enter'){ BV.restReady(AV.M); advRestHide(); e.preventDefault(); } const n = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code); if(n >= 0 && P.cards[n]){ BV.buyCard(AV.M, P.cards[n]); advEvents(BV.takeEvents(AV.M)); advRestShow(); } });
function bigWordAdv(t){ const d = document.createElement('div'); d.className = 'big-word'; d.textContent = t; $('adv-stage').appendChild(d); setTimeout(() => d.remove(), 1100); }

/* ---------- end of the tale ---------- */
function advEnd(win){
  const M = AV.M; AV.over = true; const secs = Math.round(M.t), stars = BV.starsFor(M), key = M.ti + '_' + M.diff, b = advBest(), old = b[key] || {};
  if(win){ b[key] = {stars: Math.max(old.stars || 0, stars), time: old.time ? Math.min(old.time, secs) : secs, found: Math.max(old.found || 0, M.found), score: Math.max(old.score || 0, M.score)}; ls(store('advbest'), JSON.stringify(b)); }
  const st = ADV_STORIES[M.ti] || ADV_STORIES[0], D = M.D;
  advSaveRun(M, win, secs, stars);
  setTimeout(() => {
    if(!AV) return;
    showResult((win ? '<div class="big">🎉</div><h2 class="cheer">' + (M.tale.noCaptive ? 'The town is saved!' : UI.esc(M.captive) + ' is rescued!') + '</h2><div class="note">' + UI.esc((M.ending && st[M.ending] ? st[M.ending] : st.win).replace('{who}', M.captive).replace('{royal}', M.royal ? BV.FOES[M.royal].name : '')) + '</div><div style="font-size:1.8rem;margin:6px 0">' + '⭐'.repeat(stars) + '<span style="opacity:.25">' + '⭐'.repeat(3 - stars) + '</span></div>'
      : '<div class="big">💫</div><h2>Out of comebacks…</h2><div class="note">' + (M.tale.noCaptive ? 'The monsters broke through the gate.' : UI.esc(M.tale.villain) + ' still ' + (/&/.test(M.tale.villain) ? 'have ' : 'has ') + UI.esc(M.captive) + '.') + ' Try again — or pick an easier difficulty!</div>') +
      '<div class="note" style="margin:8px 0">' + D.icon + ' ' + D.name + ' · ⏱️ ' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + ' · 😈 ' + M.kos + ' bonked · 🧸 ' + M.found + ' / 3 · ❤️ ' + M.livesUsed + ' comeback' + (M.livesUsed === 1 ? '' : 's') + ' · 🏆 ' + M.score.toLocaleString() + '</div>' +
      (win && stars < 3 ? '<div class="note">⭐⭐⭐ = ' + (M.tale.noCaptive ? 'save the town' : 'rescue') + ' without a single comeback.</div>' : '') +
      '<div class="comic-strip-slot" id="comic-strip-slot"></div><div class="note" id="save-note">' + (NOTES.filter(Boolean).join('<br>') || (M.heroes.some(h => h.human && h.name !== 'Guest') ? '⏳ Saving…' : '')) + '</div><div class="go-row" style="margin-top:10px"><button class="btn soft sp-btn sp-secondary" data-sound="none" onclick="advToMenu()">🗺️ Tales</button><button class="btn sp-btn sp-primary" data-sound="pop" onclick="advAgain()">🔁 Play again</button></div>');
  }, win ? 600 : 900);
}
// 💾 every human hero gets the run on the 🗺️ Brawenture board (level = tale, Theme = difficulty) + feats; a lost run saves feats only
function advSaveRun(M, win, secs, stars){
  NOTES.length = 0; const coop = M.heroes.filter(h => h.human).length > 1 ? 1 : 0;
  M.heroes.forEach((h, seat) => { if(!h.human || h.name === 'Guest') return;
    const stats = {runs: 1, puzzles: M.stats.puzzles, bosses: M.bossKos || 0, found: M.found, kos: h.st.kos, coop}; if(win){ stats.tales = 1; stats['t' + (M.ti + 1)] = 1; if(M.diff === 'skull') stats.hardcore = 1; }
    if(win){ const extra = {cleared: true, timeSec: secs, stars, score: M.score, theme: M.D.icon + ' ' + M.D.name, stats}, sv = (S.progressAdv[h.name] || (S.progressAdv[h.name] = {unlocked: 0, tokens: [], best: []}));
      google.script.run.withSuccessHandler(res => { sv.unlocked = res.unlocked; sv.tokens = res.tokens; if(res.best){ sv.best = (sv.best || []).slice(); sv.best[M.ti] = res.best; } putNote(seat, UI.esc(h.name) + ': ' + saveText(res, true)); })
        .withFailureHandler(() => { writePending(readPending().concat([{game: 'brawenture', name: h.name, lvl: M.ti, extra}])); putNote(seat, UI.esc(h.name) + ': ⚠️ Will be sent next time.'); }).saveLevelResult('brawenture', h.name, M.ti, extra); }
    else { google.script.run.withSuccessHandler(res => putNote(seat, UI.esc(h.name) + ': ' + featText(res, '✅ Feats saved')))
        .withFailureHandler(() => { writePending(readPending().concat([{game: 'brawenture', name: h.name, feats: true, stats}])); putNote(seat, UI.esc(h.name) + ': ⚠️ Will be sent next time.'); }).saveFeats(h.name, 'brawenture', stats); } });
}
function advAgain(){ const hs = AV.M.heroes.map(h => ({name: h.name, human: h.human})), cap = AV.M.captive; cancelAnimationFrame(AV.raf); AV = null; startAdv(hs, cap); }

/* ---------- HUD ---------- */
function advHudBuild(){
  const M = AV.M; AV.chipKey = {};
  $('adv-heroes').innerHTML = M.heroes.map((h, i) => '<div class="hchip" id="hc' + i + '" style="--c:' + ADV_SEAT[i % 4] + '"><div class="hav"><canvas width="68" height="68" id="hcf' + i + '"></canvas><svg class="dring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" pathLength="100" id="hds' + i + '"></circle></svg><span class="hseatn">' + (h.human ? i + 1 : '🤖') + '</span></div>' +
    '<div class="col"><div class="nmrow"><span class="nm">' + UI.esc(h.name) + '</span><span class="hpn" id="hpn' + i + '"></span></div><div class="hp"><em id="hgh' + i + '"></em><b id="hhp' + i + '"></b><i class="seg"></i></div><div class="row3"><div class="pw"><b id="hpw' + i + '"></b></div><div class="gd" id="hgw' + i + '"><b id="hgd' + i + '"></b></div></div>' + (M.map.water ? '<div class="air"><b id="hair' + i + '"></b></div>' : '') + '</div><span class="it" id="hit' + i + '"></span></div>').join('');
  M.heroes.forEach((h, i) => drawFace($('hcf' + i), {name: h.name, avF: h.avF, human: true}, 0));
  $('adv-map').textContent = M.map.icon + ' ' + M.map.name;
}
function advClashHud(){
  const M = AV.M, C = M.clash; let d = $('adv-clash');
  if(!C){ if(d) d.remove(); return; }
  if(!d){ d = document.createElement('div'); d.id = 'adv-clash'; d.className = 'aclash'; $('adv-stage').appendChild(d); AV.clashKey = ''; }
  const rows = M.heroes.map(h => { const p = C.per[h.i]; if(!p) return ''; const K = h.human ? advSeatKeys(M.heroes.indexOf(h))[0] : null;
    const box = (x, k) => { const cls = k < p.pos ? ' ok' : k === p.pos && h.human ? ' now' : ''; if(!h.human) return '<span class="ck' + (k < p.pos ? ' ok' : '') + '">' + CLASH_ICON[x] + '</span>';
      if(h.tap || !K) return '<span class="ck big' + cls + '">' + CLASH_ICON[x] + '</span>'; const key = CLASH_MAP.find(m => m[1] === x)[0]; return '<span class="ck' + cls + '">' + UI.esc(keyName(K[key])) + '<small>' + CLASH_ICON[x] + '</small></span>'; };
    return '<div class="crow' + (h.human ? '' : ' bot') + (p.bad > 0 ? ' bad' : '') + '" style="--c:' + ADV_SEAT[h.seat % 4] + '"><span class="cwho">' + (h.human ? '' : '🤖 ') + UI.esc(h.name) + '</span><span class="ckeys">' + p.seq.map(box).join('') + '</span><span class="sets">×' + p.sets + '</span></div>'; }).join('');
  const key = rows + '|' + (C.intro > 0) + '|' + (C.res ? C.res.win : '') + '|' + C.dmg;
  if(key !== AV.clashKey){ AV.clashKey = key;
    d.innerHTML = '<h3>⚔️ CLASH! <span>vs ' + UI.esc(C.name) + '</span></h3>' + (C.res ? '<div class="cres">' + (C.res.win ? '💥 ' + C.sets + ' combos — ' + UI.esc(C.name) + ' takes ' + C.res.dmg + '!' : '😵 No combos — ' + UI.esc(C.name) + ' wins the clash!') + '</div>' :
      '<div class="ctime"><b id="adv-clt"></b></div><div class="note">' + (C.intro > 0 ? 'Get ready… type the keys in order!' : (AV.touch ? 'Tap the buttons in order! 👊 💥 🌀 ⤴️' : 'Type the keys in order! Each combo = more 💥')) + '</div>' + rows + '<div class="cdmg">💥 ' + C.dmg + ' damage</div>'); }
  const tb = $('adv-clt'); if(tb) tb.style.width = Math.max(0, Math.min(1, C.intro > 0 ? 1 : C.t / C.T)) * 100 + '%';
}
const ADV_HINT = {steps: 'Step only where the footprints went — wait at the edge and watch them again.', bells: 'The bells flash one by one — bonk them in that same order.', clues: 'Clues hide inside bins, boxes and bushes — break them all!',
  sort: 'Stand by the belt, 👊 to grab a candy, walk to the bin with the same colour and 👊 to drop it.', pipes: 'Each bonk turns a valve a quarter turn — stop when its arrow points UP ⬆️.', code: 'Count the sweets on the wall: 🍬 → 1st dial, 🍭 → 2nd, 🍫 → 3rd. Bonk a dial to change it.',
  fuel: 'Smash the cars — one hides a ⛽ can. Carry it to the bus and press 👊 there.', radio: 'Each torn poster shows a colour and a number — bonk that colour\'s wheel until it matches.', dark: 'Walk slowly — the safe stones glow when you stand next to them.',
  shells: 'Look at the big clam: open shells should be open, closed ones closed. Bonk a shell to flip it.', currents: 'Wait at the edge until the lane in front sparkles ✨ — then swim right with the calm wave.', pearls: 'Remember where each pearl colour was — open two clams with the same colour.',
  sonar: 'Bonk the 📡 sonar, look where the ❌ marks pop up, then stand on one and press 👊 to dig.', levers: 'Watch the lights, then pull the levers in that same order.', torches: 'The banner shows the animals in order — light each torch in that order.', armour: 'Keep bonking the suits of armour — one of them has the 🗝️ key.',
  crank: 'Everyone bonk the wheel together, fast!', defend: 'Bonk the baddies that run at the machine first!', barricade: 'Bonk the zombies at the barricade — 💥 the barricade to fix it.'};
const ADV_PROG = ['stepOk', 'bell', 'lever', 'torch', 'valve', 'dial', 'sortOk', 'carry', 'shell', 'clam', 'pair', 'ping', 'dug', 'fuelIn', 'pick', 'prop', 'solved', 'crank', 'puzzle', 'map'];
function advHintStep(dt){
  const M = AV.M, P = M.puzzle, H = AV.hint, live = M.D.hint && P && !P.done && !M.clash && !M.foes.some(f => !f.dead) && ADV_HINT[P.k];
  if(!live){ H.t = 0; H.lvl = 0; H.k = ''; return; }
  if(H.k !== P.k){ H.k = P.k; H.t = 0; H.lvl = 0; }
  H.t += dt; const lvl = H.t >= 25 ? 2 : H.t >= 12 ? 1 : 0;
  if(lvl >= 2 && (!H.at || AV.t - H.at > 0.5)){ H.at = AV.t; H.tgt = BV.hintFor(M); }
  H.lvl = lvl;
}
function advHintHud(){
  const H = AV.hint, P = AV.M.puzzle; let d = $('adv-hint');
  if(!H || H.lvl < 1 || !P){ if(d) d.remove(); return; }
  if(!d){ d = document.createElement('div'); d.id = 'adv-hint'; d.className = 'ahint'; $('adv-stage').appendChild(d); }
  const txt = '💡 ' + ADV_HINT[P.k] + (H.lvl >= 2 && H.tgt ? ' 👇 Try here!' : ''); if(d.textContent !== txt) d.textContent = txt;
}
function advPuzzleInfo(M, P){
  if(P.k === 'outbreak') return '🌊 ' + P.wave + '/' + P.of + ' · 🪙 ' + (M.coins || 0) + ' · 🏰 ' + Math.max(0, Math.round(M.machine.hp / M.machine.max * 100)) + '%';
  return {shells: () => '🐚 ' + P.shells.filter((s, k) => s.open === P.target[k]).length + '/5', currents: () => '🌊', pearls: () => '🦪 ' + P.clams.filter(q => q.done).length / 2 + '/3', sonar: () => '💎 ' + P.got + '/3', wedding: () => P.stage === 'trial' ? '⚔️ ' + P.round + '/3' : P.stage === 'royal' ? '👑' : '💍',
    fuel: () => '⛽ ' + P.got + '/3', radio: () => '📻 ' + P.wheels.map(d => d.v).join(''), dark: () => '🔦 ' + (P.prog + 1) + '/' + P.cols, barricade: () => '🧱 ' + Math.max(0, Math.ceil(P.left)) + 's · ' + Math.max(0, Math.round(M.machine.hp / M.machine.max * 100)) + '%',bells: () => '🔔 ' + P.pos + '/' + P.seq.length, levers: () => '🕹️ ' + P.pos + '/' + P.seq.length, torches: () => '🔥 ' + P.pos + '/4', steps: () => '👣 ' + (P.prog + 1) + '/' + P.cols, clues: () => '🔍 ' + (M.clues ? M.clues.got : 0) + '/3',
    sort: () => '🍬 ' + P.got + '/' + P.need, pipes: () => '🔧 ' + P.valves.filter(v => v.r === 0).length + '/4', code: () => '🔢 ' + P.dials.map(d => d.v).join(''), defend: () => '🏭 ' + Math.max(0, M.machine ? M.machine.hp : 0) + '%', crank: () => '⚙️ ' + Math.round(P.prog) + '%', armour: () => '🗝️'}[P.k]();
}
function advHud(){
  const M = AV.M;
  M.heroes.forEach((h, i) => { const hp = $('hhp' + i); if(!hp) return; const u = Math.max(0, h.hp / h.maxHp), w = (u * 100).toFixed(1) + '%'; hp.style.width = w; $('hgh' + i).style.width = w; $('hpw' + i).style.width = h.power + '%';
    const c = $('hc' + i), hpn = Math.max(0, Math.ceil(h.hp)) + ''; if($('hpn' + i).textContent !== hpn) $('hpn' + i).textContent = hpn;
    c.classList.toggle('low', u < 0.3); c.classList.toggle('mid', u >= 0.3 && u < 0.6); c.classList.toggle('blk', !!h.blk); c.classList.toggle('ctr', !!h.ctr);
    const ds = $('hds' + i), cd = Math.max(0, h.dashCd || 0) / BV.DASH_CD; ds.style.strokeDashoffset = (cd * 100).toFixed(1); ds.classList.toggle('cd', cd > 0);
    const gw = $('hgw' + i); gw.classList.toggle('on', (h.gd || 100) < 99.5 || !!h.blk); gw.classList.toggle('lowg', (h.gd || 0) < 30); $('hgd' + i).style.width = Math.max(0, h.gd == null ? 100 : h.gd) + '%'; $('hpw' + i).parentNode.classList.toggle('full', h.power >= 100); const ai = $('hair' + i); if(ai){ ai.style.width = Math.max(0, h.air || 0) + '%'; ai.parentNode.classList.toggle('low', (h.air || 0) < 25); }
    const it = (h.item ? BV.PICKS[h.item].icon + (BV.PICKS[h.item].melee ? h.uses : '') : h.ride > 0 ? '🛹' : h.boost > 0 ? '⭐' : '') + (h.shield > 0 ? '🛡️' + h.shield : ''); if($('hit' + i).textContent !== it) $('hit' + i).textContent = it; $('hc' + i).classList.toggle('ko', h.ko); });
  const lives = M.lives < 0 ? '∞' : M.lives, P = M.puzzle;
  const info = '❤️ ' + lives + ' · 🧸 ' + M.found + '/3 · ' + (M.mapI + 1) + '/' + M.tale.maps.length + (P && !P.done ? ' · ' + advPuzzleInfo(M, P) : '');
  if(AV.infoKey !== info){ AV.infoKey = info; $('adv-info').textContent = info; }
  const BS = (M.bosses || []).filter(b => !b.dead); $('adv-boss').classList.toggle('hidden', !BS.length);
  if(BS.length){ const all = M.bosses, hp = all.reduce((s, b) => s + Math.max(0, b.hp), 0), max = all.reduce((s, b) => s + b.maxHp, 0), nm = '😈 ' + all.map(b => b.dead ? '💫' + b.F.name : b.F.name).join(' & '); if($('adv-boss-n').textContent !== nm) $('adv-boss-n').textContent = nm; const bw = (hp / max * 100).toFixed(1) + '%'; $('adv-boss-hp').style.width = bw; $('adv-boss-gh').style.width = bw;
    const b0 = all.length === 1 ? all[0] : null, cm = b0 ? b0.clashMax : 0;   // ⚔️ marks where the boss clashes come (66% / 33%)
    $('adv-bt1').style.display = cm >= 1 ? '' : 'none'; $('adv-bt2').style.display = cm >= 2 ? '' : 'none'; if(b0){ $('adv-bt1').classList.toggle('used', b0.clashes >= 1); $('adv-bt2').classList.toggle('used', b0.clashes >= 2); } }
  advClashHud(); advHintHud();
  document.querySelectorAll('#adv-arena .tb.pwr').forEach(b => { const h = M.heroes[advHumanIdx(Number(b.closest('.actl').className.match(/p(\d)/)[1]) - 1)]; b.classList.toggle('ready', !!h && h.power >= 100); });
}

/* ---------- drawing (2.5D: x along the street, z into the screen, y up) ---------- */
// how many metres of street fit across: 11 on a wide screen, closer up on a tall phone / tablet so the heroes stay big
const ADV_OVL_VIEW = 8.5, ADV_OVL_HEAD = 1.8;   /* 🗺️ 24z-b: on a phone held sideways: metres across (bigger fighters) · metres of sky kept over the back row (fighter + name tag) */
function advViewW(){ const st = $('adv-stage'), w = (st && st.clientWidth) || innerWidth, h = (st && st.clientHeight) || innerHeight * 0.7, sp = $('scr-advplay'); const v = Math.max(6.5, Math.min(BV.VIEW, 11 * (w / Math.max(1, h)) / 1.35)); return sp && sp.classList.contains('ovl') ? Math.min(v, ADV_OVL_VIEW) : v; }
function advView(W, H){
  const s = W / AV.M.view, yB = H - Math.max(6, H * 0.035), bandH = Math.min(Math.max(H * 0.26, Math.min(H * 0.5, s * BV.ZD * (H > W ? 1 : 0.7))), AV.ovl ? Math.max(H * 0.26, yB - s * ADV_OVL_HEAD) : 1e9), yT = yB - bandH, cam = AV.M.cam;   /* 🗺️ 24z-b: AV.ovl keeps ADV_OVL_HEAD of sky */
  return {W, H, s, yT, yB, bandH, cam, gy: z => yT + z / BV.ZD * bandH, ks: z => 0.88 + 0.12 * z / BV.ZD, sx: x => (x - cam) * s + W / 2};
}
const ADV_SCENES = {
  'Swing Park': {sky: ['#7FD0FF', '#E6F7FF'], far: ['🏡', '🌳', '🏠', '🌳', '🌲', '🏡', '🌳'], mid: 'swings', floor: ['#86CF6A', '#6DBB55'], path: '#E9CF9E'},
  'Slide Street': {sky: ['#88C9FF', '#FFF2D9'], far: ['🏢', '🌳', '🏪', '🌳', '🏬', '🌲'], mid: 'slides', floor: ['#9AD27A', '#7EC064'], path: '#D9D2C5'},
  'Climbing Fort': {sky: ['#9AD7FF', '#FFE9F2'], far: ['🌲', '🌳', '⛰️', '🌲', '🌳', '🌲'], mid: 'fort', floor: ['#8FCB70', '#73B65A'], path: '#E2C08C'},
  "Brax's Clubhouse": {sky: ['#FFB27A', '#FFE7C7'], far: ['🌳', '🏚️', '🌲', '🌳'], mid: 'club', floor: ['#A7C77A', '#8DB062'], path: '#C9A57A'},
  'Sugar Gate': {sky: ['#FFB3D9', '#FFF0F8'], far: ['🏭', '🍭', '🏭', '🍬', '🧁', '🍭'], mid: 'factory', floor: ['#F7C6DF', '#EBA9CB'], path: '#FFF3FA', edge: 'rail'},
  'Pipe Works': {sky: ['#C9B8FF', '#FFF0F8'], far: ['🏭', '🏗️', '🏭', '🍬'], mid: 'pipes', floor: ['#E0D4FF', '#C9B8F0'], path: '#F4EEFF', edge: 'rail'},
  'Candy Vault': {sky: ['#FFD59E', '#FFF6E5'], far: ['🏦', '🍫', '🏦', '🍬'], mid: 'vault', floor: ['#F3D9B1', '#E3C091'], path: '#FFF1DC', edge: 'rail'},
  'Mixing Hall': {sky: ['#A6E3FF', '#F0FBFF'], far: ['🏭', '🥣', '🏭', '🧁'], mid: 'mixers', floor: ['#CFEFFF', '#A9DDF2'], path: '#F2FBFF', edge: 'rail'},
  'Twin Tower Kitchen': {sky: ['#FF9EC7', '#FFE1EE'], far: ['🏰', '🍰', '🏰', '🍩'], mid: 'kitchen', floor: ['#F5B9D2', '#E79BBC'], path: '#FFE9F2', edge: 'rail'},
  'Drawbridge': {sky: ['#8EC5FF', '#E3F1FF'], far: ['🏰', '🌲', '⛰️', '🌲', '🏰'], mid: 'walls', floor: ['#9CC48A', '#83AD72'], path: '#B8B2A6', edge: 'stone'},
  'Great Hall': {sky: ['#6B4F3A', '#8A6A50'], far: ['🖼️', '🕯️', '🛡️', '🕯️'], mid: 'hall', floor: ['#A88B6E', '#8E7258'], path: '#9B2E3A', edge: 'stone', indoor: true},
  'Dungeon': {sky: ['#3B3B4F', '#55556E'], far: ['⛓️', '🕯️', '🦇', '⛓️'], mid: 'cells', floor: ['#6F6F80', '#585868'], path: '#7C7C8C', edge: 'stone', indoor: true},
  'Bus Stop': {sky: ['#7E8CA8', '#D9C9B8'], far: ['🏢', '🌳', '🏚️', '🏢', '🚏'], mid: 'bus', floor: ['#8E9A7E', '#76836A'], path: '#8C8C8C', edge: 'rail'},
  'Radio Shack': {sky: ['#6F7FA0', '#C9B8D8'], far: ['📡', '🏢', '🏚️', '📡'], mid: 'radio', floor: ['#8F8A7E', '#79756A'], path: '#9A9A9A', edge: 'rail'},
  'Dark Alley': {sky: ['#232338', '#3A3A55'], far: ['🏚️', '🌙', '🏢', '🏚️'], mid: 'alley', floor: ['#4A4A5C', '#3A3A4A'], path: '#55556A', edge: 'stone', night: true},
  'Shelter Gate': {sky: ['#5B6B8A', '#A99AB8'], far: ['🏚️', '🌲', '🏚️', '🌲'], mid: 'shelter', floor: ['#7E8A70', '#69755C'], path: '#8E8676', edge: 'stone'},
  'Old Shelter': {sky: ['#3B2F4F', '#7A5F8A'], far: ['🌙', '🏚️', '🌲', '🏚️'], mid: 'bunker', floor: ['#6A6F5C', '#575C4A'], path: '#7A7466', edge: 'stone', night: true},
  'Town Square': {sky: ['#FF9A76', '#FFE3B8'], far: ['🏘️', '⛪', '🏘️', '🏪', '🏘️'], mid: 'town', floor: ['#C9B78E', '#B39F74'], path: '#D8C9A6', edge: 'picket'},
  'Shallow Reef': {sky: ['#4FC3F7', '#B3E5FC'], far: ['🪸', '🐠', '🪸', '🐟', '🪸'], mid: 'reef', floor: ['#F2E2B6', '#E3CC91'], path: '#F7EBCB', edge: 'none', water: 1},
  'Kelp Forest': {sky: ['#1E88E5', '#64B5F6'], far: ['🌿', '🐟', '🌿', '🐡', '🌿'], mid: 'kelp', floor: ['#D9C796', '#C4AE77'], path: '#E6D7AE', edge: 'none', water: 2},
  'Sunken Ship': {sky: ['#1565C0', '#3F7FBF'], far: ['⚓', '🐟', '🪸', '🦑'], mid: 'ship', floor: ['#BBA977', '#A39060'], path: '#C9B98C', edge: 'none', water: 3},
  'Deep Trench': {sky: ['#0B1F44', '#16356B'], far: ['🐡', '🪼', '🦑', '🪼'], mid: 'trench', floor: ['#5E6B7A', '#4A5664'], path: '#6E7B8A', edge: 'none', water: 4},
  'Mermaid Village': {sky: ['#4DD0E1', '#E0F7FA'], far: ['🐚', '🏝️', '🪸', '🐚', '🏝️'], mid: 'village', floor: ['#FFE0B2', '#FFCC80'], path: '#FFF3E0', edge: 'none', water: 0, dome: true},
  'Throne Room': {sky: ['#5A2D6E', '#8A4FA0'], far: ['🖼️', '🕯️', '👑', '🕯️'], mid: 'throne', floor: ['#B08D57', '#957446'], path: '#9B1D45', edge: 'stone', indoor: true}
};
function advDraw(){
  const cv = $('acv'); if(!cv) return; const g = cv.getContext('2d'), W = cv.width, H = cv.height; if(W < 20) return;
  const M = AV.M, V = advView(W, H), SC = ADV_SCENES[M.map.name] || ADV_SCENES['Swing Park'], t = AV.t;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if(AV.shake > 0 && FX){ g.translate((Math.random() - 0.5) * 10 * AV.shake * DPR, (Math.random() - 0.5) * 10 * AV.shake * DPR); }
  // sky + sun + clouds
  const sk = g.createLinearGradient(0, 0, 0, V.yT); sk.addColorStop(0, SC.sky[0]); sk.addColorStop(1, SC.sky[1]); g.fillStyle = sk; g.fillRect(-20, -20, W + 40, V.yT + 20);
  if(SC.water || SC.dome){ g.fillStyle = 'rgba(255,255,255,' + (0.12 - (SC.water || 0) * 0.02).toFixed(2) + ')'; for(let r = 0; r < 5; r++){ const x0 = ((r * 0.23 - M.cam * 0.01) % 1 + 1) % 1 * W; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + V.s * 0.6, 0); g.lineTo(x0 + V.s * 2.2, V.yT); g.lineTo(x0 + V.s * 1.4, V.yT); g.fill(); } }
  else if(SC.indoor){ g.fillStyle = 'rgba(0,0,0,0.12)'; for(let x = -((M.cam * V.s * 0.4) % (V.s * 1.2)); x < W; x += V.s * 1.2){ g.fillRect(x, 0, 2, V.yT); } for(let y = V.s * 0.6; y < V.yT; y += V.s * 0.6) g.fillRect(0, y, W, 2); }
  else if(SC.water || SC.dome){ }
  else if(SC.night){ g.fillStyle = '#FFF8D6'; g.beginPath(); g.arc(W * 0.86, V.yT * 0.22, V.s * 0.45, 0, 7); g.fill(); g.fillStyle = SC.sky[0]; g.beginPath(); g.arc(W * 0.86 - V.s * 0.18, V.yT * 0.22 - V.s * 0.08, V.s * 0.4, 0, 7); g.fill(); g.fillStyle = '#fff'; for(let i = 0; i < 14; i++) g.fillRect((i * 97 % 100) / 100 * W, (i * 37 % 60) / 100 * V.yT, 2, 2); }
  else { g.fillStyle = 'rgba(255,236,150,0.9)'; g.beginPath(); g.arc(W * 0.86, V.yT * 0.22, V.s * 0.55, 0, 7); g.fill(); }
  if(!SC.indoor && !SC.night && !SC.water && !SC.dome){ g.fillStyle = 'rgba(255,255,255,0.85)'; for(let i = 0; i < 4; i++){ const x = ((i * 0.31 + t * 0.008 - M.cam * 0.02) % 1.2 + 1.2) % 1.2 * (W + V.s * 3) - V.s * 1.5, y = V.yT * (0.12 + 0.12 * (i % 2)); g.beginPath(); g.ellipse(x, y, V.s * 0.9, V.s * 0.28, 0, 0, 7); g.ellipse(x + V.s * 0.5, y - V.s * 0.15, V.s * 0.5, V.s * 0.3, 0, 0, 7); g.fill(); } }
  // far row (slow)
  const farGap = V.s * 2.2, off = -(M.cam * V.s * 0.25) % farGap;
  for(let x = off - farGap, k = Math.floor(M.cam * V.s * 0.25 / farGap); x < W + farGap; x += farGap, k++) emo(g, SC.far[((k % SC.far.length) + SC.far.length) % SC.far.length], x, V.yT - V.s * 0.75, V.s * 1.3);
  // hill line
  g.fillStyle = SC.floor[1]; g.beginPath(); g.moveTo(0, V.yT); for(let x = 0; x <= W; x += 20){ g.lineTo(x, V.yT - V.s * 0.25 - Math.sin((x + M.cam * V.s * 0.5) / (V.s * 2.3)) * V.s * 0.12); } g.lineTo(W, V.yT); g.closePath(); g.fill();
  advMid(g, V, SC.mid, t);
  if(SC.water) advWater(g, V, SC, t);
  // the street band: grass with a path running along it, stripes that scroll
  const fl = g.createLinearGradient(0, V.yT, 0, V.yB); fl.addColorStop(0, SC.floor[0]); fl.addColorStop(1, SC.floor[1]); g.fillStyle = fl; g.fillRect(0, V.yT, W, H - V.yT);
  g.fillStyle = SC.path; g.fillRect(0, V.gy(BV.ZD * 0.32), W, V.gy(BV.ZD * 0.78) - V.gy(BV.ZD * 0.32));
  g.strokeStyle = 'rgba(0,0,0,0.06)'; g.lineWidth = 2; for(let x = Math.floor((M.cam - BV.VIEW) / 2) * 2; x < M.cam + AV.M.view; x += 2){ g.beginPath(); g.moveTo(V.sx(x), V.yT); g.lineTo(V.sx(x - 0.6), V.yB); g.stroke(); }
  // back edge: picket fence / factory railing / castle stone
  advEdge(g, V, SC.edge || 'picket');
  advPuzzle(g, V, t);
  // things on the floor, sorted by depth with the people
  const items = [];
  if(M.door) items.push({z: M.door.z, d: () => advDoor(g, V, t)});
  if(M.puzzle && M.puzzle.k === 'wedding' || M.ending){ const A = M.puzzle ? M.puzzle.altar : AV.altar, st = M.puzzle ? M.puzzle.stage : 'done'; if(M.puzzle) AV.altar = A;
    if(A){ const happy = st === 'choice' || st === 'done' || M.done; items.push({z: A.z - 0.01, d: () => advFighter(g, V, {i: 9200, name: AV.capName, avF: AV.capAv, x: A.x + 0.1, y: 0, z: A.z, face: -1, act: null, stun: 0, down: 0, ko: false, launched: false, land: 0, cheer: happy ? 2 - (AV.t % 2) : 0, sad: happy ? 0 : 1.5, walkT: 0, safe: 0, hitFlash: 0, vx: 0, vz: 0, vy: 0, hero: true, noTag: false, ring: '#FFC845', glove: '#FFC845'}, t)});
      if((st === 'walk' || st === 'object' || st === 'trial' || (M.ending === 'wedding')) && M.royal){ const R = {i: 9300, name: BV.FOES[M.royal].name, avF: AV.royalAv || (AV.royalAv = fightAv(foeAvatar(M.royal, 0))), x: A.x + 0.9, y: 0, z: A.z + 0.05, face: -1, act: null, stun: 0, down: 0, ko: false, launched: false, land: 0, cheer: M.ending === 'wedding' ? 2 - (AV.t % 2) : 0, sad: 0, walkT: 0, safe: 0, hitFlash: 0, vx: 0, vz: 0, vy: 0, foe: true, type: M.royal, F: BV.FOES[M.royal], big: 1, noTag: true, ring: '#26C6DA', glove: '#26C6DA', dead: 0};
        items.push({z: A.z + 0.04, d: () => { advFighter(g, V, R, t); advFoeGear(g, V, R, t); if(M.ending === 'wedding') emo(g, '💍', V.sx(A.x + 0.5), V.gy(A.z) - V.s * 2.3, V.s * 0.45); }}); } } }
  M.props.forEach(p => { if(!p.gone && p.k === 'armour'){ items.push({z: p.z, d: () => advArmour(g, V, p)}); return; } if(!p.gone) items.push({z: p.z, d: () => { const x = V.sx(p.x) + (p.hitT > 0 ? Math.sin(p.hitT * 60) * V.s * 0.06 : 0), y = V.gy(p.z), k = V.ks(p.z); g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(x, y, V.s * 0.38 * k, V.s * 0.1 * k, 0, 0, 7); g.fill(); emo(g, BV.PROPS[p.k].icon, x, y - V.s * 0.42 * k, V.s * 0.85 * k); }}); });
  M.picks.forEach(p => items.push({z: p.z, d: () => { const x = V.sx(p.x), y = V.gy(p.z), k = V.ks(p.z), P = BV.PICKS[p.k], bob = Math.sin(p.t * 4 + p.i) * 0.08, pop = p.pop > 0 ? p.pop * 2.2 : 0;
    g.fillStyle = 'rgba(0,0,0,0.15)'; g.beginPath(); g.ellipse(x, y, V.s * 0.22 * k, V.s * 0.06 * k, 0, 0, 7); g.fill();
    if(P.weapon || P.secret || p.k === 'clue'){ g.fillStyle = 'rgba(255,230,120,' + (0.25 + 0.2 * Math.sin(p.t * 5)).toFixed(2) + ')'; g.beginPath(); g.arc(x, y - V.s * (0.35 + bob + pop), V.s * 0.34 * k, 0, 7); g.fill(); }
    emo(g, P.icon, x, y - V.s * (0.35 + bob + pop) * k, V.s * 0.5 * k); }}));
  M.heroes.forEach(h => items.push({z: h.z, d: () => { advBody(g, V, h, t); advExtras(g, V, h, t); }}));
  M.foes.forEach(f => items.push({z: f.z, d: () => { advBody(g, V, f, t); advExtras(g, V, f, t); }}));
  M.shots.forEach(s => items.push({z: s.z, d: () => { const x = V.sx(s.x), y = V.gy(s.z), k = V.ks(s.z);
    if(s.kind === 'arrow'){ const yy = y - s.y * V.s * k, d = Math.sign(s.vx); g.strokeStyle = '#5D4037'; g.lineWidth = Math.max(2, V.s * 0.04); g.beginPath(); g.moveTo(x - d * V.s * 0.35, yy); g.lineTo(x + d * V.s * 0.3, yy); g.stroke(); g.fillStyle = '#90A4AE'; g.beginPath(); g.moveTo(x + d * V.s * 0.4, yy); g.lineTo(x + d * V.s * 0.26, yy - V.s * 0.07); g.lineTo(x + d * V.s * 0.26, yy + V.s * 0.07); g.fill(); g.fillStyle = '#E53935'; g.fillRect(x - d * V.s * 0.38, yy - V.s * 0.05, d * V.s * 0.1, V.s * 0.1); return; } g.fillStyle = 'rgba(0,0,0,0.14)'; g.beginPath(); g.ellipse(x, y, V.s * 0.16, V.s * 0.05, 0, 0, 7); g.fill(); g.save(); g.translate(x, y - s.y * V.s * k); g.rotate(s.kind === 'roll' || s.kind === 'back' ? s.t * 14 * Math.sign(s.vx) : 0); emo(g, s.k, 0, 0, V.s * 0.45 * k); g.restore(); }}));
  if(M.cage) items.push({z: M.cage.z, d: () => advCage(g, V, t)});
  items.sort((a, b) => a.z - b.z).forEach(it => it.d());
  // ground-pound rings
  M.waves.forEach(w => { g.strokeStyle = 'rgba(255,140,40,' + (0.9 - w.r / w.max * 0.7).toFixed(2) + ')'; g.lineWidth = V.s * 0.12; g.beginPath(); g.ellipse(V.sx(w.x), V.gy(w.z), w.r * V.s, w.r * V.s * (V.bandH / (BV.ZD * V.s)) / 1.6, 0, 0, 7); g.stroke(); });
  advHintArrow(g, V, t);
  advDrawFx(g, V);
  if(SC.water){ g.fillStyle = 'rgba(0,40,90,' + (0.05 * SC.water).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
  // ➡️ go arrow
  if(!M.lock && M.zones[M.zoneI] && Math.sin(t * 6) > -0.2 && aliveLead(M) < M.zones[M.zoneI].x - 5){ g.font = '900 ' + Math.round(V.s * 0.5) + 'px Fredoka, sans-serif'; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 5; g.textAlign = 'right'; g.textBaseline = 'middle'; g.strokeText('GO ➜', W - V.s * 0.3, V.yT - V.s * 1.4); g.fillText('GO ➜', W - V.s * 0.3, V.yT - V.s * 1.4); }
  if(M.exitOpen && !M.map.boss){ const x = V.sx(M.len - 0.8); if(x < W + 40){ emo(g, '🚩', x, V.yT - V.s * 0.5, V.s * 1.0); } }
  if(AV.trans > 0){ g.fillStyle = 'rgba(20,8,40,' + Math.max(0, 1 - AV.trans / 1.4).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
}
function advEdge(g, V, kind){
  if(kind === 'none') return;
  const M = AV.M, x0 = Math.floor(M.cam - M.view / 2 - 1), x1 = M.cam + M.view / 2 + 1;
  if(kind === 'rail'){ g.strokeStyle = '#B57BA6'; g.lineWidth = V.s * 0.05; g.beginPath(); g.moveTo(0, V.yT - V.s * 0.45); g.lineTo(V.W, V.yT - V.s * 0.45); g.moveTo(0, V.yT - V.s * 0.22); g.lineTo(V.W, V.yT - V.s * 0.22); g.stroke();
    for(let x = x0; x < x1; x += 1){ const px = V.sx(x); g.beginPath(); g.moveTo(px, V.yT); g.lineTo(px, V.yT - V.s * 0.5); g.stroke(); } return; }
  if(kind === 'stone'){ g.fillStyle = '#8D8A85'; g.fillRect(0, V.yT - V.s * 0.5, V.W, V.s * 0.5); g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 2;
    for(let x = x0; x < x1; x += 0.6){ const px = V.sx(x); g.strokeRect(px, V.yT - V.s * 0.5, V.s * 0.6, V.s * 0.25); g.strokeRect(px + V.s * 0.3, V.yT - V.s * 0.25, V.s * 0.6, V.s * 0.25); } return; }
  g.fillStyle = '#FFF8EC'; g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 1;
  for(let x = x0; x < x1; x += 0.5){ const px = V.sx(x); g.beginPath(); g.moveTo(px - V.s * 0.08, V.yT); g.lineTo(px - V.s * 0.08, V.yT - V.s * 0.42); g.lineTo(px, V.yT - V.s * 0.52); g.lineTo(px + V.s * 0.08, V.yT - V.s * 0.42); g.lineTo(px + V.s * 0.08, V.yT); g.fill(); g.stroke(); }
  g.fillRect(0, V.yT - V.s * 0.32, V.W, V.s * 0.06);
}
function advWater(g, V, SC, t){
  const M = AV.M; g.fillStyle = 'rgba(255,255,255,0.55)';
  for(let i = 0; i < 18; i++){ const x = ((i * 0.137 + 0.05) % 1) * V.W, y = V.H - ((t * (20 + (i % 5) * 9) + i * 53) % (V.H + 40)); g.beginPath(); g.arc(x + Math.sin(t * 2 + i) * 6, y, 2 + (i % 3), 0, 7); g.fill(); }
  (M.map.vents || []).forEach(x => { const px = V.sx(x); if(px < -40 || px > V.W + 40) return; g.fillStyle = 'rgba(80,60,40,0.5)'; g.beginPath(); g.ellipse(px, V.gy(BV.ZD * 0.5), V.s * 0.5, V.s * 0.14, 0, 0, 7); g.fill();
    for(let b = 0; b < 7; b++){ const y = V.gy(BV.ZD * 0.5) - ((t * 1.6 + b * 0.37) % 2.6) * V.s; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 2; g.beginPath(); g.arc(px + Math.sin(t * 4 + b) * V.s * 0.15, y, V.s * (0.05 + (b % 3) * 0.03), 0, 7); g.stroke(); } emo(g, '🫧', px, V.yT - V.s * 0.4, V.s * 0.35); });
}
function aliveLead(M){ let x = -1e9; M.heroes.forEach(h => { if(!h.ko && h.x > x) x = h.x; }); return x; }
function advMid(g, V, kind, t){   // the playground things behind the fence (parallax 0.7)
  const par = 0.7, gap = 6, base = V.yT - V.s * 0.1, k = V.s;
  for(let i = Math.floor((AV.M.cam * par - BV.VIEW) / gap) - 1; i < Math.floor((AV.M.cam * par + BV.VIEW) / gap) + 2; i++){
    const x = (i * gap - AV.M.cam * par) * V.s + V.W / 2;
    g.save(); g.translate(x, base); g.lineWidth = k * 0.09; g.lineCap = 'round';
    if(kind === 'swings'){ g.strokeStyle = '#C0392B'; g.beginPath(); g.moveTo(-k * 1.2, 0); g.lineTo(-k * 0.9, -k * 1.9); g.lineTo(-k * 0.6, 0); g.moveTo(k * 0.6, 0); g.lineTo(k * 0.9, -k * 1.9); g.lineTo(k * 1.2, 0); g.moveTo(-k * 0.9, -k * 1.9); g.lineTo(k * 0.9, -k * 1.9); g.stroke();
      [-0.4, 0.4].forEach((sx, j) => { const sw = Math.sin(t * 2 + i + j) * 0.25; g.strokeStyle = '#7F8C8D'; g.lineWidth = k * 0.03; g.beginPath(); g.moveTo(sx * k, -k * 1.9); g.lineTo(sx * k + Math.sin(sw) * k * 1.2, -k * 1.9 + Math.cos(sw) * k * 1.4); g.stroke(); g.fillStyle = j ? '#FFC845' : '#3D8BFD'; g.fillRect(sx * k + Math.sin(sw) * k * 1.2 - k * 0.18, -k * 1.9 + Math.cos(sw) * k * 1.4, k * 0.36, k * 0.08); }); }
    else if(kind === 'slides'){ g.strokeStyle = '#7A5CFA'; g.beginPath(); g.moveTo(-k * 0.8, 0); g.lineTo(-k * 0.8, -k * 1.7); g.moveTo(-k * 0.4, 0); g.lineTo(-k * 0.4, -k * 1.7); g.stroke(); g.lineWidth = k * 0.04; for(let r = 0.3; r < 1.7; r += 0.3){ g.beginPath(); g.moveTo(-k * 0.8, -k * r); g.lineTo(-k * 0.4, -k * r); g.stroke(); }
      g.fillStyle = '#FF9F1C'; g.beginPath(); g.moveTo(-k * 0.4, -k * 1.7); g.quadraticCurveTo(k * 0.4, -k * 1.4, k * 1.2, -k * 0.1); g.lineTo(k * 1.2, k * 0.05); g.quadraticCurveTo(k * 0.3, -k * 1.2, -k * 0.4, -k * 1.5); g.closePath(); g.fill(); g.fillStyle = '#FF4D6D'; g.fillRect(-k * 0.9, -k * 1.8, k * 0.6, k * 0.12); }
    else if(kind === 'fort'){ g.fillStyle = '#C68B59'; g.fillRect(-k * 1, -k * 1.6, k * 2, k * 1.6); g.fillStyle = '#A0693D'; for(let b = -1; b < 1; b += 0.4) g.fillRect(b * k, -k * 1.85, k * 0.25, k * 0.28); g.fillStyle = '#5D3A1A'; g.fillRect(-k * 0.25, -k * 0.8, k * 0.5, k * 0.8); g.strokeStyle = '#FF4D6D'; g.lineWidth = k * 0.03; g.beginPath(); g.moveTo(k * 0.7, -k * 1.85); g.lineTo(k * 0.7, -k * 2.5); g.stroke(); g.fillStyle = '#FF4D6D'; g.beginPath(); g.moveTo(k * 0.7, -k * 2.5); g.lineTo(k * 1.1, -k * 2.35); g.lineTo(k * 0.7, -k * 2.2); g.fill(); }
    else if(kind === 'factory' || kind === 'mixers'){ g.fillStyle = kind === 'factory' ? '#E58BB8' : '#7FC8E8'; rrect(g, -k * 1.2, -k * 1.9, k * 2.4, k * 1.9, k * 0.2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.arc(0, -k * 2.0, k * 0.7, Math.PI, 0); g.fill();
      for(let b = 0; b < 6; b++){ g.fillStyle = ['#FF4D6D', '#3DDC84', '#3D8BFD', '#FFC845'][b % 4]; g.beginPath(); g.arc(-k * 0.4 + (b % 3) * k * 0.4, -k * 2.15 + Math.floor(b / 3) * k * 0.25, k * 0.11, 0, 7); g.fill(); }
      g.fillStyle = '#fff'; g.font = '900 ' + Math.round(k * 0.22) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(kind === 'factory' ? 'SWEETS' : 'MIX', 0, -k * 1.0);
      g.strokeStyle = '#B57BA6'; g.lineWidth = k * 0.12; g.beginPath(); g.moveTo(k * 1.2, -k * 1.4); g.lineTo(k * 2.4, -k * 1.4); g.lineTo(k * 2.4, -k * 2.6); g.stroke(); emo(g, '💨', k * 2.4, -k * 2.9 - Math.sin(t * 2 + i) * k * 0.1, k * 0.4); }
    else if(kind === 'pipes'){ ['#FF4D6D', '#3DDC84', '#3D8BFD'].forEach((c, j) => { g.strokeStyle = c; g.lineWidth = k * 0.16; g.beginPath(); g.moveTo(-k * 3, -k * (0.6 + j * 0.55)); g.lineTo(k * 3, -k * (0.6 + j * 0.55)); g.stroke(); g.fillStyle = '#6D5A8C'; g.fillRect(-k * 0.15 + j * k * 0.8, -k * (0.72 + j * 0.55), k * 0.3, k * 0.24); }); }
    else if(kind === 'vault'){ g.fillStyle = '#C8A26B'; g.fillRect(-k * 2.2, -k * 2.2, k * 4.4, k * 0.12); g.fillRect(-k * 2.2, -k * 1.4, k * 4.4, k * 0.12); g.fillStyle = '#9C7A4A'; g.fillRect(-k * 2.2, -k * 2.3, k * 0.12, k * 2.3); g.fillRect(k * 2.08, -k * 2.3, k * 0.12, k * 2.3); }
    else if(kind === 'kitchen'){ g.fillStyle = '#B0BEC5'; rrect(g, -k * 1.4, -k * 1.2, k * 2.8, k * 1.2, k * 0.1); g.fill(); g.fillStyle = '#455A64'; [-0.7, 0.7].forEach(b => { g.beginPath(); g.arc(b * k, -k * 1.2, k * 0.3, Math.PI, 0); g.fill(); });
      g.fillStyle = '#78909C'; g.beginPath(); g.ellipse(-k * 0.7, -k * 1.55, k * 0.5, k * 0.3, 0, 0, 7); g.fill(); emo(g, '♨️', -k * 0.7, -k * 2.1 - Math.sin(t * 3 + i) * k * 0.1, k * 0.45); emo(g, '🍰', k * 0.7, -k * 1.6, k * 0.6); }
    else if(kind === 'walls'){ g.fillStyle = '#A9A39A'; g.fillRect(-k * 3, -k * 1.4, k * 6, k * 1.4); for(let b = -3; b < 3; b += 0.6) g.fillRect(b * k, -k * 1.65, k * 0.35, k * 0.3); g.fillStyle = '#958F86'; g.fillRect(-k * 0.6, -k * 2.6, k * 1.2, k * 2.6); for(let b = -0.6; b < 0.6; b += 0.4) g.fillRect(b * k, -k * 2.85, k * 0.25, k * 0.3); g.fillStyle = '#3E2C1C'; g.beginPath(); g.arc(0, -k * 1.7, k * 0.18, Math.PI, 0); g.fill(); }
    else if(kind === 'hall'){ g.fillStyle = '#5E4636'; g.fillRect(-k * 0.25, -k * 3, k * 0.5, k * 3); g.fillStyle = ['#C62828', '#1565C0', '#2E7D32'][((i % 3) + 3) % 3]; g.beginPath(); g.moveTo(k * 0.8, -k * 2.8); g.lineTo(k * 1.8, -k * 2.8); g.lineTo(k * 1.8, -k * 1.2); g.lineTo(k * 1.3, -k * 1.5); g.lineTo(k * 0.8, -k * 1.2); g.closePath(); g.fill(); emo(g, ['🦁', '🐉', '🦅'][((i % 3) + 3) % 3], k * 1.3, -k * 2.2, k * 0.5); }
    else if(kind === 'cells'){ g.fillStyle = '#2C2C3A'; g.fillRect(-k * 0.8, -k * 2.2, k * 1.6, k * 1.0); g.strokeStyle = '#90A4AE'; g.lineWidth = k * 0.05; for(let b = -0.6; b <= 0.6; b += 0.3){ g.beginPath(); g.moveTo(b * k, -k * 2.2); g.lineTo(b * k, -k * 1.2); g.stroke(); } emo(g, '⛓️', k * 1.6, -k * 1.8, k * 0.5); }
    else if(kind === 'bus' || kind === 'shelter'){ g.fillStyle = kind === 'bus' ? '#9E9E9E' : '#7D7465'; g.fillRect(-k * 2, -k * 1.6, k * 4, k * 1.6); g.fillStyle = '#5D5D5D'; for(let w = -1.6; w < 1.8; w += 0.8) g.fillRect(w * k, -k * 1.3, k * 0.5, k * 0.5); emo(g, kind === 'bus' ? '🧟' : '🪧', k * 1.5, -k * 1.9, k * 0.5); }
    else if(kind === 'radio'){ g.fillStyle = '#6D6875'; g.fillRect(-k * 1.2, -k * 1.4, k * 2.4, k * 1.4); g.strokeStyle = '#B0BEC5'; g.lineWidth = k * 0.05; g.beginPath(); g.moveTo(0, -k * 1.4); g.lineTo(0, -k * 3); g.moveTo(-k * 0.4, -k * 2.4); g.lineTo(k * 0.4, -k * 2.4); g.stroke(); emo(g, '📡', k * 0.9, -k * 1.7, k * 0.5); }
    else if(kind === 'alley'){ g.fillStyle = '#2B2B3A'; g.fillRect(-k * 2, -k * 2.4, k * 1.5, k * 2.4); g.fillRect(k * 0.6, -k * 2, k * 1.6, k * 2); g.fillStyle = 'rgba(255,220,120,0.6)'; g.fillRect(-k * 1.6, -k * 2, k * 0.3, k * 0.3); g.fillRect(k * 1.2, -k * 1.6, k * 0.3, k * 0.3); }
    else if(kind === 'bunker'){ g.fillStyle = '#5B5F4E'; g.beginPath(); g.arc(0, 0, k * 1.8, Math.PI, 0); g.fill(); g.fillStyle = '#3B3F30'; g.fillRect(-k * 0.5, -k * 1.1, k * 1.0, k * 1.1); emo(g, '☢️', 0, -k * 1.4, k * 0.4); }
    else if(kind === 'town'){ g.fillStyle = ['#E57373', '#64B5F6', '#81C784'][((i % 3) + 3) % 3]; g.fillRect(-k * 1.2, -k * 1.7, k * 2.4, k * 1.7); g.fillStyle = '#6D4C41'; g.beginPath(); g.moveTo(-k * 1.4, -k * 1.7); g.lineTo(0, -k * 2.5); g.lineTo(k * 1.4, -k * 1.7); g.fill(); g.fillStyle = '#FFF8E1'; g.fillRect(-k * 0.8, -k * 1.3, k * 0.5, k * 0.45); g.fillRect(k * 0.3, -k * 1.3, k * 0.5, k * 0.45); }
    else if(kind === 'reef'){ ['#FF7043', '#EC407A', '#AB47BC'].forEach((cl, j) => { g.fillStyle = cl; for(let b = 0; b < 4; b++){ g.beginPath(); g.ellipse((-1.4 + j * 1.4) * k + Math.sin(b) * k * 0.2, -k * (0.3 + b * 0.35), k * 0.18, k * 0.4, Math.sin(t + b + j) * 0.2, 0, 7); g.fill(); } }); }
    else if(kind === 'kelp'){ g.strokeStyle = '#2E7D32'; g.lineWidth = k * 0.16; for(let s = -2; s <= 2; s++){ g.beginPath(); g.moveTo(s * k, 0); for(let y = 0; y < 3.2; y += 0.4) g.lineTo(s * k + Math.sin(t * 1.5 + y + s + i) * k * 0.25, -y * k); g.stroke(); } }
    else if(kind === 'ship'){ g.fillStyle = '#5D4037'; g.beginPath(); g.moveTo(-k * 2.6, -k * 0.2); g.lineTo(k * 2.2, -k * 0.6); g.lineTo(k * 1.8, k * 0.1); g.lineTo(-k * 2.2, k * 0.1); g.fill(); g.fillStyle = '#4E342E'; g.save(); g.rotate(-0.35); g.fillRect(-k * 0.1, -k * 3, k * 0.2, k * 2.8); g.restore(); emo(g, '🏴‍☠️', -k * 1.0, -k * 2.7, k * 0.5); }
    else if(kind === 'trench'){ g.fillStyle = '#0D2A52'; g.beginPath(); g.moveTo(-k * 3, 0); g.lineTo(-k * 2, -k * 2.4); g.lineTo(-k * 0.6, -k * 1.2); g.lineTo(k * 0.6, -k * 2.8); g.lineTo(k * 2.2, -k * 1.0); g.lineTo(k * 3, 0); g.fill(); g.fillStyle = 'rgba(110,231,249,' + (0.4 + 0.3 * Math.sin(t * 3 + i)).toFixed(2) + ')'; g.beginPath(); g.arc(k * 0.6, -k * 2.0, k * 0.08, 0, 7); g.fill(); }
    else if(kind === 'village'){ g.fillStyle = ['#F8BBD0', '#B2EBF2', '#FFE082'][((i % 3) + 3) % 3]; g.beginPath(); g.arc(0, 0, k * 1.5, Math.PI, 0); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(-k * 0.5, -k * 0.9, k * 0.3, 0, 7); g.fill(); emo(g, '🐚', 0, -k * 1.7, k * 0.5); }
    else if(kind === 'throne'){ g.fillStyle = '#7B1F3A'; g.fillRect(-k * 0.7, -k * 2.6, k * 1.4, k * 2.6); g.fillStyle = '#FFC845'; g.fillRect(-k * 0.9, -k * 1.0, k * 1.8, k * 0.25); emo(g, '👑', 0, -k * 2.8, k * 0.6); }
    else { g.fillStyle = '#8D6E63'; g.fillRect(-k * 1.3, -k * 1.5, k * 2.6, k * 1.5); g.fillStyle = '#6D4C41'; g.beginPath(); g.moveTo(-k * 1.5, -k * 1.5); g.lineTo(0, -k * 2.3); g.lineTo(k * 1.5, -k * 1.5); g.fill(); g.fillStyle = '#FFF3E0'; g.fillRect(-k * 0.8, -k * 1.25, k * 1.6, k * 0.38); g.fillStyle = '#B71C1C'; g.font = '900 ' + Math.round(k * 0.24) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BRAX HQ', 0, -k * 1.06); }
    g.restore();
  }
}
function advPuzzle(g, V, t){
  const P = AV.M.puzzle; if(!P) return; const M = AV.M;
  if(P.k === 'steps' || P.k === 'dark'){
    const rh = BV.ZD / P.rows, x0 = V.sx(P.x0), x1 = V.sx(P.x0 + P.cols * P.cw);
    g.fillStyle = P.dark ? '#5E4B6E' : '#F3DDA3'; g.beginPath(); g.moveTo(x0, V.yT); g.lineTo(x1, V.yT); g.lineTo(x1, V.yB); g.lineTo(x0, V.yB); g.fill();
    g.strokeStyle = 'rgba(160,120,60,0.45)'; g.lineWidth = 2;
    for(let c = 0; c <= P.cols; c++){ const x = V.sx(P.x0 + c * P.cw); g.beginPath(); g.moveTo(x, V.yT); g.lineTo(x, V.yB); g.stroke(); }
    for(let r = 0; r <= P.rows; r++){ const y = V.gy(r * rh); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
    for(let c = 0; c < P.cols; c++){ const seen = !P.dark && (P.show > 0 || c <= P.prog || P.done); if(!seen) continue; const r = P.path[c], x = V.sx(P.x0 + (c + 0.5) * P.cw), y = V.gy((r + 0.5) * rh);
      if(c <= P.prog){ g.fillStyle = 'rgba(124,242,156,0.45)'; g.fillRect(V.sx(P.x0 + c * P.cw) + 2, V.gy(r * rh) + 2, P.cw * V.s - 4, V.gy((r + 1) * rh) - V.gy(r * rh) - 4); }
      g.globalAlpha = c <= P.prog ? 1 : Math.min(1, P.show); emo(g, '👣', x, y, V.s * 0.42); g.globalAlpha = 1; }
    if(P.mud > 0){ g.fillStyle = 'rgba(110,70,30,' + (P.mud * 0.5).toFixed(2) + ')'; g.fillRect(x0, V.yT, x1 - x0, V.yB - V.yT); }
    advGate(g, V, P.gate, P.done, '🔒');
  }
  if(P.k === 'bells'){
    const lit = BV.bellShowing(P);
    P.bells.forEach((b, k) => { const x = V.sx(b.x), y = V.gy(b.z), kk2 = V.ks(b.z), ring = P.ring[k] > 0 || lit === k;
      g.strokeStyle = '#6D4C41'; g.lineWidth = V.s * 0.08; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - V.s * 1.5 * kk2); g.lineTo(x + V.s * 0.3, y - V.s * 1.5 * kk2); g.stroke();
      if(ring){ g.fillStyle = 'rgba(255,220,90,0.55)'; g.beginPath(); g.arc(x + V.s * 0.3, y - V.s * 1.2 * kk2, V.s * 0.45, 0, 7); g.fill(); }
      g.save(); g.translate(x + V.s * 0.3, y - V.s * 1.2 * kk2); g.rotate(ring ? Math.sin(t * 30) * 0.35 : 0); emo(g, '🔔', 0, 0, V.s * 0.6 * kk2); g.restore();
      g.font = '900 ' + Math.round(V.s * 0.28) + 'px Fredoka, sans-serif'; g.fillStyle = ['#FF4D6D', '#3D8BFD', '#18B8A6'][k]; g.textAlign = 'center'; g.fillText(['A', 'B', 'C'][k], x, y - V.s * 1.7 * kk2); });
    // progress dots
    for(let i = 0; i < P.seq.length; i++){ g.fillStyle = i < P.pos ? '#FFC845' : 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(V.sx(P.x) + (i - (P.seq.length - 1) / 2) * V.s * 0.35, V.yT - V.s * 2.0, V.s * 0.1, 0, 7); g.fill(); }
    advGate(g, V, P.gate, P.done, '🔔');
  }
  if(P.k === 'clues'){ advGate(g, V, P.gate, P.done, '🔍'); }
  const lbl = (txt, x, y, px, col) => { g.font = '900 ' + Math.round(px) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.45)'; g.fillStyle = col || '#fff'; g.strokeText(txt, x, y); g.fillText(txt, x, y); };
  const dots = (n, of, x, y) => { for(let i = 0; i < of; i++){ g.fillStyle = i < n ? '#FFC845' : 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(x + (i - (of - 1) / 2) * V.s * 0.32, y, V.s * 0.09, 0, 7); g.fill(); } };
  if(P.k === 'sort'){   // 🎨 belt at the back + 3 coloured bins at the front
    const B = P.belt, y = V.gy(B.z); g.fillStyle = '#5D4E6D'; g.fillRect(V.sx(B.x0), y - V.s * 0.32, (B.x1 - B.x0) * V.s, V.s * 0.3);
    g.fillStyle = 'rgba(255,255,255,0.25)'; for(let x = B.x0 + ((AV.t * 0.9) % 0.5); x < B.x1; x += 0.5) g.fillRect(V.sx(x), y - V.s * 0.3, 2, V.s * 0.26);
    P.candies.forEach(c => advCandy(g, V.sx(c.x), y - V.s * 0.45, V.s * 0.2, c.c, AV.t));
    P.bins.forEach(b => { const x = V.sx(b.x), yy = V.gy(b.z), w = V.s * 0.75; g.fillStyle = ADV_CANDY[b.c]; rrect(g, x - w / 2, yy - V.s * 0.8, w, V.s * 0.8, V.s * 0.1); g.fill(); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - w / 2, yy - V.s * 0.8, w, V.s * 0.1); advCandy(g, x, yy - V.s * 0.45, V.s * 0.16, b.c, 0); });
    dots(P.got, P.need, V.sx(P.x), V.yT - V.s * 1.9); advGate(g, V, P.gate, P.done, '🍬');
  }
  if(P.k === 'pipes'){   // 🔧 valves: arrow up = open
    const yp = V.yT - V.s * 0.9; g.strokeStyle = P.done ? '#3DDC84' : '#8E7CC3'; g.lineWidth = V.s * 0.18; g.beginPath(); g.moveTo(V.sx(P.valves[0].x - 1), yp); g.lineTo(V.sx(P.valves[3].x + 1.4), yp); g.stroke();
    P.valves.forEach((v, k) => { const x = V.sx(v.x), y = V.gy(v.z) - V.s * 0.7, ok = v.r === 0, sc = 1 + (v.ring > 0 ? 0.12 : 0);
      g.strokeStyle = '#6D5A8C'; g.lineWidth = V.s * 0.07; g.beginPath(); g.moveTo(x, V.gy(v.z)); g.lineTo(x, y); g.lineTo(x, yp); g.stroke();
      g.fillStyle = ok ? '#3DDC84' : '#FF6B6B'; g.beginPath(); g.arc(x, y, V.s * 0.32 * sc, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
      g.save(); g.translate(x, y); g.rotate(v.r * Math.PI / 2); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -V.s * 0.24); g.lineTo(V.s * 0.13, -V.s * 0.04); g.lineTo(-V.s * 0.13, -V.s * 0.04); g.fill(); g.fillRect(-V.s * 0.04, -V.s * 0.06, V.s * 0.08, V.s * 0.22); g.restore();
      if(P.link && k < 3) lbl('🔗', V.sx(v.x + 0.8), y - V.s * 0.1, V.s * 0.22); });
    advGate(g, V, P.gate, P.done, '🔧');
  }
  if(P.k === 'code'){   // 🔢 sweets to count on the wall + 3 dials
    P.spots.forEach(s => emo(g, s.icon, V.sx(s.x), V.yT - s.y * V.s, V.s * 0.34));
    P.dials.forEach((d, k) => { const x = V.sx(d.x), y = V.gy(d.z) - V.s * 0.55, r = V.s * 0.36 * (d.ring > 0 ? 1.1 : 1);
      g.fillStyle = '#5D4037'; g.fillRect(x - V.s * 0.05, y, V.s * 0.1, V.s * 0.55); g.fillStyle = '#FFF3E0'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = '#8D6E63'; g.lineWidth = 4; g.stroke();
      lbl(String(d.v), x, y + 1, V.s * 0.36, '#3E2723'); emo(g, P.icons[k], x, y - r - V.s * 0.22, V.s * 0.3); });
    advGate(g, V, P.gate, P.done, '🔒');
  }
  if(P.k === 'crank'){   // ⚙️ wheel + the drawbridge coming down
    const w = P.wheel, x = V.sx(w.x), y = V.gy(w.z) - V.s * 0.6, gx = V.sx(P.gate + 0.4), ang = (1 - P.prog / 100) * Math.PI / 2 * 0.95;
    g.fillStyle = '#5D4037'; g.fillRect(x - V.s * 0.06, y, V.s * 0.12, V.s * 0.6);
    g.save(); g.translate(x, y); g.rotate(P.prog * 0.2); g.strokeStyle = '#8D6E63'; g.lineWidth = V.s * 0.08; g.beginPath(); g.arc(0, 0, V.s * 0.35, 0, 7); g.stroke(); for(let s = 0; s < 4; s++){ g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(-V.s * 0.35, 0); g.lineTo(V.s * 0.35, 0); g.stroke(); } g.restore();
    g.save(); g.translate(gx, V.gy(BV.ZD * 0.5)); g.rotate(-ang); g.fillStyle = '#8D6E63'; g.fillRect(0, -V.s * 0.1, V.s * 2.0, V.s * 0.2); g.strokeStyle = 'rgba(0,0,0,0.3)'; for(let b = 0.3; b < 2; b += 0.3){ g.beginPath(); g.moveTo(b * V.s, -V.s * 0.1); g.lineTo(b * V.s, V.s * 0.1); g.stroke(); } g.restore();
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x - V.s * 0.6, y - V.s * 0.75, V.s * 1.2, V.s * 0.14); g.fillStyle = '#FFC845'; g.fillRect(x - V.s * 0.6, y - V.s * 0.75, V.s * 1.2 * P.prog / 100, V.s * 0.14);
  }
  if(P.k === 'levers' || P.k === 'torches'){
    const lit = BV.orderShowing(P);
    P.bells.forEach((b, k) => { const x = V.sx(b.x), y = V.gy(b.z), on = P.lit[k], flash = lit === k || P.ring[k] > 0;
      if(P.k === 'levers'){ g.fillStyle = '#5D4037'; g.fillRect(x - V.s * 0.25, y - V.s * 0.25, V.s * 0.5, V.s * 0.25); g.save(); g.translate(x, y - V.s * 0.25); g.rotate(on ? 0.7 : -0.7); g.strokeStyle = '#B0BEC5'; g.lineWidth = V.s * 0.08; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -V.s * 0.7); g.stroke(); g.fillStyle = '#E53935'; g.beginPath(); g.arc(0, -V.s * 0.7, V.s * 0.12, 0, 7); g.fill(); g.restore();
        g.fillStyle = flash ? '#FFE38A' : on ? '#7CF29C' : '#555'; g.beginPath(); g.arc(x, y - V.s * 1.35, V.s * 0.16, 0, 7); g.fill(); if(flash){ g.fillStyle = 'rgba(255,227,138,0.4)'; g.beginPath(); g.arc(x, y - V.s * 1.35, V.s * 0.35, 0, 7); g.fill(); } lbl(String(k + 1), x, y - V.s * 1.7, V.s * 0.24); }
      else { g.fillStyle = '#6D4C41'; g.fillRect(x - V.s * 0.05, y - V.s * 1.3, V.s * 0.1, V.s * 1.3); g.fillStyle = '#4E342E'; g.beginPath(); g.moveTo(x - V.s * 0.22, y - V.s * 1.3); g.lineTo(x + V.s * 0.22, y - V.s * 1.3); g.lineTo(x + V.s * 0.12, y - V.s * 1.1); g.lineTo(x - V.s * 0.12, y - V.s * 1.1); g.fill();
        if(on) emo(g, '🔥', x, y - V.s * 1.55 + Math.sin(AV.t * 9 + k) * 2, V.s * 0.5); else if(flash) emo(g, '💨', x, y - V.s * 1.5, V.s * 0.35);
        g.fillStyle = '#FFF3E0'; rrect(g, x - V.s * 0.22, y - V.s * 0.75, V.s * 0.44, V.s * 0.4, V.s * 0.06); g.fill(); emo(g, P.signs[k], x, y - V.s * 0.55, V.s * 0.3); } });
    if(P.k === 'torches'){ const bx = V.sx(P.x), by = V.yT - V.s * 2.0, w = V.s * 3.0; g.fillStyle = '#7B1F3A'; rrect(g, bx - w / 2, by - V.s * 0.35, w, V.s * 0.7, V.s * 0.1); g.fill(); g.strokeStyle = '#FFC845'; g.lineWidth = 3; g.stroke();
      P.seq.forEach((k, j) => { const x = bx + (j - 1.5) * V.s * 0.7; if(j < P.pos){ g.fillStyle = 'rgba(124,242,156,0.45)'; g.beginPath(); g.arc(x, by, V.s * 0.27, 0, 7); g.fill(); } emo(g, P.signs[k], x, by, V.s * 0.36); if(j < 3) lbl('›', x + V.s * 0.35, by, V.s * 0.3); }); }
    else dots(P.pos, P.seq.length, V.sx(P.x), V.yT - V.s * 2.0);
    advGate(g, V, P.gate, P.done, P.k === 'levers' ? '🕹️' : '🔥');
  }
  if(AV.M.machine && !AV.M.machine.kind){ const Mc = AV.M.machine; if(Mc){ const x = V.sx(Mc.x) + (Mc.hitT > 0 ? Math.sin(Mc.hitT * 80) * 4 : 0), y = V.gy(Mc.z);
    g.fillStyle = '#E58BB8'; rrect(g, x - V.s * 0.7, y - V.s * 1.6, V.s * 1.4, V.s * 1.6, V.s * 0.15); g.fill(); g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(x, y - V.s * 1.65, V.s * 0.5, Math.PI, 0); g.fill();
    for(let b = 0; b < 5; b++){ g.fillStyle = ADV_CANDY[b % 3]; g.beginPath(); g.arc(x - V.s * 0.3 + (b % 3) * V.s * 0.3, y - V.s * 1.8 + Math.floor(b / 3) * V.s * 0.2, V.s * 0.09, 0, 7); g.fill(); }
    emo(g, '🍬', x, y - V.s * 0.8, V.s * 0.5); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x - V.s * 0.7, y - V.s * 2.4, V.s * 1.4, V.s * 0.16); g.fillStyle = Mc.hp > 50 ? '#7CF29C' : Mc.hp > 25 ? '#FFC845' : '#FF4D6D'; g.fillRect(x - V.s * 0.7, y - V.s * 2.4, V.s * 1.4 * Math.max(0, Mc.hp) / Mc.max, V.s * 0.16); } }
  if(P.k === 'armour' && AV.M.door) advGate(g, V, P.gate, P.done, '🗝️');
  if(P.k === 'fuel'){ const b = P.bus, x = V.sx(b.x), y = V.gy(b.z); g.fillStyle = '#FFC845'; rrect(g, x - V.s * 1.6, y - V.s * 1.5, V.s * 3.2, V.s * 1.3, V.s * 0.2); g.fill(); g.fillStyle = '#90CAF9'; for(let w = 0; w < 4; w++) g.fillRect(x - V.s * 1.4 + w * V.s * 0.75, y - V.s * 1.35, V.s * 0.55, V.s * 0.45);
    g.fillStyle = '#333'; [-1, 1].forEach(s => { g.beginPath(); g.arc(x + s * V.s * 1.0, y - V.s * 0.2, V.s * 0.25, 0, 7); g.fill(); }); lbl('⛽ ' + P.got + '/' + P.need, x, y - V.s * 1.8, V.s * 0.3); advGate(g, V, P.gate, P.done, '⛽'); }
  if(P.k === 'radio'){ const cols = ['#E53935', '#43A047', '#1E88E5'];
    P.posters.forEach(p => { const x = V.sx(p.x), y = V.yT - p.y * V.s; g.save(); g.translate(x, y); g.rotate((p.k - 1) * 0.08); g.fillStyle = '#FFF8E1'; g.fillRect(-V.s * 0.4, -V.s * 0.45, V.s * 0.8, V.s * 0.9); g.fillStyle = cols[p.k]; g.fillRect(-V.s * 0.4, -V.s * 0.45, V.s * 0.8, V.s * 0.16); emo(g, '📻', 0, -V.s * 0.12, V.s * 0.26); g.restore(); lbl(String(P.want[p.k]), x, y + V.s * 0.22, V.s * 0.34, cols[p.k]); });
    P.wheels.forEach((d, k) => { const x = V.sx(d.x), y = V.gy(d.z) - V.s * 0.55, r = V.s * 0.34 * (d.ring > 0 ? 1.1 : 1); g.fillStyle = '#455A64'; g.fillRect(x - V.s * 0.05, y, V.s * 0.1, V.s * 0.55); g.fillStyle = cols[k]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke(); lbl(String(d.v), x, y + 1, V.s * 0.34); });
    lbl('📻', V.sx(P.x), V.yT - V.s * 2.1, V.s * 0.5); advGate(g, V, P.gate, P.done, '📻'); }
  if(P.k === 'barricade'){ const Mc = AV.M.machine; lbl('⏱️ ' + Math.max(0, Math.ceil(P.left)) + 's', V.sx(P.x), V.yT - V.s * 2.0, V.s * 0.42, P.left < 6 ? '#7CF29C' : '#fff'); }
  if(AV.M.machine && AV.M.machine.kind){ const Mc = AV.M.machine, x = V.sx(Mc.x) + (Mc.hitT > 0 ? Math.sin(Mc.hitT * 80) * 3 : 0), gate = Mc.kind === 'gate';
    for(let z = 0; z < BV.ZD; z += 0.3){ const y = V.gy(z + 0.15); g.fillStyle = gate ? '#8D6E63' : ['#A1887F', '#8D6E63'][Math.round(z / 0.3) % 2]; g.fillRect(x - V.s * 0.14, y - V.s * (gate ? 1.5 : 1.0), V.s * 0.28, V.s * (gate ? 1.5 : 1.0)); }
    g.strokeStyle = '#5D4037'; g.lineWidth = V.s * 0.08; g.beginPath(); g.moveTo(x - V.s * 0.2, V.gy(0.2) - V.s * 0.8); g.lineTo(x + V.s * 0.2, V.gy(BV.ZD - 0.2) - V.s * 0.3); g.stroke();
    if(gate){ g.fillStyle = '#795548'; g.fillRect(x - V.s * 0.3, V.yT - V.s * 1.4, V.s * 0.6, V.s * 1.4); emo(g, '🏰', x, V.yT - V.s * 1.7, V.s * 0.6); }
    const bw = V.s * 1.4, by = V.yT - V.s * (gate ? 2.3 : 1.4); g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x - bw / 2, by, bw, V.s * 0.16); g.fillStyle = Mc.hp > Mc.max * 0.5 ? '#7CF29C' : Mc.hp > Mc.max * 0.25 ? '#FFC845' : '#FF4D6D'; g.fillRect(x - bw / 2, by, bw * Math.max(0, Mc.hp) / Mc.max, V.s * 0.16); }
  if(P.k === 'outbreak'){ const C = P.cannon; if(C){ const x = V.sx(C.x), y = V.gy(C.z); g.fillStyle = C.on ? '#37474F' : 'rgba(55,71,79,0.4)'; g.beginPath(); g.arc(x, y - V.s * 0.25, V.s * 0.3, 0, 7); g.fill(); g.fillRect(x, y - V.s * 0.42, V.s * 0.6, V.s * 0.24);
      if(C.on){ const ay = V.gy(C.aim); g.strokeStyle = C.cd > 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,77,109,0.75)'; g.setLineDash([8, 8]); g.lineWidth = 3; g.beginPath(); g.moveTo(x + V.s * 0.6, ay); g.lineTo(V.W, ay); g.stroke(); g.setLineDash([]); emo(g, '🎯', x + V.s * 1.2, ay - V.s * 0.1, V.s * 0.3); lbl(C.cd > 0 ? '…' : '👊 FIRE', x, y - V.s * 0.85, V.s * 0.2); } } }
  if(P.k === 'dark' || P.dark){ advDark(g, V, P); }
  const clam = (x, y, s, open, col) => { g.save(); g.translate(x, y); g.fillStyle = '#FFCCBC'; g.strokeStyle = '#BF360C'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI); g.fill(); g.stroke();
    g.save(); g.translate(0, 0); g.rotate(open ? -0.9 : 0); g.beginPath(); g.ellipse(0, 0, s, s * 0.45, 0, Math.PI, Math.PI * 2); g.fillStyle = '#FFAB91'; g.fill(); g.stroke(); g.restore();
    if(open && col != null){ g.fillStyle = col; g.beginPath(); g.arc(0, -s * 0.15, s * 0.35, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(-s * 0.1, -s * 0.25, s * 0.1, 0, 7); g.fill(); } g.restore(); };
  if(P.k === 'shells'){ const bx = V.sx(P.x), by = V.yT - V.s * 2.0; g.fillStyle = 'rgba(255,255,255,0.85)'; rrect(g, bx - V.s * 2.1, by - V.s * 0.45, V.s * 4.2, V.s * 0.9, V.s * 0.2); g.fill();
    P.target.forEach((o, k) => clam(bx + (k - 2) * V.s * 0.8, by + V.s * 0.15, V.s * 0.3, o, '#FFF59D'));
    P.shells.forEach((s, k) => { const x = V.sx(s.x), y = V.gy(s.z), ok2 = s.open === P.target[k]; clam(x, y - V.s * 0.2, V.s * 0.45 * (s.ring > 0 ? 1.1 : 1), s.open, '#FFF59D'); g.fillStyle = ok2 ? '#7CF29C' : 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(x, y - V.s * 0.85, V.s * 0.08, 0, 7); g.fill(); });
    if(P.link) lbl('🔗 a shell also flips the next one', bx, by - V.s * 0.65, V.s * 0.2); advGate(g, V, P.gate, P.done, '🐚'); }
  if(P.k === 'currents'){ for(let c = 0; c < P.cols; c++){ const x0c = V.sx(P.x0 + c * P.cw), w = P.cw * V.s, calm = BV.currentCalm(P, c);
      g.fillStyle = calm ? 'rgba(178,235,242,0.35)' : 'rgba(13,71,161,0.35)'; g.fillRect(x0c + 1, V.yT, w - 2, V.yB - V.yT);
      if(!calm){ g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 3; for(let r = 0; r < 4; r++){ const y = V.yT + (r + 0.5) * (V.yB - V.yT) / 4, off = (AV.t * 3 + r) % 1; g.beginPath(); g.moveTo(x0c + w * (0.8 - off * 0.6), y - 6); g.lineTo(x0c + w * (0.6 - off * 0.6), y); g.lineTo(x0c + w * (0.8 - off * 0.6), y + 6); g.stroke(); } } else emo(g, '✨', x0c + w / 2, V.yT + V.s * 0.3, V.s * 0.25); }
    advGate(g, V, P.gate, P.done, '🌊'); }
  if(P.k === 'pearls'){ P.clams.forEach(q => { const x = V.sx(q.x), y = V.gy(q.z); clam(x, y - V.s * 0.2, V.s * 0.5, q.open || q.done, ['#F06292', '#4FC3F7', '#FFD54F'][q.c]); if(q.done) emo(g, '✨', x + V.s * 0.4, y - V.s * 0.7, V.s * 0.25); });
    dots(P.clams.filter(q => q.done).length / 2, 3, V.sx(P.x), V.yT - V.s * 2.0); advGate(g, V, P.gate, P.done, '🦪'); }
  if(P.k === 'sonar'){ const S2 = P.station, x = V.sx(S2.x), y = V.gy(S2.z); g.fillStyle = '#607D8B'; g.fillRect(x - V.s * 0.06, y - V.s * 0.9, V.s * 0.12, V.s * 0.9); g.fillStyle = '#B0BEC5'; g.beginPath(); g.ellipse(x, y - V.s * 1.0, V.s * 0.4, V.s * 0.2, -0.4, 0, 7); g.fill(); emo(g, '📡', x, y - V.s * 1.35, V.s * 0.35);
    if(P.reveal > 0){ const u = 1 - P.reveal / 3.5; for(let r = 0; r < 3; r++){ const rr = ((u * 3 + r / 3) % 1) * V.s * 7; g.strokeStyle = 'rgba(124,242,156,' + (0.6 * (1 - rr / (V.s * 7))).toFixed(2) + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, rr, rr * 0.3, 0, 0, 7); g.stroke(); }
      P.spots.forEach(s => { if(!s.found){ g.fillStyle = 'rgba(124,242,156,' + (0.5 + 0.5 * Math.sin(AV.t * 10)).toFixed(2) + ')'; g.beginPath(); g.ellipse(V.sx(s.x), V.gy(s.z), V.s * 0.3, V.s * 0.1, 0, 0, 7); g.fill(); emo(g, '❌', V.sx(s.x), V.gy(s.z) - V.s * 0.2, V.s * 0.25); } }); }
    P.spots.forEach(s => { if(s.found) emo(g, '💎', V.sx(s.x), V.gy(s.z) - V.s * 0.3, V.s * 0.35); }); lbl('💎 ' + P.got + '/3', V.sx(P.x), V.yT - V.s * 2.0, V.s * 0.3); advGate(g, V, P.gate, P.done, '📡'); }
  if(P.k === 'wedding'){ const A = P.altar, x = V.sx(A.x), y = V.gy(A.z);
    g.strokeStyle = '#F8BBD0'; g.lineWidth = V.s * 0.12; g.beginPath(); g.arc(x, y - V.s * 1.0, V.s * 1.3, Math.PI, 0); g.stroke(); for(let f = 0; f < 9; f++){ const an = Math.PI + f / 8 * Math.PI; emo(g, f % 2 ? '🌸' : '🐚', x + Math.cos(an) * V.s * 1.3, y - V.s * 1.0 + Math.sin(an) * V.s * 1.3, V.s * 0.3); }
    g.fillStyle = '#FFF3E0'; g.fillRect(x - V.s * 0.5, y - V.s * 0.5, V.s * 1.0, V.s * 0.5);
    if(P.stage === 'object' && Math.sin(AV.t * 6) > -0.3) lbl('👊 = “WE OBJECT!”', x - V.s * 1.5, V.yT - V.s * 2.2, V.s * 0.4, '#FFC845');
    if(P.stage === 'trial' || P.stage === 'royal') lbl(P.stage === 'royal' ? '👑 Final round!' : '⚔️ Trial round ' + P.round + ' / 3', x - V.s * 1.5, V.yT - V.s * 2.2, V.s * 0.34); }
}
// 🔦 darkness with a light circle around every hero; safe stones show only inside the light
function advDark(g, V, P){
  const M = AV.M, x0 = V.sx(P.x0 - 1.2), x1 = V.sx(P.x0 + P.cols * P.cw + 1.2), rh = BV.ZD / P.rows;
  g.save(); g.beginPath(); g.rect(x0, 0, x1 - x0, V.H); M.heroes.forEach(h => { if(h.ko) return; const r = V.s * (h.item === 'flashlight' ? 2.1 : 1.35); g.moveTo(V.sx(h.x) + r, V.gy(h.z) - V.s * 0.6); g.arc(V.sx(h.x), V.gy(h.z) - V.s * 0.6, r, 0, Math.PI * 2, true); });
  g.fillStyle = 'rgba(8,8,20,0.88)'; g.fill('evenodd'); g.restore();
  for(let c = 0; c < P.cols; c++){ const r = P.path[c], x = V.sx(P.x0 + (c + 0.5) * P.cw), y = V.gy((r + 0.5) * rh), near = M.heroes.some(h => !h.ko && Math.hypot(h.x - (P.x0 + (c + 0.5) * P.cw), (h.z - (r + 0.5) * rh) * 1.4) < (h.item === 'flashlight' ? 2.3 : 1.5));
    if(near || c <= P.prog){ g.fillStyle = c <= P.prog ? 'rgba(124,242,156,0.5)' : 'rgba(255,248,200,0.6)'; g.beginPath(); g.ellipse(x, y, P.cw * V.s * 0.32, V.s * 0.16, 0, 0, 7); g.fill(); } }
}
const ADV_CANDY = ['#FF4D6D', '#3DDC84', '#3D8BFD'];
function advCandy(g, x, y, r, c, t){ g.save(); g.translate(x, y); g.rotate(t * 2); g.fillStyle = ADV_CANDY[c]; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = Math.max(1.5, r * 0.25); g.beginPath(); g.arc(0, 0, r * 0.55, 0, 4.5); g.stroke();
  g.fillStyle = ADV_CANDY[c]; [-1, 1].forEach(s => { g.beginPath(); g.moveTo(s * r, 0); g.lineTo(s * r * 1.7, -r * 0.5); g.lineTo(s * r * 1.7, r * 0.5); g.fill(); }); g.restore(); }
// jail door (dungeon): the prisoner waits behind bars until the key turns up
function advDoor(g, V, t){
  const D = AV.M.door, x = V.sx(D.x), y = V.gy(D.z), open = D.open ? Math.min(1, D.t / 0.6) : 0;
  if(!D.open && AV.M.prisoner){ advFighter(g, V, {i: 9100, name: AV.M.prisoner, avF: AV.prisAv, x: D.x + 0.15, y: 0, z: D.z, face: -1, act: null, stun: 0, down: 0, ko: false, launched: false, land: 0, cheer: 0, sad: 1.5, walkT: 0, safe: 0, hitFlash: 0, vx: 0, vz: 0, vy: 0, hero: true, noTag: true, ring: '#90A4AE', glove: '#90A4AE'}, t); }
  const w = V.s * 0.75, h = V.s * 2.0; g.save(); g.translate(x - w, y); g.scale(1 - open * 0.85, 1);
  g.strokeStyle = '#78909C'; g.lineWidth = V.s * 0.07; g.strokeRect(0, -h, w * 2, h); for(let i = 1; i < 6; i++){ g.beginPath(); g.moveTo(i * w / 3, -h); g.lineTo(i * w / 3, 0); g.stroke(); } g.restore();
  if(!D.open){ emo(g, '🔒', x, y - h * 0.55, V.s * 0.4); if(Math.sin(t * 3) > 0.3) { g.font = '800 ' + Math.round(V.s * 0.2) + 'px Nunito, sans-serif'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('Find the key! 🗝️', x, y - h - V.s * 0.2); } }
}
// suits of armour (dungeon puzzle props)
function advArmour(g, V, p){
  const x = V.sx(p.x) + (p.hitT > 0 ? Math.sin(p.hitT * 60) * V.s * 0.06 : 0), y = V.gy(p.z), k = V.s * V.ks(p.z) / 100, cr = 3 - p.hp;
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(x, y, 30 * k, 8 * k, 0, 0, 7); g.fill();
  g.fillStyle = '#90A4AE'; g.strokeStyle = '#546E7A'; g.lineWidth = 2;
  g.fillRect(x - 6 * k, y - 50 * k, 5 * k, 50 * k); g.fillRect(x + 1 * k, y - 50 * k, 5 * k, 50 * k);
  rrect(g, x - 18 * k, y - 105 * k, 36 * k, 58 * k, 8 * k); g.fill(); g.stroke();
  g.beginPath(); g.arc(x, y - 122 * k, 17 * k, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#263238'; g.fillRect(x - 11 * k, y - 125 * k, 22 * k, 4 * k);
  g.fillStyle = '#B0BEC5'; g.fillRect(x - 28 * k, y - 100 * k, 9 * k, 40 * k); g.fillRect(x + 19 * k, y - 100 * k, 9 * k, 40 * k);
  if(cr > 0){ g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 10 * k, y - 95 * k); g.lineTo(x + 2 * k, y - 80 * k); g.lineTo(x - 4 * k, y - 66 * k); if(cr > 1){ g.moveTo(x + 8 * k, y - 130 * k); g.lineTo(x + 2 * k, y - 116 * k); } g.stroke(); }
}
function advGate(g, V, gx, open, icon){
  const x = V.sx(gx + 0.3); if(x < -50 || x > V.W + 50) return;
  if(open){ g.globalAlpha = 0.35; }
  g.fillStyle = '#8D6E63'; for(let z = 0; z < BV.ZD; z += 0.3){ const y = V.gy(z + 0.15); g.fillRect(x - V.s * 0.06, y - V.s * 0.9, V.s * 0.12, V.s * 0.9); }
  g.fillStyle = '#A1887F'; g.fillRect(x - V.s * 0.04, V.yT - V.s * 0.75, V.s * 0.08, V.yB - V.yT + V.s * 0.2);
  g.globalAlpha = 1; if(!open) emo(g, icon, x, V.gy(BV.ZD / 2) - V.s * 1.1, V.s * 0.55);
}
function advCage(g, V, t){
  const C = AV.M.cage, x = V.sx(C.x), y = V.gy(C.z), k = V.ks(C.z), lift = C.open ? Math.min(1, C.t / 0.8) : 0;
  const who = {i: 9000, name: AV.capName, avF: AV.capAv, x: C.x, y: 0, z: C.z, face: -1, act: null, stun: 0, bstun: 0, down: 0, ko: false, launched: false, dodge: null, dash: null, open: 0, dizzy: 0, held: null, grab: null, land: 0, cheer: C.open ? 2 - (C.t % 2) : 0, sad: C.open ? 0 : 1.5, walkT: 0, safe: 0, hitFlash: 0, jug: 0, ctrl: {l: false, r: false, d: false}, vx: 0, vy: 0, human: true, noTag: !C.open, ring: '#FFC845', glove: '#FFC845', noHelm: true};
  advFighter(g, V, who, t);
  if(lift < 1){ g.save(); g.globalAlpha = 1 - lift; g.translate(0, -lift * V.s * 2); g.strokeStyle = '#546E7A'; g.lineWidth = V.s * 0.07; const w = V.s * 0.8 * k, h = V.s * 2.0 * k;
    g.strokeRect(x - w, y - h, w * 2, h); for(let i = -3; i <= 3; i++){ g.beginPath(); g.moveTo(x + i * w / 3.5, y - h); g.lineTo(x + i * w / 3.5, y); g.stroke(); } emo(g, '🔒', x, y - h * 0.5, V.s * 0.45); g.restore(); }
  if(!C.open && Math.sin(t * 3) > 0.3){ g.font = '800 ' + Math.round(V.s * 0.22) + 'px Nunito, sans-serif'; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 4; g.textAlign = 'center'; g.strokeText('Help! 😢', x, y - V.s * 2.3 * k); g.fillText('Help! 😢', x, y - V.s * 2.3 * k); }
}
// one hero / baddie through the Brawl Buddies fighter painter (same poses + gloves), placed on its depth line
function advLift(p){ if(!p.grabbedBy) return 0; const gh = AV.M.heroes.find(h => h.i === p.grabbedBy); return gh && gh.grab ? Math.sin(Math.min(1, gh.grab.t / gh.grab.imp) * Math.PI) * 1.5 : 0; }
function advMonster(g, V, p, t){
  const F = p.F, k = V.ks(p.z) * (p.big || 1), x = V.sx(p.x), gy = V.gy(p.z), sz = V.s * 1.25 * k, y = gy - p.y * V.s * k;
  g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(x, gy, sz * 0.42, sz * 0.12, 0, 0, 7); g.fill();
  const T = p.act ? BV.foeTimes(p, p.act.k) : null, wind = T && p.act.t < T.st ? p.act.t / T.st : 0, strike = T && p.act.t >= T.st && p.act.t < T.st + T.ac + 0.1;
  const bob = Math.sin(t * (F.float ? 2.5 : 7) + p.i) * (F.float ? 0.18 : 0.05) - advLift(p) / 1.25, sq = (p.land > 0 ? 0.85 : 1) * (1 - wind * 0.12);
  g.save(); g.translate(x + (strike ? p.face * sz * 0.15 : -p.face * wind * sz * 0.08), y - sz * 0.48 + bob * sz);
  if(p.launched || (p.dead && !p.launched)) g.rotate(p.face * (p.launched ? t * 9 : 1.4)); if(p.grabbedBy) g.rotate(-p.face * advLift(p) * 1.4);
  if(p.act && p.act.k === 'spin' && !wind) g.rotate(t * 20);
  g.scale(-p.face * (1 + (1 - sq) * 0.6), sq); if(p.dead > 0.6) g.globalAlpha = Math.max(0, 1 - (p.dead - 0.6) * 1.6);
  emo(g, F.monster, 0, 0, sz); if(p.hitFlash > 0){ g.globalAlpha = 0.6; g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, sz * 0.45, 0, 7); g.fill(); }
  g.restore(); g.globalAlpha = 1;
  if(!p.dead){ g.fillStyle = '#fff'; [-1, 1].forEach(s => { g.beginPath(); g.arc(x + (p.face * 0.12 + s * 0.12) * sz, y - sz * 0.62 + bob * sz, sz * 0.07, 0, 7); g.fill(); }); g.fillStyle = '#000'; [-1, 1].forEach(s => { g.beginPath(); g.arc(x + (p.face * 0.15 + s * 0.12) * sz, y - sz * 0.62 + bob * sz, sz * 0.035, 0, 7); g.fill(); }); }
  if(F.mini || p.boss){ emo(g, F.mini ? '⭐' : '👑', x, y - sz * 1.1, sz * 0.3); }
  if(p.stun > 0.25 || p.dizzy > 0) for(let i = 0; i < 3; i++){ const an = t * 5 + i * 2.1; emo(g, i % 2 ? '⭐' : '💫', x + Math.cos(an) * sz * 0.3, y - sz * 1.0 + Math.sin(an) * sz * 0.08, sz * 0.18); }
  if(p.act && !p.act.hit && p.act.k !== 'charge') emo(g, '❗', x, y - sz * 1.15, V.s * 0.32);
}
function advBody(g, V, p, t){
  if(p.foe && p.F.monster){ advMonster(g, V, p, t); return; }
  if(p.ko && p.out > 0 && Math.floor(t * 6) % 2) return;   // bonked-out hero blinks until the comeback
  if(p.dead && p.dead > 0.6 && Math.floor(t * 14) % 2) return;
  if(!p.avF){ p.avF = AV.foeAvs[p.i] || (AV.foeAvs[p.i] = fightAv(foeAvatar(p.type, p.i))); p.noHelm = true; p.noTag = true; p.ring = p.boss ? '#9B1D45' : '#E53935'; p.glove = {rascal: '#B71C1C', kicker: '#E65100', splasher: '#0277BD', brax: '#4A148C', gummy: '#2E7D32', jawbreaker: '#4A148C', sprinkler: '#D81B60', fizz: '#5E35B1', fang: '#EF6C00', guard: '#546E7A', knight: '#1565C0', archer: '#1B5E20', grumble: '#4A148C'}[p.type] || '#B71C1C'; }
  if(p.ride > 0){ const x = V.sx(p.x), y = V.gy(p.z); emo(g, '🛹', x, y - V.s * 0.08, V.s * 0.55 * V.ks(p.z)); }
  advFighter(g, V, p, t);
  if(p.foe) advFoeGear(g, V, p, t);
  if(p.boost > 0){ const x = V.sx(p.x), y = V.gy(p.z) - (p.y + 0.9) * V.s; g.globalAlpha = 0.35 + 0.15 * Math.sin(t * 12); g.fillStyle = '#FFE38A'; g.beginPath(); g.arc(x, y, V.s * 0.7, 0, 7); g.fill(); g.globalAlpha = 1; }
  if(p.carry != null){ const x = V.sx(p.x), y = V.gy(p.z) - (p.y + 2.05) * V.s * V.ks(p.z); if(p.carry === 'fuel') emo(g, '⛽', x, y, V.s * 0.4); else advCandy(g, x, y, V.s * 0.17, p.carry, AV.t); }
  if(p.shield > 0){ const x = V.sx(p.x), y = V.gy(p.z) - (p.y + 0.95) * V.s * V.ks(p.z); g.strokeStyle = 'rgba(110,231,249,' + (0.35 + 0.1 * p.shield).toFixed(2) + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, V.s * 0.55, V.s * 0.95, 0, 0, 7); g.stroke(); }
  if(p.foe && p.F.shield && !p.launched && p.down <= 0 && !p.dead){ const x = V.sx(p.x + p.face * 0.38), y = V.gy(p.z) - (p.y + 0.95) * V.s * V.ks(p.z); emo(g, '🛡️', x, y, V.s * 0.55); }
  if(p.foe && p.type === 'archer' && !p.launched && p.down <= 0 && !p.dead){ const x = V.sx(p.x + p.face * 0.35), y = V.gy(p.z) - (p.y + 1.05) * V.s * V.ks(p.z); emo(g, '🏹', x, y, V.s * 0.45); }
  if(p.item){ const x = V.sx(p.x + p.face * 0.32), y = V.gy(p.z) - (p.y + 1.25) * V.s * V.ks(p.z); emo(g, BV.PICKS[p.item].icon, x, y, V.s * 0.38); }
  // baddie wind-up warning
  if(p.foe && p.act && !p.act.hit && p.act.k !== 'charge'){ const x = V.sx(p.x), y = V.gy(p.z) - (p.y + 2.1 * (p.big || 1)) * V.s * V.ks(p.z); emo(g, '❗', x, y, V.s * 0.32); }
  if(p.foe && p.act && p.act.k === 'charge' && !p.act.hit){ const x = V.sx(p.x), y = V.gy(p.z) - 2.6 * V.s; emo(g, '💢', x, y, V.s * 0.4); }
}
function advFighter(g, V, p, t){
  const k = V.ks(p.z) * (p.big || 1), x = V.sx(p.x), y = V.gy(p.z);
  // pose object: the fighter painter reads Brawl moves; map our moves onto them (baddie wind-ups slowed down → time scaled)
  let act = null;
  if(p.act){ const hm = BV.HMOVES[p.act.k];
    if(p.hero && hm) act = typeof brbOk === 'function' && brbOk() ? {k: p.act.k === 'toss' ? 'toss' : hm.anim, t: p.act.t, m: hm} : {k: hm.anim, t: p.act.t};   /* 🎬 b3b9 */
    else if(p.foe){ const T = BV.foeTimes(p, p.act.k), base = BB.MOVES[p.act.k === 'lob' ? 'boop' : p.act.k === 'pound' ? 'jbonk' : p.act.k === 'charge' ? 'dbonk' : p.act.k] || BB.MOVES.boop, sc = base.st / Math.max(0.01, T.st);
      act = {k: p.act.k === 'lob' ? 'boop' : p.act.k === 'pound' ? 'jbonk' : p.act.k === 'charge' ? (p.act.t < T.st ? 'charge' : 'dbonk') : p.act.k, t: p.act.k === 'charge' && p.act.t < T.st ? p.act.t * 0.5 : p.act.t < T.st ? p.act.t * sc : base.st + (p.act.t - T.st)}; } }
  const q = {i: p.i, name: p.name, x: p.x, y: p.y, vy: p.vy, vx: Math.hypot(p.vx || 0, p.vz || 0) * (p.face || 1), face: p.face, act, stun: p.stun, bstun: 0, down: p.down, ko: p.ko || (p.dead && !p.launched), launched: p.launched, dodge: null, dash: p.foe ? (p.act && p.act.k === 'charge' && act && act.k === 'dbonk' ? {dir: 1} : null) : (p.dash && !p.act ? {dir: 1, t: p.dash.t} : null),
    open: 0, dizzy: p.dizzy || 0, held: null, grab: p.hero && p.grab ? p.grab : null, land: p.land, cheer: p.cheer || 0, sad: p.sad || 0, walkT: p.walkT, safe: p.safe, hitFlash: p.hitFlash, jug: 0, ctrl: {l: false, r: false, d: false, b: !!(p.blk || p.guarding > 0)}, human: !!p.hero, avF: p.avF, ring: p.ring, glove: p.glove, noHelm: true, noTag: p.noTag || !p.hero, gear: p.gear};
  const st = {M: {f: [], done: false, state: 'fight'}, vis: AV.vis, preview: false, avs: [], level: 0};
  if(p.cheer || p.sad) st.M.state = 'end';
  if(p.grabbedBy){ const gh = AV.M.heroes.find(h => h.i === p.grabbedBy); if(gh && gh.grab){ q.held = {by: 0, t: gh.grab.t}; st.M.f = [{x: gh.x, face: gh.face, grab: gh.grab}]; } }
  if(p.hero && p.item && BV.PICKS[p.item] && BV.PICKS[p.item].melee && typeof BatStick !== 'undefined'){ const bd = (S.batDesigns || {})[p.name] || BatStick.of(p.name, S.settings); if(bd) q.avF = BatStick.hold(q.avF || p.avF, racketDesign(Number(bd.v) || 0, bd)); }   // 🏏 bs-1 a melee pickup = YOUR Batstick
  const VV = {s: V.s * k, X: px => x + (px - p.x) * V.s * k, Y: h => y - h * V.s * k};
  if(!AV.vis[p.i]) AV.vis[p.i] = {};
  drawFighter(g, VV, st, q, t + p.i * 0.37);
}
// round I extras: ❤️ small bars over hit baddies · 🛡️ shield in front of a blocking hero · ⚡ counter chance · 🛡️ raised baddie guard
function advExtras(g, V, p, t){
  const M = AV.M, ks = V.ks(p.z), x = V.sx(p.x);
  if(p.foe && !p.boss && !p.dead && p.barT > 0 && !M.clash){ const big = p.big || 1, top = V.gy(p.z) - (p.y + (p.F.monster ? 1.5 : 2.12) * big) * V.s * ks, w = V.s * 0.82 * (big > 1 ? 1.15 : 1), h = Math.max(5, V.s * 0.085), u = Math.max(0, p.hp / p.maxHp);
    g.globalAlpha = Math.min(1, p.barT / 0.4); g.fillStyle = 'rgba(25,8,40,0.8)'; rrect(g, x - w / 2 - 2, top - 2, w + 4, h + 4, (h + 4) / 2); g.fill();
    const gr = g.createLinearGradient(0, top, 0, top + h); gr.addColorStop(0, u > 0.6 ? '#9CF5B5' : u > 0.3 ? '#FFE08A' : '#FF9A9A'); gr.addColorStop(1, u > 0.6 ? '#2BB673' : u > 0.3 ? '#F2A100' : '#E53935');
    g.fillStyle = gr; if(u > 0){ rrect(g, x - w / 2, top, Math.max(h, w * u), h, h / 2); g.fill(); } g.globalAlpha = 1; }
  if(p.hero && p.blk){ const bx = V.sx(p.x + p.face * 0.42), by = V.gy(p.z) - (p.y + 0.95) * V.s * ks, a = 0.55 + 0.25 * Math.sin(t * 14);
    g.save(); g.globalAlpha = a; const gr = g.createRadialGradient(bx, by, V.s * 0.1, bx, by, V.s * 0.8); gr.addColorStop(0, 'rgba(180,245,255,0.55)'); gr.addColorStop(1, 'rgba(110,231,249,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(bx, by, V.s * 0.32, V.s * 0.85, 0, 0, 7); g.fill();
    g.strokeStyle = p.gd < 30 ? '#FF6B6B' : '#6EE7F9'; g.lineWidth = Math.max(3, V.s * 0.06); g.beginPath(); g.ellipse(bx, by, V.s * 0.22, V.s * 0.8, 0, p.face > 0 ? -1.3 : Math.PI - 1.3 + 0.0, p.face > 0 ? 1.3 : Math.PI + 1.3); g.stroke(); g.restore(); }
  if(p.hero && p.ctr && !M.clash){ const y = V.gy(p.z) - (p.y + 2.35) * V.s * ks, sc = 1 + 0.18 * Math.sin(t * 22); emo(g, '⚡', x, y, V.s * 0.42 * sc);
    if(p.human){ g.font = '900 ' + Math.round(V.s * 0.2) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = '#2A1240'; g.fillStyle = '#FFC845'; g.strokeText('COUNTER!', x, y - V.s * 0.34); g.fillText('COUNTER!', x, y - V.s * 0.34); } }
  if(p.foe && p.guarding > 0 && !p.dead && !p.F.shield){ const gx = V.sx(p.x + p.face * 0.4), gy = V.gy(p.z) - (p.y + 1.0 * (p.big || 1)) * V.s * ks; emo(g, '🛡️', gx, gy, V.s * 0.5 * (p.big || 1)); }
  if(p.hero && p.dash && !p.act){ g.globalAlpha = 0.45; for(let k = 1; k <= 3; k++) emo(g, '💨', V.sx(p.x - p.face * 0.35 * k), V.gy(p.z) - V.s * 0.35 * ks, V.s * 0.3 * (1 - k * 0.15)); g.globalAlpha = 1; }
}
// 💡 Easy / Normal: a bouncing finger over the next puzzle step after 25 s stuck
function advHintArrow(g, V, t){
  const H = AV.hint; if(!H || H.lvl < 2 || !H.tgt || AV.M.clash) return; const x = V.sx(H.tgt.x), y = V.gy(H.tgt.z), b = Math.abs(Math.sin(t * 5)) * V.s * 0.18;
  g.save(); g.setLineDash([V.s * 0.08, V.s * 0.06]); g.lineWidth = Math.max(2, V.s * 0.04); g.strokeStyle = 'rgba(255,200,69,' + (0.6 + 0.3 * Math.sin(t * 6)).toFixed(2) + ')'; g.beginPath(); g.ellipse(x, y, V.s * 0.42, V.s * 0.12, 0, 0, 7); g.stroke(); g.restore();
  emo(g, '👇', x, y - V.s * 1.9 - b, V.s * 0.55);
}
// baddie look: bandana / headband / cap + a little mask (painted over the avatar head, like the robot helmets)
function advFoeGear(g, V, p, t){
  if(p.dead && !p.launched) return; const k = V.s * V.ks(p.z) * (p.big || 1) * 1.62 / 86, x = V.sx(p.x), y = V.gy(p.z) - p.y * V.s * V.ks(p.z) * (p.big || 1);
  const P = {dy: 0, sx: 1, sy: 1, rot: 0}; if(p.launched || p.down > 0) return;
  g.save(); avFrame(g, x, y, k, p.face, P, 0); const hy = -60 * k;
  if(p.type === 'barnacle'){ g.fillStyle = '#212121'; g.beginPath(); g.moveTo(-20 * k, hy - 8 * k); g.quadraticCurveTo(0, hy - 30 * k, 20 * k, hy - 8 * k); g.quadraticCurveTo(0, hy - 14 * k, -20 * k, hy - 8 * k); g.fill(); emo(g, '☠️', 0, hy - 16 * k, 8 * k); g.fillStyle = '#212121'; g.beginPath(); g.arc(5 * k, hy, 4 * k, 0, 7); g.fill(); g.restore(); return; }
  if(p.type === 'coralline' || p.type === 'finnegan'){ emo(g, '👑', 0, hy - 20 * k, 12 * k); const tc = p.type === 'coralline' ? '#26C6DA' : '#5C6BC0'; g.fillStyle = tc; g.beginPath(); g.moveTo(-12 * k, -34 * k); g.quadraticCurveTo(-14 * k, -12 * k, -3 * k, -4 * k); g.lineTo(-14 * k, 4 * k); g.lineTo(14 * k, 4 * k); g.lineTo(3 * k, -4 * k); g.quadraticCurveTo(14 * k, -12 * k, 12 * k, -34 * k); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; for(let s = 0; s < 4; s++){ g.beginPath(); g.arc(-4 * k + (s % 2) * 8 * k, -28 * k + s * 6 * k, 2.5 * k, 0, 7); g.fill(); } g.restore(); return; }
  if(p.F.undead){ g.fillStyle = 'rgba(110,190,90,0.55)'; g.beginPath(); g.arc(0, hy, 13.5 * k, 0, 7); g.fill(); g.strokeStyle = '#3E2723'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(-8 * k, hy - 9 * k); g.lineTo(-2 * k, hy - 6 * k); [-6, -4, -2].forEach(s => { g.moveTo(s * k, hy - 9.5 * k); g.lineTo(s * k + 0.5 * k, hy - 6 * k); }); g.stroke();
    g.fillStyle = '#fff'; g.fillRect(4 * k, hy - 12 * k, 8 * k, 3 * k); g.fillStyle = '#E0E0E0'; g.fillRect(-12 * k, hy + 2 * k, 6 * k, 2.4 * k);
    if(p.type === 'mumble' || p.type === 'megamumble'){ emo(g, '👑', 0, hy - 22 * k, (p.type === 'megamumble' ? 16 : 13) * k); }
    if(!p.dead && Math.floor(AV.t * 2 + p.i) % 3 === 0) emo(g, '💤', 14 * k, hy - 18 * k, 7 * k); g.restore(); return; }
  const col = {rascal: '#E53935', kicker: '#FF6F00', splasher: '#0288D1', brax: '#4A148C', gummy: '#43A047', jawbreaker: '#6A1B9A', sprinkler: '#EC407A', fizz: '#7E57C2', fang: '#FB8C00', guard: '#78909C', knight: '#1E88E5', archer: '#2E7D32', grumble: '#4A148C'}[p.type] || '#E53935';
  g.fillStyle = col; g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1 * k;
  if(p.type === 'guard' || p.type === 'knight'){ g.fillStyle = p.type === 'knight' ? '#B0BEC5' : '#90A4AE'; g.beginPath(); g.arc(0, hy - 3 * k, 16 * k, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(16 * k, hy + 4 * k); g.lineTo(-16 * k, hy + 4 * k); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#263238'; g.fillRect(-11 * k, hy - 2 * k, 22 * k, 3.5 * k); if(p.type === 'knight'){ g.fillStyle = col; g.beginPath(); g.moveTo(0, hy - 19 * k); g.quadraticCurveTo(10 * k, hy - 30 * k, 4 * k, hy - 34 * k); g.lineTo(-2 * k, hy - 19 * k); g.fill(); } g.restore(); return; }
  if(p.type === 'archer'){ g.fillStyle = col; g.beginPath(); g.moveTo(-16 * k, hy + 2 * k); g.quadraticCurveTo(0, hy - 34 * k, 16 * k, hy + 2 * k); g.lineTo(10 * k, hy - 6 * k); g.lineTo(-10 * k, hy - 6 * k); g.closePath(); g.fill(); }
  else if(p.type === 'gummy' || p.type === 'jawbreaker' || p.type === 'sprinkler'){ g.fillStyle = col; g.beginPath(); g.arc(0, hy - 6 * k, 15 * k, Math.PI, 0); g.fill(); g.fillStyle = '#fff'; for(let s = 0; s < 5; s++){ g.fillStyle = ['#FFC845', '#fff', '#3DDC84', '#FF4D6D', '#3D8BFD'][s]; g.fillRect(-10 * k + s * 5 * k, hy - 14 * k - (s % 2) * 3 * k, 2.4 * k, 1.2 * k); } }
  else if(p.type === 'fizz' || p.type === 'fang'){ g.fillStyle = col; [-1, 1].forEach(s => { g.beginPath(); g.arc(s * 15 * k, hy - 12 * k, 6 * k, 0, 7); g.fill(); }); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, hy - 18 * k, 5 * k, 0, 7); g.fill(); emo(g, p.type === 'fizz' ? '🫧' : '🦷', 0, hy - 26 * k, 10 * k); }
  else if(p.type === 'grumble'){ g.fillStyle = '#7B1F3A'; g.beginPath(); g.arc(0, hy - 4 * k, 15 * k, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); g.fill(); emo(g, '👑', 0, hy - 24 * k, 14 * k); g.fillStyle = '#4E342E'; g.beginPath(); g.ellipse(0, hy + 9 * k, 9 * k, 3 * k, 0, 0, 7); g.fill(); g.restore(); return; }
  else if(p.type === 'splasher' || p.type === 'brax'){ g.beginPath(); g.arc(0, hy - 4 * k, 15 * k, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); g.fill(); g.stroke(); g.fillRect(-2 * k, hy - 6 * k, (p.type === 'brax' ? -20 : 20) * k, 3.5 * k); }
  else { g.fillRect(-15 * k, hy - 10 * k, 30 * k, 4.5 * k); g.beginPath(); g.moveTo(-14 * k, hy - 8 * k); g.lineTo(-22 * k, hy - 12 * k + Math.sin(t * 9) * 2 * k); g.lineTo(-21 * k, hy - 5 * k); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(20,20,30,0.85)'; rrect(g, -11 * k, hy - 3.5 * k, 22 * k, 6 * k, 3 * k); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(-4.5 * k, hy - 0.5 * k, 1.6 * k, 0, 7); g.arc(4.5 * k, hy - 0.5 * k, 1.6 * k, 0, 7); g.fill();
  if(p.type === 'brax'){ g.fillStyle = '#FFC845'; emo(g, '👑', 0, hy - 22 * k, 12 * k); }
  g.restore();
}
function advDrawFx(g, V){
  AV.fx.forEach(f => { const u = f.t / f.life, x = V.sx(f.x), y = V.gy(f.z) - f.y * V.s;
    if(f.k === 'star'){ g.globalAlpha = 1 - u; for(let i = 0; i < (f.big ? 6 : 4); i++){ const a = i / (f.big ? 6 : 4) * 6.28 + f.t * 4, r = V.s * (0.2 + u * 0.6); emo(g, i % 2 ? '⭐' : '✨', x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7, V.s * 0.26); }
      if(f.word){ g.font = '900 ' + Math.round(V.s * 0.42 * (1 + 0.3 * (1 - u))) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 5; g.strokeStyle = '#2A1240'; g.fillStyle = '#FFC845'; g.strokeText(f.word, x, y - V.s * 0.6 - u * V.s * 0.4); g.fillText(f.word, x, y - V.s * 0.6 - u * V.s * 0.4); }
      g.globalAlpha = 1; }
    else if(f.k === 'poof'){ g.globalAlpha = 1 - u; emo(g, '💨', x, y - u * V.s * 0.6, V.s * (0.5 + u * 0.6)); emo(g, '⭐', x + V.s * 0.4, y - V.s * (0.4 + u), V.s * 0.3); g.globalAlpha = 1; }
    else if(f.k === 'beam'){ g.globalAlpha = (1 - u) * 0.6; const gr = g.createLinearGradient(x, y, x + f.face * V.s * 4.6, y); gr.addColorStop(0, 'rgba(255,250,200,0.95)'); gr.addColorStop(1, 'rgba(255,250,200,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x, y); g.lineTo(x + f.face * V.s * 4.6, y - V.s * 0.9); g.lineTo(x + f.face * V.s * 4.6, y + V.s * 0.9); g.closePath(); g.fill(); g.globalAlpha = 1; }
    else if(f.k === 'chip'){ g.globalAlpha = 1 - u; emo(g, f.icon, x + u * V.s * 0.4, y - u * V.s * 0.5, V.s * 0.3); g.globalAlpha = 1; }
    else if(f.k === 'float'){ g.globalAlpha = Math.min(1, 2 - u * 2); g.font = '800 ' + Math.round(V.s * 0.28) + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 4; emoText(g, f.txt, x, y - u * V.s * 0.7, V.s * 0.3, true); g.globalAlpha = 1; }
  });
}
GameParts.loaded('BrawlBuddies_adv', 's-brawl');
