
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
// Carried in from the Dashboard's "Let's Play" click (or from a game link
// that passed them along). Read server-side from the URL — see Code.gs doGet.
const SESSION_START = Number(SP_TV[3]) || null;
const DURATION_MIN = Number(SP_TV[4]) || null;

/* ---------- LOOK: the player's own theme (paint the last one at once) ---------- */
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER));
function applyLook(settings){
  const key = UI.applyTheme(UI.themeFor(settings, CURRENT_PLAYER));
  UI.rememberTheme(CURRENT_PLAYER, key);
}

const NAV_KIND = {home:'home', gameroom:'rooms', achievements:'trophy', setup:'admin', room:'room', collection:'collection', station:'station'};   // 📺 st-1
function goNav(page){
  UI.go(WEBAPP_URL + '?page=' + page + (CURRENT_PLAYER ? '&player=' + encodeURIComponent(CURRENT_PLAYER) : ''), NAV_KIND[page] || 'nav');
}
/* ---------- 🎮 ap-1 APP LOGO (UiKit UI.appLogo + GameLogos 'app'; placement: Claude outputs/logos/app/app-logo-placement.png) ---------- */
function placeAppLogo(){
  if(!UI.appLogo || !UI.appLogo.has()) return;
  const top = document.getElementById('app-logo-top'), mid = document.getElementById('lobby-logo'), lobby = document.querySelector('.lobby');
  const back = document.querySelector('.mobile-back'), who = lobby && lobby.querySelector('.who'), stats = lobby && lobby.querySelector('.stats');
  if(!top || !mid || !who || !stats) return;
  const cs = getComputedStyle(lobby), inner = lobby.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const free = Math.floor(inner - who.offsetWidth - stats.offsetWidth - 2 * 16 - 20), midPx = Math.min(250, free);
  if(midPx >= 170){   // 🖥️ iPad sideways / computer: the free middle of the 👋 card
    top.classList.remove('on'); lobby.classList.add('has-mid'); mid.classList.add('on');
    if(mid.dataset.apPx != midPx) UI.appLogo.mount(mid, 'wide', midPx); return;
  }
  mid.classList.remove('on'); lobby.classList.remove('has-mid');
  const br = back && getComputedStyle(back).display !== 'none' ? back.getBoundingClientRect() : null;
  if(!br || innerWidth > 900){ top.classList.remove('on'); return; }
  const left = Math.round(br.right + 10), room = innerWidth - left - 14, wide = innerWidth >= 360 && room >= 120;
  const kind = wide ? 'wide' : 'badge', px = wide ? Math.floor(Math.min(165, room)) : 44, h = Math.round(px * UI.appLogo.ratio(kind));
  top.style.left = left + 'px'; top.style.top = Math.round(br.top + window.scrollY + (br.height - h) / 2) + 'px'; top.classList.add('on');
  if(top.dataset.apKind !== kind || top.dataset.apPx != px) UI.appLogo.mount(top, kind, px);
}
(function(){ let rq = 0; const later = () => { cancelAnimationFrame(rq); rq = requestAnimationFrame(placeAppLogo); };
  addEventListener('resize', later); addEventListener('load', later);
  try { const ro = new ResizeObserver(later); ['.lobby .who', '.lobby .stats', '.mobile-back'].forEach(q => { const e = document.querySelector(q); if(e) ro.observe(e); }); } catch(e){}
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later); else later(); })();
function sessionQueryString(){
  let qs = '';
  if(CURRENT_PLAYER) qs += '&player=' + encodeURIComponent(CURRENT_PLAYER);
  if(SESSION_START) qs += '&sessionStart=' + SESSION_START;
  if(DURATION_MIN) qs += '&durationMin=' + DURATION_MIN;
  return qs;
}

/* ---------- HEADER ---------- */
if(CURRENT_PLAYER){
  document.getElementById('avatar').textContent = CURRENT_PLAYER.charAt(0).toUpperCase();
  document.getElementById('hi').textContent = 'Hi ' + CURRENT_PLAYER + '! 👋';
} else {
  // No player carried in (page opened directly) — offer a real button back
  // to the Dashboard to pick one (never a dead href="#" link).
  document.getElementById('avatar').textContent = '🙂';
  document.getElementById('stat-trophies').classList.add('hidden');
  const q = document.getElementById('q');
  q.textContent = 'Who is playing? ';
  const btn = document.createElement('button');
  btn.textContent = 'Choose on the Dashboard';
  btn.setAttribute('data-sound', 'none');
  btn.onclick = () => goNav('home');
  q.appendChild(btn);
}

/* ---------- LOOK OF EACH GAME ---------- */
// Card art per GameID: two colours + floating decorations. A game added to
// the sheet later without an entry here gets a colour pair from FALLBACK.
const GAME_ART = (window.CardArt && CardArt.ART) || {};   // 🧱 b1b: each game's colours live in the CardArt kit

// 💡 p5 (F12): every game's name story — shown on the big card and the ❓ How to play card. **bold** = the word parts.
const NAME_STORY = (window.CardArt && CardArt.STORY) || {};   // 🧱 b1b: the name stories live in the CardArt kit

function storyHtml(id){ const t = NAME_STORY[id]; return t ? UI.esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') : ''; }
// 🧩 One-word game types for the filter row (a game can have 2) + 👥 games with a 2-player mode on one screen.
if(window.UI){ if(UI.GAME_HELP && !UI.GAME_HELP.blasoff) UI.GAME_HELP.blasoff = ['Soccer with your avatar — score more goals than the other team!', 'Run with W A S D or the 🕹️ stick. J pass · K shoot · L trick · Space jump (twice = flick it up, then K = volley!).', 'When they shoot at your goal, shout Q or E — your robot keeper dives that way.']; if(UI.KINDS && !UI.KINDS.blasoff) UI.KINDS.blasoff = ['⚽', 'Blasting onto the pitch', 'launch']; }   // ⚽ bo-1: ❓ card + loader until the UiKit lane adds these to UiKit (Open questions)
const GAME_TYPES = {
  'maze': ['puzzle'], 'stacking-sim': ['science'], 'robot-adventure': ['coding'], 'code-robot': ['coding'],
  'checkers': ['strategy'], 'chess': ['strategy'], 'pinball': ['reflex'], 'hopper': ['reflex'], 'turbo': ['reflex'],
  'memory': ['memory'], 'number-grid': ['logic', 'numbers'], 'pop-blocks': ['puzzle'], 'block-drop': ['puzzle'],
  'double-up': ['math', 'puzzle'], 'sweet-swap': ['puzzle'], 'beat-corner': ['music'], 'sla-brall': ['sport', 'reflex'], 'blasoff': ['sport', 'reflex'], 'brawl-buddies': ['reflex'], 'soul-bopper': ['strategy', 'reflex'], 'pokadif': ['puzzle', 'science'], 'pyraspike': ['sport', 'reflex'], 'artifactory': ['make', 'design'], 'sciencetory': ['make', 'learn'], 'geoscout': ['math', 'numbers'], 'tdstories': ['story', 'strategy'], 'polyplot': ['strategy', 'math'], 'wisdeck': ['science', 'words'], 'eyes-brain': ['memory', 'numbers'], 'georead': ['reading', 'words'], 'alignext': ['strategy', 'logic'], 'snakeast': ['reflex', 'strategy'], 'pose-party': ['move'], 'word-board': ['words'],
  'number-board': ['math'], 'math-quest': ['math'], 'color-match': ['colours'], 'count-match': ['counting', 'numbers'], 'trash-pointer': ['sorting']
};
const TYPE_INFO = [['math', '➗', 'Math'], ['numbers', '🔢', 'Numbers'], ['counting', '🍎', 'Counting'], ['words', '🔤', 'Words'], ['colours', '🎨', 'Colours'],
  ['sorting', '♻️', 'Sorting'], ['logic', '🧠', 'Logic'], ['strategy', '♟️', 'Strategy'], ['puzzle', '🧩', 'Puzzles'], ['coding', '🤖', 'Coding'],
  ['reflex', '⚡', 'Quick hands'], ['sport', '🏓', 'Sport'], ['move', '🕺', 'Move your body'], ['memory', '🃏', 'Memory'], ['music', '🎵', 'Music'], ['science', '🔬', 'Science'], ['story', '🗺️', 'Story']];
if(window.UI && UI.KINDS && !UI.KINDS.pyraspike) UI.KINDS.pyraspike = ['🔥', 'Lighting the Pyra flame', 'bump'];   // 🔥 pd-1: PyraDive's loader + ❓ card (UiKit is the polish lane's — move these two lines there when it's free)
if(window.UI && UI.GAME_HELP && !UI.GAME_HELP.pyraspike) UI.GAME_HELP.pyraspike = ['Volleyball with your avatar! Each side gets 3 touches: 🤚 bump it up, 🪶 set it high, 💥 dunk it over the net. The ball landing in their court = your point.', 'W A S D move · J 🤚 touch · K 💥 drive / dunk (hold on a serve) · L 🪶 dink · Space ⬆️ jump / block · Shift 🤸 dive · F 🔥 Pyra. On a tablet: the stick + the round buttons.', 'Good touches fill your 🔥 flame. Half full → tap 🔥 and your next move is a Pyra… move!'];
if(window.UI && UI.KINDS && !UI.KINDS.pokadif) UI.KINDS.pokadif = ['🔍', 'Opening the detective file', 'peek'];   // 🔍 pk-1: Pokadif's loader + ❓ card (UiKit is the polish lane's — move these two lines there when it's free)
if(window.UI && UI.GAME_HELP && !UI.GAME_HELP.pokadif) UI.GAME_HELP.pokadif = ['Be a little detective! 🖼️ Spot: two pictures, poke every change · 👁️ Blink: one picture flips — what changed? · 🎯 Odd One Out: poke the one that doesn\'t belong · ⏱️ Arcade: race the clock · 🕵️ Detective Adventure: solve a case book in 3 chapters.', 'Tap (or click) what is different. 🌱 Basic: colours + missing things. More levels add 📏 size, 🔺 shape, 🔄 turn / flip, 🔢 count, then 🧮 sums, 🔤 words and 🌀 patterns.', 'Stuck? Tap 🔍 — the magnifier shows you one. Fewer oops = more ⭐. Every picture is brand new!'];
if(window.UI && UI.KINDS && !UI.KINDS.sciencetory) UI.KINDS.sciencetory = ['🔬', 'Warming up the lab', 'bob'];   // 🔬 sc-1: Sciencetory's loader + ❓ card (UiKit is the polish lane's — move these two lines there when it's free)
if(window.UI && UI.GAME_HELP && !UI.GAME_HELP.sciencetory) UI.GAME_HELP.sciencetory = ['A science lab for the things YOU made in Artifactory: press it, pull it, twist it, drop it, float it… — ⚗️ Chemistry: hunt elements on the periodic table, snap atoms into molecules, collect 📇 element cards — ⚛️ Quantum: build real atoms from protons, neutrons + electrons — and 🔬 Particle: snap quarks into protons, read collider tracks, collect the 17 particle cards — and 🔥 Thermo: thermometers, a melt ladder, cup tests + mixing hot and cold water — and ⚡ Electro: circuits, conductors, magnets + electromagnets — and 🌈 Optics: rainbows, light vs paint, mirror mazes + magnifiers — and 🔊 Acoustics: sound waves, xylophone, echoes + thunder.', 'Pick a test and a thing (or a 🧪 lab sample) → set it in the rig → guess 👍 / 👎 → watch the gauge → read your 📋 test card.', 'A test can break a thing — never lost! Fix it with 🔧 Repair in Artifactory. A right guess = bonus points.'];
const MULTI_GAMES = {'geoscout': 2, 'beat-corner': 2, 'eyes-brain': 4, 'polyplot': 4, 'checkers': 2, 'chess': 2, 'number-board': 4, 'word-board': 4, 'sla-brall': 4, 'blasoff': 2, 'brawl-buddies': 2, 'soul-bopper': 4, 'pyraspike': 2, 'alignext': 4, 'snakeast': 2, 'turbo': 2, 'memory': 4, 'pokadif': 2, 'pose-party': 4};   // most players at once on one screen (🎴 gr-5: + 🏎️ split race · 🃏 Memories with friends · 🔍 👥 Race · 📷 group poses)
/* 🎴 gr-3 GROUPS (Aowu 2026-11-15): ❤️ first, then Learning → Sport → Adventure & story → Puzzles & board → Action → Make & music.
   A game's group = the FIRST group whose types match its GAME_TYPES (GROUP_OF overrides that). A favourite shows ONLY in ❤️.
   New game: its GAME_TYPES line decides the group — a story / adventure game uses the type 'story'. */
const GROUPS = [
  {k: 'fav', icon: '❤️', en: 'My favourites', th: 'เกมโปรด'},
  {k: 'learn', icon: '📚', en: 'Learning games', th: 'เกมเรียนรู้', types: ['math', 'numbers', 'counting', 'words', 'reading', 'colours', 'sorting', 'science', 'coding', 'learn']},
  {k: 'sport', icon: '🏅', en: 'Sport games', th: 'เกมกีฬา', types: ['sport', 'move']},
  {k: 'story', icon: '🗺️', en: 'Adventure & story', th: 'ผจญภัยและเรื่องราว', types: ['story', 'adventure']},
  {k: 'brain', icon: '🧩', en: 'Puzzles & board games', th: 'ปริศนาและเกมกระดาน', types: ['puzzle', 'logic', 'memory', 'strategy']},
  {k: 'action', icon: '⚡', en: 'Action games', th: 'เกมแอ็กชัน', types: ['reflex']},
  {k: 'make', icon: '🎨', en: 'Make & music', th: 'สร้างสรรค์และดนตรี', types: ['make', 'design', 'music']},
  {k: 'more', icon: '🎮', en: 'More games', th: 'เกมอื่น ๆ'}
];
const GROUP_OF = {'snakeast': 'action', 'soul-bopper': 'action'};   // plays like an action game, whatever its tags say
function groupOf(g){
  if(favs.indexOf(g.GameID) >= 0) return 'fav';
  if(GROUP_OF[g.GameID]) return GROUP_OF[g.GameID];
  const t = typesOf(g), grp = GROUPS.find(x => x.types && x.types.some(k => t.indexOf(k) >= 0));
  return grp ? grp.k : 'more';
}
function groupHead(grp, n){
  const h = document.createElement('div'); h.className = 'grp-head'; h.dataset.grp = grp.k; h.setAttribute('role', 'heading'); h.setAttribute('aria-level', '3');
  h.innerHTML = '<span class="gi">' + grp.icon + '</span><b>' + UI.esc(grp.en) + '</b><small>' + UI.esc(grp.th) + '</small><span class="n">' + n + '</span>';
  return h;
}
function typesOf(g){ if(GAME_TYPES[g.GameID]) return GAME_TYPES[g.GameID]; const l = String(g.STEAMFocus || '').toLowerCase(); return TYPE_INFO.filter(t => l.indexOf(t[0].slice(0, 4)) !== -1).map(t => t[0]); }
function typeLine(g){ const t = typesOf(g).map(k => TYPE_INFO.find(x => x[0] === k)).filter(Boolean); return t.length ? t.map(x => x[1] + ' ' + x[2]).join(' · ') : focusIcon(g.STEAMFocus) + ' ' + UI.esc(g.STEAMFocus || ''); }
function maxPlayers(g){ return MULTI_GAMES[g.GameID] || 1; }
function isMulti(g){ return maxPlayers(g) >= 2; }
const FALLBACK = [['#F9A03F','#E8584A'],['#56CCF2','#2F80ED'],['#B57BEE','#7B52C9'],['#6FCF97','#219653'],['#F2C94C','#E07B39']];
function artOf(g, i){
  const a = GAME_ART[g.GameID];
  if(a) return a;
  const f = FALLBACK[i % FALLBACK.length];
  return {c1:f[0], c2:f[1], deco:['⭐','✨','🎈','🎉']};
}
// Old sheet rows keep their old names; show the new name for reworked games.
const OLD_NAMES = ['Shaped Box Stacking Sim', 'Number Puzzle Board', 'Word Puzzle Board', 'Number Grid'];
function nameOf(g){
  const a = GAME_ART[g.GameID];
  return (a && a.name && OLD_NAMES.indexOf(g.GameName) >= 0) ? a.name : g.GameName;
}
const FOCUS_ICONS = [['color','🎨'],['count','🔢'],['math','🔢'],['coding','🤖'],['environment','🌱'],['science','🔬'],
  ['problem','🧩'],['spatial','🧩'],['engineer','🏗️'],['build','🏗️'],['art','🎨'],['mixed','✨']];
function focusIcon(f){
  const l = String(f || '').toLowerCase();
  const hit = FOCUS_ICONS.find(x => l.indexOf(x[0]) !== -1);
  return hit ? hit[1] : '⭐';
}

/* ---------- STATE ---------- */
let allGames = [];
let progress = {};
let NEW_ORDER = [];         /* 🆕 gro-1: GameIDs newest first (server NEW_GAMES_ dates); games older than that list follow in reverse sheet order */
let favs = [];               /* ❤️ this player's favourite GameIDs, first starred first */
let FAV_LOCAL_AT = 0;        /* ❤️ gr-2: when this page last changed favs (a later server answer sent BEFORE that must not overwrite them) */
let favOk = null;            /* ❤️ gr-2b: the list the SERVER has (null = no answer yet) — a failed save goes back to it */
let favWait = 0;             /* ❤️ gr-2b: saves sent and not answered yet → ⏳ on the hearts that differ from favOk */
let favSent = 0;             /* ❤️ gr-2b: tap time of the newest save sent */
const FAV_DEV = (() => { try { let d = localStorage.getItem('sp_favdev'); if(!d){ d = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); localStorage.setItem('sp_favdev', d); } return d; } catch(e){ return 'nodev'; } })();
function favListOf(d){ try { const f = JSON.parse(((d && d.settings) || {})['Fav_' + CURRENT_PLAYER] || '[]'); return Array.isArray(f) ? f : []; } catch(e){ return []; } }
function favPending(id){ return favWait > 0 && !!favOk && favs.indexOf(id) !== favOk.indexOf(id); }
function favMarks(){ document.querySelectorAll('.fav[data-fav]').forEach(el => el.classList.toggle('wait', favPending(el.dataset.fav))); }
let filter = 'all';          // 'all' | 'foryou' | a STEAMFocus value
let currentPlayerAge = null;

