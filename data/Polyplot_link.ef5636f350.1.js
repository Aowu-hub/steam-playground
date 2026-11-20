
/* 📡 LINK (lk-pp1): ⬛ Polyplot on own devices — LinkKit plan §50 (📡 Multiplayer chat, Aowu 2026-11-20 07:01 "go").
   Born split: this whole block lives in the part file Polyplot_link (GameParts), loaded the first time a room is used
   (📱 Own devices on the cover, or a ?link=<room> QR). The main file only holds plNeed / plOwn + the ?link hook.
   The room lives on the 🎬 cover (Link.cover): chips 🎮 mode · 🎚️ level · 🗺️ map shape · 🎨 theme · 🤝 2 vs 2.
   2–4 phones (+ a 🤖 when only one person plays a versus mode) · 🛡️ Co-op 1–4 together · 📺 TV + 1 phone = you vs 🤖 (Co-op: you alone).
   Every device builds the SAME map from the start seed (the engine PP is seeded: every random inside it uses M.R). Only ACTIONS travel,
   each with k (shared actions so far) + h (a fingerprint of the board before it):
     (log ops {o, …}; on the wire pp<o>) ppln {e, start, way} a line (+ the 🏃 run route) · ppcard {idx, t} a 🃏 card · ppdoor {e} a 🚪 door · pprep {f} a 🔧 repair ·
     ppbuy {r} a 🛒 card bought · ppbank a 🪙 bank · ppfin the end (a 🤖 with no line left).
   guest → host: the host checks it (right seat, right count + fingerprint, legal) and passes it on; the host's own / 🤖 actions go to everyone.
   Decisions that roll dice only on ONE device (🤖 picks, ⏱️ time-out lines) roll Math.random, not the shared M.R, so every board keeps the same dice.
   Out of step (count / fingerprint differ) → ppask → ppgo = the start settings + the action log; the phone rebuilds the board from the log.
   Your 🃏 cards, 🪙 coins, 🛒 shop, 🚪 door, 🔧 repair only work on YOUR turn on YOUR phone. ↩️ Undo is off in linked games.
   Saves: the host saves feats for everyone (like one-device play). 📡 a phone that drops out → 🤖 plays its seat after LX_AUTO_MS until it is back. */
const PPL = {wired: false, games: 0, viaCover: false};
const PL_AUTO_MS = window.LX_AUTO_MS || 20000;
const PL_KEYS = ['ppln', 'ppcard', 'ppdoor', 'pprep', 'ppbuy', 'ppbank', 'ppfin'];
function plOn(){ return !!(G && G.lx); }
function plIdle(){ try{ if(window.Link && Link.status() !== 'idle') Link.leave(); }catch(e){} }
// ---- the host's room picks (remembered per player) ----
function plGet(k, d){ const v = ls(store('lx_' + k)); return v == null ? d : v; }
function plSet(k, v){ ls(store('lx_' + k), String(v)); }
function plMode(){ const m = plGet('mode', SET.mode || 'classic'); return MODES[m] ? m : 'classic'; }
function plLevel(){ const n = Number(plGet('level', '0')); return n >= 0 && n <= 4 ? n : 0; }
function plShape(){ const s = plGet('shape', SET.shape || 'square'); return PP.SHAPES.indexOf(s) >= 0 ? s : 'square'; }
function plTheme(){ const t = plGet('theme', SET.theme || 'dino'); return THEMES[t] ? t : 'dino'; }
function plTeams(){ return plGet('teams', '0') === '1'; }
function plTiling(lv){ const T = PP.LEVELS[lv].tilings; return T.indexOf(SET.tiling) >= 0 ? SET.tiling : T[0]; }
function plPicks(el){
  const m = plMode(), lv = plLevel(), T = THEMES[plTheme()], L = LEVEL_UI[lv], fort = m === 'fort' || m === 'coop', sh = PP.SHAPE_INFO[plShape()];
  el.innerHTML = '<button class="lkc-chip" data-k="mode" data-sound="none">' + MODES[m].icon + ' ' + MODES[m].name + '</button>' +
    '<button class="lkc-chip" data-k="level" data-sound="none">' + L.emoji + ' ' + PP.LEVELS[lv].name + '</button>' +
    (fort ? '' : '<button class="lkc-chip" data-k="shape" data-sound="none">🗺️ ' + sh[0] + ' ' + UI.esc(sh[1]) + '</button>') +
    '<button class="lkc-chip" data-k="theme" data-sound="none">' + T.icon + ' ' + UI.esc(T.name) + '</button>' +
    (m === 'coop' ? '' : '<button class="lkc-chip" data-k="teams" data-sound="none">' + (plTeams() ? '🤝 2 vs 2 (4 players)' : '👤 Everyone for themselves') + '</button>');
  el.querySelectorAll('.lkc-chip').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.k;
    if(k === 'mode'){ plSet('mode', MODE_KEYS[(MODE_KEYS.indexOf(m) + 1) % MODE_KEYS.length]); if(plMode() === 'coop') UI.toast('🛡️ Co-op: everyone defends one base together'); }
    else if(k === 'level') plSet('level', (lv + 1) % 5);
    else if(k === 'shape'){ const S2 = PP.SHAPES.filter(x => x !== 'letter'); plSet('shape', S2[(S2.indexOf(plShape()) + 1) % S2.length]); }
    else if(k === 'theme') plSet('theme', THEME_KEYS[(THEME_KEYS.indexOf(plTheme()) + 1) % THEME_KEYS.length]);
    else plSet('teams', plTeams() ? '0' : '1');
    UISound.play('tap'); plPicks(el); });
}
function plAv(cv, p){ if(typeof drawPreviewCanvas === 'function') drawPreviewCanvas(cv, myAvatar(p.name), {name: p.name, t: 1}); }
const PP_ROOM = {game: 'Polyplot', title: '⬛ Polyplot', page: 'polyplot', kind: 'polyplot', seats: 4, min: 2, url: WEBAPP_URL + '?page=polyplot', name: () => S.player, av: () => myAvatar(S.player), drawAvatar: (cv, p) => plAv(cv, p),
  label: tv => '⬛ Polyplot · ' + MODES[plMode()].icon + ' ' + MODES[plMode()].name + ' · 2–4 players' + (tv ? ' · 📺 on the TV' : ''),
  how: 'Gameroom → ⬛ Polyplot → 📱 Own devices → 🔗 Join · or scan · 2–4 players · 1 = you vs 🤖 (🛡️ Co-op: on your own)', picks: el => plPicks(el),
  onLink: () => { PPL.viaCover = true; }, onStart: () => { PPL.viaCover = true; plHostGo(); }};
Object.defineProperty(PP_ROOM, 'bot', {get: () => plMode() === 'coop' ? false : () => 'Robot'});   // 📺 + 1 player: "▶ Start vs 🤖 Robot" · 🛡️ Co-op: "▶ Start · 1 player"
// ---- host: start a game for everyone ----
function plHostGo(){
  const tv = !!(Link.hostess && Link.hostess()), m = plMode(), lv = plLevel();
  const list = Link.players().filter(p => p.name && p.on && !p.screen).sort((a, b) => a.seat - b.seat);
  let people = [], lseats = [], me = -1;
  if(tv){ if(!list.length){ UISound.play('error'); UI.toast('📺 Wait for a player to join'); return; } list.slice(0, 4).forEach(p => { people.push(p.name); lseats.push(p.seat); }); }
  else {
    const mine = list.find(p => p.seat === Link.seat()) || {name: S.player, seat: Link.seat()}, others = list.filter(p => p !== mine).slice(0, 3);
    if(!others.length){ UISound.play('error'); UI.toast('📡 Wait for a friend to join'); return; }
    people = [mine.name].concat(others.map(p => p.name)); lseats = ['host'].concat(others.map(p => p.seat)); me = 0;
  }
  const seats = people.map(n => ({name: n, bot: false}));
  if(m !== 'coop' && seats.length < 2){ seats.push({name: 'Robot 1', bot: true}); lseats.push('bot'); }
  const seed = ((Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0) || 1;
  const cfg = {id: Date.now().toString(36), host: S.player, tv, game: PPL.games++, lseats,
    play: {mode: m, level: lv, theme: plTheme(), tiling: plTiling(lv), shape: m === 'fort' || m === 'coop' ? 'square' : plShape(), letter: (S.player || 'A')[0], seats, teams: plTeams() && seats.length === 4 && m !== 'coop', seed}};
  plStart(cfg, me, 'host');
  plSendGo();
}
function plStart(cfg, me, role){
  hideResult(); const o = document.querySelector('.lx-over'); if(o) o.remove(); closeSheet();
  startGame(JSON.parse(JSON.stringify(cfg.play)));
  G.lx = {role, me, id: cfg.id, cfg, lseats: cfg.lseats, tv: !!cfg.tv, away: {}, k: 0, log: []};
  G.M.undos = 0;   // ↩️ no undo in a linked game
  plMarkCards();
}
// ---- the whole game = start settings + the action log; its fingerprint ----
function plHashOf(M){
  const t = [Array.from(M.line).join(','), Array.from(M.owner).join(','), M.cur, M.turn, M.over ? 1 : 0, M.wave || 0, M.evCount || 0,
    M.P.map(p => [p.pts, p.coins, p.cards.join('.'), p.at, p.out ? 1 : 0, p.free || 0].join(':')).join('|'),
    (M.creatures || []).map(c => [c.face, c.caught ? 1 : 0, c.gone ? 1 : 0, c.kind].join(':')).join('|'),
    (M.mons || []).map(x => [x.at, x.hp].join(':')).join('|')].join('#');
  let h = 5381; for(let i = 0; i < t.length; i++) h = (Math.imul(h, 33) + t.charCodeAt(i)) >>> 0; return h.toString(36);
}
function plHash(){ return plHashOf(G.M); }
function plGuests(){ return ((G && G.lx && G.lx.lseats) || []).map((s, i) => ({i, seat: s})).filter(x => x.seat !== 'host' && x.seat !== 'bot' && x.seat != null); }
function plSendGo(only, tries){
  if(!(G && G.lx && G.lx.role === 'host')) return;
  if(G.busy && (tries || 0) < 60){ setTimeout(() => plSendGo(only, (tries || 0) + 1), 150); return; }   // a line is still being drawn: send once it is in
  plGuests().forEach(g => { if(only == null || only === g.seat) Link.send('ppgo', {cfg: G.lx.cfg, you: g.i, log: G.lx.log, k: G.lx.k}, {sure: true, to: g.seat}); });
}
// an action made HERE (me, the host's 🤖, a dropped player's 🤖) → the others; every device counts + logs it
function plOut(o, extra, h){
  if(!plOn()) return;
  const op = Object.assign({}, extra || {}, {o, p: G.M.cur});   // p = whose turn it was (for tests + reading the log)
  if(!G.lxIn) Link.send('pp' + o, Object.assign({id: G.lx.id, k: G.lx.k, h: h == null ? plHash() : h}, extra || {}), {sure: true});
  G.lx.log.push(op); G.lx.k++;
}
// ---- every device: an action from another device ----
const PL_KINDS = {
  ppln: {ok: d => PP.legal(G.M, d.e), run: d => doLine(d.e, d.start == null || d.start < 0 ? null : d.start, d.way || [])},
  ppcard: {ok: d => !!G.M.P[G.M.cur].cards[d.idx], run: d => { const r = PP.playCard(G.M, G.M.cur, d.idx, d.t == null ? undefined : d.t); if(r && r.ok) cardDone(r.card); }},
  ppdoor: {ok: d => PP.canDoor(G.M, d.e), run: d => doDoor(d.e)},
  pprep: {ok: () => G.M.fort, run: d => { const M = G.M; if(PP.repair(M, M.cur, d.f)){ banner('🔧 +1 ❤️', 'good'); handleEvents(PP.takeEvents(M)); } G.ver++; hud(); buildActbar(); }},
  ppbuy: {ok: () => G.M.L.cards, run: d => { const M = G.M, k = PP.buyCard(M, M.cur, d.r); if(k) banner('🃏 ' + M.P[M.cur].name + ' bought ' + PP.CARDS[k].icon + ' ' + PP.CARDS[k].name, 'gold'); PP.takeEvents(M); G.ver++; hud(); buildActbar(); }},
  ppbank: {ok: () => G.M.P[G.M.cur].coins >= PP.PRICE.bank, run: () => { const M = G.M, p = M.P[M.cur]; plOut('bank'); p.coins -= PP.PRICE.bank; p.pts += 1; banner('🪙 ' + p.name + ' banked: +1 point', 'gold'); G.ver++; hud(); buildActbar(); }},
  ppfin: {ok: () => true, run: () => { PP.finish(G.M); endGame(); }}};
function plGot(type, d, seat, tries){
  if(!plOn() || !d || d.id !== G.lx.id || G.over) return;
  if(G.busy && (tries || 0) < 80){ setTimeout(() => plGot(type, d, seat, (tries || 0) + 1), 120); return; }
  const host = G.lx.role === 'host', K = PL_KINDS[type], M = G.M;
  const ok = (!host || G.lx.lseats[M.cur] === seat) && M.cur !== G.lx.me && d.k === G.lx.k && d.h === plHash() && K.ok(d);
  if(!ok){ if(host) plSendGo(seat); else Link.send('ppask', {id: G.lx.id}, {sure: true}); return; }   // out of step: the host's game is the truth
  if(host) plGuests().forEach(g => { if(g.seat !== seat) Link.send(type, d, {sure: true, to: g.seat}); });   // pass it on
  clearTimeout(G.lxBot);
  G.lxIn = true; try{ K.run(d); } finally { if(G) G.lxIn = false; }
}
// ---- rebuild the board from the start settings + the log (a phone out of step, or one that comes back) ----
function plApplyOp(M, op){
  const pi = M.cur, p = M.P[pi];
  if(op.o === 'ln'){ const E = M.edges[op.e]; let start = op.start;
    if(start == null || start < 0 || (start !== E.a && start !== E.b)){ const da = PP.pathTo(M, p.at, E.a).length, db = PP.pathTo(M, p.at, E.b).length; start = da <= db ? E.a : E.b; }
    const end = start === E.a ? E.b : E.a;
    if(M.hunt && !M.fort) PP.runTo(M, pi, start, op.way || []); else p.at = start;
    if(M.fort) PP.grabCoins(M, pi, op.e);
    PP.play(M, op.e); M.P[pi].at = end; }
  else if(op.o === 'card') PP.playCard(M, pi, op.idx, op.t == null ? undefined : op.t);
  else if(op.o === 'door') PP.door(M, op.e);
  else if(op.o === 'rep') PP.repair(M, pi, op.f);
  else if(op.o === 'buy') PP.buyCard(M, pi, op.r);
  else if(op.o === 'bank'){ p.coins -= PP.PRICE.bank; p.pts += 1; }
  else if(op.o === 'fin') PP.finish(M);
  PP.takeEvents(M);
  while(!M.over && M.fort && !PP.legalList(M).length){ PP.pass(M); PP.takeEvents(M); }   // = nextTurn's own "no lines left" pass
}
function plRebuild(log, k){
  GIDBUMP(); clearTimeout(G.lxBot);
  const M = PP.newGame(JSON.parse(JSON.stringify(G.lx.cfg.play))); M.undos = 0;
  log.forEach(op => plApplyOp(M, op));
  G.M = M; G.lx.log = log.slice(); G.lx.k = k;
  Object.assign(G, {disp: null, showP: null, busy: false, over: false, ghost: null, sel: -1, mode: null, target: null, route: [], fx: [], timerEnd: 0, undoWin: false});
  M.P.forEach((p, i) => { const a = G.av[i]; if(a){ a.x = M.dots[p.at].x; a.y = M.dots[p.at].y; a.path = null; } });
  G.ver++; G.sver = -1; buildCards();
  if(M.over) endGame(); else nextTurn();
}
// ---- guest ----
function plGuestStart(d){
  plStart(d.cfg, d.you, 'guest');
  if(d.log && d.log.length) plRebuild(d.log, d.k);
}
// ---- the game's own functions, with the link folded in ----
humanNow = (function(f){ return function(){ if(plOn()) return !G.M.over && G.M.cur === G.lx.me; return f.apply(this, arguments); }; })(humanNow);
doLine = (function(f){ return function(e, start, way){
  if(plOn() && PP.legal(G.M, e)) plOut('ln', {e, start: start == null ? -1 : start, way: (way || []).slice()});
  return f.apply(this, arguments); }; })(doLine);
doUndo = (function(f){ return function(){ if(plOn()) return; return f.apply(this, arguments); }; })(doUndo);
// engine actions the page calls: count + send them (only on the live board; a rebuild runs on a fresh board and passes straight through)
function plWrapPP(name, type, ok, extra){
  const f = PP[name];
  PP[name] = function(M){ if(!(plOn() && M === G.M)) return f.apply(this, arguments);
    const h = plHash(), args = arguments, r = f.apply(this, args); if(ok(r)) plOut(type, extra(args), h); return r; };
}
plWrapPP('playCard', 'card', r => !!(r && r.ok), a => ({idx: a[2], t: a[3] == null ? null : a[3]}));
plWrapPP('door', 'door', r => !!(r && r.ok !== false), a => ({e: a[1]}));
plWrapPP('repair', 'rep', r => !!r, a => ({f: a[2]}));
plWrapPP('buyCard', 'buy', r => !!r, a => ({r: a[2]}));
plWrapPP('finish', 'fin', () => true, () => ({}));
// one-device dice: a 🤖 pick or a ⏱️ time-out line rolls Math.random, never the shared board dice (M.R)
['botPick', 'botCard', 'timeoutLine'].forEach(name => { const f = PP[name];
  PP[name] = function(M){ if(!(plOn() && M === G.M)) return f.apply(this, arguments); const R0 = M.R; M.R = Math.random; try{ return f.apply(this, arguments); } finally { M.R = R0; } }; });
// 🪙 bank (the shop changes coins + points itself): count + send it before the shop's own click runs
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('#sheet-card [data-bank]'); if(!b || !plOn() || !humanNow()) return;
  const p = G.M.P[G.M.cur]; if(p.coins >= PP.PRICE.bank) plOut('bank'); }, true);
// 🤖 on a guest: the host plays the robots and sends their actions — a guest only waits
botMove = (function(f){ return function(){ if(plOn() && G.lx.role !== 'host'){ G.busy = false; buildActbar(); return; } return f.apply(this, arguments); }; })(botMove);
nextTurn = (function(f){ return function(){
  if(!plOn()) return f.apply(this, arguments);
  clearTimeout(G.lxBot);
  const r = f.apply(this, arguments);
  if(G && G.lx && !G.over && !G.M.over){
    const M = G.M, i = M.cur, p = M.P[i], mine = i === G.lx.me;
    if(!p.bot) banner(mine ? '✏️ Your turn!' : '⏳ ' + p.name + ' is drawing…', mine ? 'good' : '');
    if(G.lx.role === 'host' && G.lx.away[i] && !mine && !p.bot){ const id = G.id;
      G.lxBot = setTimeout(() => { if(G && G.id === id && G.lx && G.M.cur === i && G.lx.away[i] && !G.busy && !G.over){ G.busy = true; G.timerEnd = 0; botMove(); } }, PL_AUTO_MS); }
  }
  plMarkCards(); return r; }; })(nextTurn);
buildCards = (function(f){ return function(){ const r = f.apply(this, arguments); plMarkCards(); return r; }; })(buildCards);
function plMarkCards(){ if(!plOn()) return; G.M.P.forEach((p, i) => { const c = $('pc-' + i); if(c){ c.classList.toggle('lx-you', i === G.lx.me); c.classList.toggle('lx-away', !!G.lx.away[i]); } }); }
// 💾 only the host saves (for everyone)
saveWin = (function(f){ return function(name, lvl, extra, seat){ if(plOn() && G.lx.role !== 'host'){ putNote(seat, UI.esc(name) + ': 💾 saved by the host'); return; } return f.apply(this, arguments); }; })(saveWin);
saveFeatsOnly = (function(f){ return function(name, stats, seat){ if(plOn() && G.lx.role !== 'host'){ putNote(seat, UI.esc(name) + ': 💾 saved by the host'); return; } return f.apply(this, arguments); }; })(saveFeatsOnly);
// 🏁 the shared result card: 🔁 Play again (host / 📺 captain) · ◀ Room · 🚪 End / Leave
endGame = (function(f){ return async function(){
  if(!plOn()) return f.apply(this, arguments);
  const R = GF.result, lx = G.lx, M = G.M;
  GF.result = o => { const host = lx.role === 'host', cap = lx.tv && !host && Link.captain && Link.captain() === Link.seat(), me = lx.me >= 0 ? M.P[lx.me] : null;
    const won = me ? (M.coop ? M.winner === 0 : M.winner >= 0 && M.winner === me.team) : null;
    return R(Object.assign({}, o, {win: me ? (M.coop || M.winner >= 0 ? won : null) : o.win, stars: won ? o.stars : null, buddy: me ? {name: me.name, av: myAvatar(me.name)} : null,
      sub: [o.sub, host || cap ? '' : '⏳ ' + (lx.tv ? 'The TV or the first player' : ((lx.cfg && lx.cfg.host) || 'The host')) + ' can start the next game'].filter(Boolean).join(' · '),
      levels: () => plExit(), levelsText: host ? '🚪 End the room' : '🚪 Leave',
      again: host ? () => plHostGo() : cap ? () => { Link.ask('again'); UI.toast('📺 Asking the TV…'); } : null, againText: '🔁 Play again',
      next: null, extra: PPL.viaCover ? [{text: '◀ Room', fn: () => plToCover(), id: 'b-room'}] : []})); };
  try{ return await f.apply(this, arguments); } finally { GF.result = R; }
}; })(endGame);
backToMenu = (function(f){ return function(){
  if(!plOn()) return f.apply(this, arguments);
  if(G.over) return plExit();
  const host = G.lx.role === 'host';
  UI.confirm({icon: '◀', title: host ? 'End the game for everyone?' : 'Leave this game?', body: host ? 'You are the ' + (G.lx.tv ? '📺 Room hostess' : 'host') + ' — the game stops on every device.' : '🤖 A robot plays your seat until you come back.',
    okText: host ? 'End game' : 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) plExit(); });
}; })(backToMenu);
// ---- leaving ----
function plStop(){ if(G){ clearTimeout(G.lxBot); G.lx = null; } if(window.Cheer) Cheer.unmount(); if(window.UI && UI.callout) UI.callout.setup(null); if(G) cancelAnimationFrame(G.raf); G = null; GID++; hideResult(); closeSheet(); renderMenu(); showScreen('menu'); }
function plExit(){ plIdle(); const o = document.querySelector('.lx-over'); if(o) o.remove(); plStop(); if(PPL.viaCover){ PPL.viaCover = false; openCover(); } }
function plToCover(){ const o = document.querySelector('.lx-over'); if(o) o.remove(); plStop(); openCover(); try{ if(PolyCover && Link.cover.show) Link.cover.show(PolyCover); }catch(e){} }   // ◀ Room: the room stays open
function plEnded(msg){
  if(G){ G.over = true; clearTimeout(G.lxBot); }
  hideResult(); const o0 = document.querySelector('.lx-over'); if(o0) o0.remove();
  const o = document.createElement('div'); o.className = 'lx-over'; o.style.cssText = 'position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(10,16,32,.6)';
  o.innerHTML = '<div style="max-width:340px;padding:22px;border-radius:20px;background:#fff;color:#14263B;text-align:center;font-family:inherit"><div style="font-size:44px">📡</div><h2 style="margin:6px 0">' + UI.esc(msg) + '</h2><div>Thanks for playing together!</div>' +
    '<div style="margin-top:14px"><button class="btn sp-btn sp-primary" data-sound="tap" id="lx-over-ok">OK</button></div></div>';
  document.body.appendChild(o); $('lx-over-ok').onclick = () => plExit();
}
// "(you)" on your own player card · 📶 🤖 on a seat whose phone dropped out — put in the first time a room is used (so a page that never links stays as it was)
function plCss(){ if(document.getElementById('pl-css')) return; const st = document.createElement('style'); st.id = 'pl-css';
  st.textContent = '#scr-play .pcard.lx-you .n::after{content:" (you)";font-weight:600;opacity:.85}#scr-play .pcard.lx-away .n::after{content:" · 📶 🤖";font-weight:600;opacity:.85}';
  document.head.appendChild(st); }
function plWire(){
  if(PPL.wired || !window.Link) return; PPL.wired = true; plCss();
  Link.on('ppgo', d => { if(Link.isHost() || !d || !d.cfg) return; if(G && G.lx && G.lx.id === d.cfg.id){ plRebuild(d.log || [], d.k || 0); return; } plGuestStart(d); });
  PL_KEYS.forEach(t => Link.on(t, (d, seat) => plGot(t, d, seat, 0)));
  Link.on('ppask', (d, seat) => { if(Link.isHost() && plOn() && d && d.id === G.lx.id) plSendGo(seat); });
  Link.on('hostleft', e => { if(Link.isHost() || !plOn()) return; UISound.play('bump'); plEnded(e && e.reason === 'lost' ? '📶 Lost the link to ' + ((G.lx.cfg && G.lx.cfg.host) || 'the host') : '👋 ' + ((G.lx.cfg && G.lx.cfg.host) || 'The host') + ' ended the game'); });
  Link.on('lk:ask', (d, seat) => { if(!Link.isHost() || !d || d.what !== 'again' || !plOn() || !G.over || !G.lx.tv) return; if(Link.captain() !== seat) return; plHostGo(); });   // 📺 the first player's 🔁
  const seatIdx = seat => plOn() ? G.lx.lseats.indexOf(seat) : -1;
  Link.on('leave', e => { if(!Link.isHost() || !plOn() || G.over) return; const i = seatIdx(e.seat); if(i < 0) return;
    G.lx.away[i] = true; banner('📶 ' + G.M.P[i].name + ' dropped out — 🤖 a robot plays for them until they come back', 'bad'); plMarkCards();
    if(G.M.cur === i && !G.busy){ clearTimeout(G.lxBot); const id = G.id; G.lxBot = setTimeout(() => { if(G && G.id === id && plOn() && G.M.cur === i && G.lx.away[i] && !G.busy && !G.over){ G.busy = true; G.timerEnd = 0; botMove(); } }, PL_AUTO_MS); } });
  const back = e => { if(!Link.isHost() || !plOn()) return; const i = seatIdx(e.seat); if(i < 0) return;
    if(G.lx.away[i]){ G.lx.away[i] = false; if(G.M.cur === i) clearTimeout(G.lxBot); banner('👋 ' + G.M.P[i].name + ' is back!', 'good'); UISound.play('success'); plMarkCards(); }
    plSendGo(e.seat); };
  Link.on('rejoin', back); Link.on('join', back);
  addEventListener('pagehide', () => { try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} });
}
GameParts.loaded('Polyplot_link', 'lk-pp1');
