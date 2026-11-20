
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
   📡 a phone that drops out → its buzzer goes quiet (and an answer it owes = ⏱️ time out at once); it gets the whole match back on rejoin. */
const WBL = {wired: false, games: 0, viaCover: false, applying: false, noQ: false, pend: null, lxNext: null};
const WB_TIE_MS = 30;
function wbOn(){ return !!(B && B.lx); }
function wbIdle(){ try{ if(window.Link && Link.status() !== 'idle') Link.leave(); }catch(e){} }
// ---- the host's room picks (BZ = the same picks as the one-device 🔔 menu) ----
function wbPicks(el){
  const shelf = WC.SHELVES.find(s => s.k === BZ.shelf) || WC.SHELVES[0], cats = WC.catsOf(shelf.k), cat = WC.CAT[BZ.cat] && WC.CAT[BZ.cat].shelf === shelf.k ? WC.CAT[BZ.cat] : cats[0], L = WD.LEVELS[Math.min(2, BZ.lv)];
  BZ.shelf = shelf.k; BZ.cat = cat.k;
  el.innerHTML = '<button class="lkc-chip" data-k="game" data-sound="none">🔔 WisBuzz</button>' +
    '<button class="lkc-chip" data-k="shelf" data-sound="none">' + shelf.icon + ' ' + UI.esc(shelf.en) + '</button>' +
    '<button class="lkc-chip" data-k="cat" data-sound="none">' + cat.icon + ' ' + UI.esc(cat.en) + '</button>' +
    '<button class="lkc-chip" data-k="level" data-sound="none">' + L.icon + ' ' + UI.esc(L.name) + '</button>';
  el.querySelectorAll('.lkc-chip').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.k;
    if(k === 'game') UI.toast('🔔 WisBuzz — 🔢 WisCount + 🂡 WisJack on own devices come next');
    else if(k === 'shelf'){ const S2 = WC.SHELVES, n = S2[(S2.indexOf(shelf) + 1) % S2.length]; BZ.shelf = n.k; BZ.cat = WC.catsOf(n.k)[0].k; }
    else if(k === 'cat') BZ.cat = cats[(cats.indexOf(cat) + 1) % cats.length].k;
    else BZ.lv = (Math.min(2, BZ.lv) + 1) % 3;
    UISound.play('tap'); wbPicks(el); });
}
function wbAv(cv, p){ if(typeof drawPreviewCanvas === 'function') drawPreviewCanvas(cv, myAvatar(p.name), {name: p.name, t: 1}); }
const WB_ROOM = {game: 'WisDeck', title: '🃏 WisDeck', page: 'wisdeck', kind: 'wisdeck', seats: 4, min: 2, url: WEBAPP_URL + '?page=wisdeck', name: () => S.player, av: () => myAvatar(S.player), drawAvatar: (cv, p) => wbAv(cv, p),
  label: tv => '🃏 WisDeck · 🔔 WisBuzz · 2–4 players' + (tv ? ' · 📺 on the TV' : ''),
  how: 'Gameroom → 🃏 WisDeck → 📱 Own devices → 🔗 Join · or scan · 2–4 players, every phone is a buzzer', picks: el => wbPicks(el),
  onLink: () => { WBL.viaCover = true; }, onStart: () => { WBL.viaCover = true; wbHostGo(); }};
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
  else { const R0 = google.script.run, stub = new Proxy({}, {get: (_, k) => k.startsWith('with') ? () => stub : () => {}});
    google.script.run = stub; try{ r = f.apply(this, arguments); } finally { google.script.run = R0; }
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
// ---- leaving ----
function wbStop(){ cancelAnimationFrame(BT); if(B) B.lx = null; B = null; $('b-res').classList.add('hidden'); view('learn'); if(window.Cheer) try{ Cheer.unmount(); }catch(e){} }
function wbExit(){ wbIdle(); const o = document.querySelector('.lx-over'); if(o) o.remove(); wbStop(); WBL.viaCover = false; openCover(); }
function wbToCover(){ const o = document.querySelector('.lx-over'); if(o) o.remove(); wbStop(); openCover(); try{ if(WdCover && Link.cover.show) Link.cover.show(WdCover); }catch(e){} }   // ◀ Room: the room stays open
function wbEnded(msg){
  if(B){ B.over = true; } cancelAnimationFrame(BT);
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
  Link.on('hostleft', e => { if(Link.isHost() || !wbOn()) return; UISound.play('bump'); const h = (B.lx.cfg && B.lx.cfg.host) || 'the host'; wbEnded(e && e.reason === 'lost' ? '📶 Lost the link to ' + h : '👋 ' + h + ' ended the game'); });
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
}
GameParts.loaded('WisDeck_link', 'lk-wd1');