// Age bracket → words that may appear in a game's SkillLevel column.
const AGE_SKILL_HINTS = {
  '4-5': ['beginner','starter','easy','4-5','non-reader'],
  '6-7': ['beginner','starter','easy','mixed','whole family'],
  '8-9': ['intermediate','medium','mixed','whole family'],
  '10+': ['advanced','hard','mixed','whole family']
};
function isAgeMatch(game){
  if(!currentPlayerAge) return false;
  const hints = AGE_SKILL_HINTS[currentPlayerAge] || [];
  const lvl = (game.SkillLevel || '').toLowerCase();
  return hints.some(h => lvl.includes(h));
}

/* ---------- BOOT: paint from the last visit at once, then one server call ---------- */
// First visit: skeleton cards (same shape as the real ones) + a status chip.
// Later visits: the cards from last time show instantly and refresh quietly.
const ROOM_CACHE = 'sp_room:' + CURRENT_PLAYER;
let records = {}, badges = {};
function readRoom(){ try{ return JSON.parse(localStorage.getItem(ROOM_CACHE) || 'null'); }catch(e){ return null; } }
function writeRoom(d){ try{ localStorage.setItem(ROOM_CACHE, JSON.stringify(d)); }catch(e){} }
function applyRoom(d){
  currentPlayerAge = d.playerAge || null;
  progress = d.progress || {}; records = d.records || {}; badges = d.badges || {};
  MODES = {list: (d.modes && Array.isArray(d.modes.list)) ? d.modes.list : [], tried: ((d.modes && d.modes.tried) || {})[CURRENT_PLAYER] || []};   // ✨ modes-2
  try{ const f = JSON.parse(((d.settings || {})['Fav_' + CURRENT_PLAYER]) || '[]'); favs = Array.isArray(f) ? f : []; }catch(e){ favs = []; }
  document.getElementById('trophies').textContent = d.trophies || 0;
  applyLook(d.settings);
  if(Array.isArray(d.newOrder)) NEW_ORDER = d.newOrder;   // 🆕 gro-1
  onGames(d.games || []);
  renderModeStrip();
}
function showSkeleton(){
  const grid = document.getElementById('game-grid'), mg = document.getElementById('mini-grid');
  const art = [['#4FD1A5','#3D7DD8','🧭'], ['#FFB45E','#EF5F67','🏗️']];
  grid.innerHTML = art.map(a => '<div class="game-card t-card skel" aria-hidden="true"><div class="art"><span class="bob">' + a[2] + '</span></div>' +
    '<div class="card-body"><span class="sk w60"></span><span class="sk w40"></span><span class="sk w80"></span></div></div>').join('');
  mg.innerHTML = '<div class="mini skel"></div>'.repeat(4);
}
function loadChip(on, text){
  document.getElementById('load-chip').classList.toggle('hidden', !on);
  if(text) document.getElementById('load-text').textContent = text;
}
function loadGameroom(){
  const cached = readRoom();
  if(cached){ applyRoom(cached); loadChip(true, 'Checking for new scores'); }
  else { showSkeleton(); loadChip(true, 'Getting your games'); }
  const sentAt = Date.now();   // ❤️ gr-2: a ❤️ / ⬆️ tapped after this keeps its new list when this (older) answer lands
  google.script.run
    .withSuccessHandler(d=>{
      loadChip(false);
      if(favOk === null || !favWait) favOk = favListOf(d);   // ❤️ gr-2b: what the server has
      if(FAV_LOCAL_AT > sentAt){ d.settings = d.settings || {}; d.settings['Fav_' + CURRENT_PLAYER] = JSON.stringify(favs); }
      writeRoom(d);
      applyRoom(d);
      UISound.applySettings(d.settings);
      setTimeout(() => UI.guideOnce('gameroom:' + (CURRENT_PLAYER || '-'), gameroomGuide()), 500);
      initScreenTime(d.settings);
    })
    .withFailureHandler(()=>{
      loadChip(false);
      if(!cached){ document.getElementById('game-grid').innerHTML = ''; document.getElementById('mini-grid').innerHTML = ''; }
      UI.toast('Could not load the games — check the connection and reopen', 'err');
      initScreenTime(null);
    })
    .getGameroomData(CURRENT_PLAYER);
}
function onGames(games){
  allGames = games.filter(g => g.Status === 'Live' && g.PageRoute !== 'workshop');   // Furniture craft lives in My Room (Family Room) now
  renderFilters();
  render();
}

// A PageRoute shared by several games = one file of mini-games.
function isMini(g){ return allGames.filter(x => x.PageRoute === g.PageRoute).length > 1; }

function matches(g){
  if(filter === 'all') return true;
  if(filter === 'foryou') return isAgeMatch(g);
  if(filter === 'fav') return favs.indexOf(g.GameID) >= 0;
  if(filter === 'multi') return isMulti(g);
  if(filter === 'party') return maxPlayers(g) >= 3;
  if(filter.indexOf('t:') === 0) return typesOf(g).indexOf(filter.slice(2)) >= 0;
  return g.STEAMFocus === filter;
}

function renderFilters(){
  const box = document.getElementById('filters'); box.innerHTML = '';
  const items = [['all', '🎮', 'All games'], ['multi', '👥', '2 players'], ['party', '👨‍👩‍👧‍👦', '3–4 players', 'gap']];
  if(favs.some(id => allGames.some(g => g.GameID === id))) items.push(['fav', '❤️', 'My favourites']);
  if(currentPlayerAge && allGames.some(isAgeMatch)) items.push(['foryou', '⭐', 'For you']);
  if(items.length > 3) items[items.length - 1][3] = 'gap';
  TYPE_INFO.forEach(([k, icon, label]) => { if(allGames.some(g => typesOf(g).indexOf(k) >= 0)) items.push(['t:' + k, icon, label]); });
  if(!items.some(i => i[0] === filter)) filter = 'all';
  items.forEach(([key, icon, label, gap]) => {
    const was = filter; filter = key; const n = allGames.filter(matches).length; filter = was;
    const b = document.createElement('button');
    b.className = 'pill t-chip' + (filter === key ? ' active' : '') + (gap ? ' gap' : '') + (key === 'multi' || key === 'party' ? ' who' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', filter === key ? 'true' : 'false');
    b.setAttribute('data-sound', 'pop');
    b.innerHTML = '<span>' + icon + '</span><span>' + UI.esc(label) + '</span><span class="n">' + n + '</span>';
    b.onclick = () => { filter = key; renderFilters(); render(); };
    box.appendChild(b);
  });
}

function render(){
  const shown = allGames.filter(matches);
  // gro-1: ❤️ favourites first (the player's own order), then NEWEST games first (new games are the last rows of the Games tab).
  const order = g => { const f = favs.indexOf(g.GameID); if(f >= 0) return f - 100000; const n = NEW_ORDER.indexOf(g.GameID); return n >= 0 ? n - 50000 : -allGames.indexOf(g); };
  // 🎴 gr-3: big cards in GROUPS (❤️ first, then Learning → Sport → Adventure & story → Puzzles → Action → Make & music), newest first in each
  const gi = g => { const k = groupOf(g); return GROUPS.findIndex(x => x.k === k); };
  const big = shown.filter(g => !isMini(g)).sort((a, b) => (gi(a) - gi(b)) || (order(a) - order(b)));
  const mini = shown.filter(isMini).sort((a, b) => order(a) - order(b));
  const grid = document.getElementById('game-grid'), mg = document.getElementById('mini-grid');
  grid.innerHTML = ''; mg.innerHTML = '';
  const items = []; let last = null;   // one header row per group, then its cards
  big.forEach(g => { const k = groupOf(g); if(k !== last){ last = k; const grp = GROUPS.find(x => x.k === k); items.push({head: grp, n: big.filter(x => groupOf(x) === k).length}); } items.push({g}); });
  const put = it => grid.appendChild(it.head ? groupHead(it.head, it.n) : sizeArt(bigCard(it.g)));
  // Speed: the first cards (what fits the screen) paint at once, the rest follow in small batches — never all together.
  const seq = ++renderSeq, FIRST = innerWidth >= 900 ? 6 : 4, STEP = 4;
  let cut = 0, cards = 0; while(cut < items.length && cards < FIRST){ if(!items[cut].head) cards++; cut++; }
  items.slice(0, cut).forEach(put);
  const rest = items.slice(cut);
  const more = () => { if(seq !== renderSeq) return; const part = rest.splice(0, STEP); part.forEach(put); if(rest.length) requestAnimationFrame(more); else mini.forEach(g => mg.appendChild(miniTile(g))); };
  if(rest.length) requestAnimationFrame(more); else mini.forEach(g => mg.appendChild(miniTile(g)));
  document.getElementById('big-sec').classList.toggle('hidden', !big.length);
  const tip = document.getElementById('fav-tip'); if(tip) tip.classList.toggle('hidden', !CURRENT_PLAYER || favs.length > 0);
  document.getElementById('mini-sec').classList.toggle('hidden', !mini.length);
  document.getElementById('empty-msg').classList.toggle('hidden', !!shown.length);
}

// Card pictures size themselves from the box (px), so they fill wide tablet cards on every browser.
let renderSeq = 0;
const artRO = typeof ResizeObserver === 'function' ? new ResizeObserver(list => list.forEach(en => { const r = en.contentRect, el = en.target; if(r.width < 60 || r.height < 40) return;   /* r35b: never shrink the picture from a half-laid-out box */
  el.style.setProperty('--ah', Math.round(r.height) + 'px'); el.style.setProperty('--aw', Math.round(r.width) + 'px'); })) : null;
// Cards off the screen pause their floating pictures (less work for tablets / older phones).
const cardIO = typeof IntersectionObserver === 'function' ? new IntersectionObserver(list => list.forEach(en => en.target.classList.toggle('idle', !en.isIntersecting)), {rootMargin: '120px'}) : null;
function sizeArt(card){ const a = card.querySelector('.art'); if(a && artRO) artRO.observe(a); if(cardIO) cardIO.observe(card); return card; }

/* ✨ MODE SPOTLIGHT (modes-2): chips under a game's name open it straight in that mode; the strip at the top shows modes this player hasn't tried */
let MODES = {list: [], tried: []};
const MODE_CHIPS_MAX = 4;
function modesOf(g){ return MODES.list.filter(m => m.game === g.GameID).map((m, i) => [m, i]).sort((a, b) => mgOrd(a[0], a[1]) - mgOrd(b[0], b[1])).map(x => x[0]); }   // 🗂️ mg-1 group order (the start page's boxes)
function mgOrd(m, i){ return m.group ? m.group.n * 1000 + m.group.i : 900000 + i; }
// 🗂️ mg-1: one line per group — "🎯 Pose ท่าโพส — 🎯 Classic · ⏱️ Speed 60 s" (games with 2+ groups only)
function modeGroupLines(g){
  const out = [], by = {}; modesOf(g).forEach(m => { if(!m.group) return; if(!by[m.group.k]){ by[m.group.k] = {grp: m.group, ms: []}; out.push(by[m.group.k]); } by[m.group.k].ms.push(m); });
  return out.length < 2 ? [] : out.map(x => [x.grp.icon, '**' + x.grp.en + '** ' + x.grp.th + ' — ' + x.ms.map(m => m.icon + ' ' + modeShort(m)).join(' · ')]);
}
function modeFresh(m){ return !!CURRENT_PLAYER && MODES.tried.indexOf(m.key) < 0; }
function modeShort(m){ const n = String(m.name || ''), gn = String(m.gname || ''); const t = gn && n.indexOf(gn + ' ') === 0 ? n.slice(gn.length + 1) : n; return t.replace(/^for 2$/, '2 players') || n; }
function modeChips(g){
  const ms = modesOf(g); if(!ms.length) return '';
  const list = ms.filter(modeFresh).concat(ms.filter(m => !modeFresh(m))), show = list.length > MODE_CHIPS_MAX + 1 ? list.slice(0, MODE_CHIPS_MAX) : list, more = list.length - show.length;
  return '<div class="mode-chips" aria-label="Ways to play">' + show.map(m => '<span class="mchip' + (modeFresh(m) ? ' fresh' : '') + '" role="button" tabindex="0" data-mode="' + UI.esc(m.key) + '" title="' + UI.esc(m.name + ' — ' + m.pitch + (modeFresh(m) ? ' (not tried yet)' : '')) + '"><span class="mi">' + UI.esc(m.icon) + '</span><span class="mn">' + UI.esc(modeShort(m)) + '</span></span>').join('') +
    (more ? '<span class="mchip more" role="button" tabindex="0" data-more="1" title="More ways to play">+' + more + '</span>' : '') + '</div>';
}
function chipTap(el, g){
  if(el.dataset.more){ showModes(g); return; }
  const m = MODES.list.find(x => x.key === el.dataset.mode); if(m) openMode(m);
}
function openMode(m){
  UI.go(WEBAPP_URL + '?page=' + m.link + sessionQueryString(), UI.KINDS[m.game] ? m.game : 'game', 'Opening ' + m.name);
}
// "+N": every way to play this game, as one sheet with a button per mode
function showModes(g){
  const ms = modesOf(g), grouped = modeGroupLines(g).length > 0, rows = [];   // 🗂️ mg-1: a header line per group, then its modes
  ms.forEach((m, i) => { if(grouped && m.group && (!i || !ms[i - 1].group || ms[i - 1].group.k !== m.group.k)) rows.push({line: [m.group.icon, '**' + m.group.en + '** · ' + m.group.th]}); rows.push({m, line: [m.icon, '**' + m.name + '** — ' + m.pitch + (modeFresh(m) ? ' ✨' : '')]}); });
  UI.guide([{icon: g.Icon, title: 'Ways to play ' + nameOf(g), lines: rows.map(r => r.line)}], {doneText: '▶ Play ' + nameOf(g)});
  const box = document.querySelector('.ui-guide'), next = box && box.querySelector('.ug-next');
  if(next) next.onclick = () => { box.querySelector('.ug-x').click(); openGame(g); };
  if(box) box.querySelectorAll('.ug-line').forEach((li, i) => { const m = rows[i] && rows[i].m; if(!m){ if(rows[i]) li.classList.add('mg-head'); return; } li.style.cursor = 'pointer'; li.setAttribute('role', 'button'); li.onclick = () => { box.querySelector('.ug-x').click(); openMode(m); }; });
}
document.addEventListener('keydown', e => { const c = e.target && e.target.closest && e.target.closest('.mchip'); if(c && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); e.stopPropagation(); const card = c.closest('.game-card'), g = allGames.find(x => modesOf(x).some(m => m.key === c.dataset.mode)) || (card && allGames.find(x => card.querySelector('[data-help="' + x.GameID + '"]'))); if(g) chipTap(c, g); } }, true);
// ✨ strip: up to 12 untried modes (order changes every day), 1–4 cards showing, moves on every 5 s, no scroll bar
const MS_ROT = {n: 0, start: 0, slots: 1, timer: 0, pauseUntil: 0};
function renderModeStrip(){
  const sec = document.getElementById('mode-strip'), box = document.getElementById('ms-list'); if(!sec || !box) return;
  const live = {}; allGames.forEach(g => { live[g.GameID] = g; });
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  let pool = CURRENT_PLAYER ? MODES.list.filter(m => modeFresh(m) && live[m.game]) : [];
  if(pool.length > 1){ const k = (day * 5) % pool.length; pool = pool.slice(k).concat(pool.slice(0, k)); }
  pool = pool.slice(0, 12);
  if(!pool.length){ sec.classList.add('hidden'); box.innerHTML = ''; if(MS_ROT.timer) clearInterval(MS_ROT.timer); MS_ROT.timer = 0; return; }
  box.innerHTML = pool.map(m => { const g = live[m.game], a = artOf(g, allGames.indexOf(g));
    return '<button class="ms-card" data-sound="nav" data-mode="' + UI.esc(m.key) + '" style="--c1:' + a.c1 + ';--c2:' + a.c2 + '"><span class="ms-in"><span class="ms-ic">' + UI.esc(m.icon) + '</span><span class="ms-tx"><b>' + UI.esc(m.name) + '</b><small>' + UI.esc(nameOf(g)) + ' · ' + UI.esc(m.pitch) + '</small></span><span class="ms-go">Try ▶</span></span></button>'; }).join('');
  box.querySelectorAll('.ms-card').forEach((b, i) => b.onclick = () => openMode(pool[i]));
  document.getElementById('ms-count').textContent = pool.length + (pool.length === 1 ? ' way' : ' ways') + ' to try';
  sec.classList.remove('hidden');
  MS_ROT.n = pool.length; msShow(0, false);
  if(MS_ROT.timer) clearInterval(MS_ROT.timer);
  MS_ROT.timer = setInterval(() => { if(document.hidden || Date.now() < MS_ROT.pauseUntil || MS_ROT.n <= MS_ROT.slots) return; msShow(MS_ROT.start + MS_ROT.slots, true); }, 5000);
}
function msSlots(){ const w = document.getElementById('ms-list').clientWidth || innerWidth; return Math.max(1, Math.min(MS_ROT.n, w >= 1100 ? 4 : w >= 760 ? 3 : w >= 500 ? 2 : 1)); }
function msShow(start, anim){
  const R = MS_ROT, cards = Array.from(document.querySelectorAll('#ms-list .ms-card')); if(!cards.length) return;
  R.slots = msSlots(); R.start = ((start % R.n) + R.n) % R.n;
  cards.forEach((c, i) => { const pos = (i - R.start + R.n) % R.n, on = pos < R.slots; c.style.order = pos; c.classList.toggle('off', !on); c.classList.remove('in'); if(on && anim){ void c.offsetWidth; c.classList.add('in'); } });
  const pages = Math.ceil(R.n / R.slots), cur = Math.floor(R.start / R.slots) % pages;
  document.getElementById('ms-dots').innerHTML = pages > 1 && pages <= 8 ? Array.from({length: pages}, (_, p) => '<i class="' + (p === cur ? 'on' : '') + '"></i>').join('') : '';
}
(function msGestures(){
  const box = document.getElementById('ms-list'); if(!box) return; let x0 = null;
  box.addEventListener('pointerenter', e => { if(e.pointerType === 'mouse') MS_ROT.pauseUntil = Date.now() + 60000; });
  box.addEventListener('pointerleave', e => { if(e.pointerType === 'mouse') MS_ROT.pauseUntil = Date.now() + 2500; });
  box.addEventListener('pointerdown', e => { x0 = e.clientX; MS_ROT.pauseUntil = Date.now() + 9000; });
  box.addEventListener('pointerup', e => { if(x0 == null) return; const dx = e.clientX - x0; x0 = null; if(Math.abs(dx) > 40){ MS_ROT.swiped = true; setTimeout(() => { MS_ROT.swiped = false; }, 400); msShow(MS_ROT.start + (dx < 0 ? MS_ROT.slots : -MS_ROT.slots), true); } });
  box.addEventListener('click', e => { if(MS_ROT.swiped){ e.stopPropagation(); e.preventDefault(); MS_ROT.swiped = false; } }, true);   // a swipe is not a tap
  window.addEventListener('resize', () => { if(MS_ROT.n) msShow(MS_ROT.start, false); });
})();

function openGame(g){
  const deep = g.PageRoute === 'minigames' ? '&game=' + encodeURIComponent(g.GameID) : '';
  UI.go(WEBAPP_URL + '?page=' + g.PageRoute + deep + sessionQueryString(), UI.KINDS[g.GameID] ? g.GameID : 'game', 'Opening ' + nameOf(g));   // each game opens with its own icon
}

// Best result on the hardest level cleared: fastest time, crown if it is the family record.
const LEVEL_NAMES = ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', '💀 Hardcore'];
function fmtSec(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function bestTag(g){
  const p = progress[g.GameID];
  if(p && p.best){
    for(let i = p.best.length - 1; i >= 0; i--){
      const b = p.best[i];
      if(!b || !b.timeSec) continue;
      const rec = (records[g.GameID] || [])[i];
      const mine = rec && rec.name === CURRENT_PLAYER && rec.timeSec === b.timeSec;
      const what = b.score ? '🏆 ' + Number(b.score).toLocaleString() : (mine ? '👑 Record ' : '⏱ Best ') + fmtSec(b.timeSec);
      return '<span class="best-tag' + (mine ? ' rec' : '') + '">' + what + ' · ' + LEVEL_NAMES[i] + '</span>';
    }
  }
  const n = badges[g.GameID];
  return n ? '<span class="best-tag">🏅 ' + n + ' badge' + (n === 1 ? '' : 's') + '</span>' : '';
}
// 📡 lk-1b-g: games that play on 2+ own devices (LinkKit). join = the game's ?mode= id that opens its 🔗 picture pad.
/* 🏠 WAITING ROOM (lk-2c): open family rooms (LinkKit) on top of the Gameroom — ▶ Join = this player straight into that game's room */
const WAIT_ROOMS = window.Link && Link.board ? Link.board(document.getElementById('wait-panel'), {url: WEBAPP_URL, title: 'Waiting rooms', th: 'ห้องรอเล่น', always: true,
  empty: 'No room open right now — tap 📡 Connect on a game to host one', player: () => CURRENT_PLAYER || '',
  go: (url, r) => {
    if(!CURRENT_PLAYER){ UISound.play('error'); UI.toast('👆 Pick who is playing first'); const b = document.querySelector('#wait-panel .lkb-go[data-code="' + r.code + '"]'); if(b) UI.idle(b); return; }
    UI.go(WEBAPP_URL + '?page=' + encodeURIComponent(r.page) + sessionQueryString() + '&link=' + r.code, 'link', 'Joining ' + r.host + "'s room");
  }}) : null;
/* 🏠 END WAITING ROOM */
const LINK_GAMES = {
  'sla-brall': {join: 'ljoin', hostMode: 'lhost', tvMode: 'ltv', players: '2–4', host: 'Pick a sport + level → 📡 Open the room', tv: 'The court on the TV · each phone is a controller'},   /* lk-2c: hostMode opens the game's host screen */
  'word-board': {join: 'ljoin', hostMode: 'lhost', tvMode: 'ltv', players: '2–4', host: 'Pick words · board · rounds → 📡 Open the room', tv: 'The board on the TV · letters stay on each phone'},   /* 🎴 gr-td1: 🔤 Lettercraft on own devices (lk-3a) */
  'chess': {join: 'ljoin', hostMode: 'lhost', tvMode: 'ltv', players: '2', host: 'Opens a room straight away — colours swap every game', tv: 'The board on the TV · both players on their own device'},   /* 🎴 gr-lk3: ♟️ Chess on own devices (lk-3b) */
  'checkers': {join: 'ljoin', hostMode: 'lhost', tvMode: 'ltv', players: '2', host: 'Opens a room straight away — colours swap every game', tv: 'The board on the TV · both players on their own device'},
  'memory': {join: 'ljoin', hostMode: 'lhost', tvMode: 'ltv', players: '2–4', host: 'Pick a map + level → 📡 Open the room', tv: 'The cards on the TV · everyone flips on their own device'},   // 🎴 gr-5 (mm-4 + st-1)
  'number-board': {join: 'ljoin', hostMode: 'lhost', tvMode: 'ltv', players: '2–4', host: 'Pick signs · board · rounds → 📡 Open the room', tv: 'The board on the TV · tiles stay on each phone'}   /* 📺 lk-5f: ➗ Algebros on own devices (lk-3d) */   /* 🎴 gr-lk3: 🔴 Checkers on own devices (lk-3c) */
};
function linkBtn(g){
  if(!LINK_GAMES[g.GameID]) return '';
  return '<span class="link-btn" role="button" tabindex="0" data-link="' + UI.esc(g.GameID) + '" title="Connect to other players — each on their own device" aria-label="Connect to other players in ' + UI.esc(nameOf(g)) + '"><i>📡</i><b class="grlk-long">Connect to other players</b><b class="grlk-short">Connect</b></span>';
}
function showLink(g){
  const L = LINK_GAMES[g.GameID]; if(!L) return;
  const old = document.querySelector('.grlk-modal'); if(old) old.remove();
  const kind = UI.KINDS[g.GameID] ? g.GameID : 'game';
  const m = document.createElement('div'); m.className = 'ui-modal on grlk-modal';
  m.innerHTML = '<div class="ui-modal-card grlk-card" role="dialog" aria-modal="true" aria-label="Connect to other players">' +
    '<button class="grlk-x" type="button" aria-label="Close">✕</button>' +
    '<div class="ico">📡</div><h3>Play ' + UI.esc(nameOf(g)) + ' together</h3>' +
    '<p>' + UI.esc(L.players) + ' players, each on their own phone or tablet · same Wi-Fi' + (g.GameID === 'sla-brall' ? '' : ' or 🌍 anywhere') + '</p>' +   /* lk-5a: turn games link across houses (lk-4a) */
    '<div class="grlk-opts">' +
      '<button class="grlk-opt grlk-join" type="button" data-k="join"><i>🔗</i><b>Join friends</b><small>A friend opened a room → type their 4 numbers</small></button>' +
      '<button class="grlk-opt grlk-host" type="button" data-k="host"><i>🎮</i><b>Host and play</b><small>' + UI.esc(L.host) + '</small></button>' +
      (L.tvMode ? '<button class="grlk-opt grlk-tv" type="button" data-k="tv"><i>📺</i><b>Room hostess (TV)</b><small>' + UI.esc(L.tv || 'This screen shows the game · everyone plays on their own device') + '</small></button>' : '') +
    '</div></div>';
  document.body.appendChild(m);
  try{ UISound.play('pop'); }catch(e){}
  function close(){ document.removeEventListener('keydown', onKey, true); m.remove(); }
  function onKey(e){ if(e.key === 'Escape'){ e.preventDefault(); close(); } }
  document.addEventListener('keydown', onKey, true);
  m.addEventListener('click', e => { if(e.target === m) close(); });
  m.querySelector('.grlk-x').onclick = close;
  m.querySelector('.grlk-join').onclick = () => { close(); UI.go(WEBAPP_URL + '?page=' + g.PageRoute + '&mode=' + encodeURIComponent(L.join) + sessionQueryString(), kind, '🔗 Join friends · ' + nameOf(g)); };
  m.querySelector('.grlk-host').onclick = () => { close(); if(L.hostMode) UI.go(WEBAPP_URL + '?page=' + g.PageRoute + '&mode=' + encodeURIComponent(L.hostMode) + sessionQueryString(), kind, '🎮 Host and play · ' + nameOf(g)); else openGame(g); };
  const tvb = m.querySelector('.grlk-tv');   // 📺 lk-5f: the TV / iPad opens the room without playing
  if(tvb) tvb.onclick = () => { close(); UI.go(WEBAPP_URL + '?page=' + g.PageRoute + '&mode=' + encodeURIComponent(L.tvMode) + sessionQueryString(), kind, '📺 Room hostess · ' + nameOf(g)); };
  m.querySelector('.grlk-join').focus();
}
document.addEventListener('keydown', e => { const l = e.target && e.target.closest && e.target.closest('.link-btn'); if(l && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); e.stopPropagation(); const g = allGames.find(x => x.GameID === l.dataset.link); if(g) showLink(g); } }, true);
function bigCard(g){
  const a = artOf(g, allGames.indexOf(g)), p = progress[g.GameID], fy = isAgeMatch(g);
  const scene = (window.CardArt && CardArt.has(g.GameID)) ? CardArt.html(g.GameID, a.c1, a.c2) : '';
  const b = document.createElement('button');
  b.className = 'game-card t-card' + (fy ? ' for-you' : '') + (favs.indexOf(g.GameID) >= 0 ? ' faved' : '');
  b.style.setProperty('--c1', a.c1); b.style.setProperty('--c2', a.c2);
  b.setAttribute('data-sound', 'none'); // UI.go plays the page-change sound
  let foot = '';
  if(p){
    let dots = '';
    for(let i = 0; i < (p.total || 5); i++) dots += '<i class="' + (i < p.cleared ? 'on' : '') + '"></i>';
    foot = '<div class="levels" aria-label="' + p.cleared + ' of ' + (p.total || 5) + ' levels cleared">' + dots +
      (p.stars ? '<span class="stars">⭐ ' + p.stars + '</span>' : '<span class="stars">' + (p.cleared ? p.cleared + '/' + (p.total || 5) : 'New!') + '</span>') + '</div>';
  } else {
    foot = '<div class="levels">' + UI.esc(g.SkillLevel || '') + '</div>';
  }
  b.innerHTML =
    '<div class="art' + (scene ? ' has-scene' : '') + '">' +   /* 🎴 p5: storybook scene, emoji only for games without one */
      (scene || a.deco.map((d, i) => '<span class="deco d' + (i + 1) + '">' + d + '</span>').join('') +
      '<span class="hero">' + UI.esc(g.Icon) + '</span>') +
      '<div class="art-top"><span class="help-btn" role="button" tabindex="0" data-help="' + UI.esc(g.GameID) + '" title="How to play" aria-label="How to play ' + UI.esc(nameOf(g)) + '"><i>❓</i><b>How to play</b></span><span class="card-acts">' + favHtml(g) + '</span></div>' +   /* 🎴 p5-3 */
      '<div class="art-bot">' + (fy ? '<span class="ribbon">⭐ Great for you!</span>' : '') + (isMulti(g) ? '<span class="multi-tag">👥 ' + (maxPlayers(g) > 2 ? '2–' + maxPlayers(g) : '2') + ' players</span>' : '') + bestTag(g) + '</div>' +
    '</div>' +
    '<div class="card-body">' +
      '<div class="title' + (nameOf(g).split(' ').some(w => w.length >= 10) ? ' longword' : '') + '">' + UI.esc(nameOf(g)) + '</div>' + (a.tag ? '<div class="tagline">' + UI.esc(a.tag) + '</div>' : '') + (storyHtml(g.GameID) ? '<div class="story">💡 ' + storyHtml(g.GameID) + '</div>' : '') + modeChips(g) +
      '<div class="focus">' + typeLine(g) + '</div>' +
      (g.Description ? '<div class="desc">' + UI.esc(g.Description) + '</div>' : '') +
      '<div class="foot' + (LINK_GAMES[g.GameID] ? ' has-link' : '') + '">' + foot + linkBtn(g) + '<span class="play t-btn">Play ▶</span></div>' +   /* 📡 lk-1b-g */
    '</div>';
  b.onclick = e => { if(e.target.closest('.link-btn')){ showLink(g); return; } const mc = e.target.closest('.mchip'); if(mc){ chipTap(mc, g); return; } if(e.target.closest('.fav-up')){ moveFavUp(g); return; } if(e.target.closest('.fav')){ toggleFav(g); return; } if(e.target.closest('.help-btn')){ showHelp(g); return; } openGame(g); };
  return b;
}
// ❓ How to play this game (UiKit GAME_HELP), with a Play button right in the card.
function showHelp(g){
  const page = UI.gameHelp(g.GameID, nameOf(g), g.Icon, isMulti(g)) || {icon: g.Icon, title: nameOf(g), body: g.Description || ''};
  if(isMulti(g) && page.lines) page.lines[page.lines.length - 1][1] = 'Also for **' + (maxPlayers(g) > 2 ? '2–' + maxPlayers(g) : '2') + ' players** on one screen.';
  if(NAME_STORY[g.GameID]) page.lines = [['💡', NAME_STORY[g.GameID]]].concat(page.lines || (page.body ? [['📝', page.body]] : [])), delete page.body;   // 🎴 p5 name story
  const mgl = modeGroupLines(g); if(mgl.length) page.lines = (page.lines || (page.body ? [['📝', page.body]] : [])).concat(mgl), delete page.body;   // 🗂️ mg-1 the game's mode groups
  UI.guide([page], {doneText: '▶ Play ' + nameOf(g)});
  const b = document.querySelector('.ui-guide .ug-next');
  const art = document.querySelector('.ui-guide .ug-art');   // 🎴 p5-2 the game's scene on top
  if(art && window.CardArt && CardArt.has(g.GameID)){ const ga = artOf(g, allGames.indexOf(g)); art.className = 'ug-art ca-art'; art.innerHTML = ''; if(CardArt.hasDemo && CardArt.play(art, g.GameID, ga.c1, ga.c2)) art.classList.add('has-demo'); else art.innerHTML = CardArt.html(g.GameID, ga.c1, ga.c2); }   /* p5-4: ▶ flip-book where there is one */
  if(b) b.onclick = () => { document.querySelector('.ui-guide .ug-x').click(); openGame(g); };
}
// 👋 Welcome to the Gameroom: once per player on this device, and any time from "❓ How it works".
function gameroomGuide(){
  const who = CURRENT_PLAYER || 'friend';
  return [
    {icon: '👋', title: 'Welcome to the Gameroom, ' + who + '!', body: 'Every game here grows a different super-power: **maths, words, logic, memory, music** and more. Here is how it works.'},
    {icon: '🎮', title: 'Big adventures', lines: [['🪜', '6 levels each: Basic → Junior → Intermediate → Hard → Extreme → **💀 Hardcore**.'], ['🔓', 'Clear a level to open the next one.'], ['⭐', 'Up to 3 stars per level — faster and cleaner = more stars.'], ['🎯', '"Great for you!" marks games that fit your age.']]},
    {icon: '🎲', title: 'Mini games', lines: [['⚡', 'Quick little games for younger players (colours, counting, sorting, coding).'], ['🪜', 'Pick a stage first — stars open the next stages.']]},
    {icon: '🔍', title: 'Find a game', lines: [['👥', '**2 players** / **3–4 players** = play together on one screen.'], ['➗', 'Type chips (Math, Words, Colours…) show one kind of game.'], ['❤️', 'Tap the heart to keep a favourite at the top.'], ['❓', 'Tap ❓ on a card to see how to play it.']]},
    {icon: '🏆', title: 'Earn cool stuff', lines: [['🏅', 'Badges for clearing levels.'], ['👕', 'New clothes, pets and items for your avatar (see 📖 Collection).'], ['🐾', 'Adventure miles unlock ride-ons.'], ['🏷️', 'Titles to wear on the Dashboard.']]}
  ];
}
function openGameroomGuide(){ UI.guide(gameroomGuide()); }

// ❤️ Favourites: tap the heart — the game moves to the top for this player (saved on this device at once, then on the server).
function favHtml(g){ if(!CURRENT_PLAYER) return ''; const on = favs.indexOf(g.GameID) >= 0;
  return '<span class="fav' + (on ? ' on' : '') + (favPending(g.GameID) ? ' wait' : '') + '" role="button" tabindex="0" data-fav="' + UI.esc(g.GameID) + '" aria-pressed="' + on + '" title="' + (on ? 'Remove from my favourites' : 'Add to my favourites') + '">' + (on ? '❤️' : '🤍') + '</span>' +
    (on && favAbove(g) ? '<span class="fav-up" role="button" tabindex="0" data-up="' + UI.esc(g.GameID) + '" title="Move up" aria-label="Move ' + UI.esc(nameOf(g)) + ' up one step">⬆️</span>' : ''); }
// ⬆️ gro-1: the favourite just above this one in the SAME section (big cards / mini games), or null
function favAbove(g){
  const mini = isMini(g), at = favs.indexOf(g.GameID);
  for(let i = at - 1; i >= 0; i--){ const o = allGames.find(x => x.GameID === favs[i]); if(o && isMini(o) === mini && matches(o)) return o; }
  return null;
}
function moveFavUp(g){
  const up = favAbove(g); if(!up) return;
  const a = favs.indexOf(g.GameID), b = favs.indexOf(up.GameID); favs[a] = up.GameID; favs[b] = g.GameID;
  UISound.play('pop');
  const c = readRoom(); if(c){ c.settings = c.settings || {}; c.settings['Fav_' + CURRENT_PLAYER] = JSON.stringify(favs); writeRoom(c); }
  render();
  const card = document.querySelector('.fav[data-fav="' + g.GameID + '"]'); const box = card && card.closest('.game-card, .mini');
  if(box){ box.classList.add('moved'); const u = box.querySelector('.fav-up'); if(u) u.focus({preventScroll: true}); }
  UI.toast('⬆️ ' + nameOf(g) + ' moved up');
  saveFavs();
}
// ❤️ gr-2 / gr-2b: every save goes at once with this device's id + its tap time; the server keeps only the newest from this
// device, so a late answer or a ✨ wd-1 resend of an OLD list can't win. ⏳ on the changed hearts until the server has them.
function saveFavs(){
  const at = Math.max(Date.now(), favSent + 1), list = favs.slice();
  FAV_LOCAL_AT = favSent = at; favWait++; favMarks();
  const after = () => { favWait = Math.max(0, favWait - 1); favMarks(); };
  google.script.run
    .withSuccessHandler(r => {
      if(at === favSent || (r && r.kept)) favOk = (r && Array.isArray(r.favorites)) ? r.favorites.slice() : list;
      after();
    })
    .withFailureHandler(() => {
      if(at === favSent && favOk){   // the server said no → back to what it has
        favs = favOk.slice();
        const c = readRoom(); if(c){ c.settings = c.settings || {}; c.settings['Fav_' + CURRENT_PLAYER] = JSON.stringify(favs); writeRoom(c); }
        if(filter === 'fav' && !favs.length) filter = 'all';
        renderFilters(); render();
      }
      after();
      if(at === favSent) UI.toast('❤️ Not saved — please tap again', 'err');
    })
    .saveFavorites(CURRENT_PLAYER, list, {dev: FAV_DEV, at: at});
}
function toggleFav(g){
  const id = g.GameID, at = favs.indexOf(id), add = at < 0;
  if(add) favs.push(id); else favs.splice(at, 1);
  UISound.play(add ? 'success' : 'pop');
  const c = readRoom(); if(c){ c.settings = c.settings || {}; c.settings['Fav_' + CURRENT_PLAYER] = JSON.stringify(favs); writeRoom(c); }
  if(filter === 'fav' && !favs.length) filter = 'all';
  renderFilters(); render();
  const el = document.querySelector('.fav[data-fav="' + id + '"]'); if(el){ el.classList.add('pop'); if(add) el.focus({preventScroll: true}); }
  UI.toast(add ? '❤️ ' + nameOf(g) + ' is a favourite — it moves to the top' : '🤍 ' + nameOf(g) + ' removed from favourites');
  saveFavs();
}
document.addEventListener('keydown', e => { const h = e.target && e.target.closest && e.target.closest('.help-btn'); if(h && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); e.stopPropagation(); const g = allGames.find(x => x.GameID === h.dataset.help); if(g) showHelp(g); } }, true);
document.addEventListener('keydown', e => { const u = e.target && e.target.closest && e.target.closest('.fav-up'); if(u && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); e.stopPropagation(); const g = allGames.find(x => x.GameID === u.dataset.up); if(g) moveFavUp(g); } }, true);   // ⬆️ gro-1
document.addEventListener('keydown', e => { const f = e.target && e.target.closest && e.target.closest('.fav'); if(f && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); e.stopPropagation(); const g = allGames.find(x => x.GameID === f.dataset.fav); if(g) toggleFav(g); } }, true);

