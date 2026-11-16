
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   /* loader + menus in the player's look before the server answers */
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'word-board';
// 🎛️ p1a: the shared top bar — ◀ Back (where you came from) · 🎚️ Levels · 🏠 | 🔤 Lettercraft · level | player cards | 🔁 round | ❓ 🔍 🔈 ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🔤', name: 'Lettercraft', levelId: 'hud-level', fold: true,
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { clearInterval(timerId); try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => pauseGame(), resume: () => resume()}, onFit: () => { if(G) layout(); },
  extras: [{id: 'zoom-btn', icon: '🔍', label: 'Zoom the board (Z)', onClick: () => toggleZoom()}, {id: 'voice-btn', icon: '🔈', label: 'Voice: off', onClick: () => toggleVoice()}]});
function paintVoice(){ BAR.extra('voice-btn', {icon: voiceOn ? '🔊' : '🔈', label: voiceOn ? 'Voice: on' : 'Voice: off'}); }
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
const pick = a => a[rnd(a.length)];
function fmt(ms){ const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
let voiceOn = true;
function say(text){ try{ if(!voiceOn || !UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.15; u.volume = Math.max(0.2, UISound.get().volume); speechSynthesis.speak(u); }catch(e){} }
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ================= WORD LIST ================= */
// ~23,000 everyday English words (2–9 letters), most common first, rude words left out (built from word-frequency data).
// Players may play any word in the list; the robot only uses the first `vocab` words of its level (easy words on easy levels).
const WORDS_RAW = window.LC_WORDS_RAW || '';   /* 📦 size-1: the word list lives in WordList (remote data, see Code.gs REMOTE_INCLUDES_) */
// r26: +233 everyday words that the first list missed (PROUD, HELD, PAID, WOMEN, FEET, BOX, COOKIE…), added at the end so the robot still prefers easy words.
// r27: + 14873 more real words (FOXTAIL, LIGHTHOUSE, CATERPILLAR…, up to 12 letters) from two dictionaries, kid-filtered; also added at the end.
// r29: + 13038 plural / -ed / -ing / -er / -est / -ly forms of listed words (WISPS, FOXES…), from the hunspell affix flags, kid-filtered.
// Real words we keep out of this kids' game on purpose (weapons, drink, smoking, killing): refused with a friendly message, not "not a word".
const KID_SKIP = new Set(('BEER BOMB BOMBS CIGAR CIGARETTE DEAD DEATH DIE DIED DIES DRUNK GUN GUNS KILL KILLED KILLER KILLING KILLS MURDER RIFLE SMOKE SMOKING STAB VODKA WARS WHISKEY WINE ' +
  /* lc-2: + forms and more of the same kind from the bigger list */ 'CORPSE DRUG DRUGS HEROIN MURDERED MURDERER SUICIDE AMMUNITION ASSASSINATE ASSASSINATED ASSASSINATES ASSASSINATING BEHEADS BOMBINGS BOOZE BRANDYING CIGARETTES COCAINE DEADER DRUNKER GINNED GORED GORES GUNMEN HANGOVERS HEROINS JUNKIE JUNKIES LIQUORED LIQUORING LIQUORS RIFLED SLAUGHTERED SLAUGHTERING SLAUGHTERS SMOKIER SMOKIEST STONED STRANGLES STRANGLING TOBACCOS WHISKYS WINED BOOZED BOOZER BOOZERS BOOZES BOOZING CANNABIS CANNABISES TORTURER TORTURERS BOOZIER BOOZIEST BOOZY JUNKIER SLAUGHTERER SLAUGHTERERS STRANGLER STRANGLERS VAPE VAPED VAPES VAPING BEERY METHS SMOKEY VODKAS BEERIER BEERIEST GUNSHIP METH RIFLER RIFLERS EXECUTER LIQUORISH RIFLERY WHISKEYS').split(' '));
const WORDS = WORDS_RAW.split(' ');
const DICT = new Set(WORDS);
// lc-2: + ~64k more real words (word forms, rarer words, newer words like EMOJI / SELFIE) from WordExtra.html — only for checking a play; the robot keeps WORDS.
const WORDS_EXTRA_N = (() => { const x = String(window.WORDS_EXTRA || '').split(' ').filter(Boolean); x.forEach(w => { if(!KID_SKIP.has(w)) DICT.add(w); }); return x.length; })();
const EXTRA_WORDS = new Set();   // r31: real words found in the big dictionary or added by a grown-up in the "Word Meanings" tab
const ROBOT_AVOID = new Set('dead dumb fat fool hate idiot jerk kills loser stupid ugly'.toUpperCase().split(' '));

/* ================= LEVELS · THEMES ================= */
// n = board size, vocab / maxLen = the robot's words, blanks = ★ tiles, rounds = turns each, bot = robot strength (0 … 1 best), hints, check = ✅ helper.
const LEVELS = [
  {name: 'Basic', emoji: '🌱', n: 11, vocab: 1500, maxLen: 4, blanks: 0, rounds: 6, bot: 0.25, hints: 3, check: 'live', blurb: 'Short words — CAT, SUN, PLAY'},
  {name: 'Junior', emoji: '🐣', n: 11, vocab: 3000, maxLen: 5, blanks: 0, rounds: 7, bot: 0.45, hints: 3, check: 'live', blurb: 'Words up to 5 letters'},
  {name: 'Intermediate', emoji: '🔦', n: 11, vocab: 6000, maxLen: 6, blanks: 0, rounds: 8, bot: 0.62, hints: 3, check: 'live', blurb: 'Longer words, smarter robot'},
  {name: 'Hard', emoji: '⚡', n: 15, vocab: 12000, maxLen: 7, blanks: 0, rounds: 9, bot: 0.8, hints: 2, check: 'live', blurb: 'Big board, big words'},
  {name: 'Extreme', emoji: '🌋', n: 15, vocab: 23000, maxLen: 8, blanks: 2, rounds: 10, bot: 0.93, hints: 1, check: 'button', blurb: '★ blank tiles and a word-wizard robot'},
  {name: 'Hardcore', emoji: '💀', n: 15, vocab: 23000, maxLen: 9, blanks: 2, rounds: 10, bot: 1, hints: 0, check: 'none', hardcore: true, blurb: 'No Check, no Hint — one wrong word ends it! ×3'}
];
// Play together: chosen on the setup sheet.
const TOGETHER = {
  easy: {name: 'Easy', vocab: 3000, maxLen: 5, blanks: 0, sub: 'short words'},
  medium: {name: 'Medium', vocab: 8000, maxLen: 7, blanks: 0, sub: 'any words'},
  hard: {name: 'Hard', vocab: 23000, maxLen: 8, blanks: 2, sub: '+ ★ blanks'}
};
function makeCfg(L){ return {n: L.n, vocab: L.vocab, maxLen: L.maxLen, blanks: L.blanks || 0}; }
const THEMES = {
  paper: {name: 'Notebook', icon: '📒', syms: ['📒', '✏️', '📚'], t: ['#FFF8E1', '#FFE7A8'], board: '#5B7FBF', cell: '#E8EEF9', tile: '#FFFDF5', tink: '#1F2A44', p2t: '#9AD3F2', p3t: '#3D7DD8', p2e: '#F7B2BE', p3e: '#E5484D', bot: '🦉'},
  garden: {name: 'Garden', icon: '🌻', syms: ['🌻', '🐝', '🐞'], t: ['#EAF8DC', '#B9E59A'], board: '#5D8F3A', cell: '#DDF0C8', tile: '#FFFBEA', tink: '#2E4A1A', p2t: '#A8E1F0', p3t: '#2C9CC0', p2e: '#FFD08A', p3e: '#E8742A', bot: '🐝'},
  ocean: {name: 'Ocean', icon: '🌊', syms: ['🌊', '🐠', '🐙'], t: ['#CFF3FF', '#7FC8F8'], board: '#1F6FA8', cell: '#BFE6F7', tile: '#FFFFFF', tink: '#0B3A5C', p2t: '#7FE3D4', p3t: '#13A89E', p2e: '#FFC6A8', p3e: '#FF7A59', bot: '🐙'},
  candy: {name: 'Candy', icon: '🍬', syms: ['🍬', '🍭', '🧁'], t: ['#FFE3F1', '#FFB8D9'], board: '#E0569B', cell: '#FFD6EA', tile: '#FFFFFF', tink: '#7A1050', p2t: '#BFE9FF', p3t: '#5BB8F5', p2e: '#FFE59A', p3e: '#FF9F1C', bot: '🍭'},
  space: {name: 'Space', icon: '🚀', syms: ['🚀', '🪐', '👽'], t: ['#1B1440', '#3A2A7A'], board: '#120C2E', cell: '#2E2466', tile: '#EDE8FF', tink: '#22195C', p2t: '#3F8CFF', p3t: '#1F4FD8', p2e: '#C04FD8', p3e: '#FF4D8D', dark: true, bot: '👽'},
  castle: {name: 'Castle', icon: '🏰', syms: ['🏰', '🐉', '👑'], t: ['#EDE4FF', '#C7B5F2'], board: '#5A4A8A', cell: '#DED4F5', tile: '#FFFBF0', tink: '#2E2450', p2t: '#A6E0F5', p3t: '#3A8FD8', p2e: '#FFD6A0', p3e: '#E5604D', bot: '🐉'}
};
const THEME_KEYS = Object.keys(THEMES);
const AGE_START = {'4-5': 0, '6-7': 1, '8-9': 2, '10+': 3};
const PRAISE = ['Word star', 'Spelling hero', 'Super speller', 'Brilliant', 'Word wizard'];
const TIPS = [
  'Look for a letter already on the board you can build a word through.',
  'Pink and red squares multiply the whole word — great for long words!',
  'Adding S to the end of a word on the board makes a new word.',
  'Keep a mix of vowels (A E I O U) and other letters in your rack.',
  'Stuck? Swap letters you can\'t use.'
];
const RACK = 7, BINGO = 40;
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const PTS = {A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10, '?': 0};
const isOp = t => false;
const show = t => t === '?' ? '★' : t;
function sayText(text){ return text.split(' · ')[0].toLowerCase(); }

let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: ''};
let G = null, theme = 'paper', timerId = 0, lockHandle = null, together = {players: [], diff: 'easy', size: 11, rounds: 8};
function prefKey(){ return 'sp_wordboard_prefs:' + S.player; }
function loadPrefs(){ try{ const p = JSON.parse(localStorage.getItem(prefKey()) || '{}'); if(THEMES[p.theme]) theme = p.theme; if(p.voice === false) voiceOn = false; if(p.together) together = Object.assign(together, p.together); }catch(e){} }
function savePrefs(){ try{ localStorage.setItem(prefKey(), JSON.stringify({theme, voice: voiceOn, together: {players: together.players, diff: together.diff, size: together.size, rounds: together.rounds}})); }catch(e){} }
function myAvatar(name){ return (S.avatars && S.avatars[name]) || defaultAvatar(name); }

/* ================= ENGINE: board, bag, words ================= */
// Bonus squares: '2t' / '3t' = letter ×2 / ×3, '2e' / '3e' = whole word ×2 / ×3, 'star' = the middle (word ×2).
function premLayout(N){
  const P = new Array(N * N).fill(''), c = (N - 1) / 2;
  const put = (r, q, v) => [[r, q], [q, r]].forEach(([a, b]) => [[a, b], [a, N - 1 - b], [N - 1 - a, b], [N - 1 - a, N - 1 - b]].forEach(([x, y]) => { P[x * N + y] = v; }));
  const M = N === 15 ? {'3e': [[0, 0], [0, 7]], '2e': [[1, 1], [2, 2], [3, 3], [4, 4]], '3t': [[1, 5], [5, 5]], '2t': [[0, 3], [2, 6], [3, 7], [6, 6]]}
                     : {'3e': [[0, 0], [0, 5]], '2e': [[1, 1], [2, 2]], '3t': [[1, 4], [4, 4]], '2t': [[0, 3], [2, 5], [3, 3]]};
  Object.keys(M).forEach(k => M[k].forEach(([r, q]) => put(r, q, k)));
  P[c * N + c] = 'star';
  return P;
}
// Letter bag: lots of vowels and easy letters, one each of J K Q X Z.
const BAG15 = {A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 8, J: 1, K: 1, L: 4, M: 2, N: 6, O: 8, P: 2, Q: 1, R: 6, S: 5, T: 6, U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1};
function makeBag(cfg){
  const bag = [], small = cfg.n !== 15;
  Object.keys(BAG15).forEach(l => { const k = small ? Math.max(1, Math.round(BAG15[l] * 0.72)) : BAG15[l]; for(let i = 0; i < k; i++) bag.push(l); });
  for(let i = 0; i < (cfg.blanks || 0); i++) bag.push('?');
  return shuffle(bag.map(t => ({id: ++TILE_ID, t})));
}
let TILE_ID = 0;
// Fill a rack to 7. Kind racks (not Hardcore): at least 2 vowels and 2 other letters when the bag has them.
function refill(P){
  while(P.rack.length < RACK && G.bag.length) P.rack.push(G.bag.pop());
  if(G.L.hardcore || !G.bag.length) return;
  const isV = t => VOWELS.has(t), isC = t => !VOWELS.has(t) && t !== '?';
  [[isV, isC], [isC, isV]].forEach(([want, other]) => {
    for(let guard = 0; P.rack.filter(x => want(x.t)).length < 2 && guard < 6; guard++){
      const bi = G.bag.findIndex(x => want(x.t)); if(bi < 0) break;
      if(P.rack.filter(x => other(x.t)).length <= 2) break;
      const ri = P.rack.findIndex(x => other(x.t)); if(ri < 0) break;
      const out = P.rack[ri]; P.rack[ri] = G.bag[bi]; G.bag[bi] = out;
    }
  });
  shuffle(G.bag);
}
// Is this line of letters a word in our list? Returns {ok, msg, text}.
function readSentence(toks){
  const w = toks.join('');
  if(toks.some(t => t === '?')) return {ok: false, msg: 'Pick a letter for the ★ tile', text: w};
  if(w.length < 2) return {ok: false, msg: 'A word needs at least 2 letters', text: w};
  if(!DICT.has(w)) return KID_SKIP.has(w) ? {ok: false, msg: w + ' is a real word, but we keep it out of this kids\' game 🙂 — try another one!', text: w} : {ok: false, msg: w + ' isn\'t in our word list', text: w, unknown: w};
  return {ok: true, text: w};
}
// Tiles on the board for a moment's check: board + pending (a map index → letter).
function tokAt(i, extra){ if(extra && extra.has(i)) return extra.get(i); const c = G.cells[i]; return c ? c.as : null; }
function lineThrough(i, dir, extra){
  const N = G.N, r = (i / N) | 0, q = i % N, dr = dir === 'down' ? 1 : 0, dq = dir === 'across' ? 1 : 0;
  let a = 0; while(true){ const rr = r - (a + 1) * dr, qq = q - (a + 1) * dq; if(rr < 0 || qq < 0 || tokAt(rr * N + qq, extra) === null) break; a++; }
  const cells = []; for(let k = -a; ; k++){ const rr = r + k * dr, qq = q + k * dq; if(rr >= N || qq >= N || rr < 0 || qq < 0) break; const idx = rr * N + qq; if(tokAt(idx, extra) === null) break; cells.push(idx); }
  return cells;
}
// Check a move: pend = [{i, t (as played)}]. Returns {ok, msg, lines:[{cells,text}], score, bingo, dir}.
function judge(pend, rackSize){
  if(!pend.length) return {ok: false, msg: 'Put some letters on the board first'};
  const N = G.N, extra = new Map(pend.map(p => [p.i, p.t])), rows = new Set(pend.map(p => (p.i / N) | 0)), cols = new Set(pend.map(p => p.i % N));
  if(rows.size > 1 && cols.size > 1) return {ok: false, msg: 'New letters must be in one line (across or down)'};
  let dir = rows.size === 1 && pend.length > 1 ? 'across' : cols.size === 1 && pend.length > 1 ? 'down' : null;
  if(!dir) dir = lineThrough(pend[0].i, 'across', extra).length >= lineThrough(pend[0].i, 'down', extra).length ? 'across' : 'down';
  const main = lineThrough(pend[0].i, dir, extra);
  if(pend.some(p => main.indexOf(p.i) < 0)) return {ok: false, msg: 'Leave no gaps between your letters'};
  const empty = G.cells.every(c => !c), c = (N - 1) / 2, mid = c * N + c;
  if(empty){ if(!extra.has(mid)) return {ok: false, msg: 'The first word must go over the ⭐'}; }
  else {
    const touches = pend.some(p => { const r = (p.i / N) | 0, q = p.i % N; return [[r - 1, q], [r + 1, q], [r, q - 1], [r, q + 1]].some(([a, b]) => a >= 0 && b >= 0 && a < N && b < N && G.cells[a * N + b]); });
    if(!touches) return {ok: false, msg: 'Join your word to a letter on the board'};
  }
  if(main.length < 2) return {ok: false, msg: 'A word needs at least 2 letters'};
  const lines = [main];
  pend.forEach(p => { const cross = lineThrough(p.i, dir === 'across' ? 'down' : 'across', extra); if(cross.length > 1) lines.push(cross); });
  const out = []; let score = 0;
  for(const ln of lines){
    const res = readSentence(ln.map(i => extra.has(i) ? extra.get(i) : G.cells[i].as));
    if(!res.ok) return {ok: false, msg: (lines.length > 1 && ln !== main ? 'Crossing word: ' : '') + res.msg, text: res.text, cells: ln, unknown: res.unknown};
    let s = 0, mult = 1;
    ln.forEach(i => { const isNew = extra.has(i), pt = isNew ? (pend.find(p => p.i === i).blank ? 0 : (PTS[extra.get(i)] || 0)) : G.cells[i].pts, pr = isNew ? G.prem[i] : '';
      s += pt * (pr === '2t' ? 2 : pr === '3t' ? 3 : 1); if(pr === '2e' || pr === 'star') mult *= 2; if(pr === '3e') mult *= 3; });
    s *= mult; score += s; out.push({cells: ln, text: res.text, score: s});
  }
  const bingo = pend.length >= RACK && rackSize >= RACK;
  if(bingo) score += BINGO;
  return {ok: true, lines: out, score, bingo, dir, text: out.map(l => l.text).join(' · ')};
}

/* ---------- robot: words it knows, laid through letters on the board ---------- */
let EQ_CACHE = {key: '', list: []};
function equationList(cfg){
  const key = cfg.vocab + ':' + cfg.maxLen;
  if(EQ_CACHE.key === key) return EQ_CACHE.list;
  const list = [];
  for(let k = 0; k < WORDS.length && k < cfg.vocab; k++){ const w = WORDS[k]; if(w.length >= 2 && w.length <= cfg.maxLen && !ROBOT_AVOID.has(w)) list.push(w.split('')); }
  EQ_CACHE = {key, list};
  return list;
}
// All moves for a rack (capped by time). Each move = {pend:[{i,t,blank}], score, text}.
function findMoves(rack, limitMs){
  const t0 = performance.now(), N = G.N, cfg = G.cfg, list = equationList(cfg), moves = [], seen = new Set();
  const count = {}; let blanks = 0; rack.forEach(x => { if(x.t === '?') blanks++; else count[x.t] = (count[x.t] || 0) + 1; });
  const empty = G.cells.every(c => !c), mid = ((N - 1) / 2) * N + (N - 1) / 2;
  const at = {}; G.cells.forEach((c, i) => { if(c) (at[c.as] = at[c.as] || []).push(i); });
  const tryPlace = (eq, start, dir) => {
    const dr = dir === 'down' ? N : 1, r0 = (start / N) | 0, q0 = start % N;
    if(start < 0 || start >= N * N) return;
    const rEnd = dir === 'down' ? r0 + eq.length - 1 : r0, qEnd = dir === 'across' ? q0 + eq.length - 1 : q0;
    if(rEnd >= N || qEnd >= N) return;
    const before = dir === 'down' ? (r0 > 0 ? start - N : -1) : (q0 > 0 ? start - 1 : -1), after = dir === 'down' ? (rEnd < N - 1 ? start + eq.length * N : -1) : (qEnd < N - 1 ? start + eq.length : -1);
    if((before >= 0 && G.cells[before]) || (after >= 0 && G.cells[after])) return;
    const use = Object.assign({}, count); let bl = blanks; const pend = [];
    for(let k = 0; k < eq.length; k++){
      const i = start + k * dr, c = G.cells[i];
      if(c){ if(c.as !== eq[k]) return; continue; }
      if(use[eq[k]] > 0) { use[eq[k]]--; pend.push({i, t: eq[k], blank: false}); }
      else if(bl > 0){ bl--; pend.push({i, t: eq[k], blank: true}); }
      else return;
    }
    if(!pend.length || (!empty && pend.length === eq.length)) return;
    const key = pend.map(p => p.i + p.t).join(','); if(seen.has(key)) return; seen.add(key);
    const j = judge(pend, rack.length); if(!j.ok) return;
    moves.push({pend, score: j.score, text: j.text, bingo: j.bingo});
  };
  for(let e = 0; e < list.length; e++){
    if((e & 255) === 0 && performance.now() - t0 > (limitMs || 900)) break;
    const eq = list[e];
    let missing = 0; const need = {}; eq.forEach(t => { need[t] = (need[t] || 0) + 1; });
    Object.keys(need).forEach(t => { missing += Math.max(0, need[t] - (count[t] || 0)); });
    if(missing > blanks + (empty ? 0 : 2)) continue;
    if(empty){ ['across', 'down'].forEach(dir => { for(let k = 0; k < eq.length; k++) tryPlace(eq, dir === 'across' ? mid - k : mid - k * N, dir); }); continue; }
    for(let k = 0; k < eq.length; k++){
      const spots = at[eq[k]]; if(!spots) continue;
      spots.forEach(i => { tryPlace(eq, i - k, 'across'); tryPlace(eq, i - k * N, 'down'); });
    }
  }
  moves.sort((a, b) => a.score - b.score || a.pend.length - b.pend.length);
  return moves;
}
// strength 0..1 → which move from the sorted list (1 = the best one).
function chooseMove(moves, strength){
  if(!moves.length) return null;
  if(strength >= 1) return moves[moves.length - 1];
  const hi = Math.min(moves.length - 1, Math.round(strength * (moves.length - 1))), lo = Math.max(0, hi - Math.max(1, Math.round(moves.length * 0.15)));
  return moves[lo + rnd(hi - lo + 1)];
}

/* ================= MENUS ================= */
function showScreen(name){
  dragAbort(); /* 🐞 dg-2 */
  ['player', 'menu', 'play', 'link'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));   // 📡 lk-3a: + link
  $('back-btn').classList.toggle('hidden', name === 'play' || name === 'link'); window.scrollTo(0, 0);
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
  loadPrefs(); $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); } /* 📣 cs-3b */ renderMenu(); showScreen('menu');
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
// Board row: built once per menu visit, a tap only moves the highlight (no page jump).
function renderMenu(){
  $('theme-list').innerHTML = THEME_KEYS.map(k => '<button class="chip' + (k === theme ? ' on' : '') + '" data-sound="pop" data-theme-key="' + k + '"><span class="ic">' + THEMES[k].syms.join('') + '</span>' + THEMES[k].name + '</button>').join('');
  $('theme-list').querySelectorAll('[data-theme-key]').forEach(b => b.onclick = () => { theme = b.dataset.themeKey; savePrefs(); $('theme-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); });
  renderLevels();
}
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No score yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span><span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
const SAMPLE = ['CAT · SUN', 'FROG · JUMP', 'PLANET', 'DRAGONS', 'W★ZARD', 'QUIZZES'];
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; if(window.UI && UI.leaders) UI.leaders($('leaders'), GAME_ID, S.player);
  const p = progressOf(S.player), rec = AGE_START[S.age];
  LEVELS.forEach((L, i) => {
    const open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (L.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div><div class="eq">' + SAMPLE[i] + '</div>' +
      '<div class="learn">' + L.n + ' × ' + L.n + ' · robot words up to ' + L.maxLen + ' letters' + (L.blanks ? ' · ★' : '') + '</div>' +
      '<div class="lives">' + L.rounds + ' rounds · ' + (L.hints ? '💡 ×' + L.hints : 'no hints') + (L.hardcore ? ' · ×3' : '') + '</div>' +
      '<div class="sub">' + (L.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : L.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Pass Hard to unlock Extreme!' : 'Pass the level before to unlock it'); return; } startGame(i); };
    box.appendChild(b);
  });
  const t = document.createElement('button'); t.className = 'pick lvl together'; t.id = 'together-card'; t.setAttribute('data-sound', 'pop');
  t.innerHTML = '<div class="big">👨‍👩‍👧</div><div class="nm">Play together</div><div class="lives">2–4 players · one device · pass it on</div><div class="sub">Who makes the best words?</div>';
  t.onclick = openTogether; box.appendChild(t);
  const o = document.createElement('button'); o.className = 'pick lvl together'; o.id = 'link-card'; o.setAttribute('data-sound', 'pop');   // 📡 lk-3a
  o.innerHTML = '<div class="big">📡</div><div class="nm">Own devices</div><div class="lives">2–4 players · each on their own phone / tablet</div><div class="sub">Same Wi-Fi · your letters stay on your screen</div>';
  o.onclick = lxChoose; box.appendChild(o);
}

/* ---------- 👨‍👩‍👧 Play-together setup ---------- */
function openTogether(){
  if(!together.players.length || together.players.indexOf(S.player) < 0) together.players = [S.player];
  together.players = together.players.filter(n => S.players.some(p => p.Name === n));
  const draw = () => {
    const card = $('sheet-card');
    card.innerHTML = '<div class="big" style="font-size:2.4rem">👨‍👩‍👧</div><h2>Play together</h2>' +
      '<div class="lbl">Who is playing? (2 to 4)</div><div class="opt-row" id="tg-players">' + S.players.map(p => '<button class="o' + (together.players.indexOf(p.Name) >= 0 ? ' on' : '') + '" data-n="' + UI.esc(p.Name) + '"><canvas width="56" height="64"></canvas>' + UI.esc(p.Name) + '</button>').join('') + '</div>' +
      '<div class="lbl">Words</div><div class="opt-row" id="tg-diff">' + Object.keys(TOGETHER).map(k => '<button class="o' + (together.diff === k ? ' on' : '') + '" data-k="' + k + '">' + TOGETHER[k].name + ' · ' + TOGETHER[k].sub + '</button>').join('') + '</div>' +
      '<div class="lbl">Board</div><div class="opt-row" id="tg-size"><button class="o' + (together.size === 11 ? ' on' : '') + '" data-s="11">11 × 11</button><button class="o' + (together.size === 15 ? ' on' : '') + '" data-s="15">15 × 15</button></div>' +
      '<div class="lbl">Rounds</div><div class="opt-row" id="tg-rounds">' + [5, 8, 12].map(r => '<button class="o' + (together.rounds === r ? ' on' : '') + '" data-r="' + r + '">' + r + '</button>').join('') + '</div>' +
      '<div class="res-btns"><button class="btn sp-btn sp-primary" id="tg-go"' + (together.players.length < 2 ? ' disabled' : '') + '>▶ Start</button><button class="btn soft sp-btn sp-secondary" id="tg-x">Cancel</button></div>';
    card.querySelectorAll('#tg-players .o').forEach((b, k) => { try{ drawPreviewCanvas(b.querySelector('canvas'), myAvatar(S.players[k].Name), {name: S.players[k].Name, t: 1}); }catch(e){}
      b.onclick = () => { const n = b.dataset.n, at = together.players.indexOf(n); if(at >= 0) together.players.splice(at, 1); else if(together.players.length < 4) together.players.push(n); else UI.toast('Up to 4 players'); draw(); }; });
    card.querySelectorAll('#tg-diff .o').forEach(b => b.onclick = () => { together.diff = b.dataset.k; draw(); });
    card.querySelectorAll('#tg-size .o').forEach(b => b.onclick = () => { together.size = Number(b.dataset.s); draw(); });
    card.querySelectorAll('#tg-rounds .o').forEach(b => b.onclick = () => { together.rounds = Number(b.dataset.r); draw(); });
    $('tg-go').onclick = () => { if(together.players.length < 2) return; savePrefs(); closeSheet(); startGame('together'); };
    $('tg-x').onclick = closeSheet;
  };
  draw(); $('sheet').classList.remove('hidden');
}
function closeSheet(){ $('sheet').classList.add('hidden'); }

/* ================= GAME ================= */
function startGame(lvl){
  hideResult(); closeSheet(); clearInterval(timerId);
  const tg = lvl === 'together', T = THEMES[theme];
  const L = tg ? Object.assign({name: 'Together', emoji: '👨‍👩‍👧', n: together.size, rounds: together.rounds, bot: 0, hints: 2, check: 'live', together: true}, TOGETHER[together.diff]) : LEVELS[lvl];
  const N = L.n;
  G = {asked: new Set(), lvl, L, cfg: makeCfg(L), theme, N, cells: new Array(N * N).fill(null), prem: premLayout(N), bag: [], players: [], cur: 0, round: 1, turn: 0,
    pend: [], sel: null, cursor: null, swap: null, passes: 0, hintsLeft: L.hints, hintsUsed: 0, over: false, busy: false, zoom: 1, last: [], ghost: [],
    t0: performance.now(), paused: false, pausedAt: 0, pausedTotal: 0};
  G.bag = makeBag(G.cfg);
  if(tg && LX.pending){ G.lx = LX.pending; LX.pending = null; }   // 📡 lk-3a
  const names = G.lx ? G.lx.seats.map(x => x.name) : tg ? together.players.slice() : [S.player];
  names.forEach(n => G.players.push({name: n, bot: false, rack: [], score: 0, eqs: 0, best: 0, bingos: 0}));
  if(!tg) G.players.push({name: 'Robot', bot: true, rack: [], score: 0, eqs: 0, best: 0, bingos: 0});
  G.players.forEach(P => refill(P));
  /* fair start: the first player can always make a first word (new letters until one fits) */
  for(let k = 0; k < 12 && !findMoves(G.players[0].rack, 400).length; k++){ G.bag.push(...G.players[0].rack); G.players[0].rack = []; shuffle(G.bag); refill(G.players[0]); }
  const sp = $('scr-play'); sp.style.setProperty('--t1', T.t[0]); sp.style.setProperty('--t2', T.t[1]);
  ['board', 'cell', 'tile', 'tink', 'p2t', 'p3t', 'p2e', 'p3e'].forEach(k => sp.style.setProperty('--' + k, T[k])); sp.classList.toggle('dark', !!T.dark);
  BAR.level(L.emoji + ' ' + L.name + ' · ' + T.icon, L.hardcore ? 'hc' : tg ? 'tg' : '');
  $('b-check').classList.toggle('hidden', L.check === 'none'); $('b-hint').classList.toggle('hidden', !L.hints);
  paintVoice();
  buildBoard(); renderScores(); showScreen('play'); layout(); cheerMount(); /* 📣 cs-3b */ requestAnimationFrame(() => { if(G) layout(); });
  timerId = setInterval(hudTick, 1000);
  BUD.st = {}; buddyStart();
  beginTurn(true);
}
function cur(){ return G.players[G.cur]; }
function buildBoard(){
  const bd = $('board'); bd.style.gridTemplateColumns = 'repeat(' + G.N + ', var(--cs))';
  let h = ''; for(let i = 0; i < G.N * G.N; i++){ const p = G.prem[i]; h += '<div class="cell' + (p ? ' ' + (p === 'star' ? 'star' : 'p' + p) : '') + '" data-i="' + i + '">' + premLabel(p) + '</div>'; }
  bd.innerHTML = h;
}
// Bonus square labels say what they multiply (kids mixed up ×2 and 2×): ×2 LETTER / ×3 LETTER vs ×2 WORD / ×3 WORD.
function premLabel(p){ if(p === 'star') return '⭐'; const m = {'2t': ['×2', 'letter'], '3t': ['×3', 'letter'], '2e': ['×2', 'word'], '3e': ['×3', 'word']}[p]; return m ? '<span class="pl"><b>' + m[0] + '</b><i>' + m[1] + '</i></span>' : ''; }
function cellEl(i){ return $('board').children[i]; }
function tileHtml(t, cls, pts, blank){ return '<div class="tile' + (isOp(t) ? ' op' : '') + (t.length > 1 ? ' w2' : '') + (blank ? ' blank' : '') + (cls ? ' ' + cls : '') + '">' + show(t) + '<span class="pt">' + (blank ? '' : pts) + '</span></div>'; }
function paintCell(i){
  const el = cellEl(i); if(!el) return;
  const c = G.cells[i], pd = G.pend.find(p => p.i === i), gh = G.ghost.find(p => p.i === i), pr = G.prem[i];
  el.classList.toggle('cursor', !!(G.cursor && G.cursor.i === i && !c && !pd));
  if(G.cursor && G.cursor.i === i) el.setAttribute('data-dir', G.cursor.dir === 'across' ? '→' : '↓'); else el.removeAttribute('data-dir');
  if(c) el.innerHTML = tileHtml(c.as, G.last.indexOf(i) >= 0 ? 'last' + (c.fresh ? ' drop' : '') : '', c.pts, c.blank);
  else if(pd) el.innerHTML = tileHtml(pd.t, 'pend' + (pd.state ? ' ' + pd.state : '') + (pd.flip ? ' flip' : ''), PTS[pd.t], pd.blank);
  else if(gh) el.innerHTML = tileHtml(gh.t, 'ghost', PTS[gh.t], gh.blank);
  else el.innerHTML = premLabel(pr);
}
function paintAll(){ for(let i = 0; i < G.N * G.N; i++) paintCell(i); }
function renderScores(){   // 🎛️ p1a: player cards in the shared bar (big score, the player whose turn it is glows)
  BAR.players(G.players.map((P, k) => { let av = THEMES[G.theme].bot;
    if(!P.bot){ av = document.createElement('canvas'); av.width = 60; av.height = 68; try{ drawPreviewCanvas(av, myAvatar(P.name), {name: P.name, t: 1}); }catch(e){} }
    return {k: k, name: P.bot ? 'Robot' : P.name, av: av, score: P.score, on: k === G.cur, bot: !!P.bot}; }));
  BAR.fit();
}
function updateScores(){ BAR.players(G.players.map((P, k) => ({k: k, score: P.score, on: k === G.cur}))); }
function hudTick(){
  if(!G) return;
  BAR.round(Math.min(G.round, G.L.rounds), G.L.rounds);
  $('bag-txt').textContent = '🎒 ' + bagN() + ' left';
  if(lockHandle){ const l = lockHandle.remainingMs(); BAR.left(l, l < 120000); }
}
function layout(){
  if(!G) return;
  const ar = $('arena'), side = $('side'), W = ar.clientWidth, H = ar.clientHeight, N = G.N, portrait = W < 760 || H > W;
  const cs = getComputedStyle(ar), pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  let s;
  if(portrait){ s = Math.floor((Math.min(W - 24, 760) - 10 - (N - 1) * 2) / N);
    // lc-fit: held upright the hand + buttons must still fit under the board — cap the board by the height that is left
    const gap = parseFloat(cs.rowGap) || 8, sh = Math.floor((H - pad - side.offsetHeight - gap - 16 - (N - 1) * 2) / N); if(sh >= 18 && W >= 560) s = Math.min(s, sh); }   // gb-1: tablets only — a phone keeps the board full width (Aowu 09:53)   // only when it then fits (a very short phone keeps the old size + scrolls — its hand panel alone is ~360 px)
  else s = Math.floor((Math.min(H - pad - 12, W - side.offsetWidth - 46) - 10 - (N - 1) * 2) / N);
  // 🔘 gb-1 (Aowu 2026-11-16 10:34 drawing): an upright phone keeps the board FULL width; the hand panel wraps the buttons round the bench (.bd-ph) and "Your turn" sits on the board's top edge
  const ph = portrait && W < 560, tb = $('turnbar'), scr = $('scr-play'); scr.classList.toggle('bd-ph', ph);
  if(ph && tb.parentElement !== ar) ar.appendChild(tb); else if(!ph && tb.parentElement !== side) side.insertBefore(tb, side.firstChild);
  s = Math.max(18, Math.min(s, 60));
  G.baseCs = s; $('scr-play').style.setProperty('--cs', Math.round(s * G.zoom) + 'px');
  const wrap = $('board-wrap'); if(portrait){ wrap.style.maxWidth = (W - 12) + 'px'; wrap.style.maxHeight = ''; } else { wrap.style.maxWidth = ''; wrap.style.maxHeight = (H - pad) + 'px'; }
  BAR.extra('zoom-btn', {hidden: s >= 34});
  if(ph) requestAnimationFrame(() => { const b = $('board-wrap').getBoundingClientRect(), a = ar.getBoundingClientRect(); tb.style.top = Math.max(0, b.top - a.top + ar.scrollTop - 9) + 'px'; });   // gb-1: on the board's top edge
  else tb.style.top = '';
  setWordMode();   // r31: dock or shelf for the 📖 word cards
}
window.addEventListener('resize', () => { if(G) layout(); });
function toggleZoom(){ if(!G) return; G.zoom = G.zoom > 1 ? 1 : 1.7; BAR.extra('zoom-btn', {icon: G.zoom > 1 ? '🔎' : '🔍', label: G.zoom > 1 ? 'Zoom out (Z)' : 'Zoom the board (Z)'}); layout(); const i = (G.cursor && G.cursor.i) || (G.pend[0] && G.pend[0].i); if(i != null) cellEl(i).scrollIntoView({block: 'center', inline: 'center'}); }

/* ---------- turns ---------- */
function beginTurn(first){
  if(G.lx) return lxBeginTurn(first);   // 📡 lk-3a
  const P = cur(); G.pend = []; G.sel = null; G.swap = null; G.cursor = null; G.ghost = [];
  updateScores(); hudTick(); paintAll();
  if(P.bot){ setMsg('<span class="ui-spin a-bounce think">' + THEMES[G.theme].bot + '</span> Robot is thinking…', 'bot'); $('turnbar').textContent = '🤖 Robot\'s turn'; renderRack(true); setActs(false); setTimeout(botTurn, 700); if(window.Cheer) Cheer.hush(true);   /* 🤫 cs-3b */ return; }
  $('turnbar').textContent = G.players.length > 2 || G.L.together ? '🎲 ' + P.name + '\'s turn' : 'Your turn, ' + P.name;
  setActs(true);
  if(G.L.together){ renderRack(true); passDevice(P); return; }
  renderRack(false);
  setMsg(G.cells.every(c => !c) ? '⭐ Start over the star in the middle — make a word like CAT' : 'Tap a letter, then a square', '');
  if(first){ showBanner(G.L.hardcore ? '💀 Hardcore: one wrong word ends it!' : '🎯 Make words — beat the robot!', G.L.hardcore ? 'bad' : 'gold'); say('Make words! Start over the star.'); }
}
function passDevice(P){
  const card = $('sheet-card');
  card.innerHTML = '<div class="pass-card"><div class="av"><canvas width="192" height="224"></canvas></div></div><h2>🎲 ' + UI.esc(P.name) + '\'s turn</h2><div class="lbl">Pass the device to ' + UI.esc(P.name) + ' — no peeking at the tiles!</div><button class="btn sp-btn sp-primary" id="pass-go">👀 Show my tiles</button>';
  try{ drawPreviewCanvas(card.querySelector('canvas'), myAvatar(P.name), {name: P.name, t: 1}); }catch(e){}
  $('pass-go').onclick = () => { closeSheet(); renderRack(false); setMsg(G.cells.every(c => !c) ? '⭐ Start over the star in the middle' : 'Tap a letter, then a square', ''); say(P.name + ', your turn!'); };
  $('sheet').classList.remove('hidden');
}
function setActs(on){ ['b-play', 'b-check', 'b-hint', 'b-recall', 'b-mix', 'b-swap', 'b-pass'].forEach(id => { $(id).disabled = !on; }); if(on){ $('b-hint').disabled = G.hintsLeft <= 0; $('hint-n').textContent = 'Hint ' + G.hintsLeft; $('b-swap').disabled = bagN() < 1; } }
function bagN(){ return G.lx && G.lx.role === 'guest' ? (G.lx.bagN || 0) : G.bag.length; }   // 📡 lk-3a: a guest only knows how many are left
function setMsg(html, kind){ const m = $('msg'); m.innerHTML = html; m.className = 'msg' + (kind ? ' ' + kind : ''); }
// 🎨 LETTER LOOKS (GeoRead gr-4): tiles + rack wear the player's pick from LetterSkins (shared with 🔤 GeoRead, sp_letterskin:<Name>); Classic / Auto = Lettercraft's own tiles
function lcSkin(){ if(!window.LetterSkins || !S.player) return ''; const k = LetterSkins.get(S.player), own = (S.letterSkins || {})[S.player] || 0; return k === 'auto' || k === 'classic' || !LetterSkins.SKINS[k] || !LetterSkins.canUse(k, own) ? '' : k; }
function lcSkinStyle(k, t){ const v = LetterSkins.isVowel(String(t).toLowerCase()), P = LetterSkins.SKINS[k][v ? 'v' : 'c'], u = LetterSkins.url(k, '', 64, {flat: true, vowel: v}); return '--lsk-bg:url(' + u + ');--lsk-c:' + P[1] + ';--lsk-ink:' + P[2]; }
function renderLetterLooks(){ const box = document.getElementById('lsk-list'); if(!box || !window.LetterSkins) return; LetterSkins.chips(box, LetterSkins.get(S.player), k => { LetterSkins.set(S.player, k); }, {owned: (S.letterSkins || {})[S.player] || 0, autoLabel: '🔤 Lettercraft', lockText: '🔒 Earn it in 🔤 GeoRead or Lettercraft (🎨 Letter looks in the Collection)'}); }
const lcTileBase = tileHtml; tileHtml = function(t, cls, pts, blank){ const h = lcTileBase(t, cls, pts, blank), k = lcSkin(); return k && !blank && t && t !== '?' ? h.replace('<div class="tile', '<div style="' + lcSkinStyle(k, t) + '" class="lsk-t tile') : h; };
const lcRackBase = renderRack; renderRack = function(hidden){ const r = lcRackBase.apply(this, arguments), k = lcSkin(), box = document.getElementById('rack'); if(k && box) Array.from(box.children).forEach(b => { const t = (b.childNodes[0] && b.childNodes[0].textContent) || ''; if(t && t !== '?' && !b.classList.contains('blank')){ b.classList.add('lsk-t'); b.setAttribute('style', (b.getAttribute('style') || '') + ';' + lcSkinStyle(k, t)); } }); return r; };
const lcMenuBase = renderMenu; renderMenu = function(){ const r = lcMenuBase.apply(this, arguments); renderLetterLooks(); if(window.UI && UI.ptab){ UI.ptab.apply(S.player); UI.ptab.chips(document.getElementById('ptab-list'), S.player); } return r; };   /* 🏷️ p4c */
function renderRack(hidden){
  if(G.lx) hidden = false;   // 📡 lk-3a: your own rack, always (nobody else sees it)
  if(G.lx && G.lx.seat < 0){ $('rack').innerHTML = ''; $('rack').classList.add('lx-tvrack'); $('eq-txt').textContent = '📺 Each player’s letters stay on their own device'; renderSwapBox(); return; }   // 📺 lk-5c: the TV has no rack
  $('rack').classList.remove('lx-tvrack');
  const P = G.lx ? G.players[G.lx.seat] : cur(), box = $('rack'); box.innerHTML = '';
  if(!hidden && !P.bot) markFresh(P);
  for(let k = 0; k < RACK; k++){
    const x = P.rack[k], b = document.createElement('button'); b.className = 'rt'; b.setAttribute('data-sound', 'none');
    if(!x){ b.style.visibility = 'hidden'; box.appendChild(b); continue; }
    const used = G.pend.some(p => p.id === x.id);
    b.className = 'rt' + (isOp(x.t) ? ' op' : '') + (x.t.length > 1 ? ' w2' : '') + (x.t === '?' ? ' blank' : '') + (used ? ' used' : '') + (G.sel === x.id ? ' sel' : '') + (G.swap && G.swap.has(x.id) ? ' inbox' : '') + (G.dragId === x.id ? ' lift' : '') + (x._fresh && !hidden && !P.bot ? ' fresh' : '') + (hidden || P.bot ? ' hide' : '');
    if(x._fresh && !hidden && !P.bot) x._fresh = false;
    b.innerHTML = show(x.t) + '<span class="pt">' + (x.t === '?' ? '' : PTS[x.t]) + '</span>'; b.dataset.id = x.id;
    b.onclick = () => { if(performance.now() - dragQuiet < 80) return; tapRack(x.id); }; b.onpointerdown = e => dragFrom(e, {from: 'rack', id: x.id}); box.appendChild(b);
  }
  renderSwapBox();
  $('eq-txt').textContent = P.bot ? '' : '✏️ ' + P.eqs + ' word' + (P.eqs === 1 ? '' : 's');
}

/* ---------- placing tiles ---------- */
function canAct(){ return G && !G.over && !G.busy && !cur().bot && $('sheet').classList.contains('hidden') && (!G.lx || (G.cur === G.lx.seat && !G.lx.sent)); }   // 📡 lk-3a: only on your turn
function tapRack(id){
  if(!canAct()) return;
  if(G.swap){ if(G.swap.has(id)) G.swap.delete(id); else G.swap.add(id); renderRack(false); $('swap-txt').textContent = 'Swap ' + G.swap.size; return; }
  if(G.pend.some(p => p.id === id)) return;
  if(G.cursor && !G.cells[G.cursor.i] && !G.pend.some(p => p.i === G.cursor.i)){ placeAt(G.cursor.i, id, true); return; }
  G.sel = G.sel === id ? null : id; UISound.play('pop'); renderRack(false);
}
$('board').addEventListener('pointerdown', e => { const t = e.target.closest('.tile.pend'); if(!t || !canAct()) return; const c = t.closest('.cell'); dragFrom(e, {from: 'board', i: Number(c.dataset.i)}); });
$('board').addEventListener('click', e => {
  if(G && G.running){ G.skipRun = true; return; }
  if(performance.now() - dragQuiet < 80) return;
  const c0 = e.target.closest('.cell'); if(c0 && G && G.cells[Number(c0.dataset.i)] && !G.pend.some(p => p.i === Number(c0.dataset.i))){ wordsAtCell(Number(c0.dataset.i)); return; }   // 📖 tap a word on the board = its meaning
  const el = e.target.closest('.cell'); if(!el || !canAct()) return;
  const i = Number(el.dataset.i);
  if(G.cells[i]) return;
  const pd = G.pend.find(p => p.i === i);
  if(pd){ G.pend = G.pend.filter(p => p !== pd); UISound.play('pop'); afterChange(); return; }
  if(G.sel != null){ placeAt(i, G.sel, false); return; }
  const old = G.cursor ? G.cursor.i : -1;
  if(G.cursor && G.cursor.i === i) G.cursor.dir = G.cursor.dir === 'across' ? 'down' : 'across'; else G.cursor = {i, dir: G.cursor ? G.cursor.dir : 'across'};
  UISound.play('pop'); if(old >= 0) paintCell(old); paintCell(i);
  setMsg('Now tap tiles — they go ' + (G.cursor.dir === 'across' ? 'across →' : 'down ↓') + ' (tap the square again to turn)', '');
});
function placeAt(i, id, advance){
  const P = cur(), x = P.rack.find(r => r.id === id); if(!x) return;
  if(x.t === '?'){ pickBlank(t => { G.pend.push({i, id, t, blank: true}); G.sel = null; moveCursor(i, advance); afterChange(); thunk(i); }); return; }
  G.pend.push({i, id, t: x.t, blank: false}); G.sel = null; UISound.play('pop');
  moveCursor(i, advance); afterChange(); thunk(i);
}
function moveCursor(i, advance){
  if(!advance || !G.cursor){ G.cursor = null; return; }
  const N = G.N, step = G.cursor.dir === 'across' ? 1 : N; let j = i;
  while(true){ const nj = j + step; if(nj >= N * N || (step === 1 && ((nj / N) | 0) !== ((i / N) | 0))) { G.cursor = null; return; } j = nj; if(!G.cells[j] && !G.pend.some(p => p.i === j)) break; }
  G.cursor = {i: j, dir: G.cursor.dir};
}
function pickBlank(done){
  const toks = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const card = $('sheet-card');
  card.innerHTML = '<h2>★ Blank tile</h2><div class="lbl">It can be any letter — which one?</div><div class="blank-grid">' + toks.map(t => '<button data-t="' + t + '">' + show(t) + '</button>').join('') + '</div><button class="btn soft sp-btn sp-secondary" id="bl-x">Cancel</button>';
  card.querySelectorAll('.blank-grid button').forEach(b => b.onclick = () => { closeSheet(); done(b.dataset.t); });
  $('bl-x').onclick = closeSheet; $('sheet').classList.remove('hidden');
}
function afterChange(){
  renderRack(false);
  liveCheck();
  paintAll();
}
// Live helper (Basic–Hard + Together): pending letters turn green when every word is real, red when not yet.
function liveCheck(){
  G.pend.forEach(p => { p.state = ''; });
  if(!G.pend.length){ setMsg(G.cells.every(c => !c) ? '⭐ Start over the star in the middle' : 'Tap a letter, then a square', ''); return null; }
  if(G.L.check !== 'live'){ setMsg('🧩 ' + G.pend.length + ' tile' + (G.pend.length === 1 ? '' : 's') + ' placed — ' + (G.L.check === 'button' ? 'tap ✅ Check or 🚀 Play' : 'tap 🚀 Play when you are sure'), ''); return null; }
  return checkMove(false);
}
function checkMove(loud){
  if(!G || !G.pend.length){ if(loud) setMsg('Put some tiles on the board first', 'bad'); return null; }
  const j = judge(G.pend, cur().rack.length);
  const complete = j.ok || !/at least 2/.test(j.msg || '');
  G.pend.forEach(p => { p.state = j.ok ? 'good' : (complete || loud ? 'bad' : ''); });
  if(j.ok) setMsg('✅ ' + j.lines.map(l => l.text).join(' · ') + ' — worth <b>' + j.score + '</b>' + (j.bingo ? ' (+' + BINGO + ' all 8!)' : ''), 'good');
  else setMsg((complete || loud ? '❌ ' : '🧩 ') + (j.text ? '<b>' + j.text + '</b> — ' : '') + j.msg + (j.unknown && G.asked && !G.asked.has(j.unknown) ? ' — 🚀 Play asks the big dictionary 📚' : ''), complete || loud ? 'bad' : '');
  if(loud){ paintAll(); shimmer(j.ok); UISound.play(j.ok ? 'success' : 'error'); if(j.ok) say(sayText(j.text) + '. Yes, that is a word!'); }
  return j;
}
function recallAll(){ if(!canAct()) return; G.pend = []; G.cursor = null; G.sel = null; afterChange(); }
function mixRack(){ if(!canAct()) return; const P = cur(); shuffle(P.rack); renderRack(false); }
function toggleSwap(){
  if(!canAct()) return;
  if(!G.swap){ if(!bagN()){ UI.toast('The bag is empty'); return; } startSwap(); renderRack(false); return; }
  const ids = [...G.swap]; G.swap = null; $('b-swap').classList.remove('on'); $('swap-txt').textContent = 'Swap';
  if(!ids.length){ setMsg('Tap a letter, then a square', ''); renderRack(false); return; }
  if(G.lx && G.lx.role === 'guest'){ lxSend('wbswap', {ids}); return; }   // 📡 lk-3a
  doSwap(cur(), ids); showBanner('🔁 ' + cur().name + ' swapped ' + ids.length + ' tile' + (ids.length === 1 ? '' : 's'), 'gold'); G.passes = 0; endTurn();
}
function doSwap(P, ids){
  const k = Math.min(ids.length, G.bag.length), out = [];
  ids.slice(0, k).forEach(id => { const at = P.rack.findIndex(r => r.id === id); if(at >= 0) out.push(P.rack.splice(at, 1)[0]); });
  refill(P); G.bag.push(...out); shuffle(G.bag);
}
function passTurn(){
  if(!canAct()) return;
  UI.confirm({icon: '⏭', title: 'Pass your turn?', body: 'You keep your tiles and get no points this turn.', okText: 'Pass', cancelText: 'Keep playing'}).then(ok => { if(!ok || !G) return; recallAll(); if(G.lx && G.lx.role === 'guest'){ lxSend('wbpass', {}); return; } G.passes++; showBanner('⏭ ' + cur().name + ' passed', ''); endTurn(); });
}
function useHint(){
  if(!canAct() || G.hintsLeft <= 0) return;
  recallAll();
  setMsg('<span class="ui-spin a-bounce think">💡</span> Looking for a move…', '');
  G.busy = true;
  setTimeout(() => {
    G.busy = false; if(!G) return;
    const moves = findMoves(cur().rack, 900), m = chooseMove(moves, 0.7);
    if(!m){ setMsg('💡 No word fits right now — try 🔁 Swap', 'bad'); return; }
    G.hintsLeft--; G.hintsUsed++; setActs(true);
    G.ghost = m.pend.map(p => ({i: p.i, t: p.t, blank: p.blank})); paintAll();
    if(G.zoom > 1) cellEl(m.pend[0].i).scrollIntoView({block: 'center', inline: 'center'});
    setMsg('💡 Try <b>' + m.text + '</b> — worth ' + m.score, 'good'); say('Try ' + sayText(m.text));
    setTimeout(() => { if(G){ G.ghost = []; paintAll(); } }, 3500);
  }, 60);
}
function playMove(){
  if(!canAct()) return;
  if(!G.pend.length){ setMsg('Put some tiles on the board first', 'bad'); UISound.play('error'); return; }
  const P = cur(), j = judge(G.pend, P.rack.length);
  if(!j.ok && j.unknown && !P.bot && !G.asked.has(j.unknown)){ askDictionary(j.unknown); return; }   // r31: SNORK, WHOOF… may be real words outside our list
  if(!j.ok){
    if(G.L.hardcore){ G.pend.forEach(p => { p.state = 'bad'; }); paintAll(); setMsg('❌ ' + (j.text ? '<b>' + j.text + '</b> — ' : '') + j.msg, 'bad'); finishGame('hardcore', j); return; }
    G.pend.forEach(p => { p.state = 'bad'; }); paintAll(); setMsg('❌ ' + (j.text ? '<b>' + j.text + '</b> — ' : '') + j.msg, 'bad'); UISound.play('error'); return;
  }
  if(G.lx && G.lx.role === 'guest'){ lxSend('wbplay', {pend: G.pend.map(q => ({i: q.i, id: q.id, t: q.t, blank: !!q.blank}))}); return; }   // 📡 lk-3a: the host checks + plays it
  commit(P, G.pend, j);
}
// r31: a word that is not in our list → the server checks the big dictionary (and remembers new real words in the "Word Meanings" tab).
// While it checks, nothing can be played; then Play runs again (now with the word known, or with the normal "not in our list").
function askDictionary(w){
  const g = G; g.asked.add(w); g.busy = true; setActs(false);
  setMsg('<span class="ui-spin a-bounce">📚</span> Is <b>' + w + '</b> a word? Checking the big dictionary…', '');
  const done = r => {
    if(G !== g) return; g.busy = false; setActs(true);
    if(r && r.err) WM.blocked = true;
    if(r && r.ok){ DICT.add(w); EXTRA_WORDS.add(w); if(r.m){ WM.cache[w] = Object.assign({w}, r); } showBanner('📚 ' + w + ' is a real word — nice find!', 'gold'); UISound.play('success'); }
    playMove();
  };
  try{ google.script.run.withSuccessHandler(done).withFailureHandler(() => done(null)).checkWord(w); }catch(e){ done(null); }
}
// Put a checked move on the board, score it, refill the rack.
function commit(P, pend, j){
  if(G.lx && G.lx.role === 'host') Link.send('wbplayed', {tn: G.lx.tn, seat: G.cur, pend: pend.map(q => ({i: q.i, id: q.id, t: q.t, blank: !!q.blank})), j}, {sure: true});   // 📡 lk-3a
  G.last = pend.map(p => p.i);
  pend.forEach(p => { G.cells[p.i] = {as: p.t, pts: p.blank ? 0 : (PTS[p.t] || 0), blank: p.blank, by: G.cur, fresh: true}; const at = P.rack.findIndex(r => r.id === p.id); if(at >= 0) P.rack.splice(at, 1); });
  P.score += j.score; P.eqs += j.lines.length; P.best = Math.max(P.best, j.score); if(j.bingo) P.bingos++;
  G.pend = []; G.cursor = null; G.passes = 0;
  paintAll(); G.cells.forEach(c => { if(c) c.fresh = false; });
  UISound.play(j.score >= 30 || j.bingo ? 'success' : 'pop');
  setMsg((P.bot ? THEMES[G.theme].bot + ' Robot played ' : '✅ ') + '<b>' + j.lines.map(l => l.text).join(' · ') + '</b> +' + j.score, P.bot ? 'bot' : 'good');
  say((P.bot ? 'Robot played ' : '') + sayText(j.text));
  learnWords(P, j);
  cheerPlay(P, j); /* 📣 cs-3b */
  refill(P); updateScores();
  celebrate(P, j);
}
// after a play: the avatar runs along the line counting points, then (bingo / big score) the theme's big scene
const BIG_PLAY = 25;
async function celebrate(P, j){
  const g = G; g.busy = true; g.running = true;
  tileFx(g.last);
  await runAlong(P, j);
  if(G !== g) return; g.running = false;
  if(!FX) floatText(cellEl(g.last[g.last.length - 1]), '+' + j.score);
  const big = j.bingo || (!P.bot && j.score >= BIG_PLAY);
  if(j.bingo){ party('🌟 All 7 letters! +' + BINGO); confetti(['🔤', '⭐', '🎉', '📚', '✏️'], 26); }
  else if(big) party(pick(PRAISE) + '!');
  if(big) await bigScene(j.lines[0].cells);
  if(G !== g) return; g.busy = false;
  setTimeout(endTurn, FX ? 300 : (P.bot ? 1300 : 900));
}
function endTurn(){
  if(!G || G.over) return;
  if(G.lx && G.lx.role === 'guest') return;   // 📡 lk-3a: the host moves the turn on
  const P = cur();
  if(!P.rack.length && !G.bag.length) return finishGame('out');
  if(G.passes >= G.players.length * 2) return finishGame('stuck');
  G.cur = (G.cur + 1) % G.players.length;
  if(G.cur === 0){ G.round++; if(G.round > G.L.rounds) return finishGame('rounds'); if(G.round === G.L.rounds) showBanner('🏁 Last round!', 'gold'); }
  beginTurn(false);
}
function botTurn(force){ if(window.Cheer) Cheer.hush(false); /* 📣 cs-3b */   // 📡 lk-3a: force = 🤖 plays for a player whose device dropped out
  if(!G || G.over || (!cur().bot && !force)) return;
  const P = cur(), moves = findMoves(P.rack, G.L.bot >= 0.9 ? 1400 : 900), m = chooseMove(moves, force ? 0.3 : G.L.bot);
  if(!m){
    if(G.bag.length){ const keep = P.rack.find(x => x.t === '='), ids = P.rack.filter(x => x !== keep).slice(0, 4).map(x => x.id); doSwap(P, ids); G.passes = 0; setMsg(THEMES[G.theme].bot + ' Robot swapped ' + ids.length + ' tiles', 'bot'); showBanner('🔁 Robot swapped tiles', 'bot'); }
    else { G.passes++; setMsg(THEMES[G.theme].bot + ' Robot passed', 'bot'); }
    setTimeout(endTurn, 1100); return;
  }
  const used = new Set(), pend = m.pend.map(p => { const x = P.rack.find(r => !used.has(r.id) && (p.blank ? r.t === '?' : r.t === p.t)); used.add(x.id); return {i: p.i, id: x.id, t: p.t, blank: p.blank}; });
  if(G.zoom > 1) cellEl(pend[0].i).scrollIntoView({block: 'center', inline: 'center'});
  let k = 0; G.busy = true;
  const step = () => { if(!G || G.over) return; if(k < pend.length){ G.pend.push(Object.assign({state: 'good', flip: true}, pend[k])); paintCell(pend[k].i); UISound.play('pop'); k++; setTimeout(step, 230); return; }
    G.busy = false; const j = judge(pend, P.rack.length); if(!j.ok){ G.pend = []; paintAll(); G.passes++; setTimeout(endTurn, 600); return; } showBanner(THEMES[G.theme].bot + ' Robot +' + j.score, 'bot'); commit(P, pend, j); };
  step();
}

/* ================= r15 BOARD FUN: drag the hand, swap box, buddy bench, runner, theme effects ================= */
let FX = 1;   /* the test harness sets 0 to skip the runner + big scenes */
const fxSleep = ms => new Promise(r => setTimeout(r, ms * FX));
function calmMotion(){ return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
// Theme effects: `tile` pops out of every played tile, `big` = the big-play scene (actors), `title` = its banner.
const SCENES = {
  garden: {tile: ['🌱', '🌼'], title: '🌳 The garden grows!', big: [['grow', '🌳'], ['pop', '🌸🌼🌷'], ['fly', '🐝', 3], ['fly', '🦋', 2]]},
  paper: {tile: ['✏️', '⭐'], title: '✏️ Doodle time!', big: [['trace', '✏️'], ['burst', '⭐✨🌟', 4], ['flip', '📄', 3]]},
  castle: {tile: ['✨', '🛡️'], title: '🐉 Dragon fly-by!', big: [['fly', '🐉', 1, 3], ['burst', '🎆🎇✨', 5], ['crown', '👑']]},
  ocean: {tile: ['🫧', '💧'], title: '🌊 Big wave!', big: [['wave', '🌊'], ['arc', '🐟🐠🐬', 6], ['pop', '🫧']]},
  candy: {tile: ['🍬', '🍭'], title: '🍭 Candy party!', big: [['burst', '🍭🍬🍫', 5], ['rain', '🍬🍭🧁🍩', 22], ['jelly', '🍮']]},
  space: {tile: ['⭐', '✨'], title: '🚀 Blast off!', big: [['trace', '🚀'], ['orbit', '🪐'], ['rain', '⭐🌟✨', 22]]},
  wood: {tile: ['🍃', '🌰'], title: '🌳 The oak grows!', big: [['grow', '🌳'], ['fly', '🦉', 1, 2], ['arc', '🌰🍂', 8]]},
  jungle: {tile: ['🌿', '🍃'], title: '🐒 Jungle swing!', big: [['pop', '🌿🍃'], ['swing', '🐒'], ['fly', '🦜', 3]]},
  robot: {tile: ['⚙️', '🔩'], title: '🤖 Robot build!', big: [['spin', '⚙️', 4], ['trace', '🦾'], ['zap', '⚡']]}
};
const emoList = s => Array.from(s.matchAll(/\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic})*/gu), m => m[0]);
function fxLayer(){
  const bd = $('board'); let L = $('fxlayer');
  if(!L){ L = document.createElement('div'); L.className = 'fxlayer'; L.id = 'fxlayer'; L.innerHTML = '<canvas id="runcv"></canvas>'; }
  // r32: the effects layer sits on <body> (fixed, exactly over the board). Inside the scrolling board-wrap, everything above the
  // top row (tile pops, the ×2/×3 lift, the avatar running along row 1, big-play scenes) was cut off.
  if(L.parentNode !== document.body) document.body.appendChild(L);
  const r = bd.getBoundingClientRect();
  L.style.position = 'fixed'; L.style.zIndex = '30'; L.style.left = r.left + 'px'; L.style.top = r.top + 'px'; L.style.width = r.width + 'px'; L.style.height = r.height + 'px';
  L.style.setProperty('--cs', getComputedStyle(bd).getPropertyValue('--cs'));
  L.style.display = $('scr-play').classList.contains('hidden') ? 'none' : '';
  return L;
}
function cellXY(i){ const L = fxLayer().getBoundingClientRect(), r = cellEl(i).getBoundingClientRect(); return [r.left - L.left + r.width / 2, r.top - L.top + r.height / 2, r.width]; }
// one emoji actor: frames = [[x, y, scale, rotate, opacity], …] (x, y = centre in layer px)
function actor(e, size, frames, dur, delay, easing){
  const L = fxLayer(), d = document.createElement('div'); d.className = 'fxe'; d.textContent = e; d.style.fontSize = size + 'px'; d.style.opacity = '0'; L.appendChild(d);
  const kf = frames.map(f => ({transform: 'translate(' + (f[0] - size / 2) + 'px,' + (f[1] - size / 2) + 'px) scale(' + (f[2] == null ? 1 : f[2]) + ') rotate(' + (f[3] || 0) + 'deg)', opacity: f[4] == null ? 1 : f[4]}));
  try{ const a = d.animate(kf, {duration: dur, delay: delay || 0, easing: easing || 'ease-out', fill: 'both'}); a.onfinish = () => d.remove(); }catch(err){ setTimeout(() => d.remove(), (delay || 0) + dur); }
  setTimeout(() => { if(d.parentNode) d.remove(); }, (delay || 0) + dur + 300);
  return d;
}
// small effect on every played tile (all plays)
function tileFx(cells){
  if(!FX || !G) return; const sc = SCENES[G.theme] || SCENES.garden;
  cells.forEach((i, k) => { const [x, y, cs] = cellXY(i), e = sc.tile[k % sc.tile.length]; actor(e, cs * 0.6, [[x, y, 0.2, 0, 0], [x, y - cs * 0.6, 1.15, -10, 1], [x, y - cs * 1.1, 0.8, 10, 0]], 750, k * 70);
    const el = cellEl(i).querySelector('.tile'); if(el){ for(let m = 0; m < 4; m++){ const s = document.createElement('div'); s.className = 'spark'; el.appendChild(s); const a = m * Math.PI / 2 + 0.6;
      try{ s.animate([{transform: 'translate(0,0)', opacity: 1}, {transform: 'translate(' + Math.cos(a) * cs * 0.6 + 'px,' + Math.sin(a) * cs * 0.6 + 'px)', opacity: 0}], {duration: 420, delay: k * 70, easing: 'ease-out', fill: 'both'}); }catch(err){} setTimeout(() => s.remove(), 600 + k * 70); } } });
}
// the big-play scene for this theme (bingo or a high score)
function bigScene(cells){
  if(!FX || !G) return Promise.resolve(); const sc = SCENES[G.theme] || SCENES.garden, L = fxLayer(), W = L.offsetWidth, H = L.offsetHeight;
  const pts = cells.map(cellXY), cs = pts[0][2], mid = pts[(pts.length / 2) | 0], last = pts[pts.length - 1], R = (a, b) => a + Math.random() * (b - a);
  showBanner(sc.title, 'gold'); fxSnd('big');
  sc.big.forEach(([mode, chars, n, sz]) => { const es = emoList(chars), E = k => es[k % es.length]; n = n || 1;
    if(mode === 'grow'){ const s = Math.min(W, H) * 0.42; actor(E(0), s, [[mid[0], mid[1] + s * 0.2, 0.05, 0, 0], [mid[0], mid[1] - s * 0.1, 1.12, 0, 1], [mid[0], mid[1] - s * 0.05, 1, -3, 1], [mid[0], mid[1] - s * 0.05, 1, 3, 1], [mid[0], mid[1], 0.9, 0, 0]], 2000, 0, 'cubic-bezier(.2,1.4,.4,1)'); }
    else if(mode === 'pop') pts.forEach((p, k) => actor(E(k), cs * 0.8, [[p[0], p[1], 0, 0, 0], [p[0] + R(-4, 4), p[1] - cs * 0.35, 1.3, R(-20, 20), 1], [p[0], p[1] - cs * 0.5, 1, 0, 1], [p[0], p[1] - cs * 0.8, 0.8, 0, 0]], 1500, 150 + k * 90, 'cubic-bezier(.2,1.6,.4,1)'));
    else if(mode === 'fly') for(let k = 0; k < n; k++){ const y = R(H * 0.15, H * 0.85), s = cs * (sz || 1.1); const f = []; for(let q = 0; q <= 8; q++) f.push([-s + (W + 2 * s) * q / 8, y + Math.sin(q * 1.4 + k) * cs * 0.6, 1, Math.sin(q) * 8, q === 0 || q === 8 ? 0.6 : 1]); actor(E(k), s, f, 1900, k * 260, 'linear'); }
    else if(mode === 'trace'){ const f = pts.map(p => [p[0], p[1] - cs * 0.5, 1.2, -15, 1]); f.unshift([pts[0][0] - cs * 2, pts[0][1] - cs, 0.6, -15, 0]); f.push([last[0] + cs * 2, last[1] - cs * 2, 0.6, -40, 0]); actor(E(0), cs * 1.2, f, 1500, 0, 'ease-in-out'); }
    else if(mode === 'burst') for(let k = 0; k < n; k++){ const x = R(W * 0.15, W * 0.85), y = R(H * 0.15, H * 0.75), d = 300 + k * 260; actor(E(k), cs * 1.2, [[x, y, 0.1, 0, 0], [x, y, 1.8, 0, 1], [x, y, 2.2, 0, 0]], 700, d);
      for(let m = 0; m < 8; m++){ const a = m * Math.PI / 4; actor('✨', cs * 0.45, [[x, y, 0.4, 0, 1], [x + Math.cos(a) * cs * 1.8, y + Math.sin(a) * cs * 1.8, 0.8, 90, 0]], 650, d + 80); } }
    else if(mode === 'flip') for(let k = 0; k < n; k++){ const x = R(W * 0.2, W * 0.8), y = R(H * 0.2, H * 0.7); actor(E(k), cs * 1.6, [[x, y, 0.2, 0, 0], [x, y, 1, 0, 1], [x, y, 1, 180, 1], [x, y, 1, 360, 1], [x, y, 0.6, 360, 0]], 1300, 200 + k * 220); }
    else if(mode === 'crown') actor(E(0), cs * 1.4, [[last[0], -cs, 1, -20, 0], [last[0], last[1] - cs * 1.6, 1.2, 10, 1], [last[0], last[1] - cs * 1.4, 1, 0, 1], [last[0], last[1] - cs * 1.4, 1, 0, 0]], 1700, 600, 'cubic-bezier(.3,1.5,.5,1)');
    else if(mode === 'wave'){ const s = Math.max(W, H) * 0.5; actor(E(0), s, [[-s * 0.6, H * 0.75, 1, -10, 0.9], [W * 0.5, H * 0.45, 1.25, 5, 1], [W + s * 0.6, H * 0.6, 1, 15, 0.8]], 1500, 0, 'ease-in-out'); }
    else if(mode === 'arc') for(let k = 0; k < n; k++){ const x0 = R(0, W * 0.6), x1 = x0 + R(W * 0.2, W * 0.4), top = R(H * 0.1, H * 0.4); actor(E(k), cs * 0.9, [[x0, H + cs, 1, -40, 1], [(x0 + x1) / 2, top, 1.2, 0, 1], [x1, H + cs, 1, 40, 1]], 1100, 200 + k * 140, 'linear'); }
    else if(mode === 'rain') for(let k = 0; k < n; k++){ const x = R(0, W); actor(E(k), cs * R(0.5, 0.9), [[x, -cs, 1, 0, 1], [x + R(-20, 20), H + cs, 1, R(-200, 200), 0.8]], R(1000, 1500), k * 45, 'ease-in'); }
    else if(mode === 'jelly') actor(E(0), cs * 2.2, [[W / 2, H / 2, 0.1, 0, 0], [W / 2, H / 2, 1.3, 0, 1], [W / 2, H / 2, 0.85, 0, 1], [W / 2, H / 2, 1.1, 0, 1], [W / 2, H / 2, 1, 0, 1], [W / 2, H / 2, 0.4, 0, 0]], 1600, 300, 'ease-in-out');
    else if(mode === 'orbit'){ actor(E(0), cs * 2.4, [[W / 2, H / 2, 0.1, 0, 0], [W / 2, H / 2, 1, 20, 1], [W / 2, H / 2, 1, -20, 1], [W / 2, H / 2, 0.3, 0, 0]], 1800, 100);
      for(let m = 0; m < 3; m++){ const f = []; for(let q = 0; q <= 12; q++){ const a = q / 12 * Math.PI * 2 + m * 2.1; f.push([W / 2 + Math.cos(a) * cs * 2.2, H / 2 + Math.sin(a) * cs * 1.1, 1, 0, q === 12 ? 0 : 1]); } actor('⭐', cs * 0.6, f, 1700, 150, 'linear'); } }
    else if(mode === 'swing'){ const f = []; for(let q = 0; q <= 10; q++){ const a = -1.1 + q * 0.22; f.push([W / 2 + Math.sin(a) * W * 0.45, H * 0.1 + Math.cos(a) * H * 0.35, 1, a * 30, q === 10 ? 0 : 1]); } actor(E(0), cs * 1.6, f, 1700, 0, 'ease-in-out'); }
    else if(mode === 'spin') [[cs, cs], [W - cs, cs], [cs, H - cs], [W - cs, H - cs]].slice(0, n).forEach(([x, y], k) => actor(E(k), cs * 1.5, [[x, y, 0.2, 0, 0], [x, y, 1, 360, 1], [x, y, 1, 720, 1], [x, y, 0.3, 1080, 0]], 1600, k * 80, 'linear'));
    else if(mode === 'zap') pts.forEach((p, k) => actor(E(k), cs * 0.9, [[p[0], p[1] - cs * 1.5, 0.4, 0, 0], [p[0], p[1], 1.4, 0, 1], [p[0], p[1], 0.6, 0, 0]], 420, 500 + k * 70, 'ease-in'));
  });
  if(!calmMotion()){ const b = $('board'); try{ b.animate([{transform: 'translate(0,0)'}, {transform: 'translate(-5px,2px)'}, {transform: 'translate(5px,-2px)'}, {transform: 'translate(-3px,0)'}, {transform: 'translate(0,0)'}], {duration: 420, delay: 250}); }catch(e){} }
  return fxSleep(1500);
}

/* ---------- 🏃 the player's avatar runs along the line, counting the points ---------- */
function letterValue(i, j){ const c = G.cells[i]; if(!c) return 0; const pr = G.last.indexOf(i) >= 0 ? G.prem[i] : ''; return c.pts * (pr === '2t' ? 2 : pr === '3t' ? 3 : 1); }
function runAlong(P, j){
  if(!FX || !G) return Promise.resolve();
  const g = G, L = fxLayer(), cv = $('runcv'), dpr = Math.min(2, window.devicePixelRatio || 1), W = L.offsetWidth, H = L.offsetHeight;
  const ctx = cv.getContext('2d'), line = j.lines[0].cells, pts = line.map(cellXY), cs = pts[0][2], k = cs * 1.5 / 95;
  const PT = Math.round(cs * 2.6), PS = Math.round(cs * 2);   // r32: room above + beside the board for the head, the jump and the ×2/×3 lift
  cv.width = (W + PS * 2) * dpr; cv.height = (H + PT) * dpr; cv.style.width = (W + PS * 2) + 'px'; cv.style.height = (H + PT) + 'px'; cv.style.left = -PS + 'px'; cv.style.top = -PT + 'px';
  const across = line.length < 2 || line[1] - line[0] === 1, back = across ? [-cs * 1.4, 0] : [0, -cs * 1.4];
  const path = [[pts[0][0] + back[0], pts[0][1] + back[1]]].concat(pts.map(p => [p[0], p[1]]));
  const bub = document.createElement('div'); bub.className = 'runbub'; bub.style.opacity = '0'; L.appendChild(bub);
  const skip = document.createElement('button'); skip.className = 'skipbtn'; skip.textContent = '⏩ Skip'; skip.onclick = e => { e.stopPropagation(); g.skipRun = true; }; L.appendChild(skip);
  const a = {name: P.name, av: P.bot ? null : myAvatar(P.name), dir: 1, walkT: 0, jumpH: 0};
  const SEG = 260, END = 900;
  // ✖️ every ×2 / ×3 (or ⭐) square under a NEW tile = a hold where the avatar lifts the bonus up (×3 = longer, bigger)
  const premAt = q => { const i = line[q]; return G.last.indexOf(i) >= 0 ? (G.prem[i] || '') : ''; };
  const HOLD = q => { const pr = premAt(q); return !pr ? 0 : /3/.test(pr) ? 950 : 700; };
  const starts = []; let acc = 0; for(let s = 0; s < path.length - 1; s++){ starts.push(acc); acc += SEG + (s >= 1 ? HOLD(s - 1) : 0); }
  const total = acc + HOLD(line.length - 1);
  let sum = 0, hitIdx = 0, t0 = performance.now(), boomed = {};
  buddyAway(P, true); g.skipRun = false; fxSnd('go');
  return new Promise(done => {
    const finish = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); bub.remove(); skip.remove(); buddyAway(P, false); done(); };
    function frame(now){
      if(G !== g){ finish(); return; }
      let t = Math.max(0, now - t0); if(g.skipRun){ t = Math.max(t, total + END); }
      ctx.setTransform(dpr, 0, 0, dpr, PS * dpr, PT * dpr); ctx.clearRect(-PS, -PT, W + PS * 2, H + PT);
      let seg = 0; while(seg < starts.length - 1 && t >= starts[seg + 1]) seg++;
      const segT = t - starts[seg], hold = seg >= 1 ? HOLD(seg - 1) : 0, inHold = segT < hold, f = inHold ? 0 : Math.min(1, (segT - hold) / SEG), A = path[seg], B = path[seg + 1];
      let x = A[0] + (B[0] - A[0]) * f, y = A[1] + (B[1] - A[1]) * f;
      const lastHold = t >= acc && t < total, effortQ = inHold ? segT / hold : lastHold ? (t - acc) / HOLD(line.length - 1) : -1, effortCell = inHold ? seg - 1 : lastHold ? line.length - 1 : -1;
      if(lastHold){ x = path[path.length - 1][0]; y = path[path.length - 1][1]; }
      while(hitIdx < line.length && t >= starts[hitIdx] + (hitIdx >= 1 ? HOLD(hitIdx - 1) : 0) + SEG){ const i = line[hitIdx], pr = G.last.indexOf(i) >= 0 ? G.prem[i] : '', el = cellEl(i).querySelector('.tile');
        sum += letterValue(i, j); bub.textContent = '+' + sum; bub.style.opacity = '1';
        if(el){ el.classList.remove('hit', 'hit2'); void el.offsetWidth; el.classList.add(pr ? 'hit2' : 'hit'); }
        if(!g.skipRun) fxSnd(pr ? 'jump' : 'step', hitIdx); hitIdx++; }
      const onPrem = !!premAt(Math.min(line.length - 1, seg));
      const jump = t < total && effortQ < 0 ? Math.sin(f * Math.PI) * cs * (onPrem ? 0.7 : 0.18) : 0;
      if(effortCell >= 0 && effortQ >= 0.78 && !boomed[effortCell]){ boomed[effortCell] = 1; premBoom(L, line[effortCell], premAt(effortCell), cs, g.skipRun); }
      if(t >= total){ x = path[path.length - 1][0]; y = path[path.length - 1][1]; }
      const feet = y + cs * 0.42 - jump;
      if(P.bot) emo(ctx, THEMES[G.theme].bot, x, feet - cs * 1.2 * 0.38 - (t >= total ? Math.abs(Math.sin(t / 90)) * cs * 0.3 : 0), cs * 1.2);   // cached emoji (AvatarKit emo)
      else { a.walkT = t < total ? t / 1000 : 0; a.jumpH = jump > cs * 0.3 ? jump : 0;
        a.gest = t >= total ? {g: gestureByKey('cheer'), t: (t - total) / 1000} : effortQ >= 0 ? {g: EFFORT, t: effortQ * EFFORT.d} : null;
        if(effortQ >= 0) a.walkT = 0;
        try{ drawAvatar(ctx, a, x + (effortQ >= 0 && effortQ < 0.78 ? Math.sin(now / 22) * cs * 0.03 : 0), feet, k, {t: now / 1000}); }catch(e){} }
      if(effortQ >= 0 && effortQ < 0.8) drawLift(ctx, x, feet, cs, effortQ, premAt(effortCell), now, P.bot);
      bub.style.transform = 'translate(' + x + 'px,' + (feet - cs * 1.75) + 'px) translate(-50%,-100%)';
      if(t >= total && !bub.classList.contains('big')){ bub.classList.add('big'); bub.textContent = (j.bingo ? '🌟 ' : '') + '+' + j.score; fxSnd('total'); }
      if(t >= total + END){ finish(); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}
// ✖️ the effort pose: squat, arms up, pushing the bonus block over the head (shaking, sweat)
const EFFORT = {k: 'effort', n: 'Lift!', d: 1, f: (p, t) => ({armL: 2.9 + Math.sin(t * 30) * 0.06, armR: 2.9 - Math.sin(t * 30) * 0.06, legL: 0.35, legR: -0.35, dy: 3 - Math.min(1, p / 0.7) * 2, mouth: 'open', eyes: p < 0.7 ? 'closed' : 'happy', fx: p < 0.7 ? '💦' : '💪'})};
function premText(pr){ return pr === 'star' ? '⭐×2' : (/3/.test(pr) ? '×3' : '×2') + (/e$/.test(pr) ? ' WORD' : ''); }
function premCol(pr){ return pr === 'star' ? '#FFC845' : /3e/.test(pr) ? '#FF4D6D' : /2e/.test(pr) ? '#FF8FB1' : /3t/.test(pr) ? '#3B7BFF' : '#5EC8FF'; }
// the bonus block rising over the head (drawn on the run canvas)
function drawLift(ctx, x, feet, cs, q, pr, now, bot){
  const up = Math.min(1, q / 0.7), y = feet - cs * (1.25 + up * 0.75), w = cs * (/3/.test(pr) ? 1.25 : 1.05), h = cs * 0.62;
  ctx.save(); ctx.translate(x + Math.sin(now / 25) * cs * 0.03 * (1 - up * 0.5), y);
  ctx.fillStyle = premCol(pr); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;
  ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, 8); else ctx.rect(-w / 2, -h / 2, w, h); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '900 ' + Math.round(h * 0.55) + "px 'Fredoka',sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(premText(pr), 0, 1);
  if(bot && q < 0.7) emo(ctx, '💦', w * 0.6, h * 0.6 - cs * 0.5 * 0.38, cs * 0.5);
  ctx.restore();
}
// the burst when the bonus is lifted: big ×3 text + ring + power sound (×3 = bigger + longer)
function premBoom(L, i, pr, cs, quiet){
  const [x, y] = cellXY(i), big = /3/.test(pr), col = premCol(pr);
  const t = document.createElement('div'); t.className = 'pburst'; t.textContent = premText(pr) + '!'; t.style.cssText = 'left:' + x + 'px;top:' + (y - cs * 0.9) + 'px;font-size:' + Math.round(cs * (big ? 1.5 : 1.1)) + 'px;--pc:' + col; L.appendChild(t);
  [0, 1].slice(0, big ? 2 : 1).forEach(n => { const r = document.createElement('div'); r.className = 'pring'; r.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + cs + 'px;height:' + cs + 'px;--pc:' + col + ';animation-delay:' + (n * 0.15) + 's'; L.appendChild(r); setTimeout(() => r.remove(), 1000); });
  setTimeout(() => t.remove(), 950);
  const el = cellEl(i) && cellEl(i).querySelector('.tile'); if(el){ el.classList.remove('hit2'); void el.offsetWidth; el.classList.add('hit2'); }
  if(!quiet){ if(big){ [0, 1, 2, 3].forEach(k => fxTone([392, 523, 659, 1046][k], 0.18, 'sawtooth', 0.09, null, k * 0.06)); fxTone(90, 0.35, 'sine', 0.3, 45); } else [0, 1, 2].forEach(k => fxTone([440, 587, 880][k], 0.14, 'square', 0.07, null, k * 0.05)); }
  try{ if(navigator.vibrate) navigator.vibrate(big ? [20, 30, 40] : 15); }catch(e){}
}
function gestureByKey(k){ return (typeof GESTURES !== 'undefined' && GESTURES.find(x => x.k === k)) || {k, d: 1, f: () => ({armL: 2.6, armR: 2.6, mouth: 'open'})}; }

/* ---------- 🪑 buddy bench: everyone waits on the bench, the player whose turn it is stands and does random moves ---------- */
const BUD = {raf: 0, last: 0, st: {}, away: null};
const IDLE = ['wave', 'dance', 'clap', 'cheer', 'stretch', 'think', 'laugh', 'juggle', 'starjump', 'hop', 'snack', 'read', 'yawn', 'robot', 'dab', 'guitar'];
function buddyStart(){ if(!BUD.raf) BUD.raf = requestAnimationFrame(buddyFrame); }
function buddyAway(P, on){ BUD.away = on ? P.name : null; }
function buddyFrame(now){
  BUD.raf = 0;
  if(!G || $('scr-play').classList.contains('hidden')) return;
  BUD.raf = requestAnimationFrame(buddyFrame);
  if(now - BUD.last < 33) return; const dt = Math.min(0.1, (now - (BUD.last || now)) / 1000); BUD.last = now;
  const cv = $('buddy-cv'); if(!cv || !cv.offsetWidth) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.offsetWidth, h = cv.offsetHeight;
  if(cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const ps = G.players, n = ps.length, seatY = h - 16, k = (h - 8) / 100;
  // bench
  g.fillStyle = 'rgba(120,72,30,0.9)'; g.fillRect(8, seatY - 4, w - 16, 7); g.fillStyle = 'rgba(90,52,20,0.9)'; g.fillRect(16, seatY + 3, 5, 13); g.fillRect(w - 21, seatY + 3, 5, 13); g.fillRect(8, seatY - 22, w - 16, 4);
  ps.forEach((P, idx) => {
    const st = BUD.st[P.name] || (BUD.st[P.name] = {gest: null, next: performance.now() / 1000 + 1 + Math.random() * 2});
    const x = w * (n === 1 ? 0.3 : 0.14 + idx * (0.72 / Math.max(1, n - 1))), me = idx === G.cur, tnow = now / 1000;
    if(BUD.away === P.name){ emo(g, '🏃', x - 9, seatY - 13, 18); emo(g, '💨', x + 9, seatY - 13, 18); return; }
    const base = me ? seatY + 10 : seatY + 2, kk = me ? k : k * 0.82;
    if(P.bot){ const s = Math.round(h * (me ? 0.62 : 0.5)); emo(g, THEMES[G.theme].bot, x, base - 4 - s * 0.38 - (me ? Math.abs(Math.sin(tnow * 4)) * 6 : 0), s); }
    else {
      if(me){ if(!st.gest && tnow > st.next){ const pool = IDLE.map(gestureByKey).filter(Boolean); st.gest = {g: pick(pool), t: 0}; } if(st.gest){ st.gest.t += dt; if(st.gest.t > st.gest.g.d){ st.gest = null; st.next = tnow + 2 + Math.random() * 3; } } }
      else st.gest = null;
      try{   // r32: placed so the whole avatar and its moves stay inside the bench box (no cut-off heads / swords / jumps)
        const av = myAvatar(P.name), Q = avatarPlace(av, P.name, w, h, x, base, kk, me ? IDLE : []);
        drawAvatar(g, {name: P.name, av, dir: 1, walkT: 0, gest: me ? st.gest : null}, Q.x, Q.y, Q.k, {t: tnow, still: !me});
      }catch(e){}
    }
    if(!me){ g.fillStyle = 'rgba(120,72,30,0.95)'; g.fillRect(x - 22, seatY - 4, 44, 7); }
    else { g.fillStyle = '#FF4D8D'; g.beginPath(); g.moveTo(x - 6, 4); g.lineTo(x + 6, 4); g.lineTo(x, 11); g.fill(); if(G.lx && idx !== G.lx.seat && !P.bot) lxBubble(g, x, w, h, tnow, P); }
  });
  const who = $('buddy-who'); if(who){ const P = cur(); who.textContent = P.bot ? '🤖 Robot is thinking…' : G.lx ? (G.cur === G.lx.seat ? 'Your turn, ' + P.name : '✏️ ' + P.name + ' is thinking…') : (G.L.together || ps.length > 2 ? P.name + "'s turn" : 'Your turn, ' + P.name); }
}

/* ---------- ✋ drag tiles: rearrange the hand, drop on the board, drop in the 🔁 swap box ---------- */
let DR = null, dragQuiet = 0;
function dragFrom(e, src){
  if(!canAct() || e.button > 0) return;
  if(DR){ if(DR.pid !== e.pointerId) return; dragAbort(); }   /* 🐞 dg-2 */
  DR = Object.assign({x0: e.clientX, y0: e.clientY, moved: false, ghost: null, over: null, pid: e.pointerId, t: performance.now()}, src);
}
document.addEventListener('pointermove', e => {
  if(!DR || (DR.pid != null && e.pointerId !== DR.pid)) return; if(e.buttons === 0 && e.pointerType === 'mouse'){ dragUp(e); return; } DR.t = performance.now();   /* 🐞 dg-2 */
  if(!DR.moved){ if(Math.hypot(e.clientX - DR.x0, e.clientY - DR.y0) < 9) return; dragBegin(); if(!DR) return; dragCapture(e); }
  e.preventDefault();
  DR.ghost.style.left = e.clientX + 'px'; DR.ghost.style.top = e.clientY + 'px';
  dragOver(e.clientX, e.clientY);
}, {passive: false});
document.addEventListener('pointerup', e => { if(DR && DR.pid != null && e.pointerId !== DR.pid) return; dragUp(e); });   /* 🐞 dg-2 */
document.addEventListener('pointercancel', e => { if(DR && DR.pid != null && e.pointerId !== DR.pid) return; dragAbort(); });   /* 🐞 dg-2 */
function dragTile(d){ const P = cur(); if(d.from === 'rack') return P.rack.find(r => r.id === d.id); const p = G.pend.find(q => q.i === d.i); return p ? {id: p.id, t: p.blank ? '?' : p.t} : null; }
function dragBegin(){
  const x = dragTile(DR); if(!x){ DR = null; return; }
  DR.moved = true; DR.id = x.id; G.sel = null;
  const gh = document.createElement('div'); gh.className = 'dragghost'; gh.innerHTML = show(x.t === '?' ? '★' : x.t); document.body.appendChild(gh); DR.ghost = gh;
  if(DR.from === 'board'){ G.pend = G.pend.filter(p => p.i !== DR.i); G.cursor = null; paintAll(); liveCheck(); }
  G.dragId = x.id; renderRack(false);
  UISound.play('tap');
}
function dragTarget(x, y){
  const el = document.elementFromPoint(x, y); if(!el) return null;
  if(el.closest('#swapbox')) return {kind: 'box'};
  const rack = el.closest('#rack'); if(rack) return {kind: 'rack'};
  const c = el.closest('#board .cell'); if(c){ const i = Number(c.dataset.i); if(!G.cells[i] && !G.pend.some(p => p.i === i)) return {kind: 'cell', i}; return {kind: 'full'}; }
  return null;
}
function rackIndexAt(x){
  const P = cur(), btns = $('rack').children; let best = 0, bd = 1e9;
  for(let k = 0; k < P.rack.length; k++){ const r = btns[k] && btns[k].getBoundingClientRect(); if(!r) continue; const d = Math.abs(r.left + r.width / 2 - x); if(d < bd){ bd = d; best = k; } }
  return best;
}
function dragOver(x, y){
  const t = dragTarget(x, y);
  document.querySelectorAll('.cell.dropok').forEach(c => c.classList.remove('dropok')); $('swapbox').classList.toggle('hot', !!t && t.kind === 'box');
  if(t && t.kind === 'cell') cellEl(t.i).classList.add('dropok');
  if(t && t.kind === 'rack'){ const P = cur(), from = P.rack.findIndex(r => r.id === DR.id), to = rackIndexAt(x); if(from >= 0 && to !== from){ const [m] = P.rack.splice(from, 1); P.rack.splice(to, 0, m); renderRack(false); } }
}
function dragEnd(d){ if(d.ghost) d.ghost.remove(); dragSweep(); G.dragId = null; document.querySelectorAll('.cell.dropok').forEach(c => c.classList.remove('dropok')); $('swapbox').classList.remove('hot'); dragQuiet = performance.now(); }
/* 🐞 DRAG GUARD (dg-2): one drag per finger; a lost finger-up, a 2nd finger, an app switch or a screen change never leaves a block on screen */
function dragSweep(){ document.querySelectorAll('.dragghost').forEach(g => g.remove()); }
function dragCapture(e){ try{ document.body.setPointerCapture(e.pointerId); DR.cap = true; }catch(err){} }
function dragRelease(d){ if(d && d.cap){ try{ if(document.body.hasPointerCapture(d.pid)) document.body.releasePointerCapture(d.pid); }catch(err){} } }
function dragUp(e){ if(!DR) return; const d = DR; DR = null; dragRelease(d); if(d.moved) dragDrop(d, e.clientX, e.clientY); }
function dragAbort(){ const d = DR; DR = null; if(d){ dragRelease(d); if(d.moved){ dragEnd(d); if(G){ renderRack(false); renderSwapBox(); } } } dragSweep(); }
document.addEventListener('pointerdown', e => { if(DR && (e.pointerId === DR.pid || performance.now() - (DR.t || 0) > 250)) dragAbort(); else if(!DR) dragSweep(); }, true);
document.addEventListener('lostpointercapture', e => { if(DR && DR.cap && e.pointerId === DR.pid && e.target === document.body) dragAbort(); });   /* dg-2b: ONLY the body's own capture — moving it to the body fires lostpointercapture on the touched tile (touch = implicit capture) */
document.addEventListener('visibilitychange', () => { if(document.hidden) dragAbort(); });
window.addEventListener('pagehide', dragAbort); window.addEventListener('blur', dragAbort); window.addEventListener('orientationchange', dragAbort);
setInterval(() => { if(!DR && document.querySelector('.dragghost')) dragSweep(); }, 700);
/* 🐞 /DRAG GUARD (dg-2) */
function dragDrop(d, x, y){
  const t = dragTarget(x, y); dragEnd(d);
  if(!G || !canAct()){ if(G) renderRack(false); return; }
  if(t && t.kind === 'cell'){ placeAt(t.i, d.id, false); return; }
  if(t && t.kind === 'box'){ if(!bagN()){ UI.toast('The bag is empty'); renderRack(false); renderSwapBox(); return; } if(!G.swap) startSwap(); G.swap.add(d.id); UISound.play('drop'); renderRack(false); $('swap-txt').textContent = 'Swap ' + G.swap.size; return; }
  if(t && t.kind === 'rack') UISound.play('pop');
  afterChange();
}
function startSwap(){ recallAll(); G.swap = new Set(); $('b-swap').classList.add('on'); $('swap-txt').textContent = 'Swap 0'; setMsg('🔁 Tap or drag tiles into the swap box, then press Swap (uses your turn)', ''); }
function cancelSwap(){ if(!G || !G.swap) return; G.swap = null; $('b-swap').classList.remove('on'); $('swap-txt').textContent = 'Swap'; setMsg('Tap a tile, then a square — or drag it', ''); renderRack(false); }
function renderSwapBox(){
  const box = $('swapbox'); if(!box || !G) return;
  const on = !!G.swap, P = cur(), fl = !on && !!G.dragId; box.classList.toggle('hidden', !on && !G.dragId); box.classList.toggle('floating', fl);
  if(fl){ const r = $('rack'); box.style.top = (r.offsetTop + r.offsetHeight + 6) + 'px'; } else box.style.top = '';
  const ids = on ? [...G.swap] : [];
  $('sb-tiles').innerHTML = ids.length ? ids.map(id => { const x = P.rack.find(r => r.id === id); return x ? '<button data-id="' + id + '" title="Put back">' + show(x.t === '?' ? '★' : x.t) + '</button>' : ''; }).join('') : '<span class="sb-lbl" style="opacity:.75">Drop tiles here</span>';
  $('sb-tiles').querySelectorAll('button').forEach(b => b.onclick = () => { if(!canAct() || !G.swap) return; G.swap.delete(Number(b.dataset.id)); UISound.play('pop'); renderRack(false); $('swap-txt').textContent = 'Swap ' + G.swap.size; });
  $('sb-go').textContent = '🔁 Swap ' + ids.length; $('sb-go').disabled = !ids.length; $('sb-x').classList.toggle('hidden', !on);
}
// a tile was just put on the board
function thunk(i){ const el = cellEl(i) && cellEl(i).querySelector('.tile'); if(!el) return; el.classList.add('thunk'); fxSnd('thunk'); }
function shimmer(ok){ const tiles = G.pend.map(p => cellEl(p.i) && cellEl(p.i).querySelector('.tile')).filter(Boolean); tiles.forEach((el, k) => { el.classList.remove('shine', 'wobble'); void el.offsetWidth; el.style.animationDelay = (ok ? k * 70 : 0) + 'ms'; el.classList.add(ok ? 'shine' : 'wobble'); }); }
// new tiles from the bag pop up into the hand
function markFresh(P){ const seen = P._seen || (P._seen = new Set()); P.rack.forEach(x => { if(!seen.has(x.id)){ x._fresh = true; seen.add(x.id); } }); }

/* ---------- little synth for the fun bits (follows the sound switch + volume) ---------- */
let FXAC = null;
function fxTone(freq, dur, type, gain, slideTo, delay){
  try{ const st = UISound.get(); if(!st.enabled || !FX) return; const C = window.AudioContext || window.webkitAudioContext; if(!C) return; if(!FXAC) FXAC = new C(); if(FXAC.state === 'suspended') FXAC.resume();
    const t0 = FXAC.currentTime + (delay || 0), o = FXAC.createOscillator(), g = FXAC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0); if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, (gain || 0.2) * st.volume), t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g); g.connect(FXAC.destination); o.start(t0); o.stop(t0 + dur + 0.02); }catch(e){}
}
const FX_SCALE = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1397, 1568, 1760, 1976, 2093];
function fxSnd(kind, n){
  if(kind === 'thunk'){ fxTone(180, 0.09, 'triangle', 0.25, 90); fxTone(900, 0.04, 'square', 0.04); }
  else if(kind === 'step') fxTone(FX_SCALE[Math.min(FX_SCALE.length - 1, n || 0)], 0.11, 'triangle', 0.16);
  else if(kind === 'jump'){ fxTone(FX_SCALE[Math.min(FX_SCALE.length - 1, n || 0)], 0.16, 'triangle', 0.2); fxTone(400, 0.2, 'sine', 0.12, 1200); }
  else if(kind === 'go') fxTone(300, 0.18, 'sine', 0.12, 700);
  else if(kind === 'total') [0, 1, 2].forEach(k => fxTone([784, 988, 1319][k], 0.14, 'triangle', 0.18, null, k * 0.07));
  else if(kind === 'big') [0, 1, 2, 3, 4, 5].forEach(k => fxTone(523 * Math.pow(1.26, k), 0.16, 'triangle', 0.16, null, k * 0.08));
}

/* ---------- keyboard ---------- */
document.addEventListener('keydown', e => {
  if(!G || $('scr-play').classList.contains('hidden')) return;
  if(!canAct()) return;
  const k = e.key, N = G.N;
  if(k === 'Enter'){ e.preventDefault(); playMove(); return; }
  if(k === 'Escape'){ recallAll(); return; }
  if(k === 'Backspace'){ e.preventDefault(); const p = G.pend.pop(); if(p){ G.cursor = {i: p.i, dir: G.cursor ? G.cursor.dir : 'across'}; afterChange(); } return; }
  if((k === 'ArrowLeft' || k === 'ArrowRight') && G.sel != null && !G.cursor){ e.preventDefault(); const P = cur(), a = P.rack.findIndex(r => r.id === G.sel), b = a + (k === 'ArrowRight' ? 1 : -1); if(a >= 0 && b >= 0 && b < P.rack.length){ const [m] = P.rack.splice(a, 1); P.rack.splice(b, 0, m); UISound.play('tap'); renderRack(false); } return; }
  if(k.startsWith('Arrow')){ e.preventDefault(); const c = G.cursor ? G.cursor.i : ((N - 1) / 2) * N + (N - 1) / 2, r = (c / N) | 0, q = c % N;
    const nr = Math.max(0, Math.min(N - 1, r + (k === 'ArrowDown') - (k === 'ArrowUp'))), nq = Math.max(0, Math.min(N - 1, q + (k === 'ArrowRight') - (k === 'ArrowLeft')));
    const old = G.cursor ? G.cursor.i : -1; G.cursor = {i: nr * N + nq, dir: k === 'ArrowDown' || k === 'ArrowUp' ? 'down' : 'across'}; if(old >= 0) paintCell(old); paintCell(G.cursor.i); return; }
  if(k === ' '){ e.preventDefault(); if(G.cursor){ G.cursor.dir = G.cursor.dir === 'across' ? 'down' : 'across'; paintCell(G.cursor.i); } return; }
  const t = /^[a-zA-Z]$/.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey ? k.toUpperCase() : null;
  if(t && G.cursor){ const P = cur(), x = P.rack.find(r => r.t === t && !G.pend.some(p => p.id === r.id)) || P.rack.find(r => r.t === '?' && !G.pend.some(p => p.id === r.id));
    if(!x){ UISound.play('error'); setMsg('You don\'t have a ' + show(t) + ' tile', 'bad'); return; }
    if(x.t === '?'){ G.pend.push({i: G.cursor.i, id: x.id, t, blank: true}); const i = G.cursor.i; moveCursor(i, true); afterChange(); return; }
    placeAt(G.cursor.i, x.id, true); return; }
  if(k === 'c' || k === 'C'){ if(G.L.check !== 'none') checkMove(true); }
  else if(k === 'h' || k === 'H') useHint();
  else if(k === 'm' || k === 'M') mixRack();
  else if(k === 'z' || k === 'Z') toggleZoom();
});

function toggleVoice(){ voiceOn = !voiceOn; savePrefs(); paintVoice(); if(!voiceOn) try{ speechSynthesis.cancel(); }catch(e){} }
function elapsed(){ return G ? performance.now() - G.t0 - G.pausedTotal - (G.paused ? performance.now() - G.pausedAt : 0) : 0; }
function pauseGame(){ dragAbort(); /* 🐞 dg-2 */ if(G && !G.paused && !G.over){ G.paused = true; G.pausedAt = performance.now(); } }
function resume(){ if(G && G.paused && !G.over){ G.pausedTotal += performance.now() - G.pausedAt; G.paused = false; } }
function leavePlay(){
  if(G && G.lx){ lxLeavePlay(); return; }   // 📡 lk-3a
  if(!G || G.over){ backToMenu(); return; }
  pauseGame();
  UI.confirm({icon: '◀', title: 'Leave this game?', body: 'This game will not be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) backToMenu(); else resume(); });
}
function backToMenu(){ dragAbort(); /* 🐞 dg-2 */ if(window.Cheer) Cheer.unmount(); clearInterval(timerId); try{ speechSynthesis.cancel(); }catch(e){} G = null; hideResult(); closeSheet(); renderMenu(); showScreen('menu'); }

/* ================= FINISH ================= */
function finishGame(why, bad){
  dragAbort(); /* 🐞 dg-2 */
  if(!G || G.over) return;
  G.over = true; G.busy = false; clearInterval(timerId); closeSheet();
  cheerEnd(why); /* 📣 cs-3b */
  const g = G, L = g.L, secs = Math.max(1, Math.round(elapsed() / 1000)), T = THEMES[g.theme];
  saveJournal(g); hideCard(true);
  if(L.together) return togetherOver(g, secs);
  const me = g.players[0], bot = g.players[1];
  const won = why !== 'hardcore' && me.score > bot.score;
  const margin = bot.score ? (me.score - bot.score) / bot.score : 1;
  const stars = !won ? 0 : margin >= 0.5 ? 3 : margin >= 0.2 ? 2 : 1;
  let score = me.score + (won ? Math.max(0, me.score - bot.score) + 20 * (g.lvl + 1) : 0);
  if(L.hardcore && won) score *= 3;
  const stats = {words: me.eqs, bestMove: me.best, bingos: me.bingos, wins: won ? 1 : 0, rounds: 1};
  if(score > 0 || won) saveWin(S.player, g.lvl, {timeSec: secs, stars, score, theme: g.theme, cleared: won, stats});
  if(won){ const pr = pick(PRAISE); party('🎉 ' + pr + ', ' + S.player + '!'); say(pr + ', ' + S.player + '! You beat the robot!'); confetti(['🔤', '⭐', '🎉', '📚', '✏️', T.icon], 40); UISound.play('success'); }
  else { UISound.play('pop'); say(why === 'hardcore' ? 'Hardcore over. That word was not in the list.' : me.score === bot.score ? 'A draw! So close!' : 'The robot won this time. Good try!'); }
  setTimeout(() => {
    if(G !== g) return;
    const next = won && g.lvl < 5;
    showResult('<div class="big">' + (won ? (stars === 3 ? '🏆' : '🎉') : why === 'hardcore' ? '💀' : T.bot) + '</div><h2 class="' + (won ? 'cheer' : '') + '">' + (won ? 'You beat the robot!' : why === 'hardcore' ? '💀 Hardcore over!' : me.score === bot.score ? 'A draw!' : 'The robot won') + '</h2>' +
      (won ? '<div class="rating">' + [0, 1, 2].map(k => '<span class="st' + (k < stars ? '' : ' off') + '" style="animation-delay:' + (0.25 + k * 0.25) + 's">⭐</span>').join('') + '</div>' : '') +
      '<div class="standings"><div class="' + (won ? 'win' : '') + '"><span>👤 ' + UI.esc(me.name) + '</span><span>' + me.score + '</span></div><div class="' + (!won && bot.score > me.score ? 'win' : '') + '"><span>' + T.bot + ' Robot</span><span>' + bot.score + '</span></div></div>' +
      '<div class="score-big">🏆 <span id="score-count">0</span></div>' +
      '<div class="stats"><span>✏️ ' + me.eqs + ' words</span><span>⚡ best move ' + me.best + '</span>' + (me.bingos ? '<span>🌟 ' + me.bingos + '× all 7</span>' : '') + '<span>⏱ ' + fmt(secs * 1000) + '</span>' + (L.hardcore ? '<span>💀 ×3</span>' : '') + '</div>' +
      (why === 'hardcore' ? '<div class="hc-note">💀 ' + (bad && bad.text ? UI.esc(bad.text) + ' — ' : '') + UI.esc((bad && bad.msg) || 'not right') + '. Hardcore ends on the first wrong word.</div>' : '') +
      (!won ? '<div class="tip">' + pick(TIPS) + '</div>' : stars < 3 ? '<div class="tip">⭐⭐⭐ = win by a lot (half as much again). ' + pick(TIPS) + '</div>' : '') +
      learnedHtml(g) +
      '<div class="save-note" id="save-note">' + (score > 0 || won ? '<span class="ui-spin a-bounce">🔤</span> Saving your score…' : 'Not saved — make a word to get a score.') + '</div>' +
      '<div class="res-btns">' + (next ? '<button class="btn sp-btn sp-primary" id="b-next">' + (g.lvl === 4 ? '💀 Try Hardcore ▶' : 'Next level ▶') + '</button>' : '') + '<button class="btn sp-btn ' + (next ? 'soft sp-secondary' : 'sp-primary') + '\" id="b-again">🔁 Play again</button><button class="btn soft sp-btn sp-secondary" id="b-menu">🎚️ Levels</button></div>');
    countUp($('score-count'), score, 1000); learnedWire(g);
    $('b-again').onclick = () => startGame(g.lvl);
    $('b-menu').onclick = () => backToMenu();
    if($('b-next')) $('b-next').onclick = () => { const p = progressOf(S.player); p.unlocked = Math.max(p.unlocked, g.lvl + 1); S.progress[S.player] = p; startGame(g.lvl + 1); };
  }, won ? 1700 : 1000);
}
function togetherOver(g, secs){
  const order = g.players.slice().sort((a, b) => b.score - a.score), top = order[0].score, winners = order.filter(p => p.score === top);
  if(!(g.lx && g.lx.role === 'guest')) g.players.forEach(P => { if(P.eqs) google.script.run.withFailureHandler(() => {}).saveFeats(P.name, GAME_ID, {words: P.eqs, bestMove: P.best, bingos: P.bingos, togetherGames: 1}); });
  party('🏆 ' + winners.map(w => w.name).join(' & ') + (winners.length > 1 ? ' tie!' : ' wins!')); confetti(['🔤', '⭐', '🎉', '🏆'], 40); UISound.play('success');
  say(winners.map(w => w.name).join(' and ') + (winners.length > 1 ? ' tie!' : ' wins!'));
  setTimeout(() => {
    if(G !== g) return;
    showResult('<div class="big">🏆</div><h2 class="cheer">' + UI.esc(winners.map(w => w.name).join(' & ')) + (winners.length > 1 ? ' tie!' : ' wins!') + '</h2>' +
      '<div class="standings">' + order.map((P, k) => '<div class="' + (P.score === top ? 'win' : '') + '"><span>' + ['🥇', '🥈', '🥉', '4️⃣'][k] + ' ' + UI.esc(P.name) + '</span><span>' + P.score + ' · ✏️ ' + P.eqs + '</span></div>').join('') + '</div>' +
      '<div class="stats"><span>⏱ ' + fmt(secs * 1000) + '</span><span>🔁 ' + g.L.rounds + ' rounds</span></div>' +
      learnedHtml(g) +
      '<div class="save-note">👨‍👩‍👧 Play-together games count for badges, not levels</div>' +
      (g.lx ? lxResultBtns(g) : '<div class="res-btns"><button class="btn sp-btn sp-primary" id="b-again">🔁 Play again</button><button class="btn soft sp-btn sp-secondary" id="b-menu">🎚️ Levels</button></div>'));
    learnedWire(g); if(g.lx){ lxResultWire(g); return; } $('b-again').onclick = () => startGame('together'); $('b-menu').onclick = () => backToMenu();
  }, 1600);
}
/* ================= 📖 WORD MEANINGS (11p, 2026-11-06) =================
   After every word (you, the robot or another player) a word card pops up for ~4 s: picture, the word, SYL·LA·BLES, a meaning in kid
   words, an example, 🔊 say it. Tap any word on the board to open it again; tap the card to keep it open.
   Meanings: the "Word Meanings" sheet tab (S.meanings) → built-in WordMeanings.html (~3,000 words) → the server looks the word up once.
   End of game: 📖 Words I learned (+ word journal on the Collection page) and a 🧠 3-question quiz for bonus ⭐. */
const WM = {cache: {}, waiting: {}, timer: 0, pinned: false, cur: ''};
function meaningOf(w){ w = String(w || '').toUpperCase(); const sv = (S.meanings || {})[w]; if(sv) return Object.assign({w}, sv); if(WM.cache[w]) return WM.cache[w]; return window.WordMeanings ? WordMeanings.get(w) : null; }
function lookUp(w, done){
  if(w in WM.cache) return done(WM.cache[w]); if(WM.waiting[w]){ WM.waiting[w].push(done); return; } WM.waiting[w] = [done];
  const fin = r => { WM.cache[w] = r && r.m ? Object.assign({w}, r) : null; if(r && r.err){ WM.blocked = true; console.warn('Word lookup failed — ' + r.err); } (WM.waiting[w] || []).forEach(f => f(WM.cache[w])); delete WM.waiting[w]; };
  try{ google.script.run.withSuccessHandler(fin).withFailureHandler(() => fin(null)).getWordMeaning(w); }catch(e){ fin(null); }
}
function learnWords(P, j){
  const g = G; g.learned = g.learned || new Map(); const words = j.lines.map(l => l.text.replace(/[^A-Z]/gi, '').toUpperCase()).filter(w => w.length > 1);
  words.forEach(w => { const o = g.learned.get(w) || {w, by: [], n: 0}; o.n++; if(!o.by.includes(P.name)) o.by.push(P.bot ? 'Robot' : P.name); g.learned.set(w, o); });
  if(words.length) wordCard(words[0], {by: P.bot ? (THEMES[g.theme].bot + ' Robot') : P.name, also: words.slice(1)});
}
function wordsAtCell(i){
  const lines = ['across', 'down'].map(d => lineThrough(i, d)).filter(l => l.length > 1).map(l => l.map(k => G.cells[k] ? G.cells[k].as : '').join('').toUpperCase());
  if(!lines.length) return; UISound.play('pop'); wordCard(lines[0], {pin: true, also: lines.slice(1)});
}
/* r31: the card STAYS. Computer / big screens: docked in the side column under the buttons (#wdock), showing the newest word (or the one you
   tapped). Phones / no room: it still pops up for a moment, and every word also goes on a shelf of cards under the game (#wshelf, newest on
   top) — kids scroll down to read. WM.list = newest first (≤ 12), reset each game. WM.mode = 'dock' | 'shelf' (set by layout()). */
function wordEntry(o, cls){
  const r = meaningOf(o.w), syl = (window.WordMeanings ? WordMeanings.syllables(o.w) : o.w), n = syllableCount(o.w);
  const m = r && r.m ? (r.base ? '(' + o.w + ' comes from ' + r.base + ') ' : '') + r.m : (WM.cache[o.w] === undefined && !(o.w in WM.cache) ? '📖 Looking it up…' : 'A real word — ask a grown-up what it means!');
  return '<div class="' + cls + '" data-w="' + o.w + '"><div class="wc-top"><span class="wc-emo">' + ((r && r.e) || '📖') + '</span><b class="wc-word">' + o.w + '</b><button class="wsay" data-say="' + o.w + '" title="Say it">🔊</button></div>' +
    '<div class="wc-syl">' + UI.esc(syl) + ' · ' + n + ' syllable' + (n > 1 ? 's' : '') + '</div><div class="wc-m">' + UI.esc(m) + '</div>' + (r && r.x ? '<div class="wc-x">“' + UI.esc(r.x) + '”</div>' : '') +
    ((o.also || []).length ? '<div class="wc-more">' + o.also.map(a => '<button class="wc-chip" data-w="' + a + '">also: ' + a + '</button>').join('') + '</div>' : '') +
    (o.by ? '<div class="wc-by">✏️ played by ' + UI.esc(o.by) + '</div>' : '') + (!(r && r.m) && WM.blocked ? '<div class="wc-by">🔧 Grown-up: the online dictionary is not switched on yet (Apps Script → run authorizeWordLookup once).</div>' : '') + '</div>';
}
function renderWordViews(fresh){
  if(!G || !WM.list) return;
  const dock = $('wdock'), shelf = $('wshelf'), has = WM.list.length > 0;
  dock.classList.toggle('hidden', !(has && WM.mode === 'dock')); shelf.classList.toggle('hidden', !(has && WM.mode === 'shelf'));
  if(!has) return;
  if(WM.mode === 'dock'){
    const o = WM.list.find(x => x.w === WM.cur) || WM.list[0];
    dock.innerHTML = '<div class="wc-lbl">📖 Word card' + (WM.list.length > 1 ? ' · ' + WM.list.length + ' words this game' : '') + '</div>' + wordEntry(o, 'wd-card');
    if(fresh){ dock.classList.remove('flash'); void dock.offsetWidth; dock.classList.add('flash'); }
  } else {
    $('wshelf-list').innerHTML = WM.list.map((o, i) => wordEntry(o, 'wsc' + (i === 0 ? ' top' : '') + (i === 0 && fresh ? ' new' : ''))).join('');
  }
}
function wordViewsClick(e){
  const say = e.target.closest('[data-say]'); if(say){ speakWord(say.dataset.say); return; }
  const chip = e.target.closest('.wc-chip'); if(chip){ wordCard(chip.dataset.w, {pin: true}); }
}
$('wdock').addEventListener('click', wordViewsClick); $('wshelf').addEventListener('click', wordViewsClick);
function wordDockMode(){
  const ar = $('arena'), side = $('side'), W = ar.clientWidth, H = ar.clientHeight;
  if(W < 760 || H > W) return 'shelf';
  const dock = $('wdock'), dh = dock.classList.contains('hidden') ? 0 : dock.offsetHeight + 8;
  const room = H - (side.offsetHeight - dh) - 24;
  if(room >= 170){ dock.style.maxHeight = Math.min(room, 360) + 'px'; return 'dock'; }
  return 'shelf';
}
function setWordMode(){
  if(!G) return; const m = wordDockMode(); const ar = $('arena'), portrait = ar.clientWidth < 760 || ar.clientHeight > ar.clientWidth;
  ar.classList.toggle('shelfy', m === 'shelf' && !portrait);
  if(WM.game !== G){ WM.game = G; WM.list = []; WM.cur = ''; }
  WM.mode = m; renderWordViews(false);
}
function wordCard(word, opt){
  opt = opt || {}; const w = String(word).toUpperCase(), el = $('wcard'); WM.cur = w; WM.pinned = !!opt.pin;
  if(WM.game !== G){ WM.game = G; WM.list = []; }
  const old = WM.list.find(x => x.w === w); WM.list = WM.list.filter(x => x.w !== w);
  WM.list.unshift({w, by: opt.by || (old && old.by) || '', also: (opt.also && opt.also.length ? opt.also : (old && old.also)) || []}); if(WM.list.length > 12) WM.list.length = 12;
  if(!WM.mode) setWordMode();
  [w].concat(opt.also || []).forEach(a => { if(!meaningOf(a)) lookUp(a, () => { if(G === WM.game) renderWordViews(false); }); });
  renderWordViews(true);
  if(WM.mode === 'dock' && !G.over && $('result').classList.contains('hidden')){ clearTimeout(WM.timer); el.classList.add('hidden'); return; }   // the docked card shows it — no pop-up (after the game the pop-up shows over the result)
  const paint = r => { if(WM.cur !== w) return;
    $('wc-word').textContent = w; $('wc-emo').textContent = (r && r.e) || '📖';
    $('wc-syl').textContent = (window.WordMeanings ? WordMeanings.syllables(w) : w) + ' · ' + syllableCount(w) + ' syllable' + (syllableCount(w) > 1 ? 's' : '');
    $('wc-m').textContent = r ? (r.base ? '(' + w + ' comes from ' + r.base + ') ' : '') + r.m : (r === undefined ? '📖 Looking it up…' : 'A real word — ask a grown-up what it means!');
    $('wc-ex').textContent = r && r.x ? '“' + r.x + '”' : '';
    $('wc-by').textContent = opt.by ? '✏️ played by ' + opt.by : '';
    $('wc-more').innerHTML = (opt.also || []).map(a => '<button class="wc-chip" data-w="' + a + '">also: ' + a + '</button>').join('');
    $('wc-more').querySelectorAll('.wc-chip').forEach(b => b.onclick = ev => { ev.stopPropagation(); wordCard(b.dataset.w, {pin: true}); });
  };
  const r = meaningOf(w); paint(r === null ? undefined : r);
  if(!r) lookUp(w, x => paint(x));
  el.classList.remove('mini'); placeCard();
  el.classList.remove('hidden'); el.classList.toggle('pin', WM.pinned); clearTimeout(WM.timer); clearTimeout(WM.miniT);
  if(!WM.pinned){
    if(el.classList.contains('athand') && myTurnNow()){ WM.miniT = setTimeout(() => { if(!WM.pinned && !el.classList.contains('hidden')){ el.classList.add('mini'); placeCard(); } }, 2000); WM.timer = setTimeout(() => hideCard(), 9000); }
    else WM.timer = setTimeout(() => hideCard(), 4500);
  }
}
// lc-2: phones + tablets (no side dock) → the card covers the hand (bottom edge = the rack's bottom); as a mini strip it sits just above the hand.
function myTurnNow(){ return !!(G && !G.over && cur() && !cur().bot && $('result').classList.contains('hidden')); }
function placeCard(){
  const el = $('wcard'), rk = $('rack'), phone = WM.mode !== 'dock' && $('result').classList.contains('hidden') && !$('scr-play').classList.contains('hidden');
  el.classList.toggle('athand', phone); if(!phone){ el.style.bottom = ''; el.classList.remove('mini'); return; }
  const r = rk.getBoundingClientRect(); let b = innerHeight - (el.classList.contains('mini') ? r.top - 6 : r.bottom);
  b = Math.max(8, Math.min(innerHeight - el.offsetHeight - 8, b)); el.style.bottom = Math.round(b) + 'px';
}
window.addEventListener('resize', () => { if(!$('wcard').classList.contains('hidden')) placeCard(); });
function hideCard(force){ if(WM.pinned && !force) return; WM.pinned = false; clearTimeout(WM.timer); clearTimeout(WM.miniT); $('wcard').classList.add('hidden'); }
function syllableCount(w){ const s = window.WordMeanings ? WordMeanings.syllables(w) : w; if(s.includes('·')) return s.split('·').length; const m = w.toLowerCase().replace(/e$/, '').match(/[aeiouy]+/g); return Math.max(1, m ? m.length : 1); }
function speakWord(w){ try{ if(!window.speechSynthesis) return; const r = meaningOf(w); speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(w.toLowerCase() + '. ' + (r && r.m ? r.m : '')); u.rate = 0.9; speechSynthesis.speak(u); }catch(e){} }
$('wcard').addEventListener('click', e => { if(e.target.closest('#wc-x')){ hideCard(true); return; } if(e.target.closest('#wc-say')){ speakWord(WM.cur); return; } if(e.target.closest('.wc-chip')) return; if($('wcard').classList.contains('mini')){ clearTimeout(WM.miniT); $('wcard').classList.remove('mini'); WM.pinned = true; $('wcard').classList.add('pin'); clearTimeout(WM.timer); placeCard(); return; } WM.pinned = !WM.pinned; $('wcard').classList.toggle('pin', WM.pinned); clearTimeout(WM.timer); if(!WM.pinned) WM.timer = setTimeout(() => hideCard(), 2500); });
function learnedList(g){ return g.learned ? [...g.learned.values()] : []; }
function learnedHtml(g){
  const list = learnedList(g); if(!list.length) return '';
  const qz = list.filter(o => { const r = meaningOf(o.w); return r && r.m; }).length >= 3;
  return '<div class="learned"><h4>📖 Words I learned (' + list.length + ')</h4><div class="lw">' + list.slice(0, 16).map(o => { const r = meaningOf(o.w); return '<button class="lw-chip" data-w="' + o.w + '">' + ((r && r.e) || '📖') + ' ' + o.w + '</button>'; }).join('') + '</div>' +
    (qz ? '<div class="res-btns" style="margin-top:8px"><button class="btn soft sp-btn sp-secondary" id="b-quiz">🧠 Word quiz (+⭐)</button></div>' : '') + '</div>';
}
function learnedWire(g){ document.querySelectorAll('.lw-chip').forEach(b => b.onclick = () => wordCard(b.dataset.w, {pin: true})); if($('b-quiz')) $('b-quiz').onclick = () => startQuiz(g); }
function saveJournal(g){
  const list = learnedList(g); if(!list.length) return;
  const humans = g.players.filter(P => !P.bot), pack = o => { const r = meaningOf(o.w) || {}; return {w: o.w, m: r.m || '', e: r.e || ''}; };
  humans.forEach(P => { const mine = g.L.together ? list.filter(o => o.by.includes(P.name)) : list; if(!mine.length) return;
    try{ google.script.run.withFailureHandler(() => {}).saveWordJournal(P.name, mine.slice(0, 40).map(pack)); }catch(e){} });
}
function startQuiz(g){
  const pool = learnedList(g).map(o => meaningOf(o.w)).filter(r => r && r.m), seenM = new Set(), uniq = pool.filter(r => !seenM.has(r.m) && seenM.add(r.m));
  if(uniq.length < 3) return; const qs = shuffle(uniq.slice()).slice(0, 3); let k = 0, right = 0;
  const box = $('sheet-card'), sheet = $('sheet'); sheet.style.zIndex = '450';
  const ask = () => {
    if(k >= qs.length) return done();
    const q = qs[k], opts = shuffle([q].concat(shuffle(uniq.filter(r => r !== q)).slice(0, 2)));
    box.innerHTML = '<h3>🧠 Word quiz ' + (k + 1) + ' / ' + qs.length + '</h3><p class="qz-q">What does <b>' + q.w + '</b> mean?</p><div class="qz-opts">' + opts.map((o, i) => '<button class="qz-opt" data-i="' + i + '"><span>' + (o.e || '📖') + '</span>' + UI.esc(o.m) + '</button>').join('') + '</div>';
    sheet.classList.remove('hidden'); say('What does ' + q.w.toLowerCase() + ' mean?');
    box.querySelectorAll('.qz-opt').forEach(b => b.onclick = () => { if(box.dataset.lock === '1') return; box.dataset.lock = '1'; const o = opts[Number(b.dataset.i)], good = o === q;
      if(good){ right++; b.classList.add('ok'); UISound.play('success'); confetti(['⭐', '🧠', '📖'], 14); } else { b.classList.add('bad'); UISound.play('error'); box.querySelectorAll('.qz-opt')[opts.indexOf(q)].classList.add('ok'); }
      setTimeout(() => { box.dataset.lock = ''; k++; ask(); }, FX ? 1200 : 30); });
  };
  const done = () => {
    box.innerHTML = '<h3>🧠 Quiz done!</h3><div class="big" style="font-size:2.4rem">' + ('⭐'.repeat(right) || '🙂') + '</div><p class="qz-q">' + right + ' of ' + qs.length + ' right' + (right ? ' — +' + right + ' ⭐ bonus!' : ' — try again next game!') + '</p><div class="res-btns"><button class="btn sp-btn sp-primary" id="qz-close">OK</button></div>';
    $('qz-close').onclick = () => { closeSheet(); sheet.style.zIndex = ''; }; if(right){ say('Great! ' + right + ' stars!'); try{ google.script.run.withFailureHandler(() => {}).saveFeats(S.player, GAME_ID, {quizStars: right}); }catch(e){} }
    $('b-quiz') && ($('b-quiz').disabled = true);
  };
  ask();
}
function party(text){ const p = document.createElement('div'); p.className = 'praise'; p.textContent = text; document.body.appendChild(p); setTimeout(() => p.remove(), 1600); }
function floatText(el, text){ if(!el) return; const r = el.getBoundingClientRect(), s = document.createElement('div'); s.className = 'float'; s.textContent = text; s.style.cssText = 'left:' + (r.left + r.width / 2 - 16) + 'px;top:' + (r.top - 8) + 'px'; document.body.appendChild(s); setTimeout(() => s.remove(), 1000); }
let bannerTimer = 0;
function showBanner(text, kind){ if(G && G.lx && G.lx.role === 'host') Link.send('wbban', {text, kind}, {sure: true}); const b = $('banner'); b.textContent = text; ['gold', 'bad', 'bot'].forEach(k => b.classList.toggle(k, kind === k)); b.classList.add('on'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 2000); }

/* ================= SAVE ================= */
const PENDING_KEY = 'sp_wordboard_pending';
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
/* 📣 CHEERSQUAD (cs-3b) START — the crowd beside the board (CheerSquad.html, 📣 Cheer chat; same method as Chess / Checkers). Don't remove: the Cheer chat re-applies it. */
function cheerTaken(){ return Array.from(document.querySelectorAll('#gbar, #board-wrap, #side > *, .top-btn')); }
function cheerMount(){
  if(!window.Cheer || !G) return; Cheer.unmount(); const box = $('scr-play');
  if(Math.min(innerWidth, innerHeight) < 500) return;   // 🔘 gb-1 (Aowu 09:53): no crowd on phones — the board + hand need the room (✨ polish chat, 📣 Cheer chat told)
  Cheer.mount(box, {game: 'lettercraft', players: G.players.map((p, i) => ({name: p.name, side: i, human: !p.bot})), me: {name: S.player}, family: (S.players || []).map(p => p.Name), avatars: S.avatars || {}, mode: 'overlay',
    zones: () => Cheer.freeZones(box, cheerTaken), avoid: cheerTaken,
    clear: b => { const B = box.getBoundingClientRect(), F = $('board-wrap').getBoundingClientRect(), l = F.left - B.left, t = F.top - B.top; return !(b.r > l - 3 && b.l < l + F.width + 3 && b.b > t - 3 && b.t < t + F.height + 3); }});
}
function cheerPlay(P, j){ if(!window.Cheer || !Cheer.active() || !G) return; const i = G.players.indexOf(P);
  Cheer.react(j.bingo || j.score >= BIG_PLAY ? 'big' : 'goal', {side: i}); }
function cheerEnd(why){ if(!window.Cheer || !Cheer.active() || !G) return; Cheer.hush(false); const ps = G.players, hs = ps.filter(p => !p.bot);
  if(why === 'hardcore') return Cheer.react('lose', {side: 0});
  const top = Math.max.apply(null, ps.map(p => p.score)), tops = ps.filter(p => p.score === top);
  if(tops.length > 1) return Cheer.react('goal', {side: -1});   /* a tie: everyone claps */
  if(!tops[0].bot) Cheer.react('win', {side: ps.indexOf(tops[0])}); else Cheer.react('lose', {side: ps.indexOf(hs[0])}); }
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(!at) return; at.parentNode.insertBefore(c, at); at.parentNode.insertBefore(cap, at); }, 900); }   /* the buttons row may sit in a wrapper (Lettercraft) */
/* 📣 CHEERSQUAD END */
function showResult(html){ $('result-card').innerHTML = html; $('result').classList.remove('hidden'); cheerFaces(); /* 📣 cs-3b */ }
function hideResult(){ $('result').classList.add('hidden'); }
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pick(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 p1a: ◀ Back = where you came from (Gameroom if we don't know)
window.feedbackContext = () => ({page: 'Lettercraft', game: GAME_ID, level: G ? (G.L.name) : ''});

/* ================= BOOT ================= */
function boot(){
  UI.loading(GAME_ID);
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {}; S.meanings = d.meanings || {}; S.letterSkins = d.letterSkins || {}; Object.keys(S.meanings).forEach(k => { if(/^[A-Z]{2,15}$/.test(k) && !KID_SKIP.has(k) && !DICT.has(k)){ DICT.add(k); EXTRA_WORDS.add(k); } });   // r31: words in the Word Meanings tab are real words
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();

/* 📡 LINK (lk-3a): 🔤 Lettercraft on 2–4 own devices (LinkKit). The host's device runs the game; guests see the board + ONLY their own rack. */
/* 📺 lk-5c Room hostess: the host device can be the TV — then it holds NO player (G.lx.seat = -1, no rack): every player is a guest,
   the TV checks every word, shows the board + scores + whose turn, and calls the next player; ▶ Start / 🔁 also from the first player (Link.ask). */
const LX = {wired: false, lobby: null, pending: null, cfg: null, autoT: 0, talk: {}};
const LX_TALK = ['Hmm… 🤔', 'I’ve got an idea! 💡', 'Don’t peek! 🙈', 'Which letter… 🔤', 'Almost ready! ⏳', 'This one’s big! 🌟', 'Shh, thinking… 🤫', 'Watch this! 😎', 'Wait for it… ⌛', 'Ooh, a ×3 square! ✨', 'Hello everyone! 👋', 'So many letters! 😵'];
function lxSend(kind, d){ if(!G || !G.lx) return; G.lx.sent = true; setActs(false); setMsg('<span class="ui-spin a-bounce">📨</span> Sending to the host…', ''); Link.send(kind, Object.assign({tn: G.lx.tn}, d), {sure: true}); }
function lxSeatOf(lseat){ return G && G.lx ? G.lx.seats.findIndex(x => x.lseat === lseat) : -1; }
function lxAv(cv, p){ const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); drawPreviewCanvas(cv, myAvatar(p.name), {name: p.name, t: 1}); }
function lxCloseLobby(){ if(LX.lobby && LX.lobby.close) LX.lobby.close(); LX.lobby = null; }
function lxIdle(){ try{ if(window.Link && Link.status() !== 'idle') Link.leave(); }catch(e){} }
function lxChoose(){
  const card = $('sheet-card');
  card.innerHTML = '<div class="big" style="font-size:2.4rem">📡</div><h2>Own devices</h2><div class="lbl">Each player on their own phone, tablet or computer — same Wi-Fi or 🌍 anywhere. Your letters stay on your screen.</div>' +
    '<div class="lx-pick"><button class="btn sp-btn sp-primary" id="lx-host" data-sound="pop">🎮 Host and play<small>this device plays too</small></button>' +
    '<button class="btn sp-btn sp-primary lx-tv" id="lx-tv" data-sound="pop">📺 Room hostess<small>this screen shows the board on the TV · everyone plays on their own device</small></button>' +
    '<button class="btn sp-btn sp-secondary" id="lx-join" data-sound="pop">🔗 Join friends</button><button class="btn soft sp-btn sp-ghost" id="lx-x" data-sound="none">Cancel</button></div>';
  $('lx-host').onclick = () => { closeSheet(); lxHostPick(false); }; $('lx-tv').onclick = () => { closeSheet(); lxHostPick(true); };
  $('lx-join').onclick = () => { closeSheet(); lxJoin(); }; $('lx-x').onclick = closeSheet;
  $('sheet').classList.remove('hidden');
}
function lxHostPick(tv){   // 📺 lk-5c: tv = Room hostess
  lxWire(); lxCloseLobby(); lxIdle(); LX.tv = !!tv;
  const card = $('sheet-card');
  const draw = () => {
    card.innerHTML = '<div class="big" style="font-size:2.4rem">' + (LX.tv ? '📺' : '📡') + '</div><h2>' + (LX.tv ? 'Room hostess' : 'Host a game') + '</h2><div class="lbl">' + (LX.tv ? 'This screen shows the board — the players join on their own devices' : 'Friends join on their own device with the room number') + '</div>' +
      '<div class="lbl">Words</div><div class="opt-row" id="lxh-diff">' + Object.keys(TOGETHER).map(k => '<button class="o' + (together.diff === k ? ' on' : '') + '" data-k="' + k + '">' + TOGETHER[k].name + ' · ' + TOGETHER[k].blurb + '</button>').join('') + '</div>' +
      '<div class="lbl">Board</div><div class="opt-row" id="lxh-size"><button class="o' + (together.size === 11 ? ' on' : '') + '" data-s="11">11 × 11</button><button class="o' + (together.size === 15 ? ' on' : '') + '" data-s="15">15 × 15</button></div>' +
      '<div class="lbl">Rounds</div><div class="opt-row" id="lxh-rounds">' + [5, 8, 12].map(r => '<button class="o' + (together.rounds === r ? ' on' : '') + '" data-r="' + r + '">' + r + '</button>').join('') + '</div>' +
      '<div class="res-btns"><button class="btn sp-btn sp-primary" id="lxh-go">' + (LX.tv ? '📺' : '📡') + ' Open the room</button><button class="btn soft sp-btn sp-secondary" id="lxh-x">Cancel</button></div>';
    card.querySelectorAll('#lxh-diff .o').forEach(b => b.onclick = () => { together.diff = b.dataset.k; draw(); });
    card.querySelectorAll('#lxh-size .o').forEach(b => b.onclick = () => { together.size = Number(b.dataset.s); draw(); });
    card.querySelectorAll('#lxh-rounds .o').forEach(b => b.onclick = () => { together.rounds = Number(b.dataset.r); draw(); });
    $('lxh-go').onclick = () => { savePrefs(); closeSheet(); lxOpenHost(LX.tv); };
    $('lxh-x').onclick = closeSheet;
  };
  draw(); $('sheet').classList.remove('hidden');
}
function lxLabel(){ const d = TOGETHER[together.diff] || {}; return '🔤 ' + (d.name || 'Words') + ' · ' + together.size + '×' + together.size + ' · ' + together.rounds + ' rounds'; }
async function lxOpenHost(tv){
  lxWire(); lxCloseLobby();
  $('lx-sub').textContent = tv ? '📺 This screen is the Room hostess — players tap 🔗 Join friends on their own devices' : 'Friends tap 🔗 Join friends on their own phone or tablet — same Wi-Fi or 🌍 anywhere'; showScreen('link'); lxAlt('');
  const el = $('lx-lobby'); el.innerHTML = '<div class="lk"><div class="lk-msg"><span class="ui-spin a-bob">' + (tv ? '📺' : '📡') + '</span> Opening the room<span class="lk-dots"></span></div></div>';
  try{ await Link.host({game: 'Lettercraft', name: S.player, seats: 4, hostess: !!tv, page: 'wordboard', label: lxLabel() + (tv ? ' · 📺 on the TV' : '')}); }
  catch(e){ UISound.play('error'); el.innerHTML = '<div class="lk"><div class="lk-msg bad">😕 ' + UI.esc((e && e.message) || 'Could not open the room') + '</div></div>'; return; }
  if($('scr-link').classList.contains('hidden')) return;
  LX.lobby = Link.lobby(el, {title: lxLabel(), url: WEBAPP_URL + '?page=wordboard', minPlayers: 2, name: S.player, drawAvatar: lxAv, kind: 'word-board', onStart: lxHostGo});
}
function lxJoin(code){
  lxWire(); lxCloseLobby(); lxIdle();
  $('lx-sub').textContent = 'Same Wi-Fi as the host — or 🌍 anywhere'; showScreen('link'); lxAlt('host');
  LX.lobby = Link.lobby($('lx-lobby'), {title: '🔤 Lettercraft', name: S.player, drawAvatar: lxAv, code: code || undefined, kind: 'word-board', onJoined: () => { UISound.play('success'); lxAlt(''); }});
}
function lxAlt(k){ const a = $('lx-alt'); if(!a) return; a.innerHTML = k === 'host' ? '<button class="btn soft sp-btn sp-secondary" data-sound="pop" onclick="lxHostPick()">📡 Host a game instead</button>' : ''; }
function lxExit(){
  lxIdle(); lxCloseLobby(); clearTimeout(LX.autoT); LX.cfg = null;
  const o = document.querySelector('.lx-over'); if(o) o.remove();
  if(G && G.lx){ clearInterval(timerId); G = null; hideResult(); closeSheet(); }
  $('acts').classList.remove('lx-tvhide'); $('rack').classList.remove('lx-tvrack');   // 📺 lk-5c
  renderMenu(); showScreen('menu');
}
function lxLeavePlay(){
  if(G.over){ lxExit(); return; }
  const host = G.lx.role === 'host';
  UI.confirm({icon: '◀', title: host ? 'End the game for everyone?' : 'Leave this game?', body: host ? (G.lx.tv ? '📺 You are the Room hostess — the game stops on every device.' : 'You are the host — the game stops on every device.') : '🤖 The robot plays your turns until you come back.', okText: host ? 'End game' : 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) lxExit(); });
}
// ---- host ----
function lxHostGo(){
  const tv = !!(Link.hostess && Link.hostess());   // 📺 lk-5c: the TV holds no player
  const list = Link.players().filter(p => p.name && p.on && !p.screen).sort((a, b) => a.seat - b.seat).slice(0, 4);
  if(list.length < 2){ UISound.play('error'); UI.toast(tv ? '📺 Wait for 2 players to join' : '📡 Wait for a friend to join'); return; }
  LX.cfg = {id: Date.now().toString(36), diff: together.diff, size: together.size, rounds: together.rounds, theme, host: S.player, tv, seats: list.map(p => ({name: p.name, lseat: p.seat}))};
  lxCloseLobby(); hideResult(); closeSheet(); const o = document.querySelector('.lx-over'); if(o) o.remove();
  LX.pending = {role: 'host', seat: tv ? -1 : 0, tn: 0, seats: LX.cfg.seats.map(x => Object.assign({}, x)), id: LX.cfg.id, tv};
  startGame('together');                                   // the engine runs here; G.lx comes from LX.pending
  G.players.forEach((P, k) => { if(k !== G.lx.seat) Link.send('wbgo', {cfg: LX.cfg, seat: k, st: lxState(k)}, {sure: true, to: G.lx.seats[k].lseat}); });
}
function lxState(k){
  return {id: G.lx.id, tn: G.lx.tn, cur: G.cur, round: G.round, passes: G.passes, bagN: G.bag.length, over: G.over, last: G.last,
    cells: G.cells.map(c => c ? {as: c.as, pts: c.pts, blank: !!c.blank, by: c.by} : null),
    players: G.players.map(P => ({name: P.name, score: P.score, eqs: P.eqs, best: P.best, bingos: P.bingos, away: !!P.away})),
    rack: (G.players[k] || {rack: []}).rack.map(x => ({id: x.id, t: x.t}))};
}
function lxSync(){ if(!G || !G.lx || G.lx.role !== 'host') return; G.players.forEach((P, k) => { if(k !== G.lx.seat) Link.send('wbstate', lxState(k), {sure: true, to: G.lx.seats[k].lseat}); }); }
function lxBeginTurn(first){
  $('acts').classList.toggle('lx-tvhide', G.lx.seat < 0);   // 📺 lk-5c: no play buttons on the TV
  const P = cur(), mine = G.cur === G.lx.seat, tv = G.lx.seat < 0; G.pend = []; G.sel = null; G.swap = null; G.cursor = null; G.ghost = []; G.lx.sent = false;
  if(G.lx.role === 'host'){ G.lx.tn++; lxSync(); }
  updateScores(); hudTick(); paintAll(); renderRack(false); setActs(mine);
  $('turnbar').textContent = mine ? '🎲 Your turn, ' + P.name : (tv ? '🎲 ' : '✏️ ') + P.name + (tv ? '’s turn' : ' is thinking…');
  if(mine){ setMsg(G.cells.every(c => !c) ? '⭐ Start over the star in the middle — make a word like CAT' : 'Tap a letter, then a square', ''); say(P.name + ', your turn!'); }
  else if(tv){ setMsg('📺 ' + UI.esc(P.name) + ' is making a word on their own device…', ''); say(P.name + ', your turn!'); }   // 📺 lk-5c: the TV calls the next player
  else setMsg('✏️ ' + UI.esc(P.name) + ' is thinking — plan your next word!', '');
  if(first) showBanner('📡 ' + G.players.length + ' devices — make the best words!', 'gold');
  clearTimeout(LX.autoT);
  if(G.lx.role === 'host' && !mine && P.away) LX.autoT = setTimeout(() => lxAuto(P), LX_AUTO_MS);
}
const LX_AUTO_MS = window.LX_AUTO_MS || 20000;
function lxAuto(P){ if(!G || G.over || cur() !== P || !P.away || G.busy) return; showBanner('🤖 Robot plays for ' + P.name, 'bot'); botTurn(true); }
function lxHostMove(kind, d, lseat){
  const k = lxSeatOf(lseat), P = G && G.players[k];
  const bad = msg => Link.send('wbbad', {msg}, {sure: true, to: lseat});
  if(!P || G.over) return;
  if(k !== G.cur || G.busy) return bad('It is not your turn yet');
  if(d && d.tn != null && d.tn !== G.lx.tn) return bad('That turn is over');
  clearTimeout(LX.autoT);
  if(kind === 'pass'){ G.passes++; showBanner('⏭ ' + P.name + ' passed', ''); endTurn(); return; }
  if(kind === 'swap'){ const ids = (d.ids || []).filter(id => P.rack.some(r => r.id === id)); if(!ids.length || !G.bag.length) return bad('Nothing to swap');
    doSwap(P, ids); showBanner('🔁 ' + P.name + ' swapped ' + ids.length + ' tile' + (ids.length === 1 ? '' : 's'), 'gold'); G.passes = 0; endTurn(); return; }
  // play: every tile must be in their rack, on an empty square
  const used = new Set(), pend = [];
  for(const q of (d.pend || [])){
    const x = P.rack.find(r => r.id === q.id && !used.has(r.id)), i = Number(q.i);
    if(!x || !(i >= 0 && i < G.N * G.N) || G.cells[i] || pend.some(z => z.i === i)) return bad('Those letters do not fit — try again');
    if(x.t !== '?' && x.t !== q.t) return bad('Those letters do not fit — try again');
    used.add(x.id); pend.push({i, id: x.id, t: x.t === '?' ? String(q.t || 'A').toUpperCase().slice(0, 1) : x.t, blank: x.t === '?'});
  }
  const j = judge(pend, P.rack.length);
  if(!j.ok && j.unknown && !G.asked.has(j.unknown)){   // a real word outside our list? the server's big dictionary decides
    G.asked.add(j.unknown); G.busy = true;
    const done = r => { G.busy = false; if(r && r.ok){ DICT.add(j.unknown); EXTRA_WORDS.add(j.unknown); } lxHostMove(kind, d, lseat); };
    try{ google.script.run.withSuccessHandler(done).withFailureHandler(() => done(null)).checkWord(j.unknown); }catch(e){ done(null); }
    return;
  }
  if(!j.ok) return bad((j.text ? j.text + ' — ' : '') + j.msg);
  G.pend = pend; commit(P, pend, j);
}
// ---- guest ----
function lxGuestStart(d){
  if(!d || !d.cfg) return;
  LX.cfg = d.cfg; lxCloseLobby(); hideResult(); closeSheet(); const o = document.querySelector('.lx-over'); if(o) o.remove();
  together.diff = d.cfg.diff; together.size = d.cfg.size; together.rounds = d.cfg.rounds;
  const keepTheme = theme; theme = THEMES[d.cfg.theme] ? d.cfg.theme : theme;
  LX.pending = {role: 'guest', seat: d.seat, tn: -1, seats: d.cfg.seats, id: d.cfg.id, bagN: 0, tv: !!d.cfg.tv};
  startGame('together'); theme = keepTheme;
  G.bag = []; lxApply(d.st);
}
function lxApply(st){
  if(!G || !G.lx || !st || st.id !== G.lx.id) return;
  if(G.busy || G.running){ clearTimeout(LX.applyT); LX.applyT = setTimeout(() => lxApply(st), 250); return; }   // let the word finish flying in
  G.cells = st.cells.map(c => c ? Object.assign({}, c) : null); G.last = st.last || [];
  G.cur = st.cur; G.round = st.round; G.passes = st.passes; G.lx.bagN = st.bagN;
  st.players.forEach((q, k) => { const P = G.players[k]; if(!P) return; Object.assign(P, {score: q.score, eqs: q.eqs, best: q.best, bingos: q.bingos, away: q.away}); });
  G.players.forEach((P, k) => { if(k !== G.lx.seat) P.rack = []; });   // other racks stay on their own devices
  const me = G.players[G.lx.seat]; me.rack = st.rack.map(x => ({id: x.id, t: x.t}));
  if(st.tn !== G.lx.tn){ G.lx.tn = st.tn; lxBeginTurn(false); } else { paintAll(); updateScores(); hudTick(); renderRack(false); }
}
// ---- every device: a word was played (the host already checked it) ----
function lxPlayed(d){
  if(!G || !G.lx || G.lx.role !== 'guest' || !d || !d.j) return;
  G.cur = d.seat; const P = G.players[d.seat];
  if(d.seat === G.lx.seat) G.pend = [];   // my tiles: the host's copy is the truth
  commit(P, d.pend, d.j);
}
function lxBubble(g, x, w, h, tnow, P){
  const st = LX.talk[P.name] || (LX.talk[P.name] = {i: Math.floor(Math.random() * LX_TALK.length), at: tnow});
  if(tnow - st.at > 4.2){ st.i = (st.i + 1 + Math.floor(Math.random() * 3)) % LX_TALK.length; st.at = tnow; }
  if(tnow - st.at > 3.4) return;                            // a short pause between lines
  const text = LX_TALK[st.i]; g.save(); g.font = '700 12px Fredoka, system-ui, sans-serif';
  const tw = g.measureText(text).width + 14, bx = Math.max(4, Math.min(w - tw - 4, x + 14)), by = 4;
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.strokeStyle = 'rgba(0,0,0,0.18)';
  g.beginPath(); if(g.roundRect) g.roundRect(bx, by, tw, 20, 10); else g.rect(bx, by, tw, 20); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(bx + 8, by + 20); g.lineTo(bx + 4, by + 27); g.lineTo(bx + 15, by + 20); g.fill();
  g.fillStyle = '#2B1B5A'; g.textBaseline = 'middle'; g.fillText(text, bx + 7, by + 10.5); g.restore();
}
function lxResultBtns(g){
  if(g.lx.role === 'host') return '<div class="res-btns"><button class="btn sp-btn sp-primary" id="b-again">🔁 Play again</button><button class="btn soft sp-btn sp-secondary" id="b-menu">🚪 End the room</button></div>';
  if(g.lx.tv && Link.captain && Link.captain() === Link.seat()) return '<div class="res-btns"><button class="btn sp-btn sp-primary" id="b-again">🔁 Play again</button><button class="btn soft sp-btn sp-secondary" id="b-menu">🚪 Leave</button></div>';   // 📺 the first player may start the next game
  return '<div class="note lk-wait">⏳ ' + UI.esc(g.lx.tv ? 'The TV or the first player' : ((LX.cfg && LX.cfg.host) || 'The host')) + ' can start the next game<span class="lk-dots"></span></div><div class="res-btns"><button class="btn soft sp-btn sp-secondary" id="b-menu">🚪 Leave</button></div>';
}
function lxResultWire(g){ const a = $('b-again'); if(a) a.onclick = () => { if(g.lx.role !== 'host'){ UI.busy(a, 'word-board', 'Asking the TV…'); Link.ask('again'); } else lxHostGo(); }; $('b-menu').onclick = () => lxExit(); }
function lxEnded(msg){
  if(G){ G.over = true; clearTimeout(LX.autoT); }
  const o = document.createElement('div'); o.className = 'lx-over';
  o.innerHTML = '<div class="result-card"><div class="big">📡</div><h2>' + UI.esc(msg) + '</h2><div class="note">Thanks for playing together!</div><div class="res-btns"><button class="btn sp-btn sp-primary" data-sound="none" onclick="lxExit()">◀ Lettercraft</button></div></div>';
  document.body.appendChild(o);
}
function lxWire(){
  if(LX.wired || !window.Link) return; LX.wired = true;
  // guest side
  Link.on('wbgo', d => { if(Link.isHost() || !d || !d.cfg) return; if(G && G.lx && G.lx.id === d.cfg.id){ lxApply(d.st); return; } lxGuestStart(d); });
  Link.on('wbstate', st => { if(!Link.isHost()) lxApply(st); });
  Link.on('wbplayed', d => { if(!Link.isHost()) lxPlayed(d); });
  Link.on('wbban', d => { if(!Link.isHost() && d && G && G.lx) showBanner(d.text, d.kind); });
  Link.on('wbbad', d => { if(Link.isHost() || !G || !G.lx) return; G.lx.sent = false; G.busy = false; setActs(true);
    G.pend.forEach(p => { p.state = 'bad'; }); paintAll(); setMsg('❌ ' + UI.esc((d && d.msg) || 'Not right'), 'bad'); UISound.play('error'); });
  Link.on('wbend', d => { if(Link.isHost() || !G || !G.lx || G.over) return; if(d && d.st) { G.busy = false; G.running = false; lxApply(d.st); } finishGame('rounds'); });
  Link.on('hostleft', e => { if(Link.isHost()) return; if(!G && $('scr-link').classList.contains('hidden')) return;
    UISound.play('bump'); lxEnded(e && e.reason === 'lost' ? '📶 Lost the link to ' + ((LX.cfg && LX.cfg.host) || 'the host') : '👋 ' + ((LX.cfg && LX.cfg.host) || 'The host') + ' ended the game'); });
  // host side
  ['play', 'swap', 'pass'].forEach(k => Link.on('wb' + k, (d, lseat) => { if(Link.isHost() && G && G.lx) lxHostMove(k, d || {}, lseat); }));
  Link.on('lk:ask', (d, lseat) => { if(!Link.isHost() || !d || d.what !== 'again' || !G || !G.lx || !G.over || !G.lx.tv) return;   // 📺 lk-5c: the first player's 🔁
    if(Link.captain() === lseat) lxHostGo(); });
  Link.on('leave', e => { if(!Link.isHost() || !G || !G.lx || G.over) return; const k = lxSeatOf(e.seat), P = G.players[k]; if(!P) return; P.away = true;
    showBanner('📶 ' + P.name + ' dropped out — 🤖 the robot plays their turns until they come back', 'bad'); lxSync();
    if(G.cur === k){ clearTimeout(LX.autoT); LX.autoT = setTimeout(() => lxAuto(P), LX_AUTO_MS); } });
  const back = e => { if(!Link.isHost() || !G || !G.lx || !LX.cfg) return; const k = lxSeatOf(e.seat), P = G.players[k]; if(!P) return;
    if(P.away){ P.away = false; showBanner('👋 ' + P.name + ' is back!', 'gold'); UISound.play('success'); if(G.cur === k) clearTimeout(LX.autoT); }
    Link.send('wbgo', {cfg: LX.cfg, seat: k, st: lxState(k)}, {sure: true, to: e.seat}); };
  Link.on('rejoin', back); Link.on('join', back);
  addEventListener('pagehide', () => { try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} });
}
// the host tells everyone when the game ends (final scores)
(function(){ const f = finishGame; finishGame = function(why, bad){ if(G && G.lx && G.lx.role === 'host' && !G.over){ const k0 = G.lx.seat; G.players.forEach((P, k) => { if(k !== k0) Link.send('wbend', {why, st: Object.assign(lxState(k), {over: true})}, {sure: true, to: G.lx.seats[k].lseat}); }); } return f.apply(this, arguments); }; })();
// 🔗 QR / waiting room: ?page=wordboard&link=<code> → the number pad (the waiting room leaves it empty to type)
function lxUrlCode(cb){
  try{ if(window.google && google.script && google.script.url && google.script.url.getLocation){ google.script.url.getLocation(l => cb(((l && l.parameter) || {}).link || '')); return; } }catch(e){}
  try{ cb(new URLSearchParams(location.search).get('link') || ''); }catch(e){ cb(''); }
}
/* 📡 END LINK (lk-3a) */

/* ✨ MODE SPOTLIGHT (modes-3): ?mode=<id> opens this game straight in that mode after the player pick · "✨ Also try" on the start page · started modes → UI.modeTried */
const MS_GAME = 'word-board';
function msOpen(id){
  if(id === 'together') openTogether();
  if(id === 'lhost') lxHostPick(); if(id === 'ljoin') lxJoin();   // 📡 lk-3a
  if(id === 'ltv') lxHostPick(true);   // 📺 lk-5f: from the Gameroom's 📺 Room hostess
}
function msNow(){ return ''; }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startGame', lvl => lvl === 'together' ? 'together' : '');
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  lxUrlCode(c => { c = String(c || '').replace(/[^0-9a-f]/gi, '').slice(0, 4); if(c.length === 4) lxJoin(c); });   // 📡 lk-3a
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */
