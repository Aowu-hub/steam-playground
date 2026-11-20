
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'soul-bopper';
// 🎛️ p1c: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 💣 Soul Bopper · level | numbers | game buttons ⏸ ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '💣', name: 'Soul Bopper', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { pauseGame(); }, resume: () => { if(G && G.paused && !G.over) togglePause(); }},
  onFit: () => { if(G && typeof layoutPlay === 'function') layoutPlay(); },
  extras: [{id: 'pause-btn', html: '<span class="gb-pzi" aria-hidden="true"><i></i><i></i></span>', label: 'Pause (P)', onClick: () => togglePause(), keep: true}]});
var NAV_INNER = {menu: ['◀ Soul Bopper', () => openCover()], world: ['◀ Soul Bopper', () => openSetup(SET.level)]};   // 🧱 b3w5: the setup's top button goes back to the 🎬 cover; the world map back to the setup page   // 🧭 inner screens: their top button goes to the main screen
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
let FX = 1;   // harness sets 0 (no big words / confetti)
let SPEED = 1;   // harness can fast-forward
function say(text){ try{ if(!UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.pitch = 1.15; speechSynthesis.speak(u); }catch(e){} }
function pickOne(a){ return a[Math.floor(Math.random() * a.length)]; }
function fmtS(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function sbClamp(v, a, b){ return v < a ? a : v > b ? b : v; }

/* ================= DATA ================= */
const LEVEL_UI = [
  {emoji: '🌱', blurb: '9 × 9 maze, 1 sleepy bot, 3 lives. The pop area glows. Sudden death at 2:30.'},
  {emoji: '🐣', blurb: '11 × 9, 2 bots, 2 lives. Grab 💣 🔥 👟! Sudden death at 2:15.'},
  {emoji: '🔦', blurb: '11 × 11, 3 bots. New: 👢 kick + 🤾 toss. Sudden death at 2:00.'},
  {emoji: '⚡', blurb: '13 × 11, bots chase you. 1 life, best of 5. Ghosts can trap! Sudden death at 1:50.'},
  {emoji: '🌋', blurb: '15 × 13, 4 bots that box you in. Sudden death at 1:40.'},
  {emoji: '💀', blurb: '17 × 13, 5 smartest bots, no glow, 1 life. Sudden death at 1:30. ×3 score.', hardcore: true}
];
const AGE_START = {'4-5': 0, '6-7': 0, '8-9': 1, '10+': 2};
const MODES = {
  battle:  {icon: '⚔️', name: 'Battle', sub: 'Last one standing — caught? Come back as a 👻!', max: 4},
  classic: {icon: '💩', name: 'Classic Avatar', sub: 'Poo bombs! Out players throw from the edge', max: 4},
  hold:    {icon: '🏳️', name: 'Hold the land', sub: 'Stand in the glowing zone — alone or 2 vs 2', max: 4},
  stage:   {icon: '🗺️', name: 'Stage', sub: '7 worlds × 5 stages + a boss (+1 friend)', max: 2}
};
const MODE_KEYS = ['battle', 'classic', 'hold', 'stage'];
const MODE_READY = {battle: true, classic: true, hold: true, stage: true};
/* 🗂️ MODE GROUPS (mg-1) */
window.MODE_TYPE = {battle: 'A bomb maze battle', hold: 'A king-of-the-hill game', classic: 'A silly bomb party', stage: 'A bomb maze adventure'};   /* 🗂️ p3a: the "what kind of game" line on each mode card (mc-1) */
const MODE_GROUPS = [
  {k: 'battle', icon: '⚔️', en: 'Battle', th: 'ต่อสู้', c: '#E0452B'},
  {k: 'party', icon: '💩', en: 'Party', th: 'ปาร์ตี้', c: '#C27C0E'},
  {k: 'story', icon: '🗺️', en: 'Story', th: 'ผจญภัย', c: '#2F7BEA'}
];   // 🗂️ mg-1 mode groups (header icon + English + Thai), fixed order
const MODE_LIST = [   // 🗂️ start page buttons by group (mg-1)
  {k: 'battle', g: 'battle', icon: '⚔️', name: 'Battle', sub: 'Last one standing — come back as a 👻', next: '👇 then pick a level'},
  {k: 'hold', g: 'battle', icon: '🏳️', name: 'Hold the land', sub: 'Stand in the glowing zone', next: '👇 then pick a level'},
  {k: 'classic', g: 'party', icon: '💩', name: 'Classic Avatar', sub: 'Poo bombs! Out players throw from the edge', next: '👇 then pick a level'},
  {k: 'stage', g: 'story', icon: '🗺️', name: 'Stage', sub: '7 worlds × 5 stages + a boss', next: '👇 then a level, then a world'}
];
/* 🗂️ END MODE GROUPS */
const SEAT_COL = ['#FF7A1A', '#3D8BFD', '#2EC27E', '#C04BFF'];
const BOT_COL = '#9C8FB8';
const BOT_KIND = {sleepy: ['😴', 'Sleepy'], smart: ['🧠', 'Smart'], hunter: ['🎯', 'Hunter'], trapper: ['🪤', 'Trapper']};
// 7 worlds: floor, walls, soft blocks, the bomb + what comes out of the pop, how a caught player looks, sudden death
const THEMES = {
  dino:   {name: 'Dino Jungle', icon: '🦖', bg: '#1F3A1A', floor: ['#8CC765', '#80BC5A'], wall: ['#7A5A3A', '#5B4128'], soft: ['#3E8E41', '🌿'], fill: ['#5B4128', '🕳️'], bomb: '🥚', creature: '🦖', flame: ['#FFE08A', '#FF8A1A'], caught: 'soot', sdIcon: '☄️', sdText: '☄️ Sudden death — comets are falling!', strike: '☄️', powerFrame: '#7CC24B', cardNames: {bomb: 'Egg card', fire: 'Food card', speed: 'Dino-foot card', kick: 'Tail whip', error: 'Food poisoning'}},
  sea:    {name: 'Aquarium', icon: '🐙', bg: '#0B2A48', floor: ['#5EC4E8', '#52B8DE'], wall: ['#FF8A65', '#D2604A'], soft: ['#F7D07A', '🐚'], fill: ['#1E5F9E', '🌊'], bomb: '🐡', creature: '🐡', flame: ['#E0FBFF', '#3DA9FC'], caught: 'soak', sdIcon: '🐙', sdText: '🐙 Sudden death — kraken arms + the tide!', strike: '🐙', powerFrame: '#3DA9FC'},
  dance:  {name: 'Dance Hall', icon: '🪩', bg: '#1A0B33', floor: ['#3A1E6B', '#2C1556'], wall: ['#FF4FA3', '#B8237A'], soft: ['#B388FF', '🎁'], fill: ['#0A0514', '⬛'], bomb: '🔊', creature: '🎵', flame: ['#FFF3B0', '#FF4FA3'], caught: 'soot', sdIcon: '🪩', sdText: '🪩 Sudden death — disco beams + lights off!', strike: '🪩', powerFrame: '#FF4FA3'},
  robot:  {name: 'Robot Time', icon: '🤖', bg: '#14202B', floor: ['#B7C4CF', '#AAB8C4'], wall: ['#4A6378', '#334759'], soft: ['#E0A040', '⚙️'], fill: ['#2B3540', '🔩'], bomb: '🤖', creature: '⚡', flame: ['#E8FFFF', '#4DD0E1'], caught: 'zap', sdIcon: '🔴', sdText: '🔴 Sudden death — laser grid + time portals!', strike: '🔴', powerFrame: '#4DD0E1'},
  space:  {name: 'Space', icon: '🪐', bg: '#05041A', floor: ['#2A2160', '#231A52'], wall: ['#7E7A99', '#55516E'], soft: ['#6C7BD9', '🛰️'], fill: ['#000000', '🌑'], bomb: '⭐', creature: '✨', flame: ['#FFFFFF', '#B388FF'], caught: 'soot', sdIcon: '🌀', sdText: '🌀 Sudden death — black hole + meteors!', strike: '☄️', powerFrame: '#B388FF'},
  sky:    {name: 'Sky Temple', icon: '☁️', bg: '#6FB4E8', floor: ['#F2EEDF', '#E8E2CC'], wall: ['#C9B98A', '#A08F60'], soft: ['#FFFFFF', '☁️'], fill: ['#8FD3FF', '🌤️'], bomb: '🌩️', creature: '⚡', flame: ['#FFFDE0', '#FFD84D'], caught: 'zap', sdIcon: '⚡', sdText: '⚡ Sudden death — lightning + vanishing clouds!', strike: '⚡', powerFrame: '#FFD84D'},
  zombie: {name: 'Zombie Yard', icon: '🧟', bg: '#16200F', floor: ['#5E6B45', '#56623E'], wall: ['#3B3B44', '#26262D'], soft: ['#9E9E9E', '🪦'], fill: ['#3A2A1A', '🪦'], bomb: '💀', creature: '🦷', flame: ['#E6FFB0', '#7BC043'], caught: 'green', sdIcon: '✋', sdText: '✋ Sudden death — zombie hands + the horde!', strike: '✋', powerFrame: '#7BC043', brains: true}
};
const THEME_KEYS = Object.keys(THEMES);
const POWER_INFO = {
  bomb:   ['💣', '+1 bomb', 'Plant one more at a time (up to 8)'],
  fire:   ['🔥', 'Bigger pop', 'Longer + arms (up to 8)'],
  speed:  ['👟', 'Speed', 'Run faster (up to 5)'],
  kick:   ['👢', 'Kick', 'Walk up to a bomb + ✨ skill → it slides'],
  toss:   ['🤾', 'Toss & hit', '✨ on your bomb = toss 2 · ✨ next to a bomb = 🏏 hit it 4 (over walls) · hold 💣 = carry, let go = toss (don\'t hold too long!)'],
  shield: ['🛡️', 'Shield', 'Saves you from one pop (a tossed bomb knocks it off)'],
  remote: ['📡', 'Remote pop', 'Double-tap ✨ skill → your bombs pop now'],
  dash:   ['💨', 'Slide dash', 'Double-tap a direction → dash 2 blocks'],
  error:  ['😵', 'Error card', 'Oops! Controls go backwards for a few seconds']
};
const ACTIONS = [['up', '⬆️ Up'], ['down', '⬇️ Down'], ['left', '⬅️ Left'], ['right', '➡️ Right'], ['plant', '💣 Plant'], ['skill', '✨ Skill']];
const DEFAULT_KEYS = [
  {up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', plant: 'KeyF', skill: 'KeyT'},
  {up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', plant: 'Numpad2', skill: 'Numpad6'},
  {up: 'KeyI', down: 'KeyK', left: 'KeyJ', right: 'KeyL', plant: 'KeyU', skill: 'KeyO'},
  {up: 'Home', down: 'End', left: 'Delete', right: 'PageDown', plant: 'Insert', skill: 'PageUp'}
];
const DEFAULT_PAD = {plant: 0, skill: 2};
const PAD_NAMES = ['A / ✕', 'B / ○', 'X / □', 'Y / △', 'L1', 'R1', 'L2', 'R2', 'Select', 'Start'];

/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: '', bopper: {}};
let SET = {mode: 'battle', level: 0, theme: 'dino', seats: [], teams: false, teamOf: {}, size: 'auto'};
/* 🗺️ MAZE SIZE (p3c — Aowu F7: map × difficulty) */
const MAZE_SIZES = [{k: 'auto', icon: '🎚️', name: 'Auto', note: 'grows with the level'}, {k: 's', icon: '🟩', name: 'Small', w: 9, h: 9}, {k: 'm', icon: '🟨', name: 'Medium', w: 11, h: 11},
  {k: 'l', icon: '🟧', name: 'Large', w: 13, h: 11}, {k: 'xl', icon: '🟥', name: 'Huge', w: 15, h: 13}, {k: 'xxl', icon: '🟪', name: 'Giant', w: 17, h: 13}];
function mazeOf(){ return MAZE_SIZES.find(z => z.k === SET.size) || MAZE_SIZES[0]; }
function mazeWH(){ const z = mazeOf(), L = BOP.LEVELS[SET.level]; return z.w ? [z.w, z.h] : [L.w, L.h]; }
function renderSizes(){
  const box = $('size-box'); if(!box) return; box.classList.toggle('hidden', SET.mode === 'stage');
  const cur = mazeOf().k, L = BOP.LEVELS[SET.level];
  $('size-list').innerHTML = MAZE_SIZES.map(z => '<button class="chip' + (z.k === cur ? ' on' : '') + '" data-k="' + z.k + '" data-sound="tap">' + z.icon + ' ' + z.name + ' <small>' + (z.w ? z.w + '×' + z.h : L.w + '×' + L.h) + '</small></button>').join('');
  $('size-list').querySelectorAll('.chip').forEach(b => b.onclick = () => { SET.size = b.dataset.k; savePrefs(); renderSizes(); const sub = $('setup-sub'); if(sub) sub.textContent = setupSub(); });
}
/* 🗺️ END MAZE SIZE */
let G = null, lockHandle = null, KEYS = null, PADCFG = null;
function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function store(k){ return 'sp_soulbopper_' + k + ':' + (S.player || ''); }
function loadPrefs(){ try{ const p = JSON.parse(ls(store('prefs')) || '{}'); if(THEMES[p.theme]) SET.theme = p.theme; if(MODES[p.mode] && MODE_READY[p.mode]) SET.mode = p.mode; if(Array.isArray(p.seats)) SET.seats = p.seats.filter(n => typeof n === 'string').slice(0, 3); SET.teams = !!p.teams; if(MAZE_SIZES.some(z => z.k === p.size)) SET.size = p.size; SET.teamOf = p.teamOf || {}; }catch(e){} }
function savePrefs(){ ls(store('prefs'), JSON.stringify({theme: SET.theme, mode: SET.mode, seats: SET.seats, teams: SET.teams, teamOf: SET.teamOf, size: SET.size})); }
function myAvatar(name){ const a = S.avatars[name]; return a ? fixAv(a) : defaultAvatar(name || 'player'); }
function playAv(av){ const a = JSON.parse(JSON.stringify(av)); a.eq = Object.assign({}, a.eq || {}); delete a.eq.ride; delete a.eq.hand; return a; }   // ride-ons stay home in the maze (back for the win dance)
function bopInfo(name){ return (S.bopper && S.bopper[name]) || {}; }

/* ================= MENUS ================= */
function showScreen(name){
  if(name === 'setup') name = 'menu';   /* 🧱 b3w5: the old "Get ready" screen is part of the ONE setup page */
  if(name !== 'menu' && name !== 'player' && typeof BopCover !== 'undefined' && BopCover) BopCover.hide();   /* 🧱 b3w5 */
  ['player', 'menu', 'world', 'play'].forEach(s => { const el = $('scr-' + s); if(el) el.classList.toggle('hidden', s !== name); });
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER);   /* 🧭 p1c */ window.scrollTo(0, 0);
}
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
// levels open by 🗺️ Stage clears (the Archive board) OR ⚔️ battle wins against bots (feat bestWin)
function unlockedOf(name){ return Math.max(progressOf(name).unlocked || 0, Number(bopInfo(name).bestWin) || 0, Number(ls('sp_soulbopper_won:' + name)) || 0); }
function canPlay(i){ const u = unlockedOf(S.player); if(i === 5) return u >= 5; if(i === 4) return u >= 4; return i <= Math.max(u, AGE_START[S.age] || 0); }
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
  SET.seats = []; loadPrefs(); loadKeys(); $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); }   /* 📣 cs-2b */ renderMenu(); showScreen('menu'); openCover();   /* 🧱 b3w5: the 🎬 cover first */
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">' + (unlockedOf(S.player) > i ? '🏅 Won' : 'Not won yet') + '</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span><span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
function renderMenu(){
  renderModes(); renderLevels(); renderHow();   /* 🧱 b3w5: 🏆 leaders live on the cover */
}
function renderModes(){
  const box = $('mode-list');
  UI.modeGroups(box, MODE_GROUPS, MODE_LIST.map(m => Object.assign({}, m, {on: SET.mode === m.k, soon: !MODE_READY[m.k]})), {   // 🗂️ mg-1
    next: () => $('level-head'),
    onPick: k => { if(!MODE_READY[k]){ UISound.play('error'); UI.toast('🔜 ' + MODES[k].name + ' is coming soon!'); return 'stop'; } SET.mode = k; savePrefs(); renderLevels(); }});
}
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; const p = progressOf(S.player), rec = AGE_START[S.age], u = unlockedOf(S.player);
  $('level-head').textContent = '🎚️ 3. Pick a level — ' + MODES[SET.mode].icon + ' ' + MODES[SET.mode].name;
  BOP.LEVELS.forEach((L, i) => {
    const U = LEVEL_UI[i], open = canPlay(i), done = u > i, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (U.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none'); b.dataset.lv = i;   /* 🧱 b3w5 */
    const extra = SET.mode === 'hold' ? '🏳️ hold ' + BOP.HOLD_TARGET[i] + ' s' : SET.mode === 'battle' ? '⚔️ best of ' + (i >= 3 ? 5 : 3) : SET.mode === 'classic' ? '💩 ' + L.bots + ' bot' + (L.bots > 1 ? 's' : '') : '';
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + U.emoji + '</div><div class="nm">' + L.name + '</div><div class="learn">' + extra + '</div><div class="sub">' + (U.hardcore && !open ? '🔒 Win Extreme to open 💀 Hardcore' : U.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Win on Extreme to open 💀 Hardcore' : i === 4 ? 'Win on Hard to unlock Extreme!' : 'Win the level before to unlock it'); return; } chooseLevel(i); };   /* 🧱 b3w5: a tap picks */
    box.appendChild(b);
  });
  { let i = -1; try{ i = Number(ls(store('lv'))); }catch(e){} if(!(i >= 0 && canPlay(i))) i = canPlay(rec) ? rec : Math.max(0, [0, 1, 2, 3, 4, 5].filter(canPlay).pop() || 0); chosenLevel = i; }
  fillSetup(); markPicks();   /* 🧱 b3w5 */
}
function kk(code){ return '<span class="kk">' + UI.esc(keyName(code)) + '</span>'; }
function renderHow(){
  $('how-list').innerHTML = [
    'Walk the maze and <b>plant 💣</b>. It pops in a <b>+</b> shape — it breaks soft blocks and catches anyone in it. Players walk through each other; blocks and bombs stop you.',
    'A pop that hits another bomb sets it off too — <b>chain pops!</b> 🔗',
    'Break blocks to find <b>power-ups</b> (table below). Caught? Your power-ups scatter so others can grab them.',
    '⚔️ <b>Battle</b>: last one standing wins the round. From Junior, caught players become <b>👻 ghosts</b>: float over walls and press ✨ next to a player = <b>🪤 trap lock</b> for 1 s. If they get popped while locked, you <b>take over their body</b>!',
    '💩 <b>Classic Avatar</b>: bombs are poo. 1:00 → out players throw poo from the edge (catch someone = you come back in) · 1:30 → those pops leave concrete · 2:00 → family bots jump in.',
    '🏳️ <b>Hold the land</b>: stand in the glowing zone alone (or only your team) and your clock runs. Caught → back in 3 s at the edge with your 2 newest power-ups.',
    '⏰ <b>Sudden death</b> (Basic 2:30 · Junior 2:15 · Intermediate 2:00 · Hard 1:50 · Extreme 1:40 · Hardcore 1:30 — not in 🏳️ Hold the land or 🗺️ Stage): every world closes in its own way!'
  ].map(t => '<li>' + t + '</li>').join('');
  $('power-table').innerHTML = '<tr><th>Power-up</th><th>What it does</th></tr>' + Object.keys(POWER_INFO).map(k => '<tr><td><b>' + POWER_INFO[k][0] + ' ' + POWER_INFO[k][1] + '</b></td><td>' + POWER_INFO[k][2] + '</td></tr>').join('');
  const A = KEYS || DEFAULT_KEYS;
  $('keys-table-help').innerHTML = '<tr><th>Who</th><th>Move</th><th>💣 Plant</th><th>✨ Skill</th></tr>' +
    '<tr><td><b>1 player</b></td><td>Arrows or W A S D</td><td>' + kk('Space') + '</td><td>' + kk('ShiftLeft') + '</td></tr>' +
    A.map((K, i) => '<tr><td><b style="color:' + SEAT_COL[i] + '">Player ' + (i + 1) + '</b></td><td>' + [K.up, K.left, K.down, K.right].map(kk).join('') + '</td><td>' + kk(K.plant) + '</td><td>' + kk(K.skill) + '</td></tr>').join('') +
    '<tr><td><b>🎮 Controller</b></td><td>stick / d-pad</td><td>' + PAD_NAMES[(PADCFG || DEFAULT_PAD).plant] + '</td><td>' + PAD_NAMES[(PADCFG || DEFAULT_PAD).skill] + '</td></tr>' +
    '<tr><td><b>📱 Tablet</b></td><td>pad in your corner</td><td>💣 button</td><td>✨ button</td></tr>';
}

/* ================= SETUP ================= */
/* 🧱 b3w5 (Game Baseline): ONE setup page — 🎮 mode → 🗺️ maze size → 🎚️ level → 👥 who plays → 🎨 world + 💣 bomb → ⚙️ options → ▶ Start */
let chosenLevel = 0;
function openSetup(lvl){   // the old entry point (tests, old links): picks the level + fills the page + shows it
  if(BopCover) BopCover.hide(); if(lvl != null) chosenLevel = lvl; fillSetup(); showScreen('menu');
}
function fillSetup(){
  const lvl = chosenLevel; SET.level = lvl; const L = BOP.LEVELS[lvl], m = MODES[SET.mode]; renderSizes();   /* 🗺️ p3c */
  if(LEVEL_UI[lvl].hardcore && SET.mode === 'battle') SET.seats = SET.seats.slice(0, 3);
  $('setup-logo').textContent = m.icon; $('setup-title').textContent = m.name + ' · ' + L.name;
  $('setup-sub').textContent = setupSub();
  buildSeats(); buildThemes(); buildSetupExtra();
  $('theme-box').classList.toggle('hidden', SET.mode === 'stage');
  $('go-btn').onclick = () => SET.mode === 'stage' ? showWorlds() : startMatch();
  markPicks();
}
function chooseLevel(i, quiet){
  chosenLevel = i; ls(store('lv'), String(i)); fillSetup();
  if(!quiet){ const w = $('who-head'); if(w && w.scrollIntoView) w.scrollIntoView({behavior: 'smooth', block: 'start'}); }
}
function markPicks(){
  $('level-list').querySelectorAll('.lvl').forEach(b => { const on = String(b.dataset.lv) === String(chosenLevel); b.classList.toggle('sel', on); if(window.GF && GF.pick) GF.pick(b, on); });
  const L = BOP.LEVELS[chosenLevel], U = LEVEL_UI[chosenLevel], m = MODES[SET.mode], st = $('go-btn');
  if(st && L) st.textContent = SET.mode === 'stage' ? '🗺️ Pick a world · ' + U.emoji + ' ' + L.name : '▶ Start · ' + m.icon + ' ' + m.name + ' · ' + U.emoji + ' ' + L.name;
  { const h = $('size-head'); if(h) h.classList.toggle('hidden', SET.mode === 'stage'); }
}
// 🎬 the cover (GameFrame): who's here (you + up to 3 on this device = the seats; bots fill the maze) + champions + how to play; ▶ Play opens the setup page
let BopCover = null;
const BOP_VERSION = '2.0';   /* 🧱 b3w5: shown on the cover footer — bump with each Soul Bopper round */
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(BopCover && BopCover.who !== S.player){ BopCover.destroy(); BopCover = null; }
  if(!BopCover){ BopCover = GF.cover(document.body, {game: GAME_ID, title: 'Soul Bopper', icon: '👻', version: BOP_VERSION, me: S.player, players: S.players, avatarOf: myAvatar, seats: {min: 1, max: 4},
      acts: ['beat.throw', 'beat.jump'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms',
      onPlay: line => { BopCover.hide(); if(line && line.length > 1){ SET.seats = line.slice(1, SET.mode === 'stage' ? 2 : 4).map(x => x.name); savePrefs(); }
        renderMenu(); showScreen('menu'); } }); BopCover.who = S.player; }
  BopCover.show();
}
function setupSub(){
  const L = BOP.LEVELS[SET.level];
  if(SET.mode === 'battle') return 'Last one standing · best of ' + (SET.level >= 3 ? 5 : 3) + ' · ' + mazeWH().join(' × ') + ' maze · ' + L.lives + ' ' + (L.lives > 1 ? 'lives' : 'life');
  if(SET.mode === 'classic') return '💩 poo bombs · comeback throws from 1:00 · ' + mazeWH().join(' × ') + ' maze';
  if(SET.mode === 'hold') return 'Hold the zone for ' + BOP.HOLD_TARGET[SET.level] + ' s in all — it adds up!' + (SET.level >= 3 ? ' The zone moves every 40 s.' : '');
  if(SET.mode === 'stage') return '7 worlds × 5 stages + a boss · catch every bot, then find the 🚪 exit · ' + L.lives + ' ' + (L.lives > 1 ? 'lives' : 'life') + ' · +1 friend can join';
  return '';
}
function others(){ return S.players.map(p => p.Name).filter(n => n !== S.player); }
function maxHumans(){ return MODES[SET.mode].max; }
function humanList(){ return [S.player].concat(SET.seats.filter(n => n !== S.player)).slice(0, maxHumans()); }
function botCount(){ const L = BOP.LEVELS[SET.level], h = humanList().length; if(SET.mode === 'stage') return 0; if(SET.mode === 'hold') return SET.teams ? Math.max(0, 4 - h) : Math.max(1, Math.min(3, L.bots) - (h - 1)); return Math.max(h > 1 ? 0 : 1, Math.min(L.bots, 8 - h)); }
function seatHtml(name, label, idx, bot, kind){
  const kb = bot ? '' : '<span class="kb">⌨️ ' + (humanList().length === 1 ? 'arrows / WASD<br>Space · Shift' : [KEYS[idx].up, KEYS[idx].left, KEYS[idx].down, KEYS[idx].right].map(keyName).join(' ') + '<br>' + keyName(KEYS[idx].plant) + ' · ' + keyName(KEYS[idx].skill)) + '</span>';
  return '<div class="seat ' + (bot ? 'bot' : 's' + idx) + '"><canvas width="96" height="112" data-av="' + UI.esc(name || '') + '" data-bot="' + (bot ? 1 : 0) + '"></canvas><div class="nm">' + (bot ? BOT_KIND[kind][0] + ' ' + BOT_KIND[kind][1] + ' bot' : UI.esc(name)) + '<small>' + label + '</small></div>' + kb +
    (!bot && idx > 0 ? '<button class="x" data-rm="' + UI.esc(name) + '" title="Remove">✕</button>' : '') + '</div>';
}
function buildSeats(){
  const hs = humanList(), L = BOP.LEVELS[SET.level], nb = botCount(), hc = LEVEL_UI[SET.level].hardcore;
  let html = '<div class="seats">' + hs.map((n, i) => seatHtml(n, i === 0 ? 'You · player 1' : 'Player ' + (i + 1), i)).join('');
  for(let j = 0; j < nb; j++){ const k = L.kinds[j % L.kinds.length]; html += seatHtml('', 'Ridden by a family avatar', 9, true, k); }
  html += '</div>' + (hc ? '<div class="hc-note" style="margin-top:10px">💀 Hardcore: no glow, 1 life, the smartest bots, sudden death at 1:30. ×3 score.</div>' : '');
  $('seat-box').innerHTML = html;
  $('seat-box').querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { SET.seats = SET.seats.filter(n => n !== b.dataset.rm); savePrefs(); buildSeats(); });
  const list = others().concat(['Guest']), full = hs.length >= maxHumans();
  $('add-note').textContent = full ? 'Seats full (' + maxHumans() + ' people).' : 'Tap to add a family player (one keyboard, controllers or one tablet):';
  $('add-list').innerHTML = full ? '' : list.filter(n => hs.indexOf(n) < 0).map(n => '<button class="chip" data-n="' + UI.esc(n) + '" data-sound="tap">+ ' + (n === 'Guest' ? '🙂 Guest' : UI.esc(n)) + '</button>').join('');
  $('add-list').querySelectorAll('.chip').forEach(b => b.onclick = () => { SET.seats.push(b.dataset.n); savePrefs(); buildSeats(); });
  // 🏳️ hold the land: single or 2 vs 2
  const tb = $('team-box');
  if(SET.mode === 'hold'){
    tb.innerHTML = '<div class="chips"><button class="chip' + (!SET.teams ? ' on' : '') + '" data-t="0" data-sound="tap">🧍 Every one for themselves</button><button class="chip' + (SET.teams ? ' on' : '') + '" data-t="1" data-sound="tap">🤝 Team 2 vs 2</button></div>' +
      (SET.teams ? '<div class="note" style="margin-top:6px">' + teamLine() + '</div>' : '');
    tb.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { SET.teams = b.dataset.t === '1'; savePrefs(); buildSeats(); });
    tb.querySelectorAll('[data-sw]').forEach(b => b.onclick = () => { const n = b.dataset.sw; SET.teamOf[n] = teamOf(n) ? 0 : 1; savePrefs(); buildSeats(); });
  } else tb.innerHTML = '';
  $('seat-box').querySelectorAll('canvas[data-av]').forEach((c, j) => { const n = c.dataset.av;
    if(c.dataset.bot === '1'){ const fam = botAvatarNames(); drawPreviewCanvas(c, myAvatar(fam[j % Math.max(1, fam.length)] || ('Bot ' + j)), {name: 'bot', t: 1}); const x = c.getContext('2d'); emo(x, '🤖', c.width - 18, 18, 26); return; }
    drawPreviewCanvas(c, myAvatar(n === 'Guest' ? 'Guest' : n), {name: n, t: 1}); });
}
function teamOf(n){ const hs = humanList(), i = hs.indexOf(n); return SET.teamOf[n] != null ? SET.teamOf[n] : i % 2; }
function teamLine(){
  const hs = humanList(); return '🟠 Team Sun: ' + hs.filter(n => teamOf(n) === 0).map(n => '<button class="chip" data-sw="' + UI.esc(n) + '">' + UI.esc(n) + ' ⇄</button>').join(' ') + ' &nbsp; 🔵 Team Moon: ' + hs.filter(n => teamOf(n) === 1).map(n => '<button class="chip" data-sw="' + UI.esc(n) + '">' + UI.esc(n) + ' ⇄</button>').join(' ') + ' <br>Bots fill the empty team seats.';
}
function botAvatarNames(){ const hs = humanList(); const fam = S.players.map(p => p.Name).filter(n => hs.indexOf(n) < 0); return fam.length ? fam : S.players.map(p => p.Name); }
function buildThemes(){
  const box = $('theme-list');
  if(!box.children.length){
    THEME_KEYS.forEach(k => { const T = THEMES[k], b = document.createElement('button'); b.className = 'theme'; b.dataset.k = k; b.setAttribute('data-sound', 'tap');
      const c = document.createElement('canvas'); c.width = 200; c.height = 200; b.appendChild(c); b.insertAdjacentHTML('beforeend', '<div class="nm">' + T.icon + ' ' + T.name + '</div>');
      b.onclick = () => { SET.theme = k; savePrefs(); markThemes(); }; box.appendChild(b); });
  }
  box.querySelectorAll('.theme').forEach(b => themePreview(b.querySelector('canvas'), b.dataset.k));
  markThemes();
}
function markThemes(){ $('theme-list').querySelectorAll('.theme').forEach(b => b.classList.toggle('on', b.dataset.k === SET.theme)); }
function themePreview(c, k){
  // the same painter as the real maze: a little 7 × 7 corner with a bomb popping
  const M = BOP.newMatch({level: 0, seed: 11, theme: k, players: [{name: S.player || 'Ava', human: true}, {name: 'Bot', kind: 'sleepy'}]});
  M.W = 7; M.H = 7; M.grid = new Uint8Array(49); for(let y = 0; y < 7; y++) for(let x = 0; x < 7; x++) M.grid[y * 7 + x] = (x === 0 || y === 0 || x === 6 || y === 6 || (x % 2 === 0 && y % 2 === 0)) ? 1 : ((x * 3 + y * 5) % 4 === 0 && !(x < 3 && y < 3) ? 2 : 0);
  M.P[0].x = 1; M.P[0].y = 1; M.P[1].x = 5; M.P[1].y = 5; M.items = [{x: 5, y: 1, k: 'fire', t: null}]; M.bombs = [{x: 3, y: 3, t: 1, max: 3, r: 2, owner: 0, pass: {}}]; M.fl = {};
  [[3, 1], [3, 2]].forEach(c2 => { M.fl[c2[1] * 7 + c2[0]] = {t: 0.4, o: 0, d: 2}; });
  const fake = {M, theme: k, fx: [], avs: [playAv(myAvatar(S.player || 'Ava')), playAv(myAvatar('Ben'))], preview: true, t: 1, st: null};
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  drawWorld(g, c.width, c.height, fake, {CS: c.width / 7, OX: 0, OY: 0, preview: true});
}

/* ================= ⌨️ KEYS + 🎮 CONTROLLERS (per player per device) ================= */
function keyName(code){ if(!code) return '—'; return code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'Num ').replace(/^Arrow(\w+)/, (m, d) => ({Up: '↑', Down: '↓', Left: '←', Right: '→'})[d] || d).replace('Quote', "'").replace('Semicolon', ';').replace('Backslash', '\\').replace('BracketLeft', '[').replace('BracketRight', ']').replace('Comma', ',').replace('Period', '.').replace('Slash', '/').replace('ShiftRight', 'R-Shift').replace('ShiftLeft', 'Shift').replace('PageDown', 'PgDn').replace('PageUp', 'PgUp').replace('Delete', 'Del').replace('Insert', 'Ins'); }
function keysKey(){ return 'sp_soulbopper_keys:' + (S.player || ''); }
function loadKeys(){ let k = null; try{ k = JSON.parse(ls(keysKey()) || 'null'); }catch(e){} const arr = k && (k.k || k); KEYS = DEFAULT_KEYS.map((d, i) => Object.assign({}, d, (Array.isArray(arr) && arr[i]) || {})); PADCFG = Object.assign({}, DEFAULT_PAD, (k && k.pad) || {}); return KEYS; }
function saveKeys(){ ls(keysKey(), JSON.stringify({k: KEYS, pad: PADCFG})); }
let keyWait = null, padWait = null;
const HELD_TEST = new Set();
function openKeys(){ HELD_TEST.clear(); renderHeld(); renderKeys(); renderPads(); $('keys-sheet').classList.remove('hidden'); }
function closeKeys(){ keyWait = null; padWait = null; $('keys-sheet').classList.add('hidden'); if(!$('scr-menu').classList.contains('hidden')) buildSeats(); renderHow(); }   /* 🧱 b3w5 */
function resetKeys(){ KEYS = DEFAULT_KEYS.map(d => Object.assign({}, d)); PADCFG = Object.assign({}, DEFAULT_PAD); saveKeys(); renderKeys(); renderPads(); }
function renderKeys(){
  const n = 4, cell = (s, a) => { const w = keyWait && keyWait.s === s && keyWait.a === a; return '<button class="keybtn k' + s + (w ? ' wait' : '') + '" data-s="' + s + '" data-a="' + a + '">' + (w ? '…' : UI.esc(keyName(KEYS[s][a]))) + '</button>'; };
  const t = $('keys-table'); t.style.setProperty('--seats', n);
  t.innerHTML = '<div class="krow"><span></span>' + [0, 1, 2, 3].map(s => '<span style="color:' + SEAT_COL[s] + '">Player ' + (s + 1) + '</span>').join('') + '</div>' + ACTIONS.map(([a, nm]) => '<div class="krow"><span>' + nm + '</span>' + [0, 1, 2, 3].map(s => cell(s, a)).join('') + '</div>').join('');
  t.querySelectorAll('.keybtn').forEach(b => b.onclick = () => { keyWait = {s: Number(b.dataset.s), a: b.dataset.a}; renderKeys(); });
}
function takeKey(e){
  if(!keyWait) return false; e.preventDefault(); if(e.code === 'Escape'){ keyWait = null; renderKeys(); return true; }
  const {s, a} = keyWait, old = KEYS[s][a];
  KEYS.forEach((K, si) => Object.keys(K).forEach(k => { if(K[k] === e.code && !(si === s && k === a)) K[k] = old; }));   // swap on clash
  KEYS[s][a] = e.code; keyWait = null; saveKeys(); renderKeys(); UISound.play('key'); return true;
}
function renderHeld(){ const h = $('held'); if(!h) return; h.innerHTML = HELD_TEST.size ? Array.from(HELD_TEST).map(c => '<span>' + UI.esc(keyName(c)) + '</span>').join('') + '<span style="background:#fff">' + HELD_TEST.size + ' at once</span>' : '<span style="background:#fff;color:#6A5A80">press keys…</span>'; }
function padsNow(){ try{ return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(Boolean); }catch(e){ return []; } }
function renderPads(){
  const pads = padsNow(), btn = a => '<button class="chip' + (padWait === a ? ' on' : '') + '" data-pa="' + a + '">' + (padWait === a ? 'press a button…' : (a === 'plant' ? '💣 Plant = ' : '✨ Skill = ') + PAD_NAMES[PADCFG[a]]) + '</button>';
  $('pad-box').innerHTML = '<div class="padrow">' + (pads.length ? pads.map((p, i) => '<span class="kk" style="background:' + SEAT_COL[i % 4] + ';color:#fff">🎮 ' + (i + 1) + ' → Player ' + (i % 4 + 1) + '</span>').join('') : '<span class="note">No controller found yet — plug one in and press a button.</span>') + '</div><div class="padrow">' + btn('plant') + btn('skill') + '</div>';
  $('pad-box').querySelectorAll('[data-pa]').forEach(b => b.onclick = () => { padWait = b.dataset.pa; renderPads(); padCapture(); });
}
function padCapture(){
  if(!padWait) return; const pads = padsNow();
  for(const p of pads){ for(let b = 0; b < Math.min(10, p.buttons.length); b++){ if(p.buttons[b] && p.buttons[b].pressed){ const other = padWait === 'plant' ? 'skill' : 'plant'; if(PADCFG[other] === b) PADCFG[other] = PADCFG[padWait]; PADCFG[padWait] = b; padWait = null; saveKeys(); renderPads(); UISound.play('key'); return; } } }
  if(!$('keys-sheet').classList.contains('hidden')) requestAnimationFrame(padCapture);
}
window.addEventListener('gamepadconnected', () => { if(!$('keys-sheet').classList.contains('hidden')) renderPads(); });

/* ================= MATCH ================= */
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function startMatch(opts){
  if(BopCover) BopCover.hide();   /* 🧱 b3w5 */
  hideResult(); savePrefs(); opts = opts || {};
  const hs = humanList(), L = BOP.LEVELS[SET.level], nb = botCount(), fam = shuffle(botAvatarNames().slice());
  const specs = hs.map((n, i) => ({name: n, human: true, team: SET.teams ? teamOf(n) : i}));
  for(let j = 0; j < nb; j++){
    const k = L.kinds[j % L.kinds.length], base = fam.length ? fam[j % fam.length] : 'Bot', rep = fam.length ? Math.floor(j / fam.length) : j, who = rep ? base + ' ' + (rep + 1) : base;
    let team = j;
    if(SET.mode === 'hold' && SET.teams){ const cnt = [0, 1].map(t => specs.filter(s => s.team === t).length); team = cnt[0] <= cnt[1] ? 0 : 1; }
    specs.push({name: who, kind: k, human: false, team, bot: true});
  }
  const stage = SET.mode === 'stage' ? {world: SET.world, n: SET.stage, boss: SET.stage === 5, foeNames: fam} : null;
  const M = BOP.newMatch({level: SET.level, size: SET.mode === 'stage' ? null : mazeWH(), mode: SET.mode, theme: stage ? WORLD_KEYS[SET.world] : SET.theme, teams: SET.mode === 'hold' && SET.teams, seed: (Date.now() & 0xffffff) ^ 0x5b, players: specs, ghosts: SET.mode === 'battle' && SET.level > 0, stage});
  M.joinNames = fam.length ? fam : ['Ben', 'Mia'];
  M.P.forEach(p => { if(p.human && p.name !== 'Guest' && window.BombSkins) p.skin = skinOf(p.name); });
  const avName = s => s.bot ? s.name.replace(/ \d+$/, '') : s.name, avOf = s => playAv(myAvatar(avName(s) === 'Guest' ? 'Guest' : avName(s)));
  G = {M, mode: SET.mode, level: SET.level, theme: M.theme, stage, keys: new Set(), fx: [], raf: 0, last: 0, acc: 0, paused: false, over: false, shown: false, t: 0, startAt: performance.now(),
    q: window.__q || 1, avs: specs.map(avOf), winAvs: specs.map(s => myAvatar(avName(s))), humans: hs.length, pads: {}, touch: {}, tap: {}, padPrev: {}, shake: 0, staticKey: '', st: null, lastHud: {}, faces: {}, watch: false};
  G.avFor = i => { const p = G.M.P[i]; if(!p) return null; if(!G.avs[i]){ G.avs[i] = playAv(myAvatar(p.name)); G.winAvs[i] = myAvatar(p.name); } return G.avs[i]; };
  showScreen('play'); watchStage(); GameComic._reset(); layoutPlay(); buildChips(); hud();
  cheerMount(); calloutSetup(); /* 💬 24t-d */   /* 📣 cs-2b: the crowd for this match (Off = nothing) */
  G.last = performance.now(); G.raf = requestAnimationFrame(frame);
}
function isTouch(){ return ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0; }
function humanSeats(){ return G ? G.M.P.filter(p => p.human).map(p => p.i) : []; }
/* 📣 CHEERSQUAD (cs-2b) START — the crowd beside the maze (CheerSquad.html, 📣 Cheer chat). Don't remove: the Cheer chat re-applies it. */
// sides: Hold-the-land teams = 🟠 Sun / 🔵 Moon; otherwise every human = its own side, the bots = the 👻 rival's side
function cheerSide(p){ const M = G.M; if(M.teams) return p.team; const hs = M.P.filter(x => x.human); return p.human ? hs.indexOf(p) : 1; }
/* 💬 24t-d: words during play (UiKit UI.callout) — the maze + players stay clear, crowd fans can say it */
function calloutSetup(){ if(!(window.UI && UI.callout) || !G) return;
  const pl = w => !G ? null : typeof w === 'number' ? G.M.P[w] : w && w.i != null ? w : null;
  const meI = () => { if(!G) return -1; const P = G.M.P; let p = P.find(q => q.human && q.name === S.player) || P.find(q => q.human); return p ? p.i : -1; };
  const cell = (x, y) => { const b = GameComic.board(); return b ? {x: b.left + (x + 0.5) * b.cell, y: b.top + (y + 0.5) * b.cell, c: b.cell} : null; };
  const seen = p => p && (p.alive || p.ghost || p.edge);
  UI.callout.setup({
    get me(){ return meI(); },
    at: w => { const p = pl(w) || pl(meI()); if(!seen(p)) return null; const q = cell(p.x, p.y); return q ? {x: q.x, y: q.y - q.c * (p.ghost ? 1.6 : 1.3)} : null; },
    side: w => { const p = pl(w) || pl(meI()); return p ? cheerSide(p) : null; },
    poly: () => { const b = G && GameComic.board(); return b ? [[b.left, b.top], [b.left + b.width, b.top], [b.left + b.width, b.top + b.height], [b.left, b.top + b.height]] : null; },
    keep: () => { if(!G) return []; const out = [];
      G.M.P.forEach(p => { if(!seen(p)) return; const q = cell(p.x, p.y); if(!q) return; const w = Math.max(16, q.c * 0.6); out.push({l: q.x - w, r: q.x + w, t: q.y - q.c * (p.ghost ? 1.9 : 1.6), b: q.y + q.c * 0.55}); });
      document.querySelectorAll('#scr-play .tb, #scr-play .tpad, #stage .corner, #stage .help-btn, #stage .chelp').forEach(e => { const r = e.getBoundingClientRect(); if(r.width) out.push({l: r.left, t: r.top, r: r.right, b: r.bottom}); });
      return out; }
  }); }
