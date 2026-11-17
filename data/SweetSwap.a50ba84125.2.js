
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   /* loader + menus in the player's look before the server answers */
const SESSION_START = Number(SP_TV[3]) || null;
const DURATION_MIN = Number(SP_TV[4]) || null;
const GAME_ID = 'sweet-swap';
// 🎛️ p1b: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 🍬 Sweet Swap · level | scoreboard | game buttons ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🍬', name: 'Sweet Swap', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ clearInterval(timerId); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { if(typeof pauseGame === 'function') pauseGame(); }, resume: () => { if(typeof resume === 'function') resume(); }},
  onFit: () => { if(G && typeof layout === 'function') layout(); },
  extras: [{id: 'hint-btn', icon: '💡', label: 'Hint (H)', onClick: () => useHint(), keep: true},
    {id: 'voice-btn', icon: '🔈', label: 'Voice', onClick: () => toggleVoice()}]});
function paintVoice(){ BAR.extra('voice-btn', {icon: voiceOn ? '🔊' : '🔈', label: voiceOn ? 'Voice: on' : 'Voice: off'}); }
var NAV_INNER = {menu: ['◀ Sweet Swap', () => openCover()]};   // 🧱 b3w2: the setup's top button goes back to the 🎬 cover
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
const pick = a => a[rnd(a.length)];
let SPEED = 1;   /* the test harness sets 0 to play whole games quickly */
const sleep = ms => new Promise(r => setTimeout(r, ms * SPEED));
function fmt(ms){ const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
let voiceOn = true;
function say(text){ try{ if(!voiceOn || !UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1; u.pitch = 1.2; u.volume = Math.max(0.2, UISound.get().volume); speechSynthesis.speak(u); }catch(e){} }
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ================= LEVELS · THEMES ================= */
// n × n board, K kinds of pictures, moves, goals: collect (picture index k, need) · ice (pattern; 1 or 2 hits) · special (make super pictures).
// hint: 'auto' = wiggles by itself after a pause, a number = hint button uses, 0 = none.
const LEVELS = [
  {name: 'Basic', emoji: '🌱', n: 7, K: 4, moves: 20, goals: [{t: 'collect', k: 0, need: 30}, {t: 'collect', k: 1, need: 30}], hint: 'auto', blurb: 'Collect two kinds of pictures'},
  {name: 'Junior', emoji: '🐣', n: 7, K: 5, moves: 22, goals: [{t: 'collect', k: 0, need: 20}, {t: 'collect', k: 1, need: 20}, {t: 'collect', k: 2, need: 20}], hint: 'auto', blurb: 'Three kinds to collect'},
  {name: 'Intermediate', emoji: '🔦', n: 8, K: 5, moves: 22, ice: 'center', goals: [{t: 'ice'}, {t: 'collect', k: 3, need: 34}], hint: 'auto', blurb: 'Break the 🧊 ice in the middle'},
  {name: 'Hard', emoji: '⚡', n: 8, K: 6, moves: 26, ice: 'cross', goals: [{t: 'ice'}, {t: 'special', need: 4}, {t: 'collect', k: 4, need: 22}], hint: 'auto', blurb: 'Ice, super pictures and 6 kinds'},
  {name: 'Extreme', emoji: '🌋', n: 9, K: 6, moves: 22, ice: 'center', goals: [{t: 'ice'}, {t: 'collect', k: 1, need: 16}], hint: 3, blurb: '2 stages · big board, double blockers',
    stage2: {ice: 'double', bonus: 14, goals: [{t: 'ice'}, {t: 'collect', k: 5, need: 18}]}},
  {name: 'Hardcore', emoji: '💀', n: 9, K: 6, moves: 40, ice: 'double', goals: [{t: 'ice'}, {t: 'special', need: 2}, {t: 'collect', k: 0, need: 16}], hint: 0, hardcore: true, blurb: '2 stages · no hints, no bonus moves — ×3 points!',
    stage2: {ice: 'hard', bonus: 0, goals: [{t: 'ice'}, {t: 'special', need: 2}, {t: 'collect', k: 2, need: 18}]}}
];
const THEMES = {
  sweets: {name: 'Sweets', pics: ['🍓', '🍋', '🍇', '🍬', '🍪', '🧁'], t: ['#FFE3F1', '#FFB8D9'], board: '#C2588F', slot: 'rgba(255,255,255,0.28)', cage: {ic: '🧊', name: 'ice box', cls: ''}, power: {ic: '🍯', name: 'Nectar', fx: 'rain'}},
  blocks: {name: 'Colour blocks', pics: ['●', '▲', '■', '◆', '★', '♥'], shapes: true, t: ['#E9F0FF', '#B9C8F5'], board: '#4B5AA8', slot: 'rgba(255,255,255,0.22)', cage: {ic: '📦', name: 'package box', cls: 'ck-box'}, power: {ic: '⭐', name: 'Spinning star', fx: 'star'}},
  animals: {name: 'Animals', pics: ['🐶', '🐱', '🐰', '🐸', '🐼', '🦊'], t: ['#EAF8DC', '#B9E59A'], board: '#5D8F3A', slot: 'rgba(255,255,255,0.28)', cage: {ic: '⛓️', name: 'metal cage', cls: 'ck-metal'}, power: {ic: '🦮', name: 'Super collar', fx: 'lasso'}},
  dino: {name: 'Dino', pics: ['🦖', '🦕', '🥚', '🌋', '🦴', '🌿'], t: ['#FFF1D6', '#F2C98A'], board: '#8A5A2B', slot: 'rgba(255,255,255,0.25)', cage: {ic: '🔥', name: 'flame cage', cls: 'ck-flame'}, power: {ic: '🧬', name: 'DNA upgrade', fx: 'dna'}},
  alien: {name: 'Alien × Monster', pics: ['👽', '👾', '🤖', '🛸', '👹', '🐙'], t: ['#E6E0FF', '#B8A8F2'], board: '#4B3A8A', slot: 'rgba(255,255,255,0.22)', cage: {ic: '🔒', name: 'space prison', cls: 'ck-prison'}, power: {ic: '🦠', name: 'Virus', fx: 'virus'}},
  vehicles: {name: 'Vehicles', pics: ['🚗', '🚌', '🚒', '🚜', '🚲', '✈️'], t: ['#E3F4FF', '#A8D8F5'], board: '#2F6FA0', slot: 'rgba(255,255,255,0.25)', cage: {ic: '⛽', name: 'gas out', cls: 'ck-gas'}, power: {ic: '⚡', name: 'Power node', fx: 'chain'}},
  space: {name: 'Spacecraft', pics: ['🚀', '🛸', '🛰️', '🪐', '☄️', '🌙'], t: ['#1B1440', '#3A2A7A'], board: '#120C2E', slot: 'rgba(255,255,255,0.14)', dark: true, cage: {ic: '☄️', name: 'meteor cage', cls: 'ck-meteor'}, power: {ic: '🛡️', name: 'EMP shield', fx: 'emp'}}
};
/* 🧑‍🤝‍🧑 24r FAMILY PIECES (✨ polish chat, Aowu 2026-11-16 20:42 + 20:44 + 21:21 + 21:31 "ok go"): the family's own avatars are the pictures.
   👨‍👩‍👧 Family = colour rim + initial (★ ×1.25) · 🙂 Faces only = no colour help (★★ ×1.5, stacks with the 🧩 board shape).
   Who: the player + other family members from the Players list (their saved avatar = S.avatars, fresh every page open; a new mix each game),
   pets-free 🤖 buddies fill when the family is small; 👁️ a person can hide their face (device setting sp_ss_famhide).
   Moves are DRAWN ONCE per person when a game starts (AvatarActing `Acting.draw`, frames kept in memory only → a changed avatar shows next game),
   then replayed on a small overlay canvas: 💤 idle now and then · ✨ match 3 small · 🎉 4 / ✖️ / ✨ power = pops out · 💥 L/T = high-five
   · 🌈 5 = the person's own 🎭 Signature act · 😅 swap back · 🔗 combos ×2 amazed · ×3 gasp · ×4 wave · ×5+ party · 🏆 win.
   Calm (🌱 Basic, reduced motion): no idle, combos = one small ripple. Off: window.SS_FAMFX = false (pictures stay, no moves). */
const FAM_RIM = ['#FF5A5F', '#F5A300', '#9B5CF6', '#22A86A', '#3B82F6', '#F2711C'];
const FAM_BUDDY = ['Bo', 'Pip', 'Zuzu', 'Kiki', 'Momo', 'Tiko'];
const THEME_MULT = [1, 1.25, 1.5];
Object.assign(THEMES, {
  family: {name: 'Family', fam: 1, hard: 1, pics: ['😀', '😄', '😎', '🤩', '😊', '🥳'], t: ['#FFF0F7', '#FFCFE4'], board: '#B04E86', slot: 'rgba(255,255,255,0.28)', cage: {ic: '🧺', name: 'picnic basket', cls: ''}, power: {ic: '📸', name: 'Family photo', fx: 'rain'}},
  faces: {name: 'Faces only', fam: 2, hard: 2, pics: ['😀', '😄', '😎', '🤩', '😊', '🥳'], t: ['#F1EEF6', '#CFC6DE'], board: '#5B4B6B', slot: 'rgba(255,255,255,0.2)', cage: {ic: '🎁', name: 'gift box', cls: 'ck-box'}, power: {ic: '📸', name: 'Group photo', fx: 'rain'}}
});
const FAM = {who: [], img: [], key: '', strips: {}, live: [], raf: 0, idleT: 0, R: 144};
const FAM_POOLS = {
  idle: ['cool', 'gest.peekaboo', 'gest.yawn', 'curious', 'giggle', 'shy'],
  small: ['gest.clap', 'laugh', 'wave', 'excited', 'cheer.hop'],
  big: ['cheer', 'cheer.fist', 'gest.dab', 'flex', 'victory'],
  bomb: ['gest.highfive', 'hug-pair', 'cheer.starjump', 'gest.spin'],
  oops: ['oops', 'shrug', 'confused', 'facepalm'],
  amazed: ['amazed', 'gasp'], wave: ['cheer.starjump', 'cheer.hop'], party: ['gest.dance', 'cheer.disco', 'cheer.floss'], win: ['victory', 'cheer']};
function famOn(){ return !!(window.Acting && window.SS_FAMFX !== false); }
function famCalm(){ return !!(G && G.lvl === 0) || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
function famHidden(){ try{ return JSON.parse(localStorage.getItem('sp_ss_famhide') || '[]'); }catch(e){ return []; } }
function famSetHidden(list){ try{ localStorage.setItem('sp_ss_famhide', JSON.stringify(list)); }catch(e){} }
function famHash(t){ let h = 2166136261; for(let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
function famActOk(a){ return window.Acting && Acting.has('acts', a); }
// the people for this game: me first, then a shuffled mix of the rest (hidden ones skipped), 🤖 buddies fill
function famPick(K, mix){
  const hide = famHidden(), me = S.player, names = (S.players || []).map(p => p.Name).filter(n => n && n !== me && hide.indexOf(n) < 0);
  const list = (me && hide.indexOf(me) < 0 ? [me] : []).concat(mix ? shuffle(names) : names);
  const who = list.slice(0, K).map(n => ({name: n, av: myAvatar(n)}));
  for(let i = 0; who.length < K; i++) who.push({name: FAM_BUDDY[i % FAM_BUDDY.length], av: defaultAvatar('🤖' + FAM_BUDDY[i % FAM_BUDDY.length]), buddy: true});
  return who;
}
// one avatar drawn into a tile (S px): rim tile (Family) or plain card (Faces only); pop = bigger frame, the body pops out of the tile
function famDraw(q, w, act, t, S, k, faceOnly, popK){
  const Z = Math.round(S * (popK || 1)), ox = (Z - S) / 2, oy = (Z - S) * 0.38, rim = faceOnly ? 'rgba(60,40,80,.22)' : FAM_RIM[k % 6];
  const f = Acting.fit(w, ['idle'], S, S * 1.9, {pad: 2});
  if(popK){ q.fillStyle = (faceOnly ? '#7B6B8B' : FAM_RIM[k % 6]) + '38'; q.beginPath(); for(let i = 0; i < 24; i++){ const a = i / 24 * 6.283 + t * 1.2, r = Z * (i % 2 ? 0.36 : 0.5); q.lineTo(Z / 2 + Math.cos(a) * r, Z * 0.48 + Math.sin(a) * r); } q.fill(); }
  q.save(); q.beginPath(); q.roundRect(ox + 1, oy + 1, S - 2, S - 2, S * 0.24);
  const gr = q.createLinearGradient(0, oy, 0, oy + S); gr.addColorStop(0, faceOnly ? '#FFFFFF' : rim + '30'); gr.addColorStop(1, faceOnly ? '#ECE8F2' : rim + '70'); q.fillStyle = gr; q.fill();
  if(!popK) q.clip();
  try{ Acting.draw(q, w, ox + f.x, oy + f.y + S * 0.18, f.k * 1.05, act, {t, noPet: true, ride: 'drop'}); }catch(e){}
  q.restore();
  q.lineWidth = Math.max(2, S * 0.07); q.strokeStyle = rim; q.beginPath(); q.roundRect(ox + 1 + q.lineWidth / 2, oy + 1 + q.lineWidth / 2, S - 2 - q.lineWidth, S - 2 - q.lineWidth, S * 0.22); q.stroke();
  if(!faceOnly && !popK){ q.fillStyle = rim; q.beginPath(); q.arc(ox + S * 0.84, oy + S * 0.84, S * 0.15, 0, 7); q.fill(); q.fillStyle = '#fff'; q.font = '800 ' + Math.round(S * 0.19) + 'px Fredoka, Nunito, sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText((w.name || '?').replace(/^\W+/, '')[0] || '?', ox + S * 0.84, oy + S * 0.855); }
}
// the still pictures for the tiles (+ the 🎨 chip): drawn once per game, kept only in memory
function famPrep(K, mix, force){
  const T = THEMES[theme] && THEMES[theme].fam ? THEMES[theme] : THEMES.family, fo = T.fam === 2;
  const who = famPick(K, mix), key = fo + '|' + who.map(w => w.name + ':' + famHash(JSON.stringify(w.av || {})) + ':' + (Acting.sig ? Acting.sig(w.av) : '')).join(',');
  if(!force && key === FAM.key && FAM.img.length >= K) return;
  FAM.key = key; FAM.who = who; FAM.fo = fo; FAM.strips = {}; FAM.img = who.map((w, k) => { const c = document.createElement('canvas'); c.width = c.height = FAM.R; famDraw(c.getContext('2d'), w, 'idle', 0, FAM.R, k, fo); return c.toDataURL('image/png'); });
}
function famPic(k, T){
  if(!window.Acting) return T.pics[k];
  if(G && THEMES[G.theme] === T && FAM.img[k]) return '<img class="famp" alt="' + UI.esc(famName(k)) + '" src="' + FAM.img[k] + '">';
  const fo = T.fam === 2, ck = (fo ? 'f' : 'r') + (S.player || '') + famHidden().join(','); FAM.chip = FAM.chip || {};   // 🎨 setup chip: the first 3 faces, its own small cache
  if(!FAM.chip[ck]){ try{ FAM.chip[ck] = famPick(3, false).map((w, j) => { const c = document.createElement('canvas'); c.width = c.height = 64; famDraw(c.getContext('2d'), w, 'idle', 0, 64, j, fo); return c.toDataURL('image/png'); }); }catch(e){ FAM.chip[ck] = []; } }
  return FAM.chip[ck][k] ? '<img class="famp" alt="" src="' + FAM.chip[ck][k] + '">' : T.pics[k];
}
function famName(k){ const w = FAM.who[k]; return w ? w.name : ''; }
// a move = N frames drawn once (cached per person × act × size kind), replayed by one shared animation loop
function famStrip(k, act, pop){
  const id = k + '|' + act + '|' + (pop ? 'p' : 's'); if(FAM.strips[id]) return FAM.strips[id];
  const w = FAM.who[k]; if(!w || !famActOk(act)) return null;
  const N = 6, S = FAM.R, P = pop ? 1.55 : 1, Z = Math.round(S * P), c = document.createElement('canvas'); c.width = Z * N; c.height = Z; const q = c.getContext('2d');
  for(let i = 0; i < N; i++){ q.save(); q.translate(i * Z, 0); famDraw(q, w, act, i / N, S, k, FAM.fo, pop ? P : 0); q.restore(); }
  return (FAM.strips[id] = {c, N, Z, P});
}
function famBake(){   // draw the common moves while the player looks at the board (idle time), so the first match never waits
  if(!G || !THEMES[G.theme].fam || !famOn()) return; const g = G, jobs = [];
  FAM.who.forEach((w, k) => { ['small', 'big', 'oops', 'amazed'].forEach(p => FAM_POOLS[p].slice(0, 2).forEach(a => jobs.push([k, a, p === 'big']))); jobs.push([k, Acting.sig(w.av), true]); });
  const step = d => { if(G !== g) return; const t0 = performance.now(); while(jobs.length && performance.now() - t0 < 12){ const j = jobs.shift(); famStrip(j[0], j[1], j[2]); } if(jobs.length) (window.requestIdleCallback || (f => setTimeout(f, 40)))(step); };
  (window.requestIdleCallback || (f => setTimeout(f, 300)))(step);
}
// play a move over cell i (the tile's kind k): pop = bigger frame on top of the neighbours; plays `loops` times then fades
function famPlay(i, k, pool, o){
  o = o || {}; if(!G || !famOn() || !THEMES[G.theme].fam || k == null || k < 0 || !FAM.who[k]) return false;
  if(FAM.live.length >= (o.max || 24)) return false;
  const acts = typeof pool === 'string' && FAM_POOLS[pool] ? FAM_POOLS[pool].filter(famActOk) : [].concat(pool).filter(famActOk); if(!acts.length) return false;
  const st = famStrip(k, acts[Math.floor(Math.random() * acts.length)], !!o.pop); if(!st) return false;
  const [x, y] = xy(i), D = CS * st.P, el = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
  el.className = 'famfx' + (o.pop ? ' pop' : ''); el.width = Math.round(D * dpr); el.height = Math.round(D * dpr);
  el.style.cssText = 'left:' + (x + CS / 2 - D / 2) + 'px;top:' + (y + CS / 2 - D * (o.pop ? 0.62 : 0.5)) + 'px;width:' + D + 'px;height:' + D + 'px;animation-delay:' + (o.delay || 0) + 'ms;--fd:' + ((o.ms || 700) + (o.delay || 0)) + 'ms';
  $('board').appendChild(el);
  const live = {el, st, t0: performance.now() + (o.delay || 0), ms: o.ms || 700, loops: o.loops || 2, cell: i}; FAM.live.push(live); famLoop();
  return true;
}
function famLoop(){
  if(FAM.raf) return;
  const tick = now => { FAM.raf = 0;
    FAM.live = FAM.live.filter(L => { const age = now - L.t0; if(age > L.ms || !L.el.isConnected){ L.el.remove(); return false; } if(age < 0) return true;
      const f = Math.min(L.st.N - 1, Math.floor((age / L.ms * L.loops % 1) * L.st.N)); if(f !== L.f){ L.f = f; const q = L.el.getContext('2d'); q.clearRect(0, 0, L.el.width, L.el.height); q.drawImage(L.st.c, f * L.st.Z, 0, L.st.Z, L.st.Z, 0, 0, L.el.width, L.el.height); } return true; });
    if(FAM.live.length) FAM.raf = requestAnimationFrame(tick); };
  FAM.raf = requestAnimationFrame(tick);
}
function famClear(){ FAM.live.forEach(L => L.el.remove()); FAM.live = []; clearInterval(FAM.idleT); FAM.idleT = 0; }
// 🎉 a match group popped: the bigger the group, the bigger the move (sp = what the match makes)
function famMatch(gr, sp, k){
  if(!G || !THEMES[G.theme].fam) return; const cells = [...gr.cells], mid = cells[(cells.length / 2) | 0];
  if(sp === 'rainbow') famPlay(mid, k, [Acting.sig(FAM.who[k] && FAM.who[k].av)], {pop: true, ms: 1100, loops: 2});
  else if(sp === 'bomb') famPlay(mid, k, 'bomb', {pop: true, ms: 900});
  else if(sp === 'x' || sp === 'power' || cells.length >= 4) famPlay(mid, k, 'big', {pop: true, ms: 850});
  else famPlay(mid, k, 'small', {ms: 600});
}
function famOops(a, b){ if(!G || !THEMES[G.theme].fam) return; [a, b].forEach(i => { const t = G.g[i]; if(t) famPlay(i, t.k, 'oops', {ms: 650}); }); }
// 🔗 combo chains: the crowd of faces reacts (×2 a few · ×3 more · ×4 a wave by column · ×5+ the whole board)
function famCombo(n){
  if(!G || !THEMES[G.theme].fam || !famOn()) return; const g = G.g, N = G.n, cells = []; g.forEach((t, i) => { if(t && t.k >= 0) cells.push(i); });
  const calm = famCalm(), pick = m => shuffle(cells.slice()).slice(0, m);
  if(calm || n === 2) pick(calm ? 3 : 5).forEach((i, j) => famPlay(i, g[i].k, 'amazed', {ms: 600, delay: j * 40}));
  else if(n === 3) pick(10).forEach((i, j) => famPlay(i, g[i].k, 'amazed', {ms: 650, delay: j * 30}));
  else if(n === 4) pick(18).sort((a, b) => a % N - b % N).forEach(i => famPlay(i, g[i].k, 'wave', {ms: 600, delay: (i % N) * 70}));
  else pick(24).forEach((i, j) => famPlay(i, g[i].k, 'party', {ms: 1000, delay: (j % 6) * 50, loops: 3}));
}
function famWin(){ if(!G || !THEMES[G.theme].fam || !famOn()) return; const g = G.g, cells = []; g.forEach((t, i) => { if(t && t.k >= 0) cells.push(i); }); shuffle(cells).slice(0, famCalm() ? 4 : 14).forEach((i, j) => famPlay(i, g[i].k, 'win', {ms: 1000, delay: j * 60, pop: j < 2})); }
// 💤 now and then one face does a little thing (only while nobody is moving)
function famIdle(){ clearInterval(FAM.idleT); if(!G || !THEMES[G.theme].fam || !famOn() || famCalm()) return;
  FAM.idleT = setInterval(() => { if(!G || G.over || G.busy || G.paused || $('scr-play').classList.contains('hidden') || FAM.live.length) return; const cells = []; G.g.forEach((t, i) => { if(t && t.k >= 0 && !t.sp) cells.push(i); }); if(!cells.length) return; const i = cells[Math.floor(Math.random() * cells.length)]; famPlay(i, G.g[i].k, 'idle', {ms: 900}); }, 4200); }
function famStart(){ if(!G || !THEMES[G.theme].fam) return; famClear(); try{ famPrep(G.K, true, true); }catch(e){} famIdle(); famBake(); }
// 👁️ who is in the game (setup page, Family pictures only): tap a face to hide it on this device
function renderFamWho(){
  const box = $('fam-who'); if(!box) return; const T = THEMES[theme];
  if(!T || !T.fam){ box.innerHTML = ''; box.classList.add('hidden'); return; }
  const hide = famHidden(), names = (S.players || []).map(p => p.Name).filter(Boolean);
  box.classList.remove('hidden');
  box.innerHTML = '<span class="fw-lab">👁️ Faces in the game · tap to hide</span>' + names.map(n => '<button class="chip fw' + (hide.indexOf(n) < 0 ? ' on' : ' off') + '" data-sound="pop" data-fam-name="' + UI.esc(n) + '">' + (hide.indexOf(n) < 0 ? '🙂 ' : '🙈 ') + UI.esc(n) + '</button>').join('');
  box.querySelectorAll('[data-fam-name]').forEach(b => b.onclick = () => { const n = b.dataset.famName, h = famHidden(), at = h.indexOf(n); if(at < 0) h.push(n); else h.splice(at, 1); famSetHidden(h); FAM.key = ''; FAM.chip = {}; renderMenu(); });
}
const THEME_KEYS = Object.keys(THEMES);
/* 🧩 24n BOARD SHAPES (✨ polish chat, Aowu 2026-11-16 18:30 "i like the shown yes … without a sweet to swap it should shuffle … each map has
   its own hardness too"): the board can be a shape — holes = no picture, pictures fall past the holes inside their column, no swap left →
   🔀 the board mixes (reshuffle, as before). Each shape has its own ⭐ hardness, measured (valid swaps vs the full square, 300 random boards ×
   n 7 / 8 / 9): ★ ≥ 50 % · ★★ 33–50 % · ★★★ < 33 % → points ×1.25 / ×1.5 / ×2 (Classic ×1); collect goals follow the shape's cells.
   The edge breaks into pixels (pixel fall-off, drawn on #shape-cv under the slots). Off: window.SS_SHAPES = false (Classic only). */
const SHAPES = [
  {k: 'square', icon: '⬛', name: 'Classic', hard: 0},
  {k: 'house', icon: '🏠', name: 'House', hard: 1}, {k: 'heart', icon: '💗', name: 'Heart', hard: 1}, {k: 'plus', icon: '➕', name: 'Cross', hard: 1},
  {k: 'diamond', icon: '💎', name: 'Diamond', hard: 2}, {k: 'donut', icon: '🍩', name: 'Donut', hard: 2}, {k: 'cloud', icon: '☁️', name: 'Cloud', hard: 2},
  {k: 'arrow', icon: '⬆️', name: 'Arrow', hard: 3}, {k: 'x', icon: '✖️', name: 'X', hard: 3}];
const SHAPE_MULT = [1, 1.25, 1.5, 2];
function shapeOf(k){ return SHAPES.find(s => s.k === k) || SHAPES[0]; }
function shapeStars(h){ return h ? '⭐'.repeat(h) : ''; }
function shapeMask(name, n){ const c = (n - 1) / 2, M = new Array(n * n);
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){ const dx = x - c, dy = y - c, ax = Math.abs(dx), ay = Math.abs(dy), r = Math.hypot(dx, dy); let on = true;
    switch(name){
      case 'cloud': case 'island': { const a = Math.atan2(dy, dx); on = r < c * (0.86 + 0.14 * Math.sin(a * 3 + 1) + 0.06 * Math.sin(a * 7)) + 0.35; break; }
      case 'plus': on = ax <= c * 0.45 + 0.1 || ay <= c * 0.45 + 0.1; break;
      case 'diamond': on = ax + ay <= c * 1.25 + 0.1; break;
      case 'donut': on = r <= c + 0.5 && r >= c * 0.36; break;
      case 'heart': { const X = dx / (c + 0.6) * 1.25, Y = -dy / (c + 0.6) * 1.25 + 0.3; on = Math.pow(X * X + Y * Y - 1, 3) - X * X * Y * Y * Y <= 0; break; }
      case 'hourglass': on = ax <= ay + 1 || ay >= c * 0.8; break;
      case 'arrow': on = dy <= c * 0.05 ? ax <= dy + c + 0.01 : ax <= c * 0.45 + 0.1; break;
      case 'x': on = Math.abs(ax - ay) <= 1.01 || r < 1.6; break;
      case 'house': on = dy >= -c * 0.1 || ax <= dy + c + 0.01; break;
      default: on = true; }
    M[y * n + x] = on; }
  return M; }
let HOLE = null;   // per game: HOLE[i] = true → no picture there (null = Classic)
function isHole(i){ return !!(HOLE && HOLE[i]); }
let shapeKey = 'square';
function setShape(k){ shapeKey = shapeOf(k).k; try{ localStorage.setItem(setupKey('shape'), shapeKey); }catch(e){} renderShapes(); markPicks(); }
function renderShapes(){ const box = $('shape-list'); if(!box) return; const on = window.SS_SHAPES !== false;
  box.closest('.shape-wrap') && (box.closest('.shape-wrap').style.display = on ? '' : 'none');
  box.innerHTML = SHAPES.map(s => '<button class="chip shape-chip' + (s.k === shapeKey ? ' on' : '') + '" data-sound="pop" data-shape="' + s.k + '" title="' + s.name + (s.hard ? ' · ×' + SHAPE_MULT[s.hard] + ' points' : '') + '"><span class="ic">' + s.icon + '</span>' + s.name + '<small class="hd">' + (s.hard ? shapeStars(s.hard) + ' ×' + SHAPE_MULT[s.hard] : 'full board') + '</small></button>').join('');
  box.querySelectorAll('[data-shape]').forEach(b => b.onclick = () => setShape(b.dataset.shape)); }
// pixel fall-off: the shape's cells in the board colour + little blocks crumbling off its edge (seeded → the same picture each time)
function paintShape(){
  const bd = $('board'), cv = $('shape-cv'); if(!G || !bd) return; bd.classList.toggle('shaped', !!HOLE); if(!cv) return;
  if(!HOLE){ cv.style.display = 'none'; return; }
  const n = G.n, size = bd.offsetWidth, dpr = Math.min(2, window.devicePixelRatio || 1); cv.style.display = ''; cv.width = Math.round(size * dpr); cv.height = Math.round(size * dpr);
  cv.style.width = cv.style.height = size + 'px'; const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, size, size);
  const col = THEMES[G.theme].board, st = CS + GAP, inside = (x, y) => x >= 0 && y >= 0 && x < n && y < n && !HOLE[y * n + x];
  let s = 1234567; const rnd2 = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.fillStyle = col;
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){ if(!inside(x, y)) continue; g.fillRect(x * st, y * st, st + GAP, st + GAP); }
  const k = Math.max(3, Math.round(st / 6));
  for(let y = -1; y <= n; y++) for(let x = -1; x <= n; x++){ if(inside(x, y)) continue; let near = 0; for(let j = -1; j <= 1; j++) for(let i = -1; i <= 1; i++) if(inside(x + i, y + j)) near++;
    if(!near) continue; const x0 = x * st + GAP / 2, y0 = y * st + GAP / 2;
    for(let q = 0; q < 36; q++){ const px = x0 + (q % 6) * st / 6, py = y0 + Math.floor(q / 6) * st / 6;
      // closer to a play cell = more blocks
      const cx = Math.min(Math.max(px, 0), size), cy = Math.min(Math.max(py, 0), size); let d = 9; for(let j = -1; j <= 1; j++) for(let i = -1; i <= 1; i++) if(inside(x + i, y + j)){ const ex = Math.max((x + i) * st + GAP / 2 - px, 0, px - ((x + i + 1) * st + GAP / 2)), ey = Math.max((y + j) * st + GAP / 2 - py, 0, py - ((y + j + 1) * st + GAP / 2)); d = Math.min(d, Math.hypot(ex, ey) / st); }
      if(rnd2() < Math.max(0, 0.75 - d * 1.6)){ g.globalAlpha = 0.3 + rnd2() * 0.55; g.fillRect(Math.round(px), Math.round(py), k, k); } }
  }
  g.globalAlpha = 1;
}
const COLORS = ['#FFB3C1', '#FFE08A', '#C9B8FF', '#A8E6CF', '#9AD3F2', '#FFC79A'];
const SHAPE_COLORS = ['#FF5470', '#FFB020', '#8B5CF6', '#22C55E', '#3B9CF5', '#FF7A3D'];
const AGE_START = {'4-5': 0, '6-7': 1, '8-9': 2, '10+': 3};
const PRAISE = ['Sweet', 'Delicious', 'Super swap', 'Amazing', 'Fantastic'];
const COMBOS = ['', '', 'Sweet!', 'Tasty!', 'Delicious!', 'Sugar rush!', 'Sweet storm!'];
const TIPS = [
  'Make 4 in a row for a zapper — it pops a whole row!',
  'An L or T shape makes a 💥 bomb.',
  '5 in a row makes a 🌈 rainbow — swap it with the picture you need most.',
  'Pop pictures near the bottom: the falling ones can make free matches.',
  'Swap two super pictures together for a giant blast!'
];

let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: ''};
let G = null, theme = 'sweets', timerId = 0, lockHandle = null, TILE_ID = 0;
function prefKey(){ return 'sp_sweetswap_prefs:' + S.player; }
function loadPrefs(){ try{ const p = JSON.parse(localStorage.getItem(prefKey()) || '{}'); if(THEMES[p.theme]) theme = p.theme; if(p.voice === false) voiceOn = false; }catch(e){} }
function savePrefs(){ try{ localStorage.setItem(prefKey(), JSON.stringify({theme, voice: voiceOn})); }catch(e){} }
function myAvatar(name){ return (S.avatars && S.avatars[name]) || defaultAvatar(name); }

/* ================= ENGINE ================= */
// tile = {id, k (0..K-1, -1 = rainbow), sp: '' | 'x' (✚ cross zapper) | 'bounce' (🏀) | 'bomb' | 'rainbow' | 'power' (theme power cell)}
function newTile(k, sp){ return {id: ++TILE_ID, k, sp: sp || ''}; }
function iceLayout(n, kind){
  const ice = new Array(n * n).fill(0), at = (r, c, v) => { if(r >= 0 && c >= 0 && r < n && c < n) ice[r * n + c] = Math.max(ice[r * n + c], v); };
  const m = Math.floor(n / 2);
  if(kind === 'center'){ for(let r = m - 2; r < m + 2; r++) for(let c = m - 2; c < m + 2; c++) at(r, c, 1); }
  else if(kind === 'cross'){ for(let k = 1; k < n - 1; k++){ at(m - 1, k, 1); at(k, m - 1, 1); at(m, k, 1); at(k, m, 1); } }
  else if(kind === 'double'){ for(let r = m - 2; r <= m + 2; r++) for(let c = m - 2; c <= m + 2; c++) at(r, c, Math.abs(r - m) === 2 || Math.abs(c - m) === 2 ? 1 : 2); }
  else if(kind === 'hard'){ for(let r = 1; r < n - 1; r++) for(let c = 1; c < n - 1; c++){ const ring = Math.min(r, c, n - 1 - r, n - 1 - c); if(ring === 1 || ring >= 3) at(r, c, ring >= 3 ? 2 : 1); } }
  return ice;
}
function kindAt(g, i){ const t = g[i]; return t && t.k >= 0 ? t.k : -9; }
// every straight run of 3+ of the same picture
function findRuns(g, n){
  const runs = [];
  for(let r = 0; r < n; r++){ let s = 0; for(let c = 1; c <= n; c++){ const same = c < n && kindAt(g, r * n + c) === kindAt(g, r * n + s) && kindAt(g, r * n + s) >= 0; if(!same){ if(c - s >= 3 && kindAt(g, r * n + s) >= 0){ const cells = []; for(let x = s; x < c; x++) cells.push(r * n + x); runs.push({dir: 'h', cells}); } s = c; } } }
  for(let c = 0; c < n; c++){ let s = 0; for(let r = 1; r <= n; r++){ const same = r < n && kindAt(g, r * n + c) === kindAt(g, s * n + c) && kindAt(g, s * n + c) >= 0; if(!same){ if(r - s >= 3 && kindAt(g, s * n + c) >= 0){ const cells = []; for(let y = s; y < r; y++) cells.push(y * n + c); runs.push({dir: 'v', cells}); } s = r; } } }
  return runs;
}
// every 2 × 2 square of the same picture (makes a 🏀 bouncer)
function findSquares(g, n){
  const out = [];
  for(let r = 0; r < n - 1; r++) for(let c = 0; c < n - 1; c++){ const i = r * n + c, k = kindAt(g, i); if(k >= 0 && kindAt(g, i + 1) === k && kindAt(g, i + n) === k && kindAt(g, i + n + 1) === k) out.push({dir: 'sq', cells: [i, i + 1, i + n, i + n + 1]}); }
  return out;
}
function squareAt(g, n, i){
  const k = kindAt(g, i); if(k < 0) return false; const r = (i / n) | 0, c = i % n;
  for(let dr = -1; dr <= 0; dr++) for(let dc = -1; dc <= 0; dc++){ const r0 = r + dr, c0 = c + dc; if(r0 < 0 || c0 < 0 || r0 >= n - 1 || c0 >= n - 1) continue; const j = r0 * n + c0;
    if(kindAt(g, j) === k && kindAt(g, j + 1) === k && kindAt(g, j + n) === k && kindAt(g, j + n + 1) === k) return true; }
  return false;
}
function matchAt(g, n, i){ return runAt(g, n, i) || squareAt(g, n, i); }
function anyMatch(g, n){ return findRuns(g, n).length > 0 || findSquares(g, n).length > 0; }
// does the picture at i sit in a run of 3? (fast check for move finding)
function runAt(g, n, i){
  const k = kindAt(g, i); if(k < 0) return false; const r = (i / n) | 0, c = i % n;
  let a = 1; for(let x = c - 1; x >= 0 && kindAt(g, r * n + x) === k; x--) a++; for(let x = c + 1; x < n && kindAt(g, r * n + x) === k; x++) a++; if(a >= 3) return true;
  a = 1; for(let y = r - 1; y >= 0 && kindAt(g, y * n + c) === k; y--) a++; for(let y = r + 1; y < n && kindAt(g, y * n + c) === k; y++) a++; return a >= 3;
}
function isSpecial(t){ return t && t.sp; }
function validSwap(g, n, a, b){
  const A = g[a], B = g[b]; if(!A || !B) return false;
  if(A.sp === 'rainbow' || B.sp === 'rainbow' || (isSpecial(A) && isSpecial(B))) return true;
  g[a] = B; g[b] = A; const ok = matchAt(g, n, a) || matchAt(g, n, b); g[a] = A; g[b] = B; return ok;
}
function allMoves(g, n){ const out = []; for(let i = 0; i < n * n; i++){ const c = i % n; if(c < n - 1 && validSwap(g, n, i, i + 1)) out.push([i, i + 1]); if(i + n < n * n && validSwap(g, n, i, i + n)) out.push([i, i + n]); } return out; }
function fillFresh(n, K){
  for(let guard = 0; guard < (HOLE ? 400 : 200); guard++){   // 🧩 24n: small shapes need more tries
    const g = new Array(n * n);
    for(let i = 0; i < n * n; i++){ const r = (i / n) | 0, c = i % n; let k, tries = 0;
      do { k = rnd(K); tries++; } while(tries < 30 && ((c >= 2 && kindAt(g, i - 1) === k && kindAt(g, i - 2) === k) || (r >= 2 && kindAt(g, i - n) === k && kindAt(g, i - 2 * n) === k) || (r >= 1 && c >= 1 && kindAt(g, i - 1) === k && kindAt(g, i - n) === k && kindAt(g, i - n - 1) === k)));
      g[i] = isHole(i) ? null : newTile(k); }   // 🧩 24n: holes stay empty
    if(!anyMatch(g, n) && allMoves(g, n).length >= (HOLE ? (guard < 150 ? 2 : 1) : 3)) return g;
  }
  return null;
}
// cells a super picture pops (rainbow hit by a blast pops every picture of one kind). Bouncer + power cell also leave
// t.fx = {kind, order[, hops, up]} so showEffect can draw them in order.
const POWER_MIN = 5, POWER_MAX = 15;
function inB(n, r, c){ return r >= 0 && c >= 0 && r < n && c < n; }
function plus(n, i){ const r = (i / n) | 0, c = i % n, out = [i]; [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => { if(inB(n, r + dr, c + dc)) out.push((r + dr) * n + c + dc); }); return out; }
// where a bouncer lands: blockers first, then pictures a goal still needs, then anywhere (never twice on the same spot)
function bounceTargets(g, n, from, hops){
  const all = []; for(let j = 0; j < n * n; j++) if(j !== from && !isHole(j)) all.push(j);
  const ice = (typeof G !== 'undefined' && G && G.ice) || [], need = new Set(((typeof G !== 'undefined' && G && G.goals) || []).filter(x => x.t === 'collect' && x.got < x.need).map(x => x.k));
  const score = j => (ice[j] ? 10 + ice[j] * 2 : 0) + (g[j] && need.has(g[j].k) ? 4 : 0) + Math.random() * 3;
  const out = [], used = new Set([from]);
  for(let h = 0; h < hops; h++){ let best = -1, bs = -1; all.forEach(j => { if(used.has(j)) return; const sc = score(j) - (out.length && Math.abs(((j / n) | 0) - ((out[out.length - 1] / n) | 0)) + Math.abs(j % n - out[out.length - 1] % n) < 2 ? 5 : 0); if(sc > bs){ bs = sc; best = j; } }); if(best < 0) break; out.push(best); plus(n, best).forEach(x => used.add(x)); }
  return out;
}
// theme power cell: a signature pattern that hits `count` cells (5–15)
function powerCells(g, n, i, fx, count){
  const r0 = (i / n) | 0, c0 = i % n, order = [], seen = new Set([i]);
  const add = j => { if(order.length < count && !seen.has(j)){ seen.add(j); order.push(j); } };
  const nb = j => { const r = (j / n) | 0, c = j % n, o = []; [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => { if(inB(n, r + dr, c + dc)) o.push((r + dr) * n + c + dc); }); return o; };
  if(fx === 'star'){ const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]; for(let d = 1; d < n && order.length < count; d++) shuffle(dirs.slice()).forEach(([dr, dc]) => { if(inB(n, r0 + dr * d, c0 + dc * d)) add((r0 + dr * d) * n + c0 + dc * d); }); }
  else if(fx === 'lasso'){ const q = [i]; while(q.length && order.length < count){ const j = q.shift(); shuffle(nb(j)).forEach(x => { if(!seen.has(x)){ add(x); q.push(x); } }); } }
  else if(fx === 'virus'){ const front = [i]; while(front.length && order.length < count){ const j = front[rnd(front.length)], free = nb(j).filter(x => !seen.has(x)); if(!free.length){ front.splice(front.indexOf(j), 1); continue; } const x = pick(free); add(x); front.push(x); } }
  else if(fx === 'chain'){ let at = i; for(let guard = 0; guard < 200 && order.length < count; guard++){ const r = (at / n) | 0, c = at % n, opts = []; for(let dr = -3; dr <= 3; dr++) for(let dc = -3; dc <= 3; dc++){ const j = (r + dr) * n + c + dc; if(inB(n, r + dr, c + dc) && !seen.has(j) && Math.abs(dr) + Math.abs(dc) >= 2) opts.push(j); } if(!opts.length) break; at = pick(opts); add(at); } }
  else if(fx === 'emp'){ for(let d = 1; d < n && order.length < count; d++){ const ring = []; for(let r = r0 - d; r <= r0 + d; r++) for(let c = c0 - d; c <= c0 + d; c++) if(inB(n, r, c) && Math.max(Math.abs(r - r0), Math.abs(c - c0)) === d) ring.push(r * n + c); shuffle(ring).forEach(add); } }
  else { const all = []; for(let j = 0; j < n * n; j++) if(j !== i && !isHole(j)) all.push(j); shuffle(all).forEach(add); }
  return order;
}
function effectCells(g, n, i, t, force){
  const r = (i / n) | 0, c = i % n, out = [];
  if(t.sp === 'x'){ for(let x = 0; x < n; x++) out.push(r * n + x); for(let y = 0; y < n; y++) if(y !== r) out.push(y * n + c); }
  else if(t.sp === 'h') for(let x = 0; x < n; x++) out.push(r * n + x);
  else if(t.sp === 'v') for(let y = 0; y < n; y++) out.push(y * n + c);
  else if(t.sp === 'bomb') for(let y = r - 1; y <= r + 1; y++) for(let x = c - 1; x <= c + 1; x++){ if(inB(n, y, x)) out.push(y * n + x); }
  else if(t.sp === 'rainbow'){ const ks = g.filter(x => x && x.k >= 0).map(x => x.k); if(ks.length){ const k = pick(ks); g.forEach((x, j) => { if(x && x.k === k) out.push(j); }); } t.fx = {kind: 'rainbow', order: out.slice()}; }
  else if(t.sp === 'bounce'){ const hops = bounceTargets(g, n, i, force || 4); out.push(i); hops.forEach(h => plus(n, h).forEach(j => { if(out.indexOf(j) < 0) out.push(j); })); t.fx = {kind: 'bounce', hops}; }
  else if(t.sp === 'power'){
    const th = (typeof G !== 'undefined' && G && THEMES[G.theme]) || THEMES.sweets, fx = th.power.fx, count = force || (POWER_MIN + rnd(POWER_MAX - POWER_MIN + 1));
    const order = powerCells(g, n, i, fx, fx === 'dna' ? Math.max(POWER_MIN, count - 3) : count); out.push(i, ...order); const up = [];
    if(fx === 'dna'){ const free = []; g.forEach((x, j) => { if(x && x.k >= 0 && !x.sp && out.indexOf(j) < 0) free.push(j); }); shuffle(free).slice(0, 2 + rnd(2)).forEach(j => { g[j].sp = rnd(2) ? 'x' : 'bomb'; up.push(j); }); }
    t.fx = {kind: fx, order, up};
  }
  return out;
}

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'play'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER);   // 🧭 p1b window.scrollTo(0, 0);
}
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
function renderPlayers(){
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div class="empty">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c);
    b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age ? p.Age + ' yrs' : '') + '</div>');
    try { drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1}); } catch(e){}
    b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  loadPrefs(); $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); } /* 📣 cs-4a */ renderMenu(); showScreen('menu'); openCover();   /* 🧱 b3w2: the 🎬 cover first */
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function picHtml(k, T){ T = T || THEMES[theme]; if(k < 0) return '🌈'; if(T.fam) return famPic(k, T); return T.shapes ? '<b style="color:' + SHAPE_COLORS[k] + '">' + T.pics[k] + '</b>' : T.pics[k]; }
function renderMenu(){
  $('theme-list').innerHTML = THEME_KEYS.map(k => '<button class="chip' + (k === theme ? ' on' : '') + '" data-sound="pop" data-theme-key="' + k + '"><span class="ic">' + [0, 1, 2].map(i => picHtml(i, THEMES[k])).join('') + '</span>' + THEMES[k].name + (THEMES[k].hard ? '<small class="hd">' + '★'.repeat(THEMES[k].hard) + ' ×' + THEME_MULT[THEMES[k].hard] + '</small>' : '') + '</button>').join(''); renderFamWho();   /* 🧑‍🤝‍🧑 24r */
  $('theme-list').querySelectorAll('[data-theme-key]').forEach(b => b.onclick = () => { theme = b.dataset.themeKey; savePrefs(); $('theme-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); renderLevels(); markPicks(); renderFamWho(); });   /* 🧱 b3w2 · 🧑‍🤝‍🧑 24r */
  { let k = ''; try{ k = localStorage.getItem(setupKey('shape')) || ''; }catch(e){} shapeKey = shapeOf(k).k; } renderShapes();   // 🧩 24n
  renderLevels();
}
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No score yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span><span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
function goalText(gl, T){ return gl.t === 'collect' ? picHtml(gl.k, T) + '×' + gl.need : gl.t === 'ice' ? T.cage.ic + ' ' + T.cage.name : '✨×' + gl.need; }
function renderLevels(){
  const box = $('level-list'); box.innerHTML = '';   /* 🧱 b3w2: 🏆 leaders live on the cover */
  const p = progressOf(S.player), rec = AGE_START[S.age], T = THEMES[theme];
  LEVELS.forEach((L, i) => {
    const open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.dataset.i = i;   /* 🧱 b3w2 */
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (L.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div><div class="eq">' + (L.stage2 ? '① ' : '') + L.goals.map(g => goalText(g, T)).join(' ') + (L.stage2 ? ' ▸ ② ' + L.stage2.goals.map(g => goalText(g, T)).join(' ') : '') + '</div>' +
      '<div class="learn">' + L.n + ' × ' + L.n + ' · ' + L.K + ' kinds · 👆 ' + L.moves + ' moves' + (L.stage2 && L.stage2.bonus ? ' (+' + L.stage2.bonus + ' at stage 2)' : '') + '</div>' +
      '<div class="lives">' + (L.hint === 'auto' ? '💡 hints' : L.hint ? '💡 ×' + L.hint : 'no hints') + (L.hardcore ? ' · ×3' : '') + '</div>' +
      '<div class="sub">' + (L.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : L.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Pass Hard to unlock Extreme!' : 'Pass the level before to unlock it'); return; } chooseLevel(i); };   /* 🧱 b3w2: pick on the same page */
    box.appendChild(b);
  });
  { let i = -1; try{ i = Number(localStorage.getItem(setupKey('lv'))); }catch(e){} if(!(i >= 0 && canPlay(i))) i = canPlay(rec) ? rec : Math.max(0, [0, 1, 2, 3, 4, 5].filter(canPlay).pop() || 0);
    chosenLevel = i; } markPicks();   /* 🧱 b3w2 */
}
/* 🧱 b3w2 (Game Baseline): ONE setup page — 🎨 pictures → 🎚️ level → ⚙️ options → ▶ Start; the level is remembered per player */
let chosenLevel = 0;
const setupKey = k => 'sp_sweetswap_' + k + ':' + (S.player || '');
function chooseLevel(i, quiet){
  chosenLevel = i; try{ localStorage.setItem(setupKey('lv'), String(i)); }catch(e){}
  markPicks(); if(!quiet){ const w = $('opt-head'); if(w && w.scrollIntoView) w.scrollIntoView({behavior: 'smooth', block: 'center'}); }
}
function markPicks(){
  document.querySelectorAll('#level-list .lvl').forEach(b => { const on = Number(b.dataset.i) === chosenLevel; b.classList.toggle('sel', on); if(window.GF && GF.pick) GF.pick(b, on); });
  const L = LEVELS[chosenLevel], T = THEMES[theme], st = $('btn-start');
  const SH = shapeOf(shapeKey); if(st && L) st.textContent = '▶ Start · ' + L.emoji + ' ' + L.name + (T ? ' · ' + T.name + (T.hard ? ' ' + '★'.repeat(T.hard) : '') : '') + (SH.hard && window.SS_SHAPES !== false ? ' · ' + SH.icon + ' ' + SH.name : '');
}
function startSetup(){ if(!canPlay(chosenLevel)){ UISound.play('error'); UI.toast('Pick a level that is open 🔓'); return; } startGame(chosenLevel); }
// 🎬 the cover (GameFrame): who's here + champions + how to play; ▶ Play opens the setup page
let SweetCover = null;
const SWEET_VERSION = '2.0';   /* 🧱 b3w2: shown on the cover footer — bump with each Sweet Swap round */
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(SweetCover && SweetCover.who !== S.player){ SweetCover.destroy(); SweetCover = null; }
  if(!SweetCover){ SweetCover = GF.cover(document.body, {game: GAME_ID, title: 'Sweet Swap', icon: '🍬', version: SWEET_VERSION, me: S.player, players: S.players, avatarOf: myAvatar, seats: {min: 1, max: 1},
      acts: ['beat.jump', 'beat.cheer'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms',
      onPlay: () => { SweetCover.hide(); showScreen('menu'); } }); SweetCover.who = S.player; }
  SweetCover.show();
}

/* ================= GAME ================= */
let CS = 50, GAP = 4;
function startGame(lvl){ setTimeout(cheerMount, 0); /* 📣 cs-4a */
  hideResult(); if(SweetCover) SweetCover.hide();   /* 🧱 b3w2 */ clearInterval(timerId); clearTimeout(hintTimer);
  const L = LEVELS[lvl], T = THEMES[theme], n = L.n, SH = window.SS_SHAPES === false ? SHAPES[0] : shapeOf(shapeKey);   // 🧩 24n
  HOLE = SH.k === 'square' ? null : shapeMask(SH.k, n).map(on => !on); const frac = HOLE ? HOLE.filter(h => !h).length / (n * n) : 1;
  const ice = (L.ice ? iceLayout(n, L.ice) : new Array(n * n).fill(0)).map((v, i) => isHole(i) ? 0 : v);
  G = {lvl, L, theme, n, K: L.K, g: fillFresh(n, L.K), ice, moves: L.moves, movesGiven: L.moves, score: 0, matches: 0, specials: 0, powers: 0, bestCombo: 0, hintsLeft: typeof L.hint === 'number' ? L.hint : 0,
    stage: 1, stages: L.stage2 ? 2 : 1, shape: SH, frac, goals: makeGoals(L.goals, ice, frac),
    sel: -1, cursor: -1, busy: false, over: false, els: {}, t0: performance.now(), paused: false, pausedAt: 0, pausedTotal: 0};
  famClear(); if(T.fam) famStart();   // 🧑‍🤝‍🧑 24r: the family's faces for this game (a new mix, fresh avatars)
  const sp = $('scr-play'); sp.className = T.cage.cls || ''; sp.style.setProperty('--ck', '"' + T.cage.ic + '"'); sp.style.setProperty('--pw', '"' + T.power.ic + '"'); sp.style.setProperty('--t1', T.t[0]); sp.style.setProperty('--t2', T.t[1]); sp.style.setProperty('--board', T.board); sp.style.setProperty('--slot', T.slot); sp.classList.toggle('dark', !!T.dark);
  BAR.level(L.emoji + ' ' + L.name + (HOLE ? ' · ' + SH.icon : ''), L.hardcore ? 'hc' : '');
  $('hint-btn').classList.toggle('hidden', !L.hint); $('hint-btn').textContent = '💡'; paintVoice();
  showScreen('play'); buildBoard(); layout(); hud(); renderGoals(); requestAnimationFrame(() => { if(G) layout(); });
  timerId = setInterval(hud, 1000);
  showBanner((G.stages > 1 ? 'Stage 1 of 2 · ' : '') + (L.hardcore ? '💀 Hardcore — no hints!' : '🎯 ' + G.goals.map(goalPlain).join(' · ')), L.hardcore ? 'bad' : 'gold');
  say('Swap two pictures to make a row of three!');
  armHint();
}
function goalPlain(gl){ return gl.t === 'collect' ? 'collect ' + gl.need : gl.t === 'ice' ? 'break the ' + THEMES[G.theme].cage.name : 'make ' + gl.need + ' super pictures'; }
function makeGoals(list, ice, frac){ return list.map(gl => Object.assign({got: 0}, gl, gl.t === 'ice' ? {need: ice.reduce((a, b) => a + b, 0)} : gl.t === 'collect' && frac < 1 ? {need: Math.max(6, Math.round(gl.need * Math.max(0.6, frac)))} : {})); }   // 🧩 24n: collect goals follow the shape's cells
// Extreme + Hardcore: stage 1 goals done → a short break, new blockers drop on the board, new goals (+ bonus moves on Extreme)
async function nextStage(){
  const g = G, S2 = g.L.stage2, add = iceLayout(g.n, S2.ice);
  g.stage = 2; addScore(500 * (g.lvl + 1), null);
  party('🎉 Stage 1 done!'); say('Stage 2!'); UISound.play('unlock'); confetti([THEMES[g.theme].power.ic, '⭐', '🎉'], 18); splashAll();
  await sleep(1100); if(G !== g) return;
  for(let i = 0; i < g.n * g.n; i++) g.ice[i] = isHole(i) ? 0 : Math.max(g.ice[i], add[i]);
  g.goals = makeGoals(S2.goals, g.ice, g.frac);
  for(let i = 0; i < g.n * g.n; i++) paintIce(i, true);
  if(S2.bonus){ g.moves += S2.bonus; g.movesGiven += S2.bonus; }
  hud(); renderGoals(); UISound.play('drop');
  showBanner('Stage 2 of 2 · ' + (S2.bonus ? '+' + S2.bonus + ' moves · ' : '') + g.goals.map(goalPlain).join(' · '), 'gold');
  await sleep(400);
}
function buildBoard(){
  const bd = $('board'); bd.innerHTML = '<canvas id="shape-cv"></canvas>'; G.els = {};   // 🧩 24n
  for(let i = 0; i < G.n * G.n; i++){ const s = document.createElement('div'); s.className = 'slot' + (isHole(i) ? ' hole' : ''); s.id = 'slot-' + i; bd.appendChild(s); const c = document.createElement('div'); c.className = 'icecap'; c.id = 'ice-' + i; bd.appendChild(c); }
  G.g.forEach((t, i) => { if(t) bd.appendChild(tileEl(t)); });
}
function tileEl(t){
  const T = THEMES[G.theme], el = document.createElement('div');
  el.className = 'tile' + (t.sp ? ' ' + t.sp : ''); el.dataset.id = t.id;
  el.innerHTML = '<div class="in' + (T.fam ? ' fam' : '') + '" style="--tc:' + (t.k >= 0 ? (T.shapes ? '#FFFFFF' : COLORS[t.k]) : '#fff') + '"><span>' + picHtml(t.k, T) + '</span></div>';
  G.els[t.id] = el; return el;
}
function xy(i){ const n = G.n; return [GAP + (i % n) * (CS + GAP), GAP + ((i / n) | 0) * (CS + GAP)]; }
function place(el, i, rowsAbove){ const [x, y] = xy(i); el.style.width = el.style.height = CS + 'px'; el.style.transform = 'translate(' + x + 'px,' + (y - (rowsAbove || 0) * (CS + GAP)) + 'px)'; }
function layout(){
  if(!G) return;
  const ar = $('arena'), cs = getComputedStyle(ar), W = ar.clientWidth - 20, H = ar.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0) - 4, n = G.n;
  GAP = Math.max(2, Math.round(Math.min(W, H) / n * 0.06));
  CS = Math.max(28, Math.floor((Math.min(W, H, 720) - GAP * (n + 1)) / n));
  const size = n * CS + (n + 1) * GAP, bd = $('board'); bd.style.width = bd.style.height = size + 'px';
  $('scr-play').style.setProperty('--cs', CS + 'px');
  for(let i = 0; i < n * n; i++){ const s = $('slot-' + i), c = $('ice-' + i), [x, y] = xy(i), pos = 'left:' + x + 'px;top:' + y + 'px;width:' + CS + 'px;height:' + CS + 'px'; s.style.cssText = pos; c.style.cssText = pos; paintIce(i, true); }
  G.g.forEach((t, i) => { if(t && G.els[t.id]) { G.els[t.id].classList.remove('fall'); place(G.els[t.id], i); } });
  paintShape();   // 🧩 24n
}
window.addEventListener('resize', () => { if(G) layout(); });
if(window.ResizeObserver){ let lastWH = ''; new ResizeObserver(() => { const r = $('scr-play').getBoundingClientRect(), wh = Math.round(r.width) + 'x' + Math.round(r.height); if(wh === lastWH) return; lastWH = wh; if(G && !$('scr-play').classList.contains('hidden')) layout(); }).observe($('scr-play')); }   /* 📱 ls-1: iPhone sideways first open — follow the play screen, only when its size really changed */
function paintIce(i, quiet){ const c = $('ice-' + i); if(!c) return; const v = G.ice[i];
  if(!quiet && !v){ c.className = 'icecap i1 crack'; setTimeout(() => { if(G && !G.ice[i]){ c.className = 'icecap'; c.style.display = 'none'; } }, 320); return; } c.className = 'icecap' + (v === 2 ? ' i2' : v === 1 ? ' i1' : ''); c.style.display = v ? '' : 'none'; if(!quiet && v) { c.classList.add('crack'); setTimeout(() => { if(G && G.ice[i] === v) c.className = 'icecap' + (v === 2 ? ' i2' : ' i1'); }, 120); } }
function hud(){
  if(!G) return;
  BAR.score(G.score.toLocaleString());
  BAR.count('moves', '👆', G.moves, 'Moves left', G.moves <= 5 && !G.over);
  $('hint-btn').disabled = typeof G.L.hint === 'number' && G.hintsLeft <= 0; if(typeof G.L.hint === 'number') $('hint-btn').textContent = '💡 ' + G.hintsLeft;
  if(lockHandle){ const l = lockHandle.remainingMs(); BAR.left(l, l < 120000); }
}
function renderGoals(bumpIdx){
  const T = THEMES[G.theme];
  $('goals').innerHTML = (G.stages > 1 ? '<span class="stagebar' + (G.stage === 2 ? ' s2' : '') + '">Stage ' + G.stage + '/2</span>' : '') + G.goals.map((gl, k) => { const left = Math.max(0, gl.need - gl.got);
    return '<span class="goal' + (left === 0 ? ' done' : '') + (k === bumpIdx ? ' bump' : '') + '" data-g="' + k + '"><span class="ic">' + (gl.t === 'collect' ? picHtml(gl.k, T) : gl.t === 'ice' ? T.cage.ic : '✨') + '</span>' + (left === 0 ? '' : left) + '</span>'; }).join('');
}
function goalsDone(){ return G.goals.every(gl => gl.got >= gl.need); }

/* ---------- input: tap-tap, slide, keyboard ---------- */
let drag = null;
function cellFromEl(el){ const t = el && el.closest('.tile'); if(!t) return -1; const id = Number(t.dataset.id); return G.g.findIndex(x => x && x.id === id); }
$('board').addEventListener('pointerdown', e => { if(!G || G.busy || G.over) return; const i = cellFromEl(e.target); if(i < 0) return; e.preventDefault(); drag = {i, x: e.clientX, y: e.clientY, moved: false}; try{ $('board').setPointerCapture(e.pointerId); }catch(err){} });
$('board').addEventListener('pointermove', e => { if(!drag || !G || G.busy) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if(Math.max(Math.abs(dx), Math.abs(dy)) < CS * 0.38) return;
  const n = G.n, i = drag.i, r = (i / n) | 0, c = i % n; let j = -1;
  if(Math.abs(dx) > Math.abs(dy)){ if(dx > 0 && c < n - 1) j = i + 1; if(dx < 0 && c > 0) j = i - 1; } else { if(dy > 0 && r < n - 1) j = i + n; if(dy < 0 && r > 0) j = i - n; }
  drag.moved = true; const from = i; drag = null; if(j >= 0) trySwap(from, j); });
$('board').addEventListener('pointerup', e => { if(!drag || !G) return; const i = drag.i; drag = null; tapCell(i); });
$('board').addEventListener('pointercancel', () => { drag = null; });
function tapCell(i){
  if(G.busy || G.over) return;
  const n = G.n, s = G.sel;
  if(s >= 0 && s !== i && (Math.abs(s - i) === n || (Math.abs(s - i) === 1 && ((s / n) | 0) === ((i / n) | 0)))){ setSel(-1); trySwap(s, i); return; }
  setSel(s === i ? -1 : i); UISound.play('pop');
}
function setSel(i){ if(G.sel >= 0){ const t = G.g[G.sel]; if(t && G.els[t.id]) G.els[t.id].classList.remove('sel'); } G.sel = i; if(i >= 0){ const t = G.g[i]; if(t && G.els[t.id]) G.els[t.id].classList.add('sel'); } }
document.addEventListener('keydown', e => {
  if(!G || $('scr-play').classList.contains('hidden') || !$('result').classList.contains('hidden') || G.busy || G.over) return;
  const n = G.n, k = e.key, dir = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -n, ArrowDown: n}[k];
  if(k === 'h' || k === 'H'){ useHint(); return; }
  if(G.cursor < 0){ G.cursor = G.sel >= 0 ? G.sel : Math.floor(n * n / 2); if(isHole(G.cursor)) G.cursor = G.g.findIndex(Boolean); }
  if(dir !== undefined){ e.preventDefault(); const c = G.cursor, j = c + dir;
    if(j < 0 || j >= n * n || (Math.abs(dir) === 1 && ((j / n) | 0) !== ((c / n) | 0)) || isHole(j)) return;
    if(G.sel === c){ setSel(-1); trySwap(c, j); G.cursor = j; } else G.cursor = j; showCursor(); return; }
  if(k === ' ' || k === 'Enter'){ e.preventDefault(); setSel(G.sel === G.cursor ? -1 : G.cursor); showCursor(); }
});
function showCursor(){ document.querySelectorAll('.slot.cur').forEach(s => { s.classList.remove('cur'); s.style.boxShadow = ''; }); const s = $('slot-' + G.cursor); if(s){ s.classList.add('cur'); s.style.boxShadow = '0 0 0 3px #FFE066'; } }

/* ---------- hints ---------- */
let hintTimer = 0;
function clearHint(){ clearTimeout(hintTimer); document.querySelectorAll('.tile.hint').forEach(t => t.classList.remove('hint')); }
function armHint(){ clearHint(); if(!G || G.over || G.L.hint !== 'auto') return; hintTimer = setTimeout(() => showHint(), 6000); }
function showHint(){ if(!G || G.busy || G.over) return; const ms = allMoves(G.g, G.n); if(!ms.length) return; const m = bestHintMove(ms); m.forEach(i => { const t = G.g[i]; if(t && G.els[t.id]) G.els[t.id].classList.add('hint'); }); }
function bestHintMove(ms){ return ms.find(([a, b]) => isSpecial(G.g[a]) || isSpecial(G.g[b])) || pick(ms); }
function useHint(){ if(!G || G.busy || G.over || !G.L.hint) return; if(typeof G.L.hint === 'number'){ if(G.hintsLeft <= 0) return; G.hintsLeft--; hud(); } clearHint(); showHint(); UISound.play('pop'); }

/* ---------- swap → pop → fall → repeat ---------- */
async function trySwap(a, b){
  if(!G || G.busy || G.over) return;
  const g = G.g, A = g[a], B = g[b]; if(!A || !B) return;
  G.busy = true; clearHint(); setSel(-1);
  g[a] = B; g[b] = A; moveEl(B, a); moveEl(A, b); UISound.play('tap'); await sleep(190);
  if(!G) return;
  const combo = A.sp === 'rainbow' || B.sp === 'rainbow' || (isSpecial(A) && isSpecial(B));
  if(!combo && !matchAt(g, G.n, a) && !matchAt(g, G.n, b)){
    g[a] = A; g[b] = B; moveEl(A, a); moveEl(B, b); UISound.play('error'); famOops(a, b); await sleep(200); G.busy = false; armHint(); return;
  }
  G.moves--; hud();
  if(combo) await superSwap(a, b, A, B);
  await cascade(a, b);
  if(!G) return;
  if(goalsDone() && G.stage < G.stages){ await nextStage(); if(!G) return; }
  G.busy = false;
  if(goalsDone()) return winGame();
  if(G.moves === 3) cheerSay('close'); /* 📣 cs-4a */
  if(G.moves <= 0) return finishGame('moves');
  if(!allMoves(G.g, G.n).length) await reshuffle();
  armHint();
}
function moveEl(t, i){ const el = G.els[t.id]; if(el){ el.classList.remove('fall'); place(el, i); } }
// two super pictures (or a rainbow) swapped together
async function superSwap(a, b, A, B){
  const g = G.g, n = G.n, cells = new Set(), r = (b / n) | 0, c = b % n;
  const add = list => list.forEach(i => cells.add(i));
  let w = 0; const fx = (i, t) => { w = Math.max(w, showEffect(i, t)); };
  const rows = (r0, r1) => { for(let y = Math.max(0, r0); y <= Math.min(n - 1, r1); y++) for(let x = 0; x < n; x++) cells.add(y * n + x); };
  const cols = (c0, c1) => { for(let x = Math.max(0, c0); x <= Math.min(n - 1, c1); x++) for(let y = 0; y < n; y++) cells.add(y * n + x); };
  const R = A.sp === 'rainbow' ? A : B.sp === 'rainbow' ? B : null, O = R === A ? B : A, has = k => A.sp === k || B.sp === k, other = k => A.sp === k ? B : A;
  let big = 1;
  if(R && O.sp === 'rainbow'){ for(let i = 0; i < n * n; i++) cells.add(i); combo('🌈🌈 Rainbow storm!'); big = 2; }
  else if(R){ const k = O.k; cells.add(R === A ? b : a);
    g.forEach((t, i) => { if(t && t.k === k){ if(O.sp && O.sp !== 'rainbow'){ t.sp = O.sp === 'x' || O.sp === 'bounce' || O.sp === 'power' ? O.sp : 'bomb'; refreshEl(t); } cells.add(i); } });
    fx(R === A ? a : b, {sp: 'rainbow', fx: {kind: 'rainbow', order: [...cells]}}); combo('🌈 Rainbow!'); big = 2; }
  else if(has('power')){ const T = THEMES[G.theme];
    [[a, A], [b, B]].forEach(([i, X]) => { const t = X.sp === 'power' ? {sp: 'power', k: 0} : X; add(effectCells(g, n, i, t, X.sp === 'power' ? POWER_MAX : 0)); fx(i, t); });
    combo(T.power.ic + ' ' + T.power.name + ' surge!'); G.powers++; big = 2; }
  else if(A.sp === 'x' && B.sp === 'x'){ rows(r - 1, r + 1); cols(c - 1, c + 1); combo('⚡ Super cross!'); fx(b, {sp: 'x'}); }
  else if(A.sp === 'bomb' && B.sp === 'bomb'){ for(let y = r - 2; y <= r + 2; y++) for(let x = c - 2; x <= c + 2; x++) if(y >= 0 && x >= 0 && y < n && x < n) cells.add(y * n + x); combo('💥💥 Mega bomb 5×5!'); ringAt(b, 5.6); big = 2; }
  else if(A.sp === 'bounce' && B.sp === 'bounce'){ const t = {sp: 'bounce'}; add(effectCells(g, n, b, t, 8)); fx(b, t); combo('🏀🏀 Super bounce ×8!'); }
  else if(has('bounce')){ const O2 = other('bounce'), t = {sp: 'bounce'}, hops = (add(effectCells(g, n, b, t, 4)), t.fx.hops); fx(b, t);
    hops.forEach(h => add(effectCells(g, n, h, {sp: O2.sp === 'bomb' ? 'bomb' : 'x'}))); combo('🏀 Bounce blast!'); big = 2; }
  else { rows(r - 1, r + 1); cols(c - 1, c + 1); combo('🚀 Super zap!'); fx(b, {sp: 'x'}); }
  shakeBoard(big);
  g.forEach(t => { if(t && t.sp) refreshEl(t); });
  if(w) await sleep(w);
  if(!G) return;
  await popCells(cells, [], {fired: new Set([a, b])});
  await gravity();
}
// one round of matches; returns true if something popped
async function matchRound(focus){
  const g = G.g, n = G.n, runs = findRuns(g, n).concat(findSquares(g, n)); if(!runs.length) return false;
  // join runs that share a cell (L / T shapes)
  const groups = [];
  runs.forEach(rn => { const hit = groups.filter(gr => rn.cells.some(c => gr.cells.has(c))); const merged = {cells: new Set(rn.cells), runs: [rn]};
    hit.forEach(h => { h.cells.forEach(c => merged.cells.add(c)); merged.runs.push(...h.runs); groups.splice(groups.indexOf(h), 1); }); groups.push(merged); });
  const cells = new Set(), creates = [];
  groups.forEach(gr => {
    const lines = gr.runs.filter(r => r.dir !== 'sq'), maxLen = Math.max(0, ...lines.map(r => r.cells.length)), hasH = lines.some(r => r.dir === 'h'), hasV = lines.some(r => r.dir === 'v'), hasSq = gr.runs.some(r => r.dir === 'sq');
    const k = g[[...gr.cells][0]].k;
    // 5 in a line 🌈 · 6+ pictures ✨ power cell · L / T 💥 bomb · 4 in a line ✚ cross · 2 × 2 🏀 bouncer · 3 in a line nothing
    let sp = maxLen >= 5 ? 'rainbow' : gr.cells.size >= 6 ? 'power' : hasH && hasV ? 'bomb' : maxLen === 4 ? 'x' : hasSq ? 'bounce' : '';
    let pivot = -1;
    if(sp){ pivot = (focus || []).find(f => gr.cells.has(f)); if(pivot === undefined || pivot < 0){ const counts = {}; gr.runs.forEach(r => r.cells.forEach(c => { counts[c] = (counts[c] || 0) + 1; })); const shared = Object.keys(counts).find(c => counts[c] > 1);
        if(sp !== 'rainbow' && shared !== undefined) pivot = Number(shared); else { const long = gr.runs.reduce((a, b) => b.cells.length > a.cells.length ? b : a); pivot = long.cells[(long.cells.length / 2) | 0]; } } }
    gr.cells.forEach(c => cells.add(c));
    if(sp) creates.push({i: pivot, k: sp === 'rainbow' ? -1 : k, sp});
    famMatch(gr, sp, k);   // 🧑‍🤝‍🧑 24r
    if(sp === 'power'){ G.powers++; const T = THEMES[G.theme]; combo(T.power.ic + ' ' + T.power.name + '!'); say(T.power.name); }
    G.matches++;
    const base = maxLen >= 5 ? 200 : sp === 'power' ? 250 : maxLen === 4 ? 120 : gr.cells.size > 4 ? 150 : hasSq ? 80 : 60;
    addScore(base, [...gr.cells][(gr.cells.size / 2) | 0]);
  });
  await popCells(cells, creates, {});
  await gravity();
  return true;
}
function addScore(pts, at){ const mult = 1 + 0.5 * Math.max(0, (G.chain || 1) - 1), v = Math.round(pts * mult * (G.L.hardcore ? 3 : 1) * SHAPE_MULT[(G.shape && G.shape.hard) || 0] * THEME_MULT[THEMES[G.theme].hard || 0]); G.score += v; hud(); if(at != null) floatAt(at, '+' + v); }
// pop a set of cells: super pictures inside fire too; ice cracks; goals count; new super pictures appear
async function popCells(cells, creates, opt){
  const g = G.g, n = G.n, fired = opt.fired || new Set(), queue = [...cells], skip = new Set(creates.map(c => c.i));
  let wait = 0, big = 0;
  while(queue.length){ const i = queue.shift(); const t = g[i]; if(!t || !t.sp || fired.has(i) || skip.has(i)) continue; fired.add(i);
    const more = effectCells(g, n, i, t); wait = Math.max(wait, showEffect(i, t)); big = Math.max(big, t.sp === 'x' || t.sp === 'bounce' ? 1 : 2);
    if(t.fx && t.fx.up) t.fx.up.forEach(j => { if(g[j]){ refreshEl(g[j]); G.specials++; } });
    more.forEach(j => { if(!cells.has(j)){ cells.add(j); queue.push(j); } }); }
  if(big) shakeBoard(big);
  if(wait) await sleep(wait);
  if(!G) return;
  let collected = {}, iceHit = 0, popped = 0;
  cells.forEach(i => {
    if(G.ice[i] > 0){ G.ice[i]--; iceHit++; paintIce(i); cageBits(i); }
    const t = g[i]; if(!t) return;
    if(skip.has(i)) return;
    if(t.k >= 0) collected[t.k] = (collected[t.k] || 0) + 1;
    const el = G.els[t.id]; if(el){ el.classList.add('pop'); setTimeout(() => el.remove(), 230); delete G.els[t.id]; }
    if(popped < 28) splashAt(i, t.k);
    g[i] = null; popped++;
  });
  creates.forEach(c => { const old = g[c.i]; if(old && old.k >= 0) collected[old.k] = (collected[old.k] || 0) + 1; if(old && G.els[old.id]){ G.els[old.id].remove(); delete G.els[old.id]; }
    const t = newTile(c.k, c.sp); g[c.i] = t; const el = tileEl(t); el.classList.add('born'); $('board').appendChild(el); place(el, c.i); G.specials++; });
  addScore(popped * 10 + iceHit * 20, null);
  let bump = -1;
  G.goals.forEach((gl, k) => { const before = gl.got;
    if(gl.t === 'collect') gl.got = Math.min(gl.need, gl.got + (collected[gl.k] || 0)); else if(gl.t === 'ice') gl.got = Math.min(gl.need, gl.got + iceHit); else if(gl.t === 'special') gl.got = Math.min(gl.need, gl.got + creates.length);
    if(gl.got !== before) bump = k; });
  renderGoals(bump);
  cheerSay('goal', 'goal'); /* 📣 cs-4a */
  if(popped){ UISound.play(creates.length || fired.size ? 'success' : 'pop'); pling(G.chain || 1); }
  creates.forEach(c => { if(c.sp === 'power' || c.sp === 'rainbow') ringAt(c.i, 2.2); });
  await sleep(220);
}
function refreshEl(t){ const el = G.els[t.id]; if(!el) return; el.className = 'tile' + (t.sp ? ' ' + t.sp : ''); }
// new pictures that drop in try not to make a match on their own (chains still happen, just not every time — keeps levels fair)
function calmKind(g, n, i, K){
  const keep = g[i]; let k = rnd(K);
  for(let tries = 0; tries < 8; tries++){ g[i] = {k}; const bad = matchAt(g, n, i); g[i] = keep; if(!bad || Math.random() < (G && G.L.lucky || 0)) return k; k = rnd(K); }
  return k;
}
// everything falls down, new pictures drop in from the top
async function gravity(){
  const g = G.g, n = G.n, K = G.K, bd = $('board');
  for(let c = 0; c < n; c++){
    const rows = []; for(let r = n - 1; r >= 0; r--) if(!isHole(r * n + c)) rows.push(r);   // 🧩 24n: only the play cells of this column, bottom first
    const keep = rows.map(r => g[r * n + c]).filter(Boolean); rows.forEach(r => { g[r * n + c] = null; });
    keep.forEach((t, k) => { g[rows[k] * n + c] = t; });
    const top = rows.slice(keep.length), missing = top.length ? n - top[top.length - 1] : 0;
    top.forEach(r => { const t = newTile(calmKind(g, n, r * n + c, K)); g[r * n + c] = t; const el = tileEl(t); bd.appendChild(el); el.classList.remove('fall'); place(el, r * n + c, missing + 1); });
  }
  void bd.offsetHeight;
  g.forEach((t, i) => { const el = t && G.els[t.id]; if(el){ el.classList.add('fall'); place(el, i); } });
  await sleep(270);
}
async function cascade(a, b){
  G.chain = 0;
  let focus = [b, a];
  while(G && !G.over){ G.chain++; const did = await matchRound(focus); if(!did) break; focus = null; if(G && G.chain >= 2){ chainBadge(G.chain); famCombo(G.chain); } }
  if(!G) return;
  const chain = G.chain - 1; G.bestCombo = Math.max(G.bestCombo, chain);
  if(chain >= 2){ combo(COMBOS[Math.min(chain, COMBOS.length - 1)]); if(chain >= 3) say(COMBOS[Math.min(chain, COMBOS.length - 1)].replace('!', '')); }
}
async function reshuffle(){
  showBanner('🔀 No swaps left — mixing!', 'gold'); await sleep(500);
  const g = G.g, n = G.n;
  const cells = []; for(let i = 0; i < n * n; i++) if(!isHole(i)) cells.push(i);   // 🧩 24n: holes stay holes
  for(let guard = 0; guard < 100; guard++){ const ts = shuffle(cells.map(i => g[i])); cells.forEach((i, k) => { g[i] = ts[k]; }); if(!anyMatch(g, n) && allMoves(g, n).length) break; }
  g.forEach((t, i) => { if(t) moveEl(t, i); }); await sleep(300);
}
// draws a super picture going off; returns how long (ms) to wait before the pictures pop
function cellC(i){ const [x, y] = xy(i); return [x + CS / 2, y + CS / 2]; }
function bdSize(){ return G.n * CS + (G.n + 1) * GAP; }
function fxEl(cls, css, ms){ const d = document.createElement('div'); d.className = cls; if(css) d.style.cssText = css; $('board').appendChild(d); setTimeout(() => d.remove(), ms || 700); return d; }
function ringAt(i, scale){ const [cx, cy] = cellC(i), s = CS * (scale || 3.2); fxEl('ring', 'left:' + (cx - s / 2) + 'px;top:' + (cy - s / 2) + 'px;width:' + s + 'px;height:' + s + 'px', 560); }
function flyTo(from, to, emo, delay, mode){
  const [fx, fy] = cellC(from), [tx, ty] = cellC(to), h = CS * 0.5;
  const sx = mode === 'drop' ? tx : fx, sy = mode === 'drop' ? -CS : fy;
  const d = fxEl('fly', 'left:' + (sx - h / 2) + 'px;top:' + (sy - h / 2) + 'px;opacity:0;--t:' + (mode === 'drop' ? '.3s' : '.28s'), delay + 700);
  d.textContent = emo;
  setTimeout(() => { d.style.opacity = '1'; d.style.transform = 'translate(' + (tx - sx) + 'px,' + (ty - sy) + 'px)' + (mode === 'spin' ? ' rotate(360deg)' : ''); }, delay);
  setTimeout(() => { d.style.opacity = '0'; }, delay + 330);
}
function boltBetween(a, b, delay){ const [x1, y1] = cellC(a), [x2, y2] = cellC(b), len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  setTimeout(() => { if(G) fxEl('bolt', 'left:' + x1 + 'px;top:' + (y1 - 2) + 'px;width:' + len + 'px;transform:rotate(' + ang + 'deg)', 450); }, delay); }
// 🧙 Your avatar pops up on the special's square and casts it (pose + prop per special, theme power icon for ✨). Never blocks the game.
const CAST = {
  bounce: {say: 'Boing!', d: 0.95, f: p => ({dy: -Math.sin(p * Math.PI) * 22, armR: p < 0.45 ? 3.0 : 1.2, armL: 1.6, item: p < 0.45 ? '🏀' : '', itemHand: 'R', mouth: 'open', eyes: 'happy', legL: 0.3, legR: -0.3})},
  bomb: {say: 'Boom!', d: 0.95, f: p => ({armR: p < 0.4 ? 2.8 : 0.6 + (1 - p) * 0.8, armL: 1.3, rot: p < 0.4 ? -0.12 : 0.1, item: p < 0.4 ? '💣' : '', itemHand: 'R', mouth: 'open', eyes: p > 0.4 ? 'happy' : 'open', fx: p > 0.45 ? '💥' : ''})},
  rainbow: {say: 'Rainbow!', d: 1.05, f: (p, t) => ({armR: 2.2 + Math.sin(t * 14) * 0.7, armL: 2.4, item: '🪄', itemHand: 'R', rot: Math.sin(t * 8) * 0.08, dy: -Math.abs(Math.sin(t * 8)) * 6, mouth: 'open', eyes: 'happy', fx: '🌈'})},
  h: {say: 'Zap!', d: 0.85, f: p => ({armL: 1.57, armR: 1.57, dy: -Math.sin(p * Math.PI) * 6, mouth: 'open', fx: '⚡'})},
  v: {say: 'Zap!', d: 0.85, f: p => ({armL: 0.15, armR: 3.0, dy: -Math.sin(p * Math.PI) * 10, mouth: 'open', fx: '⚡'})},
  x: {say: 'Super zap!', d: 0.95, f: p => ({armL: p < 0.5 ? 1.57 : 3.0, armR: p < 0.5 ? 1.57 : 0.15, dy: -Math.sin(p * Math.PI) * 10, mouth: 'open', eyes: 'happy', fx: '⚡'})},
  power: {d: 1.15, f: (p, t) => ({armL: 2.9, armR: 2.9, dy: -Math.abs(Math.sin(t * 7)) * 14, sx: p > 0.25 && p < 0.55 ? Math.cos((p - 0.25) * Math.PI * 6.6) : 1, mouth: 'open', eyes: 'happy'})}
};
const CASTERS = [];
function castAt(i, t){
  if(SPEED === 0 || !G || !CAST[t.sp] || typeof drawAvatar !== 'function') return;
  while(CASTERS.length >= 2){ const old = CASTERS.shift(); old.el.remove(); old.done = true; }
  const C = CAST[t.sp], T = THEMES[G.theme], [cx, cy] = cellC(i), w = Math.round(CS * 2), h = Math.round(CS * 2.5), dpr = Math.min(2, window.devicePixelRatio || 1);
  const el = document.createElement('div'); el.className = 'caster';
  el.style.cssText = 'left:' + Math.round(cx - w / 2) + 'px;top:' + Math.round(cy - h * 0.82) + 'px;width:' + w + 'px;height:' + h + 'px';
  const say = t.sp === 'power' ? T.power.ic + ' ' + T.power.name + '!' : C.say;
  el.innerHTML = '<canvas width="' + Math.round(w * dpr) + '" height="' + Math.round(h * dpr) + '"></canvas><span class="cast-say">' + UI.esc(say) + '</span><span class="cast-ring"></span>';
  $('board').appendChild(el);
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), av = fixAv(myAvatar(S.player)), k = h * dpr / 100, t0 = performance.now(), me = {el: el, done: false};
  const gest = t.sp === 'power' ? {k: 'cast', n: 'Cast', d: C.d, f: (p, tt) => Object.assign(C.f(p, tt), {item: T.power.ic, itemHand: 'mid', fx: p > 0.3 ? '✨' : ''})} : {k: 'cast', n: 'Cast', d: C.d, f: C.f};
  CASTERS.push(me);
  const life = C.d * 1000 + 260;
  const frame = now => {
    if(me.done || !G) { el.remove(); return; }
    const tt = Math.max(0, now - t0) / 1000;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    try { drawAvatar(g, {name: '', av: av, dir: (i % G.n) < G.n / 2 ? 1 : -1, walkT: 0, gest: {g: gest, t: Math.min(tt, C.d - 0.001)}}, cv.width / 2, cv.height - 6 * dpr, k, {t: tt, noShadow: true}); } catch(e){}
    if(tt * 1000 < life) requestAnimationFrame(frame); else { el.classList.add('out'); setTimeout(() => el.remove(), 260); me.done = true; const ix = CASTERS.indexOf(me); if(ix >= 0) CASTERS.splice(ix, 1); }
  };
  requestAnimationFrame(frame);
}
function showEffect(i, t){
  castAt(i, t);
  const [x, y] = xy(i), size = bdSize(), fx = t.fx || {};
  if(t.sp === 'x' || t.sp === 'h'){ fxEl('beam', 'left:0;top:' + (y + CS * 0.3) + 'px;width:' + size + 'px;height:' + CS * 0.4 + 'px', 450); }
  if(t.sp === 'x' || t.sp === 'v'){ fxEl('beam', 'top:0;left:' + (x + CS * 0.3) + 'px;height:' + size + 'px;width:' + CS * 0.4 + 'px;background:linear-gradient(180deg,transparent,#FFF8C4,#fff,#FFF8C4,transparent)', 450); }
  if(t.sp === 'x' || t.sp === 'h' || t.sp === 'v'){ zap(); return 120; }
  if(t.sp === 'bomb'){ fxEl('boom', 'left:' + (x + CS / 2 - CS * 1.6) + 'px;top:' + (y + CS / 2 - CS * 1.6) + 'px;width:' + CS * 3.2 + 'px;height:' + CS * 3.2 + 'px', 450); ringAt(i, 3.6); boomSnd(); return 140; }
  if(t.sp === 'rainbow'){ const order = (fx.order || []).slice(0, 30); order.forEach((j, k) => flyTo(i, j, ['✨', '🌟', '💫'][k % 3], k * 18, 'fly')); ringAt(i, 2.6); sweep(); return Math.min(520, 160 + order.length * 18); }
  if(t.sp === 'bounce'){ const hops = fx.hops || [], ball = fxEl('ball', '', 300 + hops.length * 190), h = CS * 0.7;
    ball.textContent = '🏀'; const put = j => { const [cx, cy] = cellC(j); ball.style.transform = 'translate(' + (cx - h / 2) + 'px,' + (cy - h / 2) + 'px)'; };
    put(i); hops.forEach((j, k) => setTimeout(() => { if(!G) return; put(j); setTimeout(() => { if(G){ ringAt(j, 1.8); boing(k); } }, 160); }, 60 + k * 190));
    return 120 + hops.length * 190; }
  if(t.sp === 'power'){
    const order = fx.order || [], T = THEMES[G.theme], step = 45, ic = T.power.ic;
    ringAt(i, 2.4); powerSnd(fx.kind);
    if(fx.kind === 'rain') order.forEach((j, k) => flyTo(j, j, pick(['🍯', '💧', '🍯']), k * step, 'drop'));
    else if(fx.kind === 'star') order.forEach((j, k) => flyTo(i, j, '✦', k * 30, 'spin'));
    else if(fx.kind === 'lasso') order.forEach((j, k) => setTimeout(() => { if(G) ringAt(j, 1.3); }, k * step));
    else if(fx.kind === 'dna'){ order.forEach((j, k) => flyTo(i, j, '🧬', k * 35, 'spin')); (fx.up || []).forEach((j, k) => setTimeout(() => { if(G) ringAt(j, 2); }, 300 + k * 90)); }
    else if(fx.kind === 'virus') order.forEach((j, k) => flyTo(j, j, '🦠', k * step, 'fly'));
    else if(fx.kind === 'chain'){ let at = i; order.forEach((j, k) => { boltBetween(at, j, k * step); at = j; }); }
    else if(fx.kind === 'emp'){ ringAt(i, 4.5); setTimeout(() => { if(G) ringAt(i, 7); }, 160); }
    order.forEach((j, k) => setTimeout(() => { if(G) splashAt(j, -2); }, k * step + 120));
    flyTo(i, i, ic, 0, 'fly');
    return Math.min(800, 220 + order.length * step);
  }
  return 0;
}
// juice drops in the picture's colour
function splashAt(i, k){
  if(!G) return; const [cx, cy] = cellC(i), T = THEMES[G.theme], col = k >= 0 ? (T.shapes ? SHAPE_COLORS[k] : COLORS[k]) : k === -2 ? '#FFE066' : '#fff';
  for(let m = 0; m < 5; m++){ const a = Math.random() * Math.PI * 2, d = CS * (0.5 + Math.random() * 0.7), sz = Math.max(5, CS * (0.12 + Math.random() * 0.1));
    fxEl('drop', 'left:' + (cx - sz / 2) + 'px;top:' + (cy - sz / 2) + 'px;--d:' + sz + 'px;--c:' + col + ';--dx:' + Math.cos(a) * d + 'px;--dy:' + (Math.sin(a) * d + CS * 0.25) + 'px', 600); }
}
function splashAll(){ if(!G) return; for(let m = 0; m < 14; m++) splashAt(rnd(G.n * G.n), rnd(G.K)); }
// bits of the theme blocker fly off when it breaks
function cageBits(i){ if(!G) return; const T = THEMES[G.theme], [cx, cy] = cellC(i);
  for(let m = 0; m < 3; m++){ const a = Math.random() * Math.PI * 2, d = CS * 0.7, h = CS * 0.3; const e = fxEl('fly', 'left:' + (cx - h / 2) + 'px;top:' + (cy - h / 2) + 'px;font-size:' + h + 'px', 600); e.textContent = T.cage.ic;
    requestAnimationFrame(() => { e.style.transform = 'translate(' + Math.cos(a) * d + 'px,' + Math.sin(a) * d + 'px) rotate(' + (rnd(2) ? 160 : -160) + 'deg) scale(.5)'; e.style.opacity = '0'; }); }
  crunch(); }
function shakeBoard(level){
  if(!level || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  const b = $('board'); b.classList.remove('shake', 'shake2'); void b.offsetWidth; b.classList.add(level >= 2 ? 'shake2' : 'shake'); setTimeout(() => b.classList.remove('shake', 'shake2'), 520);
}
function chainBadge(n){ const a = $('arena'), d = document.createElement('div'); d.className = 'chain'; d.style.setProperty('--n', Math.min(n, 8)); d.textContent = '🔗 Combo ×' + n; a.querySelectorAll('.chain').forEach(x => x.remove()); a.appendChild(d); setTimeout(() => d.remove(), 760); }
/* ---------- little synth for the effects (follows the sound switch + volume) ---------- */
let SFX = null;
function sfx(freq, dur, type, gain, slideTo, delay){
  try{ const st = UISound.get(); if(!st.enabled || SPEED === 0) return; if(UISound.tone){ UISound.tone(freq, dur, {type: type || 'sine', gain: gain || 0.2, slide: slideTo, delay: delay, attack: 0.01}); return; }   /* 🔊 24s-b: UiKit shared tone maker (follows 🔇 + volume live) */ const C = window.AudioContext || window.webkitAudioContext; if(!C) return; if(!SFX) SFX = new C(); if(SFX.state === 'suspended') SFX.resume();
    const t0 = SFX.currentTime + (delay || 0), o = SFX.createOscillator(), g = SFX.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0); if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, (gain || 0.2) * st.volume), t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g); g.connect(SFX.destination); o.start(t0); o.stop(t0 + dur + 0.02); }catch(e){}
}
const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568];
function pling(chain){ sfx(SCALE[Math.min(SCALE.length - 1, chain - 1)], 0.16, 'triangle', 0.18); }
function zap(){ sfx(1400, 0.22, 'sawtooth', 0.08, 300); }
function boomSnd(){ sfx(160, 0.35, 'square', 0.14, 50); sfx(90, 0.4, 'sine', 0.2, 40); }
function sweep(){ [0, 1, 2, 3, 4, 5].forEach(k => sfx(600 + k * 180, 0.12, 'sine', 0.12, null, k * 0.04)); }
function boing(k){ sfx(300 + k * 60, 0.18, 'sine', 0.22, 700 + k * 80); }
function crunch(){ sfx(900, 0.06, 'square', 0.05, 400); }
function powerSnd(kind){
  if(kind === 'rain') [0, 1, 2, 3].forEach(k => sfx(1200 - k * 150, 0.1, 'sine', 0.14, 600, k * 0.07));
  else if(kind === 'star') [0, 1, 2, 3, 4].forEach(k => sfx(880 + k * 220, 0.1, 'triangle', 0.12, null, k * 0.05));
  else if(kind === 'lasso') sfx(300, 0.45, 'sawtooth', 0.08, 900);
  else if(kind === 'dna') [0, 1, 2, 3, 4, 5].forEach(k => sfx(k % 2 ? 660 : 990, 0.08, 'triangle', 0.12, null, k * 0.06));
  else if(kind === 'virus') [0, 1, 2].forEach(k => sfx(200 + k * 40, 0.2, 'square', 0.06, 120, k * 0.1));
  else if(kind === 'chain') [0, 1, 2, 3].forEach(k => sfx(2000, 0.07, 'sawtooth', 0.07, 500, k * 0.06));
  else sfx(120, 0.6, 'sine', 0.22, 900);
}
function combo(text){ cheerSay('big', 'combo'); /* 📣 cs-4a */ const a = $('arena'), d = document.createElement('div'); d.className = 'combo'; d.textContent = text; a.appendChild(d); setTimeout(() => d.remove(), 950); }
function floatAt(i, text){ const [x, y] = xy(i), d = document.createElement('div'); d.className = 'float'; d.textContent = text; d.style.left = (x + CS * 0.1) + 'px'; d.style.top = y + 'px'; $('board').appendChild(d); setTimeout(() => d.remove(), 820); }

function toggleVoice(){ voiceOn = !voiceOn; savePrefs(); paintVoice(); if(!voiceOn) try{ speechSynthesis.cancel(); }catch(e){} }
function elapsed(){ return G ? performance.now() - G.t0 - G.pausedTotal - (G.paused ? performance.now() - G.pausedAt : 0) : 0; }
function pauseGame(){ if(G && !G.paused && !G.over){ G.paused = true; G.pausedAt = performance.now(); } }
function resume(){ if(G && G.paused && !G.over){ G.pausedTotal += performance.now() - G.pausedAt; G.paused = false; } }
function leavePlay(){
  if(!G || G.over){ backToMenu(); return; }
  pauseGame();
  UI.confirm({icon: '◀', title: 'Leave this game?', body: 'This game will not be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) backToMenu(); else resume(); });
}
function backToMenu(){ famClear(); if(window.Cheer) Cheer.unmount(); clearInterval(timerId); clearHint(); try{ speechSynthesis.cancel(); }catch(e){} G = null; hideResult(); renderMenu(); showScreen('menu'); }

/* ================= FINISH ================= */
// Sweet finish: every move left turns into bonus points.
async function winGame(){
  if(!G || G.over) return;
  G.over = true; clearHint(); famWin();   // 🧑‍🤝‍🧑 24r
  const g = G, left = g.moves; g.leftAtWin = left;
  if(left > 0){ showBanner('🍬 Sweet finish! ' + left + ' moves left', 'gold'); for(let k = 0; k < left && G === g; k++){ g.moves--; addScore(100 * (g.lvl + 1), null); hud(); UISound.play('tap'); await sleep(70); } }
  finishGame('goal', left);
}
function finishGame(why, left){
  if(!G) return;
  G.over = true; clearInterval(timerId); clearHint();
  const g = G, L = g.L, secs = Math.max(1, Math.round(elapsed() / 1000)), cleared = why === 'goal', T = THEMES[g.theme];
  const frac = (left || 0) / (g.movesGiven || L.moves), stars = !cleared ? 0 : frac >= 0.3 ? 3 : frac >= 0.12 ? 2 : 1;
  const stats = {matches: g.matches, specials: g.specials, bestCombo: g.bestCombo, rounds: 1, shape: g.shape ? g.shape.k : 'square'};
  if(g.stages > 1) stats.stages = g.stage - (cleared ? 0 : 1);
  if(g.score > 0) saveWin(S.player, g.lvl, {timeSec: secs, stars, score: g.score, theme: g.theme, cleared, stats});
  cheerEnd(cleared); /* 📣 cs-4a */
  if(cleared){ const pr = pick(PRAISE); party('🎉 ' + pr + ', ' + S.player + '!'); say(pr + ', ' + S.player + '!'); confetti(['🍬', '⭐', '🎉', T.shapes ? '🍭' : T.pics[0], T.shapes ? '🧁' : T.pics[1]], 40); UISound.play('success'); }
  else { UISound.play('pop'); say('Out of moves! So close!'); }
  setTimeout(() => {
    if(G !== g) return;
    const next = cleared && g.lvl < 5, todo = g.goals.filter(gl => gl.got < gl.need);
    const plain = gl => (gl.t === 'collect' ? (T.pics[gl.k] || '🍬') : gl.t === 'ice' ? T.cage.ic : '✨') + ' ' + (gl.need - gl.got);   /* 🧱 b3w2: the shared 🏁 result card */
    const tip = !cleared ? 'Still to do: ' + todo.map(plain).join(' · ') + '. ' + pick(TIPS) : stars < 3 ? '⭐⭐⭐ = finish with lots of moves left. ' + pick(TIPS) : '';
    GF.result({wrap: $('result'), card: $('result-card'), win: cleared, icon: cleared ? (stars === 3 ? '🏆' : '🍬') : '😮', title: cleared ? (stars === 3 ? 'Super sweet!' : 'Level passed!') : 'Out of moves!',
      sub: tip + (g.score > 0 ? '' : (tip ? ' ' : '') + 'Not saved — make a match to get a score.'), stars: cleared ? stars : null, score: g.score,
      stats: [['💫', g.matches + ' matches'], ['✨', g.specials + ' super']].concat(g.shape && g.shape.hard ? [[g.shape.icon, g.shape.name + ' ' + shapeStars(g.shape.hard) + ' ×' + SHAPE_MULT[g.shape.hard]]] : []).concat(T.hard ? [['🧑‍🤝‍🧑', T.name + ' ' + '★'.repeat(T.hard) + ' ×' + THEME_MULT[T.hard]]] : [], g.powers ? [[T.power.ic, g.powers + ' power']] : [], g.stages > 1 ? [['🏁', 'stage ' + g.stage + '/2']] : [], [['🔗', 'best chain ' + g.bestCombo], ['⏱', fmt(secs * 1000)]], cleared && left ? [['🍬', left + ' moves left']] : [], L.hardcore ? [['💀', '×3']] : []),
      save: g.score > 0 ? 'Saving your score…' : null, buddy: {name: S.player, av: myAvatar(S.player)}, confetti: false,
      levels: () => backToMenu(), levelsText: '🎚️ Levels', again: () => startGame(g.lvl), againText: '🔁 Play again',
      next: next ? () => { const p = progressOf(S.player); p.unlocked = Math.max(p.unlocked, g.lvl + 1); S.progress[S.player] = p; startGame(g.lvl + 1); } : null, nextText: g.lvl === 4 ? '💀 Try Hardcore ▶' : 'Next level ▶'});
    [['btn-levels', 'b-menu'], ['btn-again', 'b-again'], ['btn-next', 'b-next']].forEach(([x, y]) => { const e = $(x); if(e) e.id = y; });   // the old ids (tests, cheer)
    cheerFaces();   /* 📣 cs-4a: the crowd's faces on the card */
  }, cleared ? 1600 : 900);
}
function party(text){ const p = document.createElement('div'); p.className = 'praise'; p.textContent = text; document.body.appendChild(p); setTimeout(() => p.remove(), 1600); }
let bannerTimer = 0;
function showBanner(text, kind){ const b = $('banner'); b.textContent = text; ['gold', 'bad'].forEach(k => b.classList.toggle(k, kind === k)); b.classList.add('on'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 2200); }

/* ================= SAVE ================= */
const PENDING_KEY = 'sp_sweetswap_pending';
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))).saveLevelResult(GAME_ID, w.name, w.lvl, w.extra)); }
function putNote(html){ const put = () => { const n = $('save-note'); if(n) n.innerHTML = html; return !!n; }; if(!put()) setTimeout(put, 1900); }
function saveWin(name, lvlIdx, extra, tries){
  tries = tries || 0;
  const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []});
  if(extra.cleared) p.unlocked = Math.max(p.unlocked, lvlIdx + 1);
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res.best) best[lvlIdx] = res.best;
      S.progress[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending(); putNote(saveText(res));
    }).withFailureHandler(err => {
      if(tries < 1){ setTimeout(() => saveWin(name, lvlIdx, extra, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl: lvlIdx, extra}])); putNote('⚠️ Could not save yet — it will be sent again next time.');
    }).saveLevelResult(GAME_ID, name, lvlIdx, extra);
}
function saveText(res){
  let h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : res.best && res.best.score ? 'Your best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Score saved';
  const fe = res.feats; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { h += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); }
  return h;
}
function countUp(el, to, ms){ if(!el) return; const t0 = performance.now(); (function tick(now){ const p = Math.max(0, Math.min(1, (now - t0) / ms)); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString(); if(p < 1) requestAnimationFrame(tick); })(t0); }
/* 📣 CHEERSQUAD (cs-4a) START — the crowd beside the board (CheerSquad.html, 📣 Cheer chat). Don't remove: the Cheer chat re-applies it. */
// solo: you = side 0, the 😈 rival = side 1. Fans stand only where the bar, goals, board and controls leave room.
function cheerTaken(){ return Array.from(document.querySelectorAll('#gbar, .top-btn, #goals, .goals, #board')); }
function cheerMount(){
  if(!window.Cheer || !G) return; Cheer.unmount(); const box = $('scr-play');
  Cheer.mount(box, {game: 'sweetswap', players: [{name: S.player, side: 0, human: true}, {name: 'Rival', side: 1, human: false}], me: {name: S.player}, family: (S.players || []).map(p => p.Name), avatars: S.avatars || {}, mode: 'overlay',
    zones: () => Cheer.freeZones(box, cheerTaken), avoid: cheerTaken,
    clear: b => { const B = box.getBoundingClientRect(), F = $('board').getBoundingClientRect(), l = F.left - B.left, t = F.top - B.top; return !(b.r > l - 3 && b.l < l + F.width + 3 && b.b > t - 3 && b.t < t + F.height + 3); }});
}
// small wins get a 1.2 s breather so a cascade isn't a wall of cheers; big ones and the ends always play
function cheerSay(kind, why){ if(!kind || !window.Cheer || !Cheer.active() || !G) return; const now = performance.now();
  if(kind === 'goal' && (G.cheerAt || 0) > now - 1200) return; if(kind === 'big' && (G.cheerBig || 0) > now - 900) return;
  if(kind === 'goal') G.cheerAt = now; if(kind === 'big') G.cheerBig = now; Cheer.react(kind, {side: 0}); }
function cheerEnd(cleared){ if(window.Cheer && Cheer.active()) Cheer.react(cleared ? 'win' : 'lose', {side: 0}); }
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(!at) return; at.parentNode.insertBefore(c, at); at.parentNode.insertBefore(cap, at); }, 900); }
/* 📣 CHEERSQUAD END */
function showResult(html){ $('result-card').innerHTML = html; $('result').classList.remove('hidden'); cheerFaces(); /* 📣 cs-4a */ }
function hideResult(){ $('result').classList.add('hidden'); }
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pick(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 p1b: ◀ = where you came from (Gameroom if we don't know)
window.feedbackContext = () => ({page: 'Sweet Swap', game: GAME_ID, level: G ? G.L.name : ''});

/* ================= BOOT ================= */
function boot(){
  UI.loading(GAME_ID);
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {};
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();

