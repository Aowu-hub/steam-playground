
/* 📏 pk-7a cases#1 */
const VERB_SAY = {find: '🔍 Find', quiz: '📜 Read', walk: '🚶 Walk', spot: '🖼️ Spot', crack: '🔐 Crack', accuse: '👉 Accuse'};
function caseOf(){ return PK.caseById(SET.caseId || 'magnet'); }
/* 📏 pk-7a cases#2 */
function caseSeenSave(o){ try{ localStorage.setItem(CASE_KEY + ':' + (S.player || ''), JSON.stringify(o)); }catch(e){} }
function lessonCount(){ return Object.keys(caseSeen()).filter(k => /^L:/.test(k)).length; }
/* 📏 pk-7a cases#3 */

/* ---------- start + steps ---------- */
function storyStart(lvl){
  const L = PK.LEVELS[lvl], St = PK.STORY[lvl];
  let K = null; for(let i = 0; i < 6 && (!K || !K.find || !K.walk); i++) K = PK.makeCase(PK.newSeed(), lvl, SET.caseId || 'magnet');
  G = {mode: 'detective', level: lvl, L, St, K, C: K.C, si: -1, pic: 0, over: false, paused: false, held: false, secs: 0, last: performance.now(), found: [], marks: [], scene: null, used: {}, lastTheme: '',
    lives: L.lives || 0, rounds: 3, A: null, timeLeft: 0, cps: 0, pics: 0, total: {found: 0, oops: 0, hints: 0, perfect: 0, quick: 0, points: 0}, picLog: [], busy: true, k: 1, dpr: Math.min(2, window.devicePixelRatio || 1),
    step: null, chapters: 0, lessons: [], clues: {}, hints: 0, pOops: 0, pHints: 0, pSecs: 0, lastFind: performance.now()};
  $('scr-play').dataset.mode = 'detective'; GC_LOG.length = 0;
  if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'detective');
  showScreen('play');
  BAR.level(L.name + (L.hardcore ? ' 💀' : ''));
  BAR.count('pic', '📖', '1/3', 'Chapter'); BAR.count('found', '🔎', '0', 'Found'); BAR.hide('found', true); BAR.miss(0);
  const hasSlot = k => !!document.querySelector('#scr-play .gb-' + k);
  if(lvl > 0) BAR.time(0); else if(hasSlot('time')) BAR.hide('time', true);
  $('tbar').classList.add('hidden');
  if(G.lives) BAR.lives(G.lives); else if(hasSlot('lives')) BAR.hide('lives', true);
  BAR.fit(); bdStart(); $('dots').innerHTML = ''; updHint(); layout(true); startTicker();
  moment('story', {case: K.id, level: lvl, thief: K.thief.name});
  goal('📖 ' + K.C.icon + ' ' + K.C.name);
  storyCard({icon: K.C.icon, kicker: '📖 Case ' + K.C.n, title: K.C.name, text: K.C.open, btn: '🕵️ Take the case!', kind: 'open'}).then(nextStep);
}
function nextStep(){
  if(!G || G.over) return;
  G.si++; const K = G.K;
  if(G.si >= K.steps.length) return caseSolved();
  const st = K.steps[G.si], ch = K.C.chapters[st.ch];
  const go = () => { if(!G || G.over) return; G.step = st; G.pOops = 0; G.pHints = 0; G.pSecs = 0; G.lastFind = performance.now(); G.hints = G.St.hints; G.glowAt = -1;
    BAR.count('pic', '📖', (st.ch + 1) + '/3', 'Chapter'); clearMarks(); hideHand(); $('sbox').innerHTML = ''; $('sbox').classList.remove('wide'); $('sbox').dataset.verb = st.verb;
    moment('step', {verb: st.verb, ch: st.ch});
    ({find: stepFind, quiz: stepQuiz, walk: stepWalk, spot: stepSpot, crack: stepCrack, accuse: stepAccuse})[st.verb](); updHint(); };
  if(st.first){ G.busy = true; moment('chapter', {i: st.ch, title: ch.title}); storyCard({icon: ch.icon, kicker: '📖 Chapter ' + (st.ch + 1) + ' of 3', title: ch.title, text: ch.say, btn: '▶ ' + VERB_SAY[st.verb], kind: 'chapter'}).then(go); }
  else go();
}
function stepDone(){
  if(!G || G.over) return; G.busy = true; hideHand();
  const st = G.step, secs = Math.round(G.pSecs), pts = PK.storyPoints(G.level, {oops: G.pOops, hints: G.pHints, secs});
  G.total.points += pts; if(!G.pOops && !G.pHints) G.total.perfect++;
  bigWord('✅ ' + VERB_SAY[st.verb] + ' — done!', '+' + pts + ' points', 'good'); bdReact('joy', 1600); UISound.play('unlock');
  G.marks.filter(m => m.cls === 'glow').forEach(dropMark);
  const K = G.K, C = K.C, cards = [];
  if(st.verb === 'find'){ G.clues.boot = K.thief.boot; cards.push({icon: '👣', kicker: '🧩 Clue 1', title: 'The thief wears ' + K.thief.boot[1] + ' boots!', text: 'Every one of those prints is a <b style="color:' + K.thief.boot[0] + '">' + K.thief.boot[1] + '</b> boot. Remember it!', btn: '📝 Got it', kind: 'clue', clue: 'boot'}); }
  if(st.verb === 'spot'){ G.clues.drop = K.thief.drop; cards.push({icon: K.thief.drop[0], kicker: '🧩 Clue 2', title: 'The camera saw ' + K.thief.drop[1] + '!', text: 'In picture B the thief dropped <b>' + K.thief.drop[0] + ' ' + K.thief.drop[1] + '</b> ' + C.dropAt + '. Who leaves that around?', btn: '📝 Got it', kind: 'clue', clue: 'drop'}); }
  if(st.last){ G.chapters++; const Ls = C.lessons[st.ch]; if(Ls){ G.lessons.push(st.ch); const seen = caseSeen(); seen['L:' + C.id + ':' + st.ch] = 1; caseSeenSave(seen);
    cards.push({icon: Ls.icon, kicker: '🎓 Lesson card ' + (st.ch + 1) + ' of 3 · ' + C.topic, title: Ls.title, text: Ls.text, btn: st.ch < 2 ? '▶ Next chapter' : '📁 Close the case', kind: 'lesson', lesson: st.ch}); } }
  moment('stepdone', {verb: st.verb, oops: G.pOops, hints: G.pHints, secs});
  const run = i => { if(!G || G.over) return; if(i >= cards.length) return nextStep(); const c = cards[i]; moment(c.kind, {i: c.lesson != null ? c.lesson : 0, clue: c.clue}); storyCard(c).then(() => run(i + 1)); };
  pkWait(st.verb === 'accuse' ? 900 : 1100).then(() => { if(!G || G.over) return; if(st.verb === 'accuse') return caseSolved(); run(0); });
}
function caseSolved(){
  if(!G || G.over) return; G.busy = true;
  const K = G.K, C = K.C; bigWord('📁 CASE CLOSED!', '', 'big', true); UISound.play('success'); confetti([C.icon, '🔍', '⭐', '🕵️'], 20);
  moment('caught', {thief: K.thief.name});
  const Ls = C.lessons[2]; G.chapters = 3; if(G.lessons.indexOf(2) < 0){ G.lessons.push(2); const seen = caseSeen(); seen['L:' + C.id + ':2'] = 1; caseSeenSave(seen); }
  pkWait(1100).then(() => { if(!G || G.over) return; moment('lesson', {i: 2}); storyCard({icon: Ls.icon, kicker: '🎓 Lesson card 3 of 3 · ' + C.topic, title: Ls.title, text: Ls.text, btn: '📁 Close the case', kind: 'lesson', lesson: 2}).then(() => finishStory(true)); });
}
/* 📏 pk-7a cases#4 */
function storyCard(o){
  if(G) G.busy = true; const box = $('scard');
  box.className = 'scard ' + (o.kind || ''); box.innerHTML = '<div class="sc-in"><div class="sc-ic">' + o.icon + '</div><div class="sc-k">' + UI.esc(o.kicker || '') + '</div><h3>' + UI.esc(o.title) + '</h3><p>' + o.text + '</p><button class="sp-btn sp-primary" id="scard-go" data-sound="pop">' + UI.esc(o.btn || '▶ Go') + '</button></div>';
  box.classList.remove('hidden'); if(o.kind === 'lesson' || o.kind === 'clue') UISound.play('unlock');
  return new Promise(res => { CARD_RES = () => { CARD_RES = null; box.classList.add('hidden'); box.innerHTML = ''; if(G) G.busy = false; res(); }; $('scard-go').onclick = () => { if(G && G.paused) return; CARD_RES && CARD_RES(); }; });
}

/* ---------- 🔍 FIND: the thief's footprints on a busy floor (one big picture) ---------- */
function stepFind(){
  const K = G.K, sc = K.find, n = sc.diffs.length; G.scene = sc; G.found = sc.diffs.map(() => false);
  BAR.hide('found', false); BAR.count('found', '👣', '0/' + n, 'Footprints'); $('dots').innerHTML = sc.diffs.map(() => '<i></i>').join('');
  layout(true); ['pic-a'].forEach(id => { const e = $(id); e.classList.remove('in'); void e.offsetWidth; e.classList.add('in'); });
  const chip = '<b class="chip" style="background:' + K.thief.boot[0] + '"></b>';
  goal(G.level === 0 ? '👣 Poke the ' + n + ' ' + chip + ' ' + K.thief.boot[1] + ' footprints!' : '🔍 Find ' + n + ' ' + chip + ' ' + K.thief.boot[1] + (G.St.look ? ' prints only!' : ' footprints!'));
  G.busy = false; if(G.St.guide) guideHand();
}
/* ---------- 🖼️ SPOT: the camera — before (A) and after (B) ---------- */
function stepSpot(){
  const K = G.K; let sc = null; for(let i = 0; i < 6 && !sc; i++) sc = PK.makeScene(i ? PK.newSeed() : K.spotSeed, G.level, K.C.theme, {n: G.St.spot});
  G.scene = sc; G.found = sc.diffs.map(() => false); const n = sc.diffs.length;
  BAR.hide('found', false); BAR.count('found', '🔎', '0/' + n, 'Found'); $('dots').innerHTML = sc.diffs.map(() => '<i></i>').join('');
  layout(true); ['pic-a', 'pic-b'].forEach(id => { const e = $(id); e.classList.remove('in'); void e.offsetWidth; e.classList.add('in'); });
  goal('📹 The camera: A = before, B = after. Find ' + n + ' changes!');
  G.busy = false;
}
/* ---------- 📜 READ: a question with picture cards ---------- */
function stepQuiz(){
  const Q = G.K.quiz; BAR.hide('found', true); $('dots').innerHTML = '';
  const box = $('sbox'); box.innerHTML = '<div class="sq">' + UI.esc(Q.q) + '</div><div class="sopts" id="sopts">' + Q.opts.map((o, i) => '<button class="sopt" data-i="' + i + '" data-sound="none"><span class="e">' + o.icon + '</span><span class="t">' + UI.esc(o.name) + '</span></button>').join('') + '</div>';
  box.querySelectorAll('.sopt').forEach(b => b.addEventListener('pointerdown', e => { if(e.isPrimary === false) return; e.preventDefault(); onQuiz(+b.dataset.i); }));
  layout(true); goal(Q.nope ? '📜 Careful — this time: which one is NOT?' : '📜 Read it, then poke your answer!');
  G.busy = false;
}
function onQuiz(i){
  if(!G || G.over || G.busy || G.paused || !G.step || G.step.verb !== 'quiz') return; hideHand();
  const Q = G.K.quiz, o = Q.opts[i], b = $('sopts').children[i];
  if(!b || b.classList.contains('out')) return;
  if(o.ok){ b.classList.add('right'); [...$('sopts').children].forEach((x, j) => { if(j !== i) x.classList.add('dim'); }); UISound.play('success'); bdReact('happy', 1300);
    goal('🎉 Yes! ' + o.icon + ' ' + o.name + ' ' + (Q.nope ? Q.why.no : Q.why.yes), 'yay'); moment('quiz', {right: true}); return stepDone(); }
  b.classList.add('out', 'nope'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
  goal('❌ ' + o.icon + ' ' + o.name + ' ' + (Q.nope ? Q.why.yes : Q.why.no), 'oops');
  moment('quiz', {right: false}); storyOops();
}
/* ---------- 🚶 WALK: follow the trail to the storeroom (🔑 first from Junior · 👟 step limit from Intermediate) ---------- */
function stepWalk(){
  const W = G.K.walk; G.walk = {pos: W.start.slice(), key: !W.key, steps: 0, trail: {}};
  const n = Math.round(W.path.length * G.St.trail); for(let i = 1; i < W.path.length - 1; i++) if(G.St.trail >= 1 || (i % 2 === 0 && i <= n * 2)) G.walk.trail[W.path[i].join(',')] = 1;
  BAR.hide('found', !W.limit); if(W.limit) BAR.count('found', '👟', '0/' + W.limit, 'Steps');
  const box = $('sbox'); box.innerHTML = '<div class="wmap" id="wmap"></div>';
  for(let y = 0; y < W.rows; y++) for(let x = 0; x < W.cols; x++){ const t = document.createElement('button'); t.className = 'wt' + (W.wall[y][x] ? ' wall' : ''); t.dataset.x = x; t.dataset.y = y; t.setAttribute('data-sound', 'none'); t.addEventListener('pointerdown', e => { if(e.isPrimary === false) return; e.preventDefault(); walkTo(x, y); }); $('wmap').appendChild(t); }
  drawWalk(); layout(true);
  const to = G.K.C.walkTo || 'storeroom';
  goal(W.key ? '🚶 Grab the 🔑 key, then walk to the 🚪 ' + to + '!' + (W.limit ? ' (' + W.limit + ' steps)' : '') : '🚶 Follow the 👣 trail to the 🚪 ' + to + '! Poke the next tile.');
  G.busy = false; if(G.St.guide) walkGlow();
}
function drawWalk(){
  const W = G.K.walk, P = G.walk, box = $('wmap'); if(!box) return;
  [...box.children].forEach(t => { const x = +t.dataset.x, y = +t.dataset.y, k = x + ',' + y; let s = '';
    if(W.wall[y][x]) s = '🧱'; else if(P.pos[0] === x && P.pos[1] === y) s = '🕵️'; else if(W.door[0] === x && W.door[1] === y) s = P.key ? '🚪' : '🔒'; else if(W.key && !P.key && W.key[0] === x && W.key[1] === y) s = '🔑'; else if(P.trail[k]) s = '<i class="tr" style="color:' + G.K.thief.boot[0] + '">👣</i>';
    t.innerHTML = s; t.classList.toggle('me', P.pos[0] === x && P.pos[1] === y); t.classList.remove('glow'); });
}
function walkNext(){ const W = G.K.walk, P = G.walk, goalT = P.key ? W.door : W.key, p = walkPath(P.pos, goalT); return p.length > 1 ? p[1] : null; }
function walkPath(a, b){ const W = G.K.walk, prev = {}, Q = [a], k = p => p[0] + ',' + p[1]; prev[k(a)] = null;
  while(Q.length){ const p = Q.shift(); if(p[0] === b[0] && p[1] === b[1]) break; [[1, 0], [0, 1], [0, -1], [-1, 0]].forEach(d => { const q = [p[0] + d[0], p[1] + d[1]]; if(q[0] < 0 || q[1] < 0 || q[0] >= W.cols || q[1] >= W.rows || W.wall[q[1]][q[0]] || prev[k(q)] !== undefined) return; prev[k(q)] = p; Q.push(q); }); }
  if(prev[k(b)] === undefined) return []; const out = []; let c = b; while(c){ out.unshift(c); c = prev[k(c)]; } return out; }
function walkGlow(){ const n = walkNext(); if(!n) return; const t = $('wmap') && $('wmap').querySelector('.wt[data-x="' + n[0] + '"][data-y="' + n[1] + '"]'); if(t) t.classList.add('glow'); G.glowAt = performance.now(); }
function walkTo(x, y){
  if(!G || G.over || G.busy || G.paused || !G.step || G.step.verb !== 'walk') return; hideHand();
  const W = G.K.walk, P = G.walk, dx = Math.abs(x - P.pos[0]), dy = Math.abs(y - P.pos[1]);
  if(dx + dy === 0) return;
  if(dx + dy !== 1){ UISound.play('tap'); goal('🚶 One step at a time — poke a tile right next to 🕵️.'); return; }
  if(W.wall[y][x]){ UISound.play('error'); goal('🧱 A wall! Find a way around.', 'oops'); return; }
  if(!P.key && W.door[0] === x && W.door[1] === y){ UISound.play('error'); goal('🔒 Locked! Grab the 🔑 key first.', 'oops'); return; }
  P.pos = [x, y]; P.steps++; G.lastFind = performance.now(); UISound.play('tap'); moment('walk', {x, y, steps: P.steps});
  if(W.key && !P.key && W.key[0] === x && W.key[1] === y){ P.key = true; UISound.play('success'); bdReact('happy', 1000); goal('🔑 Got the key! Now the 🚪 door.', 'yay'); }
  if(W.limit) BAR.count('found', '👟', P.steps + '/' + W.limit, 'Steps');
  drawWalk();
  if(P.key && W.door[0] === x && W.door[1] === y){ goal('🚪 The ' + (G.K.C.walkTo || 'storeroom') + '! Well walked.', 'yay'); return stepDone(); }
  if(W.limit && P.steps >= W.limit){ goal('🥵 Out of steps — back to the start. Try a shorter way!', 'oops'); P.pos = W.start.slice(); P.steps = 0; P.key = !W.key; BAR.count('found', '👟', '0/' + W.limit, 'Steps'); drawWalk(); storyOops(true); return; }
  if(G.St.guide) walkGlow();
}
/* ---------- 🔐 CRACK: the code lock — every number hides in a clue ---------- */
function stepCrack(){
  const D = G.K.crack.digits; G.code = D.map(() => null); G.ci = 0; BAR.hide('found', true); $('dots').innerHTML = '';
  const legend = D.some(d => d.kind === 'cipher') ? '<div class="cleg">🔤 A=1 · B=2 · C=3 · D=4 · E=5 · F=6 · G=7 · H=8 · I=9</div>' : '';
  $('sbox').innerHTML = '<div class="clock" id="clock"><div class="ctop">🔐</div><div class="cclues">' + D.map((d, i) => '<div class="cc" data-i="' + i + '"><div class="cq k-' + d.kind + '">' + UI.esc(d.q) + '</div><div class="cs" id="cs' + i + '"></div></div>').join('') + '</div>' + legend + '</div>'
    + '<div class="cpad" id="cpad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button class="ck" data-n="' + n + '" data-sound="none">' + n + '</button>').join('') + '<button class="ck back" data-n="del" data-sound="none">⌫</button></div>';
  $('cpad').querySelectorAll('.ck').forEach(b => b.addEventListener('pointerdown', e => { if(e.isPrimary === false) return; e.preventDefault(); crackKey(b.dataset.n); }));
  drawCrack(); layout(true);
  goal(G.level === 0 ? '🔐 Count the things above each box — that\'s the number!' : '🔐 Crack the code: every number hides in its clue.');
  G.busy = false;
}
function drawCrack(){ const D = G.K.crack.digits; D.forEach((d, i) => { const s = $('cs' + i); if(!s) return; s.textContent = G.code[i] == null ? '' : G.code[i]; s.classList.toggle('on', i === G.ci); s.classList.remove('bad', 'good'); }); document.querySelectorAll('#cpad .ck').forEach(b => b.classList.remove('glow')); }
function crackKey(n){
  if(!G || G.over || G.busy || G.paused || !G.step || G.step.verb !== 'crack') return; hideHand(); G.lastFind = performance.now();
  const D = G.K.crack.digits;
  if(n === 'del'){ let i = G.ci < D.length && G.code[G.ci] == null ? G.ci - 1 : G.ci; if(i >= D.length) i = D.length - 1; if(i < 0) return; G.code[i] = null; G.ci = i; UISound.play('tap'); drawCrack(); return; }
  if(G.ci >= D.length) return; G.code[G.ci] = +n; UISound.play('tap'); moment('crack', {i: G.ci, n: +n});
  let nx = G.code.findIndex(v => v == null); G.ci = nx < 0 ? D.length : nx; drawCrack();
  if(nx < 0) crackCheck();
}
function crackCheck(){
  const D = G.K.crack.digits, bad = D.map((d, i) => G.code[i] !== d.a);
  if(!bad.some(Boolean)){ D.forEach((d, i) => $('cs' + i).classList.add('good')); $('clock').classList.add('open'); goal('🔓 Click! The box opens — and the ' + G.K.C.thing + ' is inside!', 'yay'); UISound.play('success'); return stepDone(); }
  const keep = G.level <= 2;
  D.forEach((d, i) => { const s = $('cs' + i); if(bad[i]){ s.classList.add('bad'); } else if(keep) s.classList.add('good'); });
  const wi = bad.indexOf(true), nth = ['1st', '2nd', '3rd', '4th'][wi];
  goal(keep ? '❌ The ' + nth + ' number isn\'t right — ' + ({count: 'count again', sum: 'add them up', minus: 'take away', pattern: 'what comes next?', cipher: 'A = 1, B = 2…'})[D[wi].kind] + '.' : '❌ Wrong code — check every clue again.', 'oops');
  storyOops();
  pkWait(FX ? 700 : 0).then(() => { if(!G || G.over) return; D.forEach((d, i) => { if(bad[i] || !keep) G.code[i] = null; }); G.ci = G.code.findIndex(v => v == null); drawCrack(); });
}
function crackGlow(){ const D = G.K.crack.digits; if(G.ci >= D.length) return; const b = document.querySelector('#cpad .ck[data-n="' + D[G.ci].a + '"]'); if(b) b.classList.add('glow'); G.glowAt = performance.now(); }
/* ---------- 👉 ACCUSE: the suspect with BOTH clues ---------- */
function stepAccuse(){
  const K = G.K, c = G.clues; BAR.hide('found', true); $('dots').innerHTML = '';
  $('sbox').innerHTML = '<div class="sq">👉 Who did it? Your clues: <b class="chip" style="background:' + K.thief.boot[0] + '"></b> ' + K.thief.boot[1] + ' boots · ' + K.thief.drop[0] + ' ' + UI.esc(K.thief.drop[1]) + '</div><div class="sopts sus" id="sopts">'
    + K.people.map((p, i) => '<button class="sopt sp" data-i="' + i + '" data-sound="none"><span class="e">' + p.icon + '</span><span class="t">' + UI.esc(p.name) + '</span><span class="tr2"><b class="chip" style="background:' + p.boot[0] + '"></b> ' + p.boot[1] + ' · ' + p.drop[0] + '</span></button>').join('') + '</div>';
  $('sopts').querySelectorAll('.sopt').forEach(b => b.addEventListener('pointerdown', e => { if(e.isPrimary === false) return; e.preventDefault(); onAccuse(+b.dataset.i); }));
  layout(true); goal(G.St.twins ? '👉 Only ONE suspect matches BOTH clues — poke them!' : '👉 Who wears ' + K.thief.boot[1] + ' boots? Poke the thief!');
  G.busy = false; void c;
}
function onAccuse(i){
  if(!G || G.over || G.busy || G.paused || !G.step || G.step.verb !== 'accuse') return; hideHand();
  const K = G.K, p = K.people[i], b = $('sopts').children[i]; if(!b || b.classList.contains('out')) return;
  if(i === K.culprit){ b.classList.add('right'); [...$('sopts').children].forEach((x, j) => { if(j !== i) x.classList.add('dim'); }); UISound.play('success'); bdReact('win', 1800);
    goal('🎉 Caught! ' + p.icon + ' ' + p.name + ' has ' + p.boot[1] + ' boots AND ' + p.drop[1] + '!', 'yay'); moment('accuse', {right: true, who: p.name}); return stepDone(); }
  const m = PK.clueMatch(K, p); b.classList.add('out', 'nope'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
  goal('❌ ' + p.icon + ' ' + p.name + ': ' + (m.boot ? '✓ ' : '✗ ') + p.boot[1] + ' boots · ' + (m.drop ? '✓ ' : '✗ ') + p.drop[1] + ' — not our thief!', 'oops');
  moment('accuse', {right: false, who: p.name}); storyOops();
}
/* ---------- oops / hints / glow for the DOM steps ---------- */
function storyOops(soft){
  G.pOops++; G.total.oops++; BAR.miss(G.total.oops); if(!soft) UISound.play('error'); bdReact('miss', 1400);
  if(G.L.lives){ G.lives--; BAR.lives(Math.max(0, G.lives), G.lives <= 1); if(G.lives <= 0){ goal('💀 Out of oops — the thief got away this time.', 'oops'); G.busy = true; bdReact('lose', 2200); pkWait(1400).then(() => { if(G && !G.over) finishStory(false); }); } }
}
function storyHint(){
  const v = G.step && G.step.verb; G.hints--; G.pHints++; G.total.hints++; updHint(); UISound.play('whoosh'); moment('hint', {verb: v});
  if(v === 'walk'){ walkGlow(); goal('🔍 Step on the glowing tile!'); return; }
  if(v === 'crack'){ crackGlow(); goal('🔍 Press the glowing number!'); return; }
  const box = $('sopts'), list = v === 'quiz' ? G.K.quiz.opts.map((o, i) => o.ok ? -1 : i) : G.K.people.map((p, i) => i === G.K.culprit ? -1 : i);
  const i = list.find(j => j >= 0 && !box.children[j].classList.contains('out')); if(i == null) return;
  box.children[i].classList.add('out', 'dim'); goal('🔍 That one is not it — look at the others!');
}
function storyTick(now){
  const v = G.step && G.step.verb; if(!v || G.busy) return;
  const glowS = G.L.glow || (G.St.guide ? 6 : 0);
  if(v === 'walk' && glowS && now - G.lastFind > glowS * 1000 && !($('wmap') && $('wmap').querySelector('.glow'))){ walkGlow(); goal('✨ Psst — step where it glows!'); }
  if(v === 'crack' && G.L.glow && now - G.lastFind > (G.L.glow + 4) * 1000 && !document.querySelector('#cpad .glow')){ crackGlow(); goal('✨ Psst — try the glowing number!'); }
}
/* ---------- 📐 layout of the DOM steps (no scroll at any size) ---------- */
function layoutStory(W, H, gap){
  const v = G.step && G.step.verb, box = $('sbox'); box.style.setProperty('--gap', gap + 'px');
  if(v === 'quiz' || v === 'accuse'){
    const q = box.querySelector('.sq'), opts = $('sopts'); if(!opts) return; const n = opts.children.length, qh = (q ? q.offsetHeight : 40) + gap;
    let best = {s: 0, cols: 1}; for(let cols = 1; cols <= n; cols++){ const rows = Math.ceil(n / cols), s = Math.min((W - gap * (cols + 1)) / cols, (H - qh - gap * (rows + 1)) / rows / (v === 'accuse' ? 1.05 : 0.9)); if(s > best.s) best = {s, cols}; }
    const s = Math.floor(Math.min(best.s, 200)); opts.style.gridTemplateColumns = 'repeat(' + best.cols + ', ' + s + 'px)'; opts.style.gap = gap + 'px';
    [...opts.children].forEach(b => { b.style.width = s + 'px'; b.style.height = Math.round(s * (v === 'accuse' ? 1.05 : 0.9)) + 'px'; b.style.setProperty('--s', s + 'px'); });
    return;
  }
  if(v === 'walk'){ const Wk = G.K.walk, m = $('wmap'); if(!m) return; const t = Math.floor(Math.min((W - gap * 2) / Wk.cols, (H - gap * 2) / Wk.rows, 96));
    Object.assign(m.style, {gridTemplateColumns: 'repeat(' + Wk.cols + ', ' + t + 'px)', gridTemplateRows: 'repeat(' + Wk.rows + ', ' + t + 'px)'}); m.style.setProperty('--t', t + 'px'); return; }
  if(v === 'crack'){ const lk = $('clock'), pad = $('cpad'); if(!lk || !pad) return; const n = G.K.crack.digits.length, wide = W > H * 1.15; box.classList.toggle('wide', wide);
    const aw = wide ? (W - gap * 3) * 0.55 : W - gap * 2, ah = wide ? H - gap * 2 : (H - gap * 3) * 0.5;
    const cw = Math.floor(Math.min((aw - gap * (n - 1)) / n, ah / 1.75, 170)); lk.style.setProperty('--cw', cw + 'px');
    const pw = wide ? (W - gap * 3) * 0.45 : W - gap * 2, ph = wide ? H - gap * 2 : (H - gap * 3) * 0.5, k = Math.floor(Math.min((pw - gap * 4) / 5, (ph - gap * 3) / 2, 110));
    pad.style.setProperty('--k', k + 'px'); return; }
}

/* ---------- 📁 the end ---------- */
function finishStory(won){
  if(!G || G.over) return; G.over = true; stopTicker(); hideHand(); $('scard').classList.add('hidden');
  const L = G.L, T = G.total, K = G.K, C = K.C, secs = Math.round(G.secs), cleared = !!won;
  const stars = PK.starsFor({cleared, oops: T.oops, hints: T.hints}), score = cleared ? T.points + PK.caseBonus(G.level) : Math.round(T.points * 0.5);
  if(cleared){ const seen = caseSeen(); seen['C:' + C.id] = 1; caseSeenSave(seen); }
  NOTES.length = 0;
  let h = '<div class="res-det" id="res-det"><canvas id="res-av" width="240" height="264"></canvas><svg class="hat" viewBox="0 0 60 30" aria-hidden="true"><path d="M8 23 Q30 1 52 23 Z" fill="#8B5A2B" stroke="#3B2410" stroke-width="2"/><path d="M12 19 Q30 7 48 19" fill="none" stroke="#C99A5B" stroke-width="2" stroke-dasharray="3 3"/><path d="M3 24 H57" stroke="#3B2410" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="5" r="3" fill="#C99A5B"/></svg><span class="glass">' + C.icon + '</span></div>'
    + '<h2 class="' + (cleared ? 'cheer' : '') + '">' + (cleared ? '📁 Case closed!' : '🏃 The thief got away!') + '</h2>'
    + '<div class="note">📖 ' + C.icon + ' ' + UI.esc(C.name) + ' · ' + L.name + (L.hardcore ? ' 💀' : '') + '</div>'
    + (cleared ? '<div class="thief">' + K.thief.icon + ' It was <b>' + UI.esc(K.thief.name) + '</b>! <span class="chip" style="background:' + K.thief.boot[0] + '"></span> ' + K.thief.boot[1] + ' boots + ' + K.thief.drop[0] + ' ' + UI.esc(K.thief.drop[1]) + '</div><div class="note">' + UI.esc(C.solved) + '</div>' : '');
  h += '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '">⭐</span>').join('') + '</div><div class="score-big">🏆 ' + score.toLocaleString() + '</div>';
  h += '<div class="stats"><span>📖 ' + G.chapters + '/3 chapters</span><span>🎓 ' + G.lessons.length + ' lesson card' + (G.lessons.length === 1 ? '' : 's') + '</span><span>❌ ' + T.oops + ' oops</span><span>🔍 ' + T.hints + ' hint' + (T.hints === 1 ? '' : 's') + '</span>' + (G.level > 0 ? '<span>⏱ ' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + '</span>' : '') + '</div>';
  h += '<div class="lessons">' + C.lessons.map((l, i) => '<span class="lc' + (G.lessons.indexOf(i) >= 0 ? ' on' : '') + '" title="' + UI.esc(l.title) + '">' + l.icon + ' ' + UI.esc(l.title) + '</span>').join('') + '</div>';
  h += '<div class="save-note" id="save-note">' + (S.player ? '💾 Saving…' : '') + '</div>';
  h += '<div class="res-btns" id="res-btns"><button class="sp-btn sp-secondary" id="res-levels" data-sound="tap">🎚️ Levels</button><button class="sp-btn sp-secondary" id="res-again" data-sound="pop">🔁 New case</button>'
    + (cleared && G.level < 5 ? '<button class="sp-btn sp-primary" id="res-next" data-sound="pop">Next level ▶</button>' : '') + '</div><div class="comics-slot" id="comic-strip-slot"></div>';
  showResult(h);
  if(BD.on) UI.buddy($('res-av'), BD.who, {hold: cleared ? 'win' : 'lose'}); else $('res-det').classList.add('hidden');
  $('res-levels').onclick = () => leavePlay();
  $('res-again').onclick = () => startCase(G ? G.level : SET.level);
  if($('res-next')) $('res-next').onclick = () => startCase(Math.min(5, (G ? G.level : SET.level) + 1));
  if(cleared){ confetti([C.icon, '📁', '⭐', '🕵️', '🎉'], 26); UISound.play('success'); } else bdReact('lose', 2000);
  moment(cleared ? 'win' : 'lose', {score, stars, secs, case: C.id, thief: K.thief.name});
  const stats = {games: 1, stories: cleared ? 1 : 0, chapters: G.chapters, lessons: lessonCount(), casebook: Object.keys(caseSeen()).filter(k => /^C:/.test(k)).length, oops: T.oops, hints: T.hints, perfect: T.perfect};
  if(S.player) saveWin(S.player, G.level, {score, stars, cleared, timeSec: secs, theme: '📖 ' + C.icon + ' ' + C.name, stats}, null, 0, CASE_ID);
  if(UI.alsoTry) UI.alsoTry({player: S.player, game: GAME_ID, at: () => $('res-btns'), current: SET.mode, open: id => { leavePlay(); msOpen(id); }});
  SET.level = G.level;
}
GameParts.loaded('Pokadif_cases', 'pk-7a');
