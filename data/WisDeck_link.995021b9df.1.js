
/* 📡 LINK (lk-wd1): 🔔 WisBuzz on own devices — LinkKit plan §50 (📡 Multiplayer chat, Aowu 2026-11-20 07:01 picks A: "each phone a buzzer,
   the first buzzer answers on their phone").
   Born split: this whole block lives in the part file WisDeck_link (GameParts), loaded the first time a room is used (📱 Own devices on the
   cover, or a ?link=<room> QR). The main file only holds wdNeed / wdOwn + the ?link hook.
   The room lives on the 🎬 cover (Link.cover): chips 🔔 game · 📚 shelf · 🗂️ category · 🎚️ level. 2–4 phones · 📺 TV + 2–4 phones (the TV shows
   the question + every buzzer, the phones are the buzzers). No 🤖 buzzers (a race needs people).
   The host phone (or the 📺 TV) is the referee and runs the REAL one-device code (startBuzz · buzz · buzzPick · buzzReveal · buzzQ · finishBuzz).
   Every decision it makes is an EVENT, numbered n, sent to every phone; the phones run the same functions with the same data, so their
   screens follow the host's step by step:
     wbe {id, n, ev}: ev = {o: 'q', qn, q} a question · {o: 'bz', p} p buzzed first · {o: 'an', a} the answer (null = ⏱️ time out) ·
                      {o: 'rv'} nobody got it (⏱️ question time out). The end card follows the winning answer by itself on every phone.
   phone → host: wbz {id, qn} "I buzzed" · wbzans {id, qn, a} my answer. The host takes the FIRST buzz it receives; buzzes inside 30 ms
   of each other = a tie → the player with fewer buzzes won so far gets it (plan §50).
   Out of step (an event number missing) → wbask → wbgo = the start settings + every event so far; the phone replays them.
   Timers run on the host only (a phone's bar just moves). The host saves feats + won cards for everyone (like one-device play).
   📡 a phone that drops out → its buzzer goes quiet (and an answer it owes = ⏱️ time out at once); it gets the whole match back on rejoin.
   📡 lk-wd2 (2026-11-20): 🔢 WisCount + 🂡 WisJack on own devices — the 🎮 room chip cycles 🔔 → 🔢 → 🂡 (+ 🎚️ level · 🎯 20 / 21). See the
   lk-wd2 block below: the host (or 📺 TV) holds the only real match; each phone gets ITS OWN view (wts) — your hand / side cards, the other
   player's as face-down backs — so a phone never receives the other hand. */
const WBL = {wired: false, games: 0, viaCover: false, applying: false, noQ: false, pend: null, lxNext: null, game: 'buzz'};   // game = the 🎮 room chip (lk-wd2)
const WB_TIE_MS = 30;
function wbOn(){ return !!(B && B.lx); }
function wbIdle(){ try{ if(window.Link && Link.status() !== 'idle') Link.leave(); }catch(e){} }
// ---- the host's room picks (BZ = the same picks as the one-device 🔔 menu) ----
const WB_GAMES = {buzz: '🔔 WisBuzz', count: '🔢 WisCount', jack: '🂡 WisJack'};   // 📡 lk-wd2: the 🎮 chip cycles 🔔 → 🔢 → 🂡
function wbPicks(el){
  const g = WBL.game || 'buzz', gChip = '<button class="lkc-chip" data-k="game" data-sound="none">' + WB_GAMES[g] + '</button>';
  if(g !== 'buzz'){ const L = WD.LEVELS[TM.lv] || WD.LEVELS[0];
    el.innerHTML = gChip + '<button class="lkc-chip" data-k="tlevel" data-sound="none">' + L.icon + ' ' + UI.esc(L.name) + '</button>' + (g === 'jack' ? '<button class="lkc-chip" data-k="target" data-sound="none">🎯 ' + TM.target + '</button>' : '');
  } else {
  const shelf = WC.SHELVES.find(s => s.k === BZ.shelf) || WC.SHELVES[0], cats = WC.catsOf(shelf.k), cat = WC.CAT[BZ.cat] && WC.CAT[BZ.cat].shelf === shelf.k ? WC.CAT[BZ.cat] : cats[0], L = WD.LEVELS[Math.min(2, BZ.lv)];
  BZ.shelf = shelf.k; BZ.cat = cat.k;
  el.innerHTML = gChip +
    '<button class="lkc-chip" data-k="shelf" data-sound="none">' + shelf.icon + ' ' + UI.esc(shelf.en) + '</button>' +
    '<button class="lkc-chip" data-k="cat" data-sound="none">' + cat.icon + ' ' + UI.esc(cat.en) + '</button>' +
    '<button class="lkc-chip" data-k="level" data-sound="none">' + L.icon + ' ' + UI.esc(L.name) + '</button>';
  }
  el.querySelectorAll('.lkc-chip').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.k;
    if(k === 'game'){ const order = ['buzz', 'count', 'jack']; WBL.game = order[(order.indexOf(WBL.game || 'buzz') + 1) % 3]; }
    else if(k === 'tlevel') TM.lv = (TM.lv + 1) % WD.LEVELS.length;
    else if(k === 'target') TM.target = TM.target === 20 ? 21 : 20;
    else { const shelf = WC.SHELVES.find(s => s.k === BZ.shelf) || WC.SHELVES[0], cats = WC.catsOf(shelf.k), cat = WC.CAT[BZ.cat] || cats[0];
      if(k === 'shelf'){ const S2 = WC.SHELVES, n = S2[(S2.indexOf(shelf) + 1) % S2.length]; BZ.shelf = n.k; BZ.cat = WC.catsOf(n.k)[0].k; }
      else if(k === 'cat') BZ.cat = cats[(cats.indexOf(cat) + 1) % cats.length].k;
      else BZ.lv = (Math.min(2, BZ.lv) + 1) % 3; }
    UISound.play('tap'); wbPicks(el); if(k === 'game' || k === 'tlevel') try{ if(WdCover) Link.cover(WdCover, WB_ROOM); }catch(er){} });   // lk-wd2: the ▶ text follows the game (📺 + 1 = vs 🤖 for 🔢 🂡 only)
}
function wbAv(cv, p){ if(typeof drawPreviewCanvas === 'function') drawPreviewCanvas(cv, myAvatar(p.name), {name: p.name, t: 1}); }
const WB_ROOM = {game: 'WisDeck', title: '🃏 WisDeck', page: 'wisdeck', kind: 'wisdeck', seats: 4, min: 2, url: WEBAPP_URL + '?page=wisdeck', name: () => S.player, av: () => myAvatar(S.player), drawAvatar: (cv, p) => wbAv(cv, p),
  label: tv => '🃏 WisDeck · ' + WB_GAMES[WBL.game || 'buzz'] + ((WBL.game || 'buzz') === 'buzz' ? ' · 2–4 players' : ' · 2 players') + (tv ? ' · 📺 on the TV' : ''),
  how: 'Gameroom → 🃏 WisDeck → 📱 Own devices → 🔗 Join · or scan · 🔔 2–4 players (every phone a buzzer) · 🔢 🂡 2 players, your cards on your own phone', picks: el => wbPicks(el),
  get bot(){ return (WBL.game || 'buzz') === 'buzz' ? false : () => { const L = WD.LEVELS[TM.lv] || WD.LEVELS[0]; return L.icon + ' ' + L.name; }; },   // 📡 lk-wd2: 📺 TV + 1 phone = you vs 🤖 (🔢 🂡 only)
  onLink: () => { WBL.viaCover = true; }, onStart: () => { WBL.viaCover = true; if((WBL.game || 'buzz') === 'buzz') wbHostGo(); else wtHostGo(); }};
// ---- host: start a match for everyone ----
function wbHostGo(){
  const tv = !!(Link.hostess && Link.hostess());
  const list = Link.players().filter(p => p.name && p.on && !p.screen).sort((a, b) => a.seat - b.seat);
  let names = [], lseats = [], me = -1;
  if(tv){ list.slice(0, 4).forEach(p => { names.push(p.name); lseats.push(p.seat); }); }
  else { const mine = list.find(p => p.seat === Link.seat()) || {name: S.player, seat: Link.seat()}, others = list.filter(p => p !== mine).slice(0, 3);
    names = [mine.name].concat(others.map(p => p.name)); lseats = ['host'].concat(others.map(p => p.seat)); me = 0; }
  if(names.length < 2){ UISound.play('error'); UI.toast(tv ? '📺 WisBuzz needs 2 players — wait for one more phone' : '📡 Wait for a friend to join'); return; }
  const cfg = {id: Date.now().toString(36), host: S.player, tv, game: WBL.games++, lseats, names, cat: BZ.cat, lv: Math.min(2, BZ.lv)};
  wbStart(cfg, me, 'host');
  wbSendGo();
}
function wbStart(cfg, me, role){
  if(typeof wtOn === 'function' && wtOn()) wtStop();   // 📡 lk-wd2: a table game on this phone ends first
  const o = document.querySelector('.lx-over'); if(o) o.remove();
  if(WdCover) WdCover.hide();
  $('b-res').classList.add('hidden');
  BZ.players = cfg.names.slice(); BZ.cat = cfg.cat; BZ.lv = cfg.lv; BZ.shelf = WC.CAT[cfg.cat].shelf;
  const lx = {role, me, id: cfg.id, cfg, lseats: cfg.lseats, tv: !!cfg.tv, away: {}, n: 0, evs: [], bz: cfg.names.map(() => 0)};
  WBL.noQ = role !== 'host';   // a phone's startBuzz must not make its own first question (the host's 'q' event brings it)
  WBL.lxNext = lx;
  try{ startBuzz(); } finally { WBL.noQ = false; WBL.lxNext = null; }
  wbMarkBuzzers();
}
// startBuzz makes B; the link state rides on it (B.lx) from the moment it is made (startBuzz's own buzzQ() already needs it)
WD.buzzMatch = (function(f){ return function(){ const b = f.apply(this, arguments); if(WBL.lxNext){ b.lx = WBL.lxNext; } return b; }; })(WD.buzzMatch);
function wbGuests(){ return ((B && B.lx && B.lx.lseats) || []).map((s, i) => ({i, seat: s})).filter(x => x.seat !== 'host' && x.seat != null); }
function wbSendGo(only){
  if(!(wbOn() && B.lx.role === 'host')) return;
  const L = B.lx; Link.players().filter(p => p.on && p.seat !== Link.seat()).forEach(p => {
    if(only != null && only !== p.seat) return;
    Link.send('wbgo', {cfg: L.cfg, you: L.lseats.indexOf(p.seat), evs: L.evs, n: L.n}, {sure: true, to: p.seat}); });
}
// ---- the host: every decision = an event (sent, logged, then run here with the real function) ----
function wbEmit(ev, run){
  const L = B.lx; L.n++; L.evs.push(ev);
  Link.send('wbe', {id: L.id, n: L.n, ev}, {sure: true});
  WBL.applying = true; try{ return run(); } finally { WBL.applying = false; }
}
// ---- every phone: run one event with the real function ----
function wbApply(ev){
  if(!B) return;
  WBL.applying = true;
  try{
    if(ev.o === 'q'){ while(B.qn < ev.qn) WD.buzzNext(B); B.qs = [ev.q]; buzzQ(); }
    else if(ev.o === 'bz') buzz(ev.p);
    else if(ev.o === 'an') buzzPick(ev.a, wbBtn(ev.a));
    else if(ev.o === 'rv') buzzReveal(false);
  } finally { WBL.applying = false; }
}
function wbBtn(a){ if(a == null) return null; const all = [...$('b-ans').querySelectorAll('.opt')];
  return all.find(b => b.dataset.tf != null ? (b.dataset.tf === '1') === a : b.dataset.id === a) || null; }
function wbGotEv(d){
  if(!wbOn() || !d || d.id !== B.lx.id || B.lx.role === 'host') return;
  const L = B.lx; if(d.n <= L.n) return;
  if(d.n !== L.n + 1){ Link.send('wbask', {id: L.id}, {sure: true}); return; }
  L.n = d.n; L.evs.push(d.ev); wbApply(d.ev);
}
function wbGuestStart(d){
  wbStart(d.cfg, d.you, 'guest');
  (d.evs || []).forEach((ev, i) => { B.lx.n = i + 1; B.lx.evs.push(ev); wbApply(ev); });
}
// ---- host: a buzz (its own tap or a phone's wbz) — the first one wins, a tie inside 30 ms → fewer buzzes won so far ----
function wbHostBuzz(p){
  if(!wbOn() || B.over || !WD.buzzCan(B, p) || B.lx.away[p]) return;
  const qn = B.qn;
  if(WBL.pend && WBL.pend.qn === qn){ if(!WBL.pend.list.includes(p)) WBL.pend.list.push(p); return; }
  WBL.pend = {qn, list: [p]};
  setTimeout(() => { const P = WBL.pend; WBL.pend = null; if(!wbOn() || !P || B.qn !== P.qn || B.phase !== 'buzz') return;
    const L = B.lx, win = P.list.filter(i => WD.buzzCan(B, i)).sort((a, b) => L.bz[a] - L.bz[b])[0];   // stable: the first to arrive wins an equal count
    if(win == null) return; L.bz[win]++; wbEmit({o: 'bz', p: win}, () => buzz(win)); }, WB_TIE_MS * (SPEED ? 1 : 0));
}
function wbHostAnswer(p, a){
  if(!wbOn() || B.phase !== 'answer' || B.turn !== p) return;
  wbEmit({o: 'an', a: a == null ? null : a}, () => buzzPick(a, wbBtn(a)));
}
// ---- the game's own functions, with the link folded in ----
buzz = (function(f){ return function(p){
  if(!wbOn() || WBL.applying){ const r = f.apply(this, arguments); if(wbOn()) wbAfterBuzz(); return r; }
  const L = B.lx; if(L.me < 0) return; p = L.me;   // only YOUR buzzer works on your phone (any buzz key = yours)
  if(B.frozen.includes(p) && B.phase === 'buzz'){ UI.toast('🧊 You are frozen this question'); return; }
  if(L.role === 'host') wbHostBuzz(p);
  else if(WD.buzzCan(B, p)){ Link.send('wbz', {id: L.id, qn: B.qn}, {sure: true}); UISound.play('tap'); const b = $('b-buzzers').querySelector('.buzz[data-p="' + p + '"]'); if(b) b.classList.add('lx-sent'); }
}; })(buzz);
function wbAfterBuzz(){
  const L = B.lx; if(B.phase !== 'answer') return;
  if(B.turn !== L.me){ $('b-ans').querySelectorAll('.opt').forEach(b => { b.disabled = true; }); $('b-msg').textContent = '⏳ ' + B.names[B.turn] + ' is answering…'; }
  else $('b-msg').textContent = '🔔 You buzzed first — answer!';
  $('b-buzzers').querySelectorAll('.lx-sent').forEach(b => b.classList.remove('lx-sent'));
}
buzzPick = (function(f){ return function(ans, btn){
  if(!wbOn() || WBL.applying) return f.apply(this, arguments);
  const L = B.lx;
  if(L.role === 'host'){
    if(ans === null && btn === null){ if(B.phase === 'answer') wbHostAnswer(B.turn, null); return; }   // ⏱️ the answer time ran out
    if(B.turn === L.me) wbHostAnswer(L.me, ans); return; }
  if(B.phase !== 'answer' || B.turn !== L.me || ans === null) return;
  Link.send('wbzans', {id: L.id, qn: B.qn, a: ans}, {sure: true});
  $('b-ans').querySelectorAll('.opt').forEach(b => { b.disabled = true; }); if(btn) btn.classList.add('lx-sent'); UISound.play('tap');
}; })(buzzPick);
buzzReveal = (function(f){ return function(ok){
  if(!wbOn()) return f.apply(this, arguments);
  const L = B.lx;
  if(!WBL.applying){ if(L.role === 'host' && B.phase !== 'done') wbEmit({o: 'rv'}, () => buzzReveal(false)); return; }   // ⏱️ nobody answered
  const r = f.apply(this, arguments);
  if(!B) return r;
  const nx = $('b-next');
  if(L.role !== 'host'){ if(!B.over) B.gid = ++QID; if(nx) nx.outerHTML = '<div class="lx-wait" style="text-align:center;font-weight:700;opacity:.8">⏳ Next question coming…</div>'; }
  else if(nx && !ok){ const gid = B.gid; setTimeout(() => { if(B && B.gid === gid && $('b-next')) $('b-next').click(); }, 3000 * SPEED); }   // 📺 nobody has to tap ▶ on the TV
  return r;
}; })(buzzReveal);
buzzQ = (function(f){ return function(){
  if(!wbOn()) return f.apply(this, arguments);
  const L = B.lx;
  if(WBL.noQ) return;   // a phone's startBuzz: the host's first 'q' event brings the question
  if(WBL.applying){ const r = f.apply(this, arguments); wbAfterQ(); return r; }
  if(L.role !== 'host') return;   // a phone never moves on by itself
  if(!B.qs.length) B.qs = WD.buzzQuestions(WC, B.cat, B.lv, B.seed + B.qn * 7 + 1);
  const q = B.qs[0]; wbEmit({o: 'q', qn: B.qn, q}, () => { f.apply(this, arguments); wbAfterQ(); });
}; })(buzzQ);
function wbAfterQ(){
  const L = B.lx; wbMarkBuzzers();
  if(L.role !== 'host'){ cancelAnimationFrame(BT); wbBar(20); }
  if(L.me < 0) return;
  const m = $('b-msg'); if(m && B.frozen.includes(L.me)) m.textContent = '🧊 You are frozen this question — watch and learn!';
}
// a phone's time bar only moves (the host decides when time is up)
function wbBar(sec){ const gid = B.gid, t0 = performance.now(), tick = now => { if(!B || B.gid !== gid) return; const left = 1 - (now - t0) / (sec * 1000); $('b-tfill').style.transform = 'scaleX(' + Math.max(0, left) + ')'; if(left > 0) BT = requestAnimationFrame(tick); }; BT = requestAnimationFrame(tick); }
buzzTimer = (function(f){ return function(sec, done){ if(wbOn() && B.lx.role !== 'host'){ cancelAnimationFrame(BT); wbBar(sec); return; } return f.apply(this, arguments); }; })(buzzTimer);
buzzPaint = (function(f){ return function(){ const r = f.apply(this, arguments); if(wbOn()) wbMarkBuzzers(); return r; }; })(buzzPaint);
// your buzzer = big + "(you)"; the others = their score cards (no taps) · 📶 = a phone that dropped out
function wbMarkBuzzers(){ if(!wbOn()) return; const L = B.lx;
  $('b-buzzers').classList.add('lx'); $('b-buzzers').classList.toggle('lx-tv', L.me < 0);
  $('b-buzzers').querySelectorAll('.buzz').forEach(b => { const i = Number(b.dataset.p);
    b.classList.toggle('lx-mine', i === L.me); b.classList.toggle('lx-other', i !== L.me); b.classList.toggle('lx-away', !!L.away[i]);
    const sm = b.querySelector('small'); if(sm) sm.textContent = i === L.me ? '🔔 tap to buzz! (you)' : L.away[i] ? '📶 away' : '📱 own phone'; }); }
// 🏁 the result: the host saves for everyone · 🔁 Play again (host / 📺 first player) · ◀ Room · 🚪 End / Leave
finishBuzz = (function(f){ return function(){
  if(!wbOn()) return f.apply(this, arguments);
  const L = B.lx, host = L.role === 'host', cap = L.tv && !host && Link.captain && Link.captain() === Link.seat();
  let r; if(host) r = f.apply(this, arguments);
  else { r = wbQuiet(() => f.apply(this, arguments));
    const sv = $('b-save'); if(sv) sv.textContent = '💾 Saved by ' + (L.tv ? 'the 📺 TV' : (L.cfg.host || 'the host')) + ' for everyone'; }
  const bt = $('b-res').querySelector('.btns');
  if(bt){ bt.innerHTML = (host || cap ? '<button class="btn sp-btn sp-primary" data-sound="pop" id="wb-again">🔁 Play again</button>' : '<div class="lx-wait" style="font-weight:700;opacity:.8">⏳ ' + UI.esc(L.tv ? 'The TV or the first player' : (L.cfg.host || 'The host')) + ' can start the next game</div>') +
      (WBL.viaCover ? '<button class="btn soft sp-btn sp-secondary" data-sound="tap" id="wb-room">◀ Room</button>' : '') +
      '<button class="btn soft sp-btn sp-secondary" data-sound="none" id="wb-exit">' + (host ? '🚪 End the room' : '🚪 Leave') + '</button>';
    const ag = $('wb-again'); if(ag) ag.onclick = host ? () => wbHostGo() : () => { Link.ask('again'); UI.toast('📺 Asking the TV…'); };
    const rm = $('wb-room'); if(rm) rm.onclick = () => wbToCover(); $('wb-exit').onclick = () => wbExit(); }
  return r;
}; })(finishBuzz);
leaveBuzz = (function(f){ return function(){
  if(!wbOn()) return f.apply(this, arguments);
  if(B.over) return wbExit();
  const host = B.lx.role === 'host';
  UI.confirm({icon: '◀', title: host ? 'End WisBuzz for everyone?' : 'Leave this game?', body: host ? 'You are the ' + (B.lx.tv ? '📺 Room hostess' : 'host') + ' — the game stops on every phone.' : 'Your buzzer goes quiet until you come back.',
    okText: host ? 'End game' : 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) wbExit(); });
}; })(leaveBuzz);
// 🔇 run the one-device result with its server saves switched off (the host saves once, below). lk-wd2 fix: UiKit's save guard owns
// google.script.run through a getter + setter — assigning the old value back made the guard call itself (stack overflow on the next save),
// so the property itself is swapped and its descriptor put back exactly.
function wbQuiet(fn){
  const G = google.script, d = Object.getOwnPropertyDescriptor(G, 'run'), stub = new Proxy({}, {get: (_, k) => typeof k === 'string' && k.startsWith('with') ? () => stub : () => {}});
  if(d && d.configurable){ Object.defineProperty(G, 'run', {configurable: true, enumerable: true, writable: true, value: stub}); try{ return fn(); } finally { Object.defineProperty(G, 'run', d); } }
  const R0 = G.run; G.run = stub; try{ return fn(); } finally { G.run = R0; }
}
// ---- leaving ----
function wbStop(){ cancelAnimationFrame(BT); if(B) B.lx = null; B = null; $('b-res').classList.add('hidden'); view('learn'); if(window.Cheer) try{ Cheer.unmount(); }catch(e){} }
function wbExit(){ wbIdle(); const o = document.querySelector('.lx-over'); if(o) o.remove(); if(wtOn()) wtStop(); wbStop(); WBL.viaCover = false; openCover(); }
function wbToCover(){ const o = document.querySelector('.lx-over'); if(o) o.remove(); wbStop(); openCover(); try{ if(WdCover && Link.cover.show) Link.cover.show(WdCover); }catch(e){} }   // ◀ Room: the room stays open
function wbEnded(msg){
  if(B){ B.over = true; } cancelAnimationFrame(BT); if(wtOn() && T.M) T.M.over = true;
  const o0 = document.querySelector('.lx-over'); if(o0) o0.remove();
  const o = document.createElement('div'); o.className = 'lx-over'; o.style.cssText = 'position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(10,16,32,.6)';
  o.innerHTML = '<div style="max-width:340px;padding:22px;border-radius:20px;background:#fff;color:#14263B;text-align:center;font-family:inherit"><div style="font-size:44px">📡</div><h2 style="margin:6px 0">' + UI.esc(msg) + '</h2><div>Thanks for playing together!</div>' +
    '<div style="margin-top:14px"><button class="btn sp-btn sp-primary" data-sound="tap" id="lx-over-ok">OK</button></div></div>';
  document.body.appendChild(o); $('lx-over-ok').onclick = () => wbExit();
}
// your big buzzer · the others = score cards · 📶 away — put in the first time a room is used (a page that never links stays as it was)
function wbCss(){ if(document.getElementById('wb-css')) return; const st = document.createElement('style'); st.id = 'wb-css';
  st.textContent = '.buzzers.lx .buzz.lx-other{pointer-events:none;min-height:52px;filter:saturate(.75)}.buzzers.lx .buzz.lx-other canvas{width:34px;height:40px}' +
    '.buzzers.lx .buzz.lx-mine{grid-column:1/-1;order:-1;min-height:96px;font-size:1.25rem}.buzzers.lx .buzz.lx-mine canvas{width:64px;height:74px}' +
    '.buzzers.lx-tv .buzz.lx-other{min-height:84px}.buzzers.lx .buzz.lx-away{opacity:.45}.buzzers.lx .buzz.lx-sent{outline:4px dashed #FFC845}' +
    '@media (max-height:520px){.buzzers.lx .buzz.lx-mine{min-height:56px;font-size:1rem}.buzzers.lx .buzz.lx-mine canvas{width:36px;height:42px}.buzzers.lx .buzz.lx-other{min-height:40px}}';
  document.head.appendChild(st); }
