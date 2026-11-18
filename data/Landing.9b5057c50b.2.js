
window.SP_PAGE = SP_TV[0];   // page name for the 💬 Tell us button
const WEBAPP_URL = SP_TV[1];
const AGE_OPTIONS = ['4-5','6-7','8-9','10+'];
// Paint in the last look used on this device straight away (no flash).
UI.applyTheme(UI.cachedTheme(''));

const NAV_KIND = {home:'home', gameroom:'rooms', achievements:'trophy', setup:'admin', room:'room', collection:'collection', station:'station'};   // 📺 st-1: + station
try{ if(UI.KINDS && !UI.KINDS.station) UI.KINDS.station = ['📺', 'Opening the Game Station', 'bob']; }catch(e){}   // 📺 st-1: the loader kind (LinkKit adds the same on pages that load it)
// My Room: opens the Family Room page straight inside the picked player's own room.
function goMyRoom(){
  if(!selectedPlayer){ UI.toast('👆 Pick a player first — then open their room', 'info'); return; }
  UI.go(WEBAPP_URL + '?page=room&game=my&player=' + encodeURIComponent(selectedPlayer), 'myroom');
}
function goNav(page){
  UI.go(WEBAPP_URL + '?page=' + page + (selectedPlayer ? '&player=' + encodeURIComponent(selectedPlayer) : ''), NAV_KIND[page] || 'nav');
}

let allPlayers = [];
let selectedPlayer = null;
let selectedAge = null;
let CACHED_SETTINGS = null; // reused by letsPlay() so it can navigate synchronously

/* ---------- LOOKS ---------- */
function themeMeta(key){ return UI.THEMES.find(t => t.key === key) || UI.THEMES[0]; }
// The Dashboard shows the selected player's look, or the family default.
function currentLook(){ return UI.themeFor(CACHED_SETTINGS, selectedPlayer); }
function showLook(){
  const key = UI.applyTheme(currentLook());
  UI.rememberTheme(selectedPlayer || '', key);
  if(selectedPlayer) UI.rememberTheme('', key); // next visit paints in the last player's look
  const m = themeMeta(key);
  document.getElementById('look-ico').textContent = m.icon;
  document.getElementById('look-name').textContent = selectedPlayer ? m.name : 'Pick a player first';
}
let lookChoice = null;
function openLook(){
  if(!selectedPlayer){ UISound.play('error'); UI.toast('Tap a player first, then pick their look'); return; }
  lookChoice = currentLook();
  UI.THEMES.forEach(t => UI.loadThemeFonts(t.key)); // so every preview shows its own letters
  document.getElementById('look-title').textContent = 'Pick ' + selectedPlayer + "'s look";
  renderLookGrid();
  document.getElementById('look-sheet').classList.remove('hidden');
}
function renderLookGrid(){
  const box = document.getElementById('look-grid'); box.innerHTML = '';
  UI.THEMES.forEach(t => {
    const b = document.createElement('button');
    b.className = 'look-tile' + (lookChoice === t.key ? ' on' : '');
    b.setAttribute('data-theme', t.key);
    b.setAttribute('data-sound', 'pop');
    b.innerHTML =
      '<div class="pv"><div class="pv-card"><b>Aa</b><span class="pv-btn">Play ▶</span></div>' +
      '<div class="pv-dots"><i style="background:var(--terracotta)"></i><i style="background:var(--mustard)"></i><i style="background:var(--sage)"></i><i style="background:var(--dusty-blue)"></i></div></div>' +
      '<div class="look-meta"><span class="ic">' + t.icon + '</span><span><b>' + t.name + '</b><small>' + t.tag + '</small></span></div>';
    b.onclick = () => { lookChoice = t.key; UI.applyTheme(t.key); renderLookGrid(); };
    box.appendChild(b);
  });
}
function closeLook(revert){
  document.getElementById('look-sheet').classList.add('hidden');
  if(revert) showLook();
}
function saveLook(btn){
  const key = lookChoice, who = selectedPlayer;
  withPin(who, 'Only ' + who + ' can change ' + who + "'s look.").then(pin => { if(!pin) return;
  UI.call('savePlayerTheme', [who, key, pin], {btn: btn, kind: 'look', text: 'Saving look'}).then(() => {
    CACHED_SETTINGS = Object.assign({}, CACHED_SETTINGS, {['Theme_' + who]: key});
    closeLook(false); showLook(); renderPlayers();
    UISound.play('success');
    UI.toast(who + "'s look: " + themeMeta(key).name + ' ' + themeMeta(key).icon);
  }).catch(e => pinFailed(who, e)); });
}
document.addEventListener('keydown', e => { if(e.key === 'Escape' && !document.getElementById('look-sheet').classList.contains('hidden')) closeLook(true); });

/* ---------- PLAYER PIN for look + title (stays unlocked for the day on this device) ---------- */
function hasPin(name){ return !!CACHED_SETTINGS['PlayerPIN_' + name]; }
function withPin(name, why){ return UI.playerPin({name, hasPin: hasPin(name), why}).then(pin => { if(pin && !hasPin(name)) CACHED_SETTINGS = Object.assign({}, CACHED_SETTINGS, {['PlayerPIN_' + name]: 'set'}); return pin; }); }
function pinFailed(name, e){ if(/PIN/.test(String(e && e.message))) UI.forgetDayPin(name); }

/* ---------- TITLES (earned in the games, one shown under each name) ---------- */
let TITLES = {players: {}, meta: []}, titleChoice = '';
function titleOf(name){ const p = TITLES.players[name]; if(!p || !p.chosen) return null; return TITLES.meta.find(t => t.id === p.chosen) || null; }
function showTitle(){
  const t = selectedPlayer ? titleOf(selectedPlayer) : null, n = selectedPlayer && TITLES.players[selectedPlayer] ? TITLES.players[selectedPlayer].unlocked.length : 0;
  document.getElementById('title-ico').textContent = t ? t.icon : '🏷️';
  document.getElementById('title-name').textContent = !selectedPlayer ? 'Pick a player first' : t ? t.name : n + ' unlocked';
}
function openTitles(){
  if(!selectedPlayer){ UISound.play('error'); UI.toast('Tap a player first, then pick their title'); return; }
  const p = TITLES.players[selectedPlayer] || {chosen: '', unlocked: ['newcomer']};
  titleChoice = p.chosen || '';
  document.getElementById('title-title').textContent = 'Pick ' + selectedPlayer + "'s title (" + p.unlocked.length + ' of ' + TITLES.meta.length + ' earned)';
  renderTitleGrid();
  document.getElementById('title-sheet').classList.remove('hidden');
}
function renderTitleGrid(){
  const p = TITLES.players[selectedPlayer] || {unlocked: ['newcomer']}, box = document.getElementById('title-grid'); box.innerHTML = '';
  const none = document.createElement('button'); none.className = 'title-tile' + (titleChoice === '' ? ' on' : ''); none.setAttribute('data-sound', 'pop');
  none.innerHTML = '<span class="ic">🚫</span><span><b>No title</b><small>Show just my name</small></span>'; none.onclick = () => { titleChoice = ''; renderTitleGrid(); }; box.appendChild(none);
  const order = TITLES.meta.slice().sort((a, b) => (p.unlocked.indexOf(b.id) !== -1) - (p.unlocked.indexOf(a.id) !== -1));
  order.forEach(t => {
    const open = p.unlocked.indexOf(t.id) !== -1, b = document.createElement('button');
    b.className = 'title-tile' + (open ? '' : ' locked') + (titleChoice === t.id ? ' on' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="ic">' + t.icon + '</span><span><b>' + UI.esc(t.name) + '</b><small>' + (open ? 'Earned ✓' : UI.esc(t.hint)) + '</small></span>';
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast('🔒 ' + t.hint); return; } titleChoice = t.id; renderTitleGrid(); };
    box.appendChild(b);
  });
}
function closeTitles(){ document.getElementById('title-sheet').classList.add('hidden'); }
function saveTitle(btn){
  const who = selectedPlayer, id = titleChoice;
  withPin(who, 'Only ' + who + ' can change ' + who + "'s title.").then(pin => { if(!pin) return;
  UI.call('savePlayerTitle', [who, id, pin], {btn: btn, kind: 'save', text: 'Saving title'}).then(() => {
    (TITLES.players[who] = TITLES.players[who] || {unlocked: []}).chosen = id;
    closeTitles(); showTitle(); renderPlayers(); UISound.play('success');
    const t = titleOf(who); UI.toast(t ? who + ' is now ' + t.icon + ' ' + t.name + '!' : who + ' shows no title');
  }).catch(e => pinFailed(who, e)); });
}
document.addEventListener('keydown', e => { if(e.key === 'Escape' && !document.getElementById('title-sheet').classList.contains('hidden')) closeTitles(); });

function onSettings(settings){
  CACHED_SETTINGS = settings || {};
  UISound.applySettings(CACHED_SETTINGS);
  showLook();
}

// Who's playing: each player's own avatar (head + shoulders) inside the coloured circle.
function avatarOf(name){ let a = null; try { a = JSON.parse(CACHED_SETTINGS['Avatar_' + name] || 'null'); } catch(e){} return a ? fixAv(a) : defaultAvatar(name); }
// Who's playing tiles: the WHOLE avatar (pets, rides and held things fit thanks to drawPreviewCanvas).
function paintBody(cv, name){
  if(!cv) return;
  try { drawPreviewCanvas(cv, avatarOf(name), {name: '', t: 1.2, pose: {eyes: 'happy'}}); }
  catch(e){ paintFace(cv, name); }
}
// as-2 🎭 the 👋 tiles come alive: every few seconds one player does an act (their own 🎭 signature act or a shared idle / happy one)
let TILE_ACT_T = 0, TILE_ACT_RAF = 0;
function startTileActs(){
  clearTimeout(TILE_ACT_T); cancelAnimationFrame(TILE_ACT_RAF);
  if(!window.Acting || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  const next = () => { TILE_ACT_T = setTimeout(playTileAct, 3800 + Math.random() * 2600); };
  const playTileAct = () => {
    const tiles = Array.from(document.querySelectorAll('.player-tile')).filter(t => t.querySelector('.avatar canvas') && t.offsetParent);
    if(document.hidden || !tiles.length){ next(); return; }
    const tile = tiles[Math.floor(Math.random() * tiles.length)], cv = tile.querySelector('.avatar canvas'), name = tile.querySelector('.pname').textContent;
    const av = avatarOf(name), k = Math.random() < 0.45 ? Acting.sig(av) : Acting.pick(Math.random() < 0.5 ? 'happy' : 'idle', {who: name}), who = {name: '', av, dir: 1};
    let f; try { f = Acting.fit(who, [k], cv.width, cv.height, {ride: 'keep', pad: 6}); } catch(e){ next(); return; }
    const g = cv.getContext('2d'), t0 = performance.now();
    const step = now => { const t = (now - t0) / 1000; if(!cv.isConnected){ next(); return; }
      if(t > 2.6){ paintBody(cv, name); next(); return; }
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); try { Acting.draw(g, who, f.x, f.y, f.k, k, {t, ride: 'keep'}); } catch(e){ paintBody(cv, name); next(); return; }
      TILE_ACT_RAF = requestAnimationFrame(step); };
    TILE_ACT_RAF = requestAnimationFrame(step);
  };
  next();
}
function paintFace(cv, name){
  if(!cv) return; const g = cv.getContext('2d'), w = cv.width, k = w / 62;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, w);
  try { drawAvatar(g, {name: '', av: avatarOf(name), dir: 1, walkT: 0}, w / 2, w + 38 * k, k, {t: 1, still: true, noShadow: true, pose: {eyes: 'happy'}}); } catch(e){ g.fillStyle = '#fff'; g.font = '700 ' + (w * 0.45) + "px 'Fredoka',sans-serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((name || '?').charAt(0).toUpperCase(), w / 2, w / 2); }
}

/* ---------- 🚀 WELCOME SHOW (ws-1): WelcomeShow.html runs the show, the page only reports real loading steps ---------- */
function startWelcomeScreen(){ try { WelcomeShow.start(); } catch(e){ const w = document.getElementById('welcome-loading'); if(w) w.classList.add('hidden'); } }
function markWelcomeLoaded(){ try { WelcomeShow.ready(); } catch(e){ const w = document.getElementById('welcome-loading'); if(w) w.classList.add('hidden'); } }
function welcomeStep(k){ try { WelcomeShow.step(k); } catch(e){} }
(function playBarHeight(){   // 📏 ws-5: distance from the screen bottom to the top of the Let's Play bar → --play-h
  const set = () => { const c = document.querySelector('.play-cta'); if(!c) return; const r = c.getBoundingClientRect(); if(r.height) document.documentElement.style.setProperty('--play-h', Math.round(innerHeight - r.top) + 'px'); };
  addEventListener('resize', set); addEventListener('load', set); document.addEventListener('DOMContentLoaded', set);
  try { new ResizeObserver(set).observe(document.documentElement); } catch(e){}
  // the label ("▶ Let's Play, Aowu!") shrinks only when it doesn't fit (long names, wide look fonts on phones)
  let fitting = false;
  const fit = () => { const btn = document.getElementById('play-btn'); if(!btn || fitting) return; fitting = true;
    btn.style.fontSize = ''; let fs = parseFloat(getComputedStyle(btn).fontSize), n = 0;
    while(btn.scrollWidth > btn.clientWidth + 1 && fs > 12 && n++ < 30){ fs -= 1; btn.style.fontSize = fs + 'px'; }
    fitting = false; set(); };
  const watch = () => { const btn = document.getElementById('play-btn'); if(!btn) return;
    new MutationObserver(fit).observe(btn, {childList: true, characterData: true, subtree: true});
    new MutationObserver(() => setTimeout(fit, 60)).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
    addEventListener('resize', fit); if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit); fit(); };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
/* ---------- 🎮 ap-1 APP LOGO in the header (UiKit UI.appLogo + GameLogos 'app'; placement: Claude outputs/logos/app/app-logo-placement.png) ---------- */
(function(){
  let last = '';
  function place(force){
    if(!UI.appLogo || !UI.appLogo.has()) return;
    const head = document.querySelector('.dash-head'), brand = head && head.querySelector('.brand'), btns = head && head.querySelector('.head-btns'), host = document.getElementById('app-logo'), lg = document.getElementById('brand-logo');
    if(!brand || !host || !lg) return;
    const W = innerWidth, H = innerHeight, avail = head.clientWidth - (btns ? btns.offsetWidth : 0) - 16;
    const want = H <= 560 ? 170 : (Math.min(W, H) >= 700 ? 280 : 200), px = Math.floor(Math.min(want, avail));
    const sig = px >= 150 ? 'w' + px : 'b' + (lg.offsetWidth || 44); if(sig === last && !force) return; last = sig;
    if(px >= 150){   // 🏠 wide logo in place of 🧪 + the words
      if(lg.dataset.apKind){ delete lg.dataset.apKind; lg.style.width = lg.style.height = ''; lg.textContent = '🧪'; }
      brand.classList.remove('has-appb'); brand.classList.add('has-app'); UI.appLogo.mount(host, 'wide', px);
    } else {         // too narrow: the round badge in the 🧪 tile, text title kept
      brand.classList.remove('has-app'); brand.classList.add('has-appb'); delete host.dataset.apKind; host.innerHTML = '';
      lg.style.width = lg.style.height = ''; UI.appLogo.mount(lg, 'badge', lg.offsetWidth || 44);
    }
  }
  window.placeAppLogo = place;
  let rq = 0; const later = () => { cancelAnimationFrame(rq); rq = requestAnimationFrame(() => place()); };
  addEventListener('resize', later); addEventListener('load', later);
  try { new ResizeObserver(later).observe(document.querySelector('.dash-head .head-btns')); } catch(e){}
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => place()); else place();
})();
window.miniShowAvatar = () => (selectedPlayer ? avatarOf(selectedPlayer) : null);   // ⚡ ws-3 mini show: your avatar runs to the Gameroom

/* ---------- BOOT: one server call + instant paint from the last visit ---------- */
const DASH_CACHE_KEY = 'sp_dash_v2';
let MAIL = {};   // 📬 unopened gifts per player (from the news) → badge on the player tile
function readDashCache(){ try{ return JSON.parse(localStorage.getItem(DASH_CACHE_KEY) || 'null'); }catch(e){ return null; } }
function writeDashCache(d){ try{ localStorage.setItem(DASH_CACHE_KEY, JSON.stringify(d)); }catch(e){} }
function applyDashboard(d){
  if(!d) return;
  TITLES = d.titles || {players: {}, meta: []};
  onSettings(d.settings);
  MAIL = {}; (d.news || []).forEach(n => { if(n.kind === 'mail') MAIL[n.player] = n.count; });
  SEEN = d.seen || {};
  MODES = d.modes || null;   // ✨ modes-2
  LAST_NEWS = d.news || [];
  onPlayers(d.players || []);
  welcomeStep('players'); try { WelcomeShow.cast(allPlayers, avatarOf, CACHED_SETTINGS); } catch(e){}   // 🚀 ws-1: family parade (last player first)
  renderPodium(d.leaderboard || []);
  renderMazeRecord(d.mazeRecords || []);
  renderRecent(d.recent || []);
  renderNews(d.news || []);
  welcomeStep('news');
  renderEyes(d.eyes);
  renderWisDaily(d.wisDaily);
  welcomeStep('looks');
}
// 👀🧠 Eyes Brain Riot: today's family number (same 8 digits for everyone, one try) + 🏅 brain level = longest number remembered
function renderEyes(e){
  const box = document.getElementById('ebr-daily'); if(!box) return; if(!e || !e.daily){ box.classList.add('hidden'); return; } box.classList.remove('hidden');
  const b = e.daily.board || [], br = e.brain || {}, names = allPlayers.map(p => p.Name).filter(n => br[n] > 0).sort((a, c) => br[c] - br[a]);
  box.innerHTML = '<div class="eh"><b>👀🧠 Today\'s family number</b><button data-sound="pop" onclick="playEyesDaily()">🎯 Play</button></div>' +
    '<div class="eb">' + (b.length ? b.slice(0, 4).map((r, i) => '<span>' + (['🥇', '🥈', '🥉'][i] || '🎖️') + ' ' + UI.esc(r.name) + ' ' + Number(r.score).toLocaleString() + '</span>').join('') : '<span>Nobody yet today — be first!</span>') + '</div>' +
    (names.length ? '<div class="eb brain">' + names.slice(0, 6).map(n => '<span>🏅 ' + UI.esc(n) + ' · Brain level ' + br[n] + '</span>').join('') + '</div>' : '');
}
// 🃏 WisDeck 📅 daily deck: 5 questions, the same for the whole family today (one try each)
function renderWisDaily(w){
  const box = document.getElementById('wd-daily'); if(!box) return; if(!w || !w.date){ box.classList.add('hidden'); return; } box.classList.remove('hidden');
  const b = w.board || [];
  box.innerHTML = '<div class="eh"><b>🃏📅 Today\'s WisDeck daily deck</b><button data-sound="pop" onclick="playWisDaily()">📅 Play</button></div>' +
    '<div class="eb">' + (b.length ? b.slice(0, 4).map((r, i) => '<span>' + (['🥇', '🥈', '🥉'][i] || '🎖️') + ' ' + UI.esc(r.name) + ' ' + Number(r.score).toLocaleString() + ' · ' + r.right + '/5</span>').join('') : '<span>Nobody yet today — 5 questions, be first!</span>') + '</div>';
}
function playWisDaily(){
  if(!selectedPlayer){ UISound.play('error'); UI.toast('👆 Pick a player first'); return; }
  const p = allPlayers.find(x => x.Name === selectedPlayer);
  UI.go(WEBAPP_URL + '?page=wisdeck&game=daily&player=' + encodeURIComponent(selectedPlayer) + '&sessionStart=' + Date.now() + '&durationMin=' + screenTimeMinutesForAge(p ? p.Age : ''), 'wisdeck');
}
function playEyesDaily(){
  if(!selectedPlayer){ UISound.play('error'); UI.toast('👆 Pick a player first'); return; }
  const p = allPlayers.find(x => x.Name === selectedPlayer);
  UI.go(WEBAPP_URL + '?page=eyesbrain&game=daily&player=' + encodeURIComponent(selectedPlayer) + '&sessionStart=' + Date.now() + '&durationMin=' + screenTimeMinutesForAge(p ? p.Age : ''), 'eyes-brain');
}
// 👋 Dashboard guide: what is what and how it all works (first visit on this device, then the ❓ Guide button).
function dashGuide(){
  return [
    {icon: '🧪', title: 'Welcome to STEAM Playground!', body: 'A place to play games that train **Science, Tech, Engineering, Art and Math** — and to build your own avatar, room and family world. Swipe or tap Next for a quick tour.'},
    {icon: '👋', title: "Who's playing?", lines: [['👆', 'Tap your face to pick yourself, then **Let\'s Play**.'], ['➕', '**Add Player**: type a name and pick an age — games are matched to the age.'], ['🎨', '**My look** changes the colours of every page; **My title** shows a title you earned.'], ['🔑', 'Your avatar and room can have a PIN so nobody else changes them.']]},
    {icon: '🕹️', title: 'Gameroom', lines: [['🎮', 'Big adventures with 6 levels each, plus mini games for little ones.'], ['👥', 'Some games are for 2 or 3–4 players on one screen.'], ['❓', 'Every game card has a ❓ that shows how to play.']]},
    {icon: '🏡', title: 'Family Room', lines: [['🚶', 'Walk around a big world with the whole family — tap the floor to walk.'], ['💃', 'Tap someone to make them wave or dance; there is a concert stage too.'], ['🌍', 'Pick different worlds from the 🌍 Rooms menu.']]},
    {icon: '🛋️', title: 'My Room', lines: [['🎨', '**Decorate**: move, turn and place your furniture.'], ['🔨', '**Furniture craft**: design new things, paint pictures, show them in your 🏛️ showroom.'], ['📬', 'The red **mailbox** on the wall keeps gifts from your family — tap it to open them.'], ['💝', 'Visit someone\'s room to send them a gift.']]},
    {icon: '📖', title: 'Collection + wardrobe', lines: [['👕', 'Clothes, costumes, pets, wings, laser swords and ride-ons — all unlocked by playing.'], ['📖', 'The Collection shows every item and how to get it.'], ['🐾', 'Adventure miles (from every level you clear) unlock ride-on animals.']]},
    {icon: '🎁', title: 'Every day', lines: [['🎁', '**Daily treasures**: finish today\'s 3 goals for a surprise.'], ['📣', '**What\'s new**: new games, records, close races, mail and 🎂 birthdays.'], ['🏆', '**Achievements**: badges, records and the family leaderboard.']]},
    {icon: '👑', title: 'For grown-ups', lines: [['⏱', 'Screen time per age is set in **Admin** (the grown-up PIN opens it).'], ['🔑', 'Admin can reset a player\'s PIN, hide players and add birthdays.'], ['💬', '**Tell us!** (bottom corner) sends a bug report or an idea.']]}
  ];
}
function openDashGuide(){ UI.guide(dashGuide()); }
function loadDashboard(){
  const cached = readDashCache();
  WelcomeShow.whenDone().then(() => setTimeout(() => UI.guideOnce('dashboard', dashGuide()), 500));
  WelcomeShow.whenDone().then(() => { try{ if(UI.homeMusic) UI.homeMusic(); }catch(e){} });   // ☕ an-5: cozy lofi after the show   // 🚀 ws-1: never on top of the show
  if(cached){ applyDashboard(cached); markWelcomeLoaded(); }
  welcomeStep('ask');
  google.script.run
    .withSuccessHandler(d => { writeDashCache(d); applyDashboard(d); markWelcomeLoaded(); })
    .withFailureHandler(() => {
      if(!cached){ onSettings({}); onPlayers([]); renderPodium([]); renderRecent([]); try { WelcomeShow.cast([]); } catch(e){} }
      markWelcomeLoaded();
      UI.toast('Could not reach the playground data — showing what we have', 'err');
    })
    .getDashboardData();
}
function refreshDashboard(){
  google.script.run.withSuccessHandler(d => { writeDashCache(d); applyDashboard(d); }).getDashboardData();
}

/* ---------- PLAYERS ---------- */
// Each player gets their own avatar colours from their look.
const LOOK_AVATAR = {classic:['#C97B5D','#D9A94D'], racing:['#E10600','#15161A'], princess:['#E0679F','#C79BEF'], architect:['#1D4F8F','#5B8FD6'],
  hologram:['#1BB8D6','#7A5CFF'], retro:['#FF3E8A','#FFB400'], cyberpunk:['#FF2A6D','#7B2CFF']};
// 👋 Most recent player first: server `seen` (Gameroom opened / last score) or a pick on this device, whichever is newer.
// Sorted only when data arrives, so tiles never jump while you tap them.
let SEEN = {};
function seenAt(name){ let t = Number(SEEN[name]) || 0; try { t = Math.max(t, Number(localStorage.getItem('sp_seen:' + name) || 0)); } catch(e){} return t; }
function onPlayers(players){
  allPlayers = players.filter(p => p.Active === true || p.Active === 'TRUE' || p.Active === '' || p.Active === undefined);
  allPlayers = allPlayers.map((p, i) => ({p, i, t: seenAt(p.Name)})).sort((a, b) => (b.t - a.t) || (a.i - b.i)).map(x => x.p);
  if(selectedPlayer && !allPlayers.some(p => p.Name === selectedPlayer)) selectedPlayer = null;
  renderPlayers(); updatePlayCta();
}
function renderPlayers(){
  const grid = document.getElementById('player-grid');
  grid.innerHTML = '';
  document.getElementById('player-count').textContent = allPlayers.length ? allPlayers.length + ' player' + (allPlayers.length === 1 ? '' : 's') : '';
  allPlayers.forEach(p => {
    const look = UI.themeFor(CACHED_SETTINGS, p.Name), cols = LOOK_AVATAR[look] || LOOK_AVATAR.classic;
    const tile = document.createElement('button');
    tile.className = 'player-tile t-chip' + (selectedPlayer === p.Name ? ' selected' : '');
    tile.setAttribute('data-sound', 'pop');
    tile.style.setProperty('--a1', cols[0]); tile.style.setProperty('--a2', cols[1]);
    tile.innerHTML = '<span class="check">✓</span><span class="pl-look" title="' + UI.esc(themeMeta(look).name) + '">' + themeMeta(look).icon + '</span>' + (MAIL[p.Name] ? '<span class="pl-mail" title="Gifts waiting in the mailbox">📬<b>' + MAIL[p.Name] + '</b></span>' : '') +
      '<div class="avatar"><canvas width="140" height="176" aria-hidden="true"></canvas></div>' +
      '<div class="pname">' + UI.esc(p.Name) + '</div>' + (titleOf(p.Name) ? '<div class="ptitle">' + titleOf(p.Name).icon + ' ' + UI.esc(titleOf(p.Name).name) + '</div>' : '<div class="page">' + UI.esc(p.Age ? p.Age + ' yrs' : '') + '</div>');
    tile.onclick = () => { selectedPlayer = p.Name; try { localStorage.setItem('sp_seen:' + p.Name, String(Date.now())); } catch(e){} showLook(); showTitle(); renderPlayers(); updatePlayCta(); };
    grid.appendChild(tile); paintBody(tile.querySelector('.avatar canvas'), p.Name);
  });
  startTileActs();   // as-2 🎭
  const add = document.createElement('button');
  add.className = 'add-player-tile t-chip';
  add.setAttribute('data-sound', 'pop');
  add.innerHTML = '<div class="plus">＋</div><span>Add Player</span>';
  add.onclick = showAddForm;
  grid.appendChild(add);
}
function showAddForm(){
  document.getElementById('add-form').classList.remove('hidden');
  document.getElementById('add-error').textContent = '';
  selectedAge = null;
  const ageRow = document.getElementById('age-row'); ageRow.innerHTML = '';
  AGE_OPTIONS.forEach(a => {
    const chip = document.createElement('button');
    chip.className = 'age-chip t-chip'; chip.textContent = a + ' yrs'; chip.setAttribute('data-sound', 'pop');
    chip.onclick = () => { selectedAge = a; Array.from(ageRow.children).forEach(c => c.classList.remove('active')); chip.classList.add('active'); };
    ageRow.appendChild(chip);
  });
  setTimeout(() => document.getElementById('new-name').focus(), 50);
}
function hideAddForm(){
  document.getElementById('add-form').classList.add('hidden');
  document.getElementById('new-name').value = '';
}
function submitNewPlayer(btn){
  const name = document.getElementById('new-name').value.trim();
  const errBox = document.getElementById('add-error');
  errBox.textContent = '';
  if(!name){ errBox.textContent = 'Type a name first.'; UISound.play('error'); return; }
  if(!selectedAge){ errBox.textContent = 'Pick an age group.'; UISound.play('error'); return; }
  if(allPlayers.some(p => p.Name.toLowerCase() === name.toLowerCase())){ errBox.textContent = 'That name is already playing here.'; UISound.play('error'); return; }
  UI.call('createProfile', [name, selectedAge], {btn: btn, kind: 'add', text: 'Adding ' + name, quiet: true})
    .then(() => {
      allPlayers.push({Name: name, Age: selectedAge, Active: true});
      hideAddForm(); selectedPlayer = name; showLook(); renderPlayers(); updatePlayCta();
      UISound.play('success');
      UI.toast(name + ' joined the playground!');
      refreshDashboard();
    })
    .catch(err => { UISound.play('error'); errBox.textContent = (err && err.message) ? err.message : 'Could not add that player.'; });
}

/* ---------- TODAY'S TREASURES: 3 items a day, each with a goal; done → claim one evolution step ---------- */
let dailyFor = null, DAILY = null;
const TR_HINT = '<div class="tr-hint"><div class="boxes"><span>🎁</span><span>🎁</span><span>🎁</span></div><b>👆 Pick a player above</b><span>to open today\'s 3 treasures and see the goal for each one</span></div>';
function loadDaily(force){
  if(!selectedPlayer){ dailyFor = null; DAILY = null; document.getElementById('tr-list').innerHTML = TR_HINT; return; }   // no player yet: say how to open them
  if(dailyFor === selectedPlayer && !force) return;
  dailyFor = selectedPlayer; const who = selectedPlayer, box = document.getElementById('tr-list');
  const close = UI.section(box, 'treasure');
  google.script.run.withSuccessHandler(d => { close(); if(who !== selectedPlayer) return; DAILY = d; renderDaily(); })
    .withFailureHandler(() => { close(); dailyFor = null; box.innerHTML = '<div class="recent-empty">Could not load today\'s treasures</div>'; }).getDailyData(who);
}
// 🏭 Artifactory maker strip (af-4): the 3 newest things this player made + bag + 🛠️ Craft
let makerFor = null;
function loadMaker(){
  const box = document.getElementById('maker-strip'); if(!box) return;
  if(!selectedPlayer){ makerFor = null; box.classList.add('hidden'); return; }
  if(makerFor === selectedPlayer) return; makerFor = selectedPlayer; const who = selectedPlayer;
  google.script.run.withSuccessHandler(d => { if(who !== selectedPlayer || !d) return; renderMaker(d); }).withFailureHandler(() => { makerFor = null; }).getArtStrip(who);
}
function renderMaker(d){
  const box = document.getElementById('maker-strip'); box.classList.remove('hidden');
  if(d.skins) try{ localStorage.setItem('sp_artskins', JSON.stringify({v: 1, at: Date.now(), list: d.skins})); }catch(e){}   // 🎮 the family's crafted things → the game skin pickers on this device
  const last = d.last || [];
  box.innerHTML = (last.length ? last.map(() => '<canvas width="104" height="104"></canvas>').join('') : '<canvas width="104" height="104"></canvas>') +
    '<span class="mk-tx"><b>🏭 ' + (last.length ? 'Made by ' + UI.esc(selectedPlayer) + ': ' + d.made : 'Artifactory') + '</b><small>' + (last.length ? '🎒 ' + d.total + ' materials' + (d.dailyReady ? ' · 📦 a delivery is waiting!' : '') : 'Turn, forge, weave — and wear what you make') + '</small></span>' +
    '<button data-sound="pop" onclick="goArtifactory()">🛠️ Craft</button>';
  box.querySelectorAll('canvas').forEach((c, i) => { const g = c.getContext('2d'), a = last[i]; g.clearRect(0, 0, 104, 104); if(a && window.artDraw) artDraw(g, a.look, 52, 96, 80, 1); else if(window.emo) emo(g, '🏭', 52, 52, 56); });
}
function goArtifactory(){ UI.go(WEBAPP_URL + '?page=artifactory' + (selectedPlayer ? '&player=' + encodeURIComponent(selectedPlayer) : ''), 'craft', 'Opening Artifactory'); }
function renderDaily(){
  const box = document.getElementById('tr-list'); if(!DAILY) return;
  box.innerHTML = DAILY.picks.map(p => {
    const btn = p.full ? '<button class="claim done" data-sound="none">⭐ Complete</button>' : p.claimed ? '<button class="claim done" data-sound="none">✅ Claimed</button>' : p.done ? '<button class="claim go" data-sound="none" data-slot="' + p.slot + '">🎁 Claim!</button>' : '<button class="claim todo" data-sound="none">⏳ To do</button>';
    return '<div class="tr"><canvas width="168" height="196" data-slot="' + p.slot + '"></canvas><b>' + p.icon + ' ' + UI.esc(p.name) + '</b><span class="st">' + (p.full ? 'all ' + p.steps + ' steps' : (p.have ? 'evolve to step ' : 'step ') + (p.have + 1) + ': ' + UI.esc(p.nextStep)) + '</span><span class="goal">' + p.goalIcon + ' ' + UI.esc(p.goal) + '</span>' + btn + '</div>';
  }).join('');
  box.querySelectorAll('canvas').forEach(c => { const p = DAILY.picks.find(x => x.slot === Number(c.dataset.slot)); paintTreasure(c, p); });
  box.querySelectorAll('.claim.go').forEach(b => b.onclick = () => {
    UI.call('claimDaily', [DAILY.player, Number(b.dataset.slot)], {btn: b, kind: 'claim'}).then(r => {
      UISound.play('success'); UI.toast('🎁 ' + r.icon + ' ' + r.name + ' — step ' + r.have + ': ' + r.step + '!');
      DAILY.picks = r.picks; renderDaily();
    }).catch(() => {});
  });
}
// The treasure on the player's own avatar (the next step they'd get).
function paintTreasure(c, p){
  const v = Math.min(p.have, p.steps - 1);
  if(drawThingPreview(c, {slot: p.slotType}, v)) return;
  const base = DAILY.avatar ? fixAv(DAILY.avatar) : defaultAvatar(DAILY.player); base.eq = {};
  if(['skin', 'hair', 'outfitColor'].includes(p.slotType)){ base[p.slotType] = AV_BASE[p.slotType] + v; if(p.slotType === 'hair') base.acc = 0; }
  else base.eq[p.slotType] = {id: p.line, v, o: {}};
  drawPreviewCanvas(c, base, {name: DAILY.player, t: 1.2, owned: {[p.line]: v + 1}});
}
function updatePlayCta(){
  refreshModeNews();   // ✨ modes-2
  loadDaily();
  loadMaker();   // 🏭 af-4
  const btn = document.getElementById('play-btn'), hint = document.getElementById('play-hint');
  btn.disabled = !selectedPlayer;
  const mn = document.getElementById('myroom-name'); if(mn) mn.textContent = selectedPlayer ? selectedPlayer + "'s Room" : 'My Room';
  btn.textContent = selectedPlayer ? '▶ Let\'s Play, ' + selectedPlayer + '!' : '▶ Let\'s Play!';
  hint.textContent = selectedPlayer ? 'Tap ' + themeMeta(currentLook()).icon + ' My look to change ' + selectedPlayer + "'s style" : 'Pick a player to start';
}
// Screen-time minutes come from CACHED_SETTINGS (already loaded) so the
// redirect happens synchronously inside the tap — iOS Home Screen apps drop
// a navigation that happens after an async server call.
function screenTimeMinutesForAge(age){
  const key = {'4-5':'ScreenTime_4-5', '6-7':'ScreenTime_6-7', '8-9':'ScreenTime_8-9', '10+':'ScreenTime_10+'}[age];
  const minutes = Number(key && CACHED_SETTINGS ? CACHED_SETTINGS[key] : null);
  return (minutes && minutes > 0) ? minutes : 20;
}
function letsPlay(){
  if(!selectedPlayer) return;
  const player = allPlayers.find(p => p.Name === selectedPlayer);
  startPlaySession(screenTimeMinutesForAge(player ? player.Age : ''));
}
function startPlaySession(durationMin){
  UI.go(WEBAPP_URL + '?page=gameroom' + '&player=' + encodeURIComponent(selectedPlayer)
    + '&sessionStart=' + Date.now() + '&durationMin=' + durationMin, 'play', 'Starting ' + selectedPlayer + "'s game");
}

/* ---------- PODIUM, RECORD, RECENT ---------- */
function renderPodium(leaderboard){
  const box = document.getElementById('podium');
  box.innerHTML = '';
  const top3 = leaderboard.filter(e => e.tokenCount > 0).slice(0, 3);
  if(!top3.length){ box.innerHTML = '<div class="podium-empty">No badges yet — play a game to take the top spot!</div>'; return; }
  const slots = [{rank:2, cls:'silver', medal:'🥈'}, {rank:1, cls:'gold', medal:'🥇'}, {rank:3, cls:'bronze', medal:'🥉'}];
  slots.forEach(s => {
    const e = top3[s.rank - 1]; if(!e) return;
    const spot = document.createElement('div');
    spot.className = 'podium-spot ' + s.cls;
    spot.innerHTML = '<div class="medal">' + s.medal + '</div><div class="pname">' + UI.esc(e.name) + '</div>' +
      '<div class="ptokens">' + UI.esc(e.tokenCount) + ' 🏅</div><div class="bar">' + s.rank + '</div>';
    box.appendChild(spot);
  });
}
const LEVEL_NAMES = ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', '💀 Hardcore'];
function fmtSec(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function renderMazeRecord(rec){
  const box = document.getElementById('maze-rec');
  let i = rec.length - 1; while(i >= 0 && !rec[i]) i--;
  if(i < 0){ box.classList.add('hidden'); return; }
  box.innerHTML = '<span>🧭 Maze record · ' + LEVEL_NAMES[i] + ': <b>' + UI.esc(rec[i].name) + '</b> ⏱ ' + fmtSec(rec[i].timeSec) + '</span>';
  box.classList.remove('hidden');
}
// "Today 16:45" / "Yesterday" / "Oct 27" from the sheet's yyyy-MM-dd HH:mm text.
function whenText(d){
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(String(d || ''));
  if(!m) return '';
  const day = new Date(+m[1], +m[2] - 1, +m[3]), today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((today - day) / 86400000), hm = m[4] ? m[4] + ':' + m[5] : '';
  if(diff === 0) return 'Today ' + hm;
  if(diff === 1) return 'Yesterday';
  return day.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}
let lastRecentKey = '';
/* ---------- 📣 WHAT'S NEW: new games, Extreme / Hardcore records, games to try ---------- */
let newsShown = false;
function newsKey(n){ return n.kind + ':' + (n.id || '') + ':' + (n.level == null ? '' : n.level) + ':' + (n.at || '') + ':' + (n.player || '') + ':' + [n.step, n.count, n.days, n.leader, n.chaser, n.players && n.players.join('+')].filter(v => v != null).join(','); }
// as-2 🎭 one card when acts were added to the shared kit in the last 7 days (any chat's 🎭 block with a date)
function actCards(){
  if(!window.Acting || !Acting.shared) return [];
  const week = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10), L = Acting.shared({since: week}); if(!L.length) return [];
  const names = L.slice(0, 4).map(o => (Acting.SIG.names || {})[o.k] || o.k.replace(/^[a-z0-9]+\./, '').replace(/-/g, ' '));
  return [{kind: 'acts', id: 'collection', at: L[0].added, count: L.length, names, icon: '🎭', route: 'collection'}];
}
function newsTag(k){ if(k === 'trophy') return '🏆 FAMILY CUP'; /* trophy: '🏆 FAMILY CUP' bo-10b */ if(k === 'acts') return '🎭 NEW ACTS'; if(k === 'comic') return '🏅 COMIC OF THE DAY'; return {mode: '🎯 TRY A MODE', modenew: '🆕 NEW MODE', new: '🆕 NEW', record: '🏆 RECORD', try: '💡 TRY IT', milestone: '🏁 MILESTONE', close: '⚔️ CLOSE CALL', jam: '🚦 JAM', mail: '📬 MAIL', birthday: '🎂 BIRTHDAY'}[k] || '📣'; }
function newsRes(n, v){ return n.byScore ? Number(v).toLocaleString() + ' pts' : '⏱ ' + fmtSec(v || 0); }
function newsBody(n){
  if(n.kind === 'comic') return '<b>' + UI.esc(n.player) + '\'s comic #' + n.issue + ': ' + UI.esc(n.title || 'Untitled') + (n.votes ? ' — ' + n.votes + ' 👍' : '') + '</b><small>📚 Comic of the day · tap to read it in the Comic Book' + (n.votes ? '' : ' and give it your 👍') + '</small>';   // ck-1b 🏅
  if(n.kind === 'acts') return '<b>' + n.count + ' new avatar act' + (n.count > 1 ? 's' : '') + ' to try!</b><small>' + UI.esc(n.names.join(' · ')) + (n.count > n.names.length ? ' …' : '') + ' — see them in 📖 Collection → 🎭 Acts shelf, pick one as your 🎭 signature act in 🎒 Wardrobe</small>';   // as-2 🎭
  const lv = n.level === 5 ? '💀 Hardcore' : '🌋 Extreme', res = n.byScore ? Number(n.score).toLocaleString() + ' pts' : n.timeSec ? '⏱ ' + fmtSec(n.timeSec) : '⭐'.repeat(n.stars || 0);
  const prev = n.prev ? (n.byScore ? Number(n.prev.score).toLocaleString() + ' pts' : '⏱ ' + fmtSec(n.prev.timeSec || 0)) : '';
  const lvName = LEVEL_NAMES[n.level] || '';
  if(n.kind === 'mode') return '<b>' + (n.player ? UI.esc(n.player) + ', try ' : 'Try ') + UI.esc(n.mode.name) + '!</b><small>' + UI.esc(n.mode.gname) + ' · ' + UI.esc(n.mode.pitch) + ' — tap to play!</small>';   // ✨ modes-2
  if(n.kind === 'modenew') return '<b>New in ' + UI.esc(n.mode.gname) + ': ' + UI.esc(n.mode.name) + '</b><small>' + UI.esc(n.mode.pitch) + ' — tap to try it!</small>';
  if(n.kind === 'new') return '<b>New game: ' + UI.esc(n.name) + '</b><small>' + UI.esc(n.tag || 'Come and try it!') + ' — tap to play!</small>';
  if(n.kind === 'record') return '<b>' + UI.esc(n.player) + ' set a ' + lv + ' record!</b><small>' + UI.esc(n.name) + ' · ' + res + (n.prev && n.prev.name ? ' — beat ' + UI.esc(n.prev.name === n.player ? 'their own' : n.prev.name + "'s") + ' ' + prev : ' — the first one!') + ' · ' + UI.esc(whenText(n.at)) + '</small>';
  if(n.kind === 'milestone') return (n.done ? '<b>' + UI.esc(n.player) + ' crossed the finish line!</b><small>' + UI.esc(n.name) + ' · all 6 levels, 💀 Hardcore cleared 🏁</small>'
      : '<b>' + UI.esc(n.player) + ' is almost at the finish!</b><small>' + UI.esc(n.name) + ' · ' + UI.esc(LEVEL_NAMES[n.step - 1] || '') + ' — ' + (6 - n.step) + ' level' + (6 - n.step > 1 ? 's' : '') + ' to go</small>');
  if(n.kind === 'close') return '<b>' + UI.esc(n.chaser) + ' is only ' + (n.byScore ? Number(n.behind).toLocaleString() + ' pts behind' : fmtSec(n.behind) + ' slower than') + ' ' + UI.esc(n.leader) + '!</b><small>' + UI.esc(n.name) + ' · ' + UI.esc(lvName) + ' record (' + newsRes(n, n.lead) + ') — so close!</small>';
  if(n.kind === 'jam') return '<b>Jam at the top of ' + UI.esc(n.name) + '!</b><small>' + UI.esc(n.players.join(', ')) + ' are all neck and neck on ' + UI.esc(lvName) + ' — who breaks away?</small>';
  if(n.kind === 'trophy') return '<b>' + UI.esc(n.team || (n.player + "'s team")) + ' won the Family cup!</b><small>⚽ BlasOff · ' + UI.esc(n.player) + ' lifts the 🏆' + (n.by && n.by !== n.player ? ' (played by ' + UI.esc(n.by) + ')' : '') + '</small>';   /* 👑 bo-10b */
  if(n.kind === 'mail') return '<b>' + UI.esc(n.player) + ' has ' + n.count + ' gift' + (n.count > 1 ? 's' : '') + ' waiting!</b><small>Tap to open the mailbox in ' + UI.esc(n.player) + "'s room 💝</small>";
  if(n.kind === 'birthday') return n.days === 0 ? '<b>Happy birthday, ' + UI.esc(n.player) + '! 🎉</b><small>Send a gift to their room today 🎁</small>'
      : '<b>' + UI.esc(n.player) + "'s birthday is in " + n.days + ' day' + (n.days > 1 ? 's' : '') + '!</b><small>Get a gift ready 🎁</small>';
  return '<b>Nobody has tried ' + UI.esc(n.name) + ' yet</b><small>Be the first — every record is still open! 🏁</small>';
}
function newsIcon(n){ return {mail: '📬', birthday: '🎂', close: '⚔️', jam: '🚦'}[n.kind] || n.icon || '🎮'; }
/* ---------- ✨ MODE SPOTLIGHT (modes-2): 🎯 Try a mode — 2 cards a day for modes the picked player (or the family) hasn't tried; 🆕 a new mode for 7 days ---------- */
let MODES = null, MODE_SIG = '';
function dayIndex(t){ const d = t ? new Date(t + 'T00:00:00') : new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
function modeCards(news){
  if(!MODES || !Array.isArray(MODES.list) || !MODES.list.length) return [];
  const list = MODES.list, tried = MODES.tried || {}, names = Object.keys(tried), today = dayIndex(), out = [];
  const gameNew = r => (news || []).some(n => n.kind === 'new' && String(n.route || '').split('&')[0] === r);   // the game itself is still 🆕 → no extra card
  list.filter(m => m.added && today - dayIndex(m.added) >= 0 && today - dayIndex(m.added) < (MODES.newDays || 7) && !gameNew(m.route))
    .sort((a, b) => String(b.added).localeCompare(String(a.added))).slice(0, 2)
    .forEach(m => out.push({kind: 'modenew', id: m.game, route: m.link, icon: m.icon, mode: m, at: m.added + '|' + m.key}));
  const who = selectedPlayer && Array.isArray(tried[selectedPlayer]) ? selectedPlayer : '';
  const triedBy = m => names.filter(n => (tried[n] || []).indexOf(m.key) >= 0).length;
  let pool = list.filter(m => !out.some(o => o.mode.key === m.key));
  if(who) pool = pool.filter(m => tried[who].indexOf(m.key) < 0);
  else { pool = pool.map((m, i) => ({m, i, c: triedBy(m)})).filter(o => !names.length || o.c < names.length).sort((a, b) => (a.c - b.c) || (a.i - b.i)).slice(0, 16).map(o => o.m); }
  if(pool.length){
    const start = (today * 2) % pool.length, pick = pool.length > 1 ? [pool[start], pool[(start + 1) % pool.length]] : [pool[0]];
    pick.forEach(m => out.push({kind: 'mode', id: m.game, route: m.link, icon: m.icon, mode: m, player: who, at: today + '|' + m.key}));
  }
  return out;
}
function refreshModeNews(){
  if(!MODES || !LAST_NEWS) return;
  const sig = modeCards(LAST_NEWS).map(n => n.kind + n.mode.key + n.player).join(',');
  if(MODE_SIG && sig !== MODE_SIG) renderNews(LAST_NEWS);
  MODE_SIG = sig;
}
function renderNews(list){
  const panel = document.getElementById('news-panel'), box = document.getElementById('news-list');
  const order = {birthday: 0, trophy: 0.5, mail: 1, record: 2, milestone: 3, close: 4, jam: 5, new: 6, modenew: 6.5, acts: 6.8, comic: 2.5, try: 7, mode: 7.5};   // ck-1b 🏅 Comic of the day
  list = list.concat(modeCards(list)).concat(actCards());   // as-2 🎭 new shared acts (7 days)   // ✨ modes-2: 🎯 Try a mode (2 a day) + 🆕 new modes
  list = list.filter(n => order[n.kind] != null).sort((a, b) => (order[a.kind] - order[b.kind]) || ((a.days || 0) - (b.days || 0)));
  const today = list.filter(n => n.kind === 'birthday' && n.days === 0);
  renderBirthday(today);
  list = list.filter(n => today.indexOf(n) < 0);   // today's birthday is the big banner, not a card
  if(!list.length && !today.length){ panel.classList.add('hidden'); stopNewsAnim(); return; }
  let seen = []; try{ seen = JSON.parse(localStorage.getItem('sp_news_seen') || '[]'); }catch(e){}
  const unseen = list.concat(today).filter(n => seen.indexOf(newsKey(n)) < 0);
  box.innerHTML = list.map(n => '<button class="news ' + n.kind + (n.done ? ' done' : '') + (unseen.indexOf(n) >= 0 ? ' unseen' : '') + '" data-sound="nav"><span class="tag">' + newsTag(n.kind) + '</span><span class="ni">' + UI.esc(newsIcon(n)) + '</span><span class="nt">' + newsBody(n) + '</span>' + (n.kind === 'milestone' ? '<canvas class="track" aria-hidden="true"></canvas>' : '') + (n.kind === 'comic' ? '<canvas class="comicthumb" aria-hidden="true"></canvas>' : '') + (n.kind === 'trophy' ? '<canvas class="trophycv" aria-hidden="true"></canvas>' : '') + '</button>').join('');
  box.querySelectorAll('.news').forEach((b, k) => b.onclick = () => {
    const n = list[k];
    if(n.kind === 'mail'){ selectedPlayer = n.player; UI.go(WEBAPP_URL + '?page=room&game=my&player=' + encodeURIComponent(n.player), 'myroom'); return; }
    if(n.kind === 'birthday'){ UI.toast('🎂 ' + n.player + (n.days ? "'s birthday is on " + bdayText(n.date) : ' — happy birthday!') + ' 🎈'); return; }
    if(n.kind === 'comic'){ UI.go(WEBAPP_URL + '?page=collection&game=' + encodeURIComponent('comic:' + n.id) + (selectedPlayer ? '&player=' + encodeURIComponent(selectedPlayer) : ''), 'collection'); return; }   // ck-1b 🏅 opens the reader
    if(n.route) UI.go(WEBAPP_URL + '?page=' + n.route + (selectedPlayer ? '&player=' + encodeURIComponent(selectedPlayer) : ''), n.id);
  });
  box.querySelectorAll('.news').forEach((b, k) => { const n = list[k], cv = b.querySelector('canvas.comicthumb'); if(!cv || !window.Comic || !Comic.render || !n.page) return;   // ck-1b 🏅 a small picture of the comic
    try { Comic.render(cv, Comic.cover(Comic.expand(n.page, avatarOf)), {w: 84, h: 64, t: 0.5, still: true}); } catch(e){} });
  document.getElementById('news-sub').textContent = unseen.length ? unseen.length + ' new for you' : '';
  panel.classList.remove('hidden');
  box.style.minHeight = list.some(n => n.kind === 'milestone') ? '150px' : '';   // same height every turn (no page jump)
  MODE_SIG = list.filter(n => n.kind === 'mode' || n.kind === 'modenew').map(n => n.kind + n.mode.key + n.player).join(',');
  newsRotate(list.length);
  startNewsAnim(list);
  if(unseen.length && !newsShown){ newsShown = true; setTimeout(() => UI.toast('📣 ' + unseen.length + ' new thing' + (unseen.length > 1 ? 's' : '') + ' on the board — ' + (today.length ? 'it\'s a birthday! 🎂' : unseen.find(n => n.kind === 'record') ? 'a new record!' : 'take a look!')), 900); }
  // mark them as seen a few seconds after they were on screen (the dot shows until the next visit)
  setTimeout(() => { try{ const all = Array.from(new Set(seen.concat(list.concat(today).map(newsKey)))).slice(-80); localStorage.setItem('sp_news_seen', JSON.stringify(all)); }catch(e){} }, 4000);
}
/* 🔄 rotation: show `slots` cards (1 phone · 2 tablet · 3 wide), move on every 5 s; pause while a finger / mouse is on it */
const NEWS_ROT = {n: 0, start: 0, slots: 1, timer: 0, pauseUntil: 0, every: 5000};
function newsSlots(){ const w = document.getElementById('news-list').clientWidth || innerWidth; return Math.max(1, Math.min(NEWS_ROT.n, w >= 900 ? 3 : w >= 560 ? 2 : 1)); }
function newsShow(start, anim){
  const R = NEWS_ROT, cards = Array.from(document.querySelectorAll('#news-list .news')); if(!cards.length) return;
  R.slots = newsSlots(); R.start = ((start % R.n) + R.n) % R.n;
  cards.forEach((c, i) => { const pos = (i - R.start + R.n) % R.n, on = pos < R.slots; c.style.order = pos; c.classList.toggle('off', !on); c.classList.remove('in'); if(on && anim){ void c.offsetWidth; c.classList.add('in'); } });
  const nav = document.getElementById('news-nav'), pages = Math.ceil(R.n / R.slots), cur = Math.floor(R.start / R.slots) % pages;
  if(pages < 2){ nav.classList.add('hidden'); nav.innerHTML = ''; return; }
  nav.classList.remove('hidden');
  nav.innerHTML = '<button class="nn-arrow" data-sound="nav" aria-label="previous news">‹</button>' + (pages > 7 ? '<span class="nn-count">' + (cur + 1) + ' / ' + pages + '</span>' : Array.from({length: pages}, (_, p) => '<button class="nn-dot' + (p === cur ? ' on' : '') + '" data-p="' + p + '" aria-label="news page ' + (p + 1) + '"></button>').join('')) + '<button class="nn-arrow" data-sound="nav" aria-label="next news">›</button>';
  const arrows = nav.querySelectorAll('.nn-arrow');
  arrows[0].onclick = () => { newsPause(); newsStep(-1); }; arrows[1].onclick = () => { newsPause(); newsStep(1); };
  nav.querySelectorAll('.nn-dot').forEach(d => d.onclick = () => { newsPause(); newsShow(Number(d.dataset.p) * R.slots, true); });
}
function newsStep(dir){ const R = NEWS_ROT, pages = Math.ceil(R.n / R.slots), cur = Math.floor(R.start / R.slots); newsShow((((cur + dir) % pages) + pages) % pages * R.slots, true); }
function newsGoTo(i){ const R = NEWS_ROT; newsShow(Math.floor(i / R.slots) * R.slots, false); newsPause(); }
function newsPause(ms){ NEWS_ROT.pauseUntil = Date.now() + (ms || 9000); }
function newsRotate(n){
  const R = NEWS_ROT; R.n = n; if(R.timer) clearInterval(R.timer); R.timer = 0;
  newsShow(0, false);
  R.timer = setInterval(() => { if(document.hidden || Date.now() < R.pauseUntil || R.n <= R.slots) return; newsStep(1); }, R.every);
}
(function newsGestures(){
  const box = document.getElementById('news-list'); if(!box) return; let x0 = null, y0 = 0;
  box.addEventListener('pointerenter', e => { if(e.pointerType === 'mouse') newsPause(60000); });
  box.addEventListener('pointerleave', e => { if(e.pointerType === 'mouse') newsPause(2500); });
  box.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; newsPause(); });
  box.addEventListener('pointerup', e => { if(x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3){ box.dataset.swiped = '1'; setTimeout(() => { delete box.dataset.swiped; }, 50); newsStep(dx < 0 ? 1 : -1); } });
  box.addEventListener('click', e => { if(box.dataset.swiped){ e.stopPropagation(); e.preventDefault(); } }, true);
  let rt = 0; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if(NEWS_ROT.n && newsSlots() !== NEWS_ROT.slots) newsShow(NEWS_ROT.start, false); }, 150); });
})();
function bdayText(mmdd){ const m = /^(\d{2})-(\d{2})$/.exec(mmdd || ''); return m ? new Date(2000, +m[1] - 1, +m[2]).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : ''; }
// 🎂 Birthday banner on the day: the birthday player's avatar cheers between balloons.
function renderBirthday(list){
  const el = document.getElementById('bday-banner');
  if(!list.length){ el.classList.add('hidden'); el.innerHTML = ''; return; }
  el.innerHTML = '<span class="bb-l">🎈</span><canvas class="bb-av" width="128" height="128" aria-hidden="true"></canvas><div class="bb-t"><b>Happy birthday, ' + UI.esc(list.map(n => n.player).join(' & ')) + '!</b><small>🎂 The whole playground says hooray! 🎉</small></div><span class="bb-r">🎁</span>';
  el.dataset.player = list[0].player;
  el.classList.remove('hidden');
}
// 🏁 Milestone tracks: one long line, 6 level dots, the avatar walks to where the player is, 🏁 at the end.
let NEWS_ANIM = 0;
function stopNewsAnim(){ if(NEWS_ANIM) cancelAnimationFrame(NEWS_ANIM); NEWS_ANIM = 0; }
function startNewsAnim(list){
  stopNewsAnim();
  const tracks = Array.from(document.querySelectorAll('#news-list .news')).map((b, k) => ({cv: b.querySelector('canvas.track'), n: list[k]})).filter(o => o.cv);
  const bb = document.querySelector('#bday-banner:not(.hidden) canvas.bb-av'), bname = bb ? document.getElementById('bday-banner').dataset.player : '';
  const cups = Array.from(document.querySelectorAll('#news-list .news')).map((b, k) => ({cv: b.querySelector('canvas.trophycv'), n: list[k]})).filter(o => o.cv);   /* 👑 bo-10b */
  if(!tracks.length && !bb && !cups.length) return;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, t0 = performance.now();
  const cheer = GESTURES.find(g => g.k === 'cheer'), wave = GESTURES.find(g => g.k === 'wave'), epic = (typeof EPIC_DANCES !== 'undefined' && EPIC_DANCES.length) ? EPIC_DANCES : [cheer];
  const frame = now => {
    const t = reduce ? 9 : Math.max(0, now - t0) / 1000;
    tracks.forEach(o => drawTrack(o.cv, o.n, t, cheer, wave));
    cups.forEach(o => drawTrophy(o.cv, o.n, t, cheer));
    if(bb){ const g = bb.getContext('2d'), w = bb.width, k = w / 78, mv = epic[Math.floor(t / 2.6) % epic.length];
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, w);
      try { drawAvatar(g, {name: '', av: avatarOf(bname), dir: 1, walkT: 0, gest: {g: mv, t: t % 2.6}}, w / 2, w - 4 * k, k, {t: t, noShadow: true}); } catch(e){} }
    if(!reduce && !document.hidden) NEWS_ANIM = requestAnimationFrame(frame); else NEWS_ANIM = 0;
  };
  NEWS_ANIM = requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { if(!document.hidden && !NEWS_ANIM && document.querySelector('#news-list canvas.track, #news-list canvas.trophycv, #bday-banner:not(.hidden) canvas')) startNewsAnim(LAST_NEWS); });
let LAST_NEWS = [];
/* 👑 bo-10b: the 🏆 FAMILY CUP card — the winning captain cheers under a bobbing cup */
function drawTrophy(cv, n, t, cheer){
  const dpr = Math.min(2, window.devicePixelRatio || 1), cw = cv.clientWidth || 64, ch = cv.clientHeight || 64;
  if(cv.width !== Math.round(cw * dpr)){ cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cw, ch);
  const top = Math.round(ch * 0.3), av = avatarOf(n.player);
  try { const P = avatarPlace(av, '', cw, ch - top, cw / 2, ch - top - 2, null, cheer ? [cheer] : null); g.save(); g.translate(0, top);
    drawAvatar(g, {name: '', av: av, dir: 1, walkT: 0, gest: cheer ? {g: cheer, t: t % (cheer.d || 1.6)} : null}, P.x, P.y, P.k, {t: t, noShadow: true}); g.restore(); } catch(e){}
  const bob = Math.sin(t * 3.2) * 2, sz = Math.round(top * 0.95);
  try { if(typeof emo === 'function') emo(g, '🏆', cw / 2, top / 2 + 1 + bob, sz); else { g.font = sz + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🏆', cw / 2, top / 2 + bob); } } catch(e){}
}
function drawTrack(cv, n, t, cheer, wave){
  const dpr = Math.min(2, window.devicePixelRatio || 1), cw = cv.clientWidth || 220, ch = cv.clientHeight || 56;
  if(cv.width !== Math.round(cw * dpr)){ cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cw, ch);
  const y = ch - 10, x0 = 12, x1 = cw - 24, dot = i => x0 + (x1 - x0) * i / 5;
  g.lineCap = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(120,90,70,0.22)'; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
  const goal = n.done ? x1 + 4 : dot(n.step - 1), walk = Math.min(1, t / 1.6), ease = 1 - Math.pow(1 - walk, 2), ax = x0 + (goal - x0) * ease;
  const grad = g.createLinearGradient(x0, 0, x1, 0); grad.addColorStop(0, '#2EC4B6'); grad.addColorStop(1, n.done ? '#FF4D8D' : '#FF9F1C');
  g.strokeStyle = grad; g.beginPath(); g.moveTo(x0, y); g.lineTo(Math.max(x0, ax), y); g.stroke();
  for(let i = 0; i < 6; i++){ const on = i < n.step && dot(i) <= ax + 1; g.beginPath(); g.arc(dot(i), y, i === 5 ? 6 : 4.5, 0, Math.PI * 2); g.fillStyle = on ? (i === 5 ? '#B3122B' : '#2EC4B6') : '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = on ? '#fff' : 'rgba(120,90,70,0.35)'; g.stroke(); }
  emo(g, '🏁', x1 + 13, y + 4 - 18 * 0.38, 18);   // cached emoji picture (typing emoji every frame lags)
  const arrived = walk >= 1, gest = arrived ? (n.done ? {g: cheer, t: (t - 1.6) % 2} : ((t - 1.6) % 5 < 2 ? {g: wave, t: (t - 1.6) % 5} : null)) : null;
  try { drawAvatar(g, {name: '', av: avatarOf(n.player), dir: 1, walkT: arrived ? 0 : t * 1.4, gest: gest}, ax, y - 3, 0.52, {t: t, noShadow: true}); } catch(e){ g.fillText('🙂', ax, y - 4); }
  if(n.done && arrived){ g.font = '13px sans-serif'; ['🎉', '✨', '⭐'].forEach((c, i) => { const a = (t * 2 + i * 2.1) % 6.28; emo(g, c, x1 - 30 + i * 22, 12 + Math.sin(a) * 3 - 13 * 0.38, 13, 0.5 + 0.5 * Math.sin(a)); }); g.globalAlpha = 1; }
}
function renderRecent(list){
  const box = document.getElementById('recent-list');
  const key = JSON.stringify(list.map(r => r.date + r.name + r.level));
  const fresh = lastRecentKey && key !== lastRecentKey;
  lastRecentKey = key;
  if(!list.length){ box.innerHTML = '<div class="recent-empty">No clears yet — finish a level to show up here! 🚩</div>'; return; }
  box.innerHTML = list.slice(0, 5).map((r, i) =>
    '<div class="recent-row' + (fresh && i === 0 ? ' fresh' : '') + '"><span class="ri">' + UI.esc(r.icon || '🎮') + '</span>' +
    '<span class="rt"><b>' + UI.esc(r.name) + ' cleared ' + UI.esc(r.gameName || r.game) + '</b>' +
    '<small>' + UI.esc(r.levelName || LEVEL_NAMES[r.level] || '') + (r.timeSec ? ' · ⏱ ' + fmtSec(r.timeSec) : '') + ' · ' + UI.esc(whenText(r.date)) + '</small></span>' +
    '<span class="rs">' + '⭐'.repeat(r.stars || 0) + '<i>' + '⭐'.repeat(3 - (r.stars || 0)) + '</i></span></div>').join('');
}

startWelcomeScreen();
loadDashboard();
