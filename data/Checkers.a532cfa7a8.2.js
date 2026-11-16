
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'checkers';
// 🎛️ p1b: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 🔴 Checkers · level | scoreboard | game buttons ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🔴', name: 'Checkers', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ clearInterval(timerId); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { if(typeof pauseGame === 'function') pauseGame(); }, resume: () => { if(typeof resume === 'function') resume(); }},
  onFit: () => { if(G && typeof layout === 'function') layout(); },
  extras: []});
const CHECKERS_HELP = ["Pieces move one square **diagonally forward** on the dark squares.", "Jump over a piece next to you to **capture** it. If you can jump, you **must** jump (it glows orange).", "After a jump, keep jumping if you can — that is a double jump!", "Reach the far side and you become a **King 👑**. Kings can move backwards too.", "Win by taking every piece, or by leaving the other side with no moves."];   // 🧱 b3w2: the 📖 How to play lines (cover)
var NAV_INNER = {friend: ['◀ Checkers', () => showScreen('menu')], menu: ['◀ Checkers', () => openCover()], link: ['◀ Checkers', () => lxExit()]};   // 📡 lk-3c: + link   // 🧭 inner screens: their top button goes to the main screen
UI.navBar(document.getElementById('back-btn'), {onclick: false});

/* ================= LEVELS + DESIGNS ================= */
// Basic is a small 6×6 board (6 pieces each) for little hands; the rest are the full 8×8 game.
const LEVELS = [
  {name:'Basic', emoji:'🌱', n:6, bot:'Pip', learn:'Moving + jumping', blurb:'Small board, a sleepy bot', think:0, random:1},
  {name:'Junior', emoji:'🐣', n:8, bot:'Bolt', learn:'The full board', blurb:'The bot grabs pieces when it can', think:1, random:0.35},
  {name:'Intermediate', emoji:'🚦', n:8, bot:'Chip', learn:'Plan ahead', blurb:'The bot looks 3 moves ahead', think:3, random:0.08},
  {name:'Hard', emoji:'⚡', n:8, bot:'Turbo', learn:'Traps + kings', blurb:'The bot sets traps', think:6, ms:650, random:0},
  {name:'Extreme', emoji:'🌋', n:8, bot:'Mega Bot', learn:'Master strategy', blurb:'The bot thinks really far ahead', think:12, ms:1300, random:0},
  {name:'Hardcore', emoji:'💀', n:8, bot:'Doom Bot', learn:'No hints · 30 s a move', blurb:'The strongest bot, no hints, no glowing help — 30 seconds for each move!', think:16, ms:1400, random:0, hardcore:true, clock:30}
];
const DESIGNS = {
  classic:    {name:'Classic', icon:'🪵', sub:'Wooden board, red vs black', emb:['', ''], crown:'👑', p1:'#E2554F', p2:'#2B2D42'},
  fantasy:    {name:'Fantasy', icon:'🏰', sub:'Unicorns vs dragons in a magic castle', emb:['🦄', '🐉'], crown:'👑', p1:'#FF7EB9', p2:'#1F8A70'},
  futuristic: {name:'Futuristic', icon:'🚀', sub:'Neon robots vs space invaders', emb:['🤖', '👾'], crown:'⚡', p1:'#0FA3C7', p2:'#B5179E'},
  hero:       {name:'Hero vs Villain', icon:'🦸', sub:'Masked heroes vs sneaky villains — POW!', emb:['🦸', '🦹'], crown:'⭐', p1:'#1565C0', p2:'#4A148C', take:'pow'},
  pets:       {name:'Corgi vs Cat', icon:'🐶', sub:'Fluffy corgis vs Persian cats', emb:['🐶', '🐱'], crown:'👑', p1:'#E07B22', p2:'#9AA4B8', take:'pets'},
  dance:      {name:'Dance Battle', icon:'💃', sub:'Dance crews groove to the beat — a jump is a dance-off!', emb:['💃', '🕺'], crown:'🌟', p1:'#FF8A00', p2:'#0077FF', take:'battle'}
};
const AGE_START = {'4-5':0, '6-7':1, '8-9':2, '10+':3};
const AGE_RECOMMEND = {'4-5':0, '6-7':1, '8-9':2, '10+':3};
const PRAISE = ['Checkmate-tastic', 'Super player', 'Brilliant moves', 'Champion', 'You beat the bot', 'King of the board'];

/* ================= HELPERS ================= */
const $ = id => document.getElementById(id);
// rnd comes from AvatarKit (same function) — never declare it again here
const pick = a => a[rnd(a.length)];
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function fmt(ms){ const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function say(text){ try{ if(!UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.25; u.volume = Math.max(0.2, UISound.get().volume); speechSynthesis.speak(u); }catch(e){} }

/* ================= RULES (American checkers) =================
   Board = array of n×n. 0 empty, 1 / 2 = bottom side man / king, -1 / -2 = top side man / king.
   Bottom (+1) moves up. Captures are compulsory; a jump must be continued; a man that reaches
   the far row during a jump is crowned and stops there. A move = {path:[squares], caps:[squares]}. */
const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
function dirsFor(v){ return Math.abs(v) === 2 ? DIAG : (v > 0 ? DIAG.slice(0, 2) : DIAG.slice(2)); }
function newBoard(n){
  const b = new Array(n * n).fill(0), k = n === 6 ? 2 : 3;
  for(let r = 0; r < n; r++) for(let c = 0; c < n; c++){ if((r + c) % 2 !== 1) continue; if(r < k) b[r * n + c] = -1; else if(r >= n - k) b[r * n + c] = 1; }
  return b;
}
function crownRow(v, n){ return v > 0 ? 0 : n - 1; }
function jumpsFrom(b, n, from, v, path, caps, out){
  const r = (from / n) | 0, c = from % n;
  for(const [dr, dc] of dirsFor(v)){
    const lr = r + 2 * dr, lc = c + 2 * dc;
    if(lr < 0 || lc < 0 || lr >= n || lc >= n) continue;
    const mid = (r + dr) * n + (c + dc), land = lr * n + lc;
    if(b[land] !== 0 || b[mid] === 0 || Math.sign(b[mid]) === Math.sign(v) || caps.includes(mid)) continue;
    const np = path.concat([land]), nc = caps.concat([mid]);
    if(Math.abs(v) === 1 && lr === crownRow(v, n)){ out.push({path: np, caps: nc}); continue; }
    const save = b[path[0]]; b[path[0]] = 0; b[land] = v;
    const before = out.length;
    jumpsFrom(b, n, land, v, np, nc, out);
    b[land] = 0; b[path[0]] = save;
    if(out.length === before) out.push({path: np, caps: nc});
  }
}
function genMoves(b, n, side){
  const caps = [];
  for(let i = 0; i < b.length; i++) if(b[i] && Math.sign(b[i]) === side) jumpsFrom(b, n, i, b[i], [i], [], caps);
  if(caps.length) return caps;
  const out = [];
  for(let i = 0; i < b.length; i++){
    if(!b[i] || Math.sign(b[i]) !== side) continue;
    const r = (i / n) | 0, c = i % n;
    for(const [dr, dc] of dirsFor(b[i])){ const rr = r + dr, cc = c + dc; if(rr < 0 || cc < 0 || rr >= n || cc >= n) continue; const t = rr * n + cc; if(b[t] === 0) out.push({path: [i, t], caps: []}); }
  }
  return out;
}
function applyMove(b, n, m){
  const nb = b.slice(), from = m.path[0], to = m.path[m.path.length - 1];
  let v = nb[from]; nb[from] = 0; m.caps.forEach(c => { nb[c] = 0; });
  if(Math.abs(v) === 1 && ((to / n) | 0) === crownRow(v, n)) v *= 2;
  nb[to] = v;
  return nb;
}
// Score from the bottom side's point of view.
function evaluate(b, n){
  let s = 0;
  for(let i = 0; i < b.length; i++){
    const v = b[i]; if(!v) continue;
    const r = (i / n) | 0, c = i % n, side = Math.sign(v);
    let val = Math.abs(v) === 2 ? 175 : 100;
    if(Math.abs(v) === 1){ val += (side > 0 ? (n - 1 - r) : r) * 4; if(r === (side > 0 ? n - 1 : 0)) val += 10; }
    if(c >= 2 && c <= n - 3 && r >= 2 && r <= n - 3) val += 6;
    if(c === 0 || c === n - 1) val -= 3;
    s += side * val;
  }
  return s;
}
class Timeout extends Error {}
function negamax(b, n, side, depth, alpha, beta, ply, deadline, noise){
  if(deadline && (ply & 3) === 0 && performance.now() > deadline) throw new Timeout();
  const moves = genMoves(b, n, side);
  if(!moves.length) return -100000 + ply;
  if(depth <= 0 && !moves[0].caps.length) return side * evaluate(b, n) + (noise ? (Math.random() - 0.5) * noise : 0);
  moves.sort((x, y) => y.caps.length - x.caps.length);
  let best = -Infinity;
  for(const m of moves){
    const v = -negamax(applyMove(b, n, m), n, -side, depth - (m.caps.length && depth <= 0 ? 0 : 1), -beta, -alpha, ply + 1, deadline, noise);
    if(v > best) best = v;
    if(v > alpha) alpha = v;
    if(alpha >= beta) break;
    if(ply > 30) break;
  }
  return best;
}
// The best move for `side`. depth = how far to look; ms = time budget (iterative deepening).
function bestMove(b, n, side, depth, ms, noise){
  const moves = genMoves(b, n, side); if(moves.length <= 1) return moves[0] || null;
  const deadline = ms ? performance.now() + ms : 0;
  let best = moves[0];
  for(let d = 1; d <= depth; d++){
    let curBest = null, curVal = -Infinity;
    try{
      // try the last best first
      const order = [best].concat(moves.filter(m => m !== best));
      for(const m of order){
        const v = -negamax(applyMove(b, n, m), n, -side, d - 1, -Infinity, -curVal, 1, deadline, noise);
        if(v > curVal){ curVal = v; curBest = m; }
      }
    }catch(e){ if(e instanceof Timeout) break; throw e; }
    if(curBest) best = curBest;
    if(curVal > 90000) break;
  }
  return best;
}
function botChoice(b, n, L){
  const moves = genMoves(b, n, -1); if(!moves.length) return null;
  if(Math.random() < L.random) return pick(moves);
  return bestMove(b, n, -1, Math.max(1, L.think), L.ms || 0, L.think <= 3 ? 30 : 0);
}

/* ---------- 💀 Hardcore move clock: CLOCK_S seconds for each of your moves; running out = the bot wins ---------- */
let clockHandle = 0;
function clockOn(){ return !!(G && G.mode === 'bot' && G.L.clock); }
function clockStart(){ if(!clockOn()) return; G.clockLeft = G.L.clock * 1000; G.clockLast = performance.now(); clockShow(); }
function clockTick(){
  if(!clockOn() || G.over) return;
  const now = performance.now();
  if(isHumanTurn() && !G.pausedAt && G.clockLeft != null) G.clockLeft -= now - G.clockLast;
  G.clockLast = now; clockShow();
  if(G.clockLeft != null && G.clockLeft <= 0 && isHumanTurn()){ G.clockLeft = 0; clockShow(); UISound.play('error'); endGame(-1, 'time'); }
}
function clockShow(){   // 🎛️ p1b: the 💀 Hardcore move clock is a ⏳ counter in the shared bar (amber in the last 10 s)
  if(!clockOn()){ BAR.hide('clock'); return; }
  const left = Math.max(0, G.clockLeft == null ? G.L.clock * 1000 : G.clockLeft), s = Math.ceil(left / 1000);
  BAR.count('clock', '⏳', s + 's', '💀 Hardcore: ' + G.L.clock + ' seconds for each move', s <= 10 && isHumanTurn());
}
/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: ''};
let G = null, lockHandle = null, tickHandle = 0, botTimer = 0, design = 'classic';
function designKey(){ return 'sp_checkers_design:' + (S.player || ''); }
function loadDesign(){ try{ const d = localStorage.getItem(designKey()); if(DESIGNS[d]) design = d; }catch(e){} }
function saveDesign(){ try{ localStorage.setItem(designKey(), design); }catch(e){} }

/* ================= MENUS ================= */
function showScreen(name){
  if(name !== 'menu' && CheckersCover) CheckersCover.hide();   /* 🧱 b3w2: friend / link / play hide the cover */
  ['player', 'menu', 'friend', 'play', 'link'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));   // 📡 lk-3c: + link
  if(name !== 'play') danceStop();
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER);   // 🧭 p1b
  window.scrollTo(0, 0);
}
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
function renderPlayers(){
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div class="empty">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    if(HAS_AV){ const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c); b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age || '') + '</div>'); drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1}); }
    else b.innerHTML = '<div class="big">' + UI.esc(p.Name.charAt(0).toUpperCase()) + '</div><div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age || '') + '</div>';
    b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  loadDesign();
  $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); }   /* 📣 cs-3a */ renderLevels(); showScreen('menu'); openCover();   /* 🧱 b3w2: the 🎬 cover first */
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){
  const b = (p.best || [])[i];
  if(!b || !(b.score || b.timeSec)) return '<div class="best none">' + (p.unlocked > i ? 'Beaten!' : 'Not beaten yet') + '</div>';
  return '<div class="best">' + (b.score ? '<span>🏆 ' + Number(b.score).toLocaleString() + '</span>' : '') + (b.timeSec ? '<span>⏱ ' + fmt(b.timeSec * 1000) + '</span>' : '') + '<span>' + '⭐'.repeat(b.stars || 0) + '</span></div>';
}
function renderLevels(){
  const box = $('level-list'); box.innerHTML = '';   /* 🧱 b3w2: 🏆 leaders live on the cover */
  const p = progressOf(S.player), rec = AGE_RECOMMEND[S.age];
  LEVELS.forEach((L, i) => {
    const open = canPlay(i), done = p.unlocked > i;
    const b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (L.hardcore ? ' hardcore' : '');
    b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : (open ? '' : '<span class="badge">🔒</span>')) +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div><div class="learn">vs 🤖 ' + L.bot + ' · ' + L.n + '×' + L.n + '</div><div class="sub">' + (L.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : L.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Beat Hard to unlock Extreme!' : 'Beat the level before this one to unlock it'); return; } CH.mode = 'bot'; CH.lvl = i; renderSetup(); };   /* 🧱 b3w2: a tap picks */
    b.dataset.i = i; box.appendChild(b);
  });
  if(!(CH.lvl >= 0 && canPlay(CH.lvl))){ let i = -1; try{ i = Number(localStorage.getItem('sp_checkers_lv:' + S.player)); }catch(e){} CH.lvl = i >= 0 && canPlay(i) ? i : (canPlay(rec) ? rec : 0); }
  renderSetup();   /* 🧱 b3w2 */
}
function chooseFriend(){
  const box = $('friend-list'); box.innerHTML = '';
  S.players.filter(p => p.Name !== S.player).concat([{Name: 'Guest', Age: 'a visitor', guest: true}]).forEach(p => {
    const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    if(HAS_AV){ const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c); b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age || '') + '</div>'); drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1}); }
    else b.innerHTML = '<div class="big">' + (p.guest ? '🙂' : UI.esc(p.Name.charAt(0).toUpperCase())) + '</div><div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age || '') + '</div>';
    b.onclick = () => { CH.mode = 'duo'; CH.friend = p.Name; renderSetup(); showScreen('menu'); }; box.appendChild(b);   /* 🧱 b3w2: back to the setup with the friend */
  });
  showScreen('friend');
}
let pending = null;
function miniBoard(key){
  const D = DESIGNS[key]; let h = '';
  for(let r = 0; r < 4; r++) for(let c = 0; c < 4; c++){
    const dk = (r + c) % 2 === 1, piece = dk && (r === 0 ? 'op' : r === 3 ? 'me' : '');
    h += '<i class="' + (dk ? 'd' : 'l') + '">' + (piece ? '<b style="background:radial-gradient(circle at 35% 30%,var(--' + (piece === 'me' ? 'p1a' : 'p2a') + '),var(--' + (piece === 'me' ? 'p1b' : 'p2b') + ') 70%);display:flex;align-items:center;justify-content:center;font-size:.9rem">' + (D.emb[piece === 'me' ? 0 : 1] || '') + '</b>' : '') + '</i>';
  }
  return '<div class="mini" data-design="' + key + '">' + h + '</div>';
}
/* 🧱 b3w2 (Game Baseline pilot): ONE setup page — mode, board, level, pieces, options, ▶ Start */
const CH = {mode: 'bot', lvl: -1, friend: ''};
function chooseDesign(opts){ if(CheckersCover) CheckersCover.hide(); CH.mode = opts.mode; if(opts.lvl != null && opts.mode === 'bot') CH.lvl = opts.lvl; if(opts.friend) CH.friend = opts.friend; renderSetup(); showScreen('menu'); }   // old entry point: open the setup with these picks
function setMode(m){ if(m === 'duo' && !CH.friend){ chooseFriend(); return; } CH.mode = m; renderSetup(); }
function renderSetup(){
  if(!$('design-list')) return;
  $('mode-bot').classList.toggle('on', CH.mode === 'bot'); $('mode-duo').classList.toggle('on', CH.mode === 'duo');
  $('duo-sub').textContent = CH.friend ? S.player + ' vs ' + CH.friend + ' · tap to change' : 'Take turns on this screen';
  $('mode-duo').onclick = () => { if(CH.mode === 'duo' && CH.friend) chooseFriend(); else setMode('duo'); };
  ['level-head', 'level-list'].forEach(id => $(id).classList.toggle('b2-hide', CH.mode !== 'bot'));
  document.querySelectorAll('#level-list .lvl').forEach(b => b.classList.toggle('sel', CH.mode === 'bot' && Number(b.dataset.i) === CH.lvl));
  const box = $('design-list'); box.innerHTML = '';
  Object.keys(DESIGNS).forEach(k => { const D = DESIGNS[k], b = document.createElement('button');
    b.className = 'design' + (k === design ? ' cur' : ''); b.setAttribute('data-sound', 'pop');
    b.innerHTML = miniBoard(k) + '<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><div class="nm">' + D.icon + ' ' + D.name + '</div><div class="sub">' + D.sub + '</div></div>';
    b.onclick = () => { design = k; saveDesign(); document.body.setAttribute('data-design', design); renderSetup(); }; box.appendChild(b); });
  const sp = $('skin-pick'); sp.innerHTML = '';
  if(window.PieceSkins && PieceSkins.discChips) [S.player].concat(CH.mode === 'duo' && CH.friend ? [CH.friend] : []).forEach(name => {
    sp.insertAdjacentHTML('beforeend', '<div class="section-head sub-head">🔴 ' + UI.esc(name) + '\'s discs</div>');
    const row = document.createElement('div'); row.className = 'skin-chips'; row.setAttribute('data-for', name); sp.appendChild(row);
    PieceSkins.discChips(row, PieceSkins.getDisc(name), k => PieceSkins.setDisc(name, k), '🎨 Board pieces'); });
  $('pieces-head').classList.toggle('b2-hide', !(window.PieceSkins && PieceSkins.discChips));
  const L = LEVELS[CH.lvl] || LEVELS[0], D = DESIGNS[design] || {icon: '', name: ''};
  $('btn-start').textContent = '▶ Start · ' + (CH.mode === 'duo' ? '👫 ' + S.player + ' vs ' + (CH.friend || '?') : L.emoji + ' ' + L.name) + ' · ' + D.icon + ' ' + D.name;
}
function startSetup(){
  if(CH.mode === 'duo'){ if(!CH.friend){ chooseFriend(); return; } startGame({mode: 'duo', lvl: 1, friend: CH.friend}); return; }
  if(!canPlay(CH.lvl)){ UISound.play('error'); UI.toast('Pick a level that is open 🔓'); return; }
  try{ localStorage.setItem('sp_checkers_lv:' + S.player, String(CH.lvl)); }catch(e){}
  startGame({mode: 'bot', lvl: CH.lvl});
}
// 🎬 the cover: who's here (you + a friend on this device, or 📱 own devices → the 📡 lobby) + champions + how to play
let CheckersCover = null;
const CHECKERS_VERSION = '2.0';   /* 🧱 b3w2: shown on the cover footer — bump with each Checkers round */
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(CheckersCover && CheckersCover.who !== S.player){ CheckersCover.destroy(); CheckersCover = null; }
  if(!CheckersCover){ CheckersCover = GF.cover(document.body, {game: 'checkers', title: 'Checkers', icon: '🔴', version: CHECKERS_VERSION, me: S.player, players: S.players.concat([{Name: 'Guest'}]), avatarOf: myAvatar, seats: {min: 1, max: 2},
      help: CHECKERS_HELP, acts: ['beat.jump', 'beat.bow'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms',
      own: () => { CheckersCover.hide(); lxChoose(); },   // 📡 own devices = the LinkKit lobby, unchanged (the lineup feed = 📡 LinkKit chat later)
      onPlay: line => { CheckersCover.hide(); if(line.length > 1){ CH.mode = 'duo'; CH.friend = line[1].name; } else CH.mode = 'bot'; renderSetup(); showScreen('menu'); } }); CheckersCover.who = S.player; }
  if(CheckersCover.mode === 'own') CheckersCover.setMode('solo');
  CheckersCover.show();
}

