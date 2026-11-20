
/* 📏 s-sla play#1 */
function teamName(side){ if(G.cup) return G.cup.names[side]; const t = G.M.players.filter(p => p.side === side); return t.map(p => p.name).join(' + '); }
/* 📏 s-sla play#2 */
/* 💥 an-1 CATCH-UP END */
/* ---------- loop ---------- */
function frame(now){
  if(!G) return;
  const dt = Math.min(0.05, Math.max(0, (now - G.last) / 1000)); G.last = now;
  if(V && V.follow){ const me = G.M.players.find(p => p.human && p.side === V.camSide) || G.M.players.find(p => p.side === V.camSide); if(me){ G.camY += (me.y * 0.32 - G.camY) * Math.min(1, dt * 3); V.follow(G.camY); } }   // 📷 sb2-3 camera follows you sideways
  sbCatchWatch(now);   // 💥 an-1
  if(G.link && G.link.role === 'guest'){ if(!G.over) readInputs(); lkGuestFrame(now); }   // 📡 a guest never runs the engine: it shows the host's match
  else if(!G.paused && !G.over && !Comic.busy() && !sbCatchHold(now)){   // 💥 the game waits while a comic panel / strip shows (+ an-1 catch-up hold)
    readInputs();
    G.acc += dt * sbCatchK(now); let n = 0;
    while(G.acc >= SB.DT && n < 12){ SB.step(G.M, SB.DT); G.acc -= SB.DT; n++; }
    const evs = SB.takeEvents(G.M); handleEvents(evs); if(typeof sbbAhead === 'function') sbbAhead(); /* 🎬 b3b5 */ if(G.lk && evs.length) G.lk.evs.push.apply(G.lk.evs, evs);
    if(G.M.score.done && !G.over) finishMatch();
  }
  if(G && G.link && G.link.role === 'host') lkHostTick(now);
  if(window.Cheer) Cheer.pause(!!(G.paused || Comic.busy()));   // 📣 cs-1
  G.anim += dt; if(!G.ctl) draw(now / 1000);
  hud();   // 📺 lk-5e: a controller phone (G.ctl) doesn't draw the court — it is on the TV
  G.raf = requestAnimationFrame(frame);
}
function togglePause(){ if(!G || G.over) return; if(G.link && G.link.role === 'guest'){ Link.send('sbpause', {on: !G.paused}, {sure: true}); return; } G.paused = !G.paused; UI.pauseIcon($('pause-btn'), G.paused); banner(G.paused ? '⏸ Paused — tap ▶ to play' : '▶ Go!', 'good'); }
/* 📏 s-sla play#3 */
function leavePlay(){
  if(!G) return; const was = G.paused; G.paused = true;
  const lb = G.link ? (G.link.role === 'host' ? 'This ends the match on every device.' : 'A 🤖 robot plays for you until you come back.') : null;   // 📡 lk-1b
  UI.confirm({icon: '◀', title: 'Leave this match?', body: lb || (G.cup ? 'You can play this tournament match again from the bracket.' : 'This match won\'t be saved.'), okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(!G) return; G.paused = was; if(ok){ if(G.link) lkExit(); else if(G.cup) backToBracket(); else backToMenu(); } });
}
function backToMenu(){ if(window.Cheer) Cheer.unmount(); /* 💬 24t off */ if(window.UI && UI.callout) UI.callout.setup(null); if(G && G.link){ lkExit(); return; } if(G) cancelAnimationFrame(G.raf); G = null; hideResult(); $('pads').innerHTML = ''; renderMenu(); showScreen('menu'); }

/* ---------- input ---------- */
document.addEventListener('keydown', e => {
  if(takeKey(e)) return;
  if(!G || $('scr-play').classList.contains('hidden')) return;
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End'].indexOf(e.code) >= 0) e.preventDefault();
  if(e.code === 'Escape'){ togglePause(); return; }
  if(e.repeat){ return; }
  G.held.add(e.code); $('pads').classList.add('kbd');
  if(G.paused || G.over) return;
  G.M.players.forEach(p => { if(!p.human || p.remote) return; keySetsOf(p).forEach(K => {
    ['smash', 'drop', 'lob', 'slice'].forEach(a => { if(K[a] === e.code) shot(p.i, a); });
    if(K.power === e.code) firePower(p.i); }); });
  if(e.code === 'Space'){ const me = G.M.players.find(p => p.human && !p.remote && (p.seat === -1 || p.seat === 0)); if(me) shot(me.i, 'normal'); }
});
document.addEventListener('keyup', e => { if(G) G.held.delete(e.code); });
window.addEventListener('blur', () => { if(G) G.held.clear(); });
function keySetsOf(p){ return p.seat === -1 ? [KEYS[0], KEYS[1]] : [KEYS[p.seat] || KEYS[0]]; }
function readInputs(){
  const M = G.M;
  M.players.forEach(p => { if(!p.human || p.remote) return;   // 📡 remote players send their own stick
    if(p.auto) return;   // test autopilot
    // 🕹️ stick first (analog), else keys — both are SCREEN directions, the view turns them into the world (sb2-1)
    const st = G.sticks && G.sticks.get(p.i);
    let sx = 0, sy = 0;
    if(st && st.v){ const m = Math.hypot(st.v.x, st.v.y); if(m > 0.12){ const k = Math.min(1, m) / m; sx = st.v.x * k; sy = st.v.y * k; } }
    else { keySetsOf(p).forEach(K => { if(G.held.has(K.left)) sx -= 1; if(G.held.has(K.right)) sx += 1; if(G.held.has(K.up)) sy -= 1; if(G.held.has(K.down)) sy += 1; });
      sx = Math.max(-1, Math.min(1, sx)); sy = Math.max(-1, Math.min(1, sy)); }
    const w = V ? V.k2w(sx, sy) : {x: sx, y: sy}; p.input.x = w.x; p.input.y = w.y;
  });
}
function shot(i, kind){ const p = G.M.players[i]; if(!p || G.paused) return; if(G.link && G.link.role === 'guest'){ if(!G.over) Link.send('sbshot', {a: kind}, {sure: true}); if(kind !== 'normal') floatAt(p, SHOT_ICON[kind] || '', 0.6); return; } SB.pressShot(G.M, i, kind); if(kind !== 'normal') floatAt(p, SHOT_ICON[kind] || '', 0.6); }
function firePower(i){ const p = G.M.players[i]; if(p && G.link && G.link.role === 'guest'){ if(p.power) Link.send('sbshot', {a: 'power'}, {sure: true}); else UISound.play('error'); return; } if(!p || !p.power){ if(p && p.human) UISound.play('error'); return; } SB.usePower(G.M, i); }
// touch (sb2-1): a short tap on the court = serve / normal hit; moving is the 🕹️ stick
function humanFor(side, px, py){
  const hs = G.M.players.filter(p => p.human && !p.remote); if(hs.length === 1) return hs[0];
  const w = V.inv(px, py), mine = hs.filter(p => p.side === (w.x < 0 ? 0 : 1)); if(!mine.length) return null;
  return mine.reduce((a, b) => (Math.hypot(a.x - w.x, a.y - w.y) <= Math.hypot(b.x - w.x, b.y - w.y) ? a : b));
}
(function(){
  const cv = $('court');
  cv.addEventListener('pointerdown', e => {
    if(!G || G.paused || G.over) return; const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    const p = humanFor(0, px, py); if(!p) return;
    G.pointers.set(e.pointerId, {p, x0: px, y0: py, t0: performance.now()}); $('pads').classList.remove('kbd');
  });
  const up = e => { if(!G) return; const d = G.pointers.get(e.pointerId); if(!d) return; G.pointers.delete(e.pointerId); const r = cv.getBoundingClientRect();
    if(Math.hypot(e.clientX - r.left - d.x0, e.clientY - r.top - d.y0) < 12 && performance.now() - d.t0 < 350) shot(d.p.i, 'normal'); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
})();
const SHOT_NAME = {smash: 'Smash', lob: 'Lob', drop: 'Drop', slice: 'Slice'};
function buildPads(){
  const box = $('pads'); box.innerHTML = ''; G.sticks = new Map(); const hs = G.M.players.filter(p => p.human && !p.remote), two = hs.length > 1;
  const portrait = V && V.H > V.W * 1.05, short = V && !portrait && V.H < 520;
  box.classList.toggle('two', two); box.classList.toggle('port', !!portrait); box.classList.toggle('short', !!short); box.style.removeProperty('--stick');
  const usedSide = {};
  hs.forEach(p => {
    // one touch set per side (2 vs 2 with two people on one side: the 2nd one plays with keys)
    if(usedSide[p.side]) return; usedSide[p.side] = true;
    const K = keySetsOf(p)[0], where = !two ? 'solo' : portrait ? (p.side === 0 ? 'bottom' : 'topband') : (p.side === 0 ? 'lside' : 'rside');
    const st = document.createElement('div'); st.className = 'stick ' + where; st.dataset.p = p.i; st.innerHTML = '<div class="ring"></div><div class="knob"></div><span class="tip">🕹️ move + aim</span>';
    const cl = document.createElement('div'); cl.className = 'shotpad ' + where; cl.dataset.p = p.i;
    cl.innerHTML = '<button class="sbtn pw" data-a="power" title="Power"><span class="ic">⚡</span><span class="nm">Power</span><small>' + UI.esc(keyName(K.power)) + '</small></button>'
      + '<div class="shots">' + ['smash', 'lob', 'drop', 'slice'].map(a => '<button class="sbtn s-' + a + '" data-a="' + a + '" title="' + SHOT_NAME[a] + '"><span class="ic">' + SHOT_ICON[a] + '</span><span class="nm">' + SHOT_NAME[a] + '</span><small>' + UI.esc(keyName(K[a])) + '</small></button>').join('') + '</div>';
    cl.querySelectorAll('.sbtn').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('down', 'flash'); setTimeout(() => b.classList.remove('down'), 160); if(navigator.vibrate) try{ navigator.vibrate(8); }catch(err){}
      $('pads').classList.remove('kbd'); if(b.dataset.a === 'power') firePower(p.i); else shot(p.i, b.dataset.a); }));
    // 🕹️ the shared UiKit stick (r33 instant start, r36 calm feel per device): analog, screen direction → world direction of this view
    const T = UI.stickTracker(st, {player: p.name, av: p.av}), kn = st.querySelector('.knob'), S = {id: null, v: null};   // 🕹️ sk-1: wears this player's joystick skin
    JoySkins.buttons(cl, p.name, p.av);   // …and the shot buttons wear its ring + glow (they keep the SlaBrall colours)
    const show = v => { const m = Math.min(1, Math.hypot(v.fx, v.fy)), k = m > 0 ? Math.min(1, m) / m : 0; kn.style.transform = 'translate(calc(-50% + ' + (v.fx * k * 38) + '%), calc(-50% + ' + (v.fy * k * 38) + '%))'; };
    st.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try{ st.setPointerCapture(e.pointerId); }catch(err){} S.id = e.pointerId; S.v = T.start(e); show(S.v); st.classList.add('on'); $('pads').classList.remove('kbd'); });
    UI.onFastMove(st, e => { if(e.pointerId !== S.id) return; S.v = T.at(e); show(S.v); });
    const end = e => { if(e.pointerId !== S.id) return; S.id = null; S.v = null; kn.style.transform = ''; st.classList.remove('on'); p.input.x = p.input.y = 0; };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    G.sticks.set(p.i, S);
    box.appendChild(st); box.appendChild(cl);
    if(where === 'solo' && window.UI && UI.pad){   // 🕹️ pz-1: 👉 💥 Smash = main, the fan (most used first): 🌈 Lob ← · 🪶 Drop ↑ · 🔪 Slice ↙ · ⚡ Power ↗ (a ring around Smash)
      box.style.setProperty('--stick', UI.pad.stickFor(box.clientWidth, UI.pad.geo(box.clientWidth, box.clientHeight, 4).w) + 'px');   // never touches the 👉 group
      const B = a => cl.querySelector('[data-a="' + a + '"]'); UI.pad.arc(cl, B('smash'), [B('lob'), B('drop'), B('slice'), B('power')], {fit: true});
      const z = document.createElement('div'); z.className = 'stickzone'; const pb = padBox(box.clientWidth, box.clientHeight);
      z.style.width = (pb.l || box.clientWidth * 0.42) + 'px'; z.style.height = (pb.l ? box.clientHeight * 0.78 : (pb.b || box.clientHeight * 0.4)) + 'px';
      box.insertBefore(z, st); UI.pad.stick(st, z); }
  });
  if(window.matchMedia && matchMedia('(pointer:fine)').matches && !isTouch()) box.classList.add('kbd');
}

/* 📣 CHEERSQUAD (cs-1) START — the cheering crowd (CheerSquad.html, 📣 Cheer chat). Don't remove: the Cheer chat re-applies it. */
const CHEER_ROW = 46;
let CHEER_HULL = null;
function cheerRowOn(){ return isTouch() && window.Cheer && Cheer.active() && Cheer.stats().size === 'party'; }
function cheerMount(){
  if(!window.Cheer) return; Cheer.unmount();
  const M = G.M, me = M.players.find(p => p.human && !p.remote);
  Cheer.mount($('stage') || document.body, {game: 'slabrall', players: M.players.map(p => ({name: p.name, side: p.side, human: !!p.human})),
    me: me ? {name: me.name} : {name: S.player}, family: (S.players || []).map(p => p.Name), avatars: S.avatars || {}, mode: 'scene', ref: $('court'),
    avoid: () => Array.from(document.querySelectorAll('#pads .stick, #pads .shotpad, #pads .sbtn, #pads button, #gbar')),
    clear: b => !cheerOnCourt(b), edge: innerHeight > innerWidth * 1.05 ? 0.4 : 0});   // phones held upright: fans may peek in from the screen edge
}
// the court + its run-off + the air above it (where the ball flies) = never covered
function cheerHull(V, sp){ const pts = [], add = (L, W, z) => [[-L, -W], [L, -W], [L, W], [-L, W]].forEach(q => pts.push(V.P(q[0], q[1], z)));
  add(sp.Lh + 1.3, sp.Wh + 1.3, 0); add(sp.Lh, sp.Wh, sp.squash ? (sp.wallH || 4.6) : 2.2);   // ground + run-off, and the air above the court where the ball flies
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  pts.forEach(p => { while(lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
  pts.slice().reverse().forEach(p => { while(up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
  return lo.slice(0, -1).concat(up.slice(0, -1)); }
function cheerOnCourt(b){ const H = CHEER_HULL; if(!H) return false;
  const inside = (x, y) => { let c = false; for(let i = 0, j = H.length - 1; i < H.length; j = i++){ const a = H[i], q = H[j]; if((a[1] > y) !== (q[1] > y) && x < (q[0] - a[0]) * (y - a[1]) / (q[1] - a[1]) + a[0]) c = !c; } return c; };
  for(const fx of [0, 0.5, 1]) for(const fy of [0, 0.5, 1]) if(inside(b.l + (b.r - b.l) * fx, b.t + (b.b - b.t) * fy)) return true; return false; }
// fans stand on the grass beside the long sides of the court (candidates on both halves, each team's half first), never behind the far baseline (the ball flies there)
function cheerScene(g, V, M, t){
  if(!window.Cheer || !Cheer.active() || !V || !V.P || !V.sc) return false;
  const sp = M.sp, party = Cheer.stats().size === 'party', cands = [], XS = [0.35, 0.55, 0.15, 0.75, 0.95, -0.05, 1.12];
  CHEER_HULL = cheerHull(V, sp);
  [0, 1].forEach(row => XS.forEach(u => [0, 1].forEach(half => [-1, 1].forEach(side => {
    const x = (half ? 1 : -1) * u * (sp.Lh + 1.2), y = side * (sp.Wh + (sp.squash ? 1.6 : 2.1) + row * 1.25), p = V.P(x, y, 0);
    cands.push({x: p[0], y: p[1], k: V.sc(x, y, 0) * (party ? 0.019 : 0.016), half}); }))));
  Cheer.place(g, cands);
  return true;
}
function cheerRow(g){ if(!cheerRowOn() || !V) return; const box = padBox(V.W, V.H); Cheer.row(g, {x: 0, y: V.H - box.b, w: V.W, h: CHEER_ROW - 4}); }
function cheerScore(){ const sc = G.M.score; return G.sp.scoring === 'tennis' ? sc.games.map((x, i) => x * 4 + sc.pts[i]) : sc.pts.slice(); }
// match point (or game point that wins the match) for side s → the crowd leans in
function cheerCloseSide(){ const M = G.M, sc = M.score; if(sc.done) return -1;
  for(const s of [0, 1]){ const a = sc.pts[s] + 1, o = sc.pts[1 - s];
    if(G.sp.scoring === 'tennis'){ const noAd = M.level <= 1; if(a >= 4 && (a - o >= 2 || (noAd && a > o)) && sc.games[s] + 1 >= M.target) return s; }
    else { const t = M.target; if((a >= t && a - o >= 2) || a >= t + 4) return s; } }
  return -1; }
function cheerPoint(e){ if(!window.Cheer || !Cheer.active()) return; const L = G.plog, lastP = G.M.players[L.lastHit];
  const big = e.why === 'ace' || e.why === 'goal' || e.why === 'legend' || L.rally >= 8 || L.jumpPerfect || (L.lastShot === 'smash' && lastP && lastP.side === e.side);
  Cheer.react(big ? 'big' : 'goal', {side: e.side, score: cheerScore()});
  const s = cheerCloseSide(); if(s >= 0) setTimeout(() => { if(G && !G.over && window.Cheer) Cheer.react('close', {side: s}); }, 2300); }
function cheerEnd(){ if(!window.Cheer || !Cheer.active() || !G) return; const win = G.M.score.winner; Cheer.react('win', {side: win});
  setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
    const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
    const at = card.querySelector('.res-btns'); card.insertBefore(c, at); card.insertBefore(cap, at); }, 120); }
/* 📣 CHEERSQUAD END */
/* ---------- events → sounds, words, fx ---------- */
const WHY = {floor: 'it touched the floor', net: 'into the net', out: 'out!', own: 'on their own side', twice: 'bounced twice', past: 'got past', ace: 'ACE!', kitchen: 'kitchen volley!', wall: 'hit the glass first', serve: 'serve fault', goal: 'GOAL!', legend: 'LEGENDARY GOAL!', stuck: 'too long a rally', hardcore: ''};
function handleEvents(list){
  const M = G.M;
  if(typeof sbbEvent === 'function') list.forEach(sbbEvent);   /* 🎬 b3b5: contact = the engine's event */
  if(typeof sbsEvent === 'function') list.forEach(sbsEvent);   /* 🎾 b3b6 the toss */
  list.forEach(e => {
    if(e.k === 'hit'){ UISound.play(e.shot === 'smash' ? 'whoosh' : 'pop'); const p = M.players[e.p]; if(e.perfect && p.human && !FX){ bigWord('PERFECT!'); } if(e.shot === 'smash' && p.human && !FX) floatAt(p, '💥 SMASH', 0.9);   // st-1: with effects on, the Sla… callouts say it
      if(e.rally === 10 || e.rally === 20 || e.rally === 30) banner('🔁 ' + e.rally + '-hit rally!', 'gold');
      logHit(e); }
    else if(e.k === 'serve'){ UISound.play('tap'); G.plog = newPlog(); }
    else if(e.k === 'jump') onJump(e);
    else if(e.k === 'point'){ const win = M.players.filter(p => p.side === e.side), human = win.some(p => p.human && !p.remote), lost = M.players.some(p => p.human && !p.remote && p.side !== e.side);
      UISound.play(human || !lost ? 'success' : 'bump');
      banner((e.why === 'ace' ? '🎾 ' : e.why === 'goal' || e.why === 'legend' ? '🥅 ' : '') + teamName(e.side) + ' ' + (G.sp.scoring === 'goals' ? 'scores' : 'wins the point') + (WHY[e.why] ? ' — ' + WHY[e.why] : ''), human ? 'good' : 'bad');
      if(e.why === 'goal' || e.why === 'legend' || e.why === 'ace') bigWord(e.why === 'ace' ? 'ACE!' : e.why === 'legend' ? '⭐ GOAL!' : 'GOAL!');
      cheerPoint(e); comicPoint(e); }
    else if(e.k === 'game'){ setTimeout(() => banner('🏆 Game to ' + teamName(e.side) + '!', 'gold'), 900); if(G.stripNext) comicStripNow(); }
    else if(e.k === 'orb'){ UISound.play('unlock'); banner(['⚪ Power orb!', '🔵 Rare power orb!', '🟡 LEGENDARY orb!'][e.tier] + ' Hit the ball through it!', 'gold'); }
    else if(e.k === 'gotpower'){ const p = M.players[e.p], P = SB.POWERS[e.power]; UISound.play('unlock'); banner(P.icon + ' ' + p.name + ' got ' + P.name + (p.human && !p.remote ? ' — press ' + keyName(keySetsOf(p)[0].power) + ' or ⚡' : ''), 'gold'); }
    else if(e.k === 'power'){ const p = M.players[e.p], P = SB.POWERS[e.power]; UISound.play('whoosh'); bigWord(P.icon + ' ' + P.name, p); if(FX) say(P.name); }
    else if(e.k === 'legendmiss'){ banner('⭐ Too strong! Only a PERFECT hit sends a Legendary back', 'bad'); }
    else if(e.k === 'mirage'){ bigWord('🎭 Fooled you!'); }
    else if(e.k === 'broken'){ bigWord('💔 Broken spin!'); }
    else if(e.k === 'splorf'){ bigWord('🌊 SPLORF!'); UISound.play('drop'); }
    else if(e.k === 'patch'){ const E = SB.ELEMENTS[e.el]; banner(E.icon + ' ' + E.name + ' patch on the court!', 'gold'); }
    else if(e.k === 'zap'){ floatAt(M.players[e.p], '⚡ zapped!', 0.7); UISound.play('bump'); }
    else if(e.k === 'buddywall'){ banner('🧱 Buddy Wall saved it!', 'good'); UISound.play('bump'); }
    else if(e.k === 'split'){ bigWord('✂️ Which one is real?'); }
    else if(e.k === 'special'){ if(e.kind === 'legend' || e.kind === 'mirage'){ bigWord('⭐ LEGENDARY SHOT!'); comicImpact(M.players[e.p], 'Sla… LEGEND!!!', 'power', 'smash', 'Legendary shot!'); } G.plog.power = true; }
    else if(e.k === 'power'){ G.plog.power = true; }
    else if(e.k === 'unstick'){ banner('🏒 Puck back to the middle', ''); }
  });
}
let bannerTimer = 0;
function banner(text, kind){ const b = $('banner'); b.textContent = text; b.className = 'banner on' + (kind ? ' ' + kind : ''); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 2000); }
function bigWord(text, who){ if(!FX) return; /* 💬 24t bigWord */ if(UI.callout && UI.callout.active()){ UI.callout(text, {who, rank: UI.callout.guess(text) === 'big' ? 'big' : 'good'}); return; } const host = $('bigword-host'); host.innerHTML = ''; const d = document.createElement('div'); d.className = 'big-word'; d.textContent = text; host.appendChild(d); setTimeout(() => d.remove(), 950); }
function floatAt(p, text, life){ G.fx.push({k: 'txt', x: p.x, y: p.y, z: 2.4, txt: text, t: 0, life: life || 0.8}); }

/* ---------- 💥 comics (sb2-3) — ComicKit: impact panels, Sla… callouts, strips. Off (💬 chip) = small callouts only ---------- */
function newPlog(){ return {rally: 0, jump: false, jumpPerfect: false, jumpBy: -1, dive: false, diveBy: -1, diveMiss: false, diveMissBy: -1, power: false, smash: false, drop: false, lastHit: -1, lastShot: '', lastJump: null}; }
const SLA_SHOT = {smash: 'Sla… SMASH!', lob: 'Sla… LOB!', drop: 'Sla… plop.', slice: 'Sla… SLICE!'};   // st-1
function logHit(e){ const hp = G.M.players[e.p]; if(hp && hp.human && !hp.auto && !hp.remote && !e.jump){ const w = e.perfect ? 'Sla… PERFECT!' : SLA_SHOT[e.shot]; if(w && performance.now() - (G.lastSla || 0) > 1200){ G.lastSla = performance.now(); sla(hp, w); } }
  const L = G.plog; L.rally = e.rally; L.lastHit = e.p; L.lastShot = e.shot; L.lastJump = e.jump || null; if(e.shot === 'smash') L.smash = true; if(e.shot === 'drop') L.drop = true;
  if(e.rally === 15) comicImpact(G.M.players[e.p], 'Sla… 15 HITS!', 'rally', 'smash', '🔁 What a rally!'); }
function sla(p, text){ if(!FX) return; /* 💬 24t sla */ if(UI.callout && UI.callout.active()){ UI.callout(text, {who: p, say: G.comics}); return; } Comic.callout(text, {small: !G.comics, say: G.comics}); }
/* 💬 24t-a: words during play (UiKit UI.callout) — the court + people + ball stay clear, crowd fans on #court can say it */
function calloutSetup(){ if(!(window.UI && UI.callout)) return;
  const scr = (x, y, z) => { if(!G || !V) return null; const c = $('court').getBoundingClientRect(), d = V.dpr || 1, q = V.P(x, y, z || 0); return {x: c.left + q[0] / d, y: c.top + q[1] / d}; };
  const pl = w => !G ? null : typeof w === 'number' ? G.M.players[w] : w && w.side != null ? w : null;
  const me = () => G && (G.M.players.find(p => p.human && !p.remote && !p.auto) || G.M.players.find(p => p.human));
  UI.callout.setup({
    get me(){ return me(); },
    at: w => { const p = pl(w) || me(); if(!p) return null; const h = scr(p.x, p.y, 2.25); return h ? {x: h.x, y: h.y - 6} : null; },
    side: w => { const p = pl(w) || me(); return p ? p.side : null; },
    crowd: () => $('court'),
    poly: () => { if(!G || !V) return null; const S = G.sp, P = [scr(-S.Lh, -S.Wh), scr(S.Lh, -S.Wh), scr(S.Lh, S.Wh), scr(-S.Lh, S.Wh)]; return P.some(q => !q) ? null : P.map(q => [q.x, q.y]); },
    inside: (x, y) => { if(!G || !V) return false; const S = G.sp, P = [scr(-S.Lh, -S.Wh), scr(S.Lh, -S.Wh), scr(S.Lh, S.Wh), scr(-S.Lh, S.Wh)]; if(P.some(q => !q)) return false;
      let ins = false; for(let i = 0, j = 3; i < 4; j = i++){ const a = P[i], b = P[j]; if(((a.y > y) !== (b.y > y)) && (x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x)) ins = !ins; } return ins; },
    keep: () => { if(!G) return []; const out = [];
      G.M.players.forEach(p => { const f = scr(p.x, p.y, 0), h = scr(p.x, p.y, 2.3); if(!f || !h) return; const w = Math.max(26, Math.abs(f.y - h.y) * 0.45); out.push({l: f.x - w, r: f.x + w, t: h.y - 18, b: f.y + 8}); });
      (G.M.balls || []).forEach(b => { if(!b) return; const q = scr(b.x, b.y, b.z || 0), g = scr(b.x, b.y, 0); if(!q) return; out.push({l: q.x - 26, r: q.x + 26, t: q.y - 26, b: Math.max(q.y, g ? g.y : q.y) + 14}); });
      return out; }
  }); }
function comicImpact(p, words, design, pose, sub){
  if(!p) return false; const M = G.M; if(!G.comics || M.t - G.lastImpact < 10){ sla(p, words); return false; }   // Off / too soon → just the callout
  G.lastImpact = M.t; Comic.impact({who: {name: p.name, av: p.av}, words, design, pose, sub, ms: 1100, ball: comicBall}); return true;
}
function onJump(e){
  const M = G.M, p = M.players[e.p], L = G.plog;
  if(e.kind === 'v'){ if(e.ok){ L.jump = true; L.jumpBy = e.p; if(e.perfect) L.jumpPerfect = true; } UISound.play(e.ok ? 'whoosh' : 'bump');
    if(e.ok && e.perfect) comicImpact(p, 'Sla… SMASH!!!', 'jump', 'jump', '🦘 Jump smash!'); else sla(p, e.ok ? 'Sla… JUMP!' : 'Sla… oops!'); }
  else { if(e.ok){ L.dive = true; L.diveBy = e.p; } else { L.diveMiss = true; L.diveMissBy = e.p; } UISound.play('drop');
    if(e.ok) comicImpact(p, 'Sla… DIVE!', 'dive', 'dive', '🤸 Dive save!'); else sla(p, 'Sla… so close!'); }
  G.mlog.push({k: e.kind, ok: e.ok, perfect: e.perfect, p: e.p, t: M.t});
}
function comicBall(g, x, y, r, t){ const sp = G.sp; if(sp.kind === 'shuttle'){ BallSkins.shuttle(g, G.ball, G.feathers ? G.feathers[0] : -1, x, y, r * 1.2, t, Math.PI * 0.9); return; }
  if(G.ball >= 0 && sp.kind !== 'puck') BallSkins.draw(g, G.ball, x, y, r, t); else { g.save(); drawSportBall(g, sp, x, y, r, t, 0); g.restore(); } }
function momentOf(e){   // what happened in this point → Comic.pick
  const L = G.plog, M = G.M, sc = M.score, lastP = M.players[L.lastHit], ten = G.sp.scoring === 'tennis';
  const close = ten ? sc.pts[0] >= 3 && sc.pts[1] >= 3 : Math.abs(sc.pts[0] - sc.pts[1]) <= 1 && Math.max(sc.pts[0], sc.pts[1]) >= M.target - 2;
  return {dive: L.dive && L.lastJump === 'h' && lastP && lastP.side === e.side, diveMiss: L.diveMiss, jump: L.jump, jumpPerfect: L.jumpPerfect, power: L.power, ace: e.why === 'ace', glitch: !!(lastP && lastP.robot && lastP.side !== e.side && /out|net|wide|own/.test(e.why || '')),
    rally: L.rally, close, drop: L.lastShot === 'drop' && lastP && lastP.side === e.side, smash: L.smash};
}
function comicPoint(e){
  const M = G.M, L = G.plog, lastP = M.players[L.lastHit];
  if(L.dive && L.lastJump === 'h' && lastP && lastP.side === e.side) sla(lastP, 'Sla… DIVE… WINNER!!');
  else if(e.why === 'ace') sla(lastP, 'Sla… ACE!'); else if(e.why === 'goal' || e.why === 'legend') sla(lastP, 'Sla… GOAL!!');
  else if(L.lastShot === 'drop' && lastP && lastP.side === e.side) sla(lastP, 'Sla… plop.');
  G.lastPoint = {e, m: momentOf(e), plog: Object.assign({}, L)};
  if(L.rally >= 8 || L.dive || L.jumpPerfect) G.mlog.push({k: 'point', rally: L.rally, side: e.side, m: G.lastPoint.m, t: M.t});
  if(!G.comics || M.score.done) return;
  if(G.sp.scoring === 'tennis'){ G.stripNext = true; setTimeout(() => { G.stripNext = false; }, 50); return; }   // tennis-style: a strip on each GAME-winning point (the 'game' event follows)
  if(--G.nextStrip <= 0){ G.nextStrip = 2 + Math.floor(Math.random() * 3); comicStripNow(); }   // point sports: every 2–4 points
}
function comicStripNow(){ const LP = G.lastPoint; if(!LP || !G.comics) return; const design = Comic.pick(LP.m), panels = stripPanels(design, LP); G.stripNext = false;
  setTimeout(() => { if(G && !G.over) Comic.strip(design, {panels}); }, 650); }
function heroOf(LP, design){ const M = G.M, L = LP.plog, by = i => M.players[i];
  const i = design === 'dive' ? L.diveBy : design === 'divemiss' ? L.diveMissBy : design === 'jump' ? L.jumpBy : design === 'glitch' ? L.lastHit : L.lastHit;
  return by(i >= 0 ? i : 0) || M.players.find(p => p.side === LP.e.side) || M.players[0]; }
function stripPanels(design, LP){
  const M = G.M, hero = heroOf(LP, design), who = q => ({name: q.name, av: q.av}), opp = M.players.find(q => q.side !== hero.side) || hero, won = hero.side === LP.e.side;
  const W = Comic.DESIGNS[design].words, n = LP.plog.rally;
  const P1 = {who: who(hero), pose: 'ready', cap: hero.name + (n > 1 ? ' · rally ' + n : ''), words: W[0]};
  const P2 = {who: who(hero), pose: design === 'dive' || design === 'divemiss' ? 'dive' : design === 'glitch' ? 'glitch' : design === 'slowmo' ? 'ready' : 'smash', ball: comicBall, words: W[1], cap: Comic.DESIGNS[design].name};
  const P3 = {who: who(won ? hero : opp), pose: won ? 'cheer' : 'sad', words: won ? W[2] : 'Point ' + teamName(LP.e.side) + '!', cap: SB.pointText(M, 0) + ' – ' + SB.pointText(M, 1)};
  return [P1, P2, P3];
}
function winnerPanels(win){   // the 4-panel match strip: start · the best moment of the match · match point · the winner
  const M = G.M, ws = M.players.filter(p => p.side === win), ls2 = M.players.filter(p => p.side !== win), A = ws[0], B = ls2[0] || ws[0], who = q => ({name: q.name, av: q.av});
  const best = G.mlog.filter(x => x.k === 'h' && x.ok)[0] || G.mlog.filter(x => x.k === 'v' && x.ok && x.perfect)[0] || G.mlog.filter(x => x.k === 'point').sort((a, b) => b.rally - a.rally)[0];
  const bp = best ? M.players[best.p != null ? best.p : (M.players.find(q => q.side === best.side) || A).i] || A : A;
  const bw = !best ? 'What a match!' : best.k === 'h' ? 'Sla… DIVE!' : best.k === 'v' ? 'Sla… SMASH!!!' : 'Sla… ' + best.rally + ' HITS!';
  const scoreLine = G.sp.scoring === 'tennis' ? M.score.games[0] + ' – ' + M.score.games[1] : M.score.pts[0] + ' – ' + M.score.pts[1];
  return [{who: who(A), who2: who(B), pose: 'ready', pose2: 'ready', cap: G.sp.icon + ' ' + G.sp.name, words: 'Game on!'},
    {who: who(bp), pose: best && best.k === 'h' ? 'dive' : 'smash', ball: comicBall, cap: 'The big moment', words: bw},
    {who: who(A), pose: 'smash', ball: comicBall, cap: 'Match point', words: 'MATCH POINT!'},
    {who: who(A), who2: who(B), pose: 'cheer', pose2: 'sad', cap: scoreLine, words: 'SLA-BRALL!!!'}];
}

/* ---------- HUD ---------- */
function hud(){
  if(!G) return; const M = G.M, sc = M.score, ten = G.sp.scoring === 'tennis';
  BAR.players([0, 1].map(i => ({k: i, name: G.tn[i] + (ten ? ' · G' + sc.games[i] : ''), score: SB.pointText(M, i), on: G.sp.kind !== 'puck' && sc.serveSide === i, col: i ? '#18B8A6' : '#FF7A1A'})));
  BAR.count('rally', G.sp.kind === 'puck' ? '🏒' : '🔁', M.rally + (M.lv.hardcore ? ' · 💀' + (3 - sc.hcLost) : ''), 'Rally — hits in a row');
  [0, 1].forEach(side => { const tag = $('ptag-' + side), hold = M.players.filter(p => p.side === side && p.power);
    if(!hold.length){ tag.classList.add('hidden'); return; }
    tag.classList.remove('hidden'); tag.classList.toggle('gold', hold.some(p => SB.POWERS[p.power].tier === 2));
    tag.textContent = hold.map(p => SB.POWERS[p.power].icon + ' ' + (M.players.length > 2 ? p.name + ': ' : '') + SB.POWERS[p.power].name + (p.human ? ' (' + keyName(keySetsOf(p)[0].power) + ')' : '')).join(' · '); });
  $('pads').querySelectorAll('.shotpad').forEach(d => { const p = M.players[Number(d.dataset.p)]; const b = d.querySelector('.pw'); if(b) b.classList.toggle('ready', !!(p && p.power));
    d.querySelectorAll('.sbtn[data-a]').forEach(x => { if(x.dataset.a !== 'power') x.classList.toggle('armed', !!(p && p.queued === x.dataset.a && M.t - p.queuedT < 0.6)); }); });
  const sh = $('serve-hint'), b0 = M.balls[0], server = b0 && b0.held != null ? M.players[b0.held] : null;
  const stx = M.state === 'serve' && server && server.human && !server.remote && !G.paused ? sbsHint(M, sh, server) : null;   // 🎾 b3b6 toss → ⭕ glow
  if(stx){ if(sh.textContent !== stx) sh.textContent = stx; sh.classList.remove('hidden'); sh.classList.toggle('gold', stx.indexOf('⭕') === 0); }
  else sh.classList.add('hidden');
  sbsPads(M);
}
GameParts.loaded('SlaBrall_play', 's-sla');
