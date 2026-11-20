
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'brawl-buddies';
// 🎛️ p1c: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 🥊 Brawl Buddies · level | numbers | game buttons ⏸ ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🥊', name: 'Brawl Buddies', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.M.done), onLeave: () => { try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { pauseGame(); }, resume: () => { if(G && G.paused && !G.M.done) togglePause(); }},
  onFit: () => { if(G && typeof layoutPlay === 'function') layoutPlay(); },
  extras: [{id: 'pause-btn', html: '<span class="gb-pzi" aria-hidden="true"><i></i><i></i></span>', label: 'Pause (P)', onClick: () => togglePause(), keep: true}]});
var NAV_INNER = {menu: ['◀ Brawl Buddies', () => openCover()], adv: ['◀ Brawl Buddies', () => showScreen('menu')]};   // 🧱 b3w5b: the setup page's top button goes back to the 🎬 cover; 🗺️ Brawenture's tale screen back to the setup page   // 🧭 inner screens: their top button goes to the main screen
UI.navBar(document.getElementById('back-btn'), {onclick: false});
BAR.custom('fight', document.getElementById('fhud'));   // 🥊 the fighter bars + clock stay the game's own art, inside the shared bar
// 🗺️ Brawenture (the adventure) has its own play screen → its own bar
const ABAR = UI.gameBar(document.getElementById('abar'), {game: GAME_ID, icon: '🗺️', name: 'Brawenture',
  levels: () => leaveAdv(), playing: () => !!(AV && !AV.over), onLeave: () => { try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { if(AV && !AV.paused && !AV.over && !AV.story) pauseAdv(); }, resume: () => { if(AV && AV.paused && !AV.over) pauseAdv(); }},
  onFit: () => { if(AV && typeof layoutAdv === 'function') layoutAdv(); },
  extras: [{id: 'adv-pause', html: '<span class=\"gb-pzi\" aria-hidden=\"true\"><i></i><i></i></span>', label: 'Pause (P)', onClick: () => pauseAdv(), keep: true}]});
ABAR.custom('adv', document.getElementById('ahold'));
const $ = id => document.getElementById(id);
let FX = 1;   // harness sets 0 (no big words / confetti / hit-stop)
function say(text){ try{ if(!UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.pitch = 1.15; speechSynthesis.speak(u); }catch(e){} }
function pickOne(a){ return a[Math.floor(Math.random() * a.length)]; }
function fmtS(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

/* ================= DATA ================= */
const LEVEL_UI = [
  {emoji: '🌱', blurb: 'A sleepy robot that hardly blocks. Learn to boop and bonk!'},
  {emoji: '🐣', blurb: 'Best of 3 rounds. The robot jumps in and starts blocking.'},
  {emoji: '🔥', blurb: 'The robot does combos and uppercuts — try your 🚀 too!'},
  {emoji: '⚡', blurb: 'Low bonks and sitting blocks. Mix high and low!'},
  {emoji: '🌋', blurb: 'Fast robot that reads your attacks and juggles 5 bounces.'},
  {emoji: '💀', blurb: 'One round, you start with half your hearts — ×3 score.', hardcore: true}
];
const AGE_START = {'4-5': 0, '6-7': 0, '8-9': 1, '10+': 2};
const THEMES = {
  playground: {name: 'Playground', icon: '🛝', sky: ['#8ED6FF', '#E8F7FF'], hill: '#9BD77A', floor: '#D9B77A', floor2: '#C9A46A', edge: '#A9844E', far: ['🛝', '🌳', '🎈', '🏫', '🌳', '⚽'], words: ['POW!', 'BONK!', 'BOOP!'], burst: ['⭐', '💥'], post: '#FF7A1A', rope: '#FFFFFF'},
  candy:      {name: 'Candy Land', icon: '🍭', sky: ['#FFC1E3', '#FFF0F8'], hill: '#FFD9EC', floor: '#FF9AC9', floor2: '#FF84BC', edge: '#E0679E', far: ['🍭', '🧁', '🍩', '🍬', '🎂', '🍫'], words: ['SPLAT!', 'BOOP!', 'YUM!'], burst: ['🍬', '✨'], post: '#FFFFFF', rope: '#FF4D8D'},
  dino:       {name: 'Dino Jungle', icon: '🦖', sky: ['#2F6B33', '#B5DE8F'], hill: '#4E8F3A', floor: '#8A6633', floor2: '#7A5A2E', edge: '#5A4220', far: ['🌴', '🦕', '🌋', '🌿', '🦖', '🥚'], words: ['RAWR!', 'STOMP!', 'BONK!'], burst: ['🦴', '🍃'], post: '#5A3A1A', rope: '#C9E27A'},
  moon:       {name: 'Moon Base', icon: '🚀', sky: ['#05041A', '#2A1E5C'], hill: '#3A3470', floor: '#C1BED3', floor2: '#A9A6BE', edge: '#7E7A99', far: ['🪐', '⭐', '🌍', '🛸', '🌟', '🚀'], words: ['ZAP!', 'BOOP!', 'WHAM!'], burst: ['✨', '🌟'], post: '#9AD7FF', rope: '#6EE7F9'},
  dojo:       {name: 'Dojo', icon: '🏯', sky: ['#F6D7A7', '#FFF4E2'], hill: '#E9C08A', floor: '#D29A5A', floor2: '#C08648', edge: '#8E5C2C', far: ['🏯', '🎋', '🌸', '🏮', '🌸', '🎎'], words: ['HI-YA!', 'BONK!', 'POW!'], burst: ['🌸', '💥'], post: '#B3261E', rope: '#F5E6C8'},
  beach:      {name: 'Beach', icon: '🏖️', sky: ['#4FC3F7', '#E1F5FE'], hill: '#29B6F6', floor: '#F2D49B', floor2: '#E8C27E', edge: '#C9A262', far: ['🌴', '⛱️', '🐚', '🌊', '🦀', '🏄'], words: ['SPLASH!', 'BOOP!', 'WHOOSH!'], burst: ['🫧', '💦'], post: '#FFFFFF', rope: '#FF7A1A'}
};
const THEME_KEYS = Object.keys(THEMES);
const ACTIONS = [['left', '⬅️ Move left'], ['right', '➡️ Move right'], ['jump', '⬆️ Jump'], ['duck', '⬇️ Duck'], ['boop', '👊 Boop'], ['bonk', '💥 Big Bonk'], ['power', '🌀 Power Push'], ['dodge', '💨 Dodge-roll']];
const DEFAULT_KEYS = [
  {left: 'KeyA', right: 'KeyD', jump: 'KeyW', duck: 'KeyS', boop: 'KeyF', bonk: 'KeyG', power: 'KeyH', dodge: 'KeyT'},
  {left: 'KeyL', right: 'Quote', jump: 'KeyP', duck: 'Semicolon', boop: 'ArrowLeft', bonk: 'ArrowDown', power: 'ArrowRight', dodge: 'ArrowUp'}
];
const COL = ['#FF4D6D', '#3D8BFD'];
const ROBO_COL = ['#9CCC65', '#4DD0E1', '#FFB74D', '#BA68C8', '#FF7043', '#E53935'];

/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, gear: {}, player: '', age: ''};
let SET = {level: 0, mode: 'robot', theme: 'playground', opp: '', team: 1};
let G = null, lockHandle = null, KEYS = null;
function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function store(k){ return 'sp_brawl_' + k + ':' + (S.player || ''); }
function loadPrefs(){ try{ const p = JSON.parse(ls(store('prefs')) || '{}'); if(THEMES[p.theme]) SET.theme = p.theme; if(p.mode === 'robot' || p.mode === 'duo') SET.mode = p.mode; if(p.opp) SET.opp = p.opp; if(p.team >= 1 && p.team <= 3) SET.team = p.team; }catch(e){} }
function savePrefs(){ ls(store('prefs'), JSON.stringify({theme: SET.theme, mode: SET.mode, opp: SET.opp, team: SET.team})); }
function myAvatar(name){ const a = S.avatars[name]; return a ? fixAv(a) : defaultAvatar(name || 'player'); }
// fighters wear their look, but no ride-on and nothing in the hands (cartoon gloves instead) — the ride-on comes back for the win dance
function fightAv(av){ const a = JSON.parse(JSON.stringify(av)); a.eq = Object.assign({}, a.eq || {}); delete a.eq.ride; delete a.eq.hand; return a; }
const ROBO_NAMES = ['Robo-Buddy', 'Robo-Bolt', 'Robo-Spark'], ROBO_SLOT = [null, '#7CF29C', '#FF9F1C'];
// family buddies for a tag team (random, never the same one twice); fills up with 'Buddy 2…' when the family is small
function pickMates(exclude, n){ const pool = S.players.map(p => p.Name).filter(nm => exclude.indexOf(nm) < 0), out = []; while(out.length < n){ if(pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); else out.push('Buddy ' + (out.length + 2)); } return out; }
// 🤖 robot opponents: random family members (never a player or a partner), topped up with Robo-Buddies; each gets its helmet + a random style from the engine
function pickBots(exclude, n){ const pool = S.players.map(p => p.Name).filter(nm => exclude.indexOf(nm) < 0), out = []; let r = 0; while(out.length < n){ if(pool.length) out.push({name: pool.splice(Math.floor(Math.random() * pool.length), 1)[0]}); else out.push({name: ROBO_NAMES[r++ % ROBO_NAMES.length]}); } return out; }
const HELMETS = [{n: 'Cardboard box', i: '📦'}, {n: 'Bucket helmet', i: '🪣'}, {n: 'Visor helmet', i: '🥽'}, {n: 'Armour helmet', i: '🛡️'}, {n: 'Chrome battle helm', i: '⚙️'}, {n: 'Blaze helm', i: '🔥'}];
// a family member under a robot helmet: no hat or head item poking through
function helmetReady(a){ a = JSON.parse(JSON.stringify(a)); a.acc = 0; if(a.eq){ delete a.eq.head; delete a.eq.hat; } return a; }
function robotAvatar(level){ const a = defaultAvatar('Robo-Buddy ' + (level + 1)); a.hair = 0; a.hl = 0; a.outfit = 0; a.outfitColor = 9; a.oc2 = 0; a.acc = 0; a.eq = {}; return fixAv(a); }   // silver suit + antenna and visor (drawn in the game)

/* ================= MENUS ================= */
function showScreen(name){
  if(name === 'setup') name = 'menu';   /* 🧱 b3w5b: the old "Get ready" screen is part of the ONE setup page */
  if(name !== 'menu' && name !== 'player' && typeof BrawlCover !== 'undefined' && BrawlCover) BrawlCover.hide();   /* 🧱 b3w5b */
  ['player', 'menu', 'play', 'adv', 'advplay'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play' || name === 'advplay'); UI.navScreen($('back-btn'), name, NAV_INNER);   /* 🧭 p1c */ window.scrollTo(0, 0);
}
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
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
  loadPrefs(); KEYS = loadKeys(); $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); }   /* 📣 cs-2c */ renderMenu(); showScreen('menu'); openCover();   /* 🧱 b3w5b: the 🎬 cover first */
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No win yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span><span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
/* 🗂️ MODE GROUPS (mg-1) */
window.MODE_TYPE = {battle: 'A cartoon fighting game', brawenture: 'A fighting adventure'};   /* 🗂️ p3a: the "what kind of game" line on each mode card (mc-1) */
const MODE_GROUPS = [
  {k: 'battle', icon: '🥊', en: 'Battle', th: 'ต่อสู้', c: '#E0452B'},
  {k: 'adv', icon: '🗺️', en: 'Brawenture', th: 'ผจญภัย', c: '#2F7BEA'}
];   // 🗂️ mg-1 mode groups (header icon + English + Thai), fixed order
const MODE_LIST = [   // 🗂️ start page buttons by group (mg-1)
  {k: 'battle', g: 'battle', icon: '🥊', name: 'Battle', sub: 'Bonk a family robot — or 👥 2 players', next: '👇 then pick a level'},
  {k: 'brawenture', g: 'adv', icon: '🗺️', name: 'Brawenture', sub: 'Bonk through the maps, rescue your family', next: '▶ opens the maps', id: 'adv-card'}
];
function mgRender(){ UI.modeGroups($('mode-list'), MODE_GROUPS, MODE_LIST.map(m => Object.assign({}, m, {on: m.k === 'battle'})), {next: k => k === 'battle' ? $('level-list') : null,
  onPick: k => { if(k === 'brawenture'){ openAdv(); return 'stop'; } }}); }
/* 🗂️ END MODE GROUPS */
function renderMenu(){
  mgRender();   // 🗂️ mg-1
  renderLevels(); movesTable();   /* 🧱 b3w5b: 🏆 leaders live on the cover */
}
function kk(code){ return '<span class="kk">' + UI.esc(keyName(code)) + '</span>'; }
function movesTable(){
  const A = KEYS[0], B = KEYS[1], both = a => kk(A[a]) + ' / ' + kk(B[a]);
  const rows = [
    ['👊 Boop', 'quick', both('boop')], ['💥 Big Bonk', 'slow, strong', both('bonk')], ['🌀 Power Push', 'needs a full ⚡ bar', both('power')],
    ['⬆️ Jump then 👊 / 💥 / 🌀', 'jump boop · jump bonk · 🌠 diving push (⚡)', both('jump') + ' then …'],
    ['⬇️ Duck + 👊', 'low boop', both('duck') + ' + ' + both('boop')], ['⬇️ Duck + 💥', 'low bonk (trips them)', both('duck') + ' + ' + both('bonk')],
    ['⬇️ Duck + 🌀', '🚀 uppercut — they fly up, keep hitting them in the air!', both('duck') + ' + ' + both('power')],
    ['🛡️ Block', 'walk back (away from your buddy) — or hold both hit keys 👊 + 💥 to block where you stand · add duck = sitting block', 'back · ' + kk(A.boop) + '+' + kk(A.bonk) + ' / ' + kk(B.boop) + '+' + kk(B.bonk)],
    ['⚡ Counter', 'right after a block, 👊 or 💥 hits straight back · their counter can be blocked too (🛡️ just before it lands) — keep the chain going!', 'block, then ' + both('boop') + ' / ' + both('bonk')],
    ['🤼 Grab', '💥 + 🌀 together (or 👊 + 🌀)', kk(A.bonk) + '+' + kk(A.power) + ' / ' + kk(B.bonk) + '+' + kk(B.power)], ['💨 Dodge-roll', 'hold forward to roll behind them', both('dodge')]];
  $('moves-table').innerHTML = '<tr><th>Move</th><th>What it does</th><th>Keys (left / right player)</th></tr>' + rows.map(r => '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('');
}
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; const p = progressOf(S.player), rec = AGE_START[S.age];
  BB.LEVELS.forEach((L, i) => {
    const U = LEVEL_UI[i], open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (U.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none'); b.dataset.lv = i;   /* 🧱 b3w5b */
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + U.emoji + '</div><div class="nm">' + L.name + '</div><div class="learn">🤖 ' + (L.rounds > 1 ? 'best of 3' : '1 round') + '</div><div class="sub">' + (U.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : U.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Win on Hard to unlock Extreme!' : 'Win the level before to unlock it'); return; } chooseLevel(i); };   /* 🧱 b3w5b: a tap picks */
    box.appendChild(b);
  });
  { let i = -1; try{ i = Number(ls(store('lv'))); }catch(e){} if(!(i >= 0 && i < 6 && canPlay(i))) i = canPlay(rec) ? rec : Math.max(0, [0, 1, 2, 3, 4, 5].filter(canPlay).pop() || 0); chosenLevel = i; }
  fillSetup();   /* 🧱 b3w5b */
}

/* ================= SETUP ================= */
/* 🧱 b3w5b (Game Baseline): ONE setup page — 🎮 mode → 🎚️ level → 👥 who plays → 🎨 arena → ⚙️ options → ▶ Start */
let chosenLevel = 0;
function openSetup(lvl){   // the old entry point (tests, old links): picks the level + fills the page + shows it
  if(BrawlCover) BrawlCover.hide(); if(lvl != null) chosenLevel = lvl; fillSetup(); showScreen('menu');
}
function fillSetup(){
  const lvl = chosenLevel; SET.level = lvl; const L = BB.LEVELS[lvl];
  if(LEVEL_UI[lvl].hardcore) SET.mode = 'robot';
  $('setup-logo').textContent = LEVEL_UI[lvl].emoji; $('setup-title').textContent = 'Brawl · ' + L.name;
  $('setup-sub').textContent = (L.rounds > 1 ? 'Win 2 rounds' : 'Win the round') + ' — ' + L.time + ' s a round.';
  buildModes(); buildSeats(); buildThemes();
  $('go-btn').onclick = () => startMatch();
  markPicks();
}
function chooseLevel(i, quiet){
  chosenLevel = i; ls(store('lv'), String(i)); fillSetup();
  if(!quiet){ const w = $('who-head'); if(w && w.scrollIntoView) w.scrollIntoView({behavior: 'smooth', block: 'start'}); }
}
function markPicks(){
  $('level-list').querySelectorAll('.lvl').forEach(b => { const on = String(b.dataset.lv) === String(chosenLevel); b.classList.toggle('sel', on); if(window.GF && GF.pick) GF.pick(b, on); });
  const L = BB.LEVELS[chosenLevel], U = LEVEL_UI[chosenLevel], st = $('go-btn');
  if(st && L) st.textContent = '▶ Start · ' + (SET.mode === 'duo' ? '👥 2 players' : '🥊 Battle') + ' · ' + U.emoji + ' ' + L.name;
}
// 🎬 the cover (GameFrame): who's here (you + 1 more on this device = 👥 2 players; alone = vs the 🤖 family robot) + champions + how to play; ▶ Play opens the setup page
let BrawlCover = null;
const BRAWL_VERSION = '2.0';   /* 🧱 b3w5b: shown on the cover footer — bump with each Brawl Buddies round */
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(BrawlCover && BrawlCover.who !== S.player){ BrawlCover.destroy(); BrawlCover = null; }
  if(!BrawlCover){ BrawlCover = GF.cover(document.body, {game: GAME_ID, title: 'Brawl Buddies', icon: '🥊', version: BRAWL_VERSION, me: S.player, players: S.players, avatarOf: myAvatar, seats: {min: 1, max: 2},
      acts: ['beat.punch', 'beat.cheer'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms',
      onPlay: line => { BrawlCover.hide(); brawlLineup(line); renderMenu(); showScreen('menu'); } }); BrawlCover.who = S.player; }
  BrawlCover.show();
}
function brawlLineup(line){   // 👥 the cover's lineup → the seats (1 = me vs the robot, 2 = 👥 2 players with that person)
  const names = (line || []).map(x => x.name).filter(Boolean).slice(1);
  if(names.length){ SET.mode = 'duo'; SET.opp = names[0]; } else SET.mode = 'robot';
  savePrefs();
}
function buildModes(){
  const hc = !!LEVEL_UI[SET.level].hardcore, row = $('mode-row');
  const modes = [['robot', '🤖 Me vs Robot family'], ['duo', '👥 2 players (one keyboard)']];
  row.innerHTML = modes.map(([k, n]) => '<button class="chip' + (SET.mode === k ? ' on' : '') + (hc && k !== 'robot' ? ' lock' : '') + '" data-k="' + k + '" data-sound="tap">' + n + '</button>').join('');
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { if(hc && b.dataset.k !== 'robot'){ UISound.play('error'); UI.toast('💀 Hardcore is you against the robot'); return; } SET.mode = b.dataset.k; savePrefs(); row.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); buildSeats(); });
}
function others(){ return S.players.map(p => p.Name).filter(n => n !== S.player); }
function keyHint(seat){ const K = KEYS[seat]; return [K.left, K.jump, K.duck, K.right].map(keyName).join(' ') + '<br>' + [K.boop, K.bonk, K.power, K.dodge].map(keyName).join(' '); }
function seatHtml(name, label, idx, bot){
  return '<div class="seat p' + (idx + 1) + (bot ? ' bot' : '') + '"><canvas width="96" height="112" data-av="' + UI.esc(name || '') + '" data-bot="' + (bot ? 1 : 0) + '"></canvas><div class="nm">' + (bot ? '🤖 Mystery robot' : UI.esc(name)) + '<small>' + label + '</small></div>' +
    (bot ? '' : '<span class="kb">⌨️ ' + (SET.mode === 'robot' ? 'either set' : keyHint(idx)) + '</span>') + '</div>';
}
function buildSeats(){
  const box = $('seat-box'), list = others();
  if(SET.mode === 'robot'){
    box.innerHTML = '<div class="seats">' + seatHtml(S.player, 'You · left', 0) + '<div class="vs">VS</div>' + seatHtml(null, HELMETS[SET.level].i + ' ' + HELMETS[SET.level].n, 1, true) + '</div>' +
      '<div class="note helm-note" style="margin-top:8px">🤖 A random family member puts on the ' + HELMETS[SET.level].i + ' <b>' + HELMETS[SET.level].n + '</b> (Mk ' + (SET.level + 1) + '). Each robot gets a random style: ' + BB.STYLE_KEYS.map(k => BB.STYLES[k].icon + ' ' + BB.STYLES[k].name).join(' · ') + '.</div>' +
      (BB.LEVELS[SET.level].team > 1 ? '<div class="note team-note" style="margin-top:8px">🔁 Tag team ' + BB.LEVELS[SET.level].team + ' v ' + BB.LEVELS[SET.level].team + ': family buddies join your team. Swap them in with your dodge + bonk keys together (T + G) or the 🔁 Swap button.</div>' : '') +
      (LEVEL_UI[SET.level].hardcore ? '<div class="hc-note" style="margin-top:10px">💀 Hardcore: one round, you start with half your hearts, the robot blocks and juggles. ×3 score.</div>' : '');
  } else {
    if(SET.opp && list.indexOf(SET.opp) < 0 && SET.opp !== 'Guest') SET.opp = '';
    if(!SET.opp) SET.opp = list[0] || 'Guest';
    box.innerHTML = '<div class="seats">' + seatHtml(S.player, 'You · left keys', 0) + '<div class="vs">VS</div>' + seatHtml(SET.opp, 'Player 2 · right keys', 1) + '</div>' +
      '<div class="note" style="margin-top:8px">Who is player 2?</div><div class="opp-list">' + list.concat(['Guest']).map(n => '<button class="chip' + (n === SET.opp ? ' on' : '') + '" data-n="' + UI.esc(n) + '" data-sound="tap">' + (n === 'Guest' ? '🙂 Guest' : UI.esc(n)) + '</button>').join('') + '</div>' +
      '<div class="note" style="margin-top:8px">👥 Team size (family buddies join, tag with T + G / ← + ↓ or 🔁):</div><div class="chips" id="team-row">' + [1, 2, 3].map(n => '<button class="chip' + (SET.team === n ? ' on' : '') + '" data-t="' + n + '" data-sound="tap">' + (n === 1 ? '1 v 1' : n + ' v ' + n + ' 🔁') + '</button>').join('') + '</div>' +
      '<div class="note" style="margin-top:6px">Best of 3. Feats are saved for both players (no level result). On a tablet each player gets a pad in their corner.</div>';
    box.querySelectorAll('.opp-list .chip').forEach(b => b.onclick = () => { SET.opp = b.dataset.n; savePrefs(); buildSeats(); });
  }
  box.querySelectorAll('canvas[data-av]').forEach(c => { const n = c.dataset.av;
    if(c.dataset.bot === '1'){ drawPreviewCanvas(c, robotAvatar(SET.level), {name: 'Family robot', t: 1}); const x = c.getContext('2d'); antenna(x, c.width / 2, c.height - 8, c.height / 112 * 0.95, 1, {dy: 0, sx: 1, sy: 1, rot: 0}, 0, ROBO_COL[SET.level], 1, SET.level, null); emo(x, '❓', c.width - 16, 16, 22); return; }
    drawPreviewCanvas(c, myAvatar(n === 'Guest' ? 'Guest' : n), {name: n, t: 1}); });
  box.querySelectorAll('#team-row .chip').forEach(b => b.onclick = () => { SET.team = Number(b.dataset.t); savePrefs(); box.querySelectorAll('#team-row .chip').forEach(x => x.classList.toggle('on', x === b)); });
}
function buildThemes(){
  const box = $('theme-list');
  if(!box.children.length){
    THEME_KEYS.forEach(k => { const T = THEMES[k], b = document.createElement('button'); b.className = 'theme'; b.dataset.k = k; b.setAttribute('data-sound', 'tap');
      const c = document.createElement('canvas'); c.width = 240; c.height = 180; b.appendChild(c); b.insertAdjacentHTML('beforeend', '<div class="nm">' + T.icon + ' ' + T.name + '</div>');
      b.onclick = () => { SET.theme = k; savePrefs(); markThemes(); }; box.appendChild(b); });
  }
  box.querySelectorAll('.theme').forEach(b => themePreview(b.querySelector('canvas'), b.dataset.k));
  markThemes();
}
function markThemes(){ $('theme-list').querySelectorAll('.theme').forEach(b => b.classList.toggle('on', b.dataset.k === SET.theme)); }
function themePreview(c, k){
  // the same painter as the real arena
  const M = BB.newMatch({level: 0, seed: 3, players: [{name: S.player || 'Ava', human: true}, {name: 'Robo'}]});
  M.f[0].x = -1.1; M.f[1].x = 1.1;
  const fake = {M, theme: k, fx: [], cam: {cx: 0, w: 7.5}, avs: [fightAv(myAvatar(S.player || 'Ava')), robotAvatar(SET.level)], preview: true, t: 0};
  drawScene(c.getContext('2d'), c.width, c.height, fake, 1);
}

/* ================= ⌨️ KEYS (two sets, per player per device) ================= */
function keyName(code){ if(!code) return '—'; return code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'Num ').replace(/^Arrow(\w+)/, (m, d) => ({Up: '↑', Down: '↓', Left: '←', Right: '→'})[d] || d).replace('Quote', "'").replace('Semicolon', ';').replace('Backslash', '\\').replace('BracketLeft', '[').replace('BracketRight', ']').replace('Comma', ',').replace('Period', '.').replace('Slash', '/').replace('ShiftRight', 'R-Shift').replace('ShiftLeft', 'L-Shift').replace('Space', 'Space').replace('Enter', 'Enter'); }
function keysKey(){ return 'sp_brawl_keys:' + (S.player || ''); }
function loadKeys(){ let k = null; try{ k = JSON.parse(ls(keysKey()) || 'null'); }catch(e){} return DEFAULT_KEYS.map((d, i) => Object.assign({}, d, (k && k[i]) || {})); }
function saveKeys(){ ls(keysKey(), JSON.stringify(KEYS)); }
let keyWait = null;
const HELD_TEST = new Set();
function openKeys(){ HELD_TEST.clear(); renderHeld(); renderKeys(); $('keys-sheet').classList.remove('hidden'); }
function closeKeys(){ keyWait = null; $('keys-sheet').classList.add('hidden'); if(!$('scr-menu').classList.contains('hidden')) buildSeats(); movesTable(); }   /* 🧱 b3w5b */
function resetKeys(){ KEYS = DEFAULT_KEYS.map(d => Object.assign({}, d)); saveKeys(); renderKeys(); }
function renderKeys(){
  const cell = (s, a) => { const w = keyWait && keyWait.s === s && keyWait.a === a; return '<button class="keybtn' + (s ? ' p2' : '') + (w ? ' wait' : '') + '" data-s="' + s + '" data-a="' + a + '">' + (w ? '…' : UI.esc(keyName(KEYS[s][a]))) + '</button>'; };
  $('keys-table').innerHTML = '<div class="krow"><span></span><span>🟥 Left player</span><span>🟦 Right player</span></div>' + ACTIONS.map(([a, n]) => '<div class="krow"><span>' + n + '</span>' + cell(0, a) + cell(1, a) + '</div>').join('');
  $('keys-table').querySelectorAll('.keybtn').forEach(b => b.onclick = () => { keyWait = {s: Number(b.dataset.s), a: b.dataset.a}; renderKeys(); });
}
function takeKey(e){
  if(!keyWait) return false; e.preventDefault(); if(e.code === 'Escape'){ keyWait = null; renderKeys(); return true; }
  const {s, a} = keyWait, old = KEYS[s][a];
  KEYS.forEach((K, si) => Object.keys(K).forEach(k => { if(K[k] === e.code && !(si === s && k === a)) K[k] = old; }));   // swap on clash
  KEYS[s][a] = e.code; keyWait = null; saveKeys(); renderKeys(); UISound.play('key'); return true;
}
function renderHeld(){ const h = $('held'); if(!h) return; h.innerHTML = HELD_TEST.size ? Array.from(HELD_TEST).map(c => '<span>' + UI.esc(keyName(c)) + '</span>').join('') + '<span style="background:#fff">' + HELD_TEST.size + ' at once</span>' : '<span style="background:#fff;color:#6A5A80">press keys…</span>'; }

/* ================= MATCH ================= */
function startMatch(){
  if(BrawlCover) BrawlCover.hide();   /* 🧱 b3w5b */
  hideResult(); savePrefs();
  const duo = SET.mode === 'duo', p2 = duo ? (SET.opp || 'Guest') : 'Robo-Buddy';
  const players = [{name: S.player, human: true}, {name: p2, human: duo}];
  const n = duo ? SET.team : BB.LEVELS[SET.level].team, m1 = pickMates([S.player, p2], n - 1), m2 = duo ? pickMates([S.player, p2].concat(m1), n - 1) : [];
  const bots = duo ? [] : pickBots([S.player].concat(m1), n);   // 🤖 round D: robots are random family members in robot helmets
  const teams = [[players[0]].concat(m1.map(nm => ({name: nm, human: true}))), duo ? [players[1]].concat(m2.map(nm => ({name: nm, human: true}))) : bots];
  if(!duo){ players[1].name = bots[0].name; }
  const M = BB.newMatch({level: SET.level, mode: duo ? 'duo' : 'robot', seed: (Date.now() & 0xffffff) ^ 0x2b, players, teams});
  M.sq.forEach(tm => tm.forEach((f, j) => { const robo = !f.human && ROBO_NAMES.indexOf(f.name) >= 0; f.robo = robo; const raw = f.human ? myAvatar(f.name === 'Guest' ? 'Guest' : f.name) : robo ? robotAvatar(SET.level) : helmetReady(myAvatar(f.name)); f.avW = raw; f.avF = fightAv(raw);
    const worn = raw.eq && raw.eq.hand && raw.eq.hand.id === 'brawlgear' ? raw.eq.hand.v : null; f.gear = !f.human ? null : worn != null ? worn : S.gear[f.name] != null ? S.gear[f.name] : null; }));   // 🥊 Brawl gear: worn step, else best owned
  const raw = [myAvatar(S.player), duo ? myAvatar(p2 === 'Guest' ? 'Guest' : p2) : M.sq[1][0].avW];
  GameComic._reset('brawl');   // 💥 ck-room: fresh log per match
  G = {M, mode: SET.mode, level: SET.level, theme: SET.theme, held: new Set(), tbHold: {}, tbBlk: {}, fx: [], raf: 0, last: 0, acc: 0, paused: false, over: false, endT: 0, shown: false,
    avs: raw.map(fightAv), winAvs: raw, cam: {cx: 0, w: 9}, shake: 0, hitstop: 0, t: 0, startAt: performance.now(), pads: [null, null], dance: null, hpShow: [1, 1]};
  M.sq.forEach((tm, i) => tm.forEach(p => { p.seatKeys = duo ? [KEYS[i]] : (i === 0 ? [KEYS[0], KEYS[1]] : []); }));
  G.crowd = crowdFor(M); G.faceKey = ['', ''];
  cheerMount(); calloutSetup(); /* 💬 24t-e */   /* 📣 cs-2c */
  $('n0').textContent = M.f[0].name; $('n1').textContent = (duo ? '' : '🤖 ') + M.f[1].name;
  ['pips0', 'pips1'].forEach(id => { $(id).innerHTML = '<i></i>'.repeat(M.need); });
  showScreen('play'); layoutPlay(); hud();
  G.last = performance.now(); G.raf = requestAnimationFrame(frame);
}
function isTouch(){ return ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0; }
function layoutPlay(){
  const sp = $('scr-play'), arena = $('arena'), bottom = $('bottom'), W = window.innerWidth, H = window.innerHeight;
  arena.querySelectorAll('.ctl').forEach(e => e.remove()); bottom.innerHTML = '';
  const touch = isTouch(), humans = G.M.f.filter(p => p.human), two = humans.length > 1;
  const portrait = H > W * 1.05, side = touch && !portrait;
  sp.classList.toggle('side', side); sp.classList.toggle('port', touch && portrait); sp.classList.toggle('two', two); sp.classList.toggle('tight', touch && portrait && two);
  G.touch = touch;
  sp.classList.remove('ovl'); /* 🥊 24z */ G.sideL = G.sideR = 0;
  if(!touch){ bottom.innerHTML = legendHtml(); }
  else if(side){
    if(two){ arena.insertBefore(ctlEl(0, 'pad+btn'), arena.firstChild); arena.appendChild(ctlEl(1, 'pad+btn')); }
    else { const L = ctlEl(0, 'pad'), R = ctlEl(0, 'btn'); arena.insertBefore(L, arena.firstChild); arena.appendChild(R);
      if(window.UI && UI.pad){ L.classList.add('pz-l'); R.classList.add('pz-r'); pzFan(R.querySelector('.tbtns'), pzRingOrder(), on => { if(G) G.tbBlk[0] = on; }); if(H < 560) sp.classList.add('ovl'); } }   /* 🥊 24z ovl: short screens (phones on their side); tablets keep their tall stage */
  } else {
    const w = document.createElement('div'); w.className = 'ctl-wrap';
    if(two){ w.appendChild(ctlEl(0, 'pad+btn')); w.appendChild(ctlEl(1, 'btn+pad')); }
    else { const L = ctlEl(0, 'pad'), R = ctlEl(0, 'btn'); w.appendChild(L); w.appendChild(R); if(window.UI && UI.pad){ w.classList.add('pz-wrap'); pzFan(R.querySelector('.tbtns'), pzRingOrder(), on => { if(G) G.tbBlk[0] = on; }); pzFitStick(L, 4); } }
    bottom.appendChild(w);
  }
  pzArcAll($('scr-play'));
  requestAnimationFrame(resize); resize();
  bbSidePads(); /* 🥊 24z */ requestAnimationFrame(bbSidePads);
}
/* 🥊 24z: how much of the stage the floating stick / ring cover (half of each is kept clear for the fighters) + see-through until a thumb is on them */
function bbSidePads(){ if(!G) return; const sp = $('scr-play'), st = $('stage'); if(!sp.classList.contains('ovl') || !st){ G.sideL = G.sideR = 0; return; }
  const r = st.getBoundingClientRect(), L = sp.querySelector('.ctl.pz-l'), R = sp.querySelector('.ctl.pz-r'), w = e => e ? e.getBoundingClientRect() : null, a = w(L), b = w(R);
  G.sideL = a ? Math.max(0, (a.right - r.left) * 0.5) : 0; G.sideR = b ? Math.max(0, (r.right - b.left) * 0.5) : 0;
  [L, R].forEach(e => { if(!e || e.__ovl) return; e.__ovl = 1; const on = () => e.classList.add('on'), off = () => e.classList.remove('on');
    e.addEventListener('pointerdown', on); ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(k => e.addEventListener(k, () => { if(!e.querySelector('.down, .tpad.on, .pz-shield')) off(); })); document.addEventListener('pointerup', off); }); }
function pzRingOrder(){ return ['bonk', 'grab', 'power', 'dodge', 'block', G && G.M.sq[0].length > 1 ? 'tag' : null]; }   // 🌸 pz-2 (Aowu 09:33 + 15:01): 7 slots — 💨 Dodge stays in 3v3, 🛡️ Block = slot 5 (holding 👊 still blocks), 🔁 Swap (tag a buddy in) = slot 6, empty in 1v1   // 🕹️ pz-1: 🤼 Grab = its own one-tap button · 3v3 → 🔁 Tag takes 💨 Dodge's spot (dodge = → → / ← ← on the stick) · 🛡️ = hold 👊 or walk back
function legendHtml(){
  const duo = G.M.duo, A = KEYS[0], B = KEYS[1];
  const set = (K, who) => '<span><b>' + who + '</b> ' + kk(K.left) + kk(K.right) + ' move · ' + kk(K.jump) + ' jump · ' + kk(K.duck) + ' duck · ' + kk(K.boop) + '👊 ' + kk(K.bonk) + '💥 ' + kk(K.power) + '🌀 ' + kk(K.dodge) + '💨</span>';
  return '<div class="legend">' + set(A, duo ? '🟥' : '⌨️') + (duo ? set(B, '🟦') : '') + '<span>walk back or 👊+💥 = 🛡️ block · then 👊 / 💥 = ⚡ counter · → → dash · 💥+🌀 = 🤼 grab · hold 💥 = 🔨 breaker · Esc = pause</span></div>';
}
/* 🕹️ pz-1 PADS (✨ polish chat): the UiKit pad rule — sizes from --pad-*, 👉 one thumb arc, shared button look. */
const PZ_LOOK = {boop: ['👊', 'Boop', '#FF4D6D'], bonk: ['💥', 'Bonk', '#FF9F1C'], block: ['🛡️', 'Block', '#6EE7F9'], power: ['🌀', 'Power', '#FFC845'],
  dodge: ['💨', 'Dodge', '#7CC8FF'], tag: ['🔁', 'Swap', '#C08BFF'], jump: ['⤴️', 'Jump', '#7CF29C'], grab: ['🤼', 'Grab', '#7CF29C']};
function pzSize(d, two){   // stick + buttons from the shared vars (2 players on one screen: a bit smaller, never under 56 px)
  if(!(window.UI && UI.pad)) return;
  d.querySelectorAll('.tpad').forEach(p => p.style.setProperty('--d', two ? 'calc(var(--pad-stick) * 0.78)' : 'var(--pad-stick)'));
  d.querySelectorAll('.tb').forEach(b => b.style.setProperty('--b', two ? 'max(56px, calc(var(--pad-btn) * 0.84))' : 'var(--pad-btn)'));
  d.querySelectorAll('.tbtns').forEach(t => t.style.gap = two ? 'calc(var(--pad-gap) * 0.45)' : 'var(--pad-gap)');
  if(two) d.querySelectorAll('.tb.grab').forEach(b => { b.style.fontSize = '13px'; b.style.padding = '0 8px'; });   // 2 players on one phone: the 🛡️ / 🤼 pills stay narrow
}
function pzFan(box, order, blk){   // box = .tbtns → 👊 main + the ring (most used first); buttons not in the order leave the screen · blk(on) = 🛡️ while 👊 is held
  if(!box || !(window.UI && UI.pad)) return null;
  box.classList.add('pz-fan'); box.style.gap = '';
  box.querySelectorAll('.tb').forEach(b => { const L = PZ_LOOK[b.dataset.a]; if(!L) return; b.classList.remove('grab', 'half', 'blk'); b.classList.add('pz-btn'); b.style.removeProperty('--b'); b.style.setProperty('--rim', L[2]);
    b.innerHTML = '<span class="ic">' + L[0] + '</span><span class="nm">' + L[1] + '</span>'; });
  const B = a => box.querySelector('.tb[data-a="' + a + '"]'), main = B('boop'); if(!main) return null; main.classList.add('pz-main');
  main.insertAdjacentHTML('beforeend', '<span class="pz-hold" title="Hold to block">🛡️</span>');   // 🛡️ hold 👊 = block (one thumb, no two-button press)
  if(blk){ let t = 0; const off = () => { clearTimeout(t); t = 0; blk(false); main.classList.remove('pz-shield'); };
    main.addEventListener('pointerdown', e => { try{ main.setPointerCapture(e.pointerId); }catch(err){} clearTimeout(t); t = setTimeout(() => { blk(true); main.classList.add('pz-shield'); }, 260); });
    main.addEventListener('pointerup', off); main.addEventListener('pointercancel', off); }
  const slots = order.map(a => a ? B(a) : null), others = slots.filter(Boolean); box.querySelectorAll('.tb').forEach(b => { if(b !== main && others.indexOf(b) < 0) b.remove(); });
  box.__pzArc = () => (UI.pad.petals && window.UI_PETALS !== false) ? UI.pad.petals(box, main, slots, {fit: true}) : UI.pad.arc(box, main, others.slice(0, 4), {fit: true}); return box;   // 🌸 pz-2: slot places fixed (null = empty slot)
}
function pzFitStick(el, n){ n = Math.min(4, n); if(!el || !(window.UI && UI.pad)) return; const k = UI.pad.stickFor(innerWidth, UI.pad.geo(innerWidth, innerHeight, n).w); el.querySelectorAll('.tpad').forEach(p => p.style.setProperty('--d', k + 'px')); }   // the stick never touches the 👉 ring (upright phones)
function pzArcAll(root){ (root || document).querySelectorAll('.tbtns.pz-fan').forEach(b => { if(b.__pzArc) b.__pzArc(); }); }
// one round thumb pad (◀ ▶ move, ▲ jump, ▼ duck — diagonals work: down-back = sitting block) + 4 buttons
function ctlEl(pi, parts){
  const d = document.createElement('div'); d.className = 'ctl p' + (pi + 1); d.dataset.p = pi;
  const pad = '<div class="tpad" data-p="' + pi + '"><span class="ar u">▲</span><span class="ar d">▼</span><span class="ar l">◀</span><span class="ar r">▶</span><div class="knob"></div></div>';
  const btn = '<div class="tbtns">' + [['boop', '👊', 'Boop'], ['bonk', '💥', 'Bonk'], ['power', '🌀', 'Power'], ['dodge', '💨', 'Dodge']].map(([a, i, n]) => '<button class="tb' + (a === 'power' ? ' pwr' : '') + '" data-a="' + a + '" data-p="' + pi + '" aria-label="' + n + '">' + i + '<small>' + n + '</small></button>').join('')
    + '<button class="tb grab half blk" data-a="block" data-p="' + pi + '" aria-label="Block (hold)">🛡️ Block</button><button class="tb grab half" data-a="grab" data-p="' + pi + '" aria-label="Grapple">🤼 Grab</button>'
    + (G && G.M.sq[pi].length > 1 ? '<button class="tb grab tag" data-a="tag" data-p="' + pi + '" aria-label="Swap in a buddy">🔁 Swap</button>' : '') + '</div>';
  d.innerHTML = parts.split('+').map(x => x === 'pad' ? pad : btn).join('');
  d.querySelectorAll('.tpad').forEach(el => bindPad(el, pi));
  const pzTwo = !!(G && G.M.f.filter(p => p.human).length > 1); pzSize(d, pzTwo);   // 🕹️ pz-1
  d.querySelectorAll('.tb').forEach(b => {
    b.addEventListener('pointerdown', e => { e.preventDefault(); if(!G || G.paused || G.over || G.hold) return; b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 140);
      if(navigator.vibrate) try{ navigator.vibrate(8); }catch(err){}
      if(b.dataset.a === 'bonk'){ G.tbHold[pi] = true; try{ b.setPointerCapture(e.pointerId); }catch(err){} }   // 🔨 hold Bonk = charge a guard breaker
      if(b.dataset.a === 'block'){ G.tbBlk[pi] = true; try{ b.setPointerCapture(e.pointerId); }catch(err){} return; }   // 🛡️ hold = block
      BB.press(G.M, pi, b.dataset.a); });
    if(b.dataset.a === 'bonk'){ const up = () => { if(G) G.tbHold[pi] = false; }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); }
    if(b.dataset.a === 'block'){ const up = () => { if(G) G.tbBlk[pi] = false; }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); }
  });
  return d;
}
function bindPad(el, pi){
  const st = {id: null, l: false, r: false, d: false, u: false};
  G.pads[pi] = st;
  const T = UI.stickTracker(el);   // r33: follow-the-thumb stick (UiKit) — reacts after ~6 px, turns round after a tiny slide back
  const kn = el.querySelector('.knob'), ar = {l: el.querySelector('.ar.l'), r: el.querySelector('.ar.r'), d: el.querySelector('.ar.d'), u: el.querySelector('.ar.u')};
  const set = (e, first) => { const v = first ? T.start(e) : T.at(e), A = UI.stickAxes(v, st);
    const l = A.l, rr = A.r, d = A.d && v.fy > 0.22, u = A.u && v.fy < -0.3;   // duck / jump also need the thumb in the bottom / top of the pad (no accidental jumps while walking)
    if(u && !st.u && G && !G.paused) BB.press(G.M, pi, 'jump');
    st.l = l; st.r = rr; st.d = d; st.u = u;
    const m = Math.min(1, Math.hypot(v.fx, v.fy)), a = Math.atan2(v.fy, v.fx); kn.style.transform = 'translate(' + (Math.cos(a) * m * 30) + '%,' + (Math.sin(a) * m * 30) + '%)';
    ar.l.classList.toggle('lit', l); ar.r.classList.toggle('lit', rr); ar.d.classList.toggle('lit', d); ar.u.classList.toggle('lit', u); };
  const clear = () => { st.id = null; st.l = st.r = st.d = st.u = false; kn.style.transform = ''; el.querySelectorAll('.ar').forEach(a => a.classList.remove('lit')); };
  el.addEventListener('pointerdown', e => { e.preventDefault(); st.id = e.pointerId; try{ el.setPointerCapture(e.pointerId); }catch(err){} set(e, true); if(navigator.vibrate) try{ navigator.vibrate(6); }catch(err){} });
  UI.onFastMove(el, e => { if(st.id === e.pointerId) set(e); });
  el.addEventListener('pointerup', e => { if(st.id === e.pointerId) clear(); });
  el.addEventListener('pointercancel', clear);
}
let DPR = 1;
function resize(){
  if(!G) return; const cv = $('cv'), st = $('stage'); DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.max(10, Math.round(st.clientWidth * DPR)); cv.height = Math.max(10, Math.round(st.clientHeight * DPR));
}
window.addEventListener('resize', () => { if(G && !$('scr-play').classList.contains('hidden')) layoutPlay(); });
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
  watch('scr-play', [], () => !!G, () => layoutPlay());
})();   // 📱 ls-1b END

/* ---------- loop ---------- */
function frame(now){
  if(!G) return;
  const dt = Math.min(0.05, Math.max(0, (now - G.last) / 1000)); G.last = now;
  if(window.Cheer) Cheer.pause(!!(G && G.paused));   /* 📣 cs-2c */
  if(!G.paused && !G.hold){
    if(!G.M.done){
      readInputs();
      if(G.hitstop > 0) G.hitstop -= dt;
      else { if(G.slow > 0){ G.slow -= dt; G.acc += dt * 0.35; } else G.acc += dt; let n = 0; while(G.acc >= BB.DT && n < 12){ BB.step(G.M, BB.DT); G.acc -= BB.DT; n++; } }
      handleEvents(BB.takeEvents(G.M));
    } else if(!G.shown){ G.endT += dt; stepEnd(dt); if(G.endT > (FX ? 2.2 : 0.05)) finishMatch(); }
    G.t += dt; stepFx(dt); G.roundT = G.M.state === 'fight' ? (G.roundT || 0) + dt : 0;
  }
  draw(); hud();
  G.raf = requestAnimationFrame(frame);
}
function stepEnd(dt){ BB.step(G.M, 0); G.M.f.forEach(p => { if(p.y > 0){ p.vy -= BB.GRAV * dt; p.y = Math.max(0, p.y + p.vy * dt); } }); }
function togglePause(){ if(!G || G.M.done) return; G.paused = !G.paused; UI.pauseIcon($('pause-btn'), G.paused); banner(G.paused ? '⏸ Paused — tap ▶ to play' : '🥊 Go!', 'good'); if(!G.paused) G.held.clear(); }
function pauseGame(){ if(G && !G.paused && !G.M.done){ G.paused = true; UI.pauseIcon($('pause-btn'), true); } }
function leavePlay(){
  if(!G) return; const was = G.paused; G.paused = true;
  UI.confirm({icon: '◀', title: 'Leave this brawl?', body: 'This brawl won\'t be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(!G) return; G.paused = was; if(ok) backToMenu(); });
}
function backToMenu(){ if(window.Cheer) Cheer.unmount(); /* 💬 24t-e off */ if(window.UI && UI.callout) UI.callout.setup(null); if(G) cancelAnimationFrame(G.raf); G = null; hideResult(); $('bottom').innerHTML = ''; document.querySelectorAll('#arena .ctl').forEach(e => e.remove()); renderMenu(); showScreen('menu'); }

/* ---------- input ---------- */
document.addEventListener('keydown', e => {
  if(!$('keys-sheet').classList.contains('hidden')){ if(!takeKey(e)){ HELD_TEST.add(e.code); renderHeld(); e.preventDefault(); } return; }
  if(!G || $('scr-play').classList.contains('hidden')) return;
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Quote', 'Semicolon', 'Slash'].indexOf(e.code) >= 0) e.preventDefault();
  if(e.code === 'Escape'){ togglePause(); return; }
  if(e.repeat) return;
  G.held.add(e.code);
  if(G.paused || G.hold || G.M.done) return;
  G.M.f.forEach(p => { if(!p.human) return; p.seatKeys.forEach(K => { ['jump', 'boop', 'bonk', 'power', 'dodge'].forEach(a => { if(K[a] === e.code) BB.press(G.M, p.i, a); }); }); });
});
document.addEventListener('keyup', e => { if(G) G.held.delete(e.code); if(HELD_TEST.has(e.code)){ HELD_TEST.delete(e.code); renderHeld(); } });
window.addEventListener('blur', () => { if(G) G.held.clear(); HELD_TEST.clear(); });
function readInputs(){
  G.M.f.forEach(p => { if(!p.human || p.auto) return;
    let l = false, r = false, d = false, g = !!G.tbHold[p.i], bl = !!G.tbBlk[p.i];
    p.seatKeys.forEach(K => { if(G.held.has(K.left)) l = true; if(G.held.has(K.right)) r = true; if(G.held.has(K.duck)) d = true; if(G.held.has(K.bonk)) g = true; if(G.held.has(K.boop) && G.held.has(K.bonk)) bl = true; });
    const pad = G.pads[p.i]; if(pad && pad.id != null){ l = l || pad.l; r = r || pad.r; d = d || pad.d; }
    BB.setCtrl(G.M, p.i, l && !r, r && !l, d); BB.setHold(G.M, p.i, g && !bl); BB.setBlock(G.M, p.i, bl);
  });
}

/* ---------- events → sounds, words, fx ---------- */
let AC = null;
function boing(freq, len, type, vol){
  if(!FX || !UISound.get().enabled) return;
  try{ AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = type || 'triangle'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.45), t + len);
    g.gain.setValueAtTime(vol || 0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + len); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + len + 0.02); }catch(e){}
}
function handleEvents(list){
  GameComic._feed('brawl', list);   // 💥 ck-room: log + listeners
  cheerEvents(list);   /* 📣 cs-2c */
  const M = G.M, T = THEMES[G.theme];
  list.forEach(e => {
    if(e.k === 'hit'){
      const big = ['bonk', 'jbonk', 'power', 'jpower', 'upper', 'lowbonk', 'dbonk', 'fly', 'gbreak'].indexOf(e.move) >= 0;
      const rv = visOf(G, e.to); rv.react = {t: 0, kind: e.lvl === 'low' ? 'low' : (big || e.down) ? 'big' : 'high'};
      boing(big ? 180 : 420, big ? 0.22 : 0.12, big ? 'square' : 'triangle', big ? 0.16 : 0.12);
      G.fx.push({k: 'burst', x: e.x, y: e.y, t: 0, life: 0.5, word: big || e.combo >= 3 ? pickOne(T.words) : '', e1: pickOne(T.burst), big});
      if(FX){ G.hitstop = big ? 0.07 : 0.035; if(big && !reduced()) G.shake = 0.18; }
      if(big){ G.fx.push({k: 'ring', x: e.x, y: e.y, t: 0, life: 0.3}); if(e.combo >= 3 || e.move === 'gbreak' || e.move === 'fly') crowdReact('cheer', 0.9); }
      if(e.move === 'upper') G.fx.push({k: 'txt', x: e.x, y: e.y + 0.8, txt: '🚀 UP!', t: 0, life: 0.8});
      if(e.jug) G.fx.push({k: 'txt', x: e.x, y: e.y + 1.2, txt: '🔼 ' + e.jug, t: 0, life: 0.6, small: true});
    }
    else if(e.k === 'block'){ visOf(G, e.p).blockT = 0; boing(620, 0.06, 'sine', 0.08); G.fx.push({k: 'shield', x: e.x, y: e.y, t: 0, life: 0.3, low: e.low}); if(e.timed) brWord(e.p, 'good', {k: 'txt', x: e.x, y: e.y + 0.8, txt: '🛡️ PARRY!', t: 0, life: 0.9, gold: true}); }
    else if(e.k === 'counter'){ boing(980, 0.12, 'square', 0.06); brWord(e.p, e.n >= 3 ? 'big' : 'good', {k: 'txt', x: e.x, y: e.y + 0.4, txt: e.n > 1 ? '⚡ COUNTER ×' + e.n + '!' : '⚡ COUNTER!', t: 0, life: 1.1, gold: true}); }
    else if(e.k === 'combo'){ brWord(e.p, 'good', {k: 'txt', x: e.x, y: e.y, txt: e.n + ' HITS!', t: 0, life: 0.8, gold: true}); if(e.n === 5 || e.n === 8) bigWord('🔥 ' + e.n + ' combo!', e.p, 'big'); }
    else if(e.k === 'sky'){ crowdReact('cheer', 1.6); bigWord('🌟 Sky Combo!', e.p, 'big'); UISound.play('unlock'); }
    else if(e.k === 'swing'){ if(e.move === 'power' || e.move === 'jpower'){ G.fx.push({k: 'swirl', p: e.p, t: 0, life: 0.5}); UISound.play('whoosh'); } else if(e.move === 'bonk' || e.move === 'jbonk' || e.move === 'upper') boing(260, 0.08, 'sine', 0.05); }
    else if(e.k === 'nopower'){ const p = M.f[e.p]; if(p.human){ UISound.play('error'); G.fx.push({k: 'txt', x: p.x, y: p.y + 2.1, txt: '⚡ not full yet', t: 0, life: 0.7, small: true}); } }
    else if(e.k === 'powerUse'){ const p = M.f[e.p]; brWord(e.p, 'good', {k: 'txt', x: p.x, y: p.y + 2.2, txt: '🌀 POWER!', t: 0, life: 0.8, gold: true}); }
    else if(e.k === 'dodge'){ boing(900, 0.1, 'sine', 0.05); }
    else if(e.k === 'jump'){ boing(500, 0.08, 'sine', 0.04); }
    else if(e.k === 'land'){ G.fx.push({k: 'dust', x: e.x, y: 0, t: 0, life: 0.4}); boing(120, 0.15, 'triangle', 0.1); }
    else if(e.k === 'getup'){ visOf(G, e.p).getup = 0; }
    else if(e.k === 'tag'){ bigWord('🔁 Swap! ' + e.to + '!', e.p, 'good'); UISound.play('whoosh'); boing(520, 0.12, 'sine', 0.1); G.hpShow[e.p] = 1; G.flash = 0.12; crowdReact('cheer', 1.4); setNames(); }
    else if(e.k === 'tagin'){ G.fx.push({k: 'txt', x: e.x, y: 2.4, txt: '🔁 ' + e.to + ' jumps in!', t: 0, life: 1.1, gold: true}); G.hpShow[e.p] = 1; setNames(); }
    else if(e.k === 'out'){ brWord(e.p, 'good', {k: 'txt', x: e.x, y: 2.2, txt: '💫 ' + e.name + ' is out!', t: 0, life: 1.2}); boing(140, 0.3, 'triangle', 0.14); crowdReact('gasp', 1.2); if(FX) G.hitstop = 0.18; }
    else if(e.k === 'notag'){ const p = M.f[e.p]; if(p.human){ UISound.play('error'); G.fx.push({k: 'txt', x: p.x, y: p.y + 2.1, txt: '🔁 in ' + Math.ceil(e.cd || 0) + ' s', t: 0, life: 0.8, small: true}); } }
    else if(e.k === 'dash' || e.k === 'bdash'){ boing(e.k === 'dash' ? 340 : 700, 0.07, 'sine', 0.05); G.fx.push({k: 'dust', x: e.x, y: 0, t: 0, life: 0.35}); if(e.k === 'dash') G.fx.push({k: 'speed', p: e.p, t: 0, life: 0.34}); }
    else if(e.k === 'grab'){ UISound.play('whoosh'); brWord(e.p, 'good', {k: 'txt', x: e.x, y: 2.5, txt: '🤼 ' + e.name + '!', t: 0, life: 1.1, gold: true}); }
    else if(e.k === 'slam'){ crowdReact('cheer', 1.4); G.flash = 0.1; boing(90, 0.3, 'square', 0.2); boing(160, 0.18, 'triangle', 0.14); G.fx.push({k: 'shock', x: e.x, y: 0, t: 0, life: 0.6}); G.fx.push({k: 'burst', x: e.x, y: 0.5, t: 0, life: 0.55, word: e.up ? 'WHOOSH!' : 'SLAM!', e1: '💥', big: true});
      if(FX){ G.hitstop = 0.11; if(!reduced()) G.shake = 0.26; } }
    else if(e.k === 'tech'){ crowdReact('gasp', 1); boing(980, 0.12, 'sine', 0.08); brWord(e.p, 'small', {k: 'txt', x: e.x, y: 2.2, txt: '✨ Wriggled out!', t: 0, life: 1, gold: true}); G.fx.push({k: 'ring', x: e.x, y: 1.1, t: 0, life: 0.4}); }
    else if(e.k === 'charge'){ boing(220, 0.35, 'sawtooth', 0.04); }
    else if(e.k === 'gbreak'){ crowdReact('cheer', 1.2); G.flash = 0.08; bigWord('🔨 Guard break!', e.p, 'good'); boing(140, 0.25, 'square', 0.18); G.fx.push({k: 'shards', x: e.x, y: e.y, t: 0, life: 0.6}); if(FX){ G.hitstop = 0.1; if(!reduced()) G.shake = 0.22; } }
    else if(e.k === 'open'){ brWord(e.p, 'small', {k: 'txt', x: e.x, y: e.y + 0.6, txt: '😱 Wide open!', t: 0, life: 0.9, small: true}); }
    else if(e.k === 'escape'){ const p = M.f[e.p]; brWord(e.p, 'small', {k: 'txt', x: p.x, y: p.y + 2, txt: '✨ Wriggled free!', t: 0, life: 0.8, small: true}); }
    else if(e.k === 'ko'){ crowdReact('gasp', 0.6); G.slow = FX && !reduced() ? 0.9 : 0; G.flash = 0.18; bigWord(pickOne(['💫 Bonked out!', '💫 BONKED OUT!']), e.by >= 0 ? e.by : e.p, 'big', true); UISound.play('bump'); if(FX) G.hitstop = 0.25; if(!reduced()) G.shake = 0.3; }
    else if(e.k === 'round'){ banner('Round ' + e.n, 'good'); }
    else if(e.k === 'fight'){ bigWord(M.round === 1 ? '🥊 Bonk!' : '🥊 Round ' + M.round + '!', null, 'big', true); if(FX) say(M.round === 1 ? 'Ready? Bonk!' : 'Round ' + M.round); }
    else if(e.k === 'perfect'){ brWord(e.p, 'good', {k: 'txt', x: M.f[e.p].x, y: 2.6, txt: '✨ PERFECT!', t: 0, life: 1.2, gold: true}); }
    else if(e.k === 'roundEnd'){
      const w = e.winner; if(w < 0) banner('⏰ Time! A draw — again!', 'gold');
      else { const human = M.f[w].human; banner((e.timeUp ? '⏰ Time! ' : '🏆 ') + M.f[w].name + ' wins round ' + e.n + '!', human ? 'good' : 'bad'); UISound.play(human ? 'success' : 'bump'); }
    }
    else if(e.k === 'match'){ startDance(e.winner); }
  });
  if(typeof brbEvents === 'function') brbEvents(list);   /* 🎬 b3b9: hit / block / get-up / jump → contact now */
  if(typeof brmEvents === 'function') brmEvents(list);   /* 🎬 mo-brawl-a: Motion hit · clash · knock · charge */
}
function startDance(w){
  const p = G.M.f[w]; G.dance = {p: w, g: EPIC_DANCES.length ? pickOne(EPIC_DANCES) : GESTURES[0], t: 0};
  if(p.human && p.avW) p.avF = JSON.parse(JSON.stringify(p.avW));   // the ride-on comes back for the win dance
  else G.avs[w] = G.winAvs[w] && G.M.f[w].human ? JSON.parse(JSON.stringify(G.winAvs[w])) : G.avs[w];
  crowdReact('win', 3);
  if(FX && p.human) confetti(['🥊', '⭐', '💥', '🏆', '🎉'], 30);
}
function reduced(){ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
let bannerTimer = 0;
function banner(text, kind){ const b = $('banner'); b.textContent = text; b.className = 'banner on' + (kind ? ' ' + kind : ''); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 1800); }
function brWord(i, rank, fx){ if(window.UI && UI.callout && UI.callout.active()){ if(FX) UI.callout(fx.txt, {who: i, rank}); return; } G.fx.push(fx); } /* 💬 24t-e */
function bigWord(text, who, rank, stopped){ if(!FX) return; /* 💬 24t bigWord */ if(window.UI && UI.callout && UI.callout.active()){ UI.callout(text, {who, rank, stopped}); return; } const host = $('bigword-host'); host.innerHTML = ''; const d = document.createElement('div'); d.className = 'big-word'; d.textContent = text; host.appendChild(d); setTimeout(() => d.remove(), 1100); }
function stepFx(dt){ if(G.flash > 0) G.flash -= dt; if(G.crowd) G.crowd.t += dt; if(G.crowdR && G.crowdR.t < G.crowdR.d) G.crowdR.t += dt; (G.vis || []).forEach(v => { if(!v) return; if(v.react) v.react.t += dt; if(v.blockT != null) v.blockT += dt; if(v.getup != null) v.getup += dt; }); G.fx.forEach(f => f.t += dt); G.fx = G.fx.filter(f => f.t < f.life); if(G.shake > 0) G.shake -= dt; if(G.dance) G.dance.t += dt; }

/* ---------- HUD ---------- */
const HUD_LAST = {};
function setTxt(id, v){ if(HUD_LAST[id] === v) return; HUD_LAST[id] = v; $(id).textContent = v; }
// round face portrait for the HUD (head + shoulders from AvatarKit; robots get their helmet)
function drawFace(cv, f, side){
  const g = cv.getContext('2d'), W = cv.width, k = W / 34, feet = W / 2 + 63 * k; g.clearRect(0, 0, W, W);
  g.save(); g.beginPath(); g.arc(W / 2, W / 2, W / 2, 0, 7); g.clip();
  const bg = g.createRadialGradient(W / 2, W * 0.4, 2, W / 2, W / 2, W / 2); bg.addColorStop(0, '#ffffff55'); bg.addColorStop(1, '#00000055'); g.fillStyle = bg; g.fillRect(0, 0, W, W);
  drawAvatar(g, {name: f.name, av: f.avF || (G && G.avs[side]), dir: side === 0 ? 1 : -1}, W / 2, feet, k, {t: 0, still: true});
  if(!f.human) antenna(g, W / 2, feet, k, side === 0 ? 1 : -1, {dy: 0, sx: 1, sy: 1, rot: 0}, 0, styleCol(f), 0, (G && G.level) || 0, f.style);
  if(f.ko){ g.fillStyle = 'rgba(40,40,40,0.55)'; g.fillRect(0, 0, W, W); }
  g.restore();
}
function setNames(){ if(!G) return; const M = G.M; $('n0').textContent = M.f[0].name; $('n1').textContent = (M.f[1].human ? '' : '🤖 ') + M.f[1].name; }
function buildTeamRow(i){
  const M = G.M, box = $('team' + i); if(!box) return; const tm = M.sq[i];
  if(tm.length < 2){ box.innerHTML = ''; box.classList.add('hidden'); return; } box.classList.remove('hidden');
  box.innerHTML = tm.map((q, j) => '<span class="mate" data-j="' + j + '" title="' + UI.esc(q.name) + '"><canvas width="44" height="44"></canvas><i class="mb"><b></b></i></span>').join('') + '<span class="tagcd" title="Tag">🔁</span>';
  box.querySelectorAll('.mate').forEach(el => drawFace(el.querySelector('canvas'), tm[Number(el.dataset.j)], i));
}
function hud(){
  if(!G) return; const M = G.M;
  if(!G.teamBuilt){ G.teamBuilt = true; setNames(); [0, 1].forEach(buildTeamRow); }
  M.f.forEach((p, i) => {
    const fk = p.name + '|' + p.slot + '|' + (p.ko ? 1 : 0); if(G.faceKey[i] !== fk){ G.faceKey[i] = fk; const cv = $('face' + i); if(cv) drawFace(cv, p, i); }
    const box = $('team' + i);
    if(box && M.sq[i].length > 1){ const cdMax = M.duo ? 10 : M.lv.tagCd, cd = M.tagCd[i], ready = cd <= 0 && !!BB.nextMate(M, p);
      box.querySelectorAll('.mate').forEach(el => { const q = M.sq[i][Number(el.dataset.j)]; el.classList.toggle('act', q === p); el.classList.toggle('out', !!q.ko); el.querySelector('b').style.width = (Math.max(0, q.hp / q.maxHp) * 100).toFixed(0) + '%';
        if(q.ko && !el.dataset.ko){ el.dataset.ko = 1; drawFace(el.querySelector('canvas'), q, i); } });
      const tg = box.querySelector('.tagcd'); tg.style.setProperty('--cd', (cd / cdMax * 360).toFixed(0) + 'deg'); tg.classList.toggle('ready', ready);
      document.querySelectorAll('.tb.tag[data-p="' + i + '"]').forEach(b => b.classList.toggle('wait', !ready)); }
    const hp = Math.max(0, p.hp / p.maxHp); $('hp' + i).style.width = (hp * 100).toFixed(1) + '%';
    G.hpShow[i] = Math.max(hp, G.hpShow[i] - 0.01); $('hpe' + i).style.width = (G.hpShow[i] * 100).toFixed(1) + '%';
    $('pw' + i).style.width = p.power + '%'; $('pwb' + i).classList.toggle('full', p.power >= 100);
    const pips = $('pips' + i).children; for(let j = 0; j < pips.length; j++) pips[j].classList.toggle('on', j < M.wins[i]);
  });
  const ck = Math.ceil(M.clock) + '|' + M.round; if(HUD_LAST.clock !== ck){ HUD_LAST.clock = ck; $('clock').innerHTML = Math.ceil(M.clock) + '<small>R' + M.round + '</small>'; }
  document.querySelectorAll('.tb.pwr').forEach(b => { const p = M.f[Number(b.dataset.p)], duck = p && p.ctrl.d; b.classList.toggle('ready', !!p && p.power >= 100 && !duck); const ic = duck ? '🚀' : '🌀'; if(b.firstChild.nodeValue !== ic) b.firstChild.nodeValue = ic; });
}

/* ================= DRAWING ================= */
/* 📣 CHEERSQUAD (cs-2c) START — the crowd behind the ring (CheerSquad.html, 📣 Cheer chat). Replaces drawCrowd in the 🥊 ring. Don't remove: the Cheer chat re-applies it. */
// sides: 0 = left (you / player 1), 1 = right (🤖 or player 2); fighters in either team are not in the crowd
/* 💬 24t-e: words during play (UiKit UI.callout) — the floor + both fighters + the fighter HUD stay clear, crowd fans can say it */
function calloutSetup(){ if(!(window.UI && UI.callout) || !G) return;
  const sc = () => { const V = G && G.V; if(!V) return null; const c = $('cv').getBoundingClientRect(); return {V, l: c.left, t: c.top, w: c.width, h: c.height}; };
  const box = i => { const q = sc(), f = G && G.M.f[i]; if(!q || !f) return null; const V = q.V, x = q.l + V.X(f.x), feet = q.t + V.Y(Math.max(0, f.y)), head = q.t + V.Y(Math.max(0, f.y) + 1.85); return {x, feet, head, s: V.s}; };
  const meI = () => { if(!G) return -1; const F = G.M.f; const i = F.findIndex(p => p.human && p.name === S.player); return i >= 0 ? i : F.findIndex(p => p.human); };
  UI.callout.setup({
    get me(){ return meI(); },
    at: w => { const b = box(typeof w === 'number' && w >= 0 ? w : meI()); return b ? {x: b.x, y: b.head - 6} : null; },
    side: w => { const i = typeof w === 'number' && w >= 0 ? w : meI(); return i === 0 || i === 1 ? i : null; },
    crowd: () => $('cv'),
    poly: () => { const q = sc(); if(!q) return null; const y = q.t + q.V.floorY; return [[q.l, y - 4], [q.l + q.w, y - 4], [q.l + q.w, q.t + q.h], [q.l, q.t + q.h]]; },
    keep: () => { if(!G) return []; const out = [];
      [0, 1].forEach(i => { const b = box(i); if(!b) return; const w = Math.max(30, b.s * 0.8); out.push({l: b.x - w, r: b.x + w, t: b.head - 10, b: b.feet + 6}); });
      const h = $('fhud'); if(h){ const r = h.getBoundingClientRect(); if(r.width) out.push({l: r.left, t: r.top, r: r.right, b: r.bottom}); }
      return out; }
  }); }
function cheerMount(){
  if(!window.Cheer || !G) return; Cheer.unmount(); const M = G.M, duo = G.mode === 'duo' || !!(M.f[1] && M.f[1].human);
  const inRing = new Set(M.sq[0].concat(M.sq[1]).map(f => f.name));
  Cheer.mount($('stage'), {game: 'brawl', players: [{name: M.f[0].name, side: 0, human: true}, {name: M.f[1].name, side: 1, human: duo}], me: {name: S.player},
    family: (S.players || []).map(p => p.Name).filter(n => !inRing.has(n)), avatars: S.avatars || {}, mode: 'scene', ref: $('cv'),
    avoid: () => Array.from(document.querySelectorAll('#gbar, #fhud, .top-btn')), clear: () => true});   /* the stand is behind the ring: fans may stand behind the fighters */
}
// the stand behind the ring: world slots every 0.9 m that scroll with the camera like the old crowd. true = CheerSquad drew (or Off: nobody)
function cheerScene(g, W, H, V, st, t){
  if(st !== G || st.preview) return false; if(!Cheer.active()) return true;
  const feet = V.floorY - V.s * 0.62, k = V.s * 0.84 / 100 * (Cheer.stats().size === 'party' ? 1 : 0.9), cands = [];
  g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(-20, feet - 2, W + 40, V.s * 0.62 + 4);   /* the stand they are on */
  for(let i = -16; i <= 16; i++){ const wx = i * 0.9, x = W / 2 + (wx - V.cx * 0.7) * V.s * 0.72; if(x < -40 || x > W + 40) continue; cands.push({id: 's' + i, x, y: feet, k, half: wx < 0 ? 0 : 1}); }
  cands.sort((a, b) => Math.abs(a.x - W / 2) - Math.abs(b.x - W / 2));
  Cheer.place(g, cands, {key: 'main', w: W, h: H}); return true;
}
function cheerEvents(list){ if(!window.Cheer || !Cheer.active() || !G) return; const M = G.M, now = performance.now();
  list.forEach(e => { const p = e.p;
    if(e.k === 'fight') Cheer.react('start', {side: 0});
    else if(e.k === 'match'){ const w = e.winner, duo = M.f[1] && M.f[1].human; if(w == null || w < 0) Cheer.react('goal', {side: -1}); else if(duo || w === 0) Cheer.react('win', {side: w}); else Cheer.react('lose', {side: 0}); }
    else if(e.k === 'roundEnd'){ if(e.winner >= 0) Cheer.react('big', {side: e.winner}); else Cheer.react('close', {side: -1}); }
    else if(p !== 0 && p !== 1) return;   /* 🗺️ Brawenture events (h: seat) — not wired yet */
    else if(e.k === 'hit'){ const big = ['bonk', 'jbonk', 'power', 'jpower', 'upper', 'lowbonk', 'dbonk', 'fly', 'gbreak'].indexOf(e.move) >= 0;
      if((big || e.combo >= 3) && (G.cheerAt || 0) < now - 1200){ G.cheerAt = now; Cheer.react(e.combo >= 5 ? 'big' : 'goal', {side: p}); } }
    else if(e.k === 'sky' || e.k === 'slam') Cheer.react('big', {side: p});
    else if(e.k === 'gbreak' || e.k === 'tag') Cheer.react('goal', {side: p});
    else if(e.k === 'tech') Cheer.react('close', {side: p});
    else if(e.k === 'out' || e.k === 'ko') Cheer.react('miss', {side: p});
  }); }
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(!at) return; at.parentNode.insertBefore(c, at); at.parentNode.insertBefore(cap, at); }, 900); }
/* 📣 CHEERSQUAD END */
// 📣 ringside crowd: family members who are not fighting (topped up with fans) cheer, clap and gasp
const CROWD_G = {cheer: ['cheer', 'clap', 'jump', 'starjump', 'flex'], gasp: ['think', 'shrug', 'peekaboo'], win: ['dance', 'cheer', 'floss', 'disco', 'clap'], idle: ['wave', 'clap', 'hop']};
function crowdFor(M){
  const inRing = new Set(M.sq[0].concat(M.sq[1]).map(f => f.name)), names = S.players.map(p => p.Name).filter(n => !inRing.has(n)).slice(0, 6);
  ['Fan Pip', 'Fan Tok', 'Fan Zee', 'Fan Bo'].forEach(n => { if(names.length < 4) names.push(n); });
  const L = names.length;
  return {t: 0, list: names.map((n, i) => ({name: n, av: fightAv(myAvatar(n)), x: -BB.ARENA * 1.15 + i * (2.3 * BB.ARENA / Math.max(1, L - 1)), seed: i * 1.37 + 0.4}))};
}
function crowdReact(kind, d){ if(G) G.crowdR = {kind, t: 0, d}; }
function drawCrowd(g, W, V, st, t){
  const C = st.crowd; if(!C || st.preview) return; const R = st.crowdR, hype = R && R.t < R.d;
  const k = V.s * 1.62 / 86 * 0.52, feet = V.floorY - V.s * 0.62;
  g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(-20, feet - 2, W + 40, V.s * 0.62 + 4);   // the stand they are on
  C.list.forEach((m, i) => {
    const x = W / 2 + (m.x - V.cx * 0.7) * V.s * 0.72; if(x < -60 || x > W + 60) return;
    let gest = null; const cyc = (t * 0.3 + m.seed) % 4;
    if(hype){ const list = CROWD_G[R.kind] || CROWD_G.cheer, gg = gestOf(list[(i + Math.floor(m.seed * 3)) % list.length]); gest = {g: gg, t: (R.t + m.seed * 0.15) % gg.d}; }
    else if(cyc < 1){ const gg = gestOf(CROWD_G.idle[i % 3]); gest = {g: gg, t: cyc * gg.d}; }
    drawAvatar(g, {name: m.name, av: m.av, dir: x < W / 2 ? 1 : -1, gest, walkT: 0}, x, feet, k, {t: t + m.seed});
  });
}
// 🔁 resting tag partners wait in the bottom corners: reach out when a tag is ready, lie down when out
function drawBench(g, W, H, V, st, t){
  if(st.preview || !st.M.sq) return; const M = st.M;
  [0, 1].forEach(side => {
    const rest = M.sq[side].filter(q => q !== M.f[side]); if(!rest.length) return;
    const k = Math.max(0.45, Math.min(0.9, V.s * 1.62 / 86 * 0.55)), ready = M.tagCd[side] <= 0 && !!BB.nextMate(M, M.f[side]), gap = 52 * k + 8;
    rest.forEach((q, j) => {
      const px = side === 0 ? 26 * k + 10 + j * gap : W - 26 * k - 10 - j * gap, feet = H - 10, col = q.human ? COL[side] : styleCol(q, st.level);
      g.fillStyle = 'rgba(20,10,40,0.45)'; rrect(g, px - 24 * k, feet - 4, 48 * k, 9, 4); g.fill();
      g.globalAlpha = q.ko ? 0.55 : 1;
      const P = q.ko ? undefined : ready ? {armR: 2.2 + Math.sin(t * 6) * 0.25, armL: -0.4, rot: 0.08, legL: 0, legR: 0, feet: 'follow'} : {armR: 0.4, armL: -0.4, dy: Math.sin(t * 3 + j) * 0.8, legL: 0, legR: 0, feet: 'follow'}; const PB = typeof brmBench === 'function' && P && !ready ? brmBench(q, t + j * 0.37, P) : P;   /* 🫁 mo-brawl-a */
      drawAvatar(g, {name: q.name, av: q.avF || st.avs[side], dir: side === 0 ? 1 : -1, stance: q.ko ? 'lie' : ''}, px, feet, k, {t, pose: PB});
      if(!q.human && !q.ko) antenna(g, px, feet, k, side === 0 ? 1 : -1, {dy: P ? P.dy || 0 : 0, sx: 1, sy: 1, rot: P ? P.rot || 0 : 0}, 0, col, t, st.level || 0, q.style);
      g.globalAlpha = 1;
      const bw = 40 * k, r = Math.max(0, q.hp / q.maxHp); g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(px - bw / 2, feet + 2, bw, 4); g.fillStyle = q.ko ? '#888' : col; g.fillRect(px - bw / 2, feet + 2, bw * r, 4);
      if(q.ko) emo(g, '💫', px, feet - 22 * k, 16 * k); else if(ready && j === 0 && Math.floor(t * 3) % 2) emo(g, '🔁', px, feet - 98 * k, 18 * k);
    });
  });
}
function draw(){
  const cv = $('cv'); if(!cv) return; const g = cv.getContext('2d');
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawScene(g, cv.width / DPR, cv.height / DPR, G, 0);
}
// view: camera follows the two buddies (zooms in when they are close — phones see big avatars)
function view(W, H, st){
  const a = st.M.f[0], b = st.M.f[1], span = Math.abs(a.x - b.x);
  const tall = H > W * 0.9, want = Math.max(tall ? 3.8 : 7.2, Math.min(2 * BB.ARENA + 1.8, span + (tall ? 2.9 : 5.2))), mid = (a.x + b.x) / 2;
  const cam = st.cam; if(st.preview || !cam.ready){ cam.w = want; cam.cx = mid; cam.ready = !st.preview; } else { cam.w += (want - cam.w) * 0.08; cam.cx += (mid - cam.cx) * 0.1; }
  const pl = st.preview ? 0 : (st.sideL || 0), pr = st.preview ? 0 : (st.sideR || 0), IW = Math.max(W * 0.5, W - pl - pr), OX = pl + IW / 2, hd = pl || pr ? 3.7 : 4.6;   /* 🥊 24z camera */
  const s = Math.min(IW / cam.w, H / hd), halfW = IW / s / 2, lim = BB.ARENA + 0.9;
  const cx = Math.max(-lim + halfW, Math.min(lim - halfW, cam.cx));
  // rise with a high juggle so nobody flies out of the top
  const top = Math.max(st.M.f[0].y, st.M.f[1].y) + 2.3, roomUp = (H - Math.max(s * 0.55, H * 0.14)) / s, wantUp = Math.max(0, top - roomUp + 0.3);
  if(st.preview) cam.up = 0; else cam.up = (cam.up || 0) + (wantUp - (cam.up || 0)) * 0.12;
  const floorY = H - Math.max(s * 0.55, H * 0.14) + cam.up * s;
  return {s, cx: halfW * 2 > 2 * lim ? 0 : cx, floorY, W, H, X: x => OX + (x - (halfW * 2 > 2 * lim ? 0 : cx)) * s, Y: y => floorY - y * s};
}
function drawScene(g, W, H, st, still){
  const V = view(W, H, st), T = THEMES[st.theme], M = st.M, t = st.t || 0; if(st === G) G.V = V; /* 💬 24t-e */
  g.save();
  if(st.shake > 0 && !st.preview){ g.translate((Math.random() - 0.5) * 10 * st.shake / 0.3, (Math.random() - 0.5) * 8 * st.shake / 0.3); }
  if(typeof brmShake === 'function') brmShake(g, st);   /* 🎬 mo-brawl-a: Motion shake of the live hits */
  // sky + far hills + far things (parallax)
  const sky = g.createLinearGradient(0, 0, 0, V.floorY); sky.addColorStop(0, T.sky[0]); sky.addColorStop(1, T.sky[1]); g.fillStyle = sky; g.fillRect(-20, -20, W + 40, H + 40);
  if(st.theme === 'moon'){ g.fillStyle = 'rgba(255,255,255,0.8)'; for(let i = 0; i < 40; i++){ const x = ((i * 137.5) % 1) * W + ((i * 97) % W), y = (i * 53) % Math.max(1, V.floorY * 0.8); g.fillRect(x % W, y, 1.6, 1.6); } }
  const par = V.cx * V.s * 0.35;
  g.fillStyle = T.hill; g.beginPath(); g.moveTo(-20, V.floorY);
  for(let x = -20; x <= W + 20; x += 20){ g.lineTo(x, V.floorY - V.s * (0.9 + 0.35 * Math.sin((x + par) / 90) + 0.2 * Math.sin((x + par) / 37))); }
  g.lineTo(W + 20, V.floorY); g.closePath(); g.fill();
  T.far.forEach((e, i) => { const wx = -BB.ARENA - 1 + i * ((2 * BB.ARENA + 2) / (T.far.length - 1)), x = W / 2 + (wx - V.cx * 0.55) * V.s * 0.8, y = V.floorY - V.s * (0.95 + (i % 2) * 0.3); emo(g, e, x, y, V.s * (0.5 + (i % 3) * 0.12)); });
  // floor
  const fl = g.createLinearGradient(0, V.floorY, 0, H); fl.addColorStop(0, T.floor); fl.addColorStop(1, T.floor2); g.fillStyle = fl; g.fillRect(-20, V.floorY, W + 40, H - V.floorY + 20);
  g.fillStyle = T.edge; g.fillRect(-20, V.floorY - 2, W + 40, 4);
  g.globalAlpha = 0.25; g.strokeStyle = T.edge; g.lineWidth = 2;
  for(let x = -BB.ARENA; x <= BB.ARENA; x += 1){ const px = V.X(x); g.beginPath(); g.moveTo(px, V.floorY + 3); g.lineTo(W / 2 + (px - W / 2) * 1.5, H); g.stroke(); }
  g.globalAlpha = 1;
  if(!(window.Cheer && cheerScene(g, W, H, V, st, t))) drawCrowd(g, W, V, st, t);   /* 📣 cs-2c */
  // arena posts + rope at the edges
  [-1, 1].forEach(sd => { const x = V.X(sd * (BB.ARENA + 0.45)); g.fillStyle = T.post; g.fillRect(x - V.s * 0.09, V.Y(1.5), V.s * 0.18, V.s * 1.5); g.beginPath(); g.arc(x, V.Y(1.55), V.s * 0.14, 0, 7); g.fill(); });
  g.lineWidth = Math.max(2, V.s * 0.05); g.lineCap = 'round';
  [-1, 1].forEach(sd => { const x0 = V.X(sd * (BB.ARENA + 0.45)), x1 = V.X(sd * (BB.ARENA - 2.4)), gr = g.createLinearGradient(x0, 0, x1, 0);
    gr.addColorStop(0, T.rope); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.strokeStyle = gr; g.globalAlpha = 0.9;
    [0.75, 1.3].forEach(h => { g.beginPath(); g.moveTo(x0, V.Y(h)); g.quadraticCurveTo((x0 + x1) / 2, V.Y(h - 0.1), x1, V.Y(h - 0.06)); g.stroke(); }); });
  g.globalAlpha = 1; g.lineCap = 'butt';
  // fighters (the one attacking in front)
  const order = M.f.slice().sort((a, b) => (a.act ? 1 : 0) - (b.act ? 1 : 0));
  order.forEach(p => drawFighter(g, V, st, p, t));
  // fx
  if(!st.preview) st.fx.forEach(f => drawFx(g, V, st, f));
  if(typeof brmDraw === 'function') brmDraw(g, V, st, t);   /* 🎬 mo-brawl-a: clash · sparks · knock dust */
  drawBench(g, W, H, V, st, t);
  if(st.flash > 0 && !st.preview && !reduced()){ g.fillStyle = 'rgba(255,255,255,' + Math.min(0.45, st.flash * 3).toFixed(2) + ')'; g.fillRect(-20, -20, W + 40, H + 40); }
  g.restore();
}
/* 🎬 BRAWL BEATS (b3b9, 🧱 baseline chat, 2026-11-18) START — every fighter action = 3–5 beats on the shared timeline (Acting, 🎭 BLOCK `brawl`).
   ⭐ Aowu's picks: Brawl's OWN punch shapes (KF), re-timed + a settle + a trailing back arm · the game's own hit-stop (35 / 70 ms on a hit,
   110 ms on a grapple slam) freezes the ENGINE clock, so the contact pose holds with it. The engines BB / BV are not touched.
   👊 strikes: the act is mapped onto the move's own times — wind-up = start-up (st), the strike pose = contact = the engine's active start,
   held through the active frames (ac), follow-through + settle = the recovery (rc) — a pure function of the move's clock (Brawenture heroes
   pass their own HMOVES times). 💥 hits · 🛡️ blocks · 😵 get-ups play FROM contact (the event tick) on top of whatever the body is doing.
   🦘 jump: take-off = ready, tuck = anticipation, LANDING = contact (predicted from the jump, re-timed to the real landing tick). 🌀 dodge
   = the roll on its 0.34 s clock. A new strike blends out of the old one (60 ms). Clock = the engine's own (M.t). Off: window.BRB_ON = false. */
const BRB_HAS = typeof Acting !== 'undefined' && typeof Acting.play === 'function' && typeof Acting.act === 'function';
window.BRB_LOG = window.BRB_LOG || [];
const BRB_EASE = {ready: 'sineInOut', anticipation: 'cubicOut', contact: 'quartOut', follow: 'backOut', settle: 'sineInOut'};
const BRB_KEYS = ['armR', 'armL', 'legL', 'legR', 'rot', 'rotFull', 'dy', 'sx', 'sy'];
const BRB_S0 = {armR: 1.15, armL: -1.05, rot: 0, dy: 0, rotFull: 0};
const BRB_WHO = {name: 'Brawl', av: null}, BRB_RUNS = {};
function brbOk(){ return BRB_HAS && window.BRB_ON !== false && !!Acting.act('brawl.boop'); }
function brbNow(st){ if(st && st.M && typeof st.M.t === 'number') return st.M.t; if(typeof AV !== 'undefined' && AV && AV.M) return AV.M.t || 0; return G && G.M ? G.M.t : 0; }
function brbLog(p, act, at, tick){ window.BRB_LOG.push({p, act, at, tick: tick == null ? at : tick}); if(window.BRB_LOG.length > 300) window.BRB_LOG.shift(); }
function brbRun(act){ if(!brbOk() || !Acting.act(act)) return null; return BRB_RUNS[act] || (BRB_RUNS[act] = Acting.play(BRB_WHO, act, {t0: 0})); }
// the glove reach `ext` is Brawl's own field → eased here beat by beat (Acting blends numbers it knows; ext would snap)
function brbExt(run, f){
  const B = run.beats, P = i => B[Math.max(0, i)].ext || 0;   /* ext rides on the beat (not a pose field) */
  const i = f.i, a = i > 0 ? P(i - 1) : P(0), b = P(i), e = Acting.ease(B[i].ease || BRB_EASE[B[i].name] || 'quadInOut'); return a + (b - a) * e(f.q);
}
// an Acting frame → Brawl's pose (Brawl space: legL flipped back; the page flips it again for its 'follow' feet)
function brbPose(run, f, base){
  const P = Object.assign({}, base), q = f.pose;
  BRB_KEYS.forEach(k => { if(q[k] != null) P[k] = k === 'legL' ? -q[k] : q[k]; else if(k === 'rotFull') P[k] = 0; });
  P.ext = brbExt(run, f); if(f.face) P.face = f.face; return P;
}
// 👊 a strike: st / ac / rc of the move → the act's beats (contact EXACTLY at st)
function brbStrikeEl(run, m, tt){
  const ci = run.beats.findIndex(b => b.contact), c0 = run.contactMs, c1 = run.start[ci] + run.D[ci].ms, T = run.total;
  const st = Math.max(1e-3, m.st), ac = Math.max(1e-3, m.ac), rc = Math.max(1e-3, m.rc);
  if(tt <= st) return c0 * Math.max(0, tt) / st;
  if(tt <= st + ac) return c0 + (c1 - c0) * (tt - st) / ac;
  return c1 + (T - c1) * Math.min(1, (tt - st - ac) / rc);
}
function brbStrike(k, m, tt, base){
  if(!m || !(m.st < 50)) return null; const run = brbRun('brawl.' + k); if(!run) return null;
  return brbPose(run, run.at(brbStrikeEl(run, m, tt) / 1000), base);
}
// event acts (hit / block / get-up / jump) live per fighter in its vis, on the engine clock
function brbStart(vis, slot, act, now, contactAt, who, from){
  if(!brbOk() || !Acting.act(act)) return null;
  const run = Acting.play(BRB_WHO, act, {t0: now, contactAt, from, onContact: r => brbLog(who, act, r.contactT, brbNow(G && G.M ? G : null))});
  vis[slot] = {act, run}; if(contactAt <= now + 1e-9) run.at(Math.max(now, run.contactT) + 1e-6); return vis[slot];
}
function brbFrame(vis, slot, now){
  const A = vis[slot]; if(!A) return null; const f = A.run.at(Math.max(now, A.run.t0));
  if(f.done){ vis[slot] = null; return null; } return f;
}
// on top of the body: rot / arms / lift add, squash multiplies (the act is written round the stance)
function brbDelta(P, q){
  ['armR', 'armL', 'rot', 'dy', 'rotFull'].forEach(k => { P[k] = (P[k] || 0) + ((q[k] != null ? q[k] : BRB_S0[k]) - BRB_S0[k]); });
  ['sx', 'sy'].forEach(k => { P[k] = (P[k] == null ? 1 : P[k]) * (q[k] != null ? q[k] : 1); });
}
const BRB_BIG = ['bonk', 'jbonk', 'power', 'jpower', 'upper', 'lowbonk', 'dbonk', 'fly', 'gbreak'];
function brbHitAct(e){ return e.lvl === 'low' ? 'brawl.hitLow' : (BRB_BIG.indexOf(e.move) >= 0 || e.down || e.big) ? 'brawl.hitBig' : 'brawl.hit'; }
// Brawl: the engine's events (handleEvents) → contact NOW; strikes are logged at their exact active start
function brbEvents(list){
  if(!brbOk() || !G || !G.M) return; const M = G.M, now = M.t;
  list.forEach(e => {
    if(e.k === 'hit' && e.to != null){ const v = visOf(G, e.to); brbStart(v, 'brbH', brbHitAct(e), now, now, e.to); if(v.react) v.react.brb = 1; }
    else if(e.k === 'block' && e.p != null) brbStart(visOf(G, e.p), 'brbB', 'brawl.block', now, now, e.p);
    else if(e.k === 'getup' && e.p != null) brbStart(visOf(G, e.p), 'brbG', 'brawl.getup', now, now, e.p);
    else if(e.k === 'jump' && e.p != null){ const p = M.f[e.p]; if(p) brbJump(visOf(G, e.p), p, now, BB.GRAV, e.p); }
  });
  M.f.forEach((p, i) => { const v = visOf(G, i), m = p.act && BB.MOVES[p.act.k];
    if(m && m.st < 50 && p.act.t >= m.st && v.brbS !== p.act.id){ v.brbS = p.act.id; brbLog(i, 'brawl.' + p.act.k, now - (p.act.t - m.st), now); }
    brbLanded(v, p, now, i); });
}
// 🦘 jump: contact = the landing (predicted from the jump + one tick, then re-timed to the real landing tick)
function brbJump(vis, p, now, grav, who){
  const vy = p.vy || 0, y = Math.max(0, p.y || 0); if(vy <= 0.5) return;
  const tl = (vy + Math.sqrt(vy * vy + 2 * grav * y)) / grav; brbStart(vis, 'brbJ', 'brawl.jump', now, now + tl + 1 / 120, who); vis.brbJAir = true;
}
function brbLanded(vis, p, now, who){
  const A = vis.brbJ; if(!A) return;
  if(p.launched || p.ko || p.held || p.grab){ vis.brbJ = null; return; }
  if(BB.onGround(p) && vis.brbJAir){ vis.brbJAir = false; if(!A.run.fired) brbStart(vis, 'brbJ', 'brawl.jump', now, now, who, A.run.last || undefined); }
}
// drawing hooks (poseRaw) — Brawl + Brawenture (Brawenture has no event hook: its acts start on the first frame that shows them)
function brbAir(st, p, P, air, m, vis){
  vis.brbJA = vis.brbJL = false; if(!brbOk() || (st && st.preview)) return;
  const now = brbNow(st), adv = !(st && st.M && typeof st.M.t === 'number');
  if(adv){ if(air && !vis.brbWasAir && p.vy > 2 && !p.launched) brbJump(vis, p, now, 22, p.i); brbLanded(vis, p, now, p.i); }
  vis.brbWasAir = air;
  const f = brbFrame(vis, 'brbJ', now); if(!f || m || p.dash || p.launched) return;
  if(air && !f.contact){ const run = vis.brbJ.run, Q = brbPose(run, f, P); Object.assign(P, Q); delete P.ext; vis.brbJA = true; }
  else if(!air && f.contact){ brbDelta(P, f.pose); vis.brbJL = true; }
}
function brbReact(st, p, P, a, vis){
  if(!brbOk() || (st && st.preview)) return false; const now = brbNow(st), R0 = vis.react;
  if(R0 && !R0.brb){ R0.brb = 1; brbStart(vis, 'brbH', R0.kind === 'low' ? 'brawl.hitLow' : R0.kind === 'big' ? 'brawl.hitBig' : 'brawl.hit', now, now, p.i); }
  const f = brbFrame(vis, 'brbH', now); if(!f) return !!(R0 && R0.brb);
  brbDelta(P, f.pose); a.eyes = 'closed'; a.mouth = 'open'; return true;
}
function brbBlock(st, p, P, vis){ if(!brbOk() || (st && st.preview)) return false; const f = brbFrame(vis, 'brbB', brbNow(st)); if(!f) return false; brbDelta(P, f.pose); return true; }
function brbGetup(st, p, P, vis, m){ if(!brbOk() || (st && st.preview) || m) return false; const f = brbFrame(vis, 'brbG', brbNow(st)); if(!f) return false; brbDelta(P, f.pose); return true; }
// 🌀 dodge roll on its own 0.34 s clock (contact = the press)
function brbDodge(p, P){
  const run = brbRun('brawl.dodge'); if(!run || !p.dodge) return false;
  const c0 = run.contactMs, el = c0 + (run.total - c0) * Math.min(1, p.dodge.t / 0.34), Q = brbPose(run, run.at(el / 1000), P);
  Q.rotFull = (Q.rotFull || 0) * (p.dodge.dir || 1); delete Q.ext; Object.assign(P, Q); return true;
}
// a new strike blends out of the one before (60 ms of the engine clock) — never a jump in the picture
function brbBlend(st, p, P, vis){
  if(!brbOk() || (st && st.preview)) return P; const now = brbNow(st), key = p.act ? p.act.k + '@' + (p.act.id != null ? p.act.id : p.act.m ? Math.round((now - (p.act.t || 0)) * 100) : '') : '';
  if(key !== vis.brbKey){ if(key && vis.brbKey && vis.brbLast) { vis.brbFrom = vis.brbLast; vis.brbFromT = now; } else vis.brbFrom = null; vis.brbKey = key; }
  let Q = P; if(vis.brbFrom && now - vis.brbFromT < 0.06){ const u = Math.max(0, (now - vis.brbFromT) / 0.06), e = 1 - Math.pow(1 - u, 3), A = vis.brbFrom; Q = Object.assign({}, P);
    BRB_KEYS.concat(['ext']).forEach(k => { const x = A[k] != null ? A[k] : (k === 'sx' || k === 'sy' ? 1 : 0), y = P[k] != null ? P[k] : (k === 'sx' || k === 'sy' ? 1 : 0); Q[k] = x + (y - x) * e; }); }
  vis.brbLast = key ? Object.assign({}, Q) : null; return Q;
}
/* 🎬 BRAWL BEATS END */
/* 🎬 BRAWL MOTION (mo-brawl-a, ✨ polish chat, 2026-11-20) START — the shared 🎬 Motion engine in the 🥊 ring (plan `Brawl Motion — plan.md`,
   Aowu 06:59 "ok go" = the 6 picks). LOOKS ONLY: the engine BB still owns every position, move time and hit (balance identical);
   everything here starts on the engine's own tick (handleEvents) and is drawn by Motion (AvatarMotion — CALLED, never copied).
   💥 hits = Motion.hit (fist light · blunt medium / heavy · KO) → body-only flash + burst that breaks up + Motion shake + freeze 60 / 80 / 120 / KO 160 ms
   · 🛡️ block = Motion.fx('clash') · ⚡ counter = {fx: true, element: 'zap'} · 🔗 3+ hits = Motion.fx('sparks') · 🤕 a launched buddy lands =
   Motion.knock FX (dust + ring) · 🔨 hold 💥 = Motion.charge glow (the engine still decides 0.28 s ready) · 🦘 landings = Motion.land squash
   · 💨 big swings = smear (runtime copies `brawl.<move>.sm` of the 🎭 BLOCK brawl acts, smear on the contact beat) · 🤖 robot wind-up glow
   on big moves, 🌱–🔥 only ({side: 'enemy'} copy of the act, squeezed onto the engine's start-up like b3b9) · 🧣 hair / capes (Motion.hang)
   · 🫁 bench partners breathe (Motion.idle). 🌱 Basic + reduced motion = {calm: true}. No whole-screen white flash on KO / slam / guard break.
   Page state lives in the page-side `vis` objects (never the engine's fighters). BRM_ON = false → today's picture. Test: mobrawl.js. */
const BRM_W = {boop: 'light', lowboop: 'light', jboop: 'light', dboop: 'light', cboop: 'light', bonk: 'medium', lowbonk: 'medium', upper: 'medium', jbonk: 'medium', dbonk: 'medium', cbonk: 'medium', fly: 'medium', power: 'heavy', jpower: 'heavy', gbreak: 'heavy'};
const BRM_STOP = {light: 0.06, medium: 0.08, heavy: 0.12, ko: 0.16};   // 💥 hit-stop (s) — Motion rules §14 (pick 2)
const BRM_SMEAR = {bonk: 'light', lowbonk: 'light', upper: 'light', jbonk: 'light', dbonk: 'light', cbonk: 'light', power: 'heavy', jpower: 'heavy', gbreak: 'heavy'};
const BRM_GLOW = ['bonk', 'power', 'gbreak', 'upper'];   // 🤖 robot wind-up glow (pick 5)
const BRM_KNOCK_LAND = 420;   // ms into a heavy Motion.knock where the body first lands (its dust + ring start there)
let BRM_SEED = 1; window.BRM_LOG = window.BRM_LOG || [];
function brmOn(){ return !!(window.Motion && Motion.hit && Motion.fx && window.BRM_ON !== false); }
function brmRing(st){ return brmOn() && !!st && st === G && !st.preview; }   // the 🥊 ring only (🗺️ Brawenture draws with drawFighter too — its own round)
function brmCalm(st){ const lv = st && st.M ? st.M.level : 0; return lv === 0 || (typeof reduced === 'function' && reduced()); }
function brmLog(ev, p, x){ window.BRM_LOG.push(Object.assign({ev, p, t: G && G.M ? G.M.t : 0}, x || {})); if(window.BRM_LOG.length > 300) window.BRM_LOG.shift(); }
function brmWho(st, p){ return {name: p.name, av: p.avF || st.avs[p.i]}; }
function brmK(V){ return V.s * 1.62 / 86; }
const BRM_FX = [];   // world-placed effects: {kind: 'clash' | 'sparks' | 'knock', wx, wy, t0, …}
// ---------- events (end of handleEvents, after b3b9) ----------
function brmHit(st, i, o){ const vis = visOf(st, i), calm = brmCalm(st);
  const H = Motion.hit(Object.assign({seed: BRM_SEED++, calm}, o)); vis.brmH = {H, t0: st.t || 0, dir: o.dir || 1, hx: o.hx, hy: o.hy};   /* hx / hy = the engine's hit point (world m) */ brmLog('hit', i, {kind: o.kind, weight: o.weight, ko: !!o.ko, el: o.element || ''}); return H; }