/* ================= GAME ================= */
function startGame(opts){
  if(CheckersCover) CheckersCover.hide();   /* 🧱 b3w2 */
  clearTimeout(botTimer); hideResult();
  const lvl = opts.lvl, L = LEVELS[lvl], n = opts.mode === 'bot' ? L.n : 8;
  const b = newBoard(n), ids = b.map((v, i) => v ? i + 1 : 0);
  G = {mode: opts.mode, lvl, L, n, b, ids, turn: 1, prefix: null, moves: [], plies: 0, quiet: 0, last: null, over: false,
    t0: performance.now(), pausedAt: 0, pausedTotal: 0, hintUsed: false, start: b.filter(v => v > 0).length, takenBy: {1: 0, '-1': 0},
    names: {1: S.player, '-1': opts.mode === 'bot' ? L.bot : opts.friend}, friend: opts.friend, kings: 0, feats: {doubles: 0, triples: 0, megas: 0, kings: 0}};
  lxSeat();   // 📡 lk-3c: a linked game → G.lx, names by colour, the board turned to your side
  const D = DESIGNS[design];
  $('scr-play').setAttribute('data-design', design);
  BAR.level(opts.mode === 'bot' ? L.emoji + ' ' + L.name + ' · vs ' + L.bot : (G.lx ? '📡 ' : '👫 ') + G.names[1] + ' vs ' + G.names[-1]);
  $('nm-me').textContent = G.names[1]; $('nm-op').textContent = (opts.mode === 'bot' ? '🤖 ' : '') + G.names[-1];
  $('chip-me').style.background = 'radial-gradient(circle at 35% 30%,var(--p1a),var(--p1b) 70%)'; $('chip-me').textContent = embOf(1);
  $('chip-op').style.background = 'radial-gradient(circle at 35% 30%,var(--p2a),var(--p2b) 70%)'; $('chip-op').textContent = embOf(-1);
  $('btn-hint').classList.toggle('hidden', opts.mode !== 'bot' || !!L.hardcore);   // 💀 Hardcore: no hints
  $('tip').innerHTML = opts.mode === 'bot' ? 'Tap one of your pieces, then a glowing dot. ' + (lvl === 0 ? 'Jump over the bot\'s pieces to take them!' : 'Remember: if you can jump, you must!') : 'Take turns. The glowing name shows whose turn it is.';
  showScreen('play');
  buildBoard(); layout(); render(); tableStart(); cheerMount();   /* 📣 cs-3a: the crowd for this game (Off = nothing) */
  danceStart();
  startTurn();
  clearInterval(tickHandle); tickHandle = setInterval(updateHud, 500); updateHud();
  clearInterval(clockHandle); G.clockLeft = null; clockShow(); if(clockOn()) clockHandle = setInterval(clockTick, 200);
  say(opts.mode === 'bot' ? 'Let\'s play checkers! You go first.' : 'Let\'s play! ' + G.names[1] + ' goes first.');
  if(G.lx) lxNames();
}
function newGame(){
  if(!G) return;
  if(G.lx){ lxNewGame(); return; }   // 📡 lk-3c
  const opts = {mode: G.mode, lvl: G.lvl, friend: G.friend};
  if(G.over || G.plies === 0) return startGame(opts);
  UI.confirm({icon: '🔄', title: 'Start a new game?', body: 'This game will be lost.', okText: 'New game', cancelText: 'Keep playing'}).then(ok => { if(ok) startGame(opts); });
}
function leavePlay(){
  if(G && G.lx){ lxLeavePlay(); return; }   // 📡 lk-3c
  const go = () => { if(window.Cheer) Cheer.unmount(); clearTimeout(botTimer); clearInterval(tickHandle); G = null; renderLevels(); showScreen('menu'); };
  if(!G || G.over || G.plies === 0) return go();
  UI.confirm({icon: '◀', title: 'Leave this game?', body: 'The game will not be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) go(); });
}
function resign(){
  if(!G || G.over) return;
  if(G.lx && !G.lx.me){ UI.toast('📺 Players give up on their own device'); return; }   // 📺 lk-5b: the Room hostess has no colour
  const loser = G.lx ? G.lx.me : G.turn;   // 📡 lk-3c: linked = you give up for your own colour, on any turn
  UI.confirm({icon: '🏳️', title: 'Give up this game?', body: G.mode === 'bot' ? G.L.bot + ' will win this one.' : G.names[-loser] + ' will win.', okText: 'Give up', cancelText: 'Keep playing', danger: true})
    .then(ok => { if(ok && G && !G.over){ if(G.lx) lxSendEnd(-loser, 'resign'); endGame(-loser, 'resign'); } });
}
function elapsed(){ return G ? (G.over ? G.finishMs : performance.now() - G.t0 - G.pausedTotal - (G.pausedAt ? performance.now() - G.pausedAt : 0)) : 0; }
function updateHud(){
  if(!G) return;
  BAR.time(fmt(elapsed()));
  if(lockHandle){ const left = lockHandle.remainingMs(); BAR.left(left, left < 120000); }
}
function pauseGame(){ if(G && !G.pausedAt){ G.pausedAt = performance.now(); clearTimeout(botTimer); } }

/* ---------- board drawing (DOM: squares + pieces that glide) ---------- */
function buildBoard(){
  const n = G.n, bd = $('board'); bd.innerHTML = '';
  bd.style.gridTemplateColumns = 'repeat(' + n + ',1fr)'; bd.style.setProperty('--n', n);
  for(let i = 0; i < n * n; i++){
    const r = (i / n) | 0, c = i % n, sq = document.createElement('div');
    sq.className = 'sq' + ((r + c) % 2 === 1 ? ' dk' : ''); sq.dataset.i = i; if(G.flip){ sq.style.order = lxV(i); if(lxV(i) === 0) sq.classList.add('lx-tl'); }   // 📡 lk-3c: turned board (+ the rounded corner where it shows top-left)
    if((r + c) % 2 === 1) sq.addEventListener('click', () => tapSquare(i));
    bd.appendChild(sq);
  }
  G.b.forEach((v, i) => { if(v) bd.appendChild(pieceEl(G.ids[i], v)); });
}
// 🎨 each side's disc skin: you = your pick, a friend = theirs, the bot = the board design's own pieces
function discSkin(side){ if(!window.PieceSkins || !PieceSkins.DISCS || !G) return null; const k = side > 0 ? PieceSkins.getDisc(G.names[1]) : G.mode === 'duo' ? PieceSkins.getDisc(G.friend) : 'classic'; return PieceSkins.DISCS[k] || null; }
function embOf(v){ const sk = discSkin(v > 0 ? 1 : -1); return sk ? (Math.abs(v) === 2 ? sk.king : sk.disc) : (DESIGNS[design].emb[v > 0 ? 0 : 1] || ''); }
function pieceEl(id, v){
  const e = document.createElement('div'); e.className = 'pc ' + (v > 0 ? 'me' : 'op'); e.id = 'pc-' + id;
  e.innerHTML = '<div class="disc"><span class="emb' + (discSkin(v) ? ' skin' : '') + '">' + embOf(v) + '</span></div>';
  if(design === 'dance') danceMove(e.querySelector('.emb'));
  return e;
}
function placePiece(e, sq){ const n = G.n; sq = lxV(sq); e.style.left = (sq % n) * 100 / n + '%'; e.style.top = ((sq / n) | 0) * 100 / n + '%'; }
function setKing(e, on){ const d = e.querySelector('.disc'); let k = d.querySelector('.crown');
  // the King hatches: 🥚 → 🦖 (disc skins)
  const sk = discSkin(e.classList.contains('me') ? 1 : -1), em = d.querySelector('.emb');
  if(sk && em){ const want = on ? sk.king : sk.disc; if(em.textContent !== want){ em.textContent = want; em.classList.toggle('kingpic', on); } }
  if(on && !k){ k = document.createElement('span'); k.className = 'crown'; k.textContent = DESIGNS[design].crown; d.appendChild(k); } if(!on && k) k.remove(); }
function render(){
  const n = G.n;
  G.b.forEach((v, i) => { if(!v) return; const e = $('pc-' + G.ids[i]); if(!e) return; placePiece(e, i); setKing(e, Math.abs(v) === 2); });
  // highlights
  document.querySelectorAll('.sq').forEach(s => { s.classList.remove('from', 'last', 'hint-to'); s.innerHTML = ''; });
  document.querySelectorAll('.pc').forEach(p => p.classList.remove('can', 'must', 'sel', 'hint'));
  if(G.last) G.last.forEach(i => $('board').children[i].classList.add('last'));
  if(G.over) return;
  const human = isHumanTurn();
  if(!human) return;
  const forced = G.moves.length && G.moves[0].caps.length > 0;
  if(G.prefix){
    const from = G.prefix[G.prefix.length - 1];
    $('board').children[from].classList.add('from');
    const pe = $('pc-' + G.ids[G.prefix[0]]); if(pe) pe.classList.add('sel');
    targets().forEach(t => { const d = document.createElement('div'); d.className = 'dot' + (forced ? ' cap' : ''); $('board').children[t].appendChild(d); });
    markDanger();
  } else {
    markDanger();
    const froms = [...new Set(G.moves.map(m => m.path[0]))];
    froms.forEach(f => { const pe = $('pc-' + G.ids[f]); if(pe) pe.classList.add(G.L.hardcore && G.mode === 'bot' ? 'x' : forced ? 'must' : (G.lvl <= 1 || G.mode === 'duo' ? 'can' : 'x')); });   // 💀 Hardcore: no glowing help
  }
}
// Pieces that could be jumped next turn get worried (💦) — helps children see the danger.
function markDanger(){
  document.querySelectorAll('.pc.danger').forEach(e => e.classList.remove('danger'));
  if(!(G.mode === 'duo' || G.lvl <= 2)) return;
  const caps = new Set(); genMoves(G.b, G.n, -G.turn).forEach(m => m.caps.forEach(c => caps.add(c)));
  caps.forEach(c => { const e = $('pc-' + G.ids[c]); if(e) e.classList.add('danger'); });
}
function layout(){
  if(!G) return;
  const wrap = $('stage-wrap'), play = $('scr-play'), frame = $('frame');
  const wide = window.matchMedia('(orientation:landscape) and (min-width:760px), (min-width:1000px)').matches;
  let side;
  if(wide){
    const cs = getComputedStyle(play), padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    side = Math.floor(Math.min(wrap.clientHeight, play.clientWidth - padX - $('side').offsetWidth - (parseFloat(cs.columnGap) || 16) - 4));
    wrap.style.width = Math.max(160, side) + 'px';
  } else { wrap.style.width = ''; side = Math.floor(Math.min(wrap.clientWidth, wrap.clientHeight) - 2); }
  side = Math.max(160, side);
  const fp = Math.max(6, Math.round(side * 0.025));
  frame.style.setProperty('--fp', fp + 'px');
  const inner = side - fp * 2;
  $('board').style.width = inner + 'px'; $('board').style.height = inner + 'px';
  $('board').style.setProperty('--cs', (inner / G.n) + 'px');
}
window.addEventListener('resize', layout);
if(window.ResizeObserver) new ResizeObserver(layout).observe($('stage-wrap'));

/* ---------- turns ---------- */
function isHumanTurn(){ return G && !G.over && (G.lx ? G.turn === G.lx.me : (G.mode === 'duo' || G.turn === 1)); }   // 📡 lk-3c: linked = only your own colour
function startTurn(){
  G.moves = genMoves(G.b, G.n, G.turn); G.prefix = null;
  if(!G.moves.length){ endGame(-G.turn, 'stuck'); return; }
  if(G.quiet >= 80){ endGame(0, 'draw'); return; }
  updatePlayers();
  render();
  if(G.lx) lxTurn();   // 📡 lk-3c: no bot — the other device moves (or 🤖 for a dropped player)
  if(isHumanTurn()){
    clockStart();
    if(G.moves[0].caps.length && !(G.L.hardcore && G.mode === 'bot')) showBanner((G.mode === 'duo' && !G.lx ? G.names[G.turn] + ', you' : 'You') + ' must jump! 🟠', 'warn');
  } else if(!G.lx){
    $('pl-op').classList.add('thinking'); if(window.Cheer) Cheer.hush(true);   /* 🤫 cs-3a */
    botTimer = setTimeout(() => {
      if(!G || G.over || G.pausedAt) return;
      const t0 = performance.now(), m = botChoice(G.b, G.n, G.L);
      const wait = Math.max(0, (G.lvl === 0 ? 650 : 450) - (performance.now() - t0));
      botTimer = setTimeout(() => { $('pl-op').classList.remove('thinking'); playMove(m); }, wait);
    }, 60);
  }
}
function updatePlayers(){
  const cnt = s => G.b.filter(v => Math.sign(v) === s).length, kings = s => G.b.filter(v => v === 2 * s).length;
  [[1, 'me'], [-1, 'op']].forEach(([s, k]) => {
    $('st-' + k).textContent = cnt(s) + ' pieces' + (kings(s) ? ' · ' + kings(s) + ' 👑' : '');
    $('pl-' + k).classList.toggle('turn', !G.over && G.turn === s);
    $('tray-' + k).innerHTML = Array.from({length: G.takenBy[s]}, () => '<i style="background:radial-gradient(circle at 35% 30%,var(--' + (s > 0 ? 'p2a' : 'p1a') + '),var(--' + (s > 0 ? 'p2b' : 'p1b') + ') 70%)"></i>').join('');
  });
  $('turn-msg').textContent = G.over ? 'Game over' : G.lx ? (G.turn === G.lx.me ? '👉 Your turn' : '⏳ ' + G.names[G.turn] + ' is thinking…') : G.mode === 'bot' ? (G.turn === 1 ? '👉 Your turn' : '🤖 ' + G.L.bot + ' is thinking…') : '👉 ' + G.names[G.turn] + '\'s turn';
}
function targets(){ const p = G.prefix; return [...new Set(G.moves.filter(m => p.every((s, k) => m.path[k] === s) && m.path.length > p.length).map(m => m.path[p.length]))]; }
function tapSquare(i){
  if(!isHumanTurn() || G.busy || G.pausedAt) return;
  const v = G.b[i];
  // pick (or switch to) one of my pieces — not in the middle of a multi-jump
  if(v && Math.sign(v) === G.turn && !(G.prefix && G.prefix.length > 1)){
    if(!G.moves.some(m => m.path[0] === i)){
      UISound.play('error');
      showBanner(G.moves[0].caps.length ? 'You must jump with a glowing piece! 🟠' : 'That piece can\'t move right now', 'bad');
      return;
    }
    G.prefix = [i]; G.hopCaps = 0; UISound.play('tap'); render(); return;
  }
  if(!G.prefix){ return; }
  if(!targets().includes(i)){ UISound.play('error'); if(G.prefix.length === 1){ G.prefix = null; render(); } else showBanner('Keep jumping! Tap a glowing ring', 'warn'); return; }
  // one hop
  const from = G.prefix[G.prefix.length - 1];
  G.prefix.push(i);
  const done = G.moves.filter(m => m.path.length === G.prefix.length && G.prefix.every((s, k) => m.path[k] === s));
  const more = targets();
  hopVisual(from, i, G.prefix[0]);
  if(done.length && !more.length){ commit(done[0]); return; }
  render(); showBanner('Double jump! Keep going 🎉', 'warn');
}
// Animate one hop of the moving piece (and fade the jumped piece).
function hopVisual(from, to, origin){
  const e = $('pc-' + G.ids[origin]); if(!e) return;
  e.classList.remove('hop'); void e.offsetWidth; e.classList.add('hop');
  placePiece(e, to);
  const r1 = (from / G.n) | 0, r2 = (to / G.n) | 0;
  if(Math.abs(r1 - r2) === 2){
    const mid = ((r1 + r2) / 2) * G.n + ((from % G.n) + (to % G.n)) / 2;
    takeOut(mid, from);
    tableRide(Math.sign(G.b[origin]), e, mid, 90);   // 🧑 the mover's avatar rides the piece and kicks the taken one
    G.hopCaps = (G.hopCaps || 0) + 1;
    if(G.hopCaps >= 2){ hopNumber(to, G.hopCaps); chime(G.hopCaps); e.classList.remove('rainbow'); void e.offsetWidth; e.classList.add('rainbow'); }
  } else UISound.play('drop');
}
/* ---------- take-out effects ----------
   Normal pieces: knock (flies off with wood chips), poof (sparkles), zap (laser + pixels),
   squash (pancake + dust), pop (bubble pop + drops). Kings get a power-up ending:
   meteor (crash + shake), strike (lightning), vortex (black hole), rocket (fireworks),
   tornado. Picked at random, never the same twice in a row; colours follow the board design. */
function sqCenter(sq){ const n = G.n, cs = $('board').clientWidth / n; sq = lxV(sq); return [(sq % n + 0.5) * cs, (((sq / n) | 0) + 0.5) * cs, cs]; }
function fxEl(cls, x, y, vars, text, life){ const e = document.createElement('div'); e.className = 'fx ' + cls; e.style.left = x + 'px'; e.style.top = y + 'px'; Object.keys(vars || {}).forEach(k => e.style.setProperty(k, vars[k])); if(text) e.textContent = text; $('board').appendChild(e); setTimeout(() => e.remove(), life || 1400); return e; }
function burstOf(cls, x, y, cs, count, spread, extra){ for(let k = 0; k < count; k++){ const a = Math.random() * Math.PI * 2, d = cs * (spread[0] + Math.random() * spread[1]); fxEl(cls, x, y, Object.assign({'--dx': Math.cos(a) * d + 'px', '--dy': (Math.sin(a) * d - cs * 0.25) + 'px', '--rot': (Math.random() * 600 - 300) + 'deg'}, typeof extra === 'function' ? extra(k) : extra || {}), null); } }
function sparks(x, y, cs, list, up){ list.forEach((b, k) => { const a = k / list.length * Math.PI * 2, d = cs * (0.55 + Math.random() * 0.4); fxEl('spark', x, y, {'--dx': Math.cos(a) * d + 'px', '--dy': (Math.sin(a) * d - cs * (up || 0.35)) + 'px', '--rot': (Math.random() * 180 - 90) + 'deg'}, b); }); }
function pieceColor(sq){ return G.b[sq] > 0 ? DESIGNS[design].p1 : DESIGNS[design].p2; }
const TAKE_NORMAL = {
  knock(e, x, y, cs){ e.classList.add('gone'); UISound.play('bump'); burstOf('chip', x, y, cs, 7, [0.5, 0.6], {}); for(let k = 0; k < 3; k++) fxEl('puff', x, y + cs * 0.2, {'--dx': (k - 1) * cs * 0.4 + 'px', '--dy': -cs * 0.1 + 'px'}, '💨'); },
  poof(e, x, y, cs){ setTimeout(() => e.classList.add('gone'), 60); UISound.play('pop'); setTimeout(() => UISound.play('success'), 160); sparks(x, y, cs, ['✨', '⭐', '💖', '🌟', '✨', '💫', '🌸', '✨']); fxEl('ring', x, y, {'--pxc': '#FF7EB9'}); },
  zap(e, x, y, cs, bx, by, sq){
    const col = pieceColor(sq), shooter = G.b[sq] > 0 ? DESIGNS[design].p2 : DESIGNS[design].p1, len = Math.hypot(x - bx, y - by), ang = Math.atan2(y - by, x - bx);
    const beam = fxEl('beam', bx, by - cs * 0.04, {'--pxc': shooter}); beam.style.width = len + 'px'; beam.style.transform = 'rotate(' + ang + 'rad)';
    e.classList.add('gone'); UISound.play('whoosh');
    setTimeout(() => { UISound.play('bump'); fxEl('ring', x, y, {'--pxc': col}); burstOf('px', x, y, cs, 12, [0.4, 0.7], k => ({'--rot': '0deg', '--pxc': k % 3 ? col : '#FFFFFF'})); }, 140);
  },
  squash(e, x, y, cs){ e.classList.add('gone'); UISound.play('drop'); setTimeout(() => { UISound.play('bump'); [-1, 1].forEach(s => fxEl('puff', x + s * cs * 0.25, y + cs * 0.25, {'--dx': s * cs * 0.5 + 'px', '--dy': '0px'}, '💨')); fxEl('ring', x, y + cs * 0.15, {'--pxc': 'rgba(255,255,255,0.8)'}); }, 300); },
  pop(e, x, y, cs, bx, by, sq){ e.classList.add('gone'); setTimeout(() => { UISound.play('pop'); fxEl('ring', x, y, {'--pxc': '#FFFFFF'}); burstOf('drip', x, y, cs, 10, [0.45, 0.4], {'--pxc': pieceColor(sq)}); }, 380); }
};
const TAKE_KING = {
  meteor(e, x, y, cs){ fxEl('drop', x, y, {}, '☄️', 700); UISound.play('whoosh'); setTimeout(() => { e.classList.add('gone'); UISound.play('bump'); if(!REDUCED){ const f = $('frame'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); } fxEl('ring', x, y, {'--pxc': '#FF9F1C'}); burstOf('chip', x, y, cs, 10, [0.5, 0.9], {}); sparks(x, y, cs, ['🔥', '💥', '🔥', '✨']); }, 360); },
  strike(e, x, y, cs){ fxEl('bolt', x, y, {}, null, 600); UISound.play('bump'); setTimeout(() => { e.classList.add('gone'); fxEl('ring', x, y, {'--pxc': '#FFE066'}); sparks(x, y, cs, ['⚡', '💥', '⚡', '✨', '⚡']); }, 200); },
  vortex(e, x, y, cs){ fxEl('hole', x, y, {}, null, 1400); UISound.play('whoosh'); setTimeout(() => { e.classList.add('gone'); UISound.play('unlock'); }, 150); },
  rocket(e, x, y, cs){ e.classList.add('gone'); UISound.play('whoosh'); burstOf('puff', x, y + cs * 0.2, cs, 3, [0.2, 0.3], {}); setTimeout(() => { UISound.play('success'); const fy = y - cs * 3.6; ['🎆', '🎇', '✨', '⭐', '🎆', '✨', '🌟', '🎇'].forEach((b, k) => { const a = k / 8 * Math.PI * 2; fxEl('spark', x, fy, {'--dx': Math.cos(a) * cs + 'px', '--dy': Math.sin(a) * cs + 'px'}, b); }); fxEl('ring', x, fy, {'--pxc': '#FFC845'}); }, 650); },
  tornado(e, x, y, cs){ fxEl('twist', x, y, {'--dx': cs * 1.2 + 'px'}, '🌪️', 1300); UISound.play('whoosh'); setTimeout(() => { e.classList.add('gone'); burstOf('chip', x, y, cs, 6, [0.4, 0.5], {}); }, 120); }
};
// Theme captures: comic POW (heroes), bark / meow puff (pets), a dance-off (dance crews).
const POW_WORDS = ['POW!', 'BAM!', 'ZAP!', 'WHAM!', 'KAPOW!', 'BOOM!'];
const DANCE_MOVES = ['Spin!', 'Freeze!', 'Robot!', 'Wave!', 'Slide!', 'Twirl!', 'Pop & lock!', 'Moonwalk!'];
const TAKE_THEME = {
  pow(e, x, y, cs, bx, by, sq){ fxEl('pow', x, y, {}, pick(POW_WORDS), 800); UISound.play('bump'); if(Math.abs(G.b[sq]) === 2) sparks(x, y, cs, ['⭐', '💥', '⭐', '✨', '💥']); setTimeout(() => { e.classList.add('gone', 't-knock'); burstOf('chip', x, y, cs, 5, [0.4, 0.5], {}); }, 120); },
  pets(e, x, y, cs, bx, by, sq){ const cat = G.b[sq] < 0, catWins = !cat; fxEl('says', x, y - cs * 0.3, {'--dx': '0px', '--dy': -cs * 0.6 + 'px'}, cat ? pick(['Woof!', 'Arf arf!', 'Yip!']) + ' 🐶' : pick(['Meow!', 'Hiss!', 'Mrrrow!']) + ' 🐱');
    UISound.play('pop'); setTimeout(() => { e.classList.add('gone', 't-poof'); for(let k = 0; k < 4; k++) fxEl('puff', x, y + cs * 0.1, {'--dx': (k - 1.5) * cs * 0.35 + 'px', '--dy': -cs * 0.15 + 'px'}, k % 2 ? '💨' : '🐾'); sparks(x, y, cs, catWins ? ['🦴', '✨', '🐾'] : ['🧶', '✨', '🐾']); }, 160); },
  battle(e, x, y, cs, bx, by, sq, bySq){
    // the two dancers face off on the jumped square, quick moves, the loser spins off the board
    const quick = G.mode === 'bot' && G.b[sq] > 0 || (G.hopCaps || 0) >= 1, bt = REDUCED ? 0.7 : quick ? 0.75 : 1.05;
    const atk = DESIGNS.dance.emb[G.b[sq] > 0 ? 1 : 0], vic = DESIGNS.dance.emb[G.b[sq] > 0 ? 0 : 1];
    const f = fxEl('battle', x, y, {'--bt': bt + 's'}, null, bt * 1000 + 100);
    f.innerHTML = '<b class="a">' + atk + '</b><b class="v">' + vic + '</b><i>' + pick(DANCE_MOVES) + '</i>';
    e.style.opacity = '0.15'; UISound.play('whoosh'); [0.25, 0.5, 0.75].forEach(t => setTimeout(() => UISound.play('key'), bt * t * 1000));
    G.battles = (G.battles || 0) + 1;
    setTimeout(() => { e.style.opacity = ''; e.classList.add('gone', 't-spinoff'); UISound.play('pop'); sparks(x, y, cs, ['🎵', '✨', '🎶', '⭐']); }, bt * 800);
  }
};
let lastTake = '';
function takeOut(sq, bySq){
  const e = $('pc-' + G.ids[sq]); if(!e) return;
  const [x, y, cs] = sqCenter(sq), [bx, by] = bySq == null ? [x, y] : sqCenter(bySq);
  e.style.setProperty('--kx', (x >= bx ? 1 : -1) * 160 + '%');
  const theme = DESIGNS[design].take;
  if(theme && TAKE_THEME[theme]){ TAKE_THEME[theme](e, x, y, cs, bx, by, sq, bySq); return; }
  const set = Math.abs(G.b[sq]) === 2 ? TAKE_KING : TAKE_NORMAL;
  const names = Object.keys(set).filter(k => k !== lastTake), kind = pick(names);
  lastTake = kind; e.classList.add('t-' + kind);
  set[kind](e, x, y, cs, bx, by, sq);
  if(set === TAKE_KING && G.b[sq] < 0) setTimeout(() => showBanner('💥 You took a King!'), 300);
}
/* ---------- 💃 Dance Battle: a little beat loop (WebAudio) and dancers that follow its tempo ---------- */
const DANCE = {bpm: 112, beats: 0, ctx: null, timer: 0, next: 0, on: false};
function beatSec(){ return 60 / DANCE.bpm; }
// give one dancer a random move and a random offset (whole or half beats) so the crew is never all in sync
function danceMove(el){ if(!el) return; el.style.animationName = pick(['dbob', 'dsway', 'dstep', 'dspin', 'dhop']); el.style.animationDelay = (-(rnd(4) * 0.5) * beatSec()).toFixed(3) + 's'; el.style.setProperty('--amp', REDUCED ? 0.4 : 1); }
function danceStart(){
  danceStop(); if(design !== 'dance') return;
  DANCE.on = true; DANCE.beats = 0; $('scr-play').style.setProperty('--beat', beatSec().toFixed(3) + 's');
  try { const snd = UISound.get(); if(snd.enabled !== false){ DANCE.ctx = DANCE.ctx || new (window.AudioContext || window.webkitAudioContext)(); if(DANCE.ctx.state === 'suspended') DANCE.ctx.resume(); DANCE.next = DANCE.ctx.currentTime + 0.05; } } catch(e){ DANCE.ctx = null; }
  const tick = () => {
    if(!DANCE.on) return;
    DANCE.beats++;
    const f = $('frame'); if(f){ f.classList.add('thump'); setTimeout(() => f.classList.remove('thump'), 90); }
    if(DANCE.beats % 8 === 0) [...document.querySelectorAll('#board .pc:not(.gone) .emb')].forEach(el => { if(Math.random() < 0.3) danceMove(el); });   // swap some moves now and then
    danceSound();
    DANCE.timer = setTimeout(tick, beatSec() * 1000);
  };
  DANCE.timer = setTimeout(tick, 60);
}
function danceStop(){ DANCE.on = false; clearTimeout(DANCE.timer); }
// kick on every beat, hi-hat on the off-beat, a bass note every other beat (quiet, follows the sound settings)
function danceSound(){
  const c = DANCE.ctx; if(!c) return;
  let snd = {}; try { snd = UISound.get(); } catch(e){} if(snd.enabled === false || (G && G.pausedAt)) return;
  const vol = Math.max(0.05, Math.min(1, snd.volume == null ? 0.6 : snd.volume)) * 0.35, t = Math.max(c.currentTime + 0.01, DANCE.next); DANCE.next = t + beatSec();
  const env = (g, at, peak, dur) => { g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, at + dur); };
  const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18); env(g, t, vol, 0.22); o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.25);
  const h = c.createOscillator(), hg = c.createGain(), ht = t + beatSec() / 2; h.type = 'square'; h.frequency.value = 7000 + Math.random() * 900; env(hg, ht, vol * 0.12, 0.05); h.connect(hg).connect(c.destination); h.start(ht); h.stop(ht + 0.07);
  if(DANCE.beats % 2 === 0){ const bn = [55, 55, 65.4, 49][(DANCE.beats / 2) % 4 | 0], b = c.createOscillator(), bg = c.createGain(); b.type = 'triangle'; b.frequency.value = bn; env(bg, t, vol * 0.6, beatSec() * 0.9); b.connect(bg).connect(c.destination); b.start(t); b.stop(t + beatSec()); }
}
// The bot (or a replay) plays a whole move hop by hop.
function playMove(m){ if(window.Cheer) Cheer.hush(false);   /* 📣 cs-3a: the move is in → the crowd may cheer */
  if(!G || G.over || !m) return;
  G.busy = true; G.hopCaps = 0;
  let k = 1;
  const step = () => {
    if(!G) return;
    hopVisual(m.path[k - 1], m.path[k], m.path[0]);
    k++;
    if(k < m.path.length) botTimer = setTimeout(step, 340);
    else botTimer = setTimeout(() => { G.busy = false; commit(m); }, 300);
  };
  step();
}
function commit(m){
  if(G.lx && !m.rm) lxSendMove(m);   // 📡 lk-3c: my move → the other device
  const n = G.n, from = m.path[0], to = m.path[m.path.length - 1], v = G.b[from];
  const id = G.ids[from];
  m.caps.forEach(c => { const e = $('pc-' + G.ids[c]); if(e){ e.classList.add('gone'); setTimeout(() => e.remove(), 1500); } G.ids[c] = 0; });
  G.ids[from] = 0; G.ids[to] = id;
  const nb = applyMove(G.b, n, m);
  const crowned = Math.abs(v) === 1 && Math.abs(nb[to]) === 2;
  G.b = nb; G.plies++; G.last = [from, to];
  G.takenBy[Math.sign(v)] += m.caps.length;
  G.quiet = (m.caps.length || Math.abs(v) === 1) ? 0 : G.quiet + 1;
  const side = Math.sign(v), voice = Math.abs(v) === 2 ? 'king' : 'man';
  if(G.mode === 'bot' && side === 1){ const f = G.feats; if(m.caps.length === 2) f.doubles++; else if(m.caps.length === 3) f.triples++; else if(m.caps.length >= 4) f.megas++; if(crowned) f.kings++; }
  if(m.caps.length >= 2) bigJump(m, side);
  else if(m.caps.length === 1){
    if(Math.random() < 0.6) bubble(to, pickLine(LINES.jump), side, G.mode === 'bot' && side < 0 ? 'bot' : voice);
    else setTimeout(() => G && bubble(m.caps[0], pickLine(LINES.cry), -side, null), 250);
  }
  if(crowned){
    UISound.play('success'); crownDrop(to, DESIGNS[design].crown);
    setTimeout(() => { if(!G) return; bubble(to, pickLine(LINES.king), side, 'king'); }, m.caps.length >= 2 ? 1300 : 350);
    if(side === (G.lx ? G.lx.me : 1)){ G.kings++; showBanner('👑 Kings can move backwards too!'); } else showBanner(G.names[side] + ' got a King 👑', 'warn');   // 📡 lk-3c: "you" = this device's colour
  }
  if(m.caps.length){ tableRideEnd(); tableReact(side, 'cheer'); tableReact(-side, 'facepalm'); }   // 🧑 table avatars react
  if(crowned) tablePromo(side, to);   // 👑 the avatar jumps onto the new King and dances
  // streaks: captures on several turns in a row
  G.streak = G.streak || {1: 0, '-1': 0};
  G.streak[side] = m.caps.length ? G.streak[side] + 1 : 0;
  if(G.streak[side] === 3){ showBanner('🔥 ' + G.names[side] + ' is on fire — 3 turns of jumps in a row!', 'warn'); setTimeout(() => G && bubble(to, pickLine(LINES.fire), side, voice), 900); }
  cheerMove(m, side, crowned);   /* 📣 cs-3a */
  G.turn = -G.turn;
  startTurn();
}
/* 📣 CHEERSQUAD (cs-3a) START — the crowd beside the board (CheerSquad.html, 📣 Cheer chat; the SAME block idea in Chess + Checkers). Don't remove: the Cheer chat re-applies it. */
// sides: 0 = the bottom player (you), 1 = the top (🤖 robot or your friend)
function cheerTaken(){ return [$('gbar'), $('frame'), ...Array.from($('side').children), ...document.querySelectorAll('.top-btn')]; }
function cheerMount(){
  if(!window.Cheer) return; Cheer.unmount();
  const duo = G.mode === 'duo', box = $('scr-play');
  Cheer.mount(box, {game: 'checkers', players: [{name: S.player, side: 0, human: true}, {name: G.names[-1], side: 1, human: duo}], me: {name: S.player},
    family: (S.players || []).map(p => p.Name).filter(n => n !== G.names[-1]), avatars: S.avatars || {}, mode: 'overlay',
    zones: () => Cheer.freeZones(box, cheerTaken), avoid: cheerTaken,
    clear: b => { const B = box.getBoundingClientRect(), F = $('frame').getBoundingClientRect(), l = F.left - B.left, t = F.top - B.top; return !(b.r > l - 3 && b.l < l + F.width + 3 && b.b > t - 3 && b.t < t + F.height + 3); }});
}
// a move is in: side = the mover (1 = bottom, -1 = top) — one jump = goal · double+ jump / crowned = big (3 turns of jumps in a row = the kit's streak)
function cheerMove(m, side, crowned){ if(!window.Cheer || !Cheer.active() || !G) return;
  const kind = m.caps.length >= 2 || crowned ? 'big' : m.caps.length ? 'goal' : '';
  if(kind) Cheer.react(kind, {side: side > 0 ? 0 : 1}); }
function cheerEnd(winner){ if(!window.Cheer || !Cheer.active() || !G) return; Cheer.hush(false);
  if(!winner) Cheer.react('goal', {side: -1});   /* 🤝 a draw: everyone claps */
  else if(winner > 0) Cheer.react('win', {side: 0});
  else Cheer.react(G.mode === 'duo' ? 'win' : 'lose', {side: G.mode === 'duo' ? 1 : 0}); }
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(!at) return; card.insertBefore(c, at); card.insertBefore(cap, at); }, 900); }
/* 📣 CHEERSQUAD END */
function showHint(){
  if(!G || G.over || !isHumanTurn() || G.mode !== 'bot') return;
  const m = bestMove(G.b, G.n, 1, 4, 400);
  if(!m) return;
  G.hintUsed = true; G.prefix = null; render();
  const e = $('pc-' + G.ids[m.path[0]]); if(e) e.classList.add('hint');
  m.path.slice(1).forEach(s => $('board').children[s].classList.add('hint-to'));
  showBanner('💡 Try this move! (hints give 2 ⭐ at most)');
  setTimeout(() => { if(G && !G.over && isHumanTurn() && !G.prefix) render(); }, 3200);
}

/* ================= 🧑 TABLE AVATARS (plan 11w, 2026-11-06) — the SAME block is in Chess.html and Checkers.html: keep them in step =================
   Both players sit at the table (a seat canvas in each player card, a wooden table edge in front) and react: 🎉 cheer when they take
   a piece, 🤦 facepalm when they lose one, a little move now and then on their turn, a dance when they win, sad when they lose.
   On EVERY capture the mover's avatar rides the moving piece and kicks the taken piece away; on a promotion (👑 King / new Queen)
   the avatar jumps onto the new piece and dances. The bot is a 🤖. One rAF for everything (TB.raf) — it stops once the game closes. */
const HAS_AV = typeof drawAvatar === 'function' && typeof GESTURES !== 'undefined';
function myAvatar(name){ const a = S.avatars && S.avatars[name]; return HAS_AV ? (a ? fixAv(a) : defaultAvatar(name || 'player')) : null; }
const TB_FACEPALM = {k: 'facepalm', n: 'Facepalm', d: 1.5, f: (p, t) => ({armR: 2.75, armL: 0.3, eyes: 'closed', rot: 0.06 + Math.sin(t * 3) * 0.03, dy: 2, fx: '🤦'})};
const TB_SAD = {k: 'sad', n: 'Sad', d: 2.2, f: (p, t) => ({armL: 0.05, armR: 0.05, eyes: 'closed', rot: 0.1, dy: 3 + Math.sin(t * 2), fx: '💧'})};
const tbG = k => HAS_AV ? GESTURES.find(g => g.k === k) : null;
const TB = {seats: {}, actors: [], raf: 0, ov: null};
function tbTurn(){ return G ? (G.P ? G.P.turn : G.turn) : 0; }
function tableStart(){
  TB.actors = []; TB.seats = {};
  if(!HAS_AV || !G) return;
  [[1, 'me'], [-1, 'op']].forEach(([s, k]) => {
    const pl = $('pl-' + k); let cv = pl.querySelector('canvas.seat');
    if(!cv){ cv = document.createElement('canvas'); cv.className = 'seat'; cv.setAttribute('aria-hidden', 'true'); pl.insertBefore(cv, pl.firstChild); }
    const bot = G.mode === 'bot' && s < 0;
    TB.seats[s] = {cv, bot, av: bot ? null : myAvatar(G.names[s]), name: G.names[s], g: null, t0: 0, loop: false, next: performance.now() + 2500 + Math.random() * 3000};
  });
  let ov = $('tb-ov'); if(!ov){ ov = document.createElement('canvas'); ov.id = 'tb-ov'; ov.setAttribute('aria-hidden', 'true'); }
  if(ov.parentNode !== $('board')) $('board').appendChild(ov);
  TB.ov = ov;
  if(!TB.raf) TB.raf = requestAnimationFrame(tableTick);
}
// kind: cheer · facepalm · think · win (dances until the next game) · sad (until the next game)
function tableReact(side, kind){
  const s = TB.seats[side]; if(!s) return;
  const g = kind === 'facepalm' ? TB_FACEPALM : kind === 'sad' ? TB_SAD : kind === 'win' ? (pick(EPIC_DANCES.length ? EPIC_DANCES : [tbG('dance')]) || tbG('dance')) : tbG(kind);
  if(!g) return;
  s.g = g; s.t0 = performance.now(); s.loop = kind === 'win' || kind === 'sad'; s.kind = kind;
}
function tableEnd(winner){ if(winner){ tableReact(winner, 'win'); tableReact(-winner, 'sad'); } else { tableReact(1, 'shrug'); tableReact(-1, 'shrug'); } }
// The mover's avatar rides piece element `el`; it kicks toward square `capSq` after `delay` ms. Called again for each jump of a multi-jump.
function tableRide(side, el, capSq, delay){
  if(!HAS_AV || !el || !TB.ov) return;
  const now = performance.now();
  let a = TB.actors.find(x => x.kind === 'ride' && x.el === el && !x.end);
  if(!a){ a = {kind: 'ride', side, el, t0: now, end: 0, kickAt: 0, kickUntil: 0, dir: 1, x: 0, y: 0}; TB.actors.push(a); }
  const [cx] = sqXY(capSq); a.kx = cx; a.kickAt = now + (delay || 0); a.kickUntil = a.kickAt + 420;
}
function tableRideEnd(){ const now = performance.now(); TB.actors.forEach(a => { if(a.kind === 'ride' && !a.end) a.end = now + 420; }); }   // stays while the piece glides, then hops off
// Promotion: the avatar jumps onto the new piece on square `sq` and dances.
function tablePromo(side, sq){
  if(!HAS_AV || !TB.ov) return;
  const el = $('pc-' + G.ids[sq]); if(!el) return;
  TB.actors = TB.actors.filter(a => !(a.kind === 'ride' && a.side === side));
  TB.actors.push({kind: 'promo', side, el, t0: performance.now() + 250, g: pick(EPIC_DANCES.length ? EPIC_DANCES : [tbG('dance')]), x: 0, y: 0});
}
function tbElXY(el, a){
  if(el && el.isConnected){ const b = $('board').getBoundingClientRect(), r = el.getBoundingClientRect(); if(r.width){ a.x = r.left - b.left + r.width / 2; a.y = r.top - b.top + r.height / 2; } }
  return [a.x, a.y];
}
function tbBot(g, x, y, size, kind, t, flip){   // the bot: a 🤖 that hops, wobbles, droops
  let dy = 0, rot = 0, extra = '';
  if(kind === 'cheer' || kind === 'win'){ dy = -Math.abs(Math.sin(t * 9)) * size * 0.18; rot = Math.sin(t * 9) * 0.15; extra = kind === 'win' ? '🎉' : '✨'; }
  else if(kind === 'facepalm'){ rot = 0.25; extra = '😵'; }
  else if(kind === 'sad'){ rot = 0.18; dy = size * 0.06; extra = '💧'; }
  else if(kind === 'think'){ rot = Math.sin(t * 2) * 0.06; extra = '🤔'; }
  else dy = Math.sin(t * 2.4) * size * 0.03;
  g.save(); g.translate(x, y + dy); g.rotate(rot); emo(g, '🤖', 0, 0, size, 1, flip); g.restore();
  if(extra) emo(g, extra, x + size * 0.42, y - size * 0.42 + Math.sin(t * 4) * size * 0.04, size * 0.38);
}
const TB_SEAT_MOVES = ['think', 'clap', 'wave', 'dance', 'stretch', 'dab', 'flex', 'cheer', 'shrug'].concat(EPIC_DANCES.map(g => g.k));   // r32
function tableTick(now){
  TB.raf = 0;
  if(!G || $('scr-play').classList.contains('hidden')) return;
  const t = now / 1000;
  // seats
  [1, -1].forEach(s => {
    const S2 = TB.seats[s]; if(!S2) return;
    const cv = S2.cv, r = cv.getBoundingClientRect(); if(!r.width || !r.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
    if(cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; }
    if(!S2.g && now > S2.next && !G.over && tbTurn() === s && !S2.bot){ S2.g = pick(['think', 'clap', 'wave', 'dance', 'stretch', 'dab', 'flex'].map(tbG).filter(Boolean)); S2.t0 = now; S2.loop = false; S2.kind = 'idle'; }
    let gest = null;
    if(S2.g){ const tt = (now - S2.t0) / 1000, len = S2.loop ? 1e9 : (S2.g.d < 1.6 ? S2.g.d * 2 : S2.g.d); if(tt > len){ S2.g = null; S2.kind = ''; S2.next = now + 5000 + Math.random() * 6000; } else gest = {g: S2.g, t: tt % S2.g.d}; }
    const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    try {
      if(S2.bot) tbBot(g, W / 2, H * 0.44, H * 0.62, S2.g ? S2.kind : '', t, false);
      else {   // r32: behind the table — shrink just enough that hats, wings and raised arms in every seat move stay inside the frame
        if(!S2.seatAv){ S2.seatAv = fixAv(S2.av); if(S2.seatAv.eq && S2.seatAv.eq.ride){ S2.seatAv = JSON.parse(JSON.stringify(S2.seatAv)); delete S2.seatAv.eq.ride; } }   // seated at the table: no ride-on
        let k = H / 76;
        if(typeof avatarExtent_ === 'function'){ const e = avatarExtent_(S2.seatAv, S2.name, TB_SEAT_MOVES); k = Math.max(k * 0.8, Math.min(k, (H * 1.14 - 2) / Math.max(1, -e.top), (W / 2 - 2) / Math.max(1, -e.left, e.right))); }
        drawAvatar(g, {name: S2.name, av: S2.seatAv, dir: s > 0 ? 1 : -1, walkT: 0, gest}, W / 2, H * 1.14, k, {t});
      }
    } catch(e){}
    // the table edge in front (a little board on it)
    g.fillStyle = '#7A4B24'; rrect(g, -4, H * 0.8, W + 8, H * 0.3, H * 0.06); g.fill();
    g.fillStyle = '#A8733F'; rrect(g, -4, H * 0.78, W + 8, H * 0.08, H * 0.04); g.fill();
    const bw = W * 0.34; for(let i = 0; i < 4; i++){ g.fillStyle = i % 2 ? '#F2E3C6' : '#3E2A1A'; g.fillRect(W / 2 - bw / 2 + i * bw / 4, H * 0.79, bw / 4, H * 0.05); }
  });
  // board overlay: riders + promotion dancers
  const ov = TB.ov, bd = $('board');
  if(ov && bd && ov.parentNode !== bd) bd.appendChild(ov);   // buildBoard() empties the board — put the overlay back
  if(ov && bd){
    const dpr = Math.min(2, window.devicePixelRatio || 1), bw = bd.clientWidth, cs = bw / G.n, top = cs * 1.3, bh = bd.clientHeight + top, W = Math.round(bw * dpr), H = Math.round(bh * dpr);
    if(ov.width !== W || ov.height !== H){ ov.width = W; ov.height = H; }
    const g = ov.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.setTransform(dpr, 0, 0, dpr, 0, top * dpr);   // board coordinates, with room above the top row
    TB.actors = TB.actors.filter(a => a.kind === 'ride' ? (!a.end || now < a.end + 360) && now - a.t0 < 7000 : now < a.t0 + 2700);
    TB.actors.forEach(a => {
      const [x, y] = tbElXY(a.el, a), S2 = TB.seats[a.side]; if(!S2) return;
      let alpha = 1, lift = 0, pose = null, gest = null;
      if(a.kind === 'ride'){
        if(now - a.t0 < 160) alpha = (now - a.t0) / 160;
        if(a.end && now > a.end){ const p = (now - a.end) / 360; alpha = 1 - p; lift = Math.sin(p * Math.PI) * cs * 0.5; }
        const kicking = now >= a.kickAt && now < a.kickUntil;
        if(kicking) a.dir = a.kx >= x ? 1 : -1;
        pose = kicking ? {legR: -1.25, legL: 0.25, armL: 2.5, armR: 1.1, mouth: 'open', eyes: 'happy', rot: -0.12}
                       : {armL: 2.3, armR: 2.3, legL: 0.35, legR: -0.35, mouth: 'open', eyes: 'happy', dy: -Math.abs(Math.sin(t * 10)) * 3};
        const fy = y - cs * 0.06 - lift;
        g.globalAlpha = Math.max(0, alpha);
        try {
          if(S2.bot){ g.save(); g.translate(x, fy - cs * 0.28); if(kicking) g.rotate(a.dir * 0.35); emo(g, '🤖', 0, 0, cs * 0.55, 1, a.dir < 0); g.restore(); }
          else drawAvatar(g, {name: S2.name, av: S2.av, dir: a.dir, walkT: 0}, x, fy, cs / 108, {t, pose});
          if(kicking) emo(g, '💥', x + a.dir * cs * 0.42, fy - cs * 0.12, cs * 0.34, 1 - (now - a.kickAt) / 420);
        } catch(e){}
        g.globalAlpha = 1;
      } else {   // promo: jump in from above, land on the piece, dance
        const p = now - a.t0; if(p < 0) return;
        if(p < 380){ const e = p / 380; lift = (1 - e) * cs * 1.6 - Math.sin(e * Math.PI) * cs * 0.4; pose = {armL: 2.8, armR: 2.8, legL: 0.4, legR: -0.4, mouth: 'open'}; }
        else gest = {g: a.g, t: ((p - 380) / 1000) % a.g.d};
        if(p > 2400) alpha = 1 - (p - 2400) / 300;
        g.globalAlpha = Math.max(0, alpha);
        const fy = y - cs * 0.08 - lift;
        try {
          if(S2.bot){ g.save(); g.translate(x, fy - cs * 0.3); g.rotate(p > 380 ? Math.sin(t * 8) * 0.3 : 0); emo(g, '🤖', 0, 0, cs * 0.6); g.restore(); emo(g, '🎵', x + cs * 0.35, fy - cs * 0.7 + Math.sin(t * 5) * 4, cs * 0.26); }
          else drawAvatar(g, {name: S2.name, av: S2.av, dir: a.side > 0 ? 1 : -1, walkT: 0, gest}, x, fy, cs / 100, {t, pose});
        } catch(e){}
        g.globalAlpha = 1;
      }
    });
  }
  TB.raf = requestAnimationFrame(tableTick);
}

/* ================= ALIVE: talking pieces + big moments ================= */
function sqXY(sq){ const n = G.n, cs = $('board').clientWidth / n; sq = lxV(sq); return [(sq % n + 0.5) * cs, (((sq / n) | 0) + 0.5) * cs, cs]; }
const bubbles = {};
// A speech bubble above a square (one per side at a time); optionally spoken with the piece's own voice.
function bubble(sq, text, side, voice){
  if(sq == null || sq < 0 || !G) return;
  const key = side > 0 ? 'me' : 'op';
  if(bubbles[key]){ bubbles[key].remove(); bubbles[key] = null; }
  const [x, y, cs] = sqXY(sq), bw = $('board').clientWidth, e = document.createElement('div');
  e.className = 'bubble' + (side > 0 ? '' : ' op'); e.textContent = text;
  $('board').appendChild(e);
  const w = e.offsetWidth, left = Math.max(w / 2 + 2, Math.min(bw - w / 2 - 2, x));
  e.style.left = left + 'px'; e.style.top = y + 'px'; if(y < cs * 1.3) e.classList.add('below');
  e.style.setProperty('--tail', Math.max(14, Math.min(w - 14, w / 2 + (x - left))) + 'px');
  bubbles[key] = e;
  setTimeout(() => { e.classList.add('out'); setTimeout(() => { e.remove(); if(bubbles[key] === e) bubbles[key] = null; }, 300); }, 2300);
  if(voice) talk(text, voice);
}
// Speak with a voice that fits the piece (pitch / speed); never queues up a pile of lines.
function talk(text, voice){
  try{
    if(!UISound.get().enabled || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[^\p{L}\p{N}\s,.!?'’-]/gu, ''));
    const v = VOICES[voice] || VOICES.normal; u.pitch = v[0]; u.rate = v[1]; u.volume = Math.max(0.2, UISound.get().volume);
    speechSynthesis.speak(u);
  }catch(e){}
}
const VOICES = {k: [0.8, 0.9], q: [1.5, 1.0], r: [0.6, 0.85], b: [1.0, 1.0], n: [1.3, 1.15], p: [1.8, 1.2], man: [1.4, 1.1], king: [0.9, 0.95], bot: [1.1, 1.05], normal: [1.2, 1.0]};
function hopNumber(sq, n){ const [x, y] = sqXY(sq), e = document.createElement('div'); e.className = 'hopn'; e.textContent = '×' + n; e.style.left = x + 'px'; e.style.top = y + 'px'; $('board').appendChild(e); setTimeout(() => e.remove(), 950); }
function megaText(text, big){ const e = document.createElement('div'); e.className = 'mega' + (big ? ' x3' : ''); e.textContent = text; $('board').appendChild(e); setTimeout(() => e.remove(), 1700); }
function trailPath(squares, color){
  const pts = squares.map(s => sqXY(s).slice(0, 2).join(',')).join(' '), cs = sqXY(0)[2];
  let len = 0; for(let i = 1; i < squares.length; i++){ const a = sqXY(squares[i - 1]), b = sqXY(squares[i]); len += Math.hypot(a[0] - b[0], a[1] - b[1]); }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'trail');
  svg.innerHTML = '<polyline points="' + pts + '" stroke="rgba(255,255,255,0.55)" stroke-width="' + cs * 0.34 + '" stroke-dasharray="' + len + '" style="--len:' + len + '"/>' +
    '<polyline points="' + pts + '" stroke="' + color + '" stroke-width="' + cs * 0.16 + '" stroke-dasharray="' + len + '" style="--len:' + len + ';filter:drop-shadow(0 0 6px ' + color + ')"/>';
  $('board').appendChild(svg); setTimeout(() => svg.remove(), 1700);
}
function flashBoard(){ const f = $('frame'); f.classList.remove('flashy'); void f.offsetWidth; f.classList.add('flashy'); }
function crownDrop(sq, ch){ const [x, y] = sqXY(sq), e = document.createElement('div'); e.className = 'crown-drop'; e.textContent = ch || '👑'; e.style.left = x + 'px'; e.style.top = y + 'px'; $('board').appendChild(e); setTimeout(() => e.remove(), 950); }
// rising little tune for combos
function chime(n){ for(let k = 0; k < Math.min(n, 5); k++) setTimeout(() => UISound.play(k === n - 1 ? 'success' : 'key'), k * 110); }
const pickLine = list => list[Math.floor(Math.random() * list.length)];

const LINES = {
  jump: ['Hop! 🐸', 'Boing!', 'Gotcha!', 'Leapfrog!', 'Yoink!', 'Over you go!', 'Jump jump!', 'Snack time!', 'Peekaboo, got you!', 'Too slow!'],
  cry: ['Noooo!', 'Ouch!', 'Hey, no fair!', 'I\'ll be back!', 'Bye bye!', 'Oof!', 'Not my hat!', 'Save me!', 'Eek!', 'See you next game!'],
  king: ['King me! 👑', 'Look at my crown!', 'I\'m the boss now!', 'Bow down! 👑', 'Royal and ready!', 'Now I can go backwards!', 'Shiny crown!', 'Fancy!', 'Crown time!', 'I feel taller!'],
  double: ['Double jump!', 'Two for one!', 'Hop-hop!', 'Double trouble!'],
  triple: ['TRIPLE jump!', 'Hat trick!', 'Unstoppable!', 'Three in a row!'],
  mega: ['MEGA JUMP!', 'Super combo!', 'Woooo-hoo!', 'Nobody can stop me!'],
  fire: ['I\'m on fire! 🔥', 'Can\'t stop, won\'t stop!', 'Hot streak!'],
  win: ['We did it! 🎉', 'Victory dance!', 'Champions!', 'Yay us!'],
  lose: ['Aww…', 'Next time!', 'Good game!']
};

/* ---------- end of the game ---------- */
function endGame(winner, why){
  if(G.over) return;
  G.over = true; G.finishMs = performance.now() - G.t0 - G.pausedTotal; clearTimeout(botTimer); danceStop();
  const thisGame = G;
  clearTimeout(bannerTimer); $('banner').classList.remove('on');
  $('pl-op').classList.remove('thinking'); if(G.lx) lxThink(0);   // 📡 lk-3c
  updatePlayers(); render(); tableEnd(winner); cheerEnd(winner);   /* 📣 cs-3a */
  document.querySelectorAll('.pc.danger').forEach(e => e.classList.remove('danger'));
  if(winner){ G.b.forEach((v, i) => { const e = $('pc-' + G.ids[i]); if(!v || !e) return; e.classList.add(Math.sign(v) === winner ? 'dance' : 'sad'); });
    const w = G.b.findIndex(v => Math.sign(v) === winner); if(w >= 0) setTimeout(() => G && bubble(w, pickLine(LINES.win), winner, null), 300); }
  const secs = Math.max(1, Math.round(G.finishMs / 1000));
  const left = G.b.filter(v => v > 0).length, kings = G.b.filter(v => v === 2).length;
  if(G.mode === 'duo'){
    const name = winner ? G.names[winner] : '';
    if(winner){ party('🎉 ' + name + ' wins!'); say(name + ' wins! Great game!'); }
    setTimeout(() => {
      if(G !== thisGame) return;
      if(thisGame.lx){   // 📡 a linked game: the LinkKit chat's own result buttons, unchanged
      showResult('<div class="big">' + (winner ? '🏆' : '🤝') + '</div><h2 class="cheer">' + (winner ? UI.esc(name) + ' wins!' : 'It\'s a draw!') + '</h2>' +
        '<p style="margin:-4px 0 0;font-weight:800;color:var(--ink-soft)">' + (why === 'stuck' ? 'No moves left for ' + UI.esc(G.names[-winner]) : why === 'resign' ? UI.esc(G.names[-winner]) + ' gave up' : why === 'draw' ? 'Lots of moves without a jump' : 'Every piece taken!') + '</p>' +
        '<div class="stats"><span>⏱ ' + fmt(G.finishMs) + '</span><span>' + UI.esc(G.names[1]) + ' took ' + G.takenBy[1] + '</span><span>' + UI.esc(G.names[-1]) + ' took ' + G.takenBy[-1] + '</span></div>' +
        lxResultBtns());
      lxResultWire(); return; }
      GF.result({wrap: $('result'), card: $('result-card'), win: winner ? true : null, icon: winner ? '🏆' : '🤝', title: winner ? name + ' wins!' : 'It\'s a draw!',   /* 🧱 b3w2: same-device game → the shared card */
        sub: why === 'stuck' ? 'No moves left for ' + G.names[-winner] : why === 'resign' ? G.names[-winner] + ' gave up' : why === 'draw' ? 'Lots of moves without a jump' : 'Every piece taken!',
        stats: [['⏱', fmt(G.finishMs)], ['🎯', G.names[1] + ' took ' + G.takenBy[1]], ['🎯', G.names[-1] + ' took ' + G.takenBy[-1]]], confetti: false,
        buddy: HAS_AV && winner ? {name, av: myAvatar(name)} : null,
        levels: () => { hideResult(); G = null; clearInterval(tickHandle); renderLevels(); showScreen('menu'); }, levelsText: '🎚️ Menu',
        again: () => startGame({mode: 'duo', lvl: 1, friend: G.friend}), againText: '🔁 Play again'});
      const ag = $('btn-again'); if(ag) ag.id = 'b-again'; const mn = $('btn-levels'); if(mn) mn.id = 'b-menu'; cheerFaces();
    }, winner ? 1500 : 300);
    return;
  }
  if(winner === 1){
    const lvl = G.lvl, half = Math.ceil(G.start / 2);
    let stars = 1 + (left >= half ? 1 : 0) + (G.hintUsed ? 0 : 1);
    const par = 150 + 60 * lvl;
    const score = (100 * (lvl + 1) + left * 30 + kings * 20 + G.takenBy[1] * 10 + Math.max(0, (par - secs) * 2)) * (G.L.hardcore ? 3 : 1);   // 💀 Hardcore ×3
    const pr = pick(PRAISE);
    party('🎉 ' + pr + ', ' + S.player + '!'); say(pr + ', ' + S.player + '!');
    confetti(['🔴', '👑', '⭐', '🎉', DESIGNS[design].emb[0] || '✨'], 44);
    UISound.play('success');
    setTimeout(() => {
      if(!G || G !== thisGame) return;
      GF.result({wrap: $('result'), card: $('result-card'), win: true, icon: '🏆', title: pr + '!', sub: 'You beat 🤖 ' + G.L.bot + ' on ' + G.L.name + (why === 'stuck' ? ' — it had no moves left!' : '!'), stars, score,   /* 🧱 b3w2: the shared 🏁 card */
        stats: [['⏱', fmt(G.finishMs)], ['🔴', left + ' left'], ['🎯', 'took ' + G.takenBy[1]]].concat(kings ? [['👑', kings]] : [], G.hintUsed ? [['💡', 'Hint used — 2 ⭐ at most']] : []),
        save: 'Saving your progress…', buddy: HAS_AV ? {name: S.player, av: myAvatar(S.player)} : null, confetti: false,
        levels: () => { hideResult(); G = null; clearInterval(tickHandle); renderLevels(); showScreen('menu'); },
        again: () => startGame({mode: 'bot', lvl}), againText: '🔁 Again',
        next: lvl < 5 ? () => { if(!canPlay(lvl + 1)){ UI.toast('Beat this level to unlock the next one', 'err'); return; } hideResult(); CH.lvl = lvl + 1; startGame({mode: 'bot', lvl: lvl + 1}); } : null,
        nextText: lvl === 4 ? 'Try 💀 Hardcore ▶' : 'Next level ▶'});
      ['btn-again:b-again', 'btn-levels:b-menu', 'btn-next:b-next'].forEach(x => { const [a1, b1] = x.split(':'), e = $(a1); if(e) e.id = b1; }); cheerFaces();
    }, REDUCED ? 300 : 1600);
    saveWin(lvl, {timeSec: secs, stars, score, theme: design, stats: Object.assign({}, G.feats, {wins: 1, perfect: left === G.start ? 1 : 0})});
  } else {
    sendFeats(G.feats);
    UISound.play(winner ? 'bump' : 'pop');
    setTimeout(() => {
      if(G !== thisGame) return;
      GF.result({wrap: $('result'), card: $('result-card'), win: winner ? false : null, icon: winner ? '🤖' : '🤝', title: winner ? 'Good game!' : 'It\'s a draw!',   /* 🧱 b3w2: the shared 🏁 card */
        sub: (winner ? (why === 'time' ? '💀 Time\'s up! The clock ran out.' : why === 'resign' ? 'You gave up this one.' : '🤖 ' + G.L.bot + ' won this time.') + ' You took ' + G.takenBy[1] + ' piece' + (G.takenBy[1] === 1 ? '' : 's') + '!' : 'Lots of moves without a jump — nobody wins.'),
        stats: [['💡', pick(['Keep your back row full — then the bot can\'t get a King easily.', 'Move pieces in pairs so they protect each other.', 'Look before you move: can the bot jump that square next?', 'Try to get a King 👑 — Kings are super strong.', 'Use the 💡 Hint button if you are stuck.'])]], buddy: HAS_AV ? {name: S.player, av: myAvatar(S.player)} : null,
        levels: () => { hideResult(); G = null; clearInterval(tickHandle); renderLevels(); showScreen('menu'); },
        again: () => startGame({mode: 'bot', lvl: G.lvl}), againText: '🔁 Try again'});
      ['btn-again:b-again', 'btn-levels:b-menu'].forEach(x => { const [a1, b1] = x.split(':'), e = $(a1); if(e) e.id = b1; }); cheerFaces();
    }, 900);
  }
}
// Double / triple / mega jump: glowing path, big words, flash, chime, sparkles on every captured square.
function bigJump(m, side){
  const n = m.caps.length, col = side > 0 ? DESIGNS[design].p1 : DESIGNS[design].p2;
  trailPath(m.path, n >= 3 ? '#FFE066' : col);
  megaText(n === 2 ? 'DOUBLE JUMP!' : n === 3 ? 'TRIPLE JUMP!!' : 'MEGA ×' + n + '!!!', n >= 3);
  flashBoard(); chime(n + 1);
  m.caps.forEach((c, k) => setTimeout(() => { if(!G) return; const [x, y, cs] = sqXY(c); fxEl('ring', x, y, {'--pxc': k % 2 ? '#FFE066' : col}); sparks(x, y, cs, ['⭐', '✨', '💥', '🌟']); }, k * 140));
  if(n >= 3 && !REDUCED){ const f = $('frame'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); }
  if(n >= 3) confetti(['⭐', '🎉', '✨', '💥', DESIGNS[design].emb[side > 0 ? 0 : 1] || '🔴'], 26);
  const to = m.path[m.path.length - 1];
  setTimeout(() => { if(G) bubble(to, pickLine(n === 2 ? LINES.double : n === 3 ? LINES.triple : LINES.mega), side, G.mode === 'bot' && side < 0 ? 'bot' : 'man'); }, 450);
}
function party(text){ const p = document.createElement('div'); p.className = 'praise'; p.textContent = text; $('stage-wrap').appendChild(p); setTimeout(() => p.remove(), REDUCED ? 600 : 1600); }

/* ================= SAVE ================= */
const PENDING_KEY = 'sp_checkers_pending';
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){
  const list = readPending(); if(!list.length) return; writePending([]);
  list.forEach(w => google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))).saveLevelResult(GAME_ID, w.name, w.lvl, w.extra));
}
function saveWin(lvlIdx, extra, tries){
  tries = tries || 0;
  const name = S.player;
  const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []});
  p.unlocked = Math.max(p.unlocked, lvlIdx + 1);
  google.script.run
    .withSuccessHandler(res => {
      const best = (p.best || [null, null, null, null, null]).slice(); if(res.best) best[lvlIdx] = res.best;
      S.progress[name] = {unlocked: res.unlocked, tokens: res.tokens, best};
      flushPending();
      const put = () => { const n2 = $('save-note'); if(n2) n2.innerHTML = saveText(res); };
      if(!$('save-note')) setTimeout(put, 1700); else put();
    })
    .withFailureHandler(err => {
      if(tries < 1){ setTimeout(() => saveWin(lvlIdx, extra, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl: lvlIdx, extra}]));
      const put = () => { const n2 = $('save-note'); if(n2) n2.innerHTML = '⚠️ Could not save yet — it will be sent again next time.<br><small style="opacity:.7">' + UI.esc((err && err.message) || '') + '</small>'; };
      if(!$('save-note')) setTimeout(put, 1700); else put();
    })
    .saveLevelResult(GAME_ID, name, lvlIdx, extra);
}
function saveText(res){ return saveTextBase(res) + featsHtml(res.feats); }
function saveTextBase(res){
  if(res.newBadge) return '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>';
  if(res.newHighScore && !res.firstTime) return '🎉 New high score!';
  return res.best && res.best.score ? 'Your best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Progress saved';
}

/* ---------- feats: counts for badges + Titles (sent with the result) ---------- */
function featsHtml(fe){
  if(!fe) return '';
  const parts = [];
  (fe.newTitles || []).forEach(t => parts.push('<span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'));
  (fe.newBadges || []).forEach(b => parts.push('<span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'));
  if((fe.newTitles || []).length) setTimeout(() => say('New title! ' + fe.newTitles[0].name + '!'), 1800);
  return parts.length ? '<div class="feats-row">' + parts.join('') + '</div>' : '';
}
// A game that ended without clearing a level still counts its feats.
function sendFeats(stats){
  if(!S.player || !Object.keys(stats || {}).some(k => stats[k] > 0)) return;
  google.script.run.withSuccessHandler(fe => {
    (fe.newTitles || []).forEach(t => { UI.toast('🏷️ New title: ' + t.icon + ' ' + t.name + '!'); say('New title! ' + t.name + '!'); });
    (fe.newBadges || []).forEach(b => UI.toast(b.medal + ' ' + b.icon + ' ' + b.name + ' · ' + b.tierName));
  }).withFailureHandler(() => {}).saveFeats(S.player, GAME_ID, stats);
}
function countUp(el, to, ms){ if(!el) return; const t0 = performance.now(); (function tick(now){ const p = Math.max(0, Math.min(1, (now - t0) / ms)); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString(); if(p < 1) requestAnimationFrame(tick); })(t0); }
function showResult(html){ $('result-card').innerHTML = html; $('result').classList.remove('hidden'); cheerFaces();   /* 📣 cs-3a */ }
function hideResult(){ $('result').classList.add('hidden'); }
function confetti(list, count){
  for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pick(list);
    e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's';
    document.body.appendChild(e); setTimeout(() => e.remove(), 3800); }
}
let bannerTimer = 0;
function showBanner(text, kind){
  const b = $('banner'); b.textContent = text; b.classList.toggle('bad', kind === 'bad'); b.classList.toggle('warn', kind === 'warn'); b.classList.add('on');
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), kind ? 2600 : 2200);
}
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 p1b: ◀ = where you came from (Gameroom if we don't know)

/* ================= BOOT ================= */
function boot(){
  UI.loading('checkers');
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
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();
/* ✨ MODE SPOTLIGHT (modes-3): ?mode=<id> opens this game straight in that mode after the player pick · "✨ Also try" on the start page · started modes → UI.modeTried */
const MS_GAME = 'checkers';
function msOpen(id){
  if(id === 'duo') chooseFriend();
  if(id === 'lhost') lxOpenHost(); if(id === 'ljoin') lxJoin();   // 📡 lk-3c
  if(id === 'ltv') lxOpenHost(true);   // 📺 lk-5f: from the Gameroom's 📺 Room hostess
}
function msNow(){ return ''; }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startGame', o => o && o.mode === 'duo' ? 'duo' : '');
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */

/* 📡 LINK (lk-3c): 🔴 Checkers on 2 own devices (LinkKit; same design as ♟️ Chess lk-3b, LinkKit plan §25). The host's device is the referee.
   Each player moves their own colour on their own device (the board turned to their side); a move (also a multi-jump) shows at once here and hops in there.
   Messages: host → guest ckgo (start / full state, + `you` = that device's colour) · both ways ckmove {id, tn = moves so far, path} · ckend (gave up) · guest → host ckask (send me the game).
   📺 lk-5b Room hostess (as ♟️ Chess lk-5a): the host device has no colour (G.lx.me = 0) — both colours are guests (G.lx.seats = {1: seat, -1: seat}); the host checks
   every move by the sender's seat and passes it on to the other player; ▶ Start / 🔁 Play again also from the first player's device (Link.ask). */
const LX = {wired: false, lobby: null, pending: null, cfg: null, autoT: 0, games: 0, thinkT: 0, sayT: 0, side: 0};
const LX_AUTO_MS = window.LX_AUTO_MS || 20000;
const LX_BOT_MS = window.LX_BOT_MS || 700;   // 📺 lk-5g: the TV robot's short pause before it moves
const LX_TALK = ['Hmm… 🤔', 'I see a jump… 👀', 'Which piece… 🔴', 'Don’t rush me! ⏳', 'Ooh, tricky! 🤯', 'King me soon! 👑', 'Hello everyone! 👋', 'Shh, thinking… 🤫',
  'Double jump coming? 🌟', 'Is that a trap? 🧐', 'Almost ready!', 'Hop hop hop! 🐸', 'Guard my back row! 🛡️', 'Where to go… 🗺️', 'You’ll see! 😎', 'Tick tock… 🕰️'];
function lxV(sq){ return G && G.flip ? G.n * G.n - 1 - sq : sq; }   // board square → where it shows on this device
function lxSeat(){
  $('scr-play').classList.remove('lx-flip', 'lx-tv'); ['me', 'op'].forEach(k => $('pl-' + k).classList.remove('lx-you'));
  if(!LX.pending || G.mode !== 'duo') return;
  G.lx = LX.pending; LX.pending = null; G.flip = G.lx.me < 0;   // 📺 the TV (me 0) shows the board the normal way round
  G.names = {1: G.lx.names[1], '-1': G.lx.names[-1]}; G.friend = G.names[-1];   // the ⚫ discs wear the ⚫ player's skin
  $('scr-play').classList.toggle('lx-flip', G.flip);
}
function lxNames(){   // a "YOU" tag on your own card + who plays which colour · 📺 the TV: no tag, a hostess tip
  [[1, 'me'], [-1, 'op']].forEach(([sd, k]) => { $('nm-' + k).textContent = G.names[sd]; $('pl-' + k).classList.toggle('lx-you', sd === G.lx.me); });
  $('scr-play').classList.toggle('lx-tv', !G.lx.me);
  $('tip').innerHTML = !G.lx.me ? '📺 Room hostess — ' + UI.esc(G.names[1]) + ' plays 🔴 and ' + UI.esc(G.names[-1]) + ' plays ⚫, each on their own device.'
    : 'Your pieces are at the bottom of YOUR board. Tap a glowing piece, then a dot. If you can jump, you must!';
}
function lxAv(cv, p){ const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); if(typeof drawPreviewCanvas === 'function') drawPreviewCanvas(cv, myAvatar(p.name), {name: p.name, t: 1}); }
function lxCloseLobby(){ if(LX.lobby && LX.lobby.close) LX.lobby.close(); LX.lobby = null; }
function lxIdle(){ try{ if(window.Link && Link.status() !== 'idle') Link.leave(); }catch(e){} }
function lxChoose(){
  lxWire(); lxCloseLobby(); lxIdle();
  $('lx-sub').textContent = 'Each player on their own phone, tablet or computer — same Wi-Fi or 🌍 anywhere'; showScreen('link');
  $('lx-lobby').innerHTML = '<div class="lx-pick"><button class="btn sp-btn sp-primary" id="lx-host" data-sound="pop">🎮 Host and play<small>this device plays too</small></button>' +
    '<button class="btn sp-btn sp-primary lx-tv" id="lx-tv" data-sound="pop">📺 Room hostess<small>this screen shows the game on the TV · everyone plays on their own device</small></button>' +
    '<button class="btn sp-btn sp-secondary" id="lx-join" data-sound="pop">🔗 Join a friend</button></div>';
  $('lx-host').onclick = () => lxOpenHost(false); $('lx-tv').onclick = () => lxOpenHost(true); $('lx-join').onclick = () => lxJoin();
}
async function lxOpenHost(tv){   // 📺 lk-5b: tv = Room hostess (no colour on this device)
  lxWire(); lxCloseLobby(); lxIdle();
  $('lx-sub').textContent = tv ? '📺 This screen is the Room hostess — players tap 🔗 Join a friend on their own devices · 1 player plays the 🤖 robot (level for their age)' : 'Your friend taps 🔗 Join a friend on their own phone or tablet — same Wi-Fi or 🌍 anywhere'; showScreen('link');
  const el = $('lx-lobby'); el.innerHTML = '<div class="lk"><div class="lk-msg"><span class="ui-spin a-bob">' + (tv ? '📺' : '📡') + '</span> Opening the room<span class="lk-dots"></span></div></div>';
  try{ await Link.host({game: 'Checkers', name: S.player, seats: 2, hostess: !!tv, page: 'checkers', label: '🔴 Checkers · 2 players' + (tv ? ' · 📺 on the TV' : '')}); }
  catch(e){ UISound.play('error'); el.innerHTML = '<div class="lk"><div class="lk-msg bad">😕 ' + UI.esc((e && e.message) || 'Could not open the room') + '</div></div>'; return; }
  if($('scr-link').classList.contains('hidden')) return;
  LX.lobby = Link.lobby(el, {title: '🔴 Checkers · ' + (tv ? '1–2 players' : '2 players'), url: WEBAPP_URL + '?page=checkers', minPlayers: 2, soloBot: !!tv, name: S.player, drawAvatar: lxAv, kind: 'checkers', onStart: lxHostGo});   // 📺 lk-5g: soloBot
}
function lxJoin(code){
  lxWire(); lxCloseLobby(); lxIdle();
  $('lx-sub').textContent = 'Same Wi-Fi as the host — or 🌍 anywhere'; showScreen('link');
  LX.lobby = Link.lobby($('lx-lobby'), {title: '🔴 Checkers', name: S.player, drawAvatar: lxAv, soloBot: true, code: code || undefined, kind: 'checkers', onJoined: () => UISound.play('success')});   // 📺 lk-5g: soloBot counts only in a Room hostess room
}
function lxExit(){
  lxIdle(); lxCloseLobby(); clearTimeout(LX.autoT); lxThink(0); LX.cfg = null;
  const o = document.querySelector('.lx-over'); if(o) o.remove();
  if(G && G.lx){ if(window.Cheer) Cheer.unmount(); clearTimeout(botTimer); clearInterval(tickHandle); danceStop(); hideResult(); G = null; }
  $('scr-play').classList.remove('lx-flip', 'lx-tv'); ['me', 'op'].forEach(k => $('pl-' + k).classList.remove('lx-you'));
  renderLevels(); showScreen('menu');
}
function lxLeavePlay(){
  if(G.over){ lxExit(); return; }
  const host = G.lx.role === 'host', tv = !!G.lx.tv;
  UI.confirm({icon: '◀', title: host ? 'End the game for ' + (tv ? 'everyone' : 'both') + '?' : 'Leave this game?', body: host ? (tv ? '📺 You are the Room hostess — the game stops on every device.' : 'You are the host — the game stops on both devices.') : '🤖 The robot plays your moves until you come back.', okText: host ? 'End game' : 'Leave', cancelText: 'Keep playing'})
    .then(ok => { if(ok) lxExit(); });
}
function lxNewGame(){
  if(G.lx.role !== 'host'){ UI.toast('📡 ' + (G.lx.tv ? 'The TV' : ((LX.cfg && LX.cfg.host) || 'The host')) + ' can start a new game'); return; }
  if(G.over){ lxHostGo(); return; }
  const tv = !!G.lx.tv;
  UI.confirm({icon: '🔄', title: 'New game for ' + (tv ? 'everyone' : 'both') + '?', body: 'This game stops on ' + (tv ? 'every device' : 'both devices') + '. Colours swap.', okText: 'New game', cancelText: 'Keep playing'}).then(ok => { if(ok) lxHostGo(); });
}
// ---- host ----
function lxHostGo(){
  const tv = Link.hostess && Link.hostess();
  const list = Link.players().filter(p => p.name && p.on && !p.screen).sort((a, b) => a.seat - b.seat);
  let names = {}, seats = {}, hostSide = 0, bot = null;
  if(tv && list.length === 1){   // 📺 lk-5g: ONE player + the TV → the 🤖 robot takes the other colour (level for the player's age); colours swap every game
    const ps = LX.games++ % 2 === 0 ? 1 : -1, bl = lxBotLvl(list[0].name), L = LEVELS[bl];
    names[ps] = list[0].name; names[-ps] = '🤖 ' + L.bot; seats[ps] = list[0].seat; seats[-ps] = 'bot'; bot = {side: -ps, lvl: bl};
  } else if(tv){   // 📺 lk-5b: both colours are guests — the colours swap every game
    if(list.length < 2){ UISound.play('error'); UI.toast('📺 Wait for a player to join'); return; }
    const w = LX.games++ % 2 === 0 ? 0 : 1, a = list[w], b = list[1 - w];
    names = {1: a.name, '-1': b.name}; seats = {1: a.seat, '-1': b.seat};
  } else {
    const me = list.find(p => p.seat === Link.seat()) || {name: S.player, seat: Link.seat()}, fr = list.find(p => p !== me);
    if(!fr){ UISound.play('error'); UI.toast('📡 Wait for a friend to join'); return; }
    hostSide = LX.games++ % 2 === 0 ? 1 : -1;   // the bottom-start side moves first — the colours swap every game
    names[hostSide] = me.name; names[-hostSide] = fr.name; seats[hostSide] = 'host'; seats[-hostSide] = fr.seat;
  }
  LX.cfg = {id: Date.now().toString(36), host: S.player, tv: !!tv, names, hostSide, guest: seats[-hostSide || -1], bot};
  lxCloseLobby(); hideResult(); const o = document.querySelector('.lx-over'); if(o) o.remove();
  LX.pending = {role: 'host', me: hostSide, id: LX.cfg.id, names, seats, guest: LX.cfg.guest, away: {}, tv: !!tv, bot};
  startGame({mode: 'duo', lvl: 1, friend: names[-1]});   // the true game lives here; G.lx comes from LX.pending
  lxSendGo();
}
function lxState(){ return {id: G.lx.id, b: G.b, ids: G.ids, turn: G.turn, plies: G.plies, quiet: G.quiet, last: G.last, takenBy: G.takenBy, end: G.lx.end || null}; }
function lxGuestSeats(){ return [1, -1].filter(sd => G.lx.seats && G.lx.seats[sd] != null && G.lx.seats[sd] !== 'host' && G.lx.seats[sd] !== 'bot').map(sd => ({side: sd, seat: G.lx.seats[sd]})); }   // 📺 lk-5g: 'bot' = the TV's robot
function lxSendGo(only){ if(G && G.lx && G.lx.role === 'host' && G.busy){ setTimeout(() => lxSendGo(only), 150); return; }   // a move is hopping: send the game once it is in
  if(!(G && G.lx && G.lx.role === 'host')) return;
  lxGuestSeats().forEach(g => { if(only == null || only === g.seat) Link.send('ckgo', {cfg: LX.cfg, you: g.side, st: lxState()}, {sure: true, to: g.seat}); }); }
function lxTurn(){
  const mine = G.turn === G.lx.me;
  lxThink(mine ? 0 : G.turn);
  clearTimeout(LX.autoT);
  if(G.lx.role === 'host' && G.lx.bot && G.turn === G.lx.bot.side) LX.autoT = setTimeout(lxBot, LX_BOT_MS);   // 📺 lk-5g
  else if(G.lx.role === 'host' && !mine && G.lx.away && G.lx.away[G.turn]) LX.autoT = setTimeout(lxAuto, LX_AUTO_MS);
}
function lxPick(side, L){   // 🤖 a move for EITHER colour (botChoice only plays the bottom-start side's opponent, -1)
  const moves = genMoves(G.b, G.n, side); if(!moves.length) return null;
  if(Math.random() < L.random) return pick(moves);
  return bestMove(G.b, G.n, side, Math.max(1, L.think), L.ms || 0, L.think <= 3 ? 30 : 0);
}
function lxAuto(){   // 🤖 plays for a player whose device dropped out
  if(!G || !G.lx || G.over || !G.lx.away || !G.lx.away[G.turn] || G.turn === G.lx.me || G.busy) return;
  showBanner('🤖 Robot moves for ' + G.names[G.turn], 'warn');
  const m = lxPick(G.turn, LEVELS[1]); if(m) playMove(m);   // lk-5g: the right colour (was always -1)
}
// 📺 lk-5g: the TV's 🤖 robot (one player + the Room hostess) — level = the recommended level for the player's age (no 💀; until Checkers gets the 🧱 one-page setup)
function lxBotLvl(name){ if(window.Station && Station.on && Station.lvl != null) return Station.lvl;   /* 📺 st-1: the station's level vote */ const p = S.players.find(x => x.Name === name); const r = AGE_RECOMMEND[p ? p.Age : '']; return r != null ? Math.min(4, r) : 1; }
function lxBot(){
  if(!G || !G.lx || G.over || !G.lx.bot || G.turn !== G.lx.bot.side) return;
  if(G.busy){ LX.autoT = setTimeout(lxBot, 150); return; }
  const m = lxPick(G.lx.bot.side, LEVELS[G.lx.bot.lvl] || LEVELS[1]); if(m) playMove(m);
}
// ---- both devices ----
function lxSendMove(m){ Link.send('ckmove', {id: G.lx.id, tn: G.plies, path: m.path}, {sure: true}); }   // host → every player · guest → the host
function lxSendEnd(winner, why){ if(!G || !G.lx) return; G.lx.end = {winner, why}; Link.send('ckend', {id: G.lx.id, winner, why}, {sure: true}); }
function lxGotMove(d, tries, seat){
  if(!G || !G.lx || !d || d.id !== G.lx.id || G.over) return;
  if(G.busy && (tries || 0) < 30){ setTimeout(() => lxGotMove(d, (tries || 0) + 1, seat), 150); return; }
  const host = G.lx.role === 'host', side = G.turn;
  const fromOk = !host || (G.lx.seats && G.lx.seats[side] === seat);   // 📺 lk-5b: only the device that owns the colour to move
  const same = x => Array.isArray(d.path) && x.path.length === d.path.length && x.path.every((q, k) => q === d.path[k]);
  const m = fromOk && d.tn === G.plies && side !== G.lx.me ? genMoves(G.b, G.n, side).find(same) : null;
  if(!m){   // out of step: the host's game is the truth
    if(host) lxSendGo(seat); else Link.send('ckask', {id: G.lx.id}, {sure: true});
    return;
  }
  if(host) lxGuestSeats().forEach(g => { if(g.seat !== seat) Link.send('ckmove', d, {sure: true, to: g.seat}); });   // 📺 pass it on to the other player
  clearTimeout(LX.autoT); lxThink(0); G.prefix = null;
  m.rm = true; playMove(m);
}
// ---- guest ----
function lxGuestStart(d){
  LX.cfg = d.cfg; lxCloseLobby(); hideResult(); const o = document.querySelector('.lx-over'); if(o) o.remove();
  LX.pending = {role: 'guest', me: d.you != null ? d.you : -d.cfg.hostSide, id: d.cfg.id, names: d.cfg.names, tv: !!d.cfg.tv, bot: d.cfg.bot || null};
  startGame({mode: 'duo', lvl: 1, friend: d.cfg.host});
  lxApply(d.st);
}
function lxApply(st){
  if(!G || !G.lx || !st || st.id !== G.lx.id) return;
  if(G.busy){ setTimeout(() => lxApply(st), 200); return; }
  const same = st.plies === G.plies && st.turn === G.turn && st.b.every((v, i) => v === G.b[i]);
  if(!same){
    G.b = st.b; G.ids = st.ids; G.turn = st.turn; G.plies = st.plies; G.quiet = st.quiet; G.last = st.last; G.takenBy = st.takenBy; G.prefix = null;
    buildBoard(); layout(); tableStart();
    if(!st.end) startTurn(); else { updatePlayers(); render(); }
  }
  if(st.end && !G.over) endGame(st.end.winner, st.end.why);
}
function lxResultBtns(){
  if(G.lx.role === 'host') return '<div class="res-btns"><button class="btn sp-btn sp-primary" id="b-again">🔁 Play again · colours swap</button><button class="btn soft sp-btn sp-secondary" id="b-menu">🚪 End the room</button></div>';
  if(G.lx.tv && Link.captain && Link.captain() === Link.seat()) return '<div class="res-btns"><button class="btn sp-btn sp-primary" id="b-again">🔁 Play again · colours swap</button><button class="btn soft sp-btn sp-secondary" id="b-menu">🚪 Leave</button></div>';   // 📺 the first player may start the next game
  return '<div class="note lk-wait">⏳ ' + UI.esc(G.lx.tv ? 'The TV or the first player' : ((LX.cfg && LX.cfg.host) || 'The host')) + ' can start the next game<span class="lk-dots"></span></div><div class="res-btns"><button class="btn soft sp-btn sp-secondary" id="b-menu">🚪 Leave</button></div>';
}
function lxResultWire(){ const a = $('b-again'); if(a) a.onclick = () => { if(G && G.lx && G.lx.role !== 'host'){ UI.busy(a, 'checkers', 'Asking the TV…'); Link.ask('again'); } else lxHostGo(); }; $('b-menu').onclick = () => lxExit(); }
function lxEnded(msg){
  if(G){ G.over = true; clearTimeout(LX.autoT); lxThink(0); }
  hideResult(); const o0 = document.querySelector('.lx-over'); if(o0) o0.remove();   // the message sits on top, alone
  const o = document.createElement('div'); o.className = 'lx-over';
  o.innerHTML = '<div class="result-card"><div class="big">📡</div><h2>' + UI.esc(msg) + '</h2><div class="note">Thanks for playing together!</div><div class="res-btns"><button class="btn sp-btn sp-primary" data-sound="none" onclick="lxExit()">◀ Checkers</button></div></div>';
  document.body.appendChild(o);
}
// ---- while the other one thinks: their seat avatar plays around and talks to everyone ----
function lxThink(side){
  clearInterval(LX.thinkT); clearTimeout(LX.sayT); LX.side = side;
  document.querySelectorAll('.lx-say').forEach(e => e.remove());
  ['me', 'op'].forEach(k => $('pl-' + k).classList.remove('thinking'));
  if(!side || !G) return;
  const pl = $('pl-' + (side > 0 ? 'me' : 'op')); pl.classList.add('thinking'); pl.querySelector('.think').textContent = '✏️ thinking…';
  const say = document.createElement('div'); say.className = 'lx-say'; pl.appendChild(say);
  let i = Math.floor(Math.random() * LX_TALK.length);
  const line = () => {
    if(!G || G.over || LX.side !== side) return;
    i = (i + 1 + Math.floor(Math.random() * 3)) % LX_TALK.length; say.textContent = LX_TALK[i]; say.classList.add('on');
    LX.sayT = setTimeout(() => say.classList.remove('on'), 2600);
    const s2 = TB.seats[side], g = tbG(pick(['think', 'wave', 'clap', 'stretch', 'dance', 'dab', 'flex', 'shrug']));
    if(s2 && !s2.g && g){ s2.g = g; s2.t0 = performance.now(); s2.loop = false; s2.kind = 'idle'; }   // the seat avatar plays while talking
  };
  LX.sayT = setTimeout(line, 900); LX.thinkT = setInterval(line, 3600);
}
// ---- the cheering crowd: seen from this device's side (wraps the 📣 block from outside) ----
(function(){
  const mount = cheerMount, move = cheerMove, end = cheerEnd;
  cheerMount = function(){ if(!G || !G.lx || G.lx.me > 0) return mount.apply(this, arguments);
    const nm = G.names, me = S.player; G.names = {1: nm[-1], '-1': nm[1]}; S.player = nm[-1];
    try{ return mount.apply(this, arguments); } finally { G.names = nm; S.player = me; } };
  cheerMove = function(m, sd, cr){ return move.call(this, m, G && G.lx ? sd * (G.lx.me || 1) : sd, cr); };   // 📺 lk-5b: the TV (me 0) sees the crowd like a 🔴 device
  cheerEnd = function(w){ return end.call(this, G && G.lx && w ? w * (G.lx.me || 1) : w); };
})();
function lxWire(){
  if(LX.wired || !window.Link) return; LX.wired = true;
  // guest side
  Link.on('ckgo', d => { if(Link.isHost() || !d || !d.cfg) return; if(G && G.lx && G.lx.id === d.cfg.id){ lxApply(d.st); return; } lxGuestStart(d); });
  Link.on('hostleft', e => { if(Link.isHost()) return; if(!G && $('scr-link').classList.contains('hidden')) return;
    UISound.play('bump'); lxEnded(e && e.reason === 'lost' ? '📶 Lost the link to ' + ((LX.cfg && LX.cfg.host) || 'the host') : '👋 ' + ((LX.cfg && LX.cfg.host) || 'The host') + ' ended the game'); });
  // both
  Link.on('ckmove', (d, seat) => lxGotMove(d, 0, seat));
  Link.on('ckend', (d, seat) => { if(!G || !G.lx || !d || d.id !== G.lx.id || G.over) return;
    if(Link.isHost()){   // 📺 only the device of that colour may give up — then tell the other player
      const side = [1, -1].find(sd => G.lx.seats && G.lx.seats[sd] === seat); if(!side || d.winner !== -side) return;
      lxGuestSeats().forEach(g => { if(g.seat !== seat) Link.send('ckend', d, {sure: true, to: g.seat}); });
    }
    G.lx.end = {winner: d.winner, why: d.why}; endGame(d.winner, d.why); });
  // host side
  Link.on('ckask', (d, seat) => { if(Link.isHost() && G && G.lx && d && d.id === G.lx.id) lxSendGo(seat); });
  Link.on('lk:ask', (d, seat) => { if(!Link.isHost() || !d || d.what !== 'again' || !G || !G.lx || !G.over || !G.lx.tv) return;   // 📺 the first player's 🔁
    if(Link.captain() !== seat) return; lxHostGo(); });
  const sideOfSeat = seat => [1, -1].find(sd => G && G.lx && G.lx.seats && G.lx.seats[sd] === seat);
  Link.on('leave', e => { if(!Link.isHost() || !G || !G.lx || G.over) return; const sd = sideOfSeat(e.seat); if(!sd) return;
    G.lx.away = G.lx.away || {}; G.lx.away[sd] = true;
    showBanner('📶 ' + G.names[sd] + ' dropped out — 🤖 the robot moves for them until they come back', 'bad');
    if(G.turn === sd){ clearTimeout(LX.autoT); LX.autoT = setTimeout(lxAuto, LX_AUTO_MS); } });
  const back = e => { if(!Link.isHost() || !G || !G.lx || !LX.cfg) return; const sd = sideOfSeat(e.seat); if(!sd) return;
    if(G.lx.away && G.lx.away[sd]){ G.lx.away[sd] = false; clearTimeout(LX.autoT); showBanner('👋 ' + G.names[sd] + ' is back!'); UISound.play('success'); }
    lxSendGo(e.seat); };
  Link.on('rejoin', back); Link.on('join', back);
  addEventListener('pagehide', () => { try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} });
}
// 🔗 QR / waiting room: ?page=checkers&link=<code> → the number pad
function lxUrlCode(cb){
  try{ if(window.google && google.script && google.script.url && google.script.url.getLocation){ google.script.url.getLocation(l => cb(((l && l.parameter) || {}).link || '')); return; } }catch(e){}
  try{ cb(new URLSearchParams(location.search).get('link') || ''); }catch(e){ cb(''); }
}
msAfter('choosePlayer', () => lxUrlCode(c => { c = String(c || '').replace(/[^0-9]/g, '').slice(0, 4); if(c.length === 4) lxJoin(c); }));
/* 📺 STATION (st-1): opened from the 📺 Game Station — the TV starts by itself when the voted players are in, the 🤖 plays the voted level, the players vote 🔁 again / 🎮 another game after the match (LinkKit `Station`) */
if(window.Station) Station.game({url: WEBAPP_URL, page: 'checkers', player: () => S.player || CURRENT_PLAYER, start: () => lxHostGo(), again: () => lxHostGo()});
/* 📡 END LINK (lk-3c) */
