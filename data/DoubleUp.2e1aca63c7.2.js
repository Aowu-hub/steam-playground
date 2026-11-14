
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'double-up';
// 🎛️ p1b: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 🔢 Double Up · level | scoreboard | game buttons ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🔢', name: 'Double Up', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ clearInterval(timerId); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { if(typeof pauseGame === 'function') pauseGame(); }, resume: () => { if(typeof resume === 'function') resume(); }},
  onFit: () => { if(G && typeof layout === 'function') layout(); },
  extras: [{id: 'undo-btn', icon: '↶', label: 'Undo (U)', onClick: () => undo(), keep: true},
    {id: 'voice-btn', icon: '🔈', label: 'Voice', onClick: () => toggleVoice()}]});
function paintVoice(){ BAR.extra('voice-btn', {icon: voiceOn ? '🔊' : '🔈', label: voiceOn ? 'Voice: on' : 'Voice: off'}); }
var NAV_INNER = {};   // 🧭 inner screens: their top button goes to the main screen
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
const pick = a => a[rnd(a.length)];
const randInt = (a, b) => a + rnd(b - a + 1);
function fmt(ms){ const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
let voiceOn = true;
function say(text){ try{ if(!voiceOn || !UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1; u.pitch = 1.2; u.volume = Math.max(0.2, UISound.get().volume); speechSynthesis.speak(u); }catch(e){} }
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ================= LEVELS · THEMES ================= */
// n × n board, goal tile, undo = how many (Infinity = as many as you like), rocks = tiles that never move.
// The 🏔️ Challenge is a bonus board, not a 7th level: its best is saved on the server as feats double-up.chTile / chScore (max),
// with a copy on this device (old device-only bests are sent to the server once).
const LEVELS = [
  {name: 'Basic', emoji: '🌱', n: 4, goal: 128, undo: Infinity, rocks: 0, blurb: 'Make 128 — undo as much as you like'},
  {name: 'Junior', emoji: '🐣', n: 4, goal: 512, undo: Infinity, rocks: 0, blurb: 'Make 512'},
  {name: 'Intermediate', emoji: '🔦', n: 4, goal: 1024, undo: 3, rocks: 0, blurb: 'Make 1024 — 3 undos'},
  {name: 'Hard', emoji: '⚡', n: 4, goal: 2048, undo: 1, rocks: 0, blurb: 'Make 2048 — 1 undo'},
  {name: 'Extreme', emoji: '🌋', n: 4, goal: 2048, undo: 0, rocks: 1, blurb: 'Make 2048 around a 🪨 rock — no undo'},
  {name: 'Hardcore', emoji: '💀', n: 4, goal: 4096, undo: 0, rocks: 0, hardcore: true, blurb: 'Make 4096 — no undo, ×3 points'}
];
const CHALLENGE = {name: 'Challenge', emoji: '🏔️', n: 3, goal: 1024, undo: 0, rocks: 0, challenge: true, blurb: 'Tiny 3 × 3 board — reach 1024 (2048 can\'t fit on 3 × 3!)'};
// Each theme: what each tile is (2, 4, 8 … 8192) + its name (said out loud) + tile colours.
const THEMES = {
  numbers: {name: 'Numbers', icon: '🔢', pics: null, names: null, bg: ['#FFF4E6', '#FFD9B0'], board: '#BBA38D',
    col: ['#EEE4DA', '#EDE0C8', '#F2B179', '#F59563', '#F67C5F', '#F65E3B', '#EDCF72', '#EDCC61', '#EDC850', '#EDC53F', '#EDC22E', '#7A5CFA', '#3D3A8C'], ink: ['#776E65', '#776E65']},
  animals: {name: 'Animal grow-up', icon: '🐣', pics: ['🥚', '🐣', '🐥', '🐔', '🐰', '🐱', '🐶', '🐷', '🐮', '🦁', '🐘', '🐳', '🦄'],
    names: ['egg', 'hatching chick', 'chick', 'hen', 'bunny', 'kitten', 'puppy', 'piggy', 'cow', 'lion', 'elephant', 'whale', 'unicorn'], bg: ['#E8FBE0', '#9FDB86'], board: '#6BAE5A',
    col: ['#FFF8E1', '#FFF1C1', '#FFE38A', '#FFD166', '#FFB4A2', '#F7A072', '#E5989B', '#F28482', '#B5838D', '#E9C46A', '#90BE6D', '#43AA8B', '#9B5DE5']},
  dino: {name: 'Dino', icon: '🦖', pics: ['🥚', '🦴', '🦎', '🐊', '🐢', '🐍', '🦕', '🦖', '🐉', '🌋', '☄️', '🌍', '👑'],
    names: ['dino egg', 'bone', 'lizard', 'crocodile', 'turtle', 'snake', 'long neck', 'T-rex', 'dragon', 'volcano', 'meteor', 'dino world', 'dino king'], bg: ['#F5E6CC', '#C79A5A'], board: '#8C6239',
    col: ['#F2E3C6', '#E9D5A8', '#C9D84A', '#A7C957', '#6A994E', '#7BC67E', '#5FB3B3', '#3E9B5A', '#D4A64A', '#E07A5F', '#BC4749', '#6D597A', '#3D405B']},
  space: {name: 'Space', icon: '🪐', pics: ['✨', '🌑', '🌙', '🌍', '🪐', '☀️', '⭐', '🌟', '💫', '☄️', '🌌', '🛸', '🚀'],
    names: ['stardust', 'tiny moon', 'moon', 'earth', 'planet', 'sun', 'star', 'shining star', 'star burst', 'comet', 'galaxy', 'flying saucer', 'super rocket'], bg: ['#1B1F4A', '#3C2A7A'], board: '#141634', dark: true,
    col: ['#3A3F7A', '#45508F', '#4F63A8', '#4A7BC0', '#5E8FD8', '#7A6CF0', '#9B5DE5', '#C77DFF', '#F15BB5', '#FF8FAB', '#FFB703', '#FB8500', '#E63946']},
  fantasy: {name: 'Fantasy gems', icon: '💎', pics: ['🔹', '🔷', '💠', '💎', '🔮', '🪄', '👑', '🏰', '🦄', '🐉', '🧞', '🌈', '✨'],
    names: ['tiny gem', 'blue gem', 'flower gem', 'diamond', 'crystal ball', 'magic wand', 'crown', 'castle', 'unicorn', 'dragon', 'genie', 'rainbow', 'pure magic'], bg: ['#FCE7FF', '#C9A7FF'], board: '#7B4FB8',
    col: ['#EADCFF', '#D9C2FF', '#C7A7FF', '#B38CFF', '#A06CF5', '#FF9ED2', '#FF7AD9', '#FFB86B', '#FFD36E', '#7DFFB2', '#7AE7FF', '#5B8CFF', '#3D3A8C']},
  sweets: {name: 'Sweets', icon: '🧁', pics: ['🍬', '🍭', '🍪', '🧁', '🍩', '🍰', '🍫', '🍦', '🍨', '🥧', '🎂', '🍯', '🏆'],
    names: ['sweetie', 'lollipop', 'cookie', 'cupcake', 'doughnut', 'cake slice', 'chocolate', 'ice cream', 'sundae', 'pie', 'birthday cake', 'honey pot', 'sweet trophy'], bg: ['#FFE8F0', '#FFB3CC'], board: '#D46A8C',
    col: ['#FFF0F5', '#FFE0EC', '#FFD1DF', '#FFC2D4', '#FFB3CC', '#FF9EBB', '#E07A9E', '#C9A27E', '#A67C52', '#FFD36E', '#FFB703', '#F28C28', '#E63946']}
};
const THEME_KEYS = Object.keys(THEMES);
Object.keys(THEMES).forEach(k => { const T = THEMES[k]; T.syms = T.pics ? T.pics.slice(0, 4) : ['2', '4', '8', '16']; });
const AGE_START = {'4-5': 0, '6-7': 1, '8-9': 2, '10+': 3};
const PRAISE = ['Double star', 'Tile master', 'Super slider', 'Brilliant', 'Amazing'];
const TIPS = [
  'Tip: keep your biggest tile in a corner — and keep sliding towards that corner.',
  'Tip: try to use only 3 directions (for example ← ↓ →) and save the 4th for emergencies.',
  'Tip: keep the row with your biggest tile full, so it never moves away from the corner.',
  'Tip: join the small tiles early, before the board fills up.'
];
const DIRS = {left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1]};

let S = {players: [], progress: {}, settings: {}, avatars: {}, challenge: {}, player: '', age: ''};
let G = null, theme = 'animals', timerId = 0, lockHandle = null;
window.feedbackContext = () => ({page: 'Double Up', game: GAME_ID, level: G ? G.L.name + ' · ' + THEMES[G.theme].name : ''});
function prefKey(){ return 'sp_doubleup_prefs:' + S.player; }
function loadPrefs(){ try{ const p = JSON.parse(localStorage.getItem(prefKey()) || '{}'); if(THEMES[p.theme]) theme = p.theme; if(p.voice === false) voiceOn = false; }catch(e){} }
function savePrefs(){ try{ localStorage.setItem(prefKey(), JSON.stringify({theme, voice: voiceOn})); }catch(e){} }
function chKey(){ return 'sp_doubleup_challenge:' + S.player; }
function chLocal(){ try{ return JSON.parse(localStorage.getItem(chKey()) || 'null'); }catch(e){ return null; } }
function chBetter(a, b){ return !b || (a && (a.tile > b.tile || (a.tile === b.tile && a.score > b.score))); }
// Best of the server (S.challenge) and this device.
function chBest(name){ name = name || S.player; const sv = (S.challenge || {})[name] || null, lo = name === S.player ? chLocal() : null; if(!sv) return lo; if(!lo) return sv; return {tile: Math.max(sv.tile, lo.tile), score: Math.max(sv.score, lo.score)}; }
function chSend(rec, tries){
  tries = tries || 0; const name = S.player;
  google.script.run.withSuccessHandler(() => { const sv = S.challenge[name] || {tile: 0, score: 0}; S.challenge[name] = {tile: Math.max(sv.tile, rec.tile), score: Math.max(sv.score, rec.score)}; })
    .withFailureHandler(() => { if(tries < 1) setTimeout(() => chSend(rec, tries + 1), 1200); })
    .saveFeats(name, GAME_ID, {chTile: rec.tile, chScore: rec.score});
}
// A best that only lives on this device (from before the server save) goes to the server once.
function chMigrate(){ const lo = chLocal(), sv = (S.challenge || {})[S.player]; if(lo && (!sv || lo.tile > sv.tile || lo.score > sv.score)) chSend(lo); }
function chFamily(){ let top = null; Object.keys(S.challenge || {}).forEach(n => { const r = S.challenge[n]; if(!top || r.tile > top.tile || (r.tile === top.tile && r.score > top.score)) top = Object.assign({name: n}, r); }); return top; }
function myAvatar(name){ return (S.avatars && S.avatars[name]) || defaultAvatar(name); }
const lg = v => Math.round(Math.log2(v));   // 2 → 1, 4 → 2 …

/* ================= ENGINE (pure) ================= */
// Board: c[y * n + x] = null | ROCK | tile {id, v}. A slide returns {moved, gained, merges: [tile], best}.
const ROCK = 'rock';
let NEXT_ID = 1;
function emptyCells(B){ const out = []; B.c.forEach((t, i) => { if(!t) out.push(i); }); return out; }
function addRandom(B){ const e = emptyCells(B); if(!e.length) return null; const i = pick(e), t = {id: NEXT_ID++, v: Math.random() < 0.9 ? 2 : 4, isNew: true}; B.c[i] = t; return t; }
function newBoard(L){ const B = {n: L.n, c: new Array(L.n * L.n).fill(null)}; for(let k = 0; k < L.rocks; k++){ const e = emptyCells(B).filter(i => { const x = i % L.n, y = (i / L.n) | 0; return x > 0 && y > 0 && x < L.n - 1 && y < L.n - 1; }); B.c[pick(e.length ? e : emptyCells(B))] = ROCK; } addRandom(B); addRandom(B); return B; }
function cloneB(B){ return {n: B.n, c: B.c.map(t => t && t !== ROCK ? {id: t.id, v: t.v} : t)}; }
// The lines to walk for a direction: each line starts at the wall the tiles slide towards.
function lines(n, dir){
  const out = [];
  for(let a = 0; a < n; a++){ const line = [];
    for(let b = 0; b < n; b++){ let x, y;
      if(dir === 'left'){ x = b; y = a; } else if(dir === 'right'){ x = n - 1 - b; y = a; } else if(dir === 'up'){ x = a; y = b; } else { x = a; y = n - 1 - b; }
      line.push(y * n + x); }
    out.push(line); }
  return out;
}
function slide(B, dir){
  const n = B.n, res = {moved: false, gained: 0, merges: [], best: 0};
  lines(n, dir).forEach(line => {
    // a rock splits the line into parts that slide on their own
    let part = [];
    const flush = () => {
      const tiles = part.map(i => B.c[i]).filter(Boolean), out = [];
      for(let k = 0; k < tiles.length; k++){
        const t = tiles[k], nx = tiles[k + 1];
        if(nx && nx.v === t.v){ const m = {id: NEXT_ID++, v: t.v * 2, from: [t.id, nx.id], merged: true}; out.push(m); res.gained += m.v; res.merges.push(m); res.best = Math.max(res.best, m.v); k++; }
        else out.push(t);
      }
      part.forEach((i, k) => { const before = B.c[i], after = out[k] || null; if((before && before.id) !== (after && after.id)) res.moved = true; B.c[i] = after; });
      part = [];
    };
    line.forEach(i => { if(B.c[i] === ROCK){ flush(); } else part.push(i); });
    flush();
  });
  return res;
}
function canMove(B){
  const n = B.n; if(B.c.some(t => !t)) return true;
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){ const t = B.c[y * n + x]; if(t === ROCK) continue;
    const r = x < n - 1 ? B.c[y * n + x + 1] : null, d = y < n - 1 ? B.c[(y + 1) * n + x] : null;
    if(r && r !== ROCK && r.v === t.v) return true; if(d && d !== ROCK && d.v === t.v) return true; }
  return false;
}
function maxTile(B){ return Math.max(0, ...B.c.filter(t => t && t !== ROCK).map(t => t.v)); }

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'play'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER);   // 🧭 p1b window.scrollTo(0, 0);
}
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
function renderPlayers(){
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div class="empty">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c);
    b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age ? p.Age + ' yrs' : '') + '</div>');
    try { drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1}); } catch(e){}
    b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  loadPrefs(); $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); } /* 📣 cs-4a */ renderMenu(); showScreen('menu');
  chMigrate();
}
function changePlayer(){ renderPlayers(); showScreen('player'); }

// Theme row: built once per menu visit, a tap only moves the highlight (no page jump).
function renderMenu(){
  $('theme-list').innerHTML = THEME_KEYS.map(k => '<button class="chip' + (k === theme ? ' on' : '') + '" data-sound="pop" data-theme-key="' + k + '"><span class="ic">' + THEMES[k].syms.slice(0, 4).join('') + '</span>' + THEMES[k].name + '</button>').join('');
  $('theme-list').querySelectorAll('[data-theme-key]').forEach(b => b.onclick = () => { theme = b.dataset.themeKey; savePrefs(); $('theme-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); });
  renderLevels();
}

function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No score yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span>' + (b.timeSec ? '<span>⏱ ' + fmt(b.timeSec * 1000) + '</span>' : '') + '<span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }

function picOf(v, T){ T = T || THEMES[theme]; return T.pics ? T.pics[Math.min(T.pics.length - 1, lg(v) - 1)] : String(v); }
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; if(window.UI && UI.leaders) UI.leaders($('leaders'), GAME_ID, S.player);
  const p = progressOf(S.player), rec = AGE_START[S.age], T = THEMES[theme];
  const card = (L, i, open, done, best) => {
    const b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (L.hardcore ? ' hardcore' : '') + (L.challenge ? ' challenge' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none');
    const chain = T.pics ? [2, 4, 8].map(v => picOf(v, T)).join('→') + '…' + picOf(L.goal, T) : '2→4→8…' + L.goal;
    b.innerHTML = '<span class="num">' + (L.challenge ? '★' : i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div><div class="chain">' + chain + '</div>' +
      '<div class="learn">' + L.n + ' × ' + L.n + ' · make ' + L.goal + (L.rocks ? ' · 🪨' : '') + '</div>' +
      '<div class="lives">' + (L.undo === Infinity ? '↶ undo any time' : L.undo ? '↶ ×' + L.undo : 'no undo') + (L.hardcore ? ' · ×3' : '') + '</div>' +
      '<div class="sub">' + (!open && (L.hardcore || L.challenge) ? '🔒 Beat Extreme to open' : L.blurb) + '</div>' + best;
    return b;
  };
  LEVELS.forEach((L, i) => {
    const open = canPlay(i), b = card(L, i, open, p.unlocked > i, bestHtml(p, i));
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Pass Hard to unlock Extreme!' : 'Pass the level before to unlock it'); return; } startGame(i); };
    box.appendChild(b);
  });
  const cb = chBest(), chOpen = p.unlocked >= 5, fam = chFamily();
  const famHtml = fam && fam.name !== S.player ? '<div class="best fam"><span>👑 family best: ' + UI.esc(fam.name) + ' ' + picOf(fam.tile, T) + ' ' + fam.tile + '</span></div>' : '';
  const b = card(CHALLENGE, -1, chOpen, cb && cb.tile >= CHALLENGE.goal, (cb ? '<div class="best"><span>🏆 ' + Number(cb.score).toLocaleString() + '</span><span>best ' + picOf(cb.tile, T) + ' ' + cb.tile + '</span></div>' : '<div class="best none">No score yet</div>') + famHtml);
  b.id = 'challenge-card';
  b.onclick = () => { if(!chOpen){ UISound.play('error'); UI.toast('Beat Extreme to open the 🏔️ Challenge'); return; } startGame('challenge'); };
  box.appendChild(b);
}

/* ================= GAME ================= */
if(window.matchMedia('(pointer:coarse)').matches || navigator.maxTouchPoints > 0 || 'ontouchstart' in window) document.body.classList.add('touch');
let CELL = 80, GAP = 10;
function startGame(lvl){ setTimeout(cheerMount, 0); /* 📣 cs-4a */
  hideResult(); clearInterval(timerId);
  const L = lvl === 'challenge' ? CHALLENGE : LEVELS[lvl], T = THEMES[theme];
  G = {lvl, L, theme, B: newBoard(L), score: 0, moves: 0, merges: 0, undos: L.undo, undosUsed: 0, hist: [], best: 0, won: false, over: false, busy: false,
    t0: performance.now(), paused: false, pausedAt: 0, pausedTotal: 0, els: {}};
  G.best = maxTile(G.B);
  const sp = $('scr-play'); sp.style.setProperty('--t1', T.bg[0]); sp.style.setProperty('--t2', T.bg[1]); sp.style.setProperty('--board', T.board); sp.classList.toggle('dark', !!T.dark);
  BAR.level(L.emoji + ' ' + L.name + ' · ' + T.icon, L.hardcore ? 'hc' : L.challenge ? 'ch' : '');
  $('undo-btn').classList.toggle('hidden', !L.undo); paintVoice();
  showScreen('play'); renderLadder(); layout(); hud(); requestAnimationFrame(() => { if(G) layout(); });
  timerId = setInterval(hud, 1000);
  const gname = T.names ? T.names[lg(L.goal) - 1] : '';
  showBanner('🎯 Make ' + (T.pics ? picOf(L.goal, T) + ' ' : '') + L.goal + '!', L.hardcore ? 'bad' : 'gold');
  say('Slide the tiles. Make ' + (gname ? 'the ' + gname + ', ' : '') + L.goal + '!');
}
function layout(){
  if(!G) return;
  const ar = $('arena'), n = G.B.n, side = getComputedStyle($('pad-side')).display !== 'none' ? $('pad-side').offsetWidth + 20 : 0;
  const room = Math.min(ar.clientWidth - 20 - side, ar.clientHeight - 12, 620);
  GAP = Math.max(6, Math.round(room * 0.025)); CELL = Math.floor((room - GAP * (n + 1)) / n);
  const b = $('board'), size = CELL * n + GAP * (n + 1); b.style.width = b.style.height = size + 'px';
  b.innerHTML = ''; G.els = {};
  for(let i = 0; i < n * n; i++){ const s = document.createElement('div'); s.className = G.B.c[i] === ROCK ? 'rock' : 'slot'; place(s, i); if(G.B.c[i] === ROCK) s.innerHTML = '<span style="font-size:' + Math.round(CELL * 0.55) + 'px">🪨</span>'; b.appendChild(s); }
  render(true);
}
window.addEventListener('resize', () => { if(G) layout(); });
function xy(i){ const n = G.B.n; return [GAP + (i % n) * (CELL + GAP), GAP + ((i / n) | 0) * (CELL + GAP)]; }
function place(el, i){ const [x, y] = xy(i); el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.width = el.style.height = CELL + 'px'; }
function tileHtml(t){
  const T = THEMES[G.theme], k = lg(t.v) - 1, col = T.col[Math.min(T.col.length - 1, k)];
  const fs = T.pics ? Math.round(CELL * 0.6) : Math.round(CELL * (t.v < 100 ? 0.48 : t.v < 1000 ? 0.4 : 0.32));
  const ink = T.pics ? '#fff' : (k < 2 ? '#776E65' : '#fff');
  return {bg: col, ink, html: '<div class="in"><span class="pic" style="font-size:' + fs + 'px">' + picOf(t.v, T) + '</span>' + (T.pics ? '<span class="num" style="font-size:' + Math.max(10, Math.round(CELL * 0.2)) + 'px">' + t.v + '</span>' : '') + '</div>'};
}
// Tiles are DOM elements keyed by id: slide = move with transform, merge = the two old ones slide in and a new one pops.
function render(instant, moved){
  const b = $('board'), seen = new Set();
  G.B.c.forEach((t, i) => {
    if(!t || t === ROCK) return; seen.add(t.id);
    let el = G.els[t.id];
    const [x, y] = xy(i);
    if(!el){
      el = document.createElement('div'); el.className = 'tile'; el.dataset.v = t.v; const h = tileHtml(t); el.style.background = h.bg; el.style.color = h.ink; el.innerHTML = h.html;
      el.style.width = el.style.height = CELL + 'px'; el.style.left = '0'; el.style.top = '0';
      if(t.merged && !instant){ el.classList.add('merged'); (t.from || []).forEach(fid => { const old = G.els[fid]; if(old){ old.style.transform = 'translate(' + x + 'px,' + y + 'px)'; old.style.zIndex = 1; setTimeout(() => old.remove(), 120); delete G.els[fid]; } }); }
      else if(t.isNew && !instant) el.classList.add('new');
      if(t.v >= 512) el.classList.add('big');
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)'; el.style.zIndex = 2;
      if(t.merged && !instant) el.style.transitionDelay = '0s';
      b.appendChild(el); G.els[t.id] = el;
      delete t.isNew; delete t.merged; delete t.from;
    } else el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  });
  Object.keys(G.els).forEach(id => { if(!seen.has(Number(id))){ const el = G.els[id]; setTimeout(() => el.remove(), 130); delete G.els[id]; } });
}
function move(dir){
  if(!G || G.over || G.paused || G.busy) return;
  const before = cloneB(G.B), res = slide(G.B, dir);
  if(!res.moved){ UISound.play('tap'); return; }
  if(G.L.undo){ G.hist.push({B: before, score: G.score, best: G.best}); if(G.hist.length > 30) G.hist.shift(); }
  G.moves++; G.score += res.gained; G.merges += res.merges.length;
  const added = addRandom(G.B);
  G.busy = true; setTimeout(() => { if(G) G.busy = false; }, 90);
  render(false, true);
  const T = THEMES[G.theme];
  if(res.merges.length){ UISound.play(res.best >= 64 ? 'success' : 'pop'); res.merges.forEach(m => { const el = G.els[m.id]; if(el && m.v >= 32) setTimeout(() => sparkle(el), 120); }); }
  else UISound.play('tap');
  if(res.best > G.best){ G.best = res.best; renderLadder(true); if(res.best >= 16) cheerSay(res.best >= 64 ? 'big' : 'goal', 'tile'); /* 📣 cs-4a */
    if(res.best >= 16){ const nm = T.names ? T.names[lg(res.best) - 1] : ''; showBanner('✨ New: ' + picOf(res.best) + (nm ? ' ' + nm : '') + ' (' + res.best + ')!', 'gold'); say((nm ? 'A ' + nm + '! ' : '') + res.best + '!'); } }
  hud();
  if(!G.won && G.best >= G.L.goal){ G.won = true; setTimeout(() => finishGame('goal'), 450); return; }
  if(!canMove(G.B)) setTimeout(() => finishGame('stuck'), 500);
}
function undo(){
  if(!G || G.over || !G.hist.length || G.undos <= 0) return;
  const h = G.hist.pop(); G.B = h.B; G.score = h.score; G.best = h.best; G.undos--; G.undosUsed++;
  UISound.play('pop'); layout(); renderLadder(); hud();
}
function renderLadder(bump){
  const T = THEMES[G.theme], top = lg(Math.max(G.L.goal, 2)), parts = [];
  for(let k = 1; k <= top; k++){ const v = Math.pow(2, k); parts.push('<span class="' + (v <= G.best ? 'got' : '') + (v === G.best ? ' top' : '') + (v === G.L.goal ? ' goal' : '') + '" title="' + v + '">' + (T.pics ? picOf(v, T) : (v === G.L.goal || v === G.best ? v : '·')) + '</span>'); if(k < top) parts.push('<i>›</i>'); }
  $('ladder').innerHTML = parts.join(''); $('goal-txt').textContent = '🎯';
  if(bump){ const el = $('ladder').querySelector('.top'); if(el) el.scrollIntoView({block: 'nearest', inline: 'center'}); }
}
// swipes on the whole play screen, arrow keys, on-screen arrows
let sw = null;
$('scr-play').addEventListener('pointerdown', e => { if(e.target.closest('button')) return; sw = {x: e.clientX, y: e.clientY}; });
$('scr-play').addEventListener('pointerup', e => { if(!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null; if(Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); });
$('scr-play').addEventListener('pointercancel', () => { sw = null; });
document.querySelectorAll('[data-dir]').forEach(b => b.addEventListener('click', () => move(b.dataset.dir)));
const KEYS = {ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down', A: 'left', D: 'right', W: 'up', S: 'down'};
document.addEventListener('keydown', e => {
  if(!G || G.over || $('scr-play').classList.contains('hidden') || !$('result').classList.contains('hidden')) return;
  if(KEYS[e.key]){ move(KEYS[e.key]); e.preventDefault(); }
  if(e.key === 'u' || e.key === 'U' || ((e.ctrlKey || e.metaKey) && e.key === 'z')){ undo(); e.preventDefault(); }
});
function elapsed(){ return G ? performance.now() - G.t0 - G.pausedTotal - (G.paused ? performance.now() - G.pausedAt : 0) : 0; }
function hud(){
  if(!G) return;
  BAR.score(G.score.toLocaleString()); BAR.count('moves', '👆', G.moves, 'Moves');
  const u = $('undo-btn'); u.textContent = '↶' + (G.L.undo === Infinity ? '' : ' ' + G.undos); u.disabled = !G.hist.length || G.undos <= 0;
  if(lockHandle){ const l = lockHandle.remainingMs(); BAR.left(l, l < 120000); }
}
function toggleVoice(){ voiceOn = !voiceOn; savePrefs(); paintVoice(); if(!voiceOn) try{ speechSynthesis.cancel(); }catch(e){} }
function pauseGame(){ if(G && !G.paused && !G.over){ G.paused = true; G.pausedAt = performance.now(); } }
function resume(){ if(G && G.paused && !G.over){ G.pausedTotal += performance.now() - G.pausedAt; G.paused = false; } }
function leavePlay(){
  if(!G || G.over){ backToMenu(); return; }
  pauseGame();
  UI.confirm({icon: '◀', title: 'Leave this game?', body: 'This game will not be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) backToMenu(); else resume(); });
}
function backToMenu(){ if(window.Cheer) Cheer.unmount(); clearInterval(timerId); try{ speechSynthesis.cancel(); }catch(e){} G = null; hideResult(); renderMenu(); showScreen('menu'); }

/* ================= FINISH ================= */
function finishGame(why){
  if(!G || G.over) return;
  G.over = true; clearInterval(timerId);
  const g = G, L = g.L, secs = Math.max(1, Math.round(elapsed() / 1000)), cleared = why === 'goal', T = THEMES[g.theme];
  if(L.hardcore) g.score *= 3;
  const stars = !cleared ? 0 : g.undosUsed === 0 ? 3 : g.undosUsed <= 3 ? 2 : 1;
  const stats = {merges: g.merges, bestTile: g.best, rounds: 1};
  if(L.challenge){
    // 🏔️ Challenge: kept on this device (best tile + score); not a level, so not sent as a level result.
    const cb = chLocal(); if(!cb || g.best > cb.tile || (g.best === cb.tile && g.score > cb.score)) try{ localStorage.setItem(chKey(), JSON.stringify({tile: g.best, score: g.score, at: Date.now()})); }catch(e){}
    if(g.score > 0) chSend({tile: g.best, score: g.score});
  } else if(g.score > 0) saveWin(S.player, g.lvl, {timeSec: secs, stars, score: g.score, theme: g.theme, cleared, stats});
  const nm = T.names ? T.names[lg(g.best) - 1] : '';
  cheerEnd(cleared); /* 📣 cs-4a */
  if(cleared){ const pr = pick(PRAISE); party('🎉 ' + pr + ', ' + S.player + '!'); say(pr + ', ' + S.player + '! You made ' + L.goal + '!'); confetti(['🔀', '⭐', '🎉', picOf(L.goal, T), picOf(L.goal / 2, T)], 40); UISound.play('success'); }
  else { UISound.play('pop'); say('No more moves! Your best was ' + (nm ? 'the ' + nm + ', ' : '') + g.best + '.'); }
  setTimeout(() => {
    if(G !== g) return;
    const next = cleared && !L.challenge && g.lvl < 5, cb = L.challenge ? chBest() : null;
    showResult('<div class="big">' + (cleared ? picOf(g.best, T) : '🔀') + '</div><h2 class="' + (cleared ? 'cheer' : '') + '">' + (cleared ? (L.challenge ? 'Challenge beaten!' : stars === 3 ? 'Perfect double up!' : 'Level passed!') : 'No more moves!') + '</h2>' +
      (cleared && !L.challenge ? '<div class="rating">' + [0, 1, 2].map(k => '<span class="st' + (k < stars ? '' : ' off') + '" style="animation-delay:' + (0.25 + k * 0.25) + 's">⭐</span>').join('') + '</div>' : '') +
      '<div class="score-big">🏆 <span id="score-count">0</span></div>' +
      '<div class="stats"><span>' + (T.pics ? picOf(g.best, T) + ' ' : '') + 'best ' + g.best + (nm ? ' (' + nm + ')' : '') + '</span><span>👆 ' + g.moves + ' slides</span><span>⏱ ' + fmt(secs * 1000) + '</span>' + (L.undo ? '<span>↶ ' + g.undosUsed + ' undo</span>' : '') + (L.hardcore ? '<span>💀 ×3</span>' : '') + '</div>' +
      (!cleared ? '<div class="tip">🎯 Make ' + L.goal + ' to pass. ' + pick(TIPS) + '</div>' : stars < 3 && !L.challenge ? '<div class="tip">⭐⭐⭐ = no undo. ' + pick(TIPS) + '</div>' : '') +
      '<div class="save-note" id="save-note">' + (L.challenge ? '🏔️ Your best challenge: ' + (cb ? picOf(cb.tile, T) + ' ' + cb.tile + ' · 🏆 ' + Number(cb.score).toLocaleString() : '—') + ' (saved for your family)' : g.score > 0 ? '<span class="ui-spin a-bounce">🔀</span> Saving your score…' : 'Not saved — join some tiles to get a score.') + '</div>' +
      '<div class="res-btns">' + (next ? '<button class="btn sp-btn sp-primary" id="b-next">' + (g.lvl === 4 ? '💀 Try Hardcore ▶' : 'Next level ▶') + '</button>' : '') + '<button class="btn sp-btn ' + (next ? 'soft sp-secondary' : 'sp-primary') + '\" id="b-again">🔁 Play again</button><button class="btn soft sp-btn sp-secondary" id="b-menu">🎚️ Levels</button></div>');
    countUp($('score-count'), g.score, 1000);
    $('b-again').onclick = () => startGame(g.lvl);
    $('b-menu').onclick = () => backToMenu();
    if($('b-next')) $('b-next').onclick = () => { const p = progressOf(S.player); p.unlocked = Math.max(p.unlocked, g.lvl + 1); S.progress[S.player] = p; startGame(g.lvl + 1); };
  }, cleared ? 1700 : 1000);
}
function party(text){ const p = document.createElement('div'); p.className = 'praise'; p.textContent = text; document.body.appendChild(p); setTimeout(() => p.remove(), 1600); }
function sparkle(el){ if(!el) return; const r = el.getBoundingClientRect(); for(let k = 0; k < 7; k++){ const s = document.createElement('div'); s.className = 'spark'; s.textContent = pick(['✨', '⭐', '💫']); const a = Math.random() * 6.28, d = 40 + Math.random() * 40; s.style.cssText = 'left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px;--dx:' + Math.cos(a) * d + 'px;--dy:' + Math.sin(a) * d + 'px'; document.body.appendChild(s); setTimeout(() => s.remove(), 850); } }
let bannerTimer = 0;
function showBanner(text, kind){ const b = $('banner'); b.textContent = text; b.classList.toggle('gold', kind === 'gold'); b.classList.toggle('bad', kind === 'bad'); b.classList.add('on'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 2000); }


/* ================= SAVE ================= */
const PENDING_KEY = 'sp_doubleup_pending';
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))).saveLevelResult(GAME_ID, w.name, w.lvl, w.extra)); }
function putNote(html){ const put = () => { const n = $('save-note'); if(n) n.innerHTML = html; return !!n; }; if(!put()) setTimeout(put, 1900); }
function saveWin(name, lvlIdx, extra, tries){
  tries = tries || 0;
  const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []});
  if(extra.cleared) p.unlocked = Math.max(p.unlocked, lvlIdx + 1);
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res.best) best[lvlIdx] = res.best;
      S.progress[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending(); putNote(saveText(res));
    }).withFailureHandler(err => {
      if(tries < 1){ setTimeout(() => saveWin(name, lvlIdx, extra, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl: lvlIdx, extra}])); putNote('⚠️ Could not save yet — it will be sent again next time.');
    }).saveLevelResult(GAME_ID, name, lvlIdx, extra);
}
function saveText(res){
  let h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : res.best && res.best.score ? 'Your best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Score saved';
  const fe = res.feats; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { h += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); }
  return h;
}
function countUp(el, to, ms){ if(!el) return; const t0 = performance.now(); (function tick(now){ const p = Math.max(0, Math.min(1, (now - t0) / ms)); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString(); if(p < 1) requestAnimationFrame(tick); })(t0); }
/* 📣 CHEERSQUAD (cs-4a) START — the crowd beside the board (CheerSquad.html, 📣 Cheer chat). Don't remove: the Cheer chat re-applies it. */
// solo: you = side 0, the 😈 rival = side 1. Fans stand only where the bar, goals, board and controls leave room.
function cheerTaken(){ return Array.from(document.querySelectorAll('#gbar, .top-btn, .goalrow, #board, #pad-side, #pad')); }
function cheerMount(){
  if(!window.Cheer || !G) return; Cheer.unmount(); const box = $('scr-play');
  Cheer.mount(box, {game: 'doubleup', players: [{name: S.player, side: 0, human: true}, {name: 'Rival', side: 1, human: false}], me: {name: S.player}, family: (S.players || []).map(p => p.Name), avatars: S.avatars || {}, mode: 'overlay',
    zones: () => Cheer.freeZones(box, cheerTaken), avoid: cheerTaken,
    clear: b => { const B = box.getBoundingClientRect(), F = $('board').getBoundingClientRect(), l = F.left - B.left, t = F.top - B.top; return !(b.r > l - 3 && b.l < l + F.width + 3 && b.b > t - 3 && b.t < t + F.height + 3); }});
}
// small wins get a 1.2 s breather so a cascade isn't a wall of cheers; big ones and the ends always play
function cheerSay(kind, why){ if(!kind || !window.Cheer || !Cheer.active() || !G) return; const now = performance.now();
  if(kind === 'goal' && (G.cheerAt || 0) > now - 1200) return; if(kind === 'big' && (G.cheerBig || 0) > now - 900) return;
  if(kind === 'goal') G.cheerAt = now; if(kind === 'big') G.cheerBig = now; Cheer.react(kind, {side: 0}); }
function cheerEnd(cleared){ if(window.Cheer && Cheer.active()) Cheer.react(cleared ? 'win' : 'lose', {side: 0}); }
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(!at) return; at.parentNode.insertBefore(c, at); at.parentNode.insertBefore(cap, at); }, 900); }
/* 📣 CHEERSQUAD END */
function showResult(html){ $('result-card').innerHTML = html; $('result').classList.remove('hidden'); cheerFaces(); /* 📣 cs-4a */ }
function hideResult(){ $('result').classList.add('hidden'); }
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pick(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 p1b: ◀ = where you came from (Gameroom if we don't know)

/* ================= BOOT ================= */
function boot(){
  UI.loading(GAME_ID);
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {}; S.challenge = d.challenge || {};
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();

/* ✨ MODE SPOTLIGHT (modes-3): ?mode=<id> opens this game straight in that mode after the player pick · "✨ Also try" on the start page · started modes → UI.modeTried */
const MS_GAME = 'double-up';
function msOpen(id){
  if(id !== 'challenge') return; const c = document.getElementById('challenge-card'); if(c){ if(c.scrollIntoView) c.scrollIntoView({block: 'center'}); c.click(); }
}
function msNow(){ return ''; }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startGame', x => x === 'challenge' ? 'challenge' : '');
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */
