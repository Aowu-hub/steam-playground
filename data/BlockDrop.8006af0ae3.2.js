
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[3]) || null;
const DURATION_MIN = Number(SP_TV[4]) || null;
const GAME_ID = 'block-drop';
// 🎛️ p1b: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 🧱 Block Drop · level | scoreboard | game buttons ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🧱', name: 'Block Drop', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ clearInterval(timerId); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { if(typeof pauseGame === 'function') pauseGame(); }, resume: () => { if(typeof resume === 'function') resume(); }},
  onFit: () => { if(G && typeof layout === 'function') layout(); },
  extras: [{id: 'pause-btn', icon: '⏸', label: 'Pause (P)', onClick: () => togglePause(), keep: true},
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
// w × h board, drop = ms per row at the start (faster every 10 rows), goal = rows to clear, pieces = which shapes,
// saves = 🛟 rescues when the stack reaches the top, ghost / hold on or off, par = seconds for 3 stars.
const LEVELS = [
  {name: 'Basic', emoji: '🌱', w: 8, h: 14, drop: 1000, goal: 10, pieces: 'IOTLJ', saves: 2, ghost: true, hold: true, par: 240, blurb: 'Small board · slow · 10 rows'},
  {name: 'Junior', emoji: '🐣', w: 9, h: 16, drop: 850, goal: 15, pieces: 'IOTLJSZ', saves: 2, ghost: true, hold: true, par: 330, blurb: 'All 7 shapes · 15 rows'},
  {name: 'Intermediate', emoji: '🔦', w: 10, h: 20, drop: 700, goal: 20, pieces: 'IOTLJSZ', saves: 1, ghost: true, hold: true, par: 420, blurb: 'Full board · 20 rows'},
  {name: 'Hard', emoji: '⚡', w: 10, h: 20, drop: 480, goal: 25, pieces: 'IOTLJSZ', saves: 0, ghost: true, hold: true, par: 480, blurb: 'Fast · 25 rows · no saves'},
  {name: 'Extreme', emoji: '🌋', w: 10, h: 20, drop: 300, goal: 30, pieces: 'IOTLJSZ', saves: 0, ghost: false, hold: true, par: 540, blurb: 'Very fast · no ghost · 30 rows'},
  {name: 'Hardcore', emoji: '💀', w: 10, h: 20, drop: 190, goal: 40, pieces: 'IOTLJSZ', saves: 0, ghost: false, hold: false, par: 660, hardcore: true, blurb: 'Fastest · no ghost, no hold · 40 rows · ×3'}
];
const SHAPES = {
  I: [[0, 1], [1, 1], [2, 1], [3, 1]], O: [[1, 0], [2, 0], [1, 1], [2, 1]], T: [[1, 0], [0, 1], [1, 1], [2, 1]],
  L: [[2, 0], [0, 1], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]]
};
const PIECE_KEYS = 'IOTLJSZ';
// Each theme: 7 colours (I O T L J S Z), a look for every block, and what happens when a row clears.
const THEMES = {
  classic: {name: 'Classic', icon: '🟦', syms: ['🟦', '🟨', '🟪', '🟧'], col: ['#3FD0E0', '#FFD23F', '#A06CF5', '#FF8A3D', '#3D8BFD', '#4CB963', '#FF5A5F'], bg: ['#141B33', '#2B3A6B'], look: 'classic', clear: 'flash'},
  faces:   {name: 'Face blocks', icon: '😊', syms: ['😊', '😮', '😄', '😉'], col: ['#5ED6E8', '#FFD94F', '#B98CFF', '#FF9E57', '#5C9DFF', '#62CC77', '#FF6F73'], bg: ['#2A1F5C', '#6A4BD8'], look: 'face', clear: 'cheer'},
  dino:    {name: 'Dinosaur', icon: '🦖', syms: ['🦖', '🦕', '🥚', '🌋'], col: ['#6DBE45', '#C9D84A', '#3E9B5A', '#D4A64A', '#2E7D5B', '#8BC34A', '#C0763E'], bg: ['#2E1B0E', '#7A4A1D'], look: 'dino', clear: 'bite'},
  cargo:   {name: 'Space cargo', icon: '📦', syms: ['📦', '🚀', '🛰️', '⭐'], col: ['#7FB3D5', '#F7DC6F', '#C39BD3', '#E0A458', '#5D8AA8', '#82E0AA', '#F1948A'], bg: ['#03040F', '#16204F'], look: 'cargo', clear: 'launch', stars: true},
  fantasy: {name: 'Fantasy', icon: '🔮', syms: ['💎', '🔮', '✨', '🦄'], col: ['#7AE7FF', '#FFD36E', '#B57CFF', '#FF9D6E', '#8FA8FF', '#7DFFB2', '#FF7AD9'], bg: ['#2B0E3F', '#7B2C8F'], look: 'gem', clear: 'pop'},
  jigsaw:  {name: 'Jigsaw puzzle', icon: '🧩', syms: ['🧩', '🧩', '🧩', '🧩'], col: ['#A8DADC', '#E9C46A', '#B5838D', '#F4A261', '#7FA7D6', '#8AB17D', '#E76F51'], bg: ['#3B2F2A', '#7A5C4A'], look: 'jigsaw', clear: 'scatter'}
};
const THEME_KEYS = Object.keys(THEMES);
const AGE_START = {'4-5': 0, '6-7': 1, '8-9': 2, '10+': 3};
const PRAISE = ['Block boss', 'Row wrecker', 'Super stacker', 'Brilliant', 'Amazing'];
const TIPS = [
  'Tip: keep the stack flat — leave one gap at the side for a long ⬛⬛⬛⬛ block.',
  'Tip: use 📥 Hold to save a long block for later.',
  'Tip: look at NEXT — plan where the next block goes.',
  'Tip: turn the block before it gets low, then slide it.'
];
const CLEAR_WORDS = ['', 'Row!', 'Double!', 'Triple!', 'BLOCK BLAST!'];

let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: ''};
let G = null, theme = 'classic', timerId = 0, lockHandle = null, raf = 0;
window.feedbackContext = () => ({page: 'Block Drop', game: GAME_ID, level: G ? LEVELS[G.lvl].name + ' · ' + THEMES[G.theme].name : ''});
function prefKey(){ return 'sp_blockdrop_prefs:' + S.player; }
function loadPrefs(){ try{ const p = JSON.parse(localStorage.getItem(prefKey()) || '{}'); if(THEMES[p.theme]) theme = p.theme; if(p.voice === false) voiceOn = false; }catch(e){} }
function savePrefs(){ try{ localStorage.setItem(prefKey(), JSON.stringify({theme, voice: voiceOn})); }catch(e){} }
function myAvatar(name){ return (S.avatars && S.avatars[name]) || defaultAvatar(name); }

/* ================= ENGINE ================= */
// Board: grid[y][x] = null | {c: colour index, p: piece number (for jigsaw edges + faces)}. Piece = {k, x, y, r, cells}.
function cellsOf(k, r){
  let cs = SHAPES[k].map(c => c.slice()); if(k === 'O') return cs;
  const n = k === 'I' ? 4 : 3;
  for(let i = 0; i < r; i++) cs = cs.map(([x, y]) => [n - 1 - y, x]);   // turn clockwise inside its box
  return cs;
}
function fits(grid, k, r, px, py){
  const h = grid.length, w = grid[0].length;
  return cellsOf(k, r).every(([x, y]) => { const X = px + x, Y = py + y; return X >= 0 && X < w && Y < h && (Y < 0 || !grid[Y][X]); });
}
function newGrid(w, h){ return Array.from({length: h}, () => new Array(w).fill(null)); }
function bag(L){ return shuffle(L.pieces.split('')); }
function nextKind(){ if(G.queue.length < 6) G.queue = G.queue.concat(bag(G.L)); return G.queue.shift(); }
function spawn(k){
  const w = G.L.w, n = k === 'I' ? 4 : 3;
  G.cur = {k, r: 0, x: Math.floor((w - n) / 2), y: k === 'I' ? -1 : 0, id: ++G.pieceId};
  G.lockAt = 0; G.lockMoves = 0; G.fallAcc = 0;
  if(!fits(G.grid, k, 0, G.cur.x, G.cur.y)){ topOut(); return false; }
  return true;
}
function tryMove(dx, dy){
  const c = G.cur; if(!c) return false;
  if(fits(G.grid, c.k, c.r, c.x + dx, c.y + dy)){ c.x += dx; c.y += dy; if(dx && G.lockAt && G.lockMoves < 15){ G.lockAt = performance.now() + 500; G.lockMoves++; } return true; }
  return false;
}
function tryRotate(dir){
  const c = G.cur; if(!c || c.k === 'O') return false;
  const r = (c.r + (dir > 0 ? 1 : 3)) % 4;
  for(const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0], [0, 1]]){
    if(fits(G.grid, c.k, r, c.x + dx, c.y + dy)){ c.r = r; c.x += dx; c.y += dy; if(G.lockAt && G.lockMoves < 15){ G.lockAt = performance.now() + 500; G.lockMoves++; } return true; }
  }
  return false;
}
function ghostY(){ const c = G.cur; let y = c.y; while(fits(G.grid, c.k, c.r, c.x, y + 1)) y++; return y; }
function lockPiece(){
  const c = G.cur, ci = PIECE_KEYS.indexOf(c.k);
  cellsOf(c.k, c.r).forEach(([x, y]) => { const Y = c.y + y; if(Y >= 0) G.grid[Y][c.x + x] = {c: ci, p: c.id, t: performance.now()}; });
  const above = cellsOf(c.k, c.r).some(([x, y]) => c.y + y < 0);
  G.cur = null; G.pieces++; UISound.play('tap');
  const full = []; G.grid.forEach((row, y) => { if(row.every(Boolean)) full.push(y); });
  if(full.length){ G.clearing = {rows: full, t0: performance.now(), dur: THEMES[G.theme].clear === 'bite' ? 620 : 460}; onClear(full.length); }
  else if(above){ topOut(); }
  else nextPiece();
}
function finishClear(){
  const rows = G.clearing.rows; G.clearing = null;
  G.grid = G.grid.filter((row, y) => !rows.includes(y));
  while(G.grid.length < G.L.h) G.grid.unshift(new Array(G.L.w).fill(null));
  if(G.lines >= G.L.goal){ finishGame('goal'); return; }
  nextPiece();
}
function nextPiece(){ G.heldThisTurn = false; spawn(nextKind()); drawSide(); }
function onClear(n){
  const L = G.L, T = THEMES[G.theme];
  G.lines += n; if(n === 4) G.quads++; cheerSay(n >= 4 ? 'big' : n ? 'goal' : '', 'rows'); /* 📣 cs-4a */
  const pts = [0, 100, 300, 500, 800][n] * (G.lvl + 1) * (G.b2b && n === 4 ? 1.5 : 1);
  G.b2b = n === 4; G.score += Math.round(pts);
  // speed up every 10 rows
  G.dropMs = Math.max(L.hardcore ? 90 : 120, Math.round(L.drop * Math.pow(0.86, Math.floor(G.lines / 10))));
  UISound.play(n >= 3 ? 'success' : 'pop');
  if(n >= 2) showBanner((n === 4 ? '💥 ' : '✨ ') + CLEAR_WORDS[n] + ' +' + Math.round(pts).toLocaleString(), 'gold');
  if(n === 4) say('Block blast!'); else if(n >= 2) say(CLEAR_WORDS[n]);
  if(G.lines >= L.goal) say('You did it!');
  hud();
}
function hardDrop(){
  if(!G.cur || G.clearing || G.over || G.paused) return;
  const y = ghostY(), d = y - G.cur.y; G.cur.y = y; G.score += d * 2; G.drops++;
  G.dropFx = {x: G.cur.x, k: G.cur.k, r: G.cur.r, y, d, t0: performance.now()};
  lockPiece(); hud();
}
function softDrop(){ if(!G.cur || G.clearing || G.over || G.paused) return; if(tryMove(0, 1)){ G.score += 1; G.fallAcc = 0; } else if(!G.lockAt) G.lockAt = performance.now() + 500; }
function holdPiece(){
  if(!G || !G.cur || G.clearing || G.over || G.paused || !G.L.hold || G.heldThisTurn) return;
  const k = G.cur.k; G.heldThisTurn = true; UISound.play('pop');
  if(G.hold){ const h = G.hold; G.hold = k; spawn(h); G.heldThisTurn = true; } else { G.hold = k; spawn(nextKind()); G.heldThisTurn = true; }
  drawSide();
}
function topOut(){
  G.cur = null;
  if(G.saves > 0){
    G.saves--; G.savesUsed++; cheerSay('close'); /* 📣 cs-4a */
    // 🛟 rescue: the bottom half of the stack disappears and the rest drops down
    const half = Math.floor(G.L.h / 2); G.grid = newGrid(G.L.w, G.L.h - half).concat(G.grid.slice(0, half));
    showBanner('🛟 Saved! ' + (G.saves ? G.saves + ' save left' : 'No saves left — careful!'), 'bad'); say('Saved! Keep going!'); UISound.play('error');
    setTimeout(() => { if(G && !G.over) nextPiece(); }, 500); hud(); return;
  }
  finishGame('topout');
}

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
}
function changePlayer(){ renderPlayers(); showScreen('player'); }

// Theme row: built once per menu visit, a tap only moves the highlight (no page jump).
function renderMenu(){
  $('theme-list').innerHTML = THEME_KEYS.map(k => '<button class="chip' + (k === theme ? ' on' : '') + '" data-sound="pop" data-theme-key="' + k + '"><span class="ic">' + THEMES[k].syms.slice(0, 4).join('') + '</span>' + THEMES[k].name + '</button>').join('');
  $('theme-list').querySelectorAll('[data-theme-key]').forEach(b => b.onclick = () => { theme = b.dataset.themeKey; savePrefs(); $('theme-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); });
  renderLevels();
}

function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No score yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span>' + (b.timeSec ? '<span>⏱ ' + fmt(b.timeSec * 1000) + '</span>' : '') + '<span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }

function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; if(window.UI && UI.leaders) UI.leaders($('leaders'), GAME_ID, S.player);
  const p = progressOf(S.player), rec = AGE_START[S.age], T = THEMES[theme];
  LEVELS.forEach((L, i) => {
    const open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (L.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none');
    const k = L.pieces[i % L.pieces.length], cells = new Set(SHAPES[k].map(([x, y]) => y * 4 + x)), col = T.col[PIECE_KEYS.indexOf(k)];
    const tetro = '<div class="tetro">' + Array.from({length: 8}, (_, n) => '<i style="background:' + (cells.has(n) ? col : 'transparent') + '"></i>').join('') + '</div>';
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div>' + tetro +
      '<div class="learn">' + L.w + ' × ' + L.h + ' · clear ' + L.goal + ' rows</div>' +
      '<div class="lives">' + (L.saves ? '🛟 ×' + L.saves + ' · ' : '') + (L.ghost ? '👻' : 'no 👻') + (L.hold ? ' · 📥' : '') + '</div>' +
      '<div class="sub">' + (L.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : L.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Pass Hard to unlock Extreme!' : 'Pass the level before to unlock it'); return; } startGame(i); };
    box.appendChild(b);
  });
}

/* ================= GAME ================= */
const cv = $('cv'), ctx = cv.getContext('2d');
let CS = 28, DPR = 1;
const STARS = Array.from({length: 60}, () => [Math.random(), Math.random(), Math.random()]);
// Touch screens get the on-screen pad (a computer with a mouse gets the key reminder).
if(window.matchMedia('(pointer:coarse)').matches || navigator.maxTouchPoints > 0 || 'ontouchstart' in window) document.body.classList.add('touch');
function startGame(lvl){ setTimeout(cheerMount, 0); /* 📣 cs-4a */
  hideResult(); cancelAnimationFrame(raf); clearInterval(timerId);
  const L = LEVELS[lvl], T = THEMES[theme];
  G = {lvl, L, theme, grid: newGrid(L.w, L.h), queue: [], cur: null, hold: null, heldThisTurn: false, pieceId: 0, score: 0, lines: 0, quads: 0, pieces: 0, drops: 0,
    saves: L.saves, savesUsed: 0, dropMs: L.drop, fallAcc: 0, lockAt: 0, lockMoves: 0, clearing: null, b2b: false, dropFx: null,
    over: false, t0: performance.now(), last: performance.now(), paused: false, pausedAt: 0, pausedTotal: 0};
  const sp = $('scr-play'); sp.style.setProperty('--t1', T.bg[0]); sp.style.setProperty('--t2', T.bg[1]);
  BAR.level(L.emoji + ' ' + L.name + ' · ' + T.icon, L.hardcore ? 'hc' : '');
  $('hold-box').classList.toggle('off', !L.hold); document.querySelectorAll('[data-act="hold"]').forEach(b => b.classList.toggle('hidden', !L.hold));
  paintVoice(); $('paused').classList.add('hidden');
  showScreen('play'); layout(); nextPiece(); hud(); requestAnimationFrame(() => { if(G) layout(); });
  raf = requestAnimationFrame(loop);
  timerId = setInterval(hud, 500);
  showBanner(L.hardcore ? '💀 Hardcore: 40 rows, no ghost, no hold!' : 'Clear ' + L.goal + ' rows!', L.hardcore ? 'bad' : 'gold');
  say(L.hardcore ? 'Hardcore! Clear forty rows.' : 'Clear ' + L.goal + ' rows!');
}
// Board as tall as the screen allows; next/hold beside it; touch pad under it (or at the sides on phones held sideways).
function layout(){
  if(!G) return;
  const area = $('play-area'), L = G.L;
  G.row = getComputedStyle(area).display === 'grid';   // phone upright: next / hold above the board
  DPR = Math.min(2, window.devicePixelRatio || 1);
  const m = G.row ? 11 : Math.max(10, Math.min(18, Math.floor(Math.min(area.clientHeight / L.h, 40) * 0.6)));
  const nc = $('next-cv'), hc = $('hold-cv'), nw = G.row ? m * 12 : m * 4, nh = G.row ? m * 3 : m * 9;
  nc.width = nw * DPR; nc.height = nh * DPR; nc.style.width = nw + 'px'; nc.style.height = nh + 'px';
  hc.width = m * 4 * DPR; hc.height = m * 3 * DPR; hc.style.width = m * 4 + 'px'; hc.style.height = m * 3 + 'px';
  G.m = m;
  const W = area.clientWidth, H = area.clientHeight - (G.row ? 4 + Math.max($('side-l').offsetHeight, $('side-r').offsetHeight) + 6 : 8);   // p1b: 4 px margin upright
  const sideW = G.row ? 16 : $('side-l').offsetWidth + $('side-r').offsetWidth + (getComputedStyle($('pad-l')).display !== 'none' ? $('pad-l').offsetWidth + $('pad-r').offsetWidth + 16 : 0) + 34;
  CS = Math.max(12, Math.floor(Math.min(H / L.h, (W - sideW) / L.w)));
  cv.width = Math.round(CS * L.w * DPR); cv.height = Math.round(CS * L.h * DPR); cv.style.width = CS * L.w + 'px'; cv.style.height = CS * L.h + 'px';
  drawSide();
}
window.addEventListener('resize', () => { if(G) layout(); });
function loop(now){
  if(!G) return;
  raf = requestAnimationFrame(loop);
  const dt = Math.min(100, now - G.last); G.last = now;
  if(!G.over && !G.paused){
    if(G.clearing){ if(now - G.clearing.t0 >= G.clearing.dur) finishClear(); }
    else if(G.cur){
      repeatKeys(now);
      G.fallAcc += dt;
      if(G.fallAcc >= G.dropMs){ G.fallAcc = 0; if(!tryMove(0, 1)){ if(!G.lockAt) G.lockAt = now + 500; } else G.lockAt = 0; }
      if(G.lockAt && now >= G.lockAt){ if(!fits(G.grid, G.cur.k, G.cur.r, G.cur.x, G.cur.y + 1)) lockPiece(); else G.lockAt = 0; }
    }
  }
  draw(now);
}

/* ---------- drawing ---------- */
function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const SPR = {};
function sprite(ch, px){ const key = ch + '|' + px; if(SPR[key]) return SPR[key]; const c = document.createElement('canvas'); c.width = c.height = Math.ceil(px * 1.3); const g = c.getContext('2d'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.font = px + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.fillText(ch, c.width / 2, c.height / 2 + px * 0.06); SPR[key] = c; return c; }
// One block in the theme's look. nb = which neighbours belong to the same piece (for jigsaw knobs), mood = face mood.
function drawBlock(g, x, y, s, ci, look, opt){
  const T = THEMES[G ? G.theme : theme], col = T.col[ci], o = opt || {};
  g.save();
  if(o.alpha != null) g.globalAlpha = o.alpha;
  if(look === 'ghost'){ g.strokeStyle = col; g.lineWidth = Math.max(2, s * 0.08); g.setLineDash([s * 0.18, s * 0.12]); rr(g, x + s * 0.1, y + s * 0.1, s * 0.8, s * 0.8, s * 0.16); g.stroke(); g.fillStyle = col; g.globalAlpha = 0.15; g.fill(); g.restore(); return; }
  if(look === 'jigsaw'){
    g.fillStyle = col; g.fillRect(x, y, s, s);
    const nb = o.nb || {};
    g.strokeStyle = shade(col, 0.55); g.lineWidth = Math.max(1.5, s * 0.07);
    if(!nb.r) { g.beginPath(); g.moveTo(x + s, y); g.lineTo(x + s, y + s); g.stroke(); } if(!nb.d){ g.beginPath(); g.moveTo(x, y + s); g.lineTo(x + s, y + s); g.stroke(); }
    if(!nb.l) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + s); g.stroke(); } if(!nb.u){ g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y); g.stroke(); }
    // holes on the outside edges = darker half-moons, so pieces look cut out of a puzzle
    g.fillStyle = shade(col, 0.72); if(!nb.r && ((x / s + y / s) | 0) % 2){ g.beginPath(); g.arc(x + s, y + s / 2, s * 0.13, Math.PI / 2, Math.PI * 1.5); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + s * 0.12, y + s * 0.1, s * 0.5, s * 0.1);
    g.restore(); return;
  }
  const pad = s * 0.05;
  const gr = g.createLinearGradient(x, y, x, y + s); gr.addColorStop(0, shade(col, 1.15)); gr.addColorStop(1, shade(col, 0.82)); g.fillStyle = gr;
  rr(g, x + pad, y + pad, s - pad * 2, s - pad * 2, look === 'gem' ? s * 0.28 : s * 0.16); g.fill();
  if(look === 'classic' || look === 'face'){ g.fillStyle = 'rgba(255,255,255,0.32)'; rr(g, x + pad * 2.5, y + pad * 2, s - pad * 5, s * 0.2, s * 0.08); g.fill(); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x + pad, y + s * 0.82, s - pad * 2, s * 0.13); }
  if(look === 'face'){
    const now = o.now || 0, blink = ((now / 1000 + (o.p || 0) * 0.37) % 4) < 0.12, ey = y + s * 0.42, look2 = o.falling ? s * 0.05 : 0;
    g.fillStyle = '#fff'; [0.32, 0.68].forEach(fx => { g.beginPath(); g.ellipse(x + s * fx, ey, s * 0.11, blink ? s * 0.02 : s * 0.12, 0, 0, Math.PI * 2); g.fill(); });
    if(!blink){ g.fillStyle = '#1E2346'; [0.32, 0.68].forEach(fx => { g.beginPath(); g.arc(x + s * fx, ey + s * 0.03 + look2, s * 0.055, 0, Math.PI * 2); g.fill(); }); }
    g.strokeStyle = '#1E2346'; g.lineWidth = Math.max(1.5, s * 0.06); g.beginPath();
    if(o.mood === 'yay'){ g.fillStyle = '#7A1F2B'; g.arc(x + s / 2, y + s * 0.64, s * 0.14, 0, Math.PI); g.fill(); }
    else if(o.falling){ g.arc(x + s / 2, y + s * 0.7, s * 0.07, 0, Math.PI * 2); g.stroke(); }
    else { g.arc(x + s / 2, y + s * 0.6, s * 0.14, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
    g.fillStyle = 'rgba(255,120,150,0.45)'; [0.2, 0.8].forEach(fx => { g.beginPath(); g.arc(x + s * fx, y + s * 0.62, s * 0.07, 0, Math.PI * 2); g.fill(); });
  }
  if(look === 'dino'){
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = Math.max(1, s * 0.05);
    for(let k = 0; k < 2; k++) for(let m = 0; m < 2; m++){ g.beginPath(); g.arc(x + s * (0.3 + m * 0.4), y + s * (0.32 + k * 0.38), s * 0.13, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); }
    if(o.top){ g.fillStyle = shade(col, 0.7); g.beginPath(); g.moveTo(x + s * 0.2, y + pad); g.lineTo(x + s * 0.35, y - s * 0.18); g.lineTo(x + s * 0.5, y + pad); g.lineTo(x + s * 0.65, y - s * 0.18); g.lineTo(x + s * 0.8, y + pad); g.fill(); }
  }
  if(look === 'cargo'){
    g.strokeStyle = shade(col, 0.6); g.lineWidth = Math.max(1.5, s * 0.07); rr(g, x + pad * 2.5, y + pad * 2.5, s - pad * 5, s - pad * 5, s * 0.08); g.stroke();
    g.save(); rr(g, x + pad * 2.5, y + pad * 2.5, s - pad * 5, s - pad * 5, s * 0.08); g.clip(); g.fillStyle = 'rgba(30,30,40,0.35)';
    for(let k = -2; k < 3; k++){ g.beginPath(); g.moveTo(x + k * s * 0.3, y + s); g.lineTo(x + k * s * 0.3 + s * 0.12, y + s); g.lineTo(x + k * s * 0.3 + s * 0.12 + s, y); g.lineTo(x + k * s * 0.3 + s, y); g.fill(); }
    g.restore(); g.fillStyle = 'rgba(255,255,255,0.7)'; [[0.18, 0.18], [0.82, 0.18], [0.18, 0.82], [0.82, 0.82]].forEach(([a, b]) => { g.beginPath(); g.arc(x + s * a, y + s * b, s * 0.035, 0, Math.PI * 2); g.fill(); });
  }
  if(look === 'gem'){
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = Math.max(1, s * 0.04); g.beginPath(); g.moveTo(x + s * 0.5, y + pad * 2); g.lineTo(x + s - pad * 2, y + s * 0.5); g.lineTo(x + s * 0.5, y + s - pad * 2); g.lineTo(x + pad * 2, y + s * 0.5); g.closePath(); g.stroke();
    const tw = Math.sin(((o.now || 0) / 300) + (o.p || 0)); if(tw > 0.85){ g.drawImage(sprite('✨', Math.round(s * 0.36)), x + s * 0.55, y, s * 0.42, s * 0.42); }
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(x + s * 0.35, y + s * 0.3, s * 0.14, s * 0.08, -0.6, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}
// Jigsaw: thin cut lines with a round knob between the squares of the same piece (drawn after all blocks so nothing covers them).
function jigsawCuts(g, x, y, s, nb, col){
  g.save(); g.strokeStyle = shade(col, 0.68); g.lineWidth = Math.max(1, s * 0.045); const flip = ((x / s + y / s) | 0) % 2 ? 1 : -1;
  if(nb.r){ g.beginPath(); g.moveTo(x + s, y); g.lineTo(x + s, y + s * 0.36); g.arc(x + s + flip * s * 0.1, y + s * 0.5, s * 0.15, -Math.PI / 2 - flip * 0.9, Math.PI / 2 + flip * 0.9, flip < 0); g.lineTo(x + s, y + s); g.stroke(); }
  if(nb.d){ g.beginPath(); g.moveTo(x, y + s); g.lineTo(x + s * 0.36, y + s); g.arc(x + s * 0.5, y + s - flip * s * 0.1, s * 0.15, Math.PI + flip * 0.9 * 0, 0, flip > 0); g.lineTo(x + s, y + s); g.stroke(); }
  g.restore();
}
function neighboursOf(grid, x, y){ const p = grid[y][x].p, same = (X, Y) => Y >= 0 && Y < grid.length && X >= 0 && X < grid[0].length && grid[Y][X] && grid[Y][X].p === p; return {r: same(x + 1, y), d: same(x, y + 1), l: same(x - 1, y), u: same(x, y - 1)}; }
function draw(now){
  const L = G.L, T = THEMES[G.theme], g = ctx, s = CS, W = L.w * s, H = L.h * s;
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, H);
  if(T.stars){ STARS.forEach(([a, b, c]) => { g.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.5 * Math.abs(Math.sin(now / 900 + c * 9))) + ')'; g.fillRect(a * W, b * H, 1.6, 1.6); }); }
  g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 1;
  for(let x = 1; x < L.w; x++){ g.beginPath(); g.moveTo(x * s, 0); g.lineTo(x * s, H); g.stroke(); }
  for(let y = 1; y < L.h; y++){ g.beginPath(); g.moveTo(0, y * s); g.lineTo(W, y * s); g.stroke(); }
  const cl = G.clearing, ct = cl ? (now - cl.t0) / cl.dur : 0;
  // the stack
  for(let y = 0; y < L.h; y++) for(let x = 0; x < L.w; x++){
    const c = G.grid[y][x]; if(!c) continue;
    const clearing = cl && cl.rows.includes(y);
    if(clearing){ drawClearing(g, x, y, s, c, ct, now, T); continue; }
    const top = T.look === 'dino' && (y === 0 || !G.grid[y - 1][x]);
    drawBlock(g, x * s, y * s, s, c.c, T.look, {nb: T.look === 'jigsaw' ? neighboursOf(G.grid, x, y) : null, now, p: c.p, top, mood: cl ? 'yay' : ''});
  }
  if(T.look === 'jigsaw') for(let y = 0; y < L.h; y++) for(let x = 0; x < L.w; x++){ const c = G.grid[y][x]; if(c && !(cl && cl.rows.includes(y))){ const nb = neighboursOf(G.grid, x, y); jigsawCuts(g, x * s, y * s, s, nb, T.col[c.c]); } }
  if(cl && T.clear === 'bite'){ cl.rows.forEach(y => { const hx = ct * (W + s * 2) - s; g.drawImage(sprite(ct % 0.2 < 0.1 ? '🦖' : '🦕', Math.round(s * 1.1)), hx - s * 0.2, y * s - s * 0.25, s * 1.4, s * 1.4); }); }
  // ghost + falling piece
  const c = G.cur;
  if(c && !G.over){
    const cells = cellsOf(c.k, c.r), ci = PIECE_KEYS.indexOf(c.k);
    if(L.ghost){ const gy = ghostY(); if(gy !== c.y) cells.forEach(([x, y]) => { if(gy + y >= 0) drawBlock(g, (c.x + x) * s, (gy + y) * s, s, ci, 'ghost'); }); }
    const set = new Set(cells.map(([x, y]) => x + ',' + y));
    cells.forEach(([x, y]) => { if(c.y + y < 0) return;
      const nb = {r: set.has((x + 1) + ',' + y), d: set.has(x + ',' + (y + 1)), l: set.has((x - 1) + ',' + y), u: set.has(x + ',' + (y - 1))};
      drawBlock(g, (c.x + x) * s, (c.y + y) * s, s, ci, T.look, {nb, now, p: c.id, falling: true, top: T.look === 'dino' && !nb.u}); });
    if(T.look === 'jigsaw') cells.forEach(([x, y]) => { if(c.y + y >= 0) jigsawCuts(g, (c.x + x) * s, (c.y + y) * s, s, {r: set.has((x + 1) + ',' + y), d: set.has(x + ',' + (y + 1))}, T.col[ci]); });
  }
  // hard-drop streak
  if(G.dropFx){ const f = G.dropFx, t = (now - f.t0) / 220; if(t > 1) G.dropFx = null; else { g.fillStyle = 'rgba(255,255,255,' + (0.35 * (1 - t)) + ')'; const xs = cellsOf(f.k, f.r).map(([x]) => f.x + x); const mn = Math.min(...xs), mx = Math.max(...xs); g.fillRect(mn * s, (f.y - f.d) * s, (mx - mn + 1) * s, f.d * s); } }
}
// Each theme's own row-clear animation.
function drawClearing(g, x, y, s, c, t, now, T){
  const px = x * s, py = y * s;
  if(T.clear === 'flash'){ if(t < 0.5){ drawBlock(g, px, py, s, c.c, T.look, {}); g.fillStyle = 'rgba(255,255,255,' + (t * 1.6) + ')'; g.fillRect(px, py, s, s); } else { const k = 1 - (t - 0.5) * 2; g.fillStyle = 'rgba(255,255,255,' + k + ')'; g.fillRect(px + s * (1 - k) / 2, py + s * (1 - k) / 2, s * k, s * k); } return; }
  if(T.clear === 'cheer'){ const hop = Math.sin(Math.min(1, t * 1.4) * Math.PI) * s * 0.5; g.save(); g.globalAlpha = t > 0.7 ? (1 - t) / 0.3 : 1; drawBlock(g, px, py - hop, s, c.c, 'face', {mood: 'yay', now, p: c.p}); g.restore(); if(t > 0.6 && x % 3 === 0) g.drawImage(sprite('🎉', Math.round(s * 0.5)), px, py - s * 0.6, s * 0.6, s * 0.6); return; }
  if(T.clear === 'bite'){ const W = G.L.w * s, hx = t * (W + s * 2) - s; if(px + s > hx) drawBlock(g, px, py, s, c.c, T.look, {}); else if(px + s > hx - s * 0.6){ g.fillStyle = '#F2E3C6'; g.beginPath(); g.arc(px + s / 2, py + s / 2, s * 0.15, 0, Math.PI * 2); g.fill(); } return; }
  if(T.clear === 'launch'){ const up = t * t * s * 6, sc = 1 - t * 0.5; g.save(); g.globalAlpha = 1 - t; drawBlock(g, px + s * (1 - sc) / 2, py - up, s * sc, c.c, T.look, {}); g.drawImage(sprite('🔥', Math.round(s * 0.45)), px + s * 0.25, py - up + s * sc, s * 0.5, s * 0.5); g.restore(); return; }
  if(T.clear === 'pop'){ if(t < 0.35){ drawBlock(g, px, py, s, c.c, T.look, {now, p: c.p}); return; } const k = (t - 0.35) / 0.65; g.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(px + s / 2, py + s / 2, s * (0.3 + k * 0.6), 0, Math.PI * 2); g.stroke(); if(x % 2 === 0) g.drawImage(sprite('✨', Math.round(s * 0.5)), px + Math.sin(x) * s * k, py - k * s, s * 0.55, s * 0.55); return; }
  if(T.clear === 'scatter'){ const a = (x * 1.7 + y) % 6.28, d = t * s * 3; g.save(); g.globalAlpha = 1 - t; g.translate(px + s / 2 + Math.cos(a) * d, py + s / 2 + Math.sin(a) * d - t * s); g.rotate(t * (x % 2 ? 2 : -2)); drawBlock(g, -s / 2, -s / 2, s, c.c, 'jigsaw', {nb: {r: true, d: x % 2 === 0}}); g.restore(); return; }
}
function drawMini(cvs, list, m, across){
  const g = cvs.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, cvs.width, cvs.height);
  const T = THEMES[G.theme];
  list.forEach((k, n) => { if(!k) return; const cells = cellsOf(k, 0), xs = cells.map(c => c[0]), ys = cells.map(c => c[1]);
    const w = Math.max(...xs) - Math.min(...xs) + 1, h = Math.max(...ys) - Math.min(...ys) + 1, ox = (across ? n * 4 * m : 0) + (4 - w) / 2 * m - Math.min(...xs) * m, oy = (across ? 0 : n * 3 * m) + (3 - h) / 2 * m - Math.min(...ys) * m;
    const set = new Set(cells.map(([x, y]) => x + ',' + y));
    cells.forEach(([x, y]) => drawBlock(g, ox + x * m, oy + y * m, m, PIECE_KEYS.indexOf(k), T.look, {nb: {r: set.has((x + 1) + ',' + y), d: set.has(x + ',' + (y + 1)), l: set.has((x - 1) + ',' + y), u: set.has(x + ',' + (y - 1))}, now: 0}));
    if(T.look === 'jigsaw') cells.forEach(([x, y]) => jigsawCuts(g, ox + x * m, oy + y * m, m, {r: set.has((x + 1) + ',' + y), d: set.has(x + ',' + (y + 1))}, T.col[PIECE_KEYS.indexOf(k)])); });
}
function drawSide(){
  if(!G) return; const m = G.m || 14;
  if(G.queue.length < 3) G.queue = G.queue.concat(bag(G.L));
  drawMini($('next-cv'), G.queue.slice(0, 3), m, G.row); drawMini($('hold-cv'), [G.hold], m);
}

/* ---------- controls: keys (with repeat), touch pad (hold to repeat), swipes on the board ---------- */
const held = {};
function act(a){
  if(!G || G.over || G.paused || G.clearing || !G.cur) return;
  if(a === 'left') tryMove(-1, 0); else if(a === 'right') tryMove(1, 0);
  else if(a === 'rot'){ if(tryRotate(1)) UISound.play('tap'); } else if(a === 'rotl'){ if(tryRotate(-1)) UISound.play('tap'); }
  else if(a === 'soft') softDrop(); else if(a === 'drop') hardDrop(); else if(a === 'hold') holdPiece();
}

function press(a){ if(a === 'pause'){ togglePause(); return; } if(held[a]) return; held[a] = {t0: performance.now(), next: performance.now() + (a === 'soft' ? 140 : 170)}; act(a); }
function release(a){ delete held[a]; }
/* holding ▼: the block falls faster and faster the longer you hold (90 ms a row → 16 ms after ~1 s) */
function softGap(h, now){ return Math.max(16, 90 - (now - h.t0) * 0.075); }
function repeatKeys(now){ ['left', 'right', 'soft'].forEach(a => { const h = held[a]; if(h && now >= h.next){ act(a); h.next = now + (a === 'soft' ? softGap(h, now) : 55); } });
  const hs = held.soft; document.querySelectorAll('.dpad .dn').forEach(b => b.classList.toggle('fast', !!(hs && now - hs.t0 > 600))); }
document.querySelectorAll('[data-act]').forEach(b => {
  const a = b.dataset.act;
  b.addEventListener('pointerdown', e => { e.preventDefault(); try{ b.setPointerCapture(e.pointerId); }catch(err){} b.classList.add('down'); press(a); });
  const up = () => { b.classList.remove('down'); release(a); };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
});
// Round thumb pad: one touch area — roll your thumb between ◀ ▼ ▶ without lifting it (the top of the disc does nothing).
document.querySelectorAll('[data-dpad]').forEach(pad => {
  let cur = null, active = false;
  const btn = d => pad.querySelector('.' + ({left: 'lf', right: 'rt', soft: 'dn'})[d]);
  const dirAt = e => { const r = pad.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    if(Math.hypot(x, y) < r.width * 0.08) return cur;   /* tiny dead zone in the middle keeps the last direction */
    if(y < 0 && -y > Math.abs(x) * 1.2) return null;    /* top of the disc: nothing */
    return Math.abs(x) >= Math.abs(y) * 0.8 ? (x > 0 ? 'right' : 'left') : 'soft'; };
  const set = d => { if(d === cur) return; if(cur){ release(cur); btn(cur).classList.remove('on'); pad.classList.remove('tilt-' + cur); } cur = d;
    if(d){ btn(d).classList.add('on'); pad.classList.add('tilt-' + d); press(d); try{ if(navigator.vibrate) navigator.vibrate(8); }catch(err){} } };
  pad.addEventListener('pointerdown', e => { e.preventDefault(); active = true; try{ pad.setPointerCapture(e.pointerId); }catch(err){} set(dirAt(e)); });
  UI.onFastMove(pad, e => { if(active) set(dirAt(e)); });   // r33: raw pointer updates (UiKit) = one frame sooner
  const up = () => { active = false; set(null); };
  pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up); pad.addEventListener('lostpointercapture', up);
});
const KEYMAP = {ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'soft', ArrowUp: 'rot', x: 'rot', X: 'rot', z: 'rotl', Z: 'rotl', ' ': 'drop', c: 'hold', C: 'hold', Shift: 'hold'};
document.addEventListener('keydown', e => {
  if(!G || $('scr-play').classList.contains('hidden') || !$('result').classList.contains('hidden')) return;
  if(e.key === 'p' || e.key === 'P' || e.key === 'Escape'){ togglePause(); e.preventDefault(); return; }
  const a = KEYMAP[e.key]; if(!a) return; e.preventDefault();
  if(e.repeat && (a === 'left' || a === 'right' || a === 'soft')) return;   // our own repeat is smoother
  if(a === 'left' || a === 'right' || a === 'soft') press(a); else act(a);
});
document.addEventListener('keyup', e => { const a = KEYMAP[e.key]; if(a) release(a); });
// swipe on the board: drag sideways moves a cell at a time, tap turns, quick swipe down drops
let sw = null;
cv.addEventListener('pointerdown', e => { if(!G) return; e.preventDefault(); sw = {x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, ox: e.clientX, soft: 0}; });
cv.addEventListener('pointermove', e => { if(!sw || !G) return; const dx = e.clientX - sw.ox, dy = e.clientY - sw.y;
  if(Math.abs(dx) >= CS * 0.9){ act(dx > 0 ? 'right' : 'left'); sw.ox = e.clientX; sw.moved++; }
  if(dy > CS * 1.2 * (sw.soft + 1)){ act('soft'); sw.soft++; } });
cv.addEventListener('pointerup', e => { if(!sw || !G) return; const dy = e.clientY - sw.y, dt = performance.now() - sw.t, dx = e.clientX - sw.x;
  if(!sw.moved && !sw.soft && Math.abs(dx) < 10 && Math.abs(dy) < 10) act('rot');
  else if(dy > CS * 2 && dt < 260) act('drop');
  sw = null; });
cv.addEventListener('pointercancel', () => { sw = null; });

function elapsed(){ return G ? performance.now() - G.t0 - G.pausedTotal - (G.paused ? performance.now() - G.pausedAt : 0) : 0; }
function hud(){
  if(!G) return;
  BAR.score(G.score.toLocaleString()); BAR.time(fmt(elapsed()));
  $('lines-txt').textContent = Math.min(G.lines, G.L.goal) + ' / ' + G.L.goal; $('lines-bar').style.width = Math.min(100, G.lines / G.L.goal * 100) + '%';
  $('saves').textContent = G.L.saves ? '🛟'.repeat(G.saves) + '▫️'.repeat(G.L.saves - G.saves) : '';
  if(lockHandle){ const l = lockHandle.remainingMs(); BAR.left(l, l < 120000); }
}
function toggleVoice(){ voiceOn = !voiceOn; savePrefs(); paintVoice(); if(!voiceOn) try{ speechSynthesis.cancel(); }catch(e){} }
function pauseGame(){ if(G && !G.paused && !G.over){ G.paused = true; G.pausedAt = performance.now(); $('paused').classList.remove('hidden'); $('pause-btn').textContent = '▶'; } }
function resume(){ if(G && G.paused && !G.over){ G.pausedTotal += performance.now() - G.pausedAt; G.paused = false; G.last = performance.now(); $('paused').classList.add('hidden'); $('pause-btn').textContent = '⏸'; } }
function togglePause(){ if(!G || G.over) return; if(G.paused) resume(); else pauseGame(); }
document.addEventListener('visibilitychange', () => { if(document.hidden) pauseGame(); });
function leavePlay(){
  if(!G || G.over){ backToMenu(); return; }
  pauseGame();
  UI.confirm({icon: '◀', title: 'Leave this game?', body: 'This game will not be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) backToMenu(); else resume(); });
}
function backToMenu(){ if(window.Cheer) Cheer.unmount(); cancelAnimationFrame(raf); clearInterval(timerId); try{ speechSynthesis.cancel(); }catch(e){} G = null; hideResult(); renderMenu(); showScreen('menu'); }

/* ================= FINISH ================= */
function finishGame(why){
  if(!G || G.over) return;
  G.over = true; clearInterval(timerId); Object.keys(held).forEach(k => delete held[k]);
  const g = G, L = g.L, secs = Math.max(1, Math.round(elapsed() / 1000)), cleared = why === 'goal';
  if(L.hardcore) g.score *= 3;
  const stars = !cleared ? 0 : (g.savesUsed === 0 && secs <= L.par) ? 3 : (g.savesUsed <= 1 && secs <= L.par * 1.5) ? 2 : 1;
  const stats = {lines: g.lines, quads: g.quads, pieces: g.pieces, rounds: 1};
  if(g.score > 0) saveWin(S.player, g.lvl, {timeSec: secs, stars, score: g.score, theme: g.theme, cleared, stats});
  const T = THEMES[g.theme];
  cheerEnd(cleared); /* 📣 cs-4a */
  if(cleared){ const pr = pick(PRAISE); party('🎉 ' + pr + ', ' + S.player + '!'); say(pr + ', ' + S.player + '!'); confetti(['🧱', '⭐', '🎉', T.icon, T.syms[1]], 40); UISound.play('success'); }
  else { UISound.play('error'); say('The blocks reached the top! Good try!'); showBanner('🧱 The blocks reached the top!', 'bad'); }
  setTimeout(() => {
    if(G !== g) return;
    const next = cleared && g.lvl < 5;
    showResult('<div class="big">' + (cleared ? (stars === 3 ? '💯' : '🏆') : '🧱') + '</div><h2 class="' + (cleared ? 'cheer' : '') + '">' + (cleared ? (stars === 3 ? 'Perfect stacking!' : 'Level passed!') : 'Blocks to the top!') + '</h2>' +
      (cleared ? '<div class="rating">' + [0, 1, 2].map(k => '<span class="st' + (k < stars ? '' : ' off') + '" style="animation-delay:' + (0.25 + k * 0.25) + 's">⭐</span>').join('') + '</div>' : '') +
      '<div class="score-big">🏆 <span id="score-count">0</span></div>' +
      '<div class="stats"><span>🧱 ' + g.lines + ' / ' + L.goal + ' rows</span><span>⏱ ' + fmt(secs * 1000) + '</span>' + (g.quads ? '<span>💥 ' + g.quads + ' block blasts</span>' : '') + '<span>🔷 ' + g.pieces + ' blocks</span>' + (L.saves ? '<span>🛟 ' + g.savesUsed + ' saves used</span>' : '') + (L.hardcore ? '<span>💀 ×3</span>' : '') + '</div>' +
      (!cleared ? '<div class="tip">🎯 Clear ' + L.goal + ' rows to pass. ' + pick(TIPS) + '</div>' : stars < 3 ? '<div class="tip">⭐⭐⭐ = no saves used and done within ' + fmt(L.par * 1000) + '. ' + pick(TIPS) + '</div>' : '') +
      '<div class="save-note" id="save-note">' + (g.score > 0 ? '<span class="ui-spin a-bounce">🧱</span> Saving your score…' : 'Not saved — clear a row to get a score.') + '</div>' +
      '<div class="res-btns">' + (next ? '<button class="btn sp-btn sp-primary" id="b-next">' + (g.lvl === 4 ? '💀 Try Hardcore ▶' : 'Next level ▶') + '</button>' : '') + '<button class="btn sp-btn ' + (next ? 'soft sp-secondary' : 'sp-primary') + '\" id="b-again">🔁 Play again</button><button class="btn soft sp-btn sp-secondary" id="b-menu">🎚️ Levels</button></div>');
    countUp($('score-count'), g.score, 1000);
    $('b-again').onclick = () => startGame(g.lvl);
    $('b-menu').onclick = () => backToMenu();
    if($('b-next')) $('b-next').onclick = () => { const p = progressOf(S.player); p.unlocked = Math.max(p.unlocked, g.lvl + 1); S.progress[S.player] = p; startGame(g.lvl + 1); };
  }, cleared ? 1700 : 1200);
}
function party(text){ const p = document.createElement('div'); p.className = 'praise'; p.textContent = text; document.body.appendChild(p); setTimeout(() => p.remove(), 1600); }
function sparkle(el){ if(!el) return; const r = el.getBoundingClientRect(); for(let k = 0; k < 7; k++){ const s = document.createElement('div'); s.className = 'spark'; s.textContent = pick(['✨', '⭐', '💫']); const a = Math.random() * 6.28, d = 40 + Math.random() * 40; s.style.cssText = 'left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px;--dx:' + Math.cos(a) * d + 'px;--dy:' + Math.sin(a) * d + 'px'; document.body.appendChild(s); setTimeout(() => s.remove(), 850); } }
let bannerTimer = 0;
function showBanner(text, kind){ const b = $('banner'); b.textContent = text; b.classList.toggle('gold', kind === 'gold'); b.classList.toggle('bad', kind === 'bad'); b.classList.add('on'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 2000); }


/* ================= SAVE ================= */
const PENDING_KEY = 'sp_blockdrop_pending';
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
function cheerTaken(){ return Array.from(document.querySelectorAll('#gbar, .top-btn, #board-box, #side-l, #side-r, #pad-l, #pad-r, #pad')); }
function cheerMount(){
  if(!window.Cheer || !G) return; Cheer.unmount(); const box = $('scr-play');
  Cheer.mount(box, {game: 'blockdrop', players: [{name: S.player, side: 0, human: true}, {name: 'Rival', side: 1, human: false}], me: {name: S.player}, family: (S.players || []).map(p => p.Name), avatars: S.avatars || {}, mode: 'overlay',
    zones: () => Cheer.freeZones(box, cheerTaken), avoid: cheerTaken,
    clear: b => { const B = box.getBoundingClientRect(), F = $('board-box').getBoundingClientRect(), l = F.left - B.left, t = F.top - B.top; return !(b.r > l - 3 && b.l < l + F.width + 3 && b.b > t - 3 && b.t < t + F.height + 3); }});
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
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {};
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
/* ================= 🧑 YOUR AVATAR (p6e — ✨ P6 / 11w round 2) =================
   The player's own avatar beside the game: UI.buddy pictures (cached AvatarActing frames, swapped by a small timer) —
   nothing is painted in the game loop. It reacts to the game's own moments through the wrappers below (no game logic changes). */
const HAS_AV = typeof drawAvatar === 'function' && typeof GESTURES !== 'undefined';
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
const bdBase = {startGame, onClear, topOut, showResult};
startGame = function(){ const args = arguments;  const r = bdBase.startGame.apply(this, args); bdStart(); return r; };
onClear = function(){ const args = arguments;  const r = bdBase.onClear.apply(this, args); if(args[0] >= 2) bdReact('win', 2200); else if(BD.on && performance.now() - (BD.last || 0) > 1800){ BD.last = performance.now(); bdReact('happy', 1400); } return r; };
topOut = function(){ const args = arguments;  const r = bdBase.topOut.apply(this, args); bdReact(G && G.over ? 'lose' : 'miss', 2400); return r; };
showResult = function(){ const args = arguments;  const r = bdBase.showResult.apply(this, args); bdResultBig(); return r; };
/* ================= 🧑 YOUR AVATAR END (p6e) ================= */
boot();