function cheerMount(){
  if(!window.Cheer) return; Cheer.unmount(); G.cheerZ = null;
  const M = G.M, hs = M.P.filter(p => p.human), bots = M.P.some(p => !p.human);
  const players = M.teams ? [0, 1].map(t => ({name: t ? '🔵 Team Moon' : '🟠 Team Sun', side: t, human: M.P.some(p => p.human && p.team === t)}))
    : hs.map((p, i) => ({name: p.name, side: i, human: true})).concat(hs.length < 2 ? [{name: bots ? 'Bots' : 'Boo', side: 1, human: false}] : []);
  Cheer.mount($('arena'), {game: 'soulbopper', players, me: {name: S.player}, family: (S.players || []).map(p => p.Name), avatars: S.avatars || {}, mode: 'overlay', zones: cheerZones,
    avoid: () => Array.from(document.querySelectorAll('#gbar, .top-btn, #scr-play .pchip, #scr-play .sidechips, #scr-play .tpad, #scr-play .tb, #stage .corner, #stage .help-btn, #stage .chelp')),
    clear: b => { const B = cheerBoard(); return !B || !(b.r > B.x - 3 && b.l < B.x + B.w + 3 && b.b > B.y - 3 && b.t < B.y + B.h + 3); }});
  if(!window.__cheerSB){ window.__cheerSB = 1; GameComic.listen(cheerOn); }
}
// the maze in #arena px (the crowd's own canvas covers #arena)
function cheerBoard(){ const b = GameComic.board(); if(!b) return null; const a = $('arena').getBoundingClientRect(); return {x: b.left - a.left, y: b.top - a.top, w: b.width, h: b.height}; }
// where fans may stand (#arena px, re-read every 0.5 s): GameComic.free() beside the maze + the gap between the chips and the controls
// in each side panel (phone on its side / tablet); tall rooms become stacked rows, nearest the middle first
function cheerZones(){
  if(!G) return []; const now = performance.now(); if(G.cheerZ && now - G.cheerZ.at < 500) return G.cheerZ.z;
  const A = $('arena').getBoundingClientRect(), rects = GameComic.free().map(r => ({x: r.left - A.left, y: r.top - A.top, w: r.width, h: r.height}));
  document.querySelectorAll('#arena .ctl.panel').forEach(pn => { const P = pn.getBoundingClientRect(), ch = pn.querySelector('.sidechips'), cs = [...pn.querySelectorAll('.tpad, .tb')].map(e => e.getBoundingClientRect()).filter(r => r.height);
    const top = ch ? ch.getBoundingClientRect().bottom + 4 : P.top + 4, bot = cs.length ? Math.min(...cs.map(r => r.top)) - 4 : P.bottom - 4;
    rects.push({x: P.left - A.left + 4, y: top - A.top, w: P.width - 8, h: bot - top}); });
  const z = [];
  rects.forEach(r => { if(r.w < 50 || r.h < 60) return; const n = Math.max(1, Math.floor(r.h / 100)), rh = Math.min(118, r.h / n);
    for(let j = 0; j < n; j++) z.push({x: Math.round(r.x), y: Math.round(r.y + r.h - (j + 1) * rh), w: Math.round(r.w), h: Math.round(rh)}); });
  z.sort((p, q) => Math.abs(p.y + p.h / 2 - A.height * 0.55) - Math.abs(q.y + q.h / 2 - A.height * 0.55) || p.x - q.x);
  G.cheerZ = {at: now, z}; return z;
}
// every engine event (GameComic.listen) → a crowd moment; bots' own news is not news (unless it's the bots' side vs one human)
function cheerOn(mode, e, M){
  if(!window.Cheer || !Cheer.active() || !G || G.M !== M) return;
  const P = M.P[e.i], hs = M.P.filter(p => p.human), say = (kind, p) => { if(!p) return; if(!p.human && (M.teams || hs.length > 1)) return; Cheer.react(kind, {side: cheerSide(p)}); };
  const now = performance.now();
  if(e.k === 'go') Cheer.react('start', {side: 0});
  else if(e.k === 'caught'){ if(P && P.human) say(P.lives === 1 ? 'close' : 'miss', P); const B = M.P[e.by]; if(B && B.human && e.by !== e.i) say('big', B); }
  else if(e.k === 'pick'){ if(P && P.human && (G.cheerAt || 0) < now - 2500){ G.cheerAt = now; say('goal', P); } }
  else if(e.k === 'swap'){ const g2 = M.P[e.ghost]; if(g2 && g2.human) say('comeback', g2); }
  else if(e.k === 'comeback'){ if(P && P.human) say('comeback', P); }
  else if(e.k === 'lock'){ const g2 = M.P[e.ghost]; if(g2 && g2.human) say('goal', g2); }
  else if(e.k === 'bosshit'){ const B = M.P[e.by]; if(B && B.human) say('goal', B); }
  else if(e.k === 'bossdown') Cheer.react('big', {side: 0});
  else if(e.k === 'exitopen') Cheer.react('goal', {side: 0});
  else if(e.k === 'roundend'){ const w = M.P[e.winner]; if(w && w.human && !M.done) say('big', w); }
  else if(e.k === 'sudden') Cheer.react('close', {side: 0});
}
function cheerEnd(){ if(!window.Cheer || !Cheer.active() || !G) return; const M = G.M, hs = M.P.filter(p => p.human);
  if(M.mode === 'stage'){ Cheer.react(M.stageClear ? 'win' : 'lose', {side: 0}); return; }
  if(M.teams){ const t = M.winSide; if(t != null && hs.some(p => p.team === t)) Cheer.react('win', {side: t}); else Cheer.react('lose', {side: hs.length ? hs[0].team : 0}); return; }
  const w = M.P[M.winner]; if(w && w.human) Cheer.react('win', {side: cheerSide(w)}); else Cheer.react('lose', {side: 0}); }
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(!at) return; card.insertBefore(c, at); card.insertBefore(cap, at); }, 900); }
/* 📣 CHEERSQUAD END */
function layoutPlay(){
  const sp = $('scr-play'), arena = $('arena'), bottom = $('bottom'), W = window.innerWidth, H = window.innerHeight;
  arena.querySelectorAll('.ctl,.corner,.help-btn,.chelp').forEach(e => e.remove()); bottom.innerHTML = '';
  sp.classList.remove('side', 'port', 'corners', 'sbtall');
  const touch = isTouch() || window.FORCE_TOUCH, seats = humanSeats();
  G.inset = {l: 0, r: 0, t: 0, b: 0};
  if(touch && seats.length === 1){
    if(W > H){ sp.classList.add('side'); if(sbTall24zc()) sp.classList.add('sbtall'); const c1 = ctlEl(seats[0], 'pad'), c2 = ctlEl(seats[0], 'btns'); c1.classList.add('panel', 'l'); c2.classList.add('panel', 'r');   // sb-9a2: cards on top of each side panel
      c1.insertAdjacentHTML('afterbegin', '<div class="sidechips" id="sidechips-l"></div>'); c2.insertAdjacentHTML('afterbegin', '<div class="sidechips" id="sidechips-r"></div>'); arena.insertBefore(c1, arena.firstChild); arena.appendChild(c2); layoutSide(); }
    else { sp.classList.add('port'); bottom.appendChild(ctlEl(seats[0], 'both')); }
  } else if(touch && seats.length > 1){
    sp.classList.add('corners');
    const spots = seats.length === 2 ? (W >= H ? ['bl', 'br'] : ['tl', 'br']) : ['tl', 'tr', 'bl', 'br'];
    seats.forEach((s, j) => { const c = cornerEl(s, spots[j]); $('stage').appendChild(c); });
    const hb = document.createElement('button'); hb.className = 'pill help-btn'; hb.textContent = '❓ Corners'; hb.onclick = toggleCornerHelp; $('stage').appendChild(hb);
    const cs = Math.min(240, Math.max(150, Math.min(W, H) * 0.24));
    if(W >= H) G.inset = {l: cs, r: cs, t: 0, b: 0}; else G.inset = {l: 0, r: 0, t: cs * 0.9, b: cs * 0.9};
  } else {
    bottom.innerHTML = '<div class="legend">' + legendHtml() + '</div>';
  }
  if(window.UI && UI.pad) UI.pad.arcAll(sp);
  requestAnimationFrame(() => { resize(); placeChips(); layoutSide(); });
}
// 📱 24z-c SIDEWAYS TALL MAZE (✨ Polish chat, Aowu 2026-11-20 "ok A go"): one person on a touch phone held sideways → the bar floats over
// the top and the maze takes the whole height. Off: window.SB_TALL = false. Tablets (≥ 560 px tall), desk and 2–4 player corners unchanged.
function sbTall24zc(){ return window.SB_TALL !== false && window.innerHeight < 560; }
function sbTallFit24zc(sp){
  if(!sp.classList.contains('sbtall') || !G) return;
  const bar = $('gbar'), bd = bar && bar.querySelector('.gb-board'); if(!bar) return;
  sp.style.setProperty('--sbbar', Math.round(bar.getBoundingClientRect().height) + 'px');
  if(!bd) return; sp.style.setProperty('--sbclk', '1');
  const R = boardRect(), st = $('stage').getBoundingClientRect(), b = bd.getBoundingClientRect(); if(!b.height) return;
  const wall = st.top + R.OY + R.CS - 3;   // the clock stays on the maze's top wall row (nobody walks there)
  sp.style.setProperty('--sbclk', Math.max(0.7, Math.min(1, (wall - b.top) / b.height)).toFixed(3));
}
// sb-9a2: phone on its side — the map takes the full height between the bar and the bottom; the two side panels share what's left,
// then the stick + buttons grow to fill their panel (≥ 72 px buttons, side by side when the panel is wide enough)
function layoutSide(){
  const sp = $('scr-play'); if(!G || !sp.classList.contains('side')) return;
  const L = $('sidechips-l'), Rr = $('sidechips-r'), W = window.innerWidth, ar = $('arena').getBoundingClientRect(), M = G.M, H = ar.height;
  const minP = 150, CS = Math.max(8, Math.floor(Math.min((H - 8) / M.H, (W - minP * 2 - 8) / M.W))), pw = Math.max(minP, Math.floor((W - CS * M.W - 8) / 2));
  sp.style.setProperty('--pw', pw + 'px');
  const ch = el => el ? el.getBoundingClientRect().height : 0, pad = (el, side) => { const c = el && el.closest('.ctl'); if(!c) return 0; const cs = getComputedStyle(c); return parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight); };
  const inner = pw - Math.max(pad(L), pad(Rr)) - 4, safeB = 22;
  const padSize = Math.round(Math.max(96, Math.min(inner, H - ch(L) - safeB - 36, 176)));
  const roomR = H - ch(Rr) - safeB - 14;
  let b = Math.min(96, Math.floor((inner - 12) / 2)), dir = 'row', lift = 0;
  if(b < 72 || roomR < b * 1.5){ dir = 'column'; b = Math.round(Math.max(64, Math.min(92, inner, (roomR - 12) / 2))); } else { b = Math.round(Math.max(72, Math.min(b, roomR / 1.45))); lift = Math.round(b * 0.42); }
  sp.style.setProperty('--pad', padSize + 'px'); sp.style.setProperty('--btn', b + 'px'); sp.style.setProperty('--bdir', dir); sp.style.setProperty('--sklift', lift + 'px');
  [L, Rr].forEach(x => x && x.classList.toggle('tight', inner < 150));
  if(window.UI && UI.pad){ sp.style.setProperty('--pad', Math.round(Math.max(120, Math.min(padSize, UI.pad.px('stick')))) + 'px'); UI.pad.arcAll(sp); }   // 🕹️ pz-1: the shared stick size, ring placed
  sbTallFit24zc(sp);   // 📱 24z-c
}
/* 💥📣 sb-9a — ROOM FOR COMICS + THE CROWD (the 💥 Comics chat / 📣 Cheer chat wire their kits here; this game draws no comics itself)
   GameComic.mode()        → 'battle' | 'classic' | 'hold' | 'stage' | ''  (the live match's mode)
   GameComic.hold(on)      → quietly freeze / unfreeze the match (no pause card; presses ignored; drawing + bomb glow go on)
   GameComic.listen(fn)    → fn(mode, event, M) for every engine event (BOP.takeEvents → handleEvents) — e.g. caught {i, by}, pop {chain}, roundend, matchend, bossdown, ghost, swap, comeback, sudden; returns an unlisten fn
   GameComic.log()         → this match's events [{t, k, …}] (last 600) — strips come from what really happened
   GameComic.area()        → the play-area element (#stage) · GameComic.board() → the maze rect (page px) · GameComic.free() → free rects beside the maze (no maze, chips or controls) for side strips / the crowd
   slots: #comics-slot-setup, #cheer-slot-setup (setup ⚙️ Extras row) · #comic-strip-slot (result card) */
const GameComic = {
  _fns: [], _log: [],
  mode(){ return G && !G.over ? G.M.mode : ''; },
  hold(on){ if(!G || G.over) return false; G.hold = !!on; if(!on) G.last = performance.now(); return true; },
  listen(fn){ this._fns.push(fn); return () => { this._fns = this._fns.filter(f => f !== fn); }; },
  log(){ return this._log.slice(); },
  area(){ return $('stage'); },
  board(){ if(!G) return null; const R = boardRect(), st = $('stage').getBoundingClientRect(), M = G.M; return {left: st.left + R.OX, top: st.top + R.OY, width: R.CS * M.W, height: R.CS * M.H, cell: R.CS}; },
  free(){ const b = this.board(); if(!b) return []; const st = $('stage').getBoundingClientRect(), taken = [...document.querySelectorAll('#scr-play .pchip, #scr-play .tpad, #scr-play .tb, #scr-play .corner')].map(e => e.getBoundingClientRect()).filter(r => r.width);
    const box = [{left: st.left, top: st.top, right: b.left - 4, bottom: st.bottom}, {left: b.left + b.width + 4, top: st.top, right: st.right, bottom: st.bottom}, {left: st.left, top: st.top, right: st.right, bottom: b.top - 4}, {left: st.left, top: b.top + b.height + 4, right: st.right, bottom: st.bottom}];
    return box.map(r => { taken.forEach(t => { if(t.left < r.right && t.right > r.left && t.top < r.bottom && t.bottom > r.top){ if(t.bottom - r.top < r.bottom - t.top) r.top = Math.max(r.top, t.bottom + 4); else r.bottom = Math.min(r.bottom, t.top - 4); } }); return {left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.right - r.left), height: Math.round(r.bottom - r.top)}; }).filter(r => r.width >= 60 && r.height >= 60); },
  _reset(){ this._log = []; },
  _feed(list){ if(!list || !list.length || !G) return; const M = G.M, t = Math.round((M.t || 0) * 100) / 100;
    list.forEach(e => { this._log.push(Object.assign({t}, e)); this._fns.forEach(f => { try{ f(M.mode, e, M); }catch(err){} }); }); if(this._log.length > 600) this._log.splice(0, this._log.length - 600); }
};
window.GameComic = GameComic;
function legendHtml(){
  const hs = humanSeats(); if(hs.length === 1) return '<span><b>Move</b> arrows / W A S D</span><span><b>💣</b> ' + kk('Space') + ' / ' + kk(KEYS[0].plant) + '</span><span><b>✨</b> ' + kk('ShiftLeft') + ' / ' + kk(KEYS[0].skill) + '</span><span>double-tap = 💨 dash · 📡 remote</span>';
  return hs.map((s, j) => '<span style="color:' + SEAT_COL[j] + '"><b style="color:inherit">P' + (j + 1) + '</b> ' + [KEYS[j].up, KEYS[j].left, KEYS[j].down, KEYS[j].right].map(kk).join('') + ' 💣' + kk(KEYS[j].plant) + ' ✨' + kk(KEYS[j].skill) + '</span>').join('') + '<span>🎮 controllers work too</span>';
}
function padHtml(){ return '<div class="tpad"><span class="mvtip">🕹️ move</span><span class="ar u">▲</span><span class="ar d">▼</span><span class="ar l">◀</span><span class="ar r">▶</span><div class="knob"></div></div>'; }
function btnHtml(){ return '<div class="tbtns"><button class="tb plant" data-b="plant">💣<small>plant</small></button><button class="tb sk" data-b="skill">✨<small>skill</small></button></div>'; }
function ctlEl(seat, parts){
  const el = document.createElement('div'); el.className = 'ctl'; el.dataset.seat = seat;
  el.innerHTML = (parts !== 'btns' ? padHtml() : '') + (parts !== 'pad' ? btnHtml() : '');
  bindCtl(el, seat); pzRing(el, parts); return el;
}
// 🕹️ pz-1 PADS (✨ polish chat): 💣 Plant = main, ✨ Skill one gap away (above it in the narrow side panel, ↖ under an upright phone)
function pzRing(el, parts){ if(!(window.UI && UI.pad) || parts === 'pad') return; const box = el.querySelector('.tbtns'), pl = el.querySelector('.tb.plant'), sk = el.querySelector('.tb.sk'); if(!box || !pl) return;
  UI.pad.dress(pl, '💣', 'Plant', '#FF9F1C', true); UI.pad.dress(sk, '✨', 'Skill', '#3DDCB4'); UI.pad.fan(box, pl, [sk], {a1: parts === 'btns' ? 90 : 135}); }
function cornerEl(seat, spot){
  const el = document.createElement('div'), j = humanSeats().indexOf(seat); el.className = 'corner ' + spot; el.dataset.seat = seat; el.style.setProperty('--pc', SEAT_COL[j]);
  el.innerHTML = padHtml() + btnHtml() + '<span class="lab">P' + (j + 1) + ' ' + UI.esc(G.M.P[seat].name) + '</span>';
  bindCtl(el, seat); return el;
}
function toggleCornerHelp(){
  const ex = $('stage').querySelector('.chelp'); if(ex){ ex.remove(); return; }
  const d = document.createElement('div'); d.className = 'chelp';
  d.innerHTML = '<b>📱 One tablet, everyone in a corner</b><br>' + humanSeats().map((s, j) => '<span style="color:' + SEAT_COL[j] + '">●</span> P' + (j + 1) + ' ' + UI.esc(G.M.P[s].name)).join(' · ') +
    '<br>🕹️ Drag the round pad to walk · 💣 plant · ✨ skill (kick / toss / 🏏 hit / 👻 trap) · hold 💣 = carry · tap the pad twice fast = 💨 dash<br><button class="pill" style="margin-top:6px" onclick="toggleCornerHelp()">Got it</button>';
  $('stage').appendChild(d);
}
function bindCtl(el, seat){
  const pad = el.querySelector('.tpad');
  if(pad){
    let pid = null; const T = UI.stickTracker(pad, {player: G && G.M.P[seat] ? G.M.P[seat].name : undefined}), k = pad.querySelector('.knob');   // sb-9a: each player's own 🕹️ joystick skin   // r33: follow-the-thumb stick (UiKit) — walks after ~6 px, turns after a tiny slide
    const set = (e, first) => { const v = first ? T.start(e) : T.at(e), prev = G.touch[seat] && G.touch[seat].dir;
      let d = UI.stickDir(v, prev, 0.5, 0);
      if(prev && v.m < 0.3 && Math.hypot(v.fx, v.fy) < 0.25) d = null;   // stop = thumb back in the middle (or lift it) — a little wobble never stops you or fakes a 💨 double-tap
      const m = Math.min(1, Math.hypot(v.fx, v.fy)), a = Math.atan2(v.fy, v.fx), r = pad.getBoundingClientRect(); k.style.transform = 'translate(' + (Math.cos(a) * m * 0.3 * r.width) + 'px,' + (Math.sin(a) * m * 0.3 * r.height) + 'px)';
      pad.querySelectorAll('.ar').forEach(x => x.classList.toggle('lit', x.classList.contains(d || '-')));
      G.touch[seat] = {dir: d};
      if(d && d !== prev){ tapDir(seat, d); if(navigator.vibrate) try{ navigator.vibrate(6); }catch(er){} } };
    pad.addEventListener('pointerdown', e => { e.preventDefault(); pad.classList.add('on'); pid = e.pointerId; try{ pad.setPointerCapture(pid); }catch(er){} set(e, true); });
    UI.onFastMove(pad, e => { if(e.pointerId === pid) set(e); });
    const end = e => { if(e.pointerId !== pid) return; pid = null; pad.classList.remove('on'); G && (G.touch[seat] = {dir: null}); pad.querySelector('.knob').style.transform = ''; pad.querySelectorAll('.ar').forEach(a => a.classList.remove('lit')); };
    pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
  }
  el.querySelectorAll('.tb').forEach(b => {
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('down'); if(G && b.dataset.b === 'plant'){ G.plantDown = G.plantDown || {}; G.plantDown[seat] = true; } if(G && !G.paused && !G.hold) BOP.press(G.M, seat, b.dataset.b); });
    const up = () => { b.classList.remove('down'); if(G && G.plantDown && b.dataset.b === 'plant') G.plantDown[seat] = false; }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
  });
}
// double-tap a direction = 💨 dash (keys, pad and controllers)
function tapDir(seat, d){
  if(!G) return; const now = performance.now(), last = G.tap[seat];
  if(last && last.d === d && now - last.t < 300){ const v = {u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0]}[d]; BOP.press(G.M, seat, 'dash', v[0], v[1]); G.tap[seat] = null; return; }
  G.tap[seat] = {d, t: now};
}
let DPR = 1;
function resize(){
  if(!G) return; const st = $('stage'), cv = $('cv'), r = st.getBoundingClientRect();
  DPR = Math.min(2, window.devicePixelRatio || 1) * (G.q || 1); DPR = Math.max(1, DPR);
  cv.width = Math.max(1, Math.round(r.width * DPR)); cv.height = Math.max(1, Math.round(r.height * DPR)); G.sw = r.width; G.sh = r.height;
  G.staticKey = ''; placeChips();
  const r2 = st.getBoundingClientRect();   // sb-9a: placing the chips can change the play area → measure again so the map is never stretched
  if(Math.abs(r2.width - r.width) > 0.5 || Math.abs(r2.height - r.height) > 0.5){ cv.width = Math.max(1, Math.round(r2.width * DPR)); cv.height = Math.max(1, Math.round(r2.height * DPR)); G.sw = r2.width; G.sh = r2.height; G.staticKey = ''; }
}
// sb-9a: watch the play area itself (iOS sends 'resize' before the new layout settles) + a late re-layout after rotating
let SB_RO = null;
function watchStage(){
  if(SB_RO || !window.ResizeObserver) return;
  SB_RO = new ResizeObserver(() => { if(!G || $('scr-play').classList.contains('hidden')) return; const r = $('stage').getBoundingClientRect(); if(Math.abs(r.width - G.sw) > 0.5 || Math.abs(r.height - G.sh) > 0.5) resize(); });
  SB_RO.observe($('stage'));
}
function relayoutSoon(){ [120, 450].forEach(ms => setTimeout(() => { if(G && !$('scr-play').classList.contains('hidden')) layoutPlay(); }, ms)); }
window.addEventListener('orientationchange', relayoutSoon);
if(window.visualViewport) window.visualViewport.addEventListener('resize', () => { if(G) relayoutSoon(); });
function boardRect(){
  const M = G.M, I = G.inset || {l: 0, r: 0, t: 0, b: 0}, side = G.chipSide ? (G.chipMini ? 124 : 160) : 0;
  const uw = G.sw - I.l - I.r - side * 2 - 8, uh = G.sh - I.t - I.b - 8;
  const CS = Math.max(8, Math.floor(Math.min(uw / M.W, uh / M.H)));
  return {CS, OX: Math.round(I.l + side + (uw - CS * M.W) / 2 + 4), OY: Math.round(I.t + (uh - CS * M.H) / 2 + 4)};
}
/* ---------- player chips (avatar + power-ups + 🛡️) ---------- */
function buildChips(){
  const M = G.M; G.chipEls = {};
  const make = p => { const d = document.createElement('div'); d.className = 'pchip'; d.style.setProperty('--pc', chipCol(p)); d.innerHTML = CHIP_HTML;
    G.avFor(p.i); drawPreviewCanvas(d.querySelector('canvas'), G.winAvs[p.i] || myAvatar(p.name), {name: p.name, t: 1}); G.chipEls[p.i] = d; return d; };
  ['chipstrip', 'chipcol-l', 'chipcol-r'].forEach(id => { $(id).innerHTML = ''; });
  M.P.forEach(p => make(p));
  placeChips();
}
const CHIP_HTML = '<div class="por"><canvas width="68" height="80"></canvas><span class="rx"></span></div><div class="tx"><div class="nl"><span class="n"></span><span class="stt"></span></div><div class="hp hidden"></div><div class="pw"></div></div>';
function chipCol(p){ if(G.M.teams) return p.team === 0 ? '#FF7A1A' : '#3D8BFD'; if(p.human) return SEAT_COL[humanSeats().indexOf(p.i)] || '#FF7A1A'; return BOT_COL; }
function placeChips(){
  if(!G || !G.chipEls) return;
  const wide = G.sw - (G.inset ? G.inset.l + G.inset.r : 0) > 0 && !$('scr-play').classList.contains('corners');
  const M = G.M, need = M.W * 26 + 330;
  const sideCtl = $('scr-play').classList.contains('side');
  G.chipMini = false; G.chipPanel = sideCtl && !!$('sidechips-l');   // sb-9a2: phone on its side → cards live in the side panels, the map keeps the whole stage
  G.chipSide = !G.chipPanel && wide && G.sw >= need && G.sw > G.sh * 1.15;
  ['chipcol-l', 'chipcol-r'].forEach(id => $(id).classList.toggle('mini', !!G.chipMini));
  $('chipstrip').classList.toggle('hidden', G.chipSide || G.chipPanel); $('chipcol-l').classList.toggle('hidden', !G.chipSide); $('chipcol-r').classList.toggle('hidden', !G.chipSide);
  M.P.forEach((p, j) => { const el = G.chipEls[p.i]; if(!el) return; const host = G.chipPanel ? $(j % 2 ? 'sidechips-r' : 'sidechips-l') : G.chipSide ? $(j % 2 ? 'chipcol-r' : 'chipcol-l') : $('chipstrip'); if(el.parentNode !== host) host.appendChild(el); });
  G.staticKey = ''; if(G.chipPanel) layoutSide();
}
function chipText(p){
  const M = G.M, ic = [];
  if(p.human || !p.ghost){ ic.push('💣' + p.bombsMax, '🔥' + p.fire); if(p.spd) ic.push('👟' + p.spd); ['kick', 'toss', 'remote', 'dash'].forEach(k => { if(p[k]) ic.push(POWER_INFO[k][0]); }); if(p.shield) ic.push('🛡️'); }
  if(M.mode === 'battle' && M.L.lives > 1 && p.human) ic.unshift('❤️' + Math.max(0, p.lives));
  if(M.mode === 'hold'){ const side = M.teams ? p.team : p.i; ic.unshift('🏳️' + Math.floor(M.hold[side] || 0) + '/' + BOP.HOLD_TARGET[M.level]); }
  if(M.mode === 'battle' && M.need > 1) ic.unshift('🏆' + M.wins[p.i]);
  if(p.err > 0) ic.push('😵');
  return ic.join(' ');
}
const HUD_LAST = {};
function setTxt(id, v){ if(HUD_LAST[id] === v) return; HUD_LAST[id] = v; const e = $(id); if(e) e.textContent = v; }
function hud(){
  const M = G.M;
  const left = M.mode === 'battle' ? 'Round ' + M.round + ' · best of ' + (M.need * 2 - 1) : M.mode === 'hold' ? '🏳️ Hold ' + BOP.HOLD_TARGET[M.level] + ' s' : M.mode === 'classic' ? '💩 Classic' : M.mode === 'stage' ? THEMES[G.theme].icon + ' World ' + (M.stage.world + 1) + ' · ' + (M.stage.boss ? '👑 Boss' : 'Stage ' + (M.stage.n + 1)) : '';
  if(HUD_LAST.lv !== left){ HUD_LAST.lv = left; BAR.level(left); }   // 🎛️ p1c: round / mode → the level chip
  const sd = M.mode !== 'hold' ? M.L.sudden : 0, t = M.state === 'ready' ? 0 : M.t;
  let clock = fmtS(t), info = '';
  if(M.sd) info = THEMES[G.theme].sdIcon + ' Sudden death';
  if(M.mode === 'stage'){ const left2 = Math.max(0, stageTimeOf(M) - t); clock = fmtS(left2); const foes = M.P.filter(p => p.foe && p.alive).length;
    info = M.stage.boss ? (M.boss && M.boss.alive ? '👑 ' + M.boss.name + ' ' + '❤️'.repeat(M.boss.hp) : '👑 Beaten!') : foes ? '🤖 ' + foes + ' bot' + (foes > 1 ? 's' : '') + ' left' : (M.grid[M.exit] === 0 ? '🚪 Exit open — go!' : '🚪 Find the exit under a block!');
  }
  else if(M.mode === 'classic'){ info = t < 60 ? '🎯 throws at 1:00' : t < 90 ? '🧱 concrete at 1:30' : t < 120 ? '🤖 bots at 2:00' : '🤖 family bots!'; }
  else if(sd && t < sd) info = '⏰ ' + fmtS(sd - t);
  if(M.mode === 'hold' && M.zoneSide != null){ info = M.zoneSide === -2 ? '⚔️ Zone shared — paused' : M.zoneSide >= 0 ? (M.teams ? (M.zoneSide ? '🔵 Moon' : '🟠 Sun') + ' holds' : UI.esc(M.P[M.zoneSide].name) + ' holds') : '🏳️ Zone empty'; }
  const sdOn = M.mode === 'stage' ? Math.max(0, stageTimeOf(M) - t) < 20 : !!M.sd; BAR.time(clock, sdOn);   // ⏱ amber = sudden death / stage time running out
  if(HUD_LAST.info !== info){ HUD_LAST.info = info; BAR.count('info', '', info || '·', 'What happens next'); }
  M.P.forEach(p => { const el = G.chipEls && G.chipEls[p.i]; if(!el) return;
    const nm = (p.human ? '' : (BOT_KIND[p.kind] || ['🤖'])[0] + ' ') + p.name + (p.ghost ? ' 👻' : p.edge ? ' 💩' : (!p.alive && M.mode !== 'hold') ? ' 💫' : '');
    const k1 = 'n' + p.i;
    if(G.lastHud[k1] !== nm){ G.lastHud[k1] = nm; el.querySelector('.n').textContent = nm; }
    polishChip(p, el);
    const out = !p.alive && !p.ghost && !p.edge && M.mode !== 'hold'; el.classList.toggle('out', out || !!p.gone); el.classList.toggle('ghost', !!p.ghost);
  });
  if(!G.chipEls) return;
  M.P.forEach(p => { if(!G.chipEls[p.i]){ const d = document.createElement('div'); d.className = 'pchip'; d.style.setProperty('--pc', BOT_COL); d.innerHTML = CHIP_HTML; G.avFor(p.i); drawPreviewCanvas(d.querySelector('canvas'), G.winAvs[p.i], {name: p.name, t: 1}); G.chipEls[p.i] = d; placeChips(); } });
}

/* 🎬 SOUL BOPPER BEATS (b3b7, 🧱 baseline chat, 2026-11-18) START — every action = 3–5 beats on the shared timeline (Acting.play).
   The ENGINE owns contact: its event = the contact tick (sbpEvent). Taps (💣 plant · 👟 kick · 🤾 toss · 🏏 bat · 💨 dash · 🪤 trap) play FROM
   contact. Real wind-ups where the game holds or the page sees it coming (sbpAhead, once a frame): 🏋️ the 0.22 s hold before a lift ·
   ✨ a power-up ≤ 0.25 s ahead · 😱 a pop on your cell in ≤ 0.25 s (duck + cover; contact = the pop) — held until it happens, let go if not.
   💫 caught = at once; the game's own 90 ms freeze (G.freeze) is the hit-stop. 🏆 the round winner jumps, then the old dance.
   Clock = G.bt (engine steps). Acts: 🎭 BLOCK `soulbopper` (AvatarActs). Per-player act state lives outside the engine (WeakMap). */
const SBP_HAS = typeof Acting !== 'undefined' && typeof Acting.play === 'function', SBP_LEAD = 0.25;
window.SBP_LOG = window.SBP_LOG || [];
const SBP_M = new WeakMap();
function sbpH(p){ let H = SBP_M.get(p); if(!H){ H = {act: null}; SBP_M.set(p, H); } return H; }
function sbpClock(){ return G ? (G.bt || 0) : 0; }
function sbpStart(p, act, contactAt, o){
  o = o || {}; if(!SBP_HAS || !G || !G.M || !p || !Acting.act(act)) return null;
  const now = sbpClock(), H = sbpH(p), cur = H.act, from = cur && cur.run.last && !cur.run.done ? cur.run.last : undefined;
  const run = Acting.play({name: p.name, av: G.avFor ? G.avFor(p.i) : null}, act, {t0: now, contactAt, from, onContact: r => {
    window.SBP_LOG.push({p: p.i, act, t: sbpClock(), at: r.contactT}); if(window.SBP_LOG.length > 300) window.SBP_LOG.shift(); }});
  H.act = {act, run, wait: !!o.wait, hold: o.hold || null, key: o.key || null};
  run.at(contactAt != null && contactAt <= now + 1e-6 ? Math.max(now, run.contactT) + 1e-6 : now); return H.act;
}
// the engine's events (right after the step that made them) → contact now
function sbpEvent(e){
  const M = G && G.M; if(!SBP_HAS || !M) return; const P = e.i != null ? M.P[e.i] : null, now = sbpClock();
  const K = {plant: 'soulbopper.plant', kick: 'soulbopper.kick', toss: 'soulbopper.toss', edgethrow: 'soulbopper.toss', hit: 'soulbopper.bat',
    dash: 'soulbopper.dash', carry: 'soulbopper.lift', pick: 'soulbopper.grab', caught: 'soulbopper.caught', comeback: 'soulbopper.cheer', respawn: 'soulbopper.cheer'}[e.k];
  if(K && P) sbpStart(P, K, now);
  else if(e.k === 'lock' && M.P[e.ghost]) sbpStart(M.P[e.ghost], 'soulbopper.trap', now);
  else if(e.k === 'swap' && M.P[e.ghost]) sbpStart(M.P[e.ghost], 'soulbopper.swap', now);
  else if(e.k === 'pop') M.P.forEach(q => { const A = sbpH(q).act; if(A && A.key && A.key[0] === 'b' && !A.run.fired) sbpStart(q, 'soulbopper.brace', now); });   // 😱 the bang = contact
  else if(e.k === 'roundend' && M.P[e.winner]) sbpStart(M.P[e.winner], 'soulbopper.win', now + 0.22);
}
function sbpSpeed(M, p){ let v = 2.7 + 0.42 * (p.spd || 0); if(!p.human) v *= p.botSpeed || M.L.botSpeed || 1; if(p.slow > 0) v *= 0.5; return v; }   // = the engine's speedOf (read only)
// look ahead (once a frame): 🏋️ a lift being held · 😱 a pop coming to your cell · ✨ a power-up you are walking into
function sbpAhead(){
  const M = G && G.M; if(!SBP_HAS || !M || M.state !== 'play' || G.over) return; const now = sbpClock();
  if(G._dT !== M.totalT){ G._D = BOP.dangerMap(M); G._dT = M.totalT; } const D = G._D;
  M.P.forEach(p => {
    if(!p.alive || p.ghost || p.edge || p.lock > 0) return; const H = sbpH(p), A = H.act; if(A && !A.run.fired) return;   // a wind-up already waiting
    const cx = Math.round(p.x), cy = Math.round(p.y);
    if(p.toss && p.holdT > 0 && !BOP.carriedBy(M, p)){ const b = BOP.bombAt(M, cx, cy);   // 🏋️ the hold IS the anticipation
      if(b && b.owner === p.i && !b.slide && !b.fly){ sbpStart(p, 'soulbopper.lift', now + Math.max(0.03, 0.22 - p.holdT), {wait: true, hold: 'lift', key: 'lift'}); return; } }
    const d = D[cy * M.W + cx];
    if(d > 0.02 && d <= SBP_LEAD && !p.shield){ const key = 'br' + Math.round((now + d) * 20); if(H.braceKey !== key){ H.braceKey = key; sbpStart(p, 'soulbopper.brace', now + d, {wait: true, key}); return; } }
    if(p.moving){ const it = BOP.itemAt(M, cx, cy) || BOP.itemAt(M, cx + (p.dx || 0), cy + (p.dy || 0));
      if(it && !it.exit){ const rem = Math.abs(it.x - p.x) + Math.abs(it.y - p.y) - 0.45, tc = rem / sbpSpeed(M, p), key = 'g' + it.x + ',' + it.y;
        if(tc > 0.02 && tc <= SBP_LEAD && H.grabKey !== key){ H.grabKey = key; sbpStart(p, 'soulbopper.grab', now + tc, {wait: true, key}); } } }
  });
}
// the frame to draw now (null = the game's own pose / gesture); a waiting wind-up holds just before contact, then lets go
function sbpFrame(p){
  const H = p && SBP_M.get(p), A = H && H.act; if(!A || !G) return null; const now = sbpClock() + Math.min(Math.max(0, G.acc || 0), BOP.DT);
  if(A.wait && !A.run.fired && now >= A.run.contactT - 0.02){
    const keep = A.hold === 'lift' ? p.holdT > 0 && !!p.hold : now <= A.run.contactT + 0.3;
    if(!keep){ H.act = null; return null; } return A.run.last; }
  const f = A.run.at(now); if(f.done){ H.act = null; return null; } return f;
}
// draw the player with the beat frame when one is playing (🏏 your BatStick for the whole swing); else the old way
function sbpDraw(g, p, A, x, feet, k, t, pose){
  const F = p.lock > 0 ? null : sbpFrame(p);
  if(F){ const who = Object.assign({}, A, {gest: null, stance: ''}), H = SBP_M.get(p);
    if(H && H.act && H.act.act === 'soulbopper.bat'){ const bd = batFor(p.name); if(bd && typeof BatStick !== 'undefined') who.av = BatStick.hold(A.av, bd); }
    try { Acting.draw(g, who, x, feet, k, F, {t, keep: true, ride: 'keep'}); return; } catch(e){ /* fall back to the old drawing */ } }
  drawAvatar(g, A, x, feet, k, {t, pose: pose || undefined});
}
/* 🎬 SOUL BOPPER BEATS END */
/* ================= LOOP ================= */
function frame(now){
  if(!G) return; G.raf = requestAnimationFrame(frame);
  let dt = Math.min(0.1, (now - G.last) / 1000); G.last = now;
  padPoll();
  if(!G.paused && !G.over && !G.hold){   // sb-9a: G.hold = GameComic.hold (quiet freeze, drawing goes on)
    readInputs();
    const allOut = !G.M.P.some(p => p.human && (p.alive || p.ghost || p.edge || (G.M.mode === 'hold')));
    G.watch = allOut && G.M.state === 'play';
    const mult = (G.watch ? 3 : 1) * SPEED;
    if(G.freeze > 0){ G.freeze -= dt; dt = 0; }   // 💥 hit-stop: a split-second freeze when someone is caught
    G.acc += dt * mult; let n = 0;
    while(G.acc >= BOP.DT && n < 30){ BOP.step(G.M, BOP.DT); G.bt = (G.bt || 0) + BOP.DT; /* 🎬 b3b7 clock */ G.acc -= BOP.DT; n++; handleEvents(BOP.takeEvents(G.M)); }
    G.t += dt; stepFx(dt * mult);
    if(typeof sbpAhead === 'function') sbpAhead();   /* 🎬 b3b7: wind-ups that can be seen coming */
    if(G.M.done && !G.shown && G.M.state === 'end' && G.M.endT < 0.6) finishMatch();
  }
  if(window.Cheer) Cheer.pause(!!(G && G.paused));   /* 📣 cs-2b (not on hold / game over: the crowd keeps cheering) */
  quality(dt);
  draw(); hud();
}
function quality(dt){
  // auto quality: lower the canvas sharpness on slow devices (never below 1)
  G.ema = G.ema == null ? dt : G.ema * 0.95 + dt * 0.05; G.qT = (G.qT || 0) + dt;
  if(G.qT > 2 && G.ema > 0.024 && (G.q || 1) > 0.62 && DPR > 1){ G.q = (G.q || 1) * 0.8; G.qT = 0; resize(); try{ localStorage.setItem('sp_soulbopper_q', String(G.q)); }catch(e){} }
}
function seatKeys(seat){
  const hs = humanSeats(), j = hs.indexOf(seat);
  if(hs.length === 1) return [KEYS[0], KEYS[1], {up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', plant: 'Space', skill: 'ShiftLeft'}, {plant: 'ShiftRight', skill: 'ShiftRight', up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD'}];
  return [KEYS[j]];
}
function readInputs(){
  const M = G.M;
  humanSeats().forEach((seat, j) => {
    const ks = seatKeys(seat), has = a => ks.some(K => G.keys.has(K[a]));
    const t = G.touch[seat] && G.touch[seat].dir, pd = G.pads[j] || {};
    let u = has('up') || t === 'u' || pd.u, d = has('down') || t === 'd' || pd.d, l = has('left') || t === 'l' || pd.l, r = has('right') || t === 'r' || pd.r;
    const skill = M.P[seat]; if(skill && skill.human && hs1Skill(seat)) { /* skill button is pressed via events */ }
    BOP.setCtrl(M, seat, u, d, l, r);
    BOP.setHold(M, seat, !!(has('plant') || (G.plantDown && G.plantDown[seat]) || pd.plant));   // sb-9: hold 💣 = carry
  });
}
function hs1Skill(){ return false; }
function padPoll(){
  const pads = padsNow(); if(!pads.length || !G) return;
  const hs = humanSeats();
  pads.forEach((p, j) => {
    const seat = hs[j % Math.max(1, hs.length)]; if(seat == null) return;
    const ax = p.axes || [], b = i => !!(p.buttons[i] && p.buttons[i].pressed);
    const pv = G.padPrev[j] || {}, T = k => pv[k] ? 0.2 : 0.3;   // r33: controller stick reacts at 30 % (was 45 %), lets go below 20 %
    const st = {u: (ax[1] || 0) < -T('u') || b(12), d: (ax[1] || 0) > T('d') || b(13), l: (ax[0] || 0) < -T('l') || b(14), r: (ax[0] || 0) > T('r') || b(15), plant: b(PADCFG.plant), skill: b(PADCFG.skill) || b(1), pause: b(9)};
    const prev = G.padPrev[j] || {};
    if(!G.paused && !G.hold){ if(st.plant && !prev.plant) BOP.press(G.M, seat, 'plant'); if(st.skill && !prev.skill) BOP.press(G.M, seat, 'skill'); ['u', 'd', 'l', 'r'].forEach(k => { if(st[k] && !prev[k]) tapDir(seat, k); }); }
    if(st.pause && !prev.pause) togglePause();
    G.padPrev[j] = st; G.pads[hs.indexOf(seat)] = st;
  });
}
function togglePause(){ if(!G || G.over) return; G.paused = !G.paused; UI.pauseIcon($('pause-btn'), G.paused); banner(G.paused ? '⏸ Paused — tap ▶ to play' : '💣 Go!', 'good'); }
function pauseGame(){ if(G && !G.paused && !G.over){ G.paused = true; UI.pauseIcon($('pause-btn'), true); } }
function leavePlay(){
  if(!G) return; pauseGame();
  UI.confirm ? UI.confirm('Leave this game?', 'Your bombs will stop ticking.', 'Leave', 'Keep playing').then(ok => { if(ok) backToMenu(); else togglePause(); }) : backToMenu();
}
function backToMenu(){ if(window.Cheer) Cheer.unmount(); /* 💬 24t-d off */ if(window.UI && UI.callout) UI.callout.setup(null); if(G) cancelAnimationFrame(G.raf); G = null; hideResult(); $('bottom').innerHTML = ''; document.querySelectorAll('#arena .ctl, #stage .corner, #stage .help-btn, #stage .chelp').forEach(e => e.remove()); renderMenu(); showScreen('menu'); }
document.addEventListener('keydown', e => {
  if(!$('keys-sheet').classList.contains('hidden')){ if(takeKey(e)) return; HELD_TEST.add(e.code); renderHeld(); e.preventDefault(); return; }
  if(!G || $('scr-play').classList.contains('hidden')) return;
  if(e.code === 'Escape' || e.code === 'KeyP'){ togglePause(); e.preventDefault(); return; }
  if(e.repeat){ if(/^Arrow|Space|Page|Home|End/.test(e.code)) e.preventDefault(); return; }
  G.keys.add(e.code);
  if(!G.paused && !G.hold) humanSeats().forEach(seat => { seatKeys(seat).forEach(K => { if(K.plant === e.code) BOP.press(G.M, seat, 'plant'); if(K.skill === e.code) BOP.press(G.M, seat, 'skill'); ['up', 'down', 'left', 'right'].forEach(a => { if(K[a] === e.code) tapDir(seat, a[0] === 'u' ? 'u' : a[0] === 'd' ? 'd' : a[0] === 'l' ? 'l' : 'r'); }); }); });
  if(/^Arrow|Space|Page|Home|End|Numpad|Shift|Tab/.test(e.code)) e.preventDefault();
});
document.addEventListener('keyup', e => { if(!$('keys-sheet').classList.contains('hidden')){ HELD_TEST.delete(e.code); renderHeld(); return; } if(G) G.keys.delete(e.code); });
window.addEventListener('blur', () => { if(G) G.keys.clear(); });
window.addEventListener('resize', () => { if(G && !$('scr-play').classList.contains('hidden')) layoutPlay(); });

/* ================= SOUND (tiny synth) ================= */
let AC = null;
function boing(freq, len, type, vol, slide){
  try{ if(!UISound.get().enabled) return; AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t0 = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0); if(slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + len); g.gain.setValueAtTime((vol || 0.2) * (UISound.get().volume == null ? 1 : UISound.get().volume), t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + len);
    o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + len + 0.02); }catch(e){}
}
function popSound(big){ boing(big ? 140 : 190, 0.28, 'sawtooth', 0.14, 50); boing(90, 0.32, 'sine', 0.22, 40); }

/* ================= EVENTS → fx ================= */
function handleEvents(list){
  const M = G.M, T = THEMES[G.theme];
  if(typeof sbpEvent === 'function') list.forEach(sbpEvent);   /* 🎬 b3b7: contact = the engine's event */
  polishEvents(list);
  GameComic._feed(list);   // 💥📣 sb-9a: room for comics + crowd
  list.forEach(e => {
    const P = M.P[e.i];
    if(e.k === 'plant'){ const pb = M.bombs.find(b => b.id === e.id); if(pb && pb.skin === 'random' && P) pb.realSkin = randomSkin(P.name); boing(e.poo ? 260 : 330, 0.09, 'triangle', 0.18, e.poo ? 160 : 220); if(e.poo && P) addFx({k: 'emoji', ch: '😄', x: P.x, y: P.y - 0.9, life: 0.7, vy: -0.6, size: 0.5}); }
    else if(e.k === 'pop'){ popFx(e); }
    else if(e.k === 'reveal'){ addFx({k: 'emoji', ch: '✨', x: e.x, y: e.y, life: 0.6, size: 0.6}); }
    else if(e.k === 'pick'){ if(P && e.pk === 'error' && P.human) banner('😵 Error card! Controls go backwards', 'bad'); }
    else if(e.k === 'caught'){ boing(520, 0.4, 'square', 0.12, 120); if(P) addFx({k: 'dizzy', i: e.i, life: 1.3}); if(P && P.human) banner(pickOne(['💫 Caught!', '💥 Popped!', '😵 Oops!']) + (M.mode === 'battle' && P.lives > 0 && M.L.lives > 1 ? ' ❤️ ' + P.lives + ' left' : ''), 'bad'); }
    else if(e.k === 'life'){ /* blink handled by inv */ }
    else if(e.k === 'ghost'){ if(P && P.human) banner('👻 ' + P.name + ' is a ghost! Float to a player + ✨ = 🪤 trap', 'ghost'); boing(300, 0.6, 'sine', 0.14, 600); }
    else if(e.k === 'lock'){ boing(180, 0.3, 'square', 0.12, 140); addFx({k: 'chains', i: e.i, life: 1.0}); }
    else if(e.k === 'swap'){ const g = M.P[e.ghost], b = M.P[e.body]; boing(400, 0.5, 'triangle', 0.2, 1200); addFx({k: 'swirl', x: e.x, y: e.y, life: 1.0}); bigWord('👻 SOUL SWAP!', e.ghost, 'big'); if(g && g.human) say(g.name + ' is back!'); }
    else if(e.k === 'shieldoff'){ boing(880, 0.2, 'triangle', 0.15, 300); if(P) addFx({k: 'emoji', ch: '🛡️', x: P.x, y: P.y - 1, life: 0.7, vy: -1, size: 0.6}); }
    else if(e.k === 'kick' || e.k === 'toss'){ boing(240, 0.12, 'square', 0.12, 480); M.stats; }
    else if(e.k === 'hit'){ boing(900, 0.09, 'triangle', 0.16, 300); boing(160, 0.18, 'square', 0.14, 520); const hp = M.P[e.i]; if(hp){ feel(hp, '💪', 0.9); bopWord(e.i, 'Bop… WHACK!', 'small', {k: 'label', x: hp.x, y: hp.y - 1.4, text: 'Bop… WHACK!', ch: '🏏', life: 1.0, col: '#FFC845'}); } }
    else if(e.k === 'carry'){ boing(330, 0.1, 'sine', 0.12, 520); const cp = M.P[e.i]; if(cp) feel(cp, '😤', 0.8); }
    else if(e.k === 'selfbop'){ const sp = M.P[e.i]; if(sp){ feel(sp, '😵', 1.2); bopWord(e.i, 'Bop… SELF BOP!', 'small', {k: 'label', x: sp.x, y: sp.y - 1.4, text: 'Bop… SELF BOP!', ch: '😵', life: 1.2, col: '#FF7A7A'}); } }
    else if(e.k === 'homerun'){ const hp = M.P[e.i]; if(hp){ feel(hp, '🤩', 1.2); bopWord(e.i, 'Bop… HOME RUN!!', 'good', {k: 'label', x: hp.x, y: hp.y - 1.6, text: 'Bop… HOME RUN!!', ch: '🏏', life: 1.3, col: '#3DDCB4'}); } }
    else if(e.k === 'dash'){ if(P) addFx({k: 'emoji', ch: '💨', x: P.x - P.dx * 0.6, y: P.y - P.dy * 0.6 - 0.3, life: 0.5, size: 0.5}); }
    else if(e.k === 'scatter'){ /* items bounce in from the spot (drawn) */ }
    else if(e.k === 'sudden'){ banner(T.sdText, 'bad'); say('Sudden death!'); }
    else if(e.k === 'warn'){ }
    else if(e.k === 'strike'){ boing(110, 0.3, 'sawtooth', 0.16, 40); e.cells.forEach(c => addFx({k: 'strike', x: c[0], y: c[1], life: 0.5})); G.shake = Math.max(G.shake, 0.15); }
    else if(e.k === 'fill'){ addFx({k: 'fill', x: e.x, y: e.y, life: 0.4}); }
    else if(e.k === 'portal'){ addFx({k: 'emoji', ch: '🌀', x: M.P[e.a].x, y: M.P[e.a].y - 0.4, life: 0.8, size: 0.9}); addFx({k: 'emoji', ch: '🌀', x: M.P[e.b].x, y: M.P[e.b].y - 0.4, life: 0.8, size: 0.9}); }
    else if(e.k === 'zombified'){ if(P && P.human) banner('🧟 The horde got you — slooow for 3 s', 'bad'); }
    else if(e.k === 'comeback'){ boing(520, 0.3, 'triangle', 0.2, 1040); if(P) { bigWord('💩 COMEBACK!', e.i, 'big'); addFx({k: 'emoji', ch: '🎉', x: e.x, y: e.y - 1, life: 1, size: 0.8}); } }
    else if(e.k === 'edgethrow'){ boing(300, 0.15, 'sine', 0.12, 600); }
    else if(e.k === 'concrete'){ addFx({k: 'fill', x: e.x, y: e.y, life: 0.4}); }
    else if(e.k === 'join'){ banner('🤖 ' + M.P[e.i].name + ' jumped in!', 'gold'); }
    else if(e.k === 'respawn'){ if(P && P.human) banner('🏳️ Back in! Keep your 2 newest power-ups', 'good'); }
    else if(e.k === 'zonemove'){ banner('🏳️ The zone moved!', 'gold'); }
    else if(e.k === 'newpower'){ addFx({k: 'emoji', ch: '🎁', x: e.x, y: e.y - 0.5, life: 0.8, size: 0.6}); }
    else if(e.k === 'round'){ if(M.round > 1) banner('Round ' + M.round + (M.mode === 'battle' ? ' — ' + M.P.filter(p => M.wins[p.i] > 0).map(p => p.name + ' ' + M.wins[p.i]).join(' · ') : ''), 'gold'); G.staticKey = ''; buildChipsIfNew(); }
    else if(e.k === 'go'){ banner('💣 Go!', 'good'); }
    else if(e.k === 'roundend'){ const w = M.P[e.winner]; if(M.mode === 'battle' && !M.done) banner(w ? (w.human ? '🏆 ' : (BOT_KIND[w.kind] || ['🤖'])[0] + ' ') + w.name + ' wins round ' + e.round + '!' : '🤝 Nobody left — no point', w ? 'gold' : ''); if(w) { addFx({k: 'fireworks', x: w.x, y: w.y, life: 2}); } }
  });
}
function buildChipsIfNew(){ if(G && G.chipEls && Object.keys(G.chipEls).length !== G.M.P.length) buildChips(); }
let bannerTimer = 0;
function banner(text, kind){ const b = $('banner'); b.textContent = text; b.className = 'banner on' + (kind ? ' ' + kind : ''); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 2200); }
function bopWord(i, text, rank, fx){ if(!FX) return; /* 💬 24t-d */ if(window.UI && UI.callout && UI.callout.active()){ UI.callout(text, {who: i, rank}); return; } addFx(fx); }
function bigWord(text, who, rank){ if(!FX) return; /* 💬 24t bigWord */ if(window.UI && UI.callout && UI.callout.active()){ UI.callout(text, {who, rank}); return; } const host = $('bigword-host'); host.innerHTML = ''; const d = document.createElement('div'); d.className = 'big-word'; d.textContent = text; host.appendChild(d); setTimeout(() => d.remove(), 1200); }
function addFx(f){ f.t = 0; G.fx.push(f); if(G.fx.length > 320) G.fx.splice(0, G.fx.length - 320); }
function popFx(e){
  const T = THEMES[G.theme], cx = e.x, cy = e.y, sk = popLook(e);
  // the pop's creature runs out along each arm
  const ends = {}; e.cells.forEach(c => { if(c[2] !== 'c'){ const d = c[2]; if(!ends[d] || Math.abs(c[0] - cx) + Math.abs(c[1] - cy) > Math.abs(ends[d][0] - cx) + Math.abs(ends[d][1] - cy)) ends[d] = c; } });
  Object.keys(ends).forEach(d => { const c = ends[d]; addFx({k: 'runner', x0: cx, y0: cy, x1: c[0], y1: c[1], ch: sk.creature, life: 0.55, flip: c[0] < cx}); });
  if(e.cells.length <= 1) addFx({k: 'runner', x0: cx, y0: cy, x1: cx, y1: cy - 0.6, ch: sk.creature, life: 0.5});
  const o = sk.skin && window.BombSkins ? BombSkins.parse(sk.skin) : null;
  if(o && o.s === 4){ const extra = {robot: '❄️', zombie: '✋', sea: '🐙', sky: '⚡', dance: '🔦', space: '🌀', dino: '🔥'}[o.w]; e.cells.forEach(c => addFx({k: 'emoji', ch: extra, x: c[0], y: c[1] - 0.1, life: 0.8, size: 0.55})); bigWord('✨ ' + BombSkins.nameOf(sk.skin) + '!', e.owner, 'small'); }
}
function popLook(e){ const sk = e.skin && window.BombSkins ? BombSkins.popOf(e.skin) : null; return {creature: e.poo ? '💩' : sk || THEMES[G.theme].creature, skin: e.skin}; }
function stepFx(dt){ G.fx.forEach(f => f.t += dt); G.fx = G.fx.filter(f => f.t < f.life); if(G.shake > 0) G.shake -= dt; }

/* ================= DRAW ================= */
function draw(){
  const cv = $('cv'), g = cv.getContext('2d'), W = cv.width, H = cv.height;
  if(!(G.sw > 20 && G.sh > 20) || !W || !H) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const T = THEMES[G.theme]; g.fillStyle = T.bg; g.fillRect(0, 0, W, H);
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const R = boardRect(); R0 = R;
  g.save();
  if(G.shake > 0 && !reduced()){ g.translate((Math.random() - 0.5) * 8 * G.shake / 0.25, (Math.random() - 0.5) * 8 * G.shake / 0.25); }
  endZoom(g, R);
  drawWorld(g, G.sw, G.sh, G, R);
  g.restore();
  drawMood(g);
  if(G.M.state === 'ready') drawIntro(g, G.M); else if(G.goT != null) drawGo(g);
  if(G.watch){ g.setTransform(DPR, 0, 0, DPR, 0, 0); g.fillStyle = 'rgba(0,0,0,0.35)'; rrect(g, G.sw / 2 - 70, G.sh - 40, 140, 28, 14); g.fill(); g.fillStyle = '#fff'; g.font = '800 13px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('watching ×3', G.sw / 2 + 10, G.sh - 26); emo(g, '⏩', G.sw / 2 - 48, G.sh - 26, 14); }
}
function reduced(){ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
// one painter for play AND the world previews
function drawWorld(g, W, H, st, R){
  const M = st.M, T = THEMES[st.theme], CS = R.CS, t = st.t || 0;
  g.save(); g.translate(R.OX, R.OY);
  drawStatic(g, st, R);
  if(!st.preview) drawAmbient(g, st, CS, t);
  const X = x => (x + 0.5) * CS, Y = y => (y + 0.5) * CS;
  // 🏳️ zone
  if(M.zone){ const Z = M.zone, a = 0.25 + 0.12 * Math.sin(t * 4), col = M.zoneSide === -2 ? '255,255,255' : M.zoneSide >= 0 ? (M.teams ? (M.zoneSide ? '61,139,253' : '255,122,26') : hexRgb(chipColOf(st, M.zoneSide))) : '255,216,77';
    g.fillStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')'; rrect(g, Z.x * CS + 2, Z.y * CS + 2, Z.w * CS - 4, Z.h * CS - 4, CS * 0.3); g.fill();
    g.strokeStyle = 'rgba(' + col + ',0.9)'; g.lineWidth = Math.max(2, CS * 0.07); g.setLineDash([CS * 0.25, CS * 0.18]); g.lineDashOffset = -t * CS; rrect(g, Z.x * CS + 2, Z.y * CS + 2, Z.w * CS - 4, Z.h * CS - 4, CS * 0.3); g.stroke(); g.setLineDash([]);
    emo(g, '🏳️', X(Z.x + 1), Y(Z.y + 1) - CS * 0.1, CS * 0.55, 0.55); }
  // pop glow (Basic → Extreme): where each bomb will pop
  // (sb-8) the glow spreads out from the bomb, gets redder, and flashes white in the last 0.5 s
  if(M.L.glow && !st.preview){ M.bombs.forEach(b => { if(b.fly) return; const bx = Math.round(b.x), by = Math.round(b.y), urg = 1 - Math.max(0, b.t) / (b.max || 3), age = M.t - (b.born || 0), reach = age / 0.05, cells = BOP.blastCells(M, bx, by, b.r), last = b.t < 0.5 && Math.floor(t * 16) % 2 === 0;
    g.fillStyle = last ? 'rgba(255,240,220,0.42)' : 'rgba(255,' + Math.round(90 - urg * 60) + ',40,' + (0.1 + urg * 0.24).toFixed(3) + ')';
    cells.forEach(c => { const d = Math.abs(c[0] - bx) + Math.abs(c[1] - by); if(d > reach) return; rrect(g, c[0] * CS + 2, c[1] * CS + 2, CS - 4, CS - 4, CS * 0.18); g.fill(); }); }); }
  // sudden-death warnings
  M.warn.forEach(w => { const q = 1 - w.t / w.max; w.cells.forEach(c => { g.fillStyle = 'rgba(255,40,40,' + (0.15 + 0.3 * q + 0.15 * Math.sin(t * 18)).toFixed(3) + ')'; g.fillRect(c[0] * CS + 1, c[1] * CS + 1, CS - 2, CS - 2); });
    const c0 = w.cells[Math.floor(w.cells.length / 2)]; emo(g, T.strike, X(c0[0]), Y(c0[1]) - CS * (1.4 - q * 1.2), CS * 0.8, 0.5 + q * 0.5); });
  // 🗺️ every bot caught: the block hiding the 🚪 glows
  if(M.mode === 'stage' && M.exitOpen && M.exit >= 0 && M.grid[M.exit] === 2){ const ex = M.exit % M.W, ey = (M.exit - ex) / M.W; g.strokeStyle = 'rgba(255,216,77,' + (0.6 + 0.4 * Math.sin(t * 8)) + ')'; g.lineWidth = Math.max(3, CS * 0.1); rrect(g, ex * CS + 2, ey * CS + 2, CS - 4, CS - 4, CS * 0.2); g.stroke(); emo(g, '🚪', X(ex), Y(ey) - CS * 0.75 + Math.sin(t * 5) * CS * 0.08, CS * 0.42); }
  // power-ups + the 🚪
  M.items.forEach(it => drawItem(g, st, it, X(it.x), Y(it.y), CS, t));
  // flames
  g.save(); for(const k in M.fl){ const f = M.fl[k], x = k % M.W, y = (k - x) / M.W, a = Math.min(1, f.t / 0.2); drawFlame(g, st, x, y, f, CS, a); } g.restore();
  // bombs
  M.bombs.forEach(b => { if(!b.carry) drawBomb(g, st, b, CS, t); });
  // horde (🧟 sudden death)
  if(M.horde){ for(let k = 0; k < 3; k++){ const hx = M.horde.x - M.horde.dir * k * 0.7; emo(g, '🧟', X(hx), Y(M.horde.y) - CS * 0.15 + Math.sin(t * 6 + k) * CS * 0.05, CS * 0.85, 1, M.horde.dir < 0); } }
  // players: sorted by row, ghosts on top
  const order = M.P.filter(p => !p.gone && (p.alive || p.ghost || p.edge || (p.act && p.act.k === 'caught' && p.act.t < 1.2) || (M.mode !== 'hold' && !p.alive && p.caughtT < 1.2))).sort((a, b) => (a.ghost - b.ghost) || (a.y - b.y));
  if(!st.preview) st.fx.forEach(f => { if(f.k === 'stamp') drawPolishFx(g, st, CS, t, f, f.t / f.life, true); });   // CAUGHT! sits behind the avatar
  order.forEach(p => { drawPlayer(g, st, p, CS, t); M.bombs.forEach(b => { if(b.carry && b.carrier === p.i) drawBomb(g, st, b, CS, t); }); });   // sb-9: a carried bomb rides over its carrier's head
  if(M.boss) drawBoss(g, st, M.boss, CS, t);
  // out players (Basic has no ghosts) cheer from the bottom wall
  if(!st.preview){ const outs = M.P.filter(p => p.out && p.caughtT > 1.2); outs.forEach((p, j) => { const av = st.avFor ? st.avFor(p.i) : st.avs[p.i]; drawAvatar(g, {name: p.name, av, dir: 1, walkT: 0, gest: {g: gestK('cheer'), t: t + j}, jumpH: 0}, (1.5 + j * 1.2) * CS, M.H * CS - CS * 0.1, CS / 95, {t}); }); }
  if(!st.preview) drawFx(g, st, CS, t);
  g.restore();
}
function hexRgb(h){ const n = parseInt((h || '#FFC845').slice(1), 16); return (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
function chipColOf(st, i){ const p = st.M.P[i]; if(!p) return '#FFC845'; if(p.human) return SEAT_COL[st.M.P.filter(q => q.human).indexOf(p)] || '#FF7A1A'; return BOT_COL; }
function drawStatic(g, st, R){
  const M = st.M, T = THEMES[st.theme], CS = R.CS, key = M.gridVer + ':' + CS + ':' + st.theme + ':' + M.W + 'x' + M.H + ':' + DPR;
  if(!st.preview && st.static && st.staticKey === key && st.static.width){ g.drawImage(st.static, 0, 0, M.W * CS, M.H * CS); return; }
  const c = st.preview ? null : (st.static || document.createElement('canvas')), s = st.preview ? 1 : DPR;
  let h = g;
  if(c){ c.width = Math.ceil(M.W * CS * s); c.height = Math.ceil(M.H * CS * s); h = c.getContext('2d'); h.setTransform(s, 0, 0, s, 0, 0); }
  for(let y = 0; y < M.H; y++) for(let x = 0; x < M.W; x++){
    const v = M.grid[y * M.W + x], px = x * CS, py = y * CS;
    h.fillStyle = T.floor[(x + y) % 2]; h.fillRect(px, py, CS + 0.5, CS + 0.5);
    if(v === 1) wallTile(h, T, px, py, CS, x, y, M);
    else if(v === 2) softTile(h, T, px, py, CS, x, y);
    else if(v === 3) fillTile(h, T, px, py, CS, x, y);
  }
  if(c && c.width && c.height){ st.static = c; st.staticKey = key; g.drawImage(c, 0, 0, M.W * CS, M.H * CS); }
}
function wallTile(h, T, px, py, CS, x, y, M){
  const border = x === 0 || y === 0 || x === M.W - 1 || y === M.H - 1;
  h.fillStyle = T.wall[1]; rrect(h, px + 1, py + CS * 0.12, CS - 2, CS - 1, CS * 0.16); h.fill();
  h.fillStyle = T.wall[0]; rrect(h, px + 1, py + 1, CS - 2, CS * 0.82, CS * 0.16); h.fill();
  h.fillStyle = 'rgba(255,255,255,0.18)'; rrect(h, px + CS * 0.14, py + CS * 0.12, CS * 0.72, CS * 0.16, CS * 0.08); h.fill();
  if(!border && CS > 14){ h.fillStyle = 'rgba(0,0,0,0.12)'; h.beginPath(); h.arc(px + CS * 0.5, py + CS * 0.48, CS * 0.16, 0, 7); h.fill(); }
}
function softTile(h, T, px, py, CS, x, y){
  h.fillStyle = 'rgba(0,0,0,0.18)'; rrect(h, px + CS * 0.08, py + CS * 0.14, CS * 0.86, CS * 0.84, CS * 0.2); h.fill();
  h.fillStyle = T.soft[0]; rrect(h, px + CS * 0.06, py + CS * 0.06, CS * 0.86, CS * 0.82, CS * 0.2); h.fill();
  h.fillStyle = 'rgba(255,255,255,0.25)'; rrect(h, px + CS * 0.14, py + CS * 0.12, CS * 0.5, CS * 0.14, CS * 0.07); h.fill();
  emo(h, T.soft[1], px + CS * 0.49, py + CS * 0.5, CS * 0.56);
}
function fillTile(h, T, px, py, CS, x, y){
  h.fillStyle = T.fill[0]; rrect(h, px + 1, py + 1, CS - 2, CS - 2, CS * 0.18); h.fill();
  h.strokeStyle = 'rgba(255,255,255,0.15)'; h.lineWidth = Math.max(1, CS * 0.05); rrect(h, px + CS * 0.12, py + CS * 0.12, CS * 0.76, CS * 0.76, CS * 0.14); h.stroke();
  emo(h, T.fill[1], px + CS * 0.5, py + CS * 0.5, CS * 0.5, 0.85);
}
function drawItem(g, st, it, x, y, CS, t){
  const T = THEMES[st.theme];
  if(it.exit){ const open = st.M.exitOpen; g.fillStyle = open ? 'rgba(255,216,77,0.45)' : 'rgba(0,0,0,0.25)'; g.beginPath(); g.arc(x, y, CS * (0.46 + (open ? 0.05 * Math.sin(t * 6) : 0)), 0, 7); g.fill(); emo(g, '🚪', x, y, CS * 0.72, open ? 1 : 0.55); if(!open) emo(g, '🔒', x + CS * 0.25, y + CS * 0.22, CS * 0.32); return; }
  const blink = it.t != null && it.t < 3 && Math.floor(t * 8) % 2 === 0; if(blink) return;
  let ox = x, oy = y;
  if(it.drop && it.fx != null){ const q = Math.min(1, (st.M.t - it.born) / 0.45); if(q < 1){ ox = (it.fx + 0.5) * CS + (x - (it.fx + 0.5) * CS) * q; oy = (it.fy + 0.5) * CS + (y - (it.fy + 0.5) * CS) * q - Math.sin(q * Math.PI) * CS * 0.8; } }
  const born = st.M.t - (it.born || -9), spring = it.drop || born > 0.6 ? 1 : 1 + Math.sin(born * 18) * Math.exp(-born * 6) * 0.45 - (born < 0.08 ? 0.6 : 0);
  const bob = Math.sin(t * 3 + it.x) * CS * 0.04 - (born < 0.4 && !it.drop ? Math.sin(born / 0.4 * Math.PI) * CS * 0.35 : 0), s = CS * 0.78 * Math.max(0.3, spring);
  g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(ox, oy + CS * 0.36, CS * 0.3, CS * 0.08, 0, 0, 7); g.fill();
  g.fillStyle = it.k === 'error' ? '#3A1A1A' : '#FFFFFF'; rrect(g, ox - s / 2, oy - s / 2 + bob, s, s, CS * 0.16); g.fill();
  g.strokeStyle = it.k === 'error' ? '#E5484D' : T.powerFrame; g.lineWidth = Math.max(2, CS * 0.08); rrect(g, ox - s / 2, oy - s / 2 + bob, s, s, CS * 0.16); g.stroke();
  if(T.brains) emo(g, '🧠', ox + CS * 0.22, oy - CS * 0.2 + bob, CS * 0.3, 0.9);
  emo(g, POWER_INFO[it.k] ? POWER_INFO[it.k][0] : '❓', ox, oy + bob, CS * 0.5);
}
function drawFlame(g, st, x, y, f, CS, a){
  // (sb-8) the + shoots out from the middle (one cell every ~30 ms), flickers with a white-hot core, round caps on the ends
  const T = THEMES[st.theme], age = 0.55 - f.t, need = (f.k || 0) * 0.03; if(age < need && !st.preview) return;
  const grow = st.preview ? 1 : Math.min(1, (age - need) / 0.05), fl = 0.88 + 0.12 * Math.sin(age * 55 + x * 3.1 + y * 5.3), cx = (x + 0.5) * CS, cy = (y + 0.5) * CS;
  const horiz = f.d === 1 || f.d === 3, vert = f.d === 0 || f.d === 2;
  if(f.strike){ g.globalAlpha = a; g.fillStyle = 'rgba(255,70,40,0.8)'; rrect(g, x * CS + 2, y * CS + 2, CS - 4, CS - 4, CS * 0.25); g.fill(); g.globalAlpha = 1; return; }
  // arm cells are drawn edge to edge (one solid +); only the very end gets a round cap
  const layer = (col, th, al) => {
    const t2 = CS * th, ww = f.d === 'c' ? t2 * 1.2 : horiz ? CS + 1 : t2, hh = f.d === 'c' ? t2 * 1.2 : vert ? CS + 1 : t2;
    let x0 = cx - ww / 2, y0 = cy - hh / 2, w = ww, h = hh;
    if(f.end){ if(f.d === 1) w = CS * 0.5 + t2 / 2; if(f.d === 3){ x0 = cx - t2 / 2; w = CS * 0.5 + t2 / 2; } if(f.d === 2) h = CS * 0.5 + t2 / 2; if(f.d === 0){ y0 = cy - t2 / 2; h = CS * 0.5 + t2 / 2; } }
    const gx = horiz || f.d === 'c' ? grow : 1, gy = vert || f.d === 'c' ? grow : 1;
    g.globalAlpha = a * al; g.fillStyle = col; rrect(g, cx + (x0 - cx) * gx, cy + (y0 - cy) * gy, w * gx, h * gy, f.d === 'c' || f.end ? t2 / 2 : t2 * 0.15); g.fill(); };
  layer(T.flame[1], 0.82 * fl, 0.85); layer(T.flame[0], 0.52 * fl, 0.95); layer('#FFFFFF', 0.24 * fl, 0.9 * Math.min(1, f.t / 0.35));
  g.globalAlpha = 1;
}
function drawBomb(g, st, b, CS, t){
  // (sb-8) a fuse that burns down, colour + rubbery squash that speed up, white flash at the end, 3·2·1 on Basic–Intermediate
  const x = (b.x + 0.5) * CS, y = (b.y + 0.5) * CS, left = Math.max(0, b.t) / (b.max || 3), urg = 1 - left;
  let lift = 0, sc = 1;
  if(b.fly){ const q = b.fly.t / b.fly.dur; lift = Math.sin(q * Math.PI) * CS * (b.fly.hit ? 1.05 : 0.7); sc = 1 + Math.sin(q * Math.PI) * 0.25; }
  else if(b.carry){ lift = CS * 1.05; sc = 0.8; }
  const by = y - lift - CS * 0.04, wob = Math.sin(t * (5 + urg * 22) + (b.id || 0)) * (0.04 + urg * 0.1), sx = (1 + wob) * sc, sy = (1 - wob) * sc;
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x, y + CS * 0.32, CS * 0.3 * (1 - lift / CS * 0.5) * sx, CS * 0.08, 0, 0, 7); g.fill();
  if(!st.preview){ const hue = Math.round(120 - urg * 120), hr = CS * (0.5 + urg * 0.12), hg = g.createRadialGradient(x, by, CS * 0.1, x, by, hr); hg.addColorStop(0, 'hsla(' + hue + ',95%,55%,' + (0.3 + urg * 0.35).toFixed(2) + ')'); hg.addColorStop(1, 'hsla(' + hue + ',95%,55%,0)'); g.fillStyle = hg; g.beginPath(); g.arc(x, by, hr, 0, 7); g.fill(); }
  g.save(); g.translate(x, by); g.scale(sx, sy);
  if(b.skin && !b.poo && window.BombSkins && BombSkins.parse(b.skin)) BombSkins.draw(g, b.skin, 0, 0, CS * 0.78, t, urg);
  else emo(g, bombLook(st, b), 0, 0, CS * 0.78);
  g.restore();
  if(!st.preview && b.t < 0.5 && !b.fly && Math.floor(t * 16) % 2 === 0){ g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(x, by, CS * 0.36 * sx, 0, 7); g.fill(); }
  if(!b.fly && !st.preview && !b.boss){
    // the fuse: a curl of rope that gets shorter, with a spark running down it
    const fx0 = x + CS * 0.14 * sx, fy0 = by - CS * 0.3 * sy, L = CS * 0.42 * Math.max(0.05, left), ex = fx0 + L * 0.75, ey = fy0 - L * 0.6;
    g.strokeStyle = '#6B4A2B'; g.lineWidth = Math.max(2, CS * 0.07); g.lineCap = 'round'; g.beginPath(); g.moveTo(fx0, fy0); g.quadraticCurveTo(fx0 + L * 0.1, fy0 - L * 0.7, ex, ey); g.stroke(); g.lineCap = 'butt';
    const sr = CS * (0.1 + 0.04 * Math.sin(t * 40)), sg = g.createRadialGradient(ex, ey, 0, ex, ey, sr * 2.2); sg.addColorStop(0, 'rgba(255,255,220,1)'); sg.addColorStop(0.35, 'rgba(255,200,60,0.9)'); sg.addColorStop(1, 'rgba(255,90,20,0)');
    g.fillStyle = sg; g.beginPath(); g.arc(ex, ey, sr * 2.2, 0, 7); g.fill();
    for(let i = 0; i < 3; i++){ const an = t * 23 + i * 2.1 + (b.id || 0), rr = CS * (0.12 + ((t * 3 + i * 0.33) % 1) * 0.15); g.fillStyle = i % 2 ? '#FFE08A' : '#FF9F1C'; g.fillRect(ex + Math.cos(an) * rr, ey + Math.sin(an) * rr, 2, 2); }
    // 3 · 2 · 1 bubble (Basic → Intermediate)
    if(st.M.level <= 2 && b.t <= 3.05 && b.t > 0){ const n = Math.ceil(b.t), fr = n - b.t, pop = 1 + Math.max(0, 0.45 - fr * 2.2), bx = x, byy = by - CS * 0.95, r = CS * 0.26 * pop, col = n >= 3 ? '#2EC27E' : n === 2 ? '#FF9F1C' : '#E5484D';
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(bx, byy, r, 0, 7); g.fill(); g.strokeStyle = col; g.lineWidth = Math.max(2, CS * 0.06); g.stroke();
      g.fillStyle = col; g.font = '700 ' + Math.round(CS * 0.34 * pop) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), bx, byy + CS * 0.01);
      if(G && G.lastTick !== (b.id + ':' + n) && st === G){ G.lastTick = b.id + ':' + n; if(G.M.P.some(p => p.human && p.alive && Math.abs(p.x - b.x) + Math.abs(p.y - b.y) < 4)) tick(); } }
  }
}
function bombLook(st, b){ if(b.boss) return '💥'; if(b.poo) return '💩'; return THEMES[st.theme].bomb; }
const POSE_KICK = {legR: 1.3, legL: -0.2, armL: 0.9, armR: 0.4, mouth: 'open'};
const POSE_TOSS = {armR: 2.9, armL: 1.2, mouth: 'open'};
const POSE_CARRY = {armL: 2.95, armR: 2.95, mouth: 'open'};
function poseSwing(q){ return q < 0.3 ? {armR: -0.9, armL: -0.5, rot: -0.12, mouth: 'open'} : {armR: 2.2, armL: 1.6, rot: 0.14, mouth: 'open'}; }   // sb-9 🏏 wind-up → follow-through
const BAT_CACHE = {};
function batFor(name){ if(BAT_CACHE[name] !== undefined) return BAT_CACHE[name]; let d = null; try{ if(typeof BatStick !== 'undefined') d = BatStick.of(name); if(!d && typeof racketDesign === 'function') d = racketDesign(10, {}); }catch(e){} return (BAT_CACHE[name] = d); }
let TINT = null;
function drawPlayer(g, st, p, CS, t){
  const M = st.M, av = st.avFor ? st.avFor(p.i) : (st.avs[p.i] || defaultAvatar(p.name)), x = (p.x + 0.5) * CS, feet = (p.y + 0.5) * CS + CS * 0.34, k = CS / 78;
  const caught = p.act && p.act.k === 'caught' && p.act.t < 1.2;
  if(!p.alive && !p.ghost && !p.edge && !caught) return;
  const A = {name: p.name, av, dir: p.face || 1, walkT: p.moving ? p.walkT : 0, gest: null, jumpH: 0, stance: ''};
  let pose = null, alpha = 1;
  if(p.ghost){ alpha = 0.5; A.jumpH = 10 + Math.sin(t * 3 + p.i) * 4; A.walkT = 0; }
  else if(p.act){
    const a = p.act;
    if(a.k === 'plant' && a.t < 0.35) A.stance = 'crouch';
    else if(a.k === 'kick' && a.t < 0.35) pose = POSE_KICK;
    else if(a.k === 'toss' && a.t < 0.4) pose = POSE_TOSS;
    else if(a.k === 'hit' && a.t < 0.45){ pose = poseSwing(a.t / 0.45); const bd = batFor(p.name); if(bd && typeof BatStick !== 'undefined') A.av = BatStick.hold(av, bd); }   // sb-9 🏏 your BatStick
    else if(a.k === 'grab' && a.t < 0.45){ A.jumpH = Math.sin(a.t / 0.45 * Math.PI) * 14; }
    else if(a.k === 'cheer' && a.t < 1.1) A.gest = {g: gestK('cheer'), t: a.t};
    else if(a.k === 'win') A.gest = {g: gestK(M.done ? 'dance' : 'cheer'), t: a.t};
    else if(a.k === 'dash' && a.t < 0.3) pose = {rot: 0.3 * (p.face || 1), armL: 2, armR: 2};
    else if(caught) pose = {rot: Math.sin(a.t * 14) * 0.25, eyes: 'closed', mouth: 'open', armL: 2.6, armR: 2.6};
  }
  if(p.edge){ A.stance = ''; }
  // 🏃 running from a pop: arms up, leaning, mouth open
  const fleeing = !st.preview && !caught && !p.ghost && p.moving && inDanger(p);
  if(fleeing && !pose && !A.gest){ pose = {armL: 2.7 + Math.sin(t * 18) * 0.25, armR: 2.7 - Math.sin(t * 18) * 0.25, mouth: 'open', rot: 0.12 * (p.face || 1)}; if(p._fleeAt == null || t - p._fleeAt > 4){ p._fleeAt = t; feel(p, '😱', 1); talk(p, 'flee', p.human ? 0.35 : 0.2); } }
  if(M.state === 'end' && M.roundWinner >= 0 && p.i !== M.roundWinner && p.alive && !p.ghost) A.gest = {g: gestK('clap'), t: G ? G.t : t};
  if(p.inv > 0 && !caught && Math.floor(t * 12) % 2 === 0) alpha *= 0.45;
  if(!caught && !p.ghost && M.bombs.some(b => b.carry && b.carrier === p.i) && !(p.act && p.act.k === 'hit')) pose = POSE_CARRY;   // sb-9: bomb over the head
  if(p.lock > 0) pose = Object.assign({}, pose || {}, {armL: 0.2, armR: 0.2, eyes: 'open', mouth: 'open'});
  if(p.slow > 0 && st.theme === 'zombie') pose = Object.assign({}, pose || {}, {armL: 1.5, armR: 1.5});
  // ring under the feet in the player's colour
  if(!p.ghost && !st.preview){ g.strokeStyle = st.M.teams ? (p.team ? '#3D8BFD' : '#FF7A1A') : chipColOf(st, p.i); g.globalAlpha = 0.85 * alpha; g.lineWidth = Math.max(2, CS * 0.06); g.beginPath(); g.ellipse(x, feet - CS * 0.02, CS * 0.34, CS * 0.11, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
  const theme = THEMES[st.theme];
  const tint = caught ? ({soot: 'rgba(30,25,25,0.72)', soak: 'rgba(60,140,255,0.45)', zap: (Math.floor(t * 20) % 2 ? 'rgba(255,255,140,0.6)' : 'rgba(80,220,255,0.45)'), green: 'rgba(110,200,60,0.55)'})[theme.caught] : p.ghost ? 'rgba(170,150,255,0.45)' : (p.slow > 0 && st.theme === 'zombie') ? 'rgba(110,200,60,0.4)' : null;
  if(tint && !st.preview){
    // paint into a small canvas, colour it, then stamp it (soot / soaked / zapped / zombie green / ghost)
    const w = Math.ceil(CS * 2.2), h = Math.ceil(CS * 2.6), s = DPR; TINT = TINT || document.createElement('canvas'); if(TINT.width < w * s || TINT.height < h * s){ TINT.width = w * s; TINT.height = h * s; }
    const tg = TINT.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, TINT.width, TINT.height); tg.setTransform(s, 0, 0, s, 0, 0);
    sbpDraw(tg, p, A, w / 2, h - CS * 0.25, k, t, pose);   /* 🎬 b3b7 */
    tg.globalCompositeOperation = 'source-atop'; tg.fillStyle = tint; tg.fillRect(0, 0, w, h); tg.globalCompositeOperation = 'source-over';
    g.globalAlpha = alpha; const wob = theme.caught === 'green' && caught ? Math.sin(t * 12) * CS * 0.06 : 0;
    g.drawImage(TINT, 0, 0, w * s, h * s, x - w / 2 + wob, feet - (h - CS * 0.25), w, h); g.globalAlpha = 1;
  } else { g.globalAlpha = alpha; sbpDraw(g, p, A, x, feet, k, t, pose); /* 🎬 b3b7 */ g.globalAlpha = 1; }
  // overlays
  const head = feet - CS * 1.05 - (A.jumpH || 0) * k;
  if(caught){ for(let i = 0; i < 3; i++){ const an = t * 5 + i * 2.1; emo(g, i % 2 ? '⭐' : (theme.caught === 'soak' ? '💧' : theme.caught === 'zap' ? '⚡' : '💫'), x + Math.cos(an) * CS * 0.32, head + Math.sin(an) * CS * 0.08, CS * 0.26); } }
  if(p.ghost){ emo(g, '👻', x + CS * 0.3, head - CS * 0.05 + Math.sin(t * 4) * CS * 0.05, CS * 0.36); if(p.lockCd <= 0 && p.human){ g.fillStyle = '#3DDCB4'; g.font = '900 ' + Math.round(CS * 0.24) + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ready', x + CS * 0.12, head - CS * 0.3); emo(g, '🪤', x - CS * 0.3, head - CS * 0.3, CS * 0.24); } }
  if(p.lock > 0){ g.strokeStyle = 'rgba(160,240,255,' + (0.6 + 0.4 * Math.sin(t * 20)) + ')'; g.lineWidth = Math.max(2, CS * 0.07); g.setLineDash([CS * 0.12, CS * 0.08]); g.beginPath(); g.ellipse(x, feet - CS * 0.45, CS * 0.42, CS * 0.6, 0, 0, 7); g.stroke(); g.setLineDash([]); emo(g, '⛓️', x, feet - CS * 1.2, CS * 0.34); }
  if(p.err > 0) emo(g, '😵', x - CS * 0.3, head, CS * 0.3);
  if(fleeing && Math.floor(t * 3) % 2 === 0) emo(g, '💦', x - (p.face || 1) * CS * 0.32, head + CS * 0.12, CS * 0.24);
  // emotion bubble over the head (😄 grab · 😎 catch · 😅 phew · 😱 run · 🥳 win …)
  if(p._emo && p._emo.until > (G ? G.t : 0) && !st.preview){ const age = G.t - p._emo.at, s = Math.min(1, age * 7) * (1 + Math.max(0, 0.3 - age) ), ey = head - CS * 0.5 - Math.min(1, age * 4) * CS * 0.08, left = p._emo.until - G.t, al = Math.min(1, left * 3);
    g.globalAlpha = al; g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.arc(x + CS * 0.36, ey, CS * 0.24 * s, 0, 7); g.fill(); g.beginPath(); g.moveTo(x + CS * 0.18, ey + CS * 0.1); g.lineTo(x + CS * 0.12, ey + CS * 0.3); g.lineTo(x + CS * 0.3, ey + CS * 0.18); g.fill(); g.globalAlpha = 1;
    emo(g, p._emo.ch, x + CS * 0.36, ey, CS * 0.32 * s, al); }
  if(p.shield && !p.ghost){ g.strokeStyle = 'rgba(120,200,255,0.7)'; g.lineWidth = Math.max(1.5, CS * 0.05); g.beginPath(); g.arc(x, feet - CS * 0.5, CS * 0.55, 0, 7); g.stroke(); }
  if(!p.human && !p.ghost && !st.preview && p.ai && p.ai.panicUntil > st.M.totalT) emo(g, '😱', x - CS * 0.28, head - CS * 0.15, CS * 0.3);
  if(!p.human && !p.ghost && !st.preview && p.ai && p.ai.nap > 0) emo(g, '💤', x - CS * 0.28, head - CS * 0.1 - Math.abs(Math.sin(t * 2)) * CS * 0.12, CS * 0.3);
  if(!p.human && !p.ghost && !st.preview) emo(g, (BOT_KIND[p.kind] || ['🤖'])[0], x + CS * 0.32, head + CS * 0.05, CS * 0.26);
  if(p.edge && !st.preview && st.M.t < 60){ g.fillStyle = 'rgba(255,255,255,0.9)'; g.font = '800 ' + Math.round(CS * 0.22) + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(fmtS(60 - st.M.t), x + CS * 0.1, head - CS * 0.2); emo(g, '⏳', x - CS * 0.32, head - CS * 0.2, CS * 0.22); }
  if(p.act && p.act.k === 'grab' && p.act.t < 0.8 && p.act.item) emo(g, (POWER_INFO[p.act.item] || ['✨'])[0], x, head - CS * 0.35 - p.act.t * CS * 0.5, CS * 0.42, 1 - p.act.t / 0.8);
}
function gestK(k){ return GESTURES.find(x => x.k === k) || GESTURES[0]; }
function drawBoss(g, st, B, CS, t){
  if(!B.alive && !(B.hitT > 0)) return; const x = (B.x + 0.5) * CS, y = (B.y + 0.5) * CS;
  if(B.inv > 0 && Math.floor(t * 12) % 2) g.globalAlpha = 0.5;
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(x, y + CS * 0.45, CS * 0.8, CS * 0.2, 0, 0, 7); g.fill();
  emo(g, B.icon, x, y - CS * 0.35 + Math.sin(t * 3) * CS * 0.06, CS * 1.9, 1, B.face > 0);
  g.globalAlpha = 1;
  for(let i = 0; i < 3; i++) emo(g, i < B.hp ? '❤️' : '🖤', x - CS * 0.45 + i * CS * 0.45, y - CS * 1.45, CS * 0.32);
}
function drawFx(g, st, CS, t){
  const X = x => (x + 0.5) * CS, Y = y => (y + 0.5) * CS;
  st.fx.forEach(f => {
    const q = f.t / f.life;
    if(drawPolishFx(g, st, CS, t, f, q)) return;
    if(f.k === 'ring'){ g.strokeStyle = f.col; g.globalAlpha = 1 - q; g.lineWidth = CS * (f.w || 0.12) * (1 - q) + 1; g.beginPath(); g.arc(X(f.x), Y(f.y), CS * (0.3 + q * 1.6), 0, 7); g.stroke(); g.globalAlpha = 1; }
    else if(f.k === 'runner'){ const e = Math.min(1, q * 1.3); emo(g, f.ch, X(f.x0 + (f.x1 - f.x0) * e), Y(f.y0 + (f.y1 - f.y0) * e) - Math.abs(Math.sin(e * Math.PI * 3)) * CS * 0.25, CS * 0.5, 1 - Math.max(0, q - 0.7) / 0.3, f.flip); }
    else if(f.k === 'emoji'){ emo(g, f.ch, X(f.x), Y(f.y + (f.vy || 0) * f.t), CS * (f.size || 0.5), 1 - q); }
    else if(f.k === 'word'){ g.globalAlpha = 1 - q; g.font = '900 ' + Math.round(CS * 0.4) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.strokeText(f.text.replace(/[^\x20-\x7E]/g, '').trim(), X(f.x), Y(f.y) - q * CS * 0.6); g.fillStyle = '#FFC845'; g.fillText(f.text.replace(/[^\x20-\x7E]/g, '').trim(), X(f.x), Y(f.y) - q * CS * 0.6); emo(g, '🔗', X(f.x) - CS * 0.9, Y(f.y) - q * CS * 0.6, CS * 0.35, 1 - q); g.globalAlpha = 1; }
    else if(f.k === 'chunks'){ for(let i = 0; i < 4; i++){ const an = i * 1.6 + 0.4; g.fillStyle = THEMES[st.theme].soft[0]; g.globalAlpha = 1 - q; g.fillRect(X(f.x) + Math.cos(an) * q * CS * 0.7 - CS * 0.08, Y(f.y) + Math.sin(an) * q * CS * 0.5 - CS * 0.08 + q * q * CS * 0.6, CS * 0.16, CS * 0.16); } g.globalAlpha = 1; }
    else if(f.k === 'strike'){ emo(g, THEMES[st.theme].strike, X(f.x), Y(f.y) - (1 - q) * CS * 0.6, CS * 0.8, 1 - q); }
    else if(f.k === 'fill'){ g.fillStyle = 'rgba(255,255,255,' + (0.5 * (1 - q)) + ')'; g.fillRect(f.x * CS, f.y * CS, CS, CS); }
    else if(f.k === 'swirl'){ for(let i = 0; i < 6; i++){ const an = t * 8 + i * 1.05, r = CS * (1 - q) * 0.9; emo(g, i % 2 ? '👻' : '✨', X(f.x) + Math.cos(an) * r, Y(f.y) - CS * 0.5 + Math.sin(an) * r * 0.6, CS * 0.32, 1 - q * 0.5); } }
    else if(f.k === 'fireworks'){ for(let i = 0; i < 3; i++){ const qq = (q * 2 + i * 0.33) % 1; emo(g, ['🎆', '🎇', '✨'][i], X(f.x) + (i - 1) * CS * 0.9, Y(f.y) - CS * (1 + qq * 1.4), CS * (0.4 + qq * 0.4), 1 - qq); } }
  });
}

/* ================= ✨ POLISH (sb-8): pop impact · countdown bomb · fighter chips · round intro/outro · mood · emotions + friendly talk ================= */
const PART = {
  dino:   [{s: 'sq', c: ['#8D6E63', '#6D4C41', '#A1887F']}, {s: 'emo', ch: '🍃'}],
  sea:    [{s: 'bub', c: ['#E0FBFF', '#9BE7FF']}, {s: 'bub', c: ['#FFFFFF']}],
  dance:  [{s: 'sq', c: ['#FF4FA3', '#FFD84D', '#3DDCB4', '#7C4DFF', '#40C4FF']}, {s: 'emo', ch: '🎵'}],
  robot:  [{s: 'spark', c: ['#FFE066', '#4DD0E1', '#FFFFFF']}, {s: 'spark', c: ['#FFE066']}],
  space:  [{s: 'ci', c: ['#FFFFFF', '#E1BEE7', '#B388FF']}, {s: 'emo', ch: '✨'}],
  sky:    [{s: 'zig', c: ['#FFE066', '#FFFFFF']}, {s: 'ci', c: ['#FFF59D']}],
  zombie: [{s: 'goo', c: ['#7BC043', '#9CCC65', '#558B2F']}, {s: 'goo', c: ['#7BC043']}]
};
const AMBIENT = {dino: ['🍃', 'fall'], sea: ['🫧', 'rise'], dance: ['✨', 'twinkle'], robot: ['⚙️', 'drift'], space: ['⭐', 'twinkle'], sky: ['☁️', 'drift'], zombie: ['🦇', 'flap']};
const POWER_WORD = {bomb: '+1 BOMB!', fire: 'BIGGER POP!', speed: 'SPEED UP!', kick: 'KICK!', toss: 'TOSS & HIT!', shield: 'SHIELD!', remote: 'REMOTE!', dash: 'DASH!', error: 'UH-OH!'};
// friendly lines only — cheering, sorry, phew; never teasing
const LINES = {
  plant: ['Here it goes!', 'Boom time!', 'Watch out!', 'Tick tock!'],
  grab: ['Yes!', 'Power up!', 'Ooh, nice!', 'Wow!'], fire: ['Bigger pop!'], bomb: ['More bombs!'], speed: ['Zoom zoom!'], shield: ['Safe now!'],
  catch: ['Gotcha!', 'Sorry!', 'Hehe, got you!', 'Oops, sorry!'],
  caught: ['Oops!', 'Aww!', 'Nice one!', "I'll be back!"],
  flee: ['Run!', 'Eek!', 'Too close!', 'Whoa!'],
  phew: ['Phew!', 'That was close!', 'Made it!'],
  back: ["I'm back!", 'Hello again!'], ghost: ['Boo!', 'Wooo~'],
  win: ['Good game!', 'That was fun!', 'Yay!'], clap: ['Well played!', 'Nice!']
};
function ease(q){ q = Math.max(0, Math.min(1, q)); return 1 - Math.pow(1 - q, 3); }
/* ---- sound: a layered boom (noise + sub), rising chains, pickup jingles, alarm ---- */
let NOISE = null;
function noiseBuf(){ if(NOISE || !AC) return NOISE; const n = Math.floor(AC.sampleRate * 0.5); NOISE = AC.createBuffer(1, n, AC.sampleRate); const d = NOISE.getChannelData(0); for(let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); return NOISE; }
function boom(size, chain){
  try{ if(!UISound.get().enabled) return; AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t0 = AC.currentTime, vol = UISound.get().volume == null ? 1 : UISound.get().volume, up = 1 + Math.min(4, chain || 0) * 0.18;
    const src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); src.buffer = noiseBuf(); f.type = 'lowpass'; f.frequency.setValueAtTime(1800 * up, t0); f.frequency.exponentialRampToValueAtTime(160, t0 + 0.35);
    g.gain.setValueAtTime(0.35 * vol * (0.6 + size * 0.5), t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4); src.connect(f); f.connect(g); g.connect(AC.destination); src.start(t0); src.stop(t0 + 0.45);
    boing(85 * up, 0.38, 'sine', 0.3 * (0.6 + size * 0.4), 32); if(chain) boing(440 * up, 0.12, 'triangle', 0.12, 880 * up); }catch(e){}
}
const JINGLE = {bomb: [523, 659], fire: [587, 880], speed: [659, 988], kick: [440, 660], toss: [494, 740], shield: [392, 784], remote: [523, 1046], dash: [698, 1046], error: [300, 180]};
function jingle(k){ const n = JINGLE[k] || [660, 990]; boing(n[0], 0.08, 'triangle', 0.18, n[0] * 1.2); setTimeout(() => boing(n[1], 0.12, 'triangle', 0.18, n[1] * 1.25), 70); }
function alarm(){ [0, 260, 520].forEach(d => setTimeout(() => boing(880, 0.18, 'square', 0.08, 620), d)); }
function tick(){ boing(2400, 0.03, 'square', 0.04, 1800); }
/* ---- particles ---- */
function spawnPop(e){
  const th = G.theme, P = PART[th] || PART.dino, cells = e.cells.slice(0, 16), big = Math.min(1, e.cells.length / 9);
  addFx({k: 'flash', x: e.x, y: e.y, life: 0.16, r: 0.9 + big * 0.8});
  addFx({k: 'ring', x: e.x, y: e.y, life: 0.5, col: THEMES[th].flame[1], w: 0.22});
  cells.forEach((c, j) => { const n = j === 0 ? 4 : 1 + (j % 2); for(let i = 0; i < n; i++){ const sp = P[(i + j) % P.length], a = Math.random() * Math.PI * 2, v = 1.2 + Math.random() * 2.2;
    addFx({k: 'pt', s: sp.s, col: sp.c ? pickOne(sp.c) : '#fff', ch: sp.ch, x: c[0] + (Math.random() - 0.5) * 0.4, y: c[1] + (Math.random() - 0.5) * 0.4, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (sp.s === 'bub' ? 1.5 : 1), g: sp.s === 'bub' ? -1.2 : sp.s === 'goo' ? 7 : 4.5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, size: sp.s === 'emo' ? 0.32 : 0.08 + Math.random() * 0.1, life: 0.5 + Math.random() * 0.45}); } });
  if(!reduced()) G.shake = Math.max(G.shake, 0.07 + big * 0.14);
}
function spawnBreak(x, y){
  const col = THEMES[G.theme].soft[0];
  for(let i = 0; i < 6; i++){ const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 1.5 + Math.random() * 2; addFx({k: 'pt', s: 'sq', col, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 9, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14, size: 0.12 + Math.random() * 0.08, life: 0.6}); }
  for(let i = 0; i < 3; i++) addFx({k: 'dust', x: x + (Math.random() - 0.5) * 0.5, y: y + 0.2, life: 0.55 + i * 0.1});
}
/* ---- emotions + friendly talk ---- */
function feel(p, ch, dur){ if(!p) return; p._emo = {ch, until: G.t + (dur || 1.3), at: G.t}; }
function talk(p, kind, chance){
  if(!p || !FX || Math.random() > (chance == null ? 1 : chance)) return; const list = LINES[kind]; if(!list) return;
  const now = G.t, cd = p.human ? 3.2 : 5.5; if((p._talkAt || -9) > now - cd || (G.talkAt || -9) > now - 0.9) return;
  if(G.fx.filter(f => f.k === 'talk').length >= 2) return;
  p._talkAt = now; G.talkAt = now; addFx({k: 'talk', i: p.i, text: pickOne(list), life: 1.7});
}
function polishEvents(list){
  const M = G.M;
  list.forEach(e => {
    const P = M.P[e.i];
    if(e.k === 'pop'){ const chain = e.chain ? (G.combo && G.t - G.combo.at < 0.7 ? G.combo.n + 1 : 2) : 0; if(e.chain){ G.combo = {n: chain, at: G.t}; bopWord(e.owner, '⛓️ CHAIN ×' + chain + '!', chain >= 4 ? 'big' : 'good', {k: 'combo', x: e.x, y: e.y - 0.7, n: chain, life: 0.9}); }
      boom(Math.min(1, e.cells.length / 9), chain); spawnPop(e);
      // 😅 phew: anyone standing right next to the pop who wasn't in it
      M.P.forEach(q => { if(!q.alive || q.ghost || q.edge) return; const qx = Math.round(q.x), qy = Math.round(q.y); const inPop = e.cells.some(c => c[0] === qx && c[1] === qy), near = e.cells.some(c => Math.abs(c[0] - qx) + Math.abs(c[1] - qy) === 1); if(!inPop && near){ feel(q, '😅'); talk(q, 'phew', q.human ? 0.7 : 0.3); } }); }
    else if(e.k === 'break') spawnBreak(e.x, e.y);
    else if(e.k === 'reveal') addFx({k: 'label', x: e.x, y: e.y - 0.4, text: (POWER_INFO[e.pk] || ['✨', '?'])[1], ch: (POWER_INFO[e.pk] || ['✨'])[0], life: 1.0, col: '#FFC845'});
    else if(e.k === 'plant' && P){ if(Math.random() < 0.3) feel(P, '😏', 0.9); const foeNear = M.P.some(q => q !== P && q.alive && !q.ghost && Math.abs(q.x - P.x) + Math.abs(q.y - P.y) < 3); if(foeNear) talk(P, 'plant', P.human ? 0.5 : 0.25); }
    else if(e.k === 'pick' && P){ jingle(e.pk); feel(P, e.pk === 'error' ? '😵‍💫' : pickOne(['😄', '🤩', '😁'])); addFx({k: 'label', x: P.x, y: P.y - 1.5, text: POWER_WORD[e.pk] || 'POWER!', ch: (POWER_INFO[e.pk] || ['✨'])[0], life: 1.0, col: e.pk === 'error' ? '#FF6B6B' : '#7CFFB2'}); talk(P, LINES[e.pk] ? e.pk : 'grab', 0.45); chipFlash(e.i, 'grab', '😄'); }
    else if(e.k === 'caught' && P){ G.freeze = Math.max(G.freeze || 0, 0.09); if(!reduced()) G.shake = Math.max(G.shake, 0.3);
      addFx({k: 'stamp', x: e.x, y: e.y - 0.5, life: 1.0, text: 'CAUGHT!'}); feel(P, '😵', 1.4); talk(P, 'caught', P.human ? 0.8 : 0.4); chipFlash(e.i, 'hit', '😵');
      const C = M.P[e.by]; if(C && e.by !== e.i){ feel(C, '😎'); addFx({k: 'plus', i: e.by, life: 1.0}); talk(C, 'catch', 0.6); chipFlash(e.by, 'grab', '😎', '+1 💥');
        // DOUBLE! / TRIPLE! when one pop catches 2–3
        const key = e.by + ':' + Math.round(M.totalT * 20); G.multi = G.multi && G.multi.key === key ? {key, n: G.multi.n + 1} : {key, n: 1}; if(G.multi.n === 2) bigWord('💥 DOUBLE!', e.by, 'good'); if(G.multi.n === 3) bigWord('🌋 TRIPLE!', e.by, 'big'); } }
    else if(e.k === 'swap' || e.k === 'comeback'){ const Q = M.P[e.ghost != null ? e.ghost : e.i]; feel(Q, '😁'); talk(Q, 'back', 1); }
    else if(e.k === 'ghost' && P){ feel(P, '😜', 1.6); talk(P, 'ghost', 0.6); }
    else if(e.k === 'sudden') alarm();
    else if(e.k === 'go'){ G.goT = G.t; }
    else if(e.k === 'roundend'){ const W = M.P[e.winner]; if(W){ feel(W, '🥳', 2.4); talk(W, 'win', 1); chipFlash(e.winner, 'grab', '🥳'); M.P.forEach(q => { if(q !== W && q.alive && !q.ghost) { feel(q, '👏', 2); } }); } G.endAt = G.t; }
    else if(e.k === 'round'){ G.introAt = G.t; }
  });
}
/* ---- flee: arms up + 💦 while you're inside a pop's reach ---- */
function inDanger(p){
  if(!G || !G.M || p.ghost || p.edge || !p.alive) return false;
  if(!p.human && !p.auto) return p.ai && p.ai.mode === 'flee';
  if(G._dT !== G.M.totalT){ G._D = BOP.dangerMap(G.M); G._dT = G.M.totalT; }
  const d = G._D[Math.round(p.y) * G.M.W + Math.round(p.x)]; return d !== Infinity && d < 1.6;
}
/* ---- chips: fighter cards ---- */
function chipFlash(i, cls, rx, tag){
  const el = G && G.chipEls && G.chipEls[i]; if(!el) return;
  el.classList.remove('grab', 'hit'); void el.offsetWidth; el.classList.add(cls); clearTimeout(el._ft); el._ft = setTimeout(() => el.classList.remove(cls), 700);
  if(rx){ const r = el.querySelector('.rx'); r.textContent = rx; r.classList.remove('on'); void r.offsetWidth; r.classList.add('on'); }
  if(tag){ const s = document.createElement('span'); s.className = 'tag'; s.textContent = tag; el.appendChild(s); setTimeout(() => s.remove(), 1100); }
}
function chipHtml(p){
  const M = G.M, out = [];
  const tile = (k, ic, n, on) => '<span class="pt' + (on ? '' : ' off') + '" data-k="' + k + '"><i>' + ic + '</i>' + (n != null ? '<b>' + n + '</b>' : '') + '</span>';
  if(M.mode === 'hold'){ const side = M.teams ? p.team : p.i, v = Math.floor(M.hold[side] || 0), tg = BOP.HOLD_TARGET[M.level]; out.push('<span class="pt hold" data-k="hold"><i>🏳️</i><b>' + v + '/' + tg + '</b><em style="width:' + Math.min(100, v / tg * 100) + '%"></em></span>'); }
  if(!p.ghost){ out.push(tile('bomb', '💣', p.bombsMax, true), tile('fire', '🔥', p.fire, true), tile('speed', '👟', p.spd, p.spd > 0));
    ['kick', 'toss', 'shield', 'remote', 'dash'].forEach(k => { if(p[k]) out.push(tile(k, POWER_INFO[k][0], null, true)); }); if(p.err > 0) out.push(tile('err', '😵', null, true)); }
  else out.push('<span class="pt ghostt"><i>🪤</i><b>' + (p.lockCd > 0 ? Math.ceil(p.lockCd) + 's' : 'ready') + '</b></span>');
  return out.join('');
}
function chipTop(p){
  const M = G.M; let s = '';
  if(M.mode === 'battle' && M.need > 1) s = '<span class="stars">' + '★'.repeat(Math.min(M.wins[p.i], M.need)) + '<u>' + '☆'.repeat(Math.max(0, M.need - M.wins[p.i])) + '</u></span>';
  return s;
}
function hearts(p){ const M = G.M; if(!(M.mode === 'battle' || M.mode === 'stage') || !p.human || M.L.lives <= 1) return ''; let h = ''; for(let i = 0; i < M.L.lives; i++) h += i < p.lives ? '❤️' : '🖤'; return h; }
function polishChip(p, el){
  const sig = chipHtml(p), top = chipTop(p), hp = hearts(p), last = el._sig || {};
  if(last.pw !== sig){
    const old = {}; el.querySelectorAll('.pw .pt').forEach(t => { old[t.dataset.k] = t.querySelector('b') ? t.querySelector('b').textContent : '1'; });
    el.querySelector('.pw').innerHTML = sig;
    el.querySelectorAll('.pw .pt').forEach(t => { const k = t.dataset.k, v = t.querySelector('b') ? t.querySelector('b').textContent : '1'; if(old[k] !== undefined && old[k] !== v && k !== 'hold' || (old[k] === undefined && last.pw !== undefined && k !== 'hold')) t.classList.add('bump'); });
    last.pw = sig; }
  if(last.top !== top){ el.querySelector('.stt').innerHTML = top; last.top = top; }
  if(last.hp !== hp){ el.querySelector('.hp').textContent = hp; el.querySelector('.hp').classList.toggle('hidden', !hp); last.hp = hp; }
  el._sig = last;
  el.classList.toggle('shielded', !!p.shield && !p.ghost);
  if(p.ghost) el.style.setProperty('--lk', String(Math.max(0, Math.min(1, 1 - p.lockCd / 10))));
  el.classList.toggle('danger', inDanger(p));
}
/* ---- round intro (VS + 3·2·1·GO), round-end zoom, mood ---- */
function drawIntro(g, M){
  const W = G.sw, H = G.sh, ready = M.readyT, total = 2.6, q = 1 - ready / total;
  g.save(); g.fillStyle = 'rgba(10,4,24,' + (0.55 * Math.min(1, ready / 0.4)) + ')'; g.fillRect(0, 0, W, H);
  const ps = M.P.filter(p => !p.gone).slice(0, 8), n = ps.length, slide = ease(q / 0.35), cy = H * 0.42, k = Math.min(1.1, H / 520, W / (n * 120));
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '700 ' + Math.round(Math.min(34, W / 14)) + 'px Fredoka, sans-serif'; g.fillStyle = '#FFC845'; g.globalAlpha = Math.min(1, q * 4);
  g.fillText(M.mode === 'battle' ? 'ROUND ' + M.round : M.mode === 'stage' ? (M.stage.boss ? 'BOSS!' : 'STAGE ' + (M.stage.n + 1)) : M.mode === 'hold' ? 'HOLD THE LAND' : 'CLASSIC', W / 2, H * 0.14);
  g.globalAlpha = 1;
  ps.forEach((p, j) => { const left = j < Math.ceil(n / 2), slot = (j + 0.5) / n, tx = W * (0.08 + slot * 0.84), fromX = left ? -120 : W + 120, x = fromX + (tx - fromX) * slide, col = p.human ? (SEAT_COL[M.P.filter(q => q.human).indexOf(p)] || '#FF7A1A') : BOT_COL;
    g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.ellipse(x, cy + 62 * k, 44 * k, 12 * k, 0, 0, 7); g.fill();
    g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.ellipse(x, cy + 62 * k, 40 * k, 10 * k, 0, 0, 7); g.stroke();
    drawAvatar(g, {name: p.name, av: G.avFor(p.i), dir: left ? 1 : -1, walkT: slide < 1 ? G.t * 2 : 0, gest: slide >= 1 ? {g: gestK(p.human ? 'wave' : 'cheer'), t: G.t + j} : null, jumpH: 0}, x, cy + 60 * k, 1.05 * k, {t: G.t});
    g.font = '800 ' + Math.round(13 * Math.max(0.85, k)) + 'px Nunito, sans-serif'; g.fillStyle = '#fff'; g.fillText((p.name || '').slice(0, 10), x, cy + 86 * k);
    if(!p.human){ emo(g, (BOT_KIND[p.kind] || ['🤖'])[0], x + 26 * k, cy - 50 * k, 18 * k); } });
  if(n === 2 && slide > 0.9){ g.font = '700 ' + Math.round(40 * k) + 'px Fredoka, sans-serif'; g.fillStyle = '#FF7A1A'; g.fillText('VS', W / 2, cy); }
  const num = ready > 1.5 ? '' : ready > 1.0 ? '3' : ready > 0.5 ? '2' : '1';
  if(num){ const fr = (ready % 0.5) / 0.5, s = 1 + (fr - 0.6) * 0.8; g.save(); g.translate(W / 2, H * 0.8); g.scale(Math.max(0.6, s), Math.max(0.6, s)); g.font = '700 ' + Math.round(Math.min(72, H / 6)) + 'px Fredoka, sans-serif'; g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.strokeText(num, 0, 0); g.fillStyle = '#fff'; g.fillText(num, 0, 0); g.restore(); if(G.lastNum !== num){ G.lastNum = num; tick(); boing(num === '1' ? 700 : 520, 0.1, 'triangle', 0.14, 600); } }
  g.restore();
}
function drawGo(g){
  const q = (G.t - G.goT) / 0.6; if(!(q >= 0 && q < 1)) return; const W = G.sw, H = G.sh;
  g.save(); g.globalAlpha = 1 - q; g.translate(W / 2, H * 0.45); const s = 0.6 + ease(q * 2) * 0.8; g.scale(s, s);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 ' + Math.round(Math.min(80, H / 5)) + 'px Fredoka, sans-serif'; g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,0.45)'; g.strokeText('GO!', 0, 0); g.fillStyle = '#FFC845'; g.fillText('GO!', 0, 0); g.restore();
  if(G.lastNum !== 'go'){ G.lastNum = 'go'; boing(880, 0.2, 'triangle', 0.2, 1320); }
}
function endZoom(g, R){
  // round won: the camera eases in on the winner's dance (30 % closer, winner drifts toward the middle)
  const M = G.M; if(M.state !== 'end' || !(M.roundWinner >= 0) || reduced()) return; const W = M.P[M.roundWinner]; if(!W || !W.alive) return;
  const q = ease((G.t - (G.endAt == null ? G.t : G.endAt)) / 0.7), z = 1 + 0.3 * q, wx = R.OX + (W.x + 0.5) * R.CS, wy = R.OY + (W.y + 0.2) * R.CS;
  const tx = wx + (G.sw / 2 - wx) * q * 0.7, ty = wy + (G.sh / 2 - wy) * q * 0.7;
  g.translate(tx, ty); g.scale(z, z); g.translate(-wx, -wy);
}
function drawMood(g){
  const W = G.sw, H = G.sh, M = G.M;
  const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.38)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if(M.sd){ const a = 0.25 + 0.2 * Math.sin(G.t * 5); g.fillStyle = 'rgba(30,0,0,0.12)'; g.fillRect(0, 0, W, H); const e = Math.min(W, H) * 0.08;
    [[0, 0, W, e, 0, 0, 0, e], [0, H - e, W, e, 0, H, 0, H - e], [0, 0, e, H, 0, 0, e, 0], [W - e, 0, e, H, W, 0, W - e, 0]].forEach(r => { const gr = g.createLinearGradient(r[4], r[5], r[6], r[7]); gr.addColorStop(0, 'rgba(255,40,40,' + a + ')'); gr.addColorStop(1, 'rgba(255,40,40,0)'); g.fillStyle = gr; g.fillRect(r[0], r[1], r[2], r[3]); }); }
}
// ambient life on the maze (under the players): leaves, bubbles, sparkles, gears, stars, clouds, bats
function drawAmbient(g, st, CS, t){
  const M = st.M, A = AMBIENT[st.theme]; if(!A) return; const n = Math.round(M.W * M.H / 22), W = M.W * CS, H = M.H * CS;
  for(let i = 0; i < n; i++){ const s1 = (i * 9301 + 49297) % 233280 / 233280, s2 = (i * 4093 + 7919) % 1000 / 1000, sp = 0.3 + s2 * 0.5; let x, y, a = 0.35, sz = CS * (0.22 + s2 * 0.18);
    if(A[1] === 'fall'){ x = (s1 * W + Math.sin(t * 0.8 + i) * CS * 0.6); y = ((s2 * H + t * CS * sp) % (H + CS)) - CS * 0.5; }
    else if(A[1] === 'rise'){ x = s1 * W + Math.sin(t + i) * CS * 0.3; y = H - ((s2 * H + t * CS * sp) % (H + CS)); a = 0.4; }
    else if(A[1] === 'drift'){ x = ((s1 * W + t * CS * sp * 0.6) % (W + CS * 2)) - CS; y = s2 * H; a = st.theme === 'sky' ? 0.3 : 0.18; sz *= st.theme === 'sky' ? 2.2 : 1; }
    else if(A[1] === 'flap'){ x = ((s1 * W + t * CS * sp) % (W + CS * 2)) - CS; y = s2 * H * 0.6 + Math.sin(t * 3 + i) * CS * 0.3; a = 0.4; }
    else { x = s1 * W; y = s2 * H; a = 0.15 + 0.35 * Math.max(0, Math.sin(t * (1 + s2 * 2) + i * 1.7)); sz *= 0.7; }
    emo(g, A[0], x, y, sz, a); }
  if(st.theme === 'dance'){ for(let i = 0; i < 3; i++){ const an = Math.sin(t * 0.8 + i * 2.1) * 0.6, x0 = W * (0.2 + i * 0.3); g.save(); g.globalAlpha = 0.1; g.fillStyle = ['#FF4FA3', '#40C4FF', '#FFD84D'][i]; g.beginPath(); g.moveTo(x0, -CS); g.lineTo(x0 + Math.tan(an - 0.18) * H, H); g.lineTo(x0 + Math.tan(an + 0.18) * H, H); g.closePath(); g.fill(); g.restore(); } }
  if(st.theme === 'zombie'){ g.save(); const gr = g.createLinearGradient(0, H * 0.6, 0, H); gr.addColorStop(0, 'rgba(120,200,80,0)'); gr.addColorStop(1, 'rgba(120,200,80,0.12)'); g.fillStyle = gr; g.fillRect(0, H * 0.6, W, H * 0.4); g.restore(); }
}
function drawPolishFx(g, st, CS, t, f, q, under){
  const X = x => (x + 0.5) * CS, Y = y => (y + 0.5) * CS;
  if(f.k === 'flash'){ const r = CS * f.r * (0.6 + q * 0.8), gr = g.createRadialGradient(X(f.x), Y(f.y), 0, X(f.x), Y(f.y), r); gr.addColorStop(0, 'rgba(255,255,255,' + (0.95 * (1 - q)) + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(X(f.x), Y(f.y), r, 0, 7); g.fill(); return true; }
  if(f.k === 'pt'){ const tt = f.t, x = X(f.x + f.vx * tt), y = Y(f.y + f.vy * tt + 0.5 * f.g * tt * tt), a = 1 - q, s = CS * f.size; g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(f.rot + f.vr * tt);
    if(f.s === 'sq'){ g.fillStyle = f.col; g.fillRect(-s / 2, -s / 2, s, s * 0.7); }
    else if(f.s === 'ci' || f.s === 'goo'){ g.fillStyle = f.col; g.beginPath(); g.arc(0, 0, s * (f.s === 'goo' ? 0.9 : 0.5), 0, 7); g.fill(); }
    else if(f.s === 'bub'){ g.strokeStyle = f.col; g.lineWidth = Math.max(1, s * 0.25); g.beginPath(); g.arc(0, 0, s * 0.8, 0, 7); g.stroke(); }
    else if(f.s === 'spark'){ g.strokeStyle = f.col; g.lineWidth = Math.max(1.5, s * 0.35); g.beginPath(); g.moveTo(-s * 1.4, 0); g.lineTo(s * 1.4, 0); g.stroke(); }
    else if(f.s === 'zig'){ g.strokeStyle = f.col; g.lineWidth = Math.max(1.5, s * 0.3); g.beginPath(); g.moveTo(-s * 1.5, -s); g.lineTo(0, -s * 0.2); g.lineTo(-s * 0.4, s * 0.3); g.lineTo(s * 1.5, s); g.stroke(); }
    else if(f.s === 'emo'){ g.restore(); emo(g, f.ch, x, y, s, a); return true; }
    g.restore(); return true; }
  if(f.k === 'dust'){ g.fillStyle = 'rgba(220,210,200,' + (0.45 * (1 - q)) + ')'; g.beginPath(); g.arc(X(f.x), Y(f.y) - q * CS * 0.3, CS * (0.15 + q * 0.4), 0, 7); g.fill(); return true; }
  if(f.k === 'combo'){ const s = 1 + Math.max(0, 0.6 - q * 3); g.save(); g.globalAlpha = 1 - Math.max(0, q - 0.6) / 0.4; g.translate(X(f.x), Y(f.y) - q * CS * 0.5); g.scale(s, s); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 ' + Math.round(CS * 0.48) + 'px Fredoka, sans-serif'; g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,0.55)'; const txt = 'CHAIN x' + f.n; g.strokeText(txt, 0, 0); g.fillStyle = ['#FFC845', '#FF9F1C', '#FF4D6D', '#C04BFF'][Math.min(3, f.n - 2)]; g.fillText(txt, 0, 0); g.restore(); return true; }
  if(f.k === 'label'){ g.save(); g.globalAlpha = 1 - Math.max(0, q - 0.6) / 0.4; const y = Y(f.y) - ease(q) * CS * 0.7, s = 0.7 + ease(q * 3) * 0.3; g.translate(X(f.x), y); g.scale(s, s); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 ' + Math.round(CS * 0.3) + 'px Nunito, sans-serif'; const w = g.measureText(f.text).width + CS * 0.5;
    g.fillStyle = 'rgba(20,8,40,0.8)'; rrect(g, -w / 2 - CS * 0.15, -CS * 0.22, w + CS * 0.3, CS * 0.44, CS * 0.2); g.fill(); g.fillStyle = f.col || '#FFC845'; g.fillText(f.text, CS * 0.16, 0); g.restore(); emo(g, f.ch || '✨', X(f.x) - (w / 2) * s + CS * 0.05, y, CS * 0.3 * s, 1 - Math.max(0, q - 0.6) / 0.4); return true; }
  if(f.k === 'stamp' && !under) return true;
  if(f.k === 'stamp'){ const s = 2.2 - ease(q * 4) * 1.2, a = q < 0.75 ? 1 : 1 - (q - 0.75) / 0.25; g.save(); g.globalAlpha = a; g.translate(X(f.x), Y(f.y)); g.rotate(-0.18); g.scale(s, s); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 ' + Math.round(CS * 0.38) + 'px Fredoka, sans-serif';
    const w = g.measureText(f.text).width + CS * 0.3; g.strokeStyle = '#E5484D'; g.lineWidth = Math.max(2, CS * 0.07); rrect(g, -w / 2, -CS * 0.26, w, CS * 0.52, CS * 0.08); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fill(); g.fillStyle = '#E5484D'; g.fillText(f.text, 0, CS * 0.02); g.restore(); return true; }
  if(f.k === 'plus'){ const p = st.M.P[f.i]; if(!p) return true; g.save(); g.globalAlpha = 1 - q; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 ' + Math.round(CS * 0.36) + 'px Fredoka, sans-serif'; const y = Y(p.y) - CS * 1.4 - ease(q) * CS * 0.5; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.strokeText('+1', X(p.x) - CS * 0.12, y); g.fillStyle = '#7CFFB2'; g.fillText('+1', X(p.x) - CS * 0.12, y); g.restore(); emo(g, '💥', X(p.x) + CS * 0.28, y, CS * 0.3, 1 - q); return true; }
  if(f.k === 'talk'){ const p = st.M.P[f.i]; if(!p || (!p.alive && !p.ghost && !p.edge && !(p.act && p.act.k === 'caught'))) return true; const a = q < 0.85 ? Math.min(1, f.t * 8) : 1 - (q - 0.85) / 0.15, x = X(p.x); let y = Y(p.y) - CS * 1.55 - (p.ghost ? CS * 0.3 : 0);
    g.save(); g.globalAlpha = a; g.font = '800 ' + Math.max(11, Math.round(CS * 0.27)) + 'px Nunito, sans-serif'; const w = g.measureText(f.text).width + CS * 0.36, h = CS * 0.46; if(y - h < -R0.OY + 4) y = -R0.OY + 4 + h; const bx = Math.max(-R0.OX + 4, Math.min(x - w / 2, st.M.W * CS - w + (G.sw - R0.OX - st.M.W * CS) - 4));
    g.fillStyle = '#FFFFFF'; rrect(g, bx, y - h, w, h, h / 2); g.fill(); g.beginPath(); g.moveTo(x - CS * 0.08, y - 1); g.lineTo(x + CS * 0.1, y - 1); g.lineTo(x, y + CS * 0.14); g.closePath(); g.fill();
    g.strokeStyle = p.human ? chipColOf(st, p.i) : BOT_COL; g.lineWidth = 2; rrect(g, bx, y - h, w, h, h / 2); g.stroke(); g.fillStyle = '#2A1A40'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(f.text, bx + w / 2, y - h / 2 + 1); g.restore(); return true; }
  return false;
}
let R0 = {OX: 0, OY: 0};

/* ================= FINISH + SAVES ================= */
function finishMatch(){
  if(G.M.mode === 'stage') return finishStage();
  const M = G.M; G.shown = true; G.over = true; const win = M.winner, secs = Math.max(1, Math.round(M.totalT));
  if(window.UI && UI.callout) UI.callout.setup(null); /* 💬 24t-d match end */
  cheerEnd();   /* 📣 cs-2b: match end */
  const humans = M.P.filter(p => p.human), vsBots = humans.length === 1, wP = M.P[win];
  const myWin = win >= 0 && (M.teams ? M.P[win].team === humans[0].team : win === humans[0].i);
  UISound.play(myWin || (!vsBots && wP && wP.human) ? 'success' : 'error');
  if(FX && wP) confetti(wP.human ? ['🎉', '💣', '✨', '👻'] : ['🤖', '💥'], 26);
  let icon, title;   /* 🧱 b3w5: the shared 🏁 card */
  if(M.mode === 'hold' && M.teams){ icon = '🏳️'; title = (M.winSide ? '🔵 Team Moon' : '🟠 Team Sun') + ' holds the land!'; }
  else if(!wP){ icon = '🤝'; title = 'Nobody left standing!'; }
  else if(wP.human){ icon = '🏆'; title = wP.name + ' wins!'; }
  else { icon = (BOT_KIND[wP.kind] || ['🤖'])[0]; title = wP.name + ' (bot) wins this time'; }
  const tip = vsBots && !myWin ? pickOne(['Plant, then walk round a corner — the + only goes straight!', 'Watch the red glow: that is where the pop will go.', 'Grab 🔥 and 💣 early — break blocks near your start.', 'Two bombs in a row = chain pop!', 'As a 👻 ghost, float next to someone near a bomb and press ✨.']) : '';
  const me = M.stats[humans[0].i], lvl = M.level, nextOk = myWin && vsBots && M.mode === 'battle' && lvl < 5;
  GF.result({wrap: $('result'), card: $('result-card'), win: wP ? myWin : null, icon, title, sub: tip ? '💡 ' + tip : '', stars: null, score: BOP.scoreFor(M, humans[0].i),
    stats: (M.mode === 'battle' ? [['⚔️', humans.map(p => p.name + ' ' + M.wins[p.i]).join(' · ') + ' rounds']] : []).concat([['🧱', me.blocks + ' blocks'], ['💥', (me.catches + me.bots) + ' caught'], ['🔗', me.chains + ' chains']], me.comebacks ? [['👻', me.comebacks + ' comebacks']] : [], [['⏱', fmtS(secs)]]),
    save: humans.some(p => p.name !== 'Guest') ? 'Saving…' : null, buddy: {name: S.player, av: myAvatar(S.player)}, comic: true, confetti: false,
    levels: () => backToMenu(), levelsText: '🎚️ Levels', again: () => startMatch(), againText: '🔁 Again', extra: [{text: '🕹️ Gameroom', fn: () => goGameroom()}],
    next: nextOk ? () => { hideResult(); chosenLevel = lvl + 1; ls(store('lv'), String(lvl + 1)); fillSetup(); startMatch(); } : null,
    nextText: lvl === 4 ? 'Try 💀 Hardcore ▶' : 'Next level ▶'});
  if(humans.length > 1){ const row = $('result-card').querySelector('.gf-r-btns'); if(row){ const d = document.createElement('div'); d.className = 'b3-more stats';
    d.innerHTML = humans.slice(1).map(p => { const s2 = M.stats[p.i]; return '<span>' + UI.esc(p.name) + ': 💥 ' + (s2.catches + s2.bots) + ' · 🧱 ' + s2.blocks + '</span>'; }).join(''); row.parentNode.insertBefore(d, row); } }
  [['btn-levels', 'b-menu'], ['btn-again', 'b-again'], ['btn-next', 'b-next']].forEach(([x, y]) => { const e = $(x); if(e) e.id = y; });   // the old ids (tests, crowd)
  cheerFaces();   /* 📣 cs-2b */
  NOTES.length = 0;
  humans.forEach((p, seat) => {
    if(p.name === 'Guest') return;
    const won = win >= 0 && (M.teams ? M.P[win].team === p.team : win === p.i);
    const stats = statsFor(M, p, won, vsBots);
    if(won && vsBots && M.mode === 'battle'){ const prev = Number(ls('sp_soulbopper_won:' + p.name)) || 0; if(M.level + 1 > prev) ls('sp_soulbopper_won:' + p.name, String(M.level + 1)); const b = S.bopper[p.name] || (S.bopper[p.name] = {}); b.bestWin = Math.max(Number(b.bestWin) || 0, M.level + 1); }
    saveFeatsOnly(p.name, stats, seat);
  });
}
function statsFor(M, p, won, vsBots){
  const s = M.stats[p.i];
  const o = {games: 1, wins: won ? 1 : 0, catches: s.catches, bots: s.bots, blocks: s.blocks, chains: s.chains, kicks: s.kicks, tosses: s.tosses, hits: s.hits || 0, homeruns: s.homeruns || 0, comebacks: s.comebacks, multi: s.multi, triple: s.triple, pickups: s.pickups};
  if(won && vsBots && M.mode === 'battle') o.bestWin = M.level + 1;
  if(M.mode === 'classic'){ o.pooGames = 1; if(won) o.pooWins = 1; }
  if(M.mode === 'hold'){ o.holdSecs = Math.round(s.hold); if(won) o.holdWins = 1; }
  o['g_' + M.theme] = 1; o['c_' + M.theme] = s.catches + s.bots; if(won && vsBots) o['wl_' + M.theme] = M.level + 1;
  return o;
}
const PENDING_KEY = 'sp_soulbopper_pending';
const NOTES = [];
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => { const r = google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))); if(w.feats) r.saveFeats(w.name, GAME_ID, w.stats); else r.saveLevelResult(GAME_ID, w.name, w.lvl, w.extra); }); }
function putNote(i, html){ NOTES[i] = html; const n = $('save-note'); if(n) n.innerHTML = NOTES.filter(Boolean).join('<br>'); }
function saveWin(name, lvlIdx, extra, seat, tries){
  tries = tries || 0; const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []});
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res.best) best[lvlIdx] = res.best;
      S.progress[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending(); putNote(seat, saveText(res, extra.cleared));
    }).withFailureHandler(() => {
      if(tries < 1){ setTimeout(() => saveWin(name, lvlIdx, extra, seat, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl: lvlIdx, extra}])); putNote(seat, '⚠️ Could not save yet — it will be sent again next time.');
    }).saveLevelResult(GAME_ID, name, lvlIdx, extra);
}
function saveFeatsOnly(name, stats, seat, tries){
  const who = UI.esc(name) + ': '; tries = tries || 0;
  google.script.run.withSuccessHandler(res => { flushPending(); putNote(seat, who + featText(res, stats.bestWin ? '✅ Saved — ' + (stats.bestWin < 6 ? BOP.LEVELS[Math.min(5, stats.bestWin)].name + ' is open!' : 'you beat 💀 Hardcore!') : '✅ Feats saved')); })
    .withFailureHandler(() => { if(tries < 1){ setTimeout(() => saveFeatsOnly(name, stats, seat, tries + 1), 1200); return; } writePending(readPending().concat([{name, feats: true, stats}])); putNote(seat, who + '⚠️ Will be sent next time.'); }).saveFeats(name, GAME_ID, stats);
}
function featText(fe, base){ let h = base || ''; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { h += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); } return h; }
function saveText(res, cleared){
  const h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : cleared ? (res.best && res.best.score ? 'Best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Saved') : '✅ Saved';
  return featText(res.feats, h);
}
function showResult(html){ /* 💬 24t-d result */ if(window.UI && UI.callout) UI.callout.setup(null); $('result-card').innerHTML = html; $('result').classList.remove('hidden'); cheerFaces();   /* 📣 cs-2b */ }
function hideResult(){ $('result').classList.add('hidden'); }
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pickOne(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 p1c: ◀ = where you came from (Gameroom if we don't know)
window.feedbackContext = () => ({page: 'Soul Bopper', game: GAME_ID, level: G ? G.level : SET.level, mode: SET.mode});
/* ================= 🗺️ STAGE MODE (round 3): 7 worlds × 5 stages + a boss ================= */
const WORLD_KEYS = ['dino', 'sea', 'dance', 'robot', 'space', 'sky', 'zombie'];
function stageTimeOf(M){ return (M.stage && M.stage.time) || [240, 220, 200, 180, 180, 150][M.level]; }
// world progress = stages cleared (0–6, 6 = boss beaten); kept on the server as max feats w_<world> and on this device
function worldDone(name, w){ const k = WORLD_KEYS[w], srv = Number((bopInfo(name).worlds || {})[k]) || 0; let loc = 0; try{ loc = Number((JSON.parse(ls('sp_soulbopper_stage:' + name) || '{}'))[k]) || 0; }catch(e){} return Math.max(srv, loc); }
function setWorldDone(name, w, n){ try{ const o = JSON.parse(ls('sp_soulbopper_stage:' + name) || '{}'); const k = WORLD_KEYS[w]; o[k] = Math.max(Number(o[k]) || 0, n); ls('sp_soulbopper_stage:' + name, JSON.stringify(o)); }catch(e){} const b = S.bopper[name] || (S.bopper[name] = {}); b.worlds = b.worlds || {}; b.worlds[WORLD_KEYS[w]] = Math.max(Number(b.worlds[WORLD_KEYS[w]]) || 0, n); }
function worldOpen(name, w){ return w === 0 || worldDone(name, w - 1) >= 6; }
function showWorlds(){
  savePrefs(); const box = $('world-list'), me = S.player;
  $('world-sub').textContent = BOP.LEVELS[SET.level].name + ' · ' + humanList().map(n => n).join(' + ') + ' — beat a world\'s 👑 boss to open the next world.';
  box.innerHTML = WORLD_KEYS.map((k, w) => { const T = THEMES[k], d = worldDone(me, w), open = worldOpen(me, w);
    return '<button class="world' + (open ? '' : ' locked') + (SET.world === w ? ' on' : '') + '" data-w="' + w + '" data-sound="' + (open ? 'pop' : 'none') + '"><canvas width="180" height="180"></canvas>' + (open ? '' : '<span class="lk">🔒</span>') +
      '<div class="nm">' + T.icon + ' ' + (w + 1) + '. ' + T.name + '</div><div class="dots">' + [0, 1, 2, 3, 4].map(i => i < d ? '🟢' : '⚪').join('') + (d >= 6 ? '👑' : '🔸') + '</div></button>'; }).join('');
  box.querySelectorAll('.world').forEach(b => { const w = Number(b.dataset.w); themePreview(b.querySelector('canvas'), WORLD_KEYS[w]);
    b.onclick = () => { if(!worldOpen(me, w)){ UISound.play('error'); UI.toast('🔒 Beat the 👑 boss of world ' + w + ' first'); return; } SET.world = w; box.querySelectorAll('.world').forEach(x => x.classList.toggle('on', x === b)); showStages(w); }; });
  if(SET.world == null || !worldOpen(me, SET.world)) SET.world = 0;
  showScreen('world'); showStages(SET.world);
}
function showStages(w){
  const k = WORLD_KEYS[w], T = THEMES[k], d = worldDone(S.player, w), B = BOP.BOSSES[k];
  $('stage-box').classList.remove('hidden'); $('stage-head').textContent = T.icon + ' ' + T.name + ' — pick a stage';
  $('stage-row').innerHTML = [0, 1, 2, 3, 4, 5].map(i => { const boss = i === 5, done = i < d, open = i <= d;
    return '<button class="stg' + (boss ? ' boss' : '') + (done ? ' done' : '') + (open ? '' : ' locked') + (i === Math.min(d, 5) ? ' next' : '') + '" data-i="' + i + '" data-sound="' + (open ? 'pop' : 'none') + '">' + (boss ? B[0] + ' Boss' : 'Stage ' + (i + 1)) + '<small>' + (done ? '✅ cleared' : open ? (boss ? B[1] : (BOP.STAGE_FOES[i].length + ' bots')) : '🔒') + '</small></button>'; }).join('');
  $('stage-note').textContent = 'Catch every bot → the 🚪 exit appears under a block. ⭐ exit · ⭐⭐ no life lost · ⭐⭐⭐ fast too. The boss needs 3 pops!';
  $('stage-row').querySelectorAll('.stg').forEach(b => b.onclick = () => { const i = Number(b.dataset.i); if(i > worldDone(S.player, w)){ UISound.play('error'); UI.toast('Clear the stage before first'); return; } SET.world = w; SET.stage = i; startMatch(); });
}
function finishStage(){
  const M = G.M; G.shown = true; G.over = true; const humans = M.P.filter(p => p.human), clear = !!M.stageClear, secs = Math.max(1, Math.round(M.t)), w = M.stage.world, n = M.stage.n;
  if(window.UI && UI.callout) UI.callout.setup(null); /* 💬 24t-d stage end */
  cheerEnd();   /* 📣 cs-2b: stage end */
  const stars = clear ? BOP.starsFor(M, humans[0].i) : 0, score = clear ? Math.round((800 + Math.max(0, stageTimeOf(M) - M.t) * 10 + stars * 200) * (M.level === 5 ? 3 : 1)) : 0;
  UISound.play(clear ? 'success' : 'error'); if(clear && FX) confetti(['🎉', '🚪', '⭐', THEMES[G.theme].icon], 24);
  const head = clear ? (M.stage.boss ? '<div class="big">👑</div><h2 class="cheer">' + UI.esc(M.boss ? M.boss.name : 'Boss') + ' beaten!</h2>' : '<div class="big">🚪</div><h2 class="cheer">Stage ' + (n + 1) + ' cleared!</h2>')
    : '<div class="big">' + (M.stageFail === 'time' ? '⏰' : '💫') + '</div><h2>' + (M.stageFail === 'time' ? 'Out of time!' : 'Caught!') + '</h2>';
  const nextOk = clear && !(M.stage.boss && w === WORLD_KEYS.length - 1);
  const me = M.stats[humans[0].i];
  showResult(head + (clear ? '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '" style="animation-delay:' + (i * 0.15) + 's">⭐</span>').join('') + '</div><div class="score-big">🏆 ' + score.toLocaleString() + '</div>' : '<div class="note">💡 ' + pickOne(['Catch the bots first — the 🚪 only opens after that.', 'The exit hides under a block far from your start.', 'Grab 🔥 to reach the bots from further away.', 'The boss needs 3 pops — plant in its path, then run!']) + '</div>') +
    '<div class="stats"><span>🧱 ' + me.blocks + ' blocks</span><span>🤖 ' + me.bots + ' bots caught</span><span>⏱ ' + fmtS(secs) + '</span></div>' +
    '<div class="comic-strip-slot" id="comic-strip-slot"></div><div class="save-note" id="save-note">' + (humans.some(p => p.name !== 'Guest') ? '💾 Saving…' : '') + '</div>' +
    '<div class="res-btns">' + (nextOk ? '<button class="btn sp-btn sp-primary" data-sound="pop" onclick="nextStage()">▶ ' + (M.stage.boss ? 'Next world' : n === 4 ? '👑 Boss!' : 'Next stage') + '</button>' : '') + '<button class="btn sp-btn ' + (nextOk ? 'soft sp-secondary' : 'sp-primary') + '\" data-sound="pop" onclick="startMatch()">🔁 ' + (clear ? 'Again' : 'Try again') + '</button><button class="btn soft sp-btn sp-secondary" data-sound="none" onclick="hideResult(); if(G) cancelAnimationFrame(G.raf); G = null; showWorlds()">🗺️ Worlds</button></div>');
  NOTES.length = 0;
  humans.forEach((p, seat) => {
    if(p.name === 'Guest') return;
    const s = M.stats[p.i], stats = {games: 1, blocks: s.blocks, bots: s.bots, chains: s.chains, kicks: s.kicks, tosses: s.tosses, multi: s.multi, triple: s.triple, pickups: s.pickups};
    if(clear){ stats.stages = 1; stats['w_' + G.theme] = n + 1; if(M.stage.boss) stats.bosses = 1; setWorldDone(p.name, w, n + 1); stats['g_' + G.theme] = 1; stats['c_' + G.theme] = s.bots;
      saveWin(p.name, M.level, {score, stars: p.lives > 0 ? stars : Math.min(stars, 1), cleared: true, timeSec: secs, theme: THEMES[G.theme].name + ' ' + (M.stage.boss ? 'boss' : (n + 1)), stats}, seat); }
    else saveFeatsOnly(p.name, stats, seat);
  });
}
function nextStage(){ const M = G.M; if(M.stage.boss){ SET.world = Math.min(WORLD_KEYS.length - 1, M.stage.world + 1); SET.stage = 0; } else SET.stage = M.stage.n + 1; startMatch(); }

/* ================= 💣 BOMB SKINS (round 4) — picked per player per device: sp_soulbopper_skin:<Name> ================= */
function skinInfo(name){ const b = bopInfo(name); return {themes: b.themes || {}, extras: b.extras || []}; }
function skinOf(name){ const id = ls('sp_soulbopper_skin:' + name) || ''; if(!id || id === 'random') return id; return BombSkins.owned(skinInfo(name)).indexOf(id) >= 0 ? id : ''; }
let SKIN_FOR = '';
function buildSetupExtra(){
  if(!window.BombSkins) return; const hs = humanList().filter(n => n !== 'Guest'); if(hs.indexOf(SKIN_FOR) < 0) SKIN_FOR = hs[0] || S.player;
  $('skin-who').innerHTML = hs.length > 1 ? hs.map(n => '<button class="chip' + (n === SKIN_FOR ? ' on' : '') + '" data-n="' + UI.esc(n) + '" data-sound="tap">' + UI.esc(n) + '</button>').join('') : '';
  $('skin-who').querySelectorAll('.chip').forEach(b => b.onclick = () => { SKIN_FOR = b.dataset.n; buildSetupExtra(); });
  const cur = skinOf(SKIN_FOR), list = BombSkins.chips(skinInfo(SKIN_FOR), cur);
  $('skin-list').innerHTML = list.map(c => '<button class="skin' + (c.have ? '' : ' lock') + (c.on ? ' on' : '') + '" data-id="' + c.id + '" title="' + UI.esc(c.how) + '" data-sound="tap"><canvas width="112" height="112"></canvas><span>' + UI.esc(c.name) + '</span></button>').join('');
  $('skin-list').querySelectorAll('.skin').forEach((b, j) => { const c = b.querySelector('canvas'), g = c.getContext('2d'), id = b.dataset.id;
    if(!id){ emo(g, THEMES[SET.mode === 'stage' ? 'dino' : SET.theme].bomb, 56, 58, 70); } else BombSkins.draw(g, id, 56, 58, 70, 1 + j * 0.3, 0);
    b.onclick = () => { const c2 = list[j]; if(!c2.have){ UISound.play('error'); UI.toast('🔒 ' + c2.name + ': ' + c2.how); return; } ls('sp_soulbopper_skin:' + SKIN_FOR, id); $('skin-list').querySelectorAll('.skin').forEach(x => x.classList.toggle('on', x === b)); $('skin-note').textContent = '✅ ' + SKIN_FOR + ': ' + c2.name; }; });
  $('skin-note').textContent = UI.esc(SKIN_FOR) + ' uses: ' + BombSkins.nameOf(cur) + ' · tap a 🔒 one to see how to get it';
}
function randomSkin(name){ const own = BombSkins.owned(skinInfo(name)); return own[Math.floor(Math.random() * own.length)] || 'dino:0'; }


/* ================= BOOT ================= */
function boot(){
  UI.loading(GAME_ID);
  try{ const q = Number(localStorage.getItem('sp_soulbopper_q')); if(q > 0 && q <= 1) window.__q = q; }catch(e){}
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {}; S.bopper = d.bopper || {};
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending(); bootExtra(d);
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { loadKeys(); renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); loadKeys(); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
function bootExtra(d){}
boot();

/* ✨ MODE SPOTLIGHT (modes-3): ?mode=<id> opens this game straight in that mode after the player pick · "✨ Also try" on the start page · started modes → UI.modeTried */
const MS_GAME = 'soul-bopper';
function msOpen(id){
  if(MODE_KEYS.indexOf(id) < 0) return; SET.mode = id; savePrefs(); renderMenu();
}
function msNow(){ return SET.mode; }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startMatch', () => SET.mode);
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */
