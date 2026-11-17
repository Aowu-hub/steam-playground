
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[3]) || null;
const DURATION_MIN = Number(SP_TV[4]) || null;
const OPEN_GAME = SP_TV[5];

const $ = id => document.getElementById(id);
const pick = a => a[rnd(a.length)];
function shuffle(a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const PRAISE = ['Great job', 'Super', 'Awesome', 'Fantastic', 'You did it', 'Brilliant', 'Way to go'];
// Voice-over. Always speaks the newest line: an older line still talking is stopped first. Chrome drops a
// speak() that comes right after cancel(), so the new line waits a moment after a cancel (only the newest wins).
let sayToken = 0;
function say(text, fast){ try{
  if(!UISound.get().enabled || !window.speechSynthesis) return;
  const my = ++sayToken, busy = speechSynthesis.speaking || speechSynthesis.pending;
  const go = () => { if(my !== sayToken) return; const u = new SpeechSynthesisUtterance(text); u.rate = fast ? 1.15 : 0.92; u.pitch = 1.2; u.volume = Math.max(0.2, UISound.get().volume); speechSynthesis.speak(u); };
  if(busy){ speechSynthesis.cancel(); setTimeout(go, 90); } else go();
}catch(e){} }

/* ================= GAMES ================= */
const GAMES = {
  'color-match':   {name:'Color Match',    icon:'🎨', c1:'#FF8FB1', c2:'#E2557F', blurb:'Find the matching colour (and shape!)'},
  'count-match':   {name:'Count & Match',  icon:'🔢', c1:'#5BC0F8', c2:'#2D7FD3', blurb:'Count, match numbers and add'},
  'code-robot':    {name:'Code the Robot', icon:'🤖', c1:'#8C7CF0', c2:'#5B4BC4', blurb:'Arrows that send the robot to the star'},
  'trash-pointer': {name:'Trash Pointer',  icon:'🗑️', c1:'#7ED957', c2:'#2FA36B', blurb:'Drag rubbish into the right bin'}
};
let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: ''};
let lockHandle = null;
let M = null; // the mini game being played: {id, stage, ...}

/* ---------- shapes for Color Match (simple SVG) ---------- */
const SHAPE_SVG = {
  circle:   c => '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="' + c + '" stroke="rgba(0,0,0,0.15)" stroke-width="4"/></svg>',
  square:   c => '<svg viewBox="0 0 100 100"><rect x="12" y="12" width="76" height="76" rx="12" fill="' + c + '" stroke="rgba(0,0,0,0.15)" stroke-width="4"/></svg>',
  triangle: c => '<svg viewBox="0 0 100 100"><path d="M50 10 L92 88 L8 88 Z" fill="' + c + '" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-linejoin="round"/></svg>',
  star:     c => '<svg viewBox="0 0 100 100"><path d="M50 6 L62 38 L96 38 L68 58 L79 92 L50 72 L21 92 L32 58 L4 38 L38 38 Z" fill="' + c + '" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-linejoin="round"/></svg>',
  heart:    c => '<svg viewBox="0 0 100 100"><path d="M50 88 C10 60 4 34 22 20 C36 10 48 18 50 28 C52 18 64 10 78 20 C96 34 90 60 50 88 Z" fill="' + c + '" stroke="rgba(0,0,0,0.15)" stroke-width="4" stroke-linejoin="round"/></svg>'
};
const COLORS = [{n:'red', hex:'#F25F5C'}, {n:'yellow', hex:'#FFD23F'}, {n:'green', hex:'#4CB963'}, {n:'blue', hex:'#2CA6DE'}, {n:'purple', hex:'#7B5FE0'}, {n:'pink', hex:'#FF6FA5'}];
const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'];

/* ---------- stage lists (names kept from the old version so old badges still match) ---------- */
const STAGES = {
  'color-match': [
    {name:'Warm-Up', colors:2, options:2, rounds:3},
    {name:'Getting Colorful', colors:3, options:3, rounds:4},
    {name:'Full Palette', colors:4, options:4, rounds:5},
    {name:'Adding Purple', colors:5, options:4, rounds:5, shapes:true},
    {name:'Six Colors', colors:6, options:5, rounds:6, shapes:true, both:true},
    {name:'Speed Colors', colors:6, options:5, speed:45, shapes:true},
    {name:'Speed Colors + Shapes', colors:6, options:5, speed:45, shapes:true, both:true},
    {name:'Speed Mix 🎲', colors:6, options:5, speed:45, shapes:true, mix:true}
  ],
  'count-match': [
    {name:'Count to 3', kind:'pick', max:3, options:2, rounds:4},
    {name:'Count to 5', kind:'pick', max:5, options:3, rounds:5},
    {name:'Count to 10', kind:'pick', max:10, options:3, rounds:5},
    {name:'How Many?', kind:'number', max:10, options:4, rounds:5},
    {name:'Adding Up', kind:'add', max:10, options:3, rounds:5},
    {name:'Speed Count!', kind:'mix', max:10, options:3, speed:45}
  ],
  'code-robot': [
    {name:'First Steps', n:3, rocks:0, len:[1, 2], slots:3, rounds:3},
    {name:'Two Moves', n:3, rocks:0, len:[2, 3], slots:3, rounds:3},
    {name:'Bigger Board', n:4, rocks:0, len:[3, 4], slots:5, rounds:3},
    {name:'Around the Rock', n:4, rocks:2, len:[3, 5], slots:6, rounds:3},
    {name:'Long Trip', n:5, rocks:4, len:[5, 7], slots:8, rounds:3}
  ],
  'trash-pointer': [
    {name:'Learn: Recycling', bins:['recycle'], rounds:3},
    {name:'Recycle vs Food · 1', bins:['recycle','food'], rounds:4},
    {name:'Recycle vs Food · 2', bins:['recycle','food'], rounds:5},
    {name:'Recycle vs Food · 3', bins:['recycle','food'], rounds:6},
    {name:'+ General Waste · 1', bins:['recycle','food','general'], rounds:4},
    {name:'+ General Waste · 2', bins:['recycle','food','general'], rounds:5},
    {name:'+ General Waste · 3', bins:['recycle','food','general'], rounds:6},
    {name:'All 4 Bins · 1', bins:['recycle','food','general','hazard'], rounds:4},
    {name:'All 4 Bins · 2', bins:['recycle','food','general','hazard'], rounds:5},
    {name:'All 4 Bins · 3', bins:['recycle','food','general','hazard'], rounds:6},
    {name:'Speed Sort!', bins:['recycle','food','general','hazard'], speed:60}
  ]
};
function badgeFor(id, stage){ return GAMES[id].name + ': ' + STAGES[id][stage].name.replace(/!$/, '') + ' Badge'; }

