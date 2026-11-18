
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'sla-brall';
// 🎛️ p1c: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 🏓 SlaBrall · level | numbers | game buttons ⏸ ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🏓', name: 'SlaBrall', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { pauseGame(); }, resume: () => { if(G && G.paused && !G.over) togglePause(); }},
  onFit: () => { if(G){ resize(); buildPads(); } },
  extras: [{id: 'pause-btn', html: '<span class="gb-pzi" aria-hidden="true"><i></i><i></i></span>', label: 'Pause (P)', onClick: () => togglePause(), keep: true}]});
var NAV_INNER = {link: ['◀ SlaBrall', () => lkExit()], menu: ['◀ SlaBrall', () => openCover()], cup: ['◀ SlaBrall', () => showScreen('menu')], bracket: ['◀ SlaBrall', () => backToMenu()]};   // 🧭 inner screens: their top button goes to the main screen
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
let FX = 1;   // harness sets 0 (no big words / confetti)
function fmt(ms){ const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function say(text){ try{ if(!UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.pitch = 1.15; speechSynthesis.speak(u); }catch(e){} }
function pickOne(a){ return a[Math.floor(Math.random() * a.length)]; }

/* ================= DATA ================= */
const LEVEL_UI = [
  {emoji: '🌱', blurb: 'Slow ball, friendly robot. Your avatar swings by itself — just move!'},
  {emoji: '🐣', blurb: 'A bit faster. Try the shot keys: smash, drop, lob, slice.'},
  {emoji: '🔥', blurb: 'The robot uses shots and power-ups now.'},
  {emoji: '⚡', blurb: 'Timing matters: press a shot right at the hit for PERFECT!'},
  {emoji: '🌋', blurb: 'Fast rallies, a sharp robot that aims for the lines.'},
  {emoji: '💀', blurb: 'Win before the robot scores 3 — ×3 points, robot at full power.', hardcore: true}
];
const AGE_START = {'4-5': 0, '6-7': 0, '8-9': 1, '10+': 2};
const THEMES = {
  dino:    {name: 'Dino × jungle', icon: '🦖', sky: ['#173D22', '#2F6B33'], ground: '#4E7F30', court: '#7DB04A', court2: '#6A9B3D', line: '#F6F1D1', net: '#3B2A1E', deco: ['🌴', '🦖', '🌿', '🦕', '🌋', '🥚'], amb: 'leaf', table: '#2E5E2A', ice: '#E4F3D8', glass: 'rgba(170,230,140,0.25)'},
  sea:     {name: 'Aquarium × sea monster', icon: '🐙', sky: ['#05304F', '#0A6E9C'], ground: '#0C5A80', court: '#1F95BE', court2: '#1A86AC', line: '#E6FBFF', net: '#0B2A40', deco: ['🐙', '🐠', '🪸', '🐡', '🦑', '🐚'], amb: 'bubble', table: '#0E4D73', ice: '#D7F4FF', glass: 'rgba(160,230,255,0.25)'},
  dance:   {name: 'Dance hall × DJ', icon: '🪩', sky: ['#140828', '#3A1263'], ground: '#25103F', court: '#5A2B9C', court2: '#4C238A', line: '#FFE14A', net: '#110521', deco: ['🪩', '🎧', '🎶', '💃', '🔊', '🕺'], amb: 'lights', table: '#2B0F4F', ice: '#EADCFF', glass: 'rgba(255,120,220,0.22)'},
  classic: {name: 'Classic', icon: '🏟️', sky: ['#8ECDF2', '#E4F4FF'], ground: '#4F9D5A', court: '#2F7FC1', court2: '#2A72AE', line: '#FFFFFF', net: '#1E2A33', deco: ['🏟️', '🚩', '🎉', '👏', '📣'], amb: 'none', table: '#1F4E7A', ice: '#F2F8FF', glass: 'rgba(200,230,255,0.28)'},
  space:   {name: 'Space × planets', icon: '🪐', sky: ['#04030C', '#1A1345'], ground: '#1B1736', court: '#3A2F7A', court2: '#33296C', line: '#B9F3FF', net: '#0A0820', deco: ['🪐', '⭐', '🌙', '☄️', '🛸', '🌟'], amb: 'stars', table: '#251E55', ice: '#DCE4FF', glass: 'rgba(150,180,255,0.22)'},
  sky:     {name: 'Sky × Olympian gods', icon: '☁️', sky: ['#78C5F2', '#FFF1CF'], ground: '#EDE6CF', court: '#E3D29A', court2: '#D9C588', line: '#B8860B', net: '#5A4520', deco: ['☁️', '⚡', '🏛️', '🦅', '🌤️', '🏺'], amb: 'cloud', table: '#C9B06A', ice: '#FFFDF2', glass: 'rgba(255,255,255,0.35)'}
};
const THEME_KEYS = Object.keys(THEMES);
const TIER_COL = ['#E8F4FF', '#4DA3FF', '#FFC845'], TIER_NAME = ['Common', 'Rare', 'Legendary'];
const SEAT_LABEL = ['Left player', 'Right player', 'Left partner', 'Right partner'];
const ACTIONS = [['up', '⬆️ Up'], ['down', '⬇️ Down'], ['left', '⬅️ Left'], ['right', '➡️ Right'], ['smash', '💥 Smash'], ['drop', '🪶 Drop'], ['lob', '🌈 Lob'], ['slice', '🔪 Slice'], ['power', '⚡ Power']];
const DEFAULT_KEYS = [
  {up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', smash: 'KeyF', drop: 'KeyG', lob: 'KeyT', slice: 'KeyH', power: 'KeyE'},
  {up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', smash: 'Quote', drop: 'Semicolon', lob: 'KeyP', slice: 'KeyL', power: 'KeyO'},
  {up: 'Numpad8', down: 'Numpad5', left: 'Numpad4', right: 'Numpad6', smash: 'Numpad7', drop: 'Numpad1', lob: 'Numpad9', slice: 'Numpad3', power: 'Numpad0'},
  {up: 'Home', down: 'End', left: 'Delete', right: 'PageDown', smash: 'Insert', drop: 'Backslash', lob: 'PageUp', slice: 'Enter', power: 'ShiftRight'}
];
const SHOT_ICON = {smash: '💥', drop: '🪶', lob: '🌈', slice: '🔪'};

/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, ballSkins: {}, player: '', age: ''};
let SET = {sport: 'slaball', level: 0, mode: 'robot', theme: 'classic', powers: true, opp: '', team: [null, null, null], ball: -1, view: 'auto', help: true};
let G = null, lockHandle = null, KEYS = null;
function store(k){ return 'sp_slabrall_' + k + ':' + (S.player || ''); }
function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function loadPrefs(){
  try{ const p = JSON.parse(ls(store('prefs')) || '{}'); if(SB.SPORTS[p.sport]) SET.sport = p.sport; if(THEMES[p.theme]) SET.theme = p.theme; if(p.powers === false) SET.powers = false; if(p.mode && p.mode !== 'link') SET.mode = p.mode; if(['auto', 'behind', 'top'].indexOf(p.view) >= 0) SET.view = p.view; if(p.help === false) SET.help = false; }catch(e){}
  SET.ball = sharedBall();
}
function savePrefs(){ ls(store('prefs'), JSON.stringify({sport: SET.sport, theme: SET.theme, powers: SET.powers, mode: SET.mode, view: SET.view || 'auto', help: SET.help !== false})); }
// ⚾ ball skin: ONE pick shared with Pinball (sp_ball:<Name>), from the skins this player owns (Collection line "ballskin")
function ownedBalls(name){ return Math.min(BallSkins.count, Number((S.ballSkins || {})[name || S.player]) || 0); }
function sharedBall(){ let raw = ls('sp_ball:' + S.player); if(raw == null || raw === '') raw = ls('sp_pinball_ball:' + S.player); if(raw == null || raw === '') return -1; const v = Number(raw); return Number.isFinite(v) && v >= 0 && v < ownedBalls() ? v : -1; }
function myAvatar(name){ const a = S.avatars[name]; return a ? fixAv(a) : defaultAvatar(name || 'player'); }
function racketOf(name){
  let d = null; try{ d = JSON.parse(ls('sp_racket:' + name) || 'null'); }catch(e){}
  if(!d){ try{ d = JSON.parse((S.settings || {})['Racket_' + name] || 'null'); }catch(e){} }
  const sp = SB.SPORTS[SET.sport], fallback = sp.id === 'slashot' ? 3 : sp.id === 'slapong' ? 1 : sp.id === 'slapoof' ? 0 : 2;   // 🏸 SlaBam / 🧱 SlaWall use a long racket (2)
  if(!d || !Number.isFinite(Number(d.v))) return racketDesign(fallback, {});
  if(!BatStick.owns(Number(d.v), ownedRackets(name), ownedBats(name))) d.v = fallback;   // the 4 basic sport rackets are free; the rest: 🏓 Rackets line (0–9) + 🏏 Batsticks line (10–17)
  return racketDesign(d.v, d);
}
function ownedRackets(name){ return Math.max(4, Number(((S.settings || {})._rackets || {})[name]) || Number((S.racketsOwned || {})[name]) || 0); }

/* ================= MENUS ================= */
function showScreen(name){
  if(name === 'setup') name = 'menu';   /* 🧱 b3w5: the old "Get ready" screen is part of the ONE setup page */
  if(name !== 'menu' && name !== 'player' && typeof SlaCover !== 'undefined' && SlaCover) SlaCover.hide();   /* 🧱 b3w5: cup / link / play cover the 🎬 cover */
  ['player', 'menu', 'cup', 'bracket', 'link', 'play'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER);   /* 🧭 p1c */ window.scrollTo(0, 0);
}
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
function renderPlayers(){ slaPaintLogos();   // 🏷️ lg-1

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
  loadPrefs(); KEYS = loadKeys(); $('who-name').textContent = name; renderMenu(); showScreen('menu'); openCover();   /* 🧱 b3w5: the 🎬 cover first */
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No win yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span><span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
function renderMenu(){
  // sports: built once per visit, then only the .on class moves (no page jump)
  const sl = $('sport-list');
  if(!sl.children.length){   // 🗂️ mg-1: 🏓 Sports · 🏆 Cup boxes
    UI.modeGroups(sl, MODE_GROUPS, mgList(), {next: k => k === 'cup' || k === 'ljoin' || k === 'lhost' ? null : $('level-list'),
      onPick: k => { if(k === 'cup'){ openCup(); return 'stop'; } if(k === 'ljoin'){ lkOpenJoin(); return 'stop'; } if(k === 'lhost'){ lkHostPick(); return 'stop'; } SET.sport = k; savePrefs(); markSports(); fillSetup(); markPicks(); return false; }});   /* 🧱 b3w5: the page below follows the sport */
  }
  markSports(); renderLevels(); cupBtnLabel(); mgCupLabel(); slaPaintLogos();   // 🏷️ lg-1
  /* 🧱 b3w5: 🏆 leaders live on the cover */
  $('pow-list').innerHTML = SB.POWER_KEYS.map(k => { const P = SB.POWERS[k]; return '<div>' + P.icon + ' <b>' + P.name + '</b> <small>(' + TIER_NAME[P.tier] + ')</small><br>' + UI.esc(P.about) + '</div>'; }).join('');
}
// 🃏 mc-1 mode cards: what kind of game (type) + its rule (sub)
const SPORT_TYPE = {slashot: 'A table hockey game', slapoof: 'A pickleball game', slaball: 'A tennis game', slapong: 'A ping-pong game', slabam: 'A badminton game', slawall: 'A squash game'};
const SPORT_TAG = {slashot: 'Score goals · first to 5 or 7 wins', slapoof: 'Bounce once each side · no volleys in the 🥒 kitchen', slaball: 'One bounce · 15 · 30 · 40 · game', slapong: 'Every ball bounces once on the table', slabam: 'Fast hit, slow drop · never let it touch the floor', slawall: 'No net · hit ANY wall · one bounce, then their turn'};
/* 🗂️ MODE GROUPS (mg-1) */
const MODE_GROUPS = [
  {k: 'sports', icon: '🏓', en: 'Sports', th: 'กีฬา', c: '#2F7BEA'},
  {k: 'cup', icon: '🏆', en: 'Cup', th: 'ทัวร์นาเมนต์', c: '#C9760A'},
  {k: 'link', icon: '📡', en: 'Own devices', th: 'เล่นหลายเครื่อง', c: '#0E9F8E'}   // 📡 lk-1b
];   // 🗂️ mg-1 mode groups (header icon + English + Thai), fixed order
function mgList(){ return SB.SPORT_ORDER.map(k => ({k, g: 'sports', icon: SB.SPORTS[k].icon, name: SB.SPORTS[k].name, type: SPORT_TYPE[k], sub: SPORT_TAG[k], next: '👇 then pick a level'}))   // 🗂️ mg-1
  .concat([{k: 'cup', g: 'cup', icon: '🏆', name: ($('cup-btn-t') || {}).textContent || 'Tournament', type: 'A knock-out tournament', sub: ($('cup-btn-s') || {}).textContent || '4 or 8 teams · bracket · trophy', next: '▶ opens the cup', id: 'cup-btn'},
    {k: 'lhost', g: 'link', icon: '📡', name: 'Host a game', type: 'Each on their own device', sub: 'Pick a sport + level — friends join you', next: '▶ opens the host screen'},   /* 📡 lk-1c */
    {k: 'ljoin', g: 'link', icon: '🔗', name: 'Join friends', type: 'Each on their own device', sub: 'Type the 4 numbers on the host screen', next: '▶ opens the picture pad'}]); }   // 📡 lk-1b
function mgCupLabel(){ const b = document.querySelector('#sport-list #cup-btn'); if(!b) return; b.querySelector('.mn').textContent = $('cup-btn-t').textContent; const s = b.querySelector('.ms'); if(s) s.textContent = $('cup-btn-s').textContent; if(UI.modeCards) UI.modeCards($('sport-list')); }
/* 🗂️ END MODE GROUPS */
function markSports(){ $('sport-list').querySelectorAll('.ui-mbtn').forEach(b => b.classList.toggle('on', b.dataset.k === SET.sport)); }
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; const p = progressOf(S.player), rec = AGE_START[S.age];
  SB.LEVELS.forEach((L, i) => {
    const U = LEVEL_UI[i], open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.dataset.lv = i;   /* 🧱 b3w5 */
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (U.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + U.emoji + '</div><div class="nm">' + L.name + '</div><div class="learn">🤖 robot level ' + (i + 1) + '</div><div class="sub">' + (U.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : U.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Win on Hard to unlock Extreme!' : 'Win the level before to unlock it'); return; } chooseLevel(i); };   /* 🧱 b3w5: a tap picks */
    box.appendChild(b);
  });
  { let i = -1; try{ i = Number(ls(store('lv'))); }catch(e){} if(!(i >= 0 && canPlay(i))) i = canPlay(rec) ? rec : Math.max(0, [0, 1, 2, 3, 4, 5].filter(canPlay).pop() || 0); chosenLevel = i; }
  fillSetup(); markPicks();   /* 🧱 b3w5 */
}

/* ================= SETUP ================= */
/* 🧱 b3w5 (Game Baseline): ONE setup page — 🏓 sport → 🎚️ level → 👥 who plays → 🎨 court → ⚙️ options → ▶ Start */
let chosenLevel = 0;
function openSetup(lvl){   // the old entry point (tests, old links): picks the level + fills the page + shows it
  if(SlaCover) SlaCover.hide(); if(lvl != null) chosenLevel = lvl; fillSetup(); markPicks(); showScreen('menu');
}
function fillSetup(){
  const lvl = chosenLevel; SET.level = lvl; const sp = SB.SPORTS[SET.sport], L = SB.LEVELS[lvl];
  if(LEVEL_UI[lvl].hardcore) SET.mode = 'robot';
  if(!slaLogoInto($('setup-logo'), sp.id, 76)) $('setup-logo').textContent = sp.icon; $('setup-title').textContent = sp.name + ' · ' + L.name;   // 🏷️ lg-1
  $('setup-sub').textContent = sp.about + ' ' + targetText(sp, lvl);
  buildModes(); buildSeats(); buildThemes(); buildBalls(); buildTrails(); buildFeathers();
  $('pw-chip').textContent = '⚡ Power-ups: ' + (SET.powers ? 'on' : 'off'); $('pw-chip').classList.toggle('on', SET.powers);
  $('pw-chip').onclick = () => { SET.powers = !SET.powers; savePrefs(); $('pw-chip').textContent = '⚡ Power-ups: ' + (SET.powers ? 'on' : 'off'); $('pw-chip').classList.toggle('on', SET.powers); };
  // 📷 sb2-1 view: Auto (behind for 1 person, top for 2+) → Behind → Top · 🎯 aim help (Basic → Intermediate)
  const VIEW_TXT = {auto: '📷 View: Auto', behind: '📷 View: Behind me', top: '📷 View: From above'};
  const vc = () => { $('view-chip').textContent = VIEW_TXT[SET.view || 'auto']; $('view-chip').classList.toggle('on', (SET.view || 'auto') !== 'auto'); };
  const hc = () => { $('help-chip').textContent = '🎯 Aim help: ' + (SET.help !== false ? 'on' : 'off'); $('help-chip').classList.toggle('on', SET.help !== false); };
  vc(); hc();
  $('view-chip').onclick = () => { const o = ['auto', 'behind', 'top']; SET.view = o[(o.indexOf(SET.view || 'auto') + 1) % 3]; savePrefs(); vc(); buildThemes(); UI.toast(SET.view === 'auto' ? '📷 Behind you when you play alone · from above for 2+ players' : SET.view === 'behind' ? '📷 Always from behind you' : '📷 Always from above'); };
  $('help-chip').onclick = () => { SET.help = SET.help === false; savePrefs(); hc(); };
  Comic.chip($('comic-chip'), S.player);
  if(window.Cheer){ Cheer.chip($('cheer-chip'), S.player); Cheer.langChip($('cheer-lang'), S.player); }   // 📣 cs-1: per player per device (sp_cheer:<Name>), default Calm   // 💥 sb2-3: per player per device (sp_comics:<Name>), default ON
  $('go-btn').onclick = () => SET.mode === 'link' ? lkOpenHost() : startMatch();   // 📡 lk-1b
  lkGoLabel();
}
function chooseLevel(i, quiet){
  chosenLevel = i; ls(store('lv'), String(i)); fillSetup(); markPicks();
  if(!quiet){ const w = $('who-head'); if(w && w.scrollIntoView) w.scrollIntoView({behavior: 'smooth', block: 'start'}); }
}
function markPicks(){
  $('level-list').querySelectorAll('.lvl').forEach(b => { const on = String(b.dataset.lv) === String(chosenLevel); b.classList.toggle('sel', on); if(window.GF && GF.pick) GF.pick(b, on); });
  lkGoLabel();
}
// 🎬 the cover (GameFrame): who's here (you + up to 3 on this device → 👥 2 players / 🤝 2 vs 2) + champions + how to play; ▶ Play opens the setup page
let SlaCover = null;
/* 📡 lk-6c: the room on the 🎬 cover — 🎮 Host and play (2 = 1 vs 1 · 3–4 = 2 vs 2) · 📺 Room hostess (1 = you vs 🤖) · 🔗 Join; the host's 🏓 sport + 🎚️ level sit in the room card */
const SLA_ROOM = {game: 'SlaBrall', title: '🏓 SlaBrall', page: 'slabrall', kind: 'sla-brall', seats: 4, min: 2, url: WEBAPP_URL + '?page=slabrall', name: () => S.player, av: () => withRacket(myAvatar(S.player), S.player), drawAvatar: (cv, p) => lkAv(cv, p),
  label: tv => { const sp = SB.SPORTS[SET.sport], L = SB.LEVELS[SET.level]; return sp.icon + ' ' + sp.name + ' · ' + LEVEL_UI[SET.level].emoji + ' ' + L.name + (tv ? ' · 📺 on the TV' : ''); }, bot: () => 'Robot',
  how: 'Gameroom → 🏓 SlaBrall → 📱 Own devices → 🔗 Join · or scan · 1 = you vs 🤖 · 2 = 1 vs 1 · 3–4 = 2 vs 2', picks: el => lkCoverPicks(el),
  onLink: () => { LK.viaCover = true; if(!lkLevelOk(SET.level)){ const rec = AGE_START[S.age] || 0; SET.level = lkLevelOk(rec) ? rec : 0; } }, onStart: () => { LK.viaCover = true; lkGo(); }};
const SLA_VERSION = '2.3';   /* 🧱 b3w5: shown on the cover footer — bump with each SlaBrall round */
const SLA_LOGO_SRC = {has: () => true, box: (id, kind) => kind === 'main' ? [720, 330] : null, pic: () => slaMark(slaTheme())};   // 🏷️ the game's own slaMark until the 🏷️ logo chat moves it into GameLogos
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(SlaCover && SlaCover.who !== S.player){ SlaCover.destroy(); SlaCover = null; }
  if(!SlaCover){ SlaCover = GF.cover(document.body, {game: GAME_ID, title: 'SlaBrall', icon: '🏓', version: SLA_VERSION, me: S.player, players: S.players, avatarOf: myAvatar, seats: {min: 1, max: 4},
      acts: ['beat.throw', 'beat.cheer'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms', logoSrc: SLA_LOGO_SRC, logo: {kind: 'main'},
      own: C => { if(!(window.Link && Link.cover)){ SlaCover.hide(); SET.mode = 'link'; savePrefs(); renderMenu(); showScreen('menu'); return; } lkWire(); Link.cover(C, SLA_ROOM); },   /* 📡 lk-6c: the room lives on the cover (LinkKit Link.cover) */
      onPlay: line => { SlaCover.hide(); slaLineup(line); renderMenu(); showScreen('menu'); } }); SlaCover.who = S.player; }
  if(window.Link && Link.cover && Link.cover.active(SlaCover)){ Link.cover.show(SlaCover); return; }   /* 📡 lk-6c: the room is still open → back to its cover */
  SlaCover.show();
}
function slaLineup(line){   // 👥 the cover's lineup → the seats (2 = 👥 2 players, 3–4 = 🤝 2 vs 2; partner = the 2nd person)
  const names = (line || []).map(x => x.name).filter(Boolean);
  if(names.length < 2){ if(SET.mode === 'duo' || SET.mode === 'team') SET.mode = 'robot'; savePrefs(); return; }
  if(names.length === 2){ SET.mode = 'duo'; SET.opp = names[1]; }
  else { SET.mode = 'team'; SET.team = [names[2] || null, names[1] || null, names[3] || null]; }
  savePrefs();
}
function targetText(sp, lvl, tt){ const t = tt || sp.targets[lvl]; return sp.scoring === 'tennis' ? 'First to ' + t + ' game' + (t > 1 ? 's' : '') + '.' : sp.scoring === 'goals' ? 'First to ' + t + ' goals.' : 'First to ' + t + ' points (win by 2).'; }
function buildModes(){
  const hc = !!LEVEL_UI[SET.level].hardcore, row = $('mode-row');
  const modes = [['robot', '🤖 Me vs Robot'], ['duo', '👥 2 players'], ['team', '🤝 2 vs 2'], ['link', '📡 Own devices']];   // 📡 lk-1b: each player on their own device
  row.innerHTML = modes.map(([k, n]) => '<button class="chip' + (SET.mode === k ? ' on' : '') + (hc && k !== 'robot' ? ' lock' : '') + '" data-k="' + k + '" data-sound="tap">' + n + '</button>').join('');
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { if(hc && b.dataset.k !== 'robot'){ UISound.play('error'); UI.toast('💀 Hardcore is you against the robot'); return; } SET.mode = b.dataset.k; savePrefs(); row.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); buildSeats(); lkGoLabel(); });
  lkGoLabel();
}
function others(){ return S.players.map(p => p.Name).filter(n => n !== S.player); }
function seatHtml(name, label, me, idx){
  const bot = !name, kb = keyHint(idx);
  return '<button class="seat' + (me ? ' me' : '') + (bot ? ' bot' : '') + '" data-i="' + idx + '" data-sound="' + (me ? 'none' : 'tap') + '"><canvas width="96" height="112" data-av="' + UI.esc(name || '') + '"></canvas><div class="nm">' + (bot ? '🤖 Robot' : UI.esc(name)) + '<small>' + label + (me || bot ? '' : ' · tap to change') + (bot && !me && idx > 0 ? ' · tap for a person' : '') + '</small></div>' + (kb ? '<span class="kb">' + kb + '</span>' : '') + '</button>';
}
function keyHint(seat){ if(SET.mode === 'robot') return seat === 0 ? '⌨️ WASD / arrows' : ''; const K = (KEYS || DEFAULT_KEYS)[seat]; if(!K) return ''; return '⌨️ ' + [K.up, K.left, K.down, K.right].map(keyName).join(' '); }
function buildSeats(){
  const box = $('seat-box'), list = others();
  if(SET.mode === 'link'){   // 📡 lk-1b
    box.innerHTML = '<div class="lk-how"><div class="lk-how-ic">📱📲💻</div><div><b>Everyone plays on their own device</b> — phone, tablet or computer, on the same Wi-Fi.<br>You open the room · friends tap <b>🔗 Join friends</b> and the 4 pictures you show.<br><small>2 players = 1 vs 1 · 3–4 players = 2 vs 2 (an empty seat gets a 🤖 robot)</small></div></div>';
  } else if(SET.mode === 'robot'){
    box.innerHTML = '<div class="seats"><div class="team">' + seatHtml(S.player, 'You', true, 0) + '</div><div class="vs">VS</div><div class="team">' + seatHtml(null, SB.LEVELS[SET.level].name + ' robot', false, 1) + '</div></div>' +
      (LEVEL_UI[SET.level].hardcore ? '<div class="hc-note" style="margin-top:10px">💀 Hardcore: win the match before the robot scores 3 points. ×3 score.</div>' : '');
  } else if(SET.mode === 'duo'){
    if(SET.opp && list.indexOf(SET.opp) < 0 && SET.opp !== 'Guest') SET.opp = '';
    if(!SET.opp) SET.opp = list[0] || 'Guest';
    box.innerHTML = '<div class="seats"><div class="team">' + seatHtml(S.player, 'You', true, 0) + '</div><div class="vs">VS</div><div class="team">' + seatHtml(SET.opp, 'Player 2', false, 1) + '</div></div>' +
      '<div class="opp-list">' + list.concat(['Guest']).map(n => '<button class="chip' + (n === SET.opp ? ' on' : '') + '" data-n="' + UI.esc(n) + '" data-sound="tap">' + (n === 'Guest' ? '🙂 Guest' : UI.esc(n)) + '</button>').join('') + '</div>';
    box.querySelectorAll('.opp-list .chip').forEach(b => b.onclick = () => { SET.opp = b.dataset.n; buildSeats(); });
  } else {
    // 2 vs 2: tap a seat to cycle Robot → each family player → Guest
    const T = SET.team; T.forEach((n, i) => { if(n && n !== 'Guest' && (list.indexOf(n) < 0 || T.indexOf(n) !== i)) T[i] = null; });
    box.innerHTML = '<div class="seats"><div class="team"><div class="team-h">🟧 Team 1</div>' + seatHtml(S.player, 'You', true, 0) + seatHtml(T[1], 'Partner', false, 2) + '</div><div class="vs">VS</div>' +
      '<div class="team"><div class="team-h">🟩 Team 2</div>' + seatHtml(T[0], 'Player', false, 1) + seatHtml(T[2], 'Partner', false, 3) + '</div></div><div class="note" style="margin-top:6px">Tap a seat to swap 🤖 robot / family / guest. Up to 4 people on one keyboard, or drag on a tablet.</div>';
    box.querySelectorAll('.seat:not(.me)').forEach(b => b.onclick = () => {
      const si = Number(b.dataset.i), ti = si === 1 ? 0 : si === 2 ? 1 : 2, used = T.filter((x, j) => x && j !== ti);
      const cyc = [null].concat(list.filter(n => used.indexOf(n) < 0)).concat(used.indexOf('Guest') < 0 ? ['Guest'] : []);
      const at = cyc.indexOf(T[ti]); T[ti] = cyc[(at + 1) % cyc.length]; buildSeats(); });
  }
  box.querySelectorAll('canvas[data-av]').forEach(c => { const n = c.dataset.av; const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
    if(!n){ x.font = '64px ' + EMOJI_FONT; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#000'; x.fillText('🤖', 48, 58); return; }
    drawPreviewCanvas(c, withRacket(myAvatar(n === 'Guest' ? 'Guest' : n), n), {name: n, t: 1}); });
}
function withRacket(av, name){ const a = JSON.parse(JSON.stringify(av)); a.eq = a.eq || {}; const d = racketOf(name); a.eq.hand = {id: 'racket', v: d.v, o: d}; delete a.eq.ride; return a; }   // nr-1 (Aowu): no ride-ons on the court — too distracting
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
  // the same painter as the real court (drawScene), on a little canvas
  const sp = SB.SPORTS[SET.sport], M = SB.newMatch({sport: sp.id, level: 0, seed: 3, theme: k, players: [{name: 'Ava', side: 0, av: defaultAvatar('Ava')}, {name: 'Bo', side: 1, av: defaultAvatar('Bo')}]});
  const people = SET.mode === 'robot' ? 1 : 2, mode = SET.view === 'top' || (SET.view !== 'behind' && people > 1) ? 'top' : 'behind';
  const V = makeView(c.width, c.height, sp, null, mode, 0); drawScene(c.getContext('2d'), V, M, k, 0, {preview: true});
}
function buildBalls(){
  const box = $('ball-list'), have = ownedBalls(); box.innerHTML = '';
  for(let v = -1; v < BallSkins.count; v++){
    const b = document.createElement('button'), lock = v >= have; b.className = 'ballc' + (SET.ball === v ? ' on' : '') + (lock ? ' lock' : ''); b.setAttribute('data-sound', lock ? 'none' : 'tap');
    const c = document.createElement('canvas'); c.width = c.height = 88; b.appendChild(c); b.insertAdjacentHTML('beforeend', lock ? '🔒' : v < 0 ? 'Sport ball' : UI.esc(BallSkins.NAMES[v]));
    const g = c.getContext('2d'); if(v < 0) drawSportBall(g, SB.SPORTS[SET.sport], 44, 44, 26, 0); else BallSkins.draw(g, v, 44, 44, 26, 1);
    b.onclick = () => { if(lock){ UISound.play('error'); UI.toast('Unlock more ball skins in 🎯 Pinball or 🏓 SlaBrall — see 📖 Collection'); return; } SET.ball = v; ls('sp_ball:' + S.player, String(v)); box.querySelectorAll('.ballc').forEach(x => x.classList.toggle('on', x === b)); };
    box.appendChild(b);
  }
}

/* ================= 🏆 TOURNAMENT (round 2) =================
   4 or 8 teams, singles or doubles. Family players join, robots fill the rest. Knock-out bracket:
   people play their matches, robot-only matches are ⏩ skipped (SB.simulate) or 👀 watched.
   Saved per device in sp_slabrall_cup:<Name> so a tournament can be finished later.
   Saves: every person in a match → saveFeats (stats + cupMatches); the winning people of the final get cups: 1. */
const CUP_NAMES = ['Thunder Paddles', 'Spin Wizards', 'Net Ninjas', 'Rally Rockets', 'Bouncy Beans', 'Lob Legends', 'Slice Squad', 'Zoom Zebras', 'Pickle Pals', 'Ace Owls', 'Turbo Toucans', 'Lucky Llamas', 'Comet Crew', 'Jelly Jets', 'Super Sloths', 'Dizzy Dragons'];
const CUP_COLS = ['#FF7A1A', '#3A86FF', '#06D6A0', '#FF4D8D', '#8338EC', '#FFC845', '#E63946', '#2EC4B6'];
const CUP_BOTS = ['Robo Rex', 'Bolt', 'Gizmo', 'Sprocket', 'Beep', 'Widget', 'Rusty', 'Nova', 'Chip', 'Pixel', 'Zap', 'Cog', 'Dot', 'Echo', 'Flux', 'Byte'];
let CUP = null, CS = null, cupRaf = 0;
function cupKey(){ return 'sp_slabrall_cup:' + (S.player || ''); }
function loadCup(){ try{ const c = JSON.parse(ls(cupKey()) || 'null'); return c && c.v === 1 && SB.SPORTS[c.sport] && Array.isArray(c.rounds) ? c : null; }catch(e){ return null; } }
function saveCup(){ ls(cupKey(), JSON.stringify(CUP)); }
function shuffle(a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function roundName(size, r){ const n = Math.log2(size) - r; return n === 1 ? 'Final' : n === 2 ? 'Semi-final' : 'Quarter-final'; }
function cupTargetText(c){ const sp = SB.SPORTS[c.sport], t = c.short ? sp.targets[0] : sp.targets[c.level]; return targetText(sp, c.level, t); }
function cupBtnLabel(){ const c = loadCup(); const t = $('cup-btn-t'), s = $('cup-btn-s'); if(!t) return;
  if(c && !c.done){ t.textContent = 'Continue tournament'; s.textContent = SB.SPORTS[c.sport].icon + ' ' + SB.SPORTS[c.sport].name + ' · ' + c.size + ' teams'; }
  else { t.textContent = 'Tournament'; s.textContent = '4 or 8 teams · bracket · trophy'; } }
function openCup(){
  CUP = loadCup();
  if(CUP && !CUP.done){ renderBracket(); showScreen('bracket'); return; }
  let lv = 0; for(let i = 0; i < 5; i++) if(canPlay(i)) lv = i;
  CS = {sport: SET.sport, fmt: 'single', size: 4, level: Math.min(1, lv), short: true, who: [S.player], names: shuffle(CUP_NAMES).slice(0, 8)};
  renderCupSetup(); showScreen('cup');
}
function cupChips(id, list, cur, pick){ const row = $(id); row.innerHTML = list.map(([k, n, lock]) => '<button class="chip' + (String(k) === String(cur) ? ' on' : '') + (lock ? ' lock' : '') + '" data-k="' + k + '" data-sound="' + (lock ? 'none' : 'tap') + '">' + n + '</button>').join('');
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { if(b.classList.contains('lock')){ UISound.play('error'); UI.toast('Win that level against the robot first to use it in a tournament'); return; } pick(b.dataset.k); renderCupSetup(); }); }
function cupPer(){ return CS.fmt === 'double' ? 2 : 1; }
function cupTeamsDraft(){
  const per = cupPer(), hs = CS.who.slice(), teams = [];
  for(let i = 0; i < CS.size; i++){ const m = []; for(let k = 0; k < per; k++) m.push(hs.length ? hs.shift() : null); teams.push({name: CS.names[i] || CUP_NAMES[i], members: m}); }
  return teams;
}
function renderCupSetup(){
  const sp = SB.SPORTS[CS.sport]; $('cup-sub').textContent = sp.icon + ' ' + sp.name + ' — knock-out: win and go to the next round. Last team standing lifts the 🏆!';
  cupChips('cup-fmt', [['single', '👤 Singles'], ['double', '👥 Doubles']], CS.fmt, k => { CS.fmt = k; CS.who = CS.who.slice(0, CS.size * cupPer()); });
  cupChips('cup-size', [[4, '4 teams'], [8, '8 teams']], CS.size, k => { CS.size = Number(k); CS.who = CS.who.slice(0, CS.size * cupPer()); });
  cupChips('cup-level', [0, 1, 2, 3, 4].map(i => [i, LEVEL_UI[i].emoji + ' ' + SB.LEVELS[i].name, !canPlay(i)]), CS.level, k => { CS.level = Number(k); });
  const tShort = targetText(sp, CS.level, sp.targets[0]), tNorm = targetText(sp, CS.level, sp.targets[CS.level]);
  cupChips('cup-len', [['short', '⚡ Short · ' + tShort.replace(/\.$/, '')], ['normal', '🏁 Normal · ' + tNorm.replace(/\.$/, '')]], CS.short ? 'short' : 'normal', k => { CS.short = k === 'short'; });
  const max = CS.size * cupPer(), names = S.players.map(p => p.Name);
  $('cup-who-note').textContent = 'Tap family players to add them (up to ' + max + '). Robots fill the empty places.' + (cupPer() > 1 ? ' Picked in pairs: 1st + 2nd are a team, 3rd + 4th…' : '');
  const row = $('cup-who'); row.innerHTML = names.map(n => { const i = CS.who.indexOf(n); return '<button class="chip' + (i >= 0 ? ' on' : '') + '" data-n="' + UI.esc(n) + '" data-sound="tap">' + (i >= 0 ? (i + 1) + ' · ' : '') + UI.esc(n) + (n === S.player ? ' (you)' : '') + '</button>'; }).join('');
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { const n = b.dataset.n, i = CS.who.indexOf(n);
    if(i >= 0){ if(n === S.player && CS.who.length === 1){ UI.toast('Someone has to play! 🙂'); return; } CS.who.splice(i, 1); }
    else { if(CS.who.length >= max){ UISound.play('error'); UI.toast('All ' + max + ' places are taken by people'); return; } CS.who.push(n); }
    renderCupSetup(); });
  const box = $('cup-teams'), teams = cupTeamsDraft();
  box.innerHTML = teams.map((t, i) => '<div class="cteam"><span class="dot" style="background:' + CUP_COLS[i] + '"></span><input maxlength="18" data-i="' + i + '" value="' + UI.esc(t.name) + '" aria-label="Team ' + (i + 1) + ' name"><span class="mem">' + t.members.map(m => m ? UI.esc(m) : '🤖').join(' + ') + '</span></div>').join('');
  box.querySelectorAll('input').forEach(inp => inp.oninput = () => { CS.names[Number(inp.dataset.i)] = inp.value.trim() || CUP_NAMES[Number(inp.dataset.i)]; });
  $('cup-names-btn').onclick = () => { CS.names = shuffle(CUP_NAMES).slice(0, 8); renderCupSetup(); };
  $('cup-go').onclick = drawCup;
}
function drawCup(){
  const draft = cupTeamsDraft(), bots = shuffle(CUP_BOTS); let bi = 0;
  const teams = draft.map((t, i) => ({name: t.name, col: CUP_COLS[i], members: t.members, bots: t.members.map(m => m ? null : bots[bi++ % bots.length])}));
  // people first, spread over different first-round matches; robots fill the rest
  const spread = CS.size === 8 ? [0, 2, 4, 6, 1, 3, 5, 7] : [0, 2, 1, 3], slots = new Array(CS.size).fill(-1);
  const people = shuffle(teams.map((t, i) => i).filter(i => teams[i].members.some(Boolean))), robots = shuffle(teams.map((t, i) => i).filter(i => !teams[i].members.some(Boolean)));
  people.concat(robots).forEach((ti, k) => { slots[spread[k]] = ti; });
  const rounds = []; let n = CS.size / 2;
  rounds.push(Array.from({length: n}, (_, m) => ({a: slots[m * 2], b: slots[m * 2 + 1], w: -1, sc: ''})));
  while(n > 1){ n /= 2; rounds.push(Array.from({length: n}, () => ({a: -1, b: -1, w: -1, sc: ''}))); }
  CUP = {v: 1, sport: CS.sport, level: CS.level, fmt: CS.fmt, size: CS.size, short: CS.short, theme: SET.theme, powers: SET.powers, teams, rounds, done: false, champ: -1, at: Date.now()};
  saveCup(); UISound.play('unlock'); renderBracket(); showScreen('bracket');
  if(FX) confetti(['🎲', '🏆', '🏓'], 14);
}
function newCup(){
  const go = () => { ls(cupKey(), ''); CUP = null; openCup(); };
  if(CUP && !CUP.done){ UI.confirm({icon: '🗑️', title: 'Start a new tournament?', body: 'This bracket will be thrown away.', okText: 'New tournament', cancelText: 'Keep it'}).then(ok => { if(ok) go(); }); }
  else go();
}
function nextMatch(){ if(!CUP) return null; for(let r = 0; r < CUP.rounds.length; r++) for(let m = 0; m < CUP.rounds[r].length; m++){ const x = CUP.rounds[r][m]; if(x.w < 0 && x.a >= 0 && x.b >= 0) return {r, m, x}; } return null; }
function hasPeople(ti){ return ti >= 0 && CUP.teams[ti].members.some(Boolean); }
function memberText(t){ return t.members.map((m, k) => m ? UI.esc(m) : '🤖 ' + UI.esc(t.bots[k])).join(' + '); }
function renderBracket(){
  if(!CUP) return; const sp = SB.SPORTS[CUP.sport];
  $('br-title').textContent = sp.icon + ' ' + sp.name + ' Cup'; slaLogoInto(document.querySelector('#scr-bracket .title .logo'), sp.id, 76);   // 🏷️ lg-1
  $('br-sub').textContent = (CUP.fmt === 'double' ? '👥 Doubles' : '👤 Singles') + ' · ' + CUP.size + ' teams · 🤖 ' + SB.LEVELS[CUP.level].name + ' robots · ' + cupTargetText(CUP);
  const nx = nextMatch(), T = CUP.teams;
  const row = (ti, x, side) => { if(ti < 0) return '<div class="bt tbd"><span class="dot" style="background:#ccc"></span><span class="n">waiting…</span></div>';
    const t = T[ti], cls = x.w < 0 ? '' : x.w === ti ? ' win' : ' lose', sc = x.sc ? x.sc.split('–')[side] : '';
    return '<div class="bt' + cls + '" title="' + memberText(t).replace(/"/g, '') + '"><span class="dot" style="background:' + t.col + '"></span><span class="n">' + UI.esc(t.name) + (hasPeople(ti) ? ' <span class="me">🙂</span>' : '') + '</span><span class="s">' + UI.esc(sc) + '</span></div>'; };
  let h = '';
  CUP.rounds.forEach((rd, r) => { h += '<div class="bcol"><h4>' + roundName(CUP.size, r) + (rd.length > 1 ? 's' : '') + '</h4>' + rd.map((x, m) => '<div class="bm' + (nx && nx.r === r && nx.m === m ? ' cur' : '') + '" data-r="' + r + '" data-m="' + m + '">' + row(x.a, x, 0) + row(x.b, x, 1) + '</div>').join('') + '</div>'; });
  h += '<div class="bchamp' + (CUP.done ? ' won' : '') + '"><div class="tro">🏆</div><div>' + (CUP.done ? UI.esc(T[CUP.champ].name) : 'Champion?') + '</div></div>';
  $('bracket').innerHTML = h;
  const card = $('br-next'); cancelAnimationFrame(cupRaf);
  if(CUP.done){
    const t = T[CUP.champ];
    card.innerHTML = '<h3>🏆 Champions!</h3><canvas id="cup-cv" width="720" height="360"></canvas><div class="vsl">' + UI.esc(t.name) + '</div><div class="note">' + memberText(t) + '</div><div class="btns" style="margin-top:10px"><button class="btn sp-btn sp-primary" data-sound="pop" onclick="newCup()">🏆 New tournament</button></div>';
    champLoop();
    return;
  }
  if(!nx){ card.innerHTML = ''; return; }
  const A = T[nx.x.a], B = T[nx.x.b], people = hasPeople(nx.x.a) || hasPeople(nx.x.b), alive = CUP.teams.some((t, i) => hasPeople(i) && !lostAlready(i));
  card.innerHTML = '<h3>' + roundName(CUP.size, nx.r) + ' · next match</h3><div class="vsl"><span style="color:' + A.col + '">●</span> ' + UI.esc(A.name) + ' <small>vs</small> ' + UI.esc(B.name) + ' <span style="color:' + B.col + '">●</span></div>' +
    '<div class="note" style="margin-bottom:10px">' + memberText(A) + ' &nbsp;vs&nbsp; ' + memberText(B) + '</div><div class="btns">' +
    (people ? '<button class="btn sp-btn sp-primary" id="cup-play" data-sound="pop">🏓 Play!</button>' : '<button class="btn sp-btn sp-primary" id="cup-skip" data-sound="pop">⏩ Skip — robots play</button><button class="btn soft sp-btn sp-secondary" id="cup-watch" data-sound="tap">👀 Watch</button>' + (alive || nextRobotRun() > 1 ? '<button class="btn soft sp-btn sp-secondary" id="cup-skipall" data-sound="tap">⏩⏩ ' + (alive ? 'Skip to my next match' : 'Skip to the end') + '</button>' : '')) + '</div>';
  if($('cup-play')) $('cup-play').onclick = () => playCupMatch(false);
  if($('cup-watch')) $('cup-watch').onclick = () => playCupMatch(true);
  if($('cup-skip')) $('cup-skip').onclick = e => skipRobots(e.currentTarget, false);
  if($('cup-skipall')) $('cup-skipall').onclick = e => skipRobots(e.currentTarget, true);
}
function lostAlready(ti){ return CUP.rounds.some(rd => rd.some(x => x.w >= 0 && (x.a === ti || x.b === ti) && x.w !== ti)); }
function nextRobotRun(){ let n = 0; for(const rd of CUP.rounds) for(const x of rd) if(x.w < 0 && x.a >= 0 && x.b >= 0 && !hasPeople(x.a) && !hasPeople(x.b)) n++; return n; }
function recordCup(r, m, winTeam, sc){
  const x = CUP.rounds[r][m]; x.w = winTeam; x.sc = sc;
  if(r + 1 < CUP.rounds.length){ const nx = CUP.rounds[r + 1][m >> 1]; if(m % 2) nx.b = winTeam; else nx.a = winTeam; }
  else { CUP.done = true; CUP.champ = winTeam; }
  saveCup();
}
function cupPlayers(x){ const per = CUP.fmt === 'double' ? 2 : 1, list = []; for(let k = 0; k < per; k++){ list.push({ti: x.a, k, side: 0}); list.push({ti: x.b, k, side: 1}); } return list; }
function simCup(nx){
  const sp = SB.SPORTS[CUP.sport], players = cupPlayers(nx.x).map(q => ({side: q.side}));
  const M = SB.simulate({sport: CUP.sport, level: CUP.level, powers: CUP.powers, target: CUP.short ? sp.targets[0] : 0, seed: (Date.now() & 0xffff) + nx.r * 31 + nx.m, players}, 2400);
  let w = M.score.winner; const pts = s => sp.scoring === 'tennis' ? M.score.games[s] : M.score.pts[s];
  if(!M.score.done || w < 0) w = pts(0) === pts(1) ? (Math.random() < 0.5 ? 0 : 1) : pts(0) > pts(1) ? 0 : 1;
  recordCup(nx.r, nx.m, w === 0 ? nx.x.a : nx.x.b, pts(0) + '–' + pts(1));
  return w === 0 ? nx.x.a : nx.x.b;
}
function skipRobots(btn, all){
  UI.busy(btn, 'sla-brall', 'Robots playing…');
  setTimeout(() => {
    let last = null, n = 0;
    while(true){ const nx = nextMatch(); if(!nx || hasPeople(nx.x.a) || hasPeople(nx.x.b)) break; const a = nx.x.a, b = nx.x.b, w = simCup(nx); last = {w, l: w === a ? b : a, sc: nx.x.sc}; n++; if(!all) break; }
    UI.idle(btn); renderBracket(); UISound.play('pop');
    if(last) UI.toast('🤖 ' + CUP.teams[last.w].name + ' beat ' + CUP.teams[last.l].name + ' ' + last.sc + (n > 1 ? ' (+' + (n - 1) + ' more)' : ''));
  }, FX ? 450 : 0);
}
function playCupMatch(watch){
  const nx = nextMatch(); if(!nx) return; const sp = SB.SPORTS[CUP.sport];
  const flip = !hasPeople(nx.x.a) && hasPeople(nx.x.b);   // people play from the near side
  const seats = [], list = cupPlayers(nx.x).map(q => ({ti: q.ti, k: q.k, side: flip ? 1 - q.side : q.side}));
  list.sort((p, q) => p.k - q.k || p.side - q.side);
  list.forEach(q => { const t = CUP.teams[q.ti], n = t.members[q.k]; seats.push(n ? {name: n, side: q.side, human: true} : {name: t.bots[q.k], side: q.side, human: false}); });
  const hs = seats.filter(s => s.human);
  if(hs.length === 1) hs[0].seat = -1; else { let a = 0, b = 1; hs.forEach(s => { if(s.side === 0){ s.seat = a; a += 2; } else { s.seat = b; b += 2; } }); }
  const ta = CUP.teams[flip ? nx.x.b : nx.x.a], tb = CUP.teams[flip ? nx.x.a : nx.x.b];
  startMatch({seats, sport: CUP.sport, level: CUP.level, theme: CUP.theme, powers: CUP.powers, target: CUP.short ? sp.targets[0] : 0, names: [ta.name, tb.name], round: roundName(CUP.size, nx.r), r: nx.r, m: nx.m, flip, watch});
}
function cupFinish(win, secs, scoreFor){
  const M = G.M, c = G.cup, sp = G.sp, st = M.stats, x = CUP.rounds[c.r][c.m];
  const winTeam = (win === 0) !== c.flip ? x.a : x.b;
  const pts = s => sp.scoring === 'tennis' ? M.score.games[s] : M.score.pts[s];
  const sa = c.flip ? pts(1) : pts(0), sb = c.flip ? pts(0) : pts(1);
  recordCup(c.r, c.m, winTeam, sa + '–' + sb);
  const final = CUP.done, humans = M.players.filter(p => p.human), peopleWon = humans.some(p => p.side === win);
  if(FX) confetti(final ? ['🏆', '🎉', '⭐', '🥇', '🏓'] : peopleWon ? ['🏓', '⭐', '🎉'] : ['🏓'], final ? 44 : peopleWon ? 24 : 6);
  UISound.play(peopleWon || !humans.length ? 'success' : 'error');
  const wt = CUP.teams[winTeam];
  const head = final ? '<div class="big">🏆</div><h2 class="cheer">' + UI.esc(wt.name) + ' win the ' + UI.esc(sp.name) + ' Cup!</h2>'
    : '<div class="big">' + (peopleWon ? '🎉' : humans.length ? '🤖' : '🏓') + '</div><h2' + (peopleWon ? ' class="cheer"' : '') + '>' + UI.esc(wt.name) + ' go through!</h2>';
  const tip = humans.length && !peopleWon ? '<div class="note">💡 Out of the cup this time — start a new tournament and try again!</div>' : '';
  showResult(head + '<div class="score-big">' + (c.flip ? sb + ' – ' + sa : sa + ' – ' + sb) + '</div>' +
    '<div class="stats"><span>🔁 best rally ' + Math.max(st[0].rally, st[1].rally) + '</span><span>💥 ' + st[0].smash + ' smashes</span><span>⏱ ' + fmt(secs * 1000) + '</span></div>' + tip +
    '<div class="save-note" id="save-note">' + (humans.some(p => p.name !== 'Guest') ? '💾 Saving…' : '') + '</div>' +
    '<div class="res-btns"><button class="btn sp-btn sp-primary" data-sound="pop" onclick="backToBracket()">🏆 ' + (final ? 'See the champions' : 'Back to the bracket') + '</button></div>');
  NOTES.length = 0;
  humans.forEach((p, seat) => {
    if(p.name === 'Guest') return; const s = st[p.side], won = p.side === win;
    const stats = {wins: won ? 1 : 0, rally: s.rally, smash: s.smash, aces: s.aces, perfect: s.perfect, powers: s.powers, legend: s.legend, goals: s.goals, jumpHits: s.jumpHits, jumpPerfect: s.jumpPerfect, diveSaves: s.diveSaves, matches: 1, cupMatches: 1};
    stats['win_' + sp.id] = won ? 1 : 0; if(final && won) stats.cups = 1;
    saveFeatsOnly(p.name, stats, seat);
  });
}
function backToBracket(){ if(window.Cheer) Cheer.unmount(); if(G) cancelAnimationFrame(G.raf); G = null; hideResult(); $('pads').innerHTML = ''; CUP = loadCup(); renderBracket(); showScreen('bracket'); }
function champLoop(){
  const cv = $('cup-cv'); if(!cv || !CUP || !CUP.done) return; const g = cv.getContext('2d'), t = CUP.teams[CUP.champ], sp = SB.SPORTS[CUP.sport];
  const avs = t.members.map((m, k) => m ? withRacket(myAvatar(m === 'Guest' ? 'Guest' : m), m) : robotAvatar(t.bots[k], sp)), cheer = gestOf('cheer');
  const t0 = performance.now();
  const tick = now => {
    if(!$('cup-cv') || $('scr-bracket').classList.contains('hidden')) return;
    const s = (now - t0) / 1000; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    const grd = g.createLinearGradient(0, 0, 0, cv.height); grd.addColorStop(0, 'rgba(255,200,69,0.35)'); grd.addColorStop(1, 'rgba(255,122,26,0.05)'); g.fillStyle = grd; g.fillRect(0, 0, cv.width, cv.height);
    for(let i = 0; i < 18; i++){ const a = i * 0.35 + s * 0.4; g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(360, 380); g.arc(360, 380, 520, a, a + 0.12); g.fill(); }
    g.fillStyle = '#C9A227'; g.fillRect(170, 318, 380, 42); g.fillStyle = '#E8C547'; g.fillRect(195, 300, 330, 22);
    const n = avs.length; avs.forEach((av, i) => { const x = n === 1 ? 330 : 250 + i * 220; drawAvatar(g, {name: t.members[i] || t.bots[i], av, dir: 1, walkT: 0, gest: {g: cheer, t: (s + i * 0.3) % (cheer.d || 1.6)}}, x, 304, 1.75, {t: s}); });
    emo(g, '🏆', n === 1 ? 520 : 360, 90 + Math.sin(s * 3) * 12, 96);
    if(Math.random() < 0.2){ /* sparkle */ g.fillStyle = '#fff'; g.fillRect(Math.random() * 720, Math.random() * 200, 4, 4); }
    cupRaf = requestAnimationFrame(tick);
  };
  cupRaf = requestAnimationFrame(tick);
}

// 🪶 shuttle feathers (sb2-2): owned count from the server (Collection line "feather"), pick per person per device; the feather of whoever hit it last
function ownedFeathers(name){ return Math.min(BallSkins.featherCount, Number((S.feathers || {})[name || S.player]) || 0); }
function featherOf(name){ if(!name || name === 'Guest') return -1; const have = ownedFeathers(name), raw = ls('sp_feather:' + name); if(raw == null || raw === '') return have > 0 ? 0 : -1; const v = Number(raw); return Number.isFinite(v) && v >= 0 && v < have ? v : -1; }
function featherFor(b){ const p = b && b.by != null && b.by >= 0 ? G.M.players[b.by] : G.M.players.find(q => q.human); return p && G.feathers ? G.feathers[p.i] : -1; }
function buildFeathers(){
  const box = $('feather-list'); if(!box) return; const have = ownedFeathers(), cur = featherOf(S.player); box.innerHTML = '';
  for(let v = -1; v < BallSkins.featherCount; v++){
    const b = document.createElement('button'), lock = v >= have; b.className = 'ballc trl' + (cur === v ? ' on' : '') + (lock ? ' lock' : ''); b.dataset.v = v; b.setAttribute('data-sound', lock ? 'none' : 'tap');
    const c = document.createElement('canvas'); c.width = 128; c.height = 88; b.appendChild(c); b.insertAdjacentHTML('beforeend', (lock ? '🔒 ' : '') + (v < 0 ? 'Classic white' : UI.esc(BallSkins.FEATHERS[v])));
    BallSkins.drawFeatherPreview(c.getContext('2d'), v, 128, 88, 1.2);
    b.onclick = () => { if(lock){ UISound.play('error'); UI.toast('Win 🏸 SlaBam matches to unlock more feathers — see 📖 Collection'); return; } ls('sp_feather:' + S.player, String(v)); box.querySelectorAll('.ballc').forEach(x => x.classList.toggle('on', x === b)); };
    box.appendChild(b);
  }
  const wrap = $('feather-wrap'); if(wrap) wrap.style.display = SET.sport === 'slabam' ? '' : 'none';
}

// ☄️ ball trails (round 2): owned count from the server (Collection line "balltrail"), pick per person per device
function ownedTrails(name){ return Math.min(BallSkins.trailCount, Number((S.ballTrails || {})[name || S.player]) || 0); }
function trailOf(name){ if(!name || name === 'Guest') return -1; const have = ownedTrails(name), raw = ls('sp_balltrail:' + name); if(raw == null || raw === '') return have > 0 ? 0 : -1; const v = Number(raw); return Number.isFinite(v) && v >= 0 && v < have ? v : -1; }
function buildTrails(){
  const box = $('trail-list'), have = ownedTrails(), cur = trailOf(S.player); box.innerHTML = '';
  for(let v = -1; v < BallSkins.trailCount; v++){
    const b = document.createElement('button'), lock = v >= have; b.className = 'ballc trl' + (cur === v ? ' on' : '') + (lock ? ' lock' : ''); b.dataset.v = v; b.setAttribute('data-sound', lock ? 'none' : 'tap');
    const c = document.createElement('canvas'); c.width = 128; c.height = 88; b.appendChild(c); b.insertAdjacentHTML('beforeend', lock ? '🔒 ' + UI.esc(BallSkins.TRAILS[v]) : v < 0 ? 'Spin colours' : UI.esc(BallSkins.TRAILS[v]));
    const g = c.getContext('2d');
    if(v < 0){ g.fillStyle = '#2C6FB0'; g.beginPath(); g.roundRect ? g.roundRect(0, 0, 128, 88, 14) : g.rect(0, 0, 128, 88); g.fill(); const pts = []; for(let i = 0; i < 12; i++){ const u = i / 11; pts.push([16 + u * 84, 66 - Math.sin(u * 2.7) * 36]); } pts.forEach((q, i) => { g.fillStyle = 'rgba(255,80,60,' + (i / 12 * 0.6) + ')'; g.beginPath(); g.arc(q[0], q[1], 3 + i * 0.6, 0, 7); g.fill(); }); g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.arc(100, 66 - Math.sin(2.7) * 36, 9, 0, 7); g.fill(); g.stroke(); }
    else BallSkins.drawTrailPreview(g, v, 128, 88, 1.2);
    b.onclick = () => { if(lock){ UISound.play('error'); UI.toast('Win SlaBrall matches and tournaments to unlock more trails — see 📖 Collection'); return; } ls('sp_balltrail:' + S.player, String(v)); box.querySelectorAll('.ballc').forEach(x => x.classList.toggle('on', x === b)); };
    box.appendChild(b);
  }
}

/* ================= 🏏 BATSTICK (bs-1) — your racket is your Batstick: the shared designer in AvatarKit (A shape · B sticker · C colours · D pattern) ================= */
function ownedBats(name){ return Number((S.batsOwned || {})[name || S.player]) || 0; }
function openRacket(){
  BatStick.open({name: S.player, design: racketOf(S.player), ownedRacket: ownedRackets(S.player), ownedBat: ownedBats(S.player), av: myAvatar(S.player), title: 'My Batstick',
    onSave: d => { S.settings['Racket_' + S.player] = JSON.stringify(d); buildSeats();
      google.script.run.withSuccessHandler(() => UI.toast('🏏 Batstick saved!', 'ok')).withFailureHandler(() => UI.toast('Saved on this device — will sync next time', 'err')).saveBatstick(S.player, d); }});
}

/* ================= ⌨️ KEYS (per seat, per device) ================= */
function keyName(code){ if(!code) return '—'; return code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'Num ').replace('Arrow', '').replace('Quote', "'").replace('Semicolon', ';').replace('Backslash', '\\').replace('ShiftRight', 'R-Shift').replace('PageDown', 'PgDn').replace('PageUp', 'PgUp'); }
function loadKeys(){ let k = null; try{ k = JSON.parse(ls('sp_slabrall_keys') || 'null'); }catch(e){} return DEFAULT_KEYS.map((d, i) => Object.assign({}, d, (k && k[i]) || {})); }
function saveKeys(){ ls('sp_slabrall_keys', JSON.stringify(KEYS)); }
let keyWait = null;
function openKeys(){ renderKeys(); $('keys-sheet').classList.remove('hidden'); }
function closeKeys(){ keyWait = null; $('keys-sheet').classList.add('hidden'); if(!$('scr-menu').classList.contains('hidden')) buildSeats(); }   /* 🧱 b3w5 */
function resetKeys(){ KEYS = DEFAULT_KEYS.map(d => Object.assign({}, d)); saveKeys(); renderKeys(); }
function renderKeys(){
  $('keys-table').innerHTML = ACTIONS.map(([a, n]) => '<div class="krow"><span>' + n + '</span>' + KEYS.map((K, s) => '<button class="keybtn' + (keyWait && keyWait.s === s && keyWait.a === a ? ' wait' : '') + '" data-s="' + s + '" data-a="' + a + '" title="' + SEAT_LABEL[s] + '">' + (keyWait && keyWait.s === s && keyWait.a === a ? '…' : UI.esc(keyName(K[a]))) + '</button>').join('') + '</div>').join('');
  $('keys-table').insertAdjacentHTML('afterbegin', '<div class="krow"><span></span>' + SEAT_LABEL.map(s => '<span>' + s + '</span>').join('') + '</div>');
  $('keys-table').querySelectorAll('.keybtn').forEach(b => b.onclick = () => { keyWait = {s: Number(b.dataset.s), a: b.dataset.a}; renderKeys(); });
}
function takeKey(e){
  if(!keyWait) return false; e.preventDefault(); if(e.code === 'Escape'){ keyWait = null; renderKeys(); return true; }
  const {s, a} = keyWait, old = KEYS[s][a];
  KEYS.forEach((K, si) => Object.keys(K).forEach(k => { if(K[k] === e.code && !(si === s && k === a)) K[k] = old; }));   // swap on duplicate
  KEYS[s][a] = e.code; keyWait = null; saveKeys(); renderKeys(); UISound.play('key'); return true;
}

/* ================= MATCH ================= */
function startMatch(cfg){
  if(SlaCover) SlaCover.hide();   /* 🧱 b3w5 */
  hideResult(); savePrefs();
  if(!cfg || !cfg.seats) cfg = null;   // cfg = a 🏆 tournament match (see playCupMatch) or a 📡 linked match (cfg.link, lk-1b)
  const cup = cfg && !cfg.link ? cfg : null, lnk = cfg && cfg.link ? cfg : null;
  const sp = SB.SPORTS[cfg ? cfg.sport : SET.sport], seats = cfg ? cfg.seats : [], level = cfg ? cfg.level : SET.level, theme = cfg ? cfg.theme : SET.theme, powers = cfg ? cfg.powers : SET.powers;
  if(cfg){}
  else if(SET.mode === 'robot') seats.push({name: S.player, side: 0, human: true, seat: 0}, {name: 'Robot', side: 1, human: false});
  else if(SET.mode === 'duo') seats.push({name: S.player, side: 0, human: true, seat: 0}, {name: SET.opp || 'Guest', side: 1, human: true, seat: 1});
  else { const T = SET.team; seats.push({name: S.player, side: 0, human: true, seat: 0}, {name: T[0] || 'Robot', side: 1, human: !!T[0], seat: 1}, {name: T[1] || 'Robot 2', side: 0, human: !!T[1], seat: 2}, {name: T[2] || 'Robot 3', side: 1, human: !!T[2], seat: 3}); }
  // robots wear their own racket colours; people bring theirs
  const avs = seats.map(s => s.human ? withRacket(myAvatar(s.name === 'Guest' ? 'Guest' : s.name), s.name) : robotAvatar(s.name, sp));
  const M = SB.newMatch({sport: sp.id, level, theme, powers, target: cfg ? cfg.target : 0, seed: lnk ? lnk.seed : (Date.now() & 0xffffff) ^ 0x5b, players: seats.map((s, i) => ({name: s.name, side: s.side, human: s.human, av: avs[i]}))});
  M.autoServe = 5;
  const humans = M.players.filter(p => p.human);
  humans.forEach(p => { const s = seats[p.i]; p.seat = cfg ? s.seat : SET.mode === 'robot' ? -1 : s.seat; if(lnk){ p.remote = !!s.remote; p.lseat = s.lseat; } });   // -1 = alone: every key set drives you · 📡 remote = played on another device
  G = {M, sp, mode: lnk ? 'link' : cfg ? 'cup' : SET.mode, cup, level, theme, ball: lnk ? lnk.ball : SET.ball,
    link: lnk ? {role: lnk.role, id: lnk.id, host: lnk.host} : null, lk: lnk ? {buf: [], evq: [], trails: new Map(), off: null, snapAt: 0, inAt: 0, ix: 0, iy: 0, lastAt: performance.now(), hintAt: 0, pz: 0, evs: []} : null, trails: M.players.map(p => p.human ? trailOf(p.name) : -1), feathers: M.players.map(p => p.human ? featherOf(p.name) : -1), th: new Map(), t0: performance.now(), last: 0, acc: 0, paused: false, over: false, raf: 0,
    held: new Set(), seats, fx: [], bounces: [], deco: makeDeco(theme), lastServeHint: '', pointers: new Map(), startAt: performance.now(), anim: 0,
    view: viewFor(M), help: SET.help !== false, aimTold: false,
    comics: !!FX && !lnk && M.players.some(p => p.human && Comic.enabled(p.name)), /* 📡 linked: no comic pauses (they would stop every device) */ plog: newPlog(), mlog: [], nextStrip: 2 + Math.floor(Math.random() * 3), lastImpact: -99, camY: 0};
  cheerMount();   // 📣 cs-1: the crowd for this match (Off = nothing)
  calloutSetup();   /* 💬 24t */
  BAR.level(cup ? '🏆 ' + cup.round : sp.icon + ' ' + sp.name + ' · ' + LEVEL_UI[level].emoji + ' ' + SB.LEVELS[level].name, SB.LEVELS[level].hardcore ? 'hc' : '');
  G.tn = [teamName(0), teamName(1)];   // 🎛️ p1c: the two sides = two player cards (🧡 left · 🩵 right, a letter badge on small phones), the server glows
  BAR.players([0, 1].map(i => ({k: i, av: (Array.from(G.tn[i] || '?')[0] || '?').toUpperCase(), name: G.tn[i], score: 0, col: i ? '#18B8A6' : '#FF7A1A'})));
  showScreen('play'); resize(); buildPads(); hud();
  banner((cup ? '🏆 ' + cup.round + ' — ' : lnk ? '📡 ' : sp.icon + ' ' + sp.name + ' — ') + targetText(sp, level, M.target), 'good');
  if(FX) say((cup ? cup.round : sp.name) + '! ' + targetText(sp, level, M.target));
  G.last = performance.now(); G.raf = requestAnimationFrame(frame);
}
function robotAvatar(name, sp){ const a = defaultAvatar(name + '·bot'); a.eq = a.eq || {}; const v = sp.id === 'slashot' ? 3 : sp.id === 'slapong' ? 1 : sp.id === 'slapoof' ? 0 : 2; a.eq.hand = {id: 'racket', v, o: racketDesign(v, {c1: '#8D99AE', c2: '#2B2D42'})}; return a; }
function teamName(side){ if(G.cup) return G.cup.names[side]; const t = G.M.players.filter(p => p.side === side); return t.map(p => p.name).join(' + '); }

/* ---------- view: world (metres-ish) → screen ---------- */
function sideView(W0, H0, sp, box){   // ⚽ the old 2.5D side view — kept for a later soccer game (sb2-1: not used by SlaBrall any more)
  box = box || {l: 0, r: 0, t: 0, b: 0}; const W = W0 - box.l - box.r, H = H0 - box.t - box.b;
  // landscape: watched from the side, a little to the left (skew) so the net shows as a band; portrait: from behind the near player
  const portrait = H > W * 1.05, pad = sp.kind === 'puck' ? 1.6 : sp.table ? 3.9 : 3.2;
  const L = sp.Lh + pad, Wd = sp.Wh + (sp.kind === 'puck' ? 1.0 : 2.0), zk = 0.92, K = portrait ? 0 : 0.2;
  let s, tilt;
  if(portrait){ tilt = 0.78; s = Math.min(W / (2 * Wd), (H - 40) / (2 * L * tilt + 3.2)); }
  else { s = W / (2 * L + 2 * Wd * K); tilt = Math.max(0.42, Math.min(0.8, (H - 3.4 * s) / (2 * Wd * s))); if(2 * Wd * tilt * s + 3.4 * s > H){ s = H / (2 * Wd * tilt + 3.4); } }
  const cx = box.l + W / 2, cy = box.t + H / 2 + (portrait ? s * 0.6 : s * 0.9);
  const P = portrait ? (x, y, z) => [cx + y * s, cy - x * s * tilt - (z || 0) * s * zk] : (x, y, z) => [cx + x * s + y * s * K, cy + y * s * tilt - (z || 0) * s * zk];
  const inv = portrait ? (px, py) => ({x: -(py - cy) / (s * tilt), y: (px - cx) / s}) : (px, py) => { const y = (py - cy) / (s * tilt); return {x: (px - cx - y * s * K) / s, y}; };
  return {mode: 'side', W: W0, H: H0, s, portrait, tilt, zk, P, inv, cx, cy, depth: portrait ? (x, y) => -x : (x, y) => y, sc: () => s, k2w: portrait ? (sx, sy) => ({x: -sy, y: sx}) : (sx, sy) => ({x: sx, y: sy})};
}
/* ---------- 📷 views (sb2-1, Aowu 2026-11-10: "the side 2.5D is too hard for the eyes to judge depth") ----------
   'behind' = 1 person: a camera behind + above that person's baseline, tilted down (true perspective: near = big, far = small)
   'top'    = 2+ people / watching robots: straight-ish down, both halves the same size (fair) — landscape left ↔ right, phone upright bottom ↕ top
   Every view gives: P(x, y, z) → [px, py] · inv(px, py) → ground {x, y} · depth(x, y) (bigger = nearer, drawn later) · sc(x, y, z) = pixels per metre there
   · k2w(sx, sy) = a screen direction (keys / stick) → a world direction · mode · portrait. World: x along the court (side 0 at x < 0), y across, z up. */
function makeView(W0, H0, sp, box, mode, camSide){
  box = box || {l: 0, r: 0, t: 0, b: 0};
  if(mode === 'side') return sideView(W0, H0, sp, box);
  if(mode === 'iso') return isoView(W0, H0, sp, box);
  return mode === 'behind' ? behindView(W0, H0, sp, box, camSide ? 1 : 0) : topView(W0, H0, sp, box);
}
// 🧱 sb2-2 isometric room: the front wall (x = +L) is the upper-right wall, the left side wall (y = +W) the upper-left one; nearer = lower on screen
function isoView(W0, H0, sp, box){
  const W = W0 - box.l - box.r, H = H0 - box.t - box.b, c = 0.866, k = 0.5, zk = 0.95, L = sp.Lh, Wd = sp.Wh, h = sp.wallH || 3;
  const raw = (x, y, z) => [(x - y) * c, -(x + y) * k - (z || 0) * zk];
  const pts = [[-L - 0.5, -Wd - 0.5, 0], [L + 0.4, -Wd - 0.5, 0], [-L - 0.5, Wd + 0.4, 0], [L, Wd, h + 0.3], [L, -Wd, h + 0.3], [-L, Wd, h + 0.3], [-L - 0.3, -Wd - 0.3, 2.4]].map(q => raw(q[0], q[1], q[2]));
  const u0 = Math.min(...pts.map(q => q[0])), u1 = Math.max(...pts.map(q => q[0])), v0 = Math.min(...pts.map(q => q[1])), v1 = Math.max(...pts.map(q => q[1]));
  const s = Math.min(W / (u1 - u0), H / (v1 - v0)) * 0.98, ox = box.l + W / 2 - (u0 + u1) / 2 * s, oy = box.t + H / 2 - (v0 + v1) / 2 * s;
  const P = (x, y, z) => { const q = raw(x, y, z); return [ox + q[0] * s, oy + q[1] * s]; };
  const inv = (px, py) => { const u = (px - ox) / (s * c), v = -(py - oy) / (s * k); return {x: (u + v) / 2, y: (v - u) / 2}; };
  const k2w = (dx, dy) => { const a = dx / c, b = -dy / k, wx = (a + b) / 2, wy = (b - a) / 2, m = Math.hypot(wx, wy), n = Math.hypot(dx, dy); return m > 1e-6 ? {x: wx / m * n, y: wy / m * n} : {x: 0, y: 0}; };
  return {mode: 'iso', W: W0, H: H0, s, portrait: H0 > W0 * 1.05, tilt: k, zk, P, inv, sc: () => s, depth: (x, y) => -(x + y), k2w};
}
function behindView(W0, H0, sp, box, cs){
  const W = W0 - box.l - box.r, H = H0 - box.t - box.b, L = sp.Lh, Wd = sp.Wh, puck = sp.kind === 'puck', tab = !!sp.table, sx = cs ? -1 : 1;
  // sb2-1b "bigger court": the camera is SEARCHED for this screen — the biggest court that still looks 3D (far end 50–66 % of the near end) with heads inside
  const m = tab ? 0.5 : puck ? 0.4 : 1, mxN = m * 1.4, mxF = m * 0.5, my = m * 0.6, hd = tab ? 1.5 : 2.4, base = tab ? 1.2 : 1;
  const cam = (ch, db, look) => { const camX = -L - db, a = Math.atan2(ch, db + L * look), ca = Math.cos(a), sa = Math.sin(a);
    const raw = (x, y, z) => { const dx = x * sx - camX, dz = (z || 0) - ch, dep = Math.max(0.3, dx * ca - dz * sa), v = dx * sa + dz * ca; return [y * sx / dep, -v / dep, dep]; };
    return {ch, camX, ca, sa, raw}; };
  const fit = c => { const pts = [[-L - mxN, -Wd - my, 0], [-L - mxN, Wd + my, 0], [L + mxF, -Wd - my, 0], [L + mxF, Wd + my, 0], [L + mxF, 0, hd], [-L, 0, hd]].map(q => c.raw(q[0] * sx, q[1], q[2]));
    const u0 = Math.min(...pts.map(q => q[0])), u1 = Math.max(...pts.map(q => q[0])), v0 = Math.min(...pts.map(q => q[1])), v1 = Math.max(...pts.map(q => q[1]));
    return {F: Math.min(W / (u1 - u0), H / (v1 - v0)), u0, u1, v0, v1}; };
  const key = [W, H, L, Wd, tab, puck, sp.net || 0].map(v => typeof v === 'number' ? Math.round(v) : v).join('|');
  let best = CAM_CACHE.get(key);
  if(!best){
    // sb2-2: a tall net (🏸 1.55 m) must not hide the far half — its top stays below the middle of the far half on screen
    for(const netK of [0.5, 0.25, -1]) { if(best) break; for(let chk = 0.3; chk <= 3.01; chk += 0.15) for(let dbk = 0; dbk <= 3.01; dbk += 0.15) for(const look of [0.7, 0.95, 1.2]){
      const c = cam(L * chk + base, L * dbk + 0.6, look), near = c.raw(-L * sx, 0, 0)[2], far = c.raw(L * sx, 0, 0)[2], ratio = near / far;
      if(ratio < 0.5 || ratio > 0.66) continue;
      if(sp.net && !tab && netK >= 0 && c.raw(0, 0, sp.net)[1] < c.raw(L * netK * sx, 0, 0)[1]) continue;
      const f = fit(c), q = [[-L, -Wd], [L, -Wd], [L, Wd], [-L, Wd]].map(([x, y]) => c.raw(x * sx, y, 0)).map(p => [p[0] * f.F, p[1] * f.F]);
      let A = 0; for(let i = 0; i < 4; i++){ const a = q[i], b = q[(i + 1) % 4]; A += a[0] * b[1] - b[0] * a[1]; }
      if(!best || Math.abs(A) > best.A) best = {A: Math.abs(A), ch: c.ch, db: L * dbk + 0.6, look};
    } }
    if(!best) best = {ch: L * 0.9 + base, db: L * 0.4 + 0.6, look: 1};
    CAM_CACHE.set(key, best);
  }
  const C = cam(best.ch, best.db, best.look), f = fit(C), F = f.F * 0.98, raw = C.raw, ca = C.ca, sa = C.sa, ch = C.ch, camX = C.camX;
  const ox = box.l + W / 2 - (f.u0 + f.u1) / 2 * F, oy = box.t + H / 2 - (f.v0 + f.v1) / 2 * F;
  let fol = 0;   // 📷 sb2-3 camera follow: a sideways shift of the camera (world y), set every frame by V.follow(y)
  const P = (x, y, z) => { const q = raw(x, y - fol, z); return [ox + q[0] * F, oy + q[1] * F]; };
  const inv = (px, py) => { const Bv = (py - oy) / F * -1, dx = ch * (ca + Bv * sa) / Math.max(1e-4, sa - Bv * ca), dep = dx * ca + ch * sa, xs = camX + dx; return {x: xs * sx, y: (px - ox) / F * dep * sx + fol}; };
  const sc = (x, y, z) => F / raw(x, y, z)[2];
  return {mode: 'behind', camSide: cs, W: W0, H: H0, s: sc(0, 0, 0), portrait: H0 > W0 * 1.05, tilt: sa, P, inv, sc, F, follow: y => { fol = y; },
    depth: (x, y) => -x * sx, k2w: (dx, dy) => ({x: -dy * sx, y: dx * sx})};
}
const CAM_CACHE = new Map();
function topView(W0, H0, sp, box){
  const W = W0 - box.l - box.r, H = H0 - box.t - box.b, portrait = H > W * 1.05, puck = sp.kind === 'puck', tab = !!sp.table;
  const padL = puck ? 0.7 : tab ? 1.7 : 1.4, padW = puck ? 0.4 : tab ? 1.0 : 1.0,   /* sb2-1b: smaller margins = bigger court */ L = sp.Lh + padL, Wd = sp.Wh + padW, tilt = 0.86, zk = 0.42, head = 2.6 * zk;
  let s, cx = box.l + W / 2, cy;
  if(portrait){ s = Math.min(W / (2 * Wd), H / (2 * L * tilt + head)); cy = box.t + H / 2 + s * head / 2; }
  else { s = Math.min(W / (2 * L), H / (2 * Wd * tilt + head)); cy = box.t + H / 2 + s * head / 2; }
  const P = portrait ? (x, y, z) => [cx + y * s, cy - x * s * tilt - (z || 0) * s * zk] : (x, y, z) => [cx + x * s, cy + y * s * tilt - (z || 0) * s * zk];
  const inv = portrait ? (px, py) => ({x: -(py - cy) / (s * tilt), y: (px - cx) / s}) : (px, py) => ({x: (px - cx) / s, y: (py - cy) / (s * tilt)});
  return {mode: 'top', W: W0, H: H0, s, portrait, tilt, zk, P, inv, cx, cy, sc: () => s,
    depth: portrait ? (x, y) => -x : (x, y) => y, k2w: portrait ? (dx, dy) => ({x: -dy, y: dx}) : (dx, dy) => ({x: dx, y: dy})};
}
// 📷 which view: Auto = behind for 1 person, top for 2+ people (and for robot-only matches); the setup chip can force one
function viewFor(M){
  const hs = M.players.filter(p => p.human && !p.remote), want = SET.view || 'auto';   // 📡 only the players on this device choose the camera
  if(M.sp.squash && want !== 'top' && want !== 'behind') return {mode: 'iso', cs: 0};   // 🧱 sb2-2: the squash room in 2.5D, the same for everyone
  if(want === 'top' || (want === 'auto' && hs.length !== 1) || !hs.length) return {mode: 'top', cs: 0};
  return {mode: 'behind', cs: hs[0].side};
}
// a ground circle of radius R around (x, y) in any view → [cx, cy, rx, ry]
function gEll(V, x, y, R, z){
  z = z || 0; const c = V.P(x, y, z), q = [V.P(x + R, y, z), V.P(x - R, y, z), V.P(x, y + R, z), V.P(x, y - R, z)];
  const xs = q.map(p => p[0]), ys = q.map(p => p[1]);
  return [c[0], c[1], Math.max(1, (Math.max(...xs) - Math.min(...xs)) / 2), Math.max(0.6, (Math.max(...ys) - Math.min(...ys)) / 2)];
}
function ell(g, V, x, y, R, z){ const e = gEll(V, x, y, R, z); g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, 7); }
let V = null;
function resize(){
  const cv = $('court'), st = $('stage'), dpr = Math.min(2, window.devicePixelRatio || 1), w = st.clientWidth, h = st.clientHeight;
  cv.width = Math.max(10, Math.round(w * dpr)); cv.height = Math.max(10, Math.round(h * dpr));
  if(G){ V = makeView(w, h, G.sp, padBox(w, h), G.view.mode, G.view.cs); V.dpr = dpr; G.deco = makeDeco(G.theme); }
}
// touch screens: keep the court clear of the shot buttons (desktop keeps the whole stage)
function isTouch(){ return ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0; }
function padBox(w, h){
  // 🕹️ sb2-1: the stick + the big shot buttons get their own strips, the court never sits under a thumb
  const box = {l: 0, r: 0, t: 0, b: 0}; if(!isTouch() || !G) return box;
  const PZ = window.UI && UI.pad && UI.pad.geo ? UI.pad : null;   // 🕹️ pz-1: solo reserve = 👈 stick strip + 👉 thumb-arc footprint
  if(PZ && G.M.players.filter(p => p.human && !p.remote).length <= 1){ const A = PZ.geo(w, h, 4), sa = PZ.safe(), sk = PZ.stickFor(w, A.w), st = sk + PZ.px('edge') * 2 + sa.l, pt = h > w * 1.05;
    if(pt){ box.b = Math.max(A.h, sk + PZ.px('edge') + sa.b) + 6; if(cheerRowOn()) box.b += CHEER_ROW; } else if(h < 520){ box.l = st; box.r = A.w + 4; } else box.b = Math.max(A.h, sk + PZ.px('edge') + sa.b) + 6;
    return box; }
  const hs = G.M.players.filter(p => p.human && !p.remote), two = hs.length > 1, portrait = h > w * 1.05, short = !portrait && h < 520;
  const shotW = Math.min(78, Math.max(64, w * 0.185)), stickW = Math.min(150, Math.max(108, (portrait ? w : h) * 0.29));
  if(portrait){ const band = Math.max(stickW, shotW * 2 + 8) + 14; box.b = band; if(two) box.t = band; }
  else { const sideW = Math.max(stickW, shotW * 2 + 8) + 18; if(two){ box.l = sideW; box.r = sideW; } else { box.l = short ? stickW + 16 : 0; box.r = short ? sideW : 0; if(!short) box.b = Math.max(stickW, shotW * 2) + 14; } }
  if(portrait && cheerRowOn()) box.b += CHEER_ROW;   // 📣 cs-1: Party crowd row (Aowu: Calm keeps the full court)
  return box;
}
window.addEventListener('resize', () => { if(G){ resize(); buildPads(); } });
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
  watch('scr-play', [], () => !!G, () => { resize(); buildPads(); });
})();   // 📱 ls-1b END

/* 🎬 SLABRALL BEATS (b3b5, 🧱 baseline chat, 2026-11-18) START — every swing = 3–5 beats on the shared timeline (Acting.play).
   The ENGINE owns contact: its 'hit' / 'serve' event = the contact tick (sbbEvent re-times the act so contact lands right then).
   The page watches the ball: when it will reach a player's reach in ≈ 0.25 s the wind-up starts (forehand / backhand by the ball's side on
   screen, smash for a high ball, the shot already queued if any) and is held there until the hit — or let go if the ball never comes.
   The server holds a serve stance while waiting (overhand 🎾 🧱 · underhand 🥒 🏸 🏓 · 🏒 push). A point = ✊ for the winners, 😩 for the others.
   Clock = M.t (stops with ⏸ / comics). 📡 guests get contact-first acts from the host's events. Acts: 🎭 BLOCK `slabrall` (AvatarActs). */
const SBB_HAS = typeof Acting !== 'undefined' && typeof Acting.play === 'function', SBB_LEAD = 0.28;
window.SBB_LOG = window.SBB_LOG || [];
// per-player act state lives OUTSIDE the engine's player objects (📡 the host sends those objects as pictures): a WeakMap
const SBB_M = new WeakMap();
function sbbH(p){ let H = SBB_M.get(p); if(!H){ H = {act: null, back: false}; SBB_M.set(p, H); } return H; }
function sbbStart(p, act, contactAt, o){
  o = o || {}; const M = G && G.M; if(!SBB_HAS || !M || !p || !Acting.act(act)) return null;
  const now = M.t, H = sbbH(p), cur = H.act, from = cur && cur.run.last && !cur.run.done ? cur.run.last : undefined;
  const run = Acting.play({name: p.name, av: p.av}, act, {t0: now, contactAt, from, onContact: r => {
    window.SBB_LOG.push({p: p.i, act, t: G && G.M ? G.M.t : now, at: r.contactT}); if(window.SBB_LOG.length > 200) window.SBB_LOG.shift(); }});
  H.act = {act, run, wait: !!o.wait, hold: !!o.hold, key: o.key || null};
  run.at(contactAt != null && contactAt <= now + 1e-6 ? Math.max(now, run.contactT) + 1e-6 : now); return H.act;
}
function sbbShotAct(p, shot, jump){
  const sp = G.M.sp; if(sp.kind === 'puck') return 'slabrall.push';
  if(jump === 'v') return 'slabrall.jumpsmash'; if(jump === 'h' || p.diveT > 0) return 'slabrall.dive';
  return shot === 'smash' ? 'slabrall.smash' : shot === 'lob' ? 'slabrall.lob' : shot === 'drop' ? 'slabrall.drop' : shot === 'slice' ? 'slabrall.slice' : sbbH(p).back ? 'slabrall.back' : 'slabrall.drive';
}
function sbbServeAct(){ const sp = G.M.sp; return sp.kind === 'puck' ? 'slabrall.push' : sp.serve === 'under' || sp.pongServe ? 'slabrall.under' : 'slabrall.serve'; }
// the engine's events (host / solo: right after the step; 📡 guests: when their picture reaches the event)
function sbbEvent(e){
  const M = G && G.M; if(!SBB_HAS || !M) return; const p = e.p != null ? M.players[e.p] : null;
  if(e.k === 'hit' && p) sbbStart(p, sbbShotAct(p, e.shot, e.jump), M.t);
  else if(e.k === 'toss' && p && SBS_ACT[e.kind]) sbbStart(p, SBS_ACT[e.kind], e.at, {key: 'toss'});   // 🎾 b3b6 the toss: contact = e.at, known now
  else if(e.k === 'serve' && p){ const A = sbbH(p).act; if(e.toss && A && A.key === 'toss' && Math.abs(A.run.contactT - M.t) < 0.05) A.run.at(Math.max(M.t, A.run.contactT) + 1e-6); else sbbStart(p, sbbServeAct(), M.t); }   // the toss act's contact lands in this tick
  else if(e.k === 'legendmiss' && p) sbbStart(p, 'slabrall.whiff', M.t);
  else if(e.k === 'jump' && p && !e.ok && e.kind === 'h'){ const A = sbbH(p).act; if(!(A && A.run.t0 === M.t)) sbbStart(p, 'slabrall.dive', M.t); }   // a dive that missed
  else if(e.k === 'point') M.players.forEach(q => sbbStart(q, q.side === e.side ? 'slabrall.yes' : 'slabrall.aww', M.t));
}
// look ahead: the ball will reach this player's reach in ≈ 0.25 s → the wind-up starts (one per ball flight); the server holds a stance
function sbbAhead(){
  const M = G && G.M; if(!SBB_HAS || !M || M.score.done) return; const sp = M.sp;
  if(M.state === 'serve'){ const b = M.balls[0]; if(b && b.held != null){ const p = M.players[b.held], H = p && sbbH(p);
    if(p && (!H.act || H.act.run.done || (H.act.key !== 'serve' && H.act.run.fired))) sbbStart(p, sbbServeAct(), M.t + 0.3, {wait: true, hold: true, key: 'serve'}); } return; }
  if(M.state !== 'play') return;
  M.balls.forEach(b => { if(!b.live || !b.real || b.held != null) return; let best = null, bt = 1e9;
    M.players.forEach(p => { if(p.diveT > 0 || p.air > 0) return;
      if(!sp.squash && sp.kind !== 'puck' && b.owner === p.side) return;          // it just left this side
      if(sp.squash && b.owner === p.side) return;                                  // squash: the other side's turn
      const rx = b.x - p.x, ry = b.y - p.y, d = Math.hypot(rx, ry) || 1e-3, cl = -(rx * (b.vx - (p.vx || 0)) + ry * (b.vy - (p.vy || 0))) / d;   // closing speed: the ball AND the player's run
      let tc; if(sp.kind === 'puck'){ if((b.x < 0) !== (p.side === 0)) return; tc = (d - SB.reachOf(M, p) - (sp.puckR || 0.4)) / Math.max(cl, 4); }   // 🏒 the puck on your half: the mallet chases it
      else { if(cl < 0.5) return; tc = (d - SB.reachOf(M, p)) / cl; } if(tc < 0 || tc > SBB_LEAD) return; if(sp.kind === 'puck') sbbWind(M, b, p, tc); else if(tc < bt){ bt = tc; best = p; } });   // 🏒 every paddle near the puck · net games: the one who will reach it first
    if(best) sbbWind(M, b, best, bt);
  });
}
function sbbWind(M, b, p, tc){ const sp = M.sp, H = sbbH(p), key = 'b' + (b.hits || 0) + ':' + M.balls.indexOf(b) + (sp.kind === 'puck' ? ':' + Math.floor(M.t * 2) : '');   // 🏒 a puck has no hit count: one wind-up per half second at most
  if(H.aheadKey === key) return; const A = H.act; if(A && !A.run.fired) return;   // already winding up / not yet hit
  const q = p.queued, act = sp.kind === 'puck' ? 'slabrall.push' : q && q !== 'normal' ? sbbShotAct(p, q) : (b.z > 1.7 && !sp.table ? 'slabrall.smash' : H.back ? 'slabrall.back' : 'slabrall.drive');
  H.aheadKey = key; sbbStart(p, act, M.t + tc + 0.06, {wait: true, key}); }
// the frame to draw now (null = the game's own pose / gesture); a waiting wind-up holds just before contact, then lets go
function sbbFrame(p){
  const M = G && G.M, H = p && SBB_M.get(p), A = H && H.act; if(!A || !M) return null; const now = M.t;
  if(A.wait && !A.run.fired && now >= A.run.contactT - 0.02){
    const keep = A.hold ? (M.state === 'serve' && M.balls[0] && M.balls[0].held === p.i) : now <= A.run.contactT + 0.35;
    if(!keep){ H.act = null; H.aheadKey = null; return null; } return A.run.last; }   // let go; the same flight may wind up again
  const f = A.run.at(now); if(f.done){ H.act = null; return null; } return f;
}
// forehand / backhand: is the nearest real ball on this player's facing side on screen?
function sbbSide(V, M, p, fx, dir){ const b = M.balls.find(q => q.live && q.real); if(!b) return; const q = V.P(b.x, b.y, b.z || 0); sbbH(p).back = (q[0] - fx) * dir < -4; }
/* 🎬 SLABRALL BEATS END */
/* 🎾 SLABRALL SERVES (b3b6, 🧱 baseline chat, 2026-11-18) START — one real-sport serve per sport (engine TOSS table): 1st tap = toss (the shot you tap
   picks the serve: the buttons show serve names while you serve, then change back), the ball goes up for real, the engine hits it at the sweet spot.
   From 🎚️ Junior a 2nd tap while the ⭕ glow is on = ⚡ perfect serve (+12 %). Never a fault. Acts: 🎭 BLOCK slabrall (toss · ptoss · feather · dropserve · wtoss). */
const SBS_ACT = {toss: 'slabrall.toss', ptoss: 'slabrall.ptoss', feather: 'slabrall.feather', dropserve: 'slabrall.dropserve', wtoss: 'slabrall.wtoss'};
const SBS_NAMES = {
  slaball: {smash: ['💥', 'Power serve'], lob: ['🌈', 'High serve'], drop: ['🪶', 'Short serve'], slice: ['🔪', 'Slice serve']},
  slapong: {smash: ['💥', 'Fast serve'], lob: ['🌈', 'Long serve'], drop: ['🪶', 'Short serve'], slice: ['🌀', 'Spin serve']},
  slabam:  {smash: ['💨', 'Flick serve'], lob: ['🌈', 'High serve'], drop: ['🪶', 'Short serve'], slice: ['➡️', 'Drive serve']},
  slapoof: {smash: ['💥', 'Power serve'], lob: ['🌈', 'Lob serve'], drop: ['🪶', 'Soft serve'], slice: ['🌀', 'Spin serve']},
  slawall: {smash: ['💥', 'Power serve'], lob: ['🌈', 'Lob serve'], drop: ['🪶', 'Soft serve'], slice: ['🌀', 'Spin serve']}
};
const SBS_VERB = {slaball: '🎾 Tap a serve to toss', slapong: '🏓 Tap a serve to toss', slabam: '🏸 Tap a serve to drop & hit', slapoof: '🥒 Tap a serve to drop', slawall: '🧱 Tap a serve to toss'};
window.SBS_LOG = window.SBS_LOG || [];
// the toss now: {p, at, win, can} from the 'toss' event (host + 📡 guests), gone at the serve / a point
function sbsEvent(e){ if(!G) return; if(e.k === 'toss'){ G.sbs = {p: e.p, at: e.at, win: e.win, can: e.canPerfect}; window.SBS_LOG.push({k: 'toss', p: e.p, at: e.at, kind: e.kind, shot: e.shot}); }
  else if(e.k === 'serve' || e.k === 'point'){ if(e.k === 'serve') window.SBS_LOG.push({k: 'serve', p: e.p, t: G.M.t, perfect: e.perfect, shot: e.shot}); G.sbs = null; }
  else if(e.k === 'tosstap') window.SBS_LOG.push({k: 'tosstap', p: e.p, ok: e.ok}); }
function sbsWindow(M){ const T = G && G.sbs; return !!(T && T.can && M.t >= T.at - T.win - 1e-9 && M.t < T.at + 1e-9); }
// shot buttons: serve names while this pad's player serves, back to the shot names in play; ⭕ glow in the perfect window
function sbsPads(M){
  const b0 = M.balls[0], serving = M.state === 'serve' && b0 && b0.held != null ? b0.held : -1, names = SBS_NAMES[M.sp.id], now = sbsWindow(M);
  const pads = $('pads'), first = pads.querySelector('.shotpad'), sig = serving + '|' + now + '|' + (G.sbs ? G.sbs.p : -1) + '|' + M.sp.id;   // only touch the DOM when something changed
  if(!first || first.__sbs === sig) return; first.__sbs = sig;   // (a rebuilt pad = a new element → done again)
  pads.querySelectorAll('.shotpad').forEach(d => { const pi = Number(d.dataset.p), on = !!names && serving === pi;
    const key = on ? 'srv' : 'shot'; if(d.dataset.sbs !== key){ d.dataset.sbs = key;
      d.querySelectorAll('.sbtn[data-a]').forEach(x => { const a = x.dataset.a; if(a === 'power') return; const ic = x.querySelector('.ic'), nm = x.querySelector('.nm');
        const L = on ? names[a] : [SHOT_ICON[a], SHOT_NAME[a]]; if(!L) return; ic.textContent = L[0]; nm.textContent = L[1]; x.title = L[1]; x.classList.toggle('srv', on); }); }
    d.querySelectorAll('.sbtn[data-a]').forEach(x => { if(x.dataset.a !== 'power') x.classList.toggle('tossnow', on && now && G.sbs && G.sbs.p === pi); }); });
}
// the hint line on top of the court
function sbsHint(M, sh, server){
  const many = M.players.filter(p => p.human).length > 1, who = many ? server.name + ': ' : '', T = G.sbs && G.sbs.p === server.i ? G.sbs : null;
  if(!T){ const v = SBS_VERB[M.sp.id]; return v ? v.replace(/^(\S+) /, '$1 ' + who) : '🎾 ' + who + 'tap or press a shot key to serve'; }
  if(!T.can) return null;                                   // 🌱 Basic: one tap, nothing to time
  return sbsWindow(M) ? '⭕ ' + who + 'Tap now for ⚡!' : '⭕ ' + who + 'Wait for the glow…';
}
// ⭕ a gold ring round the tossed ball in the window · ⚡ spark at a perfect contact
function sbsDraw(g, V, M, t){
  M.fx.forEach(f => { if(f.k !== 'spark') return; const w = V.P(f.x, f.y, f.z), a = 1 - f.t / f.life, r = 8 + f.t * 70; g.save(); g.strokeStyle = 'rgba(255,214,90,' + a + ')'; g.lineWidth = 3;
    for(let i = 0; i < 8; i++){ const an = i * Math.PI / 4 + 0.3; g.beginPath(); g.moveTo(w[0] + Math.cos(an) * r * 0.45, w[1] + Math.sin(an) * r * 0.45); g.lineTo(w[0] + Math.cos(an) * r, w[1] + Math.sin(an) * r); g.stroke(); } g.restore(); });
  const T = G && G.sbs, b = M.balls[0]; if(!T || !T.can || !b || b.held == null) return; const srv = M.players[T.p]; if(!srv || !srv.human || srv.remote) return;
  const w = V.P(b.x, b.y, b.z), k = V.sc(b.x, b.y, b.z), on = sbsWindow(M), pu = 0.5 + 0.5 * Math.sin(t * 22);
  g.save(); g.strokeStyle = on ? 'rgba(255,200,69,' + (0.75 + 0.25 * pu) + ')' : 'rgba(255,255,255,0.35)'; g.lineWidth = on ? 4 : 2; g.beginPath(); g.arc(w[0], w[1], k * (on ? 0.42 + 0.06 * pu : 0.5), 0, 7); g.stroke(); g.restore();
}
/* 🎾 SLABRALL SERVES END */
/* ---------- loop ---------- */
function frame(now){
  if(!G) return;
  const dt = Math.min(0.05, Math.max(0, (now - G.last) / 1000)); G.last = now;
  if(V && V.follow){ const me = G.M.players.find(p => p.human && p.side === V.camSide) || G.M.players.find(p => p.side === V.camSide); if(me){ G.camY += (me.y * 0.32 - G.camY) * Math.min(1, dt * 3); V.follow(G.camY); } }   // 📷 sb2-3 camera follows you sideways
  if(G.link && G.link.role === 'guest'){ if(!G.over) readInputs(); lkGuestFrame(now); }   // 📡 a guest never runs the engine: it shows the host's match
  else if(!G.paused && !G.over && !Comic.busy()){   // 💥 the game waits while a comic panel / strip shows
    readInputs();
    G.acc += dt; let n = 0;
    while(G.acc >= SB.DT && n < 12){ SB.step(G.M, SB.DT); G.acc -= SB.DT; n++; }
    const evs = SB.takeEvents(G.M); handleEvents(evs); if(typeof sbbAhead === 'function') sbbAhead(); /* 🎬 b3b5 */ if(G.lk && evs.length) G.lk.evs.push.apply(G.lk.evs, evs);
    if(G.M.score.done && !G.over) finishMatch();
  }
  if(G && G.link && G.link.role === 'host') lkHostTick(now);
  if(window.Cheer) Cheer.pause(!!(G.paused || Comic.busy()));   // 📣 cs-1
  G.anim += dt; if(!G.ctl) draw(now / 1000);
  hud();   // 📺 lk-5e: a controller phone (G.ctl) doesn't draw the court — it is on the TV
  G.raf = requestAnimationFrame(frame);
}
function togglePause(){ if(!G || G.over) return; if(G.link && G.link.role === 'guest'){ Link.send('sbpause', {on: !G.paused}, {sure: true}); return; } G.paused = !G.paused; UI.pauseIcon($('pause-btn'), G.paused); banner(G.paused ? '⏸ Paused — tap ▶ to play' : '▶ Go!', 'good'); }
function pauseGame(){ if(G && G.link && G.link.role === 'guest'){ if(!G.paused && !G.over) Link.send('sbpause', {on: true}, {sure: true}); return; } if(G && !G.paused){ G.paused = true; UI.pauseIcon($('pause-btn'), true); } }
function leavePlay(){
  if(!G) return; const was = G.paused; G.paused = true;
  const lb = G.link ? (G.link.role === 'host' ? 'This ends the match on every device.' : 'A 🤖 robot plays for you until you come back.') : null;   // 📡 lk-1b
  UI.confirm({icon: '◀', title: 'Leave this match?', body: lb || (G.cup ? 'You can play this tournament match again from the bracket.' : 'This match won\'t be saved.'), okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(!G) return; G.paused = was; if(ok){ if(G.link) lkExit(); else if(G.cup) backToBracket(); else backToMenu(); } });
}
function backToMenu(){ if(window.Cheer) Cheer.unmount(); /* 💬 24t off */ if(window.UI && UI.callout) UI.callout.setup(null); if(G && G.link){ lkExit(); return; } if(G) cancelAnimationFrame(G.raf); G = null; hideResult(); $('pads').innerHTML = ''; renderMenu(); showScreen('menu'); }

/* ---------- input ---------- */
document.addEventListener('keydown', e => {
  if(takeKey(e)) return;
  if(!G || $('scr-play').classList.contains('hidden')) return;
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End'].indexOf(e.code) >= 0) e.preventDefault();
  if(e.code === 'Escape'){ togglePause(); return; }
  if(e.repeat){ return; }
  G.held.add(e.code); $('pads').classList.add('kbd');
  if(G.paused || G.over) return;
  G.M.players.forEach(p => { if(!p.human || p.remote) return; keySetsOf(p).forEach(K => {
    ['smash', 'drop', 'lob', 'slice'].forEach(a => { if(K[a] === e.code) shot(p.i, a); });
    if(K.power === e.code) firePower(p.i); }); });
  if(e.code === 'Space'){ const me = G.M.players.find(p => p.human && !p.remote && (p.seat === -1 || p.seat === 0)); if(me) shot(me.i, 'normal'); }
});
document.addEventListener('keyup', e => { if(G) G.held.delete(e.code); });
window.addEventListener('blur', () => { if(G) G.held.clear(); });
function keySetsOf(p){ return p.seat === -1 ? [KEYS[0], KEYS[1]] : [KEYS[p.seat] || KEYS[0]]; }
function readInputs(){
  const M = G.M;
  M.players.forEach(p => { if(!p.human || p.remote) return;   // 📡 remote players send their own stick
    if(p.auto) return;   // test autopilot
    // 🕹️ stick first (analog), else keys — both are SCREEN directions, the view turns them into the world (sb2-1)
    const st = G.sticks && G.sticks.get(p.i);
    let sx = 0, sy = 0;
    if(st && st.v){ const m = Math.hypot(st.v.x, st.v.y); if(m > 0.12){ const k = Math.min(1, m) / m; sx = st.v.x * k; sy = st.v.y * k; } }
    else { keySetsOf(p).forEach(K => { if(G.held.has(K.left)) sx -= 1; if(G.held.has(K.right)) sx += 1; if(G.held.has(K.up)) sy -= 1; if(G.held.has(K.down)) sy += 1; });
      sx = Math.max(-1, Math.min(1, sx)); sy = Math.max(-1, Math.min(1, sy)); }
    const w = V ? V.k2w(sx, sy) : {x: sx, y: sy}; p.input.x = w.x; p.input.y = w.y;
  });
}
function shot(i, kind){ const p = G.M.players[i]; if(!p || G.paused) return; if(G.link && G.link.role === 'guest'){ if(!G.over) Link.send('sbshot', {a: kind}, {sure: true}); if(kind !== 'normal') floatAt(p, SHOT_ICON[kind] || '', 0.6); return; } SB.pressShot(G.M, i, kind); if(kind !== 'normal') floatAt(p, SHOT_ICON[kind] || '', 0.6); }
function firePower(i){ const p = G.M.players[i]; if(p && G.link && G.link.role === 'guest'){ if(p.power) Link.send('sbshot', {a: 'power'}, {sure: true}); else UISound.play('error'); return; } if(!p || !p.power){ if(p && p.human) UISound.play('error'); return; } SB.usePower(G.M, i); }
// touch (sb2-1): a short tap on the court = serve / normal hit; moving is the 🕹️ stick
function humanFor(side, px, py){
  const hs = G.M.players.filter(p => p.human && !p.remote); if(hs.length === 1) return hs[0];
  const w = V.inv(px, py), mine = hs.filter(p => p.side === (w.x < 0 ? 0 : 1)); if(!mine.length) return null;
  return mine.reduce((a, b) => (Math.hypot(a.x - w.x, a.y - w.y) <= Math.hypot(b.x - w.x, b.y - w.y) ? a : b));
}
(function(){
  const cv = $('court');
  cv.addEventListener('pointerdown', e => {
    if(!G || G.paused || G.over) return; const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    const p = humanFor(0, px, py); if(!p) return;
    G.pointers.set(e.pointerId, {p, x0: px, y0: py, t0: performance.now()}); $('pads').classList.remove('kbd');
  });
  const up = e => { if(!G) return; const d = G.pointers.get(e.pointerId); if(!d) return; G.pointers.delete(e.pointerId); const r = cv.getBoundingClientRect();
    if(Math.hypot(e.clientX - r.left - d.x0, e.clientY - r.top - d.y0) < 12 && performance.now() - d.t0 < 350) shot(d.p.i, 'normal'); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
})();
const SHOT_NAME = {smash: 'Smash', lob: 'Lob', drop: 'Drop', slice: 'Slice'};
function buildPads(){
  const box = $('pads'); box.innerHTML = ''; G.sticks = new Map(); const hs = G.M.players.filter(p => p.human && !p.remote), two = hs.length > 1;
  const portrait = V && V.H > V.W * 1.05, short = V && !portrait && V.H < 520;
  box.classList.toggle('two', two); box.classList.toggle('port', !!portrait); box.classList.toggle('short', !!short); box.style.removeProperty('--stick');
  const usedSide = {};
  hs.forEach(p => {
    // one touch set per side (2 vs 2 with two people on one side: the 2nd one plays with keys)
    if(usedSide[p.side]) return; usedSide[p.side] = true;
    const K = keySetsOf(p)[0], where = !two ? 'solo' : portrait ? (p.side === 0 ? 'bottom' : 'topband') : (p.side === 0 ? 'lside' : 'rside');
    const st = document.createElement('div'); st.className = 'stick ' + where; st.dataset.p = p.i; st.innerHTML = '<div class="ring"></div><div class="knob"></div><span class="tip">🕹️ move + aim</span>';
    const cl = document.createElement('div'); cl.className = 'shotpad ' + where; cl.dataset.p = p.i;
    cl.innerHTML = '<button class="sbtn pw" data-a="power" title="Power"><span class="ic">⚡</span><span class="nm">Power</span><small>' + UI.esc(keyName(K.power)) + '</small></button>'
      + '<div class="shots">' + ['smash', 'lob', 'drop', 'slice'].map(a => '<button class="sbtn s-' + a + '" data-a="' + a + '" title="' + SHOT_NAME[a] + '"><span class="ic">' + SHOT_ICON[a] + '</span><span class="nm">' + SHOT_NAME[a] + '</span><small>' + UI.esc(keyName(K[a])) + '</small></button>').join('') + '</div>';
    cl.querySelectorAll('.sbtn').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('down', 'flash'); setTimeout(() => b.classList.remove('down'), 160); if(navigator.vibrate) try{ navigator.vibrate(8); }catch(err){}
      $('pads').classList.remove('kbd'); if(b.dataset.a === 'power') firePower(p.i); else shot(p.i, b.dataset.a); }));
    // 🕹️ the shared UiKit stick (r33 instant start, r36 calm feel per device): analog, screen direction → world direction of this view
    const T = UI.stickTracker(st, {player: p.name, av: p.av}), kn = st.querySelector('.knob'), S = {id: null, v: null};   // 🕹️ sk-1: wears this player's joystick skin
    JoySkins.buttons(cl, p.name, p.av);   // …and the shot buttons wear its ring + glow (they keep the SlaBrall colours)
    const show = v => { const m = Math.min(1, Math.hypot(v.fx, v.fy)), k = m > 0 ? Math.min(1, m) / m : 0; kn.style.transform = 'translate(calc(-50% + ' + (v.fx * k * 38) + '%), calc(-50% + ' + (v.fy * k * 38) + '%))'; };
    st.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try{ st.setPointerCapture(e.pointerId); }catch(err){} S.id = e.pointerId; S.v = T.start(e); show(S.v); st.classList.add('on'); $('pads').classList.remove('kbd'); });
    UI.onFastMove(st, e => { if(e.pointerId !== S.id) return; S.v = T.at(e); show(S.v); });
    const end = e => { if(e.pointerId !== S.id) return; S.id = null; S.v = null; kn.style.transform = ''; st.classList.remove('on'); p.input.x = p.input.y = 0; };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    G.sticks.set(p.i, S);
    box.appendChild(st); box.appendChild(cl);
    if(where === 'solo' && window.UI && UI.pad){   // 🕹️ pz-1: 👉 💥 Smash = main, the fan (most used first): 🌈 Lob ← · 🪶 Drop ↑ · 🔪 Slice ↙ · ⚡ Power ↗ (a ring around Smash)
      box.style.setProperty('--stick', UI.pad.stickFor(box.clientWidth, UI.pad.geo(box.clientWidth, box.clientHeight, 4).w) + 'px');   // never touches the 👉 group
      const B = a => cl.querySelector('[data-a="' + a + '"]'); UI.pad.arc(cl, B('smash'), [B('lob'), B('drop'), B('slice'), B('power')], {fit: true});
      const z = document.createElement('div'); z.className = 'stickzone'; const pb = padBox(box.clientWidth, box.clientHeight);
      z.style.width = (pb.l || box.clientWidth * 0.42) + 'px'; z.style.height = (pb.l ? box.clientHeight * 0.78 : (pb.b || box.clientHeight * 0.4)) + 'px';
      box.insertBefore(z, st); UI.pad.stick(st, z); }
  });
  if(window.matchMedia && matchMedia('(pointer:fine)').matches && !isTouch()) box.classList.add('kbd');
}

/* 📣 CHEERSQUAD (cs-1) START — the cheering crowd (CheerSquad.html, 📣 Cheer chat). Don't remove: the Cheer chat re-applies it. */
const CHEER_ROW = 46;
let CHEER_HULL = null;
function cheerRowOn(){ return isTouch() && window.Cheer && Cheer.active() && Cheer.stats().size === 'party'; }
function cheerMount(){
  if(!window.Cheer) return; Cheer.unmount();
  const M = G.M, me = M.players.find(p => p.human && !p.remote);
  Cheer.mount($('stage') || document.body, {game: 'slabrall', players: M.players.map(p => ({name: p.name, side: p.side, human: !!p.human})),
    me: me ? {name: me.name} : {name: S.player}, family: (S.players || []).map(p => p.Name), avatars: S.avatars || {}, mode: 'scene', ref: $('court'),
    avoid: () => Array.from(document.querySelectorAll('#pads .stick, #pads .shotpad, #pads .sbtn, #pads button, #gbar')),
    clear: b => !cheerOnCourt(b), edge: innerHeight > innerWidth * 1.05 ? 0.4 : 0});   // phones held upright: fans may peek in from the screen edge
}
// the court + its run-off + the air above it (where the ball flies) = never covered
function cheerHull(V, sp){ const pts = [], add = (L, W, z) => [[-L, -W], [L, -W], [L, W], [-L, W]].forEach(q => pts.push(V.P(q[0], q[1], z)));
  add(sp.Lh + 1.3, sp.Wh + 1.3, 0); add(sp.Lh, sp.Wh, sp.squash ? (sp.wallH || 4.6) : 2.2);   // ground + run-off, and the air above the court where the ball flies
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  pts.forEach(p => { while(lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
  pts.slice().reverse().forEach(p => { while(up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
  return lo.slice(0, -1).concat(up.slice(0, -1)); }
function cheerOnCourt(b){ const H = CHEER_HULL; if(!H) return false;
  const inside = (x, y) => { let c = false; for(let i = 0, j = H.length - 1; i < H.length; j = i++){ const a = H[i], q = H[j]; if((a[1] > y) !== (q[1] > y) && x < (q[0] - a[0]) * (y - a[1]) / (q[1] - a[1]) + a[0]) c = !c; } return c; };
  for(const fx of [0, 0.5, 1]) for(const fy of [0, 0.5, 1]) if(inside(b.l + (b.r - b.l) * fx, b.t + (b.b - b.t) * fy)) return true; return false; }
// fans stand on the grass beside the long sides of the court (candidates on both halves, each team's half first), never behind the far baseline (the ball flies there)
function cheerScene(g, V, M, t){
  if(!window.Cheer || !Cheer.active() || !V || !V.P || !V.sc) return false;
  const sp = M.sp, party = Cheer.stats().size === 'party', cands = [], XS = [0.35, 0.55, 0.15, 0.75, 0.95, -0.05, 1.12];
  CHEER_HULL = cheerHull(V, sp);
  [0, 1].forEach(row => XS.forEach(u => [0, 1].forEach(half => [-1, 1].forEach(side => {
    const x = (half ? 1 : -1) * u * (sp.Lh + 1.2), y = side * (sp.Wh + (sp.squash ? 1.6 : 2.1) + row * 1.25), p = V.P(x, y, 0);
    cands.push({x: p[0], y: p[1], k: V.sc(x, y, 0) * (party ? 0.019 : 0.016), half}); }))));
  Cheer.place(g, cands);
  return true;
}
function cheerRow(g){ if(!cheerRowOn() || !V) return; const box = padBox(V.W, V.H); Cheer.row(g, {x: 0, y: V.H - box.b, w: V.W, h: CHEER_ROW - 4}); }
function cheerScore(){ const sc = G.M.score; return G.sp.scoring === 'tennis' ? sc.games.map((x, i) => x * 4 + sc.pts[i]) : sc.pts.slice(); }
// match point (or game point that wins the match) for side s → the crowd leans in
function cheerCloseSide(){ const M = G.M, sc = M.score; if(sc.done) return -1;
  for(const s of [0, 1]){ const a = sc.pts[s] + 1, o = sc.pts[1 - s];
    if(G.sp.scoring === 'tennis'){ const noAd = M.level <= 1; if(a >= 4 && (a - o >= 2 || (noAd && a > o)) && sc.games[s] + 1 >= M.target) return s; }
    else { const t = M.target; if((a >= t && a - o >= 2) || a >= t + 4) return s; } }
  return -1; }
function cheerPoint(e){ if(!window.Cheer || !Cheer.active()) return; const L = G.plog, lastP = G.M.players[L.lastHit];
  const big = e.why === 'ace' || e.why === 'goal' || e.why === 'legend' || L.rally >= 8 || L.jumpPerfect || (L.lastShot === 'smash' && lastP && lastP.side === e.side);
  Cheer.react(big ? 'big' : 'goal', {side: e.side, score: cheerScore()});
  const s = cheerCloseSide(); if(s >= 0) setTimeout(() => { if(G && !G.over && window.Cheer) Cheer.react('close', {side: s}); }, 2300); }
function cheerEnd(){ if(!window.Cheer || !Cheer.active() || !G) return; const win = G.M.score.winner; Cheer.react('win', {side: win});
  setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
    const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
    const at = card.querySelector('.res-btns'); card.insertBefore(c, at); card.insertBefore(cap, at); }, 120); }
/* 📣 CHEERSQUAD END */
/* ---------- events → sounds, words, fx ---------- */
const WHY = {floor: 'it touched the floor', net: 'into the net', out: 'out!', own: 'on their own side', twice: 'bounced twice', past: 'got past', ace: 'ACE!', kitchen: 'kitchen volley!', wall: 'hit the glass first', serve: 'serve fault', goal: 'GOAL!', legend: 'LEGENDARY GOAL!', stuck: 'too long a rally', hardcore: ''};
function handleEvents(list){
  const M = G.M;
  if(typeof sbbEvent === 'function') list.forEach(sbbEvent);   /* 🎬 b3b5: contact = the engine's event */
  if(typeof sbsEvent === 'function') list.forEach(sbsEvent);   /* 🎾 b3b6 the toss */
  list.forEach(e => {
    if(e.k === 'hit'){ UISound.play(e.shot === 'smash' ? 'whoosh' : 'pop'); const p = M.players[e.p]; if(e.perfect && p.human && !FX){ bigWord('PERFECT!'); } if(e.shot === 'smash' && p.human && !FX) floatAt(p, '💥 SMASH', 0.9);   // st-1: with effects on, the Sla… callouts say it
      if(e.rally === 10 || e.rally === 20 || e.rally === 30) banner('🔁 ' + e.rally + '-hit rally!', 'gold');
      logHit(e); }
    else if(e.k === 'serve'){ UISound.play('tap'); G.plog = newPlog(); }
    else if(e.k === 'jump') onJump(e);
    else if(e.k === 'point'){ const win = M.players.filter(p => p.side === e.side), human = win.some(p => p.human && !p.remote), lost = M.players.some(p => p.human && !p.remote && p.side !== e.side);
      UISound.play(human || !lost ? 'success' : 'bump');
      banner((e.why === 'ace' ? '🎾 ' : e.why === 'goal' || e.why === 'legend' ? '🥅 ' : '') + teamName(e.side) + ' ' + (G.sp.scoring === 'goals' ? 'scores' : 'wins the point') + (WHY[e.why] ? ' — ' + WHY[e.why] : ''), human ? 'good' : 'bad');
      if(e.why === 'goal' || e.why === 'legend' || e.why === 'ace') bigWord(e.why === 'ace' ? 'ACE!' : e.why === 'legend' ? '⭐ GOAL!' : 'GOAL!');
      cheerPoint(e); comicPoint(e); }
    else if(e.k === 'game'){ setTimeout(() => banner('🏆 Game to ' + teamName(e.side) + '!', 'gold'), 900); if(G.stripNext) comicStripNow(); }
    else if(e.k === 'orb'){ UISound.play('unlock'); banner(['⚪ Power orb!', '🔵 Rare power orb!', '🟡 LEGENDARY orb!'][e.tier] + ' Hit the ball through it!', 'gold'); }
    else if(e.k === 'gotpower'){ const p = M.players[e.p], P = SB.POWERS[e.power]; UISound.play('unlock'); banner(P.icon + ' ' + p.name + ' got ' + P.name + (p.human && !p.remote ? ' — press ' + keyName(keySetsOf(p)[0].power) + ' or ⚡' : ''), 'gold'); }
    else if(e.k === 'power'){ const p = M.players[e.p], P = SB.POWERS[e.power]; UISound.play('whoosh'); bigWord(P.icon + ' ' + P.name, p); if(FX) say(P.name); }
    else if(e.k === 'legendmiss'){ banner('⭐ Too strong! Only a PERFECT hit sends a Legendary back', 'bad'); }
    else if(e.k === 'mirage'){ bigWord('🎭 Fooled you!'); }
    else if(e.k === 'broken'){ bigWord('💔 Broken spin!'); }
    else if(e.k === 'splorf'){ bigWord('🌊 SPLORF!'); UISound.play('drop'); }
    else if(e.k === 'patch'){ const E = SB.ELEMENTS[e.el]; banner(E.icon + ' ' + E.name + ' patch on the court!', 'gold'); }
    else if(e.k === 'zap'){ floatAt(M.players[e.p], '⚡ zapped!', 0.7); UISound.play('bump'); }
    else if(e.k === 'buddywall'){ banner('🧱 Buddy Wall saved it!', 'good'); UISound.play('bump'); }
    else if(e.k === 'split'){ bigWord('✂️ Which one is real?'); }
    else if(e.k === 'special'){ if(e.kind === 'legend' || e.kind === 'mirage'){ bigWord('⭐ LEGENDARY SHOT!'); comicImpact(M.players[e.p], 'Sla… LEGEND!!!', 'power', 'smash', 'Legendary shot!'); } G.plog.power = true; }
    else if(e.k === 'power'){ G.plog.power = true; }
    else if(e.k === 'unstick'){ banner('🏒 Puck back to the middle', ''); }
  });
}
let bannerTimer = 0;
function banner(text, kind){ const b = $('banner'); b.textContent = text; b.className = 'banner on' + (kind ? ' ' + kind : ''); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 2000); }
function bigWord(text, who){ if(!FX) return; /* 💬 24t bigWord */ if(UI.callout && UI.callout.active()){ UI.callout(text, {who, rank: UI.callout.guess(text) === 'big' ? 'big' : 'good'}); return; } const host = $('bigword-host'); host.innerHTML = ''; const d = document.createElement('div'); d.className = 'big-word'; d.textContent = text; host.appendChild(d); setTimeout(() => d.remove(), 950); }
function floatAt(p, text, life){ G.fx.push({k: 'txt', x: p.x, y: p.y, z: 2.4, txt: text, t: 0, life: life || 0.8}); }

/* ---------- 💥 comics (sb2-3) — ComicKit: impact panels, Sla… callouts, strips. Off (💬 chip) = small callouts only ---------- */
function newPlog(){ return {rally: 0, jump: false, jumpPerfect: false, jumpBy: -1, dive: false, diveBy: -1, diveMiss: false, diveMissBy: -1, power: false, smash: false, drop: false, lastHit: -1, lastShot: '', lastJump: null}; }
const SLA_SHOT = {smash: 'Sla… SMASH!', lob: 'Sla… LOB!', drop: 'Sla… plop.', slice: 'Sla… SLICE!'};   // st-1
function logHit(e){ const hp = G.M.players[e.p]; if(hp && hp.human && !hp.auto && !hp.remote && !e.jump){ const w = e.perfect ? 'Sla… PERFECT!' : SLA_SHOT[e.shot]; if(w && performance.now() - (G.lastSla || 0) > 1200){ G.lastSla = performance.now(); sla(hp, w); } }
  const L = G.plog; L.rally = e.rally; L.lastHit = e.p; L.lastShot = e.shot; L.lastJump = e.jump || null; if(e.shot === 'smash') L.smash = true; if(e.shot === 'drop') L.drop = true;
  if(e.rally === 15) comicImpact(G.M.players[e.p], 'Sla… 15 HITS!', 'rally', 'smash', '🔁 What a rally!'); }
function sla(p, text){ if(!FX) return; /* 💬 24t sla */ if(UI.callout && UI.callout.active()){ UI.callout(text, {who: p, say: G.comics}); return; } Comic.callout(text, {small: !G.comics, say: G.comics}); }
/* 💬 24t-a: words during play (UiKit UI.callout) — the court + people + ball stay clear, crowd fans on #court can say it */
function calloutSetup(){ if(!(window.UI && UI.callout)) return;
  const scr = (x, y, z) => { if(!G || !V) return null; const c = $('court').getBoundingClientRect(), d = V.dpr || 1, q = V.P(x, y, z || 0); return {x: c.left + q[0] / d, y: c.top + q[1] / d}; };
  const pl = w => !G ? null : typeof w === 'number' ? G.M.players[w] : w && w.side != null ? w : null;
  const me = () => G && (G.M.players.find(p => p.human && !p.remote && !p.auto) || G.M.players.find(p => p.human));
  UI.callout.setup({
    get me(){ return me(); },
    at: w => { const p = pl(w) || me(); if(!p) return null; const h = scr(p.x, p.y, 2.25); return h ? {x: h.x, y: h.y - 6} : null; },
    side: w => { const p = pl(w) || me(); return p ? p.side : null; },
    crowd: () => $('court'),
    poly: () => { if(!G || !V) return null; const S = G.sp, P = [scr(-S.Lh, -S.Wh), scr(S.Lh, -S.Wh), scr(S.Lh, S.Wh), scr(-S.Lh, S.Wh)]; return P.some(q => !q) ? null : P.map(q => [q.x, q.y]); },
    inside: (x, y) => { if(!G || !V) return false; const S = G.sp, P = [scr(-S.Lh, -S.Wh), scr(S.Lh, -S.Wh), scr(S.Lh, S.Wh), scr(-S.Lh, S.Wh)]; if(P.some(q => !q)) return false;
      let ins = false; for(let i = 0, j = 3; i < 4; j = i++){ const a = P[i], b = P[j]; if(((a.y > y) !== (b.y > y)) && (x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x)) ins = !ins; } return ins; },
    keep: () => { if(!G) return []; const out = [];
      G.M.players.forEach(p => { const f = scr(p.x, p.y, 0), h = scr(p.x, p.y, 2.3); if(!f || !h) return; const w = Math.max(26, Math.abs(f.y - h.y) * 0.45); out.push({l: f.x - w, r: f.x + w, t: h.y - 18, b: f.y + 8}); });
      (G.M.balls || []).forEach(b => { if(!b) return; const q = scr(b.x, b.y, b.z || 0), g = scr(b.x, b.y, 0); if(!q) return; out.push({l: q.x - 26, r: q.x + 26, t: q.y - 26, b: Math.max(q.y, g ? g.y : q.y) + 14}); });
      return out; }
  }); }
function comicImpact(p, words, design, pose, sub){
  if(!p) return false; const M = G.M; if(!G.comics || M.t - G.lastImpact < 10){ sla(p, words); return false; }   // Off / too soon → just the callout
  G.lastImpact = M.t; Comic.impact({who: {name: p.name, av: p.av}, words, design, pose, sub, ms: 1100, ball: comicBall}); return true;
}
function onJump(e){
  const M = G.M, p = M.players[e.p], L = G.plog;
  if(e.kind === 'v'){ if(e.ok){ L.jump = true; L.jumpBy = e.p; if(e.perfect) L.jumpPerfect = true; } UISound.play(e.ok ? 'whoosh' : 'bump');
    if(e.ok && e.perfect) comicImpact(p, 'Sla… SMASH!!!', 'jump', 'jump', '🦘 Jump smash!'); else sla(p, e.ok ? 'Sla… JUMP!' : 'Sla… oops!'); }
  else { if(e.ok){ L.dive = true; L.diveBy = e.p; } else { L.diveMiss = true; L.diveMissBy = e.p; } UISound.play('drop');
    if(e.ok) comicImpact(p, 'Sla… DIVE!', 'dive', 'dive', '🤸 Dive save!'); else sla(p, 'Sla… so close!'); }
  G.mlog.push({k: e.kind, ok: e.ok, perfect: e.perfect, p: e.p, t: M.t});
}
function comicBall(g, x, y, r, t){ const sp = G.sp; if(sp.kind === 'shuttle'){ BallSkins.shuttle(g, G.ball, G.feathers ? G.feathers[0] : -1, x, y, r * 1.2, t, Math.PI * 0.9); return; }
  if(G.ball >= 0 && sp.kind !== 'puck') BallSkins.draw(g, G.ball, x, y, r, t); else { g.save(); drawSportBall(g, sp, x, y, r, t, 0); g.restore(); } }
function momentOf(e){   // what happened in this point → Comic.pick
  const L = G.plog, M = G.M, sc = M.score, lastP = M.players[L.lastHit], ten = G.sp.scoring === 'tennis';
  const close = ten ? sc.pts[0] >= 3 && sc.pts[1] >= 3 : Math.abs(sc.pts[0] - sc.pts[1]) <= 1 && Math.max(sc.pts[0], sc.pts[1]) >= M.target - 2;
  return {dive: L.dive && L.lastJump === 'h' && lastP && lastP.side === e.side, diveMiss: L.diveMiss, jump: L.jump, jumpPerfect: L.jumpPerfect, power: L.power, ace: e.why === 'ace', glitch: !!(lastP && lastP.robot && lastP.side !== e.side && /out|net|wide|own/.test(e.why || '')),
    rally: L.rally, close, drop: L.lastShot === 'drop' && lastP && lastP.side === e.side, smash: L.smash};
}
function comicPoint(e){
  const M = G.M, L = G.plog, lastP = M.players[L.lastHit];
  if(L.dive && L.lastJump === 'h' && lastP && lastP.side === e.side) sla(lastP, 'Sla… DIVE… WINNER!!');
  else if(e.why === 'ace') sla(lastP, 'Sla… ACE!'); else if(e.why === 'goal' || e.why === 'legend') sla(lastP, 'Sla… GOAL!!');
  else if(L.lastShot === 'drop' && lastP && lastP.side === e.side) sla(lastP, 'Sla… plop.');
  G.lastPoint = {e, m: momentOf(e), plog: Object.assign({}, L)};
  if(L.rally >= 8 || L.dive || L.jumpPerfect) G.mlog.push({k: 'point', rally: L.rally, side: e.side, m: G.lastPoint.m, t: M.t});
  if(!G.comics || M.score.done) return;
  if(G.sp.scoring === 'tennis'){ G.stripNext = true; setTimeout(() => { G.stripNext = false; }, 50); return; }   // tennis-style: a strip on each GAME-winning point (the 'game' event follows)
  if(--G.nextStrip <= 0){ G.nextStrip = 2 + Math.floor(Math.random() * 3); comicStripNow(); }   // point sports: every 2–4 points
}
function comicStripNow(){ const LP = G.lastPoint; if(!LP || !G.comics) return; const design = Comic.pick(LP.m), panels = stripPanels(design, LP); G.stripNext = false;
  setTimeout(() => { if(G && !G.over) Comic.strip(design, {panels}); }, 650); }
function heroOf(LP, design){ const M = G.M, L = LP.plog, by = i => M.players[i];
  const i = design === 'dive' ? L.diveBy : design === 'divemiss' ? L.diveMissBy : design === 'jump' ? L.jumpBy : design === 'glitch' ? L.lastHit : L.lastHit;
  return by(i >= 0 ? i : 0) || M.players.find(p => p.side === LP.e.side) || M.players[0]; }
function stripPanels(design, LP){
  const M = G.M, hero = heroOf(LP, design), who = q => ({name: q.name, av: q.av}), opp = M.players.find(q => q.side !== hero.side) || hero, won = hero.side === LP.e.side;
  const W = Comic.DESIGNS[design].words, n = LP.plog.rally;
  const P1 = {who: who(hero), pose: 'ready', cap: hero.name + (n > 1 ? ' · rally ' + n : ''), words: W[0]};
  const P2 = {who: who(hero), pose: design === 'dive' || design === 'divemiss' ? 'dive' : design === 'glitch' ? 'glitch' : design === 'slowmo' ? 'ready' : 'smash', ball: comicBall, words: W[1], cap: Comic.DESIGNS[design].name};
  const P3 = {who: who(won ? hero : opp), pose: won ? 'cheer' : 'sad', words: won ? W[2] : 'Point ' + teamName(LP.e.side) + '!', cap: SB.pointText(M, 0) + ' – ' + SB.pointText(M, 1)};
  return [P1, P2, P3];
}
function winnerPanels(win){   // the 4-panel match strip: start · the best moment of the match · match point · the winner
  const M = G.M, ws = M.players.filter(p => p.side === win), ls2 = M.players.filter(p => p.side !== win), A = ws[0], B = ls2[0] || ws[0], who = q => ({name: q.name, av: q.av});
  const best = G.mlog.filter(x => x.k === 'h' && x.ok)[0] || G.mlog.filter(x => x.k === 'v' && x.ok && x.perfect)[0] || G.mlog.filter(x => x.k === 'point').sort((a, b) => b.rally - a.rally)[0];
  const bp = best ? M.players[best.p != null ? best.p : (M.players.find(q => q.side === best.side) || A).i] || A : A;
  const bw = !best ? 'What a match!' : best.k === 'h' ? 'Sla… DIVE!' : best.k === 'v' ? 'Sla… SMASH!!!' : 'Sla… ' + best.rally + ' HITS!';
  const scoreLine = G.sp.scoring === 'tennis' ? M.score.games[0] + ' – ' + M.score.games[1] : M.score.pts[0] + ' – ' + M.score.pts[1];
  return [{who: who(A), who2: who(B), pose: 'ready', pose2: 'ready', cap: G.sp.icon + ' ' + G.sp.name, words: 'Game on!'},
    {who: who(bp), pose: best && best.k === 'h' ? 'dive' : 'smash', ball: comicBall, cap: 'The big moment', words: bw},
    {who: who(A), pose: 'smash', ball: comicBall, cap: 'Match point', words: 'MATCH POINT!'},
    {who: who(A), who2: who(B), pose: 'cheer', pose2: 'sad', cap: scoreLine, words: 'SLA-BRALL!!!'}];
}

/* ---------- HUD ---------- */
function hud(){
  if(!G) return; const M = G.M, sc = M.score, ten = G.sp.scoring === 'tennis';
  BAR.players([0, 1].map(i => ({k: i, name: G.tn[i] + (ten ? ' · G' + sc.games[i] : ''), score: SB.pointText(M, i), on: G.sp.kind !== 'puck' && sc.serveSide === i, col: i ? '#18B8A6' : '#FF7A1A'})));
  BAR.count('rally', G.sp.kind === 'puck' ? '🏒' : '🔁', M.rally + (M.lv.hardcore ? ' · 💀' + (3 - sc.hcLost) : ''), 'Rally — hits in a row');
  [0, 1].forEach(side => { const tag = $('ptag-' + side), hold = M.players.filter(p => p.side === side && p.power);
    if(!hold.length){ tag.classList.add('hidden'); return; }
    tag.classList.remove('hidden'); tag.classList.toggle('gold', hold.some(p => SB.POWERS[p.power].tier === 2));
    tag.textContent = hold.map(p => SB.POWERS[p.power].icon + ' ' + (M.players.length > 2 ? p.name + ': ' : '') + SB.POWERS[p.power].name + (p.human ? ' (' + keyName(keySetsOf(p)[0].power) + ')' : '')).join(' · '); });
  $('pads').querySelectorAll('.shotpad').forEach(d => { const p = M.players[Number(d.dataset.p)]; const b = d.querySelector('.pw'); if(b) b.classList.toggle('ready', !!(p && p.power));
    d.querySelectorAll('.sbtn[data-a]').forEach(x => { if(x.dataset.a !== 'power') x.classList.toggle('armed', !!(p && p.queued === x.dataset.a && M.t - p.queuedT < 0.6)); }); });
  const sh = $('serve-hint'), b0 = M.balls[0], server = b0 && b0.held != null ? M.players[b0.held] : null;
  const stx = M.state === 'serve' && server && server.human && !server.remote && !G.paused ? sbsHint(M, sh, server) : null;   // 🎾 b3b6 toss → ⭕ glow
  if(stx){ if(sh.textContent !== stx) sh.textContent = stx; sh.classList.remove('hidden'); sh.classList.toggle('gold', stx.indexOf('⭕') === 0); }
  else sh.classList.add('hidden');
  sbsPads(M);
}

/* ---------- drawing ---------- */
const BG_CACHE = {key: '', cv: null};
function makeDeco(theme){ const T = THEMES[theme], r = SB.mkRng(theme.length * 997 + 13), list = []; for(let i = 0; i < 14; i++) list.push({e: T.deco[Math.floor(r() * T.deco.length)], u: r(), v: r(), s: 0.7 + r() * 0.8, ph: r() * 6}); return list; }
function draw(t){
  const cv = $('court'), g = cv.getContext('2d'); if(!V) resize(); const dpr = V.dpr || 1;
  g.setTransform(dpr, 0, 0, dpr, 0, 0); drawScene(g, V, G.M, G.theme, t, {});
  cheerRow(g);   // 📣 cs-1
}
// one painter for the court, the theme previews and the result picture
function drawScene(g, V, M, theme, t, opt){
  const T = THEMES[theme] || THEMES.classic, sp = M.sp, W = V.W, H = V.H, P = V.P;
  // sky / hall
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, T.sky[0]); gr.addColorStop(1, T.sky[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  ambient(g, T, W, H, t, opt.preview);
  // ground band
  const ext = sp.Lh + 6, wy = sp.Wh + 4.5;
  poly(g, [P(-ext, -wy), P(ext, -wy), P(ext, wy), P(-ext, wy)], T.ground);
  if(!opt.preview) decoAround(g, V, M, T, t);
  // court
  // 🏓 b3b6b people beyond the table's far end stand BEHIND it: painted between the hall floor and the table (and left out of the depth list below)
  const tblFar = sp.table ? Math.min.apply(null, [[-sp.Lh, -sp.Wh], [sp.Lh, -sp.Wh], [-sp.Lh, sp.Wh], [sp.Lh, sp.Wh]].map(c => V.depth(c[0], c[1]))) : -1e9;
  const behindT = sp.table ? M.players.filter(p => V.depth(p.x, p.y) < tblFar - 1e-6) : [];
  if(sp.kind === 'puck') drawRink(g, V, M, T); else if(sp.table) drawTable(g, V, M, T, () => behindT.forEach(p => drawPlayer(g, V, M, p, t))); else if(sp.squash) drawRoom(g, V, M, T); else drawCourt(g, V, M, T);
  surfaceLogos(g, V, M, theme, T);   // 🏷️ tb-1
  // element patches
  M.patches.forEach(q => { const E = SB.ELEMENTS[q.el], c = P(q.x, q.y, 0); g.save(); g.globalAlpha = Math.min(0.7, q.t / 2); g.fillStyle = E.col; ell(g, V, q.x, q.y, q.r); g.fill(); g.globalAlpha = 1; drawEmo(g, E.icon, c[0] + Math.sin(t * 3 + q.x) * 4, c[1], V.sc(q.x, q.y, 0) * 0.9); g.restore(); });
  // bounce marks + splats
  M.fx.forEach(f => { const c = P(f.x, f.y, 0), k = V.sc(f.x, f.y, 0); if(f.k === 'bounce'){ g.strokeStyle = 'rgba(255,255,255,' + (0.6 * (1 - f.t / f.life)) + ')'; g.lineWidth = 2; ell(g, V, f.x, f.y, 0.2 + f.t); g.stroke(); }
    if(f.k === 'wallhit'){ const w = P(f.x, f.y, f.z), a = 1 - f.t / f.life; g.save(); g.strokeStyle = 'rgba(255,255,255,' + a + ')'; g.lineWidth = 3; g.beginPath(); g.arc(w[0], w[1], 6 + f.t * 40, 0, 7); g.stroke(); g.restore(); }
    if(f.k === 'splat'){ g.fillStyle = 'rgba(80,200,255,' + (0.7 * (1 - f.t / f.life)) + ')'; for(let i = 0; i < 7; i++){ const a = i * 0.9; g.beginPath(); g.arc(c[0] + Math.cos(a) * k * (0.4 + f.t), c[1] + Math.sin(a) * k * 0.3 * (0.4 + f.t), k * 0.16, 0, 7); g.fill(); } } });
  // orb shadow
  if(M.orb){ const o = M.orb; g.fillStyle = 'rgba(0,0,0,0.25)'; ell(g, V, o.x, o.y, 0.5); g.fill(); }
  drawGuides(g, V, M, t, opt);   // 🎯 sb2-1 landing ring + aim arrow
  // ball shadows (fake split balls have no shadow — that is the clue)
  M.balls.forEach(b => { if(!b.live || !b.real) return; const k = Math.max(0.35, 1 - b.z / 4); g.fillStyle = 'rgba(0,0,0,' + (0.42 * k) + ')'; ell(g, V, b.x, b.y, 0.26 * k * (sp.kind === 'puck' ? 1.8 : 1.15), sp.table ? 0 : 0); g.fill();
    // dotted height line on high balls (sb2-1): how high it is = how far from its shadow
    if(b.z > 0.9 && sp.kind !== 'puck'){ const a = P(b.x, b.y, 0), c = P(b.x, b.y, b.z); g.save(); g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1.5; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.stroke(); g.restore(); } });
  // depth-sorted things: players, balls, net, orb
  const items = [];
  M.players.forEach(p => { if(behindT.indexOf(p) < 0) items.push({d: V.depth(p.x, p.y), f: () => drawPlayer(g, V, M, p, t)}); });   // 🏓 b3b6b (the ones behind the table are already painted)
  M.balls.forEach(b => { if(b.live) items.push({d: V.depth(b.x, b.y) + 0.01, f: () => drawBall(g, V, M, b, t, opt)}); });
  if(G && !opt.preview && typeof sbsDraw === 'function') items.push({d: 1e9, f: () => sbsDraw(g, V, M, t)});   // 🎾 b3b6 ⭕ ring + ⚡ spark
  if(sp.net) items.push({d: V.mode === 'side' && !V.portrait ? -sp.Wh - 0.5 : 0, f: () => drawNet(g, V, M, T)});
  if(M.orb) items.push({d: V.depth(M.orb.x, M.orb.y), f: () => drawOrb(g, V, M.orb, t)});
  items.sort((a, b) => a.d - b.d).forEach(it => it.f());
  if(sp.walls) drawGlass(g, V, M, T, true);
  // floating words
  if(G && !opt.preview){ G.fx = G.fx.filter(f => (f.t += 1 / 60) < f.life); G.fx.forEach(f => { const c = P(f.x, f.y, f.z + f.t * 1.2); g.save(); g.globalAlpha = 1 - f.t / f.life; g.font = '700 ' + Math.round(Math.max(14, Math.min(34, V.sc(f.x, f.y, 0) * 0.55))) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.55)'; g.strokeText(f.txt, c[0], c[1]); g.fillStyle = '#fff'; g.fillText(f.txt, c[0], c[1]); g.restore(); }); }
}
function poly(g, pts, fill, stroke, lw){ g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); if(fill){ g.fillStyle = fill; g.fill(); } if(stroke){ g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); } }
function line(g, a, b, col, lw){ g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
function drawEmo(g, ch, x, y, size){ emo(g, ch, x, y, size); }
// 🎯 sb2-1 aim help: where the coming ball lands (ring, Basic → Intermediate) + where YOUR hit goes with the stick as it is now (arrow, Basic + Junior)
function drawGuides(g, V, M, t, opt){
  if(!G || opt.preview || !G.help || G.level >= 3 || M.sp.kind === 'puck' || M.state !== 'play') return;
  const b = M.balls.find(x => x.live && x.real && x.held == null); if(!b) return;
  M.players.forEach(p => { if(!p.human || p.remote || b.owner === p.side) return;
    const land = SB.landingOf(M, b), mine = land && (M.sp.squash || (land.x < 0) === (p.side === 0));
    if(mine){ const pulse = 0.5 + 0.5 * Math.sin(t * 7); g.save(); g.strokeStyle = 'rgba(255,255,255,' + (0.55 + 0.35 * pulse) + ')'; g.lineWidth = 2.5; g.setLineDash([6, 5]); ell(g, V, land.x, land.y, 0.45 + 0.08 * pulse); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(255,255,255,0.18)'; ell(g, V, land.x, land.y, 0.22); g.fill(); g.restore(); }
    if(G.level <= 1){ const tg = SB.aimPreview(M, p, p.queued || 'normal'); if(!tg) return;
      const a = V.P(p.x, p.y, 0), c = V.P(tg.x, tg.y, 0), col = p.side === 0 ? '255,122,26' : '24,184,166', ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
      g.save(); g.strokeStyle = 'rgba(' + col + ',0.75)'; g.lineWidth = 3; g.setLineDash([8, 7]); g.lineDashOffset = -t * 30; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + c[0]) / 2, (a[1] + c[1]) / 2 - 18, c[0], c[1]); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(' + col + ',0.9)'; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] - Math.cos(ang - 0.45) * 13, c[1] - Math.sin(ang - 0.45) * 13); g.lineTo(c[0] - Math.cos(ang + 0.45) * 13, c[1] - Math.sin(ang + 0.45) * 13); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(' + col + ',0.95)'; g.lineWidth = 2.5; ell(g, V, tg.x, tg.y, 0.5); g.stroke(); drawEmo(g, '🎯', c[0], c[1] - 14, 16); g.restore();
      if(!G.aimTold && mine){ G.aimTold = true; banner('🎯 Tilt ⬅️ ➡️ (stick or arrows) while you hit — that is where the ball goes!', 'gold'); } }
  });
}   // AvatarKit emo(): cached emoji pictures (typing emoji every frame lags)
function ambient(g, T, W, H, t, still){
  if(T.amb === 'stars'){ for(let i = 0; i < 60; i++){ const x = (i * 97.3) % W, y = (i * 53.7) % (H * 0.9), a = 0.4 + 0.5 * Math.abs(Math.sin(t * 1.5 + i)); g.fillStyle = 'rgba(255,255,255,' + a + ')'; g.fillRect(x, y, 2, 2); } }
  else if(T.amb === 'bubble'){ for(let i = 0; i < 18; i++){ const x = (i * 131.7) % W, y = H - ((t * 30 + i * 77) % (H + 40)); g.strokeStyle = 'rgba(220,250,255,0.5)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x + Math.sin(t + i) * 6, y, 3 + (i % 4) * 2, 0, 7); g.stroke(); } }
  else if(T.amb === 'lights'){ for(let i = 0; i < 4; i++){ const a = Math.sin(t * 0.9 + i * 1.7) * 0.5, x = W * (0.15 + i * 0.23); g.save(); g.translate(x, 0); g.rotate(a); const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, ['rgba(255,80,200,0.35)', 'rgba(80,220,255,0.35)', 'rgba(255,225,74,0.35)', 'rgba(140,255,120,0.3)'][i]); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.beginPath(); g.moveTo(-6, 0); g.lineTo(6, 0); g.lineTo(90, H); g.lineTo(-90, H); g.fill(); g.restore(); } }
  else if(T.amb === 'cloud'){ for(let i = 0; i < 6; i++){ const x = ((t * 12 + i * 211) % (W + 200)) - 100, y = 20 + (i * 37) % Math.max(40, H * 0.25); g.fillStyle = 'rgba(255,255,255,0.75)'; [[0, 0, 22], [20, 4, 16], [-18, 6, 14]].forEach(([a, b, r]) => { g.beginPath(); g.arc(x + a, y + b, r, 0, 7); g.fill(); }); } }
  else if(T.amb === 'leaf'){ for(let i = 0; i < 10; i++){ const x = (i * 157.1 + t * 18) % W, y = (t * 25 + i * 91) % H; g.save(); g.translate(x, y); g.rotate(t + i); g.fillStyle = 'rgba(120,200,90,0.45)'; g.beginPath(); g.ellipse(0, 0, 6, 3, 0, 0, 7); g.fill(); g.restore(); } }
}
function decoAround(g, V, M, T, t){
  if(cheerScene(g, V, M, t)) return;   // 📣 cs-1
  const sp = M.sp; (G ? G.deco : []).forEach((d, i) => {
    // spots just outside the court on both long edges
    const side = i % 2 ? 1 : -1, x = (d.u - 0.5) * 2 * (sp.Lh + 3), y = side * (sp.Wh + 2.4 + d.v * 1.6);
    const c = V.P(x, y, 0), k = V.sc(x, y, 0); drawEmo(g, d.e, c[0], c[1] - k * 0.4 + Math.sin(t * 1.4 + d.ph) * 2, k * 0.75 * d.s);
  });
}
/* 🏷️ lg-1 LOGO BADGES — Aowu's logo sheet ("SlaBrall logos — style reference.png") redrawn in code: neon shield + sport icon + two-tone "Sla"+name.
   Recoloured per court theme, drawn once per sport × theme into a 240 px picture (cache), then copied wherever it is needed:
   menu main mark · sport cards · setup title · court / table / rink / room floor · cup + result cards. No image files. */
const SLA_PAL = {
  classic: {neon: '#36D6FF', neon2: '#FF8A1F', f1: '#17396D', f2: '#071426', sla: ['#FFFFFF', '#5FE0FF'], rest: ['#FFE45C', '#FF7A1A'], ink: '#06101F'},
  dino:    {neon: '#9BE15D', neon2: '#FFB23F', f1: '#255A2B', f2: '#0C1F0E', sla: ['#F6FFE0', '#A6EE62'], rest: ['#FFE07A', '#FF8A2A'], ink: '#0A1608'},
  sea:     {neon: '#3FF3E0', neon2: '#FF7F6B', f1: '#0C4A70', f2: '#041C2E', sla: ['#E6FFFF', '#3FF3E0'], rest: ['#FFD9B0', '#FF6B5B'], ink: '#03121E'},
  dance:   {neon: '#FF4FE3', neon2: '#FFE14A', f1: '#3D1468', f2: '#12051F', sla: ['#FFFFFF', '#FF8CF0'], rest: ['#FFF27A', '#FFB800'], ink: '#0D0318'},
  space:   {neon: '#8E7CFF', neon2: '#5CF2FF', f1: '#2A2470', f2: '#07051A', sla: ['#FFFFFF', '#B8F3FF'], rest: ['#EDE4FF', '#A585FF'], ink: '#05031A'},
  sky:     {neon: '#FFD34D', neon2: '#3DB2F0', f1: '#2D7FC4', f2: '#0F3F6E', sla: ['#FFFFFF', '#BFE8FF'], rest: ['#FFF0A0', '#F2A81D'], ink: '#0A2440'}
};
function slaPal(theme){ return SLA_PAL[theme] || SLA_PAL[Object.keys(SLA_PAL)[Math.max(0, THEME_KEYS.indexOf(theme)) % 6]] || SLA_PAL.classic; }
const SLA_FONT = (px, it) => (it === false ? '' : 'italic ') + '700 ' + px + 'px Fredoka, Nunito, "Arial Rounded MT Bold", sans-serif';
function slaWord(g, word, cx, cy, maxW, px, P, opt){   // two-tone lettering: "Sla" cool, the rest warm · thick dark edge · thin white line · neon glow
  opt = opt || {}; g.save(); g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.font = SLA_FONT(px);
  const a = word.slice(0, 3), b = word.slice(3); let w = g.measureText(word).width;
  if(w > maxW){ px = px * maxW / w; g.font = SLA_FONT(px); w = g.measureText(word).width; }
  const x0 = cx - w / 2, wa = g.measureText(a).width, top = cy - px * 0.72, bot = cy + px * 0.08;
  g.shadowColor = P.neon; g.shadowBlur = opt.glow == null ? px * 0.35 : opt.glow; g.strokeStyle = P.ink; g.lineWidth = px * 0.2;
  g.strokeText(word, x0, cy); g.shadowBlur = 0; g.lineWidth = px * 0.2; g.strokeText(word, x0, cy);
  const ga = g.createLinearGradient(0, top, 0, bot); ga.addColorStop(0, P.sla[0]); ga.addColorStop(1, P.sla[1]);
  const gb = g.createLinearGradient(0, top, 0, bot); gb.addColorStop(0, P.rest[0]); gb.addColorStop(1, P.rest[1]);
  g.fillStyle = ga; g.fillText(a, x0, cy); g.fillStyle = gb; g.fillText(b, x0 + wa, cy);
  g.lineWidth = Math.max(1, px * 0.03); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.strokeText(word, x0, cy);
  g.restore(); return px;
}
function slaShield(g, inset){   // 240-box shield: flat top with round corners, curved sides to a point
  const k = inset || 0; g.beginPath(); g.moveTo(52 + k, 14 + k); g.lineTo(188 - k, 14 + k); g.quadraticCurveTo(212 - k, 14 + k, 212 - k, 38 + k); g.lineTo(212 - k, 116);
  g.quadraticCurveTo(210 - k, 184 - k * 0.6, 120, 228 - k * 1.3); g.quadraticCurveTo(30 + k, 184 - k * 0.6, 28 + k, 116); g.lineTo(28 + k, 38 + k); g.quadraticCurveTo(28 + k, 14 + k, 52 + k, 14 + k); g.closePath();
}
function slaLines(g, pts, col, w){ g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; pts.forEach(([x0, y0, x1, y1]) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }); }
function slaBallT(g, x, y, r, c1, c2, seam){   // a round ball with a soft light + optional tennis seam
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(1.5, r * 0.08); g.stroke();
  if(seam){ g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = Math.max(1.5, r * 0.12); g.beginPath(); g.arc(x - r * 1.05, y, r * 0.75, -0.95, 0.95); g.stroke(); g.beginPath(); g.arc(x + r * 1.05, y, r * 0.75, Math.PI - 0.95, Math.PI + 0.95); g.stroke(); }
}
function slaNet(g, x0, x1, yTop, yBot, P){   // posts + mesh + white tape
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x0, yTop, x1 - x0, yBot - yTop);
  g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1.2; for(let x = x0; x <= x1; x += 7){ g.beginPath(); g.moveTo(x, yTop); g.lineTo(x, yBot); g.stroke(); } for(let y = yTop; y <= yBot; y += 6){ g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
  g.fillStyle = '#FFFFFF'; g.fillRect(x0 - 2, yTop - 3, x1 - x0 + 4, 5); g.fillStyle = P.neon; g.fillRect(x0 - 5, yTop - 6, 6, yBot - yTop + 10); g.fillRect(x1 - 1, yTop - 6, 6, yBot - yTop + 10);
}
function slaRacket(g, x, y, ang, rx, ry, frame, handleLen, opt){   // oval racket head at (x,y) turned by ang, strings, throat + handle
  opt = opt || {}; g.save(); g.translate(x, y); g.rotate(ang);
  g.strokeStyle = opt.grip || '#2B2B33'; g.lineCap = 'round'; g.lineWidth = opt.shaft || 7; g.beginPath(); g.moveTo(0, ry * 0.9); g.lineTo(0, ry + handleLen * 0.55); g.stroke();
  g.lineWidth = (opt.shaft || 7) * 1.6; g.beginPath(); g.moveTo(0, ry + handleLen * 0.55); g.lineTo(0, ry + handleLen); g.stroke();
  g.save(); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.clip(); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 1.3; const st = opt.strings || 7;
  for(let i = -rx; i <= rx; i += st){ g.beginPath(); g.moveTo(i, -ry); g.lineTo(i, ry); g.stroke(); } for(let j = -ry; j <= ry; j += st){ g.beginPath(); g.moveTo(-rx, j); g.lineTo(rx, j); g.stroke(); } g.restore();
  g.strokeStyle = frame; g.lineWidth = opt.rim || 6; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(0, 0, rx - 1, ry - 1, 0, 3.6, 5.2); g.stroke();
  g.restore();
}
const SLA_ICON = {
  slaball(g, P){   // 🎾 tennis: racket + ball over the net
    slaNet(g, 50, 190, 112, 136, P);
    slaRacket(g, 142, 66, 0.62, 30, 40, P.neon2, 58, {});
    slaLines(g, [[34, 46, 58, 52], [30, 60, 56, 62], [36, 74, 58, 72]], 'rgba(255,255,255,0.7)', 3);
    slaBallT(g, 82, 60, 19, '#F4FF8A', '#9BD11A', true);
  },
  slapong(g, P){   // 🏓 ping-pong: round red paddle + small ball + low net
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(44, 128, 152, 8); slaNet(g, 60, 180, 116, 128, P);
    g.save(); g.translate(104, 80); g.rotate(-0.55);
    g.fillStyle = '#C98A4B'; g.strokeStyle = '#7A4E25'; g.lineWidth = 2; g.beginPath(); g.roundRect ? g.roundRect(-8, 26, 16, 48, 6) : g.rect(-8, 26, 16, 48); g.fill(); g.stroke();
    g.fillStyle = '#1B1B1F'; g.beginPath(); g.arc(0, 0, 41, 0, 7); g.fill();
    const rg = g.createRadialGradient(-12, -14, 4, 0, 0, 38); rg.addColorStop(0, '#FF8A6E'); rg.addColorStop(1, '#D8261C'); g.fillStyle = rg; g.beginPath(); g.arc(0, -1, 37, 0, 7); g.fill();
    g.restore();
    g.setLineDash([5, 6]); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(150, 46); g.quadraticCurveTo(178, 66, 176, 106); g.stroke(); g.setLineDash([]);
    slaBallT(g, 150, 46, 11, '#FFE2B8', '#FF8A1F', false);
  },
  slapoof(g, P){   // 🥒 pickleball: long solid paddle + holey ball
    g.save(); g.translate(98, 78); g.rotate(-0.45);
    g.fillStyle = '#2B2B33'; g.beginPath(); g.roundRect ? g.roundRect(-9, 40, 18, 46, 6) : g.rect(-9, 40, 18, 46); g.fill();
    const lg = g.createLinearGradient(-30, -50, 30, 50); lg.addColorStop(0, '#7FD3FF'); lg.addColorStop(1, '#1F6FE0'); g.fillStyle = lg;
    g.strokeStyle = '#0B2E66'; g.lineWidth = 4; g.beginPath(); g.roundRect ? g.roundRect(-30, -52, 60, 96, 22) : g.rect(-30, -52, 60, 96); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-20, -38); g.lineTo(-20, 22); g.stroke();
    g.restore();
    slaLines(g, [[176, 92, 196, 104], [184, 80, 204, 88]], 'rgba(255,255,255,0.7)', 3);
    slaBallT(g, 160, 60, 20, '#FFF7A0', '#F2C511', false);
    g.fillStyle = 'rgba(120,90,0,0.55)'; [[0, 0], [-9, -7], [9, -7], [-8, 8], [8, 8], [0, -14], [0, 14]].forEach(([dx, dy]) => { g.beginPath(); g.arc(160 + dx, 60 + dy, 3, 0, 7); g.fill(); });
  },
  slashot(g, P){   // 🏒 table hockey: the table from the end — slot goal, mallet + puck
    g.fillStyle = '#E9F6FF'; g.strokeStyle = P.neon2; g.lineWidth = 6; g.beginPath(); g.moveTo(66, 44); g.lineTo(174, 44); g.lineTo(202, 136); g.lineTo(38, 136); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(31,111,224,0.18)'; for(let i = 0; i < 5; i++) for(let j = 0; j < 9; j++){ const yy = 54 + i * 18, ww = 0.5 + i * 0.12; g.beginPath(); g.arc(120 + (j - 4) * 15 * (0.8 + i * 0.1), yy, 1.6, 0, 7); g.fill(); }
    g.strokeStyle = '#E8402F'; g.lineWidth = 3; g.beginPath(); g.moveTo(52, 90); g.lineTo(188, 90); g.stroke();
    g.strokeStyle = 'rgba(232,64,47,0.8)'; g.beginPath(); g.ellipse(120, 90, 22, 9, 0, 0, 7); g.stroke();
    g.fillStyle = '#10141C'; g.fillRect(100, 39, 40, 9); g.fillStyle = P.neon; g.fillRect(96, 36, 6, 12); g.fillRect(138, 36, 6, 12);
    slaLines(g, [[106, 82, 112, 64], [120, 84, 120, 62], [134, 82, 128, 64]], 'rgba(31,60,120,0.55)', 3);
    g.fillStyle = '#10141C'; g.beginPath(); g.ellipse(120, 96, 13, 6, 0, 0, 7); g.fill(); g.fillStyle = '#3A4252'; g.beginPath(); g.ellipse(120, 94, 13, 6, 0, 0, 7); g.fill();
    const mx = 150, my = 120; g.fillStyle = '#A11A12'; g.beginPath(); g.ellipse(mx, my + 5, 25, 12, 0, 0, 7); g.fill();
    const mg = g.createRadialGradient(mx - 8, my - 6, 2, mx, my, 26); mg.addColorStop(0, '#FF8A6E'); mg.addColorStop(1, '#E8402F'); g.fillStyle = mg; g.beginPath(); g.ellipse(mx, my, 25, 12, 0, 0, 7); g.fill();
    g.fillStyle = '#A11A12'; g.fillRect(mx - 8, my - 22, 16, 20); g.beginPath(); g.ellipse(mx, my - 2, 8, 4, 0, 0, 7); g.fill();
    g.fillStyle = '#FF6A55'; g.beginPath(); g.ellipse(mx, my - 22, 8, 4, 0, 0, 7); g.fill();
  },
  slabam(g, P){   // 🏸 badminton: high net + thin racket + shuttle
    slaNet(g, 50, 190, 100, 122, P); g.fillStyle = P.neon; g.fillRect(45, 94, 6, 46); g.fillRect(189, 94, 6, 46);
    slaRacket(g, 148, 58, 0.5, 22, 29, P.neon2, 70, {shaft: 4, strings: 6, rim: 5});
    g.save(); g.translate(84, 60); g.rotate(-0.75);
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.strokeStyle = 'rgba(80,90,110,0.8)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-8, 4); g.lineTo(-20, 40); g.lineTo(20, 40); g.lineTo(8, 4); g.closePath(); g.fill(); g.stroke();
    for(let i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(i * 3.5, 4); g.lineTo(i * 9, 40); g.stroke(); }
    g.strokeStyle = P.neon2; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-15, 26); g.lineTo(15, 26); g.stroke();
    g.fillStyle = '#F5F0E6'; g.beginPath(); g.arc(0, 2, 10, Math.PI, 0); g.lineTo(10, 6); g.lineTo(-10, 6); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.stroke();
    g.restore();
    slaLines(g, [[50, 34, 66, 42], [44, 48, 62, 52]], 'rgba(255,255,255,0.7)', 3);
  },
  slawall(g, P){   // 🧱 squash: the front wall with the red out-line + tin, squash racket, small dark ball
    const wg = g.createLinearGradient(0, 30, 0, 136); wg.addColorStop(0, '#F4F7FB'); wg.addColorStop(1, '#C9D3E0'); g.fillStyle = wg; g.strokeStyle = P.neon; g.lineWidth = 4;
    g.beginPath(); g.moveTo(52, 30); g.lineTo(188, 30); g.lineTo(188, 136); g.lineTo(52, 136); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#E8402F'; g.fillRect(52, 44, 136, 5); g.fillRect(52, 118, 136, 10);
    g.strokeStyle = 'rgba(232,64,47,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(52, 92); g.lineTo(188, 92); g.stroke();
    slaRacket(g, 146, 82, 0.42, 25, 33, P.neon2, 50, {shaft: 6});
    slaLines(g, [[56, 60, 74, 66], [58, 76, 76, 76]], 'rgba(80,90,110,0.6)', 3);
    slaBallT(g, 92, 70, 11, '#4A4F5C', '#111318', false); g.fillStyle = '#FFE14A'; g.beginPath(); g.arc(88, 66, 2.6, 0, 7); g.arc(96, 66, 2.6, 0, 7); g.fill();
  }
};
const SLA_BADGE_CACHE = {};
function slaBadge(sportId, theme){   // one 240 px badge picture per sport × theme (cached)
  const key = sportId + ':' + (theme || 'classic'); if(SLA_BADGE_CACHE[key]) return SLA_BADGE_CACHE[key];
  const sp = SB.SPORTS[sportId] || SB.SPORTS.slapong, P = slaPal(theme), c = document.createElement('canvas'); c.width = 240; c.height = 240;
  const g = c.getContext('2d'); if(!g) return null;
  g.save(); slaShield(g); const fg = g.createLinearGradient(0, 14, 0, 228); fg.addColorStop(0, P.f1); fg.addColorStop(1, P.f2); g.fillStyle = fg; g.fill();
  g.clip(); const rg = g.createRadialGradient(120, 80, 6, 120, 80, 120); rg.addColorStop(0, 'rgba(255,255,255,0.22)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 240, 240);
  try{ (SLA_ICON[sp.id] || SLA_ICON.slapong)(g, P); }catch(e){} g.restore();
  g.save(); g.lineJoin = 'round'; g.shadowColor = P.neon; g.shadowBlur = 16; g.strokeStyle = P.neon; g.lineWidth = 7; slaShield(g); g.stroke();
  g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 1.5; slaShield(g); g.stroke();
  g.strokeStyle = P.neon2; g.lineWidth = 3; slaShield(g, 9); g.stroke(); g.restore();
  // the name banner across the lower part (wider than the shield, like the sheet)
  g.save(); g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.moveTo(22, 150); g.lineTo(218, 150); g.lineTo(212, 196); g.lineTo(28, 196); g.closePath(); g.fill(); g.restore();
  slaWord(g, sp.name, 120, 188, 226, 50, P);
  return (SLA_BADGE_CACHE[key] = c);
}
const SLA_MARK_CACHE = {};
function slaMark(theme){   // 🏓 the main mark: swoosh + burst + ball, "SlaBrall", tagline (720 × 330 picture, cached per theme)
  const key = theme || 'classic'; if(SLA_MARK_CACHE[key]) return SLA_MARK_CACHE[key];
  const P = slaPal(theme), c = document.createElement('canvas'); c.width = 720; c.height = 330; const g = c.getContext('2d'); if(!g) return null;
  const bx = 452, by = 108, br = 62;
  // swoosh arc
  g.save(); g.lineCap = 'round'; const sw = g.createLinearGradient(140, 0, 600, 0); sw.addColorStop(0, 'rgba(255,255,255,0)'); sw.addColorStop(0.5, P.sla[1]); sw.addColorStop(1, '#FFFFFF');
  g.strokeStyle = sw; g.lineWidth = 16; g.shadowColor = P.neon; g.shadowBlur = 18; g.beginPath(); g.ellipse(380, 210, 250, 168, 0, Math.PI * 1.08, Math.PI * 1.86); g.stroke();
  g.lineWidth = 6; g.strokeStyle = P.neon2; g.beginPath(); g.ellipse(380, 210, 228, 150, 0, Math.PI * 1.12, Math.PI * 1.8); g.stroke(); g.restore();
  // burst
  g.save(); g.translate(bx + 16, by - 6); const bg = g.createRadialGradient(0, 0, 10, 0, 0, 120); bg.addColorStop(0, '#FFF2A8'); bg.addColorStop(0.5, P.rest[1]); bg.addColorStop(1, 'rgba(255,90,20,0)');
  g.fillStyle = bg; g.beginPath(); for(let i = 0; i < 22; i++){ const a = i * Math.PI / 11, d = i % 2 ? 58 : 112 + (i % 4) * 8; g.lineTo(Math.cos(a) * d, Math.sin(a) * d); } g.closePath(); g.fill(); g.restore();
  // speed streaks
  slaLines(g, [[230, 92, 372, 100], [250, 124, 378, 122], [276, 150, 384, 140], [300, 70, 380, 82]], P.sla[1], 7);
  slaLines(g, [[262, 108, 380, 112], [300, 138, 388, 132]], P.rest[1], 5);
  // the ball
  g.save(); g.shadowColor = P.neon; g.shadowBlur = 24; slaBallT(g, bx, by, br, '#F7FF9C', '#5DBB1A', true); g.restore();
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(bx - 22, by - 28, 20, 11, -0.6, 0, 7); g.fill();
  slaWord(g, 'SlaBrall', 360, 258, 660, 132, P, {glow: 26});
  // tagline
  g.save(); g.font = '700 30px Fredoka, Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.strokeStyle = P.ink; g.lineWidth = 8; g.strokeText('THE ULTIMATE SLAP & RALLY GAME', 360, 300); g.fillStyle = '#FFFFFF'; g.fillText('THE ULTIMATE SLAP & RALLY GAME', 360, 300); g.restore();
  return (SLA_MARK_CACHE[key] = c);
}
function slaCanvas(pic, w, h, cls){   // a sharp DOM copy of a cached picture (device pixel ratio aware)
  const el = document.createElement('canvas'), d = Math.min(3, window.devicePixelRatio || 1); el.width = Math.round(w * d); el.height = Math.round(h * d);
  el.style.width = w + 'px'; el.style.height = h + 'px'; if(cls) el.className = cls; const g = el.getContext('2d'); if(g && pic) g.drawImage(pic, 0, 0, el.width, el.height); return el;
}
function slaTheme(){ return (typeof SET !== 'undefined' && SET.theme) || 'classic'; }
function slaPaintLogos(){   // put the badges + main mark into the menus (safe to call again: replaces what is there)
  try{
    const th = slaTheme();
    ['scr-menu', 'scr-player'].forEach(id => { const t = document.querySelector('#' + id + ' .title'), lg = t && t.querySelector('.logo'), pic = slaMark(th); if(!lg || !pic) return;
      lg.textContent = ''; const el = slaCanvas(pic, 380, 174, 'sla-mark'); el.style.width = ''; el.style.height = ''; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'SlaBrall — the ultimate slap & rally game');
      lg.appendChild(el); lg.classList.add('sla-on'); t.classList.add('has-mark'); });
    document.querySelectorAll('#sport-list .ui-mbtn').forEach(b => { const k = b.dataset.k, mi = b.querySelector('.mi'); if(!mi || !SB.SPORTS[k]) return; const pic = slaBadge(k, th); if(!pic) return;
      mi.textContent = ''; mi.classList.add('sla-mi'); const el = slaCanvas(pic, 44, 44); el.style.width = ''; el.style.height = ''; el.setAttribute('aria-label', SB.SPORTS[k].name); mi.appendChild(el); });
  }catch(e){}
}
function slaLogoInto(box, sportId, px){   // the sport's badge inside a .logo box (setup title, cup bracket)
  try{ const pic = slaBadge(sportId, slaTheme()); if(!box || !pic) return false; box.textContent = ''; box.appendChild(slaCanvas(pic, px, px)); box.classList.add('sla-on'); return true; }catch(e){ return false; }
}
function slaResultBadge(){   // a small badge on top of the result card (match + cup)
  try{ const card = $('result-card'), sp = (G && G.M && G.M.sp) || SB.SPORTS[SET.sport]; if(!card || !sp || card.querySelector('.res-badge')) return; const pic = slaBadge(sp.id, (G && G.theme) || slaTheme()); if(!pic) return;
    const el = slaCanvas(pic, 58, 58, 'res-badge'); el.style.width = ''; el.style.height = ''; card.insertBefore(el, card.firstChild); }catch(e){}
}
if(document.fonts && document.fonts.load) document.fonts.load(SLA_FONT(40)).then(() => {   // the real font arrived → draw the lettering again
  if(!document.fonts.check(SLA_FONT(40))) return; Object.keys(SLA_BADGE_CACHE).forEach(k => delete SLA_BADGE_CACHE[k]); Object.keys(SLA_MARK_CACHE).forEach(k => delete SLA_MARK_CACHE[k]); slaPaintLogos();
}).catch(() => {});
/* 🏷️ END LOGO BADGES */
/* 🏷️ tb-1 the sport's "Sla…" logo painted on the court / table / rink / room floor — every court theme has its own style (font, colours, badge).
   Drawn once into a small picture per sport × theme, then laid flat on the surface (one per half, each readable from its own end). */
const LOGO_STYLE = {   // theme → look (unknown themes get one from the list by their position)
  classic: {font: '900 italic', a: '#FFFFFF', b: '#1E2A33', fx: 'swoosh'}, dino: {font: '900', a: '#F6F1D1', b: '#3B2A1E', fx: 'bones'}, sea: {font: '800 italic', a: '#E6FBFF', b: '#0B2A40', fx: 'waves'},
  dance: {font: '900 italic', a: '#FFE14A', b: '#FF2BD6', fx: 'neon'}, space: {font: '900', a: '#B8F3FF', b: '#5B2EFF', fx: 'stars'}, sky: {font: '800', a: '#FFFFFF', b: '#2CA6DE', fx: 'clouds'}};
const LOGO_FALLBACK = [{font: '900 italic', fx: 'swoosh'}, {font: '900', fx: 'stars'}, {font: '800 italic', fx: 'waves'}, {font: '900', fx: 'neon'}, {font: '900 italic', fx: 'bones'}, {font: '800', fx: 'clouds'}];
const LOGO_CACHE = {};
function logoPic(sp, theme, T){
  const key = sp.id + ':' + theme; if(LOGO_CACHE[key]) return LOGO_CACHE[key];
  const i = Math.max(0, THEME_KEYS.indexOf(theme)), st = Object.assign({a: T.line || '#FFFFFF', b: T.net || '#1E2A33'}, LOGO_FALLBACK[i % LOGO_FALLBACK.length], LOGO_STYLE[theme] || {});
  const c = document.createElement('canvas'); c.width = 560; c.height = 170; const g = c.getContext('2d'), name = sp.name, sla = name.slice(0, 3), rest = name.slice(3);
  g.textBaseline = 'middle'; g.lineJoin = 'round';
  const F = px => st.font + ' ' + px + 'px Fredoka, Nunito, sans-serif';
  g.font = F(92); const w1 = g.measureText(sla).width, w2 = g.measureText(rest).width, x0 = 280 - (w1 + w2 + 70) / 2 + 70;
  if(st.fx === 'swoosh'){ g.strokeStyle = st.a; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0 - 20, 140); g.quadraticCurveTo(280, 165, x0 + w1 + w2 + 10, 118); g.stroke(); }
  if(st.fx === 'waves'){ g.strokeStyle = st.a; g.lineWidth = 6; g.beginPath(); for(let x = x0 - 20; x < x0 + w1 + w2 + 20; x += 4) g.lineTo(x, 145 + Math.sin(x / 14) * 7); g.stroke(); }
  if(st.fx === 'stars'){ g.fillStyle = st.a; [[x0 - 30, 30], [x0 + w1 + w2 + 20, 40], [x0 + w1 + w2 + 6, 140], [x0 + 40, 150]].forEach(([x, y], k) => { const r = k % 2 ? 9 : 13; g.beginPath(); for(let j = 0; j < 10; j++){ const q = j * Math.PI / 5 - Math.PI / 2, d = j % 2 ? r * 0.4 : r; g.lineTo(x + Math.cos(q) * d, y + Math.sin(q) * d); } g.fill(); }); }
  if(st.fx === 'bones'){ g.fillStyle = st.a; [x0 - 4, x0 + w1 + w2 - 40].forEach(x => { g.fillRect(x, 140, 50, 8); [0, 50].forEach(dx => { g.beginPath(); g.arc(x + dx, 140, 7, 0, 7); g.arc(x + dx, 148, 7, 0, 7); g.fill(); }); }); }
  if(st.fx === 'clouds'){ g.fillStyle = st.a; [[x0 - 24, 128], [x0 + w1 + w2 + 4, 134]].forEach(([x, y]) => [[0, 0, 16], [16, -6, 20], [34, 0, 15]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx, y + dy, r, 0, 7); g.fill(); })); }
  if(st.fx === 'neon'){ g.shadowColor = st.b; g.shadowBlur = 22; }
  g.font = F(92); g.lineWidth = 12; g.strokeStyle = st.b; g.strokeText(sla, x0, 80); g.strokeText(rest, x0 + w1, 80);
  g.fillStyle = st.b; g.fillText(sla, x0, 80); g.fillStyle = st.a; g.fillText(rest, x0 + w1, 80);
  g.lineWidth = 3; g.strokeStyle = st.a; g.strokeText(sla, x0, 80); g.shadowBlur = 0;
  emo(g, T.icon || sp.icon, x0 - 44, 80, 64);   // the court theme's badge
  return (LOGO_CACHE[key] = c);
}
function layText(g, V, pic, x, y, len){   // the picture flat on the floor at (x, y), text along the width — always readable from where YOU look (never mirrored / upside down)
  const a = V.P(x, y, 0), e1 = V.P(x, y + 1, 0), e2 = V.P(x + 1, y, 0), s = len / pic.width;
  let ux = [(e1[0] - a[0]) * s, (e1[1] - a[1]) * s], vy = [(e2[0] - a[0]) * s, (e2[1] - a[1]) * s];
  if(ux[0] * vy[1] - ux[1] * vy[0] < 0) vy = [-vy[0], -vy[1]];   // no mirror writing
  if(ux[0] < -1e-6 || (Math.abs(ux[0]) < 1e-6 && ux[1] > 0)){ ux = [-ux[0], -ux[1]]; vy = [-vy[0], -vy[1]]; }   // left → right on screen
  g.save(); g.translate(a[0], a[1]); g.transform(ux[0], ux[1], vy[0], vy[1], 0, 0); g.drawImage(pic, -pic.width / 2, -pic.height / 2); g.restore();
}
function layBadge(g, V, pic, x, y, len){   // 🏷️ lg-1 a square badge flat on the floor, turned so it stands upright on YOUR screen (never mirrored)
  const a = V.P(x, y, 0), b = V.P(x + 1, y, 0), c = V.P(x, y + 1, 0), ex = [b[0] - a[0], b[1] - a[1]], ey = [c[0] - a[0], c[1] - a[1]], s = len / pic.width;
  let best = null; [ex, [-ex[0], -ex[1]], ey, [-ey[0], -ey[1]]].forEach((d, i) => { const o = i < 2 ? ey : ex; let r = [o[0], o[1]]; if(r[0] * d[1] - r[1] * d[0] < 0) r = [-r[0], -r[1]];
    const sc = d[1] / (Math.hypot(d[0], d[1]) || 1); if(!best || sc > best.sc) best = {sc, r, d}; });
  g.save(); g.translate(a[0], a[1]); g.transform(best.r[0] * s, best.r[1] * s, best.d[0] * s, best.d[1] * s, 0, 0); g.drawImage(pic, -pic.width / 2, -pic.height / 2); g.restore();
}
function surfaceLogos(g, V, M, theme, T){
  const sp = M.sp, bd = slaBadge(sp.id, theme), pic = bd || logoPic(sp, theme, T), layLogo = bd ? layBadge : layText; g.save(); g.globalAlpha = sp.table ? 0.55 : 0.42;   // 🏷️ lg-1 badge (tb-1 text picture = fallback)
  if(sp.squash) layLogo(g, V, pic, -sp.Lh * 0.55, 0, Math.min(sp.Wh * 1.1, sp.Lh * 0.8));   // 🧱 on the back of the room floor
  else if(sp.kind === 'puck') layLogo(g, V, pic, 0, 0, sp.Wh * 0.9);   // 🏒 centre ice
  else [-1, 1].forEach(sd => layLogo(g, V, pic, sd * sp.Lh * (sp.table ? 0.5 : 0.48), 0, Math.min(sp.Wh * (sp.table ? 1.1 : 0.95), sp.Lh * 0.62)));   // one on each half (🏷️ lg-1 square badge)
  g.restore();
}
function courtPts(V, x0, y0, x1, y1, z){ return [V.P(x0, y0, z), V.P(x1, y0, z), V.P(x1, y1, z), V.P(x0, y1, z)]; }
function drawCourt(g, V, M, T){
  const sp = M.sp, L = sp.Lh, W = sp.Wh, s0 = M.side[0], s1 = M.side[1];
  poly(g, courtPts(V, -L - 1.2, -W - 1.2, L + 1.2, W + 1.2, 0), T.court2);
  poly(g, courtPts(V, -L, -W, 0, W, 0), T.court); poly(g, courtPts(V, 0, -W, L, W, 0), T.court);
  if(sp.kitchen){ const k = sp.kitchen; poly(g, courtPts(V, -k, -W, k, W, 0), 'rgba(255,214,90,0.35)'); [[-k, -W], [k, -W]].forEach(([x]) => line(g, V.P(x, -W, 0), V.P(x, W, 0), T.line, 2)); const c = V.P(-k / 2, 0, 0), c2 = V.P(k / 2, 0, 0); drawEmo(g, '🥒', c[0], c[1], V.sc(-k / 2, 0, 0) * 0.6); drawEmo(g, '🥒', c2[0], c2[1], V.sc(k / 2, 0, 0) * 0.6); }
  poly(g, courtPts(V, -L, -W, L, W, 0), null, T.line, 2.5);
  line(g, V.P(-L, 0, 0), V.P(-(sp.kitchen || L * 0.55), 0, 0), T.line, 2); line(g, V.P(L, 0, 0), V.P(sp.kitchen || L * 0.55, 0, 0), T.line, 2);
  if(sp.scoring === 'tennis' && !sp.walls){ [-1, 1].forEach(sd => line(g, V.P(sd * L * 0.55, -W, 0), V.P(sd * L * 0.55, W, 0), T.line, 2)); }
  // shrunken court (🥅 power): glowing smaller box
  [s0, s1].forEach((S, side) => { if(S.shrink > 0){ const l = SB.courtL(M, side), w = SB.courtW(M, side), d = side === 0 ? -1 : 1; poly(g, courtPts(V, 0, -w, d * l, w, 0), 'rgba(255,200,69,0.18)', '#FFC845', 3); } });
  if(sp.walls) drawGlass(g, V, M, T, false);
}
// 🧱 sb2-2 squash room: floor + lines, the far walls solid (red out-line on top, red tin at the front wall), the near walls are see-through glass (drawGlass)
function drawRoom(g, V, M, T){
  const sp = M.sp, L = sp.Lh, W = sp.Wh, h = sp.wallH, P = V.P;
  poly(g, courtPts(V, -L - 0.6, -W - 0.6, L + 0.6, W + 0.6, 0), T.court2);
  poly(g, courtPts(V, -L, -W, L, W, 0), T.court);
  const ln = (a, b) => line(g, V.P(a[0], a[1], 0), V.P(b[0], b[1], 0), T.line, 2);
  const short = -L * 0.1; ln([short, -W], [short, W]); ln([short, 0], [-L, 0]);
  [[-1], [1]].forEach(([sd]) => { const bx = short - 1.6; ln([bx, sd * W], [bx, sd * (W - 1.6)]); ln([bx, sd * (W - 1.6)], [short, sd * (W - 1.6)]); });
  const walls = [[[L, -W], [L, W]], [[-L, W], [L, W]], [[-L, -W], [-L, W]], [[-L, -W], [L, -W]]];
  walls.forEach(([a, b]) => { const d = V.depth((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); if(d > Math.min(L, W) * 0.3) return;   // the near walls come later as glass
    poly(g, [P(a[0], a[1], 0), P(b[0], b[1], 0), P(b[0], b[1], h), P(a[0], a[1], h)], T.wall || 'rgba(235,240,248,0.92)', 'rgba(0,0,0,0.18)', 1.5);
    line(g, P(a[0], a[1], h), P(b[0], b[1], h), '#E63946', 3);
    if(a[0] === L && b[0] === L){ poly(g, [P(L, -W, 0), P(L, W, 0), P(L, W, 0.45), P(L, -W, 0.45)], 'rgba(230,57,70,0.75)'); line(g, P(L, -W, 1.8), P(L, W, 1.8), 'rgba(230,57,70,0.6)', 2); } });
}
function drawGlass(g, V, M, T, front){
  const sp = M.sp, L = sp.Lh, W = sp.Wh, h = sp.wallH, P = V.P;
  const walls = [[[-L, -W], [L, -W]], [[-L, W], [L, W]], [[-L, -W], [-L, W]], [[L, -W], [L, W]]];
  walls.forEach(([a, b]) => { const d = V.depth((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); const isFront = V.mode === 'side' ? (V.portrait ? d < -L * 0.5 : d > W * 0.5) : d > Math.min(L, W) * 0.3; if(isFront !== front) return;
    poly(g, [P(a[0], a[1], 0), P(b[0], b[1], 0), P(b[0], b[1], h), P(a[0], a[1], h)], front ? 'rgba(255,255,255,0.03)' : T.glass, front ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.55)', 1.5); });
}
function drawNet(g, V, M, T){
  const sp = M.sp, W = sp.Wh + (sp.table ? 0.25 : 0.45), h = sp.net, P = V.P;
  const lean = V.mode === 'side' && !V.portrait ? -V.s * 0.32 : 0, a = P(0, -W, 0), b = P(0, W, 0), c0 = P(0, W, h), d0 = P(0, -W, h), c = [c0[0] + lean, c0[1]], d = [d0[0] + lean, d0[1]];   // landscape: lean the net toward the camera so it reads as a band
  poly(g, [a, b, c, d], 'rgba(20,20,20,0.28)');
  g.save(); g.beginPath(); [a, b, c, d].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip(); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1;
  const top = y => { const q = P(0, y, h); return [q[0] + lean, q[1]]; }, mid = (y, f) => { const q = P(0, y, h * f); return [q[0] + lean * f, q[1]]; };
  for(let i = 0; i <= 24; i++){ const y = -W + i * 2 * W / 24; line(g, P(0, y, 0), top(y), 'rgba(255,255,255,0.3)', 1); } for(let j = 1; j < 4; j++) line(g, mid(-W, j / 4), mid(W, j / 4), 'rgba(255,255,255,0.3)', 1); g.restore();
  line(g, d, c, '#FFFFFF', 3); [a, b].forEach((p, i) => line(g, p, i ? c : d, T.net, 4));
}
function drawTable(g, V, M, T, behind){   /* 🏓 b3b6b behind() = paint the people beyond the far end here: after the hall floor, before the table */
  const sp = M.sp, L = sp.Lh, W = sp.Wh, P = V.P;
  // tb-1: a real table — the hall floor under it (planks), a soft shadow, 4 legs, a thick edge, then the top (z = 0 = the table top, the floor is z = -0.9)
  const FZ = -0.9, FL = L + 3.6, FW = W + 2.6;
  poly(g, courtPts(V, -FL, -FW, FL, FW, FZ), 'rgba(0,0,0,0.16)', 'rgba(255,255,255,0.25)', 2);
  g.save(); g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 1.5; for(let yy = -FW + 0.9; yy < FW; yy += 0.9) line(g, P(-FL, yy, FZ), P(FL, yy, FZ), 'rgba(255,255,255,0.08)', 1.5); g.restore();
  poly(g, courtPts(V, -L + 0.3, -W + 0.5, L + 0.9, W + 0.9, FZ), 'rgba(0,0,0,0.3)');   // shadow on the floor
  if(behind) behind();   // 🏓 b3b6b the table goes IN FRONT of them
  [[-L * 0.8, -W * 0.85], [L * 0.8, -W * 0.85], [-L * 0.8, W * 0.85], [L * 0.8, W * 0.85]].forEach(([x, y]) => line(g, P(x, y, FZ), P(x, y, -0.12), '#2B2D42', Math.max(3, V.sc(x, y, 0) * 0.16)));
  const edge = shade(T.table, 0.62);   // the thick edge (all 4 sides — the ones facing you show)
  [[-L, -W, L, -W], [L, -W, L, W], [L, W, -L, W], [-L, W, -L, -W]].forEach(([x0, y0, x1, y1]) => poly(g, [P(x0, y0, 0), P(x1, y1, 0), P(x1, y1, -0.16), P(x0, y0, -0.16)], edge, 'rgba(0,0,0,0.35)', 1));
  if(V.mode === 'top'){ const q = courtPts(V, -L, -W, L, W, 0), dz = Math.max(5, V.sc(0, 0, 0) * 0.16), bot = q.slice().sort((m, n) => n[1] - m[1]).slice(0, 2).sort((m, n) => m[0] - n[0]);   // flat top view: show the edge as a band under the bottom side
    poly(g, [bot[0], bot[1], [bot[1][0], bot[1][1] + dz], [bot[0][0], bot[0][1] + dz]], edge, 'rgba(0,0,0,0.35)', 1); }
  poly(g, courtPts(V, -L, -W, L, W, 0), T.table, '#FFFFFF', 3);
  line(g, P(-L, 0, 0), P(L, 0, 0), 'rgba(255,255,255,0.8)', 1.5);
  [0, 1].forEach(side => { const S = M.side[side]; if(S.shrink > 0){ const l = SB.courtL(M, side), w = SB.courtW(M, side), d = side === 0 ? -1 : 1; poly(g, courtPts(V, 0, -w, d * l, w, 0), 'rgba(255,200,69,0.18)', '#FFC845', 3); } });
}
function drawRink(g, V, M, T){
  const sp = M.sp, L = sp.Lh, W = sp.Wh, P = V.P;
  poly(g, courtPts(V, -L - 0.5, -W - 0.5, L + 0.5, W + 0.5, 0), '#2B2D42');
  poly(g, courtPts(V, -L, -W, L, W, 0), T.ice, 'rgba(0,0,0,0.25)', 2);
  line(g, P(0, -W, 0), P(0, W, 0), '#E63946', 3); [-1, 1].forEach(sd => line(g, P(sd * L * 0.35, -W, 0), P(sd * L * 0.35, W, 0), 'rgba(43,90,200,0.6)', 3));
  g.strokeStyle = '#E63946'; g.lineWidth = 2; ell(g, V, 0, 0, 1.4); g.stroke();
  [0, 1].forEach(side => { const gh = SB.goalHalf(M, side), x = side === 0 ? -L : L, d = side === 0 ? -1 : 1;
    poly(g, courtPts(V, x, -gh, x + d * 0.6, gh, 0), M.side[side].shrink > 0 ? '#FFC845' : '#111'); line(g, P(x, -gh, 0), P(x, gh, 0), '#E63946', 3); });
  // low boards
  poly(g, [P(-L, -W, 0), P(L, -W, 0), P(L, -W, 0.45), P(-L, -W, 0.45)], 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.6)', 1.5);
}
function drawSportBall(g, sp, x, y, r, t, ang){
  g.save(); g.translate(x, y);
  if(sp.kind === 'shuttle'){   // 🏸 cork in front, feather skirt trailing behind (ang = flight direction on screen)
    g.rotate((ang == null ? -Math.PI / 2 : ang) + Math.PI);
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.strokeStyle = 'rgba(120,130,150,0.9)'; g.lineWidth = Math.max(1, r * 0.1);
    g.beginPath(); g.moveTo(r * 0.3, -r * 0.55); g.lineTo(r * 2.5, -r * 1.15); g.lineTo(r * 2.5, r * 1.15); g.lineTo(r * 0.3, r * 0.55); g.closePath(); g.fill(); g.stroke();
    for(let i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(r * 0.4, i * r * 0.2); g.lineTo(r * 2.45, i * r * 0.5); g.stroke(); }
    g.fillStyle = '#F4F4F4'; g.beginPath(); g.arc(0, 0, r * 0.7, 0, 7); g.fill(); g.fillStyle = '#E63946'; g.fillRect(r * 0.25, -r * 0.62, r * 0.18, r * 1.24);
    g.restore(); return; }
  if(sp.kind === 'puck'){ g.fillStyle = '#111'; g.beginPath(); g.ellipse(0, r * 0.2, r, r * 0.55, 0, 0, 7); g.fill(); g.fillStyle = '#333'; g.beginPath(); g.ellipse(0, 0, r, r * 0.55, 0, 0, 7); g.fill(); g.strokeStyle = '#E63946'; g.lineWidth = r * 0.12; g.beginPath(); g.ellipse(0, 0, r * 0.6, r * 0.32, 0, 0, 7); g.stroke(); g.restore(); return; }
  const col = sp.id === 'slaball' || sp.id === 'slawall' ? ['#F2FF7A', '#C6E000'] : sp.id === 'slapoof' ? ['#FFF27A', '#F2C200'] : ['#FFFFFF', '#E0E0E0'];
  const f = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r); f.addColorStop(0, col[0]); f.addColorStop(1, col[1]); g.fillStyle = f; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  if(sp.id === 'slaball' || sp.id === 'slawall'){ g.strokeStyle = '#FFFFFF'; g.lineWidth = r * 0.14; g.beginPath(); g.arc(-r * 0.9, 0, r * 0.8, -0.9, 0.9); g.stroke(); g.beginPath(); g.arc(r * 0.9, 0, r * 0.8, Math.PI - 0.9, Math.PI + 0.9); g.stroke(); }
  if(sp.id === 'slapoof'){ g.fillStyle = 'rgba(150,110,0,0.55)'; [[0, 0], [-0.5, -0.3], [0.5, -0.3], [-0.4, 0.45], [0.4, 0.45]].forEach(([a, b]) => { g.beginPath(); g.arc(a * r, b * r, r * 0.13, 0, 7); g.fill(); }); }
  g.restore();
}
function drawBall(g, V, M, b, t, opt){
  const sp = M.sp, c = V.P(b.x, b.y, b.z), r = Math.max(4, V.sc(b.x, b.y, b.z) * (sp.table ? 0.17 : sp.kind === 'puck' ? 0.42 : 0.2)) * (1 + Math.max(0, b.z) * (sp.kind === 'puck' ? 0 : 0.09));   // sb2-1: a high ball looks bigger
  // spin trail: red = topspin, blue = backspin, green = curve
  const tc = Math.abs(b.side) > 0.3 ? '80,220,120' : b.top > 0.3 ? '255,80,60' : b.top < -0.3 ? '70,140,255' : '255,255,255';
  const gold = b.kind === 'legend' || (b.kind === 'mirage' && !b.braked);
  const hide = b.ghost && b.owner >= 0 && Math.abs(b.x) > 0.8 && Math.abs(b.x) < M.sp.Lh * 0.85 && b.b[0] + b.b[1] === 0;
  if(!hide){
    // ☄️ the hitter's own ball trail (round 2) under the spin dots — spin colours still show
    const tv = G && G.trails && b.by >= 0 ? G.trails[b.by] : -1;
    if(tv >= 0 && G.th){
      // longer history than the engine's spin trail (one point per frame, ~0.4 s); a jump (new serve) starts it again
      let h = G.th.get(b.id); if(!h){ h = []; G.th.set(b.id, h); }
      const last = h[h.length - 1]; if(last && Math.hypot(last.x - b.x, last.y - b.y) > 3) h.length = 0;
      if(!last || last.x !== b.x || last.y !== b.y || last.z !== b.z) h.push({x: b.x, y: b.y, z: b.z}); if(h.length > 26) h.shift();
      if(h.length > 2) BallSkins.trail(g, tv, h.map(q => { const p = V.P(q.x, q.y, q.z); return {x: p[0], y: p[1]}; }), r * 1.6, t);
    }
    const ta = tv >= 0 ? 0.55 : 1;
    b.trail.forEach((q, i) => { const p = V.P(q.x, q.y, q.z), a = i / b.trail.length; g.fillStyle = gold ? 'rgba(255,200,69,' + (a * 0.6) + ')' : 'rgba(' + tc + ',' + (a * 0.45 * ta) + ')'; g.beginPath(); g.arc(p[0], p[1], r * (0.3 + a * 0.6) * (tv >= 0 ? 0.7 : 1), 0, 7); g.fill(); });
    if(gold){ g.save(); g.shadowColor = '#FFC845'; g.shadowBlur = 22; g.fillStyle = 'rgba(255,200,69,0.6)'; g.beginPath(); g.arc(c[0], c[1], r * 1.6, 0, 7); g.fill(); g.restore(); }
    if(b.elem){ drawEmo(g, SB.ELEMENTS[b.elem].icon, c[0] + Math.cos(t * 8) * r * 1.6, c[1] + Math.sin(t * 8) * r * 1.6, r * 1.3); }
    const skin = G ? G.ball : -1;
    let ang = null; if(sp.kind === 'shuttle'){ const sp2 = Math.hypot(b.vx, b.vy, b.vz); if(sp2 > 0.5){ const q = V.P(b.x + b.vx * 0.05, b.y + b.vy * 0.05, b.z + b.vz * 0.05); ang = Math.atan2(q[1] - c[1], q[0] - c[0]); } }
    if(sp.kind === 'shuttle') BallSkins.shuttle(g, skin, G ? featherFor(b) : -1, c[0], c[1], r, t, ang);   // 🏸 your ball skin = the cork, your 🪶 feather behind
    else if(skin >= 0 && sp.kind !== 'puck') BallSkins.draw(g, skin, c[0], c[1], r, t); else drawSportBall(g, sp, c[0], c[1], r, t, ang);
    if(skin >= 0 && sp.kind === 'puck'){ g.save(); g.globalAlpha = 0.9; BallSkins.draw(g, skin, c[0], c[1] - r * 0.1, r * 0.55, t); g.restore(); }
  } else { g.strokeStyle = 'rgba(255,255,255,0.18)'; g.setLineDash([3, 4]); g.beginPath(); g.arc(c[0], c[1], r, 0, 7); g.stroke(); g.setLineDash([]); }
}
function drawOrb(g, V, o, t){
  const c = V.P(o.x, o.y, o.z + Math.sin(t * 3) * 0.15), r = V.sc(o.x, o.y, o.z) * 0.55, col = TIER_COL[o.tier];
  g.save(); g.shadowColor = col; g.shadowBlur = 24; const f = g.createRadialGradient(c[0] - r * 0.3, c[1] - r * 0.3, 2, c[0], c[1], r); f.addColorStop(0, '#FFFFFF'); f.addColorStop(1, col); g.fillStyle = f; g.globalAlpha = 0.9; g.beginPath(); g.arc(c[0], c[1], r, 0, 7); g.fill(); g.restore();
  g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(c[0], c[1], r * (1.15 + 0.1 * Math.sin(t * 6)), 0, 7); g.stroke();
  drawEmo(g, ['⚡', '💎', '👑'][o.tier], c[0], c[1], r * 1.1);
}
function drawPlayer(g, V, M, p, t){
  const sp = M.sp, feet = V.P(p.x, p.y, sp.table ? -0.9 : 0), ks = V.sc(p.x, p.y, 0), k = ks * (sp.table ? 3.1 : 2.5) / 120;   // tb-1 bigger people beside the ping-pong table
  // ring in team colour + a mallet for SlaShot
  const ring = V.P(p.x, p.y, 0), col = p.side === 0 ? '#FF7A1A' : '#18B8A6';
  g.strokeStyle = col; g.lineWidth = 3; g.globalAlpha = 0.85; ell(g, V, p.x, p.y, 0.55); g.stroke(); g.globalAlpha = 1;
  // 🧱 squash: whose turn — a pulsing gold ring + "Your turn!" over people
  if(sp.squash && M.state === 'play'){ const bl = M.balls.find(b => b.live && b.real && b.held == null); if(bl && bl.owner >= 0 && bl.owner !== p.side){ const pu = 0.5 + 0.5 * Math.sin((G ? G.anim : 0) * 8); g.save(); g.strokeStyle = 'rgba(255,200,69,' + (0.6 + 0.4 * pu) + ')'; g.lineWidth = 4; ell(g, V, p.x, p.y, 0.8 + 0.1 * pu); g.stroke(); g.restore(); p._turn = true; } else p._turn = false; }
  if(p.big > 0){ const R = SB.reachOf(M, p); g.strokeStyle = 'rgba(255,200,69,0.8)'; g.setLineDash([5, 4]); ell(g, V, p.x, p.y, R); g.stroke(); g.setLineDash([]); }
  if(p.wallBuddy > 0){ const x = p.side === 0 ? -sp.Lh - 0.3 : sp.Lh + 0.3; poly(g, [V.P(x, -sp.Wh, 0), V.P(x, sp.Wh, 0), V.P(x, sp.Wh, 1.4), V.P(x, -sp.Wh, 1.4)], 'rgba(255,180,90,0.35)', '#FF9F1C', 2); }
  if(sp.kind === 'puck'){ const e = gEll(V, p.x, p.y, SB.reachOf(M, p)), m = [e[0], e[1]], R = e[2], ry = e[3] / e[2]; g.fillStyle = col; g.beginPath(); g.ellipse(m[0], m[1] + e[3] * 0.18, R, e[3], 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(m[0], m[1], R * 0.82, e[3] * 0.82, 0, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.ellipse(m[0], m[1] - e[3] * 0.3, R * 0.38, e[3] * 0.38 + 2, 0, 0, 7); g.fill(); }
  // avatar: stands behind the mallet in SlaShot
  const back = sp.kind === 'puck' ? V.P(p.x - SB.dirOf(p.side) * 1.0, p.y, 0) : feet;
  const dir = V.mode === 'top' && !V.portrait ? SB.dirOf(p.side) : (p.face || 1), walking = Math.hypot(p.vx, p.vy) > 0.6;
  const sw = p.swing > 0 ? Math.sin((1 - p.swing) * Math.PI) : 0, pose = {armR: 0.35 + (p.swing > 0 ? 2.4 * sw : 0.5), holdRot: p.swing > 0 ? -1.4 * sw + 0.3 : 0.2};
  let gest = null;
  if(p.cheer > 0) gest = {g: gestOf('cheer'), t: 1.4 - p.cheer}; else if(p.sad > 0 && M.state !== 'play') gest = {g: gestOf('shrug'), t: 1.4 - p.sad};
  if(p.stun > 0) pose.rot = Math.sin(t * 30) * 0.15;
  // 🦘 sb2-3 jump: up in the air, arms up · 🤸 dive: thrown sideways onto the floor, then getting up
  let jumpH = 0; if(p.air > 0){ const u = 1 - p.air / SB.JUMP_AIR; jumpH = Math.sin(Math.PI * Math.min(1, u)) * ks * 0.95 / k; Object.assign(pose, {armL: 2.3, legL: 0.45, legR: -0.35}); }
  if(p.diveT > 0){ const u = 1 - p.diveT / SB.DIVE_T, amt = u < 0.55 ? 1.35 * Math.min(1, u / 0.12) : 1.35 * Math.max(0, 1 - (u - 0.55) / 0.45), q = V.P(p.x + (p.diveDx || 0), p.y + (p.diveDy || 1), 0), sgn = q[0] >= feet[0] ? 1 : -1; pose.rot = sgn * amt * dir; pose.armL = 1.6; }
  const fromBack = !gest && ((V.mode === 'behind' && p.side === V.camSide) || V.mode === 'iso');   // 🔙 we see the backs of the people on the camera side
  if(typeof sbbSide === 'function') sbbSide(V, M, p, back[0], dir);   /* 🎬 b3b5: forehand / backhand */
  const SF = typeof sbbFrame === 'function' ? sbbFrame(p) : null;
  if(SF){ const P2 = Object.assign({}, pose, SF.pose); if(p.diveT > 0 && pose.rot != null) P2.rot = pose.rot; if(p.stun > 0 && pose.rot != null) P2.rot = (P2.rot || 0) + pose.rot;   /* 🎬 b3b5: the act's body, the game's own tip / wobble */
    try { Acting.draw(g, {name: p.name, av: p.av, dir, walkT: walking && !(p.stand > 0) ? t : 0, jumpH, fromBack}, back[0], back[1], k, Object.assign({}, SF, {pose: P2}), {t, keep: true}); } catch(e){ drawAvatar(g, {name: p.name, av: p.av, dir, walkT: 0, gest, jumpH, fromBack}, back[0], back[1], k, {t, pose}); } }
  else drawAvatar(g, {name: p.name, av: p.av, dir, walkT: walking && !(p.stand > 0) ? t : 0, gest, jumpH, fromBack}, back[0], back[1], k, {t, pose: gest ? undefined : pose});
  // name tag + power
  // small name tag (sb2-1: never bigger than 13 px — the near player was a giant label in the old portrait view)
  const tag = [back[0], back[1] - k * (92 + jumpH)], fs = Math.round(Math.max(9, Math.min(13, ks * 0.3))); g.font = '800 ' + fs + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(0,0,0,0.45)';
  const label = (p.robot ? '🤖 ' : '') + p.name; const w = g.measureText(label).width + 10; g.fillRect(tag[0] - w / 2, tag[1] - fs, w, fs * 1.35); g.fillStyle = '#fff'; g.fillText(label, tag[0], tag[1]);
  if(p.power){ drawEmo(g, SB.POWERS[p.power].icon, tag[0] + w / 2 + fs * 0.9, tag[1] - fs * 0.35, fs * 1.4); }
  if(p.mirror > 0) drawEmo(g, '🪞', tag[0] - w / 2 - fs * 0.9, tag[1] - fs * 0.35, fs * 1.3);
  if(p._turn && p.human && !p.remote && sp.squash){ g.font = '900 ' + (fs + 1) + 'px Nunito, sans-serif'; g.fillStyle = '#FFC845'; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 3; g.strokeText('Your turn!', tag[0], tag[1] - fs * 1.5); g.fillText('Your turn!', tag[0], tag[1] - fs * 1.5); }
}
function gestOf(k){ return GESTURES.find(x => x.k === k) || GESTURES[0]; }

/* ================= RESULT + SAVE ================= */
function finishMatch(){
  cheerEnd();   // 📣 cs-1: win / lose crowd + faces on the result card
  const M = G.M; G.over = true; const win = M.score.winner, sp = G.sp, secs = Math.max(1, Math.round((performance.now() - G.startAt) / 1000));
  const humans = M.players.filter(p => p.human), vsRobot = G.mode === 'robot' || (G.mode === 'team' && M.players.filter(p => p.side === 1).every(p => p.robot));
  const mine = G.link ? humans.filter(p => !p.remote) : humans, st = M.stats, myWin = mine.some(p => p.side === win);   // 📡 mine = the players on this device
  if(G.link && G.link.role === 'host') lkSendEnd(secs);
  const pts = [0, 1].map(s => sp.scoring === 'tennis' ? M.score.games[s] * 4 + M.score.pts[s] : M.score.pts[s]);
  const ratio = pts[1 - win] / Math.max(1, pts[win]), stars = ratio < 0.45 ? 3 : ratio < 0.8 ? 2 : 1;
  const scoreFor = side => Math.round((st[side].points * 100 + st[side].rally * 20 + st[side].aces * 50 + st[side].perfect * 30 + st[side].smash * 15 + (side === win ? 500 : 0)) * (M.lv.hardcore ? 3 : 1));
  const tvShow = !!(G.link && !mine.length);   // 📺 lk-5e: the Room hostess has no player — it cheers for the winners
  if(FX && !G.cup){ if(myWin || tvShow) confetti(['🏓', '🎾', '⭐', '🏆', '🎉'], 30); }
  if(!G.cup) UISound.play(myWin || tvShow ? 'success' : 'error');
  if(G.cup){ cupFinish(win, secs, scoreFor); return; }
  const strip4 = G.comics ? winnerPanels(win) : null; if(strip4) setTimeout(() => Comic.strip('winner', {panels: strip4, title: '🏆 ' + sp.name + ' · ' + teamName(win)}), 450);
  const head = G.mode === 'robot' ? (myWin ? '<div class="big">🏆</div><h2 class="cheer">You beat the robot!</h2>' : '<div class="big">🤖</div><h2>The robot wins this time</h2>')
    : '<div class="big">👑</div><h2 class="cheer">' + UI.esc(teamName(win)) + ' win' + (M.players.filter(p => p.side === win).length > 1 ? '' : 's') + '!</h2>';
  const tip = myWin || tvShow ? '' : '<div class="note">💡 ' + pickOne(['Watch the shadow — it shows where the ball will land.', 'Move INTO the ball for topspin: it dips and is hard to return.', 'Try a 🌈 lob when the robot runs to the net.', 'Hit the ball through the power orb, then use your power at the right moment!', 'A 🪶 drop shot is great when the robot stays far back.']) + '</div>';
  const scoreLine = sp.scoring === 'tennis' ? M.score.games[0] + ' – ' + M.score.games[1] + ' games' : M.score.pts[0] + ' – ' + M.score.pts[1];
  const myScore = scoreFor(mine[0] ? mine[0].side : humans[0] ? humans[0].side : 0);
  if(G.link){   /* 📡 linked match: the LinkKit card (host = 🔁 Play again for everyone, guests wait) */
    showResult(head + '<div class="score-big">' + scoreLine + '</div>' +
      (vsRobot && myWin ? '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '" style="animation-delay:' + (i * 0.15) + 's">⭐</span>').join('') + '</div>' : '') +
      '<div class="stats"><span>🏆 ' + myScore.toLocaleString() + '</span><span>🔁 best rally ' + Math.max(st[0].rally, st[1].rally) + '</span><span>💥 ' + st[0].smash + ' smashes</span><span>🎾 ' + st[0].aces + ' aces</span><span>✨ ' + st[0].perfect + ' perfect</span><span>⏱ ' + fmt(secs * 1000) + '</span></div>' +
      tip + '<div class="save-note" id="save-note">' + (humans.length ? '💾 Saving…' : '') + '</div>' +
      lkResultBtns());
  } else {   /* 🧱 b3w5: the shared 🏁 card */
    const lvl = G.level, sc = vsRobot ? myScore : null, nextOk = vsRobot && myWin && lvl < 5;
    GF.result({wrap: $('result'), card: $('result-card'), win: G.mode === 'robot' || vsRobot ? myWin : null, icon: G.mode === 'robot' ? (myWin ? '🏆' : '🤖') : '👑',
      title: G.mode === 'robot' ? (myWin ? 'You beat the robot!' : 'The robot wins this time') : teamName(win) + ' win' + (M.players.filter(p => p.side === win).length > 1 ? '' : 's') + '!',
      sub: tip.replace(/<[^>]+>/g, '').trim(), stars: vsRobot && myWin ? stars : null, score: sc,
      stats: [['🏓', scoreLine], ['🔁', 'best rally ' + Math.max(st[0].rally, st[1].rally)], ['💥', st[0].smash + ' smashes'], ['🎾', st[0].aces + ' aces'], ['✨', st[0].perfect + ' perfect'], ['⏱', fmt(secs * 1000)]],
      save: humans.length ? 'Saving…' : null, buddy: {name: S.player, av: myAvatar(S.player)}, comic: !!strip4, confetti: false,
      levels: () => backToMenu(), levelsText: '🎚️ Levels', again: () => startMatch(), againText: '🔁 Play again', extra: [{text: '🕹️ Gameroom', fn: () => goGameroom()}],
      next: nextOk ? () => { if(!canPlay(lvl + 1)){ UISound.play('error'); UI.toast('Win this level to open the next one'); backToMenu(); return; } hideResult(); chosenLevel = lvl + 1; ls(store('lv'), String(lvl + 1)); fillSetup(); startMatch(); } : null,
      nextText: lvl === 4 ? 'Try 💀 Hardcore ▶' : 'Next level ▶'});
    [['btn-levels', 'b-menu'], ['btn-again', 'b-again'], ['btn-next', 'b-next']].forEach(([x, y]) => { const e = $(x); if(e) e.id = y; });   // the old ids (tests, crowd)
    if(window.UI && UI.callout) UI.callout.setup(null); slaResultBadge();   /* 💬 24t result + 🏷️ lg-1 badge (what showResult did) */
  }
  if(strip4){ const card = $('result-card'), slot = card.querySelector('#comic-strip-slot'), at = card.querySelector('.stats'); const el = Comic.stripEl('winner', {panels: strip4, title: '🏆 ' + sp.name}); if(slot) slot.appendChild(el); else if(at) card.insertBefore(el, at);
    setTimeout(() => { const c = card.querySelector('.gf-rc') || card, btns = c.querySelector('.gf-r-btns'); if(btns && btns.getBoundingClientRect().bottom > innerHeight - 4){ el.remove(); if(slot) slot.hidden = true; } }, 260); }   /* 🧱 b3w5: a short screen keeps the buttons in view — the strip already played full-screen */
  // save: level result for the players who played the robot; feats for every person
  NOTES.length = 0;
  if(G.link && G.link.role === 'guest'){ putNote(0, '💾 ' + UI.esc(G.link.host || 'The host') + '\'s device saves the match'); return; }   // 📡 the host saves for everyone
  humans.forEach((p, seat) => {
    const s = st[p.side], won = p.side === win;
    const stats = {wins: won ? 1 : 0, rally: s.rally, smash: s.smash, aces: s.aces, perfect: s.perfect, powers: s.powers, legend: s.legend, goals: s.goals, jumpHits: s.jumpHits, jumpPerfect: s.jumpPerfect, diveSaves: s.diveSaves, matches: 1};
    stats['win_' + sp.id] = won ? 1 : 0;
    if(p.name === 'Guest') return;
    if(vsRobot) saveWin(p.name, G.level, {score: scoreFor(p.side), stars: won ? stars : 0, cleared: won, timeSec: secs, theme: sp.name + ' · ' + THEMES[G.theme].name, stats}, seat);
    else saveFeatsOnly(p.name, stats, seat);
  });
}
const PENDING_KEY = 'sp_slabrall_pending';
const NOTES = [];
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => { const r = google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))); if(w.feats) r.saveFeats(w.name, GAME_ID, w.stats); else r.saveLevelResult(GAME_ID, w.name, w.lvl, w.extra); }); }
function putNote(i, html){ NOTES[i] = html; const n = $('save-note'); if(n) n.innerHTML = NOTES.filter(Boolean).join('<br>'); if(G && G.link && G.link.role === 'host') Link.send('sbnotes', NOTES.filter(Boolean).join('<br>'), {sure: true}); }
function saveWin(name, lvlIdx, extra, seat, tries){
  tries = tries || 0; const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []});
  const who = G && G.M.players.filter(q => q.human).length > 1 ? UI.esc(name) + ': ' : '';
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res.best) best[lvlIdx] = res.best;
      S.progress[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending(); putNote(seat, who + saveText(res, extra.cleared));
    }).withFailureHandler(() => {
      if(tries < 1){ setTimeout(() => saveWin(name, lvlIdx, extra, seat, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl: lvlIdx, extra}])); putNote(seat, who + '⚠️ Could not save yet — it will be sent again next time.');
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
function showResult(html){ /* 💬 24t result */ if(window.UI && UI.callout) UI.callout.setup(null); $('result-card').innerHTML = html; slaResultBadge(); $('result').classList.remove('hidden'); }   // 🏷️ lg-1 badge on top
function hideResult(){ $('result').classList.add('hidden'); }
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pickOne(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 p1c: ◀ = where you came from (Gameroom if we don't know)
window.feedbackContext = () => ({page: 'SlaBrall', game: GAME_ID, level: G ? G.level : SET.level});

/* ================= BOOT ================= */
function boot(){
  UI.loading('sla-brall');
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {}; S.ballSkins = d.ballSkins || {}; S.racketsOwned = d.rackets || {}; S.batsOwned = d.bats || {}; S.ballTrails = d.ballTrails || {}; S.feathers = d.feathers || {};
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();
/* 📡 LINK (lk-1b): SlaBrall on 2–4 own devices on the same Wi-Fi (LinkKit, plan "LinkKit — full plan.md" §14).
   HOST = the device that opened the room: runs the real engine (SB.step), gets every guest's stick (sbin, ~30 / s, fast) + shots (sbshot, sure),
   sends the match picture (sbs ~20 / s, fast) + the engine events (sbe, sure) + the end (sbend) + the save notes (sbnotes).
   GUEST: never steps the engine — it draws the host's picture 0.1 s behind (smoothed between two pictures), plays sounds / words from the events,
   steers ITS player with its own camera (behind its own player). A guest that drops → 🤖 robot brain (p.auto) until it rejoins. Comic pauses are off. */
const LK = {lobby: null, wired: false, urlDone: false, cfg: null, end: null, tv: false};   // 📺 lk-5e: tv = this device is the Room hostess
const LK_SNAP_MS = 50, LK_IN_MS = 33, LK_DELAY = 0.1;
const LK_PSKIP = {av: 1, racket: 1, ai: 1, input: 1, drag: 1, name: 1, i: 1, human: 1, robot: 1, side: 1, lane: 1, slot: 1, auto: 1, remote: 1, seat: 1, lseat: 1, _turn: 1};
const LK_MSKIP = {sp: 1, lv: 1, rnd: 1, players: 1, balls: 1, events: 1, level: 1, powersOn: 1, theme: 1, target: 1, stats: 1};
function lkCopy(v, skip){
  if(typeof v === 'number') return Number.isInteger(v) ? v : Math.round(v * 1000) / 1000;
  if(!v || typeof v !== 'object') return v;
  if(Array.isArray(v)) return v.map(x => lkCopy(x));
  const o = {}; for(const k in v){ const x = v[k]; if(typeof x === 'function' || (skip && skip[k])) continue; o[k] = lkCopy(x); } return o;
}
function lkSnap(M){
  const o = lkCopy(M, LK_MSKIP); o.balls = M.balls.map(b => lkCopy(b, {trail: 1}));
  o.pl = M.players.map(p => lkCopy(p, LK_PSKIP)); o.au = M.players.map(p => p.auto ? 1 : 0); o.pz = G.paused ? 1 : 0; return o;
}
function lkApply(M, a, b, k){
  for(const key in b){ if(key === 'pl' || key === 'au' || key === 'pz' || key === 'balls' || key === 'at') continue; M[key] = b[key]; }
  const tr = G.lk.trails, seen = new Set(), mid = a && k < 1;
  M.balls = (b.balls || []).map(bb => {
    const o = Object.assign({}, bb), aa = mid && (a.balls || []).find(x => x.id === bb.id);
    if(aa) ['x', 'y', 'z'].forEach(f => { o[f] = aa[f] + (bb[f] - aa[f]) * k; });
    let t = tr.get(o.id); if(!t){ t = []; tr.set(o.id, t); } const last = t[t.length - 1];
    if(!last || Math.abs(last.x - o.x) + Math.abs(last.y - o.y) + Math.abs(last.z - o.z) > 0.02){ t.push({x: o.x, y: o.y, z: o.z}); if(t.length > 18) t.shift(); }
    o.trail = t; seen.add(o.id); return o; });
  tr.forEach((v, id) => { if(!seen.has(id)) tr.delete(id); });
  (b.pl || []).forEach((q, i) => { const p = M.players[i]; if(!p) return; Object.assign(p, q); p.auto = !!(b.au && b.au[i]);
    const qa = mid && a.pl && a.pl[i]; if(qa) ['x', 'y'].forEach(f => { p[f] = qa[f] + (q[f] - qa[f]) * k; }); });
}
// host: one picture every 50 ms + the events of the last frames (also while paused, so the guests show the pause)
function lkHostTick(now){
  const L = G.lk; if(!L) return;
  if(L.evs.length){ Link.send('sbe', {t: G.M.t, list: L.evs}, {sure: true}); L.evs = []; }
  if(now - L.snapAt >= LK_SNAP_MS){ L.snapAt = now; Link.send('sbs', lkSnap(G.M)); }
}
function lkSendEnd(secs){ LK.end = {id: G.link.id, score: G.M.score, stats: G.M.stats, secs}; Link.send('sbs', lkSnap(G.M)); Link.send('sbend', LK.end, {sure: true}); }
// guest: show the host's match 0.1 s behind, smoothed between two pictures; send my stick
function lkGuestFrame(now){
  const L = G.lk, buf = L.buf, M = G.M;
  if(buf.length){
    const t = now / 1000 - L.off - LK_DELAY, i = buf.findIndex(x => x.t > t);
    if(buf[buf.length - 1].pz || i === -1) lkApply(M, null, buf[buf.length - 1], 1);   // paused: show exactly where the host stopped
    else if(i === 0) lkApply(M, null, buf[0], 1);
    else { const a = buf[i - 1], b = buf[i]; lkApply(M, a, b, Math.max(0, Math.min(1, (t - a.t) / Math.max(1e-6, b.t - a.t)))); }
    while(buf.length > 2 && buf[1].t < t - 0.5) buf.shift();
    while(L.evq.length && (L.evq[0].t <= t + 0.02 || now - L.evq[0].at > 700)) handleEvents(L.evq.shift().list);
    const last = buf[buf.length - 1];
    if(!!last.pz !== !!L.pz){ L.pz = last.pz; G.paused = !!last.pz; UI.pauseIcon($('pause-btn'), G.paused); banner(G.paused ? '⏸ Paused — tap ▶ to play' : '▶ Go!', 'good'); }
  }
  if(!G.over && now - L.lastAt > 1600 && now - L.hintAt > 2500){ L.hintAt = now; banner('⏳ Waiting for ' + (G.link.host || 'the host') + '…', ''); }
  const me = M.players.find(p => p.human && !p.remote);
  if(me && !G.over && now - L.inAt >= LK_IN_MS){
    const x = Math.round((me.input.x || 0) * 100) / 100, y = Math.round((me.input.y || 0) * 100) / 100;
    if(x !== L.ix || y !== L.iy || now - L.inAt > 200){ Link.send('sbin', {x, y}); L.ix = x; L.iy = y; L.inAt = now; }
  }
  if(G.ctl) lkCtlScore();
}
// 📺 lk-5e: in a Room hostess match the phone is a 🎮 controller — the court is on the TV (the court is not drawn here: cheap)
function lkCtlWant(){ try{ return localStorage.getItem('sp_sb_ctl') !== '0'; }catch(e){ return true; } }
function lkCtlOff(){ const el = $('lk-ctl'); if(el) el.remove(); const st = $('stage'); if(st) st.classList.remove('lk-ctl-on'); if(G) G.ctl = false; }
function lkCtl(on){
  if(!G || !G.link || G.link.role !== 'guest'){ lkCtlOff(); return; }
  G.ctl = !!on; try{ localStorage.setItem('sp_sb_ctl', on ? '1' : '0'); }catch(e){}
  const st = $('stage'); st.classList.toggle('lk-ctl-on', G.ctl);
  let el = $('lk-ctl'); if(!el){ el = document.createElement('div'); el.id = 'lk-ctl'; st.appendChild(el); }
  const me = G.M.players.find(p => p.human && !p.remote) || G.M.players[0];
  el.className = G.ctl ? 'on' : 'mini';
  if(G.ctl){
    const team = teamName(me.side), pair = team !== me.name;   // 1 vs 1: the team is just your name
    el.innerHTML = '<div class="lkc-card"><canvas id="lkc-av" width="150" height="170"></canvas><div class="lkc-info"><div class="lkc-name s' + me.side + '">' + (me.side ? '🩵 ' : '🧡 ') + UI.esc(me.name) + '</div>'
      + (pair ? '<div class="lkc-team s' + me.side + '">👥 ' + UI.esc(team) + '</div>' : '') + '<div class="lkc-score" id="lkc-score"></div>'
      + '<div class="lkc-tv">📺 Look at the TV!</div><button class="lkc-btn" id="lkc-sw" data-sound="pop">👀 Show the court here</button></div></div>';
    try{ drawPreviewCanvas($('lkc-av'), me.av || withRacket(myAvatar(me.name), me.name), {name: me.name, t: 1}); }catch(e){}
    const cv = $('court'), g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    el.dataset.sc = ''; lkCtlScore();
  } else el.innerHTML = '<button class="lkc-btn lkc-mini" id="lkc-sw" data-sound="pop">📺 Controller only</button>';
  $('lkc-sw').onclick = e => { e.stopPropagation(); lkCtl(!G.ctl); if(window.UISound) UISound.play('pop'); };
  $('lkc-sw').onpointerdown = e => e.stopPropagation();
}
function lkCtlScore(){
  const el = $('lk-ctl'), b = $('lkc-score'); if(!el || !b || !G) return;
  const sc = G.M.score, me = G.M.players.find(p => p.human && !p.remote), my = me ? me.side : 0;
  const t = sc.pts[my] + ' – ' + sc.pts[1 - my], gm = G.sp.scoring === 'tennis' ? 'games ' + sc.games[my] + ' – ' + sc.games[1 - my] : '';
  if(el.dataset.sc !== t + gm){ el.dataset.sc = t + gm; b.innerHTML = '<small>you</small> ' + t + ' <small>them</small>' + (gm ? '<span class="lkc-games">' + gm + '</span>' : ''); }
}
function lkPlayer(seat){ return G && G.M.players.find(p => p.human && p.lseat === seat); }
function lkHere(){ return G && G.link && G.link.role === 'host'; }
// the same match for every device: my seat → my player (remote = someone else's device)
function lkLocal(cfg, mySeat, role){
  const c = JSON.parse(JSON.stringify(cfg)); c.role = role;
  c.seats.forEach(s => { if(!s.human){ s.seat = 0; return; } s.remote = s.lseat !== mySeat; s.seat = s.remote ? 99 : -1; });
  return c;
}
function lkWhy(e){ const m = String((e && e.message) || e || ''); return /no server|Failed to fetch|NetworkError/i.test(m) ? '📶 Linking needs the internet for a moment — try again' : m || 'Could not open the room'; }
function lkAv(cv, p){ drawPreviewCanvas(cv, withRacket(myAvatar(p.name), p.name), {name: p.name, t: 1}); }
function lkGoLabel(){ const b = $('go-btn'); if(!b) return; if(SET.mode === 'link'){ b.textContent = '📡 Open the room'; return; }   /* 🧱 b3w5: ▶ Start names the pick */
  const sp = SB.SPORTS[SET.sport], L = SB.LEVELS[chosenLevel], U = LEVEL_UI[chosenLevel]; b.textContent = sp && L ? '▶ Start · ' + sp.icon + ' ' + sp.name + ' · ' + U.emoji + ' ' + L.name : '▶ Start'; }
function lkCloseLobby(){ if(LK.lobby && LK.lobby.close) LK.lobby.close(); LK.lobby = null; }
async function lkOpenHost(){
  lkWire(); lkCloseLobby(); const sp = SB.SPORTS[SET.sport], L = SB.LEVELS[SET.level];
  $('link-sub').textContent = LK.tv ? '📺 This screen is the Room hostess — players join on their own phone · 1 = you vs 🤖 · 2 = 1 vs 1 · 3–4 = 2 vs 2' : 'Friends tap 🔗 Join friends on their own phone or tablet — same Wi-Fi'; showScreen('link'); lkAlt('');
  const el = $('link-lobby'); el.innerHTML = '<div class="lk"><div class="lk-msg"><span class="ui-spin a-bob">📡</span> Opening the room<span class="lk-dots"></span></div></div>';
  try{ await Link.host({game: 'SlaBrall', name: S.player, seats: 4, hostess: !!LK.tv, page: 'slabrall', label: sp.icon + ' ' + sp.name + ' · ' + LEVEL_UI[SET.level].emoji + ' ' + L.name + (LK.tv ? ' · 📺 on the TV' : '')}); }   // label + page: the 🏠 waiting room (lk-2a)
  catch(e){ UISound.play('error'); el.innerHTML = '<div class="lk"><div class="lk-msg bad">😕 ' + UI.esc(lkWhy(e)) + '</div></div>'; return; }
  if($('scr-link').classList.contains('hidden')) return;   // left while it opened
  LK.lobby = Link.lobby(el, {title: sp.icon + ' ' + sp.name + ' · ' + LEVEL_UI[SET.level].emoji + ' ' + L.name, url: WEBAPP_URL + '?page=slabrall', minPlayers: 2, soloBot: true, name: S.player, drawAvatar: lkAv, kind: 'link', onStart: lkGo});   /* 📺 st-2b: a hostess room starts with ONE player = vs 🤖 */
}
function lkOpenJoin(code){
  lkWire(); lkCloseLobby(); lkIdle();
  $('link-sub').textContent = 'Same Wi-Fi as the host'; showScreen('link'); lkAlt('host');
  LK.lobby = Link.lobby($('link-lobby'), {title: '🏓 SlaBrall', name: S.player, soloBot: true, drawAvatar: lkAv, code: code || undefined, onJoined: () => { UISound.play('success'); lkAlt(''); }});
}
// 📡 lk-1c: the host screen — 1 · sport, 2 · level (no 💀 Hardcore: that one is you vs the robot), then 📡 Open the room
function lkLevelOk(i){ return !!LEVEL_UI[i] && !LEVEL_UI[i].hardcore && canPlay(i); }
function lkHostPick(){
  lkWire(); lkCloseLobby(); lkIdle();
  if(!lkLevelOk(SET.level)){ const rec = AGE_START[S.age] || 0; SET.level = lkLevelOk(rec) ? rec : 0; }
  $('link-sub').textContent = 'Friends join on their own device'; showScreen('link'); lkAlt('join');
  const el = $('link-lobby');
  const paint = () => {
    el.innerHTML = '<div class="lk"><div class="lk-card lkh"><div class="lk-head">📡 Host a game</div>'
      + '<div class="lkh-t">1 · Sport</div><div class="lkh-row" id="lkh-sports">' + SB.SPORT_ORDER.map(k => { const sp = SB.SPORTS[k];
          return '<button class="lkh-b' + (k === SET.sport ? ' on' : '') + '" data-sp="' + k + '" data-sound="pop"><span class="lkh-i">' + sp.icon + '</span>' + UI.esc(sp.name) + '</button>'; }).join('') + '</div>'
      + '<div class="lkh-t">2 · Level</div><div class="lkh-row" id="lkh-levels">' + SB.LEVELS.map((L, i) => !LEVEL_UI[i] || LEVEL_UI[i].hardcore ? '' :
          '<button class="lkh-b' + (i === SET.level ? ' on' : '') + '" data-lv="' + i + '"' + (canPlay(i) ? ' data-sound="pop"' : ' disabled data-sound="none"') + '><span class="lkh-i">' + (canPlay(i) ? LEVEL_UI[i].emoji : '🔒') + '</span>' + UI.esc(L.name) + '</button>').join('') + '</div>'
      + '<div class="lkh-gos"><button class="lk-btn lkh-go" id="lkh-go" data-sound="pop">📡 Open the room<small>this device plays too</small></button>'
      + '<button class="lk-btn lkh-go lkh-tvgo" id="lkh-tv" data-sound="pop">📺 Room hostess<small>court on the TV · phones play</small></button></div></div></div>';
    el.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { SET.sport = b.dataset.sp; savePrefs(); paint(); });
    el.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => { if(!lkLevelOk(+b.dataset.lv)) return; SET.level = +b.dataset.lv; paint(); });
    $('lkh-go').onclick = () => { LK.tv = false; SET.mode = 'link'; savePrefs(); lkOpenHost(); };
    $('lkh-tv').onclick = () => { LK.tv = true; SET.mode = 'link'; savePrefs(); lkOpenHost(); };
  };
  paint();
}
function lkCoverPicks(el){   /* 📡 lk-6c: 🏓 sport + 🎚️ level chips inside the cover's room card — tap = the next one */
  if(!lkLevelOk(SET.level)) SET.level = 0;
  const sp = SB.SPORTS[SET.sport] || SB.SPORTS[SB.SPORT_ORDER[0]], L = SB.LEVELS[SET.level];
  el.innerHTML = '<button class="lkc-chip" data-k="sport" data-sound="none">' + sp.icon + ' ' + UI.esc(sp.name) + '</button><button class="lkc-chip" data-k="lvl" data-sound="none">' + LEVEL_UI[SET.level].emoji + ' ' + UI.esc(L.name) + '</button>';
  el.querySelectorAll('.lkc-chip').forEach(b => b.onclick = e => { e.stopPropagation(); const nx = (ks, v) => ks[(ks.indexOf(v) + 1) % ks.length];
    if(b.dataset.k === 'sport') SET.sport = nx(SB.SPORT_ORDER, SET.sport); else SET.level = nx(SB.LEVELS.map((x, i) => i).filter(lkLevelOk), SET.level);
    savePrefs(); UISound.play('tap'); lkCoverPicks(el); });
}
function lkAlt(k){
  const a = $('link-alt'); if(!a) return;
  a.innerHTML = k === 'host' ? '<button class="btn soft sp-btn sp-secondary" data-sound="pop" onclick="lkHostPick()">📡 Host a game instead</button>'
    : k === 'join' ? '<button class="btn soft sp-btn sp-secondary" data-sound="pop" onclick="lkOpenJoin()">🔗 Join a friend instead</button>' : '';
}
function lkIdle(){ try{ if(window.Link && Link.status() !== 'idle') Link.leave(); }catch(e){} }   // switching host ↔ join closes the old room / link
// host ▶ Start (lobby) / 🔁 Play again: the linked players → seats (2 = 1 vs 1 · 3–4 = 2 vs 2, a 🤖 fills seat 4)
function lkGo(){
  const tv = !!(Link.hostess && Link.hostess());   // 📺 lk-5e: the TV's seat 0 is the screen — every player is on their own phone
  const list = Link.players().filter(p => p.name && p.on && !p.screen).sort((a, b) => a.seat - b.seat).slice(0, 4);
  if(list.length < (tv ? 1 : 2)){ UISound.play('error'); UI.toast(tv ? '📺 Wait for a player to join' : '📡 Wait for a friend to join'); return; }   /* 📺 st-2b: on the TV one player is enough */
  const sides = list.length === 2 ? [0, 1] : [0, 1, 0, 1], seats = list.map((p, k) => ({name: p.name, side: sides[k], human: true, lseat: p.seat}));
  if(seats.length === 3) seats.push({name: 'Robot', side: 1, human: false});
  if(seats.length === 1) seats.push({name: 'Robot', side: 1, human: false});   /* 📺 st-2b: 1 player + the TV = you vs 🤖 (the room's level) */
  LK.cfg = {link: true, id: Date.now().toString(36), sport: SET.sport, level: SET.level, theme: SET.theme, powers: SET.powers, ball: SET.ball, target: 0, seed: (Date.now() & 0xffffff) ^ 0x5b, host: S.player, tv, seats};
  LK.end = null; lkCloseLobby();
  Link.send('sbgo', LK.cfg, {sure: true});
  if(G) cancelAnimationFrame(G.raf); G = null; hideResult();
  startMatch(lkLocal(LK.cfg, 0, 'host'));
}
/* 📺 st-2b: opened from the 📺 Game Station — the voted level (no 💀: that one is you vs the robot on one device) + the voted sport; not saved as the TV's own picks */
function lkStPick(p){ const l = +p.slv; if(p.slv != null && p.slv !== '' && !isNaN(l)) SET.level = Math.max(0, Math.min(4, Math.round(l))); if(p.ssp && SB.SPORTS[p.ssp]) SET.sport = p.ssp; }
function lkAskAgain(b){ if(window.UI && UI.busy) UI.busy(b, 'sla-brall', 'Asking the TV…'); Link.ask('again'); }   // 📺 lk-5e
function lkResultBtns(){
  const room = LK.viaCover ? '<button class="btn soft sp-btn sp-secondary" id="b-room" data-sound="none" onclick="lkToCover()">◀ Room</button>' : '';   /* 📡 lk-6c */
  if(G.link.role === 'host') return '<div class="res-btns"><button class="btn sp-btn sp-primary" data-sound="pop" onclick="lkGo()">🔁 Play again</button>' + room + '<button class="btn soft sp-btn sp-secondary" data-sound="none" onclick="lkExit()">' + (LK.cfg && LK.cfg.tv ? '🚪 End the room' : '🎚️ Levels') + '</button></div>';
  const tv = LK.cfg && LK.cfg.tv;   // 📺 lk-5e
  if(tv && Link.captain && Link.captain() === Link.seat()) return '<div class="res-btns"><button class="btn sp-btn sp-primary" id="lk-again" data-sound="pop" onclick="lkAskAgain(this)">🔁 Play again</button>' + room + '<button class="btn soft sp-btn sp-secondary" data-sound="none" onclick="lkExit()">🚪 Leave</button></div>';
  return '<div class="note lk-wait">⏳ ' + UI.esc(tv ? 'The TV or the first player' : (G.link.host || 'The host')) + ' can start the next match<span class="lk-dots"></span></div><div class="res-btns">' + room + '<button class="btn soft sp-btn sp-secondary" data-sound="none" onclick="lkExit()">🚪 Leave</button></div>';
}
function lkEnded(msg){
  if(G){ cancelAnimationFrame(G.raf); G.over = true; }
  lkCtlOff();
  showResult('<div class="big">📡</div><h2>' + UI.esc(msg) + '</h2><div class="note">Thanks for playing together!</div><div class="res-btns"><button class="btn sp-btn sp-primary" data-sound="none" onclick="lkExit()">◀ SlaBrall</button></div>');
}
function lkExit(){
  try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){}
  lkCloseLobby(); LK.cfg = null; LK.end = null;
  if(G) cancelAnimationFrame(G.raf); G = null; hideResult(); $('pads').innerHTML = ''; lkCtlOff(); LK.tv = false; renderMenu(); showScreen('menu');
  if(LK.viaCover){ LK.viaCover = false; openCover(); }   /* 📡 lk-6c: a cover room ends on the cover */
}
function lkToCover(){   /* 📡 lk-6c: ◀ Room — leave the finished match, keep the room: back to the cover, its line and ▶ Start */
  LK.cfg = null; LK.end = null; if(G) cancelAnimationFrame(G.raf); G = null; hideResult(); $('pads').innerHTML = ''; lkCtlOff(); renderMenu(); showScreen('menu'); openCover();
}
function lkWire(){
  if(LK.wired || !window.Link) return; LK.wired = true;
  // ---- guest side ----
  Link.on('sbgo', d => { if(Link.isHost() || !d || !d.seats) return; if(G && G.link && G.link.id === d.id) return;
    LK.cfg = d; LK.end = null; lkCloseLobby(); if(G) cancelAnimationFrame(G.raf); G = null; hideResult(); startMatch(lkLocal(d, Link.seat(), 'guest'));
    if(d.tv) lkCtl(lkCtlWant()); else lkCtlOff(); });
  Link.on('sbs', d => { if(!G || !G.lk || G.link.role !== 'guest' || !d) return; const L = G.lk, at = performance.now() / 1000, off = at - d.t;
    const last = L.buf[L.buf.length - 1]; if(last && d.t < last.t) return;   // an older picture that came late
    if(L.off == null || off < L.off || off - L.off > 0.25) L.off = off; else L.off += (off - L.off) * 0.05;
    L.buf.push(d); if(L.buf.length > 40) L.buf.shift(); L.lastAt = performance.now(); });
  Link.on('sbe', d => { if(G && G.lk && G.link.role === 'guest' && d && d.list) G.lk.evq.push({t: d.t, list: d.list, at: performance.now()}); });
  Link.on('sbend', d => { if(!G || !G.link || G.link.role !== 'guest' || G.over || !d || d.id !== G.link.id) return;
    G.lk.evq.forEach(q => handleEvents(q.list)); G.lk.evq = [];
    const last = G.lk.buf[G.lk.buf.length - 1]; if(last) lkApply(G.M, null, last, 1);
    G.M.score = d.score; G.M.stats = d.stats; G.startAt = performance.now() - (d.secs || 1) * 1000; finishMatch(); });
  Link.on('sbnotes', html => { if(G && G.link && G.link.role === 'guest'){ const n = $('save-note'); if(n) n.innerHTML = String(html || ''); } });
  Link.on('pause', () => { if(G && G.link && G.link.role === 'guest' && !G.over) banner('🔁 Linking again…', 'bad'); });
  Link.on('resume', () => { if(G && G.link && G.link.role === 'guest' && !G.over) banner('✅ Back in the game!', 'good'); });
  Link.on('hostleft', e => { if(Link.isHost()) return; const who = (LK.cfg && LK.cfg.host) || 'The host';
    if(!G && $('scr-link').classList.contains('hidden')) return;
    UISound.play('bump'); lkEnded(e && e.reason === 'lost' ? '📶 Lost the link to ' + who : '👋 ' + who + ' ended the game'); });
  // ---- host side ----
  Link.on('sbin', (d, seat) => { if(!lkHere() || G.over || !d) return; const p = lkPlayer(seat); if(!p || p.auto) return;
    const x = Number(d.x) || 0, y = Number(d.y) || 0, m = Math.hypot(x, y), k = m > 1 ? 1 / m : 1; p.input.x = x * k; p.input.y = y * k; });
  Link.on('sbshot', (d, seat) => { if(!lkHere() || G.over || !d) return; const p = lkPlayer(seat); if(!p || p.auto) return;
    if(d.a === 'power') firePower(p.i); else if(['normal', 'smash', 'drop', 'lob', 'slice'].indexOf(d.a) >= 0) shot(p.i, d.a); });
  Link.on('sbpause', (d, seat) => { if(!lkHere() || G.over || !d) return; if(!!d.on !== !!G.paused){ togglePause(); const p = lkPlayer(seat); if(p) banner((G.paused ? '⏸ ' + p.name + ' paused' : '▶ ' + p.name + ' — go!'), 'good'); } });
  Link.on('leave', e => { if(!lkHere() || G.over) return; const p = lkPlayer(e.seat); if(!p) return; p.auto = true; p.input.x = p.input.y = 0;
    banner('🤖 Robot plays for ' + p.name + (e.left ? '' : ' until they come back'), 'bad'); });
  const back = e => { if(!lkHere() || !LK.cfg) return; const p = lkPlayer(e.seat);
    if(p && p.auto && !G.over){ p.auto = false; p.input.x = p.input.y = 0; banner('👋 ' + p.name + ' is back!', 'good'); UISound.play('success'); }
    Link.send('sbgo', LK.cfg, {sure: true, to: e.seat}); if(G.over && LK.end) Link.send('sbend', LK.end, {sure: true, to: e.seat}); };
  Link.on('rejoin', back); Link.on('join', back);
  Link.on('lk:ask', (d, seat) => { if(!lkHere() || !G.over || !d || d.what !== 'again' || !LK.cfg || !LK.cfg.tv) return;   // 📺 lk-5e: the first player's 🔁
    if(Link.captain() === seat) lkGo(); });
  addEventListener('pagehide', () => { try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} });
}
// 🔗 the host's QR code opens ?page=slabrall&link=<code> → the picture pad fills itself in after the player pick
function lkUrlCode(cb){
  try{ if(window.google && google.script && google.script.url && google.script.url.getLocation){ google.script.url.getLocation(l => cb(((l && l.parameter) || {}).link || '')); return; } }catch(e){}
  try{ cb(new URLSearchParams(location.search).get('link') || ''); }catch(e){ cb(''); }
}
/* 📺 STATION (st-2b): opened from the 📺 Game Station — the TV starts by itself when the voted players are in (1 player = vs 🤖 at the voted level),
   the players vote 🔁 again / 🎮 another game after the match (LinkKit `Station`) */
if(window.Station) Station.game({url: WEBAPP_URL, page: 'slabrall', player: () => S.player || CURRENT_PLAYER, start: () => lkGo(), again: () => lkGo()});
/* 📡 END LINK (lk-1b) */
/* ✨ MODE SPOTLIGHT (modes-3): ?mode=<id> opens this game straight in that mode after the player pick · "✨ Also try" on the start page · started modes → UI.modeTried */
const MS_GAME = 'sla-brall';
function msOpen(id){
  if(id === 'ltv'){   /* 📺 lk-5f: from the Gameroom — the 📺 button glows · st-2b: from the 📺 Game Station = no picker, the voted level + sport */
    const pick = () => { lkHostPick(); const t = $('lkh-tv'); if(t) t.classList.add('lkh-glow'); };
    if(!window.Station){ pick(); return; }
    Station.params().then(p => { if(/^\d{4}$/.test(String(p.st || '')) && p.stv === '1'){ lkStPick(p); LK.tv = true; lkOpenHost(); } else pick(); });
    return;
  }
  if(id === 'cup'){ openCup(); return; } if(id === 'ljoin'){ lkOpenJoin(); return; } if(id === 'lhost'){ lkHostPick(); return; } if(SB.SPORT_ORDER.indexOf(id) < 0) return; /* 📡 lk-1b ?mode=ljoin */ SET.sport = id; savePrefs(); markSports(); const b = document.querySelector('#sport-list .sport.on'); if(b && b.scrollIntoView) b.scrollIntoView({block: 'nearest'});
}
function msNow(){ return SET.sport; }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startMatch', () => SET.sport);
msWrap('playCupMatch', () => 'cup');
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
msAfter('choosePlayer', () => { if(LK.urlDone) return; LK.urlDone = true;   // 📡 lk-1b: QR link → join
  lkUrlCode(c => { c = String(c || '').toLowerCase().replace(/[^0-9a-f]/g, '').slice(0, 4); if(c.length === 4) lkOpenJoin(c); }); });
/* ✨ END MODE SPOTLIGHT */