function wbWire(){
  if(WBL.wired || !window.Link) return; WBL.wired = true; wbCss();
  Link.on('wbgo', d => { if(Link.isHost() || !d || !d.cfg) return; if(wbOn() && B.lx.id === d.cfg.id && (d.n || 0) <= B.lx.n) return; wbGuestStart(d); });
  Link.on('wbe', d => wbGotEv(d));
  Link.on('wbask', (d, seat) => { if(Link.isHost() && wbOn() && d && d.id === B.lx.id) wbSendGo(seat); });
  Link.on('wbz', (d, seat) => { if(!Link.isHost() || !wbOn() || !d || d.id !== B.lx.id || d.qn !== B.qn) return; const p = B.lx.lseats.indexOf(seat); if(p >= 0) wbHostBuzz(p); });
  Link.on('wbzans', (d, seat) => { if(!Link.isHost() || !wbOn() || !d || d.id !== B.lx.id || d.qn !== B.qn) return; const p = B.lx.lseats.indexOf(seat); if(p >= 0) wbHostAnswer(p, d.a); });
  Link.on('hostleft', e => { if(Link.isHost() || !(wbOn() || wtOn())) return; UISound.play('bump'); const h = ((wbOn() ? B.lx.cfg : T.lx.cfg) || {}).host || 'the host'; wbEnded(e && e.reason === 'lost' ? '📶 Lost the link to ' + h : '👋 ' + h + ' ended the game'); });
  Link.on('lk:ask', (d, seat) => { if(!Link.isHost() || !d || d.what !== 'again' || !wbOn() || !B.over || !B.lx.tv) return; if(Link.captain() !== seat) return; wbHostGo(); });   // 📺 the first player's 🔁
  const seatIdx = seat => wbOn() ? B.lx.lseats.indexOf(seat) : -1;
  Link.on('leave', e => { if(!Link.isHost() || !wbOn() || B.over) return; const i = seatIdx(e.seat); if(i < 0) return;
    B.lx.away[i] = true; UI.toast('📶 ' + B.names[i] + ' dropped out — their buzzer is quiet until they come back'); wbMarkBuzzers();
    if(B.phase === 'answer' && B.turn === i) wbHostAnswer(i, null); });
  const back = e => { if(!Link.isHost() || !wbOn()) return; const i = seatIdx(e.seat);
    if(i >= 0 && B.lx.away[i]){ B.lx.away[i] = false; UI.toast('👋 ' + B.names[i] + ' is back!'); UISound.play('success'); wbMarkBuzzers(); }
    if(i >= 0) wbSendGo(e.seat); };
  Link.on('rejoin', back); Link.on('join', back);
  addEventListener('pagehide', () => { try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} });
  wtWire();   // 📡 lk-wd2
}

/* ===================== 📡 LINK (lk-wd2): 🔢 WisCount + 🂡 WisJack on own devices (LinkKit plan §50, Aowu pick A) =====================
   2 players, each on their own phone (or 📺 TV + 2 phones · 📺 TV + 1 phone = you vs 🤖). The host phone (or the TV) holds the ONLY real
   match (T.M) and sends every phone ITS OWN view `wts {id, snap}`: your cards / side cards, the other player's as a number of face-down backs.
   So a phone never receives the other hand — a card shows only when both cards of a round are down (the reveal carries both).
     🔢 WisCount: every phone picks 5 from its OWN 🗄️ WisRack (pickHand, as on one device) → wthand {ids} (to the host only) → the host checks
        the hand (legal, real cards) → countMatch → each round: wtplay {round, i} → the other card lies face-down in its slot until both are
        down → the host plays the round (WD.countPlay, rule cards from its own seeded match) → every phone's view carries the round (ev) →
        the phone runs the one-device reveal() with it.
     🂡 WisJack: every phone sends its own 3 side cards (wtside, from its own rack + ± picks) → jackMatch on the host (the deck only lives
        there) → the player whose turn it is: wtact {set, a: side | end | stand, k} → host checks it is their turn → WD.jackSide / jackEnd →
        new views. A side card shows only once it is played. ▶ Next set: wtnext {set} from either phone (or the TV).
   Phone views are rebuilt from the snapshot every time (shadow match in the phone's own seat order: you = seat 0 at the bottom), so a
   rejoin is just a fresh view (wtgo {cfg, you, snap}). 🤖 plays a dropped phone's hand / turns until it comes back (WD.countBot / jackBot).
   The host saves feats for both players (no level result, like 👫 one-device play); the phones' saves are switched off. */
function wtOn(){ return !!(T && T.lx); }
function wtSeatBot(i){ const L = T.lx; return !L.cfg.names[i] || !!L.away[i]; }   // host order: no player there, or the phone dropped out
function wtNm(i){ return T.names[i] ? T.names[i] : '🤖 Robot'; }
function wtGuests(){ return T.lx.cfg.lseats.map((s, i) => ({i, seat: s})).filter(x => x.seat !== 'host' && x.seat != null); }
// ---- host: start a 2-player table for everyone ----
function wtHostGo(){
  const tv = !!(Link.hostess && Link.hostess()), kind = WBL.game === 'jack' ? 'jack' : 'count';
  const list = Link.players().filter(p => p.name && p.on && !p.screen).sort((a, b) => a.seat - b.seat);
  let names = [], lseats = [], me = -1;
  if(tv){ list.slice(0, 2).forEach(p => { names.push(p.name); lseats.push(p.seat); }); if(names.length === 1){ names.push(null); lseats.push(null); } }   // 📺 TV + 1 phone = you vs 🤖
  else { const mine = list.find(p => p.seat === Link.seat()) || {name: S.player, seat: Link.seat()}, o = list.filter(p => p !== mine)[0];
    names = [mine.name].concat(o ? [o.name] : []); lseats = ['host'].concat(o ? [o.seat] : []); me = 0; }
  if(names.length < 2 || !names[0]){ UISound.play('error'); UI.toast(tv ? '📺 Wait for a phone to join' : '📡 Wait for a friend to join'); return; }
  const cfg = {id: Date.now().toString(36) + 't', kind, host: S.player, tv, game: WBL.games++, names, lseats, lv: TM.lv | 0, target: TM.target === 21 ? 21 : 20, seed: (Date.now() ^ (Math.random() * 1e9)) >>> 0};
  wtStart(cfg, me, 'host');
  wtSendGo();
  list.filter(p => !lseats.includes(p.seat) && p.seat !== Link.seat()).forEach(p => Link.send('wtsit', {id: cfg.id, game: WB_GAMES[kind]}, {sure: true, to: p.seat}));   // a 3rd / 4th phone waits
}
function wtSendGo(only){ if(!wtOn() || T.lx.role !== 'host') return; const L = T.lx;
  wtGuests().forEach(g => { if(only != null && only !== g.seat) return; Link.send('wtgo', {cfg: L.cfg, you: g.i, snap: wtSnap(g.i)}, {sure: true, to: g.seat}); }); }
function wtSendAll(){ if(!wtOn() || T.lx.role !== 'host') return; const L = T.lx; L.v++;
  wtGuests().forEach(g => { if(!L.away[g.i]) Link.send('wts', {id: L.id, snap: wtSnap(g.i)}, {sure: true, to: g.seat}); }); }
// ---- every device: set up the table (you = seat 0 at the bottom; the 📺 TV keeps the host's order) ----
function wtStart(cfg, me, role){
  const o = document.querySelector('.lx-over'); if(o) o.remove();
  if(WdCover) WdCover.hide();
  if(wbOn()){ cancelAnimationFrame(BT); B.lx = null; B = null; }
  if(wtOn()) wtStop(true);
  $('b-res').classList.add('hidden'); $('t-res').classList.add('hidden'); clearInterval(PICK.timer); closePeek(); pointAt(null);
  const flip = me === 1, lo = a => flip ? [a[1], a[0]] : [a[0], a[1]], names = lo(cfg.names);
  TM.kind = cfg.kind; TM.lv = cfg.lv; TM.target = cfg.target;
  T = {kind: cfg.kind, lv: cfg.lv, two: false, names, r: WD.rng(((cfg.seed ^ (Math.random() * 1e9)) >>> 0) || 7), hands: [null, null], gid: ++QID, dealt: false, firstTurn: true};
  const L = T.lx = {role, me, id: cfg.id, cfg, tv: !!cfg.tv, away: {}, v: 0, hands: [null, null], sides: [null, null], pick: [null, null], ev: null, sent: false, myPlay: null, snap: null, busy: false, screen: 'pick', outP: null, botTok: ''};
  const Lv = WD.LEVELS[cfg.lv] || WD.LEVELS[0];
  $('t-title').textContent = (cfg.kind === 'count' ? '🔢 WisCount · ' : '🂡 WisJack ' + cfg.target + ' · ') + Lv.icon + ' ' + Lv.name;
  $('t-round').textContent = cfg.kind === 'count' ? '🖐️ pick' : '🎴 side cards'; $('t-score').textContent = '0 : 0';
  $('t-seat1').innerHTML = seatHtml(1, names[1], !names[1]); $('t-seat0').innerHTML = seatHtml(0, names[0], !names[0]); setDots(0, 0); setDots(1, 0);
  wtCss(); showTable(); tableStart(names);
  if(role === 'host') cfg.names.forEach((n, i) => { if(!n) wtFill(i); });   // 🤖's hand / side cards
  if(cfg.kind === 'count'){ if(me >= 0) pickHand(0); else wtWaitPick(); }
  else { if(me >= 0){ const side = sideFor(names[0], cfg.lv); L.sent = true; if(role === 'host') wtGotSide(me, side); else Link.send('wtside', {id: cfg.id, side}, {sure: true}); }
    wtWaitPick(); }
}
// 🤖 (no player / a dropped phone): its hand or side cards, made on the host
function wtFill(i){ const L = T.lx, n = L.cfg.names[i];
  if(T.kind === 'count'){ if(L.hands[i] || T.M) return; let h = null; if(n) h = WD.randomHand(rackFor(n), T.r); if(!h){ const br = botRack(T.r); h = T.lv >= 2 ? WD.bestHand(br, WD.BOT_BUDGET[T.lv]) : WD.randomHand(br, T.r); } wtGotHand(i, h, true); }
  else { if(L.sides[i] || T.M) return; wtGotSide(i, n ? sideFor(n, T.lv) : botSide(T.r, T.lv), true); } }
function wtReady(){ const L = T.lx; if(L.role === 'host'){ const a = (T.kind === 'count' ? L.hands : L.sides).map(Boolean); return L.me === 1 ? [a[1], a[0]] : a; } return L.snap ? L.snap.ready : [L.sent, false]; }
function wtWaitPick(){
  const L = T.lx, rd = wtReady(); if(L.me >= 0 && !rd[0] && !L.sent) return;   // still picking on this phone: keep the pick screen
  L.screen = 'pick';
  $('t-mid').innerHTML = '<div class="goal">' + (T.kind === 'count' ? GOAL.count : GOAL.jack(TM.target)) + '</div><div class="rulecard"><div class="big">' + (T.kind === 'count' ? '🖐️ Pick 5 cards' : '🎴 Side cards') + '</div>' +
    '<div class="sm">' + [0, 1].map(i => (rd[i] ? '✅ ' : '⏳ ') + UI.esc(wtNm(i))).join(' · ') + '</div></div><div class="tmsg" id="t-msg">' +
    (L.me < 0 ? '📱 Each player picks on their own phone — the cards stay secret' : T.kind === 'count' ? '⏳ Waiting for ' + UI.esc(wtNm(1)) + ' to pick 5 cards…' : '🃏 Shuffling the deck…') + '</div>';
  $('t-bottom').innerHTML = '';
}
// ---- host: a hand / side cards came in (check them: real cards, a legal hand) ----
function wtGotHand(i, cards, trusted){ const L = T.lx; if(L.hands[i] || T.M || T.kind !== 'count') return;
  if(!trusted){ const ok = Array.isArray(cards) && cards.length === WD.HAND && cards.every(Boolean) && new Set(cards.map(c => c.id)).size === WD.HAND && WD.legalHand(cards.map(c => c.power));
    if(!ok){ cards = WD.randomHand(rackFor(L.cfg.names[i]), T.r) || WD.randomHand(botRack(T.r), T.r); } }
  L.hands[i] = cards.slice(); wtSendAll(); if(!T.M) wtWaitPick(); if(L.hands.every(Boolean)) wtBegin(); }
function wtGotSide(i, side, trusted){ const L = T.lx; if(L.sides[i] || T.M || T.kind !== 'jack') return; const mx = maxSide(T.lv);
  if(!trusted) side = (Array.isArray(side) ? side : []).slice(0, 3).map((x, k) => { const c = x && WC.card(x.id), v = c ? c.power : Number(x && x.v) | 0; return {id: c ? c.id : 's' + k, v, sign: x && x.sign < 0 ? -1 : 1, en: c ? c.en : ''}; }).filter(x => x.v >= 1 && x.v <= mx);
  L.sides[i] = side; wtSendAll(); if(!T.M) wtWaitPick(); if(L.sides.every(Boolean)) wtBegin(); }
function wtBegin(){ const L = T.lx, c = L.cfg;
  if(T.kind === 'count') T.M = WD.countMatch({level: c.lv, seed: c.seed, hands: L.hands, shelfOf: shelfOfCard});
  else T.M = WD.jackMatch({level: c.lv, seed: c.seed, target: c.target, sides: L.sides});
  T.dealt = false; L.pick = [null, null]; L.ev = null; wtSendAll(); wtView(); setTimeout(wtBots, 0); }
// the host's own screen after a change (the host phone = seat 0 · the 📺 TV = its own view)
function wtView(){ if(!wtOn()) return; const L = T.lx; if(!T.M) return wtWaitPick();
  if(T.kind === 'jack') return renderJack();
  if(L.me < 0) return wtTvCount();
  renderCount(0); }
// ---- one device's view of the match (host order → that phone's order: you = 0) ----
function wtSnap(s){
  const L = T.lx, M = T.M, fl = s === 1, lo = a => fl ? [a[1], a[0]] : [a[0], a[1]], loc = w => (w == null || w < 0) ? w : (fl ? 1 - w : w), id = c => c.id;
  const sn = {kind: T.kind, v: L.v, ready: lo((T.kind === 'count' ? L.hands : L.sides).map(Boolean))};
  if(!M){ sn.phase = 'pick'; return sn; }
  sn.phase = 'play'; const me = s < 0 ? 0 : s, op = 1 - me;
  if(T.kind === 'count'){
    Object.assign(sn, {round: M.round, sudden: M.sudden, rule: M.rule, wins: lo(M.P.map(p => p.wins)), hand: s < 0 ? null : M.P[me].hand.map(id), full: s < 0 ? null : M.P[me].full.map(id),
      oppN: M.P[op].hand.length, picked: L.pick[me] != null, oppPicked: L.pick[op] != null, over: M.over, winner: loc(M.winner)});
    if(L.ev){ const e = L.ev; sn.ev = {round: e.round, rule: e.rule, cards: lo(e.cards).map(id), eff: lo(e.eff), winner: loc(e.winner), sudden: e.sudden}; }
  } else {
    Object.assign(sn, {set: M.set, turn: loc(M.turn), target: M.target, top: M.top, S: lo(M.S).map(x => JSON.parse(JSON.stringify(x))), wins: lo(M.P.map(p => p.wins)), exact: lo(M.P.map(p => p.exact)),
      side: s < 0 ? null : M.P[me].side.map(x => Object.assign({}, x)), oppSide: M.P[op].side.map(x => ({used: !!x.used})), setOver: M.setOver, setWinner: loc(M.setWinner), over: M.over, winner: loc(M.winner), sudden: M.sudden});
  }
  return sn;
}
// ---- a phone: build its own match from a view (the other hand = placeholders, drawn as backs) ----
function wtPh(n){ return Array.from({length: n}, () => ({id: '?', power: 0, en: '?', cat: '', ph: true})); }
function wtFillCount(M, sn){ const C = id => WC.card(id) || {id, power: 0, en: '?', cat: ''};
  if(sn.hand){ M.P[0].hand = sn.hand.map(C); M.P[0].full = sn.full.map(C); } M.P[1].hand = wtPh(sn.oppN); M.P[0].wins = sn.wins[0]; M.P[1].wins = sn.wins[1];
  Object.assign(M, {round: sn.round, rule: sn.rule, sudden: sn.sudden, over: sn.over, winner: sn.winner, oppPicked: !!sn.oppPicked}); }
function wtShadowCount(sn){ const M = {kind: 'count', level: T.lv, shelfOf: shelfOfCard, P: [0, 1].map(i => ({i, hand: [], full: [], wins: 0, played: []})), round: 0, rule: null, log: [], over: false, winner: -1, sudden: false}; wtFillCount(M, sn); return M; }
function wtShadowJack(sn){
  const M = {kind: 'jack', level: T.lv, target: sn.target, top: sn.top, set: sn.set, turn: sn.turn, S: sn.S, deck: [], log: [],
    P: [{i: 0, side: sn.side || [], wins: sn.wins[0], exact: sn.exact[0]}, {i: 1, side: sn.oppSide.map((x, k) => ({id: 'o' + k, v: 0, sign: 1, used: x.used})), wins: sn.wins[1], exact: sn.exact[1]}],
    setOver: sn.setOver, setWinner: sn.setWinner, over: sn.over, winner: sn.winner, sudden: sn.sudden};
  if(T.M && T.M.cheerSet != null) M.cheerSet = T.M.cheerSet; return M; }
function wtGotSnap(sn, full){
  const L = T.lx; if(!sn || (!full && L.snap && sn.v <= L.snap.v)) return;
  L.snap = sn; L.busy = false;
  if(sn.phase === 'pick'){ if(sn.ready[0]) L.sent = true; if(L.sent) wtWaitPick(); return; }
  L.sent = true;
  if(T.kind === 'jack'){ T.M = wtShadowJack(sn); renderJack(); return; }
  if(!T.M || full){ clearInterval(PICK.timer); T.M = wtShadowCount(sn); L.myPlay = null; T.lock = false; T.dealt = false; renderCount(0); if(T.M.over) finishTable(); return; }
  if(sn.ev && sn.ev.round === T.M.round + 1 && L.myPlay != null){   // my round is decided → the one-device reveal, with the host's round
    const i = L.myPlay; L.myPlay = null; WTL.pend = sn;
    Promise.resolve(L.outP).then(() => { if(!wtOn() || T.lx !== L || WTL.pend !== sn) return; reveal(i, 0); }); return; }
  if(sn.ev && sn.ev.round > T.M.round){ T.M = wtShadowCount(sn); L.myPlay = null; T.lock = false; renderCount(0); if(T.M.over) finishTable(); return; }   // 🤖 played for me while I was away
  T.M.oppPicked = !!sn.oppPicked; wtMarkOpp();
}
const WTL = {pend: null};
// ---- the one-device functions, with the link folded in ----
WD.countPlay = (function(f){ return function(M){
  if(!wtOn() || M !== T.M) return f.apply(this, arguments);
  const L = T.lx;
  if(L.role === 'host'){ const ev = f.apply(this, arguments); L.ev = ev; L.pick = [null, null]; wtSendAll(); setTimeout(wtBots, 0); return ev; }
  const sn = WTL.pend; WTL.pend = null; const e = sn.ev;
  wtFillCount(M, sn);
  return {round: e.round, rule: e.rule, cards: e.cards.map(id => WC.card(id) || {id, power: 0, en: '?'}), eff: e.eff, winner: e.winner, sudden: e.sudden};
}; })(WD.countPlay);
beginCount = (function(f){ return function(){
  if(!wtOn()) return f.apply(this, arguments);
  const L = T.lx, h = T.hands[0]; if(!h) return;
  if(L.role === 'host') return wtGotHand(L.me, h, true);
  L.sent = true; Link.send('wthand', {id: L.id, ids: h.map(c => c.id)}, {sure: true}); wtWaitPick();
}; })(beginCount);
renderCount = (function(f){ return function(){
  if(!wtOn()) return f.apply(this, arguments);
  const L = T.lx; if(!T.M) return wtWaitPick(); if(L.me < 0) return wtTvCount();
  const r = f.call(this, 0); L.screen = 'play';
  const mine = L.role === 'host' ? L.pick[0] : (L.myPlay != null ? L.myPlay : (L.snap && L.snap.picked && L.snap.round === T.M.round ? -1 : null));
  if(mine != null){ L.screen = 'wait'; wtWaitMsg(); }
  wtMarkOpp(); return r;
}; })(renderCount);
countPick = (function(f){ return async function(seat, i){
  if(!wtOn()) return f.apply(this, arguments);
  const L = T.lx; if(T.lock || L.screen !== 'play' || T.M.over) return; pointAt(null); T.lock = true; L.screen = 'wait';
  if(L.role === 'host'){ L.pick[0] = i; wtSendAll(); L.outP = playOut(0, i); await L.outP; T.lock = false; if(T && T.lx === L && L.screen === 'wait'){ wtWaitMsg(); wtTryReveal(); } return; }
  L.myPlay = i; Link.send('wtplay', {id: L.id, round: T.M.round, i}, {sure: true});
  L.outP = playOut(0, i); await L.outP; T.lock = false; if(T && T.lx === L && L.screen === 'wait') wtWaitMsg();
}; })(countPick);
reveal = (function(f){ return function(){ const L = wtOn() ? T.lx : null; if(L) L.screen = 'reveal'; const r = f.apply(this, arguments); if(L && L.me < 0) wtTvNext(); return r; }; })(reveal);
function wtWaitMsg(){ const L = T.lx; $('t-bottom').innerHTML = '<div class="tmsg wt-wait">🙈 Your card is face down</div>';
  const s0 = $('t-slot0'); if(s0) s0.innerHTML = backHtml(T.names[0]);
  const m = $('t-msg'); if(m) m.textContent = '⏳ Waiting for ' + wtNm(1) + '…'; wtMarkOpp(); }
// the other card lies face-down in its slot until both are down
function wtMarkOpp(){ if(!wtOn() || T.kind !== 'count' || !T.M) return; const L = T.lx; if(L.screen !== 'play' && L.screen !== 'wait') return;
  const op = L.role === 'host' ? L.pick[1] != null : !!T.M.oppPicked, s1 = $('t-slot1'); if(s1) s1.innerHTML = op ? backHtml(T.names[1]) : '';
  if(L.screen === 'play' && op){ const m = $('t-msg'); if(m) m.innerHTML = UI.esc(T.names[0]) + ', pick a card! <small class="wt-ready">✅ ' + UI.esc(wtNm(1)) + ' is ready</small>'; } }
// ---- host: a card came in from a phone ----
function wtGotPlay(i, d){ const L = T.lx, M = T.M; if(!M || M.over || T.kind !== 'count' || !d || d.round !== M.round || L.pick[i] != null) return;
  if(!(d.i >= 0 && d.i < M.P[i].hand.length)) return;
  L.pick[i] = d.i; wtSendAll(); if(L.me < 0){ if(L.screen !== 'reveal') wtTvCount(); } else wtMarkOpp(); wtTryReveal(); }
function wtTryReveal(){ if(!wtOn()) return; const L = T.lx, M = T.M; if(!M || M.over || T.kind !== 'count' || L.pick[0] == null || L.pick[1] == null) return;
  if(L.me >= 0 ? L.screen !== 'wait' || T.lock : L.screen === 'reveal') return;   // the host's own card is still flying / the TV still shows the last round
  reveal(L.pick[0], L.pick[1]); }
// ---- 📺 TV: both hands as backs, the slots fill face-down, then the reveal ----
function wtTvCount(){ const M = T.M, P = M.P, L = T.lx;
  const backs = (n, nm) => Array.from({length: n}, (_, k) => backHtml(nm).replace('class="wcard mini back"', 'class="wcard mini back" style="--k:' + k + '"')).join('');
  $('t-round').textContent = M.sudden ? '⚡ sudden death' : 'Round ' + Math.min(5, M.round + 1) + ' / 5'; $('t-score').textContent = P[0].wins + ' : ' + P[1].wins; setDots(0, P[0].wins); setDots(1, P[1].wins);
  $('t-hh1').innerHTML = backs(P[1].hand.length, T.names[1]); $('t-hh0').innerHTML = backs(P[0].hand.length, T.names[0]);
  const sl = i => '<div class="slot" id="t-slot' + i + '">' + (L.pick[i] != null ? backHtml(T.names[i]) : '') + '</div>';
  $('t-mid').innerHTML = '<div class="goal">' + GOAL.count + '</div><div class="rulecard flip">' + ruleText(M.rule) + '</div><div class="duel" id="t-duel">' + sl(0) + '<div class="vs">⚔️</div>' + sl(1) + '</div>' +
    '<div class="tmsg" id="t-msg">📱 ' + [0, 1].map(i => (L.pick[i] != null ? '✅ ' : '⏳ ') + UI.esc(wtNm(i))).join(' · ') + '</div><div class="tbtns" id="t-btns"></div>';
  $('t-bottom').innerHTML = ''; L.screen = 'play'; setTimeout(wtTryReveal, 0); }
function wtTvNext(){ const L = T.lx, M = T.M, gid = T.gid, nx = $('t-next'); if(!nx) return;
  nx.onclick = () => { if(!T || T.gid !== gid || T.lx !== L) return; T.lock = false; if(M.over) finishTable(); else wtTvCount(); };
  setTimeout(() => { const b = $('t-next'); if(T && T.gid === gid && T.lx === L && L.screen === 'reveal' && b) b.click(); }, (M.over ? 2200 : 2600) * SPEED); }
// ---- 🂡 WisJack: actions go to the host; the phone shows the new view ----
['jackSide', 'jackEnd', 'jackNewSet', 'jackBot'].forEach(k => { const f = WD[k]; WD[k] = function(M){
  if(!wtOn() || M !== T.M) return f.apply(this, arguments);
  const L = T.lx;
  if(L.role === 'host'){ const r = f.apply(this, arguments); wtSendAll(); setTimeout(wtBots, 0); return r; }
  if(k === 'jackSide'){ if(L.busy || M.turn !== 0) return false; const r = f.apply(this, arguments); if(r){ L.busy = true; Link.send('wtact', {id: L.id, set: M.set, a: 'side', k: arguments[1]}, {sure: true}); } return r; }   // no dice in a side card: shown at once
  if(k === 'jackEnd'){ if(!L.busy && M.turn === 0){ L.busy = true; Link.send('wtact', {id: L.id, set: M.set, a: arguments[1] ? 'stand' : 'end'}, {sure: true}); } return null; }
  if(k === 'jackNewSet'){ if(!L.busy){ L.busy = true; Link.send('wtnext', {id: L.id, set: M.set}, {sure: true}); } return; }
  return null;
}; });
botTurn = (function(f){ return function(){ if(!wtOn()) return f.apply(this, arguments); }; })(botTurn);   // the host's wtBots plays 🤖 turns
renderJack = (function(f){ return function(){
  if(!wtOn()) return f.apply(this, arguments);
  const L = T.lx, M = T.M; if(!M) return wtWaitPick();
  if(L.me < 0) T.firstTurn = false;   // 📺 no 👆 on the TV (its buttons are taken away below)
  const r = f.apply(this, arguments); L.screen = 'play';
  const tv = L.me < 0, mine = !tv && M.turn === 0 && !M.setOver;
  if(tv){ $('t-bottom').querySelectorAll('.jside, .tbtns, .meter, .meter + .tmsg').forEach(e => e.remove()); pointAt(null); }
  if(!M.setOver){ const sm = $('t-mid').querySelector('.rulecard .sm'), who = wtNm(M.turn);
    if(sm) sm.textContent = tv ? '📱 ' + who + '\'s turn' : mine ? '🫵 Your turn' : '⏳ ' + who + (T.names[M.turn] ? '\'s turn…' : ' is thinking…');
    const m = $('t-msg'); if(m && !mine) m.textContent = tv ? '📱 ' + who + ' plays on their phone' : '⏳ ' + who + ' is playing — watch their total'; }
  if(L.busy) document.querySelectorAll('#j-end, #j-stand, #t-bottom .jside button, #t-next').forEach(b => { b.disabled = true; b.classList.remove('glow'); });
  const os = M.P[tv ? 1 : 1].side.filter(x => !x.used).length, hh = $('t-hh1');
  if(hh && !tv) hh.insertAdjacentHTML('beforeend', '<div class="wt-oside" title="' + UI.esc(wtNm(1)) + '\'s side cards (secret)">' + backHtml(T.names[1]).repeat(os) + '<span>🎴 ' + os + '</span></div>');
  return r;
}; })(renderJack);
function wtGotAct(i, d){ const L = T.lx, M = T.M; if(!M || T.kind !== 'jack' || !d) return;
  if(M.over || M.setOver || M.turn !== i || d.set !== M.set){ wtSendAll(); return; }   // not your turn (any more) → a fresh view
  if(d.a === 'side'){ if(!WD.jackSide(M, Number(d.k) | 0)) wtSendAll(); else tableGest(L.me < 0 ? i : 1, 'flip'); }
  else WD.jackEnd(M, d.a === 'stand');
  wtView(); }
function wtGotNext(d){ const M = T.M; if(!M || T.kind !== 'jack' || !d || !M.setOver || M.over || d.set !== M.set) return; WD.jackNewSet(M); wtView(); }
// ---- host: 🤖 plays an empty seat or a dropped phone ----
function wtBots(){ if(!wtOn() || T.lx.role !== 'host' || !T.M || T.M.over) return; const L = T.lx, M = T.M;
  if(T.kind === 'count'){ let ch = false; [0, 1].forEach(i => { if(L.pick[i] == null && wtSeatBot(i) && M.P[i].hand.length){ L.pick[i] = WD.countBot(M, i, T.lv, T.r); ch = true; } });
    if(ch){ wtSendAll(); if(L.me < 0){ if(L.screen !== 'reveal') wtTvCount(); } else wtMarkOpp(); wtTryReveal(); } return; }
  if(M.setOver || !wtSeatBot(M.turn)) return;
  const tok = M.set + ':' + M.turn + ':' + M.S.map(s => s.table.length + (s.stood ? 's' : '')).join(','); if(L.botTok === tok) return; L.botTok = tok; TB.think = true;
  setTimeout(() => { TB.think = false; if(!wtOn() || T.M !== M || L.botTok !== tok || M.setOver || M.over) return; L.botTok = ''; WD.jackBot(M, T.lv); wtView(); }, 800 * SPEED); }
// ---- 🏁 the result: the host saves feats for both · 🔁 Play again · ◀ Room · 🚪 End / Leave ----
finishTable = (function(f){ return function(){
  if(!wtOn()) return f.apply(this, arguments);
  const L = T.lx, host = L.role === 'host', cap = L.tv && !host && Link.captain && Link.captain() === Link.seat(), two0 = T.two;
  T.two = !!(T.names[0] && T.names[1]);
  let r; try{ r = wbQuiet(() => f.apply(this, arguments)); } finally { T.two = two0; }
  L.screen = 'over'; NOTES.length = 0; const sv = $('save-note');
  if(host){ if(sv) sv.textContent = '💾 Saving feats…'; const M = T.M, gid = G_LABEL[T.kind][2];
    L.cfg.names.forEach((n, i) => { if(n) saveFeatsG(n, gid, {games: 1, wins: M.winner === i ? 1 : 0, sweeps: M.winner === i && M.P[1 - i].wins === 0 ? 1 : 0, exact: T.kind === 'jack' ? M.P[i].exact : undefined}, i); }); }
  else if(sv) sv.textContent = '💾 Saved by ' + (L.tv ? 'the 📺 TV' : (L.cfg.host || 'the host')) + ' for everyone';
  const bt = $('t-res').querySelector('.btns');
  if(bt){ bt.innerHTML = (host || cap ? '<button class="btn sp-btn sp-primary" data-sound="pop" id="wt-again">🔁 Play again</button>' : '<div class="lx-wait" style="font-weight:700;opacity:.8">⏳ ' + UI.esc(L.tv ? 'The TV or the first player' : (L.cfg.host || 'The host')) + ' can start the next game</div>') +
      (WBL.viaCover ? '<button class="btn soft sp-btn sp-secondary" data-sound="tap" id="wt-room">◀ Room</button>' : '') +
      '<button class="btn soft sp-btn sp-secondary" data-sound="none" id="wt-exit">' + (host ? '🚪 End the room' : '🚪 Leave') + '</button>';
    const ag = $('wt-again'); if(ag) ag.onclick = host ? () => { WBL.game = T.kind; wtHostGo(); } : () => { Link.ask('again'); UI.toast('📺 Asking the TV…'); };
    const rm = $('wt-room'); if(rm) rm.onclick = () => wtToCover(); $('wt-exit').onclick = () => wbExit(); }
  return r;
}; })(finishTable);
leaveTable = (function(f){ return function(){
  if(!wtOn()) return f.apply(this, arguments);
  if(T.M && T.M.over) return wbExit();
  const host = T.lx.role === 'host';
  UI.confirm({icon: '◀', title: host ? 'End the game for everyone?' : 'Leave this game?', body: host ? 'You are the ' + (T.lx.tv ? '📺 Room hostess' : 'host') + ' — the game stops on both phones.' : '🤖 plays your cards until you come back.',
    okText: host ? 'End game' : 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) wbExit(); });
}; })(leaveTable);
function wtStop(quiet){ if(window.Cheer) try{ Cheer.unmount(); }catch(e){} if(TB.raf) cancelAnimationFrame(TB.raf); TB.raf = 0; TB.think = false; clearInterval(PICK.timer); closePeek(); pointAt(null);
  if(T) T.lx = null; T = null; $('t-res').classList.add('hidden'); if(!quiet) view('learn'); }
function wtToCover(){ const o = document.querySelector('.lx-over'); if(o) o.remove(); wtStop(); openCover(); try{ if(WdCover && Link.cover.show) Link.cover.show(WdCover); }catch(e){} }   // ◀ Room: the room stays open
// "(you)" · 🎴 the other player's secret side cards — put in the first time a table is linked
function wtCss(){ if(document.getElementById('wt-css')) return; const st = document.createElement('style'); st.id = 'wt-css';
  st.textContent = '#v-table .wt-oside{display:flex;align-items:center;gap:0;margin:0 0 0 10px;flex:0 0 auto}#v-table .wt-oside .wcard.mini{width:16px;height:23px;min-width:0;font-size:0;margin-left:-5px;transform:none}#v-table .wt-oside .wcard.mini:first-child{margin-left:0}#v-table .wt-oside span{font-size:.75rem;font-weight:800;opacity:.85;margin-left:3px}' +
    '#v-table .wt-ready{display:block;font-size:.8em;opacity:.85}#v-table .wt-wait{opacity:.8;font-weight:700;text-align:center;padding:6px 0}';
  document.head.appendChild(st); }
function wtWire(){
  Link.on('wtgo', d => { if(Link.isHost() || !d || !d.cfg) return; const same = wtOn() && T.lx.id === d.cfg.id; if(!same) wtStart(d.cfg, d.you, 'guest'); wtGotSnap(d.snap, true); });
  Link.on('wts', d => { if(Link.isHost() || !wtOn() || !d || d.id !== T.lx.id) return; wtGotSnap(d.snap, false); });
  Link.on('wtsit', d => { if(Link.isHost() || !d) return; UI.toast((d.game || '🃏') + ' is for 2 players — you play the next game!'); });
  const idx = seat => wtOn() ? T.lx.cfg.lseats.indexOf(seat) : -1, mine = d => Link.isHost() && wtOn() && d && d.id === T.lx.id;
  Link.on('wthand', (d, seat) => { if(!mine(d)) return; const i = idx(seat); if(i < 0 || !Array.isArray(d.ids)) return; wtGotHand(i, d.ids.map(id => WC.card(id))); });
  Link.on('wtside', (d, seat) => { if(!mine(d)) return; const i = idx(seat); if(i >= 0) wtGotSide(i, d.side); });
  Link.on('wtplay', (d, seat) => { if(!mine(d)) return; const i = idx(seat); if(i >= 0) wtGotPlay(i, d); });
  Link.on('wtact', (d, seat) => { if(!mine(d)) return; const i = idx(seat); if(i >= 0) wtGotAct(i, d); });
  Link.on('wtnext', (d, seat) => { if(!mine(d) || idx(seat) < 0) return; wtGotNext(d); });
  Link.on('lk:ask', (d, seat) => { if(!Link.isHost() || !d || d.what !== 'again' || !wtOn() || !T.M || !T.M.over || !T.lx.tv) return; if(Link.captain() !== seat) return; WBL.game = T.kind; wtHostGo(); });   // 📺 the first player's 🔁
  Link.on('leave', e => { if(!Link.isHost() || !wtOn() || (T.M && T.M.over)) return; const i = idx(e.seat); if(i < 0 || T.lx.away[i]) return;
    T.lx.away[i] = true; UI.toast('📶 ' + T.lx.cfg.names[i] + ' dropped out — 🤖 plays their cards until they come back'); wtFill(i); wtBots(); });
  const back = e => { if(!Link.isHost() || !wtOn()) return; const i = idx(e.seat); if(i < 0) return;
    if(T.lx.away[i]){ T.lx.away[i] = false; UI.toast('👋 ' + T.lx.cfg.names[i] + ' is back!'); UISound.play('success'); }
    wtSendGo(e.seat); };
  Link.on('rejoin', back); Link.on('join', back);
}
GameParts.loaded('WisDeck_link', 'lk-wd2');