function miniTile(g){
  const a = artOf(g, allGames.indexOf(g)), fy = isAgeMatch(g);
  const b = document.createElement('button');
  b.className = 'mini' + (favs.indexOf(g.GameID) >= 0 ? ' faved' : '');
  b.style.setProperty('--c1', a.c1); b.style.setProperty('--c2', a.c2);
  b.setAttribute('data-sound', 'none');
  b.innerHTML = '<span class="help-btn" role="button" tabindex="0" data-help="' + UI.esc(g.GameID) + '" title="How to play" aria-label="How to play ' + UI.esc(nameOf(g)) + '"><i>❓</i></span>' + (fy ? '<span class="ribbon">⭐ For you</span>' : '') +   /* 🎴 p5-8 ❓ on minis */
    ((window.CardArt && CardArt.has(g.GameID)) ? '<span class="mi-art">' + CardArt.html(g.GameID, a.c1, a.c2) + '</span>' : '<span class="mi">' + UI.esc(g.Icon) + '</span>') + '<span class="mn">' + UI.esc(nameOf(g)) + '</span>' +
    '<span class="mf">' + UI.esc(a.tag || g.STEAMFocus || '') + '</span>' + bestTag(g) + '<span class="card-acts">' + favHtml(g) + '</span>';
  if(NAME_STORY[g.GameID]) b.title = NAME_STORY[g.GameID].replace(/\*\*/g, '');   // 🎴 p5 name story on hover
  b.onclick = e => { if(e.target.closest('.help-btn')){ showHelp(g); return; } if(e.target.closest('.fav-up')){ moveFavUp(g); return; } if(e.target.closest('.fav')){ toggleFav(g); return; } openGame(g); };
  return b;
}

/* ================= SCREEN TIME TIMER + LOCK ================= */
let screenTimeLockEnabled = true; // overwritten once Settings loads; fail-open only for this one tick
let lockTimerHandle = null;
let enteredLockPin = '';

function initScreenTime(settings){
  if(settings) screenTimeLockEnabled = !(settings.ScreenTimeLockEnabled === 'FALSE' || settings.ScreenTimeLockEnabled === false);
  startTimerLoop();
}

function startTimerLoop(){
  if(!SESSION_START || !DURATION_MIN || !screenTimeLockEnabled){
    return; // no session carried in, or the parent turned the feature off
  }
  const bar = document.getElementById('timer-bar');
  bar.classList.remove('hidden');
  tickTimer();
  lockTimerHandle = setInterval(tickTimer, 1000);
}

function tickTimer(){
  const totalMs = DURATION_MIN * 60 * 1000;
  const elapsedMs = Date.now() - SESSION_START;
  const remainingMs = totalMs - elapsedMs;

  if(remainingMs <= 0){
    clearInterval(lockTimerHandle);
    document.getElementById('timer-text').textContent = "0:00 left";
    showLock();
    return;
  }

  const totalSec = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = String(totalSec % 60).padStart(2, '0');
  document.getElementById('timer-text').textContent = mm + ':' + ss + ' left';
  document.getElementById('timer-bar').classList.toggle('warning', totalSec <= 120);
}

function showLock(){
  document.getElementById('lock-overlay').classList.add('showing');
  buildLockPinPad();
}
// Grown-ups can type the PIN on a keyboard / number pad too.
UI.pinKeyboard({
  isActive: () => document.getElementById('lock-overlay').classList.contains('showing'),
  padEl: () => document.getElementById('lock-pin-pad'),
  onDigit: d => pressLockDigit(d),
  onBack: () => { enteredLockPin = enteredLockPin.slice(0,-1); renderLockDots(); },
  onClear: () => { enteredLockPin = ''; renderLockDots(); },
  onEnter: () => { if(enteredLockPin.length >= 4) tryLockUnlock(); }
});

function buildLockPinPad(){
  const pad = document.getElementById('lock-pin-pad');
  pad.innerHTML = '';
  ['1','2','3','4','5','6','7','8','9'].forEach(n=>{
    const b = document.createElement('button');
    b.className = 'lock-pin-key';
    b.textContent = n;
    b.onclick = ()=>pressLockDigit(n);
    pad.appendChild(b);
  });
  const clearBtn = document.createElement('button');
  clearBtn.className = 'lock-pin-key wide';
  clearBtn.textContent = 'Clear';
  clearBtn.onclick = ()=>{ enteredLockPin=''; renderLockDots(); };
  pad.appendChild(clearBtn);

  const zeroBtn = document.createElement('button');
  zeroBtn.className = 'lock-pin-key';
  zeroBtn.textContent = '0';
  zeroBtn.onclick = ()=>pressLockDigit('0');
  pad.appendChild(zeroBtn);

  const backBtn = document.createElement('button');
  backBtn.className = 'lock-pin-key wide';
  backBtn.textContent = '⌫';
  backBtn.onclick = ()=>{ enteredLockPin = enteredLockPin.slice(0,-1); renderLockDots(); };
  pad.appendChild(backBtn);

  renderLockDots();
}
function pressLockDigit(d){
  if(enteredLockPin.length>=8) return;
  enteredLockPin += d;
  renderLockDots();
  if(enteredLockPin.length>=4) tryLockUnlock();
}
function renderLockDots(){
  const box = document.getElementById('lock-pin-dots');
  box.innerHTML = '';
  const shown = Math.max(enteredLockPin.length, 4);
  for(let i=0;i<shown;i++){
    const d = document.createElement('div');
    d.className = 'lock-pin-dot'+(i<enteredLockPin.length?' filled':'');
    box.appendChild(d);
  }
}
function tryLockUnlock(){
  const errBox = document.getElementById('lock-pin-error');
  errBox.innerHTML = '<span class="ui-spin">🔑</span> Checking…';
  google.script.run.withSuccessHandler(ok=>{
    if(ok){
      // Unlocking ends this play session — a grown-up decides whether to
      // start a fresh one from the Dashboard. The redirect happens after a
      // server check (not inside the tap), which iOS Home Screen apps can
      // block, so a big button is shown as well: a fresh tap always works.
      UISound.play('unlock');
      errBox.textContent = '';
      const pad = document.getElementById('lock-pin-pad');
      pad.innerHTML = '';
      const go = document.createElement('button');
      go.className = 'ui-modal-btns-go';
      go.textContent = '🏠 Back to the Dashboard';
      go.style.cssText = "grid-column:1/-1;border:none;border-radius:16px;padding:14px 18px;font-family:var(--font-display,'Fredoka',sans-serif);font-weight:700;font-size:1rem;color:#fff;cursor:pointer;background:linear-gradient(135deg,var(--terracotta),var(--mustard));box-shadow:0 5px 0 rgba(0,0,0,0.14);";
      go.setAttribute('data-sound', 'none');
      go.onclick = () => UI.go(WEBAPP_URL + '?page=home', 'unlock');
      pad.appendChild(go);
      UI.go(WEBAPP_URL + '?page=home', 'unlock');
    } else if(enteredLockPin.length>=8){
      UISound.play('error');
      errBox.textContent = 'Wrong PIN, try again.';
      enteredLockPin=''; renderLockDots();
    } else {
      errBox.textContent = '';
    }
  }).withFailureHandler(()=>{
    errBox.textContent = 'Could not check the PIN — try again.';
  }).verifyAdminPin(enteredLockPin);
}

loadGameroom();