/* ================= MENUS ================= */
// 🎛️ p1d: the game's own top bar becomes the shared bar in place (UiKit UI.gameBarFrom) — ◀ where you came from · 🎚️ Levels · 🏠 | numbers | buttons ❓
const BAR = UI.gameBarFrom(document.querySelector('#scr-game .hud'), {game: 'minigames', icon: '🕹️', name: 'Mini Games', playing: () => !!(M && !M.over), onFit: () => window.dispatchEvent(new Event('resize')), help: () => { const h = UI.gameHelp && M && UI.gameHelp(M.id); if(h) UI.guide([h]); }});
var NAV_INNER = {hub: ['◀ Mini Games', () => openCover()]};   // 🧱 b3w6a: the setup's top button goes back to the 🎬 cover   // 🧭 inner screens: their top button names + goes to the main screen
UI.navBar(document.getElementById('back-btn'), {onclick: false});
function showScreen(name){
  if(name === 'stages') name = 'hub';   /* 🧱 b3w6a: the level picker lives on the setup page */
  if(name !== 'hub' && name !== 'player' && window.MiniCover) MiniCover.hide();
  ['player', 'hub', 'game'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'game'); UI.navScreen($('back-btn'), name, NAV_INNER);   /* 🧭 p1d */
  window.scrollTo(0, 0);
}
function progressOf(id){ const p = S.progress[S.player] || {}; return p[id] || {unlocked: 0, tokens: []}; }
function renderPlayers(){
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div style="text-align:center;font-weight:700;color:var(--ink-soft)">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    if(HAS_AV){ const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c); b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age || '') + '</div>'); drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1}); }   /* 🧑 p6 */
    else b.innerHTML = '<div class="big">' + UI.esc(p.Name.charAt(0).toUpperCase()) + '</div><div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age || '') + '</div>';
    b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  $('who-name').textContent = name;
  if(OPEN_GAME && GAMES[OPEN_GAME] && !choosePlayer.opened){ choosePlayer.opened = true; MP.game = OPEN_GAME; MP.deep = true; }   /* 🧱 b3w6a: a Gameroom card opens with its game picked */
  else MP.game = null;
  renderHub(); showScreen('hub'); openCover();   /* 🧱 b3w6a: the 🎬 cover first */
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function renderHub(){
  const box = $('tiles'); box.innerHTML = '';
  Object.keys(GAMES).forEach(id => {
    const G = GAMES[id], p = progressOf(id), total = STAGES[id].length, done = Math.min(total, p.unlocked);
    const b = document.createElement('button');
    b.className = 'tile'; b.setAttribute('data-sound', 'pop');
    b.style.setProperty('--c1', G.c1); b.style.setProperty('--c2', G.c2);
    b.innerHTML = '<span class="ti">' + G.icon + '</span><h2>' + G.name + '</h2><p>' + G.blurb + '</p>' +
      '<div class="meta"><span>Stage ' + Math.min(total, done + 1) + ' of ' + total + '</span><span>🏅 ' + p.tokens.length + '</span></div>' +
      '<div class="bar"><i style="width:' + Math.round(done / total * 100) + '%"></i></div>';
    b.dataset.id = id; b.onclick = () => chooseGame(id);   /* 🧱 b3w6a: a tap picks */
    box.appendChild(b);
  });
  if(!MP.game || !GAMES[MP.game]){ let g = ''; try{ g = localStorage.getItem(pickKey('game')) || ''; }catch(e){} MP.game = GAMES[g] ? g : Object.keys(GAMES)[0]; }
  renderLevels();   /* 🧱 b3w6a */
}
function toHub(){ stopTimers(); M = null; renderHub(); showScreen('hub'); }
// Every mini game starts on its level picker: open levels, cleared ones ✓, locked ones show how to open them.
function stageOpen(id, i){ const p = progressOf(id), st = STAGES[id]; return i <= p.unlocked || !!(st[i].speed && st[p.unlocked] && st[p.unlocked].speed); }
/* 🧱 b3w6a (Game Baseline): ONE setup page — 🎮 game → 🎚️ level → ▶ Start; the picks are remembered per player (game + a level per game) */
const MP = {game: null, stage: 0, deep: false};
const gfPick = (el, on) => { if(window.GF && GF.pick) GF.pick(el, on); };
const pickKey = k => 'sp_mini_' + k + ':' + (S.player || '');
function showStages(id){ stopTimers(); M = null; if(id && GAMES[id]) MP.game = id; renderHub(); showScreen('hub'); scrollToLevels(); }
function scrollToLevels(){ const h = $('lv-head'); if(h && h.scrollIntoView) setTimeout(() => h.scrollIntoView({behavior: REDUCED ? 'auto' : 'smooth', block: 'start'}), 30); }
function chooseGame(id, quiet){ MP.game = id; try{ localStorage.setItem(pickKey('game'), id); }catch(e){} renderLevels(); if(!quiet) scrollToLevels(); }
function chooseStage(i){ MP.stage = i; try{ localStorage.setItem(pickKey('lv_' + MP.game), String(i)); }catch(e){} markPicks(); }
function renderLevels(){
  const id = MP.game, G = GAMES[id], p = progressOf(id), list = STAGES[id], next = Math.min(list.length - 1, p.unlocked);
  $('st-title').textContent = G.icon + ' ' + G.name; $('st-who').textContent = '· 🏅 ' + p.tokens.length;
  const root = $('scr-hub'); root.style.setProperty('--c1', G.c1); root.style.setProperty('--c2', G.c2);
  $('stage-list').innerHTML = list.map((st, i) => { const open = stageOpen(id, i), done = i < p.unlocked;
    return '<button class="stage-card t-card' + (open ? '' : ' locked') + (i === next && open ? ' next' : '') + '" data-sound="' + (open ? 'pop' : 'none') + '" data-i="' + i + '">' +
      '<span class="sn">' + (i + 1) + '</span><span class="sbadge">' + (done ? '✅' : open ? '▶️' : '🔒') + '</span>' +
      '<b>' + UI.esc(st.name) + '</b><small>' + (st.speed ? '⏱️ ' + st.speed + ' s speed round' : '🎯 ' + st.rounds + ' rounds') + '</small>' +
      (!open ? '<small class="how">Clear level ' + (p.unlocked + 1) + ' first</small>' : done ? '<small class="how ok">Cleared ✓</small>' : '') + '</button>'; }).join('');
  $('stage-list').querySelectorAll('.stage-card').forEach(b => b.onclick = () => { const i = +b.dataset.i; if(!stageOpen(id, i)){ UISound.play('error'); UI.toast('🔒 Clear level ' + (p.unlocked + 1) + ' first', 'info'); return; } chooseStage(i); });
  let i = -1; try{ const v = localStorage.getItem(pickKey('lv_' + id)); i = v == null ? -1 : Number(v); }catch(e){}
  MP.stage = i >= 0 && i < list.length && stageOpen(id, i) ? i : next;
  showStages.id = id; markPicks();
}
function markPicks(){
  document.querySelectorAll('#tiles .tile').forEach(b => { const on = b.dataset.id === MP.game; b.classList.toggle('sel', on); gfPick(b, on); });
  document.querySelectorAll('#stage-list .stage-card').forEach(b => { const on = Number(b.dataset.i) === MP.stage; b.classList.toggle('sel', on); gfPick(b, on); });
  const G = GAMES[MP.game], st = STAGES[MP.game] && STAGES[MP.game][MP.stage], bt = $('btn-start');
  if(bt && G && st) bt.textContent = '▶ Start · ' + G.icon + ' ' + G.name + ' · ' + (MP.stage + 1) + '. ' + st.name;
}
function startSetup(){ if(!stageOpen(MP.game, MP.stage)){ UISound.play('error'); UI.toast('Pick a level that is open 🔓'); return; } openGame(MP.game, MP.stage); }
// 🎬 the cover (GameFrame): who's here + how to play; ▶ Play opens the setup page (a Gameroom card's game already picked)
let MiniCover = null;
const MINI_VERSION = '2.0';   /* 🧱 b3w6a: shown on the cover footer — bump with each Mini Games round */
function openCover(){
  if(!window.GF){ showScreen('hub'); return; }
  if(MiniCover && MiniCover.who !== S.player){ MiniCover.destroy(); MiniCover = null; }
  if(!MiniCover){ MiniCover = GF.cover(document.body, {game: 'minigames', title: 'Mini Games', icon: '🕹️', version: MINI_VERSION, me: S.player, players: S.players, avatarOf: myAvatar, seats: {min: 1, max: 1},
      c1: '#FF8FB1', c2: '#6C4AB6', story: 'Four quick games — colours, counting, coding and sorting!',
      help: ['🎮 Pick one of 4 quick games: 🎨 colours · 🔢 counting · 🤖 coding · 🗑️ sorting', '🎚️ Pick a level — clear it to open the next one and earn a 🏅 badge', '⏱️ Speed levels: as many right answers as you can before the clock runs out'],
      acts: ['beat.wave', 'beat.cheer', 'beat.jump'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms',
      onPlay: () => { MiniCover.hide(); showScreen('hub'); if(MP.deep) scrollToLevels(); } }); MiniCover.who = S.player; window.MiniCover = MiniCover; }
  MiniCover.show();
}
function toStages(){ const id = M ? M.id : showStages.id; if(id) showStages(id); else toHub(); }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }
function goBigRobot(){ UI.go(WEBAPP_URL + '?page=robot' + sessionQuery(), 'robot-adventure', 'Opening Code the Robot'); }

/* ================= GAME SHELL ================= */
let timers = [];
function later(fn, ms){ const t = setTimeout(fn, ms); timers.push(t); return t; }
function stopTimers(){ timers.forEach(clearTimeout); timers = []; if(M && M.tick) clearInterval(M.tick); }
function openGame(id, stage){
  stopTimers(); if(MiniCover) MiniCover.hide();   /* 🧱 b3w6a */
  const G = GAMES[id], p = progressOf(id), total = STAGES[id].length;
  if(stage == null) stage = Math.min(total - 1, p.unlocked);
  M = {id, stage, st: STAGES[id][stage], round: 0, mistakes: 0, score: 0, t0: performance.now()};
  const root = $('scr-game');
  root.style.setProperty('--c1', G.c1); root.style.setProperty('--c2', G.c2);
  document.body.style.setProperty('--c1', G.c1); document.body.style.setProperty('--c2', G.c2);
  $('g-name').textContent = G.icon + ' ' + G.name;
  $('g-stage').textContent = 'Stage ' + (stage + 1) + ' · ' + M.st.name + ' ▾';
  $('g-left').classList.add('hidden');
  showScreen('game');
  if(M.st.speed) startSpeed(); else { renderDots(); nextRound(); }
}
function renderDots(){
  const box = $('g-progress');
  if(M.st.speed){ box.innerHTML = '<div class="timebar"><i id="tb" style="width:100%"></i></div>'; return; }
  box.innerHTML = '<div class="dots">' + Array.from({length: M.st.rounds}, (_, i) => '<i class="' + (i < M.round ? 'on' : '') + '"></i>').join('') + '</div>';
}
function toggleStageMenu(){
  const old = document.querySelector('.stage-menu'); if(old){ old.remove(); return; }
  const p = progressOf(M.id), m = document.createElement('div'); m.className = 'stage-menu';
  STAGES[M.id].forEach((st, i) => { const b = document.createElement('button'); b.textContent = (i + 1) + '. ' + st.name; b.className = i === M.stage ? 'cur' : '';
    b.disabled = i > p.unlocked && !(st.speed && STAGES[M.id][p.unlocked] && STAGES[M.id][p.unlocked].speed); b.setAttribute('data-sound', 'pop'); b.onclick = () => { m.remove(); openGame(M.id, i); }; m.appendChild(b); });
  $('arena').appendChild(m);
}
function banner(text, bad){
  let b = document.querySelector('#arena .banner'); if(!b){ b = document.createElement('div'); b.className = 'banner'; $('arena').appendChild(b); }
  b.textContent = text; b.classList.toggle('bad', !!bad); b.classList.add('on');
  clearTimeout(banner.t); banner.t = setTimeout(() => b.classList.remove('on'), 2200);
}
function nextRound(){
  if(!M) return;
  M.wait = false;
  const arena = $('arena'); arena.innerHTML = '';
  ROUND[M.id](arena);
}
// A correct answer: sparkle, then the next round (or the stage is cleared).
function correct(el){
  if(!M || M.wait) return; // a double tap must not count twice
  M.wait = true;
  UISound.play('success');
  if(el){ el.classList.remove('yay'); void el.offsetWidth; el.classList.add('yay'); }
  sparkle(el);
  M.streak = (M.streak || 0) + 1; M.bestStreak = Math.max(M.bestStreak || 0, M.streak);
  if(M.streak === 5 || M.streak === 10 || M.streak === 15) banner('🔥 ' + M.streak + ' in a row! ' + pick(PRAISE) + '!');
  if(M.st.speed){ M.score++; updateSpeed(); later(nextRound, 350); return; }
  M.round++; renderDots();
  if(M.round >= M.st.rounds){ later(stageCleared, 500); return; }
  later(nextRound, 650);
}
function wrong(el, hint){
  if(!M || M.wait) return;
  UISound.play('error'); M.mistakes++; M.streak = 0;
  if(el){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  if(hint){ banner(hint, true); }
}
function sparkle(el){
  if(!el || REDUCED) return;
  const r = el.getBoundingClientRect();
  for(let k = 0; k < 6; k++){ const s = document.createElement('div'); s.textContent = pick(['✨', '⭐', '🌟']);
    s.style.cssText = 'position:fixed;z-index:380;pointer-events:none;font-size:1.4rem;left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px;transition:transform .7s ease-out, opacity .7s;';
    document.body.appendChild(s); const a = Math.random() * 6.28, d = 50 + Math.random() * 40;
    requestAnimationFrame(() => { s.style.transform = 'translate(' + Math.cos(a) * d + 'px,' + Math.sin(a) * d + 'px) scale(1.4)'; s.style.opacity = '0'; });
    setTimeout(() => s.remove(), 750); }
}
function confetti(list, count){
  if(REDUCED) return;
  for(let i = 0; i < (count || 30); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pick(list);
    e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's';
    document.body.appendChild(e); setTimeout(() => e.remove(), 3800); }
}
function praise(text){
  const p = document.createElement('div'); p.className = 'praise'; p.textContent = '🎉 ' + text; document.body.appendChild(p);
  setTimeout(() => p.remove(), REDUCED ? 600 : 1500);
}

/* ---------- speed rounds: 3-2-1, then as many as you can ---------- */
function startSpeed(){
  renderDots(); $('arena').innerHTML = '';
  M.score = 0; M.speedEnd = 0;
  const cd = document.createElement('div'); cd.className = 'cd'; document.body.appendChild(cd);
  [3, 2, 1].forEach((n, i) => later(() => { cd.innerHTML = '<span>' + n + '</span>'; UISound.play(n === 1 ? 'nav' : 'tap'); }, i * 800));
  later(() => {
    cd.innerHTML = '<span>GO!</span>'; UISound.play('success'); later(() => cd.remove(), 700);
    M.speedEnd = performance.now() + M.st.speed * 1000;
    $('g-left').classList.remove('hidden'); updateSpeed();
    M.tick = setInterval(updateSpeed, 250);
    nextRound();
  }, 2400);
}
function updateSpeed(){
  if(!M || !M.speedEnd) return;
  const left = Math.max(0, M.speedEnd - performance.now()), tb = $('tb');
  if(tb) tb.style.width = (left / (M.st.speed * 1000) * 100) + '%';
  $('g-left').textContent = '⏱ ' + Math.ceil(left / 1000) + 's · ⭐ ' + M.score + (M.streak >= 3 ? ' · 🔥' + M.streak : '');
  if(left <= 0){ clearInterval(M.tick); M.speedEnd = 0; speedOver(); }
}

/* ---------- end of a stage / speed round ---------- */
function stageCleared(){
  const id = M.id, stage = M.stage, st = M.st, secs = Math.max(1, Math.round((performance.now() - M.t0) / 1000));
  const stars = M.mistakes === 0 ? 3 : M.mistakes <= 2 ? 2 : 1;
  const score = 100 * (stage + 1) + Math.max(0, 300 - secs * 5) + stars * 50;
  const pr = pick(PRAISE);
  UISound.play('success'); praise(pr + ', ' + S.player + '!'); say(pr + ', ' + S.player + '!');
  confetti([GAMES[id].icon, '⭐', '🎉', '✨'], 36);
  const nextOk = stage < STAGES[id].length - 1;
  later(() => miniCard({win: true, icon: GAMES[id].icon, title: pr + '!', sub: 'Stage ' + (stage + 1) + ' · ' + st.name + ' cleared', stars, score,   /* 🧱 b3w6a: the shared 🏁 card */
    stats: [['⏱️', secs + 's'], ['❌', M.mistakes], ['🔥', M.bestStreak || 0]],
    levels: () => { hideCard(); showStages(id); }, again: () => { hideCard(); openGame(id, stage); }, againText: '🔁 Again',
    next: nextOk ? () => { hideCard(); openGame(id, stage + 1); } : null, nextText: 'Next stage ▶'}), REDUCED ? 300 : 1300);
  save(id, stage, badgeFor(id, stage), {timeSec: secs, stars, score, levelName: st.name});
}
function speedOver(){
  const id = M.id, stage = M.stage, n = M.score, st = M.st;
  $('arena').innerHTML = '';
  const stars = n >= 20 ? 3 : n >= 10 ? 2 : 1, score = n * 25;
  UISound.play('success'); praise(n + ' in ' + st.speed + ' seconds!'); say("Time's up! You got " + n + '!');
  confetti(['⏱️', '⭐', '🎉'], 30);
  later(() => miniCard({win: true, icon: '⏱️', title: "Time's up!", sub: 'You got ' + n + ' right in ' + st.speed + ' seconds', stars, score,   /* 🧱 b3w6a: the shared 🏁 card */
    stats: [['⭐', n], ['❌', M.mistakes], ['🔥', M.bestStreak || 0]],
    levels: () => { hideCard(); showStages(id); }, again: () => { hideCard(); openGame(id, stage); }, againText: '🔁 Play again'}), REDUCED ? 300 : 1300);
  save(id, stage, n >= 10 ? GAMES[id].name + ': ' + st.name.replace(/!$/, '') + ' Star' : '', {timeSec: st.speed, stars, score, levelName: st.name, speed: true});
}
function statRow(l){ return '<div class="statrow">' + l.map(x => '<span><i>' + x[0] + '</i><b>' + x[1] + '</b></span>').join('') + '</div>'; }
function starHtml(n){ return '<div class="stars">' + [0, 1, 2].map(k => '<span class="st' + (k < n ? '' : ' off') + '" style="animation-delay:' + (0.2 + k * 0.22) + 's">⭐</span>').join('') + '</div>'; }
// 🧱 b3w6a: the shared 🏁 card (GameFrame GF.result) with the old button ids; falls back to the old card without GameFrame
function miniCard(o){
  if(!window.GF || !GF.result){ showCard('<div class="big">' + o.icon + '</div><h2>' + UI.esc(o.title) + '</h2><p>' + UI.esc(o.sub) + '</p>' + starHtml(o.stars) + '<div class="save-note" id="save-note">✅ Saving…</div><div class="res-btns">' + (o.next ? '<button class="btn sp-btn sp-primary" id="b-next">' + o.nextText + '</button>' : '') + '<button class="btn soft sp-btn sp-secondary" id="b-again">' + o.againText + '</button><button class="btn soft sp-btn sp-secondary" id="b-hub">🎚️ Levels</button></div>',
    () => { if(o.next) $('b-next').onclick = o.next; $('b-again').onclick = o.again; $('b-hub').onclick = o.levels; }); return; }
  GF.result(Object.assign({wrap: $('result'), card: $('result-card'), save: 'Saving…', confetti: false, buddy: HAS_AV ? {name: S.player, av: myAvatar(S.player)} : null}, o));
  [['btn-levels', 'b-hub'], ['btn-again', 'b-again'], ['btn-next', 'b-next']].forEach(([a, b]) => { const e = $(a); if(e) e.id = b; });   // the old ids (tests)
  if(save.pendingNote){ const n = $('save-note'); if(n) n.innerHTML = save.pendingNote; save.pendingNote = ''; }
}
function showCard(html, wire){ $('result-card').innerHTML = html; $('result').classList.remove('hidden'); wire(); if(save.pendingNote){ const n = $('save-note'); if(n) n.innerHTML = save.pendingNote; save.pendingNote = ''; } }
function hideCard(){ $('result').classList.add('hidden'); }

/* ---------- saving (retry once; keep in this browser if it still fails) ---------- */
const PENDING_KEY = 'sp_mini_pending';
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(l){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(l.slice(-30))); }catch(e){} }
function flushPending(){ const l = readPending(); if(!l.length) return; writePending([]);
  l.forEach(w => google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))).saveMiniResult(w.name, w.id, w.stage, w.badge, w.extra)); }
function save(id, stage, badge, extra, tries){
  tries = tries || 0;
  const name = S.player, all = S.progress[name] || (S.progress[name] = {}), p = all[id] || (all[id] = {unlocked: 0, tokens: []});
  if(!extra.speed) p.unlocked = Math.min(STAGES[id].length - 1, Math.max(p.unlocked, stage + 1));
  const note = html => { const n = $('save-note'); if(n) n.innerHTML = html; else save.pendingNote = html; };
  google.script.run
    .withSuccessHandler(res => {
      all[id] = {unlocked: res.unlocked, tokens: res.tokens};
      flushPending();
      note(res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : '✅ Saved');
    })
    .withFailureHandler(err => {
      if(tries < 1){ setTimeout(() => save(id, stage, badge, extra, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, id, stage, badge, extra}]));
      note('⚠️ Could not save yet — it will be sent again next time.<br><small style="opacity:.7">' + UI.esc((err && err.message) || '') + '</small>');
    })
    .saveMiniResult(name, id, stage, badge, extra);
}

/* ================= THE FOUR GAMES ================= */
const ROUND = {};

// ---- Color Match: find the colour (later: the colour AND the shape) ----
ROUND['color-match'] = arena => {
  const st = M.st, pool = COLORS.slice(0, st.colors), both = st.both || (st.mix && Math.random() < 0.5);   // mix: each question is a random colour OR a random colour + shape
  const target = {c: pick(pool), s: st.shapes ? pick(SHAPES) : 'circle'};
  let opts = [target];
  const key = o => o.c.n + o.s;
  let guard = 0;
  while(opts.length < st.options && guard++ < 200){
    let o;
    if(both && Math.random() < 0.6) o = Math.random() < 0.5 ? {c: target.c, s: pick(SHAPES)} : {c: pick(pool), s: target.s};
    else o = {c: pick(pool.filter(c => c.n !== target.c.n)), s: st.shapes ? pick(SHAPES) : 'circle'};
    if(!both && o.c.n === target.c.n) continue;
    if(opts.some(x => key(x) === key(o))) continue;
    opts.push(o);
  }
  opts = shuffle(opts);
  const word = both ? target.c.n + ' ' + target.s : target.c.n, Word = word.charAt(0).toUpperCase() + word.slice(1);
  arena.innerHTML = '<div class="ask pop">Find <i class="cdot" style="background:' + target.c.hex + '"></i><b style="color:' + target.c.hex + ';text-transform:uppercase">' + word + '</b></div>' +
    '<div class="target pop">' + SHAPE_SVG[both ? target.s : 'circle'](target.c.hex) + '</div><div class="opts" id="opts"></div>' +
    (M.streak >= 2 ? '<div class="streak pop">🔥 ' + M.streak + ' in a row!</div>' : '');
  // every question is read out: "Red!" / "Red circle!" (speed rounds just the words, a bit faster)
  say(st.speed || both ? Word + '!' : 'Find ' + word, st.speed);
  const box = $('opts');
  opts.forEach((o, i) => {
    const b = document.createElement('button'); b.className = 'opt pop'; b.style.animationDelay = (i * 0.06) + 's'; b.setAttribute('data-sound', 'none');
    b.innerHTML = SHAPE_SVG[o.s](o.c.hex);
    if(both ? key(o) === key(target) : o.c.n === target.c.n) b.dataset.ok = '1';
    b.onclick = () => {
      const ok = both ? key(o) === key(target) : o.c.n === target.c.n;
      if(ok){ b.classList.add('right'); correct(b); }
      else wrong(b, both ? 'That is a ' + o.c.n + ' ' + o.s + ' — find the ' + word + '!' : 'That is ' + o.c.n + '. Find ' + target.c.n + '!');
    };
    box.appendChild(b);
  });
};

