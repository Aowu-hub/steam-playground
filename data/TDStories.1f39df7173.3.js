
// FD ENGINE START — 👨‍🌾 Farmer Delusion engine (book 2, fd-1, 🏰 TD-Stories chat 2026-11-17 · plan §16) — pure JS, no DOM; Test Harness/tdfarmer.js loads IsoKit + SkillKit + this part in node
const FD = (function(){
'use strict';
const SK = (typeof SkillKit !== 'undefined') ? SkillKit : (typeof window !== 'undefined' ? window.SkillKit : globalThis.SkillKit);
const ISO = (typeof Iso !== 'undefined') ? Iso : (typeof window !== 'undefined' ? window.Iso : globalThis.Iso);
const N = 26, O = 5, CX = 8, CY = 8, STEP = 1 / 30;   // the island grid = TD-Stories' IsoKit island (cell i, j ↔ world x = i − O … i − O + 1)
function rngOf(seed){ let a = (seed >>> 0) || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const wx = i => i - O + 0.5;   // cell → world centre

/* ---------- 🎚️ difficulty (6 house levels) — 🎃 pumpkins are the hearts, 🌰 seeds pay for plants ---------- */
const LEVELS = [
  {name: 'Basic', emoji: '🌱', will: 0.6, spd: 0.72, hearts: 20, seeds: 16, cards: 2, glow: 99, guide: true, mult: 1, bot: 0, assist: 3, brk: 0, blurb: 'Slow collectors, the best spot glows'},
  {name: 'Junior', emoji: '🐣', will: 0.85, spd: 0.82, hearts: 16, seeds: 14, cards: 3, glow: 3, mult: 1, bot: 0.34, assist: 7, brk: 20, blurb: 'Three cards to pick from'},
  {name: 'Intermediate', emoji: '🌳', will: 1.15, spd: 0.92, hearts: 12, seeds: 12, cards: 3, glow: 0, mult: 1, bot: 0.5, brk: 16, blurb: 'The collectors learn tricks too'},
  {name: 'Hard', emoji: '🔥', will: 2.0, spd: 1.0, hearts: 10, seeds: 10, cards: 3, glow: 0, mult: 1, bot: 1, brk: 14, blurb: 'Stubborn clerks, quick feet'},
  {name: 'Extreme', emoji: '⚡', will: 2.9, spd: 1.08, hearts: 8, seeds: 9, cards: 3, glow: 0, mult: 1, bot: 1, brk: 12, blurb: 'A paperwork rush'},
  {name: 'Hardcore', emoji: '💀', will: 3.9, spd: 1.14, hearts: 5, seeds: 8, cards: 3, glow: 0, mult: 3, bot: 1, hardcore: true, brk: 10, blurb: '5 pumpkins, no hints, ×3 points'},
];
/* ---------- ⚖️ win-rate tuning (wr-1, Aowu 2026-11-18) — collector Will × this, per chapter × level; made by Test Harness/rounds/wr-1/tune.js so the auto-player wins 🌱 90–100 · 🐣 70–90 · 🌳 60–80 · 🔥 30–50 · ⚡ 10–20 · 💀 5–15 % ---------- */
const WR = {1: [1, 5.02, 1.96, 1.14, 0.86, 0.59], 2: [1, 3.37, 1.52, 0.78, 0.57, 0.37], 3: [1, 3.2, 1.52, 0.8, 0.59, 0.38], 4: [1, 3.28, 1.6, 0.88, 0.65, 0.4]};
const wrOf = (C, lv) => ((WR[C.n] || [])[lv]) || 1;
const TIRE = 0.005;   // 😩 every tile walked drains 0.75 % of a collector's Will — a long maze helps even with no attacks

/* ---------- 📋 collectors (Will = how long they keep trying; nobody gets hurt — they QUIT and run home) ---------- */
const FOES = {
  c: {name: 'Collector', icon: '📋', will: 30, spd: 1.0, seeds: 1, pts: 10, take: 1, skill: '📋 Walks the shortest way and knocks'},
  k: {name: 'Clipboard Checker', icon: '🔍', will: 40, spd: 0.9, seeds: 2, pts: 16, take: 1, spot: 1, skill: '🔍 Spots ONE trap and walks round it'},
  u: {name: 'Umbrella Man', icon: '☂️', will: 46, spd: 0.85, seeds: 2, pts: 18, take: 1, umbrella: true, skill: '☂️ Spores and splashes bounce off his umbrella'},
  boss1: {name: 'Mr. Clipboard', icon: '📋', will: 430, spd: 0.5, seeds: 20, pts: 400, take: 5, boss: true, size: 1.6, spot: 99, clip: true, skill: '🔍 Spots EVERY trap + calls more collectors'},
  boss2: {name: 'Mr. Umbrella', icon: '☂️', will: 620, spd: 0.48, seeds: 26, pts: 550, take: 6, boss: true, size: 1.7, umbrella: true, brolly: true, skill: '☔ Umbrella Spin shields his friends + calls Umbrella Men'},
  tr: {name: 'Treats Lady', icon: '🦴', will: 38, spd: 0.95, seeds: 2, pts: 18, take: 1, treats: true, skill: '🦴 Throws a treat — the closest animal stops to eat it'},   // ✦ fd-2a
  bk: {name: 'Bike Clerk', icon: '🚲', will: 34, spd: 0.95, seeds: 2, pts: 18, take: 1, bike: true, skill: '🚲 Zooms on dry paths — crawls in mud and on wet canal banks'},   // ✦ fd-2b
  boss4: {name: 'Speedy Bike Bill', icon: '🚴', will: 700, spd: 0.5, seeds: 30, pts: 650, take: 6, boss: true, size: 1.7, bike: true, bell: true, skill: '🔔 Rings his bell — the sheep in front jump aside · fast on dry ground, stuck in mud'},   // ✦ fd-2b
  boss3: {name: 'Mrs. Treats', icon: '👜', will: 760, spd: 0.46, seeds: 30, pts: 650, take: 6, boss: true, size: 1.7, treats: true, bag: true, skill: '👜 Empties her treat bag — every animal near her eats · at half Will she calls 2 Treats Ladies'},   // ✦ fd-2a
};

/* ---------- 🌱 plants = walls AND towers (5 kinds × 5 shape stages; stage 4 picks ① or ②) ---------- */
// atk: puff (spores round the plant) · bonk · sleep · shot · aura · dazzle · beam · cone · pop (pepper pops on the path) · roll (a pumpkin rolls back up the path) · fear
const PLANTS = {
  mush: {name: 'Mushroom', icon: '🍄', cost: 2, grow: [2, 4, 6, 9], ch: 1, atk: 'puff', dmg: 2.4, rate: 2.2, range: 1.45, slow: 0.35, dur: 1.6, spore: true, does: 'cheap wall · 💤 spore puff slows',
    b: [{name: 'Toadstool Tower', icon: '🏰', col: 'D', atk: 'bonk', dmg: 7, rate: 1.7, range: 1.3, push: 1, tough: true, does: 'super-tough wall · bonks them back'},
        {name: 'Dream Cap', icon: '💤', col: 'E', atk: 'sleep', dmg: 3, rate: 5, range: 1.9, dur: 2, spore: true, does: 'sleep spores — they nap 2 s'}]},
  corn: {name: 'Corn', icon: '🌽', cost: 3, grow: [3, 5, 7, 10], ch: 2, atk: 'shot', dmg: 5, rate: 1.1, range: 2.6, does: 'tall wall · 🍿 pops corn at the nearest',
    b: [{name: 'Popcorn Cannon', icon: '🍿', col: 'A', atk: 'shot', dmg: 6, rate: 0.42, range: 3.0, does: 'fast popcorn shots'},
        {name: 'Corn Hedge', icon: '🌾', col: 'C', atk: 'aura', dmg: 3.4, rate: 1, range: 1.55, slow: 0.45, dur: 1.2, does: 'thick 3-stalk wall · "lost in the corn" slow'}]},
  sun: {name: 'Sunflower', icon: '🌻', cost: 4, grow: [4, 6, 8, 11], ch: 2, atk: 'dazzle', dmg: 3, rate: 2.6, range: 3, dur: 1.6, does: '✨ dazzle beam (they walk blind)',
    b: [{name: 'Sun Mirror', icon: '🪞', col: 'E', atk: 'beam', dmg: 11, rate: 2.2, range: 4.4, dur: 2, does: 'long dazzle beam + Will drain'},
        {name: 'Seed Fountain', icon: '🌰', col: 'B', atk: 'dazzle', dmg: 2, rate: 3.4, range: 2.5, dur: 1, seeds: 2, does: '+🌰 seeds every wave'}]},
  pepper: {name: 'Pepper', icon: '🌶️', cost: 5, grow: [5, 7, 9, 12], ch: 3, atk: 'cone', dmg: 6, rate: 2, range: 2.2, burn: 3, does: '🔥 hot puff (cone, Will burn)',
    b: [{name: 'Dragon Chilli', icon: '🐲', col: 'A', atk: 'cone', dmg: 12, rate: 2, range: 2.8, burn: 5, does: 'big fire cone'},
        {name: 'Pepper Popper', icon: '💥', col: 'C', atk: 'pop', dmg: 18, rate: 3.5, range: 2.4, does: 'drops pepper pops on the path'}]},
  pump: {name: 'Pumpkin', icon: '🎃', cost: 6, grow: [6, 8, 10, 14], ch: 4, atk: 'roll', dmg: 12, rate: 3.2, range: 2.5, len: 3, does: '🎃 rolls a pumpkin down the path',
    b: [{name: 'Pumpkin Roller', icon: '🛞', col: 'A', atk: 'roll', dmg: 22, rate: 3, range: 2.8, len: 5, does: 'giant pumpkin bowls a whole line'},
        {name: "Jack-o'-Lantern", icon: '🏮', col: 'E', atk: 'fear', dmg: 4, rate: 6, range: 2.2, back: 3, does: 'scary face — they run back 3 tiles'}]},
};
const KINDS = ['mush', 'corn', 'sun', 'pepper', 'pump'];
/* ---------- 🌊 build tools (✦ fd-2b, ch 4+): canals = water walls · bridges go on a canal (tap = lift / lower) · plants beside water grow cheaper ---------- */
const TOOLS = {canal: {name: 'Canal', icon: '🌊', cost: 2, ch: 4, does: 'dig water — a wall nobody walks through, nothing grows on it · plants beside water cost less'},
  bridge: {name: 'Bridge', icon: '🌉', cost: 3, ch: 4, does: 'goes on a canal · tap it to lift (blocked) or lower (they cross) — even mid-wave'}};
const TOOL_KEYS = ['canal', 'bridge'], WATER_OFF = 0.75, BRIDGE_REST = 4, LEVER_REST = 2;
const kindOf = k => PLANTS[k] || TOOLS[k] || null;
const STAGE_MUL = [0, 1, 1.35, 1.75, 2.3, 3.0];
function plantSpec(P){ const K = PLANTS[P.kind], b = P.br >= 0 && P.st >= 4 ? K.b[P.br] : null, base = Object.assign({}, K, b || {});
  base.dmg = (base.dmg || 0) * STAGE_MUL[P.st]; base.range = (base.range || 1) + 0.18 * (P.st - 1); base.col = b ? b.col : null; base.name = b ? b.name : K.name; base.icon = b ? b.icon : K.icon; return base; }
function growCost(P, M){ if(P.st >= 5) return 0; const c = PLANTS[P.kind].grow[P.st - 1]; return M && nearWater(M, P.i, P.j) ? Math.max(1, Math.round(c * WATER_OFF)) : c; }   // 💧 fd-2b: beside water = cheaper

/* ---------- 📖 the book: chapters (10 waves each, wave 10 = boss) ---------- */
// group = [type, count, gate (−1 = take turns), gap seconds, start second] · gates = angles round the island (0 = screen right-down, world +x)
const GATE_A = {left: Math.PI * 0.75, right: -Math.PI * 0.25, back: -Math.PI * 0.75, front: Math.PI * 0.25, south: Math.PI * 0.5, west: Math.PI};
const BOOKS = {farmer: {id: 'farmer', board: 'td-farmer', title: 'Farmer Delusion', icon: '👨‍🌾🍄', heroes: ['farmer', 'goat'], chapters: [
  {n: 1, title: 'The Letter', boss: 'boss1', gates: ['left', 'right'], scene: 'farm', rocks: 7, waves: [
    [['c', 4, -1, 2.4, 0]],
    [['c', 6, -1, 1.9, 0]],
    [['c', 6, -1, 1.5, 0], ['k', 1, 0, 0, 4]],
    [['c', 8, -1, 1.3, 0], ['k', 2, -1, 3, 2]],
    [['c', 10, -1, 1.1, 0], ['k', 2, -1, 3, 3]],
    [['k', 4, -1, 2, 0], ['c', 8, -1, 1, 2]],
    [['c', 14, -1, 0.9, 0], ['k', 3, -1, 2.5, 3]],
    [['k', 6, -1, 1.6, 0], ['c', 10, -1, 0.9, 2]],
    [['c', 16, -1, 0.75, 0], ['k', 6, -1, 1.5, 3]],
    [['boss1', 1, 0, 0, 0], ['c', 10, -1, 1.2, 3], ['k', 4, -1, 2.5, 7]],
  ]},
  {n: 2, title: 'Mushroom Maze', boss: 'boss2', gates: ['left', 'right'], newGate: {after: 4, gate: 'back', who: 'Mr. Umbrella'}, rain: [2, 5, 8], scene: 'rain', rocks: 9, waves: [
    [['c', 6, -1, 1.6, 0], ['u', 1, 0, 0, 4]],
    [['u', 3, -1, 2.5, 0], ['c', 6, -1, 1.3, 1]],
    [['k', 4, -1, 2, 0], ['u', 2, -1, 3, 2]],
    [['c', 12, -1, 0.9, 0], ['u', 3, -1, 2.6, 3]],
    [['u', 4, -1, 2, 0], ['k', 4, -1, 2, 2], ['c', 6, 2, 1.2, 4]],
    [['c', 14, -1, 0.8, 0], ['u', 4, -1, 2.2, 3]],
    [['k', 8, -1, 1.3, 0], ['u', 4, -1, 2.2, 2]],
    [['u', 8, -1, 1.4, 0], ['c', 12, -1, 0.8, 2]],
    [['c', 18, -1, 0.65, 0], ['u', 6, -1, 1.6, 2], ['k', 6, -1, 1.6, 5]],
    [['boss2', 1, 2, 0, 0], ['u', 6, -1, 1.8, 3], ['c', 10, -1, 1, 6]],
  ]},
  {n: 3, title: 'Animal Army', boss: 'boss3', gates: ['left', 'right'], newGate: {after: 5, gate: 'south', who: 'Mrs. Treats'}, scene: 'farm', rocks: 9, waves: [   // ✦ fd-2a: 🦴 treats make your animals stop to eat
    [['c', 6, -1, 1.5, 0], ['tr', 1, 0, 0, 4]],
    [['tr', 3, -1, 2.4, 0], ['c', 6, -1, 1.2, 1]],
    [['k', 4, -1, 2, 0], ['tr', 3, -1, 2.6, 2]],
    [['c', 12, -1, 0.85, 0], ['tr', 4, -1, 2.2, 3]],
    [['tr', 5, -1, 1.8, 0], ['u', 3, -1, 2.4, 2], ['k', 3, -1, 2.2, 4]],
    [['c', 14, -1, 0.75, 0], ['tr', 5, -1, 2, 3]],
    [['k', 8, -1, 1.3, 0], ['tr', 5, -1, 2, 2]],
    [['tr', 8, -1, 1.3, 0], ['c', 12, -1, 0.75, 2], ['u', 3, -1, 2.5, 5]],
    [['c', 18, -1, 0.6, 0], ['tr', 7, -1, 1.5, 2], ['k', 6, -1, 1.6, 5]],
    [['boss3', 1, 2, 0, 0], ['tr', 6, -1, 1.8, 3], ['c', 10, -1, 1, 6]],
  ]},
  {n: 4, title: 'The Great Pond', boss: 'boss4', gates: ['left', 'right'], newGate: {after: 5, gate: 'boat', who: 'Speedy Bike Bill', boat: true}, scene: 'farm', rocks: 5,   // ✦ fd-2b: 🌊 canals + 🌉 bridges + 🌽 corn switch · 🚲 bikes hate mud
    pond: {x: CX + 0.6, y: CY - 5.3, rx: 2.7, ry: 2.2}, hedge: {i: 8, open: 17, shut: 10, lever: [9, 14]}, mud: 4, waves: [
    [['c', 6, -1, 1.5, 0], ['bk', 1, 0, 0, 4]],
    [['bk', 3, -1, 2.4, 0], ['c', 6, -1, 1.2, 1]],
    [['k', 4, -1, 2, 0], ['bk', 3, -1, 2.4, 2]],
    [['c', 12, -1, 0.85, 0], ['bk', 4, -1, 2, 3]],
    [['bk', 5, -1, 1.7, 0], ['tr', 3, -1, 2.4, 2], ['u', 3, -1, 2.2, 4]],
    [['c', 14, -1, 0.75, 0], ['bk', 5, -1, 1.8, 3]],
    [['k', 8, -1, 1.3, 0], ['bk', 6, -1, 1.8, 2]],
    [['bk', 8, -1, 1.2, 0], ['c', 12, -1, 0.75, 2], ['u', 3, -1, 2.5, 5]],
    [['c', 18, -1, 0.6, 0], ['bk', 7, -1, 1.4, 2], ['tr', 5, -1, 1.8, 5]],
    [['boss4', 1, 1, 0, 0], ['bk', 6, -1, 1.6, 3], ['c', 10, -1, 1, 6]],
  ]},
  {n: 5, title: 'The Lawyer', boss: 'boss1', gates: [], soon: true}, {n: 6, title: 'The Lender Himself', boss: 'boss1', gates: [], soon: true},
]}};
BOOKS.farmer.chapters.forEach(C => { if(C.soon) C.waves = []; });

/* ---------- 🧬 hero packs (SkillKit engines, our names — plan §16c) ---------- */
const FARMER_ITEMS = [
    {key: 'a_shot', name: 'Tomato Toss', icon: '🍅', look: 'fire', desc: 'A big ripe tomato — splat! {dmg} Will.'}, {key: 'a_whip', name: 'Pumpkin Roll', icon: '🎃', look: 'honey', desc: 'Rolls a pumpkin down the path: {dmg} Will and a push back.'},
    {key: 'a_cone', name: 'Pepper Puff', icon: '🌶️', look: 'fire', desc: 'Hot pepper puff: {dmg} Will + a burn.'}, {key: 'pa_power', name: 'Strong Arm', icon: '💪'}, {key: 'pa_rate', name: 'Quick Hands', icon: '⏩'},
    {key: 'b_gold', name: 'Seed Bag', icon: '🌰', look: 'gold', desc: '+{gold} seeds… well, a handful of 🌰 and +{heal} 🎃.'}, {key: 'b_haste', name: 'Watering Can', icon: '🚿', look: 'water', desc: 'Your plants work faster for {dur}s.'},
    {key: 'b_sign', name: 'Fake Sign', icon: '🪧', look: 'paper', desc: '"Office this way!" — they follow it to a dead end and read for {dur}s.'}, {key: 'pb_gold', name: 'Green Thumb', icon: '🧤'}, {key: 'pb_cd', name: 'Early Bird', icon: '🐓'},
    {key: 'c_pit', name: 'Mud Pit', icon: '🕳️', look: 'rock', desc: 'Squelch! Stuck in the mud for {dur}s.'}, {key: 'c_net', name: 'Twine Trap', icon: '🧶', look: 'honey'}, {key: 'c_splash', name: 'Rain Barrel', icon: '🪣', look: 'water', desc: 'A barrel of rain washes them {push} tiles back.'},
    {key: 'pc_more', name: 'More Mud', icon: '➕'}, {key: 'pc_big', name: 'Bigger Holes', icon: '⭕'},
    {key: 'd_wall', name: 'Hay Bale Wall', icon: '🌾', look: 'sand', desc: 'A hay bale on the path — they must push it out of the way.'}, {key: 'd_heal', name: 'Pumpkin Patch-up', icon: '🧺', look: 'nature', desc: '+{heal} 🎃 pumpkins back on the pile.'},
    {key: 'd_shield', name: 'Fence Up', icon: '🛡️', look: 'holy', desc: 'A new fence: the next {hp} pumpkins are safe for {dur}s.'}, {key: 'pd_regen', name: 'Fresh Pumpkins', icon: '🌱'}, {key: 'pd_armor', name: 'Thick Fence', icon: '🧱'},
    {key: 'e_dazzle', name: 'Sunflower Dazzle', icon: '🌻', look: 'sun', desc: 'Sunflowers flash — they wander about blind for {dur}s.'}, {key: 'e_slow', name: 'Compost Stink', icon: '💨', look: 'goo', desc: 'Pee-yew! They walk slowly for {dur}s.'},
    {key: 'e_sleep', name: 'Hum-a-Lullaby', icon: '😴', look: 'dream', desc: 'A farm lullaby — they nap for {dur}s.'}, {key: 'pe_long', name: 'Long Tunes', icon: '⏳'},
    {key: 'u_meteor', name: 'Tomato Rain', icon: '🍅', look: 'fire'}, {key: 'u_army', name: 'Chicken Parade', icon: '🐔', look: 'sun'}, {key: 'u_field', name: 'The Great Corn Maze', icon: '🌽', look: 'nature'},
    {key: 'u_fort', name: 'Barn Fortress', icon: '🏡', look: 'holy'}, {key: 'u_charm', name: 'Sunny Day', icon: '🌞', look: 'sun'},
    {key: 'x_burst', name: 'Pepper Stampede', icon: '🌶️'}, {key: 'x_guard', name: 'Hay Fort', icon: '🏰'}, {key: 'x_wall', name: 'Mud Splash Party', icon: '🐷'},
];
// 🌊 ✦ fd-2b: from ch 4 (the pond) the Farmer's rain barrel floods, and two new cards come in — ch 1–3 keep their old pack (same cards, same balance)
const POND_ITEMS = FARMER_ITEMS.map(it => it.key === 'c_splash' ? {key: 'c_flood', name: 'Rain Barrel Flood', icon: '🪣', look: 'water', desc: 'Tip the rain barrel — a wave rolls {len} tiles down their walk: {push} steps back, wet and slow for {dur}s.'} : it);
POND_ITEMS.splice(POND_ITEMS.findIndex(it => it.key === 'b_sign') + 1, 0, {key: 'b_canal', name: 'Dig a Ditch', icon: '🌊', look: 'water', desc: 'The Farmer digs {n} ditch cells across their walk — they must go round for {dur}s.'});
POND_ITEMS.splice(POND_ITEMS.findIndex(it => it.key === 'c_flood') + 1, 0, {key: 'c_switch', name: 'Corn Switch', icon: '🌽', look: 'nature', desc: 'Every corn gate and bridge on the farm flips for {dur}s — the walk swaps lanes (no switches: a corn wall pops up on their walk).'});
const PACKS = {
  farmer: SK.pack('td-farmer:farmer', FARMER_ITEMS),
  farmerPond: SK.pack('td-farmer:farmer', POND_ITEMS),
  goat: SK.pack('td-farmer:goat', [
    {key: 'a_whip', name: 'Head Butt', icon: '🐐', look: 'rock', desc: 'BONK! {dmg} Will and a push back.'}, {key: 'a_bounce', name: 'Chicken Stampede', icon: '🐔', look: 'sun', desc: '{cnt} chickens peck for {dmg} Will each.'},
    {key: 'a_meteor', name: 'Egg Drop', icon: '🥚', look: 'sun', desc: 'Eggs from the sky: {dmg} Will round the spot.'}, {key: 'pa_power', name: 'Hard Horns', icon: '🦴'}, {key: 'pa_crit', name: 'Lucky Bell', icon: '🔔'},
    {key: 'b_minion', name: 'Flock Friends', icon: '🐑', look: 'candy', desc: '{cnt} sheep stand on the path — a live wall they must walk round — for {dur}s.'}, {key: 'b_gold', name: 'Seed Fetch', icon: '🌰', look: 'gold', desc: 'Chewy fetches seeds: +🌰 and +{heal} 🎃.'},
    {key: 'b_haste', name: 'Happy Bleat', icon: '🎶', look: 'music', desc: 'Your plants work faster for {dur}s.'}, {key: 'b_flyer', name: 'Farm Dog', icon: '🐕', look: 'sun', desc: 'Rex chases the one in front for {dur}s: a nip ({dmg} Will) + a push back.'}, {key: 'pb_summon', name: 'Big Flock', icon: '🐑'}, {key: 'pb_cd', name: 'Busy Goat', icon: '⏱️'},
    {key: 'c_mine', name: 'Cow Pat', icon: '💩', look: 'goo', desc: 'Splat — a cow pat: {dmg} Will round it.'}, {key: 'c_lava', name: 'Muddy Pig Pen', icon: '🐷', look: 'goo', desc: 'A mud puddle: slow + Will drain for {dur}s.'},
    {key: 'c_splash', name: 'Duck Pond', icon: '🦆', look: 'water', desc: 'Ducks splash them {push} tiles back.'}, {key: 'pc_big', name: 'Big Puddles', icon: '⭕'}, {key: 'pc_more', name: 'More Pats', icon: '➕'},
    {key: 'd_wall', name: 'Wool Wall', icon: '🐑', look: 'bubble', desc: 'A fluffy wool wall on the path — they must push through.'}, {key: 'd_armor', name: 'Woolly Guard', icon: '🧶', look: 'holy', desc: 'For {dur}s half the pumpkins they grab are saved.'},
    {key: 'd_heal', name: 'Pumpkin Fetch', icon: '🎃', look: 'nature', desc: '+{heal} 🎃 pumpkins back on the pile.'}, {key: 'pd_regen', name: 'Goat Milk', icon: '🥛'},
    {key: 'e_fear', name: 'Goat Scream', icon: '😝', look: 'shadow', desc: 'AAAAH! They run back for {dur}s.'}, {key: 'e_confuse', name: 'Bee Hive', icon: '🐝', look: 'honey', desc: 'Bees! They run the wrong way for {dur}s.'},
    {key: 'e_push', name: 'Big Sneeze', icon: '🤧', look: 'wind', desc: 'ACHOO! Everyone near is blown {push} tiles back.'}, {key: 'e_chew', name: 'Paper Chew', icon: '📄', look: 'paper', desc: 'Chewy eats the paperwork of the {cnt} closest — back to the start to fill it in again!'}, {key: 'pe_slow', name: 'Sticky Fur', icon: '🧷'},
    {key: 'u_meteor', name: 'Egg Storm', icon: '🥚', look: 'sun'}, {key: 'u_army', name: 'Woolly Stampede', icon: '🐑', look: 'candy'}, {key: 'u_field', name: 'Pasture Party', icon: '💩', look: 'goo'},
    {key: 'u_fort', name: 'Goat Fort', icon: '🐐', look: 'holy'}, {key: 'u_charm', name: 'Golden Bleat', icon: '🌟', look: 'gold'},
    {key: 'x_burst', name: 'Pepper Stampede', icon: '🌶️'}, {key: 'x_guard', name: 'Hay Fort', icon: '🏰'}, {key: 'x_wall', name: 'Mud Splash Party', icon: '🐷'},
  ]),
  foes: SK.pack('td-farmer:foes', [
    {key: 'en_hope', name: 'Thick Folders', icon: '📁'}, {key: 'en_speed', name: 'Running Shoes', icon: '👟'}, {key: 'en_armor', name: 'Rain Coats', icon: '🧥'},
    {key: 'en_heal', name: 'Coffee Break', icon: '☕'}, {key: 'en_rush', name: 'Office Rush', icon: '🏃'}, {key: 'en_shield', name: 'Paper Shields', icon: '📄'},
    {key: 'en_jam', name: 'Red Tape', icon: '🎀'}, {key: 'en_more', name: 'Bring Interns', icon: '👥'}, {key: 'en_trapdodge', name: 'Hop Over', icon: '🦘'},
  ]),
};
const COMBOS = [{key: 'x_burst', cols: ['A', 'E'], name: '🌶️🐔 Pepper Stampede'}, {key: 'x_guard', cols: ['D', 'B'], name: '🌾🐑 Hay Fort'}, {key: 'x_wall', cols: ['C', 'A'], name: '🕳️🐷 Mud Splash Party'}];
const HEROES = {
  farmer: {name: 'Farmer', icon: '👨‍🌾', forms: ['Straw-Hat Farmer', 'Master Schemer', 'Grand Schemer'], formIcons: ['👨‍🌾', '🧑‍🌾', '🧙'], dmg: 7, rate: 1.4, range: 3.6},
  goat: {name: 'Chewy', icon: '🐐', forms: ['Kid Chewy', 'Mountain Chewy', 'Golden Billy'], formIcons: ['🐐', '🐐', '🌟'], dmg: 6, rate: 1.1, range: 2.2},
};
const stageOf = tier => tier >= 10 ? 5 : tier >= 7 ? 4 : tier >= 5 ? 3 : tier >= 3 ? 2 : 1;   // 🐣 5 SHAPE stages on tiers 1 · 3 · 5 · 7 · 10

/* ---------- 🏝️ the island + farm (an IsoKit map — the page bakes the SAME map) ---------- */
function rimOf(n){ const R = rngOf(n * 13 + 1), ph1 = R() * 6, ph2 = R() * 6, ph3 = R() * 6; return th => 9.4 + 0.8 * Math.sin(3 * th + ph1) + 0.6 * Math.sin(5 * th + ph2) + 0.35 * Math.sin(8 * th + ph3); }
const HOUSE = [[12, 12], [13, 12], [12, 13], [13, 13]], DOOR = {i: 13, j: 14}, PILE = {i: 12, j: 14};   // 🏡 farmhouse 2 × 2 on world (7–9, 7–9), door on its front (+y) side · 🎃 fd-1b: the pumpkin pile (= your hearts) left of the door
const inPond = (C, i, j) => !!C.pond && Math.hypot((wx(i) - C.pond.x) / C.pond.rx, (wx(j) - C.pond.y) / C.pond.ry) < 1;   // 🌊 fd-2b
function buildIsland(C, rng){
  const rim = rimOf(C.n), solid = new Uint8Array(N * N), fade = new Float32Array(N * N), pond = new Uint8Array(N * N);
  for(let j = 0; j < N; j++) for(let i = 0; i < N; i++){ const x = wx(i), y = wx(j), dc = dist(x, y, CX, CY), out = dc - rim(Math.atan2(y - CY, x - CX)), k = j * N + i;
    fade[k] = out > 1.0 ? 0 : out > 0.7 ? 0.2 : out > 0.1 ? 0.48 : out > -0.7 ? 0.8 : 1; solid[k] = fade[k] === 1 ? 1 : 0; if(solid[k] && inPond(C, i, j)){ pond[k] = 1; solid[k] = 0; } }
  const map = ISO.map({w: N, h: N, theme: 'td-farm', seed: C.n * 7, base: 1.4, cell: (i, j) => { const k = j * N + i; if(!fade[k]) return {t: 'void'};
    if(pond[k]) return {t: 'water', h: 0, fade: fade[k], block: 1};
    return {t: (i * 7 + j * 3) % 5 === 0 ? 'flower' : 'grass', h: 0, fade: fade[k], block: solid[k] ? 0 : 1}; }});
  HOUSE.forEach(([i, j]) => map.setBlock(i, j, 1)); map.setBlock(PILE.i, PILE.j, 1);
  return {map, solid, rim, pond};
}
function gateCell(isl, ang){ // the farthest solid cell along that angle from the farm = where they walk in
  let best = null; for(let r = 3; r < 13; r += 0.25){ const x = CX + Math.cos(ang) * r, y = CY + Math.sin(ang) * r, i = Math.floor(x + O), j = Math.floor(y + O);
    if(i >= 0 && j >= 0 && i < N && j < N && isl.solid[j * N + i]) best = {i, j}; } return best; }

/* ---------- a new match ---------- */
function newMatch(o){
  o = o || {}; const B = BOOKS.farmer, C = B.chapters[(o.chapter || 1) - 1], lvl = clamp(o.level | 0, 0, 5), L = LEVELS[lvl];
  const rng = rngOf(o.seed != null ? o.seed : (Date.now() & 0xffffff));
  const isl = buildIsland(C, rng);
  const M = {fd: true, book: 'farmer', B, C, L, lvl, rng, t: 0, wt: 0, wave: -1, state: 'pick', queue: [], paused: false, speed: 1, map: isl.map, isl,
    gates: [], door: Object.assign({}, DOOR), plants: [], enemies: [], traps: [], zones: [], blockers: [], helpers: [], fx: [], ev: [], spawnQ: [], idN: 1,
    hearts: L.hearts + (o.bonusHearts | 0), heartsMax: L.hearts + (o.bonusHearts | 0), seeds: L.seeds + (o.bonusSeeds | 0), score: 0, breakLen: L.brk,
    shieldHp: 0, shieldT: 0, armorT: 0, armorV: 0, domeT: 0, reflectN: 0, hasteT: 0, hasteV: 0, rain: false, freeMoveT: 0, routeDone: false,
    cd: {farmer: {}, goat: {}}, readyT: {farmer: {}, goat: {}}, jam: {farmer: {}, goat: {}}, auto: {farmer: !!o.auto, goat: !!o.auto}, enCd: {}, mods: {},
    heroes: {farmer: {x: CX - 0.2, y: CY - 0.2, z: 1.6, atk: 0.6}, goat: {x: CX + 1.2, y: CY + 1.7, atk: 0.9, tx: CX + 1.2, ty: CY + 1.7}},
    stats: {quits: 0, waves: 0, perfect: 0, evolves: 0, ultimates: 0, combos: 0, casts: 0, plants: 0, grows: 0, steps: 0, lost: 0}, lostThisWave: 0, instant: !!o.instant,
    water: new Uint8Array(N * N), noBuild: new Uint8Array(N * N), canals: [], ditches: [], bridges: [], sw: [], hedge: [], mud: new Set(), unflip: []};   // 🌊 ✦ fd-2b
  isl.pond.forEach((v, k) => { if(v) M.water[k] = 1; });
  C.gates.forEach(g => addGate(M, g));
  if(C.hedge) buildHedge(M, C.hedge);
  placeRocks(M, C.rocks || 0);
  if(C.mud) placeMud(M, C.mud);
  M.baseSteps = Math.max.apply(null, M.gates.map(g => flowOf(M).at(g.i, g.j)));
  M.trees = {
    farmer: SK.tree({pack: C.pond ? PACKS.farmerPond : PACKS.farmer, hero: 'farmer', forms: HEROES.farmer.forms, cards: L.cards, glow: L.glow > 0, rng, combos: COMBOS}),
    goat: SK.tree({pack: PACKS.goat, hero: 'goat', forms: HEROES.goat.forms, cards: L.cards, glow: L.glow > 0, rng, combos: COMBOS}),
    foes: SK.tree({pack: PACKS.foes, hero: 'foes', forms: ['Collectors', 'Office Team', 'The Whole Bank'], cards: 3, rng, bot: true}),
  };
  M.trees.farmer.partner = M.trees.goat; M.trees.goat.partner = M.trees.farmer;
  M.glowLeft = L.glow; M.queue = pickQueue(M); refreshMods(M);
  return M;
}
function addGate(M, name){ const g = gateCell(M.isl, GATE_A[name]); if(!g) return null; const a = GATE_A[name], G = {name, i: g.i, j: g.j, ang: a, ox: wx(g.i) + Math.cos(a) * 1.6, oy: wx(g.j) + Math.sin(a) * 1.6}; M.gates.push(G); M.flow = null; return G; }
function placeRocks(M, n){ const R = rngOf(M.C.n * 31 + 7); let tries = 0;
  while(n > 0 && tries++ < 400){ const i = 3 + Math.floor(R() * (N - 6)), j = 3 + Math.floor(R() * (N - 6)); if(!buildable(M, i, j, true) || Math.hypot(wx(i) - CX, wx(j) - CY) < 3.2) continue;
    if(M.gates.some(g => Math.abs(g.i - i) + Math.abs(g.j - j) < 3)) continue; if(ISO.wouldSeal(M.map, {i, j}, M.gates, M.door)) continue;
    M.map.setBlock(i, j, 1); (M.rocks || (M.rocks = [])).push({i, j, x: wx(i), y: wx(j), v: Math.floor(R() * 3)}); M.flow = null; n--; } }
function pickQueue(M){ return ['farmer', 'goat'].filter(h => M.trees[h].tier < 10); }
function refreshMods(M){ ['farmer', 'goat', 'foes'].forEach(h => { M.mods[h] = M.trees[h].mods(); }); }
function ev(M, k, o){ M.ev.push(Object.assign({k, t: M.t}, o || {})); }
function fx(M, k, o){ M.fx.push(Object.assign({k, t: 0, dur: 0.5}, M._src ? {sk: M._src} : null, o)); }
function takeEvents(M){ const e = M.ev; M.ev = []; return e; }

/* ---------- 🧭 the maze (IsoKit flow field from the farm door) ---------- */
function flowOf(M){ if(!M.flow || M.flow.ver !== M.map.ver) M.flow = ISO.flow(M.map, M.door); return M.flow; }
function stepsOf(M){ const F = flowOf(M); return M.gates.map(g => F.at(g.i, g.j)); }
function pathOf(M, g){ return flowOf(M).path(g.i, g.j); }
const isGate = (M, i, j) => M.gates.some(g => g.i === i && g.j === j);
function buildable(M, i, j, quiet){ if(i < 0 || j < 0 || i >= N || j >= N) return false; const k = j * N + i; if(!M.isl.solid[k] || M.map.block[k] || M.water[k] || M.noBuild[k]) return false;
  if(i === M.door.i && j === M.door.j) return false; if(isGate(M, i, j)) return false; if(Math.abs(i - M.door.i) + Math.abs(j - M.door.j) < 1) return false; return true; }
function occupied(M, i, j){ return M.enemies.some(e => !e.gone && ((e.ci === i && e.cj === j) || (e.ti === i && e.tj === j))); }
// can a plant go here? → {ok, why}  (why: 'no' · 'seal' · 'busy' · 'seeds' · 'locked')
function costOf(M, kind, i, j){ const K = kindOf(kind); if(!K) return 0; return PLANTS[kind] && i != null && nearWater(M, i, j) ? Math.max(1, Math.round(K.cost * WATER_OFF)) : K.cost; }   // 💧 fd-2b
function canPlant(M, i, j, kind){
  if(kind === 'bridge') return canBridge(M, i, j);
  if(kind && kindOf(kind).ch > M.C.n) return {ok: false, why: 'locked'};
  if(!buildable(M, i, j)) return {ok: false, why: 'no'};
  if(occupied(M, i, j)) return {ok: false, why: 'busy'};
  const starts = M.gates.concat(M.enemies.filter(e => !e.gone && !e.entering).map(e => ({i: e.ti, j: e.tj})));
  if(ISO.wouldSeal(M.map, {i, j}, starts, M.door)) return {ok: false, why: 'seal'};
  if(kind && M.seeds < costOf(M, kind, i, j)) return {ok: false, why: 'seeds'};
  return {ok: true};
}
// what planting there would do to the walk: the longest gate walk before → after (for "+N steps")
function previewSteps(M, i, j){ const before = Math.max.apply(null, stepsOf(M)), k = j * N + i, was = M.map.block[k]; M.map.block[k] = 1;
  const F = ISO.flow(M.map, M.door), after = Math.max.apply(null, M.gates.map(g => F.at(g.i, g.j))); M.map.block[k] = was;
  return {before, after, gain: after - before, paths: M.gates.map(g => F.path(g.i, g.j))}; }
// 🌱 Basic / 👻 hints: good free cells — the walk gets longer (gain), or the cell is ON the walk and leans on a wall (so walls grow into a maze)
function bestSpots(M, n){
  const F = flowOf(M), seen = new Set(), cand = [], out = [], onPath = new Set();
  M.gates.forEach(g => { const P = F.path(g.i, g.j) || []; P.forEach(p => { const i = Math.floor(p.x), j = Math.floor(p.y); onPath.add(i + ',' + j); for(let dj = -1; dj <= 1; dj++) for(let di = -1; di <= 1; di++){ const a = i + di, b = j + dj, key = a + ',' + b; if(!seen.has(key)){ seen.add(key); cand.push([a, b]); } } }); });
  const sum = F2 => M.gates.reduce((s, g) => s + Math.max(0, F2.at(g.i, g.j)), 0), base = sum(F), blk = (i, j) => i < 0 || j < 0 || i >= N || j >= N || !!M.map.block[j * N + i];
  cand.forEach(([i, j]) => { if(!canPlant(M, i, j).ok) return; const k = j * N + i; M.map.block[k] = 1; const F2 = ISO.flow(M.map, M.door); M.map.block[k] = 0;
    const gain = sum(F2) - base, lean = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => blk(i + a, j + b)).length, on = onPath.has(i + ',' + j);
    const near = Math.hypot(wx(i) - CX, wx(j) - CY);
    out.push({i, j, gain, score: gain * 10 + (on ? 4 : 0) + Math.min(2, lean) * 3 - (lean > 2 ? 6 : 0) + (near < 3 ? -3 : 0)}); });
  out.sort((a, b) => b.score - a.score || a.i - b.i || a.j - b.j); return out.slice(0, n || 3);
}
function plant(M, i, j, kind){
  if(kind === 'canal') return dig(M, i, j); if(kind === 'bridge') return buildBridge(M, i, j);   // 🌊 ✦ fd-2b
  const c = canPlant(M, i, j, kind); if(!c.ok){ ev(M, 'noPlant', {i, j, why: c.why, kind}); return null; }
  const K = PLANTS[kind], cost = costOf(M, kind, i, j); M.seeds -= cost; M.map.setBlock(i, j, 1); M.flow = null;
  const P = {id: M.idN++, kind, st: 1, br: -1, i, j, x: wx(i), y: wx(j), cd: 0.6 + M.rng() * 0.6, spent: cost, born: M.t, aim: 0, wet: cost < K.cost};
  M.plants.push(P); M.stats.plants++; ev(M, 'plant', {id: P.id, kind, i, j, x: P.x, y: P.y}); retarget(M); return P;
}
/* ---------- 🌊 ✦ fd-2b the pond chapter: 🌽 corn hedge + 2 corn gates + lever · 🟫 mud · 🌊 canals · 🌉 lift bridges · ⛵ the boat gate ---------- */
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const isWater = (M, i, j) => i >= 0 && j >= 0 && i < N && j < N && M.water[j * N + i] > 0;
function nearWater(M, i, j){ return !!M.water && N4.some(([a, b]) => isWater(M, i + a, j + b) && !bridgeAt(M, i + a, j + b)); }
function startsOf(M){ return M.gates.concat(live(M).map(e => ({i: e.ci, j: e.cj}))); }
const sealsIf = (M, i, j) => ISO.wouldSeal(M.map, {i, j}, startsOf(M), M.door);
function buildHedge(M, H){   // a corn hedge down one column, edge to edge, with 2 corn gates (one open) + a lever beside them
  for(let j = 0; j < N; j++){ const k = j * N + H.i; if(!M.isl.solid[k]) continue; M.noBuild[k] = 1; if(j === H.open || j === H.shut) continue; M.map.setBlock(H.i, j, 1); M.hedge.push({i: H.i, j}); }
  M.map.setBlock(H.i, H.shut, 1); const L = {i: H.lever[0], j: H.lever[1]}; M.map.setBlock(L.i, L.j, 1); M.noBuild[L.j * N + L.i] = 1;
  M.sw.push({id: M.idN++, cells: [{i: H.i, j: H.open}, {i: H.i, j: H.shut}], open: 0, lever: L, rest: 0, x: wx(L.i), y: wx(L.j)}); M.flow = null; }
function placeMud(M, n){   // 🟫 mud on the walks (bikes crawl here) — cells 3–5 steps in from each gate
  const F = flowOf(M); M.gates.forEach(g => { const P = F.path(g.i, g.j) || []; [3, 5].forEach(q => { const p = P[q]; if(p && M.mud.size < n) M.mud.add(Math.floor(p.x) + ',' + Math.floor(p.y)); }); }); }
const muddy = (M, i, j) => M.mud.has(i + ',' + j);
function canalAt(M, i, j){ return M.canals.find(c => c.i === i && c.j === j) || null; }
function bridgeAt(M, i, j){ return M.bridges.find(B => B.i === i && B.j === j) || null; }
function switchAt(M, i, j){ return M.sw.find(S => (S.lever.i === i && S.lever.j === j) || S.cells.some(c => c.i === i && c.j === j)) || null; }
function dig(M, i, j){
  const c = canPlant(M, i, j, 'canal'); if(!c.ok){ ev(M, 'noPlant', {i, j, why: c.why, kind: 'canal'}); return null; }
  const k = j * N + i; M.seeds -= TOOLS.canal.cost; M.map.setBlock(i, j, 1); M.water[k] = 2; const C2 = {id: M.idN++, i, j, x: wx(i), y: wx(j), born: M.t}; M.canals.push(C2); M.flow = null;
  M.stats.canals = (M.stats.canals || 0) + 1; ev(M, 'dig', {id: C2.id, i, j, x: C2.x, y: C2.y}); retarget(M); return C2; }
function fill(M, i, j){ const C2 = canalAt(M, i, j); if(!C2) return 0; const B = bridgeAt(M, i, j); let back = 1; if(B){ M.bridges = M.bridges.filter(q => q !== B); back += 1; }
  M.canals = M.canals.filter(q => q !== C2); M.water[j * N + i] = 0; M.map.setBlock(i, j, 0); M.flow = null; M.seeds += back; ev(M, 'fill', {i, j, x: C2.x, y: C2.y, back}); retarget(M); return back; }
function canBridge(M, i, j){ if(TOOLS.bridge.ch > M.C.n) return {ok: false, why: 'locked'}; if(!canalAt(M, i, j)) return {ok: false, why: 'nocanal'}; if(bridgeAt(M, i, j)) return {ok: false, why: 'no'};
  if(M.seeds < TOOLS.bridge.cost) return {ok: false, why: 'seeds'}; return {ok: true}; }
function buildBridge(M, i, j){ const c = canBridge(M, i, j); if(!c.ok){ ev(M, 'noPlant', {i, j, why: c.why, kind: 'bridge'}); return null; }
  const along = isWater(M, i - 1, j) || isWater(M, i + 1, j);   // the canal runs along x → the planks span across it (walk along y)
  const B = {id: M.idN++, i, j, x: wx(i), y: wx(j), up: 0, rest: 0, along, born: M.t}; M.seeds -= TOOLS.bridge.cost; M.bridges.push(B); M.map.setBlock(i, j, 0); M.flow = null;
  M.stats.bridges = (M.stats.bridges || 0) + 1; ev(M, 'bridge', {id: B.id, i, j, x: B.x, y: B.y}); return B; }
// 🌉 tap = lift (blocked — never seals, nobody on it) / lower (they cross) · 4 s rest after a tap (a skill flip skips the rest)
function toggleBridge(M, id, o){ o = o || {}; const B = M.bridges.find(q => q.id === id); if(!B) return {ok: false, why: 'no'};
  if(!o.skill && B.rest > 0) return {ok: false, why: 'rest', left: B.rest};
  if(!B.up){ if(occupied(M, B.i, B.j)) return {ok: false, why: 'busy'}; if(sealsIf(M, B.i, B.j)) return {ok: false, why: 'seal'}; M.map.setBlock(B.i, B.j, 1); B.up = 1; }
  else { M.map.setBlock(B.i, B.j, 0); B.up = 0; }
  if(!o.skill) B.rest = BRIDGE_REST; B.t0 = M.t; M.flow = null; retarget(M); M.stats.lifts = (M.stats.lifts || 0) + 1; ev(M, 'lift', {id: B.id, up: B.up, x: B.x, y: B.y, skill: !!o.skill}); return {ok: true, up: B.up}; }
// 🌽 the lever: the open corn gate shuts, the other opens → the walk swaps lanes (refused when the shut one would seal the farm or someone stands in it)
function flip(M, id, o){ o = o || {}; const S = M.sw.find(q => q.id === id); if(!S) return {ok: false, why: 'no'};
  if(!o.skill && S.rest > 0) return {ok: false, why: 'rest', left: S.rest};
  const shut = S.cells[S.open], open = S.cells[1 - S.open]; if(occupied(M, shut.i, shut.j)) return {ok: false, why: 'busy'};
  M.map.setBlock(open.i, open.j, 0); if(sealsIf(M, shut.i, shut.j)){ M.map.setBlock(open.i, open.j, 1); return {ok: false, why: 'seal'}; }
  M.map.setBlock(shut.i, shut.j, 1); S.open = 1 - S.open; if(!o.skill) S.rest = LEVER_REST; S.t0 = M.t; M.flow = null; retarget(M); M.stats.flips = (M.stats.flips || 0) + 1;
  ev(M, 'switch', {id: S.id, open: S.open, x: S.x, y: S.y, skill: !!o.skill}); return {ok: true}; }
// ⛵ the boat gate: they row across and land on the FAR bank of the pond (the shore cell farthest from the farm that still reaches it)
function addBoatGate(M){ const P = M.C.pond, F = flowOf(M); let best = null, bs = -1e9;
  for(let j = 0; j < N; j++) for(let i = 0; i < N; i++){ const k = j * N + i; if(!M.isl.solid[k] || M.map.block[k] || M.water[k] || M.noBuild[k] || M.isl.pond[k]) continue;
    if(!N4.some(([a, b]) => { const q = (j + b) * N + i + a; return q >= 0 && q < N * N && M.isl.pond[q]; }) || F.at(i, j) <= 0 || isGate(M, i, j)) continue;
    const d = dist(wx(i), wx(j), CX, CY) - Math.abs(wx(i) - P.x) * 0.05; if(d > bs){ bs = d; best = {i, j}; } }
  if(!best) return null; const ang = Math.atan2(P.y - wx(best.j), P.x - wx(best.i)), G = {name: 'boat', boat: true, i: best.i, j: best.j, ang, ox: wx(best.i) + Math.cos(ang) * 1.5, oy: wx(best.j) + Math.sin(ang) * 1.5};
  M.gates.push(G); M.flow = null; return G; }
function inMud(M, e){ return muddy(M, e.ci, e.cj) || e.wetT > 0 || nearWater(M, e.ci, e.cj) || M.traps.some(T => T.kind === 'lava' && dist(T.x, T.y, e.x, e.y) <= T.r); }
// 🔁 timers that run in the break too: bridge / lever rests, skill flips that go back, ditches that dry up
function pondTimers(M, dt){
  M.bridges.forEach(B => { if(B.rest > 0) B.rest = Math.max(0, B.rest - dt); }); M.sw.forEach(S => { if(S.rest > 0) S.rest = Math.max(0, S.rest - dt); });
  M.unflip = M.unflip.filter(u => { u.t -= dt; if(u.t > 0) return true; const r = u.k === 'sw' ? flip(M, u.id, {skill: true}) : toggleBridge(M, u.id, {skill: true}); if(r.ok) return false; u.t = 0.3; return true; });
  M.ditches = M.ditches.filter(D => { D.t -= dt; if(D.t > 0) return true; M.water[D.j * N + D.i] = 0; M.map.setBlock(D.i, D.j, 0); M.flow = null; ev(M, 'dry', {x: D.x, y: D.y}); return false; }); }
function plantAt(M, i, j){ return M.plants.find(P => P.i === i && P.j === j) || null; }
function grow(M, id, br){
  const P = M.plants.find(q => q.id === id); if(!P || P.st >= 5) return false; const cost = growCost(P, M);
  if(M.seeds < cost){ ev(M, 'noPlant', {i: P.i, j: P.j, why: 'seeds', kind: P.kind}); return false; }
  if(P.st === 3){ if(br !== 0 && br !== 1) return false; P.br = br; }
  M.seeds -= cost; P.spent += cost; P.st++; M.stats.grows++; ev(M, 'grow', {id: P.id, kind: P.kind, st: P.st, br: P.br, x: P.x, y: P.y}); return true;
}
function pull(M, id){ const P = M.plants.find(q => q.id === id); if(!P) return 0; const back = Math.floor(P.spent / 2); M.seeds += back; M.map.setBlock(P.i, P.j, 0); M.flow = null;
  M.plants = M.plants.filter(q => q !== P); ev(M, 'pull', {id, x: P.x, y: P.y, back}); retarget(M); return back; }
function moveCost(M){ return M.freeMoveT > 0 ? 0 : 1; }
function move(M, id, i, j){
  const P = M.plants.find(q => q.id === id); if(!P) return false; const cost = moveCost(M); if(M.seeds < cost) return false;
  M.map.setBlock(P.i, P.j, 0); const c = canPlant(M, i, j); if(!c.ok){ M.map.setBlock(P.i, P.j, 1); ev(M, 'noPlant', {i, j, why: c.why, kind: P.kind}); return false; }
  M.seeds -= cost; M.map.setBlock(i, j, 1); const fx0 = P.x, fy0 = P.y; P.i = i; P.j = j; P.x = wx(i); P.y = wx(j); M.flow = null; ev(M, 'move', {id, x: P.x, y: P.y, fx: fx0, fy: fy0}); retarget(M); return true;
}
// after the maze changes everyone keeps walking from where they stand (their next cell is re-picked on arrival — never through a wall)
function retarget(M){ const F = flowOf(M); M.enemies.forEach(e => { if(e.gone || e.entering) return; if(F.at(e.ti, e.tj) < 0){ e.ti = e.ci; e.tj = e.cj; e.prog = 1 - e.prog; } }); }

/* ---------- 🃏 picks (the game waits while the cards are open) ---------- */
function offer(M){ if(M.state !== 'pick' || !M.queue.length) return null; const h = M.queue[0], T = M.trees[h]; T.glow = M.glowLeft > 0; const o = T.offer(); if(!o){ M.queue.shift(); return offer(M); } return o; }
function take(M, card){
  const h = M.queue[0], T = M.trees[h]; if(!h || !card) return; const ch = T.take(card);
  if(card.type === 'evolve'){ M.stats.evolves++; ev(M, 'evolve', {hero: h, form: T.form, col: card.col}); }
  if(card.type === 'ultimate'){ M.stats.ultimates++; ev(M, 'ultimate', {hero: h, key: card.key}); }
  if(card.type === 'combo'){ M.stats.combos++; ev(M, 'combo', {hero: h, key: card.key}); }
  ev(M, 'picked', {hero: h, card: card.key, type: card.type, col: card.col, tier: T.tier});
  M.queue.shift(); refreshMods(M);
  if(!M.queue.length){ if(M.glowLeft > 0) M.glowLeft--; enterBreak(M); }
  return ch;
}
function enterBreak(M){ M.state = 'break'; M.wt = 0;
  const NG = M.C.newGate; if(NG && !M.routeDone && M.wave + 1 === NG.after && !(M.lvl === 0 && M.C.n === 1)){ M.routeDone = true; const before = stepsOf(M);
    const g = NG.boat ? addBoatGate(M) : addGate(M, NG.gate); if(g){ const s = flowOf(M).at(g.i, g.j); M.freeMoveT = 20; ev(M, 'newRoute', {gate: g.name, who: NG.who, old: Math.max.apply(null, before), now: s, i: g.i, j: g.j, boat: !!NG.boat}); } } }
function startWave(M){
  if(M.state !== 'break') return false;
  M.wave++; M.state = 'wave'; M.wt = 0; M.lostThisWave = 0; M.spawnQ = []; M.freeMoveT = 0;
  M.rain = !!(M.C.rain && M.C.rain.includes(M.wave));
  const groups = M.C.waves[M.wave], more = M.mods.foes.enMore || 0;
  groups.forEach(g => { const [type, n0, gate, gap, at] = g, n = n0 + (FOES[type].boss ? 0 : Math.round(more));
    for(let i = 0; i < n; i++) M.spawnQ.push({type, at: at + i * gap, gate: gate < 0 ? i % M.gates.length : Math.min(gate, M.gates.length - 1)}); });
  M.spawnQ.sort((a, b) => a.at - b.at);
  const st = stepsOf(M); M.stats.steps = Math.max(M.stats.steps, Math.max.apply(null, st));
  ev(M, 'wave', {n: M.wave + 1, of: M.C.waves.length, boss: groups.some(g => FOES[g[0]].boss), rain: M.rain, steps: Math.max.apply(null, st)});
  return true;
}
function spawn(M, type, gi){
  const S = FOES[type], L = M.L, m = M.mods.foes, wv = Math.max(0, M.wave), G = M.gates[gi] || M.gates[0];
  const will = S.will * L.will * (1 + 0.11 * wv) * (1 + (m.enHp || 0)) * wrOf(M.C, M.lvl);   // ⚖️ wr-1
  const e = {id: M.idN++, type, S, gate: gi, x: G.ox, y: G.oy, ci: G.i, cj: G.j, ti: G.i, tj: G.j, prog: 0, di: 0, dj: 0, will, willMax: will, spd: S.spd * L.spd * (1 + (m.enSpeed || 0)),
    entering: true, ex: G.ox, ey: G.oy, steps: 0, slowT: 0, slowF: 0, sleepT: 0, stunT: 0, blindT: 0, burnT: 0, burnD: 0, stopT: 0, backN: 0, confT: 0, shield: 0, umbT: 0,
    spot: S.spot || 0, skT: 4 + M.rng() * 3, rushT: 0, boss: !!S.boss, born: M.t, gone: 0, hit: 0};
  M.enemies.push(e); if(e.boss) ev(M, 'boss', {type, name: S.name}); return e;
}
function live(M){ return M.enemies.filter(e => !e.gone && !e.entering); }
function liveAll(M){ return M.enemies.filter(e => !e.gone); }
function cellDist(M, e){ const d = flowOf(M).at(e.ci, e.cj); return d < 0 ? 999 : d - (e.ti !== e.ci || e.tj !== e.cj ? e.prog : 0); }
function front(M){ let b = null, bd = 1e9; live(M).forEach(e => { const d = cellDist(M, e); if(d < bd){ bd = d; b = e; } }); return b; }

/* ---------- 😩 Will (not health): attacks drain it, so does walking; at 0 they QUIT ---------- */
function hit(M, e, dmg, src){
  if(!e || e.gone || dmg <= 0) return; const m = M.mods.foes; dmg *= 1 - Math.min(0.6, m.enArmor || 0);
  if(e.shield > 0){ const s = Math.min(e.shield, dmg); e.shield -= s; dmg -= s; }
  e.will -= dmg; e.hit = 0.25; if(e.will <= 0) quit(M, e, src);
}
function quit(M, e, src){
  if(e.gone) return; e.gone = 1; e.quitT = M.t; const gm = 1 + ((M.mods.farmer.goldMul || 0) + (M.mods.goat.goldMul || 0)) * 0.5, seeds = Math.max(1, Math.round(e.S.seeds * gm));
  M.seeds += seeds; const pts = e.S.pts * M.L.mult; M.score += pts; M.stats.quits++;
  ev(M, 'quit', {id: e.id, type: e.type, x: e.x, y: e.y, seeds, pts, boss: e.boss, src: src || '', tired: src === 'tired'});
}
function pay(M, e){
  e.gone = 2; let n = e.S.take;
  if(M.reflectN > 0){ M.reflectN--; e.gone = 0; sendBack(M, e); ev(M, 'reflect', {x: e.x, y: e.y}); return; }
  if(M.domeT > 0){ ev(M, 'shielded', {x: e.x, y: e.y, n}); return; }
  if(M.shieldHp > 0 && M.shieldT > 0){ const s = Math.min(M.shieldHp, n); M.shieldHp -= s; n -= s; if(!n){ ev(M, 'shielded', {x: e.x, y: e.y}); return; } }
  if(M.armorT > 0 && M.rng() < M.armorV) n = Math.floor(n / 2);
  const ar = (M.mods.farmer.armor || 0) + (M.mods.goat.armor || 0); if(ar && M.rng() < ar) n = Math.max(0, n - 1);
  if(!n){ ev(M, 'shielded', {x: e.x, y: e.y}); return; }
  M.hearts -= n; M.lostThisWave += n; M.stats.lost += n; ev(M, 'pay', {x: e.x, y: e.y, n, type: e.type, boss: e.boss});
  if(M.hearts <= 0){ const ls = (M.mods.farmer.lastStand || 0) + (M.mods.goat.lastStand || 0); if(ls && !M.lastStandUsed){ M.lastStandUsed = 1; M.hearts = 3; ev(M, 'lastStand', {}); } else { M.hearts = 0; M.state = 'lost'; ev(M, 'lost', {}); } }
}
/* ---------- 🐑 animals (✦ fd-2a): sheep / chickens on the path, Chewy's pig pen / duck pond / cow pat, the farm dog — a 🦴 treat makes one stop to eat ---------- */
const ANIMAL_TRAP = {lava: 'pig', push: 'duck', mine: 'cow'};
function animals(M){ return [].concat(M.blockers.filter(b => b.k === 'sheep' || b.k === 'chicken'), M.traps.filter(T => T.hero === 'goat' && ANIMAL_TRAP[T.kind]), M.helpers.filter(H => H.k === 'dog')); }
function feed(M, a, dur, from){ if(!a) return; a.eatT = Math.max(a.eatT || 0, dur); if(a.wall) unwall(M, a); ev(M, 'treat', {x: a.x, y: a.y, who: a.k || ANIMAL_TRAP[a.kind], x0: from && from.x, y0: from && from.y}); fx(M, 'treat', {x0: from ? from.x : a.x, y0: from ? from.y : a.y, x: a.x, y: a.y, dur: 0.5}); }
// a sheep becomes a LIVE WALL when the cell may close (never seals the farm, never on someone, never on a gate / the door)
function canWall(M, i, j){ const k = j * N + i; if(i < 0 || j < 0 || i >= N || j >= N || !M.isl.solid[k] || M.map.block[k] || M.water[k] || M.noBuild[k]) return false; if(i === M.door.i && j === M.door.j) return false;
  if(M.gates.some(g => g.i === i && g.j === j) || occupied(M, i, j) || M.plants.some(P => P.i === i && P.j === j)) return false;
  const starts = M.gates.concat(live(M).map(e => ({i: e.ci, j: e.cj}))); return !ISO.wouldSeal(M.map, {i, j}, starts, M.door); }
function wall(M, b){ if(!canWall(M, b.i, b.j)) return false; M.map.setBlock(b.i, b.j, 1); b.wall = b.wantWall = 1; retarget(M); return true; }
function unwall(M, b){ if(!b.wall) return; b.wall = 0; M.map.setBlock(b.i, b.j, 0); }
function sendBack(M, e){ const G = M.gates[e.gate] || M.gates[0]; e.ci = e.ti = G.i; e.cj = e.tj = G.j; e.prog = 0; e.x = wx(G.i); e.y = wx(G.j); e.stunT = 0.6; }

/* ---------- 🌱 plants work (every plant is a tower) ---------- */
function plantsWork(M, dt){
  const F = flowOf(M), haste = (M.hasteT > 0 ? 1 + M.hasteV : 1) * (M.rain ? 1.2 : 1), L = live(M);
  M.plants.forEach(P => {
    P.cd -= dt * haste; P.aim = Math.max(0, P.aim - dt); if(P.cd > 0) return; const sp = plantSpec(P);
    const near = L.filter(e => dist(e.x, e.y, P.x, P.y) <= sp.range);
    if(!near.length){ P.cd = 0.25; return; }
    near.sort((a, b) => cellDist(M, a) - cellDist(M, b)); const tgt = near[0]; P.cd = sp.rate; P.aim = 0.4; P.ax = tgt.x; P.ay = tgt.y;
    const sporeOk = e => !(sp.spore && (e.S.umbrella || e.umbT > 0));
    switch(sp.atk){
      case 'puff': near.forEach(e => { if(!sporeOk(e)){ ev(M, 'umbrella', {x: e.x, y: e.y}); return; } hit(M, e, sp.dmg, 'plant'); slow(e, sp.slow, sp.dur); }); fx(M, 'puff', {x: P.x, y: P.y, r: sp.range, dur: 0.6, kind: P.kind}); break;
      case 'bonk': hit(M, tgt, sp.dmg, 'plant'); if(!tgt.boss) tgt.backN = Math.max(tgt.backN, sp.push || 1); fx(M, 'bonk', {x: tgt.x, y: tgt.y, x0: P.x, y0: P.y, dur: 0.4}); break;
      case 'sleep': near.forEach(e => { if(!sporeOk(e)){ ev(M, 'umbrella', {x: e.x, y: e.y}); return; } hit(M, e, sp.dmg, 'plant'); e.sleepT = Math.max(e.sleepT, sp.dur * (e.boss ? 0.4 : 1)); }); fx(M, 'sleep', {x: P.x, y: P.y, r: sp.range, dur: 0.9}); break;
      case 'shot': hit(M, tgt, sp.dmg, 'plant'); fx(M, 'pop', {x0: P.x, y0: P.y, x: tgt.x, y: tgt.y, dur: 0.35}); break;
      case 'aura': near.forEach(e => { hit(M, e, sp.dmg, 'plant'); slow(e, sp.slow, sp.dur); }); fx(M, 'aura', {x: P.x, y: P.y, r: sp.range, dur: 0.5}); break;
      case 'dazzle': case 'beam': hit(M, tgt, sp.dmg, 'plant'); tgt.blindT = Math.max(tgt.blindT, sp.dur * (tgt.boss ? 0.5 : 1)); fx(M, 'beam', {x0: P.x, y0: P.y, x: tgt.x, y: tgt.y, dur: 0.45, big: sp.atk === 'beam'}); break;
      case 'cone': { const a = Math.atan2(tgt.y - P.y, tgt.x - P.x); near.forEach(e => { const b = Math.atan2(e.y - P.y, e.x - P.x); let d = Math.abs(b - a); if(d > Math.PI) d = Math.PI * 2 - d; if(d <= 0.6){ hit(M, e, sp.dmg, 'plant'); e.burnT = 2; e.burnD = Math.max(e.burnD, sp.burn || 3); } }); fx(M, 'cone', {x: P.x, y: P.y, ang: a, r: sp.range, dur: 0.5}); break; }
      case 'pop': { const c = pathCellNear(M, P, sp.range); if(c){ M.traps.push({id: M.idN++, i: c.i, j: c.j, x: wx(c.i), y: wx(c.j), kind: 'pop', dmg: sp.dmg, r: 0.75, charges: 1, life: 14, from: 'plant'}); fx(M, 'toss', {x0: P.x, y0: P.y, x: wx(c.i), y: wx(c.j), dur: 0.45}); } else P.cd = 0.5; break; }
      case 'roll': { const line = rollLine(M, tgt, sp.len || 3), hitIds = new Set(); line.forEach(c => L.forEach(e => { if(!hitIds.has(e.id) && dist(e.x, e.y, wx(c.i), wx(c.j)) < 0.62){ hitIds.add(e.id); hit(M, e, sp.dmg, 'plant'); } }));
        fx(M, 'roll', {x0: P.x, y0: P.y, pts: line.map(c => [wx(c.i), wx(c.j)]), dur: 0.9, big: (sp.len || 3) > 3}); break; }
      case 'fear': near.forEach(e => { hit(M, e, sp.dmg, 'plant'); if(!e.boss) e.backN = Math.max(e.backN, sp.back || 3); }); fx(M, 'fear', {x: P.x, y: P.y, r: sp.range, dur: 0.7}); break;
    }
    ev(M, 'plantAtk', {id: P.id, kind: P.kind, atk: sp.atk});
  });
}
function slow(e, f, dur){ if(f > e.slowF || e.slowT <= 0) e.slowF = f; e.slowT = Math.max(e.slowT, dur); }
function pathCellNear(M, P, r){ const F = flowOf(M); let best = null, bd = 1e9;
  for(let j = P.j - 3; j <= P.j + 3; j++) for(let i = P.i - 3; i <= P.i + 3; i++){ const d = F.at(i, j); if(d <= 0) continue; const dd = dist(wx(i), wx(j), P.x, P.y); if(dd > r) continue;
    const on = M.enemies.some(e => !e.gone && Math.abs(e.ci - i) + Math.abs(e.cj - j) <= 3); const score = d + (on ? -20 : 0) + dd; if(score < bd){ bd = score; best = {i, j}; } } return best; }
function rollLine(M, tgt, len){ const F = flowOf(M), out = []; let c = {i: tgt.ti, j: tgt.tj}; out.push(c); for(let n = 0; n < len; n++){ const a = F.away(c.i, c.j); if(!a) break; c = a; out.push(c); } return out; }

/* ---------- 🧬 hero skills (one executor per SkillKit shape — numbers from the engine) ---------- */
function skillOf(M, h, key){ return {lv: M.trees[h].skills[key] || 1, n: SK.num(key, M.trees[h].skills[key] || 1), E: SK.get(key)}; }
function cdOf(M, h, key){ const s = skillOf(M, h, key), m = M.mods[h]; return Math.max(1.5, (s.E.cd || 8) * (1 - Math.min(0.5, (m.cdMul || 0) + (m.rateMul || 0) * 0.5))); }
const ALWAYS = new Set(['gold', 'haste', 'shield', 'heal', 'reflect', 'dome']);
const byWay = M => live(M).sort((a, b) => cellDist(M, a) - cellDist(M, b));
function canAim(M, h, key){ const E = SK.get(key); if(!E) return false; if(ALWAYS.has(E.shape)) return true; return live(M).length > 0; }
function ready(M, h, key){ return M.state === 'wave' && !M.paused && (M.cd[h][key] || 0) <= 0; }
function cast(M, h, key){
  if(!ready(M, h, key) || !canAim(M, h, key)) return false;
  const s = skillOf(M, h, key), E = s.E, n = s.n, m = M.mods[h], dmgMul = 1 + (m.dmgMul || 0), durMul = 1 + (m.durMul || 0), tgt = front(M);
  M._src = {hero: h, key};
  const D = v => (v || 0) * dmgMul * (m.crit && M.rng() < m.crit ? 2 : 1), T = v => (v || 0) * durMul, at = tgt ? {x: tgt.x, y: tgt.y} : {x: wx(M.door.i), y: wx(M.door.j)};
  const around = (p, r) => live(M).filter(e => dist(e.x, e.y, p.x, p.y) <= r);
  const ahead = k => { if(!tgt) return {i: M.door.i, j: M.door.j}; const F = flowOf(M); let c = {i: tgt.ti, j: tgt.tj}; for(let q = 0; q < k; q++){ const nx = F.next(c.i, c.j); if(!nx || (nx.i === M.door.i && nx.j === M.door.j)) break; c = nx; } return c; };
  const status = (list, f) => list.forEach(e => { if(e.spot && /trap|stop/.test(f.k || '')){ e.spot--; ev(M, 'spotted', {x: e.x, y: e.y}); return; } f(e); });
  switch(E.shape){
    case 'shot': case 'bounce': case 'chain': case 'swarm': case 'whip': {
      const cnt = Math.max(1, n.cnt || 1), list = live(M).sort((a, b) => cellDist(M, a) - cellDist(M, b)).slice(0, cnt);
      list.forEach(e => { hit(M, e, D(n.dmg), 'skill'); if(E.fx === 'push' && !e.boss) e.backN = Math.max(e.backN, Math.round(n.push || 1)); if(m.slowHit) slow(e, 0.4, 1.5); if(E.fx === 'slowpush'){ slow(e, n.slow, T(n.dur)); e.backN = Math.max(e.backN, 1); } });
      fx(M, 'skillshot', {x0: M.heroes[h].x, y0: M.heroes[h].y, pts: list.map(e => [e.x, e.y]), dur: 0.45}); break; }
    case 'cone': case 'beam': case 'meteor': case 'splash': case 'tornado': case 'storm': {
      const r = n.r && n.r < 50 ? n.r : n.len ? n.len / 2 : 1.6, all = n.r >= 50;
      if(E.shape === 'tornado' || E.shape === 'storm') M.zones.push({k: 'storm', x: at.x, y: at.y, r, dps: D(n.dmg), t: T(n.dur || 4)});
      else (all ? live(M) : around(at, r)).forEach(e => { hit(M, e, D(n.dmg), 'skill'); if(n.dot || E.fx === 'burn'){ e.burnT = T(n.dur || 3); e.burnD = Math.max(e.burnD, n.dot || 4); } if(E.fx === 'dmgstun') e.stunT = Math.max(e.stunT, T(n.dur || 2)); });
      fx(M, 'skillboom', {x: at.x, y: at.y, r: all ? 6 : r, dur: 0.7}); ev(M, 'boom', {x: at.x, y: at.y, big: all || r > 2}); break; }
    case 'trap': {
      const k = E.fx, cnt = n.every ? 4 : 1, rr = (n.r || 0.9) * (1 + (m.trapRadius || 0)), ch = (n.charges || 1) + (m.trapCharges || 0);
      for(let q = 0; q < cnt; q++){ const c = ahead(1 + q * 2); M.traps.push({id: M.idN++, i: c.i, j: c.j, x: wx(c.i), y: wx(c.j), kind: k, dmg: D(n.dmg), dot: n.dot, slowF: n.slow, dur: T(n.dur || 2), push: n.push, r: rr, charges: k === 'lava' ? 99 : ch, life: k === 'lava' ? T(n.dur || 7) : (n.life || 20), src: key, hero: h}); }
      fx(M, 'skilltrap', {x: at.x, y: at.y, dur: 0.5}); break; }
    case 'tower': { const c = ahead(2); M.helpers.push({id: M.idN++, k: 'scarecrow', x: wx(c.i) + 0.6, y: wx(c.j) - 0.6, dmg: D(n.dmg), rate: n.rate, range: n.range, cd: 0, t: T(n.dur)}); break; }
    case 'flyer': if(h === 'goat'){ const H0 = M.heroes.goat; M.helpers.push({id: M.idN++, k: 'dog', x: H0.x, y: H0.y, dmg: D(n.dmg), rate: Math.max(0.8, n.rate || 0.8), spd: 3.2, cd: 0, t: T(n.dur || 10)}); fx(M, 'skillboom', {x: H0.x, y: H0.y, r: 0.8, dur: 0.4}); break; }   // 🐕 Rex (✦ fd-2a) — the farmer's flyers stay chickens
    // fall through
    case 'minion': case 'wall': {
      const c = ahead(2), cnt = E.shape === 'wall' ? 1 : Math.max(1, Math.round((n.cnt || 2) * (1 + (m.summonMul || 0)) / 2)); for(let q = 0; q < cnt; q++){ const c2 = q ? ahead(2 + q * 2) : c;
        M.blockers.push({id: M.idN++, k: E.shape === 'wall' ? (h === 'goat' ? 'wool' : 'hay') : (h === 'goat' ? 'sheep' : 'chicken'), i: c2.i, j: c2.j, x: wx(c2.i), y: wx(c2.j), hp: (n.hp || 40) * (1 + (m.summonMul || 0)), hpMax: (n.hp || 40), dmg: D(n.dmg || 0), t: T(n.dur || 14)});
        const b = M.blockers[M.blockers.length - 1]; if(b.k === 'sheep' && wall(M, b)) ev(M, 'sheepWall', {x: b.x, y: b.y}); }
      break; }
    case 'detour': { const r = n.r || 1.8; M.zones.push({k: 'sign', x: at.x, y: at.y, r, t: T(n.dur) + 3});   // 🪧 ✦ fd-2a: follow the sign the wrong way to a dead end, read, walk back
      around(at, r).forEach(e => { if(e.spot > 0){ e.spot--; ev(M, 'spotted', {x: e.x, y: e.y}); return; } if(e.boss){ e.stopT = Math.max(e.stopT, T(n.dur) * 0.4); return; } e.signN = 2; e.signRead = T(n.dur); });
      fx(M, 'sign', {x: at.x, y: at.y, r, dur: 0.8}); break; }
    case 'blind': status(around(at, n.r || 1.8), e => { const d = T(n.dur) * (e.boss ? 0.5 : 1); e.wanderT = Math.max(e.wanderT || 0, d); });   // ✨ ✦ fd-2a: random steps, not the path
      fx(M, 'dazzle', {x: at.x, y: at.y, r: n.r || 1.8, dur: 0.7}); break;
    case 'reset': { const list = live(M).sort((a, b) => cellDist(M, a) - cellDist(M, b)).slice(0, Math.max(1, n.cnt || 1));   // 📄 ✦ fd-2a: back to the start (a boss loses part of the way)
      list.forEach(e => { fx(M, 'chew', {x: e.x, y: e.y, dur: 0.8}); if(e.boss){ const F = flowOf(M), G = M.gates[e.gate] || M.gates[0], come = Math.max(0, F.at(G.i, G.j) - Math.max(0, F.at(e.ci, e.cj))); e.backN = Math.max(e.backN, Math.round(come * (n.boss || 0.25))); }   /* 🐞 wr-1: the way it has come, not every step */ else { sendBack(M, e); e.signN = 0; e.wanderT = 0; } ev(M, 'reset', {x: e.x, y: e.y, boss: e.boss}); }); break; }
    case 'carve': { if(!tgt) break; const want = Math.max(1, Math.round(n.n || 3)), dur = T(n.dur || 20); let made = 0;   // 🌊 ✦ fd-2b: ditch cells across their walk (each one never seals)
      for(let q = 2; q <= 14 && made < want; q++){ const c = ahead(q); if(c.i === M.door.i && c.j === M.door.j) break; const k = c.j * N + c.i;
        if(!M.isl.solid[k] || M.map.block[k] || M.water[k] || M.noBuild[k] || isGate(M, c.i, c.j) || occupied(M, c.i, c.j) || sealsIf(M, c.i, c.j)) continue;
        M.map.setBlock(c.i, c.j, 1); M.water[k] = 3; M.ditches.push({i: c.i, j: c.j, x: wx(c.i), y: wx(c.j), t: dur, born: M.t}); M.flow = null; made++; retarget(M); }
      fx(M, 'ditch', {x: at.x, y: at.y, dur: 0.7}); ev(M, 'ditch', {n: made, x: at.x, y: at.y}); break; }
    case 'wave': { const L0 = byWay(M); if(!L0.length) break; const len = Math.max(2, Math.round(n.len || 5)), d0 = cellDist(M, L0[0]), F = flowOf(M);   // 🪣 ✦ fd-2b: a wave rolls back down the walk
      L0.filter(e => cellDist(M, e) <= d0 + len).forEach(e => { if(e.S.umbrella || e.umbT > 0){ ev(M, 'umbrella', {x: e.x, y: e.y}); return; }
        e.backN = Math.max(e.backN, e.boss ? 1 : Math.round(n.push || 3)); slow(e, n.slow || 0.4, T(n.dur || 4)); e.wetT = Math.max(e.wetT || 0, T(n.dur || 4)); });
      const pts = []; let c = {i: L0[0].ci, j: L0[0].cj}; pts.push([wx(c.i), wx(c.j)]); for(let q = 0; q < len; q++){ const a = F.away(c.i, c.j); if(!a) break; c = a; pts.push([wx(c.i), wx(c.j)]); }
      fx(M, 'flood', {pts, dur: 0.9}); break; }
    case 'toggle': { const dur = T(n.dur || 8); let flipped = 0;   // 🌽 ✦ fd-2b: every corn gate + bridge flips for a while, then flips back
      M.sw.forEach(S => { if(flip(M, S.id, {skill: true}).ok){ flipped++; M.unflip.push({k: 'sw', id: S.id, t: dur}); } });
      M.bridges.forEach(B => { if(toggleBridge(M, B.id, {skill: true}).ok){ flipped++; M.unflip.push({k: 'br', id: B.id, t: dur}); } });
      if(!flipped && tgt) for(let q = 2; q <= 8; q++){ const c = ahead(q); if(c.i === M.door.i && c.j === M.door.j) break; if(!canWall(M, c.i, c.j)) continue;   // no switches: a corn wall pops up on the walk
        const b = {id: M.idN++, k: 'corn', i: c.i, j: c.j, x: wx(c.i), y: wx(c.j), hp: 999, hpMax: 999, dmg: 0, t: dur}; M.blockers.push(b); if(wall(M, b)){ flipped++; break; } }
      fx(M, 'switch', {x: at.x, y: at.y, dur: 0.7}); ev(M, 'switched', {n: flipped}); break; }
    case 'gold': { const add = Math.max(2, Math.round((n.gold || 30) / 12)); M.seeds += add; if(n.heal) M.hearts = Math.min(M.heartsMax + 5, M.hearts + n.heal); fx(M, 'seedrain', {x: CX, y: CY, dur: 0.9}); ev(M, 'seeds', {n: add, heal: n.heal || 0}); break; }
    case 'haste': M.hasteT = T(n.dur); M.hasteV = n.v; fx(M, 'haste', {x: CX, y: CY, dur: 0.8}); break;
    case 'decoy': M.zones.push({k: 'stop', x: at.x, y: at.y, r: n.r || 1.3, t: T(n.dur)}); fx(M, 'skillboom', {x: at.x, y: at.y, r: n.r || 1.3, dur: 0.5}); break;
    case 'shield': if(E.fx === 'armor'){ M.armorT = T(n.dur); M.armorV = n.v; } else { M.shieldHp = Math.max(M.shieldHp, n.hp || 3); M.shieldT = T(n.dur); } fx(M, 'shield', {x: CX, y: CY, dur: 0.8}); break;
    case 'heal': M.hearts = Math.min(M.heartsMax + 5, M.hearts + (n.heal || 2)); fx(M, 'heal', {x: CX, y: CY, dur: 0.8}); ev(M, 'heal', {n: n.heal || 2}); break;
    case 'reflect': M.reflectN = Math.max(M.reflectN, n.cnt || 3); fx(M, 'shield', {x: CX, y: CY, dur: 0.8}); break;
    case 'dome': M.domeT = T(n.dur || 5); if(n.heal) M.hearts = Math.min(M.heartsMax + 5, M.hearts + n.heal); fx(M, 'shield', {x: CX, y: CY, dur: 1, big: 1}); break;
    case 'daze': status(around(at, n.r || 1.6), e => { e.stunT = Math.max(e.stunT, T(n.dur) * (e.boss ? 0.5 : 1)); }); fx(M, 'skillboom', {x: at.x, y: at.y, r: n.r || 1.6, dur: 0.6}); break;
    case 'sleep': status(around(at, n.r || 1.5), e => { e.sleepT = Math.max(e.sleepT, T(n.dur) * (e.boss ? 0.4 : 1)); }); fx(M, 'skillboom', {x: at.x, y: at.y, r: n.r || 1.5, dur: 0.6}); break;
    case 'slow': status(around(at, n.r || 1.8), e => slow(e, n.slow, T(n.dur))); fx(M, 'skillboom', {x: at.x, y: at.y, r: n.r || 1.8, dur: 0.6}); break;
    case 'push': around(at, n.r || 2.6).forEach(e => { if(e.S.umbrella && E.fx !== 'push'){ return; } if(!e.boss) e.backN = Math.max(e.backN, Math.round(n.push || 2)); }); fx(M, 'skillboom', {x: at.x, y: at.y, r: n.r || 2.6, dur: 0.6}); break;
    case 'fear': case 'confuse': around(at, n.r || 2.2).forEach(e => { if(!e.boss) e.backN = Math.max(e.backN, Math.round(T(n.dur) * 1.4)); else e.stunT = Math.max(e.stunT, 1); }); fx(M, 'skillboom', {x: at.x, y: at.y, r: n.r || 2.2, dur: 0.6}); break;
    case 'pull': around(at, n.r || 2.4).forEach(e => slow(e, 0.6, T(n.dur || 1.5))); fx(M, 'skillboom', {x: at.x, y: at.y, r: n.r || 2.4, dur: 0.6}); break;
    case 'charm': { const list = (n.cnt >= 50 ? live(M) : live(M).sort((a, b) => cellDist(M, a) - cellDist(M, b)).slice(0, n.cnt || 1)); list.forEach(e => { hit(M, e, e.willMax * (n.cnt >= 50 ? 0.5 : 0.3), 'skill'); if(!e.gone && !e.boss) e.backN = Math.max(e.backN, 6); }); fx(M, 'skillboom', {x: at.x, y: at.y, r: 3, dur: 0.8}); break; }
    default: M._src = null; return false;
  }
  M._src = null; M.cd[h][key] = cdOf(M, h, key); M.stats.casts++; M.lastUsed = M.t;
  const PK = M.trees[h].pack.get(key) || PACKS[h].get(key) || SK.get(key); ev(M, 'cast', {hero: h, key, name: PK.name, icon: PK.icon, col: E.col, x: at.x, y: at.y}); return true;
}

/* ---------- 🚶 one game step ---------- */
function walk(M, e, dt){
  if(e.entering){ const G = M.gates[e.gate] || M.gates[0], tx = wx(G.i), ty = wx(G.j), d = dist(e.x, e.y, tx, ty), v = e.spd * dt * 1.2;
    if(d <= v){ e.entering = false; e.x = tx; e.y = ty; e.ci = e.ti = G.i; e.cj = e.tj = G.j; e.prog = 1; } else { e.x += (tx - e.x) / d * v; e.y += (ty - e.y) / d * v; } return; }
  { const d = flowOf(M).at(e.ci, e.cj); if(e.bestV !== M.map.ver || (d > 0 && d < e.best)){ e.best = d > 0 ? d : 1e9; e.bestV = M.map.ver; e.stuckT = 0; } else if((e.stuckT = (e.stuckT || 0) + dt) > 20){ if(!e.bored){ e.bored = 1; M.stats.bored = (M.stats.bored || 0) + 1; } e.will -= e.willMax * 0.04 * dt; if(e.will <= 0){ quit(M, e, 'tired'); return; } } }   /* 😴 wr-1: no endless waves */
  if(e.stunT > 0 || e.sleepT > 0 || e.stopT > 0) return;
  let v = e.spd * (e.slowT > 0 ? 1 - e.slowF : 1) * (e.blindT > 0 ? 0.6 : 1) * (e.rushT > 0 ? 1.5 : 1) * (M.rain && e.S.umbrella ? 1.1 : 1);
  if(e.blindT > 0) v *= 0.85;
  if(e.S.bike){ e.mud = inMud(M, e); v *= e.mud ? (e.boss ? 0.3 : 0.45) : 1.7; }   // 🚲 ✦ fd-2b
  const blk = M.blockers.find(b => b.i === e.ti && b.j === e.tj && b.hp > 0 && !b.wall && !(b.eatT > 0));
  if(blk && e.prog > 0.45){ blk.hp -= dt * (e.boss ? 18 : 6); e.prog = 0.45; return; }
  e.prog += v * dt;
  while(e.prog >= 1 && !e.gone){
    e.prog -= 1; const moved = e.ci !== e.ti || e.cj !== e.tj; e.di = e.ti - e.ci; e.dj = e.tj - e.cj; e.ci = e.ti; e.cj = e.tj; e.x = wx(e.ci); e.y = wx(e.cj);
    if(moved){ e.steps++; hit(M, e, e.willMax * TIRE, 'tired'); if(e.gone) return; trapsAt(M, e); if(e.gone) return;
      if(e.signRead > 0 && !e.signN){ e.stopT = e.signRead; e.signRead = 0; ev(M, 'fooled', {x: e.x, y: e.y}); } }
    if(e.ci === M.door.i && e.cj === M.door.j){ pay(M, e); return; }
    const F = flowOf(M); let nx = null;
    if(e.backN > 0){ nx = F.away(e.ci, e.cj, {di: e.di, dj: e.dj}); e.backN--; }
    else if(e.signN > 0){ nx = F.away(e.ci, e.cj, {di: e.di, dj: e.dj, seed: e.id}); e.signN--; if(!nx) e.signN = 0; }
    else if(e.wanderT > 0){ const fw = F.next(e.ci, e.cj, {di: e.di, dj: e.dj}), opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => ({i: e.ci + a, j: e.cj + b})).filter(c => F.at(c.i, c.j) > 0);   // ✨ blind: any open neighbour, the way to the door only 1 time in 4
      const off = opts.filter(c => !fw || c.i !== fw.i || c.j !== fw.j); nx = off.length && M.rng() < 0.75 ? off[Math.floor(M.rng() * off.length)] : opts[Math.floor(M.rng() * opts.length)] || null; }
    if(!nx) nx = F.next(e.ci, e.cj, {di: e.di, dj: e.dj, seed: e.id});
    if(!nx){ e.prog = 0; break; }
    e.ti = nx.i; e.tj = nx.j;
  }
  const f = Math.min(1, e.prog); e.x = wx(e.ci) + (e.ti - e.ci) * f; e.y = wx(e.cj) + (e.tj - e.cj) * f;
  if(e.ti !== e.ci || e.tj !== e.cj) e.face = (e.ti - e.ci) - (e.tj - e.cj) >= 0 ? 1 : -1;
}
function trapsAt(M, e){
  M.traps.forEach(T => { if(T.charges <= 0 || e.gone || T.eatT > 0) return; if(dist(T.x, T.y, e.x, e.y) > Math.max(0.55, T.r)) return;
    if(e.spot > 0 && T.from !== 'plant'){ e.spot--; T.seen = 1; ev(M, 'spotted', {x: e.x, y: e.y}); return; }
    if(e.S.umbrella && T.kind === 'push'){ ev(M, 'umbrella', {x: e.x, y: e.y}); return; }
    T.charges--; ev(M, 'trap', {x: T.x, y: T.y, kind: T.kind});
    switch(T.kind){
      case 'dmg': case 'pop': hit(M, e, T.dmg, 'trap'); break;
      case 'mine': M.enemies.forEach(o => { if(!o.gone && dist(o.x, o.y, T.x, T.y) <= T.r) hit(M, o, T.dmg, 'trap'); }); T.charges = 0; ev(M, 'boom', {x: T.x, y: T.y}); break;
      case 'root': case 'stun': e.stunT = Math.max(e.stunT, T.dur * (e.boss ? 0.4 : 1)); break;
      case 'push': if(!e.boss) e.backN = Math.max(e.backN, Math.round(T.push || 2)); break;
      case 'lava': break;
    } });
}
function step(M, dt){
  if(M.paused || M.state === 'pick' || M.state === 'won' || M.state === 'lost') return;
  dt *= M.speed || 1; let left = dt;
  while(left > 1e-6){ const h = Math.min(STEP, left); left -= h; tick(M, h); if(M.state === 'won' || M.state === 'lost' || M.state === 'pick') break; }
}
function tick(M, dt){
  M.t += dt; M.wt += dt;
  M.fx = M.fx.filter(f => (f.t += dt) < f.dur);
  pondTimers(M, dt);   // 🌊 fd-2b
  if(M.state === 'break'){ M.freeMoveT = Math.max(0, M.freeMoveT - dt); if(M.breakLen > 0 && M.wt >= M.breakLen + (M.freeMoveT > 0 ? 10 : 0)) startWave(M); return; }
  if(M.state !== 'wave') return;
  ['hasteT', 'shieldT', 'armorT', 'domeT'].forEach(k => { if(M[k] > 0) M[k] = Math.max(0, M[k] - dt); });
  // spawns
  while(M.spawnQ.length && M.spawnQ[0].at <= M.wt){ const q = M.spawnQ.shift(); spawn(M, q.type, q.gate); }
  // heroes: cooldowns, auto skills (🌱 Basic / 🐣 Junior fire a ready skill after a short wait), basic attacks
  ['farmer', 'goat'].forEach(h => { const cd = M.cd[h]; Object.keys(cd).forEach(k => { if(cd[k] > 0) cd[k] = Math.max(0, cd[k] - dt); });
    const assist = M.L.assist; M.trees[h].buttons().forEach(b => { if(!ready(M, h, b.key)){ M.readyT[h][b.key] = 0; return; } M.readyT[h][b.key] = (M.readyT[h][b.key] || 0) + dt;
      if((M.auto[h] || (assist && M.readyT[h][b.key] >= assist)) && canAim(M, h, b.key) && liveAll(M).length) cast(M, h, b.key); });
    const H = M.heroes[h], HD = HEROES[h]; H.atk -= dt * (1 + ((M.mods[h].rateMul) || 0)); if(H.atk <= 0){ const L = live(M).filter(e => dist(e.x, e.y, H.x, H.y) <= HD.range).sort((a, b) => cellDist(M, a) - cellDist(M, b));
      if(L.length){ H.atk = HD.rate; hit(M, L[0], HD.dmg * (1 + (M.mods[h].dmgMul || 0)), 'hero'); H.ax = L[0].x; H.ay = L[0].y; H.atkT = M.t; fx(M, h === 'farmer' ? 'tomato' : 'butt', {x0: H.x, y0: H.y, x: L[0].x, y: L[0].y, dur: 0.35}); } else H.atk = 0.2; } });
  // 🐐 Chewy trots to the busiest spot near the farm
  { const H = M.heroes.goat, f = front(M); if(f && dist(f.x, f.y, CX, CY) < 7){ H.tx = clamp(f.x, CX - 4, CX + 4); H.ty = clamp(f.y, CY - 4, CY + 4); } else { H.tx = CX + 1.2; H.ty = CY + 1.7; }
    const d = dist(H.x, H.y, H.tx, H.ty); if(d > 0.6){ H.x += (H.tx - H.x) / d * Math.min(d, 2.2 * dt); H.y += (H.ty - H.y) / d * Math.min(d, 2.2 * dt); H.mv = 1; } else H.mv = 0; }
  // collectors' own skills (bosses) + bot-tree actives
  M.enemies.forEach(e => { if(e.gone) return; ['slowT', 'sleepT', 'stunT', 'blindT', 'stopT', 'umbT', 'rushT', 'hit', 'wanderT', 'wetT'].forEach(k => { if(e[k] > 0) e[k] = Math.max(0, e[k] - dt); });
    if(e.burnT > 0){ e.burnT -= dt; hit(M, e, e.burnD * dt, 'burn'); if(e.burnT <= 0) e.burnD = 0; }
    if(e.S.treats && !e.boss && !e.entering && !(e.stunT > 0 || e.sleepT > 0)){ e.trT = (e.trT == null ? 2 + M.rng() * 2 : e.trT) - dt;   // 🦴 ✦ fd-2a: a treat for the closest animal
      if(e.trT <= 0){ const a = animals(M).filter(a => !(a.eatT > 0) && dist(a.x, a.y, e.x, e.y) <= 3).sort((p, q) => dist(p.x, p.y, e.x, e.y) - dist(q.x, q.y, e.x, e.y))[0]; if(a){ feed(M, a, 3, e); e.trT = 5; e.throwT = M.t; } else e.trT = 1; } }
    if(e.S.bag && !e.half && e.will < e.willMax / 2){ e.half = 1; for(let q = 0; q < 2; q++) M.spawnQ.push({type: 'tr', at: M.wt + q * 0.8, gate: q % M.gates.length}); ev(M, 'foeSkill', {skill: 'call', x: e.x, y: e.y}); }
    if(e.boss){ e.skT -= dt; if(e.skT <= 0){ e.skT = 7 + M.rng() * 2;
      if(e.S.bell){ e.skT = 6; const near = M.blockers.filter(b => (b.k === 'sheep' || b.k === 'chicken') && dist(b.x, b.y, e.x, e.y) <= 2.6);   // 🔔 ✦ fd-2b: the sheep in front jump aside
        near.forEach(b => { unwall(M, b); b.eatT = Math.max(b.eatT || 0, 2.2); b.jumpT = M.t; }); fx(M, 'bell', {x: e.x, y: e.y, r: 2.6, dur: 0.8}); ev(M, 'foeSkill', {skill: 'bell', x: e.x, y: e.y, n: near.length}); }
      if(e.S.bag){ e.skT = 9; const near = animals(M).filter(a => dist(a.x, a.y, e.x, e.y) <= 3.5); near.forEach(a => feed(M, a, 4, e)); fx(M, 'bag', {x: e.x, y: e.y, r: 3.5, dur: 0.9}); ev(M, 'foeSkill', {skill: 'bag', x: e.x, y: e.y, n: near.length}); }
      if(e.S.clip){ for(let q = 0; q < 2; q++) M.spawnQ.push({type: 'c', at: M.wt + q * 0.6, gate: q % M.gates.length}); ev(M, 'foeSkill', {skill: 'clip', x: e.x, y: e.y}); }
      if(e.S.brolly){ M.enemies.forEach(o => { if(!o.gone && dist(o.x, o.y, e.x, e.y) < 2.4) o.umbT = 4; }); for(let q = 0; q < 2; q++) M.spawnQ.push({type: 'u', at: M.wt + q * 0.9, gate: q % M.gates.length}); ev(M, 'foeSkill', {skill: 'brolly', x: e.x, y: e.y}); } } }
    walk(M, e, dt); });
  M.spawnQ.sort((a, b) => a.at - b.at);
  foeTree(M, dt);
  // zones + blockers + helpers + traps
  M.zones = M.zones.filter(Z => { Z.t -= dt; live(M).forEach(e => { if(dist(e.x, e.y, Z.x, Z.y) > Z.r) return; if(Z.k === 'storm') hit(M, e, Z.dps * dt, 'skill'); if(Z.k === 'stop'){ if(e.spot > 0 && !Z.seen){ e.spot--; ev(M, 'spotted', {x: e.x, y: e.y}); Z.seen = 1; } else e.stopT = Math.max(e.stopT, 0.2); } }); return Z.t > 0; });
  M.traps.forEach(T => { T.life -= dt; if(T.eatT > 0){ T.eatT -= dt; return; } if(T.kind === 'lava') live(M).forEach(e => { if(dist(e.x, e.y, T.x, T.y) <= T.r){ hit(M, e, (T.dot || 6) * dt, 'trap'); slow(e, T.slowF || 0.35, 0.3); } }); });
  M.traps = M.traps.filter(T => T.life > 0 && T.charges > 0);
  M.blockers.forEach(b => { b.t -= dt; if(b.eatT > 0){ b.eatT -= dt; if(b.eatT <= 0) b.retryT = 0; return; } if(b.wantWall && !b.wall && b.t > 0 && (b.retryT = (b.retryT || 0) - dt) <= 0){ b.retryT = 0.4; wall(M, b); } /* 🐑 a wall again as soon as the cell may close */ if(b.dmg){ b.cd = (b.cd || 0) - dt; if(b.cd <= 0){ const E = live(M).find(e => dist(e.x, e.y, b.x, b.y) < 1.1); if(E){ hit(M, E, b.dmg, 'skill'); b.cd = 1; } } } });
  M.blockers = M.blockers.filter(b => { if(b.t > 0 && b.hp > 0) return true; unwall(M, b); ev(M, 'blockerGone', {x: b.x, y: b.y, k: b.k}); return false; });
  M.helpers = M.helpers.filter(H => { H.t -= dt; H.cd -= dt; if(H.k === 'dog') return dogWork(M, H, dt); if(H.cd <= 0){ const E = live(M).filter(e => dist(e.x, e.y, H.x, H.y) <= H.range).sort((a, b) => cellDist(M, a) - cellDist(M, b))[0]; if(E){ hit(M, E, H.dmg, 'skill'); H.cd = 1 / (H.rate || 1); fx(M, 'pop', {x0: H.x, y0: H.y, x: E.x, y: E.y, dur: 0.3}); } else H.cd = 0.25; } return H.t > 0; });
  plantsWork(M, dt);
  // keep things tidy
  if(M.enemies.length > 60) M.enemies = M.enemies.filter(e => !e.gone || M.t - (e.quitT || M.t) < 2);
  M.enemies = M.enemies.filter(e => !(e.gone === 2) && !(e.gone && M.t - (e.quitT || 0) > 1.6));
  if(M.state === 'lost') return;
  if(!M.spawnQ.length && !liveAll(M).length) waveDone(M);
}
// 🐕 Rex runs to the one in front, nips (Will + a push back), stops to eat a treat
function dogWork(M, H, dt){ if(H.eatT > 0){ H.eatT -= dt; H.mv = 0; return H.t > 0; } const E = front(M); if(!E){ H.mv = 0; return H.t > 0; }
  const d = dist(H.x, H.y, E.x, E.y); if(d > 0.6){ const v = Math.min(d, H.spd * dt); H.x += (E.x - H.x) / d * v; H.y += (E.y - H.y) / d * v; H.mv = 1; H.face = E.x >= H.x ? 1 : -1; } else H.mv = 0;
  if(d <= 0.9 && H.cd <= 0){ hit(M, E, H.dmg, 'skill'); if(!E.boss) E.backN = Math.max(E.backN, 1); H.cd = 1 / H.rate; ev(M, 'nip', {x: E.x, y: E.y}); fx(M, 'bonk', {x: E.x, y: E.y, x0: H.x, y0: H.y, dur: 0.3}); }
  return H.t > 0; }
function foeTree(M, dt){
  const T = M.trees.foes; T.buttons().forEach(b => { M.enCd[b.key] = (M.enCd[b.key] || 4 + M.rng() * 4) - dt; if(M.enCd[b.key] > 0) return; const L = live(M); if(!L.length) return;
    const n = SK.num(b.key, T.skills[b.key] || 1); M.enCd[b.key] = SK.get(b.key).cd || 14;
    if(b.key === 'en_heal') L.forEach(e => { e.will = Math.min(e.willMax, e.will + e.willMax * (n.v || 0.25)); });
    if(b.key === 'en_rush') L.forEach(e => { e.rushT = n.dur || 3; });
    if(b.key === 'en_shield') L.forEach(e => { e.shield = n.hp || 12; });
    if(b.key === 'en_jam') ['farmer', 'goat'].forEach(h => Object.keys(M.cd[h]).forEach(k => { M.cd[h][k] += n.v || 3; }));
    ev(M, 'foeCast', {key: b.key, name: PACKS.foes.get(b.key).name, icon: PACKS.foes.get(b.key).icon}); });
}
function waveDone(M){
  const perfect = M.lostThisWave === 0; M.stats.waves++; if(perfect) M.stats.perfect++;
  let bonus = 2 + Math.floor(M.wave / 3); M.plants.forEach(P => { const sp = plantSpec(P); if(sp.seeds) bonus += sp.seeds; });
  const regen = Math.round((M.mods.farmer.regen || 0) + (M.mods.goat.regen || 0)); if(regen) M.hearts = Math.min(M.heartsMax + 5, M.hearts + regen);
  M.seeds += bonus; const pts = (perfect ? 80 : 40) * M.L.mult; M.score += pts;
  M.traps = M.traps.filter(T => T.kind !== 'lava'); M.zones = []; M.blockers.forEach(b => unwall(M, b)); M.blockers = []; M.helpers = []; M.rain = false;
  M.unflip.forEach(u => { u.t = 0; }); pondTimers(M, 0); M.ditches.forEach(D => { D.t = 0; }); pondTimers(M, 0); M.unflip = [];   // 🌊 fd-2b
  ev(M, 'waveDone', {n: M.wave + 1, perfect, bonus, pts, regen});
  if(M.wave >= M.C.waves.length - 1){ M.score += M.hearts * 30 * M.L.mult; M.state = 'won'; ev(M, 'won', {}); return; }
  { const T = M.trees.foes; if(M.L.bot && M.rng() < M.L.bot + 0.0001 && T.tier < 10){ const o = T.offer(), c = o && o.cards.length ? T.botPick(o) : null; if(c){ T.take(c); refreshMods(M); ev(M, 'foesUp', {key: c.key, name: c.name, icon: c.icon, tier: T.tier}); } } }
  M.queue = pickQueue(M); if(M.queue.length) M.state = 'pick'; else enterBreak(M);
}
function stars(M){ const f = M.hearts / Math.max(1, M.heartsMax); return M.state !== 'won' ? 0 : f >= 0.8 ? 3 : f >= 0.4 ? 2 : 1; }

/* ---------- 🤖 auto-player (tests + 🤖 Auto build hint): buy the spots that make the walk longest, then grow ---------- */
function autoBuild(M, o){
  o = o || {}; const keep = o.keep || 0; let n = 0, guard = 40; const kind = KINDS.filter(k => PLANTS[k].ch <= M.C.n).sort((a, b) => PLANTS[a].cost - PLANTS[b].cost)[o.kindIx || 0] || 'mush';
  while(guard-- > 0 && M.seeds - PLANTS[kind].cost >= keep){ const S = bestSpots(M, o.top || 1).filter(x => x.score > 0), s = S[o.rng ? Math.floor(o.rng() * S.length) : 0]; if(!s) break; if(plant(M, s.i, s.j, kind)) n++; else break; }   // wr-1: o.top + o.rng = a kid picks one of the good spots
  if(o.grow !== false){ const L = M.plants.slice().sort((a, b) => a.st - b.st || a.id - b.id); for(const P of L){ if(P.st >= 5) continue; const c = growCost(P, M); if(M.seeds - c < keep) continue; if(nearPath(M, P)) grow(M, P.id, P.st === 3 ? (P.id % 2) : undefined); } }
  return n;
}
function nearPath(M, P){ const F = flowOf(M); return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => F.at(P.i + a, P.j + b) > 0); }
// whole chapters in node: smart (auto build + auto skills) wins Basic, struggles on Hardcore — tests print the win % per level
function simulate(o){
  o = o || {}; const kid = o.kid ? kidOf(o) : null;   // 🧒 wr-1: o.kid = a typical kid instead of the careful auto-player
  const M = newMatch(Object.assign({auto: !kid, instant: true}, o)); let guard = 0;
  while(M.state !== 'won' && M.state !== 'lost' && guard++ < 200000){
    if(M.state === 'pick'){ const of = offer(M); if(!of){ M.queue = []; enterBreak(M); continue; } take(M, kid ? kidPick(kid, of) : M.trees[M.queue[0]].botPick(of)); continue; }
    if(M.state === 'break'){ if(o.build !== false) autoBuild(M, kid ? {kindIx: o.kindIx || 0, top: M.L.guide ? 1 : 6, rng: kid.rng} : {kindIx: o.kindIx || 0}); startWave(M); continue; }
    if(kid) kidCast(M, kid, 0.1);
    step(M, 0.1); takeEvents(M);
  }
  return {won: M.state === 'won', hearts: M.hearts, score: M.score, wave: M.wave + 1, steps: M.stats.steps, plants: M.plants.length, M};
}
/* 🧒 kid test player (wr-1) — what the win-rate bands are measured with */
function kidOf(o){ return {rng: rngOf(((o.seed | 0) * 7919 + 99) >>> 0), wait: {}}; }
function kidPick(kid, of){ return of.cards.find(c => c.glow) || of.cards[Math.floor(kid.rng() * of.cards.length)]; }
function kidCast(M, kid, dt){ Object.keys(M.readyT).forEach(h => { if(!M.trees[h]) return; M.trees[h].buttons().forEach(b => { const k = h + ':' + b.key;
  if(!ready(M, h, b.key) || !canAim(M, h, b.key)){ kid.wait[k] = null; return; } kid.wait[k] = (kid.wait[k] == null ? -(1.5 + kid.rng() * 3) : kid.wait[k]) + dt;
  if(kid.wait[k] >= 0){ kid.wait[k] = null; cast(M, h, b.key); } }); }); }

return {N, O, CX, CY, STEP, LEVELS, WR, wrOf, FOES, PLANTS, KINDS, STAGE_MUL, BOOKS, PACKS, COMBOS, HEROES, GATE_A, HOUSE, DOOR, PILE, TIRE, stageOf, plantSpec, growCost, wx,
  newMatch, offer, take, startWave, step, cast, ready, canAim, cdOf, skillOf, live, liveAll, front, takeEvents, flowOf, stepsOf, pathOf, canPlant, previewSteps, bestSpots,
  plant, plantAt, grow, pull, move, moveCost, cellDist, stars, autoBuild, simulate, rngOf, buildable, gateCell, animals, canWall, ANIMAL_TRAP,
  TOOLS, TOOL_KEYS, WATER_OFF, kindOf, costOf, isWater, nearWater, dig, fill, canBridge, buildBridge, toggleBridge, flip, canalAt, bridgeAt, switchAt, muddy, inMud, inPond};   // 🌊 fd-2b
})();
// FD ENGINE END
