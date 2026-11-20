
/* 📏 pk-7a race#1 */
/* ================= 👥 RACE (pk-4d): 2 players on ONE device — the same pictures, the first poke on a change wins it =================
   Upright screen: 🧑 you = bottom half, your friend = top half TURNED ROUND (sit opposite each other). Wide screen: left | right.
   🤖 no friend? Race the Robot detective (top half, it pokes by itself). Wrong poke = ❄️ frozen a moment. Most changes after 3 pictures wins.
   Saves nothing on the server (a party mode) — UI.modeTried('race') only. */
const RACE = {BOT: [9, 8, 7, 6, 5, 4], FREEZE: [0.8, 0.9, 1, 1.2, 1.4, 1.5]};
/* 📏 pk-7a race#2 */
function raceOpponents(){ return (S.players || []).map(p => p.Name).filter(n => n && n !== S.player).slice(0, 7); }
function raceStart(lvl){   // startCase → here when 👥 Race is the mode: pick who you race
  if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'race');
  const opp = raceOpponents();
  showResult('<h2>👥 Race — who races you?</h2><p class="rc-sub">Same pictures for both of you. The first poke on a change wins it!</p><div class="rc-pick">' +
    opp.map(n => '<button class="sp-btn rc-who" data-sound="tap" data-n="' + UI.esc(n) + '">🧑 ' + UI.esc(n) + '</button>').join('') +
    '<button class="sp-btn sp-primary rc-who" data-sound="tap" data-n="">🤖 Robot detective</button></div>' +
    '<p class="rc-hint">👫 On a tablet your friend sits <b>opposite</b> you — their pictures turn round to face them.</p><div class="res-btns"><button class="sp-btn" id="rc-cancel" data-sound="tap">◀ Pokadif</button></div>');
  document.querySelectorAll('.rc-who').forEach(b => b.onclick = () => { hideResult(); raceGo(lvl, b.dataset.n || null); });
  $('rc-cancel').onclick = () => hideResult();
}
function raceGo(lvl, opp){
  raceStop();
  const L = PK.LEVELS[lvl];
  G = {mode: 'race', level: lvl, L, pic: -1, over: false, busy: true, used: {}, lastTheme: '', marks: [], k: 1, secs: 0, dpr: Math.min(2, window.devicePixelRatio || 1)};
  RC = {lvl, L, bot: !opp, names: [S.player, opp || 'Robot'], score: [0, 0], wins: [0, 0], freeze: [0, 0], owner: [], pf: [0, 0], timers: [], k: [1, 1], rounds: L.pics, marks: []};
  moment('start', {level: lvl, mode: 'race', vs: opp || 'robot'});   // pk-6a: for 💥 / 📣
  $('scr-menu').classList.add('hidden'); $('back-btn').classList.add('hidden');
  const sc = $('scr-race'); sc.classList.remove('hidden'); sc.classList.toggle('bot', RC.bot);
  [0, 1].forEach(p => { const h = $('rc-h' + p); h.querySelector('.rc-name').textContent = RC.names[p];
    const c = h.querySelector('.rc-av'); c.innerHTML = '';
    if(p === 1 && RC.bot){ c.textContent = '🤖'; return; }
    const cv = document.createElement('canvas'); c.appendChild(cv);
    if(UI.buddy && window.Acting && typeof drawAvatar === 'function'){ try{ RC['bd' + p] = UI.buddy(cv, {name: RC.names[p], av: myAvatar(RC.names[p])}, {}); }catch(e){ c.textContent = '🧑'; } } else c.textContent = '🧑'; });
  raceScore(); raceLayout(true);
  moment('start', {level: lvl, mode: 'race', bot: RC.bot});
  if(!FX) return raceNext();
  let n = 3; const big = $('rc-big'); const tick = () => { big.textContent = n > 0 ? n : 'GO!'; big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop'); UISound.play(n > 0 ? 'tap' : 'success');
    if(n-- > 0) RC.timers.push(setTimeout(tick, 650)); else RC.timers.push(setTimeout(() => { big.textContent = ''; raceNext(); }, 450)); };
  tick();
}
function raceNext(){
  if(!RC) return;
  G.pic++; if(G.pic >= RC.rounds) return raceEnd();
  const theme = SET.house;   // 🎲 pk-5c: Mix = its own 5-layer picture
  let sc = null; for(let i = 0; i < 12 && !sc; i++){ sc = makePicture(theme); if(sc && G.used[sc.sig]) sc = null; }
  G.lastTheme = sc.mix ? sc.theme : theme; G.used[sc.sig] = 1; G.scene = sc; RC.owner = sc.diffs.map(() => -1); RC.pf = [0, 0];
  RC.marks.forEach(m => m.el.remove()); RC.marks = [];
  $('rc-pic').textContent = '📸 ' + (G.pic + 1) + '/' + RC.rounds;
  raceDots(); raceLayout(true);
  document.querySelectorAll('#scr-race .pic').forEach(e => { e.classList.remove('in'); void e.offsetWidth; e.classList.add('in'); });
  raceSay(0, '🔍 Find ' + sc.diffs.length + ' changes — be first!'); raceSay(1, RC.bot ? '🤖 Beep… scanning…' : '🔍 Find ' + sc.diffs.length + ' changes — be first!');
  G.busy = false;
  if(RC.bot) raceBot();
  moment('picture', {n: G.pic, theme: sc.theme, seed: sc.seed});
}
function raceBot(){   // 🤖 pokes one change every few seconds (faster on harder levels)
  const t = RACE.BOT[RC.lvl] * (0.7 + Math.random() * 0.6) * 1000;
  RC.timers.push(setTimeout(() => { if(!RC || G.busy) return; const left = RC.owner.map((o, i) => o < 0 ? i : -1).filter(i => i >= 0); if(!left.length) return;
    raceFound(1, left[Math.floor(Math.random() * left.length)]); if(RC && !G.busy) raceBot(); }, window.PK_RACE_BOT_MS || t));
}
/* layout: upright = top / bottom halves (friend turned round), wide = left | right; inside each half the two pictures as big as they fit */
function raceLayout(force){
  if(!RC || !G || !G.scene) return;
  const wide = innerWidth > innerHeight * 1.15; $('scr-race').classList.toggle('wide', wide);
  [0, 1].forEach(p => {
    const bd = $('rc-h' + p).querySelector('.rc-board'), W = bd.clientWidth, H = bd.clientHeight; if(W < 20 || H < 20) return;
    const gap = Math.max(6, Math.min(12, Math.round(Math.min(W, H) * 0.03))), ar = PK.W / PK.H;
    const side = Math.min((W - gap * 3) / 2, (H - gap * 2) * ar), stack = Math.min(W - gap * 2, ((H - gap * 3) / 2) * ar);
    const vert = stack > side, w = Math.floor(Math.min(vert ? stack : side, 640)), h = Math.floor(w / ar); RC.k[p] = w / PK.W;
    const A = bd.querySelector('.rc-a'), B = bd.querySelector('.rc-b');
    [A, B].forEach(e => { e.style.width = w + 'px'; e.style.height = h + 'px'; });
    if(vert){ const top = Math.max(gap / 2, (H - (h * 2 + gap)) / 2), left = (W - w) / 2; Object.assign(A.style, {left: left + 'px', top: top + 'px'}); Object.assign(B.style, {left: left + 'px', top: (top + h + gap) + 'px'}); }
    else { const left = (W - (w * 2 + gap)) / 2, top = Math.max(gap / 2, (H - h) / 2); Object.assign(A.style, {left: left + 'px', top: top + 'px'}); Object.assign(B.style, {left: (left + w + gap) + 'px', top: top + 'px'}); }
    [[A, 'A'], [B, 'B']].forEach(([e, s]) => { const cv = e.querySelector('canvas'), pw = Math.round(w * G.dpr), ph = Math.round(h * G.dpr); if(cv.width !== pw || cv.height !== ph){ cv.width = pw; cv.height = ph; } pkPaint(cv, G.scene, s, RC.k[p], G.dpr); });
  });
  RC.marks.forEach(racePlace);
}
function raceMark(p, side, cls, x, y, r, txt){ const host = $('rc-h' + p).querySelector(side === 'A' ? '.rc-a' : '.rc-b'), e = document.createElement('div'); e.className = 'mk ' + cls; if(txt) e.textContent = txt; host.appendChild(e);
  const m = {el: e, p, x, y, r}; RC.marks.push(m); racePlace(m); return m; }
function racePlace(m){ const k = RC.k[m.p]; m.el.style.left = (m.x * k) + 'px'; m.el.style.top = (m.y * k) + 'px'; if(m.r) m.el.style.width = m.el.style.height = Math.round(m.r * 2 * k) + 'px'; }
function raceTurned(p){ return p === 1 && !RC.bot && !$('scr-race').classList.contains('wide'); }
// pk-5d: a poke circle is never smaller than 15 px on the screen (4 small pictures on a phone held sideways: a ✨ particle's circle was 13.7 px)
function raceSlack(p, touch){ const k = (RC && RC.k && RC.k[p]) || 1; return Math.max(touch ? 5 : 0, 15 / k - PK.MIN_HIT, 0); }
function racePoke(p, side, e){
  if(!RC || G.busy || (p === 1 && RC.bot)) return;
  if(e.isPrimary === false && e.pointerType !== 'touch') return;
  e.preventDefault();
  if(performance.now() < RC.freeze[p]) return;
  const pic = e.currentTarget, r = pic.getBoundingClientRect(); let x = (e.clientX - r.left) / r.width * PK.W, y = (e.clientY - r.top) / r.height * PK.H;
  if(raceTurned(p)){ x = PK.W - x; y = PK.H - y; }   // the friend's half is turned round
  if(x < 0 || y < 0 || x > PK.W || y > PK.H) return;
  const free = RC.owner.map(o => o >= 0), i = PK.poke(G.scene, x, y, free, raceSlack(p, e.pointerType === 'touch'));
  if(i >= 0) return raceFound(p, i);
  if(PK.pokeFound(G.scene, x, y, free) >= 0){ UISound.play('tap'); raceSay(p, '✓ ' + RC.names[RC.owner[PK.pokeFound(G.scene, x, y, free)]] + ' got that one!'); return; }
  // ❄️ oops: frozen a moment (stops tap-tap-tap everywhere)
  const s = RACE.FREEZE[RC.lvl]; RC.freeze[p] = performance.now() + s * 1000; UISound.play('error'); moment('oops', {mode: 'race', player: p, freeze: s});   // pk-6a: ❄️ for 💥 / 📣
  const m = raceMark(p, side, 'oops', x, y, 0, '✗'); setTimeout(() => { m.el.remove(); if(RC) RC.marks = RC.marks.filter(q => q !== m); }, FX ? 800 : 0);
  const h = $('rc-h' + p); h.classList.add('frozen'); setTimeout(() => h.classList.remove('frozen'), s * 1000);
  raceSay(p, '❄️ Oops! Frozen ' + s + ' s…', 'oops'); moment('oops', {side, player: p});
}
function raceFound(p, i){
  if(RC.owner[i] >= 0) return;
  const d = G.scene.diffs[i]; RC.owner[i] = p; RC.score[p]++; RC.pf[p]++;
  [0, 1].forEach(h => ['A', 'B'].forEach(s => raceMark(h, s, 'found rc-p' + p, d.x, d.y, d.hit)));
  UISound.play(p === 1 && RC.bot ? 'tap' : 'success'); const b = RC['bd' + p]; if(b && b.react) b.react('happy');
  raceScore(); raceDots();
  raceSay(p, (FOUND_SAY[d.sub] || '🎉 Got one!'), 'yay'); raceSay(1 - p, (p === 1 && RC.bot ? '🤖 ' : '') + RC.names[p] + ' got one — hurry!');
  moment('found', {i, sub: d.sub, player: p});
  if(RC.owner.every(o => o >= 0)) racePicDone();
}
function racePicDone(){
  G.busy = true; RC.timers.forEach(clearTimeout); RC.timers = [];
  const [a, b] = RC.pf, w = a === b ? -1 : a > b ? 0 : 1; if(w >= 0) RC.wins[w]++; moment('picdone', {mode: 'race', winner: w, pf: RC.pf.slice(), score: RC.score.slice()});   // pk-6a
  const big = $('rc-big'); big.textContent = w < 0 ? '🤝 Tie!' : '🖼️ ' + RC.names[w] + '!'; big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop');
  UISound.play('success');
  RC.timers.push(setTimeout(() => { big.textContent = ''; raceNext(); }, FX ? 1600 : 0));
}
function raceEnd(){
  G.busy = true; G.over = true; RC.timers.forEach(clearTimeout); RC.timers = [];
  const [a, b] = RC.score, w = a === b ? -1 : a > b ? 0 : 1, n = RC.names;
  moment(w === 0 ? 'win' : 'lose', {mode: 'race', score: RC.score.slice()});
  if(w >= 0){ const bd = RC['bd' + w]; if(bd && bd.react) bd.react('win'); }
  UISound.play(w === 0 || (w === 1 && !RC.bot) ? 'success' : 'error');
  showResult('<h2 class="cheer">' + (w < 0 ? '🤝 A tie!' : '🏆 ' + UI.esc(n[w]) + ' wins the race!') + '</h2>' +
    '<p class="rc-final"><b class="rc-c0">' + UI.esc(n[0]) + ' ' + a + '</b> · <b class="rc-c1">' + (RC.bot ? '🤖 ' : '') + UI.esc(n[1]) + ' ' + b + '</b> changes</p>' +
    '<p class="rc-sub">' + RC.rounds + ' pictures · ' + PK.LEVELS[RC.lvl].name + (w === 1 && RC.bot ? ' · the robot is fast — try again!' : '') + '</p>' +
    '<div class="res-btns"><button class="sp-btn sp-primary" id="rc-again" data-sound="tap">🔁 Race again</button><button class="sp-btn" id="rc-lv" data-sound="tap">🎚️ Levels</button></div>');
  const opp = RC.bot ? null : n[1], lvl = RC.lvl;
  $('rc-again').onclick = () => { hideResult(); raceGo(lvl, opp); };
  $('rc-lv').onclick = () => { hideResult(); raceLeave(); };
}
function raceStop(){ if(RC){ RC.timers.forEach(clearTimeout); RC.marks.forEach(m => m.el.remove()); } RC = null; }
function raceLeave(){ raceStop(); if(G) G.over = true; $('scr-race').classList.add('hidden'); $('rc-big').textContent = ''; renderMenu(); showScreen('menu'); }
function raceScore(){ [0, 1].forEach(p => { $('rc-h' + p).querySelector('.rc-score').textContent = RC.score[p]; }); }
function raceDots(){ const ds = (RC.owner || []).map(o => '<i class="' + (o >= 0 ? 'on rc-p' + o : '') + '"></i>').join(''); [0, 1].forEach(p => { $('rc-h' + p).querySelector('.rc-dots').innerHTML = ds; }); }
function raceSay(p, txt, cls){ const e = $('rc-h' + p).querySelector('.rc-say'); e.textContent = txt; e.className = 'rc-say' + (cls ? ' ' + cls : ''); }
[0, 1].forEach(p => { const h = $('rc-h' + p); [['.rc-a', 'A'], ['.rc-b', 'B']].forEach(([q, s]) => h.querySelector(q).addEventListener('pointerdown', e => racePoke(p, s, e))); });
$('rc-back').onclick = () => { const b = $('rc-back'); if(G && !G.over && !b.classList.contains('sure')){ b.classList.add('sure'); b.textContent = '◀ Tap again to leave'; setTimeout(() => { b.classList.remove('sure'); b.textContent = '◀ Pokadif'; }, 2500); return; } b.classList.remove('sure'); b.textContent = '◀ Pokadif'; raceLeave(); };   // 2 taps: no leaving by accident
window.addEventListener('resize', () => { if(RC && !$('scr-race').classList.contains('hidden')) raceLayout(); });
GameParts.loaded('Pokadif_race', 'pk-7a');
