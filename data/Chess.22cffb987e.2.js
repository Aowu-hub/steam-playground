
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'chess';
// 🎛️ p1b: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | ♟️ Chess · level | scoreboard | game buttons ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '♟️', name: 'Chess', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ clearInterval(timerId); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { if(typeof pauseGame === 'function') pauseGame(); }, resume: () => { if(typeof resume === 'function') resume(); }},
  onFit: () => { if(G && typeof layout === 'function') layout(); },
  extras: []});
const CHESS_HELP = ["Every piece moves its own way — tap a piece and glowing dots show where it can go (and a tip explains it).", "Move onto an enemy piece to **take** it.", "**Check** = a King is under attack. If your King is in check you must save it!", "**Checkmate** = the King is in check and can't escape. That wins the game.", "A Pawn that reaches the far side becomes a Queen (or another piece). On the big board the King can **castle** — jump 2 squares toward a Rook to hide.", "Basic is **mini chess**: a 6×6 board with no Bishops — perfect to learn."];   // 🧱 b2: the 📖 How to play lines (cover)
var NAV_INNER = {friend: ['◀ Chess', () => showScreen('menu')], menu: ['◀ Chess', () => openCover()], link: ['◀ Chess', () => lxExit()]};   // 📡 lk-3b: + link   // 🧭 inner screens: their top button goes to the main screen
UI.navBar(document.getElementById('back-btn'), {onclick: false});

/* ================= LEVELS + DESIGNS ================= */
// Basic is "mini chess" (6×6, no bishops — Los Alamos chess) for little hands; the rest are the full 8×8 game.
const LEVELS = [
  {name:'Basic', emoji:'🌱', n:6, bot:'Pawnie', blurb:'Mini chess 6×6, a sleepy bot', depth:1, ms:0, random:0.7},
  {name:'Junior', emoji:'🐣', n:8, bot:'Knightly', blurb:'The full board, a playful bot', depth:1, ms:0, random:0.3},
  {name:'Intermediate', emoji:'🚦', n:8, bot:'Bishop Bo', blurb:'The bot looks a few moves ahead', depth:3, ms:600, random:0.05},
  {name:'Hard', emoji:'⚡', n:8, bot:'Rook Robot', blurb:'The bot sets traps', depth:5, ms:1300, random:0},
  {name:'Extreme', emoji:'🌋', n:8, bot:'Grand Bot', blurb:'The bot thinks really far ahead', depth:8, ms:2300, random:0},
  {name:'Hardcore', emoji:'💀', n:8, bot:'Doom Bot', blurb:'The strongest bot, no hints — 45 seconds for each move!', depth:10, ms:2300, random:0, hardcore:true, clock:45}
];
const DESIGNS = {
  classic:    {name:'Classic', icon:'🪵', sub:'Wooden board, ivory vs ebony', p1:'#F4E7CF', p2:'#2B2D42'},
  fantasy:    {name:'Fantasy', icon:'🏰', sub:'Pearl unicorn kingdom vs emerald dragons', p1:'#FF7EB9', p2:'#1F8A70'},
  futuristic: {name:'Futuristic', icon:'🚀', sub:'Neon cyan vs magenta holograms', p1:'#18E7FF', p2:'#FF4FD8'}
};
const GLYPH = {k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟'};
const PIECE_INFO = {
  k:{name:'King', tip:'moves 1 square any way. Keep it safe — if it can\'t escape, the game is over!'},
  q:{name:'Queen', tip:'moves as far as it likes in any straight line or diagonal. The strongest piece!'},
  r:{name:'Rook', tip:'moves straight: up, down, left or right, as far as it likes.'},
  b:{name:'Bishop', tip:'moves diagonally, as far as it likes. It stays on one colour.'},
  n:{name:'Knight', tip:'jumps in an L: 2 squares one way, then 1 to the side. It can jump over pieces!'},
  p:{name:'Pawn', tip:'moves 1 forward (2 on its first move on the big board) and takes diagonally. Reach the far side to become a Queen!'}
};
const AGE_START = {'4-5':0, '6-7':1, '8-9':2, '10+':3};
const AGE_RECOMMEND = {'4-5':0, '6-7':1, '8-9':2, '10+':3};
const PRAISE = ['Checkmate', 'Chess champion', 'Brilliant moves', 'Grandmaster in training', 'You beat the bot', 'Royal victory'];

/* ================= HELPERS ================= */
const $ = id => document.getElementById(id);
// rnd comes from AvatarKit (same function) — never declare it again here
const pick = a => a[rnd(a.length)];
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function fmt(ms){ const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function say(text){ try{ if(!UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.2; u.volume = Math.max(0.2, UISound.get().volume); speechSynthesis.speak(u); }catch(e){} }

/* ================= RULES =================
   Position = {n, b, turn, castle, ep, half, full}. b = n×n squares, '' empty, 'PNBRQK' = bottom side
   (white, moves up, turn 1), 'pnbrqk' = top side (turn -1). Row 0 is the top. Move = {from, to,
   promo?, ep?, dbl?, castle?}. Full rules on 8×8 (castling, en passant, promotion); mini chess has
   no castling, no double step, promotion to Queen/Rook/Knight. */
const KN = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KG = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const ORTH = [[-1, 0], [1, 0], [0, -1], [0, 1]], DIAGS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const VAL = {p:100, n:320, b:330, r:500, q:900, k:0};
const MATE = 100000;
function sideOf(p){ return !p ? 0 : (p === p.toUpperCase() ? 1 : -1); }
function setup(n){
  const b = new Array(n * n).fill(''), back = n === 8 ? 'rnbqkbnr' : 'rnqknr';
  for(let c = 0; c < n; c++){ b[c] = back[c]; b[n + c] = 'p'; b[(n - 2) * n + c] = 'P'; b[(n - 1) * n + c] = back[c].toUpperCase(); }
  return {n, b, turn: 1, castle: n === 8 ? {K: 1, Q: 1, k: 1, q: 1} : {}, ep: -1, half: 0, full: 1};
}
function attacked(b, n, sq, by){
  const r = (sq / n) | 0, c = sq % n, inb = (rr, cc) => rr >= 0 && cc >= 0 && rr < n && cc < n;
  const pr = r + (by > 0 ? 1 : -1), P = by > 0 ? 'P' : 'p', N = by > 0 ? 'N' : 'n', K = by > 0 ? 'K' : 'k';
  for(const dc of [-1, 1]){ const cc = c + dc; if(inb(pr, cc) && b[pr * n + cc] === P) return true; }
  for(const [dr, dc] of KN){ const rr = r + dr, cc = c + dc; if(inb(rr, cc) && b[rr * n + cc] === N) return true; }
  for(const [dr, dc] of KG){ const rr = r + dr, cc = c + dc; if(inb(rr, cc) && b[rr * n + cc] === K) return true; }
  const R = by > 0 ? 'R' : 'r', B = by > 0 ? 'B' : 'b', Q = by > 0 ? 'Q' : 'q';
  for(const [dr, dc] of ORTH){ let rr = r + dr, cc = c + dc; while(inb(rr, cc)){ const p = b[rr * n + cc]; if(p){ if(p === R || p === Q) return true; break; } rr += dr; cc += dc; } }
  for(const [dr, dc] of DIAGS){ let rr = r + dr, cc = c + dc; while(inb(rr, cc)){ const p = b[rr * n + cc]; if(p){ if(p === B || p === Q) return true; break; } rr += dr; cc += dc; } }
  return false;
}
function kingSq(b, s){ return b.indexOf(s > 0 ? 'K' : 'k'); }
function inCheck(P){ return attacked(P.b, P.n, kingSq(P.b, P.turn), -P.turn); }
function genPseudo(P, capsOnly){
  const {n, b, turn: s} = P, out = [], inb = (rr, cc) => rr >= 0 && cc >= 0 && rr < n && cc < n;
  const promos = n === 8 ? ['q', 'r', 'b', 'n'] : ['q', 'r', 'n'];
  for(let i = 0; i < b.length; i++){
    const p = b[i]; if(!p || sideOf(p) !== s) continue;
    const t = p.toLowerCase(), r = (i / n) | 0, c = i % n;
    if(t === 'p'){
      const dir = s > 0 ? -1 : 1, r1 = r + dir, last = s > 0 ? 0 : n - 1;
      const push = (to, extra) => { if(((to / n) | 0) === last) promos.forEach(q => out.push(Object.assign({from: i, to, promo: q}, extra))); else out.push(Object.assign({from: i, to}, extra)); };
      if(inb(r1, c) && !b[r1 * n + c]){
        if(!capsOnly || r1 === last) push(r1 * n + c);
        if(!capsOnly && n === 8 && r === (s > 0 ? n - 2 : 1) && !b[(r + 2 * dir) * n + c]) out.push({from: i, to: (r + 2 * dir) * n + c, dbl: true});
      }
      for(const dc of [-1, 1]){ const cc = c + dc; if(!inb(r1, cc)) continue; const to = r1 * n + cc;
        if(b[to] && sideOf(b[to]) === -s) push(to); else if(to === P.ep) out.push({from: i, to, ep: true}); }
      continue;
    }
    const step = (dr, dc) => { const rr = r + dr, cc = c + dc; if(!inb(rr, cc)) return; const to = rr * n + cc; if(!b[to]){ if(!capsOnly) out.push({from: i, to}); } else if(sideOf(b[to]) === -s) out.push({from: i, to}); };
    const slide = dirs => dirs.forEach(([dr, dc]) => { let rr = r + dr, cc = c + dc; while(inb(rr, cc)){ const to = rr * n + cc; if(!b[to]){ if(!capsOnly) out.push({from: i, to}); } else { if(sideOf(b[to]) === -s) out.push({from: i, to}); break; } rr += dr; cc += dc; } });
    if(t === 'n') KN.forEach(([dr, dc]) => step(dr, dc));
    else if(t === 'k'){
      KG.forEach(([dr, dc]) => step(dr, dc));
      if(!capsOnly && n === 8){
        const row = s > 0 ? 56 : 0, K = s > 0 ? 'K' : 'k', Q = s > 0 ? 'Q' : 'q', R = s > 0 ? 'R' : 'r';
        if(i === row + 4 && !attacked(b, n, i, -s)){
          if(P.castle[K] && b[row + 7] === R && !b[row + 5] && !b[row + 6] && !attacked(b, n, row + 5, -s) && !attacked(b, n, row + 6, -s)) out.push({from: i, to: row + 6, castle: K});
          if(P.castle[Q] && b[row] === R && !b[row + 1] && !b[row + 2] && !b[row + 3] && !attacked(b, n, row + 3, -s) && !attacked(b, n, row + 2, -s)) out.push({from: i, to: row + 2, castle: Q});
        }
      }
    }
    else if(t === 'r') slide(ORTH);
    else if(t === 'b') slide(DIAGS);
    else if(t === 'q'){ slide(ORTH); slide(DIAGS); }
  }
  return out;
}
function makeMove(P, m){
  const n = P.n, b = P.b.slice(), orig = b[m.from], cap = m.ep ? (P.turn > 0 ? 'p' : 'P') : b[m.to];
  let p = orig; b[m.from] = '';
  if(m.ep) b[m.to + (P.turn > 0 ? n : -n)] = '';
  if(m.promo) p = P.turn > 0 ? m.promo.toUpperCase() : m.promo;
  b[m.to] = p;
  if(m.castle){ const row = P.turn > 0 ? 56 : 0; if(m.castle.toLowerCase() === 'k'){ b[row + 5] = b[row + 7]; b[row + 7] = ''; } else { b[row + 3] = b[row]; b[row] = ''; } }
  const castle = Object.assign({}, P.castle);
  if(n === 8){
    if(orig === 'K'){ castle.K = 0; castle.Q = 0; } if(orig === 'k'){ castle.k = 0; castle.q = 0; }
    [m.from, m.to].forEach(sq => { if(sq === 63) castle.K = 0; if(sq === 56) castle.Q = 0; if(sq === 7) castle.k = 0; if(sq === 0) castle.q = 0; });
  }
  return {n, b, turn: -P.turn, castle, ep: m.dbl ? (m.from + m.to) / 2 : -1, half: (orig.toLowerCase() === 'p' || cap) ? 0 : P.half + 1, full: P.full + (P.turn < 0 ? 1 : 0), cap};
}
function legalMoves(P){ return genPseudo(P).filter(m => { const Q = makeMove(P, m); return !attacked(Q.b, P.n, kingSq(Q.b, P.turn), -P.turn); }); }
function perft(P, d){ if(d === 0) return 1; let t = 0; for(const m of legalMoves(P)) t += d === 1 ? 1 : perft(makeMove(P, m), d - 1); return t; }
function posKey(P){ return P.b.join(',') + P.turn + JSON.stringify(P.castle) + P.ep; }
function insufficient(b){
  const rest = b.filter(p => p && p.toLowerCase() !== 'k');
  return !rest.length || (rest.length === 1 && 'nb'.includes(rest[0].toLowerCase()));
}
// Score from the bottom side's (white's) point of view.
function evaluate(P){
  const {n, b} = P, mid = (n - 1) / 2;
  let s = 0, heavy = 0;
  for(const p of b) if(p && 'qrbnQRBN'.includes(p)) heavy += VAL[p.toLowerCase()];
  const endgame = heavy < (n === 8 ? 2600 : 1600);
  for(let i = 0; i < b.length; i++){
    const p = b[i]; if(!p) continue;
    const t = p.toLowerCase(), side = sideOf(p), r = (i / n) | 0, c = i % n;
    const centre = (n - Math.abs(r - mid) - Math.abs(c - mid)), adv = side > 0 ? (n - 1 - r) : r;
    let v = VAL[t];
    if(t === 'p') v += adv * (endgame ? 14 : 7) + (c > 0 && c < n - 1 ? 4 : 0) + (adv >= n - 2 ? 25 : 0);
    else if(t === 'n') v += centre * 6 - 20;
    else if(t === 'b') v += centre * 4;
    else if(t === 'q') v += centre * 2;
    else if(t === 'r') v += (adv === n - 2 ? 15 : 0);
    else if(t === 'k') v += endgame ? centre * 8 : (adv === 0 ? 15 : -adv * 12);
    s += side * v;
  }
  return s;
}
function moveScore(P, m){ const tgt = m.ep ? 'p' : P.b[m.to]; return (tgt ? 10 * VAL[tgt.toLowerCase()] - VAL[P.b[m.from].toLowerCase()] + 1000 : 0) + (m.promo === 'q' ? 900 : 0) + (m.castle ? 50 : 0); }
class Timeout extends Error {}
function quiesce(P, alpha, beta, ply, ctx){
  if((++ctx.nodes & 1023) === 0 && ctx.deadline && performance.now() > ctx.deadline) throw new Timeout();
  const stand = P.turn * evaluate(P) + (ctx.noise ? (Math.random() - 0.5) * ctx.noise : 0);
  if(stand >= beta) return stand;
  if(stand > alpha) alpha = stand;
  if(ply > ctx.qmax) return stand;
  const moves = genPseudo(P, true).map(m => [moveScore(P, m), m]).sort((a, c) => c[0] - a[0]);
  for(const [, m] of moves){
    const Q = makeMove(P, m); if(attacked(Q.b, P.n, kingSq(Q.b, P.turn), -P.turn)) continue;
    const v = -quiesce(Q, -beta, -alpha, ply + 1, ctx);
    if(v >= beta) return v;
    if(v > alpha) alpha = v;
  }
  return alpha;
}
function search(P, depth, alpha, beta, ply, ctx){
  if(depth <= 0) return quiesce(P, alpha, beta, ply, ctx);
  if((++ctx.nodes & 1023) === 0 && ctx.deadline && performance.now() > ctx.deadline) throw new Timeout();
  const moves = genPseudo(P).map(m => [moveScore(P, m), m]).sort((a, c) => c[0] - a[0]);
  let legal = 0, best = -Infinity;
  for(const [, m] of moves){
    const Q = makeMove(P, m); if(attacked(Q.b, P.n, kingSq(Q.b, P.turn), -P.turn)) continue;
    legal++;
    const v = -search(Q, depth - 1, -beta, -alpha, ply + 1, ctx);
    if(v > best) best = v;
    if(v > alpha) alpha = v;
    if(alpha >= beta) break;
  }
  if(!legal) return inCheck(P) ? -MATE + ply : 0;
  return best;
}
// Best move for the side to move: iterative deepening with a time budget.
function bestMove(P, depth, ms, noise){
  const moves = legalMoves(P); if(moves.length <= 1) return moves[0] || null;
  moves.sort((a, c) => moveScore(P, c) - moveScore(P, a));
  const ctx = {nodes: 0, deadline: ms ? performance.now() + ms : 0, noise: noise || 0, qmax: 8};
  let best = moves[0];
  for(let d = 1; d <= depth; d++){
    let curBest = null, curVal = -Infinity;
    try{
      for(const m of [best].concat(moves.filter(x => x !== best))){
        const v = -search(makeMove(P, m), d - 1, -Infinity, -curVal, 1, ctx);
        if(v > curVal){ curVal = v; curBest = m; }
      }
    }catch(e){ if(e instanceof Timeout) break; throw e; }
    if(curBest) best = curBest;
    if(curVal > MATE - 100) break;
  }
  return best;
}
function botChoice(P, L){
  const moves = legalMoves(P); if(!moves.length) return null;
  if(Math.random() < L.random){
    // a sleepy bot still grabs a free piece sometimes
    const caps = moves.filter(m => P.b[m.to] || m.ep);
    return caps.length && Math.random() < 0.5 ? pick(caps) : pick(moves);
  }
  return bestMove(P, L.depth, L.ms, L.depth <= 3 ? 25 : 0);
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
function designKey(){ return 'sp_chess_design:' + (S.player || ''); }
function loadDesign(){ try{ const d = localStorage.getItem(designKey()); if(DESIGNS[d]) design = d; }catch(e){} }
function saveDesign(){ try{ localStorage.setItem(designKey(), design); }catch(e){} }

/* ================= MENUS ================= */
function showScreen(name){
  document.body.setAttribute('data-design', design);
  if(name !== 'menu' && ChessCover) ChessCover.hide();   /* 🧱 b2: friend / link / play hide the cover */
  ['player', 'menu', 'friend', 'play', 'link'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));   // 📡 lk-3b: + link
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
  $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); }   /* 📣 cs-3a */ renderLevels(); showScreen('menu'); openCover();   /* 🧱 b2: the 🎬 cover first */
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){
  const b = (p.best || [])[i];
  if(!b || !(b.score || b.timeSec)) return '<div class="best none">' + (p.unlocked > i ? 'Beaten!' : 'Not beaten yet') + '</div>';
  return '<div class="best">' + (b.score ? '<span>🏆 ' + Number(b.score).toLocaleString() + '</span>' : '') + (b.timeSec ? '<span>⏱ ' + fmt(b.timeSec * 1000) + '</span>' : '') + '<span>' + '⭐'.repeat(b.stars || 0) + '</span></div>';
}
function renderLevels(){
  const box = $('level-list'); box.innerHTML = '';   /* 🧱 b2: 🏆 leaders live on the cover */
  const p = progressOf(S.player), rec = AGE_RECOMMEND[S.age];
  LEVELS.forEach((L, i) => {
    const open = canPlay(i), done = p.unlocked > i;
    const b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (L.hardcore ? ' hardcore' : '');
    b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : (open ? '' : '<span class="badge">🔒</span>')) +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div><div class="learn">vs 🤖 ' + L.bot + ' · ' + L.n + '×' + L.n + '</div><div class="sub">' + (L.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : L.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Beat Hard to unlock Extreme!' : 'Beat the level before this one to unlock it'); return; } CH.mode = 'bot'; CH.lvl = i; renderSetup(); };   /* 🧱 b2: a tap picks */
    b.dataset.i = i; box.appendChild(b);
  });
  if(!(CH.lvl >= 0 && canPlay(CH.lvl))){ let i = -1; try{ i = Number(localStorage.getItem('sp_chess_lv:' + S.player)); }catch(e){} CH.lvl = i >= 0 && canPlay(i) ? i : (canPlay(rec) ? rec : 0); }
  renderSetup();   /* 🧱 b2 */
}
function chooseFriend(){
  const box = $('friend-list'); box.innerHTML = '';
  S.players.filter(p => p.Name !== S.player).concat([{Name: 'Guest', Age: 'a visitor', guest: true}]).forEach(p => {
    const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    if(HAS_AV){ const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c); b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age || '') + '</div>'); drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1}); }
    else b.innerHTML = '<div class="big">' + (p.guest ? '🙂' : UI.esc(p.Name.charAt(0).toUpperCase())) + '</div><div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age || '') + '</div>';
    b.onclick = () => { CH.mode = 'duo'; CH.friend = p.Name; renderSetup(); showScreen('menu'); }; box.appendChild(b);   /* 🧱 b2: back to the setup with the friend */
  });
  showScreen('friend');
}
let pending = null;
function miniBoard(key){
  const row = ['r', 'n', 'q', 'k'], g = (p, w) => '<b class="gl ' + (w ? 'w' : 'bl') + '">' + GLYPH[p] + '\uFE0E</b>';
  let h = '';
  for(let r = 0; r < 4; r++) for(let c = 0; c < 4; c++){
    const dk = (r + c) % 2 === 1, p = r === 0 ? g(row[c], false) : r === 1 ? g('p', false) : r === 2 ? g('p', true) : g(row[c], true);
    h += '<i class="' + (dk ? 'd' : 'l') + '">' + p + '</i>';
  }
  return '<div class="mini" data-design="' + key + '">' + h + '</div>';
}
/* 🧱 b2 (Game Baseline pilot): ONE setup page — mode, board, level, pieces, options, ▶ Start */
const CH = {mode: 'bot', lvl: -1, friend: ''};
function chooseDesign(opts){ if(ChessCover) ChessCover.hide(); CH.mode = opts.mode; if(opts.lvl != null && opts.mode === 'bot') CH.lvl = opts.lvl; if(opts.friend) CH.friend = opts.friend; renderSetup(); showScreen('menu'); }   // old entry point: open the setup with these picks
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
  if(window.PieceSkins) [S.player].concat(CH.mode === 'duo' && CH.friend ? [CH.friend] : []).forEach(name => {
    sp.insertAdjacentHTML('beforeend', '<div class="section-head sub-head">♟️ ' + UI.esc(name) + '\'s pieces</div>');
    const row = document.createElement('div'); row.className = 'skin-chips'; row.setAttribute('data-for', name); sp.appendChild(row);
    PieceSkins.chips(row, PieceSkins.get(name), k => PieceSkins.set(name, k), true); });
  $('pieces-head').classList.toggle('b2-hide', !window.PieceSkins);
  const L = LEVELS[CH.lvl] || LEVELS[0], D = DESIGNS[design] || {icon: '', name: ''};
  $('btn-start').textContent = '▶ Start · ' + (CH.mode === 'duo' ? '👫 ' + S.player + ' vs ' + (CH.friend || '?') : L.emoji + ' ' + L.name) + ' · ' + D.icon + ' ' + D.name;
}
function startSetup(){
  if(CH.mode === 'duo'){ if(!CH.friend){ chooseFriend(); return; } startGame({mode: 'duo', lvl: 1, friend: CH.friend}); return; }
  if(!canPlay(CH.lvl)){ UISound.play('error'); UI.toast('Pick a level that is open 🔓'); return; }
  try{ localStorage.setItem('sp_chess_lv:' + S.player, String(CH.lvl)); }catch(e){}
  startGame({mode: 'bot', lvl: CH.lvl});
}
// 🎬 the cover: who's here (you + a friend on this device, or 📱 own devices → the 📡 lobby) + champions + how to play
let ChessCover = null;
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(ChessCover && ChessCover.who !== S.player){ ChessCover.destroy(); ChessCover = null; }
  if(!ChessCover){ ChessCover = GF.cover(document.body, {game: 'chess', title: 'Chess', icon: '♟️', me: S.player, players: S.players.concat([{Name: 'Guest'}]), avatarOf: myAvatar, seats: {min: 1, max: 2},
      help: CHESS_HELP, acts: ['beat.bow', 'beat.punch'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms',
      own: () => { ChessCover.hide(); lxChoose(); },   // 📡 own devices = the LinkKit lobby, unchanged (the lineup feed = 📡 LinkKit chat later)
      onPlay: line => { ChessCover.hide(); if(line.length > 1){ CH.mode = 'duo'; CH.friend = line[1].name; } else CH.mode = 'bot'; renderSetup(); showScreen('menu'); } }); ChessCover.who = S.player; }
  if(ChessCover.mode === 'own') ChessCover.setMode('solo');
  ChessCover.show();
}

/* ================= GAME ================= */
function startGame(opts){
  if(ChessCover) ChessCover.hide();   /* 🧱 b2 */
  clearTimeout(botTimer); hideResult(); closePromo();
  const lvl = opts.lvl, L = LEVELS[lvl], n = opts.mode === 'bot' ? L.n : 8;
  const P = setup(n);
  G = {mode: opts.mode, lvl, L, n, P, ids: P.b.map((p, i) => p ? i + 1 : 0), sel: null, moves: [], last: null, over: false, busy: false,
    t0: performance.now(), pausedAt: 0, pausedTotal: 0, hintUsed: false, keys: [posKey(P)], took: {1: [], '-1': []},
    names: {1: S.player, '-1': opts.mode === 'bot' ? L.bot : opts.friend}, friend: opts.friend, startMat: material(P.b, 1), feats: {castles: 0, promos: 0, enpassant: 0, forks: 0, checks: 0, dchecks: 0}};
  lxSeat();   // 📡 lk-3b: a linked game → G.lx, names by colour, the board turned to your side
  $('scr-play').setAttribute('data-design', design);
  BAR.level(opts.mode === 'bot' ? L.emoji + ' ' + L.name + ' · vs ' + L.bot : (G.lx ? '📡 ' : '👫 ') + G.names[1] + ' vs ' + G.names[-1]);
  $('nm-me').textContent = G.names[1]; $('nm-op').textContent = (opts.mode === 'bot' ? '🤖 ' : '') + G.names[-1];
  $('chip-me').innerHTML = '<span class="gl w">' + GLYPH.k + '︎</span>'; $('chip-op').innerHTML = '<span class="gl bl">' + GLYPH.k + '︎</span>';
  $('btn-hint').classList.toggle('hidden', opts.mode !== 'bot' || !!L.hardcore);   // 💀 Hardcore: no hints
  setTip(null);
  showScreen('play');
  buildBoard(); layout(); render(); tableStart(); cheerMount();   /* 📣 cs-3a: the crowd for this game (Off = nothing) */
  startTurn();
  clearInterval(tickHandle); tickHandle = setInterval(updateHud, 500); updateHud();
  clearInterval(clockHandle); G.clockLeft = null; clockShow(); if(clockOn()) clockHandle = setInterval(clockTick, 200);
  say(opts.mode === 'bot' ? (n === 6 ? 'Let\'s play mini chess! You go first.' : 'Let\'s play chess! You go first.') : 'Let\'s play chess! ' + G.names[1] + ' goes first.');
  if(G.lx) lxNames();
}
function material(b, s){ return b.reduce((t, p) => t + (p && sideOf(p) === s ? VAL[p.toLowerCase()] : 0), 0); }
function newGame(){
  if(!G) return;
  if(G.lx){ lxNewGame(); return; }   // 📡 lk-3b
  const opts = {mode: G.mode, lvl: G.lvl, friend: G.friend};
  if(G.over || G.keys.length <= 1) return startGame(opts);
  UI.confirm({icon: '🔄', title: 'Start a new game?', body: 'This game will be lost.', okText: 'New game', cancelText: 'Keep playing'}).then(ok => { if(ok) startGame(opts); });
}
function leavePlay(){
  if(G && G.lx){ lxLeavePlay(); return; }   // 📡 lk-3b
  const go = () => { if(window.Cheer) Cheer.unmount(); clearTimeout(botTimer); clearInterval(tickHandle); closePromo(); G = null; renderLevels(); showScreen('menu'); };
  if(!G || G.over || G.keys.length <= 1) return go();
  UI.confirm({icon: '◀', title: 'Leave this game?', body: 'The game will not be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) go(); });
}
function resign(){
  if(!G || G.over) return;
  if(G.lx && !G.lx.me){ UI.toast('📺 Players give up on their own device'); return; }   // 📺 lk-5a: the Room hostess has no colour
  const loser = G.lx ? G.lx.me : G.P.turn;   // 📡 lk-3b: linked = you give up for your own colour, on any turn
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

/* ---------- board drawing (DOM squares + gliding pieces) ---------- */
function buildBoard(){
  const n = G.n, bd = $('board'); bd.innerHTML = '';
  bd.style.gridTemplateColumns = 'repeat(' + n + ',1fr)'; bd.style.setProperty('--n', n);
  for(let i = 0; i < n * n; i++){
    const r = (i / n) | 0, c = i % n, sq = document.createElement('div');
    sq.className = 'sq' + ((r + c) % 2 === 1 ? ' dk' : ''); sq.dataset.i = i; if(G.flip){ sq.style.order = lxV(i); if(lxV(i) === 0) sq.classList.add('lx-tl'); }   // 📡 lk-3b: turned board (lk-3c: + the rounded corner where it shows top-left)
    sq.addEventListener('click', () => tapSquare(i));
    if(c === (G.flip ? n - 1 : 0)) sq.insertAdjacentHTML('beforeend', '<span class="coord">' + (n - r) + '</span>');
    if(r === (G.flip ? 0 : n - 1)) sq.insertAdjacentHTML('beforeend', '<span class="coord f">' + 'abcdefgh'[c] + '</span>');
    bd.appendChild(sq);
  }
  G.P.b.forEach((p, i) => { if(p) bd.appendChild(pieceEl(G.ids[i], p)); });
}
// 🎨 the skin of each side: you = your pick, a friend = their pick, the bot = the classic shapes
function skinOf(side){ if(!window.PieceSkins || !G) return 'classic'; return side > 0 ? PieceSkins.get(G.names[1]) : G.mode === 'duo' ? PieceSkins.get(G.friend) : 'classic'; }
function pieceHtml(p, cls){ const side = sideOf(p), t = p.toLowerCase(), sk = skinOf(side), im = sk !== 'classic' ? PieceSkins.img(sk, t, side > 0 ? 1 : 2) : '';
  return im || '<span class="gl ' + (side > 0 ? 'w' : 'bl') + (cls ? ' ' + cls : '') + '">' + GLYPH[t] + '︎</span>'; }
function pieceEl(id, p){
  const e = document.createElement('div'); e.className = 'pc ' + (sideOf(p) > 0 ? 'me' : 'op'); e.id = 'pc-' + id;
  e.innerHTML = '<div class="disc">' + pieceHtml(p) + '</div>';
  e.dataset.t = p.toLowerCase();
  return e;
}
function setGlyph(id, p){ const e = $('pc-' + id); if(!e) return; e.querySelector('.disc').innerHTML = pieceHtml(p); e.dataset.t = p.toLowerCase(); e.classList.remove('promo-pop'); void e.offsetWidth; e.classList.add('promo-pop'); }
function placePiece(e, sq){ const n = G.n; sq = lxV(sq); e.style.left = (sq % n) * 100 / n + '%'; e.style.top = ((sq / n) | 0) * 100 / n + '%'; }
function render(){
  const P = G.P;
  P.b.forEach((p, i) => { if(!p) return; const e = $('pc-' + G.ids[i]); if(e) placePiece(e, i); });
  document.querySelectorAll('.sq').forEach(s => { s.classList.remove('from', 'last', 'check', 'hint-to'); s.querySelectorAll('.dot').forEach(d => d.remove()); });
  document.querySelectorAll('.pc').forEach(e => e.classList.remove('sel', 'hint', 'can'));
  const cells = $('board').children;
  if(G.last) G.last.forEach(i => cells[i].classList.add('last'));
  if(inCheck(P)) cells[kingSq(P.b, P.turn)].classList.add('check');
  if(G.over || !isHumanTurn()) return;
  markDanger();
  if(G.sel != null){
    cells[G.sel].classList.add('from');
    const pe = $('pc-' + G.ids[G.sel]); if(pe) pe.classList.add('sel');
    [...new Set(G.moves.filter(m => m.from === G.sel).map(m => m.to))].forEach(t => {
      const cap = P.b[t] || G.moves.some(m => m.from === G.sel && m.to === t && m.ep);
      const d = document.createElement('div'); d.className = 'dot' + (cap ? ' cap' : ''); cells[t].appendChild(d);
    });
  } else if(G.lvl <= 1 || G.mode === 'duo'){
    [...new Set(G.moves.map(m => m.from))].forEach(f => { const pe = $('pc-' + G.ids[f]); if(pe) pe.classList.add('can'); });
  }
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
function isHumanTurn(){ return G && !G.over && (G.lx ? G.P.turn === G.lx.me : (G.mode === 'duo' || G.P.turn === 1)); }   // 📡 lk-3b: linked = only your own colour
function startTurn(){
  const P = G.P;
  G.moves = legalMoves(P); G.sel = null;
  const check = inCheck(P);
  if(!G.moves.length){ endGame(check ? -P.turn : 0, check ? 'mate' : 'stalemate'); return; }
  if(P.half >= 100){ endGame(0, 'fifty'); return; }
  if(insufficient(P.b)){ endGame(0, 'material'); return; }
  const k = posKey(P); if(G.keys.filter(x => x === k).length >= 3){ endGame(0, 'repeat'); return; }
  updatePlayers(); render();
  if(check){
    UISound.play('error');
    const who = isHumanTurn() ? (G.mode === 'duo' && !G.lx ? G.names[P.turn] + ', your' : 'Your') + ' King is in check! Protect it' : 'Check! ' + G.names[P.turn] + '\'s King is in danger';
    showBanner('♚ ' + who, isHumanTurn() ? 'bad' : 'warn');
  }
  if(isHumanTurn()) clockStart();
  if(G.lx){ lxTurn(); return; }   // 📡 lk-3b: no bot — the other device moves (or 🤖 for a dropped player)
  if(!isHumanTurn()){
    $('pl-op').classList.add('thinking'); if(window.Cheer) Cheer.hush(true);   /* 🤫 cs-3a */ $('pl-op').querySelector('.think').textContent = pickLine(LINES.think);
    botTimer = setTimeout(() => {
      if(!G || G.over || G.pausedAt) return;
      const t0 = performance.now(), m = botChoice(G.P, G.L);
      const wait = Math.max(0, (G.lvl === 0 ? 650 : 400) - (performance.now() - t0));
      botTimer = setTimeout(() => { $('pl-op').classList.remove('thinking'); playMove(m); }, wait);
    }, 60);
  }
}
function updatePlayers(){
  const P = G.P, adv = material(P.b, 1) - material(P.b, -1);
  [[1, 'me'], [-1, 'op']].forEach(([s, k]) => {
    const lead = s * adv > 0 ? ' · +' + Math.round(s * adv / 100) : '';
    $('st-' + k).textContent = P.b.filter(p => sideOf(p) === s).length + ' pieces' + lead;
    $('pl-' + k).classList.toggle('turn', !G.over && P.turn === s);
    $('tray-' + k).innerHTML = G.took[s].map(p => pieceHtml(p)).join('');
  });
  $('turn-msg').textContent = G.over ? 'Game over' : G.lx ? (P.turn === G.lx.me ? '👉 Your turn' : '⏳ ' + G.names[P.turn] + ' is thinking…') : G.mode === 'bot' ? (P.turn === 1 ? '👉 Your turn' : '🤖 ' + G.L.bot + ' is thinking…') : '👉 ' + G.names[P.turn] + '\'s turn';
}
function setTip(t){
  if(!t){ if(G && G.lx){ $('tip').innerHTML = !G.lx.me ? '📺 Room hostess — ' + UI.esc(G.names[1]) + ' plays ⚪ White and ' + UI.esc(G.names[-1]) + ' plays ⚫ Black, each on their own device.' : 'You play ' + (G.lx.me > 0 ? '⚪ White' : '⚫ Black') + ' — your side is at the bottom. Tap a piece to see where it can go.'; return; }   // 📡 lk-3b · 📺 lk-5a
    $('tip').innerHTML = G && G.mode === 'duo' ? 'Take turns. Tap a piece to see where it can go.' : 'Tap one of your pieces to see where it can go. Get the bot\'s King stuck — that\'s <b>checkmate</b>!'; return; }
  const I = PIECE_INFO[t]; $('tip').innerHTML = '<span class="gl w tipgl">' + GLYPH[t] + '︎</span> <b>' + I.name + '</b> — ' + I.tip;
}
function tapSquare(i){
  if(!isHumanTurn() || G.busy || G.pausedAt || !$('promo').classList.contains('hidden')) return;
  const P = G.P, p = P.b[i];
  if(p && sideOf(p) === P.turn){
    if(!G.moves.some(m => m.from === i)){
      UISound.play('error'); setTip(p.toLowerCase());
      showBanner(inCheck(P) ? 'Your King is in check — that piece can\'t help' : 'That ' + PIECE_INFO[p.toLowerCase()].name + ' can\'t move right now', 'bad');
      G.sel = null; render(); return;
    }
    G.sel = i; UISound.play('tap'); setTip(p.toLowerCase()); render(); return;
  }
  if(G.sel == null) return;
  const opts = G.moves.filter(m => m.from === G.sel && m.to === i);
  if(!opts.length){ UISound.play('error'); G.sel = null; render(); return; }
  if(opts.length > 1) return askPromo(opts);
  playMove(opts[0]);
}
// Pawn reached the far side: pick the new piece.
function askPromo(opts){
  const box = $('promo-btns'); box.innerHTML = '';
  opts.forEach(m => { const b = document.createElement('button'); b.className = 'pbtn'; b.setAttribute('data-sound', 'pop');
    b.innerHTML = '<span class="gl ' + (G.P.turn > 0 ? 'w' : 'bl') + '">' + GLYPH[m.promo] + '︎</span><small>' + PIECE_INFO[m.promo].name + '</small>';   // 📡 lk-3b: your colour
    b.onclick = () => { closePromo(); playMove(m); }; box.appendChild(b); });
  $('promo').classList.remove('hidden'); say('Pick a new piece!');
}
function closePromo(){ $('promo').classList.add('hidden'); }
// Animate the move (pieces glide; the knight hops), then apply it.
function playMove(m){ if(window.Cheer) Cheer.hush(false);   /* 📣 cs-3a: the move is in → the crowd may cheer */
  if(!G || G.over || !m) return;
  if(G.lx && !m.rm) lxSendMove(m);   // 📡 lk-3b: my move → the other device
  G.busy = true; G.sel = null;
  const P = G.P, mover = $('pc-' + G.ids[m.from]), t = P.b[m.from].toLowerCase();
  const capSq = m.ep ? m.to + (P.turn > 0 ? G.n : -G.n) : (P.b[m.to] ? m.to : -1);
  if(mover){ if(t === 'n'){ mover.classList.remove('hop'); void mover.offsetWidth; mover.classList.add('hop'); } placePiece(mover, m.to); mover.classList.add('moving'); }
  if(m.castle){ const row = P.turn > 0 ? (G.n - 1) * G.n : 0, k = m.castle.toLowerCase() === 'k'; const rook = $('pc-' + G.ids[row + (k ? 7 : 0)]); if(rook) placePiece(rook, row + (k ? 5 : 3)); }
  if(capSq >= 0){ tableRide(P.turn, mover, capSq, 120); setTimeout(() => takeOut(capSq, m.from), 120); }   // 🧑 the mover's avatar rides the piece and kicks the taken one else UISound.play(t === 'n' ? 'whoosh' : 'drop');
  botTimer = setTimeout(() => { if(mover) mover.classList.remove('moving'); G.busy = false; commit(m, capSq); }, capSq >= 0 ? 360 : 300);
}
function commit(m, capSq){
  const P = G.P, n = G.n, mover = P.b[m.from], id = G.ids[m.from];
  if(capSq >= 0){ const cid = G.ids[capSq], e = $('pc-' + cid); if(e){ e.classList.add('gone'); setTimeout(() => e.remove(), 1500); } G.took[P.turn].push(P.b[capSq]); G.ids[capSq] = 0; }
  if(m.castle){ const row = P.turn > 0 ? (n - 1) * n : 0, k = m.castle.toLowerCase() === 'k'; G.ids[row + (k ? 5 : 3)] = G.ids[row + (k ? 7 : 0)]; G.ids[row + (k ? 7 : 0)] = 0; }
  G.ids[m.from] = 0; G.ids[m.to] = id;
  const captured = capSq >= 0 ? P.b[capSq] : '';
  G.P = makeMove(P, m); G.last = [m.from, m.to]; G.keys.push(posKey(G.P));
  const mine = sideOf(mover) === (G.lx ? G.lx.me : 1);   // 📡 lk-3b: "your" = the colour on this device
  if(m.promo){ setGlyph(id, G.P.b[m.to]); UISound.play('success'); if(mine) showBanner('✨ Your pawn became a ' + PIECE_INFO[m.promo].name + '!'); else showBanner(G.names[sideOf(mover)] + '\'s pawn became a ' + PIECE_INFO[m.promo].name + '!', 'warn'); }
  else if(m.castle && mine){ showBanner('🏰 Castling! Your King is safe behind the Rook'); }
  if(capSq >= 0){ tableRideEnd(); tableReact(sideOf(mover), 'cheer'); tableReact(-sideOf(mover), 'facepalm'); }   // 🧑 table avatars react
  if(m.promo) tablePromo(sideOf(mover), m.to);   // 👑 the avatar jumps onto the new piece and dances
  setTip(null);
  cheerMove(m, sideOf(mover), captured, inCheck(G.P));   /* 📣 cs-3a */
  reactions(P, m, capSq, mover, captured);
  startTurn();
}
/* 📣 CHEERSQUAD (cs-3a) START — the crowd beside the board (CheerSquad.html, 📣 Cheer chat; the SAME block idea in Chess + Checkers). Don't remove: the Cheer chat re-applies it. */
// sides: 0 = the bottom player (you), 1 = the top (🤖 robot or your friend)
function cheerTaken(){ return [$('gbar'), $('frame'), ...Array.from($('side').children), ...document.querySelectorAll('.top-btn')]; }
function cheerMount(){
  if(!window.Cheer) return; Cheer.unmount();
  const duo = G.mode === 'duo', box = $('scr-play');
  Cheer.mount(box, {game: 'chess', players: [{name: S.player, side: 0, human: true}, {name: G.names[-1], side: 1, human: duo}], me: {name: S.player},
    family: (S.players || []).map(p => p.Name).filter(n => n !== G.names[-1]), avatars: S.avatars || {}, mode: 'overlay',
    zones: () => Cheer.freeZones(box, cheerTaken), avoid: cheerTaken,
    clear: b => { const B = box.getBoundingClientRect(), F = $('frame').getBoundingClientRect(), l = F.left - B.left, t = F.top - B.top; return !(b.r > l - 3 && b.l < l + F.width + 3 && b.b > t - 3 && b.t < t + F.height + 3); }});
}
// a move is in: s = the mover (1 = bottom, -1 = top) — capture = goal (Rook / Queen = big) · check / promotion = big · castling = goal
function cheerMove(m, s, captured, check){ if(!window.Cheer || !Cheer.active() || !G) return;
  const v = captured ? VAL[captured.toLowerCase()] || 0 : 0, kind = check || m.promo || v >= 500 ? 'big' : captured || m.castle ? 'goal' : '';
  if(kind) Cheer.react(kind, {side: s > 0 ? 0 : 1}); }
function cheerEnd(winner){ if(!window.Cheer || !Cheer.active() || !G) return; Cheer.hush(false);
  if(!winner) Cheer.react('goal', {side: -1});   /* 🤝 a draw: everyone claps */
  else if(winner > 0) Cheer.react('win', {side: 0});
  else Cheer.react(G.mode === 'duo' ? 'win' : 'lose', {side: G.mode === 'duo' ? 1 : 0}); }
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(!at) return; card.insertBefore(c, at); card.insertBefore(cap, at); }, 900); }
/* 📣 CHEERSQUAD END */
function showHint(){
  if(!G || G.over || !isHumanTurn() || G.mode !== 'bot' || G.busy) return;
  const m = bestMove(G.P, 3, 500);
  if(!m) return;
  G.hintUsed = true; G.sel = null; render();
  const e = $('pc-' + G.ids[m.from]); if(e) e.classList.add('hint');
  $('board').children[m.to].classList.add('hint-to');
  setTip(G.P.b[m.from].toLowerCase());
  showBanner('💡 Try moving this ' + PIECE_INFO[G.P.b[m.from].toLowerCase()].name + '! (hints give 2 ⭐ at most)');
  setTimeout(() => { if(G && !G.over && isHumanTurn() && G.sel == null) render(); }, 3200);
}

/* ---------- take-out effects ----------
   Normal pieces: knock (flies off with wood chips), poof (sparkles), zap (laser + pixels),
   squash (pancake + dust), pop (bubble pop + drops). Queens and Rooks get a power-up ending:
   meteor (crash + shake), strike (lightning), vortex (black hole), rocket (fireworks),
   tornado. Picked at random, never the same twice in a row; colours follow the board design. */
function sqCenter(sq){ const n = G.n, cs = $('board').clientWidth / n; sq = lxV(sq); return [(sq % n + 0.5) * cs, (((sq / n) | 0) + 0.5) * cs, cs]; }
function fxEl(cls, x, y, vars, text, life){ const e = document.createElement('div'); e.className = 'fx ' + cls; e.style.left = x + 'px'; e.style.top = y + 'px'; Object.keys(vars || {}).forEach(k => e.style.setProperty(k, vars[k])); if(text) e.textContent = text; $('board').appendChild(e); setTimeout(() => e.remove(), life || 1400); return e; }
function burstOf(cls, x, y, cs, count, spread, extra){ for(let k = 0; k < count; k++){ const a = Math.random() * Math.PI * 2, d = cs * (spread[0] + Math.random() * spread[1]); fxEl(cls, x, y, Object.assign({'--dx': Math.cos(a) * d + 'px', '--dy': (Math.sin(a) * d - cs * 0.25) + 'px', '--rot': (Math.random() * 600 - 300) + 'deg'}, typeof extra === 'function' ? extra(k) : extra || {}), null); } }
function sparks(x, y, cs, list, up){ list.forEach((b, k) => { const a = k / list.length * Math.PI * 2, d = cs * (0.55 + Math.random() * 0.4); fxEl('spark', x, y, {'--dx': Math.cos(a) * d + 'px', '--dy': (Math.sin(a) * d - cs * (up || 0.35)) + 'px', '--rot': (Math.random() * 180 - 90) + 'deg'}, b); }); }
function pieceColor(sq){ return sideOf(G.P.b[sq]) > 0 ? DESIGNS[design].p1 : DESIGNS[design].p2; }
const TAKE_NORMAL = {
  knock(e, x, y, cs){ e.classList.add('gone'); UISound.play('bump'); burstOf('chip', x, y, cs, 7, [0.5, 0.6], {}); for(let k = 0; k < 3; k++) fxEl('puff', x, y + cs * 0.2, {'--dx': (k - 1) * cs * 0.4 + 'px', '--dy': -cs * 0.1 + 'px'}, '💨'); },
  poof(e, x, y, cs){ setTimeout(() => e.classList.add('gone'), 60); UISound.play('pop'); setTimeout(() => UISound.play('success'), 160); sparks(x, y, cs, ['✨', '⭐', '💖', '🌟', '✨', '💫', '🌸', '✨']); fxEl('ring', x, y, {'--pxc': '#FF7EB9'}); },
  zap(e, x, y, cs, bx, by, sq){
    const col = pieceColor(sq), shooter = sideOf(G.P.b[sq]) > 0 ? DESIGNS[design].p2 : DESIGNS[design].p1, len = Math.hypot(x - bx, y - by), ang = Math.atan2(y - by, x - bx);
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
let lastTake = '';
function takeOut(sq, bySq){
  const e = $('pc-' + G.ids[sq]); if(!e) return;
  const [x, y, cs] = sqCenter(sq), [bx, by] = bySq == null ? [x, y] : sqCenter(bySq);
  e.style.setProperty('--kx', (x >= bx ? 1 : -1) * 160 + '%');
  const big = 'qr'.includes((G.P.b[sq] || '').toLowerCase()), set = big ? TAKE_KING : TAKE_NORMAL;
  const names = Object.keys(set).filter(k => k !== lastTake), kind = pick(names);
  lastTake = kind; e.classList.add('t-' + kind);
  set[kind](e, x, y, cs, bx, by, sq);
  if(big && sideOf(G.P.b[sq]) < 0) setTimeout(() => showBanner('💥 You took the ' + PIECE_INFO[G.P.b[sq].toLowerCase()].name + '!'), 300);
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

// What the pieces say. Check lines are said by the piece giving check, straight to the King.
const LINES = {
  check: {
    r: ['Knock knock, King! 🏰', 'Straight at you!', 'Nowhere to hide on my line!', 'Rook \'n\' roll!', 'Coming down the hallway!', 'Check, your Majesty!', 'Straight lines are my favourite!', 'Castle crash!', 'Hello from across the board!', 'Run, little King, run!'],
    q: ['Bow to the Queen! 👑', 'Check, darling!', 'I go anywhere I like!', 'Surprise, it\'s me!', 'The Queen has spoken!', 'Any direction, any distance!', 'Royal check!', 'You can\'t hide from me!', 'Off with your crown!', 'Queen power!'],
    n: ['Neigh! Check! 🐴', 'Hop, hop, gotcha!', 'I jumped right over them!', 'L is for… look out!', 'Giddy-up, check!', 'Didn\'t see me coming?', 'Over the wall I go!', 'Horsey says check!', 'Tricky trot!', 'Surprise gallop!'],
    b: ['Diagonal delivery!', 'Sliding in sideways!', 'Check from the corner!', 'Bless you… and check!', 'Zig-zag, gotcha!', 'On the slant!', 'Corner to corner!', 'I only walk diagonally — right at you!', 'Holy check!', 'Peekaboo from the side!'],
    p: ['Little me, big check!', 'Even pawns can bite!', 'Tiny but mighty!', 'Poke!', 'Small step, big check!', 'Surprise from the pawn!', 'Pawn power!', 'Watch your toes, King!', 'Hi King! Check!', 'I\'m small but brave!']
  },
  inCheck: ['Eek! Help me!', 'Not my crown!', 'Guards! Guards!', 'I\'m too royal for this!', 'Run away!', 'Somebody save me!', 'Oh dear, oh dear!', 'Hide me!', 'How rude!', 'I\'ll get you for that!'],
  escape: ['Phew!', 'That was close!', 'Safe… for now!', 'Ha, missed me!', 'Thank you, friends!', 'Not today!'],
  take: {
    r: ['Bulldozed!', 'Rook rolls over you!', 'Clear the hallway!', 'Bonk!'],
    q: ['Mine!', 'The Queen takes it!', 'Too easy!', 'Off the board you go!'],
    n: ['Hopped and chomped!', 'Neigh-ber, you\'re out!', 'Surprise jump!', 'Clip-clop, gotcha!'],
    b: ['Slid right in!', 'Diagonal snack!', 'Swoosh!', 'Got you on the slant!'],
    p: ['Gotcha!', 'Little pawn, big bite!', 'Tiny but tough!', 'Pawn attack!'],
    k: ['Royal grab!', 'The King does it himself!', 'Hmph, mine!', 'Kings can bite too!']
  },
  cry: ['Noooo!', 'Ouch!', 'I\'ll be back!', 'Not fair!', 'Bye bye!', 'Tell my friends I was brave!', 'Oof!', 'Eek!', 'See you next game!', 'Save me!'],
  promo: ['I\'m a QUEEN now! 👸', 'Look at me now!', 'Glow up! ✨', 'From tiny to mighty!', 'Promotion time!', 'I made it to the end!', 'Watch out, I\'m big now!', 'Ta-da!', 'Who\'s small now?', 'Dreams come true!'],
  castleK: ['Safe in my castle! 🏰', 'Tuck me in!', 'Hiding time!', 'Cosy corner!'],
  castleR: ['I\'ve got you, King!', 'Rook to the rescue!', 'Guard duty!', 'Switcheroo!'],
  fork: ['Fork! Two for one! 🍴', 'Which one will you save?', 'Double attack!', 'I\'m looking at both of you!', 'Pick one!', 'Two snacks!'],
  mate: ['Checkmate! 🎉', 'Game over, King!', 'Nowhere left to go!', 'Checkmate — we win!', 'Got you! Checkmate!', 'And that\'s checkmate!'],
  mated: ['I give up…', 'Oh no, trapped!', 'You win this time…', 'My crown! 😭'],
  stale: ['I can\'t move… 🤷', 'Stuck, but not in check!', 'Draw! Nobody wins!'],
  think: ['thinking…', 'Hmm… 🤔', 'Let me see…', 'Ooh, tricky!', 'I have a plan…', 'Calculating… 🧮', 'Where should I go?', 'Sneaky idea…']
};

// Which pieces of side `by` attack square sq (for "who gave check" and forks).
function attackersOf(b, n, sq, by){
  const out = [];
  for(let i = 0; i < b.length; i++){
    const p = b[i]; if(!p || sideOf(p) !== by) continue;
    const t = p.toLowerCase(), r = (i / n) | 0, c = i % n, tr = (sq / n) | 0, tc = sq % n, dr = tr - r, dc = tc - c;
    if(t === 'p'){ if(dr === (by > 0 ? -1 : 1) && Math.abs(dc) === 1) out.push(i); continue; }
    if(t === 'n'){ if((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2)) out.push(i); continue; }
    if(t === 'k'){ if(Math.max(Math.abs(dr), Math.abs(dc)) === 1) out.push(i); continue; }
    const straight = dr === 0 || dc === 0, diag = Math.abs(dr) === Math.abs(dc);
    if(!(dr || dc) || !((straight && (t === 'r' || t === 'q')) || (diag && (t === 'b' || t === 'q')))) continue;
    const sr = Math.sign(dr), sc = Math.sign(dc); let rr = r + sr, cc = c + sc, clear = true;
    while(rr !== tr || cc !== tc){ if(b[rr * n + cc]){ clear = false; break; } rr += sr; cc += sc; }
    if(clear) out.push(i);
  }
  return out;
}
// Pieces that are attacked and not protected get worried (💦) — on the helper levels and 2-player games.
function markDanger(){
  document.querySelectorAll('.pc.danger').forEach(e => e.classList.remove('danger'));
  if(!G || G.over || !(G.mode === 'duo' || G.lvl <= 2)) return;
  const P = G.P, s = P.turn;
  P.b.forEach((p, i) => { if(!p || sideOf(p) !== s || p.toLowerCase() === 'k') return;
    if(attacked(P.b, P.n, i, -s) && !attacked(P.b, P.n, i, s)){ const e = $('pc-' + G.ids[i]); if(e) e.classList.add('danger'); } });
}
// Everything the pieces say after a move.
function reactions(P0, m, capSq, mover, captured){
  const s = sideOf(mover), t = mover.toLowerCase(), P = G.P, n = G.n, kOpp = kingSq(P.b, -s), voiceOf = x => (G.mode === 'bot' && s < 0) ? 'bot' : x;
  const checkers = inCheck(P) ? attackersOf(P.b, n, kOpp, s) : [];
  const F = G.mode === 'bot' && s === 1 ? G.feats : null;
  if(F){ if(m.castle) F.castles++; if(m.promo) F.promos++; if(m.ep) F.enpassant++; if(checkers.length) F.checks++; if(checkers.length > 1) F.dchecks++; }
  const mated = checkers.length && !legalMoves(P).length;
  let said = false;
  if(checkers.length){
    const c = checkers.includes(m.to) ? m.to : checkers[0], ct = P.b[c].toLowerCase();
    bubble(c, pickLine(mated ? LINES.mate : (LINES.check[ct] || LINES.check.q)), s, voiceOf(ct)); said = true;
    if(checkers.length > 1){ megaText('DOUBLE CHECK!', true); flashBoard(); }
    else megaText('CHECK!', false);
    setTimeout(() => { if(G && kOpp >= 0) bubble(kOpp, pickLine(mated ? LINES.mated : LINES.inCheck), -s, mated ? null : 'k'); }, 1150);
  }
  if(!said && m.promo){ bubble(m.to, pickLine(LINES.promo), s, 'q'); crownDrop(m.to, '✨'); said = true; }
  if(!said && m.castle){ bubble(m.to, pickLine(LINES.castleK), s, 'k'); const row = s > 0 ? (n - 1) * n : 0, rk = row + (m.castle.toLowerCase() === 'k' ? 5 : 3); setTimeout(() => G && bubble(rk, pickLine(LINES.castleR), s, null), 1100); said = true; }
  // fork: the piece that moved now attacks two valuable pieces
  if(!said && t !== 'k'){
    const targets = P.b.map((p, i) => i).filter(i => P.b[i] && sideOf(P.b[i]) === -s && (VAL[P.b[i].toLowerCase()] >= 300 || P.b[i].toLowerCase() === 'k') && attackersOf(P.b, n, i, s).includes(m.to));
    if(targets.length >= 2){ if(F) F.forks++; bubble(m.to, pickLine(LINES.fork), s, voiceOf(t)); megaText('FORK! 🍴', true); flashBoard(); chime(3); said = true; }
  }
  if(!said && captured){
    if(Math.random() < 0.6){ bubble(m.to, pickLine(LINES.take[t]), s, voiceOf(t)); said = true; }
    else setTimeout(() => G && bubble(capSq, pickLine(LINES.cry), -s, null), 200);
  }
  // escaping check
  if(inCheck(P0) && !said){ const k = kingSq(P.b, s); bubble(k, pickLine(LINES.escape), s, 'k'); }
}

/* ---------- end of the game ---------- */
const END_WHY = {mate: 'Checkmate!', stalemate: 'Stalemate — no legal moves, but no check', fifty: '50 moves without a capture or pawn move', material: 'Not enough pieces left to checkmate', repeat: 'The same position 3 times', resign: 'gave up'};
function endGame(winner, why){
  if(G.over) return;
  G.over = true; G.finishMs = performance.now() - G.t0 - G.pausedTotal; clearTimeout(botTimer);
  const thisGame = G;
  clearTimeout(bannerTimer); $('banner').classList.remove('on'); closePromo();
  $('pl-op').classList.remove('thinking'); if(G.lx) lxThink(0);   // 📡 lk-3b
  updatePlayers(); render(); tableEnd(winner); cheerEnd(winner);   /* 📣 cs-3a */
  document.querySelectorAll('.pc.danger').forEach(e => e.classList.remove('danger'));
  if(winner){
    const lk = kingSq(G.P.b, -winner), le = $('pc-' + G.ids[lk]); if(le && why === 'mate') le.classList.add('topple');
    G.P.b.forEach((p, i) => { const e = $('pc-' + G.ids[i]); if(!p || !e) return; if(sideOf(p) === winner) setTimeout(() => e.classList.add('dance'), 900); else if(i !== lk) e.classList.add('sad'); });
  } else if(why === 'stalemate'){ bubble(kingSq(G.P.b, G.P.turn), pickLine(LINES.stale), G.P.turn, null); }
  const secs = Math.max(1, Math.round(G.finishMs / 1000)), moves = G.P.full;
  if(G.mode === 'duo'){
    const name = winner ? G.names[winner] : '';
    if(winner){ party('🎉 ' + name + ' wins!'); say((why === 'mate' ? 'Checkmate! ' : '') + name + ' wins!'); confetti(['♛', '♚', '🎉', '⭐'], 30); }
    setTimeout(() => {
      if(G !== thisGame) return;
      if(thisGame.lx){   // 📡 a linked game: the LinkKit chat's own result buttons, unchanged
      showResult('<div class="big">' + (winner ? '🏆' : '🤝') + '</div><h2 class="cheer">' + (winner ? UI.esc(name) + ' wins!' : 'It\'s a draw!') + '</h2>' +
        '<p style="margin:-4px 0 0;font-weight:800;color:var(--ink-soft)">' + (why === 'resign' ? UI.esc(G.names[-winner]) + ' gave up' : END_WHY[why]) + '</p>' +
        '<div class="stats"><span>⏱ ' + fmt(G.finishMs) + '</span><span>♟️ ' + moves + ' moves</span></div>' +
        lxResultBtns());
      lxResultWire(); return; }
      GF.result({wrap: $('result'), card: $('result-card'), win: winner ? true : null, icon: winner ? '🏆' : '🤝', title: winner ? name + ' wins!' : 'It\'s a draw!',   /* 🧱 b2: same-device game → the shared card */
        sub: why === 'resign' ? G.names[-winner] + ' gave up' : END_WHY[why], stats: [['⏱', fmt(G.finishMs)], ['♟️', moves + ' moves']], confetti: false,
        buddy: HAS_AV && winner ? {name, av: myAvatar(name)} : null,
        levels: () => { hideResult(); G = null; clearInterval(tickHandle); renderLevels(); showScreen('menu'); }, levelsText: '🎚️ Menu',
        again: () => startGame({mode: 'duo', lvl: 1, friend: G.friend}), againText: '🔁 Play again'});
      const ag = $('btn-again'); if(ag) ag.id = 'b-again'; const mn = $('btn-levels'); if(mn) mn.id = 'b-menu'; cheerFaces();
    }, winner ? 1500 : 300);
    return;
  }
  if(winner === 1){
    const lvl = G.lvl, mine = material(G.P.b, 1);
    const stars = 1 + (mine >= G.startMat / 2 ? 1 : 0) + (G.hintUsed ? 0 : 1);
    const par = 240 + 120 * lvl;
    const score = (150 * (lvl + 1) + Math.round(mine / 10) + Math.max(0, 60 - moves) * 5 + Math.max(0, (par - secs))) * (G.L.hardcore ? 3 : 1);   // 💀 Hardcore ×3
    const pr = pick(PRAISE);
    party('♛ ' + pr + ', ' + S.player + '!'); setTimeout(() => say(pr + ', ' + S.player + '!'), 2600);
    confetti(['♛', '♚', '👑', '⭐', '🎉', '✨'], 46);
    UISound.play('success');
    setTimeout(() => {
      if(!G || G !== thisGame) return;
      GF.result({wrap: $('result'), card: $('result-card'), win: true, icon: '🏆', title: pr + '!', sub: 'You checkmated 🤖 ' + G.L.bot + ' on ' + G.L.name + '!', stars,   /* 🧱 b2: the shared 🏁 card */
        stats: [['🏆', Number(score).toLocaleString()], ['⏱', fmt(G.finishMs)], ['♟️', moves + ' moves'], ['🎯', 'took ' + G.took[1].length]].concat(G.hintUsed ? [['💡', 'Hint used — 2 ⭐ at most']] : []),
        save: 'Saving your progress…', buddy: HAS_AV ? {name: S.player, av: myAvatar(S.player)} : null, confetti: false,
        levels: () => { hideResult(); G = null; clearInterval(tickHandle); renderLevels(); showScreen('menu'); },
        again: () => startGame({mode: 'bot', lvl}), againText: '🔁 Again',
        next: lvl < 5 ? () => { if(!canPlay(lvl + 1)){ UI.toast('Beat this level to unlock the next one', 'err'); return; } hideResult(); CH.lvl = lvl + 1; startGame({mode: 'bot', lvl: lvl + 1}); } : null,
        nextText: lvl === 4 ? 'Try 💀 Hardcore ▶' : 'Next level ▶'});
      ['btn-again:b-again', 'btn-levels:b-menu', 'btn-next:b-next'].forEach(x => { const [a1, b1] = x.split(':'), e = $(a1); if(e) e.id = b1; }); cheerFaces();
    }, REDUCED ? 300 : 1600);
    saveWin(lvl, {timeSec: secs, stars, score, theme: design, stats: Object.assign({}, G.feats, {mates: 1, fastMate: moves})});
  } else {
    sendFeats(G.feats);
    UISound.play(winner ? 'bump' : 'pop');
    if(!winner) say('It\'s a draw!');
    setTimeout(() => {
      if(G !== thisGame) return;
      GF.result({wrap: $('result'), card: $('result-card'), win: winner ? false : null, icon: winner ? '🤖' : '🤝', title: winner ? 'Good game!' : 'It\'s a draw!',   /* 🧱 b2: the shared 🏁 card */
        sub: (winner ? (why === 'time' ? '💀 Time\'s up! The clock ran out.' : why === 'resign' ? 'You gave up this one.' : '🤖 ' + G.L.bot + ' won with checkmate.') + ' You took ' + G.took[1].length + ' piece' + (G.took[1].length === 1 ? '' : 's') + '!' : 'Nobody could win this one.'),
        stats: [['💡', pick(['Move your Knights and Bishops out early — they like the middle.', 'Before you move, check: can the bot take that piece?', 'Castle early to keep your King safe 🏰.', 'Pawns that reach the far side become Queens!', 'Use the 💡 Hint button when you are stuck.'])]], buddy: HAS_AV ? {name: S.player, av: myAvatar(S.player)} : null,
        levels: () => { hideResult(); G = null; clearInterval(tickHandle); renderLevels(); showScreen('menu'); },
        again: () => startGame({mode: 'bot', lvl: G.lvl}), againText: '🔁 Try again'});
      ['btn-again:b-again', 'btn-levels:b-menu'].forEach(x => { const [a1, b1] = x.split(':'), e = $(a1); if(e) e.id = b1; }); cheerFaces();
    }, 900);
  }
}
function party(text){ const p = document.createElement('div'); p.className = 'praise'; p.textContent = text; $('stage-wrap').appendChild(p); setTimeout(() => p.remove(), REDUCED ? 600 : 1600); }

/* ================= SAVE ================= */
const PENDING_KEY = 'sp_chess_pending';
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
  UI.loading('chess');
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
const MS_GAME = 'chess';
function msOpen(id){
  if(id === 'duo') chooseFriend();
  if(id === 'lhost') lxOpenHost(); if(id === 'ljoin') lxJoin();   // 📡 lk-3b
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

/* 📡 LINK (lk-3b): ♟️ Chess on 2 own devices (LinkKit). The host's device is the referee: it checks every move and keeps the true game.
   Each player moves their own colour on their own device (the board turned to their side); a move shows at once here and glides in there.
   Messages: host → guest chgo (start / full state, + `you` = that device's colour) · both ways chmove {tn, from, to, promo} · chend (gave up) · guest → host chask (send me the game).
   📺 lk-5a Room hostess: the host device has no colour (G.lx.me = 0) — both colours are guests (G.lx.seats = {1: lseat, -1: lseat}); the host checks
   every move and passes it on to the other player; ▶ Start / 🔁 Play again also from the first player's device (Link.ask). */
const LX = {wired: false, lobby: null, pending: null, cfg: null, autoT: 0, games: 0, thinkT: 0, sayT: 0, side: 0};
const LX_AUTO_MS = window.LX_AUTO_MS || 20000;
const LX_TALK = ['Hmm… 🤔', 'I have a plan… 😏', 'Which piece… ♞', 'Don’t rush me! ⏳', 'Ooh, tricky! 🤯', 'Watch my Knight! 🐴', 'Hello everyone! 👋', 'Shh, thinking… 🤫',
  'Big move coming! 🌟', 'Is that a trap? 🧐', 'Almost ready!', 'My Queen is ready! 👑', 'Guard the King! 🛡️', 'Where to go… 🗺️', 'You’ll see! 😎', 'Tick tock… 🕰️'];
function lxV(sq){ return G && G.flip ? G.n * G.n - 1 - sq : sq; }   // board square → where it shows on this device
function lxSeat(){
  $('scr-play').classList.remove('lx-flip'); ['me', 'op'].forEach(k => $('pl-' + k).classList.remove('lx-you'));
  if(!LX.pending || G.mode !== 'duo') return;
  G.lx = LX.pending; LX.pending = null; G.flip = G.lx.me < 0;   // 📺 the TV (me 0) shows the board the normal way round
  G.names = {1: G.lx.names[1], '-1': G.lx.names[-1]}; G.friend = G.names[-1];   // lk-3c: the ⚫ pieces wear the ⚫ player's skin
  $('scr-play').classList.toggle('lx-flip', G.flip);
}
function lxNames(){   // a "YOU" tag on your own card (long names stay readable on phones) · 📺 the TV: no tag
  [[1, 'me'], [-1, 'op']].forEach(([sd, k]) => { $('nm-' + k).textContent = G.names[sd]; $('pl-' + k).classList.toggle('lx-you', sd === G.lx.me); });
  $('scr-play').classList.toggle('lx-tv', !G.lx.me);
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
async function lxOpenHost(tv){   // 📺 lk-5a: tv = Room hostess (no colour on this device)
  lxWire(); lxCloseLobby(); lxIdle(); LX.tv = !!tv;
  $('lx-sub').textContent = tv ? '📺 This screen is the Room hostess — two players tap 🔗 Join a friend on their own devices' : 'Your friend taps 🔗 Join a friend on their own phone or tablet — same Wi-Fi or 🌍 anywhere'; showScreen('link');
  const el = $('lx-lobby'); el.innerHTML = '<div class="lk"><div class="lk-msg"><span class="ui-spin a-bob">' + (tv ? '📺' : '📡') + '</span> Opening the room<span class="lk-dots"></span></div></div>';
  try{ await Link.host({game: 'Chess', name: S.player, seats: 2, hostess: !!tv, page: 'chess', label: '♟️ Chess · 2 players' + (tv ? ' · 📺 on the TV' : '')}); }
  catch(e){ UISound.play('error'); el.innerHTML = '<div class="lk"><div class="lk-msg bad">😕 ' + UI.esc((e && e.message) || 'Could not open the room') + '</div></div>'; return; }
  if($('scr-link').classList.contains('hidden')) return;
  LX.lobby = Link.lobby(el, {title: '♟️ Chess · 2 players', url: WEBAPP_URL + '?page=chess', minPlayers: 2, name: S.player, drawAvatar: lxAv, kind: 'chess', onStart: lxHostGo});
}
function lxJoin(code){
  lxWire(); lxCloseLobby(); lxIdle();
  $('lx-sub').textContent = 'Same Wi-Fi as the host'; showScreen('link');
  LX.lobby = Link.lobby($('lx-lobby'), {title: '♟️ Chess', name: S.player, drawAvatar: lxAv, code: code || undefined, onJoined: () => UISound.play('success')});
}
function lxExit(){
  lxIdle(); lxCloseLobby(); clearTimeout(LX.autoT); lxThink(0); LX.cfg = null;
  const o = document.querySelector('.lx-over'); if(o) o.remove();
  if(G && G.lx){ if(window.Cheer) Cheer.unmount(); clearTimeout(botTimer); clearInterval(tickHandle); closePromo(); hideResult(); G = null; }
  $('scr-play').classList.remove('lx-flip'); ['me', 'op'].forEach(k => $('pl-' + k).classList.remove('lx-you'));
  renderLevels(); showScreen('menu');
}
function lxLeavePlay(){
  if(G.over){ lxExit(); return; }
  const host = G.lx.role === 'host';
  UI.confirm({icon: '◀', title: host ? 'End the game for ' + (G.lx.tv ? 'everyone' : 'both') + '?' : 'Leave this game?', body: host ? (G.lx.tv ? '📺 You are the Room hostess — the game stops on every device.' : 'You are the host — the game stops on both devices.') : '🤖 The robot plays your moves until you come back.', okText: host ? 'End game' : 'Leave', cancelText: 'Keep playing'})
    .then(ok => { if(ok) lxExit(); });
}
function lxNewGame(){
  if(G.lx.role !== 'host'){ UI.toast('📡 ' + ((LX.cfg && LX.cfg.host) || 'The host') + ' can start a new game'); return; }
  if(G.over){ lxHostGo(); return; }
  UI.confirm({icon: '🔄', title: 'New game for ' + (G.lx.tv ? 'everyone' : 'both') + '?', body: 'This game stops on ' + (G.lx.tv ? 'every device' : 'both devices') + '. Colours swap.', okText: 'New game', cancelText: 'Keep playing'}).then(ok => { if(ok) lxHostGo(); });
}
// ---- host ----
function lxHostGo(){
  const tv = Link.hostess && Link.hostess();
  const list = Link.players().filter(p => p.name && p.on && !p.screen).sort((a, b) => a.seat - b.seat);
  let names = {}, seats = {}, hostSide = 0;
  if(tv){   // 📺 lk-5a: both colours are guests — the colours swap every game
    if(list.length < 2){ UISound.play('error'); UI.toast('📺 Wait for 2 players to join'); return; }
    const w = LX.games++ % 2 === 0 ? 0 : 1, a = list[w], b = list[1 - w];
    names = {1: a.name, '-1': b.name}; seats = {1: a.seat, '-1': b.seat};
  } else {
    const me = list.find(p => p.seat === Link.seat()) || {name: S.player, seat: Link.seat()}, fr = list.find(p => p !== me);
    if(!fr){ UISound.play('error'); UI.toast('📡 Wait for a friend to join'); return; }
    hostSide = LX.games++ % 2 === 0 ? 1 : -1;   // ⚪ White moves first — the colours swap every game
    names[hostSide] = me.name; names[-hostSide] = fr.name; seats[hostSide] = 'host'; seats[-hostSide] = fr.seat;
  }
  LX.cfg = {id: Date.now().toString(36), host: S.player, tv: !!tv, names, hostSide, guest: seats[-hostSide || -1]};
  lxCloseLobby(); hideResult(); const o = document.querySelector('.lx-over'); if(o) o.remove();
  LX.pending = {role: 'host', me: hostSide, id: LX.cfg.id, names, seats, guest: LX.cfg.guest, away: {}, tv: !!tv};
  startGame({mode: 'duo', lvl: 1, friend: names[-1]});   // the true game lives here; G.lx comes from LX.pending
  lxSendGo();
}
function lxState(){ return {id: G.lx.id, P: G.P, ids: G.ids, took: G.took, keys: G.keys, last: G.last, over: G.over, end: G.lx.end || null}; }
function lxGuestSeats(){ return [1, -1].filter(sd => G.lx.seats && G.lx.seats[sd] != null && G.lx.seats[sd] !== 'host').map(sd => ({side: sd, seat: G.lx.seats[sd]})); }
function lxSendGo(only){ if(G && G.lx && G.lx.role === 'host' && G.busy){ setTimeout(() => lxSendGo(only), 150); return; }   // a move is gliding: send the game once it is in
  if(!(G && G.lx && G.lx.role === 'host')) return;
  lxGuestSeats().forEach(g => { if(only == null || only === g.seat) Link.send('chgo', {cfg: LX.cfg, you: g.side, st: lxState()}, {sure: true, to: g.seat}); }); }
function lxTurn(){
  const mine = G.P.turn === G.lx.me;
  lxThink(mine ? 0 : G.P.turn);
  clearTimeout(LX.autoT);
  if(G.lx.role === 'host' && !mine && G.lx.away && G.lx.away[G.P.turn]) LX.autoT = setTimeout(lxAuto, LX_AUTO_MS);
}
function lxAuto(){   // 🤖 plays for a player whose device dropped out
  if(!G || !G.lx || G.over || !G.lx.away || !G.lx.away[G.P.turn] || G.P.turn === G.lx.me || G.busy) return;
  showBanner('🤖 Robot moves for ' + G.names[G.P.turn], 'warn');
  const m = botChoice(G.P, LEVELS[1]); if(m) playMove(m);
}
// ---- both devices ----
function lxSendMove(m){ Link.send('chmove', {id: G.lx.id, tn: G.keys.length, from: m.from, to: m.to, promo: m.promo || ''}, {sure: true}); }   // host → every player · guest → the host
function lxSendEnd(winner, why){ if(!G || !G.lx) return; G.lx.end = {winner, why}; Link.send('chend', {id: G.lx.id, winner, why}, {sure: true}); }
function lxGotMove(d, tries, seat){
  if(!G || !G.lx || !d || d.id !== G.lx.id || G.over) return;
  if(G.busy && (tries || 0) < 20){ setTimeout(() => lxGotMove(d, (tries || 0) + 1, seat), 150); return; }
  const host = G.lx.role === 'host', side = G.P.turn;
  const fromOk = !host || (G.lx.seats && G.lx.seats[side] === seat);   // 📺 lk-5a: only the device that owns the colour to move
  const m = fromOk && d.tn === G.keys.length && side !== G.lx.me ? legalMoves(G.P).find(x => x.from === d.from && x.to === d.to && (x.promo || '') === (d.promo || '')) : null;
  if(!m){   // out of step: the host's game is the truth
    if(host) lxSendGo(seat); else Link.send('chask', {id: G.lx.id}, {sure: true});
    return;
  }
  if(host) lxGuestSeats().forEach(g => { if(g.seat !== seat) Link.send('chmove', d, {sure: true, to: g.seat}); });   // 📺 pass it on to the other player
  clearTimeout(LX.autoT); lxThink(0); closePromo();
  m.rm = true; playMove(m);
}
// ---- guest ----
function lxGuestStart(d){
  LX.cfg = d.cfg; lxCloseLobby(); hideResult(); const o = document.querySelector('.lx-over'); if(o) o.remove();
  LX.pending = {role: 'guest', me: d.you != null ? d.you : -d.cfg.hostSide, id: d.cfg.id, names: d.cfg.names, tv: !!d.cfg.tv};
  startGame({mode: 'duo', lvl: 1, friend: d.cfg.host});
  lxApply(d.st);
}
function lxApply(st){
  if(!G || !G.lx || !st || st.id !== G.lx.id) return;
  if(G.busy){ setTimeout(() => lxApply(st), 200); return; }
  const same = st.keys.length === G.keys.length && st.keys[st.keys.length - 1] === G.keys[G.keys.length - 1];
  if(!same){
    G.P = st.P; G.ids = st.ids; G.took = st.took; G.keys = st.keys; G.last = st.last; G.sel = null; closePromo();
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
function lxResultWire(){ const a = $('b-again'); if(a) a.onclick = () => { if(G && G.lx && G.lx.role !== 'host'){ UI.busy(a, 'chess', 'Asking the TV…'); Link.ask('again'); } else lxHostGo(); }; $('b-menu').onclick = () => lxExit(); }
function lxEnded(msg){
  if(G){ G.over = true; clearTimeout(LX.autoT); lxThink(0); }
  hideResult(); closePromo(); const o0 = document.querySelector('.lx-over'); if(o0) o0.remove();   // the message sits on top, alone
  const o = document.createElement('div'); o.className = 'lx-over';
  o.innerHTML = '<div class="result-card"><div class="big">📡</div><h2>' + UI.esc(msg) + '</h2><div class="note">Thanks for playing together!</div><div class="res-btns"><button class="btn sp-btn sp-primary" data-sound="none" onclick="lxExit()">◀ Chess</button></div></div>';
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
(function(){   // 📺 lk-5a: the TV (me 0) sees the crowd like a ⚪ device
  const mount = cheerMount, move = cheerMove, end = cheerEnd;
  cheerMount = function(){ if(!G || !G.lx || G.lx.me > 0) return mount.apply(this, arguments);
    const nm = G.names, me = S.player; G.names = {1: nm[-1], '-1': nm[1]}; S.player = nm[-1];
    try{ return mount.apply(this, arguments); } finally { G.names = nm; S.player = me; } };
  cheerMove = function(m, sd, c, ch){ return move.call(this, m, G && G.lx ? sd * (G.lx.me || 1) : sd, c, ch); };
  cheerEnd = function(w){ return end.call(this, G && G.lx && w ? w * (G.lx.me || 1) : w); };
})();
function lxWire(){
  if(LX.wired || !window.Link) return; LX.wired = true;
  // guest side
  Link.on('chgo', d => { if(Link.isHost() || !d || !d.cfg) return; if(G && G.lx && G.lx.id === d.cfg.id){ lxApply(d.st); return; } lxGuestStart(d); });
  Link.on('hostleft', e => { if(Link.isHost()) return; if(!G && $('scr-link').classList.contains('hidden')) return;
    UISound.play('bump'); lxEnded(e && e.reason === 'lost' ? '📶 Lost the link to ' + ((LX.cfg && LX.cfg.host) || 'the host') : '👋 ' + ((LX.cfg && LX.cfg.host) || 'The host') + ' ended the game'); });
  // both
  Link.on('chmove', (d, seat) => lxGotMove(d, 0, seat));
  Link.on('chend', (d, seat) => { if(!G || !G.lx || !d || d.id !== G.lx.id || G.over) return;
    if(Link.isHost()){   // 📺 only the device of that colour may give up — then tell the other player
      const side = [1, -1].find(sd => G.lx.seats && G.lx.seats[sd] === seat); if(!side || d.winner !== -side) return;
      lxGuestSeats().forEach(g => { if(g.seat !== seat) Link.send('chend', d, {sure: true, to: g.seat}); });
    }
    G.lx.end = {winner: d.winner, why: d.why}; endGame(d.winner, d.why); });
  // host side
  Link.on('chask', (d, seat) => { if(Link.isHost() && G && G.lx && d && d.id === G.lx.id) lxSendGo(seat); });
  Link.on('lk:ask', (d, seat) => { if(!Link.isHost() || !d || d.what !== 'again' || !G || !G.lx || !G.over || !G.lx.tv) return;   // 📺 the first player's 🔁
    if(Link.captain() !== seat) return; lxHostGo(); });
  const sideOfSeat = seat => [1, -1].find(sd => G && G.lx && G.lx.seats && G.lx.seats[sd] === seat);
  Link.on('leave', e => { if(!Link.isHost() || !G || !G.lx || G.over) return; const sd = sideOfSeat(e.seat); if(!sd) return;
    G.lx.away = G.lx.away || {}; G.lx.away[sd] = true;
    showBanner('📶 ' + G.names[sd] + ' dropped out — 🤖 the robot moves for them until they come back', 'bad');
    if(G.P.turn === sd){ clearTimeout(LX.autoT); LX.autoT = setTimeout(lxAuto, LX_AUTO_MS); } });
  const back = e => { if(!Link.isHost() || !G || !G.lx || !LX.cfg) return; const sd = sideOfSeat(e.seat); if(!sd) return;
    if(G.lx.away && G.lx.away[sd]){ G.lx.away[sd] = false; clearTimeout(LX.autoT); showBanner('👋 ' + G.names[sd] + ' is back!'); UISound.play('success'); }
    lxSendGo(e.seat); };
  Link.on('rejoin', back); Link.on('join', back);
  addEventListener('pagehide', () => { try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} });
}
// 🔗 QR / waiting room: ?page=chess&link=<code> → the number pad (the waiting room leaves it empty to type)
function lxUrlCode(cb){
  try{ if(window.google && google.script && google.script.url && google.script.url.getLocation){ google.script.url.getLocation(l => cb(((l && l.parameter) || {}).link || '')); return; } }catch(e){}
  try{ cb(new URLSearchParams(location.search).get('link') || ''); }catch(e){ cb(''); }
}
msAfter('choosePlayer', () => lxUrlCode(c => { c = String(c || '').replace(/[^0-9]/g, '').slice(0, 4); if(c.length === 4) lxJoin(c); }));
/* 📡 END LINK (lk-3b) */
