
// ENGINE START — 🏰 TD-Stories engine (pure JS, no DOM; Test Harness/tdstories.js loads SkillKit + this part in node)
const TD = (function(){
'use strict';
const SK = (typeof SkillKit !== 'undefined') ? SkillKit : (typeof window !== 'undefined' ? window.SkillKit : globalThis.SkillKit);
const W = 16, CX = 8, CY = 8, TOWER_R = 1.15, STEP = 1 / 30;
function rngOf(seed){ let a = (seed >>> 0) || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- 🎚️ difficulty (6 house levels) ---------- */
const LEVELS = [
  {name: 'Basic', emoji: '🌱', hp: 0.62, spd: 0.72, hearts: 20, cards: 2, glow: 99, guide: true, mult: 1, bot: 0, assist: 3, blurb: 'Slow suitors, the best card glows'},
  {name: 'Junior', emoji: '🐣', hp: 0.8, spd: 0.82, hearts: 16, cards: 3, glow: 3, mult: 1, bot: 0.34, assist: 7, blurb: 'Three cards to pick from'},
  {name: 'Intermediate', emoji: '🌳', hp: 1, spd: 0.92, hearts: 12, cards: 3, glow: 0, mult: 1, bot: 0.5, blurb: 'The suitors level up too'},
  {name: 'Hard', emoji: '🔥', hp: 1.22, spd: 1.0, hearts: 10, cards: 3, glow: 0, mult: 1, bot: 1, blurb: 'Tough knights, quick feet'},
  {name: 'Extreme', emoji: '⚡', hp: 1.48, spd: 1.08, hearts: 8, cards: 3, glow: 0, mult: 1, bot: 1, blurb: 'A royal rush'},
  {name: 'Hardcore', emoji: '💀', hp: 1.75, spd: 1.14, hearts: 5, cards: 3, glow: 0, mult: 3, bot: 1, hardcore: true, blurb: '5 hearts, no hints, ×3 points'},
];

/* ---------- 🤴 suitors (hope = how long they keep trying; nobody gets hurt) ---------- */
const SUITORS = {
  sq: {name: 'Squire', icon: '👦', prop: '🪜', hp: 16, spd: 1.15, pts: 10, w: 1, climb: true, skill: '🪜 Love Ladder — climbs over walls'},
  kn: {name: 'Knight', icon: '🤺', prop: '💐', hp: 38, spd: 0.8, pts: 20, w: 2, charge: true, skill: '🛡️ Shield Charge — runs past the first trap'},
  bd: {name: 'Bard', icon: '🧑‍🎤', prop: '🎻', hp: 26, spd: 0.9, pts: 18, w: 1, lull: true, skill: '🎻 Lute Lullaby — the Dragon gets sleepy'},
  pr: {name: 'Prince', icon: '🤴', prop: '🌹', hp: 46, spd: 0.92, pts: 28, w: 2, serenade: true, bomb: true, skill: '🎵 Serenade slows towers · 💐 Flower Bomb turns a tower off'},
  cu: {name: 'Cupid Archer', icon: '👼', prop: '🏹', hp: 22, spd: 1.25, pts: 22, w: 1, arrow: true, skill: '💘 Love Arrow — one princess skill waits longer'},
  wz: {name: 'Wizard', icon: '🧙', prop: '🧪', hp: 30, spd: 0.95, pts: 24, w: 1, potion: true, skill: '🧪 Love Potion — charms one of your helpers to walk with the suitors'},
  kg: {name: 'King', icon: '🤴', prop: '📜', hp: 72, spd: 0.68, pts: 40, w: 3, decree: true, skill: '📜 Royal Decree — every suitor gets faster + a shield'},
  gc: {name: 'Gift Cart', icon: '🎁', prop: '🎁', front: '🛒', hp: 56, spd: 0.74, pts: 26, w: 2, cart: true, skill: '🍫 Chocolate Cart — your helpers nearby stop to eat'},
  mo: {name: 'Charmed Helper', icon: '🐭', emoji: '🐭', hp: 9, spd: 1.3, pts: 4, w: 1, skill: '💘 Under a love potion — bonk it and it wakes up'},
  gd: {name: 'Wedding Guard', icon: '💂', prop: '🔔', hp: 28, spd: 0.95, pts: 15, w: 1, skill: '🔔 Rings the wedding bell'},
  boss1: {name: 'Sir Bouquet', icon: '🤺', prop: '💐', hp: 520, spd: 0.42, pts: 400, w: 6, boss: true, size: 1.8, bouquet: true, skill: '💐 Throws bouquets at the Dragon + calls squires'},
  boss2: {name: 'Sir Shiny', icon: '🤺', prop: '✨', hp: 720, spd: 0.42, pts: 550, w: 6, boss: true, size: 1.9, shine: true, skill: '✨ Shiny armour blocks hits + dazzles the Princess'},
  boss3: {name: 'Prince Charmless', icon: '🤴', prop: '🌹', hp: 860, spd: 0.42, pts: 700, w: 6, boss: true, size: 1.9, serenadeAll: true, skill: '🎵 Grand Serenade turns every tower off + 💋 blows kisses at the Dragon'},
  boss4: {name: 'Archmage Crush', icon: '🧙', prop: '🔮', hp: 1000, spd: 0.4, pts: 850, w: 6, boss: true, size: 1.95, archmage: true, skill: '🧪 Potion Rain charms your helpers + 🌀 blinks forward'},
  boss5: {name: 'King Goldbeard', icon: '🤴', prop: '💰', hp: 1200, spd: 0.38, pts: 1000, w: 7, boss: true, size: 2.05, goldbeard: true, skill: '📜 Royal Decree for everyone + 💰 hires squires with gold'},
  boss6: {name: 'Emperor Heartthrob', icon: '🤴', prop: '💘', hp: 1500, spd: 0.38, pts: 1400, w: 8, boss: true, size: 2.15, emperor: true, skill: '💘 Uses every trick — and calls a heart parade when he gets tired'},
  groom: {name: 'The Groom', icon: '🤵', prop: '💍', hp: 520, spd: 0.46, pts: 500, w: 6, boss: true, size: 1.85, groom: true, skill: '💍 Throws the ring at the Dragon + calls the guards'},
};

/* ---------- 📖 books + chapters ---------- */
// group = [type, count, path (-1 = take turns), gap seconds, start second]
const PATHS = {
  west: [[-0.6, 4], [3, 4], [3, 11], [5.5, 11], [5.5, 8], [6.75, 8]],
  east: [[16.6, 12], [13, 12], [13, 5], [10.5, 5], [10.5, 8], [9.25, 8]],
  south: [[8, 16.6], [8, 14.2], [11.5, 14.2], [11.5, 10.8], [8.6, 10.8], [8, 9.25]],
  north: [[8, -0.3], [8, 2], [4.6, 2], [4.6, 6.2], [7.2, 6.2], [8, 6.75]],
};
const BOOKS = {
  draprincess: {
    id: 'draprincess', board: 'td-draprincess', title: 'Dra-Princess Diary', icon: '🐉👑', heroes: ['dragon', 'princess'],
    chapters: [
      {n: 1, title: 'The Lonely Tower', boss: 'boss1', paths: ['west', 'east'], scene: 'meadow', waves: [
        [['sq', 4, -1, 1.7, 0]],
        [['sq', 6, -1, 1.3, 0]],
        [['sq', 4, 0, 1.2, 0], ['kn', 2, 1, 2.6, 2]],
        [['kn', 3, -1, 2, 0], ['sq', 4, -1, 1.1, 3]],
        [['sq', 8, -1, 0.9, 0], ['bd', 1, 0, 0, 5]],
        [['kn', 4, -1, 1.6, 0], ['bd', 2, -1, 4, 2]],
        [['sq', 10, -1, 0.75, 0], ['kn', 3, -1, 2, 4]],
        [['kn', 6, -1, 1.25, 0], ['bd', 2, -1, 3, 3], ['sq', 6, -1, 0.8, 6]],
        [['sq', 12, -1, 0.6, 0], ['kn', 5, -1, 1.3, 3], ['bd', 3, -1, 2.5, 5]],
        [['boss1', 1, 0, 0, 0], ['sq', 8, -1, 1.3, 3], ['kn', 4, 1, 3, 8]],
      ]},
      {n: 2, title: 'A Dragon at My Window', boss: 'boss2', paths: ['west', 'east', 'south'], scene: 'sunset', waves: [
        [['sq', 6, -1, 1.2, 0]],
        [['kn', 3, -1, 2, 0], ['pr', 1, 2, 0, 4]],
        [['sq', 8, -1, 0.9, 0], ['cu', 1, 2, 0, 3]],
        [['kn', 4, -1, 1.5, 0], ['pr', 2, -1, 3, 2]],
        [['sq', 10, -1, 0.7, 0], ['bd', 2, -1, 3, 2], ['cu', 1, -1, 0, 5]],
        [['kn', 6, -1, 1.2, 0], ['pr', 2, -1, 3, 3]],
        [['sq', 12, -1, 0.6, 0], ['cu', 2, -1, 3, 2], ['bd', 2, -1, 3, 4]],
        [['kn', 8, -1, 1, 0], ['pr', 3, -1, 2.5, 3], ['cu', 1, -1, 0, 6]],
        [['sq', 14, -1, 0.5, 0], ['kn', 6, -1, 1.1, 2], ['pr', 2, -1, 3, 5], ['cu', 2, -1, 3, 6], ['bd', 2, -1, 3, 7]],
        [['boss2', 1, 2, 0, 0], ['pr', 3, -1, 2.4, 3], ['kn', 6, -1, 1.4, 6]],
      ]},
      {n: 3, title: 'Princes Everywhere', boss: 'boss3', paths: ['west', 'east', 'north'], scene: 'roses', hp: 0.86, waves: [
        [['pr', 2, -1, 2, 0], ['sq', 3, -1, 1.2, 1]],
        [['kn', 3, -1, 1.6, 0], ['cu', 1, 2, 0, 2]],
        [['pr', 3, -1, 1.7, 0], ['bd', 1, -1, 0, 3]],
        [['sq', 8, -1, 0.7, 0], ['pr', 2, 2, 2.5, 3]],
        [['wz', 2, -1, 3, 0], ['kn', 4, -1, 1.3, 1]],
        [['pr', 4, -1, 1.4, 0], ['cu', 2, -1, 2.4, 2]],
        [['sq', 10, -1, 0.6, 0], ['wz', 2, -1, 3, 2], ['bd', 2, -1, 3, 4]],
        [['kn', 6, -1, 1.1, 0], ['pr', 3, -1, 2, 2], ['cu', 2, -1, 2.5, 5]],
        [['pr', 6, -1, 1, 0], ['wz', 2, -1, 2.4, 2], ['sq', 8, -1, 0.55, 4]],
        [['boss3', 1, 2, 0, 0], ['pr', 3, -1, 2.2, 3], ['cu', 2, -1, 2.5, 6], ['kn', 4, -1, 1.6, 9]],
      ]},
      {n: 4, title: 'The Dragon Heart', boss: 'boss4', paths: ['north', 'south', 'east'], scene: 'moon', hp: 0.8, waves: [
        [['wz', 1, 0, 0, 0], ['sq', 5, -1, 1.1, 1]],
        [['kn', 4, -1, 1.5, 0], ['gc', 1, 0, 0, 3]],
        [['wz', 2, -1, 2.2, 0], ['pr', 2, -1, 2.2, 2]],
        [['sq', 10, -1, 0.6, 0], ['cu', 2, -1, 2.5, 3]],
        [['gc', 2, -1, 3, 0], ['kn', 5, -1, 1.2, 1], ['wz', 1, -1, 0, 4]],
        [['pr', 4, -1, 1.3, 0], ['bd', 2, -1, 2.5, 2], ['wz', 2, -1, 3, 5]],
        [['sq', 12, -1, 0.55, 0], ['gc', 2, -1, 3, 3], ['cu', 2, -1, 2.5, 5]],
        [['kn', 7, -1, 1, 0], ['wz', 3, -1, 2, 2], ['pr', 2, -1, 2, 5]],
        [['wz', 4, -1, 1.6, 0], ['gc', 2, -1, 2.6, 2], ['sq', 10, -1, 0.5, 4], ['pr', 2, -1, 2, 7]],
        [['boss4', 1, 0, 0, 0], ['wz', 3, -1, 2.4, 3], ['kn', 5, -1, 1.4, 6], ['gc', 2, -1, 3, 9]],
      ]},
      {n: 5, title: 'Kings Come Knocking', boss: 'boss5', paths: ['west', 'east', 'south', 'north'], scene: 'gold', hp: 0.64, waves: [
        [['kn', 2, -1, 1.8, 0], ['sq', 4, -1, 1.2, 1]],
        [['kg', 1, 0, 0, 0], ['kn', 3, -1, 1.7, 1]],
        [['gc', 2, -1, 2.4, 0], ['pr', 3, -1, 1.8, 2]],
        [['sq', 10, -1, 0.62, 0], ['wz', 2, -1, 2.6, 3]],
        [['kg', 1, -1, 0, 0], ['kn', 6, -1, 1.1, 1], ['cu', 2, -1, 2.5, 4]],
        [['pr', 5, -1, 1.2, 0], ['gc', 2, -1, 2.6, 2], ['bd', 2, -1, 2.6, 4]],
        [['sq', 12, -1, 0.55, 0], ['kg', 2, -1, 4, 3], ['wz', 2, -1, 2.4, 5]],
        [['kn', 8, -1, 0.9, 0], ['pr', 4, -1, 1.6, 2], ['gc', 2, -1, 2.8, 5]],
        [['kg', 2, -1, 3.5, 0], ['wz', 4, -1, 1.7, 2], ['sq', 12, -1, 0.45, 3], ['cu', 3, -1, 2, 6]],
        [['boss5', 1, 2, 0, 0], ['kn', 6, -1, 1.3, 3], ['kg', 1, -1, 0, 7], ['gc', 2, -1, 3, 9]],
      ]},
      {n: 6, title: 'Happily Ever Dragon', boss: 'boss6', paths: ['west', 'east', 'south', 'north'], scene: 'festival', hp: 0.56, waves: [
        [['pr', 3, -1, 1.6, 0], ['cu', 2, -1, 2.2, 2]],
        [['kn', 6, -1, 1.1, 0], ['wz', 2, -1, 2.4, 2]],
        [['kg', 1, -1, 0, 0], ['gc', 2, -1, 2.4, 1], ['sq', 8, -1, 0.6, 2]],
        [['pr', 5, -1, 1.2, 0], ['bd', 3, -1, 2.2, 2], ['cu', 2, -1, 2.4, 4]],
        [['wz', 4, -1, 1.6, 0], ['kn', 7, -1, 1, 2], ['gc', 2, -1, 3, 5]],
        [['sq', 12, -1, 0.52, 0], ['kg', 2, -1, 3.5, 2], ['pr', 3, -1, 1.8, 5]],
        [['kn', 9, -1, 0.85, 0], ['wz', 4, -1, 1.7, 2], ['cu', 3, -1, 2, 4], ['gc', 2, -1, 2.8, 6]],
        [['pr', 6, -1, 1.1, 0], ['kg', 2, -1, 3.5, 2], ['bd', 3, -1, 2.4, 4], ['sq', 9, -1, 0.55, 6]],
        [['kn', 10, -1, 0.8, 0], ['wz', 4, -1, 1.6, 2], ['kg', 2, -1, 3.5, 4], ['pr', 5, -1, 1.4, 6], ['cu', 3, -1, 2, 7]],
        [['boss6', 1, 3, 0, 0], ['pr', 5, -1, 1.8, 3], ['kg', 1, -1, 0, 6], ['wz', 4, -1, 2.2, 8], ['kn', 6, -1, 1.4, 11]],
      ]},
    ],
    // 💍 Jailbreak — the funny loss chapter: the Princess is taken to a wedding, the Dragon breaks out of jail (Dragon picks only, 2 a wave)
    jail: {n: 'J', title: 'Jailbreak!', boss: 'groom', paths: ['west', 'east', 'south'], scene: 'chapel', jail: true, hp: 0.72, waves: [
      [['gd', 5, -1, 1.2, 0]],
      [['gd', 6, -1, 1, 0], ['sq', 4, -1, 1, 2]],
      [['gd', 8, -1, 0.85, 0], ['kn', 3, -1, 2, 2]],
      [['gd', 9, -1, 0.75, 0], ['bd', 2, -1, 3, 2], ['kn', 3, -1, 2, 4]],
      [['groom', 1, 0, 0, 0], ['gd', 8, -1, 1.1, 3]],
    ]},
  },
};
function buildPath(pts){
  const seg = []; let len = 0;
  for(let i = 1; i < pts.length; i++){ const a = pts[i - 1], b = pts[i], l = dist(a[0], a[1], b[0], b[1]); seg.push({a, b, l, s: len}); len += l; }
  return {pts, seg, len};
}
function ptAt(P, d){
  d = clamp(d, 0, P.len); for(const s of P.seg){ if(d <= s.s + s.l || s === P.seg[P.seg.length - 1]){ const f = s.l ? (d - s.s) / s.l : 0;
    return {x: s.a[0] + (s.b[0] - s.a[0]) * f, y: s.a[1] + (s.b[1] - s.a[1]) * f, ang: Math.atan2(s.b[1] - s.a[1], s.b[0] - s.a[0])}; } }
  return {x: CX, y: CY, ang: 0};
}

/* ---------- 🧬 hero packs (SkillKit engines, our names) ---------- */
// 🎨 each skill's SkillKit look (sk-2) — the pick card preview, the button and the cast on the map all wear it
const TD_LOOKS = {
  dragon: {a_cone: 'fire', a_bounce: 'fire', a_tornado: 'fire', a_meteor: 'lava', pa_power: 'fire', pa_rate: 'wind', pa_crit: 'star', pa_burn: 'fire', b_minion: 'sun', b_gold: 'gold', b_haste: 'wind', pb_gold: 'gold', pb_cd: 'sun',
    c_lava: 'lava', c_mine: 'sun', c_pit: 'rock', pc_big: 'rock', pc_more: 'sun', d_armor: 'crystal', d_shield: 'holy', pd_regen: 'nature', pd_armor: 'steel', e_push: 'wind', e_sleep: 'dream', e_fear: 'shadow', e_pull: 'cosmic', pe_long: 'dream',
    u_meteor: 'love', u_army: 'fire', u_field: 'sun', u_fort: 'holy', u_charm: 'love', x_burst: 'love', x_guard: 'holy', x_wall: 'candy'},
  princess: {a_whip: 'honey', a_swarm: 'paper', a_storm: 'blossom', a_shot: 'star', pa_power: 'honey', pa_rate: 'wind', b_tower: 'rose', b_minion: 'candy', b_flyer: 'paper', b_wall: 'candy', b_decoy: 'candy', pb_summon: 'love', pb_range: 'moon', pb_cd: 'sun',
    c_spikes: 'thorn', c_net: 'honey', c_splash: 'water', pc_more: 'thorn', pc_quick: 'nature', d_reflect: 'crystal', d_shield: 'holy', d_heal: 'nature', d_dome: 'bubble', pd_thorns: 'rose', pd_last: 'star',
    e_daze: 'love', e_push: 'music', e_sleep: 'dream', e_ew: 'goo', e_charm: 'love', pe_slow: 'ice', pe_flee: 'ghost', u_meteor: 'rose', u_army: 'rainbow', u_field: 'thorn', u_fort: 'holy', u_charm: 'love', x_burst: 'love', x_guard: 'holy', x_wall: 'candy'},
};
/* 🎬 act-2: the REAL move of every skill (Aowu 2026-11-17 plan §iso-2) — 🐉 dragon moves = the page's TDDragon beat moves ·
   👸 princess moves = 🎬 ActionFX / 🎭 actions-block acts (SkillKit.actionOf reads skin.act) · _basic = the auto attack */
const TD_MOVES = {
  dragon: {_basic: 'spit', a_cone: 'breath', a_bounce: 'spit', a_tornado: 'wing', a_meteor: 'sky', b_minion: 'roar', b_gold: 'tail', b_haste: 'wing',
    c_lava: 'breath', c_mine: 'tail', c_pit: 'tail', d_armor: 'roar', d_shield: 'wing', e_push: 'wing', e_sleep: 'breath', e_fear: 'roar', e_pull: 'roar',
    u_meteor: 'sky', u_army: 'roar', u_field: 'tail', u_fort: 'wing', u_charm: 'breath', x_burst: 'breath', x_guard: 'wing', x_wall: 'tail'},
  princess: {_basic: 'move.slash.across', a_whip: 'act.whip', a_swarm: 'move.cast.wide', a_storm: 'move.cast.rain', a_shot: 'move.punch.palm',
    b_tower: 'move.cast.raise', b_minion: 'act.summon', b_flyer: 'move.cast.skycall', b_wall: 'move.defend.brace', b_decoy: 'move.cast.snap',
    c_spikes: 'move.cast.slam', c_net: 'move.cast.spin', c_splash: 'move.cast.orbthrow', d_reflect: 'move.defend.parry', d_shield: 'act.shield', d_heal: 'act.heal',
    d_dome: 'move.defend.bubble', e_daze: 'move.cast.blast', e_push: 'move.cast.sweep', e_sleep: 'move.cast.orb', e_ew: 'move.kick.front', e_charm: 'move.cast.beam',
    u_meteor: 'move.power.ultimate', u_army: 'move.power.victory', u_field: 'move.cast.rune', u_fort: 'move.cast.staff', u_charm: 'move.cast.pray',
    x_burst: 'move.power.combo', x_guard: 'move.power.aura', x_wall: 'move.power.levelup'}};
const withLooks = (h, items) => items.map(it => Object.assign({look: TD_LOOKS[h][it.key]}, TD_MOVES[h][it.key] ? {[h === 'dragon' ? 'move' : 'act']: TD_MOVES[h][it.key]} : null, it));
const PACKS = {
  dragon: SK.pack('td-draprincess:dragon', withLooks('dragon', [
    {key: 'a_cone', name: 'Fire Breath', icon: '🔥'}, {key: 'a_bounce', name: 'Bounce Fireball', icon: '🔁'}, {key: 'a_tornado', name: 'Fire Tornado', icon: '🌀'}, {key: 'a_meteor', name: 'Sky Fire', icon: '☄️'},
    {key: 'pa_power', name: 'Hotter Fire', icon: '🌶️'}, {key: 'pa_rate', name: 'Quick Wings', icon: '🪽'}, {key: 'pa_crit', name: 'Lucky Flame', icon: '🍀'}, {key: 'pa_burn', name: 'Ember Scales', icon: '♨️'},
    {key: 'b_minion', name: 'Baby Dragons', icon: '🐣', desc: '{cnt} baby dragons hop out and block the path ({hp} toughness).'}, {key: 'b_gold', name: 'Hoard Gold', icon: '💰'}, {key: 'b_haste', name: 'Dragon Dash', icon: '💨'},
    {key: 'pb_gold', name: 'Shiny Hoard', icon: '🪙'}, {key: 'pb_cd', name: 'Warm Up', icon: '⏱️'},
    {key: 'c_lava', name: 'Lava Floor', icon: '🌋'}, {key: 'c_mine', name: 'Egg Mines', icon: '🥚'}, {key: 'c_pit', name: 'Claw Pit', icon: '🕳️'}, {key: 'pc_big', name: 'Big Claws', icon: '⭕'}, {key: 'pc_more', name: 'More Eggs', icon: '➕'},
    {key: 'd_armor', name: 'Scale Aura', icon: '🐉'}, {key: 'd_shield', name: 'Wing Shield', icon: '🪽'}, {key: 'pd_regen', name: 'Warm Nest', icon: '🪺'}, {key: 'pd_armor', name: 'Thick Scales', icon: '🧥'},
    {key: 'e_push', name: 'Wing Gust', icon: '🌪️'}, {key: 'e_sleep', name: 'Sleepy Smoke', icon: '💤'}, {key: 'e_fear', name: 'Roar', icon: '🦁', desc: 'ROAR! They run away for {dur}s.'}, {key: 'e_pull', name: 'Big Inhale', icon: '🧲'}, {key: 'pe_long', name: 'Long Smoke', icon: '⏳'},
    {key: 'u_meteor', name: 'Heart Meteor', icon: '❤️‍🔥'}, {key: 'u_army', name: 'Baby Dragon Swarm', icon: '🐲'}, {key: 'u_field', name: 'Egg Field', icon: '🥚'}, {key: 'u_fort', name: 'Dragon Hug', icon: '🫂'}, {key: 'u_charm', name: 'Dragon Charm', icon: '💘'},
    {key: 'x_burst', name: 'Love Flame', icon: '💞'}, {key: 'x_guard', name: 'Wing Hug', icon: '🤝'}, {key: 'x_wall', name: 'Egg + Thorn Party', icon: '🎆'},
  ])),
  princess: SK.pack('td-draprincess:princess', withLooks('princess', [
    {key: 'a_whip', name: 'Hair Power', icon: '💇‍♀️', desc: 'Her hair grows and whips them off the path: {dmg} hope.'}, {key: 'a_swarm', name: 'Paper Birds', icon: '🕊️', desc: '{cnt} diary paper birds hit for {dmg} hope.'}, {key: 'a_storm', name: 'Rose Petal Storm', icon: '🌹'}, {key: 'a_shot', name: 'Royal Slap', icon: '👋'},
    {key: 'pa_power', name: 'Strong Hair', icon: '💪'}, {key: 'pa_rate', name: 'Fast Swats', icon: '⏩'},
    {key: 'b_tower', name: 'Rose Tower', icon: '🗼', desc: 'Builds a tower next to hers that shoots roses for {dur}s.'}, {key: 'b_minion', name: 'Castle Mice', icon: '🐭'}, {key: 'b_flyer', name: 'Dove Friends', icon: '🕊️'}, {key: 'b_wall', name: 'Wardrobe Wall', icon: '👗'}, {key: 'b_decoy', name: 'Tea Party Table', icon: '🫖', desc: 'Suitors stop for tea and cake for {dur}s.'},
    {key: 'pb_summon', name: 'Royal Friends', icon: '💖'}, {key: 'pb_range', name: 'Tower View', icon: '🔭'}, {key: 'pb_cd', name: 'Busy Princess', icon: '⏱️'},
    {key: 'c_spikes', name: 'Thorn Garden', icon: '🌹'}, {key: 'c_net', name: 'Hair Net', icon: '🧶'}, {key: 'c_splash', name: 'Moat Splash', icon: '🐸'}, {key: 'pc_more', name: 'More Thorns', icon: '➕'}, {key: 'pc_quick', name: 'Garden Gloves', icon: '🧤'},
    {key: 'd_reflect', name: 'Mirror of "NO!"', icon: '🪞'}, {key: 'd_shield', name: 'Tower Shield', icon: '🏰'}, {key: 'd_heal', name: 'Heal the Tower', icon: '💚'}, {key: 'd_dome', name: 'Bubble Tower', icon: '🫧'},
    {key: 'pd_thorns', name: 'Rose Walls', icon: '🌹'}, {key: 'pd_last', name: 'Lucky Locket', icon: '🍀'},
    {key: 'e_daze', name: 'Heart Flash', icon: '💞', desc: 'Mini hearts flash — suitors stop in a daze for {dur}s.'}, {key: 'e_push', name: 'Bell of Rejection', icon: '🔔'}, {key: 'e_sleep', name: 'Perfume Cloud', icon: '💤'}, {key: 'e_ew', name: 'Ew, NO!', icon: '😝'}, {key: 'e_charm', name: 'Wink', icon: '😉', desc: '{cnt} suitors fall for a FRIEND instead and walk back bonking the others ({dur}s).'},
    {key: 'pe_slow', name: 'Icy Stare', icon: '🧊'}, {key: 'pe_flee', name: 'Scary Face', icon: '👻'},
    {key: 'u_meteor', name: 'Rose Meteor', icon: '🌹'}, {key: 'u_army', name: 'Royal Parade', icon: '🎉'}, {key: 'u_field', name: 'Thorn Kingdom', icon: '🌵'}, {key: 'u_fort', name: 'Sage Fortress', icon: '🏯'}, {key: 'u_charm', name: 'Love Storm', icon: '💘'},
    {key: 'x_burst', name: 'Love Flame', icon: '💞'}, {key: 'x_guard', name: 'Wing Hug', icon: '🤝'}, {key: 'x_wall', name: 'Egg + Thorn Party', icon: '🎆'},
  ])),
  suitors: SK.pack('td-draprincess:suitors', [
    {key: 'en_hope', name: 'Love Letters', icon: '💌'}, {key: 'en_speed', name: 'Running Shoes', icon: '👟'}, {key: 'en_armor', name: 'Shiny Armour', icon: '🛡️'},
    {key: 'en_heal', name: 'Cheer Up', icon: '💗'}, {key: 'en_rush', name: 'Royal Rush', icon: '🏇'}, {key: 'en_shield', name: 'Bouquet Shields', icon: '💐'},
    {key: 'en_jam', name: 'Love Song', icon: '🎶'}, {key: 'en_more', name: 'Bring Friends', icon: '👥'}, {key: 'en_trapdodge', name: 'Hop Over', icon: '🦘'},
  ]),
};
const COMBOS = [{key: 'x_burst', cols: ['A', 'E'], name: '💞 Love Flame'}, {key: 'x_guard', cols: ['D', 'B'], name: '🤝 Wing Hug'}, {key: 'x_wall', cols: ['C', 'A'], name: '🎆 Egg + Thorn Party'}];
const HEROES = {
  dragon: {name: 'Dragon', icon: '🐉', forms: ['Hatchling', 'Fire Wyrm', 'Heart Dragon'], formIcons: ['🐲', '🐉', '🐉'], dmg: 8, rate: 0.95, range: 6},
  princess: {name: 'Princess', icon: '👸', forms: ['Princess', 'Dragon-Heart Princess', 'Sage of the Tower'], formIcons: ['👸', '👸', '🧙‍♀️'], dmg: 10, rate: 1.25, range: 2.9},
};

/* ---------- a new match ---------- */
function newMatch(o){
  o = o || {}; const B = BOOKS[o.book || 'draprincess'], C = o.jail ? B.jail : B.chapters[(o.chapter || 1) - 1], L = LEVELS[clamp(o.level | 0, 0, 5)];
  const rng = rngOf(o.seed != null ? o.seed : (Date.now() & 0xffffff));
  const M = {B, C, L, lvl: clamp(o.level | 0, 0, 5), rng, t: 0, wt: 0, wave: -1, state: 'pick', queue: [], paused: false, speed: 1,
    paths: C.paths.map(k => buildPath(PATHS[k])), enemies: [], towers: [], minions: [], flyers: [], traps: [], zones: [], walls: [], decoys: [], fx: [], ev: [],
    jail: !!C.jail, from: o.from || null, hearts: L.hearts + (o.bonusHearts | 0), heartsMax: L.hearts + (o.bonusHearts | 0), bonusHearts: o.bonusHearts | 0, shieldHp: 0, shieldT: 0, domeT: 0, armorT: 0, armorV: 0, reflectN: 0, reflectT: 0, hasteT: 0, hasteV: 0, lastUsed: 0,
    score: 0, spawnQ: [], idN: 1, cd: {dragon: {}, princess: {}}, readyT: {dragon: {}, princess: {}}, jam: {dragon: {}, princess: {}}, auto: {dragon: !!o.auto, princess: !!o.auto},
    heroes: {dragon: {x: CX + 2.55, y: CY, ang: 0, atk: 0.5, dazeT: 0, sleepy: 0}, princess: {x: CX, y: CY - 0.25, atk: 0.8, dazeT: 0}},
    stats: {bonks: 0, waves: 0, evolves: 0, ultimates: 0, combos: 0, perfect: 0, casts: 0, hearts: 0}, lostThisWave: 0, enCd: {}, mods: {}, pend: {dragon: [], princess: []}, instant: !!o.instant};
  const glowN = L.glow;
  M.trees = {
    dragon: SK.tree({pack: PACKS.dragon, hero: 'dragon', forms: HEROES.dragon.forms, cards: L.cards, glow: glowN > 0, rng, combos: COMBOS}),
    princess: SK.tree({pack: PACKS.princess, hero: 'princess', forms: HEROES.princess.forms, cards: L.cards, glow: glowN > 0, rng, combos: COMBOS}),
    suitors: SK.tree({pack: PACKS.suitors, hero: 'suitors', forms: ['Suitors', 'Royal Guard', "The King's Army"], cards: 3, rng, bot: true}),
  };
  M.trees.dragon.partner = M.trees.princess; M.trees.princess.partner = M.trees.dragon;
  M.glowLeft = glowN;
  M.spots = buildSpots(M);
  M.queue = pickQueue(M);
  refreshMods(M);
  return M;
}
function buildSpots(M){
  const out = [];
  for(let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2, x = CX + Math.cos(a) * 2.5, y = CY + Math.sin(a) * 2.5;
    let near = 9; M.paths.forEach(P => { for(let d = 0; d <= P.len; d += 0.4){ const p = ptAt(P, d); near = Math.min(near, dist(p.x, p.y, x, y)); } });
    if(near > 0.75) out.push({x, y, used: false}); }
  return out;
}
// who picks before a wave: both heroes — in 💍 Jailbreak only the Dragon, twice (the Princess is locked in the chapel)
function pickQueue(M){ return (M.jail ? ['dragon', 'dragon'] : ['dragon', 'princess']).filter(h => M.trees[h].tier < 10); }
function refreshMods(M){ ['dragon', 'princess', 'suitors'].forEach(h => { M.mods[h] = M.trees[h].mods(); }); }
function ev(M, k, o){ M.ev.push(Object.assign({k, t: M.t}, o || {})); }
function fx(M, k, o){ M.fx.push(Object.assign({k, t: 0, dur: 0.5}, M._src ? {sk: M._src} : null, o)); }   // sk = the skill that made it (its 🎨 look)
function takeEvents(M){ const e = M.ev; M.ev = []; return e; }

/* ---------- picks (the game PAUSES: state 'pick' = nothing moves) ---------- */
function offer(M){
  if(M.state !== 'pick' || !M.queue.length) return null;
  const h = M.queue[0], T = M.trees[h];
  T.glow = M.glowLeft > 0;
  const o = T.offer(); if(!o){ M.queue.shift(); return offer(M); }
  return o;
}
function take(M, card){
  const h = M.queue[0], T = M.trees[h]; if(!h || !card) return;
  const ch = T.take(card);
  if(card.type === 'evolve'){ M.stats.evolves++; ev(M, 'evolve', {hero: h, form: T.form, col: card.col}); }
  if(card.type === 'ultimate'){ M.stats.ultimates++; ev(M, 'ultimate', {hero: h, key: card.key}); }
  if(card.type === 'combo'){ M.stats.combos++; ev(M, 'combo', {hero: h, key: card.key}); }
  ev(M, 'picked', {hero: h, card: card.key, type: card.type, col: card.col, tier: T.tier});
  M.queue.shift(); refreshMods(M);
  if(!M.queue.length){ if(M.glowLeft > 0) M.glowLeft--; M.state = 'break'; M.wt = 0; }
  return ch;
}
function startWave(M){
  if(M.state !== 'break') return false;
  M.wave++; M.state = 'wave'; M.wt = 0; M.lostThisWave = 0; M.spawnQ = [];
  const groups = M.C.waves[M.wave], more = M.mods.suitors.enMore || 0;
  groups.forEach(g => { const [type, n0, path, gap, at] = g, n = n0 + (SUITORS[type].boss ? 0 : Math.round(more));
    for(let i = 0; i < n; i++) M.spawnQ.push({type, at: at + i * gap, path: path < 0 ? i % M.paths.length : Math.min(path, M.paths.length - 1)}); });
  M.spawnQ.sort((a, b) => a.at - b.at);
  ev(M, 'wave', {n: M.wave + 1, of: M.C.waves.length, boss: groups.some(g => SUITORS[g[0]].boss)});
  return true;
}
function spawn(M, type, pi, d){
  const S = SUITORS[type], L = M.L, m = M.mods.suitors, wv = Math.max(0, M.wave);
  const hp = S.hp * L.hp * (1 + 0.09 * wv) * (1 + (m.enHp || 0)) * (M.C.hp || 1);   // C.hp: chapters with more roads have softer suitors
  const e = {id: M.idN++, type, S, pi, d: d || 0, hp, hpMax: hp, spd: S.spd * L.spd * (1 + (m.enSpeed || 0)), x: 0, y: 0, dir: 1,
    slowT: 0, slowF: 0, stunT: 0, rootT: 0, sleepT: 0, fearT: 0, confT: 0, confDir: 1, charmT: 0, burnT: 0, burnD: 0, stopT: 0, shield: 0, shine: 0,
    charge: S.charge ? 1 : 0, skT: 3 + M.rng() * 3, bombed: false, boss: !!S.boss, born: M.t, gone: 0};
  const p = ptAt(M.paths[pi], e.d); e.x = p.x; e.y = p.y; M.enemies.push(e);
  if(e.boss) ev(M, 'boss', {type, name: S.name});
  return e;
}

/* ---------- 🎯 helpers ---------- */
function live(M){ return M.enemies.filter(e => !e.gone && e.charmT <= 0); }
function heroPos(M, h){ const H = M.heroes[h]; return {x: H.x, y: H.y}; }
function progress(M, e){ return e.d / M.paths[e.pi].len; }
function bestPoint(M, ox, oy, range, r){
  const L = live(M).filter(e => dist(e.x, e.y, ox, oy) <= range); if(!L.length) return null;
  let best = null, bs = -1;
  L.forEach(c => { let s = 0; L.forEach(e => { if(dist(e.x, e.y, c.x, c.y) <= r) s += 1 + progress(M, e); }); if(s > bs){ bs = s; best = c; } });
  return best ? {x: best.x, y: best.y, e: best} : null;
}
function closest(M, ox, oy, range){ let best = null, bd = 1e9; live(M).forEach(e => { const d = dist(e.x, e.y, ox, oy); if(d <= range && (1 - progress(M, e)) * 4 + d < bd){ bd = (1 - progress(M, e)) * 4 + d; best = e; } }); return best; }
function busiestPath(M){ const c = M.paths.map(() => 0); live(M).forEach(e => { c[e.pi] += 1 + progress(M, e); }); let i = 0; c.forEach((v, j) => { if(v > c[i]) i = j; }); if(!live(M).length){ const q = M.spawnQ[0]; if(q) i = q.path; } return i; }
function heroMods(M, h){ return M.mods[h] || {}; }
function hit(M, e, dmg, src){
  if(!e || e.gone || e.charmT > 0) return;
  const hm = src && src.hero ? heroMods(M, src.hero) : {};
  if(src && src.hero){ dmg *= 1 + (hm.dmgMul || 0); if(src.col && hm['col' + src.col]) dmg *= 1 + hm['col' + src.col]; if(hm.crit && M.rng() < hm.crit){ dmg *= 2; fx(M, 'crit', {x: e.x, y: e.y, dur: 0.6}); } }
  if(e.shine > 0){ e.shine--; fx(M, 'ting', {x: e.x, y: e.y, dur: 0.4}); return; }
  dmg *= 1 - Math.min(0.6, M.mods.suitors.enArmor || 0);
  if(e.shield > 0){ const a = Math.min(e.shield, dmg); e.shield -= a; dmg -= a; }
  e.hp -= dmg; if(dmg >= 2) e.hitT = 0.14; if(e.sleepT > 0) e.sleepT = 0;
  if(src && src.hero){ if(hm.burnHit){ e.burnT = Math.max(e.burnT, 2); e.burnD = Math.max(e.burnD, hm.burnHit); } if(hm.slowHit){ e.slowT = Math.max(e.slowT, 1); e.slowF = Math.max(e.slowF, hm.slowHit); }
    if(hm.fearHit && !e.boss && M.rng() < hm.fearHit) e.fearT = Math.max(e.fearT, 0.8); }
  if(e.hp <= 0) bonk(M, e, src);
}
function bonk(M, e, src){
  if(e.gone) return; e.gone = 1; e.goneT = 0; e.flyA = (M.rng() * 2 - 1) * Math.PI; M.stats.bonks++;
  const pts = Math.round(e.S.pts * M.L.mult * (1 + (heroMods(M, 'dragon').goldMul || 0) + (heroMods(M, 'princess').goldMul || 0)));
  M.score += pts; ev(M, 'bonk', {type: e.type, x: e.x, y: e.y, pts, boss: e.boss, by: src && src.hero});
}
function durOf(M, h, v, col){ const m = heroMods(M, h); return v * (1 + (m.durMul || 0) * (col === 'E' ? 1 : 0.5)) * (1 + (col && m['col' + col] || 0)); }

/* ---------- 🪄 casting a SkillKit engine (one executor for every engine shape) ---------- */
function skillOf(M, h, key){ const T = M.trees[h], e = T.pack.get(key); if(!e) return null; const lv = (T.ult === key || T.combo === key) ? 1 : (T.skills[key] || 0); if(!lv) return null; return {e, lv, n: SK.num(e, lv)}; }
function cdOf(M, h, key){ const s = skillOf(M, h, key); if(!s) return 0; const m = heroMods(M, h); let cd = s.e.cd * (1 - Math.min(0.5, m.cdMul || 0)); if(s.e.shape === 'trap') cd *= 1 - Math.min(0.5, m.trapCd || 0); return cd; }
function ready(M, h, key){ return (M.cd[h][key] || 0) <= 0; }
function canAim(M, h, key){
  const s = skillOf(M, h, key); if(!s) return false; const sh = s.e.shape, L = live(M);
  if(sh === 'heal' || s.e.fx === 'heal') return M.hearts < M.heartsMax;
  if(sh === 'gold') return true;
  if(sh === 'shield' || sh === 'dome' || sh === 'reflect') return L.some(e => progress(M, e) > 0.55) || M.hearts < M.heartsMax * 0.5;
  if(sh === 'trap') return L.length > 0 || M.spawnQ.length > 0;
  // aimed skills wait until somebody is in reach (the button glows only when it can really hit)
  const m = heroMods(M, h), rg = (m.rangeMul || 0) + 1, o = h === 'dragon' ? heroPos(M, h) : {x: CX, y: CY}, n = s.n;
  const reach = sh === 'shot' || sh === 'bounce' || sh === 'chain' ? (n.range || 5) * rg + 2 : sh === 'cone' ? n.len * rg + 1 : sh === 'whip' || sh === 'beam' ? (n.len || 6) * rg + 1 : sh === 'splash' || sh === 'meteor' ? (n.r >= 50 ? 99 : 7 * rg) : 99;
  const from = sh === 'whip' || sh === 'beam' ? {x: CX, y: CY} : o;
  return L.some(e => dist(e.x, e.y, from.x, from.y) <= reach);
}
// every effect a cast makes remembers its skill (so the page paints it in that skill's 🎨 SkillKit look)
function cast(M, h, key, opt){ opt = opt || {}; if(!M.instant && !opt.now) return queueCast(M, h, key, opt); M._src = {hero: h, key}; try{ return castSkill(M, h, key, opt); } finally{ M._src = null; } }
/* ---------- 🎬 act-2: the game fires on CONTACT (Checklist §17) ----------
   cast() puts the skill in the hero's queue: 'windup' event {hero, key, move, at, w, aim} → the page plays the move with contactAt = at
   (engine time) → at `at` the skill really happens (castSkill) → 'cast' event. Nothing to hit any more at contact = 'fizzle' (cooldown back).
   Auto attacks wind up too (basic). WIND = seconds from the start of the move to its contact. */
const WIND = {breath: 0.34, spit: 0.24, sky: 0.4, wing: 0.3, roar: 0.4, tail: 0.3, cast: 0.3, big: 0.44, basicD: 0.2, basicP: 0.22, trick: 0.36};
function moveOf(M, h, key){ const e = M.trees[h].pack.get(key), sk = (e && e.skin) || {}; if(h === 'dragon') return sk.move || 'breath'; return e && (e.kind === 'ultimate' || e.kind === 'combo') ? 'big' : 'cast'; }
function windOf(M, h, key){ return WIND[moveOf(M, h, key)] || 0.3; }
function aimOf(M, h){ const o = h === 'dragon' ? heroPos(M, h) : {x: CX, y: CY}, t = closest(M, o.x, o.y, 99); return t ? {x: t.x, y: t.y} : null; }
function queueCast(M, h, key, opt){
  if(M.state !== 'wave' || M.paused) return false;
  const s = skillOf(M, h, key); if(!s || !ready(M, h, key)) return false;
  if(!opt.force && !canAim(M, h, key)) return false;
  const Q = M.pend[h], w = windOf(M, h, key), start = Math.max(M.t, Q.length ? Q[Q.length - 1].at + 0.12 : M.t), at = start + w;
  M.cd[h][key] = cdOf(M, h, key) + (M.jam[h][key] || 0) + (at - M.t); M.jam[h][key] = 0; M.stats.casts++;
  Q.push({key, start, at, w, move: moveOf(M, h, key), aim: aimOf(M, h), kind: s.e.kind, col: s.e.col, started: false});
  pendTick(M); return true;
}
function pendTick(M){
  ['dragon', 'princess'].forEach(h => { const Q = M.pend[h];
    while(Q.length){ const p = Q[0];
      if(!p.started && M.t >= p.start - 1e-9){ p.started = true; p.aim = aimOf(M, h) || p.aim; ev(M, 'windup', {hero: h, key: p.key, move: p.move, at: p.at, w: p.w, aim: p.aim, kind: p.kind, col: p.col}); }
      if(p.started && M.t >= p.at - 1e-9){ Q.shift(); contactCast(M, h, p); continue; }
      break; }
    const H = M.heroes[h], b = H.bw; if(b && M.t >= b.at - 1e-9){ H.bw = null; const rg = HEROES[h].range * (1 + (heroMods(M, h).rangeMul || 0)) + 1.5, o = h === 'dragon' ? H : {x: CX, y: CY};
      const t = live(M).find(e => e.id === b.id && dist(e.x, e.y, o.x, o.y) <= rg) || closest(M, o.x, o.y, rg); if(t) heroBasic(M, h, t); } });
}
function contactCast(M, h, p){ let ok = false; M._src = {hero: h, key: p.key}; try{ ok = castSkill(M, h, p.key, {force: true, pend: true}); } finally{ M._src = null; }
  if(!ok){ M.cd[h][p.key] = Math.min(M.cd[h][p.key] || 0, 0.5); M.stats.casts = Math.max(0, M.stats.casts - 1); ev(M, 'fizzle', {hero: h, key: p.key}); } }
// the auto attack itself (on its contact)
function heroBasic(M, h, t){
  if(h === 'dragon'){ const hd = M.heroes.dragon; fx(M, 'fireball', {x: hd.x, y: hd.y, x2: t.x, y2: t.y, dur: 0.28}); hit(M, t, HEROES.dragon.dmg, {hero: 'dragon', col: 'A'}); return; }
  fx(M, 'swat', {x: CX, y: CY, x2: t.x, y2: t.y, dur: 0.35}); hit(M, t, HEROES.princess.dmg, {hero: 'princess', col: 'A'}); if(!t.gone && !t.boss) t.d = Math.max(0, t.d - 0.35); }
function basicGo(M, h, t){ if(M.instant){ heroBasic(M, h, t); return; } const w = h === 'dragon' ? WIND.basicD : WIND.basicP; M.heroes[h].bw = {id: t.id, at: M.t + w};
  ev(M, 'windup', {hero: h, key: '_basic', basic: true, move: h === 'dragon' ? 'spit' : 'basic', at: M.t + w, w, aim: {x: t.x, y: t.y}}); }
function castSkill(M, h, key, opt){
  opt = opt || {};
  if(M.state !== 'wave' || M.paused) return false;
  const s = skillOf(M, h, key); if(!s || (!opt.pend && !ready(M, h, key))) return false;
  if(!opt.force && !canAim(M, h, key)) return false;
  const {e, n} = s, hp = heroPos(M, h), m = heroMods(M, h), rng = (m.rangeMul || 0) + 1, src = {hero: h, col: e.col, key};
  const D = v => durOf(M, h, v, e.col), sumMul = 1 + (m.summonMul || 0);
  let done = true;
  const origin = h === 'dragon' ? hp : {x: CX, y: CY};
  switch(e.shape){
    case 'shot': { const t = closest(M, origin.x, origin.y, (n.range || 5) * rng + 2); if(!t){ done = false; break; }
      if(e.fx === 'slowpush'){ t.slowT = D(n.dur); t.slowF = Math.max(t.slowF, n.slow); if(!t.boss) t.d = Math.max(0, t.d - n.push); fx(M, 'ew', {x: t.x, y: t.y, dur: 0.8}); }
      else { fx(M, 'bolt', {x: origin.x, y: origin.y, x2: t.x, y2: t.y, dur: 0.3, col: e.col}); hit(M, t, n.dmg, src); }
      break; }
    case 'cone': { const t = bestPoint(M, origin.x, origin.y, n.len * rng + 1, 1.2); if(!t){ done = false; break; } const ang = Math.atan2(t.y - origin.y, t.x - origin.x);
      live(M).forEach(x => { const dd = dist(x.x, x.y, origin.x, origin.y), a = Math.atan2(x.y - origin.y, x.x - origin.x); let da = Math.abs(a - ang); if(da > Math.PI) da = 2 * Math.PI - da;
        if(dd <= n.len * rng + 0.6 && da <= n.w * 0.6){ hit(M, x, n.dmg, src); if(n.dot){ x.burnT = D(n.dur); x.burnD = Math.max(x.burnD, n.dot); } } });
      fx(M, 'cone', {x: origin.x, y: origin.y, ang, len: n.len * rng, w: n.w, dur: 0.6, col: e.col}); break; }
    case 'bounce': case 'chain': { let t = closest(M, origin.x, origin.y, (n.range || 5) * rng + 2); if(!t){ done = false; break; } let px = origin.x, py = origin.y; const hitSet = new Set();
      for(let i = 0; i < Math.round(n.cnt) && t; i++){ fx(M, e.shape === 'chain' ? 'zap' : 'bolt', {x: px, y: py, x2: t.x, y2: t.y, dur: 0.3 + i * 0.06, col: e.col}); hit(M, t, n.dmg, src); hitSet.add(t.id); px = t.x; py = t.y;
        t = live(M).filter(x => !hitSet.has(x.id) && dist(x.x, x.y, px, py) < 3.2).sort((a, b) => dist(a.x, a.y, px, py) - dist(b.x, b.y, px, py))[0]; }
      break; }
    case 'splash': case 'meteor': { const big = n.r >= 50; const t = big ? {x: CX, y: CY} : bestPoint(M, origin.x, origin.y, 7 * rng, n.r); if(!t){ done = false; break; }
      M.zones.push({k: 'meteor', x: t.x, y: t.y, r: n.r, delay: e.shape === 'meteor' ? 0.9 : 0.05, dmg: n.dmg, stun: e.fx === 'dmgstun' ? D(n.dur) : 0, src, t: 0, dur: 1.2, big}); break; }
    case 'whip': case 'beam': { const t = bestPoint(M, CX, CY, (n.len || 6) * rng + 1, 1); if(!t){ done = false; break; } const ang = Math.atan2(t.y - CY, t.x - CX), len = (n.len || 6) * rng + 0.8, w = n.w || 0.7;
      live(M).forEach(x => { const dx = x.x - CX, dy = x.y - CY, along = dx * Math.cos(ang) + dy * Math.sin(ang), side = Math.abs(-dx * Math.sin(ang) + dy * Math.cos(ang));
        if(along > 0 && along <= len && side <= w){ hit(M, x, n.dmg, src); if(n.push && !x.boss && !x.gone) x.d = Math.max(0, x.d - n.push); } });
      fx(M, e.shape, {x: CX, y: CY, ang, len, w, dur: 0.55, col: e.col}); break; }
    case 'swarm': { const L = live(M); if(!L.length){ done = false; break; } for(let i = 0; i < Math.round(n.cnt); i++){ const t = L[Math.floor(M.rng() * L.length)]; fx(M, 'bird', {x: CX, y: CY - 1, x2: t.x, y2: t.y, dur: 0.5 + i * 0.05, col: e.col}); hit(M, t, n.dmg, src); } break; }
    case 'storm': { const t = bestPoint(M, CX, CY, 7 * rng, n.r); if(!t){ done = false; break; } M.zones.push({k: 'storm', x: t.x, y: t.y, r: n.r, dps: n.dmg, src, t: 0, dur: D(n.dur)}); break; }
    case 'tornado': { const pi = busiestPath(M), P = M.paths[pi]; M.zones.push({k: 'tornado', pi, d: P.len - 0.5, spd: 2.2, x: 0, y: 0, r: n.r, dps: n.dmg, src, t: 0, dur: D(n.dur)}); break; }
    case 'tower': { const spot = M.spots.filter(s => !s.used).sort((a, b) => spotScore(M, b) - spotScore(M, a))[0]; if(!spot){ done = false; break; } spot.used = true;
      M.towers.push({x: spot.x, y: spot.y, spot, dmg: n.dmg * sumMul, rate: n.rate, range: n.range * rng, t: 0, dur: D(n.dur), atk: 0.4, offT: 0, src}); fx(M, 'build', {x: spot.x, y: spot.y, dur: 0.7}); break; }
    case 'minion': { const all = e.kind === 'ultimate'; const ps = all ? M.paths.map((_, i) => i) : [busiestPath(M)];
      ps.forEach(pi => { const P = M.paths[pi]; for(let i = 0; i < Math.round(n.cnt / (all ? M.paths.length : 1)) || (i === 0 && all); i++) M.minions.push({pi, d: P.len - 0.3 - i * 0.5, hp: n.hp * sumMul, hpMax: n.hp * sumMul, dmg: n.dmg * sumMul, t: 0, dur: D(n.dur), x: 0, y: 0, icon: e.icon, src, fight: 0}); });
      fx(M, 'poof', {x: CX, y: CY, dur: 0.6}); break; }
    case 'flyer': { for(let i = 0; i < Math.round(n.cnt); i++) M.flyers.push({x: CX, y: CY - 0.5, t: 0, dur: D(n.dur), dmg: n.dmg * sumMul, rate: n.rate, atk: 0.2 + i * 0.15, icon: e.icon, src}); break; }
    case 'gold': { M.score += Math.round(n.gold * M.L.mult); heal(M, n.heal); fx(M, 'coins', {x: CX, y: CY, dur: 1}); ev(M, 'gold', {pts: Math.round(n.gold * M.L.mult)}); break; }
    case 'haste': M.hasteT = D(n.dur); M.hasteV = n.v; fx(M, 'haste', {x: CX, y: CY, dur: 0.8}); break;
    case 'decoy': { const pi = busiestPath(M), P = M.paths[pi], front = frontD(M, pi); const d = clamp(front + 1.2, 1, P.len - 2), p = ptAt(P, d); M.decoys.push({pi, d, x: p.x, y: p.y, r: n.r, t: 0, dur: D(n.dur) + 2}); fx(M, 'poof', {x: p.x, y: p.y, dur: 0.6}); break; }
    case 'wall': { const pi = busiestPath(M), P = M.paths[pi], d = clamp(Math.max(frontD(M, pi) + 0.8, P.len - 3.2), 1, P.len - 1.2), p = ptAt(P, d); M.walls.push({pi, d, x: p.x, y: p.y, ang: p.ang, hp: n.hp, hpMax: n.hp, t: 0, dur: D(n.dur), icon: e.icon}); fx(M, 'build', {x: p.x, y: p.y, dur: 0.7}); break; }
    case 'trap': { const every = !!n.every, ps = every ? M.paths.map((_, i) => i) : [busiestPath(M)], r = n.r * (1 + (m.trapRadius || 0));
      ps.forEach(pi => { const P = M.paths[pi], spots = every ? [P.len * 0.35, P.len * 0.7] : [clamp(frontD(M, pi) + 1.6, 1.2, P.len - 1.6)];
        spots.forEach(d => { const p = ptAt(P, d); M.traps.push({pi, d, x: p.x, y: p.y, r, fx: e.fx, n, charges: Math.round((n.charges || 1) + (m.trapCharges || 0)), life: D(n.life || n.dur || 20), t: 0, icon: e.icon, src, col: e.col}); }); });
      break; }
    case 'shield': if(e.fx === 'armor'){ M.armorT = D(n.dur); M.armorV = n.v; } else { M.shieldHp = Math.max(M.shieldHp, Math.round(n.hp)); M.shieldT = D(n.dur); } fx(M, 'shield', {x: CX, y: CY, dur: 0.8}); break;
    case 'heal': heal(M, n.heal); break;
    case 'reflect': M.reflectN = Math.round(n.cnt); M.reflectT = D(n.dur); M.reflectPush = n.push; fx(M, 'mirror', {x: CX, y: CY, dur: 0.8}); break;
    case 'dome': M.domeT = D(n.dur); if(n.heal) heal(M, n.heal); fx(M, 'dome', {x: CX, y: CY, dur: 0.8}); break;
    case 'daze': case 'sleep': case 'slow': case 'fear': case 'confuse': case 'pull': case 'push': {
      const area = e.shape === 'push' ? {x: CX, y: CY} : bestPoint(M, CX, CY, 7.5 * rng, n.r); if(!area){ done = false; break; }
      const R = n.r * (e.shape === 'push' ? rng : 1);
      live(M).filter(x => dist(x.x, x.y, area.x, area.y) <= R).forEach(x => {
        const bossCut = x.boss ? 0.4 : 1;
        if(e.shape === 'daze') x.stunT = Math.max(x.stunT, D(n.dur) * bossCut);
        if(e.shape === 'sleep') x.sleepT = Math.max(x.sleepT, D(n.dur) * bossCut);
        if(e.shape === 'slow'){ x.slowT = Math.max(x.slowT, D(n.dur)); x.slowF = Math.max(x.slowF, n.slow); }
        if(e.shape === 'fear' && !x.boss) x.fearT = Math.max(x.fearT, D(n.dur));
        if(e.shape === 'confuse' && !x.boss) x.confT = Math.max(x.confT, D(n.dur));
        if(e.shape === 'push' && !x.boss) x.d = Math.max(0, x.d - n.push * (1 - progress(M, x) * 0.3));
        if(e.shape === 'pull'){ x.pullX = area.x; x.pullY = area.y; x.rootT = Math.max(x.rootT, D(n.dur) * bossCut); }
      });
      fx(M, e.shape, {x: area.x, y: area.y, r: R, dur: 0.8, col: e.col}); break; }
    case 'charm': { const L = live(M).filter(x => !x.boss).sort((a, b) => progress(M, b) - progress(M, a)); if(!L.length){ done = false; break; }
      L.slice(0, Math.round(n.cnt)).forEach(x => { x.charmT = D(n.dur); fx(M, 'heart', {x: x.x, y: x.y, dur: 0.9}); }); break; }
    default: done = false;
  }
  if(!done) return false;
  if(!opt.pend){ M.cd[h][key] = cdOf(M, h, key) + (M.jam[h][key] || 0); M.jam[h][key] = 0; M.stats.casts++; }
  ev(M, 'cast', {hero: h, key, col: e.col, kind: e.kind, name: e.name, icon: e.icon});
  return true;
}
function spotScore(M, s){ let v = 0; live(M).forEach(e => { const d = dist(e.x, e.y, s.x, s.y); if(d < 4) v += 4 - d; }); return v + M.rng() * 0.1; }
function frontD(M, pi){ let f = 0; live(M).forEach(e => { if(e.pi === pi) f = Math.max(f, e.d); }); return f; }
function heal(M, n){ const before = M.hearts; M.hearts = Math.min(M.heartsMax, M.hearts + Math.round(n)); if(M.hearts > before){ fx(M, 'heal', {x: CX, y: CY, dur: 1}); ev(M, 'heal', {n: M.hearts - before}); } }

/* ---------- ⏱️ the loop ---------- */
function step(M, dt){
  if(M.paused || M.state === 'pick' || M.state === 'won' || M.state === 'lost') return;
  dt = Math.min(0.1, dt) * (M.speed || 1);
  while(dt > 1e-6){ const s = Math.min(STEP, dt); tick(M, s); dt -= s; if(M.state !== 'wave' && M.state !== 'break') break; }
}
function tick(M, dt){
  M.t += dt; M.wt += dt;
  M.fx = M.fx.filter(f => (f.t += dt) < f.dur);
  if(M.state === 'break'){ if(M.wt >= (M.breakLen != null ? M.breakLen : 2.6)) startWave(M); return; }
  // 🦸 heroes
  const hd = M.heroes.dragon, hpz = M.heroes.princess, haste = M.hasteT > 0 ? 1 + M.hasteV : 1;
  if(M.hasteT > 0) M.hasteT -= dt;
  pendTick(M);   // 🎬 act-2: queued skills + auto attacks land on their contact
  hd.ang += dt * 0.55; const L0 = live(M); let tx = 0, ty = 0; L0.forEach(e => { tx += e.x - CX; ty += e.y - CY; });
  const want = L0.length ? Math.atan2(ty, tx) : hd.ang; let da = want - hd.ang; while(da > Math.PI) da -= 2 * Math.PI; while(da < -Math.PI) da += 2 * Math.PI; hd.ang += da * Math.min(1, dt * 0.8);
  hd.x = CX + Math.cos(hd.ang) * 2.55; hd.y = CY + Math.sin(hd.ang) * 2.4;
  hd.sleepy = L0.some(e => e.S.lull && dist(e.x, e.y, CX, CY) < 3.6) ? 1 : 0;
  if(hd.dazeT > 0) hd.dazeT -= dt; if(hpz.dazeT > 0) hpz.dazeT -= dt;
  const dm = heroMods(M, 'dragon'), pm = heroMods(M, 'princess');
  hd.atk -= dt * haste * (1 + (dm.rateMul || 0)) * (hd.sleepy ? 0.55 : 1);
  if(hd.atk <= 0 && hd.dazeT <= 0 && !hd.bw && !M.pend.dragon.length){ const t = closest(M, hd.x, hd.y, HEROES.dragon.range * (1 + (dm.rangeMul || 0))); if(t){ hd.atk = HEROES.dragon.rate; basicGo(M, 'dragon', t); } else hd.atk = 0.1; }
  hpz.atk -= dt * haste * (1 + (pm.rateMul || 0));
  if(!M.jail && hpz.atk <= 0 && hpz.dazeT <= 0 && !hpz.bw && !M.pend.princess.length){ const t = closest(M, CX, CY, HEROES.princess.range * (1 + (pm.rangeMul || 0))); if(t){ hpz.atk = HEROES.princess.rate; basicGo(M, 'princess', t); } else hpz.atk = 0.1; }
  // ⏳ cooldowns (haste speeds them up) + auto-cast
  ['dragon', 'princess'].forEach(h => { Object.keys(M.cd[h]).forEach(k => { if(M.cd[h][k] > 0) M.cd[h][k] -= dt * haste; });
    M.trees[h].buttons().forEach(b => { const rd = ready(M, h, b.key) && canAim(M, h, b.key); M.readyT[h][b.key] = rd ? (M.readyT[h][b.key] || 0) + dt : 0;
      // 🤖 auto skills (⚙️ switch) · 🌱 Basic / 🐣 Junior helper: a skill that waited ready for a while goes off by itself (nothing is wasted)
      if(rd && autoWants(M, h, b) && (M.auto[h] || (M.L.assist && M.readyT[h][b.key] >= M.L.assist))) cast(M, h, b.key); }); });
  // 🛡️ home timers
  if(M.shieldT > 0){ M.shieldT -= dt; if(M.shieldT <= 0) M.shieldHp = 0; } if(M.domeT > 0) M.domeT -= dt; if(M.armorT > 0) M.armorT -= dt; if(M.reflectT > 0){ M.reflectT -= dt; if(M.reflectT <= 0) M.reflectN = 0; }
  // 🚶 spawns
  while(M.spawnQ.length && M.spawnQ[0].at <= M.wt){ const q = M.spawnQ.shift(); spawn(M, q.type, q.path); }
  // 🤖 suitor-side skills (bot tree actives)
  enemySkills(M, dt);
  // 🤴 suitors move
  M.enemies.forEach(e => moveEnemy(M, e, dt));
  // 🗼 towers, 🐭 helpers, 🕊️ flyers, 🪤 traps, 🌪️ zones, 🧱 walls, 🫖 tea
  M.towers.forEach(T => { T.t += dt; if(T.offT > 0){ T.offT -= dt; return; } const slow = live(M).some(e => e.S.serenade && dist(e.x, e.y, T.x, T.y) < 2.6) ? 0.5 : 1; T.slowed = slow < 1;
    T.atk -= dt * haste * slow; if(T.atk <= 0){ const t = closest(M, T.x, T.y, T.range); if(t){ T.atk = 1 / T.rate; fx(M, 'rose', {x: T.x, y: T.y, x2: t.x, y2: t.y, dur: 0.3}); hit(M, t, T.dmg, T.src); } else T.atk = 0.1; } });
  M.towers = M.towers.filter(T => { if(T.t >= T.dur){ T.spot.used = false; fx(M, 'poof', {x: T.x, y: T.y, dur: 0.5}); return false; } return true; });
  M.minions.forEach(m => moveMinion(M, m, dt)); M.minions = M.minions.filter(m => m.hp > 0 && m.t < m.dur);
  M.flyers.forEach(f => { f.t += dt; if(f.eatT > 0){ f.eatT -= dt; return; } const t = closest(M, f.x, f.y, 9); if(t){ const d = dist(f.x, f.y, t.x, t.y); if(d > 0.4){ f.x += (t.x - f.x) / d * 3.2 * dt; f.y += (t.y - f.y) / d * 3.2 * dt; } f.atk -= dt; if(f.atk <= 0 && d < 0.9){ f.atk = 1 / f.rate; hit(M, t, f.dmg, f.src); } } });
  M.flyers = M.flyers.filter(f => f.t < f.dur);
  M.traps.forEach(T => { T.t += dt; if(T.fx === 'lava'){ live(M).forEach(e => { if(dist(e.x, e.y, T.x, T.y) <= T.r){ hit(M, e, T.n.dot * dt, T.src); e.slowT = Math.max(e.slowT, 0.3); e.slowF = Math.max(e.slowF, T.n.slow); } }); return; }
    live(M).forEach(e => { if(T.charges <= 0 || (T.seen && T.seen[e.id]) || dist(e.x, e.y, T.x, T.y) > T.r) return; (T.seen || (T.seen = {}))[e.id] = 1;   /* each suitor sets a trap off once */
      if(e.charge > 0){ e.charge = 0; fx(M, 'charge', {x: e.x, y: e.y, dur: 0.8}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'charge'}); return; }
      if(M.mods.suitors.enDodge && M.rng() < M.mods.suitors.enDodge){ fx(M, 'hop', {x: e.x, y: e.y, dur: 0.6}); return; }
      T.charges--; fx(M, 'trap', {x: T.x, y: T.y, dur: 0.5, icon: T.icon});
      if(T.fx === 'dmg') hit(M, e, T.n.dmg, T.src);
      if(T.fx === 'root') e.rootT = Math.max(e.rootT, T.n.dur * (e.boss ? 0.4 : 1));
      if(T.fx === 'stun') e.stunT = Math.max(e.stunT, T.n.dur * (e.boss ? 0.4 : 1));
      if(T.fx === 'push' && !e.boss) e.d = Math.max(0, e.d - T.n.push);
      if(T.fx === 'mine'){ T.charges = 0; live(M).forEach(x => { if(dist(x.x, x.y, T.x, T.y) <= T.r) hit(M, x, T.n.dmg, T.src); }); fx(M, 'boom', {x: T.x, y: T.y, r: T.r, dur: 0.6}); }
    }); });
  M.traps = M.traps.filter(T => (T.fx === 'lava' ? T.t < T.life : T.charges > 0 && T.t < T.life));
  M.zones.forEach(Z => { Z.t += dt;
    if(Z.k === 'tornado'){ Z.d -= Z.spd * dt; const p = ptAt(M.paths[Z.pi], Z.d); Z.x = p.x; Z.y = p.y; }
    if(Z.k === 'meteor'){ if(!Z.hitDone && Z.t >= Z.delay){ Z.hitDone = 1; live(M).forEach(x => { if(Z.big || dist(x.x, x.y, Z.x, Z.y) <= Z.r){ hit(M, x, Z.dmg, Z.src); if(Z.stun && !x.gone) x.stunT = Math.max(x.stunT, Z.stun); } }); ev(M, 'boom', {x: Z.x, y: Z.y, big: Z.big}); } return; }
    live(M).forEach(x => { if(dist(x.x, x.y, Z.x, Z.y) <= Z.r) hit(M, x, Z.dps * dt, Z.src); }); });
  M.zones = M.zones.filter(Z => Z.t < Z.dur && !(Z.k === 'tornado' && Z.d <= 0));
  M.walls.forEach(w => { w.t += dt; }); M.walls = M.walls.filter(w => w.hp > 0 && w.t < w.dur);
  M.decoys.forEach(d => { d.t += dt; }); M.decoys = M.decoys.filter(d => d.t < d.dur);
  // 💫 bonked suitors fly off
  M.enemies.forEach(e => { if(e.gone) e.goneT += dt; });
  M.enemies = M.enemies.filter(e => !e.gone || e.goneT < 1.3);
  if(M.hearts <= 0){ const ls = heroMods(M, 'princess').lastStand || heroMods(M, 'dragon').lastStand; if(ls && !M.lastUsed){ M.lastUsed = 1; M.hearts = Math.round(ls); ev(M, 'lastStand', {}); } else { M.hearts = 0; M.state = 'lost'; ev(M, 'lost', {wave: M.wave + 1}); return; } }
  // 🏁 wave over?
  if(!M.spawnQ.length && !M.enemies.some(e => !e.gone && e.charmT <= 0)){ endWave(M); }
}
function autoWants(M, h, b){
  const e = b.e; if(e.kind === 'ultimate' || e.kind === 'combo') return live(M).length >= 4 || live(M).some(x => x.boss) || M.hearts <= M.heartsMax * 0.4;
  return true;
}
function endWave(M){
  ['dragon', 'princess'].forEach(h => { (M.pend[h] || []).forEach(p => { M.cd[h][p.key] = 0; }); M.pend[h] = []; M.heroes[h].bw = null; });   // 🎬 act-2
  M.enemies.forEach(e => { if(e.charmT > 0){ e.gone = 1; e.goneT = 0.5; } });
  M.stats.waves++; if(!M.lostThisWave) M.stats.perfect++;
  const wb = Math.round((40 + 15 * (M.wave + 1)) * M.L.mult); M.score += wb;
  const rg = (heroMods(M, 'dragon').regen || 0) + (heroMods(M, 'princess').regen || 0); if(rg) heal(M, rg);
  ev(M, 'waveDone', {n: M.wave + 1, bonus: wb, perfect: !M.lostThisWave});
  if(M.wave >= M.C.waves.length - 1){ M.state = 'won'; M.score += Math.round(M.hearts * 25 * M.L.mult); ev(M, 'won', {hearts: M.hearts}); return; }
  // 🤖 the suitors' tree levels up too (fair bot)
  const T = M.trees.suitors; if(M.L.bot && M.rng() < M.L.bot + 0.0001 && T.tier < 10){ const o = T.offer(); const c = o && o.cards.length ? T.botPick(o) : null; if(c){ T.take(c); ev(M, 'suitorsUp', {key: c.key, name: c.name, icon: c.icon, tier: T.tier}); } }
  M.towers.forEach(t => { t.t = Math.min(t.t, t.dur - 0.01); });
  M.state = 'pick'; M.queue = pickQueue(M); refreshMods(M);
  if(!M.queue.length){ M.state = 'break'; M.wt = 0; }
}
function enemySkills(M, dt){
  const T = M.trees.suitors, L = live(M);
  COLS_EN.forEach(c => { const key = T.active[c]; if(!key) return; const e = T.pack.get(key), n = SK.num(e, T.skills[key]);
    M.enCd[key] = (M.enCd[key] == null ? e.cd * 0.6 : M.enCd[key]) - dt; if(M.enCd[key] > 0 || L.length < 3) return; M.enCd[key] = e.cd;
    if(e.fx === 'enHeal') L.forEach(x => { x.hp = Math.min(x.hpMax, x.hp + x.hpMax * n.v); });
    if(e.fx === 'enRush') L.forEach(x => { x.rushT = n.dur; x.rushV = n.v; });
    if(e.fx === 'enShield') L.forEach(x => { x.shield = Math.max(x.shield, n.hp); });
    if(e.fx === 'enJam'){ const h = M.rng() < 0.5 ? 'dragon' : 'princess', bs = M.trees[h].buttons().filter(b => !b.ult && !b.combo); if(bs.length){ const b = bs[Math.floor(M.rng() * bs.length)]; M.cd[h][b.key] = (M.cd[h][b.key] || 0) + n.v; ev(M, 'jam', {hero: h, key: b.key}); } }
    ev(M, 'suitorCast', {key, name: e.name, icon: e.icon});
  });
}
const COLS_EN = ['A', 'B', 'C', 'D', 'E'];
/* ---------- 🧙 👑 🎁 R2 suitor + boss skills (td-2) ---------- */
// 🧪 one of your helpers (a mouse / a dove) walks with the suitors now — bonk it and it wakes up
function charmHelper(M, e, r){
  const m = M.minions.filter(m => m.hp > 0 && dist(m.x, m.y, e.x, e.y) <= r).sort((a, b) => dist(a.x, a.y, e.x, e.y) - dist(b.x, b.y, e.x, e.y))[0];
  if(m){ m.hp = 0; spawn(M, 'mo', m.pi, Math.max(0, m.d)); fx(M, 'potion', {x: m.x, y: m.y, dur: 0.8}); return true; }
  const f = M.flyers.find(f => f.t < f.dur && dist(f.x, f.y, e.x, e.y) <= r);
  if(f){ f.t = f.dur; spawn(M, 'mo', e.pi, Math.max(0, e.d - 0.4)); fx(M, 'potion', {x: f.x, y: f.y, dur: 0.8}); return true; }
  return false;
}
// 📜 every suitor on the map runs faster and gets a shield
function decree(M, e, dur, v, sh){ live(M).forEach(x => { x.rushT = Math.max(x.rushT || 0, dur); x.rushV = Math.max(x.rushV || 0, v); x.shield = Math.max(x.shield, sh * M.L.hp); });
  fx(M, 'decree', {x: e.x, y: e.y, r: 3, dur: 1}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'decree'}); }
function serenade(M, e, off){ M.towers.forEach(T => { T.offT = Math.max(T.offT || 0, off); }); fx(M, 'serenade', {x: e.x, y: e.y, r: 4, dur: 1.2}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'serenade'}); }
function callIn(M, e, type, n){ for(let i = 0; i < n; i++) spawn(M, type, (e.pi + i) % M.paths.length, Math.max(0, (i % M.paths.length === 0 ? e.d : 0.4) - 0.6 - i * 0.3)); }
function newSkills(M, e, dt){
  const S = e.S, hd = M.heroes.dragon;
  if(S.cart){ let fed = 0; M.minions.forEach(m => { if(m.hp > 0 && dist(m.x, m.y, e.x, e.y) <= 2.2){ m.eatT = Math.max(m.eatT || 0, 0.5); fed++; } });
    M.flyers.forEach(f => { if(dist(f.x, f.y, e.x, e.y) <= 2.2){ f.eatT = Math.max(f.eatT || 0, 0.5); fed++; } });
    if(fed && e.skT <= 0){ e.skT = 4; fx(M, 'choc', {x: e.x, y: e.y, dur: 0.8}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'choc'}); } }
  if(S.emperor && !e.parade && e.hp < e.hpMax * 0.5){ e.parade = 1; callIn(M, e, 'cu', 4); callIn(M, e, 'pr', 2); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'parade'}); }   // 💘 tired → a heart parade
  if(e.skT > 0) return;
  if(S.potion){ e.skT = 9; if(!charmHelper(M, e, 4.5)){ live(M).forEach(x => { if(dist(x.x, x.y, e.x, e.y) < 2.2) x.hp = Math.min(x.hpMax, x.hp + x.hpMax * 0.2); }); fx(M, 'potion', {x: e.x, y: e.y, dur: 0.8}); } ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'potion'}); }
  else if(S.decree){ e.skT = 10; decree(M, e, 3, 0.3, 6); }
  else if(S.serenadeAll){ e.skT = 7; serenade(M, e, 3); hd.dazeT = Math.max(hd.dazeT, 1.6); fx(M, 'kiss', {x: e.x, y: e.y, x2: hd.x, y2: hd.y, dur: 0.6});
    if((e.calls = (e.calls || 0) + 1) % 2 === 0) callIn(M, e, 'sq', 3); }
  else if(S.archmage){ e.skT = 7.5; let n = 0; if(charmHelper(M, e, 7)) n++; if(charmHelper(M, e, 7)) n++;
    const P = M.paths[e.pi]; fx(M, 'blink', {x: e.x, y: e.y, dur: 0.6}); e.d = Math.min(P.len - 2.2, e.d + 1.4); const p = ptAt(P, e.d); e.x = p.x; e.y = p.y; fx(M, 'blink', {x: e.x, y: e.y, dur: 0.6});
    ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'blink'}); if(!n && (e.calls = (e.calls || 0) + 1) % 2 === 0) callIn(M, e, 'wz', 1); }
  else if(S.goldbeard){ e.skT = 8; decree(M, e, 3.5, 0.35, 10); if((e.calls = (e.calls || 0) + 1) % 2 === 0){ callIn(M, e, 'sq', 3); fx(M, 'coins', {x: e.x, y: e.y, dur: 1}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'hire'}); } }
  else if(S.emperor){ e.skT = 6; const ph = (e.phase = ((e.phase || 0) + 1) % 3);
    if(ph === 1){ serenade(M, e, 2.5); hd.dazeT = Math.max(hd.dazeT, 1.2); fx(M, 'kiss', {x: e.x, y: e.y, x2: hd.x, y2: hd.y, dur: 0.6}); }
    else if(ph === 2){ charmHelper(M, e, 7); charmHelper(M, e, 7); fx(M, 'potion', {x: e.x, y: e.y, dur: 0.8}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'potion'}); }
    else decree(M, e, 3, 0.3, 10);
 }
  else if(S.groom){ e.skT = 6; hd.dazeT = Math.max(hd.dazeT, 2); fx(M, 'ring', {x: e.x, y: e.y, x2: hd.x, y2: hd.y, dur: 0.6}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'ring'});
    if((e.calls = (e.calls || 0) + 1) % 2 === 0) callIn(M, e, 'gd', 2); }
  else e.skT = 99;
}
function moveEnemy(M, e, dt){
  if(e.gone){ return; }
  const P = M.paths[e.pi];
  ['slowT', 'stunT', 'rootT', 'sleepT', 'fearT', 'confT', 'charmT', 'burnT', 'stopT', 'rushT', 'hitT'].forEach(k => { if(e[k] > 0) e[k] -= dt; });
  if(e.slowT <= 0) e.slowF = 0;
  if(e.burnT > 0) hit(M, e, e.burnD * dt, {col: 'A'}); if(e.gone) return;
  // suitor skills
  e.skT -= dt;
  if(!M.instant && e.skT <= 0 && trickTimed(e.S)){ if(e.wind) e.wind = 0; else if(e.charmT <= 0 && e.stunT <= 0 && e.sleepT <= 0){ e.wind = 1; e.skT = WIND.trick; e.stopT = Math.max(e.stopT, WIND.trick + 0.25);
    ev(M, 'trickWind', {id: e.id, type: e.type, at: M.t + WIND.trick, w: WIND.trick}); } }   // 🎬 act-2: the trick's wind-up, the skill fires on contact
  if(e.S.arrow && e.skT <= 0 && e.charmT <= 0){ e.skT = 8; const bs = M.trees.princess.buttons().filter(b => !b.ult && !b.combo); if(bs.length){ const b = bs[Math.floor(M.rng() * bs.length)]; M.cd.princess[b.key] = (M.cd.princess[b.key] || 0) + 4; fx(M, 'arrow', {x: e.x, y: e.y, x2: CX, y2: CY, dur: 0.6}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'arrow', key: b.key}); } }
  if(e.S.bomb && !e.bombed && e.charmT <= 0){ const t = M.towers.find(T => dist(T.x, T.y, e.x, e.y) < 3 && T.offT <= 0); if(t){ e.bombed = true; t.offT = 5; fx(M, 'flowerbomb', {x: t.x, y: t.y, dur: 1}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'bomb'}); } }
  if(e.S.bouquet && e.skT <= 0){ e.skT = 6; M.heroes.dragon.dazeT = 2; fx(M, 'bouquet', {x: e.x, y: e.y, x2: M.heroes.dragon.x, y2: M.heroes.dragon.y, dur: 0.7}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'bouquet'});
    if((e.calls = (e.calls || 0) + 1) % 2 === 0) for(let i = 0; i < 2; i++) spawn(M, 'sq', e.pi, Math.max(0, e.d - 0.6 - i * 0.6)); }
  if(e.S.shine && e.skT <= 0){ e.skT = 7; e.shine = 3; M.heroes.princess.dazeT = 2; fx(M, 'shine', {x: e.x, y: e.y, dur: 1}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'shine'}); }
  if(e.charmT <= 0 && e.stunT <= 0 && e.sleepT <= 0) newSkills(M, e, dt);
  if(e.gone) return;
  // where to go
  let v = e.spd * (e.rushT > 0 ? 1 + (e.rushV || 0) : 1) * (1 - e.slowF);
  if(e.stunT > 0 || e.rootT > 0 || e.sleepT > 0 || e.stopT > 0) v = 0;
  if(e.pullX != null && e.rootT > 0){ e.x += (e.pullX - e.x) * Math.min(1, dt * 3); e.y += (e.pullY - e.y) * Math.min(1, dt * 3); return; } else e.pullX = null;
  let dir = 1;
  if(e.charmT > 0){ dir = -1; v = Math.max(v, e.spd * 0.9); L_charmHit(M, e, dt); }
  else if(e.fearT > 0){ dir = -1; v = Math.max(v * 0.9, e.spd * 0.8); }
  else if(e.confT > 0){ if((e.confFlip = (e.confFlip || 0) - dt) <= 0){ e.confFlip = 0.7; e.confDir = M.rng() < 0.55 ? -1 : 1; } dir = e.confDir; v *= 0.6; }
  // 🫖 tea break + 🧱 walls + 🐭 helpers block the path
  if(dir > 0 && v > 0){
    if(M.decoys.some(d => d.pi === e.pi && Math.abs(d.d - e.d) <= d.r) && !e.boss){ v = 0; e.tea = 1; } else e.tea = 0;
    const w = M.walls.find(w => w.pi === e.pi && w.d > e.d - 0.05 && w.d - e.d < 0.45);
    if(w && !(e.S.climb)){ v = 0; w.hp -= (e.boss ? 25 : 8) * dt; e.atWall = 1; } else e.atWall = 0;
    if(w && e.S.climb && !e.climbed){ e.climbed = 1; fx(M, 'ladder', {x: e.x, y: e.y, dur: 0.8}); ev(M, 'suitorSkill', {id: e.id, type: e.type, skill: 'ladder'}); }
    const m = M.minions.find(m => m.pi === e.pi && !(m.eatT > 0) && m.d >= e.d - 0.1 && m.d - e.d < 0.55);
    if(m){ v = 0; m.hp -= (e.boss ? 30 : 7) * dt; m.fight = 1; }
  }
  e.d += dir * v * dt; if(e.d < 0){ e.d = 0; if(e.charmT > 0 || e.fearT > 0){ if(e.charmT > 0){ e.gone = 1; e.goneT = 0.4; M.stats.bonks++; M.score += Math.round(e.S.pts * M.L.mult * 0.6); ev(M, 'bonk', {type: e.type, x: e.x, y: e.y, pts: 0, home: true}); return; } } }
  const p = ptAt(P, e.d); e.x = p.x; e.y = p.y; e.ang = p.ang;
  if(e.d >= P.len && e.charmT <= 0) reachTower(M, e);
}
function trickTimed(S){ return !!(S.arrow || S.bouquet || S.shine || S.potion || S.decree || S.serenadeAll || S.archmage || S.goldbeard || S.emperor || S.groom); }
function L_charmHit(M, e, dt){ live(M).forEach(x => { if(x !== e && x.pi === e.pi && Math.abs(x.d - e.d) < 0.6){ hit(M, x, 9 * dt, {hero: 'princess', col: 'E'}); } }); }
function reachTower(M, e){
  const back = (n) => { e.d = Math.max(0, e.d - n); e.stunT = Math.max(e.stunT, 0.6); };
  if(M.domeT > 0){ back(e.boss ? 1.2 : 2.5); fx(M, 'bounce', {x: e.x, y: e.y, dur: 0.6}); return; }
  if(M.reflectN > 0 && !e.boss){ M.reflectN--; back(M.reflectPush || 4); fx(M, 'mirror', {x: e.x, y: e.y, dur: 0.6}); ev(M, 'reflect', {}); return; }
  const th = (heroMods(M, 'dragon').thorns || 0) + (heroMods(M, 'princess').thorns || 0); if(th){ hit(M, e, th, {hero: 'princess', col: 'D'}); if(e.gone) return; }
  if(M.shieldHp > 0 && !e.boss){ M.shieldHp--; fx(M, 'shield', {x: e.x, y: e.y, dur: 0.5}); bonk(M, e, {hero: 'princess'}); return; }
  const armor = Math.min(0.7, (heroMods(M, 'dragon').armor || 0) + (heroMods(M, 'princess').armor || 0) + (M.armorT > 0 ? M.armorV : 0));
  const dmg = Math.max(1, Math.round(e.S.w * (1 - armor)));
  M.hearts -= dmg; M.lostThisWave += dmg; M.stats.hearts += dmg;
  e.gone = 1; e.goneT = 0; e.kiss = 1; ev(M, 'heart', {n: dmg, type: e.type, x: e.x, y: e.y, boss: e.boss, left: M.hearts});
  if(e.boss && M.hearts > 0){ /* the boss knocks and leaves: still a big hit */ }
}
function moveMinion(M, m, dt){
  m.t += dt; const P = M.paths[m.pi]; m.fight = 0;
  if(m.eatT > 0){ m.eatT -= dt; return; }   // 🍫 busy eating chocolate
  const foe = live(M).find(e => e.pi === m.pi && e.d <= m.d + 0.1 && m.d - e.d < 0.6);
  if(foe){ m.fight = 1; m.atk = (m.atk || 0) - dt; if(m.atk <= 0){ m.atk = 0.5; hit(M, foe, m.dmg, m.src); } }
  else m.d = Math.max(0.5, m.d - 1.3 * dt);
  const p = ptAt(P, m.d); m.x = p.x; m.y = p.y;
}

/* ---------- 🤖 whole chapters for tests / tuning ---------- */
function simulate(o){
  o = o || {}; const M = newMatch(Object.assign({auto: true}, o)); M.breakLen = 0.2; let guard = 0;
  while(M.state !== 'won' && M.state !== 'lost' && guard++ < 200000){
    if(M.state === 'pick'){ const of = offer(M); if(!of) { M.queue.shift(); if(!M.queue.length){ M.state = 'break'; M.wt = 0; } continue; } take(M, o.pick ? o.pick(M, of) : M.trees[M.queue[0]].botPick(of)); continue; }
    step(M, STEP); takeEvents(M);
  }
  return {won: M.state === 'won', wave: M.wave + 1, hearts: M.hearts, score: M.score, stats: M.stats, M};
}
return {W, CX, CY, TOWER_R, LEVELS, SUITORS, BOOKS, PATHS, PACKS, COMBOS, HEROES, TD_MOVES, WIND, moveOf, buildPath, ptAt, newMatch, offer, take, startWave, step, cast, ready, canAim, cdOf, skillOf, takeEvents, simulate, live, rngOf, STEP};
})();
// ENGINE END
