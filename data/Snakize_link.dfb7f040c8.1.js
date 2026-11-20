
/* 📡 LINK (lk-8c): 🐍 Snakize on own devices — LinkKit plan §55 (📡 Multiplayer chat, after 👻💣 lk-8b's recipe §55c).
   Born split: this whole block is the part Snakize_link (GameParts), with the shared 🕹️ LinkPads part; the main file only holds the door
   (snlNeed / snlOwn + the ?link / 📺 station hooks). The room lives on the 🎬 cover (Link.cover, pads: true):
     📺 This screen is the game (TV / PC / iPad) — every player on a phone · 🎮 Host + play here (tablet: you play by touch, friends on phones) · 🕹️ Join as a controller.
   ONE device runs the unchanged engine (SN). Each phone = one more rider "on the keyboard":
     🍎 Snakeast + 🏰 Snakastle (grid): 4-way stick → turnSeat (the same quick-turn queue as the TV's arrows) · ✨ Skill · 💨 Boost = a short burst meter
       (hold = the dash speed, ~1.6 s full, refills in ~4.5 s — a link-only helper, the engine's own dash does the moving)
     🧭 Snakigate (arena): free 360° stick → G.padAim · 💨 Boost (hold, costs length — the engine's own boost) · ✨ Skill
   Nothing of the board is sent to the phones — LinkPads sends each phone its own status (🐍 length · ❤️ lives · 🏅 / 🏰 · ⏱ · the next skill on ✨)
   + buzz moments (💥 popped · 🎯 got one · ✂️ cut · 🏰 land · 🎁 skill · 🗺️ quest → pick a skill ON the phone).
   📴 a phone that drops out → SN.auto (the engine's own careful player) rides that snake → back = "👋 … is back!". Saves: the screen saves for
   every person (as 👥 same-device play; 1 phone = that player's level result). 💀 Hardcore · ♾️ Endless · 📜 Snaketale stay on one device. */
const SNL = {wired: false, viaCover: false, cfg: null, pads: null, st: null, tank: {}, boost: {}, picking: {}, last: 0};
const SNL_MODES = ['feast', 'gate', 'castle'];
const SNL_CNAME = ['🟥 Red', '🟦 Blue', '🟨 Gold', '🟪 Purple'];
const SNL_BOOST_S = 1.6, SNL_FILL_S = 4.5;   // 💨 grid burst: seconds of boost in a full meter · seconds to refill it
function snlPad(mode){
  const skill = {k: 'skill', ic: '✨', nm: 'Skill', rim: '#FFC845'}, boost = {k: 'boost', ic: '💨', nm: 'Boost', rim: '#7CC8FF'};
  if(mode === 'gate') return {stick: 'free', ready: '🐍 Get ready!', hint: '🕹️ Point = steer · hold 💨 = boost (costs length) · ✨ = skill', btns: [Object.assign({main: true}, boost), skill]};
  return {stick: '4way', ready: '🐍 Get ready!', hint: '🕹️ Push = turn · ✨ = skill · hold 💨 = a speed burst', btns: [Object.assign({main: true}, skill), boost]};
}
function snlLevelOk(m, i){ return i >= 0 && i <= 4 && canPlay(m, i); }
function snlNow(){ return SNL.st || {mode: SET.mode, level: SET.level}; }   // 📺 from the Game Station: the vote (in memory) — SET = the TV's own picks, never changed
function snlFix(){ if(SNL.st) return; if(SNL_MODES.indexOf(SET.mode) < 0) SET.mode = 'feast'; if(!snlLevelOk(SET.mode, SET.level)){ const rec = AGE_START[S.age] || 0; SET.level = snlLevelOk(SET.mode, rec) ? rec : 0; } }
function snlLabel(tv){ const n = snlNow(), m = MODES[n.mode] || MODES.feast; return m.icon + ' ' + m.name + ' · ' + SN.LEVEL_NAMES[n.level] + (tv ? ' · 📺 on the TV' : ''); }
const SNL_ROOM = {game: 'Snakize', title: '🐍 Snakize', page: 'snakize', kind: 'snakize', seats: 4, min: 2, pads: true,
  url: WEBAPP_URL + '?page=snakize', name: () => S.player, av: () => myAvatar(S.player), drawAvatar: (cv, p) => drawPreviewCanvas(cv, myAvatar(p.name), {name: p.name, t: 1}),
  label: tv => snlLabel(tv), bot: () => snlNow().mode === 'feast' ? '· 1 = you alone on the board' : '· robo-snakes at ' + SN.LEVEL_NAMES[snlNow().level], picks: el => snlPicks(el),
  how: 'Gameroom → 🐍 Snakize → 📱 Own devices → 🕹️ Join · or scan · 1 = you (+ 🤖 snakes in 🧭 / 🏰) · 2–4 = everyone on one board',
  onLink: () => { SNL.viaCover = true; snlFix(); }, onStart: () => { SNL.viaCover = true; snlGo(); }};
// the host's picks as chips in the room card: 🎮 mode · 🎚️ level · 🎨 world — tap = the next one
function snlPicks(el){
  snlFix(); const n = snlNow(), m = MODES[n.mode], T = THEMES[SET.theme] || THEMES.dino;
  el.innerHTML = '<button class="lkc-chip" data-k="mode" data-sound="none">' + m.icon + ' ' + UI.esc(m.name) + '</button><button class="lkc-chip" data-k="lvl" data-sound="none">🎚️ ' + UI.esc(SN.LEVEL_NAMES[n.level]) + '</button>' +
    '<button class="lkc-chip" data-k="theme" data-sound="none">' + T.icon + ' ' + UI.esc(T.name) + '</button>';
  if(SNL.st){ el.querySelectorAll('.lkc-chip').forEach(b => { b.disabled = true; }); return; }   // 📺 from the Game Station: the vote decides — the TV's own picks stay as they were
  el.querySelectorAll('.lkc-chip').forEach(b => b.onclick = e => { e.stopPropagation(); const nx = (ks, v) => ks[(ks.indexOf(v) + 1) % ks.length];
    if(b.dataset.k === 'mode'){ SET.mode = nx(SNL_MODES, SET.mode); SET.endless = false; if(!snlLevelOk(SET.mode, SET.level)) SET.level = 0; }
    else if(b.dataset.k === 'lvl') SET.level = nx([0, 1, 2, 3, 4].filter(i => snlLevelOk(SET.mode, i)), SET.level); else SET.theme = nx(THEME_KEYS, SET.theme);
    savePrefs(); UISound.play('tap'); snlPicks(el); try{ if(Link.isHost()) Link.setLabel(snlLabel(Link.hostess())); }catch(er){} });
}
function snlOpen(C){ snlWire(); Link.cover(C, SNL_ROOM); }
function snlWhere(M, s){
  let x, y, W, H; if(M.mode === 'gate'){ x = s.x; y = s.y; W = 0; H = 0; } else { const h = s.body && s.body[0]; if(!h) return ''; x = h[0]; y = h[1]; W = M.n / 2; H = M.n / 2; }
  return (y < H ? 'top' : 'bottom') + '-' + (x < W ? 'left' : 'right');
}
// ▶ Start on the cover (host) / 🔁 Play again: the linked players → the board's riders in seat order (the TV itself is no seat)
function snlGo(){
  snlFix(); const now = snlNow(), tv = !!(Link.hostess && Link.hostess()), me = Link.seat();
  const list = Link.players().filter(p => p.name && (p.on || p.me) && !p.screen).sort((a, b) => a.seat - b.seat).slice(0, 4);
  if(list.length < (tv ? 1 : 2)){ UISound.play('error'); UI.toast(tv ? '📺 Wait for a player to join' : '📡 Wait for a friend to join'); return; }
  SNL.cfg = {id: Date.now().toString(36), tv, station: !!SNL.st, mode: now.mode, level: now.level, seats: list.map((p, k) => ({lseat: p.seat, g: k, name: p.name, local: !tv && p.seat === me}))};
  SNL.tank = {}; SNL.boost = {}; SNL.picking = {}; SNL.last = performance.now();
  if(SNL.pads){ SNL.pads.stop(); SNL.pads = null; }
  const keepE = SET.endless; SET.endless = false; SNL.starting = SNL.cfg;
  try{ startGame({mode: now.mode, level: now.level, seats: list.map(p => ({name: p.name}))}); } finally { SET.endless = keepE; SNL.starting = null; }
  if(!G) return;
  G.link = SNL.cfg; const M = G.M;
  SNL.pads = Link.pads.screen({game: 'Snakize', title: snlLabel(false), kind: 'snakize', host: tv ? 'the TV' : S.player, pad: snlPad(now.mode),
    seats: SNL.cfg.seats.filter(s => !s.local).map(s => { const sn = M.snakes[s.g]; return {lseat: s.lseat, gseat: s.g, name: s.name, col: G.cols[s.g], cname: M.snakes.filter(x => x.human).length > 1 ? SNL_CNAME[s.g] || '' : '🐍 ' + (THEMES[G.theme] || THEMES.dino).name, where: snlWhere(M, sn)}; }),
    onDir: (g, d) => { if(!G || !G.link || G.mode === 'gate' || !d) return; const s = G.M.snakes[g]; if(s && !s.linkAuto) turnSeat(g, d, true); },
    onStick: (g, x, y) => { if(!G || !G.link || G.mode !== 'gate') return; if(Math.hypot(x, y) > 0.25) G.padAim[g] = Math.atan2(y, x); },   // let go = keep the last heading (the snake never stops)
    onBtn: (g, k, on) => { if(!G || !G.link) return; if(k === 'boost'){ SNL.boost[g] = !!on; if(G.mode === 'gate') G.padBoost[g] = !!on; } else if(k === 'skill' && on) useSkillSeat(g); },
    onPick: (g, i) => { if(!G || !G.link) return; const s = G.M.snakes[g]; if(s && s.offer && s.offer[i]){ SN.pickSkill(G.M, g, s.offer[i]); const off = $('offer'); if(off){ off.classList.add('hidden'); off.__for = ''; } } SNL.picking[g] = false; },
    onDrop: g => { if(!G || !G.link || G.over) return; const s = G.M.snakes[g]; if(!s) return; s.linkAuto = true; G.padBoost[g] = false; G.padAim[g] = null; SNL.boost[g] = false; banner('🤖 A robot rides for ' + s.name + ' until they come back', 'bad', 1800); },
    onBack: g => { if(!G || !G.link) return; const s = G.M.snakes[g]; if(!s || !s.linkAuto) return; s.linkAuto = false; banner('👋 ' + s.name + ' is back!', 'good', 1400); UISound.play('success'); },
    onPause: (on, name) => { if(!G || G.over || !!G.paused === on) return; G.paused = on; UI.pauseIcon($('pause-btn'), on); banner(on ? '⏸ ' + name + ' paused' : '▶ ' + name + ' — go!', 'good', on ? 600000 : 900); },
    status: g => snlStatus(g)});
}
// what one phone shows: 🐍 length · ❤️ lives · 🏅 rank / 🏰 land · ⏱ — and the NEXT skill's name on ✨
function snlStatus(g){
  if(!G || !G.M) return null; const M = G.M, s = M.snakes[g]; if(!s) return null;
  const out = !s.alive && s.respawnT == null, popped = !s.alive && s.respawnT != null, chips = [];
  if(M.mode === 'castle'){ chips.push(['🏰', Math.floor(s.land || 0) + '%'], ['🚩', String(s.flags || 0)]); }
  else { const L = SN.lenOf(M, s); chips.push(['🐍', M.mode === 'feast' && M.target ? L + '/' + M.target : String(L)]); if(M.mode === 'gate') chips.push(['🏅', '#' + (SN.gateRank(M).findIndex(x => x.i === g) + 1)]); }
  if(M.mode !== 'castle' || (M.L && M.L.lives)) chips.push(['❤️', String(Math.max(0, s.lives))]);   // 🏰 no lives on most castle levels (a cut = back home)
  if(M.time) chips.push(['⏱', fmtS(Math.max(0, M.time - M.t))]);
  const nk = nextSkill(s), sk = nk && SN.SKILLS[nk], cool = {}, glow = {};
  if(!nk && s.start && s.cd > 0) cool.skill = Math.min(1, s.cd / Math.max(0.1, M.skillCd || 8));
  if(s.extra && s.extra.length) glow.skill = 1;
  if(M.mode !== 'gate'){ const t = SNL.tank[g] == null ? 1 : SNL.tank[g]; if(t < 1) cool.boost = 1 - t; }
  const btns = {skill: sk ? [sk.icon, sk.name] : ['✨', 'Skill', !(s.start && s.cd > 0)]};
  if(M.mode === 'gate' && s.len <= 6) btns.boost = ['💨', 'Boost', true];
  if(SNL.picking[g] && !s.offer && SNL.pads){ SNL.picking[g] = false; SNL.pads.pick(g, null); }   // the TV or the timer picked
  const line = popped ? '💥 Popped! Back on in a moment…' : out ? '💫 Out — cheer on the others!' : s.linkAuto ? '🤖 The robot is riding for you'
    : s.offer ? '🗺️ Quest done — pick a skill!' : s.quest ? '🗺️ ' + s.quest.text + ' · ' + (s.quest.have || 0) + '/' + s.quest.need
    : M.mode === 'castle' && s.trailCells && s.trailCells.length ? '✏️ Drawing — loop back home! 🏠' : s.boosting ? '💨 Boost costs length!' : s.inv > 0 ? '✨ Safe for a moment' : '';
  return {chips, btns, cool, glow, line, state: out ? 'out' : 'play'};
}
// 💥 the engine's moments → a buzz on the right phone(s)
function snlBuzz(list){
  const P = SNL.pads; if(!P || !G || !G.link) return; const M = G.M, hu = i => M.snakes[i] && M.snakes[i].human, nm = i => M.snakes[i] ? snakeName(M.snakes[i]) : '';
  list.forEach(e => {
    if(e.k === 'pop'){ const s = M.snakes[e.s];
      if(hu(e.s)) P.buzz(e.s, s && s.lives > 0 ? 'hit' : 'out', e.by >= 0 && e.by !== e.s ? '💥 ' + nm(e.by) + ' popped you!' : '💥 Popped!');
      if(e.by >= 0 && e.by !== e.s && hu(e.by)){ P.buzz(e.by, 'got', '🎯 You popped ' + nm(e.s) + '!'); snlTv('💥 ' + nm(e.by) + ' popped ' + nm(e.s) + '!', 'gold'); }
      else if(hu(e.s)) snlTv('💥 ' + nm(e.s) + ' popped!' + (s && s.lives > 0 ? ' Back in a moment…' : ''), 'bad'); }
    else if(e.k === 'bump'){ if(hu(e.s)) P.buzz(e.s, 'hit', e.why === 'wall' ? '🧱 Bonk — the wall!' : e.why === 'self' ? '🙈 Bonk — your own tail!' : '💥 Bonk!'); if(e.by >= 0 && e.by !== e.s && hu(e.by)) P.buzz(e.by, 'got', '🎯 ' + nm(e.s) + ' bumped into you!'); }
    else if(e.k === 'cut'){ if(hu(e.s)) P.buzz(e.s, 'hit', e.by >= 0 && e.by !== e.s ? '✂️ ' + nm(e.by) + ' cut your trail!' : e.why === 'long' ? '🐍 Trail too long — back home!' : '🙈 Your own trail — back home!');
      if(e.by >= 0 && e.by !== e.s && hu(e.by)){ P.buzz(e.by, 'got', '✂️ You cut ' + nm(e.s) + '\'s trail!'); snlTv('✂️ ' + nm(e.by) + ' cut ' + nm(e.s) + '\'s trail!', 'gold'); }
      else if(hu(e.s)) snlTv('🏠 ' + nm(e.s) + ' goes back home', 'bad'); }
    else if(e.k === 'claim'){ if(hu(e.s) && e.cells >= 4) P.buzz(e.s, 'got', '🏰 +' + e.cells + ' land!'); }
    else if(e.k === 'gift'){ if(hu(e.s)){ const k = SN.SKILLS[e.skill]; if(e.why !== 'quest') P.buzz(e.s, 'pick', '🎁 New skill: ' + k.icon + ' ' + k.name); snlTv((e.why === 'quest' ? '🗺️ ' : '🎁 ') + nm(e.s) + ': ' + k.icon + ' ' + k.name, 'good'); } }
    else if(e.k === 'power'){ if(hu(e.s) && SN.POWERS[e.p]) P.buzz(e.s, 'pick', SN.POWERS[e.p].icon + ' ' + (SN.POWERS[e.p].name || 'Power!')); }
    else if(e.k === 'shieldHit'){ if(hu(e.s)) P.buzz(e.s, 'got', '🛡️ The shield saved you!'); }
    else if(e.k === 'respawn'){ if(hu(e.s)) P.buzz(e.s, 'go', '🐍 Back on — go!'); }
    else if(e.k === 'questDone'){ const s = M.snakes[e.s]; if(hu(e.s) && s && s.offer){ P.buzz(e.s, 'win', '🗺️ Quest done!');
      if(!s.linkAuto){ SNL.picking[e.s] = true; P.pick(e.s, {t: '🗺️ Pick a skill', opts: s.offer.map(k => [SN.SKILLS[k].icon, SN.SKILLS[k].name]), ms: Math.round((s.offerT || 6) * 1000)}); } } }
  });
}
// 📺 the TV talks about riders by NAME (the game's own lines say "You …" — fine on one device, wrong on a shared TV): those are held back while
// the game reads its moments, and the most important named line is shown right after
function snlTv(t, kind){ if(!SNL.tvLine || kind === 'gold') SNL.tvLine = [t, kind, 1300]; }
// 🏁 the match is over → every phone gets its own line · the screen's card: 🔁 Play again · ◀ Room · 🚪 End the room
function snlEnd(){
  const P = SNL.pads; if(!P || !G) return; const M = G.M, w = M.snakes[M.winner], lines = {}, wins = {};
  M.snakes.forEach(s => { if(!s.human) return; const won = M.winner === s.i; if(won) wins[s.i] = 1;
    lines[s.i] = (won ? '🏆 You win!' : '💪 Good game!') + ' · 🐍 ' + s.maxLen + ' long · 🍎 ' + s.eaten + (M.mode === 'castle' ? ' · 🏰 ' + Math.floor(s.land || 0) + ' %' : M.mode === 'gate' ? ' · 💥 ' + (s.popped || 0) : ''); });
  P.end({icon: w ? (w.human ? '🏆' : '🤖') : '🤝', title: w ? snakeName(w) + (w.human ? ' wins!' : ' wins this time') : 'Nobody made it — a draw!', lines, wins});
  const row = $('result-card') && $('result-card').querySelector('.gf-r-btns'); if(!row) return;
  const tv = SNL.cfg && SNL.cfg.tv;
  row.innerHTML = '<button class="btn sp-btn sp-primary" id="snl-again" data-sound="pop">🔁 Play again</button>' + (SNL.viaCover ? '<button class="btn soft sp-btn sp-secondary" id="snl-room" data-sound="none">◀ Room</button>' : '') +
    '<button class="btn soft sp-btn sp-secondary" id="snl-exit" data-sound="none">' + (tv ? '🚪 End the room' : '🎚️ Levels') + '</button>';
  $('snl-again').onclick = () => snlGo(); if($('snl-room')) $('snl-room').onclick = () => snlToCover(); $('snl-exit').onclick = () => snlExit();
}
function snlStop(){ if(SNL.pads) SNL.pads.stop(); SNL.pads = null; SNL.cfg = null; }
function snlToCover(){ snlStop(); backToMenu(); openCover(); if(SnakeCover) Link.cover.show(SnakeCover); }
function snlExit(){ try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} snlStop(); SNL.viaCover = false; backToMenu(); }
// every frame of a linked match: 🤖 for dropped phones · 💨 the grid burst meter
function snlFrame(){
  const M = G.M, t = performance.now(), dt = Math.min(0.05, Math.max(0, (t - (SNL.last || t)) / 1000)); SNL.last = t;
  G.link.seats.forEach(st => { const g = st.g, s = M.snakes[g]; if(!s || !s.alive) return;
    if(s.linkAuto){ SN.auto(M, g); return; }
    if(M.mode === 'gate') return;
    let tk = SNL.tank[g] == null ? 1 : SNL.tank[g];
    if(SNL.boost[g] && tk > 0){ s.dashT = Math.max(s.dashT || 0, 0.06); tk = Math.max(0, tk - dt / SNL_BOOST_S); if(!tk) SNL.boost[g] = false; }   // empty = let go, so a held button never sticks
    else if(!SNL.boost[g]) tk = Math.min(1, tk + dt / SNL_FILL_S);
    SNL.tank[g] = tk; });
}
// 🧭 Snakigate with 3–4 riders on one TV: one camera that keeps EVERY rider in view (the game's own view follows riders 1 + 2 only)
function snlGateView(W, H, st){
  const M = st.M, hs = M.snakes.filter(s => s.human && (s.alive || s.respawnT != null)); if(hs.length < 3) return null;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; hs.forEach(s => { x0 = Math.min(x0, s.x); x1 = Math.max(x1, s.x); y0 = Math.min(y0, s.y); y1 = Math.max(y1, s.y); });
  const pad = 9, R = M.R || 20, base = Math.min(W, H) / 17, sc = Math.max(Math.min(W, H) / (2 * R + 4), Math.min(base, W / (x1 - x0 + pad * 2), H / (y1 - y0 + pad * 2)));
  const cam = st.cam[0], mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  if(!cam.ready){ Object.assign(cam, {x: mx, y: my, z: sc, ready: true}); } else { cam.x += (mx - cam.x) * 0.1; cam.y += (my - cam.y) * 0.1; cam.z += (sc - cam.z) * 0.06; }
  return {sc: cam.z, cx: cam.x, cy: cam.y};
}
// wraps (only while a linked match runs on THIS screen): pads only for this device's own seats · 🤖 + 💨 each frame · buzz · the 🏁 card · ⏸ for everyone
function snlWraps(){
  if(window.__snlWraps) return; window.__snlWraps = true;
  const bc = window.buildControls; window.buildControls = function(){ if(G && !G.link && SNL.starting) G.link = SNL.starting;   // set before the first layout: no corner pads for the phones' seats
    const r = bc.apply(this, arguments); if(!(G && G.link)) return r;
    const mine = G.link.seats.filter(s => s.local).map(s => s.g);
    if(!mine.length){ $('corners').innerHTML = ''; document.querySelectorAll('.ctl-side, .ctl-wrap').forEach(e => e.remove()); $('scr-play').classList.remove('side', 'port');
      $('bottom').innerHTML = '<div class="legend snl-legend"><span>📱 The phones are the controllers</span><span>' + G.link.seats.map(s => '<b style="color:' + (G.cols[s.g] || '#fff') + '">● ' + UI.esc(s.name) + '</b>').join(' ') + '</span><span><span class="kk">P</span> pause</span></div>'; }
    else document.querySelectorAll('#corners .corner').forEach(c => { const m = /\bc(\d)\b/.exec(c.className); if(m && mine.indexOf(+m[1]) < 0) c.remove(); });
    return r; };
  const inf = window.inputFrame; window.inputFrame = function(){ const r = inf.apply(this, arguments); try{ if(G && G.link) snlFrame(); }catch(e){ console.error(e); } return r; };
  const tk = SN.takeEvents; SN.takeEvents = function(M){ const ev = tk.apply(this, arguments); try{ if(G && G.link && G.M === M && ev && ev.length) snlBuzz(ev); }catch(e){ console.error(e); } return ev; };
  const he = window.handleEvents; window.handleEvents = function(){ SNL.inEv = !!(G && G.link); SNL.tvLine = null;
    try{ return he.apply(this, arguments); } finally { SNL.inEv = false; const t = SNL.tvLine; SNL.tvLine = null; if(t) banner(t[0], t[1], t[2]); } };
  const ob = window.banner; window.banner = function(txt){ if(SNL.inEv && /\b(You|you|Your|your)\b/.test(String(txt || ''))) return; return ob.apply(this, arguments); };
  const se = window.showEnd; window.showEnd = function(){ const r = se.apply(this, arguments); try{ if(G && G.link) snlEnd(); }catch(e){ console.error(e); } return r; };
  const tp = window.togglePause; window.togglePause = function(){ const r = tp.apply(this, arguments); try{ if(G && G.link && SNL.pads) SNL.pads.paused(!!G.paused); }catch(e){} return r; };
  const dg = window.drawGate; window.drawGate = function(g, W, H, st){ const V = st && st === G && G.link ? snlGateView(W, H, st) : null;
    if(!V) return dg.apply(this, arguments); gatePaint(g, W, H, st, V); drawMini(g, W, H, st); };
  // 🏁 the screen's card shows the WINNER's avatar (the TV's own name is nobody's seat)
  if(window.GF && GF.result && !GF.__snl){ const gr = GF.result; GF.__snl = true; GF.result = function(o){ try{ if(G && G.link && o && o.buddy){ const M = G.M, w = M.snakes[M.winner], p = w && w.human ? w : M.snakes.find(x => x.human); if(p) o.buddy = {name: p.name, av: myAvatar(p.name)};
      if(p && o.title && M.snakes.filter(x => x.human).length === 1) o.title = String(o.title).replace(/^You reached/, p.name + ' reached').replace(/^You own/, p.name + ' owns').replace(/^Your /, p.name + '\'s '); } }catch(e){} return gr.apply(this, arguments); }; }
  const bm = window.backToMenu; window.backToMenu = function(){ if(SNL.pads && G && G.link){ SNL.pads.stop(); SNL.pads = null; } return bm.apply(this, arguments); };
}
const SNL_CSS = "/* 📡 lk-8c: the TV's line under the board while phones are the controllers */\n.legend.snl-legend{flex-wrap:wrap;justify-content:center;gap:6px 16px;font-size:clamp(13px,1.35vw,20px);padding:6px 10px;}\n.legend.snl-legend b{font-weight:900;text-shadow:0 1px 0 rgba(0,0,0,.45);}";   // added only when a room opens
function snlWire(){
  snlWraps(); if(!document.getElementById('snl-css')){ const st = document.createElement('style'); st.id = 'snl-css'; st.textContent = SNL_CSS; (document.head || document.documentElement).appendChild(st); } if(SNL.wired || !window.Link) return; SNL.wired = true;
  // 📱 the phone side: LinkPads draws the controller; ◀ Room = back to the cover's room line
  Link.pads.config({drawAvatar: (cv, n) => drawPreviewCanvas(cv, myAvatar(n), {name: n, t: 1}), avatar: n => myAvatar(n), onRoom: () => { if(SnakeCover) Link.cover.show(SnakeCover); }, onLeave: () => openCover()});
  // 📺 the first player's 🔁 on a TV room
  Link.on('lk:ask', (d, seat) => { if(!Link.isHost() || !d || d.what !== 'again' || !SNL.cfg || !SNL.cfg.tv || !G || !G.over) return; if(Link.captain() === seat) snlGo(); });
  addEventListener('pagehide', () => { try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} });
}
// 🔗 ?page=snakize&link=<code> → the cover's 🕹️ Join with the number filled in
function snlUrl(code){ openCover(); if(!SnakeCover) return; snlOpen(SnakeCover); Link.cover.join(code); }
// ---- 📺 the TV Game Station (LinkKit plan §55c) ----
// TV (?mode=ltv&st&stv=1&slv=<level>&ssp=<mode>): the main file's door loads this part, then snlStation() opens the cover room as the 📺 Room hostess with the
// voted mode + level (held in memory — the TV's own picks stay) → Station starts it when the voted players are in · phones come by ?link=<room> (the door)
// and get the 🗳️ 🔁 Again / 🎮 Another game bar on their LinkPads result card.
function snlStation(t){
  if(!window.Station) return false;
  if(!Station.on){ if((t | 0) < 60) setTimeout(() => snlStation((t | 0) + 1), 50); return false; }   // Station.game reads the link a moment after the part loads
  if(!Station.tv) return false;
  const way = SNL_MODES.indexOf(Station.way) >= 0 ? Station.way : 'feast', lv = Station.lvl == null ? 0 : Math.max(0, Math.min(4, Station.lvl));
  SNL.st = {mode: way, level: lv};
  openCover(); if(!SnakeCover) return false;
  snlOpen(SnakeCover); Link.cover.tv(SnakeCover, SNL_ROOM); return true;
}
if(window.Station) Station.game({url: WEBAPP_URL, page: 'snakize', player: () => S.player || CURRENT_PLAYER, start: () => Link.cover.start(), again: () => snlGo(),
  result: () => (G && G.link && G.shown) ? $('result-card') : (Link.pads && Link.pads.resultCard ? Link.pads.resultCard() : null), hide: '.gf-r-btns, .lp-cb, .lp-wait'});
GameParts.loaded('Snakize_link', 'lk-8c');
