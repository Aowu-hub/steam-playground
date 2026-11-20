
/* 📏 s-sla cup#1 */
function saveCup(){ ls(cupKey(), JSON.stringify(CUP)); }
function shuffle(a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function roundName(size, r){ const n = Math.log2(size) - r; return n === 1 ? 'Final' : n === 2 ? 'Semi-final' : 'Quarter-final'; }
function cupTargetText(c){ const sp = SB.SPORTS[c.sport], t = c.short ? sp.targets[0] : sp.targets[c.level]; return targetText(sp, c.level, t); }
/* 📏 s-sla cup#2 */
function cupChips(id, list, cur, pick){ const row = $(id); row.innerHTML = list.map(([k, n, lock]) => '<button class="chip' + (String(k) === String(cur) ? ' on' : '') + (lock ? ' lock' : '') + '" data-k="' + k + '" data-sound="' + (lock ? 'none' : 'tap') + '">' + n + '</button>').join('');
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { if(b.classList.contains('lock')){ UISound.play('error'); UI.toast('Win that level against the robot first to use it in a tournament'); return; } pick(b.dataset.k); renderCupSetup(); }); }
function cupPer(){ return CS.fmt === 'double' ? 2 : 1; }
function cupTeamsDraft(){
  const per = cupPer(), hs = CS.who.slice(), teams = [];
  for(let i = 0; i < CS.size; i++){ const m = []; for(let k = 0; k < per; k++) m.push(hs.length ? hs.shift() : null); teams.push({name: CS.names[i] || CUP_NAMES[i], members: m}); }
  return teams;
}
function renderCupSetup(){
  const sp = SB.SPORTS[CS.sport]; $('cup-sub').textContent = sp.icon + ' ' + sp.name + ' — knock-out: win and go to the next round. Last team standing lifts the 🏆!';
  cupChips('cup-fmt', [['single', '👤 Singles'], ['double', '👥 Doubles']], CS.fmt, k => { CS.fmt = k; CS.who = CS.who.slice(0, CS.size * cupPer()); });
  cupChips('cup-size', [[4, '4 teams'], [8, '8 teams']], CS.size, k => { CS.size = Number(k); CS.who = CS.who.slice(0, CS.size * cupPer()); });
  cupChips('cup-level', [0, 1, 2, 3, 4].map(i => [i, LEVEL_UI[i].emoji + ' ' + SB.LEVELS[i].name, !canPlay(i)]), CS.level, k => { CS.level = Number(k); });
  const tShort = targetText(sp, CS.level, sp.targets[0]), tNorm = targetText(sp, CS.level, sp.targets[CS.level]);
  cupChips('cup-len', [['short', '⚡ Short · ' + tShort.replace(/\.$/, '')], ['normal', '🏁 Normal · ' + tNorm.replace(/\.$/, '')]], CS.short ? 'short' : 'normal', k => { CS.short = k === 'short'; });
  const max = CS.size * cupPer(), names = S.players.map(p => p.Name);
  $('cup-who-note').textContent = 'Tap family players to add them (up to ' + max + '). Robots fill the empty places.' + (cupPer() > 1 ? ' Picked in pairs: 1st + 2nd are a team, 3rd + 4th…' : '');
  const row = $('cup-who'); row.innerHTML = names.map(n => { const i = CS.who.indexOf(n); return '<button class="chip' + (i >= 0 ? ' on' : '') + '" data-n="' + UI.esc(n) + '" data-sound="tap">' + (i >= 0 ? (i + 1) + ' · ' : '') + UI.esc(n) + (n === S.player ? ' (you)' : '') + '</button>'; }).join('');
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { const n = b.dataset.n, i = CS.who.indexOf(n);
    if(i >= 0){ if(n === S.player && CS.who.length === 1){ UI.toast('Someone has to play! 🙂'); return; } CS.who.splice(i, 1); }
    else { if(CS.who.length >= max){ UISound.play('error'); UI.toast('All ' + max + ' places are taken by people'); return; } CS.who.push(n); }
    renderCupSetup(); });
  const box = $('cup-teams'), teams = cupTeamsDraft();
  box.innerHTML = teams.map((t, i) => '<div class="cteam"><span class="dot" style="background:' + CUP_COLS[i] + '"></span><input maxlength="18" data-i="' + i + '" value="' + UI.esc(t.name) + '" aria-label="Team ' + (i + 1) + ' name"><span class="mem">' + t.members.map(m => m ? UI.esc(m) : '🤖').join(' + ') + '</span></div>').join('');
  box.querySelectorAll('input').forEach(inp => inp.oninput = () => { CS.names[Number(inp.dataset.i)] = inp.value.trim() || CUP_NAMES[Number(inp.dataset.i)]; });
  $('cup-names-btn').onclick = () => { CS.names = shuffle(CUP_NAMES).slice(0, 8); renderCupSetup(); };
  $('cup-go').onclick = drawCup;
}
function drawCup(){
  const draft = cupTeamsDraft(), bots = shuffle(CUP_BOTS); let bi = 0;
  const teams = draft.map((t, i) => ({name: t.name, col: CUP_COLS[i], members: t.members, bots: t.members.map(m => m ? null : bots[bi++ % bots.length])}));
  // people first, spread over different first-round matches; robots fill the rest
  const spread = CS.size === 8 ? [0, 2, 4, 6, 1, 3, 5, 7] : [0, 2, 1, 3], slots = new Array(CS.size).fill(-1);
  const people = shuffle(teams.map((t, i) => i).filter(i => teams[i].members.some(Boolean))), robots = shuffle(teams.map((t, i) => i).filter(i => !teams[i].members.some(Boolean)));
  people.concat(robots).forEach((ti, k) => { slots[spread[k]] = ti; });
  const rounds = []; let n = CS.size / 2;
  rounds.push(Array.from({length: n}, (_, m) => ({a: slots[m * 2], b: slots[m * 2 + 1], w: -1, sc: ''})));
  while(n > 1){ n /= 2; rounds.push(Array.from({length: n}, () => ({a: -1, b: -1, w: -1, sc: ''}))); }
  CUP = {v: 1, sport: CS.sport, level: CS.level, fmt: CS.fmt, size: CS.size, short: CS.short, theme: SET.theme, powers: SET.powers, teams, rounds, done: false, champ: -1, at: Date.now()};
  saveCup(); UISound.play('unlock'); renderBracket(); showScreen('bracket');
  if(FX) confetti(['🎲', '🏆', '🏓'], 14);
}
function newCup(){
  const go = () => { ls(cupKey(), ''); CUP = null; openCup(); };
  if(CUP && !CUP.done){ UI.confirm({icon: '🗑️', title: 'Start a new tournament?', body: 'This bracket will be thrown away.', okText: 'New tournament', cancelText: 'Keep it'}).then(ok => { if(ok) go(); }); }
  else go();
}
function nextMatch(){ if(!CUP) return null; for(let r = 0; r < CUP.rounds.length; r++) for(let m = 0; m < CUP.rounds[r].length; m++){ const x = CUP.rounds[r][m]; if(x.w < 0 && x.a >= 0 && x.b >= 0) return {r, m, x}; } return null; }
function hasPeople(ti){ return ti >= 0 && CUP.teams[ti].members.some(Boolean); }
function memberText(t){ return t.members.map((m, k) => m ? UI.esc(m) : '🤖 ' + UI.esc(t.bots[k])).join(' + '); }
function renderBracket(){
  if(!CUP) return; const sp = SB.SPORTS[CUP.sport];
  $('br-title').textContent = sp.icon + ' ' + sp.name + ' Cup'; slaLogoInto(document.querySelector('#scr-bracket .title .logo'), sp.id, 76);   // 🏷️ lg-1
  $('br-sub').textContent = (CUP.fmt === 'double' ? '👥 Doubles' : '👤 Singles') + ' · ' + CUP.size + ' teams · 🤖 ' + SB.LEVELS[CUP.level].name + ' robots · ' + cupTargetText(CUP);
  const nx = nextMatch(), T = CUP.teams;
  const row = (ti, x, side) => { if(ti < 0) return '<div class="bt tbd"><span class="dot" style="background:#ccc"></span><span class="n">waiting…</span></div>';
    const t = T[ti], cls = x.w < 0 ? '' : x.w === ti ? ' win' : ' lose', sc = x.sc ? x.sc.split('–')[side] : '';
    return '<div class="bt' + cls + '" title="' + memberText(t).replace(/"/g, '') + '"><span class="dot" style="background:' + t.col + '"></span><span class="n">' + UI.esc(t.name) + (hasPeople(ti) ? ' <span class="me">🙂</span>' : '') + '</span><span class="s">' + UI.esc(sc) + '</span></div>'; };
  let h = '';
  CUP.rounds.forEach((rd, r) => { h += '<div class="bcol"><h4>' + roundName(CUP.size, r) + (rd.length > 1 ? 's' : '') + '</h4>' + rd.map((x, m) => '<div class="bm' + (nx && nx.r === r && nx.m === m ? ' cur' : '') + '" data-r="' + r + '" data-m="' + m + '">' + row(x.a, x, 0) + row(x.b, x, 1) + '</div>').join('') + '</div>'; });
  h += '<div class="bchamp' + (CUP.done ? ' won' : '') + '"><div class="tro">🏆</div><div>' + (CUP.done ? UI.esc(T[CUP.champ].name) : 'Champion?') + '</div></div>';
  $('bracket').innerHTML = h;
  const card = $('br-next'); cancelAnimationFrame(cupRaf);
  if(CUP.done){
    const t = T[CUP.champ];
    card.innerHTML = '<h3>🏆 Champions!</h3><canvas id="cup-cv" width="720" height="360"></canvas><div class="vsl">' + UI.esc(t.name) + '</div><div class="note">' + memberText(t) + '</div><div class="btns" style="margin-top:10px"><button class="btn sp-btn sp-primary" data-sound="pop" onclick="newCup()">🏆 New tournament</button></div>';
    champLoop();
    return;
  }
  if(!nx){ card.innerHTML = ''; return; }
  const A = T[nx.x.a], B = T[nx.x.b], people = hasPeople(nx.x.a) || hasPeople(nx.x.b), alive = CUP.teams.some((t, i) => hasPeople(i) && !lostAlready(i));
  card.innerHTML = '<h3>' + roundName(CUP.size, nx.r) + ' · next match</h3><div class="vsl"><span style="color:' + A.col + '">●</span> ' + UI.esc(A.name) + ' <small>vs</small> ' + UI.esc(B.name) + ' <span style="color:' + B.col + '">●</span></div>' +
    '<div class="note" style="margin-bottom:10px">' + memberText(A) + ' &nbsp;vs&nbsp; ' + memberText(B) + '</div><div class="btns">' +
    (people ? '<button class="btn sp-btn sp-primary" id="cup-play" data-sound="pop">🏓 Play!</button>' : '<button class="btn sp-btn sp-primary" id="cup-skip" data-sound="pop">⏩ Skip — robots play</button><button class="btn soft sp-btn sp-secondary" id="cup-watch" data-sound="tap">👀 Watch</button>' + (alive || nextRobotRun() > 1 ? '<button class="btn soft sp-btn sp-secondary" id="cup-skipall" data-sound="tap">⏩⏩ ' + (alive ? 'Skip to my next match' : 'Skip to the end') + '</button>' : '')) + '</div>';
  if($('cup-play')) $('cup-play').onclick = () => playCupMatch(false);
  if($('cup-watch')) $('cup-watch').onclick = () => playCupMatch(true);
  if($('cup-skip')) $('cup-skip').onclick = e => skipRobots(e.currentTarget, false);
  if($('cup-skipall')) $('cup-skipall').onclick = e => skipRobots(e.currentTarget, true);
}
function lostAlready(ti){ return CUP.rounds.some(rd => rd.some(x => x.w >= 0 && (x.a === ti || x.b === ti) && x.w !== ti)); }
function nextRobotRun(){ let n = 0; for(const rd of CUP.rounds) for(const x of rd) if(x.w < 0 && x.a >= 0 && x.b >= 0 && !hasPeople(x.a) && !hasPeople(x.b)) n++; return n; }
function recordCup(r, m, winTeam, sc){
  const x = CUP.rounds[r][m]; x.w = winTeam; x.sc = sc;
  if(r + 1 < CUP.rounds.length){ const nx = CUP.rounds[r + 1][m >> 1]; if(m % 2) nx.b = winTeam; else nx.a = winTeam; }
  else { CUP.done = true; CUP.champ = winTeam; }
  saveCup();
}
function cupPlayers(x){ const per = CUP.fmt === 'double' ? 2 : 1, list = []; for(let k = 0; k < per; k++){ list.push({ti: x.a, k, side: 0}); list.push({ti: x.b, k, side: 1}); } return list; }
function simCup(nx){
  const sp = SB.SPORTS[CUP.sport], players = cupPlayers(nx.x).map(q => ({side: q.side}));
  const M = SB.simulate({sport: CUP.sport, level: CUP.level, powers: CUP.powers, target: CUP.short ? sp.targets[0] : 0, seed: (Date.now() & 0xffff) + nx.r * 31 + nx.m, players}, 2400);
  let w = M.score.winner; const pts = s => sp.scoring === 'tennis' ? M.score.games[s] : M.score.pts[s];
  if(!M.score.done || w < 0) w = pts(0) === pts(1) ? (Math.random() < 0.5 ? 0 : 1) : pts(0) > pts(1) ? 0 : 1;
  recordCup(nx.r, nx.m, w === 0 ? nx.x.a : nx.x.b, pts(0) + '–' + pts(1));
  return w === 0 ? nx.x.a : nx.x.b;
}
function skipRobots(btn, all){
  UI.busy(btn, 'sla-brall', 'Robots playing…');
  setTimeout(() => {
    let last = null, n = 0;
    while(true){ const nx = nextMatch(); if(!nx || hasPeople(nx.x.a) || hasPeople(nx.x.b)) break; const a = nx.x.a, b = nx.x.b, w = simCup(nx); last = {w, l: w === a ? b : a, sc: nx.x.sc}; n++; if(!all) break; }
    UI.idle(btn); renderBracket(); UISound.play('pop');
    if(last) UI.toast('🤖 ' + CUP.teams[last.w].name + ' beat ' + CUP.teams[last.l].name + ' ' + last.sc + (n > 1 ? ' (+' + (n - 1) + ' more)' : ''));
  }, FX ? 450 : 0);
}
function playCupMatch(watch){
  const nx = nextMatch(); if(!nx) return; const sp = SB.SPORTS[CUP.sport];
  const flip = !hasPeople(nx.x.a) && hasPeople(nx.x.b);   // people play from the near side
  const seats = [], list = cupPlayers(nx.x).map(q => ({ti: q.ti, k: q.k, side: flip ? 1 - q.side : q.side}));
  list.sort((p, q) => p.k - q.k || p.side - q.side);
  list.forEach(q => { const t = CUP.teams[q.ti], n = t.members[q.k]; seats.push(n ? {name: n, side: q.side, human: true} : {name: t.bots[q.k], side: q.side, human: false}); });
  const hs = seats.filter(s => s.human);
  if(hs.length === 1) hs[0].seat = -1; else { let a = 0, b = 1; hs.forEach(s => { if(s.side === 0){ s.seat = a; a += 2; } else { s.seat = b; b += 2; } }); }
  const ta = CUP.teams[flip ? nx.x.b : nx.x.a], tb = CUP.teams[flip ? nx.x.a : nx.x.b];
  startMatch({seats, sport: CUP.sport, level: CUP.level, theme: CUP.theme, powers: CUP.powers, target: CUP.short ? sp.targets[0] : 0, names: [ta.name, tb.name], round: roundName(CUP.size, nx.r), r: nx.r, m: nx.m, flip, watch});
}
function cupFinish(win, secs, scoreFor){
  const M = G.M, c = G.cup, sp = G.sp, st = M.stats, x = CUP.rounds[c.r][c.m];
  const winTeam = (win === 0) !== c.flip ? x.a : x.b;
  const pts = s => sp.scoring === 'tennis' ? M.score.games[s] : M.score.pts[s];
  const sa = c.flip ? pts(1) : pts(0), sb = c.flip ? pts(0) : pts(1);
  recordCup(c.r, c.m, winTeam, sa + '–' + sb);
  const final = CUP.done, humans = M.players.filter(p => p.human), peopleWon = humans.some(p => p.side === win);
  if(FX) confetti(final ? ['🏆', '🎉', '⭐', '🥇', '🏓'] : peopleWon ? ['🏓', '⭐', '🎉'] : ['🏓'], final ? 44 : peopleWon ? 24 : 6);
  UISound.play(peopleWon || !humans.length ? 'success' : 'error');
  const wt = CUP.teams[winTeam];
  const head = final ? '<div class="big">🏆</div><h2 class="cheer">' + UI.esc(wt.name) + ' win the ' + UI.esc(sp.name) + ' Cup!</h2>'
    : '<div class="big">' + (peopleWon ? '🎉' : humans.length ? '🤖' : '🏓') + '</div><h2' + (peopleWon ? ' class="cheer"' : '') + '>' + UI.esc(wt.name) + ' go through!</h2>';
  const tip = humans.length && !peopleWon ? '<div class="note">💡 Out of the cup this time — start a new tournament and try again!</div>' : '';
  showResult(head + '<div class="score-big">' + (c.flip ? sb + ' – ' + sa : sa + ' – ' + sb) + '</div>' +
    '<div class="stats"><span>🔁 best rally ' + Math.max(st[0].rally, st[1].rally) + '</span><span>💥 ' + st[0].smash + ' smashes</span><span>⏱ ' + fmt(secs * 1000) + '</span></div>' + tip +
    '<div class="save-note" id="save-note">' + (humans.some(p => p.name !== 'Guest') ? '💾 Saving…' : '') + '</div>' +
    '<div class="res-btns"><button class="btn sp-btn sp-primary" data-sound="pop" onclick="backToBracket()">🏆 ' + (final ? 'See the champions' : 'Back to the bracket') + '</button></div>');
  NOTES.length = 0;
  humans.forEach((p, seat) => {
    if(p.name === 'Guest') return; const s = st[p.side], won = p.side === win;
    const stats = {wins: won ? 1 : 0, rally: s.rally, smash: s.smash, aces: s.aces, perfect: s.perfect, powers: s.powers, legend: s.legend, goals: s.goals, jumpHits: s.jumpHits, jumpPerfect: s.jumpPerfect, diveSaves: s.diveSaves, matches: 1, cupMatches: 1};
    stats['win_' + sp.id] = won ? 1 : 0; if(final && won) stats.cups = 1;
    saveFeatsOnly(p.name, stats, seat);
  });
}
/* 📏 s-sla cup#3 */
function champLoop(){
  const cv = $('cup-cv'); if(!cv || !CUP || !CUP.done) return; const g = cv.getContext('2d'), t = CUP.teams[CUP.champ], sp = SB.SPORTS[CUP.sport];
  const avs = t.members.map((m, k) => m ? withRacket(myAvatar(m === 'Guest' ? 'Guest' : m), m) : robotAvatar(t.bots[k], sp)), cheer = gestOf('cheer');
  const t0 = performance.now();
  const tick = now => {
    if(!$('cup-cv') || $('scr-bracket').classList.contains('hidden')) return;
    const s = (now - t0) / 1000; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    const grd = g.createLinearGradient(0, 0, 0, cv.height); grd.addColorStop(0, 'rgba(255,200,69,0.35)'); grd.addColorStop(1, 'rgba(255,122,26,0.05)'); g.fillStyle = grd; g.fillRect(0, 0, cv.width, cv.height);
    for(let i = 0; i < 18; i++){ const a = i * 0.35 + s * 0.4; g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(360, 380); g.arc(360, 380, 520, a, a + 0.12); g.fill(); }
    g.fillStyle = '#C9A227'; g.fillRect(170, 318, 380, 42); g.fillStyle = '#E8C547'; g.fillRect(195, 300, 330, 22);
    const n = avs.length; avs.forEach((av, i) => { const x = n === 1 ? 330 : 250 + i * 220; drawAvatar(g, {name: t.members[i] || t.bots[i], av, dir: 1, walkT: 0, gest: {g: cheer, t: (s + i * 0.3) % (cheer.d || 1.6)}}, x, 304, 1.75, {t: s}); });
    emo(g, '🏆', n === 1 ? 520 : 360, 90 + Math.sin(s * 3) * 12, 96);
    if(Math.random() < 0.2){ /* sparkle */ g.fillStyle = '#fff'; g.fillRect(Math.random() * 720, Math.random() * 200, 4, 4); }
    cupRaf = requestAnimationFrame(tick);
  };
  cupRaf = requestAnimationFrame(tick);
}
GameParts.loaded('SlaBrall_cup', 's-sla');
