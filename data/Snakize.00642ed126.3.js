
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'snakeast';   // the Games-tab row / Gameroom card; each mode saves to its own board (MODE_IDS)
// 🎛️ p1c: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 🐍 Snakize · level | numbers | game buttons ⏸ ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🐍', name: 'Snakize', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { pauseGame(); }, resume: () => { if(G && G.paused && !G.over) togglePause(); }},
  onFit: () => { $('scr-play').style.setProperty('--gbh', BAR.el.offsetHeight + 'px'); if(G && typeof layout === 'function') layout(); },
  scoreMin: '4ch',
  extras: [{id: 'hud-skill', icon: '⚡', label: 'Use skill (Space)', onClick: () => useSkillSeat(0), keep: true},
    {id: 'pause-btn', html: '<span class="gb-pzi" aria-hidden="true"><i></i><i></i></span>', label: 'Pause (P)', onClick: () => togglePause(), keep: true},
    {id: 'mus-btn', icon: '🎵', label: 'Music', onClick: () => toggleMusic()}]});
var NAV_INNER = {setup: ['◀ Snakize', () => showScreen('menu')], tale: ['◀ All chapters', () => { renderMenu(); showScreen('menu'); }]};   // 🧭 inner screens: their top button goes to the main screen
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
let FX = 1;   // harness sets 0 (no big words / confetti)
function say(text){ try{ if(!UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.pitch = 1.15; speechSynthesis.speak(u); }catch(e){} }
function pickOne(a){ return a[Math.floor(Math.random() * a.length)]; }
function fmtS(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function setTxt(el, v){ if(el && el.__t !== v){ el.__t = v; el.textContent = v; } }
function isTouch(){ return ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0; }
const lerpN = (a, b, f) => a + (b - a) * f;

/* ================= DATA ================= */
const MODES = {
  feast:  {id: 'snakeast',  icon: '🍎', name: 'Snakeast',  tag: 'snake + feast',    sub: 'Eat, grow, reach the length!'},
  gate:   {id: 'snakigate', icon: '🧭', name: 'Snakigate', tag: 'snake + navigate', sub: 'Steer anywhere — be the longest!'},
  castle: {id: 'snakastle', icon: '🏰', name: 'Snakastle', tag: 'snake + castle',   sub: 'Loop back home to grab land!'},
  tale:   {id: 'snaketale', icon: '📜', name: 'Snaketale', tag: 'snake + tale',     sub: 'Story quests from your family'}
};
const MODE_KEYS = Object.keys(MODES);
const BUILT_MODES = ['feast', 'gate', 'castle', 'tale'];   // modes switched on in this build (rounds)
/* 🗂️ MODE GROUPS (mg-1) */
window.MODE_TYPE = {feast: 'A classic snake game', endless: 'A snake high-score game', gate: 'A free-steering snake game', castle: 'A land-grab snake game', tale: 'A snake story quest'};   /* 🗂️ p3a: the "what kind of game" line on each mode card (mc-1) */
const MODE_GROUPS = [
  {k: 'arcade', icon: '🐍', en: 'Arcade', th: 'อาร์เคด', c: '#22A863'},
  {k: 'land', icon: '🏰', en: 'Land battle', th: 'ยึดพื้นที่', c: '#E07B12'},
  {k: 'story', icon: '📜', en: 'Story', th: 'เนื้อเรื่อง', c: '#8E5CF7'}
];   // 🗂️ mg-1 mode groups (header icon + English + Thai), fixed order
const MODE_LIST = [   // 🗂️ start page buttons by group (mg-1) — the game still uses MODES[k] for play
  {k: 'feast', g: 'arcade', icon: '🍎', name: 'Snakeast', sub: 'Eat, grow, reach the length', next: '👇 then pick a level'},
  {k: 'endless', g: 'arcade', icon: '♾️', name: 'Endless', sub: 'No target — beat your best', next: '👇 then pick a level (Junior +)'},
  {k: 'gate', g: 'arcade', icon: '🧭', name: 'Snakigate', sub: 'Steer anywhere — be the longest', next: '👇 then pick a level'},
  {k: 'castle', g: 'land', icon: '🏰', name: 'Snakastle', sub: 'Loop back home to grab land', next: '👇 then pick a level'},
  {k: 'tale', g: 'story', icon: '📜', name: 'Snaketale', sub: 'Story quests from your family', next: '👇 then pick a chapter'}
];
function mgOn(k){ return k === 'endless' ? (SET.mode === 'feast' && !!SET.endless) : (SET.mode === k && !(k === 'feast' && SET.endless)); }
function mgRender(){
  UI.modeGroups($('mode-list'), MODE_GROUPS, MODE_LIST.map(m => Object.assign({}, m, {on: mgOn(m.k), id: 'mode-' + m.k, soon: m.k !== 'endless' && BUILT_MODES.indexOf(m.k) < 0})), {
    next: () => $('level-head'),
    onPick: k => {
      if(k !== 'endless' && BUILT_MODES.indexOf(k) < 0){ UISound.play('error'); UI.toast(MODES[k].icon + ' ' + MODES[k].name + ' is coming soon!'); return 'stop'; }
      if(k === 'endless'){ SET.mode = 'feast'; SET.endless = true; } else { SET.mode = k; if(k === 'feast') SET.endless = false; }
      savePrefs(); renderMenu(); return false;
    }});
}
/* 🗂️ END MODE GROUPS */
const LV_ICON = ['🌱', '🐣', '🔦', '⚡', '🌋', '💀'];
const LEVEL_UI = {
  feast: [
    'Wrap-around edges, a ghost path shows where you go. 3 lives.',
    'Wrap-around edges, golden fruit = +3. 3 lives.',
    'A few rocks. Faster every 5 food. ⭐ power fruits!',
    'Fast! Moving hazards and bad fruit. 2 lives.',
    'Maze walls + 🌀 portals, food runs away! 1 life.',
    'Falling rocks, keeps getting faster, 1 food. 1 life, ×3 score.'],
  gate: [
    'Small arena, 3 sleepy snakes. You bounce off — no popping!',
    '4 snakes that wander. Soft edges.',
    '6 snakes go for food. The edge pops you!',
    '8 snakes cut in front of you and boost.',
    '10 snakes circle and team up on the leader.',
    '12 snakes, the edge shrinks — last snake wins. ×3 score.'],
  castle: [
    'Grab 30 % of the map. 1 slow robot — only YOU can cut your own trail.',
    'Grab 40 %. 2 snakes that sometimes cut trails.',
    'Grab 45 %. 3 snakes that chase your trail!',
    'Grab 50 %. 4 snakes — their loops can steal your land!',
    '⏱️ 3 minutes — most land wins. 🔥 Fire burns trails!',
    '⏱️ 3 minutes, 1 life, your trail can only be as long as you. ×3 score.']
};
const AGE_START = {'4-5': 0, '6-7': 0, '8-9': 1, '10+': 2};
const THEMES = {
  dino:  {name: 'Dino Jungle',  icon: '🦖', bg: ['#A6D873', '#97CC63'], out: '#2F5A22', line: 'rgba(60,100,30,0.18)', wall: '#7A5236', wallHi: '#A0714C', body: '#3FA34D', pat: 'leaf',    acc: '#D4F27A', food: ['🍎', '🍌', '🍇'], gold: '🥚', bad: '🦠', rock: '🪨', mover: '🔥', portal: '🌋', decor: ['🌿', '🌴', '🦕', '🍃', '🌺'], fall: '🪨', hazard: 'lava', notes: [0, 3, 5, 7, 10], root: 196, bpm: 108},
  sea:   {name: 'Aquarium',     icon: '🐙', bg: ['#62C9E6', '#53BCDB'], out: '#0D4E6B', line: 'rgba(255,255,255,0.16)', wall: '#E8869F', wallHi: '#F6B3C4', body: '#21B3A6', pat: 'scale', acc: '#B2F7EF', food: ['🐟', '🐠', '🦐'], gold: '🦪', bad: '🦠', rock: '🪸', mover: '🪼', portal: '🌀', decor: ['🐚', '🫧', '🐡', '🪸', '🦀'], fall: '⚓', hazard: 'current', notes: [0, 2, 4, 7, 9], root: 220, bpm: 96},
  dance: {name: 'Dance Hall',   icon: '🪩', bg: ['#3B1D60', '#2F1752'], out: '#12062A', line: 'rgba(255,255,255,0.08)', wall: '#6B3FC9', wallHi: '#9A75F0', body: '#FF4FA3', pat: 'stripe', acc: '#FFE066', food: ['🎵', '🎶', '🎼'], gold: '📀', bad: '🦠', rock: '🔊', mover: '🔦', portal: '🪩', decor: ['✨', '🕺', '💃', '🎤'], fall: '🔊', hazard: 'spot', tiles: true, notes: [0, 4, 7, 9, 12], root: 262, bpm: 124},
  robot: {name: 'Robot Time',   icon: '🤖', bg: ['#1E5A3A', '#1A4F33'], out: '#0B241A', line: 'rgba(124,255,178,0.22)', wall: '#56707E', wallHi: '#8AA4B2', body: '#B7C3CC', pat: 'circuit', acc: '#00E5FF', food: ['⚙️', '🔩', '🔧'], gold: '🔋', bad: '🦠', rock: '🧱', mover: '⚡', portal: '🌀', decor: ['🕰️', '💡', '⏳', '🔌'], fall: '🧱', hazard: 'laser', circuit: true, notes: [0, 2, 3, 7, 8], root: 147, bpm: 118},
  space: {name: 'Space',        icon: '🪐', bg: ['#171D45', '#121839'], out: '#05071A', line: 'rgba(255,255,255,0.06)', wall: '#4D5290', wallHi: '#7479B8', body: '#8C5BFF', pat: 'star', acc: '#FFE36E', food: ['✨', '⭐', '💫'], gold: '🪐', bad: '🦠', rock: '🌑', mover: '☄️', portal: '🕳️', decor: ['⭐', '🌟', '🛸', '🌍', '·'], fall: '☄️', hazard: 'asteroid', stars: true, notes: [0, 2, 7, 9, 14], root: 174, bpm: 92},
  sky:   {name: 'Sky Temple',   icon: '☁️', bg: ['#A8DBFF', '#95D0FA'], out: '#4C8FC9', line: 'rgba(255,255,255,0.3)', wall: '#F4F1E8', wallHi: '#FFFFFF', body: '#7FC4FF', pat: 'puff', acc: '#FFFFFF', food: ['🌈', '🍒', '🫐'], gold: '🍏', bad: '🦠', rock: '🏛️', mover: '⚡', portal: '🌀', decor: ['☁️', '🕊️', '🏛️', '🌤️'], fall: '⚡', hazard: 'bolt', goldRing: true, notes: [0, 4, 5, 7, 11], root: 247, bpm: 100}
};
const THEME_KEYS = Object.keys(THEMES);
const SEAT_COL = ['#FF5A4E', '#3D8BFD', '#FFB300', '#9C5CFF'];
const BOT_COL = ['#FF8A65', '#4DD0E1', '#AED581', '#F06292', '#FFD54F', '#9575CD', '#4DB6AC', '#E57373', '#81C784', '#64B5F6', '#BA68C8', '#FFB74D'];
const COL_HEX = {red: '#FF4D4D', blue: '#3D8BFD', gold: '#FFC845'};
const ACTIONS = [['up', '⬆️ Up'], ['down', '⬇️ Down'], ['left', '⬅️ Left'], ['right', '➡️ Right'], ['skill', '⚡ Skill'], ['boost', '💨 Boost (Snakigate)']];
const DEFAULT_KEYS = [
  {up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', skill: 'KeyQ', boost: 'KeyE'},
  {up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', skill: 'Enter', boost: 'ShiftRight'},
  {up: 'KeyI', down: 'KeyK', left: 'KeyJ', right: 'KeyL', skill: 'KeyU', boost: 'KeyO'},
  {up: 'Numpad8', down: 'Numpad5', left: 'Numpad4', right: 'Numpad6', skill: 'Numpad7', boost: 'Numpad9'}
];
// avatar moves while riding (pose objects / gesture objects for drawAvatar)
const RIDE_POSE = {legL: 0.75, legR: -0.75, armL: 0.95, armR: 1.05};
const SKILL_POSE = {
  dash:   {k: 'sk-dash', d: 1.2, f: (p, t) => ({armR: 3.0, armL: 0.2, legL: 0.9, legR: -0.4, rot: 0.32, mouth: 'open', fx: '💨'})},
  shield: {k: 'sk-shield', d: 1.2, f: (p, t) => ({armL: 2.9, armR: 2.9, legL: 0.75, legR: -0.75, mouth: 'open', fx: '🛡️'})},
  ghost:  {k: 'sk-ghost', d: 1.6, f: (p, t) => ({dy: -4 - Math.sin(t * 9) * 2, armL: 1.4, armR: 1.4, legL: 0.2, legR: -0.2, eyes: 'closed', fx: '👻'})},
  magnet: {k: 'sk-magnet', d: 1.4, f: (p, t) => ({armR: 1.65, armL: 0.4, legL: 0.75, legR: -0.75, fx: '🧲'})},
  slow:   {k: 'sk-slow', d: 1.4, f: (p, t) => ({armL: 2.5, armR: 2.5 + Math.sin(t * 3) * 0.2, legL: 0.75, legR: -0.75, fx: '⏳'})},
  drop:   {k: 'sk-drop', d: 1.0, f: (p, t) => ({legR: -1.4 * Math.sin(p * Math.PI), armL: 1.2, armR: 0.6, fx: '✂️'})}
};
const PLANT = {k: 'plant', d: 1.3, f: (p, t) => ({dy: -Math.sin(Math.min(1, p * 2) * Math.PI) * 26, armR: p > 0.45 ? 2.9 - (p - 0.45) * 2 : 2.2, armL: 0.6, legL: 0.5, legR: -0.5, mouth: 'open', fx: '🚩'})};
const FACEPALM = {k: 'facepalm', n: 'Facepalm', d: 1.6, f: (p, t) => ({armR: 2.75, armL: 0.3, eyes: 'closed', rot: 0.06 + Math.sin(t * 3) * 0.03, dy: 2, fx: '🤦'})};
const gestK = k => GESTURES.find(g => g.k === k) || GESTURES[0];

/* ================= STATE ================= */
let S = {players: [], progress: {}, progGate: {}, progCastle: {}, endless: {}, settings: {}, avatars: {}, player: '', age: ''};
let SET = {mode: 'feast', level: 0, theme: 'dino', play: 'solo', opp: '', opps: [], endless: false, skill: 'dash', sizes: {}};
/* 🗺️ MAP SIZE × 🎚️ DIFFICULTY (p3e — Aowu 2026-11-13: pick the map size, then the difficulty) */
const MAP_SIZES = {
  feast:  [{k: 's', v: 12}, {k: 'm', v: 16}, {k: 'l', v: 20}, {k: 'xl', v: 24}],   // grid n × n
  gate:   [{k: 's', v: 17}, {k: 'm', v: 24}, {k: 'l', v: 31}, {k: 'xl', v: 36}],   // arena radius
  castle: [{k: 's', v: 22}, {k: 'm', v: 28}, {k: 'l', v: 34}, {k: 'xl', v: 40}]    // land n × n
};
const SIZE_LOOK = [{icon: '🟩', name: 'Small', x: 1}, {icon: '🟨', name: 'Medium', x: 1.25}, {icon: '🟧', name: 'Large', x: 1.5}, {icon: '🟥', name: 'Huge', x: 2}];
function sizeKey(mode){ const k = (SET.sizes || {})[mode || SET.mode]; return (MAP_SIZES[mode || SET.mode] || []).some(z => z.k === k) ? k : 'auto'; }
function levelValue(mode, i){ return mode === 'gate' ? SN.GATE[i].R : mode === 'castle' ? SN.CASTLE[i].n : SN.FEAST[i].n; }
function sizeLabel(mode, v){ return mode === 'gate' ? 'arena ' + v : v + '×' + v; }
// the picked size for this mode + level: {v, mult, std, n | mods}
function sizeFor(mode, i){ const o = sizeFor0(mode, i), SH = mode === 'feast' && typeof curShape === 'function' ? curShape() : null;   // 🧩 24n: + the map shape
  if(SH && SH.hard){ o.mult = +(o.mult * SHAPE_MULT[SH.hard]).toFixed(2); o.engine = Object.assign({}, o.engine || {}, {shape: SH.k}); o.label = (o.label || sizeLabel(mode, o.v)) + ' · ' + SH.icon + ' ' + SH.name; o.shape = SH; }
  return o; }
function sizeFor0(mode, i){
  const list = MAP_SIZES[mode]; if(!list) return {std: true, mult: 1, v: 0};
  const lv = levelValue(mode, i), z = list.find(x => x.k === sizeKey(mode));
  const idx = z ? list.indexOf(z) : Math.max(0, list.findIndex(x => x.v >= lv)), v = z ? z.v : lv, out = {v, mult: SIZE_LOOK[idx < 0 ? 3 : idx].x, std: !z || z.v === lv, label: sizeLabel(mode, v)};
  if(out.std) return out;
  if(mode === 'gate'){ out.engine = {mods: {R: v}}; return out; }
  out.engine = {n: v};
  if(mode === 'feast'){ const L = SN.FEAST[i], a = Math.min(1, (v * v) / (L.n * L.n)), sc = x => x ? Math.max(1, Math.round(x * a)) : 0;
    out.engine.mods = {target: v < L.n ? Math.max(8, Math.round(L.target * v / L.n)) : L.target, rocks: sc(L.rocks), movers: sc(L.movers), portals: L.portals ? Math.max(1, Math.round(L.portals * a)) : 0}; out.target = out.engine.mods.target; }
  return out;
}
function renderSizes(){
  const wrap = $('map-wrap'), box = $('map-list'); if(!box) return;
  const list = MAP_SIZES[SET.mode]; if(wrap) wrap.classList.toggle('hidden', !list); if(!list) return;
  const cur = sizeKey(), unit = SET.mode === 'gate' ? 'radius ' : '';
  box.innerHTML = [{k: 'auto', icon: '🎚️', name: 'Level size', sub: 'grows with the level', x: '×1 → ×2'}].concat(list.map((z, i) => ({k: z.k, icon: SIZE_LOOK[i].icon, name: SIZE_LOOK[i].name, sub: SET.mode === 'gate' ? 'arena ' + z.v : z.v + ' × ' + z.v, x: '×' + SIZE_LOOK[i].x})))
    .map(z => '<button class="mapc' + (z.k === cur ? ' on' : '') + '" data-k="' + z.k + '" data-sound="tap"><div class="ic">' + z.icon + '</div><div class="nm">' + z.name + '</div><div class="sub">' + z.sub + '</div><div class="x">' + z.x + '</div></button>').join('');
  box.querySelectorAll('.mapc').forEach(b => b.onclick = () => { SET.sizes = Object.assign({}, SET.sizes, {[SET.mode]: b.dataset.k}); savePrefs(); renderLevels(); });
  if(typeof renderShapes === 'function') renderShapes();   // 🧩 24n
}
/* 🗺️ END MAP SIZE */
/* 🧩 24n MAP SHAPES (page): 🍎 Snakeast map shape + its own ⭐ hardness, measured on the 12 / 16 / 21 maps: room left (1 − cells) + 2 × detour
   (shortest path ÷ straight line) → ★ < 0.37 · ★★ 0.37–0.45 · ★★★ ≥ 0.45 → points ×1.25 / ×1.5 / ×2, on top of the map-size ×. Off: window.SN_SHAPES = false. */
const SHAPES = [
  {k: 'square', icon: '⬛', name: 'Classic', hard: 0},
  {k: 'plus', icon: '➕', name: 'Cross', hard: 1}, {k: 'diamond', icon: '💎', name: 'Diamond', hard: 1},
  {k: 'donut', icon: '🍩', name: 'Donut', hard: 2}, {k: 'rooms', icon: '🚪', name: 'Four rooms', hard: 2}, {k: 'heart', icon: '💗', name: 'Heart', hard: 2}, {k: 'hourglass', icon: '⏳', name: 'Hourglass', hard: 2}, {k: 'island', icon: '🏝️', name: 'Island', hard: 2},
  {k: 'arrow', icon: '⬆️', name: 'Arrow', hard: 3}];
const SHAPE_MULT = [1, 1.25, 1.5, 2];
function shapeOf(k){ return SHAPES.find(x => x.k === k) || SHAPES[0]; }
function curShape(){ return window.SN_SHAPES === false ? SHAPES[0] : shapeOf(SET.shape); }
function renderShapes(){
  const wrap = $('shape-wrap'), box = $('shape-list'); if(!box) return; const on = SET.mode === 'feast' && window.SN_SHAPES !== false; if(wrap) wrap.classList.toggle('hidden', !on); if(!on) return;
  const cur = curShape().k;
  box.innerHTML = SHAPES.map(z => '<button class="mapc shp' + (z.k === cur ? ' on' : '') + '" data-k="' + z.k + '" data-sound="tap"><div class="ic">' + z.icon + '</div><div class="nm">' + z.name + '</div><div class="sub">' + (z.hard ? '⭐'.repeat(z.hard) : 'full map') + '</div><div class="x">' + (z.hard ? '×' + SHAPE_MULT[z.hard] : '×1') + '</div></button>').join('');
  box.querySelectorAll('.mapc').forEach(b => b.onclick = () => { SET.shape = b.dataset.k; savePrefs(); renderLevels(); });
}
// pixel fall-off round the shape (on the cached field picture)
function paintVoid(g, M, T, n, cell){
  if(!M.voidM) return; const inside = (x, y) => x >= 0 && y >= 0 && x < n && y < n && !M.voidM[y * n + x];
  g.fillStyle = T.out; for(let i = 0; i < n * n; i++) if(M.voidM[i]) g.fillRect((i % n) * cell, ((i / n) | 0) * cell, cell + 0.5, cell + 0.5);
  const R = SN.rng(n * 31 + 7), k = Math.max(2, cell / 4);
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){ if(inside(x, y)) continue; let near = 0; for(let j = -1; j <= 1; j++) for(let i = -1; i <= 1; i++) if(inside(x + i, y + j)) near++;
    if(!near) continue; for(let q = 0; q < 16; q++){ if(R() < 0.45 * near / 4){ g.fillStyle = q % 3 ? T.bg[0] : T.bg[1]; g.globalAlpha = 0.35 + R() * 0.5; g.fillRect(x * cell + (q % 4) * k, y * cell + (q >> 2) * k, k, k); } } }
  g.globalAlpha = 1;
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){ if(!inside(x, y)) continue; g.fillStyle = T.out;   // chipped pixel corners on the edge cells
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([i, j]) => { if(inside(x + i, y + j) || R() > 0.55) return; const px = i < 0 ? 0 : i > 0 ? 3 : Math.floor(R() * 4), py = j < 0 ? 0 : j > 0 ? 3 : Math.floor(R() * 4); g.fillRect(x * cell + px * k, y * cell + py * k, k, k); }); }
}

let G = null, lockHandle = null, KEYS = null, raf = 0;
function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function store(k){ return 'sp_snake_' + k + ':' + (S.player || ''); }
function loadPrefs(){ try{ const p = JSON.parse(ls(store('prefs')) || '{}'); if(typeof p.shape === 'string') SET.shape = p.shape;   /* 🧩 24n */ if(THEMES[p.theme]) SET.theme = p.theme; if(MODES[p.mode] && BUILT_MODES.indexOf(p.mode) >= 0) SET.mode = p.mode; if(['solo', 'duo', 'party'].indexOf(p.play) >= 0) SET.play = p.play; if(p.opp) SET.opp = p.opp; if(Array.isArray(p.opps)) SET.opps = p.opps; if(SN.SKILLS[p.skill]) SET.skill = p.skill; SET.endless = !!p.endless; if(p.sizes && typeof p.sizes === 'object') SET.sizes = p.sizes; }catch(e){} }
function savePrefs(){ ls(store('prefs'), JSON.stringify({theme: SET.theme, mode: SET.mode, play: SET.play, opp: SET.opp, opps: SET.opps, skill: SET.skill, endless: SET.endless, sizes: SET.sizes, shape: SET.shape})); }
function myAvatar(name){ const a = S.avatars[name]; return a ? fixAv(a) : defaultAvatar(name || 'player'); }
// riders keep their look, hats and costumes — but not their own ride-on or pet (the snake is the ride today)
function riderAv(av){ const a = JSON.parse(JSON.stringify(av)); a.eq = Object.assign({}, a.eq || {}); delete a.eq.ride; delete a.eq.pet; return fixAv(a); }
function roboAv(n){ const a = defaultAvatar('Robo-snake ' + n); a.hair = 0; a.hl = 0; a.outfit = 0; a.outfitColor = 9; a.oc2 = 0; a.acc = 0; a.eq = {}; return fixAv(a); }

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'setup', 'play', 'tale'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER);   /* 🧭 p1c */ window.scrollTo(0, 0);
}
function progOf(mode, name){ const src = mode === 'gate' ? S.progGate : mode === 'castle' ? S.progCastle : S.progress; return src[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(mode, i){ const p = progOf(mode, S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
function renderPlayers(){
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div class="empty">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c);
    b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age ? p.Age + ' yrs' : '') + '</div>');
    drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1});
    b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  loadPrefs(); KEYS = loadKeys(); { const dk = ls(store('tale_diff')); if(TALE_DIFF[dk]) taleOf(name).diff = dk; } $('who-name').textContent = name; renderMenu(); showScreen('menu'); if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); }   /* 📣 cs-2b */ if(window.Comic && $('comic-chip')) Comic.chip($('comic-chip'), name);   /* 💥 ck-2c */
  if(UI.guideOnce) UI.guideOnce('snakize:' + name, [
    {icon: '🐍', title: 'Welcome to Snakize!', text: 'Your avatar rides the snake. Eat food to grow — don\'t bump into walls or yourself.'},
    {icon: '🍎', title: '4 ways to play', text: '🍎 Snakeast = classic grid snake · 🧭 Snakigate = steer anywhere · 🏰 Snakastle = grab land · 📜 Snaketale = story quests.'},
    {icon: '⌨️', title: 'Controls', text: 'Arrows or W A S D to turn, Space = skill, P = pause. On a tablet: swipe or use the round pad.'}]);
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No win yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span><span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
function renderMenu(){
  const ml = $('mode-list');
  mgRender();   // 🗂️ mg-1: modes in groups (MODE_GROUPS + MODE_LIST)
  if(SET.mode === 'tale'){ const mw = $('map-wrap'); if(mw) mw.classList.add('hidden'); renderTale(); howTo(); return; }
  renderLevels(); renderMenuRow(); howTo();
  if(window.UI && UI.leaders && MODES[SET.mode].id !== 'snaketale') UI.leaders($('leaders'), MODES[SET.mode].id, S.player);
}
function levelInfo(mode, i){
  const z = sizeFor(mode, i), x = ' · ×' + z.mult;   /* 🗺️ p3e: the picked size */
  if(mode === 'feast'){ const L = SN.FEAST[i]; return z.v + '×' + z.v + ' · reach ' + (z.target || L.target) + x; }
  if(mode === 'gate'){ const L = SN.GATE[i]; return L.bots + ' snakes · ' + (L.time ? (L.time / 60) + ' min' : 'last one wins') + ' · arena ' + z.v + x; }
  if(mode === 'castle'){ const L = SN.CASTLE[i]; return z.v + '×' + z.v + ' · ' + (L.win ? L.win + ' % land' : '⏱️ most land') + x; }
  return '';
}
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; const p = progOf(SET.mode, S.player), rec = AGE_START[S.age];
  renderSizes();   /* 🗺️ p3e */
  $('level-head').textContent = (MAP_SIZES[SET.mode] ? '🎚️ 2. ' : '') + MODES[SET.mode].icon + ' ' + MODES[SET.mode].name + ' — pick a difficulty';
  SN.LEVEL_NAMES.forEach((nm, i) => {
    const open = canPlay(SET.mode, i), done = p.unlocked > i, hc = i === 5, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (hc ? ' hardcore' : ''); b.dataset.lvl = i; b.setAttribute('data-sound', open ? 'pop' : 'none');
    const eb = SET.mode === 'feast' && S.endless[S.player] && S.endless[S.player][i] ? '<div class="best"><span>♾️ ' + Number(S.endless[S.player][i]).toLocaleString() + '</span></div>' : '';
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + LV_ICON[i] + '</div><div class="nm">' + nm + '</div><div class="learn">' + levelInfo(SET.mode, i) + '</div><div class="sub">' + (hc && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : (LEVEL_UI[SET.mode] || [])[i] || '') + '</div>' + bestHtml(p, i) + eb;
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : 'Win the level before to unlock it'); return; } if(SET.endless && SET.mode === 'feast' && i === 0){ UI.toast('♾️ Endless starts at Junior'); } openSetup(i); };
    box.appendChild(b);
  });
}
function renderMenuRow(){
  const row = $('menu-row'); row.innerHTML = '';
  if(SET.mode === 'feast'){
    const b = document.createElement('button'); b.className = 'chip' + (SET.endless ? ' on' : ''); b.id = 'endless-btn'; b.setAttribute('data-sound', 'tap');
    b.textContent = '♾️ Endless (no target — beat your best score, Junior and up)';
    b.onclick = () => { SET.endless = !SET.endless; savePrefs(); b.classList.toggle('on', SET.endless); renderLevels(); mgRender(); };
    row.appendChild(b);
  }
}
function howTo(){
  const K = KEYS || DEFAULT_KEYS, kk = c => '<span class="kk">' + UI.esc(keyName(c)) + '</span>';
  const common = '<li>🧑 Your avatar rides the snake head. ⚡ <b>Skills</b>: pick a 🎒 start skill, get a ⏱️ gift skill every half minute, or finish a 🗺️ side quest to pick one. ' + kk('Space') + ' / skill button uses it.</li>' +
    '<li>⌨️ Arrows or ' + kk(K[0].up) + kk(K[0].left) + kk(K[0].down) + kk(K[0].right) + ' · ' + kk('KeyP') + ' pause. 👥 2 players: left ' + kk(K[0].up) + kk(K[0].left) + kk(K[0].down) + kk(K[0].right) + ' + ' + kk(K[0].skill) + ' · right arrows + ' + kk(K[1].skill) + '.</li>';
  const body = {
    feast: '<ul><li>🍎 Eat food to grow. Reach the <b>target length</b> to win!</li><li>Don\'t bump walls, rocks or your own tail. You can\'t turn straight back.</li><li>🌱 Basic + 🐣 Junior: the edges wrap around — leave on one side, come back on the other.</li><li>✨ Golden food = +3. 🦠 bad fruit shrinks you. ⭐🍄🌶️❄️🌈💣 power fruits from Intermediate.</li>' + common + '</ul>',
    castle: '<ul><li>🏰 You start on a little home land. Leave it and you draw a <b>trail</b>. Come back home = the whole loop becomes <b>your land</b> — 🚩 your rider plants a flag!</li><li>✂️ If someone runs over your trail while you are out, you go back home (on 🌱 Basic only YOU can cut your own trail). Run over THEIR trail to send them home!</li><li>🍎 Eat to grow — a longer snake can draw a longer trail. Too long a trail = back home.</li><li>Basic → Hard: reach the land % to win. Extreme + Hardcore: ⏱️ 3 minutes, the biggest land wins (⭐⭐⭐ with 60 %).</li>' + common + '</ul>',
    gate: '<ul><li>🧭 Steer anywhere. Eat the glowing dots to grow.</li><li>💨 Hold boost (' + kk(K[0].boost) + ' / ' + kk(K[1].boost) + ' / the 💨 button) to go fast — it costs length.</li><li>A snake that bumps into another snake\'s body <b>pops</b> and turns into food. Be the <b>longest</b> when the time is up!</li>' + common + '</ul>'
  }[SET.mode] || '';
  $('how-body').innerHTML = body;
}

/* ================= SETUP ================= */
function openSetup(lvl){
  SET.level = lvl; const hc = lvl === 5, m = MODES[SET.mode];
  if(hc) SET.play = 'solo';
  $('setup-logo').textContent = m.icon; $('setup-title').textContent = m.name + ' · ' + SN.LEVEL_NAMES[lvl];
  $('setup-sub').textContent = SET.mode === 'castle' ? (SN.CASTLE[lvl].win ? 'Own ' + SN.CASTLE[lvl].win + ' % of the map to win' : '⏱️ 3 minutes — the biggest land wins') : SET.mode === 'feast' ? (SET.endless && lvl > 0 ? '♾️ Endless — no target, beat your best score' : 'Grow to ' + (sizeFor('feast', lvl).target || SN.FEAST[lvl].target) + ' long to win') : SET.mode === 'gate' ? (SN.GATE[lvl].time ? 'Be the longest snake after ' + (SN.GATE[lvl].time / 60) + ' minutes' : 'The edge shrinks — be the last snake left') : '';
  buildPlayModes(); buildSeats(); buildSkills(); buildThemes(); buildSkin(); feelChip();
  $('go-btn').onclick = () => startGame();
  showScreen('setup');
}
function buildPlayModes(){
  const hc = SET.level === 5, row = $('mode-row');
  const modes = [['solo', SET.mode === 'gate' || SET.mode === 'castle' ? '🙋 Me vs the snakes' : '🙋 Just me'], ['duo', '👥 2 players (one keyboard)'], ['party', '👨‍👩‍👧 3–4 players (controllers / tablet)']];
  row.innerHTML = modes.map(([k, n]) => '<button class="chip' + (SET.play === k ? ' on' : '') + (hc && k !== 'solo' ? ' lock' : '') + '" data-k="' + k + '" data-sound="tap">' + n + '</button>').join('');
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { if(hc && b.dataset.k !== 'solo'){ UISound.play('error'); UI.toast('💀 Hardcore is a solo run'); return; } SET.play = b.dataset.k; savePrefs(); row.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); buildSeats(); });
}
function others(){ return S.players.map(p => p.Name).filter(n => n !== S.player); }
function keyHint(seat){ const K = KEYS[seat]; return [K.up, K.left, K.down, K.right].map(keyName).join(' ') + ' · ⚡ ' + keyName(K.skill); }
function seatHtml(name, label, idx, kb){
  return '<div class="seat p' + (idx + 1) + '"><canvas width="96" height="112" data-av="' + UI.esc(name || '') + '"></canvas><div class="nm">' + UI.esc(name) + '<small>' + label + '</small></div>' + (kb ? '<span class="kb">⌨️ ' + kb + '</span>' : '') + '</div>';
}
function buildSeats(){
  const box = $('seat-box'), list = others();
  if(SET.play === 'solo'){
    box.innerHTML = '<div class="seats">' + seatHtml(S.player, 'You', 0, 'arrows or ' + keyHint(0)) + '</div>' +
      (SET.mode === 'gate' || SET.mode === 'castle' ? '<div class="note" style="margin-top:8px">🐍 The other snakes are ridden by your family (random each game) — 🤖 robo-snakes fill in.</div>' : '') +
      (SET.level === 5 ? '<div class="hc-note" style="margin-top:10px">💀 Hardcore: 1 life, no ghost path, ×3 score.</div>' : '');
  } else if(SET.play === 'party'){
    const pool = list.concat(['Guest 1', 'Guest 2', 'Guest 3']);
    SET.opps = (SET.opps || []).filter(n => pool.indexOf(n) >= 0).slice(0, 3);
    if(SET.opps.length < 2) pool.forEach(n => { if(SET.opps.length < 2 && SET.opps.indexOf(n) < 0) SET.opps.push(n); });
    const all = [S.player].concat(SET.opps), hint = ['W A S D', '↑ ← ↓ →', 'I J K L', 'Num 8 4 5 6'];
    box.innerHTML = '<div class="seats">' + all.map((n, i) => seatHtml(n, 'Player ' + (i + 1) + ' · ' + hint[i], i, '')).join('') + '</div>' +
      '<div class="note" style="margin-top:8px">Who else plays? (2 or 3 more)</div><div class="opp-list">' + pool.map(n => '<button class="chip' + (SET.opps.indexOf(n) >= 0 ? ' on' : '') + '" data-n="' + UI.esc(n) + '" data-sound="tap">' + (/^Guest/.test(n) ? '🙂 ' + n : UI.esc(n)) + '</button>').join('') + '</div>' +
      '<div class="note" style="margin-top:6px">🎮 Game controllers work too (controller 1 = player 1 …). On a tablet each player gets a little joystick in their corner. ' + (SET.mode === 'castle' ? 'Land race — 2 minutes, most land wins.' : SET.mode === 'gate' ? 'Same arena with the bot snakes — be the longest.' : 'Duel rules: last snake riding or first to the target.') + ' Feats for everyone (no level result).</div>';
    box.querySelectorAll('.opp-list .chip').forEach(b => b.onclick = () => { const n = b.dataset.n, i = SET.opps.indexOf(n); if(i >= 0){ if(SET.opps.length <= 2){ UISound.play('error'); UI.toast('3–4 players: keep at least 2 friends'); return; } SET.opps.splice(i, 1); } else { if(SET.opps.length >= 3){ UISound.play('error'); UI.toast('4 players at most'); return; } SET.opps.push(n); } savePrefs(); buildSeats(); });
  } else {
    if(SET.opp && list.indexOf(SET.opp) < 0 && SET.opp !== 'Guest') SET.opp = '';
    if(!SET.opp) SET.opp = list[0] || 'Guest';
    box.innerHTML = '<div class="seats">' + seatHtml(S.player, 'Player 1 · left keys', 0, keyHint(0)) + seatHtml(SET.opp, 'Player 2 · right keys', 1, keyHint(1)) + '</div>' +
      '<div class="note" style="margin-top:8px">Who is player 2?</div><div class="opp-list">' + list.concat(['Guest']).map(n => '<button class="chip' + (n === SET.opp ? ' on' : '') + '" data-n="' + UI.esc(n) + '" data-sound="tap">' + (n === 'Guest' ? '🙂 Guest' : UI.esc(n)) + '</button>').join('') + '</div>' +
      '<div class="note" style="margin-top:6px">' + (SET.mode === 'feast' ? 'Duel on one grid: first to the target length or last snake riding wins. Bump the other snake = out!' : SET.mode === 'castle' ? 'Land race — 2 minutes, the most land wins. Cut the other trail to send them home. Land with both flags = no one\'s!' : 'Same arena: be the longest or the last one left. Popped snakes turn into food.') + ' Feats are saved for both (no level result).</div>';
    box.querySelectorAll('.opp-list .chip').forEach(b => b.onclick = () => { SET.opp = b.dataset.n; savePrefs(); buildSeats(); });
  }
  box.querySelectorAll('canvas[data-av]').forEach(c => { const n = c.dataset.av; drawPreviewCanvas(c, myAvatar(n === 'Guest' ? 'Guest' : n), {name: n, t: 1}); });
}
function buildSkills(){
  const box = $('skill-list'), on = skillsOn();
  $('skill-box').classList.toggle('hidden', !on);
  if(!on) return;
  box.innerHTML = SN.SKILL_KEYS.map(k => { const s = SN.SKILLS[k]; return '<button class="skill' + (SET.skill === k ? ' on' : '') + '" data-k="' + k + '" data-sound="tap"><span class="ic">' + s.icon + '</span><b>' + s.name + '</b><small>' + s.what + '</small></button>'; }).join('');
  box.querySelectorAll('.skill').forEach(b => b.onclick = () => { SET.skill = b.dataset.k; savePrefs(); box.querySelectorAll('.skill').forEach(c => c.classList.toggle('on', c === b)); });
}
function skillsOn(){ return window.SKILLS_ON !== false; }   // 🎒⏱️🗺️ skills are on in every mode (round 2)
function buildThemes(){
  const box = $('theme-list');
  if(!box.children.length){
    THEME_KEYS.forEach(k => { const T = THEMES[k], b = document.createElement('button'); b.className = 'theme'; b.dataset.k = k; b.setAttribute('data-sound', 'tap');
      const c = document.createElement('canvas'); c.width = 240; c.height = 180; b.appendChild(c); b.insertAdjacentHTML('beforeend', '<div class="nm">' + T.icon + ' ' + T.name + '</div>');
      b.onclick = () => { SET.theme = k; savePrefs(); markThemes(); buildSkin(); }; box.appendChild(b); });
  }
  box.querySelectorAll('.theme').forEach(b => themePreview(b.querySelector('canvas'), b.dataset.k));
  markThemes();
}
function buildSkin(){
  const box = $('skin-box'); if(!box) return; const me = S.player, own = skinsOf(me), cur = mySkin(me, SET.theme), steps = own.worlds[SET.theme] || [0];
  const T = THEMES[SET.theme];
  box.innerHTML = '<h3>🐍 My snake <span class="note">— the ' + T.icon + ' ' + T.name + ' skin evolves when you play this world</span></h3><div class="skins" id="skin-steps">' + SNAKE_STEPS.map((nm, i) => '<button class="skinchip' + (cur.step === i ? ' on' : '') + (steps.indexOf(i) < 0 ? ' lock' : '') + '" data-i="' + i + '" data-sound="tap"><canvas width="160" height="90"></canvas><span>' + (steps.indexOf(i) < 0 ? '🔒 ' : '') + nm + '</span></button>').join('') + '</div>' +
    '<div class="note" style="margin:8px 0 4px">Snake type (any world):</div><div class="skins" id="skin-types">' + SNAKE_TYPES.map(ty => { const ok = (own.types || ['garden']).indexOf(ty.id) >= 0; return '<button class="skinchip' + (cur.type === ty.id ? ' on' : '') + (ok ? '' : ' lock') + '" data-t="' + ty.id + '" data-sound="tap"><canvas width="160" height="90"></canvas><span>' + (ok ? '' : '🔒 ') + (ty.legend ? '🌟 ' : '') + ty.n + '</span></button>'; }).join('') + '</div>';
  box.querySelectorAll('#skin-steps .skinchip').forEach(b => { const i = Number(b.dataset.i); drawSnakePreview(b.querySelector('canvas').getContext('2d'), 160, 90, {theme: SET.theme, step: i, type: cur.type}, 1);
    b.onclick = () => { if(b.classList.contains('lock')){ UISound.play('error'); UI.toast('🔒 ' + SKIN_HOW[i]); return; } const p = skinPick(me); p.s = p.s || {}; p.s[SET.theme] = i; ls('sp_snakeskin:' + me, JSON.stringify(p)); buildSkin(); buildThemes(); }; });
  box.querySelectorAll('#skin-types .skinchip').forEach(b => { drawSnakePreview(b.querySelector('canvas').getContext('2d'), 160, 90, {theme: SET.theme, step: cur.step, type: b.dataset.t}, 1);
    b.onclick = () => { if(b.classList.contains('lock')){ UISound.play('error'); UI.toast('🔒 ' + (TYPE_HOW[b.dataset.t] || 'Keep playing!')); return; } const p = skinPick(me); p.type = b.dataset.t; ls('sp_snakeskin:' + me, JSON.stringify(p)); buildSkin(); buildThemes(); }; });
  const arts = artSnakes(), p0 = skinPick(me);   // 🏭 af-4: colour my snake like something the family made
  const row = document.createElement('div'); row.innerHTML = '<div class="note" style="margin:8px 0 4px">🏭 Colours from Artifactory:</div><div class="skins" id="skin-arts"><button class="skinchip' + (!p0.art ? ' on' : '') + '" data-art="" data-sound="tap"><span>🎨 My colour</span></button>' +
    arts.map(a => '<button class="skinchip' + (p0.art === a.id ? ' on' : '') + '" data-art="' + a.id + '" data-sound="tap"><span style="display:inline-block;width:22px;height:22px;border-radius:50%;vertical-align:middle;background:' + a.col + ';border:3px solid ' + (a.c2 || a.col) + '"></span><span>' + UI.esc(a.n) + ' · ' + UI.esc(a.by) + '</span></button>').join('') +
    '<button class="skinchip art-craft" data-sound="tap" data-craft="1"><span>✨ Craft a new one</span></button></div>';
  box.appendChild(row);
  row.querySelectorAll('[data-art]').forEach(b => b.onclick = () => { const p = skinPick(me); if(b.dataset.art) p.art = b.dataset.art; else delete p.art; ls('sp_snakeskin:' + me, JSON.stringify(p)); buildSkin(); buildThemes(); });
  row.querySelector('[data-craft]').onclick = () => { if(UI.craftLink) UI.craftLink('sew', me); };
}
const SKIN_HOW = ['Free', 'Play 5 games in this world', 'Eat 300 food in this world', 'Win a Hard level in this world', 'Grow to 60 long in this world', 'Win an Extreme level in this world', 'Win 💀 Hardcore in this world'];
const TYPE_HOW = {python: 'Play 10 Snakize games', rattle: 'Use 20 skills', cobra: 'Eat 20 golden food in Snakeast', anaconda: 'Grow to 40 long', viper: 'Pop 5 snakes in Snakigate', seasnake: 'Own 40 % land in Snakastle', coral: 'Win 3 family duels', boa: 'Win a Hard level in any mode', titanoboa: 'Finish Snaketale chapter 1', seaserpent: 'Finish Snaketale chapter 2', conga: 'Finish Snaketale chapter 3', mecha: 'Finish Snaketale chapter 4', comet: 'Finish Snaketale chapter 5', feather: 'Finish Snaketale chapter 6'};
function markThemes(){ $('theme-list').querySelectorAll('.theme').forEach(b => b.classList.toggle('on', b.dataset.k === SET.theme)); }
function themePreview(c, k){
  // the same painter as the real field: a little grid with a snake, food and the rider
  const M = SN.newFeast({level: 1, seed: 5, n: 8, players: [{name: S.player || 'Ava', human: true}]});
  M.foods = [{x: 6, y: 2, k: 'n', c: 'red'}, {x: 2, y: 6, k: 'g', c: 'gold'}];
  M.snakes[0].body = [[5, 4], [4, 4], [3, 4], [3, 5], [2, 5], [1, 5]]; M.snakes[0].dir = 'r';
  const fake = {M, mode: 'feast', theme: k, fx: [], avs: [riderAv(myAvatar(S.player || 'Ava'))], cols: [THEMES[k].body], preview: true, t: 1, seats: [{name: S.player}]};
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  drawFeast(g, c.width, c.height, fake, 1);
}

/* ================= ⌨️ KEYS (per player per device) ================= */
function keyName(code){ if(!code) return '—'; return code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'Num ').replace(/^Arrow(\w+)/, (m, d) => ({Up: '↑', Down: '↓', Left: '←', Right: '→'})[d] || d).replace('Quote', "'").replace('Semicolon', ';').replace('Backslash', '\\').replace('BracketLeft', '[').replace('BracketRight', ']').replace('Comma', ',').replace('Period', '.').replace('Slash', '/').replace('ShiftRight', 'R-Shift').replace('ShiftLeft', 'L-Shift'); }
function keysKey(){ return 'sp_snake_keys:' + (S.player || ''); }
function loadKeys(){ let k = null; try{ k = JSON.parse(ls(keysKey()) || 'null'); }catch(e){} return DEFAULT_KEYS.map((d, i) => Object.assign({}, d, (k && k[i]) || {})); }
function saveKeys(){ ls(keysKey(), JSON.stringify(KEYS)); }
let keyWait = null;
function keySeats(){ return SET.play === 'party' ? 4 : 2; }
function feelChip(){ const c = $('feel-chip'); if(!c || !UI.stickFeelInfo) return; const f = UI.stickFeelInfo(); c.textContent = '🕹️ Stick: ' + f.icon + ' ' + f.name; }
function nextFeel(){ if(!UI.stickFeelNext) return; UI.stickFeelNext(); feelChip(); const f = UI.stickFeelInfo(); UI.toast('🕹️ Stick feel: ' + f.icon + ' ' + f.name + (f.key === 'calm' ? ' — turns only on a clear slide' : f.key === 'quick' ? ' — reacts to tiny slides' : ' — the best of both'), 'ok'); }
function openKeys(){ renderKeys(); $('keys-sheet').classList.remove('hidden'); }
function closeKeys(){ keyWait = null; $('keys-sheet').classList.add('hidden'); if(!$('scr-setup').classList.contains('hidden')) buildSeats(); howTo(); }
function resetKeys(){ KEYS = DEFAULT_KEYS.map(d => Object.assign({}, d)); saveKeys(); renderKeys(); }
function renderKeys(){
  const n = keySeats(), cell = (s, a) => { const w = keyWait && keyWait.s === s && keyWait.a === a; return '<button class="keybtn s' + s + (w ? ' wait' : '') + '" data-s="' + s + '" data-a="' + a + '">' + (w ? '…' : UI.esc(keyName(KEYS[s][a]))) + '</button>'; };
  const heads = ['🟥 Player 1', '🟦 Player 2', '🟨 Player 3', '🟪 Player 4'].slice(0, n);
  $('keys-table').style.setProperty('--seats', n);
  $('keys-table').innerHTML = '<div class="krow"><span></span>' + heads.map(h => '<span>' + h + '</span>').join('') + '</div>' + ACTIONS.map(([a, nm]) => '<div class="krow"><span>' + nm + '</span>' + heads.map((h, s) => cell(s, a)).join('') + '</div>').join('');
  $('keys-table').querySelectorAll('.keybtn').forEach(b => b.onclick = () => { keyWait = {s: Number(b.dataset.s), a: b.dataset.a}; renderKeys(); });
}
function takeKey(e){
  if(!keyWait) return false; e.preventDefault(); if(e.code === 'Escape'){ keyWait = null; renderKeys(); return true; }
  const {s, a} = keyWait, old = KEYS[s][a];
  KEYS.forEach((K, si) => Object.keys(K).forEach(k => { if(K[k] === e.code && !(si === s && k === a)) K[k] = old; }));   // swap on clash
  KEYS[s][a] = e.code; keyWait = null; saveKeys(); renderKeys(); UISound.play('key'); return true;
}

/* ================= GAME ================= */
function botFamily(count, exclude){
  // random family avatars ride the bot snakes (a new mix every game); 🤖 robo-snakes fill the rest
  const fam = SN.shuffle({rnd: Math.random}, S.players.map(p => p.Name).filter(n => exclude.indexOf(n) < 0));
  const out = []; for(let i = 0; i < count; i++){ const n = fam[i]; out.push(n ? {name: n, av: riderAv(myAvatar(n)), col: BOT_COL[i % BOT_COL.length]} : {name: null, av: roboAv(i + 1), col: BOT_COL[i % BOT_COL.length]}); }
  return out;
}
function startGame(opts){
  opts = opts || {};
  hideResult(); stopLoop();
  const mode = opts.mode || SET.mode, lvl = opts.level != null ? opts.level : SET.level, theme = opts.theme || SET.theme;
  let seats = [{name: S.player}];
  if(!opts.story && SET.play === 'duo') seats.push({name: SET.opp || 'Guest'});
  if(!opts.story && SET.play === 'party') (SET.opps || []).slice(0, 3).forEach(n => seats.push({name: n}));
  if(opts.seats) seats = opts.seats;
  const players = seats.map((s, i) => ({name: s.name, human: true, skill: skillsOn() ? (i === 0 ? SET.skill : SN.SKILL_KEYS[(i * 2 + 1) % 6]) : null}));
  const endless = mode === 'feast' && SET.endless && lvl > 0 && seats.length === 1 && !opts.story;
  const seed = opts.seed || (Date.now() & 0xffffff);
  let botAvs = [];
  if(mode === 'gate' || mode === 'castle'){ const n = opts.bots != null ? opts.bots : (mode === 'gate' ? SN.GATE : SN.CASTLE)[lvl].bots; botAvs = botFamily(seats.length > 1 && mode === 'castle' ? 0 : n, seats.map(s => s.name)); }
  const SZ = opts.story ? {std: true, mult: 1} : sizeFor(mode, lvl);   /* 🗺️ p3e: the picked map size */
  const M = SN.make(mode, Object.assign({level: lvl, seed, players, endless, skills: skillsOn() && !opts.noSkills, botAvs}, SZ.engine || {}, opts.engine || {}));
  if(opts.afterMake) opts.afterMake(M);
  const humans = M.snakes.filter(s => s.human).length;
  const cols = M.snakes.map((s, i) => s.human ? (humans > 1 || mode === 'castle' ? SEAT_COL[i] : THEMES[theme].body) : (s.col || BOT_COL[i % BOT_COL.length]));
  const avs = M.snakes.map((s, i) => s.boss ? null : s.human ? riderAv(myAvatar(seats[i].name === 'Guest' ? 'Guest' : seats[i].name)) : (s.av || roboAv(i)));
  G = {M, mode, level: lvl, theme, seats, cols, avs, endless, SZ, fx: [], t: 0, paused: false, over: false, shown: false, startAt: performance.now(), story: opts.story || null,
    reacts: M.snakes.map(() => null), lean: M.snakes.map(() => 0), held: seats.map(() => new Set()), padAim: seats.map(() => null), padBoost: seats.map(() => false),
    cam: [{x: 0, y: 0, z: 1, ready: false}, {x: 0, y: 0, z: 1, ready: false}], shake: 0, lastHud: {}};
  savePrefs();
  showScreen('play'); buildControls(); layout();
  cheerMount();   /* 📣 cs-2b: the crowd for this game (Off = nothing) */
  if(window.GameComic) GameComic._reset(mode);   /* 💥 ck-2c (G.hold in loop() = a comic page is open) */
  BAR.level(opts.label || (MODES[mode].icon + ' ' + SN.LEVEL_NAMES[lvl] + (endless ? ' ♾️' : '')), lvl === 5 ? 'hc' : '');
  BAR.meter('grow', '🎯', 0, 'Progress'); if(humans > 1) BAR.meter('grow1', '🎯', 0, 'Player 2 progress'); else BAR.hide('grow1');
  BAR.extra('mus-btn', {icon: musicOn() ? '🎵' : '🔇', label: musicOn() ? 'Music: on' : 'Music: off'});
  musicStart(theme);
  banner(mode === 'castle' ? (M.win ? '🏰 Grab ' + M.win + ' % of the map!' : '🏰 Most land in ' + fmtS(M.time) + '!') : mode === 'feast' ? (endless ? '♾️ Endless — eat as much as you can!' : '🍎 Grow to ' + M.target + '!') : mode === 'gate' ? (M.time ? '🧭 Be the longest in ' + fmtS(M.time) + '!' : '🧭 Last snake wins!') : '', 'good', 2200);
  G.last = performance.now(); raf = requestAnimationFrame(loop);
  return G;
}
function stopLoop(){ if(raf) cancelAnimationFrame(raf); raf = 0; }
function loop(now){
  raf = requestAnimationFrame(loop);
  if(!G) return;
  let dt = Math.min(0.05, Math.max(0, (now - G.last) / 1000)); G.last = now;
  if(!G.paused && !G.hold && !G.over){ inputFrame(); SN.step(G.M, dt); G.t += dt; handleEvents(); if(G.M.over && !G.over) gameOver(); }
  else if(G.over){ G.t += dt; }
  if(window.Cheer) Cheer.pause(!!(G && G.paused));   /* 📣 cs-2b (not on game over: the crowd celebrates then) */
  tickFx(dt); hud(); draw();
}
function stepFor(sec){ // harness: run the game without waiting for frames
  const n = Math.round(sec * 60); for(let i = 0; i < n && G && !G.M.over; i++){ inputFrame(); SN.step(G.M, 1 / 60); G.t += 1 / 60; handleEvents(); }
  if(G && G.M.over && !G.over) gameOver();
}
function humanIdx(){ return G.M.snakes.filter(s => s.human).map(s => s.i); }
function inputFrame(){
  // Snakigate: held keys (8 ways) / pad angle → aim; boost
  if(G.mode !== 'gate') { pollPads(); return; }
  G.seats.forEach((st, si) => {
    const s = G.M.snakes[si]; if(!s || !s.alive) return;
    const sets = G.seats.length === 1 ? [KEYS[0], KEYS[1]] : [KEYS[si]];
    let dx = 0, dy = 0, boost = false; const H = KEYHELD;
    sets.forEach(K => { if(H.has(K.left)) dx -= 1; if(H.has(K.right)) dx += 1; if(H.has(K.up)) dy -= 1; if(H.has(K.down)) dy += 1; if(H.has(K.boost)) boost = true; });
    if(G.seats.length === 1 && (H.has('ShiftLeft'))) boost = true;
    if(dx || dy) SN.steer(G.M, si, Math.atan2(dy, dx));
    else if(G.padAim[si] != null) SN.steer(G.M, si, G.padAim[si]);
    SN.setBoost(G.M, si, boost || G.padBoost[si]);
  });
  pollPads();
}
// 🎮 game controllers: controller k drives player k (stick or d-pad · A = skill · B / RT = boost)
const PADS = {};
function pollPads(){
  let list = []; try{ list = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; }catch(e){}
  list.forEach((gp, k) => {
    if(!G || k >= G.seats.length) return; const si = k, s = G.M.snakes[si]; if(!s || !s.alive) return;
    const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    let dx = (b(15) ? 1 : 0) - (b(14) ? 1 : 0), dy = (b(13) ? 1 : 0) - (b(12) ? 1 : 0);
    if(!dx && !dy && Math.hypot(ax, ay) > (PADS[k] && PADS[k].dir ? 0.2 : 0.3)){ dx = ax; dy = ay; }   // r33: controller stick reacts at 30 % (was 45 %)
    const P = PADS[k] || (PADS[k] = {dir: null, a: false});
    if(dx || dy){ if(G.mode === 'gate') SN.steer(G.M, si, Math.atan2(dy, dx)); else { const d = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'); if(d !== P.dir){ P.dir = d; turnSeat(si, d, true); } } } else P.dir = null;
    const a = b(0); if(a && !P.a) useSkillSeat(si); P.a = a;
    if(G.mode === 'gate' && (b(1) || b(7))) SN.setBoost(G.M, si, true);
  });
}
function useSkillSeat(si){ if(!G || G.over || G.paused) return; const k = SN.useSkill(G.M, si); if(!k){ UISound.play('bump'); } }
function turnSeat(si, d, stick){ if(!G || G.over || G.paused || G.mode === 'gate') return; if(stick) SN.stickTurn(G.M, si, d); else SN.turn(G.M, si, d); }   // r36: sticks replace a waiting stick turn

/* ================= EVENTS → fx, sounds, rider moves ================= */
function react(si, g, dur){ if(!G) return; G.reacts[si] = {g, t: 0, d: dur || g.d}; }
function handleEvents(){
  const M = G.M, ev = SN.takeEvents(M), T = THEMES[G.theme];
  if(window.GameComic && ev.length) GameComic._feed(G.mode, ev, M);   /* 💥 ck-2c */
  ev.forEach(e => {
    const s = e.s != null ? M.snakes[e.s] : null, me = s && s.human;
    if(e.k === 'eat'){ if(me){ blip(1); if(Math.random() < 0.35) react(e.s, gestK('dance'), 0.8); } addFx({k: 'spark', x: e.x, y: e.y, c: '#FFE36E'}); }
    else if(e.k === 'eatBig'){ if(me) blip(1.3); addFx({k: 'spark', x: e.x, y: e.y, c: '#FFC845'}); }
    else if(e.k === 'gold'){ cheerSay('goal', e.s); (G.hood || (G.hood = {}))[e.s] = performance.now(); blip(1.6); react(e.s, gestK('cheer'), 1); addFx({k: 'txt', x: e.x, y: e.y, txt: '+3 ✨', gold: true}); if(me) banner('✨ Golden ' + T.gold + ' +3!', 'gold', 1100); }
    else if(e.k === 'bad'){ UISound.play('bump'); addFx({k: 'txt', x: e.x, y: e.y, txt: '🤢 −2'}); }
    else if(e.k === 'power'){ cheerSay('goal', e.s, 'power'); UISound.play('unlock'); addFx({k: 'txt', x: e.x, y: e.y, txt: SN.POWERS[e.p].icon, gold: true}); if(me) banner(SN.POWERS[e.p].icon + ' ' + SN.POWERS[e.p].name, 'good', 1400); react(e.s, gestK('cheer'), 0.9); }
    else if(e.k === 'grow10'){ cheerSay('big', e.s, 'grow'); if(me){ UISound.play('unlock'); react(e.s, gestK('wave'), 1.4); bigWord('🐍 ' + e.len + '!'); } }
    else if(e.k === 'faster'){ UISound.play('key'); setTimeout(() => UISound.play('key'), 120); banner('⚡ Faster!', 'gold', 900); }
    else if(e.k === 'portal'){ UISound.play('whoosh'); }
    else if(e.k === 'bump'){ cheerSay(s && s.human && s.lives === 1 ? 'close' : 'miss', e.s, 'bump');   /* 📣 cs-2b: cheerSay('miss', e.s, 'bump') */ UISound.play('error'); G.shake = 0.35; if(s) addFx({k: 'stars', s: e.s, t: 0, life: 1.3}); if(me && s.alive) banner(s.lives > 0 ? '💫 Bonk! ' + '❤️'.repeat(s.lives) + ' left' : '💫 Bonk!', 'bad', 1200); }
    else if(e.k === 'bounce'){ UISound.play('bump'); addFx({k: 'stars', s: e.s, t: 0, life: 0.8}); }
    else if(e.k === 'edge'){ }
    else if(e.k === 'shieldHit'){ UISound.play('pop'); banner('🛡️ Shield saved you!', 'good', 1100); }
    else if(e.k === 'burn'){ UISound.play('whoosh'); addFx({k: 'txt', x: e.x, y: e.y, txt: '🔥'}); }
    else if(e.k === 'boom'){ addFx({k: 'txt', x: e.x, y: e.y, txt: '💥'}); }
    else if(e.k === 'rockfall'){ UISound.play('drop'); }
    else if(e.k === 'pop'){ cheerSay('miss', e.s, 'pop'); if(e.by >= 0 && e.by !== e.s) cheerSay('big', e.by, 'popper'); UISound.play(e.human ? 'error' : 'pop'); addFx({k: 'burst', x: e.x, y: e.y, big: e.len > 30});
      const by = e.by >= 0 ? M.snakes[e.by] : null;
      if(by && by.human){ react(e.by, gestK('cheer'), 1); banner('💥 You popped ' + snakeName(M.snakes[e.s]) + '!', 'gold', 1200); }
      if(e.human){ G.shake = 0.4; banner(M.snakes[e.s].lives > 0 ? '💥 Popped! Back on in a moment…' : '💥 Popped!', 'bad', 1400); } }
    else if(e.k === 'respawn'){ if(s && s.human) UISound.play('nav'); }
    else if(e.k === 'skill'){ UISound.play('whoosh'); react(e.s, SKILL_POSE[e.skill], SKILL_POSE[e.skill].d); if(me) banner(SN.SKILLS[e.skill].icon + ' ' + SN.SKILLS[e.skill].name + '!', 'good', 900); }
    else if(e.k === 'gift'){ if(me){ UISound.play('unlock'); banner((e.why === 'quest' ? '🗺️ ' : '🎁 ') + 'New skill: ' + SN.SKILLS[e.skill].icon + ' ' + SN.SKILLS[e.skill].name, 'good', 1500); } }
    else if(e.k === 'quest'){ if(me) banner('🗺️ Side quest: ' + e.q.text, 'gold', 1800); }
    else if(e.k === 'questDone'){ cheerSay('goal', e.s, 'quest'); UISound.play('success'); react(e.s, gestK('cheer'), 1.2); }
    else if(e.k === 'questFail'){ }
    else if(e.k === 'lead'){ UISound.play('unlock'); addFx({k: 'txt', x: e.x, y: e.y, txt: '🚩 ' + e.n, gold: true}); banner('🚩 ' + e.n + '/' + G.M.story.flags.length, 'good', 900); }
    else if(e.k === 'claim'){ cheerSay(e.cells >= 25 ? 'big' : 'goal', e.s, 'claim'); if(me){ UISound.play('success'); react(e.s, PLANT, PLANT.d); addFx({k: 'txt', x: e.x, y: e.y, txt: '🚩 +' + e.cells, gold: true}); if(e.cells >= 25) bigWord('🏰 +' + e.cells + '!'); } else addFx({k: 'txt', x: e.x, y: e.y, txt: '🚩'}); }
    else if(e.k === 'cut'){ cheerSay('miss', e.s, 'cut'); if(e.by >= 0 && e.by !== e.s) cheerSay('goal', e.by, 'cutter'); const by = e.by >= 0 && e.by !== e.s ? M.snakes[e.by] : null; addFx({k: 'txt', x: e.x, y: e.y, txt: '✂️'});
      if(me){ UISound.play('error'); G.shake = 0.3; banner(e.why === 'self' ? '🙈 Your own trail — back home!' : e.why === 'long' ? '🐍 Trail too long — back home! Eat to grow.' : e.why === 'fire' ? '🔥 Fire burnt your trail — back home!' : e.why === 'wall' ? '🧱 The edge — back home!' : '✂️ ' + (by ? snakeName(by) : 'Someone') + ' cut your trail — back home!', 'bad', 1500); }
      else if(by && by.human){ UISound.play('unlock'); react(e.by, gestK('cheer'), 1); banner('✂️ You cut ' + snakeName(s) + '\'s trail!', 'gold', 1200); } }
    else if(e.k === 'tooLong'){ }
    else if(e.k === 'burnTrail'){ addFx({k: 'txt', x: e.x, y: e.y, txt: '🔥'}); }
    else if(e.k === 'out'){ }
    else if(window.extraEvent) window.extraEvent(e);
  });
}
function snakeName(s){ return s.human ? s.name : (s.robo || !s.name ? '🤖 Robo-snake' : s.name); }
function addFx(f){ if(!G) return; f.t = 0; f.life = f.life || 0.9; G.fx.push(f); if(G.fx.length > 80) G.fx.shift(); }
function tickFx(dt){ if(!G) return; G.fx.forEach(f => f.t += dt); G.fx = G.fx.filter(f => f.t < f.life); G.reacts.forEach((r, i) => { if(r){ r.t += dt; if(r.t > r.d && !r.keep) G.reacts[i] = null; } }); if(G.shake > 0) G.shake = Math.max(0, G.shake - dt); }
let bannerT = 0;
function banner(txt, kind, ms){ const b = $('banner'); if(!b || !txt) return; b.textContent = txt; b.className = 'banner on ' + (kind || ''); clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('on'), ms || 1400); }
function bigWord(txt){ if(!FX) return; const h = $('bigword-host'); const d = document.createElement('div'); d.className = 'big-word'; d.textContent = txt; h.appendChild(d); setTimeout(() => d.remove(), 1100); }
// tiny synth: a blip per eat (pitch from the world's scale) + an optional music loop
let AC = null;
function ac(){ try{ if(!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if(AC.state === 'suspended') AC.resume(); }catch(e){ AC = null; } return AC; }
function note(freq, len, type, vol, when){ const a = ac(); if(!a || !UISound.get().enabled) return; const o = a.createOscillator(), g = a.createGain(), t = (when || a.currentTime); o.type = type || 'triangle'; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + len + 0.05); }
function blip(k){ if(!G) return; const T = THEMES[G.theme], st = T.notes[Math.floor(Math.random() * T.notes.length)]; note(T.root * 2 * Math.pow(2, st / 12) * (k || 1), 0.12, 'sine', 0.09); }
let musT = 0, musStep = 0;
function musicOn(){ return ls('sp_snake_music') !== '0'; }
function toggleMusic(){ ls('sp_snake_music', musicOn() ? '0' : '1'); BAR.extra('mus-btn', {icon: musicOn() ? '🎵' : '🔇', label: musicOn() ? 'Music: on' : 'Music: off'}); if(musicOn() && G) musicStart(G.theme); else musicStop(); }
function musicStop(){ clearInterval(musT); musT = 0; }
function musicStart(theme){
  musicStop(); if(!musicOn() || !UISound.get().enabled || navigator.webdriver) return;
  const T = THEMES[theme], beat = 60 / T.bpm / 2, pat = [0, 2, 1, 3, 4, 3, 1, 2, 0, 2, 4, 3, 1, 0, 2, 1];
  musStep = 0;
  musT = setInterval(() => { if(!G || G.paused || G.over) return; const a = ac(); if(!a) return; const i = musStep++ % 16, st = T.notes[pat[i] % T.notes.length];
    if(i % 2 === 0) note(T.root * Math.pow(2, st / 12), beat * 0.9, 'triangle', 0.035);
    if(i % 4 === 0) note(T.root / 2 * Math.pow(2, T.notes[(i / 4) % T.notes.length] / 12), beat * 1.8, 'sine', 0.04); }, beat * 1000);
}

/* ================= HUD ================= */
function hud(){
  const M = G.M, me = M.snakes[0], hs = humanIdx();
  const len = SN.lenOf(M, me), tgt = M.mode === 'feast' && isFinite(M.target) ? M.target : (M.mode === 'gate' && M.goalLen ? M.goalLen : 0);
  if(M.story) BAR.count('len', M.story.icon || '📜', Math.min(M.story.have || 0, M.story.need) + '/' + M.story.need, 'Story goal');
  else if(M.mode === 'castle') BAR.count('len', '🏰', Math.floor(me.land) + '%' + (M.win ? '/' + M.win + '%' : ''), 'Your land');
  else BAR.count('len', '🐍', len + (tgt ? '/' + tgt : ''), 'Snake length');
  const best = M.mode === 'gate' ? Math.max(1, ...M.snakes.map(s => s.len)) : 0;
  const bestLand = M.mode === 'castle' ? Math.max(1, ...M.snakes.map(s => s.land)) : 0;
  hs.slice(0, 2).forEach((i, k) => { const s = M.snakes[i], L = SN.lenOf(M, s), w = M.story ? Math.min(100, (M.story.have || 0) / M.story.need * 100) : M.mode === 'castle' ? Math.min(100, s.land / (M.win || Math.max(bestLand, 30)) * 100) : tgt ? Math.min(100, L / tgt * 100) : M.mode === 'gate' ? Math.min(100, L / best * 100) : Math.min(100, (L % 50) * 2);
    BAR.meter(k ? 'grow1' : 'grow', '🎯', w / 100, k ? 'Player 2 progress' : 'Progress'); });
  BAR.score(SN.score(M, 0).toLocaleString());
  const stT = M.story && M.story.time, timed = stT || ((M.mode === 'gate' || M.mode === 'castle') && M.time), tl = timed ? Math.max(0, (stT || M.time) - M.t) : M.t;
  BAR.time(fmtS(tl), !!timed && tl <= 10);
  if(M.mode === 'castle' && !M.L.lives) BAR.hide('lives'); else BAR.lives(hs.map(i => Math.max(0, M.snakes[i].lives)).join(' · '), hs.length === 1 && M.snakes[hs[0]].lives === 1);   // 🎛️ p1c
  // skill button + quest cards
  hs.slice(0, 2).forEach((i, k) => {
    const s = M.snakes[i], q = $('quest' + k), btn = document.querySelector('.tb.skl[data-seat="' + k + '"]');
    const qt = s.quest ? '🗺️ ' + s.quest.text + (s.quest.kind === 'eatc' || s.quest.kind === 'grow' ? ' (' + Math.min(s.quest.have, s.quest.need) + '/' + s.quest.need + ')' : '') + ' · ' + Math.ceil(s.quest.t) + 's' : '';
    if(q){ setTxt(q, qt); q.classList.toggle('hidden', !qt); }
    if(btn){ const ic = btn.querySelector('.ic'), nx = nextSkill(s); setTxt(ic, nx ? SN.SKILLS[nx].icon : (s.start ? SN.SKILLS[s.start].icon : '⚡')); btn.classList.toggle('ready', !!nx); btn.classList.toggle('cool', !nx);
      const n = btn.querySelector('.n'); setTxt(n, s.extra.length ? '+' + s.extra.length : (s.cd > 0 ? Math.ceil(s.cd) + 's' : '')); }
  });
  { const s = M.snakes[0], nx = nextSkill(s), b = $('hud-skill'); b.classList.toggle('hidden', !skillsOn() || isTouch()); setTxt(b, (nx ? SN.SKILLS[nx].icon : '⏳') + (s.extra.length ? '+' + s.extra.length : '') + (!nx && s.cd > 0 ? Math.ceil(s.cd) : '')); }
  const off = $('offer'), s0 = hs.map(i => M.snakes[i]).find(s => s.offer);
  if(s0 && off.__for !== s0.offer.join()){ off.__for = s0.offer.join(); off.innerHTML = '<b>🗺️ Pick a skill' + (hs.length > 1 ? ' — ' + UI.esc(s0.name) : '') + ':</b>' + s0.offer.map(k => '<button data-k="' + k + '" data-s="' + s0.i + '" title="' + SN.SKILLS[k].name + '">' + SN.SKILLS[k].icon + '</button>').join(''); off.classList.remove('hidden');
    off.querySelectorAll('button').forEach(b => b.onclick = () => { SN.pickSkill(G.M, Number(b.dataset.s), b.dataset.k); off.classList.add('hidden'); off.__for = ''; }); }
  else if(!s0 && !off.classList.contains('hidden')){ off.classList.add('hidden'); off.__for = ''; }
}
function nextSkill(s){ if(s.useStart && s.start && s.cd <= 0) return s.start; if(s.extra.length) return s.extra[s.extra.length - 1]; if(s.start && s.cd <= 0) return s.start; return null; }

/* ================= LAYOUT + DRAW ================= */
let CV = null, CTX = null, VW = 0, VH = 0, DPR = 1;
/* 📣 CHEERSQUAD (cs-2b) START — the crowd around the board (CheerSquad.html, 📣 Cheer chat). Don't remove: the Cheer chat re-applies it. */
// sides: every human snake = its own side (its index); bots / the board = the 😈 rival's side
function cheerMount(){
  if(!window.Cheer) return; Cheer.unmount();
  const M = G.M, hs = M.snakes.filter(s => s.human), bots = M.snakes.some(s => !s.human);
  const players = hs.map((s, i) => ({name: s.name, side: i, human: true})).concat(hs.length < 2 ? [{name: bots ? 'Robo-snakes' : 'Wiggles', side: 1, human: false}] : []);
  Cheer.mount($('stage'), {game: 'snakize', players, me: {name: S.player}, family: (S.players || []).map(p => p.Name), avatars: S.avatars || {}, mode: 'scene', ref: $('cv'),
    avoid: () => Array.from(document.querySelectorAll('#gbar, #corners .corner, .ctl-side, .ctl-wrap, .quest:not(.hidden), #offer:not(.hidden)')),
    clear: b => { const R = cheerField(); return !R || !(b.r > R.x - 3 && b.l < R.x + R.w + 3 && b.b > R.y - 3 && b.t < R.y + R.h + 3); }});
}
// the board on screen (null = it fills the screen: 🧭 gate, zoomed castle)
function cheerField(){
  if(!G) return null; const M = G.M, n = M.n;
  if(G.mode === 'feast' || (G.story && G.mode !== 'gate' && G.mode !== 'castle')){ const b = feastBox(VW, VH, n); return {x: b.bx, y: b.by, w: b.cell * n, h: b.cell * n}; }
  if(G.mode === 'castle'){ const b = castleBox(VW, VH, n); if(!b.fit) return null; return {x: Math.floor((VW - b.cell * n) / 2), y: Math.floor((VH - b.cell * n) / 2), w: b.cell * n, h: b.cell * n}; }
  return null;
}
// candidate spots in the margins: a column each side on wide screens, a row above / below on tall ones (team 0 = left / top)
function cheerScene(g){
  if(!window.Cheer || !Cheer.active() || !G) return;
  const R = cheerField(); if(!R) return;
  const party = Cheer.stats().size === 'party', cands = [], ml = R.x, mt = R.y, mb = VH - R.y - R.h;
  if(ml >= 46){ const k = Math.min(ml / 62, 0.95) * (party ? 1 : 0.9), step = 92 * k;
    for(let y = R.y + R.h - 6; y - 100 * k > -2; y -= step) [0, 1].forEach(side => cands.push({id: 'c' + side + ':' + Math.round(y), x: side ? R.x + R.w + ml / 2 : ml / 2, y, k, half: side})); }
  if(mt >= 60 || mb >= 60){ const k = Math.min(Math.max(mt, mb) / 110, 0.85) * (party ? 1 : 0.9), step = 54 * k;
    for(let x = step / 2 + 4; x < VW - step / 2; x += step){ if(mt >= 60) cands.push({id: 't:' + Math.round(x), x, y: mt - 4, k: Math.min(k, mt / 110), half: x < VW / 2 ? 0 : 1});
      if(mb >= 60) cands.push({id: 'b:' + Math.round(x), x, y: VH - 4, k: Math.min(k, mb / 110), half: x < VW / 2 ? 0 : 1}); } }
  if(!cands.length) return;
  cands.sort((a, b) => Math.abs(a.y - VH * 0.55) - Math.abs(b.y - VH * 0.55));
  Cheer.place(g, cands, {key: 'main', w: VW, h: VH});
}
function cheerSay(kind, si, why){ if(!window.Cheer || !Cheer.active() || !G) return; const M = G.M, s = M.snakes[si]; if(!s) return;
  const hs = M.snakes.filter(x => x.human); let side = s.human ? hs.indexOf(s) : 1;
  if(!s.human && kind === 'miss') return;   /* a bot bumping is not news */
  if(!s.human && hs.length > 1) return;
  const now = performance.now(); if(why === 'power' || why === 'grow' || why === 'claim'){ if((G.cheerAt || 0) > now - 2500) return; G.cheerAt = now; }
  Cheer.react(kind, {side}); }
function cheerEnd(){ if(!window.Cheer || !Cheer.active() || !G) return; const M = G.M, hs = M.snakes.filter(s => s.human);
  if(M.winner >= 0 && M.snakes[M.winner] && M.snakes[M.winner].human) Cheer.react('win', {side: hs.indexOf(M.snakes[M.winner])});
  else if(G.endless) Cheer.react('win', {side: 0});
  else Cheer.react('lose', {side: 0}); }
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(!at) return; card.insertBefore(c, at); card.insertBefore(cap, at); }, 60); }
/* 📣 CHEERSQUAD END */
function layout(){
  const st = $('stage'); CV = $('cv'); CTX = CV.getContext('2d');
  const r = CV.getBoundingClientRect(); DPR = Math.min(2, window.devicePixelRatio || 1);
  VW = Math.max(1, r.width); VH = Math.max(1, r.height);
  const w = Math.round(VW * DPR), h = Math.round(VH * DPR);
  if(CV.width !== w || CV.height !== h){ CV.width = w; CV.height = h; }
  if(G) G.fieldCache = null;
}
let roLast = '';
const RO = window.ResizeObserver ? new ResizeObserver(() => { const r = $('stage').getBoundingClientRect(), k = Math.round(r.width) + 'x' + Math.round(r.height); if(k !== roLast){ roLast = k; layout(); } }) : null;
function draw(){
  if(!CTX || !G) return;
  const g = CTX; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  let sx = 0, sy = 0; if(G.shake > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches){ sx = (Math.random() - 0.5) * 8 * G.shake; sy = (Math.random() - 0.5) * 8 * G.shake; }
  g.translate(sx, sy);
  if(G.mode === 'gate') drawGate(g, VW, VH, G);
  else if(G.mode === 'castle' && window.drawCastle) window.drawCastle(g, VW, VH, G);
  else drawFeast(g, VW, VH, G, 0);
  cheerScene(g);   /* 📣 cs-2b: crowd in the free space around the board */
}
function star(g, x, y, R, r){ g.beginPath(); for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
function rideK(cellPx){ return Math.max(0.26, cellPx * 1.25 / 70); }
// 🧑 the rider on the snake head: holds on, leans into turns, does moves; falls off with dizzy stars on a bump
function drawRider(g, si, x, y, k, face, lean, t, opts){
  opts = opts || {};
  const s = G.M.snakes[si], av = G.avs[si]; if(!av) return;
  const r = G.reacts[si];
  const a = {name: s.name, av, dir: face >= 0 ? 1 : -1, gest: r && r.g ? {g: r.g, t: r.t} : null};
  if(opts.fallen){
    const q = Math.min(1, opts.fallen);
    g.save(); g.translate(x + face * k * 26 * Math.sin(q * Math.PI), y + k * 4 - Math.sin(q * Math.PI) * k * 30); g.rotate(face * 1.2 * Math.sin(q * Math.PI));
    drawAvatar(g, {name: s.name, av, dir: a.dir}, 0, 0, k, {t, pose: {armL: 2.4, armR: 2.6, legL: 0.6, legR: -0.6, eyes: 'closed', mouth: 'open'}}); g.restore();
    for(let i = 0; i < 3; i++){ const an = t * 6 + i * 2.1; emo(g, i % 2 ? '⭐' : '💫', x + Math.cos(an) * k * 22, y - k * 66 + Math.sin(an) * k * 6, k * 18); }
    return;
  }
  g.save(); g.translate(x, y); g.rotate(lean * 0.35);
  drawAvatar(g, a, 0, 0, k, {t, pose: a.gest ? undefined : RIDE_POSE});
  g.restore();
  if(!s.human && (s.robo || !s.name)) emo(g, '🤖', x, y - k * 56, k * 26);
  if(s.shield) { g.save(); g.strokeStyle = 'rgba(110,231,249,0.85)'; g.lineWidth = Math.max(2, k * 4); g.beginPath(); g.arc(x, y - k * 34, k * 46, 0, 7); g.stroke(); g.restore(); }
  if(s.ghostT > 0) emo(g, '👻', x + k * 24, y - k * 70, k * 20);
}
function foodChar(T, f){ if(f.k === 'g') return T.gold; if(f.k === 'b') return T.bad; if(SN.POWERS[f.k]) return SN.POWERS[f.k].icon; return T.food[(f.x * 7 + f.y * 3) % T.food.length]; }

/* ---------- 🍎 grid painter (play + world previews) ---------- */
function feastBox(W, H, n){ const cell = Math.max(4, Math.floor(Math.min(W / n, H / n))); return {cell, bx: Math.floor((W - cell * n) / 2), by: Math.floor((H - cell * n) / 2)}; }
function fieldCache(st, T, n, cell){
  const key = st.theme + n + 'x' + cell + ':' + wallSig(st.M);
  if(st.fieldCache && st.fieldCache.key === key) return st.fieldCache.c;
  const c = document.createElement('canvas'), sc = st.preview ? 1 : DPR; c.width = Math.ceil(n * cell * sc); c.height = c.width;
  const g = c.getContext('2d'); g.scale(sc, sc);
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){ g.fillStyle = (x + y) % 2 ? T.bg[0] : T.bg[1]; g.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5); }
  if(T.circuit){ g.strokeStyle = T.line; g.lineWidth = Math.max(1, cell * 0.06); for(let i = 0; i < n; i += 3){ g.beginPath(); g.moveTo(0, (i + 0.5) * cell); g.lineTo(n * cell, (i + 0.5) * cell); g.stroke(); g.beginPath(); g.moveTo((i + 1.5) * cell, 0); g.lineTo((i + 1.5) * cell, n * cell); g.stroke(); } }
  if(T.stars){ const R = SN.rng(7); for(let i = 0; i < n * 3; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.3 + R() * 0.6) + ')'; g.fillRect(R() * n * cell, R() * n * cell, 1.5, 1.5); } }
  const R2 = SN.rng(n * 13 + 1); for(let i = 0; i < Math.round(n * n / 18); i++){ const x = Math.floor(R2() * n), y = Math.floor(R2() * n); if(st.M.wall[y * n + x]) continue; emo(g, T.decor[i % T.decor.length], (x + 0.5) * cell, (y + 0.5) * cell, cell * 0.55, 0.28); }
  const M = st.M;
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){ const w = M.wall[y * n + x]; if(!w) continue;
    if(w === 3) continue;   // 🧩 24n: void (painted by paintVoid)
    if(w === 1){ g.fillStyle = T.wall; rrect(g, x * cell + 1, y * cell + 1, cell - 2, cell - 2, cell * 0.18); g.fill(); g.fillStyle = T.wallHi; rrect(g, x * cell + 2, y * cell + 2, cell - 4, cell * 0.38, cell * 0.14); g.fill(); }
    else emo(g, T.rock, (x + 0.5) * cell, (y + 0.5) * cell, cell * 0.85); }
  paintVoid(g, M, T, n, cell);   // 🧩 24n
  if(!M.L.wrap && !M.voidM){ g.strokeStyle = T.out; g.lineWidth = Math.max(2, cell * 0.12); g.strokeRect(1, 1, n * cell - 2, n * cell - 2); }
  st.fieldCache = {key, c};
  return c;
}
function wallSig(M){ let s = 0; for(let i = 0; i < M.wall.length; i++) if(M.wall[i]) s = (s * 31 + i * M.wall[i]) % 1000003; return s; }
function drawFeast(g, W, H, st, preview){
  const M = st.M, T = THEMES[st.theme], n = M.n, {cell, bx, by} = feastBox(W, H, n), t = st.preview ? 1 : performance.now() / 1000;
  g.fillStyle = T.out; g.fillRect(-20, -20, W + 40, H + 40);
  const fc = fieldCache(st, T, n, cell);
  g.drawImage(fc, bx, by, n * cell, n * cell);
  g.save(); g.translate(bx, by);
  if(M.L.wrap && !st.preview && !M.voidM){ g.strokeStyle = 'rgba(255,255,255,0.35)'; g.setLineDash([cell * 0.3, cell * 0.3]); g.lineWidth = 2; g.strokeRect(1, 1, n * cell - 2, n * cell - 2); g.setLineDash([]); }
  if(T.tiles && !st.preview){ for(let i = 0; i < 6; i++){ const R = SN.rng(Math.floor(t * 2) * 7 + i), x = Math.floor(R() * n), y = Math.floor(R() * n); g.fillStyle = ['rgba(255,79,163,0.25)', 'rgba(255,224,102,0.25)', 'rgba(110,231,249,0.25)'][i % 3]; g.fillRect(x * cell, y * cell, cell, cell); } }
  const C = (x, y) => [(x + 0.5) * cell, (y + 0.5) * cell];
  // portals
  M.portals.forEach((p, pi) => [p.a, p.b].forEach(q => { const [x, y] = C(q[0], q[1]); g.save(); g.translate(x, y); g.rotate(t * 2 * (pi % 2 ? -1 : 1)); emo(g, T.portal, 0, 0, cell * 0.95); g.restore(); g.strokeStyle = ['#FFC845', '#6EE7F9'][pi % 2]; g.lineWidth = 2; g.beginPath(); g.arc(x, y, cell * 0.5, 0, 7); g.stroke(); }));
  // ghost path
  if(!st.preview && M.L.ghost) M.snakes.forEach((s, i) => { if(!s.human || !s.alive || s.down > 0) return; SN.ghostPath(M, i, 7).forEach((c, j) => { const [x, y] = C(c.x, c.y); g.fillStyle = c.bad ? 'rgba(255,60,60,0.55)' : 'rgba(255,255,255,' + (0.42 - j * 0.05) + ')'; g.beginPath(); g.arc(x, y, cell * (c.bad ? 0.3 : 0.18), 0, 7); g.fill(); }); });
  // quest flags
  if(!st.preview) M.snakes.forEach(s => { if(s.quest && s.quest.kind === 'visit'){ const [x, y] = C(s.quest.x, s.quest.y); g.fillStyle = 'rgba(255,200,69,0.3)'; g.fillRect(x - cell / 2, y - cell / 2, cell, cell); emo(g, '🚩', x, y - Math.abs(Math.sin(t * 4)) * cell * 0.12, cell * 0.8); } });
  // 📜 lead the lost ones home: numbered flags, the next one glows
  if(M.story && M.story.flags) M.story.flags.forEach((f, i) => { if(i < M.leadI) return; const [x, y] = C(f[0], f[1]), next = i === M.leadI; g.fillStyle = next ? 'rgba(255,200,69,' + (0.35 + 0.2 * Math.sin(t * 6)) + ')' : 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(x, y, cell * 0.55, 0, 7); g.fill(); emo(g, '🚩', x, y - (next ? Math.abs(Math.sin(t * 4)) * cell * 0.15 : 0), cell * (next ? 0.85 : 0.6)); g.font = '900 ' + Math.round(cell * 0.38) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.strokeText(String(i + 1), x + cell * 0.3, y + cell * 0.3); g.fillStyle = '#fff'; g.fillText(String(i + 1), x + cell * 0.3, y + cell * 0.3); });
  // food
  M.foods.forEach(f => { const [x, y] = C(f.x, f.y), bob = Math.sin(t * 4 + f.x) * cell * 0.05;
    if(f.k === 'n' || f.k === 'g'){ g.fillStyle = f.k === 'g' ? 'rgba(255,200,69,0.55)' : COL_HEX[f.c] + '66'; g.beginPath(); g.arc(x, y, cell * 0.46, 0, 7); g.fill(); }
    if(f.k === 'g' && T.goldRing){ g.strokeStyle = '#FFC845'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, cell * 0.42, 0, 7); g.stroke(); }
    emo(g, foodChar(T, f), x, y + bob, cell * (f.k === 'g' ? 0.86 : 0.74)); });
  // movers, falling rocks, tail walls
  M.movers.forEach(mv => { const [x, y] = C(mv.x, mv.y); g.fillStyle = 'rgba(255,80,40,0.25)'; g.beginPath(); g.arc(x, y, cell * 0.48, 0, 7); g.fill(); emo(g, T.mover, x, y, cell * 0.85); });
  M.falling.forEach(fr => { const [x, y] = C(fr.x, fr.y); if(!fr.landed){ g.fillStyle = 'rgba(0,0,0,' + (0.15 + (1.6 - fr.warn) * 0.25) + ')'; g.beginPath(); g.ellipse(x, y + cell * 0.2, cell * 0.45 * (1.6 - fr.warn) / 1.6 + 2, cell * 0.2, 0, 0, 7); g.fill(); emo(g, T.fall, x, y - fr.warn * cell * 2, cell * 0.8, 0.85); } else emo(g, T.fall, x, y, cell * 0.85); });
  M.walls2.forEach(w => { const [x, y] = C(w.x, w.y); g.globalAlpha = Math.min(1, w.life / 2); g.fillStyle = shade(st.cols[(w.by || 1) - 1] || T.body, 0.55); rrect(g, x - cell * 0.42, y - cell * 0.42, cell * 0.84, cell * 0.84, cell * 0.2); g.fill(); g.globalAlpha = 1; });
  // snakes (tail → head), then riders on top
  const heads = [];
  M.snakes.forEach((s, si) => { const h = gridSnake(g, st, s, si, C, cell, T, t, M.tick); if(h) heads.push(h); });
  drawHeads(g, st, heads, cell, t);
  // fx
  if(!st.preview) drawFxGrid(g, st, cell);
  g.restore();
}
function gridSnake(g, st, s, si, C, cell, T, t, tick){
  if(!s.alive && !st.preview) return null;
  const col = st.cols[si] || T.body, iv = (s.tick || tick) / (s.dashT > 0 ? 2 : 1), fr = st.preview || s.down > 0 || !s.prev ? 1 : Math.min(1, s.acc / iv);
  const pts = s.body.map((b, i) => { const p = s.prev && s.prev[i]; if(!p || fr >= 1 || Math.abs(p[0] - b[0]) + Math.abs(p[1] - b[1]) > 1) return C(b[0], b[1]); return C(lerpN(p[0], b[0], fr), lerpN(p[1], b[1], fr)); });
  const r = cell * 0.4, d = SN.DIRS[s.dir], h = pts[0];
  snakeBody(g, pts, r, lookFor(st, si), t, {gap: cell * 1.5, ang: Math.atan2(d[1], d[0])});
  g.save();
  if(s.starT > 0 || s.dashT > 0){ g.strokeStyle = s.dashT > 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,224,102,0.9)'; g.lineWidth = 2; g.beginPath(); g.arc(h[0], h[1], r * 1.45 + Math.sin(t * 10) * 2, 0, 7); g.stroke(); }
  g.restore();
  return {si, x: h[0], y: h[1], face: d[0] !== 0 ? d[0] : (si % 2 ? -1 : 1), s};
}
function drawHeads(g, st, heads, cell, t){
  heads.forEach(h => { const k = rideK(cell);
    if(h.s.down > 0 && !st.preview) drawRider(g, h.si, h.x, h.y - cell * 0.2, k, h.face, 0, t, {fallen: Math.max(0, 1.3 - h.s.down)});
    else if(st.preview) drawPreviewRider(g, st, h.si, h.x, h.y - cell * 0.15, k, h.face, t);
    else drawRider(g, h.si, h.x, h.y - cell * 0.15, k, h.face, h.s.q && h.s.q.length ? 0.4 * h.face : 0, t); });
}
// 🐍 how each snake looks: your saved skin step for this world + snake type; bots get a pattern + a random type
function lookFor(st, si){
  const M = st.M, s = M.snakes[si], theme = st.theme;
  const col = st.cols && st.cols[si];
  if(!s || s.boss) return {theme, step: 3, type: 'anaconda', col: col || '#555', seed: si};
  if(!s.human && !st.preview) return {theme, step: 1, type: SNAKE_TYPES[(si * 5) % 9].id, col, seed: si};
  const nm = st.seats && st.seats[si] ? st.seats[si].name : S.player, my = mySkin(nm, theme);
  const hood = st.hood && st.hood[si] ? Math.max(0, 1 - (performance.now() - st.hood[si]) / 1500) : 0;
  return {theme, step: my.step, type: my.type, col: my.art && /^#[0-9a-f]{6}$/i.test(my.art.col || '') ? my.art.col : col, seed: si, hood, rattle: s.dashT > 0};
}
function skinsOf(name){ return (S.skins && S.skins[name]) || {worlds: {}, types: ['garden'], best: 1}; }
function skinPick(name){ try{ return JSON.parse(ls('sp_snakeskin:' + name) || '{}') || {}; }catch(e){ return {}; } }
// 🏭 af-4: woven / printed things made in Artifactory colour your snake (list = localStorage sp_artskins)
function artSnakes(){ let L = []; try{ L = JSON.parse(ls('sp_artskins') || '{}').list || []; }catch(e){} return L.filter(a => a && a.id && ['scarf', 'cape', 'bag', 'flag', 'basket', 'hat', 'pshape', 'pspin'].indexOf(a.k) >= 0).slice(0, 12); }
function mySkin(name, theme){
  const own = skinsOf(name), steps = own.worlds[theme] || [0], p = skinPick(name);
  let step = p.s && p.s[theme] != null ? Number(p.s[theme]) : Math.max.apply(null, steps); if(steps.indexOf(step) < 0) step = Math.max.apply(null, steps);
  let type = p.type || 'garden'; if((own.types || ['garden']).indexOf(type) < 0) type = 'garden';
  const art = p.art ? artSnakes().find(a => a.id === p.art) : null;
  return {step, type, art};
}
function drawPreviewRider(g, st, si, x, y, k, face, t){ const av = st.avs[si]; if(!av) return; drawAvatar(g, {name: 'p', av, dir: face}, x, y, k, {t, pose: RIDE_POSE, still: true}); }
function drawFxGrid(g, st, cell){
  st.fx.forEach(f => { const q = f.t / f.life;
    if(f.k === 'spark'){ const x = (f.x + 0.5) * cell, y = (f.y + 0.5) * cell; g.save(); g.globalAlpha = 1 - q; g.strokeStyle = f.c; g.lineWidth = 2; for(let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2, r1 = cell * (0.3 + q * 0.5), r2 = r1 + cell * 0.2; g.beginPath(); g.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); g.stroke(); } g.restore(); }
    else if(f.k === 'txt'){ const x = (f.x + 0.5) * cell, y = (f.y + 0.5) * cell - q * cell; g.save(); g.globalAlpha = 1 - q * q; fxText(g, f.txt, x, y, Math.max(14, cell * 0.6), f.gold); g.restore(); }
  });
}
// text with an emoji in it: emoji from the sprite cache, words by fillText
function fxText(g, txt, x, y, size, gold){
  const parts = Array.from(txt), isE = ch => /\p{Extended_Pictographic}/u.test(ch);
  g.font = '900 ' + Math.round(size) + 'px Fredoka, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
  const segs = []; let buf = ''; parts.forEach(ch => { if(isE(ch)){ if(buf){ segs.push({t: buf}); buf = ''; } segs.push({e: ch}); } else if(ch === '️' || ch === '‍'){ if(segs.length && segs[segs.length - 1].e) segs[segs.length - 1].e += ch; } else buf += ch; }); if(buf) segs.push({t: buf});
  const w = segs.reduce((m, s) => m + (s.e ? size * 1.05 : g.measureText(s.t).width), 0); let cx = x - w / 2;
  segs.forEach(s => { if(s.e){ emo(g, s.e, cx + size * 0.52, y, size); cx += size * 1.05; } else { g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.strokeText(s.t, cx, y); g.fillStyle = gold ? '#FFC845' : '#fff'; g.fillText(s.t, cx, y); cx += g.measureText(s.t).width; } });
}

/* ---------- 🧭 arena painter ---------- */
function gateView(W, H, st, seat){
  const M = st.M, s = M.snakes[seat] || M.snakes[0], base = Math.min(W, H) / 17, z = base / (1 + Math.max(0, s.len - 10) / 160);
  const cam = st.cam[seat] || st.cam[0], tx = s.alive ? s.x : cam.x, ty = s.alive ? s.y : cam.y;
  if(!cam.ready){ cam.x = tx; cam.y = ty; cam.z = z; cam.ready = true; } else { cam.x += (tx - cam.x) * 0.15; cam.y += (ty - cam.y) * 0.15; cam.z += (z - cam.z) * 0.05; }
  return {sc: cam.z, cx: cam.x, cy: cam.y};
}
function drawGate(g, W, H, st){
  const M = st.M, hs = M.snakes.filter(s => s.human).map(s => s.i);
  if(hs.length > 1){
    const a = M.snakes[hs[0]], b = M.snakes[hs[1]], far = Math.hypot(a.x - b.x, a.y - b.y) * (Math.min(W, H) / 17) > Math.min(W, H) * 0.7;
    if(far){ const side = W >= H; [0, 1].forEach(k => { g.save(); const r = side ? [k * W / 2, 0, W / 2, H] : [0, k * H / 2, W, H / 2]; g.beginPath(); g.rect(r[0], r[1], r[2], r[3]); g.clip(); g.translate(r[0], r[1]); gatePaint(g, r[2], r[3], st, gateView(r[2], r[3], st, hs[k])); g.restore(); });
      g.fillStyle = '#fff'; if(side) g.fillRect(W / 2 - 1.5, 0, 3, H); else g.fillRect(0, H / 2 - 1.5, W, 3); drawMini(g, W, H, st); return; }
    // shared camera between the two
    const cam = st.cam[0], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, need = Math.hypot(a.x - b.x, a.y - b.y) + 8, sc = Math.min(Math.min(W, H) / 17, Math.min(W, H) / need);
    if(!cam.ready){ Object.assign(cam, {x: mx, y: my, z: sc, ready: true}); } else { cam.x += (mx - cam.x) * 0.12; cam.y += (my - cam.y) * 0.12; cam.z += (sc - cam.z) * 0.08; }
    gatePaint(g, W, H, st, {sc: cam.z, cx: cam.x, cy: cam.y}); drawMini(g, W, H, st); return;
  }
  gatePaint(g, W, H, st, gateView(W, H, st, hs[0] || 0)); drawMini(g, W, H, st);
}
function gatePaint(g, W, H, st, V){
  const M = st.M, T = THEMES[st.theme], t = performance.now() / 1000, sc = V.sc;
  const X = x => W / 2 + (x - V.cx) * sc, Y = y => H / 2 + (y - V.cy) * sc;
  g.fillStyle = T.out; g.fillRect(-20, -20, W + 40, H + 40);
  // arena floor + grid
  g.save(); g.beginPath(); g.arc(X(0), Y(0), M.R * sc, 0, 7); g.fillStyle = T.bg[1]; g.fill(); g.clip();
  const step = 2, x0 = Math.floor((V.cx - W / 2 / sc) / step) * step, x1 = V.cx + W / 2 / sc, y0 = Math.floor((V.cy - H / 2 / sc) / step) * step, y1 = V.cy + H / 2 / sc;
  g.fillStyle = T.bg[0]; for(let x = x0; x < x1; x += step) for(let y = y0; y < y1; y += step) if(((x + y) / step) % 2 === 0) g.fillRect(X(x), Y(y), step * sc + 0.5, step * sc + 0.5);
  if(T.stars){ g.fillStyle = 'rgba(255,255,255,0.5)'; for(let x = x0; x < x1; x += step) for(let y = y0; y < y1; y += step){ const h = ((x * 73856093) ^ (y * 19349663)) >>> 0; if(h % 5 === 0) g.fillRect(X(x + (h % 7) / 4), Y(y + (h % 11) / 6), 1.5, 1.5); } }
  // decor (sparse, from a hash of the tile)
  for(let x = x0; x < x1; x += step * 3) for(let y = y0; y < y1; y += step * 3){ const h = ((x * 92821) ^ (y * 68917)) >>> 0; if(h % 4 === 0) emo(g, T.decor[h % T.decor.length], X(x + 1), Y(y + 1), sc * 1.1, 0.3); }
  g.restore();
  g.strokeStyle = M.L.edge === 'soft' ? 'rgba(255,255,255,0.6)' : M.L.edge === 'shrink' ? 'rgba(255,60,60,' + (0.6 + 0.3 * Math.sin(t * 6)) + ')' : 'rgba(255,90,78,0.85)';
  g.lineWidth = Math.max(3, sc * 0.35); g.beginPath(); g.arc(X(0), Y(0), M.R * sc, 0, 7); g.stroke();
  const inView = (x, y, m) => X(x) > -m && X(x) < W + m && Y(y) > -m && Y(y) < H + m;
  // dots
  M.dots.forEach(d => { if(!inView(d.x, d.y, 30)) return; const x = X(d.x), y = Y(d.y), pul = 1 + Math.sin(t * 5 + d.x * 3) * 0.12;
    if(SN.POWERS[d.k]){ emo(g, SN.POWERS[d.k].icon, x, y, sc * 1.3 * pul); return; }
    const r = sc * (d.big ? 0.42 : 0.22) * pul; g.fillStyle = COL_HEX[d.c] + '44'; g.beginPath(); g.arc(x, y, r * 2, 0, 7); g.fill(); g.fillStyle = COL_HEX[d.c]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    if(d.big && sc > 14) emo(g, T.food[(Math.abs(Math.round(d.x * 3))) % T.food.length], x, y, sc * 0.75); });
  // quest flag
  M.snakes.forEach(s => { if(s.human && s.quest && s.quest.kind === 'visit'){ const x = X(s.quest.x), y = Y(s.quest.y); g.fillStyle = 'rgba(255,200,69,0.25)'; g.beginPath(); g.arc(x, y, sc * 2.2, 0, 7); g.fill(); emo(g, '🚩', x, y, sc * 1.6); } });
  // snakes
  const riders = [];
  M.snakes.forEach((s, si) => {
    if(!s.alive) return; const col = st.cols[si] || T.body, r = SN.radius(s) * sc;
    if(!s.pts.some(p => inView(p[0], p[1], r * 3))) return;
    const sp = s.pts.map(p => [X(p[0]), Y(p[1])]), lk = lookFor(st, si); if(s.ghostT > 0 || s.inv > 0 && Math.floor(t * 10) % 2) lk.alpha = 0.55;
    if(s.boosting){ g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = r * 2.6; g.beginPath(); sp.slice(0, 8).forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore(); }
    snakeBody(g, sp, r, lk, t, {ang: s.ang});
    const hx = X(s.x), hy = Y(s.y), ca = Math.cos(s.ang);
    riders.push({si, x: hx, y: hy, face: ca >= 0 ? 1 : -1, s, r});
  });
  riders.forEach(o => { const k = Math.max(0.24, o.r * 2.6 / 70) * (o.s.human ? 1.15 : 1);
    if(o.s.boss){ emo(g, o.s.icon || '👑', o.x, o.y - o.r * 1.2, o.r * 3.2); emo(g, '👑', o.x, o.y - o.r * 3, o.r * 1.4); return; }
    drawRider(g, o.si, o.x, o.y - o.r * 0.3, k, o.face, (o.s.turning || 0) * o.face, t);
    if(!o.s.human && k > 0.3){ const nm = snakeName(o.s), fs = Math.max(10, Math.min(14, k * 26)); g.font = '800 ' + fs + 'px Nunito, sans-serif'; const w = g.measureText(nm.replace('🤖 ', '')).width + fs * (nm.indexOf('🤖') === 0 ? 2.2 : 1); g.fillStyle = 'rgba(0,0,0,0.45)'; rrect(g, o.x - w / 2, o.y - k * 92 - fs, w, fs * 1.5, fs * 0.7); g.fill(); g.fillStyle = '#fff'; fxTextPlain(g, nm, o.x, o.y - k * 92 - fs * 0.25, fs); }
  });
  // fx
  st.fx.forEach(f => { const q = f.t / f.life;
    if(f.k === 'burst'){ const x = X(f.x), y = Y(f.y), r = sc * (f.big ? 3 : 1.8) * (0.3 + q); g.save(); g.globalAlpha = 1 - q; g.strokeStyle = '#FFE36E'; g.lineWidth = 3; for(let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); } emo(g, '💥', x, y, sc * 1.6 * (1 - q * 0.5)); g.restore(); }
    else if(f.k === 'spark'){ const x = X(f.x), y = Y(f.y); g.save(); g.globalAlpha = 1 - q; g.fillStyle = f.c; g.beginPath(); g.arc(x, y, sc * 0.5 * (1 + q), 0, 7); g.fill(); g.restore(); }
    else if(f.k === 'txt'){ g.save(); g.globalAlpha = 1 - q * q; fxText(g, f.txt, X(f.x), Y(f.y) - q * sc * 1.5, Math.max(14, sc * 0.9), f.gold); g.restore(); }
  });
}
function fxTextPlain(g, txt, x, y, fs){ if(txt.indexOf('🤖') === 0){ const w = g.measureText(txt.slice(3)).width; emo(g, '🤖', x - w / 2 - fs * 0.1, y, fs); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt.slice(3), x - w / 2 + fs * 0.55, y); } else { g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y); } }
function drawMini(g, W, H, st){
  const M = st.M, R = Math.min(56, Math.min(W, H) * 0.12), cx = W - R - 10, cy = R + 10, k = R / M.R0;
  g.save(); g.globalAlpha = 0.85; g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.arc(cx, cy, R + 3, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, M.R * k, 0, 7); g.stroke();
  M.snakes.forEach((s, i) => { if(!s.alive) return; g.fillStyle = s.human ? '#fff' : st.cols[i]; g.beginPath(); g.arc(cx + s.x * k, cy + s.y * k, s.human ? 3.5 : Math.max(1.5, Math.min(3, s.len / 20)), 0, 7); g.fill(); });
  g.restore();
}

/* ================= TOUCH CONTROLS ================= */
function buildControls(){
  const touch = isTouch(), hs = G.seats.length, bottom = $('bottom'), corners = $('corners'), play = $('scr-play');
  bottom.innerHTML = ''; corners.innerHTML = ''; play.classList.remove('side'); play.classList.toggle('port', touch && hs === 1 && G.mode !== 'gate' && window.innerHeight > window.innerWidth * 1.15);
  document.querySelectorAll('.ctl-side').forEach(e => e.remove());
  const legend = '<div class="legend">' + (G.mode === 'gate' ? '<span>Steer: <b>arrows / WASD</b></span><span>💨 Boost: <span class="kk">' + keyName(KEYS[0].boost) + '</span> <span class="kk">Shift</span></span>' : '<span>Turn: <b>arrows / WASD</b></span>') + (skillsOn() ? '<span>⚡ Skill: <span class="kk">Space</span></span>' : '') + '<span><span class="kk">P</span> pause</span></div>';
  if(!touch){ bottom.innerHTML = legend; if(skillsOn()) bottom.insertAdjacentHTML('beforeend', ''); return; }
  if(hs > 1){ for(let i = 0; i < hs; i++) corners.appendChild(makeCtl(i, true)); return; }
  const side = window.innerWidth > window.innerHeight && window.innerHeight < 620;
  if(side){ play.classList.add('side'); const L = document.createElement('div'); L.className = 'ctl-side pz-l'; L.appendChild(makePad(0)); const R = document.createElement('div'); R.className = 'ctl-side pz-r'; R.appendChild(pzRing(makeBtns(0)));
    $('arena').insertBefore(L, $('stage')); $('arena').appendChild(R); if(window.UI && UI.pad) UI.pad.arcAll(play); return; }
  const wrap = document.createElement('div'); wrap.className = 'ctl-wrap pz-wrap'; wrap.appendChild(makePad(0)); wrap.appendChild(pzRing(makeBtns(0))); bottom.appendChild(wrap); if(window.UI && UI.pad) UI.pad.arcAll(play);
}
// 🕹️ pz-1 PADS (✨ polish chat): one player = the shared look + the 🌼 ring (💨 Boost main in Snakigate, else ⚡ Skill)
function pzRing(box){ if(!(window.UI && UI.pad) || !box) return box; const sk = box.querySelector('.tb.skl'), bs = box.querySelector('.tb.bst');
  if(sk){ UI.pad.dress(sk, null, null, '#FFC845'); const sm = sk.querySelector('small'); if(sm) sm.outerHTML = '<span class="nm">Skill</span>'; }
  if(bs) UI.pad.dress(bs, '💨', 'Boost', '#7CC8FF'); const main = bs || sk; if(!main) return box; main.classList.add('pz-main');
  box.querySelectorAll('.tb').forEach(b => b.style.removeProperty('--b')); return UI.pad.fan(box, main, [bs && sk].filter(Boolean)) || box; }
function makeCtl(si, corner){ const d = document.createElement('div'); d.className = 'corner c' + si; d.appendChild(makePad(si)); d.appendChild(makeBtns(si)); return d; }
function makeBtns(si){
  const d = document.createElement('div'); d.className = 'tbtns'; d.style.gap = 'var(--pad-gap, 18px)';
  if(skillsOn()) d.insertAdjacentHTML('beforeend', '<button class="tb skl" data-seat="' + si + '" data-sound="none"><span class="ic">⚡</span><span class="n"></span><small>skill</small></button>');
  if(G.mode === 'gate') d.insertAdjacentHTML('beforeend', '<button class="tb bst" data-seat="' + si + '" data-sound="none">💨<small>boost</small></button>');
  d.querySelectorAll('.tb').forEach(b => {
    let lpT = 0, lastTap = 0;
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); b.classList.add('down');
      if(b.classList.contains('bst')) G.padBoost[si] = true;
      else { const now = performance.now(); if(now - lastTap < 300){ SN.switchSkill(G.M, si); lastTap = 0; return; } lastTap = now; lpT = setTimeout(() => { lpT = 0; SN.switchSkill(G.M, si); UISound.play('key'); }, 550); } });
    const up = () => { b.classList.remove('down'); if(b.classList.contains('bst')) G.padBoost[si] = false; else if(lpT){ clearTimeout(lpT); lpT = 0; useSkillSeat(si); } };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
  });
  return d;
}
/* 🐍 24s SNAKE-AWARE STICK (✨ polish chat, Aowu 2026-11-17 07:09 "it is 8 direction playing in 4 so sometime a left can go up").
   The thumb can push any way, the grid snake only goes ↑ ↓ ◀ ▶ and only ever turns 90°. So the stick reads the part of the push
   that can turn the snake: heading ↑ / ↓ → only ◀ ▶ count, heading ◀ ▶ → only ↑ ↓ count ("heading" = the last queued turn).
   • a slanted push (up-left while going up) = the useful turn from ~27° off the heading line (was: within 32° of the turn line);
   • a push along the heading = "keep going" (cancels a waiting stick turn, r36) — a straight-ish push never turns by itself;
   • a turn just made is HELD while the thumb still points that way (the next turn needs ×1.25 more), so a held diagonal never zigzags;
   • the pad's own ▲ ▼ ◀ ▶ glow shows the turn. 🧭 Snakigate (free steering) and keys / swipes are unchanged. */
const SN_STICK = {on: 0.5, off: 0.3, perp: 0.45, ratio: 0.5, hold: 1.25};
function snStickDir(v, base, st){
  const K = SN_STICK, cur = st && st.dir;
  if(v.m < (cur ? K.off : K.on)) return null;
  const horiz = d => d === 'l' || d === 'r', comp = d => d === 'r' ? v.x : d === 'l' ? -v.x : d === 'd' ? v.y : -v.y;
  if(!base) return Math.abs(v.x) >= Math.abs(v.y) ? (v.x > 0 ? 'r' : 'l') : (v.y > 0 ? 'd' : 'u');   // no snake: plain 4-way
  const H = horiz(base), perp = H ? v.y : v.x, par = H ? v.x : v.y;
  let d = null;
  if(Math.abs(perp) >= K.perp && Math.abs(perp) >= Math.abs(par) * K.ratio) d = H ? (perp > 0 ? 'd' : 'u') : (perp > 0 ? 'r' : 'l');   // the useful turn
  else if(Math.abs(par) >= (cur ? K.off : K.perp)) d = H ? (par > 0 ? 'r' : 'l') : (par > 0 ? 'd' : 'u');                              // along the heading = keep going
  if(d && cur && st.turned && d !== cur && comp(cur) > 0 && comp(d) < comp(cur) * K.hold) d = cur;                                      // hold a turn just made
  return d;
}
function snHeading(si){ const s = G && G.M && G.M.snakes && G.M.snakes[si]; return s ? (s.q && s.q.length ? s.q[s.q.length - 1] : s.dir) || null : null; }
window.snStickDir = snStickDir; window.snHeading = snHeading;
function makePad(si){
  const p = document.createElement('div'); p.className = 'tpad'; p.dataset.seat = si;
  p.innerHTML = '<div class="knob"></div><span class="ar u">▲</span><span class="ar d">▼</span><span class="ar l">◀</span><span class="ar r">▶</span>';
  const knob = p.querySelector('.knob'); let id = null;
  const T = UI.stickTracker(p);   // r33: follow-the-thumb stick (UiKit) — turns after ~6 px of slide
  const flip = v => { const corner = p.closest('.corner'); if(corner && (corner.classList.contains('c1') || corner.classList.contains('c2'))){ const sx = corner.classList.contains('c2') ? 1 : -1; v.x *= sx; v.fx *= sx; v.ax *= sx; v.y = -v.y; v.fy = -v.fy; v.ay = -v.ay; } return v; };   // seats across the table: their pad is turned round
  const move = (e, first) => { const v = flip(first ? T.start(e) : T.at(e)), R = v.R, q = Math.min(1, Math.hypot(v.fx, v.fy) / 0.7), a = Math.atan2(v.fy, v.fx);
    knob.style.transform = 'translate(' + (Math.cos(a) * q * R * 0.45) + 'px,' + (Math.sin(a) * q * R * 0.45) + 'px)';
    if(G.mode === 'gate'){   // r36: aim = where the thumb is from where it landed (a relaxed thumb never U-turns the snake); tiny dead zone keeps the last aim
      const am = Math.hypot(v.ax, v.ay); if(am < 0.2) return;
      const a2 = Math.atan2(v.ay, v.ax), dir = Math.abs(v.ax) >= Math.abs(v.ay) ? (v.ax > 0 ? 'r' : 'l') : (v.ay > 0 ? 'd' : 'u');
      G.padAim[si] = a2; p.querySelectorAll('.ar').forEach(x => x.classList.toggle('lit', x.classList.contains(dir))); return; }
    const dir = UI.stickDir(v, p.__lit || null); p.__lit = dir;
    if(!dir) return;
    p.querySelectorAll('.ar').forEach(x => x.classList.toggle('lit', x.classList.contains(dir)));
    if(p.__dir !== dir){ p.__dir = dir; turnSeat(si, dir, true); try{ navigator.vibrate && navigator.vibrate(8); }catch(err){} } };
  p.addEventListener('pointerdown', e => { e.preventDefault(); id = e.pointerId; try{ p.setPointerCapture(id); }catch(err){} p.__dir = null; p.__lit = null; p.__st = null; move(e, true); });
  UI.onFastMove(p, e => { if(e.pointerId === id) move(e); });
  const end = e => { if(e.pointerId !== id) return; id = null; knob.style.transform = ''; p.__dir = null; p.__lit = null; p.__st = null; p.querySelectorAll('.ar').forEach(a => a.classList.remove('lit')); };
  p.addEventListener('pointerup', end); p.addEventListener('pointercancel', end);
  return p;
}
// swipe on the field (grid modes) · press-and-hold on the field steers toward your finger (Snakigate)
(function(){
  let sw = null;
  document.addEventListener('pointerdown', e => { if(!G || e.target !== $('cv')) return; sw = {x: e.clientX, y: e.clientY, id: e.pointerId}; if(G.mode === 'gate') steerTo(e); });
  document.addEventListener('pointermove', e => { if(!G || !sw || e.pointerId !== sw.id) return;
    if(G.mode === 'gate'){ steerTo(e); return; }
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y; if(Math.hypot(dx, dy) < 28) return;   // r36: 28 px (was 22) and a clear line — a resting finger or a diagonal smear doesn't turn
    if(Math.max(Math.abs(dx), Math.abs(dy)) < Math.min(Math.abs(dx), Math.abs(dy)) * 1.4){ sw.x = e.clientX; sw.y = e.clientY; return; }
    turnSeat(0, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u')); sw.x = e.clientX; sw.y = e.clientY; });
  const end = e => { if(sw && e.pointerId === sw.id){ sw = null; if(G && G.mode === 'gate') G.padAim[0] = null; } };
  document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
  function steerTo(e){ const r = $('cv').getBoundingClientRect(), s = G.M.snakes[0], cam = G.cam[0]; if(!s.alive) return; const hx = r.left + r.width / 2 + (s.x - cam.x) * cam.z, hy = r.top + r.height / 2 + (s.y - cam.y) * cam.z; G.padAim[0] = Math.atan2(e.clientY - hy, e.clientX - hx); }
})();

/* ================= KEYBOARD ================= */
const KEYHELD = new Set();
const ARROW_DIR = {up: 'u', down: 'd', left: 'l', right: 'r'};
document.addEventListener('keydown', e => {
  if(takeKey(e)) return;
  if(!G || $('scr-play').classList.contains('hidden')) return;
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
  if(e.repeat){ KEYHELD.add(e.code); return; }
  KEYHELD.add(e.code);
  if(e.code === 'KeyP' || e.code === 'Escape'){ togglePause(); return; }
  if(G.paused || G.over) return;
  const solo = G.seats.length === 1;
  G.seats.forEach((st, si) => {
    const sets = solo ? [KEYS[0], KEYS[1]] : [KEYS[si]];
    sets.forEach(K => { Object.keys(ARROW_DIR).forEach(a => { if(K[a] === e.code) turnSeat(si, ARROW_DIR[a]); }); if(K.skill === e.code) useSkillSeat(si); });
  });
  if(solo && (e.code === 'Space')) useSkillSeat(0);
});
document.addEventListener('keyup', e => { KEYHELD.delete(e.code); });
window.addEventListener('blur', () => KEYHELD.clear());
document.addEventListener('visibilitychange', () => { if(document.hidden && G && !G.over && !G.paused) togglePause(); });
function togglePause(){ if(!G || G.over) return; G.paused = !G.paused; UI.pauseIcon($('pause-btn'), G.paused); banner(G.paused ? '⏸ Paused — P or ▶ to go on' : '▶ Go!', 'good', G.paused ? 600000 : 700); }
function pauseGame(){ if(G && !G.over && !G.paused) togglePause(); }
function leavePlay(){ if(G && !G.over){ G.paused = true; UI.confirm({icon: '🐍', title: 'Leave this game?', body: 'The game ends and is not saved.', okText: 'Leave', cancelText: 'Stay'}).then(ok => { if(ok) backToMenu(); else if(G){ G.paused = false; UI.pauseIcon($('pause-btn'), false); } }); return; } backToMenu(); }
function backToMenu(){ if(window.Cheer) Cheer.unmount(); stopLoop(); musicStop(); hideResult(); G = null; KEYHELD.clear(); if(window.afterGameMenu && window.afterGameMenu()) return; renderMenu(); showScreen('menu'); }


/* ================= 💥 COMICS (ck-2c) — ComicKit wires itself through this (Comic.WIRES.snakeast); the game never calls Comic directly ================= */
window.GameComic = (function(){ const L = []; return {
  listen(fn){ L.push(fn); },
  _feed(mode, list, M){ (list || []).forEach(e => L.forEach(fn => { try { fn(mode, e, M); } catch(err){} })); },
  _reset(mode){},
  hold(v){ if(!G || G.over) return false; G.hold = !!v; return true; },   // freezes the snakes while a comic page is open (loop checks G.hold)
  mode(){ return G ? G.mode : null; }
}; })();

/* ================= RESULT + SAVE ================= */
function gameOver(){
  const M = G.M; G.over = true; musicStop();
  cheerEnd();   /* 📣 cs-2b: win / lose crowd */
  if(window.GameComic) GameComic._feed(G.mode, [{k: 'gameOver', winner: M.winner, why: M.why}], M);   /* 💥 ck-2c: winner page */
  const hs = humanIdx(), solo = hs.length === 1, me = M.snakes[0], won = M.winner === 0;
  // win: curl + dance + fireworks · lose: facepalm then clap for the winner
  hs.forEach(i => { if(M.winner === i){ react(i, pickOne(EPIC_DANCES && EPIC_DANCES.length ? EPIC_DANCES : [gestK('dance')]) || gestK('dance'), 9); G.reacts[i].keep = true; } else { react(i, FACEPALM, 1.6); setTimeout(() => { if(G && G.over) react(i, gestK('clap'), 9); }, 1600); } });
  if(M.winner >= 0 && FX) confetti(['🎉', '✨', THEMES[G.theme].gold, '🐍', '⭐'], 26);
  UISound.play(won || (!solo && M.winner >= 0) || G.endless ? 'success' : 'error');
  setTimeout(() => { if(G && G.over && !G.shown) showEnd(); }, FX ? 1500 : 0);
}
function showEnd(){
  G.shown = true;
  if(window.storyEnd && G.story) { window.storyEnd(); return; }
  const M = G.M, hs = humanIdx(), solo = hs.length === 1, me = M.snakes[0], won = M.winner === 0, secs = Math.max(1, Math.round(M.t)), gid = MODES[G.mode].id;
  const mult = (G.SZ && !G.endless && G.SZ.mult) || 1, stars = solo ? SN.stars(M, 0) : 0, score = Math.round(SN.score(M, 0) * mult), L = SN.lenOf(M, me);   /* 🗺️ p3e: × size */
  let head;
  if(G.endless) head = '<div class="big">♾️</div><h2 class="cheer">' + L + ' long!</h2>';
  else if(solo && G.mode === 'castle') head = won ? '<canvas class="win" id="win-cv" width="360" height="300"></canvas><h2 class="cheer">' + (M.win ? 'You own ' + Math.floor(me.land) + ' % — castle complete!' : 'Biggest land: ' + Math.floor(me.land) + ' %!') + '</h2>' : '<div class="big">🏰</div><h2>' + (M.why === 'out' ? 'Trail cut — out!' : M.why === 'land' || M.why === 'time' ? snakeName(M.snakes[M.winner] || me) + ' got more land' : 'The map is full') + '</h2>';
  else if(solo) head = won ? '<canvas class="win" id="win-cv" width="360" height="300"></canvas><h2 class="cheer">' + (G.mode === 'gate' ? (M.why === 'last' ? 'Last snake riding!' : 'Longest snake!') : 'You reached ' + M.target + '!') + '</h2>'
    : '<div class="big">🐍</div><h2>' + (G.mode === 'gate' ? (M.why === 'out' ? 'Out of lives' : snakeName(M.snakes[M.winner] || me) + ' was longer') : 'Bonk — game over') + '</h2>';
  else head = M.winner >= 0 ? '<canvas class="win" id="win-cv" width="360" height="300"></canvas><h2 class="cheer">' + UI.esc(M.snakes[M.winner].name) + ' wins!</h2>' : '<div class="big">🤝</div><h2>Both out — a draw!</h2>';
  const tips = G.mode === 'castle' ? ['Small loops are safe loops — come home often!', 'Eat food to draw longer trails.', 'Watch out for snakes near your trail — hurry home!'] : G.mode === 'gate' ? ['Big snakes are slow to turn — cut in front of them!', 'Boost only when it\'s safe: it costs length.', 'Popped snakes leave big glowing food — grab it!'] : ['Plan your turn one square early.', 'Leave yourself a way out — don\'t curl into a corner.', 'Golden food = +3 — worth a detour.'];
  const rank = G.mode === 'gate' ? SN.gateRank(M).findIndex(s => s.i === 0) + 1 : 0;
  showResult(head + '<div class="score-big">⭐ ' + score.toLocaleString() + '</div>' + (G.SZ && G.SZ.label && !G.story ? '<div class="note">🗺️ ' + G.SZ.label + (mult > 1 ? ' · ×' + mult + ' points' : '') + '</div>' : '') +
    (solo && won && !G.endless ? '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '" style="animation-delay:' + (i * 0.15) + 's">⭐</span>').join('') + '</div>' : '') +
    '<div class="stats"><span>🐍 longest ' + me.maxLen + '</span><span>🍎 ' + me.eaten + ' eaten</span>' + (me.gold ? '<span>✨ ' + me.gold + ' golden</span>' : '') + (G.mode === 'gate' ? '<span>💥 ' + me.popped + ' popped</span><span>🏅 #' + rank + '</span>' : '') + (G.mode === 'castle' ? '<span>🏰 ' + Math.floor(me.land) + ' % land</span><span>🚩 ' + me.flags + ' flags</span>' + (me.cuts ? '<span>✂️ ' + me.cuts + ' cuts</span>' : '') : '') + (me.skillsUsed ? '<span>⚡ ' + me.skillsUsed + ' skills</span>' : '') + '<span>⏱ ' + fmtS(secs) + '</span></div>' +
    (!solo ? '<div class="stats">' + hs.slice(1).map(i => { const s = M.snakes[i]; return '<span>' + UI.esc(s.name) + ': 🐍 ' + s.maxLen + ' · 🍎 ' + s.eaten + '</span>'; }).join('') + '</div>' : '') +
    (solo && !won && !G.endless ? '<div class="note">💡 ' + pickOne(tips) + '</div>' : '') + '<div class="save-note" id="save-note">' + (hs.some(i => !/^Guest/.test(M.snakes[i].name)) ? '💾 Saving…' : '') + '</div>' +
    '<div class="res-btns"><button class="btn sp-btn sp-primary" data-sound="pop" onclick="startGame()">🔁 Again</button><button class="btn soft sp-btn sp-secondary" data-sound="none" onclick="backToMenu()">🎚️ Levels</button><button class="btn soft sp-btn sp-secondary" data-sound="none" onclick="goGameroom()">🕹️ Gameroom</button></div>');
  winPic();
  NOTES.length = 0;
  hs.forEach((i, seat) => {
    const s = M.snakes[i], w = M.winner === i; if(/^Guest/.test(s.name)) return;
    const stats = statsFor(M, s, w, solo);
    if(G.endless){ stats['end' + G.level] = SN.score(M, i); stats.endless = SN.score(M, i); saveFeatsOnly(s.name, stats, seat, gid); if(!S.endless[s.name]) S.endless[s.name] = {}; S.endless[s.name][G.level] = Math.max(S.endless[s.name][G.level] || 0, stats.endless); }
    else if(solo) saveWin(s.name, G.level, {score: Math.round(SN.score(M, i) * mult), stars: w ? stars : 0, cleared: w, timeSec: secs, theme: THEMES[G.theme].name + (G.SZ && G.SZ.label && !G.story ? ' · ' + G.SZ.label : ''), stats}, seat, gid);
    else saveFeatsOnly(s.name, stats, seat, gid);
  });
}
function statsFor(M, s, won, solo){
  const st = {games: 1, eaten: s.eaten, longest: s.maxLen, skills: s.skillsUsed, wins: won && solo ? 1 : 0, duelWins: !solo && won ? 1 : 0};
  const w = G && G.theme; if(w){ st['g_' + w] = 1; st['f_' + w] = s.eaten; st['l_' + w] = s.maxLen; if(won && solo && !G.endless && !G.story) st['w_' + w] = G.level + 1; }   // 🐍 per-world skin evolution
  if(M.mode === 'feast'){ st.golds = s.gold; st.goldRow = s.goldRowBest; }
  if(M.mode === 'gate'){ st.popped = s.popped; }
  if(M.mode === 'castle'){ st.land = Math.round(s.land || 0); st.flags = s.flags || 0; st.cuts = s.cuts || 0; }
  return st;
}
function winPic(){
  // the snake curls into a stage and the winner dances on top (+ little fireworks)
  const c = $('win-cv'); if(!c || !G) return; const g = c.getContext('2d'), M = G.M, wi = M.winner, col = G.cols[wi] || THEMES[G.theme].body, T = THEMES[G.theme];
  const t0 = performance.now(), dance = pickOne(EPIC_DANCES && EPIC_DANCES.length ? EPIC_DANCES : [gestK('dance')]) || gestK('dance');
  const paint = () => { if(!document.body.contains(c) || !G) return; const t = (performance.now() - t0) / 1000; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
    for(let i = 0; i < 5; i++){ const a = (t * 0.8 + i * 1.3) % 1.6, x = 50 + ((i * 97) % 260), y = 90 - a * 40; if(a < 1){ g.globalAlpha = 1 - a; g.fillStyle = ['#FFC845', '#FF5A4E', '#6EE7F9', '#2FB862', '#FF4FA3'][i]; for(let k = 0; k < 8; k++){ const an = k / 8 * Math.PI * 2; g.beginPath(); g.arc(x + Math.cos(an) * a * 40, y + Math.sin(an) * a * 40, 3, 0, 7); g.fill(); } g.globalAlpha = 1; } }
    // coiled snake = a round stage
    for(let r = 3; r >= 0; r--){ g.fillStyle = r % 2 ? shade(col, 0.75) : col; g.beginPath(); g.ellipse(180, 250 - r * 14, 110 - r * 12, 26, 0, 0, 7); g.fill(); g.strokeStyle = shade(col, 0.55); g.lineWidth = 3; g.stroke(); }
    g.fillStyle = col; g.beginPath(); g.arc(290, 214, 18, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(296, 208, 5, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(297, 208, 2.5, 0, 7); g.fill();
    drawAvatar(g, {name: 'w', av: G.avs[wi], dir: 1, gest: {g: dance, t}}, 180, 214, 1.55, {t});
    requestAnimationFrame(paint); };
  paint();
}
const PENDING_KEY = 'sp_snake_pending';
const NOTES = [];
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => { const r = google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))); if(w.feats) r.saveFeats(w.name, w.gid, w.stats); else if(w.tale) r.saveSnaketale(w.name, w.data[0], w.data[1], w.data[2]); else r.saveLevelResult(w.gid, w.name, w.lvl, w.extra); }); }
function putNote(i, html){ NOTES[i] = html; const n = $('save-note'); if(n) n.innerHTML = NOTES.filter(Boolean).join('<br>'); }
function progStore(gid){ return gid === 'snakigate' ? S.progGate : gid === 'snakastle' ? S.progCastle : S.progress; }
function saveWin(name, lvlIdx, extra, seat, gid, tries){
  tries = tries || 0; const src = progStore(gid), p = src[name] || (src[name] = {unlocked: 0, tokens: [], best: []});
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res.best) best[lvlIdx] = res.best;
      src[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending(); putNote(seat, saveText(res, extra.cleared));
    }).withFailureHandler(() => {
      if(tries < 1){ setTimeout(() => saveWin(name, lvlIdx, extra, seat, gid, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl: lvlIdx, extra, gid}])); putNote(seat, '⚠️ Could not save yet — it will be sent again next time.');
    }).saveLevelResult(gid, name, lvlIdx, extra);
}
function saveFeatsOnly(name, stats, seat, gid){
  const who = UI.esc(name) + ': ';
  google.script.run.withSuccessHandler(res => putNote(seat, who + featText(res, '✅ Feats saved')))
    .withFailureHandler(() => { writePending(readPending().concat([{name, feats: true, stats, gid}])); putNote(seat, who + '⚠️ Will be sent next time.'); }).saveFeats(name, gid, stats);
}
function featText(fe, base){ let h = base || ''; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { h += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); } return h; }
function saveText(res, cleared){
  const h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : cleared ? (res.best && res.best.score ? 'Best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Saved') : '✅ Feats saved — win to unlock the next level';
  return featText(res.feats, h);
}
function showResult(html){ $('result-card').innerHTML = String(html).replace('<div class="res-btns">', '<div id="comic-strip-slot"></div><div class="res-btns">');   /* 💥 ck-2c: comic copy on the card */ $('result').classList.remove('hidden'); cheerFaces();   /* 📣 cs-2b */ }
function hideResult(){ $('result').classList.add('hidden'); }
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pickOne(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 p1c: ◀ = where you came from (Gameroom if we don't know)
window.feedbackContext = () => ({page: 'Snakize', game: MODES[G ? G.mode : SET.mode].id, level: G ? G.level : SET.level});
window.addEventListener('resize', () => { if(G && !$('scr-play').classList.contains('hidden')){ buildControls(); layout(); } });

/* ================= 🏰 SNAKASTLE painter (land, trails, flags, fire, camera) ================= */
function castleBox(W, H, n){
  const fit = Math.floor(Math.min(W / n, H / n));
  if(fit >= 15) return {cell: fit, fit: true};
  return {cell: Math.max(16, Math.min(30, Math.floor(Math.min(W, H) / 17))), fit: false};
}
function landLayer(st, T, n, cell){
  const M = st.M, key = M.landRev + ':' + cell + ':' + st.theme;
  if(st.landCache && st.landCache.key === key) return st.landCache.c;
  const sc = st.preview ? 1 : DPR, c = (st.landCache && st.landCache.c) || document.createElement('canvas'); c.width = Math.ceil(n * cell * sc); c.height = c.width;
  const g = c.getContext('2d'); g.setTransform(sc, 0, 0, sc, 0, 0); g.clearRect(0, 0, n * cell, n * cell);
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){
    const o = M.own[y * n + x]; if(!o) continue; const col = st.cols[o - 1] || T.body;
    g.fillStyle = col; g.globalAlpha = (x + y) % 2 ? 0.5 : 0.42; g.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5); g.globalAlpha = 1;
    // theme ground on the land (vines, coral, dance tiles…)
    if((x * 3 + y * 5) % 7 === 0) emo(g, T.decor[(x + y) % T.decor.length], (x + 0.5) * cell, (y + 0.5) * cell, cell * 0.6, 0.55);
    // a darker edge where the land ends
    g.fillStyle = shade(col, 0.6);
    const e = Math.max(1.5, cell * 0.1);
    if(y === 0 || M.own[(y - 1) * n + x] !== o) g.fillRect(x * cell, y * cell, cell, e);
    if(y === n - 1 || M.own[(y + 1) * n + x] !== o) g.fillRect(x * cell, (y + 1) * cell - e, cell, e);
    if(x === 0 || M.own[y * n + x - 1] !== o) g.fillRect(x * cell, y * cell, e, cell);
    if(x === n - 1 || M.own[y * n + x + 1] !== o) g.fillRect((x + 1) * cell - e, y * cell, e, cell);
  }
  st.landCache = {key, c};
  return c;
}
function castleView(W, H, st){
  const M = st.M, n = M.n, {cell, fit} = castleBox(W, H, n);
  if(fit) return {cell, ox: Math.floor((W - cell * n) / 2), oy: Math.floor((H - cell * n) / 2), fit};
  const s = M.snakes[0], h = s.body[0], cam = st.cam[0];
  const tx = (h[0] + 0.5) * cell, ty = (h[1] + 0.5) * cell;
  if(!cam.ready || cam.cell !== cell){ cam.x = tx; cam.y = ty; cam.ready = true; cam.cell = cell; } else { cam.x += (tx - cam.x) * 0.12; cam.y += (ty - cam.y) * 0.12; }
  const cx = Math.max(W / 2, Math.min(n * cell - W / 2, cam.x)), cy = Math.max(H / 2, Math.min(n * cell - H / 2, cam.y));
  return {cell, ox: Math.round(n * cell > W ? W / 2 - cx : (W - n * cell) / 2), oy: Math.round(n * cell > H ? H / 2 - cy : (H - n * cell) / 2), fit};
}
function drawCastle(g, W, H, st){
  const M = st.M, T = THEMES[st.theme], n = M.n, t = st.preview ? 1 : performance.now() / 1000, V = castleView(W, H, st), cell = V.cell;
  g.fillStyle = T.out; g.fillRect(-20, -20, W + 40, H + 40);
  g.save(); g.translate(V.ox, V.oy);
  g.drawImage(fieldCache(st, T, n, cell), 0, 0, n * cell, n * cell);
  g.drawImage(landLayer(st, T, n, cell), 0, 0, n * cell, n * cell);
  const C = (x, y) => [(x + 0.5) * cell, (y + 0.5) * cell];
  // trails: dashed stripes in the snake's colour
  M.snakes.forEach((s, si) => { if(!s.trailCells || !s.trailCells.length) return; const col = st.cols[si] || T.body, warn = s.trailCells.length > SN.maxTrail(M, s) * 0.75;
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.globalAlpha = 0.85; g.lineWidth = cell * 0.36; g.setLineDash([cell * 0.35, cell * 0.2]);
    g.beginPath(); s.trailCells.forEach((c, i) => { const [x, y] = C(c % n, (c / n) | 0); if(i) g.lineTo(x, y); else g.moveTo(x, y); }); const h = s.body[0], hp = C(h[0], h[1]); g.lineTo(hp[0], hp[1]); g.stroke();
    if(warn && Math.floor(t * 4) % 2){ g.setLineDash([]); g.strokeStyle = 'rgba(255,60,60,0.8)'; g.lineWidth = cell * 0.12; g.stroke(); }
    g.restore(); });
  // flags
  M.flags.forEach(f => { const [x, y] = C(f.x, f.y), age = M.t - f.t, pop = Math.min(1, age * 3); g.fillStyle = st.cols[f.by] || T.body; g.beginPath(); g.ellipse(x, y + cell * 0.3, cell * 0.28, cell * 0.12, 0, 0, 7); g.fill(); emo(g, '🚩', x + cell * 0.05, y - cell * 0.05 - (1 - pop) * cell, cell * 0.7 * (0.6 + pop * 0.4)); });
  // quest flag
  M.snakes.forEach(s => { if(s.human && s.quest && s.quest.kind === 'visit'){ const [x, y] = C(s.quest.x, s.quest.y); g.fillStyle = 'rgba(255,200,69,0.35)'; g.fillRect(x - cell / 2, y - cell / 2, cell, cell); emo(g, '⭐', x, y, cell * 0.8); } });
  // food + fire
  M.foods.forEach(f => { const [x, y] = C(f.x, f.y), bob = Math.sin(t * 4 + f.x) * cell * 0.05; if(f.k === 'n' || f.k === 'g'){ g.fillStyle = f.k === 'g' ? 'rgba(255,200,69,0.55)' : COL_HEX[f.c] + '66'; g.beginPath(); g.arc(x, y, cell * 0.44, 0, 7); g.fill(); } emo(g, foodChar(T, f), x, y + bob, cell * (f.k === 'g' ? 0.86 : 0.72)); });
  M.fires.forEach(f => { const [x, y] = C(f.x, f.y); g.fillStyle = 'rgba(255,90,30,0.3)'; g.beginPath(); g.arc(x, y, cell * 0.55, 0, 7); g.fill(); emo(g, '🔥', x, y - Math.abs(Math.sin(t * 8)) * cell * 0.08, cell * 0.9); });
  // snakes + riders
  const heads = []; M.snakes.forEach((s, si) => { const h = gridSnake(g, st, s, si, C, cell, T, t, s.tick); if(h) heads.push(h); });
  drawHeads(g, st, heads, cell, t);
  if(!st.preview) drawFxGrid(g, st, cell);
  g.restore();
  if(!V.fit && !st.preview){   // mini map of the land
    const S = Math.min(96, Math.min(W, H) * 0.22), x0 = W - S - 8, y0 = 8, lc = landLayer(st, T, n, cell);
    g.save(); g.globalAlpha = 0.92; g.fillStyle = T.bg[1]; g.fillRect(x0, y0, S, S); g.drawImage(lc, x0, y0, S, S); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x0, y0, S, S);
    const k = S / n; M.snakes.forEach((s, i) => { if(!s.alive) return; const h = s.body[0]; g.fillStyle = s.human ? '#fff' : st.cols[i]; g.beginPath(); g.arc(x0 + (h[0] + 0.5) * k, y0 + (h[1] + 0.5) * k, s.human ? 3.5 : 2.5, 0, 7); g.fill(); });
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1; g.strokeRect(x0 + (-V.ox) / cell * k, y0 + (-V.oy) / cell * k, W / cell * k, H / cell * k); g.restore();
  }
}
window.drawCastle = drawCastle;

/* ================= 📜 SNAKETALE — story chapters (plan 11y round 3) ================= */
const CHAPTERS = [
  {theme: 'dino',  name: 'Dino Jungle', item: 'dino eggs',     lost: 'baby dinos',  boss: {name: 'T-Rex King',    icon: '🦖', col: '#2E7D32'}, costume: 'Dino Ranger'},
  {theme: 'sea',   name: 'Aquarium',    item: 'pearls',        lost: 'little fish', boss: {name: 'Sleepy Kraken', icon: '🐙', col: '#8E24AA'}, costume: 'Deep-Sea Diver'},
  {theme: 'dance', name: 'Dance Hall',  item: 'gold records',  lost: 'dancers',     boss: {name: 'DJ Dragon',     icon: '🐲', col: '#D81B60'}, costume: 'Disco Star'},
  {theme: 'robot', name: 'Robot Time',  item: 'batteries',     lost: 'robot pups',  boss: {name: 'Mecha Viper',   icon: '🤖', col: '#455A64'}, costume: 'Robo Pilot'},
  {theme: 'space', name: 'Space',       item: 'planets',       lost: 'baby stars',  boss: {name: 'Comet Serpent', icon: '☄️', col: '#311B92'}, costume: 'Astronaut'},
  {theme: 'sky',   name: 'Sky Temple',  item: 'golden apples', lost: 'cloud lambs', boss: {name: 'Storm Serpent', icon: '🌩️', col: '#37474F'}, costume: 'Sky Knight'}
];
const TALE_DIFF = {easy: {lv: 0, k: 0.7, name: '🌱 Easy'}, normal: {lv: 1, k: 1, name: '🙂 Normal'}, hard: {lv: 2, k: 1.3, name: '🔥 Hard'}};
const STAGE_KIND = ['gold', 'grow', 'land', 'escape', 'lead', 'pop', 'boss'];
const STAGE_ICON = {gold: '', grow: '🐍', land: '🏰', escape: '🏃', lead: '🚩', pop: '💥', boss: ''};
let TALE = {};   // per player: {diff, st: {'ch-stage': stars}}
function taleOf(name){ return TALE[name] || (TALE[name] = {diff: 'normal', st: {}}); }
function taleStars(name, ch, si){ return Number(taleOf(name).st[ch + '-' + si]) || 0; }
function chapterDone(name, ch){ return taleStars(name, ch, 6) > 0; }
function chapterOpen(name, ch){ return ch === 0 || chapterDone(name, ch - 1); }
function stageOpen(name, ch, si){ return chapterOpen(name, ch) && (si === 0 || taleStars(name, ch, si - 1) > 0); }
function giverFor(ch, si){
  const fam = S.players.map(p => p.Name).filter(n => n !== S.player);
  if(!fam.length) return {name: 'Grandma Snake', av: defaultAvatar('Grandma Snake')};
  const n = fam[(ch * 7 + si * 3) % fam.length]; return {name: n, av: myAvatar(n)};
}
// one stage = a short game of one of the other modes with a story goal
function taleStage(ch, si, diffKey){
  const C = CHAPTERS[ch], D = TALE_DIFF[diffKey] || TALE_DIFF.normal, k = D.k * (1 + ch * 0.1), kind = STAGE_KIND[si], gv = giverFor(ch, si);
  const R = n => Math.max(1, Math.round(n * k));
  const T = THEMES[C.theme];
  let st;
  if(kind === 'gold'){ const need = R(3); st = {mode: 'feast', level: D.lv, story: {goal: 'gold', need, icon: T.gold}, engine: {target: Infinity}, par: 30 + need * 6, text: 'Oh no — I lost ' + need + ' ' + C.item + ' ' + T.gold + '! Can you find them?'}; }
  else if(kind === 'grow'){ const need = R(22); st = {mode: 'gate', level: D.lv, story: {goal: 'grow', need, time: 120, icon: '🐍'}, engine: {bots: 3}, par: 70, text: 'The big snakes are hungry! Grow to ' + need + ' long before the time runs out.'}; }
  else if(kind === 'land'){ const need = R(16); st = {mode: 'castle', level: Math.min(1, D.lv), story: {goal: 'land', need, icon: '🏰'}, engine: {bots: 1, mods: {botsCut: false}}, par: 60, text: 'Help me fence the farm — loop back home to claim ' + need + ' % of the land!'}; }
  else if(kind === 'escape'){ const need = R(25); st = {mode: 'feast', level: Math.max(1, D.lv), story: {goal: 'escape', need, time: need, icon: '⏱️'}, engine: {target: Infinity, mods: {falling: true, foods: 2, runaway: false}}, par: need + 1, text: 'Rocks are falling! ' + T.fall + ' Stay safe for ' + need + ' seconds!'}; }
  else if(kind === 'lead'){ const need = 3 + Math.floor(ch / 2) + (diffKey === 'hard' ? 1 : 0); st = {mode: 'feast', level: D.lv, story: {goal: 'lead', need, icon: '🚩'}, engine: {target: Infinity}, par: 25 + need * 8, text: 'The ' + C.lost + ' are lost! Lead them home — visit the ' + need + ' 🚩 flags in order.'}; }
  else if(kind === 'pop'){ const need = Math.max(1, Math.round((1 + ch * 0.35) * D.k)); st = {mode: 'gate', level: D.lv, story: {goal: 'pop', need, time: 150, icon: '💥'}, engine: {bots: 4}, par: 80, text: 'Naughty snakes took our food! Pop ' + need + ' of them — make them bump into your body.'}; }
  else { const len = R(40); st = {mode: 'gate', level: D.lv, story: {goal: 'boss', need: 1, time: 180, icon: C.boss.icon}, engine: {bots: 2, boss: {name: C.boss.name, icon: C.boss.icon, col: C.boss.col, len, spd: 0.85}}, par: 120, text: C.boss.name + ' ' + C.boss.icon + ' is here! Pop it — or be longer than it when the time is up!'}; }
  st.kind = kind; st.ch = ch; st.si = si; st.theme = C.theme; st.giver = gv; st.title = (si === 6 ? '👑 Boss: ' + C.boss.name : 'Stage ' + (si + 1)); st.key = ch + '-' + si;
  return st;
}
function renderTale(){
  const box = $('level-list'), me = S.player, tl = taleOf(me);
  $('level-head').textContent = '📜 Snaketale — 6 chapters, your family needs help!';
  box.innerHTML = '';
  CHAPTERS.forEach((C, ch) => {
    const open = chapterOpen(me, ch), done = chapterDone(me, ch), stars = [0, 1, 2, 3, 4, 5, 6].reduce((a, si) => a + taleStars(me, ch, si), 0), b = document.createElement('button');
    b.className = 'pick lvl chapter' + (open ? '' : ' locked'); b.dataset.ch = ch; b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (ch + 1) + '</span>' + (done ? '<span class="badge">🎁</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + THEMES[C.theme].icon + '</div><div class="nm">' + C.name + '</div><div class="dots">' + [0, 1, 2, 3, 4, 5, 6].map(si => '<i class="' + (taleStars(me, ch, si) ? 'on' : '') + (si === 6 ? ' boss' : '') + '"></i>').join('') + '</div>' +
      '<div class="sub">' + (open ? '⭐ ' + stars + '/21 · 🎁 ' + C.costume + ' costume' : '🔒 Finish chapter ' + ch + ' first') + '</div>';
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast('Beat ' + CHAPTERS[ch - 1].boss.name + ' first!'); return; } openChapter(ch); };
    box.appendChild(b);
  });
  const row = $('menu-row'); row.innerHTML = '<span class="note" style="align-self:center">Story level:</span>' + Object.keys(TALE_DIFF).map(k => '<button class="chip' + (tl.diff === k ? ' on' : '') + '" data-d="' + k + '" data-sound="tap">' + TALE_DIFF[k].name + '</button>').join('');
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { tl.diff = b.dataset.d; ls(store('tale_diff'), tl.diff); row.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); });
  $('leaders').innerHTML = '';
}
let TALE_CH = 0, TALE_FRIEND = '';
function openChapter(ch){
  TALE_CH = ch; const C = CHAPTERS[ch], me = S.player;
  $('tale-logo').textContent = THEMES[C.theme].icon; $('tale-title').textContent = 'Chapter ' + (ch + 1) + ' · ' + C.name; $('tale-sub').textContent = '🎁 Beat ' + C.boss.name + ' ' + C.boss.icon + ' to win the ' + C.costume + ' costume';
  const path = $('tale-path'); path.innerHTML = '';
  for(let si = 0; si < 7; si++){
    const st = taleStage(ch, si, taleOf(me).diff), open = stageOpen(me, ch, si), stars = taleStars(me, ch, si), b = document.createElement('button');
    b.className = 'stage' + (open ? '' : ' locked') + (si === 6 ? ' boss' : '') + (stars ? ' done' : ''); b.dataset.si = si; b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="n">' + (si === 6 ? '👑' : si + 1) + '</span><span class="ic">' + (st.story.icon || '') + '</span><span class="st">' + (stars ? '⭐'.repeat(stars) : open ? '▶' : '🔒') + '</span>';
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast('Finish the stage before first'); return; } openQuest(ch, si); };
    path.appendChild(b);
  }
  const next = [0, 1, 2, 3, 4, 5, 6].find(si => stageOpen(me, ch, si) && !taleStars(me, ch, si));
  openQuest(ch, next == null ? 6 : next);
  showTale();
}
function showTale(){ ['player', 'menu', 'setup', 'play'].forEach(s => $('scr-' + s).classList.add('hidden')); $('scr-tale').classList.remove('hidden'); $('back-btn').classList.remove('hidden'); UI.navScreen($('back-btn'), 'tale', NAV_INNER); window.scrollTo(0, 0); }
function openQuest(ch, si){
  const st = taleStage(ch, si, taleOf(S.player).diff), q = $('tale-quest');
  $('tale-path').querySelectorAll('.stage').forEach(b => b.classList.toggle('on', Number(b.dataset.si) === si));
  const fam = others();
  q.innerHTML = '<canvas id="giver-cv" width="150" height="170"></canvas><div class="bubble"><b>' + UI.esc(st.giver.name) + ':</b> ' + UI.esc(st.text) + '<div class="note" style="margin-top:6px">' + st.title + ' · ' + MODES[st.mode].icon + ' ' + MODES[st.mode].name + ' · ' + TALE_DIFF[taleOf(S.player).diff].name + '</div></div>' +
    '<div class="tale-go"><div class="chips" id="tale-friends"><button class="chip' + (!TALE_FRIEND ? ' on' : '') + '" data-n="" data-sound="tap">🙋 Just me</button>' + fam.concat(['Guest']).map(n => '<button class="chip' + (TALE_FRIEND === n ? ' on' : '') + '" data-n="' + UI.esc(n) + '" data-sound="tap">👥 + ' + (n === 'Guest' ? '🙂 Guest' : UI.esc(n)) + '</button>').join('') + '</div>' +
    '<button class="btn sp-btn sp-primary" id="tale-start" data-sound="pop">▶ Start the quest</button></div>';
  drawPreviewCanvas($('giver-cv'), st.giver.av, {name: st.giver.name, t: 1});
  q.querySelectorAll('#tale-friends .chip').forEach(b => b.onclick = () => { TALE_FRIEND = b.dataset.n; q.querySelectorAll('#tale-friends .chip').forEach(c => c.classList.toggle('on', c === b)); });
  $('tale-start').onclick = () => startStage(ch, si);
}
function startStage(ch, si){
  const st = taleStage(ch, si, taleOf(S.player).diff), seats = [{name: S.player}];
  if(TALE_FRIEND) seats.push({name: TALE_FRIEND});
  $('scr-tale').classList.add('hidden');
  const eng = Object.assign({story: Object.assign({}, st.story), coop: seats.length > 1}, st.engine || {});
  startGame({mode: st.mode, level: st.level, theme: st.theme, story: st, seats, engine: eng, bots: st.engine && st.engine.bots, label: '📜 ' + (si === 6 ? '👑 ' + CHAPTERS[ch].boss.name : CHAPTERS[ch].name + ' ' + (si + 1)),
    afterMake: M => { if(st.kind === 'lead'){ const f = []; for(let i = 0; i < st.story.need; i++){ const c = SN.freeCell(M, 3 + (i ? 0 : 1), false, f[f.length - 1]); if(c) f.push(c); } M.story.flags = f; M.story.need = f.length; } }});
  banner(st.story.icon + ' ' + st.text, 'gold', 3200);
}
window.storyEnd = function(){
  const M = G.M, st = G.story, won = M.winner >= 0, hs = humanIdx(), me = M.snakes[0];
  const hurt = hs.reduce((a, i) => a + M.snakes[i].hurt, 0), stars = won ? (hurt === 0 ? (M.t <= st.par ? 3 : 2) : 1) : 0;
  const boss = st.si === 6, C = CHAPTERS[st.ch], nextOpen = won && st.si < 6;
  showResult((won ? '<canvas class="win" id="giver-win" width="360" height="300"></canvas><h2 class="cheer">' + (boss ? '👑 ' + C.boss.name + ' beaten!' : 'Quest done!') + '</h2>' : '<div class="big">' + (st.story.icon || '📜') + '</div><h2>' + (M.why === 'time' ? 'Out of time' : 'Bonk — out of lives') + '</h2>') +
    '<div class="note">' + UI.esc(st.giver.name) + ': ' + (won ? pickOne(['Thank you, ' + UI.esc(S.player) + '! 💛', 'You did it! My hero! 🦸', 'Hooray! Snake hugs! 🐍']) : 'Try again — you can do it! 💪') + '</div>' +
    (won ? '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '" style="animation-delay:' + (i * 0.15) + 's">⭐</span>').join('') + '</div><div class="note">⭐ finish · ⭐⭐ no bonk · ⭐⭐⭐ also fast</div>' : '') +
    (won && boss ? '<div class="new-badge">🎁 Chapter ' + (st.ch + 1) + ' done — ' + C.costume + ' costume (📜 Tale heroes in your wardrobe)!</div>' : '') +
    '<div class="save-note" id="save-note">' + (won && !/^Guest/.test(S.player) ? '💾 Saving…' : '') + '</div>' +
    '<div class="res-btns">' + (nextOpen ? '<button class="btn sp-btn sp-primary" data-sound="pop" onclick="hideResult();startStage(' + st.ch + ',' + (st.si + 1) + ')">▶ Next quest</button>' : won && boss && st.ch < 5 ? '<button class="btn sp-btn sp-primary" data-sound="pop" onclick="backToMenu();openChapter(' + (st.ch + 1) + ')">▶ Next chapter</button>' : '') +
    '<button class="btn sp-btn ' + (won ? 'soft sp-secondary' : 'sp-primary') + '\" data-sound="pop" onclick="hideResult();startStage(' + st.ch + ',' + st.si + ')">🔁 Again</button><button class="btn soft sp-btn sp-secondary" data-sound="none" onclick="backToMenu();openChapter(' + st.ch + ')">📜 Map</button></div>');
  if(won){ const c = $('giver-win'); if(c){ const g = c.getContext('2d'), t0 = performance.now(), cheer = gestK('cheer'), dance = gestK('dance');
      const paint = () => { if(!document.body.contains(c)) return; const t = (performance.now() - t0) / 1000; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
        drawAvatar(g, {name: st.giver.name, av: st.giver.av, dir: 1, gest: {g: cheer, t: t % cheer.d}}, 110, 262, 1.55, {t});
        drawAvatar(g, {name: S.player, av: G ? G.avs[0] : myAvatar(S.player), dir: -1, gest: {g: dance, t}}, 250, 262, 1.55, {t});
        if(boss) emo(g, C.boss.icon, 180, 60 + Math.sin(t * 3) * 6, 46, 0.5 + 0.2 * Math.sin(t * 5));
        requestAnimationFrame(paint); }; paint(); } }
  NOTES.length = 0;
  if(won) hs.forEach((i, seat) => { const nm = M.snakes[i].name; if(/^Guest/.test(nm)) return; saveTale(nm, st.key, stars, seat); });
};
function saveTale(name, key, stars, seat){
  const diff = taleOf(S.player).diff;
  const t = taleOf(name); t.st[key] = Math.max(Number(t.st[key]) || 0, stars);   // the map opens the next stage at once (server keeps the best too)
  google.script.run.withSuccessHandler(res => { if(res && res.tale) TALE[name] = Object.assign({diff: t.diff}, res.tale, {diff: t.diff}); putNote(seat, UI.esc(name) + ': ' + featText(res.feats, res.newChapter ? '🎁 Chapter done — new costume!' : '✅ Story saved')); })
    .withFailureHandler(() => { writePending(readPending().concat([{name, tale: true, data: [key, stars, diff]}])); putNote(seat, UI.esc(name) + ': ⚠️ Will be sent next time.'); })
    .saveSnaketale(name, key, stars, diff);
}
window.afterGameMenu = function(){ if(SET.mode === 'tale' && S.player){ openChapter(TALE_CH); return true; } return false; };
window.bootExtra = function(d){ const st = d.settings || {}; Object.keys(st).forEach(k => { if(/^Snaketale_/.test(k)){ try{ TALE[k.slice(10)] = Object.assign({diff: 'normal', st: {}}, JSON.parse(st[k] || '{}')); }catch(e){} } }); };



/* ================= BOOT ================= */
function boot(){
  UI.loading(GAME_ID);
  if(RO) RO.observe($('stage'));
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.progGate = d.progressGate || {}; S.progCastle = d.progressCastle || {}; S.endless = d.snakeEndless || {}; S.skins = d.snakeSkins || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {};
      if(window.bootExtra) window.bootExtra(d);
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      KEYS = loadKeys();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); KEYS = loadKeys(); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();

/* ✨ MODE SPOTLIGHT (modes-3): ?mode=<id> opens this game straight in that mode after the player pick · "✨ Also try" on the start page · started modes → UI.modeTried */
const MS_GAME = 'snakeast';
function msOpen(id){
  if(id === 'endless'){ SET.mode = 'feast'; SET.endless = true; } else if(MODE_KEYS.indexOf(id) >= 0 && BUILT_MODES.indexOf(id) >= 0){ SET.mode = id; SET.endless = false; } else return; savePrefs(); renderMenu();
}
function msNow(){ return SET.mode === 'feast' && SET.endless ? 'endless' : SET.mode; }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startGame', () => msNow());
msWrap('startStage', () => 'tale');
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */
