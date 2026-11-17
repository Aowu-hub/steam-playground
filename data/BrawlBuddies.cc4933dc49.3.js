
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
  if(!touch){ bottom.innerHTML = legendHtml(); }
  else if(side){
    if(two){ arena.insertBefore(ctlEl(0, 'pad+btn'), arena.firstChild); arena.appendChild(ctlEl(1, 'pad+btn')); }
    else { const L = ctlEl(0, 'pad'), R = ctlEl(0, 'btn'); arena.insertBefore(L, arena.firstChild); arena.appendChild(R);
      if(window.UI && UI.pad){ L.classList.add('pz-l'); R.classList.add('pz-r'); pzFan(R.querySelector('.tbtns'), pzRingOrder(), on => { if(G) G.tbBlk[0] = on; }); } }
  } else {
    const w = document.createElement('div'); w.className = 'ctl-wrap';
    if(two){ w.appendChild(ctlEl(0, 'pad+btn')); w.appendChild(ctlEl(1, 'btn+pad')); }
    else { const L = ctlEl(0, 'pad'), R = ctlEl(0, 'btn'); w.appendChild(L); w.appendChild(R); if(window.UI && UI.pad){ w.classList.add('pz-wrap'); pzFan(R.querySelector('.tbtns'), pzRingOrder(), on => { if(G) G.tbBlk[0] = on; }); pzFitStick(L, 4); } }
    bottom.appendChild(w);
  }
  pzArcAll($('scr-play'));
  requestAnimationFrame(resize); resize();
}
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
      const P = q.ko ? undefined : ready ? {armR: 2.2 + Math.sin(t * 6) * 0.25, armL: -0.4, rot: 0.08, legL: 0, legR: 0, feet: 'follow'} : {armR: 0.4, armL: -0.4, dy: Math.sin(t * 3 + j) * 0.8, legL: 0, legR: 0, feet: 'follow'};
      drawAvatar(g, {name: q.name, av: q.avF || st.avs[side], dir: side === 0 ? 1 : -1, stance: q.ko ? 'lie' : ''}, px, feet, k, {t, pose: P});
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
  const s = Math.min(W / cam.w, H / 4.6), halfW = W / s / 2, lim = BB.ARENA + 0.9;
  const cx = Math.max(-lim + halfW, Math.min(lim - halfW, cam.cx));
  // rise with a high juggle so nobody flies out of the top
  const top = Math.max(st.M.f[0].y, st.M.f[1].y) + 2.3, roomUp = (H - Math.max(s * 0.55, H * 0.14)) / s, wantUp = Math.max(0, top - roomUp + 0.3);
  if(st.preview) cam.up = 0; else cam.up = (cam.up || 0) + (wantUp - (cam.up || 0)) * 0.12;
  const floorY = H - Math.max(s * 0.55, H * 0.14) + cam.up * s;
  return {s, cx: halfW * 2 > 2 * lim ? 0 : cx, floorY, W, H, X: x => W / 2 + (x - (halfW * 2 > 2 * lim ? 0 : cx)) * s, Y: y => floorY - y * s};
}
function drawScene(g, W, H, st, still){
  const V = view(W, H, st), T = THEMES[st.theme], M = st.M, t = st.t || 0; if(st === G) G.V = V; /* 💬 24t-e */
  g.save();
  if(st.shake > 0 && !st.preview){ g.translate((Math.random() - 0.5) * 10 * st.shake / 0.3, (Math.random() - 0.5) * 8 * st.shake / 0.3); }
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
  drawBench(g, W, H, V, st, t);
  if(st.flash > 0 && !st.preview && !reduced()){ g.fillStyle = 'rgba(255,255,255,' + Math.min(0.45, st.flash * 3).toFixed(2) + ')'; g.fillRect(-20, -20, W + 40, H + 40); }
  g.restore();
}
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
  if(p.dodge){ const u = Math.min(1, p.dodge.t / 0.34); P.rotFull = p.dodge.dir * eio(u) * Math.PI * 2; Object.assign(P, {sy: 0.8, armR: 2.2, armL: -2.2, legL: 1.1, legR: -1.1}); return {P, a}; }
  const duck = BB.ducking(p), air = !BB.onGround(p);
  if(duck) Object.assign(P, {sy: 0.74, legL: 0.95, legR: -0.95, armR: 1.35, armL: -1.2, dy: 0});
  // 💨 dash = run cycle leaning in · dash back = little hop leaning away
  if(p.dash && !p.act){
    if(p.dash.dir > 0){ const c = Math.sin(t * 34); Object.assign(P, {rot: 0.3, legL: 0.9 * c, legR: -0.9 * c, armR: 0.6 - 0.9 * c, armL: -0.6 + 0.9 * c, sy: 0.98, dy: Math.abs(c) * -2}); }
    else Object.assign(P, {rot: -0.28, legL: 0.6, legR: 0.1, armR: 0.3, armL: 0.4, sy: 1.02});
  }
  const guard = BB.guardOf(p), m = p.act ? BB.MOVES[p.act.k] : null;
  if(guard && !m){ const o = M.f[1 - p.i], near = !o || Math.abs(o.x - p.x) < 3.2; if(near){ Object.assign(P, guard === 'low' ? {armR: 1.75, armL: -1.65, rot: 0.06} : {armR: 2.55, armL: -2.35, rot: -0.1}); } }
  if(air && !m && !p.dash){ const up = p.vy > 2; Object.assign(P, {legL: up ? 0.75 : 0.45, legR: up ? -0.15 : -0.5, armR: up ? 2.2 : 1.6, armL: up ? -2.0 : -1.5, dy: 0}); }
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
  if(R0 && R0.t < 0.4){ const amt = Math.pow(1 - R0.t / 0.4, 2), wob = Math.cos(R0.t * 26);
    if(R0.kind === 'low'){ P.rot += 0.38 * amt; P.sy *= 1 - 0.1 * amt; }
    else if(R0.kind === 'big'){ P.rot -= 0.62 * amt * (0.6 + 0.4 * wob); P.armR += 1.2 * amt; P.armL -= 1.2 * amt; }
    else { P.rot -= 0.42 * amt * (0.6 + 0.4 * wob); P.armR -= 0.5 * amt; }
    a.eyes = 'closed'; a.mouth = 'open'; }
  if(vis.blockT != null && vis.blockT < 0.16){ const amt = 1 - vis.blockT / 0.16; P.rot -= 0.14 * amt; P.sx *= 1 - 0.05 * amt; }
  // squash & stretch: take-off stretch, landing squash, getting up
  if(air && p.vy > 3 && !p.launched){ P.sy *= 1.08; P.sx *= 0.94; }
  if(p.land > 0 && !m){ const q = p.land / 0.25; P.sy *= 1 - 0.16 * q; P.sx *= 1 + 0.12 * q; }
  if(vis.getup != null && vis.getup < 0.35 && !m){ const q = 1 - vis.getup / 0.35; P.sy *= 1 - 0.3 * q; P.rot -= 0.5 * q; P.armR = 0.8; P.armL = -0.6; }
  if(p.cheer > 0 && !m && M.state !== 'fight'){ a.gest = {g: gestOf('cheer'), t: 2 - p.cheer}; return {P: null, a}; }
  if(p.sad > 0 && !m && M.state !== 'fight'){ a.gest = {g: gestOf('shrug'), t: 2 - p.sad}; return {P: null, a}; }
  if(Math.abs(p.vx) > 0.3 && BB.onGround(p) && !duck && !m && !p.dash){ a.walkT = p.walkT + 0.01; const w = Math.sin(p.walkT * 11); P.legL = 0.45 * w; P.legR = -0.45 * w; P.dy -= Math.abs(Math.cos(p.walkT * 11)) * 2; }
  if(a.mouth) P.mouth = a.mouth;
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
  if(p.act && p.act.k === 'charge'){ const c = Math.min(1, p.act.t / 0.28), r = V.s * (0.55 + 0.25 * c + 0.05 * Math.sin(t * 30)); g.save(); g.globalAlpha = 0.25 + 0.35 * c; const gr = g.createRadialGradient(sx, V.Y(py + 0.9), r * 0.2, sx, V.Y(py + 0.9), r); gr.addColorStop(0, c >= 1 ? 'rgba(255,90,60,0.9)' : 'rgba(255,200,69,0.8)'); gr.addColorStop(1, 'rgba(255,200,69,0)'); g.fillStyle = gr; g.beginPath(); g.arc(sx, V.Y(py + 0.9), r, 0, 7); g.fill(); g.restore(); }
  // 💨 swoosh trail behind the punching glove
  if(vis.trail && vis.trail.length > 1 && !st.preview){ g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.lineCap = 'round'; const tr = vis.trail;
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
  drawAvatar(g, A, sx, sy, k, {t, pose: P ? Object.assign({}, P, a.eyes ? {eyes: a.eyes} : {}) : undefined});
  if(P && !a.stance) gloveAt(g, sx, sy, k * (look.big || 1), dir, P, jumpH + (look.hover ? 10 : 0), 'front', glove, vis);
  // trail: only while a move is in its strike part
  const mv = p.act && BB.MOVES[p.act.k], striking = mv && p.act.k !== 'charge' && p.act.t >= mv.st * 0.7 && p.act.t <= mv.st + mv.ac + 0.05;
  if(!vis.trail) vis.trail = []; if(striking && vis.glovePt) vis.trail.push(vis.glovePt); else vis.trail.length = 0; if(vis.trail.length > 6) vis.trail.shift();
  if(!p.human && !p.noHelm && P && !a.stance) antenna(g, sx, sy, k * (look.big || 1), dir, P, jumpH, ring, t, st.level || 0, p.style);
  if(p.gear != null && P && !a.stance && typeof drawBrawlBand === 'function'){ g.save(); avFrame(g, sx, sy, k * (look.big || 1), dir, P, jumpH); drawBrawlBand(g, p.gear, k * (look.big || 1), t); g.restore(); }
  g.globalAlpha = 1;
  if(p.hitFlash > 0){ g.fillStyle = 'rgba(255,255,255,' + (p.hitFlash * 3).toFixed(2) + ')'; g.beginPath(); g.arc(sx, V.Y(p.y + 0.9), V.s * 0.55, 0, 7); g.fill(); }
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
    g.save(); g.globalAlpha = 1 - q; g.fillStyle = '#FFF59D'; g.beginPath();
    for(let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2, rr = i % 2 ? r * 0.5 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fill(); g.strokeStyle = '#FF7043'; g.lineWidth = 3; g.stroke();
    for(let i = 0; i < 3; i++){ const a = i * 2.1 + f.x * 3; emo(g, f.e1, x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 0.8 - q * V.s * 0.3, V.s * 0.26); }
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
function openAdv(){ if(BrawlCover) BrawlCover.hide(); /* 🧱 b3w5b */ advLoad(); renderAdv(); showScreen('adv'); }
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
  AV.touch = touch;
  if(!touch){ $('adv-bottom').innerHTML = advLegend(); }
  else if(H > W * 1.05){ const w = document.createElement('div'); w.className = 'ctl-wrap adv-wrap';   // tall screen: pads under the picture
    if(humans.length > 1){ w.appendChild(advCtl(0, 'l', true)); w.appendChild(advCtl(1, 'r', true)); } else { w.appendChild(advCtl(0, 'l', false, 'pad')); w.appendChild(advCtl(0, 'r', false, 'btn')); }
    $('adv-bottom').appendChild(w); if(humans.length === 1) pzFitStick(w, ADV.macro ? 4 : 3); }
  else if(humans.length > 1){ arena.appendChild(advCtl(0, 'l', true)); arena.appendChild(advCtl(1, 'r', true)); }
  else { arena.appendChild(advCtl(0, 'l', false, 'pad')); arena.appendChild(advCtl(0, 'r', false, 'btn')); }
  pzArcAll($('scr-advplay'));
  requestAnimationFrame(advResize); advResize();
  if(AV.M && !AV.M.t) AV.M.view = advViewW();
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
function advViewW(){ const st = $('adv-stage'), w = (st && st.clientWidth) || innerWidth, h = (st && st.clientHeight) || innerHeight * 0.7; return Math.max(6.5, Math.min(BV.VIEW, 11 * (w / Math.max(1, h)) / 1.35)); }
function advView(W, H){
  const s = W / AV.M.view, bandH = Math.max(H * 0.26, Math.min(H * 0.5, s * BV.ZD * (H > W ? 1 : 0.7))), yB = H - Math.max(6, H * 0.035), yT = yB - bandH, cam = AV.M.cam;
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
    if(p.hero && hm) act = {k: hm.anim, t: p.act.t};
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

