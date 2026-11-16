
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});
const $ = id => document.getElementById(id);
const esc = s => UI.esc(s);
// 🎮 the shelf = every game that plays on own devices with a 📺 Room hostess (more as the 📡 chat links them)
// max = players at once · lvl = the players vote a level when they play TOGETHER (alone always votes: the 🤖's level / the board)
const SHELF = [
  {k: 'chess', page: 'chess', icon: '♟️', name: 'Chess', max: 2, lvl: false, c: ['#5B6CFF', '#8F5BFF']},
  {k: 'checkers', page: 'checkers', icon: '🔴', name: 'Checkers', max: 2, lvl: false, c: ['#FF5C7A', '#FF8A3D']},
  {k: 'memory', page: 'memory', icon: '🃏', name: 'Memories Match', max: 4, lvl: true, c: ['#7A5CFA', '#2BB0C8']}
];
const LV = [['🌱', 'Basic'], ['🐣', 'Junior'], ['🔥', 'Intermediate'], ['⚡', 'Hard'], ['🌋', 'Extreme'], ['💀', 'Hardcore']];
const AGE_LV = {'4-5': 0, '6-7': 1, '8-9': 2, '10+': 3};   // ⭐ the level that suits each age group (same as the games' AGE_RECOMMEND)
const VOTE_MS = window.ST_VOTE_MS || 20000;   // after the first vote: 20 s for everyone else (all voted = at once)
const S = {players: [], avatars: {}, settings: {}, me: CURRENT_PLAYER, code: '', tv: false, tok: '', st: null, p: {}, timer: null,
  deadline: 0, deciding: false, went: false, typed: '', seen: {}, mine: {}};
const gameOf = k => SHELF.find(g => g.k === k);
function avOf(n){ const a = S.avatars[n]; try{ return a ? fixAv(a) : defaultAvatar(n || 'player'); }catch(e){ return null; } }
function drawAv(cv, n){ try{ drawPreviewCanvas(cv, avOf(n), {name: n, t: 1}); }catch(e){} }
function show(id){ ['choose', 'who', 'pad', 'tv', 'phone'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== id)); }
function qs(){ const p = S.p; return (S.me ? '&player=' + encodeURIComponent(S.me) : '') + (p.sessionStart ? '&sessionStart=' + encodeURIComponent(p.sessionStart) : '') + (p.durationMin ? '&durationMin=' + encodeURIComponent(p.durationMin) : ''); }
function remember(){   // a refresh keeps the station (Apps Script: google.script.history)
  const q = {page: 'station', st: S.code}; if(S.tv){ q.stv = '1'; q.stk = S.tok; } if(S.me) q.player = S.me; if(S.p.sessionStart) q.sessionStart = S.p.sessionStart; if(S.p.durationMin) q.durationMin = S.p.durationMin;
  try{ if(window.google && google.script && google.script.history) google.script.history.replace(null, q); }catch(e){}
}
function tok(){ try{ let t = localStorage.getItem('sp_station_tok'); if(!t){ t = Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8); localStorage.setItem('sp_station_tok', t); } return t; }catch(e){ return S.tok || (S.tok = Math.random().toString(36).slice(2, 14)); } }
$('back-btn').onclick = () => UI.go(WEBAPP_URL + '?page=gameroom' + qs(), 'rooms');   // ONE back: always the Gameroom (the trail would point at the last game)

/* ================= BOOT ================= */
function boot(){
  UI.loading('station');
  Promise.all([Station.params(), Station.run('stationData', CURRENT_PLAYER)]).then(([p, d]) => {
    UI.loaded(); S.p = p || {}; S.players = d.players || []; S.avatars = d.avatars || {}; S.settings = d.settings || {};
    try{ UISound.applySettings(S.settings); }catch(e){}
    if(S.me && !S.players.some(x => x.Name === S.me)) S.me = '';
    const code = /^\d{4}$/.test(String(S.p.st || '')) ? S.p.st : '';
    if(S.p.stv === '1'){ S.tv = true; S.tok = S.p.stk || tok(); if(code) S.code = code; return needWho('Who is setting up the TV?', openTv); }
    if(code){ S.code = code; return needWho('Who are you?', joinNow); }
    show('choose');
  }).catch(() => { UI.loaded(); UI.toast('Could not reach the server — check the connection', 'err'); show('choose'); });
}
function needWho(h, next){
  if(S.me) return next();
  $('who-h').textContent = h; const box = $('plist'); box.innerHTML = '';
  S.players.forEach(p => { const b = document.createElement('button'); b.setAttribute('data-sound', 'pop'); const c = document.createElement('canvas'); c.width = 160; c.height = 188; b.appendChild(c);
    b.insertAdjacentHTML('beforeend', '<div>' + esc(p.Name) + '</div>'); drawAv(c, p.Name); b.onclick = () => { S.me = p.Name; UI.applyTheme(UI.themeFor(S.settings, p.Name), {kitOnly: true}); next(); }; box.appendChild(b); });
  show('who');
}
$('b-tv').onclick = () => { S.tv = true; S.tok = tok(); needWho('Who is setting up the TV?', openTv); };
$('b-join').onclick = () => needWho('Who are you?', openPad);

/* ================= 📺 TV ================= */
async function openTv(){
  if(!S.code){
    const r = await Station.run('stationOpen', {name: S.me, token: S.tok}).catch(e => ({err: e.message}));
    if(!r || r.err){ UISound.play('error'); UI.toast('😕 ' + ((r && r.err) || 'Could not open the station'), 'err'); show('choose'); return; }
    S.code = r.code; S.st = r.state; UISound.play('success');
  }
  remember(); show('tv'); $('sub').textContent = 'This screen is the TV station — play on your own phones';
  $('tiles').innerHTML = S.code.split('').map(d => '<div class="tile">' + d + '</div>').join('');
  try{ const qr = qrcode(0, 'L'); qr.addData(WEBAPP_URL + '?page=station&st=' + S.code); qr.make(); const n = qr.getModuleCount(), q = $('qr'), g = q.getContext('2d'); q.width = q.height = n * 4;
    g.fillStyle = '#fff'; g.fillRect(0, 0, q.width, q.height); g.fillStyle = '#1B1140'; for(let r = 0; r < n; r++) for(let c = 0; c < n; c++) if(qr.isDark(r, c)) g.fillRect(c * 4, r * 4, 4, 4); }catch(e){}
  tvTick(); clearInterval(S.timer); S.timer = setInterval(tvTick, 1500);
}
async function tvTick(){
  const r = await Station.run('stationPoll', S.code, {name: S.me, token: S.tok}).catch(() => null);
  if(r && r.err === 'gone'){ clearInterval(S.timer); S.code = ''; UI.toast('📺 The station closed — opening a new one'); openTv(); return; }
  if(!r || !r.state) return;
  S.st = r.state; paintCrew(); paintTvStage(); tvDecide();
}
function paintCrew(){
  const st = S.st, box = $('crew'), go = st.go || {}, votes = st.votes || {}, kind = st.phase === 'lvl' ? 'lvl' : 'game';
  const names = st.members.map(m => m.name);
  [...box.children].forEach(el => { if(names.indexOf(el.dataset.n) < 0) el.remove(); });
  st.members.forEach(m => {
    let el = box.querySelector('[data-n="' + CSS.escape(m.name) + '"]');
    if(!el){ el = document.createElement('div'); el.className = 'mem in'; el.dataset.n = m.name; el.innerHTML = '<span class="tick"></span><canvas width="140" height="164"></canvas><b>' + esc(m.name) + '</b><small></small>'; box.appendChild(el); drawAv(el.querySelector('canvas'), m.name);
      if(!S.seen[m.name]){ S.seen[m.name] = 1; UISound.play('pop'); } }
    el.classList.toggle('off', !m.on && st.phase === 'pick');
    const playing = (go.players || []).indexOf(m.name) >= 0, watching = (go.watchers || []).indexOf(m.name) >= 0;
    el.querySelector('.tick').textContent = votes[kind] && votes[kind][m.name] ? '✅' : '';
    el.querySelector('small').textContent = st.phase === 'pick' ? (m.on ? (votes.game && votes.game[m.name] ? 'voted' : 'voting…') : 'away') : playing ? '🎮 playing' : watching ? '👀 watching' : '';
  });
  if(!st.members.length) box.innerHTML = '<div class="how" style="grid-column:1/-1;text-align:center">⏳ Nobody here yet — join on your phone!</div>';
}
function votesHtml(map, key){ return Object.keys(map || {}).filter(n => String(map[n]) === String(key)).map(n => '<span>' + esc(n) + '</span>').join(''); }
function paintTvStage(){
  const st = S.st, el = $('stage'), go = st.go || {};
  if(st.phase === 'pick'){
    const on = st.members.filter(m => m.on);
    const left = S.deadline ? Math.max(0, S.deadline - Date.now()) : 0;
    el.innerHTML = '<h2>' + (on.length ? '🗳️ Vote for the next game on your phone!' : '📱 Join on your phone to play') + '</h2>' +
      '<div class="hint">' + (on.length ? 'One player · one vote — the most votes wins (a tie = 🎲)' + (S.deadline ? ' · ⏱️ ' + Math.ceil(left / 1000) + ' s' : '') : 'Play together — or alone against the 🤖') + '</div>' +
      '<div class="bar"><i style="width:' + (S.deadline ? Math.round(100 - left / VOTE_MS * 100) : 0) + '%"></i></div>' +
      '<div class="shelf">' + SHELF.map(g => '<div class="gcard' + (S.win === g.k ? ' win' : '') + '" style="background:linear-gradient(135deg,' + g.c[0] + ',' + g.c[1] + ')"><span class="ic">' + g.icon + '</span><span class="nm">' + esc(g.name) + '</span><span class="pl">' + (g.max > 2 ? '1–' + g.max + ' players' : '1–2 players') + '</span><div class="votes">' + votesHtml((st.votes || {}).game, g.k) + '</div></div>').join('') + '</div>';
  } else if(st.phase === 'lvl'){
    const g = gameOf(go.game) || {};
    el.innerHTML = '<h2>🎚️ ' + esc(g.icon + ' ' + g.name) + ' — vote the level!</h2><div class="hint">' + (go.alone ? esc(go.players[0]) + ' plays alone' + (g.k === 'memory' ? '' : ' against the 🤖') : 'The players vote · a tie = the easier level') + '</div>' +
      '<div class="lv">' + LV.map((l, i) => '<div class="lcard"><span class="e">' + l[0] + '</span>' + l[1] + '<div class="votes">' + votesHtml((st.votes || {}).lvl, i) + '</div></div>').join('') + '</div>';
  } else {
    const g = gameOf(go.game) || {};
    el.innerHTML = '<div class="big"><span class="ic">' + (g.icon || '🎮') + '</span><h2>🔀 Off to ' + esc(g.name || 'the game') + '!</h2><div class="hint">' + (go.lvl != null ? LV[go.lvl][0] + ' ' + LV[go.lvl][1] : '') + '</div>' +
      '<div class="names">' + (go.players || []).map(n => '<span>🎮 ' + esc(n) + '</span>').join('') + (go.watchers || []).map(n => '<span class="w">👀 ' + esc(n) + '</span>').join('') + '</div></div>';
  }
}
function tally(map, keys){
  const n = {}; Object.keys(map || {}).forEach(k => { const v = String(map[k]); if(keys.indexOf(v) >= 0) n[v] = (n[v] || 0) + 1; });
  const top = Math.max(0, ...Object.values(n)); return Object.keys(n).filter(k => n[k] === top);
}
async function tvDecide(){
  const st = S.st; if(S.deciding) return;
  if(st.phase === 'pick'){
    const on = st.members.filter(m => m.on).map(m => m.name), votes = (st.votes && st.votes.game) || {}, got = on.filter(n => votes[n]);
    if(!got.length){ S.deadline = 0; return; }
    if(!S.deadline) S.deadline = Date.now() + VOTE_MS;
    if(got.length < on.length && Date.now() < S.deadline) return;
    S.deciding = true;
    const tops = tally(Object.fromEntries(got.map(n => [n, votes[n]])), SHELF.map(g => g.k)), k = tops[Math.floor(Math.random() * tops.length)], g = gameOf(k);
    if(tops.length > 1){ UI.toast('🎲 A tie — the dice picks ' + g.icon + ' ' + g.name); }
    S.win = k; paintTvStage(); UISound.play('success');
    // who plays: the fewest games played first (then who joined first) — the rest watch and play next
    const order = st.members.filter(m => m.on).map((m, i) => ({m, i})).sort((a, b) => a.m.plays - b.m.plays || a.i - b.i).map(x => x.m.name);
    const players = order.slice(0, g.max), watchers = order.slice(g.max), alone = players.length === 1;
    const go = {game: g.k, page: g.page, players, watchers, alone, lvl: null, map: ''};
    await new Promise(r => setTimeout(r, window.ST_FAST ? 50 : 1600));
    const r = await Station.run('stationSet', S.code, {name: S.me, token: S.tok}, {phase: alone || g.lvl ? 'lvl' : 'go', go}).catch(() => null);
    S.win = ''; S.deadline = 0; S.deciding = false; if(r && r.state){ S.st = r.state; paintTvStage(); if(r.state.phase === 'go') tvGo(); }
    return;
  }
  if(st.phase === 'lvl'){
    const go = st.go, votes = (st.votes && st.votes.lvl) || {}, got = go.players.filter(n => votes[n] != null);
    if(!got.length){ S.deadline = 0; return; }
    if(!S.deadline) S.deadline = Date.now() + VOTE_MS * 0.75;
    if(got.length < go.players.length && Date.now() < S.deadline) return;
    S.deciding = true;
    const tops = tally(Object.fromEntries(got.map(n => [n, votes[n]])), ['0', '1', '2', '3', '4', '5']).map(Number), lvl = Math.min(...tops);   // a tie = the easier level
    const map = go.game === 'memory' ? (go.players.length >= 3 || lvl >= 3 ? '8' : '6') : '';
    const r = await Station.run('stationSet', S.code, {name: S.me, token: S.tok}, {phase: 'go', lvl, map}).catch(() => null);
    S.deadline = 0; S.deciding = false; if(r && r.state){ S.st = r.state; paintTvStage(); tvGo(); }
    return;
  }
  if(st.phase === 'go' && !S.went) tvGo();
}
function tvGo(){
  const go = S.st.go; if(!go || S.went) return; S.went = true; clearInterval(S.timer);
  const g = gameOf(go.game) || {};
  const url = WEBAPP_URL + '?page=' + go.page + '&mode=ltv&st=' + S.code + '&stv=1&stk=' + encodeURIComponent(S.tok) + (go.lvl != null ? '&slv=' + go.lvl : '') + (go.map ? '&smap=' + go.map : '') + qs();
  setTimeout(() => UI.go(url, go.game, '🔀 Switching to ' + (g.name || 'the game')), window.ST_FAST ? 50 : 1200);
}

/* ================= 📱 PHONE ================= */
function openPad(){
  show('pad'); S.typed = ''; paintTyped(); $('pad-err').textContent = '';
  const pad = $('pad'); pad.innerHTML = '';
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '▶'].forEach(k => { const b = document.createElement('button'); b.textContent = k; b.setAttribute('aria-label', k); b.setAttribute('data-sound', 'pop'); if(k === '▶') b.className = 'go';
    b.onclick = () => { if(k === '⌫') S.typed = S.typed.slice(0, -1); else if(k === '▶'){ if(S.typed.length === 4){ S.code = S.typed; joinNow(); } return; } else if(S.typed.length < 4) S.typed += k; paintTyped(); if(S.typed.length === 4){ S.code = S.typed; joinNow(); } };
    pad.appendChild(b); });
}
function paintTyped(){ [...$('typed').children].forEach((d, i) => { d.textContent = S.typed[i] || ''; }); }
async function joinNow(){
  const r = await Station.run('stationJoin', S.code, {name: S.me, token: tok()}).catch(e => ({err: e.message}));
  if(!r || r.err){
    UISound.play('error');
    const why = r && r.err === 'nocode' ? '🔢 No TV station with that number — check the TV' : r && r.err === 'full' ? '🈵 The station is full (8 players)' : '😕 ' + ((r && r.err) || 'Could not join');
    if($('scr-pad').classList.contains('hidden')) openPad(); $('pad-err').textContent = why; S.typed = ''; paintTyped(); return;
  }
  UISound.play('success'); S.st = r.state; remember(); show('phone'); $('sub').textContent = 'Station ' + S.code + ' — your phone is the remote';
  $('me').innerHTML = '<canvas width="96" height="112"></canvas><b>' + esc(S.me) + '</b>'; drawAv($('me').querySelector('canvas'), S.me);
  paintPhone(); clearInterval(S.timer); S.timer = setInterval(phoneTick, 2000);
}
async function phoneTick(){
  const r = await Station.run('stationPoll', S.code, {name: S.me}).catch(() => null);
  if(r && r.err === 'gone'){ clearInterval(S.timer); $('pstage').innerHTML = '<div class="big"><span class="ic">📺</span><h2>The TV station closed</h2></div>'; return; }
  if(!r || !r.state) return;
  if(!r.state.members.some(m => m.name === S.me)){ const j = await Station.run('stationJoin', S.code, {name: S.me, token: tok()}).catch(() => null); if(j && j.state) r.state = j.state; }
  S.st = r.state; paintPhone();
}
function vote(kind, val){
  S.mine[kind + S.st.round + S.st.phase] = String(val); UISound.play('pop'); paintPhone();
  Station.run('stationVote', S.code, {name: S.me}, kind, String(val)).then(r => { if(r && r.state){ S.st = r.state; paintPhone(); } }).catch(() => {});
}
function paintPhone(){
  const st = S.st, el = $('pstage'), go = st.go || {}, playing = (go.players || []).indexOf(S.me) >= 0;
  if(st.phase === 'pick'){
    const mine = ((st.votes || {}).game || {})[S.me] || S.mine['game' + st.round + st.phase] || '';
    const on = st.members.filter(m => m.on), got = on.filter(m => ((st.votes || {}).game || {})[m.name]);
    el.innerHTML = '<h2>🗳️ Vote for the next game</h2><div class="hint">' + got.length + ' of ' + on.length + ' voted · tap again to change</div>' +
      '<div class="shelf">' + SHELF.map(g => '<button class="gcard' + (mine === g.k ? ' mine' : '') + '" data-g="' + g.k + '" data-sound="none" style="background:linear-gradient(135deg,' + g.c[0] + ',' + g.c[1] + ')"><span class="ic">' + g.icon + '</span><span class="nm">' + esc(g.name) + '</span><span class="pl">' + (g.max > 2 ? '1–' + g.max : '1–2') + ' players</span><div class="votes">' + votesHtml((st.votes || {}).game, g.k) + '</div></button>').join('') + '</div>';
    el.querySelectorAll('[data-g]').forEach(b => { b.onclick = () => vote('game', b.dataset.g); });
    return;
  }
  const g = gameOf(go.game) || {};
  if(st.phase === 'lvl' && playing){
    const mine = ((st.votes || {}).lvl || {})[S.me] != null ? String(st.votes.lvl[S.me]) : (S.mine['lvl' + st.round + st.phase] || '');
    const p = S.players.find(x => x.Name === S.me), rec = AGE_LV[p && p.Age] != null ? AGE_LV[p.Age] : 1;
    el.innerHTML = '<h2>🎚️ ' + esc(g.icon + ' ' + g.name) + ' — pick a level</h2><div class="hint">' + (go.alone ? 'You play alone' + (g.k === 'memory' ? '' : ' against the 🤖') : 'Everyone votes · a tie = the easier level') + ' · ⭐ = good for you</div>' +
      '<div class="lv">' + LV.map((l, i) => '<button class="lcard' + (mine === String(i) ? ' mine' : '') + (i === rec ? ' rec' : '') + '" data-l="' + i + '" data-sound="none"><span class="e">' + l[0] + '</span>' + l[1] + '<div class="votes">' + votesHtml((st.votes || {}).lvl, i) + '</div></button>').join('') + '</div>';
    el.querySelectorAll('[data-l]').forEach(b => { b.onclick = () => vote('lvl', b.dataset.l); });
    return;
  }
  if(!playing){
    el.innerHTML = '<div class="big"><span class="ic">👀</span><h2>' + esc(g.icon + ' ' + (g.name || 'A game')) + ' is on the TV</h2><div class="hint">You watch this one — you play next! 🎉</div></div>';
    return;
  }
  el.innerHTML = '<div class="big"><span class="ic">' + (g.icon || '🎮') + '</span><h2>🔀 Going to ' + esc(g.name) + '…</h2><div class="hint">' + (go.room ? 'Joining the TV' : 'The TV is getting ready') + '<span class="lk-dots"></span></div></div>';
  if(go.room && (st.phase === 'go' || st.phase === 'play' || st.phase === 'after') && !S.went){
    S.went = true; clearInterval(S.timer);
    UI.go(WEBAPP_URL + '?page=' + go.page + '&link=' + go.room + '&st=' + S.code + qs(), go.game, '🔀 Joining ' + g.name);
  }
}
$('b-leave').onclick = () => UI.confirm({icon: '👋', title: 'Leave the station?', body: 'You can join again with the number on the TV.', okText: 'Leave', cancelText: 'Stay'}).then(ok => {
  if(!ok) return; clearInterval(S.timer); Station.run('stationLeave', S.code, {name: S.me}).catch(() => {}).then(() => UI.go(WEBAPP_URL + '?page=gameroom' + qs(), 'rooms'));
});
boot();