// ---- Count & Match ----
const FRUITS = ['🍎', '🍌', '🍊', '🍇', '🍓', '🍐', '🥕', '⚽', '🐤', '🌟'];
function groupHtml(n, f){ return Array.from({length: n}, () => '<span>' + f + '</span>').join(''); }
ROUND['count-match'] = arena => {
  const st = M.st, kind = st.kind === 'mix' ? pick(['pick', 'number', 'add']) : st.kind, f = pick(FRUITS);
  const answers = (target, max) => { const s = new Set([target]); let g = 0; while(s.size < st.options && g++ < 100){ const d = target + pick([-2, -1, 1, 2]); if(d >= 1 && d <= max) s.add(d); } while(s.size < st.options) s.add(1 + rnd(max)); return shuffle([...s]); };
  if(kind === 'pick'){
    const target = 1 + rnd(st.max);
    arena.innerHTML = '<div class="ask pop">Which group has</div><div class="number pop">' + target + '</div><div class="opts" id="opts"></div>';
    say(M.st.speed ? String(target) : 'Find ' + target, M.st.speed);
    answers(target, st.max).forEach(n => { const b = document.createElement('button'); b.className = 'group pop'; if(n === target) b.dataset.ok = '1'; b.setAttribute('data-sound', 'none'); b.innerHTML = groupHtml(n, f);
      b.onclick = () => n === target ? correct(b) : wrong(b, 'That group has ' + n + '. Count again!'); $('opts').appendChild(b); });
  } else if(kind === 'number'){
    const target = 1 + rnd(st.max);
    arena.innerHTML = '<div class="ask pop">How many?</div><div class="show pop">' + groupHtml(target, f) + '</div><div class="opts" id="opts"></div>';
    say('How many?', M.st.speed);
    answers(target, st.max).forEach(n => { const b = document.createElement('button'); b.className = 'numbtn pop'; if(n === target) b.dataset.ok = '1'; b.setAttribute('data-sound', 'none'); b.textContent = n;
      b.onclick = () => n === target ? correct(b) : wrong(b, 'Not ' + n + ' — touch each one and count!'); $('opts').appendChild(b); });
  } else {
    const a = 1 + rnd(5), c = 1 + rnd(Math.min(5, st.max - a)), target = a + c;
    arena.innerHTML = '<div class="ask pop">' + a + ' + ' + c + ' = ?</div><div class="sum pop"><div class="show">' + groupHtml(a, f) + '</div><span class="op">+</span><div class="show">' + groupHtml(c, f) + '</div></div><div class="opts" id="opts"></div>';
    say(a + ' plus ' + c, M.st.speed);
    answers(target, st.max).forEach(n => { const b = document.createElement('button'); b.className = 'numbtn pop'; if(n === target) b.dataset.ok = '1'; b.setAttribute('data-sound', 'none'); b.textContent = n;
      b.onclick = () => n === target ? correct(b) : wrong(b, a + ' and ' + c + ' more makes…? Count them all!'); $('opts').appendChild(b); });
  }
};

// ---- mini Code the Robot: arrows only, a few slots ----
const DIRS = {U:[0, -1, '⬆️'], R:[1, 0, '➡️'], D:[0, 1, '⬇️'], L:[-1, 0, '⬅️']};
function robotBoard(st){
  for(let tries = 0; tries < 300; tries++){
    const n = st.n, rocks = new Set(), cells = n * n;
    const start = rnd(cells); let goal = rnd(cells);
    if(goal === start) continue;
    while(rocks.size < st.rocks){ const r = rnd(cells); if(r !== start && r !== goal) rocks.add(r); }
    // shortest path length (breadth-first)
    const dist = new Array(cells).fill(-1); dist[start] = 0; const q = [start];
    while(q.length){ const c = q.shift(); Object.values(DIRS).forEach(d => { const x = c % n + d[0], y = ((c / n) | 0) + d[1]; if(x < 0 || y < 0 || x >= n || y >= n) return; const k = y * n + x; if(rocks.has(k) || dist[k] >= 0) return; dist[k] = dist[c] + 1; q.push(k); }); }
    if(dist[goal] >= st.len[0] && dist[goal] <= st.len[1] && dist[goal] <= st.slots) return {n, start, goal, rocks, best: dist[goal]};
  }
  return {n: st.n, start: 0, goal: st.n * st.n - 1, rocks: new Set(), best: (st.n - 1) * 2};
}
ROUND['code-robot'] = arena => {
  const st = M.st, B = robotBoard(st); M.B = B; M.prog = []; M.busy = false;
  // Phones on their side get the board on the left and the buttons on the right.
  const side = arena.clientWidth > arena.clientHeight * 1.15;
  arena.innerHTML = '<div class="ask pop">Send the 🤖 to the ⭐</div>' +
    '<div class="rwrap' + (side ? ' side' : '') + '"><div class="rgrid pop" id="rgrid" style="--cs:44px;grid-template-columns:repeat(' + B.n + ',var(--cs));position:relative"></div>' +
    '<div class="rctl" id="rctl"><div class="slots" id="slots"></div>' +
    '<div class="arrows">' + Object.keys(DIRS).map(k => '<button data-sound="pop" onclick="robotAdd(\'' + k + '\')">' + DIRS[k][2] + '</button>').join('') + '</div>' +
    '<div class="arrows"><button class="ctl" data-sound="pop" onclick="robotUndo()">⌫</button><button class="ctl go" data-sound="none" onclick="robotRun()">Go! ▶</button></div></div></div>';
  const g = $('rgrid');
  for(let c = 0; c < B.n * B.n; c++){ const d = document.createElement('div'); d.className = 'rcell' + (B.rocks.has(c) ? ' rock' : ''); d.textContent = B.rocks.has(c) ? '🪨' : c === B.goal ? '⭐' : ''; g.appendChild(d); }
  const r = document.createElement('div'); r.className = 'robot'; r.id = 'robot'; r.textContent = '🤖'; g.appendChild(r);
  robotSlots();
  // Size the cells to the room that is left once the buttons are placed.
  const askH = arena.querySelector('.ask').offsetHeight, ctl = $('rctl');
  const roomH = arena.clientHeight - askH - 16 - (side ? 0 : ctl.offsetHeight + 16) - 26;
  const roomW = (side ? arena.clientWidth - ctl.offsetWidth - 24 : arena.clientWidth) - 26;
  const cs = Math.floor(Math.min(roomH, roomW) / B.n) - 6;
  g.style.setProperty('--cs', Math.max(34, Math.min(130, cs)) + 'px');
  placeRobot(B.start);
  if(M.round === 0) say('Send the robot to the star');
};
function placeRobot(c){ const r = $('robot'), cell = $('rgrid').children[c]; if(!r || !cell) return; r.style.transform = 'translate(' + cell.offsetLeft + 'px,' + cell.offsetTop + 'px)'; r.style.left = '0'; r.style.top = '0'; }
function robotSlots(now){ $('slots').innerHTML = Array.from({length: M.st.slots}, (_, i) => '<div class="slot' + (M.prog[i] ? ' full' : '') + (now === i ? ' now' : '') + '">' + (M.prog[i] ? DIRS[M.prog[i]][2] : '') + '</div>').join(''); }
function robotAdd(k){ if(M.busy) return; if(M.prog.length >= M.st.slots){ banner('All the slots are full — press Go!'); return; } M.prog.push(k); robotSlots(); }
function robotUndo(){ if(M.busy) return; M.prog.pop(); robotSlots(); }
function robotRun(){
  if(M.busy || !M.prog.length){ if(!M.prog.length) banner('Tap the arrows first 👇'); return; }
  M.busy = true; UISound.play('nav');
  const B = M.B; let c = B.start, i = 0;
  const step = () => {
    if(i >= M.prog.length){
      M.busy = false;
      if(c === B.goal){ correct($('robot')); }
      else { wrong($('robot'), 'Almost! The robot stopped before the ⭐ — try again'); later(() => { placeRobot(B.start); M.prog = []; robotSlots(); }, 900); }
      return;
    }
    robotSlots(i);
    const d = DIRS[M.prog[i]], x = c % B.n + d[0], y = ((c / B.n) | 0) + d[1], k = y * B.n + x;
    if(x < 0 || y < 0 || x >= B.n || y >= B.n || B.rocks.has(k)){
      M.busy = false; wrong($('robot'), B.rocks.has(k) ? 'Bonk! A rock 🪨 is in the way' : 'Whoa! That is the edge');
      later(() => { placeRobot(B.start); M.prog = []; robotSlots(); }, 900); return;
    }
    c = k; placeRobot(c); UISound.play('tap'); i++;
    if(c === B.goal){ i = M.prog.length; }
    later(step, 420);
  };
  step();
}

// ---- Trash Pointer: drag the item into the right bin ----
// Thailand's 4 household bins. 'ex' = example pictures shown on the bin, 'say' = what the voice says when you tap it,
// so children who can't read yet can play by colour + pictures + voice alone.
const BINS = {
  recycle:{label:'Recycle', icon:'♻️', colour:'yellow', ex:['🥫','🍾','📦'], say:'Yellow bin. Recycling: cans, bottles and paper.'},
  food:{label:'Food', icon:'🍃', colour:'green', ex:['🍌','🍎','🦴'], say:'Green bin. Food and leftovers.'},
  general:{label:'General', icon:'🗑️', colour:'blue', ex:['🛍️','🧻','🥡'], say:'Blue bin. Everything else: bags, tissues and wrappers.'},
  hazard:{label:'Hazard', icon:'☣️', colour:'red', ex:['🔋','💡','🧪'], say:'Red bin. Dangerous things: batteries, bulbs and chemicals.'}};
const TRASH = {
  recycle:[{e:'🍾', n:'glass bottle'}, {e:'🥫', n:'can'}, {e:'📰', n:'newspaper'}, {e:'📦', n:'cardboard box'}, {e:'🧃', n:'juice box'},
    {e:'🥤', n:'plastic cup'}, {e:'🫙', n:'glass jar'}, {e:'📄', n:'paper'}, {e:'🧴', n:'shampoo bottle'}, {e:'🍶', n:'milk bottle'}],
  food:[{e:'🍌', n:'banana peel'}, {e:'🍏', n:'apple core'}, {e:'🥕', n:'carrot peel'}, {e:'🍞', n:'old bread'}, {e:'🥚', n:'egg shell'},
    {e:'🍉', n:'watermelon rind'}, {e:'🦴', n:'chicken bone'}, {e:'🍚', n:'leftover rice'}, {e:'🍂', n:'dry leaves'}, {e:'🍤', n:'shrimp shell'}],
  general:[{e:'🛍️', n:'plastic bag'}, {e:'🧻', n:'used tissue'}, {e:'🥡', n:'foam box'}, {e:'🎈', n:'popped balloon'}, {e:'🧽', n:'old sponge'},
    {e:'🍬', n:'candy wrapper'}, {e:'🥢', n:'used chopsticks'}, {e:'🩹', n:'used plaster'}, {e:'🧦', n:'old sock'}, {e:'🪥', n:'old toothbrush'}],
  hazard:[{e:'🔋', n:'battery'}, {e:'💡', n:'light bulb'}, {e:'🧪', n:'chemical bottle'}, {e:'🌡️', n:'old thermometer'}, {e:'🪣', n:'paint tin'},
    {e:'📱', n:'broken phone'}, {e:'💊', n:'old medicine'}, {e:'🧯', n:'spray can'}, {e:'🔦', n:'old torch'}, {e:'🪫', n:'empty battery'}]
};
ROUND['trash-pointer'] = arena => {
  const st = M.st;
  if(!M.scene || !arena.querySelector('.scene')){
    arena.innerHTML = '<div class="scene" id="scene"><span class="sun">☀️</span></div><div class="bins" id="bins"></div>';
    const sc = $('scene');
    ['🍂', '🍬', '🥤', '🧦', '🍟', '🧻'].forEach((e, i) => { const d = document.createElement('div'); d.className = 'clutter'; d.textContent = e;
      d.style.left = [6, 80, 14, 70, 44, 88][i] + '%'; d.style.top = [62, 66, 82, 80, 88, 58][i] + '%'; sc.appendChild(d); });
    $('bins').innerHTML = st.bins.map(b => '<button class="bin ' + b + '" data-bin="' + b + '" data-sound="none" aria-label="' + BINS[b].colour + ' bin, ' + BINS[b].label + '">'
      + '<span class="lid"></span><span class="bi">' + BINS[b].icon + '</span><span class="ex">' + BINS[b].ex.join('') + '</span><span class="bl">' + BINS[b].label + '</span></button>').join('');
    // tap a bin: hear what goes in it — or, with a piece of trash picked up by tapping, drop it in
    document.querySelectorAll('#bins .bin').forEach(b => b.addEventListener('click', () => {
      const held = document.querySelector('#scene .item.held');
      if(held && held._drop) held._drop(b); else { say(BINS[b.dataset.bin].say); b.classList.remove('peek'); void b.offsetWidth; b.classList.add('peek'); }
    }));
    M.scene = true;
    if(!st.speed) say(st.bins.length === 1 ? 'Put the trash in the yellow bin!' : 'Drag the trash into the right bin! Tap a bin to hear what goes in it.');
  }
  const bin = pick(st.bins), it = pick(TRASH[bin]);
  const el = document.createElement('div'); el.className = 'item pop'; el.innerHTML = it.e + '<small>' + it.n + '</small>';
  el.style.left = (40 + rnd(20)) + '%'; el.style.top = '10%'; el.dataset.bin = bin;
  $('scene').appendChild(el);
  if(M.round > 0 || st.speed) say(st.speed ? it.n : it.n + '!', st.speed); else later(() => say(it.n + '!'), 2600);
  if(M.stage === 0 && M.round < 2) showHand(el, bin);   // first stage: a finger shows how to drag
  dragTrash(el, bin, it);
};
// A pointing hand slides from the trash to its bin, a few times, until the child touches the trash.
function showHand(el, bin){
  const sc = $('scene'), b = document.querySelector('#bins .bin.' + bin); if(!sc || !b) return;
  const h = document.createElement('div'); h.className = 'hand'; h.textContent = '👆'; document.body.appendChild(h);
  const go = () => { if(!h.isConnected || !el.isConnected){ h.remove(); return; }
    const a = el.getBoundingClientRect(), t = b.getBoundingClientRect();
    h.style.setProperty('--x0', (a.left + a.width / 2) + 'px'); h.style.setProperty('--y0', (a.top + a.height * 0.7) + 'px');
    h.style.setProperty('--x1', (t.left + t.width / 2) + 'px'); h.style.setProperty('--y1', (t.top + t.height * 0.4) + 'px');
    h.classList.remove('run'); void h.offsetWidth; h.classList.add('run'); };
  setTimeout(go, 300); h._t = setInterval(go, 2200);
  const stop = () => { clearInterval(h._t); h.remove(); };
  el.addEventListener('pointerdown', stop, {once: true}); setTimeout(stop, 15000);
}
function dragTrash(el, bin, it){
  const sc = $('scene'); let drag = false, home = {l: el.style.left, t: el.style.top};
  // generous drop zones for small hands: anywhere near a bin counts (the nearest bin wins)
  const binAt = (x, y) => { let hit = null, best = 1e9; document.querySelectorAll('#bins .bin').forEach(b => { const r = b.getBoundingClientRect();
    if(x >= r.left - 30 && x <= r.right + 30 && y >= r.top - 90 && y <= r.bottom + 30){ const d = Math.hypot(x - (r.left + r.right) / 2, y - (r.top + r.bottom) / 2); if(d < best){ best = d; hit = b; } } }); return hit; };
  let downAt = null, moved = false;
  el.addEventListener('pointerdown', e => { if(el.dataset.done) return; e.preventDefault(); drag = true; moved = false; downAt = [e.clientX, e.clientY]; el.classList.add('drag'); el.classList.remove('home'); try{ el.setPointerCapture(e.pointerId); }catch(x){} UISound.play('pop'); });
  el.addEventListener('pointermove', e => {
    if(!drag) return;
    if(!moved && downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 8) return;   // a tap, not a drag (yet)
    moved = true; el.classList.remove('held');
    const r = sc.getBoundingClientRect();
    el.style.left = ((e.clientX - r.left) / r.width * 100) + '%'; el.style.top = ((e.clientY - r.top) / r.height * 100 - 6) + '%';
    document.querySelectorAll('#bins .bin').forEach(b => b.classList.remove('hover')); const h = binAt(e.clientX, e.clientY); if(h) h.classList.add('hover');
  });
  // Tap the trash (no drag) = pick it up and hear its name; then tap a bin to drop it in.
  el._drop = h => { el.classList.remove('held'); drop(h); };
  const drop = h => {
    if(h && h.dataset.bin === bin){
      el.dataset.done = '1'; el.remove(); h.classList.remove('right'); void h.offsetWidth; h.classList.add('right');
      const c = sc.querySelectorAll('.clutter:not(.gone)'); if(c.length) pick([...c]).classList.add('gone');
      if(!sc.querySelector('.clutter:not(.gone)')) sc.classList.add('clean');
      correct(h);
    } else {
      el.classList.add('home'); el.style.left = home.l; el.style.top = home.t;
      if(h){ wrong(h, 'A ' + it.n + ' goes in the ' + BINS[bin].colour + ' ' + BINS[bin].label + ' bin ' + BINS[bin].icon);
        say(it.n + ' goes in the ' + BINS[bin].colour + ' bin'); const rb = document.querySelector('#bins .bin.' + bin); if(rb){ rb.classList.remove('peek'); void rb.offsetWidth; rb.classList.add('peek'); } }
    }
  };
  const up = e => {
    if(!drag) return; drag = false; el.classList.remove('drag');
    document.querySelectorAll('#bins .bin').forEach(b => b.classList.remove('hover'));
    if(!moved){ el.classList.add('held'); el.style.left = home.l; el.style.top = home.t; say(it.n + '! Which bin?', M.st.speed); return; }
    drop(binAt(e.clientX, e.clientY));
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
}
// Trash keeps one scene for the whole stage: only the item changes per round.
const _nextRound = nextRound;
nextRound = function(){ if(M && M.id === 'trash-pointer' && document.getElementById('scene')){ M.wait = false; ROUND['trash-pointer']($('arena')); return; } if(M) M.scene = false; _nextRound(); };

/* ================= BOOT ================= */
function pauseGame(){ stopTimers(); }
function boot(){
  UI.loading(UI.KINDS[OPEN_GAME] ? OPEN_GAME : 'minigames');
  google.script.run
    .withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {};
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER);
      else { renderPlayers(); showScreen('player'); }
    })
    .withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getMiniData(CURRENT_PLAYER);
}
/* ================= 🧑 YOUR AVATAR (p6d — ✨ P6 / 11w round 2) =================
   The player's own avatar beside the game: UI.buddy pictures (cached AvatarActing frames, swapped by a small timer) —
   nothing is painted in the game loop. It reacts to the game's own moments through the wrappers below (no game logic changes). */
const HAS_AV = typeof drawAvatar === 'function' && typeof GESTURES !== 'undefined';
function myAvatar(name){ const a = S.avatars && S.avatars[name || S.player]; return a ? fixAv(a) : defaultAvatar(name || S.player || 'player'); }
const BD_SAY = {};
const BD = {on: false, who: null, list: []};
function bdStart(){
  BD.list.forEach(b => b && b.stop()); BD.list = []; BD.on = false;
  const els = ['bd-lg'].map(id => document.getElementById(id)).filter(Boolean);
  if(!HAS_AV || !UI.buddy || !window.Acting){ els.forEach(e => e.classList.add('hidden')); return; }
  BD.who = {name: S.player, av: myAvatar(S.player)}; BD.list = els.map((e, i) => UI.buddy(e, BD.who, i ? {fps: 6} : {})).filter(Boolean); BD.on = !!BD.list.length;
}
function bdReact(mood, ms){ if(!BD.on) return false; let a = false; BD.list.forEach(b => { const x = b.react(mood, ms); if(x) a = x; });  return a; }
function bdResultBig(){ const big = document.querySelector('#result-card > .big'); if(!big || !BD.on) return; const won = !!document.querySelector('#result-card h2.cheer'); const c = document.createElement('canvas'); c.className = 'res-av'; c.id = 'res-av'; c.setAttribute('aria-hidden', 'true'); big.replaceWith(c); bdResult('res-av', won); }
function bdResult(id, won){ if(BD.on && document.getElementById(id)) UI.buddy(document.getElementById(id), BD.who, {hold: won ? 'win' : 'lose'}); }
const bdBase = {openGame, correct, wrong, stageCleared, speedOver, showCard};
openGame = function(){ const args = arguments;  const r = bdBase.openGame.apply(this, args); bdStart(); return r; };
correct = function(){ const args = arguments;  const r = bdBase.correct.apply(this, args); if(BD.on && performance.now() - (BD.last || 0) > 2200){ BD.last = performance.now(); bdReact('happy', 1300); } return r; };
wrong = function(){ const args = arguments;  const r = bdBase.wrong.apply(this, args); bdReact('miss', 1600); return r; };
stageCleared = function(){ const args = arguments;  const r = bdBase.stageCleared.apply(this, args); bdReact('win', 3000); return r; };
speedOver = function(){ const args = arguments;  const r = bdBase.speedOver.apply(this, args); bdReact('joy', 2600); return r; };
showCard = function(){ const args = arguments;  const r = bdBase.showCard.apply(this, args); const big = document.querySelector('#result-card > .big'); if(big && BD.on){ const c = document.createElement('canvas'); c.className = 'res-av'; c.id = 'res-av'; big.replaceWith(c); bdResult('res-av', true); } return r; };
/* ================= 🧑 YOUR AVATAR END (p6d) ================= */
boot();
