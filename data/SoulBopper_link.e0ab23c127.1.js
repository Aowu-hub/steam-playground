
/* 📡 LINK (lk-8a): 👻💣 Soul Bopper on own devices — LinkKit plan §55 (📡 Multiplayer chat, Aowu 2026-11-20 22:24 "go").
   Born split: this whole block is the part SoulBopper_link (GameParts), with the shared 🕹️ LinkPads part; the main file only holds the door
   (bopNeed / bopOwn + the ?link / 📺 station hooks). The room lives on the 🎬 cover (Link.cover, pads: true):
     📺 This screen is the game (TV / PC / iPad) — every player on a phone · 🎮 Host + play here (tablet: you play by touch, friends on phones) · 🕹️ Join as a controller.
   ONE device runs the unchanged engine (BOP). Each phone = one more player "on the keyboard": its stick arrives as that seat's G.touch dir,
   💣 as G.plantDown + BOP.press, ✨ as BOP.press, a quick double push = 💨 dash (tapDir). Nothing of the maze is sent to the phones —
   LinkPads sends each phone its own status (❤️ 💣 🔥 🏆 · button names · ghost / out) + buzz moments (💥 caught · 🎯 got one · 🏆 round won …).
   📴 a phone that drops out → the engine's own 🤖 brain plays that seat (p.auto) → back = "👋 … is back!". Saves: the screen saves feats for
   every person (as 👥 same-device play). 💀 Hardcore + 🗺️ Stage stay on one device for now (Stage co-op = lk-8b). */
const SBL = {wired: false, viaCover: false, cfg: null, pads: null, picks: null, station: null};
const SBL_MODES = ['battle', 'classic', 'hold'];
const SBL_CNAME = ['🟧 Orange', '🟦 Blue', '🟩 Green', '🟪 Purple'];
const SBL_PAD = {stick: '4way', hint: '🕹️ Drag = walk · 💣 = bomb · push twice = 💨 dash', btns: [{k: 'plant', ic: '💣', nm: 'Plant', rim: '#FF9F1C', main: true}, {k: 'skill', ic: '✨', nm: 'Skill', rim: '#3DDCB4'}]};
function sblLevelOk(i){ return i >= 0 && i <= 4 && canPlay(i); }
function sblNow(){ return SBL.st || {mode: SET.mode, level: SET.level}; }   // 📺 from the Game Station: the vote (in memory) — SET = the TV's own picks, never changed
function sblFix(){ if(SBL.st) return; if(SBL_MODES.indexOf(SET.mode) < 0) SET.mode = 'battle'; if(!sblLevelOk(SET.level)){ const rec = AGE_START[S.age] || 0; SET.level = sblLevelOk(rec) ? rec : 0; } }
function sblLabel(tv){ const n = sblNow(), m = MODES[n.mode] || MODES.battle, L = BOP.LEVELS[n.level]; return m.icon + ' ' + m.name + ' · ' + L.name + (tv ? ' · 📺 on the TV' : ''); }
const SB_ROOM = {game: 'SoulBopper', title: '👻💣 Soul Bopper', page: 'soulbopper', kind: 'soul-bopper', seats: 4, min: 2, pads: true,
  url: WEBAPP_URL + '?page=soulbopper', name: () => S.player, av: () => myAvatar(S.player), drawAvatar: (cv, p) => drawPreviewCanvas(cv, myAvatar(p.name), {name: p.name, t: 1}),
  label: tv => sblLabel(tv), bot: () => '· bots at ' + BOP.LEVELS[sblNow().level].name, picks: el => sblPicks(el),
  how: 'Gameroom → 👻💣 Soul Bopper → 📱 Own devices → 🕹️ Join · or scan · 1 = you vs 🤖 bots · 2–4 = everyone in one maze',
  onLink: () => { SBL.viaCover = true; sblFix(); }, onStart: () => { SBL.viaCover = true; sblGo(); }};
// the host's picks as chips in the room card: 🎮 mode · 🎚️ level · 🎨 world — tap = the next one
function sblPicks(el){
  sblFix(); const n = sblNow(), m = MODES[n.mode], L = BOP.LEVELS[n.level], T = THEMES[SET.theme] || THEMES.dino;
  el.innerHTML = '<button class="lkc-chip" data-k="mode" data-sound="none">' + m.icon + ' ' + UI.esc(m.name) + '</button><button class="lkc-chip" data-k="lvl" data-sound="none">🎚️ ' + UI.esc(L.name) + '</button>' +
    '<button class="lkc-chip" data-k="theme" data-sound="none">' + T.icon + ' ' + UI.esc(T.name) + '</button>';
  if(SBL.st){ el.querySelectorAll('.lkc-chip').forEach(b => { b.disabled = true; }); return; }   // 📺 from the Game Station: the vote decides — the TV's own picks stay as they were
  el.querySelectorAll('.lkc-chip').forEach(b => b.onclick = e => { e.stopPropagation(); const nx = (ks, v) => ks[(ks.indexOf(v) + 1) % ks.length];
    if(b.dataset.k === 'mode') SET.mode = nx(SBL_MODES, SET.mode); else if(b.dataset.k === 'lvl') SET.level = nx([0, 1, 2, 3, 4].filter(sblLevelOk), SET.level); else SET.theme = nx(THEME_KEYS, SET.theme);
    savePrefs(); UISound.play('tap'); sblPicks(el); try{ if(Link.isHost()) Link.setLabel(sblLabel(Link.hostess())); }catch(er){} });
}
function sblOpen(C){ sblWire(); Link.cover(C, SB_ROOM); }
// ▶ Start on the cover (host) / 🔁 Play again: the linked players → the maze's human seats (the TV itself is no seat)
function sblGo(){
  sblFix(); const keep = {mode: SET.mode, level: SET.level}, now = sblNow();
  const tv = !!(Link.hostess && Link.hostess()), me = Link.seat();
  const list = Link.players().filter(p => p.name && (p.on || p.me) && !p.screen).sort((a, b) => a.seat - b.seat).slice(0, MODES[now.mode].max);
  if(list.length < (tv ? 1 : 2)){ UISound.play('error'); UI.toast(tv ? '📺 Wait for a player to join' : '📡 Wait for a friend to join'); return; }
  const names = list.map(p => p.name);
  SBL.cfg = {id: Date.now().toString(36), tv, station: !!SBL.st, mode: now.mode, level: now.level, seats: list.map((p, k) => ({lseat: p.seat, g: k, name: p.name, local: !tv && p.seat === me}))};
  if(G) cancelAnimationFrame(G.raf); G = null; hideResult();
  const oldH = window.humanList; window.humanList = () => names.slice(); SBL.starting = SBL.cfg;
  SET.mode = now.mode; SET.level = now.level;
  try{ startMatch(); } finally { window.humanList = oldH; SBL.starting = null; if(SBL.st){ SET.mode = keep.mode; SET.level = keep.level; savePrefs(); } }
  if(!G) return;
  G.link = SBL.cfg; G.plantDown = G.plantDown || {};
  const M = G.M;
  const where = p => (p.sy < M.H / 2 ? 'top' : 'bottom') + '-' + (p.sx < M.W / 2 ? 'left' : 'right');
  SBL.pads = Link.pads.screen({game: 'SoulBopper', title: sblLabel(false), kind: 'soul-bopper', host: tv ? 'the TV' : S.player, pad: SBL_PAD,
    seats: SBL.cfg.seats.filter(s => !s.local).map(s => { const p = M.P[s.g]; return {lseat: s.lseat, gseat: s.g, name: s.name, col: chipCol(p), cname: M.teams ? (p.team ? '🔵 Team Moon' : '🟠 Team Sun') : SBL_CNAME[s.g] || '', where: where(p)}; }),
    onDir: (g, d) => { if(!G || !G.link) return; G.touch[g] = {dir: d}; if(d) tapDir(g, d); },
    onBtn: (g, k, on) => { if(!G || !G.link) return; if(k === 'plant') G.plantDown[g] = !!on; if(on && !G.paused && !G.hold) BOP.press(G.M, g, k === 'skill' ? 'skill' : 'plant'); },
    onDrop: g => { if(!G || !G.link || G.over) return; const p = G.M.P[g]; if(!p) return; p.auto = true; G.touch[g] = {dir: null}; G.plantDown[g] = false; banner('🤖 A robot plays for ' + p.name + ' until they come back', 'bad'); sblChipTag(g, true); },
    onBack: g => { if(!G || !G.link) return; const p = G.M.P[g]; if(!p || !p.auto) return; p.auto = false; banner('👋 ' + p.name + ' is back!', 'good'); UISound.play('success'); sblChipTag(g, false); },
    onPause: (on, name) => { if(!G || G.over || !!G.paused === on) return; G.paused = on; UI.pauseIcon($('pause-btn'), on); banner(on ? '⏸ ' + name + ' paused' : '▶ ' + name + ' — go!', 'good'); },
    status: g => sblStatus(g)});
}
function sblChipTag(g, on){ const el = G && G.chipEls && G.chipEls[g]; if(!el) return; el.classList.toggle('sbl-bot', !!on); }
// what one phone shows: ❤️ lives · 💣 bombs · 🔥 reach · 🏆 rounds won — and the right name on ✨ (👟 kick · 🤾 toss · 🪤 trap · 💩 throw)
function sblStatus(g){
  if(!G || !G.M) return null; const M = G.M, p = M.P[g]; if(!p) return null;
  const out = !!p.gone || (!p.alive && !p.ghost && !p.edge && M.mode !== 'hold');
  const chips = [];
  if(M.mode === 'battle') chips.push(['🏆', (M.wins[g] || 0) + '/' + M.need]);
  if(M.mode !== 'hold') chips.push(['❤️', String(Math.max(0, p.lives))]);
  chips.push(['💣', String(p.bombsMax)], ['🔥', String(p.fire)]);
  const btns = p.ghost ? {plant: ['🪤', 'Trap'], skill: ['🪤', 'Trap']} : p.edge ? {plant: ['💩', 'Throw'], skill: ['💩', 'Throw']}
    : {skill: p.toss ? ['🤾', 'Toss'] : p.kick ? ['👟', 'Kick'] : ['✨', 'Skill', true]};
  const line = M.state === 'ready' ? '💣 Get ready…' : out ? '💫 Out — cheer on the others!' : p.ghost ? '👻 Float to someone + 🪤 = trap!' : p.edge ? '💩 Throw from the edge!' : p.auto ? '🤖 The robot is helping you' : M.sd ? '⏰ Sudden death!' : p.inv > 0 ? '✨ Safe for a moment' : '';
  return {chips, btns, line, state: out ? 'out' : p.ghost ? 'ghost' : 'play', glow: p.lives === 1 && M.mode === 'battle' ? {} : {}};
}
// 💥 the engine's moments → a buzz on the right phone(s)
function sblBuzz(list){
  const P = SBL.pads; if(!P || !G || !G.link) return; const M = G.M;
  list.forEach(e => {
    if(e.k === 'caught'){ const p = M.P[e.i], by = M.P[e.by];
      if(p && p.human) P.buzz(e.i, p.lives > 0 && M.mode === 'battle' ? 'hit' : 'out', e.by === e.i ? '😵 Your own bomb!' : by ? '💥 ' + by.name + ' got you!' : '💥 Caught!');
      if(by && by.human && e.by !== e.i) P.buzz(e.by, 'got', '🎯 You got ' + (p ? p.name : 'one') + '!'); }
    else if(e.k === 'ghost'){ const p = M.P[e.i]; if(p && p.human) P.buzz(e.i, 'ghost', '👻 You are a ghost!'); }
    else if(e.k === 'pick'){ const p = M.P[e.i]; if(p && p.human) P.buzz(e.i, 'pick', e.pk === 'error' ? '😵 Error card — backwards!' : '🎁 Power-up!'); }
    else if(e.k === 'swap'){ const g = M.P[e.ghost]; if(g && g.human) P.buzz(e.ghost, 'win', '👻 SOUL SWAP — you are back!'); }
    else if(e.k === 'comeback'){ const p = M.P[e.i]; if(p && p.human) P.buzz(e.i, 'win', '💩 COMEBACK!'); }
    else if(e.k === 'go') P.buzzAll('go', '💣 Go!');
    else if(e.k === 'roundend' && !M.done){ const w = M.P[e.winner]; M.P.forEach(p => { if(p.human) P.buzz(p.i, w && w.i === p.i ? 'win' : 'round', w ? (w.i === p.i ? '🏆 You win round ' + e.round + '!' : '🏁 ' + w.name + ' wins round ' + e.round) : '🤝 Nobody left'); }); }
  });
}
// 🏁 the match is over → every phone gets its own line · the screen's card: 🔁 Play again · ◀ Room · 🚪 End the room
function sblEnd(){
  const P = SBL.pads; if(!P || !G) return; const M = G.M, w = M.P[M.winner];
  const wins = {}, lines = {};
  M.P.forEach(p => { if(!p.human) return; const won = M.winner >= 0 && (M.teams ? M.P[M.winner].team === p.team : M.winner === p.i); if(won) wins[p.i] = 1;
    const s = M.stats[p.i]; lines[p.i] = (won ? '🏆 You win!' : '💪 Good game!') + ' · 💥 ' + (s.catches + s.bots) + ' caught · 🧱 ' + s.blocks + ' blocks'; });
  P.end({icon: w ? (w.human ? '🏆' : '🤖') : '🤝', title: M.mode === 'hold' && M.teams ? (M.winSide ? '🔵 Team Moon' : '🟠 Team Sun') + ' holds the land!' : w ? w.name + (w.human ? ' wins!' : ' (bot) wins this time') : 'Nobody left standing!', lines, wins});
  const row = $('result-card') && $('result-card').querySelector('.gf-r-btns'); if(!row) return;
  const tv = SBL.cfg && SBL.cfg.tv;
  row.innerHTML = '<button class="btn sp-btn sp-primary" id="sbl-again" data-sound="pop">🔁 Play again</button>' + (SBL.viaCover ? '<button class="btn soft sp-btn sp-secondary" id="sbl-room" data-sound="none">◀ Room</button>' : '') +
    '<button class="btn soft sp-btn sp-secondary" id="sbl-exit" data-sound="none">' + (tv ? '🚪 End the room' : '🎚️ Levels') + '</button>';
  $('sbl-again').onclick = () => sblGo(); if($('sbl-room')) $('sbl-room').onclick = () => sblToCover(); $('sbl-exit').onclick = () => sblExit();
}
function sblToCover(){ if(SBL.pads) SBL.pads.stop(); SBL.pads = null; SBL.cfg = null; if(G) cancelAnimationFrame(G.raf); G = null; hideResult(); backToMenu(); openCover(); if(BopCover) Link.cover.show(BopCover); }
function sblExit(){ try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} if(SBL.pads) SBL.pads.stop(); SBL.pads = null; SBL.cfg = null; SBL.viaCover = false; if(G) cancelAnimationFrame(G.raf); G = null; hideResult(); backToMenu(); }
// wraps (only while a linked match runs on THIS screen): pads only for this device's own seats · buzz from the events · the 🏁 card · ⏸ for everyone
function sblWraps(){
  if(window.__sblWraps) return; window.__sblWraps = true;
  const lp = window.layoutPlay; window.layoutPlay = function(){ if(G && !G.link && SBL.starting) G.link = SBL.starting;   // set before the first layout: no corner pads for the phones' seats
    if(!(G && G.link)) return lp.apply(this, arguments);
    const mine = G.link.seats.filter(s => s.local).map(s => s.g), hs = window.humanSeats, it = window.isTouch;
    window.humanSeats = () => mine.slice(); if(!mine.length) window.isTouch = () => false;
    try{ return lp.apply(this, arguments); } finally { window.humanSeats = hs; window.isTouch = it; } };
  const he = window.handleEvents; window.handleEvents = function(list){ const r = he.apply(this, arguments); try{ if(G && G.link && list && list.length) sblBuzz(list); }catch(e){ console.error(e); } return r; };
  const fm = window.finishMatch; window.finishMatch = function(){ const r = fm.apply(this, arguments); try{ if(G && G.link) sblEnd(); }catch(e){ console.error(e); } return r; };
  const tp = window.togglePause; window.togglePause = function(){ const r = tp.apply(this, arguments); try{ if(G && G.link && SBL.pads) SBL.pads.paused(!!G.paused); }catch(e){} return r; };
  // 🏁 the screen's card shows the WINNER's avatar (the TV's own name is nobody's seat)
  if(window.GF && GF.result && !GF.__sbl){ const gr = GF.result; GF.__sbl = true; GF.result = function(o){ try{ if(G && G.link && o && o.buddy){ const w = G.M.P[G.M.winner], p = w && w.human ? w : G.M.P.find(x => x.human); if(p) o.buddy = {name: p.name, av: myAvatar(p.name)}; } }catch(e){} return gr.apply(this, arguments); }; }
  const bm = window.backToMenu; window.backToMenu = function(){ if(SBL.pads && G && G.link){ SBL.pads.stop(); SBL.pads = null; } return bm.apply(this, arguments); };
}
const SBL_CSS = "/* 📡 lk-8a: a dropped phone's seat on the TV — the 🤖 robot holds it until the phone is back */\n.pchip.sbl-bot{outline:3px dashed #9aa4ff;outline-offset:2px;animation:sbl-bot 1.2s ease-in-out infinite;}\n.pchip.sbl-bot .n::after{content:' · 🤖';}\n@keyframes sbl-bot{50%{outline-color:#fff;}}";   // the 🤖 tag on a dropped phone's chip — added only when a room opens
function sblWire(){
  sblWraps(); if(!document.getElementById('sbl-css')){ const st = document.createElement('style'); st.id = 'sbl-css'; st.textContent = SBL_CSS; (document.head || document.documentElement).appendChild(st); } if(SBL.wired || !window.Link) return; SBL.wired = true;
  // 📱 the phone side: LinkPads draws the controller; ◀ Room = back to the cover's room line
  Link.pads.config({drawAvatar: (cv, n) => drawPreviewCanvas(cv, myAvatar(n), {name: n, t: 1}), avatar: n => playAv(myAvatar(n)), onRoom: () => { if(BopCover) Link.cover.show(BopCover); }, onLeave: () => openCover()});
  // 📺 the first player's 🔁 on a TV room
  Link.on('lk:ask', (d, seat) => { if(!Link.isHost() || !d || d.what !== 'again' || !SBL.cfg || !SBL.cfg.tv || !G || !G.over) return; if(Link.captain() === seat) sblGo(); });
  addEventListener('pagehide', () => { try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} });
}
// 🔗 ?page=soulbopper&link=<code> → the cover's 🕹️ Join with the number filled in
function sblUrl(code){ openCover(); if(!BopCover) return; sblOpen(BopCover); Link.cover.join(code); }
// ---- 📺 the TV Game Station (lk-8b, LinkKit plan §55c) ----
// TV (?mode=ltv&st&stv=1&slv=<level>&ssp=<mode>): the main file's door loads this part, then sblStation() opens the cover room as the 📺 Room hostess with the
// voted mode + level (held in memory — the TV's own picks stay) → Station starts it when the voted players are in · phones come by ?link=<room> (the door)
// and get the 🗳️ 🔁 Again / 🎮 Another game bar on their LinkPads result card.
function sblStation(t){
  if(!window.Station) return false;
  if(!Station.on){ if((t | 0) < 60) setTimeout(() => sblStation((t | 0) + 1), 50); return false; }   // Station.game reads the link a moment after the part loads
  if(!Station.tv) return false;
  SBL.st = {mode: SBL_MODES.indexOf(Station.way) >= 0 ? Station.way : 'battle', level: Station.lvl == null ? 0 : Math.max(0, Math.min(4, Station.lvl))};
  openCover(); if(!BopCover) return false;
  sblOpen(BopCover); Link.cover.tv(BopCover, SB_ROOM); return true;
}
if(window.Station) Station.game({url: WEBAPP_URL, page: 'soulbopper', player: () => S.player || CURRENT_PLAYER, start: () => Link.cover.start(), again: () => sblGo(),
  result: () => (G && G.link && G.shown) ? $('result-card') : (Link.pads && Link.pads.resultCard ? Link.pads.resultCard() : null), hide: '.gf-r-btns, .lp-cb, .lp-wait'});
GameParts.loaded('SoulBopper_link', 'lk-8b');