function brmEvents(list){
  if(!brmOn() || !G || !G.M) return; const st = G, M = st.M, fresh = st.fx.filter(f => f.t === 0 && !f.brm);
  fresh.forEach(f => { f.brm = 1; if(f.k === 'burst') f.noStar = true; });   // 🎆 the emoji burst goes, its comic WORD stays (pick 3)
  const drop = k => { st.fx = st.fx.filter(f => !(f.t === 0 && f.k === k && fresh.includes(f))); };
  let stop = 0;
  list.forEach(e => {
    if(e.k === 'hit' && e.to != null){ const w = BRM_W[e.move] || 'medium', a = M.f[e.p];
      brmHit(st, e.to, {kind: w === 'light' ? 'fist' : 'blunt', weight: w, dir: a ? a.face : 1, hx: e.x, hy: e.y, fx: e.move === 'cboop' || e.move === 'cbonk', element: e.move === 'cboop' || e.move === 'cbonk' ? 'zap' : undefined});
      stop = Math.max(stop, BRM_STOP[w]); drop('ring');
      if(e.combo >= 3) BRM_FX.push({kind: 'sparks', wx: e.x, wy: e.y, t0: st.t || 0}); }
    else if(e.k === 'gbreak' && e.to != null){ brmHit(st, e.to, {kind: 'blunt', weight: 'heavy', dir: M.f[e.p] ? M.f[e.p].face : 1, hx: e.x, hy: e.y}); stop = Math.max(stop, BRM_STOP.heavy); st.flash = 0; }
    else if(e.k === 'slam' && e.to != null){ brmHit(st, e.to, {kind: 'blunt', weight: 'heavy', dir: M.f[e.p] ? M.f[e.p].face : 1, hx: e.x, hy: Math.max(0.6, e.y || 0)}); stop = Math.max(stop, BRM_STOP.heavy); st.flash = 0; drop('shock');
      BRM_FX.push({kind: 'knock', wx: e.x, wy: 0, t0: st.t || 0, at: BRM_KNOCK_LAND, dir: M.f[e.p] ? M.f[e.p].face : 1, K: Motion.knock({weight: 'heavy'})}); }
    else if((e.k === 'ko' || e.k === 'out') && e.p != null){ const by = M.f[e.by]; brmHit(st, e.p, {kind: 'blunt', weight: 'heavy', ko: true, dir: by ? by.face : -M.f[e.p].face, hx: e.x, hy: e.y}); stop = Math.max(stop, BRM_STOP.ko); if(e.k === 'ko') st.flash = 0; }
    else if(e.k === 'block'){ drop('shield'); BRM_FX.push({kind: 'clash', wx: e.x, wy: e.y, t0: st.t || 0}); brmLog('clash', e.p); }
    else if(e.k === 'land' && e.hard){ st.fx = st.fx.filter(f => !(fresh.includes(f) && f.k === 'dust' && Math.abs((f.x || 0) - e.x) < 1e-6));
      const p = M.f[e.p]; BRM_FX.push({kind: 'knock', wx: e.x, wy: 0, t0: st.t || 0, at: BRM_KNOCK_LAND, dir: p ? -p.face : 1, K: Motion.knock({weight: 'heavy', ko: !!(p && p.ko)})}); brmLog('knock', e.p); }
    else if(e.k === 'charge' && e.p != null){ const p = M.f[e.p], vis = visOf(st, e.p);
      vis.brmC = {C: Motion.charge(brmWho(st, p), 'brawl.gbreak', {t0: 0, calm: brmCalm(st), over: false, inPlace: true}), c0: st.t || 0}; brmLog('charge', e.p); }
  });
  if(stop && FX){ st.hitstop = stop; st.shake = 0; }   // Motion's shake replaces the old random one
  while(BRM_FX.length > 24) BRM_FX.shift();
}
// ---------- camera shake from the live hits (drawScene, right after its own shake) ----------
function brmShake(g, st){
  if(!brmOn() || st.preview || brmCalm(st)) return; let x = 0, y = 0;
  (st.vis || []).forEach(v => { if(!v || !v.brmH) return; const ms = ((st.t || 0) - v.brmH.t0) * 1000, a = v.brmH.H.at(ms); if(a.done){ v.brmH = null; return; } if(a.shake){ x += a.shake.x || 0; y += a.shake.y || 0; } });
  if(x || y) g.translate(x, y);
}
// ---------- world effects (drawScene, after its own fx) ----------
function brmDraw(g, V, st, t){
  if(!brmOn() || st.preview) return; const now = st.t || 0, k = brmK(V), calm = brmCalm(st);
  for(let i = BRM_FX.length - 1; i >= 0; i--){ const f = BRM_FX[i], x = V.X(f.wx), y = V.Y(f.wy);
    if(f.kind === 'knock'){ const kt = f.at + (now - f.t0) * 1000; if(kt > 1700){ BRM_FX.splice(i, 1); continue; } try{ Motion.drawKnockFx(g, f.K, kt, x, y, k, f.dir); }catch(e){} continue; }
    if(!f.E) f.E = Motion.fx(f.kind, {x, y, k, dir: 1, t0: f.t0, seed: BRM_SEED++, calm, flash: false});
    if(!f.E){ BRM_FX.splice(i, 1); continue; }
    f.E.move(x, y); Motion.drawFx(g, f.E, now); if(f.E.at(now).done) BRM_FX.splice(i, 1); }
}
// ---------- per fighter (drawFighter) ----------
const BRM_SM = {};
function brmSmearRun(k){   // a runtime copy of the 🎭 brawl act with smear on its contact beat (the kit's own pattern, like Motion.land)
  if(!BRM_SMEAR[k] || !Acting.act('brawl.' + k)) return null; const key = 'brawl.' + k + '.sm';
  if(!Acting.act(key)){ const a = Acting.act('brawl.' + k); Acting.add({acts: {[key]: Object.assign({}, a, {share: false, beats: a.beats.map(b => b.contact ? Object.assign({}, b, {smear: BRM_SMEAR[k]}) : b)})}}, {by: '✨ polish chat', block: 'brawl-motion-rt', game: 'brawlbuddies'}); }
  return BRM_SM[key] || (BRM_SM[key] = Acting.play(BRB_WHO, key, {t0: 0}));
}
function brmEnemyRun(k){ const key = 'brawl.' + k; if(!Acting.act(key)) return null; return BRM_SM[key + '#e'] || (BRM_SM[key + '#e'] = Acting.play(BRB_WHO, key, {t0: 0, side: 'enemy'})); }
function brmPre(g, V, st, p, P, k, sx, sy, jumpH){   // before the avatar: robot glow · charge glow (under) · landing squash
  if(!brmRing(st)) return null; const vis = visOf(st, p.i); if(vis.brmNoFx) return null; const who = brmWho(st, p), dir = p.face, out = {};
  // 🦘 landing (engine: grounded again, not launched) → Motion.land by the top height reached
  const air = p.y > 0.05; if(air){ vis.brmTop = Math.max(vis.brmTop || 0, p.y); vis.brmAir = true; }
  else if(vis.brmAir){ vis.brmAir = false; if(!p.launched && !p.down && (vis.brmTop || 0) > 0.25){ vis.brmL = {L: Motion.land(who, {height: vis.brmTop, t0: 0, calm: brmCalm(st)}), t0: st.t || 0}; brmLog('land', p.i, {h: vis.brmTop}); } vis.brmTop = 0; }
  if(vis.brmL && P){ const f = vis.brmL.L.at((st.t || 0) - vis.brmL.t0); if(f.done) vis.brmL = null; else { const q = f.pose || {}; P.sy = (P.sy || 1) * (q.sy || 1); P.sx = (P.sx || 1) * (q.sx || 1); out.land = f; } }
  // 🔨 charge
  if(vis.brmC){ if(!(p.act && p.act.k === 'charge')) vis.brmC = null;
    else { if(!vis.brmC.T){ vis.brmC.T = brmFullAt(vis.brmC.C); vis.brmC.ant = vis.brmC.C.__ant || 0; } const T = vis.brmC.T, ht = p.act.t, ready = 0.28, tt = ht <= ready ? (vis.brmC.ant + (T - vis.brmC.ant) * ht / ready) : T + (ht - ready) * 1000;
      out.charge = vis.brmC.C.at(tt / 1000); try{ Motion.drawUnder(g, sx, sy, k, dir, out.charge, who, {}); }catch(e){} } }
  // 🤖 robot wind-up glow (start-up only)
  const m = p.act ? (p.act.m || BB.MOVES[p.act.k]) : null;
  if(p.robot && !st.M.duo && st.M.level <= 3 && m && BRM_GLOW.includes(p.act.k) && p.act.t < m.st){ const run = brmEnemyRun(p.act.k);
    if(run){ const f = run.at(brbStrikeEl(run, m, p.act.t) / 1000); if(f.glow){ try{ Motion.drawUnder(g, sx, sy - jumpH * k, k, dir, f, who, {}); }catch(e){} out.glow = f.glow; vis.brmGlow = (vis.brmGlow || 0) + 1; } } }
  return out;
}
function brmFullAt(C){ let a = 0; for(let ms = 0; ms < 3000; ms += 10){ if(!a && C.level(ms / 1000) > 0) a = ms; if(C.level(ms / 1000) >= 1) { C.__ant = a; return ms; } } return 1200; }
function brmPost(g, V, st, p, k, sx, sy, jumpH, pre){   // after the avatar: smear · charge glow (front) · landing dust · body flash + hit FX
  if(!brmRing(st) || !pre) return; const vis = visOf(st, p.i), who = brmWho(st, p), dir = p.face, fy = sy - jumpH * k;
  const m = p.act ? (p.act.m || BB.MOVES[p.act.k]) : null;
  if(m && BRM_SMEAR[p.act.k] && p.act.t >= m.st * 0.6 && p.act.t <= m.st + m.ac + m.rc){ const run = brmSmearRun(p.act.k);
    if(run){ const f = run.at(brbStrikeEl(run, m, p.act.t) / 1000); if(f.smear){ try{ Motion.drawSmear(g, sx, fy, k, dir, f, who, {calm: brmCalm(st)}); }catch(e){} vis.brmSm = (vis.brmSm || 0) + 1; } } }
  if(pre.charge){ try{ Motion.drawSmear(g, sx, sy, k, dir, pre.charge, who, {}); }catch(e){} }
  if(pre.land){ try{ Motion.drawSmear(g, sx, sy, k, dir, pre.land, who, {}); }catch(e){} }
  if(vis.brmH && !vis.brmNoFx){ const ms = ((st.t || 0) - vis.brmH.t0) * 1000, a = vis.brmH.H.at(ms);
    if(a.done){ vis.brmH = null; return; }
    if(a.flash > 0){ vis.brmNoFx = true; const box = [sx - V.s * 1.1, V.Y(p.y + 2.3), V.s * 2.2, V.s * 2.5];
      try{ Motion.flash(g, gg => drawFighter(gg, V, st, p, st.t || 0), a.flash, box); }catch(e){} vis.brmNoFx = false; }
    const hx = vis.brmH.hx != null ? V.X(vis.brmH.hx) : sx, hy = vis.brmH.hy != null ? V.Y(vis.brmH.hy) : V.Y(p.y + 1.1);   /* FX at the engine's hit point (it stays there while the body flies) */
    try{ Motion.drawHitFx(g, vis.brmH.H, ms, hx, hy, k, vis.brmH.dir); }catch(e){} }
}
function brmHang(st, p, sx, sy, k, jumpH){
  if(!brmOn() || !Motion.hang) return undefined;
  if(!brmRing(st)) return !st.preview && typeof bvmHang === 'function' && typeof AV !== 'undefined' && AV && st.vis === AV.vis ? bvmHang(st, p, sx, sy, k, jumpH) : undefined;   /* 🗺️ mo-brawl-b: Brawenture heroes */
  const vis = visOf(st, p.i), av = p.avF || st.avs[p.i];
  if(!vis.brmHg || vis.brmHg.av !== av){ vis.brmHg = {av, H: Motion.hang({name: p.name, av})}; }
  if(!vis.brmNoFx) vis.brmHg.H.feed(sx, sy - jumpH * k, st.t || 0, k); return vis.brmHg.H;
}
function brmBench(q, t, P){ if(!brmRing(G) || !Motion.idle || !P || P.armR > 1) return P; const f = Motion.idle({name: q.name, av: q.avF}, t); return Object.assign({}, f.pose, {feet: 'follow'}); }
/* 🎬 BRAWL MOTION END */
/* ---------- 🎬 move animation (round A): wind-up → strike → follow-through → recover ---------- */
const eo = x => 1 - Math.pow(1 - x, 3);                       // ease out
const eob = x => { const c = 1.9; x -= 1; return 1 + (c + 1) * x * x * x + c * x * x; };   // ease out with a little overshoot (snap)
const eio = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const cl01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const POSE_KEYS = ['armR', 'armL', 'legL', 'legR', 'rot', 'rotFull', 'dy', 'sx', 'sy', 'ext'];
function lerpPose(a, b, x){ const o = {}; POSE_KEYS.forEach(k => { const va = a[k] == null ? (k === 'sx' || k === 'sy' ? 1 : 0) : a[k], vb = b[k] == null ? va : b[k]; o[k] = va + (vb - va) * x; }); return o; }
// w = wind-up pose, s = strike pose (absolute; missing keys keep the stance)
const KF = {
  boop:    {w: {armR: 0.65, rot: -0.07, legL: 0.25, legR: -0.12}, s: {armR: 1.62, ext: 1, rot: 0.1, legL: 0.38, legR: -0.32, sx: 1.04}},
  lowboop: {w: {armR: 0.85, sy: 0.74, legL: 0.9, legR: -0.9, armL: -1.2}, s: {armR: 1.58, ext: 1, sy: 0.72, rot: 0.12, legL: 0.95, legR: -0.95, armL: -1.2}},
  bonk:    {w: {armR: 3.05, armL: -1.6, rot: -0.22, legL: 0.1, legR: -0.38, sy: 1.04}, s: {armR: 0.85, armL: -1.85, rot: 0.26, ext: 0.65, legL: 0.48, legR: -0.3, sy: 0.95}},
  power:   {w: {armR: 0.45, armL: -0.45, rot: -0.16, sy: 0.92, legL: 0.15, legR: -0.3}, s: {armR: 1.7, armL: -1.7, ext: 1.1, rot: 0.2, legL: 0.45, legR: -0.4, sx: 1.06}},
  jboop:   {w: {armR: 0.8, legL: 0.75, legR: -0.2}, s: {armR: 1.65, ext: 1, legL: 0.85, legR: -0.45, rot: 0.16}},
  jbonk:   {w: {armR: 3.1, armL: -2.1, legL: 0.6, legR: -0.6, rotFull: -0.3}, s: {armR: 1.0, ext: 0.6, legL: 0.85, legR: -0.2, rotFull: 0.65}},
  jpower:  {w: {armR: 2.6, armL: -2.6, rotFull: -0.25, legL: 0.5, legR: -0.5}, s: {armR: 1.65, armL: -1.65, ext: 1.1, rotFull: 0.95, legL: -0.3, legR: -0.55}},
  lowbonk: {w: {sy: 0.74, legL: 0.95, legR: 0.45, armR: 1.35, armL: -1.2}, s: {sy: 0.7, legL: 0.95, legR: -1.6, armR: 0.8, armL: -1.5, rot: 0.16}},
  upper:   {w: {sy: 0.66, armR: 0.35, armL: -1.2, legL: 0.95, legR: -0.95, rot: 0.12}, s: {sy: 1.1, armR: 3.05, ext: 0.85, dy: -9, rot: -0.14, legL: 0.15, legR: -0.55}},
  dboop:   {w: {armR: 0.6, rot: 0.32, legL: 0.6, legR: -0.5}, s: {armR: 1.7, ext: 1.15, rot: 0.32, legL: 0.65, legR: -0.65, sx: 1.06}},
  dbonk:   {w: {armR: 3.05, armL: -1.4, rot: 0.12, legL: 0.6, legR: -0.5}, s: {armR: 0.85, ext: 0.75, rot: 0.42, legL: 0.7, legR: -0.6, sy: 0.94}},
  grab:    {w: {armR: 1.45, armL: -1.45, rot: 0.14, legL: 0.3, legR: -0.3}, s: {armR: 1.85, armL: -1.85, ext: 0.65, rot: 0.24, legL: 0.45, legR: -0.4}},
  gbreak:  {w: {armR: 3.35, armL: -2.7, rot: -0.32, sy: 1.06}, s: {armR: 0.7, armL: -1.2, ext: 0.95, rot: 0.48, sy: 0.88, legL: 0.55, legR: -0.45}},
  cboop:   {w: {armR: 0.5, rot: 0.36, legL: 0.65, legR: -0.55}, s: {armR: 1.75, ext: 1.2, rot: 0.38, legL: 0.7, legR: -0.7, sx: 1.08}},
  cbonk:   {w: {armR: 3.1, armL: -1.5, rot: 0.16, legL: 0.65, legR: -0.55}, s: {armR: 0.8, ext: 0.85, rot: 0.48, legL: 0.75, legR: -0.65, sy: 0.92}}
};
function strikePose(k, m, t, base){
  const BRB = typeof brbStrike === 'function' ? brbStrike(k, m, t, base) : null; if(BRB) return BRB;   /* 🎬 b3b9 */
  const kf = KF[k]; if(!kf) return base;
  const W = Object.assign({}, base, kf.w), S = Object.assign({}, base, kf.s);
  if(t < m.st) return lerpPose(base, W, eo(cl01(t / m.st)));
  if(t < m.st + m.ac) return lerpPose(W, S, eob(cl01((t - m.st) / Math.max(0.04, m.ac * 0.7))));
  const u = cl01((t - m.st - m.ac) / Math.max(0.05, m.rc));
  return lerpPose(S, base, eio(cl01((u - 0.3) / 0.7)));   // follow-through: hold the strike a moment, then ease home
}
// 🤼 grapples: grabber pose + where the held buddy flies (metres along the grabber's facing, R = screen turn for a grabber facing right)
const GPATH = {
  suplex: u => { const th = Math.PI * eio(u); return {dx: 0.62 * Math.cos(th), y: 1.05 * Math.sin(th), R: -th, me: {armR: 2.9, armL: -2.9, rot: -0.55 * Math.sin(th * 0.9), sy: 1.02, legL: 0.35, legR: -0.35}}; },
  skyslam: u => { if(u < 0.55){ const v = eo(u / 0.55); return {dx: 0.56, y: 1.15 * v, R: 0, me: {armR: 1.5 + 1.6 * v, ext: 0.5, armL: -1.2, rot: -0.1 * v, legL: 0.3, legR: -0.3}}; }
    const w = Math.pow((u - 0.55) / 0.45, 2); return {dx: 0.56 + 0.2 * w, y: 1.15 * (1 - w), R: w * Math.PI / 2, me: {armR: 3.1 - 2.1 * w, ext: 0.5 + 0.4 * w, armL: -1.4, rot: 0.32 * w, sy: 1 - 0.1 * w, legL: 0.5, legR: -0.4}}; },
  powerbomb: u => { if(u < 0.6){ const v = eo(u / 0.6); return {dx: 0.55 - 0.45 * v, y: 1.2 * v, R: Math.PI * v, me: {armR: 1.8 + 1.1 * v, armL: -1.8 - 1.1 * v, sy: 0.84 + 0.22 * v, legL: 0.5, legR: -0.5}}; }
    const w = Math.pow((u - 0.6) / 0.4, 2); return {dx: 0.1 + 0.65 * w, y: 1.2 * (1 - w), R: Math.PI + w * Math.PI / 2, me: {armR: 2.9 - 1.6 * w, armL: -2.9 + 1.6 * w, rot: 0.38 * w, sy: 1.06 - 0.26 * w, legL: 0.9 * w, legR: -0.9 * w}}; },
  swing: u => { const th = Math.PI * 2 * 3 * u * u, c = Math.cos(th); return {dx: 0.95 * c, y: 0.55 + 0.08 * Math.sin(th * 2), R: Math.PI / 2 * (c >= 0 ? 1 : -1), back: Math.sin(th) < 0, me: {armR: 1.65, armL: -1.65, ext: 0.8, sx: c >= 0 ? 1 : -1, rot: -0.2, legL: 0.4, legR: -0.4}}; },
  pancake: u => { if(u < 0.6){ const v = eo(u / 0.6); return {dx: 0.62 * (1 - v), y: 1.3 * v, R: Math.PI / 2 * v, me: {armR: 1.8 + 1.2 * v, armL: -1.8 - 1.2 * v, sy: 0.9 + 0.12 * v, legL: 0.3, legR: -0.3}}; }
    const w = Math.pow((u - 0.6) / 0.4, 2); return {dx: 0.15 + 0.62 * w, y: 1.3 * (1 - w), R: Math.PI / 2, me: {armR: 3.0 - 1.6 * w, armL: -3.0 + 1.6 * w, rot: 0.45 * w, legL: 0.5 * w, legR: -0.5 * w}}; },
  rocket: u => { if(u < 0.5){ const v = eo(u / 0.5); return {dx: 0.58, y: 0.25 * v, R: -0.3 * v, me: {armR: 1.4 - 0.4 * v, armL: -1.4 + 0.4 * v, sy: 1 - 0.28 * v, legL: 0.7 * v, legR: -0.7 * v}}; }
    const w = eo((u - 0.5) / 0.5); return {dx: 0.58 - 0.1 * w, y: 0.25 + 1.3 * w, R: -0.3 - 0.6 * w, me: {armR: 1.0 + 2.1 * w, armL: -1.0 - 2.1 * w, ext: w, sy: 0.72 + 0.4 * w, dy: -6 * w, legL: 0.1, legR: -0.1}}; }
};
function grabU(g){ return cl01(g.t / g.imp); }
function visOf(st, i){ if(!st.vis) st.vis = [{}, {}]; return st.vis[i] || (st.vis[i] = {}); }

// poses say legL + = back foot back, legR − = front foot forward; AvatarKit 'follow' feet (shoes at the leg ends) want the back leg's sign flipped
function poseOf(st, p, t){ const r = poseRaw(st, p, t); if(r.P){ r.P.legL = -(r.P.legL || 0); r.P.feet = 'follow'; } return r; }
function poseRaw(st, p, t){
  const M = st.M, a = {stance: '', gest: null, walkT: 0, eyes: null, mouth: null}, vis = visOf(st, p.i);
  const bob = Math.sin(t * 5.5 + p.i * 1.7);
  let P = {armR: 1.15, armL: -1.05, legL: 0.2, legR: -0.16, rot: 0, rotFull: 0, dy: bob * 0.7, sx: 1, sy: 1 + bob * 0.015, ext: 0};
  if(st.dance && st.dance.p === p.i && M.done){ a.gest = {g: st.dance.g, t: st.dance.t % st.dance.g.d}; return {P: null, a}; }
  if(M.done && M.winner !== p.i && !p.ko){ a.gest = {g: gestOf('shrug'), t: Math.min(1.2, (st.endT || 0))}; return {P: null, a}; }
  if(p.ko || (p.down > 0 && !p.launched && BB.onGround(p))){ a.stance = 'lie'; return {P, a}; }
  // 🤼 held in a grapple: flail
  if(p.held){ const w = Math.sin(t * 22); Object.assign(P, {armR: 2.5 + w * 0.4, armL: -2.3 - w * 0.4, legL: 0.5 + w * 0.3, legR: -0.5 + w * 0.3, rot: 0}); a.eyes = 'closed'; a.mouth = 'open'; return {P, a}; }
  if(p.grab){ const G0 = GPATH[p.grab.k], u = grabU(p.grab), gp = G0(Math.min(1, u)); let me = Object.assign({}, P, gp.me);
    if(p.grab.done){ const r = cl01((p.grab.t - p.grab.imp) / Math.max(0.1, p.grab.dur - p.grab.imp)); me = lerpPose(me, P, eio(cl01((r - 0.35) / 0.65))); }
    a.mouth = 'open'; return {P: me, a}; }
  if(p.launched){ P.rotFull = -(t * 9 % (Math.PI * 2)); Object.assign(P, {armR: 2.6, armL: -2.4, legL: 0.6, legR: -0.5, dy: 0}); a.eyes = 'closed'; a.mouth = 'open'; return {P, a}; }
  if(p.dodge && typeof brbDodge === 'function' && brbDodge(p, P)) return {P, a};   /* 🎬 b3b9 */
  if(p.dodge){ const u = Math.min(1, p.dodge.t / 0.34); P.rotFull = p.dodge.dir * eio(u) * Math.PI * 2; Object.assign(P, {sy: 0.8, armR: 2.2, armL: -2.2, legL: 1.1, legR: -1.1}); return {P, a}; }
  const duck = BB.ducking(p), air = !BB.onGround(p);
  if(duck) Object.assign(P, {sy: 0.74, legL: 0.95, legR: -0.95, armR: 1.35, armL: -1.2, dy: 0});
  // 💨 dash = run cycle leaning in · dash back = little hop leaning away
  if(p.dash && !p.act){
    if(p.dash.dir > 0){ const c = Math.sin(t * 34); Object.assign(P, {rot: 0.3, legL: 0.9 * c, legR: -0.9 * c, armR: 0.6 - 0.9 * c, armL: -0.6 + 0.9 * c, sy: 0.98, dy: Math.abs(c) * -2}); }
    else Object.assign(P, {rot: -0.28, legL: 0.6, legR: 0.1, armR: 0.3, armL: 0.4, sy: 1.02});
  }
  const guard = BB.guardOf(p), m = p.act ? (p.act.m || BB.MOVES[p.act.k] || null) : null;   /* 🎬 b3b9: p.act.m = a hero's own times */
  if(guard && !m){ const o = M.f[1 - p.i], near = !o || Math.abs(o.x - p.x) < 3.2; if(near){ Object.assign(P, guard === 'low' ? {armR: 1.75, armL: -1.65, rot: 0.06} : {armR: 2.55, armL: -2.35, rot: -0.1}); } }
  if(typeof brbAir === 'function') vis.brbJA = vis.brbJL = false;   /* 🎬 b3b9 */
  if(air && !m && !p.dash){ const up = p.vy > 2; Object.assign(P, {legL: up ? 0.75 : 0.45, legR: up ? -0.15 : -0.5, armR: up ? 2.2 : 1.6, armL: up ? -2.0 : -1.5, dy: 0}); }
  if(typeof brbAir === 'function') brbAir(st, p, P, air, m, vis);   /* 🎬 b3b9: 🦘 take-off → tuck → LAND = contact */
  if(m){
    const k = p.act.k, tt = p.act.t;
    if(k === 'charge'){   // 🔨 wind back and shake while charging
      const c = Math.min(1, tt / 0.28), sh = Math.sin(t * 46) * 0.035 * (0.4 + c);
      Object.assign(P, {armR: 3.05 + 0.3 * c, armL: -1.9 - 0.6 * c, rot: -0.2 - 0.12 * c + sh, sy: 0.96 - 0.04 * c, legL: 0.15, legR: -0.45, dy: 0}); a.mouth = 'open';
    } else if(k === 'fly'){   // 🚀 flying boop, then a spinning bonk
      const h2 = m.hits[1].t;
      if(tt < h2 - 0.04) P = Object.assign(P, strikePose('jboop', {st: m.hits[0].t, ac: m.hits[0].d, rc: 0.08}, tt, P), {legL: 0.9, legR: -0.6});
      else { const u = cl01((tt - h2 + 0.04) / 0.2); Object.assign(P, {rotFull: eo(u) * Math.PI * 2, armR: 3.0 - 2.0 * eo(u), ext: 0.7, armL: -1.6, legL: 0.8, legR: -0.4}); }
    } else P = strikePose(k, m, tt, P);
  }
  // 😵 guard wide open (blocked flying combo / wriggled out of) · 🔨 dizzy after a guard break
  if(p.open > 0 && !m){ Object.assign(P, {rot: -0.32 + Math.sin(t * 18) * 0.1, armR: 2.9, armL: -2.7, legL: 0.4, legR: 0.1}); a.mouth = 'open'; }
  else if(p.dizzy > 0 && !m){ Object.assign(P, {rot: Math.sin(t * 7) * 0.22, armR: 0.5, armL: 0.35, dy: 0}); a.eyes = 'closed'; a.mouth = 'open'; }
  else if((p.stun > 0 || p.bstun > 0 && !guard) && !m) { Object.assign(P, {armR: 0.6, armL: 0.4}); a.eyes = 'closed'; a.mouth = 'open'; }
  // 💥 hit reactions: head snaps back (high), bend over (low), big knock
  const R0 = vis.react;
  if(typeof brbReact === 'function' && brbReact(st, p, P, a, vis)){ /* 🎬 b3b9 */ }
  else if(R0 && R0.t < 0.4){ const amt = Math.pow(1 - R0.t / 0.4, 2), wob = Math.cos(R0.t * 26);
    if(R0.kind === 'low'){ P.rot += 0.38 * amt; P.sy *= 1 - 0.1 * amt; }
    else if(R0.kind === 'big'){ P.rot -= 0.62 * amt * (0.6 + 0.4 * wob); P.armR += 1.2 * amt; P.armL -= 1.2 * amt; }
    else { P.rot -= 0.42 * amt * (0.6 + 0.4 * wob); P.armR -= 0.5 * amt; }
    a.eyes = 'closed'; a.mouth = 'open'; }
  if(typeof brbBlock === 'function' && brbBlock(st, p, P, vis)){ /* 🎬 b3b9 */ }
  else if(vis.blockT != null && vis.blockT < 0.16){ const amt = 1 - vis.blockT / 0.16; P.rot -= 0.14 * amt; P.sx *= 1 - 0.05 * amt; }
  // squash & stretch: take-off stretch, landing squash, getting up
  if(air && p.vy > 3 && !p.launched && !vis.brbJA){ P.sy *= 1.08; P.sx *= 0.94; }
  if(p.land > 0 && !m && !vis.brbJL){ const q = p.land / 0.25; P.sy *= 1 - 0.16 * q; P.sx *= 1 + 0.12 * q; }
  if(typeof brbGetup === 'function' && brbGetup(st, p, P, vis, m)){ /* 🎬 b3b9 */ }
  else if(vis.getup != null && vis.getup < 0.35 && !m){ const q = 1 - vis.getup / 0.35; P.sy *= 1 - 0.3 * q; P.rot -= 0.5 * q; P.armR = 0.8; P.armL = -0.6; }
  if(p.cheer > 0 && !m && M.state !== 'fight'){ a.gest = {g: gestOf('cheer'), t: 2 - p.cheer}; return {P: null, a}; }
  if(p.sad > 0 && !m && M.state !== 'fight'){ a.gest = {g: gestOf('shrug'), t: 2 - p.sad}; return {P: null, a}; }
  if(Math.abs(p.vx) > 0.3 && BB.onGround(p) && !duck && !m && !p.dash){ a.walkT = p.walkT + 0.01; const w = Math.sin(p.walkT * 11); P.legL = 0.45 * w; P.legR = -0.45 * w; P.dy -= Math.abs(Math.cos(p.walkT * 11)) * 2; }
  if(a.mouth) P.mouth = a.mouth;
  if(typeof brbBlend === 'function') P = brbBlend(st, p, P, vis);   /* 🎬 b3b9: a new strike blends out of the old one */
  return {P, a};
}
// 🐢 emoji lag rule: '🚀 UP!' → 🚀 from the emo() sprite cache + 'UP!' as text (font / align / colours set by the caller)
function emoText(g, txt, x, y, px, stroke){
  const m = /^(\S+)\s+(.*)$/.exec(txt), lead = m && /[^\x00-\x7F]/.test(m[1]) && !/[A-Za-z0-9]/.test(m[1]);
  if(!lead){ if(stroke) g.strokeText(txt, x, y); g.fillText(txt, x, y); return; }
  const rest = m[2], w = g.measureText(rest).width, gap = px * 0.25, tot = px + gap + w, x0 = x - tot / 2, al = g.textAlign, fs = g.fillStyle;
  g.textAlign = 'left'; if(stroke) g.strokeText(rest, x0 + px + gap, y); g.fillText(rest, x0 + px + gap, y); g.textAlign = al;
  g.fillStyle = '#000'; emo(g, m[1], x0 + px / 2, y, px); g.fillStyle = fs;
}
function gestOf(k){ return GESTURES.find(x => x.k === k) || GESTURES[0]; }
function drawFighter(g, V, st, p, t){
  const av = p.avF || st.avs[p.i], look = (avColors(av) || {}).look || {}, kk0 = V.s * 1.62 / 86, k = kk0;
  const {P, a} = poseOf(st, p, t), dir = p.face;
  let px = p.x, py = p.y;
  if(p.held){ const gb = st.M.f[p.held.by]; if(gb && gb.grab){ const gp = GPATH[gb.grab.k](grabU(gb.grab)); px = gb.x + gb.face * gp.dx; py = gp.y; if(P) P.rotFull = -gp.R; } }
  const sx = V.X(px), sy = V.Y(0), jumpH = py * V.s / (k * (look.big || 1)), vis = visOf(st, p.i);
  // 🔨 charge aura: grows, turns red when the breaker is ready
  if(p.act && p.act.k === 'charge' && !(typeof brmRing === 'function' && brmRing(st))){ const c = Math.min(1, p.act.t / 0.28), r = V.s * (0.55 + 0.25 * c + 0.05 * Math.sin(t * 30)); g.save(); g.globalAlpha = 0.25 + 0.35 * c; const gr = g.createRadialGradient(sx, V.Y(py + 0.9), r * 0.2, sx, V.Y(py + 0.9), r); gr.addColorStop(0, c >= 1 ? 'rgba(255,90,60,0.9)' : 'rgba(255,200,69,0.8)'); gr.addColorStop(1, 'rgba(255,200,69,0)'); g.fillStyle = gr; g.beginPath(); g.arc(sx, V.Y(py + 0.9), r, 0, 7); g.fill(); g.restore(); }
  // 💨 swoosh trail behind the punching glove
  if(vis.trail && vis.trail.length > 1 && !st.preview && !(typeof brmRing === 'function' && brmRing(st))){ g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.lineCap = 'round'; const tr = vis.trail;
    for(let i = 1; i < tr.length; i++){ const q = i / tr.length; g.strokeStyle = 'rgba(255,255,255,' + (0.55 * q).toFixed(2) + ')'; g.lineWidth = Math.max(1, V.s * 0.16 * q * DPR); g.beginPath(); g.moveTo(tr[i - 1].x, tr[i - 1].y); g.lineTo(tr[i].x, tr[i].y); g.stroke(); }
    g.restore(); }
  // shadow under a buddy in the air stays on the floor
  if(p.y > 0.05){ g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(sx, sy, V.s * 0.32 * Math.max(0.4, 1 - p.y / 4), V.s * 0.09, 0, 0, 7); g.fill(); }
  const ring = p.ring || (p.human ? COL[p.i] : styleCol(p, st.level));
  g.strokeStyle = ring; g.globalAlpha = 0.7; g.lineWidth = 3; g.beginPath(); g.ellipse(sx, sy, V.s * 0.42, V.s * 0.11, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
  if(p.safe > 0 && Math.floor(t * 16) % 2) g.globalAlpha = 0.55;
  if(p.dodge) g.globalAlpha = 0.7;
  const glove = p.glove || (p.human ? COL[p.i] : '#B0BEC5');
  const A = {name: p.name, av, dir, walkT: a.walkT, gest: a.gest, jumpH, stance: a.stance};
  const skin = (avColors(av) || {}).skin; vis.skin = typeof skin === 'string' ? skin : '#F2C29B'; vis.gear = p.gear != null ? p.gear : null;
  if(P && !a.stance) gloveAt(g, sx, sy, k * (look.big || 1), dir, P, jumpH + (look.hover ? 10 : 0), 'back', glove, vis);
  const BRMP = typeof brmPre === 'function' ? brmPre(g, V, st, p, P, k, sx, sy, jumpH) : null;   /* 🎬 mo-brawl-a */
  drawAvatar(g, A, sx, sy, k, {t, pose: P ? Object.assign({}, P, a.eyes ? {eyes: a.eyes} : {}) : undefined, hang: typeof brmHang === 'function' ? brmHang(st, p, sx, sy, k, jumpH) : undefined});
  if(P && !a.stance) gloveAt(g, sx, sy, k * (look.big || 1), dir, P, jumpH + (look.hover ? 10 : 0), 'front', glove, vis);
  // trail: only while a move is in its strike part
  const mv = p.act && BB.MOVES[p.act.k], striking = mv && p.act.k !== 'charge' && p.act.t >= mv.st * 0.7 && p.act.t <= mv.st + mv.ac + 0.05;
  if(!vis.trail) vis.trail = []; if(striking && vis.glovePt) vis.trail.push(vis.glovePt); else vis.trail.length = 0; if(vis.trail.length > 6) vis.trail.shift();
  if(!p.human && !p.noHelm && P && !a.stance) antenna(g, sx, sy, k * (look.big || 1), dir, P, jumpH, ring, t, st.level || 0, p.style);
  if(p.gear != null && P && !a.stance && typeof drawBrawlBand === 'function'){ g.save(); avFrame(g, sx, sy, k * (look.big || 1), dir, P, jumpH); drawBrawlBand(g, p.gear, k * (look.big || 1), t); g.restore(); }
  g.globalAlpha = 1;
  if(typeof brmPost === 'function') brmPost(g, V, st, p, k, sx, sy, jumpH, BRMP);   /* 🎬 mo-brawl-a: smear · glow · dust · body flash + hit FX */
  if(p.hitFlash > 0 && !(typeof brmRing === 'function' && brmRing(st))){ g.fillStyle = 'rgba(255,255,255,' + (p.hitFlash * 3).toFixed(2) + ')'; g.beginPath(); g.arc(sx, V.Y(p.y + 0.9), V.s * 0.55, 0, 7); g.fill(); }
  // dizzy birds when stunned or bonked out; bounce counter while flying
  const headY = V.Y(py + (a.stance === 'lie' ? 0.45 : BB.hurtTop(p) + 0.15));
  if(p.open > 0 && !p.act) emo(g, '😱', sx, headY - V.s * 0.45, V.s * 0.34);
  if(p.dizzy > 0) emo(g, '💫', sx + Math.sin(t * 8) * V.s * 0.15, headY - V.s * 0.4, V.s * 0.3);
  if(p.ko || (p.stun > 0.2)) for(let i = 0; i < 3; i++){ const an = t * 5 + i * 2.1; emo(g, i % 2 ? '⭐' : '🐦', sx + Math.cos(an) * V.s * 0.32, headY + Math.sin(an) * V.s * 0.08, V.s * 0.22); }
  if(p.launched && p.jug > 0){ const n = '①②③④⑤'[Math.min(4, p.jug - 1)]; g.font = '900 ' + Math.round(V.s * 0.5) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = p.jug >= BB.JUGGLE_MAX ? '#FFC845' : '#fff'; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 4; g.strokeText(n, sx, headY - V.s * 0.5); g.fillText(n, sx, headY - V.s * 0.5); }
  if(st.preview || p.noTag) return;
  // name tag: small rounded pill above the head (full strength for the first seconds, softer while fighting)
  const fs = Math.round(Math.max(10, Math.min(16, V.s * 0.17)));
  g.font = '800 ' + fs + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const label = (p.human ? '' : '🤖 ') + p.name, w = g.measureText(label).width + fs * 1.1, hh = fs * 1.5, ty = V.Y(py + (a.stance === 'lie' ? 0.8 : 2.15));
  g.globalAlpha = (st.M.state === 'fight' && (st.roundT || 0) > 3) ? 0.6 : 0.95;
  g.fillStyle = 'rgba(20,10,40,0.62)'; rrect(g, sx - w / 2, ty - hh / 2, w, hh, hh / 2); g.fill();
  g.strokeStyle = ring; g.lineWidth = 2; rrect(g, sx - w / 2, ty - hh / 2, w, hh, hh / 2); g.stroke();
  g.fillStyle = '#fff'; emoText(g, label, sx, ty + 1, fs, false); g.globalAlpha = 1;
}
// the same frame drawAvatar uses (translate to the feet, flip by facing, squash, rotate) → cartoon gloves on both hands
function avFrame(g, sx, sy, k, dir, P, lift){ g.translate(sx, sy + ((P.dy || 0) - lift) * k); g.scale(dir * (P.sx || 1), P.sy || 1); if(P.rotFull){ g.translate(0, -34 * k); g.rotate(P.rotFull); g.translate(0, 34 * k); } g.rotate(P.rot || 0); }
function gloveAt(g, sx, sy, k, dir, P, lift, which, col, vis){
  g.save(); avFrame(g, sx, sy, k, dir, P, lift);
  const front = which === 'front', an = front ? P.armR : P.armL, sn = front ? Math.sin(an) : -Math.sin(an), cs = Math.cos(an);
  const L = 16 * k, ext = Math.max(0, P.ext || 0) * (front ? 1 : 0.55), L2 = L * (1 + ext * 0.6), sh = front ? 10 * k : -10 * k;
  const hx = sh + sn * L2, hy = -42 * k + cs * L2, r = 5.6 * k * (1 + ext * 0.12);
  if(ext > 0.05){ g.strokeStyle = (vis && vis.skin) || '#F2C29B'; g.lineCap = 'round'; g.lineWidth = 4.2 * k; g.beginPath(); g.moveTo(sh + sn * L * 0.9, -42 * k + cs * L * 0.9); g.lineTo(hx, hy); g.stroke(); }
  if(vis && vis.gear != null && typeof drawBrawlGlove === 'function') drawBrawlGlove(g, vis.gear, hx, hy, r, !front, (G && G.t) || 0);
  else {
    g.fillStyle = front ? col : shade(col, 0.72); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1.2 * k;
    g.beginPath(); g.arc(hx, hy, r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.arc(hx - r * 0.35, hy - r * 0.35, r * 0.35, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.fillRect(hx - r * 0.7, hy + r * 0.55, r * 1.4, r * 0.45);
  }
  if(front && vis){ try{ const m = g.getTransform(); vis.glovePt = {x: m.a * hx + m.c * hy + m.e, y: m.b * hx + m.d * hy + m.f}; }catch(e){ vis.glovePt = null; } }
  g.restore();
}
function styleCol(f, lvl){ const S = f && f.style && BB.STYLES[f.style]; return S ? S.col : ROBO_COL[lvl || (G && G.level) || 0]; }
// 🤖 robot helmet, evolving with the level (Mk1 box → Mk6 blaze helm) + style colour and badge; drawn in the avatar's own frame over the head
function antenna(g, sx, sy, k, dir, P, lift, col, t, lvl, style){
  lvl = Math.max(0, Math.min(5, lvl == null ? ((G && G.level) || 0) : lvl)); t = t || 0;
  g.save(); avFrame(g, sx, sy, k, dir, P, lift);
  const hy = -60 * k, S = style && BB.STYLES[style];
  g.lineWidth = 1.2 * k; g.strokeStyle = 'rgba(0,0,0,0.3)';
  const dome = (c1, c2, c3) => { const gr = g.createLinearGradient(-15 * k, hy - 18 * k, 15 * k, hy); gr.addColorStop(0, c1); gr.addColorStop(0.55, c2); gr.addColorStop(1, c3); g.fillStyle = gr;
    g.beginPath(); g.arc(0, hy - 1 * k, 15.5 * k, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(15.5 * k, hy - 3 * k); g.lineTo(-15.5 * k, hy - 3 * k); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(-6 * k, hy - 11 * k, 4 * k, 2 * k, -0.5, 0, 7); g.fill(); };
  const light = (x, y, r) => { g.fillStyle = col; g.globalAlpha = 0.7 + 0.3 * Math.sin(t * 8); g.beginPath(); g.arc(x, y, r * (1 + 0.12 * Math.sin(t * 8)), 0, 7); g.fill(); g.globalAlpha = 1; };
  const ant = (x, h) => { g.strokeStyle = '#78909C'; g.lineWidth = 1.8 * k; g.beginPath(); g.moveTo(x, hy - 15 * k); g.lineTo(x + 1.5 * k, hy - 15 * k - h); g.stroke(); light(x + 1.5 * k, hy - 16 * k - h, 2.8 * k); };
  if(lvl === 0){   // 📦 cardboard box: eye holes + a drawn smile
    g.fillStyle = '#C9A36B'; rrect(g, -15 * k, hy - 19 * k, 30 * k, 31 * k, 2 * k); g.fill(); g.stroke();
    g.fillStyle = '#B48A52'; g.beginPath(); g.moveTo(-15 * k, hy - 19 * k); g.lineTo(-9 * k, hy - 24 * k); g.lineTo(-2 * k, hy - 19 * k); g.closePath(); g.fill(); g.beginPath(); g.moveTo(15 * k, hy - 19 * k); g.lineTo(9 * k, hy - 25 * k); g.lineTo(3 * k, hy - 19 * k); g.closePath(); g.fill();
    g.fillStyle = '#2A1A10'; g.beginPath(); g.ellipse(-5 * k, hy, 2.6 * k, 3.2 * k, 0, 0, 7); g.ellipse(5 * k, hy, 2.6 * k, 3.2 * k, 0, 0, 7); g.fill();
    g.strokeStyle = '#2A1A10'; g.lineWidth = 1.4 * k; g.beginPath(); g.arc(0, hy + 4 * k, 5 * k, 0.2, Math.PI - 0.2); g.stroke();
    g.fillStyle = col; g.fillRect(-15 * k, hy - 14 * k, 30 * k, 3 * k);
  } else if(lvl === 1){   // 🪣 bucket helmet + little antenna
    g.fillStyle = '#8FA7B8'; g.beginPath(); g.moveTo(-12 * k, hy - 18 * k); g.lineTo(12 * k, hy - 18 * k); g.lineTo(15.5 * k, hy - 3 * k); g.lineTo(-15.5 * k, hy - 3 * k); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#5E7383'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(-13 * k, hy - 12 * k); g.lineTo(13 * k, hy - 12 * k); g.stroke();
    g.strokeStyle = '#5E7383'; g.lineWidth = 1.4 * k; g.beginPath(); g.arc(0, hy - 6 * k, 16 * k, Math.PI * 0.05, Math.PI * 0.95); g.stroke();
    g.fillStyle = col; g.fillRect(-15 * k, hy - 6.5 * k, 30 * k, 2.5 * k); ant(0, 7 * k);
  } else if(lvl === 2){   // 🥽 visor helmet, blinking light
    dome('#ECEFF1', '#B0BEC5', '#78909C');
    const vis = g.createLinearGradient(-12 * k, 0, 12 * k, 0); vis.addColorStop(0, 'rgba(110,231,249,0.65)'); vis.addColorStop(0.5, 'rgba(200,250,255,0.95)'); vis.addColorStop(1, 'rgba(110,231,249,0.65)');
    g.fillStyle = vis; rrect(g, -12 * k, hy - 7 * k, 24 * k, 4.2 * k, 2 * k); g.fill(); ant(0, 10 * k);
  } else if(lvl === 3){   // 🛡️ armour helmet: cheek guards, ear bolts, 2 antennas
    dome('#B0BEC5', '#78909C', '#455A64');
    g.fillStyle = '#607D8B'; [-1, 1].forEach(s => { g.beginPath(); g.moveTo(s * 15.5 * k, hy - 3 * k); g.lineTo(s * 15 * k, hy + 9 * k); g.lineTo(s * 10 * k, hy + 6 * k); g.lineTo(s * 11 * k, hy - 3 * k); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#90A4AE'; g.beginPath(); g.arc(s * 14.5 * k, hy - 1 * k, 3 * k, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(s * 14.5 * k, hy - 1 * k, 1.3 * k, 0, 7); g.fill(); g.fillStyle = '#607D8B'; });
    g.fillStyle = col; rrect(g, -11 * k, hy - 7 * k, 22 * k, 3.6 * k, 1.5 * k); g.fill(); ant(-6 * k, 9 * k); ant(6 * k, 9 * k);
  } else if(lvl === 4){   // ⚙️ chrome battle helm: fins + glowing visor
    dome('#FFFFFF', '#CFD8DC', '#90A4AE');
    g.fillStyle = '#B0BEC5'; g.beginPath(); g.moveTo(-3 * k, hy - 16 * k); g.lineTo(0, hy - 27 * k); g.lineTo(6 * k, hy - 15 * k); g.closePath(); g.fill(); g.stroke();
    [-1, 1].forEach(s => { g.beginPath(); g.moveTo(s * 15 * k, hy - 8 * k); g.lineTo(s * 22 * k, hy - 14 * k); g.lineTo(s * 15 * k, hy - 3 * k); g.closePath(); g.fill(); g.stroke(); });
    g.save(); g.shadowColor = col; g.shadowBlur = 0; g.fillStyle = col; g.globalAlpha = 0.85 + 0.15 * Math.sin(t * 6); rrect(g, -14 * k, hy - 4 * k, 28 * k, 5 * k, 2.5 * k); g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(-9 * k, hy - 3 * k, 6 * k, 1.2 * k);
  } else {   // 🔥 blaze helm (Hardcore): black, red crest, red eye slit, sparks
    dome('#455A64', '#263238', '#101418');
    for(let i = 0; i < 5; i++){ const x = -8 * k + i * 4 * k, h = (8 + (i % 2) * 4 + Math.sin(t * 12 + i) * 1.5) * k; g.fillStyle = i % 2 ? '#FF5A1F' : '#FF1744'; g.beginPath(); g.moveTo(x - 2 * k, hy - 15 * k); g.lineTo(x, hy - 15 * k - h); g.lineTo(x + 2 * k, hy - 15 * k); g.closePath(); g.fill(); }
    g.fillStyle = '#FF1744'; g.globalAlpha = 0.8 + 0.2 * Math.sin(t * 10); rrect(g, -12 * k, hy - 3.5 * k, 24 * k, 3 * k, 1.5 * k); g.fill(); g.globalAlpha = 1;
    for(let i = 0; i < 3; i++){ const a = t * 5 + i * 2.1, r = 17 * k + (t * 30 + i * 7) % 6 * k; g.fillStyle = '#FFC845'; g.globalAlpha = 0.7; g.fillRect(Math.cos(a) * r, hy - 6 * k + Math.sin(a) * r * 0.6, 1.6 * k, 1.6 * k); } g.globalAlpha = 1;
  }
  if(S){ g.fillStyle = S.col; g.beginPath(); g.arc(-10 * k, hy - 12 * k, 4.4 * k, 0, 7); g.fill(); g.fillStyle = '#000'; emo(g, S.icon, -10 * k, hy - 12 * k, 6 * k); }   // style badge
  g.restore();
}
function drawFx(g, V, st, f){
  const q = f.t / f.life, x = V.X(f.x || 0), y = V.Y(f.y || 0);
  if(f.k === 'burst'){
    const r = V.s * (f.big ? 0.75 : 0.5) * (0.4 + q);
    g.save(); g.globalAlpha = 1 - q; if(!f.noStar){ g.fillStyle = '#FFF59D'; g.beginPath();   /* 🎬 mo-brawl-a: noStar = Motion draws the burst, only the word stays */
    for(let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2, rr = i % 2 ? r * 0.5 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fill(); g.strokeStyle = '#FF7043'; g.lineWidth = 3; g.stroke();
    for(let i = 0; i < 3; i++){ const a = i * 2.1 + f.x * 3; emo(g, f.e1, x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 0.8 - q * V.s * 0.3, V.s * 0.26); } }
    if(f.word){ g.font = '900 ' + Math.round(V.s * (f.big ? 0.48 : 0.36) * (1 + 0.3 * (1 - q))) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 5; g.strokeStyle = '#2A1A40'; g.strokeText(f.word, x, y - r * 0.9); g.fillStyle = '#FFC845'; g.fillText(f.word, x, y - r * 0.9); }
    g.restore();
  } else if(f.k === 'txt'){
    g.save(); g.globalAlpha = 1 - q * q; g.font = '900 ' + Math.round(V.s * (f.small ? 0.24 : 0.36)) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.55)';
    const yy = y - q * V.s * 0.6; g.fillStyle = f.gold ? '#FFC845' : '#fff'; emoText(g, f.txt, x, yy, Math.round(V.s * (f.small ? 0.24 : 0.36)), true); g.restore();
  } else if(f.k === 'shield'){
    g.save(); g.globalAlpha = 1 - q; g.strokeStyle = '#6EE7F9'; g.lineWidth = 4; g.beginPath(); g.arc(x, f.low ? V.Y(0.5) : y, V.s * (0.5 + q * 0.2), -1.2, 1.2); g.stroke(); emo(g, '🛡️', x, f.low ? V.Y(0.5) : y, V.s * 0.3); g.restore();
  } else if(f.k === 'swirl'){
    const p = st.M.f[f.p]; g.save(); g.globalAlpha = 1 - q; g.strokeStyle = '#FFC845'; g.lineWidth = 4;
    for(let i = 0; i < 3; i++){ g.beginPath(); g.arc(V.X(p.x + p.face * 0.7), V.Y(p.y + 1.0), V.s * (0.25 + i * 0.18 + q * 0.3), f.t * 12 + i, f.t * 12 + i + 3.6); g.stroke(); }
    emo(g, '🌀', V.X(p.x + p.face * 0.9), V.Y(p.y + 1.0), V.s * 0.5); g.restore();
  } else if(f.k === 'shock'){   // slam: ground shockwave + cartoon crack
    g.save(); g.globalAlpha = 1 - q; g.strokeStyle = '#FFF59D'; g.lineWidth = 5 * (1 - q) + 1; g.beginPath(); g.ellipse(x, y, V.s * (0.4 + 1.6 * q), V.s * (0.1 + 0.3 * q), 0, 0, 7); g.stroke();
    g.strokeStyle = 'rgba(40,20,10,0.75)'; g.lineWidth = 3; g.beginPath(); for(const s of [-1, 1]){ g.moveTo(x, y); g.lineTo(x + s * V.s * 0.3, y + V.s * 0.04); g.lineTo(x + s * V.s * 0.5, y - V.s * 0.03); g.lineTo(x + s * V.s * 0.75, y + V.s * 0.05); } g.stroke();
    for(let i = 0; i < 6; i++){ const a = Math.PI + i / 5 * Math.PI; g.fillStyle = '#C8B08A'; g.beginPath(); g.arc(x + Math.cos(a) * V.s * (0.3 + q), y + Math.sin(a) * V.s * (0.5 * q) - V.s * 0.6 * q * (1 - q), V.s * 0.06, 0, 7); g.fill(); }
    g.restore();
  } else if(f.k === 'shards'){   // guard break: the shield cracks into pieces
    g.save(); g.globalAlpha = 1 - q; g.fillStyle = '#6EE7F9'; g.strokeStyle = '#fff'; g.lineWidth = 1.5;
    for(let i = 0; i < 9; i++){ const a = i / 9 * Math.PI * 2 + 0.3, d = V.s * (0.2 + 0.9 * q), cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d + V.s * 0.8 * q * q; g.beginPath(); g.moveTo(cx, cy - V.s * 0.08); g.lineTo(cx + V.s * 0.07, cy + V.s * 0.06); g.lineTo(cx - V.s * 0.06, cy + V.s * 0.05); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  } else if(f.k === 'ring'){
    g.save(); g.globalAlpha = 1 - q; g.strokeStyle = '#FFC845'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, V.s * (0.3 + 0.7 * q), 0, 7); g.stroke(); g.restore();
  } else if(f.k === 'speed'){   // 💨 speed lines behind a dashing buddy
    const p = st.M.f[f.p]; if(!p) return; const px = V.X(p.x), b = -p.face; g.save(); g.globalAlpha = 0.6 * (1 - q); g.strokeStyle = '#fff'; g.lineWidth = 3; g.lineCap = 'round';
    for(let i = 0; i < 4; i++){ const yy = V.Y(p.y + 0.4 + i * 0.32); g.beginPath(); g.moveTo(px + b * V.s * 0.4, yy); g.lineTo(px + b * V.s * (0.9 + i % 2 * 0.3), yy); g.stroke(); }
    g.restore();
  } else if(f.k === 'dust'){
    g.save(); g.globalAlpha = 0.6 * (1 - q); g.fillStyle = '#FFFFFF'; for(let i = -2; i <= 2; i++){ g.beginPath(); g.arc(x + i * V.s * 0.22 * (1 + q), y - V.s * 0.08, V.s * 0.12 * (1 + q), 0, 7); g.fill(); } g.restore();
  }
}

/* ================= RESULT + SAVE ================= */
function finishMatch(){
  if(window.UI && UI.callout) UI.callout.setup(null); /* 💬 24t-e match end */
  const M = G.M; G.shown = true; G.over = true; const win = M.winner, secs = Math.max(1, Math.round((performance.now() - G.startAt) / 1000));
  const humans = M.f.filter(p => p.human), vsRobot = G.mode === 'robot', myWin = vsRobot ? win === 0 : true;
  const st = M.stats, stars = BB.starsFor(M, 0);
  UISound.play(vsRobot ? (myWin ? 'success' : 'error') : 'success');
  /* 🧱 b3w5b: the shared 🏁 card */
  const icon = vsRobot ? (myWin ? '🏆' : '🤖') : '👑', title = vsRobot ? (myWin ? 'You bonked the robot!' : M.f[1].name + ' wins this time') : M.f[win].name + ' wins!';
  const sub = vsRobot && !myWin ? '💡 ' + pickOne(['Walk back to block — duck + back blocks low bonks.', 'Duck + 🌀 = uppercut. Then jump and boop them in the air!', 'Big Bonk is slow — boop first, then bonk.', 'Use 💨 dodge when the robot starts a Power Push.', 'Jump attacks beat a sitting block.']) + ' · ' + (BB.STYLES[M.f[1].style] ? BB.STYLES[M.f[1].style].icon + ' ' + BB.STYLES[M.f[1].style].name + ' robot · ' : '') + HELMETS[G.level].i + ' ' + HELMETS[G.level].n : '';
  const me = st[0], score = BB.scoreFor(M, 0), lvl = G.level, nextOk = vsRobot && myWin && lvl < 5;
  GF.result({wrap: $('result'), card: $('result-card'), win: vsRobot ? myWin : true, icon, title, sub, stars: vsRobot && myWin ? stars : null, score,
    stats: [['🥊', M.wins[0] + ' – ' + M.wins[1] + ' rounds'], ['👊', me.hits + ' bonks'], ['🔥', 'best combo ' + me.bestCombo], ['🌟', me.juggle + ' bounces'], ['🚀', me.uppers + ' uppercuts'], ['🛡️', me.blocks + ' blocks'], ['⏱', fmtS(secs)]],
    save: humans.some(p => p.name !== 'Guest') ? 'Saving…' : null, buddy: {name: S.player, av: myAvatar(S.player)}, comic: true, confetti: false,
    levels: () => backToMenu(), levelsText: '🎚️ Levels', again: () => startMatch(), againText: '🔁 Again', extra: [{text: '🕹️ Gameroom', fn: () => goGameroom()}],
    next: nextOk ? () => { hideResult(); chosenLevel = lvl + 1; ls(store('lv'), String(lvl + 1)); fillSetup(); startMatch(); } : null,
    nextText: lvl === 4 ? 'Try 💀 Hardcore ▶' : 'Next level ▶'});
  if(!vsRobot){ const row = $('result-card').querySelector('.gf-r-btns'); if(row){ const d = document.createElement('div'); d.className = 'b3-more stats';
    d.innerHTML = '<span>' + UI.esc(M.f[1].name) + ': 👊 ' + st[1].hits + ' · 🔥 ' + st[1].bestCombo + ' · 🌟 ' + st[1].juggle + '</span>'; row.parentNode.insertBefore(d, row); } }
  [['btn-levels', 'b-menu'], ['btn-again', 'b-again'], ['btn-next', 'b-next']].forEach(([x, y]) => { const e = $(x); if(e) e.id = y; });   // the old ids (tests, crowd)
  cheerFaces();   /* 📣 cs-2c */
  NOTES.length = 0;
  humans.forEach((p, seat) => {
    const s = st[p.i], won = win === p.i;
    const stats = {wins: won ? 1 : 0, bonks: s.hits, combo: s.bestCombo, juggle: s.juggle, sky: s.sky, perfects: s.perfects, powers: s.powers, uppers: s.uppers, matches: 1, duoWins: !vsRobot && won ? 1 : 0, grabs: s.grabs || 0, breaks: s.breaks || 0, techs: s.techs || 0, tags: s.tags || 0};
    if(p.name === 'Guest') return;
    if(vsRobot) saveWin(p.name, G.level, {score: BB.scoreFor(M, p.i), stars: won ? stars : 0, cleared: won, timeSec: secs, theme: THEMES[G.theme].name, stats}, seat);
    else saveFeatsOnly(p.name, stats, seat);
  });
}
const PENDING_KEY = 'sp_brawl_pending';
const NOTES = [];
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => { const r = google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))); if(w.feats) r.saveFeats(w.name, w.game || GAME_ID, w.stats); else r.saveLevelResult(w.game || GAME_ID, w.name, w.lvl, w.extra); }); }
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
function saveFeatsOnly(name, stats, seat){
  const who = UI.esc(name) + ': ';
  google.script.run.withSuccessHandler(res => putNote(seat, who + featText(res, '✅ Feats saved')))
    .withFailureHandler(() => { writePending(readPending().concat([{name, feats: true, stats}])); putNote(seat, who + '⚠️ Will be sent next time.'); }).saveFeats(name, GAME_ID, stats);
}
function featText(fe, base){ let h = base || ''; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { h += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); } return h; }
function saveText(res, cleared){
  const h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : cleared ? (res.best && res.best.score ? 'Best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Saved') : '✅ Feats saved — win to unlock the next level';
  return featText(res.feats, h);
}
function showResult(html){ /* 💬 24t-e result */ if(window.UI && UI.callout) UI.callout.setup(null); $('result-card').innerHTML = html; $('result').classList.remove('hidden'); cheerFaces();   /* 📣 cs-2c */ }
function hideResult(){ $('result').classList.add('hidden'); }
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pickOne(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 p1c: ◀ = where you came from (Gameroom if we don't know)
window.feedbackContext = () => ({page: 'Brawl Buddies', game: GAME_ID, level: G ? G.level : SET.level});

/* ================= BOOT ================= */
function boot(){
  UI.loading(GAME_ID);
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {}; S.gear = d.gear || {}; S.batDesigns = d.batDesigns || {}; S.progressAdv = d.progressAdv || {};
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

/* 💥 ck-room — ROOM FOR COMICS (the 💥 Comics chat wires ComicKit here; this game draws no comics itself)
   GameComic.mode()            → 'brawl' | 'adv' | ''  (which loop is live)
   GameComic.hold(on)          → quietly freeze / unfreeze the live loop (no pause card; key presses ignored while held; drawing goes on)
   GameComic.listen(fn)        → fn(mode, event, state) for every engine event (Brawl: BB.takeEvents · Brawenture: BV.takeEvents); returns an unlisten fn
   GameComic.log()             → this match / tale's events [{t, k, …event}] (last 600) — strips come from what really happened
   GameComic.area()            → the play-area element (#stage / #adv-stage) · slots: #comics-slot-menu, #comics-slot-adv (setup), #comic-strip-slot (result card) */
const GameComic = {
  _fns: [], _log: [], _mode: '',
  mode(){ return typeof AV !== 'undefined' && AV && !AV.over ? 'adv' : (typeof G !== 'undefined' && G && !G.over ? 'brawl' : ''); },
  hold(on){ const m = this.mode(); if(m === 'adv'){ AV.hold = !!on; if(!on) AV.last = performance.now(); return true; } if(m === 'brawl'){ G.hold = !!on; if(!on) G.last = performance.now(); return true; } return false; },
  listen(fn){ this._fns.push(fn); return () => { this._fns = this._fns.filter(f => f !== fn); }; },
  log(){ return this._log.slice(); },
  area(){ return this.mode() === 'adv' ? $('adv-stage') : $('stage'); },
  _reset(mode){ this._log = []; this._mode = mode; },
  _feed(mode, list){ if(!list || !list.length) return; const st = mode === 'adv' ? (AV && AV.M) : (G && G.M), t = st ? Math.round((st.t || 0) * 100) / 100 : 0;
    list.forEach(e => { this._log.push(Object.assign({t, mode}, e)); this._fns.forEach(f => { try{ f(mode, e, st); }catch(err){} }); }); if(this._log.length > 600) this._log.splice(0, this._log.length - 600); }
};
window.GameComic = GameComic;

/* ================= 🗺️ BRAWENTURE — adventure mode (engine BV above; draws with the Brawl Buddies fighter painter) ================= */
let ADV = {tale: 0, diff: 'normal', seat2: 'bot', p2: '', seat3: 'off', p3: '', seat4: 'off', p4: '', macro: true}, AV = null;
/* 📏 s-brawl adv#1 → BrawlBuddies_adv.html */
/* ================= 📏 S-BRAWL PARTS — 🗺️ Brawenture loads when it is opened (✨ Polish chat s-brawl, rule "📏 Born split + split your own") =================
   The engine BV + the whole Brawenture client live in BrawlBuddies_adv.html (built by Test Harness/parts/build_parts.py from
   parts/BrawlBuddies/adv.js — edit that). openAdv() waits for it (GameParts.need, with the game's own loader); the 🥊 ring never needs it.
   📲 offline app + tests: the part is inline (Code.gs INCLUDE_ALSO_ BrawlBuddiesParts) → it is there at once. ADV / AV stay HERE (state the
   🎵 mood + game bar read). advLateWraps = the ✨ spotlight + 🎵 mood wrappers of startAdv / advEnd / advEvents, put on once the part is in. */
function advPartReady(){ return typeof GameParts !== 'undefined' && GameParts.has('BrawlBuddies_adv'); }
function advLateWraps(){
  if(typeof startAdv !== 'function' || startAdv.__advLate) return;
  const tag = (n, f) => { f.__advLate = 1; window[n] = f; };
  const wrapBefore = (n, flag, before) => { const f = window[n]; if(typeof f !== 'function' || f[flag]) return; const w = function(){ try{ before.apply(this, arguments); }catch(e){} return f.apply(this, arguments); }; w[flag] = 1; window[n] = w; };
  const wrapAfter = (n, flag, after) => { const f = window[n]; if(typeof f !== 'function' || f[flag]) return; const w = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; w[flag] = 1; window[n] = w; };
  if(typeof GMOOD !== 'undefined' && GMOOD){   /* 🎵 the same three hooks the 24u-b MOOD block puts on when the part is inline */
    wrapAfter('startAdv', '__gmoodA', () => GMOOD.start()); wrapBefore('advEnd', '__gmood', () => GMOOD.stop());
    wrapBefore('advEvents', '__gmood', list => { if((list || []).some(e => e.k === 'solved' || e.k === 'clashWin' || e.k === 'mapEnd' || e.k === 'rescue' || e.k === 'evolve')) GMOOD.lift(); }); }
  const prev = window.startAdv; if(typeof msWrap === 'function') msWrap('startAdv', () => 'brawenture');   /* ✨ modes-3: Brawenture counts as tried */
  if(window.startAdv !== prev) ['__gmood', '__gmoodA'].forEach(k => { if(prev[k]) window.startAdv[k] = prev[k]; });   // the outer wrapper still runs the 🎵 hook inside
  tag('startAdv', window.startAdv);
}
document.addEventListener('DOMContentLoaded', advLateWraps);   /* inline part (offline app / tests): it ran right after this script */
function advNeed(go){
  if(typeof GameParts === 'undefined') return setTimeout(() => advNeed(go), 40);   // the loader comes right after this script
  if(advPartReady()){ advLateWraps(); return go(); }
  UI.loading(GAME_ID, '🗺️ Getting Brawenture…');
  GameParts.need('BrawlBuddies_adv', ok => { UI.loaded(); if(ok){ advLateWraps(); return go(); } UISound.play('error'); UI.toast('📡 Brawenture did not load — check the internet, then tap it again', 'err'); }); }
/* ================= 📏 END S-BRAWL PARTS ================= */
function openAdv(){ if(!advPartReady()) return advNeed(openAdv);   /* 📏 s-brawl */ if(BrawlCover) BrawlCover.hide(); /* 🧱 b3w5b */ advLoad(); renderAdv(); showScreen('adv'); }
/* 📏 s-brawl adv#2 → BrawlBuddies_adv.html */
/* ✨ MODE SPOTLIGHT (modes-3): ?mode=<id> opens this game straight in that mode after the player pick · "✨ Also try" on the start page · started modes → UI.modeTried */
const MS_GAME = 'brawl-buddies';
function msOpen(id){
  if(id === 'brawenture') openAdv(); else if(id === 'battle') showScreen('menu');
}
function msNow(){ return 'battle'; }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startMatch', () => 'battle');
msWrap('startAdv', () => 'brawenture');
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */

