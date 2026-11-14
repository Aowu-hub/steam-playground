
// SKILLKIT START — pure JS (node loads this part in Test Harness/skillkit.js), no DOM here except in the UI helpers at the end
(function(root){
'use strict';
const COLORS = {
  A: {k: 'A', icon: '⚔️', dot: '🔴', hex: '#E5484D', en: 'Offensive', th: 'โจมตี', what: 'hits enemies directly'},
  B: {k: 'B', icon: '🧰', dot: '🔵', hex: '#3A86FF', en: 'Utility', th: 'ช่วยเหลือ', what: 'builds, summons, speeds you up'},
  C: {k: 'C', icon: '🪤', dot: '🟤', hex: '#A0612C', en: 'Trap', th: 'กับดัก', what: 'waits on the path, goes off when stepped on'},
  D: {k: 'D', icon: '🛡️', dot: '🟢', hex: '#22A867', en: 'Defensive', th: 'ป้องกัน', what: 'walls, shields, heals'},
  E: {k: 'E', icon: '💫', dot: '🟣', hex: '#8B5CF6', en: 'Curse / Charm', th: 'สาป / มนต์เสน่ห์', what: 'slow, sleep, charm, make them flee'},
};
const COLS = ['A', 'B', 'C', 'D', 'E'];
const ENGINES = [];
// E(key, col, kind, shape, fx, [tmin, tmax], cd, n, up, icon, name, desc, tags)
function E(key, col, kind, shape, fx, tiers, cd, n, up, icon, name, desc, tags){
  ENGINES.push({key, col, kind, shape, fx, tiers, cd, n: n || {}, up: up || {}, icon, name, desc, tags: tags || []});
}
/* ---------- A ⚔️ Offensive ---------- */
E('a_shot',    'A', 'active', 'shot',    'dmg',  [1, 10], 4,   {dmg: 26, range: 5},                 {dmg: 1.45},            '💥', 'Power Shot',     'A big hit on the closest one: {dmg} hope.', ['single']);
E('a_cone',    'A', 'active', 'cone',    'burn', [1, 10], 7,   {dmg: 16, len: 3.6, w: 0.9, dot: 5, dur: 3}, {dmg: 1.4, dot: 1.4, len: 1.12}, '🔥', 'Fire Cone', 'A cone of fire: {dmg} hope + burns {dot}/s for {dur}s.', ['cone', 'dot', 'cone_dot']);
E('a_bounce',  'A', 'active', 'bounce',  'dmg',  [1, 10], 6,   {dmg: 14, cnt: 4, range: 5},         {dmg: 1.3, cnt: '+1'},  '🔁', 'Bouncing Ball',  'Bounces {cnt} times: {dmg} hope each.', ['bounce']);
E('a_tornado', 'A', 'active', 'tornado', 'dmg',  [2, 10], 11,  {dmg: 6, r: 1.0, dur: 4},            {dmg: 1.35, dur: 1.2},  '🌀', 'Tornado',        'A tornado rolls down a path: {dmg} hope a second for {dur}s.', ['zone', 'moving']);
E('a_meteor',  'A', 'active', 'meteor',  'dmg',  [3, 10], 12,  {dmg: 48, r: 1.6},                   {dmg: 1.45, r: 1.1},    '☄️', 'Meteor',         'After a moment, BOOM: {dmg} hope in a big circle.', ['splash', 'delay']);
E('a_whip',    'A', 'active', 'whip',    'push', [1, 10], 6,   {dmg: 12, len: 3.2, push: 1.4},      {dmg: 1.35, push: 1.2}, '〰️', 'Whip Sweep',     'Sweeps a line: {dmg} hope and pushes them back.', ['line', 'push']);
E('a_swarm',   'A', 'active', 'swarm',   'dmg',  [1, 10], 8,   {dmg: 8, cnt: 6, range: 6},          {dmg: 1.3, cnt: '+2'},  '🕊️', 'Swarm',          '{cnt} little flyers hit random ones for {dmg} hope.', ['many']);
E('a_storm',   'A', 'active', 'storm',   'dmg',  [2, 10], 10,  {dmg: 5, r: 1.5, dur: 5},            {dmg: 1.35, r: 1.12},   '🌪️', 'Storm Zone',     'A storm sits on a crowd: {dmg} hope a second for {dur}s.', ['zone', 'dot']);
E('a_beam',    'A', 'active', 'beam',    'dmg',  [3, 10], 8,   {dmg: 22, len: 6, w: 0.5},           {dmg: 1.4},             '🔆', 'Light Beam',     'A long beam: {dmg} hope to everyone on the line.', ['line', 'pierce']);
E('a_chain',   'A', 'active', 'chain',   'dmg',  [2, 10], 7,   {dmg: 15, cnt: 4, range: 5},         {dmg: 1.35, cnt: '+1'}, '⚡', 'Chain Zap',      'Jumps between {cnt} enemies: {dmg} hope each.', ['chain']);
E('pa_power',  'A', 'passive', 'stat',   'dmgMul',  [1, 9], 0, {v: 0.15},                           {v: 1.6},               '💪', 'Power Up',       'All your hits +{v%}.', ['stat']);
E('pa_crit',   'A', 'passive', 'stat',   'crit',    [2, 9], 0, {v: 0.12},                           {v: 1.5},               '🎯', 'Lucky Hit',      '{v%} of hits do double.', ['chance']);
E('pa_burn',   'A', 'passive', 'stat',   'burnHit', [3, 9], 0, {v: 2},                              {v: 1.6},               '♨️', 'Hot Hits',       'Every hit also burns {v}/s.', ['onhit', 'dot']);
E('pa_rate',   'A', 'passive', 'stat',   'rateMul', [1, 9], 0, {v: 0.15},                           {v: 1.6},               '⏩', 'Quick Hands',    'Attack {v%} faster.', ['stat']);
/* ---------- B 🧰 Utility ---------- */
E('b_tower',   'B', 'active', 'tower',   'summon', [1, 10], 12, {dmg: 7, rate: 1.1, range: 3.4, dur: 22}, {dmg: 1.35, dur: 1.25}, '🗼', 'Little Tower', 'Builds a tower that shoots for {dur}s ({dmg} hope a shot).', ['build', 'turret']);
E('b_minion',  'B', 'active', 'minion',  'summon', [1, 10], 10, {dmg: 5, hp: 30, cnt: 2, dur: 16},  {hp: 1.35, cnt: '+1'},  '🐭', 'Helpers',        '{cnt} helpers run out and block the path ({hp} toughness).', ['summon', 'block']);
E('b_flyer',   'B', 'active', 'flyer',   'summon', [2, 10], 11, {dmg: 6, cnt: 2, dur: 10, rate: 0.8}, {dmg: 1.3, cnt: '+1'}, '🐦', 'Flying Friends', '{cnt} flyers chase enemies for {dur}s.', ['summon', 'chase']);
E('b_gold',    'B', 'active', 'gold',    'gold',   [1, 10], 14, {gold: 30, heal: 1},                {gold: 1.5, heal: '+1'}, '💰', 'Treasure',      '+{gold} points and +{heal} ❤️ for your home.', ['economy']);
E('b_haste',   'B', 'active', 'haste',   'haste',  [2, 10], 14, {v: 0.5, dur: 6},                   {v: 1.3, dur: 1.2},     '⚡', 'Speed Up',       'Everything on your side works {v%} faster for {dur}s.', ['time', 'buff']);
E('b_decoy',   'B', 'active', 'decoy',   'stop',   [2, 10], 13, {dur: 4, r: 1.3},                   {dur: 1.3, r: 1.12},    '🫖', 'Tea Break',      'Enemies near it STOP for {dur}s.', ['lure', 'stop']);
E('b_wall',    'B', 'active', 'wall',    'block',  [3, 10], 13, {hp: 60, dur: 14},                  {hp: 1.45},             '🧱', 'Quick Wall',     'A wall on the path ({hp} toughness).', ['build', 'block']);
E('pb_gold',   'B', 'passive', 'stat',   'goldMul',   [1, 9], 0, {v: 0.25},                         {v: 1.6},               '🪙', 'Lucky Coins',    '+{v%} points for every enemy.', ['economy']);
E('pb_summon', 'B', 'passive', 'stat',   'summonMul', [2, 9], 0, {v: 0.25},                         {v: 1.6},               '💖', 'Strong Friends', 'Towers + helpers +{v%} stronger.', ['summon']);
E('pb_cd',     'B', 'passive', 'stat',   'cdMul',     [1, 9], 0, {v: 0.12},                         {v: 1.5},               '⏱️', 'Quick Recharge', 'Skills come back {v%} sooner.', ['time']);
E('pb_range',  'B', 'passive', 'stat',   'rangeMul',  [2, 9], 0, {v: 0.12},                         {v: 1.5},               '🔭', 'Far Sight',      'Reach {v%} further.', ['stat']);
/* ---------- C 🪤 Trap ---------- */
E('c_spikes',  'C', 'active', 'trap',    'dmg',    [1, 10], 9,  {dmg: 14, r: 0.9, charges: 6, dur: 20}, {dmg: 1.35, charges: '+2'}, '🌵', 'Spike Patch', 'A patch on the path: {dmg} hope to the next {charges} who step on it.', ['trap']);
E('c_net',     'C', 'active', 'trap',    'root',   [1, 10], 10, {dur: 2.5, r: 0.9, charges: 3, life: 20},{dur: 1.3, charges: '+1'}, '🕸️', 'Sticky Net', 'Catches the next {charges} and holds them {dur}s.', ['trap', 'hold']);
E('c_mine',    'C', 'active', 'trap',    'mine',   [2, 10], 11, {dmg: 40, r: 1.4, life: 25},          {dmg: 1.45, r: 1.1},     '🥚', 'Pop Mine',    'Pops when stepped on: {dmg} hope around it.', ['trap', 'splash']);
E('c_lava',    'C', 'active', 'trap',    'lava',   [3, 10], 12, {dot: 7, slow: 0.35, r: 1.2, dur: 7},  {dot: 1.4, dur: 1.2},    '🌋', 'Hot Floor',   'Hot floor: {dot} hope a second and slow, for {dur}s.', ['trap', 'zone', 'dot']);
E('c_splash',  'C', 'active', 'trap',    'push',   [2, 10], 10, {push: 2.4, r: 1.1, charges: 3, life: 20}, {push: 1.2, charges: '+1'}, '💦', 'Splash Pad', 'Splashes the next {charges} back down the path.', ['trap', 'push']);
E('c_pit',     'C', 'active', 'trap',    'stun',   [3, 10], 12, {dur: 3, r: 0.9, charges: 4, life: 22}, {dur: 1.25, charges: '+1'}, '🕳️', 'Silly Pit', 'The next {charges} fall in and are stuck {dur}s.', ['trap', 'hold']);
E('pc_more',   'C', 'passive', 'stat',   'trapCharges', [1, 9], 0, {v: 1},                          {v: '+1'},              '➕', 'Extra Uses',     'Traps work {v} more times.', ['trap']);
E('pc_big',    'C', 'passive', 'stat',   'trapRadius',  [2, 9], 0, {v: 0.2},                        {v: 1.5},               '⭕', 'Bigger Traps',   'Traps are {v%} bigger.', ['trap']);
E('pc_quick',  'C', 'passive', 'stat',   'trapCd',      [3, 9], 0, {v: 0.18},                       {v: 1.5},               '🔧', 'Quick Builder',  'Trap skills come back {v%} sooner.', ['trap', 'time']);
/* ---------- D 🛡️ Defensive ---------- */
E('d_shield',  'D', 'active', 'shield',  'shield', [1, 10], 13, {hp: 3, dur: 12},                   {hp: '+1', dur: 1.2},   '🛡️', 'Home Shield',    'Blocks the next {hp} enemies that reach home ({dur}s).', ['shield']);
E('d_heal',    'D', 'active', 'heal',    'heal',   [1, 10], 15, {heal: 2},                          {heal: '+1'},           '💚', 'Heal',           '+{heal} ❤️ for your home.', ['heal']);
E('d_reflect', 'D', 'active', 'reflect', 'bounce', [2, 10], 13, {cnt: 3, dur: 10, push: 4},         {cnt: '+2', dur: 1.2},  '🪞', 'Mirror',         'The next {cnt} at the door bounce all the way back ({dur}s).', ['reflect', 'push']);
E('d_wall',    'D', 'active', 'wall',    'block',  [1, 10], 12, {hp: 70, dur: 15},                  {hp: 1.45, dur: 1.15},  '🏰', 'Stone Wall',     'A wall on the path ({hp} toughness).', ['wall', 'block']);
E('d_dome',    'D', 'active', 'dome',    'safe',   [3, 10], 20, {dur: 5},                           {dur: 1.3},             '🫧', 'Bubble Dome',    'Nobody can hurt your home for {dur}s.', ['shield']);
E('d_armor',   'D', 'active', 'shield',  'armor',  [2, 10], 14, {v: 0.5, dur: 10, hp: 0},           {dur: 1.3},             '🐉', 'Scale Aura',     'Your home takes half damage for {dur}s.', ['aura']);
E('pd_armor',  'D', 'passive', 'stat',   'armor',     [1, 9], 0, {v: 0.12},                         {v: 1.6},               '🧥', 'Thick Walls',    'Home takes {v%} less damage.', ['survive']);
E('pd_regen',  'D', 'passive', 'stat',   'regen',     [2, 9], 0, {v: 1},                            {v: '+1'},              '🌱', 'Slow Heal',      '+{v} ❤️ at the end of every wave.', ['survive']);
E('pd_thorns', 'D', 'passive', 'stat',   'thorns',    [2, 9], 0, {v: 10},                           {v: 1.6},               '🌹', 'Thorns',         'Enemies at the door take {v} hope.', ['survive']);
E('pd_last',   'D', 'passive', 'stat',   'lastStand', [4, 9], 0, {v: 1},                            {v: '+1'},              '🍀', 'Second Chance',  'Once: at 0 ❤️ you get {v} ❤️ back.', ['survive']);
/* ---------- E 💫 Curse / Charm ---------- */
E('e_daze',    'E', 'active', 'daze',    'stun',   [1, 10], 9,  {dur: 2, r: 1.6},                   {dur: 1.3, r: 1.12},    '💞', 'Daze',           'Everyone in the circle stops, dazed, for {dur}s.', ['stun', 'area']);
E('e_push',    'E', 'active', 'push',    'push',   [1, 10], 10, {push: 2.6, r: 2.6},                {push: 1.25, r: 1.1},   '🔔', 'Push Back',      'Pushes everyone near home {push} steps back.', ['push', 'area']);
E('e_sleep',   'E', 'active', 'sleep',   'sleep',  [2, 10], 12, {dur: 4, r: 1.5},                   {dur: 1.3, r: 1.1},     '💤', 'Sleepy Cloud',   'They fall asleep for {dur}s (a hit wakes them).', ['sleep', 'area']);
E('e_slow',    'E', 'active', 'slow',    'slow',   [1, 10], 9,  {slow: 0.5, dur: 5, r: 1.8},        {dur: 1.25, r: 1.1},    '🐌', 'Slow Zone',      'Everyone in the circle walks half speed for {dur}s.', ['slow', 'area']);
E('e_fear',    'E', 'active', 'fear',    'fear',   [2, 10], 12, {dur: 2.5, r: 2.2},                 {dur: 1.3, r: 1.1},     '😱', 'Scare',          'They turn round and run away for {dur}s.', ['fear', 'area']);
E('e_charm',   'E', 'active', 'charm',   'charm',  [3, 10], 15, {dur: 6, cnt: 1},                   {dur: 1.2, cnt: '+1'},  '😍', 'Charm',          '{cnt} switch sides and walk back bonking their friends ({dur}s).', ['charm']);
E('e_pull',    'E', 'active', 'pull',    'pull',   [2, 10], 11, {r: 2.4, dur: 1.5},                 {r: 1.15, dur: 1.2},    '🧲', 'Pull',           'Pulls a crowd into one spot and holds them {dur}s.', ['pull', 'area']);
E('e_confuse', 'E', 'active', 'confuse', 'confuse',[3, 10], 12, {dur: 4, r: 1.8},                   {dur: 1.3, r: 1.1},     '😵‍💫', 'Mix-up',       'They forget the way and wander for {dur}s.', ['confuse', 'area']);
E('e_ew',      'E', 'active', 'shot',    'slowpush',[1, 10], 5, {slow: 0.5, dur: 3, push: 1.2, range: 5}, {dur: 1.3, push: 1.3}, '😝', 'Ew, NO!', 'The closest one slows down and backs off.', ['single', 'slow', 'push']);
E('pe_slow',   'E', 'passive', 'stat',   'slowHit',   [1, 9], 0, {v: 0.15},                         {v: 1.6},               '🧊', 'Chilly Touch',   'Every hit slows {v%} for 1 s.', ['onhit', 'slow']);
E('pe_long',   'E', 'passive', 'stat',   'durMul',    [2, 9], 0, {v: 0.2},                          {v: 1.6},               '⏳', 'Long Spells',    'Daze / sleep / slow last {v%} longer.', ['time']);
E('pe_flee',   'E', 'passive', 'stat',   'fearHit',   [3, 9], 0, {v: 0.06},                         {v: 1.6},               '👻', 'Spooky',         '{v%} of hits make them run away for a moment.', ['onhit', 'chance']);
/* ---------- ⭐ Ultimates (tier 10, one per colour) ---------- */
E('u_meteor',  'A', 'ultimate', 'meteor', 'dmg',   [10, 10], 30, {dmg: 140, r: 99},                 {},                     '☄️', 'Mega Meteor',    'A huge meteor: {dmg} hope to EVERY enemy on the map.', ['ultimate']);
E('u_army',    'B', 'ultimate', 'minion', 'summon',[10, 10], 30, {dmg: 10, hp: 90, cnt: 6, dur: 18},{},                     '🎉', 'Big Parade',     '{cnt} big helpers on every path.', ['ultimate']);
E('u_field',   'C', 'ultimate', 'trap',   'mine',  [10, 10], 30, {dmg: 60, r: 1.4, life: 30, every: 1},{},                  '💣', 'Trap Field',     'A pop mine on every path, near and far.', ['ultimate']);
E('u_fort',    'D', 'ultimate', 'dome',   'safe',  [10, 10], 30, {dur: 8, heal: 5},                 {},                     '🏯', 'Fortress',       '+{heal} ❤️ and nobody can hurt home for {dur}s.', ['ultimate']);
E('u_charm',   'E', 'ultimate', 'charm',  'charm', [10, 10], 30, {dur: 7, cnt: 99},                 {},                     '💘', 'Love Storm',     'EVERY enemy (not bosses) switches sides for {dur}s.', ['ultimate']);
/* ---------- 🤝 Combos (two heroes; kind 'combo', cols = the two colours needed) ---------- */
E('x_burst',   'A', 'combo', 'splash', 'dmgstun',  [8, 10], 16, {dmg: 60, dur: 2, r: 2.6},          {},                     '💥', 'Combo Burst',    'Both heroes at once: {dmg} hope + daze around home.', ['combo']);
E('x_guard',   'D', 'combo', 'dome',   'safe',     [8, 10], 20, {dur: 6, heal: 2},                  {},                     '🤝', 'Team Guard',     '+{heal} ❤️ and a dome for {dur}s.', ['combo']);
E('x_wall',    'C', 'combo', 'trap',   'mine',     [8, 10], 18, {dmg: 45, r: 1.5, life: 25, every: 1},{},                   '🎆', 'Team Traps',     'Pop mines on every path.', ['combo']);
/* ---------- 🤖 enemy-side engines (the bot tree of the attackers) ---------- */
E('en_hope',   'D', 'passive', 'stat',   'enHp',    [1, 10], 0, {v: 0.12},                          {v: 1.5},               '💪', 'Tough Crowd',    'Enemies +{v%} hope.', ['enemy']);
E('en_speed',  'B', 'passive', 'stat',   'enSpeed', [1, 10], 0, {v: 0.06},                          {v: 1.5},               '👟', 'Quick Feet',     'Enemies {v%} faster.', ['enemy']);
E('en_armor',  'D', 'passive', 'stat',   'enArmor', [2, 10], 0, {v: 0.08},                          {v: 1.5},               '🛡️', 'Armour',         'Enemies take {v%} less.', ['enemy']);
E('en_heal',   'D', 'active', 'global',  'enHeal',  [2, 10], 14, {v: 0.25},                         {v: 1.3},               '💗', 'Cheer Up',       'Every enemy gets {v%} hope back.', ['enemy']);
E('en_rush',   'B', 'active', 'global',  'enRush',  [1, 10], 13, {v: 0.5, dur: 3},                  {dur: 1.3},             '🏃', 'Rush',           'Every enemy runs {v%} faster for {dur}s.', ['enemy']);
E('en_shield', 'D', 'active', 'global',  'enShield',[3, 10], 16, {hp: 12},                          {hp: 1.5},              '✨', 'Shiny Shields',  'Every enemy gets a {hp} shield.', ['enemy']);
E('en_jam',    'E', 'active', 'global',  'enJam',   [2, 10], 15, {v: 3},                            {v: '+1'},              '🎶', 'Jam',            'One of your skills waits {v}s longer.', ['enemy']);
E('en_more',   'B', 'passive', 'stat',   'enMore',  [3, 10], 0, {v: 1},                             {v: '+1'},              '👥', 'Bring Friends',  '+{v} enemy in every group.', ['enemy']);
E('en_trapdodge','C','passive','stat',   'enDodge', [2, 10], 0, {v: 0.15},                          {v: 1.5},               '🦘', 'Hop Over',       '{v%} hop over traps.', ['enemy']);

const BY = {}; ENGINES.forEach(e => { if(BY[e.key]) throw new Error('SkillKit: duplicate engine ' + e.key); BY[e.key] = e; });
function get(key){ return BY[key] || null; }
function list(f){ f = f || {}; return ENGINES.filter(e => (!f.col || e.col === f.col) && (!f.kind || e.kind === f.kind) && (!f.tag || e.tags.includes(f.tag))
  && (f.tier == null || (f.tier >= e.tiers[0] && f.tier <= e.tiers[1])) && (f.enemy == null || e.tags.includes('enemy') === !!f.enemy)); }
// numbers at a level (1–3): a number in up multiplies once per extra level, '+N' adds
function num(key, lv){
  const e = typeof key === 'string' ? get(key) : key; if(!e) return {}; lv = Math.max(1, lv || 1);
  const out = {}; Object.keys(e.n).forEach(k => { let v = e.n[k]; const u = e.up[k];
    for(let i = 1; i < lv; i++){ if(typeof u === 'number') v *= u; else if(typeof u === 'string' && u[0] === '+') v += Number(u.slice(1)); }
    out[k] = v; }); return out;
}
function fmtNum(k, v){ if(/^(cnt|charges|heal|hp)$/.test(k) && Number.isInteger(Math.round(v * 100) / 100)) return String(Math.round(v)); return Math.abs(v) >= 10 ? String(Math.round(v)) : String(Math.round(v * 10) / 10); }
function describe(key, lv, skin){
  const e = get(key); if(!e) return ''; const n = num(e, lv), t = (skin && skin.desc) || e.desc;
  return t.replace(/\{(\w+)(%?)\}/g, (m, k, pc) => n[k] == null ? m : pc ? Math.round(n[k] * 100) + '%' : fmtNum(k, n[k]));
}

/* ---------- 🎭 reskin packs ---------- */
function pack(game, items){
  const map = {}, keys = [];
  (items || []).forEach(it => { const e = get(it.key); if(!e) throw new Error('SkillKit.pack(' + game + '): unknown engine ' + it.key); if(map[it.key]) return;
    map[it.key] = Object.assign({}, e, {name: it.name || e.name, icon: it.icon || e.icon, look: it.look || null, desc: it.desc || e.desc, skin: it}); keys.push(it.key); });
  return {game, keys, has: k => !!map[k], get: k => map[k] || null, cols: () => COLS.filter(c => keys.some(k => map[k].col === c)), list: f => keys.map(k => map[k]).filter(e => (!f || ((!f.col || e.col === f.col) && (!f.kind || e.kind === f.kind))))};
}

/* ---------- 🌳 the 10-tier tree ---------- */
const MAX_LV = 3, TIERS = 10, EVOLVE_AT = 5, ULT_AT = 10, COMBO_FROM = 8;
function tree(o){
  o = o || {}; const P = o.pack; if(!P) throw new Error('SkillKit.tree needs a pack');
  const rng = o.rng || Math.random;
  const T = {hero: o.hero || 'hero', pack: P, tier: 0, form: 0, main: null, skills: {}, active: {}, picks: [], shown: {A: 0, B: 0, C: 0, D: 0, E: 0},
    cards: o.cards || 3, glow: !!o.glow, forms: o.forms || ['Form 1', 'Form 2', 'Form 3'], combos: o.combos || [], partner: o.partner || null, bot: !!o.bot, ult: null, combo: null};
  T.formName = () => T.forms[Math.min(T.form, T.forms.length - 1)];
  T.lv = k => T.skills[k] || 0;
  T.bar = () => T.picks.filter(p => p.col).map(p => p.col);
  T.counts = () => { const c = {A: 0, B: 0, C: 0, D: 0, E: 0}; T.bar().forEach(x => c[x]++); return c; };
  T.buttons = () => { const b = COLS.filter(c => T.active[c]).map(c => ({key: T.active[c], col: c, lv: T.skills[T.active[c]], e: P.get(T.active[c])}));
    if(T.ult) b.push({key: T.ult, col: P.get(T.ult).col, lv: 1, e: P.get(T.ult), ult: true});
    if(T.combo) b.push({key: T.combo, col: P.get(T.combo).col, lv: 1, e: P.get(T.combo), combo: true}); return b; };
  T.mods = () => { const m = {}; Object.keys(T.skills).forEach(k => { const e = P.get(k); if(!e || e.kind !== 'passive') return; const n = num(e, T.skills[k]); m[e.fx] = (m[e.fx] || 0) + (n.v || 0); });
    if(T.main) m['col' + T.main] = (m['col' + T.main] || 0) + 0.15 * T.form; return m; };
  function cardOf(key, type, lv){ const e = P.get(key); return {key, col: e.col, type, lv, name: e.name, icon: e.icon, desc: describe(key, Math.max(1, lv), e.skin), kind: e.kind, look: lookOf(e).key, shape: e.shape}; }
  // all the cards one colour could give at this tier
  function colourCards(c, tier){
    const out = [];
    const act = T.active[c];
    if(act){ if(T.skills[act] < MAX_LV) out.push(cardOf(act, 'up', T.skills[act] + 1)); }
    else P.list({col: c, kind: 'active'}).filter(e => tier >= e.tiers[0] && tier <= e.tiers[1]).forEach(e => out.push(cardOf(e.key, 'new', 1)));
    P.list({col: c, kind: 'passive'}).filter(e => tier >= e.tiers[0] && tier <= e.tiers[1]).forEach(e => { const l = T.skills[e.key] || 0; if(l < MAX_LV) out.push(cardOf(e.key, l ? 'up' : 'passive', l + 1)); });
    return out;
  }
  function pickOne(list){ return list[Math.floor(rng() * list.length) % list.length]; }
  function score(card){ if(card.type === 'ultimate') return 100; if(card.type === 'evolve') return 90; if(card.type === 'combo') return 80;
    let s = card.kind === 'active' ? (card.type === 'up' ? 40 : 34) : (card.type === 'up' ? 22 : 18); if(card.col === T.main) s += 8;
    if(card.kind === 'active' && !T.active[card.col] && Object.keys(T.active).length < 3) s += 6; return s; }
  T.best = cards => cards.slice().sort((a, b) => score(b) - score(a))[0];
  T.offer = () => {
    const tier = T.tier + 1; if(tier > TIERS) return null;
    let kind = 'pick', cards = [];
    if(tier === EVOLVE_AT){
      kind = 'evolve'; const cnt = T.counts();
      const order = COLS.slice().sort((a, b) => (cnt[b] - cnt[a]) || (a < b ? -1 : 1));
      const cols = order.filter(c => P.cols().includes(c)).slice(0, Math.max(2, T.cards));
      cards = cols.map(c => ({key: 'evolve-' + c, col: c, type: 'evolve', lv: 0, name: T.forms[1] || 'Evolve', icon: '⭐', kind: 'evolve',
        desc: 'Evolve! Main colour ' + COLORS[c].dot + ' ' + COLORS[c].en + (T.active[c] && T.skills[T.active[c]] < MAX_LV ? ' + ' + P.get(T.active[c]).name + ' Lv ' + (T.skills[T.active[c]] + 1) : ' + ' + COLORS[c].en + ' skills +15%')}));
    } else if(tier === ULT_AT){
      kind = 'ultimate'; const c = T.main || T.bar()[0] || 'A';
      const u = P.list({kind: 'ultimate'}).find(e => e.col === c) || P.list({kind: 'ultimate'})[0];
      if(u) cards = [Object.assign(cardOf(u.key, 'ultimate', 1), {name: (T.forms[2] || 'Final form') + ' · ' + u.name})];
    } else {
      // weighted colour rotation: colours shown less come first; the main colour comes back more often
      const cols = COLS.filter(c => P.cols().includes(c));
      const avail = {}; cols.forEach(c => { avail[c] = colourCards(c, tier); });
      let pool = cols.filter(c => avail[c].length);
      const want = Math.min(T.cards, pool.length), chosen = [];
      while(chosen.length < want){
        const w = pool.map(c => (1 / (1 + T.shown[c])) * (c === T.main ? 3 : 1) * (T.active[c] ? 1 : 1.15));
        let r = rng() * w.reduce((a, b) => a + b, 0), i = 0; for(; i < pool.length - 1; i++){ r -= w[i]; if(r <= 0) break; }
        chosen.push(pool[i]); pool = pool.filter((x, j) => j !== i);
      }
      cards = chosen.map(c => { const list = avail[c]; const acts = list.filter(x => x.kind === 'active'), pas = list.filter(x => x.kind !== 'active');
        const preferAct = acts.length && (!pas.length || rng() < (T.active[c] ? 0.55 : 0.7)); return preferAct ? pickOne(acts) : pickOne(pas); });
      // 🤝 combo: from tier 8, both heroes hold actives in the combo's colours → the combo replaces the weakest card (once)
      if(tier >= COMBO_FROM && !T.combo && T.partner && !T.partner.combo){
        const cb = T.combos.find(x => P.has(x.key) && x.cols.every(c => T.active[c] || T.partner.active[c]) && x.cols.some(c => T.active[c]) && x.cols.some(c => T.partner.active[c]));
        if(cb && cards.length){ const weakest = cards.slice().sort((a, b) => score(a) - score(b))[0]; cards[cards.indexOf(weakest)] = Object.assign(cardOf(cb.key, 'combo', 1), {cols: cb.cols, name: cb.name || P.get(cb.key).name}); }
      }
      cards.forEach(c => { if(T.shown[c.col] != null) T.shown[c.col]++; });
    }
    if(T.glow && cards.length > 1){ const b = T.best(cards); b.glow = true; }
    return {tier, kind, cards, hero: T.hero};
  };
  T.take = card => {
    if(!card) return null; const tier = T.tier + 1; let change = {type: card.type, key: card.key, col: card.col};
    if(card.type === 'evolve'){ T.form = Math.max(T.form, 1); T.main = card.col; const a = T.active[card.col]; if(a && T.skills[a] < MAX_LV){ T.skills[a]++; change.up = a; } }
    else if(card.type === 'ultimate'){ T.form = 2; T.ult = card.key; }
    else if(card.type === 'combo'){ T.combo = card.key; if(T.partner) T.partner.comboFrom = T.hero; }
    else { const e = P.get(card.key); if(e.kind === 'active'){ if(T.active[e.col] && T.active[e.col] !== e.key) throw new Error('SkillKit: one active per colour (' + e.col + ')'); T.active[e.col] = e.key; }
      T.skills[card.key] = Math.min(MAX_LV, (T.skills[card.key] || 0) + 1); }
    T.tier = tier; T.picks.push({tier, key: card.key, col: card.type === 'combo' ? null : card.col, type: card.type}); return change;
  };
  T.botPick = offer => { offer = offer || T.offer(); if(!offer || !offer.cards.length) return null; const cs = offer.cards;
    return rng() < 0.75 ? T.best(cs) : cs[Math.floor(rng() * cs.length) % cs.length]; };
  T.save = () => ({v: 1, h: T.hero, t: T.tier, f: T.form, m: T.main, s: T.skills, a: T.active, u: T.ult, x: T.combo, p: T.picks.map(p => (p.col || '+') + ':' + p.key).join(',')});
  return T;
}
function load(P, d, o){
  const T = tree(Object.assign({pack: P}, o || {})); if(!d) return T;
  try{ if(typeof d === 'string') d = JSON.parse(d); }catch(e){ return T; }
  T.tier = Math.min(TIERS, d.t || 0); T.form = d.f || 0; T.main = COLS.includes(d.m) ? d.m : null; T.ult = d.u && P.has(d.u) ? d.u : null; T.combo = d.x && P.has(d.x) ? d.x : null;
  Object.keys(d.s || {}).forEach(k => { if(P.has(k)) T.skills[k] = Math.max(1, Math.min(MAX_LV, d.s[k] | 0)); });
  Object.keys(d.a || {}).forEach(c => { if(COLS.includes(c) && P.has(d.a[c])) T.active[c] = d.a[c]; });
  T.picks = String(d.p || '').split(',').filter(Boolean).map((x, i) => { const [c, k] = x.split(':'); return {tier: i + 1, key: k, col: COLS.includes(c) ? c : null}; });
  return T;
}

/* ================= 🎨 SKILL LOOKS (sk-2) =================
   A look = how a skill FEELS: palette (core → main → deep), particle sprites, gravity (+ falls / − rises), blend.
   SkillKit.LOOKS {key: look} · SkillKit.lookOf(engineOrSkin) → the look (skin.look → engine default by fx / colour)
   SkillKit.fx.draw(g, spec) paints ONE frame of a skill effect in PIXELS on any 2D canvas (no state, cheap — call it every frame):
     spec = {shape, look, p: 0..1 progress, t: seconds, x, y (from / centre, feet on the ground), x2, y2 (target), r (radius px), len (px),
             w (cone half-angle rad · beam / whip width px), ang (rad), h (px height: shot arc · storm cloud · daze ring), sq (ground squash 0.4–1, 2.5D maps ≈ .6),
             n (how many: swarm / chain), pts ([{x, y}] chain / swarm targets), size (px, shot head), seed (any number — keeps the random bits steady), idle (trap laid, waiting)}
     shapes = SkillKit.fx.PAINTERS keys (shot cone splash chain beam storm tornado meteor whip swarm push pull zone daze dome shield heal aura summon gold trap haste wall cast hit)
              + every ENGINE shape (bounce → shot, slow → zone, minion → summon …) via SkillKit.fx.SHAPE_PAINTER
   SkillKit.fx.burst(list, x, y, look, {n, speed, up, size}) adds particles · SkillKit.fx.tick(g, list, dt) moves + paints them (hits, pops, wins)
   SkillKit.fx.preview(canvas, engineOrSkin, t) → a looping mini demo of the skill (pick cards use it; your game may too)
   New looks / painters go INTO this library (keys stable) so every game can use them. Gallery + speed test: Test Harness/skilllooks.js */
const LOOK_LIST = [
  // key, name, icon, [core, main, deep], parts, grav, blend ('add' = glowing)
  ['fire', 'Fire', '🔥', ['#FFF6B0', '#FF8A3D', '#E8341C'], ['ember', 'spark', 'glow'], -0.6, 'add'],
  ['lava', 'Lava', '🌋', ['#FFE08A', '#FF5A1F', '#7A1E0E'], ['rock', 'ember', 'glow'], 0.9, 'add'],
  ['sun', 'Sunshine', '☀️', ['#FFFFFF', '#FFD45C', '#FF8A1F'], ['spark', 'star', 'glow'], -0.3, 'add'],
  ['ice', 'Ice', '❄️', ['#FFFFFF', '#8FD8FF', '#3A8BE0'], ['flake', 'shard', 'spark'], 0.25, 'add'],
  ['water', 'Water', '💧', ['#E8FBFF', '#4FC3F7', '#1E6FD9'], ['drop', 'bubble', 'drop'], 0.9, 'norm'],
  ['bubble', 'Bubbles', '🫧', ['#FFFFFF', '#B8E8FF', '#7FB2FF'], ['bubble', 'bubble', 'spark'], -0.5, 'norm'],
  ['storm', 'Lightning', '⚡', ['#FFFFFF', '#9FE6FF', '#5A6CFF'], ['spark', 'shard', 'glow'], 0, 'add'],
  ['wind', 'Wind', '🌬️', ['#FFFFFF', '#CFF5E8', '#5FC8B0'], ['leaf', 'puff', 'spark'], -0.1, 'norm'],
  ['nature', 'Nature', '🌿', ['#F2FFD6', '#7BD35A', '#2E8B3E'], ['leaf', 'plus', 'spark'], -0.3, 'norm'],
  ['thorn', 'Thorns', '🌵', ['#E6F7C9', '#5DAA4A', '#2D6B2A'], ['shard', 'leaf', 'petal'], 0.6, 'norm'],
  ['rose', 'Rose', '🌹', ['#FFE3EC', '#FF5C8A', '#C2185B'], ['petal', 'heart', 'spark'], 0.3, 'norm'],
  ['blossom', 'Blossom', '🌸', ['#FFFFFF', '#FFC0DA', '#F06C9B'], ['petal', 'petal', 'spark'], 0.15, 'norm'],
  ['love', 'Love', '💖', ['#FFE6F2', '#FF5C9A', '#D62F7A'], ['heart', 'spark', 'glow'], -0.45, 'add'],
  ['candy', 'Candy', '🍬', ['#FFFFFF', '#FF9AD5', '#8F7BFF'], ['square', 'star', 'heart'], 0.6, 'norm', ['#FF9AD5', '#8FD8FF', '#FFE45C', '#9BE3A0', '#C9A8FF']],
  ['music', 'Music', '🎵', ['#FFFFFF', '#B48CFF', '#6A3FD1'], ['note', 'note', 'spark'], -0.45, 'norm'],
  ['star', 'Stars', '⭐', ['#FFFFFF', '#FFE45C', '#FFB020'], ['star', 'spark', 'glow'], -0.2, 'add'],
  ['cosmic', 'Cosmic', '🌌', ['#FFFFFF', '#B07CFF', '#3B1E8F'], ['star', 'spark', 'glow'], 0, 'add'],
  ['holy', 'Holy Light', '✨', ['#FFFFFF', '#FFF2A8', '#FFC845'], ['spark', 'feather', 'glow'], -0.5, 'add'],
  ['moon', 'Moonlight', '🌙', ['#FFFFFF', '#C9D4FF', '#6C7BD9'], ['spark', 'star', 'glow'], -0.2, 'add'],
  ['rainbow', 'Rainbow', '🌈', ['#FFFFFF', '#FFB020', '#9A6BFF'], ['square', 'star', 'spark'], 0.4, 'norm', ['#FF5C5C', '#FFB020', '#FFE45C', '#5BD35A', '#4FC3F7', '#9A6BFF']],
  ['shadow', 'Shadow', '🌑', ['#D9C8FF', '#6B4FA0', '#22163A'], ['puff', 'shard', 'glow'], -0.3, 'norm'],
  ['ghost', 'Spooky', '👻', ['#FFFFFF', '#DDE6FF', '#8C9BD9'], ['puff', 'glow', 'spark'], -0.6, 'norm'],
  ['goo', 'Goo', '🧪', ['#F4FFB8', '#9BE33C', '#4D8A12'], ['drop', 'bubble', 'glow'], 0.8, 'norm'],
  ['rock', 'Rock', '🪨', ['#F1E2C8', '#B08A5A', '#6B4F2E'], ['rock', 'puff', 'rock'], 1.2, 'norm'],
  ['sand', 'Sand', '🏜️', ['#FFF4D6', '#E8C27A', '#B38A3F'], ['puff', 'square', 'puff'], 0.5, 'norm'],
  ['crystal', 'Crystal', '💎', ['#FFFFFF', '#9FF0FF', '#7A6CFF'], ['gem', 'shard', 'spark'], 0.2, 'add'],
  ['gold', 'Gold', '💰', ['#FFF8C2', '#FFC845', '#C98A1E'], ['coin', 'spark', 'star'], 1.0, 'norm'],
  ['paper', 'Paper', '🕊️', ['#FFFFFF', '#F3EEE4', '#C9BBA0'], ['feather', 'square', 'feather'], 0.1, 'norm'],
  ['ink', 'Ink', '🐙', ['#9AA3C9', '#3A3F6B', '#15182E'], ['drop', 'puff', 'drop'], 0.6, 'norm'],
  ['dream', 'Dreamy', '💤', ['#FFFFFF', '#C7B8FF', '#8A72E8'], ['z', 'puff', 'star'], -0.5, 'norm'],
  ['honey', 'Honey', '🍯', ['#FFF2B0', '#FFB627', '#C9761B'], ['drop', 'glow', 'spark'], 0.9, 'norm'],
  ['steel', 'Steel', '🛡️', ['#FFFFFF', '#C9D3E0', '#6E7F96'], ['shard', 'spark', 'square'], 0.7, 'norm'],
];
const LOOKS = {};
LOOK_LIST.forEach(([key, name, icon, c, parts, grav, blend, multi]) => { LOOKS[key] = {key, name, icon, c, parts, grav, blend, multi: multi || null}; });
// default look of an engine when the game's skin names none
const FX_LOOK = {burn: 'fire', slow: 'ice', slowpush: 'ice', stun: 'storm', dmgstun: 'storm', sleep: 'dream', fear: 'shadow', charm: 'love', confuse: 'candy', heal: 'nature', regen: 'nature',
  shield: 'holy', armor: 'steel', safe: 'bubble', block: 'rock', stop: 'candy', bounce: 'crystal', gold: 'gold', summon: 'star', haste: 'wind', push: 'wind', pull: 'cosmic', root: 'thorn', lava: 'lava', mine: 'sun', thorns: 'thorn', crit: 'star'};
const COL_LOOK = {A: 'fire', B: 'star', C: 'rock', D: 'holy', E: 'love'};
function lookOf(x){ if(!x) return LOOKS.star; if(typeof x === 'string') return LOOKS[x] || LOOKS.star; if(x.c && x.parts) return x;   // already a look
  const sk = x.skin || x, lk = sk && sk.look; if(lk){ if(typeof lk === 'string' && LOOKS[lk]) return LOOKS[lk]; if(typeof lk === 'object' && lk.c) return lk; }
  return LOOKS[FX_LOOK[x.fx] || COL_LOOK[x.col] || 'star'] || LOOKS.star; }
function addLook(key, o){ LOOKS[key] = Object.assign({key, name: key, icon: '✨', c: ['#fff', '#FFB020', '#C9761B'], parts: ['spark'], grav: 0, blend: 'norm', multi: null}, o, {key}); return LOOKS[key]; }

/* ---------- tiny helpers ---------- */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const easeOut = p => 1 - Math.pow(1 - clamp(p, 0, 1), 3);
const easeBack = p => { p = clamp(p, 0, 1); const c = 1.7; return Math.max(0, 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2)); };
const rnd = (seed, i) => { const v = Math.sin((seed || 1) * 127.1 + i * 311.7) * 43758.5453; return v - Math.floor(v); };
function mixHex(a, b, t){ const p = h => { h = String(h).replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }, A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function hexA(hex, a){ const h = String(hex).replace('#', ''), n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
const fade = (p, i, o) => p < i ? p / i : p > 1 - o ? Math.max(0, (1 - p) / o) : 1;   // fade in over i, out over o
function newCanvas(w, h){ if(typeof document !== 'undefined'){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; } if(typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h); return null; }

/* ---------- 🎆 particle sprites (drawn once per type + colour + size, then reused) ---------- */
const SPRITES = new Map(), BUCKETS = [8, 12, 16, 24, 32, 48, 64, 96, 128];   // sprites are drawn at a few sizes, then scaled
function sprite(type, col, px){
  px = BUCKETS.find(b => b >= px) || 128; const key = type + col + px; let c = SPRITES.get(key); if(c) return c;
  if(SPRITES.size > 600) SPRITES.clear();
  const S = px * 2; c = newCanvas(S, S); if(!c) return null; const g = c.getContext('2d'), m = S / 2, r = px * 0.5; g.translate(m, m);
  const star = (n, ro, ri) => { g.beginPath(); for(let i = 0; i < n * 2; i++){ const a = i / (n * 2) * TAU - Math.PI / 2, rr = i % 2 ? ri : ro; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); };
  const heart = s => { g.beginPath(); g.moveTo(0, s * 0.35); g.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.45, -s * 1.05, 0, -s * 0.42); g.bezierCurveTo(s * 0.45, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35); g.closePath(); };
  g.lineJoin = 'round'; g.lineCap = 'round';
  switch(type){
    case 'glow': { const gr = g.createRadialGradient(0, 0, 0, 0, 0, px); gr.addColorStop(0, hexA(col, 0.9)); gr.addColorStop(0.35, hexA(col, 0.45)); gr.addColorStop(1, hexA(col, 0)); g.fillStyle = gr; g.fillRect(-px, -px, S, S); break; }
    case 'spark': { const gr = g.createRadialGradient(0, 0, 0, 0, 0, px); gr.addColorStop(0, hexA(col, 0.6)); gr.addColorStop(1, hexA(col, 0)); g.fillStyle = gr; g.fillRect(-px, -px, S, S);
      g.fillStyle = '#fff'; star(4, r * 1.25, r * 0.22); g.fill(); g.fillStyle = hexA(col, 0.85); star(4, r * 0.8, r * 0.16); g.fill(); break; }
    case 'star': g.fillStyle = col; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = r * 0.18; star(5, r, r * 0.45); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(-r * 0.15, -r * 0.2, r * 0.18, 0, TAU); g.fill(); break;
    case 'ember': { const gr = g.createRadialGradient(0, r * 0.2, 0, 0, r * 0.2, r); gr.addColorStop(0, '#FFF6C8'); gr.addColorStop(0.45, col); gr.addColorStop(1, hexA(col, 0)); g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, -r * 1.1); g.quadraticCurveTo(r * 0.75, 0, 0, r * 0.8); g.quadraticCurveTo(-r * 0.75, 0, 0, -r * 1.1); g.fill(); break; }
    case 'petal': { const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#fff'); gr.addColorStop(0.5, col); gr.addColorStop(1, col); g.fillStyle = gr;
      g.beginPath(); g.ellipse(0, 0, r * 0.55, r, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(0, -r * 0.7); g.lineTo(0, r * 0.6); g.stroke(); break; }
    case 'heart': g.fillStyle = col; heart(r); g.fill(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = r * 0.14; g.stroke(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(-r * 0.32, -r * 0.42, r * 0.16, r * 0.1, -0.6, 0, TAU); g.fill(); break;
    case 'note': g.fillStyle = col; g.strokeStyle = col; g.lineWidth = r * 0.2; g.beginPath(); g.ellipse(-r * 0.3, r * 0.55, r * 0.38, r * 0.28, -0.4, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(r * 0.05, r * 0.5); g.lineTo(r * 0.05, -r * 0.85); g.quadraticCurveTo(r * 0.7, -r * 0.6, r * 0.6, -r * 0.1); g.stroke(); break;
    case 'flake': g.strokeStyle = '#fff'; g.lineWidth = r * 0.22; for(let i = 0; i < 6; i++){ g.save(); g.rotate(i / 6 * TAU); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -r); g.moveTo(0, -r * 0.55); g.lineTo(-r * 0.28, -r * 0.8); g.moveTo(0, -r * 0.55); g.lineTo(r * 0.28, -r * 0.8); g.stroke(); g.restore(); }
      g.strokeStyle = col; g.lineWidth = r * 0.1; for(let i = 0; i < 6; i++){ g.save(); g.rotate(i / 6 * TAU); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -r * 0.9); g.stroke(); g.restore(); } break;
    case 'shard': { const gr = g.createLinearGradient(-r * 0.3, 0, r * 0.3, 0); gr.addColorStop(0, '#fff'); gr.addColorStop(1, col); g.fillStyle = gr; g.beginPath(); g.moveTo(0, -r); g.lineTo(r * 0.32, 0); g.lineTo(0, r); g.lineTo(-r * 0.32, 0); g.closePath(); g.fill(); break; }
    case 'gem': g.fillStyle = col; g.beginPath(); for(let i = 0; i < 6; i++){ const a = i / 6 * TAU; g.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.85); } g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(-r * 0.5, -r * 0.42); g.lineTo(0, -r * 0.1); g.lineTo(r * 0.5, -r * 0.42); g.lineTo(0, -r * 0.8); g.closePath(); g.fill(); break;
    case 'bubble': g.strokeStyle = hexA(col, 0.95); g.lineWidth = r * 0.14; g.fillStyle = hexA(col, 0.18); g.beginPath(); g.arc(0, 0, r * 0.85, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.ellipse(-r * 0.32, -r * 0.35, r * 0.2, r * 0.12, -0.7, 0, TAU); g.fill(); break;
    case 'drop': { const gr = g.createRadialGradient(-r * 0.2, r * 0.1, 0, 0, r * 0.2, r); gr.addColorStop(0, '#fff'); gr.addColorStop(0.35, col); gr.addColorStop(1, col); g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, -r); g.bezierCurveTo(r * 0.75, -r * 0.1, r * 0.65, r * 0.75, 0, r * 0.75); g.bezierCurveTo(-r * 0.65, r * 0.75, -r * 0.75, -r * 0.1, 0, -r); g.fill(); break; }
    case 'leaf': g.fillStyle = col; g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 0.8, 0, 0, r); g.quadraticCurveTo(-r * 0.8, 0, 0, -r); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(0, -r * 0.8); g.lineTo(0, r * 0.85); g.stroke(); break;
    case 'puff': { g.fillStyle = hexA(col, 0.75); [[0, 0, 0.62], [-0.4, 0.15, 0.45], [0.42, 0.12, 0.47], [0.05, -0.32, 0.45]].forEach(([x, y, k]) => { g.beginPath(); g.arc(x * r, y * r, k * r, 0, TAU); g.fill(); });
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(-r * 0.12, -r * 0.3, r * 0.25, 0, TAU); g.fill(); break; }
    case 'rock': g.fillStyle = col; g.beginPath(); [[0, -1], [0.75, -0.5], [0.85, 0.35], [0.2, 0.85], [-0.6, 0.65], [-0.9, -0.1], [-0.45, -0.75]].forEach(([x, y]) => g.lineTo(x * r * 0.8, y * r * 0.8)); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(-r * 0.3, -r * 0.55); g.lineTo(r * 0.4, -r * 0.4); g.lineTo(0, -r * 0.1); g.closePath(); g.fill(); break;
    case 'coin': g.fillStyle = '#C98A1E'; g.beginPath(); g.ellipse(0, r * 0.08, r * 0.85, r * 0.85, 0, 0, TAU); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(0, 0, r * 0.82, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = r * 0.12; g.beginPath(); g.arc(0, 0, r * 0.55, 0, TAU); g.stroke(); g.fillStyle = 'rgba(255,255,255,.8)'; star(4, r * 0.3, r * 0.08); g.fill(); break;
    case 'feather': g.fillStyle = col; g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 0.6, -r * 0.1, r * 0.08, r * 0.9); g.quadraticCurveTo(-r * 0.55, 0, 0, -r); g.fill();
      g.strokeStyle = 'rgba(160,140,110,.7)'; g.lineWidth = r * 0.08; g.beginPath(); g.moveTo(0, -r * 0.8); g.quadraticCurveTo(r * 0.1, 0, r * 0.05, r); g.stroke(); break;
    case 'square': g.fillStyle = col; g.fillRect(-r * 0.45, -r * 0.7, r * 0.9, r * 1.4); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-r * 0.45, -r * 0.7, r * 0.3, r * 1.4); break;
    case 'plus': g.fillStyle = col; g.strokeStyle = '#fff'; g.lineWidth = r * 0.16; g.beginPath(); g.roundRect ? g.roundRect(-r * 0.3, -r * 0.85, r * 0.6, r * 1.7, r * 0.2) : g.rect(-r * 0.3, -r * 0.85, r * 0.6, r * 1.7);
      g.rect(-r * 0.85, -r * 0.3, r * 1.7, r * 0.6); g.fill(); break;
    case 'z': g.fillStyle = col; g.strokeStyle = '#fff'; g.lineWidth = r * 0.22; g.font = '900 ' + Math.round(r * 1.9) + 'px Fredoka, Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeText('Z', 0, 0); g.fillText('Z', 0, 0); break;
    default: g.fillStyle = col; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  }
  SPRITES.set(key, c); return c;
}
function partCol(L, i, seed){ if(L.multi) return L.multi[Math.floor(rnd(seed, i + 7) * L.multi.length)]; return i % 3 === 2 ? L.c[0] : i % 3 === 1 ? L.c[2] : L.c[1]; }
// paint one sprite centred at x, y (rot in rad, a = alpha)
function spr(g, type, col, x, y, size, rot, a){ if(a <= 0.01 || size < 1) return; const c = sprite(type, col, size); if(!c) return; const S = size;
  g.globalAlpha = Math.min(1, a); if(rot){ g.save(); g.translate(x, y); g.rotate(rot); g.drawImage(c, -S, -S, S * 2, S * 2); g.restore(); } else g.drawImage(c, x - S, y - S, S * 2, S * 2); g.globalAlpha = 1; }
function glow(g, x, y, r, col, a){ spr(g, 'glow', col, x, y, r * 1.15, 0, a); }   // drawn radius ≈ r
function withBlend(g, L, fn){ const keep = g.globalCompositeOperation; if(L.blend === 'add') g.globalCompositeOperation = 'lighter'; try{ fn(); } finally{ g.globalCompositeOperation = keep; g.globalAlpha = 1; } }
function jag(g, x1, y1, x2, y2, segs, amp, seed){ g.beginPath(); g.moveTo(x1, y1); for(let i = 1; i < segs; i++){ const q = i / segs, nx = -(y2 - y1), ny = x2 - x1, l = Math.hypot(nx, ny) || 1, o = (rnd(seed, i) - 0.5) * 2 * amp;
  g.lineTo(x1 + (x2 - x1) * q + nx / l * o, y1 + (y2 - y1) * q + ny / l * o); } g.lineTo(x2, y2); }
const sizeOf = S => S.size || Math.max(8, (S.r || 40) * 0.28);

/* ---------- 🖌️ painters: (g, S, L) — S = spec (pixels), L = look ---------- */
const PAINTERS = {
  // a flying ball / arrow / rose from (x, y) to (x2, y2), arcing up by h
  shot(g, S, L){ const p = clamp(S.p, 0, 1), q = easeOut(p * 1.05), sz = sizeOf(S), h = S.h || 0, seed = S.seed || 3;
    const at = k => ({x: S.x + (S.x2 - S.x) * k, y: S.y + (S.y2 - S.y) * k - Math.sin(k * Math.PI) * h});
    const head = at(q), ang = Math.atan2(at(Math.min(1, q + 0.02)).y - head.y, at(Math.min(1, q + 0.02)).x - head.x);
    withBlend(g, L, () => {
      for(let i = 8; i >= 1; i--){ const k = Math.max(0, q - i * 0.035); const pt = at(k); spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), pt.x + (rnd(seed, i) - 0.5) * sz * 0.5, pt.y + (rnd(seed, i + 9) - 0.5) * sz * 0.5, sz * (1 - i * 0.08), i + S.t * 4, (1 - i / 9) * 0.75 * fade(p, 0.05, 0.12)); }
      glow(g, head.x, head.y, sz * 1.5, L.c[1], 0.85 * fade(p, 0.05, 0.1));
      g.save(); g.translate(head.x, head.y); g.rotate(ang); g.globalAlpha = fade(p, 0.05, 0.1);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, sz * 0.75); gr.addColorStop(0, '#fff'); gr.addColorStop(0.45, L.c[0]); gr.addColorStop(1, L.c[1]); g.fillStyle = gr;
      g.beginPath(); g.ellipse(-sz * 0.12, 0, sz * 0.78, sz * 0.55, 0, 0, TAU); g.fill(); g.restore(); g.globalAlpha = 1;
      for(let i = 0; i < 3; i++){ const a = S.t * 9 + i / 3 * TAU; spr(g, 'spark', L.c[0], head.x + Math.cos(a) * sz * 0.9, head.y + Math.sin(a) * sz * 0.6, sz * 0.55, 0, 0.8 * fade(p, 0.05, 0.1)); }
      if(p > 0.85){ const k = (p - 0.85) / 0.15; glow(g, S.x2, S.y2, sz * (1 + k * 2), L.c[0], 1 - k); for(let i = 0; i < 6; i++){ const a = i / 6 * TAU + seed; spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x2 + Math.cos(a) * sz * 2 * k, S.y2 + Math.sin(a) * sz * 1.2 * k, sz * 0.7, a, 1 - k); } }
    }); },
  // a fan of breath / spray from (x, y) along ang, len long, half-angle w
  cone(g, S, L){ const p = clamp(S.p, 0, 1), reach = S.len * (0.3 + 0.7 * easeOut(p * 1.6)), w = S.w || 0.5, sq = S.sq || 1, seed = S.seed || 5, a0 = fade(p, 0.08, 0.45);
    withBlend(g, L, () => {
      g.save(); g.translate(S.x, S.y); g.scale(1, sq); g.rotate(S.ang || 0);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, reach); gr.addColorStop(0, hexA(L.c[0], 0.95 * a0)); gr.addColorStop(0.35, hexA(L.c[1], 0.8 * a0)); gr.addColorStop(0.8, hexA(L.c[2], 0.35 * a0)); gr.addColorStop(1, hexA(L.c[2], 0));
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); for(let i = 0; i <= 14; i++){ const a = -w + i / 14 * w * 2, wob = 1 + Math.sin(i * 1.7 + S.t * 14) * 0.06; g.lineTo(Math.cos(a) * reach * wob, Math.sin(a) * reach * wob); } g.closePath(); g.fill();
      g.strokeStyle = hexA(L.c[0], 0.55 * a0); g.lineWidth = Math.max(1.5, S.len * 0.02); for(let i = 0; i < 4; i++){ const a = (rnd(seed, i + Math.floor(S.t * 20)) - 0.5) * w * 1.6; g.beginPath(); g.moveTo(Math.cos(a) * reach * 0.15, Math.sin(a) * reach * 0.15); g.lineTo(Math.cos(a) * reach * 0.85, Math.sin(a) * reach * 0.85); g.stroke(); }
      g.restore();
      const sz = Math.max(6, S.len * 0.09);
      for(let i = 0; i < 16; i++){ const fr = (rnd(seed, i) * 0.6 + p * 0.9) % 1, a = (S.ang || 0) + (rnd(seed, i + 30) - 0.5) * 2 * w * 0.9, rr = reach * fr; const x = S.x + Math.cos(a) * rr, y = S.y + Math.sin(a) * rr * sq - L.grav * -1 * fr * sz;
        spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), x, y, sz * (0.6 + fr * 0.7), i + S.t * 3, a0 * (1 - fr * 0.6)); }
      glow(g, S.x, S.y, sz * 1.6, L.c[0], a0);
    }); },
  // a burst where it lands: flash, shock ring, flying bits, a mark on the ground
  splash(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 40, sq = S.sq || 1, seed = S.seed || 7, k = easeOut(p);
    g.save(); g.globalAlpha = 0.2 * (1 - p); g.fillStyle = L.c[2]; g.beginPath(); g.ellipse(S.x, S.y, r * 0.7, r * 0.7 * sq, 0, 0, TAU); g.fill(); g.restore();
    withBlend(g, L, () => {
      if(p < 0.35) glow(g, S.x, S.y - r * 0.2, r * (0.55 + p * 1.3), L.c[0], 1 - p / 0.35);
      g.strokeStyle = hexA(L.c[1], 0.9 * (1 - p)); g.lineWidth = Math.max(2, r * 0.12 * (1 - p)); g.beginPath(); g.ellipse(S.x, S.y, r * (0.25 + k), r * (0.25 + k) * sq, 0, 0, TAU); g.stroke();
      g.strokeStyle = hexA(L.c[0], 0.8 * (1 - p)); g.lineWidth = Math.max(1, r * 0.05 * (1 - p)); g.beginPath(); g.ellipse(S.x, S.y, r * (0.1 + k * 0.7), r * (0.1 + k * 0.7) * sq, 0, 0, TAU); g.stroke();
      const sz = Math.max(6, r * 0.27);
      for(let i = 0; i < 12; i++){ const a = rnd(seed, i) * TAU, sp = 0.5 + rnd(seed, i + 20) * 0.7, d = r * sp * k * 1.2, up = Math.sin(clamp(p * 1.3, 0, 1) * Math.PI) * r * (0.4 + rnd(seed, i + 40) * 0.5);
        spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + Math.cos(a) * d, S.y + Math.sin(a) * d * sq - up + L.grav * p * p * r * 0.3, sz * (1 - p * 0.4), a + p * 6, 1 - p * p); }
    }); },
  // lightning hopping from point to point (pts) or from (x, y) to (x2, y2)
  chain(g, S, L){ const p = clamp(S.p, 0, 1), pts = S.pts && S.pts.length ? [{x: S.x, y: S.y}].concat(S.pts) : [{x: S.x, y: S.y}, {x: S.x2, y: S.y2}], seed = (S.seed || 9) + Math.floor(S.t * 24), a = fade(p, 0.02, 0.5);
    const shown = Math.min(pts.length - 1, Math.ceil((pts.length - 1) * clamp(p * 3, 0, 1)));
    withBlend(g, L, () => { g.lineCap = 'round'; g.lineJoin = 'round';
      for(let s = 0; s < shown; s++){ const A = pts[s], B = pts[s + 1], d = Math.hypot(B.x - A.x, B.y - A.y), segs = Math.max(4, Math.round(d / 14));
        g.strokeStyle = hexA(L.c[1], 0.35 * a); g.lineWidth = Math.max(5, d * 0.06); jag(g, A.x, A.y, B.x, B.y, segs, d * 0.08, seed + s); g.stroke();
        g.strokeStyle = hexA(L.c[0], a); g.lineWidth = Math.max(1.6, d * 0.018); jag(g, A.x, A.y, B.x, B.y, segs, d * 0.08, seed + s); g.stroke();
        g.strokeStyle = hexA(L.c[1], 0.7 * a); g.lineWidth = 1; jag(g, A.x, A.y, B.x, B.y, segs, d * 0.14, seed + s + 50); g.stroke();
        glow(g, B.x, B.y, Math.max(10, d * 0.16), L.c[0], a); spr(g, 'spark', L.c[1], B.x, B.y, Math.max(10, d * 0.14), S.t * 5, a); }
      glow(g, S.x, S.y, 14, L.c[0], a * 0.8); }); },
  // a steady ray from (x, y) to (x2, y2), w wide
  beam(g, S, L){ const p = clamp(S.p, 0, 1), w = S.w || 12, ext = easeOut(clamp(p * 4, 0, 1)), a = fade(p, 0.02, 0.35), x2 = S.x + (S.x2 - S.x) * ext, y2 = S.y + (S.y2 - S.y) * ext, pul = 1 + Math.sin(S.t * 30) * 0.12, seed = S.seed || 4;
    withBlend(g, L, () => { g.lineCap = 'round';
      [[w * 2.2, L.c[2], 0.25], [w * 1.2, L.c[1], 0.6], [w * 0.45, L.c[0], 1]].forEach(([lw, c, al]) => { g.strokeStyle = hexA(c, al * a); g.lineWidth = lw * pul; g.beginPath(); g.moveTo(S.x, S.y); g.lineTo(x2, y2); g.stroke(); });
      const L2 = Math.hypot(x2 - S.x, y2 - S.y); for(let i = 0; i < 7; i++){ const fr = (rnd(seed, i) + S.t * 1.8) % 1; spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + (x2 - S.x) * fr + (rnd(seed, i + 5) - 0.5) * w, S.y + (y2 - S.y) * fr + (rnd(seed, i + 8) - 0.5) * w, w * 0.9, S.t * 6 + i, a * 0.9); }
      glow(g, S.x, S.y, w * 1.6, L.c[0], a); if(L2 > 4) glow(g, x2, y2, w * 2.2 * pul, L.c[1], a); }); },
  // a cloud overhead that strikes the ground inside r
  storm(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 50, sq = S.sq || 1, h = S.h || r * 1.6, cy = S.y - h, a = fade(p, 0.12, 0.25), seed = S.seed || 11;
    g.save(); g.globalAlpha = 0.25 * a; g.fillStyle = L.c[2]; g.beginPath(); g.ellipse(S.x, S.y, r, r * sq, 0, 0, TAU); g.fill(); g.restore();
    for(let i = 0; i < 6; i++){ const x = S.x + (i - 2.5) * r * 0.32 + Math.sin(S.t * 2 + i) * 3, y = cy + (i % 2 ? -r * 0.1 : r * 0.06); spr(g, 'puff', i % 2 ? '#7E7A9A' : '#9C98B8', x, y, r * 0.75, 0, a * 0.95); }
    spr(g, 'puff', L.c[2], S.x, cy + r * 0.1, r * 0.8, 0, a * 0.5);
    withBlend(g, L, () => {
      for(let i = 0; i < 10; i++){ const fr = (rnd(seed, i) + S.t * 2.2) % 1, x = S.x + (rnd(seed, i + 3) - 0.5) * r * 1.6; spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), x, cy + r * 0.2 + fr * h, r * 0.18, i, a * (1 - fr)); }
      const slot = Math.floor(S.t * 7), k = S.t * 7 - slot; if(k < 0.55 && a > 0.2){ const ox = S.x + (rnd(seed, slot) - 0.5) * r * 1.5, oy = S.y + (rnd(seed, slot + 99) - 0.5) * r * 1.5 * sq;
        g.lineCap = 'round'; g.strokeStyle = hexA(L.c[1], 0.45 * a); g.lineWidth = r * 0.12; jag(g, ox + r * 0.1, cy + r * 0.2, ox, oy, 6, r * 0.18, slot); g.stroke();
        g.strokeStyle = hexA(L.c[0], a); g.lineWidth = Math.max(2, r * 0.04); jag(g, ox + r * 0.1, cy + r * 0.2, ox, oy, 6, r * 0.18, slot); g.stroke(); glow(g, ox, oy, r * 0.45, L.c[0], a * (1 - k)); }
    }); },
  // a spinning funnel at (x, y), r wide
  tornado(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 40, sq = S.sq || 1, H = S.h || r * 2.4, a = fade(p, 0.12, 0.3), seed = S.seed || 13, grow = easeBack(clamp(p * 4, 0, 1));
    g.save(); g.globalAlpha = 0.22 * a; g.fillStyle = L.c[2]; g.beginPath(); g.ellipse(S.x, S.y, r * 0.9, r * 0.9 * sq, 0, 0, TAU); g.fill(); g.restore();
    withBlend(g, L, () => { for(let i = 0; i < 10; i++){ const k = i / 9, y = S.y - k * H * grow, rw = r * (0.25 + k * 0.85) * grow, ox = Math.sin(S.t * 6 + i * 0.7) * r * 0.18 * k;
        g.strokeStyle = hexA(i % 2 ? L.c[1] : L.c[0], (0.35 + 0.5 * (1 - k)) * a); g.lineWidth = Math.max(1.5, r * 0.08 * (1 - k * 0.5)); g.beginPath(); g.ellipse(S.x + ox, y, rw, rw * 0.28, 0, S.t * 9 + i, S.t * 9 + i + Math.PI * 1.5); g.stroke(); }
      for(let i = 0; i < 12; i++){ const k = (rnd(seed, i) + S.t * 0.6) % 1, an = S.t * 7 + i * 1.3, rw = r * (0.3 + k * 0.8); spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + Math.cos(an) * rw, S.y - k * H * grow + Math.sin(an) * rw * 0.28, r * 0.22, an, a * (1 - k * 0.5)); } }); },
  // a rock / star falls from the sky onto (x, y), then a big splash
  meteor(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 50, hit = 0.55, seed = S.seed || 17;
    if(p < hit){ const k = p / hit, kk = k * k, sx = S.x + r * 1.6 * (1 - kk), sy = S.y - (S.h || r * 4) * (1 - kk), sz = S.size || Math.min(r * 0.45, 70);
      g.save(); g.globalAlpha = 0.15 + 0.35 * k; g.fillStyle = L.c[2]; g.beginPath(); g.ellipse(S.x, S.y, r * k, r * k * (S.sq || 1), 0, 0, TAU); g.fill(); g.restore();
      withBlend(g, L, () => { for(let i = 7; i >= 1; i--){ const kt = Math.max(0, kk - i * 0.05); spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + r * 1.6 * (1 - kt), S.y - (S.h || r * 4) * (1 - kt), sz * (1 - i * 0.09), i, 0.7 * (1 - i / 8)); }
        glow(g, sx, sy, sz * 2, L.c[1], 0.9); const gr = g.createRadialGradient(sx - sz * 0.2, sy - sz * 0.2, 0, sx, sy, sz); gr.addColorStop(0, '#fff'); gr.addColorStop(0.4, L.c[0]); gr.addColorStop(1, L.c[1]); g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, sz * 0.7, 0, TAU); g.fill(); });
    } else PAINTERS.splash(g, Object.assign({}, S, {p: (p - hit) / (1 - hit), r: r * 1.15}), L); },
  // a curvy ribbon / hair / vine cracking from (x, y) to (x2, y2)
  whip(g, S, L){ const p = clamp(S.p, 0, 1), ext = Math.sin(clamp(p * 1.4, 0, 1) * Math.PI * 0.5), a = fade(p, 0.02, 0.4), w = S.w || 10, seed = S.seed || 19, dx = S.x2 - S.x, dy = S.y2 - S.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    const at = k => { const wav = Math.sin(k * 6 - S.t * 18) * d * 0.06 * k + Math.sin(k * Math.PI) * d * 0.18; return {x: S.x + dx * k * ext + nx * wav, y: S.y + dy * k * ext + ny * wav}; };
    g.lineCap = 'round'; for(let pass = 0; pass < 2; pass++){ g.beginPath(); for(let i = 0; i <= 18; i++){ const pt = at(i / 18); i ? g.lineTo(pt.x, pt.y) : g.moveTo(pt.x, pt.y); }
      g.strokeStyle = hexA(pass ? L.c[1] : L.c[2], a); g.lineWidth = pass ? w * 0.55 : w; g.stroke(); }
    const tip = at(1); withBlend(g, L, () => { for(let i = 0; i < 6; i++){ const pt = at(1 - i * 0.08); spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), pt.x, pt.y, w * 1.1, i + S.t * 5, a * (1 - i / 7)); }
      if(p > 0.35 && p < 0.75){ const k = (p - 0.35) / 0.4; spr(g, 'spark', L.c[0], tip.x, tip.y, w * (2 + k * 3), k * 3, 1 - k); } }); },
  // several little things fly out to targets (pts) or spread around (x2, y2)
  swarm(g, S, L){ const n = S.n || (S.pts ? S.pts.length : 5), seed = S.seed || 23, sz = sizeOf(S);
    for(let i = 0; i < n; i++){ const tg = S.pts && S.pts[i % S.pts.length] || {x: S.x2 + (rnd(seed, i) - 0.5) * (S.r || 60), y: S.y2 + (rnd(seed, i + 4) - 0.5) * (S.r || 60) * (S.sq || 1)};
      const pi = clamp((S.p - i * 0.06) / (1 - Math.min(0.5, n * 0.06)), 0, 1); if(pi <= 0) continue;
      PAINTERS.shot(g, {x: S.x + (rnd(seed, i + 9) - 0.5) * 20, y: S.y, x2: tg.x, y2: tg.y, p: pi, t: S.t + i, h: (S.h || 40) * (0.6 + rnd(seed, i + 2) * 0.8), size: sz * 0.7, seed: seed + i}, L); } },
  // waves pushing outward
  push(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 60, sq = S.sq || 1, seed = S.seed || 29;
    withBlend(g, L, () => { for(let w = 0; w < 3; w++){ const k = clamp(p * 1.4 - w * 0.18, 0, 1); if(k <= 0 || k >= 1) continue; const R = r * (0.2 + easeOut(k));
        g.strokeStyle = hexA(w ? L.c[1] : L.c[0], (1 - k) * 0.9); g.lineWidth = Math.max(2, r * 0.09 * (1 - k)); g.beginPath(); g.ellipse(S.x, S.y, R, R * sq, 0, 0, TAU); g.stroke(); }
      for(let i = 0; i < 10; i++){ const a = i / 10 * TAU + rnd(seed, i), d = r * (0.25 + easeOut(p) * 1.05); spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + Math.cos(a) * d, S.y + Math.sin(a) * d * sq - r * 0.2, r * 0.25, a + p * 4, 1 - p); } }); },
  // a vortex sucking inward
  pull(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 60, sq = S.sq || 1, a = fade(p, 0.1, 0.3), seed = S.seed || 31;
    withBlend(g, L, () => { for(let arm = 0; arm < 4; arm++){ g.beginPath(); for(let i = 0; i <= 20; i++){ const k = i / 20, an = arm / 4 * TAU + k * 4 - S.t * 6, R = r * (1 - k) * (1 - p * 0.5); const x = S.x + Math.cos(an) * R, y = S.y + Math.sin(an) * R * sq; i ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.strokeStyle = hexA(arm % 2 ? L.c[1] : L.c[0], 0.75 * a); g.lineWidth = Math.max(2, r * 0.06); g.stroke(); }
      for(let i = 0; i < 12; i++){ const k = (rnd(seed, i) + S.t * 1.4) % 1, an = rnd(seed, i + 3) * TAU + k * 3, R = r * (1 - k); spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + Math.cos(an) * R, S.y + Math.sin(an) * R * sq, r * 0.16 * (1 - k * 0.5), an, a * k); }
      glow(g, S.x, S.y, r * 0.5, L.c[1], a); }); },
  // an area on the ground (slow / sleep / fear / charm / confuse / lava …) with motes rising
  zone(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 50, sq = S.sq || 1, a = fade(p, 0.12, 0.25), seed = S.seed || 37, R = r * (0.6 + 0.4 * easeBack(clamp(p * 5, 0, 1)));
    const gr = g.createRadialGradient(S.x, S.y, 0, S.x, S.y, R); gr.addColorStop(0, hexA(L.c[1], 0.5 * a)); gr.addColorStop(0.7, hexA(L.c[1], 0.3 * a)); gr.addColorStop(0.97, hexA(L.c[2], 0.35 * a)); gr.addColorStop(1, hexA(L.c[2], 0));
    g.save(); g.translate(S.x, S.y); g.scale(1, sq); g.translate(-S.x, -S.y); g.fillStyle = gr; g.beginPath(); g.arc(S.x, S.y, R, 0, TAU); g.fill();
    g.setLineDash([R * 0.18, R * 0.12]); g.lineDashOffset = -S.t * R * 0.5; g.strokeStyle = hexA(L.c[2], 0.9 * a); g.lineWidth = Math.max(2, r * 0.06); g.beginPath(); g.arc(S.x, S.y, R * 0.96, 0, TAU); g.stroke(); g.setLineDash([]); g.restore();
    withBlend(g, L, () => { for(let i = 0; i < 12; i++){ const k = (rnd(seed, i) + S.t * 0.5) % 1, an = rnd(seed, i + 7) * TAU, d = Math.sqrt(rnd(seed, i + 11)) * R * 0.85, up = L.grav <= 0.2 ? k * r * 0.9 : (1 - k) * r * 0.4;
        spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + Math.cos(an) * d + Math.sin(S.t * 2 + i) * r * 0.05, S.y + Math.sin(an) * d * sq - up, r * 0.27, Math.sin(S.t + i), a * Math.sin(k * Math.PI)); } }); },
  // stars / hearts spinning round heads (dizzy)
  daze(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 24, h = S.h || 0, a = fade(p, 0.1, 0.3), n = S.n || 5;
    withBlend(g, L, () => { for(let i = 0; i < n; i++){ const an = S.t * 5 + i / n * TAU, x = S.x + Math.cos(an) * r, y = S.y - h + Math.sin(an) * r * 0.35, front = Math.sin(an) > 0;
      spr(g, L.parts[i % L.parts.length], partCol(L, i, S.seed || 41), x, y, r * (front ? 0.62 : 0.45), an, a * (front ? 1 : 0.6)); } }); },
  // a bubble / glass dome over (x, y)
  dome(g, S, L){ const p = clamp(S.p, 0, 1), r = (S.r || 60) * easeBack(clamp(p * 3, 0, 1)), sq = S.sq || 1, a = fade(p, 0.05, 0.3), H = r * 0.95; if(r < 2) return;
    g.save(); const gr = g.createRadialGradient(S.x - r * 0.3, S.y - H * 0.6, r * 0.05, S.x, S.y - H * 0.3, r * 1.1); gr.addColorStop(0, hexA('#FFFFFF', 0.55 * a)); gr.addColorStop(0.5, hexA(L.c[1], 0.18 * a)); gr.addColorStop(1, hexA(L.c[2], 0.35 * a));
    g.fillStyle = gr; g.beginPath(); g.ellipse(S.x, S.y, r, r * sq, 0, 0, Math.PI); g.ellipse(S.x, S.y, r, H, 0, Math.PI, TAU); g.fill();
    g.strokeStyle = hexA(L.c[1], 0.9 * a); g.lineWidth = Math.max(2, r * 0.035); g.beginPath(); g.ellipse(S.x, S.y, r, H, 0, Math.PI, TAU); g.stroke();
    g.strokeStyle = hexA(L.c[1], 0.5 * a); g.beginPath(); g.ellipse(S.x, S.y, r, r * sq, 0, 0, TAU); g.stroke();
    for(let i = 1; i < 4; i++){ g.strokeStyle = hexA(L.c[0], 0.25 * a); g.lineWidth = 1; g.beginPath(); g.ellipse(S.x, S.y, r * (1 - i * 0.22), H, 0, Math.PI, TAU); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,' + (0.8 * a) + ')'; g.lineWidth = Math.max(2, r * 0.05); g.beginPath(); g.ellipse(S.x, S.y, r * 0.8, H * 0.82, 0, Math.PI * 1.15, Math.PI * 1.4); g.stroke(); g.restore();
    withBlend(g, L, () => { for(let i = 0; i < 6; i++){ const an = Math.PI + (i + 0.5) / 6 * Math.PI + Math.sin(S.t + i) * 0.1; spr(g, 'spark', L.c[0], S.x + Math.cos(an) * r, S.y + Math.sin(an) * H, r * 0.14 * (1 + Math.sin(S.t * 6 + i) * 0.4), 0, a); } }); },
  // plates / petals circling round (x, y - h/2): shields, armour, mirrors
  shield(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 40, h = S.h || r * 1.2, a = fade(p, 0.08, 0.3), cy = S.y - h * 0.5, n = S.n || 6, R = r * easeBack(clamp(p * 4, 0, 1));
    const plates = []; for(let i = 0; i < n; i++){ const an = S.t * 1.8 + i / n * TAU; plates.push({an, z: Math.sin(an)}); } plates.sort((A, B) => A.z - B.z);
    plates.forEach(P => { const x = S.x + Math.cos(P.an) * R, y = cy + Math.sin(P.an) * R * 0.32, w = r * 0.42 * (0.55 + 0.45 * Math.abs(Math.cos(P.an))), hh = r * 0.55, al = a * (P.z > 0 ? 1 : 0.55);
      g.save(); g.globalAlpha = al; const gr = g.createLinearGradient(x - w / 2, y - hh / 2, x + w / 2, y + hh / 2); gr.addColorStop(0, '#fff'); gr.addColorStop(0.4, L.c[1]); gr.addColorStop(1, L.c[2]); g.fillStyle = gr;
      g.beginPath(); g.moveTo(x, y - hh / 2); g.quadraticCurveTo(x + w / 2, y - hh / 2, x + w / 2, y); g.quadraticCurveTo(x + w / 2, y + hh * 0.3, x, y + hh / 2); g.quadraticCurveTo(x - w / 2, y + hh * 0.3, x - w / 2, y); g.quadraticCurveTo(x - w / 2, y - hh / 2, x, y - hh / 2); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = Math.max(1, r * 0.03); g.stroke(); g.restore(); });
    withBlend(g, L, () => glow(g, S.x, cy, r * 1.1, L.c[1], a * 0.45)); },
  // a soft column of light + things rising (heal, regen, level up)
  heal(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 40, H = S.h || r * 2.4, a = fade(p, 0.1, 0.35), seed = S.seed || 43;
    withBlend(g, L, () => { const gr = g.createLinearGradient(0, S.y, 0, S.y - H); gr.addColorStop(0, hexA(L.c[1], 0.45 * a)); gr.addColorStop(1, hexA(L.c[1], 0)); g.fillStyle = gr; g.beginPath(); g.ellipse(S.x, S.y, r * 0.8, r * 0.8 * (S.sq || 0.5), 0, 0, Math.PI); g.lineTo(S.x - r * 0.6, S.y - H); g.lineTo(S.x + r * 0.6, S.y - H); g.closePath(); g.fill();
      for(let i = 0; i < 12; i++){ const k = (rnd(seed, i) + p * 1.3 + S.t * 0.3) % 1; spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + (rnd(seed, i + 3) - 0.5) * r * 1.4 + Math.sin(S.t * 3 + i) * r * 0.1, S.y - k * H, r * 0.26, 0, a * Math.sin(k * Math.PI)); } }); },
  // a portal on the ground: something arrives (minions, towers, fliers)
  summon(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 40, sq = S.sq || 1, a = fade(p, 0.05, 0.4), seed = S.seed || 47, R = r * easeBack(clamp(p * 3, 0, 1)); if(R < 1) return;
    withBlend(g, L, () => { g.save(); g.translate(S.x, S.y); g.scale(1, sq);
      g.strokeStyle = hexA(L.c[1], a); g.lineWidth = Math.max(2, r * 0.07); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
      g.strokeStyle = hexA(L.c[0], 0.8 * a); g.lineWidth = Math.max(1, r * 0.035); g.beginPath(); g.arc(0, 0, R * 0.72, 0, TAU); g.stroke();
      for(let i = 0; i < 8; i++){ g.save(); g.rotate(S.t * 1.5 + i / 8 * TAU); g.fillStyle = hexA(L.c[0], a); g.beginPath(); g.moveTo(R * 0.76, 0); g.lineTo(R * 0.94, -R * 0.06); g.lineTo(R * 0.94, R * 0.06); g.fill(); g.restore(); }
      g.restore();
      for(let i = 0; i < 5; i++){ const x = S.x + (rnd(seed, i) - 0.5) * R * 1.2, hh = r * (1.2 + rnd(seed, i + 2)) * Math.sin(clamp(p * 2, 0, 1) * Math.PI); const gr = g.createLinearGradient(0, S.y, 0, S.y - hh); gr.addColorStop(0, hexA(L.c[0], 0.55 * a)); gr.addColorStop(1, hexA(L.c[0], 0)); g.fillStyle = gr; g.fillRect(x - r * 0.05, S.y - hh, r * 0.1, hh); }
      for(let i = 0; i < 8; i++){ const k = (rnd(seed, i + 9) + p) % 1; spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + Math.cos(i * 0.8) * R * 0.8, S.y + Math.sin(i * 0.8) * R * 0.8 * sq - k * r * 1.2, r * 0.22, i, a * (1 - k)); } }); },
  // coins popping out in arcs
  gold(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 40, seed = S.seed || 53, n = S.n || 9;
    for(let i = 0; i < n; i++){ const a = (i / n - 0.5) * 2.4 - Math.PI / 2, v = 0.7 + rnd(seed, i) * 0.6, k = clamp(p * 1.2, 0, 1), x = S.x + Math.cos(a) * r * v * k * 1.3, y = S.y - Math.sin(-a) * 0 - (Math.sin(k * Math.PI) * r * 1.6 * v) + k * r * 0.2;
      const c = sprite(L.parts[0] === 'coin' ? 'coin' : L.parts[i % L.parts.length], partCol(L, i, seed), r * 0.42); if(!c) continue; const sx = Math.abs(Math.cos(S.t * 9 + i)) * 0.8 + 0.2, Sz = c.width / 2;
      g.save(); g.globalAlpha = 1 - p * p; g.translate(x, y); g.scale(sx, 1); g.drawImage(c, -Sz, -Sz, Sz * 2, Sz * 2); g.restore(); }
    withBlend(g, L, () => { if(p < 0.3) glow(g, S.x, S.y - r * 0.4, r * (0.55 + p * 1.3), L.c[0], 1 - p / 0.3); }); },
  // a rune circle on the ground — snaps when it fires; idle = waiting (pulses)
  trap(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 34, sq = S.sq || 1, idle = !!S.idle, a = idle ? 0.5 : fade(p, 0.02, 0.5), pul = idle ? 1 + Math.sin(S.t * 3) * 0.05 : 1 + easeOut(p) * 0.35;
    g.save(); g.translate(S.x, S.y); g.scale(1, sq);
    g.fillStyle = hexA(L.c[2], (idle ? 0.12 : 0.22) * a); g.beginPath(); g.arc(0, 0, r * pul, 0, TAU); g.fill();
    g.strokeStyle = hexA(L.c[1], a); g.lineWidth = Math.max(1.5, r * 0.07); g.beginPath(); g.arc(0, 0, r * pul, 0, TAU); g.stroke();
    g.rotate(S.t * (idle ? 0.8 : 4)); g.strokeStyle = hexA(L.c[0], 0.85 * a); g.lineWidth = Math.max(1, r * 0.05); g.beginPath();
    for(let i = 0; i < 3; i++){ const an = i / 3 * TAU; g.moveTo(Math.cos(an) * r * 0.7 * pul, Math.sin(an) * r * 0.7 * pul); g.lineTo(Math.cos(an + TAU / 3) * r * 0.7 * pul, Math.sin(an + TAU / 3) * r * 0.7 * pul); } g.stroke();
    for(let i = 0; i < 6; i++){ const an = i / 6 * TAU; g.fillStyle = hexA(L.c[0], a); g.beginPath(); g.arc(Math.cos(an) * r * 0.86 * pul, Math.sin(an) * r * 0.86 * pul, r * 0.07, 0, TAU); g.fill(); }
    g.restore();
    if(!idle && p < 0.6) PAINTERS.splash(g, Object.assign({}, S, {p: p / 0.6, r: r * 1.1}), L); },
  // speed lines + rising chevrons
  haste(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 40, a = fade(p, 0.1, 0.35), seed = S.seed || 59;
    withBlend(g, L, () => { g.lineCap = 'round'; for(let i = 0; i < 9; i++){ const k = (rnd(seed, i) + S.t * 2.5) % 1, x = S.x + (rnd(seed, i + 4) - 0.5) * r * 2, y = S.y - r * 0.2 - rnd(seed, i + 8) * r * 1.6;
        g.strokeStyle = hexA(i % 2 ? L.c[1] : L.c[0], a * Math.sin(k * Math.PI)); g.lineWidth = Math.max(1.5, r * 0.05); g.beginPath(); g.moveTo(x - r * 0.5 * k, y); g.lineTo(x - r * 0.5 * k - r * 0.6, y); g.stroke(); }
      for(let i = 0; i < 3; i++){ const k = (p * 1.5 + i * 0.3) % 1, y = S.y - k * r * 2; g.strokeStyle = hexA(L.c[1], a * (1 - k)); g.lineWidth = Math.max(2, r * 0.09); g.beginPath(); g.moveTo(S.x - r * 0.4, y + r * 0.25); g.lineTo(S.x, y); g.lineTo(S.x + r * 0.4, y + r * 0.25); g.stroke(); } }); },
  // blocks / crystals rising from the ground along ang
  wall(g, S, L){ const p = clamp(S.p, 0, 1), len = S.len || 80, n = S.n || 5, ang = S.ang || 0, sq = S.sq || 1, hh = S.h || len * 0.32, a = fade(p, 0.02, 0.2);
    for(let i = 0; i < n; i++){ const k = (i + 0.5) / n - 0.5, x = S.x + Math.cos(ang) * len * k, y = S.y + Math.sin(ang) * len * k * sq, up = easeBack(clamp(p * 4 - i * 0.12, 0, 1)), w = len / n * 0.85, H = hh * up * (0.85 + rnd(S.seed || 61, i) * 0.3); if(H <= 0) continue;
      g.save(); g.globalAlpha = a; g.fillStyle = L.c[2]; g.fillRect(x - w / 2, y - H, w, H); g.fillStyle = L.c[1]; g.fillRect(x - w / 2, y - H, w * 0.75, H); g.fillStyle = L.c[0]; g.fillRect(x - w / 2, y - H, w, Math.min(H, w * 0.3 * sq + 2)); g.restore(); } },
  // a power-up aura (passives, level-ups): rings rising round a spot + particles spiralling up
  aura(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 40, sq = S.sq || 1, H = S.h || r * 1.8, a = fade(p, 0.1, 0.3), seed = S.seed || 71;
    withBlend(g, L, () => { glow(g, S.x, S.y - H * 0.35, r * 1.1, L.c[1], a * 0.55);
      for(let i = 0; i < 3; i++){ const k = (S.t * 0.75 + i / 3) % 1, y = S.y - k * H, R = r * (1 - k * 0.35); g.strokeStyle = hexA(i % 2 ? L.c[0] : L.c[1], a * (1 - k) * 0.95); g.lineWidth = Math.max(2, r * 0.07 * (1 - k * 0.5)); g.beginPath(); g.ellipse(S.x, y, R, R * Math.max(0.3, sq * 0.6), 0, 0, TAU); g.stroke(); }
      for(let i = 0; i < 12; i++){ const k = (rnd(seed, i) + S.t * 0.7) % 1, an = i / 12 * TAU + S.t * 3 + k * 4, R = r * (0.9 - k * 0.5); spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + Math.cos(an) * R, S.y - k * H + Math.sin(an) * R * 0.3, r * 0.26 * (1 - k * 0.4), an, a * Math.sin(Math.min(1, k * 1.3) * Math.PI)); }
      spr(g, 'spark', L.c[0], S.x, S.y - H * 0.45 - Math.sin(S.t * 3) * r * 0.08, r * 0.7 * (1 + Math.sin(S.t * 5) * 0.15), S.t, a); }); },
  // a quick flash under the caster when a skill starts
  cast(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 30;
    PAINTERS.summon(g, Object.assign({}, S, {r: r * (0.7 + p * 0.5)}), L);
    withBlend(g, L, () => { for(let i = 0; i < 8; i++){ const an = i / 8 * TAU + (S.seed || 0); spr(g, 'spark', L.c[0], S.x + Math.cos(an) * r * (0.4 + p), S.y + Math.sin(an) * r * (0.4 + p) * (S.sq || 1) - p * r * 0.8, r * 0.3, 0, 1 - p); } }); },
  // a small hit spark (any look)
  hit(g, S, L){ const p = clamp(S.p, 0, 1), r = S.r || 20, seed = S.seed || 67;
    withBlend(g, L, () => { glow(g, S.x, S.y, r * (0.7 + p * 0.6), L.c[0], 1 - p); spr(g, 'spark', L.c[0], S.x, S.y, r * (0.95 + p * 0.7), p * 2, 1 - p);
      for(let i = 0; i < 6; i++){ const an = rnd(seed, i) * TAU, d = r * (0.3 + easeOut(p) * 1.2); spr(g, L.parts[i % L.parts.length], partCol(L, i, seed), S.x + Math.cos(an) * d, S.y + Math.sin(an) * d, r * 0.45, an, 1 - p); } }); },
};
// every ENGINE shape → the painter that shows it
const SHAPE_PAINTER = {shot: 'shot', bounce: 'shot', cone: 'cone', splash: 'splash', chain: 'chain', beam: 'beam', storm: 'storm', tornado: 'tornado', swarm: 'swarm', meteor: 'meteor', whip: 'whip',
  tower: 'summon', minion: 'summon', flyer: 'summon', decoy: 'summon', gold: 'gold', haste: 'haste', trap: 'trap', shield: 'shield', heal: 'heal', reflect: 'shield', wall: 'wall', dome: 'dome',
  daze: 'daze', push: 'push', sleep: 'zone', slow: 'zone', fear: 'zone', charm: 'zone', confuse: 'zone', pull: 'pull', stat: 'aura', global: 'push'};
function painterOf(shape){ return PAINTERS[shape] || PAINTERS[SHAPE_PAINTER[shape]] || PAINTERS.hit; }
function fxDraw(g, S){ if(!g || !S) return; const L = lookOf(S.look), P = painterOf(S.shape);
  const ga = g.globalAlpha, gc = g.globalCompositeOperation, lw = g.lineWidth;
  try{ P(g, Object.assign({t: 0, p: 0.5, sq: 1}, S), L); } finally{ g.globalAlpha = ga; g.globalCompositeOperation = gc; g.lineWidth = lw; g.setLineDash && g.setLineDash([]); } }

/* ---------- 🎇 particles with state (hits, pops, wins) ---------- */
function fxBurst(list, x, y, look, o){ o = o || {}; const L = lookOf(look), n = o.n || 8, sp = o.speed || 120, sz = o.size || 14;
  for(let i = 0; i < n; i++){ const a = (o.up ? -Math.PI / 2 + (Math.random() - 0.5) * 2 : Math.random() * TAU), v = sp * (0.5 + Math.random() * 0.7);
    list.push({x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up ? sp * 0.3 : 0), rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 8, type: L.parts[i % L.parts.length], col: partCol(L, i, Math.random() * 99), size: sz * (0.7 + Math.random() * 0.6), life: 0, dur: (o.dur || 0.8) * (0.7 + Math.random() * 0.6), grav: L.grav * sp * 2.2, add: L.blend === 'add'}); }
  if(list.length > (o.max || 240)) list.splice(0, list.length - (o.max || 240)); return list; }
function fxTick(g, list, dt){ dt = Math.min(0.05, dt || 1 / 60); let w = 0; const gc = g.globalCompositeOperation;
  for(let i = 0; i < list.length; i++){ const P = list[i]; P.life += dt; if(P.life >= P.dur) continue; P.vx *= 1 - dt * 1.8; P.vy = P.vy * (1 - dt * 1.8) + P.grav * dt; P.x += P.vx * dt; P.y += P.vy * dt; P.rot += P.vr * dt; list[w++] = P;
    const k = P.life / P.dur; g.globalCompositeOperation = P.add ? 'lighter' : 'source-over'; spr(g, P.type, P.col, P.x, P.y, P.size * (1 - k * 0.35), P.rot, 1 - k * k); }
  list.length = w; g.globalCompositeOperation = gc; g.globalAlpha = 1; return list; }

/* ---------- 🔍 a looping mini demo of a skill (pick cards, help pages, galleries) ---------- */
function demoSpec(shape, W, H, p, t){ const pn = SHAPE_PAINTER[shape] || shape, gy = H * 0.8, cx = W / 2, R = Math.min(W, H) * 0.32;
  const base = {shape: pn, p, t, sq: 0.55, seed: 5};
  switch(pn){
    case 'shot': return Object.assign(base, {x: W * 0.12, y: gy - H * 0.2, x2: W * 0.86, y2: gy - H * 0.12, h: H * 0.3, size: H * 0.14});
    case 'swarm': return Object.assign(base, {x: W * 0.12, y: gy - H * 0.2, x2: W * 0.78, y2: gy - H * 0.05, r: W * 0.25, h: H * 0.35, n: 4, size: H * 0.1});
    case 'cone': return Object.assign(base, {x: W * 0.1, y: gy - H * 0.06, ang: -0.05, len: W * 0.8, w: 0.45, sq: 0.7});
    case 'chain': return Object.assign(base, {x: W * 0.08, y: gy - H * 0.35, pts: [{x: W * 0.38, y: gy - H * 0.1}, {x: W * 0.62, y: gy - H * 0.3}, {x: W * 0.9, y: gy - H * 0.08}]});
    case 'beam': return Object.assign(base, {x: W * 0.08, y: gy - H * 0.3, x2: W * 0.92, y2: gy - H * 0.2, w: H * 0.08});
    case 'whip': return Object.assign(base, {x: W * 0.1, y: gy - H * 0.4, x2: W * 0.88, y2: gy - H * 0.05, w: H * 0.08});
    case 'storm': return Object.assign(base, {x: cx, y: gy, r: R * 1.2, h: H * 0.6});
    case 'tornado': return Object.assign(base, {x: cx, y: gy, r: R * 0.8, h: H * 0.7});
    case 'meteor': return Object.assign(base, {x: cx + W * 0.05, y: gy, r: R * 0.9, h: H * 0.85});
    case 'daze': return Object.assign(base, {x: cx, y: gy, r: R * 0.9, h: H * 0.4});
    case 'dome': return Object.assign(base, {x: cx, y: gy, r: R * 1.4});
    case 'shield': return Object.assign(base, {x: cx, y: gy, r: R * 1.1, h: H * 0.6});
    case 'heal': return Object.assign(base, {x: cx, y: gy, r: R, h: H * 0.75});
    case 'aura': return Object.assign(base, {x: cx, y: gy, r: R * 1.05, h: H * 0.62});
    case 'wall': return Object.assign(base, {x: cx, y: gy, len: W * 0.7, h: H * 0.42, n: 5});
    case 'gold': return Object.assign(base, {x: cx, y: gy, r: R * 1.1});
    default: return Object.assign(base, {x: cx, y: gy - H * 0.05, r: R * 1.3});
  }
}
const STEADY = ['aura', 'zone', 'daze', 'shield', 'dome', 'tornado', 'storm', 'heal', 'haste', 'pull'];
function fxPreview(cv, x, t, o){ if(!cv) return; o = o || {}; const g = cv.getContext('2d'), W = cv.width, H = cv.height, e = x && (x.e || x), shape = o.shape || (e && e.shape) || 'hit', loop = o.loop || 1.6;
  const pn = SHAPE_PAINTER[shape] || shape, steady = STEADY.includes(pn);   // steady effects stay on (p = .5) and move with t; one-shots replay
  const p = o.p != null ? o.p : steady ? 0.5 : Math.min(1, (t % loop) / (loop * 0.85)); g.clearRect(0, 0, W, H);
  const L = lookOf(x && x.look ? x.look : e), gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, mixHex(L.c[2], '#1C1230', 0.72)); gr.addColorStop(0.62, mixHex(L.c[2], '#2A1E3A', 0.45)); gr.addColorStop(1, mixHex(L.c[1], '#2A1E3A', 0.35));
  g.fillStyle = gr; g.fillRect(0, 0, W, H); for(let i = 0; i < 9; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.25 * Math.sin(t * 2 + i)) + ')'; g.fillRect(rnd(9, i) * W, rnd(4, i) * H * 0.5, 1.5, 1.5); }
  g.fillStyle = hexA(L.c[1], 0.28); g.beginPath(); g.ellipse(W / 2, H * 0.84, W * 0.46, H * 0.12, 0, 0, TAU); g.fill();
  fxDraw(g, Object.assign(demoSpec(shape, W, H, p, t), {look: L})); }
const fx = {PAINTERS, SHAPE_PAINTER, draw: fxDraw, burst: fxBurst, tick: fxTick, preview: fxPreview, demoSpec, sprite, painterOf, hexA};

/* ---------- 🎨 UI helpers (strings — work in node too) ---------- */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
function barHtml(cols, opt){ opt = opt || {}; return '<span class="skk-bar" title="Your build">' + (cols || []).map(c => '<i class="' + (opt.big ? 'big' : '') + '" style="background:' + (COLORS[c] || {hex: '#999'}).hex + '"></i>').join('') + (opt.star ? '<i class="star' + (opt.big ? ' big' : '') + '"></i>' : '') + '</span>'; }
function tagOf(card){ const C = COLORS[card.col] || {}; if(card.type === 'evolve') return '⭐ EVOLVE'; if(card.type === 'ultimate') return '⭐ ULTIMATE'; if(card.type === 'combo') return '🤝 COMBO';
  if(card.type === 'up') return '⬆️ Lv ' + card.lv; if(card.kind === 'passive') return '✨ ' + C.en + ' passive'; return '🆕 ' + C.icon + ' ' + C.en; }
const LV_NAME = ['', 'Lv 1', 'Lv 2 ✦', 'Lv 3 ✦✦'];
function lookVars(L){ return '--l0:' + L.c[0] + ';--l1:' + L.c[1] + ';--l2:' + L.c[2] + ';'; }
function cardLook(card){ if(card.look) return lookOf(card.look); if(card.type === 'evolve' || card.type === 'ultimate') return LOOKS.star; if(card.type === 'combo') return LOOKS.love; return LOOKS[COL_LOOK[card.col]] || LOOKS.star; }
function cardHtml(card, i){
  const C = COLORS[card.col] || {hex: '#888'}, L = cardLook(card), special = card.type === 'evolve' || card.type === 'ultimate', lv = card.lv || 1;
  const lvOn = special || card.type === 'combo' ? '' : '<span class="lv">' + [1, 2, 3].map(n => '<i class="' + (n < lv ? 'on' : n === lv ? 'nw' : '') + '"></i>').join('') + '</span>';
  const shape = card.shape || (special ? 'summon' : card.type === 'combo' ? 'splash' : card.kind === 'passive' ? 'aura' : 'hit');
  return '<button type="button" class="skk-card lk ' + (card.glow ? 'glow ' : '') + (special ? card.type + ' big ' : '') + (card.type === 'combo' ? 'combo ' : '') + (card.kind === 'passive' ? 'passive ' : '') + 'lv' + lv + '" data-i="' + i + '" data-key="' + esc(card.key) + '" data-col="' + card.col + '" data-type="' + card.type + '" data-shape="' + esc(shape) + '" data-look="' + esc(L.key) + '" data-sound="pop" style="--c:' + C.hex + ';' + lookVars(L) + '">'
    + '<span class="tg">' + esc(tagOf(card)) + '</span>'
    + '<span class="art"><canvas class="pv" width="176" height="96" aria-hidden="true"></canvas><span class="ic">' + esc(card.icon) + '</span></span>'
    + '<span class="nm">' + esc(card.name) + '</span><span class="lkc">' + esc(L.icon + ' ' + L.name) + (card.kind === 'passive' ? ' · always on' : '') + '</span><span class="ds">' + esc(card.desc) + '</span>'
    + (card.type === 'combo' && card.cols ? '<span class="cr">' + card.cols.map(c => COLORS[c].dot).join(' + ') + '</span>' : '') + lvOn + '<span class="shine"></span></button>';
}
function buttonHtml(b, opt){ opt = opt || {}; const C = COLORS[b.col] || {hex: '#888'}, L = lookOf(b.e || b.look), lv = b.lv || 1;
  return '<button type="button" class="skk-btn lk ' + (b.ult ? 'ult ' : '') + (b.combo ? 'combo ' : '') + (opt.ready ? 'ready ' : '') + (opt.off ? 'off ' : '') + (b.ult || b.combo ? '' : 'lv' + lv) + '" data-key="' + esc(b.key) + '" data-col="' + b.col + '" data-look="' + esc(L.key) + '" data-sound="none" title="' + esc(b.e ? b.e.name + ' — ' + describe(b.key, b.lv, b.e.skin) : '') + '" style="--c:' + C.hex + ';--cd:' + (opt.cdFrac || 0) + ';' + lookVars(L) + '">'
    + '<span class="bi">' + esc(b.e ? b.e.icon : '•') + '</span>' + (b.ult || b.combo ? '' : '<span class="pp">' + '<i></i>'.repeat(lv) + '</span>') + (opt.ow ? '<span class="ow">' + esc(opt.ow) + '</span>' : '') + '</button>'; }
// a skill button was pressed: pop + a ring of look-coloured sparks (pure CSS, cleans itself up)
function castPop(el){ if(!el || typeof document === 'undefined') return; el.classList.remove('skk-pop'); void el.offsetWidth; el.classList.add('skk-pop');
  const r = document.createElement('span'); r.className = 'skk-ring'; el.appendChild(r); setTimeout(() => { r.remove(); el.classList.remove('skk-pop'); }, 520); }
// animates every card preview inside box while it is on the page
function animateCards(box){ if(typeof requestAnimationFrame === 'undefined') return; const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = Array.from(box.querySelectorAll('.skk-card')).map(el => ({el, cv: el.querySelector('canvas.pv'), shape: el.dataset.shape, look: el.dataset.look})).filter(x => x.cv);
  const t0 = performance.now(); const tick = () => { if(!box.isConnected) return; const t = (performance.now() - t0) / 1000;
    cards.forEach((x, i) => fxPreview(x.cv, {shape: x.shape, look: x.look}, t + i * 0.37, reduce ? {p: 0.5} : {})); if(!reduce) requestAnimationFrame(tick); };
  tick(); }
// builds the pick sheet INSIDE box (your play screen) — returns a Promise of the picked card
function pickSheet(box, offer, o){
  o = o || {}; const d = document.createElement('div'); d.className = 'skk-sheet' + (offer.kind === 'evolve' || offer.kind === 'ultimate' ? ' gold' : ''); d.setAttribute('role', 'dialog'); d.dataset.tier = offer.tier;
  d.innerHTML = '<span class="skk-rays" aria-hidden="true"></span><div class="skk-head"><div class="h1"><span class="rb">' + esc(o.title || ('Tier ' + offer.tier + ' — pick one!')) + '</span></div>' + (o.sub ? '<div class="h2">' + esc(o.sub) + '</div>' : '') + '</div>'
    + '<div class="skk-cards">' + offer.cards.map(cardHtml).join('') + '</div>';
  box.appendChild(d); animateCards(d);
  return new Promise(res => { d.querySelectorAll('.skk-card').forEach(b => b.onclick = () => { if(d.dataset.done) return; d.dataset.done = 1; const c = offer.cards[Number(b.dataset.i)];
    b.classList.add('picked'); d.querySelectorAll('.skk-card').forEach(x => { if(x !== b){ x.style.transition = 'opacity .25s, transform .25s'; x.style.opacity = '0'; x.style.transform = 'translateY(30px) scale(.8)'; } });
    setTimeout(() => { d.remove(); res(c); if(o.onPick) o.onPick(c); }, o.fast ? 0 : 420); }); });
}

const SkillKit = {COLORS, COLS, ENGINES, get, list, num, describe, pack, tree, load, barHtml, cardHtml, buttonHtml, pickSheet, tagOf, MAX_LV, TIERS, EVOLVE_AT, ULT_AT, COMBO_FROM,
  LOOKS, lookOf, addLook, fx, castPop, animateCards, version: 'sk-2'};
root.SkillKit = SkillKit;
if(typeof module !== 'undefined' && module.exports) module.exports = SkillKit;
})(typeof window !== 'undefined' ? window : globalThis);
// SKILLKIT END
